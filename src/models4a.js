/* ===================== SB MODELS 4a — lifelike low-poly fauna (replaces every animal model) =====================
   Needs models.js (+ models3.js) first: call SBmodels4aInit() after SBmodelsInit()/SBmodels3Init(). Wraps window.SBM:
     M.animal(kind)  NEW versions of rabbit, deer, doe, boar, wolf, bear (Asiatic black bear), bird, tiger, gaur, monkey, crocodile, snake,
                     junglefowl, frog, carp, catfish, snakehead, fish, butterfly  + domestic: chicken, chick, pig, piglet, dog, puppy, goat
     M.fish(v) v='carp'|'catfish'|'snakehead'   M.butterfly(seed)   M.insect(kind) kind='bee'|'mosquito'|'fly'|'dragonfly'|'caterpillar'|'beetle'|'firefly'
     M.animalPose(G,'sit'|'stand') still works (monkey, dog, puppy have a sit pose).  M.animal4aPrev = the wrapped (old) M.animal.  M.list.insects.
   Same conventions as models.js/models3.js: du (1 m ≈ 20 du, human ≈ 36 du), NEW Group per call, deterministic (no Math.random),
   face +Z, feet at y=0. Geometry is smooth-shaded triangle soup with vertex colours on ≤4 shared materials (M.mat4a):
     a4Fur (matte, smooth) · a4Hard (horn, hoof, beak, antler, claws) · a4Gloss (eyes, nose, wet skin, fish) · a4Thin (double sided: wings, fins, feathers) · a4Glow (firefly lamp)
   RIG CONTRACT (G.userData.rig) — unchanged from models.js/models3.js:
     quadrupeds {body, head, tail, legFL, legFR, legBL, legBR}: legs are ROOT children pivoting at shoulder/hip height (+rotation.x swings the foot back);
       head & tail are children of body (head pivot at the neck joint: +rotation.x nods down; tail pivot at its root, rotation.y wags). L = −X side.
     extras: crocodile tail2 (child of tail) · monkey armL/armR (= legFL/legFR) + pose · snake {body, head, seg[7], segRest[7]} ·
       junglefowl/chicken/chick {body, head, wingL, wingR, legL, legR, tail} + legFL/legBR = legL, legFR/legBL = legR aliases ·
       bird {body, head, wingL, wingR, tail} (wings flap with rotation.z; wingL is −X) · frog {…quad, tail = empty} · fish {body, tail} ·
       butterfly {body, wingL, wingR}. userData: len, h, r, kind. Poses (M.animalPose / G.userData.pose): monkey, dog, puppy → 'sit' | 'stand'.
     insects (M.insect): {body, wingL, wingR} (dragonfly: wingL/wingR are groups holding the fore+hind wing of that side; bee/fly/mosquito
       single wing each side; beetle: elytra closed, wings hidden) · caterpillar {body, head, seg[5], segRest[5]} (rotate seg[i].y) ·
       firefly: abdomen mesh named 'glow' (a4Glow emissive material; set .visible or material.emissiveIntensity to blink).
     Insects are built at REAL size (bee ≈ 0.3 du long) but with chunky, high-contrast shapes so they read when the game scales them ×3.
*/
function SBmodels4aInit(){const M=window.SBM;if(!M||M.v4a)return;M.v4a=1;
  const K=(typeof K3!=='undefined')?K3:window.K3,T=K.T,PI=Math.PI,TAU=PI*2;
  /* ---------------- maths ---------------- */
  const hsh=(a,b,c,d)=>{let h=(Math.imul(a|0,0x27d4eb2d)^Math.imul(b|0,0x165667b1)^Math.imul(c|0,0x5bd1e995)^Math.imul((d|0)+7,0x85ebca77))>>>0;h=Math.imul(h^(h>>>15),0x2c1b3c6d);h=Math.imul(h^(h>>>12),0x297a2d39);return ((h^(h>>>15))>>>0)/4294967296;};
  const sm=t=>t*t*(3-2*t),cl=t=>t<0?0:t>1?1:t,ss=(a,b,x)=>sm(cl((x-a)/(b-a)));
  const vn3=(x,y,z,s)=>{const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),fx=sm(x-xi),fy=sm(y-yi),fz=sm(z-zi);let r=0;
    for(let k=0;k<8;k++){const dx=k&1,dy=(k>>1)&1,dz=(k>>2)&1;r+=hsh(xi+dx,yi+dy,zi+dz,s)*(dx?fx:1-fx)*(dy?fy:1-fy)*(dz?fz:1-fz);}return r;};
  const CCH={},C=h=>{if(CCH[h])return CCH[h];const c=new T.Color(h);return CCH[h]=[c.r,c.g,c.b];};
  const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],mul=(a,f)=>[a[0]*f,a[1]*f,a[2]*f];
  const add3=(a,b,k)=>{k=k===undefined?1:k;return [a[0]+b[0]*k,a[1]+b[1]*k,a[2]+b[2]*k];},sub3=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
  const len3=a=>Math.hypot(a[0],a[1],a[2]),nrm3=a=>{const l=len3(a)||1;return [a[0]/l,a[1]/l,a[2]/l];},crs=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const lerp3=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],mx=p=>[-p[0],p[1],p[2]];
  const fur=(c,p,amt,f,s)=>mul(c,1+(vn3(p[0]*(f||0.5),p[1]*(f||0.5),p[2]*(f||0.5),s||1)-0.5)*(amt===undefined?0.16:amt));
  /* ---------------- shared materials ---------------- */
  const vmat=(name,o)=>{const p={vertexColors:true,roughness:o.r,metalness:0,flatShading:!!o.flat};if(o.ds)p.side=T.DoubleSide;if(o.em){p.emissive=new T.Color(o.em);p.emissiveIntensity=o.ei||1;}
    const m=new T.MeshStandardMaterial(p);m.name=name;m.userData.key=name;return m;};
  const MT={a4Fur:vmat('a4Fur',{r:.95}),a4Hard:vmat('a4Hard',{r:.55}),a4Gloss:vmat('a4Gloss',{r:.28}),a4Thin:vmat('a4Thin',{r:.82,ds:1}),a4Glow:vmat('a4Glow',{r:.5,em:'#d8ff5a',ei:1.4})};
  M.mat4a=MT;
  /* ---------------- vertex-coloured smooth soup ---------------- */
  // every triangle carries a colour (rgb array or fn(p,n,q)) and a smoothing group (0 = flat). Normals are averaged per group & position.
  function VB(){this.P=[];this.Q=[];this.F=[];this.gc=0;}
  VB.prototype.grp=function(){return ++this.gc;};
  VB.prototype.t=function(a,b,c,cf,g,qa,qb,qc){this.P.push(a,b,c);this.Q.push(qa,qb,qc);this.F.push(cf,g||0);return this;};
  VB.prototype.o=function(a,b,c,ref,cf,g,qa,qb,qc,inw){const n=crs(sub3(b,a),sub3(c,a)),m=sub3([(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3],ref);
    return ((dot(n,m)>=0)!==!!inw)?this.t(a,b,c,cf,g,qa,qb,qc):this.t(a,c,b,cf,g,qa,qc,qb);};
  VB.prototype.q=function(a,b,c,d,ref,cf,g,qa,qb,qc,qd){this.o(a,b,c,ref,cf,g,qa,qb,qc);return this.o(a,c,d,ref,cf,g,qa,qc,qd);};
  VB.prototype.n=function(){return this.P.length/3;};
  // triangle with explicit corner normals (surface decals: stripes, bands) — orientation follows the normals
  VB.prototype.tn=function(a,b,c,na,nb,nc,cf){const n=crs(sub3(b,a),sub3(c,a));if(dot(n,add3(add3(na,nb),nc))<0){const t=b;b=c;c=t;const u=nb;nb=nc;nc=u;}this.P.push(a,b,c);this.Q.push(null,null,null);this.F.push(cf,-1);(this.NO||(this.NO={}))[this.P.length/3-1]=[na,nb,nc];return this;};
  const KQ=p=>Math.round(p[0]*500)+','+Math.round(p[1]*500)+','+Math.round(p[2]*500);
  VB.prototype.mesh=function(m,off,name){const nt=this.P.length/3;if(!nt)return null;const pos=new Float32Array(nt*9),nor=new Float32Array(nt*9),col=new Float32Array(nt*9),FN=[],acc={};
    for(let i=0;i<nt;i++){const a=this.P[i*3],b=this.P[i*3+1],c=this.P[i*3+2],n=crs(sub3(b,a),sub3(c,a));FN.push(n);const g=this.F[i*2+1];
      if(g>0)for(const p of [a,b,c]){const k=g+'|'+KQ(p),s=acc[k]||(acc[k]=[0,0,0]);s[0]+=n[0];s[1]+=n[1];s[2]+=n[2];}}
    for(let i=0;i<nt;i++){const cf=this.F[i*2],g=this.F[i*2+1],fn=nrm3(FN[i]),no=g<0?this.NO[i]:null;for(let k=0;k<3;k++){const p=this.P[i*3+k],n=no?nrm3(no[k]):g?nrm3(acc[g+'|'+KQ(p)]):fn,o=i*9+k*3,
        c=typeof cf==='function'?cf(p,n,this.Q[i*3+k]||{}):cf;pos[o]=p[0]-(off?off[0]:0);pos[o+1]=p[1]-(off?off[1]:0);pos[o+2]=p[2]-(off?off[2]:0);nor[o]=n[0];nor[o+1]=n[1];nor[o+2]=n[2];col[o]=c[0];col[o+1]=c[1];col[o+2]=c[2];}}
    const ge=new T.BufferGeometry();ge.setAttribute('position',new T.BufferAttribute(pos,3));ge.setAttribute('normal',new T.BufferAttribute(nor,3));ge.setAttribute('color',new T.BufferAttribute(col,3));
    const ms=new T.Mesh(ge,MT[m]);ms.name=name||m;ms.castShadow=true;ms.receiveShadow=true;return ms;};
  /* ---------------- shape builders (all in ROOT coordinates; meshes are offset into their pivot later) ---------------- */
  // ring: [x,y,z, w (half width along side), t (towards `up`, dorsal/front), b (opposite), p (superellipse exponent, 2 = ellipse)]
  // o: {side:[1,0,0] reference, up:[0,1,0] (flip guard, null = none), cap0/cap1: point | true (flat), g: smoothing group, rot}
  function frames(R,o){const L=R.length,F=[];let side0=null;for(let i=0;i<L;i++){const a=R[Math.max(0,i-1)],b=R[Math.min(L-1,i+1)],d=nrm3([b[0]-a[0],b[1]-a[1],b[2]-a[2]]),rf=o.side||[1,0,0];
      let sd=sub3(rf,mul(d,dot(rf,d)));if(len3(sd)<1e-3)sd=side0||[0,0,1];sd=nrm3(sd);let up=crs(d,sd);const ur=o.up===undefined?[0,1,0]:o.up;if(ur&&dot(up,ur)<-0.3){sd=mul(sd,-1);up=mul(up,-1);}
      side0=sd;const r=R[i];F.push({c:[r[0],r[1],r[2]],d,sd,up,w:r[3],t:r[4],b:r[5]===undefined?r[4]:r[5],p:r[6]||2});}return F;}
  const ringPt=(f,th)=>{const cs=Math.cos(th),sn=Math.sin(th),e=2/f.p,x=Math.sign(cs)*Math.pow(Math.abs(cs),e)*f.w,y=Math.sign(sn)*Math.pow(Math.abs(sn),e)*(sn>0?f.t:f.b);return add3(add3(f.c,f.sd,x),f.up,y);};
  function loft(B,R,n,cf,o){o=o||{};const F=frames(R,o),L=F.length,g=o.g===undefined?B.grp():o.g,rot=o.rot===undefined?PI/2:o.rot,P=[],Qs=[];
    for(let i=0;i<L;i++){const ring=[],qs=[];for(let j=0;j<n;j++){const th=rot+j/n*TAU;ring.push(ringPt(F[i],th));qs.push({s:i/(L-1),a:Math.atan2(Math.sin(th),Math.cos(th)),i});}P.push(ring);Qs.push(qs);}
    for(let i=0;i<L-1;i++){const ref=lerp3(F[i].c,F[i+1].c,0.5);for(let j=0;j<n;j++){const j1=(j+1)%n;let k=cf;if(o.face){const ce=mul(add3(add3(P[i][j],P[i][j1]),add3(P[i+1][j1],P[i+1][j])),0.25);k=cf(ce,nrm3(sub3(ce,ref)),{i,s:(i+0.5)/(L-1),a:Qs[i][j].a});}
      B.q(P[i][j],P[i][j1],P[i+1][j1],P[i+1][j],ref,k,g,Qs[i][j],Qs[i][j1],Qs[i+1][j1],Qs[i+1][j]);}}
    const cap=(i,tip,inw)=>{const cff=o.face&&typeof cf==='function'?cf(F[i].c,F[i].d,{i,s:i?1:0,tip:1}):cf,flat=tip===true,tp=flat?F[i].c:tip,ref=flat?add3(F[i].c,F[i].d,i?-1:1):F[i===0?Math.min(1,L-1):Math.max(0,L-2)].c,gg=flat?(o.flatCap?0:B.grp()):g;
      for(let j=0;j<n;j++)B.o(P[i][j],P[i][(j+1)%n],tp,ref,cff,gg,Qs[i][j],Qs[i][(j+1)%n],{s:i?1:0,a:0,i,tip:1});};
    if(o.cap0)cap(0,o.cap0);if(o.cap1)cap(L-1,o.cap1);F.P=P;F.rot=rot;F.n=n;return F;}
  // point on a loft surface at fractional ring index s and angle th (PI/2 = up/dorsal, 0 = +side), pushed out by off
  const surf=(F,s,th,off)=>{const i=Math.max(0,Math.min(F.length-2,Math.floor(s))),f=cl(s-i),A=F[i],Bf=F[i+1],fr={c:lerp3(A.c,Bf.c,f),sd:nrm3(lerp3(A.sd,Bf.sd,f)),up:nrm3(lerp3(A.up,Bf.up,f)),
      w:A.w+(Bf.w-A.w)*f,t:A.t+(Bf.t-A.t)*f,b:A.b+(Bf.b-A.b)*f,p:A.p+(Bf.p-A.p)*f},p=ringPt(fr,th);return add3(p,nrm3(sub3(p,fr.c)),off||0);};
  // same, also returning the surface normal (ellipse gradient) → {p,n}
  const surfN=(F,s,th,off)=>{const i=Math.max(0,Math.min(F.length-2,Math.floor(s))),f=cl(s-i),A=F[i],Bf=F[i+1],c=lerp3(A.c,Bf.c,f),sd=nrm3(lerp3(A.sd,Bf.sd,f)),up=nrm3(lerp3(A.up,Bf.up,f)),
      w=A.w+(Bf.w-A.w)*f,t=A.t+(Bf.t-A.t)*f,b=A.b+(Bf.b-A.b)*f,pp=A.p+(Bf.p-A.p)*f,fr={c,sd,up,w,t,b,p:pp},p=ringPt(fr,th),cs=Math.cos(th),sn=Math.sin(th),h=sn>0?t:b,
      n=nrm3(add3(mul(sd,Math.sign(cs)*Math.pow(Math.abs(cs),2-2/pp)/w),up,Math.sign(sn)*Math.pow(Math.abs(sn),2-2/pp)/h));
    let q=p;if(F.P){// exact point on the faceted mesh (same diagonal split as loft quads)
      let u=((th-F.rot)/TAU*F.n)%F.n;if(u<0)u+=F.n;const j=Math.floor(u)%F.n,j1=(j+1)%F.n,fu=u-Math.floor(u),A=F.P[i][j],Bv=F.P[i][j1],Cv=F.P[i+1][j1],D=F.P[i+1][j];
      q=fu>=f?add3(add3(A,sub3(Bv,A),fu),sub3(Cv,Bv),f):add3(add3(A,sub3(D,A),f),sub3(Cv,D),fu);}
    return {p:add3(q,n,off||0.05),n};};
  // closed band around a loft at ring position s (width hw in ring units), sampled on the mesh columns
  function ringBand(B,F,s,hw,cf,off){const R=[];for(let j=0;j<=F.n;j++){const th=F.rot+j/F.n*TAU;R.push([surfN(F,s-hw,th,off||0.04),surfN(F,s+hw,th,off||0.04)]);}
    for(let j=0;j<F.n;j++){const a=R[j][0],b=R[j][1],c=R[j+1][1],d=R[j+1][0];B.tn(a.p,b.p,c.p,a.n,b.n,c.n,cf);B.tn(a.p,c.p,d.p,a.n,c.n,d.n,cf);}}
  // stripe running across θ from (s0,th0) to (s1,th1), sampled at every mesh column in between so it hugs the facets; hw half-width (ring units), tapered tip
  function bar(B,F,s0,th0,s1,th1,hw,cf,o){o=o||{};const ths=[th0],st=TAU/F.n,dir=Math.sign(th1-th0)||1;let k=Math.floor((th0-F.rot)/st)+(dir>0?1:0);
    for(let g=0;g<40;g++){const t=F.rot+k*st;if(dir>0?t>=th1-1e-4:t<=th1+1e-4)break;if(dir>0?t>th0+1e-4:t<th0-1e-4)ths.push(t);k+=dir;}ths.push(th1);
    const path=ths.map(t=>{const u=(t-th0)/((th1-th0)||1);return [s0+(s1-s0)*u+(o.wig?Math.sin(u*PI*2+(o.ph||0))*o.wig:0),t,u];});
    const rows=path.map(([s,t,u],i)=>{const w=hw*(o.even?1:(1-0.85*Math.pow(u,1.6)))*(i===0&&!o.blunt?0.7:1);return [surfN(F,s-w,t,o.off||0.04),surfN(F,s+w,t,o.off||0.04)];}),L=rows.length;
    for(let i=0;i<L-1;i++){const a=rows[i][0],b=rows[i][1],c=rows[i+1][1],d=rows[i+1][0];if(i===L-2&&!o.even){const e=surfN(F,path[L-1][0],path[L-1][1],o.off||0.04);B.tn(a.p,b.p,e.p,a.n,b.n,e.n,cf);}
      else{B.tn(a.p,b.p,c.p,a.n,b.n,c.n,cf);B.tn(a.p,c.p,d.p,a.n,c.n,d.n,cf);}}}
  // simple tube along a polyline with radii (circle n sides)
  const tube=(B,P,r,n,cf,o)=>loft(B,P.map((p,i)=>[p[0],p[1],p[2],Array.isArray(r[i])?r[i][0]:r[i],Array.isArray(r[i])?r[i][1]:r[i],Array.isArray(r[i])?r[i][2]||r[i][1]:r[i]]),n,cf,o);
  // smooth ellipsoid (lat-long ws×hs), axis-aligned scale s
  function ball(B,c,r,s,ws,hs,cf,g){g=g===undefined?B.grp():g;const P=[];for(let j=0;j<=hs;j++){const v=PI*j/hs,row=[];for(let i=0;i<ws;i++){const u=TAU*i/ws;row.push([c[0]+Math.sin(v)*Math.sin(u)*r*s[0],c[1]+Math.cos(v)*r*s[1],c[2]+Math.sin(v)*Math.cos(u)*r*s[2]]);}P.push(row);}
    for(let j=0;j<hs;j++)for(let i=0;i<ws;i++){const i2=(i+1)%ws;if(j>0)B.o(P[j][i],P[j][i2],P[j+1][i2],c,cf,g);if(j<hs-1)B.o(P[j][i],P[j+1][i2],P[j+1][i],c,cf,g);}return B;}
  // octahedron (8 tris), smooth → reads as a tiny sphere (eyes, nostrils, berries)
  const octa=(B,c,r,s,cf,g)=>{s=s||[1,1,1];g=g===undefined?B.grp():g;const X=[[r*s[0],0,0],[-r*s[0],0,0]],Y=[[0,r*s[1],0],[0,-r*s[1],0]],Z=[[0,0,r*s[2]],[0,0,-r*s[2]]];
    for(const x of X)for(const y of Y)for(const z of Z)B.o(add3(c,x),add3(c,y),add3(c,z),c,cf,g);return B;};
  // eye: glossy dark ball + a tiny catch-light (light from above-front); out = outward direction of the face side
  const EYEHL=C('#f4f1e6');
  function eye(B,c,r,out,col,s){out=nrm3(out);s=s||[1,1,1];octa(B,c,r,s,col);const hd=nrm3(add3(add3(out,[0,0.7,0]),[0,0,0.5])),l1=Math.abs(hd[0])/s[0]+Math.abs(hd[1])/s[1]+Math.abs(hd[2])/s[2],h=add3(c,hd,r*1.06/l1),u=nrm3(crs(hd,[0,1,0.001])),v=nrm3(crs(u,hd)),k=r*0.32;
    B.o(add3(h,u,-k),add3(h,u,k),add3(h,v,k*1.3),c,EYEHL,0);}
  // cone/spike (horns, claws, beaks)
  function spike(B,b,a,r,n,cf,cap,fl,g){const d=nrm3(sub3(a,b));const u=nrm3(crs(Math.abs(d[1])<0.9?[0,1,0]:[1,0,0],d)),v=crs(d,u),rim=[];g=g===undefined?B.grp():g;
    for(let j=0;j<n;j++){const t=j/n*TAU;rim.push(add3(add3(b,u,Math.cos(t)*r),v,Math.sin(t)*r*(fl||1)));}for(let j=0;j<n;j++){B.o(rim[j],rim[(j+1)%n],a,b,cf,g);if(cap)B.o(rim[j],rim[(j+1)%n],b,a,cf,0);}return B;}
  // ear: flattened loft base→tip; `front` = direction the ear opening faces; inner colour where the normal faces front
  function ear(B,base,mid,tip,wd,th,front,cOut,cIn,o){o=o||{};front=nrm3(front);const d=nrm3(sub3(tip,base)),side=nrm3(crs(d,front));
    const R=[[...base,wd*0.62,th,th],[...mid,wd,th*(o.cup||1),th],[...lerp3(mid,tip,0.55),wd*0.62,th*0.8,th*0.8]];
    const cf=(p,n)=>{const k=ss(-0.1,0.45,dot(n,front));return mix(typeof cOut==='function'?cOut(p,n):cOut,typeof cIn==='function'?cIn(p,n):cIn,k);};
    loft(B,R,o.n||6,cf,{side,up:front,cap1:tip,cap0:o.cap0===false?undefined:base});}
  // flat double-sided polygon fan (feathers, fins, wings) → use with a4Thin
  const fan=(B,pts,cf,g)=>{for(let i=1;i<pts.length-1;i++)B.t(pts[0],pts[i],pts[i+1],cf,g||0);return B;};
  /* ---------------- rig assembly ---------------- */
  const grp=(name,pos)=>{const P=new T.Group();if(name)P.name=name;if(pos)P.position.set(pos[0],pos[1],pos[2]);return P;};
  // attach builders' meshes to a pivot whose ROOT-space position is `at`; parentAt = root-space position of the parent pivot
  const pv=(name,at,parent,parentAt)=>{const P=grp(name,parentAt?sub3(at,parentAt):at);P.userData.at=at;if(parent)parent.add(P);return P;};
  const put=(P,B,m,name)=>{const ms=B.mesh(m,P.userData.at,name);if(ms)P.add(ms);return ms;};
  const bbox=(G)=>{G.updateMatrixWorld(true);const b=new T.Box3(),v=new T.Vector3();G.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)b.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});return b;};
  const finish=(G,kind,rig,noSettle)=>{G.userData.rig=rig;const b=bbox(G);if(!noSettle&&Math.abs(b.min.y)>0.02)G.children.forEach(c=>{c.position.y-=b.min.y;});const b2=bbox(G);
    G.userData.h=+(b2.max.y-b2.min.y).toFixed(1);G.userData.len=+(b2.max.z-b2.min.z).toFixed(1);G.userData.r=+(Math.max(b2.max.x-b2.min.x,b2.max.z-b2.min.z)/2).toFixed(1);G.userData.kind=kind;return G;};
  // uniform size change baked into geometry + pivot offsets (rig transforms stay identity-scaled)
  const bakeScale=(G,k)=>{G.traverse(o=>{if(o===G)return;o.position.multiplyScalar(k);if(o.isMesh)o.geometry.scale(k,k,k);});const b=bbox(G);G.userData.h=+(b.max.y-b.min.y).toFixed(1);G.userData.len=+(b.max.z-b.min.z).toFixed(1);G.userData.r=+(Math.max(b.max.x-b.min.x,b.max.z-b.min.z)/2).toFixed(1);return G;};
  const trisOf=o=>{let n=0;o.traverse(m=>{if(m.isMesh){const ge=m.geometry;n+=(ge.index?ge.index.count:ge.attributes.position.count)/3;}});return Math.round(n);};
  if(!M.tris3)M.tris3=trisOf;

  /* ================= generic quadruped =================
     S = {kind, body:[rings], bodyCol(p,n,q), bodyN, bodyAt (pivot), head:{at, rings, n, col, eyes:[s,th,r,col], ears:{…}, extra(HB,FH,hard,gloss)},
          tail:{at, P, r, n, col, cap}, legs:{F:{x,at:[y,z], P:[[dx,y,z,w,f,b],...]}, B:{…}, col(p,n,q,front), n}, extra(body pieces) } */
  function quad(S){const G=grp(),body=pv('body',S.bodyAt,null);G.add(body);
    const BB=new VB(),HD=new VB(),BG=new VB(),BH=new VB();// fur, gloss, hard (body-attached)
    const FB=loft(BB,S.body,S.bodyN||12,S.bodyCol,{cap0:S.bodyCap0,cap1:S.bodyCap1});S.FB=FB;
    if(S.bodyExtra)S.bodyExtra(BB,FB,BG,BH);
    put(body,BB,'a4Fur','fur');put(body,BH,'a4Hard','hard');put(body,BG,'a4Gloss','gloss');
    // head
    const H=S.head,head=pv('head',H.at,body,S.bodyAt),HB=new VB(),HG=new VB(),HH=new VB();
    const FH=loft(HB,H.rings,H.n||10,H.col,{cap1:H.cap1,cap0:H.cap0});H.F=FH;
    if(H.eyes){const [s,th,r,col,sc]=H.eyes;[th,PI-th].forEach((t,k)=>{const p=surf(FH,s,t,-r*0.45),out=nrm3(sub3(p,surf(FH,s,t,-3)));eye(HG,p,r,out,col,sc);});}
    if(H.extra)H.extra(HB,FH,HG,HH);
    put(head,HB,'a4Fur','fur');put(head,HG,'a4Gloss','gloss');put(head,HH,'a4Hard','hard');
    // tail
    let tail=null;if(S.tail){const Tl=S.tail;tail=pv('tail',Tl.at,body,S.bodyAt);const TB=new VB();if(Tl.build)Tl.build(TB);else tube(TB,Tl.P,Tl.r,Tl.n||5,Tl.col,{cap1:Tl.cap,cap0:Tl.P[0]});put(tail,TB,'a4Fur','fur');}
    else{tail=pv('tail',S.bodyAt,body,S.bodyAt);}
    // legs
    const legs={},LS=S.legs;['legFL','legFR','legBL','legBR'].forEach(k=>{const f=k[3]==='F',d=k[4]==='L'?-1:1,sp=f?LS.F:LS.B,at=[d*sp.x,sp.at[0],sp.at[1]],P=pv(k,at,null);G.add(P);
      const LB=new VB(),LH=new VB(),R=sp.P?sp.P.filter((r,i)=>!LS.keep||LS.keep.includes(i)).map(r=>[d*(sp.x+r[0]),r[1],r[2],r[3],r[4],r[5],r[6]]):null,cf=(p,n,q)=>LS.col(p,n,q,f,d);let FL=null;
      if(sp.build)sp.build(LB,LH,d,cf);else FL=loft(LB,R,sp.n||LS.n||6,cf,{side:sp.side?[sp.side[0]*d,sp.side[1],sp.side[2]]:[1,0,0],up:sp.up===undefined?null:sp.up,cap0:sp.cap0?[d*(sp.x+sp.cap0[0]),sp.cap0[1],sp.cap0[2]]:true,cap1:sp.cap1?[d*(sp.x+sp.cap1[0]),sp.cap1[1],sp.cap1[2]]:true});
      if(LS.extra)LS.extra(LB,LH,FL,f,d);put(P,LB,'a4Fur','fur');put(P,LH,'a4Hard','hard');legs[k]=P;});
    const rig=Object.assign({body,head,tail},legs);if(S.extraRig)S.extraRig(G,rig);return finish(G,S.kind,rig);}

  // coat colouring: darker dorsal → side → pale belly, plus soft fur noise; extra(k,p,n,q) for markings
  const coat=(o)=>(p,n,q)=>{let k=mix(o.side,o.back,ss(o.b0===undefined?0.1:o.b0,o.b1||0.85,n[1]));if(o.belly)k=mix(k,o.belly,ss(o.e0===undefined?-0.25:o.e0,o.e1||-0.75,n[1])*(o.by?ss(o.by[0],o.by[1],p[1]):1));
    if(o.f)k=o.f(k,p,n,q);return fur(k,p,o.na===undefined?0.14:o.na,o.nf||0.45,o.ns||3);};
  const sc6=(s)=>r=>[r[0]*s,r[1]*s,r[2]*s,r[3]*s,r[4]*s,r[5]===undefined?r[4]*s:r[5]*s,r[6]];
  const sp3=(s)=>p=>[p[0]*s,p[1]*s,p[2]*s];
  // two eyes: gold/amber iris variant (pupil drawn as a smaller dark ball pushed outwards)
  function eyesIris(G,FH,s,th,r,iris,pupil,ps){[th,PI-th].forEach(t=>{const p=surf(FH,s,t,-r*0.45),out=nrm3(sub3(p,surf(FH,s,t,-3)));eye(G,p,r,out,iris);octa(G,add3(p,out,r*0.62),r*0.48,ps||[0.55,1,0.55],pupil);});}

  /* ================= DEER — sambar stag / hind ================= */
  function deer(male){const c=male?{back:C('#4c3828'),side:C('#6e5139'),belly:C('#b39a7a'),mane:C('#36281d'),rump:C('#8f5e36'),leg:C('#3e3026'),face:C('#64492f'),muz:C('#211a16'),chin:C('#ddd2bc'),inner:C('#a8917a'),ear:C('#5a4330')}
      :{back:C('#6c4b2e'),side:C('#916a45'),belly:C('#d2bf9c'),mane:C('#5a412c'),rump:C('#ad7c4c'),leg:C('#55402e'),face:C('#80603f'),muz:C('#211a16'),chin:C('#e6dbc4'),inner:C('#b8a088'),ear:C('#7a5a3c')};
    const s=male?1:0.92,S6=sc6(s),S3=sp3(s);
    const body=[[0,23.6,-17.6,1.6,1.4,1.6],[0,23.2,-16.4,4.2,3.2,4.4],[0,22.4,-13.2,5.6,4.0,5.6],[0,21.4,-8,6.0,4.2,6.4],[0,21.0,-2,6.3,4.6,6.9],[0,21.6,3.5,6.0,5.2,6.6],
      [0,22.1,8,5.0,5.0,6.2],[0,22.9,11.2,3.8,4.2,5.2],[0,25.5,13.4,3.0,3.3,3.9],[0,29.2,15.0,2.5,2.8,3.0],[0,32.6,16.2,2.15,2.4,2.4],[0,34.6,16.9,1.9,2.0,2.0]].map(S6);
    if(male){body[8][5]*=1.2;body[9][5]*=1.3;body[10][5]*=1.25;body[9][4]*=1.1;body[10][3]*=1.08;}else body.forEach(r=>r[3]*=0.94);
    const bc=coat({side:c.side,back:c.back,belly:c.belly,by:[19*s,15*s],f:(k,p,n)=>{k=mix(k,c.mane,ss(26*s,30*s,p[1])*ss(10*s,13*s,p[2])*0.85);return mix(k,c.rump,ss(-13.5*s,-16.5*s,p[2])*ss(0.3,-0.4,n[1])*0.75);}});
    const hc=(p,n,q)=>{let k=mix(c.face,c.back,ss(0.3,0.9,n[1])*0.5);k=mix(k,c.chin,ss(-0.3,-0.75,n[1])*ss(0.25,0.7,q.s));k=mix(k,c.muz,ss(0.72,0.97,q.s)*ss(-0.2,0.4,n[2])*ss(-0.5,0.3,n[1]));
      const er=Math.hypot(Math.abs(p[0])-2.05*s,p[1]-35.35*s,p[2]-18.75*s);k=mix(k,c.chin,ss(1.1*s,0.75*s,er)*0.55);return fur(k,p,0.1,0.8,4);};
    const legCol=(p,n,q,f)=>{let k=mix(c.side,c.leg,ss(17*s,10*s,p[1]));if(!f)k=mix(k,c.rump,ss(19*s,23*s,p[1])*0.4);k=mix(k,c.belly,ss(0.2,0.8,-n[2]*(f?1:0))*ss(15*s,10*s,p[1])*0.25);
      if(p[1]<1.25*s)k=mix(C('#141110'),C('#2a221d'),ss(0,1.2*s,p[1]));return fur(k,p,0.1,0.6,5);};
    const J=S3([0,34.4,16.8]);
    const hr=[[0,35.3,15.9,1.5,1.4,1.6],[0,35.9,17.1,2.45,2.15,2.3],[0,35.5,18.6,2.5,1.95,2.2],[0,34.4,20.1,1.85,1.6,1.95],[0,33.1,21.6,1.38,1.25,1.55],[0,32.0,22.8,1.12,1.0,1.18],[0,31.4,23.5,0.9,0.85,0.9]].map(S6);
    const LF=[[0,21.0,7.4,1.5,2.2,2.4],[0,16.6,6.9,1.75,2.0,2.3],[0,12.2,7.3,1.1,1.15,1.35],[0,9.0,7.5,0.95,0.95,1.05],[0,7.4,7.5,0.7,0.68,0.8],[0,2.9,7.4,0.6,0.62,0.82],[0,1.4,7.95,0.66,0.78,0.6],[0,0,8.7,0.82,1.05,0.55]].map(S6);
    const LB=[[0,21.6,-12.6,1.8,2.6,2.8],[0,17.2,-10.6,2.3,2.9,2.7],[0,12.6,-13.6,1.35,1.3,1.8],[0,10.0,-15.4,0.9,0.85,1.25],[0,8.8,-15.0,0.7,0.68,0.85],[0,2.9,-13.7,0.6,0.62,0.82],[0,1.4,-13.15,0.66,0.78,0.6],[0,0,-12.4,0.82,1.05,0.55]].map(S6);
    return quad({kind:male?'deer':'doe',bodyAt:S3([0,22,0]),body,bodyN:12,bodyCol:bc,bodyCap0:S3([0,23.4,-18.2]),
      head:{at:J,rings:hr,n:10,col:hc,cap1:S3([0,31.1,23.95]),cap0:S3([0,35.2,15.3]),eyes:[2.2,PI/2-0.74,0.5*s,C('#0e0907'),[0.9,1,1.05]],
        extra:(HB,FH,HG,HH)=>{
          [-1,1].forEach(d=>{const b=surf(FH,1.1,d>0?PI/2-0.72:PI/2+0.72,-0.3);ear(HB,b,add3(b,S3([d*2.4,1.3,-0.9])),add3(b,S3([d*4.6,2.3,-1.3])),1.45*s,0.3*s,[d*0.3,0.3,1],c.ear,(p,n)=>mix(c.inner,C('#e8dccb'),0.35),{cup:1.4});});
          [-1,1].forEach(d=>octa(HG,surf(FH,5.6,PI/2-d*0.6,-0.1),0.22*s,[0.7,1,1],C('#0e0a08')));
          if(male)[-1,1].forEach(d=>{const r0=surf(FH,1.0,PI/2-d*0.38,-0.3),ac=(p)=>mix(C('#5a4630'),C('#d6c49c'),ss(38,49,p[1]));
            const P=[r0,add3(r0,[d*0.7,1.8,-0.9]),add3(r0,[d*2.0,5.0,-2.4]),add3(r0,[d*3.1,8.6,-2.8]),add3(r0,[d*3.6,11.6,-2.0])];tube(HH,P,[0.6,0.55,0.45,0.36,0.27],4,ac,{cap1:add3(r0,[d*3.7,13.2,-1.0])});
            const b1=lerp3(P[1],P[2],0.1);tube(HH,[b1,add3(b1,[d*0.4,1.4,1.9]),add3(b1,[d*0.6,3.0,3.3])],[0.36,0.28,0.17],4,ac,{cap1:add3(b1,[d*0.65,3.8,3.9])});
            const b2=lerp3(P[3],P[4],0.3);tube(HH,[b2,add3(b2,[-d*0.4,1.5,-0.8]),add3(b2,[-d*0.6,3.0,-1.0])],[0.3,0.23,0.14],4,ac,{cap1:add3(b2,[-d*0.65,3.7,-0.9])});});}},
      tail:{at:S3([0,23.5,-17.5]),P:[[0,23.6,-17.0],[0,23.1,-18.3],[0,21.4,-18.9],[0,19.8,-18.9]].map(S3),r:[0.85,1.05,0.95,0.55].map(v=>v*s),n:5,cap:S3([0,19.0,-18.8]),
        col:(p,n)=>mix(male?C('#2e2219'):C('#4a3626'),C('#f0e8da'),ss(0.15,-0.55,n[2])*0.92)},
      legs:{n:6,col:legCol,F:{x:3.4*s,at:[21.6*s,7.4*s],P:LF,cap0:S3([0,23.6,7.4])},B:{x:3.5*s,at:[22.2*s,-12.6*s],P:LB,cap0:S3([0,24.4,-12.6])}}});}

  /* ================= WILD BOAR (Sus scrofa) ================= */
  function boar(){const c={back:C('#2c2420'),side:C('#56483c'),belly:C('#4a3e34'),tip:C('#a08a72'),snout:C('#2a221e'),disc:C('#4a3836'),leg:C('#221c19')};
    const bc=coat({side:c.side,back:c.back,belly:c.belly,na:0.25,nf:0.9,f:(k,p,n)=>mix(k,c.tip,cl((vn3(p[0]*1.3,p[1]*1.3,p[2]*1.3,9)-0.45)*1.4)*0.55)});
    const body=[[0,12.0,-11.8,1.3,1.2,1.4],[0,11.8,-10.8,3.2,2.6,3.3],[0,11.4,-8.0,4.0,3.2,3.8],[0,11.4,-3.6,4.5,3.8,4.4],[0,11.8,0.8,5.0,4.8,4.8],[0,12.0,4.6,5.0,5.5,5.0],[0,11.6,7.4,4.4,5.0,4.6],[0,11.0,9.2,3.6,4.0,4.0]];
    const J=[0,11.4,8.8];
    const hr=[[0,12.2,7.8,3.1,3.5,3.6],[0,11.6,10.0,3.4,3.2,3.6],[0,10.0,12.6,2.5,2.3,2.8],[0,8.6,14.8,1.7,1.65,1.9],[0,7.4,16.6,1.35,1.35,1.4],[0,6.85,17.6,1.3,1.25,1.25]];
    const hc=(p,n,q)=>{let k=mix(c.side,c.back,ss(0.2,0.9,n[1])*0.6);k=mix(k,c.tip,ss(9.6,11.2,p[2])*ss(0.2,-0.5,n[1])*ss(1.5,2.8,Math.abs(p[0]))*0.7);k=mix(k,c.snout,ss(0.55,0.85,q.s));if(q.s>0.97||q.tip)k=c.disc;return fur(k,p,0.16,1.2,6);};
    const legCol=(p,n,q,f)=>{let k=mix(c.side,c.leg,ss(9,5,p[1]));if(p[1]<0.9)k=C('#171312');return fur(k,p,0.12,1,7);};
    return quad({kind:'boar',bodyAt:[0,11.5,0],body,bodyN:11,bodyCol:bc,bodyCap0:[0,12.3,-14.1],
      bodyExtra:(BB,FB)=>{// bristle crest along the spine
        const P=[[0,15.4,-2],[0,16.9,3.0],[0,17.3,6.0],[0,16.0,8.8]],R=P.map((p,i)=>[...p,[0.6,0.85,0.8,0.5][i],[0.4,0.85,0.9,0.45][i],0.3]);
        loft(BB,R,4,(p,n)=>fur(mix(c.back,c.tip,ss(0.6,0.98,n[1])*0.7),p,0.3,2,5),{cap0:[0,15.0,-3.4],cap1:[0,15.2,9.8]});},
      head:{at:J,rings:hr,n:10,col:hc,cap1:true,cap0:[0,12.6,7.0],eyes:[1.75,PI/2-0.62,0.3,C('#120c0a')],
        extra:(HB,FH,HG,HH)=>{[-1,1].forEach(d=>{const b=surf(FH,0.75,d>0?PI/2-0.55:PI/2+0.55,-0.3);ear(HB,b,add3(b,[d*1.1,1.6,-0.4]),add3(b,[d*1.6,3.2,-0.8]),1.0,0.22,[d*0.4,0.2,1],c.back,C('#5a4a40'),{cup:1.3});
            const t0=surf(FH,4.1,d>0?-0.25:PI+0.25,-0.2);tube(HH,[t0,add3(t0,[d*0.45,0.5,0.4]),add3(t0,[d*0.75,1.25,0.25])],[0.24,0.2,0.12],4,(p)=>mix(C('#d8ccb0'),C('#f4eedc'),ss(8,9.5,p[1])),{cap1:add3(t0,[d*0.8,1.7,-0.1])});
            octa(HG,add3(surf(FH,5,PI/2-d*0.5,0),[0,0,0.05]),0.22,[0.8,1,0.6],C('#120c0b'));});}},
      tail:{at:[0,12.5,-11.8],P:[[0,12.6,-11.4],[0,11.8,-12.4],[0,10.0,-12.8],[0,8.4,-12.7]],r:[0.45,0.38,0.3,0.25],n:4,cap:[0,7.4,-12.6],col:(p)=>mix(c.back,C('#1a1614'),ss(10,8,p[1]))},
      legs:{n:6,col:legCol,F:{x:2.7,at:[11.2,5.0],P:[[0,11.2,5.0,1.7,2.3,2.5],[0,7.0,5.2,1.45,1.55,1.75],[0,4.4,5.4,0.85,0.85,0.95],[0,2.8,5.4,0.72,0.72,0.78],[0,1.1,5.6,0.62,0.66,0.7],[0,0,6.2,0.78,0.98,0.6]],cap0:[0,13,5]},
        B:{x:2.7,at:[11.4,-7.8],P:[[0,11.4,-7.8,2.0,2.8,3.0],[0,7.4,-7.3,1.7,2.0,1.95],[0,4.6,-8.8,0.92,0.88,1.12],[0,2.8,-8.4,0.72,0.72,0.78],[0,1.1,-8.0,0.62,0.66,0.7],[0,0,-7.4,0.78,0.98,0.6]],cap0:[0,13.3,-7.8]}}});}

  /* ================= GRAY WOLF ================= */
  function wolf(){const c={back:C('#3e3934'),side:C('#8c7c66'),belly:C('#e2dacb'),tan:C('#a8906c'),muz:C('#6a5642'),nose:C('#141212'),dark:C('#24201d'),ear:C('#4a423a')};
    const bc=coat({side:c.side,back:c.back,belly:c.belly,b0:0.15,na:0.24,nf:0.9,f:(k,p,n)=>{k=mix(k,c.tan,ss(0.15,-0.35,n[1])*ss(-0.85,-0.3,n[1])*0.5);k=mix(k,c.back,ss(7,9.5,p[2])*ss(0.2,0.8,n[1])*0.4);
      return mix(k,c.belly,ss(9.4,11.4,p[2])*ss(-0.1,0.5,n[2])*ss(16.6,12.6,p[1])*0.9);}});
    const body=[[0,15.2,-10.8,1.7,1.7,1.9],[0,15.2,-9.8,3.4,2.9,3.4],[0,14.8,-7.2,3.8,3.1,3.7],[0,14.4,-2.8,3.6,3.0,3.6],[0,14.0,1.2,4.1,3.7,5.2],[0,14.4,4.6,4.2,4.0,5.4],[0,15.0,7.6,3.9,4.1,4.6],[0,15.7,9.7,3.3,3.5,3.6],[0,16.3,11.2,2.6,2.6,2.7]];
    const J=[0,16.5,11.0];
    const hr=[[0,17.4,10.4,2.0,1.9,2.0],[0,17.8,11.7,3.15,2.35,2.3],[0,17.4,13.2,2.7,1.95,2.1],[0,16.6,14.6,1.6,1.25,1.55,2.5],[0,16.25,16.1,1.32,1.1,1.25,2.6],[0,16.05,17.3,1.05,0.9,0.95,2.4]];
    const hc=(p,n,q)=>{let k=mix(c.side,c.back,ss(0.3,0.9,n[1])*0.75);const ax=Math.abs(p[0]);k=mix(k,c.belly,cl(ss(-0.25,-0.65,n[1])+ss(1.9,2.8,ax)*ss(17.8,16.6,p[1])*0.9));
      k=mix(k,c.muz,ss(0.55,0.95,n[1])*ss(13.6,14.6,p[2]));k=mix(k,c.belly,ss(0.75,0.4,Math.hypot(ax-1.95,p[1]-18.35,p[2]-12.9))*0.75);k=mix(k,c.dark,ss(0.5,0.2,Math.hypot(ax-1.6,p[1]-17.85,p[2]-13.6))*0.6);if(q.s>0.96||q.tip)k=c.nose;return fur(k,p,0.12,1,4);};
    const legCol=(p,n,q,f)=>{let k=mix(c.side,c.tan,ss(11,6,p[1]));k=mix(k,c.belly,ss(0.2,0.8,n[2]*(f?-1:1))*ss(12,5,p[1])*0.45);if(f)k=mix(k,c.dark,ss(0.55,0.95,n[2])*ss(8,5,p[1])*ss(2.5,4.5,p[1])*0.55);return fur(k,p,0.12,1,5);};
    return quad({kind:'wolf',bodyAt:[0,14.6,0],body,bodyN:12,bodyCol:bc,bodyCap0:[0,15.2,-11.3],
      head:{at:J,rings:hr,n:10,col:hc,cap1:[0,15.95,17.75],cap0:[0,17.6,9.7],
        extra:(HB,FH,HG,HH)=>{eyesIris(HG,FH,2.15,PI/2-0.5,0.3,C('#c8962e'),C('#0c0a08'));
          [-1,1].forEach(d=>{const b=surf(FH,1.2,d>0?PI/2-0.62:PI/2+0.62,-0.3);ear(HB,b,add3(b,[d*0.6,0.9,-0.25]),add3(b,[d*1.05,1.95,-0.5]),1.3,0.26,[d*0.35,0.15,1],c.ear,C('#8a7c68'),{cup:1.5});});}},
      tail:{at:[0,15.6,-10.5],P:[[0,15.6,-10.2],[0,14.0,-12.0],[0,11.2,-13.0],[0,8.2,-13.4],[0,6.4,-13.3]],r:[0.9,1.5,1.75,1.45,0.75],n:6,cap:[0,5.4,-13.2],
        col:(p,n)=>{let k=mix(c.side,c.back,ss(-0.3,0.6,-n[2]+n[1])*0.7);return fur(mix(k,c.dark,ss(8.8,6.6,p[1])),p,0.18,1,8);}},
      legs:{n:6,col:legCol,F:{x:2.3,at:[14.0,5.2],P:[[0,14.0,5.2,1.5,2.0,2.2],[0,9.0,5.0,1.35,1.4,1.7],[0,5.4,5.5,0.85,0.85,0.95],[0,2.2,5.6,0.7,0.72,0.8],[0,0.85,6.0,0.85,0.95,0.8],[0,0,6.8,0.95,1.05,0.7]],cap0:[0,16,5.2]},
        B:{x:2.4,at:[14.4,-7.6],P:[[0,14.4,-7.6,1.9,2.7,2.8],[0,9.8,-6.4,1.65,2.1,2.0],[0,6.2,-8.8,0.95,0.9,1.1],[0,4.2,-9.6,0.72,0.65,0.85],[0,1.0,-8.8,0.7,0.72,0.8],[0,0,-8.0,0.92,1.05,0.7]],cap0:[0,16.4,-7.6]}}});}

  /* ================= ASIATIC BLACK BEAR (moon bear) — white V on the chest ================= */
  function bear(){const c={blk:C('#1d1a19'),blk2:C('#2c2725'),cream:C('#e9e0c8'),muz:C('#8c6a48'),nose:C('#100c0b'),claw:C('#d8ccb2')};
    const vmark=()=>0;
    const bc=(p,n)=>{let k=mix(c.blk2,c.blk,ss(-0.2,0.7,n[1]));k=fur(k,p,0.35,0.7,11);return mix(k,c.cream,vmark(p,n));};
    const body=[[0,15.2,-15.8,2.4,2.4,2.6],[0,15.0,-14.6,5.4,4.6,5.4],[0,14.8,-11,7.0,5.4,6.6],[0,14.6,-5,7.4,5.4,7.0],[0,15.0,1,7.6,5.8,7.3],[0,15.6,6,7.5,6.2,7.4],[0,15.6,10,6.8,6.2,6.9],[0,15.4,12.8,5.5,5.4,5.6],[0,15.3,14.6,4.3,4.2,4.4]];
    const J=[0,15.6,14.2];
    const hr=[[0,16.4,12.9,3.6,3.6,3.7],[0,16.8,14.8,4.5,3.9,3.7],[0,16.2,17.1,3.9,3.1,3.2],[0,15.0,18.9,2.15,1.95,2.25],[0,14.55,20.5,1.65,1.55,1.75],[0,14.35,21.5,1.32,1.25,1.3]];
    const hc=(p,n,q)=>{let k=fur(mix(c.blk2,c.blk,ss(0,0.8,n[1])),p,0.3,1,12);k=mix(k,c.muz,ss(0.45,0.66,q.s));if(q.s>0.9)k=mix(k,c.nose,ss(0.9,1,q.s)*ss(0.1,0.6,n[1]+n[2]));if(q.tip)k=c.nose;
      return mix(k,C('#d8ccb4'),ss(0.62,0.8,q.s)*ss(-0.4,-0.8,n[1])*0.6);};
    const legCol=(p,n)=>fur(mix(c.blk2,c.blk,0.6),p,0.3,0.8,13);
    const claws=(LH,d,x,y,z)=>{for(let i=-1;i<=1;i++){const b=[d*x+i*0.75,y,z];spike(LH,b,add3(b,[i*0.1,-0.35,0.55]),0.2,3,c.claw);}};
    return quad({kind:'bear',bodyAt:[0,15,0],body,bodyN:12,bodyCol:bc,bodyCap0:[0,15.2,-16.6],
      bodyExtra:(BB,FB)=>{[-1,1].forEach(d=>bar(BB,FB,7.6,-PI/2-d*1.55,6.15,-PI/2-d*0.05,0.38,c.cream,{blunt:1,off:0.06}));},
      head:{at:J,rings:hr,n:10,col:hc,cap1:[0,14.2,22.0],cap0:[0,16.5,12.1],eyes:[2.1,PI/2-0.52,0.36,C('#0b0807')],
        extra:(HB,FH,HG,HH)=>{[-1,1].forEach(d=>{const b=surf(FH,0.95,d>0?PI/2-0.72:PI/2+0.72,-0.5);ear(HB,b,add3(b,[d*1.3,1.4,-0.2]),add3(b,[d*2.1,2.7,-0.35]),2.6,0.42,[d*0.3,0.15,1],c.blk,C('#3a3230'),{cup:1.5,n:7});});}},
      tail:{at:[0,16,-16.2],P:[[0,16,-16],[0,15.6,-17],[0,14.8,-17.3]],r:[0.9,0.9,0.6],n:5,cap:[0,14.4,-17.2],col:c.blk},
      legs:{n:7,col:legCol,F:{x:4.3,at:[15,9],P:[[0,15,9,2.9,3.4,3.5],[0,9,9.2,2.6,2.8,2.9],[0,4,9.5,2.05,2.15,2.25],[0,1.6,9.7,2.05,2.3,2.05],[0,0,10.7,2.3,2.6,1.9]],cap0:[0,17.5,9]},
        B:{x:4.5,at:[15,-11.5],P:[[0,15,-11.5,3.3,4.2,4.4],[0,9.0,-11.0,2.8,3.1,3.0],[0,4.4,-12.3,2.05,2.0,2.45],[0,1.5,-12.0,2.05,2.5,2.05],[0,0,-10.5,2.25,3.1,1.85]],cap0:[0,17.5,-11.5]},
        extra:(LB,LH,FL,f,d)=>claws(LH,d,f?4.3:4.5,0.45,f?12.6:-7.6)}});}

  /* ================= INDOCHINESE TIGER ================= */
  function tiger(){const c={or:C('#c25d1a'),or2:C('#de8a3a'),wh:C('#efe8da'),bk:C('#1a1210'),nose:C('#b0706a'),eye:C('#d8a024')};
    const bc=coat({side:c.or2,back:c.or,belly:c.wh,b0:-0.1,e0:-0.35,e1:-0.7,na:0.1,f:(k,p,n)=>mix(k,c.wh,ss(9,12,p[2])*ss(0.2,0.7,n[2])*ss(16,13,p[1])*0.8)});
    const body=[[0,15.0,-16.0,1.8,1.8,2.0],[0,15.0,-14.8,4.2,3.6,4.2],[0,14.6,-11.6,5.0,4.4,5.0],[0,13.8,-6.0,4.8,4.2,5.0],[0,13.8,0,5.1,4.4,5.6],[0,14.4,5.0,5.4,4.8,6.0],[0,14.8,9.0,5.0,4.6,5.6],[0,15.2,11.8,4.0,3.8,4.4],[0,15.6,13.8,3.4,3.4,3.6]];
    const J=[0,15.8,13.4];const hr=scR([[0,16.8,12.4,2.9,2.9,3.1],[0,17.2,14.1,4.35,3.4,3.6],[0,16.8,15.8,4.15,3.0,3.4],[0,16.0,17.3,2.75,2.1,2.7],[0,15.5,18.3,1.85,1.5,1.95],[0,15.35,18.85,1.2,1.0,1.2]],1.12,J);
    const hc=(p,n,q)=>{let k=mix(c.or2,c.or,ss(0.2,0.9,n[1])*0.6);const ax=Math.abs(p[0]);
      const cheek=ss(2.8,3.9,ax)*ss(15.2,16.8,p[2])*ss(17.6,15.8,p[1]),brow=ss(1.0,0.45,Math.hypot(ax-1.5,p[1]-18.8,p[2]-16.9)),muz=ss(0.5,0.85,q.s)*ss(0.65,-0.2,n[1])*ss(0.25,0.7,ax),chin=ss(-0.3,-0.7,n[1]);
      k=mix(k,c.wh,cl(Math.max(cheek,brow,muz,chin)));if(q.s>0.9&&n[1]>0.1&&n[2]>0.2)k=mix(k,c.nose,ss(0.9,0.97,q.s));if(q.tip)k=c.nose;return fur(k,p,0.08,1,4);};
    const legCol=(p,n,q,f)=>{let k=mix(c.or2,c.wh,ss(0.25,0.75,-n[0]*(p[0]>0?1:-1)-(f?0:0.2))*ss(13,8,p[1])*0.95);k=mix(k,c.or,ss(0.5,0.9,n[2]*(f?1:0))*0.3);return fur(mix(k,c.wh,ss(1.3,0.3,p[1])*0.6),p,0.08,1,5);};
    const G=quad({kind:'tiger',bodyAt:[0,14.6,0],body,bodyN:12,bodyCol:bc,bodyCap0:[0,15,-16.6],
      bodyExtra:(BB,FB,BG,BH)=>{const R=(i)=>hsh(i,3,7,1);// stripes: dorsal → flank, slanted back, some forked
        for(let i=0;i<11;i++){const s0=0.85+i*0.6+(R(i)-.5)*0.12,len=1.5+R(i+20)*0.5,sl=-0.12-R(i+40)*0.14,w=0.1+R(i+60)*0.05;
          [1,-1].forEach(d=>bar(BB,FB,s0,PI/2,s0+sl,PI/2-d*len,w,c.bk,{wig:0.05,ph:i}));}},
      head:{at:J,rings:hr,n:10,col:hc,cap1:[0,15.25,19.25],cap0:[0,16.9,11.9],
        extra:(HB,FH,HG,HH)=>{eyesIris(HG,FH,2.05,PI/2-0.55,0.44,c.eye,C('#0a0806'),[0.45,1,0.5]);
          [-1,1].forEach(d=>{const th=t=>d>0?PI/2-t:PI/2+t;bar(HB,FH,1.45,th(0.12),1.75,th(0.5),0.06,c.bk);bar(HB,FH,1.2,th(0.18),1.4,th(0.42),0.05,c.bk);
            bar(HB,FH,1.2,th(1.2),1.75,th(1.75),0.09,c.bk);bar(HB,FH,1.0,th(0.9),1.35,th(1.3),0.08,c.bk);
            const b=surf(FH,0.95,d>0?PI/2-0.6:PI/2+0.6,-0.3);ear(HB,b,add3(b,[d*0.75,0.85,-0.1]),add3(b,[d*1.15,1.75,-0.2]),1.9,0.32,[d*0.35,0.15,1],(p,n)=>mix(c.bk,c.wh,ss(0.75,0.35,Math.hypot(p[0]-b[0]-d*0.75,p[1]-b[1]-0.85))*ss(0.2,-0.3,n[2])),(p,n)=>mix(c.or,mix(c.or2,c.wh,0.5),ss(1.2,0.5,Math.hypot(p[0]-b[0]-d*0.5,p[1]-b[1]-0.6))),{cup:1.5});
            for(let k=0;k<2;k++){const w0=surf(FH,4.4,d>0?0.05:PI-0.05,0);HB.t(add3(w0,[0,k*0.18-0.18,0]),add3(w0,[0,k*0.18-0.1,0.1]),add3(w0,[d*2.6,k*0.5-0.9,-0.4+k*0.2]),C('#f2eee4'),0);}});}},
      tail:{at:[0,15.4,-15.6],build:(TB)=>{const P=[[0,15.5,-15.2],[0,14.4,-18.0],[0,10.6,-20.8],[0,6.6,-22.4],[0,4.2,-24.6],[0,4.5,-27.0]],FT=tube(TB,P,[1.1,1.0,0.9,0.82,0.76,0.72],6,(p,n)=>fur(mix(c.or2,c.or,ss(-0.2,0.6,n[1])*0.5),p,0.08,1,8),{cap1:[0,5.2,-27.8],cap0:P[0]});
        [1.3,2.05,2.8,3.5,4.2].forEach((s,i)=>ringBand(TB,FT,s,0.12+i*0.014,c.bk));ringBand(TB,FT,4.85,0.25,c.bk);}},
      legs:{n:6,col:legCol,F:{x:3.0,at:[14.6,8.0],P:[[0,14.6,8,2.3,3.0,3.2],[0,9.2,7.6,2.1,2.3,2.6],[0,4.6,8.2,1.5,1.6,1.7],[0,1.8,8.4,1.4,1.5,1.5],[0,0.6,9.0,1.6,1.8,1.4],[0,0,9.8,1.6,1.5,1.1]],cap0:[0,16.6,8]},
        B:{x:3.2,at:[15,-12],P:[[0,15,-12,2.6,3.6,3.5],[0,9.8,-10.6,2.3,2.8,2.4],[0,5.6,-13.4,1.3,1.2,1.6],[0,3.6,-14.2,1.1,1.0,1.3],[0,1.0,-13.0,1.2,1.3,1.2],[0,0,-11.6,1.45,1.55,1.1]],cap0:[0,17,-12]},
        extra:(LB,LH,FL,f,d)=>{if(!FL)return;const th0=d>0?0:PI;(f?[1.2,1.75]:[0.55,1.0,1.45,2.2]).forEach((s,i)=>bar(LB,FL,s,th0+0.9,s+0.06,th0-0.9,0.1,c.bk));}}});
    return G;}

  /* ================= GAUR (bò tót) ================= */
  function gaur(){const c={bk:C('#231914'),bk2:C('#3c2a1e'),tan:C('#a49272'),sock:C('#ddd3b6'),hoof:C('#141110'),horn:C('#c4b680'),hornT:C('#1c1814'),muz:C('#7a7266')};
    const bc=coat({side:c.bk2,back:c.bk,belly:mix(c.bk2,c.bk,0.5),na:0.16,nf:0.25,ns:4});
    const body=[[0,25.5,-22.5,2.6,2.4,2.8],[0,25.4,-21.2,6.4,5.0,6.6],[0,24.6,-17.0,8.0,5.8,8.2],[0,23.6,-9.0,8.6,6.0,9.0],[0,23.6,-1,8.8,7.4,9.6],[0,24.0,5,8.4,9.4,10.2],[0,24.0,10,7.4,9.0,10.8],[0,23.2,14.0,5.8,6.6,9.6],[0,22.8,17.0,4.7,5.0,6.4],[0,22.6,19.0,3.9,4.0,4.4]];
    const J=[0,22.8,18.8];
    const hr=[[0,24.6,17.8,3.6,3.0,3.4],[0,24.6,19.8,4.4,3.2,3.6],[0,22.8,22.4,3.8,2.8,3.2],[0,20.2,25.0,3.0,2.4,2.8],[0,17.8,27.0,2.6,2.2,2.4],[0,16.4,28.0,2.4,2.0,2.0]];
    const hc=(p,n,q)=>{let k=mix(c.bk2,c.bk,ss(0.3,0.9,n[1])*0.5);const fore=ss(0.15,0.5,q.s)*ss(0.75,0.5,q.s)*ss(0.0,0.5,n[1]+n[2]*0.6)*ss(2.6,0.8,Math.abs(p[0]));k=mix(k,c.tan,fore*0.95);
      k=mix(k,c.muz,ss(0.75,0.92,q.s)*ss(-0.2,0.4,n[2]+n[1]*0.3));if(q.tip)k=C('#2a2622');return fur(k,p,0.1,0.6,5);};
    const legCol=(p,n)=>{if(p[1]<1.2)return mix(c.hoof,C('#2a2420'),ss(0,1.2,p[1]));if(p[1]<10.5)return fur(mix(mix(c.sock,C('#b8ab88'),ss(2,9,p[1])*0.6),mix(c.bk2,c.bk,0.4),ss(8.5,10.5,p[1])),p,0.06,1,6);return fur(mix(c.bk2,c.bk,0.4),p,0.12,0.5,6);};
    return quad({kind:'gaur',bodyAt:[0,24,0],body,bodyN:12,bodyCol:bc,bodyCap0:[0,25.5,-23.4],
      head:{at:J,rings:hr,n:10,col:hc,cap1:[0,15.9,28.4],cap0:[0,24.8,16.8],eyes:[2.05,PI/2-0.9,0.5,C('#0c0908')],
        extra:(HB,FH,HG,HH)=>{[-1,1].forEach(d=>{const b=surf(FH,1.3,d>0?0.25:PI-0.25,-0.3);ear(HB,b,add3(b,[d*2.2,-0.3,0.2]),add3(b,[d*4.2,-0.9,0.1]),1.7,0.3,[0,-0.2,1],c.bk2,C('#8a7a64'),{cup:1.4});
            const r0=surf(FH,1.15,PI/2-d*0.72,-0.6),P=[r0,add3(r0,[d*2.4,0.9,-0.3]),add3(r0,[d*4.3,2.6,0.3]),add3(r0,[d*4.6,5.0,1.4]),add3(r0,[d*3.4,6.8,2.2])];
            tube(HH,P,[1.25,1.05,0.82,0.55,0.32],5,(p)=>mix(c.horn,c.hornT,ss(r0[1]+4.6,r0[1]+6.6,p[1])),{cap1:add3(r0,[d*2.5,7.4,2.5])});
            octa(HG,surf(FH,4.8,PI/2-d*0.55,-0.1),0.42,[0.8,1,0.6],C('#191512'));});}},
      tail:{at:[0,27,-22.6],build:(TB)=>{tube(TB,[[0,27,-22.4],[0,25.6,-23.8],[0,20,-24.6],[0,13.6,-24.4]],[0.85,0.6,0.45,0.4],4,c.bk,{cap0:[0,27.6,-21.8]});spike(TB,[0,14.4,-24.4],[0,10.6,-24.2],0.75,5,C('#120e0c'),true);}},
      legs:{n:6,col:legCol,F:{x:5.0,at:[22,10.2],P:[[0,22,10.2,3.0,4.0,4.2],[0,15,10.4,2.9,3.2,3.4],[0,9.8,11.0,1.7,1.8,1.9],[0,7.0,11.2,1.5,1.6,1.7],[0,2.4,11.2,1.25,1.3,1.5],[0,1.2,11.6,1.3,1.5,1.3],[0,0,12.4,1.6,1.9,1.2]],cap0:[0,25,10.2]},
        B:{x:5.2,at:[23,-17.5],P:[[0,23,-17.5,3.2,4.6,4.8],[0,16,-15.6,3.2,3.8,3.4],[0,10.6,-18.6,1.8,1.7,2.3],[0,8.4,-19.2,1.5,1.45,1.8],[0,2.4,-18.2,1.25,1.3,1.5],[0,1.2,-17.8,1.3,1.5,1.3],[0,0,-17.0,1.6,1.9,1.2]],cap0:[0,26,-17.5]}}});}

  /* ================= RABBIT (hare-like, crouched) ================= */
  function rabbit(){const c={back:C('#7a6550'),side:C('#a08668'),belly:C('#ede6da'),ear:C('#8a735c'),earIn:C('#d9b4a8'),tip:C('#2a221c'),nose:C('#c8968a')};
    const bc=coat({side:c.side,back:c.back,belly:c.belly,na:0.2,nf:1.4});
    const body=[[0,4.2,-4.1,1.1,1.0,1.1],[0,4.3,-3.5,2.3,2.2,2.3],[0,4.4,-1.9,2.7,2.6,2.6],[0,4.3,0.2,2.3,2.25,2.3],[0,4.5,1.8,1.95,2.0,2.1],[0,5.3,3.0,1.45,1.45,1.55]];
    const J=[0,5.6,3.0];
    const hr=[[0,6.2,2.4,1.25,1.25,1.25],[0,6.45,3.5,1.72,1.6,1.5],[0,5.9,4.9,1.3,1.2,1.22],[0,5.35,5.85,0.72,0.7,0.72]];
    const hc=(p,n,q)=>{let k=mix(c.side,c.back,ss(0.3,0.9,n[1])*0.6);k=mix(k,c.belly,ss(-0.3,-0.7,n[1])+ss(0.85,0.55,Math.hypot(Math.abs(p[0])-1.15,p[1]-6.55,p[2]-4.25))*0.8);if(q.tip)k=c.nose;return fur(k,p,0.12,2,4);};
    const legCol=(p,n)=>fur(mix(c.side,c.belly,ss(1.2,0.3,p[1])*0.7+ss(-0.3,-0.8,n[1])*0.5),p,0.12,2,5);
    return quad({kind:'rabbit',bodyAt:[0,4.3,-0.6],body,bodyN:8,bodyCol:bc,bodyCap0:[0,4.2,-4.5],bodyCap1:false,
      head:{at:J,rings:hr,n:7,col:hc,cap1:[0,5.2,6.25],cap0:[0,6.1,1.9],eyes:[1.45,PI/2-0.6,0.36,C('#120a08')],
        extra:(HB,FH)=>{[-1,1].forEach(d=>{const b=surf(FH,1.0,d>0?PI/2-0.28:PI/2+0.28,-0.2);ear(HB,b,add3(b,[d*0.35,2.2,-0.9]),add3(b,[d*0.7,4.6,-1.9]),0.95,0.18,[d*0.35,0.1,1],(p)=>mix(c.ear,c.tip,ss(b[1]+3.6,b[1]+4.4,p[1])),c.earIn,{cup:1.6,n:4});});}},
      tail:{at:[0,4.6,-4.2],build:(TB)=>ball(TB,[0,4.9,-4.5],0.95,[1,1,0.9],5,3,c.belly)},
      legs:{n:6,col:legCol,F:{x:1.05,at:[3.2,2.1],n:4,P:[[0,3.4,2.0,0.6,0.7,0.7],[0,1.0,2.35,0.42,0.45,0.45],[0,0,3.0,0.48,0.6,0.4]],cap0:[0,4.2,2.0]},
        B:{x:1.55,at:[3.6,-1.9],build:(LB,LH,d,cf)=>{ball(LB,[d*1.55,3.2,-1.7],1.6,[0.62,1,1.12],5,4,cf);loft(LB,[[d*1.65,0.75,-2.9,0.6,0.55,0.45],[d*1.75,0.5,-1.0,0.66,0.45,0.42],[d*1.8,0.4,0.6,0.5,0.36,0.36]],5,cf,{cap0:[d*1.65,1.3,-3.3],cap1:[d*1.8,0.35,1.0]});}}}});}

  /* ---------------- pose helper: pitch the body about an anchor (body-local), keep legs attached ---------------- */
  function poser(G,spec){const R=G.userData.rig,keys=['body','head','tail','legFL','legFR','legBL','legBR'],rest={};keys.forEach(k=>{const o=R[k];if(o)rest[k]={p:o.position.clone(),r:o.rotation.clone()};});
    const anchors={};['legFL','legFR','legBL','legBR'].forEach(k=>{if(R[k]){R.body.updateMatrix();const inv=R.body.matrix.clone().invert();anchors[k]=R[k].position.clone().applyMatrix4(inv);}});
    G.userData.poses=['stand',spec.name];
    G.userData.pose=(name)=>{keys.forEach(k=>{const o=R[k];if(o&&rest[k]){o.position.copy(rest[k].p);o.rotation.copy(rest[k].r);}});if(name!==spec.name)return G;
      const b=R.body,A=new T.Vector3(...spec.at),w0=A.clone().applyMatrix4(b.matrix);b.rotation.x=-spec.a;b.updateMatrix();const w1=A.clone().applyMatrix4(b.matrix);
      b.position.add(w0.sub(w1));b.position.y-=spec.dy||0;b.updateMatrix();if(R.head)R.head.rotation.x=spec.head===undefined?spec.a*0.85:spec.head;if(R.tail&&spec.tail)R.tail.rotation.x=spec.tail;
      ['legFL','legFR','legBL','legBR'].forEach(k=>{if(!R[k])return;const L=R[k],f=k[3]==='F',d=k[4]==='L'?-1:1,v=anchors[k].clone().applyMatrix4(b.matrix),o=f?spec.F:spec.B;
        L.position.set(v.x+d*(o.dx||0),v.y+(o.dy||0),v.z+(o.dz||0));L.rotation.set(o.rx||0,0,-d*(o.rz||0));});return G;};
    return G;}

  /* ================= RHESUS MACAQUE ================= */
  function monkey(){const c={fur:C('#8a7a62'),fur2:C('#a8916c'),rump:C('#b8783e'),bel:C('#cdbd9e'),face:C('#d49484'),face2:C('#b0685c'),dk:C('#3a2c22')};
    const bc=coat({side:c.fur2,back:c.fur,belly:c.bel,na:0.18,nf:1.4,f:(k,p)=>mix(k,c.rump,ss(-0.5,-3.6,p[2])*0.65)});
    const body=[[0,6.7,-4.6,0.9,0.9,0.9],[0,6.7,-4.0,1.9,1.8,1.9],[0,6.6,-2.5,2.25,2.0,2.2],[0,6.6,0.1,1.95,1.85,2.1],[0,6.85,2.3,2.25,2.2,2.5],[0,7.2,3.9,1.95,1.95,2.1],[0,7.8,4.9,1.25,1.3,1.3]];
    const J=[0,8.0,4.9];
    const hr=[[0,8.4,4.3,1.3,1.3,1.3],[0,8.85,5.2,1.9,1.9,1.75],[0,8.65,6.3,1.8,1.8,1.6],[0,8.05,7.0,1.2,1.1,1.3],[0,7.65,7.5,0.82,0.72,0.82]];
    const hc=(p,n,q)=>{let k=mix(c.fur2,c.fur,ss(0.2,0.9,n[1])*0.6);const face=ss(0.15,0.6,n[2])*ss(9.6,8.6,p[1])*ss(5.9,6.6,p[2]);k=mix(k,mix(c.face,c.face2,ss(8.4,7.4,p[1])),face);if(q.tip)k=c.face2;return fur(k,p,0.1,2,4);};
    const legCol=(p,n,q,f)=>{let k=mix(f?c.fur2:mix(c.fur2,c.rump,0.4),c.fur,0.3);if(p[1]<0.8)k=mix(k,c.face2,0.65);return fur(k,p,0.12,1.5,5);};
    const G=quad({kind:'monkey',bodyAt:[0,6.6,-3.0],body,bodyN:10,bodyCol:bc,bodyCap0:[0,6.7,-5.0],
      head:{at:J,rings:hr,n:9,col:hc,cap1:[0,7.45,7.85],cap0:[0,8.3,3.7],
        extra:(HB,FH,HG,HH)=>{eyesIris(HG,FH,2.55,PI/2-0.42,0.26,C('#6a4a26'),C('#0a0806'),[0.6,0.8,0.6]);
          [-1,1].forEach(d=>{const b=surf(FH,1.4,d>0?0.15:PI-0.15,-0.2);ear(HB,b,add3(b,[d*0.5,0.35,-0.2]),add3(b,[d*0.75,0.9,-0.35]),0.8,0.16,[d,0,0.4],c.face2,c.face,{cup:1.4});
            octa(HG,surf(FH,3.8,PI/2-d*0.35,-0.1),0.12,[1,0.7,0.6],C('#5a2e28'));});
          const br=[surf(FH,2.25,PI/2+0.7,0.05),surf(FH,2.25,PI/2,0.18),surf(FH,2.25,PI/2-0.7,0.05)];HB.o(br[0],br[1],surf(FH,2.0,PI/2,0.05),add3(J,[0,0,0]),c.fur,0);HB.o(br[1],br[2],surf(FH,2.0,PI/2,0.05),J,c.fur,0);}},
      tail:{at:[0,7.0,-4.4],P:[[0,7.0,-4.2],[0,7.5,-5.6],[0,7.0,-7.2],[0,6.0,-8.2]],r:[0.5,0.42,0.33,0.24],n:5,cap:[0,5.4,-8.5],col:(p)=>fur(c.fur,p,0.1,2,8)},
      legs:{n:5,col:legCol,F:{x:1.7,at:[7.2,3.6],P:[[0,7.2,3.6,0.95,1.0,1.1],[0,4.0,3.8,0.72,0.78,0.78],[0,1.2,4.0,0.52,0.55,0.58],[0,0.4,4.2,0.55,0.58,0.48],[0,0,4.85,0.6,0.62,0.35]],cap0:[0,8.2,3.6]},
        B:{x:1.8,at:[6.4,-3.0],P:[[0,6.4,-3.0,1.3,1.5,1.5],[0,3.6,-1.8,0.95,1.0,1.0],[0,1.2,-3.4,0.6,0.6,0.68],[0,0.4,-3.0,0.55,0.6,0.5],[0,0,-1.8,0.62,0.65,0.35]],cap0:[0,7.6,-3.0]}},
      extraRig:(G,rig)=>{rig.armL=rig.legFL;rig.armR=rig.legFR;}});
    return poser(G,{name:'sit',at:[0,6.6,-3.0],a:1.15,dy:2.6,head:1.0,tail:1.3,F:{dz:0.6,dy:0,rx:-0.25,rz:0.12,dx:0.2},B:{rx:-1.3,rz:0.35,dy:0.6,dz:0.8}});}

  /* ================= SIAMESE CROCODILE ================= */
  function crocodile(){const c={top:C('#3e4228'),top2:C('#5c5a34'),side:C('#77703f'),bel:C('#d2c8a0'),dk:C('#1e1d14'),tooth:C('#ece6d0'),eye:C('#c8a83a')};
    const cc=(p,n)=>{let k=mix(c.top,c.top2,cl(vn3(p[0]*.45,p[1]*.45,p[2]*.45,9)*1.3-0.2));if(Math.sin(p[2]*0.55)>0.55)k=mul(k,0.72);k=mix(k,c.side,ss(0.6,0.05,n[1])*0.85);return mix(k,c.bel,ss(-0.2,-0.65,n[1]));};
    const G=grp(),bodyAt=[0,4.4,0],body=pv('body',bodyAt,null);G.add(body);
    const BB=new VB(),BH=new VB();const FB=loft(BB,[[0,4.5,-12.4,4.2,2.7,2.9,2.6],[0,4.7,-7,5.8,3.1,3.3,2.6],[0,4.8,-1,6.3,3.2,3.4,2.6],[0,4.7,5,5.8,3.0,3.2,2.6],[0,4.5,9.5,4.3,2.6,2.8,2.6],[0,4.4,11.6,3.6,2.4,2.5,2.4]],12,cc);
    for(let r=-1;r<=1;r+=2)for(let k=0;k<7;k++){const b=surf(FB,0.4+k*0.6,PI/2+r*0.32,-0.1);spike(BB,b,add3(b,[r*0.15,0.6,-0.35]),0.62,3,mix(c.top,c.dk,0.35));}
    for(let k=0;k<6;k++){const b=surf(FB,0.6+k*0.65,PI/2,-0.1);spike(BB,b,add3(b,[0,0.45,-0.3]),0.5,3,mix(c.top,c.dk,0.3));}
    put(body,BB,'a4Fur','fur');
    const J=[0,4.5,11.2],head=pv('head',J,body,bodyAt),HB=new VB(),HG=new VB();
    const FH=loft(HB,[[0,4.7,10.4,3.5,2.4,2.4,2.4],[0,5.0,12.6,3.6,2.3,2.2,2.4],[0,4.5,15.4,2.85,1.5,1.6,2.5],[0,4.1,19.0,2.1,1.05,1.2,2.5],[0,3.9,22.0,1.75,0.9,1.0,2.4],[0,3.9,23.9,1.7,0.92,0.92,2.2]],10,cc,{cap1:[0,3.85,24.9]});
    [-1,1].forEach(d=>{const th=d>0?0.02:PI-0.02;bar(HB,FH,1.6,th,5.3,th,0.06,c.dk,{even:1});for(let k=0;k<7;k++){const b=surf(FH,2.2+k*0.5,d>0?-0.18:PI+0.18,0.02);HB.o(add3(b,[0,0,-0.22]),add3(b,[0,0,0.22]),add3(b,[d*0.06,-0.5,0]),add3(b,[-d,0,0]),c.tooth,0);}
      const eb=surf(FH,1.15,PI/2-d*0.55,-0.2);spike(HB,eb,add3(eb,[0,0.95,0.3]),0.85,5,c.top,false);eye(HG,add3(eb,[d*0.2,0.55,0.5]),0.34,[d,0.5,0.6],c.eye);octa(HG,add3(eb,[d*0.42,0.62,0.66]),0.18,[0.4,1,0.5],C('#0a0806'));});
    const nb=surf(FH,4.75,PI/2,-0.15);[-1,1].forEach(d=>octa(HB,add3(nb,[d*0.45,0.1,0]),0.32,[1,0.8,1.2],c.top));
    put(head,HB,'a4Fur','fur');put(head,HG,'a4Gloss','gloss');
    const tail=pv('tail',[0,4.4,-11.6],body,bodyAt),T1=new VB();const FT=loft(T1,[[0,4.4,-10.8,4.0,2.6,2.8,2.5],[0,4.2,-16,3.0,2.5,2.4,2.3],[0,3.9,-21,2.1,2.2,2.0,2.2],[0,3.6,-25.8,1.5,2.0,1.6,2.0]],10,cc);
    for(let k=0;k<6;k++)[-1,1].forEach(d=>{const b=surf(FT,0.3+k*0.45,PI/2-d*0.28,-0.1);spike(T1,b,add3(b,[0,0.85,-0.55]),0.55,3,mix(c.top,c.dk,0.45));});put(tail,T1,'a4Fur','fur');
    const tail2=pv('tail2',[0,3.6,-25.6],tail,[0,4.4,-11.6]),T2=new VB();const FT2=loft(T2,[[0,3.6,-25.0,1.5,2.0,1.6,2.0],[0,3.35,-31,1.05,1.6,1.2,2],[0,3.1,-37,0.6,1.15,0.75,2],[0,2.9,-42,0.22,0.5,0.32,2]],8,cc,{cap1:[0,2.85,-43]});
    for(let k=0;k<6;k++){const b=surf(FT2,0.15+k*0.45,PI/2,-0.1);spike(T2,b,add3(b,[0,1.1-k*0.12,-0.55]),0.5-k*0.05,3,mix(c.top,c.dk,0.45));}put(tail2,T2,'a4Fur','fur');
    const legs={};['legFL','legFR','legBL','legBR'].forEach(k=>{const f=k[3]==='F',d=k[4]==='L'?-1:1,x=f?4.4:4.9,z=f?6.6:-8,at=[d*x,4.0,z],P=pv(k,at,null);G.add(P);const LB=new VB(),LH=new VB(),s=f?1:1.2;
      const R=[[0,4.0,0,1.4*s,1.3*s,1.3*s],[2.4*s,3.2,0.5,1.0*s,1.0*s,1.0*s],[3.3*s,1.4,1.0,0.78*s,0.78*s,0.78*s],[3.7*s,0.35,2.2,0.95*s,0.42,0.35]].map(r=>[d*(x+r[0]),r[1],z+r[2],r[3],r[4],r[5]]);
      loft(LB,R,6,cc,{side:[0,0,1],up:null,cap0:[d*(x-1),4.4,z],cap1:true});const h=R[3];for(let i=-1;i<=1;i++)spike(LB,[h[0]+d*0.2+i*0.35,0.3,h[2]+0.4],[h[0]+d*(0.4+i*0.1)+i*0.7,0.18,h[2]+1.5],0.28,3,cc);
      put(P,LB,'a4Fur','fur');legs[k]=P;});
    return finish(G,'crocodile',Object.assign({body,head,tail,tail2},legs));}

  /* ================= BANDED KRAIT (rắn cạp nong) — 7 nested segments ================= */
  function snake(seed){seed=+seed||1;const c={bk:C('#151414'),bk2:C('#262422'),ye:C('#e6bc34'),ye2:C('#f0d470'),bel:C('#e6dcbc')};
    const G=grp(),bodyAt=[0,0.82,13],body=pv('body',bodyAt,null);G.add(body);const NS=7,SL=5.0,rad=i=>{const t=i/NS;return t<0.2?0.6+t*0.9:0.78*(1-Math.pow((t-0.2)/0.8,1.8))+0.12;};
    const col=(band)=>(p,n,q)=>{const yb=band(q.i);let k=yb?mix(c.ye,c.ye2,ss(0.3,0.9,n[1])*0.4):mix(c.bk2,c.bk,ss(0.0,0.8,n[1]));return mix(k,yb?c.bel:mix(c.bk2,c.bel,0.25),ss(-0.45,-0.85,n[1]));};
    const head=pv('head',bodyAt,body,bodyAt),HB=new VB(),HG=new VB();const hz=13;
    const FH=loft(HB,[[0,0.78,hz-0.9,0.62,0.62,0.45,1.9],[0,0.82,hz+0.4,0.78,0.6,0.42,2.2],[0,0.8,hz+1.5,0.68,0.5,0.36,2.2],[0,0.72,hz+2.3,0.42,0.32,0.26,2]],7,(p,n)=>mix(c.bk,mix(c.bk2,c.bel,0.4),ss(-0.4,-0.85,n[1])),{cap1:[0,0.68,hz+2.75],cap0:[0,0.8,hz-1.4]});
    bar(HB,FH,0.05,PI/2-1.2,0.25,PI/2+1.2,0.18,c.ye,{even:1});
    [-1,1].forEach(d=>{const p=surf(FH,1.55,d>0?0.55:PI-0.55,-0.08);eye(HG,p,0.15,[d,0.4,0.3],C('#0a0908'));});put(head,HB,'a4Fur','fur');put(head,HG,'a4Gloss','gloss');
    const seg=[],rest=[0.22,-0.34,0.38,-0.36,0.34,-0.3,0.26];let parent=body,pAt=bodyAt;
    for(let i=0;i<NS;i++){const z0=i===0?hz-0.8:pAt[2]-(i===1?SL-0.8+0.8:SL),at=[0,0.82,i===0?hz-0.8:pAt[2]-SL],P=pv('seg'+i,at,parent,pAt);P.rotation.y=rest[i];parent=P;pAt=at;seg.push(P);
      const r0=rad(i),r1=rad(i+1),z=at[2],last=i===NS-1,B=new VB(),R=(zz,r)=>[0,0.82-(0.62-r*0.8)*0.0,zz,r*1.05,r*1.08,r*0.72,1.75];
      const a=2.0,b=a+(last?1.7:2.2),e=0.12,zs=[z+0.45,z,z-a,z-a-e,z-b,z-b-e,z-SL-(last?0:0.15)],rr=zs.map(zz=>{const t=cl((z-zz)/SL);return r0+(r1-r0)*t;});
      loft(B,zs.map((zz,j)=>R(zz,rr[j])),7,col(j=>j===3||j===4),{cap0:[0,0.82,z+0.45+r0*0.65],cap1:last?[0,0.82,z-SL-1.4]:false});P.add(B.mesh('a4Fur',at,'fur'));}
    G.userData.rig={body,head,seg,segRest:rest.slice()};const sb=bbox(G);body.position.y-=sb.min.y;G.userData.len=40;G.userData.h=+(sb.max.y-sb.min.y).toFixed(1);G.userData.r=10;G.userData.kind='snake';return G;}

  // ribbon (thin strip) along a polyline: widths w[i], plane normal nrm (strip spans crs(dir,nrm)); for feathers / sickle tails (a4Thin)
  function ribbon(B,P,w,nrm,cf){const L=P.length,E=[];for(let i=0;i<L;i++){const d=nrm3(sub3(P[Math.min(L-1,i+1)],P[Math.max(0,i-1)])),sd=nrm3(crs(d,nrm));E.push([add3(P[i],sd,-w[i]),add3(P[i],sd,w[i])]);}
    for(let i=0;i<L-1;i++){if(w[i+1]<1e-3){B.t(E[i][0],E[i][1],P[i+1],cf,0);continue;}B.t(E[i][0],E[i][1],E[i+1][1],cf,0).t(E[i][0],E[i+1][1],E[i+1][0],cf,0);}return B;}

  /* ================= GALLIFORMES: red junglefowl rooster · domestic hen · chick ================= */
  function fowl(v){const R=v==='rooster',H=v==='hen',CH=v==='chick',s=CH?0.34:H?0.86:1,S3=sp3(s),S6=sc6(s);
    const c=R?{body:C('#7c2a14'),cape:C('#e0962e'),cape2:C('#f2c04a'),breast:C('#141c18'),wing:C('#5e2a16'),prim:C('#2a2018'),tail:C('#123028'),tail2:C('#2e5a3e'),leg:C('#6b6a5c'),beak:C('#a89a78')}
      :H?{body:C('#9a6236'),cape:C('#c48a48'),cape2:C('#e0b06a'),breast:C('#b07a48'),wing:C('#8a5430'),prim:C('#4a2e1c'),tail:C('#4a2e1c'),tail2:C('#7a4a28'),leg:C('#c8a050'),beak:C('#d8b060')}
      :{body:C('#f2d24a'),cape:C('#f6dc66'),cape2:C('#fae88a'),breast:C('#f6e07a'),wing:C('#e8c03c'),prim:C('#e0b030'),tail:C('#e8c03c'),tail2:C('#f2d050'),leg:C('#e89a4a'),beak:C('#e8963a')};
    const G=grp(),bodyAt=S3([0,7.0,0]),body=pv('body',bodyAt,null);G.add(body);
    const BB=new VB(),BT=new VB();
    const bc=(p,n,q)=>{const y=p[1]/s,z=p[2]/s;let k=mix(c.body,c.breast,ss(0.6,2.2,z)*ss(0.3,-0.4,n[1]+0.2)+ss(-0.2,-0.7,n[1])*0.7);k=mix(k,mix(c.cape,c.cape2,ss(8.5,11.5,y)),ss(7.8,9.2,y)*ss(0.5,2.0,z));
      if(H)k=mul(k,0.86+0.28*vn3(p[0]*3/s,p[1]*3/s,p[2]*3/s,7));return CH?fur(k,p,0.06,3,2):fur(k,p,0.1,2,2);};
    const brings=CH?[[0,7.2,-2.6,1.6,1.6,1.7],[0,7.0,-1.4,2.7,2.7,2.8],[0,7.0,0.4,2.9,2.9,2.9],[0,7.6,1.8,2.4,2.4,2.4],[0,9.0,2.4,1.6,1.6,1.6],[0,10.2,2.4,1.2,1.2,1.2]]
      :[[0,7.7,-3.5,1.15,1.1,1.2],[0,7.4,-2.4,2.2,2.2,2.4],[0,7.0,-0.6,2.5,2.5,2.75],[0,7.2,1.2,2.3,2.35,2.65],[0,8.1,2.4,1.75,1.75,1.95],[0,9.8,3.05,1.2,1.25,1.3],[0,12.0,3.35,0.82,0.85,0.85]];
    if(H){brings[1][4]*=1.1;brings[2][5]*=1.08;brings[5]=[0,9.3,3.0,1.35,1.4,1.45];brings[6]=[0,10.9,3.4,0.9,0.95,0.95];}
    loft(BB,brings.map(S6),CH?7:8,bc,{cap0:S3(CH?[0,7.3,-3.4]:[0,7.8,-4.1])});
    put(body,BB,'a4Fur','fur');
    const J=S3(CH?[0,10.4,2.4]:[0,12.2,3.35]),head=pv('head',J,body,bodyAt);if(H)head.position.add(new T.Vector3(0,-1.15*s,0.15*s));const HB=new VB(),HG=new VB(),HH=new VB(),HT=new VB();
    const hcol=(p,n)=>CH?fur(c.cape2,p,0.05,3,3):mix(R?C('#c22414'):H?C('#b8542e'):c.body,c.cape,ss(-0.4,0.3,-n[2])*ss(J[1]+0.2*s,J[1]-0.4*s,p[1])*0.8);
    const hr=CH?[[0,10.4,1.7,1.3,1.3,1.3],[0,10.9,2.6,1.75,1.7,1.6],[0,10.8,3.6,1.3,1.25,1.2],[0,10.6,4.2,0.6,0.6,0.6]]:[[0,12.3,2.8,0.7,0.7,0.7],[0,12.7,3.5,0.88,0.88,0.85],[0,12.55,4.35,0.62,0.62,0.6],[0,12.4,4.75,0.35,0.35,0.35]];
    const FH=loft(HB,hr.map(S6),CH?7:6,hcol,{cap0:S3(CH?[0,10.2,1.2]:[0,12.25,2.4]),cap1:S3(CH?[0,10.6,4.4]:[0,12.4,4.9])});
    spike(HH,S3(CH?[0,10.55,4.15]:[0,12.42,4.6]),S3(CH?[0,10.2,5.1]:[0,11.95,5.75]),0.32*s*(CH?1.7:1),5,c.beak,true,0.8);
    [PI/2-0.75,PI/2+0.75].forEach(t=>{const p=surf(FH,CH?1.55:1.6,t,-0.08*s),o=sub3(p,J);eye(HG,p,(CH?0.3:0.2)*s*(CH?2.0:1),o,CH?C('#1a1410'):R?C('#c87018'):C('#b8801c'));});
    if(!CH){// comb, wattles, ear lobe
      const cm=R?1:0.45,y0=12.7*s+0.75*s,pts=[[0,y0-0.2*s,2.55*s]];for(let k=0;k<=6;k++){const z=(2.6+k*0.42)*s,h=(k%2?0.55:1.35-Math.abs(k-3)*0.12)*s*cm;pts.push([0,y0+h,z]);}pts.push([0,y0-0.3*s,5.2*s*0.98]);
      fan(HT,[[0,y0-0.5*s,3.9*s],...pts],R?C('#d01e14'):C('#c83a24'));[-1,1].forEach(d=>{fan(HT,[[d*0.18*s,12.0*s,4.6*s],[d*0.32*s,11.0*s*(R?1:1.03),4.4*s],[d*0.3*s,10.8*s*(R?0.99:1.04),4.85*s],[d*0.2*s,11.6*s,5.0*s]],R?C('#d01e14'):C('#c83a24'));
        if(R){const e=surf(FH,1.05,d>0?0.0:PI,0.03);HB.o(add3(e,[0,0.3,-0.2]),add3(e,[0,-0.3,-0.25]),add3(e,[0,0,0.3]),add3(e,[-d,0,0]),C('#f2ece0'),0);}});}
    put(head,HB,'a4Fur','fur');put(head,HG,'a4Gloss','gloss');put(head,HH,'a4Hard','hard');put(head,HT,'a4Thin','thin');
    // wings (folded, rotation.z flaps): flattened lofts
    const wing=d=>{const at=S3([d*2.25,8.4,1.0]),P=pv(d<0?'wingL':'wingR',at,body,bodyAt),W=new VB();
      const wc=(p,n)=>{const z=p[2]/s,y=p[1]/s;let k=mix(c.wing,c.prim,ss(-0.6,-3.2,z));if(R)k=mix(k,C('#2a3a3a'),ss(6.4,5.6,y)*ss(-1,0.5,z)*0.6);if(H)k=mul(k,0.85+0.3*vn3(p[0]*4/s,p[1]*4/s,p[2]*4/s,5));return k;};
      const wr=CH?[[d*2.4,8.2,1.4,0.25,0.8,0.8],[d*2.75,7.6,0.2,0.3,1.3,1.2],[d*2.6,7.4,-1.3,0.22,0.9,0.8]]:[[d*2.05,8.5,1.6,0.3,1.0,1.2],[d*2.4,7.4,0.0,0.36,1.5,1.3],[d*2.2,7.2,-2.4,0.28,1.1,0.8]];
      loft(W,wr.map(S6),5,wc,{side:[0,1,0],up:[d,0,0],cap0:S3(CH?[d*2.3,8.5,1.8]:[d*2.0,8.8,2.2]),cap1:S3(CH?[d*2.4,7.5,-1.9]:[d*1.8,7.5,-4.6])});P.add(W.mesh('a4Fur',at,'fur'));return P;};
    const wingL=wing(-1),wingR=wing(1);
    const tail=pv('tail',S3(CH?[0,7.6,-2.8]:[0,8.0,-3.4]),body,bodyAt),TB=new VB();
    if(R){[[-0.5,1.0,0],[0.5,1.0,1],[0,1.25,2],[-0.3,0.8,3],[0.3,0.8,4]].forEach(([x,k,i])=>{const P=[[x*0.4,8.0,-3.3],[x,8.0+2.9*k,-4.6],[x*1.2,8.0+4.4*k,-6.4],[x*1.3,8.0+4.0*k,-8.3],[x*1.35,8.0+2.0*k,-9.4],[x*1.3,8.0+0.4*k,-9.6]];
        ribbon(TB,P,[0.75,0.8,0.65,0.45,0.2,0.0],[1,0,0.15*Math.sign(x||1)],(p)=>mix(c.tail,c.tail2,ss(9,13,p[1])*0.8));});
      [-1,1].forEach(d=>ribbon(TB,[[d*0.8,8.4,-2.4],[d*1.1,7.6,-4.4],[d*1.2,6.4,-5.6]],[0.9,0.7,0],[1,0.2,0],c.cape));}
    else if(H){[-0.6,0,0.6].forEach((x,i)=>ribbon(TB,[[x*0.6,7.6*s,-3.3*s],[x,9.6*s,-4.4*s],[x*1.2,11.0*s,-5.0*s],[x*1.2,11.6*s,-5.2*s]],[0.8*s,1.0*s,0.7*s,0],[1,0,0.2*x],(p)=>mix(c.tail,c.tail2,0.4)));}
    else{ball(TB,S3([0,7.9,-3.0]),0.5,[1,0.8,1],5,3,c.body);}
    tail.add(TB.mesh(CH?'a4Fur':'a4Thin',tail.userData.at,'thin'));
    const leg=d=>{const at=S3([d*1.0,5.4,0.2]),P=pv(d<0?'legL':'legR',at,null);G.add(P);const L=new VB(),LF=new VB();
      if(!CH)tube(LF,[S3([d*1.0,6.2,0.2]),S3([d*1.0,4.9,-0.1])],[1.0*s,0.75*s],5,mix(c.body,c.wing,0.4),{cap0:S3([d*1,6.9,0.2])});
      tube(L,CH?[S3([d*1.0,6.0,-0.1]),S3([d*1.0,3.2,-0.2]),S3([d*1.0,0.45,0.1])]:[S3([d*1.0,5.0,-0.1]),S3([d*1.0,2.6,-0.25]),S3([d*1.0,0.45,0.1])],[0.36*s*(CH?1.6:1),0.3*s*(CH?1.6:1),0.27*s*(CH?1.6:1)],4,c.leg,{cap1:true});
      [[0,1.75],[0.6,1.35],[-0.6,1.35]].forEach(([a,l])=>spike(L,S3([d*1.0,0.35,0.1]),S3([d*1.0+Math.sin(a)*l,0.05,0.1+Math.cos(a)*l]),0.17*s*(CH?1.6:1),3,c.leg));
      if(R)spike(L,S3([d*1.0,1.5,-0.25]),S3([d*1.05,1.4,-0.9]),0.12,3,c.leg);[L.mesh('a4Hard',at,'hard'),LF.mesh('a4Fur',at,'fur')].forEach(m=>m&&P.add(m));return P;};
    const legL=leg(-1),legR=leg(1);if(CH)body.position.y-=2.3*s;if(H)body.position.y-=0.9*s;
    return finish(G,R?'junglefowl':H?'chicken':'chick',{body,head,wingL,wingR,legL,legR,tail,legFL:legL,legBR:legL,legFR:legR,legBL:legR});}

  /* ================= small songbird (red-whiskered bulbul) — flying, wings spread ================= */
  function bird(){const c={back:C('#6a5240'),wing:C('#5a4434'),prim:C('#3a2c22'),belly:C('#f0ebe0'),crest:C('#141210'),red:C('#d02a1c'),vent:C('#d84a2a'),beak:C('#1a1614')};
    const G=grp(),bodyAt=[0,2.6,0],body=pv('body',bodyAt,null);G.add(body);const BB=new VB(),BT=new VB(),BG=new VB(),BH=new VB();
    const bc=(p,n)=>{let k=mix(c.back,c.belly,ss(0.0,-0.55,n[1]));k=mix(k,c.vent,ss(-0.9,-1.6,p[2])*ss(0,-0.5,n[1]));k=mix(k,C('#2a2420'),ss(0.4,0.0,n[1])*ss(1.1,1.5,p[2])*ss(0.6,1.2,Math.abs(p[0]))*0.8);return k;};
    loft(BB,[[0,2.75,-2.1,0.55,0.5,0.55],[0,2.6,-1.0,1.05,1.0,1.1],[0,2.6,0.4,1.15,1.1,1.25],[0,2.85,1.4,0.9,0.95,0.95],[0,3.2,1.9,0.72,0.75,0.72]],8,bc,{cap0:[0,2.8,-2.5]});
    put(body,BB,'a4Fur','fur');
    const J=[0,3.3,1.95],head=pv('head',J,body,bodyAt),HB=new VB(),HG=new VB(),HH=new VB();
    const hc=(p,n)=>{let k=c.crest;k=mix(k,c.belly,ss(-0.1,-0.6,n[1])*ss(2.2,2.6,p[2]));const ch=Math.hypot(Math.abs(p[0])-0.55,p[1]-3.25,p[2]-2.65);k=mix(k,c.belly,ss(0.42,0.25,ch));k=mix(k,c.red,ss(0.3,0.15,Math.hypot(Math.abs(p[0])-0.6,p[1]-3.55,p[2]-2.55)));return k;};
    const FH=loft(HB,[[0,3.45,1.75,0.55,0.55,0.55],[0,3.6,2.3,0.72,0.72,0.66],[0,3.55,2.9,0.55,0.55,0.5],[0,3.45,3.25,0.3,0.3,0.28]],8,hc,{cap0:[0,3.4,1.5],cap1:[0,3.42,3.35]});
    spike(HB,[0,4.0,2.1],[0,4.95,1.85],0.28,4,c.crest);spike(HH,[0,3.45,3.15],[0,3.35,3.95],0.16,4,c.beak,true);eyesIris(HG,FH,1.55,PI/2-0.55,0.13,C('#2a1a12'),C('#050404'));
    put(head,HB,'a4Fur','fur');put(head,HG,'a4Gloss','gloss');put(head,HH,'a4Hard','hard');
    const wing=d=>{const at=[d*0.95,2.95,0.6],P=pv(d<0?'wingL':'wingR',at,body,bodyAt),W=new VB(),y=2.95;
      const wc=(p)=>{const r=Math.abs(p[0]);return mix(c.wing,c.prim,ss(2.2,3.6,r)+ss(0.0,-1.0,p[2])*0.5);};
      fan(W,[[d*0.95,y,1.1],[d*2.2,y+0.15,1.05],[d*3.6,y+0.2,0.55],[d*4.6,y+0.15,-0.2],[d*4.2,y+0.1,-0.7],[d*3.4,y+0.05,-0.55],[d*3.0,y+0.05,-1.0],[d*2.2,y,-0.75],[d*1.6,y,-1.1],[d*0.95,y,-0.4]],wc);P.add(W.mesh('a4Thin',at,'thin'));return P;};
    const wingL=wing(-1),wingR=wing(1);const tail=pv('tail',[0,2.75,-2.1],body,bodyAt),TB=new VB();
    fan(TB,[[0,2.8,-1.9],[-0.55,2.75,-2.4],[-0.95,2.7,-4.3],[-0.4,2.7,-4.6],[0,2.7,-4.4],[0.4,2.7,-4.6],[0.95,2.7,-4.3],[0.55,2.75,-2.4]],(p)=>mix(c.wing,c.prim,ss(-3,-4.4,p[2])));tail.add(TB.mesh('a4Thin',tail.userData.at,'thin'));
    [-1,1].forEach(d=>tube(BH,[[d*0.4,2.0,0.1],[d*0.4,1.75,-0.6],[d*0.38,1.85,-1.1]],[0.12,0.1,0.08],3,C('#4a3e36')));put(body,BH,'a4Hard','hard');
    return finish(G,'bird',{body,head,wingL,wingR,tail});}

  /* ================= FROG (Asian grass frog) ================= */
  function frog(){const c={g:C('#5a7a32'),g2:C('#86983e'),sp:C('#2c3618'),bel:C('#e0d6a0'),line:C('#c8b45a'),eye:C('#c89a2a')};
    const col=(p,n)=>{let k=mix(c.g,c.g2,cl(p[1]*0.8));if(vn3(p[0]*2.6,p[2]*2.6,1,3)>0.66&&n[1]>0.15)k=c.sp;if(Math.abs(Math.abs(p[0])-0.75)<0.12&&n[1]>0.3)k=c.line;return mix(k,c.bel,ss(-0.15,-0.6,n[1]));};
    const G=grp(),bodyAt=[0,0.95,0],body=pv('body',bodyAt,null);G.add(body);const BB=new VB(),BG=new VB();
    loft(BB,[[0,0.8,-1.8,0.8,0.45,0.4],[0,0.95,-1.0,1.25,0.7,0.55],[0,1.05,0.2,1.3,0.72,0.55],[0,1.0,1.0,1.15,0.6,0.5]],8,col,{cap0:[0,0.85,-2.15]});put(body,BB,'a4Gloss','gloss');
    const J=[0,1.05,1.0],head=pv('head',J,body,bodyAt),HB=new VB(),HG=new VB();
    const FH=loft(HB,[[0,1.05,0.8,1.15,0.6,0.5],[0,1.1,1.6,1.05,0.5,0.45],[0,1.0,2.2,0.7,0.35,0.35]],8,col,{cap1:[0,0.95,2.5]});
    [-1,1].forEach(d=>{const p=[d*0.62,1.62,1.45];ball(HB,p,0.36,[1,0.85,1],6,4,c.g2);eye(HG,add3(p,[d*0.12,0.1,0.05]),0.28,[d,0.5,0.4],c.eye);octa(HG,add3(p,[d*0.33,0.15,0.1]),0.12,[0.4,0.5,1.4],C('#0a0806'));});
    put(head,HB,'a4Gloss','gloss');put(head,HG,'a4Gloss','gloss2');
    const legs={};['legFL','legFR','legBL','legBR'].forEach(k=>{const f=k[3]==='F',d=k[4]==='L'?-1:1,at=f?[d*0.95,0.75,0.9]:[d*1.0,0.8,-1.3],P=pv(k,at,null);G.add(P);const L=new VB();
      if(f){tube(L,[at,[d*1.25,0.35,1.1],[d*1.3,0.1,1.25]],[0.22,0.17,0.14],4,col);fan(L,[[d*1.3,0.05,1.2],[d*1.0,0.02,1.75],[d*1.45,0.02,1.8],[d*1.8,0.02,1.4]],c.g2);}
      else{tube(L,[at,[d*1.9,0.6,-0.2],[d*1.75,0.35,-1.6],[d*1.45,0.12,-0.35]],[0.42,0.3,0.22,0.16],5,col,{cap0:[d*0.7,0.85,-1.5]});fan(L,[[d*1.45,0.05,-0.4],[d*1.2,0.02,0.6],[d*1.6,0.02,0.75],[d*2.1,0.02,0.3]],c.g2);}
      P.add(L.mesh('a4Gloss',at,'gloss'));legs[k]=P;});
    const tail=pv('tail',[0,0.85,-1.9],body,bodyAt);return finish(G,'frog',Object.assign({body,head,tail},legs));}

  /* ================= FISH: carp · walking catfish · snakehead (centred on the origin, swimming along +Z) ================= */
  const FSP={carp:{len:14,back:C('#4e4420'),side:C('#b88a36'),bel:C('#ecdcaa'),fin:C('#b0662e'),z:[-5.2,-3,0,3,5.3],r:[[0.9,1.5],[1.7,2.9],[2.0,3.3],[1.6,2.6],[0.8,1.3]],nose:6.5,
      dorsal:[[0,3.1,2.4],[0,4.8,1.4],[0,3.8,-1.2],[0,2.5,-3.4]],tail:[[0,0,0],[0,3.2,-3.6],[0,1.0,-2.6],[0,0,-3.0],[0,-1.0,-2.6],[0,-3.2,-3.6]],barb:1},
    catfish:{len:16,back:C('#2c2822'),side:C('#5a5040'),bel:C('#c4b89a'),fin:C('#3a342a'),z:[-6,-3,0,3,5.4],r:[[0.8,1.2],[1.4,1.8],[1.8,1.9],[2.05,1.55],[1.6,1.0]],nose:6.9,
      dorsal:[[0,1.8,2.2],[0,2.5,1.2],[0,2.1,-5.6],[0,1.2,-6.0]],anal:[[0,-1.6,0.2],[0,-2.3,-0.6],[0,-1.9,-5.6],[0,-1.1,-6.0]],tail:[[0,0,0],[0,1.6,-2.4],[0,0.8,-3.2],[0,-0.8,-3.2],[0,-1.6,-2.4]],whisk:1},
    snakehead:{len:18,back:C('#2e2e1c'),side:C('#6a6440'),bel:C('#d4cca2'),fin:C('#4a4430'),z:[-7,-3.5,0,3.5,6.2],r:[[0.95,1.2],[1.5,1.8],[1.75,2.0],[1.7,1.8],[1.35,1.2]],nose:7.6,band:1,
      dorsal:[[0,1.9,3.4],[0,2.8,2.6],[0,2.4,-6.6],[0,1.2,-7.0]],anal:[[0,-1.9,-0.4],[0,-2.6,-1.2],[0,-2.2,-6.6],[0,-1.2,-7.0]],tail:[[0,0,0],[0,2.0,-2.6],[0,1.0,-3.4],[0,-1.0,-3.4],[0,-2.0,-2.6]]}};
  function fish(v){const S=FSP[v]||FSP.carp,G=grp(),body=pv('body',[0,0,0],null);G.add(body);
    const col=(p,n)=>{let k=mix(S.side,S.back,ss(0.1,0.8,n[1]));if(S.band&&n[1]>-0.4&&Math.sin(p[2]*1.2+p[1]*0.8)>0.45)k=mul(k,0.55);if(v==='carp')k=mul(k,0.92+0.16*hsh(Math.round(p[2]*1.4),Math.round(p[1]*1.6),2,3));return mix(k,S.bel,ss(-0.3,-0.8,n[1]));};
    const B=new VB(),F=new VB(),E=new VB();const FB=loft(B,S.z.map((z,i)=>[0,0,z,S.r[i][0],S.r[i][1],S.r[i][1]*(v==='catfish'?0.8:1)]),7,col,{cap1:[0,-0.2,S.nose]});
    eye(E,surf(FB,3.55,PI/2-0.85,-0.1),0.38,[1,0.2,0.3],C('#d8c890'));eye(E,surf(FB,3.55,PI/2+0.85,-0.1),0.38,[-1,0.2,0.3],C('#d8c890'));
    [-1,1].forEach(d=>octa(E,add3(surf(FB,3.55,d>0?PI/2-0.85:PI/2+0.85,0.12),[d*0.12,0,0.08]),0.2,[0.5,1,1],C('#0a0806')));
    const fc=(p)=>mix(S.fin,S.back,0.25);fan(F,S.dorsal,fc);if(S.anal)fan(F,S.anal,fc);else fan(F,[[0,-2.2,-2.2],[0,-3.3,-3.2],[0,-1.6,-4.2]],fc);
    [-1,1].forEach(d=>{const r=S.r[3];fan(F,[[d*r[0]*0.8,-r[1]*0.5,S.z[3]],[d*(r[0]+1.7),-r[1]*1.0,S.z[3]-2.0],[d*r[0]*0.8,-r[1]*0.65,S.z[3]-1.2]],fc);});
    if(S.barb)[-1,1].forEach(d=>F.t([d*0.35,-0.7,S.nose-0.7],[d*0.45,-0.5,S.nose-0.6],[d*0.9,-1.6,S.nose-0.1],fc,0));
    if(S.whisk)[[1.4,-0.3,6.4,3.8,-1.4,4.4],[0.6,-0.9,6.4,2.4,-2.9,5.0]].forEach(w=>[-1,1].forEach(d=>F.t([d*0.3,w[1],w[2]],[d*0.45,w[1]+0.15,w[2]-0.1],[d*w[3],w[4],w[5]],S.back,0)));
    body.add(B.mesh('a4Gloss',null,'gloss'),F.mesh('a4Thin',null,'thin'),E.mesh('a4Gloss',null,'eyes'));
    const tail=pv('tail',[0,0,S.z[0]],body,[0,0,0]),TB=new VB(),TF=new VB();loft(TB,[[0,0,S.z[0]+0.6,S.r[0][0],S.r[0][1]],[0,0,S.z[0]-1.6,S.r[0][0]*0.5,S.r[0][1]*0.6]],6,col);
    fan(TF,S.tail.map(p=>[p[0],p[1],p[2]+S.z[0]-1.2]),(p)=>mix(S.fin,S.back,ss(-1,-3,p[2]-S.z[0])*0.5));tail.add(TB.mesh('a4Gloss',tail.userData.at,'gloss'),TF.mesh('a4Thin',tail.userData.at,'thin'));
    G.userData.rig={body,tail};G.userData.len=S.len;G.userData.kind=v;const b=bbox(G);G.userData.h=+(b.max.y-b.min.y).toFixed(1);G.userData.r=+(S.len/2).toFixed(1);return G;}

  /* ================= BUTTERFLY (4 palettes: common tiger, blue mormon, lemon emigrant, cabbage white) ================= */
  const BFP=[{a:C('#e8801e'),b:C('#16120e'),sp:C('#f4f0e2'),vein:1},{a:C('#141418'),b:C('#0c0c10'),sp:C('#3aa0e8'),blue:1},{a:C('#f0d43a'),b:C('#6a4a14'),sp:C('#f8ec90')},{a:C('#f2f0e6'),b:C('#5a5850'),sp:C('#ffffff')}];
  function butterfly(seed){const pal=BFP[((+seed||1)-1)%BFP.length],G=grp(),body=pv('body',[0,0.5,0],null);G.add(body);const B=new VB();
    tube(B,[[0,0.5,1.0],[0,0.5,0.2],[0,0.48,-0.6],[0,0.45,-1.2]],[0.14,0.17,0.14,0.08],4,C('#1a1612'),{cap0:[0,0.52,1.2],cap1:[0,0.44,-1.4]});
    [-1,1].forEach(d=>B.t([d*0.05,0.58,1.0],[d*0.1,0.58,1.0],[d*0.5,1.1,1.85],C('#1a1612'),0));body.add(B.mesh('a4Thin',[0,0.5,0],'thin'));
    const wc=(p)=>{const r=Math.hypot(p[0],p[2]-0.2),ax=Math.abs(p[0]);let k=pal.a;if(pal.blue)k=mix(pal.a,pal.sp,ss(1.3,0.8,Math.hypot(ax-1.1,p[2]+0.4))*0.9);
      k=mix(k,pal.b,ss(1.45,1.75,r));if(pal.vein)k=mix(k,pal.b,ss(0.9,1.3,ax)*ss(0.6,1.2,p[2])*0.85);return k;};
    const wing=d=>{const at=[d*0.12,0.55,0.15],P=pv(d<0?'wingL':'wingR',at,body,[0,0.5,0]),W=new VB(),y=0.55,c0=[d*0.12,y,0.15];
      const fw=[[d*0.15,y,0.75],[d*0.7,y+0.02,1.25],[d*1.5,y+0.04,1.45],[d*2.05,y+0.05,1.25],[d*1.7,y+0.04,0.55],[d*1.2,y+0.03,0.12],[d*0.3,y,-0.05]];
      const hw=[[d*0.3,y,-0.05],[d*1.3,y+0.02,-0.05],[d*1.6,y+0.02,-0.6],[d*1.25,y+0.01,-1.25],[d*0.7,y,-1.45],[d*0.2,y,-0.8]];
      for(let i=0;i<fw.length-1;i++)W.t(c0,fw[i],fw[i+1],wc,0);for(let i=0;i<hw.length-1;i++)W.t(c0,hw[i],hw[i+1],wc,0);
      if(!pal.blue){const sp=[d*1.75,y+0.06,1.05];W.t(add3(sp,[0,0,0.13]),add3(sp,[d*0.12,0,-0.08]),add3(sp,[-d*0.12,0,-0.08]),pal.sp,0);}
      P.add(W.mesh('a4Thin',at,'thin'));return P;};
    const wingL=wing(-1),wingR=wing(1);wingL.rotation.z=-0.35;wingR.rotation.z=0.35;
    G.userData.rig={body,wingL,wingR};G.userData.len=3;G.userData.h=1.2;G.userData.r=2;G.userData.kind='butterfly';return G;}

  // scale ring rows about a centre (for young animals: big head, short legs)
  const scR=(R,k,c)=>R.map(r=>[c[0]+(r[0]-c[0])*k,c[1]+(r[1]-c[1])*k,c[2]+(r[2]-c[2])*k,r[3]*k,r[4]*k,(r[5]===undefined?r[4]:r[5])*k,r[6]]),scP=(p,k,c)=>[c[0]+(p[0]-c[0])*k,c[1]+(p[1]-c[1])*k,c[2]+(p[2]-c[2])*k];

  /* ================= DOMESTIC PIG — Vietnamese pot-bellied (lợn Ỉ), black, swayback, sagging belly ================= */
  function pig(young){const s=young?0.46:1,hs=young?1.3:1,c={bk:C('#2c2828'),bk2:C('#3e3836'),skin:C('#4c4240'),snout:C('#6e5654'),disc:C('#8a6a66'),hoof:C('#1a1716')};
    const S6=sc6(s),S3=sp3(s);const bc=coat({side:c.bk2,back:c.bk,belly:c.skin,na:0.12,nf:0.8,f:(k,p,n)=>mix(k,c.bk,ss(0.3,-0.4,n[2])*0.2)});
    const body=[[0,8.8,-9.8,1.4,1.4,1.5],[0,8.7,-8.8,3.6,3.0,3.8],[0,8.2,-6.0,4.7,3.5,5.4],[0,7.4,-2.0,5.0,2.9,6.0],[0,7.3,2.0,4.9,3.1,5.7],[0,7.8,5.0,4.4,3.5,4.8],[0,7.9,7.2,3.6,3.4,3.8]].map(S6);
    if(young)body.forEach(r=>{r[5]*=0.85;});
    const J=S3([0,8.2,7.4]);let hr=[[0,8.7,6.6,3.0,3.0,3.2],[0,8.6,8.4,3.15,2.8,3.1],[0,8.0,10.2,2.2,2.0,2.3],[0,7.6,11.6,1.45,1.4,1.45],[0,7.75,12.55,1.25,1.2,1.15]].map(S6);hr=scR(hr,hs,J);
    const hc=(p,n,q)=>{let k=mix(c.bk2,c.bk,ss(0.2,0.9,n[1])*0.5);k=mix(k,c.snout,ss(0.62,0.85,q.s));if(q.tip||q.s>0.97)k=c.disc;return fur(k,p,0.1,1.5,6);};
    const legCol=(p,n)=>p[1]<0.8*s?c.hoof:fur(mix(c.bk2,c.skin,0.3),p,0.1,1,7);
    const G=quad({kind:young?'piglet':'pig',bodyAt:S3([0,7.6,0]),body,bodyN:young?8:12,bodyCol:bc,bodyCap0:S3([0,8.8,-10.3]),
      head:{at:J,rings:hr,n:young?7:10,col:hc,cap1:true,cap0:scP(S3([0,8.9,5.8]),hs,J),eyes:[1.8,PI/2-0.6,0.24*s*hs*(young?1.25:1),C('#0e0a09')],
        extra:(HB,FH,HG,HH)=>{[-1,1].forEach(d=>{const b=surf(FH,0.9,d>0?PI/2-0.6:PI/2+0.6,-0.3);ear(HB,b,add3(b,[d*1.0*s*hs,1.5*s*hs,0.3*s*hs]),add3(b,[d*1.7*s*hs,2.9*s*hs,0.6*s*hs]),1.3*s*hs,0.2*s*hs,[d*0.3,0.3,1],c.bk,C('#5a4644'),{cup:1.3,n:young?4:6});
            if(!young)octa(HG,add3(surf(FH,4,PI/2-d*0.45,0),[0,0,0.04]),0.24*s*hs,[0.8,1,0.5],C('#2a1c1c'));});
          if(!young)for(let i=0;i<3;i++)bar(HB,FH,2.6+i*0.28,PI/2+1.0,2.6+i*0.28,PI/2-1.0,0.04,mix(c.bk,C('#000000'),0.4),{even:1});}},
      tail:{at:S3([0,9.4,-9.9]),P:[[0,9.5,-9.7],[0,9.0,-10.4],[0,7.6,-10.6],[0,6.4,-10.4]].map(S3),r:[0.38,0.3,0.24,0.2].map(v=>v*s),n:4,cap:S3([0,5.6,-10.3]),col:c.bk},
      legs:{n:young?4:6,keep:young?[0,1,2,4]:null,col:legCol,F:{x:2.5*s,at:[7*s,4.8*s],P:[[0,7,4.8,1.6,1.9,2.0],[0,3.6,5.0,1.2,1.3,1.4],[0,1.6,5.2,0.8,0.85,0.9],[0,0.6,5.3,0.72,0.78,0.75],[0,0,5.8,0.76,0.95,0.6]].map(S6),cap0:S3([0,9,4.8])},
        B:{x:2.6*s,at:[7.6*s,-6.4*s],P:[[0,7.6,-6.4,1.9,2.4,2.5],[0,4.2,-6.2,1.35,1.5,1.5],[0,1.8,-6.9,0.82,0.85,0.95],[0,0.6,-6.8,0.72,0.78,0.75],[0,0,-6.3,0.76,0.95,0.6]].map(S6),cap0:S3([0,9.6,-6.4])}}});
    return G;}

  /* ================= DOG — Phú Quốc ridgeback (tan), puppy ================= */
  function dog(young){const s=young?0.5:1,hs=young?1.32:1,c={tan:C('#b8743a'),tan2:C('#cf9152'),dk:C('#7a4520'),ridge:C('#6a3a1a'),mask:C('#3a2a20'),bel:C('#dcb282'),nose:C('#141010')};
    const S6=sc6(s),S3=sp3(s);
    const bc=coat({side:c.tan2,back:c.tan,belly:c.bel,na:0.1,nf:0.7,f:(k,p,n)=>mix(k,c.dk,ss(0.75,0.95,n[1])*ss(-6*s,-4*s,p[2])*ss(6*s,4*s,p[2])*0.5)});
    const body=[[0,11.6,-8.6,1.2,1.2,1.3],[0,11.6,-7.8,2.4,2.2,2.6],[0,11.4,-5.8,2.7,2.4,2.7],[0,11.0,-2.2,2.4,2.2,2.2],[0,10.4,1.2,2.8,2.8,3.8],[0,10.8,3.8,2.9,3.0,3.8],[0,11.8,5.8,2.4,2.6,3.0],[0,13.4,7.2,1.9,2.0,2.1],[0,14.6,8.0,1.6,1.7,1.7]].filter((r,i)=>!young||i!==7).map(S6);
    const ly=young?0.78:1,dY=-(1-ly)*10.8*s;if(young){body.forEach(r=>{r[3]*=1.25;r[4]*=1.08;r[5]*=1.12;r[1]+=dY;});}
    const J=add3(S3([0,14.6,7.9]),[0,dY,0]);let hr=[[0,15.3,7.3,1.3,1.3,1.4],[0,15.6,8.4,2.0,1.75,1.65],[0,15.3,9.6,1.85,1.4,1.5],[0,14.6,10.8,1.1,1.0,1.15],[0,14.25,12.0,0.85,0.8,0.85],[0,14.05,12.9,0.66,0.6,0.62]].map(S6).map(r=>[r[0],r[1]+dY,r[2],r[3],r[4],r[5]]);hr=scR(hr,hs,J);
    if(young){hr[3][2]-=0.5;hr[4][2]-=0.9;hr[5][2]-=1.2;hr[1][3]*=1.1;hr[2][3]*=1.1;}
    const hc=(p,n,q)=>{let k=mix(c.tan2,c.tan,ss(0.3,0.9,n[1])*0.5);k=mix(k,c.mask,ss(0.6,0.85,q.s)*0.85);k=mix(k,c.bel,ss(-0.4,-0.8,n[1])*ss(0.3,0.6,q.s)*0.5);if(q.tip||q.s>0.96)k=c.nose;return fur(k,p,0.08,1.4,4);};
    const legCol=(p,n)=>{let k=mix(c.tan2,c.bel,ss(6*s,2*s,p[1])*0.5);if(p[1]<0.4*s)k=mix(k,c.mask,0.6);return fur(k,p,0.08,1.2,5);};
    const LF=[[0,10.8,4.2,1.1,1.5,1.6],[0,7.0,4.0,0.95,1.0,1.25],[0,4.0,4.4,0.55,0.58,0.62],[0,1.6,4.5,0.46,0.48,0.52],[0,0.6,4.8,0.55,0.62,0.52],[0,0,5.4,0.62,0.72,0.48]].map(S6);
    const LB=[[0,11.2,-5.8,1.4,2.0,2.0],[0,7.6,-5.0,1.2,1.5,1.4],[0,4.6,-6.9,0.62,0.6,0.75],[0,3.2,-7.5,0.46,0.42,0.58],[0,0.8,-6.9,0.46,0.48,0.52],[0,0,-6.3,0.62,0.72,0.48]].map(S6);
    if(young){[LF,LB].forEach(L=>L.forEach(r=>{r[1]*=ly;r[3]*=1.3;r[4]*=1.3;r[5]*=1.3;}));}
    const G=quad({kind:young?'puppy':'dog',bodyAt:add3(S3([0,11.2,4.0]),[0,dY,0]),body,bodyN:young?7:12,bodyCol:bc,bodyCap0:add3(S3([0,11.6,-9.0]),[0,dY,0]),
      bodyExtra:(BB,FB)=>{if(!young)bar(BB,FB,2.2,PI/2,6.6,PI/2,0.08,c.ridge,{wig:0.03,blunt:1});},
      head:{at:J,rings:young?hr.filter((r,i)=>i!==4):hr,n:young?6:10,col:hc,cap1:scP(add3(S3(young?[0,14.0,12.6]:[0,13.95,13.3]),[0,dY,0]),hs,J),cap0:scP(add3(S3([0,15.4,6.7]),[0,dY,0]),hs,J),
        extra:(HB,FH,HG,HH)=>{if(young)[PI/2-0.6,PI/2+0.6].forEach(t=>{const p=surf(FH,2.1,t,-0.15);eye(HG,p,0.42,sub3(p,J),C('#140c08'));});else eyesIris(HG,FH,2.15,PI/2-0.6,0.28*s*hs,C('#6a3e1a'),C('#0a0706'));
          [-1,1].forEach(d=>{const b=surf(FH,1.15,d>0?PI/2-0.6:PI/2+0.6,-0.2),e=s*hs;const tip=young?add3(b,[d*1.55*e,-1.0*e,0.7*e]):add3(b,[d*0.85*e,2.55*e,-0.35*e]);
            ear(HB,b,young?add3(b,[d*0.95*e,0.55*e,0.2*e]):add3(b,[d*0.5*e,1.2*e,-0.1*e]),tip,1.3*e,0.22*e,young?[d*0.9,0.1,0.4]:[d*0.3,0.1,1],c.tan,young?c.dk:C('#e8c8a0'),{cup:1.5,n:young?4:6});});}},
      tail:{at:add3(S3([0,11.8,-8.4]),[0,dY,0]),P:(young?[[0,11.8,-8.2],[0,12.0,-9.4],[0,12.9,-10.5],[0,14.0,-10.9]]:[[0,11.8,-8.2],[0,11.6,-9.6],[0,12.0,-11.4],[0,13.0,-12.8],[0,14.4,-13.4]]).map(S3).map(p=>add3(p,[0,dY,0])),r:(young?[0.55,0.5,0.4,0.25]:[0.55,0.5,0.45,0.35,0.22]).map(v=>v*s),n:young?4:5,cap:add3(S3(young?[0,14.6,-11.0]:[0,15.1,-13.5]),[0,dY,0]),col:(p,n)=>fur(mix(c.tan,c.dk,ss(-0.2,0.5,n[1])*0.4),p,0.08,1,8)},
      legs:{n:young?4:6,keep:young?[0,1,3,5]:null,col:legCol,F:{x:1.8*s,at:[10.8*s*ly,4.2*s],P:LF,cap0:S3([0,12.4*ly,4.2])},B:{x:1.9*s,at:[11.2*s*ly,-5.8*s],P:LB,cap0:S3([0,12.8*ly,-5.8])}}});
    return poser(G,{name:'sit',at:[0,0,0],a:0.62,dy:0,head:0.5,tail:1.0,F:{rx:-0.08},B:{rx:-1.35,dy:-1.2*s,dz:1.2*s}});}

  /* ================= GOAT (dê cỏ, brown) ================= */
  function goat(){const c={br:C('#7a4a28'),br2:C('#9a643a'),dk:C('#2a1c14'),bel:C('#5a3a22'),horn:C('#8a7a62'),hornT:C('#4a3e30'),hoof:C('#1a1614'),face:C('#3a2618'),muz:C('#c8b49a')};
    const bc=coat({side:c.br2,back:c.br,belly:c.bel,na:0.14,nf:0.8,f:(k,p,n)=>mix(k,c.dk,ss(0.82,0.97,n[1])*0.85)});
    const body=[[0,12.8,-9.4,1.3,1.2,1.4],[0,12.8,-8.4,3.0,2.6,3.2],[0,12.4,-5.8,3.6,2.9,3.8],[0,12.0,-1.5,4.0,3.0,4.6],[0,12.1,2.4,3.8,3.3,4.4],[0,12.4,5.2,3.0,3.2,3.6],[0,13.6,7.0,2.1,2.3,2.5],[0,15.6,8.0,1.6,1.8,1.85],[0,17.2,8.6,1.4,1.5,1.5]];
    const J=[0,17.2,8.5];const hr=[[0,17.9,8.0,1.3,1.3,1.4],[0,18.2,9.0,1.85,1.5,1.6],[0,17.6,10.2,1.65,1.3,1.4],[0,16.6,11.4,1.15,1.05,1.15],[0,15.8,12.4,0.9,0.85,0.85],[0,15.4,13.0,0.72,0.66,0.7]];
    const hc=(p,n,q)=>{let k=mix(c.br2,c.br,ss(0.3,0.9,n[1])*0.5);k=mix(k,c.face,ss(0.0,0.6,n[2]+n[1]*0.5)*ss(0.25,0.55,q.s)*0.7);const ln=ss(0.5,0.2,Math.abs(Math.abs(p[0])-0.7))*ss(0.2,0.6,q.s)*ss(0.0,0.4,n[2]);k=mix(k,c.muz,ln*0.5);
      k=mix(k,c.muz,ss(0.8,0.95,q.s)*0.6);if(q.tip)k=C('#2a1e18');return fur(k,p,0.1,1.5,4);};
    const legCol=(p,n)=>{if(p[1]<0.9)return c.hoof;return fur(mix(c.br2,c.dk,ss(8,4,p[1])*0.85),p,0.1,1,5);};
    return quad({kind:'goat',bodyAt:[0,12.2,0],body,bodyN:11,bodyCol:bc,bodyCap0:[0,12.8,-9.9],
      head:{at:J,rings:hr,n:10,col:hc,cap1:[0,15.2,13.4],cap0:[0,17.9,7.3],
        extra:(HB,FH,HG,HH)=>{eyesIris(HG,FH,2.0,PI/2-0.72,0.3,C('#c8a03a'),C('#0a0806'),[0.35,0.5,1.3]);
          [-1,1].forEach(d=>{const b=surf(FH,1.3,d>0?0.25:PI-0.25,-0.2);ear(HB,b,add3(b,[d*1.3,-0.3,0.3]),add3(b,[d*2.7,-0.9,0.4]),0.85,0.16,[0.1*d,-0.3,1],c.br2,C('#c8a888'),{cup:1.4});
            const r0=surf(FH,0.95,PI/2-d*0.38,-0.25);tube(HH,[r0,add3(r0,[d*0.3,1.3,-0.8]),add3(r0,[d*0.7,2.1,-2.1]),add3(r0,[d*0.9,2.2,-3.3])],[0.42,0.36,0.26,0.14],4,(p)=>mix(c.horn,c.hornT,ss(r0[1]+1,r0[1]+2.2,p[1])),{cap1:add3(r0,[d*0.95,2.0,-3.8])});});
          const ch=surf(FH,4.6,-PI/2,-0.2);spike(HB,ch,add3(ch,[0,-1.9,-0.4]),0.45,4,c.dk);}},
      tail:{at:[0,13.6,-9.3],P:[[0,13.6,-9.1],[0,14.6,-9.8],[0,15.4,-9.9]],r:[0.45,0.42,0.2],n:4,cap:[0,15.8,-9.8],col:c.dk},
      legs:{n:6,keep:[0,1,2,4,5,6],col:legCol,F:{x:2.0,at:[11.6,5.0],P:[[0,11.6,5.0,1.3,1.8,1.9],[0,7.6,5.0,1.0,1.1,1.2],[0,5.0,5.3,0.62,0.66,0.7],[0,4.0,5.35,0.66,0.7,0.72],[0,1.6,5.3,0.45,0.48,0.55],[0,0.8,5.6,0.5,0.6,0.45],[0,0,6.1,0.6,0.75,0.45]],cap0:[0,13.4,5]},
        B:{x:2.1,at:[12.2,-6.4],P:[[0,12.2,-6.4,1.6,2.2,2.3],[0,8.0,-5.6,1.3,1.6,1.4],[0,5.4,-7.5,0.62,0.6,0.85],[0,4.4,-7.7,0.55,0.5,0.66],[0,1.6,-7.2,0.45,0.48,0.55],[0,0.8,-6.9,0.5,0.6,0.45],[0,0,-6.4,0.6,0.75,0.45]],cap0:[0,14,-6.4]}}});}

  /* ================= INSECTS (real size; 1 m = 20 du) — ≤60 ▲, bold silhouettes & contrast so they still read at ×3 ================= */
  function insect(kind){const G=grp(),bodyAt=[0,0,0],body=pv('body',bodyAt,null);G.add(body);const B=new VB(),Gs=new VB(),rig={body,head:body};let len=0.3,bm='a4Fur';
    // one wing: 3-tri fan from the root (veined colour: darker leading edge)
    const wing1=(V,d,root,L,Wd,sw,cA,cB)=>{const [x,y,z]=root,P=[[x+d*L*0.3,y+0.004,z+Wd*0.45],[x+d*L,y+0.008,z+Wd*0.15-sw],[x+d*L*0.92,y+0.008,z-Wd*0.4-sw],[x+d*L*0.35,y+0.004,z-Wd*0.55]];
      const wc=(p)=>mix(cA,cB,ss(0,L,Math.abs(p[0]-x))*0.5+ss(z+Wd*0.2,z-Wd*0.4,p[2])*0.5);fan(V,[root,...P],wc);};
    const wings=(root,L,Wd,sw,cA,cB,two)=>{[-1,1].forEach(d=>{const at=[d*Math.abs(root[0]),root[1],root[2]],P=pv(d<0?'wingL':'wingR',at,body,bodyAt),V=new VB();wing1(V,d,at,L,Wd,sw,cA,cB);
      if(two)wing1(V,d,[at[0],at[1],at[2]-two[0]],L*two[1],Wd*0.95,sw,cA,cB);P.add(V.mesh('a4Thin',at,'wing'));rig[d<0?'wingL':'wingR']=P;});};
    if(kind==='bee'){// honeybee ≈0.3 du: fuzzy tawny thorax, amber/black banded abdomen, smoky wings
      loft(B,[[0,0.052,-0.2,0.014,0.012],[0,0.055,-0.155,0.044,0.04],[0,0.058,-0.105,0.052,0.047],[0,0.06,-0.055,0.046,0.042],[0,0.064,-0.01,0.026,0.026]],4,
        (p,n,q)=>[C('#1e160e'),C('#e8a42a'),C('#1e160e'),C('#e8b038')][q.i]||C('#1e160e'),{face:1,cap0:[0,0.05,-0.215],rot:PI/4});
      octa(B,[0,0.068,0.035],0.05,[0.95,0.9,0.95],C('#8a6430'));octa(B,[0,0.064,0.1],0.032,[1.15,0.95,0.75],C('#1a140e'));wings([0.02,0.1,0.04],0.15,0.065,0.02,C('#dce6ec'),C('#9aa8b0'));len=0.32;}
    else if(kind==='mosquito'){// Aedes-like: black with white bands, long legs, proboscis
      loft(B,[[0,0.09,-0.16,0.006,0.006],[0,0.088,-0.1,0.016,0.015],[0,0.09,-0.02,0.016,0.015],[0,0.095,0.03,0.024,0.026]],4,(p,n,q)=>q.i===1?C('#e8e2d6'):C('#1a1816'),{face:1,cap0:[0,0.09,-0.18],cap1:[0,0.096,0.065]});
      octa(B,[0,0.09,0.08],0.016,[1,1,1],C('#141210'));B.t([-0.003,0.088,0.09],[0.003,0.088,0.09],[0,0.07,0.17],C('#141210'),0);
      [-1,1].forEach(d=>[[0.025,0.1,0.07],[0.0,0.13,0.0],[-0.025,0.12,-0.09]].forEach(([z,l,dz])=>B.t([d*0.008,0.085,z],[d*0.008,0.085,z+0.012],[d*l,0.0,z+dz],C('#2e2a26'),0)));
      wings([0.01,0.105,0.02],0.11,0.03,0.015,C('#d0d6d6'),C('#8a9494'));len=0.28;}
    else if(kind==='fly'){// house/blow fly: bristly grey thorax, metallic green abdomen, big red eyes
      loft(B,[[0,0.06,-0.12,0.016,0.012],[0,0.065,-0.07,0.05,0.042],[0,0.07,0.0,0.045,0.045],[0,0.072,0.06,0.035,0.035]],4,(p,n,q)=>q.i<1.5?mix(C('#2e5a3a'),C('#7ab06a'),ss(0.2,0.9,n[1])):C('#4a4a46'),{cap0:[0,0.06,-0.14],rot:PI/4});
      octa(B,[0,0.068,0.085],0.03,[1,0.9,0.7],C('#2a2420'));[-1,1].forEach(d=>octa(Gs,[d*0.026,0.078,0.09],0.022,[0.8,1.1,0.9],C('#8a1a10')));
      wings([0.015,0.105,0.025],0.12,0.06,0.03,C('#d6dad4'),C('#8a9088'));len=0.22;}
    else if(kind==='dragonfly'){// ≈1.4 du: green thorax, metallic blue abdomen, big eyes, 2 wing pairs per side (one group each)
      loft(B,[[0,0.1,-1.05,0.018,0.02],[0,0.1,-0.55,0.032,0.034],[0,0.1,-0.12,0.045,0.05],[0,0.105,0.06,0.075,0.08],[0,0.105,0.17,0.06,0.06]],4,(p,n,q)=>q.i>=2.5?mix(C('#2a6a3a'),C('#6ac04a'),ss(0,0.8,n[1])):mix(C('#123a7a'),C('#3a9ae8'),ss(-0.3,0.8,n[1])),{cap0:[0,0.1,-1.1]});
      octa(Gs,[0,0.12,0.21],0.06,[1.7,0.85,0.9],C('#2a5a9a'));wings([0.02,0.15,0.12],0.66,0.1,0.04,C('#c8d8e0'),C('#7a98aa'),[0.17,0.92]);bm='a4Gloss';len=1.4;}
    else if(kind==='caterpillar'){// ≈1.2 du: green with yellow side spots, 5 nested segments (rotate .y)
      const seg=[],rest=[0.15,-0.2,0.22,-0.2,0.15];let parent=body,pAt=bodyAt;octa(B,[0,0.075,0.62],0.075,[1,0.95,0.9],C('#3a6a1a'));octa(B,[0,0.06,0.68],0.03,[1.6,0.6,0.6],C('#141008'));
      for(let i=0;i<5;i++){const at=[0,0.075,0.55-i*0.2],P=pv('seg'+i,at,parent,pAt);P.rotation.y=rest[i];parent.add(P);parent=P;pAt=at;seg.push(P);const SB=new VB(),r=0.085-i*0.007;
        octa(SB,[0,0.075,at[2]-0.1],r,[1.05,1,1.25],(p,n)=>Math.abs(n[0])>0.6&&n[1]>-0.2?C('#f2d23a'):n[1]<-0.4?C('#7aa83a'):C('#5a9a2a'));P.add(SB.mesh('a4Gloss',at,'seg'));}
      rig.seg=seg;rig.segRest=rest.slice();bm='a4Gloss';len=1.25;}
    else if(kind==='beetle'){// rhinoceros-ish beetle ≈0.5 du, glossy chestnut elytra (closed), horn
      loft(B,[[0,0.06,-0.24,0.05,0.035],[0,0.085,-0.15,0.12,0.085,0.03],[0,0.09,0.0,0.13,0.09,0.03],[0,0.08,0.1,0.11,0.07,0.03]],5,(p,n)=>mix(C('#1a100c'),C('#6a3a1e'),ss(0.3,0.95,n[1])),{cap0:[0,0.05,-0.27],cap1:[0,0.075,0.13]});
      octa(B,[0,0.065,0.18],0.07,[1.1,0.7,0.9],C('#160e0a'));spike(B,[0,0.08,0.22],[0,0.17,0.3],0.02,3,C('#1a100c'));
      [-1,1].forEach(d=>[0.08,-0.02,-0.12].forEach(z=>B.t([d*0.08,0.035,z],[d*0.08,0.035,z+0.03],[d*0.2,0.0,z+0.05*(z>0?1:-1)],C('#140c0a'),0)));
      const eL=grp('elytraL'),eR=grp('elytraR');body.add(eL,eR);rig.elytraL=eL;rig.elytraR=eR;bm='a4Gloss';len=0.5;}
    else if(kind==='firefly'){// ≈0.25 du: dark wing cases, orange pronotum, glowing abdomen tip ('glow' mesh on a4Glow)
      loft(B,[[0,0.05,-0.08,0.035,0.028],[0,0.058,0.02,0.042,0.03],[0,0.056,0.1,0.034,0.024]],5,(p)=>p[2]>0.06?C('#e07a2a'):C('#221c16'),{cap0:[0,0.05,-0.1],cap1:[0,0.055,0.13]});
      const gl=new VB();octa(gl,[0,0.045,-0.12],0.04,[0.9,0.75,1.3],C('#eef27a'));const gm=gl.mesh('a4Glow',null,'glow');body.add(gm);rig.glow=gm;
      wings([0.015,0.08,0.03],0.1,0.05,0.02,C('#3a3026'),C('#1e1a16'));len=0.25;}
    else return null;
    const m=B.mesh(bm,null,'body');if(m)body.add(m);const g2=Gs.mesh('a4Gloss',null,'eyes');if(g2)body.add(g2);
    G.userData.rig=rig;G.userData.len=len;G.userData.kind=kind;const b=bbox(G);G.userData.h=+(b.max.y-b.min.y).toFixed(2);G.userData.r=+(len/2).toFixed(2);return G;}

  /* ================= wrapper ================= */
  const NEW={deer:()=>deer(true),doe:()=>deer(false),boar,wolf,bear,tiger,gaur,rabbit:()=>bakeScale(rabbit(),0.8),monkey,crocodile,snake:(s)=>snake(s||1),junglefowl:()=>bakeScale(fowl('rooster'),0.8),chicken:()=>bakeScale(fowl('hen'),0.85),chick:()=>bakeScale(fowl('chick'),0.85),bird,frog,
    carp:()=>fish('carp'),catfish:()=>fish('catfish'),snakehead:()=>fish('snakehead'),fish:()=>fish('carp'),butterfly:(s)=>butterfly(s||1),
    pig:()=>pig(false),piglet:()=>pig(true),dog:()=>dog(false),puppy:()=>dog(true),goat};
  M.fish=(v)=>fish(FSP[v]?v:'carp');M.butterfly=(seed)=>butterfly(seed||1);
  const INS=['bee','mosquito','fly','dragonfly','caterpillar','beetle','firefly'];M.insect=(kind)=>INS.includes(kind)?insect(kind):insect('bee');if(M.list)M.list.insects=INS.slice();
  const prev=M.animal;M.animal4aPrev=prev;
  M.animal=(kind,...a)=>NEW[kind]?NEW[kind](...a):prev(kind,...a);
  Object.keys(NEW).forEach(k=>{if(M.list&&M.list.animals&&!M.list.animals.includes(k))M.list.animals.push(k);});
}
