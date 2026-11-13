/* ===================== THẾ GIỚI: ĐỊA HÌNH LỚN, SÔNG SUỐI CÓ ĐỘ CAO, THÁC NƯỚC ===================== */
/* Đảo ~520 m. Bắc: dãy núi tuyết. Đông bắc: khối núi đá vôi. Giữa-đông: cao nguyên vách đá có vực nứt.
   Tây: thảo nguyên. Đông nam: rừng già. Tây nam: hồ sen. Đông: vách biển. Sông Mẹ chảy từ núi qua hẻm vực xuống biển nam,
   ba con suối nhập vào, có thác ở chỗ đổ dốc. Mặt nước sông có độ cao riêng (không phải mực nước biển). */
// WR: bán kính thế giới (vùng chơi). WCR: thước bố cục lõi cũ (vị trí các vùng gốc). WV: phiên bản thế giới — world4.js đặt lại WR/WSEG/... theo bản lưu.
let WR=5200,WSEG=448,WSIZE=WR*2+800,WV=2,WRES=1;const WCR=5200;
// WOZ: khoảng từ mép BẮC của khung lưới tới gốc toạ độ (trục z). Thế giới 2-3: khung cân quanh gốc (WOZ=WSIZE/2).
// Thế giới 4 (hình chữ S) kéo khung về phía nam: z chạy từ -WOZ tới WSIZE-WOZ. Trục x luôn cân: -WSIZE/2 … WSIZE/2.
let WOZ=WSIZE/2;
let NS=null,RIV=[],RBK=null,WFALLS=[],SPAWN=[0,0];
const F=(fx,fz)=>[fx*WCR,fz*WCR];
function noiseInit(seed){const R=rng(seed||1),P=new Uint8Array(512),G=[];for(let i=0;i<256;i++){P[i]=i;const a=R()*Math.PI*2;G.push([Math.cos(a),Math.sin(a)]);}
  for(let i=255;i>0;i--){const j=Math.floor(R()*(i+1));const t=P[i];P[i]=P[j];P[j]=t;}for(let i=0;i<256;i++)P[i+256]=P[i];
  const fade=t=>t*t*t*(t*(t*6-15)+10);
  const n2=(x,y)=>{const X=Math.floor(x),Y=Math.floor(y),xf=x-X,yf=y-Y,xi=X&255,yi=Y&255;const g=(i,j,dx,dy)=>{const v=G[P[P[xi+i]+yi+j]&255];return v[0]*dx+v[1]*dy;};
    const u=fade(xf),v=fade(yf);const a=g(0,0,xf,yf),b=g(1,0,xf-1,yf),c=g(0,1,xf,yf-1),d=g(1,1,xf-1,yf-1);return (a+(b-a)*u)+((c+(d-c)*u)-(a+(b-a)*u))*v;};
  const fbm=(x,y,o)=>{let s=0,a=0.5,f=1,t=0;for(let i=0;i<(o||4);i++){s+=a*n2(x*f,y*f);t+=a;a*=0.5;f*=2.03;}return s/t;};
  const ridge=(x,y,o)=>{let s=0,a=0.5,f=1,t=0;for(let i=0;i<(o||5);i++){let n=1-Math.abs(n2(x*f,y*f)*1.7);n=Math.max(0,n);n*=n;s+=a*n;t+=a;a*=0.5;f*=2.07;}return s/t;};
  NS={n2,fbm,ridge,seed};riversPlan(seed);}
/* ---------- sông suối: đường đi uốn lượn ---------- */
function riversPlan(seed){const R=rng((seed||1)*7+3),J=a=>a.map(([x,z],i)=>i===0||i===a.length-1?F(x,z):[F(x,z)[0]+(R()-0.5)*300,F(x,z)[1]+(R()-0.5)*240]);
  const defs=[{id:'main',n:'Sông Mẹ',wp:[[0.04,-0.66],[0.15,-0.40],[0.1,-0.16],[-0.02,0.05],[-0.13,0.28],[-0.16,0.52],[-0.19,0.95]],w:[22,72],dep:10,main:1},
    {id:'east',n:'Suối Đông',wp:[[0.52,-0.56],[0.41,-0.34],[0.26,-0.22],[0.135,-0.175]],w:[10,22],dep:4.5},
    {id:'west',n:'Suối Tây',wp:[[-0.44,-0.6],[-0.34,-0.34],[-0.2,-0.11],[-0.03,0.035]],w:[10,24],dep:4.5},
    {id:'plat',n:'Suối Thác',wp:[[0.31,0.07],[0.22,0.15],[0.09,0.21],[-0.085,0.255]],w:[8,18],dep:4}];
  RIV=defs.map(d=>{const wp=J(d.wp),pts=[];for(let i=0;i<wp.length-1;i++){const p0=wp[Math.max(0,i-1)],p1=wp[i],p2=wp[i+1],p3=wp[Math.min(wp.length-1,i+2)];const L=Math.hypot(p2[0]-p1[0],p2[1]-p1[1]),n=Math.max(2,Math.ceil(L/34));
      for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;const cr=(a,b,c,e)=>0.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-e)*t2+(-a+3*b-3*c+e)*t3);pts.push([cr(p0[0],p1[0],p2[0],p3[0]),cr(p0[1],p1[1],p2[1],p3[1])]);}}pts.push(wp[wp.length-1]);
    // uốn khúc nhỏ
    const q=pts.map(([x,z],i)=>{const e=i===0||i===pts.length-1?0:1;return [x+NS.fbm(x/420+3,z/420,2)*90*e,z+NS.fbm(x/420,z/420+7,2)*90*e];});
    return Object.assign({},d,{pts:q,s:null});});
  // điểm xuất phát: bờ tây Sông Mẹ, cách sông ~17 m
  const M=RIV[0].pts,i=Math.floor(M.length*0.47),a=M[i],b=M[i+3],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);SPAWN=[a[0]+dz/L*340,a[1]-dx/L*340];
  // lưới tra nhanh đoạn sông
  RBK=new Map();const C=400;RIV.forEach((r,ri)=>{for(let k=0;k<r.pts.length-1;k++){const [ax,az]=r.pts[k],[bx,bz]=r.pts[k+1],m=200;for(let i=Math.floor((Math.min(ax,bx)-m)/C);i<=Math.floor((Math.max(ax,bx)+m)/C);i++)for(let j=Math.floor((Math.min(az,bz)-m)/C);j<=Math.floor((Math.max(az,bz)+m)/C);j++){const key=i+','+j;if(!RBK.has(key))RBK.set(key,[]);RBK.get(key).push(ri,k);}}});}
// khoảng cách tới sông gần nhất: {d, r (sông), k (đoạn), t, w (bề rộng), s (mặt nước)}
const _rq={d:1e9,r:-1,k:0,t:0,w:0,s:0};
function riverQ(x,z){const L=RBK&&RBK.get(Math.floor(x/400)+','+Math.floor(z/400));_rq.d=1e9;_rq.r=-1;if(!L)return _rq;
  for(let n=0;n<L.length;n+=2){const r=RIV[L[n]],k=L[n+1],[ax,az]=r.pts[k],[bx,bz]=r.pts[k+1];const dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz||1;let t=((x-ax)*dx+(z-az)*dz)/l2;t=t<0?0:t>1?1:t;const qx=ax+dx*t-x,qz=az+dz*t-z,d=Math.sqrt(qx*qx+qz*qz);
    if(d<_rq.d){_rq.d=d;_rq.r=L[n];_rq.k=k;_rq.t=t;}}
  if(_rq.r>=0){const r=RIV[_rq.r],f=(_rq.k+_rq.t)/(r.pts.length-1);_rq.w=r.w[0]+(r.w[1]-r.w[0])*f;_rq.s=r.s?r.s[_rq.k]+(r.s[Math.min(r.s.length-1,_rq.k+1)]-r.s[_rq.k])*_rq.t:0;}return _rq;}
function riverDist(x,z){return riverQ(x,z).d;}
/* ---------- địa hình gốc (chưa có sông) ---------- */
function baseH(x,z){const fx=x/WR,fz=z/WR;let r=Math.hypot(fx,fz*1.04)+NS.fbm(x/1700+7,z/1700-3,3)*0.12;
  const east=ss(0.42,0.6,fx);let land=1-ss(0.80-east*0.0,0.93-east*0.045,r);
  let h=24+NS.fbm(x/1250,z/1250,4)*36+NS.fbm(x/420+11,z/420+5,3)*12+NS.fbm(x/120,z/120,2)*3;
  // dãy núi tuyết phía bắc (đường sống núi gồ ghề)
  const mt=ss(-0.27,-0.48,fz+NS.fbm(x/1100,3.3,2)*0.08);h+=mt*(150+NS.ridge(x/1000,z/1000,5)*620);
  // khối núi đá vôi đông bắc: nền cao
  const kd=Math.hypot(fx-0.45,(fz+0.33)*1.1);h+=(1-ss(0.12,0.24,kd))*70;
  // đồi đá phía đông
  h+=Math.max(0,NS.fbm(x/700+40,z/700,3))*80*ss(0.18,0.32,fx)*(1-mt);
  // cao nguyên vách đá ở giữa-đông, có dốc thoải phía tây nam để lên
  const pd=Math.hypot((fx-0.3)/0.14,(fz-0.09)/0.105)+NS.fbm(x/500,z/500,3)*0.25;const top=185+NS.fbm(x/300,z/300,2)*10;
  const ang=Math.atan2(fz-0.09,fx-0.3),ramp=Math.max(0,Math.cos(ang-2.45))**6;const pk=1-ss(0.9-ramp*0.15,0.97+ramp*0.75,pd);h=h*(1-pk)+Math.max(h,top)*pk;
  // vực nứt sâu trên sườn cao nguyên
  {const ax=0.27*WR,az=-0.1*WR,bx=0.5*WR,bz=-0.05*WR,dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz;let t=((x-ax)*dx+(z-az)*dz)/l2;t=clamp(t,0,1);const d=Math.hypot(ax+dx*t-x,az+dz*t-z)+NS.fbm(x/90,z/90,2)*12,end=ss(0,0.12,t)*ss(1,0.88,t);
   if(d<70)h-=150*(1-ss(16,42,d))*end;}
  // thảo nguyên phía tây: phẳng, thoai thoải
  const sv=1-ss(0.5,1.05,Math.hypot((fx+0.46)/0.27,(fz+0.02)/0.32));h=h*(1-sv*0.8)+(16+NS.fbm(x/800,z/800,3)*12)*sv*0.8;
  // rừng già đông nam: vùng trũng ẩm
  const jg=1-ss(0.5,1.1,Math.hypot((fx-0.25)/0.25,(fz-0.45)/0.22));h=h*(1-jg*0.5)+(14+NS.fbm(x/500,z/500,2)*10)*jg*0.5;
  h=h*land-(1-land)*60;
  // hồ sen tây nam
  {const L=Math.hypot(x-F(-0.3,0.3)[0],z-F(-0.3,0.3)[1])/430;if(L<1.4){const k=1-ss(0.55,1.4,L);h=h*(1-k)+(-24)*k;}}
  // trảng khởi đầu bằng phẳng
  {const sd=Math.hypot(x-SPAWN[0],z-SPAWN[1])/300;if(sd<1){const k=(1-sd*sd)**2;h=h*(1-k)+Math.max(18,Math.min(h,40))*k;}}
  return h;}
/* ---------- mặt nước sông: chỉ chảy xuôi, chỗ tụt mạnh thành thác ---------- */
function riversSurface(){WFALLS=[];RIV.forEach((r,ri)=>{const s=[];let prev=1e9;for(let i=0;i<r.pts.length;i++){const [x,z]=r.pts[i];let hb=0,n=0;for(const [ox,oz] of [[0,0],[25,0],[-25,0],[0,25],[0,-25]]){hb+=baseH(x+ox,z+oz);n++;}hb/=n;
      let v=Math.min(prev,hb-(i===0?3:r.dep*0.5));v=Math.max(v,0);s.push(v);prev=v;}
    // làm mượt các đoạn thoai thoải, giữ nguyên chỗ tụt mạnh (thác)
    for(let it=0;it<3;it++)for(let i=1;i<s.length-1;i++){if(s[i-1]-s[i+1]<20)s[i]=Math.min(s[i-1],Math.max(s[i+1],(s[i-1]+s[i+1])/2));}
    if(!r.main&&!r.sea){const end=r.pts[r.pts.length-1];r.s=s;const m=RIV[0];let best=0,bd=1e9;m.pts.forEach((p,i)=>{const d=Math.hypot(p[0]-end[0],p[1]-end[1]);if(d<bd){bd=d;best=i;}});const sJ=m.s[best];for(let i=s.length-1;i>=0&&s[i]<sJ;i--)s[i]=sJ;}
    r.s=s;for(let i=1;i<s.length;i++){if(s[i-1]-s[i]>16){const [x0,z0]=r.pts[i-1],[x1,z1]=r.pts[i];WFALLS.push({x:(x0+x1)/2,z:(z0+z1)/2,top:s[i-1],bot:s[i],ry:Math.atan2(x1-x0,z1-z0),w:r.w[0]+(r.w[1]-r.w[0])*i/s.length,ri});}}});
  // gộp các thác sát nhau
  WFALLS=WFALLS.filter((f,i)=>!WFALLS.some((g,j)=>j<i&&g.ri===f.ri&&Math.hypot(g.x-f.x,g.z-f.z)<60&&(g.top-g.bot)>=(f.top-f.bot)));}
// độ cao cuối cùng: khoét lòng sông theo mặt nước
function rawH(x,z){let h=baseH(x,z);const q=riverQ(x,z);if(q.r<0)return h;const r=RIV[q.r],hw=q.w*0.5,s=q.s,lowd=ss(70,20,h-s),bank=12+lowd*90;
  if(q.d<hw+bank){const bed=s-r.dep*(1-Math.min(1,(q.d/hw)**2));if(q.d<hw)h=Math.min(h,bed);else h=Math.min(h,(s+0.6)*(1-ss(hw,hw+bank,q.d))+h*ss(hw,hw+bank,q.d));}return h;}
function ss(a,b,x){const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);}
// lưới độ cao + lưới mặt nước (sông có độ cao riêng; biển/hồ ở mực 0)
let HG=null,WG=null;let HN=WSEG+1,HSTEP=WSIZE/WSEG;
function heightsBuild(){riversSurface();HG=new Float32Array(HN*HN);WG=new Float32Array(HN*HN);for(let j=0;j<HN;j++)for(let i=0;i<HN;i++){const x=-WSIZE/2+i*HSTEP,z=-WOZ+j*HSTEP,h=rawH(x,z);HG[j*HN+i]=h;
    const q=riverQ(x,z);let w=h<0?0:-999;if(q.r>=0&&q.d<q.w*0.5+HSTEP&&q.s>0.5)w=Math.max(w,q.s);WG[j*HN+i]=w;}}
function hAt(x,z){const fx=(x+WSIZE/2)/HSTEP,fz=(z+WOZ)/HSTEP;let i=Math.floor(fx),j=Math.floor(fz);if(i<0||j<0||i>=WSEG||j>=WSEG)return -60;const tx=fx-i,tz=fz-j;
  const a=HG[j*HN+i],b=HG[j*HN+i+1],c=HG[(j+1)*HN+i],d=HG[(j+1)*HN+i+1];return a+(b-a)*tx+((c+(d-c)*tx)-(a+(b-a)*tx))*tz;}
// mặt nước tại điểm (hoặc -999 nếu khô); độ sâu nước
function waterAt(x,z){const fx=(x+WSIZE/2)/HSTEP,fz=(z+WOZ)/HSTEP,i=Math.round(fx),j=Math.round(fz);if(i<0||j<0||i>=HN||j>=HN)return 0;let w=WG[j*HN+i];
  if(w<-900){/* không tạo mảng tạm: hàm này được gọi hàng nghìn lần mỗi giây */const i0=Math.floor(fx),j0=Math.floor(fz);for(let q=0;q<4;q++){const a=i0+(q&1),b=j0+(q>>1);if(a>=0&&b>=0&&a<HN&&b<HN&&WG[b*HN+a]>w)w=WG[b*HN+a];}}return w;}
function wdAt(x,z){const w=waterAt(x,z);if(w<-900)return 0;return Math.max(0,w-hAt(x,z));}
function slopeAt(x,z){const e=12;return Math.hypot(hAt(x+e,z)-hAt(x-e,z),hAt(x,z+e)-hAt(x,z-e))/(2*e);}
// vùng sinh thái
function moist(x,z){return NS.fbm(x/700-20,z/700+30,3);}
function savannaK(x,z){return 1-ss(0.5,1.05,Math.hypot((x/WCR+0.46)/0.27,(z/WCR+0.02)/0.32));}
function jungleK(x,z){return 1-ss(0.5,1.1,Math.hypot((x/WCR-0.25)/0.25,(z/WCR-0.45)/0.22));}
function biome(x,z){const h=hAt(x,z);if(wdAt(x,z)>0.4)return 'water';const r=WV>=4?v5R(x,z):Math.hypot(x,z*1.04)/WR;if(h<9&&r>0.72)return 'beach';
  if(h>450)return 'peak';const sl=slopeAt(x,z);if(h>260||sl>0.8)return 'rock';const q=riverQ(x,z);if(q.r>=0&&q.d<q.w*0.5+80&&h-q.s<10)return 'bank';
  const m=moist(x,z)+jungleK(x,z)*0.35-savannaK(x,z)*0.5+(h>140?-0.05:0);return m>0.06?'forest':(m>-0.1?'edge':'meadow');}
const BCOL={water:'#5c6a52',beach:'#d8c48e',meadow:'#8db552',edge:'#6f9e44',forest:'#4a7a32',bank:'#7aa04c',rock:'#8a8478',peak:'#c6c2ba'};
/* ---------- mặt đất chia 8×8 khối, mỗi khối 3 mức chi tiết theo khoảng cách ---------- */
let TCN=8,TCS=WSEG/TCN;let TCOL=null,TNRM=null,TSPL=null,TCH=[];
function terrainColors(){const T=THREE,c=new T.Color(),c2=new T.Color();TCOL=new Float32Array(HN*HN*3);TNRM=new Float32Array(HN*HN*3);TSPL=new Float32Array(HN*HN*4);
  for(let j=0;j<HN;j++)for(let i=0;i<HN;i++){const k=j*HN+i,x=-WSIZE/2+i*HSTEP,z=-WOZ+j*HSTEP,h=HG[k];
    const hl=HG[j*HN+Math.max(0,i-1)],hr=HG[j*HN+Math.min(HN-1,i+1)],hu=HG[Math.max(0,j-1)*HN+i],hd=HG[Math.min(HN-1,j+1)*HN+i];let nx=hl-hr,ny=2*HSTEP,nz=hu-hd;const nl=Math.hypot(nx,ny,nz);TNRM[k*3]=nx/nl;TNRM[k*3+1]=ny/nl;TNRM[k*3+2]=nz/nl;
    const sl=Math.hypot(hr-hl,hd-hu)/(2*HSTEP);let b=BG?BCODE[bgAt(x,z)]:biome(x,z);const wet=WG[k]>-900&&WG[k]-h>0.3;if(wet)b='water';
    c.set(BCOL[b]);const v=NS.fbm(x/140+3,z/140-8,2);c.offsetHSL(v*0.02,v*0.06,v*0.05);
    if(b==='water'){c2.set('#6b6a4e');c.lerp(c2,Math.min(1,(WG[k]-h)/14));}
    if(b==='meadow'){const sv=savannaK(x,z);if(sv>0){c2.set('#a6a24e');c.lerp(c2,sv*0.4);}}
    if(sl>0.4&&!wet){const band=Math.sin(h*0.21+NS.fbm(x/60,z/60,2)*3)*0.5+0.5;c2.set(band>0.6?'#8a8070':band>0.3?'#6e665a':'#5a5248');c.lerp(c2,ss(0.4,0.85,sl)*0.95);if(sl>1.1){c2.set('#4e483f');c.lerp(c2,ss(1.1,2,sl)*0.35);}}
    if(h>430){c2.set('#f2f4f6');c.lerp(c2,ss(430,520,h)*(1-ss(0.9,1.5,sl)*0.7));}
    const tr=typeof trailAt==='function'?trailAt(x,z):0;if(tr>0&&!wet){c2.set(b==='beach'?'#c9b282':'#9a7a52');c.lerp(c2,tr*0.85);}
    const dn=NS.fbm(x/55+9,z/55-4,2);if(b==='meadow'||b==='edge'||b==='forest'){c2.set(dn>0.12?'#6b5a3a':'#a6b85a');c.lerp(c2,Math.max(0,Math.abs(dn)-0.12)*1.4);}
    TCOL[k*3]=c.r;TCOL[k*3+1]=c.g;TCOL[k*3+2]=c.b;TSPL.set(splatAt(k,x,z,h,b,sl,wet),k*4);}}
function terrainChunk(ci,cj,step){const T=THREE,n=TCS/step+1,pos=[],nor=[],col=[],idx=[],spl=[];const i0=ci*TCS,j0=cj*TCS;
  for(let b=0;b<n;b++)for(let a=0;a<n;a++){const i=Math.min(HN-1,i0+a*step),j=Math.min(HN-1,j0+b*step),k=j*HN+i;pos.push(-WSIZE/2+i*HSTEP,HG[k],-WOZ+j*HSTEP);nor.push(TNRM[k*3],TNRM[k*3+1],TNRM[k*3+2]);col.push(TCOL[k*3],TCOL[k*3+1],TCOL[k*3+2]);spl.push(TSPL[k*4],TSPL[k*4+1],TSPL[k*4+2],TSPL[k*4+3]);}
  for(let b=0;b<n-1;b++)for(let a=0;a<n-1;a++){const p=b*n+a;idx.push(p,p+n,p+1,p+1,p+n,p+n+1);}
  // váy che khe nứt giữa các mức chi tiết
  const edge=[];for(let a=0;a<n;a++)edge.push(a);for(let b=1;b<n;b++)edge.push(b*n+n-1);for(let a=n-2;a>=0;a--)edge.push((n-1)*n+a);for(let b=n-2;b>0;b--)edge.push(b*n);
  const base=pos.length/3;edge.forEach((v,m)=>{pos.push(pos[v*3],pos[v*3+1]-28,pos[v*3+2]);nor.push(0,1,0);col.push(col[v*3]*0.8,col[v*3+1]*0.8,col[v*3+2]*0.8);spl.push(spl[v*4],spl[v*4+1],spl[v*4+2],spl[v*4+3]);});
  for(let m=0;m<edge.length;m++){const a=edge[m],b2=edge[(m+1)%edge.length],sa=base+m,sb=base+(m+1)%edge.length;idx.push(a,sa,b2,b2,sa,sb);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setAttribute('splat',new T.Float32BufferAttribute(spl,4));g.setIndex(idx);g.computeBoundingSphere();return g;}
function terrainMesh(){const T=THREE;terrainColors();const m=new T.MeshStandardMaterial({vertexColors:true,roughness:0.96,metalness:0,side:T.DoubleSide});terrainSplatMat(m);
  const grp=new T.Group();TCH=[];for(let cj=0;cj<TCN;cj++)for(let ci=0;ci<TCN;ci++){const L=[1,2,4].map(st=>{const me=new T.Mesh(terrainChunk(ci,cj,st),m);me.receiveShadow=true;me.visible=st===4;grp.add(me);return me;});
    TCH.push({L,x:-WSIZE/2+(ci+0.5)*TCS*HSTEP,z:-WOZ+(cj+0.5)*TCS*HSTEP,cur:2});}grp.userData.mat=m;grp.material=m;return grp;}
function terrainLod(){if(!TCH.length)return;const cx=G.cam.position.x,cz=G.cam.position.z,S2=TCS*HSTEP,q=G.q|0;for(const c of TCH){const d=Math.hypot(c.x-cx,c.z-cz)/S2;const l=d<1.15+q*0.25?0:d<2.6+q*0.4?1:2;if(l!==c.cur){c.L[c.cur].visible=false;c.L[l].visible=true;c.cur=l;}}}
function waterMat(){const T=THREE,m=new T.MeshStandardMaterial({color:'#2e6f8f',roughness:0.12,metalness:0.15,transparent:true,opacity:0.78,depthWrite:false});
  m.onBeforeCompile=sh=>{sh.uniforms.time=K3.GU?K3.GU.time:{value:0};sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n  vWp=(modelMatrix*vec4(transformed,1.0)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float time;varying vec3 vWp;').replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
  {vec2 q=vWp.xz*0.012;float w1=sin(q.x*3.1+time*0.9)+sin(q.y*2.3-time*0.7)+sin((q.x+q.y)*4.7+time*1.3)*0.5;float w2=cos(q.x*2.7-time*0.8)+cos(q.y*3.3+time*0.6)+cos((q.x-q.y)*5.1-time*1.1)*0.5;
   vec3 nb=normalize(vec3(w1*0.06,1.0,w2*0.06));normal=normalize((viewMatrix*vec4(nb,0.0)).xyz);}`)
     .replace('#include <color_fragment>','#include <color_fragment>\n  diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.36,0.62,0.6),0.12);');};
  m.customProgramCacheKey=()=>'sbwater';return m;}
function waterMesh(){const T=THREE,g=new T.PlaneGeometry(WSIZE*2.5,WSIZE*2.5,1,1);g.rotateX(-Math.PI/2);const w=new T.Mesh(g,waterMat());w.position.y=0.5;w.renderOrder=2;
  // dải nước sông trên cao + thác
  const grp=new T.Group();grp.add(w);const rm=waterMat();rm.userData.noSea=1;
  for(const r of RIV){const P=r.pts,pos=[],idx=[];for(let i=0;i<P.length;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,hw=(r.w[0]+(r.w[1]-r.w[0])*i/P.length)*0.5+6,y=r.s[i]+0.4;
      pos.push(P[i][0]+dz/L*hw,y,P[i][1]-dx/L*hw,P[i][0]-dz/L*hw,y,P[i][1]+dx/L*hw);if(i>0&&r.s[i]>0.6&&r.s[i-1]-r.s[i]<16){const k=(i-1)*2;idx.push(k,k+1,k+2,k+1,k+3,k+2);}}
    if(!idx.length)continue;const g2=new T.BufferGeometry();g2.setAttribute('position',new T.Float32BufferAttribute(pos,3));g2.setIndex(idx);g2.computeVertexNormals();const me=new T.Mesh(g2,rm);me.renderOrder=2;grp.add(me);}
  G.falls=[];for(const f of WFALLS){let o=null;try{if(window.SBM&&SBM.waterfall)o=SBM.waterfall(f.top-f.bot+8);}catch(e){}
    if(!o){const fm=new T.MeshStandardMaterial({color:'#dff2ff',transparent:true,opacity:0.7,roughness:0.3,emissive:'#7aa6c0',emissiveIntensity:0.25,side:T.DoubleSide,depthWrite:false});const pl=new T.Mesh(new T.PlaneGeometry(1,1,1,6),fm);pl.scale.set(f.w,f.top-f.bot+8,1);pl.position.y=(f.top-f.bot+8)/2-4;o=new T.Group();o.add(pl);}
    o.position.set(f.x,f.bot-2,f.z);o.rotation.y=f.ry;o.traverse(m=>{if(m.isMesh)m.renderOrder=3;});grp.add(o);G.falls.push(Object.assign({o},f));}
  grp.material=w.material;w.material.userData.noSea=1;return grp;}
// ---------- tài nguyên: sinh theo vùng, có hạt giống ----------
const RES=[];let RGRID=new Map();const RG=140;
function rKey(x,z){return Math.floor(x/RG)+','+Math.floor(z/RG);}
function resGen(seed){RES.length=0;RGRID=new Map();const R=rng(seed*13+5);
  const okFree=(x,z,r)=>{for(const i of near(x,z,r+30)){const q=RES[i],d=Math.hypot(q.x-x,q.z-z);if(d<r+(RT[q.t].r||4)*0.8)return false;}return true;};
  const isTree=t=>/^(pine|oak|birch|dead|savannaTree)$/.test(t);const put=(t,x,z,s)=>{const q={i:RES.length,t,x,z,ry:R()*6.283,s:(s||(isTree(t)?0.62+R()*0.7:0.85+R()*0.35))*(RT[t].sc||1),hp:RT[t].hp,st:0,rg:0};RES.push(q);const k=rKey(x,z);if(!RGRID.has(k))RGRID.set(k,[]);RGRID.get(k).push(q.i);return q;};
  const scatter=(t,n,want,tries)=>{n=Math.round(n*2.6*WRES*(WV>=4?1.24:1));let c=0,k=0;while(c<n&&k<(tries||n*40)){k++;const a=R()*6.283,rr=Math.sqrt(R())*WR*0.95;let x=Math.cos(a)*rr,z=Math.sin(a)*rr;if(WV>=4&&R()<0.2){x=V5.box[0]+R()*V5.box[2];z=V5.box[1]+R()*V5.box[3];}const h=hAt(x,z);if(h<2||wdAt(x,z)>0)continue;
      const b=biome(x,z);const w=want(b,x,z,h);if(!w||R()>w)continue;if(decoBlock(x,z))continue;const sd=Math.hypot(x-SPAWN[0],z-SPAWN[1]);if(sd<60||(sd<230&&!RT[t].pass))continue;if(!RT[t].pass&&typeof trailAt==='function'&&trailAt(x,z)>0.15)continue;if(!okFree(x,z,(RT[t].r||4)+4))continue;put(t,x,z);c++;}};
  // gần chỗ bắt đầu: đủ đồ cho những bước đầu tiên
  const ring=(t,n,r0,r1)=>{let c=0,k=0;while(c<n&&k<400){k++;const a=R()*6.283,rr=r0+R()*(r1-r0),x=SPAWN[0]+Math.cos(a)*rr,z=SPAWN[1]+Math.sin(a)*rr;if(hAt(x,z)<3)continue;if(!okFree(x,z,(RT[t].r||4)+6))continue;put(t,x,z);c++;}};
  ring('stick',10,70,260);ring('pebble',8,80,260);ring('flax',7,90,300);ring('berry',3,200,320);ring('shrub',4,210,320);ring('birch',4,230,380);ring('pine',3,250,400);ring('oak',2,240,400);ring('rock',2,215,380);ring('young',3,215,320);
  scatter('pine',300,(b,x,z,h)=>b==='forest'?(h>18?1:0.7):b==='edge'?0.2:b==='rock'?0.15:0);
  scatter('oak',150,(b)=>b==='forest'?0.55:b==='edge'?0.45:b==='meadow'?0.06:0);
  scatter('birch',130,(b)=>b==='edge'?0.8:b==='meadow'?0.2:b==='forest'?0.3:0);
  scatter('dead',30,(b)=>b==='rock'?0.5:b==='meadow'?0.2:b==='edge'?0.2:0);
  scatter('young',90,(b)=>b==='edge'||b==='meadow'?0.6:b==='forest'?0.4:0);
  // rừng rậm: mảng cây mọc sát nhau, cây non dưới tán, cây cổ thụ rải rác
  const dense=(x,z)=>ss(0.02,0.25,NS.fbm(x/900+80,z/900-40,3))+jungleK(x,z)*0.5;
  scatter('pine',260,(b,x,z,h)=>b==='forest'&&h>30&&dense(x,z)>0.4?1:0,40000);scatter('oak',220,(b,x,z)=>(b==='forest'||b==='edge')&&dense(x,z)>0.4?1:0,40000);
  scatter('pineY',140,(b,x,z)=>b==='forest'?0.5+dense(x,z)*0.4:b==='edge'?0.25:0);scatter('birchY',90,(b)=>b==='edge'?0.6:b==='meadow'?0.15:0);scatter('young',90,(b,x,z)=>b==='forest'?dense(x,z):0);
  scatter('pineG',14,(b,x,z,h)=>b==='forest'&&h>40?0.6:0,20000);scatter('oakG',18,(b,x,z)=>(b==='forest'||b==='edge')&&dense(x,z)<0.5?0.5:0,20000);
  scatter('log',40,(b)=>b==='forest'?0.7:b==='edge'?0.3:0);
  scatter('berry',80,(b)=>b==='edge'?0.8:b==='forest'?0.35:b==='meadow'?0.25:0);
  scatter('shrub',130,(b)=>b==='beach'?0.1:b==='rock'?0.2:0.5);
  scatter('flax',130,(b)=>b==='meadow'?0.9:b==='edge'?0.4:b==='bank'?0.4:0);
  scatter('reeds',110,(b,x,z,h)=>b==='bank'&&h<9?1:b==='beach'?0.15:0);
  scatter('wildgrain',70,(b)=>b==='meadow'?0.8:b==='edge'?0.2:0);
  scatter('gourdwild',22,(b)=>b==='bank'?0.6:b==='meadow'?0.15:0);
  scatter('boulder',90,(b)=>b==='rock'?0.8:b==='peak'?0.5:b==='edge'?0.06:b==='meadow'?0.05:0);
  scatter('rock',130,(b)=>b==='rock'?0.7:b==='meadow'?0.12:b==='edge'?0.15:b==='forest'?0.1:b==='beach'?0.2:0);
  scatter('tinRock',14,(b,x,z,h)=>(b==='rock'||b==='peak')&&h>200?1:0,20000);
  scatter('flintRock',32,(b)=>b==='rock'?0.8:b==='peak'?0.3:0);
  scatter('copperRock',22,(b,x,z)=>(b==='rock'||b==='peak')&&(Math.hypot(x-0.45*WCR,z+0.33*WCR)<1300||z<-0.35*WCR)?1:0,9000);
  scatter('clay',34,(b,x,z,h)=>b==='bank'&&h<12?1:0,6000);
  scatter('mushroom',60,(b)=>b==='forest'?0.8:b==='edge'?0.2:0);
  scatter('mushroomR',30,(b)=>b==='forest'?0.6:0);
  scatter('pebble',150,(b)=>b==='beach'?0.6:b==='bank'?0.6:b==='rock'?0.3:0.3);
  scatter('stick',210,(b)=>b==='forest'?0.9:b==='edge'?0.7:b==='meadow'?0.25:0.1);
  scatter('bones',26,(b)=>b==='meadow'?0.3:b==='rock'?0.4:b==='beach'?0.3:0.05);
  // thảo dược, hoa dại, tổ ong
  ring('centella',3,140,320);ring('mint',2,160,360);ring('mugwort',2,180,380);
  scatter('mugwort',45,(b)=>b==='edge'?0.8:b==='meadow'?0.4:b==='bank'?0.3:0);
  scatter('ginger',30,(b)=>b==='forest'?0.6:b==='edge'?0.4:0);
  scatter('turmeric',26,(b)=>b==='edge'?0.6:b==='bank'?0.4:0);
  scatter('centella',50,(b)=>b==='bank'?0.9:b==='meadow'?0.3:b==='edge'?0.2:0);
  scatter('mint',34,(b)=>b==='bank'?0.8:b==='edge'?0.3:0);
  scatter('aloe',20,(b)=>b==='beach'?0.8:b==='rock'?0.3:b==='meadow'?0.05:0);
  scatter('flowerR',60,(b)=>b==='meadow'?0.9:b==='edge'?0.3:0);scatter('flowerY',60,(b)=>b==='meadow'?0.8:b==='edge'?0.4:0);
  scatter('flowerW',50,(b)=>b==='meadow'?0.8:b==='bank'?0.3:0);scatter('flowerP',50,(b)=>b==='edge'?0.6:b==='meadow'?0.5:0);
  scatter('beehive',14,(b)=>b==='forest'?0.6:b==='edge'?0.5:0,3000);
  // thực vật vùng nhiệt đới & đá cuội ven đường mòn
  const RG_=id=>REG.find(r=>r.id===id),around=(t,n,id,k)=>{const r=RG_(id);if(!r)return;let c=0,tr=0;while(c<n&&tr<n*30){tr++;const a=R()*6.283,d=Math.sqrt(R())*r.r*(k||1),x=r.x+Math.cos(a)*d,z=r.z+Math.sin(a)*d;if(hAt(x,z)<1.5||trailAt(x,z)>0.2||decoBlock(x,z))continue;if(!okFree(x,z,(RT[t].r||4)+3))continue;put(t,x,z);c++;}};
  around('savannaTree',40,'savanna',1);scatter('savannaTree',30,(b,x,z)=>b==='meadow'&&savannaK(x,z)>0.3?0.6:0);scatter('deadLog',50,(b)=>b==='forest'?0.6:b==='edge'?0.2:0);
  around('reedBed',30,'delta',1);around('reedBed',20,'lake',1.2);scatter('reedBed',60,(b)=>b==='bank'?0.5:0);scatter('scree',90,(b,x,z)=>slopeAt(x,z)>0.45&&slopeAt(x,z)<0.9?0.7:0,20000);
  around('bamboo',26,'bamboo',1);scatter('bamboo',40,(b,x,z,h)=>b==='bank'&&h>2?0.35:b==='edge'?0.05:0);
  scatter('banana',60,(b,x,z,h)=>b==='bank'&&h>2?0.6:b==='edge'?0.12:b==='forest'?0.05:0);
  around('palm',16,'beach',1.2);scatter('palm',30,(b)=>b==='beach'?0.5:0);
  scatter('fern',260,(b)=>b==='forest'?0.9:b==='edge'?0.25:b==='bank'?0.2:0);
  around('tallgrass',160,'savanna',1);scatter('tallgrass',160,(b)=>b==='meadow'?0.5:b==='edge'?0.15:b==='beach'?0.05:0);
  {const L=RG_('lake');if(L){let c=0,tr=0;while(c<26&&tr<2000){tr++;const a=R()*6.283,d=R()*L.r*1.1,x=L.x+Math.cos(a)*d,z=L.z+Math.sin(a)*d,h=hAt(x,z);if(h>-0.8||h<-8)continue;if(!okFree(x,z,14))continue;const q=put('lotus',x,z);q.wy=0.4;c++;}}}
  for(const t of TRAILS){for(let i=3;i<t.p.length;i+=7){const [x,z]=t.p[i];const ox=x+(R()-0.5)*26,oz=z+(R()-0.5)*26;if(hAt(ox,oz)<1||R()<0.45)continue;if(!okFree(ox,oz,6))continue;put('pathStone',ox,oz,0.7+R()*0.6);}}}
function near(x,z,r){const out=[];const i0=Math.floor((x-r)/RG),i1=Math.floor((x+r)/RG),j0=Math.floor((z-r)/RG),j1=Math.floor((z+r)/RG);
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const n=(i+4096)*8192+(j+4096);let ks=NEARK.get(n);if(ks===undefined){if(NEARK.size>60000)NEARK.clear();ks=i+','+j;NEARK.set(n,ks);}const L=RGRID.get(ks);if(L)for(let q=0;q<L.length;q++)out.push(L[q]);}return out;}
const NEARK=new Map();/* khoá ô lưới ghép một lần rồi nhớ: đỡ ghép chuỗi mỗi lần gọi */
// ---------- vẽ hàng loạt: biến một mô hình K3 thành các InstancedMesh (gộp theo vật liệu) ----------
function geoMerge(gs){const T=THREE;let n=0;const hasUV=gs.every(g=>g.attributes.uv),hasC=gs.some(g=>g.attributes.color);gs.forEach(g=>n+=g.attributes.position.count);
  const pos=new Float32Array(n*3),nor=new Float32Array(n*3),uv=hasUV?new Float32Array(n*2):null,col=hasC?new Float32Array(n*3):null;let o=0;
  gs.forEach(g=>{const c=g.attributes.position.count;pos.set(g.attributes.position.array,o*3);if(g.attributes.normal)nor.set(g.attributes.normal.array,o*3);if(uv)uv.set(g.attributes.uv.array,o*2);
    if(col){if(g.attributes.color)col.set(g.attributes.color.array,o*3);else col.fill(1,o*3,(o+c)*3);}o+=c;});
  const G=new T.BufferGeometry();G.setAttribute('position',new T.BufferAttribute(pos,3));G.setAttribute('normal',new T.BufferAttribute(nor,3));if(uv)G.setAttribute('uv',new T.BufferAttribute(uv,2));if(col)G.setAttribute('color',new T.BufferAttribute(col,3));
  G.computeBoundingSphere();return G;}
// skip: hàm(obj) → true thì bỏ qua (vd. ngọn lửa tách riêng)
function protoParts(group,skip){group.updateMatrixWorld(true);const by=new Map();
  group.traverse(o=>{if(skip&&skip(o))return;if(!o.isMesh||o.isInstancedMesh)return;let p=o.parent,bad=false;while(p){if(skip&&skip(p)){bad=true;break;}p=p.parent;}if(bad)return;
    const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();if(!g.attributes.normal)g.computeVertexNormals();g.applyMatrix4(o.matrixWorld);
    const m=Array.isArray(o.material)?o.material[0]:o.material;if(!by.has(m.uuid))by.set(m.uuid,{mat:m,gs:[]});by.get(m.uuid).gs.push(g);});
  return [...by.values()].map(b=>({mat:b.mat,geo:geoMerge(b.gs)}));}
// nhìn xuyên: phần tán cây / tường / mái nằm giữa camera và nhân vật được đục lỗ lấm tấm để luôn thấy người chơi
const OCCU={uPS:{value:null},uPD:{value:0},uOR:{value:0},uPY:{value:0}};const OCCM=new Map();
function occMat(m){if(!m||!m.isMeshStandardMaterial)return m;if(OCCM.has(m.uuid))return OCCM.get(m.uuid);if(!OCCU.uPS.value)OCCU.uPS.value=new THREE.Vector2(-1e4,-1e4);
  const c=m.clone();c.onBeforeCompile=m.onBeforeCompile;const prev=m.onBeforeCompile,pk=m.customProgramCacheKey?m.customProgramCacheKey.bind(m):()=>'';
  c.onBeforeCompile=(sh,r)=>{if(prev)prev.call(c,sh,r);Object.assign(sh.uniforms,OCCU);
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vOY;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n  {vec4 op=vec4(transformed,1.0);\n  #ifdef USE_INSTANCING\n  op=instanceMatrix*op;\n  #endif\n  vOY=(modelMatrix*op).y;}');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec2 uPS;uniform float uPD,uOR,uPY;varying float vOY;').replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
  if(uOR>0.0){float od=length(gl_FragCoord.xy-uPS);if(od<uOR&&vViewPosition.z<uPD-16.0&&vOY>uPY+9.0){float k=1.0-smoothstep(uOR*0.5,uOR,od);float th=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(0.06711056,0.00583715))));if(k*0.86>th)discard;}
  if(vViewPosition.z<uPD*0.5){float kn=1.0-smoothstep(uPD*0.22,uPD*0.5,vViewPosition.z);float tn=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(0.06711056,0.00583715))));if(kn*0.95>tn)discard;}}`);};
  c.customProgramCacheKey=()=>pk()+'|occ';c.userData=Object.assign({},m.userData);OCCM.set(m.uuid,c);return c;}
// cập nhật vị trí nhân vật trên màn hình cho hiệu ứng nhìn xuyên (gọi sau khi đặt camera)
function occTick(cam,R,px,py,pz,on){if(!OCCU.uPS.value)OCCU.uPS.value=new THREE.Vector2(-1e4,-1e4);if(!on){OCCU.uOR.value=0;return;}const T=THREE,sz=R.getDrawingBufferSize(occTick.v2||(occTick.v2=new T.Vector2())),a=occTick.a||(occTick.a=new T.Vector3()),b=occTick.b||(occTick.b=new T.Vector3());
  cam.updateMatrixWorld();a.set(px,py+18,pz).applyMatrix4(cam.matrixWorldInverse);OCCU.uPD.value=-a.z;a.set(px,py+18,pz).project(cam);b.set(px,py+40,pz).project(cam);
  OCCU.uPS.value.set((a.x*0.5+0.5)*sz.x,(a.y*0.5+0.5)*sz.y);OCCU.uOR.value=Math.min(sz.y*0.2,Math.max(40,Math.abs(b.y-a.y)*0.5*sz.y*3.4));OCCU.uPY.value=py;}
// một nhóm vẽ hàng loạt có thể thêm/bớt phần tử. set(i, x,y,z,ry,s) · hide(i)
function instGroup(parts,cap,opt){const T=THREE,opt_=opt||{},G=new T.Group();G.userData.cap=cap;G.matrixAutoUpdate=false;/* nhóm đứng yên ở gốc toạ độ (vị trí nằm trong từng phần tử): khỏi tính lại ma trận cho hàng chục nghìn nhóm mỗi khung hình */
  const sp=opt_.sphere;const ims=parts.map(p=>{let geo=p.geo;if(sp){geo=new T.BufferGeometry();for(const k in p.geo.attributes)geo.setAttribute(k,p.geo.attributes[k]);if(p.geo.index)geo.setIndex(p.geo.index);geo.boundingSphere=new T.Sphere(new T.Vector3(sp.x,sp.y,sp.z),sp.r);geo.boundingBox=null;}
    const im=new T.InstancedMesh(geo,p.mat,cap);im.count=cap;im.castShadow=opt_.shadow!==false;im.receiveShadow=true;im.frustumCulled=!!sp;im.matrixAutoUpdate=false;const Z=new T.Matrix4().makeScale(0,0,0);for(let i=0;i<cap;i++)im.setMatrixAt(i,Z);G.add(im);return im;});
  const M=new T.Matrix4(),Q=new T.Quaternion(),V=new T.Vector3(),SC=new T.Vector3(),UP=new T.Vector3(0,1,0);
  const on=new Uint8Array(cap),mark=(i,v)=>{if(on[i]!==v){on[i]=v;api.nOn+=v?1:-1;}};const api={G,ims,cap,nOn:0,set(i,x,y,z,ry,s,tilt){Q.setFromAxisAngle(UP,ry||0);if(tilt)Q.multiply(tilt);V.set(x,y,z);SC.setScalar(s==null?1:s);M.compose(V,Q,SC);for(const im of ims)im.setMatrixAt(i,M);mark(i,(s==null?1:s)>0?1:0);api.dirty=1;},
    setM(i,m){for(const im of ims)im.setMatrixAt(i,m);mark(i,1);api.dirty=1;},hide(i){M.makeScale(0,0,0);for(const im of ims)im.setMatrixAt(i,M);mark(i,0);api.dirty=1;},
    flush(){if(!api.dirty)return;for(const im of ims)im.instanceMatrix.needsUpdate=true;api.dirty=0;},
    dispose(){ims.forEach(im=>{if(im.parent)im.parent.remove(im);im.dispose&&im.dispose();});}};return api;}
