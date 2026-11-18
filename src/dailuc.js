/* ===================== dailuc: ĐẠI LỤC LIỀN, DỰNG THEO MẢNH (đợt 1: lõi địa hình) =====================
   Thế giới hiện tại dựng cả bản đồ một lần (mỗi chiều chưa tới 1 km) rồi giữ hết trong bộ nhớ. Đại lục mới rộng 6 km × 6 km (gấp ~40 lần diện tích),
   không cổng, không màn hình tải: máy chỉ tính phần đất quanh người chơi.
   Tệp này là phần LÕI, chưa nối vào game:
     · dlBase(x,z)   độ cao tại một điểm bất kỳ, tính thẳng từ hạt giống (không cần dựng trước cả bản đồ): bờ biển, đồng bằng, đồi, dãy núi có vách tầng,
                     thung lũng sông khoét xuống tới mực nước, hồ.
     · dlTile(tx,tz) một MẢNH 64×64 ô (1920 đơn vị mỗi chiều): mảng độ cao + mực nước, tính khi cần, nhớ tối đa DL.cap mảnh gần đây nhất.
     · dlH / dlW     độ cao / mực nước tại điểm, lấy từ mảnh (nội suy như hAt cũ nên mặt đất liền nhau qua mép mảnh).
   Các đợt sau: lưới mặt đất theo mảnh, cây đá theo mảnh, thú - làng theo mảnh, bản đồ, nhiều người chơi. */
const DL={seed:1,R:60000,HS:30,TN:64,cap:121,tiles:new Map(),tick:0,made:0};
DL.TS=DL.HS*DL.TN;
/* nhiễu giá trị có đạo hàm mượt, tự chứa (không phụ thuộc bộ nhiễu của thế giới cũ) */
function dlHash(ix,iz,s){let h=(Math.imul(ix,374761393)^Math.imul(iz,668265263)^Math.imul(s,2147483647))|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296;}
function dlN(x,z,s){const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz,u=fx*fx*fx*(fx*(fx*6-15)+10),v=fz*fz*fz*(fz*(fz*6-15)+10);
  const a=dlHash(ix,iz,s),b=dlHash(ix+1,iz,s),c=dlHash(ix,iz+1,s),d=dlHash(ix+1,iz+1,s);return (a+(b-a)*u+(c-a+(d-c-b+a)*u)*v)*2-1;}
function dlFbm(x,z,o,s){let v=0,a=0.5,f=1,t=0;for(let i=0;i<o;i++){v+=dlN(x*f,z*f,s+i*17)*a;t+=a;a*=0.5;f*=2.03;}return v/t;}
function dlRidge(x,z,o,s){let v=0,a=0.5,f=1,t=0;for(let i=0;i<o;i++){const n=1-Math.abs(dlN(x*f,z*f,s+i*29));v+=n*n*a;t+=a;a*=0.5;f*=2.1;}return v/t;}
const dlSS=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
function dlBase(x,z){const s=DL.seed,R=DL.R;
  /* lục địa: lớn dần từ tâm, mép vỡ thành vịnh, bán đảo, đảo ven bờ */
  const r=Math.hypot(x,z)/R,cont=1-dlSS(0.62,1.0,r+dlFbm(x/9000+3,z/9000-7,4,s+1)*0.33);
  if(cont<=0.02)return -40-20*(1-cont);
  /* nền: đồng bằng nhấp nhô + đồi */
  let h=14+dlFbm(x/2600,z/2600,4,s+11)*26+dlFbm(x/700+5,z/700+9,3,s+23)*10+dlFbm(x/170,z/170,2,s+31)*2.5;
  const hill=dlSS(0.05,0.5,dlFbm(x/4200+13,z/4200-4,3,s+41));h+=hill*(40+dlFbm(x/900,z/900,3,s+43)*45);
  /* dãy núi: vài vành đai lớn; trong vành đai là sống núi sắc */
  const belt=dlSS(0.18,0.5,dlFbm(x/7500-21,z/7500+15,3,s+53));if(belt>0){const rg=dlRidge(x/2300+2,z/2300-5,5,s+59);h+=belt*(90+rg*rg*1250);}
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
function dlInit(seed){DL.seed=(seed|0)||1;DL.tiles.clear();DL.tick=0;DL.made=0;}
if(typeof module!=='undefined')module.exports={DL,dlBase,dlTile,dlH,dlW,dlInit};
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
  function dlKey(ox,oz){const A=dlA();return 'q'+(Math.round(ox/A)+18).toString(36)+(Math.round(oz/A)+18).toString(36);}
  function dlAnchor(seed,pick){dlInit(seed);const A=dlA(),L=[];for(let ix=-8;ix<=8;ix++)for(let iz=-8;iz<=8;iz++){const ox=ix*A,oz=iz*A;if(Math.hypot(ox,oz)>DL.R*0.55)continue;const h=dlBase(ox,oz);if(h<8||h>70)continue;let land=0,wat=0,hi=0,n=0;for(let i=0;i<48;i++){const b=i*0.131*6.283,d=600+(i%6)*1000,hh=dlBase(ox+Math.cos(b)*d,oz+Math.sin(b)*d);n++;if(hh<0)wat++;else{land++;if(hh>230)hi++;}}
      const sc=land/n*3+Math.min(0.2,wat/n)*4-hi/n*2-Math.abs(h-25)/60;L.push({ox,oz,sc});}L.sort((a,b)=>b.sc-a.sc);if(!L.length)return {ox:0,oz:0};/* chơi chung: rải người vào 16 tỉnh tốt nhất theo mã người chơi, khỏi dồn một chỗ */const top=L.slice(0,40);return pick!=null?top[Math.floor(dlHash(pick,5,seed)*top.length)%top.length]:top[0];}
  {const _wc=worldCfg;worldCfg=function(v){DL.on=!!(typeof S==='object'&&S&&S.dl);if(!DL.on)return _wc.apply(this,arguments);const r=_wc.call(this,3);DL.HS=HSTEP;DL.TN=48;DL.TS=DL.HS*DL.TN;dlInit(S.seed0||S.seed);DL.ox=S.dl.ox;DL.oz=S.dl.oz;return r;};}
  {const _bh=baseH;baseH=function(x,z){return DL.on?dlBase(x+DL.ox,z+DL.oz):_bh(x,z);};}
  {const _rp=riversPlan;riversPlan=function(seed){if(!DL.on)return _rp.apply(this,arguments);RIV=[];RBK=null;WFALLS=[];let best=null;for(let r=0;r<2600&&!best;r+=120)for(let i=0;i<12;i++){const a=i/12*6.283+r,x=Math.cos(a)*r,z=Math.sin(a)*r,h=dlBase(x+DL.ox,z+DL.oz);if(h>6&&h<70&&Math.abs(dlBase(x+60+DL.ox,z+DL.oz)-h)<10&&Math.abs(dlBase(x+DL.ox,z+60+DL.oz)-h)<10){best=[x,z];break;}}SPAWN=best||[0,0];
      /* SUỐI NÚI: từ vài điểm cao nhất của tỉnh, cho nước chảy theo chiều dốc nhất xuống tới sông hồ, biển. Lòng suối được khoét bằng bộ sông sẵn có của game;
         chỗ suối đổ qua vách tầng thành THÁC (bộ vẽ thác, bụi nước sẵn có). Tính từ hạt giống nên ai trong tỉnh cũng thấy cùng dòng suối. */
      try{const H=(x,z)=>dlBase(x+DL.ox,z+DL.oz),tops=[];for(let i=-9;i<=9;i++)for(let j=-9;j<=9;j++){const x=i*700,z=j*700;if(Math.hypot(x,z)>WR*0.82)continue;const h=H(x,z);if(h>110)tops.push([h,x,z]);}tops.sort((a,b)=>b[0]-a[0]);const st=[];for(const t of tops){if(st.length>=3)break;if(st.every(q=>Math.hypot(q[1]-t[1],q[2]-t[2])>2400))st.push(t);}
        st.forEach((t,si)=>{let x=t[1],z=t[2],dir=dlHash(si,3,S.seed|0)*6.283,h=t[0],lastH=t[0];const pts=[[x,z]];for(let n=0;n<420;n++){let bd=dir,bh=1e9;for(let k=-5;k<=5;k++){const a=dir+k*0.26,hh=H(x+Math.cos(a)*70,z+Math.sin(a)*70)+Math.abs(k)*0.6;if(hh<bh){bh=hh;bd=a;}}dir=bd;x+=Math.cos(dir)*36;z+=Math.sin(dir)*36;pts.push([x,z]);h=H(x,z);if(h<0.5||Math.hypot(x,z)>WR*0.97)break;/* 30 bước liền không xuống thêm được 5 đơn vị: nước đọng lại thành vũng cuối, dừng dòng ở đây */if(n%30===0){if(n&&lastH-h<5)break;lastH=h;}}
          if(pts.length<14)return;if(pts.some(q=>Math.hypot(q[0]-SPAWN[0],q[1]-SPAWN[1])<380))return;RIV.push({id:'suoi'+si,n:['Suối Đầu Nguồn','Suối Đá','Suối Mây'][si]||'Suối',pts,w:[11,26],dep:4.5,sea:1,s:null});});
        if(RIV.length){RBK=new Map();const C=400;RIV.forEach((r,ri)=>{for(let k=0;k<r.pts.length-1;k++){const [ax,az]=r.pts[k],[bx,bz]=r.pts[k+1],m=200;for(let i=Math.floor((Math.min(ax,bx)-m)/C);i<=Math.floor((Math.max(ax,bx)+m)/C);i++)for(let j=Math.floor((Math.min(az,bz)-m)/C);j<=Math.floor((Math.max(az,bz)+m)/C);j++){const key=i+','+j;if(!RBK.has(key))RBK.set(key,[]);RBK.get(key).push(ri,k);}}});}}catch(e){console.warn('suối núi',e);RIV=[];RBK=null;}};}
  /* các vùng có tên của một vùng nạp, đặt theo địa hình thật quanh điểm neo: làng lái buôn và trại cướp trên đất bằng khô ráo, hồ ở chỗ có nước, núi ở chỗ cao, rừng, đồng cỏ */
  function dlFlat(tx,tz,rad){let best=null;for(let r=0;r<=rad;r+=110){const n=r?Math.max(6,Math.round(r/70)):1;for(let i=0;i<n;i++){const a=i/n*6.283+r*0.13,x=tx+Math.cos(a)*r,z=tz+Math.sin(a)*r;if(Math.hypot(x,z)>WR*0.72)continue;const h=hAt(x,z);if(h<6||h>140||wdAt(x,z)>0||slopeAt(x,z)>0.22)continue;let ok=true;for(let k=0;k<8;k++){const bx=x+Math.cos(k*0.785)*150,bz=z+Math.sin(k*0.785)*150;if(wdAt(bx,bz)>0||Math.abs(hAt(bx,bz)-h)>30){ok=false;break;}}if(ok)return [x,z];if(!best)best=[x,z];}}return best;}
  function dlFind(test,minD,maxD){for(let r=minD;r<=maxD;r+=160)for(let i=0;i<20;i++){const a=i/20*6.283+r*0.07,x=SPAWN[0]+Math.cos(a)*r,z=SPAWN[1]+Math.sin(a)*r;if(Math.hypot(x,z)>WR*0.8)continue;if(test(x,z))return [x,z];}return null;}
  {const _rb=regionsBuild;regionsBuild=function(){if(!DL.on)return _rb.apply(this,arguments);const R=[{id:'start',n:'Bến Khởi Đầu',d:'Nơi bạn dừng chân trên đại lục.',ic:'🔥',x:SPAWN[0],z:SPAWN[1],r:260}];
      try{const sd=(S.seed|0),a0=dlHash(sd,1,3)*6.283,far=(p,d)=>p&&R.every(g=>Math.hypot(g.x-p[0],g.z-p[1])>d);
        const add=(id,n,d,ic,p,r)=>{if(p)R.push({id,n,d,ic,x:p[0],z:p[1],r});};
        const v=dlFlat(SPAWN[0]+Math.cos(a0)*1900,SPAWN[1]+Math.sin(a0)*1900,1500);if(far(v,900))add('village','Làng Ven Sông','Làng của người bản địa: đổi hàng, nghe chuyện, học nghề.','🛖',v,230);
        const c=dlFlat(SPAWN[0]+Math.cos(a0+2.6)*3000,SPAWN[1]+Math.sin(a0+2.6)*3000,1700);if(far(c,1100))add('camp','Trại Cướp','Bọn cướp đóng trại ở đây. Có vũ khí, có người hãy tới.','⚔️',c,260);
        const lk=dlFind((x,z)=>hAt(x,z)<-3&&hAt(x+200,z)<0&&hAt(x,z+200)<0,500,5200);if(far(lk,600))add('lake','Vùng Nước Lớn','Sông hồ rộng: cá, đất sét, lau sậy.','🌊',lk,420);
        const mt=dlFind((x,z)=>hAt(x,z)>300,700,5600);if(far(mt,700))add('range','Dãy Núi Đá','Núi cao vách dựng: đá, đá lửa, quặng. Lạnh, dốc.','⛰️',mt,700);
        const fr=dlFind((x,z)=>{const b=biome(x,z);return b==='forest'||b==='jungle';},600,4200);if(far(fr,700))add('forest','Rừng Già','Rừng rậm: gỗ tốt, thú săn, mật ong.','🌲',fr,520);
        const md=dlFind((x,z)=>biome(x,z)==='meadow'&&slopeAt(x,z)<0.15,900,4200);if(far(md,700))add('savanna','Đồng Cỏ Lớn','Đồng cỏ thoáng: thú ăn cỏ từng đàn, dễ dựng làng.','🌾',md,520);
      }catch(e){console.warn('vùng đại lục',e);}REG=R;try{if(typeof LD==='object')LD.gates=[];}catch(e){}};}
  {const _tb=trailsBuild;trailsBuild=function(){if(!DL.on)return _tb.apply(this,arguments);TRAILS=[];TRL=null;};}
  {const _dp=decorPlan;decorPlan=function(){if(!DL.on)return _dp.apply(this,arguments);DECO_PLAN=[];SCOL=[];};}
  if(typeof wIn==='function'){const _wi=wIn;wIn=function(x,z,k){if(!DL.on)return _wi.apply(this,arguments);return Math.hypot(x,z)<WR*(k||1);};}
  {const _ng=newGame;newGame=function(o){const r=_ng.apply(this,arguments);try{if(S&&localStorage.getItem('ld-dl')!=='0'&&!(G.nworld==='mp')&&!S.dl){/* MẶC ĐỊNH: nhân vật mới chơi một mình sống trên đại lục (tắt: mở trang với ?dailuc=0) */dlStart(null);}}catch(e){console.warn('đại lục',e);}return r;};}
  /* các hàm dưới đây nằm trong khối riêng (chế độ nghiêm ngặt không tự đưa ra ngoài): gắn lên window để phần máy chủ (mp.js) và bài thử gọi được */
  setTimeout(()=>{try{Object.assign(window,{dlStart,dlShift,dlRebuild,dlKey,dlAnchor,dlRing,dlSeedAt});}catch(e){}},0);
  /* đưa nhân vật (S vừa tạo) lên đại lục; uid có thì chọn tỉnh theo mã người chơi */
  function dlStart(uid){S.dl={ox:0,oz:0};S.wv=3;S.wv0=3;worldCfg(3);/* mỗi nhân vật mới một chỗ BẤT KỲ trên đại lục: chọn ngẫu nhiên trong các tỉnh đất tốt (đồng bằng, gần nước) */let pk=(Math.random()*1e9)|0;const a=dlAnchor(S.seed,pk);S.seed0=S.seed;S.dl={ox:a.ox,oz:a.oz};S.land=dlKey(a.ox,a.oz);S.seed=dlSeedAt(a.ox,a.oz);S.dlNew=1;worldCfg(3);}
  /* khoáng sản cho đại lục: bản đồ cũ đặt mỏ theo các vùng vẽ tay (dãy núi, bãi muối…), đại lục không có các vùng đó nên gần như không có quặng.
     Giờ một phần đá tảng thành quặng đồng, thiếc, đá lửa, sắt, than; một phần lau cỏ ven nước thành đất sét, bãi muối, bãi sò. Tỉ lệ cố định theo vị trí nên ai trong tỉnh cũng thấy như nhau. */
  {const _rg=resGen;resGen=function(seed){const r=_rg.apply(this,arguments);try{if(DL.on){const sd=(S.seed|0),re=(q,t)=>{if(!RT[t])return;q.t=t;q.s=(0.85+dlHash(q.i,3,sd)*0.35)*(RT[t].sc||1);q.hp=RT[t].hp;};
        for(const q of RES){if(q.site)continue;const u=dlHash(q.i,11,sd),t=q.t;if(t==='rock'||t==='boulder'){if(u<0.11)re(q,'copperRock');else if(u<0.25)re(q,'flintRock');else if(u<0.31)re(q,'tinRock');else if(u<0.35)re(q,'ironRock');else if(u<0.39)re(q,'coalRock');}
          else if(t==='tallgrass'||t==='reeds'){const h=hAt(q.x,q.z);if(h<16){if(u<0.1)re(q,'clay');else if(u<0.14)re(q,'saltPan');else if(u<0.18)re(q,'shellBed');}}}}}catch(e){console.warn('khoáng sản đại lục',e);}return r;};}
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

  /* ===================== đợt 3: ĐI KHẮP ĐẠI LỤC =====================
     Game vẫn dựng đầy đủ cây đá, thú trong một "vùng nạp" bán kính ~370 m quanh điểm neo. Đi gần tới mép vùng (80% bán kính) thì DỜI ĐIỂM NEO về chỗ đang đứng
     rồi nạp lại vùng mới (qua màn hố đen, như qua cổng nhưng không có cổng, đất liền nối nhau). Mọi thứ có vị trí (nhà, nền san, dân, vật nuôi, thú cưỡi, cờ)
     được quy đổi toạ độ nên vẫn nằm đúng chỗ trên đại lục; trạng thái cây đá đã chặt, bản đồ đã khám phá được nhớ riêng theo từng điểm neo. */
  function dlSeedAt(ox,oz){const s0=(S.seed0||S.seed)|0;return ((Math.imul(s0,31)^Math.imul(Math.round(ox/DL.TS),73856093)^Math.imul(Math.round(oz/DL.TS),19349663))>>>0)%2000000000+1;}
  const DL_PER=['res','disc','fogm','khu','rlm','war','plants','boats','recruited'];
  function dlShift(){try{if(!DL.on||DL.busy||!S||!S.dl)return false;DL.shiftAt=performance.now();const A=dlA(),dx=Math.round((S.dl.ox+P.x)/A)*A-S.dl.ox,dz=Math.round((S.dl.oz+P.z)/A)*A-S.dl.oz;if(!dx&&!dz)return false;DL.busy=1;
      const k0=S.dl.ox+','+S.dl.oz,nox=S.dl.ox+dx,noz=S.dl.oz+dz,k1=nox+','+noz;S.dlA=S.dlA||{};const keep={};for(const k of DL_PER)if(S[k]!==undefined)keep[k]=S[k];S.dlA[k0]=keep;const nx=S.dlA[k1]||{};
      for(const k of DL_PER){if(nx[k]!==undefined)S[k]=nx[k];else if(typeof LD_DEF==='object'&&LD_DEF[k])S[k]=LD_DEF[k]();else delete S[k];}delete S.dlA[k1];
      const mv=o=>{if(o&&typeof o.x==='number'&&typeof o.z==='number'){o.x=+(o.x-dx).toFixed(1);o.z=+(o.z-dz).toFixed(1);}};
      P.x-=dx;P.z-=dz;if(S.p){S.p.x=+P.x.toFixed(1);S.p.z=+P.z.toFixed(1);}
      for(const b of S.builds||[])mv(b);for(const f of S.flat||[])mv(f);for(const f of S.folk||[]){mv(f);if(typeof f.hx==='number'){f.hx-=dx;f.hz-=dz;}}
      for(const q of S.pets||[]){mv(q);if(typeof q.hx==='number'){q.hx=+(q.hx-dx).toFixed(1);q.hz=+(q.hz-dz).toFixed(1);}}for(const m of S.mounts||[])mv(m);mv(S.mark);
      if(S.army&&typeof S.army.hx==='number'){S.army.hx-=dx;S.army.hz-=dz;}
      S.dl={ox:nox,oz:noz};S.seed=dlSeedAt(nox,noz);S.land=dlKey(nox,noz);S.wx=null;G.walkTo=null;G.act=null;try{if(typeof AQ==='object'&&AQ.on)aqStop();}catch(e){}
      /* cách nhanh: dựng lại vùng mới ngay trong trang (không tải lại, giữ bộ vẽ, mô hình, shader). Cứ 6 lần thì tải lại trang một lần để dọn bộ nhớ đồ hoạ; lỗi giữa chừng cũng quay về cách tải lại. */
      if(!DL.noIn&&(DL.inN|0)<6){try{ldHole('Đang nạp vùng đất kế tiếp…');}catch(e){}if(typeof saveNow==='function')saveNow();else save();DL.inN=(DL.inN|0)+1;G.ldLeaving=1;/* giữ màn hố đen tới khi dựng xong */setTimeout(()=>{let ok=false;try{ok=dlRebuild();}catch(e){console.warn('dựng lại tại chỗ',e);}if(ok){DL.busy=0;G.ldLeaving=0;DL.doneMs=Math.round(performance.now()-DL.shiftAt);DL.shiftAt=0;try{ldHoleOff();}catch(e){}try{save();}catch(e){}}else{DL.noIn=1;try{sessionStorage.setItem('ld-cont','1');sessionStorage.setItem('ld-cont-n','vùng đất kế tiếp');sessionStorage.removeItem('ldtt-autoh');}catch(e){}G.ldLeaving=2;location.reload();}},120);return true;}
      try{ldHole('Đang nạp vùng đất kế tiếp…');sessionStorage.setItem('ld-cont-n','vùng đất kế tiếp');}catch(e){}
      G.ldLeaving=1;if(typeof saveNow==='function')saveNow();else save();G.ldLeaving=2;try{sessionStorage.setItem('ld-cont','1');sessionStorage.removeItem('ldtt-autoh');}catch(e){}
      const go=()=>{if(G.ldGone)return;G.ldGone=1;try{location.reload();}catch(e){}};
      try{const id=typeof curSlot==='function'&&curSlot(),raw=localStorage.getItem(SKEY);if(id)sessionStorage.setItem('ld-cont-id',id);if(id&&raw&&typeof LIDB==='object'&&LIDB.ok){const tx=LIDB.db.transaction('s','readwrite');tx.objectStore('s').put({raw,ts:Date.now()+5},SKEY+'#'+id);tx.oncomplete=()=>setTimeout(go,350);}}catch(e){}
      setTimeout(go,2500);return true;}catch(e){console.warn('dời điểm neo',e);DL.busy=0;return false;}}
  /* dựng lại thế giới quanh điểm neo mới ngay trong trang */
  function dlRebuild(){const t0=performance.now(),old=G.sc,olds=[G.terrain,G.water,DL.ring,DL.sea,G.grass];G.on=false;
    try{SI.clear();RI.clear();BYID.clear();OCC.cell.clear();OCC.edge.clear();}catch(e){}
    try{if(typeof MT==='object')MT.o.clear();}catch(e){}try{if(typeof L4==='object'&&L4.po)L4.po.clear();}catch(e){}try{if(typeof SL3==='object')SL3.rest.clear();}catch(e){}try{if(typeof LD==='object')LD.objs.length=0;}catch(e){}
    try{for(const q of S.pets||[]){q._o=null;}for(const f of S.folk||[]){f._o=null;f._rig=null;}}catch(e){}
    try{if(typeof LT==='object'){LT.o=null;LT.id=null;}}catch(e){}try{if(typeof KP==='object')KP.sig='';}catch(e){}try{if(typeof T3==='object'){T3.rocks=[];T3.brooks=[];T3.wmats=[];T3.mist=null;T3.smoke=null;T3.terr=null;}}catch(e){}
    G.grass=null;G.gLast=null;DL.ring=null;DL.sea=null;G.animals=[];G.foes=[];G.npcs=[];G.village=null;G.camp=null;MAPIMG=null;G.mapDet=null;
    G._reuse=1;try{sceneInit();}finally{G._reuse=0;}
    try{uiHud(true);uiHotbar();}catch(e){}
    /* bỏ cảnh cũ: trả bộ nhớ đồ hoạ của mọi lưới trong cảnh cũ. Khuôn dùng chung (thú, người) còn giữ dữ liệu nên lần vẽ sau tự nạp lại; lưới mặt đất cũ thì bỏ hẳn. */
    try{const seen=new Set();old.traverse(m=>{const g=m.geometry;if(g&&g.dispose&&!seen.has(g)){seen.add(g);try{g.dispose();}catch(e){}}});for(const o of olds){if(o&&o.parent)o.parent.remove(o);}}catch(e){}
    DL.lastMs=Math.round(performance.now()-t0);return G.on===true;}
  setInterval(()=>{try{if(DL.on&&typeof G==='object'&&G.on&&!G.ldLeaving&&!DL.busy&&P.model&&G.animals&&G.animals.length){const el=document.getElementById('ldhole');if(el&&!el.classList.contains('out')){ldHoleOff();if(DL.shiftAt){DL.doneMs=Math.round(performance.now()-DL.shiftAt);DL.shiftAt=0;}}}}catch(e){}},200);
  setInterval(()=>{try{if(!DL.on||typeof G!=='object'||!G.on||G.ldLeaving||DL.busy||!S||G.work||G.build||G.panel)return;/* sang hẳn địa phận tỉnh bên (quá ranh giới 25 m) thì chuyển tỉnh */const A=dlA(),nx=Math.round((S.dl.ox+P.x)/A)*A-S.dl.ox,nz=Math.round((S.dl.oz+P.z)/A)*A-S.dl.oz;if((nx||nz)&&Math.hypot(P.x,P.z)-Math.hypot(P.x-nx,P.z-nz)>1000)dlShift();}catch(e){}},700);

}

