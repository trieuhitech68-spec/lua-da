/* ===================== SB MODELS 6c — realistic fauna + humans (Lửa Đá) =====================
   Call SBmodels6cInit() AFTER every other model module (models, human/K3char2Init, models3, models4a, models4b, models5).
   REPLACES
     • SBM.animal(kind) for every 4a kind (rabbit deer doe boar wolf bear bird tiger gaur monkey crocodile snake junglefowl frog carp catfish
       snakehead fish butterfly chicken chick pig piglet dog puppy goat), SBM.fish(v), SBM.butterfly(seed), SBM.insect(kind).  Old: SBM.animal6cPrev.
     • K3.char2(look) (player + SBM.villager, which calls K3.char2 at run time). Old builder kept as K3.char2Old.
   SAME CONTRACTS as models4a / human.js: identical rig objects, pivot positions, names & sign conventions (rotation on pivots), +Z front, feet y=0,
   userData {len,h,r,kind,rig,pose,poses}, deterministic, fresh geometry per call. K3.char2Pose / char2Equip / char2Neutral (human.js) work unchanged
   because the new human uses the very same skeleton (bones, joint positions, dims) — only the meshes parented to the bones are new.
   LOOK: smooth spline lofts (Catmull-Rom rings, more segments), per-species procedural canvas ATLAS (colour painted per texel from the species
   colouring functions + stripes/bands painted in surface space + strand/scale/scute/feather micro-detail) with a matching generated normal map,
   MeshPhysicalMaterial (fur sheen, wet clear-coated noses/eyes with a procedural environment cube for catch-lights), real iris/pupil eyes with lids.
   Humans: sculpted head (brow ridge, sockets, nose bridge, cheekbones, lips, chin, ears) with glossy eyes, card hair/brows/beard (alpha strands),
   textured skin (pores/creases normal map) and clothing (hide / woven fibre normal maps, stitched hems, fringes), 4-finger fists and toed feet.
   Textures & materials are cached and shared (≤6 materials per model). Colour textures stay in the game's convention (hex values = linear).
*/
function SBmodels6cInit(){const M=window.SBM,K=(typeof K3!=='undefined')?K3:window.K3;if(!K||!K.T)return;if(window.__sb6c)return;window.__sb6c=1;
  const T=K.T,PI=Math.PI,TAU=PI*2;
  /* ---------------- maths ---------------- */
  const hsh=(a,b,c,d)=>{let h=(Math.imul(a|0,0x27d4eb2d)^Math.imul(b|0,0x165667b1)^Math.imul(c|0,0x5bd1e995)^Math.imul((d|0)+7,0x85ebca77))>>>0;h=Math.imul(h^(h>>>15),0x2c1b3c6d);h=Math.imul(h^(h>>>12),0x297a2d39);return ((h^(h>>>15))>>>0)/4294967296;};
  const sm=t=>t*t*(3-2*t),cl=t=>t<0?0:t>1?1:t,ss=(a,b,x)=>sm(cl((x-a)/(b-a)));
  const vn3=(x,y,z,s)=>{const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),fx=sm(x-xi),fy=sm(y-yi),fz=sm(z-zi);let r=0;
    for(let k=0;k<8;k++){const dx=k&1,dy=(k>>1)&1,dz=(k>>2)&1;r+=hsh(xi+dx,yi+dy,zi+dz,s)*(dx?fx:1-fx)*(dy?fy:1-fy)*(dz?fz:1-fz);}return r;};
  const vn2=(x,y,s)=>vn3(x,y,0.5,s);
  const RNG=s=>{let a=(s*2654435761)>>>0||1;return ()=>{a^=a<<13;a>>>=0;a^=a>>>17;a^=a<<5;a>>>=0;return a/4294967296;};};
  const CCH={},C=h=>{if(CCH[h])return CCH[h];const c=new T.Color(h);return CCH[h]=[c.r,c.g,c.b];};
  const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],mul=(a,f)=>[a[0]*f,a[1]*f,a[2]*f];
  const add3=(a,b,k)=>{k=k===undefined?1:k;return [a[0]+b[0]*k,a[1]+b[1]*k,a[2]+b[2]*k];},sub3=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
  const len3=a=>Math.hypot(a[0],a[1],a[2]),nrm3=a=>{const l=len3(a)||1;return [a[0]/l,a[1]/l,a[2]/l];},crs=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const lerp3=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],mx=p=>[-p[0],p[1],p[2]];
  const fur=(c,p,amt,f,s)=>mul(c,1+(vn3(p[0]*(f||0.5),p[1]*(f||0.5),p[2]*(f||0.5),s||1)-0.5)*(amt===undefined?0.16:amt));
  const mkCanvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};

  /* =============================== MICRO-DETAIL TILES (256², tileable) ===============================
     each tile: {h: Float32Array height 0..1, a: albedo multiplier, n: Uint8 normal rgb}. Generated once, deterministic. */
  const TS=256,TILES={};
  // periodic value noise over the tile: f cells across (integer) → seamless
  const pn=(x,y,f,s)=>{const X=x/TS*f,Y=y/TS*f,xi=Math.floor(X),yi=Math.floor(Y),fx=sm(X-xi),fy=sm(Y-yi),w=(i)=>((i%f)+f)%f;
    const a=hsh(w(xi),w(yi),s,0),b=hsh(w(xi+1),w(yi),s,0),c=hsh(w(xi),w(yi+1),s,0),d=hsh(w(xi+1),w(yi+1),s,0);return a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy;};
  function tileNormals(H,k){const n=new Uint8Array(TS*TS*3),w=i=>((i%TS)+TS)%TS;for(let y=0;y<TS;y++)for(let x=0;x<TS;x++){const hx=H[y*TS+w(x+1)]-H[y*TS+w(x-1)],hy=H[w(y+1)*TS+x]-H[w(y-1)*TS+x];
      let nx=-hx*k,ny=-hy*k,nz=1;const l=Math.hypot(nx,ny,nz);nx/=l;ny/=l;nz/=l;const o=(y*TS+x)*3;n[o]=Math.round((nx*0.5+0.5)*255);n[o+1]=Math.round((ny*0.5+0.5)*255);n[o+2]=Math.round((nz*0.5+0.5)*255);}return n;}
  // anisotropic strands running along +Y (texture v = along the body / down the limb)
  function strandTile(seed,o){const H=new Float32Array(TS*TS).fill(0.5),A=new Float32Array(TS*TS).fill(1),R=RNG(seed);o=o||{};const N=o.n||7000,L0=o.len||9,L1=o.len2||16,amp=o.amp||0.22;
    for(let k=0;k<N;k++){const x0=R()*TS,y0=R()*TS,L=L0+R()*(L1-L0),a=(R()-0.5)*(o.jit||0.35),dx=Math.sin(a),dy=Math.cos(a),v=(R()<0.5?-1:1)*amp*(0.4+R()*0.6),wd=o.wd||1;
      for(let t=0;t<L;t+=0.7){const f=t/L,tp=Math.sin(f*PI),x=Math.round(x0+dx*t),y=Math.round(y0+dy*t);for(let q=0;q<wd;q++){const xx=((x+q)%TS+TS)%TS,yy=(y%TS+TS)%TS,i=yy*TS+xx;H[i]+=v*tp*0.5;}}}
    for(let i=0;i<TS*TS;i++){const x=i%TS,y=(i/TS)|0,clump=pn(x,y,8,seed+3)*0.6+pn(x,y,24,seed+4)*0.4-0.5;H[i]=cl(H[i]+clump*(o.clump||0.25));A[i]=1+(H[i]-0.5)*(o.ab||0.55);}
    return {h:H,a:A,n:tileNormals(H,o.nk||3.2)};}
  // overlapping round scales (fish) / feather scallops (birds) — rows along +Y
  function scaleTile(seed,cw,ch,o){o=o||{};const H=new Float32Array(TS*TS),A=new Float32Array(TS*TS);
    for(let y=0;y<TS;y++)for(let x=0;x<TS;x++){const row=Math.floor(y/ch),xo=x+(row%2?cw/2:0),cx=Math.floor(xo/cw),fx=(xo-cx*cw)/cw-0.5,fy=(y-row*ch)/ch;
      // scale edge = arc at the far end of each cell; height rises toward the free edge
      const d=Math.hypot(fx*1.15,(fy-0.05)*ch/cw*0.9),edge=ss(0.42,0.5,d),rib=o.rachis?ss(0.06,0.0,Math.abs(fx))*0.35:0;
      let h=0.25+0.6*fy*(1-edge)+rib+(hsh(cx,row,seed,1)-0.5)*0.12;h+=(pn(x,y,32,seed)-0.5)*0.1;H[y*TS+x]=h;A[y*TS+x]=1+(h-0.5)*(o.ab||0.45)-edge*(o.dark||0.25)+(o.rachis?rib*0.4:0);}
    return {h:H,a:A,n:tileNormals(H,o.nk||2.2)};}
  // crocodile scutes: rectangular plates with grooves and pebbly centres
  function scuteTile(seed){const H=new Float32Array(TS*TS),A=new Float32Array(TS*TS),cw=21.33,ch=18.29;
    for(let y=0;y<TS;y++)for(let x=0;x<TS;x++){const row=Math.floor(y/ch),xo=x+(row%2?cw*0.5:0),cx=Math.floor(xo/cw),fx=(xo-cx*cw)/cw,fy=(y-row*ch)/ch,e=Math.min(fx,1-fx,fy,1-fy);
      const g=ss(0.0,0.14,e),pb=pn(x,y,96,seed)*0.25,ridge=ss(0.25,0.0,Math.abs(fx-0.5))*ss(0.2,0.6,fy)*0.25*(hsh(cx,row,seed,3)>0.5?1:0);
      const h=g*(0.55+pb+ridge+(hsh(cx,row,seed,2)-0.5)*0.15);H[y*TS+x]=h;A[y*TS+x]=0.62+0.5*g+(hsh(cx,row,seed,5)-0.5)*0.18;}
    return {h:H,a:A,n:tileNormals(H,3.0)};}
  // fine skin: pores + wrinkle cells (pig, frog, human)
  function skinTile(seed,o){o=o||{};const H=new Float32Array(TS*TS),A=new Float32Array(TS*TS);
    for(let y=0;y<TS;y++)for(let x=0;x<TS;x++){let h=0.5;h+=(pn(x,y,24,seed)-0.5)*0.35+(pn(x,y,64,seed+1)-0.5)*0.2+(pn(x,y,180,seed+2)-0.5)*0.12;
      // cellular creases
      const CF=o.cells||24,cx=x/TS*CF,cy=y/TS*CF,ix=Math.floor(cx),iy=Math.floor(cy),wc=i=>((i%CF)+CF)%CF;let d1=9,d2=9;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const px=ix+i+hsh(wc(ix+i),wc(iy+j),seed,7),py=iy+j+hsh(wc(ix+i),wc(iy+j),seed,8),d=Math.hypot(px-cx,py-cy);if(d<d1){d2=d1;d1=d;}else if(d<d2)d2=d;}
      const cr=ss(0.12,0.0,d2-d1)*(o.crease||0.3);h-=cr;if(hsh(x,y,seed,9)>0.985)h-=0.15*(o.pore||1);H[y*TS+x]=h;A[y*TS+x]=1+(h-0.5)*(o.ab||0.3);}
    return {h:H,a:A,n:tileNormals(H,o.nk||2.0)};}
  const tile=(k)=>{if(TILES[k])return TILES[k];let t;
    if(k==='fur')t=strandTile(11,{len:6,len2:12,n:16000,amp:0.12,ab:0.38,nk:1.7,clump:0.18});else if(k==='furS')t=strandTile(12,{len:4,len2:8,n:20000,amp:0.09,ab:0.3,nk:1.4,clump:0.12});else if(k==='bristle')t=strandTile(13,{len:10,len2:18,n:9000,amp:0.2,jit:0.45,ab:0.6,nk:2.0});
    else if(k==='wool')t=strandTile(14,{len:5,len2:9,n:12000,jit:1.6,clump:0.3,amp:0.12,nk:1.6});else if(k==='scale')t=scaleTile(21,10.67,8,{});else if(k==='feather')t=scaleTile(22,25.6,21.33,{rachis:1,ab:0.35,dark:0.18});
    else if(k==='scute')t=scuteTile(31);else if(k==='skin')t=skinTile(41);else if(k==='hskin')t=skinTile(42,{crease:0.18,ab:0.16,nk:1.4});else if(k==='smooth')t=skinTile(43,{crease:0.08,ab:0.08,nk:0.8});
    else if(k==='hide')t=skinTile(44,{crease:0.22,ab:0.22,nk:1.5,cells:40,pore:0.4});
    else if(k==='weave'){const H=new Float32Array(TS*TS),A=new Float32Array(TS*TS);for(let y=0;y<TS;y++)for(let x=0;x<TS;x++){const u=x/4,v=y/4,cu=Math.floor(u),cv=Math.floor(v),over=(cu+cv)%2===0,fu=u-cu,fv=v-cv;
        const hu=Math.sin(fu*PI),hv=Math.sin(fv*PI),h=(over?hv*0.7+0.3*hu:hu*0.7+0.3*hv)*(0.85+0.3*pn(x,y,12,51))+(hsh(x,y,52,1)-0.5)*0.08;H[y*TS+x]=h;A[y*TS+x]=0.78+0.4*h;}
      t={h:H,a:A,n:tileNormals(H,2.4)};}
    else t=strandTile(11);return TILES[k]=t;};

  /* =============================== ENVIRONMENT (catch-lights) =============================== */
  let ENV=null;const envCube=()=>{if(ENV)return ENV;const S=64,face=(fn)=>{const c=mkCanvas(S,S),g=c.getContext('2d'),im=g.createImageData(S,S);for(let y=0;y<S;y++)for(let x=0;x<S;x++){const u=(x+0.5)/S*2-1,v=(y+0.5)/S*2-1,d=fn(u,v),o=(y*S+x)*4;
        const l=Math.hypot(...d),dx=d[0]/l,dy=d[1]/l,dz=d[2]/l;let col;if(dy>0){const t=Math.pow(dy,0.5);col=mix([0.86,0.9,0.92],[0.42,0.62,0.86],t);}else{col=mix([0.5,0.46,0.38],[0.22,0.2,0.16],Math.pow(-dy,0.6));}
        const sun=Math.pow(Math.max(0,dx*0.45+dy*0.75+dz*0.48),220);col=add3(col,[1,0.97,0.9],sun*3);const win=ss(0.55,0.62,dy)*ss(0.0,0.35,dz)*ss(0.75,0.4,Math.abs(dx));col=add3(col,[0.25,0.25,0.25],win*0.6);
        im.data[o]=Math.min(255,col[0]*255);im.data[o+1]=Math.min(255,col[1]*255);im.data[o+2]=Math.min(255,col[2]*255);im.data[o+3]=255;}g.putImageData(im,0,0);return c;};
    const F=[face((u,v)=>[1,-v,-u]),face((u,v)=>[-1,-v,u]),face((u,v)=>[u,1,v]),face((u,v)=>[u,-1,-v]),face((u,v)=>[u,-v,1]),face((u,v)=>[-u,-v,-1])];
    ENV=new T.CubeTexture(F);ENV.needsUpdate=true;return ENV;};

  /* =============================== MATERIALS (shared) =============================== */
  const MATS={};
  const pmat=(key,o)=>{if(MATS[key])return MATS[key];const p=Object.assign({vertexColors:true,metalness:0},o);const m=new T.MeshPhysicalMaterial(p);m.name=key;m.userData.key=key;return MATS[key]=m;};
  const smat=(key,o)=>{if(MATS[key])return MATS[key];const p=Object.assign({vertexColors:true,metalness:0},o);const m=new T.MeshStandardMaterial(p);m.name=key;m.userData.key=key;return MATS[key]=m;};
  const gMat=()=>pmat('a6Gloss',{roughness:0.3,clearcoat:1,clearcoatRoughness:0.05,envMap:envCube(),envMapIntensity:1.4});
  const hMat=()=>pmat('a6Hard',{roughness:0.5,clearcoat:0.25,clearcoatRoughness:0.4,envMap:envCube(),envMapIntensity:0.5});
  const tMat=()=>smat('a6Thin',{roughness:0.78,side:T.DoubleSide});
  const glowMat=()=>smat('a6Glow',{roughness:0.5,emissive:new T.Color('#d8ff5a'),emissiveIntensity:1.4});
  // wire: material key strings used by builders (4a names kept) → material, given the species context
  const KIND_TEX={};// kind → {map, nor, D, S, layoutKey}

  /* =============================== VERTEX/UV SOUP =============================== */
  // every triangle carries a colour (rgb or fn(p,n,q)) and a smoothing group; q may hold {J (paint job), u, v} for atlas UVs
  function VB(){this.P=[];this.Q=[];this.F=[];this.gc=0;}
  VB.prototype.grp=function(){return ++this.gc;};
  VB.prototype.t=function(a,b,c,cf,g,qa,qb,qc){this.P.push(a,b,c);this.Q.push(qa,qb,qc);this.F.push(cf,g||0);return this;};
  VB.prototype.o=function(a,b,c,ref,cf,g,qa,qb,qc,inw){const n=crs(sub3(b,a),sub3(c,a)),m=sub3([(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3],ref);
    return ((dot(n,m)>=0)!==!!inw)?this.t(a,b,c,cf,g,qa,qb,qc):this.t(a,c,b,cf,g,qa,qc,qb);};
  VB.prototype.q=function(a,b,c,d,ref,cf,g,qa,qb,qc,qd){this.o(a,b,c,ref,cf,g,qa,qb,qc);return this.o(a,c,d,ref,cf,g,qa,qc,qd);};
  VB.prototype.n=function(){return this.P.length/3;};
  VB.prototype.tn=function(a,b,c,na,nb,nc,cf){const n=crs(sub3(b,a),sub3(c,a));if(dot(n,add3(add3(na,nb),nc))<0){const t=b;b=c;c=t;const u=nb;nb=nc;nc=u;}this.P.push(a,b,c);this.Q.push(null,null,null);this.F.push(cf,-1);(this.NO||(this.NO={}))[this.P.length/3-1]=[na,nb,nc];return this;};
  const KQ=p=>Math.round(p[0]*500)+','+Math.round(p[1]*500)+','+Math.round(p[2]*500);
  let CTX=null;// current species build context {kind, jobs:[], meshes:[], det, opts}
  // m: material key; atlas=true → triangles whose 3 corners carry a paint job get atlas UVs and white vertex colour
  VB.prototype.mesh=function(m,off,name){const nt=this.P.length/3;if(!nt)return null;const atl=CTX&&(m==='a4Fur'||(m==='a4Gloss'&&CTX.wetAtlas)||(m==='a4Thin'&&CTX.thinAtlas));
    const pos=new Float32Array(nt*9),nor=new Float32Array(nt*9),col=new Float32Array(nt*9),uvj=atl?new Array(nt*3):null,FN=[],acc={};
    for(let i=0;i<nt;i++){const a=this.P[i*3],b=this.P[i*3+1],c=this.P[i*3+2],n=crs(sub3(b,a),sub3(c,a));FN.push(n);const g=this.F[i*2+1];
      if(g>0)for(const p of [a,b,c]){const k=g+'|'+KQ(p),s=acc[k]||(acc[k]=[0,0,0]);s[0]+=n[0];s[1]+=n[1];s[2]+=n[2];}}
    for(let i=0;i<nt;i++){const cf=this.F[i*2],g=this.F[i*2+1],fn=nrm3(FN[i]),no=g<0?this.NO[i]:null,qa=this.Q[i*3],qb=this.Q[i*3+1],qc=this.Q[i*3+2];
      const isA=atl&&qa&&qb&&qc&&qa.J&&qa.J===qb.J&&qb.J===qc.J;if(isA){qa.J.used=true;let ua=qa.u,ub=qb.u,uc=qc.u;const mxu=Math.max(ua,ub,uc),mnu=Math.min(ua,ub,uc);if(mxu-mnu>0.5){if(ua<0.5)ua+=1;if(ub<0.5)ub+=1;if(uc<0.5)uc+=1;}
        uvj[i*3]=[qa.J,ua,qa.v];uvj[i*3+1]=[qa.J,ub,qb.v];uvj[i*3+2]=[qa.J,uc,qc.v];}
      for(let k=0;k<3;k++){const p=this.P[i*3+k],n=no?nrm3(no[k]):g?nrm3(acc[g+'|'+KQ(p)]):fn,o=i*9+k*3,
        c=isA?[1,1,1]:typeof cf==='function'?cf(p,n,this.Q[i*3+k]||{}):cf;pos[o]=p[0]-(off?off[0]:0);pos[o+1]=p[1]-(off?off[1]:0);pos[o+2]=p[2]-(off?off[2]:0);nor[o]=n[0];nor[o+1]=n[1];nor[o+2]=n[2];col[o]=c[0];col[o+1]=c[1];col[o+2]=c[2];}}
    const ge=new T.BufferGeometry();ge.setAttribute('position',new T.BufferAttribute(pos,3));ge.setAttribute('normal',new T.BufferAttribute(nor,3));ge.setAttribute('color',new T.BufferAttribute(col,3));
    const ms=new T.Mesh(ge,null);ms.name=name||m;ms.castShadow=true;ms.receiveShadow=true;ms.userData.mk=m;if(uvj)ms.userData.uvj=uvj;
    if(CTX)CTX.meshes.push(ms);else ms.material=m==='a4Gloss'?gMat():m==='a4Hard'?hMat():m==='a4Thin'?tMat():m==='a4Glow'?glowMat():smat('a6Plain',{roughness:0.85});return ms;};

  /* =============================== SMOOTH LOFTS =============================== */
  // ring: [x,y,z, w (half width along side), t (towards `up`), b (opposite), p (superellipse exponent)]
  function frames(R,o){const L=R.length,F=[];let side0=null;for(let i=0;i<L;i++){const a=R[Math.max(0,i-1)],b=R[Math.min(L-1,i+1)],d=nrm3([b[0]-a[0],b[1]-a[1],b[2]-a[2]]),rf=o.side||[1,0,0];
      let sd=sub3(rf,mul(d,dot(rf,d)));if(len3(sd)<1e-3)sd=side0||[0,0,1];sd=nrm3(sd);let up=crs(d,sd);const ur=o.up===undefined?[0,1,0]:o.up;if(ur&&dot(up,ur)<-0.3){sd=mul(sd,-1);up=mul(up,-1);}
      side0=sd;const r=R[i];F.push({c:[r[0],r[1],r[2]],d,sd,up,w:r[3],t:r[4],b:r[5]===undefined?r[4]:r[5],p:r[6]||2});}return F;}
  const ringPt=(f,th)=>{const cs=Math.cos(th),sn=Math.sin(th),e=2/f.p,x=Math.sign(cs)*Math.pow(Math.abs(cs),e)*f.w,y=Math.sign(sn)*Math.pow(Math.abs(sn),e)*(sn>0?f.t:f.b);return add3(add3(f.c,f.sd,x),f.up,y);};
  // monotone cubic (no overshoot) for scalar ring dims; Catmull-Rom for centres
  const mono=(y0,y1,y2,y3,f)=>{const d0=y1-y0,d1=y2-y1,d2=y3-y2,tg=(a,b)=>a*b<=0?0:2*a*b/(a+b);const m1=tg(d0,d1)||(y0===y1?d1*0.5:0),m2=tg(d1,d2)||(y2===y3?d1*0.5:0);
    const f2=f*f,f3=f2*f;return (2*f3-3*f2+1)*y1+(f3-2*f2+f)*m1+(-2*f3+3*f2)*y2+(f3-f2)*m2;};
  const cr=(a,b,c,d,f)=>{const f2=f*f,f3=f2*f;return 0.5*((2*b)+(-a+c)*f+(2*a-5*b+4*c-d)*f2+(-a+3*b-3*c+d)*f3);};
  function fAt(F,s){const L=F.length;if(L===1)return F[0];if(s<=0)return F[0];if(s>=L-1)return F[L-1];const i=Math.min(L-2,Math.floor(s)),f=s-i;if(f<1e-6)return F[i];
    const P0=F[Math.max(0,i-1)],P1=F[i],P2=F[i+1],P3=F[Math.min(L-1,i+2)],sm2=F.lin;
    const c=sm2?lerp3(P1.c,P2.c,f):[0,1,2].map(k=>cr(i===0?2*P1.c[k]-P2.c[k]:P0.c[k],P1.c[k],P2.c[k],i+2>L-1?2*P2.c[k]-P1.c[k]:P3.c[k],f));
    const sc=k=>sm2?P1[k]+(P2[k]-P1[k])*f:mono(P0[k],P1[k],P2[k],P3[k],f);
    return {c,d:nrm3(lerp3(P1.d,P2.d,f)),sd:nrm3(lerp3(P1.sd,P2.sd,f)),up:nrm3(lerp3(P1.up,P2.up,f)),w:sc('w'),t:sc('t'),b:sc('b'),p:P1.p+(P2.p-P1.p)*f};}
  // generalized surface point incl. rounded caps: s∈[-1,0] cap0, [0,L-1] rings, [L-1,L] cap1
  function gpt(F,s,th){const p=gpt0(F,s,th);return F.mod?F.mod(p,s,th):p;}
  function gpt0(F,s,th){const L=F.length;if(s<0&&F.cap0){const f=cl(-s),fr=F[0],tip=F.cap0===true?fr.c:F.cap0,e=F.capE0||1,g=Math.cos(f*PI/2),a=Math.sin(f*PI/2);const r=sub3(ringPt(fr,th),fr.c);return add3(lerp3(fr.c,tip,Math.pow(a,e)),r,g);}
    if(s>L-1&&F.cap1){const f=cl(s-(L-1)),fr=F[L-1],tip=F.cap1===true?fr.c:F.cap1,e=F.capE1||1,g=Math.cos(f*PI/2),a=Math.sin(f*PI/2);const r=sub3(ringPt(fr,th),fr.c);return add3(lerp3(fr.c,tip,Math.pow(a,e)),r,g);}
    return ringPt(fAt(F,Math.max(0,Math.min(L-1,s))),th);}
  const axisAt=(F,s)=>{const L=F.length;if(s<0&&F.cap0)return F[0].c;if(s>L-1&&F.cap1)return F[L-1].c;return fAt(F,Math.max(0,Math.min(L-1,s))).c;};
  // reference point INSIDE the solid near s (cap zones: ring centre pushed inwards along the axis)
  const inRef=(F,s)=>{const L=F.length;if(s<0||(s===0&&F.cap0)){const f=F[0],r=(f.w+f.t+f.b)/3;return add3(f.c,f.d,r*0.6+0.01);}if(s>L-1||(s===L-1&&F.cap1)){const f=F[L-1],r=(f.w+f.t+f.b)/3;return add3(f.c,f.d,-(r*0.6+0.01));}return fAt(F,s).c;};
  function gnorm(F,s,th){const e=0.03,L=F.length,s0=F.cap0?-1:0,s1=F.cap1?L:L-1,sa=Math.max(s0,s-e),sb=Math.min(s1,s+e);const ps=sub3(gpt(F,sb,th),gpt(F,sa,th)),pt=sub3(gpt(F,s,th+0.04),gpt(F,s,th-0.04));
    let n=crs(pt,ps);if(len3(n)<1e-9){n=sub3(gpt(F,s,th),axisAt(F,s));}n=nrm3(n);const p=gpt(F,s,th),out=sub3(p,inRef(F,s));if(dot(n,out)<0)n=mul(n,-1);return n;}
  // density: rings are subdivided `ks`× along, `kn`× around (CTX.den / o.den override)
  const cmean=(a,b)=>{if(Math.abs(a-b)>0.5){if(a<b)a+=1;else b+=1;}const m=(a+b)/2;return m>=1?m-1:m;};
  function loft(B,R,n,cf,o){o=o||{};const F=frames(R,o),L=F.length,g=o.g===undefined?B.grp():o.g,rot=o.rot===undefined?PI/2:o.rot;
    const den=o.den||(CTX&&CTX.den)||[2,1.5],ks=L>2?(o.ks||den[0]):Math.max(1,Math.round((o.ks||den[0])*0.5)),nm=o.face?n:Math.max(n>=4&&!o.keepN?((CTX&&CTX.tubeMin)||6):n,Math.round(n*(o.kn||den[1])/(n<=4?1.25:1)));F.lin=!!o.lin;
    if(o.cap0)F.cap0=o.cap0;if(o.cap1)F.cap1=o.cap1;if(o.mod)F.mod=o.mod;F.capE0=o.capE0;F.capE1=o.capE1;F.rot=rot;F.n=nm;F.n0=n;
    const capRows=o.capRows||(CTX&&CTX.capRows)||2,rows=[];if(o.cap0){for(let k=capRows;k>=1;k--)rows.push(-k/capRows);}for(let i=0;i<L-1;i++)for(let k=0;k<ks;k++)rows.push(i+k/ks);rows.push(L-1);if(o.cap1){for(let k=1;k<=capRows;k++)rows.push(L-1+k/capRows);}
    const J={F,cf,face:!!o.face,bars:[],n:nm,s0:o.cap0?-1:0,s1:o.cap1?L:L-1,th0:-PI/2,ov:1.25/nm,id:CTX?CTX.jobs.length:0,detail:o.detail};F.J=J;if(CTX)CTX.jobs.push(J);
    // arc-length table along s (for isotropic texel density)
    {const st=[],N=Math.max(8,Math.round((J.s1-J.s0)*8));let acc=0,prev=null,per=0,pmax=0;for(let k=0;k<=N;k++){const s=J.s0+(J.s1-J.s0)*k/N,a=s<0||s>L-1?(()=>{let m=[0,0,0];for(let q=0;q<4;q++)m=add3(m,gpt(F,s,q*PI/2));return mul(m,0.25);})():axisAt(F,s);
        if(prev)acc+=len3(sub3(a,prev));prev=a;st.push([s,acc]);if(s>=0&&s<=L-1){const fr=fAt(F,s);const pm=PI*(3*(fr.w+(fr.t+fr.b)/2)-Math.sqrt((3*fr.w+(fr.t+fr.b)/2)*(fr.w+3*(fr.t+fr.b)/2)))*1.0;per+=pm;pmax=Math.max(pmax,pm);}}
      // add the caps' arc (dome ≈ quarter circle of the end radius)
      J.tab=st;J.len=Math.max(0.05,acc);J.per=Math.max(0.05,(per/(N+1))*0.5+pmax*0.5);J.area=J.len*J.per*(1+J.ov);}
    const vOf=s=>{const t=J.tab;if(s<=t[0][0])return 0;for(let k=1;k<t.length;k++)if(s<=t[k][0]){const f=(s-t[k-1][0])/((t[k][0]-t[k-1][0])||1);return (t[k-1][1]+(t[k][1]-t[k-1][1])*f)/J.len;}return 1;};
    J.sOfV=v=>{const t=J.tab,a=v*J.len;if(a<=0)return t[0][0];for(let k=1;k<t.length;k++)if(a<=t[k][1]){const f=(a-t[k-1][1])/((t[k][1]-t[k-1][1])||1);return t[k-1][0]+(t[k][0]-t[k-1][0])*f;}return t[t.length-1][0];};
    const uOf=th=>{let u=((th-J.th0)/TAU)%1;if(u<0)u+=1;return u;};
    const P=[],Qs=[];rows.forEach((s,ri)=>{const ring=[],qs=[],tipRow=(s===-1||s===L);for(let j=0;j<nm;j++){const th=rot+j/nm*TAU;ring.push(gpt(F,s,th));const ss0=s<0?0:s>L-1?1:s/(L-1);
        qs.push({s:ss0,a:Math.atan2(Math.sin(th),Math.cos(th)),i:Math.max(0,Math.min(L-2,Math.floor(s))),tip:(s<0||s>L-1)?1:undefined,J,u:uOf(th),v:vOf(s)});}P.push(ring);Qs.push(qs);});
    for(let r=0;r<rows.length-1;r++){const capz=rows[r]<0||rows[r+1]>L-1,ref=capz?inRef(F,rows[r]<0?-0.5:L-0.5):lerp3(axisAt(F,rows[r]),axisAt(F,rows[r+1]),0.5);const tip0=rows[r]===-1,tip1=rows[r+1]===L;
      for(let j=0;j<nm;j++){const j1=(j+1)%nm;let k=cf;if(o.face&&typeof cf==='function'){const ce=mul(add3(add3(P[r][j],P[r][j1]),add3(P[r+1][j1],P[r+1][j])),0.25);k=cf(ce,nrm3(sub3(ce,ref)),{i:Math.max(0,Math.min(L-2,Math.floor(rows[r]))),s:(rows[r]+0.5)/(L-1),a:Qs[r][j].a});}
        // fix u at the seam for this quad
        const q=[Qs[r][j],Qs[r][j1],Qs[r+1][j1],Qs[r+1][j]];
        const refIn=tip0||tip1?(tip0?add3(P[r+1][j],F[0].d,0):P[r][j]):ref;
        if(tip0){const tq=Object.assign({},Qs[r][j],{u:cmean(Qs[r+1][j].u,Qs[r+1][j1].u)});B.o(P[r][j],P[r+1][j1],P[r+1][j],ref,k,g,tq,Qs[r+1][j1],Qs[r+1][j]);}
        else if(tip1){const tq=Object.assign({},Qs[r+1][j],{u:cmean(Qs[r][j].u,Qs[r][j1].u)});B.o(P[r][j],P[r][j1],P[r+1][j],ref,k,g,Qs[r][j],Qs[r][j1],tq);}
        else B.q(P[r][j],P[r][j1],P[r+1][j1],P[r+1][j],ref,k,g,q[0],q[1],q[2],q[3]);}}
    F.P=P;F.rows=rows;return F;}
  // point on a loft surface at fractional ring index s and angle th, pushed out by off along the (smooth) normal
  const surf=(F,s,th,off)=>{const p=gpt(F,s,th),n=gnorm(F,s,th);return add3(p,n,off||0);};
  const surfN=(F,s,th,off)=>{const p=gpt(F,s,th),n=gnorm(F,s,th);return {p:add3(p,n,off||0.05),n};};
  // markings are painted into the atlas (surface space) instead of decal geometry
  function ringBand(B,F,s,hw,cf){if(F.J)F.J.bars.push({band:1,s,hw,cf});}
  function bar(B,F,s0,th0,s1,th1,hw,cf,o){if(F.J)F.J.bars.push({s0,th0,s1,th1,hw,cf,o:o||{}});}
  // round soft spot of radius r (du) at (s,th): eye rims, nostrils, markings
  function spot(F,s,th,r,cf,o){if(F.J)F.J.bars.push({spot:1,s,th,r,cf,o:o||{}});}
  const tube=(B,P,r,n,cf,o)=>loft(B,P.map((p,i)=>[p[0],p[1],p[2],Array.isArray(r[i])?r[i][0]:r[i],Array.isArray(r[i])?r[i][1]:r[i],Array.isArray(r[i])?r[i][2]||r[i][1]:r[i]]),n,cf,o);
  function ball(B,c,r,s,ws,hs,cf,g){g=g===undefined?B.grp():g;const k=CTX&&CTX.den?CTX.den[1]:1.5;ws=Math.round(ws*k);hs=Math.round(hs*k);const P=[];for(let j=0;j<=hs;j++){const v=PI*j/hs,row=[];for(let i=0;i<ws;i++){const u=TAU*i/ws;row.push([c[0]+Math.sin(v)*Math.sin(u)*r*s[0],c[1]+Math.cos(v)*r*s[1],c[2]+Math.sin(v)*Math.cos(u)*r*s[2]]);}P.push(row);}
    for(let j=0;j<hs;j++)for(let i=0;i<ws;i++){const i2=(i+1)%ws;if(j>0)B.o(P[j][i],P[j][i2],P[j+1][i2],c,cf,g);if(j<hs-1)B.o(P[j][i],P[j+1][i2],P[j+1][i],c,cf,g);}return B;}
  // small smooth ellipsoid (was an octahedron in 4a): 6×4 lat-long
  const octa=(B,c,r,s,cf,g)=>{s=s||[1,1,1];g=g===undefined?B.grp():g;const ws=(CTX&&CTX.octa)?CTX.octa[0]:6,hs=(CTX&&CTX.octa)?CTX.octa[1]:4,P=[];for(let j=0;j<=hs;j++){const v=PI*j/hs,row=[];for(let i=0;i<ws;i++){const u=TAU*i/ws;row.push([c[0]+Math.sin(v)*Math.sin(u)*r*s[0],c[1]+Math.cos(v)*r*s[1],c[2]+Math.sin(v)*Math.cos(u)*r*s[2]]);}P.push(row);}
    for(let j=0;j<hs;j++)for(let i=0;i<ws;i++){const i2=(i+1)%ws;if(j>0)B.o(P[j][i],P[j][i2],P[j+1][i2],c,cf,g);if(j<hs-1)B.o(P[j][i],P[j+1][i2],P[j+1][i],c,cf,g);}return B;};
  /* ---- realistic eye: sphere with painted pupil/iris/limbus (vertex colours, glossy), + dark lid rim ----
     out = gaze direction; iris colour; pupil: [wx, wy] half-extent factors (slit/round); lid colour */
  const EYE_DK=C('#0a0706');
  function eyeBall(B,c,r,out,iris,o){o=o||{};out=nrm3(out);const s=o.sc||[1,1,1],ws=o.ws||(CTX&&CTX.eyeRes)||12,hs=Math.max(4,Math.round(ws*0.7)),pu=o.pupil||[0.42,0.42],ir=o.irisR||0.82;
    const ax=nrm3(crs(Math.abs(out[1])>0.9?[1,0,0]:[0,1,0],out)),ay=crs(out,ax),g=B.grp();// ax horizontal, ay vertical-ish
    const col=(p)=>{const d=nrm3(sub3(p,c)),cz=dot(d,out),x=dot(d,ax),y=dot(d,ay);if(cz<0.2)return mix(EYE_DK,o.scl||C('#2a1e18'),0.4);const rr=Math.sqrt(x*x+y*y);
      const pr=Math.sqrt((x/pu[0])*(x/pu[0])+(y/pu[1])*(y/pu[1]))*0.42;if(pr<0.42*0.95)return EYE_DK;
      if(rr<ir*0.98){const a=Math.atan2(y,x),st=0.82+0.18*hsh(Math.floor((a+PI)*14),3,5,7)+0.12*(1-rr/ir);let k=mul(iris,st);k=mix(k,mul(iris,0.45),ss(ir*0.72,ir*0.98,rr));return mix(k,EYE_DK,ss(0.48,0.42,pr)*0.6);}
      return mix(o.scl||C('#3a2a20'),EYE_DK,ss(ir,1.0,rr)*0.3);};
    const P=[];for(let j=0;j<=hs;j++){const v=PI*j/hs,row=[];for(let i=0;i<ws;i++){const u=TAU*i/ws;const lx=Math.sin(v)*Math.cos(u),ly=Math.sin(v)*Math.sin(u),lz=Math.cos(v);
        row.push(add3(add3(add3(c,ax,lx*r*s[0]),ay,ly*r*s[1]),out,lz*r*s[2]));}P.push(row);}
    for(let j=0;j<hs;j++)for(let i=0;i<ws;i++){const i2=(i+1)%ws;if(j>0)B.o(P[j][i],P[j][i2],P[j+1][i2],c,col,g);if(j<hs-1)B.o(P[j][i],P[j+1][i2],P[j+1][i],c,col,g);}
    // lid rim: thin torus at the visible edge of the ball
    if(o.lid===true){const n=Math.max(8,ws),lc=o.lidC||C('#18110d'),g2=B.grp(),R0=r*1.02,tr=r*0.13,ring=[];for(let i=0;i<=n;i++){const a=TAU*i/n,e=add3(mul(ax,Math.cos(a)*s[0]),ay,Math.sin(a)*s[1]),ctr=add3(add3(c,e,R0*0.86),out,r*s[2]*0.42),rad=nrm3(add3(e,out,0.55)),row=[];
        for(let k=0;k<4;k++){const b=k/4*TAU;row.push(add3(add3(ctr,rad,Math.cos(b)*tr),out,Math.sin(b)*tr*0.8));}ring.push(row);}
      for(let i=0;i<n;i++)for(let k=0;k<4;k++){const k1=(k+1)%4,ce=add3(add3(c,mul(ax,0),1),out,r*0.4);B.q(ring[i][k],ring[i][k1],ring[i+1][k1],ring[i+1][k],lerp3(lerp3(ring[i][0],ring[i][2],0.5),lerp3(ring[i+1][0],ring[i+1][2],0.5),0.5),lc,g2);}}
    return B;}
  // legacy eye(): glossy dark ball (no iris) — now real eyeball with very dark iris
  function eye(B,c,r,out,col,s){return eyeBall(B,c,r,out,mix(col,C('#3a2414'),0.5),{sc:s,pupil:[0.5,0.5],irisR:0.7});}
  function spike(B,b,a,r,n,cf,cap,fl,g){const d=nrm3(sub3(a,b));const u=nrm3(crs(Math.abs(d[1])<0.9?[0,1,0]:[1,0,0],d)),v=crs(d,u);g=g===undefined?B.grp():g;n=Math.max(n,(CTX&&CTX.spikeMin)||5);
    // slightly curved cone with 2 rings for smooth shading
    const rims=[0,0.45].map(t=>{const rr=r*(1-t*0.9),ce=lerp3(b,a,t),rim=[];for(let j=0;j<n;j++){const th=j/n*TAU;rim.push(add3(add3(ce,u,Math.cos(th)*rr),v,Math.sin(th)*rr*(fl||1)));}return rim;});
    for(let j=0;j<n;j++){const j1=(j+1)%n;B.q(rims[0][j],rims[0][j1],rims[1][j1],rims[1][j],lerp3(b,a,0.2),cf,g);B.o(rims[1][j],rims[1][j1],a,lerp3(b,a,0.5),cf,g);if(cap)B.o(rims[0][j],rims[0][j1],b,a,cf,0);}return B;}
  function ear(B,base,mid,tip,wd,th,front,cOut,cIn,o){o=o||{};front=nrm3(front);const d=nrm3(sub3(tip,base)),side=nrm3(crs(d,front));
    const tw=o.tipW||0.62,R=[[...base,wd*0.62,th,th],[...lerp3(base,mid,0.5),wd*0.86,th*(o.cup||1)*0.9,th],[...mid,wd,th*(o.cup||1),th],[...lerp3(mid,tip,0.55),wd*tw,th*0.8,th*0.8]];
    const cf=(p,n)=>{const k=ss(-0.1,0.45,dot(n,front));return mix(typeof cOut==='function'?cOut(p,n):cOut,typeof cIn==='function'?cIn(p,n):cIn,k);};
    loft(B,R,o.n||6,cf,{side,up:front,cap1:tip,cap0:o.cap0===false?undefined:base,ks:(CTX&&CTX.earKs)||2,kn:(CTX&&CTX.earKn)||1.4});}
  const fan=(B,pts,cf,g)=>{for(let i=1;i<pts.length-1;i++)B.t(pts[0],pts[i],pts[i+1],cf,g||0);return B;};
  /* ---------------- rig assembly (as 4a) ---------------- */
  const grp=(name,pos)=>{const P=new T.Group();if(name)P.name=name;if(pos)P.position.set(pos[0],pos[1],pos[2]);return P;};
  const pv=(name,at,parent,parentAt)=>{const P=grp(name,parentAt?sub3(at,parentAt):at);P.userData.at=at;if(parent)parent.add(P);return P;};
  const put=(P,B,m,name)=>{const ms=B.mesh(m,P.userData.at,name);if(ms)P.add(ms);return ms;};
  const bbox=(G)=>{G.updateMatrixWorld(true);const b=new T.Box3(),v=new T.Vector3();G.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)b.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});return b;};
  const finish=(G,kind,rig,noSettle)=>{G.userData.rig=rig;const b=bbox(G);if(!noSettle&&Math.abs(b.min.y)>0.02)G.children.forEach(c=>{c.position.y-=b.min.y;});const b2=bbox(G);
    G.userData.h=+(b2.max.y-b2.min.y).toFixed(1);G.userData.len=+(b2.max.z-b2.min.z).toFixed(1);G.userData.r=+(Math.max(b2.max.x-b2.min.x,b2.max.z-b2.min.z)/2).toFixed(1);G.userData.kind=kind;return G;};
  const bakeScale=(G,k)=>{G.traverse(o=>{if(o===G)return;o.position.multiplyScalar(k);if(o.isMesh)o.geometry.scale(k,k,k);if(o.userData.at)o.userData.at=o.userData.at.map(v=>v*k);});const b=bbox(G);G.userData.h=+(b.max.y-b.min.y).toFixed(1);G.userData.len=+(b.max.z-b.min.z).toFixed(1);G.userData.r=+(Math.max(b.max.x-b.min.x,b.max.z-b.min.z)/2).toFixed(1);return G;};
  const trisOf=o=>{let n=0;o.traverse(m=>{if(m.isMesh){const ge=m.geometry;n+=(ge.index?ge.index.count:ge.attributes.position.count)/3;}});return Math.round(n);};

  /* =============================== ATLAS: pack · paint · UV · materials =============================== */
  // species options: detail tile, sheen, roughness, atlas density bounds
  function paintJob(J,X,Wd,rect,D,tl,S){const F=J.F,[x0,y0,w,h]=rect,pad=3,g=J.paintG||(S>=1024?3:2),cw=Math.ceil((w+2*pad)/g)+2,chh=Math.ceil((h+2*pad)/g)+2,span=TAU*(1+J.ov);
    const CR=new Float32Array(cw*chh*3);
    const pr=(px,py)=>{const v=cl((py+0.5)/h),u=(px+0.5)/w,s=J.sOfV(v),th=J.th0+u*span;return [s,th];};
    const L=F.length;
    if(typeof J.cf==='function'){const PP=new Array(cw*chh),SS=new Float32Array(cw*chh),TH=new Float32Array(cw*chh);
      for(let gy=0;gy<chh;gy++)for(let gx=0;gx<cw;gx++){const [s,th]=pr(gx*g-pad,gy*g-pad),i=gy*cw+gx;SS[i]=s;TH[i]=th;PP[i]=gpt(F,s,th);}
      for(let gy=0;gy<chh;gy++)for(let gx=0;gx<cw;gx++){const i=gy*cw+gx,s=SS[i],th=TH[i],p=PP[i];
        const xa=PP[gy*cw+Math.max(0,gx-1)],xb=PP[gy*cw+Math.min(cw-1,gx+1)],ya=PP[Math.max(0,gy-1)*cw+gx],yb=PP[Math.min(chh-1,gy+1)*cw+gx];
        let n=crs(sub3(xb,xa),sub3(yb,ya));if(len3(n)<1e-8)n=gnorm(F,s,th);else{n=nrm3(n);if(dot(n,sub3(p,inRef(F,s)))<0)n=mul(n,-1);}
        const q={s:s<0?0:s>L-1?1:s/(L-1),a:Math.atan2(Math.sin(th),Math.cos(th)),i:Math.max(0,Math.min(L-2,Math.floor(s)))};if(s<-0.5||s>L-0.5)q.tip=1;const c=J.cf(p,n,q),o=i*3,ao=J.noAO?1:0.8+0.2*ss(-0.9,0.4,n[1]);CR[o]=c[0]*ao;CR[o+1]=c[1]*ao;CR[o+2]=c[2]*ao;}}
    else{const c=J.cf||[1,1,1];for(let i=0;i<cw*chh;i++){CR[i*3]=c[0];CR[i*3+1]=c[1];CR[i*3+2]=c[2];}}
    // markings: list of polylines in pixel space (with u wrap copies)
    const segs=[];J.bars.forEach(b=>{const pxOf=(s,th)=>{let u=((th-J.th0)/span);return [u*w,J.vOfS(s)*h];};
      if(b.band){const yy=J.vOfS(b.s)*h,hw=Math.abs(J.vOfS(b.s+b.hw)-J.vOfS(b.s-b.hw))*h/2;segs.push({band:1,y:yy,hw:Math.max(0.8,hw),cf:b.cf});return;}
      if(b.spot){let t=((b.th-J.th0)%TAU+TAU)%TAU;const cx=t/span*w,cy=J.vOfS(b.s)*h,kx=w/(J.per*(1+J.ov)),ky=h/J.len,per=w/(1+J.ov);[-per,0,per].forEach(dx=>segs.push({spot:1,x:cx+dx,y:cy,rx:Math.max(0.8,b.r*kx),ry:Math.max(0.8,b.r*ky*(b.o.ey||1)),ring:b.o.ring,soft:b.o.soft||1,a:b.o.a===undefined?1:b.o.a,cf:b.cf}));return;}
      const N=24,pts=[];for(let k=0;k<=N;k++){const u=k/N,o=b.o,s=b.s0+(b.s1-b.s0)*u+(o.wig?Math.sin(u*PI*2+(o.ph||0))*o.wig:0),th=b.th0+(b.th1-b.th0)*u;let t=((th-J.th0)%TAU+TAU)%TAU;const pp=[t/span*w,J.vOfS(s)*h];
        const wv=b.hw*(o.even?1:(1-0.85*Math.pow(u,1.6)))*(k===0&&!o.blunt?0.7:1),hwpx=Math.abs(J.vOfS(s+wv)-J.vOfS(s-wv))*h/2;pts.push([pp[0],pp[1],Math.max(0.6,hwpx)]);}
      // unwrap x continuity
      for(let k=1;k<pts.length;k++){while(pts[k][0]-pts[k-1][0]>w/(1+J.ov)/2)pts[k][0]-=w/(1+J.ov);while(pts[k-1][0]-pts[k][0]>w/(1+J.ov)/2)pts[k][0]+=w/(1+J.ov);}
      const per=w/(1+J.ov);[-per,0,per].forEach(dx=>segs.push({pts:pts.map(p=>[p[0]+dx,p[1],p[2]]),cf:b.cf}));});
    const tH=tl.h,tA=tl.a,tN=tl.n,ox=(J.id*53)%TS,oy=(J.id*97)%TS;
    for(let py=-pad;py<h+pad;py++){const Y=y0+py;if(Y<0||Y>=S)continue;for(let px=-pad;px<w+pad;px++){const Xp=x0+px;if(Xp<0||Xp>=S)continue;
        const fx=(px+pad)/g,fy=(py+pad)/g,ix=Math.min(cw-2,Math.floor(fx)),iy=Math.min(chh-2,Math.floor(fy)),ax=fx-ix,ay=fy-iy;let r=0,gg=0,bb=0;
        for(let k=0;k<4;k++){const dx=k&1,dy=k>>1,wt=(dx?ax:1-ax)*(dy?ay:1-ay),o=((iy+dy)*cw+ix+dx)*3;r+=CR[o]*wt;gg+=CR[o+1]*wt;bb+=CR[o+2]*wt;}
        const ti=(((py+oy)%TS+TS)%TS)*TS+(((px+ox)%TS+TS)%TS);
        // markings (hairy edges: distance jittered by the strand height)
        if(segs.length){const jit=(tH[ti]-0.5)*1.6;for(const sg of segs){let cov=0;if(sg.spot){const ex=(px-sg.x)/sg.rx,ey=(py-sg.y)/sg.ry,e=Math.sqrt(ex*ex+ey*ey);if(e>1.6)continue;const dpx=(e-1)*Math.min(sg.rx,sg.ry);cov=cl((-(dpx+jit*0.6))/sg.soft+0.5);if(sg.ring)cov*=cl(((e-sg.ring)*Math.min(sg.rx,sg.ry)+jit*0.4)/sg.soft+0.5);cov*=sg.a;}
            else if(sg.band){const d=Math.abs(py-sg.y)+jit;cov=cl(sg.hw-d+0.5);}else{const P2=sg.pts;let best=1e9,bw=1;for(let k=0;k<P2.length-1;k++){const a=P2[k],b2=P2[k+1],vx=b2[0]-a[0],vy=b2[1]-a[1],l2=vx*vx+vy*vy||1;let t=((px-a[0])*vx+(py-a[1])*vy)/l2;t=t<0?0:t>1?1:t;const qx=a[0]+vx*t-px,qy=a[1]+vy*t-py,d=Math.sqrt(qx*qx+qy*qy)-(a[2]+(b2[2]-a[2])*t);if(d<best){best=d;}}cov=cl(-(best+jit)+0.5);}
            if(cov>0){const c=typeof sg.cf==='function'?sg.cf([0,0,0],[0,1,0],{}):sg.cf;r+=(c[0]-r)*cov;gg+=(c[1]-gg)*cov;bb+=(c[2]-bb)*cov;}}}
        const a=tA[ti]*(J.detail==='none'?0:1)+(J.detail==='none'?1:0),o=(Y*S+Xp)*3;X[o]=r*a;X[o+1]=gg*a;X[o+2]=bb*a;Wd[o]=tN[ti*3];Wd[o+1]=tN[ti*3+1];Wd[o+2]=tN[ti*3+2];}}}
  function pack(rects,S){// shelf packer; rects: [{w,h}] → sets x,y; returns ok
    const idx=rects.map((r,i)=>i).sort((a,b)=>rects[b].h-rects[a].h||rects[b].w-rects[a].w);let x=8+2,y=0,sh=0;// leave a white 8×8 patch at the origin
    for(const i of idx){const r=rects[i],W=r.w+6,H=r.h+6;if(W>S)return false;if(x+W>S){x=0;y+=sh;sh=0;}if(y+H>S)return false;r.x=x+3;r.y=y+3;x+=W;sh=Math.max(sh,H);}return true;}
  function finalizeKind(G){const ctx=CTX;CTX=null;const key=ctx.kind,meshes=ctx.meshes;
    const used=ctx.jobs.filter(j=>j.used);
    used.forEach(J=>{J.vOfS=s=>{const t=J.tab;if(s<=t[0][0])return 0;for(let k=1;k<t.length;k++)if(s<=t[k][0]){const f=(s-t[k-1][0])/((t[k][0]-t[k-1][0])||1);return (t[k-1][1]+(t[k][1]-t[k-1][1])*f)/J.len;}return 1;};});
    let TX=KIND_TEX[key];
    if(!TX&&used.length){const area=used.reduce((a,J)=>a+J.area,0),Dmin=ctx.Dmin||10;let S=256;while(S<1024&&area*Dmin*Dmin>0.62*S*S)S*=2;let D=Math.min(ctx.Dmax||40,Math.sqrt(0.85*S*S/area));
      let rects;for(let it=0;it<60;it++){rects=used.map(J=>({w:Math.max(4,Math.ceil(J.per*(1+J.ov)*D)),h:Math.max(4,Math.ceil(J.len*D))}));if(pack(rects,S))break;D*=0.96;}
      const X=new Float32Array(S*S*3).fill(1),Wd=new Uint8Array(S*S*3);for(let i=0;i<S*S;i++){Wd[i*3]=128;Wd[i*3+1]=128;Wd[i*3+2]=255;}
      const lay=[];used.forEach((J,i)=>{const r=rects[i];if(ctx.paintG)J.paintG=ctx.paintG;const tl=tile(J.detail&&J.detail!=='none'?J.detail:ctx.detail||'fur');paintJob(J,X,Wd,[r.x,r.y,r.w,r.h],D,tl,S);lay.push([r.x,r.y,r.w,r.h]);});
      const cv=mkCanvas(S,S),g=cv.getContext('2d'),im=g.createImageData(S,S),cn=mkCanvas(S,S),gn=cn.getContext('2d'),imn=gn.createImageData(S,S);
      for(let i=0;i<S*S;i++){im.data[i*4]=Math.min(255,Math.max(0,X[i*3]*255));im.data[i*4+1]=Math.min(255,Math.max(0,X[i*3+1]*255));im.data[i*4+2]=Math.min(255,Math.max(0,X[i*3+2]*255));im.data[i*4+3]=255;
        imn.data[i*4]=Wd[i*3];imn.data[i*4+1]=Wd[i*3+1];imn.data[i*4+2]=Wd[i*3+2];imn.data[i*4+3]=255;}
      g.putImageData(im,0,0);gn.putImageData(imn,0,0);const map=new T.CanvasTexture(cv),nor=new T.CanvasTexture(cn);[map,nor].forEach(t=>{t.flipY=false;t.anisotropy=4;t.wrapS=t.wrapT=T.ClampToEdgeWrapping;});
      TX=KIND_TEX[key]={map,nor,S,lay,canvas:cv};
      const o=ctx.mat||{};TX.fur=pmat('a6Fur_'+key,Object.assign({map,normalMap:nor,normalScale:new T.Vector2(o.ns||0.7,o.ns||0.7),roughness:o.r||0.86,sheen:o.sheen===undefined?0.6:o.sheen,sheenRoughness:0.5,sheenColor:new T.Color(o.sheenC||'#ffffff').multiplyScalar(o.sheenK||0.14)},o.extra||{}));
      TX.wet=pmat('a6Wet_'+key,{map,normalMap:nor,normalScale:new T.Vector2(o.wns||0.5,o.wns||0.5),roughness:o.wr||0.38,clearcoat:o.cc===undefined?0.6:o.cc,clearcoatRoughness:0.25,envMap:envCube(),envMapIntensity:o.ei||0.7,iridescence:o.irid||0,iridescenceIOR:1.6});
      TX.thin=pmat('a6Thin_'+key,{map,normalMap:nor,normalScale:new T.Vector2(0.4,0.4),roughness:0.75,side:T.DoubleSide,sheen:0.3,sheenColor:new T.Color('#ffffff')});}
    // UVs
    const S=TX?TX.S:1;const map=new Map();used.forEach((J,i)=>map.set(J,TX.lay[i]));
    meshes.forEach(ms=>{const mk=ms.userData.mk;let mat;
      if(mk==='a4Fur')mat=TX?TX.fur:pmat('a6FurPlain',{roughness:0.85,sheen:0.5,sheenColor:new T.Color('#ffffff')});
      else if(mk==='a4Gloss')mat=ctx.wetAtlas&&TX?TX.wet:gMat();else if(mk==='a4Hard')mat=hMat();else if(mk==='a4Thin')mat=ctx.thinAtlas&&TX?TX.thin:tMat();else if(mk==='a4Glow')mat=glowMat();else mat=gMat();
      ms.material=mat;const uj=ms.userData.uvj;delete ms.userData.uvj;
      if(uj&&TX){const n=ms.geometry.attributes.position.count,uv=new Float32Array(n*2);for(let i=0;i<n;i++){const e=uj[i];if(e&&map.has(e[0])){const L=map.get(e[0]),J=e[0];uv[i*2]=(L[0]+(e[1]/(1+J.ov))*L[2])/S;uv[i*2+1]=(L[1]+e[2]*L[3])/S;}else{uv[i*2]=4/S;uv[i*2+1]=4/S;}}ms.geometry.setAttribute('uv',new T.BufferAttribute(uv,2));}
      else if(TX&&(mat===TX.fur||mat===TX.wet||mat===TX.thin)){const n=ms.geometry.attributes.position.count,uv=new Float32Array(n*2).fill(4/S);ms.geometry.setAttribute('uv',new T.BufferAttribute(uv,2));}});
    return G;}
  // run a species builder inside a context. opts: {detail, den, Dmin, Dmax, mat:{r,sheen,ns,...}, wetAtlas, thinAtlas, eyeRes, capRows}
  const withCtx=(kind,opts,fn)=>{const prev=CTX;CTX=Object.assign({kind,jobs:[],meshes:[]},opts||{});let G;try{G=fn();}catch(e){CTX=prev;throw e;}if(G)finalizeKind(G);CTX=prev;return G;};
  /* ================= generic quadruped =================
     S = {kind, body:[rings], bodyCol(p,n,q), bodyN, bodyAt (pivot), head:{at, rings, n, col, eyes:[s,th,r,col], ears:{…}, extra(HB,FH,hard,gloss)},
          tail:{at, P, r, n, col, cap}, legs:{F:{x,at:[y,z], P:[[dx,y,z,w,f,b],...]}, B:{…}, col(p,n,q,front), n}, extra(body pieces) } */
  function quad(S){const G=grp(),body=pv('body',S.bodyAt,null);G.add(body);
    const BB=new VB(),HD=new VB(),BG=new VB(),BH=new VB();// fur, gloss, hard (body-attached)
    const bl=S.body[S.body.length-1],bp=S.body[S.body.length-2],bdir=nrm3(sub3(bl,bp)),autoCap=add3(bl.slice(0,3),bdir,(bl[3]+bl[4]+(bl[5]===undefined?bl[4]:bl[5]))/3*0.75);
    const FB=loft(BB,S.body,S.bodyN||12,S.bodyCol,{cap0:S.bodyCap0,cap1:S.bodyCap1===undefined?autoCap:S.bodyCap1});S.FB=FB;
    if(S.bodyExtra)S.bodyExtra(BB,FB,BG,BH);
    put(body,BB,'a4Fur','fur');put(body,BH,'a4Hard','hard');put(body,BG,'a4Gloss','gloss');
    // head
    const H=S.head,head=pv('head',H.at,body,S.bodyAt),HB=new VB(),HG=new VB(),HH=new VB();
    const FH=loft(HB,H.rings,H.n||10,H.col,{cap1:H.cap1,cap0:H.cap0,mod:H.mod,ks:H.ks});H.F=FH;
    if(H.eyes){const [s,th,r,col,sc]=H.eyes;[th,PI-th].forEach((t,k)=>{const p=surf(FH,s,t,-r*0.5),out=nrm3(sub3(p,surf(FH,s,t,-3)));eye(HG,p,r,out,col,sc);spot(FH,s,t,r*1.22,C('#1a120e'),{soft:1.5});});}
    if(H.extra)H.extra(HB,FH,HG,HH);
    if(H.nose){const [r,sc,col]=H.nose,tip=gpt(FH,FH.length-0.05,PI/2),bk=gpt(FH,FH.length-1.2,PI/2),dir=nrm3(sub3(tip,bk)),nc=add3(tip,dir,-r*sc[2]*0.55);
      ball(HG,add3(nc,[0,r*0.12,0]),r,sc,8,5,(p)=>Math.abs(p[0]-nc[0])>r*0.45&&p[1]<nc[1]+r*0.1?mul(col,0.35):col);}
    put(head,HB,'a4Fur','fur');put(head,HG,'a4Gloss','gloss');put(head,HH,'a4Hard','hard');
    // tail
    let tail=null;if(S.tail){const Tl=S.tail;tail=pv('tail',Tl.at,body,S.bodyAt);const TB=new VB();if(Tl.build)Tl.build(TB);else tube(TB,Tl.P,Tl.r,Tl.n||5,Tl.col,{cap1:Tl.cap,cap0:Tl.P[0]});put(tail,TB,'a4Fur','fur');}
    else{tail=pv('tail',S.bodyAt,body,S.bodyAt);}
    // legs
    const legs={},LS=S.legs;['legFL','legFR','legBL','legBR'].forEach(k=>{const f=k[3]==='F',d=k[4]==='L'?-1:1,sp=f?LS.F:LS.B,at=[d*sp.x,sp.at[0],sp.at[1]],P=pv(k,at,null);G.add(P);
      const LB=new VB(),LH=new VB(),R=sp.P?sp.P.filter((r,i)=>!LS.keep||LS.keep.includes(i)).map(r=>[d*(sp.x+r[0]),r[1],r[2],r[3],r[4],r[5],r[6]]):null,cf=(p,n,q)=>LS.col(p,n,q,f,d);let FL=null;
      if(sp.build)sp.build(LB,LH,d,cf);else FL=loft(LB,R,sp.n||LS.n||6,cf,{ks:LS.ks||(CTX&&CTX.legKs)||1,kn:LS.kn||(CTX&&CTX.legKn)||1.15,capRows:1,side:sp.side?[sp.side[0]*d,sp.side[1],sp.side[2]]:[1,0,0],up:sp.up===undefined?null:sp.up,cap0:true,cap1:sp.cap1?[d*(sp.x+sp.cap1[0]),sp.cap1[1],sp.cap1[2]]:true});
      if(LS.extra)LS.extra(LB,LH,FL,f,d);put(P,LB,'a4Fur','fur');put(P,LH,'a4Hard','hard');legs[k]=P;});
    const rig=Object.assign({body,head,tail},legs);if(S.extraRig)S.extraRig(G,rig);return finish(G,S.kind,rig);}

  // coat colouring: darker dorsal → side → pale belly, plus soft fur noise; extra(k,p,n,q) for markings
  const coat=(o)=>(p,n,q)=>{let k=mix(o.side,o.back,ss(o.b0===undefined?0.1:o.b0,o.b1||0.85,n[1]));if(o.belly)k=mix(k,o.belly,ss(o.e0===undefined?-0.25:o.e0,o.e1||-0.75,n[1])*(o.by?ss(o.by[0],o.by[1],p[1]):1));
    if(o.f)k=o.f(k,p,n,q);return fur(k,p,o.na===undefined?0.14:o.na,o.nf||0.45,o.ns||3);};
  const sc6=(s)=>r=>[r[0]*s,r[1]*s,r[2]*s,r[3]*s,r[4]*s,r[5]===undefined?r[4]*s:r[5]*s,r[6]];
  const sp3=(s)=>p=>[p[0]*s,p[1]*s,p[2]*s];
  // two eyes: gold/amber iris variant (pupil drawn as a smaller dark ball pushed outwards)
  function eyesIris(G,FH,s,th,r,iris,pupil,ps){[th,PI-th].forEach(t=>{spot(FH,s,t,r*1.25,C('#16100c'),{soft:1.5});const p=surf(FH,s,t,-r*0.5),out=nrm3(sub3(p,surf(FH,s,t,-3)));eyeBall(G,p,r,out,iris,{pupil:ps?[ps[2]*0.5,ps[1]*0.5]:[0.42,0.42]});});}

  /* ---- sculpt helpers: mirrored gaussian bumps in ROOT coords: [cx(|x|), cy, cz, rx, ry, rz, dx, dy, dz, h] ---- */
  const sculpt=(B)=>(p)=>{const sx=p[0]<0?-1:1,ax=Math.abs(p[0]);let x=p[0],y=p[1],z=p[2];for(const b of B){const dx=(ax-b[0])/b[3],dy=(p[1]-b[1])/b[4],dz=(p[2]-b[2])/b[5],d2=dx*dx+dy*dy+dz*dz;if(d2>6)continue;const e=Math.exp(-d2*1.3)*b[9];x+=sx*b[6]*e;y+=b[7]*e;z+=b[8]*e;}return [x,y,z];};
  const lineD=(px,py,ax,ay,bx,by)=>{const vx=bx-ax,vy=by-ay,l2=vx*vx+vy*vy||1;let t=((px-ax)*vx+(py-ay)*vy)/l2;t=t<0?0:t>1?1:t;return [Math.hypot(ax+vx*t-px,ay+vy*t-py),t];};
  // thin glossy whisker/hair: tapered quad, both windings
  const whisker=(B,a,b,w,col)=>{const d=nrm3(sub3(b,a)),sd=nrm3(crs(d,[0,1,0.001])),up=nrm3(crs(sd,d));const a1=add3(a,up,w),a2=add3(a,up,-w);B.t(a1,a2,b,col,0).t(a2,a1,b,col,0);};

  /* ================= DEER — sambar stag / hind (6c: sculpted head, wet nose) ================= */
  function deer(male){const c=male?{back:C('#4c3828'),side:C('#6e5139'),belly:C('#b39a7a'),mane:C('#36281d'),rump:C('#8f5e36'),leg:C('#3e3026'),face:C('#64492f'),muz:C('#2a211b'),chin:C('#ddd2bc'),inner:C('#a8917a'),ear:C('#5a4330'),fore:C('#3c2c20')}
      :{back:C('#6c4b2e'),side:C('#916a45'),belly:C('#d2bf9c'),mane:C('#5a412c'),rump:C('#ad7c4c'),leg:C('#55402e'),face:C('#80603f'),muz:C('#3a2c22'),chin:C('#e6dbc4'),inner:C('#b8a088'),ear:C('#7a5a3c'),fore:C('#5e4430')};
    const s=male?1:0.92,S6=sc6(s),S3=sp3(s);
    const body=[[0,23.6,-17.6,1.6,1.4,1.6],[0,23.2,-16.4,4.2,3.2,4.4],[0,22.4,-13.2,5.6,4.0,5.6],[0,21.4,-8,6.0,4.2,6.4],[0,21.0,-2,6.3,4.6,6.9],[0,21.6,3.5,6.0,5.2,6.6],
      [0,22.1,8,5.0,5.0,6.2],[0,22.9,11.2,3.8,4.2,5.2],[0,25.5,13.4,3.0,3.3,3.9],[0,29.2,15.0,2.5,2.8,3.0],[0,32.6,16.2,2.15,2.4,2.4],[0,34.9,16.75,1.95,2.1,2.05]].map(S6);
    if(male){body[8][5]*=1.2;body[9][5]*=1.3;body[10][5]*=1.25;body[9][4]*=1.1;body[10][3]*=1.08;}else body.forEach(r=>r[3]*=0.94);
    const bc=coat({side:c.side,back:c.back,belly:c.belly,by:[19*s,15*s],f:(k,p,n)=>{k=mix(k,c.mane,ss(26*s,30*s,p[1])*ss(10*s,13*s,p[2])*0.85);k=mix(k,c.rump,ss(-13.5*s,-16.5*s,p[2])*ss(0.3,-0.4,n[1])*0.75);
      return mul(k,0.94+0.12*vn3(p[0]*0.35,p[1]*0.35,p[2]*0.35,41));}});
    const J=S3([0,34.4,16.8]);
    const hr=[[0,35.15,15.75,1.6,1.7,1.75,2.2],[0,35.95,16.75,2.15,1.95,2.05,2.3],[0,35.85,17.85,2.3,1.7,1.95,2.3],[0,35.15,19.0,1.86,1.45,1.75,2.2],[0,34.15,20.2,1.46,1.25,1.5,2.2],
      [0,33.15,21.35,1.2,1.08,1.28,2.2],[0,32.3,22.4,1.08,0.98,1.1,2.3],[0,31.75,23.2,1.0,0.86,0.96,2.4]].map(S6);
    const k6=v=>v*s,hmod=sculpt([[1.5,34.35,18.4,0.85,0.75,0.9,0.7,-0.45,0,0.28],[1.55,35.45,19.05,0.35,0.3,0.35,-0.8,0,0.2,0.13],[0,35.2,21.0,0.45,0.4,1.4,0,1,0,0.07],[0.95,31.95,22.4,0.25,0.13,1.0,-0.6,0.4,0,0.06],
      [1.45,36.1,17.9,0.45,0.35,0.55,0.6,0.6,0.1,0.16]].map(b=>[b[0]*s,b[1]*s,b[2]*s,b[3]*s,b[4]*s,b[5]*s,b[6],b[7],b[8],b[9]*s]));
    const hc=(p,n,q)=>{const x=p[0]/s,y=p[1]/s,z=p[2]/s,ax=Math.abs(x);let k=mix(c.face,c.back,ss(0.3,0.9,n[1])*0.55);k=mix(k,c.fore,ss(0.55,0.95,n[1])*ss(16.5,18.5,z)*0.6);
      k=mix(k,c.muz,ss(20.4,22.6,z)*ss(-0.1,0.6,n[1])*0.75);// dark nasal bridge
      k=mix(k,c.chin,ss(-0.25,-0.65,n[1])*ss(20.2,21.4,z));// chin
      k=mix(k,c.chin,ss(0.13,0.0,Math.abs(y-31.7-0.25*(23.2-z)))*ss(21.2,22.0,z)*ss(0.35,0.6,ax)*0.8);// pale lower lip
      k=mix(k,C('#1c1410'),ss(0.07,0.0,Math.abs(y-32.0-0.22*(23.0-z)))*ss(21.4,22.2,z)*ss(0.45,0.7,ax)*0.85);// mouth line
      k=mix(k,c.chin,ss(-0.6,-0.2,n[1])*ss(0.3,0.0,ax-1.2)*0.0);if(q.tip)k=mix(k,C('#141010'),0.8);return fur(k,p,0.08,0.9,4);};
    const legCol=(p,n,q,f)=>{let k=mix(c.side,c.leg,ss(17*s,10*s,p[1]));if(!f)k=mix(k,c.rump,ss(19*s,23*s,p[1])*0.4);k=mix(k,c.belly,ss(0.2,0.8,-n[2]*(f?1:0))*ss(15*s,10*s,p[1])*0.25);
      if(p[1]<1.25*s)k=mix(C('#141110'),C('#2a221d'),ss(0,1.2*s,p[1]));return fur(k,p,0.1,0.6,5);};
    const LF=[[0,21.0,7.4,1.5,2.2,2.4],[0,16.6,6.9,1.75,2.0,2.3],[0,12.2,7.3,1.1,1.15,1.35],[0,9.0,7.5,0.95,0.95,1.05],[0,7.4,7.5,0.7,0.68,0.8],[0,2.9,7.4,0.6,0.62,0.82],[0,1.4,7.95,0.66,0.78,0.6],[0,0,8.7,0.82,1.05,0.55]].map(S6);
    const LB=[[0,21.6,-12.6,1.8,2.6,2.8],[0,17.2,-10.6,2.3,2.9,2.7],[0,12.6,-13.6,1.35,1.3,1.8],[0,10.0,-15.4,0.9,0.85,1.25],[0,8.8,-15.0,0.7,0.68,0.85],[0,2.9,-13.7,0.6,0.62,0.82],[0,1.4,-13.15,0.66,0.78,0.6],[0,0,-12.4,0.82,1.05,0.55]].map(S6);
    return quad({kind:male?'deer':'doe',bodyAt:S3([0,22,0]),body,bodyN:12,bodyCol:bc,bodyCap0:S3([0,23.4,-18.2]),
      head:{at:J,rings:hr,n:12,col:hc,mod:hmod,cap1:S3([0,31.6,23.65]),cap0:S3([0,35.0,15.1]),
        extra:(HB,FH,HG,HH)=>{
          const es=2.2,eth=0.78,er=0.45*s;[PI/2-eth,PI/2+eth].forEach(t=>{const p=surf(FH,es,t,-er*0.45),nn=gnorm(FH,es,t),out=nrm3(add3(nn,[0,0,0.35]));eyeBall(HG,p,er,out,C('#2a1a10'),{pupil:[0.62,0.26],irisR:0.97,scl:C('#120c08')});
            spot(FH,es,t,er*1.15,C('#120d0a'),{soft:1.2});spot(FH,es,t,er*1.8,C('#c4b498'),{ring:0.7,soft:3,a:0.35});spot(FH,3.05,t>PI/2?PI/2+0.62:PI/2-0.62,0.32*s,C('#1a120c'),{ey:1.6,soft:1.5});});
          [-1,1].forEach(d=>{const b=surf(FH,1.15,d>0?PI/2-0.7:PI/2+0.7,-0.3);ear(HB,b,add3(b,S3([d*2.4,1.35,-0.9])),add3(b,S3([d*4.7,2.35,-1.3])),1.6*s,0.28*s,[d*0.3,0.3,1],(p,n)=>mix(c.ear,C('#2a2018'),ss(0.5,0.9,Math.abs(dot(sub3(p,b),[0,0.6,-0.3]))/(4.8*s))*0.6),(p,n)=>mix(c.inner,C('#e2d6c4'),0.25*ss(1.2*s,3.6*s,len3(sub3(p,b)))),{cup:1.5,n:7});});
          // wet rhinarium (glossy) with nostrils
          {const tip=gpt(FH,FH.length-0.15,PI/2+0.0),nc=add3(tip,S3([0,-0.05,-0.18]));const pc=(p)=>{const ax=Math.abs(p[0]-nc[0])/s,dy=(p[1]-nc[1])/s;return ax>0.32&&dy<0.1&&dy>-0.45?C('#040303'):mix(C('#1c1716'),C('#0e0b0a'),ss(0.1,-0.4,dy));};
            ball(HG,nc,0.62*s,[1.05,0.78,0.55],8,6,pc);}
          if(male)[-1,1].forEach(d=>{const r0=surf(FH,1.0,PI/2-d*0.38,-0.3),ac=(p)=>mix(C('#5a4630'),C('#d6c49c'),ss(38,49,p[1]));
            const P=[r0,add3(r0,[d*0.7,1.8,-0.9]),add3(r0,[d*2.0,5.0,-2.4]),add3(r0,[d*3.1,8.6,-2.8]),add3(r0,[d*3.6,11.6,-2.0])];tube(HH,P,[0.62,0.55,0.45,0.36,0.27],5,ac,{cap1:add3(r0,[d*3.7,13.2,-1.0]),ks:1});
            ball(HH,add3(r0,[0,0.1,0]),0.78,[1,0.6,1],6,3,C('#3e3226'));// burr
            const b1=lerp3(P[1],P[2],0.1);tube(HH,[b1,add3(b1,[d*0.4,1.4,1.9]),add3(b1,[d*0.6,3.0,3.3])],[0.36,0.28,0.17],5,ac,{cap1:add3(b1,[d*0.65,3.8,3.9]),ks:1});
            const b2=lerp3(P[3],P[4],0.3);tube(HH,[b2,add3(b2,[-d*0.4,1.5,-0.8]),add3(b2,[-d*0.6,3.0,-1.0])],[0.3,0.23,0.14],5,ac,{cap1:add3(b2,[-d*0.65,3.7,-0.9]),ks:1});});}},
      tail:{at:S3([0,23.5,-17.5]),P:[[0,23.6,-17.0],[0,23.1,-18.3],[0,21.4,-18.9],[0,19.8,-18.9]].map(S3),r:[0.85,1.05,0.95,0.55].map(v=>v*s),n:6,cap:S3([0,19.0,-18.8]),
        col:(p,n)=>mix(male?C('#2e2219'):C('#4a3626'),C('#f0e8da'),ss(0.15,-0.55,n[2])*0.92)},
      legs:{n:7,col:legCol,F:{x:3.4*s,at:[21.6*s,7.4*s],P:LF,cap0:S3([0,23.6,7.4])},B:{x:3.5*s,at:[22.2*s,-12.6*s],P:LB,cap0:S3([0,24.4,-12.6])}}});}

  /* ================= INDOCHINESE TIGER (6c: sculpted head, organic stripes, whiskers) ================= */
  function tiger(){const c={or:C('#c25d1a'),or2:C('#de8a3a'),wh:C('#efe8da'),bk:C('#1a1210'),nose:C('#c08070'),eye:C('#d8a024')};
    const stripe=(p,n,amp)=>{const w=vn3(p[0]*0.13,p[1]*0.13,p[2]*0.13,17)-0.5,w2=vn3(p[0]*0.45,p[1]*0.45,p[2]*0.45,19)-0.5;
      const u=p[2]*1.0+w*3.4+Math.abs(p[0])*0.1-(p[1]-14)*0.18;const f=0.5+0.5*Math.cos(u*3.7);const thr=0.74+0.16*(vn3(p[0]*0.25,p[1]*0.25,p[2]*0.25,23)-0.5)*2-w2*0.16;
      const brk=ss(0.22,0.36,vn3(p[0]*0.3,p[1]*0.55,p[2]*0.3,29));return ss(thr-0.025,thr+0.03,f)*brk*amp;};
    const bc=coat({side:c.or2,back:c.or,belly:c.wh,b0:-0.1,e0:-0.35,e1:-0.7,na:0.1,f:(k,p,n)=>{k=mix(k,c.wh,ss(9,12,p[2])*ss(0.2,0.7,n[2])*ss(16,13,p[1])*0.8);
      return mix(k,c.bk,stripe(p,n,ss(-0.62,-0.2,n[1])*ss(14.5,12.0,p[2])*0.95));}});
    const body=[[0,15.0,-16.0,1.8,1.8,2.0],[0,15.0,-14.8,4.2,3.6,4.2],[0,14.6,-11.6,5.0,4.4,5.0],[0,13.8,-6.0,4.8,4.2,5.0],[0,13.8,0,5.1,4.4,5.6],[0,14.4,5.0,5.4,4.8,6.0],[0,14.8,9.0,5.0,4.6,5.6],[0,15.2,11.8,4.0,3.8,4.4],[0,15.8,13.5,3.2,3.2,3.4]];
    const J=[0,15.8,13.4];
    const hr=[[0,16.6,12.1,2.05,2.05,2.2,2.2],[0,17.15,13.2,2.7,2.35,2.6,2.3],[0,17.3,14.4,2.95,2.3,2.75,2.4],[0,17.1,15.55,2.7,2.05,2.6,2.4],[0,16.8,16.7,2.3,1.72,2.3,2.3],[0,16.4,17.8,2.0,1.42,2.0,2.3],[0,16.05,18.7,1.8,1.15,1.72,2.4],[0,15.9,19.4,1.4,0.85,1.3,2.3]];
    const hmod=sculpt([[0.95,15.4,18.55,0.75,0.6,0.8,0.55,-0.2,0.6,0.42],[3.0,16.0,14.0,0.9,1.25,1.3,1,-0.35,-0.1,0.7],[1.3,18.75,16.35,0.7,0.3,0.6,0,1,0.6,0.2],[0,17.6,18.0,0.55,0.4,1.4,0,1,0,0.12],
      [0,14.6,18.2,0.8,0.4,0.6,0,-1,0.4,0.16],[1.35,15.1,17.7,0.35,0.15,0.5,-0.6,0.3,-0.3,0.16],[1.38,18.25,16.75,0.45,0.32,0.4,-0.3,-0.2,-0.6,0.14]]);
    const hc=(p,n,q)=>{const x=p[0],y=p[1],z=p[2],ax=Math.abs(x);let k=mix(c.or2,c.or,ss(0.2,0.9,n[1])*0.55);
      const wp=ss(16.2,15.6,y)*ss(16.8,17.6,z),chin=ss(-0.2,-0.55,n[1])*ss(15.5,16.4,z),cheek=ss(1.9,2.6,ax)*ss(16.95,16.15,y)*ss(12.9,13.9,z),
        eyeW=ss(0.5,0.25,Math.hypot((ax-1.2)*0.9,(y-18.85)*2.4,(z-16.5)*0.9))*0.8,inner=ss(0.5,0.22,Math.hypot(ax-0.95,y-17.95,z-17.15)),under=ss(0.5,0.25,Math.hypot((ax-1.6)*0.8,(y-17.75)*1.6,z-16.9));
      k=mix(k,c.wh,cl(Math.max(wp,chin,cheek*0.95,eyeW,inner*0.8,under*0.7)));
      let b=0;// black markings
      if(n[1]>0.45&&z>13.6&&z<16.6&&ax<1.7&&ax>0.1){const f=Math.cos((z-13.6)*5.2+ax*2.4+(vn3(x*1.2,y*1.2,z*1.2,5)-0.5)*1.6);b=Math.max(b,ss(0.62,0.78,f)*ss(1.7,1.2,ax)*ss(0.45,0.7,n[1]));}
      if(ax>1.6&&z>13.0&&z<16.4){for(let i=0;i<3;i++){const [d,t]=lineD(z,y,16.2-i*0.25,18.2-i*0.5,13.4,16.7-i*0.55);b=Math.max(b,ss(0.24*(1-t*0.5),0.1,d)*ss(-0.35,0.05,n[0]*(x>0?1:-1)));}}
      if(ax>2.4&&z<14.8){const f=Math.cos(z*4.2+y*1.4+vn3(x,y,z,7)*2);b=Math.max(b,ss(0.82,0.9,f)*ss(2.4,2.9,ax));}
      b=Math.max(b,ss(0.075,0.0,Math.abs(y-15.12-0.18*(ax-0.3)))*ss(17.3,17.9,z)*ss(0.25,0.4,ax)*ss(1.85,1.45,ax));// lip line
      if(wp>0.5&&ax>0.45&&ax<1.6&&y>15.35&&y<16.05){const gz=(z-17.8)*3.4,gy=(y-15.4)*4.2,dd=Math.hypot(gz-Math.round(gz),gy-Math.round(gy));b=Math.max(b,ss(0.2,0.1,dd)*0.6);}
      b=Math.max(b,ss(0.06,0.0,ax)*ss(15.25,15.45,y)*ss(15.95,15.75,y)*ss(18.9,19.2,z));// philtrum
      k=mix(k,c.bk,b);
      // nose pad
      const nz=ss(19.15,19.45,z)*ss(15.72,15.86,y)*ss(0.7-(y-15.75)*0.15,0.5-(y-15.75)*0.25,ax);k=mix(k,c.nose,nz);k=mix(k,C('#3a2220'),ss(0.0,0.5,nz)*ss(1,0.6,nz)*0.6);
      return fur(k,p,0.06,1,4);};
    const legCol=(p,n,q,f)=>{let k=mix(c.or2,c.wh,ss(0.25,0.75,-n[0]*(p[0]>0?1:-1)-(f?0:0.2))*ss(13,8,p[1])*0.95);k=mix(k,c.or,ss(0.5,0.9,n[2]*(f?1:0))*0.3);return fur(mix(k,c.wh,ss(1.3,0.3,p[1])*0.6),p,0.08,1,5);};
    const G=quad({kind:'tiger',bodyAt:[0,14.6,0],body,bodyN:12,bodyCol:bc,bodyCap0:[0,15,-16.6],
      head:{at:J,rings:hr,n:12,col:hc,mod:hmod,cap1:[0,15.98,19.78],cap0:[0,16.6,11.4],
        extra:(HB,FH,HG,HH)=>{const es=3.8,eth=0.52,er=0.33;[PI/2-eth,PI/2+eth].forEach((t,i)=>{const d=i?-1:1,p=surf(FH,es,t,-er*0.5),nn=gnorm(FH,es,t),out=nrm3(add3(add3(nn,[0,0,1.1]),[d*0.25,-0.2,0]));
            eyeBall(HG,p,er,out,c.eye,{pupil:[0.36,0.4],irisR:0.97,scl:C('#3a2a14')});spot(FH,es,t,er*1.12,C('#120c0a'),{soft:1.2});});
          [-1,1].forEach(d=>{const b=surf(FH,0.95,d>0?PI/2-0.62:PI/2+0.62,-0.3);ear(HB,b,add3(b,[d*0.62,0.72,-0.12]),add3(b,[d*0.9,1.45,-0.25]),1.55,0.26,[d*0.35,0.15,1],(p,n)=>mix(c.bk,c.wh,ss(0.75,0.35,Math.hypot(p[0]-b[0]-d*0.75,p[1]-b[1]-0.85))*ss(0.2,-0.3,n[2])),(p,n)=>mix(c.or,mix(c.or2,c.wh,0.6),ss(1.2,0.4,Math.hypot(p[0]-b[0]-d*0.5,p[1]-b[1]-0.6))),{cup:1.6,n:7});
            for(let k=0;k<7;k++){const r0=surf(FH,5.6+(k%3)*0.32,d>0?-0.05-0.11*(k>>1):PI+0.05+0.11*(k>>1),0.02),dir=nrm3([d*(1+0.15*k),0.25-0.12*k,0.45-0.1*k]);whisker(HG,r0,add3(r0,dir,3.2+0.5*hsh(k,d+3,1,2)),0.035,C('#f0ece4'));}});
          {const tip=gpt(FH,FH.length-0.1,PI/2),nc=add3(tip,[0,-0.08,-0.22]);ball(HG,nc,0.42,[1.3,0.6,0.55],8,5,(p)=>Math.abs(p[0])>0.26&&p[1]<nc[1]?C('#24120f'):C('#9c645a'));}}},
      tail:{at:[0,15.4,-15.6],build:(TB)=>{const P=[[0,15.5,-15.2],[0,14.4,-18.0],[0,10.6,-20.8],[0,6.6,-22.4],[0,4.2,-24.6],[0,4.5,-27.0]],FT=tube(TB,P,[1.1,1.0,0.9,0.82,0.76,0.72],6,(p,n)=>fur(mix(c.or2,c.or,ss(-0.2,0.6,n[1])*0.5),p,0.08,1,8),{cap1:[0,5.2,-27.8],cap0:P[0]});
        [1.3,2.05,2.8,3.5,4.2].forEach((s,i)=>ringBand(TB,FT,s,0.12+i*0.014,c.bk));ringBand(TB,FT,4.85,0.25,c.bk);}},
      legs:{n:7,col:legCol,F:{x:3.0,at:[14.6,8.0],P:[[0,14.6,8,2.3,3.0,3.2],[0,9.2,7.6,2.1,2.3,2.6],[0,4.6,8.2,1.5,1.6,1.7],[0,1.8,8.4,1.4,1.5,1.5],[0,0.6,9.0,1.6,1.8,1.4],[0,0,9.8,1.6,1.5,1.1]],cap0:[0,16.6,8]},
        B:{x:3.2,at:[15,-12],P:[[0,15,-12,2.6,3.6,3.5],[0,9.8,-10.6,2.3,2.8,2.4],[0,5.6,-13.4,1.3,1.2,1.6],[0,3.6,-14.2,1.1,1.0,1.3],[0,1.0,-13.0,1.2,1.3,1.2],[0,0,-11.6,1.45,1.55,1.1]],cap0:[0,17,-12]},
        extra:(LB,LH,FL,f,d)=>{if(!FL)return;const th0=d>0?0:PI;(f?[1.2,1.75]:[0.55,1.0,1.45,2.2]).forEach((s,i)=>bar(LB,FL,s,th0+0.9,s+0.06,th0-0.9,0.1,c.bk));}}});
    return G;}
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
    const hr=[[0,17.4,10.4,2.0,1.9,2.0],[0,17.8,11.7,3.0,2.35,2.3],[0,17.4,13.2,2.55,1.95,2.1],[0,17.0,13.95,2.05,1.55,1.85,2.4],[0,16.6,14.7,1.55,1.22,1.5,2.5],[0,16.25,16.1,1.32,1.1,1.25,2.6],[0,16.05,17.3,1.05,0.9,0.95,2.4]];
    const hc=(p,n,q)=>{let k=mix(c.side,c.back,ss(0.3,0.9,n[1])*0.75);const ax=Math.abs(p[0]);k=mix(k,c.belly,cl(ss(-0.25,-0.65,n[1])+ss(1.9,2.8,ax)*ss(17.8,16.6,p[1])*0.9));
      k=mix(k,c.muz,ss(0.55,0.95,n[1])*ss(13.6,14.6,p[2]));k=mix(k,c.belly,ss(0.75,0.4,Math.hypot(ax-1.95,p[1]-18.35,p[2]-12.9))*0.75);k=mix(k,c.dark,ss(0.5,0.2,Math.hypot(ax-1.6,p[1]-17.85,p[2]-13.6))*0.6);if(q.s>0.96||q.tip)k=c.nose;return fur(k,p,0.12,1,4);};
    const legCol=(p,n,q,f)=>{let k=mix(c.side,c.tan,ss(11,6,p[1]));k=mix(k,c.belly,ss(0.2,0.8,n[2]*(f?-1:1))*ss(12,5,p[1])*0.45);if(f)k=mix(k,c.dark,ss(0.55,0.95,n[2])*ss(8,5,p[1])*ss(2.5,4.5,p[1])*0.55);return fur(k,p,0.12,1,5);};
    return quad({kind:'wolf',bodyAt:[0,14.6,0],body,bodyN:12,bodyCol:bc,bodyCap0:[0,15.2,-11.3],
      head:{at:J,rings:hr,n:10,col:hc,mod:sculpt([[2.3,16.5,12.4,0.8,0.9,0.9,1,-0.3,-0.25,0.4],[1.0,18.6,13.1,0.5,0.25,0.5,0,1,0.4,0.14],[0.85,16.0,15.4,0.35,0.15,1.1,-0.4,0.3,0,0.06]]),cap1:[0,15.95,17.75],cap0:[0,17.6,9.7],nose:[0.62,[1.12,0.78,0.7],C('#1a1716')],
        extra:(HB,FH,HG,HH)=>{eyesIris(HG,FH,2.25,PI/2-0.5,0.26,C('#c8962e'),C('#0c0a08'));
          [-1,1].forEach(d=>{const b=surf(FH,1.2,d>0?PI/2-0.62:PI/2+0.62,-0.3);ear(HB,b,add3(b,[d*0.55,1.0,-0.25]),add3(b,[d*0.95,2.3,-0.55]),1.15,0.24,[d*0.35,0.15,1],c.dark,C('#6a5e50'),{cup:1.4,tipW:0.22});});}},
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
      head:{at:J,rings:hr,n:10,col:hc,cap1:[0,14.2,22.0],cap0:[0,16.5,12.1],nose:[0.78,[1.15,0.8,0.7],C('#161211')],eyes:[2.1,PI/2-0.52,0.36,C('#0b0807')],
        extra:(HB,FH,HG,HH)=>{[-1,1].forEach(d=>{const b=surf(FH,0.95,d>0?PI/2-0.72:PI/2+0.72,-0.5);ear(HB,b,add3(b,[d*1.3,1.4,-0.2]),add3(b,[d*2.1,2.7,-0.35]),2.6,0.42,[d*0.3,0.15,1],c.blk,C('#3a3230'),{cup:1.5,n:7});});}},
      tail:{at:[0,16,-16.2],P:[[0,16,-16],[0,15.6,-17],[0,14.8,-17.3]],r:[0.9,0.9,0.6],n:5,cap:[0,14.4,-17.2],col:c.blk},
      legs:{n:7,col:legCol,F:{x:4.3,at:[15,9],P:[[0,15,9,2.9,3.4,3.5],[0,9,9.2,2.6,2.8,2.9],[0,4,9.5,2.05,2.15,2.25],[0,1.6,9.7,2.05,2.3,2.05],[0,0,10.7,2.3,2.6,1.9]],cap0:[0,17.5,9]},
        B:{x:4.5,at:[15,-11.5],P:[[0,15,-11.5,3.3,4.2,4.4],[0,9.0,-11.0,2.8,3.1,3.0],[0,4.4,-12.3,2.05,2.0,2.45],[0,1.5,-12.0,2.05,2.5,2.05],[0,0,-10.5,2.25,3.1,1.85]],cap0:[0,17.5,-11.5]},
        extra:(LB,LH,FL,f,d)=>claws(LH,d,f?4.3:4.5,0.45,f?12.6:-7.6)}});}

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
  function poser(G,spec){G.userData._poserSpec=spec;const R=G.userData.rig,keys=['body','head','tail','legFL','legFR','legBL','legBR'],rest={};keys.forEach(k=>{const o=R[k];if(o)rest[k]={p:o.position.clone(),r:o.rotation.clone()};});
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
      const eb=surf(FH,1.15,PI/2-d*0.55,-0.2);spike(HB,eb,add3(eb,[0,0.95,0.3]),0.85,5,c.top,false);eyeBall(HG,add3(eb,[d*0.2,0.55,0.5]),0.36,[d,0.5,0.6],c.eye,{pupil:[0.12,0.62],irisR:0.95,lidC:c.top});});
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
    [-1,1].forEach(d=>{const p=surf(FH,1.55,d>0?0.55:PI-0.55,-0.08);eyeBall(HG,p,0.16,[d,0.4,0.3],C('#1a1512'),{pupil:[0.5,0.5],ws:6,lid:false});});put(head,HB,'a4Fur','fur');put(head,HG,'a4Gloss','gloss');
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
    [PI/2-0.75,PI/2+0.75].forEach(t=>{const p=surf(FH,CH?1.55:1.6,t,-0.08*s),o=sub3(p,J);eyeBall(HG,p,(CH?0.3:0.2)*s*(CH?2.0:1),o,CH?C('#2a1a10'):R?C('#c87018'):C('#b8801c'),{pupil:CH?[0.6,0.6]:[0.42,0.42],irisR:0.92,ws:6,lid:false});});
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
    [-1,1].forEach(d=>{const p=[d*0.62,1.62,1.45];ball(HB,p,0.36,[1,0.85,1],6,4,c.g2);eyeBall(HG,add3(p,[d*0.12,0.1,0.05]),0.3,[d,0.5,0.4],c.eye,{pupil:[0.6,0.3],irisR:0.95,lidC:c.g});});
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
    eyeBall(E,surf(FB,3.55,PI/2-0.85,-0.12),0.4,[1,0.15,0.25],C('#d8c890'),{pupil:[0.5,0.5],irisR:0.98,lid:false,ws:5});eyeBall(E,surf(FB,3.55,PI/2+0.85,-0.12),0.4,[-1,0.15,0.25],C('#d8c890'),{pupil:[0.5,0.5],irisR:0.98,lid:false,ws:5});
    
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
      head:{at:J,rings:young?hr.filter((r,i)=>i!==4):hr,n:young?6:10,col:hc,nose:[young?0.5*s*hs:0.52,[1.1,0.78,0.7],C('#1a1514')],cap1:scP(add3(S3(young?[0,14.0,12.6]:[0,13.95,13.3]),[0,dY,0]),hs,J),cap0:scP(add3(S3([0,15.4,6.7]),[0,dY,0]),hs,J),
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
  /* =============================== HUMANS: K3.char2 replacement =============================== */
  // shared textures (tileable 256², RepeatWrapping) + materials: skin · hide · weave · fur cloak · hair cards · eyes  (≤6 per model)
  const HT={};
  const tileTex=(key,tk,tint,mean,seam)=>{if(HT[key])return HT[key];const t=tile(tk),c=mkCanvas(TS,TS),g=c.getContext('2d'),im=g.createImageData(TS,TS),cn=mkCanvas(TS,TS),gn=cn.getContext('2d'),imn=gn.createImageData(TS,TS);
    for(let y=0;y<TS;y++)for(let x=0;x<TS;x++){const i=y*TS+x;let a=t.a[i]*mean,n0=t.n[i*3],n1=t.n[i*3+1],n2=t.n[i*3+2];
      let col=tint?tint(x,y,a):[a,a,a];
      if(seam){// stitched seams along the tile borders (hide panels sewn together)
        const ex=Math.min(x,TS-1-x),ey=999,e=ex,sd=e<2?0.82:e<4?0.94:1;col=col.map(v=>v*sd);
        const st=(ex<9&&ex>5&&(y%14)<8&&(y%14)>1);if(st)col=[0.9*mean*1.05,0.8*mean*1.02,0.62*mean];if(e<3){n0=128;n1=e<1.5?128:(y<TS/2?90:166);n2=230;}}
      im.data[i*4]=Math.min(255,col[0]*255);im.data[i*4+1]=Math.min(255,col[1]*255);im.data[i*4+2]=Math.min(255,col[2]*255);im.data[i*4+3]=255;imn.data[i*4]=n0;imn.data[i*4+1]=n1;imn.data[i*4+2]=n2;imn.data[i*4+3]=255;}
    g.putImageData(im,0,0);gn.putImageData(imn,0,0);const map=new T.CanvasTexture(c),nor=new T.CanvasTexture(cn);[map,nor].forEach(tx=>{tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.anisotropy=4;});return HT[key]={map,nor};};
  // hair/fringe strip atlas 256×512 RGBA: top half fine strands (v 0→0.5 root→tip), bottom half leather fringe strips (v 0.5→1)
  const hairTex=()=>{if(HT.hair)return HT.hair;const W=256,H=512,c=mkCanvas(W,H),g=c.getContext('2d'),im=g.createImageData(W,H),A=new Float32Array(W*H),L=new Float32Array(W*H).fill(0.55),R=RNG(77);
    // locks: clumps of strands converging to a pointed tip; gaps between locks
    const NC=22;for(let cI=0;cI<NC;cI++){const xc=(cI+0.5)*W/NC+(R()-0.5)*4,wc=4.5+R()*3.5,len=(0.6+R()*0.4)*250,bend=(R()-0.5)*10,ns=26;
      for(let k=0;k<ns;k++){const o=(R()-0.5)*2,lum=0.55+R()*0.5,sl=len*(0.75+R()*0.25);for(let y=0;y<sl;y++){const f=y/len,conv=1-0.85*Math.pow(f,1.3),x=Math.round(xc+o*wc*conv+bend*f*f+Math.sin(f*5+k)*0.6);const a=f<0.8?1:Math.max(0,1-(f-0.8)/0.2*(y/sl));
          const i=y*W+((x%W)+W)%W;if(a>A[i]){A[i]=a;L[i]=lum*(0.75+0.35*f);}}}}
    for(let y=0;y<40;y++)for(let x=0;x<W;x++){const i=y*W+x;if(A[i]<0.9){A[i]=Math.max(A[i],0.95-y/40);L[i]=0.5;}}// root fill
    for(let y=0;y<14;y++)for(let x=0;x<W;x++){const i=y*W+x;A[i]*=Math.min(1,0.15+y/14+0.5*hsh(x,y,3,4));}// soft roots
    for(let k=0;k<26;k++){const x0=k*W/26+R()*2,wd=5+R()*3,len=(0.72+R()*0.28)*250;for(let y=0;y<len;y++)for(let x=Math.floor(x0);x<x0+wd;x++){const i=(256+y)*W+(x%W);const e=Math.min(x-x0,x0+wd-x);A[i]=1;L[i]=0.75+0.2*(e>1?1:0.6)-0.1*(y/len)+(hsh(x,y,k,3)-0.5)*0.12;}}
    for(let y=256;y<262;y++)for(let x=0;x<W;x++){const i=y*W+x;A[i]=1;L[i]=0.7;}
    for(let i=0;i<W*H;i++){const l=Math.min(1,L[i]);im.data[i*4]=l*255;im.data[i*4+1]=l*255;im.data[i*4+2]=l*255;im.data[i*4+3]=Math.round(A[i]*255);}g.putImageData(im,0,0);
    const map=new T.CanvasTexture(c);map.anisotropy=8;map.flipY=false;map.wrapS=T.RepeatWrapping;return HT.hair=map;};
  const HM={};
  const hmat=(k)=>{if(HM[k])return HM[k];let m;
    if(k==='skin'){const t=tileTex('skin','hskin',(x,y,a)=>{const n=pn(x,y,12,301)-0.5,r=pn(x,y,40,302)-0.5;return [a*(1+n*0.06+r*0.03),a*(1-n*0.01),a*(1-n*0.05-r*0.02)];},0.94);
      m=pmat('h6Skin',{map:t.map,normalMap:t.nor,normalScale:new T.Vector2(0.35,0.35),roughness:0.58,sheen:0.5,sheenRoughness:0.45,sheenColor:new T.Color('#c87a5a').multiplyScalar(0.3),clearcoat:0.06,clearcoatRoughness:0.5});}
    else if(k==='hide'){const t=tileTex('hide','hide',(x,y,a)=>[a,a*0.98,a*0.94],0.9,true);m=pmat('h6Hide',{map:t.map,normalMap:t.nor,normalScale:new T.Vector2(0.5,0.5),roughness:0.86,sheen:0.4,sheenRoughness:0.6,sheenColor:new T.Color('#ffe8cc').multiplyScalar(0.18),side:T.DoubleSide});}
    else if(k==='weave'){const t=tileTex('weave','weave',(x,y,a)=>[a,a*0.98,a*0.93],0.92);m=pmat('h6Weave',{map:t.map,normalMap:t.nor,normalScale:new T.Vector2(0.8,0.8),roughness:0.92,sheen:0.3,sheenRoughness:0.7,sheenColor:new T.Color('#fff2dc').multiplyScalar(0.15),side:T.DoubleSide});}
    else if(k==='furc'){const t=tileTex('furc','fur',(x,y,a)=>[a,a,a],0.95);m=pmat('h6Fur',{map:t.map,normalMap:t.nor,normalScale:new T.Vector2(0.9,0.9),roughness:0.92,sheen:0.7,sheenRoughness:0.5,sheenColor:new T.Color('#ffffff').multiplyScalar(0.18),side:T.DoubleSide});}
    else if(k==='hair'){m=pmat('h6Hair',{map:hairTex(),alphaTest:0.38,side:T.DoubleSide,roughness:0.62,sheen:0.5,sheenRoughness:0.35,sheenColor:new T.Color('#ffffff').multiplyScalar(0.1)});}
    else if(k==='eye'){m=pmat('h6Eye',{roughness:0.18,clearcoat:1,clearcoatRoughness:0.03,envMap:envCube(),envMapIntensity:1.5});}
    else m=pmat('h6Hard',{roughness:0.45});
    return HM[k]=m;};
  /* ---- soup with uv + per-vertex colour (+ optional explicit normals) ---- */
  function HS(){this.m={};}
  HS.prototype.g=function(k){return this.m[k]||(this.m[k]={p:[],c:[],u:[],n:[]});};
  HS.prototype.t=function(k,a,b,c,ca,cb,cc,ua,ub,uc,na,nb,nc){const g=this.g(k);g.p.push(a,b,c);g.c.push(ca,cb||ca,cc||ca);g.u.push(ua||[0,0],ub||[0,0],uc||[0,0]);g.n.push(na||null,nb||null,nc||null);return this;};
  // grid: rows of points (P[r][j]), colours C, uvs U, outward reference fn(r)→point; winding chosen by majority so the whole sheet is consistent
  HS.prototype.grid=function(k,P,Cc,U,ref,N,flip){const R=P.length,J=P[0].length;let sgn=0;
    for(let r=0;r<R-1;r++)for(let j=0;j<J-1;j++){const a=P[r][j],b=P[r][j+1],c=P[r+1][j+1],d=P[r+1][j],n=crs(sub3(c,a),sub3(d,b)),m=mul(add3(add3(a,b),add3(c,d)),0.25),o=sub3(m,ref(r,j));sgn+=Math.sign(dot(n,o));}
    const f=(sgn<0)!==!!flip;
    for(let r=0;r<R-1;r++)for(let j=0;j<J-1;j++){const ia=[r,j],ib=[r,j+1],ic=[r+1,j+1],id=[r+1,j];const V=q=>P[q[0]][q[1]],Co=q=>Cc[q[0]][q[1]],Uv=q=>U?U[q[0]][q[1]]:[0,0],No=q=>N?N[q[0]][q[1]]:null;
      const tri=(x,y,z)=>{const A=V(x),B=V(y),Cq=V(z);if(len3(crs(sub3(B,A),sub3(Cq,A)))<1e-9)return;if(f)this.t(k,A,Cq,B,Co(x),Co(z),Co(y),Uv(x),Uv(z),Uv(y),No(x),No(z),No(y));else this.t(k,A,B,Cq,Co(x),Co(y),Co(z),Uv(x),Uv(y),Uv(z),No(x),No(y),No(z));};
      tri(ia,ib,ic);tri(ia,ic,id);}return this;};
  HS.prototype.to=function(grp,crease){const cc=Math.cos((crease||70)*PI/180);for(const k in this.m){const g=this.m[k],n=g.p.length;if(!n)continue;const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3),uv=new Float32Array(n*2);
      const FN=[],map=new Map();for(let i=0;i<n;i+=3){const fn=crs(sub3(g.p[i+1],g.p[i]),sub3(g.p[i+2],g.p[i]));FN.push(fn);for(let q=0;q<3;q++){const kk=KQ(g.p[i+q]);let a=map.get(kk);if(!a)map.set(kk,a=[]);a.push(i/3);}}
      for(let i=0;i<n;i++){const p=g.p[i],f=(i/3)|0,fn=nrm3(FN[f]);let nn;if(g.n[i])nn=g.n[i];else{let s=[0,0,0];for(const o of map.get(KQ(p))){const on=FN[o],l=len3(on)||1;if(dot(fn,mul(on,1/l))>=cc)s=add3(s,on);}nn=nrm3(len3(s)>1e-12?s:fn);}
        pos[i*3]=p[0];pos[i*3+1]=p[1];pos[i*3+2]=p[2];nor[i*3]=nn[0];nor[i*3+1]=nn[1];nor[i*3+2]=nn[2];const c=g.c[i];col[i*3]=c[0];col[i*3+1]=c[1];col[i*3+2]=c[2];uv[i*2]=g.u[i][0];uv[i*2+1]=g.u[i][1];}
      const ge=new T.BufferGeometry();ge.setAttribute('position',new T.BufferAttribute(pos,3));ge.setAttribute('normal',new T.BufferAttribute(nor,3));ge.setAttribute('color',new T.BufferAttribute(col,3));ge.setAttribute('uv',new T.BufferAttribute(uv,2));
      const me=new T.Mesh(ge,hmat(k));me.castShadow=true;me.receiveShadow=true;me.userData.part=k;grp.add(me);}this.m={};return grp;};
  /* ---- ring lofts (human.js ring format {y,xn,xp,zf,zb,cx,cz,p}) with adaptive ring insertion, uv in tile units ---- */
  const hsp=(v,p)=>v<0?-Math.pow(-v,2/p):Math.pow(v,2/p);
  const HRG=(y,hx,zf,zb,o)=>Object.assign({y,xn:hx,xp:hx,zf,zb,cx:0,cz:0,p:2.4},o||{});
  const hrp=(r,u)=>{const s=Math.sin(u),c=Math.cos(u);return [r.cx+(s>=0?r.xp:r.xn)*hsp(s,r.p),r.y,r.cz+(c>=0?r.zf:r.zb)*hsp(c,r.p)];};
  const HK=['y','xn','xp','zf','zb','cx','cz','p'];
  function hrings(rs,maxStep){const out=[];for(let j=0;j<rs.length-1;j++){const a=rs[j],b=rs[j+1],k=Math.max(1,Math.ceil(Math.abs(b.y-a.y)/(maxStep||1)));for(let q=0;q<k;q++){const f=q/k;if(q===0){out.push(Object.assign({},a,{src:j}));continue;}
      const o={src:j+f};HK.forEach(K=>o[K]=mono(rs[Math.max(0,j-1)][K],a[K],b[K],rs[Math.min(rs.length-1,j+2)][K],f));out.push(o);}}out.push(Object.assign({},rs[rs.length-1],{src:rs.length-1}));return out;}
  // o: {n, step, key(jSrc)→material|null, col(p,u,r)→rgb, mod(p,u,r)→p, cap0, cap1 (point|true), td (tile du), map(p)→p, us:[angles]}
  function hloft(S,rs,o){const n=o.n||12,R=hrings(rs,o.step||1),td=o.td||6,us=o.us||Array.from({length:n},(_,j)=>TAU*j/n);
    const M2=o.map||(p=>p),P=[],Cc=[],U=[];let acc=0,per=0;
    R.forEach((r,ri)=>{const row=[],cr=[],ur=[];for(let j=0;j<=n;j++){const u=us[j%n]+(j===n?TAU:0);let p=hrp(r,u);if(o.mod)p=o.mod(p,u,r);row.push(M2(p));cr.push(o.col?o.col(p,u,r):[1,1,1]);}
      if(ri>0){const a=R[ri-1],c0=[a.cx,a.y,a.cz],c1=[r.cx,r.y,r.cz];acc+=len3(sub3(M2(c1),M2(c0)));}let pm=0;for(let j=0;j<n;j++)pm+=len3(sub3(row[j+1],row[j]));per=Math.max(per,pm);row.acc=acc;P.push(row);Cc.push(cr);});
    const ku=Math.max(1,Math.round(per/td));P.forEach((row,ri)=>{U.push(row.map((p,j)=>[j/n*ku,row.acc/td]));});
    // caps: one dome ring + tip
    const capRow=(ri,tip,inw)=>{const r=R[ri],c=M2([r.cx,r.y,r.cz]),tp=tip===true?c:M2(tip),row=P[ri].map(p=>add3(lerp3(c,tp,0.62),sub3(p,c),0.72)),tr=P[ri].map(()=>tp);return [row,tr];};
    const keyOf=(ri)=>o.key?o.key(R[ri].src):o.k;
    const emit=(rows,cols,uvs,k,refFn)=>{if(k)S.grid(k,rows,cols,uvs,refFn);};
    for(let ri=0;ri<R.length-1;ri++){const k=keyOf(ri);if(!k)continue;const a=R[ri],b=R[ri+1];emit([P[ri],P[ri+1]],[Cc[ri],Cc[ri+1]],[U[ri],U[ri+1]],k,()=>M2([(a.cx+b.cx)/2,(a.y+b.y)/2,(a.cz+b.cz)/2]));}
    const L=R.length-1;
    if(o.cap0){const [d1,tp]=capRow(0,o.cap0),k=o.capKey0||keyOf(0),r=R[0],c0=M2([r.cx,r.y,r.cz]),c1=M2([R[1].cx,R[1].y,R[1].cz]),inn=lerp3(c0,c1,0.5);emit([P[0],d1,tp],[Cc[0],Cc[0],Cc[0]],[U[0],U[0],U[0]],k,()=>inn);}
    if(o.cap1){const [d1,tp]=capRow(L,o.cap1),k=o.capKey1||keyOf(L-1),r=R[L],c0=M2([r.cx,r.y,r.cz]),c1=M2([R[L-1].cx,R[L-1].y,R[L-1].cz]),inn=lerp3(c0,c1,0.5);emit([P[L],d1,tp],[Cc[L],Cc[L],Cc[L]],[U[L],U[L],U[L]],k,()=>inn);}
    return {P,R};}
  // smooth tube along a path with radii [rx,ry] (for fingers, toes, braids, ties); col fn(p,t)
  function htube(S,k,pts,rad,n,col,o){o=o||{};const P=[],Cc=[],U=[],L=pts.length;let acc=0;const up0=o.up||[0,0,1];let prevE1=null;
    for(let j=0;j<L;j++){const a=pts[Math.max(0,j-1)],b=pts[Math.min(L-1,j+1)],d=nrm3(sub3(b,a));let ax=prevE1||(Math.abs(dot(d,up0))>0.9?[1,0,0]:up0);let e1=nrm3(sub3(ax,mul(d,dot(ax,d))));if(len3(e1)<1e-6)e1=nrm3(crs(d,[1,0,0]));const e2=crs(d,e1);prevE1=e1;
      if(j>0)acc+=len3(sub3(pts[j],pts[j-1]));const r=Array.isArray(rad[j])?rad[j]:[rad[j],rad[j]],row=[],cr=[],ur=[];for(let i=0;i<=n;i++){const u=TAU*i/n+(o.twist||0)*j;const p=add3(add3(pts[j],e1,Math.cos(u)*r[0]),e2,Math.sin(u)*r[1]);row.push(p);cr.push(col?col(p,j/(L-1)):[1,1,1]);ur.push(o.uv?o.uv(i/n,acc,j):[i/n,acc/(o.td||3)]);}
      P.push(row);Cc.push(cr);U.push(ur);}
    S.grid(k,P,Cc,U,(r)=>lerp3(pts[r],pts[Math.min(L-1,r+1)],0.5));
    const cap=(j,jn,tp)=>{const row=P[j],c=pts[j],t=tp||add3(c,nrm3(sub3(c,pts[jn])),Math.max(...(Array.isArray(rad[j])?rad[j]:[rad[j]]))*0.7),tr=row.map(()=>t);S.grid(k,[row,tr],[Cc[j],Cc[j]],[U[j],U[j]],()=>lerp3(c,pts[jn],0.5));};
    if(o.cap0!==false)cap(0,1,o.tip0);if(o.cap1!==false)cap(L-1,L-2,o.tip1);return P;}
  // ellipsoid (lat-long) with colour fn
  function hball(S,k,c,r,sc,ws,hs,col,o){o=o||{};const P=[],Cc=[],U=[];for(let j=0;j<=hs;j++){const v=PI*j/hs,row=[],cr=[],ur=[];for(let i=0;i<=ws;i++){const u=TAU*i/ws;const d=[Math.sin(v)*Math.sin(u),Math.cos(v),Math.sin(v)*Math.cos(u)];let p=[c[0]+d[0]*r*sc[0],c[1]+d[1]*r*sc[1],c[2]+d[2]*r*sc[2]];if(o.rot)p=o.rot(p);row.push(p);cr.push(col?col(p,d):[1,1,1]);ur.push([i/ws*(o.ku||1),j/hs*(o.kv||1)]);}P.push(row);Cc.push(cr);U.push(ur);}
    S.grid(k,P,Cc,U,()=>o.rot?o.rot(c):c);}
  // hair/fringe card: centre path pts, outward normals nn, half-widths w, uv window [u0,u1] and v range [v0,v1] (hair 0..0.5, fringe 0.5..1)
  function hcard(S,pts,nn,w,col,u0,u1,v0,v1,k,curl){const L=pts.length,nc=curl?3:2,P=[],Cc=[],U=[],N=[];for(let q=0;q<nc;q++){P.push([]);Cc.push([]);U.push([]);N.push([]);}
    for(let j=0;j<L;j++){const d=nrm3(sub3(pts[Math.min(L-1,j+1)],pts[Math.max(0,j-1)])),sd=nrm3(crs(d,nn[j])),v=v0+(v1-v0)*j/(L-1);const cj=Array.isArray(col[0])?col[j]:col;
      for(let q=0;q<nc;q++){const t=nc===2?(q?1:-1):(q-1),drop=curl?curl*w[j]*Math.abs(t):0;P[q].push(add3(add3(pts[j],sd,t*w[j]),nn[j],-drop));Cc[q].push(cj);U[q].push([u0+(u1-u0)*(t+1)/2,v]);N[q].push(curl?nrm3(add3(nn[j],sd,t*0.55)):nn[j]);}}
    const g=S.g(k||'hair');for(let q=0;q<nc-1;q++)for(let j=0;j<L-1;j++){const A=[q,j],B=[q+1,j],Cq=[q+1,j+1],D=[q,j+1],ps=x=>P[x[0]][x[1]],cs=x=>Cc[x[0]][x[1]],us=x=>U[x[0]][x[1]],ns=x=>N[x[0]][x[1]];
      [[A,B,Cq],[A,Cq,D]].forEach(t=>{t.forEach(x=>{g.p.push(ps(x));g.c.push(cs(x));g.u.push(us(x));g.n.push(ns(x));});});}}

  /* ---------- head ---------- */
  const HEAD0=[[5.95,.2,.05,.35],[5.64,1.0,.86,1.38],[5.1,1.42,1.42,1.9],[4.42,1.58,1.7,2.1],[3.86,1.6,1.86,2.07],[3.4,1.58,1.63,1.98],[2.85,1.55,1.73,1.76],[2.3,1.38,1.7,1.36],[1.76,1.18,1.57,.86],[1.26,.74,1.43,.32],[1.03,.36,1.02,.16]];
  const HEADY=[5.95,5.78,5.45,5.05,4.6,4.12,3.95,3.85,3.76,3.66,3.56,3.47,3.38,3.29,3.2,3.1,2.98,2.86,2.76,2.67,2.59,2.52,2.45,2.39,2.345,2.305,2.265,2.215,2.15,2.06,1.94,1.79,1.62,1.35,1.08];
  const headU=(N)=>Array.from({length:N},(_,j)=>{const t=j/N;return TAU*t-0.78*Math.sin(TAU*t);});
  const gss=(x,c,w)=>Math.exp(-((x-c)/w)*((x-c)/w));
  function headModel(o){const fem=o.fem,kf=fem?0.88:1,bald=o.bald;
    const prof=(y)=>{const T0=HEAD0;let j=0;while(j<T0.length-2&&y<T0[j+1][0])j++;const a=T0[j],b=T0[j+1],f=cl((a[0]-y)/((a[0]-b[0])||1)),gk=(i)=>{let v=mono(T0[Math.max(0,j-1)][i],a[i],b[i],T0[Math.min(T0.length-1,j+2)][i],f);
        if(fem){if(i===1&&y<2.6)v*=1-0.07*ss(2.6,1.6,y);if(i===2&&y>3.6&&y<4.1)v-=0.06;}return v;};return {xh:gk(1),zf:gk(2),zb:gk(3)};};
    const base=(u,y)=>{const r=prof(y),s=Math.sin(u),c=Math.cos(u);return [r.xh*hsp(s,2.5),y,(c>=0?r.zf:r.zb)*hsp(c,2.5)];};
    const zFront=(x,y)=>{const r=prof(y),q=Math.min(0.999,Math.abs(x)/r.xh);return r.zf*Math.pow(1-Math.pow(q,2.5),0.4);};
    const EY=3.4,EX=fem?0.6:0.62,ER=fem?0.29:0.3,ezc=zFront(EX,EY)-ER*0.86;
    const eyeC=[EX,EY,ezc];
    // displacement of the front surface → features; returns [p, masks]
    const disp=(u,y)=>{let p=base(u,y);const x=p[0],ax=Math.abs(x),sx=x<0?-1:1,cu=Math.cos(u),fw=ss(0.05,0.55,cu);if(fw<=0)return [p,{}];let dz=0,dx=0;const M={};
      // brow ridge + glabella
      dz+=(fem?0.06:0.13)*gss(y,3.86,0.16)*ss(1.4,0.5,ax)-0.035*gss(y,3.72,0.1)*gss(x,0,0.18);
      // nose
      let nh=0;if(y<3.78&&y>2.45){if(y>3.3)nh=0.03+0.12*((3.78-y)/0.48);else if(y>2.84)nh=0.15+0.31*Math.pow((3.3-y)/0.46,1.15);else{const t=(2.84-y)/0.36;nh=0.46*Math.max(0,Math.cos(Math.min(1,t)*PI/2))*(1-0.15*t);}}
      nh*=fem?0.88:1.05;const nw=0.15+0.11*cl((3.78-y)/1.0)+0.05*gss(y,2.8,0.12);dz+=nh*Math.exp(-Math.pow(ax/nw,2.4));
      dz+=0.16*gss(ax,0.27,0.11)*gss(y,2.74,0.11)*(fem?0.85:1);// alae
      dx+=0.04*gss(ax,0.3,0.1)*gss(y,2.74,0.1);
      // cheekbones, under-eye, temple
      dz+=0.08*gss(ax,1.0,0.32)*gss(y,3.02,0.24);dx+=0.06*gss(ax,1.15,0.3)*gss(y,3.05,0.25);dz-=0.03*gss(ax,0.62,0.22)*gss(y,3.1,0.08);dx-=0.04*gss(ax,1.45,0.2)*gss(y,3.95,0.3);
      // mouth: upper lip, philtrum, lip line, lower lip, sulcus, chin
      const lw=fem?0.4:0.43,lm=ss(lw+0.07,lw-0.12,ax);dz+=0.05*gss(y,2.42,0.11)*ss(0.6,0.2,ax)-0.018*gss(x,0,0.07)*gss(y,2.5,0.08);
      dz+=(fem?0.08:0.055)*gss(y,2.35,0.04)*lm;dz-=0.06*gss(y,2.305,0.03)*ss(lw+0.1,lw-0.15,ax);dz+=(fem?0.11:0.085)*gss(y,2.225,0.055)*lm;dz-=0.025*gss(y,2.07,0.07)*ss(0.5,0.2,ax);
      dz+=(fem?0.07:0.11)*gss(y,1.62,0.24)*ss(0.6,0.15,ax);dx+=(fem?0:0.05)*gss(y,1.9,0.35)*ss(0.6,1.0,ax);
      // eye socket / lids around the eyeball
      const ex=ax-EX,ey=y-EY+0.03*(ex/0.36),aw=fem?0.355:0.34,a=(ex/aw)*(ex/aw)+(ey/(ey>0?0.122:0.088))*(ey/(ey>0?0.122:0.088)),dd=ex*ex+(y-EY)*(y-EY);
      let z=p[2]+dz*fw;{const r=Math.sqrt(ex*ex*0.8+(y-EY)*(y-EY));if(r<0.6){const zt=ezc+(y<EY?0.2:0.13)+(y<EY?0.08:0.15)*ss(0.25,0.5,r);z=Math.min(z,lerp(zt,z,ss(0.42,0.6,r)));}}
      M.lid=0;M.lidLo=0;M.socket=ss(ER*ER*2.4,ER*ER*0.8,dd);
      M.lip=(ss(2.43,2.39,y)*ss(2.29,2.32,y)+ss(2.31,2.28,y)*ss(2.11,2.16,y))*ss(lw+0.04,lw-0.08,ax)*fw;M.nose=gss(y,2.82,0.18)*ss(0.35,0.1,ax)*fw;M.nostril=gss(ax,0.14,0.05)*gss(y,2.61,0.03)*fw*0.6;
      M.cheek=gss(ax,1.0,0.35)*gss(y,2.9,0.3)*fw;M.brow=gss(y,3.86,0.2)*ss(1.4,0.4,ax)*fw;
      return [[x+sx*dx*fw,y,z],M];};
    function lerp(a,b,t){return a+(b-a)*t;}
    return {disp,base,prof,zFront,eyeC,ER,EY};}
  const hairline=(hs,fem)=>{const A=hs===1?[[0,4.62],[0.5,4.5],[1.1,4.15],[1.45,3.95],[1.7,3.4],[2.2,2.35],[PI,2.05]]:[[0,4.95],[0.55,4.7],[1.15,4.12],[1.45,3.95],[1.75,3.3],[2.2,2.3],[PI,fem?1.8:2.0]];
    return u=>{const a=Math.abs(((u+PI)%TAU+TAU)%TAU-PI);for(let i=0;i<A.length-1;i++){if(a<=A[i+1][0]){const t=(a-A[i][0])/(A[i+1][0]-A[i][0]);return A[i][1]+(A[i+1][1]-A[i][1])*t;}}return A[A.length-1][1];};};

  /* ---------- the builder ---------- */
  const OLD2=K.char2;if(OLD2)K.char2Old=OLD2;
  // only replace when human.js is initialised (its K.char2Pose/char2Equip/char2Neutral drive the shared skeleton)
  if(OLD2&&K.char2Pose)K.char2=(o)=>{o=o||{};const fem=o.sex?o.sex==='f':!!o.fem,bw=Math.min(1.15,Math.max(0.85,o.build||1)),bz=1+(bw-1)*0.6,h=fem?0.955:1,F=fem?1:0;
    const skinH=o.skin||'#b07a52',hasTop=!o.bare||fem,topH=o.top||'#8a5a33',top2H=o.top2||(o.belt&&o.belt)||'#'+new T.Color(topH).offsetHSL(0,0,-0.12).getHexString(),botH=(typeof o.skirt==='string'&&o.skirt)||o.bottom||'#'+new T.Color(topH).offsetHSL(0,0,-0.16).getHexString();
    const hairH=o.hair||'#1e1410',bald=o.hs==='bald'||o.hs==='none',hs=o.hairStyle!=null?(o.hairStyle|0)%3:({wild:1,short:1,braid:2,bun:0,long:0}[o.hs]??(fem?0:1));
    const beard=!fem&&!!o.beard,sleeves=hasTop&&o.sleeves!==false,longSl=o.sleeves==='long',boots=o.boots||null,cloak=o.cloak||null,skirtLook=!!o.skirt||fem;
    const seed=Math.floor(hsh(Math.round(new T.Color(skinH).getHex()),Math.round(new T.Color(hairH).getHex()),hs+(fem?7:0),beard?3:1)*1e6);const Rn=RNG(seed+11);
    const SK=mul(C(skinH),1/0.94),HC=C(hairH),TOP=mul(C(topH),1/0.9),TOP2=mul(C(top2H),1/0.9),BOT=mul(C(botH),1/(skirtLook?0.92:0.9)),BOOT=mul(C(boots||top2H),1/0.9),CLK=mul(C(cloak||topH),1/0.95),CLK2=mul(C(o.cloak2||(cloak&&'#'+new T.Color(cloak).offsetHSL(0,0,-0.12).getHexString())||top2H),1/0.95);
    const lipC=mix(SK,C('#8a3c34'),fem?0.55:0.38),redC=mix(SK,C('#b05040'),0.35),darkSk=mul(SK,0.72),botK=skirtLook&&!o.bottom?'weave':(o.skirt?'weave':'hide');
    // skin tint: subtle blotches + extremity redness
    const skinAt=(p,red)=>{let k=mul(SK,0.96+0.08*vn3(p[0]*0.6,p[1]*0.6,p[2]*0.6,seed%997));if(red)k=mix(k,redC,red);return k;};
    const G=new T.Group();G.name='char2';
    const hips=new T.Group(),torso=new T.Group(),head=new T.Group();hips.name='hips';torso.name='torso';head.name='head';
    hips.position.set(0,17.6*h,0);hips.scale.setScalar(h);G.add(hips);torso.position.set(0,3.2,0);hips.add(torso);head.position.set(0,9.3,-0.15);torso.add(head);
    const SH=(fem?2.95:3.3)*bw,HX=(fem?1.68:1.55)*Math.sqrt(bw);const parts=[];const soup=(grp,cr)=>{const S=new HS();parts.push([S,grp,cr]);return S;};
    /* ===== HEAD ===== */
    const HD=headModel({fem,bald}),hS=soup(head,62),hl=hairline(hs,fem);
    {const us=headU(16),Pg=[],Cg=[],Ug=[];HEADY.forEach((y,ri)=>{const row=[],cr=[],ur=[];for(let j=0;j<=us.length;j++){const u=j<us.length?us[j]:us[0]+TAU;const [p,Mk]=HD.disp(u,y);row.push(p);
        let k=skinAt(p,0.1*(Mk.cheek||0)+0.08*(Mk.nose||0));if(Mk.lip)k=mix(k,lipC,Mk.lip);if(Mk.nostril)k=mix(k,mul(SK,0.35),Mk.nostril*0.9);if(Mk.socket)k=mix(k,mix(SK,C('#5a3428'),0.25),Mk.socket*0.35);
        if(Mk.lid)k=mix(k,mix(HC,C('#120c0a'),0.5),Mk.lid*0.9);if(Mk.lidLo)k=mix(k,mul(SK,0.6),Mk.lidLo*0.6);
        if(!bald){const hy=hl(u);k=mix(k,mul(HC,0.55),ss(hy-0.2,hy+0.06,y));}
        if(beard||(!fem&&!bald)){const bt=Math.abs(Math.sin(u))<0.95&&Math.cos(u)>-0.2?1:0;const reg=bt*ss(3.0,2.6,y)*ss(1.0,1.35,y)*(1-ss(0.25,0.0,Math.abs(y-2.3)-0.05)*ss(0.5,0.3,Math.abs(p[0])))*ss(-0.2,0.1,Math.cos(u));k=mix(k,mix(SK,HC,0.6),reg*(beard?0.75:0.18));}
        cr.push(k);ur.push([j/us.length*5,y/1.6]);}Pg.push(row);Cg.push(cr);Ug.push(ur);});
      hS.grid('skin',Pg,Cg,Ug,(r)=>[0,HEADY[r],-0.25]);
      // crown cap + chin-to-neck cap
      const top=[0,6.0,-0.12],rowT=Pg[0];hS.grid('skin',[rowT,rowT.map(p=>add3(lerp3(top,p,0.55),[0,0.03,0])),rowT.map(()=>top)],[Cg[0],Cg[0],Cg[0]],[Ug[0],Ug[0],Ug[0]],()=>[0,5.0,-0.2]);
      const bot=[0,1.15,-0.4],rowB=Pg[Pg.length-1];hS.grid('skin',[rowB,rowB.map(()=>bot)],[Cg[Cg.length-1],Cg[Cg.length-1]],[Ug[Ug.length-1],Ug[Ug.length-1]],()=>[0,2.0,-0.3]);}
    // eyes (glossy balls: sclera, iris, pupil)
    const hrS=soup(head,90),eS=soup(head,80),irisC=C(o.eye||['#3a2414','#2a1a10','#4a2e18'][seed%3]);
    [-1,1].forEach(s=>{const c=[s*HD.eyeC[0],HD.eyeC[1],HD.eyeC[2]],ER=HD.ER,Rl=ER*1.07,ex=[s,0,0],ey=[0,1,0],ez=[0,0,1],aw=(fem?0.31:0.3),hU=fem?0.115:0.1,hL=fem?0.085:0.075;
      // almond margins (lateral X → height on the eyeball); outer corner slightly raised
      const mU=X=>{const t=Math.abs(X)/aw;return t>=1?0.012*s*0:hU*Math.pow(1-t*t,0.75)+0.012*(X/aw);},mL=X=>{const t=Math.abs(X)/aw;return t>=1?0:-hL*Math.pow(1-t*t,0.8)+0.012*(X/aw);};
      const lid=(up)=>{const NX=7,NR=3,P=[],Cc=[],U=[],Nn=[];for(let r=0;r<=NR;r++){const row=[],cr=[],ur=[],nr=[];for(let i=0;i<=NX;i++){const X=(i/NX*2-1)*Rl*0.97,rc=Math.sqrt(Math.max(1e-4,Rl*Rl-X*X));
            const m=Math.max(-0.98,Math.min(0.98,(up?Math.max(mU(X),mL(X)+0.004):Math.min(mL(X),mU(X)-0.004))/rc));const f0=Math.asin(m),f1=up?1.3:-0.85,f=f0+(f1-f0)*Math.pow(r/NR,1.2);const rad=r===0?ER*1.01:Rl*(1+(up?0.16:0.05)*Math.pow(r/NR,1.6));
            const rc2=Math.sqrt(Math.max(1e-4,rad*rad-X*X));const p=add3(add3(add3(c,ex,X),ey,rc2*Math.sin(f)),ez,rc2*Math.cos(f));row.push(p);const rn=nrm3(sub3(p,c));nr.push(nrm3(lerp3(rn,nrm3([s*0.3,up?0.25:-0.1,1]),Math.pow(r/NR,0.8)*0.85)));
            let k=skinAt(p,0.12);if(r===0)k=up?mix(HC,C('#0e0a08'),0.5):mix(SK,C('#6a3a30'),0.35);else if(r===1&&up)k=mix(k,mul(SK,0.62),0.6);else if(r===2&&up)k=mix(k,mul(SK,0.82),0.5);cr.push(k);ur.push([i/NX,r/NR*0.3]);}
          P.push(row);Cc.push(cr);U.push(ur);Nn.push(nr);}hS.grid('skin',P,Cc,U,()=>c,Nn);
        if(up){// lash fringe: thin dark card along the upper margin
          const pts=[],nn=[],w=[];for(let i=1;i<NX;i++){const p=P[0][i],n2=nrm3(sub3(p,c));pts.push(add3(p,n2,0.02));nn.push(nrm3(add3(n2,[0,0.6,0])));w.push(0.035*Math.sin(i/NX*PI)+0.012);}
          const pp=pts.map((p,i)=>p),out=pts.map((p,i)=>add3(p,nrm3(add3(sub3(p,c),[0,0.9,0.2])),0.09));// strip from margin outward-up
          const g=hrS.g('hair');for(let i=0;i<pts.length-1;i++){const a=pp[i],b=pp[i+1],cq=out[i+1],dq=out[i];const cl0=mul(HC,0.4);g.p.push(a,b,cq,a,cq,dq);g.c.push(cl0,cl0,cl0,cl0,cl0,cl0);const u0=0.3+i*0.02,u1=u0+0.02;g.u.push([u0,0.02],[u1,0.02],[u1,0.3],[u0,0.02],[u1,0.3],[u0,0.3]);const nq=nn[i];g.n.push(nq,nq,nq,nq,nq,nq);}}};
      lid(true);lid(false);
      const gz=nrm3([s*0.06,-0.02,1]);
      hball(eS,'eye',c,HD.ER,[1,1,1],8,5,(p,d)=>{const v=nrm3(sub3(p,c)),cz=dot(v,gz),rr=Math.sqrt(Math.max(0,1-cz*cz));if(cz<0)return C('#3a2a24');if(rr<0.24)return C('#050404');if(rr<0.56){const a=Math.atan2(v[1],v[0]);return mul(irisC,0.7+0.3*hsh(Math.floor((a+PI)*9),1,2,3)+0.4*(1-rr/0.56));}
        if(rr<0.62)return mul(irisC,0.3);return mix(C('#a09284'),C('#86685c'),ss(0.6,0.95,rr));},{rot:null});});
    // eyebrows (cards), ears
    const fz=(x,y)=>HD.disp(Math.asin(Math.min(0.999,Math.pow(Math.abs(x)/HD.prof(y).xh,1.25)))*(x<0?-1:1),y)[0][2];
    [-1,1].forEach(s=>{const pts=[],nn=[],w=[],bt=fem?0.03:0;for(let i=0;i<=3;i++){const t=i/3,x=s*(0.22+0.9*t),y=3.84+bt+0.08*Math.sin(t*PI*0.9)-(fem?0:0.04)*t-0.06*t*t;pts.push([x,y,fz(x,y)+0.05]);nn.push(nrm3([s*0.25*t,0.15,1]));w.push((fem?0.07:0.095)*0.4*(1-0.55*t));/* thẻ mày (sợi tóc cắt alpha → mép răng cưa) thu mảnh, nằm dưới khối mày bầu dục của hunt3 */}
      hcard(hrS,pts,nn,w,mul(HC,0.85),0.1+0.3*(s>0?1:0),0.3+0.3*(s>0?1:0),0.02,0.22);
      // ear: cupped shell facing forward-out
      const ec=[s*(HD.prof(3.2).xh+0.05),3.15,-0.28],ef=nrm3([s*0.9,0,0.45]),eu=[0,1,0],er=nrm3(crs(eu,ef));
      const earP=(a,r)=>{const rim=Math.cos(a),hgt=0.6*Math.sin(a)+0.06,wid=0.34+0.06*Math.sin(a);const q=add3(add3(ec,eu,hgt*r*(a<0?0.85:1)),er,s*rim*wid*r*(rim>0?1:0.8));return add3(q,ef,(r>0.75?0.1*ss(0.7,0.95,r):-0.04*(1-r))+(r>0.5?0:0.02));};
      const ERn=9,rows=[0.0,0.5,1.0],Pe=rows.map(r=>Array.from({length:ERn+1},(_,i)=>earP(-PI/2+TAU*i/ERn,r))),Ce=rows.map(r=>Pe[0].map(()=>mix(skinAt(ec,0.25),redC,0.15*r)));
      hS.grid('skin',Pe,Ce,rows.map(r=>Pe[0].map((_,i)=>[i/ERn,r])),()=>add3(ec,ef,-0.6));
      const PL=Pe[Pe.length-1],CL=Ce[Ce.length-1],back=PL.map(p=>add3(lerp3(p,ec,0.25),ef,-0.22));hS.grid('skin',[PL,back.map(()=>add3(ec,ef,-0.25))],[CL,CL],[0,1].map(()=>Pe[0].map((_,i)=>[i/ERn,1])),()=>add3(ec,ef,0.3));});
    // neck (head frame)
    hloft(hS,[HRG(-1.0,.82*(fem?.85:1)*bw,.78,.84,{cz:-.05}),HRG(0.5,.74*(fem?.85:1)*bw,.7,.78,{cz:-.1}),HRG(1.4,.76*(fem?.88:1),.66,.84,{cz:-.2}),HRG(1.9,.74*(fem?.88:1),.62,.82,{cz:-.22})],
      {n:12,step:1.0,k:'skin',td:4,col:(p,u)=>skinAt(p,0),mod:(p,u)=>{if(!fem){const f=gss(p[1],0.85,0.3)*Math.max(0,Math.cos(u))*Math.pow(Math.max(0,Math.cos(u)),3);p[2]+=0.12*f;}if(Math.cos(u)<-0.3)p[2]-=0.05*gss(p[0],0,0.25);return p;}});
    /* ----- hair (cards) ----- */
    const HCt=(j)=>mul(HC,0.93+0.12*hsh(j,seed,5,9));const CEN=[0,3.25,-0.25];let hairTail=null;
    const scalp=(dir)=>{// head surface point along a direction from CEN (iterative)
      let r=2.2;for(let i=0;i<4;i++){const y=CEN[1]+dir[1]*r,u=Math.atan2(dir[0],dir[2]-0.0);const p=HD.base(u,Math.min(5.95,Math.max(1.05,y)));const d=sub3(p,CEN);r=Math.max(0.5,dot(d,dir));}return add3(CEN,dir,r);};
    const toDir=(u,y)=>{const p=HD.base(u,y);return nrm3(sub3(p,CEN));};
    const sweep=(d0,d1,n,lift0,lift1,bulge)=>{const pts=[],nn=[];for(let k=0;k<=n;k++){const f=k/n,d=nrm3(lerp3(d0,d1,f)),sp=scalp(d),lf=lift0+(lift1-lift0)*f+bulge*Math.sin(f*PI);pts.push(add3(sp,d,lf));nn.push(d);}return [pts,nn];};
    if(!bald){const tz=(()=>{let j=0;while(j<HEAD0.length-2&&2.75<HEAD0[j+1][0])j++;const A=HEAD0[j],B=HEAD0[j+1],t=(2.75-A[0])/(B[0]-A[0]);return -(A[3]+(B[3]-A[3])*t)-0.25;})(),Tp=[0,2.75,tz],dT=nrm3(sub3(Tp,CEN));
      if(hs===1){// short, messy: layered tufts flowing down/back with lifted tips
        const rowsY=[5.98,5.7,5.2,4.65,4.1,3.55,3.0,2.5];let j=0;rowsY.forEach((y,ri)=>{const nr=ri===0?4:Math.round(6+7*Math.sin(Math.min(PI/2,(6.0-y)*0.9)));for(let i=0;i<nr;i++){const u=TAU*(i+0.5*(ri%2))/nr+(Rn()-0.5)*0.2;if(y<hl(u)+0.15)continue;
            const d0=toDir(u,y),flow=nrm3(add3([Math.sin(u)*0.25,-1,-0.35+0.6*ss(0.7,1,Math.cos(u))*ss(4.8,5.6,y)],[(Rn()-0.5)*0.5,0,(Rn()-0.5)*0.4])),L=0.9+Rn()*0.6;
            const pts=[],nn=[];let p=add3(scalp(d0),d0,0.05);for(let k=0;k<=2;k++){const d=nrm3(sub3(p,CEN));pts.push(p);nn.push(d);let t=sub3(flow,mul(d,dot(flow,d)));t=nrm3(t);p=add3(add3(p,t,L/2),d,0.04+0.08*k*Rn());}
            const wq=0.34+Rn()*0.14,u0=Rn()*0.7;hcard(hrS,pts,nn,[wq,wq*0.9,wq*0.55],HCt(j++),u0,u0+0.28,0.0,0.3+Rn()*0.15,'hair',0.35);}});}
      else{// swept back to a tie at the nape (+ ponytail or braid in the swinging hair group)
        const rowsY=[5.88,5.35,4.75,4.1,3.45,2.8];let j=0;rowsY.forEach((y,ri)=>{const nr=Math.round(6+6*Math.sin(Math.min(PI/2,(6.0-y)*0.9)));for(let i=0;i<nr;i++){const u=TAU*(i+0.5*(ri%2))/nr;if(y<hl(u)+0.1)continue;
            const d0=toDir(u,y);const [pts,nn]=sweep(d0,dT,3,0.04+0.016*ri,0.2,0.06+0.04*Rn());const wq=0.42+0.12*Rn(),u0=Rn()*0.65;hcard(hrS,pts,nn,[wq,wq,wq*0.8,wq*0.55],HCt(j++),u0,u0+0.3,0.0,0.3,'hair',ri<3?0.4:0);}});
        // hair tie
        htube(hrS,'hide',[[0,2.95,tz+0.22],[0,2.65,tz-0.06]],[0.5,0.48],10,()=>TOP2,{cap0:false,cap1:false,td:2});
        const tail=new T.Group();tail.name='hairTail';const tp=[0,2.7,tz-0.05];tail.position.set(...tp);head.add(tail);hairTail=tail;const tS=soup(tail,80),rel=a=>a.map(p=>[p[0]-tp[0],p[1]-tp[1],p[2]-tp[2]]);
        const len=fem?(hs===2?8.6:7.2):(hs===2?6.2:4.6);
        if(hs===0){const core=rel([[0,2.68,tz-0.1],[0,1.7,tz-0.42],[0,0.2,tz-0.42],[0,-len*0.45,tz-0.28],[0,-len*0.8,tz-0.18],[0,-len,tz-0.06]]),rr=[0.42,0.5,0.48,0.38,0.24,0.06];
          htube(tS,'hair',core,rr,6,(p,t)=>mul(HC,0.92),{cap0:false,uv:(a,acc)=>[a*0.6,0.02+0.05*a]});
          for(let k=0;k<7;k++){const a=TAU*k/7,off=[Math.cos(a),0,Math.sin(a)*0.7];const pts=core.map((p,i)=>add3(p,off,rr[i]*0.95+0.04)),nn=core.map(()=>nrm3([Math.cos(a),0,Math.sin(a)]));
            pts[pts.length-1]=add3(pts[pts.length-1],off,0.25+0.2*hsh(k,1,2,3));hcard(tS,pts,nn,rr.map(r=>Math.max(0.12,r*0.75)),HCt(k+50),hsh(k,3,4,5)*0.6,hsh(k,3,4,5)*0.6+0.35,0.0,0.48);}}
        else{const n=9,pts=[],rad=[];for(let jj=0;jj<=n;jj++){const f=jj/n;pts.push([Math.sin(jj*1.4)*0.08,2.6+(-len-2.6)*f,tz-0.25-Math.sin(f*PI)*0.3+(f>0.6?(f-0.6)*0.4:0)]);rad.push(jj%2?[0.3,0.42]:[0.44,0.3]);}
          rad[0]=[0.45,0.45];rad[n]=[0.22,0.22];htube(tS,'hair',rel(pts),rad,6,()=>mul(HC,0.9),{twist:0.5,cap0:false,cap1:false,uv:(a,acc)=>[a*0.6,0.02+0.06*a]});
          const end=rel([pts[n]])[0];htube(tS,'hide',[add3(end,[0,0.35,0]),add3(end,[0,0.05,0])],[0.3,0.3],8,()=>TOP2,{cap0:false,cap1:false,td:2});
          for(let k=0;k<5;k++){const a=TAU*k/5,ofs=[Math.cos(a)*0.12,0,Math.sin(a)*0.12],p0=add3(end,ofs,1);hcard(tS,[p0,add3(p0,[Math.cos(a)*0.15,-0.6,Math.sin(a)*0.12]),add3(p0,[Math.cos(a)*0.3,-1.2,Math.sin(a)*0.2])],[0,1,2].map(()=>nrm3([Math.cos(a),0.2,Math.sin(a)])),[0.2,0.22,0.16],HCt(k+60),0.2,0.45,0.0,0.4);}}}
    }
    if(beard){let j=0;for(let i=0;i<=12;i++){const u=-1.75+3.5*i/12,top=lerp(2.05,3.35,ss(0.35,1.75,Math.abs(u)));for(let r=0;r<3;r++){const y=top-r*(top-1.25)/3;const [p]=HD.disp(u,y);const d=nrm3(sub3(p,[0,2.4,-0.4]));if(Math.abs(u)<0.5&&y>2.0)continue;
          const flow=nrm3([Math.sin(u)*0.15,-1,0.25+0.2*(r===2?1:0)]),L=0.55+0.35*(r/2)+0.25*Rn()+(Math.abs(u)<0.6?0.3:0);const pts=[],nn=[];let q=add3(p,d,0.04);for(let k=0;k<=2;k++){const dd=nrm3(sub3(q,[0,2.4,-0.4]));pts.push(q);nn.push(dd);let t=nrm3(sub3(flow,mul(dd,dot(flow,dd))));q=add3(add3(q,t,L/2),dd,0.06);}
          const wq=0.32+0.08*Rn(),u0=Rn()*0.7;hcard(hrS,pts,nn,[wq,wq,wq*0.6],HCt(j++ +90),u0,u0+0.28,0.0,0.3);}}
      // moustache
      [-1,1].forEach(s=>{for(let k=0;k<3;k++){const x0=s*(0.06+k*0.16),[p]=HD.disp(Math.asin(Math.min(0.99,Math.pow(Math.abs(x0)/HD.prof(2.47).xh,1.25)))*s,2.47);const pts=[add3(p,[0,0,0.05]),add3(p,[s*0.14,-0.13,0.06]),add3(p,[s*0.24,-0.3,0.02])],nn=pts.map(()=>nrm3([s*0.3,0.1,1]));hcard(hrS,pts,nn,[0.12,0.11,0.06],HCt(120+k),0.3,0.5,0.0,0.25);}});}
    /* ===== TORSO ===== */
    const X=(v)=>v*bw,ZZ=v=>v*bz;
    const TRd=fem?[[-2.6,2.35,1.3,1.32],[0,2.05,1.25,1.15],[2.3,2.35,1.45,1.3],[4.6,2.68,2.0,1.45],[6.4,2.9,1.72,1.5],[7.75,2.88,1.18,1.3],[8.7,2.42,.84,1.02],[9.3,1.35,.66,.82],[9.6,.82,.58,.72]]
                 :[[-2.6,2.5,1.38,1.36],[0,2.36,1.4,1.25],[2.3,2.64,1.55,1.4],[4.6,2.98,1.8,1.56],[6.4,3.28,1.68,1.62],[7.75,3.25,1.25,1.42],[8.75,2.75,.92,1.12],[9.35,1.55,.72,.9],[9.65,.92,.6,.75]];
    const TR=TRd.map(r=>HRG(r[0],X(r[1]),ZZ(r[2]),ZZ(r[3]),{cz:r[0]>9?-0.1:0}));
    const tS=soup(torso,65),tk=hasTop?'hide':'skin';
    const tmod=(p,u)=>{const ax=Math.abs(p[0]),c=Math.cos(u),fr=ss(0.1,0.6,c),bk=ss(-0.1,-0.6,c);let z=p[2];
      if(fem)z+=fr*(hasTop?0.5:0.55)*Math.exp(-Math.pow((ax-1.25)/0.72,2)-Math.pow((p[1]-4.95)/0.8,2))+(hasTop?fr*0.22*gss(ax,0,0.9)*gss(p[1],4.85,0.6):0);
      else z+=fr*(hasTop?0.1:0.16)*Math.exp(-Math.pow((ax-1.35)/0.95,2)-Math.pow((p[1]-5.5)/0.85,2))-(hasTop?0:fr*0.05*gss(ax,0,0.12)*ss(1.0,4.0,p[1]));
      z-=bk*0.12*Math.exp(-Math.pow((ax-1.4)/0.7,2)-Math.pow((p[1]-6.5)/1.0,2))*-1;if(!hasTop)z+=bk*0.06*gss(ax,0,0.18)*-1;
      return [p[0],p[1],z];};
    hloft(tS,TR,{n:14,step:1.5,k:tk,td:hasTop?9:4,mod:tmod,cap1:[0,9.65,-0.1],col:(p,u)=>{if(hasTop)return mul(TOP,0.96+0.08*vn3(p[0]*0.3,p[1]*0.3,p[2]*0.3,5));let k=skinAt(p,0);const ax=Math.abs(p[0]);
      if(!fem){k=mix(k,mul(SK,0.55),ss(0.17,0.08,Math.hypot(ax-1.42,p[1]-4.72))*ss(0,0.5,Math.cos(u))*0.8);k=mix(k,mul(SK,0.7),ss(0.12,0.04,Math.hypot(ax,p[1]-0.55))*ss(0.5,0.9,Math.cos(u)));}return k;}});
    if(hasTop){// neckline trim + arm-hole hems (stitched hide)
      const a=TR,r1=(y)=>{let j=0;while(j<a.length-2&&y>a[j+1].y)j++;const A=a[j],B=a[j+1],f=cl((y-A.y)/(B.y-A.y));return HRG(y,lerp(A.xp,B.xp,f)+0.07,lerp(A.zf,B.zf,f)+0.07,lerp(A.zb,B.zb,f)+0.07,{cz:lerp(A.cz,B.cz,f)});};
      hloft(tS,[r1(8.82),r1(9.32)],{n:18,k:'hide',td:3,col:()=>TOP2,mod:tmod});}
    function lerp(a,b,t){return a+(b-a)*t;}
    /* ===== PELVIS / CLOTHES ON HIPS ===== */
    const pS=soup(hips,65),PR=[[3.7,2.42,1.36,1.32],[2.1,2.72,1.42,1.5],[0.6,2.88,1.38,1.75],[-0.8,2.62,1.2,1.62],[-1.75,1.3,.75,.95]].map((r,j)=>HRG(r[0],X(r[1]+(fem&&j>=1&&j<=3?0.32:0)),ZZ(r[2]),ZZ(r[3]+(fem&&j===2?0.12:0))));
    hloft(pS,PR,{n:14,step:1.3,key:j=>hasTop&&j<1.99?null:botK,td:8,cap1:[0,-1.95,-0.1],col:()=>BOT});
    let outer=PR;
    if(hasTop){const L=fem?-1.7:-0.4,HMr=[HRG(3.45,X(2.6+F*.1),ZZ(1.5),ZZ(1.47)),HRG(1.6,X(3.02+F*.3),ZZ(1.62),ZZ(1.77+F*.1)),HRG(L,X(3.24+F*.3),ZZ(1.76),ZZ(2.0+F*.1))];
      const hem=(p,u)=>{const k=(L-p[1]);return p;};
      const res=hloft(pS,HMr,{n:16,step:1.5,k:'hide',td:9,col:(p)=>mul(TOP,0.96+0.08*vn3(p[0]*0.3,p[1]*0.3,p[2]*0.3,5)),mod:(p,u,r)=>{if(r.y<=L+0.01){p[1]-=0.3*hsh(Math.round(u*20/TAU),seed,1,1);}return p;}});
      // fringe along the tunic hem
      const last=res.P[res.P.length-1];for(let i=0;i<16;i+=(i%4===3?2:1)){const a=last[i],b=last[i+1],m=lerp3(a,b,0.5),out=nrm3([m[0],0,m[2]]),L2=0.9+0.4*hsh(i,seed,2,2);hcard(pS,[add3(m,out,0.02),add3(add3(m,out,0.06),[0,-L2*0.5,0]),add3(add3(m,out,0.1),[0,-L2,0])],[out,out,out],[len3(sub3(b,a))*0.5,len3(sub3(b,a))*0.5,len3(sub3(b,a))*0.48],mul(TOP,0.92),0,1,0.5,0.98);}
      outer=HMr;}
    {const by=3.05,rr=(y)=>{let j=0;while(j<outer.length-2&&y<outer[j+1].y)j++;const A=outer[j],B=outer[j+1],f=cl((A.y-y)/(A.y-B.y));return {xp:lerp(A.xp,B.xp,f),zf:lerp(A.zf,B.zf,f),zb:lerp(A.zb,B.zb,f)};},r0=rr(by),r1=rr(by+0.6);
      hloft(pS,[HRG(by,r0.xp+.08,r0.zf+.08,r0.zb+.08),HRG(by+0.6,r1.xp+.08,r1.zf+.08,r1.zb+.08)],{n:14,k:'hide',td:2.5,col:()=>TOP2});
      const fz=r0.zf+0.08;// knot + hanging ends + pouch
      htube(pS,'hide',[[-0.25,by+0.3,fz+0.05],[0.25,by+0.3,fz+0.12]],[[0.3,0.2],[0.3,0.2]],6,()=>mul(TOP2,0.95),{td:2});
      [[0.15,0.4],[-0.05,-0.3]].forEach(([dx,sw])=>htube(pS,'hide',[[dx,by+0.15,fz+0.14],[dx+sw*0.3,by-0.7,fz+0.16],[dx+sw*0.5,by-1.4,fz+0.12]],[[0.13,0.06],[0.12,0.05],[0.1,0.04]],4,()=>TOP2,{td:2,up:[0,0,1],cap0:false}));
      const px=X(2.15),pz=1.25;htube(pS,'hide',[[px,by-0.05,pz],[px+0.1,by-0.55,pz+0.22],[px+0.08,by-1.2,pz+0.25],[px+0.05,by-1.6,pz+0.12]],[[0.42,0.25],[0.6,0.4],[0.55,0.38],[0.25,0.16]],6,()=>mul(TOP2,1.05),{td:2});}
    /* ===== LIMBS ===== */
    const R={root:G,hips,torso,head,neck:head};if(hairTail)R.hair=hairTail;
    const mkArm=(s)=>{const nm=s<0?'L':'R',arm=new T.Group(),fore=new T.Group(),hand=new T.Group();arm.name='arm'+nm;fore.name='fore'+nm;hand.name='hand'+nm;
      arm.position.set(s*SH,7.85,-0.1);torso.add(arm);fore.position.set(0,-6.6,0);arm.add(fore);hand.position.set(0,-5.3,0);fore.add(hand);
      const ab=fem?0.86:1,m=bw,aS=soup(arm,60),fS=soup(fore,60),hS2=soup(hand,55),uk=sleeves?'hide':'skin';
      const AR=[HRG(0.78,.4*ab*m,.4*ab*m,.42*ab*m,{cx:s*0.0}),HRG(0.5,.8*ab*m,.8*ab*m,.82*ab*m,{cx:s*0.08}),HRG(-0.3,1.04*ab*m,0.98*ab*m,1.0*ab*m,{cx:s*0.2}),HRG(-1.6,1.04*ab*m,0.98*ab*m,0.98*ab*m,{cx:s*0.22}),HRG(-3.4,.86*ab*m,.98*ab*m,.9*ab*m,{cx:s*0.08}),HRG(-5.6,.74*ab,.78*ab,.8*ab),HRG(-6.6,.68*ab,.7*ab,.74*ab),HRG(-7.0,.62*ab,.62*ab,.66*ab)];
      let slEnd=-1;if(sleeves){AR.splice(6,0,HRG(-5.2,.95*ab,1.0*ab,1.0*ab),HRG(-5.25,.74*ab,.78*ab,.8*ab));slEnd=6;}
      hloft(aS,AR,{n:10,step:1.6,key:j=>j<slEnd-0.01?'hide':'skin',td:sleeves?7:4,cap0:[s*0.0,0.85,0],col:(p,u,r)=>r.src<slEnd-0.01?mul(TOP,0.96+0.08*vn3(p[0]*0.4,p[1]*0.4,p[2]*0.4,6)):skinAt(p,0.05*ss(-5.5,-6.8,p[1])),
        mod:(p,u,r)=>{if(sleeves&&Math.abs(r.src-6)<0.01){p[1]-=0.3*hsh(Math.round(u*12/TAU),s+3,seed,2);}if(!sleeves&&!fem){p[2]+=0.07*gss(p[1],-2.3,1.0)*Math.max(0,Math.cos(u));}return p;}});
      const FR=[HRG(0.5,.66*ab,.66*ab,.7*ab),HRG(-1.3,.8*ab*m,.84*ab*m,.82*ab*m),HRG(-3.4,.6*ab*m,.66*ab*m,.64*ab),HRG(-5.0,.38*ab,.52*ab,.5*ab),HRG(-5.5,.36*ab,.48*ab,.46*ab)];
      let fl=-1;if(longSl){FR.splice(3,0,HRG(-4.3,.66*ab,.74*ab,.72*ab),HRG(-4.35,.5*ab,.6*ab,.58*ab));fl=3;}
      hloft(fS,FR,{n:10,step:1.3,key:j=>longSl&&j<fl-0.01?'hide':'skin',td:longSl?7:4,col:(p,u,r)=>longSl&&r.src<fl-0.01?mul(TOP,0.97):skinAt(p,0.06*ss(-3.5,-5.5,p[1]))});
      hball(fS,longSl?'hide':'skin',[0,0,-0.04],0.66*ab,[1,1,1],7,4,(p)=>longSl?mul(TOP,0.97):skinAt(p,0.1));
      // ---- fist: palm/back block + 4 curled fingers around the grip rod (hand Z axis through (0,-1.75,0)) + thumb ----
      const hb=fem?0.92:1,xs=v=>s*v*hb,cy=-1.75*hb,hc=(p)=>skinAt(p,0.14);
      hloft(hS2,[HRG(0.35*hb,0.34*hb,0.46*hb,0.46*hb,{cx:xs(0.0)}),HRG(-0.3*hb,0.42*hb,0.6*hb,0.6*hb,{cx:xs(0.04)}),HRG(-0.95*hb,0.46*hb,0.76*hb,0.76*hb,{cx:xs(0.08),p:3}),HRG(-1.42*hb,0.4*hb,0.8*hb,0.8*hb,{cx:xs(0.18),p:3.2})],
        {n:8,step:0.9,k:'skin',td:3,col:hc,cap0:[0,0.45*hb,0],cap1:[xs(0.25),-1.6*hb,0]});
      [[0.6,0.19,-3.45],[0.2,0.2,-3.6],[-0.2,0.19,-3.5],[-0.58,0.16,-3.25]].forEach(([zc,rw,aEnd],fi)=>{const A=[0.42,-0.9,aEnd],rr=[0.7,0.76,0.62],pts=A.map((a,i)=>[xs(Math.cos(a)*rr[i]),cy+Math.sin(a)*rr[i]*hb,zc*hb]);
        htube(hS2,'skin',pts,pts.map((_,i)=>[rw*hb*(i===0?1.1:1-i*0.06),rw*hb*0.92]),5,(p,t)=>mix(hc(p),redC,0.15*Math.sin(t*PI*2.5)*Math.sin(t*PI*2.5)),{td:2,up:[0,0,1]});});
      htube(hS2,'skin',[[xs(-0.1),-0.35*hb,0.55*hb],[xs(-0.3),-0.95*hb,0.95*hb],[xs(-0.45),-1.5*hb,1.0*hb],[xs(-0.35),-1.85*hb,0.82*hb]],[[0.24*hb,0.2*hb],[0.22*hb,0.19*hb],[0.19*hb,0.17*hb],[0.16*hb,0.15*hb]],5,hc,{td:2,up:[1,0,0],cap0:false});
      R['arm'+nm]=arm;R['fore'+nm]=fore;R['hand'+nm]=hand;};
    mkArm(-1);mkArm(1);
    const mkLeg=(s)=>{const nm=s<0?'L':'R',leg=new T.Group(),shin=new T.Group(),foot=new T.Group();leg.name='leg'+nm;shin.name='shin'+nm;foot.name='foot'+nm;
      leg.position.set(s*HX,0,0);hips.add(leg);shin.position.set(0,-8.1,0);leg.add(shin);foot.position.set(0,-8.0,0);shin.add(foot);
      const lb=fem?0.94:1,m=Math.sqrt(bw),lS=soup(leg,60),sS=soup(shin,60),fS=soup(foot,55);
      const TH=[HRG(1.3,1.5*lb*m,1.45*lb*m,1.5*lb*m),HRG(-0.9,1.62*lb*m,1.5*lb*m,1.55*lb*m,{cx:s*0.12}),HRG(-3.6,1.4*lb*m,1.48*lb*m,1.32*lb*m,{cx:s*0.05}),HRG(-6.4,1.08*lb*m,1.12*lb*m,1.04*lb*m),HRG(-8.1,.95*lb,.98*lb,.95*lb),HRG(-8.5,.9*lb,.9*lb,.9*lb)];
      hloft(lS,TH,{n:10,step:1.5,key:j=>j<1.99?null:'skin',td:4,col:(p)=>skinAt(p,0.06*ss(-7,-8.4,p[1])),mod:(p,u)=>{p[2]+=0.1*gss(p[1],-5.6,1.1)*Math.max(0,Math.cos(u));return p;}});
      const inn=1.62*lb*m,out=2.12*lb*m+(fem?0.25:0),SKd=[[1.15,inn-0.1,out-0.2,1.72,1.85,0.22],[-1.6,inn,out,1.85,2.0,0.28],[fem?-6.2:-4.4,inn+0.06,out+0.12,1.98,2.14,0.33]];
      const SKr=SKd.map(([y,i,o2,zf,zb,c])=>HRG(y,0,zf*lb*m,zb*lb*m,{xn:s<0?o2*lb:i*lb,xp:s<0?i*lb:o2*lb,cx:s*c}));
      const sk=hloft(lS,SKr,{n:12,step:2.0,k:botK,td:8,col:()=>BOT,mod:(p,u,r)=>{if(r.src>1.99){p[1]-=0.5*hsh(Math.round(u*14/TAU),s*3+7,seed,4);}return p;}});
      if(skirtLook||hasTop){const last=sk.P[sk.P.length-1];for(let i=0;i<12;i+=1){if(fem&&i%2)continue;const a=last[i],b=last[i+1],mm=lerp3(a,b,0.5),out2=nrm3([mm[0]-s*HX*0,0,mm[2]]),L2=0.7+0.4*hsh(i,s,seed,3),wd=len3(sub3(b,a))*0.5;
          hcard(lS,[mm,add3(mm,[0,-L2*0.5,0]),add3(mm,[0,-L2,0])],[out2,out2,out2],[wd,wd,wd*0.95],mul(BOT,0.9),0,1,0.5,0.98);}}
      hball(sS,'skin',[0,0,0.05],0.98*lb,[1,1,1],7,4,(p)=>skinAt(p,0.1));
      const bt=!!boots,SHd=[[0.55,.95,.98,.95],[-2.4,1.05,.88,1.42],[-4.6,.86,.74,1.0],[-6.6,.66,.66,.72],[-7.9,.58,.6,.6],[-8.4,.56,.56,.56]];
      const SHr=SHd.map(([y,a,zf,zb],j)=>HRG(y,a*lb*m+(bt&&j>=2?0.12:0),zf*lb*m+(bt&&j>=2?0.12:0),zb*lb*m+(bt&&j>=2?0.12:0),{cz:j===1?-0.12:0}));
      hloft(sS,SHr,{n:9,step:1.6,key:j=>bt&&j>=1.99?'hide':'skin',td:bt?5:4,col:(p,u,r)=>bt&&r.src>=1.99?mul(BOOT,0.95+0.1*Math.max(0,Math.sin(p[1]*7))):skinAt(p,0.05),mod:(p,u,r)=>{if(bt&&Math.abs(r.src-2)<0.01)p[1]+=0.25*hsh(Math.round(u*12/TAU),s,seed,5);return p;}});
      if(bt){// lacing straps
        [-7.4,-6.0].forEach((y,i)=>{const rr=SHr[3],k2=1.03;hloft(sS,[HRG(y,rr.xp*k2+0.05,rr.zf*k2+0.05,rr.zb*k2+0.05),HRG(y+0.22,rr.xp*k2+0.05,rr.zf*k2+0.05,rr.zb*k2+0.05)].map(r=>{r.xp=r.xn=(r.xp)*(1+(y+7.6)*0.12);r.zf*=1+(y+7.6)*0.12;r.zb*=1+(y+7.6)*0.12;return r;}),{n:9,k:'hide',td:2,col:()=>mul(TOP2,0.8)});});}
      // foot along +Z (ring.y = z, cz = height); toes when bare
      const g=bt?0.12:0,FT=[[-1.3,.5,-0.95,.45,.52],[-0.55,.62,-0.62,.95,.88],[1.3,.78,-0.95,.6,.55],[3.0,.88,-1.2,.32,.3],[3.9,.8,-1.25,.24,.22]].map(([z,w,cyy,tp,bm])=>HRG(z,(w+g)*lb,tp+g,bm,{cz:cyy,p:3}));
      hloft(fS,FT,{n:10,step:1.4,k:bt?'hide':'skin',td:bt?4:3,map:p=>[p[0],p[2],p[1]],us:Array.from({length:10},(_,j)=>TAU*j/10+PI/10),cap0:true,cap1:true,col:(p)=>bt?mul(BOOT,0.95):skinAt(p,0.18)});
      if(!bt){[[0.42,0.27,0.5],[0.08,0.2,0.36],[-0.2,0.18,0.3],[-0.45,0.16,0.24],[-0.66,0.14,0.2]].forEach(([tx,tr,tl],i)=>{const x=-s*tx*lb,zz=3.75-Math.abs(tx-0.3)*0.55+(i===0?0.12:0),ty=-1.45+tr*lb*0.75;
          htube(fS,'skin',[[x*1,ty+0.04,zz-0.25],[x*1.03,ty-0.02,zz+tl]],[[tr*lb,tr*lb*0.8],[tr*lb*0.85,tr*lb*0.65]],5,(p)=>skinAt(p,0.2),{td:2,up:[0,1,0],cap0:false});});}
      R['leg'+nm]=leg;R['shin'+nm]=shin;R['foot'+nm]=foot;};
    mkLeg(-1);mkLeg(1);
    /* ===== CLOAK (fur cape) ===== */
    if(cloak){const cl2=new T.Group();cl2.name='cloak';const cp=[0,8.7,-1.1];cl2.position.set(...cp);torso.add(cl2);const cS=soup(cl2,70);
      const rows=[[9.55,1.45,1.05,1.3,60,300],[9.0,X(3.95),1.3,ZZ(1.85),75,285],[7.0,X(4.85),1.0,ZZ(2.2),95,265],[2.5,X(4.45),0.8,ZZ(2.4),108,252],[-4.6,X(4.6),0.8,ZZ(2.8),110,250]];
      const n=8,Pc=[],Cc2=[],Uc=[];rows.forEach(([y,hx,zf,zb,a0,a1],j)=>{const r=HRG(y,hx,zf,zb,{p:2.2});const row=[],cr=[],ur=[];for(let i=0;i<=n;i++){const u=(a0+(a1-a0)*i/n)*PI/180;const p=hrp(r,u);if(j===4)p[1]-=0.9*hsh(i,seed,7,1);if(j>=2)p[2]-=0.12*hsh(i+j*5,seed,1,2);row.push([p[0]-cp[0],p[1]-cp[1],p[2]-cp[2]]);cr.push(mul(CLK,0.93+0.12*hsh(i,j,seed,3)));ur.push([i/n*3,(9.6-y)/4]);}Pc.push(row);Cc2.push(cr);Uc.push(ur);});
      // interpolate an extra row between each for smooth drape
      const P2=[],C2=[],U2=[];for(let j=0;j<Pc.length;j++){P2.push(Pc[j]);C2.push(Cc2[j]);U2.push(Uc[j]);if(j<Pc.length-1){P2.push(Pc[j].map((p,i)=>lerp3(p,Pc[j+1][i],0.5)));C2.push(Cc2[j]);U2.push(Uc[j].map((u,i)=>[u[0],(u[1]+Uc[j+1][i][1])/2]));}}
      cS.grid('furc',P2,C2,U2,(r)=>[0,0,0.6]);
      hloft(cS,[HRG(8.5-cp[1],X(3.45),ZZ(1.4),ZZ(2.0),{cz:-cp[2]}),HRG(9.45-cp[1],X(2.05),ZZ(1.3),ZZ(1.65),{cz:-cp[2]}),HRG(10.0-cp[1],1.35,1.12,1.3,{cz:-0.12-cp[2]})],{n:10,step:0.8,k:'furc',td:3,col:()=>CLK2,
        mod:(p,u,r)=>{if(Math.abs(r.src-1)<0.01){const f=1+0.14*hsh(Math.round(u*16/TAU),seed,9,9);p[0]*=f;p[2]=(p[2]+cp[2])*f-cp[2];p[1]+=0.25*hsh(Math.round(u*16/TAU),2,seed,1);}return p;}});
      R.cloak=cl2;}
    parts.forEach(([S,grp,cr])=>S.to(grp,cr));
    /* ===== attach points (as human.js) ===== */
    const topM=new T.Group();topM.position.set(0,6.1,-0.2);head.add(topM);const face=new T.Group();face.position.set(0,3.4,1.75);head.add(face);
    const back=new T.Group();back.position.set(0,4.5,-1.9);torso.add(back);
    Object.assign(R,{face,top:topM,back,dims:{h,up:6.6,fore:5.3,thigh:8.1,shin:8.0,hipY:17.6,hipX:HX,sh:SH},headR:2.6*h,headY:(17.6+3.2+9.3+3.4)*h});
    G.userData.rig=R;G.userData.char2=true;G.userData.char6c=true;
    if(K.char2Neutral)K.char2Neutral(G);return G;};
  /* =============================== ANIMAL REGISTRATION =============================== */
  // per-species render options: micro-detail tile, density [along, around], material tweaks
  const FUR={detail:'fur',mat:{r:0.86,sheen:0.6}},SM={den:[1.35,1.05],eyeRes:8,earKs:1,earKn:1.1,legKn:1,capRows:1,tubeMin:4,spikeMin:3},MD={den:[1.7,1.2],eyeRes:10,earKs:1,earKn:1.2,legKn:1.05},OPT={
    deer:{detail:'furS',den:[2,1.2],eyeRes:9,earKs:1,mat:{r:0.84,sheen:0.55,sheenC:'#fff4e0'}},doe:{detail:'furS',den:[2,1.25],eyeRes:9,earKs:1,mat:{r:0.84,sheen:0.55,sheenC:'#fff4e0'}},
    boar:Object.assign({},MD,{detail:'bristle',mat:{r:0.9,sheen:0.45,ns:0.9}}),wolf:Object.assign({},MD,{detail:'fur',mat:{r:0.9,sheen:0.75,ns:0.8}}),
    bear:{detail:'fur',den:[2,1.4],mat:{r:0.82,sheen:0.9,sheenC:'#d8d0c8',ns:0.9}},tiger:{detail:'furS',den:[2,1.45],Dmin:14,paintG:1.5,mat:{r:0.82,sheen:0.6,sheenC:'#fff0d8'}},
    gaur:{detail:'furS',den:[2,1.4],mat:{r:0.72,sheen:0.5,ns:0.5}},rabbit:Object.assign({},SM,{detail:'fur',mat:{r:0.92,sheen:0.85}}),
    monkey:Object.assign({},MD,{den:[1.9,1.3],detail:'fur',mat:{r:0.9,sheen:0.7}}),crocodile:{detail:'scute',den:[2,1.3],mat:{r:0.58,sheen:0,ns:1.2,extra:{clearcoat:0.25,clearcoatRoughness:0.5}}},
    snake:{detail:'scale',den:[1.5,1.3],mat:{r:0.42,sheen:0,ns:0.5,extra:{clearcoat:0.6,clearcoatRoughness:0.3}}},
    junglefowl:Object.assign({},SM,{den:[1.15,1.0],detail:'feather',mat:{r:0.7,sheen:0.5,ns:0.6}}),chicken:Object.assign({},SM,{den:[1.15,1.0],detail:'feather',mat:{r:0.78,sheen:0.4,ns:0.6}}),chick:Object.assign({},SM,{den:[1.2,1.0],detail:'wool',mat:{r:0.95,sheen:1}}),
    bird:Object.assign({},SM,{den:[1.5,1.2],detail:'feather',mat:{r:0.75,sheen:0.4,ns:0.4}}),frog:Object.assign({},SM,{detail:'skin',wetAtlas:1,mat:{wr:0.3,cc:0.9,wns:0.6}}),
    carp:{detail:'scale',den:[1.15,1.08],capRows:1,wetAtlas:1,eyeRes:5,mat:{wr:0.35,cc:1,wns:0.7,irid:0.35,ei:0.9}},catfish:{detail:'smooth',den:[1.15,1.08],capRows:1,wetAtlas:1,eyeRes:5,mat:{wr:0.3,cc:1,wns:0.4,ei:0.8}},
    snakehead:{detail:'scale',den:[1.15,1.08],capRows:1,wetAtlas:1,eyeRes:5,mat:{wr:0.38,cc:1,wns:0.6,irid:0.15,ei:0.8}},
    pig:Object.assign({},MD,{den:[2,1.35],detail:'skin',mat:{r:0.8,sheen:0.35,ns:0.6}}),piglet:Object.assign({},SM,{detail:'skin',mat:{r:0.8,sheen:0.4,ns:0.5}}),
    dog:Object.assign({},MD,{detail:'furS',mat:{r:0.85,sheen:0.6}}),puppy:Object.assign({},MD,{den:[1.6,1.2],detail:'fur',mat:{r:0.9,sheen:0.8}}),goat:Object.assign({},MD,{detail:'fur',mat:{r:0.88,sheen:0.6}}),
    butterfly:{detail:'smooth',den:[1,1],eyeRes:4,capRows:1,mat:{r:0.6,sheen:0.3}}};
  const INSOPT={detail:'smooth',den:[1,1],eyeRes:4,capRows:1,octa:[5,3],Dmax:4000,Dmin:200,mat:{r:0.5,sheen:0.2,ns:0.3}};
  const RIG0={};let PREV=null;
  const rigOf=(G)=>{const r=G.userData.rig||{},o={};Object.keys(r).forEach(k=>{const v=r[k];if(Array.isArray(v))o[k]=v.map(x=>x&&x.isObject3D?{p:x.position.clone(),q:x.quaternion.clone(),s:x.scale.clone()}:null);else if(v&&v.isObject3D)o[k]={p:v.position.clone(),q:v.quaternion.clone(),s:v.scale.clone()};});
    const kids=G.children.map(c=>c.position.clone());return {o,kids,ud:{h:G.userData.h,len:G.userData.len,r:G.userData.r}};};
  // copy the old (4a) pivot transforms so every rig object sits exactly where the game expects it
  const matchRig=(G,key,mk)=>{if(!PREV)return G;let R0=RIG0[key];if(R0===undefined){try{const g0=mk();R0=RIG0[key]=g0&&g0.userData&&g0.userData.rig?rigOf(g0):null;}catch(e){R0=RIG0[key]=null;}}if(!R0)return G;
    const r=G.userData.rig||{},set=(x,t)=>{if(x&&t){x.position.copy(t.p);x.quaternion.copy(t.q);x.scale.copy(t.s);}};
    Object.keys(R0.o).forEach(k=>{const v=r[k],t=R0.o[k];if(Array.isArray(v)&&Array.isArray(t))v.forEach((x,i)=>set(x,t[i]));else if(v&&v.isObject3D&&!Array.isArray(t))set(v,t);});
    // root children that are not rig objects (none in practice) keep their settle offset
    Object.assign(G.userData,R0.ud);if(G.userData._poserSpec)poser(G,G.userData._poserSpec);return G;};
  const W6=(kind,fn,oldArgs)=>(...a)=>{const G=withCtx(kind,OPT[kind]||FUR,()=>fn(...a));return matchRig(G,kind,()=>PREV(kind==='carp'?'carp':kind,...(oldArgs||a)));};
  const NEW6={deer:W6('deer',()=>deer(true)),doe:W6('doe',()=>deer(false)),boar:W6('boar',boar),wolf:W6('wolf',wolf),bear:W6('bear',bear),tiger:W6('tiger',tiger),gaur:W6('gaur',gaur),
    rabbit:W6('rabbit',()=>bakeScale(rabbit(),0.8)),monkey:W6('monkey',monkey),crocodile:W6('crocodile',crocodile),snake:W6('snake',(s)=>snake(s||1)),
    junglefowl:W6('junglefowl',()=>bakeScale(fowl('rooster'),0.8)),chicken:W6('chicken',()=>bakeScale(fowl('hen'),0.85)),chick:W6('chick',()=>bakeScale(fowl('chick'),0.85)),bird:W6('bird',bird),frog:W6('frog',frog),
    carp:W6('carp',()=>fish('carp')),catfish:W6('catfish',()=>fish('catfish')),snakehead:W6('snakehead',()=>fish('snakehead')),fish:W6('carp',()=>fish('carp')),
    butterfly:(s)=>{s=+s||1;const k='butterfly'+(((s-1)%BFP.length)+BFP.length)%BFP.length;return matchRig(withCtx(k,OPT.butterfly,()=>butterfly(s)),k,()=>PREV('butterfly',s));},
    pig:W6('pig',()=>pig(false)),piglet:W6('piglet',()=>pig(true)),dog:W6('dog',()=>dog(false)),puppy:W6('puppy',()=>dog(true)),goat:W6('goat',goat)};
  const INS=['bee','mosquito','fly','dragonfly','caterpillar','beetle','firefly'];
  if(M){
    M.animal6cPrev=M.animal;const prev=M.animal;PREV=prev;
    M.animal=(kind,...a)=>NEW6[kind]?NEW6[kind](...a):prev(kind,...a);
    M.fish=(v)=>NEW6[FSP[v]?v:'carp']();M.butterfly=(seed)=>NEW6.butterfly(seed||1);
    const prevIns=M.insect;M.insect6cPrev=prevIns;M.insect=(kind)=>{kind=INS.includes(kind)?kind:'bee';return matchRig(withCtx('ins_'+kind,INSOPT,()=>insect(kind)),'ins_'+kind,()=>prevIns?prevIns(kind):null);};if(M.list)M.list.insects=INS.slice();
    Object.keys(NEW6).forEach(k=>{if(M.list&&M.list.animals&&!M.list.animals.includes(k))M.list.animals.push(k);});
    if(!M.tris3)M.tris3=trisOf;M.mat6c=MATS;M.tex6c=KIND_TEX;M.v6c=1;
    // pose helper (models3/4a contract): G.userData.pose(name)
    if(!M.animalPose)M.animalPose=(G,name)=>{if(G&&G.userData&&G.userData.pose)G.userData.pose(name||'stand');return G;};
  }
}
