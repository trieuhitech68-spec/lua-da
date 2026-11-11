/* ===================== NHÂN VẬT (bản 4): MÀN TƯỚNG TOÀN MÀN HÌNH, NHÂN VẬT 3D THẬT =====================
   Mở Nhân vật = máy quay bay ra trước mặt nhân vật, cảnh game thật làm nền (không còn ảnh chụp trong khung). Kéo ngang để xoay quanh nhân vật.
   Trên: ← tên · danh hiệu, bậc lớn. Hai bên: lối tắt Y phục / Cơ thể / Túi đồ / ▶ múa thử. Dưới chân: hàng ô trang bị có +cường hoá.
   Giữa: ✊ LỰC CHIẾN. Đáy: 8 nút thăng danh hiệu + nút ⬆ (tới việc nâng cấp làm được ngay), dải 3 số (điểm chưa cộng · CẤP · thể lực),
   dòng tiến độ lên cấp, rồi 3 thẻ Thuộc tính · Kỹ năng · Cường hoá (bấm là kéo bảng lên). Nút ☰ = Tổng quan (lực chiến đến từ đâu, chỉ số).
   Trong lúc mở, game tạm dừng. Không đổi luật chơi. */
const H4={on:false,a:0.35,tab:null,p0:false,h0:null,demo:0,key:''};
{const _f=isFP;isFP=function(){return H4.on?false:_f.apply(this,arguments);};}
{const _ct=camTick;camTick=function(dt){if(!H4.on||!S||!P.model)return _ct.apply(this,arguments);try{const T=THREE,ry=(P.ry||0)+H4.a,port=innerHeight>innerWidth,D=port?104:92,up=H4.tab?0.2:0;
      const cx=P.x+Math.sin(ry)*D,cz=P.z+Math.cos(ry)*D;let cy=P.y+19;const gh=hAt(cx,cz)+5;if(cy<gh)cy=gh;const want=new T.Vector3(cx,cy,cz);G.cam.position.lerp(want,1-Math.exp(-dt*9));
      /* nhìn xuống thấp hơn người để nhân vật nằm ở nửa trên màn hình (nửa dưới là bảng) */G.cam.lookAt(P.x,P.y+(port?4-up*40:13),P.z);P.model.visible=true;
      if(G.L&&G.L.hemi){if(H4.h0==null)H4.h0=G.L.hemi.intensity;G.L.hemi.intensity=Math.max(H4.h0,0.85);}
      if(H4.demo>0){H4.demo-=dt;P.anim=H4.demo>1.1?'chop':H4.demo>0.5?'throw':'chop';}}catch(e){return _ct.apply(this,arguments);}};}
function h4El(){let el=document.getElementById('h4');if(!el){document.body.insertAdjacentHTML('beforeend','<div id="h4" hidden></div>');el=document.getElementById('h4');
    let px=null;el.addEventListener('pointerdown',e=>{if(e.target.closest('button,.h4-sheet'))return;px=e.clientX;});el.addEventListener('pointermove',e=>{if(px==null)return;H4.a+=(e.clientX-px)*0.012;px=e.clientX;});
    const end=()=>{px=null;};el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
    el.addEventListener('click',e=>{const b=e.target.closest('[data-h4]');if(b){e.stopPropagation();const k=b.dataset.h4;sfx('pick');
        if(k==='x'){h4Close();return;}if(k==='tab'){H4.tab=H4.tab===b.dataset.t?null:b.dataset.t;if(H4.tab)G.h3tab=H4.tab;h4Draw(true);return;}if(k==='demo'){H4.demo=1.7;return;}
        if(k==='go'){const t=b.dataset.t;h4Close();setTimeout(()=>{if(t==='bag')uiOpen('bag',{});else{G.l4tab=t;uiOpen('l4',{tab:t});}},30);return;}
        if(k==='up'){const pts=heroPts(),en=HERO_EN.some(([q])=>heroEn(q)<HERO_ENMAX&&canPay(heroEnCost(q,heroEn(q)+1)));H4.tab=pts>0?'at':en?'en':'ov';G.h3tab=H4.tab;h4Draw(true);if(!pts&&!en)uiToast('Chưa có gì nâng được ngay: lên cấp để có điểm thuộc tính, gom vật liệu để cường hoá.','');return;}}
      setTimeout(()=>{if(H4.on)h4Draw(true);},60);});}return el;}
function h4Open(){if(!S||!G.on||H4.on||G.sleeping)return;try{if(G.panel)uiClose();if(G.build)buildEnd();}catch(e){}H4.on=true;H4.tab=null;H4.a=0.35;H4.p0=!!G.paused;H4.h0=null;G.paused=true;G.keys={};G.walkTo=null;
  const cv=G.R&&G.R.domElement,g=document.getElementById('game');if(g)for(const c of g.children){if(c===cv||(cv&&c.contains(cv)))continue;c.classList.add('h4hide');}document.body.classList.add('h4on');h4El().hidden=false;h4Draw(true);}
function h4Close(){if(!H4.on)return;H4.on=false;G.paused=H4.p0;if(H4.h0!=null&&G.L&&G.L.hemi)G.L.hemi.intensity=H4.h0;H4.h0=null;G.camInit=0;document.querySelectorAll('.h4hide').forEach(c=>c.classList.remove('h4hide'));document.body.classList.remove('h4on');
  const el=document.getElementById('h4');if(el)el.hidden=true;try{uiHud(true);}catch(e){}}
function h4Body(tab){const t0=G.h3tab;G.h3tab=tab;let h='';try{const d=document.createElement('div');d.innerHTML=heroHtml();d.querySelectorAll('.h3-stage,.h3-plate,.h3-xp,.h3-tabs').forEach(n=>n.remove());h=(d.querySelector('.h3')||d).innerHTML;}catch(e){}G.h3tab=t0;return h;}
function h4Draw(force){const el=h4El();if(!H4.on)return;const lv=heroLv(),xp=heroXp(),x0=30*(lv-1)*(lv-1),x1=30*lv*lv,pts=heroPts(),ri=heroRankI(),RK=HERO_RANK[ri],NR=HERO_RANK[ri+1];
  const W=(typeof L4SLOT!=='undefined'?L4SLOT:[]),tool=selTool(),enOk=HERO_EN.some(([q])=>heroEn(q)<HERO_ENMAX&&canPay(heroEnCost(q,heroEn(q)+1)));
  const key=[lv,Math.floor(xp),pts,ri,tool,JSON.stringify(S.wear||{}),JSON.stringify(heroS().en||{}),JSON.stringify(heroS().a),H4.tab,enOk,heroPower()].join('|');if(!force&&key===H4.key)return;H4.key=key;
  const slot=(lb,ic,id,en,go)=>`<button class="h4-g${id?' has':''}" data-h4="${go?'go':'tab'}" data-t="${go||'en'}" aria-label="${esc(lb)}"><span>${id?icon(id,'big'):`<i>${ic}</i>`}</span>${en?`<em>+${en}</em>`:''}<small>${esc(id&&ITEMS[id]?ITEMS[id].n:lb)}</small></button>`;
  const gear=slot('Vũ khí','⚔️',tool,heroEn('wp'),'bag')+W.map(s=>slot(s[1],s[2],S.wear&&S.wear[s[0]],s[0]==='body'?heroEn('ar'):0,'wear')).join('')+slot('Dụng cụ','🪓',null,heroEn('tl'),'');
  const sc=el.querySelector('.h4-body'),st=sc?sc.scrollTop:0;
  el.innerHTML=`<div class="h4-top"><button class="h4-back" data-h4="x" aria-label="Đóng">←</button><div><b>${esc(RK[1])} · ${esc(S.name||'')}</b><span class="h4-tier">${RK[2]} BẬC ${['I','II','III','IV','V','VI','VII','VIII'][ri]}</span></div></div>
   <div class="h4-side l"><button data-h4="go" data-t="wear"><i>👕</i>Y phục</button><button data-h4="go" data-t="body"><i>🧍</i>Cơ thể</button></div>
   <div class="h4-side r"><button data-h4="go" data-t="bag"><i>🎒</i>Túi đồ</button><button data-h4="demo"><i>▶</i>Múa thử</button></div>
   <div class="h4-low${H4.tab?' open':''}"><div class="h4-gear">${gear}</div>
    <div class="h4-pow"><span>✊</span><b>${heroPower().toLocaleString('vi-VN')}</b><button data-h4="tab" data-t="ov" aria-label="Lực chiến đến từ đâu">ⓘ</button></div>
    <div class="h4-sheet"><div class="h4-rk">${HERO_RANK.map((r,i)=>`<i class="${i<=ri?'on':''}${i===ri?' cur':''}" title="${esc(r[1])} · cấp ${r[0]}">${r[2]}</i>`).join('')}<button class="h4-up${pts>0||enOk?' h4go':''}" data-h4="up" aria-label="Nâng cấp">⬆</button></div>
     <div class="h4-strip"><div><b>${pts}</b><small>Điểm chưa cộng</small></div><div class="mid"><b>${lv}</b><small>Cấp độ</small></div><div><b>${Math.round(maxStam())}</b><small>Thể lực tối đa</small></div><button data-h4="tab" data-t="ov" aria-label="Tổng quan">☰</button></div>
     <div class="h4-xp"><div class="h2-bar big"><i style="width:${clamp((xp-x0)/(x1-x0)*100,0,100)}%"></i></div><span>${NR?`Còn ${Math.max(0,Math.ceil(x1-xp))} kinh nghiệm lên cấp ${lv+1} · cấp ${NR[0]} thành ${NR[1]}`:'Đã đạt danh hiệu cao nhất'}</span></div>
     <div class="h4-tabs">${[['at','Thuộc tính',pts>0],['sk','Kỹ năng',0],['en','Cường hoá',enOk]].map(([k,n,d])=>`<button class="${H4.tab===k?'on':''}" data-h4="tab" data-t="${k}">${n}${d?'<i></i>':''}</button>`).join('')}</div>
     ${H4.tab?`<div class="h4-body">${h4Body(H4.tab)}</div>`:''}</div></div>`;
  const s2=el.querySelector('.h4-body');if(s2&&!force)s2.scrollTop=st;else if(s2)s2.scrollTop=st;}
setInterval(()=>{try{if(H4.on){if(!S||!G.on){h4Close();return;}h4Draw(false);}else if(S&&G.on&&G.panel==='l4'&&G.l4tab==='hero'){uiClose();h4Open();}}catch(e){}},300);
{const _uo=uiOpen;uiOpen=function(k,o,keep){if(k==='l4'&&G.on&&S&&((o&&o.tab==='hero')||(!(o&&o.tab)&&(!G.l4tab||G.l4tab==='hero')))){G.l4tab='hero';h4Open();return;}if(H4.on&&k!=='start')h4Close();return _uo.apply(this,arguments);};}
document.addEventListener('keydown',e=>{if(H4.on&&e.code==='Escape'){e.stopImmediatePropagation();h4Close();}},true);
// các nút bên trong thân bảng dùng lại (h3tab → đổi thẻ ngay trong màn này; l4tab/bag → đóng màn rồi mở bảng)
document.addEventListener('click',e=>{if(!H4.on)return;const b=e.target&&e.target.closest&&e.target.closest('#h4 [data-a="h3tab"],#h4 [data-a="l4tab"],#h4 [data-ui="bag"]');if(!b)return;e.stopImmediatePropagation();e.preventDefault();
  if(b.dataset.a==='h3tab'){H4.tab=b.dataset.t;G.h3tab=H4.tab;h4Draw(true);}else{const t=b.dataset.a==='l4tab'?b.dataset.t:'bag';h4Close();setTimeout(()=>{if(t==='bag')uiOpen('bag',{});else{G.l4tab=t;uiOpen('l4',{tab:t});}},30);}},true);
{const st=document.createElement('style');st.textContent=`.h4hide{visibility:hidden!important;pointer-events:none!important}
#h4{position:fixed;inset:0;z-index:60;color:#fff;font-family:inherit;touch-action:pan-y;user-select:none;-webkit-user-select:none;background:linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,0) 16%,rgba(0,0,0,0) 50%,rgba(0,0,0,.25))}
#h4[hidden]{display:none}
.h4-top{position:absolute;left:0;right:0;top:0;display:flex;align-items:flex-start;gap:10px;padding:calc(10px + env(safe-area-inset-top)) 12px 0}
.h4-back{flex:none;width:48px;height:44px;border:0;border-radius:12px;background:rgba(0,0,0,.35);color:#fff;font-size:26px;font-weight:900;text-shadow:0 2px 0 #000}
.h4-top>div{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;margin-right:48px}.h4-top b{font-size:19px;font-weight:800;text-shadow:0 2px 0 rgba(0,0,0,.8),0 0 8px rgba(0,0,0,.6);text-align:center;line-height:1.2}
.h4-tier{font-family:Bungee,sans-serif;font-size:26px;line-height:1.1;color:#ffc23a;text-shadow:0 2px 0 #7a4a14,0 0 14px rgba(255,170,40,.55)}
.h4-side{position:absolute;top:calc(96px + env(safe-area-inset-top));display:flex;flex-direction:column;gap:8px}.h4-side.l{left:0}.h4-side.r{right:8px}
.h4-side button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;min-width:56px;min-height:50px;padding:4px 8px;border:0;color:#fff;font-size:10.5px;font-weight:800;text-shadow:0 1px 0 rgba(0,0,0,.6)}
.h4-side button i{font-style:normal;font-size:20px;line-height:1}
.h4-side.l button{border-radius:0 12px 12px 0;background:linear-gradient(90deg,#1d5f9a,#2a86d0);box-shadow:0 3px 0 rgba(0,0,0,.35)}.h4-side.l button+button{background:linear-gradient(90deg,#a62a2a,#d84a3a)}
.h4-side.r button{border-radius:12px;background:linear-gradient(180deg,#3ac0ff,#1a8ad8);box-shadow:0 3px 0 #0e5a94}
.h4-low{position:absolute;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:stretch;max-height:100%}
.h4-gear{display:flex;justify-content:center;gap:4px;padding:0 6px 6px}.h4-gear::-webkit-scrollbar{display:none}
.h4-g{position:relative;flex:1 1 0;min-width:0;max-width:60px;display:flex;flex-direction:column;align-items:center;gap:0;padding:4px 2px 3px;border-radius:10px;border:2px solid rgba(255,255,255,.35);background:linear-gradient(180deg,rgba(60,60,66,.85),rgba(30,30,34,.85));color:#fff;box-shadow:0 3px 0 rgba(0,0,0,.35)}
.h4-g.has{border-color:#ffb23a;background:linear-gradient(180deg,#f2a53a,#c8702a)}.h4-g:nth-child(even){transform:translateY(8px)}
.h4-g span{width:30px;height:30px;display:flex;align-items:center;justify-content:center}.h4-g span i{font-style:normal;font-size:20px;opacity:.5}.h4-g span img,.h4-g span .ic{width:30px;height:30px}
.h4-g small{font-size:8.5px;font-weight:700;line-height:1.1;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 0 rgba(0,0,0,.6)}
.h4-g em{position:absolute;top:-7px;right:-4px;font-style:normal;font-size:11px;font-weight:900;color:#fff;background:#2a9a3a;border:1.5px solid #fff;border-radius:9px;padding:0 4px;text-shadow:0 1px 0 rgba(0,0,0,.5)}
.h4-pow{display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 0 6px}.h4-pow span{font-size:24px}.h4-pow b{font-family:Bungee,sans-serif;font-size:30px;line-height:1;text-shadow:0 2px 0 #000,0 0 10px rgba(0,0,0,.7)}
.h4-pow button{width:34px;height:34px;border-radius:50%;border:2px solid #fff;background:rgba(0,0,0,.35);color:#fff;font-size:16px;font-weight:900}
.h4-sheet{display:flex;flex-direction:column;gap:9px;padding:14px 12px calc(12px + env(safe-area-inset-bottom));background:linear-gradient(180deg,rgba(18,18,20,.94),rgba(10,10,12,.98));clip-path:polygon(0 10px,4% 2px,9% 9px,15% 3px,22% 8px,30% 1px,38% 7px,47% 2px,55% 9px,63% 3px,72% 8px,80% 1px,88% 7px,95% 2px,100% 9px,100% 100%,0 100%);min-height:0}
.h4-rk{display:flex;align-items:center;justify-content:center;gap:5px}.h4-rk i{flex:none;width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:50%;font-style:normal;font-size:15px;background:#2a2a2e;border:3px solid #4a4a50;filter:grayscale(1);opacity:.6}
.h4-rk i.on{filter:none;opacity:1;border-color:#7ae02a;background:#1e3a12;box-shadow:0 0 8px rgba(122,224,42,.6)}.h4-rk i.cur{border-color:#b8ff5a;box-shadow:0 0 12px rgba(160,255,80,.95)}
.h4-up{flex:none;width:44px;height:44px;margin-left:4px;border:0;border-radius:10px;background:linear-gradient(180deg,#5a5a60,#3a3a40);color:#fff;font-size:22px;font-weight:900;box-shadow:0 3px 0 rgba(0,0,0,.5)}.h4-up.h4go{background:linear-gradient(180deg,#4ee04a,#1ea52a);box-shadow:0 3px 0 #0e6a1a,0 0 12px rgba(80,230,80,.7);animation:h4p 1.2s infinite}
@keyframes h4p{50%{transform:translateY(-3px)}}
.h4-strip{display:flex;align-items:center;gap:6px}.h4-strip>div{flex:1;display:flex;flex-direction:column;align-items:center;padding:6px 2px;background:rgba(255,255,255,.07);border-radius:8px;min-width:0}
.h4-strip b{font-size:19px;font-weight:800;line-height:1.1}.h4-strip small{font-size:10.5px;color:#c8c8cc;white-space:nowrap}.h4-strip .mid{background:rgba(255,255,255,.12);padding:3px 2px 7px;margin-top:-6px}.h4-strip .mid b{font-size:30px}
.h4-strip>button{flex:none;width:44px;height:44px;border-radius:10px;border:2.5px solid #fff;background:transparent;color:#fff;font-size:20px;font-weight:900}
.h4-xp{display:flex;flex-direction:column;gap:4px}.h4-xp span{font-size:12px;color:#b8b8be;text-align:center}
.h4-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:0;padding:3px;border-radius:8px;background:#1c1c20}.h4-tabs button{position:relative;min-height:46px;border:0;border-radius:6px;background:transparent;color:#d8d8dc;font-size:14px;font-weight:800}
.h4-tabs button.on{background:#ececf0;color:#1a1a1e}.h4-tabs button i{position:absolute;top:6px;right:10px;width:9px;height:9px;border-radius:50%;background:#ff4a3a;box-shadow:0 0 6px #ff4a3a}
.h4-body{overflow-y:auto;max-height:38vh;padding:2px 1px 6px;-webkit-overflow-scrolling:touch;user-select:text}.h4-body h3{margin:8px 0 6px;font-size:13px;color:#ffd27a;text-transform:uppercase;letter-spacing:.04em}
.h4-low.open .h4-gear,.h4-low.open .h4-pow{display:none}
@media (orientation:landscape){.h4-low{left:auto;width:min(46vw,460px)}.h4-sheet{clip-path:none;border-radius:16px 0 0 0}.h4-body{max-height:30vh}.h4-top>div{align-items:flex-start;margin-right:0}.h4-side.r{right:calc(min(46vw,460px) + 8px)}.h4-gear{justify-content:flex-start}}`;document.head.appendChild(st);}
