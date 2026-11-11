/* ===================== NHÀ CÓ CHỨC NĂNG =====================
   Dựng mái che lên một công trình chức năng thì nó thành một "nhà" có tác dụng riêng (đứng trong vòng 6 m quanh nó mới được hưởng):
     · Xưởng (bàn chế tác, trạm khắc, khung dệt, chỗ nặn gốm, phiến đá mài dưới mái): chế tạo, làm việc nhanh hơn 20%.
     · Nhà bếp (bếp lửa, lò bếp dưới mái): nấu nướng nhanh hơn 25%, đứng gần ấm và hồi thể lực nhanh hơn.
     · Lò rèn (lò luyện, lò nung dưới mái): nung, luyện, đúc nhanh hơn 20%.
     · Nhà kho (giỏ, rương, kệ, chum, kho thóc dưới mái): thịt, cá, đồ ăn lâu hỏng hơn 50% (chỉ cần có một nhà kho).
     · Nhà ở (giường, chỗ ngủ dưới mái): cỡ nhà theo số tấm mái quanh giường: Lều (1-3) · Nhà nhỏ (4-8) · Nhà lớn (9-15) · Nhà dài (16+).
       Mỗi bậc +5 thể lực tối đa; ngủ trong nhà từ bậc Nhà nhỏ trở lên được "Khỏe khoắn" lâu gấp đôi.
     · Chuồng trại (chuồng gà, máng ăn… dưới mái): gà ở chuồng có mái đẻ trứng nhiều hơn 50%.
   Bảng "🏠 Nhà của bạn" (trong Xây dựng → Nâng cấp) liệt kê nhà nào đang có chức năng gì; tên công trình khi lại gần cũng ghi chức năng. */
const NHA={list:[],t:-9,home:0,tip:{}};
const NHA_K={work:['🛠️','Xưởng','chế tạo, làm việc nhanh hơn 20%'],cook:['🍲','Nhà bếp','nấu nướng nhanh hơn 25%'],forge:['⚒️','Lò rèn','nung, luyện, đúc nhanh hơn 20%'],store:['📦','Nhà kho','thịt, cá, đồ ăn lâu hỏng hơn 50%'],home:['🏠','Nhà ở','thêm thể lực tối đa, ngủ ngon hơn'],barn:['🐓','Chuồng trại','gà trong chuồng có mái đẻ trứng nhiều hơn 50%']};
const NHA_HOME=[[1,'Lều'],[4,'Nhà nhỏ'],[9,'Nhà lớn'],[16,'Nhà dài']];
function nhaKind(b){const d=pieceDef(b.k);if(!d)return null;if(d.bed)return 'home';if(/^(workbench|carveBench|loom|potter|grindSlab|mortar)$/.test(b.k))return 'work';if(/^(smelter|kiln)$/.test(b.k))return 'forge';if(d.fuel||/hearth|campfire|Hearth/.test(b.k))return 'cook';
  if(d.store&&b.k!=='trough')return 'store';if(/coop|trough|pigPen|buffaloShed|duckHouse|goatShed|Roost/i.test(b.k))return 'barn';return null;}
function nhaScan(){NHA.t=G.t;const L=[];let home=0;const roofs=S.builds.filter(b=>b.prog==null&&!b.remote&&pieceDef(b.k)&&pieceDef(b.k).kind==='roof');
  for(const b of S.builds){if(b.prog!=null||b.remote)continue;const k=nhaKind(b);if(!k)continue;let cov=false;try{cov=underRoof(b.x,b.z)&&!(typeof inCave==='function'&&inCave(b.x,b.z));}catch(e){}if(!cov)continue;const o={b,k,tier:0};
    if(k==='home'){let n=0;for(const r of roofs)if(Math.hypot(r.x-b.x,r.z-b.z)<230)n++;for(let i=0;i<NHA_HOME.length;i++)if(n>=NHA_HOME[i][0])o.tier=i+1;o.n=n;home=Math.max(home,o.tier);}L.push(o);}
  if(home>NHA.home&&G.on&&NHA.t>20)uiToast(`🏠 Nhà của bạn giờ là ${NHA_HOME[home-1][1]}: thể lực tối đa +${home*5}.`,'gold');NHA.home=home;NHA.list=L;
  for(const o of L){if(o.k==='home'||NHA.tip[o.b.id])continue;NHA.tip[o.b.id]=1;if(G.on&&G.t>20&&Math.hypot(o.b.x-P.x,o.b.z-P.z)<300){const K=NHA_K[o.k];uiToast(`${K[0]} ${pieceDef(o.b.k).n} dưới mái thành ${K[1]}: ${K[2]}.`,'good');}}}
setInterval(()=>{try{if(G.on&&S&&S.builds)nhaScan();}catch(e){}},4000);
function nhaHas(k){return NHA.list.some(o=>o.k===k);}
function nhaIs(b,k){return NHA.list.some(o=>o.b===b&&o.k===k);}
function nhaNear(k,r){for(const o of NHA.list)if(o.k===k&&Math.hypot(o.b.x-P.x,o.b.z-P.z)<(r||120))return o;return null;}
/* ---------- tác dụng ---------- */
{const _ms=maxStam;maxStam=function(){return _ms()+NHA.home*5;};}
{const _wt=workTick;workTick=function(dt){const W=G.work;let k=1;if(W){const a=W.steps&&W.steps[W.i]&&W.steps[W.i].a;if(W.sk==='cook'||a==='cook'){if(nhaNear('cook'))k=1.25;}else if(nhaNear('forge')&&(W.sk==='craft')&&/smelt|cast|fire/i.test(String(W.icon||'')+a))k=1.2;else if(nhaNear('work')&&W.sk!=='hunt')k=1.2;if(k===1&&nhaNear('forge')&&W.sk==='craft')k=1.2;}return _wt(dt*k);};}
{const _bt=bodyTick;bodyTick=function(dt){const r=_bt.apply(this,arguments);try{if(!G.work&&!G.act&&P.speed<8&&nhaNear('cook',110)){S.p.stam=Math.min(maxStam(),S.p.stam+dt*1.5);}}catch(e){}return r;};}
// ngủ trong nhà đủ lớn: Khỏe khoắn lâu gấp đôi
{const _sl=sleep;sleep=function(b){const r=_sl.apply(this,arguments);try{const o=NHA.list.find(x=>x.b===b);if(o&&o.tier>=2)setTimeout(()=>{if(S&&S.buff&&S.buff.rested>TNOW())S.buff.rested=TNOW()+(S.buff.rested-TNOW())*2;},4500);}catch(e){}return r;};}
{const _ti=targetInfo;targetInfo=function(t){const r=_ti.apply(this,arguments);try{if(r&&t&&t.b&&r.name){const o=NHA.list.find(x=>x.b===t.b);if(o){const K=NHA_K[o.k];r.name+=' · '+K[0]+' '+(o.k==='home'?NHA_HOME[o.tier-1][1]:K[1]);}}}catch(e){}return r;};}
/* ---------- bảng ---------- */
function nhaHtml(){const L=NHA.list;const by={};L.forEach(o=>{(by[o.k]=by[o.k]||[]).push(o);});
  const rows=Object.keys(NHA_K).map(k=>{const K=NHA_K[k],a=by[k]||[],on=a.length>0;let ex='';if(k==='home'&&on){const t=Math.max(...a.map(o=>o.tier)),nx=NHA_HOME[t];ex=` · đang là <b>${NHA_HOME[t-1][1]}</b> (+${t*5} thể lực)${nx?` · thêm mái tới ${nx[0]} tấm quanh giường thành ${nx[1]}`:''}`;}
    return `<div class="nha-r${on?' on':''}"><span>${K[0]}</span><div><b>${K[1]}${on?` <em>×${a.length}</em>`:''}</b><small>${on?K[2]+ex:'Chưa có: '+({work:'lợp mái che bàn chế tác, trạm khắc, khung dệt',cook:'lợp mái che bếp lửa hoặc lò bếp',forge:'lợp mái che lò nung, lò luyện',store:'lợp mái che giỏ, rương, chum',home:'lợp mái che giường hoặc chỗ ngủ',barn:'lợp mái che chuồng gà, máng ăn'})[k]}</small></div></div>`;}).join('');
  return `<div class="landbox nha-box"><b>🏠 Nhà của bạn</b><span class="small muted">Lợp mái lên công trình nào thì chỗ đó thành nhà có chức năng. Đứng trong vòng 6 m mới được hưởng.</span>${rows}</div>`;}
if(typeof upHtml==='function'){const _uh=upHtml;upHtml=function(){let h=_uh.apply(this,arguments);try{nhaScan();h=nhaHtml()+h;}catch(e){}return h;};}
{const st=document.createElement('style');st.textContent=`.nha-box{gap:6px}.nha-r{display:flex;gap:9px;align-items:center;padding:6px 8px;border-radius:10px;background:rgba(0,0,0,.2);opacity:.6}.nha-r.on{opacity:1;border:1px solid rgba(242,197,90,.45);background:rgba(242,197,90,.1)}.nha-r>span{font-size:20px}.nha-r div{display:flex;flex-direction:column;min-width:0}.nha-r b{font-size:13px}.nha-r em{font-style:normal;color:#ffd27a}.nha-r small{font-size:11px;color:#cbb994;line-height:1.3}`;document.head.appendChild(st);}
