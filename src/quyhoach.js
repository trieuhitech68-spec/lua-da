/* ===================== QUY HOẠCH: CÁC LOẠI NHÀ TRỌN BỘ + CÔNG TRÌNH PHỤ TRỢ =====================
   Bảng Xây mở đầu bằng khung "🏘️ Quy hoạch làng": mỗi loại nhà là MỘT lựa chọn, bấm là cắm mốc cả căn (sàn, vách, cửa, mái, đồ bên trong) rồi làm dần từng phần.
   Các bộ phận rời (sàn, vách, mái, đồ dùng…) vẫn ở các thẻ bên dưới để tự thiết kế hoặc nới thêm.
     NHÀ CHÍNH       : Nhà chính                (+10 thể lực tối đa, chỗ ngủ, giỏ đồ)
     QUÂN SỰ         : Trại lính · Vọng gác     (lính và người giữ cổng đánh mạnh +20% · chòi canh + cổng cọc)
     SẢN XUẤT        : Xưởng chế tác · Nhà kho · Nhà bếp · Chuồng trại
     HỌC HỎI         : Nhà nghiên cứu           (mọi tay nghề lên nhanh hơn 15%)
   Căn nào dựng xong (đã lợp mái / xong món chính) thì có tác dụng. Lưu: mỗi phần của căn mang b.ht=<mã loại nhà>. */
const QH=[
 {id:'qh_chinh',g:'Nhà chính',n:'Nhà chính',ic:'🏠',fx:'+10 thể lực tối đa · chỗ ngủ trong nhà · giỏ cất đồ',d:'Nhà gỗ 3×2 ô có cửa, cửa sổ, mái lá, võng ngủ và giỏ đồ: trung tâm của làng.',key:'roof',
  fn:A=>{for(let i=0;i<3;i++)for(let j=0;j<2;j++){A.F(i,j,'floor');A.R(i,j,'roof',0);}for(let i=0;i<3;i++)A.E(i,0,'n',i===1?'wallWindow':'wall');A.E(0,1,'s','wall');A.E(1,1,'s','wallDoor');A.E(2,1,'s','wall');for(let j=0;j<2;j++){A.E(0,j,'w','wall');A.E(2,j,'e',j?'wall':'wallWindow');}A.O(0,0,'hammock');A.O(2,0,'basket');}},
 {id:'qh_linh',g:'Quân sự',n:'Trại lính',ic:'⚔️',fx:'Lính theo bạn và người giữ cổng đánh mạnh hơn 20%',d:'Nhà dài 3×2 ô với ba chỗ ngủ và giá vũ khí: chỗ ở của lính và tù binh đã quy phục.',key:'roof',
  fn:A=>{for(let i=0;i<3;i++)for(let j=0;j<2;j++){A.F(i,j,'floor');A.R(i,j,'roof',0);}for(let i=0;i<3;i++)A.E(i,0,'n','wall');A.E(0,1,'s','wall');A.E(1,1,'s','wallDoor');A.E(2,1,'s','wall');for(let j=0;j<2;j++){A.E(0,j,'w','wall');A.E(2,j,'e','wall');}A.O(0,0,'hammock');A.O(1,0,'hammock');A.O(2,0,'hammock');A.O(0,1,'weaponRack');}},
 {id:'qh_gac',g:'Quân sự',n:'Vọng gác',ic:'🗼',fx:'Chòi canh nhìn xa + cổng cọc và hai đoạn rào cọc chặn lối vào làng',d:'Chòi canh bốn cột cạnh một cổng cọc nhọn: đặt ở lối vào khu ở, cắt người giữ cổng đứng đây.',key:'watchtower',
  fn:A=>{A.O(0,0,'watchtower');A.E(1,0,'s','palisade');A.E(2,0,'s','palisadeGate');A.E(3,0,'s','palisade');}},
 {id:'qh_xuong',g:'Sản xuất',n:'Xưởng chế tác',ic:'🛠️',fx:'Bàn chế tác, phiến đá mài, giàn phơi dưới một mái: chế tạo không ướt mưa',d:'Xưởng 2×2 ô để trống hai mặt cho thoáng, có bàn chế tác, phiến đá mài và giàn phơi.',key:'roof',
  fn:A=>{for(let i=0;i<2;i++)for(let j=0;j<2;j++){A.F(i,j,'floor');A.R(i,j,'roof',0);}A.E(0,0,'n','wall');A.E(1,0,'n','wall');A.E(0,0,'w','wall');A.E(0,1,'w','wall');A.O(0,0,'workbench');A.O(1,0,'grindSlab');A.O(0,1,'dryRack');}},
 {id:'qh_kho',g:'Sản xuất',n:'Nhà kho',ic:'📦',fx:'Hai giỏ lớn và kệ dưới mái kín: đồ ăn lâu hỏng hơn, thêm 32 ô chứa',d:'Kho 2×2 ô kín bốn mặt, một cửa: cất vật liệu, lương thực cho cả làng.',key:'roof',
  fn:A=>{for(let i=0;i<2;i++)for(let j=0;j<2;j++){A.F(i,j,'floor');A.R(i,j,'roof',0);}A.E(0,0,'n','wall');A.E(1,0,'n','wall');A.E(0,1,'s','wallDoor');A.E(1,1,'s','wall');for(let j=0;j<2;j++){A.E(0,j,'w','wall');A.E(1,j,'e','wall');}A.O(0,0,'basket');A.O(1,0,'basket');A.O(1,1,'shelf');}},
 {id:'qh_bep',g:'Sản xuất',n:'Nhà bếp',ic:'🍲',fx:'Bếp lửa có mái che: nhóm được khi mưa, nấu nướng nhanh hơn',d:'Bếp 2×1 ô mái lá, ba mặt vách, có bếp lửa và giàn phơi thịt.',key:'roof',
  fn:A=>{for(let i=0;i<2;i++){A.F(i,0,'floor');A.R(i,0,'roof',0);A.E(i,0,'n','wall');}A.E(0,0,'w','wall');A.E(1,0,'e','wall');A.O(0,0,'campfire');A.O(1,0,'dryRack');}},
 {id:'qh_chuong',g:'Sản xuất',n:'Chuồng trại',ic:'🐓',fx:'Chuồng gà và máng ăn trong vòng rào có cổng: vật nuôi không đi lạc',d:'Sân 2×2 ô quây rào, một cổng, chuồng gà và máng ăn bên trong.',key:'coop',
  fn:A=>{A.O(0,0,'coop');A.O(1,0,'trough');for(let i=0;i<2;i++){A.E(i,0,'n','fence');A.E(i,1,'s',i?'fence':'gate');}for(let j=0;j<2;j++){A.E(0,j,'w','fence');A.E(1,j,'e','fence');}}},
 {id:'qh_nghien',g:'Học hỏi',n:'Nhà nghiên cứu',ic:'📜',fx:'Mọi tay nghề lên nhanh hơn 15%',d:'Nhà 2×2 ô có bàn khắc, kệ và ghế: nơi ghi chép, thử nghiệm cách làm mới.',key:'roof',
  fn:A=>{for(let i=0;i<2;i++)for(let j=0;j<2;j++){A.F(i,j,'floor');A.R(i,j,'roof',0);}A.E(0,0,'n','wallWindow');A.E(1,0,'n','wall');A.E(0,1,'s','wall');A.E(1,1,'s','wallDoor');for(let j=0;j<2;j++){A.E(0,j,'w','wall');A.E(1,j,'e','wall');}A.O(0,0,'carveBench');A.O(1,0,'shelf');A.O(0,1,'stool');}}];
for(const q of QH){q.bp=bpMake(q.id,q.n,q.ic,0,q.d,q.fn);}
const qhParts=q=>{try{return b4BpParts(q.bp);}catch(e){return [];}};
// căn đã dựng xong: có món chính (mái / chòi / chuồng) mang mã loại nhà và đã hoàn thành
function qhCount(id){const q=QH.find(x=>x.id===id);if(!q||!S)return 0;const done=new Set(),open=new Set();for(const b of S.builds){if(b.ht!==id)continue;const g=b.hg||0;if(b.prog!=null)open.add(g);else if(q.key==='roof'?pieceDef(b.k)&&pieceDef(b.k).kind==='roof':b.k===q.key)done.add(g);}let n=0;for(const g of done)if(!open.has(g)||q.key!=='roof')n++;return n;}
const qhHas=id=>{try{return qhCount(id)>0;}catch(e){return false;}};
// cắm mốc: gắn mã loại nhà cho từng phần
{const _bp=b4BpPlace;b4BpPlace=function(){const B=G.build,q=B&&B.bp&&QH.find(x=>x.bp===B.bp.bp||x.id===B.bp.bp.id),n0=S.builds.length,g0=(typeof b4S==='function'?b4S().seq:0);const r=_bp.apply(this,arguments);try{if(q)for(let i=n0;i<S.builds.length;i++){S.builds[i].ht=q.id;S.builds[i].hg=g0;}if(q&&S.builds.length>n0){cnt('cnt','qh');save();}}catch(e){}return r;};}
// tác dụng
{const _ms=maxStam;maxStam=function(){return _ms.apply(this,arguments)+(qhHas('qh_chinh')?10:0);};}
{const _dd=danDmg;danDmg=function(f){return _dd(f)*(qhHas('qh_linh')?1.2:1);};}
{const _ax=addXp;addXp=function(k,n){return _ax.call(this,k,qhHas('qh_nghien')?n*1.15:n);};}
function qhBegin(id){const q=QH.find(x=>x.id===id);if(!q)return;const parts=qhParts(q);if(!parts.length){uiToast('Bản vẽ lỗi.','bad');return;}const miss=b4BpMissing(parts);if(miss.length){uiToast('Chưa biết làm: '+miss.slice(0,4).map(k=>pieceDef(k)?pieceDef(k).n:k).join(', ')+'. Làm tiếp nhiệm vụ để mở.','bad');sfx('no');return;}b4BpBegin(Object.assign({},q.bp,{parts}));}
function qhGather(id){const q=QH.find(x=>x.id===id);if(!q)return;const cost=b4BpCost(qhParts(q));if(G.panel)uiClose();aqStart(-1,{job:{k:'getAll',cost:Object.assign({},cost),lab0:'Gom vật liệu: '+q.n,lab:'Gom vật liệu: '+q.n}});uiToast('🤖 Đi gom vật liệu cho '+q.n+'. Gom xong mở Xây → Quy hoạch làng bấm "Cắm mốc".','');}
function qhHtml(){let h='',g0='';for(const q of QH){const parts=qhParts(q),cost=b4BpCost(parts),miss=b4BpMissing(parts),have=qhCount(q.id),ok=!miss.length,pay=canPay(cost);
    if(q.g!==g0){g0=q.g;h+=`<div class="qh-g">${esc(q.g)}</div>`;}
    h+=`<div class="qh-c${have?' has':''}"><span class="qh-ic">${q.ic}</span><div class="qh-m"><b>${esc(q.n)}${have?` <em>đã có ${have}</em>`:''}</b><span class="qh-fx">${esc(q.fx)}</span><span class="small muted">${esc(q.d)}</span>
      <div class="chips">${Object.entries(cost).sort((a,b)=>b[1]-a[1]).slice(0,7).map(([k,v])=>`<span class="chip${haveCount(k)<v?' lack':''}">${icon(k)}${Math.min(haveCount(k),v)}/${v}</span>`).join('')}</div>
      ${ok?'':`<span class="small warn">Chưa biết làm: ${esc(miss.slice(0,4).map(k=>pieceDef(k)?pieceDef(k).n:k).join(', '))}</span>`}
      <div class="row"><button class="btn sm${ok?'':' ghost'}" data-a="qhgo" data-k="${q.id}">📐 Cắm mốc cả căn</button>${ok?`<button class="btn sm aq-need" data-a="qhauto" data-k="${q.id}">🤖 Tự dựng luôn</button>`:''}${ok&&!pay?`<button class="btn sm aq-need" data-a="qhget" data-k="${q.id}">🤖 Tự gom vật liệu</button>`:''}</div></div></div>`;}
  return `<details class="qh-box"${G.qhOpen===1?' open':''}><summary><b>🏘️ Quy hoạch làng: các loại nhà trọn bộ</b><span class="small muted">Chọn loại nhà → cắm mốc cả căn → làm dần từng phần. Vật liệu trả theo từng công đoạn.</span></summary><div class="qh-list">${h}</div></details>
   <div class="qh-sub">🧩 Bộ phận rời và công trình phụ trợ <span class="small muted">(sàn, vách, mái, đồ dùng, nông trại, phòng thủ: tự thiết kế hoặc nới thêm)</span></div>`;}
{const _bh=buildHtml;buildHtml=function(){let h=_bh.apply(this,arguments);try{h=qhHtml()+h;}catch(e){console.warn('quy hoạch',e);}return h;};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="qhgo"],[data-a="qhget"]');if(!b||!S)return;e.stopImmediatePropagation();if(b.dataset.a==='qhgo')qhBegin(b.dataset.k);else qhGather(b.dataset.k);},true);
document.addEventListener('toggle',e=>{const t=e.target;if(t&&t.classList&&t.classList.contains('qh-box'))G.qhOpen=t.open?1:0;},true);
{const st=document.createElement('style');st.textContent=`.qh-box{grid-column:1/-1;margin:0 0 10px;border-radius:14px;border:1px solid #f2c55a;background:linear-gradient(170deg,rgba(242,197,90,.14),rgba(242,197,90,.03));overflow:hidden}
.qh-box summary{display:flex;flex-direction:column;gap:2px;padding:10px 12px;cursor:pointer;list-style:none}.qh-box summary::-webkit-details-marker{display:none}.qh-box summary b{font-size:15px;color:#ffe2a8}.qh-box summary b:after{content:' ▾';color:#f2c55a}.qh-box:not([open]) summary b:after{content:' ▸'}
.qh-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px;padding:0 10px 10px}.qh-g{grid-column:1/-1;margin-top:4px;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#f2c55a}
.qh-c{display:flex;gap:10px;padding:10px;border-radius:12px;background:rgba(20,13,8,.75);border:1px solid rgba(255,255,255,.1)}.qh-c.has{border-color:rgba(120,220,90,.5)}
.qh-ic{flex:none;width:46px;height:46px;display:flex;align-items:center;justify-content:center;font-size:26px;border-radius:12px;background:radial-gradient(circle at 40% 30%,rgba(255,210,122,.35),rgba(60,36,14,.9));border:1px solid rgba(242,197,90,.4)}
.qh-m{min-width:0;flex:1;display:flex;flex-direction:column;gap:4px}.qh-m>b{font-size:14.5px}.qh-m>b em{font-style:normal;font-size:11px;color:#9fe07a;font-weight:700}.qh-fx{font-size:12.5px;font-weight:700;color:#b8e07a}
.qh-c .chips{display:flex;flex-wrap:wrap;gap:4px}.qh-c .chip.lack{border-color:rgba(255,120,90,.6);color:#ffb0a0}.qh-c .row{gap:6px;flex-wrap:wrap}.qh-c .btn{min-height:38px}
.qh-sub{grid-column:1/-1;margin:2px 0 8px;font-size:13.5px;font-weight:800;color:#ffe2a8}`;document.head.appendChild(st);}
// bảng hướng dẫn bắt buộc cho tính năng mới
if(typeof HD_L!=='undefined')HD_L.push({id:'quyhoach',ic:'🏘️',t:'Quy hoạch làng',w:()=>G.panel==='build'&&!!(S.hd&&S.hd.xay),p:['Đầu bảng Xây có khung <b>Quy hoạch làng</b>: mỗi loại nhà là một lựa chọn trọn bộ. Bấm <b>Cắm mốc cả căn</b>, chọn chỗ, rồi làm dần từng phần.','<b>Nhà chính</b> để ở. <b>Trại lính</b> cho lính đánh mạnh hơn, <b>Vọng gác</b> chặn lối vào. <b>Xưởng, Nhà kho, Nhà bếp, Chuồng trại</b> để sản xuất. <b>Nhà nghiên cứu</b> giúp tay nghề lên nhanh.','Các bộ phận rời (sàn, vách, mái, đồ dùng…) vẫn ở bên dưới để tự thiết kế hoặc nới thêm nhà đã có. Thiếu vật liệu thì bấm <b>🤖 Tự gom vật liệu</b>.']});
/* ===================== TỰ LÀM DỰNG NHÀ QUY HOẠCH: tự chọn chỗ phẳng gần nhà → cắm mốc → làm lần lượt từng công trường (móng → tường → mái) ===================== */
function qhSpot(parts){const hb=(typeof aqBed==='function'&&aqBed())||(typeof aqFire==='function'&&aqFire())||{x:P.x,z:P.z},cx=Math.round(hb.x/CELL)*CELL,cz=Math.round(hb.z/CELL)*CELL;
  for(let r=160;r<=720;r+=80)for(let a=0;a<16;a++){const tx=Math.round((cx+Math.cos(a/16*6.283+r)*r)/CELL)*CELL,tz=Math.round((cz+Math.sin(a/16*6.283+r)*r)/CELL)*CELL;if(wdAt(tx,tz)>0||slopeAt(tx,tz)>0.22)continue;
      for(let q=0;q<4;q++){const pl=b4BpPlan(parts,tx,tz,q);if(!pl.why||/^Xa quá/.test(pl.why))return {x:tx,z:tz,q};}}return null;}
AUJ.qh=function(j){const q=QH.find(x=>x.id===j.id);if(!q)return aqFail('Không có bản vẽ này.');{const nOpen=S.builds.filter(b=>b.ht===j.id&&b.prog!=null).length;if(j._no!==nOpen){j._no=nOpen;j.miss=0;}}if(j.cf){const m=j.cf;j.cf=null;if(++j.miss>6)return aqFail(m);}
  const open=S.builds.filter(b=>b.ht===j.id&&b.prog!=null&&(j.g==null||b.hg===j.g));
  if(!j.placed&&!open.length){const parts=qhParts(q),miss=b4BpMissing(parts);if(miss.length)return aqFail('Chưa biết làm: '+miss.slice(0,3).map(k=>pieceDef(k)?pieceDef(k).n:k).join(', ')+'. Làm tiếp nhiệm vụ để mở.');
    if(!j.sp){j.sp=qhSpot(parts);if(!j.sp)return aqFail('Không tìm được bãi đất phẳng đủ rộng gần nhà để dựng '+q.n+'. Thử San nền hoặc dọn cây quanh nhà.');}
    if(aqD(j.sp.x,j.sp.z)>150)return aqGoto(j,j.sp.x,j.sp.z,110,'Tới bãi đất dựng '+q.n,{far:1});
    const n0=S.builds.length;try{qhBegin(j.id);if(G.build&&G.build.bp){G.build.r=j.sp.q;AQ2.aim={x:j.sp.x,z:j.sp.z};try{b4BpPlace();}finally{AQ2.aim=null;}}}catch(e){}try{if(G.build)buildEnd();}catch(e){}
    if(S.builds.length===n0){j.sp=null;if(++j.tries>3)return aqFail('Không cắm mốc được '+q.n+' ở quanh nhà.');return AQ_RUN;}
    j.placed=1;const nb=S.builds[S.builds.length-1];j.g=nb.hg;aqSay('🤖 Đã cắm mốc '+q.n+'. Dựng lần lượt từng phần…','good');return AQ_RUN;}
  if(!open.length){return AQ_DONE;}
  let best=null,bp=1e9,bd=1e9;for(const b of open){if(b4Blocker(b))continue;const ph=b4Phase(b),d=aqD(b.x,b.z);if(ph<bp||(ph===bp&&d<bd)){bp=ph;bd=d;best=b;}}if(!best)best=open[0];
  {let need=null;try{const dd=pieceDef(best.k);if(best.bpPay&&dd)need=dd.cost;}catch(e){}if(need){const r=qhFetch(j,need);if(r)return r;}}
  const d=pieceDef(best.k);if(best.bpPay&&d&&!canPay(d.cost)){aqPush({k:'getAll',cost:Object.assign({},d.cost),lab:'Gom vật liệu: '+d.n,lab0:'Gom vật liệu: '+d.n},j);return AQ_RUN;}
  j.lab='Dựng '+q.n+' ('+open.length+' phần còn lại)';aqPush({k:'site',b:best},j);return AQ_RUN;};
function qhAuto(id){const q=QH.find(x=>x.id===id);if(!q)return;if(G.panel)uiClose();aqStart(-1,{job:{k:'qh',id,miss:0,tries:0,lab:'Dựng '+q.n,lab0:'Dựng '+q.n}});uiToast('🤖 Tự chọn chỗ, cắm mốc và dựng '+q.n+'. Bấm ✋ để dừng.','');}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="qhauto"]');if(!b||!S)return;e.stopImmediatePropagation();qhAuto(b.dataset.k);},true);
/* công trường xa kho: vật liệu trong giỏ/rương ở nhà không với tới → về kho lấy ra túi rồi mang tới (áp dụng cho mọi công trường khi Tự làm) */
function qhFetch(j,need){for(const k in need){const lack=need[k]-haveCount(k);if(lack<=0)continue;let sb=null,sn=0;for(const id in S.store){const arr=S.store[id];if(!Array.isArray(arr))continue;let n=0;for(const sl of arr)if(sl&&sl.id===k)n+=sl.n;if(n>sn){const b=BYID.get(+id);if(b&&!b.remote&&Math.hypot(b.x-P.x,b.z-P.z)>320){sn=n;sb=b;}}}
    if(!sb)continue;if(aqD(sb.x,sb.z)>60)return aqGoto(j,sb.x,sb.z,40,'Về kho lấy '+(ITEMS[k]?ITEMS[k].n.toLowerCase():k),{far:1});}return null;}
{const _s=AUJ.site;AUJ.site=function(j){try{const b=j.b;if(b&&b.prog!=null&&j._p!==b.prog){/* công trường có tiến triển: tính lại số lần được đi kiếm đồ */j._p=b.prog;j.gg=0;j.fl=0;}if(b&&BYID.has(b.id)&&b.prog!=null&&!j.cf&&j.st!=='wait'){let need=null;const dd=pieceDef(b.k);if(b.bpPay&&dd)need=dd.cost;else if(typeof STG!=='undefined'&&STG[b.k]){const sg=b3stg(b);if(sg&&sg.s&&sg.paid<=sg.i)need=sg.s.c;}
      if(need){/* đang đứng cạnh kho (đồ trong kho được tính là "có") mà công trường ở xa: rút ra túi trước khi đi */const far=Math.hypot(b.x-P.x,b.z-P.z)>200;if(far)for(const k in need){let lack=need[k]-invCount(k);if(lack<=0)continue;for(const st of nearStores()){for(let i=0;i<st.length&&lack>0;i++){const sl=st[i];if(!sl||sl.id!==k)continue;const t=Math.min(lack,sl.n);sl.n-=t;lack-=t;if(sl.n<=0)st[i]=null;const o={};o[k]=t;give(o);}}}
        const r=qhFetch(j,need);if(r)return r;}}}catch(e){}return _s.apply(this,arguments);};}
/* ===================== THÊM 3 LOẠI NHÀ: Nhà dài · Đền thờ tổ · Chợ phiên ===================== */
QH.push(
 {id:'qh_dai',g:'Nhà chính',n:'Nhà dài',ic:'🏘️',fx:'Bốn chỗ ngủ cho người nhà, lính · là "Nhà dài" nên được bảo hộ lâu nhất khi vắng',d:'Nhà gỗ 4×2 ô, hai cửa, hai cửa sổ, bốn chỗ ngủ và bếp giữa nhà: nơi cả họ ở chung.',key:'roof',
  fn:A=>{for(let i=0;i<4;i++)for(let j=0;j<2;j++){A.F(i,j,'floor');A.R(i,j,'roof',0);}for(let i=0;i<4;i++){A.E(i,0,'n',i===1||i===2?'wallWindow':'wall');A.E(i,1,'s',i===0||i===3?'wallDoor':'wall');}for(let j=0;j<2;j++){A.E(0,j,'w','wall');A.E(3,j,'e','wall');}A.O(0,0,'hammock');A.O(1,0,'hammock');A.O(2,0,'hammock');A.O(3,0,'hammock');A.O(1,1,'table');A.O(2,1,'basket');}},
 {id:'qh_tho',g:'Học hỏi',n:'Đền thờ tổ',ic:'🕯️',fx:'Tổ tiên phù hộ lâu gấp đôi sau mỗi lần tế lễ (6 giờ thay vì 3)',d:'Gian thờ 2×2 ô có bàn thờ tổ tiên và đèn dầu: nơi cả làng dâng lễ.',key:'roof',
  fn:A=>{for(let i=0;i<2;i++)for(let j=0;j<2;j++){A.F(i,j,'floor');A.R(i,j,'roof',0);}A.E(0,0,'n','wall');A.E(1,0,'n','wall');A.E(0,1,'s','wallDoor');A.E(1,1,'s','wallWindow');for(let j=0;j<2;j++){A.E(0,j,'w','wall');A.E(1,j,'e','wall');}A.O(0,0,'altar');A.O(1,0,'oilLamp');}},
 {id:'qh_cho',g:'Sản xuất',n:'Chợ phiên',ic:'🧺',fx:'Mỗi lần đổi đồ với người làng bên được thêm +2 tình thân',d:'Lán chợ 3×1 ô mái lá, để trống mặt trước, có bàn bày hàng, kệ và chum: người các làng tới đổi chác.',key:'roof',
  fn:A=>{for(let i=0;i<3;i++){A.F(i,0,'floor');A.R(i,0,'roof',0);A.E(i,0,'n','wall');}A.E(0,0,'w','wall');A.E(2,0,'e','wall');A.O(0,0,'table');A.O(1,0,'shelf');A.O(2,0,'storageJar');}});
for(const q of QH){if(!q.bp)q.bp=bpMake(q.id,q.n,q.ic,0,q.d,q.fn);}
{const GO=['Nhà chính','Quân sự','Sản xuất','Học hỏi'];QH.sort((a,b)=>GO.indexOf(a.g)-GO.indexOf(b.g));}
if(typeof ttOffer==='function'){const _to=ttOffer;ttOffer=function(){const u0=S&&S.tt?S.tt.until:0;const r=_to.apply(this,arguments);try{if(S.tt&&S.tt.until&&S.tt.until!==u0&&qhHas('qh_tho')){S.tt.until+=3*3600000;uiToast('🕯️ Có Đền thờ tổ: tổ tiên phù hộ tới 6 giờ.','gold');save();}}catch(e){}return r;};}
if(typeof npcAction==='function'){const _na=npcAction;npcAction=function(k,i){const r0=S?S.rep||0:0;const r=_na.apply(this,arguments);try{if(k==='trade'&&(S.rep||0)>r0&&qhHas('qh_cho')){S.rep=Math.min(100,S.rep+2);save();}}catch(e){}return r;};}
