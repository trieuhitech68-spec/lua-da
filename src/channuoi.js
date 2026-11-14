/* ===================== CHĂN NUÔI ĐỦ LOÀI + CÁC KIỂU NHÀ MỚI =====================
   VẬT NUÔI LẤY Ở ĐÂU (trước: dựng chuồng xong không biết kiếm con gì bỏ vào):
     · Thuần thú rừng: lom khom lại gần, cho ăn 3 lần → gà rừng → gà · lợn rừng → lợn · sói → chó · THỎ RỪNG → thỏ nhà · DÊ NÚI (loài mới ở vùng núi đá, bìa rừng) → dê nhà.
     · Đổi CON GIỐNG ở làng (mỗi lồng 2 con để gây đàn): gà giống, vịt giống, thỏ giống (người hái lượm) · lợn giống (thợ săn) · dê giống (già làng) · nghé (tù trưởng).
       Mở túi, chọn lồng, bấm "Thả ra" cạnh chuồng.
     · Loài mới: dê (mổ được nhiều thịt, da), vịt (đẻ trứng ở chuồng vịt), thỏ (đẻ nhanh). Dê, vịt tự kiếm ăn ngoài đồng trừ mùa đông; con non 3 ngày thì lớn; hai con no bụng ở gần nhau thì sinh con.
     · Đứng cạnh chuồng chưa có con nào, bấm Hành động: hiện cách kiếm đúng loài cho chuồng đó.
   KIỂU NHÀ MỚI trong Xây → Quy hoạch làng: nhóm "Nhà ở kiểu khác" (chòi tròn, nhà sàn, nhà vuông mái bốn dốc, nhà nứa, nhà sàn mái lá, nhà sàn mái thuyền),
     nhóm "Chăn nuôi" (chuồng gà, chuồng lợn, chuồng dê, chuồng trâu, ao vịt) và "Làng nghề" (lò gốm, nhà dệt, bến cá, kho thóc, sân giếng). */
const CNU={GROW:{kid:'goat',duckling:'duck',bunny:'rabbit'},BREED:{goat:'kid',duck:'duckling',rabbit:'bunny'},
  MEAT:{goat:{meat:5,hide:2,bone:2},rabbit:{meat:2,hide:1},duck:{meat:2,feather:3}},
  SEED:{chickPair:'chick',pigletPair:'piglet',kidPair:'kid',ducklingPair:'duckling',bunnyPair:'bunny'},
  HINT:{pigPen:'🐖 Chuồng lợn chưa có con nào. Cách kiếm: lom khom lại gần LỢN RỪNG, cho ăn quả mọng / nấm / chuối 3 lần là nó theo về; hoặc đổi "Lợn giống" ở thợ săn làng bên (4 thịt + 6 quả mọng).',
    goatShed:'🐐 Chuồng dê chưa có con nào. Cách kiếm: tìm DÊ NÚI ở vùng núi đá, bìa rừng, lom khom cho ăn đọt dương xỉ / chuối / muối 3 lần; hoặc đổi "Dê giống" ở già làng (3 da + 2 muối).',
    buffaloShed:'🐃 Chuồng trâu chưa có con nào. Cách kiếm: đổi "Nghé con" ở tù trưởng làng bên (6 thịt + 4 da), mở túi bấm Thả ra; ba ngày sau nghé lớn thành trâu kéo cày.',
    coop:'🐔 Chưa có gà, vịt. Cách kiếm: lom khom lại gần GÀ RỪNG, cho ăn hạt / quả mọng 3 lần; hoặc đổi "Gà giống" (8 quả mọng), "Vịt giống" (4 cá) ở người hái lượm làng bên rồi thả cạnh chuồng.'}};
Object.assign(PETN,{goat:'Dê nhà',kid:'Dê con',duck:'Vịt nhà',duckling:'Vịt con',rabbit:'Thỏ nhà',bunny:'Thỏ con'});
Object.assign(ITEMS,{chickPair:{n:'Gà giống (2 con)',t:'pet',ds:'Lồng tre nhốt hai gà con đổi ở làng. Mở túi, bấm "Thả ra" cạnh chuồng gà: ba ngày sau lớn, đẻ trứng và sinh đàn.'},
  pigletPair:{n:'Lợn giống (2 con)',t:'pet',ds:'Hai lợn con đổi ở làng. Thả cạnh chuồng lợn có máng ăn: ba ngày sau lớn.'},
  kidPair:{n:'Dê giống (2 con)',t:'pet',ds:'Hai dê con đổi ở làng. Thả cạnh chuồng dê: dê tự gặm cỏ ngoài đồng, mùa đông cần bỏ cỏ vào máng.'},
  ducklingPair:{n:'Vịt giống (2 con)',t:'pet',ds:'Hai vịt con đổi ở làng. Thả cạnh chuồng vịt bên ao: lớn lên đẻ trứng ở chuồng.'},
  bunnyPair:{n:'Thỏ giống (2 con)',t:'pet',ds:'Hai thỏ con đổi ở làng. Thả cạnh máng ăn, cho ăn rau cỏ: thỏ đẻ rất nhanh.'}});
if(typeof EMO==='object')Object.assign(EMO,{chickPair:'🐤',pigletPair:'🐖',kidPair:'🐐',ducklingPair:'🦆',bunnyPair:'🐇'});
try{TRADES.gatherer.push([{berry:8},{chickPair:1}],[{fish:4},{ducklingPair:1}],[{fiber:10},{bunnyPair:1}]);TRADES.hunter.push([{meat:4,berry:6},{pigletPair:1}]);TRADES.elder.push([{hide:3,salt:2},{kidPair:1}]);}catch(e){}
// thú rừng thuần được thêm: thỏ rừng, dê núi
ANIMALS.goat={n:'Dê núi',hp:4,spd:170,r:10,flee:140,drop:{meat:3,hide:2,bone:1},bio:['rock','edge','meadow'],n0:0,aggro:'never',herd:3};
try{if(typeof H3WT==='object')H3WT.goat=35;}catch(e){}
{const ok=L=>L.filter(k=>ITEMS[k]);TAME.rabbit={to:'rabbit',food:ok(['fernShoot','centella','gourd','berry','banana']),n:'thỏ'};TAME.goat={to:'goat',food:ok(['fernShoot','banana','salt','gourd','berry']),n:'dê'};}
{const _ai=animalsInit;animalsInit=function(){const r=_ai.apply(this,arguments);try{const R=rng((S.seed|0)+7373),D=ANIMALS.goat,N=/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)?6:10;let n=0,tries=0;
      while(n<N&&tries<2500){tries++;let x,z;const a=R()*6.283,rr=Math.sqrt(R())*WR*0.85;x=Math.cos(a)*rr;z=Math.sin(a)*rr;if(typeof V5!=='undefined'&&WV>=4&&R()<0.7){x=V5.box[0]+R()*V5.box[2];z=V5.box[1]+R()*V5.box[3];}
        if(!wIn(x,z,0.95)||hAt(x,z)<3||wdAt(x,z)>0||!D.bio.includes(biome(x,z))||(tries<1500&&biome(x,z)==='meadow')||Math.hypot(x-SPAWN[0],z-SPAWN[1])<320)continue;
        for(let k=0;k<3&&n<N;k++,n++){const g=animalNew('goat',x+(R()-0.5)*60,z+(R()-0.5)*60,R);if(k===2)try{g.o.scale.multiplyScalar(0.72);}catch(e){}G.animals.push(g);}}
      try{seasonPatchAll();}catch(e){}}catch(e){console.warn('dê núi',e);}return r;};}
// hình con vịt (chưa có sẵn): thân bầu, cổ cong, mỏ dẹt, chân màng
function cnuDuck(young){const g=new THREE.Group(),M=c=>new THREE.MeshLambertMaterial({color:c}),wh=M(young?'#e8d27a':'#f1ede2'),or=M('#e08a2a'),dk=M('#2a2622');
  const sp=new THREE.SphereGeometry(1,12,9),add=(geo,mt,x,y,z,sx,sy,sz,par)=>{const m=new THREE.Mesh(geo,mt);m.position.set(x,y,z);m.scale.set(sx,sy,sz);(par||g).add(m);return m;};
  add(sp,wh,0,5.2,0,2.7,2.5,4.2);add(sp,wh,0,6.6,-3.6,1.5,1.3,1.9);/* đuôi vểnh */add(sp,wh,2.3,5.4,-0.3,0.7,1.7,3);add(sp,wh,-2.3,5.4,-0.3,0.7,1.7,3);
  const head=new THREE.Group();head.position.set(0,7,3);g.add(head);add(sp,wh,0,1.6,0.4,1,2.2,1,head);add(sp,wh,0,3.8,0.9,1.5,1.4,1.6,head);add(sp,or,0,3.5,2.7,1,0.4,1.3,head);for(const x of [0.9,-0.9])add(sp,dk,x,4.2,1.7,0.3,0.3,0.3,head);
  const leg=x=>{const L=new THREE.Group();L.position.set(x,3,0);g.add(L);add(new THREE.CylinderGeometry(0.3,0.3,3,5),or,0,-1.5,0,1,1,1,L);add(sp,or,0,-2.9,0.7,0.9,0.2,1.3,L);return L;};
  g.userData.rig={head,legL:leg(1.1),legR:leg(-1.1)};g.scale.setScalar(young?0.55:1);return g;}
{const _pm=petModel;petModel=function(k){try{if(k==='duck'||k==='duckling')return cnuDuck(k==='duckling');if(k==='kid'){const o=animalModel('goat');o.scale.multiplyScalar(0.5);return o;}if(k==='rabbit'||k==='bunny'){const o=animalModel('rabbit');if(k==='bunny')o.scale.multiplyScalar(0.6);return o;}if(k==='goat')return animalModel('goat');}catch(e){console.warn('hình vật nuôi',k,e);}return _pm.apply(this,arguments);};}
// chỗ ở: dê về chuồng dê, vịt về chuồng vịt / ao, thỏ quanh máng ăn hoặc chuồng
{const _hm=petHome;petHome=function(p){const k=p.k,rx=k==='goat'||k==='kid'?/^goatShed$/:k==='duck'||k==='duckling'?/^(duckHouse|fishPond)$/:k==='rabbit'||k==='bunny'?/^(trough|goatShed|pigPen|coop|chickenCoop2)$/:null;if(!rx)return _hm.apply(this,arguments);
    let best=null,bd=420;for(const b of S.builds){if(b.prog!=null||b.remote||!rx.test(b.k))continue;const d=Math.hypot(b.x-p.x,b.z-p.z)-(b.k==='duckHouse'||b.k==='goatShed'?40:0);if(d<bd){bd=d;best=b;}}return best;};}
// thả con giống từ túi
{const _co=mxCalfOut;mxCalfOut=function(i){const s=S.inv[i],k=s&&CNU.SEED[s.id];if(!k)return _co.apply(this,arguments);if((S.pets||[]).length>=24){uiToast('Đàn vật nuôi đã đủ 24 con, chưa nuôi thêm được.','bad');sfx('no');return;}
    s.n--;if(s.n<=0)S.inv[i]=null;S.pets=S.pets||[];for(let j=0;j<2;j++){const p={id:(S.pseq=(S.pseq||0)+1),k,x:P.x+Math.sin(P.ry)*30+(j?12:-12),z:P.z+Math.cos(P.ry)*30+(j?8:-8),born:TNOW(),fed:TNOW()};S.pets.push(p);petSpawn(p);}
    uiClose();uiToast(`🐾 Đã thả hai ${PETN[k].toLowerCase()}. Chúng ở quanh chuồng, máng ăn gần nhất; ba ngày nữa lớn. Nhớ bỏ thức ăn vào máng hoặc cho ăn ở chuồng.`,'gold');cnt('cnt','tame');sfx('pick');uiHotbar();save();};}
{const _bh=bagHtml;bagHtml=function(){let h=_bh.apply(this,arguments);try{const s=G.selSlot!=null&&S.inv[G.selSlot];if(s&&CNU.SEED[s.id])h=h.replace('🐃 Thả ra, dắt về nuôi','🐾 Thả ra cạnh chuồng');}catch(e){}return h;};}
// mỗi giờ: tự kiếm ăn, lớn lên, vịt đẻ trứng, sinh con
{const _ph=petsHourly;petsHourly=function(gh){try{if(S&&S.pets&&S.pets.length){const day=TNOW(),winter=seasonIdx()===3;let ch=0;
      for(const p of S.pets){const k=p.k;if(!winter&&(k==='goat'||k==='kid'||((k==='duck'||k==='duckling')&&(wdAt(p.x,p.z)>0||nearWater(p.x,p.z,260)))))p.fed=day;
        if(CNU.GROW[k]&&day-(p.born||0)>3){p.k=CNU.GROW[k];if(p._o)G.sc.remove(p._o);p._o=null;ch=1;}
        if(p.k==='duck'&&day-(p.fed||0)<1.5){const h=petHome(p);if(h&&h.k==='duckHouse'&&Math.random()<(gh||1)/24*0.8){S.tank=S.tank||{};S.tank[h.id]=Math.min(8,(S.tank[h.id]||0)+1);}}}
      for(const k in CNU.BREED){const L=S.pets.filter(p=>p.k===k&&day-(p.fed||0)<1);if(L.length>=2&&S.pets.length<24&&Math.random()<(gh||1)/24*(k==='rabbit'?0.6:0.3)){const a=L[0],b={id:(S.pseq=(S.pseq||0)+1),k:CNU.BREED[k],x:a.x+8,z:a.z+8,born:day,fed:day};S.pets.push(b);petSpawn(b);uiToast(`🐣 ${PETN[b.k]} vừa ra đời!`,'gold');ch=1;}}
      if(ch)save();}}catch(e){console.warn('chăn nuôi',e);}return _ph.apply(this,arguments);};}
// mổ thịt con đã lớn (cần dao)
{const _pi=petInfo;petInfo=function(p){const m=CNU.MEAT[p.k];if(m||CNU.GROW[p.k]){const n=PETN[p.k],hungry=TNOW()-(p.fed||0)>1;if(m&&TNOW()-(p.born||0)>4&&hasTool('knife'))return {name:n,verb:'Mổ thịt',ok:true,icon:'meat'};return {name:n,verb:'Vuốt ve',ok:true,icon:'fernShoot',warn:hungry?'Đói: cho ăn ở chuồng hoặc bỏ thức ăn vào máng':null};}return _pi.apply(this,arguments);};}
{const _pu=petUse;petUse=function(p){const m=CNU.MEAT[p.k];if(m&&TNOW()-(p.born||0)>4&&hasTool('knife')){S.pets=S.pets.filter(o=>o!==p);if(p._o)G.sc.remove(p._o);give(Object.assign({},m),[p.x,8,p.z]);addXp('hunt',4);sfx('thud');save();return;}
    if(m||CNU.GROW[p.k]){sfx('eat');puff(p.x,8,p.z,'#ffd27a',3);uiToast(`${PETN[p.k]} quấn quanh chân bạn.`,'');return;}return _pu.apply(this,arguments);};}
// chuồng chưa có con nào: bấm Hành động là được chỉ cách kiếm
{const _ti=targetInfo;targetInfo=function(t){const r=_ti.apply(this,arguments);try{if(t&&t.type==='cng'&&r&&CNG.SHED[t.b.k]&&!cngShedPets(t.b).length){r.verb='Chưa có vật nuôi · xem cách kiếm';r.ok=true;r.need=null;}}catch(e){}return r;};}
{const _as=actStart;actStart=function(t){try{if(t&&t.type==='cng'&&!G.work&&CNG.SHED[t.b.k]&&!cngShedPets(t.b).length){uiToast(CNU.HINT[t.b.k]||CNU.HINT.coop,'');sfx('pick');return;}}catch(e){}return _as.apply(this,arguments);};}
{const noFowl=b=>!(S.pets||[]).some(p=>/^(chicken|chick|duck|duckling)$/.test(p.k)&&Math.hypot(p.x-b.x,p.z-b.z)<420);
 const _ci=coopInfo;coopInfo=function(b){const r=_ci.apply(this,arguments);try{if(r&&!r.ok&&noFowl(b)){r.verb='Chưa có gà, vịt · xem cách kiếm';r.ok=true;}}catch(e){}return r;};
 const _cu=coopUse;coopUse=function(b){try{if(!Math.floor(S.tank[b.id]||0)&&noFowl(b)){uiToast(CNU.HINT.coop,'');sfx('pick');return;}}catch(e){}return _cu.apply(this,arguments);};}
/* ---------- kiểu nhà mới trong Quy hoạch làng ---------- */
{const bf=id=>{const b=B4BP.find(x=>x.id===id);return b?b.fn:null;},roofed=(A,w,h,fl,rf,wl,door,di)=>{for(let i=0;i<w;i++)for(let j=0;j<h;j++){A.F(i,j,fl);A.R(i,j,rf,0);}for(let i=0;i<w;i++){A.E(i,0,'n',wl);A.E(i,h-1,'s',i===di?door:wl);}for(let j=0;j<h;j++){A.E(0,j,'w',wl);A.E(w-1,j,'e',wl);}};
 const N=[
  {id:'qh_tron',g:'Nhà ở kiểu khác',n:'Chòi tròn vách đất',ic:'🛖',fx:'Chỗ ngủ kín gió, rẻ vật liệu: hợp lúc mới lập trại',d:'Nền đất nện, bốn vách cong trát bùn, mái nón tranh, chiếu ngủ bên trong.',key:'roof',fn:bf('roundHut')},
  {id:'qh_nua',g:'Nhà ở kiểu khác',n:'Nhà nứa mái lá',ic:'🏠',fx:'Nhà dài một gian, có bếp và chõng tre',d:'Nhà 1×4 ô vách nứa đan, mái lá hai dốc có chái hai đầu, bếp kiềng, chõng tre.',key:'roof',fn:bf('nuaLongHouse')},
  {id:'qh_san',g:'Nhà ở kiểu khác',n:'Nhà sàn nhỏ',ic:'🎋',fx:'Ở trên cao: tránh thú dữ và ẩm ướt',d:'Nhà sàn tre 2×2 ô trên cột cao, hiên lan can, thang độc mộc, mái tranh, bếp đất và giường tre.',key:'roof',fn:bf('stiltSmall')},
  {id:'qh_sanla',g:'Nhà ở kiểu khác',n:'Nhà sàn mái lá gồi',ic:'🌴',fx:'Nhà sàn rộng cho cả nhà, có gác bếp',d:'Nhà sàn 3×2 ô vách nứa, mái lá gồi hai dốc, hiên phên nứa, cầu thang tre, bếp kiềng.',key:'roof',fn:bf('stiltLeaf')},
  {id:'qh_bondoc',g:'Nhà ở kiểu khác',n:'Nhà vuông mái bốn dốc',ic:'🏯',fx:'Nhà gỗ súc vững chãi, có hiên ngồi trước nhà',d:'Nhà 2×2 ô tường gỗ súc trên sàn ván, mái chái bốn góc, cửa hai cánh, hiên kê cột thấp.',key:'roof',fn:bf('hipHouse')},
  {id:'qh_santhuyen',g:'Nhà ở kiểu khác',n:'Nhà sàn mái thuyền',ic:'⛵',fx:'Nhà sàn lớn kiểu Đông Sơn, có trống đồng giữa nhà',d:'Nhà sàn 3×2 ô, mái cong hình thuyền như trên trống đồng, hiên lan can, cầu thang gỗ, cột chạm.',key:'roof',fn:bf('stiltBoat')},
  {id:'qh_ga',g:'Chăn nuôi',n:'Chuồng gà có rào',ic:'🐔',fx:'Gà đẻ trứng mỗi ngày · gà giống: thuần gà rừng hoặc đổi ở người hái lượm',d:'Chuồng gà trên cột, ổ đẻ, máng ăn, quây rào phên đan có cổng.',key:'chickenCoop2',fn:bf('chickenYard')},
  {id:'qh_lon',g:'Chăn nuôi',n:'Chuồng lợn',ic:'🐖',fx:'Lợn lớn mổ được 6 thịt · lợn giống: thuần lợn rừng hoặc đổi ở thợ săn',d:'Chuồng lợn 2×2 mái lá, máng ăn bên cạnh.',key:'pigPen',fn:A=>{A.O(0,0,'pigPen');A.O(2,0,'trough');}},
  {id:'qh_de',g:'Chăn nuôi',n:'Chuồng dê',ic:'🐐',fx:'Dê tự gặm cỏ, mổ được 5 thịt 2 da · dê giống: thuần dê núi hoặc đổi ở già làng',d:'Chuồng dê sàn tre 2×2, máng ăn bên cạnh.',key:'goatShed',fn:A=>{A.O(0,0,'goatShed');A.O(2,0,'trough');}},
  {id:'qh_trau',g:'Chăn nuôi',n:'Chuồng trâu',ic:'🐃',fx:'Trâu kéo cày nhanh gấp nhiều lần cuốc tay · nghé: đổi ở tù trưởng',d:'Chuồng trâu 2×2 mái tranh bốn dốc, máng ăn bên cạnh.',key:'buffaloShed',fn:A=>{A.O(0,0,'buffaloShed');A.O(2,0,'trough');}},
  {id:'qh_vit',g:'Chăn nuôi',n:'Ao vịt có chuồng',ic:'🦆',fx:'Vịt đẻ trứng ở chuồng, ao tự sinh cá · vịt giống: đổi ở người hái lượm',d:'Ao cá 2×2 kè đá, chuồng vịt bên bờ, giàn gà đậu, rào phên đan quanh có cổng.',key:'duckHouse',fn:bf('duckPond')},
  {id:'qh_gom',g:'Làng nghề',n:'Lò gốm',ic:'🏺',fx:'Lò nung và chum vại dưới một mái: nung gốm không lo mưa',d:'Lán 2×1 ô mái lá ba mặt vách, có lò nung và chum vại.',key:'roof',fn:A=>{for(let i=0;i<2;i++){A.F(i,0,'floor');A.R(i,0,'roof',0);A.E(i,0,'n','wall');}A.E(0,0,'w','wall');A.E(1,0,'e','wall');A.O(0,0,'kiln');A.O(1,0,'pottery');}},
  {id:'qh_det',g:'Làng nghề',n:'Nhà dệt',ic:'🧵',fx:'Khung dệt trong nhà kín: dệt vải, may áo quanh năm',d:'Nhà 2×2 ô có cửa và cửa sổ, khung dệt, giỏ đựng sợi.',key:'roof',fn:A=>{roofed(A,2,2,'floor','roof','wall','wallDoor',1);A.O(0,0,'loom');A.O(1,0,'basket');}},
  {id:'qh_benca',g:'Làng nghề',n:'Bến cá',ic:'⚓',fx:'Cầu vươn ra nước, giàn phơi cá, đó bắt cá: đặt từ bờ ra sông, hồ',d:'Cầu ao ba nhịp có lan can, giàn phơi cá và đó bắt cá.',key:'fishRack',fn:bf('dock')},
  {id:'qh_khothoc',g:'Làng nghề',n:'Kho thóc và sân phơi',ic:'🌾',fx:'Kho thóc trên cột chắn chuột, sân cuội phơi thóc, cối giã',d:'Kho thóc trên cột, sân lát cuội, cối giã chân và bồ thóc.',key:'granary',fn:bf('granaryYard')},
  {id:'qh_san_gieng',g:'Làng nghề',n:'Sân giếng',ic:'🪣',fx:'Giếng khơi giữa sân lát cuội: lấy nước sạch ngay trong làng',d:'Sân lát cuội 3×3, giếng cần vọt, luống hoa, ghế băng, mâm gỗ, chum nước.',key:'wellStone',fn:bf('courtyard')}].filter(q=>typeof q.fn==='function');
 for(const q of N){if(QH.some(x=>x.id===q.id))continue;q.bp=bpMake(q.id,q.n,q.ic,0,q.d,q.fn);QH.push(q);}}
if(typeof HD_L!=='undefined')HD_L.push({id:'channuoi',ic:'🐾',t:'Vật nuôi lấy ở đâu?',w:()=>{try{return !!S&&S.builds.some(b=>b.prog==null&&!b.remote&&(CNG.SHED[b.k]||/^(coop|chickenCoop2|duckHouse|chickenRoost|trough)$/.test(b.k)));}catch(e){return false;}},
  p:['Có chuồng rồi thì cần con giống. <b>Cách 1, thuần thú rừng:</b> bấm nút lom khom, cầm thức ăn nó thích, lại gần bấm <b>Hành động</b> cho ăn 3 lần: gà rừng thành gà, lợn rừng thành lợn, thỏ rừng thành thỏ, dê núi thành dê, sói thành chó.',
   '<b>Cách 2, đổi con giống ở làng bên:</b> người hái lượm có gà giống, vịt giống, thỏ giống; thợ săn có lợn giống; già làng có dê giống; tù trưởng có nghé. Mở <b>Túi</b>, chọn lồng con giống, bấm <b>Thả ra</b> cạnh chuồng.',
   'Đứng cạnh chuồng bấm <b>Hành động</b> để cho ăn; chuồng chưa có con nào thì hiện cách kiếm đúng loài. Hai con no bụng ở gần nhau sẽ sinh con; con lớn (có dao) thì mổ thịt được.']});
