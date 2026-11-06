/* ===================== SB MODELS 6v — realistic vegetation (replaces every plant / tree builder) =====================
   Needs models.js (+ models2/3/4b when present). Call SBmodels6vInit() LAST (after SBmodels…Init). Re-defines on window.SBM, same
   signatures / origins (ground y=0, front +Z) / approximate sizes / userData as before, deterministic (seeded, no Math.random):
     M.tree(kind,stage,seed)  pine oak birch dead × stage 0 sapling · 1 young · 2 mature · 3 giant (dead 3 → 2)
     M.savannaTree(seed) M.banyan(seed) M.palm(seed) M.bamboo(seed) M.banana(seed)
     M.bush('berry'|'berryEmpty'|'shrub',seed) M.flax(seed) M.reeds(seed) M.reedBed(seed) M.fern(seed) M.tallgrass(seed) M.lotus(seed)
     M.herb('mugwort'|'ginger'|'turmeric'|'centella'|'mint'|'aloe',seed) M.flower('red'|'yellow'|'white'|'purple',seed)
     M.grassClump(seed) (5–7 alpha cards, ≤30▲)  M.grassMat (= textured alpha foliage material)  M.sapling(kind,stage,seed)
     M.treeLo(kind,seed,stage)  far impostor: 2 crossed alpha quads whose texture is rendered ONCE (lazily, on the first call or via
                              M.v6bake()) from 2 side views of the full model into one 2048² atlas with an offscreen WebGLRenderer.
                              Falls back to the previous (models4b) low-poly impostor if that fails.
   TECHNIQUES: procedural canvas textures (generated once, shared): leaf atlas 2048² with alpha (oak/birch/pine/broad/bamboo/acacia/fern/
     grass/plume/palm/banana/flowers/herbs/lotus + solid patches), bark (fissured) + normal map, birch bark + normal map, ring/node
     bark (palm, bamboo, banana) + normal map. Trees = seeded trunk + 2 levels of tapered branches (smooth normals, root flare) + many
     leaf cards around the branch tips; card normals point out of the crown ellipsoid and vertex colours carry baked crown AO.
   MATERIALS (M.mat6v, all MeshStandardMaterial, shared, vertexColors, instancing-safe; no per-mesh uniforms):
     v6Bark (bark map+normal) · v6Birch (birch map+normal) · v6Ring (palm/bamboo/banana) · v6Leaf (atlas, alphaTest .5, DoubleSide,
     normals not flipped on back faces, alpha-to-mip coverage fix, cheap back-light translucency) · v6Imp (impostor atlas).
     WIND: onBeforeCompile vertex sway driven by uniform `time` = K3.GU.time (the game already sets K3.GU.time.value each frame; M.v6time
     is the same object). Phase from the instance's world position (instanceMatrix when instanced). Trunks bend with height²,
     leaves also flutter (not the solid uv patches). customProgramCacheKey = 'v6w<kind>'.
   Budgets: mature tree ≤1800▲, giant ≤2600▲, bush ≤500▲, small plants ≤200▲, grassClump ≤30▲, ≤4 materials per model.
*/
function SBmodels6vInit(){const M=window.SBM;if(!M||M.v6v)return;M.v6v=1;
  const K=(typeof K3!=='undefined')?K3:window.K3,T=(K&&K.T)||window.THREE,PI=Math.PI,TAU=PI*2,DS=T.DoubleSide;
  /* ---------------- maths ---------------- */
  const RNG=s=>{let a=(((Math.abs(+s||0)*1000)|0)+1)*2654435761>>>0;return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};};
  const hsh=(a,b,c,d)=>{let h=(Math.imul(a|0,0x27d4eb2d)^Math.imul(b|0,0x165667b1)^Math.imul(c|0,0x5bd1e995)^Math.imul((d|0)+7,0x85ebca77))>>>0;h=Math.imul(h^(h>>>15),0x2c1b3c6d);h=Math.imul(h^(h>>>12),0x297a2d39);return ((h^(h>>>15))>>>0)/4294967296;};
  const cl=t=>t<0?0:t>1?1:t,ss=(a,b,x)=>{const t=cl((x-a)/(b-a));return t*t*(3-2*t);},lerp=(a,b,t)=>a+(b-a)*t;
  const add=(a,b,k)=>{k=k===undefined?1:k;return [a[0]+b[0]*k,a[1]+b[1]*k,a[2]+b[2]*k];},sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul=(a,f)=>[a[0]*f,a[1]*f,a[2]*f];
  const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],len=a=>Math.hypot(a[0],a[1],a[2]),nrm=a=>{const l=len(a)||1;return [a[0]/l,a[1]/l,a[2]/l];};
  const crs=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],lrp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],cm=(a,b)=>[a[0]*b[0],a[1]*b[1],a[2]*b[2]];
  const UP=[0,1,0],W1=[1,1,1];
  const rdir=R=>{const z=R()*2-1,a=R()*TAU,r=Math.sqrt(1-z*z);return [r*Math.cos(a),z,r*Math.sin(a)];};
  const azd=(a,el)=>[Math.cos(a)*Math.cos(el),Math.sin(el),-Math.sin(a)*Math.cos(el)];
  const perp=d=>nrm(crs(d,Math.abs(d[1])<0.95?UP:[1,0,0]));
  const g=(...c)=>{const G=new T.Group();c.flat().forEach(o=>o&&G.add(o));return G;};

  /* ======================================== 1. PROCEDURAL TEXTURES ======================================== */
  const pn=(x,y,px,py,s)=>{const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),h=(i,j)=>hsh(((i%px)+px)%px,((j%py)+py)%py,s,7);
    return lerp(lerp(h(xi,yi),h(xi+1,yi),u),lerp(h(xi,yi+1),h(xi+1,yi+1),u),v);};
  const fbm=(x,y,px,py,s,o)=>{let a=0,w=0.5,f=1,ws=0;for(let i=0;i<o;i++){a+=w*pn(x*f,y*f,px*f,py*f,s+i*13);ws+=w;w*=0.5;f*=2;}return a/ws;};
  // rgba rows top-down → DataTexture rows bottom-up (uv v=1 = canvas top)
  function dataTex(d,w,h,o){o=o||{};const out=new Uint8Array(w*h*4);for(let y=0;y<h;y++)out.set(d.subarray((h-1-y)*w*4,(h-y)*w*4),y*w*4);
    const t=new T.DataTexture(out,w,h,T.RGBAFormat,T.UnsignedByteType);t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.anisotropy=o.an||4;
    if(o.rep)t.wrapS=t.wrapT=T.RepeatWrapping;if(o.srgb)t.encoding=T.sRGBEncoding;t.needsUpdate=true;return t;}
  // push-pull fill: transparent texels get the colour of the nearest opaque area (no dark fringes in mip levels)
  function bleed(d,w,h){const lv=[];let W=w>>1,H=h>>1;let r=new Float32Array(W*H),gg=new Float32Array(W*H),b=new Float32Array(W*H),a=new Float32Array(W*H);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const j=y*W+x;for(let k=0;k<4;k++){const i=((y*2+(k>>1))*w+x*2+(k&1))*4,al=d[i+3]>40?d[i+3]/255:0;r[j]+=d[i]*al;gg[j]+=d[i+1]*al;b[j]+=d[i+2]*al;a[j]+=al;}}
    lv.push({W,H,r,g:gg,b,a});
    while(W>1&&H>1){const W2=W>>1,H2=H>>1,r2=new Float32Array(W2*H2),g2=new Float32Array(W2*H2),b2=new Float32Array(W2*H2),a2=new Float32Array(W2*H2),L=lv[lv.length-1];
      for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){const j=y*W2+x;for(let k=0;k<4;k++){const i=(y*2+(k>>1))*W+x*2+(k&1);r2[j]+=L.r[i];g2[j]+=L.g[i];b2[j]+=L.b[i];a2[j]+=L.a[i];}}
      lv.push({W:W2,H:H2,r:r2,g:g2,b:b2,a:a2});W=W2;H=H2;}
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(d[i+3]>=10)continue;let xx=x>>1,yy=y>>1;
      for(let l=0;l<lv.length;l++){const L=lv[l],j=Math.min(L.H-1,yy)*L.W+Math.min(L.W-1,xx);if(L.a[j]>0.001){const k=1/L.a[j];d[i]=L.r[j]*k;d[i+1]=L.g[j]*k;d[i+2]=L.b[j]*k;break;}xx>>=1;yy>>=1;}}
    return d;}
  // opaque tiling texture + normal map from fn(u,v) → [r,g,b,height]
  function procTex(N,fn,ns){const d=new Uint8ClampedArray(N*N*4),Hh=new Float32Array(N*N);
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){const q=fn(x/N,y/N),i=y*N+x;d[i*4]=q[0];d[i*4+1]=q[1];d[i*4+2]=q[2];d[i*4+3]=255;Hh[i]=q[3];}
    const nd=new Uint8ClampedArray(N*N*4);for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x,hx=Hh[y*N+(x+1)%N]-Hh[y*N+(x+N-1)%N],hy=Hh[((y+1)%N)*N+x]-Hh[((y+N-1)%N)*N+x];
      const nx=-hx*ns,ny=hy*ns,l=Math.hypot(nx,ny,1);nd[i*4]=(nx/l*0.5+0.5)*255;nd[i*4+1]=(ny/l*0.5+0.5)*255;nd[i*4+2]=(1/l*0.5+0.5)*255;nd[i*4+3]=255;}
    return {map:dataTex(d,N,N,{rep:1,srgb:1}),nmap:dataTex(nd,N,N,{rep:1})};}
  // fissured bark (neutral grey-brown; species tint = vertex colour)
  const barkFn=(u,v)=>{const n=fbm(u*7,v*2,7,2,11,4),d=Math.abs(n-0.5)*2;let pl=ss(0.025,0.24,d);const c=fbm(u*5,v*14,5,14,23,3),hc=ss(0.02,0.16,Math.abs(c-0.5)*2);pl*=0.55+0.45*hc;
    const f=fbm(u*48,v*12,48,12,31,2),lo=fbm(u*3,v*3,3,3,41,3),li=ss(0.6,0.76,fbm(u*6,v*6,6,6,51,3)),h=pl*0.78+f*0.22,k=0.2+0.8*Math.pow(h,0.85),b=0.8+0.4*lo;
    let r=196*k*b,gr=178*k*b,bl=156*k*b;if(li>0){const m=li*pl*0.6;r=lerp(r,166,m);gr=lerp(gr,172,m);bl=lerp(bl,138,m);}return [r,gr,bl,h];};
  const birchFn=(u,v)=>{const s=pn(u*5,v*64,5,64,61),s2=pn(u*18,v*64,18,64,62),lent=ss(0.74,0.84,s)*ss(0.3,0.62,s2),p=fbm(u*3,v*6,3,6,71,3),blk=ss(0.67,0.73,p);
    const gr=fbm(u*16,v*32,16,32,73,3),pe=ss(0.7,0.8,fbm(u*4,v*8,4,8,79,2))*0.45;let r=238-gr*34,gg=234-gr*34,b=224-gr*36;r=lerp(r,210,pe);gg=lerp(gg,168,pe);b=lerp(b,136,pe);
    const dk=Math.max(lent*0.9,blk*0.95);r=lerp(r,42,dk);gg=lerp(gg,36,dk);b=lerp(b,34,dk);return [r,gg,b,1-dk*0.7-gr*0.2];};
  const ringFn=(u,v)=>{const dv=Math.min(v,1-v)*256,node=Math.exp(-dv*dv/6),ridge=v<0.5?Math.exp(-Math.pow(dv-5,2)/5):0,fib=fbm(u*40,v*3,40,3,81,3),sp=ss(0.68,0.8,fbm(u*6,v*4,6,4,83,3));
    const k=0.84+0.16*fib-node*0.42+ridge*0.12-sp*0.14;return [230*k,226*k,216*k,0.5+fib*0.25-node*0.7+ridge*0.35];};
  const TX={};
  TX.bark=procTex(512,barkFn,5);TX.birch=procTex(512,birchFn,2.5);TX.ring=procTex(256,ringFn,3);

  /* ---------- leaf atlas (2048², 256-px units) ---------- */
  const AT=2048,UN=256;
  const RG={oak:[0,0,2,2],birch:[2,0,2,2],pine:[4,0,2,2],broad:[6,0,2,2],bamboo:[0,2,2,2],acacia:[2,2,2,2],fern:[4,2,2,2],grass:[6,2,1,2],plume:[7,2,1,2],
    palm:[0,4,4,1],banana:[0,5,4,1],bananaDry:[0,6,4,1],fRed:[4,4,1,1],fYellow:[5,4,1,1],fWhite:[6,4,1,1],fPurple:[7,4,1,1],mint:[4,5,1,1],centella:[5,5,1,1],mugwort:[6,5,1,1],lance:[7,5,1,1],
    lotusPad:[4,6,1,1],lotusPetal:[5,6,1,1],flax:[6,6,1,1],dryLeaf:[7,6,1,1],sAloe:[4,7,1,1],sBerry:[5,7,1,1],sBrown:[6,7,1,1],sWhite:[7,7,1,1]};
  const UV=k=>{const r=RG[k],e=1/AT;return [r[0]*UN/AT+e,1-(r[1]+r[3])*UN/AT+e,(r[0]+r[2])*UN/AT-e,1-r[1]*UN/AT-e];};
  const SUV=k=>{const q=UV(k);return [(q[0]+q[2])/2,(q[1]+q[3])/2];};
  const hsl=(h,s,l,a)=>'hsla('+h.toFixed(1)+','+s.toFixed(1)+'%,'+l.toFixed(1)+'%,'+(a===undefined?1:a)+')';
  const rr=(R,a,b)=>a+(b-a)*R();
  function leafW(shape,t,i){switch(shape){
    case 'oak':return Math.pow(Math.sin(PI*Math.pow(t,1.05)),0.7)*(0.48+0.52*Math.pow(Math.abs(Math.sin(t*PI*4.6+0.5)),0.6));
    case 'lance':return Math.pow(Math.sin(PI*Math.pow(t,0.6)),1.1);
    case 'birch':return Math.pow(Math.sin(PI*Math.pow(t,0.62)),0.85)*(1+((i&1)?0.06:-0.03));
    case 'mint':return Math.pow(Math.sin(PI*Math.pow(t,0.72)),0.7)*(1+((i&1)?0.055:-0.035));
    case 'pinna':return Math.pow(Math.sin(PI*Math.pow(t,0.75)),0.85)*(0.68+0.32*Math.abs(Math.sin(t*PI*6)));
    case 'mugwort':return Math.pow(Math.sin(PI*Math.pow(t,0.85)),0.7)*(0.22+0.78*Math.pow(Math.abs(Math.sin(t*PI*3.5+0.2)),2.2));
    case 'petal':return Math.pow(Math.sin(PI*Math.pow(t,1.55)),0.5);
    case 'ray':return Math.pow(Math.sin(PI*Math.pow(t,0.8)),0.35);
    case 'blade':return Math.pow(1-t,0.8)*ss(0,0.08,t+0.02);
    default:return Math.pow(Math.sin(PI*Math.pow(t,0.78)),0.72);}}
  // leaf from base (x,y) towards angle ang (0 = up, clockwise +), length L, width Wd
  function drawLeaf(c,x,y,ang,L,Wd,shape,fill,o){o=o||{};const N=o.n||(shape==='oak'||shape==='mugwort'||shape==='pinna'?44:22),dx=Math.sin(ang),dy=-Math.cos(ang),px=Math.cos(ang),py=Math.sin(ang),bend=o.bend||0;
    const P=(a,b)=>{const bb=b+bend*a*a/L;return [x+dx*a+px*bb,y+dy*a+py*bb];};const Lp=[],Rp=[],Mp=[];
    for(let i=0;i<=N;i++){const t=i/N,w=leafW(shape,t,i)*Wd/2;Lp.push(P(t*L,-w));Rp.push(P(t*L,w));Mp.push(P(t*L,0));}
    const pa=new Path2D();pa.moveTo(Lp[0][0],Lp[0][1]);for(const p of Lp)pa.lineTo(p[0],p[1]);for(let i=N;i>=0;i--)pa.lineTo(Rp[i][0],Rp[i][1]);pa.closePath();
    c.fillStyle=fill;c.fill(pa);if(o.plain)return;
    c.save();c.clip(pa);
    if(o.grad!==0){const gx=c.createLinearGradient(Mp[0][0],Mp[0][1],Mp[N][0],Mp[N][1]);gx.addColorStop(0,o.g0||'rgba(0,0,0,0.18)');gx.addColorStop(0.5,'rgba(0,0,0,0)');gx.addColorStop(1,o.g1||'rgba(255,255,200,0.10)');c.fillStyle=gx;c.fill(pa);}
    const hp=new Path2D();hp.moveTo(Mp[0][0],Mp[0][1]);for(const p of Lp)hp.lineTo(p[0],p[1]);for(let i=N;i>=0;i--)hp.lineTo(Mp[i][0],Mp[i][1]);c.fillStyle=o.half||'rgba(0,0,0,0.13)';c.fill(hp);
    if(o.spots){for(let k=0;k<o.spots;k++){const t=0.15+(hsh(k,x|0,y|0,3))*0.8,s=(hsh(k,y|0,x|0,4)-.5)*0.8,p=P(t*L,s*leafW(shape,t,0)*Wd/2);c.fillStyle=o.spotC||'rgba(120,90,30,0.35)';c.beginPath();c.arc(p[0],p[1],1+hsh(k,1,x|0,5)*L*0.03,0,7);c.fill();}}
    const vc=o.vein||'rgba(225,240,170,0.42)';c.strokeStyle=vc;c.lineCap='round';c.lineWidth=Math.max(1,L*0.016*(o.vw||1));c.beginPath();c.moveTo(Mp[0][0],Mp[0][1]);for(const p of Mp)c.lineTo(p[0],p[1]);c.stroke();
    const nv=o.nv!==undefined?o.nv:Math.max(2,Math.round(L/(Wd*0.28+5)));c.lineWidth=Math.max(0.7,L*0.0065*(o.vw||1));c.strokeStyle=o.vein2||vc;
    for(let k=1;k<=nv;k++){const t=k/(nv+1)*0.92,w=leafW(shape,Math.min(1,t+0.1),k)*Wd/2*0.92,da=o.va||0.12;for(const s of [-1,1]){const a=P(t*L,0),m=P((t+da*0.45)*L,s*w*0.5),e=P((t+da)*L,s*w);c.beginPath();c.moveTo(a[0],a[1]);c.quadraticCurveTo(m[0],m[1],e[0],e[1]);c.stroke();}}
    c.restore();c.strokeStyle=o.rim||'rgba(25,35,10,0.28)';c.lineWidth=1;c.stroke(pa);}
  const twigPath=(x,y,ang,L,n,R,curl)=>{const P=[[x,y]];let a=ang;for(let i=1;i<=n;i++){a+=(R()-.5)*curl;x+=Math.sin(a)*L/n;y-=Math.cos(a)*L/n;P.push([x,y]);}return P;};
  const drawTwig=(c,P,w0,w1,col)=>{c.strokeStyle=col;c.lineCap='round';for(let i=0;i<P.length-1;i++){c.lineWidth=lerp(w0,w1,i/(P.length-1));c.beginPath();c.moveTo(P[i][0],P[i][1]);c.lineTo(P[i+1][0],P[i+1][1]);c.stroke();}};
  const ptOn=(P,t)=>{const n=P.length-1,f=cl(t)*n,i=Math.min(n-1,Math.floor(f)),k=f-i;return [lerp(P[i][0],P[i+1][0],k),lerp(P[i][1],P[i+1][1],k),Math.atan2(P[i+1][0]-P[i][0],-(P[i+1][1]-P[i][1]))];};
  const fits=(x,y,ang,L,Wd,X,Y,Wc,Hc)=>{const dx=Math.sin(ang),dy=-Math.cos(ang),px=Math.cos(ang),py=Math.sin(ang);for(const [a,b] of [[1,0],[0.5,0.5],[0.5,-0.5],[0.25,0.42],[0.25,-0.42],[0.75,0.36],[0.75,-0.36]]){const qx=x+dx*a*L+px*b*Wd,qy=y+dy*a*L+py*b*Wd;if(qx<X+3||qx>X+Wc-3||qy<Y+3||qy>Y+Hc-3)return false;}return true;};
  // leaves scattered along twigs; back (dark) to front (light)
  function leafCluster(c,X,Y,Wc,Hc,R,tw,o){const L=[];for(let i=0;i<o.n*4&&L.length<o.n;i++){const P=tw[Math.floor(R()*tw.length)],t=1-Math.pow(R(),o.tb||1.6)*(o.tr||0.8),[x,y,ta]=ptOn(P,t);
      let ang=t>0.97?ta+(R()-.5)*0.8:ta+(R()<.5?-1:1)*(o.a0||0.35+R()*(o.spread||0.9));let Ln=rr(R,o.L[0],o.L[1]),Wd=Ln*o.wr*(0.85+R()*0.3);let ok=false;
      for(let k=0;k<4&&!ok;k++){if(fits(x,y,ang,Ln,Wd,X,Y,Wc,Hc))ok=true;else{Ln*=0.8;Wd*=0.8;}}if(!ok||Ln<o.L[0]*0.45)continue;L.push({x,y,ang,Ln,Wd,d:R(),dry:R()<(o.dry||0),h:R(),s:R()});}
    L.sort((a,b)=>a.d-b.d);for(const l of L){const lit=lerp(o.lit[0],o.lit[1],l.d),col=l.dry?hsl(rr(R,38,55),rr(R,45,60),lit+8):hsl(lerp(o.hue[0],o.hue[1],l.h),lerp(o.sat[0],o.sat[1],l.s),lit);
      drawLeaf(c,l.x,l.y,l.ang,l.Ln,l.Wd,o.shape,col,{bend:(R()-.5)*(o.bend||0.3),vein:o.vein,half:o.half,spots:R()<0.25?3:0,vw:o.vw});}}
  function buildAtlas(){const cv=document.createElement('canvas');cv.width=cv.height=AT;const c=cv.getContext('2d',{willReadFrequently:true});
    const box=k=>{const r=RG[k];return [r[0]*UN,r[1]*UN,r[2]*UN,r[3]*UN];};const BR='hsl(25,28%,24%)';
    {// OAK: twig with rosettes of lobed leaves
      const [X,Y,Wc,Hc]=box('oak'),R=RNG(101),ox=X+Wc/2,oy=Y+Hc-6,tw=[twigPath(ox,oy,0.05,Hc*0.62,6,R,0.4)];for(let k=0;k<5;k++){const [x,y,a]=ptOn(tw[0],0.25+k*0.15);tw.push(twigPath(x,y,a+(k%2?1.0:-1.0),Hc*0.36,4,R,0.5));}
      tw.forEach((P,i)=>drawTwig(c,P,i?4:7,2,BR));leafCluster(c,X,Y,Wc,Hc,R,tw,{n:54,shape:'oak',L:[115,165],wr:0.56,hue:[78,98],sat:[32,48],lit:[20,36],dry:0.07,spread:1.1,tb:2.2});}
    {// BIRCH: slender drooping twigs with small serrated leaves
      const [X,Y,Wc,Hc]=box('birch'),R=RNG(202),ox=X+Wc/2,oy=Y+Hc-6,tw=[twigPath(ox,oy,0,Hc*0.86,8,R,0.35)];for(let k=0;k<6;k++){const [x,y,a]=ptOn(tw[0],0.15+k*0.13);tw.push(twigPath(x,y,a+(k%2?0.7:-0.7),Hc*0.34,5,R,0.4));}
      tw.forEach((P,i)=>drawTwig(c,P,i?2.5:4,1.2,'hsl(20,30%,22%)'));leafCluster(c,X,Y,Wc,Hc,R,tw,{n:110,shape:'birch',L:[52,80],wr:0.68,hue:[72,90],sat:[40,55],lit:[28,46],dry:0.05,spread:1.0,tb:1.2,tr:0.9,vw:0.8});}
    {// PINE: bottle-brush needle spray
      const [X,Y,Wc,Hc]=box('pine'),R=RNG(303),ox=X+Wc/2,oy=Y+Hc-4,tw=[twigPath(ox,oy,0,Hc*0.86,8,R,0.25)];for(let k=0;k<6;k++){const [x,y,a]=ptOn(tw[0],0.12+k*0.13);tw.push(twigPath(x,y,a+(k%2?0.75:-0.75),Hc*(0.36-k*0.03),5,R,0.3));}
      tw.forEach((P,i)=>drawTwig(c,P,i?3.5:6,2,'hsl(20,35%,26%)'));const nd=[];
      tw.forEach((P,ti)=>{for(let t=0.08;t<=1.0;t+=0.025){const [x,y,a]=ptOn(P,t);const n=5+Math.floor(R()*3);for(let k=0;k<n;k++){const sd=k%2?1:-1,an=a+sd*(0.25+R()*0.7),Ln=rr(R,60,100)*(1-0.35*t*(ti?1:0.4));nd.push({x,y,an,Ln,d:R()});}}});
      nd.sort((a,b)=>a.d-b.d);c.lineCap='round';for(const q of nd){let L=q.Ln;let ex=q.x+Math.sin(q.an)*L,ey=q.y-Math.cos(q.an)*L;let k=0;while((ex<X+3||ex>X+Wc-3||ey<Y+3||ey>Y+Hc-3)&&k<5){L*=0.8;ex=q.x+Math.sin(q.an)*L;ey=q.y-Math.cos(q.an)*L;k++;}if(k>=5)continue;
        const gr=c.createLinearGradient(q.x,q.y,ex,ey);gr.addColorStop(0,hsl(rr(R,95,115),rr(R,30,40),lerp(14,24,q.d)));gr.addColorStop(1,hsl(rr(R,80,100),rr(R,35,50),lerp(26,42,q.d)));c.strokeStyle=gr;c.lineWidth=3.2;
        c.beginPath();c.moveTo(q.x,q.y);c.quadraticCurveTo(q.x+Math.sin(q.an)*L*0.5+Math.cos(q.an)*L*0.06,q.y-Math.cos(q.an)*L*0.5+Math.sin(q.an)*L*0.06,ex,ey);c.stroke();}}
    {// BROAD (ficus / shrub / berry): glossy ovate leaves
      const [X,Y,Wc,Hc]=box('broad'),R=RNG(404),ox=X+Wc/2,oy=Y+Hc-6,tw=[twigPath(ox,oy,0,Hc*0.7,6,R,0.4)];for(let k=0;k<5;k++){const [x,y,a]=ptOn(tw[0],0.25+k*0.15);tw.push(twigPath(x,y,a+(k%2?0.9:-0.9),Hc*0.3,4,R,0.4));}
      tw.forEach((P,i)=>drawTwig(c,P,i?3:5,1.5,BR));leafCluster(c,X,Y,Wc,Hc,R,tw,{n:58,shape:'ovate',L:[95,140],wr:0.52,hue:[95,115],sat:[38,52],lit:[17,32],dry:0.015,spread:1.0,tb:1.4,half:'rgba(0,0,0,0.16)',vein:'rgba(200,230,150,0.38)'});
      c.globalCompositeOperation='source-atop';for(let i=0;i<70;i++){const x=X+R()*Wc,y=Y+R()*Hc;const gr=c.createRadialGradient(x,y,0,x,y,14);gr.addColorStop(0,'rgba(255,255,230,0.12)');gr.addColorStop(1,'rgba(255,255,230,0)');c.fillStyle=gr;c.fillRect(x-14,y-14,28,28);}c.globalCompositeOperation='source-over';}
    {// BAMBOO: fan of long lanceolate leaves on thin twigs
      const [X,Y,Wc,Hc]=box('bamboo'),R=RNG(505),ox=X+Wc/2,oy=Y+Hc-6,tw=[twigPath(ox,oy,0,Hc*0.55,5,R,0.3)];for(let k=0;k<4;k++){const [x,y,a]=ptOn(tw[0],0.3+k*0.2);tw.push(twigPath(x,y,a+(k%2?0.6:-0.6),Hc*0.22,3,R,0.3));}
      tw.forEach((P,i)=>drawTwig(c,P,i?3:4,1.5,'hsl(60,30%,32%)'));leafCluster(c,X,Y,Wc,Hc,R,tw,{n:44,shape:'lance',L:[180,290],wr:0.16,hue:[82,100],sat:[36,50],lit:[20,36],dry:0.05,a0:0.15,spread:0.9,tb:1.0,tr:0.9,bend:0.5,nv:0,vein:'rgba(230,240,160,0.35)'});}
    {// ACACIA: bipinnate feathery leaves
      const [X,Y,Wc,Hc]=box('acacia'),R=RNG(606),ox=X+Wc/2,oy=Y+Hc-6,main=twigPath(ox,oy,0,Hc*0.86,7,R,0.3);drawTwig(c,main,5,2,'hsl(25,25%,26%)');const it=[];
      for(let k=0;k<26;k++){const t=0.12+k/26*0.86,[x,y,a]=ptOn(main,t),sd=k%2?1:-1,an=a+sd*(0.9+R()*0.5),Ln=Wc*0.36*(1-t*0.45)*(0.8+R()*0.3);it.push({x,y,an,Ln,d:R()});}
      it.sort((a,b)=>a.d-b.d);for(const p of it){let L=p.Ln;const P=twigPath(p.x,p.y,p.an,L,4,R,0.2).filter(q=>q[0]>X+6&&q[0]<X+Wc-6&&q[1]>Y+6&&q[1]<Y+Hc-6);if(P.length<2)continue;drawTwig(c,P,2,1,'hsl(60,25%,30%)');
        for(let t=0.06;t<1;t+=0.045){const [x,y,a]=ptOn(P,t);for(const s of [-1,1]){const col=hsl(rr(R,70,88),rr(R,28,40),lerp(18,36,p.d)+R()*6);if(fits(x,y,a+s*1.15,13,7,X,Y,Wc,Hc))drawLeaf(c,x,y,a+s*1.15,15,7.5,'ovate',col,{plain:1});}}}}
    {// FERN frond: rachis + pinnae (pinnatifid)
      const [X,Y,Wc,Hc]=box('fern'),R=RNG(707),ra=twigPath(X+Wc/2,Y+Hc-4,0,Hc*0.95,8,R,0.06);drawTwig(c,ra,6,1.5,'hsl(70,35%,26%)');const np=24;
      for(let k=0;k<np;k++){const t=0.05+0.94*k/np;const [x,y,a]=ptOn(ra,t);for(const s of [-1,1]){const Ln=Wc*0.47*Math.pow(Math.sin(PI*Math.min(1,0.22+t*0.82)),0.8)*(1-t*0.25),an=a+s*(PI/2-0.32-t*0.35);if(Ln<8)continue;
          let L=Ln;for(let q=0;q<4&&!fits(x,y,an,L,L*0.24,X,Y,Wc,Hc);q++)L*=0.85;drawLeaf(c,x,y,an,L,L*0.24,'pinna',hsl(rr(R,92,108),rr(R,40,52),rr(R,24,36)),{bend:s*-0.12,nv:Math.round(L/9),va:0.08,vw:0.7});}}}
    {// GRASS blades
      const [X,Y,Wc,Hc]=box('grass'),R=RNG(808);for(let k=0;k<9;k++){const bx=X+Wc*(0.3+R()*0.4),ang=(R()-.5)*0.55,Ln=Hc*rr(R,0.62,0.97),wd=rr(R,13,22),bend=(R()-.5)*0.5;
        const P=(a,b)=>{const bb=b+bend*a*a/Ln;return [bx+Math.sin(ang)*a+Math.cos(ang)*bb,Y+Hc-2-Math.cos(ang)*a+Math.sin(ang)*bb];};const pa=new Path2D(),N=16;
        for(let i=0;i<=N;i++){const t=i/N,p=P(t*Ln,-leafW('blade',t)*wd/2);i?pa.lineTo(p[0],p[1]):pa.moveTo(p[0],p[1]);}for(let i=N;i>=0;i--){const t=i/N,p=P(t*Ln,leafW('blade',t)*wd/2);pa.lineTo(p[0],p[1]);}
        const a=P(0,0),b=P(Ln,0),gr=c.createLinearGradient(a[0],a[1],b[0],b[1]),hu=rr(R,75,95),dry=R()<0.3;gr.addColorStop(0,hsl(hu+10,40,16));gr.addColorStop(0.45,hsl(hu,42,32));gr.addColorStop(1,dry?hsl(48,45,58):hsl(hu-8,45,46));
        c.fillStyle=gr;c.fill(pa);c.strokeStyle='rgba(230,240,190,0.25)';c.lineWidth=1.2;c.beginPath();c.moveTo(a[0],a[1]);const m=P(Ln*0.5,0);c.quadraticCurveTo(m[0],m[1],b[0],b[1]);c.stroke();}}
    {// PLUME (cogon / reed flower head)
      const [X,Y,Wc,Hc]=box('plume'),R=RNG(909),cx=X+Wc/2;drawTwig(c,[[cx,Y+Hc],[cx+2,Y+Hc*0.55],[cx+6,Y+Hc*0.08]],5,2,'hsl(60,25%,45%)');
      for(let i=0;i<900;i++){const t=R(),y=lerp(Y+Hc*0.56,Y+16,t),w=Wc*0.22*Math.sin(PI*Math.min(1,0.15+t*0.9))*(0.4+R()*0.6),x=cx+4*t+(R()-.5)*2*w,a=(R()-.5)*0.8-(x-cx)*0.004,L=rr(R,14,30);
        c.strokeStyle=R()<0.2?'rgba(190,160,150,0.55)':'rgba(226,220,204,0.58)';c.lineWidth=rr(R,1.2,2.4);c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.sin(a)*L,y-Math.cos(a)*L);c.stroke();}}
    {// PALM frond (rachis along +x at mid height)
      const [X,Y,Wc,Hc]=box('palm'),R=RNG(1010),cy=Y+Hc/2;const it=[];
      for(let k=0;k<88;k++){const s=k/88;if(R()<0.05)continue;for(const sd of [-1,1]){const th=0.95-0.25*s+(R()-.5)*0.1,ang=sd<0?PI/2-th:PI/2+th,maxL=(Hc/2-5)/Math.sin(th),Ln=maxL*Math.pow(Math.sin(PI*Math.min(1,0.06+s*1.0)),0.45)*(0.9+R()*0.1);
          it.push({x:X+8+s*(Wc-24),y:cy+sd*2,ang,Ln,d:R(),sd,dry:R()<0.05});}}
      it.sort((a,b)=>a.d-b.d);for(const l of it)if(l.Ln>10)drawLeaf(c,l.x,l.y,l.ang,l.Ln,rr(R,10,14),'lance',l.dry?hsl(42,45,48):hsl(rr(R,72,90),rr(R,42,55),lerp(26,40,l.d)),{bend:l.sd*0.18,nv:0,vein:'rgba(235,240,170,0.5)',vw:1.4,grad:0});
      drawTwig(c,[[X+4,cy],[X+Wc*0.5,cy],[X+Wc-6,cy]],6,2,'hsl(60,32%,40%)');}
    const bananaLeaf=(k,dry,seed)=>{const [X,Y,Wc,Hc]=box(k),R=RNG(seed),cy=Y+Hc/2,x0=X+4,Ln=Wc-10,N=60,P=[],Q=[];
      for(let i=0;i<=N;i++){const t=i/N,w=(Hc/2-4)*Math.pow(Math.sin(PI*Math.min(1,0.02+t*1.0)),0.32)*(t>0.93?Math.sqrt(Math.max(0,1-(t-0.93)/0.07)):1);P.push([x0+t*Ln,cy-w]);Q.push([x0+t*Ln,cy+w]);}
      const pa=new Path2D();pa.moveTo(P[0][0],P[0][1]);P.forEach(p=>pa.lineTo(p[0],p[1]));for(let i=N;i>=0;i--)pa.lineTo(Q[i][0],Q[i][1]);pa.closePath();
      const gr=c.createLinearGradient(0,Y,0,Y+Hc);if(dry){gr.addColorStop(0,hsl(34,22,30));gr.addColorStop(0.5,hsl(38,26,42));gr.addColorStop(1,hsl(32,20,28));}else{gr.addColorStop(0,hsl(98,44,24));gr.addColorStop(0.5,hsl(90,46,36));gr.addColorStop(1,hsl(102,42,22));}
      c.fillStyle=gr;c.fill(pa);c.save();c.clip(pa);
      for(let i=0;i<260;i++){const t=i/260,x=x0+t*Ln;c.strokeStyle=dry?'rgba(70,45,20,0.25)':'rgba(220,240,170,0.16)';c.lineWidth=1;for(const s of [-1,1]){c.beginPath();c.moveTo(x,cy);c.quadraticCurveTo(x+6,cy+s*Hc*0.25,x+16,cy+s*Hc*0.5);c.stroke();}}
      for(let i=0;i<40;i++){const x=x0+R()*Ln,y=cy+(R()-.5)*Hc,r=rr(R,3,dry?16:7);c.fillStyle=dry?'rgba(90,60,30,0.35)':'rgba(120,110,40,0.28)';c.beginPath();c.ellipse(x,y,r*1.6,r,0,0,7);c.fill();}
      const eg=c.createLinearGradient(0,Y,0,Y+Hc);eg.addColorStop(0,dry?'rgba(60,35,15,0.5)':'rgba(120,100,40,0.45)');eg.addColorStop(0.1,'rgba(0,0,0,0)');eg.addColorStop(0.9,'rgba(0,0,0,0)');eg.addColorStop(1,dry?'rgba(60,35,15,0.5)':'rgba(120,100,40,0.45)');c.fillStyle=eg;c.fill(pa);
      c.restore();c.globalCompositeOperation='destination-out';const nt=dry?60:46;
      for(let i=0;i<nt;i++){const x=x0+Ln*(0.1+R()*0.85),s=R()<.5?-1:1,d=Hc/2*(dry?rr(R,0.35,0.95):rr(R,0.3,0.85));c.lineWidth=rr(R,1.5,dry?5:3.2);c.beginPath();c.moveTo(x+18,cy+s*Hc/2);c.lineTo(x+18-d*0.3,cy+s*(Hc/2-d));c.stroke();}
      if(dry)for(let i=0;i<10;i++){const x=x0+R()*Ln,y=cy+(R()-.5)*Hc*0.8;c.beginPath();c.ellipse(x,y,rr(R,4,14),rr(R,3,8),0,0,7);c.fill();}
      c.globalCompositeOperation='source-over';c.strokeStyle=dry?'hsl(35,40%,55%)':'hsl(70,45%,70%)';c.lineCap='round';for(let i=0;i<3;i++){c.lineWidth=[9,6,3][i];c.beginPath();c.moveTo(x0+Ln*i/3,cy);c.lineTo(x0+Ln*(i+1)/3,cy);c.stroke();}};
    bananaLeaf('banana',false,1111);bananaLeaf('bananaDry',true,1212);
    const flowerHead=(k,n,L,Wp,shape,fill,center,seed,o)=>{const [X,Y,Wc,Hc]=box(k),R=RNG(seed),cx=X+Wc/2,cy=Y+Hc/2;o=o||{};
      for(let layer=0;layer<(o.layers||1);layer++)for(let i=0;i<n;i++){const a=i/n*TAU+layer*PI/n+(R()-.5)*0.12,l=L*(1-layer*0.18)*(0.9+R()*0.15);drawLeaf(c,cx+Math.sin(a)*(o.r0||4),cy-Math.cos(a)*(o.r0||4),a,l,Wp,shape,typeof fill==='function'?fill(R,layer):fill,{bend:(R()-.5)*0.2,nv:o.nv||0,vein:o.vein||'rgba(255,255,255,0.18)',half:'rgba(0,0,0,0.08)',grad:o.grad,g0:o.g0,g1:o.g1,rim:'rgba(0,0,0,0.12)'});}
      center(c,cx,cy,R);};
    const disc=(r,c1,c2,dots)=>(c,cx,cy,R)=>{const gr=c.createRadialGradient(cx,cy,0,cx,cy,r);gr.addColorStop(0,c1);gr.addColorStop(1,c2);c.fillStyle=gr;c.beginPath();c.arc(cx,cy,r,0,7);c.fill();
      for(let i=0;i<(dots||0);i++){const a=R()*TAU,d=Math.sqrt(R())*r*0.9;c.fillStyle=R()<.5?'rgba(60,30,0,0.45)':'rgba(255,230,120,0.5)';c.beginPath();c.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d,1.6,0,7);c.fill();}};
    flowerHead('fRed',5,112,104,'petal',(R)=>hsl(rr(R,354,362)%360,rr(R,70,82),rr(R,40,48)),(c,cx,cy,R)=>{disc(22,'hsl(345,60%,16%)','hsl(350,70%,30%)')(c,cx,cy,R);for(let i=0;i<26;i++){const a=R()*TAU,d=10+R()*16;c.strokeStyle='hsl(48,80%,62%)';c.lineWidth=2;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(a)*d,cy+Math.sin(a)*d);c.stroke();c.fillStyle='hsl(50,90%,70%)';c.beginPath();c.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d,2.2,0,7);c.fill();}},1313,{vein:'rgba(120,0,20,0.25)',nv:6,g0:'rgba(80,0,0,0.25)'});
    flowerHead('fYellow',13,104,30,'ray',(R)=>hsl(rr(R,44,50),rr(R,85,95),rr(R,52,60)),disc(36,'hsl(32,70%,28%)','hsl(38,80%,40%)',220),1414,{r0:22,vein:'rgba(200,120,0,0.25)',nv:3,layers:2});
    flowerHead('fWhite',22,100,17,'ray',(R)=>hsl(rr(R,40,55),rr(R,15,35),rr(R,90,96)),disc(26,'hsl(42,90%,42%)','hsl(48,95%,55%)',140),1515,{r0:14,vein:'rgba(150,150,120,0.25)',nv:2,layers:1});
    flowerHead('fPurple',5,100,92,'petal',(R)=>hsl(rr(R,305,318),rr(R,45,60),rr(R,58,68)),(c,cx,cy,R)=>{for(let i=0;i<70;i++){const a=R()*TAU,d=12+R()*22;c.strokeStyle='hsl(320,50%,80%)';c.lineWidth=1.3;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(a)*d,cy+Math.sin(a)*d);c.stroke();c.fillStyle='hsl(48,85%,62%)';c.beginPath();c.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d,1.7,0,7);c.fill();}disc(9,'hsl(90,40%,40%)','hsl(320,40%,60%)')(c,cx,cy,R);},1616,{vein:'rgba(120,20,90,0.22)',nv:5,g0:'rgba(90,0,60,0.22)'});
    flowerHead('flax',5,104,88,'petal',(R)=>hsl(rr(R,212,222),rr(R,60,72),rr(R,60,68)),disc(12,'hsl(55,80%,80%)','hsl(210,50%,70%)'),1717,{vein:'rgba(30,40,140,0.35)',nv:7});
    {const [X,Y,Wc,Hc]=box('mint');drawLeaf(c,X+Wc/2,Y+Hc-8,0,Hc-18,Wc*0.66,'mint',hsl(102,46,36),{vein:'rgba(20,50,10,0.45)',vein2:'rgba(20,50,10,0.35)',half:'rgba(255,255,200,0.07)',nv:6,va:0.16,vw:1.3});}
    {const [X,Y,Wc,Hc]=box('lance');drawLeaf(c,X+Wc/2,Y+Hc-6,0,Hc-12,Wc*0.36,'lance',hsl(100,44,34),{nv:14,va:0.22,vein:'rgba(220,240,170,0.32)',vw:0.9});}
    {const [X,Y,Wc,Hc]=box('dryLeaf');drawLeaf(c,X+Wc/2,Y+Hc-8,0.1,Hc-20,Wc*0.55,'oak',hsl(30,48,36),{vein:'rgba(240,200,140,0.35)',spots:6});}
    {const [X,Y,Wc,Hc]=box('mugwort');drawLeaf(c,X+Wc/2,Y+Hc-6,0,Hc-14,Wc*0.84,'mugwort',hsl(100,18,46),{vein:'rgba(240,245,235,0.55)',half:'rgba(255,255,255,0.1)',rim:'rgba(240,245,235,0.5)',nv:4,va:0.18});}
    const roundLeaf=(k,r,col,veinC,crenate,notch,seed)=>{const [X,Y,Wc,Hc]=box(k),R=RNG(seed),cx=X+Wc/2,cy=Y+Hc/2,pa=new Path2D(),N=96;
      for(let i=0;i<=N;i++){const a=notch+0.12+(TAU-0.24)*i/N,rr2=r*(1+crenate*Math.sin(a*16)+(R()-.5)*0.01);const p=[cx+Math.sin(a)*rr2,cy+Math.cos(a)*rr2];i?pa.lineTo(p[0],p[1]):pa.moveTo(cx,cy),pa.lineTo(p[0],p[1]);}pa.closePath();
      const gr=c.createRadialGradient(cx,cy,0,cx,cy,r);gr.addColorStop(0,col[0]);gr.addColorStop(1,col[1]);c.fillStyle=gr;c.fill(pa);c.save();c.clip(pa);c.strokeStyle=veinC;
      for(let i=0;i<13;i++){const a=notch+0.35+(TAU-0.7)*i/12;c.lineWidth=2.2;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.sin(a)*r,cy+Math.cos(a)*r);c.stroke();c.lineWidth=1;for(let j=1;j<4;j++){const d=r*j/4.2;c.beginPath();c.arc(cx,cy,d,-a+PI/2-0.15,-a+PI/2+0.15);c.stroke();}}
      c.restore();c.strokeStyle='rgba(20,40,20,0.35)';c.lineWidth=1.4;c.stroke(pa);};
    roundLeaf('centella',112,[hsl(92,52,46),hsl(98,50,32)],'rgba(220,245,170,0.45)',0.035,0,1818);
    roundLeaf('lotusPad',120,[hsl(120,26,50),hsl(145,32,32)],'rgba(200,230,200,0.4)',0.008,0,1919);
    {const [X,Y,Wc,Hc]=box('lotusPetal');drawLeaf(c,X+Wc/2,Y+Hc-6,0,Hc-12,Wc*0.66,'petal',hsl(336,72,74),{g0:'rgba(255,255,255,0.65)',g1:'rgba(200,30,100,0.35)',half:'rgba(255,255,255,0.08)',vein:'rgba(210,60,120,0.3)',nv:9,va:0.25,rim:'rgba(200,40,110,0.4)'});}
    const solid=(k,base,noise,seed,spots)=>{const [X,Y,Wc,Hc]=box(k),R=RNG(seed);c.fillStyle=base;c.fillRect(X,Y,Wc,Hc);for(let i=0;i<400;i++){c.fillStyle=noise[i%noise.length];c.fillRect(X+R()*Wc,Y+R()*Hc,rr(R,2,6),rr(R,2,6));}
      if(spots)for(let i=0;i<80;i++){c.fillStyle=spots;c.beginPath();c.ellipse(X+R()*Wc,Y+R()*Hc,rr(R,2,6),rr(R,1.5,3),0,0,7);c.fill();}};
    solid('sAloe',hsl(120,22,44),['rgba(0,0,0,0.08)','rgba(255,255,255,0.06)'],2020,'rgba(230,240,220,0.5)');solid('sBerry',hsl(352,78,36),['rgba(0,0,0,0.1)','rgba(255,200,200,0.08)'],2121);
    solid('sBrown',hsl(30,25,52),['rgba(0,0,0,0.12)','rgba(255,255,255,0.07)'],2222);solid('sWhite','#f0f0ec',['rgba(0,0,0,0.05)','rgba(255,255,255,0.05)'],2323);
    const id=c.getImageData(0,0,AT,AT);bleed(id.data,AT,AT);const t=dataTex(id.data,AT,AT,{srgb:1,an:16});t.userData={atlas:1};return {tex:t,canvas:cv};}
  const ATL=buildAtlas();TX.leaf=ATL.tex;

  /* ======================================== 2. MATERIALS + WIND ======================================== */
  const TIME=(K&&K.GU&&K.GU.time)||{value:0};M.v6time=TIME;
  // wk: 0 bark (bend), 1 leaf (bend + flutter + translucency + alpha-mip fix), 2 impostor (bend + alpha-mip fix)
  function windify(m,wk,ever){if(wk)m.extensions={derivatives:true};
    m.onBeforeCompile=(sh)=>{sh.uniforms.time=TIME;
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float time;').replace('#include <begin_vertex>',`#include <begin_vertex>
  {vec4 v6o=vec4(0.0,0.0,0.0,1.0);
  #ifdef USE_INSTANCING
  v6o=instanceMatrix*v6o;
  #endif
  v6o=modelMatrix*v6o;float v6p=v6o.x*0.0137+v6o.z*0.0171;float v6h=max(transformed.y,0.0);
  float v6b=pow(v6h*0.01,1.5)*1.1;float v6g=sin(time*0.83+v6p)*0.6+sin(time*1.97+v6p*2.3)*0.22+0.3;
  transformed.x+=v6b*v6g;transformed.z+=v6b*0.5*sin(time*0.61+v6p*1.7);
  #if ${wk===1?1:0}
  float v6f=clamp(v6h*0.09,0.0,1.0)*(1.0-step(0.5,uv.x)*step(uv.y,0.125));float v6q=dot(transformed,vec3(0.23,0.19,0.17));
  float v6a=0.28+0.9*clamp(v6h*0.04,0.0,1.0)*0.4;
  transformed+=vec3(sin(time*4.7+v6q+v6p),0.55*sin(time*3.9+v6q*1.3+v6p),cos(time*4.3+v6q*0.9+v6p))*v6f*v6a;
  #endif
  }`);
      if(ever)sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>',`#ifdef USE_COLOR
  diffuseColor.rgb=(diffuseColor.rgb*vColor).grb/max(vColor,vec3(0.001));
  #endif
  #include <color_fragment>`).replace('#include <alphamap_fragment>','diffuseColor.rgb=diffuseColor.grb;\n#include <alphamap_fragment>');
      if(wk)sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','#ifdef USE_MAP\n  diffuseColor*=texture2D(map,vUv,'+(wk===2?'-0.75':'-0.4')+');\n#endif');
      if(wk){sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\n#ifdef DOUBLE_SIDED\nnormal=normal*faceDirection;\n#endif')
        .replace('#include <alphatest_fragment>',`#if defined(USE_MAP) && (__VERSION__ >= 300 || defined(GL_OES_standard_derivatives))
  {vec2 v6t=vUv*${wk===2?'4096.0':'2048.0'};vec2 v6x=dFdx(v6t),v6y=dFdy(v6t);float v6l=max(0.5*log2(max(dot(v6x,v6x),dot(v6y,v6y))),0.0);diffuseColor.a*=1.0+v6l*${wk===2?'0.4':'0.3'};}
  #endif
  #include <alphatest_fragment>`);
        if(wk===1)sh.fragmentShader=sh.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
  #if NUM_DIR_LIGHTS > 0
  {float v6s=pow(max(dot(-geometry.viewDir,directionalLights[0].direction),0.0),3.0);reflectedLight.indirectDiffuse+=diffuseColor.rgb*directionalLights[0].color*(0.05+0.32*v6s);}
  #endif`);}};
    m.customProgramCacheKey=()=>'v6w'+wk+(ever?'e':'');return m;}
  const mkMat=(name,p,wk,ever)=>{const m=new T.MeshStandardMaterial(Object.assign({vertexColors:true,metalness:0},p));m.name=name;m.userData.key=name;return windify(m,wk,ever);};
  const MT={v6Bark:mkMat('v6Bark',{map:TX.bark.map,normalMap:TX.bark.nmap,normalScale:new T.Vector2(1.3,1.3),roughness:0.95},0),
    v6Birch:mkMat('v6Birch',{map:TX.birch.map,normalMap:TX.birch.nmap,normalScale:new T.Vector2(0.8,0.8),roughness:0.85},0),
    v6Ring:mkMat('v6Ring',{map:TX.ring.map,normalMap:TX.ring.nmap,normalScale:new T.Vector2(1,1),roughness:0.75},0),
    v6Leaf:mkMat('v6Leaf',{map:TX.leaf,side:DS,alphaTest:0.5,roughness:0.72},1)};
  MT.v6LeafE=mkMat('v6LeafE',{map:TX.leaf,side:DS,alphaTest:0.5,roughness:0.72},1,true);// evergreen: same look, exempt from the game's autumn tint (snow still applies)
  M.mat6v=MT;M.grassMat=MT.v6Leaf;M.v6tex=TX;M.v6atlasCanvas=ATL.canvas;

  /* ======================================== 3. GEOMETRY HELPERS ======================================== */
  function GB(){this.p=[];this.n=[];this.u=[];this.c=[];this.i=[];this.k=0;}
  GB.prototype.v=function(p,n,u,v,c){this.p.push(p[0],p[1],p[2]);this.n.push(n[0],n[1],n[2]);this.u.push(u,v);this.c.push(c[0],c[1],c[2]);return this.k++;};
  GB.prototype.t=function(a,b,c){this.i.push(a,b,c);return this;};
  GB.prototype.q=function(a,b,c,d){this.i.push(a,b,c,a,c,d);return this;};
  GB.prototype.nt=function(){return this.i.length/3;};
  GB.prototype.mesh=function(mat,o){if(!this.i.length)return null;o=o||{};const ge=new T.BufferGeometry();ge.setAttribute('position',new T.Float32BufferAttribute(this.p,3));ge.setAttribute('normal',new T.Float32BufferAttribute(this.n,3));
    ge.setAttribute('uv',new T.Float32BufferAttribute(this.u,2));ge.setAttribute('color',new T.Float32BufferAttribute(this.c,3));ge.setIndex(this.i);ge.computeBoundingSphere();
    const m=new T.Mesh(ge,MT[mat]||mat);m.name=m.material.name;m.castShadow=o.shadow!==false;m.receiveShadow=true;return m;};
  const addM=(G,...L)=>{L.forEach(([B,m,o])=>{const ms=B.mesh(m,o);if(ms)G.add(ms);});return G;};
  function frames(P){const L=P.length,F=[];let nr=null;for(let i=0;i<L;i++){const d=nrm(sub(P[Math.min(L-1,i+1)],P[Math.max(0,i-1)]));nr=nr?nrm(sub(nr,mul(d,dot(nr,d)))):perp(d);F.push([d,nr,crs(d,nr)]);}return F;}
  // smooth tube along P; rad: array | fn(i,angle,dist); o:{sides,u0,us (u repeats round),vs (du per v),col(p,radial,i,dist),tip,rot}
  function tube(B,P,rad,sides,o){o=o||{};const L=P.length,F=frames(P),rings=[];let acc=0;const rf=(i,a,d)=>typeof rad==='function'?rad(i,a,d):rad[i];
    for(let i=0;i<L;i++){if(i)acc+=len(sub(P[i],P[i-1]));const [d,nr,bn]=F[i],ring=[];
      for(let j=0;j<=sides;j++){const a=j/sides*TAU+(o.rot||0),rd=add(mul(nr,Math.cos(a)),bn,Math.sin(a)),p=add(P[i],rd,rf(i,a,acc));
        ring.push(B.v(p,rd,(o.u0||0)+j/sides*(o.us===undefined?1:o.us),(o.v0||0)+acc/(o.vs||20),o.col?o.col(p,rd,i,acc):W1));}rings.push(ring);}
    for(let i=0;i<L-1;i++)for(let j=0;j<sides;j++)B.q(rings[i][j],rings[i][j+1],rings[i+1][j+1],rings[i+1][j]);
    if(o.tip){const d=F[L-1][0],tp=Array.isArray(o.tip)?o.tip:add(P[L-1],d,rf(L-1,0,acc)*1.2+0.2),ti=B.v(tp,d,(o.u0||0)+0.5*(o.us===undefined?1:o.us),(o.v0||0)+(acc+len(sub(tp,P[L-1])))/(o.vs||20),o.col?o.col(tp,d,L-1,acc):W1);
      for(let j=0;j<sides;j++)B.t(rings[L-1][j],rings[L-1][j+1],ti);}
    return rings;}
  const ptAt=(P,t)=>{const n=P.length-1,f=cl(t)*n,i=Math.min(n-1,Math.floor(f));return lrp(P[i],P[i+1],f-i);};
  const dirAt=(P,t)=>{const n=P.length-1,i=Math.min(n-1,Math.floor(cl(t)*n));return nrm(sub(P[i+1],P[i]));};
  const atY=(P,y)=>{for(let i=0;i<P.length-1;i++)if(P[i+1][1]>=y){const k=cl((y-P[i][1])/((P[i+1][1]-P[i][1])||1));return lrp(P[i],P[i+1],k);}return P[P.length-1];};
  function grow(p0,d0,Ln,n,R,o){o=o||{};const P=[p0];let d=nrm(d0),p=p0;for(let k=1;k<=n;k++){const f=k/n;d=nrm(add(d,[(R()-.5)*(o.w||0.3),(o.up||0)-(o.g||0)*f+(R()-.5)*(o.w||0.3)*0.5,(R()-.5)*(o.w||0.3)]));p=add(p,d,Ln/n);P.push(p);}return P;}
  // leaf cards: {b base(bottom-centre), up, rt, w, h, uv, tint, bend, bd, flip}
  function emitCards(B,cards,shade){for(const c of cards){const q=c.uv,segs=c.bend?2:1,ix=[],cn=nrm(crs(c.rt,c.up));
      for(let r=0;r<=segs;r++){const t=r/segs;for(const s of [-0.5,0.5]){let p=add(add(c.b,c.rt,s*c.w),c.up,t*c.h);if(c.bend)p=add(p,c.bd||[0,-1,0],c.bend*t*t);const sh=shade(p,c,cn);
          ix.push(B.v(p,sh[0],(s<0)!==!!c.flip?q[0]:q[2],lerp(q[1],q[3],t),mul(c.tint,sh[1])));}}
      for(let r=0;r<segs;r++)B.q(ix[r*2],ix[r*2+1],ix[r*2+3],ix[r*2+2]);}}
  // crown shading: normals out of the crown ellipsoid (+ a little of the card's own facing), AO darker inside / below
  const crownShade=(cc,cr,lo,up)=>(p,c,cn)=>{const q=[(p[0]-cc[0])/cr[0],(p[1]-cc[1])/cr[1],(p[2]-cc[2])/cr[2]],d=len(q),qn=nrm(add(q,[0,up===undefined?0.35:up,0]));
    const s=dot(cn,qn)<0?-1:1,n=nrm(add(qn,cn,0.3*s));const ao=(lo+(1-lo)*ss(0.05,1.0,d))*(0.74+0.26*cl(q[1]*0.5+0.55));return [n,ao];};
  const plantShade=(H,lo)=>(p,c,cn)=>{const s=cn[1]<0?-1:1,n=nrm(add(mul(cn,s*0.55),[0,0.85,0]));return [n,lo+(1-lo)*ss(-H*0.1,H*0.75,p[1])];};
  const crownOf=(pts,pad,mn)=>{let a=[1e9,1e9,1e9],b=[-1e9,-1e9,-1e9];pts.forEach(p=>{for(let k=0;k<3;k++){a[k]=Math.min(a[k],p[k]);b[k]=Math.max(b[k],p[k]);}});
    return {c:lrp(a,b,0.5),r:[0,1,2].map(k=>Math.max(mn||1,(b[k]-a[k])/2+pad))};};
  // tint: species leaf colour with per-card variation (+ some yellowed)
  const leafTint=(R,base,dry)=>{if(R()<(dry===undefined?0.06:dry))return [1.25,1.08,0.55];const k=0.86+R()*0.26,h=(R()-.5)*0.12;return [base[0]*k*(1+h),base[1]*k,base[2]*k*(1-h*0.5)];};
  const barkCol=(tint,H,moss,seed)=>(p,rd)=>{const y=p[1],ao=0.62+0.38*ss(-2,Math.min(30,H*0.25),y),n=hsh(Math.round(p[0]*0.3),Math.round(y*0.15),Math.round(p[2]*0.3),seed)*0.16+0.92;
    let c=mul(tint,ao*n);if(moss){const m=moss*ss(30,0,y)*cl(0.3+rd[2]*0.7+rd[0]*0.2);c=lrp(c,[0.32*ao,0.4*ao,0.16*ao],m);}return c;};
  const BT={pine:[0.9,0.66,0.52],oak:[0.78,0.72,0.64],birch:[1,1,0.98],dead:[0.86,0.82,0.76],acacia:[0.58,0.5,0.44],banyan:[0.8,0.78,0.72],twig:[0.6,0.5,0.4]};
  const LT={oak:[1,1,1],birch:[0.95,0.98,0.88],pine:[0.95,1,0.98],broad:[1,1,1],acacia:[0.95,0.98,0.9],bamboo:[0.82,0.9,0.75]};
  // soil mound (planted saplings) on the solid patch of the atlas
  function mound(B,r,h,seed){const R=RNG(seed),uv=SUV('sBrown'),n=8,c=B.v([0,h,0],UP,uv[0],uv[1],[0.55,0.42,0.3]),rim=[];
    for(let i=0;i<=n;i++){const a=i/n*TAU,rr2=r*(0.85+0.3*hsh(i%n,seed,3,1));rim.push(B.v([Math.cos(a)*rr2,-0.3,-Math.sin(a)*rr2],nrm([Math.cos(a),1.2,-Math.sin(a)]),uv[0],uv[1],[0.42,0.32,0.23]));}
    for(let i=0;i<n;i++)B.t(c,rim[i],rim[i+1]);}
  const finish=(G,ud)=>{Object.assign(G.userData,ud||{});return G;};

  /* ======================================== 4. TREES ======================================== */
  // generic broadleaf tree (oak / birch / acacia-like) — returns G
  function broadTree(o,seed){const R=RNG(seed),H=o.H,R0=o.R0,W=new GB(),Lf=new GB(),top=H*(o.lead||0.72),TH=H*o.tr,lean=[(R()-.5)*0.05,(R()-.5)*0.05];
    const P=[];[-3,0,R0*0.9,TH*0.5,TH,lerp(TH,top,0.5),top].forEach(y=>{const f=Math.max(0,y)/top;P.push([lean[0]*y+Math.sin(f*3+seed)*R0*0.35*f,y,lean[1]*y+Math.cos(f*2.3+seed)*R0*0.35*f]);});
    const rTr=y=>{const f=cl(y/top);return R0*Math.max(0.12,1-0.78*f)*(1+(o.flare||0.55)*Math.exp(-Math.max(0,y)/(R0*1.3)));};
    const bark=o.bark||'v6Bark',tint=o.tint,bc=barkCol(tint,H,o.moss,seed),circ=TAU*R0,us=Math.max(1,Math.round(circ/14));
    tube(W,P,(i,a)=>{const y=P[i][1];return rTr(y)*(1+0.24*Math.exp(-Math.max(0,y)/(R0*1.1))*Math.pow(Math.max(0,Math.cos(a*5+seed)),2));},o.ts,{us,vs:circ/us*(bark==='v6Birch'?1.4:2),col:o.trunkCol||bc,tip:true});
    const anc=[];
    for(let b=0;b<o.nb;b++){const f=o.nb>1?b/(o.nb-1):0.5,y=lerp(TH,top*0.95,Math.pow(f,o.bp||0.9)),az=b*2.39996+seed+R()*0.6,el=lerp(o.el[0],o.el[1],f)+(R()-.5)*0.25,Ln=H*lerp(o.bl[0],o.bl[1],f)*(0.85+R()*0.3);
      const r0=Math.max(0.25,rTr(y)*lerp(0.62,0.45,f)),d0=azd(az,el),p0=add(atY(P,y),d0,-r0*0.4),ns=o.bseg||3,BP=grow(p0,d0,Ln,ns,R,{w:o.bw||0.35,up:o.bup||0.06,g:o.bg||0.15});
      if(o.bsides)tube(W,BP,BP.map((_,i)=>r0*lerp(1,0.22,i/ns)),o.bsides,{vs:Math.max(3,r0*TAU*2),col:bc,tip:true});
      anc.push({p:BP[ns],d:dirAt(BP,1),w:1.2},{p:ptAt(BP,0.6),d:dirAt(BP,0.6),w:0.8},{p:ptAt(BP,0.35),d:dirAt(BP,0.35),w:0.35});
      for(let k=0;k<o.n2;k++){const t=0.38+0.58*(k+R()*0.6)/o.n2,q=ptAt(BP,t),pd=dirAt(BP,t),sd=nrm(crs(pd,UP)),d2=nrm(add(add(pd,sd,(k%2?1:-1)*(0.6+R()*0.6)),[0,o.up2===undefined?0.25+R()*0.3:o.up2,0])),L2=Ln*(0.4+R()*0.22),r2=r0*lerp(1,0.22,t)*0.62;
        const TP=grow(q,d2,L2,2,R,{w:0.4,up:0.05,g:o.g2||0.12});if(o.tsides&&r2>0.25)tube(W,TP,[r2,r2*0.45,r2*0.15],o.tsides,{vs:Math.max(3,r2*TAU*2),col:bc});anc.push({p:TP[2],d:dirAt(TP,1),w:1},{p:TP[1],d:dirAt(TP,0.5),w:0.6});}}
    anc.push({p:P[P.length-1],d:UP,w:1.2});
    const cr=crownOf(anc.map(a=>a.p),o.cs*0.55,o.cs),cards=[],tw=anc.reduce((s,a)=>s+a.w,0);const uv=UV(o.leaf);
    anc.forEach(a=>{const n=Math.round(o.nc*a.w/tw+R()*0.6);for(let k=0;k<n;k++){const out=nrm(sub(a.p,[cr.c[0],a.p[1]-cr.r[1]*0.3,cr.c[2]]));let up=o.hang?nrm(add(add(mul(a.d,0.35),[0,-1,0]),rdir(R),0.55)):nrm(add(add(add(mul(a.d,0.6),out,0.5),[0,0.25,0]),rdir(R),0.8));
        const rt=nrm(crs(up,rdir(R))),s=o.cs*(0.72+R()*0.5),b=add(add(a.p,rdir(R),o.cs*(o.spr||1.1)*Math.sqrt(R())),up,-s*(o.hang?0.1:0.3));cards.push({b,up,rt,w:s,h:s,uv,tint:leafTint(R,o.lt||W1,o.dry),flip:R()<.5});}});
    emitCards(Lf,cards,crownShade(cr.c,cr.r,o.ao||0.4));
    const G=addM(g(),[W,bark],[Lf,'v6Leaf']);let top2=0;G.children.forEach(m=>{const p=m.geometry.attributes.position;for(let i=1;i<p.array.length;i+=3)top2=Math.max(top2,p.array[i]);});
    const kf=top2>H*1.05?H*1.04/top2:1;if(kf<1)G.children.forEach(m=>{m.geometry.scale(kf,kf,kf);m.geometry.computeBoundingSphere();});
    const rr0=Math.max(1,Math.round(R0*kf));return finish(G,{h:Math.round(Math.min(top2,H*1.04)),r:rr0,colliders:[[0,0,rr0]]});}
  const OAK=[{H:24,R0:0.8,tr:0.32,nb:3,n2:1,cs:7.5,nc:24,ts:5,bsides:3,tsides:0,el:[0.5,1.0],bl:[0.32,0.2],spr:0.8},
    {H:80,R0:3,tr:0.36,nb:6,n2:2,cs:16,nc:250,ts:7,bsides:4,tsides:3,el:[0.35,0.95],bl:[0.42,0.26],spr:1.2},
    {H:150,R0:7,tr:0.4,nb:7,n2:3,cs:25,nc:580,ts:9,bsides:5,tsides:3,el:[0.3,0.95],bl:[0.44,0.26],moss:0.5,spr:1.35},
    {H:270,R0:13.5,tr:0.36,nb:9,n2:3,cs:36,nc:820,ts:11,bsides:5,tsides:3,el:[0.22,0.9],bl:[0.46,0.26],moss:0.7,flare:0.7,spr:1.35}];
  const BIRCH=[{H:24,R0:0.7,tr:0.35,nb:3,n2:1,cs:6.5,nc:24,ts:5,bsides:3,tsides:0,el:[0.7,1.1],bl:[0.28,0.16],lead:0.92,spr:0.8},
    {H:80,R0:2.3,tr:0.3,nb:8,n2:2,cs:12,nc:230,ts:6,bsides:3,tsides:3,el:[0.65,1.05],bl:[0.3,0.16],lead:0.93,hang:1,g2:0.6,up2:-0.3},
    {H:160,R0:4.5,tr:0.32,nb:12,n2:2,cs:19,nc:520,ts:8,bsides:4,tsides:3,el:[0.6,1.0],bl:[0.3,0.15],lead:0.93,hang:1,g2:0.7,up2:-0.35,bg:0.3,spr:1.2},
    {H:290,R0:8,tr:0.34,nb:13,n2:3,cs:28,nc:720,ts:9,bsides:4,tsides:3,el:[0.55,0.95],bl:[0.3,0.15],lead:0.92,hang:1,g2:0.7,up2:-0.35,bg:0.3,spr:1.25}];
  const birchTrunkCol=(H,seed)=>(p)=>{const y=p[1],b=ss(H*0.06,0,y);const n=hsh(Math.round(p[0]),Math.round(y*0.4),Math.round(p[2]),seed)*0.08+0.96;return mul([lerp(1,0.32,b),lerp(1,0.29,b),lerp(0.98,0.27,b)],n*(0.75+0.25*ss(-2,12,y)));};
  function oakT(st,seed){const o=Object.assign({tint:BT.oak,leaf:'oak',lt:LT.oak},OAK[st]);return broadTree(o,seed*17+3+st*977);}
  function birchT(st,seed){const o=Object.assign({tint:BT.birch,leaf:'birch',lt:LT.birch,bark:'v6Birch'},BIRCH[st]);o.trunkCol=birchTrunkCol(o.H,seed);return broadTree(o,seed*13+5+st*977);}
  // conifer: whorls of drooping branches carrying needle-spray cards
  const PINE=[{H:25,R0:0.9,yb:0.2,nw:5,bpw:3,cs:8,ts:5,bs:0,rc:0.3,cd:2.6},{H:80,R0:2.8,yb:0.2,nw:11,bpw:5,cs:15,ts:6,bs:3,rc:0.25,cd:3.4},{H:180,R0:6,yb:0.22,nw:15,bpw:5,cs:25,ts:8,bs:3,rc:0.23,cd:3.6},{H:330,R0:11,yb:0.42,nw:15,bpw:6,cs:36,ts:10,bs:3,rc:0.21,old:1,cd:3.4}];
  function pineT(st,seed){const o=PINE[st],R=RNG(seed*31+7+st*977),H=o.H,R0=o.R0,W=new GB(),Lf=new GB(),Rc=H*o.rc,yb=H*o.yb,lean=[(R()-.5)*0.03,(R()-.5)*0.03];
    const P=[];for(let k=0;k<=7;k++){const y=k===0?-3:H*0.97*k/7;P.push([lean[0]*y+(R()-.5)*R0*0.3,y,lean[1]*y+(R()-.5)*R0*0.3]);}
    const circ=TAU*R0,us=Math.max(1,Math.round(circ/14)),bc=barkCol(BT.pine,H,0.3,seed);
    tube(W,P,(i,a)=>{const y=Math.max(0,P[i][1]),f=y/H;return R0*Math.max(0.08,1-0.92*f)*(1+0.5*Math.exp(-y/(R0*1.2))*(1+0.25*Math.pow(Math.max(0,Math.cos(a*4+seed)),2)));},o.ts,{us,vs:circ/us*2,col:bc,tip:true});
    const env=t=>o.old?Rc*Math.pow(Math.max(0,1-Math.pow(t,2.2)),0.6)*(0.75+0.25*Math.sin(t*PI)):Rc*Math.pow(1-t,0.9)+o.cs*0.25;
    const cards=[],uv=UV('pine'),pts=[];
    for(let w=0;w<o.nw;w++){const t=w/(o.nw-1),y=lerp(yb,H*0.93,t),Rw=env(t);
      for(let b=0;b<o.bpw;b++){const az=w*0.9+b*TAU/o.bpw+R()*0.7,Ln=Rw*(0.8+R()*0.35),el=lerp(-0.12,0.45,t)+(R()-.5)*0.2,p0=atY(P,y),d0=azd(az,el),BP=grow(p0,d0,Ln,2,R,{w:0.25,up:0.02,g:o.old?0.1:0.32});
        const r0=Math.max(0.3,R0*0.32*(1-t*0.7));if(o.bs&&Ln>R0*2&&(b+w)%2===0)tube(W,BP,[r0,r0*0.5,r0*0.15],o.bs,{vs:6,col:bc});
        const nc=Math.max(2,Math.round(Ln/o.cs*o.cd));for(let k=0;k<nc;k++){const s=0.25+0.75*(k+R())/nc,q=ptAt(BP,s),bd=dirAt(BP,s),hz=nrm([bd[0],0,bd[2]]),side=nrm(crs(hz,UP)),tl=(R()<0.3?(R()-.5)*2.4:(R()-.5)*0.9);
          const up=nrm(add(add(bd,rdir(R),0.3),[0,0.12,0])),rt=nrm(add(mul(side,Math.cos(tl)),[0,1,0],Math.sin(tl))),sz=o.cs*(0.75+R()*0.45)*(1-t*0.25);
          cards.push({b:add(q,up,-sz*0.35),up,rt,w:sz,h:sz,uv,tint:leafTint(R,LT.pine,0.03),flip:R()<.5,t});pts.push(q);}}}
    for(let k=0;k<4;k++){const a=k*PI/4+R(),rt=[Math.cos(a),0,Math.sin(a)];cards.push({b:add(P[7],[0,-o.cs*0.6,0]),up:UP,rt,w:o.cs*0.7,h:o.cs*0.9,uv,tint:leafTint(R,LT.pine,0),t:1});}
    const shade=(p,c,cn)=>{const y=p[1],t=cl((y-yb)/(H*0.93-yb)),ax=atY(P,y),dx=p[0]-ax[0],dz=p[2]-ax[2],rr2=Math.hypot(dx,dz),e=Math.max(o.cs*0.5,env(t)+o.cs*0.3),q=nrm([dx/e,(o.old?0.5:0.6)+0.0,dz/e]);
      const s=dot(cn,q)<0?-1:1,n=nrm(add(q,cn,0.25*s)),ao=(0.42+0.58*ss(0.1,1.0,rr2/e))*(0.68+0.32*t)*(o.old?1:1);return [n,ao];};
    emitCards(Lf,cards,shade);const r=Math.max(1,Math.round(R0));return finish(addM(g(),[W,'v6Bark'],[Lf,'v6LeafE']),{h:H,r,colliders:[[0,0,r]]});}
  // dead tree: broken top, crooked bare branches with snapped ends
  const DEAD=[{H:25,R0:0.9,nb:2,ts:5},{H:70,R0:3,nb:4,ts:6},{H:130,R0:5.5,nb:6,ts:8}];
  function deadT(st,seed){const o=DEAD[Math.min(2,st)],R=RNG(seed*7+1+st*977),H=o.H,R0=o.R0,W=new GB(),th=H*0.82,P=[];
    for(let k=0;k<=6;k++){const y=k===0?-3:th*k/6;P.push([(R()-.5)*R0*0.5*k/6+0.02*y,y,(R()-.5)*R0*0.5*k/6]);}
    const tint=BT.dead,circ=TAU*R0,us=Math.max(1,Math.round(circ/14)),bc=(p,rd)=>{const y=p[1],pe=ss(0.55,0.7,hsh(Math.round(p[0]*0.25),Math.round(y*0.08),Math.round(p[2]*0.25),seed));return mul(lrp(tint,[1.2,1.08,0.9],pe*0.8),(0.65+0.35*ss(-2,20,y)));};
    tube(W,P,(i,a)=>{const y=Math.max(0,P[i][1]),f=y/th;return R0*Math.max(0.3,1-0.7*f)*(1+0.45*Math.exp(-y/(R0*1.2))*(1+0.3*Math.pow(Math.max(0,Math.cos(a*4+seed)),2)));},o.ts,{us,vs:circ/us*2,col:bc,
      tip:add(P[6],[R0*0.25,H*0.06+1,0])});
    for(let i=0;i<o.nb;i++){const f=0.34+0.52*(o.nb>1?i/(o.nb-1):0.5)+(R()-.5)*0.05,y=th*f,a=i*2.4+R()*0.7,Ln=H*(0.38-0.2*f)*(0.8+R()*0.4),d0=azd(a,0.35+R()*0.7),r0=Math.max(0.3,R0*(1-0.7*f)*0.5),BP=grow(atY(P,y),d0,Ln,3,R,{w:0.6,up:0.12});
      tube(W,BP,[r0,r0*0.7,r0*0.45,r0*0.3],st?5:3,{vs:Math.max(3,r0*TAU*2),col:bc,tip:add(BP[3],dirAt(BP,1),r0*0.8)});
      const nk=st===2?2:st;for(let k=0;k<nk;k++){const t=0.4+0.4*k,q=ptAt(BP,t),pd=dirAt(BP,t),d2=nrm(add(add(pd,nrm(crs(pd,UP)),(k%2?1:-1)*0.9),[0,0.5,0])),TP=grow(q,d2,Ln*(0.35+R()*0.2),2,R,{w:0.6,up:0.1});
        const r2=r0*0.5;tube(W,TP,[r2,r2*0.6,r2*0.35],3,{vs:4,col:bc,tip:add(TP[2],dirAt(TP,1),r2)});}}
    const r=Math.max(1,Math.round(R0));return finish(addM(g(),[W,'v6Bark']),{h:H,r,colliders:[[0,0,r]]});}
  const TREE={pine:pineT,oak:oakT,birch:birchT,dead:deadT};
  const prevTree=M.tree,prevTreeLo=M.treeLo;
  M.tree=(kind,stage,seed)=>{kind=TREE[kind]?kind:'pine';stage=stage===undefined?2:Math.max(0,Math.min(3,stage|0));if(kind==='dead'&&stage>2)stage=2;seed=+seed||1;return TREE[kind](stage,seed);};

  /* ---------- savanna acacia: forked trunk, flat umbrella crown ---------- */
  M.savannaTree=(seed)=>{seed=+seed||1;const R=RNG(seed*23+9),H=120+R()*50,W=new GB(),Lf=new GB(),bc=barkCol(BT.acacia,H,0,seed),fork=[(R()-.5)*8,H*0.4,(R()-.5)*8];
    tube(W,[[0,-2,0],[0,H*0.12,0],[fork[0]*0.6,H*0.28,fork[2]*0.6],fork],(i,a)=>[5,4.1,3.5,3.1][i]*(1+(i===0?0.35*Math.pow(Math.max(0,Math.cos(a*4)),2):0)),7,{us:2,vs:24,col:bc});
    const anc=[],Rc=H*0.42;for(let b=0;b<3;b++){const a=b/3*TAU+R()*0.8,d=H*(0.2+R()*0.08),mid=[fork[0]+Math.cos(a)*d*0.5,H*0.62,fork[2]-Math.sin(a)*d*0.5],tp=[fork[0]+Math.cos(a)*d,H*(0.76+R()*0.06),fork[2]-Math.sin(a)*d];
      tube(W,[fork,mid,tp],[2.7,1.9,1.1],5,{vs:14,col:bc});for(let k=0;k<3;k++){const a2=a+(k-1)*0.9+(R()-.5)*0.3,L2=H*(0.14+R()*0.08),e=[tp[0]+Math.cos(a2)*L2,tp[1]+H*(0.03+R()*0.04),tp[2]-Math.sin(a2)*L2],m=lrp(tp,e,0.5);m[1]+=2;
        tube(W,[tp,m,e],[1.1,0.6,0.25],3,{vs:8,col:bc});anc.push(e,m);}anc.push(tp);}
    const yC=H*0.84,cards=[],uv=UV('acacia');for(let i=0;i<340;i++){const a=anc[Math.floor(R()*anc.length)],ang=R()*TAU,dd=Math.sqrt(R())*H*0.12,p=[a[0]+Math.cos(ang)*dd,lerp(a[1],yC,0.5)+(R()-.5)*H*0.07,a[2]-Math.sin(ang)*dd];
      const out=nrm([p[0],0,p[2]]),up=nrm(add(add(out,rdir(R),0.6),[0,0.15,0])),side=nrm(crs(up,UP)),tl=(R()-.5)*0.7,rt=nrm(add(mul(side,Math.cos(tl)),UP,Math.sin(tl))),s=H*0.13*(0.75+R()*0.5);
      cards.push({b:add(p,up,-s*0.4),up,rt,w:s,h:s,uv,tint:leafTint(R,LT.acacia,0.05),flip:R()<.5});}
    const cr=crownOf(cards.map(c=>c.b),H*0.06,10);cr.r[1]=Math.max(cr.r[1],H*0.07);emitCards(Lf,cards,crownShade(cr.c,cr.r,0.45,0.6));
    return finish(addM(g(),[W,'v6Bark'],[Lf,'v6Leaf']),{r:5,h:Math.round(H*0.94),colliders:[[0,0,5]]});};

  /* ---------- banyan (cây đa): fluted trunk, buttresses, pillar + aerial roots, huge crown ---------- */
  M.banyan=(seed)=>{seed=+seed||1;const R=RNG(seed*73+11),H=300+R()*80,TH=H*0.36,W=new GB(),Lf=new GB(),bc=barkCol(BT.banyan,H,0.4,seed);
    tube(W,[[0,-6,0],[0,10,0],[1,TH*0.35,1],[-1,TH*0.7,0],[0,TH,-1]],(i,a)=>[30,24,20,18,17][i]*(1+0.22*Math.sin(a*7+seed)+0.1*Math.sin(a*13)),12,{us:6,vs:40,col:bc});
    for(let i=0;i<6;i++){const a=i/6*TAU+R()*0.5,c=Math.cos(a),s=-Math.sin(a),y0=30+R()*35,r1=30+R()*10;tube(W,[[c*14,y0,s*14],[c*22,y0*0.45,s*22],[c*r1,-3,s*r1]],[4.5,5.4,6.5],5,{vs:20,col:bc});}
    const limbs=[],anc=[],no=9;for(let i=0;i<no;i++){const a=i/no*TAU+(R()-.5)*0.3,d=125+R()*30,p0=[Math.cos(a)*8,TH*(0.85+R()*0.15),-Math.sin(a)*8],p2=[Math.cos(a)*d,H*(0.6+R()*0.06),-Math.sin(a)*d],p1=lrp(p0,p2,0.5);p1[1]+=18;
      tube(W,[p0,p1,p2],[9,6,3.2],6,{vs:24,col:bc});limbs.push([p0,p1,p2]);anc.push({p:p2,d:nrm(sub(p2,p1)),w:1.4},{p:p1,d:UP,w:0.6});
      for(let k=0;k<2;k++){const q=ptAt([p0,p1,p2],0.55+k*0.3),d2=nrm(add(azd(a+(k?0.8:-0.8),0.7),[0,0.2,0])),TP=grow(q,d2,45+R()*20,2,R,{w:0.3});tube(W,TP,[2.5,1.4,0.5],4,{vs:12,col:bc});anc.push({p:TP[2],d:d2,w:1},{p:TP[1],d:d2,w:0.5});}}
    for(let i=0;i<5;i++){const a=i/5*TAU+0.3,d=55+R()*30,e=[Math.cos(a)*d,H*(0.74+R()*0.06),-Math.sin(a)*d];tube(W,[[0,TH*0.95,0],lrp([0,TH,0],e,0.5),e],[7,4,1.6],5,{vs:20,col:bc});anc.push({p:e,d:UP,w:1.3});}
    anc.push({p:[0,H*0.84,0],d:UP,w:1.5});
    const pil=[];for(let i=0;i<4;i++){const L=limbs[(i*2+1)%no],tp=ptAt(L,0.62+R()*0.15),x=tp[0]+(R()-.5)*6,z=tp[2]+(R()-.5)*6;tube(W,[[x,-3,z],[x+(R()-.5)*3,tp[1]*0.5,z+(R()-.5)*3],tp],[4.2,3.2,2.6],5,{vs:16,col:bc});pil.push([x,z]);}
    const rc=p=>mul([0.62,0.5,0.4],0.7+0.3*hsh(Math.round(p[0]),Math.round(p[2]),seed,5));
    for(let i=0;i<28;i++){const L=limbs[i%no],tp=ptAt(L,0.35+R()*0.6),x=tp[0]+(R()-.5)*8,z=tp[2]+(R()-.5)*8,y1=Math.max(4,tp[1]-(40+R()*(tp[1]-40)));tube(W,[[x,tp[1]-2,z],[x+(R()-.5)*3,y1,z+(R()-.5)*3]],[0.9+R()*0.5,0.3],3,{vs:10,col:rc});}
    const cr=crownOf(anc.map(a=>a.p),40,40),cards=[],uv=UV('broad'),tw=anc.reduce((s,a)=>s+a.w,0);
    anc.forEach(a=>{const n=Math.round(735*a.w/tw);for(let k=0;k<n;k++){const out=nrm(sub(a.p,[0,a.p[1]-30,0])),up=nrm(add(add(mul(a.d,0.4),out,0.6),rdir(R),0.8)),rt=nrm(crs(up,rdir(R))),s=50*(0.75+R()*0.5),dd=rdir(R);dd[1]*=0.55;
      cards.push({b:add(add(a.p,dd,42*Math.sqrt(R())),up,-s*0.3),up,rt,w:s,h:s,uv,tint:leafTint(R,LT.broad,0.04),flip:R()<.5});}});
    emitCards(Lf,cards,crownShade(cr.c,cr.r,0.38));
    return finish(addM(g(),[W,'v6Bark'],[Lf,'v6Leaf']),{r:40,colliders:[[0,0,40],...pil.map(([x,z])=>[+x.toFixed(1),+z.toFixed(1),6])]});};

  /* ---------- coconut palm ---------- */
  // frond / long-leaf strip along rachis points Rp (rachis→ u), half widths hw(s), fold (radians, edges drop), uv region
  function strip(B,Rp,hw,fold,uv,tintF,shadeF,o){o=o||{};const n=Rp.length-1,ix=[];
    for(let k=0;k<=n;k++){const s=k/n,p=Rp[k],d=dirAt(Rp,Math.min(0.999,s)),sd=nrm(crs(d,UP)),dn=nrm(crs(sd,d)),w=hw(s),u=lerp(uv[0],uv[2],o.u?o.u(s):s),vm=(uv[1]+uv[3])/2,f=fold+(o.twist?o.twist*s:0);
      const L=add(add(p,sd,-w*Math.cos(f)),dn,-w*Math.sin(f)),Rr=add(add(p,sd,w*Math.cos(f)),dn,-w*Math.sin(f)),nm=nrm(add(dn,[0,0.5,0])),tn=tintF(s);
      ix.push([B.v(L,shadeF(L,nm),u,uv[3],mul(tn,o.ao?o.ao(s):1)),B.v(p,nm,u,vm,mul(tn,o.ao?o.ao(s):1)),B.v(Rr,shadeF(Rr,nm),u,uv[1],mul(tn,o.ao?o.ao(s):1))]);}
    for(let k=0;k<n;k++){const a=ix[k],b=ix[k+1];B.q(a[0],a[1],b[1],b[0]);B.q(a[1],a[2],b[2],b[1]);}}
  M.palm=(seed)=>{seed=+seed||1;const R=RNG(seed*71+9),H=160+R()*60,la=R()*TAU,ln=0.22+R()*0.14,ca=Math.cos(la),sa=-Math.sin(la),Tk=new GB(),Lf=new GB();
    const P=[];for(let k=0;k<=8;k++){const t=k/8,off=H*ln*Math.pow(t,1.7)-H*0.04*Math.sin(t*PI);P.push([ca*off,k===0?-3:t*H*0.97,sa*off]);}
    tube(Tk,P,(i,a)=>{const t=i/8;return lerp(5.6,3.0,Math.pow(t,0.6))*(1+0.35*Math.exp(-P[i][1]/6));},8,{us:2,vs:5,col:p=>mul([0.62,0.56,0.5],0.75+0.25*ss(0,30,p[1])+0.1*hsh(Math.round(p[1]/5),seed,1,2))});
    const top=P[8],sw=SUV('sBrown');tube(Tk,[add(top,[0,-3,0]),add(top,[0,2,0]),add(top,[0,5,0])],[3.4,3.8,1.2],6,{vs:6,col:()=>[0.45,0.4,0.3]});
    const nf=16;for(let i=0;i<nf;i++){const dead=i>=nf-2,a=i*2.39996+R()*0.4,L=dead?45+R()*10:88+R()*28,up=dead?-1.1:i<4?0.8+R()*0.3:0.1+R()*0.55,droop=dead?0.2:0.85,c0=Math.cos(a),s0=-Math.sin(a);
      const Rp=[];for(let k=0;k<=8;k++){const s=k/8,hz=L*s*(dead?0.3:0.9),y=top[1]+2+L*(up*s-droop*s*s);Rp.push([top[0]+c0*hz,y,top[2]+s0*hz]);}
      const tn=dead?[0.7,0.55,0.36]:mul(leafTint(R,[0.85,0.95,0.8],0),1);strip(Lf,Rp,s=>L*0.19*Math.pow(Math.sin(PI*Math.min(1,0.08+s*0.97)),0.5),dead?0.9:0.55,UV('palm'),()=>tn,(p,nm)=>nm,{ao:s=>0.55+0.45*ss(0,0.6,s)});}
    const nc=4+(R()<0.5?1:0);for(let i=0;i<nc;i++){const a=i/nc*TAU+R(),c=[top[0]+Math.cos(a)*4.6,top[1]-2.5+R()*1.4,top[2]-Math.sin(a)*4.6],col=R()<0.6?[0.38,0.45,0.16]:[0.5,0.36,0.2];
      const ge=new T.IcosahedronGeometry(3,0);const p=ge.attributes.position;const ix=[];for(let k=0;k<p.count;k++){const v=[p.getX(k),p.getY(k)*1.12,p.getZ(k)];ix.push(Lf.v(add(c,v),nrm(v),sw[0],sw[1],mul(col,0.7+0.3*cl(v[1]/3+0.5))));}for(let k=0;k<ix.length;k+=3)Lf.t(ix[k],ix[k+1],ix[k+2]);ge.dispose();}
    return finish(addM(g(),[Tk,'v6Ring'],[Lf,'v6LeafE']),{r:5});};

  /* ---------- bamboo clump ---------- */
  M.bamboo=(seed)=>{seed=+seed||1;const R=RNG(seed*61+3),Cu=new GB(),Lf=new GB(),N=9+Math.floor(R()*4),uv=UV('bamboo');let maxD=0;const cards=[];
    for(let i=0;i<N;i++){const a=i/N*TAU+(R()-.5)*0.9,d=2+R()*9,young=R()<0.25,x=Math.cos(a)*d,z=-Math.sin(a)*d,h=young?150+R()*40:185+R()*75,r=young?1.7+R()*0.4:2.2+R()*0.8,lean=0.2+R()*0.16+d*0.012,ca=Math.cos(a+(R()-.5)*0.8),sa=-Math.sin(a+(R()-.5)*0.8);maxD=Math.max(maxD,d);
      const col=young?[0.42,0.62,0.22]:R()<0.3?[0.62,0.6,0.3]:[0.36,0.52,0.2],P=[];for(let k=0;k<=5;k++){const t=k/5,off=lean*h*Math.pow(t,2.2);P.push([x+ca*off,k===0?-2:t*h,z+sa*off]);}
      tube(Cu,P,P.map((_,k)=>r*lerp(1,0.35,Math.pow(k/5,1.5))),5,{us:1,vs:16+R()*6,v0:R(),col:(p)=>mul(col,(0.7+0.3*ss(-2,25,p[1]))*(0.9+0.2*hsh(i,Math.round(p[1]/18),seed,3))),tip:true});
      const nl=26+Math.floor(R()*6);for(let k=0;k<nl;k++){const t=0.38+0.62*Math.pow((k+R())/nl,0.7),q=ptAt(P,t),out=nrm([q[0]-x*0.3+(R()-.5)*2,0,q[2]-z*0.3+(R()-.5)*2]),az=Math.atan2(-out[2],out[0])+(R()-.5)*2.2;
        const up=nrm(add(azd(az,-0.25-R()*0.7),rdir(R),0.3)),rt=nrm(crs(up,rdir(R))),s=(19+R()*9)*(0.7+0.3*t);const ho=nrm([Math.cos(az),-0.1,-Math.sin(az)]);cards.push({b:add(add(q,ho,3+R()*11*t),up,-s*0.12),up,rt,w:s,h:s,uv,tint:leafTint(R,LT.bamboo,0.08),flip:R()<.5});}}
    const cr=crownOf(cards.map(c=>c.b),10,20);emitCards(Lf,cards,crownShade(cr.c,cr.r,0.5,0.5));
    return finish(addM(g(),[Cu,'v6Ring'],[Lf,'v6LeafE']),{r:Math.round(Math.max(16,Math.min(24,maxD+10)))});};

  /* ---------- wild banana ---------- */
  function bananaPlant(St,Lf,R,x,z,sc,nl,seed){const sh=(56+R()*22)*sc,lean=[(R()-.5)*3*sc,(R()-.5)*3*sc],top=[x+lean[0],sh,z+lean[1]],sr=4.6*sc,sd=seed;
    tube(St,[[x,-2,z],[x+lean[0]*0.4,sh*0.45,z+lean[1]*0.4],top],[sr*1.15,sr*0.9,sr*0.62],sc>0.7?7:5,{us:1,vs:sh*1.3+10,v0:0.08,col:(p)=>{const t=cl(p[1]/sh),m=ss(0.6,0.8,hsh(Math.round(p[0]*0.4),Math.round(p[1]*0.12),Math.round(p[2]*0.4),sd));return mul(lrp(lrp([0.36,0.42,0.2],[0.5,0.56,0.28],t),[0.4,0.3,0.18],m*0.7),0.75+0.25*t);}});
    const a0=R()*TAU;for(let i=0;i<nl;i++){const a=a0+i/nl*TAU*0.97+(R()-.5)*0.5,L=(78+R()*30)*sc,up=i===0?1.3:0.8+R()*0.35,dr=i%3===2?1.6:0.85+R()*0.3,ca=Math.cos(a),sa=-Math.sin(a),old=R()<0.2;
      const pt=s=>{const hz=s*L*0.86,y=sh*0.95+L*(up*s-dr*s*s*s);return [top[0]+ca*hz,y,top[2]+sa*hz];};const Rp=[];const n=sc>0.7?7:4;for(let k=0;k<=n;k++)Rp.push(pt(0.16+0.84*k/n));
      tube(St,[add(top,[0,-2,0]),Rp[0]],[0.9*sc,0.6*sc],3,{vs:20,col:()=>[0.42,0.5,0.22]});
      const tn=old&&i>0?[0.85,0.78,0.6]:leafTint(R,[0.95,1,0.9],0);strip(Lf,Rp,s=>(13+R()*2)*sc*Math.pow(Math.sin(PI*Math.min(1,0.04+s*0.98)),0.4),0.22+R()*0.25,UV(old&&i>0?'bananaDry':'banana'),()=>tn,(p,nm)=>nm,{twist:(R()-.5)*0.6,ao:s=>0.7+0.3*s});}
    return top;}
  M.banana=(seed)=>{seed=+seed||1;const R=RNG(seed*67+5),St=new GB(),Lf=new GB(),top=bananaPlant(St,Lf,R,0,0,1+(R()-.5)*0.2,6,seed);
    for(let i=0;i<2;i++){const a=R()*TAU,ca=Math.cos(a),sa=-Math.sin(a),y0=top[1]*0.92,Rp=[[ca*4,y0,sa*4],[ca*7,y0-12,sa*7],[ca*7.5,y0-28,sa*7.5],[ca*6.5,y0-42,sa*6.5]];
      strip(Lf,Rp,s=>5.5-s*2.5,1.2,UV('bananaDry'),()=>[0.8,0.72,0.62],(p,nm)=>nm,{u:s=>0.3+s*0.5});}
    {const a=R()*TAU,ca=Math.cos(a),sa=-Math.sin(a),p0=[top[0],top[1]-1,top[2]],p1=[top[0]+ca*12,top[1]-6,top[2]+sa*12],p2=[top[0]+ca*16,top[1]-16,top[2]+sa*16],w=SUV('sWhite');
      tube(Lf,[p0,p1,p2],[0.9,0.8,0.7],3,{u0:w[0],us:0,v0:w[1],vs:1e9,col:()=>[0.4,0.45,0.2]});tube(Lf,[p2,add(p2,[ca*1,-6,sa*1]),add(p2,[ca*1.5,-12,sa*1.5])],[3.3,2.6,0.4],5,{u0:w[0],us:0,v0:w[1],vs:1e9,col:p=>mul([0.42,0.1,0.16],0.8+0.4*cl((p[1]-p2[1]+12)/14))});}
    {const a=R()*TAU,d=12+R()*4;bananaPlant(St,Lf,R,Math.cos(a)*d,-Math.sin(a)*d,0.42,3,seed+9);}
    return finish(addM(g(),[St,'v6Ring'],[Lf,'v6LeafE']),{r:7});};

  /* ======================================== 5. BUSHES & SMALL PLANTS ======================================== */
  const SW=SUV('sWhite');
  // thin stem tube on the white patch, coloured by col
  const stem=(B,P,r0,r1,col,sides)=>tube(B,P,P.map((_,i)=>lerp(r0,r1,i/(P.length-1))),sides||3,{u0:SW[0],us:0,v0:SW[1],vs:1e9,col:typeof col==='function'?(p,rd,i,d)=>mul(col(p,rd,i,d),0.62):()=>mul(col,0.62)});
  // single leaf card from base b along dir d (≈ length), facing roughly up; bend droops the tip
  const leafCard=(cards,b,d,w,l,uvk,tint,R,o)=>{o=o||{};const up=nrm(d),side=nrm(crs(up,Math.abs(up[1])>0.97?[1,0,0]:UP)),roll=(R()-.5)*(o.roll||0.6),rt=nrm(add(mul(side,Math.cos(roll)),crs(side,up),Math.sin(roll)));
    cards.push({b:add(b,rt,0),up,rt,w,h:l,uv:UV(uvk),tint,bend:o.bend===undefined?l*0.25:o.bend,bd:o.bd,flip:R()<.5});};
  M.bush=(kind,seed,_k)=>{_k=_k||1;kind=kind==='berryEmpty'||kind==='shrub'?kind:'berry';seed=+seed||1;const R=RNG(seed*11+kind.length),sh=kind==='shrub',W=new GB(),Lf=new GB(),cards=[],anc=[],H=sh?24:21,Rb=sh?17:18;
    const ns=_k<1?3:sh?7:6;for(let i=0;i<ns;i++){const a=i/ns*TAU+R()*0.6,d0=azd(a,0.9+R()*0.4),P=grow([Math.cos(a)*1.5,-1,-Math.sin(a)*1.5],d0,H*(0.75+R()*0.3),2,R,{w:0.3,g:0.25});stem(W,P,0.7,0.2,BT.twig,3);anc.push(P[1],P[2]);}
    const uv=UV('broad'),nc=Math.round((kind==='berry'?122:sh?150:140)*_k),cen=[0,H*0.5,0];
    for(let i=0;i<nc;i++){const u=rdir(R);u[1]=Math.abs(u[1])*0.9+0.1;const rr2=Math.pow(R(),0.4),p=[u[0]*Rb*rr2,H*0.42+u[1]*H*0.58*rr2,u[2]*Rb*rr2],out=nrm(sub(p,[0,H*0.2,0])),up=nrm(add(add(out,rdir(R),0.7),[0,0.3,0])),rt=nrm(crs(up,rdir(R))),s=(sh?11:10.5)*(0.75+R()*0.5);
      cards.push({b:add(p,up,-s*0.4),up,rt,w:s,h:s,uv,tint:sh?mul(leafTint(R,[0.85,0.95,0.85],0.05),1):leafTint(R,[1,1,0.9],0.04),flip:R()<.5});}
    emitCards(Lf,cards,crownShade(cen,[Rb,H*0.55,Rb],0.4,0.4));
    if(kind==='berry'){const bw=SUV('sBerry');let cc=null;for(let i=0;i<20;i++){if(i%3===0){const u=rdir(R);u[1]=Math.abs(u[1])*0.75+0.12;cc=[u[0]*Rb*1.02,H*0.42+u[1]*H*0.6,u[2]*Rb*1.02];}const c=add(cc,rdir(R),1.8),rb=1.35+R()*0.4,ge=new T.OctahedronGeometry(rb,0),p=ge.attributes.position,ix=[];
      for(let k=0;k<p.count;k++){const v=[p.getX(k),p.getY(k),p.getZ(k)],n=nrm(v);ix.push(Lf.v(add(c,v),n,bw[0],bw[1],mul(R()<0.2?[1.3,0.6,0.5]:[1,1,1],0.75+0.25*n[1])));}for(let k=0;k<ix.length;k+=3)Lf.t(ix[k],ix[k+1],ix[k+2]);ge.dispose();}}
    return addM(g(),[W,'v6Bark'],[Lf,'v6Leaf']);};
  M.flax=(seed)=>{seed=+seed||1;const R=RNG(seed*29+3),B=new GB(),cards=[];
    for(let i=0;i<7;i++){const a=i/7*TAU+R()*0.5,d=0.8+R()*3,x=Math.cos(a)*d,z=-Math.sin(a)*d,h=18+R()*5,lx=Math.cos(a)*(1.5+R()*2),lz=-Math.sin(a)*(1.5+R()*2),tp=[x+lx,h,z+lz];
      stem(B,[[x,-0.5,z],[x+lx*0.4,h*0.55,z+lz*0.4],tp],0.3,0.18,[0.36,0.5,0.2],3);
      for(let k=0;k<3;k++){const f=0.25+k*0.2,b=[x+lx*f*0.6,h*f,z+lz*f*0.6],d2=azd(a+(k%2?1.4:-1.4),0.5);leafCard(cards,b,d2,1.4,5,'grass',[0.85,1,0.85],R,{bend:1});}
      const fd=nrm([lx*0.4,1,lz*0.4]),rt=perp(fd);cards.push({b:add(tp,crs(rt,fd),-2.2),up:crs(rt,fd),rt,w:4.6,h:4.6,uv:UV('flax'),tint:[1,1,1]});
      if(i%3===0){const bd=add(tp,[1.5,-2.5,0.5]);cards.push({b:add(bd,[0,-1.2,0]),up:[0.1,1,0.05],rt:[1,0,0],w:1.6,h:2.6,uv:UV('flax'),tint:[0.9,0.9,1]});}}
    emitCards(B,cards,plantShade(20,0.55));return addM(g(),[B,'v6Leaf']);};
  // generic grass-like clump of blade cards (uv region k), n cards, height h
  function bladeCards(cards,R,n,h,rad,uvk,tint,o){o=o||{};for(let i=0;i<n;i++){const a=R()*TAU,d=Math.sqrt(R())*rad,b=[Math.cos(a)*d,-0.5,-Math.sin(a)*d],fa=R()*TAU,lean=(o.lean||0.25)*(0.4+R()),up=nrm([Math.cos(a)*lean,1,-Math.sin(a)*lean]),rt=nrm(crs(up,[Math.cos(fa),0,Math.sin(fa)]));
    const hh=h*(0.6+R()*0.45),w=o.w?o.w*(0.8+R()*0.4):hh*0.5;cards.push({b,up,rt,w,h:hh,uv:UV(uvk),tint:mul(tint,0.9+R()*0.2),bend:o.bend===undefined?hh*0.25:o.bend,bd:[Math.cos(a),-0.3,-Math.sin(a)],flip:R()<.5});}}
  M.reeds=(seed)=>{seed=+seed||1;const R=RNG(seed*37+5),B=new GB(),cards=[];bladeCards(cards,R,11,28,4.5,'grass',[0.82,0.95,0.7],{w:9,lean:0.2});
    const bw=SUV('sBrown');for(let i=0;i<4;i++){const a=i/4*TAU+0.6+R()*0.5,d=1.2+R()*2.5,x=Math.cos(a)*d,z=-Math.sin(a)*d,hh=22+R()*6,lx=(R()-.5)*2,lz=(R()-.5)*2;
      stem(B,[[x,-0.5,z],[x+lx*0.5,hh*0.5,z+lz*0.5],[x+lx,hh+6,z+lz]],0.35,0.15,[0.5,0.55,0.3],3);tube(B,[[x+lx,hh-1.5,z+lz],[x+lx,hh+5,z+lz]],[1.25,1.1],5,{u0:bw[0],us:0,v0:bw[1],vs:1e9,col:()=>[0.42,0.26,0.14],tip:[x+lx,hh+5.6,z+lz]});}
    emitCards(B,cards,plantShade(26,0.5));return addM(g(),[B,'v6Leaf']);};
  M.reedBed=(seed)=>{seed=+seed||1;const R=RNG(seed*17+3),B=new GB(),cards=[];bladeCards(cards,R,26,30,13,'grass',[0.85,0.95,0.68],{w:10,lean:0.22});
    for(let i=0;i<12;i++){const a=R()*TAU,d=Math.sqrt(R())*11,b=[Math.cos(a)*d*1.1,-0.5,-Math.sin(a)*d*0.8],hh=30+R()*8,up=nrm([Math.cos(a)*0.15,1,-Math.sin(a)*0.15]),rt=perp(up);
      cards.push({b,up,rt:nrm(add(rt,[0,0,R()-0.5])),w:5,h:hh,uv:UV('plume'),tint:[0.6,0.56,0.52],bend:3,bd:[Math.cos(a),0,-Math.sin(a)]});}
    emitCards(B,cards,plantShade(30,0.5));return finish(addM(g(),[B,'v6Leaf']),{r:15,h:34,colliders:[]});};
  M.tallgrass=(seed)=>{seed=+seed||1;const R=RNG(seed*89+19),B=new GB(),cards=[],Hh=26+R()*14;bladeCards(cards,R,10,Hh,4,'grass',[0.95,1,0.8],{w:Hh*0.36,lean:0.28});
    const np=3+(R()<0.6?1:0);for(let i=0;i<np;i++){const a=i/np*TAU+R(),d=R()*3,b=[Math.cos(a)*d,-0.5,-Math.sin(a)*d],up=nrm([Math.cos(a)*0.18,1,-Math.sin(a)*0.18]),f=R()*TAU,rt=nrm(crs(up,[Math.cos(f),0,Math.sin(f)])),hh=Hh*(1.05+R()*0.15);
      for(const rr2 of [rt,nrm(crs(up,rt))])cards.push({b,up,rt:rr2,w:hh*0.3,h:hh,uv:UV('plume'),tint:[0.62,0.6,0.56],bend:2,bd:[Math.cos(a),0,-Math.sin(a)]});}
    emitCards(B,cards,plantShade(Hh,0.5));return addM(g(),[B,'v6Leaf']);};
  M.grassClump=(seed)=>{seed=+seed||1;const R=RNG(seed*97+23),B=new GB(),cards=[],n=5+Math.floor(R()*3),h=9+R()*5;bladeCards(cards,R,n,h,3,'grass',[0.9,1,0.85],{w:h*0.55,lean:0.3});
    const ms=(emitCards(B,cards,(p,c,cn)=>[nrm([cn[0]*0.25,1,cn[2]*0.25]),0.55+0.45*ss(0,h,p[1])]),B.mesh('v6Leaf',{shadow:false}));return g(ms);};
  M.fern=(seed)=>{seed=+seed||1;const R=RNG(seed*79+13),B=new GB(),nf=7+(R()<0.5?1:0),Hh=18+R()*12,a0=R()*TAU,uv=UV('fern');const uvr=[uv[1],uv[0],uv[3],uv[2]];
    for(let i=0;i<nf;i++){const a=a0+i/nf*TAU+(R()-.5)*0.5,L=Hh/0.53*(0.75+R()*0.3),ca=Math.cos(a),sa=-Math.sin(a),up=1.1+R()*0.4,Rp=[];for(let k=0;k<=5;k++){const s=k/5,hz=L*0.55*s+1,y=L*(up*s-0.85*s*s)*0.85;Rp.push([ca*hz,Math.max(0.3,y),sa*hz]);}
      const tn=leafTint(R,[1,1,1],0.05),n=Rp.length-1,ix=[];for(let k=0;k<=n;k++){const s=k/n,p=Rp[k],d=dirAt(Rp,Math.min(0.999,s)),sd=nrm(crs(d,UP)),dn=nrm(crs(sd,d)),w=L*0.27*(1-s*0.15),vv=lerp(uv[1],uv[3],0.02+0.96*s),nm=nrm(add(dn,[0,0.6,0])),ao=0.5+0.5*ss(0,0.7,s);
        const Lp=add(add(p,sd,-w),dn,-w*0.25),Rr=add(add(p,sd,w),dn,-w*0.25);ix.push([B.v(Lp,nm,uv[0],vv,mul(tn,ao)),B.v(p,nm,(uv[0]+uv[2])/2,vv,mul(tn,ao)),B.v(Rr,nm,uv[2],vv,mul(tn,ao))]);}
      for(let k=0;k<n;k++){const a1=ix[k],b1=ix[k+1];B.q(a1[0],a1[1],b1[1],b1[0]);B.q(a1[1],a1[2],b1[2],b1[1]);}}
    return addM(g(),[B,'v6Leaf']);};
  M.lotus=(seed)=>{seed=+seed||1;const R=RNG(seed*83+17),B=new GB(),np=4+Math.floor(R()*4),pads=[],cards=[],pu=UV('lotusPad');
    for(let i=0;i<np;i++){let x,z,r,ok=false;for(let t=0;t<20&&!ok;t++){const a=R()*TAU,d=i===0?0:8+R()*22;x=Math.cos(a)*d;z=-Math.sin(a)*d;r=6+R()*8;ok=pads.every(p=>Math.hypot(p[0]-x,p[1]-z)>p[2]+r*0.7);}pads.push([x,z,r]);
      const rot=R()*TAU,c=Math.cos(rot),s=Math.sin(rot),y=0.15+i*0.03,tn=leafTint(R,[1,1,1],0.08),q=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([u,v])=>B.v([x+(u*c-v*s)*r*1.04,y+(u+v===0?0.25:0),z+(u*s+v*c)*r*1.04],UP,u<0?pu[0]:pu[2],v<0?pu[1]:pu[3],tn));B.q(q[0],q[1],q[2],q[3]);}
    const fa=R()*TAU,fd=6+R()*8,fx=Math.cos(fa)*fd,fz=-Math.sin(fa)*fd,fh=14+R()*8,Fc=[fx,fh,fz];stem(B,[[fx-1,0,fz+0.5],[fx-0.3,fh*0.6,fz+0.2],Fc],0.45,0.35,[0.36,0.45,0.2],3);
    const pet=(n,l,w,el,rot,o)=>{for(let k=0;k<n;k++){const a=rot+k/n*TAU,up=nrm(azd(a,el)),rt=nrm(crs(up,UP));cards.push({b:add(Fc,up,o||0.3),up,rt,w,h:l,uv:UV('lotusPetal'),tint:[1,1,1],bend:-1.2,bd:mul(nrm([Math.cos(a),0,-Math.sin(a)]),-1)});}};
    pet(6,8,5.5,0.55,R(),0.4);pet(5,7,4.8,1.0,R()+0.3,0.2);
    {const yw=SUV('sWhite');tube(B,[[fx,fh+0.5,fz],[fx,fh+2.6,fz]],[1.0,1.7],6,{u0:yw[0],us:0,v0:yw[1],vs:1e9,col:()=>[0.85,0.78,0.3],tip:[fx,fh+2.8,fz]});}
    {const a=fa+2+R()*2,d=8+R()*10,x=Math.cos(a)*d,z=-Math.sin(a)*d,h=11+R()*6,b0=[x,h,z];stem(B,[[x+0.5,0,z-0.5],[x+0.3,h*0.5,z-0.3],b0],0.4,0.3,[0.36,0.45,0.2],3);
      for(let k=0;k<3;k++){const aa=k/3*TAU,up=nrm(azd(aa,1.35)),rt=nrm(crs(up,UP));cards.push({b:add(b0,mul(up,-0.5)),up,rt,w:4,h:7.5,uv:UV('lotusPetal'),tint:[0.95,0.85,0.88],bend:1.2,bd:mul(nrm([Math.cos(aa),0,-Math.sin(aa)]),-1)});}}
    {const a=fa+PI+(R()-.5),d=5+R()*6,x=Math.cos(a)*d,z=-Math.sin(a)*d,h=10+R()*6,r=7+R()*3;stem(B,[[x,0,z],[x,h,z]],0.4,0.35,[0.36,0.45,0.2],3);const ix=[];
      for(let k=0;k<9;k++){const u=(k%3)-1,v=Math.floor(k/3)-1,cup=(u*u+v*v)*0.9;ix.push(B.v([x+u*r,h+cup+(u===1&&v===0?-1:0),z+v*r],nrm([-u*0.3,1,-v*0.3]),lerp(pu[0],pu[2],(u+1)/2),lerp(pu[1],pu[3],(v+1)/2),[0.95,1,0.95]));}
      for(let j=0;j<2;j++)for(let i=0;i<2;i++){const a1=ix[j*3+i];B.q(a1,ix[j*3+i+1],ix[j*3+i+4],ix[j*3+i+3]);}}
    emitCards(B,cards,plantShade(20,0.8));return finish(addM(g(),[B,'v6Leaf',{shadow:true}]),{r:0});};
  /* ---------- herbs ---------- */
  const HERB={
    mugwort:(R,B,cards)=>{for(let i=0;i<7;i++){const a=i/7*TAU+R()*0.5,d=0.8+R()*2,x=Math.cos(a)*d,z=-Math.sin(a)*d,h=13+R()*6,lx=Math.cos(a)*2.4,lz=-Math.sin(a)*2.4;stem(B,[[x,-0.5,z],[x+lx*0.3,h*0.5,z+lz*0.3],[x+lx,h,z+lz]],0.3,0.15,[0.42,0.48,0.32],3);
        for(let k=0;k<3;k++){const f=0.3+k*0.27,p=[x+lx*f*f,h*f,z+lz*f*f],aa=a+(k%2?1.2:-1.2)+(R()-.5)*0.5;leafCard(cards,p,azd(aa,0.55-k*0.1),4.6-k*0.8,5.5-k*0.9,'mugwort',[0.95,1,0.95],R,{bend:1.4});}
        leafCard(cards,[x+lx,h-1,z+lz],[lx*0.2,1,lz*0.2],2.6,3.5,'mugwort',[1,1,1],R,{bend:0.4});}return 18;},
    ginger:(R,B,cards)=>{for(let i=0;i<4;i++){const a=i/4*TAU+R()*0.6,d=1.2+R()*1.4,x=Math.cos(a)*d,z=-Math.sin(a)*d,h=15+R()*5,rk=R()*PI;stem(B,[[x,-0.5,z],[x,h*0.6,z],[x+0.4,h,z]],0.5,0.25,[0.4,0.5,0.24],3);
        for(let k=0;k<5;k++){const y=4+k*(h-4)/5,ang=rk+(k%2?0:PI)+(R()-.5)*0.3;leafCard(cards,[x,y,z],azd(ang,0.35-k*0.04),2.4,9-k*0.6,'lance',[0.95,1,0.92],R,{bend:2.2});}}
      const bw=SUV('sBrown');for(let i=0;i<2;i++){const c=[2.6+i*1.4,0.4,2.2+i*1.2];tube(B,[c,add(c,[2.6,0.2,1])],[1.3,1.0],5,{u0:bw[0],us:0,v0:bw[1],vs:1e9,col:()=>[0.95,0.8,0.55],tip:true});}return 20;},
    turmeric:(R,B,cards)=>{for(let i=0;i<6;i++){const a=i/6*TAU+R()*0.4,b=[Math.cos(a)*1.2,1.2,-Math.sin(a)*1.2];stem(B,[[b[0]*0.5,-0.5,b[2]*0.5],b],0.6,0.45,[0.4,0.5,0.26],3);leafCard(cards,b,azd(a,1.0+R()*0.25),7.5,17+R()*4,'lance',[1,1,0.9],R,{bend:6,roll:0.4});}
      const bw=SUV('sBrown');tube(B,[[2.2,0.3,1.8],[4.6,0.5,2.8]],[1.4,1.0],5,{u0:bw[0],us:0,v0:bw[1],vs:1e9,col:()=>[1.2,0.7,0.2],tip:true});return 20;},
    centella:(R,B,cards)=>{for(let i=0;i<14;i++){const a=i*2.4+R()*0.6,d=1.5+Math.sqrt(i/14)*6,x=Math.cos(a)*d,z=-Math.sin(a)*d,h=1.6+R()*3.2;stem(B,[[x-Math.cos(a)*1.5,0,z+Math.sin(a)*1.5],[x,h,z]],0.18,0.14,[0.45,0.55,0.3],3);
        const up=nrm([Math.cos(a)*0.4,0.3,-Math.sin(a)*0.4]),rt=nrm(crs(up,UP)),s=3+R()*1.3,nn=nrm(crs(rt,up));cards.push({b:add([x,h,z],up,-s*0.5),up:nrm(add(up,nn,-0.0)),rt,w:s,h:s,uv:UV('centella'),tint:leafTint(R,[1,1,1],0.05),flip:R()<.5});}return 6;},
    mint:(R,B,cards)=>{for(let i=0;i<5;i++){const a=i/5*TAU+R()*0.5,d=0.6+R()*2.6,x=Math.cos(a)*d,z=-Math.sin(a)*d,h=9+R()*4,lx=Math.cos(a)*1.6,lz=-Math.sin(a)*1.6;stem(B,[[x,-0.5,z],[x+lx*0.4,h*0.5,z+lz*0.4],[x+lx,h,z+lz]],0.25,0.15,[0.35,0.42,0.2],3);
        for(let k=0;k<2;k++){const f=0.45+k*0.3,c=[x+lx*f,h*f,z+lz*f],ph=a+k*PI/2;for(const sd of [-1,1])leafCard(cards,c,azd(ph+sd*PI/2,0.3),3.6-k*0.6,4.6-k*0.8,'mint',[1,1,1],R,{bend:0.9});}
        leafCard(cards,[x+lx,h-0.8,z+lz],[0,1,0],2.4,3,'mint',[1.05,1.1,0.95],R,{bend:0});}return 12;},
    aloe:(R,B)=>{const aw=SUV('sAloe');for(let i=0;i<10;i++){const a=i*2.4+R()*0.3,el=0.5+(i/10)*0.9,Ln=10+R()*4,b=[Math.cos(a)*0.8,0.2,-Math.sin(a)*0.8],d=azd(a,el),tp=add(b,d,Ln),m=add(add(b,d,Ln*0.35),[0,-0.5,0]);
        tube(B,[b,m,tp],(k,ang)=>[1.6,1.3,0.05][k]*(Math.abs(Math.sin(ang))*0.45+0.55),4,{u0:aw[0],us:0,v0:aw[1],vs:1e9,col:p=>mul([0.85,0.95,0.85],0.6+0.4*ss(0,10,p[1])),rot:PI/4});}return 14;}};
  const prevHerb=M.herb;M.herb=(kind,seed)=>{if(!HERB[kind])return prevHerb?prevHerb(kind,seed):null;seed=+seed||1;const R=RNG(seed*71+kind.length),B=new GB(),cards=[],H=HERB[kind](R,B,cards);emitCards(B,cards,plantShade(H,0.5));return addM(g(),[B,'v6Leaf']);};
  const FLK={red:'fRed',yellow:'fYellow',white:'fWhite',purple:'fPurple'};
  M.flower=(color,seed)=>{const fk=FLK[color]||'fRed',R=RNG((+seed||1)*61+String(color).length),B=new GB(),cards=[];
    for(let i=0;i<6;i++){const a=R()*TAU,d=R()*2.2;leafCard(cards,[Math.cos(a)*d,0,-Math.sin(a)*d],azd(a,0.6+R()*0.6),1.7,5+R()*2,color==='yellow'?'mint':'lance',[0.95,1,0.9],R,{bend:1.5});}
    for(let i=0;i<5;i++){const a=i/5*TAU+R()*0.6,d=0.6+R()*2.4,x=Math.cos(a)*d,z=-Math.sin(a)*d,h=7.5+R()*3.5,lk=0.8+R()*1.8,lx=Math.cos(a)*lk,lz=-Math.sin(a)*lk,c=[x+lx,h,z+lz];
      stem(B,[[x,-0.3,z],[x+lx*0.3,h*0.55,z+lz*0.3],c],0.22,0.16,[0.34,0.45,0.2],3);leafCard(cards,[x+lx*0.2,h*0.4,z+lz*0.2],azd(a+(i%2?1.3:-1.3),0.45),1.3,3.2,'lance',[0.95,1,0.9],R,{bend:0.8});
      const N=nrm([Math.cos(a)*0.5,1,-Math.sin(a)*0.5]),rt=perp(N),up=crs(rt,N),s=(color==='white'||color==='yellow'?4.4:4.0)*(0.85+R()*0.3);cards.push({b:add(add(c,up,-s/2),N,0.15),up,rt,w:s,h:s,uv:UV(fk),tint:color==='white'?[0.82,0.82,0.82]:[0.9,0.9,0.9],flip:R()<.5,fl:1});
      if(i===4){const bd=add(c,[1.4,-1.2,0.6]);stem(B,[c,bd],0.15,0.12,[0.34,0.45,0.2],3);const u2=nrm([0.3,1,0.2]);cards.push({b:add(bd,u2,-0.2),up:u2,rt:perp(u2),w:1.6,h:2.4,uv:UV(fk),tint:[0.8,0.8,0.8],bend:-0.4});}}
    emitCards(B,cards,(p,c,cn)=>c.fl?[nrm(add(mul(cn,cn[1]<0?-1:1),[0,0.6,0])),1]:plantShade(10,0.55)(p,c,cn));return addM(g(),[B,'v6Leaf']);};

  /* ======================================== 6. SAPLINGS ======================================== */
  const SAPK=['pine','oak','birch','bamboo','banana','palm','savannaTree','berry','herb','flower'];
  M.sapling=(kind,stage,seed)=>{kind=SAPK.includes(kind)?kind:'oak';stage=stage?1:0;seed=+seed||1;let G;const sc=stage?1:0.3;
    if(kind==='pine'||kind==='oak'||kind==='birch'){G=M.tree(kind,0,seed);G.scale.setScalar(stage?1.4:0.38);G=g(G);}
    else if(kind==='savannaTree'){G=oakT(0,seed+5);G.children.forEach(m=>{if(m.material===MT.v6Leaf){const c=m.geometry.attributes.color;for(let i=0;i<c.count;i++)c.setXYZ(i,c.getX(i)*0.92,c.getY(i)*0.95,c.getZ(i)*0.8);}});G.scale.set(stage?1.5:0.4,stage?1.2:0.35,stage?1.5:0.4);G=g(G);}
    else if(kind==='bamboo'){const R=RNG(seed*7+stage),Cu=new GB(),Lf=new GB(),cards=[],n=stage?3:1,uv=UV('bamboo');for(let i=0;i<n;i++){const a=i*2.1+R(),x=Math.cos(a)*1.5*i,z=-Math.sin(a)*1.5*i,h=(stage?30+R()*12:9+R()*2)*(1-i*0.15),P=[[x,-1,z],[x+0.3,h*0.5,z],[x+0.8,h,z+0.3]];
        tube(Cu,P,[stage?0.9:0.4,stage?0.7:0.3,0.15],5,{vs:stage?8:3,col:()=>[0.4,0.6,0.22],tip:true});for(let k=0;k<(stage?7:3);k++){const q=ptAt(P,0.5+0.5*k/(stage?7:3)),up=nrm(add(azd(R()*TAU,-0.2),rdir(R),0.3)),s=stage?11:4.5;cards.push({b:q,up,rt:perp(up),w:s,h:s,uv,tint:leafTint(R,W1,0.05)});}}
      emitCards(Lf,cards,plantShade(stage?36:10,0.6));G=addM(g(),[Cu,'v6Ring'],[Lf,'v6Leaf']);}
    else if(kind==='banana'){const R=RNG(seed*9+stage),St=new GB(),Lf=new GB();bananaPlant(St,Lf,R,0,0,stage?0.42:0.14,stage?4:3,seed);G=addM(g(),[St,'v6Ring'],[Lf,'v6Leaf']);}
    else if(kind==='palm'){const R=RNG(seed*11+stage),Lf=new GB(),n=stage?6:3,L=stage?30:9;for(let i=0;i<n;i++){const a=i*2.4+R(),c0=Math.cos(a),s0=-Math.sin(a),up=0.9+R()*0.5,Rp=[];for(let k=0;k<=4;k++){const s=k/4;Rp.push([c0*L*s*0.7,0.5+L*(up*s-0.6*s*s),s0*L*s*0.7]);}
        strip(Lf,Rp,s=>L*0.2*Math.pow(Math.sin(PI*Math.min(1,0.1+s*0.95)),0.5),0.5,UV('palm'),()=>W1,(p,nm)=>nm);}
      const bw=SUV('sBrown');tube(Lf,[[0,-1,0],[0,stage?2:1.4,0]],[stage?3:1.6,stage?2.4:1.3],6,{u0:bw[0],us:0,v0:bw[1],vs:1e9,col:()=>[0.6,0.45,0.3],tip:true});G=addM(g(),[Lf,'v6Leaf']);}
    else if(kind==='berry'){G=M.bush('berryEmpty',seed,0.42);G.scale.setScalar(stage?0.75:0.28);G=g(G);}
    else if(kind==='herb'){G=M.herb('mint',seed);G.scale.setScalar(stage?1.6:0.6);G=g(G);}
    else{G=M.flower(['red','yellow','white','purple'][seed%4],seed);G.scale.setScalar(stage?1.4:0.7);G=g(G);}
    if(stage===0||kind!=='palm'){const B=new GB();mound(B,stage===0?4.3:6,stage===0?1.5:0.9,seed+stage);G.add(B.mesh('v6Leaf',{shadow:false}));}
    G.updateMatrixWorld(true);const b=new T.Box3().setFromObject(G);return finish(G,{h:Math.round(b.max.y),r:stage===0?5:Math.round(Math.max(6,b.max.y*0.3)),kind,stage});};

  /* ======================================== 7. FAR IMPOSTORS ======================================== */
  const LOK=['pine','oak','birch','dead','savannaTree','bamboo','palm','banana'],IMPL=[];
  ['pine','oak','birch'].forEach(k=>[1,2,3].forEach(s=>IMPL.push([k,s])));IMPL.push(['dead',1],['dead',2],['savannaTree',2],['bamboo',2],['palm',2],['banana',2]);
  const impBuild=(k,s)=>TREE[k]?M.tree(k,s,1):M[k](1);
  let IMP=null;
  M.v6bake=()=>{if(IMP!==null)return IMP;IMP=false;let r=null;const old=TIME.value;
    try{const CW=512,CH=1024,AW=4096,AH=4096,cols=AW/CW;r=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true,premultipliedAlpha:false});r.setPixelRatio(1);r.setSize(AW,AH,false);
      r.outputEncoding=T.sRGBEncoding;r.toneMapping=T.NoToneMapping;r.setClearColor(0x000000,0);r.autoClear=false;r.clear();
      const sc=new T.Scene();sc.add(new T.AmbientLight(0xffffff,0.62));const dl=new T.DirectionalLight(0xffffff,0.32);dl.position.set(0.2,1,0.5);sc.add(dl);
      TIME.value=0;const info={};r.setScissorTest(true);
      IMPL.forEach(([k,s],idx)=>{const o=impBuild(k,s);sc.add(o);o.updateMatrixWorld(true);const bb=new T.Box3().setFromObject(o),y0=Math.min(bb.min.y,-2),Hf0=bb.max.y-y0+2,views=[];
        for(let v=0;v<2;v++){const hw=v===0?Math.max(-bb.min.x,bb.max.x):Math.max(-bb.min.z,bb.max.z),W0=2*hw+2,ks=Math.min(CW/W0,CH/Hf0),vw=Math.max(8,Math.min(CW,Math.ceil(W0*ks))),vh=Math.max(8,Math.min(CH,Math.ceil(Hf0*ks))),Wf=vw/ks,Hf=vh/ks;
          const cam=new T.OrthographicCamera(-Wf/2,Wf/2,y0+Hf,y0,-3000,3000);if(v===0)cam.position.set(0,0,1000);else cam.position.set(1000,0,0);cam.lookAt(0,0,0);cam.updateProjectionMatrix();
          const ci=idx*2+v,col=ci%cols,row=Math.floor(ci/cols),vx=col*CW+Math.floor((CW-vw)/2),vy=AH-(row+1)*CH;r.setViewport(vx,vy,vw,vh);r.setScissor(vx,vy,vw,vh);r.render(sc,cam);
          views.push({Wf,Hf,y0,uv:[(vx+0.5)/AW,(vy+0.5)/AH,(vx+vw-0.5)/AW,(vy+vh-0.5)/AH]});}
        info[k+s]=views;sc.remove(o);o.traverse(m=>{if(m.isMesh)m.geometry.dispose();});});
      const cv=document.createElement('canvas');cv.width=AW;cv.height=AH;const c2=cv.getContext('2d');c2.drawImage(r.domElement,0,0);const id=c2.getImageData(0,0,AW,AH);
      let n=0;for(let i=3;i<id.data.length;i+=4*97)if(id.data[i]>128)n++;if(n<50)throw new Error('impostor bake empty');
      bleed(id.data,AW,AH);const tex=dataTex(id.data,AW,AH,{srgb:1,an:16});tex.userData={tsz:AW};const mat=mkMat('v6Imp',{map:tex,side:DS,alphaTest:0.5,roughness:1,color:new T.Color(0.8,0.79,0.81)},2);MT.v6Imp=mat;
      IMP={tex,info,mat,canvas:cv};}
    catch(e){console.warn('v6 impostor bake failed',e);IMP=false;}
    finally{TIME.value=old;if(r){try{r.dispose();r.forceContextLoss();}catch(_){}}}
    return IMP;};
  M.treeLo=(kind,seed,stage)=>{kind=LOK.includes(kind)?kind:'pine';seed=+seed||1;stage=stage===undefined?2:(stage|0);
    if(['pine','oak','birch','dead'].includes(kind))stage=Math.max(1,Math.min(kind==='dead'?2:3,stage));else stage=2;
    const I=M.v6bake();if(!I||!I.info[kind+stage])return prevTreeLo?prevTreeLo(kind,seed,stage):M.tree(kind,stage,seed);
    const B=new GB(),fl=seed%2===0;I.info[kind+stage].forEach((v,vi)=>{const q=v.uv,x0=-v.Wf/2,x1=v.Wf/2,y0=v.y0,y1=v.y0+v.Hf;
      const P=vi===0?(x,y)=>[x,y,0]:(x,y)=>[0,y,-x],ax=vi===0?[1,0,0]:[0,0,-1],fn=vi===0?[0,0,1]:[1,0,0],ix=[];
      for(const [x,y,u,vv] of [[x0,y0,0,0],[x1,y0,1,0],[x1,y1,1,1],[x0,y1,0,1]]){const xs=fl?-x:x,uu=fl?1-u:u,nn=nrm(add(add(mul(ax,Math.sign(xs)*0.7),[0,0.55+0.4*(y-y0)/v.Hf,0]),fn,0.0));ix.push(B.v(P(xs,y),nn,lerp(q[0],q[2],uu),lerp(q[1],q[3],vv),W1));}
      B.q(ix[0],ix[1],ix[2],ix[3]);});
    return finish(addM(g(),[B,I.mat,{shadow:false}]),{lod:1,kind});};

  /* ======================================== 8. LISTS ======================================== */
  M.list.saplings=SAPK.slice();M.list.treeLo=LOK.slice();
  ['pine','oak','birch'].forEach(k=>{const key='tree:'+k+':3';if(M.list.resources&&!M.list.resources.includes(key))M.list.resources.push(key);});
  M.list.extra6v=['tree','savannaTree','banyan','palm','bamboo','banana','bush','flax','reeds','reedBed','fern','tallgrass','lotus','herb','flower','grassClump','sapling','treeLo'];
  if(M.list.extra){['bamboo','banana','palm','banyan','fern','lotus','tallgrass','grassClump'].forEach(k=>{if(!M.list.extra.includes(k))M.list.extra.push(k);});}
  M.prev6v={tree:prevTree,treeLo:prevTreeLo};}
