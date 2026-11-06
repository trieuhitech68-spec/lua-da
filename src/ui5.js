/* ===== ui5: giao diện gọn cho điện thoại (HUD + bảng) =====
   Chỉ thêm CSS ghi đè và bọc hàm; không đổi logic trò chơi.
   - Token thiết kế chung (--u-*): bo góc, nền kính mờ, cỡ chữ, vùng chạm 44px.
   - Menu: hàng chính 🎒 🛠️ 🏠 + nút ☰ "Thêm" mở ngăn kéo chứa mọi nút còn lại
     (bản đồ, cơ thể, nhật ký, ghi chép, bộ tộc, cài đặt, dừng… kể cả nút do mô-đun sau thêm vào).
     Máy tính màn rộng: mọi nút hiện thẳng hàng, không cần ☰.
   - Bảng (#panel): điện thoại dọc = tấm trượt từ dưới lên; điện thoại ngang = tấm bên trái;
     máy tính = hộp giữa màn hình dưới hàng menu. Mở/đóng chỉ dùng transform/opacity (≤170ms).
     Đóng bằng: ✕, chạm ra ngoài (lớp mờ #ui5scrim), vuốt xuống ở đầu bảng, nút Back của máy, Esc.
   - CHỪA CHỖ NÚT MIC (.hud-mic): ô bám phải, nằm ngay TRÊN cụm nút hành động .acts
     (cách 10px), rộng tối đa 100px, cao 56px. Vị trí đáy tính sẵn vào biến
     --ui5-mic-b (px tính từ đáy màn hình) và cạnh phải --ui5-mic-r; voice.js (vcPlace) cũng tự đặt
     #vcbox đúng ô này. Không nút nào khác của ui5 được đặt vào ô đó (nút leo trèo .m3btn đã dời sang trái cụm nút).
*/
const UI5={dr:false,hist:0,popIgn:0,drag:null};
function ui5Css(){let s=document.getElementById('ui5css');if(!s){s=document.createElement('style');s.id='ui5css';s.textContent=UI5CSS;}document.head.appendChild(s);}
const UI5CSS=`
:root{--u-glass:rgba(22,15,10,.62);--u-glass2:rgba(30,21,14,.97);--u-bd:rgba(242,197,90,.22);--u-bd2:rgba(242,197,90,.55);--u-r:14px;--u-r2:10px;--u-tap:44px;
 --u-sh:0 6px 18px rgba(0,0,0,.35);--u-blur:blur(8px) saturate(1.15);--u-fs1:10.5px;--u-fs2:12px;--u-fs3:13.5px;--u-fs4:16px;--u-ease:cubic-bezier(.2,.8,.2,1);
 --u-st:max(10px,env(safe-area-inset-top));--u-sr:max(10px,env(safe-area-inset-right));--u-sb:max(10px,env(safe-area-inset-bottom));--u-sl:max(10px,env(safe-area-inset-left));
 --ui5-mini:100px;--ui5-mic-r:12px;--ui5-mic-b:300px}
/* ---- kính mờ thống nhất ---- */
#game .hud,#game .goal,#game .compass,#game .hot,#game .menu>button,#game .ui5-more,#game .rbtn,#game .toast{background:var(--u-glass);border:1px solid var(--u-bd);-webkit-backdrop-filter:var(--u-blur);backdrop-filter:var(--u-blur);box-shadow:var(--u-sh)}
#game .hud{left:var(--u-sl);top:var(--u-st);border-radius:var(--u-r)}
#game .goal{left:var(--u-sl);border-radius:var(--u-r2)}
#game .h-time{font-variant-numeric:tabular-nums}
.au-gb{position:relative;min-height:28px}.au-gb::after{content:"";position:absolute;inset:-8px -4px}
/* ---- bản đồ nhỏ ---- */
#game .mini{right:var(--u-sr);top:var(--u-st);width:var(--ui5-mini);height:var(--ui5-mini);border:2px solid var(--u-bd2);box-shadow:var(--u-sh)}
/* ---- menu: hàng chính + ngăn kéo ☰ ---- */
#game .menu{z-index:9;right:var(--u-sr);display:flex;gap:6px;align-items:flex-start}
#game .menu>button{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;width:var(--u-tap);min-width:var(--u-tap);height:var(--u-tap);min-height:var(--u-tap);padding:0;border-radius:13px;color:var(--fg)}
#game .menu>button span{font-size:19px;line-height:1;padding:0}#game .menu>button i{display:none;font-style:normal;font-size:var(--u-fs1);font-weight:700;color:#e8d6b4;white-space:nowrap}
#game .menu>button:active{transform:scale(.94)}
#game .menu>button.ui5-mb.on{border-color:var(--acc);background:rgba(242,197,90,.22)}
#game .menu>button.ui5-mb.dot::after{content:"";position:absolute;top:5px;right:6px;width:9px;height:9px;border-radius:50%;background:#ff6a3a;box-shadow:0 0 6px #ff6a3a}
#game .ui5-more{position:absolute;z-index:1;display:grid;grid-template-columns:repeat(3,74px);gap:6px;padding:8px;border-radius:16px;background:var(--u-glass2);border-color:var(--u-bd2);
 opacity:0;visibility:hidden;transform:scale(.94);transition:opacity 140ms var(--u-ease),transform 140ms var(--u-ease),visibility 0s 140ms;pointer-events:none}
#game .menu.ui5-open{z-index:15}
#game .menu.ui5-open .ui5-more{opacity:1;visibility:visible;transform:none;transition:opacity 140ms var(--u-ease),transform 140ms var(--u-ease);pointer-events:auto}
#game .ui5-more>button{position:relative;width:auto;min-width:0;height:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-height:60px;padding:6px 2px;border-radius:12px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.05);color:var(--fg)}
#game .ui5-more>button span{font-size:21px;line-height:1;padding:0}#game .ui5-more>button i{display:block;font-style:normal;font-size:11.5px;font-weight:700;color:#e8d6b4;white-space:nowrap}
#game .ui5-more>button:active{background:rgba(242,197,90,.2)}#game .ui5-more>button *{pointer-events:none}
#game .ui5-more .mp-dot{position:absolute;top:5px;right:8px}
/* bố cục mặc định (máy tính bảng, điện thoại ngang): hàng ngang bên trái bản đồ nhỏ, ngăn kéo thả xuống */
#game .menu{top:var(--u-st);right:calc(var(--u-sr) + var(--ui5-mini) + 8px);flex-direction:row}
#game .ui5-more{top:calc(100% + 8px);right:0;transform-origin:100% 0}
/* ---- điện thoại dọc ---- */
@media (max-width:600px){
 :root{--ui5-mini:96px}
 #game .hud{width:min(178px,48vw)}
 #game .menu{top:calc(var(--u-st) + var(--ui5-mini) + 8px);right:var(--u-sr);flex-direction:column}
 #game .ui5-more{top:auto;bottom:0;right:calc(100% + 8px);transform-origin:100% 100%}
 #game .compass{width:150px;height:24px}
 #game .hot{left:var(--u-sl);right:var(--u-sr);bottom:var(--u-sb)}
 #game .hs{height:46px}
 #game .toasts{top:auto;left:var(--u-sl);right:auto;transform:none;bottom:calc(var(--u-sb) + 238px);width:auto;max-width:calc(100vw - 130px);align-items:flex-start}#game .toast{text-align:left}
 body.pan #game .menu{z-index:6}
}
/* ---- điện thoại ngang ---- */
@media (max-height:500px) and (orientation:landscape){
 :root{--ui5-mini:84px}
 #game .hud{width:200px}
 #game .menu{top:var(--u-st)}
 #game .compass{top:var(--u-st);bottom:auto;left:calc(50% - 60px);transform:translateX(-50%);width:200px}
 #game .toasts{top:calc(var(--u-st) + 34px);left:calc(var(--u-sl) + 212px);transform:none;width:calc(100vw - 560px);min-width:220px;align-items:flex-start}
 #game .hot{bottom:max(6px,env(safe-area-inset-bottom))}
 #game .hot .hs{width:44px;height:44px}
}
/* ---- máy tính màn rộng: mọi nút hiện thẳng hàng, có chữ ---- */
@media (pointer:fine) and (min-width:1000px) and (min-height:560px){
 :root{--ui5-mini:128px}
 #game .menu{right:var(--u-sr);top:var(--u-st)}
 #game .menu>button{width:auto;min-width:58px;height:56px;padding:4px 6px 3px;gap:3px}#game .menu>button i{display:block}
 #game .ui5-more{display:contents;opacity:1;visibility:visible;transform:none;transition:none;pointer-events:auto}
 #game .compass{left:calc(50% - 130px)}
 #game .ui5-more>button{flex-direction:column;min-height:0;width:auto;min-width:58px;height:56px;padding:4px 6px 3px;border-radius:13px;background:var(--u-glass);border:1px solid var(--u-bd);box-shadow:var(--u-sh)}
 #game .ui5-more>button span{font-size:19px}#game .ui5-more>button i{font-size:var(--u-fs1)}
 #game .menu>button.ui5-mb{display:none}
 #game .mini{top:calc(var(--u-st) + 64px)}
 #game .hud{width:212px;padding:8px 10px}#game .h-id b{font-size:13px}#game .h-id span{font-size:11px}#game .h-time{font-size:12px}#game .bar span{font-size:11px;width:15px}#game .bar i{height:5px}
 #game .goal{max-width:212px}#game .goal b{font-size:12.5px}#game .goal .g-k{font-size:10.5px}
}
/* ---- cụm nút hành động (tay phải) ----
   cột 1 = nút theo ngữ cảnh do mô-đun khác chèn vào (Chế nhanh, Né, Đỡ, Tự đi…) tự xếp dọc;
   cột 2 = Ném/Chạy/Nhảy; hàng 1 cột 3-4 = Khom/Ngồi; nút Hành động lớn chiếm góc dưới phải. */
#game .acts{right:var(--u-sr);gap:8px;grid-template-columns:44px 50px 44px 44px;grid-template-rows:44px 50px 50px;grid-auto-rows:44px;align-items:center;justify-items:center}
#game #throwBtn{grid-area:1/2}#game #sneakBtn{grid-area:1/3}#game #sitBtn{grid-area:1/4}#game #runBtn{grid-area:2/2}#game #jumpBtn{grid-area:3/2}
#game .acts>.rbtn:not(#throwBtn):not(#sneakBtn):not(#sitBtn):not(#runBtn):not(#jumpBtn):not(#edBtn){grid-column:1;width:44px;height:44px;font-size:17px}
#game .acts .actbtn{grid-area:2/3/4/5;width:84px;height:84px}
#game .acts .rbtn{width:50px;height:50px;color:var(--fg)}#game .acts .rbtn.sm{width:44px;height:44px;font-size:17px}#game .acts .rbtn i{font-size:10px;white-space:nowrap}
#game .acts .rbtn.on{border-color:var(--acc);background:rgba(242,197,90,.28)}
#game .acts #edBtn{top:-54px;left:0}
#game .acts .m3btn{right:calc(100% + 10px);left:auto;top:0;bottom:auto}
@media (max-width:600px){#game .acts{bottom:calc(var(--u-sb) + 62px)}}
@media (max-height:500px) and (orientation:landscape){#game .acts{grid-template-columns:40px 44px 40px 40px;grid-template-rows:40px 44px 44px;grid-auto-rows:40px;gap:6px;bottom:calc(max(6px,env(safe-area-inset-bottom)) + 4px)}#game .acts .rbtn{width:44px;height:44px}#game .acts .rbtn.sm,#game .acts>.rbtn:not(#throwBtn):not(#sneakBtn):not(#sitBtn):not(#runBtn):not(#jumpBtn):not(#edBtn){width:40px;height:40px}#game .acts .actbtn{width:72px;height:72px}#game .acts #edBtn{top:-48px}}
.hud-mic{position:absolute;z-index:6;right:var(--ui5-mic-r);bottom:var(--ui5-mic-b);max-width:100px;height:56px}
/* ---- bảng: tấm trượt / hộp ---- */
#ui5scrim{position:absolute;inset:0;z-index:7;background:rgba(8,5,3,.38);opacity:0;visibility:hidden;transition:opacity 150ms linear,visibility 0s 150ms;-webkit-tap-highlight-color:transparent}
body.pan #ui5scrim{opacity:1;visibility:visible;transition:opacity 150ms linear}
body.mxphoto #ui5scrim{display:none}
#game .panel{background:linear-gradient(180deg,#2c1f15,#1c140d);border:1px solid var(--u-bd2);box-shadow:0 18px 50px rgba(0,0,0,.55);will-change:transform;animation:ui5pd 170ms var(--u-ease)}
#game .panel .p-head{position:relative;padding:10px 10px 8px 16px;border-bottom:1px solid var(--u-bd);gap:8px;touch-action:none}
#game .panel .p-head h2{font-size:17px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#game .panel .p-x{flex:none;width:var(--u-tap);height:var(--u-tap);border-radius:12px;border:1px solid var(--u-bd);background:rgba(255,255,255,.06)}
#game .panel .p-body{-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:rgba(242,197,90,.35) transparent;contain:layout paint}
#game .panel .tabs{position:sticky;top:-12px;z-index:2;margin:-12px -14px 10px;padding:10px 14px 8px;background:var(--u-glass2);border-bottom:1px solid rgba(255,255,255,.05)}
#game .panel .tb{min-height:40px}#game .panel .tb.sm{min-height:36px}
#game .panel .chipsel{display:flex;flex-wrap:wrap;gap:6px}
#game .panel .btn.sm{min-height:36px}
#game .panel .grid6{max-width:480px;margin-inline:auto}
/* thẻ công thức gọn: [Làm] trên, [☆][×5] dưới thay vì 3 nút chồng dọc */
#game .panel .rc{padding:8px 10px;gap:10px}
#game .panel .rc-a{display:grid;grid-template-columns:1fr 1fr;gap:5px;flex:none;width:94px}
#game .panel .rc-a>*{min-width:0;width:100%;padding-inline:4px}
#game .panel .rc-a [data-a="craft"]:not([data-n]){grid-column:1/3;grid-row:1}
/* hàng chip lọc (công thức, xây dựng, túi…) trên điện thoại: một hàng vuốt ngang, mờ dần ở mép phải */
@media (max-width:600px),(max-height:500px) and (orientation:landscape){
 #game .panel .chipsel{flex-wrap:nowrap;overflow-x:auto;overflow-y:hidden;touch-action:pan-x pan-y;overscroll-behavior-x:contain;scrollbar-width:none;margin-right:-14px;padding-right:28px;padding-bottom:2px;-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 28px),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 28px),transparent)}
 #game .panel .chipsel::-webkit-scrollbar{display:none}
 #game .panel .chipsel>*{flex:none;white-space:nowrap}
}
@keyframes ui5pd{from{opacity:0;transform:translate(-50%,calc(-50% + 14px)) scale(.98)}to{opacity:1;transform:translate(-50%,-50%)}}
@keyframes ui5up{from{opacity:.2;transform:translateY(70px)}to{opacity:1;transform:none}}
@keyframes ui5sl{from{opacity:.2;transform:translateX(-50px)}to{opacity:1;transform:none}}
@keyframes ui5dt{from{opacity:0;transform:translate(-50%,12px) scale(.98)}to{opacity:1;transform:translate(-50%,0)}}
.ui5-ghost{pointer-events:none!important;z-index:8!important;animation:none!important;transition:transform 150ms ease-in,opacity 150ms ease-in!important}
@media (max-width:600px){
 #game .panel{left:0;right:0;bottom:0;top:auto;transform:none;width:100%;max-height:min(86dvh,calc(100% - 64px));border-radius:20px 20px 0 0;border-width:1px 0 0;padding-bottom:env(safe-area-inset-bottom);animation-name:ui5up}
 #game .panel::before{content:"";position:absolute;z-index:3;top:6px;left:50%;width:40px;height:4px;margin-left:-20px;border-radius:2px;background:rgba(255,240,210,.32);pointer-events:none}
 #game .panel .p-head{padding-top:16px}
 .ui5-ghost.ui5-out{transform:translateY(100%)!important;opacity:.4}
}
@media (max-height:500px) and (orientation:landscape){
 #game .panel{left:0;top:0;bottom:0;right:auto;transform:none;width:min(520px,calc(100vw - 330px - env(safe-area-inset-right)));max-height:none;border-radius:0 18px 18px 0;border-width:0 1px 0 0;padding-left:env(safe-area-inset-left);animation-name:ui5sl}
 #game .panel .p-head{padding-top:8px;padding-bottom:6px}
 .ui5-ghost.ui5-out{transform:translateX(-100%)!important;opacity:.4}
}
@media (min-width:601px) and (min-height:501px){
 #game .panel{top:calc(var(--u-st) + 66px);transform:translateX(-50%);width:min(680px,calc(100vw - 24px));max-height:calc(100% - var(--u-st) - 66px - var(--u-sb));animation-name:ui5dt}
 .ui5-ghost.ui5-out{transform:translate(-50%,10px) scale(.98)!important;opacity:0}
}
@media (prefers-reduced-motion:reduce){#game .panel{animation:none}#game .ui5-more,.ui5-ghost{transition:none!important}}
/* lúc mở bảng: ẩn bớt chi tiết phía sau cho nhẹ */
body.pan #game .compass,body.pan #game #tlabel,body.pan #game .peek{visibility:hidden}
`;
/* ---- menu ☰ ---- */
const UI5_MAIN=['bag','craft','build'];
function ui5MenuSetup(){const m=$('#menu');if(!m)return;let more=m.querySelector('.ui5-more'),mb=m.querySelector('.ui5-mb');
  if(!mb){mb=document.createElement('button');mb.className='ui5-mb';mb.dataset.ui5='more';mb.setAttribute('aria-label','Thêm chức năng');mb.setAttribute('aria-expanded','false');mb.innerHTML='<span>☰</span><i>Thêm</i>';m.appendChild(mb);}
  if(!more){more=document.createElement('div');more.className='ui5-more';more.id='ui5more';more.setAttribute('role','menu');m.appendChild(more);}
  ui5MenuSort();
  if(!UI5.mo){UI5.mo=new MutationObserver(()=>ui5MenuSort());UI5.mo.observe(m,{childList:true});}}
function ui5MenuSort(){const m=$('#menu');if(!m)return;const more=m.querySelector('.ui5-more'),mb=m.querySelector('.ui5-mb');if(!more||!mb)return;
  for(const b of [...m.children]){if(b===more||b===mb||b.tagName!=='BUTTON')continue;if(UI5_MAIN.includes(b.dataset.ui))continue;more.appendChild(b);}
  // giữ thứ tự: 3 nút chính trước, rồi ☰, rồi ngăn kéo
  if(mb.nextSibling!==more)m.appendChild(mb),m.appendChild(more);else if(more.nextSibling)m.appendChild(mb),m.appendChild(more);
  for(const b of more.children)b.setAttribute('role','menuitem');}
function ui5Drawer(on){const m=$('#menu');if(!m)return;on=!!on;UI5.dr=on;m.classList.toggle('ui5-open',on);const mb=m.querySelector('.ui5-mb');if(mb){mb.classList.toggle('on',on);mb.setAttribute('aria-expanded',on?'true':'false');}}
function ui5Badge(){const m=$('#menu');if(!m)return;const more=m.querySelector('.ui5-more'),mb=m.querySelector('.ui5-mb');if(!more||!mb)return;
  const dot=!!more.querySelector('.b3new,.mp-dot:not([hidden])');if(mb.classList.contains('dot')!==dot)mb.classList.toggle('dot',dot);}
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;
  if(t.closest('[data-ui5="more"]')){e.preventDefault();e.stopPropagation();try{sfx('pick');}catch(er){}ui5Drawer(!UI5.dr);return;}
  if(!UI5.dr)return;const inMore=t.closest('.ui5-more');
  if(inMore){if(t.closest('button'))setTimeout(()=>ui5Drawer(false),0);return;}
  ui5Drawer(false);if(!t.closest('#menu')){e.stopPropagation();e.preventDefault();}},true);
/* ---- lớp mờ phía sau bảng: chạm để đóng ---- */
function ui5Scrim(){if(document.getElementById('ui5scrim'))return;const g=$('#game');if(!g)return;const s=document.createElement('div');s.id='ui5scrim';s.setAttribute('aria-hidden','true');
  const p=$('#panel');if(p)g.insertBefore(s,p);else g.appendChild(s);
  const close=e=>{e.preventDefault();e.stopPropagation();if(G.panel)uiClose();};s.addEventListener('click',close);
  s.addEventListener('pointerdown',e=>{e.stopPropagation();});s.addEventListener('touchstart',e=>{e.stopPropagation();},{passive:true});}
/* ---- đóng có hiệu ứng: nhân bản bảng rồi trượt đi (bảng thật đã ẩn ngay, logic không phải chờ) ---- */
function ui5Ghost(p,dy){try{if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;const g=p.cloneNode(true);g.removeAttribute('id');g.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));g.classList.add('ui5-ghost');g.hidden=false;g.setAttribute('aria-hidden','true');
  if(dy)g.style.transform=p.style.transform;p.parentNode.insertBefore(g,p.nextSibling);void g.offsetWidth;g.classList.add('ui5-out');setTimeout(()=>g.remove(),190);}catch(e){}}
{const _uc=uiClose;uiClose=function(){const p=$('#panel');const was=p&&!p.hidden;let r;if(was&&!UI5.noGhost)ui5Ghost(p,UI5.dragDy);UI5.dragDy=0;r=_uc.apply(this,arguments);if(p){p.style.transform='';p.style.transition='';}
  if(was&&p.hidden)ui5HistOff();return r;};}
{const _uo=uiOpen;uiOpen=function(k,o,keep){const p=$('#panel');const was=p&&!p.hidden;let sx=null;
  try{if(was&&keep)sx=[...p.querySelectorAll('.chipsel')].map(c=>c.scrollLeft);}catch(e){}
  const r=_uo.apply(this,arguments);
  try{if(UI5.dr)ui5Drawer(false);if(p&&!p.hidden){if(!was){p.style.transform='';ui5HistOn();}ui5Chips(p,sx);}}catch(e){}return r;};}
// hàng chip vuốt ngang: giữ vị trí cuộn khi vẽ lại, và luôn cho thấy chip đang chọn
function ui5Chips(p,sx){const cs=p.querySelectorAll('.chipsel');cs.forEach((c,i)=>{if(c.scrollWidth<=c.clientWidth+2)return;if(sx&&sx[i]!=null)c.scrollLeft=sx[i];
  const on=c.querySelector('.on');if(on){const l=on.offsetLeft-c.offsetLeft,rr=l+on.offsetWidth;if(l<c.scrollLeft||rr>c.scrollLeft+c.clientWidth-28)c.scrollLeft=Math.max(0,l-24);}});}
/* ---- nút Back của điện thoại / trình duyệt đóng bảng ---- */
function ui5HistOn(){if(UI5.hist)return;try{history.pushState({ui5:1},'');UI5.hist=1;}catch(e){}}
function ui5HistOff(){if(!UI5.hist)return;UI5.hist=0;try{if(history.state&&history.state.ui5){UI5.popIgn=1;history.back();}}catch(e){}}
addEventListener('popstate',()=>{if(UI5.popIgn){UI5.popIgn=0;return;}if(UI5.hist){UI5.hist=0;if(G&&G.panel){UI5.noHist=1;uiClose();UI5.noHist=0;}}
  else if(UI5.dr)ui5Drawer(false);});
/* ---- vuốt xuống ở đầu bảng để đóng (tấm trượt dọc) ---- */
function ui5Sheet(){return matchMedia('(max-width:600px)').matches;}
function ui5DragInit(){const p=$('#panel');if(!p||p._ui5d)return;p._ui5d=1;
  p.addEventListener('pointerdown',e=>{if(!ui5Sheet()||e.button>0)return;const h=e.target.closest&&e.target.closest('.p-head');if(!h||e.target.closest('button,input,select,a'))return;
    UI5.drag={id:e.pointerId,y:e.clientY,t:performance.now(),dy:0};p.style.transition='none';try{h.setPointerCapture(e.pointerId);}catch(er){}});
  p.addEventListener('pointermove',e=>{const d=UI5.drag;if(!d||d.id!==e.pointerId)return;d.dy=Math.max(0,e.clientY-d.y);p.style.transform=d.dy?`translateY(${d.dy}px)`:'';});
  const end=e=>{const d=UI5.drag;if(!d||d.id!==e.pointerId)return;UI5.drag=null;const v=d.dy/Math.max(1,performance.now()-d.t);
    if(d.dy>90||(d.dy>24&&v>0.55)){UI5.dragDy=d.dy;uiClose();return;}p.style.transition='transform 150ms cubic-bezier(.2,.8,.2,1)';p.style.transform='';setTimeout(()=>{if(!UI5.drag)p.style.transition='';},170);};
  p.addEventListener('pointerup',end);p.addEventListener('pointercancel',end);}
/* ---- vị trí chừa cho nút mic: ngay trên cụm .acts ---- */
function ui5MicSlot(){const a=document.querySelector('#game .acts');if(!a)return;const r=a.getBoundingClientRect();const root=document.documentElement.style;
  if(r.height>0){const b=Math.round(innerHeight-r.top+10)+'px',rr=Math.round(innerWidth-r.right)+'px';if(UI5.micB!==b){UI5.micB=b;root.setProperty('--ui5-mic-b',b);}if(UI5.micR!==rr){UI5.micR=rr;root.setProperty('--ui5-mic-r',rr);}}}
/* ---- móc vào khởi tạo ---- */
{const _ui=uiInit;uiInit=function(){const r=_ui.apply(this,arguments);try{ui5Css();ui5Scrim();ui5MenuSetup();ui5DragInit();}catch(e){console.warn('ui5',e);}
  // các mô-đun nạp sau (settings, mp…) còn chèn CSS/nút: đưa CSS ui5 xuống cuối, xếp lại menu
  setTimeout(()=>{try{ui5Css();ui5MenuSort();}catch(e){}},0);return r;};}
ui5Css();
setInterval(()=>{try{if(!G.on)return;ui5Badge();ui5MicSlot();const last=document.head.lastElementChild;if(last&&last.id!=='ui5css'&&last.tagName==='STYLE'&&(UI5.cssMoved||0)<6){UI5.cssMoved=(UI5.cssMoved||0)+1;ui5Css();}}catch(e){}},700);
addEventListener('resize',()=>{UI5.micB=UI5.micR=null;setTimeout(()=>{try{ui5MicSlot();if(UI5.dr)ui5Drawer(false);}catch(e){}},60);});
addEventListener('keydown',e=>{if(e.code==='Escape'&&UI5.dr){e.stopImmediatePropagation();ui5Drawer(false);}},true);
