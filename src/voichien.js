/* ===================== VOI RỪNG · VOI NHÀ · TƯỢNG BINH =====================
   · VOI RỪNG sống theo đàn 3 con ở trảng cỏ, bìa rừng xa chỗ khởi đầu: rất khoẻ (40 máu), hiền nếu không bị đánh, bị đánh thì húc rất đau.
   · THUẦN VOI: lom khom lại gần, cho ăn chuối / bầu / mía… nhiều lần (mỗi lần ~12%, lâu hơn thuần ngựa) → thành VOI CỦA BẠN (nằm chung danh sách với ngựa).
   · CƯỠI VOI: lại gần bấm Hành động như cưỡi ngựa. Ngồi cao, đi chậm hơn ngựa nhưng lội được nước sâu hơn.
   · TƯỢNG BINH: trong Dân làng → Đạo quân, bấm + Kỵ binh khi có voi rảnh thì lính nhận voi: đòn mạnh gấp 2,5, đứng hai cánh đội hình. */
const VOI={seat:52,sc:1};
function voiModel(){const T=THREE,g=new T.Group(),M=c=>new T.MeshLambertMaterial({color:c}),sk=M('#7d766c'),dk=M('#5f5951'),iv=M('#e9e2cf'),ey=M('#17120e');
  const sp=new T.SphereGeometry(1,14,10),add=(geo,mt,x,y,z,sx,sy,sz,par,rx,rz)=>{const m=new T.Mesh(geo,mt);m.position.set(x,y,z);m.scale.set(sx,sy,sz);if(rx)m.rotation.x=rx;if(rz)m.rotation.z=rz;(par||g).add(m);return m;};
  const body=new T.Group();g.add(body);add(sp,sk,0,44,0,19,18,31,body);add(sp,sk,0,49,-12,17,15,20,body);add(sp,dk,0,36,2,16,10,26,body);
  const head=new T.Group();head.position.set(0,50,27);g.add(head);add(sp,sk,0,2,6,12.5,14,12,head);add(sp,sk,0,10,4,10,7,9,head);
  for(const s of [1,-1]){add(sp,dk,s*14,3,0,2.2,13,10.5,head,0,s*-0.18);add(sp,ey,s*8.6,4,13.6,0.9,0.9,0.9,head);const tk=new T.Mesh(new T.ConeGeometry(1.5,17,7),iv);tk.position.set(s*5.6,-9,16);tk.rotation.set(1.95,0,s*0.12);head.add(tk);}
  let py=-4,pz=15.5;for(let i=0;i<6;i++){const r=5-i*0.62,h=7;const c=new T.Mesh(new T.CylinderGeometry(r*0.86,r,h,8),sk);c.position.set(0,py-h/2,pz);c.rotation.x=-0.1+i*0.03;head.add(c);py-=h*0.92;pz+=0.45-i*0.25;}
  const leg=(x,z)=>{const L=new T.Group();L.position.set(x,31,z);g.add(L);add(new T.CylinderGeometry(6.2,6.8,31,9),sk,0,-15.5,0,1,1,1,L);add(new T.CylinderGeometry(7,7.2,3,9),dk,0,-29.6,0.6,1,1,1,L);return L;};
  const tail=new T.Group();tail.position.set(0,50,-30);g.add(tail);add(new T.CylinderGeometry(0.9,1.4,22,5),dk,0,-11,-1,1,1,1,tail,0.12);add(sp,ey,0,-23,-2.4,1.6,2.6,1.6,tail);
  g.userData.rig={body,head,tail,legFL:leg(-10.5,17),legFR:leg(10.5,17),legBL:leg(-10.5,-18),legBR:leg(10.5,-18)};g.userData.h=66;g.userData.len=76;g.userData.r=30;g.userData.kind='elephant';return g;}
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
{const _ms=mtShow;mtShow=function(m){if(!m||m.k!=='elephant')return _ms.apply(this,arguments);if(!G.sc||MT.o.has(m.id))return;const o=voiModel();o.traverse(x=>{if(x.isMesh)x.castShadow=true;});if(m.x==null){m.x=P.x+50;m.z=P.z+30;}o.position.set(m.x,hAt(m.x,m.z),m.z);o.rotation.y=m.ry||0;G.sc.add(o);try{seasonPatchAll(o);}catch(e){}MT.o.set(m.id,o);};}
{const _ti=targetInfo;targetInfo=function(t){const r=_ti.apply(this,arguments);try{if(t&&t.type==='mount'&&t.m&&t.m.k==='elephant'&&r)r.verb=t.off?'Xuống voi':'Cưỡi voi';}catch(e){}return r;};}
// cưỡi voi: ngồi cao hơn, đi chậm hơn ngựa, lội nước sâu hơn
{const _at=animTick;animTick=function(dt){const r=_at.apply(this,arguments);try{if(G.mnt&&G.mnt.k==='elephant'&&P.model){const up=VOI.seat-(MT.sy||20);P.model.position.y+=up;MT.sy=VOI.seat;}}catch(e){}return r;};}
{const _mv=move;move=function(dx,dz,m,dt,run){if(G.mnt&&G.mnt.k==='elephant')return _mv.call(this,dx,dz,m,dt*0.62,run);return _mv.apply(this,arguments);};}
// tượng binh: lính nhận voi
if(typeof QD==='object'){const _tk=qdTick;qdTick=function(L,dt){const r=_tk.apply(this,arguments);try{for(const f of L){const hs=qdHorse(f);if(!hs||hs.k!=='elephant'||!f._o)continue;const gy=groundY(f.x,f.z,f._o.position.y);f._o.position.y=gy+VOI.seat;}}catch(e){}return r;};
  const _dd=danDmg;danDmg=function(f){const v=_dd.apply(this,arguments);try{if(f&&f.job==='soldier'){const hs=qdHorse(f);if(hs&&hs.k==='elephant')return v*1.7;/* cộng với hệ số kỵ binh 1,5 thành ~2,5 lần */}}catch(e){}return v;};}
if(typeof HD_L!=='undefined')HD_L.push({id:'voichien',ic:'🐘',t:'Voi rừng và tượng binh',w:()=>{try{return (G.animals||[]).some(a=>a.alive&&a.kind==='elephant'&&a.o&&a.o.visible&&Math.hypot(a.x-P.x,a.z-P.z)<700);}catch(e){return false;}},
  p:['<b>Voi rừng</b> hiền nếu không bị đánh, nhưng húc rất đau: đừng đánh khi chưa đủ lính.','Muốn <b>thuần voi</b>: bấm nút lom khom, mang chuối / bầu / củ, lại gần bấm <b>Hành động</b> cho ăn nhiều lần (lâu hơn thuần ngựa).','Voi đã thuần thì <b>cưỡi</b> được như ngựa, hoặc mở <b>Dân làng → Đạo quân → + Kỵ binh</b> để cấp cho lính làm <b>tượng binh</b>: đòn mạnh gấp 2,5 lần.']});
