-- LỬA ĐÁ · CẬP NHẬT MÁY CHỦ THÁNG 11/2026
-- Cách chạy: mở supabase.com → dự án của game → SQL Editor → New query → dán TOÀN BỘ tệp này → bấm Run.
-- Chạy lại nhiều lần cũng không sao. Không xoá dữ liệu nào của người chơi.

-- 1) Giờ máy chủ: mọi máy chơi chung một đồng hồ (giờ thật Việt Nam, bốn mùa, thời tiết)
create or replace function public.ld_now() returns bigint
language sql stable set search_path = '' as $$ select (extract(epoch from clock_timestamp()) * 1000)::bigint $$;
revoke all on function public.ld_now() from public;
grant execute on function public.ld_now() to anon, authenticated;

-- 2) Liên minh tối đa 70 người (kèm giới hạn số tài liệu mỗi người như cũ)
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

-- 3) Nhiều máy chủ: cho phép tạo world/s2 … world/s8 (Máy chủ 2 đến 8)
drop policy if exists docs_insert on public.docs;
create policy docs_insert on public.docs for insert to authenticated with check (
  (public.ld_write_ok(path)
   and (owner = (select auth.uid())
        or (path ~ '^world/(main|s[2-8])$' and jsonb_typeof(data->'seed') = 'number')))
  or (split_part(path, '/', 1) = 'config' and (select public.ld_is_admin())));

-- Kiểm tra: dòng dưới phải trả về một số lớn (giờ máy chủ tính bằng mili giây)
select public.ld_now() as gio_may_chu;
