-- =====================================================================
-- Lửa Đá: Từ Hai Bàn Tay Trắng — cài máy chủ Supabase
-- Dán toàn bộ tệp này vào Supabase → SQL Editor → New query → Run.
-- Chạy lại nhiều lần vẫn an toàn (không xóa dữ liệu người chơi).
-- =====================================================================

-- Dự án tạo với "Automatically expose new tables" TẮT: mọi quyền được cấp rõ ràng ở đây.
-- anon (chưa đăng nhập) chỉ được gọi ld_name_free và ld_public_config; mọi thứ khác cần đăng nhập.
-- Quản trị (mục 1b, 5, 6): quyền quản trị chỉ kiểm ở máy chủ (bảng ld_admins); xem cuối tệp để đặt quản trị viên.
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

-- ---------- 1b. Quản trị: danh sách quản trị viên, khóa / cấm chat ----------
-- Quyền quản trị CHỈ nằm ở máy chủ: bảng ld_admins không cấp quyền cho ai (không đọc, không ghi từ trình duyệt);
-- muốn thêm quản trị viên thì chạy lệnh insert ở CUỐI tệp này trong SQL Editor.
create table if not exists public.ld_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.ld_admins enable row level security;    -- không có policy: không ai đọc / ghi trực tiếp
revoke all on public.ld_admins from public, anon, authenticated;

-- người đang gọi có phải quản trị viên không
create or replace function public.ld_is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (select 1 from public.ld_admins a where a.user_id = auth.uid())
$$;
revoke all on function public.ld_is_admin() from public, anon;
grant execute on function public.ld_is_admin() to authenticated;

-- khóa tài khoản (kind = 'ban': không ghi được gì) và cấm chat (kind = 'mute': không ghi được chat/<uid>)
create table if not exists public.ld_bans (
  user_id    uuid not null references auth.users(id) on delete cascade,
  kind       text not null check (kind in ('ban', 'mute')),
  until      timestamptz,                         -- null = vĩnh viễn
  reason     text not null default '',
  by_admin   uuid,
  created_at timestamptz not null default now(),
  primary key (user_id, kind)
);
alter table public.ld_bans enable row level security;      -- không có policy: chỉ đi qua các hàm bên dưới
revoke all on public.ld_bans from public, anon, authenticated;

-- người đang gọi có đang bị khóa / cấm chat không
create or replace function public.ld_restricted(p_kind text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.ld_bans b
                 where b.user_id = auth.uid() and b.kind = p_kind and (b.until is null or b.until > now()))
$$;
revoke all on function public.ld_restricted(text) from public, anon;
grant execute on function public.ld_restricted(text) to authenticated;

-- được ghi tài liệu này không: tài khoản bị khóa thì không; bị cấm chat thì không ghi chat/...
create or replace function public.ld_write_ok(p_path text) returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null
     and not public.ld_restricted('ban')
     and not (split_part(p_path, '/', 1) = 'chat' and public.ld_restricted('mute'))
$$;
revoke all on function public.ld_write_ok(text) from public, anon;
grant execute on function public.ld_write_ok(text) to authenticated;

-- nhật ký thao tác quản trị (chỉ các hàm quản trị ghi; chỉ quản trị viên đọc qua ld_admin_log_list)
create table if not exists public.ld_admin_log (
  id      bigint generated always as identity primary key,
  at      timestamptz not null default now(),
  admin   uuid,
  action  text not null,
  target  text not null default '',
  detail  jsonb not null default '{}'::jsonb
);
create index if not exists ld_admin_log_at on public.ld_admin_log (at desc);
alter table public.ld_admin_log enable row level security;
revoke all on public.ld_admin_log from public, anon, authenticated;

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
  using (id = (select auth.uid())) with check (id = (select auth.uid()) and not public.ld_restricted('ban'));

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
  -- liên minh (bộ tộc): tối đa 70 thành viên
  if split_part(new.path, '/', 1) = 'clans' and jsonb_typeof(new.data -> 'members') = 'array'
     and jsonb_array_length(new.data -> 'members') > 70 then
    raise exception 'ld_clan_full: liên minh tối đa 70 người' using errcode = '53400';
  end if;
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

-- đọc: mọi người đã đăng nhập đọc các bộ sưu tập chung (cả config/* do quản trị viên ghi); data/users/<uid>/... chỉ chủ đọc
drop policy if exists docs_read on public.docs;
create policy docs_read on public.docs for select to authenticated using (
  split_part(path, '/', 1) in ('world','players','clans','claims','builds','chat','gifts','sites','friends','market','deals','lb','config')
  or owner = (select auth.uid())
  -- thư: chỉ người gửi và người có tên trong "to" mới đọc được
  or (split_part(path, '/', 1) = 'mail' and coalesce(data->'to', '[]'::jsonb) ? ((select auth.uid())::text))
  -- thư hệ thống sysmail/<uid>: chỉ người nhận đọc (chỉ quản trị viên ghi, qua ld_admin_mail)
  or (split_part(path, '/', 1) = 'sysmail' and split_part(path, '/', 2) = ((select auth.uid())::text)));

-- thêm: chỉ tài liệu của chính mình; riêng world/main và world/s2…s8 (các máy chủ) ai cũng tạo được (một lần, phải có seed là số)
-- tài khoản bị khóa không thêm / sửa được gì; bị cấm chat thì không ghi chat/<uid> (ld_write_ok)
-- config/* chỉ quản trị viên ghi
drop policy if exists docs_insert on public.docs;
create policy docs_insert on public.docs for insert to authenticated with check (
  (public.ld_write_ok(path)
   and (owner = (select auth.uid())
        or (path ~ '^world/(main|s[2-8])$' and jsonb_typeof(data->'seed') = 'number')))
  or (split_part(path, '/', 1) = 'config' and (select public.ld_is_admin())));

-- sửa: chỉ tài liệu của chính mình (world/main không ai sửa được); config/* chỉ quản trị viên
drop policy if exists docs_update on public.docs;
create policy docs_update on public.docs for update to authenticated
  using (owner = (select auth.uid())
         or (split_part(path, '/', 1) = 'config' and (select public.ld_is_admin())))
  with check ((owner = (select auth.uid()) and public.ld_write_ok(path))
              or (split_part(path, '/', 1) = 'config' and (select public.ld_is_admin())));
-- xóa: tài liệu của chính mình; quản trị viên xóa được tài liệu của người khác (tin chat, bộ tộc, công trình phản cảm…)
-- nhưng không xóa world/… (hạt giống thế giới) và data/… (bản lưu nhân vật)
drop policy if exists docs_delete on public.docs;
create policy docs_delete on public.docs for delete to authenticated
  using (owner = (select auth.uid())
         or ((select public.ld_is_admin()) and split_part(path, '/', 1) not in ('world', 'data')));

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

-- ---------- 5. Quản trị: cấu hình game, thống kê, kiểm duyệt ----------
-- Mọi hàm ld_admin_* chạy với quyền máy chủ (security definer) nhưng việc ĐẦU TIÊN là kiểm tra người gọi có trong
-- ld_admins không; ai không phải quản trị viên gọi vào đều bị từ chối. Mỗi thao tác ghi một dòng vào ld_admin_log.
-- Tài liệu do quản trị viên ghi (người chơi chỉ đọc):
--   config/main   cấu hình game (thông báo, bảo trì, hệ số…)    config/news  thư gửi mọi người (20 thư gần nhất)
--   config/mod    danh sách đang bị khóa / cấm chat (để trò chơi ẩn chat của họ)
--   sysmail/<uid> thư hệ thống (có thể kèm quà) gửi riêng một người — chỉ người đó đọc được

-- bắt buộc là quản trị viên
create or replace function public.ld_admin_need() returns uuid
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.ld_is_admin() then
    raise exception 'chỉ quản trị viên mới làm được việc này' using errcode = '42501';
  end if;
  return auth.uid();
end $$;
revoke all on function public.ld_admin_need() from public, anon, authenticated;

create or replace function public.ld_admin_note(p_action text, p_target text, p_detail jsonb) returns void
language sql security definer set search_path = '' as $$
  insert into public.ld_admin_log (admin, action, target, detail)
  values (auth.uid(), p_action, coalesce(p_target, ''), coalesce(p_detail, '{}'::jsonb))
$$;
revoke all on function public.ld_admin_note(text, text, jsonb) from public, anon, authenticated;

create or replace function public.ld_ms(t timestamptz) returns bigint
language sql immutable set search_path = '' as $$ select (extract(epoch from t) * 1000)::bigint $$;
revoke all on function public.ld_ms(timestamptz) from public, anon;
grant execute on function public.ld_ms(timestamptz) to authenticated;

-- giờ máy chủ (mili giây) để mọi máy chơi chung một đồng hồ: ngày đêm, bốn mùa, thời tiết giống nhau (src/clock.js)
create or replace function public.ld_now() returns bigint
language sql stable set search_path = '' as $$ select (extract(epoch from clock_timestamp()) * 1000)::bigint $$;
revoke all on function public.ld_now() from public;
grant execute on function public.ld_now() to anon, authenticated;

-- chép danh sách khóa / cấm chat còn hiệu lực ra config/mod (người chơi đọc được, chỉ có mã người chơi + hạn)
create or replace function public.ld_mod_sync() returns void
language plpgsql security definer set search_path = '' as $$
declare
  d jsonb;
begin
  d := jsonb_build_object(
    'ban',  coalesce((select jsonb_object_agg(b.user_id::text, coalesce(public.ld_ms(b.until), 0)) from public.ld_bans b
                      where b.kind = 'ban'  and (b.until is null or b.until > now())), '{}'::jsonb),
    'mute', coalesce((select jsonb_object_agg(b.user_id::text, coalesce(public.ld_ms(b.until), 0)) from public.ld_bans b
                      where b.kind = 'mute' and (b.until is null or b.until > now())), '{}'::jsonb),
    'at', public.ld_ms(now()));
  insert into public.docs (path, data) values ('config/mod', d)
  on conflict (path) do update set data = excluded.data;
end $$;
revoke all on function public.ld_mod_sync() from public, anon, authenticated;

-- phần cấu hình công khai (đọc được cả trước khi đăng nhập: ghi chú đăng ký, bảo trì, phiên bản tối thiểu)
create or replace function public.ld_public_config() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce((select jsonb_build_object('regNote', d.data->'regNote', 'maint', d.data->'maint',
                                             'minBuild', d.data->'minBuild', 'banner', d.data->'banner')
                   from public.docs d where d.path = 'config/main'), '{}'::jsonb)
$$;
revoke all on function public.ld_public_config() from public;
grant execute on function public.ld_public_config() to anon, authenticated;

-- tình trạng của chính mình: quản trị viên? bị khóa? bị cấm chat?
create or replace function public.ld_my_status() returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'admin', public.ld_is_admin(),
    'ban',  (select jsonb_build_object('until', b.until, 'reason', b.reason) from public.ld_bans b
             where b.user_id = auth.uid() and b.kind = 'ban'  and (b.until is null or b.until > now())),
    'mute', (select jsonb_build_object('until', b.until, 'reason', b.reason) from public.ld_bans b
             where b.user_id = auth.uid() and b.kind = 'mute' and (b.until is null or b.until > now())))
$$;
revoke all on function public.ld_my_status() from public, anon;
grant execute on function public.ld_my_status() to authenticated;

-- thống kê tổng quan
create or replace function public.ld_admin_stats() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  tz constant text := 'Asia/Ho_Chi_Minh';
  d0 timestamptz;
  r  jsonb;
begin
  perform public.ld_admin_need();
  d0 := date_trunc('day', now() at time zone tz) at time zone tz;   -- 0 giờ hôm nay (giờ Việt Nam)
  with act as (select d.owner, max(d.updated_at) as last from public.docs d where d.owner is not null group by d.owner)
  select jsonb_build_object(
    'at', now(),
    'accounts',   (select count(*) from auth.users),
    'newToday',   (select count(*) from auth.users u where u.created_at >= d0),
    'new7d',      (select count(*) from auth.users u where u.created_at >= now() - interval '7 days'),
    'active15m',  (select count(*) from act where act.last >= now() - interval '15 minutes'),
    'active24h',  (select count(*) from act where act.last >= now() - interval '24 hours'),
    'active7d',   (select count(*) from act where act.last >= now() - interval '7 days'),
    'signin24h',  (select count(*) from auth.users u where u.last_sign_in_at >= now() - interval '24 hours'),
    'clans',      (select count(*) from public.docs d where d.coll = 'clans'),
    'banned',     (select count(*) from public.ld_bans b where b.kind = 'ban'  and (b.until is null or b.until > now())),
    'muted',      (select count(*) from public.ld_bans b where b.kind = 'mute' and (b.until is null or b.until > now())),
    'admins',     (select count(*) from public.ld_admins),
    'docs',       (select count(*) from public.docs),
    'docsBytes',  pg_total_relation_size('public.docs'::regclass),
    'dbBytes',    pg_database_size(current_database()),
    'colls', coalesce((select jsonb_agg(jsonb_build_object('c', x.c, 'n', x.n, 'bytes', x.b) order by x.b desc)
                       from (select split_part(d.path, '/', 1) as c, count(*) as n, sum(pg_column_size(d.data))::bigint as b
                             from public.docs d group by 1) x), '[]'::jsonb),
    'signups14', coalesce((select jsonb_agg(jsonb_build_object('d', x.d, 'n', x.n) order by x.d)
                           from (select to_char(u.created_at at time zone tz, 'YYYY-MM-DD') as d, count(*) as n
                                 from auth.users u where u.created_at >= d0 - interval '13 days' group by 1) x), '[]'::jsonb),
    'top', coalesce((select jsonb_agg(t.o order by t.days desc) from (
              select jsonb_build_object('id', d.owner, 'name', p.name,
                       'd', case when jsonb_typeof(d.data->'d') = 'number' then d.data->'d' else '0'::jsonb end,
                       'h', case when jsonb_typeof(d.data->'h') = 'number' then d.data->'h' else '0'::jsonb end,
                       'b', case when jsonb_typeof(d.data->'b') = 'number' then d.data->'b' else '0'::jsonb end,
                       'a', case when jsonb_typeof(d.data->'a') = 'number' then d.data->'a' else '0'::jsonb end) as o,
                     case when jsonb_typeof(d.data->'d') = 'number' then (d.data->>'d')::numeric else 0 end as days
              from public.docs d left join public.profiles p on p.id = d.owner
              where d.coll = 'lb' and d.owner is not null
              order by days desc limit 10) t), '[]'::jsonb)
  ) into r;
  return r;
end $$;
revoke all on function public.ld_admin_stats() from public, anon;
grant execute on function public.ld_admin_stats() to authenticated;

-- tìm người chơi theo tên / email / mã
create or replace function public.ld_admin_players(p_q text default '', p_limit int default 30) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  q   text := btrim(coalesce(p_q, ''));
  pat text;
  lim int := least(greatest(coalesce(p_limit, 30), 1), 100);
  r   jsonb;
begin
  perform public.ld_admin_need();
  pat := '%' || replace(replace(replace(q, '\', '\\'), '%', '\%'), '_', '\_') || '%';
  select coalesce(jsonb_agg(t.o order by t.last desc nulls last), '[]'::jsonb) into r from (
    select jsonb_build_object('id', u.id, 'name', p.name, 'email', u.email, 'created', u.created_at,
             'signin', u.last_sign_in_at, 'last', a.last,
             'ban',   exists (select 1 from public.ld_bans b where b.user_id = u.id and b.kind = 'ban'  and (b.until is null or b.until > now())),
             'mute',  exists (select 1 from public.ld_bans b where b.user_id = u.id and b.kind = 'mute' and (b.until is null or b.until > now())),
             'admin', exists (select 1 from public.ld_admins x where x.user_id = u.id)) as o,
           a.last
    from auth.users u
    left join public.profiles p on p.id = u.id
    left join lateral (select max(d.updated_at) as last from public.docs d where d.owner = u.id) a on true
    where q = '' or p.name ilike pat or u.email ilike pat or u.id::text = lower(q)
    order by a.last desc nulls last
    limit lim) t;
  return r;
end $$;
revoke all on function public.ld_admin_players(text, int) from public, anon;
grant execute on function public.ld_admin_players(text, int) to authenticated;

-- chi tiết một người chơi
create or replace function public.ld_admin_player(p_uid uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  r jsonb;
begin
  perform public.ld_admin_need();
  select jsonb_build_object('id', u.id, 'name', p.name, 'email', u.email, 'created', u.created_at, 'signin', u.last_sign_in_at,
           'admin', exists (select 1 from public.ld_admins x where x.user_id = u.id),
           'ban',  (select jsonb_build_object('until', b.until, 'reason', b.reason, 'at', b.created_at) from public.ld_bans b
                    where b.user_id = u.id and b.kind = 'ban'  and (b.until is null or b.until > now())),
           'mute', (select jsonb_build_object('until', b.until, 'reason', b.reason, 'at', b.created_at) from public.ld_bans b
                    where b.user_id = u.id and b.kind = 'mute' and (b.until is null or b.until > now())),
           'player', (select d.data from public.docs d where d.path = 'players/' || u.id::text),
           'lb',     (select d.data from public.docs d where d.path = 'lb/' || u.id::text),
           'ndocs',  (select count(*) from public.docs d where d.owner = u.id),
           'bytes',  (select coalesce(sum(pg_column_size(d.data)), 0) from public.docs d where d.owner = u.id),
           'docs', coalesce((select jsonb_agg(jsonb_build_object('path', x.path, 'bytes', x.b, 'at', x.updated_at) order by x.updated_at desc)
                             from (select d.path, pg_column_size(d.data) as b, d.updated_at from public.docs d
                                   where d.owner = u.id order by d.updated_at desc limit 60) x), '[]'::jsonb))
    into r
  from auth.users u left join public.profiles p on p.id = u.id
  where u.id = p_uid;
  if r is null then raise exception 'không có người chơi này' using errcode = '22023'; end if;
  return r;
end $$;
revoke all on function public.ld_admin_player(uuid) from public, anon;
grant execute on function public.ld_admin_player(uuid) to authenticated;

-- khóa tài khoản / cấm chat (p_hours <= 0 hoặc null = vĩnh viễn)
create or replace function public.ld_admin_ban(p_uid uuid, p_kind text, p_hours numeric default null, p_reason text default '')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  me  uuid := public.ld_admin_need();
  unt timestamptz;
begin
  if p_kind not in ('ban', 'mute') then raise exception 'loại không hợp lệ' using errcode = '22023'; end if;
  if not exists (select 1 from auth.users u where u.id = p_uid) then raise exception 'không có người chơi này' using errcode = '22023'; end if;
  if p_uid = me or exists (select 1 from public.ld_admins a where a.user_id = p_uid) then
    raise exception 'không thể khóa quản trị viên' using errcode = '22023';
  end if;
  unt := case when coalesce(p_hours, 0) <= 0 then null
              else now() + make_interval(secs => least(p_hours, 24 * 3650) * 3600) end;
  insert into public.ld_bans as b (user_id, kind, until, reason, by_admin, created_at)
  values (p_uid, p_kind, unt, left(coalesce(p_reason, ''), 300), me, now())
  on conflict (user_id, kind) do update
    set until = excluded.until, reason = excluded.reason, by_admin = excluded.by_admin, created_at = excluded.created_at;
  perform public.ld_mod_sync();
  perform public.ld_admin_note(p_kind, p_uid::text, jsonb_build_object('until', unt, 'reason', left(coalesce(p_reason, ''), 300)));
  return jsonb_build_object('ok', true, 'until', unt);
end $$;
revoke all on function public.ld_admin_ban(uuid, text, numeric, text) from public, anon;
grant execute on function public.ld_admin_ban(uuid, text, numeric, text) to authenticated;

create or replace function public.ld_admin_unban(p_uid uuid, p_kind text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  n int;
begin
  perform public.ld_admin_need();
  delete from public.ld_bans b where b.user_id = p_uid and b.kind = p_kind;
  get diagnostics n = row_count;
  perform public.ld_mod_sync();
  perform public.ld_admin_note('un' || coalesce(p_kind, ''), p_uid::text, jsonb_build_object('removed', n));
  return jsonb_build_object('ok', true, 'removed', n);
end $$;
revoke all on function public.ld_admin_unban(uuid, text) from public, anon;
grant execute on function public.ld_admin_unban(uuid, text) to authenticated;

-- đổi tên hiển thị phản cảm
create or replace function public.ld_admin_rename(p_uid uuid, p_name text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  nm  text := public.ld_clean_name(p_name);
  old text;
begin
  perform public.ld_admin_need();
  if char_length(nm) < 2 then raise exception 'tên cần 2–24 ký tự' using errcode = '22023'; end if;
  select p.name into old from public.profiles p where p.id = p_uid for update;
  if not found then raise exception 'không có người chơi này' using errcode = '22023'; end if;
  begin
    update public.profiles set name = nm, updated_at = now() where id = p_uid;
  exception when unique_violation then
    raise exception 'tên "%" đã có người dùng', nm using errcode = '23505';
  end;
  perform public.ld_admin_note('rename', p_uid::text, jsonb_build_object('old', old, 'new', nm));
  return jsonb_build_object('ok', true, 'name', nm);
end $$;
revoke all on function public.ld_admin_rename(uuid, text) from public, anon;
grant execute on function public.ld_admin_rename(uuid, text) to authenticated;

-- xóa một tài liệu (tin chat, bộ tộc, công trình…); p_tree = true xóa cả tài liệu con (vd. builds/<uid>/p/…)
-- không xóa world/… (hạt giống thế giới) và data/… (bản lưu nhân vật)
create or replace function public.ld_admin_delete_doc(p_path text, p_tree boolean default false) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  n int;
begin
  perform public.ld_admin_need();
  if p_path is null or char_length(p_path) > 400 or p_path !~ '^[A-Za-z0-9_.:@+~-]+(/[A-Za-z0-9_.:@+~-]+)*$' then
    raise exception 'đường dẫn không hợp lệ' using errcode = '22023';
  end if;
  if split_part(p_path, '/', 1) in ('world', 'data') then
    raise exception 'không xóa được % từ bảng quản trị', split_part(p_path, '/', 1) using errcode = '22023';
  end if;
  delete from public.docs d
  where d.path = p_path or (coalesce(p_tree, false) and left(d.path, char_length(p_path) + 1) = p_path || '/');
  get diagnostics n = row_count;
  perform public.ld_admin_note('delete', p_path, jsonb_build_object('n', n, 'tree', coalesce(p_tree, false)));
  return jsonb_build_object('ok', true, 'deleted', n);
end $$;
revoke all on function public.ld_admin_delete_doc(text, boolean) from public, anon;
grant execute on function public.ld_admin_delete_doc(text, boolean) to authenticated;

-- lưu cấu hình game (config/main)
create or replace function public.ld_admin_set_config(p_id text, p_data jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := public.ld_admin_need();
  d  jsonb;
begin
  if p_id is distinct from 'main' then raise exception 'chỉ sửa được config/main' using errcode = '22023'; end if;
  if jsonb_typeof(p_data) is distinct from 'object' or octet_length(p_data::text) > 65536 then
    raise exception 'cấu hình không hợp lệ' using errcode = '22023';
  end if;
  d := p_data || jsonb_build_object('at', public.ld_ms(now()), 'by', me);
  insert into public.docs (path, data) values ('config/' || p_id, d)
  on conflict (path) do update set data = excluded.data;
  perform public.ld_admin_note('config', 'config/' || p_id, p_data);
  return jsonb_build_object('ok', true, 'at', d->'at');
end $$;
revoke all on function public.ld_admin_set_config(text, jsonb) from public, anon;
grant execute on function public.ld_admin_set_config(text, jsonb) to authenticated;

-- quà kèm thư: {mãĐồ: số} tối đa 6 loại, mỗi loại 1–999
create or replace function public.ld_items_clean(p jsonb) returns jsonb
language plpgsql immutable set search_path = '' as $$
declare
  k text;
  v jsonb;
  o jsonb := '{}'::jsonb;
  n int := 0;
begin
  if p is null or jsonb_typeof(p) = 'null' then return null; end if;
  if jsonb_typeof(p) <> 'object' then raise exception 'quà không hợp lệ' using errcode = '22023'; end if;
  for k, v in select * from jsonb_each(p) loop
    if k !~ '^[A-Za-z][A-Za-z0-9_]{0,31}$' or jsonb_typeof(v) <> 'number'
       or (v::text)::numeric <> floor((v::text)::numeric) or (v::text)::numeric < 1 or (v::text)::numeric > 999 then
      raise exception 'quà không hợp lệ: %', k using errcode = '22023';
    end if;
    n := n + 1;
    if n > 6 then raise exception 'tối đa 6 loại quà' using errcode = '22023'; end if;
    o := o || jsonb_build_object(k, (v::text)::int);
  end loop;
  return case when n = 0 then null else o end;
end $$;
revoke all on function public.ld_items_clean(jsonb) from public, anon, authenticated;

-- gửi thư hệ thống: p_uid = null → mọi người (config/news); có p_uid → riêng người đó (sysmail/<uid>)
create or replace function public.ld_admin_mail(p_uid uuid, p_text text, p_items jsonb default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  t    text := left(btrim(regexp_replace(coalesce(p_text, ''), '[[:cntrl:]]+', ' ', 'g')), 500);
  it   jsonb;
  e    jsonb;
  pth  text;
  keep int;
  cur  jsonb;
  lst  jsonb;
begin
  perform public.ld_admin_need();
  it := public.ld_items_clean(p_items);
  if t = '' and it is null then raise exception 'thư trống' using errcode = '22023'; end if;
  if p_uid is null then pth := 'config/news'; keep := 20;
  else
    if not exists (select 1 from auth.users u where u.id = p_uid) then raise exception 'không có người chơi này' using errcode = '22023'; end if;
    pth := 'sysmail/' || p_uid::text; keep := 30;
  end if;
  e := jsonb_build_object('id', 'a' || to_hex(public.ld_ms(clock_timestamp())) || substr(md5(random()::text), 1, 6),
                          't', t, 'at', public.ld_ms(now()), 'it', it, 'from', 'Ban quản trị');
  select d.data into cur from public.docs d where d.path = pth for update;
  lst := case when jsonb_typeof(cur->'list') = 'array' then cur->'list' else '[]'::jsonb end || jsonb_build_array(e);
  if jsonb_array_length(lst) > keep then
    select jsonb_agg(x.v order by x.i) into lst
    from jsonb_array_elements(lst) with ordinality x(v, i) where x.i > jsonb_array_length(lst) - keep;
  end if;
  insert into public.docs (path, data) values (pth, jsonb_build_object('list', lst, 'at', public.ld_ms(now())))
  on conflict (path) do update set data = excluded.data;
  perform public.ld_admin_note(case when p_uid is null then 'news' else 'mail' end, coalesce(p_uid::text, 'mọi người'),
                               jsonb_build_object('t', t, 'it', it, 'id', e->>'id'));
  return jsonb_build_object('ok', true, 'id', e->>'id');
end $$;
revoke all on function public.ld_admin_mail(uuid, text, jsonb) from public, anon;
grant execute on function public.ld_admin_mail(uuid, text, jsonb) to authenticated;

-- gỡ một thư khỏi config/news
create or replace function public.ld_admin_news_del(p_id text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  cur jsonb;
  lst jsonb;
begin
  perform public.ld_admin_need();
  select d.data into cur from public.docs d where d.path = 'config/news' for update;
  if cur is null or jsonb_typeof(cur->'list') <> 'array' then return jsonb_build_object('ok', true, 'removed', 0); end if;
  select coalesce(jsonb_agg(x.v order by x.i), '[]'::jsonb) into lst
  from jsonb_array_elements(cur->'list') with ordinality x(v, i) where x.v->>'id' is distinct from p_id;
  update public.docs set data = jsonb_build_object('list', lst, 'at', public.ld_ms(now())) where path = 'config/news';
  perform public.ld_admin_note('news_del', coalesce(p_id, ''), '{}'::jsonb);
  return jsonb_build_object('ok', true, 'removed', jsonb_array_length(cur->'list') - jsonb_array_length(lst));
end $$;
revoke all on function public.ld_admin_news_del(text) from public, anon;
grant execute on function public.ld_admin_news_del(text) to authenticated;

-- đọc nhật ký quản trị
create or replace function public.ld_admin_log_list(p_limit int default 100) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  r jsonb;
begin
  perform public.ld_admin_need();
  select coalesce(jsonb_agg(jsonb_build_object('at', l.at, 'admin', p.name, 'action', l.action, 'target', l.target,
                                               'tname', tp.name, 'detail', l.detail) order by l.id desc), '[]'::jsonb) into r
  from (select * from public.ld_admin_log order by id desc limit least(greatest(coalesce(p_limit, 100), 1), 500)) l
  left join public.profiles p  on p.id = l.admin
  left join public.profiles tp on tp.id = public.ld_uuid(l.target);
  return r;
end $$;
revoke all on function public.ld_admin_log_list(int) from public, anon;
grant execute on function public.ld_admin_log_list(int) to authenticated;

-- tạo sẵn config/mod (rỗng) để trò chơi nghe được ngay
select public.ld_mod_sync();

-- ---------- 6. Đặt quản trị viên ----------
-- Chủ trò chơi dùng chính tài khoản game của mình làm quản trị viên.
-- BƯỚC 1: vào https://lanhdia.app, ĐĂNG KÝ (hoặc đăng nhập) bằng email dưới đây và xác nhận email.
-- BƯỚC 2: chạy lại toàn bộ tệp này (hoặc chỉ dòng insert dưới). Chưa có tài khoản thì dòng này không làm gì — đăng ký xong chạy lại là được.
-- Thêm quản trị viên khác: chép dòng dưới, thay email.  Gỡ: delete from public.ld_admins where user_id = (select id from auth.users where lower(email) = lower('...'));
insert into public.ld_admins(user_id) select id from auth.users where lower(email)=lower('trieuhitech68@gmail.com') on conflict do nothing;

-- ---------- xong ----------
select 'Lửa Đá: cài máy chủ xong' as ket_qua;
