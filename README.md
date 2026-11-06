# 🔥 Lửa Đá: Từ Hai Bàn Tay Trắng

Game sinh tồn – xây dựng 3D thời tiền sử Việt Nam (Sơn Vi → Hòa Bình → Bắc Sơn → Phùng Nguyên → Đông Sơn), chạy thẳng trên trình duyệt, ưu tiên điện thoại.

**Chơi ngay:** https://lanhdia.app  (dự phòng: https://lua-da-h3es.vercel.app)

## Có gì trong game
- Thế giới rộng 33 vùng: núi đá vôi, Tràng An, vịnh đá, thác chín tầng, rừng tre, ruộng bậc thang, rừng ngập mặn, núi lửa đất đỏ…
- Sinh tồn thực tế: đói, khát, rét, ốm, vết thương, gãy xương, thuốc thảo dược, quần áo theo mùa.
- Săn bắn – hái lượm chi tiết: rình, vết máu, xẻ thịt, bắt cá, bắn chim, quăng chài, thịt để lâu bị thiu.
- Xây dựng theo từng bước (chôn cột, buộc khung, trát vách, lợp mái), nhiều tầng, nhà sàn, san nền, di chuyển và tháo dỡ công trình.
- Gốm, mài rìu, đúc đồng, ruộng lúa nước, trâu cày, kho thóc, lễ hội, kể chuyện truyền thuyết.
- Tạo hình nhân vật chi tiết (73 thông số), nhiều nhân vật.
- Vùng tài nguyên giàu/nghèo, điểm tài nguyên quý, đánh chiếm và giữ lãnh địa.

> Bản trên GitHub Pages lưu tiến trình trên máy từng người. Tài khoản lưu máy chủ và chơi nhiều người (bộ tộc, lãnh thổ chung) chỉ chạy trên bản đăng tại claude.ai.

## Mã nguồn
- `src/` – các mô-đun JavaScript và `build.py` ghép thành một tệp HTML.
- `v3d/` – bộ công cụ 3D dùng chung (three.js 0.149).
- `docs/` – tài liệu thiết kế.

Dựng lại `index.html`:
```bash
cd src && python3 build.py
```
