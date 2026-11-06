# Lửa Đá: Từ Hai Bàn Tay Trắng — Tài liệu thiết kế

Game nhập vai xây dựng – sinh tồn, góc nhìn 3D từ trên cao, chơi trên trình duyệt (máy tính và điện thoại).
Nhân vật tỉnh dậy giữa thung lũng thời tiền sử Việt Nam, không có gì trong tay. Người chơi tự nhặt nhạnh, học nghề,
dựng nhà, trồng trọt, vượt qua bốn mùa. Không ép nhịp: muốn làm gì thì làm.

Tệp chơi: `index.html` (bản đăng artifact) và `lua-da-tay-trang.html` (bản web tải về, mở trực tiếp toàn màn hình).
Game cũ "Kỷ Nguyên Lửa Đá" vẫn giữ nguyên ở link cũ; đây là game mới, link mới.

---

## 1. Ý tưởng cốt lõi

| Trụ cột | Cách làm trong game |
|---|---|
| Bắt đầu từ con số không | Túi rỗng. Bước đầu: nhặt cành khô, sỏi, cỏ lanh → làm rìu đá → chặt cây → nhóm lửa → dựng lều. |
| Học hỏi để giỏi lên | 10 kỹ năng lên cấp nhờ **làm nhiều** (chặt nhiều thì đốn gỗ giỏi). Cấp cao làm nhanh hơn, được thêm sản phẩm, mở công thức mới. |
| Cái gì cũng có công thức | 29 công thức chế tạo + 31 công trình. Công thức chỉ hiện khi đã **từng thấy** nguyên liệu (học bằng quan sát), một số cần cấp kỹ năng, dụng cụ hoặc trạm (bếp lửa, bàn chế tác, lò nung…). |
| Thế giới sống, theo hiện thực | Ngày đêm, nắng mưa, giông, tuyết, 4 mùa; thú hoang có tập tính; côn trùng; bệnh tật và thuốc nam; thân nhiệt, quần áo, chỗ trú. |
| Thư giãn | Chế độ **Thong thả** (mặc định): đói khát chỉ làm chậm, ngất thì tỉnh lại đủ đồ, thú ít hung dữ. Chế độ **Sinh tồn** cho ai thích thử thách. |

## 2. Học hỏi từ các game khác

| Game | Lấy gì áp dụng |
|---|---|
| Valheim | Xây theo lưới, mái phải che mới không ướt, lửa sưởi ấm và hồi sức, "Khỏe khoắn" sau khi ngủ ngon. |
| Don't Starve | Mùa đông khắc nghiệt, thú có tập tính ngày/đêm, công thức mở dần theo trạm chế tạo. |
| Green Hell | Bệnh tật thực tế (ngộ độc, sốt do muỗi, chảy máu) chữa bằng thảo dược thật. |
| Medieval Dynasty | Kỹ năng lên cấp nhờ làm việc, bốn mùa ảnh hưởng trồng trọt. |
| Stardew Valley | Nhịp ngày thư giãn, bảng tổng kết cuối ngày, ruộng – giếng – bù nhìn. |
| Minecraft / Len's Island | Tự do làm gì cũng được, nhìn từ trên cao, nhìn xuyên tán cây/mái nhà để luôn thấy nhân vật. |
| Kênh "Primitive Technology" | Trình tự kỹ thuật thật: ghè đá, dây thừng từ sợi cây, lò nung đất sét, gạch nung, mái lá. |

## 3. Bối cảnh lịch sử (5 thời đại)

Thời đại lên theo chuỗi 31 mục tiêu (nhật ký) – mỗi thời có điều kiện riêng:

1. **Thời Sơn Vi** (~20.000 năm trước) — hái lượm, ghè đá cuội.
2. **Thời Hòa Bình** — có lửa, chỗ trú, biết dùng thảo dược.
3. **Thời Bắc Sơn** — rìu mài, nhà cửa, đồ gốm.
4. **Thời Phùng Nguyên** — trồng trọt, chăn nuôi ong, gạch nung.
5. **Thời Đông Sơn** — lò luyện đồng (mở đường cho bản sau).

## 4. Thế giới

- Đảo bán kính ~115 m (1 m ≈ 20 đơn vị; người cao ~1,8 m). Núi phía đông bắc có tuyết trên đỉnh, sông chảy ra biển phía tây nam, hồ nhỏ phía nam.
- Vùng sinh thái: đồng cỏ, bìa rừng, rừng, bờ sông, bãi biển, núi đá, đỉnh núi — mỗi vùng có cây, đá, thú riêng.
- Khoảng 2.400 tài nguyên: 4 loại cây lớn + cây non, bụi quả, cỏ lanh, lau sậy, kê dại, bầu dại, đá tảng, đá lửa, quặng đồng, đất sét, nấm (nấm rơm ăn được, nấm đỏ độc), cành khô, sỏi, xương, tổ ong rừng, 6 loại thảo dược, hoa 4 màu.
- Điểm xuất phát là bãi trống bằng phẳng (~10 m) để dựng trại, cách sông ~15 m để lấy nước.
- Cây chặt xong còn gốc và mọc lại theo thời gian; bụi quả, nấm, thảo dược ra theo mùa.

## 5. Cơ thể và sinh tồn

| Chỉ số | Giảm khi | Hồi khi |
|---|---|---|
| Máu | thú tấn công, bệnh (sinh tồn), đói/khát/rét quá lâu | ăn chín, ngủ, thuốc |
| No | theo thời gian; ngộ độc làm đói nhanh gấp đôi | ăn (đồ chín nhiều dinh dưỡng hơn, đồ sống dễ ngộ độc) |
| Nước | theo thời gian, mùa hạ khát nhanh | uống nước suối (dễ đau bụng), giếng, thùng hứng mưa, nước đun sôi |
| Thể lực | chạy, chặt, đào, đâm cá | nghỉ, ngủ; cảm lạnh làm hồi chậm |
| Thân nhiệt | mưa ướt, gió rét, đêm, mùa đông | lửa, mái nhà, áo da, áo lông, ủng |

**Bệnh và thuốc nam** (đơn giản hóa cho game, không phải lời khuyên y tế):

| Bệnh | Nguyên nhân | Thuốc |
|---|---|---|
| Ngộ độc | nấm đỏ, thịt sống, nước suối chưa đun | Nước bạc hà |
| Cảm lạnh | ướt và rét lâu | Trà gừng |
| Sốt | muỗi ven sông lúc chạng vạng | Thuốc ngải cứu |
| Chảy máu | thú cắn | Băng lá rau má |
| Ong đốt | lấy mật không hun khói | tự khỏi |

Cao nghệ – nha đam hồi máu; bó hương ngải xua muỗi.

## 6. Thú vật và côn trùng

| Loài | Tập tính |
|---|---|
| Thỏ rừng, nai (đực có gạc, cái không) | chạy trốn khi người lại gần, đi theo đàn |
| Lợn rừng | hiền, bị đánh mới húc lại |
| Sói xám | đi theo bầy, săn ban đêm và mùa đông |
| Gấu nâu | giữ lãnh thổ, mùa đông ngủ đông |
| Chim | bay lượn ban ngày, tránh mưa và mùa đông |
| Muỗi, đom đóm, bướm, ong | theo giờ và mùa |

Săn bằng giáo/gậy/dao: được thịt, da, xương. Đâm cá bằng giáo ở mép nước.

## 7. Kỹ năng (10)

Đốn gỗ · Đào đá · Hái lượm · Thảo dược · Chế tác · Xây dựng · Nấu nướng · Trồng trọt · Săn bắt · Thể lực.
Cấp = ⌊√(kinh nghiệm/12)⌋. Mỗi cấp: làm nhanh hơn 6%, khéo tay hơn (thêm sản phẩm), mở công thức/công trình cần cấp.

## 8. Xây dựng

- Lưới ô 2 m × 2 m. Sàn và mái theo ô; tường, cửa, cửa sổ, hàng rào, cổng theo cạnh ô; đồ vật theo diện tích (giường 1×2, lều da 2×2…).
- **Mái tự xoay** thành mái hai dốc theo chiều dài nền nhà; **thanh nóc** và **tường hồi tam giác** tự sinh, không tốn thêm nguyên liệu.
- Đứng dưới mái không bị mưa ướt; bước vào nhà thì mái tự ẩn để nhìn vào trong.
- Phá công trình được hoàn lại vật liệu (Thong thả: hoàn đủ, Sinh tồn: một nửa).
- Công trình đặc biệt:
  - **Bếp lửa / lò bếp / lò nung / lò luyện:** cần củi (1 gỗ = 4 giờ, 1 cành = 1 giờ). Mưa ngoài trời làm lửa mau tàn; lửa tắt thì không nấu được, không sưởi ấm.
  - **Thùng hứng mưa:** đầy dần khi trời mưa, cho nước sạch.
  - **Thùng nuôi ong:** mỗi ngày thêm mật (tối đa 5), mùa đông ong nghỉ; cầm đuốc hun khói khi lấy mật.
  - **Luống đất:** gieo kê, bầu, lanh. Mưa làm cây lớn nhanh, giếng làm nhanh gấp đôi, bù nhìn thêm 20%; mùa đông cây ngừng lớn.
  - **Giường / lều:** ngủ qua đêm. Ngủ dưới mái và gần lửa hoặc trên giường được trạng thái "Khỏe khoắn".

## 9. Thời gian

- 1 ngày trong game = 12 phút thật. Mỗi mùa 4 ngày.
- Nhiệt độ ngày/đêm theo mùa: Xuân 22/13 °C, Hạ 33/24 °C, Thu 21/11 °C, Đông 5/−6 °C.
- Thời tiết: quang, mây, mưa, giông (sấm chớp), tuyết; xác suất mưa theo mùa.
- Cuối mỗi ngày có bảng tổng kết: hôm nay làm được gì, kỹ năng tăng bao nhiêu.

## 10. Điều khiển

| | Máy tính | Điện thoại |
|---|---|---|
| Di chuyển | WASD / phím mũi tên, hoặc bấm chuột xuống đất | cần điều khiển ảo bên trái |
| Chạy / nhảy | Shift / Space | nút Chạy / Nhảy |
| Hành động (chặt, nhặt, uống, mở…) | E hoặc F, hoặc bấm vào vật | nút Hành động, hoặc chạm vào vật |
| Túi / Chế tạo / Xây / Nhật ký | I / C / B / J | nút trên cột phải |
| Thanh đồ nhanh | phím 1–6 | chạm ô |
| Camera | kéo chuột phải để xoay, cuộn để phóng to; Q/R xoay 45° | hai ngón: chụm để phóng to, xoay để xoay |
| Khi xây | R xoay, X chế độ phá, Esc thoát | nút trên thanh xây dựng |

## 11. Kỹ thuật

- Một tệp HTML duy nhất; thư viện 3D three.js r149 tải từ cdnjs. Phông chữ Be Vietnam Pro + Bungee.
- Mô hình 3D tự dựng bằng mã (cây, đá, nhà, công cụ, thú có khung xương cử động, vật phẩm); ảnh biểu tượng vật phẩm chụp từ chính mô hình 3D.
- Vẽ hàng loạt (instancing) cho tài nguyên và công trình; hiệu ứng mùa (tuyết phủ mặt trên, lá vàng mùa thu, đất ướt khi mưa) làm bằng shader.
- Nhìn xuyên: tán cây, tường, mái nằm giữa camera và nhân vật được làm thưa để luôn thấy người chơi.
- Hậu kỳ: HDR, bloom, tông màu ACES; tự giảm chất lượng trên máy yếu (3 mức Đẹp / Vừa / Nhẹ trong Cài đặt).
- Lưu tự động trong trình duyệt (`localStorage`, khóa `lua-da-tay-trang-v1`).

## 12. Kiểm thử đã làm

- Lối chơi: chặt cây, đào đá, hái quả và thảo dược, xây nhà 2×2 (sàn, tường, cửa, cửa sổ, mái, giường), trú mưa trong nhà (ướt 0 so với 60 ngoài trời), ngủ qua đêm, nấu ăn, ngộ độc/sốt và chữa, sói tấn công ban đêm (chế độ sinh tồn) và săn sói, quả theo mùa, lưu – tải lại.
- Tính năng mới: lửa hết củi thì tắt và nhóm lại, thùng hứng mưa, thùng ong, bù nhìn, chim bay, nai cái trong đàn, mái hai dốc tự động.
- Giao diện: máy tính 1268×640 và 960×600; điện thoại dọc 390×844, ngang 844×390 và 667×375 — không tràn màn hình, chữ ≥ 11px, nút chạm ≥ 36px.

## 13. Hướng phát triển

- Thời đồ đồng: luyện quặng đồng, công cụ đồng, trống đồng trang trí.
- Thuần hóa: gà rừng, lợn rừng con, chó.
- Dân làng: người lạ tới ở nếu có nhà trống, giao việc cho họ.
- Thuyền độc mộc ra đảo khác; câu cá bằng cần.
- Chơi cùng bạn bè (cần máy chủ).

---

## Bản cập nhật 2: góc nhìn thứ nhất, người thật, làm việc tỉ mỉ, vùng đất & bản đồ

**Hiệu năng**
- Mặc định chất lượng "Vừa" trên máy tính, "Nhẹ" trên điện thoại; tự hạ cấp sau 2,5 giây nếu giật.
- Cây cối, đá chia theo ô vùng 1150 du: chỉ vẽ phần trong tầm nhìn (cả với bóng đổ). Vật nhỏ chỉ vẽ ở gần, nhóm không có gì hiện thì không vẽ.
- Sương mù xa theo chất lượng (1300 / 1800 / 2500 du), cỏ dày chỉ mọc quanh người chơi và đi theo.

**Góc nhìn thứ nhất (mặc định)**
- Mắt ở độ cao 33 du (~1,65 m), lắc nhẹ khi đi, có tiếng bước chân.
- Máy tính: bấm vào màn hình để khóa chuột rồi rê chuột để nhìn; chuột trái làm việc, chuột phải ném. Điện thoại: vuốt nửa phải để nhìn, chạm để làm việc.
- Thấy tay cầm dụng cụ khi đang cầm đồ hoặc đang làm. Phím V hoặc Cài đặt để đổi sang nhìn từ trên cao.

**Người thật**
- Khung xương có khuỷu tay, đầu gối, cổ chân; tỷ lệ người trưởng thành; 4 dáng người (nam/nữ, tóc, râu, áo da, áo choàng lông).
- 20 động tác: đi, chạy, lom khom, ngồi, bơi, chặt, đào, ghè đá, mài, vót, khắc, buộc dây, đóng cọc, hái, nấu, uống, ném, ngủ…

**Làm việc tỉ mỉ từng công đoạn**
- Mỗi công thức có các bước như ngoài đời, ví dụ rìu đá: chọn đá → ghè đẽo lưỡi → mài sắc → vót cán → buộc dây. Nấu: xiên → nướng → lật. Thuốc: rửa lá → giã → gói / đun. Khâu áo: cạo da → cắt → khâu bằng kim xương.
- Bấm Hành động trong lúc làm để làm nhanh tay hơn. Đi chỗ khác thì dừng, nguyên liệu chỉ bị trừ khi xong.
- **Trạm khắc** (bàn đẽo): bát gỗ, thìa gỗ, tượng gỗ, cột gỗ chạm hoa văn, vòng đá mài (kiểu Hòa Bình – Phùng Nguyên), sáo tre.
- **Xây theo công đoạn**: đặt khung trước, sau đó đóng/buộc cho tới 100%. Có búa thì nhanh hơn. Khung lớn dần lên khi làm.

**Thao tác mới**: bơi (tốn thể lực, ướt sũng), lom khom (thú khó phát hiện), ngồi nghỉ (hồi sức gấp ba, sưởi bên lửa), ném đá / phóng giáo rồi nhặt lại, thổi sáo tre.

**Vùng đất & bản đồ**
- 12 vùng có tên: Trảng Khởi Đầu, Bến Sông Lau, Hồ Sen, Núi Đá Vôi, Hang Sơn Vi, Rừng Thông Già, Đồi Cỏ Tranh, Rừng Tre, Đầm Lầy Cửa Sông, Bãi Cát Vàng, Cây Đa Cổ Thụ, Đồi Đá Phía Đông. Bước vào vùng mới thì tên hiện lên.
- Đường mòn nối các vùng (tìm đường ít dốc), có lối lội qua sông; đi trên đường nhanh hơn 12%. Đá cuội rải ven đường.
- Núi đá vôi dựng đứng, hang đá vào được và trú mưa được, cây đa cổ thụ, rừng tre, chuối rừng, cọ biển, dương xỉ (rau dớn), đầm sen, cỏ tranh.
- Bản đồ (phím M): vùng chưa đi còn mờ; chạm để cắm cờ, la bàn chỉ hướng tới cờ và về nhà.

---

## Bản cập nhật 3: thế giới lớn, núi non sông suối, thú dữ, xây nhà sàn nhiều tầng

**Thế giới (~520 m × 520 m, gấp 5 lần trước)**
- Bắc: **Dãy Núi Tuyết** cao tới ~37 m, sống núi lởm chởm, đỉnh phủ tuyết.
- Đông bắc: **Núi Đá Vôi** dựng đứng, có **Hang Sơn Vi**.
- Giữa – đông: **Cao Nguyên Đá** bốn bề vách dựng đứng, chỉ một dốc thoải để lên; trên sườn có **Vực Đá** nứt sâu.
- **Sông Mẹ** chảy từ núi tuyết qua **Hẻm Vực** vách dựng, xuống đồng bằng rồi ra **Đầm Lầy Cửa Sông**. Ba con suối (Suối Đông, Suối Tây, Suối Thác) nhập vào. Mặt nước sông có độ cao thật, chảy xuôi; chỗ đổ dốc thành **thác nước** (15–20 thác, có tiếng nước).
- Tây: **Thảo Nguyên** cỏ tranh, cây keo đứng lẻ. Đông nam: **Rừng Già** nhiệt đới. Tây nam: **Hồ Sen**, **Bãi Cát Vàng**. Đông: **Vách Biển** dựng đứng.
- 19 vùng có tên, 21 đường mòn nối các vùng (tránh dốc, có chỗ lội qua suối).
- Vật cảnh: tảng đá vách núi, đá vụn sườn dốc (nhặt được đá lửa), gỗ mục, bãi lau sậy, cây keo.

**Sinh vật**
- Thú mới: **hổ** (rình người ở rừng già, thảo nguyên), **bò tót** (đi đàn, bị chọc thì húc), **khỉ** (núi đá vôi, rừng), **cá sấu** (đầm lầy, hồ), **rắn** (cắn gây ngộ độc), **gà rừng**.
- Cá bơi thật dưới sông, hồ (cá chép, cá trê, cá lóc), thấy người thì chạy; ếch kêu đêm ven nước; bướm bay ban ngày.

**Thao tác người**
- **Leo vách**: dốc quá thì phải leo, tốn thể lực. **Ngã từ cao** thì mất máu, có thể chảy máu.
- **Tắm** ở sông suối: người sạch sẽ. Bẩn lâu thì dễ đau bụng.
- **Câu cá** bằng cần tre: thả câu, chờ cá cắn, bấm đúng lúc để giật.
- **Bẫy thòng lọng** bắt thỏ, gà rừng; **đó tre** bắt cá ở chỗ nước nông.
- **Vẽ tranh vách** bằng son đất đỏ và than. Ngồi ghế, đánh trống, thổi sáo.

**Xây dựng sáng tạo**
- Xây tối đa 4 tầng. Chọn tầng bằng ▲▼ trên thanh xây dựng (phím `[` `]`).
- Sàn tầng trên cần tường hoặc cột tầng dưới đỡ (ít nhất 2 phía).
- **Nhà sàn**: cột nhà sàn dựng được trên dốc và trên nước nông, sàn cao 3 m. **Cầu thang** đi bộ lên được; **thang tre** bấm để leo lên/xuống.
- **Cột gỗ** ở góc ô, **lan can**, **tường thấp**.
- Vật liệu: gỗ, tre, vách đất trát rơm, gạch; mái lá, mái tranh dày, mái lá cọ.
- Nội thất: bàn, ghế, kệ, giá treo, chiếu da, chum vại, trống.
- Đứng dưới sàn tầng trên cũng tránh được mưa. Nhìn từ trên cao thì các tầng phía trên tự ẩn khi bạn ở trong nhà.

**Mượt hơn**
- Camera góc nhìn trên cao bám theo êm hơn; bước chân, động tác tính theo thời gian thật.
- Mặt đất chia 64 khối với 3 mức chi tiết theo khoảng cách. Cây ở xa vẽ bằng mô hình giản lược. Vật nhỏ chỉ vẽ ở gần.

## Bản cập nhật 4: rừng rậm, trồng cây, chăn nuôi, côn trùng, nhà trên cây

**Rừng và cây**
- Cây to nhỏ khác nhau (0,6–1,3 lần), có cây non (thông non, sồi non, bạch dương non) mọc dưới tán và cây cổ thụ (thông cổ thụ, sồi cổ thụ) to gấp đôi.
- Có mảng rừng rậm cây mọc sát nhau xen với rừng thưa, bìa rừng, trảng cỏ. Rừng Già đông nam là rừng rậm nhất.

**Trồng cây**
- Làm **gậy đào** (cành + đá), cầm lên tay, đến cây non / bụi quả / tre / chuối / thảo dược / hoa và bấm **Nhổ cây con**: nhổ được cả rễ.
- Mở túi, chọn cây con → **Trồng** ở chỗ trước mặt: đào hố → đặt cây, vun rễ → lấp đất.
- Cây lớn dần theo ngày (cây con → cây non → cây trưởng thành dùng được như cây rừng). Mùa xuân, trời mưa, gần giếng thì lớn nhanh; mùa đông gần như ngừng.

**Thuần hoá và chăn nuôi**
- Cầm thức ăn hợp loài trên thanh công cụ, lom khom lại gần và bấm **Cho ăn**: khoảng 3 lần thì con vật quen người.
  - Gà rừng ăn thóc, hạt, quả → gà nhà.
  - Lợn rừng ăn quả, nấm, chuối, bầu → lợn nhà.
  - Sói ăn thịt, cá, xương → chó nhà.
- **Chuồng gà**: gà ở quanh chuồng, đẻ trứng hằng ngày.
- **Máng ăn**: bỏ thức ăn vào, vật nuôi gần đó tự ăn; lợn ở quanh máng. Bỏ đói quá 2,5 ngày thì vật nuôi bỏ đi.
- Hai con cùng loài được ăn no thì đẻ con (gà con, lợn con, chó con); con non lớn sau 3 ngày.
- **Chó** đi theo chủ, sủa và cắn thú dữ lại gần; bấm để bảo ở yên trông nhà. **Lợn** lớn thì mổ được thịt (cần dao).
- **Rào chuồng gỗ**, **đống rơm**.

**Côn trùng**
- Ong bay quanh tổ, quanh thùng ong và hoa (có tiếng vo ve).
- Muỗi bu quanh người ven nước lúc chạng vạng.
- Ruồi bu khi người bẩn.
- Chuồn chuồn lượn trên mặt nước.
- Sâu bò trên bụi cây mùa xuân hạ; bọ cánh cứng ở gỗ mục.
- Đom đóm đêm hè thu.

**Nhà trên cây và trong hang**
- **Sàn nhà trên cây** đặt sát gốc cây sồi/thông to: sàn cao 3 m quấn quanh thân cây. Cây đó không bị chặt khi còn nhà.
- Trên sàn dựng được vách, mái, **lan can nhà cây**, **võng** để ngủ. **Thang dây** để leo lên xuống.
- Trong hang: **ổ nằm**, **bếp đá**, **rèm da che cửa**. Hang khô ráo, không bị mưa.

## Bản cập nhật 5: bộ lạc láng giềng, người ở cùng, cung tên, thuyền, thời đồ đồng

**Làng Suối Tây**
- Bộ lạc láng giềng có 7 nhà sàn quanh bếp lửa chung, giàn phơi, cột vật tổ.
- 8 người: tù trưởng, già làng, thợ săn, thợ gốm, người hái lượm, trẻ con. Ban ngày họ đi lại, ngồi bên lửa, làm việc; tối thì về nhà.
- **Trò chuyện:** họ kể kinh nghiệm sống (thuốc nam, thú dữ, trồng trọt…).
- **Trao đổi** theo nghề, ví dụ: thịt đổi tên, da đổi cung, đất sét đổi nồi, da đổi quặng đồng (tù trưởng), mật ong đổi thuốc (già làng).
- **Tặng quà** để tăng tình thân. **Học nghề** cộng kinh nghiệm kỹ năng.
- **Mời về ở cùng** khi tình thân từ 40 trở lên và có giường trống.

**Người ở cùng**
- Giao việc: hái lượm, đốn gỗ, đào đá, nấu ăn (nướng thịt cá trong kho ở bếp đang cháy), canh gác (đánh thú dữ), nghỉ ngơi.
- Họ làm quanh chỗ ngủ rồi cất đồ vào giỏ, rương, chum gần nhất; tối về giường ngủ.
- Mỗi ngày họ ăn đồ trong kho; nhịn quá 2 ngày thì bỏ về làng.

**Săn bắn và đi lại**
- **Cung tre** và **mũi tên** (cành, đá lửa, lông chim): bắn xa và nhanh, khoảng một nửa số tên nhặt lại được.
- **Bè tre** và **thuyền độc mộc**: thả xuống nước, ngồi chèo trên sông hồ biển, lên bờ chỗ cạn.

**Lửa**
- Bếp mới dựng chưa có lửa. Phải làm **khoan lửa** rồi xếp bùi nhùi → xoay que khoan → thổi cho bén.

**Thời đồ đồng**
- Đào **quặng thiếc** trên núi tuyết và **quặng đồng** ở núi đá vôi.
- Nấu **đồng thau** ở lò luyện: đập quặng → quạt ống thổi → nấu chảy trong nồi → rót khuôn.
- Đúc rìu đồng, giáo đồng, dao đồng, liềm đồng (mạnh hơn đồ đá). Đúc **trống đồng** Đông Sơn.
- Luyện được đồng thau là bước vào Thời Đông Sơn.

**Bầu trời đêm**
- Có sao; trăng tròn khuyết theo ngày, đêm trăng rằm sáng hơn.

## Bản cập nhật 6: đồ hoạ thật hơn, bản đồ nhỏ, bộ lạc thù địch, cướp phá, giao diện gọn

**Đồ hoạ**
- **Mặt đất** có vân thật: cỏ, đất có sỏi và vết nứt, đá vân lớp có khe nứt (chiếu 3 phía trên vách), cát gợn; trộn theo độ dốc, vùng, đường mòn.
- **Thực vật** (đợt này): lá cây là các tấm lá có hình thật (lá sồi, kim thông, lá tre, lá chuối, lá cọ, dương xỉ), vỏ cây có vân, đung đưa theo gió; cây ở xa vẽ bằng ảnh chụp chính cây đó.
- **Thú và người** (đợt này): bề mặt mịn, lông/da/vải có vân, mắt có ánh sáng, tóc có sợi.

**Điều khiển điện thoại**
- Ở góc nhìn trên cao: một tay giữ cần gạt để đi, tay kia vuốt bên phải/giữa màn hình để xoay camera (vuốt ngang xoay quanh, vuốt dọc chỉnh độ cao).

**Bản đồ nhỏ** (góc trên bên phải, chạm để mở bản đồ lớn)
- Hướng bắc ở trên, mũi tên đỏ là bạn.
- Biểu tượng: 🏠 nhà mình, 🛖 làng bạn, ⚔️ trại thù.
- Chấm màu: vàng là người nhà, trắng là vật nuôi, xanh là dân làng, đỏ là kẻ cướp, cam là thú dữ đang rình.

**Bộ lạc Núi Đá (thù địch)**
- Trại có hàng rào cọc, lều da, bếp lửa, cột vật tổ và **kho chiến lợi phẩm** (đồng thau, quặng đồng, tên, da, thịt).
- Chiến binh cầm giáo canh trại, thấy người lạ là xông tới.
- Hạ hết người canh thì **cướp kho**. Kho tự đầy lại theo ngày; trại cũng thêm chiến binh theo ngày, tối đa 10.
- Bắn cung, ném giáo, đánh giáp lá cà đều dùng được.

**Bị tấn công ban đêm**
- Định kỳ, chế độ Sinh tồn khoảng 3–5 ngày một lần, Thong thả 6–8 ngày.
- Có khi bộ lạc Núi Đá kéo quân đến: họ đánh người nhà, bắt vật nuôi, lấy nửa số đồ trong kho rồi chạy về trại.
- Có khi là bầy sói (mùa đông nhiều hơn), thỉnh thoảng có hổ.
- Chó nhà, người canh gác và bạn cùng đánh trả.

**Làng bạn lớn dần**
- Cứ 3 ngày thêm một nếp nhà sàn và một người, tối đa 12 nhà.

**Giao diện gọn**
- Bảng trạng thái, mục tiêu, menu, thanh đồ nhanh, nút hành động, la bàn đều nhỏ lại để thấy nhiều cảnh vật hơn.
- Trên điện thoại, menu chỉ còn biểu tượng.
