/* ===================== KHU VỰC THEO CẤP · THÚ MẠNH DẦN · THÚ CHÚA GIỮ MỎ · THỜI ĐỒ SẮT =====================
   1. Cấp vùng 1..10 theo khoảng cách tới Trảng Khởi Đầu (mỗi 50 m một cấp): càng xa càng nguy hiểm, càng giàu.
      Thổ dân (dan.js) và thú hoang cùng theo cấp vùng: thú +30% máu, +10% đòn mỗi cấp; hạ thú cấp 3 trở lên được thêm da, xương, kinh nghiệm.
      Bước vào vùng nào thì bảng tên vùng ghi rõ cấp.
   2. Năm điểm tài nguyên cấp cao mới (nối vào danh sách điểm giàu của realm.js nên cũng cắm cột vật tổ chiếm được, liên minh tranh nhau được):
      Mỏ sắt, Vỉa than, Bãi vàng, Mỏ ngọc bích, Bãi săn bò tót. Mỗi điểm có một THÚ CHÚA canh (to gấp rưỡi, máu gấp nhiều lần, đòn gấp đôi).
      Phải hạ thú chúa mới cắm cột chiếm được; thú chúa rơi đồ quý và 6 ngày công sau mới có con khác tới (nếu điểm chưa có chủ).
   3. Tài nguyên và chế tạo bậc sau đồng thau: quặng sắt + than đá → thỏi sắt (lò luyện, Chế tác cấp 6) → rìu, giáo, dao, cuốc chim, giáp sắt;
      vàng cốm → vòng vàng; ngọc bích → bùa ngọc. Trình tự: đá → đồng thau → sắt.
   Lưu: S.khu={b:{<id điểm>:{dead:TNOW}}}. */
const khuLv=(x,z)=>clamp(1+Math.floor(Math.hypot(x-SPAWN[0],z-SPAWN[1])/1000),1,10);
function khuS(){if(!S.khu||typeof S.khu!=='object')S.khu={b:{}};if(!S.khu.b)S.khu.b={};return S.khu;}
/* ---------- vật phẩm, tài nguyên, công thức ---------- */
Object.assign(ITEMS,{ironOre:{n:'Quặng sắt',t:'res',ds:'Đá nặng màu nâu đỏ gỉ. Nấu với than đá trong lò luyện ra sắt.'},coal:{n:'Than đá',t:'res',ds:'Đá đen bóng, cháy nóng hơn than củi nhiều: thứ không thể thiếu để luyện sắt.'},
  iron:{n:'Thỏi sắt',t:'res',ds:'Sắt luyện từ quặng và than đá: cứng, bền hơn đồng thau.'},gold:{n:'Vàng cốm',t:'res',ds:'Hạt vàng đãi từ cát lòng suối.'},jade:{n:'Ngọc bích',t:'res',ds:'Đá ngọc xanh, mài ra đồ trang sức quý.'},
  axeIron:{n:'Rìu sắt',t:'tool',tool:'axe',pow:5},spearIron:{n:'Giáo sắt',t:'tool',tool:'spear',pow:6.2},knifeIron:{n:'Dao sắt',t:'tool',tool:'knife',pow:3.6},pickIron:{n:'Cuốc chim sắt',t:'tool',tool:'pick',pow:5},
  ironArmor:{n:'Giáp sắt',t:'wear',slot:'armor',warm:0,dur:1100,arm:0.5,mat:'iron',ds:'Tấm sắt rèn ghép trên áo da. Giảm 50% sát thương.'},
  goldRing:{n:'Vòng vàng',t:'wear',warm:0,slot:'acc',ds:'Vòng tay bằng vàng: dấu hiệu của thủ lĩnh giàu có.'},jadeAmulet:{n:'Bùa ngọc bích',t:'wear',warm:0,slot:'neck',ds:'Miếng ngọc bích mài nhẵn xâu dây đeo cổ.'}});
if(typeof EMO==='object')Object.assign(EMO,{ironOre:'🟤',coal:'⬛',iron:'🔩',gold:'🟡',jade:'🟢',axeIron:'🪓',spearIron:'🔱',knifeIron:'🔪',pickIron:'⛏️',ironArmor:'🛡️',goldRing:'💍',jadeAmulet:'📿'});
if(typeof M2V==='object')Object.assign(M2V,{ironOre:3,coal:2,iron:14,gold:25,jade:30,axeIron:42,spearIron:45,knifeIron:26,pickIron:42,ironArmor:90,goldRing:80,jadeAmulet:65});
if(typeof L4DUR==='object')Object.assign(L4DUR,{axeIron:0.25,spearIron:0.28,knifeIron:0.25,pickIron:0.25});
RECIPES.push({id:'iron',out:{iron:1},in:{ironOre:3,coal:2},st:'smelter',tool:'crucible',req:['ironOre','coal'],lv:{craft:6},steps:'smelt'},
  {id:'axeIron',out:{axeIron:1},in:{iron:2,wood:1},st:'smelter',req:['iron'],lv:{craft:6},steps:'cast'},{id:'spearIron',out:{spearIron:1},in:{iron:2,wood:2,rope:1},st:'smelter',req:['iron'],lv:{craft:6},steps:'cast'},
  {id:'knifeIron',out:{knifeIron:1},in:{iron:1,wood:1},st:'smelter',req:['iron'],lv:{craft:6},steps:'cast'},{id:'pickIron',out:{pickIron:1},in:{iron:2,wood:1},st:'smelter',req:['iron'],lv:{craft:6},steps:'cast'},
  {id:'ironArmor',out:{ironArmor:1},in:{iron:5,leather:2,rope:2},st:'smelter',req:['iron'],lv:{craft:7},steps:'cast'},
  {id:'goldRing',out:{goldRing:1},in:{gold:3,charcoal:1},st:'smelter',tool:'crucible',req:['gold'],lv:{craft:5},steps:'cast'},{id:'jadeAmulet',out:{jadeAmulet:1},in:{jade:2,rope:1},st:null,tool:'knife',req:['jade']});
Object.assign(RT,{ironRock:{n:'Vỉa quặng sắt',m:['khuRock','iron'],hp:14,tool:'pick',yield:{ironOre:[2,3],stone:[1,2]},r:13,regrow:6,sk:'mine'},
  coalRock:{n:'Vỉa than đá',m:['khuRock','coal'],hp:12,tool:'pick',yield:{coal:[2,4],stone:[0,1]},r:13,regrow:6,sk:'mine'},
  jadeRock:{n:'Đá ngọc bích',m:['khuRock','jade'],hp:18,tool:'pick',yield:{jade:[1,1],stone:[2,3]},r:12,regrow:8,sk:'mine'},
  goldPan:{n:'Bãi cát có vàng',m:['khuGold'],hp:3,tool:null,yield:{gold:[0,1],stone:[1,1]},r:9,regrow:4,sk:'gather',pass:1}});
if(typeof RLCAT==='object')Object.assign(RLCAT,{ironRock:'ore',coalRock:'ore',jadeRock:'stone',goldPan:'ore'});
const KHU_COL={iron:['#6b4f42','#a3522a'],coal:['#232327','#45454d'],jade:['#7c877e','#35b07a']};
const KHU_MOD={khuRock:(k)=>{const K=K3,c=KHU_COL[k]||KHU_COL.iron,a=[K.ico(11,c[0],{y:5,sy:0.75},0,0.35,3),K.ico(7.5,c[0],{x:8,z:3,y:3,sy:0.7},0,0.35,5),K.ico(6,c[0],{x:-7,z:-4,y:2.5,sy:0.7},0,0.3,7)];
    for(let i=0;i<6;i++){const an=i*1.05;a.push(K.ico(2.2+(i%3)*0.7,c[1],{x:Math.cos(an)*(5+i%2*3),z:Math.sin(an)*(5+i%2*3),y:6+(i%3)*2.5},0,0.25,i+11));}return K.group(a);},
  khuGold:()=>{const K=K3,a=[K.cyl(8.5,9.5,0.6,'#d8c48a',{y:-0.1},12)];for(let i=0;i<8;i++){const an=i*0.8,r=1.2+i*0.8;a.push(K.ico(0.7+(i%2)*0.35,'#f2c230',{x:Math.cos(an)*r,z:Math.sin(an)*r,y:0.7,sy:0.6},0,0.2,i+2));}return K.group(a);}};
const KHU_TOOLM={axeIron:'bronzeAxe',spearIron:'bronzeSpear',knifeIron:'bronzeKnife',pickIron:'pick'};
{const _m=model;model=function(spec){if(spec&&KHU_MOD[spec[0]]){try{return KHU_MOD[spec[0]](spec[1]);}catch(e){}}if(spec&&spec[0]==='tool'&&KHU_TOOLM[spec[1]])return _m(['tool',KHU_TOOLM[spec[1]]]);return _m(spec);};}
/* ---------- điểm tài nguyên cấp cao + thú chúa ---------- */
const KHU_BOSS={sat:{kind:'bear',n:'Gấu chúa',lv:8,loot:{hide:6,bone:4,meat:8,ironOre:6}},than:{kind:'wolf',n:'Sói đầu đàn',lv:6,loot:{hide:4,bone:3,meat:4,coal:6}},
  vang:{kind:'crocodile',n:'Cá sấu chúa',lv:7,loot:{hide:5,meat:6,gold:2}},ngocbich:{kind:'tiger',n:'Hổ chúa',lv:9,loot:{hide:8,bone:4,meat:6,jade:2}},botot:{kind:'gaur',n:'Bò tót chúa',lv:5,loot:{hide:6,bone:5,meat:14}}};
if(typeof RLSITE!=='undefined')RLSITE.push(
  {id:'sat',n:'Mỏ sắt Núi Cao',ic:'⚒️',cat:'ore',regs:['range','vista','pineplat','hills','plateau'],minD:3500,rich:3,y:{ironOre:3,coal:1,stone:2},nodes:[['ironRock',8],['coalRock',3],['boulder',2]],d:'Vách núi nâu đỏ màu gỉ: quặng sắt lộ thành vỉa. Gấu chúa coi đây là lãnh thổ.'},
  {id:'than',n:'Vỉa than Cao Nguyên',ic:'⬛',cat:'ore',regs:['vista','hotspring','chasm','hills','plateau','pineplat'],minD:2400,rich:3,y:{coal:4,stone:1},nodes:[['coalRock',9],['boulder',2]],d:'Sườn đồi lộ lớp đá đen bóng: than đá, thứ lửa nóng nhất. Bầy sói có con đầu đàn to lớn quanh quẩn ở đây.'},
  {id:'vang',n:'Bãi vàng sa khoáng',ic:'🟡',cat:'ore',regs:['gorge','falls','bamboovl','lake','ford'],minD:2500,rich:3,water:1,y:{gold:2,stone:2},nodes:[['goldPan',8],['reedBed',2]],d:'Bãi cát lòng suối lấp lánh vàng cốm. Cá sấu chúa nằm phơi nắng ngay bãi.'},
  {id:'ngocbich',n:'Mỏ ngọc bích Núi Đá',ic:'🟢',cat:'stone',regs:['cliffs','karst','hotspring','jungle'],minD:3500,rich:3,y:{jade:1,stone:3},nodes:[['jadeRock',6],['boulder',3]],d:'Khe đá có vân xanh biếc: ngọc bích. Hổ chúa rình quanh mỏ.'},
  {id:'botot',n:'Bãi săn bò tót',ic:'🐃',cat:'game',regs:['meadow4','savanna','forest'],minD:2200,rich:2,y:{meat:4,hide:2},nodes:[['wildgrain',5],['tallgrass',4]],d:'Trảng cỏ rộng nơi đàn bò tót về ăn. Con đầu đàn to như tảng đá.'});
const khuBossDead=id=>{const st=S.khu&&S.khu.b&&S.khu.b[id];return !!(st&&TNOW()-st.dead<6);};
function khuBossTick(){if(!S||!G.on||typeof RL==='undefined'||!RL.sites||!G.animals)return;const K=khuS(),R=S.rlm;if(!R||!R.s)return;
  for(const s of RL.sites){const B=KHU_BOSS[s.id];if(!B||!ANIMALS[B.kind])continue;const st=R.s[s.id];if(!st)continue;if(st.own==='me'){continue;}const dead=khuBossDead(s.id);st.g=dead?0:1;if(dead)continue;
    if(Math.hypot(s.x-P.x,s.z-P.z)>1600)continue;if(G.animals.some(a=>a.boss===s.id&&a.alive))continue;
    G.animals=G.animals.filter(a=>{if(a.boss===s.id&&!a.alive){try{G.sc.remove(a.o);}catch(e){}return false;}return true;});
    let x=s.x+40,z=s.z+30;for(let i=0;i<12&&wdAt(x,z)>0&&B.kind!=='crocodile';i++){const an=i*0.52;x=s.x+Math.cos(an)*70;z=s.z+Math.sin(an)*70;}
    const a=animalNew(B.kind,x,z);a.boss=s.id;a.lv=B.lv;a.n=B.n;a.hp=ANIMALS[B.kind].hp*(10+B.lv*2);/* cân bằng lại: nhân vật giờ có thuộc tính, cường hoá, danh hiệu nên thú chúa trâu hơn nhiều */a.hp0=a.hp;a.r*=1.5;a._lvOn=1;a.home={x:s.x,z:s.z};try{a.o.scale.multiplyScalar(1.6);seasonPatchAll(a.o);}catch(e){}G.animals.push(a);}}
function khuBossDown(a){const B=KHU_BOSS[a.boss];if(!B)return;khuS().b[a.boss]={dead:TNOW()};a.back=1e12;const s=RL.byId&&RL.byId[a.boss];try{if(S.rlm&&S.rlm.s[a.boss]&&S.rlm.s[a.boss].own!=='me')S.rlm.s[a.boss].g=0;}catch(e){}
  give(B.loot,[a.x,a.y+20,a.z]);addXp('hunt',30+B.lv*4);cnt('cnt','boss');sfx('level');uiToast(`👑 Đã hạ ${B.n}! ${s?s.def.n+' giờ không còn ai canh: dựng Cột vật tổ để chiếm.':''}`,'gold');save();}
if(typeof rlTick==='function'){const _rt=rlTick;rlTick=function(){try{khuBossTick();}catch(e){if(!G.khuErr){G.khuErr=1;console.warn('thú chúa',e);}}return _rt.apply(this,arguments);};}
/* ---------- thú theo cấp vùng ---------- */
{const _at=animalsTick;animalsTick=function(dt){if(G.animals)for(const a of G.animals){if(!a.alive){if(!a.boss)a._lvOn=0;continue;}if(a._lvOn)continue;a._lvOn=1;a.lv=khuLv(a.home?a.home.x:a.x,a.home?a.home.z:a.z);if(a.lv>1)a.hp*=1+0.3*(a.lv-1);}return _at.apply(this,arguments);};}
{const _aa=animalAttack;animalAttack=function(a){const D=a&&ANIMALS[a.kind];if(!D||!(a.lv>1))return _aa.apply(this,arguments);const old=D.dmg;D.dmg=(old||5)*(1+0.1*(a.lv-1))*(a.boss?1.6:1);try{return _aa.apply(this,arguments);}finally{D.dmg=old;}};}
{const _ad=animalDamage;animalDamage=function(a,dmg){const al=a&&a.alive;const r=_ad.apply(this,arguments);try{if(al&&a&&!a.alive){if(a.boss)khuBossDown(a);else if(a.lv>=3){const D=ANIMALS[a.kind],n=Math.floor((a.lv-1)/3),out={};if(D.drop&&D.drop.hide)out.hide=n;if(D.drop&&D.drop.bone)out.bone=n;else if(D.drop&&D.drop.meat)out.meat=n;if(Object.keys(out).length)give(out,[a.x,a.y+16,a.z]);addXp('hunt',a.lv);}}}catch(e){console.warn('thú cấp',e);}return r;};}
{const _ti=targetInfo;targetInfo=function(t){const r=_ti.apply(this,arguments);try{if(r&&t&&t.type==='animal'&&t.a&&r.name){if(t.a.boss)r.name='👑 '+r.name+' · cấp '+t.a.lv+' · '+Math.max(0,Math.ceil(t.a.hp))+' máu';else if(t.a.lv>1&&!/^Cấp/.test(r.name))r.name='Cấp '+t.a.lv+' · '+r.name;}}catch(e){}return r;};}
/* ---------- bảng tên vùng: ghi cấp ---------- */
{const _ur=uiRegion;uiRegion=function(r,first){_ur.apply(this,arguments);try{const el=$('#regban'),lv=khuLv(P.x,P.z);if(el)el.insertAdjacentHTML('beforeend',`<i class="khu-lv">Vùng cấp ${lv}${lv>=4?' · thú dữ và thổ dân mạnh: đi cùng lính':''}</i>`);}catch(e){}};}
{const st=document.createElement('style');st.textContent='.khu-lv{display:block;font-style:normal;font-size:11.5px;font-weight:700;color:#ffd27a;margin-top:2px;text-shadow:0 1px 3px #000}';document.head.appendChild(st);}

// hồ sơ tài nguyên của các vùng miền Trung, miền Nam (thế giới hình chữ S, world5.js)
if(typeof RLPROF==='object'){Object.assign(RLPROF,{deongang:['stone','soil'],truongson:['timber stone game','fish soil'],mientrung:['salt fish shell','timber soil'],cattien:['timber game herb honey','stone'],cuulong:['soil fish clay','stone ore flint'],uminh:['fish honey shell','stone flint'],camau:['fish salt shell','stone timber']});
  for(const id of ['deongang','truongson','mientrung','cattien','cuulong','uminh','camau']){const [r,p]=RLPROF[id];RLPS[id]={r:new Set(r.split(' ').filter(Boolean)),p:new Set(p.split(' ').filter(Boolean))};}}
// điểm tài nguyên riêng của miền Trung, miền Nam (chỉ có ở bản đồ hình chữ S: các vùng này không tồn tại ở bản đồ cũ nên điểm tự bỏ qua)
if(typeof RLSITE!=='undefined')RLSITE.push(
  {id:'muoitrung',n:'Ruộng muối Dải Cát',ic:'🧂',cat:'salt',regs:['mientrung'],minD:3000,rich:3,water:1,y:{salt:5,fish:2},nodes:[['saltPan',10],['shellBed',3]],d:'Bãi cát trắng miền Trung nắng gắt quanh năm: nước biển phơi vài hôm là kết muối.'},
  {id:'vualua',n:'Vựa lúa Chín Rồng',ic:'🌾',cat:'soil',regs:['cuulong'],minD:3000,rich:3,y:{grain:6,seedGrain:1,clay:2},nodes:[['wildgrain',12],['clay',4],['gourdwild',3]],d:'Đất phù sa châu thổ tốt nhất thiên hạ: gieo gì mọc nấy, ruộng quanh đây lớn nhanh gấp rưỡi.'},
  {id:'gotruongson',n:'Rừng gỗ Trường Sơn',ic:'🌲',cat:'timber',regs:['truongson','cattien'],minD:3000,rich:3,y:{wood:8,honey:1},nodes:[['oakG',6],['pineG',4],['beehive',2]],d:'Rừng già trên sườn Trường Sơn, cây thẳng và to như cột đình.'});
