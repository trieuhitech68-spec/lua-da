-- Lửa Đá — GIA CỐ BẢO MẬT (tuỳ chọn), 19/11/2026
-- Việc: siết quy tắc TẠO tài liệu máy chủ world/main, world/s2…s8.
-- Trước: ai đã đăng nhập cũng tạo được (một lần) với nội dung tuỳ ý, miễn có "seed" là số; tạo rồi không ai sửa, xoá được.
-- Sau : nội dung chỉ được gồm đúng các trường game dùng (seed, wv, createdAt, dl), seed nằm trong khoảng hợp lệ, tài liệu nhỏ hơn 200 byte.
-- Các quy tắc khác (chỉ ghi tài liệu của chính mình, config/* chỉ quản trị viên) GIỮ NGUYÊN như trong supabase_setup.sql.
--
-- CÁCH CHẠY: dán cả tệp vào Supabase → SQL Editor → Run. Cả tệp nằm trong MỘT giao dịch: nếu có lỗi ở bất kỳ dòng nào thì không có gì thay đổi.
-- LƯU Ý: đoạn này CHƯA được chạy thử trên máy chủ thật. Nếu báo lỗi, quy tắc cũ vẫn còn nguyên; chụp lỗi gửi lại để sửa.
-- Sau khi chạy: nếu chạy lại supabase_setup.sql thì quy tắc quay về bản cũ (rộng hơn) — chạy lại tệp này lần nữa.

begin;

drop policy if exists docs_insert on public.docs;
create policy docs_insert on public.docs for insert to authenticated with check (
  (public.ld_write_ok(path)
   and (owner = (select auth.uid())
        or (path ~ '^world/(main|s[2-8])$'
            and jsonb_typeof(data->'seed') = 'number'
            and (data - 'seed' - 'wv' - 'createdAt' - 'dl') = '{}'::jsonb
            and octet_length(data::text) < 200
            and (case when jsonb_typeof(data->'seed') = 'number'
                      then (data->>'seed')::numeric between 1 and 4300000000
                      else false end))))
  or (split_part(path, '/', 1) = 'config' and (select public.ld_is_admin())));

commit;

select 'Lửa Đá: đã siết quy tắc tạo máy chủ' as ket_qua;
