/* ===================== BỘ LẠC LÁNG GIỀNG · DÂN LÀNG · TRAO ĐỔI · NGƯỜI THEO VỀ Ở ===================== */
const NPCDEF=[{n:'Tù trưởng Lạc',role:'chief',seed:11,sex:'m'},{n:'Ông Mường',role:'elder',seed:23,sex:'m'},{n:'Anh Sáng',role:'hunter',seed:37,sex:'m'},{n:'Chị Nõn',role:'potter',seed:41,sex:'f'},
  {n:'Mế Lúa',role:'gatherer',seed:53,sex:'f'},{n:'Anh Đá',role:'hunter',seed:67,sex:'m'},{n:'Ả Bông',role:'gatherer',seed:71,sex:'f'},{n:'Cu Tí',role:'child',seed:83,sex:'m'}];
const ROLEN={chief:'Tù trưởng',elder:'Già làng',hunter:'Thợ săn',potter:'Thợ gốm',gatherer:'Người hái lượm',child:'Trẻ con'};
const TRADES={hunter:[[{meat:3},{arrow:6}],[{hide:2},{bow:1}],[{fish:4},{feather:6}],[{berry:6},{meat:2}]],
  potter:[[{clay:6},{pot:1}],[{wood:4},{crucible:1}],[{berry:6},{woodBowl:1}],[{fish:3},{brick:4}]],
  gatherer:[[{fish:2},{sap_banana:1}],[{meat:2},{seedGrain:4}],[{stone:5},{mint:3}],[{hide:1},{seedGourd:3}]],
  elder:[[{honey:1},{medicine:1}],[{flower:3},{salve:1}],[{meat:2},{tea:1}],[{fish:2},{bandage:2}]],
  chief:[[{hide:6},{copper:3}],[{plank:6},{tin:2}],[{meat:6},{rope:4}],[{woodStatue:1},{bronze:1}]],
  child:[[{berry:3},{egg:2}],[{flower:2},{feather:3}]]};
const TALK={chief:['Lửa của làng ta cháy từ thời ông bà. Ai mang thịt, da đến, ta đổi đồng đỏ cho.','Người lạ, ngươi dựng nhà ở bên kia sông à? Đất ấy lành đấy.','Ai đúc được trống đồng thì cả bộ lạc sẽ nhớ tên.'],
  elder:['Ngải cứu trị sốt, gừng trị lạnh, bạc hà giải độc, rau má cầm máu. Nhớ lấy.','Đừng đi vào Rừng Già một mình lúc tối: hổ rình đấy.','Muốn cây mau lớn, trồng gần nước, mùa xuân mưa nhiều.'],
  hunter:['Cung tên bắn xa hơn ném giáo. Lom khom lại gần thì thú khó thấy.','Bò tót hiền, nhưng chọc nó là nó húc chết người.','Sói đi bầy ban đêm, nhớ đốt lửa quanh nhà.'],
  potter:['Đất sét ở bờ sông là tốt nhất. Nặn xong phải nung trong lò.','Nồi gốm đun nước cho sạch, uống không đau bụng.'],
  gatherer:['Nhổ cây con bằng gậy đào, đem về trồng gần nhà cho tiện.','Mùa thu nhiều nấm, nhưng nấm đỏ chấm trắng thì độc đấy!'],
  child:['Anh có biết bắt gà rừng không? Cho nó ăn thóc ba lần là nó theo!','Em thích nghe tiếng sáo tre lắm!']};
const JOBN={gather:'Hái lượm',wood:'Đốn gỗ',stone:'Đào đá',farm:'Làm ruộng',cook:'Nấu ăn',guard:'Canh gác',idle:'Nghỉ ngơi'};
function villagerModel(def){let o=null;try{if(window.SBM&&SBM.villager)o=SBM.villager(def.seed,def.role);}catch(e){}if(!o&&K3.char2){try{o=K3.char2({sex:def.sex,hairStyle:def.seed%3,beard:def.sex==='m'&&def.seed%2===1,skin:['#b07a52','#c98a5e','#9a6a44'][def.seed%3],top:['#7a5a3a','#6e7a4a','#8a4a2a'][def.seed%3],top2:'#4a3a2a',hair:'#1a120c'});if(def.role==='child')o.scale.setScalar(0.65);}catch(e){}}
  if(!o)o=K3.char({});o.traverse(m=>{if(m.isMesh){m.castShadow=true;}});return o;}
/* ---------- làng: nhà sàn quanh bếp lửa chung ---------- */
function villageInit(){const V=REG.find(r=>r.id==='village');if(!V)return;G.village=V;const T=THREE,hut=new T.Group();const add=(id,x,y,z,ry)=>{const g=model(['piece',id]);g.position.set(x,y,z);g.rotation.y=ry||0;hut.add(g);};
  add('stilt',0,0,0);add('bambooWall',0,60,-20,0);add('bambooWall',-20,60,0,Math.PI/2);add('bambooWall',20,60,0,-Math.PI/2);add('bambooWallDoor',0,60,20,0);add('roofCap',0,60,0);add('ladder',0,0,22,Math.PI);
  const parts=protoParts(hut);const spots=[];for(let i=0;i<7;i++){const a=i/7*6.283+0.3,x=V.x+Math.cos(a)*150,z=V.z+Math.sin(a)*150;spots.push({x,z,y:hAt(x,z)-1,ry:Math.atan2(V.x-x,V.z-z)});}
  const api=instGroup(parts,12,{sphere:{x:V.x,y:hAt(V.x,V.z),z:V.z,r:420}});for(let i=0;i<12;i++)api.hide(i);spots.forEach((s,i)=>api.set(i,s.x,s.y,s.z,Math.round(s.ry/(Math.PI/2))*Math.PI/2,1));api.flush();G.sc.add(api.G);G.vhutApi=api;seasonPatchAll(api.G);G.vhuts=spots;
  spots.forEach(s=>SCOL.push({x:s.x,z:s.z,r:30}));
  // bếp lửa chung, giàn phơi, cột vật tổ
  const props=[['campfire',0,0],['dryRack',60,-30],['dryRack',-55,35],['totem',0,-70],['pottery',40,50],['rack',-40,-50]];props.forEach(([id,dx,dz])=>{const g=model(['piece',id]);g.position.set(V.x+dx,hAt(V.x+dx,V.z+dz)-0.5,V.z+dz);G.sc.add(g);seasonPatchAll(g);if(id!=='campfire')SCOL.push({x:V.x+dx,z:V.z+dz,r:12});});
  G.vfire={x:V.x,z:V.z};G.npcs=[];S.recruited=S.recruited||{};NPCDEF.forEach((d,i)=>{if(S.recruited[d.n])return;const o=villagerModel(d);G.sc.add(o);seasonPatchAll(o);const h=spots[i%spots.length];G.npcs.push({def:d,o,rig:o.userData.rig,x:h.x+20,z:h.z+20,ry:0,home:h,tx:h.x,tz:h.z,t:Math.random()*4,pose:'idle',ph:Math.random()*6});});}
function npcTick(dt){if(!G.npcs||!G.village)return;const V=G.village,night=isNight(),far=Math.hypot(P.x-V.x,P.z-V.z)>1700;
  for(const n of G.npcs){n.o.visible=!far;if(far)continue;n.t-=dt;
    if(n.t<=0){n.t=4+Math.random()*7;const r=Math.random();if(night){if(n.def.role==='hunter'&&n.def.seed===37){n.tx=V.x+18;n.tz=V.z+10;n.work='sit';}else{n.tx=n.home.x;n.tz=n.home.z;n.work='hide';}}
      else if(r<0.35){n.tx=V.x+(Math.random()-0.5)*60;n.tz=V.z+(Math.random()-0.5)*60;n.work=Math.random()<0.5?'sit':'cook';}
      else if(r<0.7){const a=Math.random()*6.283,d=60+Math.random()*130;n.tx=V.x+Math.cos(a)*d;n.tz=V.z+Math.sin(a)*d;n.work={hunter:'whittle',potter:'grind',gatherer:'gather',elder:'sit',chief:'idle',child:'idle'}[n.def.role]||'idle';}
      else{n.tx=n.home.x+(Math.random()-0.5)*40;n.tz=n.home.z+(Math.random()-0.5)*40;n.work='idle';}
      if(Math.hypot(P.x-n.x,P.z-n.z)<70&&!night){n.tx=n.x;n.tz=n.z;n.work='idle';n.look=1;}else n.look=0;}
    const dx=n.tx-n.x,dz=n.tz-n.z,d=Math.hypot(dx,dz),sp=n.def.role==='child'?70:55;let pose=n.work||'idle';
    if(d>4){n.x+=dx/d*Math.min(d,sp*dt);n.z+=dz/d*Math.min(d,sp*dt);n.ry=lerpAng(n.ry,Math.atan2(dx,dz),Math.min(1,dt*6));pose='walk';n.gait=(n.gait||0)+dt*1.4;}
    else if(n.look){n.ry=lerpAng(n.ry,Math.atan2(P.x-n.x,P.z-n.z),Math.min(1,dt*4));}
    const hide=pose==='hide'&&d<6;n.o.visible=!hide;n.o.position.set(n.x,hAt(n.x,n.z),n.z);n.o.rotation.y=n.ry;
    if(K3.char2Pose&&n.rig&&Math.hypot(P.x-n.x,P.z-n.z)<700){try{K3.char2Pose(n.rig,pose==='hide'?'idle':pose,pose==='walk'?n.gait:G.t+n.ph,{});}catch(e){}}}}
/* ---------- trò chuyện, trao đổi, tặng quà, học nghề, mời về ---------- */
function npcInfo(n){return {name:n.def.n+' · '+ROLEN[n.def.role],verb:'Trò chuyện',ok:true,icon:'fiber'};}
function npcTalk(n){G.npcCur=n;uiOpen('npc',{});sfx('idea');}
function freeBed(){const used=new Set((S.folk||[]).map(f=>f.bed));return S.builds.find(b=>{const d=pieceDef(b.k);return d&&d.bed&&b.prog==null&&!used.has(b.id);});}
function npcHtml(){const n=G.npcCur;if(!n)return '';const rep=S.rep||0,L=TALK[n.def.role]||TALK.elder,line=L[Math.floor((G.t/7+n.def.seed))%L.length];const tr=(TRADES[n.def.role]||[]).map((t,i)=>{const ok=canPay(t[0]);
    return `<div class="rc${ok?'':' dim'}"><div class="rc-b"><div class="chips">${chips(t[0])}</div><span class="small muted">đổi lấy</span><div class="chips">${chips(t[1])}</div></div><div class="rc-a"><button class="btn sm" data-a="trade" data-i="${i}" ${ok?'':'disabled'}>Đổi</button></div></div>`;}).join('');
  const bed=freeBed(),canJoin=n.def.role!=='chief'&&n.def.role!=='child';
  return `<p class="npc-say">“${esc(line)}”</p><div class="set"><b>Tình thân với bộ lạc</b><span>${rep}/100</span></div><i class="npc-rep" style="--v:${rep}%"></i>
    <h3>Trao đổi</h3>${tr||'<p class="muted">Người này không có gì để đổi.</p>'}
    <h3>Khác</h3><div class="npc-acts"><button class="btn sm ghost" data-a="gift">🎁 Tặng món đang cầm (+tình thân)</button><button class="btn sm ghost" data-a="learn" ${rep>=10?'':'disabled'}>📚 Nhờ dạy nghề (−10 tình thân)</button>
    ${canJoin?`<button class="btn sm" data-a="recruit" ${rep>=40&&bed?'':'disabled'}>🏠 Mời về ở cùng</button>`:''}</div>
    ${canJoin?`<p class="small muted">Mời về ở cần tình thân 40 trở lên và một giường trống (giường, võng, ổ nằm). Người ở cùng cần ăn mỗi ngày từ giỏ, rương, chum của bạn.${!bed?' <b>Bạn chưa có giường trống.</b>':''}</p>`:''}`;}
const SKILL_OF={hunter:'hunt',potter:'craft',gatherer:'gather',elder:'herb',chief:'build',child:'run'};
function npcAction(k,i){const n=G.npcCur;if(!n)return;if(k==='trade'){const t=TRADES[n.def.role][+i];if(!canPay(t[0]))return;pay(t[0]);give(t[1],[n.x,30,n.z]);S.rep=Math.min(100,(S.rep||0)+3);sfx('craft');cnt('cnt','trade');unlockCheck();save();}
  else if(k==='gift'){const s=S.inv[S.sel];if(!s){uiToast('Chọn một món trên thanh công cụ để tặng.','');return;}const v={honey:6,meat:3,meatCooked:4,fish:2,fishCooked:3,hide:4,bronze:10,pot:5,woodStatue:8,stoneBracelet:8,flower:2}[s.id]||1;invTake(s.id,1);S.rep=Math.min(100,(S.rep||0)+v);uiToast(`${n.def.n} vui vẻ nhận ${ITEMS[s.id].n.toLowerCase()} (+${v}).`,'gold');sfx('pick');uiHotbar();save();}
  else if(k==='learn'){if((S.rep||0)<10)return;S.rep-=10;const sk=SKILL_OF[n.def.role]||'craft';addXp(sk,40);uiToast(`📚 ${n.def.n} chỉ bạn bí quyết ${SKILL[sk].toLowerCase()}.`,'gold');save();}
  else if(k==='recruit'){const bed=freeBed();if(!bed||(S.rep||0)<40)return;S.recruited=S.recruited||{};S.recruited[n.def.n]=1;S.folk=S.folk||[];const f={n:n.def.n,role:n.def.role,seed:n.def.seed,sex:n.def.sex,bed:bed.id,job:'gather',x:n.x,z:n.z,fed:TNOW()};S.folk.push(f);
    G.sc.remove(n.o);G.npcs=G.npcs.filter(o=>o!==n);folkSpawn(f);S.rep-=20;uiClose();uiToast(`🏠 ${n.def.n} theo bạn về ở. Mở trò chuyện để giao việc.`,'gold');sfx('level');cnt('cnt','folk');save();return;}
  uiOpenRefresh();}
/* ---------- người ở cùng: làm việc, cất đồ vào kho, ngủ đêm, ăn mỗi ngày ---------- */
const JOBRES={wood:/^(pine|oak|birch|savannaTree|dead|young|pineY|birchY|deadLog)$/,stone:/^(boulder|rock|pebble|scree|flintRock)$/,gather:/^(berry|flax|reeds|reedBed|mushroom|stick|pebble|tallgrass|wildgrain|banana|fern|mugwort|centella|mint)$/};
function folkSpawn(f){const o=villagerModel({seed:f.seed,role:f.role,sex:f.sex});G.sc.add(o);seasonPatchAll(o);f._o=o;f._rig=o.userData.rig;f._st='idle';f._t=1;f._bag={};}
function folkInit(){(S.folk||[]).forEach(folkSpawn);}
function folkHome(f){return BYID.get(f.bed)||S.builds.find(b=>b.k==='campfire')||{x:SPAWN[0],z:SPAWN[1],y:hAt(SPAWN[0],SPAWN[1])};}
function storeNear(x,z){let best=null,bd=900;for(const b of S.builds){const d=pieceDef(b.k);if(!d||!d.store||b.prog!=null||b.k==='trough')continue;const st=S.store[b.id];if(!st||!st.some(s=>!s))continue;const dd=Math.hypot(b.x-x,b.z-z);if(dd<bd){bd=dd;best=b;}}return best;}
function folkTick(dt){if(!S.folk)return;const night=S.hour>=20||S.hour<6;for(const f of S.folk){if(!f._o)folkSpawn(f);const home=folkHome(f);f._t-=dt;let pose='idle',tx=f._tx??f.x,tz=f._tz??f.z;
    if(night){tx=home.x;tz=home.z;pose=Math.hypot(home.x-f.x,home.z-f.z)<14?'sleep':'walk';f._st='sleep';}
    else if(f.job==='guard'){const foe=G.animals.find(a=>a.alive&&a.o.visible&&!(a.tame>0)&&a.state==='chase'&&Math.hypot(a.x-home.x,a.z-home.z)<260);if(foe){tx=foe.x;tz=foe.z;if(Math.hypot(foe.x-f.x,foe.z-f.z)<foe.r+14&&f._t<=0){f._t=1;animalDamage(foe,2);pose='chop';}}else{tx=home.x+Math.sin(G.t*0.1)*60;tz=home.z+Math.cos(G.t*0.1)*60;}}
    else if(f.job==='idle'){if(f._t<=0){f._t=6;f._tx=home.x+(Math.random()-0.5)*80;f._tz=home.z+(Math.random()-0.5)*80;}pose='sit';}
    else if(f.job==='cook'){/* dò bếp, kho 2 giây một lần thay vì mỗi khung hình */if(!f._ck||G.t-f._ck.t>2||G.t<f._ck.t)f._ck={t:G.t,fire:S.builds.find(b=>b.k==='campfire'&&b.prog==null&&fireLit(b)&&Math.hypot(b.x-home.x,b.z-home.z)<500)||null,st:storeNear(home.x,home.z)};const fire=f._ck.fire&&BYID.has(f._ck.fire.id)?f._ck.fire:null,st=f._ck.st&&BYID.has(f._ck.st.id)?f._ck.st:null;if(fire){tx=fire.x+16;tz=fire.z;pose='cook';if(f._t<=0){f._t=12;const src=S.builds.find(b=>pieceDef(b.k)&&pieceDef(b.k).store&&(S.store[b.id]||[]).some(s=>s&&(s.id==='meat'||s.id==='fish')));if(src&&st){const arr=S.store[src.id],i=arr.findIndex(s=>s&&(s.id==='meat'||s.id==='fish'));const id=arr[i].id;arr[i].n--;if(arr[i].n<=0)arr[i]=null;slotsAdd(S.store[st.id],id==='meat'?'meatCooked':'fishCooked',1);addXp('cook',0.5);}}}}
    else{// đi lấy tài nguyên theo nghề rồi mang về kho
      /* CHỐNG GIẬT: trước, người không tìm ra việc (quanh nhà hết cây, hết đá) bị quét lại toàn bộ tài nguyên trong bán kính 650 ở MỖI khung hình (điều kiện "!f._q" luôn đúng lúc đang nghỉ).
         Giờ chỉ tìm khi rảnh hoặc khi mục tiêu đang đi tới đã mất, và mỗi người tìm tối đa 2,5 giây một lần. */
      if(f._st!=='idle'&&f._st!=='go'&&f._st!=='work'&&f._st!=='back'&&f._st!=='rest')f._st='idle';if((f._st==='work'||f._st==='go')&&!f._q)f._st='idle';
      if((f._st==='idle'||f._st==='go'&&f._q.st!==0)&&!(G.t-(f._sT||-9)<2.5&&G.t>=(f._sT||0))){f._sT=G.t;let best=null,bd=650;const rx=JOBRES[f.job];if(rx)for(const i of near(home.x,home.z,650)){const q=RES[i];if(q.st!==0||q.lock||!rx.test(q.t))continue;const d=Math.hypot(q.x-home.x,q.z-home.z);if(d<bd&&wdAt(q.x,q.z)<1){bd=d;best=q;}}f._q=best;f._st=best?'go':'rest';f._t=best?0:8;}else if(f._st==='go'&&f._q&&f._q.st!==0){f._q=null;f._st='rest';f._t=2.5;}
      if(f._st==='go'&&f._q){tx=f._q.x+6;tz=f._q.z+6;if(Math.hypot(tx-f.x,tz-f.z)<8){f._st='work';f._t=6+Math.random()*4;}}
      else if(f._st==='work'&&f._q){tx=f.x;tz=f.z;pose=f.job==='wood'?'chop':f.job==='stone'?'mine':'gather';f._ry=Math.atan2(f._q.x-f.x,f._q.z-f.z);if(f._t<=0){const q=f._q,D=RT[q.t];if(q.st===0){for(const k in D.yield){const [a,b]=D.yield[k];const n=a+Math.floor(Math.random()*(b-a+1));if(n>0)f._bag[k]=(f._bag[k]||0)+n;}resDeplete(q);}f._st='back';}}
      else if(f._st==='back'){const st=storeNear(f.x,f.z);if(!st){f._st='rest';f._t=10;}else{tx=st.x+8;tz=st.z+8;if(Math.hypot(tx-f.x,tz-f.z)<10){for(const k in f._bag){slotsAdd(S.store[st.id],k,f._bag[k]);}f._bag={};f._st='idle';save();}}}
      else if(f._st==='rest'){pose='sit';if(f._t<=0)f._st='idle';}}
    f._gx=tx;f._gz=tz;/* đích đang đi tới: để tính đường vòng khi bị rào chặn (raochan.js) */const dx=tx-f.x,dz=tz-f.z,d=Math.hypot(dx,dz);if(d>4&&pose!=='sleep'){f.x+=dx/d*Math.min(d,55*dt);f.z+=dz/d*Math.min(d,55*dt);f._ry=Math.atan2(dx,dz);pose='walk';f._g=(f._g||0)+dt*1.4;}
    f._o.position.set(f.x,groundY(f.x,f.z,(f._o.position.y||0)+10),f.z);f._o.rotation.y=lerpAng(f._o.rotation.y,f._ry||0,Math.min(1,dt*6));
    if(K3.char2Pose&&f._rig&&Math.hypot(P.x-f.x,P.z-f.z)<800){try{K3.char2Pose(f._rig,pose,pose==='walk'?f._g:G.t+f.seed,{});}catch(e){}}}}
// mỗi giờ: ăn sáng từ kho; nhịn 2 ngày thì bỏ đi
function folkHourly(gh){if(!S.folk||!S.folk.length)return;const day=TNOW();for(const f of S.folk.slice()){if(day-(f.fed||0)<0.9)continue;
    const src=S.builds.find(b=>pieceDef(b.k)&&pieceDef(b.k).store&&b.k!=='trough'&&(S.store[b.id]||[]).some(s=>s&&ITEMS[s.id]&&ITEMS[s.id].t==='food'&&!ITEMS[s.id].poison));
    if(src){const arr=S.store[src.id],i=arr.findIndex(s=>s&&ITEMS[s.id]&&ITEMS[s.id].t==='food'&&!ITEMS[s.id].poison);arr[i].n--;if(arr[i].n<=0)arr[i]=null;f.fed=day;}
    else if(day-(f.fed||0)>2){S.folk=S.folk.filter(o=>o!==f);if(f._o)G.sc.remove(f._o);S.recruited[f.n]=0;uiToast(`${f.n} bỏ về làng vì không có gì ăn.`,'bad');save();}}}
function folkInfo(f){const hungry=TNOW()-(f.fed||0)>1;return {name:f.n+' · '+JOBN[f.job],verb:'Trò chuyện',ok:true,icon:'fiber',warn:hungry?'Đói: để thức ăn trong giỏ, rương, chum':null};}
function folkHtml(){const f=G.folkCur;if(!f)return '';return `<p class="npc-say">“${esc(['Hôm nay làm gì đây?','Nhà mình ngày càng đông vui.','Trời này mà có bát canh nóng thì tuyệt.'][Math.floor(G.t/9)%3])}”</p><h3>Giao việc</h3><div class="npc-acts">${Object.keys(JOBN).map(j=>`<button class="tb sm${f.job===j?' on':''}" data-a="job" data-j="${j}">${JOBN[j]}</button>`).join('')}</div>
  <p class="small muted">Đốn gỗ, đào đá, hái lượm: làm quanh chỗ ngủ (khoảng 30 m) rồi cất vào giỏ/rương/chum gần nhất. Nấu ăn: nướng thịt, cá trong kho ở bếp lửa đang cháy. Canh gác: đánh thú dữ lại gần nhà.</p>`;}
