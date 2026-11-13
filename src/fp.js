/* ===================== GÓC NHÌN THỨ NHẤT · HIỆU NĂNG · CỎ QUANH NGƯỜI ===================== */
const EYE=33;
function isFP(){return !!S&&S.view!=='tp';}
/* ---------- chất lượng đồ họa: 0 nhẹ · 1 vừa · 2 đẹp ---------- */
function applyQ(){const q=G.q|0,sun=G.L.sun;resize();sun.castShadow=q>0;const ms=q>=2?2048:1024;
  if(sun.shadow.mapSize.x!==ms){sun.shadow.mapSize.set(ms,ms);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}}
  G.fogF=[3600,4600,5800][q];G.fogN=Math.round(G.fogF*0.5);G.treeD=[1500,2200,3100][q];G.cam.far=G.fogF+300;G.cam.updateProjectionMatrix();grassInit();
  }
function startQ(){let q=null;try{const v=localStorage.getItem('ldtt-qu');if(v!==null){q=+v;G.noAdapt=true;}}catch(e){}
  if(q===null){const mob=Math.min(innerWidth,innerHeight)<600||/Android|iPhone|iPad/i.test(navigator.userAgent);q=mob?0:1;}
  // lần trước thiết bị đã ngắt đồ hoạ (hết bộ nhớ): lần này chạy mức nhẹ và độ phân giải thấp hơn
  try{const L=+localStorage.getItem('ldtt-lost')||0;if(L>0){q=0;G.noAdapt=false;G.prK=L>1?0.6:0.75;G.lostN=L;}}catch(e){}G.q=clamp(q,0,2);}
/* ---------- lưới vùng sinh thái (tra nhanh cho cỏ, bản đồ) ---------- */
const BCODE=['water','beach','meadow','edge','forest','bank','rock','peak'];let BG=null;
function biomeGridBuild(){BG=new Uint8Array(HN*HN);for(let j=0;j<HN;j++)for(let i=0;i<HN;i++){const x=-WSIZE/2+i*HSTEP,z=-WOZ+j*HSTEP;BG[j*HN+i]=Math.max(0,BCODE.indexOf(biome(x,z)));}}
function bgAt(x,z){if(!BG)return 2;const i=Math.round((x+WSIZE/2)/HSTEP),j=Math.round((z+WOZ)/HSTEP);if(i<0||j<0||i>=HN||j>=HN)return 0;return BG[j*HN+i];}
/* ---------- cỏ dày quanh người chơi: luôn đi theo, xa thì nhỏ dần ---------- */
function grassInit(){const T=THREE;if(G.grass){G.sc.remove(G.grass);G.grass.geometry.dispose();G.grass=null;}
  const q=G.q|0,N=[2400,5200,8600][q],R=[190,250,320][q];G.gR=R;const R2=rng(4242),pts=[];
  for(let i=0;i<N;i++)pts.push({x:R2()*2*R,z:R2()*2*R,s:0.5+R2()*0.6,c:'#7aac48'});G.gOff=pts.map(p=>[p.x,p.z,p.s,R2()*6.283,R2()]);
  const tf=K3.fx&&K3.fx.tufts(pts,{h:6.6,blades:q>0?18:12,w:0.4,sp:[0.4,5.2]})/* lá mảnh, thấp, toả rộng: thành thảm cỏ mềm (trước lá to bản nhọn như lá dứa) */;if(!tf)return;tf.frustumCulled=false;tf.receiveShadow=q>0;G.sc.add(tf);G.grass=tf;G.gLast=null;try{seasonPatchAll(tf);}catch(e){}}
// màu cỏ: tối & đậm hơn cho khớp mặt đất mới (lá cỏ đón nắng thẳng đứng nên dễ cháy sáng thành trắng bạc)
const GCOL={2:['#557a2c','#628532'],3:['#46702a','#517a2e'],4:['#33561f','#3c6024'],5:['#486f2b','#537a30']};
function grassTick(){const g=G.grass;if(!g)return;const px=P.x,pz=P.z;if(G.gLast&&Math.hypot(px-G.gLast[0],pz-G.gLast[1])<9)return;G.gLast=[px,pz];
  const R=G.gR,S2=R*2,M=grassTick.M||(grassTick.M=new THREE.Matrix4()),Q=grassTick.Q||(grassTick.Q=new THREE.Quaternion()),V=grassTick.V||(grassTick.V=new THREE.Vector3()),SC=grassTick.SC||(grassTick.SC=new THREE.Vector3()),UP=new THREE.Vector3(0,1,0),C=grassTick.C||(grassTick.C=new THREE.Color());
  const off=G.gOff;for(let i=0;i<off.length;i++){const o=off[i];const x=o[0]+S2*Math.round((px-o[0])/S2),z=o[1]+S2*Math.round((pz-o[1])/S2),d=Math.hypot(x-px,z-pz);
    const b=bgAt(x,z),tr=typeof trailAt==='function'?trailAt(x,z):0;let s=(b>=2&&b<=5&&d<R)?o[2]*Math.min(1,(R-d)/(R*0.3)):0;if(tr>0.35)s*=0.25;
    if(s>0){const c=cellAt(x,z);if(c&&(c.floor||c.obj))s=0;}const y=hAt(x,z);if(y<1.2)s=0;
    // không mọc cỏ trong lòng suối/sông nông (trước đây ngọn cỏ chọc lên khỏi mặt nước)
    if(s>0&&wdAt(x,z)>0)s=0;
    Q.setFromAxisAngle(UP,o[3]);V.set(x,y-0.6,z);SC.set(s,s*(b===2?1.15:1),s);M.compose(V,Q,SC);g.setMatrixAt(i,M);
    if(s>0){/* màu cỏ lấy đúng màu mặt đất ngay dưới chân nó (thảm cỏ liền với đất, không còn các bụi đen nổi lên) */let ok=false;try{if(typeof TCOL!=='undefined'&&TCOL){const ti=clamp(Math.round((x+WSIZE/2)/HSTEP),0,HN-1),tj=clamp(Math.round((z+WOZ)/HSTEP),0,HN-1),n=(tj*HN+ti)*3;const r0=TCOL[n],g0=TCOL[n+1],b0=TCOL[n+2];if(r0+g0+b0>0.05){const k=0.9+o[4]*0.22;C.setRGB(Math.min(1,r0*k*0.42),Math.min(1,g0*k*0.8),Math.min(1,b0*k*0.46));ok=true;}}}catch(e){}
      if(!ok){const cc=GCOL[b]||GCOL[3];C.set(cc[o[4]<0.5?0:1]).multiplyScalar(0.86+o[4]*0.28);}g.setColorAt(i,C);}}
  g.instanceMatrix.needsUpdate=true;if(g.instanceColor)g.instanceColor.needsUpdate=true;}
/* ---------- tắt các khối tài nguyên ở xa (cộng với cắt theo khung nhìn của three.js) ---------- */
function cullTick(){if(G.t-(G.cullT||0)<0.25)return;G.cullT=G.t;const cx=G.cam.position.x,cz=G.cam.position.z,F=G.fogF||2000;
  const hv=G.hnV||1,nearD=[440,650,900][G.q|0]*hv,loD=[600,1000,1400][G.q|0]*hv;/* hv: nấc tự giảm tầm nhìn (hieunang.js) */for(const v of RI.values()){const s=v.sph;if(!s)continue;const d=Math.hypot(s.x-cx,s.z-cz)-s.r,dc=Math.hypot(s.x-cx,s.z-cz);const on=v.api.nOn>0&&d<(v.small?nearD:(G.treeD||F));
    if(v.api.lo){const far=dc-s.r*0.3>loD;v.api.hi.G.visible=on&&!far;v.api.lo.G.visible=on&&far;}else v.api.G.visible=on;}terrainLod();fallsTick();}
function fallsTick(){if(!G.falls)return;const dt=G.t-(G.fallT||G.t);G.fallT=G.t;let near=1e9;const wm=window.SBM&&SBM.mat3&&SBM.mat3.sb3Water;if(wm&&wm.map)wm.map.offset.y+=dt*0.8;for(const f of G.falls)near=Math.min(near,Math.hypot(f.x-P.x,f.z-P.z));
  if(near<260&&AU.on&&AU.ctx&&G.t-(G.fallS||0)>1.3){G.fallS=G.t;noise(1.5,700,0.6,0.25*(1-near/260),0,'lowpass');}}
/* ---------- tay cầm đồ (góc nhìn thứ nhất) ---------- */
function fpInit(){const T=THREE;if(G.fpRig)return;if(!G.cam.parent)G.sc.add(G.cam);const rig=new T.Group();G.cam.add(rig);let arm=null;
  try{if(window.SBM&&SBM.fpArm)arm=SBM.fpArm();}catch(e){arm=null;}
  if(!arm){arm=new T.Group();const sk=new T.MeshStandardMaterial({color:'#b07a58',roughness:0.85,flatShading:true});const fa=new T.Mesh(new T.CylinderGeometry(2.1,2.7,22,7),sk);fa.rotation.x=-Math.PI/2+0.25;fa.position.set(0,1.6,-11);arm.add(fa);
    const fist=new T.Mesh(new T.DodecahedronGeometry(3.1,0),sk);fist.position.set(0,4.4,-22);fist.scale.set(1,1.15,1.25);arm.add(fist);const grip=new T.Object3D();grip.position.set(0,4.4,-22);arm.add(grip);arm.userData.grip=grip;}
  const cp=arm.userData.cam||[9,-11,-14];arm.position.set(cp[0]+1,cp[1]-2.5,cp[2]+1.5);arm.scale.setScalar(0.72);arm.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});rig.add(arm);G.fpRig=rig;G.fpArm=arm;G.fpGrip=arm.userData.grip||arm;G.fpTool=null;try{seasonPatchAll(arm);}catch(e){}}
function fpToolSync(){if(!G.fpRig)return;const id=P.toolId||null;if(G.fpToolId===id)return;G.fpToolId=id;if(G.fpTool){G.fpTool.parent&&G.fpTool.parent.remove(G.fpTool);G.fpTool=null;}
  if(id){const g=model(['tool',id]);g.traverse(o=>{if(o.isMesh){o.castShadow=false;}});G.fpGrip.add(g);G.fpTool=g;try{seasonPatchAll(g);}catch(e){}}}
// dáng tay theo việc đang làm (k: 0..1 trong một nhát)
function fpArmTick(dt){const r=G.fpRig;if(!r)return;const on=isFP()&&!G.panel;fpToolSync();const busy=!!(G.act||G.work||G.throwT>0);r.visible=on&&!G.build&&!G.sit&&!G.swim&&(!!P.toolId||busy);if(!r.visible)return;
  const t=G.t,A=G.act,mv=P.speed>8&&!P.air;let rx=0,ry=0,px=0,py=0,pz=0;
  if(mv){const f=P.speed/112*10.5;px=Math.sin(t*f*0.5)*0.8;py=-Math.abs(Math.cos(t*f*0.5))*0.9;}else{py=Math.sin(t*1.6)*0.25;}
  const Wk=G.work;if(Wk){const a=Wk.steps[Wk.i].a,f=a==='knap'||a==='carve'?15:a==='grind'?7:a==='lash'?9:a==='whittle'?11:a==='cook'?3:6,s=Math.sin(t*f);
    if(a==='knap'||a==='carve'){rx=0.25+Math.max(0,s)*0.7;py+=-2+Math.max(0,s)*4;pz=-3;}else if(a==='grind'){pz=-4+s*5;py-=5;rx=-0.5;}else if(a==='lash'){ry=s*0.35;px+=Math.cos(t*f)*2.5;py+=Math.sin(t*f)*2-3;rx=-0.3;}
    else if(a==='whittle'){rx=-0.2;pz=s*2.5;ry=-0.25;py-=2;}else if(a==='cook'){rx=-0.35+s*0.1;ry=s*0.2;py-=4;}else{rx=-0.55+s*0.15;py-=6;pz=-4;}}
  else if(A){const per=A.per||0.72,k=clamp(1-(A.next||0)/per,0,1),m=P.anim;
    if(m==='chop'||m==='mine'||m==='hammer'){const sw=k<0.55?(k/0.55):1-(k-0.55)/0.45;rx=sw*1.15-0.35;pz=sw*-3;py+=sw*6;}
    else if(m==='gather'||m==='dig'){rx=-0.55-Math.sin(t*9)*0.15;py-=6;pz=-4;}
    else if(m==='work'){rx=-0.35+Math.sin(t*(A.rate||9))*0.22;ry=Math.sin(t*(A.rate||9)*0.5)*0.12;py-=3;}}
  if(G.throwT>0){G.throwT-=dt;const k=1-G.throwT/0.45;rx=k<0.4?k/0.4*1.2:1.2-(k-0.4)/0.6*2.0;}
  if(P.toolId==='torch'&&!A){rx+=0.25;py+=3;}
  r.rotation.x+=(rx-r.rotation.x)*Math.min(1,dt*18);r.rotation.y+=(ry-r.rotation.y)*Math.min(1,dt*12);r.position.x+=(px-r.position.x)*Math.min(1,dt*10);r.position.y+=(py-r.position.y)*Math.min(1,dt*10);r.position.z+=(pz-r.position.z)*Math.min(1,dt*10);}
/* ---------- camera góc nhìn thứ nhất ---------- */
function fpCam(dt){const c=G.cam;if(c.near!==1.5){c.near=1.5;resize();}
  const mv=P.speed>8&&!P.air&&!G.swim,f=P.speed/112*10.5,bob=mv?Math.sin(G.t*f)*(G.running?1.5:0.9):0;G.bobPh=(G.bobPh||0);
  if(mv&&Math.sin(G.t*f)<-0.95&&!G.stepD){G.stepD=1;sfx('step');}else if(Math.sin(G.t*f)>0)G.stepD=0;
  const eh=G.ride?21:G.swim?14:G.sit?19:G.sneak?23:EYE;G.eyeH=(G.eyeH||eh)+(eh-(G.eyeH||eh))*Math.min(1,dt*8);const ey=P.y+G.eyeH+Math.abs(bob)*0.9+(G.swim?Math.sin(G.t*1.7)*1.2:0);
  const fx=Math.sin(P.ry),fz=Math.cos(P.ry);c.position.set(P.x+fx*2.5,ey,P.z+fz*2.5);const cp=Math.cos(G.fpitch||0);
  c.lookAt(c.position.x+fx*cp*100,ey+Math.sin(G.fpitch||0)*100,c.position.z+fz*cp*100);if(mv)c.rotateZ(Math.sin(G.t*f*0.5)*0.006);
  P.blob.visible=false;}
function viewApply(){const fp=isFP();if(P.model)P.model.traverse(o=>o.layers.set(fp?1:0));if(G.L&&G.L.sun)G.L.sun.shadow.camera.layers.enable(1);if(!fp){G.cam.near=4;P.blob.visible=true;}
  if(G.fpRig)G.fpRig.visible=fp;G.cutK=null;resize();const xh=$('#xh');if(xh)xh.hidden=!fp;document.body.classList.toggle('fpv',fp);if(!fp&&document.pointerLockElement)document.exitPointerLock();}
function viewToggle(){S.view=isFP()?'tp':'fp';if(isFP()&&G.fpitch==null)G.fpitch=-0.12;viewApply();uiToast(isFP()?'👁 Góc nhìn thứ nhất (phím V để đổi)':'🎥 Góc nhìn từ trên cao (phím V để đổi)','');save();}
// hướng nhìn ngang hiện tại (cho la bàn, bản đồ)
function viewYaw(){if(isFP())return P.ry;return G.yaw+Math.PI;}
