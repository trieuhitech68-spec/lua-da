-- =====================================================================
-- Lửa Đá: Từ Hai Bàn Tay Trắng — cài máy chủ Supabase
-- Dán toàn bộ tệp này vào Supabase → SQL Editor → New query → Run.
-- Chạy lại nhiều lần vẫn an toàn (không xóa dữ liệu người chơi).
-- =====================================================================

-- Dự án tạo với "Automatically expose new tables" TẮT: mọi quyền được cấp rõ ràng ở đây.
-- anon (chưa đăng nhập) chỉ được gọi ld_name_free; mọi thứ khác cần đăng nhập.
grant usage on schema public to anon, authenticated;

-- ---------- 1. Hàm tiện ích ----------
-- uuid từ một đoạn đường dẫn (null nếu không phải uuid chữ thường)
create or replace function public.ld_uuid(s text) returns uuid
language sql immutable set search_path = '' as $$
  select case when s ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then s::uuid else null end
$$;

-- chủ của một tài liệu, đọc từ đường dẫn:
--   players|clans|claims|builds|chat|gifts|sites|friends|mail|market|deals|lb/<uid>[/...]  → <uid>
--   data/users/<uid>/...                                        → <uid>
--   còn lại (vd. world/main)                                    → null (không ai "sở hữu")
create or replace function public.ld_owner(p text) returns uuid
language sql immutable set search_path = '' as $$
  select case
    when split_part(p, '/', 1) in ('players','clans','claims','builds','chat','gifts','sites','friends','mail','market','deals','lb')
      then public.ld_uuid(split_part(p, '/', 2))
    when split_part(p, '/', 1) = 'data' and split_part(p, '/', 2) = 'users'
      then public.ld_uuid(split_part(p, '/', 3))
    else null end
$$;

-- làm sạch tên hiển thị: bỏ ký tự điều khiển và < > " \ / @, gộp khoảng trắng, tối đa 24 ký tự
create or replace function public.ld_clean_name(n text) returns text
language sql immutable set search_path = '' as $$
  select btrim(left(btrim(regexp_replace(
           regexp_replace(coalesce(n, ''), '[[:cntrl:]<>"\\/@]', '', 'g'),
           '\s+', ' ', 'g')), 24))
$$;

revoke all on function public.ld_uuid(text), public.ld_owner(text), public.ld_clean_name(text) from public, anon;
grant execute on function public.ld_uuid(text), public.ld_owner(text), public.ld_clean_name(text) to authenticated;

-- ---------- 2. Hồ sơ người chơi (tên hiển thị) ----------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_name_ok' and conrelid = 'public.profiles'::regclass) then
    alter table public.profiles add constraint profiles_name_ok
      check (char_length(name) between 2 and 24 and name = public.ld_clean_name(name));
  end if;
end $$;
create unique index if not exists profiles_name_lower on public.profiles (lower(name));

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (name, updated_at) on public.profiles to authenticated;

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using (true);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- tạo hồ sơ khi có người đăng ký (tên lấy từ ô "Tên trong game"; trùng thì thêm số)
create or replace function public.ld_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  base text;
  nm   text;
  i    int := 0;
begin
  base := public.ld_clean_name(coalesce(new.raw_user_meta_data->>'name',
                                        new.raw_user_meta_data->>'full_name',
                                        split_part(coalesce(new.email, ''), '@', 1)));
  if char_length(base) < 2 then base := 'Người chơi'; end if;
  nm := base;
  loop
    begin
      insert into public.profiles (id, name) values (new.id, nm) on conflict (id) do nothing;
      exit;
    exception when unique_violation or check_violation then
      i := i + 1;
      exit when i > 30;
      nm := btrim(left(base, 18)) || ' ' || (10 + floor(random() * 9990))::int;
    end;
  end loop;
  return new;
exception when others then
  return new;   -- không bao giờ chặn việc đăng ký
end $$;
revoke all on function public.ld_new_user() from public, anon, authenticated;

drop trigger if exists ld_on_auth_user_created on auth.users;
create trigger ld_on_auth_user_created after insert on auth.users
  for each row execute function public.ld_new_user();

-- người dùng đã có từ trước khi chạy tệp này: tạo hồ sơ còn thiếu
insert into public.profiles (id, name)
select u.id, 'Người chơi ' || substr(replace(u.id::text, '-', ''), 1, 6)
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict do nothing;

-- kiểm tra tên còn trống không (gọi được trước khi đăng nhập)
create or replace function public.ld_name_free(n text) returns boolean
language sql stable security definer set search_path = '' as $$
  select not exists (select 1 from public.profiles where lower(name) = lower(public.ld_clean_name(n)))
$$;
revoke all on function public.ld_name_free(text) from public;
grant execute on function public.ld_name_free(text) to anon, authenticated;

-- ---------- 3. Kho tài liệu chung của game ----------
create table if not exists public.docs (
  path       text primary key,
  owner      uuid generated always as (public.ld_owner(path)) stored,
  coll       text generated always as (regexp_replace(path, '/[^/]*$', '')) stored,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint docs_path_ok check (
    char_length(path) <= 400
    and path ~ '^[A-Za-z0-9_.:@+~-]+(/[A-Za-z0-9_.:@+~-]+)*$'
    and array_length(string_to_array(path, '/'), 1) % 2 = 0),
  constraint docs_data_obj check (jsonb_typeof(data) = 'object'),
  -- giới hạn kích thước mỗi tài liệu (game tự chia bản lưu thành nhiều phần ~200 KB)
  constraint docs_size check (octet_length(data::text) < 524288)
);
create index if not exists docs_coll_path on public.docs (coll, path);
create index if not exists docs_owner on public.docs (owner);

-- giờ cập nhật + giới hạn số tài liệu mỗi người (chống làm đầy kho)
create or replace function public.ld_docs_touch() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.updated_at := now();
  -- (cột sinh tự động chưa có giá trị trong trigger BEFORE nên tính chủ từ đường dẫn)
  if tg_op = 'INSERT' and public.ld_owner(new.path) is not null
     and not exists (select 1 from public.docs d where d.path = new.path)
     and (select count(*) from public.docs d where d.owner = public.ld_owner(new.path)) >= 300 then
    raise exception 'ld_quota: quá nhiều tài liệu cho một người' using errcode = '53400';
  end if;
  return new;
end $$;
revoke all on function public.ld_docs_touch() from public, anon, authenticated;
drop trigger if exists ld_docs_touch on public.docs;
create trigger ld_docs_touch before insert or update on public.docs
  for each row execute function public.ld_docs_touch();

alter table public.docs enable row level security;
revoke all on public.docs from anon, authenticated;
grant select, insert, update, delete on public.docs to authenticated;

-- đọc: mọi người đã đăng nhập đọc các bộ sưu tập chung; data/users/<uid>/... chỉ chủ đọc
drop policy if exists docs_read on public.docs;
create policy docs_read on public.docs for select to authenticated using (
  split_part(path, '/', 1) in ('world','players','clans','claims','builds','chat','gifts','sites','friends','market','deals','lb')
  or owner = (select auth.uid())
  -- thư: chỉ người gửi và người có tên trong "to" mới đọc được
  or (split_part(path, '/', 1) = 'mail' and coalesce(data->'to', '[]'::jsonb) ? ((select auth.uid())::text)));

-- thêm: chỉ tài liệu của chính mình; riêng world/main ai cũng tạo được (một lần, phải có seed là số)
drop policy if exists docs_insert on public.docs;
create policy docs_insert on public.docs for insert to authenticated with check (
  owner = (select auth.uid())
  or (path = 'world/main' and jsonb_typeof(data->'seed') = 'number'));

-- sửa / xóa: chỉ tài liệu của chính mình (world/main không ai sửa / xóa được)
drop policy if exists docs_update on public.docs;
create policy docs_update on public.docs for update to authenticated
  using (owner = (select auth.uid())) with check (owner = (select auth.uid()));
drop policy if exists docs_delete on public.docs;
create policy docs_delete on public.docs for delete to authenticated
  using (owner = (select auth.uid()));

-- thời gian thực: phát thay đổi của bảng docs
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables
                     where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'docs') then
    alter publication supabase_realtime add table public.docs;
  end if;
end $$;

-- ---------- 4. Khóa ngắn hạn (acquire) ----------
create table if not exists public.leases (
  path       text primary key,
  holder     text not null,
  expires_at timestamptz not null
);
alter table public.leases enable row level security;   -- không có policy: chỉ đi qua hàm dưới
revoke all on public.leases from anon, authenticated;   -- cố ý không cấp quyền bảng: chỉ dùng qua ld_acquire()

create or replace function public.ld_acquire(p_path text, p_holder text, p_ttl_ms int default 8000)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  r   public.leases%rowtype;
  ttl int := least(greatest(coalesce(p_ttl_ms, 8000), 500), 60000);
begin
  if auth.uid() is null then raise exception 'chưa đăng nhập' using errcode = '42501'; end if;
  if p_path is null or char_length(p_path) > 400 or p_holder is null or char_length(p_holder) > 128 then
    raise exception 'khóa không hợp lệ' using errcode = '22023';
  end if;
  delete from public.leases where expires_at < now() - interval '1 hour';
  insert into public.leases as l (path, holder, expires_at)
    values (p_path, p_holder, now() + make_interval(secs => ttl / 1000.0))
  on conflict (path) do update set holder = excluded.holder, expires_at = excluded.expires_at
    where l.expires_at <= now() or l.holder = excluded.holder
  returning * into r;
  if found then
    return jsonb_build_object('acquired', true, 'version', 1, 'holder', r.holder, 'expiresAt', r.expires_at);
  end if;
  select * into r from public.leases where path = p_path;
  return jsonb_build_object('acquired', false, 'holder', r.holder, 'expiresAt', r.expires_at);
end $$;
revoke all on function public.ld_acquire(text, text, int) from public, anon;
grant execute on function public.ld_acquire(text, text, int) to authenticated;

-- ---------- xong ----------
select 'Lửa Đá: cài máy chủ xong' as ket_qua;
