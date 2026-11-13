/* ===================== TRỒNG CÂY · CHĂN NUÔI · CÔN TRÙNG ===================== */
/* ---------- cây con: nhổ bằng gậy đào, mang về trồng, lớn dần thành cây thật ---------- */
const SAP={pine:{n:'Cây thông con',res:'pine',days:3.5},oak:{n:'Cây sồi con',res:'oak',days:4},birch:{n:'Cây bạch dương con',res:'birch',days:3},savannaTree:{n:'Cây keo con',res:'savannaTree',days:3},
  bamboo:{n:'Mầm tre',res:'bamboo',days:2.5},banana:{n:'Cây chuối con',res:'banana',days:2},palm:{n:'Cây cọ con',res:'palm',days:4},berry:{n:'Bụi quả con',res:'berry',days:1.5},
  mugwort:{n:'Cây ngải cứu giống',res:'mugwort',days:1},ginger:{n:'Củ gừng giống',res:'ginger',days:1.2},turmeric:{n:'Củ nghệ giống',res:'turmeric',days:1.2},centella:{n:'Rau má giống',res:'centella',days:0.8},
  mint:{n:'Bạc hà giống',res:'mint',days:0.8},aloe:{n:'Nha đam giống',res:'aloe',days:1.5},flowerR:{n:'Cây hoa đỏ',res:'flowerR',days:0.8},flowerY:{n:'Cây hoa vàng',res:'flowerY',days:0.8}};
for(const k in SAP){ITEMS['sap_'+k]={n:SAP[k].n,t:'sap',plant:k};}
// nguồn nhổ: loại tài nguyên -> loại cây con
const UPROOT={young:'oak',pineY:'pine',birchY:'birch',berry:'berry',bamboo:'bamboo',banana:'banana',mugwort:'mugwort',ginger:'ginger',turmeric:'turmeric',centella:'centella',mint:'mint',aloe:'aloe',flowerR:'flowerR',flowerY:'flowerY'};
function canUproot(q){return !!UPROOT[q.t]&&q.st===0;}
function uproot(q){const k=UPROOT[q.t];if(!invFits('sap_'+k,1)){uiToast('Túi đầy!','bad');return;}G.work=null;
  G.act={t:{type:'uproot',q},next:0.4,n:0,per:0.8};P.anim='dig';}
function uprootTick(A,dt){const q=A.t.q;if(q.st!==0||Math.hypot(q.x-P.x,q.z-P.z)>50){G.act=null;return;}P.anim='dig';A.next-=dt;if(A.next<=0){A.n++;A.next=A.per;sfx('step');puff(q.x,q.y+3,q.z,'#8a6a44',3);
  if(A.n>=4){G.act=null;const k=UPROOT[q.t];resDeplete(q);invAdd('sap_'+k,1);uiFly&&uiFly('sap_'+k,1,[q.x,q.y+10,q.z]);addXp('farm',3);cnt('cnt','uproot');uiToast(`🌱 Nhổ được ${SAP[k].n} cả rễ. Mở túi, chọn nó để trồng.`,'gold');uiHotbar();save();}}}
// gieo trồng ở chỗ trước mặt
function plantSpot(){const p=isFP()?groundPick(innerWidth/2,innerHeight/2):null;let x,z;if(p&&Math.hypot(p.x-P.x,p.z-P.z)<120){x=p.x;z=p.z;}else{x=P.x+Math.sin(P.ry)*26;z=P.z+Math.cos(P.ry)*26;}return [x,z];}
function plantWhy(k,x,z){if(wdAt(x,z)>0.2)return 'Không trồng dưới nước';if(slopeAt(x,z)>0.8)return 'Đất dốc quá';const c=cellAt(x,z);if(c&&(c.floor||c.obj))return 'Chỗ này đã có công trình';
  const big=/pine|oak|birch|savanna|palm|bamboo/.test(k),rr=big?26:10;for(const i of near(x,z,rr+20)){const q=RES[i];if(q.st===0&&!RT[q.t].pass&&Math.hypot(q.x-x,q.z-z)<rr)return 'Sát cây khác quá';}
  for(const p of S.plants||[])if(Math.hypot(p.x-x,p.z-z)<(big?24:9))return 'Sát cây đã trồng';return '';}
function plantUse(id){const k=ITEMS[id].plant;const [x,z]=plantSpot(),why=plantWhy(k,x,z);if(why){uiToast(why,'bad');sfx('no');return;}uiClose();
  G.work={r:{out:{},in:{}},steps:[{n:'Đào hố',a:'dig',t:1.4,fx:'step'},{n:'Đặt cây, vun rễ',a:'gather',t:1.0,fx:'pick'},{n:'Lấp đất, nén chặt',a:'dig',t:1.0,fx:'step'}],i:0,t:0,left:1,done:0,x:P.x,z:P.z,sk:'farm',plant:{id,k,x,z}};workUi();}
function plantDone(pl){if(!invTake(pl.id,1))return;S.plants=S.plants||[];S.plants.push({k:pl.k,x:+pl.x.toFixed(1),z:+pl.z.toFixed(1),g:0,ry:+(Math.random()*6.28).toFixed(2)});plantShowAll();addXp('farm',4);cnt('cnt','plant');sfx('craft');uiToast(`🌱 Đã trồng ${SAP[pl.k].n}. Mưa nhiều, gần nước thì lớn nhanh.`,'gold');uiHotbar();save();}
// vẽ cây con theo giai đoạn (0: mới trồng, 1: cây non); cây trưởng thành thành tài nguyên thật
const PLG=new Map();
function plantGroup(spec){const key=spec.join('|');let e=PLG.get(key);if(!e){e={spec,api:null,cap:0};PLG.set(key,e);}return e;}
function plantShowAll(){const want=new Map();for(const p of S.plants||[]){if(p.done)continue;const st=p.g<0.35?0:1;let spec=['sapling',p.k,st];const key=spec.join('|');if(!want.has(key))want.set(key,[]);want.get(key).push(p);}
  PLG.forEach((e,key)=>{if(!want.has(key)&&e.api){for(let i=0;i<e.cap;i++)e.api.hide(i);e.api.flush();}});
  want.forEach((L,key)=>{const e=plantGroup(key.split('|').map(v=>/^\d+$/.test(v)?+v:v));if(L.length>e.cap){if(e.api){e.api.dispose();G.sc.remove(e.api.G);}e.cap=Math.max(8,L.length*2);const km=/^(mugwort|ginger|turmeric|centella|mint|aloe)$/.test(e.spec[1])?'herb':/^flower/.test(e.spec[1])?'flower':e.spec[1];const g=window.SBM&&SBM.sapling?(()=>{try{return SBM.sapling(km,e.spec[2],e.spec[1]==='flowerY'?1:0);}catch(er){return null;}})():null;
      e.api=instGroup(protoParts(g||sapStub(e.spec[1],e.spec[2])),e.cap,{});G.sc.add(e.api.G);seasonPatchAll(e.api.G);}
    for(let i=0;i<e.cap;i++){const p=L[i];if(p)e.api.set(i,p.x,hAt(p.x,p.z)-0.5,p.z,p.ry,1);else e.api.hide(i);}e.api.flush();});}
function sapStub(k,st){const K=K3,h=st?30:9;return /pine/.test(k)?K.group(K.cone(st?9:3,h,'dleaf',{},6)):K.group(K.cyl(0.6,0.9,h,'wood'),K.ico(st?8:3,'leaf',{y:h},1,0.3,2));}
// cây lớn dần theo giờ (mùa, mưa, giếng gần)
function plantsTick(gh){if(!S.plants||!S.plants.length)return;const si=seasonIdx(),rain=(G.wxK||0)>0.4&&S.wx&&S.wx.type==='rain',grow=[1.3,1,0.8,0.15][si]*(rain?1.4:1);let ch=0;
  for(const p of S.plants){if(p.done)continue;const s0=p.g<0.35?0:1;const well=S.builds.some(w=>(w.k==='well'||w.k==='wellStone')&&Math.hypot(w.x-p.x,w.z-p.z)<200)?1.6:1;p.g=Math.min(1,p.g+gh/24/(SAP[p.k].days)*grow*well);
    if(p.g>=1){p.done=1;plantMature(p);ch=1;}else if((p.g<0.35?0:1)!==s0)ch=1;}if(ch){plantShowAll();save();}}
// cây trưởng thành: thêm vào danh sách tài nguyên (có nhóm vẽ riêng, mở rộng dần)
function plantMature(p,quiet){const t=SAP[p.k].res,D=RT[t];if(!D)return;const q={i:RES.length,t,x:p.x,z:p.z,ry:p.ry||0,s:(D.sc||1)*0.95,hp:D.hp,st:0,rg:0,planted:1};q.y=hAt(q.x,q.z)-1.2;RES.push(q);
  const k=RGkey(q.x,q.z);if(!RGRID.has(k))RGRID.set(k,[]);RGRID.get(k).push(q.i);
  const slot=spec=>{const base='P|'+spec.join('|');let n=0,key,v;for(;;){key=base+'#'+n;v=RI.get(key);if(!v){const api=instGroup(protoParts(model(spec)),64,{shadow:true});G.sc.add(api.G);seasonPatchAll(api.G);v={api,n:0,sph:null,small:false};RI.set(key,v);}if(v.n<64)break;n++;}return [key,v.n++];};
  [q.gk,q.gi]=slot(D.m);if(D.stump)[q.sk,q.si]=slot(D.stump);if(D.empty)[q.ek,q.ei]=slot(D.empty);const m=S.res[q.i];if(m){q.st=m[0];q.rg=m[1]||0;q.hp=q.st?0:D.hp;}resShow(q);RI.forEach(v=>v.api.flush());
  if(!quiet)uiToast(`🌳 ${SAP[p.k].n.replace(' con','').replace(' giống','')} đã lớn!`,'gold');}
function RGkey(x,z){return typeof rKey==='function'?rKey(x,z):Math.floor(x/RG)+','+Math.floor(z/RG);}
function plantsInit(){for(const p of S.plants||[])if(p.done)plantMature(p,true);plantShowAll();}
function plantInfoAt(x,z){for(const p of S.plants||[])if(!p.done&&Math.hypot(p.x-x,p.z-z)<14)return p;return null;}
/* ---------- thuần hoá: cho ăn 3 lần thì thành vật nuôi ---------- */
const TAME={junglefowl:{to:'chicken',food:['grain','seedGrain','berry','seedFlax'],n:'gà'},boar:{to:'pig',food:['berry','mushroom','gourd','banana','grain'],n:'lợn'},wolf:{to:'dog',food:['meat','fish','bone','meatCooked'],n:'chó'}};
const PETN={chicken:'Gà nhà',chick:'Gà con',pig:'Lợn nhà',piglet:'Lợn con',dog:'Chó nhà',puppy:'Chó con'};
function tameFood(kind){const T=TAME[kind];if(!T)return null;const s=S.inv[S.sel];if(s&&T.food.includes(s.id))return s.id;return T.food.find(f=>invCount(f)>0)||null;}
function tameInfo(a){const T=TAME[a.kind];if(!T)return null;const f=tameFood(a.kind);return {name:a.n+(a.tame?` · thuần ${Math.round(a.tame*100)}%`:''),verb:f?'Cho ăn '+ITEMS[f].n.toLowerCase():'Cần '+T.food.slice(0,2).map(x=>ITEMS[x].n.toLowerCase()).join(' / '),ok:!!f,icon:f||'meat',warn:!G.sneak&&!a.tame?'Lom khom lại gần cho đỡ sợ':null};}
function tameFeed(a){const f=tameFood(a.kind);if(!f||!invTake(f,1))return;a.tame=(a.tame||0)+(G.sneak?0.4:0.3);a.calm=G.t+30;a.angry=false;sfx('eat');puff(a.x,a.y+10,a.z,'#ffd27a',4);addXp('hunt',2);uiHotbar();
  if(a.tame>=0.99){const T=TAME[a.kind];a.alive=false;a.o.visible=false;a.back=TNOW()+2;S.pets=S.pets||[];const p={id:(S.pseq=(S.pseq||0)+1),k:T.to,x:a.x,z:a.z,born:TNOW()-3,fed:TNOW()};S.pets.push(p);petSpawn(p);cnt('cnt','tame');
    uiToast(`🐾 ${a.n} đã quen người, thành ${PETN[T.to].toLowerCase()} của bạn! Làm chuồng và máng ăn cho nó.`,'gold');save();}
  else uiToast(`${a.n} ăn ngon lành (${Math.round(a.tame*100)}%). Cho ăn thêm để nó quen hơi người.`,'');}
/* ---------- vật nuôi: theo chủ / ở quanh chuồng, cần cho ăn, đẻ trứng, sinh con ---------- */
function petModel(k){let o=null;try{if(window.SBM&&SBM.animal&&SBM.list&&(SBM.list.animals||[]).includes(k))o=SBM.animal(k);}catch(e){}if(!o){const base={chicken:'junglefowl',chick:'junglefowl',pig:'boar',piglet:'boar',dog:'wolf',puppy:'wolf'}[k];o=animalModel(base);if(/^(chick|piglet|puppy)$/.test(k))o.scale.setScalar(0.5);}return o;}
function petSpawn(p){const o=petModel(p.k);o.traverse(m=>{if(m.isMesh){m.castShadow=true;}});G.sc.add(o);seasonPatchAll(o);p._o=o;p._rig=o.userData.rig||{};p._tx=p.x;p._tz=p.z;p._t=0;p._ph=Math.random()*6;}
function petsInit(){(S.pets||[]).forEach(petSpawn);}
function petHome(p){const want=p.k==='chicken'||p.k==='chick'?'coop':p.k==='pig'||p.k==='piglet'?'trough':null;if(!want)return null;let best=null,bd=420;for(const b of S.builds){if((b.k===want||(want==='coop'&&/^(chickenCoop2|duckHouse|chickenRoost)$/.test(b.k)))&&b.prog==null){const d=Math.hypot(b.x-p.x,b.z-p.z);if(d<bd){bd=d;best=b;}}}return best;}
function petsTick(dt){if(!S.pets)return;for(const p of S.pets){if(!p._o)petSpawn(p);const o=p._o,R=p._rig;const home=petHome(p),dog=p.k==='dog'||p.k==='puppy';
    let tx=p._tx,tz=p._tz,sp=0;const dP=Math.hypot(P.x-p.x,P.z-p.z);
    if(dog&&!p.stay){if(dP>50){tx=P.x-Math.sin(P.ry)*30;tz=P.z-Math.cos(P.ry)*30;sp=dP>200?170:110;}
      // chó sủa và cắn thú dữ lại gần
      const foe=G.animals.find(a=>a.alive&&a.o.visible&&(a.state==='chase')&&Math.hypot(a.x-p.x,a.z-p.z)<160);if(foe){tx=foe.x;tz=foe.z;sp=170;if(Math.hypot(foe.x-p.x,foe.z-p.z)<foe.r+12&&G.t-(p._bite||0)>1.2){p._bite=G.t;animalDamage(foe,p.k==='dog'?1.5:0.5);sfx('hit');}if(G.t-(p._bark||0)>2){p._bark=G.t;sfx('bark');}}}
    else{const cx=home?home.x:p.hx??p.x,cz=home?home.z:p.hz??p.z;if(p.hx==null){p.hx=p.x;p.hz=p.z;}p._t-=dt;if(p._t<=0||Math.hypot(p._tx-p.x,p._tz-p.z)<6){p._t=2+Math.random()*5;const a=Math.random()*6.283,r=Math.random()*(home?60:90);p._tx=cx+Math.cos(a)*r;p._tz=cz+Math.sin(a)*r;}tx=p._tx;tz=p._tz;sp=p._t>4?0:/^(chick|piglet|puppy)$/.test(p.k)?40:30;}
    const dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz);if(d>3&&sp>0){p.x+=dx/d*Math.min(d,sp*dt);p.z+=dz/d*Math.min(d,sp*dt);p._ry=Math.atan2(dx,dz);}else sp=0;
    const y=hAt(p.x,p.z);o.position.set(p.x,Math.max(y,waterAt(p.x,p.z)),p.z);o.rotation.y=lerpAng(o.rotation.y,p._ry||0,Math.min(1,dt*6));
    const s=Math.sin(G.t*(sp>60?13:8)+p._ph)*Math.min(0.6,sp/70);if(R.legFL){R.legFL.rotation.x=s;R.legBR.rotation.x=s;R.legFR.rotation.x=-s;R.legBL.rotation.x=-s;}if(R.legL&&!R.legFL){R.legL.rotation.x=s;R.legR.rotation.x=-s;}if(R.head)R.head.rotation.x=sp<1?Math.sin(G.t*1.3+p._ph)*0.3+0.2:0;if(R.tail)R.tail.rotation.y=Math.sin(G.t*(dog?9:4)+p._ph)*(dog?0.6:0.3);}}
function petInfo(p){const n=PETN[p.k]||'Vật nuôi',hungry=TNOW()-(p.fed||0)>1;const age=TNOW()-(p.born||0);
  if((p.k==='pig')&&age>4&&hasTool('knife'))return {name:n,verb:'Mổ thịt',ok:true,icon:'meat'};
  if(p.k==='dog'||p.k==='puppy')return {name:n+(p.stay?' (đang ở yên)':''),verb:p.stay?'Gọi đi theo':'Bảo ở yên',ok:true,icon:'bone',warn:hungry?'Đói rồi: cho ăn thịt, cá ở máng':null};
  return {name:n,verb:'Vuốt ve',ok:true,icon:'grain',warn:hungry?'Đói: bỏ thức ăn vào máng gần chuồng':null};}
function petUse(p){if(p.k==='pig'&&TNOW()-(p.born||0)>4&&hasTool('knife')){S.pets=S.pets.filter(o=>o!==p);G.sc.remove(p._o);give({meat:6,hide:2,bone:2},[p.x,8,p.z]);addXp('hunt',4);sfx('thud');save();return;}
  if(p.k==='dog'||p.k==='puppy'){p.stay=!p.stay;p.hx=p.x;p.hz=p.z;uiToast(p.stay?'🐕 Chó ngồi yên trông nhà.':'🐕 Chó vẫy đuôi đi theo bạn.','');sfx('bark');save();return;}
  sfx('eat');puff(p.x,8,p.z,'#ffd27a',3);uiToast('Con vật cọ vào chân bạn.','');}
// mỗi giờ: ăn ở máng, đẻ trứng ở chuồng gà, sinh con, lớn lên; đói lâu thì bỏ đi
function petsHourly(gh){if(!S.pets||!S.pets.length)return;const day=TNOW();let ch=0;
  for(const p of S.pets.slice()){const age=day-(p.born||0);
    if(day-(p.fed||0)>0.5){const tr=S.builds.find(b=>b.k==='trough'&&b.prog==null&&Math.hypot(b.x-p.x,b.z-p.z)<160&&(S.store[b.id]||[]).some(Boolean));if(tr){const st=S.store[tr.id];const i=st.findIndex(Boolean);if(i>=0){st[i].n--;if(st[i].n<=0)st[i]=null;p.fed=day;}}}
    if(day-(p.fed||0)>2.5){S.pets=S.pets.filter(o=>o!==p);if(p._o)G.sc.remove(p._o);uiToast(`${PETN[p.k]} bỏ đi vì đói lâu ngày.`,'bad');ch=1;continue;}
    if(/^(chick|piglet|puppy)$/.test(p.k)&&age>3){p.k={chick:'chicken',piglet:'pig',puppy:'dog'}[p.k];if(p._o)G.sc.remove(p._o);p._o=null;ch=1;}
    if(p.k==='chicken'){const coop=petHome(p);if(coop&&Math.random()<gh/24*0.9*(typeof nhaIs==='function'&&nhaIs(coop,'barn')?1.5:1)){/* chuồng có mái: gà đẻ nhiều hơn 50% */S.tank[coop.id]=Math.min(8,(S.tank[coop.id]||0)+1);}}}
  // sinh sản: hai con cùng loài, được ăn no, ở gần nhau
  for(const k of ['chicken','pig','dog']){const L=S.pets.filter(p=>p.k===k&&day-(p.fed||0)<1);if(L.length>=2&&S.pets.length<24&&Math.random()<gh/24*0.35){const a=L[0];const b={id:(S.pseq=(S.pseq||0)+1),k:{chicken:'chick',pig:'piglet',dog:'puppy'}[k],x:a.x+8,z:a.z+8,born:day,fed:day};S.pets.push(b);petSpawn(b);uiToast(`🐣 ${PETN[b.k]} vừa ra đời!`,'gold');ch=1;}}
  if(ch)save();}
function coopInfo(b){const n=Math.floor(S.tank[b.id]||0);return {name:'Chuồng gà',verb:n?`Nhặt ${n} trứng`:'Chưa có trứng',ok:n>0,icon:'egg'};}
function coopUse(b){const n=Math.floor(S.tank[b.id]||0);if(!n)return;give({egg:n},[b.x,b.y+12,b.z]);S.tank[b.id]=0;sfx('pick');save();}
/* ---------- côn trùng: ong quanh tổ & hoa, muỗi ven nước chạng vạng, ruồi khi người bẩn, chuồn chuồn trên mặt nước, sâu bọ ---------- */
function bugModel(k){let o=null;try{if(window.SBM&&SBM.insect)o=SBM.insect(k);}catch(e){}if(!o){const K=K3;o=K.group(K.ico(0.6,k==='bee'?'#e0b030':k==='dragonfly'?'#3a8ad0':'#303030',{sz:1.6},1,0.2,1));}o.scale.setScalar(k==='caterpillar'||k==='beetle'?3:4);return o;}
function insectsTick(dt){if(!G.ins){G.ins=[];for(let i=0;i<22;i++){G.ins.push({o:null,k:null,live:false,ph:Math.random()*6});}}
  if(G.insT==null||G.t-G.insT>0.8){G.insT=G.t;const si=seasonIdx(),night=isNight(),h=S.hour,dusk=(h>17.5&&h<20.5)||(h>5&&h<6.5),warm=si===0||si===1;
    const want=[];// [kind, x, y, z, mode, anchorX, anchorZ]
    if(si!==3){for(const i of near(P.x,P.z,160)){const q=RES[i];if(q.st!==0)continue;if(q.t==='beehive'&&!night)for(let k=0;k<6;k++)want.push(['bee',q.x,q.y+26,q.z,'orbit']);
        else if(/^flower/.test(q.t)&&!night&&want.length<14&&Math.random()<0.25)want.push(['bee',q.x,q.y+8,q.z,'hover']);else if((q.t==='berry'||q.t==='shrub')&&warm&&Math.random()<0.08)want.push(['caterpillar',q.x+6,q.y,q.z+4,'crawl']);else if(q.t==='deadLog'&&Math.random()<0.3)want.push(['beetle',q.x,q.y+2,q.z,'crawl']);}
      for(const b of S.builds)if(b.k==='beeBox'&&!night&&Math.hypot(b.x-P.x,b.z-P.z)<160)for(let k=0;k<5;k++)want.push(['bee',b.x,b.y+16,b.z,'orbit']);
      if(dusk&&nearWater(P.x,P.z,120))for(let k=0;k<5;k++)want.push(['mosquito',P.x,P.y+26,P.z,'pester']);
      if(!night&&warm)for(let k=0;k<3;k++){const a=Math.random()*6.283,d=40+Math.random()*120,x=P.x+Math.cos(a)*d,z=P.z+Math.sin(a)*d;if(wdAt(x,z)>1)want.push(['dragonfly',x,waterAt(x,z)+8,z,'patrol']);}}
    if((S.p.clean??90)<25||G.drops&&G.drops.length)for(let k=0;k<3;k++)want.push(['fly',P.x,P.y+24,P.z,'pester']);
    if(night&&(si===1||si===2))for(let k=0;k<4;k++){const a=Math.random()*6.283,d=30+Math.random()*90;want.push(['firefly',P.x+Math.cos(a)*d,hAt(P.x+Math.cos(a)*d,P.z+Math.sin(a)*d)+10,P.z+Math.sin(a)*d,'hover']);}
    G.ins.forEach((b,i)=>{const w=want[i];if(!w){if(b.o)b.o.visible=false;b.live=false;return;}if(b.k!==w[0]){if(b.o)G.sc.remove(b.o);b.o=bugModel(w[0]);G.sc.add(b.o);b.k=w[0];b.rig=b.o.userData.rig||{};}
      b.o.visible=true;b.live=true;b.ax=w[1];b.ay=w[2];b.az=w[3];b.mode=w[4];if(b.x==null||Math.hypot(b.x-b.ax,b.z-b.az)>200){b.x=b.ax;b.y=b.ay;b.z=b.az;}});
    if(want.some(w=>w[0]==='bee')&&Math.random()<0.6)sfx('buzz');if(want.some(w=>w[0]==='mosquito'||w[0]==='fly')&&Math.random()<0.5)sfx('whine');}
  for(const b of G.ins){if(!b.live)continue;const t=G.t+b.ph;let tx,ty,tz;
    if(b.mode==='orbit'){tx=b.ax+Math.cos(t*1.7)*14;tz=b.az+Math.sin(t*1.3)*14;ty=b.ay+Math.sin(t*2.3)*6;}else if(b.mode==='hover'){tx=b.ax+Math.sin(t*0.9)*5;tz=b.az+Math.cos(t*1.1)*5;ty=b.ay+Math.sin(t*3)*2;}
    else if(b.mode==='pester'){tx=P.x+Math.sin(t*2.1)*14;tz=P.z+Math.cos(t*1.7)*14;ty=P.y+(isFP()?(G.eyeH||EYE)+Math.sin(t*3)*4:26);}else if(b.mode==='patrol'){tx=b.ax+Math.sin(t*0.6)*50;tz=b.az+Math.cos(t*0.45)*50;ty=b.ay+Math.sin(t*2)*2;}
    else{tx=b.ax+Math.sin(t*0.2)*6;tz=b.az+Math.cos(t*0.17)*6;ty=hAt(tx,tz)+0.5;}
    const k=Math.min(1,dt*(b.mode==='crawl'?1:4));const dx=tx-b.x,dz=tz-b.z;b.x+=dx*k;b.y+=(ty-b.y)*k;b.z+=dz*k;b.o.position.set(b.x,b.y,b.z);if(Math.abs(dx)+Math.abs(dz)>0.01)b.o.rotation.y=Math.atan2(dx,dz);
    const f=Math.sin(G.t*60+b.ph)*0.9;if(b.rig.wingL)b.rig.wingL.rotation.z=f;if(b.rig.wingR)b.rig.wingR.rotation.z=-f;if(b.rig.seg)b.rig.seg.forEach((s,i)=>s.rotation.y=Math.sin(G.t*3-i)*0.25);}}
