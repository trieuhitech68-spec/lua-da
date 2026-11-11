/* ===================== BỎ ĐỒ NHANH · KỸ NĂNG CHỦ ĐỘNG · CỤM NÚT HAI TRANG =====================
   1. Bỏ đồ: Bỏ 1 / Bỏ nửa / Bỏ hết; bỏ xong vẫn giữ ô đang chọn (trước đây mỗi lần bỏ 1 cái lại phải chọn lại).
   2. Kỹ năng chủ động mở theo cấp nhân vật (học tự động khi đủ cấp, báo một lần):
        cấp 3  💥 Đòn mạnh      : đòn kế tiếp gây ×2,5 sát thương            (15 thể lực, hồi 8 giây)
        cấp 4  💨 Bứt tốc       : chạy nhanh hơn 60% trong 5 giây             (12 thể lực, hồi 20 giây)
        cấp 6  📣 Hiệu triệu    : gọi mọi người nhà trong 60 m tới đánh cùng, họ đánh mạnh +50% trong 15 giây (hồi 45 giây)
        cấp 8  🩹 Băng bó nhanh : hồi 30 máu, cầm máu                          (tốn 2 sợi cỏ, hồi 60 giây)
        cấp 10 🦁 Gầm thét      : thú dữ và chiến binh trong 15 m hoảng sợ bỏ chạy 6 giây (20 thể lực, hồi 40 giây)
        cấp 15 🌀 Quét vòng     : đánh mọi kẻ địch quanh mình trong 5 m       (25 thể lực, hồi 15 giây)
   3. Cụm nút tay phải có HAI TRANG: nút ⇄ (hoặc vuốt ngang trên cụm nút) đổi giữa trang Hành động (Khom, Ngồi, Ném, Chạy, Nhảy…)
      và trang Kỹ năng (các kỹ năng đã học, có vòng hồi chiêu; kèm các nút ít dùng: Cử chỉ, Chế nhanh, Tự đi). Nút Hành động to, nút Đánh luôn hiện ở cả hai trang. Máy tính: phím Z X C V B N. */
const KN={cd:{},pow:0,rally:0,dash:0,page:0};
const KNS=[
 {id:'pow',lv:3,ic:'💥',n:'Đòn mạnh',d:'Đòn kế tiếp gây ×2,5 sát thương.',st:15,cd:8,key:'KeyZ'},
 {id:'dash',lv:4,ic:'💨',n:'Bứt tốc',d:'Chạy nhanh hơn 60% trong 5 giây.',st:12,cd:20,key:'KeyX'},
 {id:'rally',lv:6,ic:'📣',n:'Hiệu triệu',d:'Người nhà trong 60 m xông tới đánh cùng, mạnh +50% trong 15 giây.',st:0,cd:45,key:'KeyC'},
 {id:'heal',lv:8,ic:'🩹',n:'Băng bó',d:'Hồi 30 máu, cầm máu. Tốn 2 sợi cỏ.',st:0,cd:60,key:'KeyN'},
 {id:'roar',lv:10,ic:'🦁',n:'Gầm thét',d:'Thú dữ, chiến binh trong 15 m hoảng sợ bỏ chạy 6 giây.',st:20,cd:40,key:'KeyB'},
 {id:'spin',lv:15,ic:'🌀',n:'Quét vòng',d:'Đánh mọi kẻ địch trong 5 m quanh mình.',st:25,cd:15,key:'KeyH'}];
const knLv=()=>typeof heroLv==='function'?heroLv():1;
const knHas=k=>knLv()>=k.lv;
function knUse(id){const k=KNS.find(x=>x.id===id);if(!k||!S||!G.on||G.sleeping)return;if(!knHas(k)){uiToast(`${k.n}: học được khi nhân vật đạt cấp ${k.lv}.`,'');return;}const left=(KN.cd[id]||0)-G.t;if(left>0){uiToast(`${k.n} còn hồi ${Math.ceil(left)} giây.`,'');return;}
  if(S.p.stam<k.st){uiToast('Không đủ thể lực.','bad');sfx('no');return;}
  if(id==='heal'){if(invCount('fiber')<2){uiToast('Cần 2 sợi cỏ để băng bó.','bad');sfx('no');return;}invTake('fiber',2);S.p.hp=Math.min(100,S.p.hp+30);try{delete S.st.bleed;}catch(e){}uiHotbar();}
  else if(id==='pow'){KN.pow=G.t+10;}
  else if(id==='dash'){KN.dash=G.t+5;}
  else if(id==='rally'){KN.rally=G.t+15;let n=0;for(const f of (S.folk||[])){if(Math.hypot(f.x-P.x,f.z-P.z)<1200){f.x=P.x+(Math.random()-0.5)*90;f.z=P.z+(Math.random()-0.5)*90;f._t=0;n++;}}if(!n){uiToast('Không có người nhà nào trong 60 m.','');return;}}
  else if(id==='roar'){let n=0;for(const a of (G.animals||[])){if(a.alive&&!a.boss&&Math.hypot(a.x-P.x,a.z-P.z)<300){a.angry=false;a.state='flee';a.tt=6;a.calm=G.t+6;const an=Math.atan2(a.x-P.x,a.z-P.z);a.tx=a.x+Math.sin(an)*400;a.tz=a.z+Math.cos(an)*400;n++;}}for(const f of (G.foes||[])){if(f.alive&&Math.hypot(f.x-P.x,f.z-P.z)<300){f.knScare=G.t+6;n++;}}try{for(let i=0;i<10;i++)puff(P.x+(Math.random()-0.5)*90,P.y+20,P.z+(Math.random()-0.5)*90,'#fff2c0',4);}catch(e){}}
  else if(id==='spin'){const d=(typeof fistPow==='function'?fistPow():1)*(1+0.06*skLv('hunt'))*1.6;let n=0;for(const a of (G.animals||[]).slice())if(a.alive&&a.o&&a.o.visible&&Math.hypot(a.x-P.x,a.z-P.z)<100+(a.r||8)){animalDamage(a,d);n++;}for(const f of (G.foes||[]).slice())if(f.alive&&Math.hypot(f.x-P.x,f.z-P.z)<100+(f.r||9)){foeDamage(f,d);n++;}G.punchT=0.4;try{for(let i=0;i<8;i++){const an=i/8*6.283;puff(P.x+Math.sin(an)*60,P.y+18,P.z+Math.cos(an)*60,'#ffd27a',3);}}catch(e){}}
  S.p.stam=Math.max(0,S.p.stam-k.st);KN.cd[id]=G.t+k.cd;sfx(id==='heal'?'eat':'level');try{uiFloat(k.ic+' '+k.n,P.x,P.y+52,P.z,'#ffd27a');}catch(e){}uiHud(true);knUi(true);}
/* ---------- tác dụng ---------- */
{const k=()=>{if(KN.pow>G.t){KN.pow=0;try{uiFloat('💥',P.x,P.y+56,P.z,'#ff8a5a');}catch(e){}return 2.5;}return 1;};const _ad=animalDamage;animalDamage=function(a,dmg){return _ad(a,G.punchT>0.35&&KN.pow<=0?dmg:dmg*k());};const _fd=foeDamage;foeDamage=function(f,dmg){return _fd(f,dmg*k());};}
{const _mv=move;move=function(dx,dz,m,dt,run){return _mv(dx,dz,m*(KN.dash>G.t?1.6:1),dt,run);};}
if(typeof danDmg==='function'){const _dd=danDmg;danDmg=function(f){return _dd(f)*(KN.rally>G.t?1.5:1);};}/* hiệu triệu: người nhà đánh mạnh hơn */
{const _ft=foesTick;foesTick=function(dt){if(G.foes)for(const f of G.foes){if(f.knScare>G.t&&f.alive){const an=Math.atan2(f.x-P.x,f.z-P.z);f.x+=Math.sin(an)*130*dt;f.z+=Math.cos(an)*130*dt;f.atkT=1;}}return _ft.apply(this,arguments);};}
/* ---------- học kỹ năng: báo một lần ---------- */
setInterval(()=>{try{if(!S||!G.on)return;if(!S.kn||typeof S.kn!=='object')S.kn={};for(const k of KNS)if(knHas(k)&&!S.kn[k.id]){S.kn[k.id]=1;if(G.t>8)uiToast(`✨ Học được kỹ năng ${k.ic} ${k.n}: ${k.d} Bấm ⇄ ở cụm nút để sang trang Kỹ năng.`,'gold');}knUi(false);}catch(e){}},500);
/* ---------- cụm nút hai trang ---------- */
function knUi(force){const acts=document.querySelector('#game .acts');if(!acts)return;
  if(!document.getElementById('knSw')){acts.insertAdjacentHTML('beforeend','<button id="knSw" class="rbtn sm kn-sw" aria-label="Đổi trang nút">⇄<i>Kỹ năng</i></button>');KNS.forEach(k=>acts.insertAdjacentHTML('beforeend',`<button class="rbtn kn-b" data-kn="${k.id}" aria-label="${k.n}"><span>${k.ic}</span><i>${k.n}</i><em></em></button>`));}
  acts.classList.toggle('kn-p2',KN.page===1);const sw=document.getElementById('knSw');const any=KNS.some(knHas);sw.hidden=false;const lb=KN.page?'Hành động':'Kỹ năng';if(sw.dataset.l!==lb){sw.dataset.l=lb;sw.innerHTML='⇄<i>'+lb+'</i>';}sw.classList.toggle('kn-new',any&&!KN.page&&!S.knSeen);
  acts.querySelectorAll('.kn-b').forEach(b=>{const k=KNS.find(x=>x.id===b.dataset.kn),has=knHas(k),left=Math.max(0,(KN.cd[k.id]||0)-G.t),em=b.querySelector('em');b.classList.toggle('kn-lock',!has);b.classList.toggle('kn-cd',left>0);const t=!has?'cấp '+k.lv:left>0?String(Math.ceil(left)):'';if(em.textContent!==t)em.textContent=t;b.classList.toggle('on',(k.id==='pow'&&KN.pow>G.t)||(k.id==='dash'&&KN.dash>G.t)||(k.id==='rally'&&KN.rally>G.t));});}
function knPage(p){KN.page=p==null?1-KN.page:p;if(KN.page&&S)S.knSeen=1;sfx('pick');knUi(true);}
document.addEventListener('click',e=>{const t=e.target&&e.target.closest&&e.target.closest('#knSw,.kn-b,[data-a="dropn"]');if(!t||!S)return;e.stopImmediatePropagation();e.preventDefault();
  if(t.id==='knSw'){knPage();return;}if(t.dataset.kn){knUse(t.dataset.kn);return;}
  const i=+t.dataset.i,s=S.inv[i];if(!s)return;const n=t.dataset.n==='all'?s.n:t.dataset.n==='half'?Math.ceil(s.n/2):1;s.n-=n;if(s.n<=0){S.inv[i]=null;G.selSlot=null;}sfx('pick');uiHotbar();uiOpenRefresh();save();},true);
// vuốt ngang trên cụm nút để đổi trang
{let sx=null;document.addEventListener('touchstart',e=>{const a=e.target&&e.target.closest&&e.target.closest('#game .acts');sx=a&&e.touches.length===1?e.touches[0].clientX:null;},{passive:true});
 document.addEventListener('touchend',e=>{if(sx==null)return;const dx=(e.changedTouches[0]||{}).clientX-sx;sx=null;if(Math.abs(dx)>70)knPage(dx<0?1:0);},{passive:true});}
addEventListener('keydown',e=>{if(!S||!G.on||G.panel||e.repeat||/INPUT|TEXTAREA/.test((e.target&&e.target.tagName)||''))return;const k=KNS.find(x=>x.key===e.code);if(k&&knHas(k))knUse(k.id);});
// bảng Nhân vật: danh sách kỹ năng chủ động
if(typeof heroHtml==='function'){const _hh=heroHtml;heroHtml=function(){let h=_hh.apply(this,arguments);try{const rows=KNS.map(k=>`<div class="h2-en${knHas(k)?'':' kn-off'}"><div class="h2-en-h"><span>${k.ic}</span><b>${k.n}</b></div><span class="small muted">${k.d}</span><span class="small">${knHas(k)?`Hồi ${k.cd} giây${k.st?' · '+k.st+' thể lực':''}`:`🔒 Học ở cấp ${k.lv}`}</span></div>`).join('');
  const i=h.indexOf('<h3>Chỉ số</h3>');const blk=`<h3>Kỹ năng chủ động</h3><p class="small muted">Tự học khi nhân vật đủ cấp. Dùng ở cụm nút tay phải: bấm ⇄ hoặc vuốt ngang để sang trang Kỹ năng.</p><div class="h2-ens">${rows}</div>`;h=i>0?h.slice(0,i)+blk+h.slice(i):h+blk;}catch(e){}return h;};}
{const st=document.createElement('style');st.textContent=`#game .acts .kn-b{display:none;position:relative}#game .acts .kn-b span{font-size:19px;line-height:1}#game .acts .kn-b em{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;border-radius:50%;font-style:normal;font-weight:800;font-size:12px;color:#fff;pointer-events:none}
#game .acts .kn-b.kn-cd em,#game .acts .kn-b.kn-lock em{background:rgba(10,6,4,.72)}#game .acts .kn-b.kn-lock em{font-size:9.5px;color:#cbb994}#game .acts .kn-b.on{border-color:#ffd27a;box-shadow:0 0 12px rgba(255,210,122,.8)}
#game .acts.kn-p2>.rbtn:not(.kn-b):not(#knSw):not(#u7atk):not(#u7cap):not(.actbtn):not(#m2emoBtn):not(#m3qc):not(#m3auto){display:none!important}#game .acts:not(.kn-p2)>#m2emoBtn,#game .acts:not(.kn-p2)>#m3qc,#game .acts:not(.kn-p2)>#m3auto{display:none!important}#game .acts.kn-p2>#m2emoBtn{grid-area:4/1!important}#game .acts.kn-p2>#m3qc{grid-area:4/2!important}#game .acts.kn-p2>#m3auto{grid-area:4/3!important}/* Cử chỉ, Chế nhanh, Tự đi dời sang trang 2 cho trang Hành động gọn */#game .acts.kn-p2 .kn-b{display:flex;width:46px;height:46px}
#game .acts.kn-p2 .kn-b[data-kn="pow"]{grid-area:1/2!important}#game .acts.kn-p2 .kn-b[data-kn="dash"]{grid-area:1/3!important}#game .acts.kn-p2 .kn-b[data-kn="rally"]{grid-area:1/4!important}#game .acts.kn-p2 .kn-b[data-kn="heal"]{grid-area:2/2!important}#game .acts.kn-p2 .kn-b[data-kn="roar"]{grid-area:3/2!important}#game .acts.kn-p2 .kn-b[data-kn="spin"]{grid-area:2/1!important}
#game .acts #knSw{grid-area:3/1!important;border-color:rgba(242,197,90,.7)}#game .acts #knSw.kn-new{box-shadow:0 0 0 2px #ff6a3a,0 0 12px #ff6a3a}#game .acts #u7atk{grid-area:1/1!important}#game .acts:not(.kn-p2) #u7cap{grid-area:2/1!important}#game .acts.kn-p2 #u7cap{display:none!important}
#game .acts .kn-b i{font-size:9px;white-space:nowrap}
.h2-en.kn-off{opacity:.5}body.building #knSw,body.building .kn-b{display:none!important}@media (pointer:fine){#game .acts .kn-b{display:none!important}}`;document.head.appendChild(st);}
// thông báo nổi không đè lên cụm nút (cụm nút giờ cao 4 hàng)
{const st=document.createElement('style');st.textContent='@media (max-width:600px){#game .toasts{bottom:calc(var(--u-sb,10px) + 338px)!important}}';document.head.appendChild(st);}
