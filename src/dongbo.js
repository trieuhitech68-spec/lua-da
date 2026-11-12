/* ===================== ĐỒNG BỘ NỀN NHÀ VÀ CÂY CỎ GIỮA NGƯỜI CHƠI =====================
   Trước: công trình được chia sẻ, nhưng việc SAN NỀN và DỌN CÂY CỎ chỉ lưu ở máy người xây. Sang xem nhà người khác thấy cỏ, bụi, cây mọc xuyên sàn.
   Giờ:
   - Mỗi người gửi kèm danh sách khu đã san (tâm, bán kính, độ cao) cùng tài liệu công trình. Máy người xem áp y hệt: mặt đất phẳng, đất nện, không cỏ.
   - Người chưa san nền (hoặc bản cũ chưa gửi): tự suy ra một khoảng "đất nện" quanh cụm sàn nhà của họ để cỏ không mọc trong nhà.
   - Cây, bụi, đá nhỏ nằm trong chân sàn, chân tường, dưới đồ đạc của người khác được ẩn ở máy người xem (không cho hái, không va chạm).
   Chỉ là hiển thị ở máy người xem: không đổi bản lưu của ai. */
const DB={flats:[],by:new Map(),hid:new Set()};
function mpFlatStr(){try{return (S.flat||[]).slice(-12).map(f=>[Math.round(f.x),Math.round(f.z),Math.round(f.r),Math.round(f.h*10)/10].join(',')).join(';');}catch(e){return '';}}
function dbHide(x,z,r){let ch=0;try{for(const i of near(x,z,r+24)){const q=RES[i];if(!q||q.st!==0||q.lock)continue;const D=RT[q.t];if(Math.hypot(q.x-x,q.z-z)>r+(D.pass?0:(D.r||4)*0.5))continue;q.st=1;q.rmt=1;DB.hid.add(q.i);try{resShow(q);}catch(e){}ch=1;}}catch(e){}return ch;}
function dbFlats(u,str,raw){const L=[];if(typeof str==='string'&&str)for(const p of str.split(';').slice(0,12)){const f=p.split(',').map(Number);if(f.length!==4||!f.every(isFinite))continue;if(Math.abs(f[0])>WSIZE||Math.abs(f[1])>WSIZE||f[2]<20||f[2]>200||f[3]<-50||f[3]>2000)continue;L.push({x:f[0],z:f[1],r:f[2],h:f[3],u});}
  // chưa có khu san nào phủ cụm sàn: suy ra khoảng đất nện quanh sàn (không đổi độ cao)
  try{const F=(raw||[]).filter(e=>{const d=pieceDef(e.k);return d&&d.kind==='floor'&&!(e.lv>0);});if(F.length){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const e of F){x0=Math.min(x0,e.x);x1=Math.max(x1,e.x);z0=Math.min(z0,e.z);z1=Math.max(z1,e.z);}const cx=(x0+x1)/2,cz=(z0+z1)/2,r=Math.min(200,Math.hypot(x1-x0,z1-z0)/2+46);
      if(!L.some(f=>Math.hypot(f.x-cx,f.z-cz)<f.r*0.7))L.push({x:Math.round(cx),z:Math.round(cz),r:Math.round(r),h:null,u});}}catch(e){}
  const key=L.map(f=>[f.x,f.z,f.r,f.h].join(',')).join(';');if(DB.by.get(u)===key)return;DB.by.set(u,key);DB.flats=DB.flats.filter(f=>f.u!==u).concat(L);
  let ch=0;for(const f of L){if(f.h!=null&&typeof HG!=='undefined'&&!(S.flat||[]).some(m=>Math.hypot(m.x-f.x,m.z-f.z)<m.r+f.r)){try{flatApply(f);}catch(e){}}ch|=dbHide(f.x,f.z,f.r);
    try{for(const i of near(f.x,f.z,f.r*1.3+30)){const q=RES[i];if(!q||q.wy!=null||q.st!==0)continue;const ny=hAt(q.x,q.z)-1.2;if(Math.abs(ny-q.y)>0.3){q.y=ny;resShow(q);ch=1;}}}catch(e){}try{landRebuild(f);}catch(e){}}
  if(ch)try{RI.forEach(v=>v.api.flush());}catch(e){}}
// màu đất nện + không cỏ: tính cả khu của người khác
{const _tc=terrainColors;terrainColors=function(){if(!DB.flats.length)return _tc.apply(this,arguments);const mine=S.flat;S.flat=(mine||[]).concat(DB.flats);try{return _tc.apply(this,arguments);}finally{S.flat=mine;}};}
// cây cỏ dưới chân công trình của người khác
{const _sa=structAdd;structAdd=function(b,quiet){const r=_sa.apply(this,arguments);try{if(b&&b.remote){const d=pieceDef(b.k);if(d){const fp=d.fp||[1,1],rad=d.kind==='edge'?16:d.kind==='corner'?8:d.kind==='roof'?0:Math.max(fp[0],fp[1])*CELL*0.62;if(rad&&dbHide(b.x,b.z,rad))DB.fl=1;}}}catch(e){}return r;};}
setInterval(()=>{try{if(DB.fl){DB.fl=0;RI.forEach(v=>v.api.flush());}}catch(e){}},1500);
// cây đã ẩn vì nhà người khác: không lưu, không cho mọc lại trong phiên
{const _sv=save;save=function(){return _sv.apply(this,arguments);};}
