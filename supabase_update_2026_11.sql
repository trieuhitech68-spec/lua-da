-- LỬA ĐÁ · CẬP NHẬT MÁY CHỦ THÁNG 11/2026 (bản 2: chạy được trên mọi phiên bản cơ sở dữ liệu)
-- Cách chạy: supabase.com → dự án của game → SQL Editor → New query → dán TOÀN BỘ → Run.
-- Chạy lại nhiều lần cũng không sao. Không xoá dữ liệu nào của người chơi, không thay hàm hay luật cũ nào ngoài đúng một chỗ ở mục 3.

-- 1) Giờ máy chủ: mọi máy chơi chung một đồng hồ (giờ thật Việt Nam, bốn mùa, thời tiết)
create or replace function public.ld_now() returns bigint
language sql stable set search_path = '' as $$ select (extract(epoch from clock_timestamp()) * 1000)::bigint $$;
revoke all on function public.ld_now() from public;
grant execute on function public.ld_now() to anon, authenticated;

-- 2) Liên minh tối đa 70 người: một trigger riêng, không đụng tới trigger cũ
create or replace function public.ld_clan_cap() returns trigger
language plpgsql set search_path = '' as $$
begin
  if split_part(new.path, '/', 1) = 'clans' and jsonb_typeof(new.data -> 'members') = 'array'
     and jsonb_array_length(new.data -> 'members') > 70 then
    raise exception 'ld_clan_full: liên minh tối đa 70 người' using errcode = '53400';
  end if;
  return new;
end $$;
drop trigger if exists ld_clan_cap on public.docs;
create trigger ld_clan_cap before insert or update on public.docs
  for each row execute function public.ld_clan_cap();

-- 3) Nhiều máy chủ: trong luật thêm tài liệu đang có, đổi đúng chỗ "world/main" thành "world/main hoặc world/s2…s8"
--    (đọc luật hiện tại rồi sửa tại chỗ nên không phụ thuộc phiên bản; không nhận ra luật thì bỏ qua và báo, không làm hỏng gì)
do $$
declare q text; old1 text := '(path = ''world/main''::text)'; new1 text := '(path ~ ''^world/(main|s[2-8])$''::text)';
begin
  select with_check into q from pg_policies where schemaname = 'public' and tablename = 'docs' and policyname = 'docs_insert';
  if q is null then
    raise notice 'KHONG THAY luat docs_insert: bo qua muc 3';
  elsif position('s[2-8]' in q) > 0 then
    raise notice 'Muc 3 da duoc ap dung tu truoc';
  elsif position(old1 in q) > 0 then
    execute 'alter policy docs_insert on public.docs with check (' || replace(q, old1, new1) || ')';
    raise notice 'Muc 3 xong: da cho phep world/s2..s8';
  else
    raise notice 'KHONG NHAN RA luat docs_insert, bo qua muc 3. Noi dung luat: %', q;
  end if;
end $$;

-- Kiểm tra: phải ra một dòng, cột gio_may_chu là số lớn, lien_minh_70 = true, nhieu_may_chu = true
select public.ld_now() as gio_may_chu,
  exists (select 1 from pg_trigger where tgname = 'ld_clan_cap') as lien_minh_70,
  coalesce((select position('s[2-8]' in with_check) > 0 from pg_policies
            where schemaname = 'public' and tablename = 'docs' and policyname = 'docs_insert'), false) as nhieu_may_chu;
