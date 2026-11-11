/* ===================== THẾ GIỚI 4: HÌNH CHỮ S =====================
   Miền Bắc = toàn bộ thế giới 3 (giữ nguyên toạ độ, cùng hạt giống thì cùng địa hình). Nối thêm về phía nam:
     · Dải miền Trung: dải đất hẹp cong về phía đông, sườn tây là dãy Trường Sơn, sườn đông là đồng bằng cát ven biển.
     · Miền Nam: châu thổ thấp phẳng (Đồng Bằng Chín Rồng), rừng U Minh ngập mặn ở mũi tây nam, rừng Nam Cát Tiên phía đông bắc.
   Khung lưới kéo về nam (WOZ) và rộng hơn; mọi thứ chỉ chạy khi WV>=4, thế giới 2-3 không đổi.
   GÁN LẠI (bọc): worldCfg, baseH, riversPlan, regionsBuild, trails4, fixSave, newGame. Hàm dùng chung: wIn (trong ranh giới chơi), v5R (khoảng cách chuẩn hoá tới bờ). */
const V5={box:[-3300,5200,10300,5400],// [x0,z0,rộng,dài] hộp bao phần đất mới (để rải tài nguyên, thú)
  waist:[[2600,5400],[4700,6200],[5600,7400],[4900,8600],[3000,9300]],hw:1000,
  S:{x:300,z:9350,rx:3300,rz:1150},baseN:W4ZONES.length,
  zones:[{id:'meadow4',x:500,z:9300,rx:1700,rz:780},{id:'mangrove',x:-1900,z:9500,rx:1000,rz:650},{id:'ancient',x:3300,z:9050,rx:850,rz:650}]};
// khoảng cách tới đường gấp khúc + bên trái/phải (dương = phía tây của hướng bắc→nam)
function v5Waist(x,z){const P=V5.waist;let bd=1e9,side=0,bt=0;for(let i=0;i<P.length-1;i++){const [ax,az]=P[i],[bx,bz]=P[i+1],dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz;let t=((x-ax)*dx+(z-az)*dz)/l2;t=t<0?0:t>1?1:t;
    const px=ax+dx*t,pz=az+dz*t,d=Math.hypot(x-px,z-pz);if(d<bd){bd=d;side=((x-px)*dz-(z-pz)*dx)>0?-1:1;bt=(i+t)/(P.length-1);}}_v5w.d=bd;_v5w.s=side;_v5w.t=bt;return _v5w;}
const _v5w={d:0,s:0,t:0};
// u: 1 ở mép bờ biển của phần đất mới (nhỏ hơn = trong đất liền)
function v5U(x,z){if(z<4200)return 9;const w=v5Waist(x,z),S=V5.S,uw=w.d/V5.hw,us=Math.hypot((x-S.x)/S.rx,(z-S.z)/S.rz);return Math.min(uw,us)+NS.fbm(x/1500+17,z/1500-9,3)*0.13+NS.fbm(x/420,z/420+4,2)*0.04;}
// thay cho "r = khoảng cách tới tâm / WR" ở những chỗ cần biết gần bờ hay không
function v5R(x,z){const r=Math.hypot(x,z*1.04)/WR;return z<4200?r:Math.min(r,v5U(x,z)*0.8);}
function wIn(x,z,k){k=k||1;if(Math.hypot(x,z)<WR*k)return true;if(WV<4||z<4200)return false;return Math.abs(x)<WSIZE/2-200&&z<WSIZE-WOZ-200&&v5U(x,z)<1.3*k;}
{const _wc=worldCfg;worldCfg=function(v){W4ZONES.length=V5.baseN;if(!(v>=4))return _wc(v);_wc(3);WV=4;WSEG=640;TCN=10;WSIZE=18560;WOZ=7800;HN=WSEG+1;HSTEP=WSIZE/WSEG;TCS=WSEG/TCN;
  V5.zones.forEach((Z,i)=>{Z.i=V5.baseN+i;Z.sd=Z.i*7.3+1.7;W4ZONES.push(Z);});};}
// độ cao phần đất mới
function v5H(x,z){const u=v5U(x,z);if(u>1.35)return -60;const w=v5Waist(x,z),S=V5.S,us=Math.hypot((x-S.x)/S.rx,(z-S.z)/S.rz),inS=1-ss(0.75,1.05,us);let k;
  let h=20+NS.fbm(x/1100+31,z/1100-12,4)*24+NS.fbm(x/380-5,z/380+9,3)*9+NS.fbm(x/120,z/120,2)*2.5;
  // dãy Trường Sơn: sườn tây của dải miền Trung, cao dần về giữa dải
  {const west=w.s>0?1:0,along=ss(0.02,0.2,w.t)*(1-ss(0.82,1,w.t)),rd=w.d/V5.hw,band=west*ss(0.12,0.5,rd)*(1-ss(0.78,1.0,rd));h+=band*along*(150+NS.ridge(x/700+3,z/700-8,4)*260)*(1-inS);
    // sườn đông: đồng bằng cát thấp
    const east=(1-west)*ss(0.15,0.6,rd)*(1-inS);h=h*(1-east*0.75)+(7+NS.fbm(x/500,z/500,2)*6)*east*0.75;}
  // châu thổ phía nam: thấp, phẳng
  h=h*(1-inS*0.9)+(7+NS.fbm(x/900+2,z/900-6,3)*6+NS.fbm(x/200,z/200,2)*1.2)*inS*0.9;
  const Z=V5.zones;
  if((k=z4k(Z[0],x,z))>0){const t=12+NS.fbm(x/900-6,z/900+6,3)*7;h=h*(1-k*0.85)+t*k*0.85;}
  if((k=z4k(Z[1],x,z))>0){const c=NS.ridge(x/650+2,z/650-6,3),t=2.6+NS.fbm(x/240,z/240,3)*4.5+NS.fbm(x/60,z/60,2)*0.9-ss(0.6,0.82,c)*6.5;h=h*(1-k)+t*k;}/* cao hơn rừng ngập mặn phía bắc một chút: nhiều cồn đất giữa kênh rạch */
  if((k=z4k(Z[2],x,z))>0){const t=22+NS.fbm(x/500+4,z/500,3)*16;h=h*(1-k*0.75)+t*k*0.75;}
  const land=1-ss(1,1.12,u);return h*land-(1-land)*60;}
{const _bh=baseH;baseH=function(x,z){const h=_bh(x,z);if(WV<4||z<4200)return h;return Math.max(h,v5H(x,z));};}
// sông miền Trung và sông châu thổ
{const _rp=riversPlan;riversPlan=function(seed){_rp(seed);if(WV<4)return;const R=rng((seed||1)*17+4441);
  const add=(id,n,wp,w,dep,jit)=>{const pts=w4RiverPts(wp,R,jit);RIV.push({id,n,wp,w,dep,sea:1,pts,s:null});};
  add('cuulong','Sông Chín Rồng',[[4850,7900],[4100,8650],[2700,9150],[1300,9300],[-100,9600],[-1200,10050],[-1750,10700]],[14,64],7,140);
  add('thubon','Sông Thu',[[5000,6950],[5900,7050],[6700,7180],[7400,7280]],[10,26],4,70);
  RBK=new Map();const C=400;RIV.forEach((r,ri)=>{for(let k=0;k<r.pts.length-1;k++){const [ax,az]=r.pts[k],[bx,bz]=r.pts[k+1],m=200;for(let i=Math.floor((Math.min(ax,bx)-m)/C);i<=Math.floor((Math.max(ax,bx)+m)/C);i++)for(let j=Math.floor((Math.min(az,bz)-m)/C);j<=Math.floor((Math.max(az,bz)+m)/C);j++){const key=i+','+j;if(!RBK.has(key))RBK.set(key,[]);RBK.get(key).push(ri,k);}}});};}
// vùng có tên của phần đất mới
const V5REG=[['deongang','Đèo Ngang','Cửa ngõ từ đất Bắc vào miền Trung: lối mòn men sườn núi, một bên rừng, một bên biển.','🚩',[2750,5550],450],
  ['truongson','Dải Trường Sơn','Dãy núi dài chạy dọc miền Trung. Rừng già phủ kín sườn tây, từ đỉnh nhìn xuống dải đồng bằng hẹp ven biển.','⛰️',[4800,7250],650],
  ['mientrung','Dải Cát Miền Trung','Dải đất hẹp kẹp giữa núi và biển: cồn cát trắng, đầm phá, gió khô nóng. Cá và muối nhiều, đất trồng ít.','🏖️',[6150,7350],520],
  ['cattien','Rừng Nam Cát Tiên','Rừng già ẩm thấp nơi cửa ngõ phương Nam: gỗ quý, thuốc, và rất nhiều thú lớn.','🌳',[3500,8850],700],
  ['cuulong','Đồng Bằng Chín Rồng','Châu thổ mênh mông, sông chia nhánh đổ ra biển. Đất phù sa trồng gì cũng tốt: vựa lúa của cả phương Nam.','🌾',[500,9300],1100],
  ['uminh','Rừng U Minh','Rừng ngập nước mặn mũi tây nam: kênh rạch chằng chịt, đước, tràm, mật ong rừng, cá sấu.','🪷',[-1900,9500],800],
  ['camau','Mũi Đất Cuối Trời','Chỗ đất liền vươn xa nhất về phương Nam. Đứng ở đây thấy mặt trời mọc lên và lặn xuống cùng một mặt biển.','🧭',[-2150,9480],420]];
{const _rb=regionsBuild;regionsBuild=function(){const r=_rb.apply(this,arguments);if(WV>=4)for(const [id,n,d,ic,p,rr] of V5REG)if(!REG.some(q=>q.id===id))REG.push({id,n,d,ic,x:p[0],z:p[1],r:rr});return r;};}
{const _t4=trails4;trails4=function(){const a=_t4();return WV>=4?a.concat([['ancient','deongang'],['deongang','truongson'],['truongson','mientrung'],['truongson','cattien'],['cattien','cuulong'],['cuulong','uminh'],['uminh','camau']]):a;};}
// bản lưu và ván mới
{const _fs=fixSave;fixSave=function(o){if(o&&o.wv===4){o.wv=3;const r=_fs(o);if(r){r.wv=4;try{worldCfg(4);}catch(e){}}return r;}return _fs(o);};}
// nhân vật mới mặc định vào bản đồ hình chữ S (ở thế giới chung thì theo bản đồ của máy chủ đã chọn, xem mp.js). Thêm ?vn=0 vào địa chỉ để tạo trên bản đồ cũ.
function v5Want(){try{return localStorage.getItem('ldtt-wv4')!=='0';}catch(e){return true;}}
{const _ng=newGame;newGame=function(o){const r=_ng(o);if(S&&v5Want()){S.wv=4;worldCfg(4);S._new=1;save();delete S._new;}return r;};}
try{if(/[?&]vn=1/.test(location.search))localStorage.removeItem('ldtt-wv4');else if(/[?&]vn=0/.test(location.search))localStorage.setItem('ldtt-wv4','0');}catch(e){}
