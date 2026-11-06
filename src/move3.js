/* ===================== LEO VÁCH · BÁM MÉP · NẰM BÒ · TRƯỢT DỐC · LĂN NGƯỜI · VƯỢT RÀO (move3) =====================
   Nạp SAU guide.js, TRƯỚC peek.js (xem build.py): bọc NGOÀI CÙNG moveTick / move (đã được hunt3 và life4 bọc) để
   lớp lăn người giảm được vận tốc chạm đất TRƯỚC khi game và life4 (gãy xương) tính chấn thương.
   Bọc thêm: animTick, poseApply, h3fadeFor, groundY, collide, bodyTick, sneakToggle, sitToggle, actStart, findTarget,
   fpCam, fpArmTick, playerNoise; mpAnim + K3.char2Pose (lúc vào game) để người chơi khác thấy dáng leo/đu/bò.
   • Leo tự do: đẩy cần vào vách dốc (địa hình) hoặc tháp đá vôi / tảng đá vách (hình dạng lấy từ chính mô hình: bản đồ độ cao
     đỉnh + đường bao bán kính theo góc và độ cao) → bám vào; cần điều khiển lên/xuống/sang ngang; người áp sát mặt vách,
     tay chân thay nhau với bám (chéo tay phải - chân trái - tay trái - chân phải), đặt đúng lên mặt vách. Tốn thể lực, hết thì tuột tay.
     Gờ đá nhô ra là chỗ đứng nghỉ. Nhảy khi đang leo = phóng người lên (tốn thêm sức). Lên tới mép trên: đu người trèo lên.
   • Bám mép: nhảy tới mép hơi cao hơn tầm với → bám; đu người, sang ngang; trèo lên; buông. Đang khom mà bước ra mép vực → bám mép.
   • Tư thế: đứng → khom → nằm bò (bò sát đất, rất êm, thú khó thấy); nằm ngửa nghỉ (nút Ngồi khi đang nằm).
   • Trượt dốc quá đứng, lái bằng cần; lăn người khi rơi (nút Lăn đúng lúc, hoặc tự lăn khi đang chạy); vượt rào/khúc gỗ/hòn đá thấp;
     lội nước giơ tay; đi trên sống núi hẹp dang tay giữ thăng bằng; bứt tốc chúi người, dừng gấp ngả người trượt chân.
   Trạng thái tạm nằm trên M3 (không lưu). Chỉ lưu S.m3t (đã xem mẹo nào), khóa mới nên bản lưu cũ vẫn chạy. */
const M3={st:'',k:'',d:null,phi:0,ux:0,uz:1,zh:0,cph:0,mvx:0,mvy:0,mv:0,lunge:0,rest:false,t:0,T:1,
  ex:0,ez:0,ey:0,fx:0,fz:1,hd:null,hph:0,hsh:0,zw:30,upT:0,dnT:0,zwT:0,
  x0:0,y0:0,z0:0,x1:0,y1:0,z1:0,mDeco:null,H:0,vx:0,vz:0,sg:1,steer:0,flat:0,rv:80,slT:0,dust:0,
  deco:null,prone:false,lie:false,push:0,near:[],nearT:-9,shp:new Map(),
  ox:0,oy:0,oz:0,rollQ:-9,rollGo:0,rollV:0,noGrab:-9,exitProneT:-9,ctx:'',ctxT:0,cprobe:'',ix:0,iz:0,m:0,wx:0,wz:0,rx:1,rz:0,
  lean:0,runW:false,skid:0,skx:0,skz:0,bal:false,balT:0,wade:false,surfD:null,Lx:0,Lz:0,Ly:0,LD:null,Ex:0,Ez:0,Ey:0,pd:null,pphi:0,
  px:0,pz:0,xpT:0,crph:0,feh:null,ffw:0,stepPh:0,rk:-1,rx0:-1,ry0:-1,init:false,ui:null,ring:null,rfg:null,hint:null,perr:0,terr:0,gx:0,gz:0,po:{},v3:null,zT:0};
const M3VAULT=/^(log|deadLog|rock|pebble|flintRock|scree|pathStone|bones)$/;
// chi tay chân khi leo: thứ tự chéo — tay phải, chân trái, tay trái, chân phải (R = phía +X của khung xương)
const M3LIMB=[{h:1,s:1,o:0},{h:0,s:-1,o:0.25},{h:1,s:-1,o:0.5},{h:0,s:1,o:0.75}];
function m3tip(k,msg,kind){const T=S.m3t||(S.m3t={});if(T[k])return;T[k]=1;uiToast(msg,kind||'');}
function m3say(k,msg,gap){if(G.t-(M3['_s'+k]||-99)<(gap||4))return;M3['_s'+k]=G.t;uiToast(msg,'');}

/* ---------- hình dạng tháp đá / tảng đá (dựng 1 lần mỗi loại từ chính mô hình) ---------- */
function m3shapeBuild(k,v){if(!window.THREE||typeof model!=='function')return null;let g=null;try{g=model([k,v]);}catch(e){return null;}if(!g)return null;
  const T=THREE,a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3();g.updateMatrixWorld(true);const ms=[];
  g.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.attributes&&o.geometry.attributes.position)ms.push(o);});if(!ms.length)return null;
  let E=0,y0=1e9,y1=-1e9;for(const m of ms){const pa=m.geometry.attributes.position;for(let i=0;i<pa.count;i++){a.fromBufferAttribute(pa,i).applyMatrix4(m.matrixWorld);E=Math.max(E,Math.abs(a.x),Math.abs(a.z));if(a.y<y0)y0=a.y;if(a.y>y1)y1=a.y;}}
  if(!(E>0)||!(y1>y0))return null;E+=3;const NG=56,cs=2*E/NG,hm=new Float32Array(NG*NG).fill(-1e9),NA=48,dy=5,NY=Math.ceil((y1-y0)/dy)+1,rv=new Float32Array(NA*NY),TAU=Math.PI*2;
  const put=(x,y,z)=>{const i=Math.floor((x+E)/cs),j=Math.floor((z+E)/cs);if(i>=0&&j>=0&&i<NG&&j<NG){const q=j*NG+i;if(y>hm[q])hm[q]=y;}
    const r=Math.sqrt(x*x+z*z),an=Math.floor((Math.atan2(x,z)/TAU+1)*NA)%NA,bb=Math.min(NY-1,Math.max(0,Math.floor((y-y0)/dy))),q2=bb*NA+an;if(r>rv[q2])rv[q2]=r;};
  for(const m of ms){const ge=m.geometry,pa=ge.attributes.position,ix=ge.index,n=ix?ix.count:pa.count;
    for(let t=0;t+2<n;t+=3){a.fromBufferAttribute(pa,ix?ix.getX(t):t).applyMatrix4(m.matrixWorld);b.fromBufferAttribute(pa,ix?ix.getX(t+1):t+1).applyMatrix4(m.matrixWorld);c.fromBufferAttribute(pa,ix?ix.getX(t+2):t+2).applyMatrix4(m.matrixWorld);
      const L=Math.max(a.distanceTo(b),b.distanceTo(c),c.distanceTo(a)),N=Math.min(40,Math.max(1,Math.ceil(L/3.5)));
      for(let i=0;i<=N;i++)for(let j=0;j<=N-i;j++){const u=i/N,w=j/N;put(a.x+(b.x-a.x)*u+(c.x-a.x)*w,a.y+(b.y-a.y)*u+(c.y-a.y)*w,a.z+(b.z-a.z)*u+(c.z-a.z)*w);}}}
  // vá lỗ nhỏ trong bản đồ độ cao đỉnh và đường bao
  for(let pass=0;pass<2;pass++){const h2=hm.slice();for(let j=0;j<NG;j++)for(let i=0;i<NG;i++){const q=j*NG+i;if(hm[q]>-1e8)continue;let s=0,n=0;
      if(i>0&&hm[q-1]>-1e8){s+=hm[q-1];n++;}if(i<NG-1&&hm[q+1]>-1e8){s+=hm[q+1];n++;}if(j>0&&hm[q-NG]>-1e8){s+=hm[q-NG];n++;}if(j<NG-1&&hm[q+NG]>-1e8){s+=hm[q+NG];n++;}if(n>=3)h2[q]=s/n;}hm.set(h2);}
  for(let bb=0;bb<NY;bb++)for(let an=0;an<NA;an++){const q=bb*NA+an;if(rv[q]>0)continue;let l=0,r=0;for(let k2=1;k2<=4&&!l;k2++)l=rv[bb*NA+(an-k2+NA)%NA];for(let k2=1;k2<=4&&!r;k2++)r=rv[bb*NA+(an+k2)%NA];if(l&&r)rv[q]=(l+r)/2;}
  return {E,NG,cs,hm,NA,dy,NY,y0,y1,rv};}
function m3shape(d){if(d._m3!==undefined)return d._m3;const key=d.k+'|'+d.v;let Sh=M3.shp.get(key);if(Sh===undefined){Sh=m3shapeBuild(d.k,d.v);M3.shp.set(key,Sh);}
  d._m3=Sh;d._c=Math.cos(d.ry||0);d._sn=Math.sin(d.ry||0);if(Sh){const e=Sh.E*1.42*(d.s||1)+30;d._R2=e*e;}return Sh;}
// độ cao mặt trên của vật cảnh tại (x,z) (−1e9 nếu ngoài)
function m3dTop(d,x,z){const Sh=d._m3;if(!Sh)return -1e9;const s=d.s||1,dx=x-d.x,dz=z-d.z,lx=(dx*d._c-dz*d._sn)/s,lz=(dx*d._sn+dz*d._c)/s,NG=Sh.NG;
  const fx=(lx+Sh.E)/Sh.cs-0.5,fz=(lz+Sh.E)/Sh.cs-0.5,i=Math.floor(fx),j=Math.floor(fz);if(i<-1||j<-1||i>=NG||j>=NG)return -1e9;
  const tx=fx-i,tz=fz-j,i0=i<0?0:i,i1=i+1>=NG?NG-1:i+1,j0=j<0?0:j,j1=j+1>=NG?NG-1:j+1,hm=Sh.hm,a=hm[j0*NG+i0],b=hm[j0*NG+i1],c=hm[j1*NG+i0],e=hm[j1*NG+i1];let v;
  if(a>-1e8&&b>-1e8&&c>-1e8&&e>-1e8)v=(a*(1-tx)+b*tx)*(1-tz)+(c*(1-tx)+e*tx)*tz;else{v=hm[(tz<0.5?j0:j1)*NG+(tx<0.5?i0:i1)];if(v<-1e8)return -1e9;}return d.y+v*s;}
// bán kính mặt vách (đơn vị thế giới) theo góc thế giới phi (x=sin, z=cos) ở độ cao yw; 0 = không có vách
function m3dR(d,phi,yw){const Sh=d._m3;if(!Sh)return 0;const s=d.s||1;let fb=((yw-d.y)/s-Sh.y0)/Sh.dy-0.5;if(fb>Sh.NY-0.5)return 0;if(fb<0)fb=0;
  let th=(phi-(d.ry||0))/(Math.PI*2);th-=Math.floor(th);let fa=th*Sh.NA-0.5;if(fa<0)fa+=Sh.NA;const NA=Sh.NA,rv=Sh.rv,a0=Math.floor(fa)%NA,ta=fa-Math.floor(fa),a1=(a0+1)%NA,b0=Math.floor(fb),b1=Math.min(Sh.NY-1,b0+1),tb=fb-b0;
  return ((rv[b0*NA+a0]*(1-ta)+rv[b0*NA+a1]*ta)*(1-tb)+(rv[b1*NA+a0]*(1-ta)+rv[b1*NA+a1]*ta)*tb)*s;}
// mặt cao nhất tại (x,z): địa hình hoặc đỉnh vật cảnh gần (M3.surfD = vật cảnh cho độ cao đó)
function m3surf(x,z){let h=hAt(x,z);M3.surfD=null;const L=M3.near;for(let i=0;i<L.length;i++){const d=L[i],dx=x-d.x,dz=z-d.z;if(dx*dx+dz*dz>d._R2)continue;const t=m3dTop(d,x,z);if(t>h){h=t;M3.surfD=d;}}return h;}
function m3nearTick(){if(G.t-M3.nearT<0.35&&G.t>=M3.nearT)return;M3.nearT=G.t;const L=M3.near;L.length=0;if(typeof DECO_PLAN==='undefined'||!DECO_PLAN)return;
  for(const d of DECO_PLAN){if(d.k!=='karst'&&d.k!=='cliffRock')continue;const dx=d.x-P.x,dz=d.z-P.z,R=(d.r||60)*2.2+160;if(dx*dx+dz*dz>R*R)continue;if(!m3shape(d))continue;L.push(d);}
  if(M3.deco&&L.indexOf(M3.deco)<0)L.push(M3.deco);if(M3.d&&L.indexOf(M3.d)<0)L.push(M3.d);if(M3.hd&&L.indexOf(M3.hd)<0)L.push(M3.hd);}
function m3grad(x,z){const e=5;M3.gx=(hAt(x+e,z)-hAt(x-e,z))/(2*e);M3.gz=(hAt(x,z+e)-hAt(x,z-e))/(2*e);return Math.hypot(M3.gx,M3.gz);}

/* ---------- đọc cần điều khiển (không cấp phát) ---------- */
function m3input(){let ix=0,iz=0;const k=G.keys;if(k.KeyW||k.ArrowUp)iz-=1;if(k.KeyS||k.ArrowDown)iz+=1;if(k.KeyA||k.ArrowLeft)ix-=1;if(k.KeyD||k.ArrowRight)ix+=1;if(G.joy&&G.joy.on){ix=G.joy.x;iz=G.joy.y;}
  let m=Math.hypot(ix,iz);if(m>1){ix/=m;iz/=m;m=1;}M3.ix=ix;M3.iz=iz;M3.m=m;let fx,fz,rx,rz;
  if(isFP()){fx=Math.sin(P.ry);fz=Math.cos(P.ry);rx=-fz;rz=fx;}else{const cy=Math.cos(G.yaw),sy=Math.sin(G.yaw);rx=cy;rz=-sy;fx=-sy;fz=-cy;}
  M3.rx=rx;M3.rz=rz;M3.wx=fx*-iz+rx*ix;M3.wz=fz*-iz+rz*ix;}

/* ---------- dò phía trước: mép để trèo, vách để bám ---------- */
// tìm mép (đỉnh phẳng) trong khoảng cao lo..hi dọc hướng f; ghi M3.Lx/Lz/Ly/LD
function m3ledge(x,z,fx,fz,lo,hi){for(let s=4;s<=24;s+=2){const h=m3surf(x+fx*s,z+fz*s);if(h<lo)continue;
    let s2=s,h2=h,dd=M3.surfD;for(let k=0;k<8;k++){const hn=m3surf(x+fx*(s2+2),z+fz*(s2+2));if(hn-h2>2.5){s2+=2;h2=hn;dd=M3.surfD;}else break;}
    if(h2>hi)return false;const hb=m3surf(x+fx*(s2+8),z+fz*(s2+8));if(Math.abs(hb-h2)>9)return false;
    const hw=m3surf(x+fx*(s-4),z+fz*(s-4));if(h2-hw<10)return false;M3.Lx=x+fx*s2;M3.Lz=z+fz*s2;M3.Ly=h2;M3.LD=dd;return true;}return false;}
// 0 không có · 1 mép trèo lên được · 2 vách đá (vật cảnh) · 3 vách địa hình · 4 mép bám khi đang nhảy
function m3probe(fx,fz,air){const x=P.x,z=P.z,y=P.y;if(G.h3carry)return 0;
  if(m3ledge(x,z,fx,fz,air?y+24:y+11,air?y+58:y+46))return air?4:1;
  const L=M3.near;for(let i=0;i<L.length;i++){const d=L[i],dx=x-d.x,dz=z-d.z,R=Math.hypot(dx,dz);if(R<1)continue;const phi=Math.atan2(dx,dz),Rw=m3dR(d,phi,y+8);if(Rw<=1)continue;
    const dist=R-Rw;if(dist>(air?14:17)||dist<-10)continue;if(-(dx*fx+dz*fz)/R<0.45)continue;const Rh=m3dR(d,phi,y+46);if(Rh>1&&Rh>Rw-14){M3.pd=d;M3.pphi=phi;return 2;}}
  if(floorTop(x,z)!=null&&!air)return 0;const hg=hAt(x,z);if(Math.abs(hg-y)>(air?40:8))return 0;
  const h0=hAt(x+fx*2,z+fz*2),h1=hAt(x+fx*12,z+fz*12);if((h1-h0)/10>1.3&&slopeAt(x+fx*9,z+fz*9)>1.25&&h1>y+8&&hAt(x+fx*26,z+fz*26)>y+(air?30:20))return 3;return 0;}

/* ---------- vào / ra trạng thái ---------- */
function m3vis(ox,oy,oz){M3.ox+=ox-P.x;M3.oy+=oy-P.y;M3.oz+=oz-P.z;}
function m3begin(st){M3.upLock=0;M3.st=st;M3.t=0;M3.lunge=0;G.act=null;G.walkTo=null;if(G.work)workStop();if(G.sit){G.sit=false;const b=$('#sitBtn');if(b)b.classList.remove('on');}
  if(M3.prone)m3setProne(false,1);P.air=false;P.vy=0;G.swim=false;G.running=false;G.climb=st==='climb'||st==='hang'||st==='mantle';P.speed=0;M3.px=P.x;M3.pz=P.z;}
function m3endGround(){M3.st='';P.air=false;P.vy=0;G.climb=false;M3.d=null;M3.hd=null;}
function m3drop(slip){const fx=M3.st==='climb'?Math.sin(P.ry):M3.fx,fz=M3.st==='climb'?Math.cos(P.ry):M3.fz,ox=P.x,oz=P.z;M3.st='';G.climb=false;P.air=true;P.vy=slip?-30:0;
  P.x-=fx*(slip?5:3);P.z-=fz*(slip?5:3);M3.ox+=ox-P.x;M3.oz+=oz-P.z;M3.noGrab=G.t+(slip?0.9:0.5);M3.d=null;M3.hd=null;
  if(slip){uiToast('😣 Hết sức, tuột tay rơi xuống!','bad');sfx('hurt');}else sfx('step');}
function m3startClimbT(fx,fz){if(S.p.stam<8){m3say('tired','😮‍💨 Mệt quá, chưa bám leo nổi. Nghỉ chút đã.');return false;}
  let s=0;for(;s<=16;s+=2){if(slopeAt(P.x+fx*s,P.z+fz*s)>1.25)break;}if(s>16)s=8;const ox=P.x,oy=P.y,oz=P.z;m3begin('climb');M3.k='t';M3.d=null;M3.deco=null;
  P.x+=fx*s;P.z+=fz*s;P.y=hAt(P.x,P.z);M3.ux=fx;M3.uz=fz;P.ry=Math.atan2(fx,fz);M3.mv=0;m3vis(ox,oy,oz);sfx('step');
  m3tip('climb','🧗 Đang leo vách: cần lên/xuống/sang ngang để leo · Phóng (nút Nhảy) để vươn lên nhanh · Buông tay để thả. Hết thể lực sẽ tuột tay!');return true;}
function m3startClimbD(d,phi){if(S.p.stam<8){m3say('tired','😮‍💨 Mệt quá, chưa bám leo nổi. Nghỉ chút đã.');return false;}const Rw=m3dR(d,phi,P.y+4);if(Rw<=1)return false;
  const ox=P.x,oy=P.y,oz=P.z;m3begin('climb');M3.k='d';M3.d=d;M3.phi=phi;M3.deco=null;P.x=d.x+Math.sin(phi)*(Rw+1.2);P.z=d.z+Math.cos(phi)*(Rw+1.2);P.ry=phi+Math.PI;M3.mv=0;m3vis(ox,oy,oz);sfx('step');
  m3tip('climb','🧗 Đang leo vách: cần lên/xuống/sang ngang để leo · Phóng (nút Nhảy) để vươn lên nhanh · Buông tay để thả. Hết thể lực sẽ tuột tay!');return true;}
function m3climbDown(){const dx=M3.edx,dz=M3.edz;if(S.p.stam<8){m3say('tired','😮‍💨 Mệt quá, chưa bám leo nổi.');return;}let s=2;for(;s<=20;s+=2){if(hAt(P.x+dx*s,P.z+dz*s)<=P.y-12)break;}
  const ox=P.x,oy=P.y,oz=P.z;m3begin('climb');M3.k='t';M3.d=null;M3.deco=null;P.x+=dx*s;P.z+=dz*s;P.y=hAt(P.x,P.z);M3.ux=-dx;M3.uz=-dz;P.ry=Math.atan2(-dx,-dz);M3.mv=0;M3.upLock=1;m3vis(ox,oy,oz);sfx('step');
  m3tip('climb','🧗 Đang leo vách: cần lên/xuống/sang ngang để leo · Phóng (nút Nhảy) để vươn lên nhanh · Buông tay để thả. Hết thể lực sẽ tuột tay!');}
function m3hangZw(){let z=0;for(;z<=20;z+=2){if(m3surf(P.x+M3.fx*z,P.z+M3.fz*z)>=P.y+6)break;}M3.zw=z;}
function m3startHang(ex,ez,ey,fx,fz,dd){if(S.p.stam<3)return false;const ox=P.x,oy=P.y,oz=P.z;m3begin('hang');M3.ex=ex;M3.ez=ez;M3.ey=ey;M3.hd=dd||null;M3.deco=null;
  if(dd){const dx=dd.x-ex,dz=dd.z-ez,l=Math.hypot(dx,dz);if(l>1){fx=dx/l;fz=dz/l;}}M3.fx=fx;M3.fz=fz;M3.hsh=0;M3.upT=0;M3.dnT=0;
  P.x=ex-fx*5.5;P.z=ez-fz*5.5;P.y=ey-41;P.ry=Math.atan2(fx,fz);m3vis(ox,oy,oz);m3hangZw();sfx('step');
  m3tip('hang','🤲 Đang bám mép: kéo cần sang ngang để đu người · Leo lên (hoặc đẩy cần lên) để trèo · nút Buông (Nhảy) hoặc kéo cần xuống để thả.');return true;}
function m3startMantle(ex,ez,ey,fx,fz,dd,tx,tz,ty){if(tx==null){tx=ex+fx*11;tz=ez+fz*11;ty=m3surf(tx,tz);dd=M3.surfD||dd;if(Math.abs(ty-ey)>12)ty=ey;}
  const was=M3.st,y0=P.y;m3begin('mantle');M3.ex=ex;M3.ez=ez;M3.ey=ey;M3.fx=fx;M3.fz=fz;M3.x0=P.x;M3.z0=P.z;M3.y0=y0;M3.x1=tx;M3.z1=tz;M3.y1=ty;M3.mDeco=dd||null;
  const dh=clamp((ey-y0)/41,0,1);M3.T=ey-y0<12&&was!=='hang'?0.42:0.55+0.5*dh;P.ry=Math.atan2(fx,fz);S.p.stam=Math.max(0,S.p.stam-(3+dh*5));sfx('step');return true;}
function m3startRoll(v){let fx,fz;const l=Math.hypot(M3.wx,M3.wz);if(M3.m>0.2&&l>0.01){fx=M3.wx/l;fz=M3.wz/l;}else{fx=Math.sin(P.ry);fz=Math.cos(P.ry);}
  m3begin('roll');G.climb=false;M3.fx=fx;M3.fz=fz;M3.T=0.62;M3.rv=Math.min(125,60+v*0.1);P.ry=Math.atan2(fx,fz);if(window.H3){H3.air.land=0;H3.air.stum=0;}sfx('thud');
  uiFloat('Lăn người!',P.x,P.y+40,P.z,'#ffe08a');m3tip('roll','🤸 Lăn người khi tiếp đất giúp giảm chấn thương lúc rơi. Bấm Lăn ngay trước khi chạm đất, hoặc đang chạy thì tự lăn.','gold');}
function m3startSlide(dx,dz,g){m3begin('slide');G.climb=false;const sp=Math.max(45,P.speed||0);M3.vx=dx*sp;M3.vz=dz*sp;M3.sg=g;M3.steer=0;M3.flat=0;M3.dust=0;
  m3tip('slide','🛷 Dốc quá đứng không vững: trượt xuống! Kéo cần sang trái/phải để lái, bấm Nhảy để bật ra.');}
function m3startVault(tx,tz,ty,H,ox,oz,fx,fz){m3begin('vault');G.climb=false;M3.x0=P.x;M3.z0=P.z;M3.y0=P.y;M3.x1=tx;M3.z1=tz;M3.y1=ty;M3.H=H;M3.ex=ox;M3.ez=oz;M3.fx=fx;M3.fz=fz;
  M3.T=0.48+0.14*clamp(Math.hypot(tx-P.x,tz-P.z)/40,0,1);P.ry=Math.atan2(fx,fz);S.p.stam=Math.max(0,S.p.stam-3);sfx('jump');addXp('run',0.3);}
// vượt vật thấp: rào/tường lửng (va chạm biến mất khi nâng người lên 26) hoặc khúc gỗ, hòn đá nhỏ
function m3tryVault(fx,fz){if(P.air||G.swim||M3.prone||G.h3carry||S.p.stam<3)return false;const ax=P.x+fx*10,az=P.z+fz*10;let H=0,ox=ax,oz=az;
  const c0=collide(ax,az);if(Math.hypot(c0[0]-ax,c0[1]-az)>2){const y0=P.y;P.y+=26;const c1=collide(ax,az);P.y=y0;if(Math.hypot(c1[0]-ax,c1[1]-az)<0.5)H=22;}
  if(!H){for(const i of near(P.x+fx*14,P.z+fz*14,26)){const q=RES[i];if(q.st!==0||!M3VAULT.test(q.t))continue;const D=RT[q.t],rr=(D.r||6)*q.s*0.7;if(rr>16)continue;const dx=q.x-P.x,dz=q.z-P.z,dd=Math.hypot(dx,dz);
      if(dd>rr+16||dd<0.5||(dx*fx+dz*fz)/dd<0.55)continue;H=/log/i.test(q.t)?13:Math.min(18,rr*1.1+5);ox=q.x;oz=q.z;break;}}
  if(!H)return false;
  for(let s=18;s<=42;s+=3){const tx=P.x+fx*s,tz=P.z+fz*s,c=collide(tx,tz);if(Math.hypot(c[0]-tx,c[1]-tz)>0.5)continue;const gy=groundY(tx,tz);if(Math.abs(gy-P.y)>16||wdAt(tx,tz)>8)continue;
    m3startVault(tx,tz,gy,H,ox,oz,fx,fz);m3tip('vault','🏃 Vượt rào: chạy vào rào thấp, khúc gỗ hay hòn đá nhỏ là tự chống tay nhảy qua.');return true;}return false;}
// bám/trèo theo hướng (force = bấm nút ngữ cảnh)
function m3tryGrab(fx,fz,force){if(M3.st||P.air||M3.prone||G.ride||G.ladder)return false;const l=Math.hypot(fx,fz);if(l<0.01)return false;fx/=l;fz/=l;
  if(G.h3carry){m3say('carry','Đang vác nặng, không leo trèo được.');return false;}const c=m3probe(fx,fz,false);
  if(c===1){if(S.p.stam<4){m3say('tired','😮‍💨 Mệt quá, chưa trèo nổi.');return false;}return m3startMantle(M3.Lx,M3.Lz,M3.Ly,fx,fz,M3.LD);}
  if(c===2)return m3startClimbD(M3.pd,M3.pphi);if(c===3)return m3startClimbT(fx,fz);if(m3tryVault(fx,fz))return true;
  if(force)m3say('nograb','Không có chỗ bám ở phía trước.');return false;}
function m3setProne(on,quiet){if(on){if(M3.prone||M3.st||P.air||G.swim||G.ride||G.ladder||G.sleeping||G.h3carry)return;M3.prone=true;M3.lie=false;G.sneak=true;
    if(G.sit){G.sit=false;const b=$('#sitBtn');if(b)b.classList.remove('on');}G.act=null;G.walkTo=null;if(G.work)workStop();G.runBtn=false;const rb=$('#runBtn');if(rb)rb.classList.remove('on');
    if(!quiet)uiToast('🐍 Nằm bò: bò rất chậm, gần như không tiếng động, thú khó thấy bạn. Bấm Ngồi để nằm ngửa nghỉ.','');sfx('step');}
  else{if(!M3.prone)return;M3.prone=false;M3.lie=false;M3.exitProneT=G.t;}m3sneakIcon();}
function m3sneakIcon(){const b=$('#sneakBtn');if(!b)return;const k=M3.prone?'p':'s';if(b._m3k===k)return;b._m3k=k;b.innerHTML=M3.prone?'🐍<i>Bò</i>':'🐾<i>Khom</i>';b.classList.toggle('on',!!G.sneak);}
function m3hangUp(){const tx=M3.ex+M3.fx*11,tz=M3.ez+M3.fz*11,y1=m3surf(tx,tz),dd=M3.surfD;if(y1>M3.ey+14||y1<M3.ey-18){m3say('noup','Phía trên không có chỗ đứng.');return;}
  if(S.p.stam<4){m3say('tired','😮‍💨 Hết sức để đu lên.');return;}m3startMantle(M3.ex,M3.ez,M3.ey,M3.fx,M3.fz,dd,tx,tz,y1);}
function m3hangDown(){const d=M3.hd;if(d&&S.p.stam>=8){const phi=Math.atan2(P.x-d.x,P.z-d.z);if(m3dR(d,phi,P.y+4)>1){m3startClimbD(d,phi);return;}}
  const fx=M3.fx,fz=M3.fz;if(slopeAt(M3.ex-fx*6,M3.ez-fz*6)>1.3&&S.p.stam>=8){let s=2;for(;s<=34;s+=2){if(hAt(M3.ex-fx*s,M3.ez-fz*s)<=M3.ey-30)break;}const ox=P.x,oy=P.y,oz=P.z;
    m3begin('climb');M3.k='t';M3.d=null;P.x=M3.ex-fx*s;P.z=M3.ez-fz*s;P.y=hAt(P.x,P.z);M3.ux=fx;M3.uz=fz;P.ry=Math.atan2(fx,fz);m3vis(ox,oy,oz);return;}m3drop();}

/* ---------- từng trạng thái ---------- */
function m3stam(dt,rate){if(M3.rest){S.p.stam=Math.min(maxStam(),S.p.stam+dt*5);return true;}S.p.stam=Math.max(0,S.p.stam-dt*rate*(S.mode==='cozy'?0.7:1));if(S.p.stam<=0){m3drop(true);return false;}return true;}
function m3climbTick(dt){if(G.jumpReq){G.jumpReq=0;if(M3.lunge<=0){if(S.p.stam>=14){M3.lunge=0.34;S.p.stam-=14;sfx('jump');}else m3say('lunge','😮‍💨 Không đủ sức để phóng người lên.');}}
  let vert=-M3.iz,latIn=M3.ix;if(M3.upLock){if(vert<0.1)M3.upLock=0;else vert=0;}if(Math.abs(vert)<0.18)vert=0;if(Math.abs(latIn)<0.18)latIn=0;const lg=M3.lunge>0;if(lg){M3.lunge-=dt;vert=1;}
  const sk=1+skLv('run')*0.04,tired=S.p.stam<15?0.7:1,vs=(lg?100:vert>0?24:30)*sk*tired,ls=(lg?40:20)*sk*tired;let moved=0,lat=0;M3.rest=false;
  if(M3.k==='t'){const g=Math.max(0.3,m3grad(P.x,P.z));const ux=M3.gx/g,uz=M3.gz/g,kk=Math.min(1,dt*10);M3.ux+=(ux-M3.ux)*kk;M3.uz+=(uz-M3.uz)*kk;const ul=Math.hypot(M3.ux,M3.uz)||1;M3.ux/=ul;M3.uz/=ul;
    const tx=M3.uz,tz=-M3.ux;lat=latIn?latIn*(M3.rx*tx+M3.rz*tz>=0?1:-1):0;
    if(M3.t>0.3&&(g<0.85||vert<0&&g<1.0)){m3endGround();return;}
    if(vert>0){const ax=P.x+M3.ux*14,az=P.z+M3.uz*14,ha=hAt(ax,az);if(slopeAt(ax,az)<0.9&&ha-P.y>2&&ha-P.y<48){if(m3ledge(P.x,P.z,M3.ux,M3.uz,P.y+2,P.y+48))m3startMantle(M3.Lx,M3.Lz,M3.Ly,M3.ux,M3.uz,M3.LD);else m3startMantle(ax,az,ha,M3.ux,M3.uz,null);return;}}
    const dv=vert*vs*dt,hs=dv/Math.max(g,1.0);P.x+=M3.ux*hs+tx*lat*ls*dt;P.z+=M3.uz*hs+tz*lat*ls*dt;P.y=hAt(P.x,P.z);moved=Math.abs(dv)+Math.abs(lat*ls*dt);
    M3.zh=Math.min(22,30/g);P.ry=lerpAng(P.ry,Math.atan2(M3.ux,M3.uz),Math.min(1,dt*10));}
  else{const d=M3.d;if(!d||!d._m3){m3drop();return;}let Rw=m3dR(d,M3.phi,P.y+4);const tx=-Math.cos(M3.phi),tz=Math.sin(M3.phi);lat=latIn?latIn*(M3.rx*tx+M3.rz*tz>=0?1:-1):0;
    if(vert>0){const Rh=m3dR(d,M3.phi,P.y+38);if(Rh<=1||Rh<Rw-12){if(m3decoTopSpot(d,M3.phi,Rw)){m3startMantle(M3.Lx,M3.Lz,M3.Ly,-Math.sin(M3.phi),-Math.cos(M3.phi),d);return;}vert=0;if(lg)M3.lunge=0;m3say('top','Phía trên không còn chỗ bám.');}}
    const ny=P.y+vert*vs*dt,gy=groundY(P.x,P.z);if(vert<0&&ny<=gy+0.5){const ox=P.x,oz=P.z;P.y=gy;P.x+=Math.sin(M3.phi)*3;P.z+=Math.cos(M3.phi)*3;M3.ox+=ox-P.x;M3.oz+=oz-P.z;m3endGround();return;}
    const ph0=M3.phi;if(lat)M3.phi-=lat*ls*dt/Math.max(20,Rw);let R2=m3dR(d,M3.phi,ny+4),yy=ny;if(R2<=1){M3.phi=ph0;yy=P.y;R2=Rw;}
    moved=Math.abs(yy-P.y)+(M3.phi!==ph0?Math.abs(lat*ls*dt):0);P.y=yy;Rw=R2;P.x=d.x+Math.sin(M3.phi)*(Rw+1.2);P.z=d.z+Math.cos(M3.phi)*(Rw+1.2);
    P.ry=lerpAng(P.ry,M3.phi+Math.PI,Math.min(1,dt*12));const Ru=m3dR(d,M3.phi,P.y+33);M3.zh=Ru>1?clamp(Rw-Ru,-3,20):0;M3.rest=m3dR(d,M3.phi,P.y-4)-Rw>9&&!moved;}
  if(!m3stam(dt,moved>0.01?(vert>0?7:5):2.4))return;
  if(M3.rest)m3say('rest','🪨 Chân đứng được trên gờ đá: đang nghỉ lấy sức.',12);
  const mm=moved>0.01?1:0;M3.mv+=(mm-M3.mv)*Math.min(1,dt*6);if(mm){const a=Math.hypot(lat,vert)||1;M3.mvx+=(lat/a-M3.mvx)*Math.min(1,dt*8);M3.mvy+=(vert/a-M3.mvy)*Math.min(1,dt*8);}
  const p0=M3.cph;M3.cph+=moved/9;if(Math.floor(p0*2)!==Math.floor(M3.cph*2))sfx('step');
  M3.xpT+=dt*mm;if(M3.xpT>3){M3.xpT=0;addXp('run',1);}if(!isFP()&&mm)G.yaw=lerpAng(G.yaw,P.ry+Math.PI,Math.min(1,dt*0.9));}
function m3decoTopSpot(d,phi,Rw){const sx=Math.sin(phi),sz=Math.cos(phi);for(let r=Rw-2;r>2;r-=3){const x=d.x+sx*r,z=d.z+sz*r,t=m3dTop(d,x,z);if(t>P.y+50)return false;
    if(t>P.y+4){const t2=m3dTop(d,d.x+sx*(r-7),d.z+sz*(r-7));if(Math.abs(t2-t)<11){M3.Lx=x;M3.Lz=z;M3.Ly=Math.max(t,t2);return true;}}}return false;}
function m3edgeAt(x,z,fx,fz,ey){for(let s=-10;s<=16;s+=2){const h=m3surf(x+fx*s,z+fz*s);if(h>=ey-8){const hb=m3surf(x+fx*(s+5),z+fz*(s+5));M3.Ex=x+fx*s;M3.Ez=z+fz*s;M3.Ey=Math.max(h,Math.min(hb,ey+12));
      return s>-10&&m3surf(x+fx*(s-5),z+fz*(s-5))<M3.Ey-14;}}return false;}
function m3hangTick(dt){if(G.jumpReq){G.jumpReq=0;m3drop();return;}const vert=-M3.iz,latIn=M3.ix;
  if(vert>0.5){M3.upT+=dt;if(M3.upT>0.22){m3hangUp();if(M3.st!=='hang')return;M3.upT=-0.6;}}else M3.upT=Math.max(0,M3.upT);
  if(vert<-0.5){M3.dnT+=dt;if(M3.dnT>0.3){m3hangDown();return;}}else M3.dnT=0;
  const tx=M3.fz,tz=-M3.fx,lat=Math.abs(latIn)>0.25&&Math.abs(vert)<0.6?latIn*(M3.rx*tx+M3.rz*tz>=0?1:-1):0;let moved=0;
  if(lat){const st=lat*17*dt;if(m3edgeAt(M3.ex+tx*st,M3.ez+tz*st,M3.fx,M3.fz,M3.ey)&&Math.abs(M3.Ey-M3.ey)<12){M3.ex=M3.Ex;M3.ez=M3.Ez;M3.ey+=(M3.Ey-M3.ey)*0.5;moved=Math.abs(st);
      if(M3.hd){const dx=M3.hd.x-M3.ex,dz=M3.hd.z-M3.ez,l=Math.hypot(dx,dz);if(l>1){M3.fx=dx/l;M3.fz=dz/l;}}}else m3say('shim','Hết mép để đu sang.');}
  M3.hsh+=((moved?Math.sign(lat):0)-M3.hsh)*Math.min(1,dt*8);M3.hph+=moved/8;
  P.x=M3.ex-M3.fx*5.5;P.z=M3.ez-M3.fz*5.5;P.y=M3.ey-41;P.ry=Math.atan2(M3.fx,M3.fz);P.speed=0;M3.zwT-=dt;if(M3.zwT<=0){M3.zwT=0.25;m3hangZw();}M3.rest=false;m3stam(dt,moved?4:2.2);}
function m3mantleTick(dt){const k=Math.min(1,M3.t/M3.T),Ly=M3.ey,yA=Math.max(M3.y0,Ly-24),yB=Math.max(yA,Ly-6),bx=M3.ex-M3.fx*1.5,bz=M3.ez-M3.fz*1.5;
  if(k<0.45){const a=h3ss(k/0.45);P.y=h3lerp(M3.y0,yA,a);P.x=M3.x0;P.z=M3.z0;}
  else if(k<0.75){const b=h3ss((k-0.45)/0.3);P.y=h3lerp(yA,yB,b);P.x=h3lerp(M3.x0,bx,b);P.z=h3lerp(M3.z0,bz,b);}
  else{const c=h3ss((k-0.75)/0.25);P.y=h3lerp(yB,M3.y1,c);P.x=h3lerp(bx,M3.x1,c);P.z=h3lerp(bz,M3.z1,c);}P.speed=0;
  if(k>=1){P.x=M3.x1;P.z=M3.z1;P.y=M3.y1;const dd=M3.mDeco;m3endGround();M3.deco=dd;if(window.H3){H3.air.land=0.12;H3.air.landA=0.3;}addXp('run',0.5);}}
function m3vaultTick(dt){const k=Math.min(1,M3.t/M3.T),e=h3ss(k);P.x=h3lerp(M3.x0,M3.x1,e);P.z=h3lerp(M3.z0,M3.z1,e);P.y=h3lerp(M3.y0,M3.y1,k)+Math.sin(Math.PI*Math.min(1,k*1.15))*M3.H*0.82;P.speed=60;
  if(k>=1){m3endGround();if(window.H3){H3.air.land=0.15;H3.air.landA=0.35;}}}
function m3rollTick(dt){const k=Math.min(1,M3.t/M3.T),v=M3.rv*(1-k*0.8),nx=P.x+M3.fx*v*dt,nz=P.z+M3.fz*v*dt,c=collide(nx,nz);P.x=c[0];P.z=c[1];const gy=groundY(P.x,P.z);
  if(gy<P.y-10){M3.st='';P.air=true;P.vy=0;return;}P.y=gy;P.speed=v;if(k>=1)m3endGround();}
function m3slideTick(dt){if(G.jumpReq){G.jumpReq=0;M3.st='';P.air=true;P.vy=140;sfx('jump');return;}
  const g=m3grad(P.x,P.z);M3.sg+=(g-M3.sg)*Math.min(1,dt*6);let dx=0,dz=0;if(g>0.05){dx=-M3.gx/g;dz=-M3.gz/g;}
  const acc=g>0.75?300*g/Math.sqrt(1+g*g):-240;let sp=Math.hypot(M3.vx,M3.vz);
  if(acc>0){M3.vx+=dx*acc*dt;M3.vz+=dz*acc*dt;}else if(sp>0.01){const k=Math.max(0,sp+acc*dt)/sp;M3.vx*=k;M3.vz*=k;}
  sp=Math.hypot(M3.vx,M3.vz)||1;const lx=-M3.vz/sp,lz=M3.vx/sp;let steer=0;if(M3.m>0.2){steer=clamp(M3.wx*lx+M3.wz*lz,-1,1);M3.vx+=lx*steer*150*dt;M3.vz+=lz*steer*150*dt;const back=-(M3.wx*M3.vx+M3.wz*M3.vz)/sp;if(back>0.3){M3.vx*=1-dt*1.5*back;M3.vz*=1-dt*1.5*back;}}
  M3.steer+=(steer-M3.steer)*Math.min(1,dt*8);sp=Math.hypot(M3.vx,M3.vz);if(sp>235){M3.vx*=235/sp;M3.vz*=235/sp;sp=235;}M3.vx*=1-dt*0.5;M3.vz*=1-dt*0.5;
  const nx=P.x+M3.vx*dt,nz=P.z+M3.vz*dt,c=collide(nx,nz);if(Math.hypot(c[0]-nx,c[1]-nz)>sp*dt*0.6&&sp>90){P.x=c[0];P.z=c[1];m3endGround();if(window.H3)H3.air.stum=0.6;G.shakeCam=0.25;sfx('thud');return;}
  const ny=hAt(c[0],c[1]);if(ny<P.y-Math.max(14,sp*dt*3)){P.x=c[0];P.z=c[1];M3.st='';P.air=true;P.vy=-sp*0.3;return;}
  P.x=c[0];P.z=c[1];P.y=ny;P.speed=sp;P.ry=lerpAng(P.ry,Math.atan2(M3.vx,M3.vz),Math.min(1,dt*7));
  M3.dust-=dt;if(M3.dust<=0&&sp>40){M3.dust=0.11;puff(P.x+M3.vx*0.02,P.y+2,P.z+M3.vz*0.02,'#b59a76',2);if(Math.random()<0.4)sfx('step');}
  if(g<0.75)M3.flat+=dt;else M3.flat=0;if(wdAt(P.x,P.z)>3||M3.flat>0.2&&sp<70||M3.flat>0.6||floorTop(P.x,P.z)!=null){const fast=sp>150;m3endGround();if(fast&&window.H3)H3.air.stum=0.5;}}
function m3stTick(dt){M3.t+=dt;const st=M3.st;G.walkTo=null;
  if(st==='climb')m3climbTick(dt);else if(st==='hang')m3hangTick(dt);else if(st==='mantle')m3mantleTick(dt);else if(st==='vault')m3vaultTick(dt);else if(st==='roll')m3rollTick(dt);else if(st==='slide')m3slideTick(dt);else M3.st='';}

/* ---------- vòng di chuyển (bọc ngoài cùng) ---------- */
{const _mt=moveTick;moveTick=function(dt){if(!M3.init)m3init();try{m3nearTick();}catch(e){}
  if(G.ride||G.ladder||G.sleeping||S.p.hp<=0||G.lost){if(M3.st){M3.st='';G.climb=false;}if(M3.prone&&(G.ride||G.ladder||G.sleeping))m3setProne(false,1);return _mt(dt);}
  if(M3.st&&(Math.abs(P.x-M3.px)>80||Math.abs(P.z-M3.pz)>80)){M3.st='';G.climb=false;}
  m3input();
  if(M3.st){try{m3stTick(dt);}catch(e){if(!M3.terr){M3.terr=1;console.warn('move3',e);}M3.st='';G.climb=false;}M3.px=P.x;M3.pz=P.z;return;}
  if(M3.prone){if(G.jumpReq){G.jumpReq=0;m3setProne(false,1);}else if(M3.lie&&M3.m>0.3)M3.lie=false;}
  // nhảy qua rào khi đang chạy tới
  if(G.jumpReq&&!P.air&&M3.m>0.4&&!M3.prone){const l=Math.hypot(M3.wx,M3.wz);if(l>0.01&&m3tryVault(M3.wx/l,M3.wz/l)){G.jumpReq=0;M3.px=P.x;M3.pz=P.z;return;}}
  // đang rơi: bấm nhảy/Lăn = chuẩn bị lăn người
  if(P.air&&G.jumpReq&&P.vy<0){G.jumpReq=0;M3.rollQ=G.t;}
  if(P.air&&P.vy<-200&&!G.swim){const gy=groundY(P.x,P.z),ny=P.y+(P.vy-520*dt)*dt;if(ny<=gy){const v=-P.vy;if(v>240&&(G.t-M3.rollQ<0.55||G.running&&M3.m>0.4)&&wdAt(P.x,P.z)<4){const ve=v-Math.min(v*0.45,260);P.vy=-ve;if(window.H3)H3.air.vy=-ve;M3.rollGo=1;M3.rollV=v;}}}
  const wasAir=P.air,x0=P.x,z0=P.z;
  _mt(dt);
  try{m3post(dt,wasAir,x0,z0);}catch(e){if(!M3.terr){M3.terr=1;console.warn('move3',e);}}M3.px=P.x;M3.pz=P.z;};}
function m3post(dt,wasAir,x0,z0){
  if(M3.rollGo){M3.rollGo=0;if(!P.air){m3startRoll(M3.rollV);return;}}
  if(P.air){if(G.t>=M3.noGrab&&!G.swim&&S.p.stam>=5&&!G.h3carry){let fx,fz;const l=Math.hypot(M3.wx,M3.wz);if(M3.m>0.3&&l>0.01){fx=M3.wx/l;fz=M3.wz/l;}else{fx=Math.sin(P.ry);fz=Math.cos(P.ry);}
      const c=m3probe(fx,fz,true);if(c===4){if(M3.Ly-P.y<=34)m3startMantle(M3.Lx,M3.Lz,M3.Ly,fx,fz,M3.LD);else m3startHang(M3.Lx,M3.Lz,M3.Ly,fx,fz,M3.LD);}
      else if(c===2)m3startClimbD(M3.pd,M3.pphi);else if(c===3&&M3.m>0.3)m3startClimbT(fx,fz);}
    // rơi sát mặt dốc đứng → tiếp đất bằng cách trượt
    if(!M3.st&&P.vy<0&&!G.swim&&!M3.deco&&floorTop(P.x,P.z)==null){const hg=hAt(P.x,P.z);if(P.y-hg<14&&P.y-hg>-2){const g=m3grad(P.x,P.z);if(g>1.15){const vx=P.x-x0,vz=P.z-z0,hv=Math.hypot(vx,vz)/Math.max(dt,1e-3);P.y=hg;m3startSlide(-M3.gx/g,-M3.gz/g,g);if(hv>20){M3.vx=vx/dt*0.9;M3.vz=vz/dt*0.9;}}}}
    return;}
  if(M3.deco){const t=m3dTop(M3.deco,P.x,P.z);if(t<-1e8||t<P.y-10||wasAir&&Math.abs(t-P.y)>6)M3.deco=null;}
  // trượt dốc
  if(!G.swim&&!M3.deco&&!M3.prone&&floorTop(P.x,P.z)==null&&Math.abs(P.y-hAt(P.x,P.z))<5){const g=m3grad(P.x,P.z);
    if(g>1.15){const dx=-M3.gx/g,dz=-M3.gz/g,l=Math.hypot(M3.wx,M3.wz),along=M3.m>0.2&&l>0.01?(M3.wx*dx+M3.wz*dz)/l:0;
      if(along>0.35||g>1.7&&M3.m<0.2){M3.slT+=dt;if(M3.slT>0.12){M3.slT=0;m3startSlide(dx,dz,g);return;}}else M3.slT=0;}else M3.slT=0;}
  // bứt tốc / dừng gấp
  const runW=!!G.running&&(P.speed||0)>130;if(runW&&!M3.runW)M3.lean=0.26;else if(!runW&&M3.runW&&M3.m<0.1&&!M3.prone){M3.lean=-0.24;M3.skid=0.28;M3.skx=Math.sin(P.ry);M3.skz=Math.cos(P.ry);puff(P.x+M3.skx*8,P.y+1,P.z+M3.skz*8,'#b59a76',3);}
  M3.runW=runW;M3.lean*=Math.exp(-dt*4.5);if(Math.abs(M3.lean)<0.005)M3.lean=0;
  if(M3.skid>0){M3.skid-=dt;const v=Math.max(0,M3.skid)*230,nx=P.x+M3.skx*v*dt,nz=P.z+M3.skz*v*dt,c=collide(nx,nz);if(Math.abs(groundY(c[0],c[1])-P.y)<8){P.x=c[0];P.z=c[1];}}
  M3.wade=!G.swim&&wdAt(P.x,P.z)>3&&floorTop(P.x,P.z)==null;
  M3.balT-=dt;if(M3.balT<=0){M3.balT=0.2;let b=false;if(!G.sneak&&(P.speed||0)>8&&!G.swim){const px=Math.cos(P.ry),pz=-Math.sin(P.ry),y=P.y;b=m3surf(P.x+px*11,P.z+pz*11)<y-12&&m3surf(P.x-px*11,P.z-pz*11)<y-12&&m3surf(P.x+pz*-10,P.z+px*10)>y-10;}
    if(b&&!M3.bal)m3tip('bal','⚖️ Lối đi hẹp: dang tay giữ thăng bằng, bước chậm lại.');M3.bal=b;}}
// đi bộ: chậm khi bò, tự bám vách khi đẩy vào, khom đến mép vực thì bám mép
{const _mv=move;move=function(dx,dz,m,dt,run){if(M3.prone){m*=M3.lie?0:0.42;run=false;}else if(M3.bal)m*=0.78;
  if(G.sneak&&!M3.prone&&!P.air&&!G.swim&&M3.m>0.2&&!M3.st&&floorTop(P.x,P.z)==null){const gn=Math.min(groundY(P.x+dx*9,P.z+dz*9),groundY(P.x+dx*15,P.z+dz*15));if(gn<P.y-34&&S.p.stam>=5){let s=1;for(;s<=9;s++){if(groundY(P.x+dx*s,P.z+dz*s)<P.y-12)break;}
      if(m3startHang(P.x+dx*(s-1),P.z+dz*(s-1),P.y,-dx,-dz,M3.deco))return;}}
  // vách dốc ngay trước mặt (chỗ game cũ cho "bò dốc"): bám ngay, không đợi đẩy
  if(!P.air&&!G.swim&&!M3.prone&&!M3.st&&M3.m>0.3&&!G.h3carry&&floorTop(P.x,P.z)==null&&(hAt(P.x+dx*7,P.z+dz*7)-hAt(P.x+dx*1,P.z+dz*1))/6>1.4&&Math.abs(hAt(P.x,P.z)-P.y)<8&&m3tryGrab(dx,dz,false))return;
  // đang khom tới mép dốc đứng: dừng ở mép (không trượt/ngã), nút ngữ cảnh "Leo xuống"
  M3.edge=0;if(G.sneak&&!M3.prone&&!P.air&&!G.swim&&!M3.st&&M3.m>0.2&&floorTop(P.x,P.z)==null&&Math.abs(hAt(P.x,P.z)-P.y)<6&&(hAt(P.x+dx*8,P.z+dz*8)-hAt(P.x,P.z))/8<-1.3&&hAt(P.x+dx*24,P.z+dz*24)<P.y-30){M3.edge=1;M3.edx=dx;M3.edz=dz;M3.edT=G.t;P.speed=0;P.ry=lerpAng(P.ry,Math.atan2(dx,dz),Math.min(1,dt*10));m3tip('edge','🧗 Mép dốc đứng: bấm "Leo xuống" để bám vách trèo xuống.');return;}
  // dốc xuống quá đứng ngay trước mặt: trượt luôn (không bị hẫng chân bay lên)
  if(!P.air&&!G.swim&&!M3.prone&&!M3.st&&!M3.deco&&M3.m>0.3&&floorTop(P.x,P.z)==null&&Math.abs(hAt(P.x,P.z)-P.y)<6&&(hAt(P.x+dx*8,P.z+dz*8)-hAt(P.x,P.z))/8<-1.15){const g=m3grad(P.x,P.z);if(g>1.0){m3startSlide(-M3.gx/g,-M3.gz/g,g);M3.vx=dx*Math.max(60,(P.speed||0)*0.8);M3.vz=dz*Math.max(60,(P.speed||0)*0.8);return;}}
  const x0=P.x,z0=P.z;const r=_mv(dx,dz,m,dt,run);
  if(P.air||M3.prone||M3.st||M3.m<0.3||G.h3carry){M3.push=0;return r;}const want=(P.speed||0)*dt,got=Math.hypot(P.x-x0,P.z-z0);
  if(want>0.4&&got<want*0.55){M3.push+=dt;if(M3.push>0.16){M3.push=0;m3tryGrab(dx,dz,false);}}else M3.push=Math.max(0,M3.push-dt*2);return r;};}

/* ---------- dáng người ---------- */
const M3PO={};
M3PO.climb=(R,o)=>{const K=h3ik(),ih=1/R.dims.h,zh=o.zh*ih,t=o.t,ph=o.ph,mv=o.mv,a=Math.atan2(zh,30),c=Math.sin(ph*Math.PI*2),lu=o.lunge||0;
  const mm=Math.hypot(o.mvx,o.mvy),dxn=mm>0.05?o.mvx/mm:0,dyn=mm>0.05?o.mvy/mm:1;const hy=15+Math.sin(ph*Math.PI*4)*0.5*mv+3.5*lu;
  K.hipsAt(R,dxn*0.8*c*mv,hy,zh*hy/30-6.2);R.hips.rotation.set(a*0.55,0,0.07*c*mv);R.torso.rotation.set(0.1+a*0.3-0.12*lu,0.08*dxn*mv,0);
  R.head.rotation.set(dyn<-0.3&&mv>0.3?0.35:-0.45-a*0.2-0.2*lu,0.25*dxn*mv,0);
  for(let i=0;i<4;i++){const L=M3LIMB[i],s=L.s,hand=L.h===1,f=h3fr(ph+L.o),stn=f<0.7,u=stn?f/0.7:(f-0.7)/0.3,d=stn?0.5-u:-0.5+h3ss(u),lift=stn?0:Math.sin(Math.PI*u),stride=hand?10:8.5;
    let x=s*(hand?3.8:2.8)+dxn*stride*d*mv,y=(hand?31.5:4.5)+dyn*stride*d*mv;if(lu>0){if(hand){y=h3lerp(y,41,lu);x=h3lerp(x,s*3.2,lu);}else y=h3lerp(y,1.5,lu*0.7);}
    const z=zh*y/30-(hand?1.0:2.6)-lift*(hand?2.6:2.0);if(hand){if(o.tired)x+=Math.sin(t*31+i*2)*0.25;K.armTo(R,s,x,y,z,s*0.9,-0.55,-0.6);}
    else{K.legTo(R,s,x,y,z,s*0.65,0,1);K.footTo(R,s,-0.25-a*0.5,s*0.3,0);}}
  K.cloak(R,0.6);};
M3PO.hang=(R,o)=>{const K=h3ik(),ih=1/R.dims.h,eY=o.eY*ih,eZ=o.eZ*ih,t=o.t,sw=Math.sin(t*1.6)*(1-Math.abs(o.sh))*0.6,hy=eY-22.5;
  K.hipsAt(R,o.sh*0.8,hy,0.4+sw*0.3);R.hips.rotation.set(-0.04+sw*0.02,0,-o.sh*0.06);R.torso.rotation.set(-0.06,0,0);R.head.rotation.set(-0.55,o.sh*0.3,0);
  for(let s=-1;s<=1;s+=2){const f=h3fr(o.ph+(s>0?0:0.5)),lift=Math.max(0,Math.cos(f*Math.PI*2))*1.2*Math.abs(o.sh);K.armTo(R,s,s*4.3+o.sh*2.2*Math.sin(f*Math.PI*2),eY-0.5+lift,eZ-0.9,s*0.7,0.15,-1);
    if(o.zw<12){K.legTo(R,s,s*2.6,eY-34+(s>0?2.5:0),(o.zw*ih)-2.4,s*0.4,0,1);K.footTo(R,s,-0.6,s*0.2,0);}else{K.legTo(R,s,s*2.0,hy-15.6+(s>0?0.8:0),0.6+sw*1.6*(s>0?1:-0.6),s*0.15,0,1);K.footTo(R,s,0.55,s*0.1,0);}}
  K.cloak(R,0.3);};
M3PO.mantle=(R,o)=>{const K=h3ik(),ih=1/R.dims.h,k=o.k,eY=o.eY*ih,eZ=o.eZ*ih;
  if(k<0.45){const a=h3ss(k/0.45);K.hipsAt(R,0,eY-22.5+a*5,0.4+a*0.8);R.torso.rotation.set(-0.06+0.5*a,0,0);R.head.rotation.set(-0.5+0.3*a,0,0);
    for(let s=-1;s<=1;s+=2){K.armTo(R,s,s*4.2,eY-0.4,eZ-0.9,s*0.8,0.3*a,-1);K.legTo(R,s,s*2.6,eY-34+a*8*(s>0?1:0.4),eZ-2.6,s*0.4,0,1);K.footTo(R,s,-0.5,s*0.2,0);}}
  else if(k<0.75){const b=h3ss((k-0.45)/0.3);K.hipsAt(R,0,h3lerp(eY-16.5,eY-8,b),h3lerp(eZ-5.5,eZ-2.5,b));R.hips.rotation.x=0.35*b;R.torso.rotation.set(h3lerp(0.44,0.95,b),0,0);R.head.rotation.set(h3lerp(-0.2,0.1,b),0,0);
    for(let s=-1;s<=1;s+=2)K.armTo(R,s,s*4.6,eY-0.3,h3lerp(eZ-0.9,eZ+1.5,b),s*1,0.6,-0.2);
    K.legTo(R,1,2.6,h3lerp(eY-28,eY+1.6,b),h3lerp(eZ-2.6,eZ+2.5,b),0.3,0.5,1);K.footTo(R,1,0.2,0.1,0);K.legTo(R,-1,-2.4,eY-29,eZ-2.8,-0.3,0,1);K.footTo(R,-1,-0.3,-0.2,0);}
  else{const c=h3ss((k-0.75)/0.25);K.hipsAt(R,0,h3lerp(eY+9,17.4,c),h3lerp(-1,0,c));R.hips.rotation.x=0.35*(1-c);R.torso.rotation.set(h3lerp(0.8,0.05,c),0,0);R.head.rotation.set(h3lerp(0.1,0,c),0,0);
    K.legTo(R,1,2.2,eY+1.45,h3lerp(3,0.3,c),0.2,0,1);K.footTo(R,1,0,0.1,0);K.legTo(R,-1,-2.2,h3lerp(eY-8,eY+1.45,c),h3lerp(-3,0.4,c),-0.2,0,1);K.footTo(R,-1,h3lerp(0.4,0,c),-0.1,0);
    for(let s=-1;s<=1;s+=2){if(c<0.5)K.armTo(R,s,s*4.5,eY+0.6,Math.max(eZ+1.5,1),s*1,0.6,-0.2);else K.armTo(R,s,s*h3lerp(4.5,4.9,c),h3lerp(eY+3,13.5,(c-0.5)*2),1.5,s*0.6,-0.2,-1);}}
  K.cloak(R,0.6);};
M3PO.prone=(R,o)=>{const K=h3ik(),t=o.t,br=Math.sin(t*1.9);K.hipsAt(R,0,3.7,-2);R.hips.rotation.set(Math.PI/2-0.07,0,0);R.torso.rotation.set(-0.27+br*0.012,0,0);R.torso.scale.set(1,1+br*0.01,1);
  R.head.rotation.set(-1.12+(o.headP||0)*0.6,(o.headY||0)*0.6,0);
  for(let s=-1;s<=1;s+=2){K.armTo(R,s,s*3.4,1.35,16.2,s*0.8,-1,0.1);K.legTo(R,s,s*3.1,1.7,-17,s*0.2,-1,0);K.footTo(R,s,1.35,s*0.15,0);}K.cloak(R,0.15);};
M3PO.crawl=(R,o)=>{const K=h3ik(),ph=o.ph,c2=Math.sin(ph*Math.PI*2);K.hipsAt(R,0,3.6+0.25*Math.abs(c2),-2);R.hips.rotation.set(Math.PI/2-0.05,0.08*c2,0.13*c2);
  R.torso.rotation.set(-0.14,-0.1*c2,-0.12*c2);R.head.rotation.set(-1.25,0.1*c2,0);
  for(let s=-1;s<=1;s+=2){const f=h3fr(ph+(s<0?0:0.5));let y,z;if(f<0.6){const u=f/0.6;z=18.5-9.5*u;y=1.3;}else{const u=(f-0.6)/0.4;z=9+9.5*h3ss(u);y=1.3+2.4*Math.sin(Math.PI*u);}K.armTo(R,s,s*3.6,y,z,s*0.8,-1,0.1);
    const g=h3fr(ph+(s>0?0:0.5));let lx,ly,lz;if(g<0.6){const u=g/0.6;lx=h3lerp(6.8,3.2,u);ly=h3lerp(2.3,1.7,u);lz=h3lerp(-9.5,-17,u);}else{const u=h3ss((g-0.6)/0.4);lx=h3lerp(3.2,6.8,u);ly=1.8+1.8*Math.sin(Math.PI*u);lz=h3lerp(-17,-9.5,u);}
    K.legTo(R,s,s*lx,ly,lz,s*1,-0.6,0.2);K.footTo(R,s,1.2,s*0.6,0);}K.cloak(R,0.15);};
M3PO.lie=(R,o)=>{const K=h3ik(),t=o.t,br=Math.sin(t*1.4);K.hipsAt(R,0,3.5,3);R.hips.rotation.set(-Math.PI/2+0.06,0,0);R.torso.rotation.set(0.1+br*0.015,0,0);R.torso.scale.set(1,1+br*0.012,1);
  R.head.rotation.set(0.25,Math.sin(t*0.2)*0.25,0);for(let s=-1;s<=1;s+=2)K.armTo(R,s,s*2.6,2.4,-12.5,s*1,0.5,0.3);
  K.legTo(R,-1,-2.4,1.6,18.2,-0.2,1,0);K.footTo(R,-1,-1.25,-0.15,0);K.legTo(R,1,2.6,1.45,10.5,0.2,1,0.3);K.footTo(R,1,0.1,0.15,0);K.cloak(R,0);};
M3PO.slide=(R,o)=>{const K=h3ik(),g=Math.min(1.6,o.g||1),st=o.steer||0,vib=Math.sin(o.t*41)*0.012,fa=Math.min(0.9,Math.atan(g)*0.8);
  K.hipsAt(R,0,2*g+9.2,-2);R.hips.rotation.set(0.15,0.35,-st*0.22);R.torso.rotation.set(0.05-0.08*g+vib,-0.3,st*0.15);R.head.rotation.set(-0.1,-0.1,0);
  K.legTo(R,-1,-2.4,-g*7.5+1.45,7.5,-0.3,0.2,1);K.footTo(R,-1,fa,-0.2,0);K.legTo(R,1,2.9,g*2.5+1.45,-2.5,0.5,0.2,1);K.footTo(R,1,fa,0.5,0);
  K.armTo(R,1,6.5,g*6+1.3,-6,1,-0.3,0.2);K.armTo(R,-1,-7.5,21.5,5.5,-1,-0.4,-0.3);K.cloak(R,0.5);};
M3PO.roll=(R,o)=>{const K=h3ik(),k=o.k,TAU=Math.PI*2;let ang,hy;if(k<0.15){const a=h3ss(k/0.15);ang=0.9*a;hy=h3lerp(17.4,9,a);}else if(k<0.8){ang=0.9+(TAU-0.9)*((k-0.15)/0.65);hy=8.6;}else{ang=TAU;hy=h3lerp(8.6,17.2,h3ss((k-0.8)/0.2));}
  const unf=k<0.8?0:h3ss((k-0.8)/0.2),c=Math.cos(ang),sn=Math.sin(ang);K.hipsAt(R,0,hy,0);R.hips.rotation.set(ang,0,0);R.torso.rotation.set(0.55*(1-unf),0,0);R.head.rotation.set(0.75*(1-unf),0,0);
  for(let s=-1;s<=1;s+=2){const fy=hy+(-6.2*c-6.5*sn),fz=-6.2*sn+6.5*c,hy2=hy+(1*c-9.5*sn),hz=1*sn+9.5*c;
    K.legTo(R,s,s*2.2,h3lerp(fy,1.45,unf),h3lerp(fz,s>0?-0.6:0.9,unf),s*0.15,h3lerp(0.3*c-sn,0,unf),h3lerp(0.3*sn+c,1,unf));K.footTo(R,s,h3lerp(ang+0.6,0,unf),s*0.1,0);
    K.armTo(R,s,h3lerp(s*2.6,s*4.5,unf),h3lerp(hy2,13,unf),h3lerp(hz,1.5,unf),s*1,-0.3,-0.2);}K.cloak(R,0.2);};
M3PO.vault=(R,o)=>{const K=h3ik(),ih=1/R.dims.h,k=o.k,oh=o.oh*ih,oz=o.oz*ih,up=k<0.3?h3ss(k/0.3):k<0.7?1:1-h3ss((k-0.7)/0.3);
  K.hipsAt(R,-1.5*up,15.5-3*up,0);R.hips.rotation.set(0,-0.3*up,0.45*up);R.torso.rotation.set(0.35*up,0,-0.2*up);R.head.rotation.set(0.2*up,0.2*up,0);
  if(k<0.75)K.armTo(R,-1,-2.4,oh+0.6,clamp(oz,-4,10),-1,0.3,-0.3);else K.armTo(R,-1,-6,18,2,-1,-0.3,-0.5);K.armTo(R,1,8,24-up*2,3,1,-0.3,-0.5);
  for(let s=-1;s<=1;s+=2){K.legTo(R,s,h3lerp(s*2.1,s>0?6.5:4.5,up),h3lerp(1.45,s>0?8:6.5,up),h3lerp(0.4,s>0?-1:2,up),1,0.4,0.5);K.footTo(R,s,0.3*up,s*0.1+0.4*up,0);}K.cloak(R,0.4);};
function m3finish(R,key,dt){h3hair(R,key);h3blend(R,key,dt);h3faceTick(R,dt,key,P,true);return true;}
function m3poseState(R,dt,t){const o=M3.po,st=M3.st;o.t=t;let key,fn;
  if(st==='climb'){o.zh=M3.zh;o.ph=M3.cph;o.mvx=M3.mvx;o.mvy=M3.mvy;o.mv=M3.mv;o.lunge=M3.lunge>0?h3ss((0.34-M3.lunge)/0.12)*(M3.lunge>0.06?1:M3.lunge/0.06):0;o.tired=S.p.stam<20?1:0;fn=M3PO.climb;key='climbW';}
  else if(st==='hang'){o.eY=41;o.eZ=5.5;o.zw=M3.zw;o.sh=M3.hsh;o.ph=M3.hph;fn=M3PO.hang;key='climbH';}
  else if(st==='mantle'){o.k=Math.min(1,M3.t/M3.T);o.eY=M3.ey-P.y;o.eZ=(M3.ex-P.x)*M3.fx+(M3.ez-P.z)*M3.fz;fn=M3PO.mantle;key='climbM';}
  else if(st==='vault'){o.k=Math.min(1,M3.t/M3.T);o.oh=M3.H+M3.y0-P.y;o.oz=(M3.ex-P.x)*M3.fx+(M3.ez-P.z)*M3.fz;fn=M3PO.vault;key='m3vault';}
  else if(st==='roll'){o.k=Math.min(1,M3.t/M3.T);fn=M3PO.roll;key='m3roll';}
  else if(st==='slide'){o.g=M3.sg;o.steer=M3.steer;fn=M3PO.slide;key='m3slide';}else return false;
  K3.char2Neutral(R);fn(R,o);return m3finish(R,key,dt);}
function m3poseProne(R,dt,t){const o=M3.po;o.t=t;let key,fn;const sp=P.speed||0;
  if(M3.lie){fn=M3PO.lie;key='m3lie';}else if(sp>4){M3.crph+=dt*sp/16;o.ph=M3.crph;fn=M3PO.crawl;key='m3crawl';}else{h3lookTick(dt,o);fn=M3PO.prone;key='m3prone';}
  K3.char2Neutral(R);fn(R,o);return m3finish(R,key,dt);}
// lớp phủ trên dáng đi của hunt3: lội nước, bứt tốc/dừng gấp, giữ thăng bằng
function m3overlay(R,t){if(G.act||G.work||P.air||G.swim||G.sit||G.ride||G.h3aim||!R.armL)return;
  if(M3.wade){R.armL.rotation.z-=0.38;R.armR.rotation.z+=0.38;R.armL.rotation.x-=0.3;R.armR.rotation.x-=0.3;R.torso.rotation.x+=0.07;}
  if(M3.lean){R.torso.rotation.x+=M3.lean;R.hips.rotation.x+=M3.lean*0.35;R.head.rotation.x-=M3.lean*0.5;}
  if(M3.bal){const w=Math.sin(t*2.1)*0.18;R.armL.rotation.set(-0.15,0,-1.25+w);R.armR.rotation.set(-0.15,0,1.25+w);R.foreL.rotation.x=-0.25;R.foreR.rotation.x=-0.25;R.hips.rotation.z+=Math.sin(t*1.7)*0.05;R.torso.rotation.z-=Math.sin(t*1.7)*0.06;}}
{const _pa=poseApply;poseApply=function(Rarg,mode,t){if(G.sleeping||!P.char2||!K3.char2Pose||!P.rig||!P.rig.dims||typeof h3ik!=='function'||!h3ik())return _pa(Rarg,mode,t);
  const R=P.rig,dt=Math.min(0.05,G.dt||0.016);
  if(M3.prone&&(G.act||G.work||G.sit||G.swim||P.air||G.ride||G.h3aim||G.throwAnim>0))m3setProne(false,1);
  try{if(M3.st){const r=m3poseState(R,dt,t);if(r)return r;}else if(M3.prone)return m3poseProne(R,dt,t);}catch(e){if(!M3.perr){M3.perr=1;console.warn('move3 dáng',e);}}
  const r=_pa(Rarg,mode,t);if(r)try{m3overlay(R,t);}catch(e){}return r;};}
{const _ff=h3fadeFor;h3fadeFor=function(a,b){const ma=/^(m3|climb[WHM])/.test(a),mb=/^(m3|climb[WHM])/.test(b);if(!ma&&!mb)return _ff(a,b);
  if(/m3roll|m3vault/.test(a)||/m3roll|m3vault/.test(b))return 0.1;const la=/m3(prone|crawl|lie)/.test(a),lb=/m3(prone|crawl|lie)/.test(b);if(la!==lb)return 0.5;if(la&&lb)return /lie/.test(a+b)?0.6:0.25;
  if(b==='climbM')return 0.12;if(a==='climbM')return 0.2;return 0.22;};}
// giữ người tại chỗ (không bị kéo xuống đất) khi đang leo/đu; độ lệch hình mượt khi bám vào
{const _at=animTick;animTick=function(dt){const sus=!!M3.st,a0=P.air;if(sus)P.air=true;try{_at(dt);}finally{if(sus)P.air=a0;}
  if(P.model&&(M3.ox||M3.oy||M3.oz)){const k=Math.exp(-dt*9);M3.ox*=k;M3.oy*=k;M3.oz*=k;if(Math.abs(M3.ox)+Math.abs(M3.oy)+Math.abs(M3.oz)<0.05)M3.ox=M3.oy=M3.oz=0;P.model.position.x+=M3.ox;P.model.position.y+=M3.oy;P.model.position.z+=M3.oz;}
  try{m3uiTick(dt);}catch(e){}};}

/* ---------- liên kết với các hệ khác ---------- */
// đứng trên đỉnh tháp/tảng đá: mặt đất là đỉnh đá, bỏ va chạm của chính tảng đá đó
{const _gy=groundY;groundY=function(x,z,yRef){const g=_gy(x,z,yRef);const d=M3.deco;if(d){const t=m3dTop(d,x,z),ref=yRef==null?P.y:yRef;if(t>g&&t<=ref+30)return t;}return g;};}
{const _co=collide;collide=function(nx,nz){const d=M3.deco;if(!d)return _co(nx,nz);let hit=null;for(const c of SCOL)if(c.x===d.x&&c.z===d.z){hit=c;break;}if(!hit)return _co(nx,nz);const r0=hit.r;hit.r=-1e4;try{return _co(nx,nz);}finally{hit.r=r0;}};}
// thể lực: không hồi khi đang bám; nằm ngửa hồi nhanh như ngồi
{const _bt=bodyTick;bodyTick=function(dt){const s0=S.p.stam;_bt(dt);if((M3.st==='climb'||M3.st==='hang'||M3.st==='mantle')&&!M3.rest)S.p.stam=Math.min(S.p.stam,s0);
  else if(M3.prone&&M3.lie&&!G.running&&!G.act&&!G.work)S.p.stam=Math.min(maxStam(),S.p.stam+dt*16*(S.p.food>15&&S.p.water>15?1:0.45));};}
// độ ồn/độ lộ: nằm bò rất khó bị phát hiện
function m3noiseK(){if(M3.prone)return M3.lie?0.55:(P.speed||0)>4?0.6:0.45;if(M3.st==='climb'||M3.st==='hang')return 0.8;if(M3.st==='slide')return 1.5;return 1;}
{const _pn=playerNoise;playerNoise=function(){return _pn()*m3noiseK();};window.playerNoise=playerNoise;}
if(typeof L3!=='undefined'&&L3.C){try{const C=L3.C;C._m3sK=C.sK==null?1:C.sK;Object.defineProperty(C,'sK',{configurable:true,enumerable:true,get(){return this._m3sK*m3noiseK();},set(v){this._m3sK=v;}});}catch(e){}}
{const _sn=sneakToggle;sneakToggle=function(v){if(M3.st==='climb'||M3.st==='mantle'||M3.st==='vault'||M3.st==='roll')return;if(M3.st==='hang'){m3drop();return;}
  if(v!=null){if(!v&&M3.prone)m3setProne(false,1);const r=_sn(v);m3sneakIcon();return r;}
  if(M3.prone){m3setProne(false,1);const r=_sn(false);m3sneakIcon();return r;}
  if(G.sneak&&!P.air&&!G.swim&&!G.ride&&!G.ladder&&!M3.st){m3setProne(true);return;}const r=_sn();m3sneakIcon();return r;};}
{const _si=sitToggle;sitToggle=function(v){if(M3.st)return;if(M3.prone&&v==null){M3.lie=!M3.lie;if(M3.lie&&isFP())G.fpitch=Math.max(G.fpitch||0,0.9);uiToast(M3.lie?'😌 Nằm ngửa nghỉ: hồi sức nhanh như ngồi. Đẩy cần để lật người bò tiếp.':'Lật người nằm sấp.','');return;}
  if(M3.prone&&v)m3setProne(false,1);return _si(v);};}
{const _as=actStart;actStart=function(t){if(M3.st){if(M3.st==='climb'||M3.st==='hang')m3ctxDo();return;}if(M3.prone&&t)m3setProne(false,1);return _as(t);};}
{const _ft=findTarget;findTarget=function(){if(M3.st)return null;return _ft();};}
// góc nhìn thứ nhất: mắt thấp khi nằm, nhìn vách khi leo, nhún nhẹ theo nhịp leo
{const _fc=fpCam;fpCam=function(dt){_fc(dt);const st=M3.st;let eh=null,fw=0;
  if(st==='climb'){eh=30;fw=-5;}else if(st==='hang'){eh=31;fw=-1;}else if(st==='mantle'){eh=28;}else if(st==='roll'){eh=10;fw=4;}else if(st==='slide'){eh=19;fw=1;}else if(st==='vault'){eh=24;}else if(M3.prone){eh=M3.lie?5:8.5;fw=M3.lie?-12:11;}
  if(eh==null){M3.feh=null;M3.ffw=0;return;}const c=G.cam;if(M3.feh==null)M3.feh=G.eyeH||33;const kk=Math.min(1,dt*8);M3.feh+=(eh-M3.feh)*kk;M3.ffw+=(fw-M3.ffw)*kk;
  const bob=st==='climb'?Math.sin(M3.cph*Math.PI*4)*0.8*M3.mv:st==='hang'?Math.sin(G.t*1.6)*0.4:0,fx=Math.sin(P.ry),fz=Math.cos(P.ry),ey=P.y+M3.feh+bob+M3.oy;
  c.position.set(P.x+M3.ox+fx*(2.5+M3.ffw),ey,P.z+M3.oz+fz*(2.5+M3.ffw));const pit=G.fpitch||0,cp=Math.cos(pit);c.lookAt(c.position.x+fx*cp*100,ey+Math.sin(pit)*100,c.position.z+fz*cp*100);
  if(st==='climb')c.rotateZ(Math.sin(M3.cph*Math.PI*2)*0.012*M3.mv);else if(st==='roll')c.rotateX(-Math.min(1,M3.t/M3.T)*Math.PI*2);G.eyeH=M3.feh;};}
{const _fa=fpArmTick;fpArmTick=function(dt){_fa(dt);if((M3.st||M3.prone)&&G.fpRig)G.fpRig.visible=false;};}

/* ---------- nút ngữ cảnh, vòng thể lực, phím ---------- */
const M3CTX={drop:['🤚','Buông tay'],up:['⬆️','Leo lên'],roll:['🤸','Lăn'],stand:['🧍','Đứng dậy'],grab:['🧗','Bám vách'],ledge:['⬆️','Leo lên'],down:['⬇️','Leo xuống'],prone:['🐍','Nằm xuống']};
const M3CSS=`.m3btn{position:absolute;right:0;bottom:calc(100% + 10px);min-width:110px;height:44px;padding:0 14px 0 10px;border-radius:22px;border:2px solid var(--acc,#f2c55a);background:rgba(40,26,14,.9);color:#fff3d6;display:flex;align-items:center;justify-content:center;gap:6px;font:800 13px 'Be Vietnam Pro',system-ui,sans-serif;box-shadow:0 0 14px rgba(242,197,90,.45),0 4px 14px rgba(0,0,0,.45);touch-action:none;white-space:nowrap}
.m3btn[hidden]{display:none}.m3btn .m3i{font-size:19px;line-height:1}.m3btn:active{transform:scale(.95)}
.m3ring{position:fixed;left:0;top:0;width:34px;height:34px;margin:-17px 0 0 -17px;z-index:6;pointer-events:none}.m3ring[hidden]{display:none}
.m3ring svg{width:100%;height:100%;transform:rotate(-90deg);filter:drop-shadow(0 1px 2px rgba(0,0,0,.6))}.m3ring circle{fill:none;stroke-width:4}.m3ring .bg{stroke:rgba(0,0,0,.45)}
.m3ring .fg{stroke:#7fd36b;stroke-dasharray:94.25;stroke-linecap:round;transition:stroke .3s}.m3ring.mid .fg{stroke:#f2c55a}.m3ring.low .fg{stroke:#e5532c}.m3ring.low{animation:m3b .5s steps(2) infinite}@keyframes m3b{50%{opacity:.4}}
.m3hint{position:fixed;left:50%;bottom:120px;transform:translateX(-50%);z-index:6;padding:5px 12px;border-radius:14px;background:rgba(40,26,14,.85);border:1px solid var(--acc,#f2c55a);color:#fff3d6;font:700 13px 'Be Vietnam Pro',system-ui,sans-serif;pointer-events:none;display:none}
.m3hint kbd{display:inline-block;min-width:16px;padding:0 4px;margin-right:4px;border-radius:4px;background:#f2c55a;color:#2a1d14;font:800 12px system-ui;text-align:center}
@media (pointer:fine){.m3hint.on{display:block}}body.building .m3btn,body.building .m3hint{display:none!important}`;
function m3init(){M3.init=true;try{m3uiInit();}catch(e){console.warn('move3 nút',e);}
  // chơi chung: gửi tên dáng mới và vẽ được dáng đó trên người chơi khác
  try{if(typeof MPA!=='undefined')['climb','hang','prone','crawl','lie','slide'].forEach(a=>MPA.add(a));}catch(e){}
  try{if(typeof mpAnim==='function'){const _ma=mpAnim;mpAnim=function(){const s=M3.st;if(s==='climb'||s==='mantle')return 'climb';if(s==='hang')return 'hang';if(s==='slide')return 'slide';if(M3.prone)return M3.lie?'lie':(P.speed||0)>4?'crawl':'prone';return _ma();};}}catch(e){}
  try{if(K3&&K3.char2Pose&&!K3._m3){K3._m3=1;const _cp=K3.char2Pose;K3.char2Pose=function(rig,name,t,o){const f=M3RP[name];if(!f)return _cp(rig,name,t,o);const R=rig&&rig.userData&&rig.userData.rig?rig.userData.rig:rig;if(!R||!R.dims)return;K3.char2Neutral(R);try{f(R,t||0);}catch(e){}};}}catch(e){}}
const M3RO={t:0,ph:0,zh:0,mvx:0,mvy:1,mv:1,lunge:0,tired:0,eY:41,eZ:5.5,zw:4,sh:0,g:1.3,steer:0,headY:0,headP:0,k:0};
const M3RP={climb:(R,t)=>{M3RO.t=t;M3RO.ph=t*0.7;M3RO.mvx=0;M3RO.mvy=1;M3RO.mv=1;M3RO.zh=0;M3RO.lunge=0;M3PO.climb(R,M3RO);},hang:(R,t)=>{M3RO.t=t;M3RO.ph=0;M3RO.sh=0;M3RO.zw=4;M3PO.hang(R,M3RO);},
  prone:(R,t)=>{M3RO.t=t;M3RO.headY=0;M3RO.headP=0;M3PO.prone(R,M3RO);},crawl:(R,t)=>{M3RO.t=t;M3RO.ph=t*1.4;M3PO.crawl(R,M3RO);},lie:(R,t)=>{M3RO.t=t;M3PO.lie(R,M3RO);},slide:(R,t)=>{M3RO.t=t;M3RO.g=1.3;M3RO.steer=0;M3PO.slide(R,M3RO);}};
function m3uiInit(){if(M3.ui)return;const acts=document.querySelector('.acts');if(!acts)return;const st=document.createElement('style');st.textContent=M3CSS;document.head.appendChild(st);
  const b=document.createElement('button');b.id='m3Btn';b.className='m3btn';b.hidden=true;b.setAttribute('aria-label','Leo trèo');b.innerHTML='<span class="m3i"></span><span class="m3t"></span>';acts.appendChild(b);M3.ui=b;
  b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();try{auInit();}catch(er){}m3ctxDo();});
  const r=document.createElement('div');r.id='m3ring';r.className='m3ring';r.hidden=true;r.innerHTML='<svg viewBox="0 0 36 36"><circle class="bg" cx="18" cy="18" r="15"/><circle class="fg" cx="18" cy="18" r="15"/></svg>';document.body.appendChild(r);M3.ring=r;M3.rfg=r.querySelector('.fg');
  const h=document.createElement('div');h.className='m3hint';document.body.appendChild(h);M3.hint=h;
  const sb=$('#sneakBtn');if(sb){let tm=0;sb.addEventListener('pointerdown',()=>{clearTimeout(tm);tm=setTimeout(()=>{if(!M3.prone&&!M3.st&&G.t-M3.exitProneT>0.6)m3setProne(true);},450);});const up=()=>clearTimeout(tm);['pointerup','pointerleave','pointercancel'].forEach(k=>sb.addEventListener(k,up));}}
function m3ctxDo(){switch(M3.ctx){case 'drop':m3drop();break;case 'up':m3hangUp();break;case 'roll':M3.rollQ=G.t;break;case 'stand':m3setProne(false,1);sneakToggle(false);break;case 'prone':m3setProne(true);break;
  case 'down':m3climbDown();break;case 'grab':case 'ledge':m3tryGrab(Math.sin(P.ry),Math.cos(P.ry),true);break;}}
function m3uiTick(dt){if(!M3.ui)return;let c='';const st=M3.st;
  if(st==='climb')c='drop';else if(st==='hang')c='up';else if(st)c='';else if(P.air){if(P.vy<-200&&!G.swim)c='roll';}else if(M3.prone)c='stand';
  else if(!G.swim&&!G.build&&!G.sit&&!G.ride&&!G.ladder&&!G.work&&!G.act&&!G.panel){M3.ctxT-=dt;if(M3.ctxT<=0){M3.ctxT=0.15;const p=m3probe(Math.sin(P.ry),Math.cos(P.ry),false);M3.cprobe=p===1?'ledge':p===2||p===3?'grab':'';}c=M3.cprobe;if(G.sneak&&G.t-(M3.edT||-9)<0.3)c='down';if(!c&&G.sneak&&(P.speed||0)<5)c='prone';}
  if(c!==M3.ctx){M3.ctx=c;const b=M3.ui;if(!c)b.hidden=true;else{const L=M3CTX[c];b.querySelector('.m3i').textContent=L[0];b.querySelector('.m3t').textContent=L[1];b.hidden=false;}
    const h=M3.hint;if(h){if(c){h.innerHTML='<kbd>'+(c==='roll'?'Space':c==='prone'||c==='stand'?'Z':'E')+'</kbd>'+M3CTX[c][1];h.classList.add('on');}else h.classList.remove('on');}
    const j=$('#jumpBtn');if(j){const lab=st==='climb'?'Phóng':st==='hang'?'Buông':'Nhảy',i=j.querySelector('i');if(i&&i.textContent!==lab)i.textContent=lab;}}
  // vòng thể lực khi bám/leo
  const r=M3.ring;if(!r)return;const on=(st==='climb'||st==='hang'||st==='mantle')&&!G.panel;if(r.hidden===on)r.hidden=!on;if(!on){M3.rk=-1;return;}
  const k=clamp(S.p.stam/maxStam(),0,1),pc=Math.round(k*100);if(pc!==M3.rk){M3.rk=pc;M3.rfg.style.strokeDashoffset=(94.25*(1-k)).toFixed(1);r.classList.toggle('low',k<0.25);r.classList.toggle('mid',k>=0.25&&k<0.5);}
  let x,y;if(isFP()){x=innerWidth*0.5+46;y=innerHeight*0.5-8;}else{const v=M3.v3||(M3.v3=new THREE.Vector3());v.set(P.x+M3.ox,P.y+50,P.z+M3.oz).project(G.cam);x=(v.x*0.5+0.5)*innerWidth+30;y=(-v.y*0.5+0.5)*innerHeight;}
  x=Math.round(x);y=Math.round(y);if(x!==M3.rx0||y!==M3.ry0){M3.rx0=x;M3.ry0=y;r.style.transform='translate('+x+'px,'+y+'px)';}}
// phím: Ctrl nằm bò · giữ Z = nằm bò (nhấn Z = khom/đứng như cũ, đang khom nhấn Z = nằm) · E = bám/leo/buông khi có việc leo trèo
addEventListener('keydown',e=>{if(typeof G==='undefined'||!G.on||e.target&&e.target.tagName==='INPUT')return;const k=e.code;
  if((k==='ControlLeft'||k==='ControlRight')&&!e.repeat){if(M3.prone){m3setProne(false,1);}else m3setProne(true);m3sneakIcon();return;}
  if(k==='KeyE'&&!G.build&&(M3.st==='climb'||M3.st==='hang'||(!G.target&&M3.ctx&&M3.ctx!=='prone'&&M3.ctx!=='roll'))){e.stopImmediatePropagation();e.preventDefault();m3ctxDo();return;}
  if(k==='KeyZ'&&!e.repeat){clearTimeout(M3.zT);M3.zT=setTimeout(()=>{if(!M3.prone&&!M3.st&&G.t-M3.exitProneT>0.6)m3setProne(true);},450);}},true);
addEventListener('keyup',e=>{if(e.code==='KeyZ')clearTimeout(M3.zT);},true);
