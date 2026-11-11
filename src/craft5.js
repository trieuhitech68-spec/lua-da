/* ===================== 🧺 CRAFT5: LỌC TÚI ĐỒ THEO LOẠI · THÊM ĐỒ THỜI ĐÁ =====================
   1. Bộ lọc túi đồ & bảng chế tạo: Tất cả / Đồ ăn / Dụng cụ / Vũ khí / Mặc / Thuốc / Vật liệu / Khác.
      Túi vẫn là MỘT túi chung: lọc chỉ làm mờ ô không khớp, chạm ô vẫn như cũ (xem + ↔ Chuyển).
      Nhớ bộ lọc gần nhất (localStorage). "⇅ Xếp gọn" xếp theo nhóm loại.
   2. 25 vật phẩm mới, đều có công dụng thật: vũ khí/công cụ (sức, độ bền), mồi bẫy, lưỡi câu, đá mài,
      cối chày, gùi/túi to (thêm ô), đồ ăn (no, máu, không ôi), thuốc (chữa bệnh), đồ mặc (ấm), trống da (tinh thần).
   GÁN LẠI (bọc, không sửa tệp cũ): uiOpen, mxSort, mxSortArr(qua mxSort), mxCraftFilter, recipeBlock, model, trapTick,
   rodStart, rodPull, hitTarget, charLook, l4Decor. */
const C5={sort:0};
const C5CATS=[['all','Tất cả','🎒'],['an','Đồ ăn','🍖'],['cu','Dụng cụ','🛠️'],['vk','Vũ khí','🗡️'],['mac','Mặc','👕'],['th','Thuốc','🌿'],['vl','Vật liệu','🪵'],['khac','Khác','✨']];
// đồ "nguyên liệu" (t:res) nhưng thật ra là đồ dùng / vũ khí / đồ chơi — xếp tay cho đúng
const C5MAP={arrow:'vk',pot:'cu',crucible:'cu',needle:'cu',flask:'cu',bambooTube:'cu',mould:'cu',woodBowl:'cu',woodSpoon:'cu',
  woodStatue:'khac',carvedPost:'khac',bambooFlute:'khac'};
const C5WEAP=new Set(['spear','club','bow']);
function c5cat(id){const I=ITEMS[id];if(!I)return 'khac';if(I.c5c)return I.c5c;if(C5MAP[id])return C5MAP[id];
  switch(I.t){case 'food':case 'drink':return 'an';case 'med':case 'herb':return 'th';case 'wear':return 'mac';
    case 'tool':return C5WEAP.has(I.tool)?'vk':'cu';case 'boat':case 'pack':return 'cu';case 'res':return 'vl';default:return 'khac';}}
const c5ld=(k,d)=>{try{const v=localStorage.getItem(k);return v&&C5CATS.some(c=>c[0]===v)?v:d;}catch(e){return d;}};
const c5sv=(k,v)=>{try{localStorage.setItem(k,v);}catch(e){}};
G.c5bag=c5ld('ldtt-c5bag','all');G.c5cr=c5ld('ldtt-c5craft','all');

/* ===================== 2. VẬT PHẨM MỚI ===================== */
const C5ITEMS={
  // vũ khí
  spearBamboo:{n:'Giáo tre hơ lửa',t:'tool',tool:'spear',pow:2,ds:'Đọt tre vót nhọn rồi hơ lửa cho mũi cứng lại: giáo đầu tiên khi chưa có đá lửa. Đánh thú, đâm cá.'},
  spearBone:{n:'Lao mũi xương',t:'tool',tool:'spear',pow:2.5,ds:'Mũi xương thú mài nhọn buộc vào cán: nhẹ, sắc như lao của người Hòa Bình. Đánh thú, đâm cá.'},
  clubStone:{n:'Chùy đá buộc cán',t:'tool',tool:'club',pow:2.8,ds:'Hòn đá cuội khía rãnh, buộc chặt vào cán gỗ: đánh mạnh hơn gậy gộc.'},
  // dụng cụ
  knifeBamboo:{n:'Dao tre',t:'tool',tool:'knife',pow:1.4,ds:'Cật tre vát sắc: cắt thịt, chẻ nan được. Dùng thay dao đá lửa khi chế tạo, nhưng mau cùn.'},
  fishHook:{n:'Lưỡi câu xương',t:'res',c5c:'cu',ds:'Lưỡi câu mài từ xương thú. Có trong túi khi câu bằng cần tre: cá cắn câu nhanh hơn, ít sổng. Thỉnh thoảng mất lưỡi.'},
  trapBait:{n:'Mồi bẫy',t:'res',c5c:'cu',ds:'Mồi thơm gói lá. Có trong túi thì bẫy thòng lọng và đó bắt cá dính nhiều hơn (mỗi lần dính thêm tốn 1 mồi).'},
  whetstone:{n:'Đá mài cầm tay',t:'res',c5c:'cu',ds:'Hòn đá mài nhỏ mang theo người, thỉnh thoảng liếc lưỡi: rìu, dao, giáo lâu cùn hơn (đỡ hao 35%).'},
  mortarPestle:{n:'Cối chày đá nhỏ',t:'res',c5c:'cu',ds:'Cối đá lõm lòng và chày đá như ở hang Hòa Bình: tán thuốc, giã ít thóc ngay tại chỗ.'},
  bigBasket:{n:'Gùi mây lớn',t:'pack',pk:'back',slots:9,ds:'Gùi đan nan tre dày, quai da: đeo lưng, thêm 9 ô đồ (thay cho gùi nhỏ).'},
  hipBagBig:{n:'Túi da hai ngăn',t:'pack',pk:'hip',slots:6,ds:'Túi da thuộc khâu gân thú, hai ngăn: đeo hông, thêm 6 ô đồ.'},
  // đồ ăn, đồ uống
  grainRoast:{n:'Kê rang',t:'food',food:14,ds:'Hạt kê rang giòn trên than: để lâu không hỏng, mang đi rừng.'},
  eggRoast:{n:'Trứng nướng',t:'food',food:16,hp:2,ds:'Trứng vùi tro nóng cho chín: không lo đau bụng.'},
  saltFish:{n:'Cá ướp muối',t:'food',food:20,hp:2,ds:'Cá mổ sạch xát muối: để rất lâu không ôi.'},
  saltMeat:{n:'Thịt ướp muối',t:'food',food:26,hp:3,ds:'Thịt thái miếng xát muối: để rất lâu không ôi.'},
  snailSoup:{n:'Canh ốc chuối',t:'food',food:28,drink:20,hp:5,ds:'Ốc suối nấu với chuối xanh trong nồi đất: no lâu, đỡ khát.'},
  banhChung:{n:'Bánh chưng',t:'food',food:56,hp:8,ds:'Gạo, thịt gói lá buộc lạt, luộc trong nồi đất: tích Lang Liêu dâng vua Hùng. Rất no, để được vài ngày.'},
  lotusSweet:{n:'Chè hạt sen',t:'food',food:24,drink:14,hp:4,ds:'Hạt sen ninh với mật ong: ngọt mát, ăn vào thấy vui (thêm tinh thần).'},
  honeyWater:{n:'Nước mật ong',t:'drink',drink:45,food:4,hp:2,back:'flask',ds:'Nước sạch pha mật ong: giải khát, hồi sức.'},
  // thuốc
  herbPoultice:{n:'Lá thuốc đắp',t:'med',hp:8,cure:'wound',ds:'Rau má, ngải cứu giã nát đắp lên vết thương hở: mau liền, đỡ nhiễm trùng.'},
  turmericPowder:{n:'Bột nghệ mật ong',t:'med',hp:12,cure:'infect',ds:'Nghệ tán bột trong cối, trộn mật ong: bôi chữa nhiễm trùng.'},
  gingerHoney:{n:'Gừng ngâm mật',t:'med',hp:4,warm:14,cure:'cold',ds:'Gừng thái lát ngâm mật ong: ấm bụng, chữa cảm lạnh.'},
  // đồ mặc
  furHat:{n:'Mũ lông thú',t:'wear',slot:'head',warm:7,rain:0.2,dur:220,mat:'fur',ds:'Mũ da còn lông: giữ ấm đầu mùa đông, mưa nhỏ không thấm.'},
  furBoots:{n:'Ủng lông',t:'wear',slot:'feet',warm:9,foot:1,dur:260,mat:'fur',ds:'Ủng da lót lông: chân ấm khi đi tuyết, không dẫm gai.'},
  toothNecklace:{n:'Chuỗi răng thú',t:'wear',slot:'neck',warm:0,spirit:1.6,ds:'Răng nanh, xương thú khoan lỗ xâu dây: đeo vào thấy tự tin (tinh thần tăng dần).'},
  // khác
  hideDrum:{n:'Trống da cầm tay',t:'res',c5c:'khac',c5use:'drum',ds:'Thân gỗ khoét rỗng, căng da thú. Đánh trống: thêm tinh thần, hồi thể lực (mỗi vài giờ một lần).'}
};
for(const k in C5ITEMS)if(!ITEMS[k])ITEMS[k]=C5ITEMS[k];
Object.assign(EMO,{spearBamboo:'🎋',spearBone:'🦴',clubStone:'🔨',knifeBamboo:'🔪',fishHook:'🪝',trapBait:'🪤',whetstone:'🪨',mortarPestle:'🥣',bigBasket:'🧺',hipBagBig:'👝',
  grainRoast:'🌾',eggRoast:'🥚',saltFish:'🐟',saltMeat:'🥓',snailSoup:'🍲',banhChung:'🟩',lotusSweet:'🪷',honeyWater:'🍯',herbPoultice:'🌿',turmericPowder:'🧡',gingerHoney:'🫚',
  furHat:'🧢',furBoots:'🥾',toothNecklace:'🦷',hideDrum:'🥁'});
// độ bền công cụ (hệ thống mài lưỡi / gắn cán sẵn có)
if(typeof L4DUR==='object')Object.assign(L4DUR,{spearBamboo:1.8,spearBone:1.3,clubStone:1.0,knifeBamboo:2.0});
// đồ ăn tươi thì ôi (ngày); đồ ướp muối, rang khô thì không
if(typeof H3SP==='object')Object.assign(H3SP,{eggRoast:3,snailSoup:1.5,banhChung:6,lotusSweet:2});
if(typeof RATFOOD==='object')['grainRoast','banhChung'].forEach(k=>RATFOOD.add(k));

/* ---------- công đoạn ---------- */
Object.assign(WSTEP,{
  c5spearB:[['Chọn đọt tre già, thẳng','gather',0.7,'pick'],['Vót nhọn đầu','whittle',1.4,'chop'],['Hơ mũi trên lửa cho cứng','cook',1.6,'step']],
  c5bone:[['Đập xương, chọn mảnh dài','knap',1.2,'mine'],['Mài nhọn trên đá','grind',1.8,'step'],['Buộc vào cán','lash',1.2,'pick']],
  c5club:[['Khía rãnh quanh hòn cuội','knap',1.6,'mine'],['Chẻ đầu cán kẹp đá','carve',1.2,'chop'],['Buộc chặt bằng dây','lash',1.2,'pick']],
  c5knifeB:[['Chẻ cật tre','carve',1.2,'chop'],['Vát lưỡi bằng đá','grind',1.4,'step']],
  c5hook:[['Cưa mảnh xương nhỏ','carve',1.2,'chop'],['Mài cong thành lưỡi câu','grind',1.8,'step'],['Khía ngạnh, khoan lỗ buộc','whittle',1.0,'pick']],
  c5bait:[['Giã nát mồi','grind',1.0,'step'],['Gói lá, buộc sợi','lash',0.8,'pick']],
  c5whet:[['Chọn đá hạt mịn','gather',0.8,'pick'],['Mài phẳng mặt với cát và nước','grind',2.2,'step']],
  c5mortar:[['Chọn hòn đá lõm','gather',0.8,'pick'],['Ghè sâu lòng cối','knap',2.2,'mine'],['Mài nhẵn chày đá','grind',1.6,'step']],
  c5roast:[['Đặt phiến đá lên lửa','cook',0.8,'pick'],['Rang hạt, đảo đều tay','cook',2.0,'step']],
  c5salt:[['Mổ sạch, thái miếng','h3butcher',1.2,'chop'],['Xát muối thật đều','work',1.2,'pick'],['Xếp vào bọc lá','lash',0.8,'pick']],
  c5chung:[['Vo gạo, thái thịt','work',1.0,'pick'],['Gói lá, buộc lạt vuông vức','lash',1.6,'pick'],['Luộc trong nồi đất thật lâu','cook',3.0,'drink']],
  c5sweet:[['Ninh hạt sen','cook',1.6,'drink'],['Thêm mật ong, khuấy đều','cook',1.0,'step']],
  c5mix:[['Đổ vào bầu','work',0.6,'drink'],['Lắc đều','work',0.6,'pick']],
  c5pound:[['Đổ vào cối','work',0.6,'pick'],['Giã, tán thật mịn','grind',2.0,'step'],['Trộn đều','work',0.8,'pick']],
  c5drum:[['Khoét rỗng khúc gỗ','carve',2.2,'chop'],['Căng da ướt lên miệng','lash',1.4,'pick'],['Buộc dây, phơi cho da căng','work',1.0,'pick']],
  c5teeth:[['Chọn răng nanh, mảnh xương','gather',0.7,'pick'],['Khoan lỗ bằng mũi đá','grind',2.0,'step'],['Xâu thành chuỗi','lash',0.8,'pick']]});

/* ---------- công thức (giữ đúng kiểu mở khóa: req = đã thấy, lv = cấp kỹ năng, st = trạm, tool = cần có, age = thời đại) ---------- */
const C5RC=[
  {id:'spearBamboo',out:{spearBamboo:1},in:{bamboo:1},st:'campfire',req:['bamboo'],sk:'craft',steps:'c5spearB'},
  {id:'spearBone',out:{spearBone:1},in:{stick:2,bone:2,fiber:2},st:null,tool:'knife',req:['bone','stick'],lv:{craft:1},steps:'c5bone'},
  {id:'clubStone',out:{clubStone:1},in:{wood:1,stone:2,rope:1},st:null,req:['rope','stone'],lv:{craft:1},steps:'c5club'},
  {id:'knifeBamboo',out:{knifeBamboo:1},in:{bamboo:1,stone:1},st:null,req:['bamboo'],steps:'c5knifeB'},
  {id:'arrowBone',out:{arrow:3},in:{stick:2,bone:1,feather:2},st:null,tool:'knife',req:['feather','bone'],steps:'c5bone'},
  {id:'fishHook',out:{fishHook:2},in:{bone:1},st:null,tool:'knife',req:['bone','bamboo'],lv:{craft:1},steps:'c5hook'},
  {id:'trapBait',out:{trapBait:2},in:{berry:3,fiber:1},st:null,req:['berry','rope'],sk:'hunt',steps:'c5bait'},
  {id:'trapBaitF',out:{trapBait:3},in:{fish:1},st:null,req:['fish','rope'],sk:'hunt',steps:'c5bait'},
  {id:'whetstone',out:{whetstone:1},in:{stone:2,sand:2},st:'grind',req:['sand'],lv:{craft:1},steps:'c5whet'},
  {id:'mortarPestle',out:{mortarPestle:1},in:{stone:4,wood:1},st:null,tool:'hammer',req:['stone','hammer'],lv:{craft:2},steps:'c5mortar'},
  {id:'poundSmall',out:{rice:1},in:{paddy:3},st:null,tool:'mortarPestle',req:['paddy','mortarPestle'],sk:'farm',steps:'c5pound'},
  {id:'bigBasket',out:{bigBasket:1},in:{bambooStrip:12,rope:3,leather:1},st:'workbench',req:['bambooStrip','leather'],lv:{craft:2},steps:'mxWeave'},
  {id:'hipBagBig',out:{hipBagBig:1},in:{leather:4,sinew:2},st:null,tool:'needle',req:['leather','sinew'],lv:{craft:3},steps:'sew'},
  {id:'grainRoast',out:{grainRoast:1},in:{grain:3},st:'campfire',req:['grain'],sk:'cook',steps:'c5roast'},
  {id:'eggRoast',out:{eggRoast:1},in:{egg:1},st:'campfire',req:['egg'],sk:'cook'},
  {id:'saltFish',out:{saltFish:2},in:{fish:2,salt:1},st:null,req:['fish','salt'],sk:'cook',steps:'c5salt'},
  {id:'saltMeat',out:{saltMeat:2},in:{meat:2,salt:1},st:null,req:['meat','salt'],sk:'cook',steps:'c5salt'},
  {id:'snailSoup',out:{snailSoup:1},in:{snail:3,banana:1,water:1},st:'campfire',tool:'pot',req:['snail','pot'],sk:'cook',steps:'soup'},
  {id:'banhChung',out:{banhChung:2},in:{rice:3,meat:1,fiber:2,water:1},st:'campfire',tool:'pot',req:['rice','pot'],age:3,sk:'cook',steps:'c5chung'},
  {id:'lotusSweet',out:{lotusSweet:1},in:{lotusSeed:3,honey:1,water:1},st:'campfire',tool:'pot',req:['lotusSeed','honey'],sk:'cook',steps:'c5sweet'},
  {id:'honeyWater',out:{honeyWater:1},in:{honey:1,water:1},st:null,req:['honey','water'],sk:'cook',steps:'c5mix'},
  {id:'herbPoultice',out:{herbPoultice:1},in:{centella:1,mugwort:1},st:null,req:['centella','mugwort'],lv:{herb:1},sk:'herb',steps:'herb'},
  {id:'turmericPowder',out:{turmericPowder:1},in:{turmeric:2,honey:1},st:null,tool:'mortarPestle',req:['turmeric','honey'],lv:{herb:2},sk:'herb',steps:'c5pound'},
  {id:'gingerHoney',out:{gingerHoney:1},in:{ginger:2,honey:1},st:null,req:['ginger','honey'],sk:'herb',steps:'herb'},
  {id:'furHat',out:{furHat:1},in:{hide:2,rope:1},st:null,tool:'needle',req:['hide','needle'],lv:{craft:2},steps:'sew'},
  {id:'furBoots',out:{furBoots:1},in:{hide:3,leather:1,rope:1},st:'workbench',tool:'needle',req:['leather','needle'],lv:{craft:3},steps:'sew'},
  {id:'toothNecklace',out:{toothNecklace:1},in:{bone:3,fiber:1},st:null,tool:'knife',req:['bone'],lv:{craft:1},steps:'c5teeth'},
  {id:'hideDrum',out:{hideDrum:1},in:{hide:1,wood:2,rope:1},st:'carve',tool:'knife',req:['hide','wood'],lv:{craft:2},steps:'c5drum'}];
for(const r of C5RC)if(!RECIPES.some(x=>x.id===r.id)&&Object.keys(r.out).every(k=>ITEMS[k])&&Object.keys(r.in).every(k=>ITEMS[k]))RECIPES.push(r);

/* ---------- dụng cụ cùng loại thay nhau được khi chế tạo (dao tre/dao đồng thay dao đá lửa…) ---------- */
{const _rb=recipeBlock;recipeBlock=function(r){if(r&&r.tool&&invCount(r.tool)<1){const T=ITEMS[r.tool];if(T&&T.t==='tool'&&T.tool&&hasTool(T.tool))return _rb(Object.assign({},r,{tool:null}));}return _rb(r);};}
// mô hình cầm tay: mượn dáng công cụ cùng loại
const C5ALIAS={spearBamboo:'spear',spearBone:'spear',clubStone:'club',knifeBamboo:'knife'};
{const _m=model;model=function(spec){if(spec&&spec[0]==='tool'&&C5ALIAS[spec[1]])return _m(['tool',C5ALIAS[spec[1]]]);return _m(spec);};}

/* ---------- mồi bẫy ---------- */
{const _tt=trapTick;trapTick=function(gh){_tt(gh);try{if(invCount('trapBait')<1)return;for(const b of S.builds){if(b.prog!=null)continue;if(invCount('trapBait')<1)break;
  if(b.k==='trap'&&(S.tank[b.id]||0)<1&&Math.hypot(b.x-P.x,b.z-P.z)>=120&&Math.random()<gh*0.07){S.tank[b.id]=1;S.tank[b.id+'k']=Math.random()<0.6?'rabbit':'junglefowl';invTake('trapBait',1);uiToast('🪤 Mồi thơm dụ được thú sa bẫy thòng lọng.','');}
  else if(b.k==='fishTrap'&&(S.tank[b.id]||0)<3&&Math.random()<gh*0.1){S.tank[b.id]=(S.tank[b.id]||0)+1;invTake('trapBait',1);}}}catch(e){console.warn('mồi bẫy',e);}};}
/* ---------- lưỡi câu xương ---------- */
{const _rs=rodStart;rodStart=function(t){_rs(t);if(invCount('fishHook')>0&&G.act&&G.act.t&&G.act.t.type==='rod'){G.act.next*=0.6;G.act.c5hook=1;}};}
{const _rp=rodPull;rodPull=function(){const A=G.act;const hk=A&&A.t&&A.t.type==='rod'&&A.bite&&invCount('fishHook')>0;const f0=invCount('fish');const r=_rp();
  if(hk){if(invCount('fish')===f0&&Math.random()<0.45){give({fish:1},[A.t.x,4,A.t.z]);addXp('hunt',2);cnt('cnt','fish');uiToast('🪝 Lưỡi câu xương móc chặt: giữ được cá!','gold');save();}
    if(Math.random()<0.1){invTake('fishHook',1);uiToast('Cá to giật đứt mất một lưỡi câu xương.','');}}return r;};}
/* ---------- đá mài cầm tay: lưỡi lâu cùn ---------- */
{const _ht=hitTarget;hitTarget=function(t){const s=S.inv[S.sel],d0=s&&s.d!=null?s.d:100;_ht(t);try{if(s&&typeof L4DUR==='object'&&L4DUR[s.id]&&s.d!=null&&s.d<d0&&s.d>0&&invCount('whetstone')>0)s.d=+Math.min(100,s.d+(d0-s.d)*0.35).toFixed(1);}catch(e){}};}
/* ---------- trống da ---------- */
function c5Drum(){if(invCount('hideDrum')<1)return;const h=TNOW()*24;if(C5.drT&&h-C5.drT<3){uiToast('Tay còn mỏi, nghỉ chút rồi đánh trống tiếp.','');return;}C5.drT=h;
  try{auInit();if(AU.ctx)[110,110,165,110,0,110,165,220].forEach((f,i)=>{if(f)tone(f,0.18,'triangle',0.16,1,i*0.22);});}catch(e){}
  S.p.stam=Math.min(maxStam(),S.p.stam+10);try{if(typeof l4Spirit==='function')l4Spirit(6,1);}catch(e){}cnt('cnt','drum');uiToast('🥁 Tiếng trống da rộn ràng: lòng phấn chấn, thể lực hồi lại.','gold');uiHud(true);save();}
/* ---------- hình đồ mặc mới trên nhân vật ---------- */
{const _cl=charLook;charLook=function(){const L=_cl();if(S&&S.wear&&S.wear.feet==='furBoots')L.boots='#5a4430';return L;};}
if(typeof l4Decor==='function'){const _ld=l4Decor;l4Decor=function(){_ld();try{const R=P.rig,w=S.wear||{};if(!R||!P.char2||!R.head||!R.top)return;const K=K3,lay=isFP()&&G.on?1:0,add=(par,o)=>{o.traverse(m=>{m.layers.set(lay);if(m.isMesh)m.castShadow=true;});par.add(o);};
  if(typeof wearAttach!=='function'&&w.head==='furHat')add(R.top,K.group(K.cyl(6.3,6.7,3.4,'#6e5238',{y:-1.0},14),K.cyl(6.9,6.9,1.1,'#8a6a48',{y:-2.6},14)));
  if(typeof wearAttach!=='function'&&w.neck==='toothNecklace'){const g=K.group();for(let i=0;i<9;i++){const a=(i/9-0.5)*Math.PI*1.3;g.add(K.box(0.35,0.9,0.35,'#efe4c8',{x:Math.sin(a)*2.05,z:Math.cos(a)*1.85,y:-0.2-Math.abs(Math.cos(a/2))*0.3}));}add(R.head,g);}}catch(e){console.warn('craft5 trang phục',e);}};}

/* ===================== 1. BỘ LỌC TÚI ĐỒ & CHẾ TẠO ===================== */
function c5Chips(w,cur,count){return `<div class="chipsel c5f" data-w="${w}">${C5CATS.map(([k,n,ic])=>{const c=count?count[k]||0:null;return `<button class="tb sm${cur===k?' on':''}${c===0&&k!=='all'?' c5z':''}" data-a="c5f" data-w="${w}" data-k="${k}">${ic} ${n}${c!=null&&k!=='all'?` <small>${c}</small>`:''}</button>`;}).join('')}</div>`;}
function c5BagPost(){const p=$('#panel'),bd=p&&p.querySelector('.p-body');if(!bd||bd.querySelector('.c5f'))return;const cnt={};S.inv.forEach(s=>{if(s){const c=c5cat(s.id);cnt[c]=(cnt[c]||0)+1;}});
  const cur=G.c5bag||'all',anchor=bd.querySelector('.mxbag')||bd.querySelector('.grid6');if(!anchor)return;anchor.insertAdjacentHTML('beforebegin',c5Chips('bag',cur,cnt));
  bd.querySelectorAll('.sl[data-a="slot"][data-i]').forEach(el=>{const s=S.inv[+el.dataset.i];el.classList.toggle('c5off',cur!=='all'&&(!s||c5cat(s.id)!==cur));});
  const on=bd.querySelector('.c5f .tb.on');if(on&&on.scrollIntoView&&cur!=='all')try{on.parentNode.scrollLeft=on.offsetLeft-40;}catch(e){}}
const c5RcCat=id=>{const r=RECIPES.find(x=>x.id===id);return r?c5cat(Object.keys(r.out)[0]):'khac';};
function c5CraftApply(){const p=$('#panel');if(!p)return;const cur=G.c5cr||'all';let n=0,any=0;p.querySelectorAll('.rc[data-mxr]').forEach(c=>{any=1;if(cur!=='all'&&c5RcCat(c.dataset.mxr)!==cur)c.style.display='none';if(c.style.display!=='none')n++;});
  let e=p.querySelector('.c5none');if(any&&!n&&cur!=='all'&&!p.querySelector('.mxnone')){if(!e){const f=p.querySelector('.c5f');if(f)f.insertAdjacentHTML('afterend','<p class="muted c5none">Chưa có công thức nào thuộc nhóm này.</p>');}}else if(e)e.remove();}
function c5CraftPost(){const p=$('#panel'),bd=p&&p.querySelector('.p-body');if(!bd||bd.querySelector('.c5f'))return;const cards=[...bd.querySelectorAll('.rc[data-mxr]')];if(!cards.length)return;
  const cnt={};cards.forEach(c=>{const k=c5RcCat(c.dataset.mxr);cnt[k]=(cnt[k]||0)+1;});const anchor=bd.querySelector('.mxsearch')||bd.querySelector('.tabs');if(!anchor)return;
  anchor.insertAdjacentHTML('afterend',c5Chips('craft',G.c5cr||'all',cnt));c5CraftApply();}
if(typeof mxCraftFilter==='function'){const _f=mxCraftFilter;mxCraftFilter=function(){_f();try{c5CraftApply();}catch(e){}};}
{const _bh=bagHtml;bagHtml=function(){let h=_bh();const sel=G.selSlot,s=sel!=null&&S.inv[sel];if(s&&ITEMS[s.id]&&ITEMS[s.id].c5use==='drum')h=h.replace('<div class="row">','<div class="row"><button class="btn" data-a="c5drum">🥁 Đánh trống</button>');return h;};}
{const _uo=uiOpen;uiOpen=function(k,o,keep){const r=_uo.apply(this,arguments);try{if(G.panel==='bag'){if(!G.ptab||G.ptab==='bag')c5BagPost();else if(G.ptab==='craft')c5CraftPost();}}catch(e){console.warn('craft5 lọc',e);}return r;};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="c5f"],[data-a="c5drum"]');if(!b)return;e.stopImmediatePropagation();
  if(b.dataset.a==='c5drum'){c5Drum();return;}const w=b.dataset.w,k=b.dataset.k;sfx('pick');
  if(w==='bag'){G.c5bag=k;c5sv('ldtt-c5bag',k);}else{G.c5cr=k;c5sv('ldtt-c5craft',k);}uiOpenRefresh();},true);
/* ⇅ Xếp gọn: gom theo nhóm (dụng cụ, vũ khí, mặc, ăn, thuốc, vật liệu, khác) */
const C5ORD={cu:0,vk:1,mac:2,an:3,th:4,vl:5,khac:6};
if(typeof mxSort==='function'){const _ms=mxSort;mxSort=function(){const r=_ms.apply(this,arguments);try{const from=HOTN,list=S.inv.slice(from);const full=list.filter(Boolean),k=list.length;
  full.sort((a,b)=>(C5ORD[c5cat(a.id)]??9)-(C5ORD[c5cat(b.id)]??9));for(let i=0;i<k;i++)S.inv[from+i]=full[i]||null;uiHotbar();uiOpenRefresh();save();}catch(e){console.warn('craft5 xếp',e);}return r;};}
(function(){const st=document.createElement('style');st.textContent=`.c5f{margin:2px 0 8px;padding-bottom:2px}.c5f .tb small{opacity:.7;font-weight:600;margin-left:2px}.c5f .tb.c5z{opacity:.45}
.sl.c5off{opacity:.2;filter:grayscale(1)}.sl.c5off.on{opacity:.6}`;document.head.appendChild(st);})();
