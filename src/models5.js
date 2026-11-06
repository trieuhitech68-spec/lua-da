/* ===================== SB MODELS 5 — archery, Bronze Age (Đông Sơn), ores, boats, villagers =====================
   Needs models.js (window.SBM) + human.js (K3.char2) for villagers. Call SBmodels5Init() after SBmodelsInit(), K3char2Init(), SBmodels2/3/4a/4bInit()
   (re-uses M.mat3 materials when models3 is loaded, otherwise makes untextured look-alikes). Units/conventions as models.js:
   du (1 m ≈ 20 du, human 36 du, cell 40), NEW Group per call, deterministic (no Math.random), origin ground centre, bottom y=0, front +Z.
   Vertex-coloured geometry on ≤4 shared materials per model: M.mat5 = sb5Flat sb5Gloss sb5DS sb5Wood sb5Bamboo sb5Rock sb5Mud (= models3 sb3*),
   sb5Metal (vertex-coloured bronze, metalness .6) and sb5Drum (canvas-textured Đông Sơn bronze for the drum).
   TOOLS (M.tool(id); ids pushed to M.list.tools; tool convention: grip at origin, handle along +Y, blade/edge facing +Z):
     bow          cung: grip at the origin, limbs along ±Y (tips y≈±23.6), the back of the bow faces +Z, the STRING runs on the −Z side
                  (straight line x=0, z≈−4.9 between the nocks). ≈48 du tall → 29 du in hand with K3.char2Equip (default scale 0.6).
                  M.bow(draw 0..1) = same bow drawn: limbs bend back, string pulled into a V to (0,0,userData.stringZ) (−4.9 … −18).
                  Held by K3.char2Equip in the right fist: limbs run along the hand's Z, string toward the wrist. M.bowPose(char2, 'carry'|'aim', bow?)
                  poses a char2 (carry: right forearm raised so the bow stands upright; aim: bow moved to the LEFT fist, arm extended to +Z, right
                  hand drawing at the cheek; pass the bow from char2Equip / M.bow so it is re-parented).
     paddle       mái chèo: shaft y −16…24, T-grip at y≈−16.5, leaf blade y 24…45 (flat faces ±Z).
     bronzeAxe    rìu xòe: knee haft, socketed bronze head at y≈22.6, fan-shaped crescent edge at z≈+11…12.
     bronzeSpear  giáo đồng: shaft y −12…33, socket 31…36, leaf blade with midrib to y≈50, edges ±Z.
     bronzeKnife  dao găm: cast bronze hilt (pommel y −6.4, guard y 5) + blade to y 21 (edges ±Z).
     bronzeSickle liềm đồng: wooden handle y −8…14, bronze ferrule; crescent blade curving forward over +Z, cutting edge on the inner (concave) side.
     bronzeHoe    cuốc đồng: handle y −6…27, socket eye y 22.5–27.3, heart-shaped blade reaching +Z and slightly down (tip ≈ (0,19.7,12.3)).
     fireDrill    khoan lửa bow: drill bow (stick y −4…23) whose cord is wrapped round a spindle lying along X at (0,9.5,−1.6).
   ITEMS (M.item(id), ~10–20 du, centred, resting on y=0; ids pushed to M.list.items):
     bow paddle bronzeAxe bronzeSpear bronzeKnife bronzeSickle bronzeHoe (tools laid flat), arrow (2 arrows), quiver, fireDrill (hearth board +
     spindle + bow + bearing stone + tinder), crucible, copperOre, tinOre, bronze (3 cast bars), charcoal, arrowhead (3 flint points).
   M.arrow(seed)       flying arrow, world scale: 16 du, origin at its middle, flint TIP AT +Z (z=+8), nock at z=−8, fletching at z −7.6…−4.6.
   M.crucible(molten)  item crucible; molten=true adds glowing metal in a 'flame' child group.
   RESOURCES  M.oreRock(kind, seed) kind 'copper' (malachite/azurite veins + native copper) | 'tin' (cassiterite crystals + quartz veins):
              ≈30×20 du boulder sunk ~2 below y=0, ≤300 ▲. Keys 'oreRock:copper:1' … in M.list.resources.
   PIECES (M.piece(id); ids pushed to M.list.pieces):
     bronzeDrum      trống đồng Đông Sơn: h 24, tympanum r 15 at y=24 (14-ray star, concentric bands, flying egrets), 4 rope handles. ≤600 ▲.
     smelterBig      lò luyện đồng, 2×1 cells (x∈[-40,40], z∈[-20,20]): clay shaft furnace at (6,0,−4) (top y≈31), twin piston bellows at x≈−20,
                     tuyère, tapping channel to an ingot mould at +Z, charcoal heap, crucible. 'flame' child group (userData.dyn=1).
                     smelterBigOff = cold (no flame group).
     anvilStone      đe đá: flat-topped stone (top y≈11.4) with hammerstone and a bronze blank, ≈26×19.
   BOATS  M.boat(kind) kind 'raft' | 'canoe' — face +Z, ORIGIN AT THE WATERLINE (place at the water surface height).
     raft   bè tre: 9 bamboo culms along Z (60×36), upturned bow, 3 cross-poles, split-bamboo deck top y≈3.9, punting pole. ≈1000 ▲.
     canoe  thuyền độc mộc: hollowed log 90 long × 17 wide, rim y≈6.8 (ends rise to ≈9), keel −4.2, plank floor top y=2 (z −24…24).
     userData {len, width, seatY, seats:[[x,y,z]...], rimY?}. Sit a char2 at a seat with K3.char2Pose(ch,'sit') and ch.position = seat.
   VILLAGERS  M.villager(seed, role) → K3.char2 (rig intact: userData.rig; K3.char2Pose works) with seeded look + accessories.
     role ∈ chief (feather headdress, necklace, bracelets, cloak) | hunter (quiver on back) | potter | gatherer (basket on back) | elder (grey hair) |
     child (root scale 0.65). Unknown/omitted role → picked from the seed. userData.villager = {seed, role, sex, look, props}.
     M.npcProp(id, o) accessories (o: {fem, bw, seed}) built in the frame of the bone they attach to:
       'headdress' → rig.head · 'necklace' → rig.torso · 'basketBack' / 'quiverBack' → rig.back · 'bracelet' → rig.foreL / rig.foreR.
*/
function SBmodels5Init(){const M=window.SBM;if(!M||M.v5)return;M.v5=1;
  const K=(typeof K3!=='undefined')?K3:window.K3,T=K.T,PI=Math.PI,TAU=PI*2;
  /* ---------------- maths / colour helpers ---------------- */
  const RNG=s=>{let a=(((Math.abs(+s||0)*1000)|0)+1)*2654435761>>>0;return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};};
  const hsh=(a,b,c,d)=>{let h=(Math.imul(a|0,0x27d4eb2d)^Math.imul(b|0,0x165667b1)^Math.imul(c|0,0x5bd1e995)^Math.imul((d|0)+7,0x85ebca77))>>>0;h=Math.imul(h^(h>>>15),0x2c1b3c6d);h=Math.imul(h^(h>>>12),0x297a2d39);return ((h^(h>>>15))>>>0)/4294967296;};
  const sm=t=>t*t*(3-2*t),cl=t=>t<0?0:t>1?1:t,ss=(a,b,x)=>sm(cl((x-a)/(b-a))),lerp=(a,b,t)=>a+(b-a)*t;
  const vn3=(x,y,z,s)=>{const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),fx=sm(x-xi),fy=sm(y-yi),fz=sm(z-zi);let r=0;
    for(let k=0;k<8;k++){const dx=k&1,dy=(k>>1)&1,dz=(k>>2)&1;r+=hsh(xi+dx,yi+dy,zi+dz,s)*(dx?fx:1-fx)*(dy?fy:1-fy)*(dz?fz:1-fz);}return r;};
  const CCH={},C=h=>{if(CCH[h])return CCH[h];const c=new T.Color(h);return CCH[h]=[c.r,c.g,c.b];};
  const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],mul=(a,f)=>[a[0]*f,a[1]*f,a[2]*f];
  const add3=(a,b,k)=>{k=k===undefined?1:k;return [a[0]+b[0]*k,a[1]+b[1]*k,a[2]+b[2]*k];},sub3=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
  const len3=a=>Math.hypot(a[0],a[1],a[2]),nrm3=a=>{const l=len3(a)||1;return [a[0]/l,a[1]/l,a[2]/l];},crs=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const lerp3=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
  const fnorm=(a,b,c)=>nrm3(crs(sub3(b,a),sub3(c,a)));
  const g=(...c)=>K.group(...c),V=(x,y,z)=>new T.Vector3(x,y,z);
  const solid=c=>()=>c;
  /* ---------------- materials ---------------- */
  const vmat=(name,o)=>{const p={vertexColors:o.vc!==false,roughness:o.r,metalness:o.m||0,flatShading:o.flat!==false};if(o.ds)p.side=T.DoubleSide;const m=new T.MeshStandardMaterial(p);m.name=name;m.userData.key=name;return m;};
  const M3=M.mat3||{};
  const MT={sb5Flat:M3.sb3Flat||vmat('sb5Flat',{r:.92}),sb5Gloss:M3.sb3Gloss||vmat('sb5Gloss',{r:.38}),sb5DS:M3.sb3DS||vmat('sb5DS',{r:.85,ds:1}),
    sb5Wood:M3.sb3Wood||vmat('sb5Wood',{r:.9}),sb5Bamboo:M3.sb3Bamboo||vmat('sb5Bamboo',{r:.62}),sb5Rock:M3.sb3Rock||vmat('sb5Rock',{r:.94}),
    sb5Mud:M3.sb3Mud||vmat('sb5Mud',{r:.97}),sb5Metal:vmat('sb5Metal',{r:.42,m:.45})};
  M.mat5=MT;
  /* ---------------- vertex-coloured triangle soup ---------------- */
  function VB(cf){this.p=[];this.c=[];this.cf=cf||(()=>[1,1,1]);this.face=false;}
  VB.prototype.t=function(a,b,c){const n=fnorm(a,b,c);this.p.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);
    if(this.face){const k=this.cf([(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3],n);for(let i=0;i<3;i++)this.c.push(k[0],k[1],k[2]);}
    else for(const v of [a,b,c]){const k=this.cf(v,n);this.c.push(k[0],k[1],k[2]);}return this;};
  VB.prototype.o=function(a,b,c,r,inw){const n=crs(sub3(b,a),sub3(c,a));if(dot(n,n)<1e-12)return this;const m=[(a[0]+b[0]+c[0])/3-r[0],(a[1]+b[1]+c[1])/3-r[1],(a[2]+b[2]+c[2])/3-r[2]];
    return ((dot(n,m)>=0)!==!!inw)?this.t(a,b,c):this.t(a,c,b);};
  VB.prototype.q=function(a,b,c,d,r,inw){this.o(a,b,c,r,inw);return this.o(a,c,d,r,inw);};
  // explicit vertex colours
  VB.prototype.tk=function(a,b,c,ka,kb,kc,r){const n=crs(sub3(b,a),sub3(c,a));if(dot(n,n)<1e-12)return this;
    if(r){const m=[(a[0]+b[0]+c[0])/3-r[0],(a[1]+b[1]+c[1])/3-r[1],(a[2]+b[2]+c[2])/3-r[2]];if(dot(n,m)<0){const s=b;b=c;c=s;const sk=kb;kb=kc;kc=sk;}}
    this.p.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);this.c.push(ka[0],ka[1],ka[2],kb[0],kb[1],kb[2],kc[0],kc[1],kc[2]);return this;};
  VB.prototype.qk=function(P,Kc,r){this.tk(P[0],P[1],P[2],Kc[0],Kc[1],Kc[2],r);return this.tk(P[0],P[2],P[3],Kc[0],Kc[2],Kc[3],r);};
  VB.prototype.n=function(){return this.p.length/9;};
  const projUV=(pos,S)=>{const uv=new Float32Array(pos.length/3*2);for(let i=0;i<pos.length/9;i++){const o=i*9,a=[pos[o],pos[o+1],pos[o+2]],b=[pos[o+3],pos[o+4],pos[o+5]],c=[pos[o+6],pos[o+7],pos[o+8]],n=crs(sub3(c,b),sub3(a,b)),ax=Math.abs(n[0]),ay=Math.abs(n[1]),az=Math.abs(n[2]);
      for(let k=0;k<3;k++){const x=pos[o+k*3],y=pos[o+k*3+1],z=pos[o+k*3+2];let u,v;if(ay>=ax&&ay>=az){u=x;v=z;}else if(ax>=az){u=z;v=y;}else{u=x;v=y;}uv[i*6+k*2]=u/S;uv[i*6+k*2+1]=v/S;}}return uv;};
  VB.prototype.mesh=function(m,o){o=o||{};const ge=new T.BufferGeometry();ge.setAttribute('position',new T.Float32BufferAttribute(this.p,3));ge.setAttribute('color',new T.Float32BufferAttribute(this.c,3));
    const mat=MT[m]||m;if(mat.map)ge.setAttribute('uv',new T.BufferAttribute(projUV(this.p,o.uv||24),2));ge.computeVertexNormals();
    const ms=new T.Mesh(ge,mat);ms.name=typeof m==='string'?m:'';ms.castShadow=!o.noShadow;ms.receiveShadow=true;return ms;};
  const addM=(G,...L)=>{L.forEach(([B,m,o])=>{if(B&&B.n()>0)G.add(B.mesh(m,o));});return G;};
  /* ---------------- shape builders ---------------- */
  function loft(B,P,r,n,o){o=o||{};const L=P.length,rings=[];let sd0=null;
    for(let i=0;i<L;i++){const p=P[i],d=nrm3(sub3(P[Math.min(L-1,i+1)],P[Math.max(0,i-1)]));let sd=o.side?o.side.slice():crs([0,1,0],d);if(len3(sd)<0.2)sd=sd0||[1,0,0];sd=nrm3(sd);if(sd0&&dot(sd,sd0)<0)sd=mul(sd,-1);
      const up=nrm3(crs(d,sd));sd=crs(up,d);sd0=sd;const ri=r[i],w=Array.isArray(ri)?ri[0]:ri,h=Array.isArray(ri)?ri[1]:ri,ring=[];
      for(let j=0;j<n;j++){const t=j/n*TAU+(o.rot===undefined?PI/2:o.rot),f=o.jit?1+(hsh(i,j,o.seed||1,11)-.5)*o.jit:1;ring.push(add3(add3(p,sd,Math.cos(t)*w*f),up,Math.sin(t)*h*f));}
      rings.push(ring);}
    for(let i=0;i<L-1;i++){const A=rings[i],Bq=rings[i+1],ref=lerp3(P[i],P[i+1],0.5);for(let j=0;j<n;j++){const j1=(j+1)%n;B.q(A[j],A[j1],Bq[j1],Bq[j],ref);}}
    if(o.cap1){const tp=Array.isArray(o.cap1)?o.cap1:P[L-1],A=rings[L-1],ref=lerp3(P[L-1],P[L-2],0.6);for(let j=0;j<n;j++)B.o(A[j],A[(j+1)%n],tp,ref);}
    if(o.cap0){const tp=Array.isArray(o.cap0)?o.cap0:P[0],A=rings[0],ref=lerp3(P[0],P[1],0.6);for(let j=0;j<n;j++)B.o(A[j],A[(j+1)%n],tp,ref);}
    return rings;}
  const pole=(B,a,b,r0,r1,n,caps,o)=>loft(B,[a,b],[r0,r1],n||6,Object.assign({cap0:!!caps,cap1:!!caps},o||{}));
  function blob(B,c,r,s,seed,amt,det,mod){let ge=new T.IcosahedronGeometry(r,det||0);ge=ge.index?ge.toNonIndexed():ge;const p=ge.attributes.position,R=RNG(seed),mp={};
    const key=i=>Math.round(p.getX(i)*100)+'_'+Math.round(p.getY(i)*100)+'_'+Math.round(p.getZ(i)*100);
    for(let i=0;i<p.count;i++){const k=key(i);if(!mp[k])mp[k]=1+(R()-.5)*(amt===undefined?0.3:amt);}
    const pt=i=>{const f=mp[key(i)];let q=[c[0]+p.getX(i)*f*s[0],c[1]+p.getY(i)*f*s[1],c[2]+p.getZ(i)*f*s[2]];if(mod)q=mod(q);return q;};
    const out=[];for(let i=0;i<p.count;i+=3){const a=pt(i),b=pt(i+1),d=pt(i+2);B.o(a,b,d,c);out.push([a,b,d]);}ge.dispose();return out;}
  function octb(B,c,r,s,seed,amt,a){const R=RNG(seed),ca=Math.cos(a||0),sa=Math.sin(a||0),P=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].map(v=>{const f=1+(R()-.5)*(amt||0),x=v[0]*ca+v[2]*sa,z=-v[0]*sa+v[2]*ca;return [c[0]+x*r*s[0]*f,c[1]+v[1]*r*s[1]*f,c[2]+z*r*s[2]*f];});
    for(const x of [0,1])for(const y of [2,3])for(const z of [4,5])B.o(P[x],P[y],P[z],c);return B;}
  function spike(B,b,a,r,n,cap,rot){const d=nrm3(sub3(a,b));let u=nrm3(crs(Math.abs(d[1])<0.9?[0,1,0]:[1,0,0],d));const v=crs(d,u),rim=[];
    for(let j=0;j<n;j++){const t=j/n*TAU+(rot||0);rim.push(add3(add3(b,u,Math.cos(t)*r),v,Math.sin(t)*r));}
    for(let j=0;j<n;j++)B.o(rim[j],rim[(j+1)%n],a,b);if(cap){const ref=lerp3(b,a,0.3);for(let j=1;j<n-1;j++)B.o(rim[0],rim[j],rim[j+1],ref);}return rim;}
  // bipyramid crystal along a→b (n sides, radius r at fraction m)
  function crystal(B,a,b,r,n,m,rot){const d=nrm3(sub3(b,a)),L=len3(sub3(b,a)),c=add3(a,d,L*(m||0.5));let u=nrm3(crs(Math.abs(d[1])<0.9?[0,1,0]:[1,0,0],d));const v=crs(d,u),rim=[];
    for(let j=0;j<n;j++){const t=j/n*TAU+(rot||0);rim.push(add3(add3(c,u,Math.cos(t)*r),v,Math.sin(t)*r));}
    for(let j=0;j<n;j++){B.o(rim[j],rim[(j+1)%n],b,c);B.o(rim[j],rim[(j+1)%n],a,c);}return B;}
  function obox(B,c,ax,ay,az){const P=(i,j,k)=>add3(add3(add3(c,ax,i),ay,j),az,k),v=[P(-1,-1,-1),P(1,-1,-1),P(1,1,-1),P(-1,1,-1),P(-1,-1,1),P(1,-1,1),P(1,1,1),P(-1,1,1)];
    [[0,1,2,3],[5,4,7,6],[4,0,3,7],[1,5,6,2],[3,2,6,7],[4,5,1,0]].forEach(f=>B.q(v[f[0]],v[f[1]],v[f[2]],v[f[3]],c));return B;}
  const box=(B,c,hx,hy,hz,ry)=>{const cs=Math.cos(ry||0),sn=Math.sin(ry||0);return obox(B,c,[hx*cs,0,-hx*sn],[0,hy,0],[hz*sn,0,hz*cs]);};
  // bar with a narrower top (trapezoid section) along local X, yaw ry; base centre c
  function trap(B,c,L,w0,w1,h,ry){const cs=Math.cos(ry||0),sn=Math.sin(ry||0),P=(x,y,z)=>[c[0]+x*cs+z*sn,c[1]+y,c[2]-x*sn+z*cs],L1=L-(w0-w1);
    const v=[P(-L/2,0,-w0/2),P(L/2,0,-w0/2),P(L1/2,h,-w1/2),P(-L1/2,h,-w1/2),P(-L/2,0,w0/2),P(L/2,0,w0/2),P(L1/2,h,w1/2),P(-L1/2,h,w1/2)],ct=[c[0],c[1]+h/2,c[2]];
    [[0,1,2,3],[5,4,7,6],[4,0,3,7],[1,5,6,2],[3,2,6,7],[4,5,1,0]].forEach(f=>B.q(v[f[0]],v[f[1]],v[f[2]],v[f[3]],ct));return B;}
  // lathe with the "solid on the left" rule: profile [[r,y],...] traversed so the material lies to the LEFT (outer wall: bottom→top)
  function lathe(B,c,prof,n,o){o=o||{};const R=prof.map(([r,y],i)=>{const ring=[];for(let j=0;j<n;j++){const t=j/n*TAU+(o.rot||0);let p=[c[0]+Math.cos(t)*r,c[1]+y,c[2]-Math.sin(t)*r];if(o.mod)p=o.mod(p,t,i);ring.push(p);}return ring;});
    for(let i=0;i<prof.length-1;i++){const [r0,y0]=prof[i],[r1,y1]=prof[i+1];let nr=y1-y0,ny=-(r1-r0);const l=Math.hypot(nr,ny)||1;nr/=l;ny/=l;
      for(let j=0;j<n;j++){const j1=(j+1)%n,t=(j+0.5)/n*TAU+(o.rot||0),rm=(r0+r1)/2-nr*2,ym=(y0+y1)/2-ny*2,ref=[c[0]+Math.cos(t)*rm,c[1]+ym,c[2]-Math.sin(t)*rm];
        B.q(R[i][j],R[i][j1],R[i+1][j1],R[i+1][j],ref);}}
    return R;}
  function cord(B,P,w){for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],d=nrm3(sub3(b,a));let s1=nrm3(crs(d,Math.abs(d[1])<0.9?[0,1,0]:[1,0,0]));const s2=nrm3(crs(d,s1));
      for(const s of [s1,s2])B.t(add3(a,s,-w),add3(a,s,w),add3(b,s,w)).t(add3(a,s,-w),add3(b,s,w),add3(b,s,-w));}return B;}
  const lash=(B,c,dir,r,w,n)=>{const d=nrm3(dir);loft(B,[add3(c,d,-w/2),add3(c,d,w/2)],[r,r],n||6,{rot:0.3});};
  const leaf=(B,b,t,w,sd,fold)=>{const m=lerp3(b,t,0.45),l=add3(m,sd,w),r=add3(m,sd,-w),f=fold?fold:[0,0,0];const mm=add3(m,f);B.t(b,l,mm).t(b,mm,r);B.t(l,t,mm);B.t(mm,t,r);return B;};
  // closed ring (torus-like) of nu stations × nv sides: centre c, radii rx/rz in the XZ plane, tube radius tr
  function ringB(B,c,rx,rz,tr,nu,nv){const P=[];for(let i=0;i<nu;i++){const a=i/nu*TAU,ct=[c[0]+Math.cos(a)*rx,c[1],c[2]+Math.sin(a)*rz],out=nrm3([Math.cos(a)*rz,0,Math.sin(a)*rx]),row=[];
      for(let j=0;j<nv;j++){const b=j/nv*TAU+0.4;row.push(add3(add3(ct,out,Math.cos(b)*tr),[0,1,0],Math.sin(b)*tr));}P.push([row,ct]);}
    for(let i=0;i<nu;i++){const [A,ca]=P[i],[Bq,cb]=P[(i+1)%nu],ref=lerp3(ca,cb,.5);for(let j=0;j<nv;j++){const j1=(j+1)%nv;B.q(A[j],A[j1],Bq[j1],Bq[j],ref);}}return B;}
  // thin plate: mid-surface P(u,v), half-thickness Th(u,v) along normal N (vector or fn), colours col(p,u,v,th,side). Closes the rim.
  function sheet(B,nt,ns,P,Th,N,col){const mid=[],top=[],bot=[],kt=[],kb=[],th=[],nn=[];
    for(let i=0;i<=nt;i++){mid[i]=[];top[i]=[];bot[i]=[];kt[i]=[];kb[i]=[];th[i]=[];nn[i]=[];
      for(let j=0;j<=ns;j++){const u=i/nt,v=j/ns,p=P(u,v),t=Math.max(0,Th(u,v)),n=typeof N==='function'?N(u,v):N;
        mid[i][j]=p;th[i][j]=t;nn[i][j]=n;top[i][j]=add3(p,n,t);bot[i][j]=add3(p,n,-t);kt[i][j]=col(top[i][j],u,v,t,1);kb[i][j]=col(bot[i][j],u,v,t,-1);}}
    for(let i=0;i<nt;i++)for(let j=0;j<ns;j++){const c=lerp3(lerp3(mid[i][j],mid[i+1][j+1],.5),lerp3(mid[i+1][j],mid[i][j+1],.5),.5),n=nn[i][j],I=[[i,j],[i+1,j],[i+1,j+1],[i,j+1]];
      B.qk(I.map(([a,b])=>top[a][b]),I.map(([a,b])=>kt[a][b]),add3(c,n,-3));B.qk(I.map(([a,b])=>bot[a][b]),I.map(([a,b])=>kb[a][b]),add3(c,n,3));}
    const edge=(a0,b0,a1,b1,ri,rj,ri2,rj2)=>{if(th[a0][b0]<0.015&&th[a1][b1]<0.015)return;const ref=lerp3(mid[ri][rj],mid[ri2][rj2],.5);
      B.qk([top[a0][b0],top[a1][b1],bot[a1][b1],bot[a0][b0]],[kt[a0][b0],kt[a1][b1],kb[a1][b1],kb[a0][b0]],ref);};
    for(let j=0;j<ns;j++){edge(0,j,0,j+1,1,j,1,j+1);edge(nt,j,nt,j+1,nt-1,j,nt-1,j+1);}
    for(let i=0;i<nt;i++){edge(i,0,i+1,0,i,1,i+1,1);edge(i,ns,i+1,ns,i,ns-1,i+1,ns-1);}
    return B;}
  const trisOf=o=>{let n=0;o.traverse(m=>{if(m.isMesh){const ge=m.geometry;n+=(ge.index?ge.index.count:ge.attributes.position.count)/3;}});return Math.round(n);};
  M.tris5=trisOf;
  const bbox=(G)=>{G.updateMatrixWorld(true);const b=new T.Box3(),v=V(0,0,0);G.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)b.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});return b;};
  const rest=(G)=>{const b=bbox(G),c=b.getCenter(V(0,0,0));G.position.x-=c.x;G.position.z-=c.z;G.position.y-=b.min.y;return g(G);};
  /* ---------------- flame (K3 materials, as models.js campfire) ---------------- */
  function Soup(){this.p=[];}
  Soup.prototype.t=function(a,b,c){this.p.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);return this;};
  Soup.prototype.mesh=function(m,o){const ge=new T.BufferGeometry();ge.setAttribute('position',new T.Float32BufferAttribute(this.p,3));return K.mesh(ge,m,o);};
  const coneM=(r,h,m,o,n,R,jr,jy,lean)=>{n=n||7;const S=new Soup(),rim=[];let cy=0;
    for(let i=0;i<n;i++){const a=(i+(R?(R()-.5)*0.35:0))/n*TAU,f=1+(R?(R()-.5)*(jr||0):0),y=R?(R()-.5)*(jy||0):0;rim.push([Math.cos(a)*r*f,y,-Math.sin(a)*r*f]);cy+=y/n;}
    const ap=[lean?lean[0]:0,h,lean?lean[1]:0],c=[0,cy,0];for(let i=0;i<n;i++){const A=rim[i],B=rim[(i+1)%n];S.t(ap,A,B);S.t(c,B,A);}return S.mesh(m,o);};
  function flame(s,seed,o){o=o||{};const F=g(),R=RNG(seed||5);F.name='flame';F.userData.dyn=1;
    F.add(coneM(4.2*s,14*s,'fire',{noShadow:true,mo:{ei:1.8}},6,R,0.35,0.8*s,[0.5*s,-0.3*s]));
    F.add(coneM(2.8*s,9.5*s,'fire',{x:2.7*s,z:1.1*s,noShadow:true,mo:{ei:1.8}},5,R,0.3,0.5*s,[1.5*s,0.4*s]));
    F.add(coneM(2.5*s,8.5*s,'fire',{x:-2.5*s,z:-0.9*s,noShadow:true,mo:{ei:1.8}},5,R,0.3,0.5*s,[-1.4*s,-0.4*s]));
    F.add(coneM(2.3*s,7*s,'sbFlameY',{x:0.3*s,y:-0.1,z:2.3*s,noShadow:true,mo:{ei:1.5}},5,R,0.3,0.3*s,[0,0.4*s]));
    if(o.glow!==0&&K.glow)F.add(K.glow('#ff9a40',o.glow||46,{y:7*s,op:0.75},false));return F;}
  /* ---------------- palettes ---------------- */
  const PAL={wd:{a:C('#8a6a48'),b:C('#6e543a'),c:C('#a07c56'),dk:C('#4a3828'),cut:C('#c9a678')},rope:C('#c4a46a'),ropeD:C('#9a7a48'),
    hide:[C('#8e5a30'),C('#a8723f'),C('#6e4424')],bm:{a:C('#c2a868'),b:C('#a68c50'),g:C('#97a04f'),d:C('#7e6a40'),n:C('#6a5634')},
    flint:[C('#4f5c74'),C('#66728a'),C('#3c475c'),C('#9aa3b4')],clay:[C('#ae6646'),C('#94523a'),C('#c27e58')],soot:C('#2c2420'),char:[C('#242020'),C('#38322e'),C('#4a423c')],
    rock:[C('#8e877d'),C('#7a736a'),C('#a39b90'),C('#6a645c')],mal:[C('#1f6a48'),C('#2f8a5e'),C('#5fb487'),C('#16503a')],azu:C('#2c5aa4'),cass:[C('#3a2a22'),C('#55402e')],quartz:C('#cdc6b8'),
    feather:[C('#ece6da'),C('#8a7a68'),C('#3a3430'),C('#b06a3a'),C('#d8cfbe')]};
  const WD=PAL.wd,woodCf=(seed,f)=>(p)=>mix(WD.b,WD.a,cl(vn3(p[0]*(f||0.08),p[1]*(f||0.08),p[2]*(f||0.08),seed)*1.3-0.1));
  const BZ={b:C('#c89a52'),d:C('#94683a'),h:C('#f4d690'),p:C('#5a9a80'),p2:C('#8cc4a8'),k:C('#4e3a20')};
  const bronzeAt=(p,seed,edge,pat)=>{let k=mix(BZ.d,BZ.b,cl(vn3(p[0]*.6,p[1]*.6,p[2]*.6,seed)*1.5-.2));if(edge)k=mix(k,BZ.h,edge);
    const pn=vn3(p[0]*.42+3.1,p[1]*.42,p[2]*.42+1.7,seed+11),th=1-(pat===undefined?0.36:pat);if(pn>th)k=mix(k,pn>th+0.1?BZ.p2:BZ.p,cl((pn-th)*9)*0.88);return k;};
  const bzCf=(seed,pat)=>(p)=>bronzeAt(p,seed,0,pat);
  const bzSheet=(seed,pat)=>(p,u,v,t)=>bronzeAt(p,seed,ss(0.32,0.04,t)*0.85,pat);

  /* ======================================== A. ARCHERY ======================================== */
  // bow: grip at origin, limbs ±Y, back of bow +Z, string −Z. draw 0..1
  function bowG(draw){draw=cl(+draw||0);const G=g(),W=new VB(),S=new VB(solid(C('#e8dcc0'))),L=24*(1-0.06*draw),bend=6.0+5.5*draw,N=14,P=[],r=[];
    const zAt=s=>-bend*s*s+1.15*ss(0.86,1,Math.abs(s))*(1-0.4*draw);
    for(let i=0;i<=N;i++){const s=-1+2*i/N,a=Math.abs(s),grip=a<0.14;P.push([0,s*L,zAt(s)]);r.push(grip?[1.35,1.3]:[lerp(1.45,0.55,Math.pow(a,1.1)),lerp(1.05,0.45,a)]);}
    W.cf=(p)=>{const a=Math.abs(p[1]);if(a<3.6)return Math.sin(p[1]*5.2)>0?PAL.rope:PAL.ropeD;if(a>L-1.4)return C('#2e241c');const n=vn3(p[1]*0.3,0,0,7);let k=mix(PAL.bm.d,PAL.bm.a,n);if(Math.abs(((a+2)%7.4)-3.7)<0.35)k=PAL.bm.n;return k;};
    loft(W,P,r,6,{side:[1,0,0],cap0:true,cap1:true});
    const tT=P[N],tB=P[0],nock=[0,0,draw>0.01?-(bend-1.15+16*draw)+0.4:(tT[2])];
    const tTop=[0,tT[1]-0.5,tT[2]-0.45],tBot=[0,tB[1]+0.5,tB[2]-0.45];
    cord(S,draw>0.01?[tTop,nock,tBot]:[tTop,tBot],0.11);
    addM(G,[W,'sb5Flat'],[S,'sb5DS',{noShadow:true}]);G.userData={draw,stringZ:+nock[2].toFixed(2),len:+(2*L).toFixed(1),grip:[0,0,0]};return G;}
  // arrow parts into W (wood), F (feathers DS), H (flint head): nock → tip
  const FCOL=[[0,1],[4,2],[3,2],[0,3],[1,2]];
  function arrowParts(W,F,H,nock,tip,seed,head){const d=nrm3(sub3(tip,nock)),L=len3(sub3(tip,nock));let u=nrm3(crs(Math.abs(d[1])<0.9?[0,1,0]:[1,0,0],d));const v=crs(d,u);
    const hl=head?2.3:0;W.cf=(p)=>{const t=dot(sub3(p,nock),d);return t<0.45||(t>L-hl-0.9&&head)?C('#3a2c22'):mix(C('#b89464'),C('#9c7a50'),hsh(seed,3,1,1));};
    loft(W,[nock,add3(tip,d,-hl+0.1)],[0.2,0.2],4,{cap0:true,cap1:true,rot:PI/4});
    if(head)lash(W,add3(tip,d,-hl-0.3),d,0.27,0.9,4);
    lash(W,add3(nock,d,0.35),d,0.25,0.5,4);
    const fc=FCOL[Math.floor(hsh(seed,9,2,2)*FCOL.length)],rot=hsh(seed,4,4,4)*TAU;
    for(let k=0;k<3;k++){const a=k/3*TAU+rot,e=add3(mul(u,Math.cos(a)),v,Math.sin(a)),c0=PAL.feather[k===0?fc[1]:fc[0]],c1=mix(c0,PAL.feather[2],0.35);
      const p0=add3(add3(nock,d,0.7),e,0.18),p1=add3(add3(nock,d,3.7),e,0.18),q0=add3(add3(nock,d,0.9),e,0.95),q1=add3(add3(nock,d,2.6),e,0.92);
      F.tk(p0,p1,q1,c0,c0,c1);F.tk(p0,q1,q0,c0,c1,c1);}
    if(head){const base=add3(tip,d,-hl),seedR=RNG(seed*7+1);
      sheet(H,2,2,(a,b)=>add3(add3(base,d,hl*a),u,(2*b-1)*(0.62*(1-a)+0.08*Math.sin(PI*a))),(a,b)=>(0.2*(1-a)+0.03)*(1-Math.abs(2*b-1))+0.03,v,
        (p)=>PAL.flint[Math.floor(seedR()*3)]);}
    return d;}
  function arrowG(seed){seed=+seed||1;const G=g(),W=new VB(),F=new VB(),H=new VB();arrowParts(W,F,H,[0,0,-8],[0,0,8],seed,true);
    addM(G,[W,'sb5Flat'],[F,'sb5DS',{noShadow:true}],[H,'sb5Gloss']);G.userData={len:16,tip:[0,0,8],nock:[0,0,-8]};return G;}
  // quiver: tube axis +Y from y=0 (bottom) to 14 (mouth); n arrows sticking out (fletching up)
  function quiverG(n,seed,strap){const G=g(),Hd=new VB(),W=new VB(),F=new VB(),R=RNG(seed||3);
    Hd.cf=(p,nm)=>{const y=p[1];if(y<1.2||Math.abs(y-12.6)<0.8||Math.abs(y-3.4)<0.5)return PAL.ropeD;if(y>13.4)return PAL.hide[2];
      const a=Math.atan2(p[2],p[0]);return mix(PAL.hide[0],PAL.hide[1],cl(vn3(a*2,y*0.3,0,5)*1.3-0.2)*0.8);};
    loft(Hd,[[0,0,0],[0,1.2,0],[0,7,0],[0,12.6,0],[0,14,0]],[[1.7,1.5],[1.95,1.7],[2.0,1.75],[2.15,1.85],[2.25,1.95]],8,{cap0:true,rot:0});
    // inner wall + dark bottom so the mouth reads as open
    {const Inn=new VB(solid(C('#3a2618')));lathe(Inn,[0,0,0],[[2.05,14],[1.85,11],[0,11]],8,{});Hd.p.push(...Inn.p);Hd.c.push(...Inn.c);}
    // fur fringe at the mouth
    const Fu=new VB(solid(PAL.hide[2]));for(let k=0;k<8;k++){const a=k/8*TAU,c0=[Math.cos(a)*2.3,13.6,Math.sin(a)*2.0],dn=[Math.cos(a)*0.5,-2.4,Math.sin(a)*0.45];Fu.t(add3(c0,[Math.sin(a)*0.55,0,-Math.cos(a)*0.5]),add3(c0,[-Math.sin(a)*0.55,0,Math.cos(a)*0.5]),add3(c0,dn));}
    Hd.p.push(...Fu.p);Hd.c.push(...Fu.c);
    for(let i=0;i<n;i++){const a=i/n*TAU+R()*0.5,rr=0.55+R()*0.6,b=[Math.cos(a)*rr,4,Math.sin(a)*rr*0.85],t=[Math.cos(a)*rr*2.6+(R()-.5)*0.5,19.5+R()*1.6,Math.sin(a)*rr*2.2];
      arrowParts(W,F,null,t,b,(seed||3)*10+i,false);}
    if(strap){const S=new VB(solid(PAL.hide[2]));cord(S,[[1.9,12.2,0],[3.4,10,0.2],[3.8,6,0.3],[3.0,2.2,0.2],[1.9,1.6,0]],0.45);addM(G,[S,'sb5DS']);}
    addM(G,[Hd,'sb5Flat'],[W,'sb5Flat'],[F,'sb5DS',{noShadow:true}]);return G;}
  function arrowItem(){const G=g();[[-1.1,0.18,1],[1.1,-0.12,2]].forEach(([x,ry,s])=>{const a=arrowG(s);a.rotation.set(0,ry,0.6*s);a.position.set(x,1,0);G.add(a);});G.scale.setScalar(1.12);return g(G);}
  function arrowheadItem(){const G=g(),H=new VB();[[[-3.2,0,-1.6],0.5,1],[[2.9,0,-2.2],-0.7,2],[[0.2,0,2.6],2.4,3]].forEach(([c,ry,s])=>{const d=[Math.sin(ry),0,Math.cos(ry)],u=[Math.cos(ry),0,-Math.sin(ry)],L=6.4;
      const wAt=(a)=>a<0.12?0.9:(a<0.22?lerp(0.9,2.6,(a-0.12)/0.1):2.6*Math.pow(1-(a-0.22)/0.78,0.95));
      sheet(H,6,4,(a,b)=>add3(add3(c,d,L*a-L*0.45),u,(2*b-1)*wAt(a)),(a,b)=>(0.55*(1-a*0.6))*(1-Math.pow(Math.abs(2*b-1),1.6))+0.05,[0,1,0],
        (p,a,b,t,sd)=>{const k=hsh(Math.round(p[0]*3),Math.round(p[2]*3),s,1);return k<0.55?PAL.flint[0]:k<0.8?PAL.flint[1]:k<0.93?PAL.flint[2]:PAL.flint[3];});});
    H.p=H.p.map((v,i)=>i%3===1?v+0.6:v);G.scale.setScalar(1.35);addM(G,[H,'sb5Gloss']);return g(G);}
  // pose helpers for a char2 holding a bow
  // two-bone IK for a char2 arm in the TORSO frame: wrist → target, elbow toward pole
  function armIK(R,side,tgt,pole){const n=side<0?'L':'R',arm=R['arm'+n],fore=R['fore'+n],S=arm.position.clone(),a=6.6,b=5.3;let D=tgt.clone().sub(S);const d=Math.max(1.6,Math.min(a+b-0.05,D.length()));const e=D.normalize();
    const al=Math.acos(Math.max(-1,Math.min(1,(a*a+d*d-b*b)/(2*a*d))));let nn=e.clone().cross(pole);if(nn.lengthSq()<1e-6)nn=V(1,0,0);nn.normalize();
    const u=e.clone().applyAxisAngle(nn,-al),E=S.clone().addScaledVector(u,a),f=S.clone().addScaledVector(e,d).sub(E).normalize();
    let z=f.clone().addScaledVector(u,-f.dot(u));if(z.lengthSq()<1e-6)z=V(0,0,1);z.normalize();const y=u.clone().negate(),x=y.clone().cross(z);
    arm.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(x,y,z));fore.rotation.set(-Math.acos(Math.max(-1,Math.min(1,u.dot(f)))),0,0);}
  // pose a char2 holding a bow: 'carry' (right hand, bow upright at the side) | 'aim' (bow in the LEFT fist toward +Z, right hand drawing)
  M.bowPose=(ch,mode,bow,o)=>{const R=ch&&ch.userData&&ch.userData.rig;if(!R)return;o=o||{};if(K.char2Pose)K.char2Pose(ch,'idle',0,{});
    if(mode==='aim'){if(bow){bow.position.set(0,-1.75,0);bow.rotation.set(PI/2,0,0);if(bow.scale.x===1)bow.scale.setScalar(0.6);R.handL.add(bow);}
      R.hips.rotation.y=1.15;R.torso.rotation.y=0.38;R.head.rotation.set(0.05,-1.38,0.04);R.torso.rotation.z=0.04;
      R.legL.rotation.set(-0.06,0,-0.2);R.legR.rotation.set(0.06,0,0.2);R.footL.rotation.y=-0.2;R.footR.rotation.y=0.4;
      R.armL.rotation.set(-PI/2,0,-PI/2-0.16);R.foreL.rotation.set(-0.04,0,0);R.handL.rotation.set(0,0,0);
      ch.updateMatrixWorld(true);let tg=V(-1.2,10.6,0.6);
      if(bow&&bow.userData&&bow.userData.stringZ!==undefined){const w=bow.localToWorld(V(0,0,bow.userData.stringZ));tg=R.torso.worldToLocal(w).add(V(1.6,0.2,0.35));
        if(o.arrow!==false&&!bow.userData.nocked){const ar=arrowG(o.seed||2);ar.scale.setScalar(1/(bow.scale.x||1));ar.position.set(0.55,0.2,bow.userData.stringZ+8/(bow.scale.x||1));bow.add(ar);bow.userData.nocked=ar;}}
      armIK(R,1,tg,V(1,1.1,-0.2));R.handR.rotation.set(0,0,-0.4);}
    else{R.armR.rotation.set(0.08,0,0.1);R.foreR.rotation.set(-1.5,0,0);R.handR.rotation.set(0,0,0);if(bow&&bow.parent!==R.handR){bow.position.set(0,-1.75,0);bow.rotation.set(PI/2,0,0);if(bow.scale.x===1)bow.scale.setScalar(0.6);R.handR.add(bow);}}};
  M.armIK=(ch,side,target,pole)=>{const R=ch&&ch.userData&&ch.userData.rig||ch;if(R&&R.torso)armIK(R,side,target.isVector3?target:V(...target),pole?(pole.isVector3?pole:V(...pole)):V(side,-0.3,-0.8));};

  /* ======================================== B. BRONZE AGE TOOLS ======================================== */
  function haftW(seed){return new VB((p)=>mix(C('#9a7650'),C('#c09a6c'),cl(vn3(p[0]*0.5,p[1]*0.09,p[2]*0.5,seed)*1.4-0.2)));}
  const TL5={
    bow:G=>{G.add(bowG(0));},
    paddle:G=>{const W=haftW(31),B=new VB();
      loft(W,[[0,-12,0],[0,0,0],[0,18.5,0]],[0.76,0.72,0.7],6,{});pole(W,[-2.2,-12.4,0],[2.2,-12.4,0],0.82,0.82,6,true);
      const wAt=u=>u<0.22?lerp(0.8,3.5,sm(u/0.22)):3.5*Math.pow(1-Math.pow((u-0.22)/0.78,2.4),0.55)+0.2*(1-u);
      sheet(B,8,4,(u,v)=>[(2*v-1)*wAt(u)*0.92,18+u*18,0],(u,v)=>(0.62*(1-u*0.55))*Math.pow(1-Math.abs(2*v-1),0.8)+0.08,[0,0,1],
        (p,u,v)=>mix(mix(WD.b,WD.c,cl(vn3(p[0]*0.4,p[1]*0.12,0,32)*1.4-0.2)),WD.dk,u>0.96?0.6:0));
      addM(G,[W,'sb5Wood',{uv:10}],[B,'sb5Wood',{uv:10}]);},
    bronzeAxe:G=>{const W=haftW(21),B=new VB(bzCf(3)),yc=22.6;
      loft(W,[[0,-6,0],[0,8,0.1],[0,20,0.15],[0,24.6,0.1]],[0.95,1.0,1.06,1.0],6,{cap0:true,cap1:[0,25.3,0.1]});
      pole(W,[0,yc,0],[0,yc,4.4],0.95,0.85,6,false,{});
      loft(B,[[0,yc,0.8],[0,yc,1.55],[0,yc,1.6],[0,yc,4.9]],[[1.72,2.25],[1.72,2.25],[1.48,2.0],[1.38,1.9]],8,{cap0:true});
      const lo=u=>yc-1.75-7.6*Math.pow(u,1.5),hi=u=>yc+1.75+3.4*Math.pow(u,1.5),zE=v=>10.6+1.7*Math.pow(Math.sin(PI*v),0.8)+0.6*(1-v);
      sheet(B,5,6,(u,v)=>[0,lerp(lo(u),hi(u),v),lerp(4.6,zE(v),u)],(u,v)=>lerp(1.3,0.05,Math.pow(u,0.8))*(0.45+0.55*Math.pow(Math.sin(PI*v),0.5)),[1,0,0],bzSheet(3));
      addM(G,[W,'sb5Wood',{uv:10}],[B,'sb5Metal']);},
    bronzeSpear:G=>{const W=haftW(22),B=new VB(bzCf(5));
      loft(W,[[0,-12,0],[0,10,0],[0,33,0]],[0.72,0.76,0.8],6,{cap0:true});
      loft(B,[[0,31,0],[0,31.9,0],[0,31.95,0],[0,32.9,0],[0,32.95,0],[0,36.6,0]],[1.15,1.15,1.0,1.0,1.08,0.7],8,{cap0:true});
      const wAt=u=>Math.max(2.6*Math.pow(Math.sin(PI*Math.pow(u,0.62)),0.9),0.6*(1-u));
      sheet(B,8,4,(u,v)=>[0,35.4+u*14.8,(2*v-1)*wAt(u)],(u,v)=>(0.62*(1-u)+0.1)*Math.pow(1-Math.abs(2*v-1),1.1)+0.05*(1-u),[1,0,0],bzSheet(5));
      addM(G,[W,'sb5Wood',{uv:10}],[B,'sb5Metal']);},
    bronzeKnife:G=>{const B=new VB(),R0=(h)=>[h,h];
      B.cf=(p)=>{const y=p[1];const ring=(y>-3&&y<4)&&Math.abs(((y+10)%1.6)-0.8)<0.22;return ring?mix(bronzeAt(p,7,0,0.2),BZ.h,0.55):bronzeAt(p,7,0,0.3);};
      loft(B,[[0,-6.5,0],[0,-5.9,0],[0,-5.0,0],[0,-4.3,0],[0,-3.6,0],[0,-1.4,0],[0,1.4,0],[0,3.6,0],[0,4.4,0],[0,5.0,0],[0,5.6,0]],
        [[0.55,1.3],[0.95,2.9],[0.85,2.5],[0.7,0.85],R0(0.78),R0(0.92),R0(0.92),R0(0.82),[0.85,1.4],[0.95,2.5],[0.7,1.7]],6,{cap0:true,cap1:true,side:[1,0,0]});
      const wAt=u=>1.55*(1-Math.pow(u,2.4))*(1-0.25*u)+0.02;
      sheet(B,7,4,(u,v)=>[0,5.4+u*15.8,(2*v-1)*wAt(u)],(u,v)=>(0.5*(1-u)+0.08)*Math.pow(1-Math.abs(2*v-1),1.0)+0.03,[1,0,0],bzSheet(7,0.25));
      addM(G,[B,'sb5Metal']);},
    bronzeSickle:G=>{const W=haftW(23),B=new VB(bzCf(9));
      loft(W,[[0,-8,0],[0,4,0],[0,13.8,0]],[1.08,1.15,1.2],6,{cap0:true,cap1:true});
      loft(B,[[0,10.8,0],[0,11.4,0],[0,13.4,0],[0,14.3,0]],[1.5,1.38,1.38,1.25],7,{cap1:true});
      const cy=7.9,cz=5.9,r0=8.0,th0=0.78*PI,th1=-0.12;
      sheet(B,9,3,(u,v)=>{const th=lerp(th0,th1,u),w=2.3*(1-Math.pow(u,1.6))+0.12,ro=r0+0.35*(1-u),r=ro-w*(1-v);return [0,cy+r*Math.sin(th),cz+r*Math.cos(th)];},
        (u,v)=>0.06+0.5*Math.pow(v,1.4)*(1-0.65*u),[1,0,0],bzSheet(9));
      addM(G,[W,'sb5Wood',{uv:10}],[B,'sb5Metal']);},
    bronzeHoe:G=>{const W=haftW(24),B=new VB(bzCf(11));
      loft(W,[[0,-6,0],[0,10,0],[0,27.6,0]],[0.95,1.0,1.05],6,{cap0:true,cap1:true});
      loft(B,[[0,22.5,0],[0,23.1,0],[0,26.6,0],[0,27.3,0]],[[1.75,2.0],[1.6,1.85],[1.6,1.85],[1.75,2.0]],8,{side:[1,0,0],cap0:false});
      const dB=nrm3([0,-0.7,1]),N=nrm3(crs([1,0,0],dB)),base=[0,24.9,1.2],L=11.5;
      const wAt=u=>(1.9+2.4*Math.pow(Math.sin(PI*Math.min(u/0.6,1)*0.5),0.8))*(u>0.6?Math.pow(1-(u-0.6)/0.4,0.75):1)+0.02;
      sheet(B,7,4,(u,v)=>add3(add3(base,dB,L*u),[1,0,0],(2*v-1)*wAt(u)),(u,v)=>lerp(1.0,0.05,Math.pow(u,0.7))*(0.3+0.7*Math.pow(1-Math.abs(2*v-1),0.5)),N,bzSheet(11,0.45));
      addM(G,[W,'sb5Wood',{uv:10}],[B,'sb5Metal']);},
    fireDrill:G=>{const W=haftW(25),S=new VB(solid(PAL.rope)),Sp=new VB();
      W.cf=(p)=>mix(C('#6a5038'),C('#8a6a48'),cl(vn3(p[1]*0.4,p[2],0,25)*1.3-0.1));
      loft(W,[[0,-4,0],[0,4,1.5],[0,12,2.1],[0,20,1.4],[0,23,0.2]],[0.72,0.68,0.64,0.6,0.55],6,{cap0:true,cap1:true});
      Sp.cf=(p)=>Math.abs(p[0])>6.2?C('#2a2018'):Math.abs(p[0])>5.4?C('#5a4028'):C('#b08a5a');
      pole(Sp,[-6.8,9.5,-1.6],[6.6,9.5,-1.6],0.62,0.62,6,true);
      const wr=[];for(let k=0;k<=7;k++){const a=-PI/2+k/7*TAU*0.85;wr.push([-0.5+k*0.14,9.5+Math.sin(a)*0.78,-1.6+Math.cos(a)*0.78]);}
      cord(S,[[0,-3.4,0.25],[-0.5,8.8,-0.9],...wr,[0.5,10.2,-0.9],[0,22.4,0.35]],0.12);
      addM(G,[W,'sb5Wood',{uv:10}],[Sp,'sb5Flat'],[S,'sb5DS',{noShadow:true}]);}};
  const TOOL5=Object.keys(TL5);
  M.bow=(draw)=>bowG(draw);M.arrow=(seed)=>arrowG(seed);

  /* ======================================== C. ITEMS ======================================== */
  const layTool=(id,s,ang,tilt,spin)=>{const t=M.tool(id),S=g(t),W=g(S);t.rotation.y=spin||0;S.rotation.z=-PI/2+(tilt||0);t.scale.setScalar(s);W.rotation.y=ang;return rest(W);};
  function crucibleG(molten){const G=g(),B=new VB(),Mt=new VB(bzCf(13,0.1));
    B.cf=(p)=>{const r=Math.hypot(p[0],p[2]),y=p[1];let k=mix(PAL.clay[0],PAL.clay[1],cl(vn3(p[0]*0.5,y*0.5,p[2]*0.5,13)*1.4-0.2));
      if(r<2.95&&y>1.3&&y<6.4)k=mix(C('#3a2a22'),C('#5a3a2a'),y/6);k=mix(k,PAL.soot,ss(2.6,0.2,y)*0.75*(r>2.2?1:0));if(y>5.9&&p[0]>2.5)k=mix(k,C('#6a5a3a'),0.5);return k;};
    lathe(B,[0,0,0],[[0,0],[2.1,0],[3.0,0.7],[3.6,3.0],[3.7,5.4],[3.45,6.5],[2.75,6.6],[2.85,4.2],[1.9,1.6],[0,1.4]],10,
      {mod:(p,t,i)=>{if(i>=5&&i<=6){const k=Math.pow(Math.max(0,Math.cos(t)),6);p[0]+=k*1.1;p[1]+=k*0.35;}return p;}});
    if(!molten)lathe(Mt,[0,0,0],[[2.82,3.2],[2.6,3.45],[0,3.5]],10,{});
    addM(G,[B,'sb5Mud',{uv:8}],[Mt,'sb5Metal']);
    if(molten){const F=g();F.name='flame';F.userData.dyn=1;const ge=new T.CircleGeometry(2.78,10);ge.rotateX(-PI/2);F.add(K.mesh(ge,'sbMolten',{y:4.3,noShadow:true,mo:{ei:1.6}}));if(K.glow)F.add(K.glow('#ff8a30',16,{y:5.5,op:0.7},false));G.add(F);}
    G.userData={molten:!!molten};return G;}
  M.crucible=(molten)=>crucibleG(!!molten);
  // mineral veins: planes cut through a rock's triangles → raised ribbons on the surface + nodules/crystals along them
  function veins(tris,ctr,planes,V1,Nd,kind,seed,w,nod,span){const R=RNG(seed*3+1),segs=[];
    planes.forEach(([dir,k],pi)=>{const raw=[];tris.forEach(([a,b,c])=>{const sv=[a,b,c].map(p=>dot(p,dir)-k),P=[];for(let e=0;e<3;e++){const i0=e,i1=(e+1)%3;if((sv[i0]<0)!==(sv[i1]<0))P.push(lerp3([a,b,c][i0],[a,b,c][i1],sv[i0]/(sv[i0]-sv[i1])));}
        if(P.length!==2)return;let n=fnorm(a,b,c);if(dot(n,sub3(lerp3(a,b,.5),ctr))<0)n=mul(n,-1);const m=lerp3(P[0],P[1],.5);if(m[1]<0.8)return;raw.push([P[0],P[1],n,m]);});
      if(!raw.length)return;const up=raw.filter(r=>r[3][1]>ctr[1]*0.6),an=(up.length?up:raw)[Math.floor(R()*(up.length||raw.length))][3],L=span*(0.75+R()*0.5);
      raw.forEach(([A,Bp,n,m])=>{const da=len3(sub3(A,an))/L,db=len3(sub3(Bp,an))/L;if(Math.min(da,db)>1)return;const wa=w*Math.max(0,1-da*da),wb=w*Math.max(0,1-db*db);if(wa+wb<0.05)return;
        const t=nrm3(crs(n,sub3(Bp,A))),lift=0.12,ref=add3(m,n,-3);V1.q(add3(add3(A,t,-wa),n,lift),add3(add3(A,t,wa),n,lift),add3(add3(Bp,t,wb),n,lift),add3(add3(Bp,t,-wb),n,lift),ref);
        segs.push([m,n,Math.min(da,db)+pi*0.001,pi]);});});
    const per=Math.max(1,Math.round(nod/planes.length)),pick=[];planes.forEach((_,pi)=>{segs.filter(x=>x[3]===pi).sort((a,b)=>a[2]-b[2]).slice(0,per).forEach(x=>pick.push(x));});let made=0;
    for(let i=0;i<pick.length&&made<nod;i++){const [q,n]=pick[i];made++;
      if(kind==='copper'){Nd.cf=solid(made%3===0?PAL.azu:PAL.mal[made%2?2:1]);octb(Nd,add3(q,n,0.1),(0.6+R()*0.5)*w*1.7,[1,0.6,1],seed*31+i,0.45,R()*3);}
      else{Nd.cf=solid(PAL.cass[made%2]);crystal(Nd,add3(q,n,-0.3*w),add3(add3(q,n,(1.8+R()*1.4)*w),[R()-.5,R()-.5,R()-.5],0.6*w),(0.6+R()*0.35)*w*2.0,4,0.42,R());}}
    return segs;}
  const rockCf=(seed,stain,planes,kind)=>(p,n)=>{const k=hsh(Math.round(p[0]*2),Math.round(p[1]*2),Math.round(p[2]*2),seed);let c=mix(PAL.rock[k<0.5?0:1],PAL.rock[2],ss(0.3,0.9,n[1])*0.4);
    if(p[1]<1.2)c=mix(c,C('#5e584e'),0.4);let d=1e9;planes.forEach(([dir,kk])=>{d=Math.min(d,Math.abs(dot(p,dir)-kk));});
    if(d<stain)c=mix(c,kind==='copper'?C('#4f8a64'):C('#6a4a38'),(1-d/stain)*0.6);return c;};
  const veinPlanes=(R,ctr,n,spread)=>{const P=[];for(let i=0;i<n;i++){const dir=nrm3([R()-.5,0.5+R()*0.6,R()-.5]);P.push([dir,dot(ctr,dir)+(R()-.5)*spread]);}return P;};
  function oreChunk(B,V1,Nd,c,r,s,seed,kind){const R=RNG(seed),planes=veinPlanes(R,c,2,r*0.8);B.face=true;B.cf=rockCf(seed,r*0.35,planes,kind);
    V1.cf=kind==='copper'?(p)=>PAL.mal[hsh(Math.round(p[0]*6),Math.round(p[2]*6),1,1)<0.5?1:2]:solid(PAL.quartz);
    const tris=blob(B,c,r,s,seed,0.3,1);veins(tris,c,planes,V1,Nd,kind,seed,r*0.12,3,r*1.2);}
  const IT5={
    arrow:arrowItem,arrowhead:arrowheadItem,
    quiver:()=>{const q=quiverG(5,3,true),W=g(q);q.rotation.z=-PI/2+0.08;q.position.y=2.4;q.scale.setScalar(0.9);W.rotation.y=0.4;return rest(W);},
    fireDrill:()=>{const G=g(),W=new VB(),Sp=new VB(),S=new VB(solid(PAL.rope)),Tn=new VB(),St=new VB();
      W.cf=(p)=>{const sock=[-5,0,5].some(x=>Math.hypot(p[0]-x,p[2]-1.0)<1.05)&&p[1]>1.3;if(sock)return C('#2a1c14');if(p[2]>2.45&&[-5,0,5].some(x=>Math.abs(p[0]-x)<0.55))return C('#2e2018');return mix(C('#a88458'),C('#c4a274'),cl(vn3(p[0]*0.3,p[1],p[2]*0.6,41)*1.3-0.2));};
      box(W,[0,0.7,0],10,0.7,2.5,0);
      [-5,0,5].forEach(x=>{W.q([x-0.9,1.42,0.4],[x+0.9,1.42,0.4],[x+0.6,1.42,1.6],[x-0.6,1.42,1.6],[x,0,1]);});
      Sp.cf=(p)=>p[0]<-6.5?C('#2a2018'):C('#b08a5a');pole(Sp,[-7.5,2.0,-1.6],[6,1.0,-4.8],0.62,0.62,6,true);
      const Wb=haftW(42);Wb.cf=(p)=>mix(C('#6a5038'),C('#8a6a48'),cl(vn3(p[0]*0.4,0,p[2],25)*1.3-0.1));
      loft(Wb,[[-11,0.6,4.6],[-4,0.6,6.4],[4,0.6,6.6],[11,0.6,4.4]],[0.62,0.6,0.58,0.55],6,{cap0:true,cap1:true});
      cord(S,[[-10.6,0.7,4.2],[-3,0.5,4.6],[3,0.5,4.6],[10.6,0.7,4.0]],0.11);
      blob(St,[-9.6,0.9,-4.2],1.6,[1.1,0.6,1],43,0.3,0);St.cf=solid(PAL.rock[1]);
      Tn.cf=(p)=>mix(C('#c8a860'),C('#8a7040'),hsh(Math.round(p[0]*5),Math.round(p[2]*5),2,2));Tn.face=true;blob(Tn,[8.2,0.8,-3.6],1.9,[1.2,0.5,1],44,0.45,1);
      addM(G,[W,'sb5Wood',{uv:10}],[Wb,'sb5Wood',{uv:10}],[Sp,'sb5Flat'],[S,'sb5DS'],[St,'sb5Flat'],[Tn,'sb5Flat']);return G;},
    crucible:()=>crucibleG(false),
    copperOre:()=>{const G=g(),B=new VB(),V1=new VB(),N=new VB();oreChunk(B,V1,N,[0,3.4,0],4.6,[1.15,0.78,1],51,'copper');oreChunk(B,V1,N,[5.4,1.6,2.6],2.3,[1,0.8,1],52,'copper');
      addM(G,[B,'sb5Flat'],[V1,'sb5Gloss'],[N,'sb5Gloss']);return G;},
    tinOre:()=>{const G=g(),B=new VB(),V1=new VB(),N=new VB();oreChunk(B,V1,N,[0,3.2,0],4.4,[1.2,0.75,1],61,'tin');oreChunk(B,V1,N,[-5.2,1.6,2.4],2.4,[1,0.8,1],62,'tin');
      addM(G,[B,'sb5Flat'],[V1,'sb5Gloss'],[N,'sb5Metal']);return G;},
    bronze:()=>{const G=g(),B=new VB(bzCf(17,0.3));trap(B,[-1.7,0,0.4],10,3.0,2.2,1.9,0.08);trap(B,[1.7,0,-0.2],10,3.0,2.2,1.9,-0.05);trap(B,[0.2,1.9,0.1],10,3.0,2.2,1.9,PI/2+0.12);addM(G,[B,'sb5Metal']);return G;},
    charcoal:()=>{const G=g(),B=new VB(),R=RNG(71);B.face=true;B.cf=(p,n)=>{const k=hsh(Math.round(p[0]*6),Math.round(p[1]*6),Math.round(p[2]*6),3);return n[1]>0.6&&k>0.6?PAL.char[2]:k<0.5?PAL.char[0]:PAL.char[1];};
      [[0,1.6,0,2.4],[3.6,1.3,1.6,2],[-3.4,1.4,1.2,2.1],[1.2,1.2,-3.4,1.9],[-2.4,1.1,-2.6,1.7],[0.6,3.6,0.4,1.8],[4.2,1.0,-2.0,1.4]].forEach(([x,y,z,r],i)=>octb(B,[x,y,z],r,[1.3,0.75,0.95],70+i,0.45,R()*3));
      addM(G,[B,'sb5Flat']);return G;}};
  ['bronzeAxe','bronzeSpear','bronzeKnife','bronzeSickle','bronzeHoe'].forEach(id=>{IT5[id]=()=>layTool(id,id==='bronzeSpear'?0.32:id==='bronzeKnife'?0.62:id==='bronzeSickle'?0.62:0.5,0.6,0);});
  IT5.bow=()=>layTool('bow',0.4,0.5,0);IT5.paddle=()=>layTool('paddle',0.38,0.5,0,PI/2);

  /* ======================================== D. ORE ROCKS ======================================== */
  M.oreRock=(kind,seed)=>{kind=kind==='tin'?'tin':'copper';seed=+seed||1;const G=g(),B=new VB(),V1=new VB(),Nd=new VB(),R=RNG(seed*19+(kind==='tin'?7:3)),cu=kind==='copper',ctr=[0,8.4,0];
    const planes=veinPlanes(R,ctr,4,10);B.face=true;B.cf=rockCf(seed,3.4,planes,kind);
    V1.cf=cu?(p)=>PAL.mal[hsh(Math.round(p[0]),Math.round(p[1]),Math.round(p[2]),seed)<0.5?1:hsh(Math.round(p[2]),2,seed,3)<0.5?0:2]:(p)=>hsh(Math.round(p[0]),Math.round(p[2]),seed,5)<0.8?PAL.quartz:C('#c8c0b0');
    const tris=blob(B,ctr,13.2,[1.18,0.78,1.0],seed*5+1,0.3,1);
    blob(B,[11+R()*3,2.5,6+R()*3],6+R()*1.5,[1.1,0.75,1],seed*5+2,0.35,0);blob(B,[-12-R()*2,1.6,-5+R()*4],4.5+R()*1.2,[1.1,0.7,1],seed*5+3,0.35,0);
    veins(tris,ctr,planes,V1,Nd,kind,seed,cu?1.0:0.75,cu?11:11,11);
    if(cu){Nd.cf=solid(C('#c8743a'));for(let i=0;i<2;i++){const t=tris[Math.floor(R()*tris.length)],q=lerp3(lerp3(t[0],t[1],.5),t[2],.33);if(q[1]>4)octb(Nd,q,0.9,[1,0.5,1],seed+90+i,0.5,R()*3);}}
    [B,V1,Nd].forEach(X=>{X.p=X.p.map((v,i)=>i%3===1?v-2:v);});
    addM(G,[B,'sb5Rock',{uv:16}],[V1,'sb5Gloss'],[Nd,cu?'sb5Gloss':'sb5Metal']);G.userData={kind,ore:kind+'Ore',r:16};return G;};

  /* ======================================== E. PIECES ======================================== */
  // ---- Đông Sơn drum: canvas texture (tympanum left half, body bands right half) ----
  let _drumMat=null;
  function drawDrum(c){const R=RNG(77),L='rgba(232,200,128,0.95)',D='rgba(40,26,10,0.6)';
    c.fillStyle='#8e6c36';c.fillRect(0,0,1024,512);
    for(let i=0;i<3200;i++){const x=R()*1024,y=R()*512,r=1+R()*6,t=R();c.fillStyle=t<0.5?'rgba(64,46,20,'+(0.08+R()*0.14)+')':t<0.82?'rgba(200,164,96,'+(0.05+R()*0.1)+')':'rgba(78,150,118,'+(0.14+R()*0.25)+')';c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
    const rel=(f)=>{c.save();c.translate(1.6,1.8);c.strokeStyle=D;c.fillStyle=D;f();c.restore();c.save();c.strokeStyle=L;c.fillStyle=L;f();c.restore();};
    // ---- tympanum ----
    c.save();c.translate(256,256);
    rel(()=>{c.lineWidth=2.4;[70,75,98,103,124,129,148,153,210,215,236,241].forEach(r=>{c.beginPath();c.arc(0,0,r,0,TAU);c.stroke();});
      c.beginPath();c.arc(0,0,15,0,TAU);c.fill();
      for(let k=0;k<14;k++){const a=k/14*TAU;c.beginPath();c.moveTo(Math.cos(a-0.12)*15,Math.sin(a-0.12)*15);c.lineTo(Math.cos(a)*66,Math.sin(a)*66);c.lineTo(Math.cos(a+0.12)*15,Math.sin(a+0.12)*15);c.fill();
        const b=a+PI/14;c.lineWidth=1.6;for(let m=0;m<3;m++){const r0=26+m*12;c.beginPath();c.moveTo(Math.cos(b-0.13)*(r0+8),Math.sin(b-0.13)*(r0+8));c.lineTo(Math.cos(b)*r0,Math.sin(b)*r0);c.lineTo(Math.cos(b+0.13)*(r0+8),Math.sin(b+0.13)*(r0+8));c.stroke();}}
      c.lineWidth=2;for(let k=0;k<20;k++){const a=k/20*TAU,x=Math.cos(a)*86.5,y=Math.sin(a)*86.5;c.beginPath();c.arc(x,y,7,0,TAU);c.stroke();c.beginPath();c.arc(x,y,2.2,0,TAU);c.fill();
        const a2=(k+1)/20*TAU;c.beginPath();c.moveTo(x+Math.cos(a+PI/2)*7,y+Math.sin(a+PI/2)*7);c.lineTo(Math.cos(a2)*86.5+Math.cos(a2-PI/2)*7,Math.sin(a2)*86.5+Math.sin(a2-PI/2)*7);c.stroke();}
      c.lineWidth=1.5;for(let k=0;k<110;k++){const a=k/110*TAU;c.beginPath();c.moveTo(Math.cos(a)*105,Math.sin(a)*105);c.lineTo(Math.cos(a)*122,Math.sin(a)*122);c.stroke();}
      for(let k=0;k<36;k++){const a=k/36*TAU;c.beginPath();c.arc(Math.cos(a)*138.5,Math.sin(a)*138.5,4,0,TAU);c.stroke();c.beginPath();c.arc(Math.cos(a)*138.5,Math.sin(a)*138.5,1.4,0,TAU);c.fill();}
      for(let k=0;k<10;k++){const a=k/10*TAU+0.15;c.save();c.translate(Math.cos(a)*181,Math.sin(a)*181);c.rotate(a+PI/2);
        c.beginPath();c.ellipse(0,0,17,4.4,0,0,TAU);c.fill();
        c.beginPath();c.moveTo(14,-1.6);c.quadraticCurveTo(20,-6,25,-3.6);c.lineTo(27,-2.2);c.quadraticCurveTo(22,-3.5,15,1.6);c.fill();
        c.beginPath();c.moveTo(25.5,-3.3);c.lineTo(46,-1.2);c.lineTo(26.2,-1.8);c.fill();
        c.lineWidth=1.3;c.beginPath();c.moveTo(25,-4);c.lineTo(17,-11);c.moveTo(24,-4);c.lineTo(14,-9.5);c.stroke();
        c.beginPath();c.moveTo(4,-2);c.lineTo(-10,-24);c.lineTo(-4,-23);c.lineTo(12,-3);c.fill();
        c.beginPath();c.moveTo(-4,-2);c.lineTo(-18,-19);c.lineTo(-13,-20);c.lineTo(4,-3);c.fill();
        c.beginPath();c.moveTo(-15,0);c.lineTo(-30,-6);c.lineTo(-27,0);c.lineTo(-30,6);c.fill();c.restore();
        const b=a+PI/10;c.save();c.translate(Math.cos(b)*168,Math.sin(b)*168);c.rotate(b);c.beginPath();c.moveTo(-5,-4);c.lineTo(5,0);c.lineTo(-5,4);c.fill();c.restore();}
      c.lineWidth=2;c.beginPath();for(let k=0;k<=96;k++){const a=k/96*TAU,r=k%2?218:233;const x=Math.cos(a)*r,y=Math.sin(a)*r;k?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();
      for(let k=0;k<96;k+=2){const a=(k+1)/96*TAU;c.beginPath();c.arc(Math.cos(a)*229,Math.sin(a)*229,1.6,0,TAU);c.fill();}
      c.lineWidth=1.2;for(let k=0;k<160;k++){const a=k/160*TAU;c.beginPath();c.moveTo(Math.cos(a)*243,Math.sin(a)*243);c.lineTo(Math.cos(a)*252,Math.sin(a)*252);c.stroke();}});
    c.restore();
    // ---- body: x 512..1024 = one third of the circumference, row = (1 - y/24)*512 ----
    const row=y=>(1-y/24)*512;
    c.save();c.beginPath();c.rect(512,0,512,512);c.clip();
    rel(()=>{c.lineWidth=2;
      const hl=y=>{c.beginPath();c.moveTo(512,row(y));c.lineTo(1024,row(y));c.stroke();};
      [23.0,22.0,21.6,17.4,17.0,15.6,15.2,14.0,8.6,8.2,7.4].forEach(hl);
      c.lineWidth=1.4;for(let x=512;x<1024;x+=7){c.beginPath();c.moveTo(x,row(17.0));c.lineTo(x,row(15.6));c.stroke();c.beginPath();c.moveTo(x,row(8.2));c.lineTo(x,row(7.4));c.stroke();}
      for(let x=520;x<1024;x+=21){const y=(row(23)+row(22))/2;c.beginPath();c.arc(x,y,6.5,0,TAU);c.stroke();c.beginPath();c.arc(x,y,2,0,TAU);c.fill();}
      // boat with feathered rowers
      [[640,0],[896,1]].forEach(([bx,s])=>{const by=row(18.2);c.lineWidth=3;c.beginPath();c.moveTo(bx-100,by-26);c.quadraticCurveTo(bx-96,by+8,bx-60,by+8);c.lineTo(bx+60,by+8);c.quadraticCurveTo(bx+96,by+8,bx+100,by-26);c.stroke();
        c.beginPath();c.moveTo(bx-100,by-26);c.lineTo(bx-112,by-30);c.lineTo(bx-102,by-34);c.fill();c.beginPath();c.moveTo(bx+100,by-26);c.lineTo(bx+112,by-30);c.lineTo(bx+102,by-34);c.fill();
        c.lineWidth=2;for(let m=0;m<5;m++){const x=bx-52+m*26;c.beginPath();c.moveTo(x,by+4);c.lineTo(x+2,by-22);c.stroke();c.beginPath();c.arc(x+2,by-27,4.2,0,TAU);c.fill();
          c.beginPath();c.moveTo(x+1,by-30);c.lineTo(x-12,by-50);c.lineTo(x-6,by-50);c.lineTo(x+4,by-31);c.fill();c.beginPath();c.moveTo(x+2,by-14);c.lineTo(x+14,by+14);c.stroke();}
        c.lineWidth=1.6;c.beginPath();c.moveTo(bx-30,by-58);c.lineTo(bx+30,by-58);c.stroke();});
      // waist panels: ladder columns + plumed dancers
      for(let p=0;p<4;p++){const x0=512+p*128;c.lineWidth=1.3;for(let y=row(14.0);y<row(8.6);y+=6){c.beginPath();c.moveTo(x0+4,y);c.lineTo(x0+18,y);c.stroke();}
        c.lineWidth=2;c.beginPath();c.moveTo(x0+3,row(14));c.lineTo(x0+3,row(8.6));c.moveTo(x0+19,row(14));c.lineTo(x0+19,row(8.6));c.stroke();
        for(let m=0;m<2;m++){const x=x0+50+m*44,y=row(10.4);c.lineWidth=2.4;c.beginPath();c.moveTo(x,y);c.lineTo(x,y-28);c.moveTo(x,y-20);c.lineTo(x-12,y-30);c.moveTo(x,y-20);c.lineTo(x+12,y-28);c.moveTo(x,y);c.lineTo(x-8,y+14);c.moveTo(x,y);c.lineTo(x+8,y+14);c.stroke();
          c.beginPath();c.arc(x,y-33,5,0,TAU);c.fill();c.beginPath();c.moveTo(x-2,y-37);c.lineTo(x-20,y-62);c.lineTo(x-12,y-63);c.lineTo(x+2,y-38);c.fill();c.beginPath();c.moveTo(x+12,y-28);c.lineTo(x+14,y-46);c.stroke();}}});
    c.restore();
    for(let i=0;i<260;i++){const x=R()*1024,y=R()*512,r=3+R()*16;c.fillStyle='rgba(84,152,120,'+(0.08+R()*0.16)+')';c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
    c.fillStyle='#3a2c1a';c.fillRect(512,500,512,12);}
  function drumMat(){if(_drumMat)return _drumMat;let map=null;
    if(typeof document!=='undefined'){const cv=document.createElement('canvas');cv.width=1024;cv.height=512;const c=cv.getContext('2d');if(c){drawDrum(c);map=new T.CanvasTexture(cv);map.encoding=T.sRGBEncoding;map.anisotropy=4;}}
    const m=new T.MeshStandardMaterial({map,color:map?0xffffff:0xa07a3c,roughness:.48,metalness:.55});m.name=m.userData.key='sb5Drum';return _drumMat=m;}
  function bronzeDrum(){const G=g(),pos=[],nor=[],uv=[],n=18,per=6,Rt=15;
    const vtx=(r,y,t)=>[Math.cos(t)*r,y,-Math.sin(t)*r];
    const tri=(a,b,c,na,nb,nc,ua,ub,uc,out)=>{const fn=crs(sub3(b,a),sub3(c,a));if(dot(fn,fn)<1e-12)return;if(dot(fn,out)<0){let s=b;b=c;c=s;s=nb;nb=nc;nc=s;s=ub;ub=uc;uc=s;}
      pos.push(...a,...b,...c);nor.push(...na,...nb,...nc);uv.push(...ua,...ub,...uc);};
    const surf=(prof,uvc)=>{for(let i=0;i<prof.length-1;i++){const [r0,y0]=prof[i],[r1,y1]=prof[i+1];let nr=y1-y0,ny=-(r1-r0);const l=Math.hypot(nr,ny)||1;nr/=l;ny/=l;
      for(let j=0;j<n;j++){const t0=j/n*TAU,t1=(j+1)/n*TAU,u0=uvc?uvc[0]:0.5+0.5*((j%per)/per),u1=uvc?uvc[0]:0.5+0.5*((j%per+1)/per),v0=uvc?uvc[1]:y0/24,v1=uvc?uvc[1]:y1/24;
        const A=vtx(r0,y0,t0),B=vtx(r0,y0,t1),Cc=vtx(r1,y1,t1),D=vtx(r1,y1,t0),nA=[Math.cos(t0)*nr,ny,-Math.sin(t0)*nr],nB=[Math.cos(t1)*nr,ny,-Math.sin(t1)*nr],tm=(t0+t1)/2,out=[Math.cos(tm)*nr,ny,-Math.sin(tm)*nr];
        tri(A,B,Cc,nA,nB,nB,[u0,v0],[u1,v0],[u1,v1],out);tri(A,Cc,D,nA,nB,nA,[u0,v0],[u1,v1],[u0,v1],out);}}};
    const disc=(r,y,up,uvc)=>{const N=[0,up,0];for(let j=0;j<n;j++){const t0=j/n*TAU,t1=(j+1)/n*TAU,uvf=t=>uvc?uvc:[0.25+Math.cos(t)*0.244,0.5+Math.sin(t)*0.488];
      tri([0,y,0],vtx(r,y,t0),vtx(r,y,t1),N,N,N,uvc?uvc:[0.25,0.5],uvf(t0),uvf(t1),N);}};
    surf([[13.0,0],[14.3,0],[13.9,1.2],[13.1,3.4],[12.35,8.4],[12.3,14.0],[13.9,17.6],[14.5,20.4],[13.8,22.8],[Rt,23.15],[Rt,24.0]]);
    disc(Rt,24,1);
    const dk=[0.75,0.008];disc(12.8,22.4,-1,dk);surf([[12.8,22.4],[12.2,13],[13.0,0]],dk);
    const ge=new T.BufferGeometry();ge.setAttribute('position',new T.Float32BufferAttribute(pos,3));ge.setAttribute('normal',new T.Float32BufferAttribute(nor,3));ge.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    const ms=new T.Mesh(ge,drumMat());ms.castShadow=ms.receiveShadow=true;ms.name='sb5Drum';G.add(ms);
    const Hb=new VB((p)=>Math.sin(p[1]*7)>0?mix(BZ.b,BZ.h,0.25):BZ.d);
    [0.2,-0.2,PI+0.2,PI-0.2].forEach(t=>{const P=[[14.4,19.9],[15.8,18.7],[15.3,16.0],[13.0,14.5]].map(([r,y])=>vtx(r,y,t));loft(Hb,P,[[0.8,0.32],[0.8,0.34],[0.8,0.34],[0.8,0.32]],4,{side:[-Math.sin(t),0,-Math.cos(t)]});});
    addM(G,[Hb,'sb5Metal']);G.userData={h:24,r:Rt,colliders:[[0,0,15]]};return G;}
  // ---- big copper smelter ----
  function smelterBig(lit){const G=g(),Cl=new VB(),W=new VB(),Bm=new VB(),Fl=new VB(),R=RNG(91),fx=6,fz=-4;
    const clayAt=(p,n)=>{const y=p[1],k=vn3(p[0]*0.25,y*0.25,p[2]*0.25,91);let c=mix(PAL.clay[1],PAL.clay[0],cl(k*1.5-0.2));if(k>0.66)c=mix(c,PAL.clay[2],0.5);
      c=mix(c,PAL.soot,ss(24,31,y)*0.85);if(y<1.3)c=mix(c,C('#6a4a34'),0.4);return c;};
    Cl.cf=clayAt;
    // apron + furnace shaft (lathe, solid on the left)
    lathe(Cl,[fx,0,fz],[[0,1.4],[13.8,1.2],[15.2,0.1],[15.4,-0.6]].reverse(),14,{});
    lathe(Cl,[fx,0,fz],[[12.2,0.8],[12.5,4.2],[11.4,12],[9.0,22],[7.4,28.6],[8.2,29.8],[7.9,31.0],[5.5,31.2],[4.8,29],[4.5,25.5],[0,25.5]],14,
      {rot:0.1,mod:(p,t,i)=>{const j=hsh(Math.round(t*100),i,9,1)-0.5;if(i>0&&i<7){p[0]+=Math.cos(t)*j*0.5;p[2]-=Math.sin(t)*j*0.5;}return p;}});
    // patched clay lumps
    // clay coil seams
    [6.5,13,19.5].forEach((y,i)=>{const r=lerp(12.45,8.4,(y-4.2)/17.8)+0.15;Cl.cf=(p,n)=>mix(clayAt(p,n),PAL.clay[1],0.35);lathe(Cl,[fx,0,fz],[[r-0.2,y-0.7],[r+0.35,y],[r-0.2,y+0.7]],14,{rot:0.1+i});});
    Cl.cf=clayAt;
    // tapping arch (dark recess) at the front and clay channel to the mould
    const Dk=new VB(solid(C('#1e1612')));{const zf=fz+12.25,P=[];for(let k=0;k<=6;k++){const a=k/6*PI;P.push([fx+Math.cos(a)*3,1.1+Math.sin(a)*3.2,zf+0.5]);}for(let k=0;k<6;k++)Dk.o([fx,1.1,zf+0.55],P[k],P[k+1],[fx,1.1,zf-3]);}
    const chan=[[fx,1.0,fz+12.6],[fx+0.3,0.7,fz+16.5],[fx+0.8,0.45,fz+16.6]];
    Cl.cf=clayAt;loft(Cl,chan,[[2.4,1.0],[2.2,0.9],[2.1,0.8]],6,{rot:PI/2+PI/6});
    // mould pit (sand) with two ingot hollows
    const Sd=new VB((p)=>mix(C('#b49a72'),C('#9a8060'),hsh(Math.round(p[0]*2),Math.round(p[2]*2),3,3)));lathe(Sd,[fx+1.2,0,fz+19.8],[[4.6,0],[3.9,0.7],[0,0.85]],9,{rot:0.2});
    [[-1.2],[1.4]].forEach(([dx])=>{box(Dk,[fx+1.2+dx,0.9,fz+19.9],0.8,0.06,2.2,0);});
    // tuyère from the bellows into the furnace (−X side)
    Cl.cf=(p)=>mix(PAL.clay[0],PAL.soot,ss(-10,-4,p[0]-fx)*0.6);loft(Cl,[[fx-11.6,5.4,fz+0.4],[fx-16,4.8,fz+0.6],[fx-19,4.3,fz+0.6]],[1.7,1.6,1.5],7,{cap1:true});
    // twin piston bellows (hollow logs) + bamboo pipes
    const bx=fx-26,bzs=[fz-2.6,fz+3.8],up=[0.4,0.85];
    bzs.forEach((z,i)=>{W.cf=(p)=>{const t=p[1];if(Math.abs(t-3)<0.6||Math.abs(t-17)<0.6)return PAL.ropeD;return mix(WD.dk,WD.b,cl(vn3(Math.atan2(p[2]-z,p[0]-bx)*2,t*0.2,i,93)*1.4-0.1));};
      loft(W,[[bx,0,z],[bx,10,z],[bx,20,z]],[2.9,2.8,2.75],8,{cap0:true});
      W.cf=solid(C('#2a1e16'));lathe(W,[bx,0,z],[[2.75,20],[2.2,19.5],[0,19.5]],8,{});
      const top=20+up[i]*9;W.cf=woodCf(94+i);pole(W,[bx,15,z],[bx,top,z],0.55,0.55,5,false);pole(W,[bx-2.4,top,z],[bx+2.4,top,z],0.62,0.62,5,true);
      Bm.cf=solid(PAL.bm.b);pole(Bm,[bx+0.6,1.6,z],[fx-18.6,4.2,fz+0.6+(z-fz)*0.15],0.85,0.8,6,false);});
    Bm.cf=solid(PAL.rope);lash(Bm,[bx,17,(bzs[0]+bzs[1])/2],[0,1,0],[1.2,4.6],1.4,6);
    // stone footing under the bellows
    const St=new VB();St.face=true;St.cf=(p)=>PAL.rock[Math.floor(hsh(Math.round(p[0]),Math.round(p[2]),2,2)*3)];blob(St,[bx+0.3,0,fz+0.6],5.2,[1.0,0.22,1.55],95,0.3,0);
    // charcoal heap + ore lumps
    const Ch=new VB();Ch.face=true;Ch.cf=(p,n)=>PAL.char[Math.floor(hsh(Math.round(p[0]*2),Math.round(p[1]*2),Math.round(p[2]*2),5)*3)];
    blob(Ch,[fx+20,0.2,fz-7],5.6,[1.15,0.62,1],96,0.35,1);for(let i=0;i<7;i++){const a=R()*TAU,d=5+R()*2.5;octb(Ch,[fx+20+Math.cos(a)*d,0.7,fz-7-Math.sin(a)*d*0.9],0.9+R()*0.6,[1.3,0.7,1],97+i,0.4,R()*3);}
    const Or=new VB();Or.face=true;Or.cf=(p)=>{const k=hsh(Math.round(p[0]*3),Math.round(p[1]*3),Math.round(p[2]*3),6);return k<0.45?PAL.mal[1]:k<0.7?PAL.mal[0]:PAL.rock[1];};
    for(let i=0;i<5;i++)octb(Or,[fx+15+R()*4,0.9,fz+6+R()*4],1.0+R()*0.5,[1.2,0.8,1],99+i,0.4,R()*3);
    // the crucible beside the mould
    const cr=crucibleG(false);cr.position.set(fx+11,0,fz+15);cr.scale.setScalar(0.9);
    // merge: Dk/St/Ch/Or/Sd → Fl (flat), Bm (bamboo/rope) → flat as well (≤4 materials: sb5Mud, sb5Wood, sb5Flat, sb5Metal)
    [Dk,St,Ch,Or,Sd,Bm].forEach(B=>{Fl.p.push(...B.p);Fl.c.push(...B.c);});
    addM(G,[Cl,'sb5Mud',{uv:14}],[W,'sb5Wood',{uv:12}],[Fl,'sb5Flat']);
    G.add(cr);
    if(lit){const F=flame(0.62,92,{glow:52});F.position.set(fx,29.4,fz);
      // molten trickle in the channel + glowing tap hole
      F.add(K.mesh((()=>{const g2=new T.PlaneGeometry(1.4,4.6);g2.rotateX(-PI/2+0.06);return g2;})(),'sbMolten',{x:0.5,y:-27.7,z:14.6,ry:-0.08,noShadow:true,mo:{ei:1.6}}));
      F.add(K.mesh((()=>{const g2=new T.CircleGeometry(2.4,8,0,PI);return g2;})(),'sbEmber',{y:-28.3,z:12.82,noShadow:true,mo:{ei:1.8}}));
      if(K.glow)F.add(K.glow('#ff7a28',22,{y:-26.5,z:14.5,op:0.7},false));
      F.add(K.mesh(new T.CircleGeometry(4.4,10).rotateX(-PI/2),'sbEmber',{y:-3.6,noShadow:true,mo:{ei:1.4}}));G.add(F);}
    G.userData={lit:!!lit,footprint:[2,1],furnace:[fx,0,fz],top:31.2,colliders:[[fx,fz,12.5],[bx,fz+0.6,6.5]]};return G;}
  function anvilStone(){const G=g(),S=new VB(),Tp=new VB(),Bz=new VB(bzCf(19,0.2)),R=RNG(111);S.face=true;
    S.cf=(p,n)=>{const k=hsh(Math.round(p[0]*1.5),Math.round(p[1]*1.5),Math.round(p[2]*1.5),11);let c=mix(PAL.rock[k<0.5?1:0],PAL.rock[3],ss(4,0,p[1])*0.6);if(n[1]>0.92&&p[1]>10.5)c=mix(PAL.rock[2],C('#b8b0a2'),k);if(n[1]>0.92&&p[1]>10.5&&k>0.9)c=mix(c,BZ.b,0.6);return c;};
    blob(S,[0,4.4,0],11,[1.2,0.68,0.88],113,0.22,1,(q)=>{if(q[1]>10.6)q[1]=11.4+(q[1]-10.6)*0.05;q[1]-=1.0;return q;});
    Tp.face=true;Tp.cf=(p,n)=>mix(C('#857a6c'),C('#a69c8c'),hsh(Math.round(p[0]*4),Math.round(p[1]*4),1,1));blob(Tp,[-5.2,12.4,2.2],2.4,[1.15,0.8,1],114,0.18,0);blob(Tp,[9.5,1.0,6.5],2.0,[1.2,0.7,1],115,0.25,0);
    sheet(Bz,3,3,(u,v)=>[1.5+u*6.6,10.55,-1.8+lerp(-1.4-1.6*u,1.4+1.2*u,v)],(u,v)=>lerp(0.45,0.08,u)*(0.5+0.5*Math.sin(PI*v)),[0,1,0],bzSheet(19,0.15));
    for(let i=0;i<4;i++)octb(Bz,[4+R()*5,0.3,6+R()*3],0.45,[1.2,0.4,1],116+i,0.3,R()*3);
    addM(G,[S,'sb5Rock',{uv:12}],[Tp,'sb5Flat'],[Bz,'sb5Metal']);G.userData={top:11.4,colliders:[[0,0,12]]};return G;}
  const P5={bronzeDrum,smelterBig:()=>smelterBig(true),smelterBigOff:()=>smelterBig(false),anvilStone};

  /* ======================================== F. BOATS ======================================== */
  function raft(){const G=g(),Bb=new VB(),Dk=new VB(),Rp=new VB(solid(PAL.rope)),nC=9,sp=4,rC=2.2,y0=0.8;
    const bowY=z=>Math.pow(Math.max(0,(z-14)/16),2)*5;
    for(let i=0;i<nC;i++){const x=(i-(nC-1)/2)*sp,len=29.5-(hsh(i,1,1,1)*1.2),zb=-len+hsh(i,2,2,2)*0.8,P=[zb,-14,0,14,22,len].map(z=>[x,y0+bowY(z),z]),c0=hsh(i,3,3,3);
      Bb.cf=(p,n)=>{if(Math.abs(n[2])>0.85&&Math.abs(n[1])<0.4)return C('#d8c894');const z=p[2],node=Math.abs(((z+40+i*3)%11)-5.5)<0.45;return node?PAL.bm.n:mix(mix(PAL.bm.a,PAL.bm.g,c0*0.6),PAL.bm.d,cl(vn3(z*0.1,i,0,5)*1.2-0.3));};
      loft(Bb,P,[rC,rC,rC*0.98,rC*0.95,rC*0.9,rC*0.84],6,{cap0:true,cap1:true,rot:0.2});}
    // cross poles
    [-24.6,16.6].forEach((z,k)=>{const y=y0+bowY(z)+rC+0.9;Bb.cf=(p)=>mix(PAL.bm.b,PAL.bm.d,0.3+0.2*k);pole(Bb,[-19.2,y,z],[19.2,y,z],0.95,0.95,6,true);
      [-4,-1,1,4].forEach(ci=>{const x=ci*sp;lash(Rp,[x,y-0.45,z],[0,0,1],[1.4,1.5],1.6,5);});});
    // split-bamboo deck slats (top ≈ 3.9)
    Dk.cf=(p,n)=>n[1]>0.5?mix(C('#d2b97c'),C('#b89c5e'),hsh(Math.round(p[2]),3,1,1)):PAL.bm.d;
    for(let k=0;k<12;k++){const z=-20.6+k*3.05;box(Dk,[0,y0+rC+0.45,z],15.5,0.45,1.3,0.0);}
    // punting pole lying on the deck + rope coil
    Bb.cf=(p)=>mix(PAL.bm.b,PAL.bm.g,0.4);pole(Bb,[13.5,y0+rC+1.6,-27],[12.2,y0+rC+1.6,26],0.62,0.55,5,true);
    ringB(Rp,[-11,y0+rC+1.2,-12],2.2,2.2,0.42,8,4);ringB(Rp,[-11,y0+rC+1.9,-12],1.6,1.6,0.4,7,4);
    addM(G,[Bb,'sb5Bamboo',{uv:10}],[Dk,'sb5Bamboo',{uv:10}],[Rp,'sb5Flat']);G.userData={kind:'raft',len:60,width:36,seatY:3.9,deckY:3.9,seats:[[0,3.9,-6],[0,3.9,9]],draft:1.4};return G;}
  function canoe(){const G=g(),O=new VB(),I=new VB(),Pl=new VB(),N=17,K2=8,Lh=45;
    const w=z=>8.6*Math.pow(Math.max(0,1-Math.pow(Math.abs(z)/Lh,2.2)),0.72),yr=z=>6.8+3.0*Math.pow(Math.abs(z)/Lh,3.2),yb=z=>-4.2+5.4*Math.pow(Math.abs(z)/Lh,2.8),hz=z=>ss(43,35,Math.abs(z));
    const zs=[];for(let i=0;i<N;i++){const t=-1+2*i/(N-1);zs.push(Lh*Math.sign(t)*Math.pow(Math.abs(t),0.92));}
    const outer=zs.map(z=>{const r=[];for(let k=0;k<=K2;k++){const a=k/K2*PI,s=Math.pow(Math.sin(a),0.7);r.push([-Math.cos(a)*w(z)*(1-0.04*s),yr(z)-(yr(z)-yb(z))*s,z]);}return r;});
    const inner=zs.map(z=>{const wi=Math.max(0,w(z)-1.25)*hz(z),ybi=yb(z)+1.6,yi=yr(z)-(yr(z)-ybi)*hz(z),r=[];for(let k=0;k<=K2;k++){const a=k/K2*PI,s=Math.pow(Math.sin(a),0.75);r.push([-Math.cos(a)*wi,yr(z)-(yr(z)-yi)*s,z]);}return r;});
    O.cf=(p,n)=>{let k=mix(C('#5a4230'),C('#6e543a'),cl(vn3(p[0]*0.2,p[1]*0.3,p[2]*0.05,121)*1.4-0.2));if(vn3(p[0]*0.3,p[1]*0.3,p[2]*0.1,122)>0.7)k=mix(k,C('#3e3024'),0.6);if(p[1]<0.2)k=mix(k,C('#3c3a2a'),0.35);return k;};
    I.cf=(p,n)=>{const adze=Math.sin(p[2]*1.9+Math.sin(p[0]*0.8)*1.2)*0.5+0.5;let k=mix(C('#9a764e'),C('#b08a5c'),adze*0.6);const ch=vn3(p[0]*0.35,p[1]*0.35,p[2]*0.12,123);if(ch>0.68)k=mix(k,C('#33261c'),cl((ch-0.68)*6)*0.85);return k;};
    for(let i=0;i<N-1;i++)for(let k=0;k<K2;k++){const a=outer[i][k],b=outer[i][k+1],c=outer[i+1][k+1],d=outer[i+1][k],ia=inner[i][k],ib=inner[i][k+1],ic=inner[i+1][k+1],id=inner[i+1][k];
      O.q(a,b,c,d,lerp3(lerp3(ia,ic,.5),[0,yr(zs[i])+2,zs[i]],0.0));I.q(ia,ib,ic,id,lerp3(lerp3(a,c,.5),[0,-20,(zs[i]+zs[i+1])/2],0.15));}
    // rims (gunwales)
    const Rm=new VB((p)=>mix(C('#7a5c3e'),C('#94704a'),cl(vn3(p[2]*0.1,p[0],0,124)*1.3)));
    for(let i=0;i<N-1;i++)[0,K2].forEach(k=>{Rm.q(outer[i][k],inner[i][k],inner[i+1][k],outer[i+1][k],[(outer[i][k][0]+inner[i][k][0])/2,yr(zs[i])-3,zs[i]]);});
    // end faces (close the stems: outer at the end stations collapses, nothing to do) – plank floor top y=2
    Pl.cf=(p,n)=>n[1]>0.5?mix(C('#b8935e'),C('#a07c50'),hsh(Math.round(p[0]),1,2,2)):C('#6a5034');
    [-3.6,0,3.6].forEach((x,i)=>box(Pl,[x,1.55,0],1.62,0.45,24-i%2*1.5,0));[-14,12].forEach(z=>box(Pl,[0,0.7,z],5.6,0.5,0.9,0));
    O.p.push(...Rm.p);O.c.push(...Rm.c);
    addM(G,[O,'sb5Wood',{uv:14}],[I,'sb5Wood',{uv:14}],[Pl,'sb5Wood',{uv:10}]);G.userData={kind:'canoe',len:90,width:17.2,seatY:2,rimY:6.8,draft:4.2,seats:[[0,2,-12],[0,2,12]]};return G;}
  M.boat=(kind)=>kind==='canoe'?canoe():raft();

  /* ======================================== G. VILLAGERS ======================================== */
  // ---- accessories (in the frame of the bone they attach to) ----
  function headdress(o){o=o||{};const G=g(),B=new VB(),F=new VB(),R=RNG((o.seed||1)*7+5);
    B.cf=(p)=>Math.abs(p[2])>1.6&&p[2]>0?C('#c8a050'):Math.sin(Math.atan2(p[2],p[0])*14)>0?C('#7e3a26'):C('#c4a46a');
    ringB(B,[0,4.25,-0.25],2.0,2.25,0.3,10,4);
    // forehead disc (bronze/shell)
    B.cf=solid(C('#d8c79a'));octb(B,[0,4.35,2.05],0.55,[1,1,0.35],3,0,0);
    const nF=9;for(let i=0;i<nF;i++){const t=(i/(nF-1))*2-1,a=PI/2+t*1.55+PI,base=[Math.cos(a)*1.95,4.3-0.25*Math.abs(t)+0.1,-0.25-Math.sin(a)*2.2*-1];
      const bz=[Math.cos(a)*1.95,4.3,-0.25+Math.sin(a)*2.2],out=nrm3([Math.cos(a),0,Math.sin(a)]),Lf=6.4+(1-Math.abs(t))*2.6+R()*0.8,dir=nrm3(add3(add3([0,1,0],out,0.35+0.25*Math.abs(t)),[0,0,-1],0.55));
      const tip=add3(bz,dir,Lf),side=nrm3(crs(dir,out)),c0=i%2?PAL.feather[0]:PAL.feather[4],c1=i%3===0?PAL.feather[3]:PAL.feather[2];
      F.cf=(p)=>{const k=dot(sub3(p,bz),dir)/Lf;return k>0.78?c1:k>0.6?mix(c0,c1,0.3):c0;};leaf(F,add3(bz,dir,0.2),tip,0.62,side,mul(out,0.15));}
    addM(G,[B,'sb5Flat'],[F,'sb5DS']);return G;}
  function necklace(o){o=o||{};const G=g(),B=new VB(),Cd=new VB(solid(C('#3a2a1e'))),R=RNG((o.seed||1)*11+3),bw=o.bw||1,fem=!!o.fem,zf=(fem?1.2:1.3)*(1+((bw-1)*0.6));
    const ctrl=[[0,9.4,-1.05],[1.25*bw,9.35,-0.65],[1.75*bw,9.05,0.1],[1.55*bw,8.55,0.85*zf/1.3],[0.85*bw,7.95,zf+0.12],[0,7.65,zf+0.32]];
    const path=[];for(let i=ctrl.length-1;i>0;i--)path.push([-ctrl[i][0],ctrl[i][1],ctrl[i][2]]);ctrl.forEach(p=>path.push(p));
        cord(Cd,path.slice(0,path.length),0.07);
    const cols=[[C('#ece2cc'),C('#a84a2a'),C('#ece2cc')],[C('#5f9a82'),C('#d8cfbe'),C('#5f9a82')],[C('#a84a2a'),C('#2a201c'),C('#c8a050')]][Math.floor(R()*3)];
    const front=path.slice(1).filter(p=>p[2]>0.2);front.forEach((p,i)=>{B.cf=solid(cols[i%3]);octb(B,add3(p,[0,0,0.1]),0.26,[1,1,0.8],i+1,0.2,0.3);});
    // mid points between ctrl points for more beads
    for(let i=0;i<path.length-1;i++){const p=lerp3(path[i],path[i+1],0.5);if(p[2]>0.3){B.cf=solid(cols[(i+1)%3]);octb(B,add3(p,[0,0,0.1]),0.22,[1,1,0.8],i+20,0.2,0);}}
    // pendant: tooth / stone
    B.cf=solid(R()<0.5?C('#efe6d0'):C('#7fae96'));spike(B,[0,7.55,zf+0.42],[0,6.3,zf+0.55],0.32,4,true);
    addM(G,[Cd,'sb5DS'],[B,'sb5Gloss']);return G;}
  function bracelet(o){o=o||{};const G=g(),B=new VB(solid(o.color?C(o.color):[C('#cfd8c4'),C('#9fb59a'),C('#e8dcc4')][Math.floor(hsh(o.seed||1,2,3,4)*3)]));ringB(B,[0,-4.25,0.02],0.66,0.74,0.17,8,3);addM(G,[B,'sb5Gloss']);return G;}
  // gùi: woven back basket, in rig.back frame (torso (0,4.5,-1.9)); straps over the shoulders
  function basketBack(o){o=o||{};const G=g(),B=new VB(),S=new VB(solid(PAL.ropeD)),bw=o.bw||1,c=[0,-2.2,-3.1];
    B.cf=(p)=>{const a=Math.atan2(p[2]-c[2],p[0]),y=p[1];const w=(Math.sin(a*10+y*1.8)>0)!==(Math.sin(y*3.2)>0);if(y>c[1]+8.6)return C('#7e6a40');return w?PAL.bm.a:PAL.bm.d;};
    lathe(B,c,[[0,-5.3],[1.7,-5.3],[2.0,-4.7],[3.1,-0.2],[3.7,3.4],[3.9,3.8],[3.7,4.1],[3.4,3.6],[2.8,-0.3],[0,-0.5]].map(([r,y])=>[r,y+5.3]),10,{});
    // straps (back frame): over the shoulders and down to the basket bottom
    [-1,1].forEach(s=>{cord(S,[[s*1.6*bw,c[1]+8.8,c[2]+3.1],[s*1.75*bw,5.0,0.6],[s*2.0*bw,4.55,2.6],[s*2.35*bw,2.8,3.4],[s*2.75*bw,0.6,2.6],[s*2.8*bw,-0.6,0.9],[s*2.2*bw,c[1]+1.4,c[2]+2.4]],0.26);});
    addM(G,[B,'sb5Bamboo',{uv:6}],[S,'sb5DS']);return G;}
  function quiverBack(o){o=o||{};const G=g(),q=quiverG(5,(o.seed||1)+3,false),bw=o.bw||1,S=new VB(solid(PAL.hide[2]));
    const b=[-2.0*bw,-4.2,-1.6],t=[2.2*bw,8.4,-1.4],d=nrm3(sub3(t,b));q.position.set(...b);q.quaternion.setFromUnitVectors(V(0,1,0),V(...d));q.scale.setScalar(0.85);G.add(q);
    cord(S,[[2.3*bw,6.2,-0.2],[2.5*bw,5.0,1.0],[2.3*bw,4.3,2.6],[0.6,1.6,3.4],[-1.6*bw,-1.6,3.2],[-2.6*bw,-3.2,1.9],[-2.6*bw,-3.6,-0.4]],0.28);addM(G,[S,'sb5DS']);return G;}
  const PROPS={headdress,necklace,basketBack,quiverBack,bracelet};
  M.npcProp=(id,o)=>PROPS[id]?PROPS[id](o):g();
  const ROLES=['chief','hunter','potter','gatherer','elder','child'];
  const SKIN=['#7c4f33','#8d5b3b','#9a6643','#a8714b','#b57d55','#c08a60','#a06a48','#86563a','#b47a50'];
  const BARK=['#a88a64','#9c7c56','#b59a72','#8f7452'],HIDE=['#7a5232','#8e5a30','#6a4628','#946640'],FIBRE=['#b49a6a','#a69060','#c0a878'],DYE=['#7e3a26','#8a4a2a','#5a4a3a','#4a3e34','#6e5a3a'];
  M.villager=(seed,role)=>{seed=+seed||1;if(!ROLES.includes(role))role=ROLES[Math.floor(hsh(seed,5,7,1)*ROLES.length)];
    const R=RNG(seed*31+ROLES.indexOf(role)*7+3),pick=a=>a[Math.floor(R()*a.length)],chance=p=>R()<p;
    const pf={chief:.15,hunter:.3,potter:.75,gatherer:.8,elder:.5,child:.5}[role],sex=hsh(seed,ROLES.indexOf(role)+1,13,29)<pf?'f':'m',fem=sex==='f';
    const L={sex,skin:pick(SKIN),hair:pick(['#141010','#1c1410','#221812','#2a1c14']),hairStyle:fem?(chance(.6)?0:2):pick([0,1,1,2]),beard:false,build:0.95+R()*0.12};
    const props=[];let brac=0;
    if(role==='chief'){L.top=pick(DYE);L.top2='#c8a050';L.bottom=pick(HIDE);L.cloak=pick(['#5a3f28','#7e3a26','#4a3a2e']);L.boots=pick(HIDE);L.sleeves=false;L.build=1.06+R()*0.06;L.beard=!fem&&chance(.7);L.hairStyle=fem?0:pick([0,2]);props.push('headdress','necklace');brac=2;}
    else if(role==='hunter'){if(!fem&&chance(.5))L.bare=true;L.top=pick(HIDE);L.bottom=pick(HIDE);L.sleeves=false;if(chance(.6))L.boots=pick(HIDE);L.beard=!fem&&chance(.45);L.build=1.0+R()*0.1;props.push('quiverBack');if(chance(.4))props.push('necklace');brac=chance(.3)?1:0;}
    else if(role==='potter'){L.top=pick(FIBRE.concat(BARK));L.skirt=pick(BARK);L.sleeves=false;L.beard=!fem&&chance(.3);if(chance(.5))props.push('necklace');brac=chance(.7)?2:0;}
    else if(role==='gatherer'){L.top=pick(BARK.concat(FIBRE));L.skirt=pick(BARK.concat(HIDE));L.sleeves=chance(.3);L.beard=!fem&&chance(.3);props.push('basketBack');brac=chance(.4)?1:0;}
    else if(role==='elder'){L.hair=pick(['#9a948c','#c8c2b8','#7d766e','#b0aaa0']);L.top=pick(BARK.concat(DYE));L.bottom=pick(HIDE);L.cloak=pick(['#6a5038','#5a4a3a','#7a5a3a']);L.sleeves=chance(.5)?'long':true;L.beard=!fem&&chance(.9);L.build=0.9+R()*0.05;if(chance(.6))props.push('necklace');}
    else{if(!fem&&chance(.7))L.bare=true;L.top=pick(BARK.concat(FIBRE));L.bottom=pick(BARK);L.sleeves=false;L.hairStyle=pick([1,2,1]);L.build=0.9;brac=chance(.3)?1:0;}
    if(L.skirt)L.bottom=L.skirt;
    const ch=K.char2(L),Rg=ch.userData.rig,o={fem,bw:Math.max(0.85,Math.min(1.15,L.build)),seed};
    props.forEach(id=>{const p=PROPS[id](o);(id==='headdress'?Rg.head:id==='necklace'?Rg.torso:Rg.back).add(p);});
    if(brac&&L.sleeves!=='long'){Rg.foreL.add(bracelet(o));if(brac>1)Rg.foreR.add(bracelet({seed:seed+1}));props.push('bracelet');}
    if(role==='child')ch.scale.setScalar(0.65);
    ch.userData.villager={seed,role,sex,look:L,props};return ch;};

  /* ======================================== REGISTER ======================================== */
  {const oldTool=M.tool;M.tool=(id,...a)=>{if(TL5[id]){const G=g();TL5[id](G,...a);return G;}return oldTool(id,...a);};TOOL5.forEach(k=>{if(!M.list.tools.includes(k))M.list.tools.push(k);});}
  {const oldItem=M.item;M.item=(id,...a)=>IT5[id]?rest(IT5[id](...a)):oldItem(id,...a);Object.keys(IT5).forEach(k=>{if(!M.list.items.includes(k))M.list.items.push(k);});}
  {const oldPiece=M.piece;M.piece=(id,...a)=>P5[id]?P5[id](...a):oldPiece(id,...a);Object.keys(P5).forEach(k=>{if(!M.list.pieces.includes(k))M.list.pieces.push(k);});
    if(M.meta.flame&&!M.meta.flame.includes('smelterBig'))M.meta.flame.push('smelterBig','item:crucible(molten)');}
  ['oreRock:copper:1','oreRock:copper:2','oreRock:tin:1','oreRock:tin:2'].forEach(k=>{if(M.list.resources&&!M.list.resources.includes(k))M.list.resources.push(k);});
  M.list.tools5=TOOL5.slice();M.list.items5=Object.keys(IT5);M.list.pieces5=Object.keys(P5);M.list.boats=['raft','canoe'];M.list.villagerRoles=ROLES.slice();M.list.npcProps=Object.keys(PROPS);
  M.meta.extra5={bow:{len:48,stringSide:'-Z',stringZ:-4.9,inHandScale:0.6},arrow:{len:16,tip:'+Z',origin:'middle'},
    boats:{raft:{len:60,width:36,seatY:3.9,origin:'waterline'},canoe:{len:90,width:17.2,seatY:2,rimY:6.8,origin:'waterline'}},
    bronzeDrum:{h:24,r:15},smelterBig:{footprint:[2,1],furnace:[6,0,-4],top:31.2},anvilStone:{top:11.4},oreRock:{size:[30,20],sink:2},
    npcProps:{headdress:'rig.head',necklace:'rig.torso',basketBack:'rig.back',quiverBack:'rig.back',bracelet:'rig.foreL|foreR'},childScale:0.65};}
