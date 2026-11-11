-- LỬA ĐÁ · LÀM MỚI DỮ LIỆU (đợt 11/2026): mọi người chơi lại từ đầu
-- XOÁ: toàn bộ nhân vật đã lưu, nhà cửa, đất, liên minh, xếp hạng, chợ, thư, biên bản cướp phá và các máy chủ (thế giới).
-- GIỮ:  tài khoản đăng nhập, tên người chơi, cấu hình quản trị, danh sách khoá / cấm chat.
-- KHÔNG KHÔI PHỤC ĐƯỢC. Cách chạy: supabase.com → dự án của game → SQL Editor → New query → dán TOÀN BỘ → Run.

-- số tài liệu trước khi xoá, theo loại (để bạn xem lại)
select split_part(path, '/', 1) as loai, count(*) as so_tai_lieu from public.docs group by 1 order by 2 desc;

delete from public.docs
 where split_part(path, '/', 1) in ('world','players','clans','claims','builds','chat','gifts','sites','friends','market','deals','lb','data');

do $$ begin
  if to_regclass('public.leases') is not null then execute 'delete from public.leases'; end if;
end $$;

-- sau khi xoá: chỉ còn tài liệu cấu hình (config/…), có thể là 0 dòng
select split_part(path, '/', 1) as loai_con_lai, count(*) as so_tai_lieu from public.docs group by 1 order by 2 desc;
