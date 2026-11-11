/* ===================== THỰC THỂ ĐẶC: KHÔNG ĐI XUYÊN TƯỜNG, NHÀ, LỀU, GIƯỜNG, CHUỒNG, THÚ, NGƯỜI =====================
   Bổ sung cho collide():
   1. Chống lọt tường: máy giật / chạy nhanh / lăn / lướt làm một bước dài hơn bề dày tường thì trước đây chui qua. Giờ kiểm tra cả đoạn đường
      từ chỗ đứng tới chỗ mới; cắt ngang tường, cột hay công trình đặc là trượt dọc theo hoặc đứng lại. Lối cửa vẫn đi qua được.
   2. Công trình nhiều ô và giường (lều nghiêng, lều da, giường, chuồng lợn, chuồng trâu, chuồng dê, kho thóc lớn, mộ…) trước không chặn: giờ đặc theo
      hình chữ nhật. Ruộng, mương, ao, sàn, cầu thang, bếp có mái che vẫn bước lên được.
   3. Thú, dân làng, người chơi khác: không đứng lồng vào nhau nữa (thú nuôi, thú đã gục thì bỏ qua để không kẹt cửa). */
const SOL_WALK=/^(paddy|channel|fishPond|drumStage|treePlatform|stiltDeck2|bambooStairs|logStairs|kitchenShed|farm|stilt|stiltBamboo|stairs|rug|sleepMat|hammock|spikePit|trap|fishTrap)$/;
function solRectOf(b){const def=pieceDef(b.k);if(!def||def.kind!=='obj'||SOL_WALK.test(b.k)||def.farm)return null;const fp=def.fp||[1,1];if(fp[0]*fp[1]<2&&!(def.bed&&!def.small))return null;
  if(b.prog!=null&&b.prog<0.5)return null;const w=(b.r%2?fp[1]:fp[0])*CELL/2-3,d=(b.r%2?fp[0]:fp[1])*CELL/2-3;return [b.x-w,b.z-d,b.x+w,b.z+d];}
function solRects(x,z,py){const out=[],ci=Math.floor(x/CELL),cj=Math.floor(z/CELL),seen=new Set();for(let i=ci-3;i<=ci+3;i++)for(let j=cj-3;j<=cj+3;j++){const c=OCC.cell.get(i+','+j);if(!c)continue;
    for(let L=0;L<=LVMAX;L++){const id=c[slotN('obj',L)];if(!id||seen.has(id))continue;seen.add(id);const b=BYID.get(id);if(!b||Math.abs(b.y-py)>40)continue;const r=solRectOf(b);if(r)out.push(r);}}return out;}
// các đoạn tường (đã trừ lối cửa) + cột quanh một vùng
function solSegs(x0,z0,x1,z1,py){const out=[],i0=Math.floor(Math.min(x0,x1)/CELL)-1,i1=Math.floor(Math.max(x0,x1)/CELL)+1,j0=Math.floor(Math.min(z0,z1)/CELL)-1,j1=Math.floor(Math.max(z0,z1)/CELL)+1;if((i1-i0)*(j1-j0)>400)return out;
  for(let L=0;L<=LVMAX;L++)for(let i=i0;i<=i1+1;i++)for(let j=j0;j<=j1+1;j++)for(const [k0,r] of [['h:'+i+','+j,0],['v:'+i+','+j,1]]){const id=OCC.edge.get(L?k0+'@'+L:k0);if(!id)continue;const b=BYID.get(id);if(!b)continue;const def=pieceDef(b.k);if(!def||/ladder/i.test(b.k))continue;
      if(py+30<b.y||py>b.y+(def.low?22:46))continue;const ax=r?b.x:b.x-20,az=r?b.z-20:b.z,bx=r?b.x:b.x+20,bz=r?b.z+20:b.z;for(const [s0,s1] of (def.door?[[-0.08,0.32],[0.68,1.08]]:[[-0.08,1.08]]))out.push([ax+(bx-ax)*s0,az+(bz-az)*s0,ax+(bx-ax)*s1,az+(bz-az)*s1]);/* dài thêm mỗi đầu 3 đơn vị: bịt khe ở góc nhà */}
  return out;}
const solX=(a,b,c,d,p,q,r,s)=>{const d1=(c-a)*(q-b)-(d-b)*(p-a),d2=(c-a)*(s-b)-(d-b)*(r-a),d3=(r-p)*(b-q)-(s-q)*(a-p),d4=(r-p)*(d-q)-(s-q)*(c-p);return d1*d2<0&&d3*d4<0;};
function solCross(ox,oz,x,z,py,segs,rects){for(const s of segs)if(solX(ox,oz,x,z,s[0],s[1],s[2],s[3]))return true;
  for(const r of rects){if(ox>r[0]&&ox<r[2]&&oz>r[1]&&oz<r[3])continue;/* đang kẹt bên trong: cho ra */if(x>r[0]&&x<r[2]&&z>r[1]&&z<r[3])return true;
    if(solX(ox,oz,x,z,r[0],r[1],r[2],r[1])||solX(ox,oz,x,z,r[2],r[1],r[2],r[3])||solX(ox,oz,x,z,r[2],r[3],r[0],r[3])||solX(ox,oz,x,z,r[0],r[3],r[0],r[1]))return true;}return false;}
function solBodies(x,z,py){const pr=7,push=(bx,bz,r)=>{const dx=x-bx,dz=z-bz,d=Math.hypot(dx,dz),rr=r+pr;if(d<rr&&d>0.01){x=bx+dx/d*rr;z=bz+dz/d*rr;}};
  if(!G.ride)for(const a of G.animals||[]){if(!a.alive||a.tame||a._h3down||(S.pets||[]).includes(a))continue;if(Math.abs(a.x-x)>60||Math.abs(a.z-z)>60||Math.abs((a.y||py)-py)>40)continue;push(a.x,a.z,Math.min(16,(a.r||8)*0.55));}
  for(const n of G.npcs||[]){if(!n.o||!n.o.visible||Math.abs(n.x-x)>40||Math.abs(n.z-z)>40)continue;push(n.x,n.z,5);}
  try{if(typeof MP==='object'&&MP.rp)MP.rp.forEach(v=>{const vx=v.x!=null?v.x:v.o&&v.o.position.x,vz=v.z!=null?v.z:v.o&&v.o.position.z;if(vx==null||Math.abs(vx-x)>40||Math.abs(vz-z)>40)return;push(vx,vz,5);});}catch(e){}
  return [x,z];}
{const _c=collide;collide=function(nx,nz){if(!S||!G.on||typeof OCC==='undefined')return _c(nx,nz);const ox=P.x,oz=P.z,py=P.y;let c=_c(nx,nz),x=c[0],z=c[1];
    try{const rects=solRects(nx,nz,py),pr=7;
      for(const r of rects){if(x>r[0]-pr&&x<r[2]+pr&&z>r[1]-pr&&z<r[3]+pr){const dl=x-(r[0]-pr),dr=(r[2]+pr)-x,du=z-(r[1]-pr),dd=(r[3]+pr)-z,m=Math.min(dl,dr,du,dd);if(m===dl)x=r[0]-pr;else if(m===dr)x=r[2]+pr;else if(m===du)z=r[1]-pr;else z=r[3]+pr;}}
      const b=solBodies(x,z,py);if(b[0]!==x||b[1]!==z){c=_c(b[0],b[1]);x=c[0];z=c[1];}
      const mv=Math.hypot(x-ox,z-oz);if(mv>0.01&&mv<400){const segs=solSegs(ox,oz,x,z,py);
        if(solCross(ox,oz,x,z,py,segs,rects)){/* trượt theo một trục nếu được, không thì đứng lại */const cx=_c(x,oz),cz=_c(ox,z);
          if(Math.abs(x-ox)>=Math.abs(z-oz)&&!solCross(ox,oz,cx[0],cx[1],py,segs,rects)){x=cx[0];z=cx[1];}else if(!solCross(ox,oz,cz[0],cz[1],py,segs,rects)){x=cz[0];z=cz[1];}else if(!solCross(ox,oz,cx[0],cx[1],py,segs,rects)){x=cx[0];z=cx[1];}else{x=ox;z=oz;}}}}catch(e){if(!G._solE){G._solE=1;console.warn('solid',e);}}
    return [x,z];};}
// thú không chui qua tường, lều: nếu bước mới cắt tường thì lùi về chỗ cũ
if(typeof animalsTick==='function'){const _at=animalsTick;animalsTick=function(dt){const A=G.animals||[],n=A.length,ox=new Float32Array(n),oz=new Float32Array(n);for(let i=0;i<n;i++){ox[i]=A[i].x;oz[i]=A[i].z;}const r=_at.apply(this,arguments);
    try{if(S&&S.builds&&S.builds.length||(typeof MP==='object'&&MP.started))for(let i=0;i<n&&i<A.length;i++){const a=A[i];if(!a||!a.alive)continue;const mv=Math.hypot(a.x-ox[i],a.z-oz[i]);if(mv<0.01||mv>300)continue;if(!OCC.cell.size&&!OCC.edge.size)break;
        const py=a.y!=null?a.y:hAt(a.x,a.z),segs=solSegs(ox[i],oz[i],a.x,a.z,py);if(!segs.length){const rc=solRects(a.x,a.z,py);if(!rc.length||!solCross(ox[i],oz[i],a.x,a.z,py,[],rc))continue;}else if(!solCross(ox[i],oz[i],a.x,a.z,py,segs,solRects(a.x,a.z,py)))continue;a.x=ox[i];a.z=oz[i];}}catch(e){}return r;};}
