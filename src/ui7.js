/* ===================== ui7: NÚT TẤN CÔNG · NÚT THU PHỤC · MỤC NHÂN VẬT TRÊN THANH CHÍNH =====================
   - ⚔️ Tấn công (luôn có trong cụm nút tay phải): tự tìm kẻ địch / thú gần nhất trong 20 m, tự cầm vũ khí mạnh nhất, tự áp sát rồi đánh.
     Trước đây muốn đánh phải ngắm đúng mục tiêu để nút "Nhặt" đổi thành "Đánh".
   - 🪢 Thu phục (chỉ hiện khi có thể): chiến binh đã yếu (dưới 40% máu) khi mình có dây thừng + giường trống → trói bắt ngay;
     thú thuần được (gà rừng, lợn rừng, sói) ở gần → cho ăn để thuần, báo rõ cần thức ăn gì nếu chưa có.
   - Thanh chính: 🎒 Túi · 🛠️ Chế tạo · 🏠 Xây · 🧍 Nhân vật (trước nằm trong ☰ với tên "Cơ thể"). Bảng đổi tên thành "Nhân vật".
   (Bảng Chế tạo đã có sẵn ô tìm và hàng lọc Đồ ăn / Dụng cụ / Vũ khí… của craft5.js nên không thêm hàng lọc nữa.) */
const U7={t:0,cap:null};
/* ---------- tấn công ---------- */
function u7Enemy(r){let best=null,bd=r;for(const f of (G.foes||[])){if(!f.alive)continue;const d=Math.hypot(f.x-P.x,f.z-P.z)-(f.r||9);if(d<bd){bd=d;best=f;}}
  for(const a of (G.animals||[])){if(!a.alive||!a.o||!a.o.visible||(a.tame>0&&!a.angry))continue;/* con đang thuần dở: nút Đánh không nhắm vào */let d=Math.hypot(a.x-P.x,a.z-P.z)-(a.r||8);const D=ANIMALS[a.kind]||{};if(!a.angry&&D.aggro==='never')d+=120;/* ưu tiên thú dữ, kẻ địch hơn thú hiền */if(d<bd){bd=d;best=a;}}return best;}
function u7Attack(){if(!S||!G.on||G.sleeping)return;if(G.work){uiToast('Đang làm dở việc: đi chỗ khác hoặc làm xong đã.','');return;}if(G.sit&&typeof sitToggle==='function')sitToggle(false);
  const a=u7Enemy(400);if(!a){uiToast('Không có kẻ địch hay thú nào trong 20 m.','');sfx('no');return;}
  try{const w=typeof m3BestW==='function'?m3BestW():null;if(w&&ITEMS[w]&&ITEMS[w].tool)selectTool(ITEMS[w].tool);else{const k=hasTool('spear')||hasTool('club')||hasTool('knife')||hasTool('axe');if(k)selectTool(ITEMS[k].tool);}}catch(e){}
  const t={type:'animal',a},d=Math.hypot(a.x-P.x,a.z-P.z);P.ry=Math.atan2(a.x-P.x,a.z-P.z);
  if(d>REACH+(a.r||8)){G.act=null;G.walkTo={x:a.x,z:a.z,t,t0:G.t};}else{G.walkTo=null;G.act={t,next:0,n:0};}sfx('pick');}
/* ---------- thu phục ---------- */
function u7CapFind(){if(!S||!G.on)return null;let best=null,bd=110;
  if(typeof danS==='function'&&danS().on)for(const f of (G.foes||[])){if(!f.alive)continue;if(!f._hm||f.hp>f._hm)f._hm=f.hp;const d=Math.hypot(f.x-P.x,f.z-P.z);if(d<bd&&f.hp<=f._hm*0.4){bd=d;best={k:'foe',f};}}
  if(typeof TAME==='object')for(const a of (G.animals||[])){if(!a.alive||!TAME[a.kind]||!a.o||!a.o.visible)continue;const d=Math.hypot(a.x-P.x,a.z-P.z);if(d<Math.min(bd,90)){bd=d;best={k:'tame',a};}}return best;}
function u7Capture(){const c=u7CapFind();if(!c)return;
  if(c.k==='foe'){if(invCount('rope')<1){uiToast('Cần Dây thừng để trói (chế tạo từ 4 sợi cỏ).','bad');sfx('no');return;}if(!freeBed()){uiToast('Cần còn giường trống ở nhà mới bắt về được.','bad');sfx('no');return;}foeDamage(c.f,99999);return;}
  const a=c.a,T=TAME[a.kind],f=tameFood(a.kind);if(!f){uiToast(`Muốn thuần ${T.n} cần mang: ${T.food.map(x=>ITEMS[x]?ITEMS[x].n.toLowerCase():x).join(', ')}.`,'bad');sfx('no');return;}
  if(Math.hypot(a.x-P.x,a.z-P.z)>REACH+(a.r||8)+10){G.walkTo={x:a.x,z:a.z,t:{type:'animal',a},t0:G.t};uiToast('Lại gần nhẹ nhàng… (lom khom thì thú đỡ sợ)','');return;}tameFeed(a);}
function u7Btns(){const acts=document.querySelector('#game .acts');if(!acts)return;
  if(!document.getElementById('u7atk'))acts.insertAdjacentHTML('afterbegin','<button id="u7atk" class="rbtn sm u7atk" aria-label="Tấn công">⚔️<i>Đánh</i></button><button id="u7cap" class="rbtn sm u7cap" aria-label="Thu phục" hidden>🪢<i>Thu phục</i></button>');
  const cb=document.getElementById('u7cap'),c=u7CapFind();if(cb){cb.hidden=!c;if(c){const lb=c.k==='foe'?'Trói bắt':'Thuần',ic=c.k==='foe'?'🪢':'🤝';if(cb.dataset.l!==lb){cb.dataset.l=lb;cb.innerHTML=ic+'<i>'+lb+'</i>';}}}}
setInterval(()=>{try{if(G.on&&S)u7Btns();}catch(e){}},350);
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('#u7atk,#u7cap');if(!b)return;e.stopImmediatePropagation();e.preventDefault();if(b.id==='u7atk')u7Attack();else u7Capture();},true);
addEventListener('keydown',e=>{if(!S||!G.on||G.panel||e.repeat||/INPUT|TEXTAREA/.test((e.target&&e.target.tagName)||''))return;if(e.code==='KeyG')u7Attack();else if(e.code==='KeyT')u7Capture();});
/* ---------- thanh chính + tên bảng ---------- */
if(typeof UI5_MAIN!=='undefined'&&!UI5_MAIN.includes('l4'))UI5_MAIN.push('l4');
setInterval(()=>{try{const b=document.querySelector('#menu [data-ui="l4"]');if(b){const i=b.querySelector('i');if(i&&i.textContent!=='Nhân vật'){i.textContent='Nhân vật';b.setAttribute('aria-label','Nhân vật');}}}catch(e){}},1500);
{const _uo=uiOpen;uiOpen=function(k,o,keep){const r=_uo.apply(this,arguments);try{if(G.panel==='l4'){const h=document.querySelector('#panel .p-head h2');if(h)h.textContent='Nhân vật';}}catch(e){}return r;};}
{const st=document.createElement('style');st.textContent=`#game .acts .u7atk{border-color:rgba(255,120,90,.75);background:rgba(150,40,24,.55)}#game .acts .u7cap{border-color:rgba(242,197,90,.9);background:rgba(120,84,20,.6)}`;document.head.appendChild(st);}
