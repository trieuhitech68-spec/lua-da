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
| – | `dong-tac.js <tên> "<dáng:công cụ,...>"` | Chụp bảng từng pha của các động tác để soát bằng mắt (ví dụ `h3chop2:axe,h3gather2`). |

Quy ước khi thêm thứ mới:
- **Công trình mới**: không cần sửa gì trong bài thử; `va-cham.js` tự quét. Nếu món đó cố ý cho đi qua (thảm, ao, sàn trên cột) thì thêm mã vào `CHO_PHEP` trong `chay-het.sh` **và** vào `SOL_WALK` trong `src/solid.js`. Món có bậc/sàn đứng lên được thì phải trả về độ cao trong `groundY`.
- **Động tác mới**: thêm vào `src/dongtac.js` bằng `dtKeys`, chụp bằng `dong-tac.js` trước và sau.
- **Tính năng mới cho Tự làm**: chạy `tu-lam.js 8` ít nhất 2 lần (kết quả thay đổi theo thời tiết, thú dữ).
- Các bài thử dùng Chromium không có card đồ hoạ nên **không** đo được tốc độ khung hình và không thay được thử trên điện thoại thật.
