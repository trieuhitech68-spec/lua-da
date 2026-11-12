/* ===================== NHÂN VẬT (bản 5): GỘP CƠ THỂ + Y PHỤC VÀO MÀN NHÂN VẬT, KIỂU GAME TU TIÊN =====================
   - Ô trang bị xếp HAI CỘT hai bên nhân vật (5 + 5). Bấm một ô → thẻ món đồ nổi lên: chỉ số, độ bền, nút Vá / Cởi, các món cùng ô đang có trong túi để Mặc,
     ô trống thì gợi ý món làm được kèm nút "🤖 Tự kiếm & làm". Không còn trang "Y phục" dạng danh sách.
   - Thẻ "Thể trạng" thay trang "Cơ thể": 9 vòng chỉ số (máu, no, nước, thể lực, thân nhiệt, tỉnh táo, sạch sẽ, ướt, tinh thần), trạng thái đang mang,
     bệnh tật kèm nút chữa, công cụ cần mài. Thẻ có chấm đỏ khi có bệnh hoặc chỉ số nào dưới 25.
   - Mọi lối mở "Cơ thể", "Y phục" cũ đều dẫn về màn này. Bảng cũ chỉ còn Đời sống · Thời đại · Hướng dẫn. */
for(const t of ['body','wear']){const i=L4TABS.findIndex(x=>x[0]===t);if(i>=0)L4TABS.splice(i,1);}
const h5Vit=()=>{const p=S.p,L=l4S(),ms=maxStam();return L4V.map(([k,ic,n,c])=>{const v=k==='sp'?L.sp:k==='stam'?p.stam/ms*100:k==='clean'?(p.clean??90):k==='rest'?(p.rest??100):p[k];return {k,ic,n,c,v:clamp(+v||0,0,100)};});};
const h5Bad=()=>{try{if(Object.keys(S.st||{}).some(k=>STATUS[k]&&!L4CHIP.includes(k)))return true;return h5Vit().some(x=>x.k==='wet'?x.v>80:x.k==='sp'?false:x.v<25);}catch(e){return false;}};
function h5Body(){const vit=h5Vit(),T=G.tempC!=null?Math.round(G.tempC):'?';let rest='';try{const d=document.createElement('div');d.innerHTML=l4BodyHtml();const b=d.querySelector('.l4body');if(b)b.remove();rest=d.innerHTML;}catch(e){}
  const chips=Object.keys(S.st||{}).filter(k=>STATUS[k]).map(k=>`<span style="--c:${STATUS[k].col||'#c9a25a'}">${esc(STATUS[k].n)}</span>`).join('');
  return `<div class="h5-vs">${vit.map(x=>{const low=x.k==='wet'?x.v>80:x.k!=='sp'&&x.v<25;return `<div class="h5-v${low?' low':''}"><i style="--v:${x.v};--c:${x.c}"><b>${x.ic}</b></i><em>${Math.round(x.v)}</em><small>${x.n}</small></div>`;}).join('')}</div>
   <p class="small muted" style="text-align:center;margin:4px 0">Trời ${T}°C · cảm thấy ${G.feel!=null?Math.round(G.feel)+'°C':'?'}</p>${chips?`<div class="h5-chips">${chips}</div>`:''}${rest}`;}
function h5SlotCard(k){const W=(typeof L4SLOT!=='undefined'?L4SLOT:[]);let h='';
  if(k==='wp'||k==='tl'){const tool=selTool(),I=tool&&ITEMS[tool],E=HERO_EN.find(e=>e[0]===k),e=heroEn(k);
    h=`<div class="h5-ch">${k==='wp'&&tool?icon(tool,'big'):`<span class="h5-e">${k==='wp'?'⚔️':'🪓'}</span>`}<div><b>${k==='wp'?(I?esc(I.n):'Tay không'):'Dụng cụ lao động'}</b><span>${esc(E[3])} · đang +${e}</span></div></div>
     <div class="h5-cr"><button class="btn sm" data-h4="tab" data-t="en">✨ Cường hoá</button>${k==='wp'?'<button class="btn sm ghost" data-h4="go" data-t="bag">🎒 Đổi vũ khí trong túi</button>':''}</div>`;}
  else{const s=W.find(x=>x[0]===k);if(!s)return '';const id=S.wear&&S.wear[k],I=id&&ITEMS[id],L=l4S();
    if(I){const dv=I.dur?Math.round((L.wr[k]??I.dur)/I.dur*100):null,inf=[I.warm?'Ấm +'+I.warm:'',I.rain?'Che mưa '+Math.round(I.rain*100)+'%':'',I.sun?'Che nắng':'',I.foot?'Không dẫm gai':'',I.spirit?'Vui vẻ':'',I.arm?'Giáp '+Math.round(I.arm*100)+'%':''].filter(Boolean);
      h=`<div class="h5-ch">${icon(id,'big')}<div><b>${esc(I.n)}</b><span>${esc(s[1])}</span></div></div><div class="h5-st">${inf.map(t=>`<i>${esc(t)}</i>`).join('')||'<i>Trang sức</i>'}</div>${I.ds?`<p class="small muted">${esc(I.ds)}</p>`:''}
       ${dv!=null?`<div class="h5-du"><span>Độ bền</span><div class="h2-bar"><i style="width:${dv}%;${dv<20?'background:#e0533a':''}"></i></div><em>${dv}%</em></div>`:''}
       <div class="h5-cr">${dv!=null&&dv<100?`<button class="btn sm" data-a="l4fix" data-s="${k}">🧵 Vá</button>`:''}<button class="btn sm ghost" data-a="unwear" data-s="${k}">Cởi ra</button></div>`;}
    else h=`<div class="h5-ch"><span class="h5-e">${s[2]}</span><div><b>${esc(s[1])}: chưa mặc gì</b><span>Mặc đồ để ấm hơn, đỡ mưa, thêm giáp</span></div></div>`;
    const have=S.inv.map((it,i)=>it&&ITEMS[it.id]&&ITEMS[it.id].t==='wear'&&(ITEMS[it.id].slot||'body')===k&&it.id!==id?`<button class="btn sm" data-a="use" data-i="${i}">${icon(it.id)} Mặc ${esc(ITEMS[it.id].n)}</button>`:'').filter(Boolean).join('');
    if(have)h+=`<div class="h5-cr">${have}</div>`;
    else if(!I){const rs=RECIPES.filter(r=>{const o=r.out&&Object.keys(r.out)[0],J=o&&ITEMS[o];return J&&J.t==='wear'&&(J.slot||'body')===k&&aqNeedBtn(r);}).slice(0,3);
      h+=rs.length?`<p class="small muted">Trong túi chưa có món nào cho ô này. Làm được:</p><div class="h5-cr">${rs.map(r=>`<button class="btn sm aq-need" data-a="aqneed" data-r="${r.id}">🤖 ${esc(ITEMS[Object.keys(r.out)[0]].n)}</button>`).join('')}</div>`:'<p class="small muted">Chưa có món nào làm được cho ô này ở thời đại hiện tại.</p>';}}
  return `<div class="h5-card"><button class="h5-x" data-h4="slot" data-k="" aria-label="Đóng">✕</button>${h}</div>`;}
h4Draw=function(force){const el=h4El();if(!H4.on)return;const lv=heroLv(),xp=heroXp(),x0=30*(lv-1)*(lv-1),x1=30*lv*lv,pts=heroPts(),ri=heroRankI(),RK=HERO_RANK[ri],NR=HERO_RANK[ri+1];
  const W=(typeof L4SLOT!=='undefined'?L4SLOT:[]),tool=selTool(),enOk=HERO_EN.some(([q])=>heroEn(q)<HERO_ENMAX&&canPay(heroEnCost(q,heroEn(q)+1))),bad=h5Bad(),L=l4S();
  const vk=H4.tab==='bd'?h5Vit().map(x=>Math.round(x.v)).join(','):'';
  const key=[lv,Math.floor(xp),pts,ri,tool,JSON.stringify(S.wear||{}),JSON.stringify(heroS().en||{}),JSON.stringify(heroS().a),H4.tab,H4.slot,enOk,heroPower(),bad,vk,JSON.stringify(heroS().tp||{}),Object.keys(S.st||{}).join(),S.inv.filter(s=>s&&ITEMS[s.id]&&ITEMS[s.id].t==='wear').length].join('|');if(!force&&key===H4.key)return;H4.key=key;
  const slot=(k,lb,ic,id,en)=>{let dv=null;try{const I=id&&ITEMS[id];if(I&&I.dur&&k!=='wp')dv=(L.wr[k]??I.dur)/I.dur;}catch(e){}return `<button class="h5-s${id?' has':''}${H4.slot===k?' on':''}${dv!=null&&dv<0.2?' brk':''}" data-h4="slot" data-k="${k}" aria-label="${esc(lb)}"><span>${id?icon(id,'big'):`<i>${ic}</i>`}</span>${en?`<em>+${en}</em>`:''}<small>${esc(lb)}</small></button>`;};
  const all=[slot('wp','Vũ khí','⚔️',tool,heroEn('wp'))].concat(W.map(s=>slot(s[0],s[1],s[2],S.wear&&S.wear[s[0]],s[0]==='body'?heroEn('ar'):0))).concat([slot('tl','Dụng cụ','🪓',null,heroEn('tl'))]),half=Math.ceil(all.length/2);
  const sc=el.querySelector('.h4-body'),st=sc?sc.scrollTop:0;
  const body=H4.tab==='bd'?h5Body():H4.tab==='tp'&&typeof tpHtml==='function'?tpHtml():H4.tab?h4Body(H4.tab):'';
  el.innerHTML=`<div class="h4-top"><button class="h4-back" data-h4="x" aria-label="Đóng">←</button><div><b>${esc(RK[1])} · ${esc(S.name||'')}</b><span class="h4-tier">${RK[2]} BẬC ${['I','II','III','IV','V','VI','VII','VIII'][ri]}</span></div>
     <div class="h5-tr"><button data-h4="go" data-t="bag" aria-label="Túi đồ">🎒</button><button data-h4="demo" aria-label="Múa thử">▶</button></div></div>
   ${H4.tab?'':`<div class="h5-col l">${all.slice(0,half).join('')}</div><div class="h5-col r">${all.slice(half).join('')}</div>`}
   <div class="h4-low${H4.tab?' open':''}">${H4.slot&&!H4.tab?h5SlotCard(H4.slot):''}
    <div class="h4-pow"><span>✊</span><b>${heroPower().toLocaleString('vi-VN')}</b><button data-h4="tab" data-t="ov" aria-label="Lực chiến đến từ đâu">ⓘ</button></div>
    <div class="h4-sheet"><div class="h4-rk">${HERO_RANK.map((r,i)=>`<i class="${i<=ri?'on':''}${i===ri?' cur':''}" title="${esc(r[1])} · cấp ${r[0]}">${r[2]}</i>`).join('')}<button class="h4-up${pts>0||enOk?' h4go':''}" data-h4="up" aria-label="Nâng cấp">⬆</button></div>
     <div class="h4-strip"><div><b>${pts}</b><small>Điểm chưa cộng</small></div><div class="mid"><b>${lv}</b><small>Cấp độ</small></div><div><b>${Math.round(S.p.hp)}</b><small>Máu</small></div><button data-h4="tab" data-t="ov" aria-label="Tổng quan">☰</button></div>
     <div class="h4-xp"><div class="h2-bar big"><i style="width:${clamp((xp-x0)/(x1-x0)*100,0,100)}%"></i></div><span>${NR?`Còn ${Math.max(0,Math.ceil(x1-xp))} kinh nghiệm lên cấp ${lv+1} · cấp ${NR[0]} thành ${NR[1]}`:'Đã đạt danh hiệu cao nhất'}</span></div>
     <div class="h4-tabs h5-tabs">${[['at','Thuộc tính',pts>0],['tp','Thiên phú',typeof tpPts==='function'&&tpPts()>0],['bd','Thể trạng',bad],['sk','Kỹ năng',0],['en','Cường hoá',enOk]].map(([k,n,d])=>`<button class="${H4.tab===k?'on':''}" data-h4="tab" data-t="${k}">${n}${d?'<i></i>':''}</button>`).join('')}</div>
     ${H4.tab?`<div class="h4-body">${body}</div>`:''}</div></div>`;
  const s2=el.querySelector('.h4-body');if(s2)s2.scrollTop=st;};
// bấm ô trang bị; việc chữa trị / mài công cụ cần game chạy thì đóng màn
document.addEventListener('click',e=>{if(!H4.on)return;const b=e.target&&e.target.closest&&e.target.closest('#h4 [data-h4="slot"]');if(b){e.stopImmediatePropagation();H4.slot=H4.slot===b.dataset.k?null:(b.dataset.k||null);H4.tab=null;sfx('pick');h4Draw(true);return;}
  if(e.target.closest&&e.target.closest('#h4 [data-a="l4treat"],#h4 [data-a="l4tfix"],#h4 [data-a="l4fix"]'))setTimeout(()=>{if(H4.on&&(G.work||G.sit))h4Close();else if(H4.on)h4Draw(true);},120);},true);
{const _nc=aqNeedCraft;aqNeedCraft=function(){if(H4.on)h4Close();return _nc.apply(this,arguments);};}
{const _o=h4Open;h4Open=function(){H4.slot=null;return _o.apply(this,arguments);};}
{const _uo=uiOpen;uiOpen=function(k,o,keep){if(k==='l4'&&G.on&&S){const tab=keep?G.l4tab:((o&&o.tab)||G.l4tab||'hero');if(tab==='hero'||tab==='body'||tab==='wear'){G.l4tab='hero';if(!H4.on)h4Open();if(H4.on){H4.tab=tab==='body'?'bd':H4.tab;if(tab==='wear'){H4.tab=null;}h4Draw(true);}return;}}return _uo.apply(this,arguments);};}
{const st=document.createElement('style');st.textContent=`.h4-side{display:none!important}.h4-gear{display:none!important}
.h5-tr{position:absolute;right:10px;top:calc(10px + env(safe-area-inset-top));display:flex;gap:6px}.h5-tr button{width:44px;height:44px;border:0;border-radius:12px;background:linear-gradient(180deg,#3ac0ff,#1a8ad8);box-shadow:0 3px 0 #0e5a94;color:#fff;font-size:20px}
.h4-top>div:not(.h5-tr){margin-right:100px}.h4-top>.h5-tr{flex:none!important;flex-direction:row!important;align-items:center!important;margin-right:0!important;min-width:0}.h5-card{z-index:4}.h4-low{z-index:3}
.h5-col{position:absolute;top:calc(92px + env(safe-area-inset-top));display:flex;flex-direction:column;gap:7px;z-index:1}.h5-col.l{left:8px}.h5-col.r{right:8px}
.h5-s{position:relative;width:60px;height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;padding:2px;border-radius:12px;border:2px solid rgba(255,255,255,.28);background:linear-gradient(160deg,rgba(52,44,38,.92),rgba(22,18,15,.92));color:#fff;box-shadow:0 3px 0 rgba(0,0,0,.4),inset 0 0 10px rgba(0,0,0,.5)}
.h5-s.has{border-color:#ffc23a;background:radial-gradient(circle at 50% 35%,rgba(255,196,96,.38),rgba(60,36,14,.95) 70%);box-shadow:0 3px 0 rgba(0,0,0,.4),0 0 10px rgba(255,180,60,.35)}.h5-s.on{outline:2px solid #fff;outline-offset:1px}.h5-s.brk{border-color:#ff5a3a}
.h5-s span{width:34px;height:34px;display:flex;align-items:center;justify-content:center}.h5-s span i{font-style:normal;font-size:20px;opacity:.4}.h5-s span img,.h5-s span .ic{width:34px;height:34px}
.h5-s small{font-size:9.5px;font-weight:700;line-height:1;color:#e8dcc4;text-shadow:0 1px 0 #000;max-width:56px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.h5-s em{position:absolute;top:-6px;right:-5px;font-style:normal;font-size:10.5px;font-weight:900;color:#fff;background:#2a9a3a;border:1.5px solid #fff;border-radius:9px;padding:0 4px}
.h5-card{position:relative;margin:0 12px 4px;padding:12px;border-radius:16px;background:linear-gradient(180deg,rgba(40,28,18,.97),rgba(18,12,8,.97));border:1.5px solid #ffc23a;box-shadow:0 8px 24px rgba(0,0,0,.6);display:flex;flex-direction:column;gap:8px}
.h5-x{position:absolute;top:6px;right:6px;width:34px;height:34px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.3);color:#fff}
.h5-ch{display:flex;align-items:center;gap:10px;padding-right:36px}.h5-ch .ic,.h5-ch img{width:48px;height:48px}.h5-e{width:48px;height:48px;display:flex;align-items:center;justify-content:center;font-size:28px;opacity:.6}.h5-ch div{display:flex;flex-direction:column;gap:2px;min-width:0}.h5-ch b{font-size:16px;color:#ffe2a8}.h5-ch span{font-size:12px;color:#cbb994}
.h5-st{display:flex;flex-wrap:wrap;gap:5px}.h5-st i{font-style:normal;font-size:12px;font-weight:700;padding:3px 9px;border-radius:9px;background:rgba(120,220,90,.14);border:1px solid rgba(120,220,90,.4);color:#c8f2a0}
.h5-du{display:flex;align-items:center;gap:8px;font-size:12px;color:#cbb994}.h5-du .h2-bar{flex:1}.h5-du em{font-style:normal;color:#ffd27a;font-weight:700}
.h5-cr{display:flex;flex-wrap:wrap;gap:6px}.h5-cr .btn{min-height:40px}.h5-card p{margin:0}
.h5-tabs{grid-template-columns:repeat(5,1fr)!important}.h5-tabs button{font-size:11.5px!important;padding:0 1px}
.h5-vs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:4px}.h5-v{display:flex;flex-direction:column;align-items:center;gap:1px;padding:8px 2px 6px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}.h5-v.low{border-color:#ff5a3a;background:rgba(255,80,50,.12)}
.h5-v>i{width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:conic-gradient(var(--c) calc(var(--v)*1%),rgba(255,255,255,.1) 0)}.h5-v>i b{width:42px;height:42px;border-radius:50%;background:#17120e;display:flex;align-items:center;justify-content:center;font-size:20px;font-style:normal}
.h5-v em{font-style:normal;font-family:Bungee,sans-serif;font-size:16px;color:#fff;line-height:1.2}.h5-v small{font-size:10.5px;color:#c8c8cc}
.h5-chips{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin:4px 0 6px}.h5-chips span{font-size:11.5px;font-weight:700;padding:2px 9px;border-radius:10px;border:1px solid var(--c);color:var(--c);background:rgba(0,0,0,.25)}
.h4-body .l4c{padding:10px;border-radius:12px;background:rgba(255,255,255,.05);border-left:3px solid var(--c);margin-bottom:6px}.h4-body .l4t{display:flex;align-items:center;gap:8px;margin-bottom:5px}.h4-body .l4t span{flex:1}
@media (max-height:700px){.h5-s{width:50px;height:50px}.h5-s span,.h5-s span img,.h5-s span .ic{width:28px;height:28px}.h5-col{gap:5px;top:calc(78px + env(safe-area-inset-top))}}
@media (orientation:landscape){.h5-col.r{right:calc(min(46vw,460px) + 8px)}.h5-tr{right:calc(min(46vw,460px) + 8px)}.h5-card{margin:0 0 4px}}`;document.head.appendChild(st);}
