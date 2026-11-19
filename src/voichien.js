/* ===================== VOI RỪNG · VOI NHÀ · TƯỢNG BINH =====================
   · VOI RỪNG sống theo đàn 3 con ở trảng cỏ, bìa rừng xa chỗ khởi đầu: rất khoẻ (40 máu), hiền nếu không bị đánh, bị đánh thì húc rất đau.
   · THUẦN VOI: lom khom lại gần, cho ăn chuối / bầu / mía… nhiều lần (mỗi lần ~12%, lâu hơn thuần ngựa) → thành VOI CỦA BẠN (nằm chung danh sách với ngựa).
   · CƯỠI VOI: lại gần bấm Hành động như cưỡi ngựa. Ngồi cao, đi chậm hơn ngựa nhưng lội được nước sâu hơn.
   · TƯỢNG BINH: trong Dân làng → Đạo quân, bấm + Kỵ binh khi có voi rảnh thì lính nhận voi: đòn mạnh gấp 2,5, đứng hai cánh đội hình. */
const VOI={seat:52,sc:1};
/* ống thuôn dần uốn theo đường cong (vòi, ngà, đuôi): pts=[[x,y,z]…], bán kính r0 → r1 */
function voiTube(pts,r0,r1,rad,mat){const T=THREE,cv=new T.CatmullRomCurve3(pts.map(q=>new T.Vector3(q[0],q[1],q[2]))),N=pts.length*5,pos=[],idx=[],fr=cv.computeFrenetFrames(N,false);
  for(let i=0;i<=N;i++){const t=i/N,c=cv.getPointAt(t),r=r0+(r1-r0)*t,n=fr.normals[i],b=fr.binormals[i];for(let k=0;k<rad;k++){const a=k/rad*6.283,cs=Math.cos(a)*r,sn=Math.sin(a)*r;pos.push(c.x+n.x*cs+b.x*sn,c.y+n.y*cs+b.y*sn,c.z+n.z*cs+b.z*sn);}}
  for(let i=0;i<N;i++)for(let k=0;k<rad;k++){const a=i*rad+k,b=i*rad+(k+1)%rad,c=a+rad,d=b+rad;idx.push(a,c,b,b,c,d);}
  const ge=new T.BufferGeometry();ge.setAttribute('position',new T.Float32BufferAttribute(pos,3));ge.setIndex(idx);ge.computeVertexNormals();return new T.Mesh(ge,mat);}
/* VOI vẽ lại: thân có vai, hông, sống lưng cong; đầu vồng hai u; vòi cong thuôn dần, đầu vòi hơi cuộn; ngà cong vểnh; tai quạt có độ dày; chân liền khối có đầu gối, móng. */
function voiModel(decor){const T=THREE,g=new T.Group(),M=(c,o)=>new T.MeshLambertMaterial(Object.assign({color:c},o||{})),sk=M('#8a8279'),dk=M('#6b645b'),lt=M('#9d948a'),iv=M('#f1ead6',{side:T.DoubleSide}),ey=M('#17120e'),pk=M('#b39088'),sk2=M('#8a8279',{side:T.DoubleSide}),dk2=M('#5f5850',{side:T.DoubleSide});
  const sp=new T.SphereGeometry(1,20,14),add=(geo,mt,x,y,z,sx,sy,sz,par,rx,rz,ry)=>{const m=new T.Mesh(geo,mt);m.position.set(x,y,z);m.scale.set(sx,sy,sz);if(rx)m.rotation.x=rx;if(rz)m.rotation.z=rz;if(ry)m.rotation.y=ry;(par||g).add(m);return m;};
  const body=new T.Group();g.add(body);add(sp,sk,0,46,0,19,18,30,body);add(sp,sk,0,47.5,15,17.5,17.5,15,body);add(sp,sk,0,46,-16,18.5,17.5,16,body);add(sp,lt,0,57.5,-1,10.5,7.5,25,body);add(sp,dk,0,36.5,0,15.5,10,23,body);add(sp,sk,0,51,25,13.5,13.5,10,body);
  const head=new T.Group();head.position.set(0,54,31);g.add(head);add(sp,sk,0,1,3,12.5,13,12,head);add(sp,lt,-4.6,11.5,3,5.8,5.2,6.2,head);add(sp,lt,4.6,11.5,3,5.8,5.2,6.2,head);add(sp,sk,0,-5.5,6,9.2,8,9,head);add(sp,sk,0,-3.5,11.5,6.6,7,6.6,head);
  for(const s of [1,-1]){/* tai quạt: dày, xoè chếch ra sau, mép dưới nhọn dần */const ear=add(sp,dk,s*12.6,2.5,-1.5,10.5,13.5,1.5,head,0,s*0.1,s*(Math.PI/2-0.78));add(sp,pk,s*13.1,2,-1.1,7.6,10.2,1.62,head,0,s*0.1,s*(Math.PI/2-0.78));add(sp,dk,s*13.6,-9,-3.4,5.2,6.5,1.4,head,0,s*0.22,s*(Math.PI/2-0.78));
    add(sp,ey,s*8.9,3.6,10.2,1.05,1.05,0.7,head);add(sp,lt,s*8.7,5.4,9.8,2,0.8,1.1,head);
    /* ngà cong vểnh ra trước rồi lên */const tk=voiTube([[s*4.6,-6.5,11],[s*6.6,-12.5,17.5],[s*7.6,-14,25],[s*7.2,-11,32],[s*6.4,-6.5,36]],1.9,0.35,8,iv);head.add(tk);add(sp,lt,s*4.9,-6,11.2,2.6,2.6,2.6,head);}
  /* vòi: rủ xuống, cong nhẹ ra trước, đầu vòi cuộn lên */{const tr=voiTube([[0,1,8],[0,-4,14.5],[0,-11,18.5],[0,-21,20.5],[0,-31,19.5],[0,-39,19],[0,-44,21.5],[0,-45,26],[0,-42,29]],5.9,1.7,12,sk2);head.add(tr);add(sp,pk,0,-41.6,29.4,1.6,1.5,1.5,head);
    /* vài nếp nhăn ngang trên vòi */for(let i=0;i<5;i++){const y=-9-i*6.2,r=5.1-i*0.62;const rg=new T.Mesh(new T.TorusGeometry(r,0.32,5,14),dk);rg.position.set(0,y,18.6+Math.min(2,i*0.5));rg.rotation.x=Math.PI/2-0.12;head.add(rg);}}
  const leg=(x,z,front)=>{const L=new T.Group();L.position.set(x,34,z);g.add(L);add(new T.CylinderGeometry(front?7.4:7.8,front?6:6.3,34,12),sk,0,-17,0,1,1,1,L);add(sp,sk,0,-1,0,front?7.6:8.2,6,front?7.6:8.6,L);add(sp,lt,0,-16.5,front?1.4:-1,6.5,3.6,6.3,L);add(new T.CylinderGeometry(6.2,7.3,4,12),dk,0,-32,0.4,1,1,1,L);for(let k=-1;k<=1;k++)add(sp,iv,k*3.5,-32.6,6.3-Math.abs(k)*0.9,1.6,1.4,1,L);return L;};
  const tail=new T.Group();tail.position.set(0,52,-30);g.add(tail);tail.add(voiTube([[0,0,0],[0,-8,-3.5],[0,-17,-4.2],[0,-25,-3.6]],1.7,0.7,7,dk2));add(sp,ey,0,-27,-3.6,1.5,3.2,1.5,tail);
  g.userData.rig={body,head,tail,legFL:leg(-10.5,18,1),legFR:leg(10.5,18,1),legBL:leg(-11,-18,0),legBR:leg(11,-18,0)};
  if(decor){/* voi nhà: tấm phủ lưng đỏ viền vàng, miếng che trán, bành ngồi */const cl=M('#b3261e',{side:T.DoubleSide}),gd=M('#e6b422',{side:T.DoubleSide});const cover=new T.Mesh(new T.SphereGeometry(1,20,10,0,Math.PI*2,0,1.2),cl);cover.position.set(0,46.4,-1);cover.scale.set(20,19,23);body.add(cover);
    const band=new T.Mesh(new T.SphereGeometry(1,20,4,0,Math.PI*2,1.2,0.16),gd);band.position.copy(cover.position);band.scale.set(20.3,19.3,23.3);body.add(band);const fr=new T.Mesh(new T.SphereGeometry(1,10,6,0,Math.PI*2,0,0.75),gd);fr.position.set(0,3.5,5.5);fr.scale.set(8.6,9.4,11.6);fr.rotation.x=1.2;head.add(fr);
    const seat=new T.Mesh(new T.BoxGeometry(15,2.4,18),M('#5a3a22'));seat.position.set(0,65.2,-2);body.add(seat);for(const s of [1,-1]){const rl=new T.Mesh(new T.BoxGeometry(1.2,3.4,18),M('#7a5230'));rl.position.set(s*7.5,67.6,-2);body.add(rl);}}
  /* voi to, đứng sát máy quay thì từng khối dễ bị bộ vẽ loại nhầm khi tâm khối ra ngoài khung hình: không loại khối nào của voi */
  g.traverse(m=>{if(m.isMesh)m.frustumCulled=false;});
  g.userData.h=70;g.userData.len=80;g.userData.r=30;g.userData.kind='elephant';return g;}
ANIMALS.elephant={n:'Voi rừng',hp:40,spd:140,r:30,flee:0,drop:{meat:14,hide:8,bone:6},bio:['meadow','edge','forest'],n0:0,aggro:'defend',dmg:30,herd:3};
try{if(typeof H3WT==='object')H3WT.elephant=900;}catch(e){}
if(typeof TAME!=='undefined')TAME.elephant={to:'elephant',food:['banana','gourd','sugarcane','yam','taro','berry'].filter(k=>ITEMS[k]),n:'voi'};
{const _am=animalModel;animalModel=function(kind){if(kind==='elephant'&&arguments.length===1)return voiModel();return _am.apply(this,arguments);};}
{const _ai=animalsInit;animalsInit=function(){const r=_ai.apply(this,arguments);try{const R=rng((S.seed|0)+9191),D=ANIMALS.elephant,N=/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)?6:9;let n=0,tries=0;
      while(n<N&&tries<3000){tries++;let x,z;const a=R()*6.283,rr=Math.sqrt(R())*WR*0.85;x=Math.cos(a)*rr;z=Math.sin(a)*rr;if(typeof V5!=='undefined'&&WV>=4&&R()<0.7){x=V5.box[0]+R()*V5.box[2];z=V5.box[1]+R()*V5.box[3];}
        if(!wIn(x,z,0.95)||hAt(x,z)<3||wdAt(x,z)>0||!D.bio.includes(biome(x,z))||Math.hypot(x-SPAWN[0],z-SPAWN[1])<900)continue;for(let k=0;k<3&&n<N;k++,n++){const e=animalNew('elephant',x+(R()-0.5)*130,z+(R()-0.5)*130,R);if(k===2)try{e.o.scale.multiplyScalar(0.62);e.r=19;e.hp=20;}catch(er){}G.animals.push(e);}}
      try{seasonPatchAll();}catch(e){}}catch(e){console.warn('voi rừng',e);}return r;};}
// thuần voi → vào danh sách thú cưỡi
{const _tf=tameFeed;tameFeed=function(a){if(!a||a.kind!=='elephant')return _tf.apply(this,arguments);const f=tameFood('elephant');if(!f||!invTake(f,1))return;const k=1+0.3*(typeof tpLv==='function'?tpLv('thu'):0);a.tame=(a.tame||0)+(G.sneak?0.13:0.09)*k;a.calm=G.t+40;a.angry=false;sfx('eat');try{puff(a.x,a.y+40,a.z,'#ffd27a',5);}catch(e){}addXp('hunt',4);uiHotbar();
    if(a.tame>=0.99){a.alive=false;a.o.visible=false;a.back=TNOW()+5;if(!Array.isArray(S.mounts))S.mounts=[];const m={id:(S.mseq=(S.mseq||0)+1),k:'elephant',n:'Voi của '+(S.name||'bạn'),x:+a.x.toFixed(1),z:+a.z.toFixed(1),ry:a.ry||0,land:mtLand()};S.mounts.push(m);mtShow(m);cnt('cnt','tame');cnt('cnt','elephant');uiToast('🐘 Voi rừng đã quen người: nó là voi của bạn! Lại gần bấm Hành động để cưỡi, hoặc cấp cho lính làm tượng binh (Dân làng → Đạo quân).','gold');sfx('level');save();}
    else uiToast(`Voi rừng đưa vòi nhận thức ăn (${Math.round(a.tame*100)}%). Kiên nhẫn cho ăn thêm.`,'');};}
// hình voi cho thú cưỡi loại "elephant"
{const _ms=mtShow;mtShow=function(m){if(!m||m.k!=='elephant')return _ms.apply(this,arguments);if(!G.sc||MT.o.has(m.id))return;const o=voiModel(true);o.traverse(x=>{if(x.isMesh)x.castShadow=true;});if(m.x==null){m.x=P.x+50;m.z=P.z+30;}o.position.set(m.x,hAt(m.x,m.z),m.z);o.rotation.y=m.ry||0;G.sc.add(o);try{seasonPatchAll(o);}catch(e){}MT.o.set(m.id,o);};}
{const _ti=targetInfo;targetInfo=function(t){const r=_ti.apply(this,arguments);try{if(t&&t.type==='mount'&&t.m&&t.m.k==='elephant'&&r)r.verb=t.off?'Xuống voi':'Cưỡi voi';}catch(e){}return r;};}
// cưỡi voi: ngồi cao hơn, đi chậm hơn ngựa, lội nước sâu hơn
{const _at=animTick;animTick=function(dt){const r=_at.apply(this,arguments);try{if(G.mnt&&G.mnt.k==='elephant'&&P.model){const up=VOI.seat-(MT.sy||20);P.model.position.y+=up;MT.sy=VOI.seat;}}catch(e){}return r;};}
{const _mv=move;move=function(dx,dz,m,dt,run){if(G.mnt&&G.mnt.k==='elephant')return _mv.call(this,dx,dz,m,dt*0.62,run);return _mv.apply(this,arguments);};}
// tượng binh: lính nhận voi
if(typeof QD==='object'){const _tk=qdTick;qdTick=function(L,dt){const r=_tk.apply(this,arguments);try{for(const f of L){const hs=qdHorse(f);if(!hs||hs.k!=='elephant'||!f._o)continue;const gy=groundY(f.x,f.z,f._o.position.y);f._o.position.y=gy+VOI.seat;}}catch(e){}return r;};
  const _dd=danDmg;danDmg=function(f){const v=_dd.apply(this,arguments);try{if(f&&f.job==='soldier'){const hs=qdHorse(f);if(hs&&hs.k==='elephant')return v*1.7;/* cộng với hệ số kỵ binh 1,5 thành ~2,5 lần */}}catch(e){}return v;};}
if(typeof HD_L!=='undefined')HD_L.push({id:'voichien',ic:'🐘',t:'Voi rừng và tượng binh',w:()=>{try{return (G.animals||[]).some(a=>a.alive&&a.kind==='elephant'&&a.o&&a.o.visible&&Math.hypot(a.x-P.x,a.z-P.z)<700);}catch(e){return false;}},
  p:['<b>Voi rừng</b> hiền nếu không bị đánh, nhưng húc rất đau: đừng đánh khi chưa đủ lính.','Muốn <b>thuần voi</b>: bấm nút lom khom, mang chuối / bầu / củ, lại gần bấm <b>Hành động</b> cho ăn nhiều lần (lâu hơn thuần ngựa).','Voi đã thuần thì <b>cưỡi</b> được như ngựa, hoặc mở <b>Dân làng → Đạo quân → + Kỵ binh</b> để cấp cho lính làm <b>tượng binh</b>: đòn mạnh gấp 2,5 lần.']});
