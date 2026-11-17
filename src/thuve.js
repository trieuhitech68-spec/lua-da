/* ===================== thuve: THÚ NUÔI, THÚ CƯỠI KHÔNG CÒN "MẤT TÍCH" =====================
   Người chơi báo: · xuống ngựa xong không biết ngựa ở đâu, không có dấu định vị nào;
                   · nuôi mấy con mà chỉ thấy một con; sói thuần xong để ở nhà rồi mất luôn.
   Nguyên nhân: · ngựa đứng chờ ở chỗ xuống, bản đồ không vẽ nó, không có cách gọi về;
                · thú thuần xong cứ quanh quẩn đúng chỗ bị thuần (ngoài rừng), không về làng;
                · thú đói quá 2,5 ngày là BỎ ĐI HẲN (kể cả lúc người chơi vắng mặt).
   Giờ: · ngựa, voi hiện biểu tượng trên bản đồ nhỏ (ở xa thì nằm sát mép, chỉ đúng hướng) và bản đồ lớn; bảng Thú cưỡi ghi cách bao xa, có nút "Gọi về";
        · vật nuôi tự về chuồng đúng loài, chưa có chuồng thì về quanh tâm làng; có nút "Gọi cả đàn về làng";
        · thú đói không bỏ đi nữa: chỉ ngừng đẻ, ngừng lớn cho tới khi được ăn. */
const TV={};
function tvDir(dx,dz){return ['Bắc','Đông Bắc','Đông','Đông Nam','Nam','Tây Nam','Tây','Tây Bắc'][((Math.round(Math.atan2(dx,-dz)/(Math.PI/4))%8)+8)%8];}
function tvFar(x,z){const d=Math.hypot(x-P.x,z-P.z);return d<60?'ngay cạnh bạn':'cách '+Math.max(1,Math.round(d/20))+' m về phía '+tvDir(x-P.x,z-P.z);}
/* ---------- vật nuôi: chỗ ở đúng ---------- */
function tvHome(p){try{const sp=(typeof CTU==='object'&&CTU.AD[p.k])||p.k,rx=typeof CTU==='object'&&CTU.HOME[sp];let best=null,bd=1e9;
    if(rx)for(const b of S.builds){if(b.remote||b.prog!=null||!rx.test(b.k))continue;const d=Math.hypot(b.x-p.x,b.z-p.z);if(d<bd){bd=d;best=b;}}
    if(best)return {x:best.x,z:best.z,shed:1};const h=typeof homePos==='function'?homePos():null;if(!h)return null;const c=typeof cdCenter==='function'?cdCenter():h;return {x:c.x,z:c.z};}catch(e){return null;}}
function tvFollow(p){return (p.k==='dog'||p.k==='puppy')&&!p.stay;}
function tvGather(force){let moved=0;try{for(const p of S.pets||[]){if(tvFollow(p))continue;const h=tvHome(p);if(!h)continue;const lim=h.shed?150:280;
      if(p.hx==null||Math.hypot(p.hx-h.x,p.hz-h.z)>lim){const a=Math.random()*6.283,r=h.shed?24+Math.random()*50:70+Math.random()*110;let x=h.x+Math.cos(a)*r,z=h.z+Math.sin(a)*r;try{if(hAt(x,z)<2||wdAt(x,z)>0){x=h.x;z=h.z;}}catch(e){}p.hx=+x.toFixed(1);p.hz=+z.toFixed(1);p._tx=p.hx;p._tz=p.hz;}
      const dH=Math.hypot(p.x-p.hx,p.z-p.hz);if(dH>300&&(force||Math.hypot(p.x-P.x,p.z-P.z)>450)){p.x=p.hx;p.z=p.hz;p._tx=p.hx;p._tz=p.hz;if(p._o)p._o.position.set(p.x,hAt(p.x,p.z),p.z);moved++;}}}catch(e){}return moved;}
function tvStray(){let n=0;try{for(const p of S.pets||[]){if(tvFollow(p))continue;const h=tvHome(p);if(h&&Math.hypot(p.x-h.x,p.z-h.z)>420)n++;}}catch(e){}return n;}
{const _ph=petsHourly;petsHourly=function(gh){try{if(S&&S.pets){const day=TNOW();for(const p of S.pets)if(day-(p.fed||0)>2.4)p.fed=day-2.4;}}catch(e){}const r=_ph.apply(this,arguments);try{tvGather(false);}catch(e){}return r;};}
{const _pi=petsInit;petsInit=function(){const r=_pi.apply(this,arguments);try{tvGather(false);}catch(e){}return r;};}
/* ---------- thú cưỡi: gọi về ---------- */
function tvFree(m){return m&&G.mnt!==m&&m.sol==null&&(m.land||'c')===((S&&S.land)||'c')&&m.x!=null;}
function tvCall(m){if(!m)return;if(G.mnt===m){uiToast('Bạn đang cưỡi nó rồi.','');return;}if(m.sol!=null){uiToast('Con này đang cấp cho lính. Thu lại từ lính trước đã.','bad');return;}if((m.land||'c')!==((S&&S.land)||'c')){uiToast('Nó đang ở vùng đất khác, phải qua cổng sang đó mới gọi được.','bad');return;}
  let x=P.x-Math.sin(P.ry||0)*46,z=P.z-Math.cos(P.ry||0)*46;try{const c=collide(x,z);x=c[0];z=c[1];if(hAt(x,z)<1.5||wdAt(x,z)>30){x=P.x+20;z=P.z+20;}}catch(e){}
  m.x=+x.toFixed(1);m.z=+z.toFixed(1);m.ry=P.ry||0;const o=typeof MT==='object'&&MT.o.get(m.id);if(o)o.position.set(m.x,hAt(m.x,m.z),m.z);else{try{mtShow(m);}catch(e){}}
  try{sfx('bark');}catch(e){}try{puff(m.x,hAt(m.x,m.z)+14,m.z,'#ffd27a',8);}catch(e){}uiToast((m.k==='elephant'?'🐘 ':'🐎 ')+esc(m.n||'Thú cưỡi')+' nghe tiếng gọi, đã chạy về đứng sau lưng bạn.','gold');save();}
{const _mo=mtOff;mtOff=function(q){const r=_mo.apply(this,arguments);try{if(!q&&!TV.told){TV.told=1;uiToast('📍 Ngựa hiện biểu tượng 🐎 trên bản đồ nhỏ. Lạc thì mở Nhân vật → 🐾 → Thú cưỡi → Gọi về.','');}}catch(e){}return r;};}
if(typeof ctMountHtml==='function'){const _h=ctMountHtml;ctMountHtml=function(){let s=_h.apply(this,arguments);try{const L=(S.mounts||[]).filter(tvFree);if(L.length)s=`<div class="tv-box">${L.map(m=>`<div class="tv-r"><span>${m.k==='elephant'?'🐘':'🐎'} <b>${esc(m.n||'Thú cưỡi')}</b> <small>${tvFar(m.x,m.z)}</small></span><button class="btn sm" data-a="tvcall" data-k="${m.id}">📯 Gọi về</button></div>`).join('')}</div>`+s;}catch(e){}return s;};}
if(typeof ctPetHtml==='function'){const _h=ctPetHtml;ctPetHtml=function(){let s=_h.apply(this,arguments);try{if((S.pets||[]).length){const n=tvStray(),hp=typeof homePos==='function'&&homePos();
      s=`<div class="tv-box"><div class="tv-r"><span>${!hp?'📍 Chưa có làng (bếp lửa hoặc chỗ ngủ): thú ở quanh chỗ được thuần.':n?`📍 <b>${n}</b> con đang ở xa làng`:'📍 Cả đàn đang ở quanh làng, hiện chấm trắng trên bản đồ nhỏ'}</span>${hp?`<button class="btn sm${n?'':' ghost'}" data-a="tvpets">📯 Gọi cả đàn về làng</button>`:''}</div><p class="small muted">Thú đói không bỏ đi nữa, chỉ ngừng đẻ và ngừng lớn tới khi được ăn. Chó đang "đi theo" thì luôn theo sát bạn.</p></div>`+s;}}catch(e){}return s;};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="tvcall"],[data-a="tvpets"]');if(!b||!S)return;e.stopImmediatePropagation();
  if(b.dataset.a==='tvcall')tvCall((S.mounts||[]).find(m=>String(m.id)===b.dataset.k));else{const n=tvGather(true);uiToast(n?`📯 Đã gọi ${n} con về làng.`:'Cả đàn đã ở quanh làng rồi.',n?'gold':'');try{sfx('bark');}catch(er){}save();}
  try{if(typeof H4==="object"&&H4.on&&typeof h4Draw==="function")h4Draw(true);else if(G.panel)uiOpenRefresh();}catch(er){}},true);
/* ---------- dấu trên bản đồ nhỏ và bản đồ lớn ---------- */
{const _mt=miniTick;miniTick=function(){const t0=G.miniT;_mt.apply(this,arguments);try{if(G.miniT===t0)return;const L=(S.mounts||[]).filter(tvFree);if(!L.length)return;const cv=$('#mini');if(!cv)return;const pr=Math.min(2,devicePixelRatio||1),W=cv.clientWidth||130,sc=W/1800,c=cv.getContext('2d');c.save();c.setTransform(pr,0,0,pr,0,0);c.font='13px system-ui';c.textAlign='center';c.textBaseline='middle';
      for(const m of L){let a=W/2+(m.x-P.x)*sc,b=W/2+(m.z-P.z)*sc;const d=Math.hypot(a-W/2,b-W/2),mx=W/2-9;if(d>mx){a=W/2+(a-W/2)/d*mx;b=W/2+(b-W/2)/d*mx;}c.fillText(m.k==='elephant'?'🐘':'🐎',a,b);}c.restore();}catch(e){}};}
{const _md=mapDraw;mapDraw=function(){_md.apply(this,arguments);try{const cv=$('#mapcv');if(!cv||!S)return;const pr=Math.min(2,devicePixelRatio||1),W=cv.width/pr,V=mapView(),c=cv.getContext('2d');c.save();c.setTransform(pr,0,0,pr,0,0);c.textAlign='center';c.textBaseline='middle';const sx=x=>(x-V.x0)/V.span*W,sy=z=>(z-V.z0)/V.span*W;
      c.fillStyle='#fff';c.strokeStyle='rgba(0,0,0,.6)';c.lineWidth=1;for(const p of S.pets||[]){const a=sx(p.x),b=sy(p.z);if(a<0||b<0||a>W||b>W)continue;c.beginPath();c.arc(a,b,2.4,0,7);c.fill();c.stroke();}
      c.font='16px system-ui';for(const m of (S.mounts||[]).filter(tvFree)){const a=sx(m.x),b=sy(m.z);if(a<-8||b<-8||a>W+8||b>W+8)continue;c.fillText(m.k==='elephant'?'🐘':'🐎',a,b);}c.restore();}catch(e){}};}
(function(){try{const st=document.createElement('style');st.textContent='.tv-box{background:rgba(255,210,122,.08);border:1px solid rgba(255,210,122,.25);border-radius:10px;padding:6px 8px;margin:0 0 8px}.tv-r{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:3px 0}.tv-r span{min-width:0;font-size:13px}.tv-r small{opacity:.75;margin-left:4px}.tv-r .btn{flex:none}.tv-box p{margin:4px 0 0}';document.head.appendChild(st);}catch(e){}})();
