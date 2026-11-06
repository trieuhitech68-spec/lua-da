/* ===================== SB MODELS 2 — Vietnamese landscape + first-person assets =====================
   Needs models.js (window.SBM) first: call SBmodels2Init() right after SBmodelsInit(). Adds builders to window.SBM and lists them in M.list.extra.
   Same conventions as models.js: units du (1 m ≈ 20 du, human ≈ 36–40 du), every builder returns a NEW THREE.Group, origin at ground centre,
   bottom at y=0 (rock bases / roots sink a little below 0 on purpose), front +Z, deterministic (`seed`), no Math.random.
   Most parts use VERTEX COLOURS on a handful of shared materials (few draw calls when instanced, rich colour variation):
     sb2Rock  limestone/stones (rock texture × vertex colour, flat)      sb2Veg   foliage, leaves, flowers (flat, double sided)
     sb2Wood  bark, stems, roots (flat)                                  sb2Culm  bamboo culms (bamboo texture × vertex colour)
     sb2Palm  palm trunk (ring texture × vertex colour)                  sb2Grass M.grassMat: smooth, double sided, up-facing normals (grass cover)
     sb2Skin  first-person arm (smooth)
   M.mat2 holds them all (shared instances; material.name === userData.key === the sb2 name).
*/
function SBmodels2Init(){const M=window.SBM;if(!M||M.v2)return;M.v2=1;
  const K=(typeof K3!=='undefined')?K3:window.K3,T=K.T,PI=Math.PI,TAU=PI*2,DS=T.DoubleSide;
  /* ---------------- materials ---------------- */
  const MPX={sb2CulmTex:['#ffffff',.6,0,'bamboo'],sb2RingTex:['#ffffff',.95,0,'logs']};
  for(const k in MPX)if(!K.MP[k])K.MP[k]=MPX[k];
  const noFlip=m=>{const prev=m.onBeforeCompile;m.onBeforeCompile=(sh,r)=>{if(prev)prev.call(m,sh,r);
      sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\n#ifdef DOUBLE_SIDED\n#ifndef FLAT_SHADED\nnormal=normal*faceDirection;\n#endif\n#endif');};
    m.customProgramCacheKey=()=>'sb2nf';return m;};
  // fine-grained limestone texture (subtle speckle + faint vertical solution runnels), white base → tinted by vertex colours
  const limeTex=()=>{const N=256,cv=document.createElement('canvas');cv.width=cv.height=N;const c=cv.getContext('2d');let a=12345;const R=()=>{a=(a*16807)%2147483647;return a/2147483647;};
    c.fillStyle='#f4f4f2';c.fillRect(0,0,N,N);
    for(let i=0;i<1400;i++){const x=R()*N,y=R()*N,r=0.6+R()*1.8,d=R()<0.6;c.fillStyle=d?'rgba(60,56,50,'+(0.05+R()*0.1)+')':'rgba(255,255,250,'+(0.1+R()*0.2)+')';c.fillRect(x,y,r,r*(0.7+R()*0.8));}
    for(let i=0;i<70;i++){const x=R()*N,y=R()*N,w=8+R()*30,h=6+R()*22;c.fillStyle='rgba('+(R()<0.5?'70,64,56':'255,252,244')+','+(0.03+R()*0.05)+')';c.beginPath();c.ellipse(x,y,w,h,0,0,7);c.fill();}
    for(let i=0;i<46;i++){const x=R()*N,y0=R()*N,l=20+R()*90,w=0.8+R()*2.2;c.fillStyle='rgba(50,46,42,'+(0.05+R()*0.09)+')';for(const o of [0,-N])c.fillRect(x,y0+o,w,l);}
    const t=new T.CanvasTexture(cv);t.wrapS=t.wrapT=T.RepeatWrapping;t.encoding=T.sRGBEncoding;t.anisotropy=4;return t;};
  const vmat=(name,o)=>{const p={vertexColors:true,roughness:o.r,metalness:0,flatShading:!!o.flat};if(o.tex)p.map=o.tex==='lime'?limeTex():K.mat(o.tex).map;if(o.ds)p.side=DS;
    const m=new T.MeshStandardMaterial(p);m.name=name;m.userData.key=name;if(o.nf)noFlip(m);return m;};
  const MT={sb2Rock:vmat('sb2Rock',{r:.93,flat:1,tex:'lime'}),sb2Veg:vmat('sb2Veg',{r:.8,flat:1,ds:1}),sb2Wood:vmat('sb2Wood',{r:.9,flat:1}),
    sb2Culm:vmat('sb2Culm',{r:.55,flat:1,tex:'sb2CulmTex'}),sb2Palm:vmat('sb2Palm',{r:.92,flat:1,tex:'sb2RingTex'}),
    sb2Grass:vmat('sb2Grass',{r:.95,ds:1,nf:1}),sb2Skin:vmat('sb2Skin',{r:.62})};
  M.mat2=MT;M.grassMat=MT.sb2Grass;
  /* ---------------- helpers ---------------- */
  const RNG=s=>{let a=(((Math.abs(+s||0)*1000)|0)+1)*2654435761>>>0;return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};};
  const g=(...c)=>K.group(...c),V=(x,y,z)=>new T.Vector3(x,y,z);
  const hsh=(a,b,c,d)=>{let h=(Math.imul(a|0,0x27d4eb2d)^Math.imul(b|0,0x165667b1)^Math.imul(c|0,0x5bd1e995)^Math.imul((d|0)+7,0x85ebca77))>>>0;h=Math.imul(h^(h>>>15),0x2c1b3c6d);h=Math.imul(h^(h>>>12),0x297a2d39);return ((h^(h>>>15))>>>0)/4294967296;};
  const sm=t=>t*t*(3-2*t),cl=t=>t<0?0:t>1?1:t,ss=(a,b,x)=>sm(cl((x-a)/(b-a)));
  const vn3=(x,y,z,s)=>{const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),fx=sm(x-xi),fy=sm(y-yi),fz=sm(z-zi);let r=0;
    for(let k=0;k<8;k++){const dx=k&1,dy=(k>>1)&1,dz=(k>>2)&1;r+=hsh(xi+dx,yi+dy,zi+dz,s)*(dx?fx:1-fx)*(dy?fy:1-fy)*(dz?fz:1-fz);}return r;};
  const CCH={},C=h=>{if(CCH[h])return CCH[h];const c=new T.Color(h);return CCH[h]=[c.r,c.g,c.b];};
  const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],mul=(a,f)=>[a[0]*f,a[1]*f,a[2]*f];
  const add3=(a,b,k)=>[a[0]+b[0]*(k===undefined?1:k),a[1]+b[1]*(k===undefined?1:k),a[2]+b[2]*(k===undefined?1:k)],sub3=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
  const len3=a=>Math.hypot(a[0],a[1],a[2]),nrm3=a=>{const l=len3(a)||1;return [a[0]/l,a[1]/l,a[2]/l];},crs=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const lerp3=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
  const fnorm=(a,b,c)=>nrm3(crs(sub3(b,a),sub3(c,a)));
  // vertex-coloured triangle soup. cf(p, faceNormal) → linear rgb
  function VB(cf){this.p=[];this.c=[];this.cf=cf||(()=>[1,1,1]);}
  VB.prototype.t=function(a,b,c){const n=fnorm(a,b,c);this.p.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);for(const v of [a,b,c]){const k=this.cf(v,n);this.c.push(k[0],k[1],k[2]);}return this;};
  // oriented: normal away from r (or towards r if inw)
  VB.prototype.o=function(a,b,c,r,inw){const u=sub3(b,a),w=sub3(c,a),n=crs(u,w),m=[(a[0]+b[0]+c[0])/3-r[0],(a[1]+b[1]+c[1])/3-r[1],(a[2]+b[2]+c[2])/3-r[2]];
    return ((n[0]*m[0]+n[1]*m[1]+n[2]*m[2]>=0)!==!!inw)?this.t(a,b,c):this.t(a,c,b);};
  VB.prototype.q=function(a,b,c,d,r,inw){this.o(a,b,c,r,inw);return this.o(a,c,d,r,inw);};
  VB.prototype.n=function(){return this.p.length/9;};
  VB.prototype.mesh=function(m,o){const ge=new T.BufferGeometry();ge.setAttribute('position',new T.Float32BufferAttribute(this.p,3));ge.setAttribute('color',new T.Float32BufferAttribute(this.c,3));
    const ms=K.mesh(ge,MT[m]||m,o);ms.name=MT[m]?m:'';return ms;};
  // tube along polyline P (radius r[i] = number | [ra,rb]); n sides; o:{cap0,cap1 (bool | point), jit, seed, ref, rot}
  function tube(B,P,r,n,o){o=o||{};const L=P.length,rings=[];let nr=null;
    for(let i=0;i<L;i++){const p=P[i],d=nrm3(sub3(P[Math.min(L-1,i+1)],P[Math.max(0,i-1)]));
      if(!nr){const h=o.ref||(Math.abs(d[1])<0.95?[0,1,0]:[1,0,0]);const k=h[0]*d[0]+h[1]*d[1]+h[2]*d[2];nr=nrm3([h[0]-d[0]*k,h[1]-d[1]*k,h[2]-d[2]*k]);}
      else{const k=nr[0]*d[0]+nr[1]*d[1]+nr[2]*d[2];nr=nrm3([nr[0]-d[0]*k,nr[1]-d[1]*k,nr[2]-d[2]*k]);}
      const bn=crs(d,nr),ri=r[i],ra=Array.isArray(ri)?ri[0]:ri,rb=Array.isArray(ri)?ri[1]:ri,ring=[];
      for(let j=0;j<n;j++){const t=j/n*TAU+(o.rot||0),f=o.jit?1+(hsh(i,j,o.seed||1,11)-.5)*o.jit:1,cx=Math.cos(t)*ra*f,sy=Math.sin(t)*rb*f;
        ring.push([p[0]+nr[0]*cx+bn[0]*sy,p[1]+nr[1]*cx+bn[1]*sy,p[2]+nr[2]*cx+bn[2]*sy]);}
      rings.push(ring);}
    for(let i=0;i<L-1;i++){const A=rings[i],Bq=rings[i+1],ref=lerp3(P[i],P[i+1],0.5);for(let j=0;j<n;j++){const j1=(j+1)%n;B.q(A[j],A[j1],Bq[j1],Bq[j],ref);}}
    if(o.cap1){const tp=Array.isArray(o.cap1)?o.cap1:P[L-1],A=rings[L-1],ref=lerp3(P[L-1],P[L-2],0.6);for(let j=0;j<n;j++)B.o(A[j],A[(j+1)%n],tp,ref);}
    if(o.cap0){const tp=Array.isArray(o.cap0)?o.cap0:P[0],A=rings[0],ref=lerp3(P[0],P[1],0.6);for(let j=0;j<n;j++)B.o(A[j],A[(j+1)%n],tp,ref);}
    return rings;}
  // jittered icosahedron blob (20 tris, det 0) centred at c, scale s=[sx,sy,sz]
  function blob(B,c,r,s,seed,amt,det){let ge=new T.IcosahedronGeometry(r,det||0);ge=ge.index?ge.toNonIndexed():ge;const p=ge.attributes.position,R=RNG(seed),mp={};
    for(let i=0;i<p.count;i++){const k=Math.round(p.getX(i)*100)+'_'+Math.round(p.getY(i)*100)+'_'+Math.round(p.getZ(i)*100);if(!mp[k])mp[k]=1+(R()-.5)*(amt===undefined?0.3:amt);}
    const pt=i=>{const k=Math.round(p.getX(i)*100)+'_'+Math.round(p.getY(i)*100)+'_'+Math.round(p.getZ(i)*100),f=mp[k];return [c[0]+p.getX(i)*f*s[0],c[1]+p.getY(i)*f*s[1],c[2]+p.getZ(i)*f*s[2]];};
    for(let i=0;i<p.count;i+=3)B.t(pt(i),pt(i+1),pt(i+2));ge.dispose();return B;}
  // closed-ish cone from base centre b (radius r) to apex a, n sides, base open (hidden)
  function spike(B,b,a,r,n,rot){const d=nrm3(sub3(a,b));let u=nrm3(crs(Math.abs(d[1])<0.9?[0,1,0]:[1,0,0],d));const v=crs(d,u),rim=[];
    for(let j=0;j<n;j++){const t=j/n*TAU+(rot||0);rim.push([b[0]+(u[0]*Math.cos(t)+v[0]*Math.sin(t))*r,b[1]+(u[1]*Math.cos(t)+v[1]*Math.sin(t))*r,b[2]+(u[2]*Math.cos(t)+v[2]*Math.sin(t))*r]);}
    for(let j=0;j<n;j++)B.o(rim[j],rim[(j+1)%n],a,b);return B;}
  // pinnate frond: rachis polyline Rp, leaflet half-width w(s), droop; sawtooth (1 tri per side per segment)
  function frond(B,Rp,wf,droop,fwd,thin){const n=Rp.length-1;for(let i=0;i<n;i++){const a=Rp[i],b=Rp[i+1],d=nrm3(sub3(b,a)),sd=nrm3(crs(d,[0,1,0])),s=(i+0.5)/n,w=wf(s),m=lerp3(a,b,0.5+(fwd||0.35)),b2=thin?lerp3(a,b,thin):b;
      for(const k of [-1,1]){const tip=[m[0]+sd[0]*w*k,m[1]-w*droop,m[2]+sd[2]*w*k];B.t(a,b2,tip);}}return B;}
  const ptsOn=(P,t)=>{const n=P.length-1,f=cl(t)*n,i=Math.min(n-1,Math.floor(f));return lerp3(P[i],P[i+1],f-i);};
  const jitc=(c,s,amt)=>{const k=1+(hsh(s,3,5,9)-.5)*amt;return [c[0]*k,c[1]*k*(1+(hsh(s,4,6,9)-.5)*amt*0.5),c[2]*k];};
  const trisOf=o=>{let n=0;o.traverse(m=>{if(m.isMesh){const ge=m.geometry;n+=(ge.index?ge.index.count:ge.attributes.position.count)/3;}});return Math.round(n);};
  M.tris2=trisOf;
  const extra=[];const reg=(key,fn)=>{M[key]=fn;extra.push(key);};

  /* ======================================== 1. KARST TOWER ======================================== */
  const LIME=[C('#d6d2c7'),C('#b2ada2'),C('#e6e2d8')],STRK=C('#3e3c38'),OCH=C('#a88a62'),KBASE=C('#62654f'),KGR=[C('#4a6a2e'),C('#365826'),C('#5b7a34')],TUFT=[C('#4a7232'),C('#3c6429'),C('#5f8538'),C('#527a30'),C('#6a8a36')];
  const limeCol=(H,s,shadeDown)=>(p,n)=>{const y=p[1],t=cl(y/H);
    let c=mix(LIME[0],LIME[1],vn3(p[0]*.022,p[1]*.011,p[2]*.022,s));c=mix(c,LIME[2],cl(vn3(p[0]*.07,p[1]*.03,p[2]*.07,s+1)*1.6-0.8));
    const th=Math.atan2(n[2],n[0]),ux=Math.cos(th)*3.2,uz=Math.sin(th)*3.2,hz=Math.abs(n[1])<0.55?1:0;
    c=mix(c,STRK,ss(.48,.66,vn3(ux,p[1]*.005,uz,s+2))*0.8*ss(-5,30,y)*hz);
    c=mix(c,OCH,ss(.58,.84,vn3(p[0]*.05,p[1]*.006,p[2]*.05,s+3))*0.5);
    c=mix(c,KBASE,cl(1-(y+10)/(H*0.08+12))*0.8);
    const vg=ss(.6,.74,vn3(ux*1.4,p[1]*.007,uz*1.4,s+6))*ss(0.1,0.3,t)*0.85;if(vg>0)c=mix(c,KGR[1],vg);// green drapes below ledges
    const gv=ss(0.4-0.5*ss(.6,.85,t),0.72-0.5*ss(.6,.85,t),n[1]+(vn3(p[0]*.04,p[1]*.04,p[2]*.04,s+4)-.5)*0.5);if(gv>0)c=mix(c,mix(KGR[0],KGR[(hsh(p[0]*3|0,p[2]*3|0,s,1)<.5)?1:2],vn3(p[0]*.05,p[1]*.05,p[2]*.05,s+5)),gv*0.95);
    if(n[1]<-0.12)c=mul(c,shadeDown||0.7);return c;};
  // one tower: rings from profile [[t,f]...] (t<0 → y=-10), n columns; returns {rings, cen, ap}
  function tower(B,o){const R=RNG(o.seed),H=o.H,n=o.n,cols=[];for(let j=0;j<n;j++)cols.push({a:(j+(R()-.5)*0.55)/n*TAU,m:1+(R()-.5)*0.3+(j%2?-0.07:0.07)});
    const la=R()*TAU,rings=[],cen=[],L=o.prof.length;
    o.prof.forEach(([t,f],i)=>{const tt=Math.max(0,t),y=t<0?-10:t*H,kick=i>2?1+(R()-.5)*0.09:1,crown=ss(0.78,0.95,tt),
        cx=o.cx+Math.cos(la)*o.Rb*o.lean*Math.pow(tt,1.5)+(vn3(i*0.7,0,0,o.seed)-.5)*o.Rb*0.1,cz=o.cz-Math.sin(la)*o.Rb*o.lean*Math.pow(tt,1.5)+(vn3(0,i*0.7,0,o.seed)-.5)*o.Rb*0.1;
      const ring=[];for(let j=0;j<n;j++){const c=cols[j],rr=o.Rb*f*kick*c.m*(1+(vn3(j*0.9,i*0.55,1,o.seed)-.5)*0.22)*(1+(hsh(i,j,o.seed,3)-.5)*0.07),
          yy=y+(i>1?(hsh(i,j,o.seed,5)-.5)*H*(0.02+0.07*crown):0);ring.push([cx+Math.cos(c.a)*rr,yy,cz-Math.sin(c.a)*rr]);}rings.push(ring);cen.push([cx,y,cz]);});
    for(let i=0;i<L-1;i++){const A=rings[i],Bq=rings[i+1],ref=lerp3(cen[i],cen[i+1],0.5);for(let j=0;j<n;j++){const j1=(j+1)%n;B.q(A[j],A[j1],Bq[j1],Bq[j],ref);}}
    const top=rings[L-1],ct=cen[L-1],ap=[ct[0]+(R()-.5)*o.Rb*0.1,o.H*o.top,ct[2]+(R()-.5)*o.Rb*0.1],rf=[ct[0],ct[1]-o.H*0.05,ct[2]];
    for(let j=0;j<n;j++)B.o(top[j],top[(j+1)%n],ap,rf);return {rings,cen,ap};}
  const KPROF=[[-1,.98],[0,.94],[.035,.86],[.08,1.0],[.18,.99],[.3,.97],[.43,.94],[.55,.89],[.66,.81],[.75,.71],[.83,.57],[.9,.41],[.95,.23]];
  const KPROF2=[[-1,.96],[0,.92],[.05,.84],[.12,.98],[.3,.95],[.5,.86],[.68,.68],[.82,.46],[.92,.22]];
  // leafy shrub tufts (20-tri blobs), AO-shaded: q={c,r,s}
  function tufts(B,pts,s){pts.forEach((q,i)=>{const base=TUFT[(hsh(i,s,2,2)*TUFT.length)|0],cy=q.c[1];
      B.cf=(p,n)=>mul(jitc(base,s*7+i,0.2),0.68+0.24*cl(0.5+0.5*n[1])+0.12*cl((p[1]-cy)/q.r));blob(B,q.c,q.r,q.s||[1.15,0.82,1.15],s*31+i,0.42);});}
  reg('karst',(v,seed)=>{v=Math.max(1,Math.min(3,(+v||1)|0));seed=+seed||1;const R=RNG(seed*53+v*7),H=[220,340,480][v-1],Rb=H*(0.37+R()*0.05),G=g(),B=new VB(limeCol(H,seed*5+v)),T2=new VB();
    const main=tower(B,{cx:0,cz:0,H,Rb,n:v===1?18:16,seed:seed*13+v,prof:KPROF.map(([t,f])=>[t,f*(1+(R()-.5)*0.06)]),lean:0.16+R()*0.12,top:0.99});
    let sec=null;if(v>=2){const a=R()*TAU,d=Rb*0.55;sec={x:Math.cos(a)*d,z:-Math.sin(a)*d,H:H*(v===2?0.62:0.72),Rb:Rb*0.56};
      sec.t=tower(B,{cx:sec.x,cz:sec.z,H:sec.H,Rb:sec.Rb,n:10,seed:seed*17+v,prof:KPROF2,lean:0.25,top:0.98});}
    const pts=[],nt=Math.max(8,Math.min(20,Math.floor((895-B.n())/20))),rg=main.rings,ncol=rg[0].length,L=rg.length;
    // summit jungle cap
    const tc=main.cen[L-1];pts.push({c:[main.ap[0],main.ap[1]-H*0.035,main.ap[2]],r:H*0.085,s:[1.2,0.7,1.2]});
    for(let k=0;k<4;k++){const p=rg[L-1-(k%2)][(Math.floor(k*ncol/4)+(seed%3))%ncol],u=nrm3([p[0]-tc[0],0,p[2]-tc[2]]),r=H*(0.06+R()*0.02);pts.push({c:[p[0]-u[0]*r*0.25,p[1]-r*0.15,p[2]-u[2]*r*0.25],r,s:[1.15,0.75,1.15]});}
    if(sec){const p=sec.t.ap;pts.push({c:[p[0],p[1]-H*0.03,p[2]],r:H*0.06,s:[1.2,0.72,1.2]});}
    // ledge shrubs: prefer vertices where the ring above steps inwards
    while(pts.length<nt){const i=3+Math.floor(R()*(L-5)),j=Math.floor(R()*ncol),p=rg[i][j],ce=main.cen[i],q=rg[i+1][j],d0=Math.hypot(p[0]-ce[0],p[2]-ce[2]),d1=Math.hypot(q[0]-main.cen[i+1][0],q[2]-main.cen[i+1][2]);
      if(d1>d0*0.97&&R()<0.7)continue;const u=nrm3([p[0]-ce[0],0,p[2]-ce[2]]),r=H*(0.028+R()*0.03);pts.push({c:[p[0]-u[0]*r*0.1,p[1]+r*0.2,p[2]-u[2]*r*0.1],r,s:[1.25,0.78,1.25]});}
    tufts(T2,pts,seed*3+v);
    G.add(B.mesh('sb2Rock',{uv:96}),T2.mesh('sb2Veg'));
    const r0=rg[1].reduce((s,p)=>s+Math.hypot(p[0],p[2]),0)/ncol;G.userData.r=Math.round(r0*0.97);G.userData.h=H;G.userData.sink=10;
    G.userData.colliders=[[0,0,G.userData.r]];if(sec){const rs=sec.t.rings[1].reduce((s,p)=>s+Math.hypot(p[0]-sec.x,p[2]-sec.z),0)/10;G.userData.colliders.push([+sec.x.toFixed(1),+sec.z.toFixed(1),Math.round(rs*0.95)]);}
    return G;});

  /* ======================================== 2. CAVE ======================================== */
  const CN=15,IN=[[90,35,55],[72,42,60],[46,52,66],[16,56,65],[-14,49,57],[-37,35,43]],IBACK=[0,17,-52];
  const OUT=[[95,44,63,1],[100,80,96,5],[104,132,142,8],[97,162,178,9],[62,176,192,10],[-8,172,184,12],[-80,142,138,10],[-122,100,76,8]],OEND=[0,4,-142];
  const archPt=(w,h,j,ex,ey,y0)=>{const f=j/(CN-1)*PI,c=Math.cos(f),s=Math.sin(f);return [w*Math.sign(c)*Math.pow(Math.abs(c),ex),y0!==undefined&&(j===0||j===CN-1)?y0:h*Math.pow(s,ey),0];};
  // passage / outline polygons (x,z) for the collider cover
  const PAS=[...IN.map(r=>[r[1],r[0]]),[0,IBACK[2]],...IN.slice().reverse().map(r=>[-r[1],r[0]])];
  const OUTL=[[IN[0][1],IN[0][0]],...OUT.map(r=>[r[1],r[0]]),[0,OEND[2]],...OUT.slice().reverse().map(r=>[-r[1],r[0]]),[-IN[0][1],IN[0][0]]];
  const inPoly=(x,z,P)=>{let ins=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if(((a[1]>z)!==(b[1]>z))&&(x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0]))ins=!ins;}return ins;};
  const dPoly=(x,z,P)=>{let d=1e9;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[j],b=P[i],ex=b[0]-a[0],ez=b[1]-a[1],t=cl(((x-a[0])*ex+(z-a[1])*ez)/(ex*ex+ez*ez||1)),dx=a[0]+ex*t-x,dz=a[1]+ez*t-z;d=Math.min(d,Math.hypot(dx,dz));}return d;};
  let CAVECOL=null;
  function caveColliders(){if(CAVECOL)return CAVECOL;const pts=[];for(let x=-170;x<=170;x+=10)for(let z=-150;z<=110;z+=10){if(!inPoly(x,z,OUTL)||inPoly(x,z,PAS))continue;
      const dp=dPoly(x,z,PAS),dO=dPoly(x,z,OUTL);pts.push({x,z,cl:dp,r:Math.min(dp-1.5,dO+8,75)});}
    let need=pts.filter(p=>p.cl>3);const cs=[];
    while(need.length&&cs.length<60){let best=null,bc=0;for(const c of pts){if(c.r<6)continue;const rr=(c.r+3)*(c.r+3);let k=0;for(const p of need)if((p.x-c.x)*(p.x-c.x)+(p.z-c.z)*(p.z-c.z)<=rr)k++;if(k>bc||(k===bc&&best&&c.r>best.r)){bc=k;best=c;}}
      if(!best)break;cs.push([best.x,best.z,Math.round(best.r)]);const rr=(best.r+3)*(best.r+3);need=need.filter(p=>(p.x-best.x)*(p.x-best.x)+(p.z-best.z)*(p.z-best.z)>rr);}
    return CAVECOL=cs;}
  reg('cave',()=>{const G=g(),R=RNG(77),s=91,lc=limeCol(160,s,0.78),DK=C('#2a2622');
    // rock: interior gets darker with depth
    const B=new VB(lc),inner=(p,n)=>{const c=lc(p,[n[0],Math.min(n[1],0.2),n[2]]),k=cl((p[2]-IBACK[2])/(IN[0][0]-IBACK[2]));return mix(DK,mul(c,0.8),Math.pow(k,1.6));};
    const nz=(x,y,z,a)=>(vn3(x*.05,y*.05,z*.05,s)-.5)*a;
    const IR=IN.map(([z,w,h],k)=>{const r=[];for(let j=0;j<CN;j++){const p=archPt(w,h,j,0.72,0.85,-3);const a=k===0?2:4.5;r.push([p[0]+nz(p[0],p[1],z,a),p[1]+(p[1]>0?nz(p[1],z,p[0],a):0),z+nz(z,p[0],p[1],k===0?1:5)]);}return r;});
    const OR=OUT.map(([z,w,h,zj],k)=>{const r=[];for(let j=0;j<CN;j++){const p=archPt(w,h,j,0.42,0.5,-10);r.push([p[0]*(1+nz(p[0],p[1],z,0.14)),p[1]>0?p[1]*(1+nz(z,p[0],p[1],0.16)):p[1],z+nz(p[1],p[0],z,zj*2.4)]);}return r;});
    // inner tunnel (normals point to the passage axis)
    B.cf=inner;for(let k=0;k<IR.length-1;k++){const A=IR[k],Bq=IR[k+1],ref=[0,(IN[k][2]+IN[k+1][2])*0.25,(IN[k][0]+IN[k+1][0])/2];for(let j=0;j<CN-1;j++)B.q(A[j],A[j+1],Bq[j+1],Bq[j],ref,true);}
    {const A=IR[IR.length-1];for(let j=0;j<CN-1;j++)B.o(A[j],A[j+1],IBACK,[0,15,-25],true);B.o(A[0],A[CN-1],IBACK,[0,15,-25],true);}
    // mouth lip → cliff face → hill → back
    B.cf=lc;const LO=[IR[0],...OR];for(let k=0;k<LO.length-1;k++){const A=LO[k],Bq=LO[k+1];for(let j=0;j<CN-1;j++){const q=[A[j],A[j+1],Bq[j+1],Bq[j]];B.q(q[0],q[1],q[2],q[3],[0,20,k<3?60:0]);}}
    {const A=OR[OR.length-1];for(let j=0;j<CN-1;j++)B.o(A[j],A[j+1],OEND,[0,20,-60]);}
    // floor (y≈0.5–2): strip between left/right walls + apron at the mouth
    const FL=[[106,30],...IN.map(r=>[r[0],r[1]*0.97]),[IBACK[2]+4,10]];const fy=(x,z)=>0.7+vn3(x*.08,z*.08,3,s)*1.4;
    B.cf=(p,n)=>{const k=cl((p[2]-IBACK[2])/(IN[0][0]-IBACK[2])),c=mix(C('#6b655b'),C('#857d70'),vn3(p[0]*.1,p[2]*.1,1,s));return mix(mul(DK,0.85),c,Math.pow(k,1.3));};
    for(let k=0;k<FL.length-1;k++){const [z0,w0]=FL[k],[z1,w1]=FL[k+1],a=[[-w0,fy(-w0,z0),z0],[0,fy(0,z0)+0.4,z0],[w0,fy(w0,z0),z0]],b=[[-w1,fy(-w1,z1),z1],[0,fy(0,z1)+0.4,z1],[w1,fy(w1,z1),z1]];
      for(let j=0;j<2;j++)B.q(a[j],a[j+1],b[j+1],b[j],[0,-20,(z0+z1)/2]);}
    // stalactites (ceiling) + stalagmites (sides, out of the walking line)
    B.cf=(p,n)=>{const k=cl((p[2]-IBACK[2])/(IN[0][0]-IBACK[2]));return mix(DK,mix(C('#a8a090'),C('#8a8274'),hsh(p[0]|0,p[2]|0,1,1)),Math.pow(k,1.4)*0.9);};
    [[1,6,0.45,15,3.2],[1,8,0.5,9,2.2],[2,5,0.4,18,3.6],[2,9,0.45,12,2.8],[3,7,0.3,14,3.4],[3,4,0.5,8,2],[4,8,0.45,11,2.6],[4,6,0.4,7,1.8]].forEach(([k,j,t,l,r],i)=>{
      const a=IR[k][j],b=IR[k+1][j],p=lerp3(a,b,t);spike(B,[p[0]*0.96,p[1]+1,p[2]],[p[0]*0.94+(R()-.5)*2,p[1]-l,p[2]+(R()-.5)*2],r,4,R());});
    [[-46,-6,9,3.4],[44,4,12,4],[30,-32,7,2.6],[-40,24,6,2.4]].forEach(([x,z,h,r])=>spike(B,[x,0,z],[x+(R()-.5)*2,h,z+(R()-.5)*2],r,4,R()));
    // fallen boulders at the mouth
    const BO=[[-50,104,13],[56,108,10],[-33,121,5.5],[40,124,6],[68,98,14],[16,132,3.5]],col=[];
    BO.forEach(([x,z,r],i)=>{const base=mix(LIME[1],LIME[0],hsh(i,2,3,4));B.cf=(p,n)=>mix(mul(base,0.62+0.38*cl(0.5+0.5*n[1])),KGR[0],ss(0.6,0.9,n[1])*0.55);
      blob(B,[x,r*0.45,z],r,[1.15,0.8,1],s+i,0.35);if(r>5)col.push([x,z,Math.round(r*0.95)]);});
    // vegetation: tufts on the cliff top + vines hanging over the mouth
    const V2=new VB(),tp=[];for(let i=0;i<9;i++){const k=i<5?3:4+(i%3),j=1+((i*5+2)%(CN-2)),p=OR[k][j],u=nrm3([p[0],0,p[2]-20]);const r=13+R()*10;tp.push({c:[p[0]-u[0]*r*0.2,p[1]-r*0.15,p[2]-u[2]*r*0.2],r,s:[1.2,0.8,1.2]});}
    tp.push({c:[-70,84,101],r:10,s:[1.2,0.85,1]},{c:[64,104,103],r:11,s:[1.25,0.8,1]},{c:[-118,150,99],r:12,s:[1.2,0.8,1]});tufts(V2,tp,s);
    // vines/roots hanging down the cliff face beside and above the mouth
    for(let i=0;i<8;i++){const j=[3,4,5,9,10,11,6,8][i],q=OR[2][j],top=[q[0]*0.98,q[1]-2,q[2]+2.5],l=30+R()*45,w=1.1+R()*0.8,dx=(R()-.5)*6,bot=[top[0]+dx,Math.max(8,top[1]-l),top[2]+1];
      V2.cf=(p)=>mix(C('#2c4f22'),C('#4f7a30'),hsh(i,p[1]|0,2,1)*0.6);const m=lerp3(top,bot,0.5);m[2]+=1.5;
      V2.t([top[0]-w,top[1],top[2]],[top[0]+w,top[1],top[2]],[m[0]+w*0.7,m[1],m[2]]);V2.t([top[0]-w,top[1],top[2]],[m[0]+w*0.7,m[1],m[2]],[m[0]-w*0.7,m[1],m[2]]);V2.t([m[0]-w*0.7,m[1],m[2]],[m[0]+w*0.7,m[1],m[2]],bot);}
    G.add(B.mesh('sb2Rock',{uv:64}),V2.mesh('sb2Veg'));
    G.userData.colliders=caveColliders().concat(col).map(c=>c.slice());G.userData.mouth=[0,IN[0][0]];G.userData.floorY=1;G.userData.inside=[0,0,46];
    return G;});

  /* ======================================== 3. BAMBOO CLUMP ======================================== */
  const CULM=[C('#6c9a3c'),C('#587f32'),C('#8f9a48'),C('#7aa046')],BLF=[C('#5a8c34'),C('#6e9e3e'),C('#4c7a2e'),C('#a3a44a')];
  reg('bamboo',(seed)=>{seed=+seed||1;const R=RNG(seed*61+3),G=g(),Bc=new VB(),Bl=new VB(),N=10+Math.floor(R()*7),cu=[];
    for(let i=0;i<N;i++){const a=i/N*TAU+(R()-.5)*0.9,d=2+R()*10,young=R()<0.25;cu.push({x:Math.cos(a)*d,z:-Math.sin(a)*d,a:a+(R()-.5)*0.9,h:young?150+R()*40:185+R()*75,r:young?1.7+R()*0.4:2.2+R()*0.8,lean:0.12+R()*0.14+d*0.012,col:CULM[young?3:(R()*3)|0]});}
    let maxD=0;const paths=cu.map((c,i)=>{const ca=Math.cos(c.a),sa=-Math.sin(c.a),h=c.h,off=[0,0.025,0.15,0.4].map(f=>f*c.lean*h);maxD=Math.max(maxD,Math.hypot(c.x,c.z));
      const ys=[-2,0.36*h,0.7*h,0.93*h];const P=ys.map((y,k)=>[c.x+ca*off[k],y,c.z+sa*off[k]]);
      Bc.cf=(p)=>{const t=cl(p[1]/h);return mul(mix(c.col,mix(c.col,C('#9aab52'),0.4),t),0.72+0.28*Math.min(1,(p[1]+2)/30));};
      tube(Bc,P,[c.r,c.r*0.85,c.r*0.6,c.r*0.3],h>205&&Bc.n()<(N-i)*-21+300?4:3,{rot:i,cap1:true});return P;});
    const per=Math.max(4,Math.floor((448-Bc.n())/N));
    paths.forEach((P,i)=>{const c=cu[i],ca=Math.cos(c.a),sa=-Math.sin(c.a),sprays=per>=10?3:2,lp=Math.floor(per/sprays);
      for(let k=0;k<sprays;k++){const t=0.5+0.5*(k+0.5)/sprays+(R()-.5)*0.08,P0=ptsOn(P,t),sd=(k%2?1:-1)*(0.7+R()*0.9),sa2=c.a+sd;
        for(let l=0;l<lp;l++){const fa=sa2+(l/(lp-1||1)-.5)*1.6+(R()-.5)*0.3,L=15+R()*8,dn=0.35+R()*0.5+(l%2)*0.2,d=nrm3([Math.cos(fa),-dn,-Math.sin(fa)]),side=nrm3(crs(d,[0,1,0])),w=1.7+R()*1.0,
            b=[P0[0]+(R()-.5)*3,P0[1]-l*1.2,P0[2]+(R()-.5)*3],m=add3(add3(b,d,L*0.4),side,w),tip=add3(b,d,L),base=BLF[R()<0.07?3:(R()*3)|0];
          Bl.cf=(p)=>mix(mul(base,0.8),mix(base,C('#b3c45c'),0.3),cl(len3(sub3(p,b))/L));Bl.t(b,m,tip);}}});
    G.add(Bc.mesh('sb2Culm'),Bl.mesh('sb2Veg'));G.userData.r=Math.round(Math.max(16,Math.min(24,maxD+10)));return G;});

  /* ======================================== 4. WILD BANANA ======================================== */
  function bananaPlant(B,Bs,R,x,z,sc,nl,seed){const sh=(56+R()*22)*sc,lean=[(R()-.5)*3*sc,(R()-.5)*3*sc],top=[x+lean[0],sh,z+lean[1]],sr=4.6*sc;
    Bs.cf=(p)=>{const t=cl(p[1]/sh),c=mix(C('#5d6a34'),C('#7c8a44'),t);return mul(mix(c,C('#4a3e2a'),ss(.62,.8,vn3(p[0]*.3,p[1]*.12,p[2]*.3,seed))*0.6),0.75+0.25*t);};
    tube(Bs,[[x,-2,z],[x+lean[0]*0.4,sh*0.45,z+lean[1]*0.4],top],[sr*1.15,sr*0.9,sr*0.6],sc>0.7?6:4,{rot:seed});
    const a0=R()*TAU;for(let i=0;i<nl;i++){const a=a0+i/nl*TAU*0.97+(R()-.5)*0.5,L=(62+R()*28)*sc,up=0.85+R()*0.4,dr=i%3===2?1.5:0.72+R()*0.2,ca=Math.cos(a),sa=-Math.sin(a),tear=R(),old=R()<0.25;
      const pt=s=>{const hz=s*L*0.86,y=sh*0.95+L*(up*s-dr*s*s*s);return [top[0]+ca*hz,y,top[2]+sa*hz];};
      const segs=sc>0.7?6:2,s0=0.2,rach=[];for(let k=0;k<=segs;k++)rach.push(pt(s0+(1-s0)*k/segs));const rk=new Set(rach.map(q=>q.map(v=>v.toFixed(3)).join()));
      const base=mix(C('#346a24'),C('#4c8230'),R()),edge=old?C('#9a8442'):mix(base,C('#86b04c'),0.35),mid=C('#b8c070');
      B.cf=(p,n)=>{const d=cl(len3(sub3(p,top))/L);if(rk.has(p.map(v=>v.toFixed(3)).join()))return mix(mid,base,0.35);return mix(mul(base,0.8+0.2*d),edge,ss(0.55,1,d)*(old?0.8:0.3));};
      B.t([top[0]+sa*0.8,top[1]-1,top[2]-ca*0.8],[top[0]-sa*0.8,top[1]-1,top[2]+ca*0.8],rach[0]);// petiole
      for(let k=0;k<segs;k++){const s=s0+(1-s0)*(k+0.5)/segs,w=(10.5+R()*2.5)*sc*Math.pow(Math.sin(PI*Math.min(1,0.1+0.9*(s-s0)/(1-s0))),0.55),a=rach[k],b=rach[k+1],d=nrm3(sub3(b,a)),sd=nrm3(crs(d,[0,1,0]));
        for(const sg of [-1,1]){const gap=(tear+k*0.37+(sg>0?0.5:0))%1<0.55?0.22:0.04,fold=w*0.28;
          const e0=add3(lerp3(a,b,gap*0.5),[sd[0]*w*sg,-fold,sd[2]*w*sg]),e1=add3(lerp3(a,b,1-gap*0.5),[sd[0]*w*sg,-fold-0.6,sd[2]*w*sg]);B.q(a,b,e1,e0,add3(lerp3(a,b,0.5),[0,-30,0]));}}}
    return top;}
  reg('banana',(seed)=>{seed=+seed||1;const R=RNG(seed*67+5),G=g(),B=new VB(),Bs=new VB();
    const top=bananaPlant(B,Bs,R,0,0,1+(R()-.5)*0.2,6,seed);
    // dead leaves hanging down the stem
    for(let i=0;i<2;i++){const a=R()*TAU,ca=Math.cos(a),sa=-Math.sin(a),y0=top[1]*0.9,P=[[ca*3.5,y0,sa*3.5],[ca*7,y0-14,sa*7],[ca*7.5,y0-32,sa*7.5],[ca*6,y0-44,sa*6]],sd=[-sa,0,ca];
      B.cf=(p)=>mix(C('#6a5232'),C('#9a7c4a'),hsh(p[1]|0,i,2,3));for(let k=0;k<3;k++){const w=5-k;B.q(add3(P[k],sd,-w),add3(P[k],sd,w),add3(P[k+1],sd,w-1),add3(P[k+1],sd,-(w-1)),[0,P[k][1],0]);}}
    // hanging flower bud (bắp chuối)
    {const a=R()*TAU,ca=Math.cos(a),sa=-Math.sin(a),p0=[top[0],top[1]-1,top[2]],p1=[top[0]+ca*12,top[1]-6,top[2]+sa*12],p2=[top[0]+ca*16,top[1]-16,top[2]+sa*16];
      Bs.cf=()=>C('#6f7a3a');tube(Bs,[p0,p1,p2],[0.9,0.8,0.7],3,{});
      Bs.cf=(p)=>mix(C('#5a1e2a'),C('#8a3040'),cl((p2[1]-p[1])/10));spike(Bs,[p2[0],p2[1]-1.5,p2[2]],[p2[0]+ca*1.5,p2[1]-13,p2[2]+sa*1.5],3.4,4,a);spike(Bs,[p2[0],p2[1]-1.5,p2[2]],p2,3.4,4,a);}
    // small sucker shoot
    {const a=R()*TAU,d=12+R()*4;bananaPlant(B,Bs,R,Math.cos(a)*d,-Math.sin(a)*d,0.42,3,seed+9);}
    G.add(Bs.mesh('sb2Wood'),B.mesh('sb2Veg'));G.userData.r=7;return G;});

  /* ======================================== 5. COCONUT PALM ======================================== */
  reg('palm',(seed)=>{seed=+seed||1;const R=RNG(seed*71+9),G=g(),Bt=new VB(),Bw=new VB(),Bf=new VB(),H=160+R()*60,la=R()*TAU,ln=0.22+R()*0.14,ca=Math.cos(la),sa=-Math.sin(la);
    const P=[];for(let k=0;k<=6;k++){const t=k/6,off=H*ln*Math.pow(t,1.7)-H*0.04*Math.sin(t*PI);P.push([ca*off,k===0?-3:t*H*0.97,sa*off]);}
    Bt.cf=(p)=>{const t=cl(p[1]/H);return mul(mix(C('#8c8070'),C('#6e6456'),vn3(p[0]*.2,p[1]*.05,p[2]*.2,seed)),0.8+0.2*t);};
    tube(Bt,P,[5.8,4.4,3.9,3.6,3.3,3.1,3.0],6,{rot:seed,jit:0.08,seed});
    const top=P[6];Bw.cf=(p,n)=>mix(C('#6a5a3c'),C('#8a7a4a'),cl(0.5+0.5*n[1]));blob(Bw,[top[0],top[1]+1,top[2]],5.2,[1,1.1,1],seed,0.25);
    const nc=3+(R()<0.5?1:0);for(let i=0;i<nc;i++){const a=i/nc*TAU+R(),c=[top[0]+Math.cos(a)*4.4,top[1]-2.6+R()*1.4,top[2]-Math.sin(a)*4.4],cc=R()<0.65?C('#647e2c'):C('#86683a');
      Bw.cf=(p,n)=>mul(cc,0.7+0.3*cl(0.5+0.5*n[1]));blob(Bw,c,2.7,[1,1.12,1],seed*5+i,0.12);}
    const nf=11;for(let i=0;i<nf;i++){const dead=i>=nf-2,a=i/nf*TAU*1.0+(R()-.5)*0.4,L=dead?40+R()*10:58+R()*22,up=dead?-0.9:0.35+R()*0.55+(i%3===0?0.3:0),c0=Math.cos(a),s0=-Math.sin(a);
      const Rp=[];for(let k=0;k<=6;k++){const s=k/6,hz=L*s*(dead?0.35:0.92),y=top[1]+1+L*(up*s-(dead?0.2:0.62)*s*s);Rp.push([top[0]+c0*hz,y,top[2]+s0*hz]);}
      const base=dead?C('#8a6e40'):mix(C('#5a8a34'),C('#7a9a3e'),R());Bf.cf=(p)=>{const d=cl(len3(sub3(p,top))/L);return mix(mul(base,0.85),dead?C('#a48a56'):mix(base,C('#b0b860'),0.35),d);};
      frond(Bf,Rp,s=>(dead?7:19)*Math.sin(PI*Math.min(1,0.12+s*0.9)),dead?0.5:0.85,0.75,0.55);}
    G.add(Bt.mesh('sb2Palm'),Bw.mesh('sb2Wood'),Bf.mesh('sb2Veg'));G.userData.r=5;return G;});

  /* ======================================== 6. BANYAN (cây đa) ======================================== */
  reg('banyan',(seed)=>{seed=+seed||1;const R=RNG(seed*73+11),G=g(),Bw=new VB(),Bc=new VB(),H=300+R()*80,TH=H*0.36,s=seed*7;
    const bark=(p,n)=>{let c=mix(C('#7a7064'),C('#5e574d'),vn3(p[0]*.06,p[1]*.03,p[2]*.06,s));c=mix(c,C('#9c9486'),ss(.6,.85,vn3(p[0]*.12,p[1]*.02,p[2]*.12,s+1))*0.6);
      c=mix(c,C('#56603a'),cl(1-p[1]/30)*0.35);return mul(c,0.72+0.28*cl(0.5+0.5*n[1]+0.3));};
    Bw.cf=bark;
    // fluted main trunk (fused stems)
    tube(Bw,[[0,-6,0],[0,10,0],[1,TH*0.35,1],[-1,TH*0.7,0],[0,TH,-1]],[30,24,20,18,17],9,{jit:0.32,seed:s,rot:0.3});
    // buttress / fused prop roots around the trunk
    for(let i=0;i<6;i++){const a=i/6*TAU+R()*0.5,c=Math.cos(a),sn=-Math.sin(a),r0=14,y0=30+R()*35,r1=30+R()*10;tube(Bw,[[c*r0,y0,sn*r0],[c*(r0+8),y0*0.45,sn*(r0+8)],[c*r1,-3,sn*r1]],[4.5,5.2,6.5],5,{rot:i});}
    // canopy blobs: outer ring + inner ring + top
    const BL=[],no=9;for(let i=0;i<no;i++){const a=i/no*TAU+(R()-.5)*0.3,d=105+R()*20,r=52+R()*14;BL.push({c:[Math.cos(a)*d,H*0.69+(R()-.5)*H*0.06,-Math.sin(a)*d],r,a,d,sy:0.52});}
    for(let i=0;i<5;i++){const a=i/5*TAU+0.3+(R()-.5)*0.4,d=45+R()*22,r=58+R()*12;BL.push({c:[Math.cos(a)*d,H*0.8+(R()-.5)*H*0.05,-Math.sin(a)*d],r,a,d,sy:0.55});}
    BL.push({c:[(R()-.5)*20,H-30,(R()-.5)*20],r:55,a:0,d:0,sy:0.55},{c:[30+(R()-.5)*10,H*0.9,-20],r:48,a:0,d:0,sy:0.55});
    // major limbs to the outer blobs (+ thin sub-branches)
    const limbs=[];BL.slice(0,no).forEach((b,i)=>{const p0=[Math.cos(b.a)*8,TH*(0.85+R()*0.15),-Math.sin(b.a)*8],p2=[b.c[0]*0.82,b.c[1]-b.r*b.sy*0.55,b.c[2]*0.82],p1=[lerp3(p0,p2,0.5)[0],lerp3(p0,p2,0.5)[1]+12,lerp3(p0,p2,0.5)[2]];
      tube(Bw,[p0,p1,p2],[9,6,3.2],6,{rot:i});limbs.push([p0,p1,p2]);});
    BL.slice(no,no+5).forEach((b,i)=>{const p0=[0,TH*0.95,0],p1=[b.c[0]*0.85,b.c[1]-b.r*0.4,b.c[2]*0.85];tube(Bw,[p0,p1],[7,3],5,{rot:i});});
    // pillar roots (aerial roots that reached the ground and thickened)
    const pil=[];for(let i=0;i<4;i++){const L=limbs[(i*2+1)%limbs.length],tp=ptsOn(L,0.62+R()*0.15),x=tp[0]+(R()-.5)*6,z=tp[2]+(R()-.5)*6;
      Bw.cf=(p,n)=>mul(bark(p,n),1.08);tube(Bw,[[x,-3,z],[x+(R()-.5)*3,tp[1]*0.5,z+(R()-.5)*3],tp],[4.2,3.2,2.8],5,{jit:0.2,seed:s+i,rot:i});pil.push([x,z]);}
    // hanging aerial root curtains
    Bw.cf=(p,n)=>mix(C('#6a503c'),C('#8a7058'),hsh(p[0]|0,p[2]|0,s,5));
    for(let i=0;i<30;i++){const L=limbs[i%limbs.length],tp=ptsOn(L,0.35+R()*0.6),x=tp[0]+(R()-.5)*8,z=tp[2]+(R()-.5)*8,y1=Math.max(4,tp[1]-(40+R()*(tp[1]-30))),r=0.6+R()*0.7,a=R()*TAU;
      const top=[x,tp[1]-2,z],bot=[x+(R()-.5)*4,y1,z+(R()-.5)*4];const d=nrm3(sub3(bot,top)),u=nrm3(crs(d,[Math.cos(a),0,Math.sin(a)])),v=crs(d,u),rim=[0,1,2].map(k=>{const t=k/3*TAU;return add3(top,add3(mul(u,Math.cos(t)*r),mul(v,Math.sin(t)*r)));});
      for(let k=0;k<3;k++)Bw.o(rim[k],rim[(k+1)%3],bot,lerp3(top,bot,0.3));}
    // canopy colour: darker underneath / inside, sunlit top, per-blob hue shift
    const CG=[C('#3c6a2c'),C('#4a7a32'),C('#335e28'),C('#577f36')];
    BL.forEach((b,i)=>{const base=jitc(CG[i%4],s+i,0.16),cy=b.c[1];Bc.cf=(p,n)=>{const hi=cl((p[1]-(H*0.62))/(H*0.38));return mul(mix(mul(base,0.5),mix(base,C('#7a9a44'),0.25),hi),0.7+0.3*cl(0.5+0.5*n[1]));};
      const ge=new T.DodecahedronGeometry(b.r,0);const q=ge.attributes.position,Rr=RNG(s+i*13),mp={};
      for(let v=0;v<q.count;v+=3){const f=w=>{const k=Math.round(q.getX(w))+'_'+Math.round(q.getY(w))+'_'+Math.round(q.getZ(w));if(!mp[k])mp[k]=1+(Rr()-.5)*0.4;return [b.c[0]+q.getX(w)*mp[k]*1.1,b.c[1]+q.getY(w)*mp[k]*b.sy,b.c[2]+q.getZ(w)*mp[k]*1.1];};Bc.t(f(v),f(v+1),f(v+2));}ge.dispose();});
    G.add(Bw.mesh('sb2Wood'),Bc.mesh('sb2Veg'));G.userData.r=40;G.userData.colliders=[[0,0,40],...pil.map(([x,z])=>[+x.toFixed(1),+z.toFixed(1),6])];return G;});

  /* ======================================== 7. FERN ======================================== */
  reg('fern',(seed)=>{seed=+seed||1;const R=RNG(seed*79+13),G=g(),B=new VB(),nf=6+(R()<0.5?1:0),Hh=18+R()*12,a0=R()*TAU;
    for(let i=0;i<nf;i++){const a=a0+i/nf*TAU+(R()-.5)*0.5,L=Hh/0.53*(0.75+R()*0.3),ca=Math.cos(a),sa=-Math.sin(a),up=1.1+R()*0.4,Rp=[];
      for(let k=0;k<=6;k++){const s=k/6,hz=L*0.55*s+1,y=L*(up*s-0.85*s*s)*0.85;Rp.push([ca*hz,Math.max(0.3,y),sa*hz]);}
      const base=mix(C('#3a6626'),C('#4a7a30'),R());B.cf=(p)=>mix(mul(base,0.8),C('#7aa848'),cl(Math.hypot(p[0],p[2])/(L*0.6)));frond(B,Rp,s=>L*0.16*Math.pow(1-s*0.85,0.8)*Math.min(1,s*4+0.35),0.25,0.6,0.42);}
    G.add(B.mesh('sb2Veg'));return G;});

  /* ======================================== 8. LOTUS PATCH ======================================== */
  reg('lotus',(seed)=>{seed=+seed||1;const R=RNG(seed*83+17),G=g(),B=new VB(),np=4+Math.floor(R()*4),pads=[];
    for(let i=0;i<np;i++){let x,z,r,ok=false;for(let t=0;t<20&&!ok;t++){const a=R()*TAU,d=i===0?0:8+R()*22;x=Math.cos(a)*d;z=-Math.sin(a)*d;r=6+R()*8;ok=pads.every(p=>Math.hypot(p[0]-x,p[1]-z)>p[2]+r*0.7);}
      pads.push([x,z,r]);const notch=R()*TAU,base=mix(C('#3d7a30'),C('#5a8e3a'),R()),y0=0.12+i*0.03;
      B.cf=(p)=>{const d=Math.hypot(p[0]-x,p[2]-z)/r;return mix(mix(base,C('#7aa448'),0.35),mul(base,0.85),d);};
      const c=[x,y0+0.12,z],rim=[];for(let k=0;k<=8;k++){const a=notch+0.14+k/8*(TAU-0.28),rr=r*(1+(hsh(i,k,seed,1)-.5)*0.1);rim.push([x+Math.cos(a)*rr,y0+0.3+(hsh(k,i,seed,2))*0.08,z-Math.sin(a)*rr]);}
      for(let k=0;k<8;k++)B.o(rim[k],rim[k+1],c,[x,-5,z]);}
    const stalk=(b,t,r)=>{B.cf=()=>C('#5a7a34');const d=nrm3(sub3(t,b)),u=nrm3(crs(d,[1,0,0])),v=crs(d,u),rb=[0,1,2].map(k=>add3(b,add3(mul(u,Math.cos(k/3*TAU)*r),mul(v,Math.sin(k/3*TAU)*r)))),rt=rb.map(p=>add3(p,sub3(t,b)));
      for(let k=0;k<3;k++)B.q(rb[k],rb[(k+1)%3],rt[(k+1)%3],rt[k],lerp3(b,t,0.5));};
    // flower
    const fa=R()*TAU,fd=6+R()*8,fx=Math.cos(fa)*fd,fz=-Math.sin(fa)*fd,fh=14+R()*8,Fc=[fx,fh,fz];stalk([fx-1,0,fz+0.5],Fc,0.45);
    const petal=(n,len,up,out,w,rot,tilt)=>{for(let k=0;k<n;k++){const a=rot+k/n*TAU,d=[Math.cos(a),0,-Math.sin(a)],sd=[-d[2],0,d[0]],b=add3(Fc,d,out),tip=add3(add3(Fc,d,out+len*tilt),[0,len*up,0]),mid=add3(add3(Fc,d,out+len*tilt*0.6+1.2),[0,len*up*0.45,0]);
        B.cf=(p)=>mix(C('#f4d4de'),C('#d8507e'),cl((p[1]-fh)/(len*up)));B.t(b,add3(mid,sd,w),tip);B.t(b,tip,add3(mid,sd,-w));}};
    petal(5,7,0.75,0.6,2.6,R(),0.75);petal(4,6,0.95,0.3,2.0,R()+0.4,0.4);
    B.cf=(p,n)=>n[1]>0.5?C('#c8c25a'):C('#d8b850');{const ring=[0,1,2,3,4].map(k=>[fx+Math.cos(k/5*TAU)*1.6,fh+2.6,fz-Math.sin(k/5*TAU)*1.6]),ct=[fx,fh+2.9,fz];for(let k=0;k<5;k++){const a=ring[k],b=ring[(k+1)%5];B.o(a,b,ct,[fx,fh,fz]);B.q([a[0],fh+0.5,a[2]],[b[0],fh+0.5,b[2]],b,a,[fx,fh+1.5,fz]);}}
    // second: bud on a stalk
    {const a=fa+2+R()*2,d=8+R()*10,x=Math.cos(a)*d,z=-Math.sin(a)*d,h=11+R()*6,b0=[x,h,z];stalk([x+0.5,0,z-0.5],b0,0.4);
      B.cf=(p)=>mix(C('#e48aa6'),C('#c8406e'),cl((p[1]-h)/7));const S=[[x,h-0.5,z],[x+0.4,h+7.5,z]],u=[1,0,0],v=[0,0,1],rim=[0,1,2,3].map(k=>[x+Math.cos(k/4*TAU+0.4)*2.2,h+3,z-Math.sin(k/4*TAU+0.4)*2.2]);
      for(let k=0;k<4;k++){B.o(rim[k],rim[(k+1)%4],S[1],[x,h+3,z]);B.o(rim[k],rim[(k+1)%4],S[0],[x,h+3,z]);}}
    // one leaf raised above the water
    {const a=fa+PI+(R()-.5),d=5+R()*6,x=Math.cos(a)*d,z=-Math.sin(a)*d,h=10+R()*6,r=7+R()*3;stalk([x,0,z],[x,h,z],0.4);const base=C('#4f8a36');B.cf=(p)=>mix(mix(base,C('#86ae50'),0.3),mul(base,0.8),Math.hypot(p[0]-x,p[2]-z)/r);
      const rim=[];for(let k=0;k<8;k++){const t=k/8*TAU;rim.push([x+Math.cos(t)*r,h+2.6+Math.sin(t*2+1)*0.6,z-Math.sin(t)*r]);}for(let k=0;k<8;k++)B.o(rim[k],rim[(k+1)%8],[x,h+0.3,z],[x,h-10,z]);}
    G.add(B.mesh('sb2Veg',{noShadow:false}));G.userData.r=0;return G;});

  /* ======================================== 9. TALL GRASS (cỏ tranh) ======================================== */
  const bladeV=(B,x,z,h,w,lx,lz,a,y0)=>{const c=Math.cos(a)*w/2,s=Math.sin(a)*w/2,b1=[x-c,y0,z+s],b2=[x+c,y0,z-s],tp=[x+lx,y0+h,z+lz],mx=x+lx*0.32,mz=z+lz*0.32,my=y0+h*0.55,m1=[mx-c*0.6,my,mz+s*0.6],m2=[mx+c*0.6,my,mz-s*0.6];
    B.q(b1,b2,m2,m1,[x,y0-50,z]);B.t(m1,m2,tp);};
  reg('tallgrass',(seed)=>{seed=+seed||1;const R=RNG(seed*89+19),G=g(),B=new VB(),Hh=26+R()*14,nb=14;
    for(let i=0;i<nb;i++){const a=R()*TAU,d=R()*4.5,x=Math.cos(a)*d,z=-Math.sin(a)*d,h=Hh*(0.55+R()*0.4),la=a+(R()-.5)*0.8,ln=h*(0.12+R()*0.28),base=mix(C('#5d7f30'),C('#7e9a3e'),R());
      B.cf=(p)=>{const t=cl(p[1]/h);return mix(mul(base,0.6),mix(base,C('#c2b46a'),0.55),t*t);};bladeV(B,x,z,h,1.2+R()*0.5,Math.cos(la)*ln,-Math.sin(la)*ln,R()*PI,-0.5);}
    const np=3+(R()<0.6?1:0);for(let i=0;i<np;i++){const a=i/np*TAU+R(),d=R()*3,x=Math.cos(a)*d,z=-Math.sin(a)*d,lx=Math.cos(a)*(2+R()*3),lz=-Math.sin(a)*(2+R()*3),h=Hh*(0.9+R()*0.14),pl=10+R()*5;
      B.cf=()=>C('#8a9a50');B.t([x-0.35,-0.5,z],[x+0.35,-0.5,z],[x+lx*0.75,h-pl,z+lz*0.75]);
      B.cf=(p)=>mix(C('#bdb49c'),C('#f4f1ea'),cl((p[1]-(h-pl))/pl));const b=[x+lx*0.75,h-pl,z+lz*0.75],t=[x+lx*1.25+(R()-.5)*2,h+0.5,z+lz*1.25+(R()-.5)*2],m=lerp3(b,t,0.4);
      for(let k=0;k<2;k++){const q=a+k*PI/2,dx=Math.cos(q)*0.75,dz=-Math.sin(q)*0.75;B.t(b,[m[0]+dx,m[1],m[2]+dz],t);B.t(b,t,[m[0]-dx,m[1],m[2]-dz]);}}
    G.add(B.mesh('sb2Veg'));return G;});

  /* ======================================== 10. GRASS CLUMP (first-person ground cover) ======================================== */
  const GB=[C('#26421a'),C('#46702a'),C('#9cb44a'),C('#b0b85a')];
  reg('grassClump',(seed)=>{seed=+seed||1;const R=RNG(seed*97+23),nb=10+Math.floor(R()*4),P=[],Cc=[],N=[];
    for(let i=0;i<nb;i++){const a=R()*TAU,d=R()*3.2,x=Math.cos(a)*d,z=-Math.sin(a)*d,h=7+R()*7,la=a+(R()-.5)*0.9,ln=h*(0.15+R()*0.35),lx=Math.cos(la)*ln,lz=-Math.sin(la)*ln,fa=la+PI/2+(R()-.5)*0.6,w=(0.7+R()*0.45),
        c=Math.cos(fa)*w/2,s=-Math.sin(fa)*w/2,mx=x+lx*0.3,mz=z+lz*0.3,my=h*0.5,b1=[x-c,-0.5,z-s],b2=[x+c,-0.5,z+s],m1=[mx-c*0.6,my,mz-s*0.6],m2=[mx+c*0.6,my,mz+s*0.6],tp=[x+lx,h,z+lz],tip=mix(GB[2],GB[3],R());
      const nn=nrm3([Math.cos(la)*0.35,1,-Math.sin(la)*0.35]),col=y=>{const t=cl((y+0.5)/(h+0.5));return t<0.5?mix(GB[0],GB[1],t*2):mix(GB[1],tip,(t-0.5)*2);};
      [[b1,b2,m2],[b1,m2,m1],[m1,m2,tp]].forEach(tr=>tr.forEach(v=>{P.push(v[0],v[1],v[2]);const k=col(v[1]);Cc.push(k[0],k[1],k[2]);N.push(nn[0],nn[1],nn[2]);}));}
    const ge=new T.BufferGeometry();ge.setAttribute('position',new T.Float32BufferAttribute(P,3));ge.setAttribute('color',new T.Float32BufferAttribute(Cc,3));
    const ms=K.mesh(ge,MT.sb2Grass,{noShadow:true});ms.geometry.setAttribute('normal',new T.Float32BufferAttribute(N,3));ms.name='sb2Grass';return g(ms);});

  /* ======================================== 11. PATH STONES ======================================== */
  reg('pathStone',(seed)=>{seed=+seed||1;const R=RNG(seed*101+29),G=g(),B=new VB(),ns=R()<0.6?2:1,ST=[C('#8f897e'),C('#a19b90'),C('#857a6a'),C('#7c7a74'),C('#978c78')];
    for(let i=0;i<ns;i++){const big=i===0,D=big?(ns===1?10+R()*4:9+R()*4):5.5+R()*2.5,r=D/2,n=big?(ns===1?6:5):4,a=R()*TAU,d=i===0?0:r+6+R()*3,x=Math.cos(a)*d,z=-Math.sin(a)*d,el=0.62+R()*0.35,rot=R()*TAU,
        th=big?0.9+R()*0.6:0.8+R()*0.4,base=ST[(R()*5)|0],c=[x+(R()-.5)*r*0.3,th+0.3,z+(R()-.5)*r*0.3],top=[],mid=[],bot=[];
      for(let k=0;k<n;k++){const t=(k+(R()-.5)*0.6)/n*TAU,rr=r*(0.72+R()*0.5),px=Math.cos(t)*rr,pz=Math.sin(t)*rr*el,X=x+px*Math.cos(rot)-pz*Math.sin(rot),Z=z+px*Math.sin(rot)+pz*Math.cos(rot);
        mid.push([X,th*0.45+(R()-.5)*0.2,Z]);top.push([x+(X-x)*0.72,th+(R()-.5)*0.3,z+(Z-z)*0.72]);bot.push([x+(X-x)*1.04,-1.2,z+(Z-z)*1.04]);}
      B.cf=(p,nn)=>{let k=mix(base,mix(base,C('#c4c0b4'),0.45),vn3(p[0]*.6,p[2]*.6,i,seed));if(nn[1]<0.75)k=mul(k,0.78);if(nn[1]<0.3)k=mul(k,0.85);return mix(k,C('#7d8a4a'),ss(0.7,0.9,vn3(p[0]*.4,p[2]*.4,i+5,seed))*0.55);};
      for(let k=0;k<n;k++){const k1=(k+1)%n;if(big){B.o(top[k],top[k1],c,[x,-5,z]);B.q(top[k],top[k1],mid[k1],mid[k],[x,-3,z]);}else B.o(mid[k],mid[k1],c,[x,-5,z]);B.q(mid[k],mid[k1],bot[k1],bot[k],[x,0,z]);}}
    G.add(B.mesh('sb2Rock',{noShadow:true}));return G;});

  /* ======================================== 12. FIRST-PERSON ARM ======================================== */
  // smooth indexed tube (shared ring vertices → smooth normals); colour by cf(p)
  function stube(P,r,n,cf,o){o=o||{};const pos=[],col=[],idx=[],L=P.length;let nr=null;
    for(let i=0;i<L;i++){const p=P[i],d=nrm3(sub3(P[Math.min(L-1,i+1)],P[Math.max(0,i-1)]));if(!nr){const h=o.ref||[0,1,0];const k=h[0]*d[0]+h[1]*d[1]+h[2]*d[2];nr=nrm3([h[0]-d[0]*k,h[1]-d[1]*k,h[2]-d[2]*k]);}
      else{const k=nr[0]*d[0]+nr[1]*d[1]+nr[2]*d[2];nr=nrm3([nr[0]-d[0]*k,nr[1]-d[1]*k,nr[2]-d[2]*k]);}
      const bn=crs(d,nr),ri=r[i],ra=Array.isArray(ri)?ri[0]:ri,rb=Array.isArray(ri)?ri[1]:ri;
      for(let j=0;j<n;j++){const t=j/n*TAU,v=[p[0]+nr[0]*Math.cos(t)*ra+bn[0]*Math.sin(t)*rb,p[1]+nr[1]*Math.cos(t)*ra+bn[1]*Math.sin(t)*rb,p[2]+nr[2]*Math.cos(t)*ra+bn[2]*Math.sin(t)*rb];pos.push(...v);col.push(...cf(v));}}
    const F=[];for(let i=0;i<L-1;i++){const ref=lerp3(P[i],P[i+1],0.5);for(let j=0;j<n;j++){const a=i*n+j,b=i*n+(j+1)%n,c=(i+1)*n+(j+1)%n,e=(i+1)*n+j;F.push([a,b,c,ref],[a,c,e,ref]);}}
    const cap=(i,tip,ref)=>{const ci=pos.length/3;pos.push(...tip);col.push(...cf(tip));for(let j=0;j<n;j++)F.push([i*n+j,i*n+(j+1)%n,ci,ref]);};
    if(o.cap1)cap(L-1,o.cap1,lerp3(P[L-1],P[L-2],0.5));if(o.cap0)cap(0,o.cap0,lerp3(P[0],P[1],0.5));
    const vp=k=>[pos[k*3],pos[k*3+1],pos[k*3+2]];
    F.forEach(([a,b,c,ref])=>{const A=vp(a),Bv=vp(b),Cv=vp(c),nn=crs(sub3(Bv,A),sub3(Cv,A)),m=sub3([(A[0]+Bv[0]+Cv[0])/3,(A[1]+Bv[1]+Cv[1])/3,(A[2]+Bv[2]+Cv[2])/3],ref);
      if(nn[0]*m[0]+nn[1]*m[1]+nn[2]*m[2]>=0)idx.push(a,b,c);else idx.push(a,c,b);});
    const ge=new T.BufferGeometry();ge.setAttribute('position',new T.Float32BufferAttribute(pos,3));ge.setAttribute('color',new T.Float32BufferAttribute(col,3));ge.setIndex(idx);
    ge.computeVertexNormals();const ms=new T.Mesh(ge,MT.sb2Skin);ms.castShadow=false;ms.receiveShadow=true;return ms;}
  reg('fpArm',()=>{const G=g(),A=new T.Group(),SK=C('#b98060'),SKD=C('#8e5c42'),SKR=C('#b26a54'),LE=C('#5a3a20'),LE2=C('#7a5232');
    A.rotation.set(0.3,0.13,0);G.add(A);
    const skin=(p)=>mul(mix(SK,SKD,cl(0.45-p[1]*0.16)),0.9+(hsh(p[0]*4|0,p[1]*4|0,p[2]*4|0,3)-.5)*0.08);
    // forearm (forearm frame: elbow at origin, forearm along -Z, wrist at z=-21.5)
    A.add(stube([[0,0,2],[0,0.2,-6],[0,0,-15],[0,0,-21.5]],[[3.5,3.3],[3.6,3.35],[2.6,2.75],[2.0,2.5]],7,skin,{cap0:[0,0,3.6]}));
    // leather wrap at the wrist (two bands)
    A.add(stube([[0,0,-15.4],[0,0,-18.3],[0,0,-21.1]],[[2.85,3.0],[2.5,2.85],[2.3,2.75]],7,p=>{const b=hsh(Math.round(p[2]*0.9),1,2,3)<0.5?LE:LE2;return mul(b,0.8+0.2*cl(0.5+p[1]*0.3));}));
    // fist (fist frame: handle axis +Y through the origin, wrist towards +Z, back of the hand on +X, fingers wrap round -Z → -X)
    const F=new T.Group();F.rotation.x=-0.5;const wr=[1.6,0,6.4];{const w=V(...wr).applyEuler(new T.Euler(-0.5,0,0));F.position.set(-w.x,-w.y,-21.3-w.z);}A.add(F);
    const hand=(p)=>mix(skin(p),SKR,ss(2.0,3.6,p[0])*0.4);
    F.add(stube([[1.6,0,6.4],[2.3,0,3.2],[2.7,0,0.6],[2.6,0,-0.9]],[[1.75,2.5],[1.75,3.5],[1.6,3.8],[1.3,3.6]],6,hand,{ref:[1,0,0]}));
    [[2.55,0.95,1.0],[0.85,1.0,1.04],[-0.85,0.95,1.0],[-2.45,0.8,0.9]].forEach(([y,r,s])=>{const k=[2.4,y,-1.1],m=[0.35*s,y,-2.05*s],e=[-1.85*s,y,-0.7*s],t=[-1.55*s,y,0.9*s];
      F.add(stube([k,m,e],[r,r*0.95,r*0.86],4,hand,{ref:[0,1,0],cap1:t}));});
    // thumb wraps over the index finger
    F.add(stube([[0.2,2.4,3.6],[-2.0,3.3,1.4],[-2.3,3.6,-0.8]],[[1.45,1.25],[1.1,1.0],[0.95,0.9]],4,hand,{ref:[1,0,0],cap1:[-1.2,3.6,-2.3]}));
    const grip=new T.Object3D();grip.name='grip';grip.rotation.set(0,-2.3,0);F.add(grip);G.userData.grip=grip;G.userData.cam=[9,-11,-14];return G;});

  M.list.extra=extra;
  M.meta.extra={karst:{heights:[220,340,480],sink:10},cave:{mouthZ:IN[0][0],width:70,height:55,depth:140},grassMat:'sb2Grass'};}
