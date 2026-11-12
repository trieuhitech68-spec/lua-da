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
CHO_PHEP={'stilt','stiltBamboo','stiltDeck2','treePlatform','hammock','kitchenShed','sleepMat','fishPond','paddy','channel','farm','rug','spikePit','trap','fishTrap','bed','bambooBed','caveBed','flowerBed'}
try: rows=[l.split(' | ') for l in open(sys.argv[1]).read().split('\n') if l]
except Exception as e: print('   không có kết quả:',e); sys.exit(1)
bad=0
if len(rows)<60: print('   quá ít món được thử:',len(rows)); bad=1
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
K=$(grep -c "Bị kẹt" "$TMP/ld-tu-lam.log"); [ "$K" -le 3 ] && ok "kẹt đường $K lần (cho phép tối đa 3)" || bad "kẹt đường $K lần: $(grep -m2 'Bị kẹt' "$TMP/ld-tu-lam.log" | cut -c1-160)"
node -e "
const l=require('fs').readFileSync('$TMP/ld-tu-lam.log','utf8').split('\n').find(x=>x.startsWith('{\"goal\"'));if(!l){console.log('   không có trạng thái cuối');process.exit(1)}const s=JSON.parse(l.slice(0,l.indexOf(',\"st\"'))+'}');console.log('   mục tiêu '+s.goal+', máu '+s.hp+', no '+s.food+', nước '+s.water);process.exit(s.hp<20||s.goal<12?1:0)" && ok "nhân vật còn khoẻ, làm được từ 12 mục trở lên" || bad "nhân vật kiệt sức hoặc tiến quá chậm"
echo "7. Giao diện điện thoại: mở từng bảng, các khối không đè nhau, không lỗi chạy"
OUT=$(timeout 600 node giao-dien.js 2>&1); echo "$OUT" | grep -q "^GD-DAT" && ok "giao diện" || bad "giao diện: $(echo "$OUT" | tail -6 | tr '\n' ';' | cut -c1-400)"
echo "8. Chơi mạng giả lập: cướp phá, chiến tranh liên minh, hạ cờ chiếm đất, cửa nhà người khác"
m(){ OUT=$(timeout 400 node "mang/$1.js" 2>&1); echo "$OUT" | grep -q "$2" && ok "$3" || bad "$3: $(echo "$OUT" | tail -2 | cut -c1-240)"; }
m cuop-pha 'Lính gác của' "cướp phá: lính gác của chủ nhà hiện ra, cấp dưới 5 bị chặn"
m chien-tranh '"atWar":true' "chiến tranh liên minh: tuyên chiến, tính điểm"
m ha-co 'Hạ cờ' "hạ cờ chiếm đất chung"
m cua-dong '"open0":false' "cửa nhà người khác đóng, đồng minh qua được"
echo; [ $FAIL = 0 ] && echo "TẤT CẢ ĐẠT" || echo "CÓ BƯỚC HỎNG: sửa xong mới đẩy lên"; exit $FAIL
