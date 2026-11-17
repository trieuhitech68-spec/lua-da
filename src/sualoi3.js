/* ===================== sualoi3: RUỘNG LIỀN NHAU CÙNG MỘT MẶT · THÚ KHÔNG CHỒNG LÊN NHAU, KHÔNG LỌT VÀO NHÀ =====================
   1) Mấy thửa ruộng nước đặt sát nhau trên đất hơi dốc: mỗi thửa tự san đất theo cao độ riêng, thửa sau đè cao độ của mình lên phần đất
      chung với thửa trước → đất nhô lên xuyên qua mặt nước thửa bên cạnh. Giờ các thửa (và ao cá) sát nhau được đưa về CÙNG một cao độ
      (lấy thửa cao nhất), đất bên dưới san lại một lượt theo cao độ đó.
   2) Ngựa, voi gọi về hay để lại đều đứng trùng một điểm, chồng vào nhau, có con lọt vào trong nhà. Giờ mỗi con một chỗ: gọi về thì xếp
      quanh người; con nào đứng trùng con khác hoặc đứng trên nền nhà (trừ chuồng ngựa) thì tự dời ra chỗ trống gần nhất.
   3) Vật nuôi đi lại không còn xuyên qua nhau (đẩy nhẹ ra) và không đi vào nền nhà. */
const SL3={};
function sl3Pads(){let ch=0;try{if(typeof SOL_FLAT==='undefined'||typeof flatApply!=='function'||!S||!S.builds)return 0;const L=S.builds.filter(b=>(b.k==='paddy'||b.k==='fishPond')&&b.prog==null&&!b.remote);if(L.length<2)return 0;
    const par=L.map((_,i)=>i),find=i=>par[i]===i?i:(par[i]=find(par[i]));for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++)if(Math.abs(L[i].x-L[j].x)<=84&&Math.abs(L[i].z-L[j].z)<=84&&Math.abs(L[i].y-L[j].y)<14)par[find(i)]=find(j);
    const top={};L.forEach((b,i)=>{const r=find(i);if(top[r]==null||b.y>top[r])top[r]=b.y;});const re=[];
    L.forEach((b,i)=>{const y=top[find(i)];if(Math.abs(b.y-y)<0.15&&b.fl)return;if(wdAt(b.x,b.z)>0.5)return;b.y=+y.toFixed(2);try{const e=piecePrep(b.k),idx=e.map.get(b.id);if(idx!=null){setPieceM(e.api,idx,b);e.api.flush();}}catch(e){}
      S.flat=(S.flat||[]).filter(f=>!(Math.hypot(f.x-b.x,f.z-b.z)<12&&f.r<=80));const f={x:+b.x.toFixed(1),z:+b.z.toFixed(1),r:SOL_FLAT[b.k]||74,h:+(b.y-0.9).toFixed(2)};S.flat.push(f);b.fl=1;re.push([b,f]);ch++;});
    if(ch){/* áp lại cả cụm theo cao độ chung, rồi mới dựng lại mặt đất một lượt */for(const [b,f] of re)flatApply(f);for(const [b,f] of re){try{landRebuild(f);}catch(e){}try{if(b.k==='paddy'&&typeof l4PadShow==='function')l4PadShow(b);}catch(e){}}
      try{for(const [b] of re)for(const i of near(b.x,b.z,130)){const q=RES[i];if(q.wy!=null)continue;const ny=hAt(q.x,q.z)-1.2;if(Math.abs(ny-q.y)>0.3){q.y=ny;resShow(q);}}RI.forEach(v=>v.api.flush());}catch(e){}G.gLast=null;try{P.y=groundY(P.x,P.z);}catch(e){}save();}}catch(e){console.warn('ruộng liền thửa',e);}return ch;}
if(typeof siteDone==='function'){const _sd=siteDone;siteDone=function(b){const r=_sd.apply(this,arguments);try{if(b&&(b.k==='paddy'||b.k==='fishPond'))setTimeout(sl3Pads,300);}catch(e){}return r;};}
setTimeout(function chk(){try{if(typeof G==='undefined'||!G.on||!S||!S.builds||!G.terrain){setTimeout(chk,3000);return;}sl3Pads();}catch(e){}},9000);
/* ---------- thú cưỡi: mỗi con một chỗ ---------- */
function sl3Floor(x,z){try{const c=cellAt(x,z);return !!(c&&c.floor);}catch(e){return false;}}
function sl3Stable(x,z){try{return S.builds.some(b=>(b.k==='trough'||b.k==='hayPile')&&b.prog==null&&Math.hypot(b.x-x,b.z-z)<95);}catch(e){return false;}}
function sl3FreeM(x,z,me){try{if(cellBusy(x,z)||hAt(x,z)<1.5||wdAt(x,z)>0)return false;const c=collide(x,z);if(Math.hypot(c[0]-x,c[1]-z)>3)return false;if(Math.hypot(x-P.x,z-P.z)<30)return false;
    for(const m of S.mounts||[]){if(m===me||m.x==null||G.mnt===m||(m.land||'c')!==((S&&S.land)||'c'))continue;if(Math.hypot(m.x-x,m.z-z)<44)return false;}return true;}catch(e){return false;}}
function sl3Spot(x,z,me,r0){for(let r=r0||0;r<=320;r+=30){const n=r?Math.max(8,Math.round(r/14)):1;for(let i=0;i<n;i++){const a=i/n*6.283+r*0.37,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;if(sl3FreeM(px,pz,me))return [px,pz];}}return null;}
function sl3Put(m,p){m.x=+p[0].toFixed(1);m.z=+p[1].toFixed(1);try{const o=typeof MT==='object'&&MT.o.get(m.id);if(o)o.position.set(m.x,hAt(m.x,m.z),m.z);}catch(e){}}
function sl3Mounts(){let ch=0;try{const here=(S&&S.land)||'c',L=(S.mounts||[]).filter(m=>m.x!=null&&G.mnt!==m&&m.sol==null&&(m.land||'c')===here);for(let i=0;i<L.length;i++){const m=L[i];let bad=sl3Floor(m.x,m.z)&&!sl3Stable(m.x,m.z);if(!bad)for(let j=0;j<i;j++)if(Math.hypot(L[j].x-m.x,L[j].z-m.z)<40){bad=true;break;}if(!bad)continue;const p=sl3Spot(m.x,m.z,m,30);if(p){sl3Put(m,p);ch++;}}if(ch)save();}catch(e){}return ch;}
if(typeof tvCall==='function'){const _tc=tvCall;tvCall=function(m){const x0=m&&m.x,z0=m&&m.z;const r=_tc.apply(this,arguments);try{if(m&&(m.x!==x0||m.z!==z0)){const p=sl3Spot(P.x-Math.sin(P.ry||0)*50,P.z-Math.cos(P.ry||0)*50,m,0);if(p){sl3Put(m,p);save();}}}catch(e){}return r;};}
if(typeof mtOff==='function'){const _mo=mtOff;mtOff=function(){const r=_mo.apply(this,arguments);try{sl3Mounts();}catch(e){}return r;};}
setInterval(()=>{try{if(typeof G==='object'&&G.on&&!G.paused&&S)sl3Mounts();}catch(e){}},2500);
/* ---------- vật nuôi: không xuyên qua nhau, không vào nền nhà ---------- */
const SL3_R={pig:11,buffalo:15,calfB:10,goat:10,dog:9,kid:7,piglet:7,puppy:6,chicken:5,duck:5,rabbit:5,chick:3.5,duckling:3.5,bunny:3.5};
{const _pt=petsTick;petsTick=function(dt){const L=(S&&S.pets)||[];for(const p of L){p._px=p.x;p._pz=p.z;}const r=_pt.apply(this,arguments);try{const n=L.length;
      for(let i=0;i<n;i++){const a=L[i];if(sl3Floor(a.x,a.z)&&!sl3Floor(a._px,a._pz)){/* định bước lên nền nhà: đứng lại, chọn hướng khác */a.x=a._px;a.z=a._pz;a._t=0;}
        const ra=SL3_R[a.k]||7;for(let j=i+1;j<n;j++){const b=L[j],dx=b.x-a.x,dz=b.z-a.z;if(dx>30||dx<-30||dz>30||dz<-30)continue;const d=Math.hypot(dx,dz),m=ra+(SL3_R[b.k]||7);if(d>=m)continue;const k=(m-d)/2*Math.min(1,dt*6),ux=d>0.01?dx/d:Math.cos(i*2.4),uz=d>0.01?dz/d:Math.sin(i*2.4);a.x-=ux*k;a.z-=uz*k;b.x+=ux*k;b.z+=uz*k;}}
      for(const p of L)if(p._o&&(p.x!==p._ox||p.z!==p._oz)){p._ox=p.x;p._oz=p.z;p._o.position.x=p.x;p._o.position.z=p.z;}}catch(e){}return r;};}
/* ---------- NGỰA TỰ VỀ CHUỒNG · CHUỒNG THÚ CHIẾN · THÚ CHIẾN ĐANG NGHỈ HIỆN Ở LÀNG ----------
   · Xuống ngựa trong làng mình mà làng có Chuồng ngựa chiến: ngựa tự về chuồng (mỗi ô chuồng một con, hết ô thì đứng trước chuồng).
   · Thú chiến (khỉ, gấu, hổ): trước chỉ con đang xuất chiến hiện ra, các con còn lại "biến mất". Giờ các con đang nghỉ nằm ở Chuồng thú chiến
     (nhà mới trong bảng Xây → Quân sự); chưa có chuồng thì nằm quanh bếp lửa / chỗ ngủ của làng. */
function sl3StableSlots(){const out=[];try{for(const b of S.builds){if(b.ht==='qh_chuongngua'&&b.prog==null&&!b.remote&&pieceDef(b.k)&&pieceDef(b.k).kind==='floor')out.push([b.x,b.z]);}}catch(e){}return out;}
{const _st=sl3Stable;sl3Stable=function(x,z){try{if(S.builds.some(b=>b.ht==='qh_chuongngua'&&Math.hypot(b.x-x,b.z-z)<70))return true;}catch(e){}return _st.apply(this,arguments);};}
function sl3Home(m){try{const sl=sl3StableSlots();if(!sl.length)return false;let near=1e9;for(const s of sl)near=Math.min(near,Math.hypot(s[0]-P.x,s[1]-P.z));const mine=near<700||(typeof kpIn==='function'&&kpIn(P.x,P.z)&&near<1400);if(!mine)return false;
    const here=(S&&S.land)||'c',oth=(S.mounts||[]).filter(o=>o!==m&&o.x!=null&&G.mnt!==o&&(o.land||'c')===here);sl.sort((a,b)=>Math.hypot(a[0]-m.x,a[1]-m.z)-Math.hypot(b[0]-m.x,b[1]-m.z));
    for(const s of sl){if(oth.some(o=>Math.hypot(o.x-s[0],o.z-s[1])<34))continue;sl3Put(m,s);return true;}const p=sl3Spot(sl[0][0],sl[0][1],m,50);if(p){sl3Put(m,p);return true;}}catch(e){}return false;}
{const _mo=mtOff;mtOff=function(q){const m=G.mnt;const r=_mo.apply(this,arguments);try{if(m&&!q&&G.mnt!==m)setTimeout(()=>{try{if(G.mnt===m||m.sol!=null)return;if(sl3Home(m)){uiToast((m.k==='elephant'?'🐘 ':'🐎 ')+esc(m.n||'Thú cưỡi')+' tự về chuồng.','');save();}}catch(e){}},1600);}catch(e){}return r;};}
try{if(typeof QH!=='undefined'&&typeof bpMake==='function'&&!QH.some(x=>x.id==='qh_chuongthu')){const q={id:'qh_chuongthu',g:'Quân sự',n:'Chuồng thú chiến',ic:'🐯',fx:'Thú chiến đang nghỉ (khỉ, gấu, hổ) nằm ở đây thay vì quanh bếp lửa',d:'Chuồng 2×1 ô mái lá, ba mặt vách, mặt trước để trống, lót ổ rơm. Mỗi ô một con; nuôi nhiều thì dựng thêm chuồng.',key:'roof',fn:A=>{for(let i=0;i<2;i++){A.F(i,0,'floor');A.R(i,0,'roof',0);A.E(i,0,'n','wall');}A.E(0,0,'w','wall');A.E(1,0,'e','wall');}};q.bp=bpMake(q.id,q.n,q.ic,0,q.d,q.fn);QH.push(q);}}catch(e){console.warn('chuồng thú chiến',e);}
SL3.rest=new Map();
function sl3RestSpots(n){const out=[];try{for(const b of S.builds){if(b.ht==='qh_chuongthu'&&b.prog==null&&!b.remote&&pieceDef(b.k)&&pieceDef(b.k).kind==='floor')out.push([b.x,b.z,1]);}
    if(out.length<n){const den=out[0],h=den?{x:den[0],z:den[1]}:(typeof homePos==='function'?homePos():null);if(h){for(let r=den?70:90;r<=260&&out.length<n;r+=40)for(let i=0;i<10&&out.length<n;i++){const a=i/10*6.283+r*0.21,x=h.x+Math.cos(a)*r,z=h.z+Math.sin(a)*r;if(cellBusy(x,z)||hAt(x,z)<1.5||wdAt(x,z)>0)continue;if(out.some(o=>Math.hypot(o[0]-x,o[1]-z)<36))continue;const c=collide(x,z);if(Math.hypot(c[0]-x,c[1]-z)>3)continue;out.push([x,z,0]);}}}}catch(e){}return out;}
function sl3Rest(){try{if(!G.sc||!S||typeof ltS!=='function')return;const L=ltS(),rest=L.list.filter(p=>p.id!==L.act),want=new Map(),sp=rest.length?sl3RestSpots(rest.length):[];let sig='';for(const s of sp)sig+=Math.round(s[0])+','+Math.round(s[1])+';';
    rest.forEach((p,i)=>{if(sp[i])want.set(p.id+':'+(p.st||0)+':'+p.k,sp[i]);});
    for(const [k,o] of SL3.rest){if(!want.has(k)||SL3.sig!==sig){G.sc.remove(o);SL3.rest.delete(k);}}SL3.sig=sig;
    for(const [k,s] of want){if(SL3.rest.has(k))continue;const p=rest.find(x=>(x.id+':'+(x.st||0)+':'+x.k)===k);if(!p)continue;const o=ltModel(p);o.position.set(s[0],hAt(s[0],s[1])+(s[2]?1.2:0),s[1]);o.rotation.y=(p.id*2.4)%6.283;G.sc.add(o);try{seasonPatchAll(o);}catch(e){}SL3.rest.set(k,o);}}catch(e){}}
setInterval(()=>{try{if(typeof G==='object'&&G.on&&S)sl3Rest();}catch(e){}},2000);
