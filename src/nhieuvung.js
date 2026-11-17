/* ===================== nhieuvung: NHIỀU VÙNG ĐỊNH CƯ CHO MÁY CHỦ ĐÔNG NGƯỜI =====================
   Một máy chủ sẽ có 1000 - 1500 người, mà Đất Trung Tâm mỗi chiều chưa tới 1 km: xây một lúc là hết đất.
   Giờ mỗi máy chủ có thêm 9 VÙNG ĐỊNH CƯ, mỗi vùng to bằng cả Đất Trung Tâm, địa hình riêng (hạt giống riêng, có vùng nhiều đồi núi, có vùng phẳng).
   · Vùng nào cũng cắm mốc lãnh thổ, dựng nhà chính, đặt vùng chung của liên minh được (trước chỉ Đất Trung Tâm). Mỗi người vẫn một lãnh thổ.
   · Máy chỉ tải vùng đang đứng nên không nặng thêm; nhà đã xây ở vùng nào nằm nguyên ở vùng đó.
   · Gần chỗ bắt đầu của MỌI vùng có "Cổng Muôn Nẻo" 🌀: bấm vào hiện danh sách các vùng kèm số lãnh thổ đã cắm, chọn vùng thưa người mà sang.
     Túi đồ, cấp, kỹ năng đi theo người; nhà cửa, kho, dân làng, vật nuôi ở lại vùng cũ (quay lại vẫn còn nguyên).
   Vùng mới nối vào CUỐI danh sách nên hạt giống của Tây Bắc, Biển Đảo không đổi. */
const MNV={cap:140};
(function(){const hill=k=>(h)=>h>0?h*k:h;const A=[
  ['d1','Kinh Bắc','🌾','Đồng bằng trù phú ven sông, đất dễ làm ruộng.',null],
  ['d2','Sơn Nam','🎋','Làng xóm ven đầm, nhiều tre và đất sét.',hill(0.9)],
  ['d3','Hải Đông','⚓','Cửa sông, bãi bồi, gần biển.',hill(0.84)],
  ['d4','Thanh Hoa','🥁','Núi đồi xen đồng bằng, giàu đá và đồng.',hill(1.1)],
  ['d5','Hoan Châu','⛰️','Đồi núi dựng hơn, dễ giữ, khó đánh.',hill(1.2)],
  ['d6','Thuận Hoá','🏯','Dải đất hẹp giữa núi và biển.',null],
  ['d7','Quảng Nam','🛶','Sông ngòi, rừng quế, đường ra biển.',hill(0.95)],
  ['d8','Gia Định','🌴','Đất phẳng rộng, dễ dựng làng lớn.',hill(0.82)],
  ['d9','Hà Tiên','🐚','Miền đầm lầy, cá tôm và muối.',hill(1.05)]];
  for(const [id,n,ic,d,hf] of A){if(LANDS.some(L=>L.id===id))continue;const L={id,n,ic,lv:0,need:1,home:1,d:d+' Đất định cư: cắm mốc lãnh thổ, dựng nhà chính ở đây được.'};if(hf)L.hf=hf;LANDS.push(L);}
  if(!LANDS.some(L=>L.id==='*'))LANDS.push({id:'*',n:'Muôn Nẻo',ic:'🌀',lv:0,need:1,hub:1,d:'Cổng lớn dẫn tới mọi vùng đất định cư. Chọn vùng thưa người để dựng làng.'});})();
const mnLands=()=>LANDS.filter(L=>!L.hub);
/* ---------- cổng Muôn Nẻo gần chỗ bắt đầu của mọi vùng ---------- */
{const _gp=landGatesPlan;landGatesPlan=function(){_gp.apply(this,arguments);try{const cur=landCur();if(cur.home)LD.gates=LD.gates.filter(g=>g.to==='c');
    const tries=[[340,-260],[-360,280],[420,300],[-300,-380],[620,0],[0,640]];for(const [dx,dz] of tries){const p=landSpot(SPAWN[0]+dx,SPAWN[1]+dz);if(p&&!LD.gates.some(g=>Math.hypot(g.x-p[0],g.z-p[1])<200)){LD.gates.push({to:'*',x:p[0],z:p[1]});break;}}}catch(e){console.warn('cổng muôn nẻo',e);}};}
function mnPop(id){try{return (typeof MP==='object'&&MP.landPop&&MP.landPop[id])||0;}catch(e){return 0;}}
function mnHtml(){const here=(S&&S.land)||'c',on=typeof mpOn==='function'&&mpOn(),lv=typeof heroLv==='function'?heroLv():1,L=mnLands().slice().sort((a,b)=>(a.id===here?-1:b.id===here?1:0));let best=null;if(on)for(const T of mnLands()){if(!(T.id==='c'||T.home)||T.id===here)continue;if(!best||mnPop(T.id)<mnPop(best.id))best=T;}
  return `<div class="nv-card"><div class="nv-h"><b>🌀 Cổng Muôn Nẻo</b><button class="nv-x" data-nv="x">✕</button></div>
   <p class="small">Mỗi vùng to bằng cả Đất Trung Tâm. Vùng nào cũng cắm mốc lãnh thổ, dựng nhà chính được (mỗi người một lãnh thổ). Túi đồ, cấp, kỹ năng đi theo bạn; nhà cửa, kho, dân làng ở lại vùng cũ.</p>
   <div class="nv-l">${L.map(T=>{const p=mnPop(T.id),cur=T.id===here,lock=lv<T.need,full=p>=MNV.cap,tag=cur?'<em class="nv-t cur">đang ở đây</em>':lock?`<em class="nv-t lock">cần cấp ${T.need}</em>`:best&&best.id===T.id?'<em class="nv-t best">thưa người nhất</em>':full?'<em class="nv-t full">đã đông</em>':'';
     return `<div class="nv-r${cur?' cur':''}"><span class="nv-ic">${T.ic}</span><div class="nv-m"><b>${esc(T.n)} ${tag}</b><span class="small">${esc(T.d.replace(/ Đất định cư:.*$/,''))}${T.lv?' Thú mạnh hơn '+T.lv+' bậc.':''}</span><span class="small muted">${on?`🚩 ${p} lãnh thổ đã cắm`:'chơi một mình'}</span></div>${cur?'':`<button class="btn sm${lock?' ghost':''}" data-nv="go" data-k="${T.id}"${lock?' disabled':''}>${MNV.arm===T.id?'Bấm lần nữa':'Sang'}</button>`}</div>`;}).join('')}</div></div>`;}
function mnOpen(){let el=document.getElementById('nvw');if(!el){el=document.createElement('div');el.id='nvw';document.body.appendChild(el);el.addEventListener('click',e=>{const b=e.target.closest('[data-nv]');if(!b){if(e.target===el)mnClose();return;}if(b.dataset.nv==='x'){mnClose();return;}const to=b.dataset.k,why=landWhy(to);if(why){uiToast(why,'bad');try{sfx('no');}catch(er){}return;}
      if(MNV.arm===to){MNV.arm=null;mnClose();landGo(to);}else{MNV.arm=to;try{sfx('pick');}catch(er){}el.innerHTML=mnHtml();}});}
  MNV.arm=null;el.innerHTML=mnHtml();el.hidden=false;try{G.keys={};}catch(e){}}
function mnClose(){const el=document.getElementById('nvw');if(el)el.hidden=true;MNV.arm=null;}
{const _ti=targetInfo;targetInfo=function(t){const r=_ti.apply(this,arguments);try{if(t&&t.type==='ldgate'&&t.g.to==='*'&&r){r.name='🌀 Cổng Muôn Nẻo';r.verb='Chọn vùng đất để sang';r.ok=true;r.need=null;}}catch(e){}return r;};}
{const _as=actStart;actStart=function(t){if(t&&t.type==='ldgate'&&t.g.to==='*'&&!G.work){mnOpen();try{sfx('pick');}catch(e){}return;}return _as.apply(this,arguments);};}
/* dời lãnh thổ sang vùng đang đứng (mỗi người một lãnh thổ) */
if(typeof mpLandHtml==='function'){const _h=mpLandHtml;mpLandHtml=function(){let s=_h.apply(this,arguments);try{const L=landCur(),o=MP.myOther&&LANDS.find(x=>x.id===MP.myOther);
    s=`<p class="small">${L.ic} Bạn đang ở <b>${esc(L.n)}</b>${mnPop(L.id)?` · ${mnPop(L.id)} lãnh thổ đã cắm ở vùng này`:''}. Thấy chật thì tìm 🌀 Cổng Muôn Nẻo gần chỗ bắt đầu để sang vùng thưa người hơn.</p>`+(o&&!MP.ro?`<div class="row"><span class="small warn">Lãnh thổ của bạn đang ở ${o.ic} ${esc(o.n)}.</span><button class="btn sm ${G.mpArm==='nvmove'?'red':'ghost'}" data-a="nvmove">${G.mpArm==='nvmove'?'Bấm lần nữa để dời':'Dời lãnh thổ về vùng này'}</button></div>`:'')+s;}catch(e){}return s;};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="nvmove"]');if(!b||!S)return;e.stopImmediatePropagation();try{if(G.mpArm!=='nvmove'){G.mpArm='nvmove';}else{G.mpArm=null;G.mpMove=1;try{mpClaim(false);}finally{G.mpMove=0;}}if(G.panel)uiOpenRefresh();}catch(er){}},true);
/* đất chật: lúc cắm mốc mà vùng đã đông thì nhắc có vùng khác */
if(typeof mpClaim==='function'){const _c=mpClaim;mpClaim=function(){const r=_c.apply(this,arguments);try{const id=(S&&S.land)||'c';if(mnPop(id)>=MNV.cap&&!MNV.toldFull){MNV.toldFull=1;uiToast('🌀 Vùng này đã khá đông. Cổng Muôn Nẻo gần chỗ bắt đầu dẫn tới các vùng định cư còn thưa người.','');}}catch(e){}return r;};}
if(typeof NVQ!=='undefined')NVQ.push({id:'muonneo',ic:'🌀',t:'Tìm Cổng Muôn Nẻo, xem các vùng định cư',d:'Gần chỗ bắt đầu có cổng đá mang dấu 🌀 (mở 🗺️ Bản đồ để cắm cờ tới cổng). Bấm vào để xem 12 vùng đất và số người đã định cư ở mỗi vùng.',n:1,f:()=>nvC('cnt:nvhub'),rw:{rope:2,meatCooked:2},lv:2});
{const _o=mnOpen;mnOpen=function(){try{cnt('cnt','nvhub');}catch(e){}return _o.apply(this,arguments);};}
(function(){try{const st=document.createElement('style');st.textContent='#nvw{position:fixed;inset:0;z-index:60;background:rgba(10,8,6,.62);display:flex;align-items:center;justify-content:center;padding:12px}#nvw[hidden]{display:none}.nv-card{background:#2a211a;color:#f3e9d8;border:1px solid rgba(255,210,122,.35);border-radius:14px;max-width:520px;width:100%;max-height:86vh;overflow:auto;padding:12px 14px;box-shadow:0 10px 40px rgba(0,0,0,.5)}.nv-h{display:flex;justify-content:space-between;align-items:center;font-size:17px;margin-bottom:4px}.nv-x{background:none;border:0;color:#f3e9d8;font-size:18px;padding:4px 8px;cursor:pointer}.nv-l{display:flex;flex-direction:column;gap:6px;margin-top:8px}.nv-r{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.05);border-radius:10px;padding:7px 9px}.nv-r.cur{outline:1px solid rgba(255,210,122,.5)}.nv-ic{font-size:24px;flex:none}.nv-m{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:1px}.nv-m b{font-size:14px}.nv-t{font-style:normal;font-size:11px;padding:1px 6px;border-radius:8px;margin-left:4px;background:rgba(255,255,255,.12);white-space:nowrap}.nv-t.best{background:#2f6b3a}.nv-t.cur{background:#7a5a1e}.nv-t.full{background:#7a2e22}.nv-r .btn{flex:none}';document.head.appendChild(st);}catch(e){}})();
