/* ===================== BẢN ĐỒ NHỎ · BỘ LẠC NÚI ĐÁ (THÙ ĐỊCH) · CƯỚP PHÁ · THÚ DỮ TẤN CÔNG NHÀ ===================== */
/* ---------- bản đồ nhỏ góc màn hình ---------- */
function homePos(){const b=S.builds.find(b=>pieceDef(b.k)&&pieceDef(b.k).bed&&b.prog==null)||S.builds.find(b=>b.k==='campfire');return b?{x:b.x,z:b.z}:null;}
function miniTick(){const cv=$('#mini');if(!cv||G.t-(G.miniT||0)<0.25)return;G.miniT=G.t;const pr=Math.min(2,devicePixelRatio||1),W=cv.clientWidth||130;if(cv.width!==W*pr){cv.width=W*pr;cv.height=W*pr;}const c=cv.getContext('2d');c.setTransform(pr,0,0,pr,0,0);
  const R=900,sc=W/(R*2),base=mapBase(),N=base.width,toPx=v=>(v+WSIZE/2)/WSIZE*N;c.save();c.beginPath();c.arc(W/2,W/2,W/2-1,0,7);c.clip();c.fillStyle='#3d6f8a';c.fillRect(0,0,W,W);
  const sx=toPx(P.x-R),sz=toPx(P.z-R),sw=toPx(P.x+R)-sx;c.imageSmoothingEnabled=true;c.drawImage(base,sx,sz,sw,sw,0,0,W,W);
  const P2=(x,z)=>[W/2+(x-P.x)*sc,W/2+(z-P.z)*sc];const dot=(x,z,col,r)=>{const [a,b]=P2(x,z);if(Math.hypot(a-W/2,b-W/2)>W/2-3)return;c.fillStyle=col;c.beginPath();c.arc(a,b,r,0,7);c.fill();};
  const ico=(x,z,t,sz)=>{let [a,b]=P2(x,z);const d=Math.hypot(a-W/2,b-W/2),m=W/2-9;if(d>m){a=W/2+(a-W/2)/d*m;b=W/2+(b-W/2)/d*m;}c.font=(sz||13)+'px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(t,a,b);};
  for(const b of S.builds){const d=pieceDef(b.k);if(!d||d.kind==='edge'||d.kind==='roof')continue;dot(b.x,b.z,'#7a2e12',1.6);}
  (S.pets||[]).forEach(p=>dot(p.x,p.z,'#fff',2));(S.folk||[]).forEach(f=>dot(f.x,f.z,'#ffd24a',2.6));(G.npcs||[]).forEach(n=>n.o.visible&&dot(n.x,n.z,'#8ad0ff',2));
  (G.foes||[]).forEach(f=>f.alive&&dot(f.x,f.z,'#ff3a2a',2.8));if(G.animals){const bl=Math.sin(G.t*8)>0;G.animals.forEach(a=>{if(!a.alive||Math.abs(a.x-P.x)>R||Math.abs(a.z-P.z)>R)return;const ag=(ANIMALS[a.kind]||{}).aggro,hot=a.angry||a.state==='chase';
    if(hot){const [x,y]=P2(a.x,a.z);if(Math.hypot(x-W/2,y-W/2)<W/2-3){c.strokeStyle='rgba(255,40,30,.9)';c.lineWidth=1.5;c.beginPath();c.arc(x,y,bl?6:4.5,0,7);c.stroke();}dot(a.x,a.z,'#ff2a1a',3.2);}
    else if(ag==='territory'||ag==='stalk'||(ag==='night'&&isNight()))dot(a.x,a.z,'#ff3a2a',2.6);else if(ag==='defend')dot(a.x,a.z,'#ffa23a',2.2);else dot(a.x,a.z,'rgba(220,255,200,.75)',1.3);});}
  const h=homePos();if(h)ico(h.x,h.z,'🏠',13);if(G.village)ico(G.village.x,G.village.z,'🛖',13);if(G.camp)ico(G.camp.x,G.camp.z,'⚔️',12);if(S.mark)ico(S.mark.x,S.mark.z,'📍',13);
  c.restore();c.strokeStyle='rgba(242,197,90,.8)';c.lineWidth=2;c.beginPath();c.arc(W/2,W/2,W/2-1,0,7);c.stroke();
  const a=camYaw();c.save();c.translate(W/2,W/2);c.rotate(Math.PI-a);c.beginPath();c.moveTo(0,-7);c.lineTo(5,6);c.lineTo(0,3);c.lineTo(-5,6);c.closePath();c.fillStyle='#e8402a';c.fill();c.strokeStyle='#fff';c.lineWidth=1.5;c.stroke();c.restore();
  c.fillStyle='#f4e6cf';c.font='700 10px Bungee,system-ui';c.textAlign='center';c.fillText('B',W/2,10);}
/* ---------- Bộ lạc Núi Đá: trại thù địch, chiến binh canh trại, kho chiến lợi phẩm ---------- */
const FOE={n:'Chiến binh Núi Đá',hp:9,dmg:9,spd:120,r:9};
ANIMALS.raider={n:'Chiến binh Núi Đá',hp:9,spd:120,r:9,flee:0,drop:{arrow:2,hide:1,meat:1},bio:[],n0:0,aggro:'territory',dmg:9};
function campInit(){const C=REG.find(r=>r.id==='camp');if(!C)return;G.camp=C;S.war=S.war||{n:4,loot:{bronze:2,copper:4,arrow:10,hide:5,meat:4},day:S.day,raidAt:S.day+3,lootT:S.day};
  const add=(id,dx,dz,ry)=>{const g=model(['piece',id]);g.position.set(C.x+dx,hAt(C.x+dx,C.z+dz)-0.5,C.z+dz);g.rotation.y=ry||0;g.traverse(m=>{if(m.isMesh)m.castShadow=true;});G.sc.add(g);seasonPatchAll(g);return g;};
  [[0,-80,0],[75,-20,-1.2],[-75,-20,1.2],[40,70,-2.4],[-40,70,2.4]].forEach(([x,z,r])=>{add('tent',x,z,r);SCOL.push({x:C.x+x,z:C.z+z,r:34});});add('campfire',0,0);add('totem',0,-30);
  for(let a=0;a<20;a++){const an=a/20*6.283;if(a===4)continue;const x=Math.cos(an)*150,z=Math.sin(an)*150;add('post',x,z);SCOL.push({x:C.x+x,z:C.z+z,r:4});}
  G.campChest=add('chest',20,10);G.foes=[];for(let i=0;i<S.war.n;i++)foeSpawn(C.x+(Math.random()-0.5)*120,C.z+(Math.random()-0.5)*120,'guard');}
function foeSpawn(x,z,mode){let o=null;try{o=window.SBM&&SBM.villager?SBM.villager(900+Math.floor(Math.random()*90),'hunter'):K3.char2({sex:'m',beard:true,skin:'#8a5a3a',top:'#3a2a1a'});}catch(e){o=K3.char({});}
  o.traverse(m=>{if(m.isMesh)m.castShadow=true;});const sp=model(['tool','spear']);if(K3.char2Equip&&o.userData.rig)K3.char2Equip(o.userData.rig,sp,'spear');G.sc.add(o);seasonPatchAll(o);
  const f={kind:'raider',n:FOE.n,x,z,y:hAt(x,z),r:FOE.r,hp:FOE.hp,alive:true,o,rig:o.userData.rig,mode,ph:Math.random()*6,atkT:0,ry:0,state:'idle'};G.foes.push(f);return f;}
function foesTick(dt){if(!G.foes)return;const C=G.camp;for(const f of G.foes){if(!f.alive){if(f.dieT!=null){f.dieT+=dt;f.o.rotation.z=Math.min(1.5,f.dieT*2.5);if(f.dieT>4){G.sc.remove(f.o);f.gone=1;}}continue;}
    const dP=Math.hypot(P.x-f.x,P.z-f.z);let tx=f.x,tz=f.z,sp=0,pose='idle';
    // mục tiêu: người chơi, người nhà, vật nuôi gần
    let tgt=null,td=f.mode==='guard'?(S.mode==='cozy'?220:320):600;if(dP<td){tgt={x:P.x,z:P.z,pl:1};td=dP;}
    if(f.mode==='raid'){for(const o of (S.folk||[]))if(Math.hypot(o.x-f.x,o.z-f.z)<td){tgt={x:o.x,z:o.z,folk:o};td=Math.hypot(o.x-f.x,o.z-f.z);}for(const o of (S.pets||[]))if(Math.hypot(o.x-f.x,o.z-f.z)<Math.min(td,200)){tgt={x:o.x,z:o.z,pet:o};td=Math.hypot(o.x-f.x,o.z-f.z);}}
    if(f.flee){tx=C.x;tz=C.z;sp=FOE.spd*1.1;if(Math.hypot(C.x-f.x,C.z-f.z)<60){f.mode='guard';f.flee=0;}}
    else if(tgt&&!(G.ride&&tgt.pl)){tx=tgt.x;tz=tgt.z;sp=FOE.spd;f.state='chase';if(td<f.r+16){sp=0;pose='chop';f.atkT-=dt;if(f.atkT<=0){f.atkT=1.3;foeHit(f,tgt);}}}
    else if(f.mode==='raid'){const st=S.builds.find(b=>pieceDef(b.k)&&pieceDef(b.k).store&&(S.store[b.id]||[]).some(Boolean));const h=homePos()||{x:SPAWN[0],z:SPAWN[1]};const goal=st||h;tx=goal.x;tz=goal.z;sp=FOE.spd*0.9;
      if(Math.hypot(goal.x-f.x,goal.z-f.z)<24){if(st){const arr=S.store[st.id];let n=0;for(let i=0;i<arr.length&&n<3;i++)if(arr[i]){const take=Math.ceil(arr[i].n/2);arr[i].n-=take;if(arr[i].n<=0)arr[i]=null;n++;}uiToast('⚔️ Kẻ cướp lấy mất đồ trong '+pieceDef(st.k).n.toLowerCase()+'!','bad');save();}f.flee=1;}}
    else{f.state='idle';f.t=(f.t||0)-dt;if(f.t<=0){f.t=3+Math.random()*5;f.gx=C.x+(Math.random()-0.5)*220;f.gz=C.z+(Math.random()-0.5)*220;}tx=f.gx??f.x;tz=f.gz??f.z;sp=Math.hypot(tx-f.x,tz-f.z)>5?45:0;}
    const dx=tx-f.x,dz=tz-f.z,d=Math.hypot(dx,dz);if(d>3&&sp>0){f.x+=dx/d*Math.min(d,sp*dt);f.z+=dz/d*Math.min(d,sp*dt);f.ry=Math.atan2(dx,dz);pose=pose==='chop'?pose:sp>80?'run':'walk';f.g=(f.g||0)+dt*(sp>80?2:1.4);}
    else if(tgt)f.ry=Math.atan2(tgt.x-f.x,tgt.z-f.z);
    f.y=groundY(f.x,f.z,f.y+10);f.o.visible=dP<1800;f.o.position.set(f.x,f.y,f.z);f.o.rotation.y=lerpAng(f.o.rotation.y,f.ry,Math.min(1,dt*8));
    if(f.o.visible&&K3.char2Pose&&f.rig&&dP<800){try{K3.char2Pose(f.rig,pose,pose==='walk'||pose==='run'?f.g:pose==='chop'?1-f.atkT/1.3:G.t+f.ph,{tool:'spear'});}catch(e){}}}
  G.foes=G.foes.filter(f=>!f.gone);}
function foeHit(f,t){sfx('hit');if(t.pl){const dmg=FOE.dmg*(S.mode==='cozy'?0.45:1);S.p.hp=Math.max(0,S.p.hp-dmg);P.hurtT=0.4;sfx('hurt');uiFloat&&uiFloat('−'+Math.round(dmg),P.x,P.y+40,P.z,'#ff8a7a');if(Math.random()<0.3)addStatus('bleed');uiHud(true);if(S.p.hp<=0)die();}
  else if(t.folk){t.folk._hp=(t.folk._hp??30)-FOE.dmg;if(t.folk._hp<=0){t.folk._hp=30;t.folk.x=homePos()?homePos().x:t.folk.x;uiToast(`${t.folk.n} bị thương, chạy về nhà!`,'bad');}}
  else if(t.pet){S.pets=S.pets.filter(p=>p!==t.pet);if(t.pet._o)G.sc.remove(t.pet._o);uiToast(`${PETN[t.pet.k]} bị kẻ cướp bắt mất!`,'bad');save();}}
// đánh trúng chiến binh (dùng chung cách đánh thú)
function foeDamage(f,dmg){if(!f.alive)return;f.hp-=dmg;sfx('hit');puff(f.x,f.y+20,f.z,'#c0392b',4);if(f.mode==='guard')f.state='chase';
  if(f.hp<=0){f.alive=false;f.dieT=0;give({arrow:1+Math.floor(Math.random()*3),hide:Math.random()<0.5?1:0,meat:Math.random()<0.4?1:0},[f.x,f.y+16,f.z]);addXp('hunt',6);cnt('cnt','foe');S.war.n=Math.max(0,(S.war.n||0)-1);uiToast('⚔️ Hạ được một chiến binh Núi Đá.','gold');save();}}
// kho chiến lợi phẩm của trại
function chestInfo(){const near=G.foes.filter(f=>f.alive&&Math.hypot(f.x-G.camp.x,f.z-G.camp.z)<220).length,has=Object.values(S.war.loot||{}).some(v=>v>0);return {name:'Kho của trại Núi Đá',verb:near?`Còn ${near} người canh`:has?'Cướp kho':'Kho trống',ok:!near&&has,icon:'bronze'};}
function chestRaid(){const near=G.foes.filter(f=>f.alive&&Math.hypot(f.x-G.camp.x,f.z-G.camp.z)<220).length;if(near){uiToast('Còn người canh kho! Hạ hết rồi mới lấy được.','bad');return;}give(S.war.loot,[G.camp.x+20,20,G.camp.z+10]);S.war.loot={};cnt('cnt','raid');addXp('hunt',10);uiToast('💰 Cướp sạch kho của trại Núi Đá!','gold');sfx('level');save();}
/* ---------- theo ngày: trại hồi người & đồ, làng bạn lớn dần, cướp và thú dữ kéo đến ban đêm ---------- */
function warDaily(){if(!S.war||!G.camp)return;const d=S.day;if(d===S.war.day)return;S.war.day=d;
  const cap=Math.min(10,4+Math.floor(d/3));if((S.war.n||0)<cap){S.war.n=(S.war.n||0)+1;foeSpawn(G.camp.x,G.camp.z,'guard');}
  const L=S.war.loot||(S.war.loot={});L.arrow=Math.min(30,(L.arrow||0)+3);L.hide=Math.min(12,(L.hide||0)+1);L.meat=Math.min(10,(L.meat||0)+2);if(d%3===0){L.copper=Math.min(10,(L.copper||0)+2);L.bronze=Math.min(4,(L.bronze||0)+1);}
  villageGrow();save();}
function raidTick(){if(!S.war||!G.camp||!homePos())return;const night=S.hour>=21||S.hour<4;if(!night)return;const d=S.day;if(d<(S.war.raidAt||3)||S.war.raidDay===d)return;S.war.raidDay=d;
  const cozy=S.mode==='cozy';S.war.raidAt=d+(cozy?6+Math.floor(Math.random()*3):3+Math.floor(Math.random()*3));const h=homePos(),wolves=seasonIdx()===3||Math.random()<0.35;
  if(wolves){const n=cozy?2:3+Math.floor(Math.random()*2);for(let i=0;i<n;i++){const a=Math.random()*6.283,x=h.x+Math.cos(a)*520,z=h.z+Math.sin(a)*520;if(wdAt(x,z)>0)continue;const w=animalNew(seasonIdx()===3?'wolf':(Math.random()<0.3?'tiger':'wolf'),x,z,Math.random);w.angry=true;w.home={x:h.x,z:h.z};w.tx=h.x;w.tz=h.z;G.animals.push(w);}
    uiToast('🐺 Bầy thú dữ đang mò tới nhà bạn trong đêm! Đốt lửa, gọi chó, cầm vũ khí!','bad');sfx('bark');}
  else{const n=Math.min(cozy?2:4,Math.max(2,Math.floor((S.war.n||2)/2)));for(let i=0;i<n;i++){const f=foeSpawn(G.camp.x+(Math.random()-0.5)*40,G.camp.z+(Math.random()-0.5)*40,'raid');}
    uiToast('⚔️ Bộ lạc Núi Đá kéo quân đến cướp phá! Bảo vệ kho và người nhà!','bad');sfx('thunder');}}
// làng bạn: mỗi 3 ngày thêm nếp nhà và người
function villageGrow(){if(!G.village||!G.vhutApi)return;const want=Math.min(12,7+Math.floor((S.day-1)/3));while(G.vhuts.length<want){const i=G.vhuts.length,a=i/12*6.283+0.9,r=i<7?150:240,V=G.village,x=V.x+Math.cos(a)*r,z=V.z+Math.sin(a)*r;if(wdAt(x,z)>0)break;
    const s={x,z,y:hAt(x,z)-1,ry:Math.atan2(V.x-x,V.z-z)};G.vhuts.push(s);G.vhutApi.set(i,s.x,s.y,s.z,Math.round(s.ry/(Math.PI/2))*Math.PI/2,1);G.vhutApi.flush();SCOL.push({x,z,r:30});
    const d={n:['Chị Mây','Anh Gió','Mế Rơm','Cu Bờm','Ả Sen'][i%5],role:i%2?'gatherer':'hunter',seed:200+i,sex:i%2?'f':'m'};if(!S.recruited||!S.recruited[d.n]){const o=villagerModel(d);G.sc.add(o);G.npcs.push({def:d,o,rig:o.userData.rig,x:s.x+20,z:s.z+20,ry:0,home:s,tx:s.x,tz:s.z,t:2,pose:'idle',ph:Math.random()*6});}}}
