/* ===================== XÂY DỰNG MỞ RỘNG: BỘ PHẬN LẮP GHÉP, BẢN MẪU NHÀ, PHÂN MỤC =====================
   Mô-đun này chỉ thêm và bọc hàm cũ (build2/build3), không sửa tệp khác:
   • ~78 bộ phận mới cùng khổ lưới 40×40 (2 m), tường cao 48, tầng 54 nên ghép khít với nhau và với đồ cũ:
     tường tre đập dập, mây đan, lá cọ, gỗ súc, đá hộc, vách cong (chòi tròn), tường hồi; cửa vòm, cửa hai cánh, cổng ngõ;
     sàn ván, sân cuội, sàn chiếu, sàn kê cột thấp, cột sàn tre, sàn nhà sàn lớn 2×2, ván cầu, cầu tre, cầu ao, đá kê;
     mái vỏ cây, mái ống tre, mái thuyền Đông Sơn (tự mọc đầu đao cong hai đầu hồi), mái góc (chái), mái hai dốc 1 ô, mái chái, mái hiên, mái nón;
     cột tre, cột lửng, cột cái hai tầng, xà, thanh chống, lan can gỗ, cầu thang tre/gỗ (dài 2 ô), thang độc mộc;
     nội thất, bếp & kho, sân vườn, chăn nuôi, phòng thủ, trang trí.
   • Mỗi bộ phận dựng theo công đoạn (cơ chế STG của build3), có thời đại (age), yêu cầu, mô hình K3 ít đỉnh, vẽ hàng loạt (instancing).
   • Bảng Xây chia mục có biểu tượng + ô tìm kiếm (gõ không dấu cũng được).
   • 📐 Bản mẫu: đặt cả cụm nhà dưới dạng bóng mờ rồi dựng dần từng phần (công trường theo thứ tự móng → tường → sàn trên → mái).
     Lưu cụm nhà đã xây thành bản mẫu riêng (chọn 🏠 Cả cụm trong ✋ Di chuyển → 📐 Lưu mẫu) để đặt lại chỗ khác.
   Trạng thái lưu: S.b4 {bps:[bản mẫu riêng], prj:{mã cụm:{n,t}}, seq}; công trường bản mẫu: b.bpg (mã cụm), b.bpPay (chưa trả vật liệu). */
const B4={defs:[],m:{},proto:{},cut:null};
const b4S=()=>S.b4||(S.b4={bps:[],prj:{},seq:1});
const b4norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d');
/* ---------- tra định nghĩa nhanh (BUILD có ~150 món, pieceDef gọi rất nhiều lần mỗi khung hình) ---------- */
{const DM=new Map();let n=-1;pieceDef=function(k){if(BUILD.length!==n){DM.clear();for(const b of BUILD)if(!DM.has(b.id))DM.set(b.id,b);n=BUILD.length;}return DM.get(k);};}
/* ===================== MÔ HÌNH (K3, ít đỉnh, vật liệu dùng chung) ===================== */
(function(){const PI=Math.PI,K=()=>K3,G_=(...a)=>K3.group(...a),M=B4.m;
  const RISE=0.75,ANG=Math.atan(RISE);
  const cy=(r,h,m,o,s)=>K3.cyl(r*0.92,r,h,m,o,s||6);
  const hz=(len,r,m,o,s)=>K3.cyl(r,r,len,m,Object.assign({center:true,rz:PI/2},o),s||6);// trụ nằm ngang theo X
  const hzZ=(len,r,m,o,s)=>K3.cyl(r,r,len,m,Object.assign({center:true,rx:PI/2},o),s||6);// trụ nằm ngang theo Z
  const lash=(x,y,z)=>K3.cyl(2.7,2.7,2.2,'#b49a62',{x,y,z},6);
  const endPosts=(m,H,r)=>[cy(r||2.4,(H||48)+1,m,{x:-20,y:-1}),cy(r||2.4,(H||48)+1,m,{x:20,y:-1})];
  const rails=(m,ys,r,z)=>ys.map(y=>hz(40,r||1,m,{y,z:z||0},5));
  const foot=(x,z,s)=>K3.ico(s||3.6,'stone',{x,z,y:0.4,sy:0.55},0,0.25,Math.abs(Math.round(x*3+z*7))%9+1);
  // tam giác 2 mặt (có độ dày th theo pháp tuyến ~n)
  const tris=(list,m,th)=>{const P=[],T=THREE;for(const t of list){let [a,b,c]=t;const ab=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],ac=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];
      let n=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];const w=t[3]||[0,1,0];if(n[0]*w[0]+n[1]*w[1]+n[2]*w[2]<0){[b,c]=[c,b];n=n.map(v=>-v);}
      const L=Math.hypot(...n)||1,o=n.map(v=>-v/L*th);const sh=p=>[p[0]+o[0],p[1]+o[1],p[2]+o[2]];
      P.push(...a,...b,...c,...sh(a),...sh(c),...sh(b));
      for(const [p,q] of [[a,b],[b,c],[c,a]])P.push(...p,...sh(p),...q,...q,...sh(p),...sh(q));}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));return K3.mesh(g,m,{});};
  // tấm mái dốc chuẩn (z=+20,y=48) → (z=-20,y=78); e: vươn ra ngoài mép (theo dốc), k: nâng theo pháp tuyến, w: bề ngang
  const slab=(m,th,e,k,w,o)=>{o=o||{};const L=50+e+(o.top||0),s0=-e,smid=(s0+50+(o.top||0))/2,dz=Math.cos(ANG),dy=Math.sin(ANG);
    const cyy=48+smid*dy+(k+th/2)*dz,czz=20-smid*dz+(k+th/2)*dy;return K3.box(w||42,th,L,m,{center:true,x:o.x||0,y:cyy,z:czz,rx:ANG});};
  const rafters=(m)=>[-19,0,19].map(x=>K3.box(2.2,2.2,54,m||'dwood',{center:true,x,y:62.2,z:-0.5,rx:ANG}));
  const flame=(s,x,y,z)=>{let fl=null;try{const cf=model(['piece','campfire']);cf.traverse(o=>{if(o.name==='flame'&&!fl)fl=o;});if(fl){fl.parent.remove(fl);fl.scale.multiplyScalar(s);fl.position.set(x,fl.position.y*s+y,z);}}catch(e){}
    if(!fl){fl=K3.group(K3.cone(3.5*s,10*s,'fire',{noShadow:true},6));fl.name='flame';fl.position.set(x,y,z);fl.userData.dyn=1;}return fl;};
  /* ---------------- TƯỜNG (dọc trục X, dài 40, cao 48, chân y=0) ---------------- */
  M.splitBambooWall=()=>G_(endPosts('bamboo'),K3.box(38,46,1.6,'bamboo',{y:0.5}),[-12,-4,4,12].map(x=>K3.box(0.6,46,1.8,'dwood',{x,y:0.5})),rails('bamboo',[7,26,44],1.1,1.6),rails('bamboo',[7,26,44],1.1,-1.6),[7,26,44].map(y=>lash(-20,y-1,0)));
  const weave=(x0,x1,y0,y1)=>{const a=[],w=x1-x0,cx=(x0+x1)/2;for(let y=y0,i=0;y<y1-0.5;y+=4.4,i++)a.push(K3.box(w,Math.min(4,y1-y),0.9,'bamboo',{x:cx,y,z:i%2?0.45:-0.45}));
    for(let x=x0+2.5;x<x1-1;x+=5)a.push(K3.box(1.6,y1-y0,1.2,'thatch',{x,y:y0}));return a;};
  M.rattanWall=()=>G_(endPosts('wood'),weave(-18,18,0.5,46.5),rails('dwood',[1.5,46.5],1.3));
  const palmRows=(x0,x1,y0,y1)=>{const a=[];for(let y=y1-12,i=0;y>=y0-6;y-=10,i++)a.push(K3.box(x1-x0,13,1.3,i%2?'thatch':'palm',{x:(x0+x1)/2,y:Math.max(y0,y),z:0.6,rx:0.12}));return a;};
  M.palmWall=()=>G_(endPosts('wood'),rails('bamboo',[10,28,45],1,-1.2),palmRows(-19.5,19.5,0,48));
  const logs=(x0,x1,ys)=>ys.map((y,i)=>hz(x1-x0,3,i%2?'logs':'wood',{x:(x0+x1)/2,y},7));
  const LY=[3,9,15,21,27,33,39,45];
  M.logWall=()=>G_(logs(-22,22,LY),endPosts('dwood',48,1.8));
  M.stoneWallFull=()=>{const a=[K3.box(40,45,8,'stone',{y:0}),K3.box(42,2.4,9,'dstone',{y:45})];[[-14,6],[-4,16],[9,8],[15,30],[-12,34],[2,28],[-17,22],[8,40]].forEach(([x,y],i)=>a.push(K3.ico(3.2,i%2?'dstone':'stone',{x,y,z:i%3?3.4:-3.4,sx:1.3,sz:0.5},0,0.3,i+2)));return G_(a);};
  M.bambooHalfWall=()=>{const a=[...endPosts('bamboo',24,2.2)];for(let x=-16;x<=16.1;x+=4)a.push(cy(1.5,22,'bamboo',{x,y:0},5));a.push(...rails('bamboo',[6,20],1,1.6),...rails('bamboo',[6,20],1,-1.6),hz(42,1.6,'bamboo',{y:24}));return G_(a);};
  M.stoneLowWall=()=>{const a=[K3.box(40,18,9,'stone',{}),K3.box(41,2,10,'dstone',{y:18})];for(let i=0;i<6;i++)a.push(K3.ico(3,i%2?'stone':'dstone',{x:-15+i*6,y:8+(i%2)*4,z:i%2?4:-4,sz:0.45},0,0.3,i+11));return G_(a);};
  const winFrame=(m)=>[K3.box(18,1.6,3.2,m,{y:16}),K3.box(18,1.6,3.2,m,{y:34}),K3.box(1.6,18,3.2,m,{x:-8.8,y:16}),K3.box(1.6,18,3.2,m,{x:8.8,y:16})];
  M.bambooWindowWall=()=>G_(endPosts('bamboo'),K3.box(11,46,1.6,'bamboo',{x:-14,y:0.5}),K3.box(11,46,1.6,'bamboo',{x:14,y:0.5}),K3.box(17,16,1.6,'bamboo',{y:0.5}),K3.box(17,12,1.6,'bamboo',{y:35}),
    winFrame('dwood'),[-4,0,4].map(x=>cy(0.7,18,'bamboo',{x,y:16},5)),rails('bamboo',[7,44],1.1,1.6));
  M.logWindowWall=()=>G_(logs(-22,22,[3,9,15]),logs(-22,-8,[21,27,33]),logs(8,22,[21,27,33]),logs(-22,22,[39,45]),[-5,-1.7,1.7,5].map(x=>cy(0.9,18,'dwood',{x,y:17.5},5)),K3.box(17,1.4,6,'wood',{y:17.5}),endPosts('dwood',48,1.8));
  M.palmWindowWall=()=>G_(endPosts('wood'),rails('bamboo',[10,45],1,-1.2),palmRows(-19.5,-9,0,48),palmRows(9,19.5,0,48),palmRows(-9,9,0,16),palmRows(-9,9,35,48),winFrame('bamboo'),
    K3.box(18,15,1.4,'palm',{center:true,y:42,z:5.4,rx:-0.75}),cy(0.6,13,'bamboo',{x:7,y:16,z:1.8,rx:0.6},5));
  M.gableWall=()=>G_(M.rattanWall().children.slice(),tris([[[20,48,0],[-20,48,0],[-20,78,0],[0,0,1]]],'thatch',2.2),tris([[[19,48,1.2],[-19,48,1.2],[-19,76,1.2],[0,0,1]]],'mud',0.5),cy(2.4,80,'wood',{x:-20,y:-1}),
    K3.box(2,34,2.4,'dwood',{center:true,x:0,y:63,z:0,rz:-0.64}));
  // vách cong: cung tròn qua 2 góc ô, phình ra -z 8.3 (4 vách ghép thành chòi tròn bán kính 28)
  const arcPts=[-20,-12,-4,4,12,20].map(x=>[x,20-Math.sqrt(800-x*x)]);
  const arc=(skip)=>{const a=[];for(let i=0;i<5;i++){if(skip&&skip(i))continue;const [x0,z0]=arcPts[i],[x1,z1]=arcPts[i+1],L=Math.hypot(x1-x0,z1-z0);a.push(K3.box(L+0.6,46,3.2,'mud',{x:(x0+x1)/2,z:(z0+z1)/2,ry:-Math.atan2(z1-z0,x1-x0)}),
      K3.box(L+0.8,3,3.8,'#7d5c3c',{x:(x0+x1)/2,z:(z0+z1)/2,ry:-Math.atan2(z1-z0,x1-x0)}));}return a;};
  M.roundWall=()=>G_(arc(),cy(2.2,49,'dwood',{x:-20,y:-1}),cy(2.2,49,'dwood',{x:20,y:-1}),K3.box(6,10,0.6,'#a8874e',{x:5,y:14,z:-8.6,ry:-0.04}));
  M.roundWallDoor=()=>{const a=arc(i=>i===1||i===2||i===3);const zc=20-Math.sqrt(800-64);a.push(cy(1.8,36,'dwood',{x:-9,z:zc+0.4}),cy(1.8,36,'dwood',{x:9,z:zc+0.4}),K3.box(26,12,3.2,'mud',{y:35,z:-7.4}),K3.box(26,3,3.8,'dwood',{y:34,z:-7.4}),
      K3.box(14,30,0.8,'hide',{x:-2,y:4,z:-6,ry:0.5}),cy(2.2,49,'dwood',{x:-20,y:-1}),cy(2.2,49,'dwood',{x:20,y:-1}));return G_(a);};
  /* ---------------- CỬA ---------------- */
  M.rattanDoorWall=()=>G_(endPosts('wood'),weave(-18,-9,0.5,46.5),weave(9,18,0.5,46.5),weave(-9,9,35,46.5),cy(1.6,36,'dwood',{x:-9}),cy(1.6,36,'dwood',{x:9}),K3.box(20,2,3,'dwood',{y:34}),
    K3.group(...weave(0,15,1,33)).translateX(-8).rotateY(1.1),rails('dwood',[46.5],1.3));
  M.logDoorWall=()=>{const a=[...logs(-22,-9,LY.slice(0,6)),...logs(9,22,LY.slice(0,6)),...logs(-22,22,[39,45]),K3.box(20,3,6,'dwood',{y:35}),cy(1.9,36,'dwood',{x:-9}),cy(1.9,36,'dwood',{x:9}),...endPosts('dwood',48,1.8)];
    const d=K3.group(K3.box(16,33,2,'wood',{x:8,y:1}),K3.box(15,1.6,2.6,'dwood',{x:8,y:8}),K3.box(15,1.6,2.6,'dwood',{x:8,y:26}));d.position.set(-8,0,1);d.rotation.y=-1.0;a.push(d);return G_(a);};
  M.doorArch=()=>G_(weave(-19,-10,0.5,46.5),weave(10,19,0.5,46.5),cy(2.2,34,'rwood',{x:-10}),cy(2.2,34,'rwood',{x:10}),K3.mesh(new THREE.TorusGeometry(10,1.8,5,9,PI),'rwood',{y:33}),
    K3.box(22,4,3,'rwood',{y:44}),K3.cone(1.6,4,'rwood',{y:48},5),endPosts('wood'),K3.box(6,10,0.6,'hide',{x:0,y:36,z:1.5}));
  M.plankDoubleDoor=()=>{const a=[K3.box(10,46,3,'wood',{x:-15,y:0}),K3.box(10,46,3,'wood',{x:15,y:0}),K3.box(22,10,3,'wood',{y:36}),K3.box(42,3,4,'dwood',{y:46}),cy(2,49,'dwood',{x:-10.5}),cy(2,49,'dwood',{x:10.5}),...endPosts('dwood',48,2)];
    [-1,1].forEach(s=>{const g=K3.group(K3.box(9.6,34,1.6,'wood',{x:s*-4.8,y:1}),K3.box(9.6,1.4,2.2,'dwood',{x:s*-4.8,y:9}),K3.box(9.6,1.4,2.2,'dwood',{x:s*-4.8,y:27}),K3.cyl(0.7,0.7,1,'bronze',{x:s*-8.6,y:18,z:1.2},5));g.position.set(s*10,0,1.4);g.rotation.y=s*0.9;a.push(g);});return G_(a);};
  M.bambooGate=()=>{const a=[cy(2.4,58,'bamboo',{x:-19,y:-2}),cy(2.4,58,'bamboo',{x:19,y:-2}),hz(44,1.6,'bamboo',{y:50}),K3.prism(48,9,14,'thatch',{y:54}),hz(50,1.4,'dwood',{y:62.6})];
    [-1,1].forEach(s=>{const g=K3.group();for(let i=0;i<4;i++)g.add(cy(1.1,26-i,'bamboo',{x:s*(-2.2-i*4.2),y:1},5));g.add(hz(17,0.8,'bamboo',{x:s*-8.6,y:8}),hz(17,0.8,'bamboo',{x:s*-8.6,y:20}));g.position.set(s*17,0,0);g.rotation.y=s*-0.8;a.push(g);});return G_(a);};
  /* ---------------- SÀN (40×40, mặt trên y=6, trừ khi ftop) ---------------- */
  const joists=()=>[-14,0,14].map(z=>K3.box(40,3,3,'dwood',{y:1,z}));
  M.plankFloor=()=>{const a=joists();for(let i=0;i<6;i++)a.push(K3.box(6.4,2,40,i%2?'wood':'logs',{x:-16.67+i*6.67,y:4}));return G_(a);};
  M.pavingFloor=()=>{const a=[K3.box(40,1.6,40,'soil',{y:0})];let s=1;for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){a.push(K3.ico(6.2,(i+j)%2?'stone':'dstone',{x:i*13+(j%2)*2,y:1.4,z:j*13,sy:0.28},0,0.25,s++));}
    [[-20,-6],[20,6],[6,-20],[-6,20]].forEach(([x,z],k)=>a.push(K3.ico(2.4,'stone',{x,z,y:1.4,sy:0.4},0,0.2,k+20)));return G_(a);};
  M.matFloor=()=>{const a=[...joists(),K3.box(40,2.2,40,'wood',{y:3.2}),K3.box(34,0.8,34,'#cfb27a',{y:5.4})];[-12,-4,4,12].forEach(z=>a.push(K3.box(34.2,0.9,1,'#a8874e',{y:5.4,z})));a.push(hzZ(34,0.7,'#a8874e',{x:-17,y:5.8},5),hzZ(34,0.7,'#a8874e',{x:17,y:5.8},5));return G_(a);};
  M.raisedFloor=()=>{const a=[];[[-17,-17],[17,-17],[-17,17],[17,17]].forEach(([x,z])=>a.push(cy(2.2,36,'wood',{x,z,y:-26},6)));[-17,17].forEach(z=>a.push(K3.box(40,2.6,3,'dwood',{y:9,z})));
    for(let i=0;i<8;i++)a.push(K3.box(5,2.2,40,i%2?'wood':'logs',{x:-17.5+i*5,y:11.8}));[-17,17].forEach(x=>a.push(cy(1.2,24,'dwood',{x,z:0,y:-14,rx:0.9},5)));return G_(a);};
  M.verandaFloor=()=>{const a=[...[-16,0,16].map(x=>K3.box(4,3,46,'dwood',{x,y:-1}))];for(let i=0;i<12;i++)a.push(hzZ(40,1.55,'bamboo',{x:-18.3+i*3.33,y:3.6},6));a.push(hz(42,1.8,'bamboo',{y:4.8,z:19}),hz(42,1.8,'bamboo',{y:4.8,z:-19}));return G_(a);};
  const piles=(pts,d)=>pts.map(([x,z])=>cy(2.2,d+8,'dwood',{x,z,y:-d},6));
  M.bridgePlank=()=>{const a=[...piles([[-15,-15],[15,-15],[-15,15],[15,15]],40),...[-15,15].map(x=>K3.box(4,3,40,'dwood',{x,y:1}))];for(let i=0;i<7;i++)a.push(K3.box(30,1.8,5.2,i%2?'wood':'logs',{y:4.2,z:-17+i*5.7}));return G_(a);};
  M.footBridge=()=>{const a=[...piles([[-15,-16],[15,-16],[-15,16],[15,16]],40)];[-15,15].forEach(x=>a.push(K3.box(3,3,42,'dwood',{x,y:0.5})));for(let i=0;i<10;i++)a.push(hz(34,1.5,'bamboo',{y:4.4,z:-18+i*4},6));
    [-17.5,17.5].forEach(x=>{a.push(cy(1.2,24,'bamboo',{x,z:-18,y:3},5),cy(1.2,24,'bamboo',{x,z:18,y:3},5),cy(1.2,24,'bamboo',{x,z:0,y:3},5),hzZ(40,1,'bamboo',{x,y:24}),hzZ(40,0.7,'bamboo',{x,y:15}));});return G_(a);};
  M.jetty=()=>{const a=[...piles([[-16,-16],[16,-16],[-16,16],[16,16],[0,-16],[0,16]],46),...[-16,0,16].map(z=>K3.box(40,3,3,'dwood',{y:0.5,z}))];for(let i=0;i<8;i++)a.push(K3.box(5,1.8,40,i%2?'wood':'logs',{x:-17.5+i*5,y:4.2}));
    a.push(cy(2,22,'dwood',{x:17,z:17,y:2}),K3.torus(3,0.8,'#b49a62',{x:17,y:16,z:17,rx:PI/2},8),K3.torus(4,1,'#b49a62',{x:-12,y:6.6,z:12,rx:PI/2},10));return G_(a);};
  M.steppingStones=()=>G_([[-10,-12,6.4],[9,-2,6],[-6,13,5.6],[13,15,4.6]].map(([x,z,r],i)=>K3.cyl(r,r+0.6,9,i%2?'dstone':'stone',{x,z,y:-7},7)));
  M.gravelPath=()=>{const a=[K3.box(36,1,40,'rock',{y:0.2})];for(let i=0;i<8;i++)a.push(K3.ico(1.4,i%2?'stone':'dstone',{x:-15+((i*13)%30),y:1,z:-17+i*5,sy:0.5},0,0.2,i+30));a.push(hzZ(40,1.3,'dwood',{x:-18.8,y:0.6},5),hzZ(40,1.3,'dwood',{x:18.8,y:0.6},5));return G_(a);};
  M.stonePath=()=>{const a=[K3.box(40,0.8,40,'soil',{y:0})];[[-9,-10,0.1],[9,-9,-0.2],[-8,9,0.15],[10,10,0.05]].forEach(([x,z,ry],i)=>a.push(K3.box(16,1.6,15,i%2?'stone':'dstone',{x,z,y:0.5,ry})));return G_(a);};
  // cột sàn (deck): mặt sàn y=60, cột chôn sâu xuống -30 để đứng được trên dốc
  M.stiltBamboo=()=>{const a=[];[[-18,-18],[18,-18],[-18,18],[18,18]].forEach(([x,z])=>a.push(cy(2.4,88,'bamboo',{x,z,y:-30},6),foot(x,z,3.8)));
    [-18,18].forEach(z=>a.push(K3.box(42,3,3,'dwood',{y:51,z}),K3.cyl(0.9,0.9,48,'bamboo',{center:true,x:0,z,y:28,rz:PI/4},5)));[-18,18].forEach(x=>a.push(K3.box(3,3,42,'dwood',{x,y:24})));
    for(let i=0;i<12;i++)a.push(hzZ(42,1.6,'bamboo',{x:-18.3+i*3.33,y:56.4},6));a.push(hz(42,1.4,'bamboo',{y:58.2,z:-19}),hz(42,1.4,'bamboo',{y:58.2,z:19}));return G_(a);};
  M.stiltDeck2=()=>{const a=[];for(const x of [-37,0,37])for(const z of [-37,0,37]){a.push(cy(3.2,90,'logs',{x,z,y:-30},7),foot(x,z,5));}
    [-37,0,37].forEach(z=>a.push(K3.box(82,4,4,'dwood',{y:50,z})));[-37,37].forEach(x=>a.push(K3.box(4,4,82,'dwood',{x,y:22})));
    for(let i=0;i<10;i++)a.push(K3.box(8,2.6,80,i%2?'wood':'logs',{x:-36+i*8,y:54.6}));a.push(K3.box(84,2,4,'dwood',{y:57.4,z:-40}),K3.box(84,2,4,'dwood',{y:57.4,z:40}));return G_(a);};
  /* ---------------- MÁI ---------------- */
  M.barkRoof=()=>G_(rafters(),slab('dwood',2,6,0),[0,1,2,3].map(i=>K3.box(43,1.4,15,'logs',{center:true,y:48+(i*13+5)*Math.sin(ANG)+2.6*Math.cos(ANG),z:20-(i*13+5)*Math.cos(ANG)+2.6*Math.sin(ANG),rx:ANG}))
    ,[10,34].map(s=>hz(44,1.4,'wood',{y:48+s*Math.sin(ANG)+4.6,z:20-s*Math.cos(ANG)+2.4},5)));
  M.bambooTileRoof=()=>{const a=[...rafters(),slab('bamboo',1.6,5,0)];for(let i=0;i<10;i++){const x=-18+i*4,k=i%2?1.6:2.6;a.push(K3.cyl(1.9,1.9,57,i%2?'bamboo':'dwood',{center:true,x,y:48+22.5*Math.sin(ANG)+k*Math.cos(ANG),z:20-22.5*Math.cos(ANG)+k*Math.sin(ANG),rx:2.214},5));}return G_(a);};
  M.boatRoof=()=>G_(rafters(),[-19,0,19].map(x=>K3.box(2,2,22,'dwood',{center:true,x,y:41,z:28,rx:ANG})),slab('dwood',1.2,16,-0.6),slab('thatch',3,16,0.6),slab('thatch',2.4,10,3.4,41),slab('thatch',2,4,5.6,40),
    K3.box(43,1.2,2,'rwood',{center:true,y:48-15.6*Math.sin(ANG)+3.8*Math.cos(ANG),z:20+15.6*Math.cos(ANG)+3.8*Math.sin(ANG),rx:ANG}));
  // đầu đao (trang trí tự mọc ở hai đầu nóc mái thuyền): trục +X ra ngoài, nóc ở z=0, y≈80
  M.b4horn=()=>{const a=[];for(let k=0;k<3;k++){const x=4+k*8,lift=3+k*5.5+k*k*1.6,sc=1-k*0.2;[-1,1].forEach(s=>{const len=54*sc;
      a.push(K3.box(9,2.6,len,'thatch',{center:true,x,y:80+lift-len/2*Math.sin(ANG),z:s*len/2*Math.cos(ANG),rx:s*ANG}));});}
    for(let k=0;k<4;k++)a.push(K3.box(9,2.4,2.4,'dwood',{center:true,x:2+k*8,y:83+k*6+k*k*1.4,rz:0.35+k*0.12}));
    a.push(K3.cone(2.2,9,'rwood',{x:31,y:108,rz:-0.5},5),K3.sphere(2.6,'rwood',{x:29,y:106},6,5));return G_(a);};
  M.hipCorner=()=>{const A=[-20,44.25,25],B=[25,44.25,25],C=[25,44.25,-20],D=[-20,78,-20],a=[tris([[A,B,D],[B,C,D]],'thatch',3)];
    const p0=new THREE.Vector3(22,46,22),p1=new THREE.Vector3(-20,80,-20),d=p1.clone().sub(p0),m=K3.cyl(1.6,1.6,d.length(),'dwood',{center:true},5);m.position.copy(p0.clone().add(p1).multiplyScalar(0.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());a.push(m);
    a.push(tris([[[-20,40.5,24],[24,40.5,24],[-20,58,0]],[[24,40.5,24],[24,40.5,-20],[0,58,-20]]],'dwood',1));return G_(a);};
  M.ridge1=()=>{const h=48+20*RISE;return G_(tris([[[-21,44.6,25],[21,44.6,25],[21,h+1.5,0]],[[-21,44.6,25],[21,h+1.5,0],[-21,h+1.5,0]],[[-21,44.6,-25],[21,h+1.5,0],[21,44.6,-25],[0,1,0]],[[-21,44.6,-25],[-21,h+1.5,0],[21,h+1.5,0],[0,1,0]]],'thatch',2.6),
    hz(44,2.4,'logs',{y:h+2.2},6),[-19.5,19.5].map(x=>tris([[[x,48,-19],[x,48,19],[x,h-0.5,0],[1,0,0]]],'bamboo',1)),[[-14,-1],[14,1]].map(([x,s])=>K3.box(2,10,2,'dwood',{center:true,x,y:h+5,rz:s*0.6})));};
  M.endCap1=()=>{const h=48+20*RISE,R1=[-21,h+1.5,0],R2=[0,h+1.5,0],E1=[-21,44.6,25],E2=[25,44.6,25],E3=[25,44.6,-25],E4=[-21,44.6,-25];
    return G_(tris([[R1,R2,E2],[R1,E2,E1],[R1,E4,E3,[0,1,0]],[R1,E3,R2,[0,1,0]],[R2,E3,E2,[1,1,0]]],'thatch',2.6),hz(22,2.4,'logs',{x:-10,y:h+2.2},6),K3.sphere(3,'logs',{x:0,y:h+2.6},6,4),tris([[[-19.5,48,-19],[-19.5,48,19],[-19.5,h-0.5,0],[-1,0,0]]],'bamboo',1));};
  M.eaveRoof=()=>{const ang=Math.atan(12/46),L=Math.hypot(46,12)+2;return G_(K3.box(43,2.4,L,'thatch',{center:true,y:44+1.2,z:3,rx:ang}),K3.box(43,1.4,L-2,'leaf',{center:true,y:42.6,z:3,rx:ang}),
    [-19,0,19].map(x=>K3.box(2,2,L,'dwood',{center:true,x,y:42,z:3,rx:ang})),hz(44,1.8,'dwood',{y:38.5,z:24}));};
  M.coneRoof=()=>G_(K3.cone(34,38,'thatch',{y:40},10),K3.cone(31,6,'dwood',{y:38.6},10),K3.cyl(36,34,4,'thatch',{y:38},10),K3.cyl(2.2,1.6,8,'#b49a62',{y:76},6),K3.cone(1.4,6,'rwood',{y:84},5));
  /* ---------------- KHUNG ---------------- */
  M.bambooPost=()=>G_(cy(2.3,55,'bamboo',{y:0},7),foot(0,0,4),[12,26,40].map(y=>K3.cyl(2.5,2.5,0.8,'dwood',{y},7)),lash(0,50,0));
  M.postShort=()=>G_(cy(2.5,28,'wood',{y:0},7),foot(0,0,4),K3.cyl(3,3,1.6,'dwood',{y:27},7));
  M.postTall=()=>G_(cy(3.3,110,'logs',{y:-1},8),foot(0,0,5.4),[52,58].map(y=>lash(0,y,0)),K3.cyl(3.6,3.6,2,'dwood',{y:106},8));
  M.carvedCornerPost=()=>G_(cy(2.8,56,'rwood',{y:0},8),foot(0,0,4.6),[10,22,34,46].map((y,i)=>K3.cyl(3.3,3.3,2.6,i%2?'dwood':'bronze',{y},8)),K3.box(7,2,2,'rwood',{y:52,x:2,rz:-0.3}),K3.cone(1.4,5,'rwood',{x:6,y:52,rz:-1.4},5));
  M.beam=()=>G_(hz(44,2.7,'logs',{y:5.5},7),lash(-18,5.5,0),lash(18,5.5,0),K3.box(3,2,6,'dwood',{x:-18,y:2}),K3.box(3,2,6,'dwood',{x:18,y:2}));
  M.kneeBrace=()=>G_(hz(42,2.2,'logs',{y:18},6),[-1,1].map(s=>K3.box(2.4,22,2.4,'dwood',{center:true,x:s*14,y:9.5,rz:s*0.85})),lash(-20,18,0),lash(20,18,0));
  M.woodRail=()=>G_(cy(2,24,'wood',{x:-20},6),cy(2,24,'wood',{x:20},6),K3.box(42,2.4,4,'dwood',{y:22}),K3.box(40,1.6,2.4,'dwood',{y:4}),[-13,-6.5,0,6.5,13].map(x=>K3.cyl(1,1.3,18,'wood',{x,y:4},6)));
  // cầu thang dài 2 ô (z∈[-40,40]): chân z=+40 y=0 → đầu trên z=-40 y=54
  const stairY=z=>(40-z)/80*54;
  M.bambooStairs=()=>{const a=[];[-14,14].forEach(x=>{const p0=new THREE.Vector3(x,-1,42),p1=new THREE.Vector3(x,55,-40),d=p1.clone().sub(p0),m=K3.cyl(1.8,1.8,d.length(),'bamboo',{center:true},6);m.position.copy(p0.clone().add(p1).multiplyScalar(0.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());a.push(m);});
    for(let i=0;i<12;i++){const z=34-i*6.6;a.push(K3.box(30,1.6,5.6,'bamboo',{x:0,y:stairY(z)-1.2,z}));}a.push(cy(1.4,26,'bamboo',{x:-15,z:30,y:0},5),cy(1.4,26,'bamboo',{x:-15,z:-36,y:54},5));
    const p0=new THREE.Vector3(-15,25,30),p1=new THREE.Vector3(-15,80,-36),d=p1.clone().sub(p0),m=K3.cyl(1,1,d.length(),'bamboo',{center:true},5);m.position.copy(p0.clone().add(p1).multiplyScalar(0.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());a.push(m);return G_(a);};
  M.logStairs=()=>{const a=[];for(let i=0;i<9;i++){const z=36-i*8.9;a.push(K3.box(30,stairY(z)+0.5,8.9,i%2?'wood':'logs',{y:0,z:z-0.2}));}[-15.5,15.5].forEach(x=>a.push(K3.box(2.4,6,82,'dwood',{center:true,x,y:28,z:0,rx:Math.atan(54/80)})));a.push(foot(-15,38,4),foot(15,38,4));return G_(a);};
  M.logLadder=()=>{const f=y=>14.6-y*(12.4/54),p0=new THREE.Vector3(0,-1,f(-1)),p1=new THREE.Vector3(0,62,f(62)),d=p1.clone().sub(p0),a=[];const m=K3.cyl(3.4,4,d.length(),'logs',{center:true},7);m.position.copy(p0.clone().add(p1).multiplyScalar(0.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());a.push(m);
    for(let y=6;y<=54;y+=8)a.push(K3.box(7.4,2,3,'dwood',{x:0,y,z:f(y)+2.6,rx:-0.23}));a.push(K3.cone(3,6,'logs',{y:60,z:f(60)},6));return G_(a);};
  M.fenceCorner=()=>G_(cy(2.2,24,'dwood',{y:-2},6),K3.cone(2.2,5,'dwood',{y:22},6),lash(0,8,0),lash(0,18,0));
  /* ---------------- NỘI THẤT ---------------- */
  M.bambooBed=()=>{const a=[];[[-15,-34],[15,-34],[-15,34],[15,34]].forEach(([x,z])=>a.push(cy(1.6,14,'bamboo',{x,z},5)));[-15,15].forEach(x=>a.push(hzZ(72,1.6,'bamboo',{x,y:12.4})));
    for(let i=0;i<10;i++)a.push(hzZ(70,1.05,'bamboo',{x:-13.5+i*3,y:14},5));a.push(K3.box(28,0.8,62,'#cfb27a',{y:15,z:2}),K3.cyl(3,3,20,'hide',{center:true,rz:PI/2,y:17.6,z:-28},7),K3.box(18,1.4,22,'hide',{y:15.6,z:16,ry:0.1}));return G_(a);};
  M.bench=()=>G_(K3.box(30,1.8,8,'bamboo',{y:11}),[[-12,-2.5],[12,-2.5],[-12,2.5],[12,2.5]].map(([x,z])=>cy(1.1,11,'bamboo',{x,z},5)),hz(26,0.8,'bamboo',{y:4,z:2.5},5),hz(26,0.8,'bamboo',{y:4,z:-2.5},5));
  M.lowTable=()=>G_(K3.cyl(11,11,1.8,'wood',{y:6.6},12),K3.cyl(9,10,1.2,'dwood',{y:5.4},12),K3.cyl(4,5,5.4,'dwood',{},8),K3.sphere(2.6,'clay',{x:-4,y:9.6,z:2,sy:0.6},7,5),K3.sphere(2.4,'clay',{x:4,y:9.5,z:-3,sy:0.6},7,5),K3.box(6,0.8,1,'#cfb27a',{x:2,y:8.6,z:4}));
  M.wallShelf=()=>{const a=[];[[-14,-5],[14,-5],[-14,5],[14,5]].forEach(([x,z])=>a.push(cy(1.2,34,'bamboo',{x,z},5)));[12,24,34].forEach(y=>a.push(K3.box(30,1.2,11,'bamboo',{y})));
    a.push(K3.sphere(3.2,'clay',{x:-8,y:16.6,sy:0.9},7,5),K3.sphere(2.6,'clay',{x:6,y:16,z:1,sy:0.9},7,5),K3.cyl(3,3,5,'bamboo',{x:-2,y:25.2},7),K3.box(8,4,6,'hide',{x:8,y:25.2}),K3.cone(3,4,'thatch',{x:-7,y:35.2},7));return G_(a);};
  M.weaponRack=()=>{const a=[cy(1.4,30,'wood',{x:-14},5),cy(1.4,30,'wood',{x:14},5),hz(32,1,'dwood',{y:27}),hz(32,1,'dwood',{y:9})];
    [-9,-3,3].forEach((x,i)=>{a.push(K3.cyl(0.7,0.7,40,'wood',{x,y:0,z:2,rx:-0.12},5),K3.cone(1.4,5,i===2?'bronze':'stone',{x,y:39.7,z:-2.8,rx:-0.12},5));});
    a.push(K3.mesh(new THREE.TorusGeometry(13,0.6,4,10,PI*0.9),'wood',{x:10,y:18,z:2.5,rz:PI/2+0.15}),K3.box(9,13,4,'hide',{x:9,y:4,z:-3}));return G_(a);};
  const jar=(s,m,x,z)=>[K3.sphere(7*s,m,{x,z,y:7*s,sy:1.15},8,6),K3.cyl(4*s,5*s,3*s,m,{x,z,y:13.5*s},8),K3.mesh(new THREE.TorusGeometry(4.2*s,0.8*s,4,8),m,{x,z,y:16.6*s,rx:PI/2})];
  M.storageJar=()=>G_(jar(1.15,'clay',0,0),K3.cyl(5.3,5.3,1,'wood',{y:19.6},9),K3.cyl(1,1,2,'wood',{y:20.4},5),jar(0.55,'clay',9,6));
  M.basketStack=()=>G_(K3.cyl(9,7,15,'bamboo',{},10),K3.torus(9,1,'#7a5a3a',{y:15,rx:PI/2},12),K3.torus(7.6,0.8,'#7a5a3a',{y:6,rx:PI/2},12),K3.cone(8.6,4,'thatch',{y:14.6},10),K3.cyl(5,4,7,'bamboo',{x:12,z:6},8),K3.torus(5,0.6,'#7a5a3a',{x:12,y:7,z:6,rx:PI/2},10));
  M.oilLamp=()=>G_(K3.cyl(2.6,4,1.4,'clay',{},8),K3.cyl(1,1.2,10,'clay',{y:1.4},6),K3.cyl(3.8,1.6,2.6,'clay',{y:11.2},9),K3.cyl(3.4,3.4,0.4,'#3a2a10',{y:13.4},9),flame(0.35,2.6,13,0));
  M.torchHolder=()=>{const a=[];[0,2.09,4.19].forEach(t=>a.push(K3.cyl(0.9,0.9,30,'wood',{center:true,x:Math.cos(t)*4,y:14,z:Math.sin(t)*4,rx:Math.sin(t)*0.25,rz:-Math.cos(t)*0.25},5)));
    a.push(lash(0,26,0),cy(1.2,12,'dwood',{y:25},5),K3.cyl(2.2,1.6,4,'#b49a62',{y:35},6),flame(0.5,0,38,0));return G_(a);};
  /* ---------------- BẾP & KHO ---------------- */
  M.smokeRack=()=>{const a=[];[[-16,-16],[16,-16],[-16,16],[16,16]].forEach(([x,z])=>a.push(cy(1.6,42,'dwood',{x,z},6)));[-16,16].forEach(z=>a.push(K3.box(36,2,2,'dwood',{y:36,z})));for(let i=0;i<8;i++)a.push(hzZ(34,0.9,'bamboo',{x:-14+i*4,y:38},5));
    [[-8,-6],[0,5],[8,-3]].forEach(([x,z],i)=>a.push(K3.box(3,9,6,i===1?'rwood':'#7a5a3a',{x,y:26,z}),K3.cyl(0.3,0.3,4,'#b49a62',{x,y:34.6,z},4)));a.push(K3.box(30,1.6,8,'#cfb27a',{y:39.2,z:6}),K3.box(14,3,10,'thatch',{x:-6,y:39.4,z:-7}));return G_(a);};
  M.fishRack=()=>{const a=[];[-18,18].forEach(x=>{a.push(K3.cyl(1,1,34,'bamboo',{center:true,x,y:14,z:-8,rx:0.45},5),K3.cyl(1,1,34,'bamboo',{center:true,x,y:14,z:8,rx:-0.45},5));});
    [22,14].forEach(y=>a.push(hz(42,0.8,'bamboo',{y,z:(y-30)*0.48*-0+0})));for(let i=0;i<7;i++)a.push(K3.sphere(3,'dstone',{x:-15+i*5,y:17,z:0.8,sx:0.25,sy:1.4},6,4),K3.cone(1.6,2.4,'dstone',{x:-15+i*5,y:11.5,z:0.8,rx:PI},4));return G_(a);};
  M.hideFrame=()=>G_(cy(1.4,36,'wood',{x:-15},5),cy(1.4,36,'wood',{x:15},5),hz(36,1.1,'wood',{y:33}),hz(36,1.1,'wood',{y:6}),K3.box(24,22,0.8,'hide',{y:8.5}),[-13,13].map(x=>K3.box(0.4,22,0.4,'#b49a62',{x,y:8.5,z:0.5})),K3.box(10,1,8,'hide',{x:6,y:0,z:6}));
  M.footMortar=()=>G_(K3.cyl(7,6,10,'wood',{z:-12},10),K3.cyl(5,5,0.6,'#e8dcc4',{y:9.8,z:-12},9),cy(1.6,10,'dwood',{x:-4,z:4},5),cy(1.6,10,'dwood',{x:4,z:4},5),hz(10,0.8,'dwood',{y:9,z:4}),
    K3.box(4,3,40,'wood',{center:true,y:10,z:2,rx:-0.08}),K3.cyl(1.6,1.8,10,'dwood',{y:9,z:-12},6),K3.box(6,1,7,'dwood',{y:6.6,z:20}));
  M.waterJar=()=>G_(jar(1.25,'clay',0,0),K3.cyl(5.2,5.2,0.6,'water',{y:19},10),K3.cyl(2.4,1.4,2.4,'wood',{x:3,y:20.6,z:1},7),K3.cyl(0.4,0.4,10,'wood',{center:true,x:-1,y:22,z:1,rz:1.2},4),K3.cyl(7,7,1,'stone',{y:-0.4},9));
  M.hearthBox=()=>{const a=[K3.box(34,4,34,'dwood',{}),K3.box(30,4.4,30,'soil',{})];[[-7,-5],[7,-5],[0,7]].forEach(([x,z],i)=>a.push(K3.ico(3.4,'stone',{x,z,y:6,sy:1.1},0,0.2,i+3)));a.push(K3.cyl(5,6,2,'#3c3631',{y:4},10),flame(0.7,0,5,0));
    [-14,14].forEach(x=>a.push(cy(1,30,'bamboo',{x,z:-15},5)));a.push(hz(30,0.8,'bamboo',{y:29,z:-15}),K3.sphere(4,'clay',{x:0,y:22,z:-15,sy:0.8},8,5));return G_(a);};
  /* ---------------- SÂN VƯỜN ---------------- */
  M.gardenBorder=()=>{const a=[K3.box(40,2,6,'soil',{y:-0.6})];for(let i=0;i<7;i++)a.push(K3.ico(3,i%2?'stone':'dstone',{x:-18+i*6,y:2,sy:0.7},0,0.3,i+40));return G_(a);};
  M.flowerBed=()=>{const a=[K3.box(30,4,22,'soil',{}),K3.box(32,2,24,'dstone',{y:-0.6})];const cs=['red','yellow','white','purple'];for(let i=0;i<8;i++){const x=-12+(i%4)*8,z=-4+Math.floor(i/4)*8;a.push(cy(0.4,7,'leaf',{x,z,y:3.6},3),K3.ico(1.9,cs[i%4],{x,z,y:11},0),K3.ico(1.7,'leaf',{x:x+1.2,z:z+0.8,y:6,sy:0.5},0));}return G_(a);};
  M.wellStone=()=>{const a=[K3.cyl(11,12,12,'stone',{},10),K3.cyl(8.6,8.6,0.5,'water',{y:9},10),K3.torus(11,1.2,'dstone',{y:12,rx:PI/2},12)];
    a.push(cy(2.2,30,'dwood',{x:16,z:0}),K3.box(5,4,4,'dwood',{x:16,y:29}),K3.box(64,1.8,1.8,'wood',{center:true,x:6,y:33,rz:-0.32}),K3.box(6,7,6,'stone',{center:true,x:34,y:22,rz:-0.32}),cy(0.5,22,'bamboo',{x:-21,y:14},4),K3.cyl(2.6,2,4,'wood',{x:-21,y:10},7));return G_(a);};
  M.fishPond=()=>{const a=[K3.box(76,1,76,'soil',{y:-1.6}),K3.box(72,0.6,72,'water',{y:-0.6})];for(let i=0;i<16;i++){const t=i/16*PI*2,r=37+((i*7)%3);a.push(K3.ico(3.4,i%2?'stone':'dstone',{x:Math.cos(t)*r,z:Math.sin(t)*r,y:0.4,sy:0.6},0,0.3,i+50));}
    [[-12,8],[10,-14],[18,12]].forEach(([x,z],i)=>a.push(K3.cyl(4.4,4.4,0.3,'leaf',{x,z,y:0},8),i===1?K3.sphere(1.8,'#e88aa8',{x:x+1,z,y:1.6},6,4):null));a.push(cy(0.6,14,'leaf',{x:-28,z:-26,y:0},4),cy(0.6,16,'leaf',{x:-25,z:-29,y:0},4));return G_(a);};
  /* ---------------- CHĂN NUÔI ---------------- */
  M.chickenCoop2=()=>{const a=[];[[-12,-12],[12,-12],[-12,12],[12,12]].forEach(([x,z])=>a.push(cy(1.4,22,'bamboo',{x,z},5)));a.push(K3.box(28,12,28,'bamboo',{y:16}),K3.box(29,1.2,29,'#7a5a3a',{y:22}),K3.prism(36,10,34,'thatch',{y:28}),K3.box(6,7,0.8,'dwood',{y:17,z:14.4}));
    a.push(K3.box(6,1,22,'bamboo',{center:true,y:9,z:24,rx:0.75}),K3.box(14,2,10,'#cfb27a',{x:-18,y:0,z:-16}));return G_(a);};
  M.pigPen=()=>{const a=[];for(const [x,z] of [[-38,-38],[0,-38],[38,-38],[-38,0],[38,0],[-38,38],[38,38],[-14,38],[14,38]])a.push(cy(1.8,22,'dwood',{x,z},5));
    [[0,-38,76,0],[-38,0,0,76],[38,0,0,76],[-26,38,24,0],[26,38,24,0]].forEach(([x,z,w,d])=>{[7,17].forEach(y=>a.push(K3.box(w||2,2.2,d||2,'wood',{x,z,y})));});
    [[-30,-30],[30,-30],[-30,-6],[30,-6]].forEach(([x,z])=>a.push(cy(1.8,34,'bamboo',{x,z},5)));a.push(K3.prism(70,14,34,'thatch',{y:33,z:-18}),K3.box(58,1,24,'#cfb27a',{y:0,z:-20}),K3.box(16,5,6,'wood',{x:10,y:0,z:16}),K3.box(14,1,4,'thatch',{x:10,y:4.6,z:16}));return G_(a);};
  M.buffaloShed=()=>{const a=[];for(const [x,z] of [[-36,-36],[36,-36],[-36,36],[36,36],[0,-36],[0,36]])a.push(cy(2.6,46,'logs',{x,z},6));a.push(K3.hip(92,24,92,'thatch',{y:44}),K3.box(80,3,3,'dwood',{y:42,z:-36}),K3.box(80,3,3,'dwood',{y:42,z:36}));
    [-36,36].forEach(x=>a.push(K3.box(3,3,74,'dwood',{x,y:42})));a.push(K3.box(70,1,60,'#cfb27a',{y:0}),K3.cone(12,14,'thatch',{x:-22,z:-22},9),K3.box(3,16,72,'wood',{x:-36,y:3}),K3.box(26,7,8,'wood',{x:20,y:0,z:-26}),cy(1.2,16,'dwood',{x:26,z:24},5));return G_(a);};
  /* ---------------- PHÒNG THỦ ---------------- */
  M.bambooSpikeFence=()=>{const a=[cy(2.2,40,'dwood',{x:-20,y:-2}),cy(2.2,40,'dwood',{x:20,y:-2}),hz(40,1.2,'dwood',{y:22})];for(let i=0;i<9;i++){const x=-17+i*4.25,s=i%2?1:-1;a.push(K3.cyl(1,1.3,46,'bamboo',{center:true,x,y:20,z:s*1.5,rz:s*0.38,rx:0.18},5),K3.cone(1,4,'bamboo',{x:x+s*-8.2,y:41.2,z:s*1.5+3.9,rz:s*0.38,rx:0.18},5));}return G_(a);};
  M.earthRampart=()=>{const a=[K3.prism(42,30,26,'soil',{y:-2}),K3.prism(42,6,8,'leaf',{y:24})];for(let i=0;i<8;i++){const x=-17.5+i*5;a.push(cy(1.4,18,'dwood',{x,z:-1,y:26},5),K3.cone(1.4,4,'dwood',{x,z:-1,y:44},5));}return G_(a);};
  /* ---------------- TRANG TRÍ ---------------- */
  M.totemBird=()=>{const a=[cy(3,64,'rwood',{},8),foot(0,0,5)];[12,26,40].forEach((y,i)=>a.push(K3.cyl(3.6,3.6,3,i%2?'bronze':'dwood',{y},8),K3.box(8,2,1,'rwood',{y:y+5,z:3})));
    a.push(K3.sphere(4,'rwood',{y:68,sx:1.6,sy:0.8},8,6),K3.sphere(2.4,'rwood',{x:6,y:71},6,5),K3.cone(1.1,10,'rwood',{x:13,y:71,rz:-PI/2},5),K3.box(14,0.8,5,'dwood',{y:69,z:4,rx:-0.5}),K3.box(14,0.8,5,'dwood',{y:69,z:-4,rx:0.5}),K3.cone(2,7,'dwood',{x:-7,y:68,rz:PI/2},4));return G_(a);};
  M.totemDragon=()=>{const a=[cy(2.8,58,'dwood',{},8),foot(0,0,5)];for(let i=0;i<5;i++)a.push(K3.mesh(new THREE.TorusGeometry(4.2,1.3,4,8),'patina',{y:10+i*9,rx:PI/2+0.3,ry:i*0.6}));a.push(K3.sphere(3.6,'patina',{y:61,z:2,sz:1.6},7,5),K3.cone(1,5,'patina',{x:-2,y:63,z:-1,rx:-0.6},4),K3.cone(1,5,'patina',{x:2,y:63,z:-1,rx:-0.6},4),K3.sphere(0.8,'gold',{x:-1.8,y:62.4,z:6},4,3),K3.sphere(0.8,'gold',{x:1.8,y:62.4,z:6},4,3));return G_(a);};
  M.hornPost=()=>{const a=[cy(2.6,46,'dwood',{},7),foot(0,0,4.4),K3.box(7,8,4,'bone',{y:44,z:1.6}),K3.box(4,5,3,'bone',{y:39,z:2.6})];[-1,1].forEach(s=>a.push(K3.mesh(new THREE.TorusGeometry(9,1.3,5,8,PI*0.75),'bone',{x:s*5,y:50,z:1.8,rz:s>0?0:PI*0.25,ry:s>0?0:PI})));a.push(K3.box(1,6,1,'red',{x:-2,y:42,z:3.8}),K3.box(1,6,1,'red',{x:2,y:42,z:3.8}));return G_(a);};
  M.bronzeDrumStand=()=>G_([[-12,-12],[12,-12],[-12,12],[12,12]].map(([x,z])=>cy(1.4,12,'dwood',{x,z},5)),K3.box(28,2,28,'dwood',{y:11}),K3.cyl(11,12.5,11,'bronze',{y:13},14),K3.cyl(12.6,11,3,'bronze',{y:24},14),K3.cyl(12.8,12.8,0.6,'gold',{y:27},14),K3.cyl(3,3,0.8,'bronze',{y:27.4},8),[0,1,2,3].map(i=>K3.box(1.6,0.8,4,'bronze',{x:Math.cos(i*PI/2)*13,y:20,z:Math.sin(i*PI/2)*13,ry:-i*PI/2})));
  // lớp công trường chung cho đồ đặt
  B3M.b4_site=()=>{const a=[];[[-16,-16],[16,-16],[-16,16],[16,16]].forEach(([x,z])=>a.push(K3.cyl(0.7,0.7,9,'dwood',{x,z},5)));[-16,16].forEach(v=>a.push(K3.box(32,0.35,0.35,'#efe4cc',{y:7,z:v}),K3.box(0.35,0.35,32,'#efe4cc',{x:v,y:7})));
    a.push(K3.box(10,2,6,'wood',{x:-6,y:0,z:4}),K3.box(8,1.6,5,'wood',{x:-5,y:2,z:4.5,ry:0.4}),K3.box(6,1.2,3,'#b49a62',{x:6,y:0,z:-5}));return K3.group(a);};
  B3M.b4_stake=()=>K3.group(K3.cyl(0.8,0.8,10,'dwood',{},5),K3.box(4,0.4,0.4,'#efe4cc',{y:9}));
})();
/* ===================== ĐỊNH NGHĨA BỘ PHẬN + CÔNG ĐOẠN ===================== */
{const WB=(fin,c)=>[sPosts('bamboo',{bamboo:1}),sFrame('bamboo',{bamboo:1,rope:1},'knife'),S_(fin,'Hoàn thiện',c,{w:.52,ov:'e_frameB',note:'weave'})];
 const WW=(fin,c)=>[sPosts('wood',{wood:1}),sFrame('wood',{stick:2,rope:1}),S_(fin,'Hoàn thiện',c,{w:.52,ov:'e_frame'})];
 const WM=(fin,c)=>[sPosts('wood',{wood:1}),S_('Đan phên cành (lóng mốt)','Đan phên',{stick:4},{w:.3,ov:'e_wattle',note:'wattle'}),S_(fin,'Trát bùn',c,{w:.45,ov:'e_wattle'})];
 const WS=(fin,c,f)=>[S_('Đào móng, kè đá chân tường','Đào móng',f||{stone:3},{tool:'dig',w:.3,ov:'e_found'}),S_(fin,'Xây đá',c,{w:.7,ov:'e_found'})];
 const WT=(c1,fin,c2)=>[S_('Cắm cọc, căng dây lấy hướng','Cắm cọc',c1,{tool:'dig',w:.35,ov:'e_stakes'}),S_(fin,'Hoàn thiện',c2,{w:.65,ov:'e_stakes'})];
 const FL=(c1,fin,c2)=>[sPad,S_('Kê đá tảng, gác dầm','Gác dầm',c1,{tool:'axe',w:.3,ov:'f_joist'}),S_(fin,'Lát mặt',c2,{w:.45,ov:'f_joist'})];
 const FG=(fin,c)=>[sPad,S_(fin,'Lát mặt',c,{w:.75,ov:'f_pad'})];
 const FW=(c1,fin,c2)=>[S_('Đóng cọc xuống lòng nước, buộc đà','Đóng cọc',c1,{tool:'dig',w:.45,ov:'b4_stake'}),S_(fin,'Lát mặt',c2,{w:.55,ov:'b4_stake'})];
 const FU=(c1,fin,c2)=>[S_('Gác dầm lên đầu tường, đầu cột','Gác dầm',c1,{tool:'axe',w:.4,ov:'f_beams'}),S_(fin,'Lát sàn',c2,{w:.6,ov:'f_beams'})];
 const RF=(c1,fin,c2)=>[S_('Dựng kèo, gác rui mè','Dựng kèo',c1,{tool:'axe',w:.35,ov:'r_rafter'}),S_(fin,'Lợp mái',c2,{w:.65,ov:'r_layer',note:'thatch'})];
 const RC=(c1,fin,c2)=>[S_('Dựng kèo chụm đỉnh, buộc vòng mè','Dựng kèo',c1,{tool:'axe',w:.4,ov:'c_rafter'}),S_(fin,'Lợp mái',c2,{w:.6,ov:'c_rafter',note:'thatch'})];
 const PO=(c,fin)=>[S_(fin||'Đào hố, chôn cột, chèn đá chân cột','Chôn cột',c,{tool:'dig',w:1,note:'postHole'})];
 const BM=(c,fin)=>[S_(fin,'Gác xà',c,{tool:'axe',w:1,note:'lash'})];
 const OB=(c1,c2,fin,tool)=>[S_('Đẽo gọt, chuẩn bị vật liệu','Chuẩn bị',c1,{tool:tool||'axe',w:.4,ov:'b4_site'}),S_(fin,'Lắp ráp',c2,{w:.6,ov:'b4_site'})];
 const OS=(c1,c2,fin)=>[S_('Đào hố, kè đá','Đào hố',c1,{tool:'dig',w:.45,ov:'b4_site'}),S_(fin,'Hoàn thiện',c2,{w:.55,ov:'b4_site'})];
 const SD=(c1,c2,c3,o2)=>[S_('Đào hố sâu, chôn cột','Chôn cột',c1,{tool:'dig',w:.35,ov:o2?'d_posts':'s_posts',note:'postHole'}),S_('Gác đà, giằng chéo, buộc dây','Gác đà',c2,{tool:'axe',w:.35,ov:o2?'d_deck':'s_beams',note:'stilt'}),S_('Lát sàn','Lát sàn',c3,{w:.3,ov:o2?'d_deck':'s_beams'})];
 // [id, mục, kiểu, tên, biểu tượng, thời đại, yêu cầu, công đoạn, thuộc tính thêm, mô tả]
 const T=[
 // ---- TƯỜNG ----
 ['splitBambooWall','tuong','edge','Vách tre đập dập','🎋',1,['bamboo'],WB('Đập dập ống tre thành tấm, ghép kín vách',{bamboo:3}),{},'Ống tre bổ dọc, đập dập thành tấm phẳng ghép kín: vách nhà sàn kiểu Việt cổ, nhẹ mà kín gió.'],
 ['rattanWall','tuong','edge','Vách mây đan','🧺',1,['bambooStrip'],WW('Đan nan mây/tre lóng mốt thành vách',{bambooStrip:6,rope:1}),{},'Nan mây, nan tre đan lóng mốt căng trên khung gỗ: thoáng mát, bền.'],
 ['palmWall','tuong','edge','Vách lá cọ','🌴',0,['fiber','stick'],WT({stick:3},'Kẹp lá cọ từng lớp vào nẹp tre',{fiber:6,stick:2}),{},'Lá cọ, lá gồi kẹp nẹp từng lớp như mái: dựng nhanh, rẻ, che mưa nắng tạm.'],
 ['logWall','tuong','edge','Tường gỗ súc','🪵',2,['wood','axe'],WW('Xếp gỗ súc chồng, khấc ngàm ở hai đầu',{wood:4}),{need:'workbench'},'Thân gỗ tròn xếp chồng, khấc ngàm hai đầu: chắc, ấm, chống thú dữ.'],
 ['stoneWallFull','tuong','edge','Tường đá hộc','🪨',2,['stone','clay'],WS('Xếp đá hộc, trát vữa đất sét',{stone:8,clay:2}),{},'Đá hộc xếp dày, trát vữa đất sét: tường kho, tường chắn chịu lửa.'],
 ['bambooHalfWall','tuong','edge','Vách tre lửng','🎍',0,['bamboo'],WT({bamboo:1},'Cắm ống tre, buộc nẹp ngang',{bamboo:2,rope:1}),{low:1},'Vách tre cao ngang hông: quây hiên, chái bếp, chuồng.'],
 ['stoneLowWall','tuong','edge','Tường đá thấp','🧱',0,['stone'],WS('Xếp đá thấp ngang hông',{stone:5},{stone:2}),{low:1},'Bờ đá xếp ngang hông: rào sân, giữ đất, che gió bếp lửa.'],
 ['bambooWindowWall','tuong','edge','Vách tre cửa sổ','🪟',1,['bamboo'],WB('Ghép vách, chừa ô cửa sổ song tre',{bamboo:3}),{},'Vách tre đập dập có ô cửa sổ song tre đón gió.'],
 ['logWindowWall','tuong','edge','Tường gỗ cửa sổ chấn song','🪟',2,['wood','axe'],WW('Xếp gỗ súc, chừa ô cửa, lắp chấn song',{wood:4}),{need:'workbench'},'Tường gỗ súc có ô cửa sổ chấn song tròn.'],
 ['palmWindowWall','tuong','edge','Vách lá cửa sổ chống','🌿',0,['fiber','stick'],WT({stick:3},'Kẹp lá, làm cánh liếp chống bằng cây sào',{fiber:6,stick:3}),{},'Vách lá có cánh cửa sổ liếp chống lên bằng cây sào, trời mưa thì hạ xuống.'],
 ['gableWall','tuong','edge','Tường hồi tam giác','🔺',2,['bambooStrip','clay'],WW('Đan vách, dựng tam giác hồi, trát bùn',{bambooStrip:6,clay:2}),{},'Vách đầu hồi có tam giác bịt kín dưới mái (đỉnh ở đầu ⟲ xoay về phía nóc). Đặt ở hai đầu nhà, dưới mái hai dốc.'],
 ['roundWall','tuong','edge','Vách cong (chòi tròn)','⭕',0,['clay','stick'],WM('Trát bùn trộn rơm hai mặt',{clay:3,fiber:2}),{},'Vách phên trát bùn uốn cong: bốn vách quanh một ô thành chòi tròn kiểu Hòa Bình. Xoay ⟲ cho lưng cong quay ra ngoài.'],
 // ---- CỬA ----
 ['rattanDoorWall','cua','edge','Vách mây có cửa','🚪',1,['bambooStrip'],WW('Đan vách, làm cánh cửa liếp',{bambooStrip:5,rope:2}),{door:1},'Vách mây đan có cánh cửa liếp đan bằng nan.'],
 ['logDoorWall','cua','edge','Tường gỗ có cửa ván','🚪',2,['wood','plank'],WW('Xếp gỗ súc, lắp khung và cánh cửa ván',{wood:3,plank:2}),{need:'workbench',door:1},'Tường gỗ súc có khung cửa, cánh ván ghép then ngang.'],
 ['doorArch','cua','edge','Khung cửa vòm','⛩️',1,['bamboo','ochre'],WW('Uốn vòm gỗ, sơn son, đan vách hai bên',{bambooStrip:3,ochre:1,stick:2}),{door:1},'Cửa vòm gỗ uốn cong sơn son, hai bên vách đan: lối vào trang trọng.'],
 ['plankDoubleDoor','cua','edge','Cửa hai cánh gỗ','🚪',2,['plank'],WW('Bào ván, ghép hai cánh cửa, lắp chốt',{plank:5,wood:1}),{need:'workbench',door:1},'Cửa chính hai cánh ván gỗ, mở vào trong.'],
 ['bambooGate','cua','edge','Cổng ngõ tre có mái','🎋',3,['bamboo'],WB('Dựng cột cổng, lợp mái tranh nhỏ, làm hai cánh',{bamboo:4,fiber:4,rope:1}),{door:1},'Cổng ngõ làng: hai cột tre, mái tranh nhỏ che trên, hai cánh liếp. Ghép với hàng rào.'],
 ['roundWallDoor','cua','edge','Vách cong có cửa','🛖',0,['clay','stick'],WM('Trát bùn, chừa lối vào, treo mành da',{clay:2,fiber:2,hide:1}),{door:1},'Vách cong trát bùn chừa lối vào có mành da: cửa chòi tròn.'],
 // ---- MÓNG & SÀN ----
 ['plankFloor','mong','floor','Sàn ván gỗ','🟫',2,['plank'],FL({wood:1},'Lát ván bào, đóng nêm',{plank:3}),{need:'workbench',span:2},'Sàn ván bào phẳng trên dầm gỗ. Lát được cả tầng trên (dầm vươn 2 ô).'],
 ['pavingFloor','mong','floor','Sân lát đá cuội','🪨',2,['stone'],FG('Lát đá cuội dẹt, chèn cát kẽ',{stone:5,sand:1}),{ftop:3,span:1},'Sân lát đá cuội: không lầy khi mưa, phơi thóc được.'],
 ['matFloor','mong','floor','Sàn trải chiếu','🟨',2,['mat'],FL({wood:1},'Lát ván, trải chiếu cói',{plank:2,mat:1}),{span:2},'Sàn gỗ trải chiếu cói: ngồi ăn, ngồi chơi trong nhà.'],
 ['raisedFloor','mong','floor','Sàn hiên kê cột thấp','🪑',2,['wood','plank'],FL({wood:2},'Kê cột thấp, gác đà, lát ván cao ngang gối',{plank:3}),{ftop:14,span:2},'Sàn ván kê trên 4 cột thấp (cao hơn đất 0,7 m): hiên nhà, chỗ ngồi hóng mát, dựng được trên đất hơi dốc.'],
 ['verandaFloor','mong','floor','Sàn tre tầng trên','🎍',1,['bamboo'],FU({bamboo:1,rope:1},'Lát cây tre nguyên ống, buộc chặt',{bamboo:3}),{span:1},'Sàn ống tre nguyên cây: lát tầng trên, hiên nhà sàn (vươn 1 ô).'],
 ['stiltBamboo','mong','obj','Cột sàn tre (nhà sàn)','🎋',1,['bamboo','rope'],SD({bamboo:3},{bamboo:1,rope:2},{bamboo:2}),{fp:[1,1],deck:1,shelter:1,water:1},'Bốn cột tre chôn sâu kèm sàn cao 3 m: ghép nhiều ô thành nhà sàn nhẹ, dựng được trên dốc, trên nước nông. Dưới sàn tránh được mưa.'],
 ['stiltDeck2','mong','obj','Sàn nhà sàn lớn (2×2)','🏯',3,['wood','plank'],SD({wood:6},{wood:2,rope:3},{plank:6},1),{fp:[2,2],deck:1,lv:{build:2},water:1},'Chín cột gỗ lim, sàn ván rộng 4×4 m cao 3 m: nền cho nhà sàn lớn. Dựng tường, mái lên trên.'],
 ['bridgePlank','mong','floor','Ván cầu','🌉',1,['wood'],FW({wood:2},'Lát ván ngang trên đà',{wood:2,rope:1}),{water:1,wy:2,span:1},'Một nhịp cầu ván trên cọc: nối nhiều ô thành lối đi qua suối, qua ao.'],
 ['footBridge','mong','floor','Cầu tre có tay vịn','🌁',1,['bamboo','rope'],FW({bamboo:2},'Lát ống tre, dựng tay vịn',{bamboo:3,rope:2}),{water:1,wy:2,span:1},'Cầu tre nhỏ có tay vịn: xoay ⟲ cho tay vịn chạy dọc lối đi.'],
 // ---- MÁI ----
 ['barkRoof','mai','roof','Mái vỏ cây','🌳',0,['wood','stick'],RF({stick:4},'Lợp vỏ cây chồng mép, đè cây ngang',{wood:2,stick:2}),{},'Tấm vỏ cây bóc dài lợp chồng như ngói, đè thân cây cho khỏi bay: mái lán trại thời săn bắt.'],
 ['bambooTileRoof','mai','roof','Mái ống tre bổ đôi','🎋',1,['bamboo'],RF({bamboo:1,stick:2},'Lợp ống tre bổ đôi ngửa sấp xen kẽ',{bamboo:4}),{},'Ống tre bổ đôi xếp ngửa sấp xen kẽ như ngói âm dương: bền hơn tranh, ít phải lợp lại.'],
 ['boatRoof','mai','roof','Mái thuyền Đông Sơn','⛵',4,['fiber','bronze'],RF({wood:2,stick:3},'Lợp tranh dày, vươn mái dài xuống thấp',{fiber:12,stick:2}),{lv:{build:3}},'Mái cong hình thuyền như nhà sàn khắc trên trống đồng: lợp đè lên nhiều ô, hai đầu nóc tự vươn cong lên như mũi thuyền, mái xuôi xuống thấp che kín sàn.'],
 ['hipCorner','mai','roof','Mái góc (chái)','📐',1,['fiber'],RF({stick:4},'Lợp tranh theo hai dốc gặp nhau ở góc',{fiber:7}),{nodeco:1,hipc:1},'Mái dốc hai phía gặp nhau ở góc nhà: đặt ở bốn góc khối mái để thành mái chái (mái bốn dốc). Tự xoay theo góc.'],
 ['ridge1','mai','roof','Mái hai dốc một ô','🏠',1,['fiber'],RF({stick:4},'Lợp tranh hai mái, buộc nóc',{fiber:6,stick:1}),{nodeco:1,mini:1},'Mái hai dốc gọn trong một ô (nóc giữa ô): nối thành dãy cho nhà hẹp, chòi, chái bếp. Tự xoay dọc theo dãy.'],
 ['endCap1','mai','roof','Mái chái đầu hồi','🔼',1,['fiber'],RF({stick:4},'Lợp tranh ba mặt dốc',{fiber:6,stick:1}),{nodeco:1,endc:1},'Đầu mái ba dốc cho dãy mái hai dốc một ô: đặt ở hai đầu dãy, tự quay ra ngoài.'],
 ['eaveRoof','mai','roof','Mái hiên','☂️',0,['fiber','stick'],RF({stick:3},'Lợp lá thoải, đóng thanh đỡ đầu hiên',{fiber:4,stick:1}),{nodeco:1},'Mái thoải thấp hơn mái chính: che hiên, chái bếp, chỗ phơi. Đầu cao ⟲ xoay về phía tường nhà.'],
 ['coneRoof','mai','roof','Mái nón (chòi tròn)','🛖',0,['fiber','stick'],RC({stick:5},'Lợp tranh vòng tròn từ dưới lên đỉnh',{fiber:8}),{cap:1},'Mái tranh hình nón chụp lên một ô: hợp với vách cong thành chòi tròn.'],
 // ---- KHUNG & CẦU THANG ----
 ['bambooPost','khung','corner','Cột tre','🎍',0,['bamboo'],PO({bamboo:1,stone:1}),{},'Cột tre đặt ở góc ô: đỡ sàn trên, mái hiên, chòi.'],
 ['postShort','khung','corner','Cột lửng','🪵',0,['wood'],PO({wood:1}),{low:1},'Cột thấp ngang hông: cột lan can, cột rào, chân bàn ngoài sân.'],
 ['postTall','khung','corner','Cột cái hai tầng','🗼',2,['wood','rope'],PO({wood:3,rope:1},'Đào hố sâu, dựng cột cái cao hai tầng'),{tall2:1},'Cột cái suốt hai tầng: đỡ cả sàn tầng 2 lẫn tầng 3 (tính là cột ở cả hai tầng).'],
 ['beam','khung','edge','Xà ngang','➖',1,['wood','rope'],BM({wood:2,rope:1},'Gác xà lên đầu cột, buộc dây'),{yoff:40},'Xà gỗ gác giữa hai đầu cột, cao trên đầu: đỡ sàn trên, mái mà không chắn lối đi (dùng thay tường).'],
 ['kneeBrace','khung','edge','Xà có thanh chống','📐',1,['wood','rope'],BM({wood:2,stick:2,rope:1},'Gác xà, đóng hai thanh chống chéo'),{yoff:26},'Xà ngang có hai thanh chống chéo: khung hiên vững, đỡ mái, lối đi vẫn thoáng.'],
 ['woodRail','khung','edge','Lan can gỗ tiện','🚧',2,['wood','plank'],WT({wood:1},'Lắp tay vịn, con tiện',{plank:2,wood:1}),{low:1},'Lan can gỗ có con tiện: quanh hiên, sàn tầng trên.'],
 ['bambooStairs','khung','obj','Cầu thang tre (2 ô)','🪜',1,['bamboo','rope'],OB({bamboo:2},{bamboo:3,rope:2},'Gác hai cây tre làm thành, buộc bậc'),{fp:[1,2],stair:1},'Cầu thang tre dài 2 ô, thoải dễ đi. Đặt sát mép sàn tầng trên: tự quay đầu lên về phía sàn.'],
 ['logStairs','khung','obj','Cầu thang gỗ đẽo (2 ô)','🪜',2,['wood','axe'],OB({wood:3},{wood:3},'Đẽo bậc, ghép thành cầu thang'),{fp:[1,2],stair:1},'Bậc gỗ đẽo chắc chắn dài 2 ô: lên nhà sàn, lên gác.'],
 ['logLadder','khung','edge','Thang độc mộc','🪵',1,['wood','axe'],BM({wood:2},'Đẽo khấc bậc trên một thân gỗ'),{},'Một thân gỗ đẽo khấc làm bậc, dựa mép sàn cao: bấm Hành động để leo. Kiểu thang nhà sàn xưa.'],
 ['fenceCorner','khung','corner','Cột góc rào','📍',0,['stick'],PO({stick:2,fiber:1}),{low:1},'Cọc góc buộc dây: chốt góc hàng rào, góc luống.'],
 // ---- NỘI THẤT ----
 ['bambooBed','noi','obj','Giường tre','🛏️',1,['bamboo','mat'],OB({bamboo:2},{bamboo:3,mat:1,hide:1},'Buộc khung, lát nan, trải chiếu','knife'),{fp:[1,2],bed:1},'Giường tre lát nan, trải chiếu, gối da: ngủ mát, hồi sức.'],
 ['bench','noi','obj','Ghế băng tre','🪑',1,['bamboo'],OB({bamboo:1},{bamboo:1,rope:1},'Buộc mặt ghế, chân ghế','knife'),{fp:[1,1],small:1},'Ghế băng dài bằng tre: ngồi hóng mát trước hiên.'],
 ['lowTable','noi','obj','Mâm gỗ chân thấp','🍽️',2,['wood'],OB({wood:2},{wood:1},'Tiện mặt mâm, lắp chân'),{fp:[1,1],small:1},'Mâm gỗ tròn chân thấp: cả nhà ngồi chiếu quây quần bữa cơm.'],
 ['wallShelf','noi','obj','Kệ tre ba tầng','🗄️',1,['bamboo','rope'],OB({bamboo:2},{bamboo:1,rope:1},'Buộc khung, lát ba tầng kệ','knife'),{fp:[1,1],small:1,store:8},'Kệ tre ba tầng: cất 8 ô đồ.'],
 ['weaponRack','noi','obj','Giá vũ khí','🏹',1,['wood','rope'],OB({wood:2},{stick:2,rope:1},'Dựng giá, khoét chỗ gác giáo, cung'),{fp:[1,1],small:1},'Giá gác giáo, cung, khiên da gọn gàng cạnh cửa.'],
 ['storageJar','noi','obj','Chum sành có nắp','🏺',2,['pot','clay'],OB({clay:3},{pot:1,wood:1},'Nặn, nung chum, làm nắp gỗ'),{fp:[1,1],small:1,store:10},'Chum lớn có nắp gỗ: đựng hạt, mắm, cất 10 ô đồ.'],
 ['basketStack','noi','obj','Bồ đựng thóc','🧺',1,['bambooStrip'],OB({bambooStrip:4},{bambooStrip:4,rope:1},'Đan bồ, nong miệng, trét kín','knife'),{fp:[1,1],small:1,store:12},'Bồ nan to đựng thóc, kèm thúng nhỏ: cất 12 ô đồ.'],
 ['oilLamp','noi','obj','Đèn dầu gốm','🪔',2,['pot','clay'],OB({clay:2},{pot:1,fiber:1},'Nặn chân đèn, se bấc, rót mỡ'),{fp:[1,1],small:1,light:1},'Đèn gốm đốt mỡ, dầu thực vật: thắp sáng trong nhà ban đêm.'],
 ['torchHolder','noi','obj','Giá đuốc ba chân','🔥',0,['stick','fiber'],OB({stick:3},{stick:1,fiber:2,rope:1},'Buộc ba chân, cắm đuốc'),{fp:[1,1],small:1,light:1},'Ba cây gậy chụm đầu đỡ bó đuốc: soi sáng sân, bếp.'],
 // ---- BẾP & KHO ----
 ['smokeRack','bep','obj','Gác bếp hun khói','🥓',1,['bamboo','meat'],OB({bamboo:2},{bamboo:2,rope:2},'Dựng cột, lát gác nan trên bếp'),{fp:[1,1],st:'dryRack'},'Gác nan đặt trên bếp: hun khói thịt, cá, gác thóc giống cho khô (dùng như giàn phơi).'],
 ['fishRack','bep','obj','Giàn phơi cá','🐟',0,['stick','fish'],OB({stick:4},{stick:2,rope:1},'Dựng giàn chữ A, gác sào'),{fp:[1,1],st:'dryRack'},'Giàn sào phơi cá khô, thịt khô ngoài nắng gió.'],
 ['hideFrame','bep','obj','Khung căng da','🟫',0,['hide','stick'],OB({stick:3},{stick:2,rope:1},'Dựng khung, xỏ dây căng da'),{fp:[1,1],st:'tanRack'},'Khung gỗ căng da thú để cạo, phơi, thuộc (dùng như khung thuộc da).'],
 ['footMortar','bep','obj','Cối giã chân (cối đạp)','🌾',2,['paddy','wood'],OB({wood:3},{wood:2,stone:2},'Khoét cối, làm cần đạp, chôn trụ'),{fp:[1,1],st:'mortar'},'Cối gỗ với cần đạp bằng chân: giã gạo đỡ mỏi tay hơn cối chày (dùng như cối giã).'],
 ['waterJar','bep','obj','Chum nước có gáo','💧',2,['pot','clay'],OB({clay:3},{pot:1,wood:1},'Nặn, nung chum, kê đá, làm gáo'),{fp:[1,1],small:1,store:6},'Chum nước kê trên phiến đá, gáo dừa vắt miệng: để trước nhà rửa chân tay (cất 6 ô).'],
 ['hearthBox','bep','obj','Bếp đất khung gỗ','♨️',1,['clay','wood'],OB({wood:2},{clay:4,stone:3},'Đóng khung, đổ đất nện, kê ba hòn đá'),{fp:[1,1],st:'campfire',light:1,warm:1,fuel:1},'Khuôn gỗ đổ đất nện, đặt ba hòn đầu rau: bếp lửa an toàn trên sàn nhà sàn (nấu nướng như bếp lửa).'],
 // ---- SÂN VƯỜN ----
 ['gardenBorder','vuon','edge','Bờ luống kè đá','🪨',0,['stone'],WT({stone:1},'Kè đá viền bờ luống',{stone:3}),{low:1},'Hàng đá thấp viền luống rau, lối đi.'],
 ['flowerBed','vuon','obj','Luống hoa','🌺',1,['flower'],OS({stone:2},{flower:3},'Vun đất, trồng hoa'),{fp:[1,1],small:1},'Luống hoa dại viền đá trước sân.'],
 ['wellStone','vuon','obj','Giếng khơi cần vọt','🪣',3,['stone','rope'],OS({stone:10},{stone:6,wood:4,rope:2},'Kè thành giếng, dựng cần vọt'),{fp:[1,1]},'Giếng đất kè đá, cần vọt tre có đối trọng: kéo nước nhẹ tay (trang trí sân).'],
 ['fishPond','vuon','obj','Ao cá nhỏ (2×2)','🐠',3,['fish','clay'],OS({clay:6},{stone:8,clay:4},'Đào ao, nện đáy, kè bờ đá'),{fp:[2,2]},'Ao nhỏ kè đá có sen súng: nuôi cá, lấy nước tưới.'],
 ['jetty','vuon','floor','Cầu ao, bến thuyền','⚓',1,['wood','rope'],FW({wood:3},'Lát ván, dựng cọc buộc thuyền',{wood:2,rope:2}),{water:1,wy:2,span:1},'Bến gỗ trên cọc vươn ra nước: buộc thuyền, giặt giũ, câu cá.'],
 ['steppingStones','vuon','floor','Đá kê lội suối','🪨',0,['stone'],FW({stone:2},'Kê đá phẳng thành bậc',{stone:3}),{water:1,ftop:2,wy:-1},'Những phiến đá kê làm bậc bước qua suối cạn.'],
 ['gravelPath','vuon','floor','Lối đi sỏi','⚪',0,['stone'],FG('Rải sỏi, nẹp gỗ hai bên',{stone:2,stick:2}),{ftop:1.5},'Lối đi rải sỏi có nẹp gỗ: không lầy lội, nối các nhà.'],
 ['stonePath','vuon','floor','Lối lát đá phiến','⬜',2,['stone'],FG('Lát đá phiến phẳng',{stone:4}),{ftop:2},'Lối đi lát đá phiến bằng phẳng.'],
 // ---- CHĂN NUÔI ----
 ['chickenCoop2','chan','obj','Chuồng gà trên cột','🐔',1,['feather','bamboo'],OB({bamboo:2},{bamboo:2,fiber:4},'Dựng cột, quây nan, lợp mái, bắc cầu'),{fp:[1,1]},'Chuồng gà gác trên cột cho khỏi chồn, cáo, có cầu bắc lên.'],
 ['pigPen','chan','obj','Chuồng lợn mái lá (2×2)','🐖',2,['wood','fiber'],OB({wood:4},{wood:4,fiber:8},'Quây rào gỗ, lợp mái lá một nửa'),{fp:[2,2]},'Chuồng lợn quây gỗ, nửa có mái che, có máng ăn.'],
 ['buffaloShed','chan','obj','Chuồng trâu (2×2)','🐃',3,['wood','fiber'],OB({wood:6},{wood:4,fiber:12},'Dựng cột, lợp mái bốn dốc, trải rơm'),{fp:[2,2]},'Chuồng trâu mái tranh bốn dốc trải rơm: trâu là đầu cơ nghiệp nhà nông.'],
 // ---- PHÒNG THỦ ----
 ['bambooSpikeFence','thu','edge','Rào tre gai','🎋',1,['bamboo'],WT({bamboo:1},'Cắm chéo ống tre vót nhọn',{bamboo:3,rope:1}),{},'Ống tre vót nhọn cắm chéo dày đặc: thú dữ, kẻ cướp khó vượt.'],
 ['earthRampart','thu','edge','Lũy đất','⛰️',2,['clay','stone'],WT({stone:2},'Đắp đất, nện chặt, cắm cọc đầu lũy',{clay:6,stick:4}),{},'Bờ lũy đất đắp cao, cắm cọc nhọn trên đỉnh, như lũy làng xưa.'],
 // ---- TRANG TRÍ ----
 ['totemBird','trang','obj','Cột vật tổ chim Lạc','🐦',1,['wood','ochre'],OB({wood:3},{ochre:1,feather:2},'Đẽo cột, khắc hình chim, sơn son'),{fp:[1,1],small:1},'Cột gỗ khắc chim Lạc mỏ dài như trên trống đồng: biểu tượng của làng.'],
 ['totemDragon','trang','obj','Cột giao long','🐉',3,['wood','ochre'],OB({wood:3},{ochre:2,clay:1},'Đẽo cột, khắc giao long quấn quanh'),{fp:[1,1],small:1},'Cột khắc giao long quấn: người Lạc Việt thờ thần nước, xăm mình giao long.'],
 ['hornPost','trang','obj','Cột treo sừng trâu','🐂',1,['bone','wood'],OB({wood:2},{bone:2,rope:1},'Dựng cột, treo đầu sọ sừng trâu'),{fp:[1,1],small:1},'Đầu sọ sừng trâu treo trên cột trước nhà: dấu hiệu sung túc, xua điều dữ.'],
 ['carvedCornerPost','trang','corner','Cột góc chạm khắc','🏛️',2,['wood','ochre'],PO({wood:2,ochre:1},'Chôn cột, chạm vòng hoa văn, sơn son'),{},'Cột góc nhà sơn son, chạm vòng hoa văn: vừa đỡ sàn, mái như cột thường vừa đẹp.'],
 ['bronzeDrumStand','trang','obj','Trống đồng trên giá','🥁',4,['bronze'],OB({wood:2},{bronze:6,hide:1},'Đúc trống, dựng giá gỗ'),{fp:[1,1],small:1,drum:1,lv:{craft:5}},'Trống đồng đặt trên giá gỗ giữa nhà: mặt trống ngôi sao, chim Lạc bay vòng.']];
 const B4FLAGS=['fp','small','low','door','deck','shelter','water','wy','ftop','span','nodeco','hipc','mini','endc','cap','tall2','yoff','stair','bed','store','light','warm','fuel','st','drum','lv','need'];
 for(const [id,c4,kind,n,ic,age,req,stg,fl,d] of T){if(pieceDef(id)){console.warn('trùng mã công trình',id);continue;}
   const def={id,n,cat:c4,c4,kind,ic,age,req,d,cost:{},b4:1};for(const k of B4FLAGS)if(fl[k]!=null)def[k]=fl[k];
   let c=0;stg._cum=stg.map(s=>(c+=s.w));stg._cum[stg.length-1]=1;STG[id]=stg;for(const s of stg)for(const k in s.c)def.cost[k]=(def.cost[k]||0)+s.c[k];
   def.d+=' Công đoạn: '+stg.map((s,i)=>(i+1)+'. '+s.sn+(s.tool?' ('+TOOLN[s.tool]+')':'')).join(' → ')+'.';
   if(def.span)B3SPAN[id]=def.span;BUILD.push(def);B4.defs.push(id);}
 // mái tranh, lá: mục dần, dột, phải lợp lại; vách bùn: phơi khô, mưa xối thì trôi
 ['boatRoof','hipCorner','ridge1','endCap1','eaveRoof','coneRoof'].forEach(k=>B3W[k]={decay:.5,rain:2.2,leak:1,rep:{fiber:3,stick:1}});
 B3W.barkRoof={decay:.3,rain:1.8,leak:1,rep:{wood:1,stick:1}};B3W.bambooTileRoof={decay:.15,rain:1.5,leak:1,rep:{bamboo:1}};
 ['palmWall','palmWindowWall'].forEach(k=>B3W[k]={decay:.4,rain:2,rep:{fiber:3}});
 ['roundWall','roundWallDoor','gableWall'].forEach(k=>{B3W[k]={rainOnly:.35,dry:8,rep:{clay:2,fiber:1}};B3WETOV[k]='e_wet';});}
/* ---------- mô hình qua cùng cổng model() (như build3) ---------- */
{const _model=model;model=function(spec){try{if(K3.ok&&spec[0]==='piece'&&B4.m[spec[1]])return B4.m[spec[1]]();}catch(e){console.warn('mô hình b4',spec,e);}return _model(spec);};}
{const _si=sceneInit;sceneInit=function(){const M=window.SBM;if(M&&!M.b4){M.b4=1;if(M.piece){const o=M.piece;M.piece=(id,...a)=>B4.m[id]?B4.m[id]():o(id,...a);}if(M.list&&M.list.pieces)Object.keys(B4.m).forEach(k=>{if(!M.list.pieces.includes(k))M.list.pieces.push(k);});}_si();};}
/* ===================== ĐỢT 2: VÁCH NỨA, MÁI LÁ GỒI, KHO THÓC, CHUỒNG, CẦU TRE, BẾP KIỀNG ===================== */
(function(){const PI=Math.PI,G_=(...a)=>K3.group(...a),M=B4.m,RISE=0.75,ANG=Math.atan(RISE);
  const cy=(r,h,m,o,s)=>K3.cyl(r*0.92,r,h,m,o,s||6),hz=(len,r,m,o,s)=>K3.cyl(r,r,len,m,Object.assign({center:true,rz:PI/2},o),s||6),hzZ=(len,r,m,o,s)=>K3.cyl(r,r,len,m,Object.assign({center:true,rx:PI/2},o),s||6);
  const lash=(x,y,z)=>K3.cyl(2.7,2.7,2.2,'#b49a62',{x,y,z},6);
  const slab=(m,th,e,k,w)=>{const L=50+e,smid=(50-e)/2,dz=Math.cos(ANG),dy=Math.sin(ANG);return K3.box(w||42,th,L,m,{center:true,y:48+smid*dy+(k+th/2)*dz,z:20-smid*dz+(k+th/2)*dy,rx:ANG});};
  const rafters=()=>[-19,0,19].map(x=>K3.box(2.2,2.2,54,'dwood',{center:true,x,y:62.2,z:-0.5,rx:ANG}));
  const flame=(s,x,y,z)=>{let fl=null;try{const cf=model(['piece','campfire']);cf.traverse(o=>{if(o.name==='flame'&&!fl)fl=o;});if(fl){fl.parent.remove(fl);fl.scale.multiplyScalar(s);fl.position.set(x,fl.position.y*s+y,z);}}catch(e){}
    if(!fl){fl=K3.group(K3.cone(3.5*s,10*s,'fire',{noShadow:true},6));fl.name='flame';fl.position.set(x,y,z);fl.userData.dyn=1;}return fl;};
  // vách nứa: nan nứa to bản đan lóng đôi (màu trắng ngà), khung tre
  const nua=(x0,x1,y0,y1)=>{const a=[],cx=(x0+x1)/2,w=x1-x0;for(let y=y0,i=0;y<y1-0.5;y+=4.2,i++)a.push(K3.box(w,Math.min(4,y1-y),0.7,i%2?'#e8d9a8':'#d6c48e',{x:cx,y,z:i%2?0.35:-0.35}));
    for(let x=x0+2.2;x<x1;x+=4.6)a.push(K3.box(1.6,y1-y0,0.5,(Math.round(x)%2)?'#cdb880':'#e8d9a8',{x,y:y0,z:0}));return a;};
  const bpost=(H)=>[cy(2.3,(H||48)+1,'bamboo',{x:-20,y:-1}),cy(2.3,(H||48)+1,'bamboo',{x:20,y:-1})];
  const brails=(ys)=>ys.flatMap(y=>[hz(40,1,'bamboo',{y,z:1.3},5),hz(40,1,'bamboo',{y,z:-1.3},5)]);
  M.nuaWall=()=>G_(bpost(),nua(-18.5,18.5,0.5,47),brails([6,26,45]));
  M.nuaWindowWall=()=>G_(bpost(),nua(-18.5,-9,0.5,47),nua(9,18.5,0.5,47),nua(-9,9,0.5,16),nua(-9,9,35,47),brails([6,45]),[-4,0,4].map(x=>cy(0.7,19,'bamboo',{x,y:16},5)),hz(19,1.2,'bamboo',{y:16}),hz(19,1.2,'bamboo',{y:35}));
  M.nuaDoorWall=()=>{const d=K3.group(...nua(0,15,1,33));d.position.set(-8,0,1);d.rotation.y=1.0;return G_(bpost(),nua(-18.5,-9,0.5,47),nua(9,18.5,0.5,47),nua(-9,9,35,47),cy(1.5,36,'bamboo',{x:-9}),cy(1.5,36,'bamboo',{x:9}),brails([45]),d);};
  M.nuaHalfWall=()=>G_(bpost(24),nua(-18.5,18.5,0.5,23),brails([4,22]),hz(42,1.5,'bamboo',{y:24}));
  // mái lá gồi: lớp lá xếp chồng thành vảy, màu nâu xanh
  const leafCourses=(n,cols)=>{const a=[];for(let i=0;i<n;i++){const s=-6+i*(56/n),k=1.6+i*0.15;a.push(K3.box(43,1.8,15,cols[i%cols.length],{center:true,y:48+(s+7)*Math.sin(ANG)+k*Math.cos(ANG),z:20-(s+7)*Math.cos(ANG)+k*Math.sin(ANG),rx:ANG+0.06}));}return a;};
  M.leafGoiRoof=()=>G_(rafters(),slab('dwood',1,6,-0.4),leafCourses(5,['palm','thatch','dleaf']),hz(44,1.2,'bamboo',{y:72,z:-12}));
  M.leafBoatRoof=()=>G_(rafters(),slab('dwood',1.2,16,-0.6),slab('palm',2.6,16,0.6),leafCourses(5,['palm','thatch']),K3.box(43,1.2,2,'rwood',{center:true,y:48-15.6*Math.sin(ANG)+3.4*Math.cos(ANG),z:20+15.6*Math.cos(ANG)+3.4*Math.sin(ANG),rx:ANG}));
  // kho thóc tre trên cột (1 ô) và kho lớn (2×2)
  const disc=(x,z,y)=>K3.cyl(5.6,5.6,1,'dwood',{x,z,y},9);
  M.granaryBamboo=()=>{const a=[];[[-13,-13],[13,-13],[-13,13],[13,13]].forEach(([x,z])=>a.push(cy(1.8,30,'bamboo',{x,z,y:-2},6),disc(x,z,18)));a.push(K3.box(34,2.6,34,'bamboo',{y:26}),...nua(-15,15,28.6,52).map(m=>{m.position.z+=15;return m;}),K3.box(30,24,30,'#d6c48e',{y:28.5}),
    K3.pyr(44,24,44,'palm',{y:51}),K3.pyr(40,22,40,'thatch',{y:52}),K3.box(8,11,0.8,'dwood',{y:33,z:15.6}),hz(16,0.6,'bamboo',{y:7,z:20,rx:0.9}));return G_(a);};
  M.granaryBig=()=>{const a=[];for(const x of [-30,0,30])for(const z of [-30,0,30])a.push(cy(2.6,34,'logs',{x,z,y:-2},7),disc(x,z,20));a.push(K3.box(72,3,72,'wood',{y:28}),K3.box(64,30,64,'#d6c48e',{y:31}),K3.hip(86,30,86,'thatch',{y:59}),K3.box(14,18,1,'dwood',{y:34,z:32.2}));
    for(let i=0;i<6;i++)a.push(K3.box(16,1.6,4.6,'wood',{y:4+i*5,z:44-i*3.6}));return G_(a);};
  // chuồng vịt bên ao, giàn gà đậu, chuồng dê
  M.duckHouse=()=>G_([[-14,-10],[14,-10],[-14,10],[14,10]].map(([x,z])=>cy(1.2,8,'bamboo',{x,z,y:-4},5)),K3.box(30,10,22,'#d6c48e',{y:4}),K3.prism(34,9,26,'palm',{y:14}),K3.box(8,7,0.8,'dwood',{y:4,z:11.2}),K3.box(8,1,16,'bamboo',{center:true,y:3,z:18,rx:-0.35}),K3.sphere(2.6,'white',{x:8,y:2.4,z:22,sx:1.4},6,4),K3.sphere(1.4,'white',{x:11,y:5,z:22},5,4),K3.cone(0.7,2,'yellow',{x:12.6,y:4.6,z:22,rz:-PI/2},4));
  M.chickenRoost=()=>{const a=[cy(1.3,34,'bamboo',{x:-16},5),cy(1.3,34,'bamboo',{x:16},5)];[12,20,28].forEach((y,i)=>a.push(hz(34,0.8,'bamboo',{y,z:(i-1)*3},5)));
    [[-8,28.8],[4,20.8],[10,12.8]].forEach(([x,y])=>a.push(K3.sphere(2.4,'rwood',{x,y:y+1,z:0,sx:1.3},6,4),K3.sphere(1.3,'red',{x:x+3,y:y+3.4},5,3).translateX(0)));return G_(a.map((m,i)=>i>4?m:m));};
  M.goatShed=()=>{const a=[];for(const [x,z] of [[-38,-38],[38,-38],[-38,38],[38,38],[0,-38],[0,38],[-38,0],[38,0]])a.push(cy(1.8,24,'dwood',{x,z},5));
    [[0,-38,76,2],[-38,0,2,76],[38,0,2,76],[-24,38,28,2],[24,38,28,2]].forEach(([x,z,w,d])=>[6,13,20].forEach(y=>a.push(K3.box(w,1.6,d,'bamboo',{x,z,y}))));
    a.push(K3.box(70,3,30,'bamboo',{y:16,z:-20}),...[[-34,-34],[34,-34],[-34,-6],[34,-6]].map(([x,z])=>cy(1.6,40,'bamboo',{x,z},5)),K3.prism(78,12,38,'palm',{y:38,z:-20}),K3.box(14,5,5,'wood',{x:16,y:0,z:14}),K3.box(18,1,10,'thatch',{x:-14,y:0,z:14}));return G_(a);};
  // cầu khỉ (một cây tre, tay vịn) và cầu tre cong
  M.monkeyBridge=()=>{const a=[];[[-16,0],[16,0]].forEach(([z])=>{a.push(cy(1.4,46,'bamboo',{x:-5,z,y:-34,rz:-0.25},5),cy(1.4,46,'bamboo',{x:5,z,y:-34,rz:0.25},5));});a.push(hzZ(44,2.2,'bamboo',{y:4.6},6),hzZ(44,1.2,'bamboo',{x:0.4,y:5.6},5));
    [-18,0,18].forEach(z=>a.push(cy(0.9,22,'bamboo',{x:-9,z,y:2},5)));a.push(hzZ(42,0.9,'bamboo',{x:-9,y:24},5));return G_(a);};
  M.archBridge=()=>{const a=[],H=n=>6*Math.sin((n+20)/40*PI);for(let i=0;i<10;i++){const z=-18+i*4;a.push(hz(30,1.6,'bamboo',{y:3+H(z),z},6));}
    [-14,14].forEach(x=>{for(let i=0;i<5;i++){const z=-16+i*8;a.push(cy(0.9,20,'bamboo',{x,z,y:3+H(z)},5));}for(let i=0;i<4;i++){const z0=-16+i*8,z1=z0+8,yy=22+(H(z0)+H(z1))/2;a.push(K3.box(1.4,1.4,8.6,'bamboo',{center:true,x,y:yy,z:(z0+z1)/2,rx:-Math.atan2(H(z1)-H(z0),8)}));}});
    [[-12,-18],[12,-18],[-12,18],[12,18],[-12,0],[12,0]].forEach(([x,z])=>a.push(cy(1.8,40,'dwood',{x,z,y:-38+H(z)},6)));return G_(a);};
  // bếp kiềng ba chân, giàn treo nồi, chái bếp
  M.tripodHearth=()=>{const a=[K3.cyl(10,10.5,0.6,'#3c3631',{},10)];[0,2.094,4.189].forEach(t=>a.push(K3.cyl(0.8,1,16,'dwood',{center:true,x:Math.cos(t)*7,y:7,z:Math.sin(t)*7,rx:Math.sin(t)*0.42,rz:-Math.cos(t)*0.42},5)));
    a.push(K3.torus(4.6,0.7,'dwood',{y:14,rx:PI/2},8),K3.sphere(5.4,'clay',{y:14.4,sy:0.75},8,5),K3.torus(3.4,0.6,'clay',{y:18,rx:PI/2},8),flame(0.65,0,1,0));
    [0.3,2.4,4.5].forEach(t=>a.push(K3.cyl(0.8,1,12,'dwood',{center:true,x:Math.cos(t)*3,y:1.2,z:Math.sin(t)*3,rz:PI/2,ry:t},5)));return G_(a);};
  M.potHanger=()=>G_(K3.cyl(10,10.5,0.6,'#3c3631',{},10),[-1,1].map(s=>K3.cyl(0.9,0.9,34,'wood',{center:true,x:s*14,y:15,rz:s*0.12},5)),hz(32,1,'wood',{y:31}),K3.cyl(0.3,0.3,10,'#7a5a3a',{y:21},4),K3.sphere(5,'clay',{y:16,sy:0.8},8,5),K3.cyl(3.4,3.4,0.4,'#3a2a10',{y:19.6},8),flame(0.6,0,1,0));
  M.kitchenShed=()=>{const a=[];[[-18,-38],[18,-38],[-18,38],[18,38],[-18,0],[18,0]].forEach(([x,z])=>a.push(cy(1.8,42,'bamboo',{x,z},5)));a.push(K3.prism(48,14,90,'palm',{y:40,ridgeZ:true}),hzZ(80,1.4,'bamboo',{x:-18,y:40}),hzZ(80,1.4,'bamboo',{x:18,y:40}));
    a.push(...nua(-18,18,0.5,30).map(m=>{m.position.z-=39;return m;}),K3.box(26,4,26,'soil',{z:10}),flame(0.8,0,4,10),[0,2.1,4.2].map(t=>K3.ico(3.4,'stone',{x:Math.cos(t)*6,z:10+Math.sin(t)*6,y:5},0,0.2,3))[0],
      K3.ico(3.4,'stone',{x:-6,z:6,y:5},0,0.2,4),K3.ico(3.4,'stone',{x:5,z:5,y:5},0,0.2,5),K3.box(30,1.4,10,'bamboo',{y:30,z:10}),K3.box(10,6,8,'rwood',{x:-8,y:24,z:10}),K3.box(18,14,8,'bamboo',{x:6,y:0,z:-26}),K3.sphere(4,'clay',{x:6,y:18,z:-26,sy:0.9},7,5));return G_(a);};
  M.flagPole=()=>G_(cy(1.4,80,'bamboo',{},6),K3.sphere(2,'rwood',{y:80},5,4),K3.box(0.6,16,22,'red',{y:58,z:11}),K3.box(0.6,3,22,'yellow',{y:58,z:11}),[0,2.1,4.2].map(t=>K3.ico(3,'stone',{x:Math.cos(t)*3.4,z:Math.sin(t)*3.4,y:0.6},0,0.2,2)));
  M.gongStand=()=>G_(cy(1.6,40,'rwood',{x:-16},6),cy(1.6,40,'rwood',{x:16},6),hz(38,1.4,'rwood',{y:39}),K3.cone(1.6,5,'rwood',{x:-16,y:40},5),K3.cone(1.6,5,'rwood',{x:16,y:40},5),
    [-8,0,8].map((x,i)=>K3.cyl(5-i*0.8,5-i*0.8,1.2,'bronze',{center:true,x,y:27,rx:PI/2},12)),[-8,0,8].map(x=>K3.cyl(0.2,0.2,7,'#7a5a3a',{x,y:31},3)),K3.cyl(0.6,0.6,16,'wood',{center:true,x:12,y:6,z:6,rz:1.1},5));
})();
{const WB=(fin,c)=>[sPosts('bamboo',{bamboo:1}),sFrame('bamboo',{bamboo:1,rope:1},'knife'),S_(fin,'Đan nứa',c,{w:.52,ov:'e_frameB',note:'weave'})];
 const RF=(c1,fin,c2)=>[S_('Dựng kèo, gác rui mè','Dựng kèo',c1,{tool:'axe',w:.35,ov:'r_rafter'}),S_(fin,'Lợp mái',c2,{w:.65,ov:'r_layer',note:'thatch'})];
 const FW=(c1,fin,c2)=>[S_('Đóng cọc xuống lòng nước, buộc đà','Đóng cọc',c1,{tool:'dig',w:.45,ov:'b4_stake'}),S_(fin,'Lát mặt',c2,{w:.55,ov:'b4_stake'})];
 const OB=(c1,c2,fin,tool)=>[S_('Đẽo gọt, chuẩn bị vật liệu','Chuẩn bị',c1,{tool:tool||'axe',w:.4,ov:'b4_site'}),S_(fin,'Lắp ráp',c2,{w:.6,ov:'b4_site'})];
 const OP=(c1,c2,c3,fin)=>[S_('Đào hố, chôn cột, lắp đĩa chắn chuột','Chôn cột',c1,{tool:'dig',w:.3,ov:'g_posts',note:'rats'}),S_('Gác sàn kho','Gác sàn',c2,{tool:'axe',w:.3,ov:'g_deck'}),S_(fin,'Vách, mái',c3,{w:.4,ov:'g_deck'})];
 const T=[
 ['nuaWall','tuong','edge','Vách nứa đan','🎋',1,['bambooStrip'],WB('Đan nan nứa lóng đôi, nẹp khung',{bambooStrip:6}),{},'Nan nứa to bản đan lóng đôi trắng ngà: vách nhà sàn, nhà bếp truyền thống, nhẹ và thoáng.'],
 ['nuaWindowWall','tuong','edge','Vách nứa cửa sổ','🪟',1,['bambooStrip'],WB('Đan nứa, chừa ô cửa song tre',{bambooStrip:5}),{},'Vách nứa đan có ô cửa sổ song tre.'],
 ['nuaDoorWall','cua','edge','Vách nứa có cửa liếp','🚪',1,['bambooStrip'],WB('Đan nứa, làm cánh liếp',{bambooStrip:5,rope:1}),{door:1},'Vách nứa có cánh cửa liếp nứa mở vào trong.'],
 ['nuaHalfWall','tuong','edge','Phên nứa lửng','🎍',1,['bambooStrip'],WB('Đan phên nứa thấp',{bambooStrip:3}),{low:1},'Phên nứa ngang hông: quây hiên, chái bếp, chuồng.'],
 ['leafGoiRoof','mai','roof','Mái lá gồi','🌴',1,['fiber','bamboo'],RF({bamboo:1,stick:2},'Kết lá gồi thành tấm, lợp chồng như vảy',{fiber:8}),{},'Lá gồi (lá cọ) kết thành tấm, lợp chồng nhiều lớp: mái nhà sàn miền núi, mát, kín mưa. Tự xoay hai dốc như mái tranh.'],
 ['leafBoatRoof','mai','roof','Mái lá hình thuyền','⛵',3,['fiber','bamboo'],RF({wood:1,stick:3},'Lợp lá gồi dày, vươn mái dài, uốn đầu hồi',{fiber:10,stick:2}),{boat:1},'Mái lá cong hình thuyền: như mái thuyền Đông Sơn nhưng lợp lá gồi; hai đầu nóc tự vươn cong.'],
 ['granaryBamboo','bep','obj','Kho thóc tre trên cột','🌾',1,['grain','bamboo'],OP({bamboo:3},{bamboo:2,plank:1},{bambooStrip:4,fiber:6},'Quây vách nứa, lợp mái lá'),{fp:[1,1],store:16,ratproof:1},'Kho nhỏ vách nứa trên bốn cột có đĩa chắn chuột: cất 16 ô thóc, hạt, không bị chuột ăn.'],
 ['granaryBig','bep','obj','Kho thóc lớn (2×2)','🏚️',3,['grain','plank'],OP({wood:6},{plank:6,rope:2},{bambooStrip:8,fiber:14},'Quây vách, lợp mái bốn dốc'),{fp:[2,2],store:36,ratproof:1,lv:{build:2}},'Kho thóc chung của làng trên chín cột, có cầu thang gỗ: cất 36 ô.'],
 ['duckHouse','chan','obj','Chuồng vịt bên ao','🦆',2,['feather','bamboo'],OB({bamboo:2},{bambooStrip:3,fiber:4},'Quây nứa, lợp lá, bắc cầu xuống nước'),{fp:[1,1],water:1},'Chuồng vịt thấp có cầu dốc xuống nước: đặt sát bờ ao, bờ suối.'],
 ['chickenRoost','chan','obj','Giàn gà đậu','🐓',1,['feather','bamboo'],OB({bamboo:1},{bamboo:1,rope:1},'Buộc giàn sào cho gà đậu ngủ','knife'),{fp:[1,1],small:1},'Giàn sào tre ba tầng cho gà lên đậu ngủ đêm, tránh chồn cáo.'],
 ['goatShed','chan','obj','Chuồng dê sàn tre (2×2)','🐐',2,['bamboo','fiber'],OB({bamboo:4},{bamboo:4,fiber:8},'Quây rào, gác sàn tre, lợp lá'),{fp:[2,2]},'Chuồng dê có sàn tre gác cao một nửa cho khô chân, mái lá.'],
 ['monkeyBridge','mong','floor','Cầu khỉ','🌉',0,['bamboo'],FW({bamboo:2},'Gác một cây tre, buộc tay vịn',{bamboo:1,rope:1}),{water:1,wy:2,span:1},'Một cây tre bắc qua suối có tay vịn một bên: cầu khỉ quê Việt. Xoay ⟲ cho đúng hướng đi.'],
 ['archBridge','mong','floor','Cầu tre cong','🌁',2,['bamboo','rope'],FW({bamboo:3,wood:2},'Uốn nhịp cong, lát tre, dựng tay vịn',{bamboo:4,rope:2}),{water:1,wy:2,span:1},'Cầu tre nhịp cong có tay vịn hai bên: nối nhiều ô thành cầu qua sông.'],
 ['tripodHearth','bep','obj','Bếp kiềng ba chân','🍲',1,['clay','stick'],OB({stick:3},{clay:2,stone:2},'Chụm ba chân, đặt vòng kiềng, bắc nồi'),{fp:[1,1],small:1,st:'campfire',light:1,warm:1,fuel:1},'Ba chân gỗ chụm đỡ vòng kiềng, nồi đất bắc trên lửa: nấu nướng, sưởi ấm như bếp lửa.'],
 ['potHanger','bep','obj','Giàn treo nồi trên lửa','🫕',0,['stick','clay'],OB({stick:3},{stick:2,rope:1,clay:1},'Dựng hai cọc, gác sào, treo nồi'),{fp:[1,1],small:1,st:'campfire',light:1,warm:1,fuel:1},'Hai cọc chạc, một sào ngang treo nồi trên đống lửa: nấu canh, luộc khoai (như bếp lửa).'],
 ['kitchenShed','bep','obj','Chái bếp (1×2)','🛖',1,['clay','bamboo'],OB({bamboo:4},{fiber:8,clay:4,stone:3},'Dựng cột, lợp lá, đắp bếp đất','axe'),{fp:[1,2],shelter:1,st:'campfire',light:1,warm:1,fuel:1},'Chái bếp lợp lá có bếp đất ba hòn, gác bếp, chum nước: nấu nướng ngay cả khi trời mưa.'],
 ['flagPole','trang','obj','Cột cờ lau','🚩',1,['bamboo','fiber'],OB({bamboo:1},{fiber:3,ochre:1},'Dựng cây tre, buộc cờ'),{fp:[1,1],small:1},'Cây tre cao treo cờ vải nhuộm son: báo hiệu làng, ngày hội.'],
 ['gongStand','trang','obj','Giá cồng chiêng','🔔',4,['bronze'],OB({wood:3},{bronze:4,rope:1},'Đúc cồng, dựng giá, treo dây'),{fp:[1,1],small:1,drum:1,lv:{craft:4}},'Giá gỗ son treo ba chiếc cồng đồng to nhỏ: đánh mừng mùa, gọi dân làng.']];
 const FL=['fp','small','low','door','deck','shelter','water','wy','ftop','span','nodeco','cap','store','light','warm','fuel','st','drum','lv','need','boat','ratproof'];
 for(const [id,c4,kind,n,ic,age,req,stg,fl,d] of T){if(pieceDef(id))continue;const def={id,n,cat:c4,c4,kind,ic,age,req,d,cost:{},b4:1};for(const k of FL)if(fl[k]!=null)def[k]=fl[k];
   let c=0;stg._cum=stg.map(s=>(c+=s.w));stg._cum[stg.length-1]=1;STG[id]=stg;for(const s of stg)for(const k in s.c)def.cost[k]=(def.cost[k]||0)+s.c[k];
   def.d+=' Công đoạn: '+stg.map((s,i)=>(i+1)+'. '+s.sn+(s.tool?' ('+TOOLN[s.tool]+')':'')).join(' → ')+'.';if(def.span)B3SPAN[id]=def.span;BUILD.push(def);B4.defs.push(id);}
 B3W.leafGoiRoof={decay:.7,rain:2.2,leak:1,rep:{fiber:3}};B3W.leafBoatRoof={decay:.6,rain:2.2,leak:1,rep:{fiber:4}};
 BUILD.forEach(b=>{if(b.id==='boatRoof')b.boat=1;});}
/* ===================== GHÉP NỐI VỚI LƯỚI, TẦNG, CHỊU LỰC ===================== */
// sàn mỏng (lối đi, sân, đá kê) và sàn kê cột: mặt sàn theo def.ftop thay vì 6
floorTopL=function(x,z,L){const c=cellAt(x,z);if(!c)return null;const id=c[slotN('floor',L)];if(!id)return null;const b=BYID.get(id);if(!b)return null;if(b.prog!=null&&b.prog<0.999&&L>0)return null;
  const d=pieceDef(b.k)||{};return b.k==='stilt'||d.deck?b.y+60:b.y+(d.ftop!=null?d.ftop:6);};
// cầu thang mới (dài 2 ô): đi lên được như cầu thang cũ
const b4isStair=b=>b.k==='stairs'||!!(pieceDef(b.k)||{}).stair;
stairsTop=function(x,z,yRef){const c=cellAt(x,z);if(!c)return null;let best=null;for(let L=0;L<=LVMAX;L++){const id=c[slotN('obj',L)];if(!id)continue;const b=BYID.get(id);if(!b||b.prog!=null||!b4isStair(b))continue;
    const d=pieceDef(b.k),len=d.stair?(d.fp[1]*CELL):CELL,dx=x-b.x,dz=z-b.z,a=-b.r*Math.PI/2,lz=dx*Math.sin(-a)+dz*Math.cos(-a),t=clamp((len/2-lz)/len,0,1),y=b.y+t*LVH;if(yRef==null||y<=yRef+22)best=best==null?y:Math.max(best,y);}return best;};
// cột cái hai tầng: chiếm cả góc tầng trên (đỡ được sàn tầng kế tiếp)
{const _om=occMark;occMark=function(b,v){_om(b,v);const d=pieceDef(b.k);if(d&&d.tall2){const k=cornerKey(b.x,b.z,(b.lv||0)+1);if(v)OCC.edge.set(k,v);else if(OCC.edge.get(k)===b.id)OCC.edge.delete(k);}};}
// mái riêng (hiên, chái, góc, 1 ô): không ghép nóc/hồi tự động
isRoofK=function(k){const d=pieceDef(k);return !!(d&&d.kind==='roof'&&!d.cap&&!d.nodeco);};
// dàn trang trí mái: bỏ tam giác hồi tự động ở chỗ đã có tường hồi; mọc đầu đao ở hai đầu nóc mái thuyền
function b4DecoSet(k,Lst){let e=DECO[k];if(!Lst.length&&!e)return;if(!e)e=DECO[k]={api:null,cap:0,list:[]};
  if(Lst.length>e.cap){if(e.api){e.api.dispose();G.sc.remove(e.api.G);}e.cap=Math.max(8,Lst.length*2);e.api=instGroup(piecePrep(k).parts,e.cap,{});G.sc.add(e.api.G);seasonPatchAll(e.api.G);}
  e.list=Lst;for(let i=0;i<e.cap;i++){if(i<Lst.length)setPieceM(e.api,i,Lst[i]);else e.api.hide(i);}e.api.flush();}
function b4DecoExtra(){if(!G.sc)return;const gb=DECO.gable;if(gb&&gb.list.length){const keep=gb.list.filter(g=>{const er=g.r%2?1:0;{for(let l=0;l<=LVMAX;l++){const id=OCC.edge.get(edgeKey(g.x,g.z,er,l));const w=id&&BYID.get(id);if(w&&(pieceDef(w.k)||{}).k4gab)return false;}}return true;});
    if(keep.length!==gb.list.length)b4DecoSet('gable',keep);}
  const at=new Map(),horns=[];S.builds.forEach(b=>{if(b.prog==null&&(pieceDef(b.k)||{}).boat)at.set(Math.floor(b.x/CELL)+','+Math.floor(b.z/CELL)+'@'+(b.lv||0),b);});
  const RD=[[0,-1],[-1,0],[0,1],[1,0]];
  at.forEach(b=>{const r=((b.r%4)+4)%4;if(r>=2)return;const L=b.lv||0,cx=Math.floor(b.x/CELL),cz=Math.floor(b.z/CELL),d=RD[r],o=at.get((cx+d[0])+','+(cz+d[1])+'@'+L);if(!o||((o.r%4)+4)%4!==r+2)return;
    const ax=r===0?[1,0]:[0,1],rx=b.x+d[0]*CELL/2,rz=b.z+d[1]*CELL/2;
    for(const s of [1,-1]){const n=at.get((cx+ax[0]*s)+','+(cz+ax[1]*s)+'@'+L);if(n&&((n.r%4)+4)%4===r)continue;const hr=r===0?(s>0?0:2):(s>0?3:1);horns.push({x:rx+ax[0]*s*CELL/2,y:b.y,z:rz+ax[1]*s*CELL/2,r:hr});}});
  b4DecoSet('b4horn',horns);}
{const _dr=decoRebuild;decoRebuild=function(){_dr();try{b4DecoExtra();}catch(e){console.warn('trang trí mái b4',e);}G.cutK=null;roofCut();};}
// tường hồi đánh dấu
BUILD.forEach(b=>{if(b.id==='gableWall')b.k4gab=1;});
/* ---------- đặt thử: nước, xà cao, mái tự xoay theo góc/dãy, cầu thang dài ---------- */
function b4block(cx,cz,L){const fs=slotN('floor',L),rs=slotN('roof',L);const seen=new Set([cx+','+cz]),q=[[cx,cz]];let x0=cx,x1=cx,z0=cz,z1=cz;
  while(q.length&&seen.size<90){const [i,j]=q.shift();for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const k=(i+di)+','+(j+dj);if(seen.has(k))continue;const c=OCC.cell.get(k);if(!c||!(c[fs]||c[rs]))continue;seen.add(k);q.push([i+di,j+dj]);
    x0=Math.min(x0,i+di);x1=Math.max(x1,i+di);z0=Math.min(z0,j+dj);z1=Math.max(z1,j+dj);}}return {x0,x1,z0,z1};}
function b4autoR(def,cx,cz,L){const k=b4block(cx,cz,L),mx=(k.x0+k.x1+1)/2,mz=(k.z0+k.z1+1)/2;
  if(def.hipc){const e=cx+0.5>=mx,s=cz+0.5>=mz;return e&&s?0:e&&!s?1:!e&&!s?2:3;}
  const alongX=k.x1-k.x0>=k.z1-k.z0;if(def.mini)return alongX?0:1;
  if(def.endc){if(alongX)return cx+0.5>=mx?0:2;return cz+0.5>=mz?3:1;}return null;}
const B4WATER='Không xây trên nước: dựng cột nhà sàn trước';
{const _bu=buildUpdate;buildUpdate=function(){const B=G.build;if(B&&B.bp){b4BpUpdate();return;}_bu();if(!B||!B.pos||B.rm||B.ed==='rm')return;const def=B.def;if(!def||!def.b4)return;const L=B.lv||0;let ch=0;
  // mái góc / một ô / chái: tự xoay
  if(def.kind==='roof'&&(def.hipc||def.mini||def.endc)&&!B.rman){const r=b4autoR(def,Math.floor(B.pos.x/CELL),Math.floor(B.pos.z/CELL),L);if(r!=null&&r!==B.pos.r){B.pos.r=r;B.g.rotation.y=r*Math.PI/2;}}
  // cầu thang dài: tự quay đầu lên về phía sàn tầng trên, không đặt dưới sàn/mái
  if(def.stair){if(B.rman||(B._sr4!=null&&B.r!==B._sr4))B._man=1;const a=buildAim();
    if(!B._man){for(let r=0;r<4;r++){const rw=r%2?2:1,rd=r%2?1:2,cx=Math.round(a.x/CELL-rw/2),cz=Math.round(a.z/CELL-rd/2),x=(cx+rw/2)*CELL,z=(cz+rd/2)*CELL,dd=STAIR_DIR[r];
        const c=OCC.cell.get(Math.floor((x+dd[0]*60)/CELL)+','+Math.floor((z+dd[1]*60)/CELL));if(c&&c[slotN('floor',L+1)]){if(B.r!==r){B.r=r;B.uiT=0;_bu();}break;}}}B._sr4=B.r;
    if(B.pos&&!B.why)for(const [i,j] of cellsOf(def,B.pos.x,B.pos.z,B.pos.r)){const c=OCC.cell.get(i+','+j);if(c&&(c[slotN('floor',L+1)]||c[slotN('roof',L)])){B.why='Phía trên có sàn hoặc mái che: cầu thang sẽ bị che kín. Đặt ở ô trống, đầu trên sát mép sàn tầng trên.';ch=1;break;}}}
  // trên nước: món chịu nước, hoặc tường/lan can men theo cầu
  if(B.why===B4WATER){const {x,z}=B.pos,ok=def.water||(def.kind==='edge'&&[[x-21,z],[x+21,z],[x,z-21],[x,z+21]].some(([px,pz])=>floorTopL(px,pz,0)!=null));
    if(ok){let why='';if(Math.hypot(x-P.x,z-P.z)>330)why='Xa quá';else if(!lvOk(def.lv))why='Cần '+lvText(def.lv);else if(!canPay(STG[def.id]?STG[def.id][0].c:def.cost))why='Thiếu nguyên liệu cho công đoạn đầu: '+b3costTxt(STG[def.id][0].c);
      else if(def.water&&wdAt(x,z)>40)why='Nước sâu quá để đóng cọc';B.why=why;ch=1;}}
  if(def.water&&L===0&&def.kind==='floor'&&wdAt(B.pos.x,B.pos.z)>0.5){const w=waterAt(B.pos.x,B.pos.z)+(def.wy||0)-(def.kind==='floor'?(def.ftop!=null?def.ftop:6)-2:0);if(w>B.pos.y){B.pos.y=w;B.g.position.y=w;}}
  if(def.yoff){B.pos.y+=def.yoff;B.g.position.y=B.pos.y;}
  if(ch){B.ok=!B.why;B.mat.color.set(B.why?0xff6a5a:0x7cff9a);if(G.t-(B.uiT4||0)>0.2){B.uiT4=G.t;uiBuildBar(true,def,B.why);}}};}
// thang độc mộc: nhắm tới được như thang tre
{const _ft=findTarget;findTarget=function(){const t=_ft();if(G.work||G.sit||G.ride||G.build||!S)return t;let best=null,bd=REACH+10;
  for(const b of S.builds){if(b.k!=='logLadder'||b.prog!=null||Math.abs(b.y-P.y)>80)continue;const d=Math.hypot(b.x-P.x,b.z-P.z)-14;if(d<bd){bd=d;best={type:'build',b,def:pieceDef(b.k),d};}}
  if(best&&(!t||t.d==null||best.d<t.d-2))return best;return t;};}
/* ===================== BẢN MẪU (cả cụm nhà dựng dần từng phần) ===================== */
// phần: [mã, x, z, y tương đối (null = tự tính theo sàn bên dưới), hướng, tầng]
function bpMake(id,n,ic,age,d,fn){return {id,n,ic,age,d,fn,parts:null};}
function b4BpParts(bp){if(bp.parts)return bp.parts;const P=[];const C=CELL;
  const A={F:(i,j,k,L)=>P.push([k,(i+.5)*C,(j+.5)*C,null,0,L||0]),R:(i,j,k,r,L)=>P.push([k,(i+.5)*C,(j+.5)*C,null,r||0,L||0]),C:(i,j,k,L)=>P.push([k,i*C,j*C,null,0,L||0]),
    E:(i,j,s,k,L,r)=>{let x,z,rr;if(s==='n'){x=(i+.5)*C;z=j*C;rr=0;}else if(s==='s'){x=(i+.5)*C;z=(j+1)*C;rr=2;}else if(s==='w'){x=i*C;z=(j+.5)*C;rr=1;}else{x=(i+1)*C;z=(j+.5)*C;rr=3;}P.push([k,x,z,null,r!=null?r:rr,L||0]);},
    O:(i,j,k,r,L)=>{const d=pieceDef(k);const [w,h]=(d&&d.fp)||[1,1],rr=r||0,rw=rr%2?h:w,rd=rr%2?w:h;P.push([k,(i+rw/2)*C,(j+rd/2)*C,null,rr,L||0]);}};
  bp.fn(A);
  // y tương đối: sàn tầng L → L·54; món khác đứng trên mặt sàn/sàn cột trong cùng bản mẫu, không có thì trên đất (0)
  const top=new Map();for(const p of P){const d=pieceDef(p[0]);if(!d)continue;const L=p[5];if(d.kind==='floor'){p[3]=L*LVH;for(const [i,j] of cellsOf(d,p[1],p[2],p[4]))top.set(i+','+j+'@'+L,p[3]+(d.ftop!=null?d.ftop:6));}
    else if(d.deck||p[0]==='stilt'){p[3]=L*LVH;for(const [i,j] of cellsOf(d,p[1],p[2],p[4]))top.set(i+','+j+'@'+(L+1),p[3]+60);}}
  for(const p of P){if(p[3]!=null)continue;const d=pieceDef(p[0]);if(!d){p[3]=0;continue;}const L=p[5],x=p[1],z=p[2];let cs;
    if(d.kind==='edge')cs=p[4]%2?[[x-20,z],[x+20,z]]:[[x,z-20],[x,z+20]];else if(d.kind==='corner')cs=[[x-20,z-20],[x+20,z-20],[x-20,z+20],[x+20,z+20]];else cs=cellsOf(d,x,z,p[4]).map(([i,j])=>[(i+.5)*C,(j+.5)*C]);
    let t=null;for(const [px,pz] of cs){const v=top.get(Math.floor(px/C)+','+Math.floor(pz/C)+'@'+L);if(v!=null)t=t==null?v:Math.max(t,v);}p[3]=t!=null?t:(L?L*LVH+6:0);if(d.yoff)p[3]+=d.yoff;}
  let sx=0,sz=0;for(const p of P){sx+=p[1];sz+=p[2];}const ax=Math.round(sx/P.length/C)*C,az=Math.round(sz/P.length/C)*C;bp.parts=P.map(p=>[p[0],p[1]-ax,p[2]-az,p[3],p[4],p[5]]);return bp.parts;}
const B4BP=[
 bpMake('camp','Trại lều nghiêng','⛺',0,'Lều nghiêng ngủ qua đêm, bếp lửa, giá đuốc, ghế gỗ: chỗ dừng chân đầu tiên.',A=>{A.O(0,0,'leanto');A.O(1,0,'campfire');A.O(1,1,'torchHolder');A.O(2,0,'fishRack');}),
 bpMake('roundHut','Chòi tròn vách đất','🛖',0,'Nền đất nện, bốn vách cong trát bùn, mái nón tranh, bếp ba hòn và chiếu ngủ bên trong.',A=>{A.F(0,0,'mudFloor');A.E(0,0,'n','roundWall');A.E(0,0,'w','roundWall');A.E(0,0,'e','roundWall');A.E(0,0,'s','roundWallDoor');A.R(0,0,'coneRoof',0);A.O(0,0,'sleepMat');}),
 bpMake('caveMouth','Mái che cửa hang Hòa Bình','🪨',1,'Bờ đá xếp chắn gió, mành da che lối, mái vỏ cây tựa vách đá, bếp đá và ổ nằm: dựng sát cửa hang.',A=>{for(const i of [0,1,2])for(const j of [0,1])A.C(i,j,'bambooPost');A.E(0,0,'s','stoneLowWall');A.E(1,0,'s','hideCurtain');A.E(0,0,'w','stoneLowWall');A.E(1,0,'e','stoneLowWall');
   A.R(0,0,'barkRoof',0);A.R(1,0,'barkRoof',0);A.O(0,0,'hearth3');A.O(1,0,'sleepMat');}),
 bpMake('stiltSmall','Nhà sàn nhỏ','🎋',1,'Nhà sàn tre 2×2 ô trên cột cao, hiên trước có lan can, thang độc mộc, mái tranh hai dốc, bếp đất và giường tre trong nhà.',A=>{
   for(const i of [0,1])for(const j of [0,1,2])A.O(i,j,'stiltBamboo');A.E(0,0,'n','splitBambooWall',1);A.E(1,0,'n','splitBambooWall',1);A.E(0,0,'w','splitBambooWall',1);A.E(0,1,'w','bambooWindowWall',1);A.E(1,0,'e','bambooWindowWall',1);A.E(1,1,'e','splitBambooWall',1);
   A.E(0,1,'s','rattanDoorWall',1);A.E(1,1,'s','splitBambooWall',1);A.E(0,2,'w','railing',1);A.E(1,2,'e','railing',1);A.E(0,2,'s','railing',1);A.E(1,2,'s','logLadder',0,0);
   A.R(0,0,'thatchRoof',2,1);A.R(1,0,'thatchRoof',2,1);A.R(0,1,'thatchRoof',0,1);A.R(1,1,'thatchRoof',0,1);A.R(0,2,'eaveRoof',0,1);A.R(1,2,'eaveRoof',0,1);A.C(0,3,'bambooPost',1);A.C(1,3,'bambooPost',1);A.C(2,3,'bambooPost',1);
   A.O(1,0,'hearthBox',0,1);A.O(0,0,'bambooBed',0,1);A.O(1,2,'bench',0,1);}),
 bpMake('stiltBoat','Nhà sàn mái thuyền Đông Sơn','⛵',4,'Nhà sàn lớn 3×2 ô trên sàn cột gỗ, mái cong hình thuyền vươn hai đầu như trên trống đồng, hiên lan can, cầu thang gỗ, cột chạm, trống đồng giữa nhà.',A=>{
   for(const i of [0,1,2])for(const j of [0,1,2])A.O(i,j,'stiltBamboo');for(const i of [0,1,2]){A.E(i,0,'n',i===1?'logWindowWall':'rattanWall',1);A.R(i,0,'boatRoof',2,1);A.R(i,1,'boatRoof',0,1);}
   A.E(0,0,'w','rattanWall',1);A.E(0,1,'w','rattanWall',1);A.E(2,0,'e','rattanWall',1);A.E(2,1,'e','rattanWall',1);A.E(0,1,'s','rattanWall',1);A.E(1,1,'s','plankDoubleDoor',1);A.E(2,1,'s','bambooWindowWall',1);
   A.E(0,2,'w','woodRail',1);A.E(2,2,'e','woodRail',1);A.E(0,2,'s','woodRail',1);A.E(2,2,'s','woodRail',1);A.O(1,3,'logStairs',0,0);
   for(const i of [0,3])A.C(i,3,'carvedCornerPost',1);A.O(1,0,'bronzeDrumStand',0,1);A.O(0,0,'hearthBox',0,1);A.O(2,0,'storageJar',0,1);A.O(0,1,'lowTable',0,1);A.O(1,2,'hornPost',0,1);}),
 bpMake('granaryYard','Kho thóc và sân phơi','🌾',2,'Kho thóc trên cột chắn chuột, sân lát cuội để phơi thóc, cối giã chân và bồ thóc.',A=>{A.O(0,0,'granary');for(const i of [1,2])for(const j of [0,1])A.F(i,j,'pavingFloor');A.O(1,1,'footMortar');A.O(2,0,'basketStack');A.O(0,1,'hayPile');}),
 bpMake('chickenYard','Chuồng gà có rào','🐔',1,'Chuồng gà trên cột, ổ đẻ, máng ăn, quây rào phên đan có cổng.',A=>{A.O(0,0,'chickenCoop2');A.O(1,0,'coop');A.O(1,1,'trough');A.O(0,1,'hayPile');
   for(const i of [0,1]){A.E(i,0,'n','wattleFence');}A.E(0,0,'w','wattleFence');A.E(0,1,'w','wattleFence');A.E(1,0,'e','wattleFence');A.E(1,1,'e','wattleFence');A.E(0,1,'s','wattleFence');A.E(1,1,'s','penGate');
   A.C(0,0,'fenceCorner');A.C(2,0,'fenceCorner');A.C(0,2,'fenceCorner');A.C(2,2,'fenceCorner');}),
 bpMake('dock','Bến cá','⚓',1,'Cầu ao vươn ra nước ba nhịp, giàn phơi cá, đó bắt cá: đặt từ bờ ra sông, hồ.',A=>{A.F(0,0,'jetty');A.F(0,1,'jetty');A.F(0,2,'jetty');A.O(1,0,'fishRack');A.E(0,1,'w','railing');A.E(0,2,'w','railing');A.O(0,3,'fishTrap');}),
 bpMake('fort','Chòi canh và rào cọc','🗼',2,'Chòi canh giữa, quây rào cọc nhọn một vòng 3×3 ô, cổng hai cánh.',A=>{A.O(1,1,'watchtower');for(const i of [0,1,2]){A.E(i,0,'n','palisade');A.E(i,2,'s',i===1?'palisadeGate':'palisade');}for(const j of [0,1,2]){A.E(0,j,'w','palisade');A.E(2,j,'e','palisade');}}),
 bpMake('courtyard','Sân nhà một gia đình','🏡',2,'Sân lát cuội 3×3, giếng cần vọt, luống hoa, ghế băng, mâm gỗ, chum nước, viền bờ đá có lối vào.',A=>{for(const i of [0,1,2])for(const j of [0,1,2])A.F(i,j,'pavingFloor');A.O(1,1,'wellStone');A.O(0,0,'flowerBed');A.O(2,0,'flowerBed');A.O(0,2,'bench');A.O(2,2,'waterJar');A.O(0,1,'lowTable');A.O(2,1,'totemBird');
   for(const i of [0,1,2]){A.E(i,0,'n','gardenBorder');if(i!==1)A.E(i,2,'s','gardenBorder');}for(const j of [0,1,2]){A.E(0,j,'w','gardenBorder');A.E(2,j,'e','gardenBorder');}}),
 bpMake('longHouse','Nhà dài vách đất mái chái','🏠',2,'Nhà hẹp 1×3 ô vách đất trát bùn, mái hai dốc một ô có chái hai đầu, cửa ván, cửa sổ, bếp và kệ trong nhà.',A=>{for(const i of [0,1,2])A.F(i,0,'mudFloor');A.E(0,0,'w','mudWall');A.E(2,0,'e','mudWallWindow');A.E(0,0,'n','mudWall');A.E(1,0,'n','mudWallWindow');A.E(2,0,'n','mudWall');
   A.E(0,0,'s','mudWall');A.E(1,0,'s','logDoorWall');A.E(2,0,'s','mudWall');A.R(0,0,'endCap1',2);A.R(1,0,'ridge1',0);A.R(2,0,'endCap1',0);A.O(0,0,'hearth3');A.O(2,0,'wallShelf');}),
 bpMake('hipHouse','Nhà vuông mái bốn dốc','🏯',2,'Nhà 2×2 ô tường gỗ súc trên sàn ván, mái chái bốn góc, cửa hai cánh, hiên kê cột thấp phía trước.',A=>{for(const i of [0,1])for(const j of [0,1])A.F(i,j,'plankFloor');for(const i of [0,1])A.F(i,2,'raisedFloor');
   A.E(0,0,'n','logWall');A.E(1,0,'n','logWindowWall');A.E(0,0,'w','logWall');A.E(0,1,'w','logWindowWall');A.E(1,0,'e','logWall');A.E(1,1,'e','logWall');A.E(0,1,'s','plankDoubleDoor');A.E(1,1,'s','logWindowWall');
   A.R(0,0,'hipCorner',2);A.R(1,0,'hipCorner',1);A.R(0,1,'hipCorner',3);A.R(1,1,'hipCorner',0);A.O(0,0,'bambooBed');A.O(1,0,'storageJar');A.O(0,2,'bench');}),
];
B4BP.push(
 bpMake('stiltLeaf','Nhà sàn vách nứa mái lá gồi','🌴',1,'Nhà sàn 3×2 ô vách nứa đan, mái lá gồi hai dốc, hiên trước có phên nứa lửng, cầu thang tre, bếp kiềng và gác bếp trong nhà.',A=>{
   for(const i of [0,1,2])for(const j of [0,1,2])A.O(i,j,'stiltBamboo');for(const i of [0,1,2]){A.E(i,0,'n',i===1?'nuaWindowWall':'nuaWall',1);A.R(i,0,'leafGoiRoof',2,1);A.R(i,1,'leafGoiRoof',0,1);}
   A.E(0,0,'w','nuaWall',1);A.E(0,1,'w','nuaWindowWall',1);A.E(2,0,'e','nuaWall',1);A.E(2,1,'e','nuaWall',1);A.E(0,1,'s','nuaWall',1);A.E(1,1,'s','nuaDoorWall',1);A.E(2,1,'s','nuaWindowWall',1);
   A.E(0,2,'w','nuaHalfWall',1);A.E(2,2,'e','nuaHalfWall',1);A.E(0,2,'s','nuaHalfWall',1);A.E(2,2,'s','nuaHalfWall',1);for(const i of [0,1,2])A.R(i,2,'eaveRoof',0,1);for(const i of [0,1,2,3])A.C(i,3,'bambooPost',1);
   A.O(1,3,'bambooStairs',0,0);A.O(0,0,'tripodHearth',0,1);A.O(1,0,'smokeRack',0,1);A.O(2,0,'bambooBed',0,1);A.O(0,1,'basketStack',0,1);}),
 bpMake('leafBoat','Nhà sàn mái lá hình thuyền','⛵',3,'Nhà sàn 3×2 ô vách nứa, mái lá gồi cong hình thuyền vươn hai đầu, thang độc mộc, hiên lan can tre.',A=>{
   for(const i of [0,1,2])for(const j of [0,1,2])A.O(i,j,'stiltBamboo');for(const i of [0,1,2]){A.E(i,0,'n','nuaWall',1);A.R(i,0,'leafBoatRoof',2,1);A.R(i,1,'leafBoatRoof',0,1);}
   A.E(0,0,'w','nuaWall',1);A.E(0,1,'w','nuaWall',1);A.E(2,0,'e','nuaWindowWall',1);A.E(2,1,'e','nuaWall',1);A.E(0,1,'s','nuaWindowWall',1);A.E(1,1,'s','nuaDoorWall',1);A.E(2,1,'s','nuaWall',1);
   A.E(0,2,'w','railing',1);A.E(2,2,'e','railing',1);A.E(0,2,'s','railing',1);A.E(2,2,'s','railing',1);A.E(1,2,'s','logLadder',0,0);A.O(0,0,'hearthBox',0,1);A.O(2,0,'storageJar',0,1);A.O(1,0,'gongStand',0,1);}),
 bpMake('granaryVillage','Kho thóc làng','🏚️',3,'Kho thóc lớn 2×2 trên cột chắn chuột, hai kho tre nhỏ, sân cuội phơi thóc, cối giã chân, cột cờ.',A=>{A.O(0,0,'granaryBig');A.O(2,0,'granaryBamboo');A.O(3,0,'granaryBamboo');for(const i of [0,1,2,3])A.F(i,2,'pavingFloor');A.O(1,2,'footMortar');A.O(3,2,'basketStack');A.O(3,1,'flagPole');}),
 bpMake('duckPond','Ao vịt có chuồng','🦆',3,'Ao cá 2×2 kè đá, chuồng vịt bên bờ, giàn gà đậu, rào phên đan quanh có cổng.',A=>{A.O(0,0,'fishPond');A.O(2,0,'duckHouse');A.O(2,1,'chickenRoost');A.O(3,1,'trough');
   for(const i of [0,1,2,3]){A.E(i,0,'n','wattleFence');A.E(i,1,'s',i===3?'penGate':'wattleFence');}A.E(0,0,'w','wattleFence');A.E(0,1,'w','wattleFence');A.E(3,0,'e','wattleFence');A.E(3,1,'e','wattleFence');}),
 bpMake('bambooBridge','Cầu tre qua suối','🌁',2,'Ba nhịp cầu tre cong nối hai bờ, cầu khỉ phụ bên cạnh, cột cờ đầu cầu: đặt ngang dòng suối.',A=>{for(const j of [0,1,2,3])A.F(1,j,'archBridge');for(const j of [0,1,2,3])A.F(3,j,'monkeyBridge');A.O(0,0,'torchHolder');}),
 bpMake('kitchenYard','Chái bếp và sân sau','🍲',1,'Chái bếp lợp lá có bếp đất, giàn treo nồi, bếp kiềng, giàn phơi cá, chum nước, kho tre nhỏ.',A=>{A.O(0,0,'kitchenShed');A.O(1,0,'potHanger');A.O(1,1,'tripodHearth');A.O(2,0,'fishRack');A.O(2,1,'waterJar');A.O(3,0,'granaryBamboo');}),
 bpMake('livestock','Trại chăn nuôi','🐃',3,'Chuồng trâu, chuồng lợn, chuồng dê 2×2, đống rơm và máng ăn, lối sỏi ở giữa.',A=>{A.O(0,0,'buffaloShed');A.O(0,3,'pigPen');A.O(4,0,'goatShed');A.O(4,3,'hayPile');A.O(5,3,'trough');for(const j of [0,1,2,3,4])A.F(2,j,'gravelPath');for(const j of [0,1,2,3,4])A.F(3,j,'gravelPath');}),
 bpMake('nuaLongHouse','Nhà nứa mái lá (1×4)','🏠',1,'Nhà dài một gian ngang vách nứa, mái lá hai dốc một ô có chái hai đầu, bếp kiềng, chõng tre.',A=>{for(const i of [0,1,2,3])A.F(i,0,'plankFloor');A.E(0,0,'w','nuaWall');A.E(3,0,'e','nuaWindowWall');
   for(const i of [0,1,2,3]){A.E(i,0,'n',i===2?'nuaWindowWall':'nuaWall');A.E(i,0,'s',i===1?'nuaDoorWall':'nuaWall');}A.R(0,0,'endCap1',2);A.R(1,0,'ridge1',0);A.R(2,0,'ridge1',0);A.R(3,0,'endCap1',0);A.O(0,0,'tripodHearth');A.O(3,0,'wallShelf');A.O(2,0,'bench');}));
function b4Bps(){const own=(S&&S.b4&&S.b4.bps)||[];return [...B4BP.map(b=>({...b,parts:b4BpParts(b),own:false})),...own.map((b,i)=>({id:'u'+i,n:b.n,ic:'📐',age:0,d:'Bản mẫu tự lưu: '+b.parts.length+' phần.',parts:b.parts,own:true,oi:i}))];}
const b4BpCost=parts=>{const c={};for(const p of parts){const d=pieceDef(p[0]);if(!d)continue;for(const k in d.cost)c[k]=(c[k]||0)+d.cost[k];}return c;};
const b4BpMissing=parts=>[...new Set(parts.map(p=>p[0]))].filter(k=>{const d=pieceDef(k);return !d||!S.known['b:'+k];});
// bóng mờ
function b4Proto(k){let g=B4.proto[k];if(!g){g=model(['piece',k]);g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}if(o.name==='flame')o.visible=false;});B4.proto[k]=g;}return g;}
function b4BpBegin(bp){if(!G.sc||!S)return;if(G.panel)uiClose();buildEnd();const parts=bp.parts,miss=b4BpMissing(parts);
  const mat=new THREE.MeshBasicMaterial({color:0x7cff9a,transparent:true,opacity:.36,depthWrite:false}),g=new THREE.Group();
  for(const p of parts){if(!pieceDef(p[0]))continue;const c=b4Proto(p[0]).clone();c.traverse(o=>{if(o.isMesh){o.material=mat;o.renderOrder=6;}});c.position.set(p[1],p[3],p[2]);c.rotation.y=p[4]*Math.PI/2;g.add(c);}G.sc.add(g);
  let ext=0;for(const p of parts)ext=Math.max(ext,Math.abs(p[1]),Math.abs(p[2]));const cost=b4BpCost(parts);
  G.build={id:'_bp',def:{id:'_bp',n:'📐 '+bp.n+' · '+parts.length+' phần',kind:'obj',cost,fp:[1,1]},g,mat,r:0,ok:false,pos:null,lv:0,rm:false,bp:{bp,parts,miss},uiT:-9};
  G.buildTap={x:P.x+Math.sin(P.ry)*(ext+50),z:P.z+Math.cos(P.ry)*(ext+50)};buildUpdate();
  uiToast(`📐 Chạm chỗ muốn dựng ${bp.n}, ⟲ xoay 90°, rồi ✔. Mỗi phần thành một công trường: đến làm dần (vật liệu trả theo từng công đoạn).`,'');}
function b4occKeys(d,k,x,z,r,L){const out=[];if(d.kind==='edge'){out.push(['e',edgeKey(x,z,r,L)]);return out;}if(d.kind==='corner'){out.push(['e',cornerKey(x,z,L)]);if(d.tall2)out.push(['e',cornerKey(x,z,L+1)]);return out;}
  const base=d.kind==='floor'?'floor':d.kind==='roof'?'roof':'obj';for(const [i,j] of cellsOf(d,x,z,r)){out.push(['c',i+','+j,slotN(base,L)]);if(k==='stilt'||d.deck)out.push(['c',i+','+j,slotN('floor',L+1)]);}return out;}
function b4BpPlan(parts,tx,tz,q){const plan=[];for(const p of parts){const d=pieceDef(p[0]);if(!d)continue;let dx=p[1],dz=p[2];for(let i=0;i<q;i++){const t=dx;dx=dz;dz=-t;}plan.push({k:p[0],d,x:tx+dx,z:tz+dz,r:(p[4]+q)%4,lv:p[5],ry:p[3]});}
  const plat=new Set();for(const p of plan){if(p.lv===0&&(p.d.kind==='floor'||p.d.deck||p.k==='stilt'))for(const [i,j] of cellsOf(p.d,p.x,p.z,p.r))plat.add(i+','+j);}
  const cellsP=p=>{const d=p.d;if(d.kind==='edge'){const v=p.r%2!==0;return v?[[Math.round(p.x/CELL)-1,Math.floor(p.z/CELL)],[Math.round(p.x/CELL),Math.floor(p.z/CELL)]]:[[Math.floor(p.x/CELL),Math.round(p.z/CELL)-1],[Math.floor(p.x/CELL),Math.round(p.z/CELL)]];}
    if(d.kind==='corner'){const i=Math.round(p.x/CELL),j=Math.round(p.z/CELL);return [[i-1,j-1],[i,j-1],[i-1,j],[i,j]];}return cellsOf(d,p.x,p.z,p.r);};
  const onPlat=p=>{if(p.d.kind==='floor'||p.d.deck||p.k==='stilt')return false;const cs=cellsP(p);return p.d.kind==='edge'||p.d.kind==='corner'?cs.some(([i,j])=>plat.has(i+','+j)):cs.every(([i,j])=>plat.has(i+','+j));};
  const gr=[];for(const p of plan){if(p.lv!==0||p.d.kind==='roof'||onPlat(p))continue;let want,flat=0;const d=p.d;
    if(d.kind==='floor'){const hs=[[-18,-18],[18,-18],[-18,18],[18,18],[0,0]].map(([u,v])=>hAt(p.x+u,p.z+v));want=Math.max(...hs)-1;flat=Math.max(...hs)-Math.min(...hs);if(d.water&&wdAt(p.x,p.z)>0.5)want=Math.max(want,waterAt(p.x,p.z)+(d.wy||0)-((d.ftop!=null?d.ftop:6)-2));}
    else if(d.kind==='edge'){const v=p.r%2!==0,pts=v?[[p.x,p.z-20],[p.x,p.z+20]]:[[p.x-20,p.z],[p.x+20,p.z]];want=Math.min(...pts.map(([a,b])=>hAt(a,b)))-1;}
    else if(d.kind==='corner')want=Math.min(...[[1,1],[-1,1],[1,-1],[-1,-1]].map(([a,b])=>hAt(p.x+a,p.z+b)))-1;
    else{const hs=cellsOf(d,p.x,p.z,p.r).map(([i,j])=>hAt((i+0.5)*CELL,(j+0.5)*CELL));want=Math.max(...hs)-0.5;flat=Math.max(...hs)-Math.min(...hs);}gr.push({p,want,flat});}
  let dy=0;if(gr.length)dy=Math.max(...gr.map(o=>o.want-(o.p.ry-(o.p.d.yoff||0))));for(const p of plan)p.y=p.ry+dy;
  let why='';
  for(const o of gr){const fl=o.p.y-(o.p.d.yoff||0)-o.want,deep=o.p.d.deck||o.p.k==='stilt';if(o.flat>(deep?46:34)||fl>(deep?40:o.p.d.kind==='floor'?30:14)){why='Đất chỗ này dốc, gồ ghề quá: nhà sẽ bị kênh lên. Chọn chỗ bằng phẳng hơn (hoặc San nền trước).';break;}}
  if(!why&&Math.hypot(tx-P.x,tz-P.z)>440)why='Xa quá: đi lại gần chỗ muốn dựng.';
  if(!why)for(const p of plan){for(const [m,k,s] of b4occKeys(p.d,p.k,p.x,p.z,p.r,p.lv)){const id=m==='e'?OCC.edge.get(k):(OCC.cell.get(k)||{})[s];if(id!=null){const o=BYID.get(id);why='Chỗ này vướng '+(o&&pieceDef(o.k)?pieceDef(o.k).n.toLowerCase():'công trình khác')+'.';break;}}if(why)break;}
  if(!why)for(const p of plan){if(p.lv!==0||p.d.kind==='roof')continue;
    if(wdAt(p.x,p.z)>1&&!p.d.water&&!/^(stilt|post|fishTrap)$/.test(p.k)&&!onPlat(p)){why='Phần '+p.d.n.toLowerCase()+' rơi xuống nước: dời sang chỗ đất khô (chỉ cầu, bến, nhà sàn mới dựng trên nước).';break;}
    if(p.d.water&&wdAt(p.x,p.z)>40){why='Nước sâu quá để đóng cọc.';break;}
    const rad=p.d.kind==='edge'?20:p.d.kind==='corner'?8:(p.d.fp?Math.max(...p.d.fp)*20:20);for(const i of near(p.x,p.z,rad+30)){const q=RES[i];if(q.st!==0||RT[q.t].pass||q.lock)continue;if(Math.hypot(q.x-p.x,q.z-p.z)<rad*0.75+(RT[q.t].r||4)*0.6){why='Vướng '+RT[q.t].n.toLowerCase()+': dọn trước đã.';break;}}if(why)break;}
  if(!why&&typeof mpOn==='function'&&typeof mpLandWhy==='function'&&mpOn())for(const p of plan){const w=mpLandWhy(p.x,p.z);if(w){why=w;break;}}
  return {plan,why,dy};}
function b4BpUpdate(){const B=G.build,a=buildAim(),tx=Math.round(a.x/CELL)*CELL,tz=Math.round(a.z/CELL)*CELL,q=((B.r%4)+4)%4,k=tx+','+tz+','+q+','+S.builds.length;
  if(B._gk!==k||G.t-(B._gt||0)>0.6){B._gk=k;B._gt=G.t;const r=b4BpPlan(B.bp.parts,tx,tz,q);B.plan=r.plan;B.pos={x:tx,y:r.dy,z:tz,r:q};
    B.why=B.bp.miss.length?'Chưa biết làm: '+B.bp.miss.slice(0,4).map(k=>pieceDef(k)?pieceDef(k).n:k).join(', ')+(B.bp.miss.length>4?'…':''):r.why;B.g.position.set(tx,r.dy,tz);B.g.rotation.y=q*Math.PI/2;B.uiT=-9;}
  B.ok=!B.why;B.mat.color.set(B.why?0xff6a5a:0x7cff9a);if(G.t-(B.uiT||0)>0.2){B.uiT=G.t;uiBuildBar(true,B.def,B.why);}}
// thứ tự dựng: móng/cột sàn → tường, cột → (thang, cầu thang) → mái; đồ đạc sau tường
function b4Phase(b){const d=pieceDef(b.k)||{},L=b.lv||0;if(d.kind==='floor'||d.deck||b.k==='stilt')return L*10;if(d.kind==='edge'||d.kind==='corner')return /ladder/i.test(b.k)?(L+1)*10+1:L*10+1;
  if(d.stair||b.k==='stairs')return (L+1)*10+1;if(d.kind==='roof')return L*10+5;return L*10+3;}
function b4BpPlace(){const B=G.build;if(!B||!B.bp)return;B._gk=null;b4BpUpdate();if(!B.ok){uiToast(B.why||'Không dựng được ở đây.','bad');sfx('no');return;}
  const st=b4S(),gid=st.seq++;let n=0;for(const p of B.plan){const d=p.d;const b={id:S.bseq++,k:p.k,x:+p.x.toFixed(1),y:+p.y.toFixed(1),z:+p.z.toFixed(1),r:p.r,prog:0,lv:p.lv,bpg:gid};
    if(STG[p.k])b.paid=0;else b.bpPay=1;S.builds.push(b);structAdd(b,true);if(d.store)S.store[b.id]=Array(d.store).fill(null);if(d.fuel)S.fuel[b.id]=0;if(p.k==='rainBarrel'||p.k==='beeBox')S.tank[b.id]=0;n++;}
  st.prj[gid]={n:B.bp.bp.n,t:S.day||0,c:n};SI.forEach(e=>e.api&&e.api.flush());decoRebuild();flameSync();sfx('build');cnt('cnt','blueprint');
  uiToast(`📐 Đã cắm mốc ${B.bp.bp.n}: ${n} công trường. Làm từ móng, cột lên tường, sàn trên rồi mới tới mái. Vật liệu trả dần theo từng công đoạn.`,'gold');save();buildEnd();}
{const _bp=buildPlace;buildPlace=function(){const B=G.build;if(B&&B.bp){b4BpPlace();return;}return _bp();};}
// công trường bản mẫu: phải làm theo thứ tự; món không có công đoạn thì trả vật liệu lúc bắt tay vào làm
function b4Blocker(b){if(b.bpg==null)return null;const ph=b4Phase(b);let best=null;for(const o of S.builds){if(o===b||o.bpg!==b.bpg||o.prog==null)continue;if(Math.abs(o.x-b.x)>62||Math.abs(o.z-b.z)>62)continue;const p=b4Phase(o);if(p<ph&&(!best||p<best.p))best={o,p};}return best&&best.o;}
{const _sh=siteHit;siteHit=function(b){const blk=b4Blocker(b);if(blk){const d=pieceDef(blk.k);uiToast(`📐 Làm ${d?d.n.toLowerCase():'phần bên dưới'} gần đó trước (theo thứ tự móng → tường → sàn trên → mái).`,'bad');sfx('no');G.act=null;return;}
  if(b.bpPay){const d=pieceDef(b.k);if(!canPay(d.cost)){uiToast(`🧱 ${d.n}: thiếu ${Object.entries(d.cost).filter(([k,v])=>haveCount(k)<v).map(([k,v])=>(v-haveCount(k))+' '+ITEMS[k].n).join(', ')}.`,'bad');sfx('no');G.act=null;return;}pay(d.cost);delete b.bpPay;uiHotbar();}
  return _sh(b);};}
{const _sd=siteDone;siteDone=function(b){_sd(b);if(b.bpg!=null){cnt('build',b.k);const st=b4S();if(!S.builds.some(o=>o.bpg===b.bpg&&o.prog!=null)&&st.prj[b.bpg]){uiToast(`🏡 Dựng xong cả ${st.prj[b.bpg].n}!`,'gold');delete st.prj[b.bpg];addXp('build',6);}delete b.bpg;save();}};}
{const _pc=b3paidCost;b3paidCost=function(b,def){if(b&&b.bpPay)return {};return _pc(b,def);};}
// bỏ các phần chưa làm của một bản mẫu (hoàn đủ vật liệu đã trả)
function b4BpCancel(gid){const list=S.builds.filter(b=>b.bpg===+gid&&b.prog!=null);if(!list.length)return;const back={};
  for(const b of list){const d=pieceDef(b.k);if(!d)continue;const c=b3paidCost(b,d);for(const k in c)back[k]=(back[k]||0)+c[k];}
  for(const b of list.sort((a,b)=>b4Phase(b)-b4Phase(a)))structRemove(b);decoRebuild();G.cutK=null;if(Object.keys(back).length)give(back,[P.x,P.y+10,P.z]);delete b4S().prj[gid];uiToast(`↩ Đã dỡ ${list.length} công trường chưa xong, hoàn lại vật liệu.`,'');save();}
// lưu cụm đã xây (chọn 🏠 Cả cụm khi ✋ Di chuyển) thành bản mẫu riêng
function b4BpSave(set){set=(set||[]).filter(b=>b.prog==null&&!edIsRemote(b)&&pieceDef(b.k));if(set.length<2){uiToast('Chọn một cụm có ít nhất 2 phần đã xây xong.','bad');return;}
  if(set.length>120){uiToast('Cụm lớn quá (hơn 120 phần).','bad');return;}const st=b4S();if(st.bps.length>=12){uiToast('Đã có 12 bản mẫu riêng: xoá bớt trong Xây → 📐 Bản mẫu.','bad');return;}
  let n='Nhà của tôi '+(st.bps.length+1);try{const v=window.prompt('Đặt tên bản mẫu',n);if(v===null)return;if(v.trim())n=v.trim().slice(0,40);}catch(e){}
  const g0=set.filter(b=>(b.lv||0)===0),ref=Math.min(...(g0.length?g0:set).map(b=>b.y-((b.lv||0)*LVH)));let sx=0,sz=0;for(const b of set){sx+=b.x;sz+=b.z;}const ax=Math.round(sx/set.length/CELL)*CELL,az=Math.round(sz/set.length/CELL)*CELL;
  const parts=set.map(b=>[b.k,+(b.x-ax).toFixed(1),+(b.z-az).toFixed(1),+(b.y-ref).toFixed(1),((Math.round(b.r)%4)+4)%4,b.lv||0]);st.bps.push({n,parts,t:S.day||0});save();
  uiToast(`📐 Đã lưu bản mẫu «${n}» (${parts.length} phần). Mở Xây → 📐 Bản mẫu để dựng lại ở chỗ khác.`,'gold');sfx('craft');}
{const _er=edRender;edRender=function(){_er();const B=G.build;if(!B||B.ed!=='mv'||B.mv||B.grp||B.busy||!B.set||B.set.length<2)return;const el=document.querySelector('#buildBar .bb-b');if(!el||el.querySelector('[data-k="bpsave"]'))return;
  el.insertAdjacentHTML('afterbegin','<button class="btn sm ghost" data-a="b4" data-k="bpsave" title="Lưu cụm này thành bản mẫu">📐 Lưu mẫu</button>');};}
/* ===================== BẢNG XÂY: PHÂN MỤC, BIỂU TƯỢNG, TÌM KIẾM, BẢN MẪU ===================== */
const B4CAT=[['bp','📐','Bản mẫu'],['co','🔥','Cơ bản'],['mong','🟫','Móng & sàn'],['tuong','🧱','Tường'],['mai','🛖','Mái'],['khung','🪜','Khung & cầu thang'],['cua','🚪','Cửa'],['noi','🛏️','Nội thất'],['bep','🍲','Bếp & kho'],
  ['vuon','🌿','Sân vườn'],['chan','🐓','Chăn nuôi'],['thu','🛡️','Phòng thủ'],['trang','🗿','Trang trí']];
const B4OLD={floor:'mong',stoneFloor:'mong',bambooFloor:'mong',mudFloor:'mong',upperFloor:'mong',stilt:'mong',treePlatform:'mong',
  wall:'tuong',wallWindow:'tuong',stoneWall:'tuong',bambooWall:'tuong',mudWall:'tuong',mudWallWindow:'tuong',halfWall:'tuong',rammedWall:'tuong',
  roof:'mai',roofCap:'mai',thatchRoof:'mai',leafRoof:'mai',post:'khung',stairs:'khung',ladder:'khung',ropeLadder:'khung',railing:'khung',treeRail:'khung',
  wallDoor:'cua',stoneWallDoor:'cua',bambooWallDoor:'cua',hideCurtain:'cua',gate:'cua',
  bed:'noi',table:'noi',stool:'noi',shelf:'noi',rack:'noi',rug:'noi',hammock:'noi',caveBed:'noi',sleepMat:'noi',chest:'noi',basket:'noi',torch:'noi',drum:'noi',pottery:'noi',
  hearth:'bep',hearth3:'bep',stoneHearth:'bep',dryRack:'bep',granary:'bep',rainBarrel:'bep',mortar:'bep',
  farm:'vuon',fence:'vuon',wattleFence:'vuon',dryStoneWall:'vuon',well:'vuon',channel:'vuon',paddy:'vuon',scarecrow:'vuon',trap:'vuon',fishTrap:'vuon',beeBox:'vuon',
  coop:'chan',trough:'chan',penFence:'chan',penGate:'chan',hayPile:'chan'};
const B4OLDC={nha:'tuong',do:'noi',nong:'vuon',tang:'khung',noi:'noi',co:'co',trang:'trang',thu:'thu'};
const B4IC={campfire:'🔥',leanto:'⛺',torch:'🔦',workbench:'🛠️',basket:'🧺',floor:'🟫',wall:'🧱',wallDoor:'🚪',wallWindow:'🪟',roof:'🛖',roofCap:'🛖',fence:'🚧',gate:'🚧',bed:'🛏️',dryRack:'🥓',tanRack:'🟫',farm:'🌱',chest:'🧰',hearth:'♨️',kiln:'🏺',
  stoneFloor:'⬜',stoneWall:'🧱',stoneWallDoor:'🚪',tent:'⛺',well:'🪣',totem:'🗿',smelter:'🔥',carveBench:'🪓',statue:'🗿',postDeco:'🏛️',stairs:'🪜',ladder:'🪜',post:'🪵',stilt:'🏘️',upperFloor:'🟫',bambooFloor:'🎋',bambooWall:'🎋',
  bambooWallDoor:'🚪',mudWall:'🟤',mudWallWindow:'🪟',halfWall:'🧱',railing:'🚧',thatchRoof:'🛖',leafRoof:'🍃',table:'🪵',stool:'🪑',shelf:'🗄️',rack:'🧥',rug:'🟫',pottery:'🏺',drum:'🥁',caveArt:'🎨',trap:'🪤',fishTrap:'🐟',
  treePlatform:'🌳',ropeLadder:'🪢',treeRail:'🚧',hammock:'🛏️',coop:'🐔',trough:'🥣',penFence:'🚧',penGate:'🚪',hayPile:'🌾',caveBed:'🛏️',stoneHearth:'🔥',hideCurtain:'🚪',bronzeDrum:'🥁',rainBarrel:'🛢️',beeBox:'🐝',scarecrow:'🧍',sign:'🪧',
  potter:'🏺',grindSlab:'🪨',granary:'🌾',wattleFence:'🚧',dryStoneWall:'🪨',rammedWall:'🧱',mudFloor:'🟫',channel:'💧',hearth3:'♨️',sleepMat:'🟨',drumStage:'🥁',loom:'🧶',mortar:'🌾',paddy:'🌾',altar:'🕯️',tomb:'🪦',
  lithophone:'🎶',palisade:'🛡️',palisadeGate:'🚪',watchtower:'🗼',spikePit:'⚠️'};
const b4cat=b=>b.c4||B4OLD[b.id]||B4OLDC[b.cat]||b.cat;
function b4Card(b){const kn=S.known['b:'+b.id],ic=b.ic||B4IC[b.id]||'🏠',nm=b4norm(b.n+' '+(b.d||''));
  if(!kn)return `<div class="bc lock" data-c4="${b4cat(b)}" data-n="${esc(nm)}"><span class="ic big"><b>🔒</b></span><div><b>???</b><span class="small muted">${esc(lockHint(b))}</span></div></div>`;
  const st=STG[b.id],ok=(st?canPay(st[0].c):canPay(b.cost))&&lvOk(b.lv);const tag=b.kind==='edge'?'cạnh ô':b.kind==='corner'?'góc ô':b.kind==='floor'?'sàn 1 ô':b.kind==='roof'?'mái 1 ô':b.fp?b.fp.join('×')+' ô':'';
  return `<button class="bc${ok?'':' dim'}" data-a="build" data-b="${b.id}" data-c4="${b4cat(b)}" data-n="${esc(nm)}"><span class="ic big"><b>${ic}</b></span><div><b>${esc(b.n)}${tag?` <em class="b4tag">${tag}</em>`:''}</b><div class="chips">${chips(b.cost)}</div><span class="small muted">${esc(b.d)}${b.lv?' · '+lvText(b.lv):''}</span></div></button>`;}
function b4BpHtml(){const st=b4S(),list=b4Bps();const prj=Object.entries(st.prj).map(([g,o])=>{const left=S.builds.filter(b=>b.bpg===+g&&b.prog!=null).length;if(!left){delete st.prj[g];return '';}
    return `<div class="b4prj"><span>🏗️ <b>${esc(o.n)}</b> · còn ${left}/${o.c} phần</span><button class="btn sm ghost" data-a="b4" data-k="bpcancel" data-g="${g}">↩ Dỡ phần chưa làm</button></div>`;}).join('');
  const cards=list.map((bp,i)=>{const miss=b4BpMissing(bp.parts),agOk=(S.age||0)>=(bp.age||0),ok=!miss.length&&agOk,c=b4BpCost(bp.parts);
    const ch=Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,v])=>`<span class="chip">${icon(k)}${v}</span>`).join('');
    return `<div class="bc b4bp${ok?'':' dim'}" data-c4="bp" data-n="${esc(b4norm(bp.n+' '+bp.d))}"><span class="ic big"><b>${bp.ic}</b></span><div><b>${esc(bp.n)} <em class="b4tag">${bp.parts.length} phần</em></b><div class="chips">${ch}</div>
      <span class="small muted">${esc(bp.d)}</span>${!agOk?`<span class="small warn">Cần bước sang ${esc(AGES[bp.age].n)}</span>`:miss.length?`<span class="small warn">Chưa biết làm: ${esc(miss.slice(0,5).map(k=>pieceDef(k)?pieceDef(k).n:k).join(', '))}${miss.length>5?'…':''}</span>`:''}
      <div class="row"><button class="btn sm${ok?'':' ghost'}" data-a="b4" data-k="bp" data-i="${i}"${ok?'':' disabled'}>📐 Đặt bản mẫu</button>${bp.own?`<button class="btn sm ghost" data-a="b4" data-k="bpdel" data-i="${bp.oi}">🗑</button>`:''}</div></div></div>`;}).join('');
  return `${prj?`<div class="b4prjs">${prj}</div>`:''}<p class="small muted">Bản mẫu cắm mốc cả cụm nhà một lần; mỗi phần là một công trường, làm lần lượt từ móng, cột, tường, sàn trên tới mái. Vật liệu trả dần khi làm. Lưu nhà của mình: ✋ Di chuyển → 🏠 Cả cụm → chạm vào nhà → 📐 Lưu mẫu.</p>${cards}`;}
buildHtml=function(){let cat=G.bcat||'co';if(!B4CAT.some(c=>c[0]===cat))cat=G.bcat=B4OLDC[cat]||'co';
  const known=BUILD.filter(b=>b.id[0]!=='_'),cnt=c=>{const l=known.filter(b=>b4cat(b)===c);return `${l.filter(b=>S.known['b:'+b.id]).length}/${l.length}`;};
  const tabs=B4CAT.map(([c,ic,n])=>`<button class="tb sm${cat===c?' on':''}" data-a="bcat" data-c="${c}">${ic} ${n}${c==='bp'?'':`<small>${cnt(c)}</small>`}</button>`).join('');
  const cards=known.map(b4Card).join('');
  return `<div class="b4search"><input id="b4q" type="search" placeholder="🔍 Tìm bộ phận: tường, mái, sàn, cửa… (gõ không dấu được)" value="${esc(G.b4q||'')}" autocomplete="off"></div><div class="chipsel b4tabs">${tabs}</div>
    <div class="bgrid b4grid" data-cat="${cat}">${cat==='bp'?b4BpHtml():''}${cards}</div><p class="small muted b4none" hidden>Không tìm thấy bộ phận nào.</p>
    <p class="hint">🔨 Nhà dựng theo công đoạn: đặt mốc trước, rồi đến làm từng bước (vật liệu trả dần). 🧩 Mọi bộ phận cùng khổ lưới 2 m: tường đặt trên cạnh ô, cột ở góc ô, sàn và mái phủ một ô, chọn tầng bằng ▲▼. Đặt: chạm ✔ hoặc nhấp chuột. Xoay: nút ⟲ hoặc phím R. Phá dỡ được hoàn lại ${S.mode==='cozy'?'đủ':'một nửa'} vật liệu.</p>`;};
function b4Filter(){const p=$('#panel');if(!p)return;const g=p.querySelector('.b4grid');if(!g)return;const q=b4norm(G.b4q||'').trim(),cat=g.dataset.cat;let n=0;
  g.querySelectorAll('[data-c4]').forEach(c=>{const ok=q?c.dataset.n.includes(q)&&(c.dataset.c4!=='bp'||cat==='bp'):c.dataset.c4===cat;c.style.display=ok?'':'none';if(ok)n++;});
  g.querySelectorAll('.b4prjs').forEach(e=>e.style.display=q?'none':'');const nn=p.querySelector('.b4none');if(nn)nn.hidden=!!n;}
{const _uo=uiOpen;uiOpen=function(k,o,keep){const r=_uo(k,o,keep);try{if(G.panel==='build'){const inp=$('#b4q');if(inp&&!inp._b4){inp._b4=1;inp.addEventListener('input',()=>{G.b4q=inp.value;b4Filter();});inp.addEventListener('keydown',e=>e.stopPropagation());}b4Filter();}}catch(e){console.warn('bảng xây b4',e);}return r;};}
document.addEventListener('click',e=>{const a=e.target&&e.target.closest&&e.target.closest('[data-a="b4"]');if(!a||!S)return;e.stopImmediatePropagation();if(a.disabled)return;sfx('pick');const d=a.dataset;
  if(d.k==='bp'){const bp=b4Bps()[+d.i];if(bp)b4BpBegin(bp);}
  else if(d.k==='bpdel'){const st=b4S();st.bps.splice(+d.i,1);save();uiOpenRefresh();}
  else if(d.k==='bpcancel'){b4BpCancel(d.g);uiOpenRefresh();}
  else if(d.k==='bpsave'){const B=G.build;if(B&&B.set)b4BpSave(B.set);}},true);
(function(){const st=document.createElement('style');st.textContent=`.b4search{margin:0 0 8px}.b4search input{width:100%;box-sizing:border-box;padding:9px 12px;border-radius:12px;border:1px solid var(--line);background:rgba(0,0,0,.3);color:inherit;font:inherit;font-size:15px}
.b4tabs{display:flex;flex-wrap:nowrap;overflow-x:auto;gap:6px;padding-bottom:6px;-webkit-overflow-scrolling:touch;scrollbar-width:thin}.b4tabs .tb{flex:0 0 auto;white-space:nowrap}.b4tabs .tb small{opacity:.6;margin-left:4px;font-size:10.5px}
.b4tag{font-style:normal;font-weight:600;font-size:10.5px;opacity:.65;margin-left:4px;padding:1px 5px;border-radius:6px;background:rgba(255,255,255,.08)}
.b4bp .row{margin-top:4px;display:flex;gap:6px}.b4prjs{display:flex;flex-direction:column;gap:6px;margin-bottom:8px;grid-column:1/-1}.b4prj{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 10px;border-radius:10px;background:rgba(255,200,80,.1);border:1px solid rgba(255,200,80,.25)}
.b4grid>p.small{grid-column:1/-1;margin:0 0 4px}.b4grid .bc .chips{flex-direction:row;flex-wrap:wrap;gap:4px}.b4grid .b4bp .row{flex-direction:row}`;document.head.appendChild(st);})();
