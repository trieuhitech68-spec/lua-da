/* ===================== SĂN BẮT · HÁI LƯỢM · DÁNG NGƯỜI THẬT · NÉT MẶT (hunt3) =====================
   Mô-đun nạp sau life3/build3: bọc poseApply, moveTick, move, actStart, findTarget, targetInfo, worldTap, peekScan, throwIt, projTick,
   animalDamage, animalsTick, workTick, workStop, eat, drinkWater, trapTick, addXp, npcTick, folkTick.
   • Dáng người: chuyển động pha trộn mượt (0,1–0,35 s), bước chân bám đất (nhịp bước theo tốc độ), lắc hông, vung tay ngược chân, đầu giữ thăng bằng,
     nghiêng theo dốc, lom khom rình, nhún trước khi nhảy, tiếp đất nhún/loạng choạng, leo vách tay chân xen kẽ, đạp nước, xoay tại chỗ dậm chân,
     đứng thở, dồn trọng tâm, nhìn quanh; bị đánh thì giật mình; mệt chống gối; rét ôm người run; nóng lau mồ hôi; ăn đưa tay lên miệng.
   • Hái lượm: mỗi loại một kiểu động tác và thời gian (hái từng quả, nhổ cỏ, cúi nhặt, đào củ, hun khói tổ ong, nhặt trứng, mò ốc, nhận biết nấm độc).
   • Săn bắn: ngắm và kéo (giữ nút ném), đường bay dự kiến, trúng đầu/mình/chân, thú bị thương chảy máu để lại vết, chạy chậm, ngã quỵ → kết liễu,
     xác thú xẻ từng bước (lột da → mổ bụng → xẻ thịt → rút gân), vác xác nặng đi chậm, thịt để lâu thì ôi.
   • Nét mặt: chớp mắt, mắt nhìn theo mục tiêu, lông mày & miệng theo trạng thái (đau, gắng sức, mệt, đói, rét, sợ, vui, tập trung, buồn ngủ).
   Trạng thái mới trên S nằm trong S.h3 (được lưu); trạng thái tạm có khóa bắt đầu bằng "_" hoặc nằm trên G/H3. */
const H3={EMPTY:Object.freeze({}),hit:null,wl:[],blood:[],bdirty:0,nodes:[],cell:'',nodeT:0,spT:0,look:{y:0,p:0,ty:0,tp:0,t:0},ph:0,lastRy:null,turnT:0,
  air:{prep:0,land:0,landA:0,stum:0,vy:0},eat:null,joy:0,joyG:'',pant:0,workAcc:0,wipe:-1,wipeT:0,yawnT:0,BL:null,talkT:0};
/* ---------- vật phẩm & công thức mới (thêm vào bảng có sẵn, không đổi khóa cũ) ---------- */
Object.assign(ITEMS,{sinew:{n:'Gân thú',t:'res'},meatRot:{n:'Thịt ôi',t:'food',food:2,poison:1},meatDried:{n:'Thịt khô hun khói',t:'food',food:22,hp:2},fishDried:{n:'Cá khô',t:'food',food:18,hp:2},
  snail:{n:'Ốc suối',t:'food',food:3,raw:0.5},snailCooked:{n:'Ốc nướng',t:'food',food:14,hp:2},yam:{n:'Củ mài',t:'food',food:4,raw:0.15},yamCooked:{n:'Củ mài nướng',t:'food',food:24,hp:2}});
Object.assign(EMO,{sinew:'🧵',meatRot:'🤢',meatDried:'🥓',fishDried:'🐠',snail:'🐌',snailCooked:'🐚',yam:'🍠',yamCooked:'🍠'});
RECIPES.push({id:'meatDried',out:{meatDried:1},in:{meat:1},st:'campfire',req:['meat'],sk:'cook',steps:'smoke'},{id:'fishDried',out:{fishDried:1},in:{fish:1},st:'campfire',req:['fish'],sk:'cook',steps:'smoke'},
  {id:'snailCooked',out:{snailCooked:1},in:{snail:3},st:'campfire',req:['snail'],sk:'cook'},{id:'yamCooked',out:{yamCooked:1},in:{yam:1},st:'campfire',req:['yam'],sk:'cook'},
  {id:'ropeSinew',out:{rope:1},in:{sinew:1},st:null,req:['sinew'],steps:'rope'});
WSTEP.smoke=[['Thái thịt thành dải mỏng','h3butcher',1.2,'chop'],['Xiên, treo lên giàn trên bếp','lash',1.0,'pick'],['Hun khói, trở đều tay','cook',2.6,'step']];
/* ---------- tiện ích ---------- */
const h3ss=t=>{t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
const h3lerp=(a,b,t)=>a+(b-a)*t;
const h3fr=x=>x-Math.floor(x);
const h3dir=(dx,dz)=>{const a=Math.atan2(dx,dz);const D=['bắc','đông bắc','đông','đông nam','nam','tây nam','tây','tây bắc'];return D[((Math.round(-a/(Math.PI/4))%8)+8+4)%8];};
function h3S(){if(!S.h3||typeof S.h3!=='object')S.h3={};const h=S.h3;h.dep=h.dep||{};h.sp=h.sp||{};h.warn=h.warn||{};return h;}
function h3cut(){return hasTool('knife')||null;}
function h3nearFire(r){for(const b of S.builds){const d=pieceDef(b.k);if(d&&(d.st==='campfire'||d.st==='hearth'||d.fuel)&&b.prog==null&&Math.hypot(b.x-P.x,b.z-P.z)<(r||260))return true;}return false;}
const H3PRED=/tiger|wolf|bear|crocodile|leopard/;
/* ===================== 1. KHUNG XƯƠNG: IK GỌN, KHÔNG CẤP PHÁT MỖI KHUNG HÌNH ===================== */
function h3ik(){if(H3.ik)return H3.ik;if(!window.THREE||!K3||!K3.char2Pose)return null;const T=THREE,PI=Math.PI,cl=clamp;
  const CH=[],m1=new T.Matrix4(),q1=new T.Quaternion(),q2=new T.Quaternion(),t1=new T.Vector3(),t2=new T.Vector3(),t3=new T.Vector3(),t4=new T.Vector3(),t5=new T.Vector3(),e1=new T.Euler();
  const tA=new T.Vector3(),tP=new T.Vector3(),tB=new T.Vector3(),GR=new T.Vector3(),mB=new T.Matrix4(),qD=new T.Quaternion(),qT=new T.Quaternion(),vx=new T.Vector3(),vy=new T.Vector3(),vz=new T.Vector3();
  const VP=[];for(let i=0;i<8;i++)VP.push(new T.Vector3());const W=(i,x,y,z)=>VP[i].set(x,y,z);
  const GP=(K3.char2Grip&&K3.char2Grip.pos)||[0,-1.75,0];
  const chainM=(R,o,m)=>{CH.length=0;while(o&&o!==R.root){CH.push(o);o=o.parent;}m.identity();for(let i=CH.length-1;i>=0;i--){CH[i].updateMatrix();m.multiply(CH[i].matrix);}return m;};
  const chainQ=(R,o,q)=>{CH.length=0;while(o&&o!==R.root){CH.push(o);o=o.parent;}q.identity();for(let i=CH.length-1;i>=0;i--)q.multiply(CH[i].quaternion);return q;};
  const toL=(R,par,p,out)=>out.copy(p).applyMatrix4(chainM(R,par,m1).invert());
  const dirL=(R,par,d,out)=>out.copy(d).applyQuaternion(chainQ(R,par,q1).invert());
  function solve2(up,lo,t,L1,L2,pole,sg){const d=t3.copy(t).sub(up.position);let dist=d.length();if(dist<1e-4){d.set(0,-1,0);dist=1e-4;}
    const D=cl(dist,Math.abs(L1-L2)+0.05,(L1+L2)*0.9995),cg=cl((L1*L1+L2*L2-D*D)/(2*L1*L2),-1,1),beta=PI-Math.acos(cg);
    lo.rotation.set(sg*beta,0,0);const w=t4.set(0,-L1-L2*Math.cos(beta),-L2*Math.sin(sg*beta)).normalize(),tn=d.normalize(),q=q2.setFromUnitVectors(w,tn);
    if(pole&&beta>0.02){const e=t4.set(0,-L1,0).applyQuaternion(q);e.addScaledVector(tn,-e.dot(tn));const p=t5.copy(pole);p.addScaledVector(tn,-p.dot(tn));
      if(e.lengthSq()>1e-6&&p.lengthSq()>1e-6){e.normalize();p.normalize();const ang=Math.atan2(t1.crossVectors(e,p).dot(tn),e.dot(p));q.premultiply(q1.setFromAxisAngle(tn,ang));}}
    up.quaternion.copy(q);}
  const N=s=>s<0?'L':'R';
  function armTo(R,s,x,y,z,px,py,pz){const n=N(s),h=R.dims.h;toL(R,R.torso,tB.set(x*h,y*h,z*h),tA);dirL(R,R.torso,tB.set(px==null?s*0.6:px,py==null?-0.2:py,pz==null?-1:pz),tP);solve2(R['arm'+n],R['fore'+n],tA,R.dims.up,R.dims.fore,tP,-1);R['hand'+n].rotation.set(0,0,0);}
  function legTo(R,s,x,y,z,px,py,pz){const n=N(s),h=R.dims.h;toL(R,R.hips,tB.set(x*h,y*h,z*h),tA);dirL(R,R.hips,tB.set(px==null?s*0.15:px,py||0,pz==null?1:pz),tP);solve2(R['leg'+n],R['shin'+n],tA,R.dims.thigh,R.dims.shin,tP,1);}
  function footTo(R,s,pitch,yaw,roll){const n=N(s);q2.setFromEuler(e1.set(pitch||0,yaw==null?s*0.1:yaw,roll||0));R['foot'+n].quaternion.copy(chainQ(R,R['shin'+n],q1).invert().multiply(q2));}
  // nắm tay s đặt tại (gx,gy,gz), cán theo hướng hd, lưỡi theo bd (Vector3 hệ gốc)
  function gripTo(R,s,gx,gy,gz,hd,bd,pole){const n=N(s),h=R.dims.h;chainQ(R,R.torso,qT).invert();vz.copy(hd).normalize().applyQuaternion(qT);vy.copy(bd).normalize().negate().applyQuaternion(qT);
    vy.addScaledVector(vz,-vy.dot(vz));if(vy.lengthSq()<1e-6)vy.set(0,1,0);vy.normalize();vx.crossVectors(vy,vz);qD.setFromRotationMatrix(mB.makeBasis(vx,vy,vz));
    toL(R,R.torso,tB.set(gx*h,gy*h,gz*h),tA);tA.sub(GR.set(GP[0],GP[1],GP[2]).applyQuaternion(qD));dirL(R,R.torso,pole,tP);
    const arm=R['arm'+n],fore=R['fore'+n];solve2(arm,fore,tA,R.dims.up,R.dims.fore,tP,-1);R['hand'+n].quaternion.copy(q1.copy(arm.quaternion).multiply(fore.quaternion).invert().multiply(qD));}
  const hipsAt=(R,x,y,z)=>{const h=R.dims.h;R.hips.position.set(x*h,y*h,z*h);};
  function kneel(R,y,spread){hipsAt(R,0,y,0);for(const s of [-1,1]){const n=N(s),a=Math.acos(cl((y-1.0)/8.1,-1,1));R['leg'+n].rotation.set(-a,0,s*(spread||0.12));R['shin'+n].rotation.set(PI/2+a-0.06,0,0);R['foot'+n].rotation.set(1.45,0,0);}}
  function feet(R,lx,lz,rx,rz){legTo(R,-1,lx,1.45,lz);legTo(R,1,rx,1.45,rz);footTo(R,-1,0);footTo(R,1,0);}
  const cloak=(R,k)=>{if(R.cloak)R.cloak.rotation.x=-(R.torso.rotation.x+R.hips.rotation.x)*(k==null?0.35:k);};
  H3.ik={T,W,armTo,legTo,footTo,gripTo,hipsAt,kneel,feet,cloak,chainQ,chainM,PI};return H3.ik;}
/* ===================== 2. DÁNG ĐI BÁM ĐẤT ===================== */
// duty: tỉ lệ chân chạm đất; zr: nửa quãng bàn chân trượt dưới hông; base: độ cao hông; lift: nhấc chân; kick: hất gót khi chạy
const H3GAIT={
  walk:{duty:0.62,zr:7.5,base:16.9,lift:2.2,toe:0.55,kick:0,arm:0.34,armOff:0.02,armOut:0.07,elbow:0.22,elbowSw:0.28,lean:0.05,pelvis:0.11,roll:0.05,sway:0.35,wid:1.7,fly:0,comp:0,hipx:0},
  jog:{duty:0.36,zr:8.5,base:16.6,lift:4.2,toe:0.7,kick:2.6,arm:0.55,armOff:0.05,armOut:0.1,elbow:1.25,elbowSw:0.2,lean:0.14,pelvis:0.12,roll:0.04,sway:0.15,wid:1.6,fly:0.7,comp:0.5,hipx:0.04},
  run:{duty:0.3,zr:9.5,base:16.4,lift:6.0,toe:0.8,kick:4.2,arm:0.82,armOff:0.08,armOut:0.12,elbow:1.45,elbowSw:0.15,lean:0.26,pelvis:0.14,roll:0.03,sway:0.1,wid:1.5,fly:1.1,comp:0.8,hipx:0.08},
  sneak:{duty:0.7,zr:6,base:13.8,lift:3.2,toe:0.35,kick:0,arm:0.14,armOff:-0.38,armOut:0.2,elbow:0.95,elbowSw:0.1,lean:0.5,pelvis:0.06,roll:0.03,sway:0.5,wid:2.1,fly:0,comp:0,hipx:0.16},
  carry:{duty:0.66,zr:6.2,base:16.5,lift:1.6,toe:0.4,kick:0,arm:0,armOff:0,armOut:0,elbow:0,elbowSw:0,lean:0.16,pelvis:0.08,roll:0.06,sway:0.55,wid:1.9,fly:0,comp:0,hipx:0.05},
  shuffle:{duty:0.6,zr:2.2,base:17.2,lift:1.3,toe:0.2,kick:0,arm:0.05,armOff:0,armOut:0.08,elbow:0.18,elbowSw:0.05,lean:0.03,pelvis:0.05,roll:0.02,sway:0.2,wid:1.8,fly:0,comp:0,hipx:0}};
const H3F=[{x:0,y:0,z:0,p:0,st:0},{x:0,y:0,z:0,p:0,st:0}];
// chu kỳ bước (giây) để bàn chân đứng yên trên đất ở tốc độ spd
function h3gaitTc(g,spd){const D=H3GAIT[g];return clamp(2*D.zr/(Math.max(1,spd)*D.duty),0.28,1.5);}
function h3gait(R,ph,kind,spd,o){const K=h3ik(),D=H3GAIT[kind],h=R.dims.h,Lm=(R.dims.thigh+R.dims.shin)*0.985,Tc=h3gaitTc(kind,spd),zr=Math.max(0.3,Math.min(D.zr,spd*D.duty*Tc/2)),sl=o.slope||0;
  let hmin=1e9,stN=0;
  for(let i=0;i<2;i++){const s=i?1:-1,p=h3fr(ph+(i?0.5:0)),F=H3F[i];let ax,ay,az,pt;
    if(p<D.duty){const u=p/D.duty,c=zr*(1-2*u);ay=1.45;az=c;pt=0;
      if(u<0.14){pt=-0.22*(1-u/0.14);ay=1.45+1.2*Math.sin(-pt);}else if(u>0.7){const pp=D.toe*(u-0.7)/0.3;pt=pp;ay=1.45+4.1*Math.sin(pp);az=c+4.1*(1-Math.cos(pp));}
      const hb=ay+Math.sqrt(Math.max(0,Lm*Lm-az*az))-(D.comp?D.comp*Math.sin(Math.PI*u):0);hmin=Math.min(hmin,hb);stN++;F.st=1;}
    else{const u=(p-D.duty)/(1-D.duty),z0=-zr+4.1*(1-Math.cos(D.toe)),e=0.5-0.5*Math.cos(Math.PI*u);az=z0+(zr-z0)*e-D.kick*Math.pow(Math.sin(Math.PI*u),2)*(1-u);
      ay=1.45+Math.sin(D.toe)*4.1*(1-u)*(1-u)+D.lift*Math.sin(Math.PI*u)*Math.min(1,0.4+spd/90);pt=h3lerp(D.toe,-0.22,h3ss(u))-0.12*Math.sin(Math.PI*u);F.st=0;}
    F.x=s*D.wid;F.y=ay+sl*az;F.z=az;F.p=pt;}
  let hy=D.base;if(stN)hy=Math.min(D.base,hmin);else{const fu=(h3fr(ph*2)-D.duty*2)/(1-D.duty*2);hy=Math.min(D.base+D.fly*Math.sin(Math.PI*clamp(fu,0,1)),Lm+1.45);}
  if(o.crouch)hy-=o.crouch;
  const dz=(H3F[0].z-H3F[1].z)/(2*Math.max(zr,3)),swL=H3F[0].st?0:1,swR=H3F[1].st?0:1,stx=H3F[0].st&&!H3F[1].st?-1:H3F[1].st&&!H3F[0].st?1:0;
  R.hips.position.set(stx*D.sway*0.5*h,hy*h,0);R.hips.rotation.set(D.hipx,D.pelvis*dz,0.05*(swL-swR)*(D.roll/0.05));
  R.torso.rotation.set(D.lean+(o.lean||0)+sl*0.45,-1.25*R.hips.rotation.y,-0.7*R.hips.rotation.z);
  const br=o.breath||0;R.torso.scale.set(1,1+br,1);
  R.head.rotation.set(-(R.torso.rotation.x+R.hips.rotation.x)*0.85+0.05+(o.headP||0),-(R.hips.rotation.y+R.torso.rotation.y)*0.9+(o.headY||0),-(R.hips.rotation.z+R.torso.rotation.z)*0.8);
  for(let i=0;i<2;i++){const s=i?1:-1,F=H3F[i];K.legTo(R,s,F.x,F.y,F.z,s*0.15,0,1);K.footTo(R,s,F.p,s*0.08,0);}
  if(D.arm||D.elbow){for(let i=0;i<2;i++){const s=i?1:-1,n=i?'R':'L',fw=clamp(H3F[1-i].z/Math.max(zr,4),-1,1);R['arm'+n].rotation.set(-D.arm*fw*Math.min(1,0.35+spd/120)+D.armOff,0,s*D.armOut);R['fore'+n].rotation.set(-(D.elbow+D.elbowSw*Math.max(0,fw)),0,0);R['hand'+n].rotation.set(0,0,0);}}
  K.cloak(R);}
/* ===================== 3. CÁC ĐỘNG TÁC RIÊNG ===================== */
// mỗi hàm: (R, k, o) — k: tiến độ 0..1 của một lần làm (hoặc chu kỳ), o: thông tin thêm
const H3PO={};
H3PO.idle=(R,k,o)=>{const K=h3ik(),t=o.t,br=o.tired?Math.sin(t*4.2):Math.sin(t*(2.1+H3.pant*1.8)),w=Math.sin(t*0.31),w2=Math.sin(t*0.17+1);
  K.hipsAt(R,-w*0.35,17.45-Math.abs(w)*0.12,0);R.hips.rotation.set(0,w2*0.05,w*0.03);
  K.feet(R,-1.9,0.4+w2*0.3,2.0,-0.2);R.torso.rotation.set(0.03+br*0.012*(1+H3.pant*2),-w2*0.04,-w*0.035);R.torso.scale.set(1,1+br*0.009*(1+H3.pant*2.5),1);
  R.head.rotation.set(0.04+(o.headP||0),(o.headY||0)-w2*0.04,0);
  R.armL.rotation.set(br*0.03,0,-0.09-br*0.01*H3.pant);R.armR.rotation.set(-br*0.03,0,0.09+br*0.01*H3.pant);R.foreL.rotation.x=-0.16;R.foreR.rotation.x=-0.2;
  if(o.tired>0.5){// chống tay lên gối, thở dốc
    K.hipsAt(R,0,15.2,-1.4);R.hips.rotation.set(0.2,0,0);K.feet(R,-2.4,1.2,2.4,0.6);R.torso.rotation.set(0.65+br*0.04,0,0);R.head.rotation.set(-0.55+br*0.05,(o.headY||0)*0.3,0);
    K.armTo(R,-1,-2.5,10.6,4.4,-0.8,0,-0.5);K.armTo(R,1,2.5,10.6,4.4,0.8,0,-0.5);}
  else if(o.cold){// ôm người, run cầm cập
    const sh=Math.sin(t*38)*0.02;R.torso.rotation.z+=sh;R.head.rotation.z=Math.sin(t*41)*0.015;R.head.rotation.x+=0.12;R.torso.rotation.x+=0.08;
    K.armTo(R,-1,1.9,23+sh*10,3.4,-1,-0.1,-0.4);K.armTo(R,1,-1.9,22.4-sh*10,3.2,1,-0.1,-0.4);}
  else if(o.wipe>=0){const k2=o.wipe,up=h3ss(k2/0.3)*(1-h3ss((k2-0.75)/0.25)),sw=k2>0.3&&k2<0.75?(k2-0.3)/0.45:k2>=0.75?1:0;
    if(up>0.01){const x=h3lerp(2.4,h3lerp(-1.2,1.6,sw),up),y=h3lerp(18,34.6,up),z=h3lerp(2,3.4,up);K.armTo(R,1,x,y,z,1,0.3,-0.6);R.head.rotation.x-=0.12*up;}}
  if(o.tool)h3carryTool(R,o.tool,0);K.cloak(R);};
function h3carryTool(R,tl,sw){const I=ITEMS[tl];const k=I&&I.tool;if(k==='torch'){R.armR.rotation.set(-0.55+sw*0.05,0,0.12);R.foreR.rotation.set(-1.0,0,0);R.handR.rotation.set(0.02,0,0);}
  else if(k==='spear'){R.armR.rotation.set(-0.12+sw*0.1,0,0.12);R.foreR.rotation.set(-1.4,0,0);R.handR.rotation.set(0,0,0);}
  else if(k==='bow'){R.armL.rotation.set(-0.15+sw*0.08,0,-0.12);R.foreL.rotation.set(-0.55,0,0);R.handL.rotation.set(-1.2,0,0);}
  else if(tl){R.foreR.rotation.x=Math.min(R.foreR.rotation.x,-0.3);R.handR.rotation.x=0.25;}}
// nhún chuẩn bị nhảy (k 0..1)
H3PO.jprep=(R,k)=>{const K=h3ik(),d=h3ss(k);K.hipsAt(R,0,17.4-4.6*d,-0.7*d);K.feet(R,-2,0.8,2,0.4);R.torso.rotation.x=0.38*d;R.head.rotation.x=-0.3*d;
  R.armL.rotation.set(0.75*d,0,-0.15);R.armR.rotation.set(0.75*d,0,0.15);R.foreL.rotation.x=-0.3;R.foreR.rotation.x=-0.3;};
// trên không: lên co chân, xuống duỗi chân đón đất (o.vy)
H3PO.air=(R,k,o)=>{const K=h3ik(),up=clamp(o.vy/150,-1,1);K.hipsAt(R,0,17.2,0);
  if(up>0){K.legTo(R,-1,-2,7.5-2*(1-up),4.5);K.legTo(R,1,2,4.2,-2.5,0.15,0,1);K.footTo(R,-1,0.3);K.footTo(R,1,0.6);R.armL.rotation.set(-1.9*up-0.3,0,-0.25);R.armR.rotation.set(-1.4*up-0.3,0,0.25);R.torso.rotation.x=0.1;}
  else{const dn=-up;K.legTo(R,-1,-2.1,3.4-1.2*dn,2.6);K.legTo(R,1,2.1,3.0-1.0*dn,0.6);K.footTo(R,-1,-0.15);K.footTo(R,1,-0.1);R.armL.rotation.set(-0.6,0,-0.7*dn-0.2);R.armR.rotation.set(-0.6,0,0.7*dn+0.2);R.torso.rotation.x=0.18*dn;}
  R.foreL.rotation.x=-0.6;R.foreR.rotation.x=-0.6;R.head.rotation.x=-0.1;K.cloak(R,0.6);};
// tiếp đất: nhún theo độ mạnh (o.a 0..1)
H3PO.land=(R,k,o)=>{const K=h3ik(),a=o.a||0.4,d=Math.pow(1-k,1.6)*a;K.hipsAt(R,0,17.4-6.2*d,-0.6*d);K.feet(R,-2.1,1.2,2.1,-0.4);R.torso.rotation.x=0.05+0.5*d;R.head.rotation.x=-0.35*d;
  R.armL.rotation.set(-0.7*d,0,-0.4*d-0.08);R.armR.rotation.set(-0.7*d,0,0.4*d+0.08);R.foreL.rotation.x=-0.3-0.4*d;R.foreR.rotation.x=-0.3-0.4*d;};
// ngã khụy một gối, chống tay rồi gượng dậy
H3PO.stumble=(R,k)=>{const K=h3ik(),dn=k<0.3?h3ss(k/0.3):k<0.7?1:1-h3ss((k-0.7)/0.3);K.hipsAt(R,0,h3lerp(17.2,8.6,dn),h3lerp(0,-0.6,dn));
  K.legTo(R,-1,-2.2,1.45,h3lerp(1,5.4,dn));K.footTo(R,-1,0);K.legTo(R,1,2.2,h3lerp(1.45,1.8,dn),h3lerp(-0.5,-5.6,dn),0.2,0,1);K.footTo(R,1,h3lerp(0,1.1,dn));
  R.torso.rotation.x=h3lerp(0.1,0.7,dn);R.head.rotation.x=h3lerp(0,-0.5,dn);K.armTo(R,1,3.8,h3lerp(14,2.4,dn),h3lerp(4,8.5,dn),1,0,-0.4);K.armTo(R,-1,-2.4,h3lerp(14,10.5,dn),h3lerp(4,5.8,dn),-1,0,-0.4);K.cloak(R);};
// leo vách: tay với lên, chân đạp xen kẽ (k: chu kỳ)
H3PO.climb=(R,k)=>{const K=h3ik(),a=Math.PI*2*k,sL=Math.max(0,Math.sin(a)),sR=Math.max(0,Math.sin(a+Math.PI));K.hipsAt(R,0,15.4+0.6*Math.sin(2*a),0.5);R.torso.rotation.x=0.5;R.head.rotation.x=-0.55;
  K.armTo(R,-1,-3.2,26+5.5*sL,8.4-1.2*sL,-1,-0.6,-0.4);K.armTo(R,1,3.2,26+5.5*sR,8.4-1.2*sR,1,-0.6,-0.4);
  K.legTo(R,-1,-2.1,1.45+4.6*sR,3.4+1.6*sR,-0.3,0,1);K.legTo(R,1,2.1,1.45+4.6*sL,3.4+1.6*sL,0.3,0,1);K.footTo(R,-1,0.25);K.footTo(R,1,0.25);K.cloak(R,0.6);};
// đạp nước tại chỗ
H3PO.tread=(R,k,o)=>{const K=h3ik(),t=o.t,a=t*2.6;K.hipsAt(R,0,6.5+0.4*Math.sin(a*2),0);R.torso.rotation.x=0.12;R.head.rotation.x=-0.15;
  K.armTo(R,-1,-7.5-1.2*Math.sin(a),17.2,4+2.4*Math.cos(a),-0.6,-1,0);K.armTo(R,1,7.5+1.2*Math.sin(a),17.2,4-2.4*Math.cos(a),0.6,-1,0);
  K.legTo(R,-1,-2.2,-6.5+2*Math.sin(a*1.3),2.6*Math.cos(a*1.3));K.legTo(R,1,2.2,-6.5-2*Math.sin(a*1.3),-2.6*Math.cos(a*1.3));K.footTo(R,-1,0.7);K.footTo(R,1,0.7);};
// đâm giáo hai tay (đỉnh đòn ở k≈0.42); o.down: đâm cá dưới nước
H3PO.thrust=(R,k,o)=>{const K=h3ik(),T=K.T,back=k<0.28?h3ss(k/0.28):k<0.42?1-h3ss((k-0.28)/0.14):0,fwd=k<0.28?0:k<0.42?h3ss((k-0.28)/0.14):1-h3ss((k-0.5)/0.5),dn=o.down?1:0;
  K.hipsAt(R,0,16.6-1.4*fwd-1.2*dn,h3lerp(-0.6,2.2,fwd)-0.8*back);K.feet(R,-2.2,4.6,2.3,-3.6);R.hips.rotation.y=0.25*back-0.2*fwd;R.torso.rotation.set(0.12+0.3*fwd+0.45*dn,0.3*back-0.25*fwd,0);R.head.rotation.set(-0.12*(1-dn)+0.3*dn,-R.torso.rotation.y-R.hips.rotation.y,0);
  const hd=K.W(0,0,-0.18-0.6*dn,1),z=h3lerp(h3lerp(3,-2.5,back),12,fwd),y=21.5-2.5*dn-1.5*fwd;K.gripTo(R,1,1.6,y,z,hd,K.W(1,0,-1,0),K.W(2,1,-0.6,-0.4));
  K.gripTo(R,-1,0.2,y+(0.18+0.6*dn)*6.5*0.9,z+6.2*(1-0.25*dn),hd,K.W(1,0,-1,0),K.W(3,-1,-0.5,-0.4));K.cloak(R);};
// dao: đâm một tay
H3PO.stab=(R,k)=>{const K=h3ik(),back=k<0.3?h3ss(k/0.3):k<0.42?1-h3ss((k-0.3)/0.12):0,fwd=k<0.3?0:k<0.42?h3ss((k-0.3)/0.12):1-h3ss((k-0.5)/0.5);
  K.hipsAt(R,0,16.4-1.2*fwd,1.8*fwd-0.5*back);K.feet(R,-2.2,4.2,2.2,-3.2);R.torso.rotation.set(0.15+0.25*fwd,0.35*back-0.3*fwd,0);R.head.rotation.y=-R.torso.rotation.y;
  K.gripTo(R,1,h3lerp(3.2,1.4,fwd),h3lerp(24,21.5,fwd),h3lerp(h3lerp(4,0,back),13,fwd),K.W(0,0,0.15,1),K.W(1,0,-1,0.2),K.W(2,1,-0.6,-0.4));K.armTo(R,-1,-2.2,24,7.5,-1,-0.5,-0.4);K.cloak(R);};
// tay không: đấm (lần chẵn) hoặc đá (lần lẻ)
H3PO.punch=(R,k,o)=>{const K=h3ik(),fwd=k<0.25?0:k<0.42?h3ss((k-0.25)/0.17):1-h3ss((k-0.5)/0.5),back=k<0.25?h3ss(k/0.25):k<0.42?1-h3ss((k-0.25)/0.17):0;
  K.hipsAt(R,0,16.6,0.6*fwd);R.torso.rotation.set(0.1,0.3*back-0.35*fwd,0);R.head.rotation.set(0,-R.torso.rotation.y,0);
  if((o.n||0)%2===0){K.feet(R,-2.2,3.8,2.2,-3);K.armTo(R,1,h3lerp(2.6,0.6,fwd),h3lerp(26.5,27.5,fwd),h3lerp(h3lerp(5,2.5,back),14.5,fwd),1,-0.5,-0.4);K.armTo(R,-1,-1.2,27,6.2,-1,-0.6,-0.4);}
  else{K.legTo(R,-1,-2.3,1.45,-1);K.footTo(R,-1,0);K.legTo(R,1,2,h3lerp(1.45,h3lerp(9,8,fwd),Math.max(back,fwd)),h3lerp(0,h3lerp(5,12.5,fwd),Math.max(back,fwd)),0.1,0.3,1);K.footTo(R,1,h3lerp(0,-0.6,fwd));
    R.torso.rotation.x=-0.15*fwd;K.armTo(R,1,2,26.5,6,1,-0.6,-0.4);K.armTo(R,-1,-1.6,27,5.5,-1,-0.6,-0.4);}
  K.cloak(R);};
// cung: giương — kéo — giữ — buông (o.draw 0..1, o.rel 0..1)
H3PO.bow=(R,k,o)=>{const K=h3ik(),d=h3ss(o.draw||0),r=o.rel||0;K.hipsAt(R,0,17.1,0);K.feet(R,-2.4,2.6,2.6,-2.2);R.hips.rotation.y=0.2;R.torso.rotation.set(0.04,0.15,0);R.head.rotation.set(-0.05,-0.3,0);
  K.gripTo(R,-1,-1.2,h3lerp(24,29,d),h3lerp(9,15.5,d),K.W(0,0,1,0.1),K.W(1,0,0,1),K.W(2,-1,-0.4,-0.3));
  const ax=r>0?h3lerp(-0.3,3.6,h3ss(r/0.35)):h3lerp(-0.6,-0.3,d),ay=r>0?h3lerp(31.5,28,h3ss((r-0.4)/0.6)):h3lerp(26,31.4,d),az=r>0?h3lerp(4,-0.5,h3ss(r/0.35)):h3lerp(13,4,d);
  K.armTo(R,1,ax,ay,az,1,0.1,-0.5);R.handR.rotation.set(0,0,-0.4);K.cloak(R);};
// hái quả: với tay vào bụi, ngắt, bỏ vào lòng bàn tay trái (o.n: quả thứ mấy → đổi chỗ với)
H3PO.pick=(R,k,o)=>{const K=h3ik(),j=(o.n||0)*1.7,rx=1.4+Math.sin(j)*1.6,ry=20+Math.cos(j*1.3)*3.5,rz=11.5+Math.sin(j*0.7)*1.2;
  K.hipsAt(R,0,16.9,0.3);K.feet(R,-2,1.2,2.1,-0.4);R.torso.rotation.set(0.22+0.08*(ry<19?1:0),0.08,0);R.head.rotation.set(0.3,0.1,0);
  let x,y,z;if(k<0.35){const e=h3ss(k/0.35);x=h3lerp(0.2,rx,e);y=h3lerp(21.5,ry,e);z=h3lerp(7,rz,e);}else if(k<0.5){x=rx;y=ry-0.3*Math.sin((k-0.35)/0.15*Math.PI);z=rz;}else if(k<0.85){const e=h3ss((k-0.5)/0.35);x=h3lerp(rx,0.2,e);y=h3lerp(ry,21.5,e);z=h3lerp(rz,7,e);}else{x=0.2;y=21.5;z=7;}
  K.armTo(R,1,x,y,z,1,-0.4,-0.6);R.handR.rotation.set(0.3,0,k>0.35&&k<0.5?0.5:0);K.armTo(R,-1,-0.6,20.6,6.8,-1,-0.3,-0.5);R.handL.rotation.set(0.6,0,-0.9);K.cloak(R);};
// rẽ lá nhìn kỹ (đứng)
H3PO.peer=(R,k,o)=>{const K=h3ik(),s=Math.sin(k*Math.PI*2);K.hipsAt(R,0,16.8,0.4);K.feet(R,-2,1.4,2.1,-0.3);R.torso.rotation.set(0.32,0.1*s,0);R.head.rotation.set(0.25,0.25*s,0);
  K.armTo(R,1,2.4+s,20,12,1,-0.3,-0.6);K.armTo(R,-1,-2.2-s*0.5,21,11.5,-1,-0.3,-0.6);K.cloak(R);};
// nhổ cỏ, lau: cúi khom, nắm gốc, ngả người kéo
H3PO.pluck=(R,k)=>{const K=h3ik(),reach=k<0.35?h3ss(k/0.35):k<0.55?1:1-h3ss((k-0.55)/0.3),pull=k<0.55?0:k<0.85?h3ss((k-0.55)/0.3):1-h3ss((k-0.85)/0.15);
  K.hipsAt(R,0,h3lerp(15.5,12.6,reach)+1.2*pull,h3lerp(-1,-2.6,reach)-1.2*pull);R.hips.rotation.x=0.25*reach;K.feet(R,-2.6,1.6,2.6,0.4);
  R.torso.rotation.set(h3lerp(0.35,0.95,reach)-0.4*pull,0,0);R.head.rotation.set(-0.15,0,0);const y=h3lerp(h3lerp(12,4.5,reach),10.5,pull),z=h3lerp(h3lerp(6,9.5,reach),6,pull);
  K.armTo(R,1,0.8,y,z,1,-0.5,-0.4);K.armTo(R,-1,-0.6,y+0.6,z-0.4,-1,-0.5,-0.4);R.handR.rotation.set(0.5,0,0);R.handL.rotation.set(0.5,0,0);K.cloak(R);};
// cúi xuống nhặt dưới đất rồi đứng dậy
H3PO.stoop=(R,k)=>{const K=h3ik(),dn=k<0.4?h3ss(k/0.4):k<0.55?1:1-h3ss((k-0.55)/0.45);K.hipsAt(R,0,h3lerp(17.2,9.8,dn),h3lerp(0,-2.4,dn));R.hips.rotation.x=0.25*dn;
  K.feet(R,-2.3,h3lerp(0.6,1.8,dn),2.4,h3lerp(-0.3,-0.5,dn));R.torso.rotation.set(h3lerp(0.05,0.9,dn),0,0);R.head.rotation.set(h3lerp(0.05,-0.2,dn),0,0);
  const up=k>0.55?h3ss((k-0.55)/0.45):0;K.armTo(R,1,h3lerp(1.6,1.6,up),h3lerp(h3lerp(14,1.8,dn),20,up),h3lerp(h3lerp(4,8.6,dn),5.5,up),1,-0.3,-0.5);K.armTo(R,-1,-2.6,h3lerp(14,10.2,dn),h3lerp(3,5.4,dn),-1,0,-0.4);K.cloak(R);};
// quỳ, ngắt sát đất (nấm, trứng, rau)
H3PO.kpick=(R,k,o)=>{const K=h3ik(),j=(o.n||0)*1.9,rx=0.8+Math.sin(j)*1.4,rz=9.4+Math.cos(j)*0.8;K.kneel(R,8.2,0.24);R.hips.rotation.x=0.1;R.torso.rotation.x=0.55;R.head.rotation.x=0.45;
  let x,y,z;if(k<0.35){const e=h3ss(k/0.35);x=h3lerp(0,rx,e);y=h3lerp(9,1.6,e);z=h3lerp(6.8,rz,e);}else if(k<0.5){x=rx;y=1.6;z=rz;}else if(k<0.85){const e=h3ss((k-0.5)/0.35);x=h3lerp(rx,-0.2,e);y=h3lerp(1.6,9,e);z=h3lerp(rz,6.8,e);}else{x=-0.2;y=9;z=6.8;}
  K.armTo(R,1,x,y,z,1,-0.3,-0.5);R.handR.rotation.set(0.4,0,k>0.35&&k<0.5?0.6:0);K.armTo(R,-1,-1.3,8.6,6.6,-1,-0.3,-0.5);R.handL.rotation.set(0.6,0,-0.8);K.cloak(R,0.3);};
// ngồi xổm xem xét
H3PO.inspect=(R,k)=>{const K=h3ik(),s=Math.sin(k*Math.PI*2);K.hipsAt(R,0,8.6,-2);K.legTo(R,-1,-2.8,1.45,2.2,-0.6,0.2,1);K.legTo(R,1,2.8,1.45,1.6,0.6,0.2,1);K.footTo(R,-1,0,-0.25);K.footTo(R,1,0,0.25);
  R.torso.rotation.x=0.62;R.head.rotation.set(0.5,0.15*s,0);K.armTo(R,1,1.2+0.6*s,2.8,8.6,1,-0.3,-0.5);K.armTo(R,-1,-2.6,9.5,4.5,-1,0,-0.4);K.cloak(R,0.3);};
// quỳ đào củ: có gậy đào thì chọc gậy, không thì bới bằng tay
H3PO.kdig=(R,k,o)=>{const K=h3ik();K.kneel(R,7.8,0.28);R.hips.rotation.x=0.12;R.torso.rotation.x=0.5;R.head.rotation.x=0.4;
  if(o.stick){const up=k<0.45?h3ss(k/0.45):k<0.58?1-h3ss((k-0.45)/0.13):0,lev=k>0.6?Math.sin((k-0.6)/0.4*Math.PI):0;const hd=K.W(0,0,-0.9+0.4*lev,0.45+0.2*lev);
    const gy=h3lerp(10,16,up)+lev*1.2,gz=h3lerp(8,7,up)-lev*0.8;K.gripTo(R,1,0.6,gy,gz,hd,K.W(1,0,0,1),K.W(2,1,-0.2,-0.6));K.gripTo(R,-1,-0.4,gy+3.4,gz-1.6,hd,K.W(1,0,0,1),K.W(3,-1,-0.2,-0.6));}
  else{const a=k*Math.PI*4;K.armTo(R,1,1.3,1.6+1.8*Math.max(0,Math.sin(a)),9.2+1.4*Math.cos(a),1,-0.3,-0.4);K.armTo(R,-1,-1.3,1.6+1.8*Math.max(0,Math.sin(a+Math.PI)),9.2+1.4*Math.cos(a+Math.PI),-1,-0.3,-0.4);R.torso.rotation.x=0.72;}
  K.cloak(R,0.3);};
// quỳ ven nước lật đá, mò ốc
H3PO.scoop=(R,k)=>{const K=h3ik(),a=k*Math.PI*2;K.kneel(R,5.8,0.24);R.hips.rotation.x=0.25;R.torso.rotation.x=0.85;R.head.rotation.x=0.35;
  const lift=k>0.8?h3ss((k-0.8)/0.2):0;K.armTo(R,1,1.4+0.8*Math.cos(a),h3lerp(0.8+0.6*Math.sin(a),7,lift),h3lerp(10.6,7,lift),1,-0.3,-0.4);K.armTo(R,-1,-1.4+0.8*Math.cos(a+1.4),h3lerp(0.8,7,lift),h3lerp(10.4,7,lift),-1,-0.3,-0.4);K.cloak(R,0.3);};
// hun khói tổ ong bằng đuốc, tay kia che mặt
H3PO.smoke=(R,k)=>{const K=h3ik(),a=k*Math.PI*2;K.hipsAt(R,0,17,0.4);K.feet(R,-2.2,2.6,2.3,-1.8);R.torso.rotation.set(-0.05,0.1*Math.sin(a),0);R.head.rotation.set(-0.35,0.15,0);
  K.gripTo(R,1,2.6+1.2*Math.sin(a),29+1.8*Math.cos(a),9.5,K.W(0,0,0.6,1),K.W(1,0,-1,0.4),K.W(2,1,-0.6,-0.3));K.armTo(R,-1,-0.8,31.6,5.2,-1,-0.6,-0.3);K.cloak(R);};
// kiễng chân với lên cao (sáp ong, buồng chuối)
H3PO.reach=(R,k)=>{const K=h3ik(),up=k<0.4?h3ss(k/0.4):k<0.6?1:1-h3ss((k-0.6)/0.4),tip=up;K.hipsAt(R,0,17.3+1.6*tip,0.2);K.legTo(R,-1,-2,1.45+2.4*tip,1);K.legTo(R,1,2,1.45+2.4*tip,-0.5);K.footTo(R,-1,0.75*tip);K.footTo(R,1,0.75*tip);
  R.torso.rotation.set(-0.12*up,0,0);R.head.rotation.set(-0.5*up,0,0);const tw=k>0.4&&k<0.6?Math.sin((k-0.4)/0.2*Math.PI*2)*0.8:0;
  K.armTo(R,1,1.4+tw,h3lerp(22,40,up),h3lerp(6,7,up),1,-0.4,-0.3);K.armTo(R,-1,-1.4+tw,h3lerp(22,39.5,up),h3lerp(6,7,up),-1,-0.4,-0.3);K.cloak(R);};
// xẻ thịt: quỳ bên xác (o.v: 'heave' lật, 'skin' lột da, 'gut' mổ bụng, 'cut' xẻ, 'pluckF' vặt lông, 'finish' kết liễu)
H3PO.butcher=(R,k,o)=>{const K=h3ik(),v=o.v||'cut',a=k*Math.PI*2;K.kneel(R,7.6,0.3);R.hips.rotation.x=0.15;R.torso.rotation.x=0.62;R.head.rotation.x=0.5;
  const hd=K.W(0,-0.2,-0.55,1),bd=K.W(1,0,-1,0),pr=K.W(2,1,-0.4,-0.4),pl=K.W(3,-1,-0.4,-0.4);
  if(v==='heave'){const p=h3ss(k<0.5?k/0.5:1-(k-0.5)/0.5);K.armTo(R,1,2,h3lerp(3,8,p),h3lerp(10.5,6.5,p),1,-0.3,-0.4);K.armTo(R,-1,-2,h3lerp(3,8,p),h3lerp(10.5,6.5,p),-1,-0.3,-0.4);R.torso.rotation.x=0.75-0.3*p;}
  else if(v==='gut'){const p=Math.sin(a);K.armTo(R,1,0.8,3+1.5*Math.max(0,p),10+p,1,-0.3,-0.4);K.armTo(R,-1,-0.8,3+1.5*Math.max(0,-p),10-p,-1,-0.3,-0.4);}
  else if(v==='finish'){const st=k<0.45?h3ss(k/0.45):k<0.6?1-h3ss((k-0.45)/0.15):0;K.gripTo(R,1,0.8,h3lerp(4,13,st),9,K.W(0,0,-1,0.15),K.W(1,0,0,1),pr);K.armTo(R,-1,-2.2,3.2,10.4,-1,-0.3,-0.4);}
  else if(v==='pluckF'){const p=h3fr(k*3);K.armTo(R,1,1+0.6*Math.sin(a),h3lerp(3.5,9,h3ss(p)),h3lerp(10,8,p),1,-0.3,-0.4);K.armTo(R,-1,-2,3.2,10.4,-1,-0.3,-0.4);}
  else if(v==='skin'){const p=Math.sin(a);K.gripTo(R,1,1.6+0.8*p,3.6,9.6+2*p,hd,bd,pr);K.armTo(R,-1,-1.4,h3lerp(4,8,h3ss(k)),h3lerp(10.4,8,h3ss(k)),-1,-0.3,-0.4);}
  else{const p=h3fr(k*2),st=p<0.4?h3ss(p/0.4):1-h3ss((p-0.4)/0.6);K.gripTo(R,1,1.4,h3lerp(3.2,9.5,st),9.8,K.W(0,0.1,-0.85,0.5),bd,pr);K.armTo(R,-1,-2,3.4,10.4,-1,-0.3,-0.4);}
  K.cloak(R,0.3);};
// cầm cần câu; o.bite: giật lên
H3PO.rod=(R,k,o)=>{const K=h3ik(),t=o.t,j=o.bite?Math.min(1,Math.abs(Math.sin(t*14))):0,a=0.5+0.08*Math.sin(t*1.1)+0.5*j;K.hipsAt(R,0,17.2,0);K.feet(R,-2.2,2.2,2.2,-1.4);R.torso.rotation.set(0.06-0.1*j,0,0);R.head.rotation.set(0.15,0,0);
  const hd=K.W(0,0,Math.sin(a),Math.cos(a));K.gripTo(R,1,2.2,21.5,7.5,hd,K.W(1,-1,0,0),K.W(2,1,-0.5,-0.4));K.gripTo(R,-1,1.4,21.5-3.4*Math.sin(a),7.5-3.4*Math.cos(a),hd,K.W(1,-1,0,0),K.W(3,-1,-0.5,-0.4));K.cloak(R);};
const H3POSE={pick:'pick',peer:'peer',pluck:'pluck',stoop:'stoop',kpick:'kpick',inspect:'inspect',kdig:'kdig',scoop:'scoop',smoke:'smoke',reach:'reach',butcher:'butcher'};
/* ===================== 4. CHỌN DÁNG MỖI KHUNG HÌNH + LỚP PHỦ + PHA TRỘN ===================== */
const H3BONES=['hips','torso','head','armL','armR','foreL','foreR','handL','handR','legL','legR','shinL','shinR','footL','footR','cloak','hair'];
const H3KNEEL=/^(w:h3butcher|w:h3kpick|w:h3kdig|w:h3scoop|w:h3inspect|w:knap|w:carve|w:grind|w:whittle|w:cook|sit|drink|stumble|w:drink)/;
function h3fadeFor(a,b){if(/^(air|land|jprep)/.test(a)||/^(air|land|jprep)/.test(b))return 0.09;if(/^a:(thrust|stab|punch)/.test(b))return 0.12;if(H3KNEEL.test(a)||H3KNEEL.test(b))return 0.32;if(/^g:/.test(a)&&/^g:/.test(b))return 0.25;return 0.2;}
function h3blend(R,key,dt){const T=THREE;let B=H3.BL;
  if(!B||B.R!==R){B=H3.BL={R,key,f:1,dur:0.2,from:H3BONES.map(()=>new T.Quaternion()),out:H3BONES.map(()=>new T.Quaternion()),hpF:new T.Vector3(),hpO:new T.Vector3(),sF:1,sO:1,tq:new T.Quaternion()};
    H3BONES.forEach((n,i)=>{if(R[n])B.out[i].copy(R[n].quaternion);});B.hpO.copy(R.hips.position);B.sO=R.torso.scale.y;}
  if(key!==B.key){for(let i=0;i<H3BONES.length;i++)B.from[i].copy(B.out[i]);B.hpF.copy(B.hpO);B.sF=B.sO;B.f=0;B.dur=h3fadeFor(B.key,key);B.key=key;}
  if(B.f<1){B.f=Math.min(1,B.f+dt/B.dur);const w=h3ss(B.f);for(let i=0;i<H3BONES.length;i++){const b=R[H3BONES[i]];if(!b)continue;B.tq.copy(b.quaternion);b.quaternion.copy(B.from[i]).slerp(B.tq,w);}
    B.tv=B.tv||new THREE.Vector3();B.tv.copy(R.hips.position);R.hips.position.lerpVectors(B.hpF,B.tv,w);R.torso.scale.y=h3lerp(B.sF,R.torso.scale.y,w);}
  for(let i=0;i<H3BONES.length;i++){const b=R[H3BONES[i]];if(b)B.out[i].copy(b.quaternion);}B.hpO.copy(R.hips.position);B.sO=R.torso.scale.y;}
function h3hair(R,name){if(!R.hair)return;const lie=name==='swim',pt=R.hips.rotation.x+R.torso.rotation.x+R.head.rotation.x;R.hair.rotation.set(lie?0.3:clamp(-pt*0.9,-1.05,0.15),0,lie?0:-(R.hips.rotation.z+R.torso.rotation.z+R.head.rotation.z)*0.8);}
// tiến độ đòn đánh: game gây sát thương ở 42% chu kỳ → dồn pha để đỉnh đòn của động tác rơi đúng lúc ấy
const h3remap=(k,a,b)=>k<a?k/a*b:b+(k-a)/(1-a)*(1-b);
function h3angD(a,b){return Math.atan2(Math.sin(a-b),Math.cos(a-b));}
function h3lookTick(dt,o){const L=H3.look;L.t-=dt;let ty=null,tp=0;
  const tg=G.target;if(tg){const p=tg.type==='res'?tg.q:tg.type==='animal'||tg.type==='foe'?tg.a:tg.type==='npc'?tg.n:tg.type==='folk'?tg.f:tg.b||tg.o||tg;if(p&&p.x!=null){ty=h3angD(Math.atan2(p.x-P.x,p.z-P.z),P.ry);tp=0.2;}}
  if(ty==null&&G.animals){let bd=260;for(const a of G.animals){if(!a.alive||!a.o||!a.o.visible)continue;const d=Math.hypot(a.x-P.x,a.z-P.z);if(d<bd){const r=h3angD(Math.atan2(a.x-P.x,a.z-P.z),P.ry);if(Math.abs(r)<1.5){bd=d;ty=r;tp=-0.05;}}}}
  if(ty==null){if(L.t<=0){L.t=2.5+Math.random()*4;L.ty=(Math.random()-0.5)*1.3;L.tp=(Math.random()-0.4)*0.25;if(Math.random()<0.35){L.ty=0;L.tp=0;}}ty=L.ty;tp=L.tp;}
  ty=clamp(ty,-1.0,1.0);L.y+=(ty-L.y)*Math.min(1,dt*3);L.p+=(tp-L.p)*Math.min(1,dt*3);o.headY=L.y;o.headP=L.p;o.lookY=ty;}
function h3poseApply(Rarg,mode,t){if(G.sleeping&&H3._poseApply0)return H3._poseApply0(Rarg,mode,t);if(!P.char2||!K3.char2Pose)return false;const R=P.rig;if(!R||!R.dims||!h3ik())return false;
  try{return h3pose(R,mode,t);}catch(e){if(!H3.perr){H3.perr=1;console.warn('hunt3 dáng',e);}return H3._poseApply0?H3._poseApply0(Rarg,mode,t):false;}}
function h3pose(R,mode,t){const dt=Math.min(0.05,G.dt||0.016),K=h3ik(),A=G.act,o=H3.po||(H3.po={}),oo=H3.poo||(H3.poo={});for(const k in o)o[k]=undefined;o.t=t;o.tool=P.toolId;oo.tool=P.toolId;oo.phase=undefined;oo.per=undefined;let key='idle',fn=null,k=0,orig=null,ph=t;
  // thở dốc sau khi chạy/leo/bơi
  H3.pant=clamp(H3.pant+(G.running?dt*0.22:G.climb||G.swim?dt*0.12:-dt*0.05),0,1);
  // xoay tại chỗ → dậm chân
  if(H3.lastRy==null)H3.lastRy=P.ry;const dR=h3angD(P.ry,H3.lastRy);H3.lastRy=P.ry;const om=Math.abs(dR)/Math.max(dt,1e-3);
  if((P.speed||0)<8&&om>1.0&&!A&&!G.work&&!P.air)H3.turnT=0.35;else H3.turnT=Math.max(0,H3.turnT-dt);
  const sp=P.speed||0,mv=sp>8&&!P.air,Ar=H3.air,W=G.work;
  if(G.ride||G.sit){orig='sit';key='sit';}
  else if(W){const st=W.steps[W.i]||W.steps[0];let a=st.a;if(a&&a.indexOf('h3')===0&&H3PO[a.slice(2)]){fn=H3PO[a.slice(2)];const cyc=st.cyc||0;k=cyc?h3fr(W.t/cyc):clamp(W.t/Math.max(0.05,st.t),0,1);o.n=st.n_||0;o.v=st.v;o.stick=st.stick;key='w:'+a+(st.v||'');}
    else{orig=a==='work'?'whittle':a;key='w:'+orig;}}
  else if(G.climb){H3.cph=(H3.cph||0)+dt*0.9;fn=H3PO.climb;k=h3fr(H3.cph);key='climb';}
  else if(G.swim){if(sp>8){H3.sph=(H3.sph||0)+dt*(sp>8?1:0.35);orig='swim';ph=H3.sph;key='swim';}else{fn=H3PO.tread;key='tread';}}
  else if(G.h3aim){const a=G.h3aim;if(a.bow){fn=H3PO.bow;o.draw=a.k;key='bow';}else{orig='throw';ph=0.42*h3ss(a.k);key='throw';}}
  else if(H3.bowRel>0){H3.bowRel-=dt;fn=H3PO.bow;o.draw=1;o.rel=1-H3.bowRel/0.45;key='bow';}
  else if(G.throwAnim>0){orig='throw';ph=clamp(1-G.throwAnim/0.45,0,1);key='throw';}
  else if(A){const per=A.per||0.72,kk=clamp(1-(A.next||0)/per,0,1),ty=A.t&&A.t.type;k=kk;
    if(ty==='rod'){fn=H3PO.rod;o.bite=!!A.bite;key='rod';}
    else if(ty==='fish'){fn=H3PO.thrust;o.down=1;key='a:thrustD';}
    else if(ty==='animal'){const tl=P.toolId&&ITEMS[P.toolId]&&ITEMS[P.toolId].tool;if(tl==='spear'){fn=H3PO.thrust;key='a:thrust';}else if(tl==='knife'){fn=H3PO.stab;key='a:stab';}
      else if(!tl||tl==='bow'||tl==='torch'||tl==='rod'||tl==='dig'||tl==='fire'){fn=H3PO.punch;o.n=A.n||0;key='a:punch'+((A.n||0)%2);}else{orig='chop';oo.phase=h3remap(kk,0.42,0.66);key='a:chop';}}
    else if(ty==='site'){orig='hammer';oo.phase=h3remap(kk,0.38,0.6);key='a:hammer';}
    else if(ty==='uproot'){orig='dig';key='a:dig';}
    else{const m=P.anim;if(m==='gather'){orig='gather';oo.phase=kk;key='a:gather';}else if(m==='dig'){orig='dig';key='a:dig';}else{orig=P.toolId&&ITEMS[P.toolId]&&ITEMS[P.toolId].tool==='pick'?'mine':'chop';oo.phase=h3remap(kk,0.42,0.66);oo.per=per;key='a:'+orig;}}}
  else if(G.drinkT>0){orig='drink';oo.phase=clamp(1-G.drinkT/2.6,0,1);key='drink';}
  else if(Ar.prep>0){fn=H3PO.jprep;k=1-Ar.prep/0.12;key='jprep';}
  else if(P.air){fn=H3PO.air;o.vy=P.vy||0;key='air'+(P.vy>0?'U':'D');}
  else if(Ar.stum>0){fn=H3PO.stumble;k=1-Ar.stum/0.8;key='stumble';}
  else if(Ar.land>0&&!mv){fn=H3PO.land;k=1-Ar.land/0.25;o.a=Ar.landA;key='land';}
  else if(mv||G.sneak||H3.turnT>0){let g=G.h3carry?'carry':G.sneak?'sneak':G.running&&sp>140?'run':sp>=75?'jog':'walk';let s=sp;if(!mv){if(H3.turnT>0&&!G.sneak){g='shuffle';s=Math.max(10,om*9);}else s=0;}
    if(s>0)H3.ph+=dt/h3gaitTc(g,s);const sl=clamp((hAt(P.x+Math.sin(P.ry)*10,P.z+Math.cos(P.ry)*10)-hAt(P.x-Math.sin(P.ry)*10,P.z-Math.cos(P.ry)*10))/20,-0.6,0.6);
    h3lookTick(dt,o);o.slope=sl;o.lean=(S.p.stam<12?0.14:0)+(G.h3carry?0.04:0);o.breath=Math.sin(t*(2.2+H3.pant*2.5))*0.008*(1+H3.pant*2);o.headY*=0.6;o.headP*=0.5;
    K3.char2Neutral(P.rig);h3gait(R,H3.ph,g,s,o);if(G.h3carry){K.armTo(R,-1,-3.9,31.6,-0.4,-1,0.4,-0.2);K.armTo(R,1,3.9,31.6,-0.4,1,0.4,-0.2);R.head.rotation.x-=0.1;}
    else if(P.toolId&&!G.sneak)h3carryTool(R,P.toolId,Math.sin(Math.PI*2*H3.ph));
    if(S.p.warm<25){R.torso.rotation.z+=Math.sin(t*38)*0.012;}key='g:'+g;}
  else{fn=H3PO.idle;h3lookTick(dt,o);o.tired=S.p.stam<6||(S.p.stam<14&&H3.pant>0.35)?1:0;o.cold=S.p.warm<25;
    // lau mồ hôi khi nóng hoặc làm lâu
    H3.idleT=(H3.idleT||0)+dt;if(H3.wipe<0&&H3.idleT>1.5&&G.t>H3.wipeT&&((G.tempC||20)>29||H3.workAcc>40)&&!o.cold&&!o.tired){H3.wipe=0;H3.wipeT=G.t+28;H3.workAcc=0;}
    if(H3.wipe>=0){H3.wipe+=dt/1.8;if(H3.wipe>=1)H3.wipe=-1;}o.wipe=H3.wipe;key='idle'+(o.tired?'T':o.cold?'C':'');}
  if(!fn&&!orig&&key.indexOf('g:')===0){}// đã dựng ở trên
  else if(fn){K3.char2Neutral(P.rig);fn(R,k,o);}else if(orig){K3.char2Pose(P.rig,orig,ph,oo);}
  if(key.indexOf('idle')!==0)H3.idleT=0;if(A||W)H3.workAcc+=dt;
  // bơi: đặt người theo mặt nước (không giả định mặt nước ở độ cao 0)
  if(G.swim){const wy=waterAt(P.x,P.z);if(wy>-900)P.model.position.y=key==='tread'?wy-16.2:wy+0.4-1.2;}
  // ----- lớp phủ -----
  if(P.hurtT>0){P.hurtT=Math.max(0,P.hurtT-dt);const w=Math.sin(Math.min(1,P.hurtT/0.4)*Math.PI*0.5);R.torso.rotation.x-=0.35*w;R.head.rotation.x-=0.3*w;R.head.rotation.y+=0.25*w;R.armL.rotation.x-=0.8*w;R.armR.rotation.x-=0.6*w;}
  if(H3.eat&&!W&&!G.swim){const E=H3.eat,kk=(G.t-E.t0)/E.dur;if(kk>=1||kk<0)H3.eat=null;else{const w=h3ss(kk/0.22)*(1-h3ss((kk-0.8)/0.2)),B=H3.tmpQ||(H3.tmpQ=[new THREE.Quaternion(),new THREE.Quaternion(),new THREE.Quaternion()]);
      B[0].copy(R.armR.quaternion);B[1].copy(R.foreR.quaternion);B[2].copy(R.handR.quaternion);const tq=H3.tq1||(H3.tq1=new THREE.Quaternion());const ch=E.drink?0:Math.sin(G.t*11)*0.4;K.armTo(R,1,0.7,E.drink?31.6:30.8+ch*0.3,E.drink?4.6:4.0,1,-0.3,-0.4);
      tq.copy(R.armR.quaternion);R.armR.quaternion.copy(B[0]).slerp(tq,w);tq.copy(R.foreR.quaternion);R.foreR.quaternion.copy(B[1]).slerp(tq,w);tq.copy(R.handR.quaternion);R.handR.quaternion.copy(B[2]).slerp(tq,w);
      R.head.rotation.x+=(E.drink?-0.4:0.08+ch*0.04)*w;}}
  if(H3.joy>0&&H3.joyG&&!W&&!A&&!G.swim){const kk=1-H3.joy/1.2,w=h3ss(kk/0.2)*(1-h3ss((kk-0.75)/0.25));if(H3.joyG==='pump'){R.armR.rotation.set(h3lerp(R.armR.rotation.x,-2.5+0.35*Math.sin(G.t*14),w),0,0.25*w);R.foreR.rotation.x=h3lerp(R.foreR.rotation.x,-1.7,w);}else R.head.rotation.x+=0.22*Math.sin(kk*Math.PI*4)*w;}
  if(H3.joy>0)H3.joy=Math.max(0,H3.joy-dt);
  // cung luôn cầm tay trái
  if(P.tool&&P.toolId==='bow'&&R.handL&&P.tool.parent!==R.handL){R.handL.add(P.tool);}
  h3hair(R,orig||key);h3blend(R,key,dt);h3faceTick(R,dt,key,P,true);return true;}
/* ===================== 5. NÉT MẶT: MI MẮT, TRÒNG MẮT, LÔNG MÀY, MIỆNG (lưới nhỏ gắn vào đầu, dựng lúc chạy) ===================== */
// dò hình đầu để biết mắt/miệng/lông mày nằm đâu (hợp với cả người mới models6c lẫn người cũ); thiếu gì thì bỏ qua
function h3faceKit(R){if(R._h3f!==undefined)return R._h3f;R._h3f=null;if(!window.THREE||!R.head)return null;const T=THREE;
  try{let eyeZ=-1e9,mZ=-1e9,bZ=-1e9,sk=null,skd=1e9;const v=new T.Vector3();
    R.head.children.forEach(m=>{if(!m.isMesh||!m.geometry||!m.geometry.attributes.position)return;m.updateMatrix();const pa=m.geometry.attributes.position,ca=m.geometry.attributes.color,n=pa.count;
      for(let i=0;i<n;i++){v.fromBufferAttribute(pa,i).applyMatrix4(m.matrix);const x=v.x,y=v.y,z=v.z;
        if(Math.abs(x-0.62)<0.13&&Math.abs(y-3.4)<0.13&&z>eyeZ)eyeZ=z;if(Math.abs(x)<0.12&&Math.abs(y-2.28)<0.16&&z>mZ)mZ=z;if(Math.abs(x-0.6)<0.16&&Math.abs(y-3.86)<0.12&&z>bZ)bZ=z;
        const d=Math.abs(x-1.0)+Math.abs(y-2.85);if(z>0.5&&d<skd){skd=d;sk=ca?new T.Color(ca.getX(i),ca.getY(i),ca.getZ(i)):(m.material&&m.material.color?m.material.color.clone():null);}}});
    if(eyeZ<0.5||eyeZ>4)return null;if(mZ<0.5)mZ=eyeZ+0.25;if(bZ<0.5)bZ=eyeZ+0.05;
    const FG=H3.FG||(H3.FG={lid:new T.SphereGeometry(0.34,10,5,0,Math.PI*2,0,Math.PI/2),iris:new T.CircleGeometry(0.16,12),pup:new T.CircleGeometry(0.075,10),brow:new T.SphereGeometry(0.5,14,7).scale(0.9,0.16,0.085),/* bầu dục thon hai đầu (trước là hộp chữ nhật) */
      mh:[new T.BoxGeometry(0.34,0.045,0.03).translate(-0.17,0,0),new T.BoxGeometry(0.34,0.045,0.03).translate(0.17,0,0)],mo:new T.SphereGeometry(0.2,10,6),
      mIris:new T.MeshStandardMaterial({color:0x2a180c,roughness:0.25}),mPup:new T.MeshBasicMaterial({color:0x050404}),mBrow:new T.MeshStandardMaterial({color:0x24180f,roughness:0.9}),mMouth:new T.MeshBasicMaterial({color:0x34120e})});
    const mLid=new T.MeshStandardMaterial({color:sk||new T.Color('#b07a52'),roughness:0.75});
    const g=new T.Group();g.name='h3face';R.head.add(g);const ez=eyeZ-0.3,F={g,lid:[],iris:[],brow:[],mh:[],mo:null,nb:1+Math.random()*3,bk:0,c:{br:0,bi:0,sm:0,op:0,lid:0.1,ly:0,lp:0},sac:{x:0,y:0,t:0}};
    [-1,1].forEach(s=>{const pv=new T.Group();pv.position.set(s*0.62,3.4,ez);g.add(pv);const l=new T.Mesh(FG.lid,mLid);pv.add(l);F.lid.push(pv);
      const ip=new T.Group();ip.position.set(s*0.62,3.4,ez);g.add(ip);const ir=new T.Mesh(FG.iris,FG.mIris);ir.position.z=0.312;ip.add(ir);const pu=new T.Mesh(FG.pup,FG.mPup);pu.position.z=0.316;ip.add(pu);F.iris.push(ip);
      const b=new T.Mesh(FG.brow,FG.mBrow);Object.defineProperty(b,'castShadow',{get:()=>false,set(){}});/* lông mày không đổ bóng (bóng răng cưa in lên mặt) */b.position.set(s*0.62,3.9,bZ+0.04);b.rotation.y=s*0.18;g.add(b);F.brow.push(b);});
    const mg=new T.Group();mg.position.set(0,2.3,mZ+0.02);g.add(mg);F.mg=mg;F.mh=FG.mh.map(gg=>{const m=new T.Mesh(gg,FG.mMouth);mg.add(m);return m;});F.mo=new T.Mesh(FG.mo,FG.mMouth);F.mo.scale.set(1.5,0.1,0.5);F.mo.position.set(0,-0.04,-0.06);mg.add(F.mo);
    g.traverse(o=>{o.layers.mask=R.head.layers.mask;if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});R._h3f=F;return F;}catch(e){console.warn('hunt3 mặt',e);return null;}}
// nét mặt mục tiêu: br (+ nhướn / − cau), bi (đầu lông mày trong nhướn: lo âu, đau), sm (cười +/mếu −), op (há miệng), lid (khép mi; âm = mở to)
const H3EX={calm:{br:0,bi:0,sm:0.12,op:0,lid:0.12},pain:{br:-0.7,bi:0.7,sm:-0.7,op:0.45,lid:0.65},strain:{br:-0.55,bi:0.1,sm:-0.45,op:0.12,lid:0.38},tired:{br:-0.1,bi:0.45,sm:-0.15,op:0.35,lid:0.45},
  hungry:{br:-0.1,bi:0.5,sm:-0.35,op:0.04,lid:0.32},cold:{br:-0.3,bi:0.35,sm:-0.3,op:0.05,lid:0.22},fear:{br:0.75,bi:0.6,sm:-0.25,op:0.32,lid:-0.25},joy:{br:0.35,bi:0,sm:0.95,op:0.2,lid:0.28},
  focus:{br:-0.35,bi:0,sm:-0.08,op:0,lid:0.3},sleepy:{br:-0.05,bi:0.2,sm:0,op:0.02,lid:0.58},talk:{br:0.15,bi:0,sm:0.25,op:0.15,lid:0.1},angry:{br:-0.85,bi:-0.2,sm:-0.5,op:0.3,lid:0.25}};
function h3exprPlayer(key){if(P.hurtT>0.05)return 'pain';
  if(G.animals){for(const a of G.animals){if(!a.alive||!H3PRED.test(a.kind||''))continue;const d=Math.hypot(a.x-P.x,a.z-P.z);if(d<(a.angry?380:200)&&a.o&&a.o.visible)return 'fear';}}
  if(H3.joy>0)return 'joy';if(/^(a:chop|a:mine|a:hammer|a:thrust|a:stab|a:punch|w:h3kdig|w:h3pluck|w:h3reach|climb|throw|g:carry|w:h3butcherheave|a:dig|w:dig|w:hammer)/.test(key)||G.h3aim&&!G.h3aim.bow)return 'strain';
  if(/^(w:knap|w:carve|w:whittle|w:lash|w:grind|w:h3pick|w:h3kpick|w:h3inspect|w:h3butcher|w:h3scoop|w:h3peer|bow|rod|w:cook)/.test(key))return 'focus';
  if(S.p.stam<15||H3.pant>0.45)return 'tired';if(S.p.warm<25)return 'cold';if(S.p.food<20||S.p.water<20)return 'hungry';if(isNight()&&/^idle/.test(key))return 'sleepy';return 'calm';}
const H3V=[];
function h3faceTick(R,dt,key,ent,isPlayer,exOverride,lookAt){const F=h3faceKit(R);if(!F)return;const T=THREE;
  const ex=exOverride||(isPlayer?h3exprPlayer(key):'calm'),E=H3EX[ex]||H3EX.calm,c=F.c,kk=Math.min(1,dt*(ex==='pain'||ex==='fear'?14:6));
  c.br+=(E.br-c.br)*kk;c.bi+=(E.bi-c.bi)*kk;c.sm+=(E.sm-c.sm)*kk;c.op+=(E.op-c.op)*kk;c.lid+=(E.lid-c.lid)*kk;
  // chớp mắt
  F.nb-=dt;if(F.nb<=0){F.bk=0.16;F.nb=(ex==='fear'?1.2:2)+Math.random()*4;if(Math.random()<0.15)F.nb=0.3;}let blink=0;if(F.bk>0){F.bk-=dt;blink=Math.sin(Math.max(0,F.bk)/0.16*Math.PI);}
  let op=c.op;if(isPlayer){op+=H3.pant*0.35*(0.55+0.45*Math.sin(G.t*(4+H3.pant*3)));if(ex==='cold')op+=0.08*Math.abs(Math.sin(G.t*30));
    if(ex==='sleepy'){H3.yawnT-=dt;if(H3.yawnT<-2.2)H3.yawnT=14+Math.random()*12;if(H3.yawnT<0){const y=Math.sin(-H3.yawnT/2.2*Math.PI);op+=0.9*y;blink=Math.max(blink,y*0.8);}}}
  if(ent&&ent._talk)op=0.08+0.32*Math.abs(Math.sin(G.t*9.3)*Math.sin(G.t*4.1+1));
  const sleeping=ent&&ent._sleep;const cl=sleeping?1:clamp(c.lid+blink*(1-c.lid)+0.05,-0.3,1),al=h3lerp(-0.75,1.08,cl);F.lid[0].rotation.x=al;F.lid[1].rotation.x=al;
  // lông mày
  const fr=Math.max(0,-c.br),ra=Math.max(0,c.br);F.brow.forEach((b,i)=>{const s=i?1:-1;b.position.y=3.9+ra*0.12+c.bi*0.03-fr*0.04;b.rotation.z=s*(fr*0.3-c.bi*0.32);});
  // miệng
  F.mh[0].rotation.z=-c.sm*0.42;F.mh[1].rotation.z=c.sm*0.42;const wd=1+0.12*Math.abs(c.sm)+(ex==='strain'?0.15:0);F.mg.scale.set(wd,1,1);F.mo.visible=op>0.04;F.mo.scale.set(1.3+0.3*c.sm,0.05+op*1.1,0.5);F.mo.position.y=-0.03-op*0.07;
  // mắt nhìn theo mục tiêu (giật nhẹ mắt khi nhìn quanh)
  let ly=0,lp=0;const tp=lookAt||(isPlayer?h3lookPoint():null);
  if(tp&&R.head.matrixWorld){const v=H3V[0]||(H3V[0]=new T.Vector3()),m=H3V[1]||(H3V[1]=new T.Matrix4());v.set(tp.x,tp.y,tp.z).applyMatrix4(m.copy(R.head.matrixWorld).invert());v.y-=3.4;ly=Math.atan2(v.x,Math.max(0.1,v.z));lp=Math.atan2(v.y,Math.hypot(v.x,v.z));}
  else{F.sac.t-=dt;if(F.sac.t<=0){F.sac.t=0.6+Math.random()*1.8;F.sac.x=(Math.random()-0.5)*0.5;F.sac.y=(Math.random()-0.5)*0.2;}ly=F.sac.x;lp=F.sac.y;}
  if(ex==='focus')lp=Math.min(lp,-0.25);ly=clamp(ly,-0.5,0.5);lp=clamp(lp,-0.35,0.3);const ke=Math.min(1,dt*18);c.ly+=(ly-c.ly)*ke;c.lp+=(lp-c.lp)*ke;F.iris.forEach(ip=>{ip.rotation.set(-c.lp,c.ly,0);});}
function h3lookPoint(){const tg=G.target,o=H3.lp||(H3.lp={x:0,y:0,z:0});let p=null;
  if(tg){p=tg.type==='res'?tg.q:tg.type==='animal'||tg.type==='foe'||tg.type==='carcass'?tg.a:tg.type==='npc'?tg.n:tg.type==='folk'?tg.f:tg.type==='pet'?tg.p:tg.b||tg.o||(tg.x!=null?tg:null);}
  if(!p&&G.animals){let bd=300;for(const a of G.animals){if(!a.alive||!a.o||!a.o.visible)continue;const d=Math.hypot(a.x-P.x,a.z-P.z);if(d<bd&&Math.abs(h3angD(Math.atan2(a.x-P.x,a.z-P.z),P.ry))<1.4){bd=d;p=a;}}}
  if(!p||p.x==null)return null;o.x=p.x;o.z=p.z;o.y=(p.y!=null?p.y:hAt(p.x,p.z))+(tg&&tg.type==='res'?6:10);return o;}
// dân làng, người nhà, kẻ cướp: nét mặt + khi trò chuyện thì gật đầu, khoa tay
function h3npcFaces(dt){const near=(x,z,r)=>Math.hypot(x-P.x,z-P.z)<r,pe=H3.pe||(H3.pe={});pe.x=P.x;pe.y=P.y+33;pe.z=P.z;
  const one=(rig,obj,x,z,talking,sleep,ex,ph)=>{if(!rig||!obj||!obj.visible||!near(x,z,talking?600:300))return;const R=rig.userData&&rig.userData.rig?rig.userData.rig:rig;if(!R||!R.head||!R.dims)return;
    const ent=R._h3e||(R._h3e={});ent._talk=talking;ent._sleep=sleep;
    if(talking){if(G.paused&&K3.char2Pose)K3.char2Pose(rig,'idle',G.t+(ph||0),{});const t=G.t+(ph||0);R.head.rotation.x+=0.1*Math.sin(t*5.2)*Math.max(0,Math.sin(t*0.9));R.head.rotation.y+=0.12*Math.sin(t*0.7);
      R.armR.rotation.x=-0.75+0.3*Math.sin(t*3.1);R.armR.rotation.z=0.25;R.foreR.rotation.x=-1.2+0.35*Math.sin(t*4.3);R.handR.rotation.set(0.2,0,0.4*Math.sin(t*2.6));
      const l=Math.max(0,Math.sin(t*0.8));R.armL.rotation.x=-0.5*l;R.foreL.rotation.x=-0.25-0.9*l;R.handL.rotation.set(0,0,-0.4*l);}
    h3faceTick(R,dt,'',ent,false,ex||(talking?'talk':null),near(x,z,170)||talking?pe:null);};
  const night=isNight();
  if(G.npcs)for(const n of G.npcs){const tk=G.panel==='npc'&&G.npcCur===n;if(tk&&G.paused&&n.o){n.ry=lerpAng(n.ry,Math.atan2(P.x-n.x,P.z-n.z),Math.min(1,dt*5));n.o.rotation.y=n.ry;}one(n.rig,n.o,n.x,n.z,tk,night&&n.work==='hide',null,n.ph);}
  if(S.folk)for(const f of S.folk){const tk=G.panel==='folk'&&G.folkCur===f;one(f._rig,f._o,f.x,f.z,tk,f._st==='sleep'&&(S.hour>=20||S.hour<6),null,f.seed);}
  if(G.foes)for(const f of G.foes){if(f.alive)one(f.rig,f.o,f.x,f.z,false,false,'angry',f.ph);}}
/* ===================== 6. HÁI LƯỢM TỪNG ĐỘNG TÁC ===================== */
const H3GK={berry:'berry',flax:'fiber',reeds:'fiber',reedBed:'fiber',tallgrass:'fiber',wildgrain:'grain',fern:'fern',stick:'ground',pebble:'ground',pathStone:'ground',bones:'ground',scree:'ground',
  mushroom:'mush',mushroomR:'mush',mugwort:'herb',centella:'herb',mint:'herb',aloe:'herb',ginger:'root',turmeric:'root',clay:'clay',beehive:'honey',banana:'banana',gourdwild:'gourd',lotus:'lotus',
  shrub:'branch',young:'branch',pineY:'branch',birchY:'branch',deadLog:'log',flowerR:'flower',flowerY:'flower',flowerW:'flower',flowerP:'flower'};
// st(tên, động tác, giây, âm thanh, {thêm})
const h3st=(n,a,t,fx,x)=>Object.assign({n,a,t,fx:fx||'pick'},x||{});
function h3rollYield(Y,sk){const out={};for(const k in Y){const [a,b]=Y[k];let n=a+Math.floor(Math.random()*(b-a+1));if((sk==='gather'||sk==='herb')&&Math.random()<skLv(sk)*0.06)n++;if(n>0)out[k]=n;}return out;}
// chia sản lượng cho từng bước (mỗi bước "nhặt/hái" trao 1 món, phần còn lại trao khi xong)
function h3perItem(steps,out,k,max,mk){const n=Math.min(out[k]||0,max);for(let i=0;i<n;i++)steps.push(mk(i));return n;}
function h3gatherSteps(kind,D,out,q){const S0=[],dig=!!hasTool('dig'),sick=!!hasTool('sickle'),torch=P.toolId==='torch';
  switch(kind){
    case 'berry':S0.push(h3st('Vạch lá tìm chùm quả chín','h3peer',0.8,'pick',{cyc:1.6}));h3perItem(S0,out,'berry',6,i=>h3st(`Hái từng quả (${i+1})`,'h3pick',0.55,'pick',{g:'berry',hold:'berry',n_:i}));break;
    case 'fiber':if(sick){S0.push(h3st('Vơ một bó, cắt sát gốc bằng liềm','h3pluck',0.8,'chop'),h3st('Gom, bó lại','lash',0.6));}else S0.push(h3st('Nắm chặt một bó gốc','h3pluck',0.75),h3st('Giật mạnh, nhổ cả bó','h3pluck',0.9,'step'),h3st('Tuốt bỏ lá, gom sợi','lash',0.9));break;
    case 'grain':S0.push(h3st('Vít bông kê xuống','h3pluck',0.7),h3st('Tuốt hạt vào lòng bàn tay','lash',1.0));break;
    case 'fern':S0.push(h3st('Tìm ngọn non còn cuộn','h3inspect',0.7,'pick',{cyc:1.4}),h3st('Bẻ ngọn dớn','h3kpick',0.6,'pick',{hold:'fern'}));break;
    case 'ground':{const k=Object.keys(out)[0];S0.push(h3st('Nhìn chỗ đặt chân, cúi xuống','h3stoop',0.5,'step',{cyc:0}));h3perItem(S0,out,k,3,i=>h3st(`Nhặt ${ITEMS[k].n.toLowerCase()} (${i+1})`,'h3stoop',0.85,'pick',{g:k,hold:k}));break;}
    case 'mush':S0.push(h3st('Ngồi xuống xem kỹ mũ, phiến nấm','h3inspect',1.0,'pick',{cyc:1.6,id:1}));{const k=Object.keys(out)[0];h3perItem(S0,out,k,3,i=>h3st(`Ngắt sát gốc (${i+1})`,'h3kpick',0.6,'pick',{g:k,hold:k,n_:i}));}break;
    case 'herb':S0.push(h3st('Tìm đúng lá thuốc','h3inspect',0.7,'pick',{cyc:1.4}),h3st('Ngắt ngọn non, để lại gốc','h3kpick',0.6,'pick',{hold:'herb'}));break;
    case 'root':S0.push(h3st(dig?'Chọc gậy đào xới quanh gốc':'Bới đất quanh gốc bằng tay','h3kdig',dig?0.9:1.8,'step',{cyc:1,stick:dig}),h3st('Nhổ cả củ lên','h3pluck',0.7),h3st('Rũ sạch đất','lash',0.5));break;
    case 'clay':S0.push(h3st('Cào lớp đất mặt','h3kdig',dig?0.8:1.3,'step',{cyc:1,stick:dig}),h3st('Moi đất sét dẻo','h3scoop',1.1,'step',{cyc:1.1}),h3st('Nắm thành cục','grind',0.7,'step'));break;
    case 'honey':if(torch)S0.push(h3st('Hun khói cho đàn ong lả đi','h3smoke',1.8,'step',{cyc:1.2}),h3st('Cắt tảng sáp đầy mật','h3reach',1.1,'chop'),h3st('Bọc mật vào lá','h3stoop',0.7));
      else S0.push(h3st('Thò tay vào tổ ong','h3reach',0.9,'pick',{sting:1}),h3st('Giật vội tảng mật, ong bu kín tay','h3reach',0.8,'pick'));break;
    case 'banana':S0.push(h3st('Kéo tàu lá xuống','h3reach',0.8),h3st('Bẻ nải chuối','h3reach',0.9,'chop'),h3st('Tước bẹ lấy sợi','lash',0.8));break;
    case 'gourd':S0.push(h3st('Lần theo dây tìm quả già','h3peer',0.7,'pick',{cyc:1.4}),h3st('Vặn cuống quả bầu','h3kpick',0.8));break;
    case 'lotus':S0.push(h3st('Lội ra, vít cuống sen','h3pluck',0.9,'drink'),h3st('Bẻ đài sen, tách hạt','lash',1.0));break;
    case 'branch':S0.push(h3st('Bẻ cành khô','h3pluck',0.8,'chop'),h3st('Bẻ thêm cành nữa','h3pluck',0.8,'chop'),h3st('Tước vỏ lấy sợi','lash',0.6));break;
    case 'log':S0.push(h3st('Bẻ lớp gỗ mục','h3pluck',0.9,'chop'),h3st('Nhặt gỗ, tìm nấm dưới thân','h3stoop',0.8));break;
    case 'flower':S0.push(h3st('Ngắt hoa','h3kpick',0.6,'pick',{hold:'flower'}));break;
    default:S0.push(h3st('Nhặt','h3stoop',0.8));}
  return S0;}
// bắt đầu hái/nhặt một tài nguyên tay không
function h3gatherStart(q){const D=RT[q.t],kind=H3GK[q.t]||'ground',sk=D.sk||'gather',sp=(1+skLv(sk)*0.06)*(S.buff&&S.buff.rested>TNOW()?1.12:1);
  const out=h3rollYield(D.yield,sk);let bad=0;
  if(kind==='mush'&&q.t==='mushroom'&&Math.random()<Math.max(0,0.2-0.04*skLv('herb')))bad=1;// nấm độc lẫn vào
  if(kind==='honey'&&P.toolId!=='torch'&&out.honey>1)out.honey--;
  const steps=h3gatherSteps(kind,D,out,q).map(s=>Object.assign(s,{t:s.t/sp}));
  if(!H3GK[q.t]&&D.hp>=2)steps.push(h3st('Làm tiếp','h3pluck',0.8));
  const icon=Object.keys(D.yield)[0];P.ry=Math.atan2(q.x-P.x,q.z-P.z);if(G.sit)sitToggle(false);G.act=null;G.walkTo=null;
  const W=G.work={r:{out:{},in:{}},steps,i:0,t:0,left:1,done:0,x:P.x,z:P.z,sk,icon:ITEMS[icon]?icon:'fiber',h3:1,h3q:q,h3out:out,h3bad:bad};
  W.fn=()=>{h3flush(W);h3gatherDone(q,out,D,kind,bad);};workUi();sfx('pick');}
function h3gatherDone(q,out,D,kind,bad){if(q.st!==0)return;const rest={};for(const k in out)if(out[k]>0)rest[k]=out[k];
  if(D.sting&&P.toolId!=='torch'){addStatus('sting');S.p.hp=Math.max(1,S.p.hp-6);uiToast('🐝 Ong đốt! Lần sau cầm đuốc để hun khói.','bad');}
  if(bad){if(skLv('herb')>=2){uiToast('🍄 Nhận ra một cây nấm độc lẫn vào: vứt bỏ.','good');addXp('herb',2);}else{rest.toadstool=(rest.toadstool||0)+1;uiToast('🍄 Có một cây nấm trông hơi khác lẫn trong mớ nấm…','');}}
  if(Object.keys(rest).length)give(rest,[q.x,q.y+12,q.z]);addXp(D.sk,D.hp+1);cnt('cnt',D.sk==='herb'?'herb':'gather');resDeplete(q);H3.hold=null;save();uiHud();}
// món nhỏ cầm trên tay khi hái (dùng chung một lưới, đổi màu)
const H3HOLD={berry:0x4a2a6a,egg:0xf2ead8,mushroom:0x9a6a3a,toadstool:0xc0302a,stone:0x8a857c,flint:0x5a6a7a,stick:0x7a5a34,bone:0xe8e0cc,fern:0x5a8a3a,herb:0x4f8a3a,flower:0xe8c040,snail:0x6a5038,yam:0x8a6a4a,fiber:0xb8a868,clay:0xa0603a};
function h3holdTick(R){const W=G.work,st=W&&W.steps[W.i],id=st&&st.hold;let m=H3.hm;
  if(!id||!R||!R.handR){if(m)m.visible=false;return;}if(!m||m.parent!==R.handR){if(!m){m=H3.hm=new THREE.Mesh(new THREE.SphereGeometry(0.55,7,5),new THREE.MeshStandardMaterial({roughness:0.6}));m.castShadow=false;}R.handR.add(m);m.position.set(0,-1.9,0.6);m.layers.mask=R.handR.layers.mask;}
  const k=clamp(W.t/Math.max(0.05,st.t),0,1),show=st.a==='h3pick'||st.a==='h3kpick'?k>0.4&&k<0.9:st.a==='h3stoop'?k>0.45:true;m.visible=show;m.material.color.setHex(H3HOLD[id]||0x8a7a5a);
  const sc=id==='egg'?[0.9,1.15,0.9]:id==='stick'||id==='bone'?[0.45,0.45,3.2]:id==='berry'?[0.5,0.5,0.5]:[1,0.8,1];m.scale.set(sc[0],sc[1],sc[2]);}
/* ---------- điểm hái lượm mới: tổ chim (trứng), bãi ốc suối, dây củ mài — sinh theo ô lưới, tất định theo hạt giống thế giới ---------- */
const H3NODE={nest:{n:'Tổ chim',seas:[0,1],per:0.5,regrow:3,yield:{egg:[2,4],feather:[0,1]},bio:[3,4]},snail:{n:'Bãi ốc suối',seas:[0,1,2],per:1.4,regrow:1.5,yield:{snail:[3,6]},water:1},
  yam:{n:'Dây củ mài',seas:null,per:0.6,regrow:4,yield:{yam:[1,3]},bio:[3,4]}};
const H3CELL=320;
function h3hash(a,b,c){const s=Math.sin(a*127.1+b*311.7+c*74.7+(S&&S.seed||1)*0.0001)*43758.5453;return s-Math.floor(s);}
function h3cellNodes(ci,cj){const C=H3.cc||(H3.cc=new Map()),key=ci+','+cj;if(C.has(key))return C.get(key);const out=[];
  for(const kind in H3NODE){const N=H3NODE[kind];const tries=N.water?6:3;let n=0,want=Math.floor(N.per+h3hash(ci,cj,kind.length*7));
    for(let k=0;k<tries&&n<want;k++){const x=(ci+h3hash(ci,cj,k*13+kind.length))*H3CELL,z=(cj+h3hash(cj,ci,k*17+kind.length*3))*H3CELL;if(Math.hypot(x,z)>WR*0.98)continue;const wd=wdAt(x,z);
      if(N.water){if(wd<0.4||wd>3.5)continue;}else{if(wd>0.05||!N.bio.includes(bgAt(x,z))||slopeAt(x,z)>0.6||cellBusy(x,z))continue;}
      out.push({id:kind+':'+ci+':'+cj+':'+k,kind,x,z,y:hAt(x,z),ry:h3hash(ci,k,cj)*6.283});n++;}}
  C.set(key,out);if(C.size>400){const f=C.keys().next().value;C.delete(f);}return out;}
function h3nodeLive(n){const N=H3NODE[n.kind],dep=h3S().dep[n.id];if(dep&&TNOW()<dep)return false;if(N.seas&&!N.seas.includes(seasonIdx()))return false;return true;}
function h3nodesTick(){const ci=Math.floor(P.x/H3CELL),cj=Math.floor(P.z/H3CELL),key=ci+','+cj+':'+seasonIdx();if(key===H3.cell&&G.t<H3.nodeT)return;H3.cell=key;H3.nodeT=G.t+5;
  const L=H3.nodes;L.length=0;for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++)for(const n of h3cellNodes(ci+i,cj+j))if(h3nodeLive(n))L.push(n);h3nodesDraw();
  const d=h3S().dep;for(const k in d)if(TNOW()>d[k])delete d[k];}
function h3inst(obj,N,sc){const out=[];if(!obj)return out;obj.updateMatrixWorld(true);obj.traverse(m=>{if(m.isMesh&&m.geometry){const im=new THREE.InstancedMesh(m.geometry,m.material,N);im.userData.base=m.matrixWorld.clone();im.userData.sc=sc||1;im.count=0;im.frustumCulled=false;im.castShadow=false;im.receiveShadow=true;G.sc.add(im);out.push(im);}});return out;}
function h3nodesDraw(){const T=THREE;if(!H3.NM){const NM=H3.NM={};
    try{NM.nest=h3inst(model(['piece','nest']),48,0.6);}catch(e){NM.nest=[];}
    try{NM.yam=h3inst(model(['herb','turmeric']),48,1.1);}catch(e){NM.yam=[];}
    const mk=(geo,col,N)=>{const im=new T.InstancedMesh(geo,new T.MeshStandardMaterial({color:col,roughness:0.55}),N);im.userData.base=new T.Matrix4();im.userData.sc=1;im.count=0;im.frustumCulled=false;G.sc.add(im);return im;};
    NM.snail=[mk(new T.SphereGeometry(1.3,7,5).scale(1,0.75,1.25),0x6a5038,160)];NM.yam.push(mk(new T.SphereGeometry(5,8,4,0,Math.PI*2,0,Math.PI/2).scale(1,0.35,1),0x6a4a2c,48));
    if(!NM.nest.length)NM.nest=[mk(new T.TorusGeometry(4,1.6,5,10).rotateX(Math.PI/2),0xa08a50,48),mk(new T.SphereGeometry(1.1,7,5).scale(1,1.3,1),0xf2ead8,48)];}
  const NM=H3.NM,o=H3.o3||(H3.o3=new T.Object3D()),mm=H3.m3||(H3.m3=new T.Matrix4());const cnt={nest:0,yam:0,snail:0};
  const put=(arr,i,x,y,z,ry,s)=>{for(const im of arr){if(i>=im.instanceMatrix.count)continue;o.position.set(x,y,z);o.rotation.set(0,ry,0);o.scale.setScalar(s*im.userData.sc);o.updateMatrix();mm.multiplyMatrices(o.matrix,im.userData.base);im.setMatrixAt(i,mm);}};
  for(const n of H3.nodes){if(n.kind==='snail'){const im=NM.snail[0];for(let k=0;k<4&&cnt.snail<160;k++){const a=n.ry+k*1.7,r=2+k*2.2,x=n.x+Math.cos(a)*r,z=n.z+Math.sin(a)*r;o.position.set(x,hAt(x,z)+0.7,z);o.rotation.set(0,a,0);o.scale.setScalar(1);o.updateMatrix();im.setMatrixAt(cnt.snail++,o.matrix);}continue;}
    const arr=NM[n.kind];if(!arr||cnt[n.kind]>=48)continue;put(arr,cnt[n.kind],n.x,n.y+(n.kind==='nest'?0.4:0),n.z,n.ry,1);cnt[n.kind]++;}
  for(const k in NM)for(const im of NM[k]){im.count=k==='snail'?cnt.snail:cnt[k];im.instanceMatrix.needsUpdate=true;}}
function h3nodeNear(x,z,r){let best=null,bd=r;for(const n of H3.nodes){const d=Math.hypot(n.x-x,n.z-z)-(n.kind==='snail'?8:5);if(d<bd){bd=d;best=n;}}return best?{n:best,d:bd}:null;}
function h3nodeInfo(n){const N=H3NODE[n.kind];if(n.kind==='yam')return {name:N.n+(hasTool('dig')?'':' · đào tay rất lâu'),verb:'Đào củ',ok:true,icon:'yam',warn:hasTool('dig')?null:'Có Gậy đào sẽ nhanh và được nhiều củ hơn'};
  if(n.kind==='nest')return {name:N.n+' · có trứng',verb:'Nhặt trứng',ok:true,icon:'egg'};return {name:N.n,verb:'Mò ốc',ok:true,icon:'snail'};}
function h3nodeStart(n){const N=H3NODE[n.kind],out=h3rollYield(N.yield,'gather'),sp=1+skLv('gather')*0.06,dig=!!hasTool('dig');const st=[];
  if(!invFits(Object.keys(N.yield)[0],1)){uiToast('Túi đầy! Cất bớt đồ.','bad');return;}
  if(n.kind==='nest'){st.push(h3st('Rón rén lại gần, chim mẹ bay vụt đi','h3inspect',0.8,'pick',{cyc:1.6}));h3perItem(st,out,'egg',4,i=>h3st(`Nhặt từng quả trứng (${i+1})`,'h3kpick',0.6,'pick',{g:'egg',hold:'egg',n_:i}));}
  else if(n.kind==='snail'){st.push(h3st('Lật đá dưới nước tìm ốc','h3scoop',1.2,'drink',{cyc:1.2}));const k=Math.ceil((out.snail||0)/2);for(let i=0;i<k;i++)st.push(h3st(`Nhặt ốc bám đá (${i+1})`,'h3scoop',0.7,'drink',{cyc:0.7,hold:'snail',g2:'snail'}));}
  else{if(!dig&&out.yam>1)out.yam--;st.push(h3st('Lần theo dây leo xuống gốc','h3inspect',0.9,'pick',{cyc:1.6}),h3st(dig?'Chọc gậy đào xới đất':'Bới đất bằng tay (chậm, đau tay)','h3kdig',dig?1.5:3.2,'step',{cyc:1,stick:dig}),
    h3st(dig?'Đào sâu quanh củ':'Moi sâu thêm','h3kdig',dig?1.5:3.0,'step',{cyc:1,stick:dig}),h3st('Bẩy củ lên, rũ đất','h3pluck',0.9,'pick',{hold:'yam'}));}
  P.ry=Math.atan2(n.x-P.x,n.z-P.z);if(G.sit)sitToggle(false);G.act=null;G.walkTo=null;if(dig&&n.kind==='yam')selectTool('dig');
  const W=G.work={r:{out:{},in:{}},steps:st.map(s=>Object.assign(s,{t:s.t/sp})),i:0,t:0,left:1,done:0,x:P.x,z:P.z,sk:'gather',icon:Object.keys(N.yield)[0],h3:1,h3out:out,h3node:n};
    W.fn=()=>{h3flush(W);const rest={};for(const k in out)if(out[k]>0)rest[k]=out[k];if(Object.keys(rest).length)give(rest,[n.x,n.y+8,n.z]);h3S().dep[n.id]=+(TNOW()+N.regrow*(0.8+Math.random()*0.4)).toFixed(3);
      addXp('gather',2);cnt('cnt','gather');if(n.kind==='nest')cnt('cnt','eggs');H3.cell='';H3.hold=null;save();};workUi();sfx('pick');}
/* ===================== 7. SĂN BẮN ===================== */
// tiếng động/độ lộ của người chơi (1 = đi bộ bình thường). life3 có thể dùng: tầm phát hiện × playerNoise()
function playerNoise(){let n=G.sneak?0.4:G.running?1.4:1;if((P.speed||0)<5)n*=0.75;if(G.h3carry)n*=1.15;if(G.sneak){const b=bgAt(P.x,P.z);if(b===3||b===4)n*=0.85;}if(G.h3aim)n*=0.9;if(isNight())n*=0.85;return n;}
window.playerNoise=playerNoise;
/* ---------- ngắm: giữ nút ném để kéo/giương, thả ra để phóng ---------- */
const H3PROJ={arrow:{v:760,g:240,draw:0.75},spear:{v:540,g:380,draw:0.55},stone:{v:430,g:380,draw:0.35}};
function h3aimSol(A){const C=H3PROJ[A.id]||H3PROJ.stone,k=0.5+0.5*h3ss(A.k),v=C.v*k,fp=isFP();let yaw=P.ry,pit=fp?(G.fpitch||0)+(A.id==='arrow'?0.03:0.08):A.id==='arrow'?0.06:0.32,tg=null;
  const ex=P.x+Math.sin(yaw)*8,ez=P.z+Math.cos(yaw)*8,ey=P.y+(fp?(G.eyeH||EYE)-3:A.id==='arrow'?30:28);
  if(!fp&&G.animals){let bs=1e9;const rng=Math.min(900,v*v/C.g*0.95);for(const a of G.animals){if(!a.alive||!a.o||!a.o.visible)continue;const dx=a.x-P.x,dz=a.z-P.z,d=Math.hypot(dx,dz);if(d>rng||d<10)continue;const da=Math.abs(h3angD(Math.atan2(dx,dz),P.ry));if(da>0.5)continue;const sc=d*(1+da*3);if(sc<bs){bs=sc;tg=a;}}
    if(tg){yaw=Math.atan2(tg.x-P.x,tg.z-P.z);const d=Math.hypot(tg.x-ex,tg.z-ez),h=(tg.y+(tg._hgt||tg.r*1.3)*0.55)-ey,g=C.g,v2=v*v,disc=v2*v2-g*(g*d*d+2*h*v2);if(disc>=0)pit=Math.atan((v2-Math.sqrt(disc))/(g*d));}}
  A.yaw=yaw;A.pit=pit;A.v=v;A.g=C.g;A.ex=P.x+Math.sin(yaw)*8;A.ez=P.z+Math.cos(yaw)*8;A.ey=ey;A.tg=tg;return A;}
function h3aimStart(){const bow=P.toolId==='bow',id=bow?(typeof bowReady==='function'&&bowReady()?'arrow':null):throwable();if(!id)return false;if(S.p.stam<(bow?3:5))return false;
  G.h3aim={id,bow,t0:G.t,k:0,key:!!(G.keys&&G.keys.KeyG),tool:P.toolId};G.act=null;sfx(bow?'pick':'step');return true;}
function h3aimTick(dt){const A=G.h3aim;if(!A)return;if(G.work||G.swim||G.sit||G.ride||P.toolId!==A.tool||G.paused){G.h3aim=null;h3prevHide();return;}
  const C=H3PROJ[A.id]||H3PROJ.stone;A.k=clamp((G.t-A.t0)/C.draw,0,1);if(A.bow&&A.k>=1)S.p.stam=Math.max(0,S.p.stam-dt*1.5);h3aimSol(A);
  if(!isFP()&&A.tg)P.ry=lerpAng(P.ry,A.yaw,Math.min(1,dt*10));if(G.t-A.t0>C.draw+3.5)h3release();else h3prevDraw(A);}
function h3release(){const A=G.h3aim;if(!A)return;G.h3aim=null;h3prevHide();h3aimSol(A);const n0=G.proj?G.proj.length:0;P.ry=A.yaw;
  H3._throwIt0();const p=G.proj&&G.proj.length>n0?G.proj[G.proj.length-1]:null;
  if(p){const c=Math.cos(A.pit);p.vx=Math.sin(A.yaw)*c*A.v;p.vy=Math.sin(A.pit)*A.v;p.vz=Math.cos(A.yaw)*c*A.v;p.x=A.ex;p.z=A.ez;p.y=A.ey;p.o.position.set(p.x,p.y,p.z);p.pow=A.k;p.px=p.x;p.py=p.y;p.pz=p.z;}
  if(A.bow){H3.bowRel=0.45;G.throwAnim=0;}else if(G.throwAnim>0)G.throwAnim=0.26;}
// đường bay dự kiến (đường chấm + vòng chỗ rơi)
function h3prevDraw(A){const T=THREE;if(!H3.prev){const N=40,g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(N*3),3));
    const ln=new T.Line(g,new T.LineDashedMaterial({color:0xffe6a0,dashSize:5,gapSize:4,transparent:true,opacity:0.85,depthWrite:false}));ln.frustumCulled=false;ln.renderOrder=5;G.sc.add(ln);
    const rg=new T.Mesh(new T.RingGeometry(3.2,4.4,16).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0xffe6a0,transparent:true,opacity:0.8,depthWrite:false}));rg.renderOrder=5;G.sc.add(rg);H3.prev={ln,rg,N};}
  const V=H3.prev,pa=V.ln.geometry.attributes.position,a=pa.array;let x=A.ex,y=A.ey,z=A.ez;const c=Math.cos(A.pit);let vx=Math.sin(A.yaw)*c*A.v,vy=Math.sin(A.pit)*A.v,vz=Math.cos(A.yaw)*c*A.v,i=0,hit=false;const dt=1/30;
  for(;i<V.N;i++){a[i*3]=x;a[i*3+1]=y;a[i*3+2]=z;if(i>0&&y<=Math.max(hAt(x,z),waterAt(x,z))){hit=true;i++;break;}vy-=A.g*dt;x+=vx*dt;y+=vy*dt;z+=vz*dt;}
  V.ln.geometry.setDrawRange(0,i);pa.needsUpdate=true;V.ln.computeLineDistances();V.ln.visible=true;V.rg.visible=hit;if(hit)V.rg.position.set(a[(i-1)*3],Math.max(hAt(a[(i-1)*3],a[(i-1)*3+2]),waterAt(a[(i-1)*3],a[(i-1)*3+2]))+0.6,a[(i-1)*3+2]);
  V.ln.material.color.setHex(A.tg?0xffa060:0xffe6a0);}
function h3prevHide(){if(H3.prev){H3.prev.ln.visible=false;H3.prev.rg.visible=false;}}
/* ---------- đạn bay: kiểm tra cả đoạn đường bay mỗi khung (tên nhanh không xuyên qua thỏ), trúng đầu/mình/chân ---------- */
function h3projTick(dt){if(!G.proj||!G.proj.length)return;for(let i=G.proj.length-1;i>=0;i--){const p=G.proj[i];if(p.px==null){p.px=p.x;p.py=p.y;p.pz=p.z;}
    p.t+=dt;p.vy-=(p.grav||380)*dt;const x0=p.x,y0=p.y,z0=p.z;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.o.position.set(p.x,p.y,p.z);
    if(p.id==='arrow'){const sp=Math.hypot(p.vx,p.vz);p.o.rotation.set(-Math.atan2(p.vy,sp),Math.atan2(p.vx,p.vz),0);}else if(p.id==='spear'){const sp=Math.hypot(p.vx,p.vz);p.o.rotation.order='YXZ';p.o.rotation.set(Math.PI/2-Math.atan2(p.vy,sp),Math.atan2(p.vx,p.vz),0);}else{p.o.rotation.x+=dt*14;p.o.rotation.z+=dt*9;}
    let hit=null,hx=0,hy=0,hz=0;const sx=p.x-x0,sy=p.y-y0,sz=p.z-z0,L2=sx*sx+sz*sz+1e-6;
    const test=(a,r,y1,y2)=>{let u=((a.x-x0)*sx+(a.z-z0)*sz)/L2;u=clamp(u,0,1);const cx=x0+sx*u,cz=z0+sz*u,cy=y0+sy*u;if(Math.hypot(a.x-cx,a.z-cz)<r&&cy>y1&&cy<y2){hit=a;hx=cx;hy=cy;hz=cz;return true;}return false;};
    if(G.foes)for(const a of G.foes){if(a.alive&&test(a,a.r+5,a.y,a.y+40))break;}
    if(!hit)for(const a of G.animals){if(!a.alive||!a.o||!a.o.visible)continue;if(test(a,a.r+4,a.y-2,a.y+(a._hgt||a.r*1.3)+6))break;}
    const gy=Math.max(hAt(p.x,p.z),waterAt(p.x,p.z));if(!(hit||p.y<=gy||p.t>4))continue;G.proj.splice(i,1);
    if(hit){const pw=p.pow==null?0.8:p.pow,base=p.id==='spear'?3.5:p.id==='arrow'?2.8:1.3;let zone='body',mul=1;
      if(hit.kind!=='raider'){const f=((hx-hit.x)*Math.sin(hit.ry||0)+(hz-hit.z)*Math.cos(hit.ry||0))/Math.max(1,hit.r),hr=(hy-hit.y)/Math.max(2,hit._hgt||hit.r*1.3);
        zone=f>0.45&&hr>0.4?'head':hr<0.3?'leg':'body';mul=zone==='head'?1.9:zone==='leg'?0.6:1;}
      const dmg=base*mul*(0.45+0.55*pw)*(1+0.06*skLv('hunt'));H3.hit={zone,w:p.id};
      if(hit.kind==='raider')foeDamage(hit,dmg);else animalDamage(hit,dmg);H3.hit=null;addXp('hunt',2);
      uiFloat(zone==='head'?'Trúng đầu!':zone==='leg'?'Trúng chân':'Trúng!',hit.x,hit.y+(hit._hgt||20)+10,hit.z,zone==='head'?'#ffb070':'#ffd27a');
      if((p.id==='spear'||p.id==='arrow')&&hit.alive&&hit.o){hit.o.attach(p.o);(hit._h3stk||(hit._h3stk=[])).push({o:p.o,id:p.id,t:G.t});continue;}
      if(p.id==='arrow'&&Math.random()<0.4){G.sc.remove(p.o);continue;}dropAdd(p.id,hit.x+(Math.random()-0.5)*8,hAt(hit.x,hit.z)+1,hit.z+(Math.random()-0.5)*8,p.o);continue;}
    sfx(wdAt(p.x,p.z)>0.5?'drink':'thud');if(wdAt(p.x,p.z)>8){G.sc.remove(p.o);if(p.id==='spear')uiToast('Giáo chìm xuống nước mất rồi.','bad');continue;}
    if(p.id==='arrow'&&Math.random()<0.45){G.sc.remove(p.o);continue;}dropAdd(p.id,p.x,hAt(p.x,p.z)+1,p.z,p.o);}}
// giáo/tên cắm trên mình thú: rơi xuống khi thú chết hoặc sau một lúc
function h3stuckTick(a,force){const L=a._h3stk;if(!L||!L.length)return;for(let i=L.length-1;i>=0;i--){const s=L[i];if(!force&&G.t-s.t<25&&a.alive)continue;L.splice(i,1);G.sc.attach(s.o);s.o.scale.set(1,1,1);
    if(s.id==='arrow'&&Math.random()<0.35){G.sc.remove(s.o);continue;}dropAdd(s.id,a.x+(Math.random()-0.5)*10,hAt(a.x,a.z)+1,a.z+(Math.random()-0.5)*10,s.o);}}
/* ---------- vết thương, chảy máu, ngã quỵ ---------- */
const H3WT={rabbit:3,junglefowl:2,monkey:7,snake:1,deer:45,boar:60,wolf:32,tiger:110,gaur:300,bear:200,crocodile:180};
function h3wound(a,dmg){const D=ANIMALS[a.kind]||{},mx=a._hpMax||D.hp||1,h=H3.hit||{zone:'body',w:P.toolId||'hand'};const blunt=h.w==='stone'||h.w==='hand'||h.w==='club'||!h.w;
  const sev=Math.min(1.5,dmg/mx);a._h3bl=Math.min(3,(a._h3bl||0)+sev*(blunt?0.4:h.zone==='leg'?2:2.6));if(h.zone==='leg')a._h3leg=1;
  const prey=D.aggro==='never'||D.aggro==='defend';if(!a._h3down&&a.alive&&((prey&&a.hp<=mx*0.25)||a.hp<=mx*0.1||(h.zone==='head'&&blunt&&mx<=2))){h3down(a);}
  else if(a._h3bl>0.4&&Math.hypot(a.x-P.x,a.z-P.z)<600&&G.t-(H3.bt||0)>6){H3.bt=G.t;uiToast(`🩸 ${a.n} bị thương, chảy máu${a._h3leg?', khập khiễng':''}. Lần theo vết máu!`,'');}}
function h3down(a){a._h3down={x:a.x,z:a.z,t:G.t,s:Math.random()<0.5?-1:1};a.angry=false;a._atk=null;a._chg=null;a._flee=null;a._panic=0;
  if(Math.hypot(a.x-P.x,a.z-P.z)<700)uiToast(`🦌 ${a.n} ngã quỵ! Lại gần, bấm "Kết liễu" cho nó đỡ đau.`,'gold');}
function h3bloodAdd(x,z,a,big){const B=H3.blood;B.push({x,z,t:G.t,s:(big?1.4:0.7)+Math.random()*0.7,ry:Math.random()*6.28,a,n:a?a.n:''});if(B.length>220)B.shift();H3.bdirty=1;}
function h3bloodDraw(){const T=THREE;if(!H3.BM){const g=new T.CircleGeometry(1.6,7).rotateX(-Math.PI/2);H3.BM=new T.InstancedMesh(g,new T.MeshBasicMaterial({color:0x6a0d0a,transparent:true,opacity:0.82,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3}),220);H3.BM.frustumCulled=false;H3.BM.count=0;G.sc.add(H3.BM);}
  const M=H3.BM,o=H3.o3b||(H3.o3b=new T.Object3D());let n=0;for(let i=H3.blood.length-1;i>=0;i--){const b=H3.blood[i];const age=G.t-b.t;if(age>720){H3.blood.splice(i,1);continue;}}
  for(const b of H3.blood){const age=G.t-b.t,s=b.s*(age<600?1:1-(age-600)/120);o.position.set(b.x,hAt(b.x,b.z)+0.3,b.z);o.rotation.set(0,b.ry,0);o.scale.set(s,1,s*1.3);o.updateMatrix();M.setMatrixAt(n++,o.matrix);}M.count=n;M.instanceMatrix.needsUpdate=true;H3.bdirty=0;}
// sau bộ não thú (life3): thú bị thương chạy chậm, nhỏ máu; ngã quỵ thì nằm giãy; mất máu quá thì chết
function h3animalsPost(dt){const W=H3.wl;for(const a of W){if(!a.alive){h3stuckTick(a,true);continue;}
    if(a._h3down){const d=a._h3down;a.x=d.x;a.z=d.z;a.angry=false;a._atk=null;a._chg=null;a.state='wander';const kk=Math.min(1,(G.t-d.t)/0.6),tw=Math.sin(G.t*9)*0.08*Math.max(0,1-(G.t-d.t)/30);
      if(a.o){a.o.rotation.set(0,a.ry||0,d.s*(1.35*kk+tw));a.o.position.set(a.x,(a.y!=null?a.y:hAt(a.x,a.z))+(a.r*0.3)*kk,a.z);const R=a.rig;if(R){const k2=Math.sin(G.t*7);['legFL','legBL'].forEach(n=>{if(R[n])R[n].rotation.x=0.4*k2*Math.max(0,1-(G.t-d.t)/40);});}}
      a.hp-=dt*(a._hpMax||1)*0.012;if(G.t-(a._h3bt||0)>2.2){a._h3bt=G.t;h3bloodAdd(a.x+(Math.random()-0.5)*a.r,a.z+(Math.random()-0.5)*a.r,a,1);}
      if(a.hp<=0)h3bleedOut(a);continue;}
    const k=clamp(1-(a._h3bl||0)*0.1-(a._h3leg?0.28:0),0.42,1);if(k<1&&a._h3px!=null){a.x=a._h3px+(a.x-a._h3px)*k;a.z=a._h3pz+(a.z-a._h3pz)*k;if(a.o){a.o.position.x=a.x;a.o.position.z=a.z;}}
    const mvd=a._h3px!=null?Math.hypot(a.x-a._h3px,a.z-a._h3pz):0;a._h3dist=(a._h3dist||0)+mvd;
    if(a._h3bl>0.05&&(a._h3dist>Math.max(7,a.r*0.9)||G.t-(a._h3bt||0)>3)){a._h3dist=0;a._h3bt=G.t;h3bloodAdd(a.x+(Math.random()-0.5)*a.r*0.5,a.z+(Math.random()-0.5)*a.r*0.5,a,a._h3bl>1.2);}
    a.hp-=dt*(a._h3bl||0)*(a._hpMax||1)*0.006;a._h3bl=Math.max(0,(a._h3bl||0)-dt*0.012);
    const D=ANIMALS[a.kind]||{},mx=a._hpMax||D.hp||1;if(a.hp<=0)h3bleedOut(a);else if(!a._h3down&&(D.aggro==='never'||D.aggro==='defend')&&a.hp<mx*0.2&&a._h3bl>0.6)h3down(a);
    h3stuckTick(a,false);}}
function h3bleedOut(a){if(!a.alive)return;const st=S.p.stam;a.hp=Math.min(a.hp,0.01);H3.hit={zone:'body',w:'bleed'};animalDamage(a,1);H3.hit=null;S.p.stam=st;
  const d=Math.hypot(a.x-P.x,a.z-P.z);if(d>120)uiToast(`🩸 ${a.n} đã gục vì mất máu, cách ~${Math.round(d/20)} m về phía ${h3dir(a.x-P.x,a.z-P.z)}. Lần theo vết máu.`,'gold');}
/* ---------- xác thú do người hạ: nằm lại, phải xẻ ---------- */
function h3carcass(a){const D=ANIMALS[a.kind]||{},drop={};for(const k in D.drop)drop[k]=D.drop[k]+(Math.random()<skLv('hunt')*0.08?1:0);const w=H3WT[a.kind]||10;if(w>=30)drop.sinew=(drop.sinew||0)+1+(w>=100?1:0);
  a._carc={drop,t:G.t,by:null,h3:1};a._h3down=null;a._h3bl=0;h3stuckTick(a,true);G.h3lastKill=a;if(Math.hypot(a.x-P.x,a.z-P.z)<400){H3.joy=1.2;H3.joyG='pump';}
  for(let i=0;i<3;i++)h3bloodAdd(a.x+(Math.random()-0.5)*a.r,a.z+(Math.random()-0.5)*a.r,a,1);}
function h3butcherStart(a){const c=a._carc;if(!c)return;const D=ANIMALS[a.kind]||{},w=H3WT[a.kind]||10,sz=clamp(0.35+w/60,0.4,2.4);
  const knife=h3cut(),flint=!knife&&invCount('flint')>0,stone=!knife&&!flint&&invCount('stone')>0,tl=knife?(knife==='bronzeKnife'?1.25:1):flint?0.75:stone?0.6:0.4,ym=knife?1:flint?0.9:stone?0.75:0.5;
  if(knife)selectTool('knife');const st=[],dr=Object.assign({},c.drop),take=(k,f)=>{const n=Math.max(0,Math.round((dr[k]||0)*f));dr[k]=Math.max(0,(dr[k]||0)-n);return n;};
  const gv=(o)=>{const r={};for(const k in o)if(o[k]>0)r[k]=Math.max(0,Math.round(o[k]*ym*(k==='hide'&&!knife&&!flint?(Math.random()<0.5?0:1):1)));return r;};
  if(stone)st.push(h3st('Ghè một mảnh đá cho sắc cạnh','knap',1.2/tl,'mine'));
  if(!knife&&!flint&&!stone)st.push(h3st('Không có dao: xé bằng tay, dùng răng','h3butcher',1.2,'pick',{v:'heave',cyc:1.4}));
  const fowl=a.kind==='junglefowl';
  if(fowl){st.push(h3st('Vặt lông','h3butcher',1.2*sz/tl,'pick',{v:'pluckF',cyc:1.2,give:gv({feather:take('feather',1)})}));}
  else{st.push(h3st('Lật ngửa, banh chân','h3butcher',0.8*sz/tl,'step',{v:'heave',cyc:1.6}));if(dr.hide)st.push(h3st('Rạch da, lột da','h3butcher',2.2*sz/tl,'chop',{v:'skin',cyc:1.0,give:gv({hide:take('hide',1)})}));}
  st.push(h3st('Mổ bụng, bỏ lòng','h3butcher',1.5*sz/tl,'step',{v:'gut',cyc:1.1}));
  st.push(h3st('Xẻ thịt, lóc xương','h3butcher',2.2*sz/tl,'chop',{v:'cut',cyc:0.9,give:gv({meat:take('meat',1),bone:take('bone',1)})}));
  if(dr.sinew)st.push(h3st('Rút gân dọc sống lưng','h3butcher',0.9*sz/tl,'pick',{v:'skin',cyc:0.9,give:gv({sinew:take('sinew',1)})}));
  const rest={};for(const k in dr)if(dr[k]>0)rest[k]=dr[k];if(Object.keys(rest).length)st[st.length-1].give=Object.assign(st[st.length-1].give||{},gv(rest));
  P.ry=Math.atan2(a.x-P.x,a.z-P.z);if(G.sit)sitToggle(false);G.act=null;G.walkTo=null;
  const W=G.work={r:{out:{},in:{}},steps:st,i:0,t:0,left:1,done:0,x:P.x,z:P.z,sk:'hunt',icon:'meat',h3:1,h3carc:a};W.fn=()=>{h3flush(W);a._carc=null;a.dieT=Math.max(a.dieT||0,22);addXp('hunt',3+Math.round(sz*2));cnt('cnt','butcher');sfx('craft');
    uiToast(`🔪 Xẻ xong ${a.n.toLowerCase()}${knife?'':flint?' bằng đá lửa':' (không có dao nên hao nhiều)'}.`,'gold');H3.joy=1.2;H3.joyG='nod';save();};
  if(!knife)uiToast(flint?'Dùng mảnh đá lửa sắc để xẻ: chậm hơn dao một chút.':stone?'Không có dao: ghè đá lấy cạnh sắc trước.':'Không có dao hay đá: xẻ bằng tay rất hao thịt, da rách.','');
  workUi();sfx('chop');}
// vác xác trên vai
function h3carryOk(a){return (H3WT[a.kind]||10)<=60;}
function h3carryStart(a){G.h3carry={a,w:H3WT[a.kind]||10};a._carc.t=G.t;uiToast(`🏋️ Vác ${a.n.toLowerCase()} lên vai (nặng: đi chậm, không chạy được). Về gần bếp lửa bấm Hành động để đặt xuống và xẻ.`,'');sfx('step');}
function h3carryDrop(butcher){const C=G.h3carry;if(!C)return;G.h3carry=null;const a=C.a;if(!a||!a._carc)return;a.x=P.x+Math.sin(P.ry)*14;a.z=P.z+Math.cos(P.ry)*14;a.y=hAt(a.x,a.z);a.ry=P.ry+Math.PI/2;a._carc.t=G.t;sfx('thud');
  if(butcher)h3butcherStart(a);}
function h3carryTick(dt){const C=G.h3carry;if(!C)return;const a=C.a;if(!a||!a._carc||G.swim||G.ride){if(a&&a._carc&&(G.swim||G.ride))uiToast('Phải thả xác thú xuống mới bơi được.','');h3carryDrop(false);return;}
  a._carc.t=G.t;a.dieT=Math.min(a.dieT||1,2);a.x=P.x;a.z=P.z;a.y=P.y;if(a.o){a.o.visible=!isFP();a.o.position.set(P.x-Math.sin(P.ry)*1.5,P.y+27+Math.min(6,a.r*0.25),P.z-Math.cos(P.ry)*1.5);a.o.rotation.set(0,P.ry+Math.PI/2,Math.PI*0.5);}
  if((P.speed||0)>8&&C.w>15)S.p.stam=Math.max(0,S.p.stam-dt*C.w*0.025);}
function h3finishStart(a){const st=[h3st('Đè giữ con thú','h3butcher',0.7,'step',{v:'heave',cyc:1.4}),h3st('Một nhát dứt khoát','h3butcher',0.6,'hit',{v:'finish',cyc:0.6})];if(h3cut())selectTool('knife');
  P.ry=Math.atan2(a.x-P.x,a.z-P.z);G.act=null;G.walkTo=null;const W=G.work={r:{out:{},in:{}},steps:st,i:0,t:0,left:1,done:0,x:P.x,z:P.z,sk:'hunt',icon:'meat',h3:1,h3fin:a};
  W.fn=()=>{if(a.alive){H3.hit={zone:'head',w:'knife'};animalDamage(a,a.hp+5);H3.hit=null;}uiToast(`Kết liễu ${a.n.toLowerCase()} nhanh gọn. Giờ có thể xẻ thịt.`,'');};workUi();}
function h3bloodNear(x,z,r){let best=null,bd=r;for(let i=H3.blood.length-1;i>=0;i--){const b=H3.blood[i];if(G.t-b.t>600)continue;const d=Math.hypot(b.x-x,b.z-z);if(d<bd){bd=d;best=b;}}return best;}
function h3bloodRead(b){const a=b.a,fresh=G.t-b.t<180;let last=null;for(const o of H3.blood)if(o.a===a&&(!last||o.t>last.t))last=o;
  let msg=`🩸 Vết máu ${b.n?b.n.toLowerCase():'thú'} ${fresh?'còn tươi':'đã sẫm lại'}`;if(last&&last!==b&&Math.hypot(last.x-b.x,last.z-b.z)>10)msg+=`, nhỏ giọt về phía ${h3dir(last.x-b.x,last.z-b.z)}`;
  msg+=!a?'.':!a.alive?(a._carc?' — con thú đã gục ở cuối vết máu.':'.'):a._h3down?' — nó đã ngã quỵ gần đây!':a._h3bl>1.2?'. Máu nhiều: nó yếu dần, sắp gục.':'. Máu ít: nó còn chạy được xa.';uiToast(msg,'');addXp('hunt',0.2);}
/* ===================== 8. THỊT ÔI THEO NGÀY (để lâu không nấu/hun khói/phơi khô) ===================== */
ITEMS.meatRot.n='Đồ ăn ôi thiu';
const H3SP={meat:2,fish:1.2,meatCooked:4,fishCooked:3,snail:1,snailCooked:2.5,egg:6};
function h3count(id){let n=invCount(id);for(const k in S.store){const a=S.store[k];if(Array.isArray(a))for(const s of a)if(s&&s.id===id)n+=s.n;}return n;}
function h3rot(id,n){let left=n,where=0;const take=(arr)=>{if(left<=0)return;const before=left;left=slotsTake(arr,id,left);const k=before-left;if(k>0){slotsAdd(arr,'meatRot',k);}};
  take(S.inv);for(const k in S.store){const a=S.store[k];if(Array.isArray(a))take(a);}return n-left;}
function h3spoilTick(){const H=h3S(),now=TNOW(),si=seasonIdx(),mul=si===3?2.5:si===1?0.7:1;
  for(const id in H3SP){const B=H.sp[id]||(H.sp[id]=[]),tot=h3count(id);let sum=0;for(const b of B)sum+=b[1];
    if(tot>sum)B.push([+now.toFixed(3),tot-sum]);else if(tot<sum){let r=sum-tot;while(r>0&&B.length){const k=Math.min(r,B[0][1]);B[0][1]-=k;r-=k;if(!B[0][1])B.shift();}}
    const life=H3SP[id]*mul;let rot=0;while(B.length&&now-B[0][0]>life){rot+=B[0][1];B.shift();}
    if(rot){const n=h3rot(id,rot);if(n){uiToast(`🤢 ${n} ${ITEMS[id].n} để lâu đã ôi thiu. Nướng, hun khói hoặc phơi khô thì giữ được lâu hơn.`,'bad');uiHotbar();}}
    if(B.length&&now-B[0][0]>life*0.75){const wk=id+':'+B[0][0];if(!H.warn[wk]){H.warn[wk]=1;uiToast(`⏳ ${ITEMS[id].n} sắp ôi: nấu chín, hun khói hoặc ăn ngay.`,'');}}
    if(!B.length)delete H.sp[id];}
  for(const k in H.warn){const t=+k.split(':')[1];if(!(now-t<20))delete H.warn[k];}}
/* ===================== 9. NỐI VÀO GAME ===================== */
function h3flush(W){if(!W||!W.steps)return;const end=Math.min(W.i,W.steps.length);for(let j=W.h3f||0;j<end;j++){const st=W.steps[j];W.h3f=j+1;
    if(st.g&&W.h3out&&W.h3out[st.g]>0){W.h3out[st.g]--;give({[st.g]:1},[P.x+Math.sin(P.ry)*10,P.y+14,P.z+Math.cos(P.ry)*10]);}
    if(st.g2&&W.h3out&&W.h3out[st.g2]>0){const n=Math.min(2,W.h3out[st.g2]);W.h3out[st.g2]-=n;give({[st.g2]:n},[P.x,P.y+12,P.z]);}
    if(st.give){const g={};for(const k in st.give)if(st.give[k]>0)g[k]=st.give[k];if(Object.keys(g).length)give(g,[P.x+Math.sin(P.ry)*12,P.y+10,P.z+Math.cos(P.ry)*12]);puff(P.x+Math.sin(P.ry)*12,P.y+4,P.z+Math.cos(P.ry)*12,'#8a1a14',3);}
    if(st.sting){addStatus('sting');S.p.hp=Math.max(1,S.p.hp-4);P.hurtT=0.4;uiToast('🐝 Ong bu kín tay, đốt túi bụi!','bad');}
    if(st.id&&W.h3bad&&skLv('herb')>=2)uiToast('🔎 Phiến nấm này lạ: một cây có vòng cổ và chân phình, là nấm độc.','');}}
{const _pa=poseApply;H3._poseApply0=_pa;poseApply=h3poseApply;}
{const _at=animTick;animTick=function(dt){_at(dt);try{h3holdTick(P.rig);h3npcFaces(Math.min(0.05,dt));}catch(e){if(!H3.ferr){H3.ferr=1;console.warn('hunt3 mặt',e);}}};}
{const _mt=moveTick;moveTick=function(dt){const Ar=H3.air;
  if(G.jumpReq){if(G.h3carry){G.jumpReq=0;if(G.t-(H3.cjT||0)>3){H3.cjT=G.t;uiToast('Đang vác nặng, không nhảy được.','');}}
    else if(!H3.jgo&&!P.air&&!G.swim&&!G.climb&&!G.ladder&&S.p.stam>=8&&Ar.prep<=0){G.jumpReq=0;Ar.prep=0.12;H3.jq=1;}}
  if(Ar.prep>0){Ar.prep-=dt;if(Ar.prep<=0){Ar.prep=0;if(H3.jq){H3.jq=0;G.jumpReq=1;H3.jgo=1;}}}
  if(Ar.land>0)Ar.land=Math.max(0,Ar.land-dt);if(Ar.stum>0)Ar.stum=Math.max(0,Ar.stum-dt);
  const wasAir=P.air;_mt(dt);H3.jgo=0;
  if(P.air)Ar.vy=P.vy;else if(wasAir){const v=-(Ar.vy||0);Ar.landA=clamp(v/320,0.15,1);Ar.land=0.25;if(v>270&&!G.swim&&wdAt(P.x,P.z)<4)Ar.stum=0.8;Ar.vy=0;}};}
{const _mv=move;move=function(dx,dz,m,dt,run){let k=1;if(G.h3carry){k*=clamp(1-G.h3carry.w/110,0.45,0.97);run=false;}if(G.h3aim){k*=0.45;run=false;}if(H3.air.stum>0)k*=0.35;return _mv(dx,dz,m*k,dt,run);};}
{const _ac=actTick;actTick=function(dt){try{h3aimTick(dt);h3nodesTick();if(G.t>H3.spT){H3.spT=G.t+3;h3spoilTick();}if(H3.bdirty||G.t>(H3.bT||0)){H3.bT=G.t+8;h3bloodDraw();}}catch(e){if(!H3.terr){H3.terr=1;console.warn('hunt3',e);}}return _ac(dt);};}
{const _wt=workTick;workTick=function(dt){const W=G.work;if(W&&W.h3q&&W.h3q.st!==0){workStop('Chỗ này đã bị hái mất.');return;}if(W&&W.h3carc&&!W.h3carc._carc){workStop('Xác thú không còn nữa.');return;}if(W&&W.h3fin&&!W.h3fin.alive){G.work=null;workUi();return;}
  const d0=W?W.done:0;_wt(dt);if(!W)return;if(W.h3)h3flush(W);else if(W.done>d0&&!W.fn){H3.joy=1.2;H3.joyG='nod';}};}
{const _ws=workStop;workStop=function(msg){const W=G.work;if(W&&W.h3){try{h3flush(W);if(W.h3q&&W.h3q.st===0&&(W.h3f||0)>=Math.ceil(W.steps.length/2))resDeplete(W.h3q);
    if(W.h3node&&(W.h3f||0)>=2){h3S().dep[W.h3node.id]=+(TNOW()+1).toFixed(3);H3.cell='';}
    if(W.h3carc&&W.h3carc._carc&&(W.h3f||0)>0){const rem={};for(let j=W.h3f;j<W.steps.length;j++){const g=W.steps[j].give;if(g)for(const k in g)rem[k]=(rem[k]||0)+g[k];}W.h3carc._carc.drop=rem;}}catch(e){}}return _ws(msg);};}
{const _ft=findTarget;findTarget=function(){if(G.h3carry&&!G.work)return {type:'h3carry',d:0,b:{x:P.x,y:P.y,z:P.z}};const t=_ft();if(G.work||G.sit||G.ride)return t;
  const nn=h3nodeNear(P.x+Math.sin(P.ry)*6,P.z+Math.cos(P.ry)*6,REACH);if(nn&&(!t||t.type==='water'||t.type==='track'||(t.d!=null&&t.d>nn.d+4)))return {type:'forage',n:nn.n,d:nn.d,b:{x:nn.n.x,y:nn.n.y-28,z:nn.n.z}};
  if(!t||t.type==='track'){const b=h3bloodNear(P.x+Math.sin(P.ry)*14,P.z+Math.cos(P.ry)*14,18);if(b)return {type:'blood',k:b,d:10,b:{x:b.x,y:hAt(b.x,b.z)-34,z:b.z}};}return t;};}
{const _ti=targetInfo;targetInfo=function(t){if(t){
    if(t.type==='h3carry'){const a=G.h3carry&&G.h3carry.a;return {name:'Đang vác '+(a?a.n.toLowerCase():'xác thú'),verb:h3nearFire()||h3cut()?'Đặt xuống & xẻ thịt':'Đặt xuống',ok:true,icon:'meat'};}
    if(t.type==='forage')return h3nodeInfo(t.n);
    if(t.type==='blood'){const b=t.k;return {name:'Vết máu '+(b.n?b.n.toLowerCase():'thú')+(G.t-b.t<180?' · còn tươi':' · đã sẫm'),verb:'Xem vết máu',ok:true,icon:'meat'};}
    if(t.type==='carcass'&&t.a._carc){const r=_ti(t)||{name:'Xác '+t.a.n.toLowerCase(),ok:true,icon:'meat'};const carry=h3carryOk(t.a)&&!h3cut()&&!h3nearFire();r.verb=carry?'Vác lên vai':'Xẻ thịt';
      r.warn=carry?'Không có dao: vác về bếp, hoặc làm dao đá lửa':!h3cut()?(invCount('flint')?'Không có dao: dùng mảnh đá lửa (chậm)':'Không có dao: xẻ bằng tay, hao thịt'):null;return r;}
    if(t.type==='animal'&&t.a.alive&&t.a._h3down)return {name:t.a.n+' · ngã quỵ, thở dốc',verb:'Kết liễu',ok:true,icon:'knife'};
    if(t.type==='res'&&t.q.t==='mushroomR'){const r=_ti(t);if(r){const kn=skLv('herb')>=1||S.seen.toadstool;r.name=kn?'Nấm đỏ · có độc!':'Nấm lạ màu đỏ';if(kn)r.warn='Nấm độc: ăn vào sẽ ngộ độc';}return r;}}
  const r=_ti(t);if(r&&t&&t.type==='animal'&&t.a.alive&&(t.a._h3bl||0)>0.3&&!/chảy máu/.test(r.name))r.name+=' · chảy máu';return r;};}
{const _as=actStart;actStart=function(t){if(G.work||(G.act&&G.act.t&&G.act.t.type==='rod'))return _as(t);if(G.h3aim)return;
  if(G.h3carry){h3carryDrop(h3nearFire()||!!h3cut());return;}
  if(t&&t.type==='carcass'&&t.a._carc){const a=t.a;if(h3carryOk(a)&&!h3cut()&&!h3nearFire())h3carryStart(a);else h3butcherStart(a);return;}
  if(t&&t.type==='animal'&&t.a.alive&&t.a._h3down){h3finishStart(t.a);return;}
  if(t&&t.type==='forage'){const ng=needGate(false);if(ng){uiToast(ng,'bad');sfx('no');return;}h3nodeStart(t.n);return;}
  if(t&&t.type==='blood'){h3bloodRead(t.k);return;}
  if(t&&t.type==='res'&&t.q.st===0&&!t.q.lock){const q=t.q,D=RT[q.t];if(D&&!D.tool&&!(P.toolId==='digStick'&&typeof canUproot==='function'&&canUproot(q))){
      const food=D.yield&&Object.keys(D.yield).some(k=>ITEMS[k]&&ITEMS[k].food);const ng=!food&&needGate(false);if(ng){uiToast(ng,'bad');sfx('no');return;}
      if(!invFits(Object.keys(D.yield)[0],1)){uiToast('Túi đầy! Cất bớt đồ.','bad');return;}h3gatherStart(q);return;}}
  return _as(t);};}
{const _wt=worldTap;worldTap=function(x,y){if(!G.on||G.paused||G.build)return _wt(x,y);const p=groundPick(x,y);if(p){const nn=h3nodeNear(p.x,p.z,12);if(nn){const n=nn.n,t={type:'forage',n,d:0,b:{x:n.x,y:n.y-28,z:n.z}};
      if(Math.hypot(n.x-P.x,n.z-P.z)<REACH+8){G.walkTo=null;actStart(t);}else{G.walkTo={x:n.x,z:n.z,t,t0:G.t};G.act=null;}return;}}return _wt(x,y);};}
{const _ps=peekScan;peekScan=function(x,z,rad){let b=_ps(x,z,rad);const nn=h3nodeNear(x,z,rad);if(nn&&(!b||nn.d<b.d))b={lab:H3NODE[nn.n.kind].n,tag:'res',d:nn.d};
  if(!b||b.tag==='gnd'){const bl=h3bloodNear(x,z,Math.max(12,rad));if(bl)b={lab:'Vết máu '+(bl.n?bl.n.toLowerCase():'thú'),tag:'bad',d:0};}return b;};}
{const _th=throwIt;H3._throwIt0=_th;throwIt=function(){if(G.h3aim)return;if(G.h3carry){uiToast('Đang vác xác thú, không ném được.','');return;}if(G.work||G.sit||G.swim||G.ride)return _th();if(!h3aimStart())return _th();};}
addEventListener('pointerup',()=>{if(G.h3aim&&!G.h3aim.key)h3release();});addEventListener('pointercancel',()=>{if(G.h3aim&&!G.h3aim.key)h3release();});
addEventListener('keyup',e=>{if(e.code==='KeyG'&&G.h3aim)h3release();});
projTick=h3projTick;
{const _ad=animalDamage;animalDamage=function(a,dmg){if(!a||a.kind==='raider'||!a.alive)return _ad(a,dmg);const D=ANIMALS[a.kind],drop=D&&D.drop;if(D)D.drop=H3.EMPTY;
  try{_ad(a,dmg);}finally{if(D)D.drop=drop;}if(!a.alive)h3carcass(a);else h3wound(a,dmg);};}
{const _an=animalsTick;animalsTick=function(dt){const W=H3.wl;W.length=0;if(G.animals)for(const a of G.animals){if(a.alive&&a._hpMax&&a.hp>=a._hpMax*0.95&&(a._h3down||a._h3bl)){a._h3down=null;a._h3bl=0;a._h3leg=0;}
    if(a.alive&&(a._h3bl>0||a._h3down||(a._h3stk&&a._h3stk.length))){a._h3px=a.x;a._h3pz=a.z;W.push(a);}else if(!a.alive&&a._h3stk&&a._h3stk.length)W.push(a);}
  _an(dt);try{h3animalsPost(dt);h3carryTick(dt);}catch(e){if(!H3.aerr){H3.aerr=1;console.warn('hunt3 thú',e);}}};}
{const _e=eat;eat=function(id){const I=ITEMS[id],n0=invCount(id);_e(id);if(I&&invCount(id)<n0){H3.eat={t0:G.t,dur:I.t==='drink'||I.t==='med'&&!I.food?1.4:1.7,drink:I.t==='drink'||(I.t==='med'&&!!I.drink)};if(id==='meatRot')uiToast('🤢 Mùi hôi quá… bụng bắt đầu cồn cào.','bad');}};}
{const _dw=drinkWater;drinkWater=function(c){_dw(c);G.drinkT=2.6;};}
{const _tt=trapTick;trapTick=function(gh){const was={};for(const b of S.builds)if(b.k==='trap')was[b.id]=(S.tank[b.id]||0)>=1;_tt(gh);
  for(const b of S.builds){if(b.k!=='trap'||was[b.id]||(S.tank[b.id]||0)<1)continue;const d=Math.hypot(b.x-P.x,b.z-P.z);if(d<2600)uiToast(`🪤 Bẫy thòng lọng ~${Math.round(d/20)} m về phía ${h3dir(b.x-P.x,b.z-P.z)} vừa sập: dính một con ${S.tank[b.id+'k']==='junglefowl'?'gà rừng':'thỏ'}!`,'gold');}};}
{const _tI=trapInfo;trapInfo=function(b){const r=_tI(b);if(b.k==='trap'&&!r.ok){r.name='Bẫy thòng lọng · đang chờ';r.verb='Chưa dính (đứng xa ra cho thú dám lại gần)';}return r;};}
{const _ax=addXp;addXp=function(k,n){const a=SKILL[k]?skLv(k):0;_ax(k,n);if(SKILL[k]&&skLv(k)>a){H3.joy=1.2;H3.joyG='pump';}};}
