# Rà soát tự động (chạy trước MỖI lần đẩy lên)

```bash
bash tools/kiem-tra/chay-het.sh
```

| Bước | Tệp | Bắt lỗi gì |
|---|---|---|
| 3 | `va-cham.js` | Đặt lần lượt **mọi** công trình dạng vật trong `BUILD` (kể cả món mới thêm) trên bãi phẳng rồi cho nhân vật đi thẳng vào từ 4 phía. Món nào bị lọt vào lòng mà không phải bậc/sàn đứng lên được, và không nằm trong danh sách cho phép, là **đi xuyên**. |
| 4 | `nha-nhay.js` | Nhà 2×2 có tường, cửa, mái: vừa chạy vừa nhảy 16 hướng từ trong ra và từ ngoài vào; không được lọt tường, không được lên mái. |
| 5 | `dai-trong.js` | Đài trống hội: lên được bằng bậc thang, sàn chặn khi đứng dưới đất, trống chặn khi đứng trên. |
| 6 | `tu-lam.js N` | Bật "Tự làm" tua nhanh N phút: không lỗi chạy, nhân vật không kiệt sức, làm được nhiều mục tiêu. |
| 7 | `giao-dien.js` | Màn điện thoại 393×852: mở 7 bảng không lỗi chạy, không tràn ngang; các khối trên màn hình chơi (thẻ thông tin, mục tiêu, bản đồ nhỏ, thẻ ghim, thanh đáy, ô đồ nhanh, nút hành động) không đè nhau. |
| 8 | `mang/*.js` | Chơi mạng với máy chủ giả (`mang/mock.js`): cướp phá có lính gác, chiến tranh liên minh, hạ cờ chiếm đất, cửa nhà người khác đóng. |
| 9 | `dap-do.js` | Đập đồ: mở từ thẻ Cường hoá, đập thành công, hỏng có cộng may mắn, +11 hỏng tụt cấp, Đá hộ mệnh giữ cấp, lên +15 và phát sáng, nâng sao thú, cho ngựa ăn. |
| 10 | `trang-bi.js` | Quét **mọi** vũ khí (sức đánh khi cầm đúng bằng chỉ số), mọi món loại cung (giương và bắn ra tên, lực theo chỉ số), mọi món mặc (dựng lại hình người không lỗi), mọi công thức (không dùng món không tồn tại). Món mới thêm tự được quét. |
| 11 | `tong-quat.js` | Rà toàn bộ nội dung: dữ liệu công thức/công trình/tài nguyên/thú/nhiệm vụ/hướng dẫn/việc nhờ/nghiên cứu/đập đồ không trỏ tới món không tồn tại; **chế tạo thật** mọi công thức, **dựng thật** mọi công trình qua từng công đoạn, ăn uống mọi món; kế hoạch Tự làm của mọi nhiệm vụ; mở mọi bảng và thẻ. Thứ mới thêm tự được quét. |
| 12 | `vo-nghe.js` | Liên hoàn cộng dồn tới ×5, đòn kết ×1,6 gây choáng, chí mạng của dao, chảy máu của giáo, phá giáp của rìu, tuyệt kỹ của từng loại vũ khí, Tam tiễn trừ đúng số tên; đòn của lính không được hưởng liên hoàn. |
| 48 | `mang/tuong-bi-thuong.js` | Hai người chơi không chiến tranh: dẫn lính đi ngang nhà hàng xóm thì lính **không** tự lao vào đánh lính đang đứng yên của họ; lính bị hạ (nghỉ thương 10 phút) hoặc tạm đổi việc thì **tướng không bị xoá**. |
| 49 | `mang/muoi-nguoi.js [người ≤20] [giây]` (chọn người bằng `SUB=0,1,…`; `DBOUT`/`DBIN` nối nhiều đợt trên cùng thế giới) | **20 người chơi chung một thế giới, 2 đợt 10 trình duyệt**; thêm giai đoạn Kinh tế (chế tạo thật, xây theo công đoạn, nâng cấp, nghiên cứu, bản đồ phóng sâu), liên minh thứ ba, bị đuổi khỏi liên minh, luyện quân, hai cuộc chiến cùng lúc. Trước đây: (máy chủ giả, dữ liệu chuyền qua lại thật): vào game → Tự làm đầu game → lãnh thổ, làng, dân → liên minh (lập, xin, nhận, từ chối, rời, góp cấp) → quân đội (chiêu mộ, tướng, đội hình) → xâm chiếm (tuyên chiến, cướp phá, công phá điểm giàu, hạ cờ, giảng hoà) → lưu và mở lại. Báo cáo từng bước ra `$TMPDIR/ld-muoi-nguoi.json`. |
| 50 | `ban-do.js` (`DL=1`: đại lục) | Bản đồ tỉnh phóng ×28, đại lục ×220, có ảnh chi tiết theo độ nét màn hình; truyền thư mục để chụp ảnh từng mức phóng. |
| 51 | `luu-nen.js` | Trình duyệt xoá ngăn lưu chính nhưng còn bản ghi nền: bấm Chơi phải lấy bản ghi nền, không tải đè bản cũ trên máy chủ. |
| – | `dong-tac.js <tên> "<dáng:công cụ,...>"` | Chụp bảng từng pha của các động tác để soát bằng mắt (ví dụ `h3chop2:axe,h3gather2`). |

Quy ước khi thêm thứ mới:
- **Công trình mới**: không cần sửa gì trong bài thử; `va-cham.js` tự quét. Nếu món đó cố ý cho đi qua (thảm, ao, sàn trên cột) thì thêm mã vào `CHO_PHEP` trong `chay-het.sh` **và** vào `SOL_WALK` trong `src/solid.js`. Món có bậc/sàn đứng lên được thì phải trả về độ cao trong `groundY`.
- **Động tác mới**: thêm vào `src/dongtac.js` bằng `dtKeys`, chụp bằng `dong-tac.js` trước và sau.
- **Tính năng mới cho Tự làm**: chạy `tu-lam.js 8` ít nhất 2 lần (kết quả thay đổi theo thời tiết, thú dữ).
- Các bài thử dùng Chromium không có card đồ hoạ nên **không** đo được tốc độ khung hình và không thay được thử trên điện thoại thật.
