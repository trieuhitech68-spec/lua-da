/* ===================== SB MODELS 4b — replanting, far-LOD trees, old giants, treehouse kit, husbandry, cave decor =====================
   Needs models.js (window.SBM). Call SBmodels4bInit() after SBmodelsInit() (and after SBmodels2Init()/SBmodels3Init() if used — it re-uses
   M.mat3 materials when present, otherwise it makes equivalent untextured ones). Adds to window.SBM:
     M.sapling(kind, stage, seed)  kind ∈ pine oak birch bamboo banana palm savannaTree berry herb flower; stage 0 = just planted (6–10 du, dirt mound),
                                   stage 1 = young (22–45 du). ≤200 ▲. 'flower' colour = seed%4 → red, yellow, white, purple.
     M.uprooted(kind)              ITEM-scale (~13–17 du long) dug-up seedling lying along X on y=0, root ball wrapped in a leaf + fibre tie (palm = sprouting coconut).
                                   M.item('sapling'[, kind]) → M.uprooted(kind||'oak').   ('egg' already exists in models.js.)
     M.treeLo(kind, seed, stage)   far impostor (≤60 ▲, one or two meshes, vertex colours) for pine oak birch dead savannaTree bamboo palm banana.
                                   Same origin/scale as the full model it replaces: pine/oak/birch/dead ↔ M.tree(kind,2,seed) (stage 3 ↔ the giant, stage 1 ↔ young,
                                   uniformly scaled); savannaTree ↔ M.savannaTree(seed); bamboo ↔ M.bamboo(seed); palm ↔ M.palm(seed); banana ↔ M.banana(seed).
                                   The seeded kinds replay the full builders' RNG, so trunk lean / branch / leaf directions match the same seed.
     M.tree(kind, 3, seed)         OLD GIANT for pine (h≈330) / oak (h≈270, trunk r≈9.7 at y 60) / birch (h≈290): ≤450 ▲, same K3 materials as M.tree. Other kinds → stage 2.
     M.piece(id) gains (ids also pushed to M.list.pieces):
       treePlatform  2×2-cell deck (x,z∈[-40,40]) centred on a tree trunk at the origin; deck top y=60 (= stilt). Square trunk hole at the centre:
                     clear opening x∈[-13.1,13.1], z∈[-13.7,13.7] → trunks up to r=12 at y 48–60. Under it: 4 beams along X (z=±15.5, ±35.5, y 53–57.4)
                     on 2 bearers along Z (x=±35, y 48.5–53), 6 knee braces from a lashed log collar round the trunk (ring r≈13, y≈30) up to the bearers.
                     No ground colliders (the tree carries it); userData.deckTop=60, userData.hole=[13.1,13.7], userData.collar=[13,30].
       ropeLadder    the models3 `ladder` frame: placed like a wall on a cell edge (along X, centred on the edge), y 0 → 60; the top loops over the deck edge
                     (z −5…0, y 60–61.5, tied to two pegs at z≈−5); hangs on the +Z side (z 1.2 at the top → ≈4.5 at the foot) with a slight sway in X.
                     Rungs x∈[-8.3,8.3] every 6.5 du from y=4.5. Climb from +Z.
       treeRail      wall frame (x∈[-20,20], z≈0, base y=0 → put it on the deck at y=60), 21 high: crooked branch posts at x=±19.6, branch top rail, rope lacing.
       hammock       obj: woven võng between two anchor points 36 apart (x=±18, y=30.5) on two forked stakes; lying surface y≈18 at the middle.
                     userData.anchors=[[-18,30.5,0],[18,30.5,0]], userData.seatY=18.
       coop          chuồng gà, 1 cell: hen house on legs (floor top y=10.9), body x∈[-14,14] z∈[-9.5,9.5], thatch gable (ridge along X, y≈36),
                     two open nest boxes (front-left) with eggs, door front-right with a cleated ramp down to (17.5,0,18.8).
       penFence      chuồng heo fence: edge-style like `fence` (along X, posts at x=±20), 3 stacked logs, 26 high (logs to 22).
       penGate       same frame, pole gate (rope hinges on the −X post).
       trough        máng: hollowed log along X, 34 long, top rim y≈7.8, feed surface y=6.0, on wedges.
       nest          ổ rơm: straw nest Ø≈15 with 3 eggs (top ≈ y 4.5).
       hayPile       đống rơm: straw heap ≈38×32, 18 high.
       caveBed       ổ lá/da: leaf bed with a hide on top, fur pillow at −Z, rolled hide at +Z; ≈30×46, top ≈ y 6. footprint 1×2 (like bed).
       stoneHearth   vòng đá bếp: ring of stones (r≈12), ash, charred logs and a 'flame' child group (userData.dyn=1, as campfire). stoneHearthOff: unlit.
       hideCurtain   rèm da: edge-style frame 40 wide × 48 high (x∈[-20,20], z≈0, base y=0): two poles + cross bar, two hides; right one tied back.
   Units / conventions as models.js (du, 1 m ≈ 20 du, human 36 du, cell 40, NEW Group per call, origin ground centre, bottom y=0, front +Z,
   deterministic: no Math.random). Vertex-coloured geometry on ≤4 shared materials per model (M.mat4b: sb3Flat/sb3DS/sb3Wood/sb3Bamboo/sb3Thatch/sb3Rock
   when models3 is loaded, else sb4* look-alikes). Giant trees use the K3 materials of models.js (sbPine, sbOak, sbBirch …).
*/
function SBmodels4bInit(){const M=window.SBM;if(!M||M.v4b)return;M.v4b=1;
  const K=(typeof K3!=='undefined')?K3:window.K3,T=K.T,PI=Math.PI,TAU=PI*2;
  /* ---------------- maths / colour helpers ---------------- */
  const RNG=s=>{let a=(((Math.abs(+s||0)*1000)|0)+1)*2654435761>>>0;return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};};
  const hsh=(a,b,c,d)=>{let h=(Math.imul(a|0,0x27d4eb2d)^Math.imul(b|0,0x165667b1)^Math.imul(c|0,0x5bd1e995)^Math.imul((d|0)+7,0x85ebca77))>>>0;h=Math.imul(h^(h>>>15),0x2c1b3c6d);h=Math.imul(h^(h>>>12),0x297a2d39);return ((h^(h>>>15))>>>0)/4294967296;};
  const sm=t=>t*t*(3-2*t),cl=t=>t<0?0:t>1?1:t,ss=(a,b,x)=>sm(cl((x-a)/(b-a)));
  const vn3=(x,y,z,s)=>{const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),fx=sm(x-xi),fy=sm(y-yi),fz=sm(z-zi);let r=0;
    for(let k=0;k<8;k++){const dx=k&1,dy=(k>>1)&1,dz=(k>>2)&1;r+=hsh(xi+dx,yi+dy,zi+dz,s)*(dx?fx:1-fx)*(dy?fy:1-fy)*(dz?fz:1-fz);}return r;};
  const CCH={},C=h=>{if(CCH[h])return CCH[h];const c=new T.Color(h);return CCH[h]=[c.r,c.g,c.b];};
  const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],mul=(a,f)=>[a[0]*f,a[1]*f,a[2]*f];
  const add3=(a,b,k)=>{k=k===undefined?1:k;return [a[0]+b[0]*k,a[1]+b[1]*k,a[2]+b[2]*k];},sub3=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
  const len3=a=>Math.hypot(a[0],a[1],a[2]),nrm3=a=>{const l=len3(a)||1;return [a[0]/l,a[1]/l,a[2]/l];},crs=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const lerp3=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
  const fnorm=(a,b,c)=>nrm3(crs(sub3(b,a),sub3(c,a)));
  const g=(...c)=>K.group(...c),V=(x,y,z)=>new T.Vector3(x,y,z),UP=V(0,1,0);
  const solid=c=>()=>c;
  /* ---------------- materials (shared with models3 when present) ---------------- */
  const vmat=(name,o)=>{const p={vertexColors:true,roughness:o.r,metalness:0,flatShading:true};if(o.ds)p.side=T.DoubleSide;const m=new T.MeshStandardMaterial(p);m.name=name;m.userData.key=name;return m;};
  const M3=M.mat3||{};
  const MT={sb4Flat:M3.sb3Flat||vmat('sb4Flat',{r:.92}),sb4DS:M3.sb3DS||vmat('sb4DS',{r:.85,ds:1}),sb4Wood:M3.sb3Wood||vmat('sb4Wood',{r:.9}),
    sb4Bamboo:M3.sb3Bamboo||vmat('sb4Bamboo',{r:.62}),sb4Thatch:M3.sb3Thatch||vmat('sb4Thatch',{r:1}),sb4Rock:M3.sb3Rock||vmat('sb4Rock',{r:.94})};
  M.mat4b=MT;
  /* ---------------- vertex-coloured triangle soup ---------------- */
  function VB(cf){this.p=[];this.c=[];this.cf=cf||(()=>[1,1,1]);this.face=false;}
  VB.prototype.t=function(a,b,c){const n=fnorm(a,b,c);this.p.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);
    if(this.face){const k=this.cf([(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3],n);for(let i=0;i<3;i++)this.c.push(k[0],k[1],k[2]);}
    else for(const v of [a,b,c]){const k=this.cf(v,n);this.c.push(k[0],k[1],k[2]);}return this;};
  VB.prototype.o=function(a,b,c,r,inw){const n=crs(sub3(b,a),sub3(c,a)),m=[(a[0]+b[0]+c[0])/3-r[0],(a[1]+b[1]+c[1])/3-r[1],(a[2]+b[2]+c[2])/3-r[2]];
    return ((dot(n,m)>=0)!==!!inw)?this.t(a,b,c):this.t(a,c,b);};
  VB.prototype.q=function(a,b,c,d,r,inw){this.o(a,b,c,r,inw);return this.o(a,c,d,r,inw);};
  VB.prototype.n=function(){return this.p.length/9;};
  const projUV=(pos,S)=>{const uv=new Float32Array(pos.length/3*2);for(let i=0;i<pos.length/9;i++){const o=i*9,a=[pos[o],pos[o+1],pos[o+2]],b=[pos[o+3],pos[o+4],pos[o+5]],c=[pos[o+6],pos[o+7],pos[o+8]],n=crs(sub3(c,b),sub3(a,b)),ax=Math.abs(n[0]),ay=Math.abs(n[1]),az=Math.abs(n[2]);
      for(let k=0;k<3;k++){const x=pos[o+k*3],y=pos[o+k*3+1],z=pos[o+k*3+2];let u,v;if(ay>=ax&&ay>=az){u=x;v=z;}else if(ax>=az){u=z;v=y;}else{u=x;v=y;}uv[i*6+k*2]=u/S;uv[i*6+k*2+1]=v/S;}}return uv;};
  VB.prototype.mesh=function(m,o){o=o||{};const ge=new T.BufferGeometry();ge.setAttribute('position',new T.Float32BufferAttribute(this.p,3));ge.setAttribute('color',new T.Float32BufferAttribute(this.c,3));
    const mat=MT[m]||m;if(mat.map)ge.setAttribute('uv',new T.BufferAttribute(projUV(this.p,o.uv||24),2));ge.computeVertexNormals();
    const ms=new T.Mesh(ge,mat);ms.name=typeof m==='string'?m:'';ms.castShadow=!o.noShadow;ms.receiveShadow=true;return ms;};
  // add the soups that hold triangles: addM(G,[B,'sb4Flat',opts],...)
  const addM=(G,...L)=>{L.forEach(([B,m,o])=>{if(B&&B.n()>0)G.add(B.mesh(m,o));});return G;};
  /* ---------------- shape builders ---------------- */
  // loft along polyline P; r[i] = number | [w,h]; n sides; o:{cap0,cap1 (true|point), side, rot, jit, seed}
  function loft(B,P,r,n,o){o=o||{};const L=P.length,rings=[];let sd0=null;
    for(let i=0;i<L;i++){const p=P[i],d=nrm3(sub3(P[Math.min(L-1,i+1)],P[Math.max(0,i-1)]));let sd=o.side?o.side.slice():crs([0,1,0],d);if(len3(sd)<0.2)sd=sd0||[1,0,0];sd=nrm3(sd);if(sd0&&dot(sd,sd0)<0)sd=mul(sd,-1);
      const up=nrm3(crs(d,sd));sd=crs(up,d);sd0=sd;const ri=r[i],w=Array.isArray(ri)?ri[0]:ri,h=Array.isArray(ri)?ri[1]:ri,ring=[];
      for(let j=0;j<n;j++){const t=j/n*TAU+(o.rot===undefined?PI/2:o.rot),f=o.jit?1+(hsh(i,j,o.seed||1,11)-.5)*o.jit:1;ring.push(add3(add3(p,sd,Math.cos(t)*w*f),up,Math.sin(t)*h*f));}
      rings.push(ring);}
    for(let i=0;i<L-1;i++){const A=rings[i],Bq=rings[i+1],ref=lerp3(P[i],P[i+1],0.5);for(let j=0;j<n;j++){const j1=(j+1)%n;B.q(A[j],A[j1],Bq[j1],Bq[j],ref);}}
    if(o.cap1){const tp=Array.isArray(o.cap1)?o.cap1:P[L-1],A=rings[L-1],ref=lerp3(P[L-1],P[L-2],0.6);for(let j=0;j<n;j++)B.o(A[j],A[(j+1)%n],tp,ref);}
    if(o.cap0){const tp=Array.isArray(o.cap0)?o.cap0:P[0],A=rings[0],ref=lerp3(P[0],P[1],0.6);for(let j=0;j<n;j++)B.o(A[j],A[(j+1)%n],tp,ref);}
    return rings;}
  // straight pole a→b (1 segment) with optional end caps
  const pole=(B,a,b,r0,r1,n,caps,o)=>loft(B,[a,b],[r0,r1],n||6,Object.assign({cap0:!!caps,cap1:!!caps},o||{}));
  // jittered icosahedron blob centred at c, scale s=[sx,sy,sz]
  function blob(B,c,r,s,seed,amt,det){let ge=new T.IcosahedronGeometry(r,det||0);ge=ge.index?ge.toNonIndexed():ge;const p=ge.attributes.position,R=RNG(seed),mp={};
    const key=i=>Math.round(p.getX(i)*100)+'_'+Math.round(p.getY(i)*100)+'_'+Math.round(p.getZ(i)*100);
    for(let i=0;i<p.count;i++){const k=key(i);if(!mp[k])mp[k]=1+(R()-.5)*(amt===undefined?0.3:amt);}
    const pt=i=>{const f=mp[key(i)];return [c[0]+p.getX(i)*f*s[0],c[1]+p.getY(i)*f*s[1],c[2]+p.getZ(i)*f*s[2]];};
    for(let i=0;i<p.count;i+=3)B.t(pt(i),pt(i+1),pt(i+2));ge.dispose();return B;}
  // jittered octahedron (8 ▲), yaw a
  function octb(B,c,r,s,seed,amt,a){const R=RNG(seed),ca=Math.cos(a||0),sa=Math.sin(a||0),P=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].map(v=>{const f=1+(R()-.5)*(amt||0),x=v[0]*ca+v[2]*sa,z=-v[0]*sa+v[2]*ca;return [c[0]+x*r*s[0]*f,c[1]+v[1]*r*s[1]*f,c[2]+z*r*s[2]*f];});
    for(const x of [0,1])for(const y of [2,3])for(const z of [4,5])B.o(P[x],P[y],P[z],c);return B;}
  // cone from base centre b (radius r) to apex a; n sides; cap: base closed (fan, n-2 ▲)
  function spike(B,b,a,r,n,cap,rot,jit,seed){const d=nrm3(sub3(a,b));let u=nrm3(crs(Math.abs(d[1])<0.9?[0,1,0]:[1,0,0],d));const v=crs(d,u),rim=[];
    for(let j=0;j<n;j++){const t=j/n*TAU+(rot||0),f=jit?1+(hsh(j,seed||1,3,7)-.5)*jit:1;rim.push(add3(add3(b,u,Math.cos(t)*r*f),v,Math.sin(t)*r*f));}
    for(let j=0;j<n;j++)B.o(rim[j],rim[(j+1)%n],a,b);if(cap){const ref=lerp3(b,a,0.3);for(let j=1;j<n-1;j++)B.o(rim[0],rim[j],rim[j+1],ref);}return rim;}
  // oriented box: centre c, half-axis vectors ax, ay, az
  function obox(B,c,ax,ay,az){const P=(i,j,k)=>add3(add3(add3(c,ax,i),ay,j),az,k),v=[P(-1,-1,-1),P(1,-1,-1),P(1,1,-1),P(-1,1,-1),P(-1,-1,1),P(1,-1,1),P(1,1,1),P(-1,1,1)];
    [[0,1,2,3],[5,4,7,6],[4,0,3,7],[1,5,6,2],[3,2,6,7],[4,5,1,0]].forEach(f=>B.q(v[f[0]],v[f[1]],v[f[2]],v[f[3]],c));return B;}
  const box=(B,c,hx,hy,hz,ry)=>{const cs=Math.cos(ry||0),sn=Math.sin(ry||0);return obox(B,c,[hx*cs,0,-hx*sn],[0,hy,0],[hz*sn,0,hz*cs]);};
  // lathe (profile [[r,y],...]) around Y at centre c, n sides; o:{cap0,cap1,rot}
  function lathe(B,c,prof,n,o){o=o||{};const R=prof.map(([r,y])=>{const ring=[];for(let j=0;j<n;j++){const t=j/n*TAU+(o.rot||0);ring.push([c[0]+Math.cos(t)*r,c[1]+y,c[2]-Math.sin(t)*r]);}return ring;});
    for(let i=0;i<prof.length-1;i++){const ref=[c[0],c[1]+(prof[i][1]+prof[i+1][1])/2,c[2]],inw=o.inner!==undefined&&i>=o.inner;for(let j=0;j<n;j++){const j1=(j+1)%n;
        if(prof[i][0]<1e-4)B.o(R[i][j],R[i+1][j1],R[i+1][j],ref,inw);else if(prof[i+1][0]<1e-4)B.o(R[i][j],R[i][j1],R[i+1][j],ref,inw);else B.q(R[i][j],R[i][j1],R[i+1][j1],R[i+1][j],ref,inw);}}
    return R;}
  // thin cord (two crossed ribbons, double-sided material) along polyline
  function cord(B,P,w){for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],d=nrm3(sub3(b,a));let s1=nrm3(crs(d,Math.abs(d[1])<0.9?[0,1,0]:[1,0,0]));const s2=nrm3(crs(d,s1));
      for(const s of [s1,s2])B.t(add3(a,s,-w),add3(a,s,w),add3(b,s,w)).t(add3(a,s,-w),add3(b,s,w),add3(b,s,-w));}return B;}
  // rope band (lashing) around a member: centre c, member direction dir, radius r ([w,h] allowed), width w
  const lash=(B,c,dir,r,w,n)=>{const d=nrm3(dir);loft(B,[add3(c,d,-w/2),add3(c,d,w/2)],[r,r],n||6,{rot:0.3});};
  // leaf blade (3 ▲): base b, tip t, half-width w, bend direction side vector sd
  const leaf=(B,b,t,w,sd,fold)=>{const m=lerp3(b,t,0.45),l=add3(m,sd,w),r=add3(m,sd,-w),f=fold?[0,fold,0]:[0,0,0];const mm=add3(m,f);B.t(b,l,mm).t(b,mm,r);B.t(l,t,mm);B.t(mm,t,r);return B;};
  const trisOf=o=>{let n=0;o.traverse(m=>{if(m.isMesh){const ge=m.geometry;n+=(ge.index?ge.index.count:ge.attributes.position.count)/3;}});return Math.round(n);};
  M.tris4b=trisOf;
  const bbox=(G)=>{G.updateMatrixWorld(true);const b=new T.Box3(),v=V(0,0,0);G.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)b.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});return b;};
  const rest=(G)=>{const b=bbox(G),c=b.getCenter(V(0,0,0));G.position.x-=c.x;G.position.z-=c.z;G.position.y-=b.min.y;return g(G);};
  /* ---------------- K3-material helpers (same look as models.js trees) ---------------- */
  function Soup(){this.p=[];}
  Soup.prototype.t=function(a,b,c){this.p.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);return this;};
  Soup.prototype.o=function(a,b,c,ct){const n=crs(sub3(b,a),sub3(c,a)),m=[(a[0]+b[0]+c[0])/3-ct[0],(a[1]+b[1]+c[1])/3-ct[1],(a[2]+b[2]+c[2])/3-ct[2]];return dot(n,m)>=0?this.t(a,b,c):this.t(a,c,b);};
  Soup.prototype.mesh=function(m,o){const ge=new T.BufferGeometry();ge.setAttribute('position',new T.Float32BufferAttribute(this.p,3));return K.mesh(ge,m,o);};
  const jitR=(ge,amt,seed,ya)=>{const R=RNG(seed),p=ge.attributes.position,mp={};for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=Math.round(x*100)+'_'+Math.round(y*100)+'_'+Math.round(z*100);
      if(!mp[k])mp[k]=1+(R()-.5)*amt;const f=mp[k];p.setXYZ(i,x*f,y*(ya===undefined?f:1+(f-1)*ya),z*f);}p.needsUpdate=true;return ge;};
  const kblob=(r,m,o,seed,amt)=>K.mesh(jitR(new T.DodecahedronGeometry(r,0),amt===undefined?0.26:amt,seed||1),m,o);
  const ktube=(rt,rb,h,m,o,seg)=>{const ge=new T.CylinderGeometry(rt,rb,h,seg||6,1,true);ge.translate(0,h/2,0);return K.mesh(ge,m,o);};
  const limb=(a,b,r0,r1,m,seg)=>{const A=V(a[0],a[1],a[2]),D=V(b[0]-a[0],b[1]-a[1],b[2]-a[2]),L=D.length()||0.001;const ms=K.cyl(r1,r0,L,m,{},seg||5);ms.position.copy(A);ms.quaternion.setFromUnitVectors(UP,D.normalize());return ms;};
  const coneM=(r,h,m,o,n,R,jr,jy,lean)=>{n=n||7;const S=new Soup(),rim=[];let cy=0;
    for(let i=0;i<n;i++){const a=(i+(R?(R()-.5)*0.35:0))/n*TAU,f=1+(R?(R()-.5)*(jr||0):0),y=R?(R()-.5)*(jy||0):0;rim.push([Math.cos(a)*r*f,y,-Math.sin(a)*r*f]);cy+=y/n;}
    const ap=[lean?lean[0]:0,h,lean?lean[1]:0],c=[0,cy,0];for(let i=0;i<n;i++){const A=rim[i],Bv=rim[(i+1)%n];S.t(ap,A,Bv);S.t(c,Bv,A);}return S.mesh(m,o);};
  const barkMarks=(S,R,nseg,cnt,r0,r1,h,ya,yb,big)=>{const ca=Math.cos(PI/nseg),sa=Math.sin(PI/nseg);for(let i=0;i<cnt;i++){const y=ya+(yb-ya)*R(),k=Math.floor(R()*nseg),th=(2*k+1)*PI/nseg,nx=Math.sin(th),nz=Math.cos(th),rr=r0+(r1-r0)*y/h,d=rr*ca+0.07,fw=2*rr*sa;
      const w=fw*(big?0.5+R()*0.35:0.3+R()*0.45),hh=big?1.1+R()*1.5:0.4+R()*0.55,off=(R()-.5)*(fw-w)*0.8,tx=nz,tz=-nx,px=nx*d+tx*off,pz=nz*d+tz*off,ct=[0,y,0];
      const A=[px-tx*w/2,y-hh/2,pz-tz*w/2],Bq=[px+tx*w/2,y-hh/2,pz+tz*w/2],Cq=[px+tx*w/2,y+hh/2,pz+tz*w/2],D=[px-tx*w/2,y+hh/2,pz-tz*w/2];S.o(A,Bq,Cq,ct);S.o(A,Cq,D,ct);}return S;};
  /* ---------------- palettes ---------------- */
  const PAL={pine:[C('#285531'),C('#2f6337'),C('#3a7340')],pineBark:C('#5c4330'),oak:[C('#437a36'),C('#4f8b3e'),C('#62a04a')],oakBark:C('#6b4d35'),
    birch:C('#ebe6da'),birchMk:C('#2f2a27'),birchLf:[C('#8ab54e'),C('#76a344')],dead:C('#857565'),
    savWood:[C('#5e5244'),C('#7a6a58')],savLf:[C('#5f7a30'),C('#7a8c3c')],
    culm:[C('#6c9a3c'),C('#587f32'),C('#8f9a48'),C('#7aa046')],bLeaf:[C('#5a8c34'),C('#6e9e3e'),C('#4c7a2e')],
    soil:[C('#6a4a2e'),C('#7a5634'),C('#58402a')],berryLf:[C('#3f7d3c'),C('#4a8c44')],berry:C('#d42b3c'),herb:[C('#5f8a3c'),C('#7aa048'),C('#4e7a30')],
    straw:[C('#dcc06c'),C('#c8a85a'),C('#b08e48')],egg:[C('#efe4cf'),C('#e2cba8')],rope:C('#c4a46a'),ropeD:C('#9a7a48'),
    wd:{a:C('#8a6a48'),b:C('#6e543a'),c:C('#a07c56'),dk:C('#4a3828'),cut:C('#c9a678')},bm:{a:C('#b9a060'),b:C('#a68c50'),g:C('#97a04f'),d:C('#8a7444')},
    hide:[C('#8e5a30'),C('#a8723f'),C('#6e4424')],fur:[C('#7c5839'),C('#a47e55'),C('#5a3f28')],ash:C('#5e5853'),char:C('#2b2420'),scorch:C('#4a2e20')};

  /* ======================================== 1. SAPLINGS ======================================== */
  // low dirt mound (21 ▲): radius r, height h
  function mound(B,r,h,seed){const n=7,R=RNG(seed*3+1),o=[],m=[],top=[0,h,0];for(let j=0;j<n;j++){const a=j/n*TAU+R()*0.4,f=0.85+R()*0.3;o.push([Math.cos(a)*r*f,-0.3,-Math.sin(a)*r*f]);m.push([Math.cos(a+0.3)*r*0.55*f,h*0.72,-Math.sin(a+0.3)*r*0.55*f]);}
    const cf=B.cf,fc=B.face;B.face=true;B.cf=(p,nn)=>mul(mix(PAL.soil[0],PAL.soil[1],hsh(Math.round(p[0]*3),Math.round(p[2]*3),seed,5)),0.85+0.2*nn[1]);
    for(let j=0;j<n;j++){const j1=(j+1)%n;B.q(o[j],o[j1],m[j1],m[j],[0,-3,0]);B.o(m[j],m[j1],top,[0,-3,0]);}B.cf=cf;B.face=fc;return B;}
  const grad=(a,b,y0,y1)=>(p)=>mix(a,b,cl((p[1]-y0)/(y1-y0)));
  const SAP={
    pine:(F,D,s,R)=>{if(s===0){F.cf=grad(PAL.pineBark,mul(PAL.pineBark,1.3),0,8);loft(F,[[0,1,0],[0.15,8.6,0.1]],[0.35,0.18],3);
        [[2.6,3.2,3.4],[2.0,5.3,2.9],[1.25,7.1,2.6]].forEach(([r,y,h],i)=>{F.cf=solid(mix(PAL.pine[2],C('#5a9a4c'),0.35+i*0.15));spike(F,[0,y,0],[0.1,y+h,0.05],r,6,false,R()*TAU,0.3,i+3);});return 9.7;}
      F.cf=grad(PAL.pineBark,mul(PAL.pineBark,1.2),0,34);loft(F,[[0,0,0],[0.3,36,0.2]],[1.3,0.3],5);
      for(let i=0;i<4;i++){const t=i/3,y=40*(0.14+0.6*t),r=40*(0.23-0.15*t)*(0.92+R()*0.16),h=i===3?40-y:40*(0.3-0.05*t);F.cf=solid(mix(PAL.pine[i%3],C('#4a8a44'),0.25));
        spike(F,[(R()-.5)*0.6,y,(R()-.5)*0.6],[(R()-.5)*1.2,y+h,(R()-.5)*1.2],r,7,true,R()*TAU,0.25,i+11);}return 40;},
    oak:(F,D,s,R)=>{if(s===0){F.cf=solid(mix(PAL.oakBark,C('#8a6a48'),0.4));loft(F,[[0,1,0],[0.4,4.6,0.2],[0,7.6,-0.1]],[0.38,0.3,0.2],3);
        [[0,7.4,0,0.2],[1.9,1.0],[3.9,2.2],[2.8,3.4]].forEach((q,i)=>{const a=i===0?R()*TAU:q[0],y=i===0?7.4:4+q[1]*1.0,len=i===0?4.4:3.9,up=i===0?0.9:0.35,bp=i===0?[0,7.4,-0.1]:[0.25,y,0.1],d=nrm3([Math.cos(a),up,-Math.sin(a)]),tp=add3(bp,d,len),sd=nrm3(crs(d,[0,1,0]));
          D.cf=(p)=>mix(PAL.oak[1],PAL.oak[2],cl(len3(sub3(p,bp))/len));oakLeaf(D,bp,tp,sd,1.6);});return 9;}
      F.cf=grad(PAL.oakBark,mul(PAL.oakBark,1.15),0,30);loft(F,[[0,0,0],[0.6,16,0.3],[0,27,0]],[1.15,0.75,0.45],4);
      F.cf=solid(PAL.oakBark);spike(F,[0.4,15,0.2],[-5,24,1.5],0.4,3);spike(F,[0.3,19,0],[5.5,26,-1],0.35,3);
      [[0,32,0,8.6,1],[-6,26.5,1.6,6.2,0],[6.2,27.5,-1.4,6.4,0],[1,25.5,5.4,5.2,2]].forEach(([x,y,z,r,c],i)=>{F.cf=(p,n)=>mul(mix(PAL.oak[c],PAL.oak[2],cl(n[1]*0.4)),n[1]<-0.3?0.8:1);blob(F,[x,y,z],r,[1.1,0.86,1.1],R()*1000|0,0.28);});return 40;},
    birch:(F,D,s,R)=>{if(s===0){F.cf=grad(mix(PAL.birch,PAL.birchMk,0.5),PAL.birch,0,4);loft(F,[[0,1,0],[0.2,8.4,0]],[0.33,0.18],3);
        [[1.2,5.2],[3.6,6.4],[5.3,7.6],[0.3,8.4]].forEach(([a,y],i)=>{const bp=[0.1,y,0],d=nrm3([Math.cos(a),0.6+i*0.15,-Math.sin(a)]),tp=add3(bp,d,3.3),sd=nrm3(crs(d,[0,1,0]));D.cf=solid(PAL.birchLf[i%2]);leaf(D,bp,tp,1.25,sd,0.3);});return 9.5;}
      F.cf=(p)=>{const k=hsh(Math.round(p[1]*0.6),3,5,1);return k<0.2?mix(PAL.birch,PAL.birchMk,0.75):PAL.birch;};F.face=true;loft(F,[[0,0,0],[0.5,14,0],[0,28,0.4],[0.3,40,0]],[0.95,0.7,0.48,0.25],4);F.face=false;
      F.cf=solid(PAL.birchMk);spike(F,[0.3,20,0.2],[-4,27,1],0.3,3);
      [[0.6,24.5,0.4,6.4,1.3,0],[-0.6,32,-0.4,6.0,1.35,1],[1.2,38.6,0.6,4.6,1.3,0],[-3.8,27,1.8,4.4,1.2,1]].forEach(([x,y,z,r,sy,c])=>{F.cf=(p,n)=>mul(PAL.birchLf[c],n[1]<-0.3?0.8:1);blob(F,[x,y,z],r,[1,sy,1],R()*1000|0,0.3);});return 44;},
    bamboo:(F,D,s,R)=>{if(s===0){const ys=[0.4,2.8,5.0,7.0],rs=[1.9,1.5,1.05,0.55];F.face=true;
        for(let k=0;k<3;k++){F.cf=(p,n)=>mix(k%2?C('#7a5a32'):C('#8f8448'),C('#4a3a24'),cl(n[1]*0.6));loft(F,[[0,ys[k],0],[0.1*k,ys[k+1],0.05*k]],[rs[k],rs[k+1]],6);}
        F.cf=solid(C('#6a5030'));spike(F,[0.3,ys[3],0.15],[0.6,9.6,0.2],rs[3],6);F.face=false;
        D.cf=solid(PAL.bLeaf[1]);D.t([0.6,8.8,0.2],[0.9,9.2,0.4],[2.6,10,1.2]);D.t([0.4,8.6,0.1],[0.2,9.1,-0.2],[-1.6,9.9,-0.9]);return 10;}
      const cu=[[0,0,0,44,1.15],[2.2,1,0.9,38,1.0],[-1.6,-1.2,-1.1,32,0.85],[1,-2,-2.3,24,0.75]];
      cu.forEach(([x,z,a,h,r],i)=>{const ca=Math.cos(a),sa=Math.sin(a),tip=[x+ca*h*0.12,h,z+sa*h*0.12];F.cf=grad(PAL.culm[i%4],mix(PAL.culm[i%4],C('#9aab52'),0.4),0,h);
        loft(F,[[x,-0.5,z],[x+ca*h*0.03,h*0.55,z+sa*h*0.03],tip],[r,r*0.85,r*0.45],3);
        for(let k=0;k<2;k++){const P0=lerp3([x,h*0.55,z],tip,0.35+k*0.45);for(let l=0;l<3;l++){const fa=a+(k?1:-1)*0.8+(l-1)*0.7+(R()-.5)*0.3,L=8.5+R()*3,d=nrm3([Math.cos(fa),-0.3-R()*0.45,Math.sin(fa)]),sd=nrm3(crs(d,[0,1,0])),w=1.3;
            D.cf=(p)=>mix(mul(PAL.bLeaf[(l+k)%3],0.85),mix(PAL.bLeaf[(l+k)%3],C('#b3c45c'),0.3),cl(len3(sub3(p,P0))/L));D.t(P0,add3(add3(P0,d,L*0.4),sd,w),add3(P0,d,L));}}});return 44;},
    banana:(F,D,s,R)=>{const sh=(s===0?5.5:19),sr=(s===0?1.1:2.2);
      F.cf=(p)=>mix(C('#5d6a34'),C('#7c8a44'),cl(p[1]/sh));loft(F,[[0,-0.5,0],[0.2,sh*0.5,0.1],[0.1,sh,0]],[sr,sr*0.85,sr*0.62],s===0?5:6);
      F.cf=solid(C('#7a9a40'));spike(F,[0.1,sh-0.5,0],[0.3,sh+(s===0?4.4:12),0.2],sr*0.5,4);
      const nl=s===0?1:5,a0=R()*TAU;for(let i=0;i<nl;i++){const a=a0+i/nl*TAU+(R()-.5)*0.4,L=(s===0?6.5:21)+R()*(s===0?1:5),up=1.0+R()*0.3,dr=0.8+R()*0.25,ca=Math.cos(a),sa=-Math.sin(a),top=[0.1,sh*0.96,0];
        const pt=t=>{const hz=t*L*0.86;return [top[0]+ca*hz,top[1]+L*(up*t-dr*t*t*t),top[2]+sa*hz];},segs=s===0?2:3,rach=[];for(let k=0;k<=segs;k++)rach.push(pt(0.18+0.82*k/segs));
        const base=mix(C('#3c7428'),C('#5a9234'),R());D.cf=(p)=>mix(mul(base,0.85),mix(base,C('#9ac05a'),0.3),cl(len3(sub3(p,top))/L));
        for(let k=0;k<segs;k++){const t=(k+0.5)/segs,w=(s===0?2.4:6)*Math.pow(Math.sin(PI*Math.min(1,0.12+0.88*t)),0.55),a1=rach[k],b1=rach[k+1],d=nrm3(sub3(b1,a1)),sd=nrm3(crs(d,[0,1,0]));
          for(const sg of [-1,1]){const e0=add3(add3(a1,sd,w*sg*(k===0?0.6:1)),[0,-w*0.25,0]),e1=add3(add3(b1,sd,w*sg*(k===segs-1?0.25:1)),[0,-w*0.3,0]);D.q(a1,b1,e1,e0,add3(lerp3(a1,b1,0.5),[0,-30,0]));}}}
      return s===0?10:40;},
    palm:(F,D,s,R)=>{if(s===0){F.face=true;F.cf=(p,n)=>mul(mix(C('#8a6a3c'),C('#6e5232'),hsh(Math.round(p[0]*2),Math.round(p[1]*2),2,3)),0.8+0.25*n[1]);blob(F,[0,1.6,0],3.1,[1.3,0.92,1.05],7,0.12);F.face=false;
        F.cf=solid(C('#8a7a4a'));spike(F,[-3.4,1,0],[-6,-0.4,1.2],0.35,3);spike(F,[-3.2,0.9,0.6],[-5,-0.4,-1.6],0.3,3);
        F.cf=solid(C('#6a7a3a'));loft(F,[[2.6,3.2,0],[2.9,5,0.1]],[0.7,0.5],4);
        [[0.2,0.25,7.4],[2.4,0.4,6.4],[4.2,0.55,5.2]].forEach(([a,lean,h],i)=>{const b=[2.9,4.6,0.1],tp=add3(b,[Math.cos(a)*h*lean,h,-Math.sin(a)*h*lean]),sd=nrm3(crs(nrm3(sub3(tp,b)),[0,1,0]));D.cf=(p)=>mix(C('#4e7a2c'),C('#7a9a3e'),cl((p[1]-4)/7));leaf(D,b,tp,0.9,sd,0.45);});return 11;}
      F.face=true;F.cf=(p,n)=>mul(mix(C('#8a6a3c'),C('#6e5232'),0.4),0.8+0.25*n[1]);blob(F,[-3,1.2,1],2.8,[1.3,0.85,1.05],7,0.12);F.face=false;
      F.cf=(p)=>mix(C('#6e6a44'),C('#8a7a4a'),cl(p[1]/6));loft(F,[[0,-0.5,0],[0,3.5,0],[0.2,7,0]],[3.0,2.8,1.9],6);
      for(let i=0;i<6;i++){const a=i/6*TAU+R()*0.5,L=26+R()*10,up=1.25+R()*0.5,c0=Math.cos(a),s0=-Math.sin(a),Rp=[];for(let k=0;k<=4;k++){const t=k/4,hz=L*t*0.7,y=6.5+L*(up*t-0.95*t*t);Rp.push([c0*hz,y,s0*hz]);}
        const base=mix(C('#4e8030'),C('#6e9a3a'),R());D.cf=(p)=>mix(mul(base,0.85),mix(base,C('#b0b860'),0.3),cl(len3([p[0],p[1]-6,p[2]])/L));
        for(let k=0;k<4;k++){const a1=Rp[k],b1=Rp[k+1],d=nrm3(sub3(b1,a1)),sd=nrm3(crs(d,[0,1,0])),w=6.5*Math.sin(PI*(0.18+0.82*(k+0.5)/4)),m=lerp3(a1,b1,0.9);
          for(const sg of [-1,1])D.t(a1,b1,add3(add3(m,sd,w*sg),[0,-w*0.55,0]));}}
      F.cf=solid(C('#7a9a40'));spike(F,[0.2,6.5,0],[0.6,22,0.3],0.9,4);return 40;},
    savannaTree:(F,D,s,R)=>{if(s===0){F.cf=solid(C('#6e5e4c'));loft(F,[[0,1,0],[0.5,4,0.2],[-0.3,6.4,0],[0.2,8.4,-0.2]],[0.32,0.26,0.2,0.14],3);
        F.cf=solid(C('#8a7a62'));[[0.5,4,0.2,2.6,0.4],[-0.3,6.4,0,-2.4,0.6]].forEach(([x,y,z,dx,dy])=>spike(F,[x,y,z],[x+dx,y+dy+1.2,z+0.4],0.18,3));
        [[3.1,5.6,0.6,1.9],[-2.7,8,0.2,1.8],[0.2,8.9,-0.2,2]].forEach(([x,y,z,r],i)=>{D.cf=(p)=>mix(PAL.savLf[0],PAL.savLf[1],cl((p[1]-y+0.6)/1.2));
          const P=[];for(let k=0;k<6;k++){const a=k/6*TAU+i;P.push([x+Math.cos(a)*r*(k%2?0.7:1),y+(k%2?0.25:-0.1),z-Math.sin(a)*r*(k%2?0.7:1)]);}for(let k=0;k<6;k++)D.t([x,y+0.35,z],P[k],P[(k+1)%6]);});return 9.5;}
      F.cf=(p)=>mix(PAL.savWood[0],PAL.savWood[1],cl(p[1]/30));const fork=[0.8,15,0.4];loft(F,[[0,0,0],[0.3,8,0],fork],[1.6,1.2,1.0],4);
      const tips=[];for(let b=0;b<3;b++){const a=b/3*TAU+R()*0.6,d=7+R()*3,tp=[fork[0]+Math.cos(a)*d,25+R()*4,fork[2]-Math.sin(a)*d];spike(F,fork,tp,0.75,3);tips.push(tp);}
      tips.forEach((t,i)=>{F.cf=(p,n)=>mul(mix(PAL.savLf[0],PAL.savLf[1],hsh(i,3,1,1)),n[1]<-0.3?0.65:1);blob(F,[t[0],t[1]+1,t[2]],6.5+R()*1.5,[1.3,0.34,1.3],R()*1000|0,0.35);});
      F.cf=(p,n)=>mul(PAL.savLf[1],n[1]<-0.3?0.65:1);blob(F,[fork[0],31,fork[2]],6.5,[1.3,0.3,1.3],5,0.3);return 34;},
    berry:(F,D,s,R)=>{if(s===0){F.cf=solid(C('#6a5236'));[[0,0],[0.9,0.6]].forEach(([x,l],i)=>loft(F,[[x,1,0],[x+l,7-i*1.5,0.3]],[0.28,0.16],3));
        [[0.1,4.6,0.4],[3.3,5.6,0.5],[1.9,6.6,0.75],[5.0,4.2,0.45],[0.8,6.8,0.6],[4.2,7.1,0.5]].forEach(([a,y,up],i)=>{const bp=[i>3?1.3:0.1,y,0.1],d=nrm3([Math.cos(a),up,-Math.sin(a)]),tp=add3(bp,d,3.0),sd=nrm3(crs(d,[0,1,0]));D.cf=solid(PAL.berryLf[i%2]);leaf(D,bp,tp,1.1,sd,0.25);});return 8;}
      F.cf=solid(C('#6a5236'));[[0.4,1.2],[2.2,-1.1],[-2.4,0.4]].forEach(([dx,dz])=>loft(F,[[0,0,0],[dx*2,12,dz*2]],[0.55,0.3],3));
      [[0,15.5,0,7.2,0],[-6,11,2.4,5.6,1],[5.8,11.5,-2,5.8,1],[1.5,10.5,5.4,5,0]].forEach(([x,y,z,r,c],i)=>{F.cf=(p,n)=>mul(PAL.berryLf[c],n[1]<-0.3?0.8:1.05);blob(F,[x,y,z],r,[1,0.88,1],R()*1000|0,0.3);});
      F.cf=solid(PAL.berry);[[3.4,19,4.2],[-4.8,15,4.4],[6.6,14.2,2.6],[-1,21.4,-2.8]].forEach((p,i)=>octb(F,p,1.1,[1,1,1],i+2,0.1,i));return 24;},
    herb:(F,D,s,R)=>{const n=s===0?5:12,H=s===0?4.2:20;for(let i=0;i<n;i++){const a=i/n*TAU*(s?2.1:1)+R()*0.5,h=H*(0.6+R()*0.4)*(s?(0.7+0.3*(i%3)/2):1),lean=s===0?h*0.75:h*(0.25+R()*0.3),bp=[Math.cos(a)*0.4,s===0?1.4:0,-Math.sin(a)*0.4],
          tp=[bp[0]+Math.cos(a)*lean,bp[1]+h,bp[2]-Math.sin(a)*lean],sd=nrm3(crs(nrm3(sub3(tp,bp)),[0,1,0]));D.cf=(p)=>mix(PAL.herb[2],PAL.herb[i%2],cl((p[1]-bp[1])/h+0.2));leaf(D,bp,tp,s===0?0.9:1.6,sd,s===0?0.3:0.6);}
      if(s){[[1.5,23,0.4],[-1.2,21,-0.8]].forEach(([x,y,z],i)=>{F.cf=solid(PAL.herb[2]);loft(F,[[0,0,0],[x,y,z]],[0.3,0.2],3);F.cf=solid(C('#e8e2b8'));octb(F,[x,y+0.6,z],1.5,[1,0.6,1],i+4,0.2,i);});}return s===0?6:23;},
    flower:(F,D,s,R,seed)=>{const FC=[C('#d63a36'),C('#f2c230'),C('#f4f0e6'),C('#9a5ad0')][Math.abs(seed|0)%4],n=s===0?5:6;
      for(let i=0;i<n;i++){const a=i/n*TAU+R()*0.4,h=s===0?2.6:7+R()*3,bp=[0,s===0?1.4:0,0],tp=[Math.cos(a)*h,bp[1]+h*0.45,-Math.sin(a)*h],sd=nrm3(crs(nrm3(sub3(tp,bp)),[0,1,0]));D.cf=solid(PAL.herb[i%3]);leaf(D,bp,tp,s===0?0.8:1.5,sd,0.3);}
      const st=s===0?[[0,4.6,0]]:[[0.6,24,0.4],[-3.2,20,1.4],[2.6,17.5,-2.2]];
      st.forEach(([x,y,z],i)=>{F.cf=solid(C('#5f8a3c'));loft(F,[[0,s===0?1.4:0,0],[x,y,z]],[s?0.35:0.25,0.2],3);
        if(s===0){F.cf=solid(mix(C('#5f8a3c'),FC,0.5));octb(F,[x,y+0.6,z],0.8,[1,1.5,1],3,0.1,0);return;}
        const N=nrm3([x*0.08,1,z*0.08]);let u=nrm3(crs([0,0,1],N));const v=crs(N,u),P=[];for(let k=0;k<10;k++){const t=k/10*TAU,rr=k%2?1.1:3;P.push(add3(add3([x,y,z],u,Math.cos(t)*rr),v,Math.sin(t)*rr));}
        D.cf=solid(FC);for(let k=0;k<10;k++)D.t([x,y-0.4,z],P[k],P[(k+1)%10]);F.cf=solid(C('#e8b020'));octb(F,[x,y+0.1,z],0.8,[1,0.5,1],i,0,0);});return s===0?5.5:24;}};
  // oak leaf with lobes (7 ▲)
  function oakLeaf(B,b,t,sd,w){const d=sub3(t,b),P=[b];[[0.18,0.45],[0.32,0.25],[0.5,0.62],[0.66,0.35],[0.82,0.5]].forEach(([f,k])=>P.push(add3(add3(b,d,f),sd,w*k*1.6)));P.push(t);
    [[0.82,0.5],[0.66,0.35],[0.5,0.62],[0.32,0.25],[0.18,0.45]].forEach(([f,k])=>P.push(add3(add3(b,d,f),sd,-w*k*1.6)));const c=add3(lerp3(b,t,0.5),[0,0.15,0]);
    for(let i=0;i<P.length;i++)B.t(c,P[i],P[(i+1)%P.length]);return B;}
  const SAPK=Object.keys(SAP);
  function saplingParts(kind,stage,seed,noMound){kind=SAP[kind]?kind:'oak';stage=stage?1:0;seed=+seed||1;const R=RNG(seed*89+kind.length*7+stage),F=new VB(),D=new VB(),G=g();
    const h=SAP[kind](F,D,stage,R,seed);if(!noMound)mound(F,stage===0?4.3:6.0,stage===0?1.5:0.9,seed+stage);
    addM(G,[F,'sb4Flat'],[D,'sb4DS']);G.userData.h=h;G.userData.r=stage===0?5:Math.round(Math.max(6,h*0.3));G.userData.kind=kind;G.userData.stage=stage;return G;}
  M.sapling=(kind,stage,seed)=>saplingParts(kind,stage,seed,false);
  // dug-up seedling (inventory item): stage-0 plant lying along +X with a leaf-wrapped root ball at its base
  M.uprooted=(kind)=>{kind=SAP[kind]?kind:'oak';const P=saplingParts(kind,0,3,true),W=g(P);P.rotation.z=-PI/2;P.position.set(0.5,0,0);W.scale.setScalar(kind==='palm'?1.05:1.45);
    const G=g(W),F=new VB(),D=new VB();
    if(kind!=='palm'){F.face=true;F.cf=(p,n)=>{const k=hsh(Math.round(p[0]*1.5),Math.round(p[1]*1.5),Math.round(p[2]*1.5),9);return mul(k<0.22?PAL.soil[1]:mix(C('#5a7a30'),C('#76903e'),k),0.82+0.22*n[1]);};
      blob(F,[-1.4,0,0],2.8,[1.15,0.95,1.0],11,0.18);F.face=false;
      D.cf=(p)=>mix(C('#5a7a30'),C('#8a9a48'),cl((p[0]+5)/6));[[-1,1],[1,0.6],[0.3,-1]].forEach(([a,b],i)=>{const r=[-1.2,b*2.4,a*2.6];D.t(add3(r,[-1.4,0,0]),add3(r,[1.0,0.2*b,0.8*a]),add3(r,[2.8,1.0*b,1.6*a]));});
      D.cf=solid(C('#cfb37a'));const P2=[];for(let k=0;k<=8;k++){const a=k/8*TAU;P2.push([-0.4,Math.cos(a)*2.75,Math.sin(a)*2.85]);}cord(D,P2,0.22);
      D.cf=solid(C('#8a6a48'));[[-4.6,-1.4,1.6],[-4.8,1.2,-0.8],[-4.2,-2.2,-1.5]].forEach(q=>D.t([-3.6,q[1]*0.5,q[2]*0.5],[-3.6,q[1]*0.5+0.4,q[2]*0.5],q));}
    addM(G,[F,'sb4Flat'],[D,'sb4DS']);const out=rest(G);out.userData.kind=kind;return out;};

  /* ======================================== 2. OLD GIANT TREES (stage 3) ======================================== */
  const OAKM=['sbOak2','sbOak','sbOak3'];
  const GOAK=[[0,.8,0,.215,1],[-.27,.665,.08,.165,0],[.265,.68,-.06,.17,0],[.06,.64,.27,.155,2],[-.08,.7,-.27,.16,2],[.17,.86,.15,.135,1],[-.16,.875,-.1,.13,0]];
  const GBIR=[[-.05,.45,.03,.085,1.3],[.07,.55,-.04,.11,1.2],[-.06,.65,-.05,.115,1.25],[.05,.75,.05,.11,1.2],[-.01,.85,0,.09,1.3],[.09,.41,.06,.07,1.15],[.12,.62,.07,.085,1.2],[-.12,.53,-.07,.085,1.2]];
  const GDIM={pine:{H:330,R0:10.5},oak:{H:270,R0:12},birch:{H:290,R0:8}};
  function roots(G,R,R0,n,m,y0){for(let i=0;i<n;i++){const a=i/n*TAU+R()*0.6+0.3;G.add(limb([Math.cos(a)*R0*0.55,y0,-Math.sin(a)*R0*0.55],[Math.cos(a)*R0*2.5,-1.5,-Math.sin(a)*R0*2.5],R0*0.42,R0*0.1,m,3));}}
  function pineGiant(seed){const R=RNG(seed*37+11),G=g(),{H,R0}=GDIM.pine,cols=['sbPine3','sbPine','sbPine2'];
    G.add(ktube(R0*0.2,R0,H*0.86,'sbBark',{},8),ktube(R0*0.95,R0*1.55,H*0.035,'sbBark',{},8));roots(G,R,R0,4,'sbBark',H*0.03);
    for(let i=0;i<5;i++){const y=H*(0.12+0.045*i)+R()*8,a=i*2.3+R(),rr=R0*(1-0.8*y/(H*0.86)),L=9+R()*14,d=nrm3([Math.cos(a),0.15+R()*0.5-0.35,-Math.sin(a)]),p0=[Math.cos(a)*rr*0.5,y,-Math.sin(a)*rr*0.5];
      G.add(limb(p0,add3(p0,d,L),1.4,0.35,'sbBark',3));}
    const n=8;for(let i=0;i<n;i++){const t=i/(n-1),y=H*(0.3+0.52*t),r=H*(0.165-0.115*t)*(0.88+R()*0.24),h=i===n-1?H-y:H*(0.2-0.05*t),off=(1-t)*r*0.12,a=R()*TAU;
      G.add(K.at(coneM(r,h,cols[i%3],{},8,R,0.32,r*0.2,[(R()-.5)*r*0.15,(R()-.5)*r*0.15]),{x:Math.cos(a)*off,y,z:-Math.sin(a)*off,ry:R()*TAU}));
      if(i<n-3&&R()<0.75){const a2=R()*TAU,rr=r*0.5;G.add(K.at(coneM(rr,h*0.6,cols[(i+1)%3],{},7,R,0.3,rr*0.2),{x:Math.cos(a2)*r*0.62,y:y-h*0.05,z:-Math.sin(a2)*r*0.62,ry:R()*TAU}));}}
    G.userData.h=H;G.userData.r=Math.round(R0);G.userData.colliders=[[0,0,Math.round(R0)]];return G;}
  function oakGiant(seed){const R=RNG(seed*41+5),G=g(),{H,R0}=GDIM.oak,th=H*0.46;
    G.add(ktube(R0*0.6,R0,th,'sbOakBark',{},8),ktube(R0*0.95,R0*1.6,H*0.05,'sbOakBark',{},8));roots(G,R,R0,5,'sbOakBark',H*0.035);
    GOAK.forEach((b,i)=>{const x=b[0]*H,y=b[1]*H,z=b[2]*H,r=b[3]*H*(0.94+R()*0.12);G.add(kblob(r,OAKM[b[4]],{x,y,z,sx:1.1,sy:0.84,sz:1.1,ry:R()*TAU},seed*13+i,0.28));
      if(i>=1&&i<=4)G.add(limb([0,th*0.86,0],[x*0.72,th+(y-th)*0.62,z*0.72],R0*0.42,R0*0.2,'sbOakBark',4));});
    G.userData.h=H;G.userData.r=Math.round(R0);G.userData.trunkR60=+(R0-(R0*0.4)*60/th).toFixed(1);G.userData.colliders=[[0,0,Math.round(R0)]];return G;}
  function birchGiant(seed){const R=RNG(seed*43+7),G=g(),{H,R0}=GDIM.birch,th=H*0.89,r1=R0*0.3;
    G.add(ktube(r1,R0,th,'sbBirch',{},8),ktube(R0*0.96,R0*1.45,H*0.035,'sbBirchMk',{},8));
    const S=new Soup();barkMarks(S,R,8,16,R0,r1,th,H*0.04,th*0.8,false);barkMarks(S,R,8,8,R0,r1,th,H*0.03,th*0.22,true);G.add(S.mesh('sbBirchMk'));
    GBIR.forEach((b,i)=>{const x=b[0]*H,y=b[1]*H,z=b[2]*H,r=b[3]*H*(0.92+R()*0.16);G.add(kblob(r,i%2?'sbBirchLf2':'sbBirchLf',{x,y,z,sy:b[4]*0.85,ry:R()*TAU},seed*7+i,0.3));
      if(i<4)G.add(limb([x*0.08,y-r*0.9,z*0.08],[x*0.8,y-r*0.1,z*0.8],R0*0.2,0.3,'sbBirchMk',4));});
    G.userData.h=H;G.userData.r=Math.round(R0);G.userData.colliders=[[0,0,Math.round(R0)]];return G;}
  const GIANT={pine:pineGiant,oak:oakGiant,birch:birchGiant};
  {const oldTree=M.tree;M.tree=(kind,stage,seed)=>((stage|0)===3&&GIANT[kind])?GIANT[kind](+seed||1):oldTree(kind,stage,seed);}

  /* ======================================== 3. FAR IMPOSTORS (M.treeLo) ======================================== */
  // open tube (2n ▲)
  const trunkLo=(B,rb,rt,h,n,x1,z1)=>loft(B,[[0,-1,0],[x1||0,h,z1||0]],[rb,rt],n,{rot:0.4});
  // cone with closed base (n + n-2 ▲)
  const coneLo=(B,b,r,h,n,rot,lean)=>spike(B,b,add3(b,[lean?lean[0]:0,h,lean?lean[1]:0]),r,n,true,rot);
  const shadeY=(lo,hi,y0,y1)=>(p,n)=>mul(mix(lo,hi,cl((p[1]-y0)/(y1-y0))),n&&n[1]<-0.4?0.8:1);
  const LO={
    pine:(F,D,seed,st)=>{const gi=st===3,H=gi?GDIM.pine.H:180,R0=gi?GDIM.pine.R0:6,n=5;F.cf=solid(PAL.pineBark);trunkLo(F,R0*1.15,R0*0.35,H*0.5,4);
      for(let i=0;i<n;i++){const t=i/(n-1),y=gi?H*(0.3+0.52*t):H*(0.16+0.6*t),r=gi?H*(0.165-0.11*t):H*(0.215-0.14*t),h=i===n-1?H-y:gi?H*(0.24-0.06*t):H*(0.31-0.05*t),c=PAL.pine[i%3];
        F.cf=(p,nn)=>mul(c,nn[1]<-0.5?0.72:1);coneLo(F,[0,y,0],r,h,6,i*1.3+seed);}},
    oak:(F,D,seed,st)=>{const gi=st===3,H=gi?GDIM.oak.H:150,R0=gi?GDIM.oak.R0:7,th=H*(gi?0.46:0.5),L=gi?[[0,.8,0,.23],[-.25,.68,.15,.19],[.27,.69,-.12,.2]]:[[0,.74,0,.255],[-.19,.64,.12,.2],[.2,.645,-.1,.21]];
      F.cf=solid(PAL.oakBark);trunkLo(F,R0*1.1,R0*0.5,th*1.05,3);
      L.forEach(([x,y,z,r],i)=>{const cy=y*H;F.cf=(p,n)=>mul(mix(PAL.oak[0],PAL.oak[2],cl((p[1]-cy)/(r*H)*0.5+0.5)),n[1]<-0.5?0.8:1);
        if(i<2)blob(F,[x*H,cy,z*H],r*H,[1.08,0.86,1.08],seed*13+i,0.24);else octb(F,[x*H,cy,z*H],r*H*1.12,[1.1,0.82,1.1],seed+i,0.2,0.6);});},
    birch:(F,D,seed,st)=>{const gi=st===3,H=gi?GDIM.birch.H:160,R0=gi?GDIM.birch.R0:4.5;F.cf=(p)=>p[1]<H*0.04?mix(PAL.birch,PAL.birchMk,0.6):PAL.birch;trunkLo(F,R0*1.1,R0*0.35,H*0.9,4);
      [[0.02,.55,0,.125,1.3,0],[-0.02,.75,0.01,.11,1.32,1]].forEach(([x,y,z,r,sy,c],i)=>{F.cf=(p,n)=>mul(PAL.birchLf[c],n[1]<-0.5?0.8:1);blob(F,[x*H,y*H,z*H],r*H,[1,sy,1],seed*7+i,0.24);});
      F.cf=solid(PAL.birchLf[0]);octb(F,[0.09*H,0.41*H,0.07*H],0.07*H,[1,1.15,1],seed,0.2,0.5);},
    dead:(F,D,seed,st)=>{const H=130,R0=5.5,nb=6,R=RNG(seed*7+1),th=H*0.8;F.cf=solid(PAL.dead);trunkLo(F,R0*1.2,R0*0.3,th,5);
      for(let i=0;i<12;i++)R();// coneM tip jitter in models.js deadTree
      spike(F,[0,th-0.6,0],[R0*0.2,th+H*0.07+0.4,0],R0*0.34,4);
      for(let i=0;i<nb;i++){const f=0.36+0.5*(i/(nb-1))+(R()-.5)*0.05,y=th*f,a=i*2.4+R()*0.7,rr=R0*(1-0.74*f),len=H*(0.36-0.2*f)*(0.8+R()*0.4),up=0.45+R()*0.7,d=nrm3([Math.cos(a),up,-Math.sin(a)]);
        const p0=[Math.cos(a)*rr*0.4,y,-Math.sin(a)*rr*0.4];spike(F,p0,add3(p0,d,len),Math.max(0.9,rr*0.55*1.3),3,false,a);
        if(R()<0.8){const k=0.55+R()*0.15,q=add3(p0,d,len*k),a2=a+(R()<.5?-1:1)*(0.5+R()*0.6),d2=nrm3([Math.cos(a2),up+0.6,-Math.sin(a2)]);spike(F,q,add3(q,d2,len*0.5),Math.max(0.7,rr*0.25*1.6),3,false,a2);}}},
    savannaTree:(F,D,seed)=>{const R=RNG(seed*23+9),H=120+R()*50,fork=[(R()-.5)*8,H*0.42,(R()-.5)*8];F.cf=(p)=>mix(PAL.savWood[0],PAL.savWood[1],0.4);trunkLo(F,5.2,3.0,H*0.42,4,fork[0],fork[2]);
      const cl3=[];for(let b=0;b<3;b++){const a=b/3*TAU+R()*0.8,d=H*(0.28+R()*0.14),tp=[fork[0]+Math.cos(a)*d,H*(0.78+R()*0.1),fork[2]-Math.sin(a)*d],tw=[tp[0]+Math.cos(a+1.2)*d*0.35,tp[1]+H*0.02,tp[2]-Math.sin(a+1.2)*d*0.35];
        F.cf=solid(PAL.savWood[1]);spike(F,fork,tp,2.8,3,false,a);cl3.push({c:lerp3(tp,tw,0.5),a});}
      cl3.forEach(({c,a},i)=>{const r=H*0.3*(0.95+R()*0.1),th=H*0.055,cy=c[1]+H*0.035,n=7,rim=[];for(let k=0;k<n;k++){const t=k/n*TAU+a,f=0.82+hsh(k,i,seed,4)*0.3;rim.push([c[0]+Math.cos(t)*r*f,cy+(hsh(k,i,seed,5)-.5)*th*0.6,c[2]-Math.sin(t)*r*f]);}
        const top=[c[0],cy+th,c[2]],bot=[c[0],cy-th*0.8,c[2]];F.cf=(p)=>p[1]>cy+th*0.5?mix(PAL.savLf[0],PAL.savLf[1],0.8):p[1]<cy-th*0.4?mul(PAL.savLf[0],0.62):PAL.savLf[0];
        for(let k=0;k<n;k++){F.o(rim[k],rim[(k+1)%n],top,bot);F.o(rim[k],rim[(k+1)%n],bot,top);}});},
    bamboo:(F,D,seed)=>{const R=RNG(seed*61+3),N=10+Math.floor(R()*7),cu=[];
      for(let i=0;i<N;i++){const a=i/N*TAU+(R()-.5)*0.9,d=2+R()*10,young=R()<0.25;cu.push({x:Math.cos(a)*d,z:-Math.sin(a)*d,a:a+(R()-.5)*0.9,h:young?150+R()*40:185+R()*75,r:young?1.7+R()*0.4:2.2+R()*0.8,lean:0.12+R()*0.14+d*0.012,col:PAL.culm[young?3:(R()*3)|0]});}
      for(let k=0;k<7;k++){const c=cu[Math.floor(k*N/7)],ca=Math.cos(c.a),sa=-Math.sin(c.a),h=c.h,off=f=>f*c.lean*h,P=[[c.x,-2,c.z],[c.x+ca*off(0.15),0.7*h,c.z+sa*off(0.15)],[c.x+ca*off(0.4),0.93*h,c.z+sa*off(0.4)]];
        const w=c.r*1.7;D.cf=solid(c.col);for(const [ux,uz] of [[-sa,ca],[ca,sa]])D.t([c.x-ux*w,-2,c.z-uz*w],[c.x+ux*w,-2,c.z+uz*w],P[2]);
        for(let t=0;t<2;t++){const b=lerp3(P[1],P[2],t?0.8:0.0),base=mix(PAL.bLeaf[(k+t)%3],c.col,0.25);D.cf=(p)=>mix(mul(base,0.85),mix(base,C('#a8b858'),0.35),cl(len3(sub3(p,b))/18));
          for(let l=0;l<3;l++){const fa=c.a+(l-1)*1.5+t*0.8+(R()-.5)*0.4,L=15+R()*6,d=nrm3([Math.cos(fa),-0.45-R()*0.4,-Math.sin(fa)]),sd=nrm3(crs(d,[0,1,0]));D.t(add3(b,sd,-2.2),add3(b,sd,2.2),add3(b,d,L));}}}},
    palm:(F,D,seed)=>{const R=RNG(seed*71+9),H=160+R()*60,la=R()*TAU,ln=0.22+R()*0.14,ca=Math.cos(la),sa=-Math.sin(la),P=[];
      for(let k=0;k<=6;k++){const t=k/6,off=H*ln*Math.pow(t,1.7)-H*0.04*Math.sin(t*PI);P.push([ca*off,k===0?-3:t*H*0.97,sa*off]);}
      F.cf=(p)=>mix(C('#7e7364'),C('#6e6456'),cl(p[1]/H));loft(F,[P[0],P[3],P[6]],[5.8,3.6,3.0],4,{rot:0.4});const top=P[6];
      const nc=3+(R()<0.5?1:0);for(let i=0;i<nc*3;i++)R();
      const nf=11;for(let i=0;i<nf;i++){const dead=i>=nf-2,a=i/nf*TAU+(R()-.5)*0.4,L=dead?40+R()*10:58+R()*22,up=dead?-0.9:0.35+R()*0.55+(i%3===0?0.3:0),c0=Math.cos(a),s0=-Math.sin(a);
        const rp=s=>{const hz=L*s*(dead?0.35:0.92),y=top[1]+1+L*(up*s-(dead?0.2:0.62)*s*s);return [top[0]+c0*hz,y,top[2]+s0*hz];};
        const base=dead?C('#8a6e40'):mix(C('#5a8a34'),C('#7a9a3e'),R());D.cf=(p)=>mix(mul(base,0.85),dead?C('#a48a56'):mix(base,C('#b0b860'),0.35),cl(len3(sub3(p,top))/L));
        const r0=rp(0.05),r1=rp(0.5),r2=rp(1),sd=nrm3(crs(nrm3(sub3(r2,r0)),[0,1,0]));
        if(dead){D.t(r0,add3(r2,sd,3),add3(r2,sd,-3));continue;}
        const w=18.5;for(const sg of [-1,1]){D.t(r0,r1,add3(add3(lerp3(r0,r1,0.8),sd,w*sg),[0,-w*0.7,0]));D.t(r1,r2,add3(add3(lerp3(r1,r2,0.6),sd,w*0.6*sg),[0,-w*0.5,0]));}}},
    banana:(F,D,seed)=>{const R=RNG(seed*67+5);
      const plant=(x,z,sc,nl)=>{const sh=(56+R()*22)*sc,lean=[(R()-.5)*3*sc,(R()-.5)*3*sc],top=[x+lean[0],sh,z+lean[1]],sr=4.6*sc,segs=sc>0.7?6:2;
        F.cf=(p)=>mix(C('#5d6a34'),C('#7c8a44'),cl(p[1]/sh));if(sc>0.7)loft(F,[[x,-2,z],top],[sr*1.15,sr*0.6],5);else spike(F,[x,-1,z],top,sr*1.1,3);
        const a0=R()*TAU;for(let i=0;i<nl;i++){const a=a0+i/nl*TAU*0.97+(R()-.5)*0.5,L=(62+R()*28)*sc,up=0.85+R()*0.4,dr=i%3===2?1.5:0.72+R()*0.2,ca=Math.cos(a),sa=-Math.sin(a);R();const old=R()<0.25;
          const pt=s=>{const hz=s*L*0.86,y=sh*0.95+L*(up*s-dr*s*s*s);return [top[0]+ca*hz,y,top[2]+sa*hz];};const base=mix(C('#346a24'),C('#4c8230'),R());let wm=0;for(let k=0;k<segs;k++)wm=Math.max(wm,10.5+R()*2.5);
          const r0=pt(0.2),r1=pt(0.6),r2=pt(1),w=wm*sc*0.97,sd=nrm3(crs(nrm3(sub3(r2,r0)),[0,1,0]));D.cf=(p)=>{const d=cl(len3(sub3(p,top))/L);return mix(mul(base,0.8+0.2*d),old?C('#9a8442'):mix(base,C('#86b04c'),0.35),ss(0.55,1,d)*(old?0.8:0.3));};
          for(const sg of [-1,1]){const e=add3(add3(r1,sd,w*sg),[0,-w*0.28,0]);D.t(r0,r1,e);D.t(r1,r2,e);}}return top;};
      const top=plant(0,0,1+(R()-.5)*0.2,6);
      for(let i=0;i<2;i++){const a=R()*TAU,ca=Math.cos(a),sa=-Math.sin(a),y0=top[1]*0.9,sd=[-sa,0,ca];D.cf=solid(C('#7a6038'));D.q(add3([ca*3.5,y0,sa*3.5],sd,-5),add3([ca*3.5,y0,sa*3.5],sd,5),add3([ca*7,y0-40,sa*7],sd,2),add3([ca*7,y0-40,sa*7],sd,-2),[0,y0,0]);}
      R();{const a=R()*TAU,d=12+R()*4;plant(Math.cos(a)*d,-Math.sin(a)*d,0.42,3);}}};
  const LOK=Object.keys(LO);
  M.treeLo=(kind,seed,stage)=>{kind=LO[kind]?kind:'pine';seed=+seed||1;stage=stage===undefined?2:(stage|0);const F=new VB(),D=new VB(),G=g();
    LO[kind](F,D,seed,stage===3&&GIANT[kind]?3:2);addM(G,[F,'sb4Flat'],[D,'sb4DS']);
    if(stage===1&&['pine','oak','birch','dead'].includes(kind)){const k=kind==='dead'?70/130:80/({pine:180,oak:150,birch:160})[kind];G.children.forEach(m=>m.geometry.scale(k,k,k));}
    G.userData.lod=1;G.userData.kind=kind;return G;};

  /* ======================================== 4. TREEHOUSE KIT ======================================== */
  const WD=PAL.wd,woodCf=(seed)=>(p)=>mix(WD.b,WD.a,cl(vn3(p[0]*0.08,p[1]*0.08,p[2]*0.08,seed)*1.3-0.1));
  function treePlatform(){const G=g(),B=new VB(),Rp=new VB(solid(PAL.rope)),R=RNG(41),DT=60,HS=13.34,PW=80/12;
    for(let i=0;i<12;i++){const x=-40+PW*(i+0.5),c=mix(WD.a,i%2?WD.c:WD.b,0.3+R()*0.5),y=DT-1.3+(R()-.5)*0.15,e0=40-R()*0.8,e1=40-R()*0.8;B.cf=()=>c;
      if(Math.abs(x)<HS){const z0=HS+0.4+R()*1.2,z1=HS+0.4+R()*1.2;box(B,[x,y,(-e0-z0)/2],PW/2-0.2,1.3,(e0-z0)/2);box(B,[x,y,(e1+z1)/2],PW/2-0.2,1.3,(e1-z1)/2);}
      else box(B,[x,y,(e1-e0)/2],PW/2-0.2,1.3,(e0+e1)/2);}
    // beams along X (rest on the bearers), bearers along Z
    B.cf=woodCf(3);[-35.5,-15.5,15.5,35.5].forEach((z,i)=>pole(B,[-41.5,55.2,z],[41.5,55.2+(R()-.5)*0.3,z],2.2,2.1,6,true,{jit:0.08,seed:i+1}));
    B.cf=woodCf(5);[-35,35].forEach((x,i)=>pole(B,[x,50.8,-42],[x,50.8,42],2.3,2.2,6,true,{jit:0.08,seed:i+7}));
    // lashings where beams cross bearers
    [-35,35].forEach(x=>[-35.5,-15.5,15.5,35.5].forEach(z=>{lash(Rp,[x,53,z],[1,0,0],[2.9,4.7],2.4,6);lash(Rp,[x,53,z],[0,0,1],[2.9,4.7],2.4,6);}));
    // collar round the trunk (octagon of short logs) at y≈30
    const CR=13,CY=30;B.cf=woodCf(9);for(let k=0;k<8;k++){const a0=(k-0.08)/8*TAU,a1=(k+1.08)/8*TAU;pole(B,[Math.cos(a0)*CR,CY+(k%2)*0.6,-Math.sin(a0)*CR],[Math.cos(a1)*CR,CY+(k%2)*0.6,-Math.sin(a1)*CR],1.7,1.7,6,true);}
    // knee braces from the collar to the bearers (±X axis + 4 diagonals)
    [[0,[35,48.6,0]],[PI,[-35,48.6,0]],[PI/4,[35,48.6,-31]],[3*PI/4,[-35,48.6,-31]],[5*PI/4,[-35,48.6,31]],[7*PI/4,[35,48.6,31]]].forEach(([a,tp],i)=>{
      const bt=[Math.cos(a)*CR,CY+0.8,-Math.sin(a)*CR],mid=add3(lerp3(bt,tp,0.5),[0,0.8,0]);B.cf=woodCf(11+i);loft(B,[bt,mid,tp],[1.9,1.8,1.7],6,{jit:0.1,seed:i+3,cap1:true});
      lash(Rp,tp,nrm3(sub3(tp,bt)),2.3,2.2,6);lash(Rp,add3(bt,nrm3(sub3(tp,bt)),2),nrm3(sub3(tp,bt)),2.4,2.0,6);});
    addM(G,[B,'sb4Wood',{uv:20}],[Rp,'sb4Flat']);G.userData.deckTop=DT;G.userData.hole=[13.1,13.7];G.userData.collar=[CR,CY];G.userData.footprint=[2,2];G.userData.colliders=[];return G;}
  function ropeLadder(){const G=g(),Rp=new VB(solid(mix(PAL.rope,PAL.ropeD,0.3))),W=new VB(),top=60,zf=y=>1.2+3.3*Math.pow(cl(1-y/top),1.3),xf=y=>1.3*Math.sin(cl(1-y/top)*PI*0.9);
    [-1,1].forEach(s=>{const x0=s*7.6,P=[[x0,60.4,-5.2],[x0,61.6,-2.4],[x0+xf(60),61.2,0.4]];for(let k=1;k<=10;k++){const y=60-k*5.9;P.push([x0+xf(y)+s*0.15*Math.sin(k*1.7),Math.max(0.4,y),zf(y)]);}
      P.push([x0+xf(0)+s*0.8,0.35,zf(0)+3.5]);loft(Rp,P,P.map(()=>0.55),3,{rot:0.2});
      Rp.cf=solid(PAL.ropeD);octb(Rp,[x0,60.6,-5.2],1.1,[1,0.8,1],3,0.1,0.4);W.cf=solid(WD.b);pole(W,[x0,59,-5.6],[x0,62.6,-5.6],0.8,0.7,5,true);Rp.cf=solid(mix(PAL.rope,PAL.ropeD,0.3));});
    for(let k=0;k<9;k++){const y=4.5+k*6.5,x=xf(y),z=zf(y),c=mix(WD.a,WD.c,hsh(k,2,3,4));W.cf=()=>c;pole(W,[-8.6+x,y+0.15*(k%2),z],[8.6+x,y-0.15*(k%2),z],0.78,0.72,5,true);
      Rp.cf=solid(PAL.ropeD);[-1,1].forEach(s=>octb(Rp,[s*7.6+x,y,z],1.0,[0.9,1.2,0.9],k*2+s,0.15,0.3));Rp.cf=solid(mix(PAL.rope,PAL.ropeD,0.3));}
    addM(G,[W,'sb4Wood',{uv:12}],[Rp,'sb4Flat']);G.userData.top=top;G.userData.climbFrom='+Z';return G;}
  function treeRail(){const G=g(),W=new VB(),Rp=new VB(solid(PAL.rope)),R=RNG(57);
    [-19.6,19.6].forEach((x,i)=>{W.cf=woodCf(i+20);loft(W,[[x,-0.5,0],[x+(R()-.5)*1.2,10,(R()-.5)*1.2],[x,21,0.2]],[1.7,1.45,1.25],5,{cap1:[x,21.8,0.2],jit:0.12,seed:i+5});
      spike(W,[x,17,0],[x-Math.sign(x)*3+(R()-.5),22.5,1.8],0.6,3);lash(Rp,[x,19.4,0],[0,1,0],[2.0,2.0],2.6,6);});
    W.cf=woodCf(31);const TR=[[-21.5,19.5,0],[-7,20.1,0.6],[7,19.4,-0.4],[21.5,19.8,0]];loft(W,TR,[1.35,1.2,1.15,1.05],5,{jit:0.12,seed:3,cap0:true,cap1:true});
    spike(W,[-3,20,0.3],[-0.5,24,1.4],0.45,3);spike(W,[10,19.6,-0.2],[13,23.2,-1.3],0.4,3);
    const low=[];for(let k=0;k<=4;k++){const x=-19+38*k/4;low.push([x,2.4-Math.sin(k/4*PI)*0.8,0]);}loft(Rp,low,low.map(()=>0.32),3);
    const Z=[];for(let k=0;k<=12;k++){const x=-18+36*k/12;Z.push(k%2?[x,2.2-Math.sin(k/12*PI)*0.8,0]:[x,19,0]);}loft(Rp,Z,Z.map(()=>0.28),3);
    addM(G,[W,'sb4Wood',{uv:12}],[Rp,'sb4Flat']);G.userData.h=21;return G;}
  function hammock(){const G=g(),W=new VB(),Rp=new VB(solid(PAL.rope)),H=new VB(),R=RNG(63);
    [-1,1].forEach(s=>{const x=s*19;W.cf=woodCf(40+s);loft(W,[[x,-1,0],[x+s*0.4,18,0.3],[x+s*0.6,32.5,0]],[1.8,1.55,1.35],5,{cap1:true,jit:0.12,seed:s+4});
      spike(W,[x+s*0.5,28,0],[x+s*3.4,36,1.4],0.7,4);lash(Rp,[s*18.6,30.5,0],[0,1,0],[1.9,1.9],2.2,6);});
    const nu=8,nv=4,X=12.5,Z=6.6,pt=(i,j)=>{const x=-X+2*X*i/nu,u=x/X,zw=Z*(1-0.72*u*u),z=-zw+2*zw*j/nv,v=z/Z;return [x,18+5.2*u*u+2.4*v*v*(1-0.6*u*u),z];};
    H.cf=(p)=>{const k=Math.floor((p[0]+X)/3.2)%3;return k===0?C('#8a4a2e'):k===1?C('#c9a86a'):C('#b8945a');};
    for(let i=0;i<nu;i++)for(let j=0;j<nv;j++)H.q(pt(i,j),pt(i+1,j),pt(i+1,j+1),pt(i,j+1),[pt(i,j)[0],40,0]);
    [-1,1].forEach(s=>{const e=[s*15,23.6,0],ci=s<0?0:nu;for(let j=0;j<nv;j++)H.o(pt(ci,j),pt(ci,j+1),e,[s*10,40,0]);
      Rp.cf=solid(PAL.rope);for(let j=0;j<=nv;j+=2)loft(Rp,[pt(ci,j),e],[0.2,0.2],3);loft(Rp,[e,[s*18.4,30.4,0]],[0.4,0.35],4);Rp.cf=solid(PAL.ropeD);octb(Rp,e,0.9,[1,1,1],s+9,0.1,0);});
    addM(G,[W,'sb4Wood',{uv:12}],[H,'sb4DS'],[Rp,'sb4Flat']);G.userData.anchors=[[-18,30.5,0],[18,30.5,0]];G.userData.seatY=18;G.userData.colliders=[[-19,0,2],[19,0,2]];return G;}

  /* ======================================== 5. ANIMAL HUSBANDRY ======================================== */
  // egg (lathe, 5 sides × 4 rings ≈ 40 ▲) at c, lying tilt
  function egg(B,c,s,tilt,yaw,col){const prof=[[0,-1.0],[0.62,-0.82],[0.78,-0.2],[0.6,0.55],[0,1.05]],ca=Math.cos(yaw),sa=Math.sin(yaw),ct=Math.cos(tilt),st=Math.sin(tilt);
    const X=(r,y,t)=>{const x0=Math.cos(t)*r*s*1.6,z0=Math.sin(t)*r*s*1.6,y0=y*s*2.0,x1=x0*ct-y0*st,y1=x0*st+y0*ct;return [c[0]+x1*ca+z0*sa,c[1]+y1,c[2]-x1*sa+z0*ca];};
    B.cf=solid(col||PAL.egg[0]);const n=5;for(let i=0;i<prof.length-1;i++)for(let j=0;j<n;j++){const t0=j/n*TAU,t1=(j+1)/n*TAU,a=X(prof[i][0],prof[i][1],t0),b=X(prof[i][0],prof[i][1],t1),cc=X(prof[i+1][0],prof[i+1][1],t1),d=X(prof[i+1][0],prof[i+1][1],t0);
      if(i===0)B.o(a,cc,d,c);else if(i===prof.length-2)B.o(a,b,d,c);else B.q(a,b,cc,d,c);}return B;}
  // straw ring nest into F (lathe) + strands into D
  function strawNest(F,D,c,r,h,seed){const R=RNG(seed);F.cf=(p,n)=>mul(mix(PAL.straw[0],PAL.straw[2],hsh(Math.round(p[0]*2),Math.round(p[2]*2),Math.round(p[1]*2),seed)),0.8+0.2*n[1]);F.face=true;
    lathe(F,c,[[r*0.35,0.25],[r*0.75,0.1],[r*1.0,h*0.45],[r*0.86,h],[r*0.6,h*0.82],[r*0.38,h*0.3],[0,h*0.22]],7,{rot:R()});F.face=false;
    D.cf=(p)=>mix(PAL.straw[1],PAL.straw[0],cl((p[1]-c[1])/h));for(let i=0;i<10;i++){const a=R()*TAU,rr=r*(0.75+R()*0.3),b=[c[0]+Math.cos(a)*rr,c[1]+h*(0.5+R()*0.4),c[2]-Math.sin(a)*rr],t=add3(b,[Math.cos(a+1.4)*r*0.6,(R()-.3)*h*0.5,-Math.sin(a+1.4)*r*0.6]);
      D.t(b,add3(b,[0,0.4,0]),t);}}
  function coop(){const G=g(),W=new VB(),Bm=new VB(),Th=new VB(),F=new VB(),R=RNG(71),FT=10.9,X0=14,Z0=9.5,slat=(x0,x1,y,z,ax)=>{const c=mix(PAL.bm.a,[PAL.bm.b,PAL.bm.g,PAL.bm.d][Math.floor(R()*3)],0.3+R()*0.4);W.cf=()=>c;
      if(ax==='x')box(W,[(x0+x1)/2,y,z],(x1-x0)/2,1.2,0.45);else box(W,[z,y,(x0+x1)/2],0.45,1.2,(x1-x0)/2);};
    Bm.cf=(p)=>mix(PAL.bm.a,PAL.bm.d,cl(p[1]/30)*0.6);[[-12,-8],[12,-8],[-12,8],[12,8]].forEach(([x,z])=>pole(Bm,[x,0,z],[x,FT-0.6,z],1.15,1.05,5,true));
    [[-X0,-Z0],[X0,-Z0],[-X0,Z0],[X0,Z0]].forEach(([x,z])=>pole(Bm,[x,FT-1.4,z],[x,27,z],0.95,0.9,5,true));
    W.cf=solid(mix(WD.a,WD.b,0.5));box(W,[0,FT-0.7,0],X0+0.8,0.7,Z0+0.6);
    const rows=[12.5,15.5,18.5,21.5,24.5];rows.forEach((y,k)=>{slat(-X0,X0,y,-Z0,'x');slat(-Z0,Z0,y,-X0,'z');slat(-Z0,Z0,y,X0,'z');
      if(k<2){slat(-1,4,y,Z0,'x');slat(10,X0,y,Z0,'x');}else if(k===2){slat(-X0,4,y,Z0,'x');slat(10,X0,y,Z0,'x');}else slat(-X0,X0,y,Z0,'x');});
    W.cf=solid(WD.b);box(W,[-7.5,FT+3.1,Z0-2],0.4,3.1,2.2);box(W,[7,20.1,Z0],3.6,0.5,0.6);[[-X0,26.3,0,'z'],[X0,26.3,0,'z']].forEach(([x,y])=>box(W,[x,y,0],0.8,0.6,Z0+0.8));
    [-Z0,Z0].forEach(z=>box(W,[0,26.3,z],X0+0.8,0.6,0.8));
    // gable infill triangles
    W.cf=solid(mix(PAL.bm.a,PAL.bm.d,0.4));[-X0,X0].forEach(x=>{W.o([x,25.9,-Z0],[x,25.9,Z0],[x,33.8,0],[x*3,28,0]);W.o([x+Math.sign(x)*0.6,25.9,-Z0],[x+Math.sign(x)*0.6,25.9,Z0],[x+Math.sign(x)*0.6,33.8,0],[0,28,0]);});
    // thatch roof: two slabs ridge (y 35, z 0) → eaves (y 24.6, z ±14)
    [-1,1].forEach(s=>{const rd=[0,35.4,0],ev=[0,24.4,s*14.5],c=lerp3(rd,ev,0.5),az=mul(sub3(ev,rd),0.5),n=nrm3(crs(az,[1,0,0])),ay=mul(dot(n,[0,1,0])<0?mul(n,-1):n,1.3);
      Th.cf=(p)=>mix(C('#c9a860'),C('#9a7c40'),cl((35-p[1])/12)*0.6+hsh(Math.round(p[0]),s,2,3)*0.25);obox(Th,c,[17.5,0,0],ay,add3(az,mul(nrm3(az),0.6)));});
    W.cf=solid(WD.b);pole(W,[-18.5,36.6,0],[18.5,36.6,0],1.2,1.1,6,true);
    // nest boxes (front-left cubbies) + eggs
    strawNest(F,Th,[-10.7,FT,Z0-2.6],2.6,2.2,5);strawNest(F,Th,[-4.2,FT,Z0-2.6],2.6,2.2,6);egg(F,[-10.4,FT+1.5,Z0-2.4],0.95,1.2,0.4);egg(F,[-4.4,FT+1.5,Z0-2.8],0.95,1.3,2.1);egg(F,[-3.4,FT+1.4,Z0-1.9],0.9,1.4,1.0,PAL.egg[1]);
    // ramp with cleats from the door to the ground
    {const a=[7,FT-0.2,Z0+0.6],b=[17.5,0.2,18.8],d=sub3(b,a),L=len3(d),u=nrm3(d),side=nrm3(crs(u,[0,1,0])),up=nrm3(crs(side,u)),n=dot(up,[0,1,0])<0?mul(up,-1):up;W.cf=solid(mix(WD.a,WD.c,0.4));
      obox(W,lerp3(a,b,0.5),mul(u,L/2),mul(n,0.45),mul(side,2.6));W.cf=solid(WD.b);for(let k=1;k<6;k++)obox(W,add3(lerp3(a,b,k/6),n,0.7),mul(u,0.35),mul(n,0.35),mul(side,2.4));}
    addM(G,[W,'sb4Wood',{uv:14}],[Bm,'sb4Bamboo',{uv:10}],[Th,'sb4Thatch',{uv:16}],[F,'sb4Flat']);G.userData.floorTop=FT;G.userData.door=[7,FT,Z0];G.userData.colliders=[[0,0,14]];G.userData.footprint=[1,1];return G;}
  function penLogs(W,Rp,R,gate){[-20,20].forEach((x,i)=>{W.cf=(p,n)=>n[1]>0.5?WD.cut:mix(WD.dk,WD.b,cl(vn3(p[0]*0.2,p[1]*0.1,p[2]*0.2,i+3)));loft(W,[[x,-1,0],[x+(R()-.5),12,(R()-.5)*0.8],[x,26,0]],[2.7,2.5,2.3],6,{cap1:[x,27.2,0],jit:0.12,seed:i+1});});
    if(gate)return;
    [[5.5,2.3],[13,-2.3],[20.5,2.3]].forEach(([y,z],k)=>{W.cf=(p,n)=>Math.abs(p[0])>20.8?WD.cut:mix(WD.b,WD.a,cl(vn3(p[0]*0.1,p[1]*0.3,p[2]*0.3,k+5)*1.2));
      loft(W,[[-21.5,y+(R()-.5),z],[0,y-0.6+(R()-.5)*0.6,z+(R()-.5)*0.6],[21.5,y+(R()-.5),z]],[2.1,2.0,1.9],6,{cap0:true,cap1:true,jit:0.1,seed:k+9});
      [-20,20].forEach(x=>lash(Rp,[x,y,z*0.55],[0,1,0],[3.6,3.1],2.0,6));});
    W.cf=solid(WD.b);[-4.6,4.6].forEach((z,i)=>pole(W,[0.6*i,-1,z],[0.6*i-0.4,23.5,z],1.25,1.1,5,true));lash(Rp,[0,18,0],[0,1,0],[1.6,5.8],1.8,6);}
  function penFence(){const G=g(),W=new VB(),Rp=new VB(solid(PAL.ropeD)),R=RNG(77);penLogs(W,Rp,R,false);addM(G,[W,'sb4Wood',{uv:14}],[Rp,'sb4Flat']);G.userData.h=26;G.userData.colliders=[[-20,0,3],[20,0,3]];return G;}
  function penGate(){const G=g(),W=new VB(),Rp=new VB(solid(PAL.ropeD)),R=RNG(79);penLogs(W,Rp,R,true);
    W.cf=woodCf(83);[6,19].forEach(y=>pole(W,[-17.2,y,0.3],[17.2,y,0.3],1.25,1.15,6,true));for(let k=0;k<6;k++){const x=-15.8+31.6*k/5;pole(W,[x,3,1.6],[x,22+(k%2)*0.8,1.6],0.95,0.85,5,true);}
    pole(W,[-15,6.5,-0.9],[15,18.5,-0.9],1.0,1.0,5,true);[8,17].forEach(y=>lash(Rp,[-18.8,y,0.3],[0,1,0],[3.8,3.2],1.8,6));lash(Rp,[18.6,13,0.3],[0,1,0],[3.8,3.2],1.4,6);
    addM(G,[W,'sb4Wood',{uv:14}],[Rp,'sb4Flat']);G.userData.h=26;G.userData.colliders=[[-20,0,3],[20,0,3]];G.userData.gate=[-17.2,17.2];return G;}
  function trough(){const G=g(),W=new VB(),F=new VB(),L=34,Lc=13.6,cy=5.6,Ro=5.3,Ri=3.9,cut=7.8,n=8,R=RNG(85);
    const a0=Math.asin((cut-cy)/Ro),b0=Math.asin((cut-cy)/Ri),O=(x,j,rs)=>{const t=a0-j/n*(PI+2*a0);return [x,cy+Math.sin(t)*Ro*rs,Math.cos(t)*Ro*rs];},I=(x,j)=>{const t=b0-j/n*(PI+2*b0);return [x,cy+Math.sin(t)*Ri,Math.cos(t)*Ri];};
    const rs0=1.03,rs1=0.96,bark=(p,nn)=>mul(mix(WD.dk,WD.b,cl(vn3(p[0]*0.25,p[1]*0.4,p[2]*0.4,5)*1.3)),0.85+0.15*nn[1]);
    W.cf=bark;for(let j=0;j<n;j++)W.q(O(-L/2,j,rs0),O(-L/2,j+1,rs0),O(L/2,j+1,rs1),O(L/2,j,rs1),[0,cy,0]);
    W.cf=(p)=>mix(WD.cut,WD.a,cl(Math.hypot(p[1]-cy,p[2])/Ro));[[-L/2,rs0,-1],[L/2,rs1,1]].forEach(([x,rs,s])=>{const c=[x,cy+0.6,0];for(let j=0;j<n;j++)W.o(c,O(x,j,rs),O(x,j+1,rs),[x-s*5,cy,0]);W.o(c,O(x,n,rs),O(x,0,rs),[x-s*5,cy,0]);});
    W.cf=solid(mix(WD.cut,WD.a,0.5));const T0=(x,s,rs)=>[x,cut,s*Math.cos(a0)*Ro*rs],rsx=x=>rs0+(rs1-rs0)*(x+L/2)/L;
    [[-L/2,-Lc],[Lc,L/2]].forEach(([x0,x1])=>W.q(T0(x0,1,rsx(x0)),T0(x1,1,rsx(x1)),T0(x1,-1,rsx(x1)),T0(x0,-1,rsx(x0)),[0,0,0]));
    [-1,1].forEach(s=>W.q(T0(-Lc,s,rsx(-Lc)),T0(Lc,s,rsx(Lc)),[Lc,cut,s*Math.cos(b0)*Ri],[-Lc,cut,s*Math.cos(b0)*Ri],[0,0,0]));
    W.cf=(p)=>mix(WD.c,WD.cut,0.4);for(let j=0;j<n;j++)W.q(I(-Lc,j),I(-Lc,j+1),I(Lc,j+1),I(Lc,j),[0,cy,0],true);
    [-Lc,Lc].forEach(x=>{const c=[x,cy+0.8,0];for(let j=0;j<n;j++)W.o(c,I(x,j),I(x,j+1),[x*3,cy,0]);W.o(c,I(x,n),I(x,0),[x*3,cy,0]);});
    const fy=6.0,fz=Math.sqrt(Ri*Ri-(fy-cy)*(fy-cy))-0.05;F.cf=(p)=>mix(C('#a08a58'),C('#8a7448'),hsh(Math.round(p[0]),Math.round(p[2]*2),3,1));F.q([-Lc+0.1,fy,-fz],[Lc-0.1,fy,-fz],[Lc-0.1,fy,fz],[-Lc+0.1,fy,fz],[0,0,0]);
    F.cf=solid(C('#6a9a3a'));for(let i=0;i<9;i++){const x=-11+R()*22,z=(R()-.5)*5,a=R()*3;F.t([x,fy+0.15,z],[x+Math.cos(a)*2.2,fy+0.3,z+Math.sin(a)*2.2],[x+Math.cos(a+0.5)*1.4,fy+0.2,z+Math.sin(a+0.5)*1.4]);}
    W.cf=solid(WD.b);[[-10,-1],[-10,1],[10,-1],[10,1]].forEach(([x,s])=>obox(W,[x,1.0,s*4.7],[1.4,0,0],[0,1.0,-s*0.5],[0,0.4,s*1.4]));
    addM(G,[W,'sb4Wood',{uv:16}],[F,'sb4Flat']);G.userData.top=cut;G.userData.feedY=fy;G.userData.colliders=[[-10,0,5],[0,0,5],[10,0,5]];return G;}
  function nest(){const G=g(),F=new VB(),D=new VB();strawNest(F,D,[0,0,0],6.6,3.9,9);D.cf=solid(PAL.straw[0]);
    for(let i=0;i<8;i++){const a=i/8*TAU+0.3,r=7+hsh(i,1,1,1)*2;D.t([Math.cos(a)*5,0.3,-Math.sin(a)*5],[Math.cos(a+0.15)*5,0.3,-Math.sin(a+0.15)*5],[Math.cos(a+0.25)*r,0.1,-Math.sin(a+0.25)*r]);}
    egg(F,[-1.2,2.1,0.8],1.15,1.25,0.3);egg(F,[1.6,2.0,-0.4],1.1,1.4,2.2,PAL.egg[1]);egg(F,[0.2,2.2,-2.0],1.12,1.2,1.4);
    addM(G,[F,'sb4Flat'],[D,'sb4DS']);G.userData.eggs=[[-1.2,2.1,0.8],[1.6,2.0,-0.4],[0.2,2.2,-2.0]];return G;}
  function hayPile(){const G=g(),Th=new VB(),D=new VB(),R=RNG(91);Th.cf=(p,n)=>mul(mix(PAL.straw[0],PAL.straw[1],cl(vn3(p[0]*0.15,p[1]*0.15,p[2]*0.15,4)*1.4-0.2)),0.85+0.15*n[1]);
    blob(Th,[0,4.5,0],14,[1.35,0.97,1.15],13,0.22,1);blob(Th,[13,2,8],6,[1.3,0.7,1.1],17,0.3);
    D.cf=(p)=>mix(PAL.straw[1],PAL.straw[0],cl(p[1]/18));for(let i=0;i<28;i++){const a=R()*TAU,el=R()*1.2,b=[Math.cos(a)*Math.cos(el)*18.5,4.5+Math.sin(el)*13,-Math.sin(a)*Math.cos(el)*15.5],t=add3(b,[Math.cos(a+1.5+R())*6,(R()-.6)*3,-Math.sin(a+1.5+R())*6]);
      D.t(b,add3(b,[0,0.5,0]),t);}
    for(let i=0;i<10;i++){const a=R()*TAU,r=19+R()*6,b=[Math.cos(a)*r,0.15,-Math.sin(a)*r*0.85],d=R()*TAU;D.t(b,add3(b,[Math.cos(d)*0.4,0.05,Math.sin(d)*0.4]),add3(b,[Math.cos(d+1.5)*5,0.05,Math.sin(d+1.5)*5]));}
    addM(G,[Th,'sb4Thatch',{uv:12}],[D,'sb4DS']);G.userData.h=18;G.userData.colliders=[[0,0,16]];return G;}

  /* ======================================== 6. CAVE DWELLING ======================================== */
  function caveBed(){const G=g(),F=new VB(),D=new VB(),R=RNG(97),X=14,Z=22,hp=(x,z)=>{const u=x/X,v=z/Z,e=1-Math.pow(Math.min(1,u*u+v*v*0.9),1.6);return Math.max(0,4.4*e+(hsh(Math.round(x),Math.round(z),2,1)-.5)*0.6*e);};
    // leaf/fern base
    const nu=4,nv=6,P=(i,j)=>{const x=-X*1.08+2.16*X*i/nu,z=-Z*1.05+2.1*Z*j/nv;return [x,hp(x,z)-0.3,z];};F.cf=(p,n)=>mix(C('#5a6a2c'),C('#7a6a3a'),hsh(Math.round(p[0]/3),Math.round(p[2]/3),5,2));F.face=true;
    for(let i=0;i<nu;i++)for(let j=0;j<nv;j++)F.q(P(i,j),P(i+1,j),P(i+1,j+1),P(i,j+1),[0,-10,0]);F.face=false;
    for(let i=0;i<18;i++){const a=i/18*TAU+R()*0.3,rx=X*0.92,rz=Z*0.92,b=[Math.cos(a)*rx,1.4,-Math.sin(a)*rz],t=[Math.cos(a)*(rx+5+R()*3),0.3,-Math.sin(a)*(rz+5+R()*3)],sd=nrm3(crs(nrm3(sub3(t,b)),[0,1,0]));
      D.cf=solid(i%3===0?C('#8a7238'):i%3===1?C('#4e7a2c'):C('#6a8a34'));leaf(D,b,t,1.6+R()*0.6,sd,0.3);}
    // hide spread on top (irregular outline with leg flaps)
    const hx=10.5,hz=16,hu=4,hv=6,Hd=(i,j)=>{const u=-1+2*i/hu,v=-1+2*j/hv,cor=Math.abs(u)>0.99&&Math.abs(v)>0.99?1:0,x=u*hx*(1+0.15*cor)+(hsh(i,j,7,3)-.5)*1.4,z=v*hz*(1+0.06*cor)+(hsh(i,j,8,3)-.5)*1.4,ed=Math.max(Math.abs(u),Math.abs(v))>0.99;return [x,hp(x*0.9,z*0.9)+(ed?-0.6:0.5),z];};
    F.cf=(p,n)=>{const e=cl(Math.max(Math.abs(p[0])/hx,Math.abs(p[2])/hz));return mix(mix(mix(PAL.fur[1],PAL.hide[1],0.3),PAL.fur[0],e*0.7+hsh(Math.round(p[0]/3),Math.round(p[2]/3),4,4)*0.3),PAL.fur[2],ss(0.85,1,e)*0.6);};F.face=true;
    for(let i=0;i<hu;i++)for(let j=0;j<hv;j++)F.q(Hd(i,j),Hd(i+1,j),Hd(i+1,j+1),Hd(i,j+1),[0,-10,0]);F.face=false;
    // fur pillow at the head (−Z) and rolled hide at the foot (+Z)
    F.cf=(p,n)=>mul(mix(PAL.fur[0],PAL.fur[1],hsh(Math.round(p[0]*1.5),Math.round(p[1]*2),3,4)),0.8+0.2*n[1]);
    loft(F,[[-8,4.8,-15.5],[0,5.6,-16.2],[8,4.8,-15.5]],[[2.6,2.4],[3.0,2.7],[2.6,2.4]],6,{cap0:true,cap1:true,jit:0.15,seed:3});
    F.cf=(p)=>mix(PAL.fur[2],PAL.fur[0],0.4);loft(F,[[-9,3.6,16.5],[0,3.9,17],[9,3.4,16.3]],[[2.0,1.8],[2.1,1.9],[2.0,1.7]],6,{cap0:true,cap1:true,jit:0.1,seed:5});
    addM(G,[F,'sb4Flat'],[D,'sb4DS']);G.userData.footprint=[1,2];G.userData.h=7;G.userData.colliders=[];return G;}
  function flame(s,seed){const F=g(),R=RNG(seed||5);F.name='flame';F.userData.dyn=1;
    F.add(coneM(4.2*s,14*s,'fire',{noShadow:true,mo:{ei:1.8}},6,R,0.35,0.8*s,[0.5*s,-0.3*s]));
    F.add(coneM(2.8*s,9.5*s,'fire',{x:2.7*s,z:1.1*s,noShadow:true,mo:{ei:1.8}},5,R,0.3,0.5*s,[1.5*s,0.4*s]));
    F.add(coneM(2.5*s,8.5*s,'fire',{x:-2.5*s,z:-0.9*s,noShadow:true,mo:{ei:1.8}},5,R,0.3,0.5*s,[-1.4*s,-0.4*s]));
    F.add(coneM(2.3*s,7*s,'sbFlameY',{x:0.3*s,y:-0.1,z:2.3*s,noShadow:true,mo:{ei:1.5}},5,R,0.3,0.3*s,[0,0.4*s]));
    if(K.glow)F.add(K.glow('#ff9a40',46,{y:7*s,op:0.75},false));return F;}
  function stoneHearth(lit){const G=g(),S=new VB(),W=new VB(),F=new VB(),R=RNG(101),n=9;
    for(let i=0;i<n;i++){const a=i/n*TAU+R()*0.25,r=12+R()*1.2,sz=3.1+R()*1.1,c=mix(C('#8d877c'),C('#6e695f'),R());S.cf=(p,nn)=>mul(mix(c,PAL.scorch,cl(1-(Math.hypot(p[0],p[2])-r+sz)/(sz*1.6))*0.55),nn[1]<0.2?0.85:1);
      blob(S,[Math.cos(a)*r,sz*0.32,-Math.sin(a)*r],sz,[1.25,0.7,1.0],i+5,0.35);}
    {const a=2.2,c=[Math.cos(a)*14.5,4.8,-Math.sin(a)*14.5];S.cf=solid(C('#7a756c'));obox(S,c,[Math.cos(a+PI/2)*6,0,-Math.sin(a+PI/2)*6],[Math.cos(a)*-0.35,0.9,-Math.sin(a)*-0.35],[Math.cos(a)*2.2,1.6,-Math.sin(a)*2.2]);}
    F.cf=(p)=>{const d=Math.hypot(p[0],p[2]);return d<7?mix(PAL.ash,C('#8a827a'),hsh(Math.round(p[0]),Math.round(p[2]),1,2)*0.4):PAL.scorch;};
    const ring=r=>{const P=[];for(let k=0;k<10;k++){const a=k/10*TAU;P.push([Math.cos(a)*r*(0.9+hsh(k,r|0,3,3)*0.2),0.25,-Math.sin(a)*r*(0.9+hsh(k,r|0,4,3)*0.2)]);}return P;};const r1=ring(7),r2=ring(13.5);
    for(let k=0;k<10;k++){F.o([0,0.55,0],r1[k],r1[(k+1)%10],[0,-5,0]);F.q(r1[k],r1[(k+1)%10],r2[(k+1)%10],r2[k],[0,-5,0]);}
    F.cf=solid(PAL.char);for(let i=0;i<7;i++){const a=R()*TAU,d=1.5+R()*5;octb(F,[Math.cos(a)*d,0.7,-Math.sin(a)*d],0.9+R()*0.5,[1.3,0.6,1],i+1,0.3,R()*3);}
    for(let i=0;i<4;i++){const a=i/4*TAU+0.4+R()*0.3,o=[Math.cos(a)*11,1.6,-Math.sin(a)*11],e=[Math.cos(a)*(lit?1.5:3),lit?3.6:1.2,-Math.sin(a)*(lit?1.5:3)];
      W.cf=(p)=>{const t=Math.hypot(p[0],p[2]);return t<5?PAL.char:t<7?mix(PAL.char,WD.b,(t-5)/2):mix(WD.dk,WD.b,0.5);};loft(W,[o,e],[1.6,1.3],5,{cap0:true,cap1:true,jit:0.1,seed:i+1});}
    addM(G,[S,'sb4Rock',{uv:10}],[W,'sb4Wood',{uv:10}],[F,'sb4Flat']);if(lit)G.add(flame(0.85,7));G.userData.r=16;G.userData.lit=!!lit;G.userData.colliders=[[0,0,13]];return G;}
  function hideCurtain(){const G=g(),W=new VB(),H=new VB(),Rp=new VB(solid(PAL.ropeD)),R=RNG(103);
    [-19.6,19.6].forEach((x,i)=>{W.cf=woodCf(110+i);loft(W,[[x,-0.5,-0.6],[x+(R()-.5)*0.8,24,-0.6],[x,48.5,-0.6]],[1.6,1.45,1.3],5,{cap1:true,jit:0.12,seed:i+2});});
    W.cf=woodCf(117);loft(W,[[-22,45.6,-0.6],[0,45.1,-0.6],[22,45.7,-0.6]],[1.35,1.3,1.25],5,{cap0:true,cap1:true,jit:0.1,seed:6});[-19.6,19.6].forEach(x=>lash(Rp,[x,45.5,-0.6],[1,0,0],[2.1,2.1],2.4,6));
    const panel=(x0,x1,zo,seed,tie)=>{const nu=5,nv=6,P=(i,j)=>{const u=i/nu,v=j/nv;let x=x0+(x1-x0)*u+(hsh(i,j,seed,1)-.5)*0.8,y=45.2-v*(43.8+(hsh(i,seed,2,2)-.5)*3.5)*(j===nv?1:1),z=zo+Math.sin(u*PI*3.2+seed)*1.1*(0.3+v)+(hsh(i,j,seed,3)-.5)*0.4;
          if(tie){const k=ss(0.35,1,v);x=x+(x1-0.5-x)*k*0.82;z+=k*1.4;y+=k*v*4;}return [x,y,z];};
      H.cf=(p)=>{const e=Math.min(Math.abs(p[0]-x0),Math.abs(p[0]-x1))/((x1-x0)/2);return mix(PAL.hide[2],mix(PAL.hide[0],PAL.hide[1],hsh(Math.round(p[1]/6),seed,1,1)*0.6),ss(0,0.25,e));};
      for(let i=0;i<nu;i++)for(let j=0;j<nv;j++)H.q(P(i,j),P(i+1,j),P(i+1,j+1),P(i,j+1),[0,24,-10]);
      for(let i=0;i<nu;i++){const a=P(i,0),b=P(i+1,0);H.q(a,b,[b[0],b[1]+1.2,-1.9],[a[0],a[1]+1.2,-1.9],[0,40,5]);}
      [0.15,0.5,0.85].forEach(u=>lash(Rp,[x0+(x1-x0)*u,45.3,-0.6],[1,0,0],[1.75,1.75],1.0,5));
      if(tie){const c=lerp3(P(nu-1,nv),P(nu,nv-2),0.5);lash(Rp,[x1-2.2,20,zo+1.4],[0,1,0],[2.4,1.6],1.4,6);loft(Rp,[[x1-1.2,20,zo+1.4],[19.6,21,-0.6]],[0.3,0.3],3);}};
    panel(-19.2,1.2,0.9,3,false);panel(-0.6,19.0,1.8,7,true);
    addM(G,[W,'sb4Wood',{uv:12}],[H,'sb4DS'],[Rp,'sb4Flat']);G.userData.h=48;G.userData.colliders=[[-19.6,0,2],[19.6,0,2]];return G;}

  /* ======================================== REGISTER ======================================== */
  const P4={treePlatform,ropeLadder,treeRail,hammock,coop,penFence,penGate,trough,nest,hayPile,caveBed,stoneHearth:()=>stoneHearth(true),stoneHearthOff:()=>stoneHearth(false),hideCurtain};
  {const oldPiece=M.piece;M.piece=(id,...a)=>P4[id]?P4[id](...a):oldPiece(id,...a);Object.keys(P4).forEach(k=>{if(!M.list.pieces.includes(k))M.list.pieces.push(k);});
    ['treePlatform','ropeLadder','treeRail','penFence','penGate','hideCurtain'].forEach(k=>{if(M.meta.structure&&!M.meta.structure.includes(k))M.meta.structure.push(k);});
    if(M.meta.flame&&!M.meta.flame.includes('stoneHearth'))M.meta.flame.push('stoneHearth');}
  {const oldItem=M.item;M.item=(id,...a)=>id==='sapling'?M.uprooted(a[0]||'oak'):oldItem(id,...a);if(!M.list.items.includes('sapling'))M.list.items.push('sapling');}
  ['pine','oak','birch'].forEach(k=>{const key='tree:'+k+':3';if(M.list.resources&&!M.list.resources.includes(key))M.list.resources.push(key);});
  M.list.saplings=SAPK.slice();M.list.treeLo=LOK.slice();M.list.extra4b=['sapling','uprooted','treeLo'];M.list.pieces4b=Object.keys(P4);
  M.meta.extra4b={saplingH:{0:[6,11],1:[22,45]},giant:{pine:330,oak:270,birch:290,oakTrunkR60:+(12-4.8*60/(270*0.46)).toFixed(1)},loSwapDist:1000,
    treePlatform:{deckTop:60,cells:[2,2],hole:[13.1,13.7],maxTrunkR:12,collar:[13,30]},ropeLadder:{top:60,frame:'ladder (wall frame on a cell edge, climb from +Z)'},
    treeRail:20,hammock:{span:36,anchorY:30.5,seatY:18},coop:{floorTop:10.9,door:[7,10.9,9.5]},penFence:26,trough:{top:7.8,feedY:6},hideCurtain:[40,48],footprint:{caveBed:[1,2],treePlatform:[2,2],coop:[1,1]}};}
