/* ===================== NÂNG CẤP & SỬA CHỮA CÔNG TRÌNH =====================
   Công trình đã xong của mình nâng được 3 bậc (b.up = 1..3: Gia cố → Kiên cố → Tinh xảo). Mỗi bậc tốn vật liệu (60% giá gốc × bậc)
   và cần kỹ năng Xây dựng cấp 2 × bậc. Tác dụng thật (chỉ những loại dưới đây mới nâng được):
     · đồ chứa (giỏ, rương, kệ, chum, kho…): +50% số ô mỗi bậc
     · bếp, lò có củi: củi cháy lâu hơn 20% mỗi bậc
     · mái, vách chịu mưa nắng (B3W): mục chậm hơn 25% mỗi bậc
   Bảng "Nâng cấp & sửa chữa" (mở từ bảng Xây dựng) liệt kê công trình quanh mình: món nào đang mục thì sửa, món nào nâng được thì nâng. */
const UP_MAX=3,UP_N=['','Gia cố','Kiên cố','Tinh xảo'],UP_R=420;
function upKind(b){const d=pieceDef(b.k);if(!d)return null;if(d.store&&b.k!=='trough')return 'store';if(d.fuel)return 'fuel';if(typeof B3W!=='undefined'&&B3W[b.k]&&(B3W[b.k].decay||B3W[b.k].rainOnly))return 'weather';return null;}
function upEffect(b,n){const k=upKind(b),d=pieceDef(b.k);return k==='store'?`chứa ${Math.round(d.store*(1+0.5*n))} ô (gốc ${d.store})`:k==='fuel'?`củi cháy lâu hơn ${20*n}%`:k==='weather'?`mục chậm hơn ${25*n}%`:'';}
function upCost(b,n){const d=pieceDef(b.k),c={};for(const k in (d.cost||{}))c[k]=Math.max(1,Math.ceil(d.cost[k]*0.6*n));if(!Object.keys(c).length)c.wood=2*n;return c;}
function upCostTxt(c){return Object.keys(c).map(k=>{const h=haveCount(k);return `<span class="${h>=c[k]?'':'up-miss'}">${c[k]} ${esc(ITEMS[k]?ITEMS[k].n:k)}</span>`;}).join(' · ');}
function upMine(b){return b&&b.prog==null&&!b.remote&&pieceDef(b.k);}
function upStoreFit(b){const d=pieceDef(b.k);if(!d||!d.store||!b.up)return;const st=S.store[b.id]||(S.store[b.id]=Array(d.store).fill(null)),want=Math.round(d.store*(1+0.5*b.up));while(st.length<want)st.push(null);}
function upDo(id){const b=BYID.get(id)||S.builds.find(x=>String(x.id)===String(id));if(!upMine(b)||!upKind(b))return;const d=pieceDef(b.k),n=(b.up|0)+1;if(n>UP_MAX)return;
  if(Math.hypot(b.x-P.x,b.z-P.z)>160){uiToast(`Lại gần ${d.n.toLowerCase()} hơn rồi nâng cấp.`,'bad');sfx('no');return;}
  if(skLv('build')<n*2){uiToast(`Cần kỹ năng Xây dựng cấp ${n*2} để nâng lên bậc ${n}.`,'bad');sfx('no');return;}
  const c=upCost(b,n);if(!canPay(c)){uiToast('Thiếu vật liệu để nâng cấp.','bad');sfx('no');return;}{const ng=needGate(true);if(ng){uiToast(ng,'bad');sfx('no');return;}}
  uiClose();const sp=1+skLv('build')*0.08;
  G.work={r:{out:{}},steps:[['Đo đạc, chuẩn bị vật liệu','gather',1.6,'pick'],['Gia cố khung, chèn nêm','hammer',2.6,'thud'],['Hoàn thiện, kiểm tra','lash',1.8,'build']].map(s=>({n:s[0],a:s[1],t:s[2]*n/sp,fx:s[3]})),
    i:0,t:0,left:1,done:0,x:P.x,z:P.z,sk:'build',icon:Object.keys(c)[0],fn:()=>{if(!canPay(c)){uiToast('Thiếu vật liệu, chưa nâng cấp xong.','bad');return;}pay(c);b.up=n;upStoreFit(b);if(b.cond!=null)b.cond=100;
      addXp('build',6*n);cnt('cnt','upgrade');puff(b.x,(b.y||P.y)+30,b.z,'#ffd27a',14);sfx('level');uiToast(`⬆️ ${d.n} lên bậc ${n} (${UP_N[n]}): ${upEffect(b,n)}.`,'gold');save();}};workUi();}
function upRepair(id){const b=BYID.get(id)||S.builds.find(x=>String(x.id)===String(id));if(!upMine(b)||typeof b3Repair!=='function')return;if(Math.hypot(b.x-P.x,b.z-P.z)>160){uiToast('Lại gần hơn rồi sửa.','bad');sfx('no');return;}uiClose();b3Repair(b);}
function upHtml(){const L=[];for(const b of S.builds){if(!upMine(b))continue;const dist=Math.hypot(b.x-P.x,b.z-P.z);if(dist>UP_R)continue;const kind=upKind(b),W=typeof B3W!=='undefined'?B3W[b.k]:null,rep=W&&W.rep&&b.cond!=null&&b.cond<95;if(!kind&&!rep)continue;L.push({b,dist,kind,rep,W});}
  L.sort((a,b)=>(b.rep-a.rep)||(a.dist-b.dist));
  if(!L.length)return `<p class="small muted">Quanh đây (trong ${Math.round(UP_R/20)} m) chưa có công trình nào nâng cấp hay cần sửa. Nâng được: đồ chứa (giỏ, rương, kệ, chum, kho thóc), bếp và lò, mái và vách chịu mưa nắng.</p>`;
  const rows=L.slice(0,60).map(o=>{const b=o.b,d=pieceDef(b.k),up=b.up|0,n=up+1,near=o.dist<=160;let h=`<div class="up-row">${typeof u8Thumb==='function'?u8Thumb(b.k):''}<div class="up-main"><b>${esc(d.n)}</b><span class="up-pips">${[1,2,3].map(i=>`<i class="${i<=up?'on':''}">★</i>`).join('')}</span><span class="small muted">cách ${Math.max(1,Math.round(o.dist/20))} m${b.cond!=null?` · độ bền ${Math.round(b.cond)}%`:''}${up?` · ${UP_N[up]}: ${upEffect(b,up)}`:''}</span>`;
    if(o.rep)h+=`<span class="small up-warn">Đang mục: sửa tốn ${upCostTxt(o.W.rep)}</span>`;
    if(o.kind&&up<UP_MAX)h+=`<span class="small">Bậc ${n} (${UP_N[n]}): ${upEffect(b,n)} · tốn ${upCostTxt(upCost(b,n))}${skLv('build')<n*2?` · <span class="up-miss">cần Xây dựng cấp ${n*2}</span>`:''}</span>`;else if(o.kind)h+=`<span class="small muted">Đã bậc cao nhất.</span>`;
    h+=`</div><div class="up-acts">${o.rep?`<button class="btn sm" data-a="uprep" data-id="${esc(String(b.id))}" ${near?'':'disabled'}>🔧 Sửa</button>`:''}${o.kind&&up<UP_MAX?`<button class="btn sm${near&&canPay(upCost(b,n))&&skLv('build')>=n*2?'':' ghost'}" data-a="updo" data-id="${esc(String(b.id))}" ${near?'':'disabled'}>⬆️ Nâng</button>`:''}</div></div>`;return h;}).join('');
  return `<p class="small muted">Công trình của bạn trong ${Math.round(UP_R/20)} m. Đứng cách dưới 8 m mới sửa hoặc nâng được. Mỗi bậc cần Xây dựng cấp 2 × bậc.</p>${rows}`;}
/* ---------- tác dụng ---------- */
{const _ft=fuelTick;fuelTick=function(gh){const snap=[];if(S&&gh>0)for(const b of S.builds)if(b.up&&(S.fuel[b.id]||0)>0)snap.push([b,S.fuel[b.id]]);const r=_ft.apply(this,arguments);for(const [b,f0] of snap){const f1=S.fuel[b.id]||0;if(f1>0&&f1<f0)S.fuel[b.id]=f1+(f0-f1)*Math.min(0.6,0.2*b.up);}return r;};}
if(typeof b3Hourly==='function'){const _bh=b3Hourly;b3Hourly=function(gh){const snap=[];if(S&&gh>0)for(const b of S.builds)if(b.up&&b.cond>0&&b.prog==null)snap.push([b,b.cond]);const r=_bh.apply(this,arguments);for(const [b,c0] of snap){if(b.cond>0&&b.cond<c0)b.cond=b.cond+(c0-b.cond)*Math.min(0.75,0.25*b.up);}return r;};}
{const _ti=targetInfo;targetInfo=function(t){const r=_ti.apply(this,arguments);try{if(r&&t&&t.b&&t.b.up&&r.name&&!/★/.test(r.name))r.name+=' '+'★'.repeat(t.b.up);}catch(e){}return r;};}
/* ---------- bảng ---------- */
{const _uo=uiOpen;uiOpen=function(k,o,keep){if(k!=='upg')return _uo.apply(this,arguments);if(!G.on)return;if(G.build)buildEnd();G.popt=o||{};G.panel='upg';const p=$('#panel');p.hidden=false;document.body.classList.add('pan');
  const sc=p.querySelector('.p-body')?p.querySelector('.p-body').scrollTop:0;p.innerHTML=`<div class="p-head"><h2>Nâng cấp & sửa chữa</h2><button class="p-x" data-ui="close" aria-label="Đóng">✕</button></div><div class="p-body">${upHtml()}</div>`;if(keep)p.querySelector('.p-body').scrollTop=sc;if(document.pointerLockElement)document.exitPointerLock();};}
{const _bh=buildHtml;buildHtml=function(){return `<div class="landbox"><b>⬆️ Nâng cấp & sửa chữa</b><span class="small muted">Nâng bậc đồ chứa, bếp lò, mái vách; sửa chỗ đang mục. Xem danh sách công trình quanh bạn.</span><div class="row"><button class="btn sm" data-a="upopen">Mở danh sách</button></div></div>`+_bh();};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="updo"],[data-a="uprep"],[data-a="upopen"]');if(!b||!S)return;e.stopImmediatePropagation();const a=b.dataset.a;if(a==='upopen'){sfx('pick');uiOpen('upg');}else if(a==='updo')upDo(b.dataset.id);else upRepair(b.dataset.id);},true);
{const st=document.createElement('style');st.textContent=`.up-row{display:flex;gap:10px;align-items:center;padding:9px 10px;margin-bottom:7px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.07)}.up-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.up-star{font-style:normal;color:#f2c55a}.up-acts{flex:none;display:flex;flex-direction:column;gap:5px}.up-acts .btn{min-height:40px;white-space:nowrap}.up-miss{color:#ff9a8a}.up-warn{color:#ffb86a}`;document.head.appendChild(st);}
