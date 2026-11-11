/* ===================== TỰ LÀM (phần 2): TỰ CHỌN CHỖ, TỰ ĐẶT, TỰ DỰNG CÔNG TRÌNH CƠ BẢN · BỀN HƠN, ÍT TỰ DỪNG =====================
   - Các mục xây cơ bản (lều, bếp, bàn chế tác, san nền, sàn, vách, mái, chỗ nặn gốm, lò nung, kho thóc, cột vật tổ, lò luyện, trống đồng)
     không còn dừng lại bắt người chơi tự đặt: máy tự gom vật liệu, tự tìm chỗ bằng phẳng gần trại, đặt khung rồi làm hết các công đoạn.
     Nhà: sàn 2×2 ô, vách quanh rìa sàn, mái lợp trên sàn. Không tìm được chỗ mới hiện thẻ chỉ dẫn như cũ.
   - Công đoạn thiếu công cụ / vật liệu: tự đi kiếm thay vì báo "công đoạn bị chặn".
   - Gặp trục trặc: thử lại tối đa 3 lần (xoá danh sách chỗ hỏng, tìm xa hơn) rồi mới dừng.
   - Người chơi lỡ chạm màn hình / gạt cần: tạm dừng rồi tự chạy tiếp sau 4 giây không điều khiển. */
const AQ2={aim:null};
{const _ba=buildAim;buildAim=function(){if(AQ2.aim)return {x:AQ2.aim.x,z:AQ2.aim.z};return _ba.apply(this,arguments);};}
function aq2Try(id,x,z,commit){const tap0=G.buildTap,n0=S.builds.length;AQ2.aim={x,z};let ok=false,why='';G.bTip=1;G.siteTip=1;
  try{buildBegin(id);const B=G.build;if(B){B.lv=0;B.r=0;B.rman=0;B.free=false;B.uiT=G.t+99;buildUpdate();ok=!!B.ok;why=B.why||'';if(ok&&commit){buildPlace();ok=S.builds.length>n0;}}}catch(e){why='lỗi đặt khung';console.warn('auto2',e);}
  finally{try{buildEnd();}catch(e){}AQ2.aim=null;G.buildTap=tap0;}return {ok,why};}
const aq2Free=(x,z,rad)=>{if(wdAt(x,z)>0||slopeAt(x,z)>0.22||hAt(x,z)<3)return false;if(typeof cellBusy==='function'&&cellBusy(x,z))return false;for(const i of near(x,z,rad+20)){const q=RES[i];if(q.st===0&&!RT[q.t].pass&&Math.hypot(q.x-x,q.z-z)<rad)return false;}return true;};
function aq2Anchor(){const b=S.builds.find(b=>GD_BED.test(b.k))||S.builds.find(b=>GD_FIRE.test(b.k));return b?{x:b.x,z:b.z}:{x:P.x,z:P.z};}
const aq2Floors=()=>S.builds.filter(b=>GD_FLOOR.test(b.k)&&!(b.lv>0));
// danh sách chỗ thử đặt, tốt nhất đứng đầu
function aq2Spots(def){const out=[],A=aq2Anchor(),F=aq2Floors(),cc=v=>(Math.floor(v/CELL)+0.5)*CELL;
  if(def.kind==='floor'&&F.length){const has=new Set(F.map(b=>Math.floor(b.x/CELL)+','+Math.floor(b.z/CELL))),seen=new Set();let mx=0,mz=0;for(const b of F){mx+=b.x;mz+=b.z;}mx/=F.length;mz/=F.length;
    /* ô gốc của khối 2×2: ô sàn đầu tiên; lấp đủ khối trước rồi mới nới ra */const b0=F[0],ox=Math.floor(b0.x/CELL),oz=Math.floor(b0.z/CELL);
    for(const b of F)for(const [u,v] of [[1,0],[-1,0],[0,1],[0,-1]]){const cx=Math.floor(b.x/CELL)+u,cz=Math.floor(b.z/CELL)+v,k=cx+','+cz;if(has.has(k)||seen.has(k))continue;seen.add(k);const x=(cx+0.5)*CELL,z=(cz+0.5)*CELL;
      let adj=0;for(const [a,c] of [[1,0],[-1,0],[0,1],[0,-1]])if(has.has((cx+a)+','+(cz+c)))adj++;const inB=cx>=ox&&cx<=ox+1&&cz>=oz&&cz<=oz+1;out.push({x,z,s:(inB?-1000:0)-adj*200+Math.hypot(x-mx,z-mz)});}
    for(const k of has){const [cx,cz]=k.split(',').map(Number);for(const [a,c] of [[1,1],[1,-1],[-1,1],[-1,-1]]){const kk=(cx+a)+','+(cz+c);if(!has.has(kk)&&!seen.has(kk)){seen.add(kk);out.push({x:(cx+a+0.5)*CELL,z:(cz+c+0.5)*CELL,s:Math.hypot((cx+a+0.5)*CELL-mx,(cz+c+0.5)*CELL-mz)-(cx+a>=ox&&cx+a<=ox+1&&cz+c>=oz&&cz+c<=oz+1?1000:0)});}}}}
  else if(def.kind==='edge'){const has=new Set(F.map(b=>Math.floor(b.x/CELL)+','+Math.floor(b.z/CELL)));
    for(const b of F){const cx=Math.floor(b.x/CELL),cz=Math.floor(b.z/CELL),x=(cx+0.5)*CELL,z=(cz+0.5)*CELL,h=CELL/2-4;
      for(const [u,v] of [[0,-1],[0,1],[-1,0],[1,0]]){if(has.has((cx+u)+','+(cz+v)))continue;out.push({x:x+u*h,z:z+v*h,s:(b.prog!=null?50:0)+out.length});}}}
  else if(def.kind==='roof'){for(const b of F){const c=cellAt(b.x,b.z);if(c&&c[slotN('roof',0)])continue;out.push({x:b.x,z:b.z,s:(b.prog!=null?50:0)+out.length});}}
  else{const fp=def.fp||[1,1],rad=def.kind==='floor'?CELL*1.05:Math.max(fp[0],fp[1])*CELL*0.62,fire=def.id==='campfire'?S.builds.find(b=>b.k==='leanto'||b.k==='tent'):null,C=fire||A;
    for(let r=fire?44:56;r<=460;r+=24)for(let a=0;a<16;a++){const ang=a/16*6.283+r*0.013;let x=C.x+Math.cos(ang)*r,z=C.z+Math.sin(ang)*r;
      if(def.kind==='floor'){x=Math.floor(x/CELL)*CELL;z=Math.floor(z/CELL)*CELL;/* (x,z) = góc chung của khối 2×2 */let ok=true;for(const [u,v] of [[-0.5,-0.5],[0.5,-0.5],[-0.5,0.5],[0.5,0.5]])if(!aq2Free(x+u*CELL,z+v*CELL,CELL*0.6)){ok=false;break;}if(!ok)continue;
        if(S.builds.some(b=>Math.hypot(b.x-x,b.z-z)<CELL*1.9))continue;const f=typeof inFlat==='function'&&inFlat(x,z);out.push({x:x-CELL/2,z:z-CELL/2,s:r+(f?-600:0)+slopeAt(x,z)*400});continue;}
      if(!aq2Free(x,z,rad))continue;if(S.builds.some(b=>Math.hypot(b.x-x,b.z-z)<rad+34))continue;out.push({x,z,s:r+slopeAt(x,z)*300+Math.hypot(x-P.x,z-P.z)*0.15});}}
  out.sort((a,b)=>a.s-b.s);return out.slice(0,14);}
AUJ.place=function(j){const def=pieceDef(j.piece);if(!def)return aqFail('Không rõ công trình.');j.lab='Chọn chỗ đặt '+def.n.toLowerCase();
  if(j.cf){const m=j.cf;j.cf=null;if(j.c){j.ci++;}else if(++j.gf>2)return aqFail(m);}
  if(def.lv&&!lvOk(def.lv))return aqFail('Cần '+lvText(def.lv)+' mới dựng được '+def.n+'.');
  if(typeof buildKnown==='function'&&def.need&&!(S.cnt['build:'+def.need]>0))return aqFail('Cần dựng '+((pieceDef(def.need)||{}).n||def.need)+' trước.');
  if(!canPay(def.cost)){if(++j.g>4)return aqFail('Không gom đủ vật liệu cho '+def.n+'.');j.lab='Gom vật liệu: '+def.n;aqPush({k:'getAll',cost:Object.assign({},def.cost),lab:j.lab},j);return AQ_RUN;}
  if(!j.c||j.ci>=j.c.length){if(j.c&&++j.round>2)return {fail:'Không tìm được chỗ đặt '+def.n.toLowerCase()+(j.why?' ('+j.why+')':'')+'.',guide:j.piece};j.c=aq2Spots(def);j.ci=0;if(!j.c.length)return {fail:'Không thấy chỗ nào đủ bằng phẳng quanh trại để đặt '+def.n.toLowerCase()+'.',guide:j.piece};}
  const s=j.c[j.ci];if(aqD(s.x,s.z)>170)return aqGoto(j,s.x,s.z,110,'Tới chỗ dựng '+def.n.toLowerCase());
  const r=aq2Try(j.piece,s.x,s.z,true);if(r.ok){uiToast('🤖 Đã đặt khung '+def.n+'. Dựng tiếp…','good');return AQ_DONE;}j.why=r.why;j.ci++;return AQ_RUN;};
{const _i=aqInit;aqInit=function(j){_i(j);if(j.k==='place'||j.k==='flat'||j.k==='site'){if(j.g==null)j.g=0;if(j.gf==null)j.gf=0;if(j.ci==null)j.ci=0;if(j.round==null)j.round=0;if(j.gg==null)j.gg=0;}};}
// san nền: kiếm gậy đào, tìm chỗ trống không cây lớn, tới nơi rồi san
AUJ.flat=function(j){const n0=(S.flat||[]).length;if(j.n0==null)j.n0=n0;if(n0>j.n0)return AQ_DONE;j.lab='San nền khu ở';if(j.cf){const m=j.cf;j.cf=null;j.ci++;if(++j.gf>6)return aqFail(m);}
  if(j.st==='wait'){if(G.work)return AQ_RUN;j.st=null;if((S.flat||[]).length>j.n0)return AQ_DONE;j.ci++;}
  if(!hasTool('dig')){if(++j.g>3)return aqFail('Không làm được gậy đào.');aqPush({k:'get',id:'digStick',n:1,tries:0},j);return AQ_RUN;}
  const R=LAND_SZ[0][1];if(!j.c||j.ci>=j.c.length){if(j.c&&++j.round>2)return {fail:'Không thấy bãi trống nào gần trại để san nền (vướng cây lớn).',guide:'@flat'};const A=aq2Anchor();j.c=[];j.ci=0;
    for(let r=110;r<=620;r+=40)for(let a=0;a<14;a++){const ang=a/14*6.283+r*0.01+j.round,x=A.x+Math.cos(ang)*r,z=A.z+Math.sin(ang)*r;if(wdAt(x,z)>0||slopeAt(x,z)>0.3||hAt(x,z)<4)continue;
      let bad=false,wet=false;for(let k=0;k<8;k++)if(wdAt(x+Math.cos(k*0.785)*R,z+Math.sin(k*0.785)*R)>0){wet=true;break;}if(wet)continue;for(const i of near(x,z,R+20)){const q=RES[i];if(q.st===0&&!q.lock&&RT[q.t].tool==='axe'&&q.t!=='log'&&Math.hypot(q.x-x,q.z-z)<R){bad=true;break;}}if(bad)continue;
      if(S.builds.some(b=>Math.hypot(b.x-x,b.z-z)<R*0.85+10))continue;j.c.push({x,z,s:r+slopeAt(x,z)*500});}j.c.sort((a,b)=>a.s-b.s);j.c=j.c.slice(0,10);if(!j.c.length)return {fail:'Không thấy bãi trống nào gần trại để san nền.',guide:'@flat'};}
  const s=j.c[j.ci];if(aqD(s.x,s.z)>8)return aqGoto(j,s.x,s.z,5,'Tới bãi đất để san nền');const ng=needGate(true);if(ng)return AQ_RUN;
  landStart(R);if(!G.work){j.ci++;return AQ_RUN;}j.st='wait';return AQ_RUN;};
// công đoạn thiếu công cụ / vật liệu: tự đi kiếm
{const _s=AUJ.site;AUJ.site=function(j){try{const b=j.b;if(b&&BYID.has(b.id)&&b.prog!=null&&!j.cf&&j.st!=='wait'&&typeof STG!=='undefined'&&STG[b.k]){const s=b3stg(b);
      if(s&&s.s){if(s.s.tool&&!hasTool(s.s.tool)){const it=aqToolItem(s.s.tool);if(it&&++j.gg<=6){j.lab='Kiếm '+aqN(it).toLowerCase();aqPush({k:'get',id:it,n:1,tries:0},j);return AQ_RUN;}}
        if(s.paid<=s.i){for(const k in s.s.c)if(haveCount(k)<s.s.c[k]&&++j.gg<=12){j.lab='Gom vật liệu cho công đoạn';aqPush({k:'get',id:k,n:s.s.c[k],tries:0},j);return AQ_RUN;}}}}}catch(e){}
    return _s.apply(this,arguments);};}
// bảng mục tiêu: việc xây cơ bản giờ tự làm trọn
{const P_=(re,piece)=>()=>{const b=S.builds.find(b=>b.prog!=null&&(typeof re==='string'?b.k===re:re.test(b.k)));return b?{k:'site',b}:{k:'place',piece};};
  const T={'Dựng lều nghiêng':P_('leanto','leanto'),'Dựng bàn chế tác':P_('workbench','workbench'),'Lát nền nhà 4 ô':P_(GD_FLOOR,'floor'),'Dựng 6 bức vách':P_(GD_WALL,'wall'),'Lợp 4 tấm mái':P_(GD_ROOF,'roof'),'Dựng chỗ nặn gốm':P_('potter','potter'),'Xây lò nung':P_('kiln','kiln'),
    'Dựng kho thóc trên cột':P_('granary','granary'),'Dựng cột vật tổ':P_('totem','totem'),'Xây lò luyện đồng':P_('smelter','smelter'),'Đúc trống đồng Đông Sơn':P_('bronzeDrum','bronzeDrum'),'San nền khu ở':()=>({k:'flat'})};
  for(const t in T){AUG[t]=T[t];AQ_CREATIVE.delete(t);}
  const _fire=AUG['Nhóm ngọn lửa đầu tiên'];AUG['Nhóm ngọn lửa đầu tiên']=function(){const r=_fire();return r&&r.guide==='campfire'?{k:'place',piece:'campfire'}:r;};}
// ngủ mà chưa có chỗ ngủ: tự dựng lều thay vì dừng
{const _sl=AUJ.sleep;AUJ.sleep=function(j){const r=_sl.apply(this,arguments);if(r&&r.guide==='leanto'&&!j.pl_){j.pl_=1;const s=S.builds.find(b=>b.prog!=null&&b.k==='leanto');aqPush(s?{k:'site',b:s}:{k:'place',piece:'leanto'},j);return AQ_RUN;}return r;};}
/* ---------- bền hơn: thử lại trước khi dừng ---------- */
{const _st=aqStop;aqStop=function(msg,kind){if(msg&&/^🤖 Dừng tự làm/.test(msg)&&AQ.on&&AQ.gi>=0&&GOALS[AQ.gi]&&!/Túi đầy/.test(msg)&&(AQ.rt=(AQ.rt||0)+1)<=3){
      AQ.jobs=[];AQ.bl.clear();AQ.bad=[];AQ.cache.clear();AQ.path=null;AQ.dir=null;AQ.why2=msg;if(G.work)try{workStop('');}catch(e){}G.act=null;
      aqPush({k:'goal',gi:AQ.gi,stall:0},null);aqPush({k:'wait',t0:G.t,max:2.5,msg:'Gặp trục trặc, thử cách khác… (lần '+AQ.rt+')'},AQ.jobs[0]);aqUi(true);return;}
    return _st.apply(this,arguments);};
  const _sa=aqStart;aqStart=function(){AQ.rt=0;return _sa.apply(this,arguments);};
  const _fr=aqFinishRoot;aqFinishRoot=function(){AQ.rt=0;return _fr.apply(this,arguments);};
  const _pu=aqPush;aqPush=function(j,parent){if(AQ.rt>=1&&j&&j.k==='harvest')j.far=1;return _pu.apply(this,arguments);};}
/* ---------- lỡ chạm màn hình: tạm dừng rồi tự chạy tiếp ---------- */
{const _pa=aqPause;aqPause=function(){AQ.pT=G.t;return _pa.apply(this,arguments);};}
setInterval(()=>{try{if(!S||!G.on||!AQ.on||!AQ.pause)return;if(G.build||G.panel||G.sleeping||aqPlayerInput()||G.walkTo){AQ.pT=G.t;return;}if(G.t-(AQ.pT||0)>4){aqResume();uiToast('🤖 Tự làm tiếp…','');}}catch(e){}},700);
/* ---------- thiếu gì bấm là tự đi kiếm (bảng Chế tạo, bảng Xây) ---------- */
// Chế tạo: món đang thiếu vật liệu / công cụ có nút "🤖 Tự kiếm & làm" thay cho nút Làm bị mờ.
function aqNeedBtn(r){try{if(!S||!G.on||!r||!r.out)return false;if(r.lv&&!lvOk(r.lv))return false;if(r.age&&(S.age||0)<r.age)return false;return true;}catch(e){return false;}}
function aqNeedCraft(rid){const r=RECIPES.find(x=>x.id===rid);if(!r)return;const out=Object.keys(r.out)[0],c0=gC('craft:'+out);if(G.panel)uiClose();aqStart(-1,{job:{k:'craft',r,until:()=>gC('craft:'+out)>c0,lab0:'Làm '+aqN(out),lab:'Làm '+aqN(out)}});uiToast('🤖 Tự đi kiếm đủ đồ rồi làm '+aqN(out)+'. Bấm ✋ để dừng.','');}
// Xây: bấm vào công trình còn thiếu vật liệu → hỏi "tự đi gom" hay "vẫn mở xem".
function aqNeedAsk(id){const def=pieceDef(id);if(!def)return;let el=document.getElementById('aqask');if(!el){document.body.insertAdjacentHTML('beforeend','<div id="aqask" hidden></div>');el=document.getElementById('aqask');
    el.addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(!b&&e.target!==el)return;const k=b?b.dataset.q:'x',pid=el.dataset.id;el.hidden=true;if(k==='go'){const d=pieceDef(pid);if(G.panel)uiClose();aqStart(-1,{job:{k:'getAll',cost:Object.assign({},d.cost),lab0:'Gom vật liệu: '+d.n,lab:'Gom vật liệu: '+d.n}});AQ.after={gi:-1,piece:pid};uiToast('🤖 Đi gom đủ vật liệu cho '+d.n+'. Gom xong sẽ mở sẵn mục Xây cho bạn đặt.','');}
      else if(k==='open'){if(G.panel)uiClose();try{buildBegin(pid);}catch(e){}}});}
  const lack=Object.entries(def.cost||{}).filter(([k,n])=>haveCount(k)<n);el.dataset.id=id;
  el.innerHTML=`<div class="aqask-c"><b>${esc(def.n)}: còn thiếu</b><div class="aqask-l">${lack.map(([k,n])=>`<span>${icon(k)} ${haveCount(k)}/${n} ${esc(aqN(k))}</span>`).join('')}</div><div class="aqask-r"><button class="btn" data-q="go">🤖 Tự đi gom cho đủ</button><button class="btn ghost" data-q="open">Vẫn mở xem</button><button class="btn ghost" data-q="x">Thôi</button></div></div>`;el.hidden=false;sfx('pick');}
document.addEventListener('click',e=>{if(!S||!G.on)return;const t=e.target&&e.target.closest&&e.target.closest('[data-a="aqneed"],[data-a="build"]');if(!t)return;
  if(t.dataset.a==='aqneed'){e.stopImmediatePropagation();e.preventDefault();aqNeedCraft(t.dataset.r);return;}
  const def=pieceDef(t.dataset.b);if(def&&def.cost&&!canPay(def.cost)&&(!def.lv||lvOk(def.lv))){e.stopImmediatePropagation();e.preventDefault();aqNeedAsk(def.id);}},true);
{const st=document.createElement('style');st.textContent=`#aqask{position:fixed;inset:0;z-index:70;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.45);padding:12px}#aqask[hidden]{display:none}
.aqask-c{width:min(420px,100%);padding:14px;border-radius:16px;background:#1c130c;border:1px solid #f2c55a;color:#f6ead2;box-shadow:0 10px 30px rgba(0,0,0,.6);margin-bottom:max(8px,env(safe-area-inset-bottom))}.aqask-c>b{font-size:16px}
.aqask-l{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.aqask-l span{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:10px;background:rgba(255,90,60,.16);border:1px solid rgba(255,120,90,.4);font-size:13px}.aqask-l .ic{width:22px;height:22px}
.aqask-r{display:flex;flex-direction:column;gap:7px}.aqask-r .btn{min-height:44px}#game .panel .aq-need{background:linear-gradient(180deg,#3b7a34,#2a5a26);border-color:#6ab85a;color:#fff}`;document.head.appendChild(st);}
/* ---------- nung gốm: tự làm được; các việc còn phải tự tay thì chỉ dẫn từng bước ---------- */
AUG['Nung nồi gốm đầu tiên']=()=>{/* gốm mộc phơi trên giàn phải chờ lâu: tự làm thì nặn nồi mộc rồi nung thẳng (dễ nứt hơn, nứt thì làm lại) */const r=RECIPES.find(x=>x.id==='potRush')||aqRecipe('pot');return r?{k:'craft',r,until:()=>gC('craft:pot')>0}:{guide:'@pot'};};delete AQ_GUIDEONLY['Nung nồi gốm đầu tiên'];
Object.assign(AQ_GTXT,{'@pot':['🏺','Nặn và nung gốm: từng bước','① Kiếm đất sét (bờ suối, bãi bồi) và cát. ② Đứng cạnh Chỗ nặn gốm, mở Chế tạo → Nồi mộc. ③ Chờ nồi mộc khô. ④ Bỏ củi, nhóm Lò nung, đứng cạnh lò mở Chế tạo → Nồi gốm. Bấm 🤖 ở món đang thiếu để nhân vật tự đi kiếm.'],
  '@farm':['🌾','Làm ruộng: từng bước','① Xây → Luống đất (hoặc Ruộng lúa cạnh nước). ② Cầm hạt giống, đứng cạnh luống bấm Hành động để gieo. ③ Tưới nước khi đất khô. ④ Cây chín (ngả vàng) thì bấm Hành động để thu. Có luống chín, nút Tự làm sẽ thu hoạch giúp.'],
  '@fest':['🥁','Mở hội làng: từng bước','① Chế tạo → Trống da (da thú + khúc gỗ). ② Chờ ngày Hội xuân / Hội mùa (xem 🏮 Làng). ③ Đứng cạnh bếp lửa, chọn Trống da trong túi → Dùng. Hoặc dựng Đài trống hội rồi bấm Hành động.'],
  '@folk':['🏘️','Mời người về ở: từng bước','① Dựng thêm một Giường trống trong nhà. ② Tới làng bên (🗺️ Bản đồ), đổi đồ hoặc tặng quà vài lần cho thân. ③ Trò chuyện với một người → Mời về ở cùng.']});
// lánh thú dữ: về trại, chờ 20 giây cho thú bỏ đi rồi mới làm tiếp (trước đây về tới nơi là quay lại ngay, gặp đúng con thú đó, lặp mãi)
AUJ.camp=function(j){if(j.cf)return AQ_DONE;const hb=aqBed()||aqFire();if(!hb)return AQ_DONE;if(j.w==null&&aqD(hb.x,hb.z)>90)return aqGoto(j,hb.x,hb.z,60,'Lánh thú dữ: về trại',{far:1});if(j.w==null)j.w=G.t;j.lab='Chờ thú dữ bỏ đi';return G.t-j.w>20?AQ_DONE:AQ_RUN;};
