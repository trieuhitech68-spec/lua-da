/* ===================== THỰC THỂ ĐẶC: KHÔNG ĐI XUYÊN TƯỜNG, NHÀ, LỀU, GIƯỜNG, CHUỒNG, THÚ, NGƯỜI =====================
   Bổ sung cho collide():
   1. Chống lọt tường: máy giật / chạy nhanh / lăn / lướt làm một bước dài hơn bề dày tường thì trước đây chui qua. Giờ kiểm tra cả đoạn đường
      từ chỗ đứng tới chỗ mới; cắt ngang tường, cột hay công trình đặc là trượt dọc theo hoặc đứng lại. Lối cửa vẫn đi qua được.
   2. Công trình nhiều ô và giường (lều nghiêng, lều da, giường, chuồng lợn, chuồng trâu, chuồng dê, kho thóc lớn, mộ…) trước không chặn: giờ đặc theo
      hình chữ nhật. Ruộng, mương, ao, sàn, cầu thang, bếp có mái che vẫn bước lên được.
   3. Thú, dân làng, người chơi khác: không đứng lồng vào nhau nữa (thú nuôi, thú đã gục thì bỏ qua để không kẹt cửa). */
/* LỀU VÀO ĐƯỢC: hình vách của từng loại lều trong toạ độ riêng (mặt trước là +z), để hở phía cửa.
   Lều nghiêng: vách sau và hai vách bên, mặt trước mở hẳn. Lều da: vòng tròn bán kính 31, hở cửa rộng 18 ở mặt trước. */
const SOL_SH={leanto:[[-20,-36,20,-36],[-20,-36,-20,29],[20,-36,20,29]],
  tent:(()=>{const a=[],R=31,n=14,g=0.3;for(let i=0;i<n;i++){const t0=g+(i/n)*(Math.PI*2-2*g),t1=g+((i+1)/n)*(Math.PI*2-2*g);a.push([Math.sin(t0)*R,Math.cos(t0)*R,Math.sin(t1)*R,Math.cos(t1)*R]);}return a;})()};
function solShSegs(b,out){const L=SOL_SH[b.k];if(!L||b.prog!=null&&b.prog<0.5)return;const th=(b.r||0)*Math.PI/2,c=Math.cos(th),s=Math.sin(th);for(const q of L){/* kéo dài mỗi đoạn 2 đơn vị ở hai đầu: đi đúng vào chỗ hai đoạn nối nhau không bị lọt qua khe */const dx=q[2]-q[0],dz=q[3]-q[1],l=Math.hypot(dx,dz)||1,ex=dx/l*2,ez=dz/l*2,x0=q[0]-ex,z0=q[1]-ez,x1=q[2]+ex,z1=q[3]+ez;out.push([b.x+x0*c+z0*s,b.z-x0*s+z0*c,b.x+x1*c+z1*s,b.z-x1*s+z1*c]);}}
const SOL_WALK=/^(paddy|channel|fishPond|drumStage|treePlatform|stiltDeck2|bambooStairs|logStairs|kitchenShed|farm|stilt|stiltBamboo|stairs|rug|sleepMat|hammock|spikePit|trap|fishTrap)$/;
function solRectOf(b){const def=pieceDef(b.k);if(!def||def.kind!=='obj'||SOL_WALK.test(b.k)||def.farm)return null;if(SOL_SH[b.k])return null;/* lều: vào được từ phía cửa, vách chặn bằng các đoạn tường (solShSegs) */const fp=def.fp||[1,1];if(fp[0]*fp[1]<2)return null;if(def.bed&&!def.shelter)return null;/* giường kê trong nhà: bước qua được, kẻo nhà nhỏ hết lối đi */
  if(b.prog!=null&&b.prog<0.5)return null;const w=(b.r%2?fp[1]:fp[0])*CELL/2-3,d=(b.r%2?fp[0]:fp[1])*CELL/2-3;return [b.x-w,b.z-d,b.x+w,b.z+d];}
const SOL_E=[];/* mảng rỗng dùng chung khi quanh đây không có công trình: khỏi tạo mảng, tập hợp, chuỗi khoá mỗi khung hình */
function solRects(x,z,py){if(OCC.cell.size===0)return SOL_E;const out=[],ci=Math.floor(x/CELL),cj=Math.floor(z/CELL);let seen=null;for(let i=ci-3;i<=ci+3;i++)for(let j=cj-3;j<=cj+3;j++){const c=OCC.cell.get(colKey(i,j,0).cell);if(!c)continue;if(!seen)seen=new Set();
    for(let L=0;L<=LVMAX;L++){const id=c[slotN('obj',L)];if(!id||seen.has(id))continue;seen.add(id);const b=BYID.get(id);if(!b||Math.abs(b.y-py)>40||py>=b.y+SOL_HUT-4)continue;/* đang đứng trên nóc thì không bị đẩy */const r=solRectOf(b);if(r)out.push(r);}}return out;}
// các đoạn tường (đã trừ lối cửa) + cột quanh một vùng
function solSegs(x0,z0,x1,z1,py){if(OCC.edge.size===0&&OCC.cell.size===0)return SOL_E;const out=[],i0=Math.floor(Math.min(x0,x1)/CELL)-1,i1=Math.floor(Math.max(x0,x1)/CELL)+1,j0=Math.floor(Math.min(z0,z1)/CELL)-1,j1=Math.floor(Math.max(z0,z1)/CELL)+1;if((i1-i0)*(j1-j0)>400)return out;
  if(OCC.edge.size)for(let L=0;L<=LVMAX;L++)for(let i=i0;i<=i1+1;i++)for(let j=j0;j<=j1+1;j++){const K=colKey(i,j,L);for(let r=0;r<2;r++){const id=OCC.edge.get(r?K.v:K.h);if(!id)continue;const b=BYID.get(id);if(!b)continue;if(b.prog!=null&&b.prog<0.6)continue;/* rào, tường đang dựng dở dưới 60% hoặc vừa bị phá thủng: chưa chắn được ai */const def=pieceDef(b.k);if(!def||/ladder/i.test(b.k))continue;
      if(py+30<b.y||py>(def.low?Math.max(b.y,hAt(b.x,b.z))+(P.air?11:26):b.y+46))continue;const ax=r?b.x:b.x-20,az=r?b.z-20:b.z,bx=r?b.x:b.x+20,bz=r?b.z+20:b.z,sg=def.door&&!solSegs.shut&&solDoorOpen(b)?SOL_SGD:SOL_SGF;/* solSegs.shut=1: coi mọi cửa, cổng là đóng (dùng cho kẻ địch) */for(let q=0;q<sg.length;q+=2){const s0=sg[q],s1=sg[q+1];out.push([ax+(bx-ax)*s0,az+(bz-az)*s0,ax+(bx-ax)*s1,az+(bz-az)*s1]);}/* dài thêm mỗi đầu 3 đơn vị: bịt khe ở góc nhà */}}
  try{let seen=null;if(OCC.cell.size)for(let i=i0-1;i<=i1+1;i++)for(let j=j0-1;j<=j1+1;j++){const c=OCC.cell.get(colKey(i,j,0).cell);if(!c)continue;const id=c[slotN('obj',0)];if(!id)continue;if(!seen)seen=new Set();if(seen.has(id))continue;seen.add(id);const b=BYID.get(id);if(b&&SOL_SH[b.k]&&Math.abs(b.y-py)<40)solShSegs(b,out);}}catch(e){}
  return out;}
const SOL_SGD=[-0.08,0.17,0.83,1.08],SOL_SGF=[-0.08,1.08];
const solX=(a,b,c,d,p,q,r,s)=>{const d1=(c-a)*(q-b)-(d-b)*(p-a),d2=(c-a)*(s-b)-(d-b)*(r-a),d3=(r-p)*(b-q)-(s-q)*(a-p),d4=(r-p)*(d-q)-(s-q)*(c-p);return d1*d2<0&&d3*d4<0;};
function solCross(ox,oz,x,z,py,segs,rects){for(const s of segs)if(solX(ox,oz,x,z,s[0],s[1],s[2],s[3]))return true;
  for(const r of rects){if(ox>r[0]&&ox<r[2]&&oz>r[1]&&oz<r[3])continue;/* đang kẹt bên trong: cho ra */if(x>r[0]&&x<r[2]&&z>r[1]&&z<r[3])return true;
    if(solX(ox,oz,x,z,r[0],r[1],r[2],r[1])||solX(ox,oz,x,z,r[2],r[1],r[2],r[3])||solX(ox,oz,x,z,r[2],r[3],r[0],r[3])||solX(ox,oz,x,z,r[0],r[3],r[0],r[1]))return true;}return false;}
function solBodies(x,z,py){const pr=7,push=(bx,bz,r)=>{const dx=x-bx,dz=z-bz,d=Math.sqrt(dx*dx+dz*dz),rr=r+pr;if(d<rr&&d>0.01){x=bx+dx/d*rr;z=bz+dz/d*rr;}};
  if(!G.ride){const A=G.animals||SOL_E,PT=S.pets;for(let n=0;n<A.length;n++){const a=A[n];if(Math.abs(a.x-x)>60||Math.abs(a.z-z)>60)continue;/* xét khoảng cách trước: bỏ qua gần hết đàn thú ngay từ đầu */if(!a.alive||a.tame||a._h3down||(PT&&PT.includes(a)))continue;if(Math.abs((a.y||py)-py)>40)continue;push(a.x,a.z,Math.min(16,(a.r||8)*0.55));}}
  for(const n of G.npcs||[]){if(!n.o||!n.o.visible||Math.abs(n.x-x)>40||Math.abs(n.z-z)>40)continue;push(n.x,n.z,5);}
  try{if(typeof MP==='object'&&MP.rp)MP.rp.forEach(v=>{const vx=v.x!=null?v.x:v.o&&v.o.position.x,vz=v.z!=null?v.z:v.o&&v.o.position.z;if(vx==null||Math.abs(vx-x)>40||Math.abs(vz-z)>40)return;push(vx,vz,5);});}catch(e){}
  return [x,z];}
{const _c=collide;collide=function(nx,nz){if(!S||!G.on||typeof OCC==='undefined')return _c(nx,nz);const ox=P.x,oz=P.z,py=P.y;let c=_c(nx,nz),x=c[0],z=c[1];
    /* Không còn đu lên mái bằng cách nhảy vào tường: người thật không nhảy nổi lên mái nhà, và đứng trong nhà nhảy vào tường thì bị hất ra ngoài. */
    try{const rects=solRects(nx,nz,py),pr=7;
      for(const r of rects){if(x>r[0]-pr&&x<r[2]+pr&&z>r[1]-pr&&z<r[3]+pr){const dl=x-(r[0]-pr),dr=(r[2]+pr)-x,du=z-(r[1]-pr),dd=(r[3]+pr)-z,m=Math.min(dl,dr,du,dd);if(m===dl)x=r[0]-pr;else if(m===dr)x=r[2]+pr;else if(m===du)z=r[1]-pr;else z=r[3]+pr;}}
      const b=solBodies(x,z,py);if(b[0]!==x||b[1]!==z){c=_c(b[0],b[1]);x=c[0];z=c[1];}
      const mv=Math.hypot(x-ox,z-oz);if(mv>0.01&&mv<400){const segs=solSegs(ox,oz,x,z,py);
        if(solCross(ox,oz,x,z,py,segs,rects)){/* trượt theo một trục nếu được, không thì đứng lại */const cx=_c(x,oz),cz=_c(ox,z);
          if(Math.abs(x-ox)>=Math.abs(z-oz)&&!solCross(ox,oz,cx[0],cx[1],py,segs,rects)){x=cx[0];z=cx[1];}else if(!solCross(ox,oz,cz[0],cz[1],py,segs,rects)){x=cz[0];z=cz[1];}else if(!solCross(ox,oz,cx[0],cx[1],py,segs,rects)){x=cx[0];z=cx[1];}else{x=ox;z=oz;}}}}catch(e){if(!G._solE){G._solE=1;console.warn('solid',e);}}
    return [x,z];};}
// thú không chui qua tường, lều: nếu bước mới cắt tường thì lùi về chỗ cũ
if(typeof animalsTick==='function'){const _at=animalsTick;animalsTick=function(dt){const A=G.animals||[],n=A.length,ox=new Float32Array(n),oz=new Float32Array(n);for(let i=0;i<n;i++){ox[i]=A[i].x;oz[i]=A[i].z;}const r=_at.apply(this,arguments);
    try{if(S&&S.builds&&S.builds.length||(typeof MP==='object'&&MP.started))for(let i=0;i<n&&i<A.length;i++){const a=A[i];if(!a||!a.alive)continue;if(Math.abs(a.x-P.x)>700||Math.abs(a.z-P.z)>700)continue;/* xa người chơi: bỏ qua cho nhẹ máy */const mv=Math.hypot(a.x-ox[i],a.z-oz[i]);if(mv<0.01||mv>300)continue;if(!OCC.cell.size&&!OCC.edge.size)break;
        const py=a.y!=null?a.y:hAt(a.x,a.z),segs=solSegs(ox[i],oz[i],a.x,a.z,py);if(!segs.length){const rc=solRects(a.x,a.z,py);if(!rc.length||!solCross(ox[i],oz[i],a.x,a.z,py,[],rc))continue;}else if(!solCross(ox[i],oz[i],a.x,a.z,py,segs,solRects(a.x,a.z,py)))continue;a.x=ox[i];a.z=oz[i];}}catch(e){}return r;};}

/* ---------- đứng được trên mái nhà và nóc lều ---------- */
const SOL_HUT=34;
function solTopAt(x,z){try{const c=cellAt(x,z);if(!c)return null;let top=null;for(let L=0;L<=LVMAX;L++){const id=c[slotN('roof',L)];if(id){const b=BYID.get(id);if(b&&b.prog==null){/* tấm mái dốc: mép thấp (y+48) ở phía +z của tấm, nóc (y+78) ở phía −z, dày 5; xoay theo b.r */const d=pieceDef(b.k),th=(b.r||0)*Math.PI/2,lz=(x-b.x)*Math.sin(th)+(z-b.z)*Math.cos(th);const t=d&&d.cap?b.y+LVH+8:b.y+51+clamp((20-lz)/40,0,1)*30;if(top==null||t>top)top=t;}}}
    /* lều, chuồng: mái nhọn, không đứng lên được (trước cho leo thì người lún vào chóp lều) */return top;}catch(e){return null;}}
{const _gy=groundY;groundY=function(x,z,yRef){const g=_gy(x,z,yRef);try{if(typeof OCC!=='undefined'&&OCC.cell.size){const t=solTopAt(x,z);if(t!=null&&t>g){const ref=yRef==null?P.y:yRef;if(ref>=t-3)return t;}}}catch(e){}return g;};}
/* ---------- giường: bước lên mặt giường thay vì chân xuyên qua ---------- */
{const _gy=groundY;groundY=function(x,z,yRef){const g=_gy(x,z,yRef);try{const c=cellAt(x,z);if(c){const id=c[slotN('obj',0)];const b=id&&BYID.get(id),d=b&&pieceDef(b.k);if(d&&d.bed&&!d.shelter&&!d.small&&b.prog==null){const fp=d.fp||[1,1],w=(b.r%2?fp[1]:fp[0])*CELL/2-4,dd=(b.r%2?fp[0]:fp[1])*CELL/2-4;
        if(Math.abs(x-b.x)<w&&Math.abs(z-b.z)<dd){const t=b.y+8,ref=yRef==null?P.y:yRef;if(t>g&&ref>=t-22)return t;}}}}catch(e){}return g;};}

/* ---------- CỬA NHÀ NGƯỜI KHÁC ĐÓNG ----------
   Cửa, cổng của người chơi khác (không cùng liên minh) cài then: đi qua không được, như một bức tường. Đồng minh thì qua lại tự do.
   Muốn vào phải cướp phá: phá cánh cửa / đoạn tường đó (theo luật cướp phá, nhà đang được bảo hộ thì không phá được). */
function solDoorOpen(b){try{if(!b||!b.remote)return true;return typeof mpSameClan==='function'&&mpSameClan(b.remote);}catch(e){return true;}}
{const _c=collide;collide=function(nx,nz){const r=_c.apply(this,arguments);try{if(S&&S.mp&&G.on&&Math.hypot(r[0]-nx,r[1]-nz)>0.6&&G.t-(G._doorT||0)>6){const ci=Math.floor(nx/CELL),cj=Math.floor(nz/CELL);
      for(let i=ci-1;i<=ci+2;i++)for(let j=cj-1;j<=cj+2;j++)for(const k0 of ['h:'+i+','+j,'v:'+i+','+j]){const id=OCC.edge.get(k0);if(!id)continue;const b=BYID.get(id),d=b&&pieceDef(b.k);if(d&&d.door&&b.remote&&!solDoorOpen(b)&&Math.hypot(b.x-nx,b.z-nz)<22){G._doorT=G.t;uiToast('🚪 Cửa nhà người khác đang cài then. Chỉ đồng minh vào được; muốn vào phải cướp phá cánh cửa (nhà đang được bảo hộ thì không phá được).','');return r;}}}}catch(e){}return r;};}
/* ---------- CHÒI CANH: TRÈO LÊN LÀ ĐỨNG TRÊN SÀN CHÒI ----------
   Trước: bấm "Trèo lên nhìn xa" chỉ diễn động tác dưới đất rồi mở bản đồ. Giờ: xong động tác là nhân vật đứng trên sàn chòi (cao ~4 m), nhìn quanh được;
   bước ra khỏi mép sàn là tụt xuống đất (không mất máu). Nhảy vào chân chòi cũng bám thang trèo lên được. */
const SOL_TW=83;
function solTower(x,z){try{const c=cellAt(x,z);const id=c&&c[slotN('obj',0)];const b=id&&BYID.get(id);if(b&&b.k==='watchtower'&&b.prog==null&&Math.abs(x-b.x)<17&&Math.abs(z-b.z)<17)return b;}catch(e){}return null;}
{const _gy=groundY;groundY=function(x,z,yRef){const g=_gy(x,z,yRef);try{const b=solTower(x,z);if(b){const t=b.y+SOL_TW,ref=yRef==null?P.y:yRef;if(ref>=t-12)return Math.max(g,t);}}catch(e){}return g;};}
function solTowerUp(b){P.x=b.x;P.z=b.z;P.y=b.y+SOL_TW+1;P.vy=0;P.air=false;G.walkTo=null;try{G.camInit=0;}catch(e){}uiToast('🗼 Bạn đang đứng trên chòi canh. Bước ra khỏi mép sàn để xuống.','');}
/* trèo thang thật: người bám thang đi lên dần trong ~1,8 giây (tư thế leo), tới sàn mới đứng lên nhìn quanh */
if(typeof mxTowerUse==='function'){const _tu=mxTowerUse;mxTowerUse=function(b){if(G.twUp||!b)return;if(P.y>b.y+SOL_TW-12&&solTower(P.x,P.z)===b)return _tu.apply(this,arguments);G.twUp={b,t:0,T:1.9};G.act=null;G.walkTo=null;if(G.sit)sitToggle(false);sfx('step');};
  const _at=animTick;animTick=function(dt){const U=G.twUp;if(!U)return _at.apply(this,arguments);const b=U.b;if(!BYID.has(b.id)||G.sleeping||G.dying){G.twUp=null;G.climb=false;return _at.apply(this,arguments);}
    U.t+=dt;const k=clamp(U.t/U.T,0,1),th=(b.r||0)*Math.PI/2,lz=29-18*k,ly=SOL_TW*k,wx=b.x+lz*Math.sin(th),wz=b.z+lz*Math.cos(th);P.x=wx;P.z=wz;P.ry=Math.atan2(b.x-wx,b.z-wz);P.speed=0;P.air=false;P.vy=0;G.climb=true;const r=_at.apply(this,arguments);
    P.y=b.y+ly;try{P.model.position.set(P.x,P.y,P.z);P.model.rotation.y=P.ry;}catch(e){}if(Math.floor(U.t*3)!==Math.floor((U.t-dt)*3))sfx('step');
    if(k>=1){G.twUp=null;G.climb=false;solTowerUp(b);try{_tu.call(this,b);}catch(e){}}return r;};
  const _mv=move;move=function(){if(G.twUp)return;return _mv.apply(this,arguments);};}
// nhảy vào chân chòi: trèo lên (dùng chung cơ chế leo mái)
{const _st=solTopAt;solTopAt=function(x,z){const t=_st.apply(this,arguments);try{const b=solTower(x,z);if(b){const tt=b.y+SOL_TW;if(t==null||tt>t)return tt;}}catch(e){}return t;};}

/* ---------- TRẦN NHÀ: đứng dưới mái mà nhảy thì đầu chạm mái, không chui lên trên mái được ---------- */
{const _mv=moveTick;moveTick=function(dt){const r=_mv.apply(this,arguments);try{if(P.air&&P.vy>0&&typeof OCC!=='undefined'&&OCC.cell.size){const t=solTopAt(P.x,P.z);if(t!=null&&P.y<t-3&&P.y+38>t-5){P.vy=Math.min(P.vy,0);}}}catch(e){}return r;};}

/* ---------- ĐÀI TRỐNG HỘI: lên được bằng bậc thang, không đi xuyên qua sàn đài ----------
   Đài 70×70, mặt sàn cao 25; ba bậc (cao 6, 12, 18) ở cạnh +z của đài (xoay theo b.r); trống lớn bán kính 13 giữa sàn.
   Trước: nằm trong danh sách "bước lên được" nhưng không có độ cao → người đi xuyên qua sàn, đầu chui qua mặt đài. */
const SOL_DR={t:-9,L:[]};
function solDrums(){if(G.t-SOL_DR.t>1.5||SOL_DR.n!==S.builds.length){SOL_DR.t=G.t;SOL_DR.n=S.builds.length;SOL_DR.L=S.builds.filter(b=>b.k==='drumStage'&&b.prog==null);}return SOL_DR.L;}
function solDrLoc(b,x,z){const th=(b.r||0)*Math.PI/2,dx=x-b.x,dz=z-b.z,c=Math.cos(th),s=Math.sin(th);return [dx*c-dz*s,dx*s+dz*c];}
function solDrTop(b,x,z){const [lx,lz]=solDrLoc(b,x,z);if(Math.abs(lx)<35&&Math.abs(lz)<35)return b.y+25;if(Math.abs(lx)<9){if(lz>=35&&lz<39.5)return b.y+18;if(lz>=39.5&&lz<44.8)return b.y+12;if(lz>=44.8&&lz<50.5)return b.y+6;}return null;}
{const _gy=groundY;groundY=function(x,z,yRef){const g=_gy(x,z,yRef);try{if(S&&S.builds&&S.builds.length){const ref=yRef==null?P.y:yRef;for(const b of solDrums()){if(Math.abs(x-b.x)>60||Math.abs(z-b.z)>60)continue;const t=solDrTop(b,x,z);if(t!=null&&t>g&&ref>=t-9)return t;}}}catch(e){}return g;};}
{const _c=collide;collide=function(nx,nz){let r=_c.apply(this,arguments);try{if(S&&G.on&&S.builds&&S.builds.length){const ox=P.x,oz=P.z,py=P.y;for(const b of solDrums()){if(Math.abs(r[0]-b.x)>70||Math.abs(r[1]-b.z)>70)continue;const [lx,lz]=solDrLoc(b,r[0],r[1]),top=b.y+25,th=(b.r||0)*Math.PI/2;
        if(py>=top-9){/* đang ở trên sàn: không đi xuyên cái trống */const d=Math.hypot(lx,lz);if(d<17&&d>0.01){const k=17/d,ax=lx*k,az=lz*k,c=Math.cos(-th),s=Math.sin(-th);r=[b.x+ax*c-az*s,b.z+ax*s+az*c];}}
        else if(Math.abs(lx)<37&&Math.abs(lz)<37){/* đứng dưới đất: sàn đài chặn ngang ngực, chỉ lên được từ bậc thang */const [l0x,l0z]=solDrLoc(b,ox,oz),onStair=Math.abs(l0x)<9&&l0z>=33;if(!(onStair&&py>=b.y+14)){if(Math.abs(l0x)<37&&Math.abs(l0z)<37){/* lỡ kẹt bên trong: cho đi ra */}else r=[ox,oz];}}}}}catch(e){}return r;};}

/* ---------- ĐỒ ĐẶT 1 Ô: vùng chặn theo đúng bề ngang của mô hình ----------
   Trước: mọi món 1 ô đều chặn bằng một vòng tròn bán kính 15 (món nhỏ 7), nên món to ngang (chuồng gà, đống rơm, bếp ba ông đầu rau, giá cồng chiêng, cột vật tổ chim Lạc…)
   bị người lẹm vào mép 5–10 đơn vị. Giờ đo bề ngang mô hình một lần cho mỗi loại rồi chặn theo đó. Áp dụng cho cả món sẽ thêm sau này. */
const SOL_R={};
function solObjR(k){let r=SOL_R[k];if(r!=null)return r;r=0;try{const d=pieceDef(k);if(d&&d.kind==='obj'&&!d.bed&&!d.farm&&!d.shelter&&!SOL_WALK.test(k)&&(!d.fp||d.fp[0]*d.fp[1]===1)){const m=model(['piece',k]),bb=new THREE.Box3().setFromObject(m),w=Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z),h=bb.max.y-bb.min.y;if(h>9&&w>30)r=Math.min(17.5,w*0.5*0.82);}}catch(e){}SOL_R[k]=r;return r;}
{const _c=collide;collide=function(nx,nz){let r=_c.apply(this,arguments);try{if(S&&G.on&&typeof OCC!=='undefined'&&OCC.cell.size){const pr=7,py=P.y,ci=Math.floor(r[0]/CELL),cj=Math.floor(r[1]/CELL);for(let i=ci-1;i<=ci+1;i++)for(let j=cj-1;j<=cj+1;j++){const c=OCC.cell.get(i+','+j);if(!c)continue;for(let L=0;L<=LVMAX;L++){const id=c[slotN('obj',L)];if(!id)continue;const b=BYID.get(id);if(!b||Math.abs(b.y-py)>40)continue;const R=solObjR(b.k);if(!R)continue;const dx=r[0]-b.x,dz=r[1]-b.z,d=Math.hypot(dx,dz),rr=R+pr;if(d<rr&&d>0.01)r=[b.x+dx/d*rr,b.z+dz/d*rr];}}}}catch(e){}return r;};}

/* ---------- RUỘNG, AO, LUỐNG: tự san phẳng đất bên dưới ----------
   Trước: ruộng lúa 2×2 đặt theo góc cao nhất của mặt đất, đất gồ ghề thì chỗ lòi cỏ lên qua mặt ruộng, chỗ hở bên dưới ("nửa ngập nước, nửa xanh").
   Giờ: dựng xong (và ruộng cũ đã có sẵn, một lần khi vào game) thì mặt đất dưới ruộng được san bằng đúng cao độ của ruộng. */
const SOL_FLAT={paddy:74,fishPond:74,farm:36,flowerBed:36};
function solFlatFor(b,quiet){try{const r=SOL_FLAT[b.k];if(!r||b.fl||b.remote||b.prog!=null)return false;if(typeof flatApply!=='function'||wdAt(b.x,b.z)>0.5){b.fl=1;return false;}
    const h=+(b.y-0.9).toFixed(2);S.flat=S.flat||[];if(S.flat.some(f=>Math.hypot(f.x-b.x,f.z-b.z)<12&&Math.abs(f.h-h)<1.5)){b.fl=1;return false;}
    const f={x:+b.x.toFixed(1),z:+b.z.toFixed(1),r,h};S.flat.push(f);flatApply(f);for(const i of near(b.x,b.z,r*1.3+30)){const q=RES[i];if(q.wy!=null)continue;const ny=hAt(q.x,q.z)-1.2;if(Math.abs(ny-q.y)>0.3){q.y=ny;try{resShow(q);}catch(e){}}}
    try{RI.forEach(v=>v.api.flush());}catch(e){}if(!quiet)landRebuild(f);b.fl=1;return true;}catch(e){return false;}}
{const _sd=siteDone;siteDone=function(b){const r=_sd.apply(this,arguments);try{if(b&&SOL_FLAT[b.k]&&solFlatFor(b)){G.gLast=null;P.y=groundY(P.x,P.z);save();}}catch(e){}return r;};}
setTimeout(function chk(){try{if(typeof G==='undefined'||!G.on||!S||!S.builds){setTimeout(chk,3000);return;}let n=0;for(const b of S.builds){if(n<6&&SOL_FLAT[b.k]&&!b.fl&&b.prog==null&&!b.remote&&solFlatFor(b))n++;}if(n){G.gLast=null;P.y=groundY(P.x,P.z);save();}}catch(e){}},5000);
