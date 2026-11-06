/* ===================== THẾ GIỚI RỘNG (PHIÊN BẢN 3): VÙNG CẢNH MỚI, NÚI XA CHÂN TRỜI ===================== */
/* Mô-đun nạp ngay sau terrain3.js. Thế giới phiên bản 3 (S.wv=3, ván mới) rộng hơn: bán kính 5200 → 7400.
   Lõi cũ (các vùng gốc) giữ nguyên vị trí & kích thước theo thước WCR=5200; quanh lõi là một vành đai vùng mới:
   Tràng An (hồ giữa tháp đá vôi, kênh ra biển), Vịnh Đá (đảo đá trên biển), Cao nguyên thông mù sương, Hẻm Thác Chín Tầng,
   Thung lũng tre, Đồi bậc thang có mó nước, Đồng hoa, Rừng ngập mặn, Cao nguyên đất đỏ & núi lửa tắt, Suối khoáng nóng,
   Rừng cổ thụ, Đèo ngắm mây. Thêm dải núi xa chân trời (vẽ trước mọi vật, không tốn bộ đệm sâu).
   Bản lưu cũ (wv=2) vẫn dựng đúng thế giới cũ: mọi thay đổi ở đây chỉ chạy khi WV>=3. Bản đồ có nút chuyển sang thế giới mới.
   GÁN LẠI (bọc, không sửa tệp cũ): riversPlan, riversSurface, baseH, heightsBuild, biome, jungleK, splatAt, terrainColors,
   regionsBuild, decorPlan, decorBuild, resGen, waterMesh, mapBase, mapPix, mapHtml, skyTick, sceneInit, fixSave, newGame. */
const W4={Z:{},ZL:[],ZG:null,ZK:null,chin:null,volc:[3300,-5150],hot:null,ring:null,mist:null,steam:null};
// cấu hình kích thước theo phiên bản thế giới (gọi trước khi dựng thế giới)
function worldCfg(v){WV=v>=3?3:2;if(WV>=3){WR=7400;WSEG=576;TCN=9;WRES=1.45;}else{WR=5200;WSEG=448;TCN=8;WRES=1;}WSIZE=WR*2+800;HN=WSEG+1;HSTEP=WSIZE/WSEG;TCS=WSEG/TCN;}
/* ---------- các vùng mới: tâm, bán trục (đơn vị thế giới) ---------- */
const W4ZONES=[
  {id:'trangan',x:4900,z:-1350,rx:1050,rz:880,e0:0.6,e1:1.0},
  {id:'halong',x:4600,z:4550,rx:1250,rz:1000,e0:0.5,e1:1.0},
  {id:'ancient',x:2250,z:4500,rx:950,rz:800},
  {id:'mangrove',x:-350,z:5950,rx:1050,rz:700},
  {id:'meadow4',x:-3500,z:3300,rx:950,rz:850},
  {id:'terrace',x:-5300,z:1550,rx:950,rz:950},
  {id:'bamboovl',x:-5250,z:-1250,rx:850,rz:1250},
  {id:'pineplat',x:-700,z:-5500,rx:1800,rz:900},
  {id:'basalt',x:3500,z:-4850,rx:1150,rz:950},
  {id:'hotspring',x:4550,z:-3780,rx:460,rz:460}];
W4ZONES.forEach((Z,i)=>{Z.i=i;Z.sd=i*7.3+1.7;W4.Z[Z.id]=Z;});W4.ZL=W4ZONES;
// khoảng cách elip đã uốn bằng nhiễu (≈1 ở mép vùng); 9 nếu ở xa
function z4d(Z,x,z){const dx=(x-Z.x)/Z.rx,dz=(z-Z.z)/Z.rz,d2=dx*dx+dz*dz;if(d2>2.8)return 9;return Math.sqrt(d2)+NS.fbm(x/650+Z.sd,z/650-Z.sd,2)*0.22;}
function z4k(Z,x,z){const d=z4d(Z,x,z);return d>=9?0:1-ss(Z.e0||0.62,Z.e1||1.05,d);}
// tra nhanh trên lưới (sau khi dựng độ cao): {id vùng mạnh nhất, trọng số}
const _z4={id:null,k:0,Z:null};
function z4At(x,z){_z4.id=null;_z4.k=0;_z4.Z=null;if(!W4.ZG||WV<3)return _z4;const i=Math.round((x+WSIZE/2)/HSTEP),j=Math.round((z+WSIZE/2)/HSTEP);if(i<0||j<0||i>=HN||j>=HN)return _z4;const n=j*HN+i,g=W4.ZG[n];if(!g)return _z4;_z4.Z=W4ZONES[g-1];_z4.id=_z4.Z.id;_z4.k=W4.ZK[n]/255;return _z4;}
function z4kAt(id,x,z){const q=z4At(x,z);return q.id===id?q.k:0;}
/* ---------- tra nhanh khoảng cách tới một đường gấp khúc (sông Chín Tầng, kênh) ---------- */
function plBuild(P,C,m){const B=new Map();for(let k=0;k<P.length-1;k++){const [ax,az]=P[k],[bx,bz]=P[k+1];for(let i=Math.floor((Math.min(ax,bx)-m)/C);i<=Math.floor((Math.max(ax,bx)+m)/C);i++)for(let j=Math.floor((Math.min(az,bz)-m)/C);j<=Math.floor((Math.max(az,bz)+m)/C);j++){const key=i*4096+j;let L=B.get(key);if(!L)B.set(key,L=[]);L.push(k);}}return {P,B,C,q:{d:1e9,f:0}};}
function plQ(o,x,z){const q=o.q;q.d=1e9;q.f=0;const L=o.B.get(Math.floor(x/o.C)*4096+Math.floor(z/o.C));if(!L)return q;const P=o.P;let bk=0,bt=0;
  for(const k of L){const [ax,az]=P[k],[bx,bz]=P[k+1],dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz||1;let t=((x-ax)*dx+(z-az)*dz)/l2;t=t<0?0:t>1?1:t;const qx=ax+dx*t-x,qz=az+dz*t-z,d=Math.sqrt(qx*qx+qz*qz);if(d<q.d){q.d=d;bk=k;bt=t;}}
  q.f=(bk+bt)/(P.length-1);return q;}
/* ---------- Hẻm Thác Chín Tầng: đáy hẻm xuống theo 9 bậc ---------- */
const CHIN={F0:276,F1:58,end:0.43,n:9};
function chinFloor(f){if(f>=CHIN.end)return CHIN.F1;const u=Math.max(0,f)/CHIN.end*CHIN.n,i=Math.floor(u),fr=u-i;return CHIN.F0-(i+ss(0.93,0.99,fr))*(CHIN.F0-CHIN.F1)/CHIN.n;}
/* ---------- sông mới (chỉ thế giới 3) ---------- */
function w4RiverPts(wp,R,jit){const J=wp.map(([x,z],i)=>i===0||i===wp.length-1?[x,z]:[x+(R()-0.5)*jit,z+(R()-0.5)*jit*0.8]),pts=[];
  for(let i=0;i<J.length-1;i++){const p0=J[Math.max(0,i-1)],p1=J[i],p2=J[i+1],p3=J[Math.min(J.length-1,i+2)];const L=Math.hypot(p2[0]-p1[0],p2[1]-p1[1]),n=Math.max(2,Math.ceil(L/34));
    for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;const cr=(a,b,c,e)=>0.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-e)*t2+(-a+3*b-3*c+e)*t3);pts.push([cr(p0[0],p1[0],p2[0],p3[0]),cr(p0[1],p1[1],p2[1],p3[1])]);}}
  pts.push(J[J.length-1]);return pts.map(([x,z],i)=>{const e=i===0||i===pts.length-1?0:1;return [x+NS.fbm(x/420+3,z/420,2)*70*e,z+NS.fbm(x/420,z/420+7,2)*70*e];});}
function w4Rivers(seed){const R=rng((seed||1)*11+917),M=RIV[0];
  // Sông Mẹ chảy tiếp ra bờ biển mới (giữ nguyên đoạn cũ để lõi không đổi)
  const end=M.pts[M.pts.length-1],ext=w4RiverPts([end,[-1180,5650],[-1420,6250],[-1520,6820]],R,160);M.pts=M.pts.concat(ext.slice(1));
  const add=(id,n,wp,w,dep,jit)=>{const pts=w4RiverPts(wp,R,jit);RIV.push({id,n,wp,w,dep,sea:1,pts,s:null});return RIV.length-1;};
  W4.chinI=add('chin','Suối Chín Tầng',[[-1950,-5150],[-2650,-4800],[-3300,-4400],[-3900,-3900],[-4400,-3250],[-4900,-2550],[-5300,-1800],[-5300,-950],[-5250,-150],[-5750,450],[-6950,700]],[10,30],5,120);
  W4.springI=add('spring','Mó Nước Bậc Thang',[[-5230,1470],[-5650,1620],[-6150,1760],[-6950,1880]],[26,12],3,60);
  W4.hotI=add('hot','Suối Nóng',[[4550,-3780],[5050,-3600],[5650,-3350],[6650,-3150]],[54,12],3,80);
  W4.hot=RIV[W4.hotI].pts[0];W4.chin=plBuild(RIV[W4.chinI].pts,500,620);
  W4.chan=plBuild([[5600,-1180],[6200,-1020],[6800,-880],[7400,-760]],400,260);
  // lưới tra nhanh đoạn sông (như riversPlan)
  RBK=new Map();const C=400;RIV.forEach((r,ri)=>{for(let k=0;k<r.pts.length-1;k++){const [ax,az]=r.pts[k],[bx,bz]=r.pts[k+1],m=200;for(let i=Math.floor((Math.min(ax,bx)-m)/C);i<=Math.floor((Math.max(ax,bx)+m)/C);i++)for(let j=Math.floor((Math.min(az,bz)-m)/C);j<=Math.floor((Math.max(az,bz)+m)/C);j++){const key=i+','+j;if(!RBK.has(key))RBK.set(key,[]);RBK.get(key).push(ri,k);}}});}
{const _rp=riversPlan;riversPlan=function(seed){_rp(seed);if(WV>=3)w4Rivers(seed);
  // ván mới: newGame() chạy trước khi có thế giới nên S.p=(0,0) — đặt người chơi vào Trảng Khởi Đầu
  if(typeof S==='object'&&S&&S.p&&S.p.x===0&&S.p.z===0&&!(S.goal|0)&&!(S.builds&&S.builds.length)){S.p.x=+SPAWN[0].toFixed(1);S.p.z=+SPAWN[1].toFixed(1);}
  // bản lưu hỏng: vị trí ngoài thế giới → về Trảng Khởi Đầu
  if(typeof S==='object'&&S&&S.p&&!(Math.hypot(S.p.x,S.p.z)<WR*1.05)){S.p.x=+SPAWN[0].toFixed(1);S.p.z=+SPAWN[1].toFixed(1);}};}
// mặt nước sông Chín Tầng: đúng 9 bậc thác trong hẻm, sau đó chỉ chảy xuôi
{const _rs=riversSurface;riversSurface=function(){_rs();if(WV<3||W4.chinI==null)return;const r=RIV[W4.chinI],P=r.pts,n=P.length,s=r.s;
  const st=(CHIN.F0-CHIN.F1)/CHIN.n;for(let i=0;i<n;i++){const f=i/(n-1);if(f<CHIN.end+0.004){const u=Math.max(0,f)/CHIN.end*CHIN.n,j=Math.floor(u);s[i]=CHIN.F0-Math.min(CHIN.n,j+(u-j>0.955?1:0))*st-1.5;}else s[i]=Math.min(s[i],s[i-1]);}
  WFALLS=WFALLS.filter(f=>f.ri!==W4.chinI);for(let i=1;i<n;i++){if(s[i-1]-s[i]>16){const [x0,z0]=P[i-1],[x1,z1]=P[i];WFALLS.push({x:(x0+x1)/2,z:(z0+z1)/2,top:s[i-1],bot:s[i],ry:Math.atan2(x1-x0,z1-z0),w:r.w[0]+(r.w[1]-r.w[0])*i/n,ri:W4.chinI});}}};}
/* ---------- Đồi Bậc Thang: bậc rộng ~115 đơn vị, cao 30, thành bậc dốc gọn trong một ô lưới (nhìn rõ từ trên cao) ---------- */
const W4TER={st:30};
function w4TerrRaw(x,z){const T=W4.Z.terrace,dd=Math.hypot(x-T.x,z-T.z)/840+NS.fbm(x/520,z/520,2)*0.11;return 30+Math.max(0,1-dd)*216;}
function w4TerrH(x,z){const st=W4TER.st,u=w4TerrRaw(x,z)/st,fr=u-Math.floor(u);return (Math.floor(u)+ss(0.8,0.97,fr))*st;}
/* ---------- độ cao gốc của thế giới 3 ---------- */
function baseH4(x,z){const fx=x/WCR,fz=z/WCR,Q=W4.Z;let k,d;
  let h=24+NS.fbm(x/1250,z/1250,4)*36+NS.fbm(x/420+11,z/420+5,3)*12+NS.fbm(x/120,z/120,2)*3;
  // dãy núi tuyết (như cũ) — phía bắc hạ dần xuống cao nguyên thông
  const mt=ss(-0.27,-0.48,fz+NS.fbm(x/1100,3.3,2)*0.08)*(1-ss(-0.8,-1.0,fz+NS.fbm(x/900,9.7,2)*0.12))*(1-ss(3900,5400,Math.abs(x)+NS.fbm(z/800,4.4,2)*500)*0.55);h+=mt*(150+NS.ridge(x/1000,z/1000,5)*620);
  const kd=Math.hypot(fx-0.45,(fz+0.33)*1.1);h+=(1-ss(0.12,0.24,kd))*70;
  h+=Math.max(0,NS.fbm(x/700+40,z/700,3))*80*ss(0.18,0.32,fx)*(1-mt);
  const pd=Math.hypot((fx-0.3)/0.14,(fz-0.09)/0.105)+NS.fbm(x/500,z/500,3)*0.25;const top=185+NS.fbm(x/300,z/300,2)*10;
  const ang=Math.atan2(fz-0.09,fx-0.3),ramp=Math.max(0,Math.cos(ang-2.45))**6;const pk=1-ss(0.9-ramp*0.15,0.97+ramp*0.75,pd);h=h*(1-pk)+Math.max(h,top)*pk;
  {const ax=0.27*WCR,az=-0.1*WCR,bx=0.5*WCR,bz=-0.05*WCR,dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz;let t=((x-ax)*dx+(z-az)*dz)/l2;t=clamp(t,0,1);const dd=Math.hypot(ax+dx*t-x,az+dz*t-z)+NS.fbm(x/90,z/90,2)*12,end=ss(0,0.12,t)*ss(1,0.88,t);
   if(dd<70)h-=150*(1-ss(16,42,dd))*end;}
  const sv=1-ss(0.5,1.05,Math.hypot((fx+0.46)/0.27,(fz+0.02)/0.32));h=h*(1-sv*0.8)+(16+NS.fbm(x/800,z/800,3)*12)*sv*0.8;
  const jg=1-ss(0.5,1.1,Math.hypot((fx-0.25)/0.25,(fz-0.45)/0.22));h=h*(1-jg*0.5)+(14+NS.fbm(x/500,z/500,2)*10)*jg*0.5;
  /* ----- vành đai vùng mới ----- */
  if((k=z4k(Q.pineplat,x,z))>0){const t=272+NS.fbm(x/700+3,z/700-5,3)*40+NS.fbm(x/170,z/170,2)*7;h=h*(1-k)+t*k;}
  if((k=z4k(Q.basalt,x,z))>0){let t=116+NS.fbm(x/600-8,z/600+2,3)*16;const V=W4.volc,dv=Math.hypot(x-V[0],z-V[1])+NS.fbm(x/160,z/160,2)*30;
    if(dv<760){t+=250*Math.pow(1-ss(150,760,dv),1.3);if(dv<150)t-=96*(1-(dv/150)*(dv/150));}h=h*(1-k)+t*k;}
  if((d=z4d(Q.trangan,x,z))<9){const Z=Q.trangan;k=1-ss(Z.e0,Z.e1,d);const n=NS.fbm(x/280+50,z/280-20,3),isl=ss(0.1,0.24,n);
    const t=-7.5-NS.fbm(x/90,z/90,2)*3+isl*(14+n*22);h=h*(1-k)+t*k;h+=ss(0.8,1.02,d)*(1-ss(1.08,1.45,d))*75*(0.6+NS.fbm(x/200,z/200,2));}
  if((k=z4k(Q.ancient,x,z))>0){const t=20+NS.fbm(x/500+4,z/500,3)*16;h=h*(1-k*0.75)+t*k*0.75;}
  if((k=z4k(Q.mangrove,x,z))>0){const c=NS.ridge(x/650+2,z/650-6,3),t=0.4+NS.fbm(x/240,z/240,3)*5+NS.fbm(x/60,z/60,2)*0.9-ss(0.58,0.8,c)*6;h=h*(1-k)+t*k;}
  if((k=z4k(Q.meadow4,x,z))>0){const t=26+NS.fbm(x/900-6,z/900+6,3)*22;h=h*(1-k*0.85)+t*k*0.85;}
  if((k=z4k(Q.terrace,x,z))>0){h=h*(1-k)+w4TerrH(x,z)*k;}
  if((k=z4k(Q.bamboovl,x,z))>0&&W4.chin){const q=plQ(W4.chin,x,z),lx=Math.min(q.d,1200),t=32+NS.fbm(x/300,z/300,2)*6+ss(30,260,lx)*22+ss(200,760,lx)*130;h=h*(1-k)+t*k;}
  if((k=z4k(Q.hotspring,x,z))>0){const t=104+NS.fbm(x/200,z/200,2)*5;h=h*(1-k*0.95)+t*k*0.95;}
  // hẻm Chín Tầng: đáy bậc thang, vách dựng
  if(W4.chin){const q=plQ(W4.chin,x,z);if(q.d<560&&q.f<CHIN.end+0.06){const f=q.f,sec=ss(0,0.02,f)*(1-ss(CHIN.end,CHIN.end+0.05,f)),fl=chinFloor(f),hw=34,wt=fl+(96+NS.fbm(x/200,z/200,2)*30)*ss(0,0.06,f),
      prof=fl+Math.max(0,q.d-hw)*2.5+Math.max(0,NS.fbm(x/60,z/60,2))*8,inner=Math.min(prof,wt),Dw=hw+(wt-fl)/2.5;let t;if(q.d<Dw)t=inner;else{const b=ss(Dw,Dw+340,q.d);t=wt*(1-b)+h*b;}
    if(sec>0)h=h*(1-sec)+t*sec;}}
  // bờ biển đông dựng đứng
  const ec=ss(4700,5700,x)*(1-ss(1800,2900,Math.abs(z-900)));h+=ec*(70+NS.fbm(x/300,z/300,2)*30);
  // bờ biển mới
  {const r=Math.hypot(x/WR,z/WR*1.04)+NS.fbm(x/1900+7,z/1900-3,3)*0.1+NS.fbm(x/3600-2,z/3600+5,2)*0.07;const a=0.86+ec*0.025,land=1-ss(a,a+0.09-ec*0.07,r);h=h*land-(1-land)*60;}
  // vịnh đá: biển lấn vào, đảo đá nhỏ, bãi cát vòng cung
  if((d=z4d(Q.halong,x,z))<9){const Z=Q.halong;k=1-ss(Z.e0,Z.e1,d);const n=NS.fbm(x/150+7,z/150-3,2),isl=Math.max(0,n-0.3)*240;
    const t=-13-NS.fbm(x/400,z/400,2)*9+Math.min(22,isl);h=h*(1-k)+t*k;const sh=ss(0.85,1.0,d)*(1-ss(1.12,1.45,d));if(sh>0&&h>-4)h=h*(1-sh*0.85)+(2.5+NS.fbm(x/90,z/90,2)*2.5)*sh*0.85;}
  // kênh nước từ Tràng An ra biển (thuyền đi được)
  if(W4.chan){const q=plQ(W4.chan,x,z);if(q.d<140){const c=1-ss(30,75,q.d+NS.fbm(x/80,z/80,2)*14);if(c>0)h=h*(1-c)+(-6.5)*c;}}
  // hồ sen tây nam & trảng khởi đầu (như cũ)
  {const L=Math.hypot(x-F(-0.3,0.3)[0],z-F(-0.3,0.3)[1])/430;if(L<1.4){const kk=1-ss(0.55,1.4,L);h=h*(1-kk)+(-24)*kk;}}
  {const sd=Math.hypot(x-SPAWN[0],z-SPAWN[1])/300;if(sd<1){const kk=(1-sd*sd)**2;h=h*(1-kk)+Math.max(18,Math.min(h,40))*kk;}}
  return h;}
{const _bh=baseH;baseH=function(x,z){return WV>=3?baseH4(x,z):_bh(x,z);};}
// lưới vùng: vùng mạnh nhất + trọng số tại mỗi ô
function w4ZoneGrid(){W4.ZG=new Uint8Array(HN*HN);W4.ZK=new Uint8Array(HN*HN);for(let j=0;j<HN;j++)for(let i=0;i<HN;i++){const x=-WSIZE/2+i*HSTEP,z=-WSIZE/2+j*HSTEP;let bk=0,bz=0;
    for(const Z of W4ZONES){if(Z.id==='canyon'||Math.abs(x-Z.x)>Z.rx*1.6||Math.abs(z-Z.z)>Z.rz*1.6)continue;const k=z4k(Z,x,z);if(k>bk){bk=k;bz=Z.i+1;}}
    if(bk<0.05&&W4.chin){const q=plQ(W4.chin,x,z);if(q.d<300&&q.f<CHIN.end+0.02){bk=1-ss(120,300,q.d);bz=W4.Z.canyon.i+1;}}
    W4.ZG[j*HN+i]=bk>0.02?bz:0;W4.ZK[j*HN+i]=Math.round(bk*255);}}
W4ZONES.push({id:'canyon',x:0,z:0,rx:1,rz:1,i:W4ZONES.length,sd:0});W4.Z.canyon=W4ZONES[W4ZONES.length-1];
{const _hb=heightsBuild;heightsBuild=function(){W4.ZG=null;_hb();if(WV>=3)w4ZoneGrid();};}
/* ---------- vùng sinh thái trong vùng mới ---------- */
{const _bi=biome;biome=function(x,z){const b=_bi(x,z);if(WV<3||b==='water')return b;const q=z4At(x,z);if(!q.id||q.k<0.35)return b;const h=hAt(x,z);
  switch(q.id){case 'pineplat':return b==='peak'?b:slopeAt(x,z)>0.8?'rock':(moist(x,z)>-0.18?'forest':'edge');
    case 'bamboovl':return b==='rock'||b==='bank'?b:(h<120?'forest':'edge');
    case 'meadow4':return b==='rock'||b==='bank'?b:'meadow';
    case 'terrace':return b==='bank'?b:'meadow';
    case 'mangrove':return h<7?'bank':b;
    case 'halong':return h<9&&h>-1?'beach':b;
    case 'ancient':return b==='rock'||b==='bank'?b:'forest';
    case 'basalt':return b==='rock'||b==='peak'?b:(b==='forest'?'edge':h>200&&slopeAt(x,z)<0.5?'meadow':b);
    case 'hotspring':return b==='forest'?'edge':b;
    case 'canyon':return slopeAt(x,z)>0.5?'rock':b==='meadow'?'edge':b;}return b;};}
{const _jk=jungleK;jungleK=function(x,z){const a=_jk(x,z);if(WV<3)return a;const q=z4At(x,z);return q.id==='ancient'||q.id==='bamboovl'||q.id==='mangrove'?Math.max(a,q.k*0.85):a;};}
// trộn vân mặt đất: đất đỏ ba-dan, cỏ tươi đồng hoa, ẩm cao nguyên
{const _sa=splatAt;splatAt=function(k,x,z,h,b,sl,wet){const w=_sa(k,x,z,h,b,sl,wet);if(WV<3)return w;const q=z4At(x,z);if(!q.id)return w;const TQ=T3&&T3.TQ,kk=q.k;
  if(TQ){if(q.id==='basalt'||q.id==='hotspring'){TQ[k*4+2]=Math.max(TQ[k*4+2],0.9*kk);TQ[k*4+3]*=1-kk*0.6;}
    else if(q.id==='meadow4'||q.id==='terrace'){TQ[k*4+3]*=1-kk*0.85;TQ[k*4+1]=Math.max(TQ[k*4+1],0.45*kk);TQ[k*4+2]*=1-kk;}
    else if(q.id==='pineplat'||q.id==='ancient'||q.id==='bamboovl'||q.id==='canyon'){TQ[k*4+1]=Math.min(1,TQ[k*4+1]+0.3*kk);TQ[k*4+3]*=1-kk*0.7;}
    else if(q.id==='mangrove'){TQ[k*4+1]=Math.min(1,TQ[k*4+1]+0.5*kk);}}
  if(q.id==='basalt'&&b!=='rock'){const d=0.55*kk;return [w[0]*(1-d),w[1]*(1-d)+d,w[2]*(1-d),w[3]*(1-d)];}
  if(q.id==='terrace'&&!wet){const c=w4TCls(k);if(c===1||c===3){const d=0.85*kk;if(TQ){TQ[k*4+1]=Math.max(TQ[k*4+1],0.75*kk);TQ[k*4+3]=0;}return [w[0]*(1-d)+0.12*d,w[1]*(1-d)+0.33*d,w[2]*(1-d)+0.55*d,w[3]*(1-d)];}
    if(c===2){const d=0.55*kk;return [w[0]*(1-d)+0.45*d,w[1]*(1-d)+0.55*d,w[2]*(1-d),w[3]*(1-d)];}
    if(c===0&&TQ){const pk=w4PoolK(x,z,kk);if(pk>0.05)TQ[k*4]=Math.max(TQ[k*4],h+0.35*pk);}
    const d=ss(0.22,0.45,sl)*0.75*kk;return [w[0]*(1-d),w[1]*(1-d)+d,w[2]*(1-d),w[3]*(1-d)];}
  if(q.id==='mangrove'&&!wet&&h<6){const d=0.45*kk;return [w[0]*(1-d),w[1]*(1-d)+d,w[2]*(1-d),w[3]*(1-d)];}return w;};}
// lớp đỉnh lưới ở đồi bậc thang: 0 mặt bậc phẳng, 1 mép trên (thành bậc), 2 chân bậc, 3 bậc hẹp (vừa mép vừa chân), 4 dốc thường
function w4TCls(n){const i=n%HN,j=(n-i)/HN;if(i<1||j<1||i>=HN-1||j>=HN-1||!HG)return 4;const h=HG[n];let lo=h,hi=h;
  for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const v=HG[n+dj*HN+di];if(v<lo)lo=v;if(v>hi)hi=v;}const dr=h-lo,ri=hi-h,T=W4TER.st*0.38;
  if(dr>T&&ri>T)return 3;if(dr>T)return 1;if(ri>T)return 2;return dr<3&&ri<3?0:4;}
// mặt bậc có nước đọng (từng mảng, như ruộng nước tự nhiên quanh mó nước)
function w4PoolK(x,z,k){return ss(0.72,0.9,k)*ss(-0.2,0.05,NS.fbm(x/300+5,z/300-9,2));}
// màu vùng (nhìn từ xa / từ trên cao)
const W4TINT={pineplat:[[0.22,0.36,0.22],0.42],bamboovl:[[0.47,0.62,0.24],0.35],terrace:[[0.50,0.72,0.27],0.45],mangrove:[[0.38,0.40,0.24],0.4],ancient:[[0.16,0.32,0.14],0.45],
  basalt:[[0.58,0.26,0.15],0.62],hotspring:[[0.58,0.36,0.22],0.4],trangan:[[0.36,0.58,0.26],0.25],meadow4:[[0.55,0.72,0.32],0.3],canyon:[[0.42,0.40,0.36],0.25]};
const W4FLOW=[[0.86,0.45,0.58],[0.92,0.78,0.26],[0.93,0.92,0.86],[0.62,0.48,0.82],[0.86,0.32,0.26]];
function w4Tint(id,k,x,z,h,sl,c,n){const t=W4TINT[id];if(t){const a=t[1]*k;c[0]+=(t[0][0]-c[0])*a;c[1]+=(t[0][1]-c[1])*a;c[2]+=(t[0][2]-c[2])*a;}
  if(id==='meadow4'){const n=NS.fbm(x/70+9,z/70-3,2),m=NS.fbm(x/160-4,z/160+8,2),f=W4FLOW[Math.floor((m*0.5+0.5)*W4FLOW.length*1.6)%W4FLOW.length],a=ss(0.0,0.3,n)*0.75*k;c[0]+=(f[0]-c[0])*a;c[1]+=(f[1]-c[1])*a;c[2]+=(f[2]-c[2])*a;}
  if(id==='terrace'){const cl=n!=null?w4TCls(n):(sl>0.3?1:0),tc=cl===1||cl===3?[0.47,0.36,0.24]:cl===2?[0.25,0.33,0.15]:cl===0?[0.54,0.75,0.27]:[0.42,0.52,0.22],a=(cl===1||cl===3?0.72:cl===2?0.6:0.45)*k;c[0]+=(tc[0]-c[0])*a;c[1]+=(tc[1]-c[1])*a;c[2]+=(tc[2]-c[2])*a;}
  if(id==='basalt'&&sl>0.6){const a=0.5*k;c[0]+=(0.24-c[0])*a;c[1]+=(0.22-c[1])*a;c[2]+=(0.21-c[2])*a;}}
{const _tc=terrainColors;terrainColors=function(){_tc();if(WV<3||!W4.ZG)return;const c=[0,0,0];for(let j=0;j<HN;j++)for(let i=0;i<HN;i++){const n=j*HN+i,g=W4.ZG[n];if(!g)continue;const Z=W4ZONES[g-1],k=W4.ZK[n]/255;
    if(WG[n]>-900&&WG[n]-HG[n]>0.3)continue;const x=-WSIZE/2+i*HSTEP,z=-WSIZE/2+j*HSTEP;c[0]=TCOL[n*3];c[1]=TCOL[n*3+1];c[2]=TCOL[n*3+2];w4Tint(Z.id,k,x,z,HG[n],1-TNRM[n*3+1]*TNRM[n*3+1]>0.0?Math.sqrt(1-TNRM[n*3+1]*TNRM[n*3+1])/Math.max(0.2,TNRM[n*3+1]):0,c,n);TCOL[n*3]=c[0];TCOL[n*3+1]=c[1];TCOL[n*3+2]=c[2];}};}
/* ---------- vùng có tên ---------- */
const W4REG={
  trangan:['Thung Lũng Tràng An','Hồ nước xanh lặng giữa rừng tháp đá vôi dựng đứng. Kênh nước len qua chân núi, chèo thuyền ra được tận biển đông.','🛶'],
  halong:['Vịnh Đá Ngàn Đảo','Vịnh biển kín gió, hàng chục đảo đá vôi nhô lên từ mặt nước xanh ngọc như Hạ Long. Bên trong vịnh là bãi cát trắng.','🏝️'],
  pineplat:['Cao Nguyên Thông Mù Sương','Cao nguyên lộng gió sau dãy núi tuyết, rừng thông già chìm trong mây mù sớm chiều. Nai, gấu và sói lui tới.','🌲'],
  canyon:['Hẻm Thác Chín Tầng','Suối từ cao nguyên đổ xuống hẻm vực sâu qua chín bậc thác nối nhau, bụi nước bay mù mịt, vách đá rêu phong.','🏞️'],
  bamboovl:['Thung Lũng Tre Ngà','Thung lũng kín gió ngập trong rừng tre, Suối Chín Tầng chảy hiền giữa lòng. Gió lùa qua tre nghe như tiếng sáo.','🎋'],
  terrace:['Đồi Bậc Thang Mó Nước','Sườn đồi tự nhiên xếp thành từng bậc như ruộng bậc thang. Trên đỉnh có mó nước trong vắt chảy quanh năm.','💧'],
  meadow4:['Đồng Hoa Gió','Đồng cỏ thấp trải hoa dại đỏ, vàng, trắng, tím tới tận chân trời. Ong bướm dập dìu, nai và thỏ ra ăn cỏ.','🌸'],
  mangrove:['Rừng Ngập Mặn Cửa Sông','Bãi bồi ngập triều bên cửa Sông Mẹ: lạch nước chằng chịt, sen, lau sậy, dừa nước. Chim nước và cá sấu.','🪷'],
  basalt:['Cao Nguyên Đất Đỏ','Cao nguyên đất đỏ ba-dan quanh một ngọn núi lửa đã tắt. Miệng núi lửa thành lòng chảo cỏ xanh; bò tót gặm cỏ.','🌋'],
  hotspring:['Suối Khoáng Nóng','Mạch nước nóng trào lên từ lòng đất đỏ, hơi nước bốc nghi ngút. Ngâm mình ấm cả người những ngày lạnh.','♨️'],
  ancient:['Rừng Cổ Thụ Nghìn Năm','Cây cổ thụ khổng lồ tán che kín trời, rễ to như tường thành. Rừng tối, ẩm, nhiều nấm, gừng, và có hổ.','🌳'],
  vista:['Đèo Ngắm Mây','Mỏm núi cao trên dãy núi tuyết, trước mặt mở ra cả một vùng trời: thung lũng sâu, sông suối lấp lánh, núi xa chìm trong mây. Ụ đá xếp đánh dấu chỗ đứng ngắm.','🔭']};
function regions4(){const R=REG,add=(id,p,r,o)=>{if(!p)return;const m=W4REG[id]||o;R.push({id,n:m[0],d:m[1],ic:m[2],x:p[0],z:p[1],r});};const drop=id=>{const i=R.findIndex(q=>q.id===id);if(i>=0)return R.splice(i,1)[0];};
  const far=(x,z,dd)=>R.every(q=>Math.hypot(q.x-x,q.z-z)>dd),Q=W4.Z;
  // bãi cát & vách biển: tìm lại trên bờ biển mới
  const ob=drop('beach'),oc=drop('cliffs');
  add('beach',bestPoint((x,z)=>bAt(x,z)!=='beach'||!far(x,z,600)||x>0||z4At(x,z).id?-1e9:-Math.hypot(x+0.47*WR,z-0.66*WR),90),420,[ob?ob.n:'Bãi Cát Vàng',ob?ob.d:'',ob?ob.ic:'🏖️']);
  add('cliffs',bestPoint((x,z)=>x<0.6*WR||hAt(x,z)<20?-1e9:-Math.abs(Math.hypot(x,z*1.04)/WR-0.87)*1000-Math.abs(z-900)*0.05,90),500,[oc?oc.n:'Vách Biển Đông',oc?oc.d:'',oc?oc.ic:'🌊']);
  // bờ hồ Tràng An / bờ vịnh: chỗ đứng ngắm cảnh (đường mòn dẫn tới đây)
  const shore=(Z,ax,az)=>bestPoint((x,z)=>{const d=z4d(Z,x,z);if(d<0.55||d>1.1)return -1e9;const h=hAt(x,z);if(h<2||h>34||wdAt(x,z)>0||slopeAt(x,z)>0.3)return -1e9;let n=0;for(let a=0;a<8;a++)if(wdAt(x+Math.cos(a*0.785)*160,z+Math.sin(a*0.785)*160)>1)n++;return n<2?-1e9:-Math.hypot(x-ax,z-az)+n*40;},60);
  add('trangan',shore(Q.trangan,Q.trangan.x-900,Q.trangan.z+300),1050);
  add('halong',shore(Q.halong,Q.halong.x-900,Q.halong.z-400),1050);
  add('pineplat',[Q.pineplat.x+300,Q.pineplat.z],1350);
  if(W4.chin){const P=RIV[W4.chinI].pts;add('canyon',P[Math.floor((P.length-1)*CHIN.end*0.5)],720);add('bamboovl',(()=>{let b=null,bd=1e9;P.forEach(p=>{const d=Math.hypot(p[0]-Q.bamboovl.x,p[1]-Q.bamboovl.z);if(d<bd){bd=d;b=p;}});return b?[b[0]+180,b[1]]:null;})(),950);}
  add('terrace',[Q.terrace.x,Q.terrace.z],700);
  add('meadow4',[Q.meadow4.x,Q.meadow4.z],900);
  add('mangrove',shore(Q.mangrove,Q.mangrove.x+200,Q.mangrove.z-400)||[Q.mangrove.x,Q.mangrove.z-150],850);
  add('basalt',[W4.volc[0]+250,W4.volc[1]+250],1050);
  if(W4.hot)add('hotspring',[W4.hot[0]-40,W4.hot[1]-40],230);
  add('ancient',[Q.ancient.x,Q.ancient.z],880);
  {const v=w4VistaPick(far);W4.vistaDir=v?v[2]:null;add('vista',v,260);}}
/* Đèo Ngắm Mây: tìm chỗ đứng trên dãy núi mà cả một quạt nhìn ~75° không có gì nhô quá đường chân trời,
   nhìn sâu xuống thung lũng, thấy sông/biển. Trả về [x, z, hướng nhìn (rad, như P.ry)]. */
function w4VistaScore(x,z,out){const h=hAt(x,z);if(h<230||h>470||slopeAt(x,z)>0.32||wdAt(x,z)>0)return -1e9;const e=h+16,N=24,D=[50,100,170,260,380,540,740,1000,1320,1700,2150,2700,3300],v=w4VistaScore.v||(w4VistaScore.v=new Float32Array(N)),dr=w4VistaScore.d||(w4VistaScore.d=new Float32Array(N)),wt=w4VistaScore.w||(w4VistaScore.w=new Float32Array(N));
  for(let a=0;a<N;a++){const dx=Math.sin(a/N*6.2832),dz=Math.cos(a/N*6.2832);let mt=-1,dp=0,w=0;for(const d of D){const X=x+dx*d,Z=z+dz*d;if(Math.abs(X)>WR||Math.abs(Z)>WR){mt=Math.max(mt,-0.05);break;}const g=hAt(X,Z),t=(g-e)/d;if(t>mt)mt=t;if(d>=1000){dp+=e-g;if(g<2||wdAt(X,Z)>0.5)w++;}}v[a]=mt;dr[a]=dp;wt[a]=w;}
  let best=-1e9,ba=0;for(let a=0;a<N;a++){let mx=-1,dp=0,w=0;for(let k=-2;k<=2;k++){const b=(a+k+N)%N;mx=Math.max(mx,v[b]);dp+=dr[b];w+=wt[b];}
    const sc=Math.min(0.06,-mx)*3000+Math.min(dp/25,900)*0.25+Math.min(w,14)*8+(Math.cos(a/N*6.2832)>0.3?25:0);if(sc>best){best=sc;ba=a;}}
  if(out){out[0]=ba/N*6.2832;}return best+h*0.05;}
function w4VistaPick(far){const o=[0];let b=null,bs=-1e8;for(let x=-3400;x<=1800;x+=60)for(let z=-4700;z<=-1700;z+=60){if(far&&!far(x,z,420))continue;const s=w4VistaScore(x,z);if(s>bs){bs=s;b=[x,z];}}
  if(!b)return null;// tinh chỉnh quanh điểm tốt nhất
  for(let x=b[0]-50;x<=b[0]+50;x+=20)for(let z=b[1]-50;z<=b[1]+50;z+=20){const s=w4VistaScore(x,z);if(s>bs){bs=s;b=[x,z];}}w4VistaScore(b[0],b[1],o);W4.vistaS=Math.round(bs);return [b[0],b[1],o[0]];}
// lõi giữ vị trí cũ: chạy regionsBuild gốc trên thước lõi, không cho vùng gốc rơi vào vành đai mới
{const _rb=regionsBuild;regionsBuild=function(){if(WV<3)return _rb();const sv=WR,sf=WFALLS,bp=bestPoint;WR=WCR;WFALLS=WFALLS.filter(f=>f.ri<4);
  bestPoint=function(score,step){return bp((x,z)=>z4At(x,z).k>0.05||Math.hypot(x,z*1.04)>0.9*WCR?-1e9:score(x,z),step);};try{_rb();}finally{WR=sv;WFALLS=sf;bestPoint=bp;}regions4();};}
// đường mòn nối vùng mới (map.js nối thêm vào danh sách)
function trails4(){return WV<3?[]:[['savanna','bamboovl'],['bamboovl','canyon'],['bamboovl','terrace'],['terrace','meadow4'],['lake','meadow4'],['meadow4','beach'],['range','vista'],['vista','pineplat'],
  ['delta','mangrove'],['jungle','ancient'],['ancient','halong'],['halong','cliffs'],['cliffs','trangan'],['karst','trangan'],['karst','basalt'],['basalt','hotspring'],['trangan','hotspring']];}
/* ---------- vật cảnh lớn của vùng mới ---------- */
function decor4Plan(){const R=rng((S.seed|0)+4031),Q=W4.Z,RAD={1:88,2:136,3:192};
  const ok=(x,z,r)=>DECO_PLAN.every(d=>Math.hypot(d.x-x,d.z-z)>d.r+r+20)&&trailAt(x,z)<0.05&&Math.hypot(x-SPAWN[0],z-SPAWN[1])>500&&REG.every(g=>!/^(trangan|halong|hotspring|vista|terrace)$/.test(g.id)||Math.hypot(g.x-x,g.z-z)>r+70);
  const put=(o)=>{DECO_PLAN.push(o);if(o.k!=='clear')SCOL.push({x:o.x,z:o.z,r:o.k==='banyan'?22*o.s:o.r*0.9});};
  // chỗ ngắm cảnh: để trống (cây cỏ không mọc che tầm nhìn)
  const clr=[];REG.forEach(g=>{if(W4REG[g.id]||g.id==='cliffs')clr.push({k:'clear',x:g.x,z:g.z,y:0,r:/^(trangan|halong|vista|hotspring|cliffs)$/.test(g.id)?70:g.id==='ancient'?110:45,w4:g.id});});
  // bỏ đá vách rải ngẫu nhiên (decorPlan gốc) chắn ngay chỗ ngắm cảnh, rồi dựng lại va chạm như decorPlan
  {const n0=DECO_PLAN.length;DECO_PLAN=DECO_PLAN.filter(d=>d.k!=='cliffRock'||clr.every(c=>Math.hypot(c.x-d.x,c.z-d.z)>c.r+d.r+60));if(DECO_PLAN.length!==n0){SCOL.length=0;DECO_PLAN.forEach(d=>{if(d.k!=='cave'&&d.k!=='village')SCOL.push({x:d.x,z:d.z,r:d.k==='banyan'?22:d.r*0.9});});}}
  clr.forEach(c=>DECO_PLAN.push(c));
  const karsts=(Z,n,smin,smax,want,sink,zone)=>{let c=0,t=0;while(c<n&&t<4000){t++;const a=R()*6.283,dd=Math.sqrt(R())*1.05,x=Z.x+Math.cos(a)*dd*Z.rx,z=Z.z+Math.sin(a)*dd*Z.rz;if(z4k(Z,x,z)<0.45)continue;const h=hAt(x,z);if(!want(h,x,z))continue;
      if(W4.chan&&plQ(W4.chan,x,z).d<220)continue;const v=R()<0.25?3:R()<0.55?2:1,s=smin+R()*(smax-smin),r=RAD[v]*s;if(!ok(x,z,r))continue;put({k:'karst',v,x,z,y:h-sink,ry:R()*6.283,s,r,w4:zone});c++;}};
  karsts(Q.trangan,28,0.7,1.15,h=>h<14,10,'trangan');
  karsts(Q.halong,30,0.38,0.85,h=>h<-5,6,'halong');
  const rocks=(n,pick,zone,vmax)=>{let c=0,t=0;while(c<n&&t<n*80){t++;const p=pick();if(!p)continue;const [x,z]=p;if(wdAt(x,z)>0||hAt(x,z)<4)continue;const v=1+Math.floor(R()*(vmax||3)),r=[0,30,60,95][v];if(!ok(x,z,r))continue;put({k:'cliffRock',v,x,z,y:hAt(x,z)-r*0.35,ry:R()*6.283,s:0.8+R()*0.5,r,w4:zone});c++;}};
  if(W4.chin){const P=RIV[W4.chinI].pts,n=Math.floor((P.length-1)*CHIN.end);rocks(34,()=>{const i=Math.floor(R()*n),p=P[i],q=P[Math.min(P.length-1,i+1)],dx=q[0]-p[0],dz=q[1]-p[1],l=Math.hypot(dx,dz)||1,sd=(R()<0.5?-1:1)*(70+R()*120);return [p[0]+dz/l*sd,p[1]-dx/l*sd];},'canyon');}
  const inZ=(Z,f)=>()=>{const a=R()*6.283,dd=Math.sqrt(R())*(f||1),x=Z.x+Math.cos(a)*dd*Z.rx,z=Z.z+Math.sin(a)*dd*Z.rz;return [x,z];};
  rocks(16,inZ(Q.basalt,0.9),'basalt');rocks(12,inZ(Q.pineplat,0.9),'pineplat',2);rocks(6,inZ(Q.hotspring,1.4),'hotspring',1);
  {const v=REG.find(g=>g.id==='vista');if(v){const a=R()*6.283,bd=(W4.vistaDir||0)+Math.PI+0.5,x=v.x+Math.sin(bd)*80,z=v.z+Math.cos(bd)*80;put({k:'cliffRock',v:1,x,z,y:hAt(x,z)-14,ry:a,s:0.45,r:24,w4:'vista'});}}
  // mốc đá ở tâm mỗi vùng (ụ đá xếp, đá dựng, vòng đá, vòng đá quanh mó nước) — để nhận ra vùng từ xa
  {const lm=(k,x,z,s,zone,r)=>{if(k!=='lmSpring'&&wdAt(x,z)>0.3)return;put({k,x,z,y:hAt(x,z)-1.5,ry:R()*6.283,s,r:r||14,w4:zone});};const G_=id=>REG.find(g=>g.id===id),back=(g,Z,d)=>{const a=Math.atan2(g.x-Z.x,g.z-Z.z);return [g.x+Math.sin(a)*d,g.z+Math.cos(a)*d];};
    {const v=G_('vista');if(v){const bd=(W4.vistaDir||0)+Math.PI;lm('lmCairn',v.x+Math.sin(bd)*26,v.z+Math.cos(bd)*26,1.1,'vista');}}
    if(W4.springI!=null){const p=RIV[W4.springI].pts[0];lm('lmSpring',p[0],p[1],1,'terrace',8);}
    {const g=G_('pineplat');if(g)lm('lmCairn',g.x+55,g.z-30,1.25,'pineplat');}
    {const g=G_('bamboovl');if(g)lm('lmMenhir',g.x+60,g.z+40,1,'bamboovl');}
    {const g=G_('meadow4');if(g)lm('lmCircle',g.x,g.z,1,'meadow4',4);}
    {const g=G_('ancient');if(g)lm('lmMenhir',g.x-50,g.z+45,1.15,'ancient');}
    {const g=G_('basalt');if(g)lm('lmCairn',g.x,g.z,1.3,'basalt');}
    if(W4.hot){const a=0.8;lm('lmMenhir',W4.hot[0]-Math.cos(a)*85,W4.hot[1]-Math.sin(a)*85,0.85,'hotspring');}
    for(const id of ['trangan','halong','mangrove']){const g=G_(id);if(g){const [x,z]=back(g,W4.Z[id],-30);lm('lmCairn',x,z,0.9,id);}}}
  // cây đa khổng lồ giữa rừng cổ thụ
  {let c=0,t=0;const Z=Q.ancient;while(c<4&&t<800){t++;const [x,z]=inZ(Z,0.8)();if(slopeAt(x,z)>0.25||wdAt(x,z)>0||hAt(x,z)<3)continue;const s=1.35+R()*0.5;if(!ok(x,z,60*s))continue;put({k:'banyan',x,z,y:hAt(x,z)-2,ry:R()*6.283,s,r:40*s,w4:'ancient'});c++;}}}
{const _dp=decorPlan;decorPlan=function(){_dp();if(WV>=3)try{decor4Plan();}catch(e){console.warn('vật cảnh vùng mới',e);}};}
// dựng theo nhóm (loại × vùng) để cắt theo khung nhìn từng vùng
function decor4Build(list){const by=new Map();for(const d of list){if(d.k==='clear')continue;const key=(d.k==='karst'||d.k==='cliffRock'?d.k+'|'+d.v:d.k)+'@'+d.w4;if(!by.has(key))by.set(key,[]);by.get(key).push(d);}const protos=new Map();
  by.forEach((L,key)=>{const sk=key.split('@')[0];let parts=protos.get(sk);if(!parts){const spec=sk.split('|').map(v=>/^\d+$/.test(v)?+v:v);parts=protoParts(/^lm/.test(sk)?w4LmModel(sk):model(spec)).map(p=>({geo:p.geo,mat:occMat(p.mat)}));protos.set(sk,parts);}
    let cx=0,cz=0,cy=0;L.forEach(d=>{cx+=d.x;cz+=d.z;cy+=d.y;});cx/=L.length;cz/=L.length;cy/=L.length;let r=0;L.forEach(d=>{r=Math.max(r,Math.hypot(d.x-cx,d.z-cz)+d.r*2.6+60);});
    const api=instGroup(parts,L.length,{sphere:{x:cx,y:cy+80,z:cz,r}});L.forEach((d,i)=>api.set(i,d.x,d.y,d.z,d.ry,d.s));api.flush();api.G.userData.w4=1;G.sc.add(api.G);});}
// mô hình mốc đá (vài chục tam giác, gộp theo vật liệu khi dựng)
function w4LmModel(k){const K=K3,g=K.group(),st=['#8e877b','#7a756c','#9c968a'],ms='#5f6b45';
  const stone=(r,x,y,z,sy,c,seed,o)=>g.add(K.ico(r,c||st[seed%3],Object.assign({x,y,z,sy:sy||0.5,ry:seed*1.3},o||{}),0,0.35,seed));
  if(k==='lmCairn'){stone(11,0,3,0,0.45,0,1);stone(9,6,2,7,0.4,0,2);stone(8,-7,2,5,0.4,0,3);let y=7;[9,7.6,6.4,5.2,4].forEach((r,i)=>{y+=r*0.55;stone(r,(i%2?1.2:-1),y,(i%3-1)*1.1,0.42,0,i+4);y+=r*0.35;});stone(2.6,0,y+2.5,0,1.6,'#6e6a62',11);}
  else if(k==='lmMenhir'){stone(7,0,26,0,3.2,'#a49c8e',3,{sx:1.15});stone(4,0.5,48,0.4,1.4,ms,5);stone(7,10,3,4,0.5,0,6);stone(5,-9,2,-5,0.55,0,7);}
  else if(k==='lmCircle'){for(let i=0;i<9;i++){const a=i/9*6.2832,r=44;stone(5.5,Math.cos(a)*r,15,Math.sin(a)*r,(i%3?2.6:3.3)*0.95,0,i+1,{ry:a});}stone(10,0,2.5,0,0.3,'#8a8478',12);stone(4,0,6.5,0,0.5,ms,13);}
  else if(k==='lmSpring'){for(let i=0;i<11;i++){const a=i/11*6.2832,r=26+(i%2)*3;stone(4.5+(i%3),Math.cos(a)*r,1,Math.sin(a)*r,0.55,0,i+1);}stone(6,-36,16,10,2.6,'#857f74',14);stone(3,-35,30,10,1,ms,15);}
  return g;}
{const _db=decorBuild;decorBuild=function(){const all=DECO_PLAN,mine=all.filter(d=>d.w4);if(!mine.length)return _db();DECO_PLAN=all.filter(d=>!d.w4);try{_db();}finally{DECO_PLAN=all;}try{decor4Build(mine);}catch(e){console.warn('dựng vật cảnh mới',e);}};}
/* ---------- cây cỏ, khoáng vật riêng từng vùng (nối sau tài nguyên cũ; chỉ thế giới 3) ---------- */
function res4Gen(seed){const R=rng((seed|0)*29+77),Q=W4.Z;const isTree=t=>/^(pine|oak|birch|dead|savannaTree)$/.test(t);
  const okFree=(x,z,r)=>{for(const i of near(x,z,r+30)){const q=RES[i];if(Math.hypot(q.x-x,q.z-z)<r+(RT[q.t].r||4)*0.8)return false;}return true;};
  const put=(t,x,z,s)=>{const q={i:RES.length,t,x,z,ry:R()*6.283,s:(s||(isTree(t)?0.62+R()*0.7:0.85+R()*0.35))*(RT[t].sc||1),hp:RT[t].hp,st:0,rg:0};RES.push(q);const k=rKey(x,z);if(!RGRID.has(k))RGRID.set(k,[]);RGRID.get(k).push(q.i);return q;};
  const zone=(id,t,n,want,sc,f)=>{const Z=Q[id];if(!Z)return;let c=0,tr=0;while(c<n&&tr<n*40){tr++;const a=R()*6.283,dd=Math.sqrt(R())*(f||1.05),x=Z.x+Math.cos(a)*dd*Z.rx,z=Z.z+Math.sin(a)*dd*Z.rz;const zq=z4At(x,z);if(zq.id!==id||zq.k<0.3)continue;
      const h=hAt(x,z),wd=wdAt(x,z),b=biome(x,z);if(!want(h,wd,b,x,z))continue;if(decoBlock(x,z)||(!RT[t].pass&&trailAt(x,z)>0.15))continue;if(!okFree(x,z,(RT[t].r||4)+3))continue;const q=put(t,x,z,sc?sc():0);if(t==='lotus')q.wy=0.4;c++;}};
  const dry=(h,wd)=>wd<=0&&h>=2,flat=(h,wd,b,x,z)=>dry(h,wd)&&slopeAt(x,z)<0.6;
  zone('pineplat','pine',150,flat);zone('pineplat','pineG',26,flat);zone('pineplat','pineY',50,flat);zone('pineplat','fern',70,dry);zone('pineplat','mushroom',30,dry);zone('pineplat','berry',24,dry);zone('pineplat','boulder',24,dry);zone('pineplat','birch',20,flat);
  zone('bamboovl','bamboo',100,flat);zone('bamboovl','banana',30,flat);zone('bamboovl','fern',110,dry);zone('bamboovl','ginger',14,dry);zone('bamboovl','mint',12,(h,wd,b)=>dry(h,wd)&&b==='bank');
  for(const [t,n] of [['flowerR',120],['flowerY',120],['flowerW',110],['flowerP',110]])zone('meadow4',t,n,flat,()=>1.25+R()*0.6);
  zone('meadow4','tallgrass',40,flat);zone('meadow4','birch',14,flat);zone('meadow4','berry',16,flat);zone('meadow4','wildgrain',24,flat);zone('meadow4','beehive',4,flat);
  zone('terrace','flax',30,flat);zone('terrace','centella',26,flat);zone('terrace','mint',14,flat);zone('terrace','flowerW',30,flat,()=>1.2+R()*0.4);zone('terrace','young',10,flat,null,1.1);zone('terrace','bamboo',8,flat,null,1.1);
  zone('mangrove','lotus',60,(h)=>h<-0.8&&h>-7);zone('mangrove','reedBed',50,(h,wd)=>h>-1.5&&h<3);zone('mangrove','reeds',50,(h,wd)=>dry(h,wd)&&h<6);
  zone('mangrove','palm',36,(h,wd)=>dry(h,wd)&&h<7,()=>0.5+R()*0.25);zone('mangrove','young',30,(h,wd)=>dry(h,wd)&&h<8,()=>0.5+R()*0.3);zone('mangrove','fern',24,dry);
  zone('ancient','oakG',46,flat,()=>1.5+R()*0.8);zone('ancient','oak',60,flat);zone('ancient','fern',150,dry);zone('ancient','banana',30,flat);zone('ancient','deadLog',30,flat);
  zone('ancient','mushroom',36,dry);zone('ancient','mushroomR',14,dry);zone('ancient','ginger',24,dry);zone('ancient','beehive',6,flat);
  zone('trangan','banana',22,(h,wd)=>dry(h,wd)&&h<30);zone('trangan','bamboo',16,(h,wd)=>dry(h,wd)&&h<30);zone('trangan','palm',12,(h,wd)=>dry(h,wd)&&h<14,()=>0.7+R()*0.3);
  zone('trangan','reedBed',36,(h)=>h>-1.5&&h<2.5);zone('trangan','lotus',44,(h)=>h<-0.8&&h>-6);zone('trangan','shrub',20,dry);
  zone('halong','palm',36,(h,wd,b)=>dry(h,wd)&&h<12);zone('halong','aloe',10,dry);zone('halong','pebble',24,dry);zone('halong','shrub',14,dry);
  zone('basalt','savannaTree',24,flat);zone('basalt','tallgrass',80,flat);zone('basalt','boulder',36,dry);zone('basalt','flintRock',10,dry);zone('basalt','copperRock',6,dry);zone('basalt','tinRock',5,dry);zone('basalt','flowerR',24,flat);
  zone('hotspring','boulder',10,dry,null,1.3);zone('hotspring','aloe',6,dry,null,1.3);
  {let c=0,t=0;const P=W4.chin&&RIV[W4.chinI].pts;if(P){const n=Math.floor((P.length-1)*(CHIN.end+0.02));while(c<70&&t<3000){t++;const i=Math.floor(R()*n),p=P[i],sd=(R()-0.5)*260,x=p[0]+sd,z=p[1]+(R()-0.5)*80,h=hAt(x,z);if(wdAt(x,z)>0||h<4||decoBlock(x,z)||!okFree(x,z,8))continue;put(R()<0.6?'fern':R()<0.6?'scree':'boulder',x,z);c++;}}}}
// đồi bậc thang để trống cây lớn cho thấy rõ từng bậc (đánh lại chỉ số trước khi thêm tài nguyên vùng mới)
function res4Thin(){const big=/^(pine|oak|birch|dead|young|pineY|birchY|pineG|oakG|log|deadLog|savannaTree)$/,keep=RES.filter(q=>{const z=z4At(q.x,q.z);return !(z.id==='terrace'&&z.k>0.4&&big.test(q.t));});
  if(keep.length===RES.length)return;RES.length=0;RGRID=new Map();keep.forEach((q,i)=>{q.i=i;RES.push(q);const k=rKey(q.x,q.z);if(!RGRID.has(k))RGRID.set(k,[]);RGRID.get(k).push(i);});}
/* ---------- trảng trống trong rừng rậm (rừng cổ thụ, cao nguyên thông, thung lũng tre): dọc đường mòn & quanh chỗ ngắm cảnh ----------
   Cây lớn trong trảng đổi tại chỗ thành hoa/cỏ/sỏi (giữ nguyên số thứ tự tài nguyên). Mật độ rừng ngoài trảng giữ nguyên. */
const W4DENSE={ancient:1,pineplat:1,bamboovl:1};
function w4GladePlan(seed){const R=rng((seed|0)*13+4447),L=[],Q=W4.Z;
  for(const g of REG){const r={ancient:160,pineplat:175,bamboovl:140,vista:120}[g.id];if(r)L.push({x:g.x,z:g.z,r,c:1});}
  for(const t of TRAILS||[]){let acc=200+R()*150;for(let i=1;i<t.p.length;i++){const [x0,z0]=t.p[i-1],[x,z]=t.p[i];acc+=Math.hypot(x-x0,z-z0);const q=z4At(x,z);if(!q.id||!W4DENSE[q.id]||q.k<0.25){continue;}
      if(acc<330)continue;acc=R()*60;const dx=x-x0,dz=z-z0,dl=Math.hypot(dx,dz)||1,sd=(R()<0.5?-1:1)*(15+R()*40);const gx=x+dz/dl*sd,gz=z-dx/dl*sd;if(wdAt(gx,gz)>0)continue;L.push({x:gx,z:gz,r:58+R()*50,c:0});}}
  W4.glades=L;return L;}
function w4GladeK(x,z){let best=0;for(const g of W4.glades||[]){const dx=x-g.x,dz=z-g.z;if(Math.abs(dx)>g.r*1.3||Math.abs(dz)>g.r*1.3)continue;const w=g.r*(1+NS.fbm(x/60+g.x*0.01,z/60,2)*0.35),u=Math.hypot(dx,dz)/w;const k=1-ss(0.7,1.08,u);if(k>best)best=k;}return best;}
function res4Glades(seed){const R=rng((seed|0)*17+9091),big=/^(pine|oak|birch|dead|young|pineY|birchY|pineG|oakG|log|deadLog|savannaTree|bamboo|banana|palm|shrub|berry|beehive)$/,low=/^(fern|tallgrass)$/;
  w4GladePlan(seed);let n=0;// mỗi vùng chỉ thêm một loại hoa mới (đỡ tốn lệnh vẽ), còn lại là loại đã có sẵn trong vùng
  const SW={ancient:['flowerW','flowerW','mushroom','ginger','fern'],pineplat:['flowerP','flowerP','mushroom','berry','fern'],bamboovl:['flowerY','flowerY','mint','ginger','fern']},SW0=['flowerY','flowerY','pebble'];
  for(const q of RES){const z=z4At(q.x,q.z),dense=!!(z.id&&W4DENSE[z.id]&&z.k>0.2),isBig=big.test(q.t),gk=w4GladeK(q.x,q.z);if(!dense&&gk<=0)continue;
    const tr=dense?trailAt(q.x,q.z):0;let rm=false;if(isBig)rm=gk>0.55||(gk>0.15&&R()<gk*1.4)||(tr>0.01&&!/^(berry|beehive)$/.test(q.t));else if(low.test(q.t))rm=gk>0.7&&R()<0.75;
    if(!rm)continue;const sw=SW[z.id]||SW0,t=sw[Math.floor(R()*sw.length)];q.t=t;q.s=(RT[t].sc||1)*(/^flower/.test(t)?1.15+R()*0.4:0.85+R()*0.35);q.hp=RT[t].hp;n++;}
  // vài khóm hoa, sỏi đá trong mỗi trảng
  const put=(t,x,z,sc)=>{const q={i:RES.length,t,x,z,ry:R()*6.283,s:(RT[t].sc||1)*sc,hp:RT[t].hp,st:0,rg:0};RES.push(q);const k=rKey(x,z);if(!RGRID.has(k))RGRID.set(k,[]);RGRID.get(k).push(q.i);};
  for(const g of W4.glades){const zid=z4At(g.x,g.z).id,fl=zid==='ancient'?['flowerW','mushroom']:zid==='pineplat'?['flowerP','mushroom']:zid==='bamboovl'?['flowerY','mint']:['flowerY','flowerY'];
    const np=g.c?4:2;for(let p=0;p<np;p++){const a=R()*6.283,d=g.r*(0.25+R()*0.55),cx=g.x+Math.cos(a)*d,cz=g.z+Math.sin(a)*d,t=fl[p%2];for(let k=0;k<6;k++){const x=cx+(R()-0.5)*26,z=cz+(R()-0.5)*26;if(wdAt(x,z)>0||trailAt(x,z)>0.2||decoBlock(x,z))continue;put(t,x,z,1.1+R()*0.5);}}
    for(let k=0;k<(g.c?3:1);k++){const a=R()*6.283,d=g.r*(0.75+R()*0.25),x=g.x+Math.cos(a)*d,z=g.z+Math.sin(a)*d;if(wdAt(x,z)>0||trailAt(x,z)>0.05||decoBlock(x,z))continue;put(R()<0.35?'boulder':'pebble',x,z,0.7+R()*0.5);}}
  W4.gladeN=n;}
/* ---------- chi tiết vùng mới: khóm hoa dại & sỏi đá (dùng loại sẵn có → gần như không thêm lệnh vẽ) ---------- */
function res4Detail(seed){const R=rng((seed|0)*23+515),Q=W4.Z;
  const put=(t,x,z,sc)=>{const q={i:RES.length,t,x,z,ry:R()*6.283,s:(RT[t].sc||1)*sc,hp:RT[t].hp,st:0,rg:0};RES.push(q);const k=rKey(x,z);if(!RGRID.has(k))RGRID.set(k,[]);RGRID.get(k).push(q.i);};
  const okAt=(x,z)=>{const h=hAt(x,z);if(h<2||wdAt(x,z)>0||slopeAt(x,z)>0.5||trailAt(x,z)>0.2||decoBlock(x,z))return false;for(const i of near(x,z,10)){const o=RES[i];if(!RT[o.t].pass&&Math.hypot(o.x-x,o.z-z)<(RT[o.t].r||4))return false;}return true;};
  const patches=(id,n,types,per,f)=>{const Z=Q[id];if(!Z)return;let c=0,tr=0;while(c<n&&tr<n*30){tr++;const a=R()*6.283,dd=Math.sqrt(R())*(f||0.95),cx=Z.x+Math.cos(a)*dd*Z.rx,cz=Z.z+Math.sin(a)*dd*Z.rz;const q=z4At(cx,cz);if(q.id!==id||q.k<0.3||!okAt(cx,cz))continue;
      const t=types[c%types.length];for(let k=0;k<per;k++){const x=cx+(R()-0.5)*34,z=cz+(R()-0.5)*34;if(okAt(x,z))put(t,x,z,/^flower/.test(t)?1.1+R()*0.5:0.7+R()*0.6);}c++;}};
  // dùng loại đã có trong vùng (res4Gen) + nhiều nhất một loại mới
  patches('terrace',14,['flowerW','centella','flowerW'],7,0.9);patches('basalt',16,['flowerR','boulder','flowerR'],6);patches('hotspring',8,['aloe','boulder','flowerR'],5,1.3);
  patches('trangan',12,['flowerP','shrub','flowerP'],6);patches('halong',8,['pebble','aloe'],5);patches('mangrove',8,['flowerP','reeds'],5);
  {const v=REG.find(g=>g.id==='vista');if(v)for(let k=0;k<5;k++){const a=R()*6.283,d=40+R()*90,cx=v.x+Math.cos(a)*d,cz=v.z+Math.sin(a)*d;const t=['flowerY','flowerY','pebble'][k%3];for(let m=0;m<6;m++){const x=cx+(R()-0.5)*30,z=cz+(R()-0.5)*30;if(okAt(x,z))put(t,x,z,1+R()*0.5);}}}}
{const _rg=resGen;resGen=function(seed){_rg(seed);if(WV>=3)try{res4Thin();res4Gen(seed);}catch(e){console.warn('tài nguyên vùng mới',e);}
  if(WV>=3){try{res4Glades(seed);}catch(e){console.warn('trảng rừng',e);}try{res4Detail(seed);}catch(e){console.warn('chi tiết vùng',e);}}};}
/* ---------- sương vùng cao & hơi nước suối nóng ---------- */
function w4Fx(){const T=THREE,U=t3U(),tx=t3Tex(),R=rng(((S&&S.seed)|0)+8181),L=[],Q=W4.Z;U.uMist=U.uMist||{value:new T.Vector4(0,1,0,0)};
  const at=(Z,n,y0,s0,f)=>{for(let i=0;i<n;i++){const a=R()*6.283,dd=Math.sqrt(R())*(f||0.9),x=Z.x+Math.cos(a)*dd*Z.rx,z=Z.z+Math.sin(a)*dd*Z.rz;L.push([x,Math.max(hAt(x,z),0.5)+y0+R()*18,z,s0+R()*s0*0.8]);}};
  at(Q.pineplat,26,16,260);at(Q.trangan,16,6,220,0.8);at(Q.mangrove,8,5,200);at(Q.bamboovl,8,12,200,0.6);
  if(W4.chin){const P=RIV[W4.chinI].pts,n=Math.floor((P.length-1)*CHIN.end);for(let i=0;i<14;i++){const p=P[Math.floor(R()*n)];L.push([p[0],hAt(p[0],p[1])+30+R()*30,p[1],180+R()*120]);}}
  const m=new T.ShaderMaterial({uniforms:Object.assign(T.UniformsUtils.clone(T.UniformsLib.fog),{tN:{value:tx.tN},uT:U.uT,uMist:U.uMist,cH:U.cH,sC:U.sC,sI:U.sI}),transparent:true,depthWrite:false,fog:true,
    vertexShader:`varying vec2 vQ;varying vec3 vP;varying float vS;
#include <fog_pars_vertex>
void main(){vec3 c=instanceMatrix[3].xyz;float s=length(instanceMatrix[0].xyz);vec3 rt=vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]);
 vec3 wp=c+rt*position.x*s+vec3(0.0,1.0,0.0)*position.y*s*0.34;vQ=position.xy*2.0;vP=wp;vS=s;vec4 mvPosition=viewMatrix*vec4(wp,1.0);gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,
    fragmentShader:`uniform sampler2D tN;uniform float uT,sI;uniform vec4 uMist;uniform vec3 cH,sC;varying vec2 vQ;varying vec3 vP;varying float vS;
#include <fog_pars_fragment>
void main(){float r=length(vQ);if(r>1.0)discard;float n=texture2D(tN,vP.xz*(1.0/460.0)+vec2(uT*0.005,uT*0.002)+vQ*0.1).g;
 float a=(1.0-smoothstep(0.1,1.0,r))*smoothstep(0.2,0.75,n+0.2)*(1.0-smoothstep(-0.2,1.0,vQ.y)*0.5)*(0.32+uMist.x*0.68);
 float cd=length(cameraPosition-vP);a*=smoothstep(vS*0.2,vS*1.1,cd);if(a<0.004)discard;
 vec3 col=mix(cH,vec3(1.0),0.5)*clamp(uMist.y,0.15,1.05)+sC*sI*0.12;gl_FragColor=vec4(col,a*0.36);
#include <tonemapping_fragment>
#include <encodings_fragment>
#include <fog_fragment>
}`});m.userData.noSea=1;
  const grp=new T.Group(),g=new T.PlaneGeometry(1,1),im=new T.InstancedMesh(g,m,L.length),M=new T.Matrix4();L.forEach((q,i)=>{M.makeScale(q[3],q[3],q[3]);M.setPosition(q[0],q[1],q[2]);im.setMatrixAt(i,M);});
  im.frustumCulled=false;im.renderOrder=5;W4.mist=im;W4.mistL=L;grp.add(im);
  // hơi nước bốc lên từ suối nóng: một lệnh vẽ
  if(W4.hot){const NP=46,pp=[],ps=[];for(let i=0;i<NP;i++){pp.push(W4.hot[0]+(R()-0.5)*50,hAt(W4.hot[0],W4.hot[1])+2,W4.hot[1]+(R()-0.5)*50);ps.push(R(),R(),R(),R());}
    const gp=new T.BufferGeometry();gp.setAttribute('position',new T.Float32BufferAttribute(pp,3));gp.setAttribute('aS',new T.Float32BufferAttribute(ps,4));gp.computeBoundingSphere();gp.boundingSphere.radius+=200;
    const pm=new T.ShaderMaterial({uniforms:Object.assign(T.UniformsUtils.clone(T.UniformsLib.fog),{uT:U.uT,uW:U.uW,uPx:U.uPx}),transparent:true,depthWrite:false,fog:true,
      vertexShader:`attribute vec4 aS;uniform float uT,uPx;varying float vA;
#include <fog_pars_vertex>
void main(){float ph=fract(uT*(0.07+aS.y*0.05)+aS.x*7.13);vec3 p=position;p.y+=ph*(70.0+aS.z*50.0);p.x+=sin(ph*3.0+aS.w*6.0)*18.0*ph+ph*30.0;p.z+=cos(ph*2.0+aS.x*5.0)*14.0*ph;
 vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;gl_PointSize=clamp((24.0+ph*70.0)*projectionMatrix[1][1]*uPx/max(-mvPosition.z,1.0),1.0,260.0);
 vA=0.3*smoothstep(0.0,0.15,ph)*(1.0-ph);
#include <fog_vertex>
}`,
      fragmentShader:`uniform vec4 uW;varying float vA;
#include <fog_pars_fragment>
void main(){vec2 d=gl_PointCoord-0.5;float r=length(d)*2.0;float a=exp(-r*r*3.0)*(1.0-r)*vA;if(a<0.004)discard;gl_FragColor=vec4(vec3(0.94,0.95,0.96)*(0.25+0.8*uW.x),a);
#include <tonemapping_fragment>
#include <encodings_fragment>
#include <fog_fragment>
}`});pm.userData.noSea=1;const pts=new T.Points(gp,pm);pts.renderOrder=5;W4.steam=pts;grp.add(pts);}
  return grp;}
{const _wm=waterMesh;waterMesh=function(){const g=_wm();if(WV>=3){try{g.add(w4Fx());}catch(e){console.warn('sương vùng mới',e);}try{g.add(w4TerraceFx());}catch(e){console.warn('ruộng bậc thang',e);}}return g;};}
/* ---------- Đồi Bậc Thang: nước đọng lấp lánh trên mặt bậc + bờ đất thấp dọc mép bậc (mỗi thứ 1 lệnh vẽ) ---------- */
function w4TerraceFx(){const T=THREE,grp=new T.Group(),Z=W4.Z.terrace;if(!Z||!HG)return grp;const R=Z.rx*1.1,gi=v=>Math.round((v+WSIZE/2)/HSTEP),gw=i=>-WSIZE/2+i*HSTEP;
  const i0=Math.max(1,gi(Z.x-R)),i1=Math.min(HN-2,gi(Z.x+R)),j0=Math.max(1,gi(Z.z-R)),j1=Math.min(HN-2,gi(Z.z+R)),W=i1-i0+1,H=j1-j0+1;
  const dep=new Float32Array(W*H).fill(-2),cls=new Uint8Array(W*H).fill(4),zk=new Float32Array(W*H);
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const n=j*HN+i,l=(j-j0)*W+(i-i0),x=gw(i),z=gw(j),q=z4At(x,z);if(q.id!=='terrace')continue;zk[l]=q.k;
    if(WG[n]>-900||trailAt(x,z)>0.12)continue;const c=w4TCls(n);cls[l]=c;if(c===1||c===3){dep[l]=-1.6;continue;}if(c!==0&&c!==2)continue;const pk=w4PoolK(x,z,q.k);if(pk>0.05)dep[l]=-0.6+pk*(c===2?3.2:5.4);}
  // tấm nước: chỉ những tam giác nằm phẳng trên mặt bậc
  const pos=[],aF=[],aD=[],idx=[],vid=new Int32Array(W*H).fill(-1);const V=(i,j)=>{const l=(j-j0)*W+(i-i0);if(vid[l]<0){const x=gw(i),z=gw(j);vid[l]=pos.length/3;pos.push(x,HG[j*HN+i]+0.55,z);aF.push(x,z,1,0);aD.push(dep[l],0,0,0);}return vid[l];};
  const tri=(a,b,c)=>{const L=[a,b,c],hs=L.map(([i,j])=>HG[j*HN+i]),ds=L.map(([i,j])=>dep[(j-j0)*W+(i-i0)]);if(Math.max(...hs)-Math.min(...hs)>1.6||Math.max(...ds)<=0.05)return;idx.push(V(...a),V(...b),V(...c));};
  for(let j=j0;j<j1;j++)for(let i=i0;i<i1;i++){tri([i,j],[i,j+1],[i+1,j]);tri([i+1,j],[i,j+1],[i+1,j+1]);}
  if(idx.length&&typeof t3WaterMat==='function'){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('aF',new T.Float32BufferAttribute(aF,4));g.setAttribute('aD',new T.Float32BufferAttribute(aD,4));g.setIndex(idx);g.computeBoundingSphere();
    const me=new T.Mesh(g,t3WaterMat('river'));me.renderOrder=2;grp.add(me);W4.pools=me;}
  // bờ đất: một khúc ngắn ở mỗi đỉnh mép bậc, xoay theo đường đồng mức
  const B=[];for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const l=(j-j0)*W+(i-i0),c=cls[l];if((c!==1&&c!==3)||zk[l]<0.6)continue;const n=j*HN+i,gx=HG[n+1]-HG[n-1],gz=HG[n+HN]-HG[n-HN],gl=Math.hypot(gx,gz)||1,tx=-gz/gl,tz=gx/gl;
    B.push([gw(i)-gx/gl*3,HG[n]-1.4,gw(j)-gz/gl*3,Math.atan2(-tz,tx),0.85+((i*7+j*13)%5)*0.06]);}
  if(B.length){const g=w4BundGeo(),m=new T.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0,flatShading:true});let cx=0,cz=0,cy=0;B.forEach(b=>{cx+=b[0];cy+=b[1];cz+=b[2];});cx/=B.length;cy/=B.length;cz/=B.length;let r=0;B.forEach(b=>{r=Math.max(r,Math.hypot(b[0]-cx,b[2]-cz)+40);});
    const api=instGroup([{geo:g,mat:occMat(m)}],B.length,{sphere:{x:cx,y:cy,z:cz,r},shadow:false});B.forEach((b,k)=>api.set(k,b[0],b[1],b[2],b[3],b[4]));api.flush();grp.add(api.G);W4.bunds=api;}
  return grp;}
// khúc bờ đất: lăng trụ hình thang dài 31 (trục x), đáy 10, đỉnh 4.4, cao 3.5 (chôn 1.4); đỉnh cỏ, sườn đất (màu tuyến tính)
function w4BundGeo(){const T=THREE,L=15.5,b=5,t=2.2,h=3.5,P=[],C=[],top=[0.11,0.17,0.045],side=[0.15,0.1,0.055],end=[0.13,0.085,0.045];
  const q=(a,bb,c,d,col)=>{P.push(...a,...bb,...c,...a,...c,...d);for(let k=0;k<6;k++)C.push(...col);};
  const A=[-L,0,b],B2=[L,0,b],C2=[L,h,t],D=[-L,h,t],E=[-L,0,-b],F=[L,0,-b],G2=[L,h,-t],H2=[-L,h,-t];
  q(A,B2,C2,D,side);q(F,E,H2,G2,side);q(D,C2,G2,H2,top);q(E,A,D,H2,end);q(B2,F,G2,C2,end);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('color',new T.Float32BufferAttribute(C,3));g.computeVertexNormals();g.computeBoundingSphere();return g;}
/* ---------- núi xa chân trời: vòng hình bóng núi bám theo camera, vẽ trước mọi vật, nhuộm theo màu trời ---------- */
function w4Horizon(){const T=THREE,U=t3U(),N=200,pos=[],aa=[],idx=[];
  for(let L=0;L<3;L++){const base=pos.length/3,r=[1,0.965,0.93][L];for(let i=0;i<=N;i++){const a=i/N*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a);
      let e=0,amp=1,f=1.6+L*0.7;for(let o=0;o<5;o++){e+=amp*(1-Math.abs(NS.n2(ca*f+L*17.3+3,sa*f-L*9.1+5)*1.8));amp*=0.5;f*=2.1;}e=e/1.94;
      const mask=0.35+0.65*ss(-0.3,0.4,NS.n2(ca*1.1+L*5+40,sa*1.1-L*3));let el=([0.02,0.012,0.006][L]+Math.pow(Math.max(0,e-0.22),1.5)*[0.17,0.11,0.065][L])*mask;
      pos.push(ca*r,-0.03,sa*r,ca*r,el,sa*r);aa.push(L,0,el,L,1,el);}
    for(let i=0;i<N;i++){const a=base+i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('aL',new T.Float32BufferAttribute(aa,3));g.setIndex(idx);
  const m=new T.ShaderMaterial({uniforms:{cH:U.cH,cT:U.cT,sC:U.sC,sD:U.sD,uW:U.uW},transparent:false,depthWrite:false,depthTest:false,fog:false,side:T.DoubleSide,
    vertexShader:`attribute vec3 aL;varying vec3 vL;varying vec3 vD;void main(){vL=aL;vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`uniform vec3 cH,cT,sC,sD;uniform vec4 uW;varying vec3 vL;varying vec3 vD;
void main(){float L=vL.x,v=vL.y;float lit=clamp(uW.x,0.06,1.1);
 vec3 rock=mix(vec3(0.17,0.25,0.31),vec3(0.24,0.33,0.36),L*0.5)*lit;
 float sn=smoothstep(0.085,0.13,vL.z)*smoothstep(0.55,0.95,v)*(1.0-L*0.5);rock=mix(rock,vec3(0.88,0.9,0.94)*lit,sn*0.8);
 float sun=max(0.0,dot(normalize(vec3(vD.x,0.0,vD.z)),normalize(vec3(sD.x,0.0,sD.z))));rock+=sC*0.08*sun*lit;
 float haze=L<0.5?0.52:(L<1.5?0.42:0.33);haze=mix(haze,0.96,(1.0-v)*0.62);
 vec3 col=mix(rock,cH,haze);gl_FragColor=vec4(col,1.0);
#include <tonemapping_fragment>
#include <encodings_fragment>
}`});
  const me=new T.Mesh(g,m);me.frustumCulled=false;me.renderOrder=-1e8;me.matrixAutoUpdate=true;W4.ring=me;return me;}
function w4RingTick(){const r=W4.ring;if(!r)return;const cam=G.cam,R=(cam.far||3900)*0.93;r.scale.set(R,R,R);r.position.set(cam.position.x,cam.position.y-R*0.012,cam.position.z);r.visible=isFP()||G.pitch<0.7;}
/* ---------- mỗi khung: núi xa, sương, suối nóng sưởi ấm ---------- */
function w4Tick(){if(WV<3)return;w4RingTick();const dt=G.dt||0.016;
  if(W4.hot&&G.on&&!G.paused){const d=Math.hypot(P.x-W4.hot[0],P.z-W4.hot[1]);if(d<170&&wdAt(P.x,P.z)>0.4){S.p.warm=Math.min(100,(S.p.warm||0)+dt*5);if(!G.w4hotT||G.t-G.w4hotT>60){G.w4hotT=G.t;uiToast('♨️ Nước suối ấm sực, người bạn ấm dần lên.','good');}}}}
{const _st=skyTick;skyTick=function(){_st();try{w4Tick();}catch(e){}};}
/* ---------- bản đồ: phân giải cao hơn cho thế giới rộng, tô màu vùng mới ---------- */
{const _mb=mapBase;mapBase=function(){if(WV<3)return _mb();return MAPIMG||(MAPIMG=mapRender(-WSIZE/2,-WSIZE/2,WSIZE,420));};}
{const _mp=mapPix;mapPix=function(x,z,col,c2){_mp(x,z,col,c2);if(WV<3)return;const q=z4At(x,z);if(!q.id||wdAt(x,z)>0.3)return;const c=[col.r,col.g,col.b];w4Tint(q.id,Math.min(1,q.k*1.3),x,z,hAt(x,z),slopeAt(x,z),c);col.setRGB(c[0],c[1],c[2]);};}
/* ---------- phiên bản thế giới trong bản lưu ---------- */
// fixSave cũ xoá S.res khi wv!==2: bản lưu thế giới 3 giữ nguyên
{const _fs=fixSave;fixSave=function(o){let r;if(o&&o.wv===3){o.wv=2;r=_fs(o);if(r)r.wv=3;}else r=_fs(o);try{worldCfg(r&&r.wv);}catch(e){}return r;};}
// ván mới luôn dùng thế giới 3
{const _ng=newGame;newGame=function(o){_ng(o);S.wv=3;worldCfg(3);S._new=1;save();delete S._new;};}
// động vật vùng: thêm vùng mới vào danh sách ưa thích
function w4Animals(){const A=(k,ids)=>{const D=ANIMALS[k];if(!D)return;D.reg=D.reg||[];ids.forEach(i=>{if(!D.reg.includes(i))D.reg.push(i);});};
  A('tiger',['ancient','bamboovl']);A('gaur',['basalt','meadow4']);A('monkey',['trangan','ancient']);A('crocodile',['mangrove']);}
{const _si=sceneInit;sceneInit=function(){worldCfg(S&&S.wv);if(WV>=3)w4Animals();_si();if(WV>=3){try{G.sc.add(w4Horizon());}catch(e){console.warn('núi xa',e);}}
  else if(S&&!S.w4note){S.w4note=1;setTimeout(()=>{try{uiToast('🌏 Đã có thế giới mới rộng gấp đôi với 12 vùng cảnh đẹp. Mở Bản đồ (M) để chuyển sang khi muốn.','gold');}catch(e){}},9000);}};}
/* ---------- chuyển bản lưu cũ sang thế giới mới (tuỳ người chơi) ---------- */
function w4Migrate(){if(!S||S.wv===3)return;S.wv=3;S.res={};S.disc={};S.fogm=null;S.mark=null;const home=S.builds.find(b=>pieceDef(b.k)&&pieceDef(b.k).bed)||S.builds.find(b=>b.k==='campfire');
  const x=home?home.x+24:SPAWN[0],z=home?home.z+24:SPAWN[1];S.p.x=x;S.p.z=z;if(typeof P!=='undefined'){P.x=x;P.z=z;}S._new=1;save();delete S._new;try{uiToast('🌏 Đang dựng thế giới mới…','gold');}catch(e){}setTimeout(()=>location.reload(),400);}
{const _mh=mapHtml;mapHtml=function(){const h=_mh();if(!S||S.wv===3)return h;return `<div class="landbox" id="w4mig"><b>🌏 Thế giới mới rộng gấp đôi</b><span class="small muted">Ván này đang ở bản đồ cũ. Thế giới mới thêm 12 vùng: Tràng An, Vịnh Đá Ngàn Đảo, Cao nguyên thông mù sương, Thác Chín Tầng, đồng hoa, rừng ngập mặn, núi lửa tắt, suối nóng… Giữ nguyên túi đồ, nhà cửa, kỹ năng; cây cỏ mọc lại từ đầu, bản đồ khám phá lại.</span><div class="row"><button class="btn sm" data-a="w4mig">Chuyển sang thế giới mới</button></div></div>`+h;};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="w4mig"]');if(!b)return;e.stopImmediatePropagation();if(!b.dataset.ok){b.dataset.ok=1;b.textContent='Chạm lần nữa để xác nhận';return;}w4Migrate();},true);
