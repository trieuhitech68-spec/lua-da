/* ===================== CẢNH QUAN: DÃY NÚI XA MỜ SƯƠNG + CẦU GỖ LỚN =====================
   · Trước: nhìn ra xa chỉ thấy sương mù phẳng lì tới chân trời. Giờ có hai lớp dãy núi xa (lớp gần sẫm hơn, lớp xa nhạt hơn) viền quanh chân trời,
     đổi màu theo trời (sáng, chiều, đêm, mưa). Chỉ là hai dải hình mỏng đi theo máy quay (khoảng 640 tam giác), không va chạm, không tốn sức máy.
   · Thêm nhà trọn bộ "Cầu gỗ qua sông" (Xây → Nhà có công năng → Làng nghề): cầu ván 2 ô rộng, 5 nhịp, có lan can: người, ngựa, voi qua sông khô ráo. */
const CQ={g:null,t:-9};
function cqRidge(R,h0,h1,seed){const T=THREE,N=160,pos=[],idx=[];let r=seed*9301+49297;const rnd=()=>{r=(r*16807)%2147483647;return r/2147483647;};const ph=[rnd()*6.283,rnd()*6.283,rnd()*6.283,rnd()*6.283,rnd()*6.283];
  for(let i=0;i<=N;i++){const a=(i%N)/N*6.283;let h=0.5+0.26*Math.sin(a*3+ph[0])+0.17*Math.sin(a*7+ph[1])+0.11*Math.sin(a*13+ph[2])+0.07*Math.sin(a*27+ph[3])+0.04*Math.sin(a*53+ph[4]);h=Math.max(0.06,Math.min(1,h));const y=(h0+(h1-h0)*h)*R,x=Math.sin(a)*R,z=Math.cos(a)*R;pos.push(x,-0.05*R,z,x,y,z);}
  for(let i=0;i<N;i++){const k=i*2;idx.push(k,k+1,k+2,k+1,k+3,k+2);}const ge=new T.BufferGeometry();ge.setAttribute('position',new T.Float32BufferAttribute(pos,3));ge.setIndex(idx);
  const m=new T.Mesh(ge,new T.MeshBasicMaterial({color:0x8899aa,fog:false,side:T.DoubleSide,depthWrite:false}));m.frustumCulled=false;m.renderOrder=-5;m.castShadow=false;m.receiveShadow=false;return m;}
function cqInit(){try{if(!G.sc||CQ.g&&CQ.g.parent===G.sc)return;const g=new THREE.Group();g.add(cqRidge(1,0.035,0.2,5));g.add(cqRidge(0.94,0.02,0.115,11));g.matrixAutoUpdate=true;G.sc.add(g);CQ.g=g;CQ.dark=new THREE.Color('#3f4d5c');CQ.t=-9;}catch(e){console.warn('núi xa',e);}}
function cqTick(){const g=CQ.g;if(!g||!G.cam)return;const c=G.cam.position,R=Math.max(1500,(G.fogF||4000)*1.02);g.position.set(c.x,Math.min(0,(typeof P!=='undefined'?P.y:0)-40),c.z);if(g.scale.x!==R)g.scale.setScalar(R);
  if(G.t-CQ.t>0.5||G.t<CQ.t){CQ.t=G.t;const f=G.sc.fog&&G.sc.fog.color;if(f){g.children[0].material.color.copy(f).lerp(CQ.dark,0.28);g.children[1].material.color.copy(f).lerp(CQ.dark,0.48);}g.visible=!(typeof M3K==='object'&&M3K.exp);}}
{const _si=sceneInit;sceneInit=function(){const r=_si.apply(this,arguments);try{CQ.g=null;cqInit();}catch(e){}return r;};}
{const _ct=cullTick;cullTick=function(){try{cqTick();}catch(e){}return _ct.apply(this,arguments);};}
// cầu gỗ lớn
try{const q={id:'qh_cau',g:'Làng nghề',n:'Cầu gỗ qua sông',ic:'🌉',fx:'Người, ngựa, voi và cả đạo quân qua sông khô ráo, không phải lội',d:'Cầu ván rộng 2 ô, dài 5 nhịp, có lan can hai bên: đặt vắt ngang sông, suối (cắm mốc bằng tay ở chỗ có nước).',key:'bridgePlank',
    fn:A=>{for(let j=0;j<5;j++){A.F(0,j,'bridgePlank');A.F(1,j,'bridgePlank');A.E(0,j,'w','railing');A.E(1,j,'e','railing');}}};
  const bp=bpMake(q.id,q.n,q.ic,0,q.d,q.fn);if(b4BpParts(bp).every(p=>pieceDef(p[0]))&&!QH.some(x=>x.id===q.id)){q.bp=bpMake(q.id,q.n,q.ic,0,q.d,q.fn);QH.push(q);}}catch(e){}
