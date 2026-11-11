/* ===================== CƠ BẢN CHO NGƯỜI MỚI: NGÀY THEO LỊCH THẬT · CÂY CỎ QUANH NĂM · VẬT LIỆU CƠ BẢN GẦN NƠI BẮT ĐẦU · DỰNG CĂN CỨ TRƯỚC =====================
   1. Ngày: số "Ngày N" trên màn hình là số ngày theo lịch thật (giờ Việt Nam) kể từ khi tạo nhân vật. Ngủ không làm sang ngày mới.
      (Nhịp sinh hoạt bên trong: đói khát, cây lớn, củi cháy vẫn chạy theo "ngày công" 12 phút như cũ, chỉ không hiện ra và không nhảy khi ngủ.)
   2. Mùa giờ theo lịch thật nên một mùa dài 3 tháng: không thể để rau má, ngải cứu, quả mọng, nấm… biến mất hẳn cả mùa đông (kẹt nhiệm vụ băng lá).
      Mọi cây cỏ có quanh năm; mùa đông chỉ mọc lại chậm hơn (đã có sẵn trong hệ số mùa).
   3. Quanh nơi bắt đầu (trong 30 m) luôn có đủ: rau má, ngải cứu, bạc hà, quả mọng, đá lửa, đất sét. Thiếu thì đổi vài bụi cỏ tranh gần đó thành thứ còn thiếu.
   4. Nhiệm vụ chính: sống qua đêm đầu → DỰNG CĂN CỨ (bàn chế tác, san nền, sàn, vách, mái) → rồi mới tới thuốc men, săn bắn, giao thương, gốm, ruộng, đồng. */
/* ---- 1. ngày thật ---- */
function wcAge(){try{if(!S)return 1;const d=wcDayN();if(S.born==null||S.born>d)S.born=d;return Math.max(1,d-S.born+1);}catch(e){return 1;}}
{const _sl=sleep;sleep=function(){if(!S||G.sleeping)return _sl.apply(this,arguments);const d0=S.day,t0=S.tn;const r=_sl.apply(this,arguments);if(G.sleeping){const fix=()=>{if(!S)return;if(S.day>d0&&t0!=null&&Math.floor(t0+0.02)<=d0){S.day=d0;S.tn=Math.min(d0+0.999,Math.max(t0,S.tn-1));}};
      /* mã gốc cộng ngày lúc tỉnh dậy nếu đang buổi tối, mã đồng hồ cộng thêm nửa ngày công: gỡ cả hai */const iv=setInterval(()=>{if(!S||!G.sleeping){clearInterval(iv);fix();setTimeout(fix,300);}},200);setTimeout(fix,4400);setTimeout(fix,5200);}return r;};}
/* ---- 2. cây cỏ quanh năm ---- */
for(const t in RT)if(RT[t]&&RT[t].seasons){RT[t].ss0=RT[t].seasons;delete RT[t].seasons;}
/* ---- 3. vật liệu cơ bản gần nơi bắt đầu ---- */
{const _rg=resGen;resGen=function(seed){const r=_rg.apply(this,arguments);try{const sx=SPAWN[0],sz=SPAWN[1],want=[['centella',5],['mugwort',4],['berry',5],['mint',2],['flintRock',3],['clay',3],['flax',3]].filter(w=>RT[w[0]]);
    const nearL=[];for(const q of RES){const d=Math.hypot(q.x-sx,q.z-sz);if(d<620)nearL.push([d,q]);}nearL.sort((a,b)=>a[0]-b[0]||a[1].i-b[1].i);
    const pool=nearL.filter(([d,q])=>d>90&&!q.site&&(q.t==='tallgrass'||q.t==='fern'||q.t==='flowerY'||q.t==='flowerP')&&wdAt(q.x,q.z)<=0).map(e=>e[1]);let pi=0;
    for(const [t,n] of want){let have=nearL.filter(([d,q])=>q.t===t).length;while(have<n&&pi<pool.length){const q=pool[pi];pi+=3;/* nhảy cách để rải đều, không dồn một chỗ */q.t=t;q.s=(0.9+((q.i*37)%20)/100)*(RT[t].sc||1);q.hp=RT[t].hp;have++;}}}catch(e){console.warn('cơ bản',e);}return r;};}
/* ---- 4. dựng căn cứ trước ---- */
{const base=['Dựng bàn chế tác','San nền khu ở','Lát nền nhà 4 ô','Dựng 6 bức vách','Lợp 4 tấm mái'],at=GOALS.findIndex(g=>g.t==='Ngủ qua đêm đầu tiên');
  if(at>=0){const mv=base.map(t=>GOALS.find(g=>g.t===t)).filter(Boolean);if(mv.length===base.length){const rest=GOALS.filter(g=>!mv.includes(g)),k=rest.findIndex(g=>g.t==='Ngủ qua đêm đầu tiên')+1;mv.forEach(g=>g.e=1);GOALS.length=0;GOALS.push(...rest.slice(0,k),...mv,...rest.slice(k));}}
  // bản lưu có trước khi đổi thứ tự: đứng lại ở mục chưa xong đầu tiên theo thứ tự mới (không thưởng lại các mục đã qua)
  const _gc=goalCheck;goalCheck=function(){try{if(S&&S.gv!==2){S.gv=2;if(S.goal>0){let i=0;while(i<GOALS.length){const [v,n]=goalProg(GOALS[i]);if(v<n)break;i++;}if(i<S.goal)S.goal=i;}}}catch(e){}return _gc.apply(this,arguments);};}
