/* ===================== dailuc: ĐẠI LỤC LIỀN, DỰNG THEO MẢNH (đợt 1: lõi địa hình) =====================
   Thế giới hiện tại dựng cả bản đồ một lần (mỗi chiều chưa tới 1 km) rồi giữ hết trong bộ nhớ. Đại lục mới rộng 6 km × 6 km (gấp ~40 lần diện tích),
   không cổng, không màn hình tải: máy chỉ tính phần đất quanh người chơi.
   Tệp này là phần LÕI, chưa nối vào game:
     · dlBase(x,z)   độ cao tại một điểm bất kỳ, tính thẳng từ hạt giống (không cần dựng trước cả bản đồ): bờ biển, đồng bằng, đồi, dãy núi có vách tầng,
                     thung lũng sông khoét xuống tới mực nước, hồ.
     · dlTile(tx,tz) một MẢNH 64×64 ô (1920 đơn vị mỗi chiều): mảng độ cao + mực nước, tính khi cần, nhớ tối đa DL.cap mảnh gần đây nhất.
     · dlH / dlW     độ cao / mực nước tại điểm, lấy từ mảnh (nội suy như hAt cũ nên mặt đất liền nhau qua mép mảnh).
   Các đợt sau: lưới mặt đất theo mảnh, cây đá theo mảnh, thú - làng theo mảnh, bản đồ, nhiều người chơi. */
const DL={seed:1,R:60000,HS:30,TN:64,cap:320,tiles:new Map(),tick:0,made:0};
DL.TS=DL.HS*DL.TN;
/* nhiễu giá trị có đạo hàm mượt, tự chứa (không phụ thuộc bộ nhiễu của thế giới cũ) */
function dlHash(ix,iz,s){let h=(Math.imul(ix,374761393)^Math.imul(iz,668265263)^Math.imul(s,2147483647))|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296;}
function dlN(x,z,s){const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz,u=fx*fx*fx*(fx*(fx*6-15)+10),v=fz*fz*fz*(fz*(fz*6-15)+10);
  const a=dlHash(ix,iz,s),b=dlHash(ix+1,iz,s),c=dlHash(ix,iz+1,s),d=dlHash(ix+1,iz+1,s);return (a+(b-a)*u+(c-a+(d-c-b+a)*u)*v)*2-1;}
function dlFbm(x,z,o,s){let v=0,a=0.5,f=1,t=0;for(let i=0;i<o;i++){v+=dlN(x*f,z*f,s+i*17)*a;t+=a;a*=0.5;f*=2.03;}return v/t;}
function dlRidge(x,z,o,s){let v=0,a=0.5,f=1,t=0;for(let i=0;i<o;i++){const n=1-Math.abs(dlN(x*f,z*f,s+i*29));v+=n*n*a;t+=a;a*=0.5;f*=2.1;}return v/t;}
const dlSS=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
/* ---------- CÁC MIỀN CỦA ĐẠI LỤC ----------
   Đại lục không còn một kiểu từ đầu tới cuối: nhiệt độ giảm dần lên phía bắc (z âm), độ ẩm đổi theo mảng lớn → năm miền, chuyển tiếp mềm:
     bac  Miền lạnh phương Bắc : núi đồi cao hơn, rừng thông – bạch dương, không có chuối, cọ, tre.
     nd   Rừng nhiệt đới       : núi đá vôi dựng đứng từng cụm, rừng cổ thụ, chuối, cọ, tre, sen.
     sv   Thảo nguyên khô      : đất phẳng, đồi bàn đỉnh bằng rải rác, cỏ cao, cây thảo nguyên, lô hội.
     tre  Đồi tre trúc         : đồi lượn sóng, tre mọc thành rừng.
     hoa  Đồng cỏ hoa          : đồng cỏ thoáng nhiều hoa, lúa dại, bạch dương, tổ ong.
   Ngoài các miền đó là miền ôn hoà (rừng hỗn hợp như trước). DLC: [bac, nd, sv, tre, hoa] trọng số 0..1 tại điểm vừa hỏi. */
const DLC=[0,0,0,0,0],DLZ=[['bac','❄️','Miền lạnh phương Bắc'],['nd','🌴','Rừng nhiệt đới'],['sv','🌾','Thảo nguyên khô'],['tre','🎋','Đồi tre trúc'],['hoa','🌼','Đồng cỏ hoa']];
function dlClimTW(x,z){const s=DL.seed;return [Math.max(-1,Math.min(1,z/(DL.R*0.7)))*0.8+dlFbm(x/16000+5,z/16000-3,2,s+601)*0.45,dlFbm(x/13000-8,z/13000+12,3,s+607)*1.3];}
function dlClimW(T,W){const b=dlSS(-0.36,-0.56,T),hot=dlSS(0.18,0.38,T),mid=(1-b)*(1-hot);DLC[0]=b;DLC[1]=hot*dlSS(0.02,0.2,W);DLC[2]=hot*dlSS(-0.02,-0.2,W);DLC[3]=mid*dlSS(0.2,0.36,W);DLC[4]=mid*dlSS(-0.16,-0.32,W);return DLC;}
function dlClim(x,z){const tw=dlClimTW(x,z);return dlClimW(tw[0],tw[1]);}
function dlZoneAt(x,z){const c=dlClim(x,z);let bi=-1,bv=0.5;for(let i=0;i<5;i++)if(c[i]>bv){bv=c[i];bi=i;}return bi<0?{id:'on',ic:'🌳',n:'Miền ôn hoà'}:{id:DLZ[bi][0],ic:DLZ[bi][1],n:DLZ[bi][2]};}
function dlBase(x,z){const s=DL.seed,R=DL.R;
  /* lục địa: lớn dần từ tâm, mép vỡ thành vịnh, bán đảo, đảo ven bờ */
  const r=Math.hypot(x,z)/R,cont=1-dlSS(0.62,1.0,r+dlFbm(x/9000+3,z/9000-7,4,s+1)*0.33);
  if(cont<=0.02)return -40-20*(1-cont);
  /* nền: đồng bằng nhấp nhô + đồi */
  const cl=dlClim(x,z),wB=cl[0],wN=cl[1],wS=cl[2],wT=cl[3];
  let h=14+dlFbm(x/2600,z/2600,4,s+11)*26*(1-0.5*wS)+dlFbm(x/700+5,z/700+9,3,s+23)*10*(1-0.45*wS)+dlFbm(x/170,z/170,2,s+31)*2.5;
  const hill=dlSS(0.05,0.5,dlFbm(x/4200+13,z/4200-4,3,s+41));h+=hill*(40+dlFbm(x/900,z/900,3,s+43)*45)*(1+0.4*wB-0.7*wS);
  /* đồi tre: đồi lượn sóng */if(wT>0.03)h+=wT*(6+dlFbm(x/520+7,z/520-3,2,s+97)*22);
  /* thảo nguyên: đồi bàn đỉnh bằng rải rác */if(wS>0.03){const ms=dlSS(0.3,0.38,dlFbm(x/1500+17,z/1500+5,3,s+101));if(ms>0)h+=wS*ms*(55+dlFbm(x/300,z/300,2,s+103)*8);}
  /* nhiệt đới: núi đá vôi dựng đứng từng cụm */if(wN>0.03){const km=dlSS(0.05,0.3,dlFbm(x/3400-11,z/3400+7,2,s+107));if(km>0){const tk=dlSS(0.15,0.235,dlFbm(x/380+1,z/380+2,2,s+109));if(tk>0)h+=wN*km*tk*(120+dlFbm(x/130,z/130,2,s+113)*45);/* chóp đá nhỏ đứng lẻ quanh các khối lớn */const t2=dlSS(0.3,0.36,dlFbm(x/170+9,z/170-4,2,s+117));if(t2>0)h+=wN*km*(1-tk)*t2*(60+dlFbm(x/90,z/90,2,s+119)*30);}}
  /* dãy núi: vài vành đai lớn; trong vành đai là sống núi sắc */
  const belt=dlSS(0.18,0.5,dlFbm(x/7500-21,z/7500+15,3,s+53));if(belt>0){const rg=dlRidge(x/2300+2,z/2300-5,5,s+59);h+=belt*(90+rg*rg*1250)*(1+0.3*wB);}
  /* vách tầng từ độ cao 230 (cùng công thức với nuicao.js) */
  if(h>230){const n=dlFbm(x/900+31,z/900-17,2,s+67)*60,st=150,q=(h+n)/st,f=q-Math.floor(q),sv=(Math.floor(q)+dlSS(0.3,0.7,f))*st-n,k=dlSS(230,520,h)*0.6;h=h*(1-k)+sv*k;}
  /* sông: đường số không của một lớp nhiễu lớn, khoét thung lũng xuống dưới mực nước; càng lên núi lòng sông càng hẹp rồi tắt */
  const rv=Math.abs(dlFbm(x/5200+40,z/5200+60,3,s+71)),wd=0.012+0.01*dlFbm(x/1500,z/1500,2,s+73),rk=1-dlSS(wd,wd*3.2,rv),high=1-dlSS(260,520,h);
  if(rk>0&&high>0){const bed=-7-3*dlN(x/300,z/300,s+79),val=Math.min(h,26);h=h*(1-rk*high)+((rk>0.6?bed:val*(1-rk)+bed*rk))*rk*high;}
  /* hồ: vài vùng trũng lớn ở đồng bằng */
  const lk=dlFbm(x/3100-9,z/3100+33,3,s+83);if(lk<-0.36&&h<60){const k=dlSS(-0.36,-0.5,lk);h=h*(1-k)+(-9)*k;}
  /* ra tới mép lục địa thì dốc xuống biển, có bãi */
  if(cont<0.3){const k=dlSS(0.3,0.02,cont);h=h*(1-k)+(-30)*k;}
  return h;}
/* ---------- mảnh ---------- */
function dlTile(tx,tz){const key=tx+','+tz;let t=DL.tiles.get(key);if(t){t.u=++DL.tick;return t;}const N=DL.TN+1,H=new Float32Array(N*N),x0=tx*DL.TS,z0=tz*DL.TS,hs=DL.HS;let lo=1e9,hi=-1e9,wet=0;
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const h=dlBase(x0+i*hs,z0+j*hs);H[j*N+i]=h;if(h<lo)lo=h;if(h>hi)hi=h;if(h<0)wet++;}
  t={tx,tz,H,lo,hi,wet:wet/(N*N),u:++DL.tick};DL.tiles.set(key,t);DL.made++;
  if(DL.tiles.size>DL.cap){let ok=null,ou=1e18;for(const [k,v] of DL.tiles)if(v.u<ou&&!v.pin){ou=v.u;ok=k;}if(ok)DL.tiles.delete(ok);}return t;}
function dlH(x,z){const TS=DL.TS,tx=Math.floor(x/TS),tz=Math.floor(z/TS),t=dlTile(tx,tz),N=DL.TN+1,fx=(x-tx*TS)/DL.HS,fz=(z-tz*TS)/DL.HS;let i=Math.floor(fx),j=Math.floor(fz);if(i>=DL.TN)i=DL.TN-1;if(j>=DL.TN)j=DL.TN-1;const u=fx-i,v=fz-j,H=t.H,a=H[j*N+i],b=H[j*N+i+1],c=H[(j+1)*N+i],d=H[(j+1)*N+i+1];return a+(b-a)*u+((c+(d-c)*u)-(a+(b-a)*u))*v;}
/* mực nước: biển, sông, hồ đều ở mực 0 (sông là thung lũng khoét xuống dưới 0) */
function dlW(x,z){return dlH(x,z)<0?0:-999;}
/* chỉ xoá các mảnh đã tính khi ĐỔI hạt giống hoặc đổi cỡ mảnh: trước cứ mỗi lần dựng lại vùng (sang tỉnh) là xoá sạch, phải tính lại cả những mảnh vừa dùng */
function dlInit(seed){const s=(seed|0)||1,k=s+':'+DL.HS+':'+DL.TN;if(DL.ik===k)return;DL.ik=k;DL.seed=s;DL.tiles.clear();DL.tick=0;DL.made=0;}
if(typeof module!=='undefined')module.exports={DL,dlBase,dlTile,dlH,dlW,dlInit,dlClim,dlZoneAt};
/* ===================== đợt 2: NỐI VÀO GAME (thử nghiệm) =====================
   Nhân vật "đại lục" (S.dl) dùng mặt đất của đại lục thay cho bản đồ cũ. Bật thử bằng cách đặt localStorage 'ld-dl'='1' trước khi tạo nhân vật.
   Toạ độ trong game là toạ độ quanh "điểm neo" (S.dl.ox, S.dl.oz) của nhân vật trên đại lục, để mọi phần khác của game vẫn chạy như cũ.
   Ở đợt này: mặt đất, biển, sông hồ lấy từ đại lục; sông kiểu cũ, đường mòn, cột đá, các vùng có tên của bản đồ cũ được bỏ qua. */
if(typeof window!=='undefined'&&typeof baseH==='function'){
  DL.on=false;DL.ox=0;DL.oz=0;
  /* bật / tắt chế độ thử: mở trang với ?dailuc=1 (hoặc ?dailuc=0) rồi tạo nhân vật MỚI kiểu chơi một mình */
  try{const q=/[?&]dailuc=([01])/.exec(location.search||'');if(q){if(q[1]==='1')localStorage.setItem('ld-dl','1');else localStorage.removeItem('ld-dl');}}catch(e){}
  /* ĐẠI LỤC CHIA THÀNH CÁC TỈNH CỐ ĐỊNH (lưới 6 mảnh ≈ 390 m): ai đứng trong tỉnh nào cũng dùng cùng một tâm, cùng hạt giống → thấy đúng một thế giới như nhau
     (cây đá, thú, làng). Đó là điều kiện để chơi chung. Mã tỉnh (vd 'qij') dùng làm mã vùng đất: lãnh thổ, công trình chia sẻ, vùng chung của liên minh tách theo tỉnh. */
  const dlA=()=>DL.TS*6;
  const DL_POPCAP=12;
  function dlKey(ox,oz){const A=dlA();return 'q'+(Math.round(ox/A)+18).toString(36)+(Math.round(oz/A)+18).toString(36);}
  /* 8 tỉnh kề bên tỉnh đang đứng: mã tỉnh, hạt giống, độ dời toạ độ (để thấy lãnh thổ, công trình, người chơi ở tỉnh bên) */
  function dlNb(){const k=S&&S.land;if(DL.nb&&DL.nbK===k)return DL.nb;const A=dlA(),o={key:{},seed:{}};if(S&&S.dl)for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){if(!i&&!j)continue;const ox=S.dl.ox+i*A,oz=S.dl.oz+j*A,e={dx:i*A,dz:j*A,key:dlKey(ox,oz),seed:dlSeedAt(ox,oz)};o.key[e.key]=e;o.seed[e.seed]=e;}DL.nb=o;DL.nbK=k;return o;}
  function dlAnchor(seed,pick){dlInit(seed);const A=dlA(),L=[];for(let ix=-8;ix<=8;ix++)for(let iz=-8;iz<=8;iz++){const ox=ix*A,oz=iz*A;if(Math.hypot(ox,oz)>DL.R*0.55)continue;const h=dlBase(ox,oz);if(h<8||h>70)continue;let land=0,wat=0,hi=0,n=0;for(let i=0;i<48;i++){const b=i*0.131*6.283,d=600+(i%6)*1000,hh=dlBase(ox+Math.cos(b)*d,oz+Math.sin(b)*d);n++;if(hh<0)wat++;else{land++;if(hh>230)hi++;}}
      const sc=land/n*3+Math.min(0.2,wat/n)*4-hi/n*2-Math.abs(h-25)/60;L.push({ox,oz,sc});}L.sort((a,b)=>b.sc-a.sc);if(pick==='all')return L;if(!L.length)return {ox:0,oz:0};/* chơi chung: rải người vào 16 tỉnh tốt nhất theo mã người chơi, khỏi dồn một chỗ */const top=L.slice(0,40);return pick!=null?top[Math.floor(dlHash(pick,5,seed)*top.length)%top.length]:top[0];}
  /* tên tỉnh cho người đọc: cột chữ cái (tây → đông), hàng số (bắc → nam); tỉnh giữa đại lục là J10 */
  function dlProvName(ox,oz){const A=DL.TS*6;return String.fromCharCode(74+Math.round(ox/A))+(Math.round(oz/A)+10);}
  {const _wc=worldCfg;worldCfg=function(v){DL.bgN=(DL.bgN|0)+1;DL.on=!!(typeof S==='object'&&S&&S.dl);if(!DL.on)return _wc.apply(this,arguments);const r=_wc.call(this,3);DL.HS=HSTEP;DL.TN=48;DL.TS=DL.HS*DL.TN;dlInit(S.seed0||S.seed);DL.ox=S.dl.ox;DL.oz=S.dl.oz;
      /* tỉnh đang đứng là "vùng đất hiện tại": bảng trạng thái, bản đồ, lãnh thổ ghi tên tỉnh thay cho "Đất Trung Tâm" */try{if(typeof LANDS!=='undefined'&&S.land&&/^q/.test(S.land)){const nm='Tỉnh '+dlProvName(DL.ox,DL.oz);let L=LANDS.find(x=>x.id===S.land);if(!L){L={id:S.land,lv:0,need:1,home:1,prov:1};LANDS.push(L);}L.n=nm;L.ic='🌏';L.d='Một tỉnh của đại lục. Đi sang địa phận tỉnh bên là game nạp tỉnh đó, không cần cổng.';}}catch(e){}return r;};}
  {const _bh=baseH;baseH=function(x,z){return DL.on?dlBase(x+DL.ox,z+DL.oz):_bh(x,z);};}
  {const _rp=riversPlan;riversPlan=function(seed){if(!DL.on)return _rp.apply(this,arguments);RIV=[];RBK=null;WFALLS=[];SPAWN=dlSpawnOf(DL.ox,DL.oz);
      /* SUỐI NÚI: từ vài điểm cao nhất của tỉnh, cho nước chảy theo chiều dốc nhất xuống tới sông hồ, biển. Lòng suối được khoét bằng bộ sông sẵn có của game;
         chỗ suối đổ qua vách tầng thành THÁC (bộ vẽ thác, bụi nước sẵn có). Tính từ hạt giống nên ai trong tỉnh cũng thấy cùng dòng suối. */
      /* SUỐI LIỀN QUA RANH GIỚI: nguồn suối lấy theo Ô LƯỚI CỐ ĐỊNH 3900 đơn vị của đại lục (điểm cao nhất mỗi ô, trên 120), dòng chảy lần theo dốc bằng hàm địa hình của cả đại lục
         → cùng một dòng suối dù đứng ở tỉnh nào. Tính cả các nguồn nằm ngoài vùng nạp hai ô (suối từ tỉnh bên chảy sang), rồi cắt lấy đoạn nằm trong vùng nạp. */
      try{const Gc=3900,s0=DL.seed|0,Hh=WSIZE/2-160,ext=Gc*2,ci0=Math.floor((DL.ox-WSIZE/2-ext)/Gc)-1,ci1=Math.floor((DL.ox+WSIZE/2+ext)/Gc)+1,cj0=Math.floor((DL.oz-WSIZE/2-ext)/Gc)-1,cj1=Math.floor((DL.oz+WSIZE/2+ext)/Gc)+1,cand=new Map();
        for(let ci=ci0;ci<=ci1;ci++)for(let cj=cj0;cj<=cj1;cj++){let bh=-1e9,bx=0,bz=0;for(let a=0;a<6;a++)for(let b=0;b<6;b++){const gx=(ci+(a+0.5)/6)*Gc,gz=(cj+(b+0.5)/6)*Gc,h=dlBase(gx,gz);if(h>bh){bh=h;bx=gx;bz=gz;}}if(bh>120&&dlHash(ci,cj,s0+881)<0.8)cand.set(ci+','+cj,[bh,bx,bz,ci,cj]);}
        const srcs=[];for(const c of cand.values()){if(c[3]<=ci0||c[3]>=ci1||c[4]<=cj0||c[4]>=cj1)continue;/* nhường cho nguồn cao hơn ở ô kề nếu quá gần */let ok=true;for(let a=-1;a<=1&&ok;a++)for(let b=-1;b<=1;b++){if(!a&&!b)continue;const o=cand.get((c[3]+a)+','+(c[4]+b));if(o&&(o[0]>c[0]||(o[0]===c[0]&&(o[3]<c[3]||(o[3]===c[3]&&o[4]<c[4]))))&&Math.hypot(o[1]-c[1],o[2]-c[2])<2200){ok=false;break;}}if(ok)srcs.push(c);}
        srcs.sort((a,b)=>a[3]-b[3]||a[4]-b[4]);const NM=['Suối Đầu Nguồn','Suối Đá','Suối Mây','Suối Bạc','Suối Reo','Suối Lạnh','Suối Tiên','Suối Vàng'];
        for(const c of srcs){let x=c[1],z=c[2],dir=dlHash(c[3],c[4],s0+883)*6.283,h=c[0],lastH=c[0];const pts=[[x,z]];for(let n=0;n<420;n++){let bd=dir,bh=1e9;for(let k=-5;k<=5;k++){const a=dir+k*0.26,hh=dlBase(x+Math.cos(a)*70,z+Math.sin(a)*70)+Math.abs(k)*0.6;if(hh<bh){bh=hh;bd=a;}}dir=bd;x+=Math.cos(dir)*36;z+=Math.sin(dir)*36;pts.push([x,z]);h=dlBase(x,z);if(h<0.5)break;if(n%30===0){if(n&&lastH-h<5)break;lastH=h;}}
          if(pts.length<14)continue;/* cắt lấy các đoạn nằm trong vùng nạp */let run=[],ri=0,i0=0;const N=pts.length,flush=(i1)=>{/* bề rộng tính theo vị trí trên CẢ dòng suối (không theo đoạn cắt) để hai tỉnh thấy cùng một lòng suối */if(run.length>=14&&!run.some(q=>Math.hypot(q[0]-SPAWN[0],q[1]-SPAWN[1])<380)&&RIV.length<14)RIV.push({id:'suoi'+c[3]+'_'+c[4]+'_'+(ri++),n:NM[Math.floor(dlHash(c[3],c[4],s0+887)*NM.length)]||'Suối',pts:run,w:[11+15*i0/N,11+15*i1/N],dep:4.5,sea:1,s:null});run=[];};
          for(let n=0;n<N;n++){const q=pts[n],lx=q[0]-DL.ox,lz=q[1]-DL.oz;if(Math.abs(lx)<Hh&&Math.abs(lz)<Hh){if(!run.length)i0=n;run.push([lx,lz]);}else flush(n);}flush(N);}
        if(RIV.length){RBK=new Map();const C=400;RIV.forEach((r,ri)=>{for(let k=0;k<r.pts.length-1;k++){const [ax,az]=r.pts[k],[bx,bz]=r.pts[k+1],m=200;for(let i=Math.floor((Math.min(ax,bx)-m)/C);i<=Math.floor((Math.max(ax,bx)+m)/C);i++)for(let j=Math.floor((Math.min(az,bz)-m)/C);j<=Math.floor((Math.max(az,bz)+m)/C);j++){const key=i+','+j;if(!RBK.has(key))RBK.set(key,[]);RBK.get(key).push(ri,k);}}});}}catch(e){console.warn('suối núi',e);RIV=[];RBK=null;}};}
  /* các vùng có tên của một vùng nạp, đặt theo địa hình thật quanh điểm neo: làng lái buôn và trại cướp trên đất bằng khô ráo, hồ ở chỗ có nước, núi ở chỗ cao, rừng, đồng cỏ */
  /* tâm khởi đầu của MỘT tỉnh bất kỳ (toạ độ riêng của tỉnh đó), chỉ tính từ địa hình đại lục → tỉnh nào hỏi cũng ra cùng kết quả */
  function dlSpawnOf(ox,oz){for(let r=0;r<2600;r+=120)for(let i=0;i<12;i++){const a=i/12*6.283+r,x=Math.cos(a)*r,z=Math.sin(a)*r,h=dlBase(x+ox,z+oz);if(h>6&&h<70&&Math.abs(dlBase(x+60+ox,z+oz)-h)<10&&Math.abs(dlBase(x+ox,z+60+oz)-h)<10)return [x,z];}return [0,0];}
  /* chỗ bằng, khô quanh (tx,tz) của tỉnh nằm lệch (dx,dz) so với tỉnh đang đứng; chỉ tìm trong địa phận tỉnh đó (|x|,|z| ≤ lim) */
  function dlFlatAt(tx,tz,rad,dx,dz,lim){let best=null;const H=(x,z)=>hAt(x+dx,z+dz),Wd=(x,z)=>wdAt(x+dx,z+dz);for(let r=0;r<=rad;r+=110){const n=r?Math.max(6,Math.round(r/70)):1;for(let i=0;i<n;i++){const a=i/n*6.283+r*0.13,x=tx+Math.cos(a)*r,z=tz+Math.sin(a)*r;if(Math.abs(x)>lim||Math.abs(z)>lim)continue;const h=H(x,z);if(h<6||h>140||Wd(x,z)>0||slopeAt(x+dx,z+dz)>0.22)continue;let ok=true;for(let k=0;k<8;k++){const bx=x+Math.cos(k*0.785)*150,bz=z+Math.sin(k*0.785)*150;if(Wd(bx,bz)>0||Math.abs(H(bx,bz)-h)>30){ok=false;break;}}if(ok)return [x,z];if(!best)best=[x,z];}}return best;}
  /* làng của một tỉnh: luôn nằm sâu trong địa phận tỉnh (cách ranh giới ít nhất ~55 m) để đứng trong làng là đang ở đúng tỉnh của làng */
  function dlVillageOf(sp,seed,dx,dz){const a0=dlHash(seed|0,1,3)*6.283,cl=v=>Math.max(-2600,Math.min(2600,v)),v=dlFlatAt(cl(sp[0]+Math.cos(a0)*1900),cl(sp[1]+Math.sin(a0)*1900),1500,dx,dz,2800);return v&&Math.hypot(v[0]-sp[0],v[1]-sp[1])>900?v:null;}
  function dlFlat(tx,tz,rad){let best=null;for(let r=0;r<=rad;r+=110){const n=r?Math.max(6,Math.round(r/70)):1;for(let i=0;i<n;i++){const a=i/n*6.283+r*0.13,x=tx+Math.cos(a)*r,z=tz+Math.sin(a)*r;if(Math.hypot(x,z)>WR*0.72)continue;const h=hAt(x,z);if(h<6||h>140||wdAt(x,z)>0||slopeAt(x,z)>0.22)continue;let ok=true;for(let k=0;k<8;k++){const bx=x+Math.cos(k*0.785)*150,bz=z+Math.sin(k*0.785)*150;if(wdAt(bx,bz)>0||Math.abs(hAt(bx,bz)-h)>30){ok=false;break;}}if(ok)return [x,z];if(!best)best=[x,z];}}return best;}
  function dlFind(test,minD,maxD){for(let r=minD;r<=maxD;r+=160)for(let i=0;i<20;i++){const a=i/20*6.283+r*0.07,x=SPAWN[0]+Math.cos(a)*r,z=SPAWN[1]+Math.sin(a)*r;if(Math.hypot(x,z)>WR*0.8)continue;if(test(x,z))return [x,z];}return null;}
  {const _rb=regionsBuild;regionsBuild=function(){if(!DL.on)return _rb.apply(this,arguments);const R=[{id:'start',n:'Bến Khởi Đầu',d:'Nơi bạn dừng chân trên đại lục.',ic:'🔥',x:SPAWN[0],z:SPAWN[1],r:260}];
      try{const sd=(S.seed|0),a0=dlHash(sd,1,3)*6.283,far=(p,d)=>p&&R.every(g=>Math.hypot(g.x-p[0],g.z-p[1])>d);
        const add=(id,n,d,ic,p,r)=>{if(p)R.push({id,n,d,ic,x:p[0],z:p[1],r});};
        const v=dlVillageOf(SPAWN,sd,0,0);if(far(v,900))add('village','Làng Ven Sông','Làng của người bản địa: đổi hàng, nghe chuyện, học nghề.','🛖',v,230);
        const cl2=q=>Math.max(-2600,Math.min(2600,q)),c=dlFlatAt(cl2(SPAWN[0]+Math.cos(a0+2.6)*3000),cl2(SPAWN[1]+Math.sin(a0+2.6)*3000),1700,0,0,2800);if(far(c,1100))add('camp','Trại Cướp','Bọn cướp đóng trại ở đây. Có vũ khí, có người hãy tới.','⚔️',c,260);
        const lk=dlFind((x,z)=>hAt(x,z)<-3&&hAt(x+200,z)<0&&hAt(x,z+200)<0,500,5200);if(far(lk,600))add('lake','Vùng Nước Lớn','Sông hồ rộng: cá, đất sét, lau sậy.','🌊',lk,420);
        const mt=dlFind((x,z)=>hAt(x,z)>300,700,5600);if(far(mt,700))add('range','Dãy Núi Đá','Núi cao vách dựng: đá, đá lửa, quặng. Lạnh, dốc.','⛰️',mt,700);
        const fr=dlFind((x,z)=>{const b=biome(x,z);return b==='forest'||b==='jungle';},600,4200);if(far(fr,700))add('forest','Rừng Già','Rừng rậm: gỗ tốt, thú săn, mật ong.','🌲',fr,520);
        const md=dlFind((x,z)=>biome(x,z)==='meadow'&&slopeAt(x,z)<0.15,900,4200);if(far(md,700))add('savanna','Đồng Cỏ Lớn','Đồng cỏ thoáng: thú ăn cỏ từng đàn, dễ dựng làng.','🌾',md,520);
        /* LÀNG CỦA 8 TỈNH KỀ: tính bằng đúng công thức trên trong hệ toạ độ của tỉnh đó; làng nào lọt vào vùng nạp thì ghi lên bản đồ và dựng nhà sàn (chưa có người, sang tới nơi mới gặp) */
        DL.nbv=[];try{const nb=dlNb().key,Hh=WSIZE/2-400;for(const k in nb){const e=nb[k],ox=DL.ox+e.dx,oz=DL.oz+e.dz;if(dlBase(ox,oz)<-20&&dlBase(ox+1500,oz)<-20&&dlBase(ox,oz+1500)<-20)continue;const sp=dlSpawnOf(ox,oz),vv=dlVillageOf(sp,e.seed,e.dx,e.dz);if(!vv)continue;const x=vv[0]+e.dx,z=vv[1]+e.dz;if(Math.abs(x)>Hh||Math.abs(z)>Hh)continue;DL.nbv.push({k,x,z});R.push({id:'nbvil_'+k,n:'Làng tỉnh '+dlProvName(ox,oz),d:'Làng của tỉnh bên. Sang tới nơi mới gặp được người làng.',ic:'🛖',x,z,r:200});/* trại cướp của tỉnh đó: chỉ đánh dấu trên bản đồ để biết đường tránh hoặc tìm tới */try{const a0n=dlHash(e.seed|0,1,3)*6.283,cl3=q=>Math.max(-2600,Math.min(2600,q)),cc=dlFlatAt(cl3(sp[0]+Math.cos(a0n+2.6)*3000),cl3(sp[1]+Math.sin(a0n+2.6)*3000),1700,e.dx,e.dz,2800);if(cc&&Math.hypot(cc[0]-sp[0],cc[1]-sp[1])>1100&&Math.hypot(cc[0]-vv[0],cc[1]-vv[1])>1100){const cx=cc[0]+e.dx,cz=cc[1]+e.dz;if(Math.abs(cx)<=Hh&&Math.abs(cz)<=Hh)R.push({id:'nbcamp_'+k,n:'Trại cướp tỉnh '+dlProvName(ox,oz),d:'Trại cướp của tỉnh bên: sang tới nơi mới thấy bọn chúng.',ic:'⚔️',x:cx,z:cz,r:200});}}catch(e2){}}}catch(e){console.warn('làng tỉnh bên',e);}
      }catch(e){console.warn('vùng đại lục',e);}REG=R;try{if(typeof LD==='object')LD.gates=[];}catch(e){}};}
  /* nhiễu dùng cho màu đất: trên đại lục lấy hạt giống MÁY CHỦ (không theo tỉnh) để cùng với TGX/TGZ cho ra một bức màu liền mạch */
  {const _ni=noiseInit;noiseInit=function(seed){return _ni.call(this,DL.on&&S&&S.seed0?S.seed0:seed);};}
  {const _tb=trailsBuild;trailsBuild=function(){if(!DL.on)return _tb.apply(this,arguments);TRAILS=[];TRL=null;};}
  {const _dp=decorPlan;decorPlan=function(){if(!DL.on)return _dp.apply(this,arguments);DECO_PLAN=[];SCOL=[];};}
  if(typeof wIn==='function'){const _wi=wIn;wIn=function(x,z,k){if(!DL.on)return _wi.apply(this,arguments);return Math.hypot(x,z)<WR*(k||1);};}
  {const _ng=newGame;newGame=function(o){const r=_ng.apply(this,arguments);try{if(S&&localStorage.getItem('ld-dl')!=='0'&&!(G.nworld==='mp')&&!S.dl){/* MẶC ĐỊNH: nhân vật mới chơi một mình sống trên đại lục (tắt: mở trang với ?dailuc=0) */dlStart(null);/* LƯU NGAY: các lớp tạo nhân vật bên trong đã lưu một bản CHƯA có đại lục; không lưu đè thì bị văng ra sớm là vào lại thành nhân vật bản đồ cũ */S._new=1;try{if(typeof saveNow==='function')saveNow();else save();}finally{delete S._new;}}}catch(e){console.warn('đại lục',e);}return r;};}
  /* các hàm dưới đây nằm trong khối riêng (chế độ nghiêm ngặt không tự đưa ra ngoài): gắn lên window để phần máy chủ (mp.js) và bài thử gọi được */
  setTimeout(()=>{try{Object.assign(window,{dlTravel,dlSpawnOf,dlAnchorPop,dlAnchor,dlA,dlCardOff,dlResOut,dlResIn,dlBiome,dlZoneAt,dlClim,dlBase,dlNb,dlStart,dlShift,dlRebuild,dlKey,dlAnchor,dlRing,dlSeedAt,dlMapDraw,dlMapZoom,dlMapSharp,dlProvName,dlSafeZone});}catch(e){}},0);
  /* đưa nhân vật (S vừa tạo) lên đại lục; uid có thì chọn tỉnh theo mã người chơi */
  /* CHƠI CHUNG: xếp người mới vào chỗ ĐÃ CÓ NGƯỜI để còn gặp nhau. pop = {mã tỉnh: số người đang ở}.
     Tỉnh đông nhất còn dưới `cap` người thì vào đó; các tỉnh có người đều đầy thì vào tỉnh đất tốt GẦN tỉnh đông nhất; chưa ai ở đâu thì mọi người cùng vào tỉnh tốt nhất. */
  function dlAnchorPop(seed,pop,cap){const L=dlAnchor(seed,'all');if(!L.length)return {ox:0,oz:0};const n=a=>(pop&&pop[dlKey(a.ox,a.oz)])|0;const used=L.filter(a=>n(a)>0);if(!used.length)return L[0];
    const open=used.filter(a=>n(a)<cap).sort((a,b)=>n(b)-n(a));if(open.length)return open[0];const hub=used.sort((a,b)=>n(b)-n(a))[0];return L.filter(a=>n(a)<cap).sort((a,b)=>Math.hypot(a.ox-hub.ox,a.oz-hub.oz)-Math.hypot(b.ox-hub.ox,b.oz-hub.oz)||b.sc-a.sc)[0]||L[0];}
  /* DU HÀNH tới tỉnh có mã k (dùng cho chơi chung: tới tỉnh đông người, về tỉnh nhà): đặt người chơi vào chỗ khởi đầu của tỉnh đó rồi dời điểm neo như khi tự đi bộ sang. */
  function dlTravel(k){try{if(!DL.on||DL.busy||!S||!S.dl||typeof k!=='string'||k.length!==3)return false;const A=dlA(),tox=(parseInt(k[1],36)-18)*A,toz=(parseInt(k[2],36)-18)*A;if(!Number.isFinite(tox)||!Number.isFinite(toz)||Math.hypot(tox,toz)>DL.R)return false;if(dlKey(tox,toz)===S.land)return false;
      const sp=dlSpawnOf(tox,toz);if(dlBase(tox+sp[0],toz+sp[1])<3)return false;try{if(G.mnt==null&&typeof sitToggle==='function'&&G.sit)sitToggle(false);}catch(e){}G.walkTo=null;G.act=null;P.x=tox-S.dl.ox+sp[0];P.z=toz-S.dl.oz+sp[1];DL.trv=1;const ok=dlShift();if(!ok)DL.trv=0;return ok;}catch(e){console.warn('du hành',e);return false;}}
  function dlStart(uid,pop){if(uid!=null){S.dl={ox:0,oz:0};S.wv=3;S.wv0=3;worldCfg(3);const a=dlAnchorPop(S.seed,pop||{},DL_POPCAP);S.seed0=S.seed;S.dl={ox:a.ox,oz:a.oz};S.land=dlKey(a.ox,a.oz);S.dlHome=S.land;S.seed=dlSeedAt(a.ox,a.oz);S.dlNew=1;worldCfg(3);return;}S.dl={ox:0,oz:0};S.wv=3;S.wv0=3;worldCfg(3);/* mỗi nhân vật mới một chỗ BẤT KỲ trên đại lục: chọn ngẫu nhiên trong các tỉnh đất tốt (đồng bằng, gần nước) */let pk=(Math.random()*1e9)|0;const a=dlAnchor(S.seed,pk);S.seed0=S.seed;S.dl={ox:a.ox,oz:a.oz};S.land=dlKey(a.ox,a.oz);S.seed=dlSeedAt(a.ox,a.oz);S.dlNew=1;worldCfg(3);}
  /* khoáng sản cho đại lục: bản đồ cũ đặt mỏ theo các vùng vẽ tay (dãy núi, bãi muối…), đại lục không có các vùng đó nên gần như không có quặng.
     Giờ một phần đá tảng thành quặng đồng, thiếc, đá lửa, sắt, than; một phần lau cỏ ven nước thành đất sét, bãi muối, bãi sò. Tỉ lệ cố định theo vị trí nên ai trong tỉnh cũng thấy như nhau. */
  /* ===================== SINH CẢNH + CÂY ĐÁ THEO TOẠ ĐỘ ĐẠI LỤC =====================
     Trước: rừng / đồng cỏ / bãi và mọi cây đá đều tính quanh TÂM TỈNH đang đứng bằng một dãy số ngẫu nhiên chạy tuần tự → bước qua ranh giới là đổi hết.
     Giờ: · sinh cảnh là hàm của toạ độ đại lục (độ cao, độ dốc, nhiễu ẩm, mảng rừng rậm, mảng đồng cỏ khô) — đứng ở tỉnh nào nhìn cũng ra một kết quả;
          · cây đá rải theo Ô LƯỚI CỐ ĐỊNH 650 đơn vị của đại lục, mỗi ô một hạt giống riêng (từ hạt giống máy chủ), không phụ thuộc tỉnh;
          · công thức rải (loài nào, sinh cảnh nào, mật độ) vẫn lấy từ world.js: resGen chạy ở chế độ GHI (RESREC) rồi phần này rải theo ô.
     Riêng của từng tỉnh chỉ còn: vài món quanh chỗ bắt đầu, bãi trống quanh chỗ bắt đầu, lòng suối. */
  const dlMoistG=(gx,gz)=>dlFbm(gx/2400+31,gz/2400-17,4,DL.seed+211)*0.85+0.02;
  const dlSavG=(gx,gz)=>dlSS(0.16,0.4,dlFbm(gx/5200-9,gz/5200+4,2,DL.seed+307));
  const dlJunG=(gx,gz)=>dlSS(0.18,0.42,dlFbm(gx/4600+3,gz/4600+29,2,DL.seed+401));
  const dlDenseG=(gx,gz)=>dlSS(0.02,0.25,dlFbm(gx/900+80,gz/900-40,3,DL.seed+503))+dlJunG(gx,gz)*0.5;
  const dlWet=(gx,gz,d)=>dlH(gx+d,gz)<0||dlH(gx-d,gz)<0||dlH(gx,gz+d)<0||dlH(gx,gz-d)<0;
  /* KHÍ HẬU NHỚ SẴN trên lưới thưa (8 ô địa hình một điểm) của vùng đang nạp: sinh cảnh và màu đất hỏi khí hậu cho hàng trăm nghìn điểm mỗi lần dựng vùng,
     tính nhiễu lại từng điểm là phần chậm nhất lúc sang tỉnh. Lưới bám theo toạ độ đại lục nên tỉnh nào nội suy cũng ra cùng giá trị. */
  function dlClimL(x,z){let C=DL.cg;if(!C||C.ox!==DL.ox||C.oz!==DL.oz||C.w!==WSIZE){const st=HSTEP*8,n=Math.ceil(WSIZE/st)+2,T=new Float32Array(n*n),W=new Float32Array(n*n),x0=-WSIZE/2,z0=-WSIZE/2;for(let j=0;j<n;j++)for(let i=0;i<n;i++){const tw=dlClimTW(x0+i*st+DL.ox,z0+j*st+DL.oz);T[j*n+i]=tw[0];W[j*n+i]=tw[1];}C=DL.cg={ox:DL.ox,oz:DL.oz,w:WSIZE,st,n,T,W,x0,z0};}
    const fx=(x-C.x0)/C.st,fz=(z-C.z0)/C.st,i=Math.floor(fx),j=Math.floor(fz);if(i<0||j<0||i>=C.n-1||j>=C.n-1)return dlClim(x+DL.ox,z+DL.oz);const u=fx-i,v=fz-j,k=j*C.n+i,n=C.n;
    return dlClimW((C.T[k]*(1-u)+C.T[k+1]*u)*(1-v)+(C.T[k+n]*(1-u)+C.T[k+n+1]*u)*v,(C.W[k]*(1-u)+C.W[k+1]*u)*(1-v)+(C.W[k+n]*(1-u)+C.W[k+n+1]*u)*v);}
  function dlBiome(x,z,h0){const h=h0==null?hAt(x,z):h0;if(h<-0.4)return 'water';if(h>450)return 'peak';const sl=slopeAt(x,z);if(h>260||sl>0.8)return 'rock';const gx=x+DL.ox,gz=z+DL.oz;
    if(h<9&&dlWet(gx,gz,110)){/* sát nước: biển, hồ lớn thì là bãi cát; sông, lạch thì là bờ */let big=0;if(dlH(gx+600,gz)<-6)big++;if(dlH(gx-600,gz)<-6)big++;if(dlH(gx,gz+600)<-6)big++;if(dlH(gx,gz-600)<-6)big++;return big>=2?'beach':'bank';}
    const c=dlClimL(x,z),m=dlMoistG(gx,gz)+dlJunG(gx,gz)*0.35-dlSavG(gx,gz)*0.5+(h>140?-0.05:0)+c[0]*0.06+c[1]*0.22-c[2]*0.45+c[3]*0.12-c[4]*0.2;return m>0.06?'forest':(m>-0.1?'edge':'meadow');}
  /* LƯỚI ĐỘ CAO cho đại lục, bản nhanh: độ cao lấy thẳng từ các mảnh đã tính; chỉ những ô nằm gần lòng suối mới phải hỏi "cách suối bao xa" để khoét lòng và đặt mặt nước
     (bản chung hỏi câu đó hai lần cho MỌI ô, rồi còn dựng lưới "vùng mới" của bản đồ cũ mà đại lục không dùng). */
  {const _hb=heightsBuild;heightsBuild=function(){if(!DL.on)return _hb.apply(this,arguments);riversSurface();HG=new Float32Array(HN*HN);WG=new Float32Array(HN*HN);try{if(typeof W4==='object')W4.ZG=null;}catch(e){}const C=400,has=RBK&&RBK.size?RBK:null;
      for(let j=0;j<HN;j++){const z=-WOZ+j*HSTEP,bz=Math.floor(z/C);let bx0=1e9,near=false;for(let i=0;i<HN;i++){const x=-WSIZE/2+i*HSTEP,k=j*HN+i;if(has){const bx=Math.floor(x/C);if(bx!==bx0){bx0=bx;near=has.has(bx+','+bz);}}
          if(near){const h=rawH(x,z);HG[k]=h;const q=riverQ(x,z);let w=h<0?0:-999;if(q.r>=0&&q.d<q.w*0.5+HSTEP&&q.s>0.5)w=Math.max(w,q.s);WG[k]=w;}else{const h=baseH(x,z);HG[k]=h;WG[k]=h<0?0:-999;}}}};}
  /* lưới sinh cảnh: tính MỘT lần mỗi lần dựng vùng (trước hai lần) và tính thưa gấp đôi (một điểm cho mỗi khối 2×2 ô, bám toạ độ đại lục) */
  {const _bg=biomeGridBuild;biomeGridBuild=function(){if(!DL.on)return _bg.apply(this,arguments);const key=DL.ox+','+DL.oz+':'+(DL.bgN|0);if(DL.bgKey===key&&typeof BG!=='undefined'&&BG&&BG.length===HN*HN)return;DL.bgKey=key;BG=new Uint8Array(HN*HN);
      for(let j=0;j<HN;j+=2)for(let i=0;i<HN;i+=2){const x=-WSIZE/2+i*HSTEP,z=-WOZ+j*HSTEP,c=Math.max(0,BCODE.indexOf(biome(x,z))),k=j*HN+i;BG[k]=c;if(i+1<HN)BG[k+1]=c;if(j+1<HN){BG[k+HN]=c;if(i+1<HN)BG[k+HN+1]=c;}}};}
  {const _b=biome;biome=function(x,z){if(!DL.on)return _b(x,z);if(wdAt(x,z)>0.4)return 'water';return dlBiome(x,z);};}
  {const _m=moist;moist=function(x,z){return DL.on?dlMoistG(x+DL.ox,z+DL.oz):_m(x,z);};}
  {const _m=savannaK;savannaK=function(x,z){if(!DL.on)return _m(x,z);const gx=x+DL.ox,gz=z+DL.oz;return Math.max(dlSavG(gx,gz)*0.6,dlClimL(x,z)[2]);};}
  {const _m=jungleK;jungleK=function(x,z){if(!DL.on)return _m(x,z);const gx=x+DL.ox,gz=z+DL.oz;return Math.max(dlJunG(gx,gz),dlClimL(x,z)[1]);};}
  {const _m=denseK;denseK=function(x,z){return DL.on?dlDenseG(x+DL.ox,z+DL.oz):_m(x,z);};}
  /* màu mặt đất theo miền (world.js gọi sau khi tô màu sinh cảnh): bắc xanh sẫm ngả lam, nhiệt đới xanh đậm tươi, đồi tre xanh nõn, đồng hoa xanh vàng nhạt; thảo nguyên đã có màu cỏ khô sẵn */
  window.zoneTint=function(c,c2,x,z,b){if(!DL.on||b==='water'||b==='beach'||b==='rock'||b==='peak')return;const cw=dlClimL(x,z);if(cw[0]>0.02){c2.set('#3d6b52');c.lerp(c2,cw[0]*0.38);}if(cw[1]>0.02){c2.set('#2f8f3a');c.lerp(c2,cw[1]*0.34);}if(cw[3]>0.02){c2.set('#86b84c');c.lerp(c2,cw[3]*0.3);}if(cw[4]>0.02){c2.set('#a9c468');c.lerp(c2,cw[4]*0.32);}if(cw[2]>0.02&&b!=='meadow'){c2.set('#a6a24e');c.lerp(c2,cw[2]*0.3);}};
  /* khí hậu theo miền: bắc lạnh hơn 7 độ, nhiệt đới nóng hơn 4, thảo nguyên nóng hơn 5 */
  {const _at=ambientTemp;ambientTemp=function(){let t=_at.apply(this,arguments);try{if(DL.on&&S&&S.dl){if(!(DL.ctT>Date.now())){const cw=dlClim(S.dl.ox+P.x,S.dl.oz+P.z);DL.ctV=-7*cw[0]+4*cw[1]+5*cw[2];DL.ctT=Date.now()+3000;}t+=DL.ctV||0;}}catch(e){}return t;};}
  /* các "vùng mới" của bản đồ cũ (cao nguyên thông, thung lũng tre…) nằm theo tâm cửa sổ: đại lục không dùng */
  {const _z=z4At;z4At=function(x,z){if(DL.on){_z4.id=null;_z4.k=0;_z4.Z=null;return _z4;}return _z(x,z);};}
  function dlResCells(specs,base){const C=650,H=WSIZE/2-40,A0=Math.PI*Math.pow(WR*0.95,2),s0=DL.seed|0,isTree=t=>/^(pine|oak|birch|dead|savannaTree)$/.test(t);
    /* hệ số theo miền cho từng loài [bac, nd, sv, tre, hoa] (không ghi = 1) */
    const ZM={pine:[1.8,0.05,0,0.5,0.5],pineY:[1.8,0.05,0,0.5,0.5],pineG:[2,0,0,0.5,0.5],birch:[1.5,0.1,0.2,1,1.6],birchY:[1.5,0.1,0.2,1,1.6],oak:[0.35,1.3,0.25,0.7,0.6],oakG:[0.3,2.2,0.2,0.7,0.6],young:[1,1,0.3,1,1],
      banana:[0,6,0.3,1.5,1],palm:[0,5,1,1,1],bamboo:[0,4,0.2,14,1],savannaTree:[0,0.3,4,0.3,0.6],tallgrass:[0.6,0.8,3,1,1.2],fern:[0.7,2,0.1,1.6,0.7],mushroom:[1.5,1.2,0.2,1,1],mushroomR:[1.5,1.2,0.2,1,1],
      berry:[1.4,1,0.4,1,1.5],ginger:[0,2.5,0.3,1.5,1],turmeric:[0,2.5,0.5,1.2,1],aloe:[0,1,6,1,1],bones:[1,1,3,1,1],dead:[1.2,0.6,3,1,1],deadLog:[1,1.5,0.3,1,1],flax:[0.7,1,0.6,1,1.5],lotus:[0.3,2,0.5,1,1],reedBed:[0.8,2,0.5,1,1],
      gourdwild:[0.3,2,0.6,1,1],beehive:[0.5,1.6,0.6,1,2.2],scree:[1.5,1,1.2,1,1],boulder:[1.5,1,1.5,1,1],rock:[1.2,1,1.4,1,1],mint:[1,1.2,0.4,1.5,1],wildgrain:[0.6,0.8,1,1,2],
      flowerR:[0.6,0.8,0.5,1,3.2],flowerY:[0.6,0.8,0.6,1,3.2],flowerW:[0.8,0.8,0.4,1,3.2],flowerP:[0.6,1,0.4,1,3.2]};
    const SP=[];for(const [t,n,want,tries] of specs){if(!RT[t])continue;const n2=n*2.6*WRES,/* số lượt thử cho cả cửa sổ: 3,2 lượt cho mỗi món muốn có; loài hiếm (world.js cho số lượt thử riêng) được thử nhiều hơn, tối đa 14 lượt */tot=n2*(tries?Math.max(3.2,Math.min(14,tries/n2*0.08)):3.2);const zm=ZM[t]||null,M=zm?Math.max(1,...zm):1;SP.push({t,zm,M,want:t==='copperRock'?null:want,per:M*tot*C*C/A0*(/^(pine|oak|birch|young|pineY|birchY|pineG|oakG)$/.test(t)?0.72:1)/* cây lớn nặng máy: bớt lại để tổng số cây ngang bản trước */,r:(RT[t].r||4)+4,pass:!!RT[t].pass,tree:isTree(t)});}
    if(RT.lotus)SP.push({t:'lotus',lotus:1,zm:ZM.lotus,M:2,per:3.2,r:14,pass:true,tree:false});
    /* loài chỉ mọc dày ở MIỀN của nó (zi: số thứ tự miền): cọ, chuối, tre ở nhiệt đới; rừng tre; cây và cỏ thảo nguyên */
    const ex=(t,zi,n,want)=>{if(RT[t])SP.push({t,zi,want,per:n*2.6*WRES*3.2*C*C/A0,r:(RT[t].r||4)+4,pass:!!RT[t].pass,tree:false});};
    ex('palm',1,70,b=>b==='bank'?0.5:b==='edge'?0.14:b==='meadow'?0.1:b==='forest'?0.04:0);ex('banana',1,90,b=>b==='forest'?0.25:b==='edge'?0.3:0);ex('bamboo',1,60,b=>b==='forest'?0.15:b==='edge'?0.2:0);
    ex('bamboo',3,420,b=>b==='forest'?0.75:b==='edge'?0.6:b==='meadow'?0.25:b==='bank'?0.4:0);ex('savannaTree',2,130,b=>b==='meadow'?0.5:b==='edge'?0.3:0);ex('tallgrass',2,260,b=>b==='meadow'?0.7:b==='edge'?0.3:0);
    const i0=Math.ceil((DL.ox-H)/C),i1=Math.floor((DL.ox+H)/C)-1,j0=Math.ceil((DL.oz-H)/C),j1=Math.floor((DL.oz+H)/C)-1;let made=0;
    const put=(t,x,z,s,ry)=>{const q={i:RES.length,t,x,z,ry,s:s*(RT[t].sc||1),hp:RT[t].hp,st:0,rg:0};RES.push(q);const k=rKey(x,z);if(!RGRID.has(k))RGRID.set(k,[]);RGRID.get(k).push(q.i);made++;return q;};
    const TW=new Map(),tw=(a,b)=>{const k=a*8192+b;let v=TW.get(k);if(!v){v=dlClimTW(a*C,b*C);TW.set(k,v);}return v;};
    for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const R=rng(((dlHash(i,j,s0+977)*4294967296)>>>0)||1),loc=[],c00=tw(i,j),c10=tw(i+1,j),c01=tw(i,j+1),c11=tw(i+1,j+1);
      for(const sp of SP){let n=Math.floor(sp.per);if(R()<sp.per-n)n++;
        for(let k=0;k<n;k++){/* mỗi lượt thử luôn rút đúng 5 số: kết quả của lượt này không kéo lệch các lượt sau */const u1=R(),u2=R(),u3=R(),u4=R(),u5=R(),fx=0.015+u1*0.97,fz=0.015+u2*0.97,gx=(i+fx)*C,gz=(j+fz)*C,x=gx-DL.ox,z=gz-DL.oz,h=hAt(x,z);
          /* miền tại điểm này (nội suy từ bốn góc ô, rung nhẹ cho ranh giới miền không thành đường thẳng) → hệ số loài */let zk=1;if(sp.zm||sp.zi!=null){const T=(c00[0]*(1-fx)+c10[0]*fx)*(1-fz)+(c01[0]*(1-fx)+c11[0]*fx)*fz+(u5-0.5)*0.06,W=(c00[1]*(1-fx)+c10[1]*fx)*(1-fz)+(c01[1]*(1-fx)+c11[1]*fx)*fz+(u4-0.5)*0.06,cw=dlClimW(T,W);if(sp.zi!=null)zk=cw[sp.zi];else{let m=1;for(let q=0;q<5;q++)m+=cw[q]*(sp.zm[q]-1);zk=Math.max(0,m)/sp.M;}if(zk<=0)continue;}
          if(sp.lotus){if(h>-0.8||h<-8||u3>0.4*zk)continue;}
          else{if(h<2)continue;const b=dlBiome(x,z,h);if(b==='water'||!sp.want)continue;const w=sp.want(b,x,z,h);if(!w||u3>w*zk)continue;}
          let ok=true;for(let q=0;q<loc.length;q++){const o=loc[q],dx=o[0]-gx,dz=o[1]-gz,rr=sp.r+o[2]*0.8;if(dx*dx+dz*dz<rr*rr){ok=false;break;}}if(!ok)continue;loc.push([gx,gz,sp.r-4]);
          /* phần riêng của tỉnh (không ảnh hưởng tới các lượt khác): bãi trống quanh chỗ bắt đầu, lòng suối, món đã đặt sẵn quanh chỗ bắt đầu */
          const sd=Math.hypot(x-SPAWN[0],z-SPAWN[1]);if(sd<60||(sd<230&&!sp.pass))continue;if(!sp.lotus&&wdAt(x,z)>0)continue;
          if(base){let hit=false;for(const ix of near(x,z,sp.r+30)){if(ix>=base)continue;const o=RES[ix];if(Math.hypot(o.x-x,o.z-z)<sp.r+(RT[o.t].r||4)*0.8){hit=true;break;}}if(hit)continue;}
          const q=put(sp.t,x,z,sp.tree?0.62+u4*0.7:0.85+u4*0.35,u5*6.283);if(sp.lotus)q.wy=0.4;}}}
    DL.resMade=made;}
  {const _rg=resGen;resGen=function(seed){if(!DL.on)return _rg.apply(this,arguments);let r,specs=null;RESREC=[];try{r=_rg.apply(this,arguments);}finally{specs=RESREC;RESREC=null;}
      try{const t0=performance.now(),base=RES.length;DL.resBase=base;dlResCells(specs||[],base);
        /* khoáng sản, đất sét, muối: đổi loài theo TOẠ ĐỘ ĐẠI LỤC của từng món (trước theo số thứ tự nên mỗi tỉnh một khác) */
        const sd=DL.seed|0,re=(q,t,u)=>{if(!RT[t])return;q.t=t;q.s=(0.85+u*0.35)*(RT[t].sc||1);q.hp=RT[t].hp;};
        for(let n=base;n<RES.length;n++){const q=RES[n],gx=Math.round(q.x+DL.ox),gz=Math.round(q.z+DL.oz),u=dlHash(gx,gz,sd+11),u2=dlHash(gx,gz,sd+3),t=q.t;
          if(t==='rock'||t==='boulder'){if(u<0.11)re(q,'copperRock',u2);else if(u<0.25)re(q,'flintRock',u2);else if(u<0.31)re(q,'tinRock',u2);else if(u<0.35)re(q,'ironRock',u2);else if(u<0.39)re(q,'coalRock',u2);}
          else if(t==='tallgrass'||t==='reeds'){if(hAt(q.x,q.z)<16){if(u<0.1)re(q,'clay',u2);else if(u<0.14)re(q,'saltPan',u2);else if(u<0.18)re(q,'shellBed',u2);}}}
        dlResIn();DL.resMs=Math.round(performance.now()-t0);}catch(e){console.warn('cây đá đại lục',e);}return r;};}
  /* CÂY ĐÃ CHẶT LƯU THEO TOẠ ĐỘ ĐẠI LỤC: S.res vẫn đánh theo số thứ tự trong vùng nạp (mọi chỗ trong game ghi vào đó), còn S.dlR={ 'x,z':[trạng thái, giờ mọc lại] } là bản gốc dùng chung cho mọi tỉnh.
     · dlResOut: chép trạng thái các món rải theo ô từ S.res ra S.dlR (chạy định kỳ và ngay trước khi sang tỉnh); món đã mọc lại thì xoá khỏi S.dlR.
     · dlResIn : vừa sinh xong cây đá của vùng mới thì lấy S.dlR đắp vào S.res → cây chặt ở sát ranh giới, sang tỉnh bên vẫn là gốc cây. */
  const dlRKey=q=>Math.round(q.x+DL.ox)+','+Math.round(q.z+DL.oz);
  function dlResOut(){try{if(!DL.on||!S||!S.res||DL.resBase==null)return;const D=S.dlR||(S.dlR={});for(let n=DL.resBase;n<RES.length;n++){const m=S.res[n],k=dlRKey(RES[n]);if(m)D[k]=m;else if(D[k])delete D[k];}}catch(e){}}
  function dlResIn(){try{if(!S||DL.resBase==null)return;if(!S.res)S.res={};if(!S.dlRv){/* bản lưu cũ: lần đầu chỉ chép ra, không xoá gì */S.dlRv=1;dlResOut();return;}const D=S.dlR||(S.dlR={}),now=TNOW();
      for(let n=DL.resBase;n<RES.length;n++){const k=dlRKey(RES[n]),m=D[k];if(m&&!(m[0]===1&&m[1]<now))S.res[n]=m;else{if(m)delete D[k];if(S.res[n])delete S.res[n];}}}catch(e){}}
  setInterval(()=>{try{if(DL.on&&typeof G==='object'&&G.on&&!DL.busy&&!G.ldLeaving)dlResOut();}catch(e){}},15000);
  /* ngoài vùng nạp vẫn là đại lục: độ cao lấy thẳng từ mảnh (trước trả về "biển sâu") */
  {const _h=hAt;hAt=function(x,z){const h=_h(x,z);return h===-60&&DL.on?dlH(x+DL.ox,z+DL.oz):h;};}
  /* VÀNH ĐẤT XA: mặt đất thô quanh vùng nạp (ra thêm ~4 mảnh mỗi phía) để đứng ở mép vùng vẫn thấy núi đồi nối tiếp chứ không phải biển giả.
     Dựng một lần lúc vào game (vài chục nghìn tam giác, gộp một lưới), tô màu theo độ cao và độ dốc. */
  function dlRing(){try{if(!DL.on||!G.sc||typeof THREE==='undefined')return;if(DL.ring){G.sc.remove(DL.ring);DL.ring.geometry.dispose();DL.ring=null;}const T=THREE,TS=DL.TS,half=WSIZE/2,n0=Math.round(half/TS),ext=4,st=4,m=DL.TN/st,hs=DL.HS*st,pos=[],col=[],idx=[];
      const C=(h,sl,x,z)=>{if(h<1.5)return [0.60,0.54,0.38];if(h>820)return [0.86,0.88,0.92];if(sl>0.55||h>300)return [0.34,0.32,0.29];/* mảng rừng ở xa: chỗ ẩm thì xanh đậm, như tán cây nhìn từ xa */const f=dlSS(-0.05,0.25,dlFbm(x/1400+9,z/1400-3,3,DL.seed+91)),g=h>180?[0.17,0.27,0.11]:[0.19,0.36,0.11];return [g[0]*(1-f)+0.085*f,g[1]*(1-f)+0.19*f,g[2]*(1-f)+0.06*f];};
      for(let tz=-n0-ext;tz<n0+ext;tz++)for(let tx=-n0-ext;tx<n0+ext;tx++){if(tx>=-n0&&tx<n0&&tz>=-n0&&tz<n0)continue;const x0=tx*TS,z0=tz*TS,b=pos.length/3;
        for(let j=0;j<=m;j++)for(let i=0;i<=m;i++){const x=x0+i*hs,z=z0+j*hs,h=dlBase(x+DL.ox,z+DL.oz),hx=dlBase(x+hs+DL.ox,z+DL.oz),hz=dlBase(x+DL.ox,z+hs+DL.oz),sl=Math.max(Math.abs(hx-h),Math.abs(hz-h))/hs,c=C(h,sl,x+DL.ox,z+DL.oz);pos.push(x,h<-6?-6:h,z);col.push(c[0],c[1],c[2]);}
        for(let j=0;j<m;j++)for(let i=0;i<m;i++){const a=b+j*(m+1)+i,c2=a+m+1;idx.push(a,c2,a+1,a+1,c2,c2+1);}}
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
      const me=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}));me.receiveShadow=false;me.castShadow=false;me.frustumCulled=false;me.userData.noSea=1;G.sc.add(me);DL.ring=me;
      /* biển quanh vành đất */const w=new T.Mesh(new T.PlaneGeometry((n0+ext)*TS*2+20000,(n0+ext)*TS*2+20000),new T.MeshStandardMaterial({color:0x2f6f8f,roughness:0.35,metalness:0.1,transparent:true,opacity:0.9}));w.rotation.x=-Math.PI/2;w.position.y=-0.4;w.frustumCulled=false;if(DL.sea)G.sc.remove(DL.sea);G.sc.add(w);DL.sea=w;}catch(e){console.warn('vành đất xa',e);}}
  {const _si=sceneInit;sceneInit=function(){const r=_si.apply(this,arguments);try{if(DL.on)dlRing();if(DL.on&&S.dlNew){S.dlNew=0;/* mỗi người một chỗ đặt chân quanh bến của tỉnh, khỏi dồn vào một điểm */for(let k=0;k<60;k++){const a=Math.random()*6.283,d=260+Math.random()*900,x=SPAWN[0]+Math.cos(a)*d,z=SPAWN[1]+Math.sin(a)*d,h=hAt(x,z);if(!(h>6&&wdAt(x,z)<=0&&slopeAt(x,z)<0.3))continue;
          /* chỗ dựng nhà đầu tiên phải khô ráo, bằng phẳng trong vòng ~12 m: sát nước thì không rào kín quanh nhà được */let dry=true;for(let i=0;i<12&&dry;i++){const bx=x+Math.cos(i*0.524)*(i%2?240:130),bz=z+Math.sin(i*0.524)*(i%2?240:130);if(wdAt(bx,bz)>0||hAt(bx,bz)<3||Math.abs(hAt(bx,bz)-h)>26)dry=false;}if(!dry&&k<50)continue;
          P.x=x;P.z=z;P.y=h;if(S.p){S.p.x=+x.toFixed(1);S.p.z=+z.toFixed(1);}break;}
        S.dlSafe={x:+P.x.toFixed(0)+S.dl.ox,z:+P.z.toFixed(0)+S.dl.oz};}if(DL.on&&S.dlSafe)dlSafeZone();}catch(e){}return r;};}
  /* vùng an toàn quanh chỗ bắt đầu của nhân vật (bản đồ cũ có sẵn quanh điểm xuất phát): mỗi lần dựng thế giới, thú dữ trong vòng ~37 m quanh đó được dời ra xa */
  function dlSafeZone(){try{const cx=S.dlSafe.x-S.dl.ox,cz=S.dlSafe.z-S.dl.oz;if(Math.hypot(cx,cz)>WR)return;for(const an of G.animals||[]){const D=ANIMALS[an.kind];if(!D||!D.aggro||D.aggro==='never')continue;const dd=Math.hypot(an.x-cx,an.z-cz);if(dd>=750)continue;
        for(let t=0;t<8;t++){const ang=Math.atan2(an.z-cz,an.x-cx)+t*0.7,nd=850+dlHash(t,an.x|0,an.z|0)*350,nx=cx+Math.cos(ang)*nd,nz=cz+Math.sin(ang)*nd;if(hAt(nx,nz)<2||(an.kind!=='crocodile'&&wdAt(nx,nz)>0))continue;an.x=nx;an.z=nz;an.y=hAt(nx,nz);an.home={x:nx,z:nz};an.tx=nx;an.tz=nz;if(an.o)an.o.position.set(nx,an.y,nz);break;}}}catch(e){}}

  /* ---------- MỘT BẢN ĐỒ TỔNG LỚN, PHÓNG TO THU NHỎ ĐƯỢC ----------
     Bảng Bản đồ trên đại lục chỉ có một bản đồ: cả đại lục, kéo để dời, lăn chuột / chụm hai ngón / nút + − để phóng. Phóng đủ gần thì hiện chi tiết tỉnh đang đứng
     (sông suối, đường nét địa hình), nhà cửa, làng, trại, cờ, thú cưỡi. Chạm vào bản đồ trong tỉnh đang đứng để cắm cờ dẫn đường.
     Lúc đang kéo, phóng thì vẽ tạm bằng ảnh vừa có (mượt), dừng tay 0,12 giây mới tính lại nét. */
  DL.mv=null;
  const DL_ZC=[[52,92,84],[30,128,52],[178,160,84],[120,158,64],[156,172,96]];
  function dlMV(){if(!DL.mv)DL.mv={z:1,cx:0,cz:0};const v=DL.mv,full=DL.R*2.1;v.z=Math.max(1,Math.min(48,v.z));const span=full/v.z,lim=full/2-span/2;v.cx=Math.max(-lim,Math.min(lim,v.cx));v.cz=Math.max(-lim,Math.min(lim,v.cz));return {span,x0:v.cx-span/2,z0:v.cz-span/2};}
  function dlMapSharp(){try{const cv=document.getElementById('dlmap');if(!cv||!DL.on)return;const V=dlMV(),n=180,off=DL.mapC||(DL.mapC=document.createElement('canvas'));off.width=off.height=n;const oc=off.getContext('2d'),im=oc.createImageData(n,n),d=im.data;
      for(let j=0;j<n;j++)for(let i=0;i<n;i++){const h=dlBase(V.x0+(i+0.5)/n*V.span,V.z0+(j+0.5)/n*V.span),k=(j*n+i)*4;let r,g,b;if(h<-20){r=38;g=84;b=120;}else if(h<0){r=64;g=124;b=156;}else if(h<8){r=188;g=178;b=132;}else if(h<230){if(h<90){r=66;g=112;b=50;}else{r=50;g=90;b=42;}/* nhuộm theo miền để nhìn bản đồ là thấy đại lục chia vùng */const cw=dlClim(V.x0+(i+0.5)/n*V.span,V.z0+(j+0.5)/n*V.span);for(let q=0;q<5;q++){const w=cw[q]*0.75;if(w>0){const C=DL_ZC[q];r+=(C[0]-r)*w;g+=(C[1]-g)*w;b+=(C[2]-b)*w;}}}else if(h<760){r=118;g=112;b=102;}else{r=236;g=240;b=246;}d[k]=r;d[k+1]=g;d[k+2]=b;d[k+3]=255;}
      oc.putImageData(im,0,0);DL.mapV={x0:V.x0,z0:V.z0,span:V.span};dlMapDraw();}catch(e){}}
  function dlMapDraw(){try{const cv=document.getElementById('dlmap');if(!cv||!DL.on)return;const pr=Math.min(2,devicePixelRatio||1),W=Math.max(200,Math.round(cv.clientWidth||340));if(cv.width!==Math.round(W*pr)){cv.width=cv.height=Math.round(W*pr);}const c=cv.getContext('2d');c.setTransform(pr,0,0,pr,0,0);
      const V=dlMV(),A=DL.TS*6,X=v=>(v-V.x0)/V.span*W,Z=v=>(v-V.z0)/V.span*W,k=W/V.span;c.fillStyle='#26547a';c.fillRect(0,0,W,W);
      if(DL.mapC&&DL.mapV){const m=DL.mapV;c.imageSmoothingEnabled=true;c.drawImage(DL.mapC,X(m.x0),Z(m.z0),m.span*k,m.span*k);}
      if(!DL.mapV||DL.mapV.x0!==V.x0||DL.mapV.z0!==V.z0||DL.mapV.span!==V.span){clearTimeout(DL.mapT);DL.mapT=setTimeout(dlMapSharp,DL.mapV?120:0);}
      /* phóng đủ gần: phủ ảnh chi tiết của tỉnh đang đứng */
      if(DL.mv.z>=5){try{const b=mapBase();if(b)c.drawImage(b,X(DL.ox-WSIZE/2),Z(DL.oz-WOZ),WSIZE*k,WSIZE*k);}catch(e){}}
      /* lưới tỉnh + tên tỉnh */
      c.strokeStyle='rgba(255,255,255,.18)';c.lineWidth=1;const i0=Math.floor(V.x0/A)-1,i1=Math.ceil((V.x0+V.span)/A)+1,j0=Math.floor(V.z0/A)-1,j1=Math.ceil((V.z0+V.span)/A)+1;
      for(let i=i0;i<=i1;i++){const p=X((i+0.5)*A);c.beginPath();c.moveTo(p,0);c.lineTo(p,W);c.stroke();}for(let j=j0;j<=j1;j++){const p=Z((j+0.5)*A);c.beginPath();c.moveTo(0,p);c.lineTo(W,p);c.stroke();}
      c.textAlign='center';c.textBaseline='middle';if(A*k>46){c.font='600 11px system-ui';c.fillStyle='rgba(255,255,255,.55)';for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){if(Math.hypot(i*A,j*A)>DL.R*1.02||dlBase(i*A,j*A)<0)continue;c.fillText(dlProvName(i*A,j*A),X(i*A),Z(j*A)-A*k*0.4);}}
      c.strokeStyle='#ffd27a';c.lineWidth=2;c.strokeRect(X(DL.ox-A/2),Z(DL.oz-A/2),A*k,A*k);
      const ico=(t,gx,gz,sz)=>{c.font=(sz||14)+'px system-ui';c.fillText(t,X(gx),Z(gz));};
      /* chơi chung: lãnh thổ theo tỉnh, cụm nhà người khác */
      try{if(typeof mpOn==='function'&&mpOn()){const dec=q=>/^q[a-z0-9]{2}$/.test(q)?[(parseInt(q[1],36)-18)*A,(parseInt(q[2],36)-18)*A]:null;c.font='bold 11px system-ui';
          for(const q in MP.landPop||{}){const o=dec(q);if(!o)continue;c.fillStyle='rgba(0,0,0,.55)';c.fillText('🚩'+MP.landPop[q],X(o[0])+1,Z(o[1])+A*k*0.38+1);c.fillStyle='#ffe9b0';c.fillText('🚩'+MP.landPop[q],X(o[0]),Z(o[1])+A*k*0.38);}
          c.fillStyle='#ff9a3a';for(const u in MP.players||{}){if(u===MP.uid||(typeof mpSeeDot==='function'&&!mpSeeDot(u)))continue;const fl=MP.players[u].fl||{};for(const q in fl){const o=dec(q),f=fl[q];if(!o||!f)continue;c.beginPath();c.arc(X(o[0]+f[0]),Z(o[1]+f[1]),3,0,7);c.fill();}}
          if(DL.mv.z>=5)for(const u in MP.claims||{}){const q=MP.claims[u];c.strokeStyle=u===MP.uid?'#f2c55a':'rgba(240,230,210,.8)';c.lineWidth=1.5;c.beginPath();c.arc(X(q.x+DL.ox),Z(q.z+DL.oz),q.r*k,0,7);c.stroke();}}}catch(e){}
      /* trong tỉnh đang đứng: nhà cửa, làng, trại, cờ, thú cưỡi */
      if(DL.mv.z>=6){c.fillStyle='#7a2e12';for(const b of S.builds||[]){const d=pieceDef(b.k);if(!d||d.kind==='edge'||d.kind==='roof'||d.kind==='corner')continue;const a=X(b.x+DL.ox),z=Z(b.z+DL.oz);if(a<0||z<0||a>W||z>W)continue;c.fillRect(a-1.5,z-1.5,3,3);}}
      if(G.village)ico('🛖',G.village.x+DL.ox,G.village.z+DL.oz);if(G.camp)ico('⚔️',G.camp.x+DL.ox,G.camp.z+DL.oz,13);if(S.mark)ico('📍',S.mark.x+DL.ox,S.mark.z+DL.oz);
      try{for(const m of S.mounts||[])if(m.x!=null&&G.mnt!==m&&(m.land||'c')===(S.land||'c'))ico(m.k==='elephant'?'🐘':'🐎',m.x+DL.ox,m.z+DL.oz,13);}catch(e){}
      if(S.dlSafe)ico('🏠',S.dlSafe.x,S.dlSafe.z);
      const px=X(P.x+DL.ox),pz=Z(P.z+DL.oz);c.fillStyle='#fff';c.strokeStyle='#000';c.lineWidth=1.5;c.beginPath();c.arc(px,pz,4.5,0,7);c.fill();c.stroke();c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.moveTo(px,pz);c.lineTo(px+Math.sin(P.ry||0)*11,pz+Math.cos(P.ry||0)*11);c.stroke();}catch(e){}}
  function dlMapZoom(f,gx,gz){const v=DL.mv||(DL.mv={z:1,cx:0,cz:0}),nz=Math.max(1,Math.min(48,v.z*f));if(gx!=null){const kk=1-v.z/nz;v.cx+=(gx-v.cx)*kk;v.cz+=(gz-v.cz)*kk;}v.z=nz;dlMapDraw();}
  if(typeof mapHtml==='function'){const _mh=mapHtml;mapHtml=function(){let h=_mh.apply(this,arguments);try{if(DL.on){if(!DL.mv)DL.mv={z:6,cx:P.x+DL.ox,cz:P.z+DL.oz};
        h=`<div class="landbox dl-map"><b>🌏 Đại lục · ${esc('Tỉnh '+dlProvName(DL.ox,DL.oz))} · ${(z=>z.ic+' '+esc(z.n))(dlZoneAt(DL.ox+P.x,DL.oz+P.z))}</b><div class="dl-zl small">❄️ Lạnh phương Bắc · 🌴 Nhiệt đới · 🌾 Thảo nguyên · 🎋 Đồi tre · 🌼 Đồng hoa · 🌳 Ôn hoà</div><div class="dl-mw"><canvas id="dlmap"></canvas><div class="dl-mb"><button class="btn sm" data-a="dlz" data-v="in">＋</button><button class="btn sm" data-a="dlz" data-v="out">−</button><button class="btn sm" data-a="dlz" data-v="me" title="Về chỗ mình">◎</button><button class="btn sm" data-a="dlz" data-v="all" title="Cả đại lục">🌏</button></div></div>
          <span class="small muted">Kéo để dời, lăn chuột hoặc chụm hai ngón để phóng. Khung vàng: tỉnh đang đứng · chấm trắng: bạn · 🏠 nơi bắt đầu · 🚩 số lãnh thổ · chấm cam: nhà người khác. Chạm vào bản đồ trong tỉnh đang đứng để cắm cờ 📍 dẫn đường.</span></div>
          <details class="dl-old"><summary>Lãnh địa, tài nguyên và bản đồ chi tiết của tỉnh</summary>${h.replace(/ Cổng sang vùng khác có dấu ⛩️ trên bản đồ: [^<]*/,'')}</details>`;setTimeout(dlMapDraw,60);}}catch(e){}return h;};}
  (function(){try{const st=document.createElement('style');st.textContent='.dl-map .dl-mw{position:relative;margin:8px 0 6px}.dl-map #dlmap{width:100%;aspect-ratio:1/1;max-height:72vh;display:block;border-radius:12px;touch-action:none;cursor:grab;background:#26547a}.dl-map .dl-mb{position:absolute;right:8px;top:8px;display:flex;flex-direction:column;gap:6px}.dl-map .dl-mb .btn{min-width:38px;padding:6px 0;font-size:17px;font-weight:700;color:#fff;background:rgba(30,24,18,.86);border:1px solid rgba(255,210,122,.5)}.dl-old{margin-top:8px}.dl-old>summary{cursor:pointer;padding:8px 4px;opacity:.85}';document.head.appendChild(st);
    const pts=new Map();let moved=0,pd=0;const g=(e,cv)=>{const r=cv.getBoundingClientRect(),V=dlMV();return [V.x0+(e.clientX-r.left)/r.width*V.span,V.z0+(e.clientY-r.top)/r.height*V.span,r];};
    document.addEventListener('pointerdown',e=>{const cv=e.target&&e.target.id==='dlmap'?e.target:null;if(!cv)return;pts.set(e.pointerId,[e.clientX,e.clientY]);if(pts.size===1)moved=0;if(pts.size===2){const a=[...pts.values()];pd=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);}try{cv.setPointerCapture(e.pointerId);}catch(er){}},true);
    document.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;const cv=document.getElementById('dlmap');if(!cv)return;const p=pts.get(e.pointerId),r=cv.getBoundingClientRect(),V=dlMV();if(pts.size===1){const dx=e.clientX-p[0],dy=e.clientY-p[1];moved+=Math.abs(dx)+Math.abs(dy);DL.mv.cx-=dx/r.width*V.span;DL.mv.cz-=dy/r.height*V.span;pts.set(e.pointerId,[e.clientX,e.clientY]);dlMapDraw();}
      else if(pts.size===2){pts.set(e.pointerId,[e.clientX,e.clientY]);const a=[...pts.values()],d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);if(pd>0&&d>0){const mx=(a[0][0]+a[1][0])/2,my=(a[0][1]+a[1][1])/2;moved+=9;dlMapZoom(d/pd,V.x0+(mx-r.left)/r.width*V.span,V.z0+(my-r.top)/r.height*V.span);}pd=d;}},true);
    const up=e=>{if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);const cv=document.getElementById('dlmap');if(cv&&pts.size===0&&moved<=6&&e.type==='pointerup'){const [gx,gz]=g(e,cv),lx=gx-DL.ox,lz=gz-DL.oz;if(Math.hypot(lx,lz)<WR){S.mark={x:+lx.toFixed(0),z:+lz.toFixed(0)};try{sfx('pick');}catch(er){}uiToast('📍 Đã cắm cờ: la bàn sẽ chỉ hướng tới đó.','');save();dlMapDraw();}else uiToast('Chỗ đó thuộc tỉnh khác: đi sang tỉnh đó rồi mới cắm cờ được.','');}};
    document.addEventListener('pointerup',up,true);document.addEventListener('pointercancel',up,true);
    document.addEventListener('wheel',e=>{const cv=e.target&&e.target.id==='dlmap'?e.target:null;if(!cv)return;e.preventDefault();const [gx,gz]=g(e,cv);dlMapZoom(e.deltaY<0?1.25:0.8,gx,gz);},{passive:false,capture:true});
    document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="dlz"]');if(!b)return;e.stopImmediatePropagation();const v=b.dataset.v;if(v==='in')dlMapZoom(1.6);else if(v==='out')dlMapZoom(1/1.6);else if(v==='me'){DL.mv={z:Math.max(8,DL.mv?DL.mv.z:8),cx:P.x+DL.ox,cz:P.z+DL.oz};dlMapDraw();}else{DL.mv={z:1,cx:0,cz:0};dlMapDraw();}},true);
    document.addEventListener('toggle',e=>{try{if(e.target&&e.target.classList&&e.target.classList.contains('dl-old')&&e.target.open&&typeof mapDraw==='function')setTimeout(mapDraw,50);}catch(er){}},true);}catch(e){}})();
  /* ===================== đợt 3: ĐI KHẮP ĐẠI LỤC =====================
     Game vẫn dựng đầy đủ cây đá, thú trong một "vùng nạp" bán kính ~370 m quanh điểm neo. Đi gần tới mép vùng (80% bán kính) thì DỜI ĐIỂM NEO về chỗ đang đứng
     rồi nạp lại vùng mới (qua màn hố đen, như qua cổng nhưng không có cổng, đất liền nối nhau). Mọi thứ có vị trí (nhà, nền san, dân, vật nuôi, thú cưỡi, cờ)
     được quy đổi toạ độ nên vẫn nằm đúng chỗ trên đại lục; trạng thái cây đá đã chặt, bản đồ đã khám phá được nhớ riêng theo từng điểm neo. */
  function dlSeedAt(ox,oz){const s0=(S.seed0||S.seed)|0;return ((Math.imul(s0,31)^Math.imul(Math.round(ox/DL.TS),73856093)^Math.imul(Math.round(oz/DL.TS),19349663))>>>0)%2000000000+1;}
  const DL_PER=['res','disc','fogm','khu','rlm','war','plants','boats','recruited'];
  function dlShift(){try{if(!DL.on||DL.busy||!S||!S.dl)return false;DL.shiftAt=performance.now();dlResOut();const A=dlA(),dx=Math.round((S.dl.ox+P.x)/A)*A-S.dl.ox,dz=Math.round((S.dl.oz+P.z)/A)*A-S.dl.oz;if(!dx&&!dz)return false;DL.busy=1;
      const k0=S.dl.ox+','+S.dl.oz,nox=S.dl.ox+dx,noz=S.dl.oz+dz,k1=nox+','+noz;S.dlA=S.dlA||{};const keep={};for(const k of DL_PER)if(S[k]!==undefined)keep[k]=S[k];S.dlA[k0]=keep;const nx=S.dlA[k1]||{};
      for(const k of DL_PER){if(nx[k]!==undefined)S[k]=nx[k];else if(typeof LD_DEF==='object'&&LD_DEF[k])S[k]=LD_DEF[k]();else delete S[k];}delete S.dlA[k1];
      const mv=o=>{if(o&&typeof o.x==='number'&&typeof o.z==='number'){o.x=+(o.x-dx).toFixed(1);o.z=+(o.z-dz).toFixed(1);}};
      P.x-=dx;P.z-=dz;if(S.p){S.p.x=+P.x.toFixed(1);S.p.z=+P.z.toFixed(1);}
      for(const b of S.builds||[])mv(b);for(const f of S.flat||[])mv(f);for(const g of S.dig||[])mv(g);for(const t of S.tun||[]){t.ax-=dx;t.az-=dz;t.bx-=dx;t.bz-=dz;}for(const f of S.folk||[]){mv(f);if(typeof f.hx==='number'){f.hx-=dx;f.hz-=dz;}}
      for(const q of S.pets||[]){mv(q);if(typeof q.hx==='number'){q.hx=+(q.hx-dx).toFixed(1);q.hz=+(q.hz-dz).toFixed(1);}}for(const m of S.mounts||[])mv(m);mv(S.mark);
      if(S.army&&typeof S.army.hx==='number'){S.army.hx-=dx;S.army.hz-=dz;}
      S.dl={ox:nox,oz:noz};S.seed=dlSeedAt(nox,noz);S.land=dlKey(nox,noz);/* thú cưỡi (ngựa, voi) ở đại lục dùng chung một hệ toạ độ đã dời ở trên: ghi lại tỉnh mới, không thì con đang cưỡi bị coi là ở tỉnh cũ và người chơi rớt xuống đất */try{for(const m of S.mounts||[])if(m&&m.x!=null)m.land=S.land;if(G.mnt){G.mnt.x=+P.x.toFixed(1);G.mnt.z=+P.z.toFixed(1);S.mntOn=G.mnt.id;}}catch(e){}S.wx=null;G.walkTo=null;G.act=null;try{if(typeof AQ==='object'&&AQ.on)aqStop();}catch(e){}
      /* cách nhanh: dựng lại vùng mới ngay trong trang (không tải lại, giữ bộ vẽ, mô hình, shader). Cứ 6 lần thì tải lại trang một lần để dọn bộ nhớ đồ hoạ; lỗi giữa chừng cũng quay về cách tải lại. */
      if(!DL.noIn&&(DL.inN|0)<6){/* không che màn hình: khung vẽ giữ nguyên hình đang thấy trong lúc dựng vùng mới (1-2 giây), chỉ hiện một dòng báo nhỏ */try{dlCard(nox,noz);}catch(e){}if(typeof saveNow==='function')saveNow();else save();DL.inN=(DL.inN|0)+1;G.ldLeaving=1;/* giữ màn hố đen tới khi dựng xong */setTimeout(()=>{let ok=false;try{ok=dlRebuild();}catch(e){console.warn('dựng lại tại chỗ',e);}if(ok){DL.busy=0;G.ldLeaving=0;try{dlCardOff();}catch(e){}DL.doneMs=Math.round(performance.now()-DL.shiftAt);DL.shiftAt=0;try{ldHoleOff();}catch(e){}try{save();}catch(e){}}else{DL.noIn=1;try{dlCardOff(1);ldHole('Đang nạp vùng đất kế tiếp…');}catch(e){}try{sessionStorage.setItem('ld-cont','1');sessionStorage.setItem('ld-cont-n','vùng đất kế tiếp');sessionStorage.removeItem('ldtt-autoh');}catch(e){}G.ldLeaving=2;location.reload();}},320);return true;}
      try{ldHole('Đang nạp vùng đất kế tiếp…');sessionStorage.setItem('ld-cont-n','vùng đất kế tiếp');}catch(e){}
      G.ldLeaving=1;if(typeof saveNow==='function')saveNow();else save();G.ldLeaving=2;try{sessionStorage.setItem('ld-cont','1');sessionStorage.removeItem('ldtt-autoh');}catch(e){}
      const go=()=>{if(G.ldGone)return;G.ldGone=1;try{location.reload();}catch(e){}};
      try{const id=typeof curSlot==='function'&&curSlot(),raw=localStorage.getItem(SKEY);if(id)sessionStorage.setItem('ld-cont-id',id);if(id&&raw&&typeof LIDB==='object'&&LIDB.ok){const tx=LIDB.db.transaction('s','readwrite');tx.objectStore('s').put({raw,ts:Date.now()+5},SKEY+'#'+id);tx.oncomplete=()=>setTimeout(go,350);}}catch(e){}
      setTimeout(go,2500);return true;}catch(e){console.warn('dời điểm neo',e);DL.busy=0;return false;}}
  /* nhà sàn của làng tỉnh bên (chỉ là nhà, chưa có người) */
  function dlNbvObjs(){try{if(!DL.on||!G.sc||!G.terrain||!DL.nbv||DL.nbvSc===G.sc)return;DL.nbvSc=G.sc;if(!DL.nbv.length)return;const T=THREE,hut=new T.Group(),add=(id,x,y,z,ry)=>{const g=model(['piece',id]);g.position.set(x,y,z);g.rotation.y=ry||0;hut.add(g);};
      add('stilt',0,0,0);add('bambooWall',0,60,-20,0);add('bambooWall',-20,60,0,Math.PI/2);add('bambooWall',20,60,0,-Math.PI/2);add('bambooWallDoor',0,60,20,0);add('roofCap',0,60,0);add('ladder',0,0,22,Math.PI);
      for(const v of DL.nbv)for(let i=0;i<7;i++){const a=i/7*6.283+0.3,x=v.x+Math.cos(a)*150,z=v.z+Math.sin(a)*150,o=hut.clone(true);o.position.set(x,hAt(x,z)-1,z);o.rotation.y=Math.round(Math.atan2(v.x-x,v.z-z)/(Math.PI/2))*Math.PI/2;G.sc.add(o);try{seasonPatchAll(o);}catch(e){}}}catch(e){console.warn('nhà làng tỉnh bên',e);}}
  setInterval(()=>{try{if(typeof G==='object'&&G.on)dlNbvObjs();}catch(e){}},2500);
  /* MÀN CHUYỂN TỈNH: thay vì hình đứng im vài giây, phủ một lớp sương mờ dần, giữa màn hiện tấm biển tên tỉnh + miền sắp tới và một vệt sáng chạy.
     Vệt sáng và độ mờ chạy bằng transform / opacity nên vẫn chuyển động mượt trong lúc trang đang bận dựng vùng mới. Dựng xong thì sương tan dần. */
  function dlCard(ox,oz){let el=document.getElementById('dlcard');if(!el){el=document.createElement('div');el.id='dlcard';document.body.appendChild(el);const st=document.createElement('style');st.textContent=`#dlcard{position:fixed;inset:0;z-index:9500;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:0;transition:opacity .28s ease;background:radial-gradient(ellipse at 50% 45%,rgba(40,52,44,.72),rgba(12,16,14,.94))}
#dlcard.on{opacity:1}#dlcard.out{opacity:0;transition:opacity .7s ease}#dlcard .dc{min-width:230px;max-width:82vw;padding:18px 26px 16px;border-radius:18px;text-align:center;background:linear-gradient(180deg,rgba(60,48,34,.96),rgba(30,24,18,.96));border:1px solid rgba(255,210,122,.55);box-shadow:0 14px 40px rgba(0,0,0,.6);transform:translateY(8px) scale(.97);transition:transform .35s ease;font-family:system-ui,sans-serif;color:#f4ead6}
#dlcard.on .dc{transform:none}#dlcard .dc small{display:block;font-size:11px;letter-spacing:3px;color:#ffd27a;opacity:.9}#dlcard .dc b{display:block;font-size:26px;margin:4px 0 2px;color:#fff}#dlcard .dc span{display:block;font-size:14.5px;color:#e9dcc0}#dlcard .dc u{display:block;font-size:34px;line-height:1.1;text-decoration:none;margin-bottom:2px}
#dlcard .dc i{display:block;position:relative;height:4px;margin-top:12px;border-radius:2px;background:rgba(255,255,255,.14);overflow:hidden}#dlcard .dc i:after{content:'';position:absolute;top:0;bottom:0;left:0;width:40%;border-radius:2px;background:linear-gradient(90deg,transparent,#ffd27a,transparent);animation:dlcrun 1.1s linear infinite;will-change:transform}@keyframes dlcrun{from{transform:translateX(-110%)}to{transform:translateX(280%)}}`;document.head.appendChild(st);}
    let z={ic:'🧭',n:''};try{z=dlZoneAt(ox+P.x-(ox-S.dl.ox),oz+P.z-(oz-S.dl.oz));}catch(e){}el.innerHTML=`<div class="dc"><u>${z.ic}</u><small>ĐANG TỚI</small><b>Tỉnh ${esc(dlProvName(ox,oz))}</b><span>${esc(z.n)}</span><i></i></div>`;el.classList.remove('out');void el.offsetWidth;el.classList.add('on');}
  function dlCardOff(now){const el=document.getElementById('dlcard');if(!el)return;if(now){el.remove();return;}el.classList.remove('on');el.classList.add('out');setTimeout(()=>{try{if(el.classList.contains('out'))el.remove();}catch(e){}},800);}
  /* TÍNH SẴN ĐỘ CAO VÙNG SẮP TỚI: khi người chơi đã đi quá nửa đường ra ranh giới, mỗi nhịp tính sẵn hai mảnh độ cao của vùng nạp kế tiếp (lúc rảnh, ~10 ms mỗi nhịp).
     Tới lúc sang tỉnh thì các mảnh đã có sẵn, không phải tính nữa. */
  setInterval(()=>{try{if(!DL.on||typeof G!=='object'||!G.on||DL.busy||G.ldLeaving||!S||!S.dl)return;const A=dlA(),ax=Math.abs(P.x),az=Math.abs(P.z);if(Math.max(ax,az)<2400)return;const tox=S.dl.ox+(ax>=az?Math.sign(P.x)*A:0),toz=S.dl.oz+(ax>=az?0:Math.sign(P.z)*A),key=tox+','+toz;
      if(!DL.pw||DL.pw.key!==key)DL.pw={key,i:0};const TS=DL.TS,t0x=Math.floor((tox-WSIZE/2)/TS),t0z=Math.floor((toz-WSIZE/2)/TS),n=Math.ceil(WSIZE/TS)+1;let made=0;while(DL.pw.i<n*n&&made<2){const tx=t0x+DL.pw.i%n,tz=t0z+Math.floor(DL.pw.i/n);DL.pw.i++;if(!DL.tiles.has(tx+','+tz)){dlTile(tx,tz);made++;}}}catch(e){}},300);
  /* dòng báo nhỏ phía trên màn hình (thay cho màn đen) khi sang tỉnh bên */
  function dlChip(txt,ms){let el=document.getElementById('dlchip');if(!txt){if(el)el.remove();return;}if(!el){el=document.createElement('div');el.id='dlchip';el.style.cssText='position:fixed;left:50%;top:max(64px,calc(env(safe-area-inset-top) + 56px));transform:translateX(-50%);z-index:9000;padding:8px 14px;border-radius:999px;background:rgba(20,14,9,.86);border:1px solid rgba(242,197,90,.6);color:#ffe2a8;font:700 13.5px system-ui,sans-serif;white-space:nowrap;pointer-events:none;box-shadow:0 4px 14px rgba(0,0,0,.5)';document.body.appendChild(el);}el.textContent=txt;clearTimeout(DL.chipT);if(ms)DL.chipT=setTimeout(()=>{try{el.remove();}catch(e){}},ms);}
  /* dựng lại thế giới quanh điểm neo mới ngay trong trang */
  function dlRebuild(){const t0=performance.now(),old=G.sc,olds=[G.terrain,G.water,DL.ring,DL.sea,G.grass];G.on=false;
    try{SI.clear();RI.clear();BYID.clear();OCC.cell.clear();OCC.edge.clear();}catch(e){}
    try{if(typeof MT==='object')MT.o.clear();}catch(e){}try{if(typeof L4==='object'&&L4.po)L4.po.clear();}catch(e){}try{if(typeof SL3==='object')SL3.rest.clear();}catch(e){}try{if(typeof LD==='object')LD.objs.length=0;}catch(e){}
    try{for(const q of S.pets||[]){q._o=null;}for(const f of S.folk||[]){f._o=null;f._rig=null;}}catch(e){}
    try{if(typeof LT==='object'){LT.o=null;LT.id=null;}}catch(e){}try{if(typeof KP==='object')KP.sig='';}catch(e){}try{if(typeof T3==='object'){T3.rocks=[];T3.brooks=[];T3.wmats=[];T3.mist=null;T3.smoke=null;T3.terr=null;}}catch(e){}
    G.grass=null;G.gLast=null;DL.ring=null;DL.sea=null;G.animals=[];G.foes=[];G.npcs=[];G.village=null;G.camp=null;MAPIMG=null;G.mapDet=null;
    /* làng, trại cướp, thú rừng không cần có ngay lúc cảnh hiện ra: tạm gác lại, dựng nối tiếp ngay sau đó (mỗi thứ một nhịp) để người chơi thấy vùng mới sớm hơn ~1 giây */
    const later=[],o1=villageInit,o2=campInit,o3=animalsInit;villageInit=function(){later.push(()=>{o1();try{if(typeof villageGrow==='function')villageGrow();}catch(e){}});};campInit=function(){later.push(o2);};animalsInit=function(){later.push(o3);};
    G._reuse=1;try{sceneInit();}finally{G._reuse=0;villageInit=o1;campInit=o2;animalsInit=o3;}
    DL.later=later.length;later.forEach((f,i)=>setTimeout(()=>{try{f();}catch(e){console.warn('dựng nối tiếp',e);}DL.later--;},60+i*90));
    try{uiHud(true);uiHotbar();}catch(e){}
    /* bỏ cảnh cũ: trả bộ nhớ đồ hoạ của mọi lưới trong cảnh cũ. Khuôn dùng chung (thú, người) còn giữ dữ liệu nên lần vẽ sau tự nạp lại; lưới mặt đất cũ thì bỏ hẳn. */
    try{const seen=new Set();old.traverse(m=>{const g=m.geometry;if(g&&g.dispose&&!seen.has(g)){seen.add(g);try{g.dispose();}catch(e){}}});for(const o of olds){if(o&&o.parent)o.parent.remove(o);}}catch(e){}
    try{if(typeof mpLandRefresh==='function')mpLandRefresh();}catch(e){}
    DL.lastMs=Math.round(performance.now()-t0);return G.on===true;}
  setInterval(()=>{try{if(DL.on&&typeof G==='object'&&G.on&&!G.ldLeaving&&!DL.busy&&P.model&&G.animals&&G.animals.length){const el=document.getElementById('ldhole');if(el&&!el.classList.contains('out')){ldHoleOff();if(DL.shiftAt){DL.doneMs=Math.round(performance.now()-DL.shiftAt);DL.shiftAt=0;}}}}catch(e){}},200);
  setInterval(()=>{try{if(!DL.on||typeof G!=='object'||!G.on||G.ldLeaving||DL.busy||!S||G.work||G.build||G.panel)return;/* sang hẳn địa phận tỉnh bên (quá ranh giới 25 m) thì chuyển tỉnh */const A=dlA(),nx=Math.round((S.dl.ox+P.x)/A)*A-S.dl.ox,nz=Math.round((S.dl.oz+P.z)/A)*A-S.dl.oz;if((nx||nz)&&Math.hypot(P.x,P.z)-Math.hypot(P.x-nx,P.z-nz)>1000)dlShift();}catch(e){}},700);

}

