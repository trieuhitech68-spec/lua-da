/* ===================== NHÃN "ĐÂY LÀ GÌ": trỏ chuột / chạm vào cảnh để biết tên vật ===================== */
const FIERCE=/tiger|wolf|bear|boar|croc|leopard|snake/;
function peekScan(x,z,rad){let best=null,bs=rad;const t=(d,lab,tag)=>{if(d<bs){bs=d;best={lab,tag,d};}};
  (G.foes||[]).forEach(f=>{if(f.alive)t(Math.hypot(f.x-x,f.z-z)-6,FOE.n,'bad');});
  (G.npcs||[]).forEach(n=>{if(n.o&&n.o.visible)t(Math.hypot(n.x-x,n.z-z)-4,n.n||'Dân làng','npc');});
  (S.folk||[]).forEach(f=>t(Math.hypot(f.x-x,f.z-z)-4,f.n+' (người nhà)','npc'));
  (S.pets||[]).forEach(p=>t(Math.hypot(p.x-x,p.z-z)-3,(p.n||'Vật nuôi'),'pet'));
  (S.boats||[]).forEach(b=>t(Math.hypot(b.x-x,b.z-z)-14,ITEMS[b.k].n,''));
  (G.animals||[]).forEach(a=>{if(a.alive&&a.o&&a.o.visible)t(Math.hypot(a.x-x,a.z-z)-a.r,a.n,FIERCE.test(a.kind||'')?'bad':'');});
  (G.drops||[]).forEach(o=>t(Math.hypot(o.x-x,o.z-z)-2,'Đồ rơi','')); 
  for(const i of near(x,z,Math.max(60,rad+30))){const q=RES[i];if(q.st!==0)continue;const D=RT[q.t];t(Math.hypot(q.x-x,q.z-z)-(D.r||4)*q.s*0.6,D.n,'res');}
  for(const b of S.builds){const d=pieceDef(b.k);if(!d||d.kind==='edge'||d.kind==='roof')continue;t(Math.hypot(b.x-x,b.z-z)-8,d.n+(b.prog!=null?' (đang dựng)':''),'bld');}
  return best;}
function peekLabel(x,z,rad){const b=peekScan(x,z,rad);if(b)return b;if(wdAt(x,z)>0.3)return {lab:wdAt(x,z)>20?'Nước sâu':'Nước',tag:''};const r=regionAt(x,z);const bi={beach:'Bãi cát',meadow:'Đồng cỏ',edge:'Bìa rừng',forest:'Rừng',bank:'Bờ sông',rock:'Đá núi',peak:'Đỉnh núi'}[BCODE[bgAt(x,z)]]||'Đất';return {lab:bi+(r&&S.disc&&S.disc[r.id]?' · '+r.n:''),tag:'gnd'};}
function peekShow(sx,sy,ms){if(isFP()||!G.on)return;const p=groundPick(sx,sy);const el=$('#peek')||(()=>{const d=document.createElement('div');d.id='peek';d.className='peek';$('#game').appendChild(d);return d;})();
  if(!p){el.hidden=true;return;}const rad=clamp(G.zoom*0.045,10,34),L=peekLabel(p.x,p.z,rad);const dist=Math.hypot(p.x-P.x,p.z-P.z)/20;
  el.textContent=L.lab+(dist>3?` · ${Math.round(dist)} m`:'');el.className='peek '+(L.tag||'');el.style.left=sx+'px';el.style.top=sy+'px';el.hidden=false;clearTimeout(G.peekH);G.peekH=setTimeout(()=>{el.hidden=true;},ms||1800);}
function peekMouse(e){if(isFP()||!G.on||G.paused)return;const now=performance.now();if(now-(G.peekT||0)<120)return;G.peekT=now;if(e.target&&e.target.tagName!=='CANVAS'){const el=$('#peek');if(el)el.hidden=true;return;}peekShow(e.clientX,e.clientY,2500);}
/* bấm Hành động mà không có gì trong tầm tay: chỉ vật gần nhất */
function nearestHint(){let best=null,bd=420;const dir=(x,z)=>{const a=Math.atan2(x-P.x,z-P.z),yaw=viewYaw();let d=a-yaw;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return Math.abs(d)<0.6?'phía trước':Math.abs(d)>2.5?'phía sau':d>0?'bên trái':'bên phải';};
  for(const i of near(P.x,P.z,bd)){const q=RES[i];if(q.st!==0)continue;const d=Math.hypot(q.x-P.x,q.z-P.z);if(d<bd){bd=d;best={n:RT[q.t].n,x:q.x,z:q.z};}}
  (G.animals||[]).forEach(a=>{if(!a.alive)return;const d=Math.hypot(a.x-P.x,a.z-P.z);if(d<bd){bd=d;best={n:a.n,x:a.x,z:a.z};}});
  if(!best)return 'Không có gì ở gần. Đi tới gần cây, đá, bụi quả, nước…';return `Chưa tới tầm tay. Gần nhất: ${best.n}, ~${Math.max(1,Math.round(bd/20))} m ${dir(best.x,best.z)}.`;}
/* ===================== VÒNG SÁNG NHẠT dưới chân thứ ở gần (màu theo loại) ===================== */
const HL_N=18,HL_COL={food:'#8fe07a',mat:'#f2e2a8',tree:'#d9b26a',prey:'#ffb050',bad:'#ff4a36',npc:'#8ac8ff',bld:'#e8d0a0',drop:'#fff3c0'};
function hlInit(){const T=THREE;const g=new T.RingGeometry(0.78,1,48,1);g.rotateX(-Math.PI/2);
  // mép trong mờ dần: dùng màu đỉnh làm alpha giả qua opacity theo bán kính
  const m=new T.MeshBasicMaterial({transparent:true,opacity:0.7,blending:T.AdditiveBlending,depthWrite:false,fog:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,toneMapped:false});
  const im=new T.InstancedMesh(g,m,HL_N);im.instanceMatrix.setUsage(T.DynamicDrawUsage);im.count=0;im.frustumCulled=false;im.renderOrder=2;
  im.instanceColor=new T.InstancedBufferAttribute(new Float32Array(HL_N*3),3);G.sc.add(im);G.hl=im;G.hlList=[];G.hlM=new T.Matrix4();G.hlC=new T.Color();G.hlQ=new T.Quaternion();G.hlV=new T.Vector3();G.hlS=new T.Vector3();}
function hlKind(t){if(t.type==='foe')return 'bad';if(t.type==='animal'){const D=ANIMALS[t.a.kind]||{};return t.a.angry||D.aggro==='territory'||D.aggro==='stalk'||(D.aggro==='night'&&isNight())?'bad':'prey';}
  if(t.type==='npc'||t.type==='folk'||t.type==='pet')return 'npc';if(t.type==='drop')return 'drop';if(t.type==='build')return 'bld';
  if(t.type==='res'){const D=RT[t.q.t];if(D.yield&&Object.keys(D.yield).some(k=>ITEMS[k]&&ITEMS[k].food))return 'food';return D.tool==='axe'?'tree':'mat';}return 'mat';}
function hlScan(){const L=[],R=isFP()?70:95,add=(t,x,z,r)=>{const d=Math.hypot(x-P.x,z-P.z);if(d<R+r)L.push({t,x,z,r,d});};
  for(const i of near(P.x,P.z,R+20)){const q=RES[i];if(q.st!==0||q.lock)continue;const D=RT[q.t];add({type:'res',q},q.x,q.z,Math.min(16,(D.r||4)*q.s*0.8+3));}
  (G.animals||[]).forEach(a=>{if(a.alive&&a.o&&a.o.visible)add({type:'animal',a},a.x,a.z,a.r+3);});(G.foes||[]).forEach(f=>{if(f.alive)add({type:'foe',a:f},f.x,f.z,f.r+3);});
  (G.drops||[]).forEach(o=>add({type:'drop',o},o.x,o.z,5));(G.npcs||[]).forEach(n=>{if(n.o&&n.o.visible)add({type:'npc',n},n.x,n.z,7);});
  L.sort((a,b)=>a.d-b.d);G.hlList=L.slice(0,HL_N);}
function hlTick(){if(!G.sc||!G.on)return;if(!G.hl)hlInit();const im=G.hl;if(G.hlOff||G.build||G.work||G.ride){im.count=0;return;}
  if(G.t-(G.hlT||0)>0.2){G.hlT=G.t;hlScan();}const tg=G.target;let n=0;const pulse=0.5+0.5*Math.sin(G.t*4);
  for(const h of G.hlList){const t=h.t;let x=h.x,z=h.z;if(t.type==='animal'||t.type==='foe'){if(!t.a.alive)continue;x=t.a.x;z=t.a.z;}else if(t.type==='res'&&t.q.st!==0)continue;
    const cur=tg&&((tg.type==='res'&&t.q&&tg.q===t.q)||((tg.type==='animal'||tg.type==='foe')&&t.a&&tg.a===t.a)||(tg.type==='npc'&&t.n&&tg.n===t.n)||(tg.type==='drop'&&t.o&&tg.o===t.o));
    const far=clamp(1-(Math.hypot(x-P.x,z-P.z)-20)/90,0.25,1),k=hlKind(t);G.hlC.set(HL_COL[k]).multiplyScalar(cur?0.75+0.35*pulse:0.5*far);
    const s=h.r*(cur?1.05+0.06*pulse:1);G.hlV.set(x,groundY(x,z,P.y)+1.2,z);G.hlS.set(s,1,s);G.hlM.compose(G.hlV,G.hlQ,G.hlS);im.setMatrixAt(n,G.hlM);im.setColorAt(n,G.hlC);n++;if(n>=HL_N)break;}
  im.count=n;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;}

/* hướng nhìn thật của camera trên mặt phẳng (dx,dz) -> góc atan2(dx,dz) */
function camYaw(){if(!G.cam)return viewYaw();const v=G.camDirV||(G.camDirV=new THREE.Vector3());G.cam.getWorldDirection(v);if(Math.hypot(v.x,v.z)<1e-3)return viewYaw();return Math.atan2(v.x,v.z);}
/* la bàn: chỉ vẽ lại khi hướng nhìn đổi hoặc 0,25 s một lần (trước đây ghi 10 kiểu CSS và đọc lại bề rộng mỗi khung hình → tính lại bố cục liên tục trên điện thoại) */
{const _ct=compassTick;compassTick=function(){const y=viewYaw();if(G.cmpY!=null&&Math.abs(y-G.cmpY)<0.004&&G.t-(G.cmpT||0)<0.25)return;G.cmpY=y;G.cmpT=G.t;_ct();};}
