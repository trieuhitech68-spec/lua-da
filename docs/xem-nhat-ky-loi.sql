-- XEM NHẬT KÝ LỖI TỪ MÁY NGƯỜI CHƠI
-- Dán vào Supabase → SQL Editor rồi bấm Run. Chỉ ĐỌC, không sửa gì.
-- Mỗi dòng là một lỗi: lúc xảy ra, số lần, nội dung, dòng mã, phiên bản game, loại máy, mục tiêu đang làm, bảng đang mở.
select
  to_timestamp((e->>'at')::bigint / 1000.0) at time zone 'Asia/Ho_Chi_Minh' as luc,
  (e->>'n')::int                as so_lan,
  e->>'m'                       as loi,
  e->>'s'                       as dong_ma,
  e->>'v'                       as phien_ban,
  e->>'d'                       as may,
  e->>'g'                       as muc_tieu,
  e->>'p'                       as bang,
  left(split_part(d.path, '/', 3), 8) as nguoi_choi
from public.docs d, jsonb_array_elements(d.data->'L') e
where d.path like 'data/users/%/log/err/v1'
order by (e->>'at')::bigint desc
limit 300;
