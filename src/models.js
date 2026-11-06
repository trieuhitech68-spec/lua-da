/* ===================== SB MODELS — low-poly prehistoric survival / crafting / building asset library =====================
   Needs three.js r149 + the K3 kit (helpers.js texCanvas → k3d.js → lights3d.js → char3d.js). Call SBmodelsInit() once K3 is ready → window.SBM.
   Units: K3 design units (du). 1 m ≈ 20 du; the K3.char human ≈ 36 du tall. Building grid cell = 40×40 du.
   Every builder returns a NEW THREE.Group (never baked/merged): origin at ground centre, bottom at y=0, front facing +Z.
   Fire/glow parts live in a child Group named 'flame' (userData.dyn=1 so K3.bake keeps it as a separate node; glow sprites do not self-animate).
   No Math.random: optional `seed` params give deterministic variants (same args → identical model).
   Materials: K3 names / '#rrggbb' colours, plus 'sb*' entries added to K3.MP here (so K3.mat caches & shares them).
   Conventions (see M.meta too):
   - floor/stoneFloor: x,z∈[-20,20], top surface at y=6.
   - walls (wall, wallDoor, wallWindow, stoneWall, stoneWallDoor): x∈[-20,20], z≈[-2,2], height 48, bottom y=0 (engine raises them by 6 onto a floor);
     end posts are centred on x=±20 so collinear and corner walls share a post. Openings are symmetric in z (door/window work from both sides).
   - roof: slab mid-plane runs from (z=+20,y=48) eave to (z=-20,y=78) ridge, 5 du thick, 6.25 du (along slope) overhang past the eave, 1 du past the sides
     (side edges bevelled so neighbouring panels interlock without z-fighting). Two panels back-to-back (second one rotated π about Y, sharing the
     high edge) make a gable. Placed with the same base height as the walls (y=0 = wall bottom).
   - ridge: placed ON THE SHARED HIGH EDGE (same transform as a wall on that edge): log along X centred at y=81, z=0 + crossed ridge sticks.
   - gable: triangular infill above a wall that runs under a roof slope: sits in the wall's own frame (bottom y=48 … apex y=78 at local x=-20).
     The high end is local -X: rotate the piece so -X points towards the ridge (rotating by π about Y flips it).
   - roofCap: 4-sided thatch cap for one cell, eave edge y≈44 at ±26 (≈48 over the wall line), peak y≈77.
   - fence/gate: along X, 40 long, posts at x=±20.  stairs: rise from y=0 at z=+20 to y=54 at z=-20 (one storey: wall 48 + floor 6).
   - bed & leanto footprint 1×2 cells = x∈[-20,20], z∈[-40,40] (head of bed at -Z, lean-to opening faces +Z); tent 2×2 = x,z∈[-40,40].
   - farm: 40×40 plot, top of the furrow mounds at y=3; crops (M.crop) are built from y=0 and should be placed on top (y=3) of a farm piece.
   - tools: grip at origin, handle along +Y, head at the top, blade/edge facing +Z.
   - items: centred on x,z, resting on y=0, ~10–16 du (tool items are the tools laid flat, ~18–20 du long).
   - animals (M.animal): facing +Z, feet at y=0. G.userData.rig = {body, head, legFL, legFR, legBL, legBR, tail}; bird: {body, head, wingL, wingR}.
     Legs are children of the root, pivot at shoulder/hip height (rotation.x swings; +x moves the foot backwards). head/tail are children of body
     (head pivot at the neck: +rotation.x nods down; tail pivot at its root). Wings: pivot at the shoulder, rotation.z flaps. L = -X side (as K3.char).
   - herbs/flowers/beehive: gatherable resources (M.herb(kind), M.flower(color), M.beehive()), bottom at y=0.
   - rocks/boulders sink slightly below y=0 on purpose (so they sit on uneven terrain without floating).
   - M.build('fn:arg:arg') builds any listed key, e.g. 'tree:oak:2', 'piece:wall', 'crop:grain:3', 'item:honey', 'animal:wolf', 'herb:mint'.
*/
function SBmodelsInit(){const K3G=(typeof K3!=='undefined')?K3:window.K3;if(!K3G||!K3G.ok||window.SBM)return;const K=K3G,T=K3G.T;
  const M={};
  const PI=Math.PI,TAU=PI*2,DS=T.DoubleSide;
  /* ---------------- materials (added to K3.MP so K3.mat shares/caches them) ---------------- */
  const MPX={
    sbBark:['#5c4330',.95,0,'wood'],sbOakBark:['#6b4d35',.95,0,'wood'],sbBirch:['#ebe6da',.8,0,null],sbBirchMk:['#2f2a27',.9,0,null],sbDead:['#857565',.95,0,'wood'],
    sbCut:['#dfbb84',.9,0,null],sbRing:['#b88c5a',.9,0,null],sbDry:['#9c7a54',.9,0,'wood'],sbLogA:['#7b5536',.9,0,'wood'],sbLogB:['#684629',.9,0,'wood'],
    sbWoodA:['#9a6e44',.85,0,'wood'],sbWoodB:['#835a38',.85,0,'wood'],sbHandle:['#a47c50',.8,0,'wood'],sbPitch:['#3c2a1e',.9,0,null],
    sbPine:['#2f6337',.9,0,null],sbPine2:['#3a7340',.9,0,null],sbPine3:['#285531',.9,0,null],sbOak:['#4f8b3e',.9,0,null],sbOak2:['#437a36',.9,0,null],sbOak3:['#62a04a',.9,0,null],
    sbBirchLf:['#8ab54e',.9,0,null],sbBirchLf2:['#76a344',.9,0,null],sbBush:['#3e7838',.9,0,null],sbBush2:['#4c8a40',.9,0,null],sbBerryLf:['#3f7d3c',.9,0,null],sbBerryLf2:['#4a8c44',.9,0,null],
    sbMoss:['#5b8238',1,0,null],sbGrass:['#6f9d3e',.9,0,null],sbGrass2:['#88aa48',.9,0,null],sbReed:['#5f8a3c',.9,0,null],sbFrond:['#6d8c3a',1,0,'thatch'],
    sbStoneA:['#9d978d',.92,0,'rock'],sbStoneB:['#7f7a73',.92,0,'rock'],sbFlint:['#55627a',.32,.1,'rock'],sbFlintV:['#c4c2ba',.6,0,null],
    sbOreG:['#3fa07a',.45,.15,null],sbOreO:['#d07a36',.38,.55,null],sbSlate:['#585450',.85,0,null],
    sbClayWet:['#7a4632',.45,0,null],sbClayWet2:['#69402e',.4,0,null],sbPuddle:['#8fa2aa',.04,.2,null],sbSoil:['#6a4a2e',1,0,null],sbSoil2:['#7a5634',1,0,null],sbClayK:['#b4683e',.9,0,null],sbClayD:['#8a4a2c',.9,0,null],
    sbScorch:['#4a2e20',1,0,null],sbAsh:['#5e5853',1,0,null],sbChar:['#2b2420',1,0,null],sbMud:['#a8683e',.9,0,null],
    sbBerry:['#d42b3c',.35,0,null],sbFlaxFl:['#5d84e6',.6,0,null],sbCattail:['#5a3a22',.95,0,null],
    sbCapRed:['#cc3a2c',.6,0,null],sbCapBr:['#8e6040',.8,0,null],sbStem:['#efe7d8',.85,0,null],sbGill:['#e4d4ba',.9,0,null],
    sbBone:['#ece2cc',.75,0,null],sbFiber:['#cfb37a',.95,0,null],sbStraw:['#dcc06c',1,0,'thatch'],sbThatchD:['#a8843f',1,0,'thatch'],
    sbFur:['#7c5839',1,0,null],sbFur2:['#a47e55',1,0,null],sbFurD:['#5a3f28',1,0,null],sbMeat:['#c0483c',.55,0,null],sbFat:['#f0d8c6',.6,0,null],sbCooked:['#8c4c24',.65,0,null],
    sbWeave:['#b88e4e',1,0,'bamboo'],sbGrain:['#e2bd56',.85,0,null],sbGrainG:['#9cb84c',.85,0,null],sbStalk:['#cfae52',.9,0,null],
    sbFish:['#8aa4b8',.4,.2,null],sbFishD:['#4e6478',.5,.1,null],sbGourd:['#c2c45c',.6,0,null],sbCalabash:['#d4a050',.7,0,null],sbGourdG:['#7c9a3a',.8,0,null],sbGourdL:['#5a8a34',.9,0,null],
    sbLeather:['#8e5a30',.75,0,'hide'],sbRope:['#c4a46a',.95,0,null],sbInk:['#22160e',1,0,null],
    sbFlameY:['#ffe48a',.5,0,null,'#ffc23a'],sbEmber:['#ff6a28',.6,0,null,'#ff4010'],sbMolten:['#ffb040',.5,0,null,'#ff6a10']};
  for(const k in MPX)if(!K.MP[k])K.MP[k]=MPX[k];
  /* ---------------- helpers ---------------- */
  const RNG=s=>{let a=(((Math.abs(+s||0)*1000)|0)+1)*2654435761>>>0;return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};};
  const g=(...c)=>K.group(...c);
  const V=(x,y,z)=>new T.Vector3(x,y,z);
  const UP=V(0,1,0);
  // closed cylinder from point a (radius r0) to point b (radius r1)
  const limb=(a,b,r0,r1,m,seg,o)=>{const A=V(a[0],a[1],a[2]),D=V(b[0]-a[0],b[1]-a[1],b[2]-a[2]),L=D.length()||0.001;const ms=K.cyl(r1,r0,L,m,o,seg||5);ms.position.copy(A);ms.quaternion.setFromUnitVectors(UP,D.normalize());return ms;};
  // open-ended cylinder, base at y=0 (for trunks whose ends are hidden)
  const tube=(rt,rb,h,m,o,seg)=>{const ge=new T.CylinderGeometry(rt,rb,h,seg||6,1,true);ge.translate(0,h/2,0);return K.mesh(ge,m,o);};
  const disc=(r,m,o,n)=>{const ge=new T.CircleGeometry(r,n||8);ge.rotateX(-PI/2);return K.mesh(ge,m,o);};
  // disc facing along an axis: ax 'x'|'-x'|'z'|'-z'|'y'|'-y'
  const discA=(r,m,o,n,ax)=>{const ge=new T.CircleGeometry(r,n||8);if(ax==='x')ge.rotateY(PI/2);else if(ax==='-x')ge.rotateY(-PI/2);else if(ax==='-z')ge.rotateY(PI);else if(ax==='y')ge.rotateX(-PI/2);else if(ax==='-y')ge.rotateX(PI/2);return K.mesh(ge,m,o);};
  // triangle soup → one mesh
  function Soup(){this.p=[];}
  Soup.prototype.t=function(a,b,c){this.p.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);return this;};
  Soup.prototype.q=function(a,b,c,d){return this.t(a,b,c).t(a,c,d);};
  Soup.prototype.o=function(a,b,c,ct){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
    const mx=(a[0]+b[0]+c[0])/3-ct[0],my=(a[1]+b[1]+c[1])/3-ct[1],mz=(a[2]+b[2]+c[2])/3-ct[2];return nx*mx+ny*my+nz*mz>=0?this.t(a,b,c):this.t(a,c,b);};
  Soup.prototype.n=function(){return this.p.length/9;};
  Soup.prototype.mesh=function(m,o){const ge=new T.BufferGeometry();ge.setAttribute('position',new T.Float32BufferAttribute(this.p,3));return K.mesh(ge,m,o);};
  // radial jitter of unique vertices (keeps shapes watertight); ya scales the jitter of y
  const jitR=(ge,amt,seed,ya)=>{const R=RNG(seed),p=ge.attributes.position,mp={};for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=Math.round(x*100)+'_'+Math.round(y*100)+'_'+Math.round(z*100);
      if(!mp[k])mp[k]=1+(R()-.5)*amt;const f=mp[k];p.setXYZ(i,x*f,y*(ya===undefined?f:1+(f-1)*ya),z*f);}p.needsUpdate=true;return ge;};
  // leafy / lumpy blob: jittered dodecahedron (36 tris) | det 0 → icosahedron (20) | det 1 → ico det1 (80)
  const blob=(r,m,o,seed,amt,det)=>K.mesh(jitR(det===1?new T.IcosahedronGeometry(r,1):det===0?new T.IcosahedronGeometry(r,0):new T.DodecahedronGeometry(r,0),amt===undefined?0.26:amt,seed||1),m,o);
  // closed low-poly cone (2n tris) with jittered rim and leaning apex; base at y=0
  const coneM=(r,h,m,o,n,R,jr,jy,lean)=>{n=n||7;const S=new Soup(),rim=[];let cy=0;
    for(let i=0;i<n;i++){const a=(i+(R?(R()-.5)*0.35:0))/n*TAU,f=1+(R?(R()-.5)*(jr||0):0),y=R?(R()-.5)*(jy||0):0;rim.push([Math.cos(a)*r*f,y,-Math.sin(a)*r*f]);cy+=y/n;}
    const ap=[lean?lean[0]:0,h,lean?lean[1]:0],c=[0,cy,0];for(let i=0;i<n;i++){const A=rim[i],B=rim[(i+1)%n];S.t(ap,A,B);S.t(c,B,A);}return S.mesh(m,o);};
  // double pyramid a→b (n sides, radius r at fraction mid, flattened by fl along `ref`)
  const spindle=(S,a,b,r,n,fl,mid,ref)=>{const A=V(a[0],a[1],a[2]),d=V(b[0]-a[0],b[1]-a[1],b[2]-a[2]),L=d.length();d.normalize();const rf=ref?V(ref[0],ref[1],ref[2]):V(0,0,1);let u=rf.clone().cross(d);if(u.lengthSq()<1e-6)u=V(1,0,0).cross(d);if(u.lengthSq()<1e-6)u=V(0,1,0).cross(d);u.normalize();
    const v=d.clone().cross(u).normalize(),C=A.clone().addScaledVector(d,L*(mid===undefined?0.4:mid)),P=[];for(let i=0;i<n;i++){const t=i/n*TAU;P.push(C.clone().addScaledVector(u,Math.cos(t)*r).addScaledVector(v,Math.sin(t)*r*(fl||1)).toArray());}
    const ct=C.toArray();for(let i=0;i<n;i++){const p=P[i],q=P[(i+1)%n];S.o(b,p,q,ct);S.o(a,q,p,ct);}return S;};
  // grass blade: base centre (x,z), height h, width w, tip lean (lx,lz), blade facing angle a; seg 1 → single triangle, else 3 tris (bent)
  const blade=(S,x,z,h,w,lx,lz,a,y0,seg)=>{y0=y0||0;const c=Math.cos(a||0)*w/2,s=Math.sin(a||0)*w/2,b1=[x-c,y0,z+s],b2=[x+c,y0,z-s],tp=[x+lx,y0+h,z+lz];
    if(seg===1){S.t(b1,b2,tp);return S;}const mx=x+lx*0.3,mz=z+lz*0.3,my=y0+h*0.55,m1=[mx-c*0.62,my,mz+s*0.62],m2=[mx+c*0.62,my,mz-s*0.62];S.q(b1,b2,m2,m1);S.t(m1,m2,tp);return S;};
  // star flower (n petals) centred at c, tilted `tilt` towards azimuth az
  const flower=(S,c,r,n,tilt,az,inner)=>{const N=V(Math.sin(tilt)*Math.cos(az),Math.cos(tilt),-Math.sin(tilt)*Math.sin(az)).normalize();let u=V(0,0,1).cross(N);if(u.lengthSq()<1e-4)u=V(1,0,0);u.normalize();const v=N.clone().cross(u);
    const P=[];for(let i=0;i<n*2;i++){const t=i/(n*2)*TAU,rr=i%2?r*(inner||0.55):r;P.push([c[0]+(u.x*Math.cos(t)+v.x*Math.sin(t))*rr,c[1]+(u.y*Math.cos(t)+v.y*Math.sin(t))*rr,c[2]+(u.z*Math.cos(t)+v.z*Math.sin(t))*rr]);}
    for(let i=0;i<n*2;i++)S.t(c,P[i],P[(i+1)%(n*2)]);return S;};
  // flat leaf fan (n tris) centred at c, tilted towards azimuth az; centre cupped down
  const fan=(S,c,r,n,tilt,az,R,cup)=>{const N=V(Math.sin(tilt)*Math.cos(az),Math.cos(tilt),-Math.sin(tilt)*Math.sin(az)).normalize();let u=V(-Math.sin(az),0,-Math.cos(az));const v=N.clone().cross(u).normalize();u=v.clone().cross(N).normalize();
    const P=[];for(let i=0;i<n;i++){const t=i/n*TAU,rr=r*(i%2?0.8:1)*(R?0.88+R()*0.24:1);P.push([c[0]+(u.x*Math.cos(t)+v.x*Math.sin(t))*rr,c[1]+(u.y*Math.cos(t)+v.y*Math.sin(t))*rr,c[2]+(u.z*Math.cos(t)+v.z*Math.sin(t))*rr]);}
    const k=r*(cup===undefined?0.18:cup),cc=[c[0]-N.x*k,c[1]-N.y*k,c[2]-N.z*k];for(let i=0;i<n;i++)S.t(cc,P[i],P[(i+1)%n]);return S;};
  // flat dark marks on the faces of an n-gon trunk (CylinderGeometry orientation), radius r0 at y=0 → r1 at y=h
  const barkMarks=(S,R,nseg,cnt,r0,r1,h,ya,yb,big)=>{const ca=Math.cos(PI/nseg),sa=Math.sin(PI/nseg);for(let i=0;i<cnt;i++){const y=ya+(yb-ya)*R(),k=Math.floor(R()*nseg),th=(2*k+1)*PI/nseg,nx=Math.sin(th),nz=Math.cos(th),rr=r0+(r1-r0)*y/h,d=rr*ca+0.07,fw=2*rr*sa;
      const w=fw*(big?0.5+R()*0.35:0.3+R()*0.45),hh=big?1.1+R()*1.5:0.4+R()*0.55,off=(R()-.5)*(fw-w)*0.8,tx=nz,tz=-nx,px=nx*d+tx*off,pz=nz*d+tz*off,ct=[0,y,0];
      const A=[px-tx*w/2,y-hh/2,pz-tz*w/2],B=[px+tx*w/2,y-hh/2,pz+tz*w/2],C=[px+tx*w/2,y+hh/2,pz+tz*w/2],D=[px-tx*w/2,y+hh/2,pz-tz*w/2];S.o(A,B,C,ct);S.o(A,C,D,ct);}return S;};
  const oct=(r,m,o)=>K.mesh(new T.OctahedronGeometry(r,0),m,o);
  // flame group (child named 'flame'): orange tongues + yellow core + non-pulsing glow sprite
  function flame(s,o,seed){o=o||{};const F=g(),R=RNG(seed||5),y=o.y||0;F.name='flame';F.userData.dyn=1;
    F.add(coneM(4.2*s,14*s,'fire',{y,noShadow:true,mo:{ei:1.8}},6,R,0.35,0.8*s,[0.5*s,-0.3*s]));
    F.add(coneM(2.8*s,9.5*s,'fire',{x:2.7*s,y,z:1.1*s,noShadow:true,mo:{ei:1.8}},5,R,0.3,0.5*s,[1.5*s,0.4*s]));
    F.add(coneM(2.5*s,8.5*s,'fire',{x:-2.5*s,y,z:-0.9*s,noShadow:true,mo:{ei:1.8}},5,R,0.3,0.5*s,[-1.4*s,-0.4*s]));
    F.add(coneM(2.3*s,7*s,'sbFlameY',{x:0.3*s,y:y-0.1,z:2.3*s,noShadow:true,mo:{ei:1.5}},5,R,0.3,0.3*s,[0,0.4*s]));
    if(o.glow!==0)F.add(K.glow(o.gc||'#ff9a40',o.glow||46,{y:y+7*s,op:o.op||0.75},false));
    if(o.x||o.z){F.position.x=o.x||0;F.position.z=o.z||0;}return F;}
  // centre an object on x/z and rest it on y=0 (meshes only)
  const bbox=(G)=>{G.updateMatrixWorld(true);const b=new T.Box3(),v=V(0,0,0);G.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)b.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});return b;};
  const rest=(G)=>{const b=bbox(G),c=b.getCenter(V(0,0,0));G.position.x-=c.x;G.position.z-=c.z;G.position.y-=b.min.y;return g(G);};

  /* ======================================== A. RESOURCES ======================================== */
  const TRK={pine:6,oak:7,birch:4.5,dead:5.5},BARK={pine:'sbBark',oak:'sbOakBark',birch:'sbBirch',dead:'sbDead'};
  function pineTree(H,R0,n,seed){const R=RNG(seed*31+7),G=g();
    G.add(tube(Math.max(0.35,R0*0.2),R0,H*0.84,'sbBark',{},7));
    if(H>40)G.add(tube(R0*0.96,R0*1.4,Math.max(2,H*0.035),'sbBark',{},7));
    const cols=['sbPine3','sbPine','sbPine2'];
    for(let i=0;i<n;i++){const t=n>1?i/(n-1):0,y=H*(0.16+0.6*t),r=H*(0.215-0.14*t)*(0.93+R()*0.14),h=i===n-1?H-y:H*(0.31-0.05*t);
      G.add(K.at(coneM(r,h,cols[i%3],{},8,R,0.26,r*0.16,[(R()-.5)*r*0.1,(R()-.5)*r*0.1]),{x:(R()-.5)*r*0.07,y,z:(R()-.5)*r*0.07,ry:R()*TAU}));}
    return G;}
  const OAKC=[[0,.74,0,.245,1],[-.225,.635,.06,.175,0],[.215,.645,-.04,.18,0],[.04,.615,.2,.16,0],[-.055,.68,-.195,.168,2],[.1,.855,.06,.15,2]],OAKM=['sbOak2','sbOak','sbOak3'];
  function oakTree(H,R0,full,seed){const R=RNG(seed*17+3),G=g(),th=H*0.5,sp=full?1:0.85,ks=full?1:1.12;
    G.add(tube(R0*0.5,R0,th,'sbOakBark',{},7));G.add(tube(R0*0.95,R0*1.45,Math.max(1.5,H*0.04),'sbOakBark',{},7));
    (full?OAKC:[OAKC[0],OAKC[1],OAKC[2],OAKC[3]]).forEach((b,i)=>{const x=b[0]*H*sp,y=b[1]*H,z=b[2]*H*sp,r=b[3]*H*ks*(0.94+R()*0.12);
      G.add(blob(r,OAKM[b[4]],{x,y,z,sx:1.08,sy:0.86,sz:1.08,ry:R()*TAU},seed*13+i,0.28));
      if(i>=1&&i<=3)G.add(limb([0,th*0.86,0],[x*0.7,y*0.86,z*0.7],R0*0.42,R0*0.2,'sbOakBark',5));});
    return G;}
  const BIRC=[[-.06,.44,.03,.07,1.3],[.08,.55,-.03,.1,1.2],[-.05,.66,-.04,.11,1.25],[.05,.77,.04,.105,1.2],[0,.88,0,.09,1.4],[.09,.4,.07,.065,1.1]];
  function birchTree(H,R0,full,seed){const R=RNG(seed*13+5),G=g(),th=H*0.93,r1=R0*0.28,ks=full?1:1.25;
    G.add(tube(r1,R0,th,'sbBirch',{},6));
    const S=new Soup();barkMarks(S,R,6,full?16:9,R0,r1,th,2,th*0.8,false);barkMarks(S,R,6,full?4:2,R0,r1,th,1,th*0.18,true);G.add(S.mesh('sbBirchMk'));
    (full?BIRC:[BIRC[0],BIRC[1],BIRC[2],BIRC[4]]).forEach((b,i)=>{const x=b[0]*H,y=b[1]*H,z=b[2]*H,r=b[3]*H*ks*(0.92+R()*0.16);
      G.add(blob(r,i%2?'sbBirchLf2':'sbBirchLf',{x,y,z,sy:b[4]*0.85,ry:R()*TAU},seed*7+i,0.3));
      if(i<3)G.add(limb([x*0.08,y-r*0.9,z*0.08],[x*0.8,y-r*0.1,z*0.8],Math.max(0.3,R0*0.2),0.22,'sbBirchMk',4));});
    return G;}
  function deadTree(H,R0,nb,seed){const R=RNG(seed*7+1),G=g(),th=H*0.8;
    G.add(K.cyl(R0*0.26,R0,th,'sbDead',{},6));if(H>30)G.add(tube(R0*0.96,R0*1.45,Math.max(1.5,H*0.04),'sbDead',{},6));
    G.add(coneM(R0*0.32,H*0.07+1,'sbDead',{y:th-0.6},4,R,0.4,0,[R0*0.2,0]));
    for(let i=0;i<nb;i++){const f=0.36+0.5*(nb>1?i/(nb-1):0.5)+(R()-.5)*0.05,y=th*f,a=i*2.4+R()*0.7,rr=R0*(1-0.74*f),len=H*(0.36-0.2*f)*(0.8+R()*0.4),up=0.45+R()*0.7,d=V(Math.cos(a),up,-Math.sin(a)).normalize();
      const p0=[Math.cos(a)*rr*0.4,y,-Math.sin(a)*rr*0.4],p1=[p0[0]+d.x*len,y+d.y*len,p0[2]+d.z*len];G.add(limb(p0,p1,rr*0.55,Math.max(0.25,rr*0.12),'sbDead',5));
      if(H>60&&R()<0.8){const k=0.55+R()*0.15,q=[p0[0]+d.x*len*k,y+d.y*len*k,p0[2]+d.z*len*k],a2=a+(R()<.5?-1:1)*(0.5+R()*0.6),d2=V(Math.cos(a2),up+0.6,-Math.sin(a2)).normalize(),l2=len*0.5;
        G.add(limb(q,[q[0]+d2.x*l2,q[1]+d2.y*l2,q[2]+d2.z*l2],rr*0.25,0.2,'sbDead',4));}}
    return G;}
  function sapling(seed,bark,leaves){const R=RNG(seed*5+2),G=g();G.add(tube(0.35,0.75,16,bark,{},5));G.add(limb([0,9,0],[3.6,14,0.6],0.4,0.25,bark,4));
    [[0,19,0,5.2],[3.9,15,1,3.9],[-3.1,15.6,-1.6,3.6]].forEach((b,i)=>G.add(blob(b[3],leaves[i%leaves.length],{x:b[0],y:b[1],z:b[2],sy:0.85,ry:R()*TAU},seed*3+i,0.3)));return G;}
  M.tree=(kind,stage,seed)=>{kind=TRK[kind]?kind:'pine';stage=stage===undefined?2:Math.max(0,Math.min(2,stage|0));seed=+seed||1;let G;
    if(kind==='pine')G=stage===0?pineTree(25,0.9,3,seed):stage===1?pineTree(80,2.8,4,seed):pineTree(180,6,5,seed);
    else if(kind==='oak')G=stage===0?sapling(seed,'sbOakBark',['sbOak','sbOak3']):stage===1?oakTree(80,3,false,seed):oakTree(150,7,true,seed);
    else if(kind==='birch')G=stage===0?sapling(seed,'sbBirch',['sbBirchLf','sbBirchLf2']):stage===1?birchTree(80,2.3,false,seed):birchTree(160,4.5,true,seed);
    else G=stage===0?deadTree(25,0.9,2,seed):stage===1?deadTree(70,3,4,seed):deadTree(130,5.5,6,seed);
    return G;};
  M.stump=(kind,seed)=>{kind=TRK[kind]?kind:'pine';const r=TRK[kind],bark=BARK[kind],R=RNG((+seed||1)*19+r),G=g(),h=10;
    G.add(K.cyl(r*0.97,r*1.1,h,bark,{},8));
    G.add(disc(r*0.9,'sbCut',{y:h+0.06},8),disc(r*0.64,'sbRing',{y:h+0.18},8),disc(r*0.52,'sbCut',{y:h+0.3},8),disc(r*0.2,'sbRing',{y:h+0.42},6));
    for(let i=0;i<4;i++){const a=i/4*TAU+R()*0.9+0.3;G.add(limb([Math.cos(a)*r*0.75,h*0.32,-Math.sin(a)*r*0.75],[Math.cos(a)*r*1.75,0,-Math.sin(a)*r*1.75],r*0.36,r*0.12,bark,5));}
    for(let i=0;i<3;i++){const a=R()*TAU,d=r*1.7+R()*5;G.add(K.box(1.8+R(),0.5,1.1,'sbCut',{x:Math.cos(a)*d,z:-Math.sin(a)*d,ry:R()*3}));}
    if(kind==='birch'){const S=new Soup();barkMarks(S,R,8,6,r*1.1,r*0.97,h,1,h-1.5,true);G.add(S.mesh('sbBirchMk'));}
    return G;};
  M.log=(seed)=>{const R=RNG((+seed||1)*23+1),G=g();
    G.add(limb([-35,6,0],[35,5.3,0],6,5.3,'sbBark',8));
    G.add(discA(5,'sbCut',{x:35.08,y:5.3},8,'x'),discA(3.3,'sbRing',{x:35.16,y:5.3},8,'x'),discA(1.3,'sbCut',{x:35.24,y:5.3},6,'x'));
    G.add(discA(4.4,'sbScorch',{x:-35.08,y:6},8,'-x'));
    for(let i=0;i<4;i++){const a=i/4*TAU+0.4;G.add(K.at(coneM(1.6,4+R()*3,'sbCut',{},3,R,0.3,0),{x:-35,y:6+Math.sin(a)*4.4,z:Math.cos(a)*4.4,rz:PI/2}));}
    G.add(limb([6,9.5,-2],[11,19,-8],1.9,1.1,'sbBark',5),limb([-12,8,3],[-17,10,13],1.6,1.0,'sbBark',5));
    G.add(blob(6.5,'sbMoss',{x:-6,y:10.6,z:0.5,sx:1.6,sy:0.32,sz:0.9},(+seed||1)*3,0.3));
    G.add(K.cyl(2.5,2.7,0.8,'sbCapBr',{x:14,y:5.2,z:5.5,rx:0.25},6),K.cyl(1.8,2,0.7,'sbCapBr',{x:17,y:3.6,z:5.2,rx:0.25},6));
    return G;};
  const BUSHB={berry:[[0,11,0,11,0],[-8,8,4,8,1],[8,8,-3,8.5,1],[2,7.5,8,7.5,0],[-3,8.5,-8,8,0]],shrub:[[0,10.5,0,10.5,0],[-8.5,7,3,8,1],[8,7.5,-3.5,8.5,0],[3,6.5,8,7,1],[-4,7.5,-8,7.5,1],[4,15.5,2,6.5,1]]};
  M.bush=(kind,seed)=>{kind=kind==='berryEmpty'||kind==='shrub'?kind:'berry';seed=+seed||1;const R=RNG(seed*11+kind.length),G=g(),sh=kind==='shrub',BL=BUSHB[sh?'shrub':'berry'],LM=sh?['sbBush','sbBush2']:['sbBerryLf','sbBerryLf2'];
    BL.forEach((b,i)=>G.add(blob(b[3],LM[b[4]],{x:b[0],y:b[1]-0.7,z:b[2],sy:0.88,ry:R()*TAU},seed*7+i+(sh?50:0),0.3)));
    if(kind==='berry'){const DIR=[[0.35,0.75,0.55],[-0.65,0.45,0.6],[0.85,0.35,-0.2],[-0.25,0.55,-0.8],[0.55,0.25,0.75],[-0.85,0.3,-0.3],[0.1,0.95,-0.25]],BI=[0,1,2,4,3,1,0];
      DIR.forEach((d,i)=>{const b=BL[BI[i]],v=V(d[0],d[1],d[2]).normalize(),cx=b[0]+v.x*b[3]*1.0,cy=b[1]-0.7+v.y*b[3]*0.88,cz=b[2]+v.z*b[3]*1.0,t1=V(-v.z,0,v.x).normalize(),t2=v.clone().cross(t1);
        [[0,0],[1.4,-0.5],[-0.6,-1.3]].forEach((o,k)=>{if(i>4&&k===2)return;G.add(oct(1.35,'sbBerry',{x:cx+t1.x*o[0]+t2.x*o[1],y:cy+t1.y*o[0]+t2.y*o[1],z:cz+t1.z*o[0]+t2.z*o[1],ry:k}));});});}
    if(sh){[[5,0.6,4],[-4,0.7,-5]].forEach(([x,u,z],i)=>G.add(limb([x*0.4,8,z*0.4],[x*1.9,19+i*2,z*1.9],0.45,0.2,'sbDry',4)));}
    return G;};
  M.flax=(seed)=>{seed=+seed||1;const R=RNG(seed*29+3),G=g(),S=new Soup(),St=new Soup(),F=new Soup();
    for(let i=0;i<15;i++){const a=R()*TAU,d=R()*3.8,x=Math.cos(a)*d,z=-Math.sin(a)*d,h=12+R()*8,la=a+(R()-.5)*0.8,ln=1.5+R()*4;blade(S,x,z,h,1.0+R()*0.5,Math.cos(la)*ln,-Math.sin(la)*ln,R()*PI);}
    for(let i=0;i<7;i++){const a=i/7*TAU+R()*0.5,d=1+R()*2.5,x=Math.cos(a)*d,z=-Math.sin(a)*d,h=18+R()*4,lk=1.5+R()*2.5,lx=Math.cos(a)*lk,lz=-Math.sin(a)*lk;
      blade(St,x,z,h,0.55,lx,lz,R()*PI,0,1);flower(F,[x+lx,h+0.15,z+lz],1.8,5,0.45,a,0.6);}
    G.add(S.mesh('sbGrass',{mo:{side:DS}}),St.mesh('sbGrass2',{mo:{side:DS}}),F.mesh('sbFlaxFl',{mo:{side:DS}}));return G;};
  M.reeds=(seed)=>{seed=+seed||1;const R=RNG(seed*37+5),G=g(),S=new Soup(),S2=new Soup();
    for(let i=0;i<18;i++){const a=R()*TAU,d=R()*5,x=Math.cos(a)*d,z=-Math.sin(a)*d,h=17+R()*13,la=a+(R()-.5)*0.6,ln=1+R()*5;blade(i%3?S:S2,x,z,h,1.3+R()*0.6,Math.cos(la)*ln,-Math.sin(la)*ln,R()*PI);}
    for(let i=0;i<4;i++){const a=i/4*TAU+0.6+R()*0.5,d=1.2+R()*2.5,x=Math.cos(a)*d,z=-Math.sin(a)*d,hh=18+R()*5,lx=(R()-.5)*1.6,lz=(R()-.5)*1.6;
      blade(S2,x,z,hh,0.6,lx,lz,R()*PI,0,1);G.add(K.cyl(1.25,1.3,6,'sbCattail',{x:x+lx,y:hh-1,z:z+lz},6));blade(S2,x+lx,z+lz,3.2,0.35,0,0,R()*PI,hh+5,1);}
    G.add(S.mesh('sbReed',{mo:{side:DS}}),S2.mesh('sbGrass',{mo:{side:DS}}));return G;};
  M.boulder=(size,seed)=>{size=Math.max(1,Math.min(3,(+size||2)|0));seed=+seed||1;const R=RNG(seed*41+size*7),G=g(),D=[22,38,60][size-1],r=D*0.41;
    G.add(K.ico(r,'rock',{y:r*0.5,sx:1.1,sz:0.94,ry:R()*TAU},1,0.3,seed*5+size));
    [[0.05,-0.08,0.58,0.74],[-0.3,0.25,0.3,0.6]].forEach(([mx,mz,mr,my],i)=>G.add(blob(r*mr,'sbMoss',{x:r*mx,y:r*0.5+r*my,z:r*mz,sx:1.2,sy:0.17,ry:R()*3},seed*3+size+i,0.45,0)));
    if(size>=2)G.add(K.ico(r*0.42,'sbStoneB',{x:r*0.98,y:r*0.16,z:r*0.42,ry:R()*3},1,0.32,seed*5+size+11));
    if(size>=3){G.add(K.ico(r*0.3,'rock',{x:-r*0.95,y:r*0.1,z:r*0.5,ry:R()*3},0,0.3,seed+29));G.add(K.ico(r*0.14,'sbStoneB',{x:-r*0.5,y:r*0.05,z:r*1.05},0,0.3,seed+31));}
    return G;};
  M.flintRock=(seed)=>{seed=+seed||1;const R=RNG(seed*43+3),G=g();
    G.add(K.ico(11,'sbFlint',{y:6.5,sx:1.15,sz:0.92,ry:R()*3},1,0.36,seed*7+1));
    [[0.5,0.3,0.12],[-0.35,1.9,0.1]].forEach(([rz,ry,t],i)=>G.add(K.ico(10.6,'sbFlintV',{y:6.6,sx:1.12,sy:t,sz:0.9,rz,ry},1,0.08,seed*7+2+i)));
    G.add(K.ico(6.5,'sbFlint',{x:10,y:3.2,z:5,ry:1},0,0.42,seed*7+3),K.ico(4.2,'sbFlint',{x:-9.5,y:1.8,z:6},0,0.45,seed*7+4));
    for(let i=0;i<3;i++){const a=R()*TAU,d=12+R()*4;G.add(oct(1.4,'sbFlint',{x:Math.cos(a)*d,y:0.3,z:-Math.sin(a)*d,sy:0.35,ry:R()*3}));}
    return G;};
  M.copperRock=(seed)=>{seed=+seed||1;const R=RNG(seed*47+9),G=g(),r=12.5;
    G.add(K.ico(r,'rock',{y:r*0.55,sx:1.12,ry:R()*3},1,0.3,seed*9+1));G.add(K.ico(6.5,'sbStoneB',{x:11.5,y:3,z:4.5},1,0.3,seed*9+2));
    [[0.3,0.7,0.65,'sbOreG',3],[-0.7,0.4,0.6,'sbOreO',2.8],[0.8,0.45,-0.3,'sbOreO',3.2],[-0.2,0.85,-0.5,'sbOreG',2.6],[0.55,0.2,0.8,'sbOreO',2.4],[-0.75,0.25,-0.6,'sbOreG',2.6],[0.05,0.98,0.1,'sbOreO',2.2]].forEach((o,i)=>{
      const v=V(o[0],o[1],o[2]).normalize();G.add(K.ico(o[4],o[3],{x:v.x*r*1.12*0.95,y:r*0.55+v.y*r*0.85*0.95,z:v.z*r*0.95,ry:i},0,0.35,seed*3+i));});
    return G;};
  M.clay=(seed)=>{seed=+seed||1;const R=RNG(seed*53+1),G=g();
    const ge=new T.SphereGeometry(15,11,4,0,TAU,0,PI/2);jitR(ge,0.1,seed*5,0.4);G.add(K.mesh(ge,'sbClayWet',{x:-2,sy:0.4,sz:0.8}));
    const g2=new T.SphereGeometry(8,7,3,0,TAU,0,PI/2);jitR(g2,0.2,seed*5+3,0.5);G.add(K.mesh(g2,'sbClayWet2',{x:9,z:-3,sy:0.55}));
    const pd=new T.CircleGeometry(5.5,9);pd.rotateX(-PI/2);jitR(pd,0.3,seed*5+1);G.add(K.mesh(pd,'sbPuddle',{x:10,y:0.2,z:9}));
    [[-14,3,'sbClayWet',2.6],[13,-6,'clay',2.2],[-6,12,'sbClayWet',1.8]].forEach(([x,z,m,r],i)=>G.add(K.ico(r,m,{x,y:r*0.4,z,sy:0.7,ry:R()*3},0,0.3,seed+i)));
    return G;};
  const shroom=(G,x,z,h,r,cap,dots)=>{const nd=dots===true?5:dots|0;G.add(K.cyl(r*0.26,r*0.34,h,'sbStem',{x,z},5));G.add(K.dome(r,cap,{x,y:h-0.2,z,sy:0.68},7));
    const gd=new T.CircleGeometry(r*0.96,7);gd.rotateX(PI/2);G.add(K.mesh(gd,'sbGill',{x,y:h-0.25,z}));
    [[0.45,0.3],[0.95,1.9],[0.9,3.6],[1.0,5.0],[0.5,4.2]].slice(0,nd).forEach(([p,a])=>G.add(oct(r*0.17,'sbStem',{x:x+Math.sin(p)*Math.cos(a)*r,y:h-0.2+Math.cos(p)*r*0.68,z:z-Math.sin(p)*Math.sin(a)*r,sy:0.5})));};
  M.mushroom=(kind)=>{const G=g();if(kind==='brown'){shroom(G,0,0,4.5,3.2,'sbCapBr',false);shroom(G,3.6,1.6,3.2,2.4,'sbCapBr',false);shroom(G,-2.7,2.4,2.4,1.8,'sbCapBr',false);}
    else{shroom(G,0,0,5,4.2,'sbCapRed',true);shroom(G,4.6,2.6,3,2.4,'sbCapRed',true);}return G;};
  M.pebble=(seed)=>{seed=+seed||1;const R=RNG(seed*59+2),G=g();[[0,0,2.2,'sbStoneA'],[2.9,1.4,1.6,'sbStoneB'],[-2.4,1.9,1.3,'sbStoneA'],[1,-2.5,1.1,'sbStoneB']].forEach((p,i)=>{if(i===3&&seed%2===0)return;
    G.add(K.ico(p[2],p[3],{x:p[0],y:p[2]*0.42,z:p[1],sy:0.75,ry:R()*3},0,0.35,seed*4+i));});return G;};
  M.stick=()=>g(limb([-9,0.75,0.5],[9,0.6,-0.8],0.75,0.5,'sbDry',5),limb([2.5,0.72,-0.1],[7.5,0.55,4.5],0.5,0.3,'sbDry',5),limb([-3.5,0.74,0.25],[-6.8,0.5,-3],0.42,0.28,'sbDry',4));
  const bone=(G,a,b,r)=>{G.add(limb(a,b,r,r*0.85,'sbBone',5));const d=V(b[0]-a[0],0,b[2]-a[2]).normalize(),px=-d.z,pz=d.x;[a,b].forEach(p=>[-1,1].forEach(s=>G.add(K.ico(r*1.3,'sbBone',{x:p[0]+px*s*r*0.75,y:p[1],z:p[2]+pz*s*r*0.75},0,0.15,3))));};
  M.bones=()=>{const G=g();bone(G,[-7,0.9,-1.5],[3,0.9,2.5],0.8);
    G.add(K.mesh(new T.TorusGeometry(4.2,0.45,3,6,2.2),'sbBone',{x:-1,y:0.45,z:-4.5,rx:-PI/2,rz:0.6}));
    G.add(K.ico(3.1,'sbBone',{x:5.5,y:2.4,z:-1.5,sx:0.95,sy:0.8,sz:1.2,ry:0.6},0,0.12,5),K.box(2.6,1.9,4.4,'sbBone',{x:7.1,y:0.6,z:1.2,ry:0.6}));
    G.add(K.box(1.2,1.1,0.6,'sbInk',{x:4.6,y:2.9,z:0.6,ry:0.6}),K.box(1.2,1.1,0.6,'sbInk',{x:6.9,y:2.9,z:-0.9,ry:0.6}));
    G.add(K.cone(0.8,3.4,'sbBone',{x:3.6,y:3.6,z:-2.2,rz:0.9,ry:0.6},4),K.cone(0.8,3.4,'sbBone',{x:7.2,y:3.6,z:-4.6,rz:-0.9,ry:0.6},4));
    return G;};

  /* ======================================== B. BUILDING PIECES ======================================== */
  // horizontal hexagonal log along X (flat front/back), squashed in z to fit a 4 du wall
  const logX=(x0,x1,y,m,r,z,sz)=>K.mesh(new T.CylinderGeometry(r,r,x1-x0,6,1,true,PI/6),m,{rz:PI/2,x:(x0+x1)/2,y,z:z||0,sz:sz||0.7});
  function logWall(open){const G=g(),r=3,mats=['sbLogA','sbLogB'];
    for(let i=0;i<8;i++){const y=r+i*2*r,y0=y-r,y1=y+r;let segs=[[-20,20]];
      (open||[]).forEach(o=>{if(y1>o[2]+0.01&&y0<o[3]-0.01){const ns=[];segs.forEach(s=>{if(o[0]>s[0])ns.push([s[0],Math.min(s[1],o[0])]);if(o[1]<s[1])ns.push([Math.max(s[0],o[1]),s[1]]);});segs=ns;}});
      segs.forEach(s=>{if(s[1]-s[0]>0.5)G.add(logX(s[0],s[1],y,mats[(i+(s[0]<-1?0:1))%2],r));});}
    [-20,20].forEach(x=>G.add(K.cyl(3,3.3,48.5,'sbLogB',{x},6)));return G;}
  const curtain=(G)=>{G.add(K.box(10,30.5,0.7,'hide',{x:-3,y:3.2,z:0.3}),K.box(3.2,30.5,1.8,'hide',{x:5.6,y:3.2,z:0.3}));};
  function wallDoor(){const G=logWall([[-10,10,0,34]]);[-10,10].forEach(x=>G.add(K.cyl(2.2,2.4,34.5,'sbLogB',{x},5)));G.add(K.box(24,3.2,5.4,'sbWoodB',{y:33.6}));curtain(G);return G;}
  function wallWindow(){const G=logWall([[-8.5,8.5,18,36]]);[-8.5,8.5].forEach(x=>G.add(K.box(3,18,5,'sbWoodB',{x,y:18})));
    G.add(K.box(21,3,5.6,'sbWoodB',{y:18}),K.box(21,3,5.6,'sbWoodB',{y:33}));G.add(K.mesh(new T.CylinderGeometry(1.5,1.5,15,5),'hide',{rz:PI/2,y:34.6,z:3.6}));return G;}
  function stoneWall(door){const G=g(),R=RNG(door?7:3),body=(x0,x1,y0,y1)=>G.add(K.box(x1-x0,y1-y0,4.4,'stone',{x:(x0+x1)/2,y:y0}));
    if(door){body(-20,-10.5,0,45);body(10.5,20,0,45);body(-10.5,10.5,36,45);G.add(K.box(10,4,6,'dstone',{x:-15.5}),K.box(10,4,6,'dstone',{x:15.5}));}
    else{body(-20,20,0,45);G.add(K.box(40,4,6,'dstone',{}));}
    [[-15,10.6],[-4.6,10.2],[5.4,9.8],[15.2,10.4]].forEach(([x,w],i)=>G.add(K.box(w,3.2,5.8,i%2?'sbStoneB':'dstone',{x,y:44.8,ry:(R()-.5)*0.06})));
    [-20,20].forEach(x=>G.add(K.box(6.6,48.5,6.6,'dstone',{x})));
    if(door){[-1,1].forEach(d=>G.add(K.box(2.6,34,5.6,'sbStoneB',{x:d*9.3})));G.add(K.box(23,4.2,6,'dstone',{y:34}));curtain(G);}
    (door?[[-14,9,1],[14,26,-1],[-14.5,30,-1],[13,12,1]]:[[-11,10,1],[6,22,1],[-4,33,-1],[12,9,-1],[-12,27,1],[3,13,-1]]).forEach(([x,y,d],i)=>G.add(K.box(5+R()*2,3+R()*0.8,0.8,'sbStoneB',{x,y,z:d*2.4})));
    return G;}
  const SL=Math.atan2(30,40);// roof pitch (36.87°): rise 30 over 40
  function roofPanel(){const G=g(),P=(x,s,k)=>[x,48+s*0.6+k*0.8,20-s*0.8+k*0.6],s0=-6.25,s1=52,t=2.5,pr=[[-19.6,t],[19.6,t],[21,0],[19.6,-t],[-19.6,-t],[-21,0]],S=new Soup(),ct=P(0,(s0+s1)/2,0);
    for(let i=0;i<6;i++){const a=pr[i],b=pr[(i+1)%6];S.o(P(a[0],s0,a[1]),P(b[0],s0,b[1]),P(b[0],s1,b[1]),ct);S.o(P(a[0],s0,a[1]),P(b[0],s1,b[1]),P(a[0],s1,a[1]),ct);}
    [s0,s1].forEach(s=>{const c=P(0,s,0);for(let i=0;i<6;i++){const a=pr[i],b=pr[(i+1)%6];S.o(c,P(a[0],s,a[1]),P(b[0],s,b[1]),ct);}});
    G.add(S.mesh('thatch'));
    [11,25,39].forEach(s=>{const p=P(0,s,t+0.3);G.add(K.box(40,1.1,2.6,'sbThatchD',{center:true,y:p[1],z:p[2],rx:SL}));});
    const e=P(0,s0+1.4,0.2);G.add(K.mesh(new T.CylinderGeometry(3,3,40,6),'sbThatchD',{rz:PI/2,y:e[1],z:e[2]}));
    [-12,12].forEach(x=>G.add(limb(P(x,s0-2.5,-t-1.2),P(x,50,-t-1.2),1.2,1.2,'sbLogB',5)));
    return G;}
  function roofCap(){const G=g();
    G.add(K.cone(26*Math.SQRT2,34,'thatch',{y:43,ry:PI/4},4));
    G.add(K.cyl(24.3*Math.SQRT2,26.4*Math.SQRT2,3.4,'sbThatchD',{y:40.6,ry:PI/4},4));
    [52,63].forEach(y=>{const hs=26*(77-y)/34+0.3;G.add(K.cyl((hs-0.9)*Math.SQRT2,hs*Math.SQRT2,1.3,'sbThatchD',{y,ry:PI/4},4));});
    G.add(K.cyl(2.2,3.2,4,'sbFiber',{y:73.5},6),K.cone(1.6,6,'sbLogB',{y:77},5));
    [-1,1].forEach(d=>G.add(limb([d*-3,72,0],[d*5,82,0],0.8,0.7,'sbLogB',4)));
    return G;}
  function ridge(){const G=g();G.add(K.mesh(new T.CylinderGeometry(3.2,3.2,40,6),'sbLogB',{rz:PI/2,y:81}));
    G.add(limb([0,75.2,7.6],[0,92,-6],1.15,0.9,'sbLogA',5),limb([0,75.2,-7.6],[0,92,6],1.15,0.9,'sbLogA',5));G.add(K.box(3,3,3,'sbFiber',{center:true,y:85.2}));return G;}
  function gable(){const G=g(),S=new Soup(),z0=-1.6,z1=1.6,A=[-20,48],B=[20,48],C=[-20,78],ct=[-6.7,58,0];
    S.o([A[0],A[1],z1],[B[0],B[1],z1],[C[0],C[1],z1],ct);S.o([A[0],A[1],z0],[B[0],B[1],z0],[C[0],C[1],z0],ct);
    [[A,B],[B,C],[C,A]].forEach(([p,q])=>{S.o([p[0],p[1],z0],[q[0],q[1],z0],[q[0],q[1],z1],ct);S.o([p[0],p[1],z0],[q[0],q[1],z1],[p[0],p[1],z1],ct);});G.add(S.mesh('sbWoodB'));
    for(let i=0;i<4;i++){const y=48+3+i*6,x1=20-(i*6+6)*4/3;G.add(logX(-20,x1,y,i%2?'sbLogB':'sbLogA',3,0,0.7));}
    return G;}
  function floor(){const G=g();G.add(K.box(40,3.2,40,'sbLogB',{}));const ms=['sbWoodA','sbWoodB','sbWoodA','sbWoodB','sbWoodA'];
    for(let i=0;i<5;i++)G.add(K.box(7.8,2.8,40,ms[i],{x:-16.1+i*8.05,y:3.2}));
    [-16.1,16.1].forEach(x=>[-17,17].forEach(z=>G.add(K.box(1.2,0.3,1.2,'sbPitch',{x,y:5.76,z}))));return G;}
  function stoneFloor(){const G=g(),R=RNG(77);G.add(K.box(40,4.2,40,'sbStoneB',{}));const xs=[-20,-6.5,7,20],zs=[-20,-7,6.5,20],cols=['#aaa496','#9d978b','#b3ad9f','#a29c8f','#a7a093'];
    for(let i=0;i<3;i++)for(let j=0;j<3;j++){const x0=xs[i]+0.55,x1=xs[i+1]-0.55,z0=zs[j]+0.55,z1=zs[j+1]-0.55,h=1.65+R()*0.15;G.add(K.box(x1-x0,h,z1-z0,cols[(i*3+j)%5],{x:(x0+x1)/2,y:6-h,z:(z0+z1)/2,ry:(R()-.5)*0.03}));}
    return G;}
  function fence(){const G=g();[-20,20].forEach(x=>G.add(K.cyl(1.8,2,21,'sbLogB',{x},6),K.cone(1.85,3.4,'sbLogB',{x,y:21},6)));
    G.add(K.cyl(1.5,1.7,17,'sbLogA',{x:0.4,z:-0.2},6),K.cone(1.55,2.8,'sbLogA',{x:0.4,y:17,z:-0.2},6));
    G.add(limb([-20,15.6,0.6],[20,16.3,0.6],1.1,1.0,'sbWoodA',5),limb([-20,7.6,0.6],[20,7.1,0.6],1.1,1.0,'sbWoodA',5));
    [[-20,16],[20,16.3],[-20,7.6],[20,7.1]].forEach(([x,y])=>G.add(K.box(2.4,1.5,4.2,'sbFiber',{center:true,x:x*0.93,y,z:0.3})));return G;}
  function gate(){const G=g();[-20,20].forEach(x=>G.add(K.cyl(2.1,2.3,25,'sbLogB',{x},6),K.sphere(2.2,'sbLogB',{x,y:25,sy:0.6},6,4)));
    G.add(limb([-17.2,6,0],[17.2,6,0],1,1,'sbWoodA',5),limb([-17.2,17.5,0],[17.2,17.5,0],1,1,'sbWoodA',5));
    [-15.5,-7.8,0,7.8,15.5].forEach((x,i)=>G.add(K.box(2.8,16+(i%2)*1.6,1.3,i%2?'sbWoodB':'sbWoodA',{x,y:3.6,z:1})));
    G.add(limb([-15,6.6,-1],[15,16.8,-1],0.9,0.9,'sbWoodB',5));
    [6,17.5].forEach(y=>G.add(K.box(3.6,2,3.6,'sbFiber',{center:true,x:-18.6,y})));G.add(K.box(3.4,1.4,3.4,'sbRope',{center:true,x:18.6,y:15}));return G;}
  function stairs(){const G=g(),n=9,run=40/n;for(let i=0;i<n;i++)G.add(K.box(32,2.4,run+0.7,i%2?'sbWoodA':'sbWoodB',{y:6*(i+1)-2.4,z:20-run*(i+0.5)}));
    [-17,17].forEach(x=>{G.add(limb([x,0,21],[x,54,-19.5],1.9,1.9,'sbLogB',6),K.cyl(1.9,1.9,54,'sbLogB',{x,z:-19},6));});return G;}

  /* ======================================== C. PLACEABLES ======================================== */
  function campfire(lit){const G=g(),R=RNG(91);G.add(disc(9.8,lit?'sbAsh':'sbChar',{y:0.2},9));
    for(let i=0;i<9;i++){const a=i/9*TAU+0.2,rr=11.4+(R()-.5)*1.2,s=2.8+R()*1.2;G.add(K.ico(s,i%3===1?'sbStoneB':'sbStoneA',{x:Math.cos(a)*rr,y:s*0.5,z:-Math.sin(a)*rr,ry:R()*3},0,0.35,i+3));}
    for(let i=0;i<4;i++){const a=i/4*TAU+0.45;G.add(limb([Math.cos(a)*8.6,0.9,-Math.sin(a)*8.6],[Math.cos(a)*1.4,8.8,-Math.sin(a)*1.4],1.55,1.1,lit?'sbLogA':'sbChar',5));}
    if(lit){const F=flame(1,{y:0.6,glow:52},7);[[3,2],[-3.5,1],[1,-3.6],[-1,3.8]].forEach(([x,z],i)=>F.add(oct(1.1,'sbEmber',{x,y:0.6,z,sy:0.5,ry:i,mo:{ei:1.3}})));G.add(F);}
    else[[2.5,1.5],[-3,-1],[0.5,-3.5]].forEach(([x,z],i)=>G.add(K.ico(1.6,'sbChar',{x,y:0.6,z,sy:0.6},0,0.4,i+9)));
    return G;}
  function workbench(){const G=g(),ty=17.4;[-11.5,11.5].forEach(x=>G.add(K.cyl(4.6,5.3,13.6,'sbBark',{x},8)));
    G.add(K.box(36,3.8,17,'sbWoodA',{y:13.6}),K.box(36.4,1.6,1.4,'sbBark',{y:14.4,z:8.4}),K.box(36.4,1.6,1.4,'sbBark',{y:14.4,z:-8.4}));
    G.add(limb([-14,ty+0.7,3],[-4.5,ty+0.7,6.5],0.65,0.6,'sbHandle',5),K.ico(2.6,'sbStoneB',{x:-14.6,y:ty+1.9,z:2.6,sx:0.9,sz:1.35,ry:-0.35},0,0.2,4),K.box(2.2,1.1,2.6,'sbFiber',{x:-13.7,y:ty+0.8,z:3,ry:-0.35}));
    const S=new Soup();spindle(S,[3,ty+0.5,5.5],[12,ty+0.5,3.6],1.6,4,0.3,0.35,[0,1,0]);G.add(S.mesh('sbFlint'),limb([-0.6,ty+0.6,6.3],[3.2,ty+0.6,5.5],0.6,0.6,'sbFiber',5));
    G.add(K.ico(2.6,'sbFlint',{x:7,y:ty+1.1,z:-3.5,sy:0.55,sz:1.3,ry:0.8},0,0.3,6));[[0,-4],[2.5,-6],[-2.6,-2.5]].forEach(([x,z],i)=>G.add(oct(0.9,'sbFlint',{x,y:ty+0.3,z,sy:0.35,ry:i})));
    G.add(K.cyl(3.4,2.4,2.6,'sbWoodB',{x:14,y:ty,z:-3.5},8),disc(3.1,'sbFiber',{x:14,y:ty+2.2,z:-3.5},8));
    [[-6,-5,0.4],[-8.5,-3,1.2],[-4.4,-6.4,2.2]].forEach(([x,z,r])=>G.add(K.box(2.2,0.4,0.9,'sbCut',{x,y:ty,z,ry:r})));
    G.add(K.cyl(4.2,4.6,8.5,'sbBark',{x:4,z:15},8),disc(3.9,'sbCut',{x:4,y:8.56,z:15},8));return G;}
  function basket(){return g(K.cyl(7.6,6,12,'sbWeave',{},10),K.cyl(6.6,7.4,1.2,'sbWoodB',{y:3},10),K.cyl(8,8,1.6,'sbWoodB',{y:10.9},10),K.cyl(3.6,8.3,3.2,'sbWeave',{y:12.3},10),K.cyl(1.2,1.6,1.4,'sbWoodB',{y:15.4},6));}
  function chest(){const G=g();G.add(K.box(22,11.5,13,'sbWoodA',{}));G.add(K.mesh(new T.CylinderGeometry(6.9,6.9,23,8,1,false,0,PI),'sbWoodB',{rz:PI/2,y:11.5,sx:0.65}));
    [-6.5,6.5].forEach(x=>{G.add(K.box(2.4,11.6,0.6,'sbLeather',{x,z:6.6}),K.mesh(new T.CylinderGeometry(7.15,7.15,2.4,8,1,true,0,PI),'sbLeather',{rz:PI/2,x,y:11.5,sx:0.67}));});
    [-1,1].forEach(a=>[-1,1].forEach(b=>G.add(K.box(1.6,11.5,1.6,'sbWoodB',{x:a*10.5,z:b*6}))));G.add(K.box(1.4,3.2,1.2,'sbBone',{y:9.2,z:7}));return G;}
  function bed(){const G=g();[-15.5,15.5].forEach(x=>G.add(K.mesh(new T.CylinderGeometry(2.8,2.8,74,6,1,false,PI/6),'sbLogA',{rx:PI/2,x,y:2.8})));
    [-36.5,36.5].forEach(z=>G.add(logX(-18.5,18.5,3.1,'sbLogB',3.1,z,1)));[-15.5,15.5].forEach(x=>G.add(K.cyl(2.3,2.6,17,'sbLogB',{x,z:-37},6)));G.add(logX(-17,17,14.5,'sbLogA',2.2,-37,1));
    G.add(K.box(27.5,5,70,'sbStraw',{y:2.6,z:0.5}),K.box(29.5,1.6,45,'sbFur',{y:7.3,z:12.5}),K.box(30,2.8,5.5,'sbFur2',{y:7.1,z:-9.6}));
    [-1,1].forEach(d=>G.add(K.box(0.8,4.4,43,'sbFur',{x:d*14.6,y:4,z:12.5})));
    [[-7,2,0.5,4.5,2.6],[6,9,-0.4,3.6,2.2],[-2,20,0.9,5,2.4],[8,26,0.2,3.2,2],[-9,30,-0.6,3.8,2.2]].forEach(([x,z,r,w,d])=>G.add(K.box(w,0.2,d,'sbFurD',{x,y:8.9,z,ry:r})));
    G.add(blob(5,'sbFur2',{y:9.6,z:-28,sx:2.2,sy:0.55,sz:0.95},12,0.15));return G;}
  const fishSoup=(S,Fn,x,y,z,len,w)=>{spindle(S,[x,y,z],[x,y+len,z],w,6,0.45,0.38,[0,0,1]);const ty=y+len;Fn.t([x,ty-0.8,z],[x-w*1.1,ty+len*0.32,z],[x+w*1.1,ty+len*0.32,z]);};
  function dryRack(){const G=g();[-16,16].forEach(x=>{G.add(limb([x,0,-8.5],[x,30,0.6],1.1,0.9,'sbLogB',5),limb([x,0,8.5],[x,30,-0.6],1.1,0.9,'sbLogB',5),K.box(2.6,2,2.6,'sbFiber',{center:true,x,y:27.5}));});
    G.add(limb([-19.5,27.4,0],[19.5,27.8,0],1.1,1.1,'sbWoodA',5),limb([-15,13,-4.6],[15,13.2,-4.6],0.8,0.8,'sbWoodA',5));
    [-12,-7.5,-3].forEach((x,i)=>{G.add(K.box(2.8,10+i,0.7,'sbMeat',{x,y:16.4-i,z:0.9,rz:(i-1)*0.05}),K.box(0.9,10+i,0.75,'sbFat',{x:x+0.6,y:16.4-i,z:0.92}));});
    const S=new Soup(),Fn=new Soup(),Sg=new Soup();[[3.5,12],[9.5,10.5],[15,12.5]].forEach(([x,y],i)=>{fishSoup(S,Fn,x,y,1.2,9,1.9);Sg.t([x-0.15,y+12,1.2],[x+0.15,y+12,1.2],[x,27,1.2]);});
    G.add(S.mesh('sbFish'),Fn.mesh('sbFishD',{mo:{side:DS}}));return G;}
  function farm(){const G=g();G.add(K.box(39,1.6,39,'sbSoil',{}));[-13.5,-4.5,4.5,13.5].forEach(z=>G.add(K.prism(35,1.5,6.6,'sbSoil2',{y:1.5,z})));
    [[0,-19.1,0],[0,19.1,0],[-19.1,0,1],[19.1,0,1]].forEach(([x,z,r])=>G.add(K.mesh(new T.CylinderGeometry(1.3,1.3,39.5,5,1,true),'sbLogB',r?{rx:PI/2,x,y:1.3,z}:{rz:PI/2,x,y:1.3,z})));return G;}
  function torchStand(){const G=g();G.add(K.cyl(1.0,1.5,35,'dwood',{},6),K.cyl(2.3,1.4,5.5,'sbPitch',{y:33},7),K.cyl(2.45,2.4,1.1,'sbFiber',{y:33.8},7),K.cyl(2.25,2.15,0.9,'sbFiber',{y:36.6},7));
    for(let i=0;i<3;i++){const a=i/3*TAU+0.4;G.add(K.ico(2.4,'sbStoneB',{x:Math.cos(a)*3,y:1,z:-Math.sin(a)*3},0,0.35,i+2));}
    G.add(flame(0.55,{y:38.3,glow:34},11));return G;}
  function hearth(){const G=g();G.add(K.box(34,3.4,30,'sbStoneA',{z:-1}),K.box(30,9.2,5.4,'stone',{y:3.4,z:-11.5}));[-1,1].forEach(d=>G.add(K.box(5.4,9.2,17,'stone',{x:d*12.3,y:3.4,z:-1})));
    G.add(K.box(29,1.8,24,'sbSlate',{y:12.6,z:-2.5,ry:0.03}),K.box(5,3,4,'sbStoneB',{x:-12,y:14.4,z:-11.5,ry:0.2}),K.box(4,2.4,4,'sbStoneA',{x:12.5,y:14.4,z:-11,ry:-0.3}));
    G.add(disc(7,'sbAsh',{y:3.45,z:-1},8));[[-1,0.7],[1,-0.7]].forEach(([d,r])=>G.add(limb([d*6,3.8,2],[-d*1,4.6,-6],0.9,0.8,'sbChar',5)));
    G.add(flame(0.5,{y:3.6,z:0.5,glow:32},13));
    G.add(K.cyl(4.2,3.2,5.5,'sbClayK',{x:-6,y:14.4,z:-4},8),K.cyl(4.3,4.3,0.8,'sbClayD',{x:-6,y:19.6,z:-4},8),disc(3.6,'#6b4a2a',{x:-6,y:20.45,z:-4},8),K.cyl(4.5,4.5,0.8,'#d9b06a',{x:6,y:14.4,z:1},8));
    return G;}
  function kiln(){const G=g();G.add(K.cyl(17,18,3,'sbStoneA',{},10),K.dome(14.5,'sbClayK',{y:3,sy:1.22},10),K.cyl(2.9,3.9,5.5,'sbClayK',{y:18.5},8),disc(2.7,'sbChar',{y:24.05},8));
    G.add(K.box(9.5,9,3.4,'#1a100a',{y:3,z:12.9}),K.box(13,2.6,4.2,'sbClayD',{y:12,z:12.7}));[-1,1].forEach(d=>G.add(K.box(2.2,9,4.2,'sbClayD',{x:d*5.9,y:3,z:12.7})));
    G.add(flame(0.42,{y:3.2,z:13.2,glow:30},17));
    G.add(K.cyl(2.6,2,4.5,'sbClayK',{x:15,y:0,z:13},7),K.cyl(2.2,2.6,0.8,'sbClayK',{x:15,y:4.5,z:13},7));[0,1,2].forEach(i=>G.add(K.box(5,2.2,3,'sbMud',{x:-14+(i%2)*1.2,y:i===2?2.2:0,z:13-(i<2?i*3.2:1.6),ry:0.1})));return G;}
  function well(){const G=g();G.add(K.mesh(new T.CylinderGeometry(12.6,13.2,12.5,10,1,true),'stone',{y:6.25}),K.mesh(new T.CylinderGeometry(9.6,9.6,12.5,10,1,true),'dstone',{y:6.25,mo:{side:T.BackSide}}));
    const rg=new T.RingGeometry(9.4,13.6,10,1);rg.rotateX(-PI/2);G.add(K.mesh(rg,'sbStoneB',{y:12.5}),disc(9.7,'water',{y:4.5},10));
    [-1,1].forEach(d=>G.add(K.cyl(1.5,1.8,36,'sbLogB',{x:d*15.5},6)));G.add(limb([-17,31,0],[17,31,0],1.3,1.3,'sbWoodA',6),K.prism(38,7,16,'thatch',{y:35}),limb([0,30,0],[0,22.5,0],0.3,0.3,'sbRope',3));
    G.add(K.cyl(3.2,2.6,5,'sbWoodB',{y:17.5},8),K.cyl(3.3,3.3,0.7,'sbFiber',{y:20},8),K.box(0.6,3.6,0.6,'sbRope',{x:-2.9,y:22}),K.box(0.6,3.6,0.6,'sbRope',{x:2.9,y:22}));return G;}
  function totem(){const G=g(),woods=['sbWoodA','sbWoodB','sbLogA'],paint=['red','#e0b04a','#3e7a9a','#f0e6d0'],pw=12,seg=20.5,fz=6;
    G.add(K.cyl(9,10,4,'sbStoneA',{},8));
    for(let i=0;i<3;i++){const y=4+i*seg,wm=woods[i],ey=y+seg*0.62;G.add(K.box(pw,seg-0.4,pw,wm,{y}),K.box(9.4,2.3,1,'sbInk',{y:ey,z:fz+0.3}),K.box(10,1.4,1.2,paint[i],{y:ey+2.7,z:fz+0.4}),K.box(2.6,5.4,2.4,wm,{y:y+seg*0.28,z:fz+1}),K.box(7,1.6,1,i===1?'red':'sbBone',{y:y+seg*0.12,z:fz+0.3}));
      if(i===0)[-1,1].forEach(d=>G.add(K.box(2,seg*0.5,6,wm,{x:d*(fz+1),y:y+seg*0.2}),K.box(2.1,1.2,6.2,paint[1],{x:d*(fz+1),y:y+seg*0.62})));}
    const top=4+3*seg;G.add(K.box(11,6.5,12,'sbLogB',{y:top}),K.box(7,7,7.5,'#7a4a2a',{y:top+6.5,z:1.5}),K.box(1.5,1.2,1,'#f0e6d0',{x:-2,y:top+10,z:5.3}),K.box(1.5,1.2,1,'#f0e6d0',{x:2,y:top+10,z:5.3}));
    G.add(K.cone(1.7,5,'#e0b04a',{y:top+8.5,z:5.2,rx:PI/2+0.5},4));
    const wing=d=>{const W=g();[[15,'red'],[12,'#2a1a10'],[9.5,'#f0e6d0']].forEach(([l,c],k)=>W.add(K.box(l,1.4,3.6,c,{x:d*l/2,y:-k*1.3,z:(k-1)*2.4})));W.position.set(d*4,top+5.5,0);W.rotation.z=d*0.42;return W;};
    G.add(wing(-1),wing(1));return G;}
  function tanRack(){const G=g();[-15,15].forEach(x=>G.add(limb([x,0,1.5],[x,37,-1.5],1.2,1.0,'sbLogB',5),limb([x,0,-12],[x,30,-1],0.9,0.8,'sbWoodB',5)));
    G.add(limb([-18,34.5,-1.2],[18,34.8,-1.2],1,1,'sbWoodA',5),limb([-18,5,1.2],[18,4.8,1.2],1,1,'sbWoodA',5));
    const S=new Soup(),pts=[[0,31.5],[6,30],[11,27],[9.5,20],[11.5,12.5],[7,8.6],[0,9.5],[-7,8.6],[-11.2,12],[-10,20],[-11,27.5],[-6,30]],zz=y=>1.5-3*(y/37)+0.35,c=[0,19.5,zz(19.5)];
    for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];S.t(c,[a[0],a[1],zz(a[1])],[b[0],b[1],zz(b[1])]);}G.add(S.mesh('hide',{mo:{side:DS}}));
    const L=new Soup();[[0,31.5,0,34.6],[11,27,15,27],[11.5,12.5,15,12.5],[0,9.5,0,5],[-11.2,12,-15,12],[-11,27.5,-15,27.5],[6,30,9,34.6],[-6,30,-9,34.6]].forEach(([x0,y0,x1,y1])=>{const z0=zz(y0),z1=zz(y1)-0.3;L.t([x0,y0,z0],[x1,y1+0.35,z1],[x1,y1-0.35,z1]);});G.add(L.mesh('sbRope',{mo:{side:DS}}));
    return G;}
  function smelter(){const G=g();G.add(K.cyl(13,14,3,'sbStoneA',{},9),K.cyl(7,10.5,27,'sbClayK',{y:3},9),K.cyl(7.9,7.9,2.4,'sbScorch',{y:28.6},9),K.box(6,6,3,'#1a100a',{y:3,z:9.2}));
    G.add(blob(4.6,'hide',{x:-14.8,y:5,z:6,sx:1.2,sy:0.5},4,0.15),K.box(10,0.9,7,'sbWoodA',{x:-14.8,y:7,z:6,rz:0.08}),K.box(10,0.9,7,'sbWoodA',{x:-14.8,y:2.2,z:6}),limb([-10.2,5,5.2],[-7.4,6.5,3.6],1.3,1.1,'sbClayK',5),K.box(1.4,6,1.4,'sbWoodB',{x:-19.4,y:6.3,z:6}));
    G.add(K.cyl(2.8,2.2,3.5,'sbClayK',{x:12,z:9},8),K.box(5,1.5,2.4,'copper',{x:6,z:14,ry:0.3}),K.box(5,1.5,2.4,'copper',{x:10.5,z:15.5,ry:-0.2}));
    const F=g();F.name='flame';F.userData.dyn=1;const R=RNG(3);F.add(disc(6.2,'sbMolten',{y:31.05,mo:{ei:1.6}},9),coneM(3,8,'fire',{y:30.8,noShadow:true,mo:{ei:1.8}},5,R,0.3,0.3,[0.6,0]),coneM(2,5.5,'sbFlameY',{x:-2,y:30.8,z:1,noShadow:true,mo:{ei:1.5}},5,R,0.3,0.3));
    F.add(K.box(4.6,4.6,0.6,'sbMolten',{y:3.6,z:10.75,mo:{ei:1.4}}),disc(2.2,'sbMolten',{x:12,y:3.55,z:9,mo:{ei:1.4}},8),K.glow('#ff9a40',40,{y:34,op:0.7},false),K.glow('#ff7a30',22,{y:6,z:11.5,op:0.6},false));G.add(F);return G;}
  function leanto(){const G=g(),zf=30,yr=44,zb=-37;
    [-17,17].forEach(x=>{G.add(K.cyl(1.5,1.9,yr+1,'sbLogB',{x,z:zf},6),limb([x,yr-1.5,zf],[x+(x<0?-2.8:2.8),yr+5.5,zf+0.4],0.95,0.6,'sbLogB',4));});
    G.add(limb([-21.5,yr+1.2,zf],[21.5,yr+1.5,zf],1.8,1.7,'sbLogA',6));for(let i=0;i<4;i++){const x=-15+i*10,a=V(x*1.05,0,zb),b=V(x,yr+2.2,zf+2),e=b.clone().add(b.clone().sub(a).setLength(6+(i%2)*2.5));G.add(limb(a.toArray(),e.toArray(),1.15,0.9,'sbLogB',5));}
    const top=V(0,yr+2.2,zf+2),sd=V(0,-(yr+2.2),-(zf+2-zb)).normalize(),nd=V(0,-sd.z,sd.y),ang=Math.atan2(nd.z,nd.y),L=top.distanceTo(V(0,0,zb));
    [[0.17,2.3],[0.47,1.8],[0.77,1.3]].forEach(([f,k])=>{const p=top.clone().addScaledVector(sd,L*f).addScaledVector(nd,k);G.add(K.box(43,1.6,L*0.36,'sbFrond',{center:true,y:p.y,z:p.z,rx:ang}));});
    [[-11,0.14],[10,0.33],[-6,0.56],[8,0.78]].forEach(([x,f],i)=>{const p=top.clone().addScaledVector(sd,L*f).addScaledVector(nd,3);G.add(blob(7,i%2?'sbBush':'sbOak2',{x,y:p.y,z:p.z,sx:1.5,sy:0.42,sz:1.15,rx:ang},i+3,0.35));});
    [-1,1].forEach(d=>{const S=new Soup(),x=d*20.4;S.t([x,0.2,zb+4],[x,0.2,zf-1],[x,yr-1,zf-1]);G.add(S.mesh('sbFrond',{mo:{side:DS}}));});
    G.add(K.box(22,1.4,36,'sbFrond',{y:0,z:8}),K.box(18,1.2,24,'sbFur',{y:1.4,z:10}),blob(4.5,'sbOak2',{x:0,y:2.8,z:-6,sx:1.6,sy:0.5},9,0.3));return G;}
  function tent(){const G=g(),r=34,h=70,rot=PI/10,zf=y=>32.34*(1-y/h);G.add(K.cone(r,h,'hide',{ry:rot},10));
    for(let i=0;i<6;i++){const a=i/6*TAU+0.3;G.add(limb([Math.cos(a)*2,h-8,-Math.sin(a)*2],[Math.cos(a)*7,h+15,-Math.sin(a)*7],0.9,0.7,'sbLogB',4));}
    const S=new Soup();S.t([-8,0.3,zf(0.3)+0.3],[8,0.3,zf(0.3)+0.3],[0,30,zf(30)+0.3]);G.add(S.mesh('sbInk',{mo:{side:DS}}));
    const Fl=new Soup();Fl.t([0,30,zf(30)+0.45],[8,0.3,zf(0.3)+0.45],[13.5,3,zf(3)+2.6]);G.add(Fl.mesh('sbFur2',{mo:{side:DS}}));
    G.add(K.mesh(new T.CylinderGeometry(r*(1-41/h)*1.012,r*(1-36/h)*1.012,5,10,1,true),'red',{y:38.5,ry:rot}),K.mesh(new T.CylinderGeometry(r*(1-44.5/h)*1.014,r*(1-43/h)*1.014,1.5,10,1,true),'#e0b04a',{y:43.75,ry:rot}));
    const A=V(0,h,0),B1=V(r*Math.sin(1.257),0,r*Math.cos(1.257)),B2=V(r*Math.sin(1.885),0,r*Math.cos(1.885)),n=B1.clone().sub(A).cross(B2.clone().sub(A)).normalize();if(n.x<0)n.negate();
    const cpt=A.clone().lerp(B1.clone().add(B2).multiplyScalar(0.5),0.58).addScaledVector(n,0.35),sun=K.mesh(new T.CircleGeometry(5,8),'#e0b04a',{});sun.position.copy(cpt);sun.quaternion.setFromUnitVectors(V(0,0,1),n);G.add(sun);
    for(let i=0;i<8;i++){const a=i/8*TAU+0.2;G.add(K.ico(2.6,i%2?'sbStoneA':'sbStoneB',{x:Math.cos(a)*35,y:1,z:-Math.sin(a)*35},0,0.35,i+4));}return G;}
  const PIECES={floor,stoneFloor,wall:()=>logWall(),wallDoor,wallWindow,stoneWall:()=>stoneWall(false),stoneWallDoor:()=>stoneWall(true),roof:roofPanel,roofCap,ridge,gable,fence,gate,stairs,
    campfire:()=>campfire(true),campfireOff:()=>campfire(false),workbench,basket,chest,bed,dryRack,farm,torch:torchStand,hearth,kiln,well,totem,tanRack,smelter,leanto,tent};
  const warned={};const missing=(what,id)=>{if(!warned[what+id]){warned[what+id]=1;console.warn('SBM: unknown '+what+' id',id);}return g(K.box(8,8,8,'#ff00ff',{}));};
  M.piece=(id)=>PIECES[id]?PIECES[id]():missing('piece',id);

  /* ======================================== D. CROPS ======================================== */
  const PLOTS=[];for(let i=0;i<4;i++)for(let j=0;j<4;j++)PLOTS.push([-13.5+i*9,-13.5+j*9]);
  function cropGrain(st){const G=g(),R=RNG(101+st),S=new Soup(),E=new Soup(),L=new Soup();
    PLOTS.forEach(([px,pz])=>{const x=px+(R()-.5)*1.6,z=pz+(R()-.5)*1.2;
      if(st===0){for(let k=0;k<2;k++){const a=R()*TAU;blade(S,x+(R()-.5)*1.4,z+(R()-.5)*1.4,2.4+R()*1.6,0.9,Math.cos(a)*0.8,-Math.sin(a)*0.8,a,0,1);}}
      else if(st===1){for(let k=0;k<5;k++){const a=k/5*TAU+R();blade(S,x,z,5+R()*3,1.1,Math.cos(a)*(1.4+R()),-Math.sin(a)*(1.4+R()),a+PI/2,0,1);}}
      else{const H=st===2?13:17;for(let k=0;k<3;k++){const a=k/3*TAU+R()*0.8,ll=1+R()*1.4,lx=Math.cos(a)*ll,lz=-Math.sin(a)*ll,hh=H*(0.85+R()*0.25),bx=x+Math.cos(a)*0.5,bz=z-Math.sin(a)*0.5;
          blade(S,bx,bz,hh,0.75,lx,lz,a+PI/2,0,1);if(k<(st===2?2:3)){const tip=[bx+lx,hh,bz+lz],dr=st===3?1.7:0.5;spindle(E,[tip[0]-lx*0.08,tip[1]-0.6,tip[2]-lz*0.08],[tip[0]+lx*0.45+Math.cos(a)*dr,tip[1]+4.4-dr*0.4,tip[2]+lz*0.45-Math.sin(a)*dr],0.9,3,1,0.45);}}
        const a2=R()*TAU;blade(L,x,z,H*0.5,1.5,Math.cos(a2)*4,-Math.sin(a2)*4,a2+PI/2,0,1);}});
    G.add(S.mesh(st===3?'sbStalk':'sbGrass',{mo:{side:DS}}));if(E.n())G.add(E.mesh(st===3?'sbGrain':'sbGrainG'));if(L.n())G.add(L.mesh(st===3?'sbStalk':'sbGrass2',{mo:{side:DS}}));return G;}
  function cropGourd(st){const G=g(),R=RNG(201+st),Lf=new Soup(),Vn=new Soup();
    [[-8,-7.5],[8,-6],[-7,8],[8.5,8.5]].forEach(([x,z],pi)=>{
      if(st===0){[-1,1].forEach(d=>{fan(Lf,[x+d*1.1,1.6,z],1.5,6,0.5,d>0?0:PI,R,0.1);});blade(Vn,x,z,1.6,0.5,0,0,0.5,0,1);return;}
      const nl=st===1?3:st===2?6:5,lr=st===1?2.6:4.4;for(let k=0;k<nl;k++){const a=k/nl*TAU+pi+R()*0.6,d=st===1?1.6:2.5+R()*6,lx=x+Math.cos(a)*d,lz=z-Math.sin(a)*d,ly=st===1?3.2:3.2+R()*3.2;
        blade(Vn,x,z,ly,0.55,lx-x,lz-z,a,0,1);fan(Lf,[lx,ly,lz],lr*(0.85+R()*0.3),6,0.3+R()*0.3,a,R);}
      if(st>=2){const vx=x+(pi%2?-1:1)*7,vz=z+(pi<2?-1:1)*1.5;Vn.t([x-0.4,0.3,z],[x+0.4,0.3,z],[vx,0.6,vz]);
        if(st===2)G.add(K.ico(1.9,'sbGourdG',{x:vx,y:1.6,z:vz,sx:1.3},0,0.2,pi));
        else{const gc=[vx,vz],gr=2.9+R()*0.5,ga=R()*TAU;G.add(K.ico(gr,'sbGourd',{x:gc[0],y:gr*0.85,z:gc[1],sx:1.05},0,0.12,pi),K.ico(gr*0.62,'sbGourd',{x:gc[0]+Math.cos(ga)*gr*0.95,y:gr*1.15,z:gc[1]-Math.sin(ga)*gr*0.95},0,0.12,pi+5));
          if(pi%2===0)G.add(K.ico(2.3,'sbGourd',{x:x+2,y:2,z:z+4.5,sx:1.2},0,0.15,pi+9));}}});
    G.add(Lf.mesh(st===3?'sbGourdL':'sbGrass',{mo:{side:DS}}),Vn.mesh('sbReed',{mo:{side:DS}}));return G;}
  function cropFlax(st){const G=g(),R=RNG(301+st),S=new Soup(),F=new Soup();
    PLOTS.forEach(([px,pz])=>{const x=px+(R()-.5)*1.4,z=pz+(R()-.5)*1.2;
      if(st===0){for(let k=0;k<2;k++){const a=R()*TAU;blade(S,x+(R()-.5)*1.2,z+(R()-.5)*1.2,2.2+R()*1.4,0.7,Math.cos(a)*0.6,-Math.sin(a)*0.6,a,0,1);}return;}
      if(st===1){for(let k=0;k<4;k++){const a=k/4*TAU+R();blade(S,x,z,5+R()*2.5,0.8,Math.cos(a)*1.2,-Math.sin(a)*1.2,a+PI/2,0,1);}return;}
      for(let k=0;k<3;k++){const a=k/3*TAU+R(),hh=15+R()*4,lx=Math.cos(a)*(0.8+R()*1.4),lz=-Math.sin(a)*(0.8+R()*1.4);blade(S,x+Math.cos(a)*0.4,z-Math.sin(a)*0.4,hh,0.6,lx,lz,a+PI/2,0,1);
        if(st===3&&k<2)fan(F,[x+Math.cos(a)*0.4+lx,hh+0.1,z-Math.sin(a)*0.4+lz],1.7,5,0.4,a,null,0.05);}
      for(let k=0;k<2;k++){const a=R()*TAU;blade(S,x,z,7,1,Math.cos(a)*2.4,-Math.sin(a)*2.4,a+PI/2,0,1);}});
    G.add(S.mesh(st===3?'sbGrass2':'sbGrass',{mo:{side:DS}}));if(F.n())G.add(F.mesh('sbFlaxFl',{mo:{side:DS}}));return G;}
  M.crop=(kind,stage)=>{stage=Math.max(0,Math.min(3,(+stage||0)|0));return kind==='gourd'?cropGourd(stage):kind==='flax'?cropFlax(stage):cropGrain(stage);};

  /* ======================================== E. TOOLS ======================================== */
  const lash=(G,y,r,h)=>G.add(K.cyl(r,r,h,'sbFiber',{y},6));
  // axe-like wedge: back face at z=zb (half height hb, half width wb) → sharp vertical edge at z=zf (half height hf), centred at y=yc
  const wedge=(S,yc,zb,zf,hb,hf,wb)=>{const ct=[0,yc,(zb*2+zf)/3],zm=zb+(zf-zb)*0.38,b=[[-wb,yc-hb,zb],[wb,yc-hb,zb],[wb,yc+hb,zb],[-wb,yc+hb,zb]],m=[[-wb*0.8,yc-hb*1.08,zm],[wb*0.8,yc-hb*1.08,zm],[wb*0.8,yc+hb*1.08,zm],[-wb*0.8,yc+hb*1.08,zm]],f=[[0,yc-hf,zf-1],[0,yc,zf+0.6],[0,yc+hf,zf-1]];
    S.o(b[0],b[1],b[2],ct);S.o(b[0],b[2],b[3],ct);for(let i=0;i<4;i++){const j=(i+1)%4;S.o(b[i],b[j],m[j],ct);S.o(b[i],m[j],m[i],ct);}
    S.o(m[3],m[2],f[2],ct);S.o(m[0],m[1],f[0],ct);[[1,2],[0,3]].forEach(([lo,hi])=>{S.o(m[lo],m[hi],f[1],ct);S.o(m[hi],f[2],f[1],ct);S.o(m[lo],f[1],f[0],ct);});return S;};
  const TOOLS={
    axe:G=>{G.add(K.cyl(0.85,1.0,30,'sbHandle',{y:-6},6),wedge(new Soup(),21.4,-1.8,7.6,2.3,4.3,1.6).mesh('sbStoneB'));lash(G,19.2,1.4,4.2);
      G.add(K.box(2.6,0.8,6.4,'sbFiber',{center:true,y:22.4,z:1.4,rx:0.5}),K.box(2.6,0.8,6.4,'sbFiber',{center:true,y:20.6,z:1.4,rx:-0.5}));},
    pick:G=>{G.add(K.cyl(0.85,1.0,30,'sbHandle',{y:-6},6));const S=new Soup();spindle(S,[0,22.6,-7.5],[0,23.4,10.5],1.9,5,0.85,0.45,[1,0,0]);G.add(S.mesh('sbStoneA'));lash(G,20.4,1.35,4.4);
      G.add(K.box(2.9,0.8,5.6,'sbFiber',{center:true,y:23,z:0.4,rx:0.55}),K.box(2.9,0.8,5.6,'sbFiber',{center:true,y:23,z:0.4,rx:-0.55}));},
    spear:G=>{G.add(K.cyl(0.7,0.8,46,'sbHandle',{y:-12},6));const S=new Soup();spindle(S,[0,31.5,0],[0,42,0],1.9,4,0.35,0.3,[1,0,0]);G.add(S.mesh('sbFlint'));lash(G,30.5,1.1,3.6);
      const F=new Soup();[[-1,1],[1,-0.6]].forEach(([d,e])=>F.t([0,30.6,0.9],[d*0.6,30.6,1.1],[d*1.4+e*0.4,24.5,1.6]));G.add(F.mesh('red',{mo:{side:DS}}));},
    torch:G=>{G.add(K.cyl(1.0,0.85,24,'dwood',{y:-6},6),K.cyl(2.0,1.3,5.5,'sbPitch',{y:16.5},7),K.cyl(2.1,2.1,0.9,'sbFiber',{y:17.2},7),K.cyl(2.0,2.0,0.8,'sbFiber',{y:20},7));G.add(flame(0.42,{y:21.4,glow:24},19));},
    club:G=>{G.add(K.cyl(2.9,1.15,24,'sbWoodB',{y:-5},7),blob(3.4,'sbWoodB',{y:19.4,sy:1.1},5,0.2),K.cyl(1.5,1.5,6,'sbLeather',{y:-4},6));
      [[1,0.4,17],[-0.6,1,14],[0.2,-1,15.5]].forEach(([x,z,y],i)=>G.add(oct(1,'sbStoneA',{x:x*2.6,y,z:z*2.6,ry:i})));},
    hammer:G=>{G.add(K.cyl(0.85,1.0,27,'sbHandle',{y:-6},6),blob(3.9,'sbStoneB',{y:21.6,sx:0.95,sy:0.85,sz:1.45},7,0.15));lash(G,18.6,1.35,3.4);
      G.add(K.box(2.4,0.8,6,'sbFiber',{center:true,y:21.6,z:0,rx:0.6}),K.box(2.4,0.8,6,'sbFiber',{center:true,y:21.6,z:0,rx:-0.6}));},
    sickle:G=>{G.add(K.cyl(1.05,1.2,22,'sbHandle',{y:-8},6),K.mesh(new T.TorusGeometry(8,1.3,3,8,2.5),'sbFlint',{x:0,y:14-8*Math.sin(2.04),z:-8*Math.cos(2.04),ry:-PI/2,rx:0.35,sz:0.3}));lash(G,10.6,1.45,3.6);},
    knife:G=>{G.add(K.cyl(1.1,1.2,10.5,'sbHandle',{y:-4},6),K.cyl(1.38,1.38,4,'sbFiber',{y:1},6));const S=new Soup();spindle(S,[0,5.8,0],[0,20,0],1.9,4,0.32,0.3,[1,0,0]);G.add(S.mesh('sbFlint'));}};
  M.tool=(id)=>{if(!TOOLS[id])return missing('tool',id);const G=g();TOOLS[id](G);return G;};

  /* ======================================== F. ITEMS ======================================== */
  const logEnds=(G,x,y,z,r,len,ax)=>{[-1,1].forEach(d=>{const o={x,y,z};o[ax]+=d*len/2;G.add(discA(r,'sbCut',Object.assign({},o),7,(d<0?'-':'')+ax));const o2=Object.assign({},o);o2[ax]+=d*0.08;G.add(discA(r*0.55,'sbRing',o2,6,(d<0?'-':'')+ax));});};
  const layTool=(id,s,ang,tilt)=>{const t=M.tool(id),W=g(t);t.rotation.z=-PI/2+(tilt||0);t.scale.setScalar(s);W.rotation.y=ang;return rest(W);};
  const IT={
    wood:()=>{const G=g();[[-2.6,2.5,0],[2.6,2.5,0.5],[0,6.8,-0.4]].forEach(([x,y,z])=>{G.add(K.mesh(new T.CylinderGeometry(2.5,2.5,14,7,1,true),'sbLogA',{rx:PI/2,x,y,z}));logEnds(G,x,y,z,2.5,14,'z');});return G;},
    stick:()=>g(limb([-7,0.7,-1.5],[7,0.7,1.5],0.7,0.55,'sbDry',5),limb([-6,1.9,2],[6.5,1.9,-2],0.65,0.5,'sbDry',5),limb([-5,0.7,3.5],[6,0.7,4.5],0.6,0.45,'sbDry',5),limb([2,1.9,-0.8],[5,2.3,-4],0.4,0.3,'sbDry',4)),
    stone:()=>g(K.ico(5,'sbStoneA',{y:3.6,sx:1.15,sz:0.95},1,0.3,7),K.ico(2.4,'sbStoneB',{x:5.6,y:1.4,z:2.6},0,0.35,8)),
    fiber:()=>{const G=g(),S=new Soup(),R=RNG(3);for(let i=0;i<14;i++){const z=(R()-.5)*3.4,y=0.4+R()*2.2,w=0.5;const p0=[-8,y*0.5,z+(R()-.5)*2],p1=[0,y+0.6,z*0.4],p2=[8,y*0.5,z+(R()-.5)*2];S.t([p0[0],p0[1],p0[2]-w],[p1[0],p1[1],p1[2]-w],[p1[0],p1[1],p1[2]+w]).t([p1[0],p1[1],p1[2]-w],[p2[0],p2[1],p2[2]],[p1[0],p1[1],p1[2]+w]);}
      G.add(S.mesh('sbGrass2',{mo:{side:DS}}),K.mesh(new T.CylinderGeometry(2.2,2.2,1.6,7),'sbFiber',{rz:PI/2,y:1.8}));return G;},
    flint:()=>g(K.ico(4.6,'sbFlint',{y:2.8,sx:1.3,sy:0.75},0,0.4,3),K.ico(4.4,'sbFlintV',{y:2.9,sx:1.32,sy:0.08,rz:0.35},0,0.05,4),oct(1.6,'sbFlint',{x:6.5,y:0.5,z:2,sy:0.35})),
    clay:()=>g(blob(5.4,'sbClayWet',{y:3,sy:0.62,sx:1.1},3,0.25,1),K.ico(2.2,'clay',{x:6,y:1.2,z:2},0,0.3,4)),
    berry:()=>{const G=g(),L=new Soup();fan(L,[-2,0.6,1],5,6,0.15,0.6,null,0.1);fan(L,[3,0.5,-1.5],4.2,6,0.2,2.6,null,0.1);G.add(L.mesh('sbBerryLf2',{mo:{side:DS}}));
      [[0,2,0],[2.6,1.9,0.6],[1.2,1.9,-2.2],[-1.6,1.8,-1.8],[-1.2,1.8,2],[1.2,3.9,-0.3]].forEach(([x,y,z],i)=>G.add(K.ico(1.75,'sbBerry',{x,y,z},0,0.1,i)));G.add(limb([1.4,5.5,-0.4],[0.6,7.5,-0.8],0.25,0.2,'sbReed',4));return G;},
    meat:()=>meatItem('sbMeat'),meatCooked:()=>meatItem('sbCooked'),
    hide:()=>{const G=g(),S=new Soup(),S2=new Soup(),pts=[[0,-8],[3,-6.5],[6.5,-8.4],[5.6,-4],[6.6,1],[8.6,4.5],[4.6,5],[2,8.5],[-2,8.5],[-4.6,5],[-8.6,4.5],[-6.6,1],[-5.6,-4],[-6.5,-8.4],[-3,-6.5]];
      for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],ya=0.9+Math.sin(i*1.7)*0.3,yb=0.9+Math.sin((i+1)*1.7)*0.3;S.t([0,1.5,0],[a[0],ya,a[1]],[b[0],yb,b[1]]);S2.t([0,1.1,0],[a[0]*1.04,ya-0.35,a[1]*1.04],[b[0]*1.04,yb-0.35,b[1]*1.04]);}
      G.add(S.mesh('sbFur',{mo:{side:DS}}),S2.mesh('hide',{mo:{side:DS}}),K.box(3,0.3,9,'sbFurD',{y:1.35,z:-1}));return G;},
    bone:()=>{const G=g();bone(G,[-6.5,1.4,-2],[6.5,1.4,2],1.15);return G;},
    rope:()=>g(K.mesh(new T.TorusGeometry(4.6,1.15,4,9),'sbRope',{y:1.15,rx:-PI/2}),K.mesh(new T.TorusGeometry(3.2,1.05,4,8),'sbRope',{y:3.1,rx:-PI/2}),limb([4.4,1.1,1],[9,0.9,4.5],0.95,0.9,'sbRope',5)),
    plank:()=>g(K.box(17,1.6,5,'sbWoodA',{ry:0.12}),K.box(17,1.6,5,'sbWoodB',{y:1.6,z:1.5,ry:-0.25})),
    brick:()=>g(K.box(7.5,3.4,4.4,'sbMud',{x:-4,z:0.5}),K.box(7.5,3.4,4.4,'sbMud',{x:4,z:-0.3,ry:0.08}),K.box(7.5,3.4,4.4,'brick',{x:0.2,y:3.4,z:0.1,ry:-0.15})),
    pot:()=>g(K.mesh(new T.LatheGeometry([[0.01,0],[3.4,0.2],[5,2.8],[4.8,6],[3.2,8.2],[3.6,9.2],[3.0,9.4]].map(p=>new T.Vector2(p[0],p[1])),9),'sbClayK',{}),K.mesh(new T.CylinderGeometry(4.95,5.0,0.9,9,1,true),'sbClayD',{y:4.5})),
    copper:()=>g(K.ico(4.6,'sbOreO',{y:3.2,sx:1.15,sy:0.8},1,0.32,5),K.ico(1.4,'sbOreG',{x:2.2,y:5.2,z:2.2},0,0.3,6),K.ico(1.2,'sbOreG',{x:-3.2,y:4.4,z:-1.4},0,0.3,7),K.ico(2,'sbOreO',{x:5.5,y:1.2,z:3},0,0.3,8)),
    mushroom:()=>{const G=g(),sm=(x,z,h,r)=>G.add(K.cyl(r*0.3,r*0.38,h,'sbStem',{x,z},4),K.dome(r,'sbCapBr',{x,y:h-0.2,z,sy:0.62},6));sm(-1.6,0,6,3.8);sm(2.8,1.4,4.4,2.8);G.add(K.dome(1.7,'sbCapBr',{x:0.4,y:0,z:3.4,sy:0.9},5));return G;},
    toadstool:()=>{const G=g();shroom(G,0,0,6.5,5,'sbCapRed',5);return G;},
    seedGrain:()=>{const G=g();G.add(blob(5.6,'hide',{y:4.2,sx:1.05,sy:0.85},6,0.15),K.cyl(3.4,4.2,2.2,'hide',{y:7.6},8),disc(3.3,'sbGrain',{y:9.85},8));
      const S=new Soup();[[0,10.4,0],[1.6,10.2,0.8],[-1.4,10.2,-1],[0.4,10.1,-1.8],[6.5,0.3,3],[7.6,0.3,1.6],[5.6,0.3,5]].forEach(([x,y,z],i)=>spindle(S,[x-0.7,y,z],[x+0.7,y,z+0.3],0.5,3,1,0.5));G.add(S.mesh('sbGrain'),K.cyl(4.4,4.4,1,'sbRope',{y:6.6},8));return G;},
    grain:()=>{const G=g(),S=new Soup(),E=new Soup(),R=RNG(9);for(let i=0;i<9;i++){const z=(R()-.5)*3.6,y=0.8+R()*2.4,a=[-8,y*0.6,z*1.2],b=[4,y,z*0.5];S.t([a[0],a[1]-0.4,a[2]],[a[0],a[1]+0.4,a[2]],[b[0],b[1],b[2]]);S.t([b[0],b[1]-0.4,b[2]],[b[0],b[1]+0.4,b[2]],[a[0],a[1],a[2]]);
        spindle(E,b,[b[0]+4.6,b[1]+(R()-.3)*1.2,b[2]*1.6+(R()-.5)*1.2],0.85,3,1,0.45);}G.add(S.mesh('sbStalk',{mo:{side:DS}}),E.mesh('sbGrain'),K.mesh(new T.CylinderGeometry(2.3,2.3,1.4,7),'sbFiber',{rz:PI/2,x:-1.5,y:1.9}));return G;},
    fish:()=>fishItem('sbFish','sbFishD'),fishCooked:()=>fishItem('sbCooked','sbChar'),
    leather:()=>g(K.box(13,1.1,10,'sbLeather',{ry:0.06}),K.box(12.4,1.1,9.4,'sbLeather',{y:1.1,x:0.3,z:-0.2,ry:-0.08}),K.box(11.8,1.1,9,'#9a6638',{y:2.2,x:-0.2,z:0.2,ry:0.12}),K.box(1.2,3.6,10.4,'sbRope',{y:0.1,x:2.5,ry:0.06})),
    torch:()=>layTool('torch',0.55,0.6,0.45),
    bread:()=>g(K.cyl(5.6,6,2.4,'sbCrust',{},9),K.dome(5.5,'sbBread',{y:2.3,sy:0.38},9),K.box(7,0.5,0.8,'sbCrust',{center:true,y:4.4,ry:0.5}),K.box(7,0.5,0.8,'sbCrust',{center:true,y:4.4,ry:-0.6})),
    stew:()=>{const G=g();G.add(K.cyl(5.8,3.6,4,'sbClayK',{},9),K.mesh(new T.CylinderGeometry(5.95,5.85,0.9,9,1,true),'sbClayD',{y:4.25}),disc(5.5,'sbStew',{y:4.06},9));
      [[1.6,1],[-2,0.6],[0.2,-2.2]].forEach(([x,z],i)=>G.add(K.ico(1.2,i===1?'sbCapBr':'sbFat',{x,y:4.2,z,sy:0.5},0,0.2,i)));G.add(limb([2.4,4.3,-1.2],[7.5,8,-3.5],0.45,0.4,'sbWoodB',4));return G;},
    gourd:()=>g(K.mesh(new T.LatheGeometry(GOURD,6),'sbGourd',{}),K.cyl(0.35,0.55,2.2,'sbGourdL',{y:10.9,rz:0.3},4)),
    mintwater:()=>{const G=g(),L=new Soup();G.add(K.cyl(3.8,2.9,5.2,'sbClayK',{},8),K.mesh(new T.CylinderGeometry(3.95,3.85,0.8,8,1,true),'sbClayK',{y:5.45}),disc(3.6,'sbMintWater',{y:5.26},8),K.mesh(new T.TorusGeometry(1.5,0.5,3,6,PI),'sbClayK',{x:3.8,y:2.6,rz:-PI/2}));
      [[0.6,0.4,0.3],[-1,-0.6,2.2],[0.4,-1.4,4.4]].forEach(([x,z,a])=>{const c=[x,5.32,z],dx=Math.cos(a)*1.6,dz=-Math.sin(a)*1.6;L.t(c,[x+dx*0.5-dz*0.5,5.38,z+dz*0.5+dx*0.5],[x+dx,5.32,z+dz]).t(c,[x+dx,5.32,z+dz],[x+dx*0.5+dz*0.5,5.38,z+dz*0.5-dx*0.5]);});
      G.add(L.mesh('sbMint',{mo:{side:DS}}));return G;},
    seedFlax:()=>{const G=pouch('sbSeedFlax');const S=new Soup();[[6,2.5],[7.2,1],[5.4,4.2],[7.8,3.4]].forEach(([x,z])=>spindle(S,[x-0.5,0.25,z],[x+0.5,0.25,z+0.2],0.35,3,1,0.5));G.add(S.mesh('sbSeedFlax'));
      const F=new Soup();flower(F,[3.6,5.6,3.6],1.7,5,0.9,PI/4,0.55);G.add(F.mesh('sbFlaxFl',{mo:{side:DS}}));return G;},
    seedGourd:()=>{const G=pouch('sbSeedGourd');[[6,2.4,0.3],[7.4,0.8,1.2],[5.6,4.4,2.1],[8,3.6,2.8]].forEach(([x,z,r])=>G.add(oct(0.9,'sbSeedGourd',{x,y:0.25,z,sy:0.28,sx:0.6,ry:r})));
      const L=new Soup();fan(L,[3.4,5.4,3.4],1.8,6,0.8,PI/4,null,0.1);G.add(L.mesh('sbGourdL',{mo:{side:DS}}));return G;}};
  // small open seed pouch (hide), seeds visible on top
  function pouch(seedMat){const G=g();G.add(blob(5,'hide',{y:3.8,sx:1.05,sy:0.85},6,0.15),K.mesh(new T.CylinderGeometry(3,3.7,2,7,1,true),'hide',{y:7.5}),disc(2.9,seedMat,{y:8.3},7),K.mesh(new T.CylinderGeometry(3.85,3.85,0.9,7,1,true),'sbRope',{y:6.4}));return G;}
  function meatItem(m){const G=g();G.add(blob(5.2,m,{x:-2,y:3.6,sx:1.3,sy:0.72},4,0.18,1),limb([2.2,3.4,0],[8.6,2.4,0.6],0.95,0.85,'sbBone',5));
    [-1,1].forEach(s=>G.add(oct(1.45,'sbBone',{x:8.9,y:2.4,z:0.6+s*0.9})));
    if(m==='sbCooked')[-2.5,0.5].forEach(x=>G.add(K.box(1,0.4,7,'sbChar',{x,y:7.2,ry:0.4})));else G.add(K.box(4,0.4,5,'sbFat',{x:-4,y:6.3,ry:0.3}));return G;}
  function fishItem(m,fin){const G=g(),S=new Soup(),F=new Soup();spindle(S,[-8,1.8,0],[5.5,1.8,0],3,6,0.42,0.38,[0,1,0]);G.add(S.mesh(m));
    F.t([5,1.8,0],[9.5,1.9,-3.4],[9.5,1.9,3.4]);F.t([-1,1.8,-1.3],[-3.5,1.8,-4.2],[1.5,1.8,-1.4]);G.add(F.mesh(fin,{mo:{side:DS}}));
    G.add(oct(0.6,'sbInk',{x:-5.6,y:2.9,z:0.9}));if(m==='sbCooked')[-3,0,3].forEach(x=>G.add(K.box(0.7,0.3,4.4,'sbChar',{x,y:3,ry:0.5})));return G;}
  ['axe','pick','spear','club','hammer','sickle','knife'].forEach(id=>{IT[id]=()=>layTool(id,id==='spear'?0.32:id==='knife'||id==='sickle'?0.62:0.5,0.6,0);});
  M.item=(id)=>IT[id]?rest(IT[id]()):missing('item',id);

  /* ======================================== H. ANIMALS (rigged) ======================================== */
  // Rig: G.userData.rig = {body, head, legFL, legFR, legBL, legBR, tail} (bird: {body, head, wingL, wingR}).
  // Legs are children of the root with the pivot at shoulder/hip height (rotation.x swings; +x moves the foot back), feet at y=0.
  // head & tail are children of body (head pivot at the neck, tail pivot at its root). L = -X side (same convention as K3.char armL/legL).
  const MPA={sbRabbit:['#9a8470',.95,0,null],sbRabbitL:['#e2d6c4',.95,0,null],sbPink:['#e8a3a0',.8,0,null],sbDeer:['#b07642',.9,0,null],sbDeerL:['#f0e4cc',.9,0,null],sbHoof:['#2f2622',.8,0,null],
    sbNose:['#2a2220',.6,0,null],sbAntler:['#dcc89e',.8,0,null],sbBoar:['#54423a',1,0,null],sbBoarD:['#2e2420',1,0,null],sbTusk:['#f4eddc',.6,0,null],sbWolf:['#8e9298',.95,0,null],sbWolfL:['#dcdad4',.95,0,null],
    sbBear:['#5e402a',1,0,null],sbBearL:['#9a7650',1,0,null],sbBird:['#7a5a3e',.9,0,null],sbBirdB:['#e0783a',.9,0,null],sbBeak:['#e8b030',.6,0,null],
    sbMug:['#8da283',.8,0,null],sbMugStem:['#6e8260',.9,0,null],sbGinger:['#5e9e42',.85,0,null],sbGingerSt:['#7aa64e',.85,0,null],sbGingerR:['#d9b27a',.85,0,null],sbTurmR:['#e48a1c',.7,0,null],
    sbTurm:['#4f8f3b',.85,0,null],sbCent:['#69ac48',.8,0,null],sbMint:['#5cbc4c',.8,0,null],sbAloe:['#7fa77a',.6,0,null],sbHive:['#c9a86e',.95,0,null],sbHiveD:['#8e7046',.95,0,null],sbBee:['#f2c230',.6,0,null],
    sbComb:['#f0c458',.6,0,null],sbHoney:['#e89a18',.22,0,null],sbBandage:['#ece0c4',.95,0,null],sbLeafWrap:['#4f8a3a',.8,0,null],sbPaste:['#6f8f3a',.7,0,null],sbTea:['#7a5a24',.25,0,null],
    sbFeather:['#e8e2d6',.8,0,null],sbBread:['#dcae5a',.85,0,null],sbCrust:['#b07a34',.85,0,null],sbStew:['#8a5a2a',.25,0,null],sbMintWater:['#a8d89a',.15,0,null],sbSeedFlax:['#8a5a30',.6,0,null],sbSeedGourd:['#efe6cf',.7,0,null],sbFeatherD:['#5a4a3e',.8,0,null],sbEgg:['#f2e6cc',.6,0,null],sbMurky:['#7a6a3a',.3,0,null],sbWaterDrop:['#4aa0d8',.1,.1,null]};
  for(const k in MPA)if(!K.MP[k])K.MP[k]=MPA[k];
  const pivot=(x,y,z,name)=>{const P=new T.Group();P.position.set(x,y,z);if(name)P.name=name;return P;};
  // 4 legs: front pivots at z=zf, back at z=zb, |x|=xw, pivot height h; build(P,isFront) adds the leg meshes hanging from the pivot down to -h
  const legs4=(G,xw,h,zf,zb,build,xb)=>{const r={legFL:pivot(-xw,h,zf,'legFL'),legFR:pivot(xw,h,zf,'legFR'),legBL:pivot(-(xb||xw),h,zb,'legBL'),legBR:pivot(xb||xw,h,zb,'legBR')};
    for(const k in r){build(r[k],k[3]==='F');G.add(r[k]);}return r;};
  const eyes=(P,x,y,z,r)=>{[-1,1].forEach(d=>P.add(oct(r,'sbInk',{x:d*x,y,z})));};
  const ANIMALS={
    rabbit:()=>{const G=g(),c='sbRabbit',lt='sbRabbitL',body=pivot(0,4.3,-0.6,'body');G.add(body);
      body.add(blob(3.7,c,{sx:0.9,sy:0.82,sz:1.12},21,0.15),K.ico(2.4,lt,{y:-0.8,z:1.7,sx:0.9,sy:0.7,sz:0.8},0,0.1,22));
      const head=pivot(0,1.9,3.0,'head');body.add(head);head.add(blob(2.3,c,{y:0.7,z:0.6,sx:0.95,sy:0.9,sz:1.05},23,0.12));
      [-1,1].forEach(d=>head.add(K.box(1.15,5.2,0.55,c,{x:d*0.95,y:2,z:-0.2,rx:-0.3,rz:-d*0.16}),K.box(0.62,4,0.2,'sbPink',{x:d*0.95,y:2.4,z:0.07,rx:-0.3,rz:-d*0.16})));
      eyes(head,1.32,1.25,2.05,0.38);head.add(oct(0.42,'sbPink',{y:0.55,z:2.95}));
      const tail=pivot(0,0.6,-3.9,'tail');body.add(tail);tail.add(K.ico(1.15,lt,{},0,0.2,24));
      const L=legs4(G,1.2,2.4,1.9,-2.1,(P,f)=>{if(f)P.add(K.cyl(0.55,0.45,2.4,c,{y:-2.4},4),K.box(1,0.6,1.4,c,{y:-2.4,z:0.3}));else P.add(blob(1.6,c,{y:-0.4,sx:0.62,sz:1.1},25,0.1),K.box(1.1,0.7,3.4,c,{y:-3.2,z:0.6}));},1.9);
      L.legBL.position.y=L.legBR.position.y=3.2;G.userData.rig=Object.assign({body,head,tail},L);return G;},
    deer:(male)=>{const G=g(),c='sbDeer',lt='sbDeerL',body=pivot(0,28,0,'body');G.add(body);
      body.add(K.ico(9,c,{sx:0.78,sy:0.72,sz:1.45},1,0.1,31),K.ico(3.6,lt,{y:-0.4,z:-11.4,sx:1.05,sy:1.2,sz:0.55},0,0.1,32),limb([0,2.5,9],[0,10.5,13.5],3.3,2.4,c,6));
      const head=pivot(0,11.5,14,'head');body.add(head);head.add(K.ico(3.4,c,{y:0.8,z:0.8,sx:0.9,sy:0.85,sz:1.2},0,0.1,33),K.box(2.5,2.3,4.4,c,{y:-0.9,z:3.4}),oct(0.75,'sbNose',{y:0.5,z:5.7,sy:0.8}));
      eyes(head,1.75,1.4,3.1,0.42);[-1,1].forEach(d=>head.add(K.cone(1.1,3.6,c,{x:d*2.3,y:2.4,z:-0.6,rz:-d*1.05,sz:0.5},4)));
      if(male)[-1,1].forEach(d=>head.add(limb([d*1.1,3,-0.2],[d*3.4,9,-1.6],0.55,0.35,'sbAntler',3),limb([d*2.5,6.6,-1],[d*1.9,9.8,0.9],0.4,0.25,'sbAntler',3)));
      const tail=pivot(0,2.4,-12.6,'tail');body.add(tail);tail.add(K.cone(1.2,3,lt,{rx:-2.5},4));
      const L=legs4(G,3.1,25,9,-9,P=>{P.add(K.cyl(1.5,0.85,25,c,{y:-25},4),K.box(1.7,1.6,2.1,'sbHoof',{y:-25,z:0.2}));});
      G.userData.rig=Object.assign({body,head,tail},L);return G;},
    boar:()=>{const G=g(),c='sbBoar',d='sbBoarD',body=pivot(0,13.5,-0.5,'body');G.add(body);
      body.add(K.ico(9.5,c,{sx:0.82,sy:0.85,sz:1.3},1,0.14,41));[[7,0.2],[3,0.45],[-1.5,0.6],[-6,0.5]].forEach(([z,t],i)=>body.add(K.cone(1.7,4.2,d,{y:5.3+t*1.6,z,rx:-0.45},3)));
      const head=pivot(0,1,10.5,'head');body.add(head);head.add(K.ico(5.2,c,{z:2.5,sx:0.85,sy:0.85,sz:1.25},0,0.12,42),K.cyl(2.2,2.5,4,c,{rx:PI/2,y:-1,z:6.5},6),discA(2.2,'sbPink',{y:-1,z:10.55},6,'z'));
      [-1,1].forEach(s=>head.add(K.cone(0.55,3.2,'sbTusk',{x:s*2,y:-1.8,z:8.6,rx:-0.7,rz:s*0.45},3),K.cone(1.5,3.2,d,{x:s*3,y:3.2,z:0.6,rz:-s*0.6,sz:0.5},3)));eyes(head,2.5,1.5,4.9,0.48);
      const tail=pivot(0,0.5,-12.2,'tail');body.add(tail);tail.add(limb([0,0,0],[0,-3.2,-1.2],0.35,0.25,d,3),oct(0.8,d,{y:-3.6,z:-1.3}));
      const L=legs4(G,4,8,7.5,-7.5,P=>{P.add(K.cyl(1.9,1.4,8,c,{y:-8},5),K.box(2,1.3,2.4,'sbHoof',{y:-8,z:0.3}));});G.userData.rig=Object.assign({body,head,tail},L);return G;},
    wolf:()=>{const G=g(),c='sbWolf',lt='sbWolfL',body=pivot(0,17,-1,'body');G.add(body);
      body.add(K.ico(7.6,c,{sx:0.72,sy:0.78,sz:1.45},1,0.12,51),blob(4.6,lt,{y:-0.6,z:8,sx:0.95,sy:1.1,sz:0.75},52,0.2));
      const head=pivot(0,4.5,10.5,'head');body.add(head);head.add(K.ico(3.6,c,{y:0.8,z:1,sx:0.95,sy:0.85},0,0.1,53),K.box(2.2,2.1,4.4,lt,{y:-0.9,z:3.6}),oct(0.7,'sbNose',{y:0.6,z:5.9,sy:0.8}));
      [-1,1].forEach(s=>head.add(K.cone(1.3,3.4,c,{x:s*1.9,y:3.2,z:0.2,rz:-s*0.22},3)));eyes(head,1.5,1.7,3.95,0.45);
      const tail=pivot(0,2.5,-10.5,'tail');body.add(tail);tail.add(blob(2.8,c,{y:-2.6,z:-3.4,sx:0.8,sy:0.8,sz:1.65,rx:-0.62},54,0.25),oct(1.4,lt,{y:-5.3,z:-5.9}));
      const L=legs4(G,2.5,13,7,-7,P=>{P.add(K.cyl(1.5,1.0,13,c,{y:-13},4),K.box(1.8,1.2,2.4,lt,{y:-13,z:0.4}));},2.7);G.userData.rig=Object.assign({body,head,tail},L);return G;},
    bear:()=>{const G=g(),c='sbBear',lt='sbBearL',body=pivot(0,27,-1,'body');G.add(body);
      body.add(K.ico(15,c,{sx:0.8,sy:0.8,sz:1.3},1,0.12,61),blob(8,c,{y:8,z:6,sx:1.15,sy:0.8,sz:1.05},62,0.2));
      const head=pivot(0,3.5,17.5,'head');body.add(head);head.add(blob(7,c,{y:0.6,z:2.6,sz:0.95},63,0.15),K.box(4.8,3.8,5,lt,{y:-2.8,z:7.6}),oct(1.1,'sbNose',{y:0.8,z:10.2,sy:0.8}));
      [-1,1].forEach(s=>head.add(oct(2.2,c,{x:s*4.6,y:6.2,z:1.2,sz:0.55})));eyes(head,2.8,2.4,8.1,0.62);
      const tail=pivot(0,3,-19.3,'tail');body.add(tail);tail.add(oct(1.7,c,{}));
      const L=legs4(G,6,18,11,-11,P=>{P.add(K.cyl(4,3.3,18,c,{y:-18},6),K.box(4.4,2.4,5.4,c,{y:-18,z:0.8}));},6.4);G.userData.rig=Object.assign({body,head,tail},L);return G;},
    bird:()=>{const G=g(),c='sbBird',body=pivot(0,2.6,0,'body');G.add(body);
      body.add(K.ico(1.7,c,{sx:0.85,sy:0.85,sz:1.35},0,0.1,71),K.ico(1.3,'sbBirdB',{y:-0.3,z:0.85,sx:0.85,sy:0.9,sz:0.8},0,0.1,72));
      const head=pivot(0,1.1,1.5,'head');body.add(head);head.add(K.ico(1.15,c,{y:0.5,z:0.3},0,0.1,73),K.cone(0.4,1.2,'sbBeak',{y:0.4,z:1.25,rx:PI/2},3));eyes(head,0.75,0.75,0.85,0.22);
      const wing=d=>{const P=pivot(d*1.05,0.45,0.1,d<0?'wingL':'wingR'),S=new Soup();S.t([0,0,0.75],[0,0,-1.4],[d*3.4,0.15,-1.15]).t([0,0,0.75],[d*3.4,0.15,-1.15],[d*2.5,0.2,0.4]);P.add(S.mesh(c,{mo:{side:DS}}));body.add(P);return P;};
      const wingL=wing(-1),wingR=wing(1),T2=new Soup();T2.t([0,0.1,-1.8],[-0.95,0.25,-3.5],[0.95,0.25,-3.5]);body.add(T2.mesh(c,{mo:{side:DS}}));
      [-1,1].forEach(d=>G.add(K.cyl(0.14,0.14,1.5,'sbBeak',{x:d*0.55,z:0.2},3)));G.userData.rig={body,head,wingL,wingR};return G;}};
  const deerM=ANIMALS.deer;ANIMALS.deer=()=>deerM(true);ANIMALS.doe=()=>deerM(false);
  M.animal=(kind)=>ANIMALS[kind]?ANIMALS[kind]():missing('animal',kind);

  /* ======================================== I. HERBS, FLOWERS, BEEHIVE ======================================== */
  // lanceolate leaf with a raised midrib from base b, azimuth az
  const lance=(S,b,az,len,wid,up,droop)=>{const dx=Math.cos(az),dz=-Math.sin(az),sx=-dz,sz=dx,P=(t,h)=>[b[0]+dx*len*t,b[1]+h,b[2]+dz*len*t],P1=P(0.3,up*0.55),P2=P(0.65,up*0.85),P3=P(1,up*0.75-(droop||0)),w1=wid*0.5,w2=wid*0.42,f=wid*0.12;
    const L1=[P1[0]+sx*w1,P1[1]-f,P1[2]+sz*w1],R1=[P1[0]-sx*w1,P1[1]-f,P1[2]-sz*w1],L2=[P2[0]+sx*w2,P2[1]-f,P2[2]+sz*w2],R2=[P2[0]-sx*w2,P2[1]-f,P2[2]-sz*w2];
    return S.t(b,L1,P1).t(b,P1,R1).t(L1,L2,P2).t(L1,P2,P1).t(R1,P1,P2).t(R1,P2,R2).t(L2,P3,P2).t(P2,P3,R2);};
  const HERBS={
    mugwort:R=>{const G=g(),S=new Soup(),L=new Soup();for(let i=0;i<7;i++){const a=i/7*TAU+R()*0.5,d=0.8+R()*2,x=Math.cos(a)*d,z=-Math.sin(a)*d,h=13+R()*5,lx=Math.cos(a)*2.6,lz=-Math.sin(a)*2.6;blade(S,x,z,h,0.7,lx,lz,R()*PI,0,1);
        for(let k=0;k<3;k++){const f=0.38+k*0.27,aa=a+(k%2?0.9:-0.9),p=[x+lx*f*f+Math.cos(aa)*1.9,h*f,z+lz*f*f-Math.sin(aa)*1.9];flower(L,p,3.1-k*0.45,5,0.62,aa,0.38);}}
      G.add(S.mesh('sbMugStem',{mo:{side:DS}}),L.mesh('sbMug',{mo:{side:DS}}));return G;},
    ginger:R=>{const G=g(),S=new Soup(),St=new Soup();for(let i=0;i<4;i++){const a=i/4*TAU+R()*0.6,d=1.2+R()*1.4,x=Math.cos(a)*d,z=-Math.sin(a)*d,h=14+R()*5,rk=R()*PI;blade(St,x,z,h,0.9,0,0,rk,0,1);
        for(let k=0;k<6;k++){const y=3+k*(h-3)/6,ang=rk+(k%2?1:-1)*PI/2+(R()-.5)*0.4,len=7+R()*2.5;blade(S,x,z,len*0.75,1.3,Math.cos(ang)*len*0.7,-Math.sin(ang)*len*0.7,ang+PI/2,y);}}
      G.add(St.mesh('sbGingerSt',{mo:{side:DS}}),S.mesh('sbGinger',{mo:{side:DS}}),K.ico(2.2,'sbGingerR',{x:2.6,y:0.6,z:2.2,sx:1.5,sy:0.6},0,0.35,5),K.ico(1.6,'sbGingerR',{x:4,y:0.5,z:3.4,sy:0.6},0,0.35,7));return G;},
    turmeric:R=>{const G=g(),S=new Soup();for(let i=0;i<6;i++){const a=i/6*TAU+R()*0.4;lance(S,[Math.cos(a)*1,1.2,-Math.sin(a)*1],a,9+R()*3,4.6,18+R()*3,3+R()*2);}
      G.add(S.mesh('sbTurm',{mo:{side:DS}}),K.cyl(1.4,1.6,3,'sbGingerSt',{},5),K.ico(1.8,'sbTurmR',{x:2.4,y:0.5,z:2,sx:1.5,sy:0.6},0,0.35,3),K.ico(1.4,'sbTurmR',{x:-2.2,y:0.4,z:2.6,sy:0.6},0,0.35,4));return G;},
    centella:R=>{const G=g(),S=new Soup(),L=new Soup();for(let i=0;i<14;i++){const a=i*2.4+R()*0.6,d=1.5+Math.sqrt(i/14)*6,x=Math.cos(a)*d,z=-Math.sin(a)*d,h=1.6+R()*3.2;
        S.t([x-0.25,0,z],[x+0.25,0,z],[x,h,z]);fan(L,[x,h,z],1.4+R()*0.7,7,0.2+R()*0.3,a,R,0.08);}G.add(S.mesh('sbGingerSt',{mo:{side:DS}}),L.mesh('sbCent',{mo:{side:DS}}));return G;},
    mint:R=>{const G=g(),S=new Soup(),L=new Soup();for(let i=0;i<7;i++){const a=i/7*TAU+R()*0.5,d=0.6+R()*2.6,x=Math.cos(a)*d,z=-Math.sin(a)*d,h=8+R()*4,lx=Math.cos(a)*1.6,lz=-Math.sin(a)*1.6;blade(S,x,z,h,0.5,lx,lz,R()*PI,0,1);
        for(let k=0;k<4;k++){const f=0.35+k*0.21,c=[x+lx*f,h*f,z+lz*f],ph=a+k*PI/2;[-1,1].forEach(sd=>{const aa=ph+sd*PI/2,dx=Math.cos(aa),dz=-Math.sin(aa),l=2.6-k*0.35,w=1.1-k*0.12,px=-dz,pz=dx;
          L.t(c,[c[0]+dx*l*0.5+px*w,c[1]+0.5,c[2]+dz*l*0.5+pz*w],[c[0]+dx*l,c[1]+0.2,c[2]+dz*l]).t(c,[c[0]+dx*l,c[1]+0.2,c[2]+dz*l],[c[0]+dx*l*0.5-px*w,c[1]+0.5,c[2]+dz*l*0.5-pz*w]);});}}
      G.add(S.mesh('sbGingerSt',{mo:{side:DS}}),L.mesh('sbMint',{mo:{side:DS}}));return G;},
    aloe:R=>{const G=g(),S=new Soup();for(let i=0;i<9;i++){const a=i*2.4+R()*0.3,el=0.5+(i/9)*0.9,len=9+R()*4,b=[Math.cos(a)*0.8,0.4,-Math.sin(a)*0.8],t=[b[0]+Math.cos(a)*Math.cos(el)*len,b[1]+Math.sin(el)*len,b[2]-Math.sin(a)*Math.cos(el)*len];
        spindle(S,b,t,2.1,3,0.6,0.15,[0,1,0]);}G.add(S.mesh('sbAloe'));[[2,4,1.5],[-2.2,6,-1],[1,8,-2]].forEach(([x,y,z],i)=>G.add(oct(0.35,'#e8efe0',{x,y,z})));return G;}};
  M.herb=(kind,seed)=>HERBS[kind]?HERBS[kind](RNG((+seed||1)*71+kind.length)):missing('herb',kind);
  const FLC={red:['#d63a36','#f2c230'],yellow:['#f2c230','#c8641e'],white:['#f4f0e6','#f2c230'],purple:['#9a5ad0','#f2d24a']};
  M.flower=(color,seed)=>{const C=FLC[color]||FLC.red,R=RNG((+seed||1)*61+String(color).length),G=g(),S=new Soup(),F=new Soup(),Cn=new Soup();
    for(let i=0;i<7;i++){const a=R()*TAU,d=R()*2.2;blade(S,Math.cos(a)*d,-Math.sin(a)*d,4+R()*2.5,1.2,Math.cos(a)*2.5,-Math.sin(a)*2.5,a+PI/2);}
    for(let i=0;i<5;i++){const a=i/5*TAU+R()*0.6,d=0.6+R()*2.4,x=Math.cos(a)*d,z=-Math.sin(a)*d,h=6.5+R()*3.5,lk=0.8+R()*1.8,lx=Math.cos(a)*lk,lz=-Math.sin(a)*lk,tl=0.35,N=V(Math.sin(tl)*Math.cos(a),Math.cos(tl),-Math.sin(tl)*Math.sin(a));
      blade(S,x,z,h,0.45,lx,lz,R()*PI,0,1);const c=[x+lx,h,z+lz];flower(F,c,1.7,5,tl,a,0.5);fan(Cn,[c[0]+N.x*0.18,c[1]+N.y*0.18,c[2]+N.z*0.18],0.55,5,tl,a,null,0);}
    G.add(S.mesh('sbGrass',{mo:{side:DS}}),F.mesh(C[0],{mo:{side:DS}}),Cn.mesh(C[1],{mo:{side:DS}}));return G;};
  M.beehive=()=>{const G=g(),R=RNG(81);G.add(tube(3.2,4.6,30,'sbOakBark',{},7),tube(4.4,6.4,2.5,'sbOakBark',{},7),coneM(3.3,4.5,'sbOakBark',{y:29.6},5,R,0.4,0,[0.8,0]));
    G.add(limb([1.6,25.5,0],[17,33,1],2.3,1.3,'sbOakBark',5),limb([11,30.4,0.6],[14,35,3],0.7,0.4,'sbOakBark',4),blob(5,'sbOak',{x:17,y:34.5,z:1,sy:0.7},4,0.3));
    const hx=11.6,hy=21.5;G.add(limb([hx,29.6,0.6],[hx,27,0.6],1.2,1.4,'sbHiveD',5),K.ico(4.4,'sbHive',{x:hx,y:hy,z:0.6,sy:1.35},1,0.08,5));
    [hy+2.6,hy-1.4].forEach((y,i)=>G.add(K.ico(4.5-i*0.4,'sbHiveD',{x:hx,y,z:0.6,sy:0.18},0,0.04,6+i)));G.add(oct(1.1,'sbInk',{x:hx,y:hy-4.6,z:2.6,sy:0.6}));
    [[hx+5,hy+3,4],[hx-4.5,hy-2,4.5],[hx+3,hy-6,3],[hx-3,hy+6,-3]].forEach(([x,y,z],i)=>G.add(oct(0.55,'sbBee',{x,y,z,sz:1.4}),K.box(1.5,0.08,0.7,'#ffffff',{center:true,x,y:y+0.45,z,mo:{transparent:true,opacity:0.6}})));
    return G;};

  /* ======================================== J. MORE ITEMS ======================================== */
  const GOURD=[[0.01,0],[3,0.25],[4.4,2.4],[4.1,5],[2.2,6.8],[1.6,8.4],[2.1,10],[1.2,11.2]].map(p=>new T.Vector2(p[0],p[1]));
  const flaskBody=(G,m)=>{G.add(K.mesh(new T.LatheGeometry(GOURD,6),m||'sbCalabash',{}),K.cyl(0.9,1.15,1.8,'sbWoodB',{y:10.8},5),K.mesh(new T.CylinderGeometry(3.6,3.9,0.9,7,1,true),'sbRope',{y:6.3}));return G;};
  const drop=(G,m,x,z)=>{G.add(K.ico(2.1,m,{x,y:2.1,z},0,0.08,5),K.cone(1.6,3.4,m,{x,y:3.1,z},5));return G;};
  const herbItem={mugwort:()=>{const G=g(),L=new Soup(),S=new Soup();[[0,0],[2.5,0.8],[-2.4,1]].forEach(([x,a],i)=>{blade(S,x*0.3,0,1,0.5,0,0,0,0,1);flower(L,[x,0.6+i*0.25,i-1],3.3,5,0.15+i*0.08,a,0.32);});S.t([-1,0.4,4],[1,0.4,4],[0,0.6,-5]);G.add(L.mesh('sbMug',{mo:{side:DS}}),S.mesh('sbMugStem',{mo:{side:DS}}));return G;},
    ginger:()=>g(K.ico(2.6,'sbGingerR',{y:1.8,sx:1.6,sy:0.75},0,0.35,5),K.ico(2,'sbGingerR',{x:4.2,y:1.5,z:1.6,sx:1.2,sy:0.8},0,0.35,6),K.ico(1.7,'sbGingerR',{x:-3.8,y:1.3,z:1.8,sy:0.8},0,0.35,7),K.ico(1.5,'sbGingerR',{x:1.2,y:1.4,z:-2.6,sy:0.8},0,0.35,8),discA(1.4,'#f2e2a8',{x:-5.4,y:1.4,z:2.3},6,'-x')),
    turmeric:()=>g(K.ico(2.3,'sbTurmR',{y:1.7,sx:1.7,sy:0.75},0,0.35,5),K.ico(1.8,'sbTurmR',{x:4,y:1.4,z:1.5,sx:1.3,sy:0.8},0,0.35,6),K.ico(1.6,'sbTurmR',{x:-3.4,y:1.3,z:-1.6,sy:0.8},0,0.35,7),discA(1.5,'#ffb21e',{x:6.2,y:1.4,z:1.9},6,'x')),
    centella:()=>{const G=g(),L=new Soup(),S=new Soup();[[-2.6,-1,0.3],[2.4,-0.5,2.4],[0,2.6,4.4]].forEach(([x,z,a])=>{S.t([0,0.3,-4],[0.3,0.3,-4],[x,0.6,z]);fan(L,[x,0.9,z],2.6,7,0.25,a,null,0.1);});G.add(S.mesh('sbGingerSt',{mo:{side:DS}}),L.mesh('sbCent',{mo:{side:DS}}));return G;},
    mint:()=>{const G=g(),S=new Soup(),L=new Soup();S.t([-6,0.6,0],[-6,1.1,0],[6,1,0.4]);for(let k=0;k<4;k++){const x=-4+k*3.2;[-1,1].forEach(sd=>{const c=[x,1,0.2],l=3-k*0.3,w=1.3;L.t(c,[x-w,1.6,sd*l*0.5],[x+0.3,1.2,sd*l]).t(c,[x+0.3,1.2,sd*l],[x+w,1.6,sd*l*0.5]);});}
      fan(L,[6.5,1.4,0.4],1.6,6,0.2,0,null,0.1);G.add(S.mesh('sbGingerSt',{mo:{side:DS}}),L.mesh('sbMint',{mo:{side:DS}}));return G;},
    aloe:()=>{const S=new Soup();spindle(S,[-7.5,1.9,0],[8,1.6,1.2],3.2,4,0.5,0.12,[0,1,0]);return g(S.mesh('sbAloe'),discA(1.5,'#d8ecc4',{x:-7.55,y:1.9,z:0,sy:0.55},6,'-x'),oct(0.4,'#e8efe0',{x:-2,y:3.4,z:0.6}),oct(0.35,'#e8efe0',{x:2.5,y:3.1,z:-0.4}));},
    flower:()=>{const G=g(),S=new Soup(),F=new Soup(),F2=new Soup(),Cn=new Soup();[[-2.6,7,0.4],[0.4,8.4,-0.05],[3,6.6,-0.5]].forEach(([z,len,a],i)=>{const tip=[len*Math.cos(a)-1.5,1.8+i*0.35,z+len*Math.sin(a)];
        S.t([-7,0.4,-0.5],[-7,0.4,0.7],[tip[0]-0.8,tip[1]-0.3,tip[2]]);S.t([-7,0.4,0.1],[-7,1.2,0.1],[tip[0]-0.8,tip[1]-0.3,tip[2]]);flower(i===1?F2:F,tip,3.1,5,0.25,a,0.5);fan(Cn,[tip[0],tip[1]+0.35,tip[2]],0.9,5,0.25,a,null,0);});
      G.add(S.mesh('sbGrass',{mo:{side:DS}}),F.mesh('#d63a36',{mo:{side:DS}}),F2.mesh('#9a5ad0',{mo:{side:DS}}),Cn.mesh('#f2c230',{mo:{side:DS}}),K.mesh(new T.CylinderGeometry(1,1,1.2,5),'sbFiber',{rz:PI/2,x:-4.4,y:0.8}));return G;}};
  Object.assign(IT,{
    honey:()=>{const G=g();G.add(K.cyl(6.5,6.5,2.6,'sbComb',{sz:0.78},6));[[0,0],[2.6,1.5],[-2.6,1.5],[2.6,-1.5],[-2.6,-1.5],[0,3],[0,-3]].forEach(([x,z])=>G.add(disc(1.2,'sbHoney',{x,y:2.63,z:z*0.78,sz:0.85},6)));
      G.add(K.ico(1.1,'sbHoney',{x:5.6,y:0.6,z:2.9,sy:0.6},0,0.1,3),K.cone(0.7,1.6,'sbHoney',{x:5.6,y:0.9,z:2.9},5));return G;},
    water:()=>drop(flaskBody(g()),'sbWaterDrop',6.2,2),waterDirty:()=>drop(flaskBody(g(),'#b88a4a'),'sbMurky',6.2,2),flask:()=>flaskBody(g()),
    mugwort:herbItem.mugwort,ginger:herbItem.ginger,turmeric:herbItem.turmeric,centella:herbItem.centella,mint:herbItem.mint,aloe:herbItem.aloe,flower:herbItem.flower,
    bandage:()=>{const G=g(),S=new Soup();G.add(K.mesh(new T.CylinderGeometry(3.2,3.2,5.5,8),'sbBandage',{rz:PI/2,y:3.2}),discA(1.2,'#c8b890',{x:2.8,y:3.2},6,'x'),K.box(5,0.3,5.4,'sbBandage',{x:2.2,y:0,z:3.4,ry:0.3}));
      lance(S,[-2,6.1,-1.5],0.6,7,3,1.2,0.6);G.add(S.mesh('sbLeafWrap',{mo:{side:DS}}));return G;},
    tea:()=>{const G=g(),st=K.mat('#ffffff',{transparent:true,opacity:0.55});G.add(K.cyl(3.8,2.9,5.2,'sbClayK',{},8),K.mesh(new T.CylinderGeometry(3.95,3.85,0.8,8,1,true),'sbClayK',{y:5.45}),disc(3.6,'sbTea',{y:5.26},8),K.mesh(new T.TorusGeometry(1.5,0.5,3,6,PI),'sbClayK',{x:3.8,y:2.6,ry:0,rz:-PI/2}));
      [[0.4,7.6,0,1.1],[-0.6,10,0.3,0.95],[0.5,12.3,-0.2,0.8]].forEach(([x,y,z,r],i)=>{const m=blob(r*1.3,st,{x,y,z,sx:1.1,sy:0.75},i+5,0.3,0);m.castShadow=false;G.add(m);});return G;},
    medicine:()=>{const G=g(),S=new Soup();G.add(K.cyl(3.9,3.2,4.6,'sbClayK',{},8),K.cyl(4.2,4.2,0.9,'sbClayD',{y:4.4},8),K.dome(3.7,'sbPaste',{y:4.9,sy:0.45},6));lance(S,[0,6.4,0],0.8,5,2.4,0.8,0.4);G.add(S.mesh('sbLeafWrap',{mo:{side:DS}}));return G;},
    salve:()=>{const G=g(),S=new Soup();G.add(blob(4.6,'sbLeafWrap',{y:2.6,sx:1.3,sy:0.55,sz:1.05},7,0.15));lance(S,[-4.5,3.6,0],0,9.5,5.2,1.6,0.8);G.add(S.mesh('sbGourdL',{mo:{side:DS}}),K.box(12,0.5,0.9,'sbFiber',{center:true,y:4.6,ry:0.3}),K.box(0.9,0.5,10,'sbFiber',{center:true,x:0.8,y:4.6}));return G;},
    smudge:()=>{const G=g(),L=new Soup();G.add(K.mesh(new T.CylinderGeometry(1.8,2.4,10,6),'sbMugStem',{rz:PI/2,x:-1,y:2.4}));[[3.8,2.6,0],[5.2,3.4,1.2],[5,2.2,-1.4]].forEach(([x,y,z],i)=>flower(L,[x,y,z],2.4,5,1.3,i*2,0.35));
      G.add(L.mesh('#9aa58a',{mo:{side:DS}}),K.mesh(new T.CylinderGeometry(2.25,2.3,1,6),'sbRope',{rz:PI/2,x:-3.5,y:2.4}),K.mesh(new T.CylinderGeometry(2.1,2.15,1,6),'sbRope',{rz:PI/2,x:0.5,y:2.4}));return G;},
    coat:()=>coatItem('hide','sbFur2'),furcoat:()=>coatItem('sbFur','sbFurD',true),
    boots:()=>{const G=g();[[-3.2,0.15],[3.2,-0.2]].forEach(([x,r])=>{const B=g(K.box(3.4,6,3.4,'sbLeather',{y:1.6}),K.box(3.6,2.2,6.2,'sbLeather',{z:1.4}),K.cyl(2.3,2.2,1.6,'sbFur2',{y:6.6},6),K.box(3.8,0.5,6.4,'sbFurD',{z:1.4}));B.position.x=x;B.rotation.y=r;G.add(B);});return G;},
    needle:()=>{const G=g(),S=new Soup();spindle(S,[-7,0.6,0],[7,0.6,0],0.55,4,1,0.75);G.add(S.mesh('sbBone'),limb([-6.4,0.7,0],[-9,0.5,3.5],0.18,0.18,'sbFiber',3),limb([-9,0.5,3.5],[-4,0.4,5.5],0.18,0.18,'sbFiber',3));return G;},
    feather:()=>{const G=g(),S=new Soup(),D=new Soup();const pts=[[-7,0],[-4,1.6],[1,2.4],[5,1.6],[7.5,0.2],[5,-1.4],[1,-2.2],[-4,-1.5]];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],sw=(i>=3&&i<=5);(sw?D:S).t([1.5,0.5,0],[a[0],0.4+Math.abs(a[1])*0.12,a[1]],[b[0],0.4+Math.abs(b[1])*0.12,b[1]]);}
      G.add(S.mesh('sbFeather',{mo:{side:DS}}),D.mesh('sbFeatherD',{mo:{side:DS}}),limb([-10,0.5,0],[7.5,0.6,0],0.25,0.15,'sbBone',3));return G;},
    egg:()=>g(K.mesh(new T.TorusGeometry(4.2,1.5,4,9),'sbStraw',{y:1.2,rx:-PI/2}),K.ico(2.9,'sbEgg',{y:3.6,sy:1.28},1,0.02,3),oct(0.3,'#8a6a4a',{x:1.2,y:5.4,z:2.3}))});
  function coatItem(m,trim,fur){const G=g();G.add(K.box(10,1.4,13,m,{z:0.5}),K.box(7.5,1.3,4.2,m,{x:-6.6,z:-3.4,ry:-0.5}),K.box(7.5,1.3,4.2,m,{x:6.6,z:-3.4,ry:0.5}),K.box(1,1.45,10.5,'sbInk',{z:1.6,y:0.02}));
    [-1,1].forEach(d=>G.add(K.box(2.4,1.5,4.5,trim,{x:d*9.6,z:-5.4,ry:d*0.5})));if(fur)G.add(blob(2.6,trim,{y:1.4,z:-5,sx:2.2,sy:0.55,sz:0.85},9,0.3),K.box(10.2,1.5,2.2,trim,{z:6.2}));else G.add(K.box(8,1.6,2,trim,{z:-5.2}),K.box(10.2,1.5,1.4,'sbLeather',{z:6.6}));
    [-0.5,3,6.5].forEach(z=>G.add(oct(0.5,'sbBone',{x:1.2,y:1.5,z,sz:1.6})));return G;}

  /* ======================================== K. OPTIONAL PIECES ======================================== */
  Object.assign(PIECES,{
    scarecrow:()=>{const G=g();G.add(K.cyl(1.2,1.5,44,'dwood',{},6),limb([-15,31,0],[15,31.5,0],0.9,0.9,'dwood',5));
      G.add(K.cyl(5.2,7,13,'hide',{y:20,sz:0.7},7),K.box(26,3.6,4,'hide',{y:29.5}),K.cyl(4.6,5.2,1.6,'sbRope',{y:26,sz:0.72},7));
      [-1,1].forEach(d=>G.add(K.cone(1.6,4,'sbStraw',{x:d*14.4,y:31.4,rz:d*PI/2},4),K.cone(1.4,3.5,'sbStraw',{x:d*2.4,y:20.4,z:1,rx:PI},4)));
      G.add(K.ico(5,'sbCalabash',{y:39},1,0.1,4),K.box(1.4,1.2,0.6,'sbInk',{x:-1.8,y:39.8,z:4.6}),K.box(1.4,1.2,0.6,'sbInk',{x:1.8,y:39.8,z:4.6}),K.box(3.4,0.7,0.6,'sbInk',{y:37.2,z:4.7}));
      G.add(K.cyl(7.6,7.6,0.8,'sbStraw',{y:42.4},8),K.cone(4.2,5.5,'sbStraw',{y:43.2},8),K.ico(1.5,'sbBird',{x:12,y:33.6,z:0.5,sz:1.3},0,0.1,9));return G;},
    beeBox:()=>{const G=g();[-1,1].forEach(a=>[-1,1].forEach(b=>G.add(K.cyl(1,1.2,9,'sbLogB',{x:a*7,z:b*5.5},5))));
      G.add(K.box(18,12,14,'sbWoodA',{y:9}),K.box(20,1.6,16,'sbWoodB',{y:21}),K.box(16,0.8,14,'sbWoodB',{y:22.6}),K.box(7,1,0.6,'sbInk',{y:11,z:7.05}),K.box(8,0.6,3,'sbWoodB',{y:10.2,z:8.4}));
      [[3,13,9],[-4,16,10],[6,18,8],[-1,24,3]].forEach(([x,y,z],i)=>G.add(oct(0.55,'sbBee',{x,y,z,sz:1.4})));return G;},
    rainBarrel:()=>{const G=g(),S=new Soup();G.add(K.cyl(9,8,20,'sbWoodB',{},10),K.cyl(9.35,9.1,1.4,'sbRope',{y:3.5},10),K.cyl(9.15,9.5,1.4,'sbRope',{y:15.5},10),disc(8.4,'water',{y:19.4},10),K.mesh(new T.CylinderGeometry(9,9,0.8,10,1,true),'sbLogB',{y:20.4}));
      G.add(K.cyl(1,1.2,34,'dwood',{x:-13,z:-6},5));lance(S,[-13,33,-6],-0.45,18,9,-6,2);G.add(S.mesh('sbLeafWrap',{mo:{side:DS}}));return G;},
    sign:()=>g(K.cyl(1.2,1.5,26,'dwood',{},6),K.box(18,9,1.6,'sbWoodA',{y:16,z:1.3}),K.box(2.2,2.2,2.6,'sbFiber',{center:true,y:22,z:1}),K.box(9,1.4,0.4,'red',{y:20,z:2.15}),K.cone(2.2,3,'#3e7a9a',{y:17.4,z:2.2,rx:PI/2,ry:0},3),K.box(6,1,0.4,'sbInk',{x:-2,y:18,z:2.15,rz:0.1}))});
  /* ======================================== G. LIST / META ======================================== */
  M.list={
    resources:['tree:pine:0','tree:pine:1','tree:pine:2','tree:oak:0','tree:oak:1','tree:oak:2','tree:birch:0','tree:birch:1','tree:birch:2','tree:dead:0','tree:dead:1','tree:dead:2',
      'stump:pine','stump:oak','stump:birch','stump:dead','log','bush:berry','bush:berryEmpty','bush:shrub','flax','reeds','boulder:1','boulder:2','boulder:3','flintRock','copperRock','clay',
      'mushroom:red','mushroom:brown','pebble','stick','bones',
      'herb:mugwort','herb:ginger','herb:turmeric','herb:centella','herb:mint','herb:aloe','flower:red','flower:yellow','flower:white','flower:purple','beehive'],
    pieces:Object.keys(PIECES),
    crops:['grain','gourd','flax'],cropStages:4,
    tools:Object.keys(TOOLS),
    items:Object.keys(IT),
    animals:Object.keys(ANIMALS),
    herbs:['herb:mugwort','herb:ginger','herb:turmeric','herb:centella','herb:mint','herb:aloe','flower:red','flower:yellow','flower:white','flower:purple','beehive']};
  M.meta={cell:40,floorTop:6,wallH:48,roofRise:30,ridgeY:81,farmTop:3,doorway:[16,34],window:[14,12,27],stairsRise:54,
    footprint:{bed:[1,2],leanto:[1,2],tent:[2,2]},
    rig:{quad:['body','head','legFL','legFR','legBL','legBR','tail'],bird:['body','head','wingL','wingR']},
    flame:['campfire','torch','hearth','kiln','smelter','tool:torch','item:torch'],
    structure:['floor','stoneFloor','wall','wallDoor','wallWindow','stoneWall','stoneWallDoor','roof','roofCap','ridge','gable','fence','gate','stairs']};
  // build by key: 'tree:pine:2', 'piece:wall', 'crop:grain:3', 'tool:axe', 'item:wood' (numeric args auto-converted)
  M.build=(key)=>{const p=String(key).split(':'),fn=p[0],a=p.slice(1).map(v=>v!==''&&!isNaN(v)?+v:v);if(typeof M[fn]!=='function'||['build'].includes(fn))return missing('key',key);return M[fn](...a);};
  window.SBM=M;}
