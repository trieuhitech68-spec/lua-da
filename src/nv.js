/* ===================== NHIỆM VỤ: CHÍNH TUYẾN + NHIỆM VỤ PHỤ (nhận thưởng) =====================
   Trước đây mọi mục tiêu xếp thành MỘT hàng dọc 58 bước: phải xong 46 bước đầu mới thấy các việc mới (nâng cấp, bắt thổ dân, thú chúa, liên minh…),
   và thưởng tự rơi ra không ai để ý. Giờ tách hai loại:
     · Chính tuyến: 46 bước theo cốt truyện 5 thời đại như cũ (thẻ góc màn hình).
     · Nhiệm vụ phụ: 18 việc làm song song, lúc nào cũng xem được; xong thì bấm "Nhận thưởng". Một số mở theo cấp nhân vật.
   Bảng 📋 Nhiệm vụ (bấm nút trên thẻ mục tiêu hoặc trong ☰) gom cả hai, kèm nhiệm vụ ngày của Làng.
   Lưu: S.nv={c:{<mã>:1}} (đã nhận thưởng). 12 mục "Dựng nước" từng nối vào cuối chuỗi chính được chuyển sang đây. */
if(typeof TR_BASE!=='undefined')GOALS.length=TR_BASE;
const nvC=k=>(S&&S.cnt&&S.cnt[k])||0;
const NVQ=[
 {id:'attr',ic:'💪',t:'Cộng điểm thuộc tính',d:'Mở 🧍 Nhân vật, cộng một điểm vào Sức mạnh, Thể chất, Nhanh nhẹn hoặc Khéo léo.',n:1,f:()=>{const a=(S.hero&&S.hero.a)||{};return (a.str|0)+(a.vit|0)+(a.agi|0)+(a.dex|0);},rw:{meatCooked:2,rope:1}},
 {id:'wear',ic:'👕',t:'Mặc một món đồ',d:'Làm nón lá, áo vỏ cây hay bất cứ món đồ mặc nào rồi mặc vào (Túi đồ).',n:1,f:()=>Object.values(S.wear||{}).filter(Boolean).length,rw:{fiber:6,hide:1}},
 {id:'upg',ic:'⬆️',t:'Nâng cấp một công trình',d:'Xây → Nâng cấp: nâng giỏ, rương, bếp hoặc mái lên bậc Gia cố (cần Xây dựng cấp 2).',n:1,f:()=>nvC('cnt:upgrade'),rw:{plank:3,rope:2}},
 {id:'enh',ic:'✨',t:'Cường hoá lần đầu',d:'Đứng gần Bàn chế tác, mở 🧍 Nhân vật → Cường hoá Vũ khí, Giáp phục hoặc Dụng cụ.',n:1,f:()=>nvC('cnt:enhance'),rw:{stone:8,flint:3}},
 {id:'lv5',ic:'⭐',t:'Nhân vật đạt cấp 5',d:'Làm việc gì cũng lên kinh nghiệm. Cấp 5 thành Thợ săn và bắt đầu đi cướp phá được.',n:5,f:()=>typeof heroLv==='function'?heroLv():1,rw:{meatCooked:4,rope:3}},
 {id:'gate',ic:'🚪',t:'Dựng cổng làng',d:'Rào quanh khu ở rồi dựng một cái cổng: chỗ để cắt người gác.',n:1,f:()=>S.builds.filter(b=>b.prog==null&&/gate/i.test(b.k)).length,rw:{wood:6,rope:2},lv:3},
 {id:'cap',ic:'🪢',t:'Bắt sống một thổ dân',d:'Mang Dây thừng, để sẵn giường trống, đánh chiến binh xuống dưới 40% máu rồi bấm nút Trói bắt.',n:1,f:()=>nvC('cnt:capture'),rw:{rope:3,meatCooked:3},lv:3},
 {id:'sub',ic:'🤝',t:'Thu phục một tù binh',d:'Để thức ăn trong giỏ, rương: ăn đủ mỗi ngày thì trung thành tăng tới 100.',n:1,f:()=>nvC('cnt:submit'),rw:{hide:2,grain:4},lv:3},
 {id:'post',ic:'🛡️',t:'Cắt người giữ cổng và lính',d:'Mở ☰ → Dân làng, giao một người "Giữ cổng" và một người "Lính theo bạn".',n:2,f:()=>Math.min(1,(S.folk||[]).filter(f=>f.job==='gate').length)+Math.min(1,(S.folk||[]).filter(f=>f.job==='soldier').length),rw:{meatCooked:4,rope:2},lv:4},
 {id:'lv10',ic:'🗡️',t:'Nhân vật đạt cấp 10',d:'Cấp 10 thành Chiến binh: thêm sát thương và tay nghề.',n:10,f:()=>typeof heroLv==='function'?heroLv():1,rw:{bronze:1,rope:4},lv:5},
 {id:'site',ic:'🗿',t:'Chiếm một điểm tài nguyên',d:'Tìm điểm giàu trên bản đồ, hạ hết người canh hoặc thú chúa rồi dựng Cột vật tổ trong vòng đất của nó.',n:1,f:()=>nvC('cnt:rlcap'),rw:{bronze:1,meatCooked:4},lv:5},
 {id:'boss',ic:'👑',t:'Hạ một thú chúa',d:'Mỏ sắt, vỉa than, bãi vàng, mỏ ngọc bích đều có thú chúa canh. Mang lính theo và giáp tốt.',n:1,f:()=>nvC('cnt:boss'),rw:{bronze:2,hide:3},lv:6},
 {id:'iron',ic:'🔩',t:'Luyện thỏi sắt',d:'3 quặng sắt + 2 than đá trong nồi nấu ở lò luyện (Chế tác cấp 6).',n:1,f:()=>nvC('craft:iron'),rw:{coal:4,ironOre:3},lv:8},
 {id:'irong',ic:'⚔️',t:'Rèn một món đồ sắt',d:'Rìu, giáo, dao, cuốc chim hoặc giáp sắt.',n:1,f:()=>nvC('craft:axeIron')+nvC('craft:spearIron')+nvC('craft:knifeIron')+nvC('craft:pickIron')+nvC('craft:ironArmor'),rw:{iron:1,rope:4},lv:8},
 {id:'site3',ic:'🏰',t:'Giữ ba điểm tài nguyên',d:'Dựng rào cọc, chòi canh, cắt lính để giữ tiền đồn khi bị đánh lại.',n:3,f:()=>typeof rlHeld==='function'?rlHeld():0,rw:{bronze:3,iron:1},lv:10},
 {id:'clan',ic:'🤝',t:'Lập hoặc gia nhập liên minh',d:'Mở ☰ → Liên minh: lập liên minh hoặc xin gia nhập (tối đa 70 người).',n:1,f:()=>typeof mpMyClan==='function'&&mpMyClan()?1:0,rw:{meatCooked:4,rope:4},mp:1},
 {id:'raid',ic:'🔥',t:'Cướp phá một công trình',d:'Lại gần công trình của người không cùng liên minh, bấm Hành động → Phá (cần cấp 5).',n:1,f:()=>nvC('cnt:pvp'),rw:{plank:4,rope:3},mp:1,lv:5},
 {id:'flag',ic:'🚩',t:'Hạ cờ một liên minh',d:'Khi hai liên minh có chiến tranh: tới cột cờ ở tâm vùng đất chung của họ và Hạ cờ.',n:1,f:()=>nvC('cnt:flag'),rw:{bronze:2,iron:1},mp:1,lv:5}];
function nvS(){if(!S.nv||typeof S.nv!=='object')S.nv={c:{}};if(!S.nv.c)S.nv.c={};return S.nv;}
function nvState(q){const N=nvS(),lv=typeof heroLv==='function'?heroLv():1;if(N.c[q.id])return {st:'got',v:q.n};if(q.mp&&!S.mp)return {st:'off',v:0};if(q.lv&&lv<q.lv)return {st:'lock',v:0};let v=0;try{v=Math.min(q.n,+q.f()||0);}catch(e){}return {st:v>=q.n?'ok':'run',v};}
function nvReady(){let n=0;for(const q of NVQ)if(nvState(q).st==='ok')n++;return n;}
function nvRw(rw){return Object.keys(rw).filter(k=>ITEMS[k]).map(k=>rw[k]+' '+ITEMS[k].n).join(', ');}
function nvClaim(id){const q=NVQ.find(x=>x.id===id);if(!q||nvState(q).st!=='ok')return;nvS().c[id]=1;const rw={};for(const k in q.rw)if(ITEMS[k])rw[k]=q.rw[k];give(rw,[P.x,P.y+20,P.z]);addXp('run',6);sfx('level');try{puff(P.x,P.y+34,P.z,'#ffd27a',10);}catch(e){}uiToast('🎁 '+q.t+': '+nvRw(rw),'gold');save();uiHud(true);if(G.panel==='nv')uiOpenRefresh();}
function nvHtml(){const g=GOALS[S.goal],c=typeof trCh==='function'?trCh(Math.min(S.goal,GOALS.length-1)):0,CH=typeof TR_CH!=='undefined'?TR_CH[c]:null;let main;
  if(g){const [v,n]=goalProg(g);main=`<div class="nv-main"><small>${CH?esc(CH.n):'Chính tuyến'} · bước ${S.goal+1}/${GOALS.length}</small><b>${esc(g.t)}</b><p>${esc(g.d)}</p>${n>1?`<div class="h2-bar big"><i style="width:${v/n*100}%"></i></div><span class="small muted">${v}/${n}</span>`:''}${CH?`<span class="nv-rw">🎁 ${esc(nvRw(CH.rw))} (tự nhận khi xong)</span>`:''}</div>`;}
  else main='<div class="nv-main"><b>Đã xong toàn bộ chính tuyến!</b><p>Giờ là lúc dựng nước: làm các nhiệm vụ phụ bên dưới.</p></div>';
  const ord={ok:0,run:1,lock:2,off:3,got:4},L=NVQ.map(q=>({q,s:nvState(q)})).sort((a,b)=>ord[a.s.st]-ord[b.s.st]);
  const row=({q,s})=>`<div class="nv-q ${s.st}"><span class="nv-ic">${s.st==='got'?'✔':q.ic}</span><div class="nv-b"><b>${esc(q.t)}</b><span class="small muted">${s.st==='lock'?'Mở khi nhân vật đạt cấp '+q.lv:s.st==='off'?'Chỉ có ở thế giới chung':esc(q.d)}</span>${s.st==='run'||s.st==='ok'?`<div class="h2-bar"><i style="width:${s.v/q.n*100}%"></i></div>`:''}<span class="nv-rw">🎁 ${esc(nvRw(q.rw))}${q.n>1&&(s.st==='run'||s.st==='ok')?` · ${s.v}/${q.n}`:''}</span></div>${s.st==='ok'?`<button class="btn sm" data-a="nvclaim" data-k="${q.id}">Nhận thưởng</button>`:''}</div>`;
  const live=L.filter(x=>x.s.st!=='got'),got=L.filter(x=>x.s.st==='got');
  return `<h3>📖 Chính tuyến</h3>${main}<div class="row"><button class="btn sm ghost" data-ui="journal">📜 Xem cả chuỗi và cốt truyện</button></div>
    <h3>📋 Nhiệm vụ phụ <span class="small muted" style="font-weight:400;text-transform:none">${got.length}/${NVQ.length} đã xong</span></h3>${live.map(row).join('')||'<p class="small muted">Đã nhận hết thưởng nhiệm vụ phụ.</p>'}
    ${got.length?`<details class="nv-done"><summary>Đã hoàn thành (${got.length})</summary>${got.map(row).join('')}</details>`:''}
    <h3>📅 Nhiệm vụ ngày</h3><div class="row"><button class="btn sm ghost" data-ui="m2">🏮 Mở Làng: việc hằng ngày, thư, chợ</button></div>`;}
{const _uo=uiOpen;uiOpen=function(k,o,keep){if(k!=='nv')return _uo.apply(this,arguments);if(!G.on)return;if(G.build)buildEnd();G.popt=o||{};G.panel='nv';const p=$('#panel');p.hidden=false;document.body.classList.add('pan');
  const sc=p.querySelector('.p-body')?p.querySelector('.p-body').scrollTop:0;p.innerHTML=`<div class="p-head"><h2>Nhiệm vụ</h2><button class="p-x" data-ui="close" aria-label="Đóng">✕</button></div><div class="p-body">${nvHtml()}</div>`;if(keep)p.querySelector('.p-body').scrollTop=sc;if(document.pointerLockElement)document.exitPointerLock();};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="nvclaim"]');if(!b||!S)return;e.stopImmediatePropagation();nvClaim(b.dataset.k);},true);
// thẻ mục tiêu: nút mở bảng Nhiệm vụ, kèm số việc phụ đang chờ nhận thưởng
{const _hud=uiHud;uiHud=function(){const r=_hud.apply(this,arguments);try{const el=$('#goal');if(el&&S){const n=nvReady(),k=String(n);let b=el.querySelector('.nv-open');if(!b){el.insertAdjacentHTML('beforeend','<button class="nv-open" data-ui="nv">📋 Nhiệm vụ<em hidden></em></button>');b=el.querySelector('.nv-open');}const em=b.querySelector('em');if(em.dataset.k!==k){em.dataset.k=k;em.hidden=!n;em.textContent=n;}}}catch(e){}return r;};}
function nvMenu(){const m=$('#menu');if(!m||m.querySelector('[data-ui="nv"]'))return;const b=document.createElement('button');b.setAttribute('data-ui','nv');b.setAttribute('aria-label','Nhiệm vụ');b.innerHTML='<span>📋</span><i>Nhiệm vụ</i>';const j=m.querySelector('[data-ui="journal"]');if(j&&j.parentNode)j.parentNode.insertBefore(b,j);else m.appendChild(b);}
setInterval(()=>{try{if(G.on&&S){nvMenu();if(S.goal>GOALS.length)S.goal=GOALS.length;}}catch(e){}},1500);
if(typeof UI6_ORD==='object')UI6_ORD.nv=10.5;
{const st=document.createElement('style');st.textContent=`.nv-main{padding:11px 12px;border-radius:14px;background:linear-gradient(160deg,rgba(242,197,90,.16),rgba(242,197,90,.04));border:1px solid rgba(242,197,90,.35);display:flex;flex-direction:column;gap:4px;margin-bottom:8px}.nv-main small{font-size:10.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#f2c55a}.nv-main b{font-size:15.5px}.nv-main p{margin:0;font-size:12.5px;line-height:1.45;color:#e0d2b4}
.nv-rw{font-size:11.5px;font-weight:700;color:#ffd27a}.nv-q{display:flex;gap:10px;align-items:center;padding:9px 10px;margin-bottom:7px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.07)}.nv-q.ok{border-color:rgba(242,197,90,.7);background:rgba(242,197,90,.12)}.nv-q.lock,.nv-q.off{opacity:.55}.nv-q.got{opacity:.6}
.nv-ic{flex:none;width:34px;height:34px;border-radius:10px;background:rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center;font-size:18px}.nv-q.got .nv-ic{background:#5a9a4a;color:#fff}.nv-b{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.nv-b b{font-size:13.5px}.nv-q .btn{flex:none;min-height:40px;white-space:nowrap}
.nv-done{margin:4px 0 8px}.nv-done summary{cursor:pointer;color:#f2c55a;font-size:13px;font-weight:700;padding:6px 0}
#game .goal .nv-open{display:inline-flex;align-items:center;gap:5px;margin-top:6px;margin-left:6px;padding:5px 9px;border-radius:10px;border:1px solid rgba(242,197,90,.45);background:rgba(0,0,0,.25);color:var(--fg);font:700 11.5px var(--body,inherit);min-height:30px;position:relative}
#game .goal .nv-open em{font-style:normal;min-width:17px;height:17px;border-radius:9px;background:#ff6a3a;color:#fff;font-size:10.5px;display:inline-flex;align-items:center;justify-content:center;padding:0 4px}#game .goal .nv-open em[hidden]{display:none}`;document.head.appendChild(st);}
