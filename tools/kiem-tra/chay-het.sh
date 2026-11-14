#!/bin/bash
# RÀ SOÁT TOÀN BỘ trước khi đẩy lên. Chạy:  bash tools/kiem-tra/chay-het.sh
# Cần: node + playwright (Chromium). Mỗi bước in ĐẠT / HỎNG; có bước HỎNG thì thoát mã 1.
cd "$(dirname "$0")" || exit 1
ROOT="$(cd ../.. && pwd)"; FAIL=0; TMP="${TMPDIR:-/tmp}"
ok(){ echo "  ĐẠT  $1"; }; bad(){ echo "  HỎNG $1"; FAIL=1; }
echo "1. Dựng lại bản chạy"; (cd "$ROOT/src" && python3 build.py >/dev/null && python3 pwa_inject.py >/dev/null) && ok "dựng index.html" || bad "dựng index.html"
echo "2. Cú pháp"; node -e "
const h=require('fs').readFileSync('$ROOT/index.html','utf8');const m=[...h.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)];let e=0;for(const x of m){try{new Function(x[1])}catch(er){console.log('   '+er.message);e=1}}process.exit(e)" && ok "cú pháp" || bad "cú pháp"
echo "3. Va chạm: thử đi xuyên qua TẤT CẢ công trình dạng vật (kể cả món mới thêm)"
timeout 900 node va-cham.js >/dev/null 2>&1
python3 - "$TMP/ld-va-cham.txt" <<'PY' && ok "không món nào bị đi xuyên ngoài danh sách cho phép" || bad "có món bị đi xuyên (xem trên)"
import re,sys
CHO_PHEP={'leanto','tent','stilt','stiltBamboo','stiltDeck2','treePlatform','hammock','kitchenShed','sleepMat','fishPond','paddy','channel','farm','rug','spikePit','trap','fishTrap','bed','bambooBed','caveBed','flowerBed'}
try: rows=[l.split(' | ') for l in open(sys.argv[1]).read().split('\n') if l]
except Exception as e: print('   không có kết quả:',e); sys.exit(1)
bad=0
if len(rows)<110: print('   quá ít món được thử:',len(rows)); bad=1
for r in rows:
    if len(r)<8: print('   LỖI',r); bad=1; continue
    H=int(r[3][1:]); pen=int(re.sub(r'[^\-0-9]','',r[5])); up=int(re.sub(r'[^\-0-9]','',r[6]))
    if pen>8 and up<H*0.4 and r[0] not in CHO_PHEP: print('   ĐI XUYÊN:',r[0],r[1],'lọt',pen); bad=1
sys.exit(bad)
PY
echo "4. Nhà: nhảy từ trong ra, từ ngoài vào, lên mái"
OUT=$(timeout 600 node nha-nhay.js 2>&1); echo "$OUT" | grep -q '"RA!' && N=$(echo "$OUT" | grep -c '"RA!') || N=0
[ "$N" -le 1 ] && ok "trong nhà nhảy không lọt ra ngoài (chỉ hướng cửa)" || bad "nhảy lọt khỏi nhà $N hướng"
echo "5. Đài trống hội"
OUT=$(timeout 600 node dai-trong.js 2>&1 | tr -d '\n '); echo "$OUT" | grep -q '"stairs":{"x":0,"z":1[0-9],"y":25' && ok "lên được bằng bậc thang" || bad "không lên được đài trống: $OUT"
echo "6. Tự làm tua nhanh 5 phút (không lỗi, không chết đói)"
timeout 600 node tu-lam.js 5 > "$TMP/ld-tu-lam.log" 2>&1
grep -q "LOOPERR\|^ERR " "$TMP/ld-tu-lam.log" && bad "có lỗi khi chạy: $(grep -m2 'LOOPERR\|^ERR ' "$TMP/ld-tu-lam.log" | cut -c1-200)" || ok "không lỗi chạy"
K=$(grep -c "Bị kẹt\|Kẹt giữa" "$TMP/ld-tu-lam.log"); [ "$K" -le 5 ] && ok "kẹt đường $K lần, tính cả lần tự lùi ra (cho phép tối đa 5)" || bad "kẹt đường $K lần: $(sed -n '/^TKLOG/,/^TKEND/p' "$TMP/ld-tu-lam.log" | head -8 | tr '\n' ';' | cut -c1-500)"
node -e "
const l=require('fs').readFileSync('$TMP/ld-tu-lam.log','utf8').split('\n').find(x=>x.startsWith('{\"goal\"'));if(!l){console.log('   không có trạng thái cuối');process.exit(1)}const s=JSON.parse(l.slice(0,l.indexOf(',\"st\"'))+'}');console.log('   mục tiêu '+s.goal+', máu '+s.hp+', no '+s.food+', nước '+s.water);process.exit(s.hp<20||s.goal<12||s.water<3||s.food<3?1:0)" && ok "nhân vật còn khoẻ, không đói khát cạn, làm được từ 12 mục trở lên" || bad "nhân vật kiệt sức hoặc tiến quá chậm"
echo "7. Giao diện điện thoại: mở từng bảng, các khối không đè nhau, không lỗi chạy"
OUT=$(timeout 600 node giao-dien.js 2>&1); echo "$OUT" | grep -q "^GD-DAT" && ok "giao diện" || bad "giao diện: $(echo "$OUT" | tail -6 | tr '\n' ';' | cut -c1-400)"
echo "8. Chơi mạng giả lập: cướp phá, chiến tranh liên minh, hạ cờ chiếm đất, cửa nhà người khác"
m(){ OUT=$(timeout 400 node "mang/$1.js" 2>&1); echo "$OUT" | grep -q "$2" && ok "$3" || bad "$3: $(echo "$OUT" | tail -2 | cut -c1-240)"; }
m cuop-pha 'Lính gác của' "cướp phá: lính gác của chủ nhà hiện ra, cấp dưới 5 bị chặn"
m chien-tranh '"atWar":true' "chiến tranh liên minh: tuyên chiến, tính điểm"
m ha-co 'Hạ cờ' "hạ cờ chiếm đất chung"
m cua-dong '"open0":false' "cửa nhà người khác đóng, đồng minh qua được"
m cong-thanh '^CT-DAT' "công thành: công phá điểm giàu phe khác, mất quyền giữ 24 giờ, chia sản vật đất liên minh, lính giữ tiền đồn"
m linh-thay '^LT-DAT' "lính, tù binh của người khác hiện ra, đánh được, đồng minh thì không"
m dong-bo '^DB-DAT' "đồng bộ đổi máy: đánh số bản lưu, không ghi đè bản mới của máy khác, tải bản mới về"
m hang-xom '^HX-DAT' "máy chủ đông (800 đất cắm, 10 hàng xóm): xét lại công trình hàng xóm dưới 3 ms khi không có gì đổi"
echo "9. Đập đồ: mở bảng, thành công, hỏng cộng may mắn, tụt cấp, đá hộ mệnh, +15, nâng thú"
OUT=$(timeout 600 node dap-do.js 2>&1); echo "$OUT" | grep -q "^DP-DAT" && ok "đập đồ" || bad "đập đồ: $(echo "$OUT" | tail -3 | tr '\n' ' ' | cut -c1-400)"
echo "10. Trang bị: sức đánh từng vũ khí, mọi loại cung bắn được, mọi món mặc dựng hình không lỗi, công thức hợp lệ"
OUT=$(timeout 600 node trang-bi.js 2>&1); echo "$OUT" | grep -q "^TB-DAT" && ok "trang bị" || bad "trang bị: $(echo "$OUT" | tail -8 | tr '\n' ';' | cut -c1-500)"
echo "11. Rà tổng quát nội dung: chế tạo thật mọi công thức, dựng thật mọi công trình, ăn uống mọi món, mọi nhiệm vụ và kế hoạch Tự làm, mở mọi bảng"
OUT=$(timeout 900 node tong-quat.js 2>&1); echo "$OUT" | grep "^SỐ LƯỢNG" | sed "s/^/   /"; echo "$OUT" | grep -q "^TQ-DAT" && ok "nội dung" || bad "nội dung: $(echo "$OUT" | sed -n '/^TQ-HONG/,$p' | head -10 | tr '\n' ';' | cut -c1-700)"
echo "12. Võ nghệ: liên hoàn, đòn kết, sở trường vũ khí, tuyệt kỹ"
OUT=$(timeout 600 node vo-nghe.js 2>&1); echo "$OUT" | grep -q "^VN-DAT" && ok "võ nghệ" || bad "võ nghệ: $(echo "$OUT" | tail -6 | tr '\n' ';' | cut -c1-500)"
echo "13. Kho làng: rương cả làng (45 m) được tính và tự rút khi chế tạo, rương xa không tính, xem tổng và lấy về túi"
OUT=$(timeout 600 node kho-lang.js 2>&1); echo "$OUT" | grep -q "^KL-DAT" && ok "kho làng" || bad "kho làng: $(echo "$OUT" | tail -4 | tr '\n' ';' | cut -c1-500)"
echo "14. Lớp nghe máy chủ: gom thay đổi dồn dập, giải mã một lần, báo đúng thêm/sửa/xoá, chi phí mỗi thay đổi dưới 2 ms với 400 người"
OUT=$(timeout 300 node may-chu.js 2>&1); echo "$OUT" | grep -q "^MC-DAT" && ok "lớp nghe máy chủ" || bad "lớp nghe máy chủ: $(echo "$OUT" | tail -3 | tr '\n' ';' | cut -c1-500)"
echo "15. Nhiệm vụ hằng ngày: 3 việc mỗi ngày, nhận thưởng đúng lúc, rương ngày, sang ngày đổi mới và tính chuỗi; âm thanh nền không lỗi"
OUT=$(timeout 400 node nhiem-vu-ngay.js 2>&1); echo "$OUT" | grep -q "^NV-DAT" && ok "nhiệm vụ ngày" || bad "nhiệm vụ ngày: $(echo "$OUT" | tail -3 | tr '\n' ';' | cut -c1-500)"
echo "16. Rác bộ nhớ: đi bộ ở 60 khung/giây tạo dưới 4,5 MB rác mỗi giây (mốc cũ 7,9) để trình duyệt không phải dừng game dọn liên tục"
OUT=$(timeout 400 node rac-bo-nho.js 2>&1); echo "$OUT" | grep "^{" | sed "s/^/   /"; echo "$OUT" | grep -q "^RAC-DAT" && ok "rác bộ nhớ" || bad "rác bộ nhớ: $(echo "$OUT" | tail -3 | tr '\n' ';' | cut -c1-400)"
echo "17. Gom ghi bản lưu: gọi lưu dồn dập không ghi thật, rời trang / mở Cài đặt / sắp đẩy lên máy chủ thì ghi ngay, dữ liệu ghi là mới nhất"
OUT=$(timeout 400 node luu-gom.js 2>&1); echo "$OUT" | grep -q "^LG-DAT" && ok "gom ghi bản lưu" || bad "gom ghi bản lưu: $(echo "$OUT" | tail -3 | tr '\n' ';' | cut -c1-500)"
echo "18. Người làng: có việc thì đi làm, mang đồ về kho; hết việc quanh nhà thì không quét tìm lại mỗi khung hình"
OUT=$(timeout 400 node nguoi-lang.js 2>&1); echo "$OUT" | grep -q "^NL-DAT" && ok "người làng" || bad "người làng: $(echo "$OUT" | tail -3 | tr '\n' ';' | cut -c1-500)"
echo "19. Hàng rào: Tự làm ra vào qua cổng, rào kín thì tự mở cổng; người làng vòng qua cổng; thổ dân vào bằng cổng; kẻ địch bị rào chặn"
OUT=$(timeout 400 node rao-chan.js fence gate 2>&1); echo "$OUT" | grep -q "^RAO-DAT" && ok "rào có cổng" || bad "rào có cổng: $(echo "$OUT" | tail -3 | tr '\n' ';' | cut -c1-600)"
OUT=$(timeout 400 node rao-chan.js fence none 2>&1); echo "$OUT" | grep -q "^RAO-DAT" && ok "rào kín không cổng" || bad "rào kín không cổng: $(echo "$OUT" | tail -3 | tr '\n' ';' | cut -c1-600)"
echo "20. Phương tiện và công cụ: bè tre, thuyền, ngựa lên/đi/xuống đúng, nhân vật không chìm; cầm từng dụng cụ dùng lên cây, đá, bụi, cỏ, thú không lỗi, không cảnh báo"
OUT=$(timeout 700 node phuong-tien.js 2>&1); echo "$OUT" | grep -q "^PT-DAT" && ok "phương tiện, công cụ" || bad "phương tiện, công cụ: $(echo "$OUT" | tail -2 | tr '\n' ';' | cut -c1-900)"
echo "21. Tương tác: đặt từng công trình trong 188 loại, đứng cạnh bấm Hành động; không lỗi, không cảnh báo, không văng, không kẹt trạng thái"
OUT=$(timeout 700 node tuong-tac.js 2>&1); echo "$OUT" | grep -q "^TT-DAT" && ok "tương tác công trình" || bad "tương tác công trình: $(echo "$OUT" | tail -1 | cut -c1-900)"
echo "22. Công trình kiểu mới có chức năng: giếng khơi, chuồng gà trên cột, chuồng vịt, giá trống đồng, giá cồng chiêng, cột vật tổ chim/rồng"
OUT=$(timeout 400 node chuc-nang.js 2>&1); echo "$OUT" | grep -q "^CN-DAT" && ok "chức năng công trình mới" || bad "chức năng công trình mới: $(echo "$OUT" | tail -1 | cut -c1-700)"
echo "23. Vũ khí: cầm cung bấm Hành động / nút Đánh / giữ G đều bắn được, tên trúng thân cây và nhặt lại được, hết tên có báo; rìu vẫn chặt cây"
OUT=$(timeout 400 node vu-khi.js 2>&1); echo "$OUT" | grep -q "^VK-DAT" && ok "vũ khí" || bad "vũ khí: $(echo "$OUT" | tail -1 | cut -c1-700)"
echo "24. Thuần thú: lom khom có thức ăn thì thú không lao vào, cho ăn xong cả bầy không cắn, đánh nó thì mất tiến độ, cho ăn đủ thành vật nuôi"
OUT=$(timeout 400 node thuan-thu.js 2>&1); echo "$OUT" | grep -q "^TH-DAT" && ok "thuần thú" || bad "thuần thú: $(echo "$OUT" | tail -1 | cut -c1-700)"
echo "25. Lính gác chia vị trí: mỗi chòi một người, còn lại rải quanh nhà nhiều hướng, lính theo sau xếp hàng, không ai đứng chồng lên ai"
OUT=$(timeout 400 node canh-gac.js 2>&1); echo "$OUT" | grep -q "^CG-DAT" && ok "lính gác chia vị trí" || bad "lính gác chia vị trí: $(echo "$OUT" | tail -2 | tr '\n' ';' | cut -c1-700)"
echo "26. Chăn nuôi: có dê núi, thuần dê và thỏ, thả con giống, lớn lên, sinh con, vịt đẻ trứng, mổ thịt, chuồng trống chỉ cách kiếm; 16 kiểu nhà mới có bản vẽ hợp lệ"
OUT=$(timeout 400 node chan-nuoi.js 2>&1); echo "$OUT" | grep -q "^CNU-DAT" && ok "chăn nuôi, nhà mới" || bad "chăn nuôi, nhà mới: $(echo "$OUT" | tail -2 | tr '\n' ';' | cut -c1-900)"
echo "27. Thuần thú không bị đánh nhầm (cầm rìu vẫn cho ăn, hết thức ăn không đánh); Giữ cổng khi chưa có cổng không dồn ở bếp; việc mới: thợ xây, chăn nuôi, đi săn, đánh cá; nhiệm vụ ngày 5 việc"
OUT=$(timeout 500 node viec-them.js 2>&1); echo "$OUT" | grep -q "^VT-DAT" && ok "việc mới của người làng, thuần thú" || bad "việc mới, thuần thú: $(echo "$OUT" | tail -2 | tr '\n' ';' | cut -c1-900)"
echo; [ $FAIL = 0 ] && echo "TẤT CẢ ĐẠT" || echo "CÓ BƯỚC HỎNG: sửa xong mới đẩy lên"; exit $FAIL
