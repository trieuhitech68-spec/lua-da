/* ---------- HÀNG RÀO, TƯỜNG CHẶN CẢ NGƯỜI LÀNG, THỔ DÂN, KẺ ĐỊCH ----------
   Trước: chỉ người chơi và thú bị rào, tường chặn; người làng, lính, thổ dân làng bên, chiến binh địch đi xuyên qua rào như không có.
   Giờ: · Bước nào cắt qua rào, tường thì bị chặn lại. Cửa, cổng: người làng mình và thổ dân qua được; kẻ địch thì không (cổng coi như cài then).
        · Người làng, lính bị rào chặn sẽ tự tìm cổng gần nhất, đi vòng qua cổng rồi đi tiếp. Không có cổng nào thì báo cho người chơi làm cổng.
        · "Tự làm" gặp rào của chính mình quây kín không có lối: tự đổi một đoạn rào trên đường đi thành cổng (tốn vật liệu làm cổng) rồi đi tiếp. */
const RAO={ox:[],oz:[],warn:-999};
function rcCross(ox,oz,x,z,py,shut){if(!OCC.edge.size)return false;let segs;solSegs.shut=shut?1:0;try{segs=solSegs(ox,oz,x,z,py);}finally{solSegs.shut=0;}for(let i=0;i<segs.length;i++){const s=segs[i];if(solX(ox,oz,x,z,s[0],s[1],s[2],s[3])){RAO.seg=s;return true;}}return false;}
function rcGate(x,z){let best=null,bd=520;for(const b of S.builds){if(b.prog!=null)continue;const d=pieceDef(b.k);if(!d||!d.door||d.kind!=='edge'||!solDoorOpen(b))continue;const dd=Math.hypot(b.x-x,b.z-z);if(dd<bd){bd=dd;best=b;}}return best;}
// chặn một danh sách người đi bộ; det=true: bị chặn thì vòng qua cổng
function rcGuard(L,shut,det,dt){const n=L.length,ox=RAO.ox,oz=RAO.oz;for(let i=0;i<n;i++){const f=L[i];if(!f||f.x==null||Math.abs(f.x-P.x)>800||Math.abs(f.z-P.z)>800||f.alive===false)continue;
    let nx=f.x,nz=f.z;const px=ox[i],pz=oz[i];if(px==null)continue;const py=hAt(px,pz)+2,want=Math.hypot(nx-px,nz-pz),gx=f._gx!=null?f._gx:f.tx,gz=f._gz!=null?f._gz:f.tz;
    if(f._pl){/* đang tính đường vòng (chia nhỏ qua nhiều khung hình) */try{aqPlanStep(f._pl,220);}catch(e){f._pl.fail=true;}
      if(f._pl.ok){f._det=f._pl.pts.slice(1).map(q=>({x:q[0],z:q[1]}));f._det.push({x:f._pl.gx,z:f._pl.gz});f._detG=[f._pl.gx,f._pl.gz];f._detT=45;f._pl=null;}
      else if(f._pl.fail){f._pl=null;if(det&&!rcGate(px,pz)&&G.t-RAO.warn>180){RAO.warn=G.t;uiToast('🚧 Người làng bị hàng rào chặn, không có cổng để qua. Dựng một Cổng rào (Xây → Rào) cho họ ra vào.','');}}}
    if(f._det){/* đi theo đường vòng đã tính: bỏ bước của game */const w=f._det[0],dx=w.x-px,dz=w.z-pz,d=Math.hypot(dx,dz);f._detT-=dt;nx=px;nz=pz;
      if(f._detT<=0||(gx!=null&&Math.hypot(gx-f._detG[0],gz-f._detG[1])>90))f._det=null;/* quá lâu hoặc đích đã đổi: bỏ, tính lại khi cần */
      else if(d<6){f._det.shift();if(!f._det.length)f._det=null;}
      else{const st=Math.min(d,64*dt);nx=px+dx/d*st;nz=pz+dz/d*st;if(rcCross(px,pz,nx,nz,py,shut)){nx=px;nz=pz;f._det=null;}else f._ry=Math.atan2(dx,dz);}
      f.x=nx;f.z=nz;}
    else if(want<0.01||want>300){f.x=nx;f.z=nz;}
    else if(!rcCross(px,pz,nx,nz,py,shut)){f.x=nx;f.z=nz;f._blk=0;}
    else{/* bước này cắt qua rào, tường: đứng lại; người mình và thổ dân thì tính đường vòng qua cổng tới đích */f.x=px;f.z=pz;f._blk=(f._blk||0)+dt;
      if(shut)try{rcBreak(f,dt);}catch(e){}
      if(!shut&&f._blk>0.3&&!f._pl&&gx!=null&&!(f._plT>G.t)&&typeof aqPlanStart==='function'){f._plT=G.t+5;f._blk=0;try{f._pl=aqPlanStart(px,pz,gx,gz,14,false);}catch(e){f._pl=null;}}}
    if(f._o&&f._o.position){f._o.position.x=f.x;f._o.position.z=f.z;if(f._ry!=null&&f._det)f._o.rotation.y=f._ry;}else if(f.o&&f.o.position){f.o.position.x=f.x;f.o.position.z=f.z;}}}
function rcSnap(L){const ox=RAO.ox,oz=RAO.oz;ox.length=0;oz.length=0;for(let i=0;i<L.length;i++){const f=L[i];ox.push(f?f.x:null);oz.push(f?f.z:null);}}
{const wrap=(name,get,shut,det)=>{try{const f0=(0,eval)(name);if(typeof f0!=='function')return;window.__rcw=function(dt){let L=null;try{if(S&&G.on&&OCC.edge.size){L=get();if(L&&L.length)rcSnap(L);else L=null;}}catch(e){L=null;}const r=f0.apply(this,arguments);if(L)try{rcGuard(L,shut,det,dt||0.016);}catch(e){if(!RAO.err){RAO.err=1;console.warn('rào chặn',e);}}return r;};(0,eval)(name+'=__rcw');}catch(e){}};
  wrap('folkTick',()=>S.folk,false,true);wrap('npcTick',()=>G.npcs,false,false);wrap('foesTick',()=>G.foes,true,false);try{delete window.__rcw;}catch(e){}}
// Tự làm: rào của mình quây kín, không tìm được đường → đổi đoạn rào nằm trên đường đi thành cổng
function rcOpenGate(j){if(!S||!OCC.edge.size)return false;let best=null,bd=1e9;for(const b of S.builds){if(b.remote||b.prog!=null)continue;const d=pieceDef(b.k);if(!d||d.kind!=='edge'||d.door||!/fence|palisade|rail|rào/i.test(b.k+' '+(d.n||'')))continue;const dd=Math.hypot(b.x-P.x,b.z-P.z);if(dd>700)continue;
    const ax=b.r%2?b.x:b.x-23,az=b.r%2?b.z-23:b.z,bx=b.r%2?b.x:b.x+23,bz=b.r%2?b.z+23:b.z;/* dài thêm 3 mỗi đầu: đường đi trúng đúng mối nối hai đoạn rào vẫn tính là cắt */if(!solX(P.x,P.z,j.x,j.z,ax,az,bx,bz))continue;if(dd<bd){bd=dd;best=b;}}
  if(!best)return false;const gid=/palisade/i.test(best.k)&&pieceDef('palisadeGate')?'palisadeGate':'gate',gd=pieceDef(gid);if(!gd)return false;
  if(!canPay(gd.cost)){if(G.t-(RAO.gw||-999)>60){RAO.gw=G.t;uiToast('🚧 Hàng rào quây kín không có lối ra. Cần '+Object.entries(gd.cost).map(([k,v])=>v+' '+(ITEMS[k]?ITEMS[k].n.toLowerCase():k)).join(', ')+' để mở một cổng.','bad');}return false;}
  pay(gd.cost);try{structRemove(best);}catch(e){}best.k=gid;try{structAdd(best,true);}catch(e){}try{occMark(best,best.id);}catch(e){}aqSay('🤖 Hàng rào quây kín không có lối: đã mở một '+gd.n.toLowerCase()+' ở đoạn rào trên đường đi.','good');sfx('build');save();return true;}

/* ---------- kẻ địch phá rào ----------
   Kẻ địch bị rào, tường của mình chặn sẽ đứng lại phá: rào thường chịu được khoảng 12 giây, rào cọc và tường chắc hơn (tới 60 giây), nhiều tên cùng phá thì nhanh hơn.
   Bị phá thủng thì đoạn đó thành công trình dở dang (45%), ai cũng đi lọt; tới cạnh bấm Hành động để dựng lại (không tốn thêm vật liệu). */
function rcBreak(f,dt){const sg=RAO.seg;if(!sg)return;const mx=(sg[0]+sg[2])/2,mz=(sg[1]+sg[3])/2;let b=f._bt&&BYID.get(f._bt.id)===f._bt&&f._bt.prog==null&&Math.hypot(f._bt.x-mx,f._bt.z-mz)<30?f._bt:null;
  if(!b){let bd=30;for(const o of S.builds){if(o.remote||o.prog!=null)continue;const d=pieceDef(o.k);if(!d||d.kind!=='edge')continue;const dd=Math.hypot(o.x-mx,o.z-mz);if(dd<bd){bd=dd;b=o;}}f._bt=b;}
  if(!b)return;const def=pieceDef(b.k);if(b._hp==null){let c=0;for(const k in def.cost||{})c+=def.cost[k];b._hp=clamp(4+c*1.4,10,60);b._hp0=b._hp;}
  b._hp-=dt;f._ry=Math.atan2(b.x-f.x,b.z-f.z);f._hitT=(f._hitT||0)-dt;if(f._hitT<=0){f._hitT=1.3;try{puff(b.x,(b.y||hAt(b.x,b.z))+18,b.z,'#a88a62',5);if(Math.hypot(b.x-P.x,b.z-P.z)<500)sfx('thud');}catch(e){}
    if(G.t-(RAO.bw||-999)>25&&Math.hypot(b.x-P.x,b.z-P.z)<900){RAO.bw=G.t;uiToast('⚠️ Kẻ địch đang phá '+def.n.toLowerCase()+'! Ra đánh đuổi trước khi rào thủng.','bad');}}
  if(b._hp<=0){b._hp=null;b.prog=0.45;if(typeof STG!=='undefined'&&STG[b.k])b.paid=STG[b.k].length;if(b.cond!=null)b.cond=60;try{siteShow(b);}catch(e){}try{puff(b.x,(b.y||hAt(b.x,b.z))+14,b.z,'#8a6a42',16);sfx('fall');}catch(e){}
    uiToast('💥 Kẻ địch đã phá thủng '+def.n.toLowerCase()+'! Tới cạnh bấm Hành động để dựng lại.','bad');f._bt=null;try{cnt('cnt','breach');}catch(e){}save();}}
