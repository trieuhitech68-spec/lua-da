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
