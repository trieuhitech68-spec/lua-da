/* ===================== ĐỜI SỐNG THỜI SƠ KHAI (life4) =====================
   Mô-đun nạp sau hunt3: bọc (không sửa) các hàm cũ để thêm những gì con người tiền sử cần để sống:
   • Thân thể & thuốc men: vết thương hở phải rửa nước sôi và băng lá (không thì nhiễm trùng), gãy xương khi ngã cao (bó nẹp tre),
     tiêu chảy do nước bẩn, say nắng, ngứa cổ vì khoai môn sống, sốt cần nghỉ ngơi; bài thuốc sắc, giã, đắp từng bước; bảng Cơ thể.
   • Y phục: vải vỏ cây sui đập, xe sợi bằng dọi, khung dệt, áo vải gai, áo choàng lông, áo tơi lá cọ, nón lá, dép da, chuỗi hạt vỏ ốc,
     vòng đồng. Mỗi thứ có độ ấm, che mưa, độ bền (rách thì vá); hiện trên người nhân vật.
   • Ăn uống: luộc, nấu canh, nấu cơm nồi đất, cơm lam ống tre, cháo gừng, phơi khô trên giàn, ủ mắm trong chum.
     Lúa: tuốt lúa hoang ven đầm → ruộng nước (đắp bờ, dẫn nước, gieo mạ, nhổ mạ cấy, làm cỏ, gặt) → đập lúa → giã gạo.
     Khoai môn dại ven nước, trồng khoai trên luống.
   • Nước: hứng nước mưa vào bầu/ống tre, khát nhanh khi nắng nóng, làm lụng; nước suối dễ gây tiêu chảy.
   • Tinh thần & xã hội: thầy lang trong làng, bàn thờ tổ tiên, mộ táng nằm co rắc son, hội xuân, hội mùa với trống, kể chuyện bên lửa,
     vẽ mình, văn thân, kết duyên và sinh con (bộ lạc đông dần).
   • Nhịp sống: tỉnh táo/thiếu ngủ, làm trong bóng tối chậm và dễ đứt tay, mùa lũ ven sông (nhà sàn tránh lũ, lũ rút để lại phù sa).
   • Công cụ: độ bền, lưỡi cùn phải mài lại, gãy cán phải gắn cán mới (tra lưỡi, chèn nêm, buộc dây).
   • Thời đại: mỗi thời đại liệt kê điều kiện và kỹ thuật mở ra; sổ "Hướng dẫn sinh tồn".
   Trạng thái lưu: S.l4 {sp, wn, fr, wr, ferm, pad, fam, fl, ...}, S.p.rest, ô túi có .d (độ bền công cụ) và .w (độ bền áo cởi ra). */
const L4={t:0,thT:0,litT:0,lit:true,decT:0,hourAcc:0,po:new Map(),nw:new Map(),pT:-9,pBest:null,heatH:0,napT:0};
const l4S=()=>{if(!S.l4||typeof S.l4!=='object')S.l4={};const o=S.l4;if(o.sp==null)o.sp=60;o.wr=o.wr||{};o.ferm=o.ferm||{};o.pad=o.pad||{};o.ate=o.ate||[];o.fl=o.fl||0;return o;};
const l4Rain=()=>typeof isRaining==='function'?isRaining():(G.wxK||0)>0.4&&S.wx&&S.wx.type!=='clear'&&S.wx.type!=='cloudy';
const l4Cozy=()=>S.mode==='cozy';
const l4R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
/* ===================== 1. VẬT PHẨM MỚI ===================== */
Object.assign(ITEMS,{
  shell:{n:'Vỏ ốc',t:'res',ds:'Vỏ ốc ăn xong giữ lại: khoan lỗ xâu thành chuỗi hạt như người Hòa Bình, Bắc Sơn.'},
  salt:{n:'Muối',t:'res',ds:'Đổi từ người miền biển. Muối để ướp, ủ mắm, phơi khô cá thịt cho lâu hỏng.'},
  barkCloth:{n:'Vải vỏ cây sui',t:'res',ds:'Vỏ cây sui ngâm nước rồi đập bằng chày gỗ cho dãn mỏng thành tấm vải thô, nhẹ.'},
  yarn:{n:'Sợi gai se',t:'res',ds:'Xơ cây gai se thành sợi bằng dọi xe chỉ (đĩa đất nung xỏ que).'},
  cloth:{n:'Vải gai dệt',t:'res',ds:'Vải dệt trên khung dệt thắt lưng: bền, thoáng, may áo, váy.'},
  barkTunic:{n:'Áo vỏ cây',t:'wear',slot:'body',warm:6,rain:0.1,dur:110,mat:'bark',ds:'Áo vải vỏ cây đập: che nắng, đỡ trầy xước, hơi ấm. Mau rách khi ướt.'},
  clothTunic:{n:'Áo vải gai',t:'wear',slot:'body',warm:9,rain:0.15,dur:220,mat:'cloth',ds:'Áo vải gai dệt: thoáng mát mùa hè, mặc lót trong áo choàng mùa đông.'},
  furCloak:{n:'Áo choàng lông thú',t:'wear',slot:'back',warm:16,rain:0.3,dur:260,mat:'fur',ds:'Tấm da còn lông khoác vai: rất ấm, mưa nhỏ không thấm.'},
  rainCape:{n:'Áo tơi lá cọ',t:'wear',slot:'back',warm:3,rain:0.8,dur:140,mat:'leaf',ds:'Lá cọ xếp chồng như vảy cá, khâu vào dây vai: đi mưa, làm ruộng không ướt.'},
  leafHat:{n:'Nón lá sơ khai',t:'wear',slot:'head',warm:1,rain:0.35,sun:1,dur:170,mat:'leaf',ds:'Khung nan tre chóp nhọn lợp lá: che mưa, che nắng (tránh say nắng giữa trưa hè).'},
  sandals:{n:'Dép da buộc dây',t:'wear',slot:'feet',warm:2,dur:170,foot:1,mat:'hide',ds:'Đế da buộc dây qua cổ chân: không dẫm phải gai, đá sắc trong rừng.'},
  shellBeads:{n:'Chuỗi hạt vỏ ốc',t:'wear',slot:'neck',warm:0,spirit:1.2,ds:'Đồ trang sức: đeo vào thấy vui vẻ, tự tin (tinh thần tăng dần).'},
  bronzeBracelet:{n:'Vòng tay đồng',t:'wear',slot:'acc',warm:0,spirit:2,ds:'Vòng đồng thau Đông Sơn, có khi gắn nhạc đồng kêu leng keng.'},
  splint:{n:'Nẹp tre bó xương',t:'med',l4use:'splint',ds:'Hai thanh tre đệm lá, quấn sợi chặt quanh chỗ xương gãy. Dùng khi bị gãy xương.'},
  charcoalWater:{n:'Nước than củi',t:'med',drink:12,cure:'gut',ds:'Than củi giã mịn hòa nước đun sôi để nguội: cầm tiêu chảy.'},
  congee:{n:'Cháo gừng',t:'food',food:18,drink:16,warm:16,hp:3,cures:['gut','cold'],ds:'Gạo nấu nhừ với gừng: dễ tiêu, ấm bụng, chữa tiêu chảy và cảm lạnh.'},
  boiledMeat:{n:'Thịt luộc',t:'food',food:32,drink:8,hp:5,ds:'Luộc trong nồi đất: chín kỹ, mềm, giữ được nước luộc.'},
  fishSoup:{n:'Canh cá rau má',t:'food',food:26,drink:22,hp:5},
  riceCooked:{n:'Cơm nồi đất',t:'food',food:34,hp:3},
  comLam:{n:'Cơm lam',t:'food',food:38,hp:4,ds:'Gạo và nước cho vào ống tre non, nút lá chuối, vùi nướng bên lửa: thơm, mang đi rừng được lâu.'},
  mam:{n:'Mắm cá',t:'food',food:8,hp:3,ds:'Cá ủ muối trong chum nhiều ngày: để rất lâu không hỏng, ăn với cơm.'},
  taro:{n:'Khoai môn dại',t:'food',food:4,itch:1,ds:'Củ khoai môn: phải luộc hay nướng kỹ, ăn sống ngứa rát cổ.'},
  taroCooked:{n:'Khoai môn luộc',t:'food',food:26,hp:2},
  riceSheaf:{n:'Bó lúa',t:'res',ds:'Lúa gặt về bó lại: đập lấy thóc.'},
  paddy:{n:'Thóc',t:'res',ds:'Hạt lúa còn vỏ trấu: giã trong cối để lấy gạo. Cất trong chum, kho trên cột để tránh chuột.'},
  rice:{n:'Gạo',t:'food',food:3,ds:'Nấu cơm, cơm lam, cháo. Ăn sống chẳng no.'},
  seedRice:{n:'Thóc giống',t:'seed',ds:'Thóc chắc mẩy giữ làm giống: gieo mạ trong ruộng nước (không gieo trên luống khô).'}});
Object.assign(EMO,{shell:'🐚',salt:'🧂',barkCloth:'🟫',yarn:'🧶',cloth:'🧵',barkTunic:'👘',clothTunic:'👕',furCloak:'🧥',rainCape:'🌿',leafHat:'👒',sandals:'🩴',shellBeads:'📿',bronzeBracelet:'💍',
  splint:'🦯',charcoalWater:'⚫',congee:'🥣',boiledMeat:'🍖',fishSoup:'🍲',riceCooked:'🍚',comLam:'🎍',mam:'🫙',taro:'🥔',taroCooked:'🥔',riceSheaf:'🌾',paddy:'🌾',rice:'🍚',seedRice:'🌱'});
ITEMS.flask.n='Bầu/ống tre rỗng';ITEMS.salve.cure='infect';
Object.assign(ITEMS.coat,{dur:260,rain:0.2,mat:'hide'});Object.assign(ITEMS.boots,{dur:220,foot:1,mat:'hide'});Object.assign(ITEMS.furcoat,{dur:320,rain:0.3,mat:'fur'});
Object.assign(ST_N,{loom:'Khung dệt',mortar:'Cối giã gạo'});
['paddy','rice','seedRice','riceSheaf','taro'].forEach(k=>RATFOOD.add(k));
Object.assign(H3SP,{boiledMeat:3,fishSoup:1.5,riceCooked:2,comLam:4,taroCooked:3,congee:1.5});
CROP_DAYS.taro=2.4;CROP_DAYS.yam=2.8;
/* ---------- trạng thái cơ thể mới ---------- */
Object.assign(STATUS,{
  wound:{n:'Vết thương hở',d:'Vết cào, vết cắt còn hở: rửa bằng nước đun sôi để nguội rồi băng lá rau má, không thì dễ nhiễm trùng.',dur:30,col:'#d8825a'},
  infect:{n:'Nhiễm trùng',d:'Vết thương sưng tấy, có mủ, người hâm hấp sốt: mất máu dần. Đắp cao nghệ nha đam và nằm nghỉ.',dur:40,cure:'salve',col:'#c9a83a'},
  fracture:{n:'Gãy xương',d:'Ngã từ trên cao: đi khập khiễng, không chạy nhảy được. Bó nẹp tre rồi nghỉ ngơi cho xương liền.',dur:120,col:'#e8dcc8'},
  gut:{n:'Tiêu chảy',d:'Uống nước suối chưa đun: đau bụng, mất nước rất nhanh. Uống nước than củi, ăn cháo gừng, chỉ uống nước đã đun sôi.',dur:14,cure:'charcoalWater',col:'#b39a5e'},
  heat:{n:'Say nắng',d:'Làm lụng giữa trưa hè không đội nón: choáng váng, khát cháy cổ. Vào bóng râm, uống nước, đội nón lá.',dur:3,col:'#ffc23a'},
  itch:{n:'Ngứa cổ',d:'Ăn khoai môn sống: ngứa rát họng. Khoai môn phải luộc, nướng thật kỹ.',dur:1.5,col:'#c6d86a'},
  elated:{n:'Phấn chấn',d:'Tinh thần phơi phới: làm việc nhanh nhẹn hơn.',dur:999,col:'#8ce07a'},
  gloomy:{n:'Buồn chán',d:'Tinh thần sa sút: làm việc uể oải. Ngồi bên lửa, kể chuyện, đánh trống mở hội, đeo đồ trang sức, thắp hương tổ tiên.',dur:999,col:'#9a8ab8'},
  sleepy:{n:'Buồn ngủ',d:'Thức lâu quá: chậm chạp, mau mệt. Về chỗ ngủ hoặc ngồi nghỉ bên lửa.',dur:999,col:'#a98adf'},
  flooded:{n:'Mùa lũ',d:'Nước sông dâng: ruộng, nhà ven sông bị ngập. Nhà sàn, kho trên cột thì an toàn.',dur:999,col:'#5aa8e0'}});
const L4CHIP=['elated','gloomy','sleepy','flooded'];
BAR.push(['rest','😴','Tỉnh táo','#a98adf']);
/* ===================== 2. CÔNG THỨC & CÔNG ĐOẠN ===================== */
RECIPES.push(
  // thuốc
  {id:'splint',out:{splint:1},in:{bamboo:1,fiber:3},st:null,tool:'knife',req:['bamboo'],sk:'herb',steps:'splint'},
  {id:'splintS',out:{splint:1},in:{stick:4,fiber:3},st:null,req:['stick','fiber'],sk:'herb',steps:'splint'},
  {id:'charcoalWater',out:{charcoalWater:1},in:{charcoal:1,water:1},st:null,req:['charcoal','water'],sk:'herb',steps:'charc'},
  {id:'congee',out:{congee:1},in:{rice:1,ginger:1,water:1},st:'campfire',tool:'pot',req:['rice','ginger'],sk:'cook',steps:'congee'},
  // nấu nướng
  {id:'boiledMeat',out:{boiledMeat:1},in:{meat:1,water:1},st:'campfire',tool:'pot',req:['meat','pot'],sk:'cook',steps:'boil'},
  {id:'fishSoup',out:{fishSoup:1},in:{fish:1,water:1,centella:1},st:'campfire',tool:'pot',req:['fish','pot'],sk:'cook',steps:'soup'},
  {id:'riceCooked',out:{riceCooked:2},in:{rice:2,water:1},st:'campfire',tool:'pot',req:['rice','pot'],sk:'cook',steps:'boilRice'},
  {id:'comLam',out:{comLam:1},in:{rice:2,bamboo:1,water:1},st:'campfire',tool:'knife',req:['rice','bamboo'],sk:'cook',steps:'comlam'},
  {id:'taroCooked',out:{taroCooked:1},in:{taro:1,water:1},st:'campfire',tool:'pot',req:['taro','pot'],sk:'cook',steps:'boil'},
  {id:'taroRoast',out:{taroCooked:1},in:{taro:1},st:'campfire',req:['taro'],sk:'cook',steps:'roastRoot'},
  {id:'fishSun',out:{fishDried:1},in:{fish:1},st:'dryRack',req:['fish'],sk:'cook',steps:'sundry'},
  {id:'meatSun',out:{meatDried:1},in:{meat:1},st:'dryRack',req:['meat'],sk:'cook',steps:'sundry'},
  // lúa gạo
  {id:'thresh',out:{paddy:4},in:{riceSheaf:2},st:null,req:['riceSheaf'],sk:'farm',steps:'thresh'},
  {id:'pound',out:{rice:2},in:{paddy:3},st:'mortar',req:['paddy'],sk:'farm',steps:'pound'},
  {id:'seedKeep',out:{seedRice:2},in:{paddy:2},st:null,req:['paddy'],sk:'farm',steps:'seedKeep'},
  // vải vóc, áo mặc
  {id:'barkCloth',out:{barkCloth:1},in:{wood:2},st:null,tool:'knife',req:['wood','knife'],age:1,steps:'bark'},
  {id:'barkTunic',out:{barkTunic:1},in:{barkCloth:2,fiber:2},st:null,tool:'needle',req:['barkCloth'],age:1,steps:'sewBark'},
  {id:'yarn',out:{yarn:2},in:{fiber:4},st:null,req:['fiber','clay'],age:3,steps:'spin'},
  {id:'cloth',out:{cloth:1},in:{yarn:4},st:'loom',req:['yarn'],age:3,steps:'loomWeave'},
  {id:'clothTunic',out:{clothTunic:1},in:{cloth:2,fiber:1},st:null,tool:'needle',req:['cloth'],age:3,steps:'sewCloth'},
  {id:'furCloak',out:{furCloak:1},in:{hide:3,rope:1},st:null,tool:'needle',req:['hide','needle'],steps:'cloak'},
  {id:'rainCape',out:{rainCape:1},in:{fiber:8,rope:1},st:null,req:['fiber','rope'],steps:'cape'},
  {id:'leafHat',out:{leafHat:1},in:{fiber:4,stick:2},st:null,req:['fiber','stick'],steps:'hat'},
  {id:'sandals',out:{sandals:1},in:{hide:1,fiber:2},st:null,tool:'knife',req:['hide','knife'],steps:'sandal'},
  {id:'shellBeads',out:{shellBeads:1},in:{shell:5,fiber:1},st:null,tool:'knife',req:['shell'],age:1,steps:'beads'},
  {id:'bronzeBracelet',out:{bronzeBracelet:1},in:{bronze:1},st:'smelter',req:['bronze'],lv:{craft:4},steps:'cast'});
Object.assign(WSTEP,{
  splint:[['Chẻ hai thanh nẹp, vót nhẵn','whittle',1.0,'chop'],['Lót lá chuối, rêu cho êm','gather',0.7,'pick'],['Kéo thẳng chỗ gãy, đặt nẹp','work',0.9,'step'],['Quấn sợi chặt tay','lash',1.1,'pick']],
  charc:[['Giã than củi thật mịn','grind',1.2,'step'],['Hòa bột than vào nước đun sôi để nguội','cook',0.8,'drink'],['Để lắng, chắt lấy nước','work',0.6,'drink']],
  decoct:[['Rửa sạch lá thuốc','work',0.8,'drink'],['Thái nhỏ, cho vào nồi đất','work',0.8,'pick'],['Sắc lửa nhỏ: ba bát nước còn một','cook',2.2,'drink'],['Chắt thuốc ra bầu','cook',0.7,'drink']],
  salveS:[['Rửa củ nghệ, bóc vỏ','work',0.8,'drink'],['Giã nát nghệ trên đá','grind',1.6,'step'],['Rạch nha đam lấy nhựa trong','work',0.9,'pick'],['Trộn đều thành cao, gói lá chuối','lash',0.9,'pick']],
  bandS:[['Rửa sạch lá rau má','work',0.8,'drink'],['Giã dập lá','grind',1.2,'step'],['Đặt lên lá chuối, quấn sợi thành cuộn băng','lash',1.1,'pick']],
  teaS:[['Đập dập củ gừng','knap',0.8,'mine'],['Đun sôi trong nồi','cook',1.8,'drink'],['Rót ra bầu, uống nóng','cook',0.6,'drink']],
  congee:[['Vo gạo','work',0.8,'drink'],['Đập gừng, thái sợi','knap',0.7,'mine'],['Ninh nhỏ lửa cho gạo nở bung','cook',2.4,'drink'],['Khuấy đều, múc ra bát','cook',0.7,'drink']],
  boil:[['Rửa sạch, chặt miếng vừa','h3butcher',1.0,'chop'],['Đặt nồi đất lên ba hòn đá, đổ nước','cook',0.8,'pick'],['Luộc sôi kỹ, hớt bọt','cook',2.3,'drink'],['Vớt ra lá chuối','cook',0.6,'pick']],
  soup:[['Làm sạch cá, bỏ ruột','h3butcher',1.1,'chop'],['Đun sôi nước trong nồi','cook',1.2,'drink'],['Thả cá, nêm rau má','cook',1.6,'drink'],['Múc ra bát','cook',0.6,'drink']],
  boilRice:[['Vo gạo cho sạch cám','work',0.8,'drink'],['Đổ nước ngập đốt ngón tay','cook',0.6,'drink'],['Đun sôi, rồi ủ than cho cơm chín đều','cook',2.4,'step'],['Xới cơm','cook',0.6,'pick']],
  comlam:[['Chặt ống tre non, chừa một mắt','carve',1.1,'chop'],['Vo gạo, đổ vào ống cùng nước','work',0.9,'drink'],['Nút miệng ống bằng lá chuối','lash',0.6,'pick'],['Vùi nướng bên than, xoay đều','cook',2.4,'step'],['Chẻ vỏ ống, lấy cơm','carve',0.8,'chop']],
  roastRoot:[['Rửa củ','work',0.7,'drink'],['Vùi củ vào tro nóng','cook',0.8,'step'],['Nướng chín kỹ, lăn đều','cook',2.4,'step']],
  sundry:[['Mổ, bỏ ruột, xẻ mỏng','h3butcher',1.2,'chop'],['Xát tro bếp (hoặc muối) cho khỏi ruồi','work',0.8,'pick'],['Căng lên giàn phơi nắng gió','lash',0.9,'pick'],['Trở mặt, phơi tới khi khô cong','work',2.6,'step']],
  thresh:[['Ôm bó lúa đập mạnh lên phiến đá','knap',1.8,'mine'],['Giũ rơm, nhặt bông sót','gather',1.0,'pick'],['Sàng sảy cho bay hạt lép','work',1.2,'step']],
  pound:[['Đổ thóc vào lòng cối','gather',0.6,'pick'],['Giã chày đều tay cho tróc trấu','knap',2.4,'mine'],['Sàng sảy bỏ trấu, cám','work',1.2,'step']],
  seedKeep:[['Phơi thóc thật khô','work',1.0,'step'],['Sàng chọn hạt chắc mẩy','work',1.0,'pick'],['Gói vào lá, cất nơi khô ráo','lash',0.6,'pick']],
  bark:[['Chọn cây sui, khoanh quanh vỏ','h3inspect',0.8,'pick'],['Bóc trọn tấm vỏ','carve',1.2,'chop'],['Ngâm nước cho vỏ mềm, cạo lớp vỏ ngoài','work',1.2,'drink'],['Đập vỏ bằng chày gỗ trên đá kê cho dãn mỏng','knap',2.4,'mine'],['Phơi khô, giũ thành tấm vải','work',0.9,'pick']],
  sewBark:[['Đo, cắt tấm vải vỏ cây','work',0.9,'pick'],['Khoét cổ, gấp mép','work',0.8,'pick'],['Khâu hai bên sườn bằng kim xương','lash',1.8,'pick']],
  spin:[['Tước xơ cây gai, phơi khô','gather',1.0,'pick'],['Nặn, nung đĩa dọi xe chỉ, xỏ que','work',0.8,'pick'],['Thả dọi quay tít, kéo xơ thành sợi','lash',2.2,'pick'],['Quấn sợi thành cuộn','lash',0.7,'pick']],
  loomWeave:[['Mắc sợi dọc lên khung, buộc vào cột','lash',1.2,'pick'],['Vòng dây khung qua lưng, ngồi căng sợi','sit',0.8,'step'],['Luồn sợi ngang, dập go','lash',2.6,'pick'],['Dệt hết tấm, cắt khỏi khung','work',0.9,'pick']],
  sewCloth:[['Cắt vải theo người','work',0.9,'pick'],['Khâu thân áo bằng kim xương','lash',2.0,'pick'],['Viền cổ, thắt dây lưng','lash',0.9,'pick']],
  cloak:[['Cạo sạch mặt trong tấm da','work',1.4,'step'],['Ghép mảnh da, khâu bằng kim xương','lash',2.0,'pick'],['Kết dây buộc trước ngực','lash',0.8,'pick']],
  cape:[['Phơi héo lá cọ','work',0.8,'pick'],['Xếp lá chồng mép như vảy cá','lash',1.6,'pick'],['Khâu lá vào dây vai','lash',1.4,'pick'],['Tỉa gọn mép áo tơi','work',0.6,'pick']],
  hat:[['Vót nan tre làm vành và khung chóp','whittle',1.2,'chop'],['Xếp lá lên khung','lash',1.2,'pick'],['Khâu lá bằng sợi','lash',1.2,'pick'],['Kết quai đội','lash',0.5,'pick']],
  sandal:[['Cắt đế da theo bàn chân','work',1.0,'pick'],['Đục lỗ xỏ dây','work',0.7,'pick'],['Bện quai, buộc qua cổ chân','lash',1.1,'pick']],
  beads:[['Rửa sạch vỏ ốc','work',0.7,'drink'],['Khoan lỗ bằng mũi đá và cát','grind',2.0,'step'],['Mài nhẵn mép','grind',1.0,'step'],['Xâu sợi, thắt nút','lash',0.8,'pick']]});
{const st={medicine:'decoct',mintwater:'decoct',salve:'salveS',bandage:'bandS',tea:'teaS'};for(const k in st){const r=RECIPES.find(x=>x.id===k);if(r)r.steps=st[k];}}
// thêm trao đổi muối, đồ thuốc
TRADES.gatherer.push([{fish:3},{salt:2}]);TRADES.chief.push([{rice:4},{salt:3}]);
/* ---------- thầy lang trong làng ---------- */
NPCDEF.push({n:'Bà Mo Sen',role:'healer',seed:97,sex:'f'});ROLEN.healer='Thầy lang';SKILL_OF.healer='herb';
TRADES.healer=[[{meat:2},{salve:1}],[{fish:2},{bandage:2}],[{flower:3},{medicine:1}],[{berry:5},{splint:1}],[{rice:2},{charcoalWater:1}],[{hide:1},{salt:1}]];
TALK.healer=['Vết thương hở phải rửa nước đã đun sôi để nguội, rồi đắp rau má giã nát. Bẩn thì sinh mủ, sốt, có khi mất mạng.','Sốt thì nằm nghỉ, uống thuốc ngải. Cứ cố làm thì bệnh dây dưa mãi.',
  'Ngã gãy chân thì kéo cho thẳng, nẹp hai thanh tre, quấn chặt. Nằm yên ít hôm xương mới liền.','Nước suối uống sống dễ đi ngoài. Đun sôi, hứng nước mưa mà uống. Đi ngoài thì giã than củi hòa nước sôi để nguội.',
  'Trưa hè ra đồng phải đội nón. Say nắng thì vào chỗ râm, uống nước, chườm nước mát.','Tổ tiên ta chôn người chết nằm co như đứa trẻ trong bụng mẹ, rắc son đỏ, chôn theo rìu đá: để họ sang thế giới bên kia.'];
/* ===================== 3. CÔNG TRÌNH MỚI ===================== */
BUILD.push(
  {id:'loom',n:'Khung dệt đơn giản',cat:'co',kind:'obj',fp:[1,1],small:1,cost:{stick:6,wood:2,rope:2},st:'loom',req:['yarn'],age:3,d:'Khung dệt thắt lưng (dệt ngồi): một đầu buộc vào cột, đầu kia vòng qua lưng người dệt để căng sợi dọc, rồi luồn sợi ngang. Dọi xe chỉ và vết vải in trên gốm Phùng Nguyên cho thấy người xưa đã biết dệt.'},
  {id:'mortar',n:'Cối chày giã gạo',cat:'co',kind:'obj',fp:[1,1],small:1,cost:{wood:4,stone:2},st:'mortar',req:['paddy'],age:2,d:'Khúc gỗ khoét lòng làm cối, chày gỗ dài: giã thóc cho tróc trấu thành gạo. Cối chày giã gạo còn khắc trên mặt trống đồng.'},
  {id:'paddy',n:'Ruộng lúa nước',cat:'nong',kind:'obj',fp:[2,2],cost:{},req:['seedRice'],age:2,d:'Ruộng nhỏ có bờ giữ nước, đặt sát suối/hồ hoặc cạnh mương có nước. Gieo mạ → nhổ mạ cấy → giữ nước, làm cỏ → gặt. Mưa và mương giúp ruộng đủ nước; mùa đông lúa ngừng lớn.'},
  {id:'altar',n:'Bàn thờ tổ tiên',cat:'trang',kind:'obj',fp:[1,1],small:1,cost:{stone:6,wood:2,pot:1},req:['pot'],age:2,d:'Phiến đá kê làm bàn thờ, nồi gốm cắm hương: mỗi ngày dâng lễ (đồ ăn, hoa) nhớ ơn tổ tiên, lòng thanh thản (tinh thần tăng).'},
  {id:'tomb',n:'Mộ táng tổ tiên',cat:'trang',kind:'obj',fp:[1,2],cost:{stone:12,ochre:2,flower:2},req:['ochre'],age:1,d:'Mộ kiểu Hòa Bình: người khuất nằm co, rắc son đỏ, chôn theo công cụ đá; kè đá phủ trên. Mỗi mùa tảo mộ, thắp hương để tưởng nhớ.'});
// ruộng nước dựng theo công đoạn (dùng cơ chế công trường của build3)
{const S_=(n,sn,c,o)=>Object.assign({n,sn,c:c||{}},o||{});
  STG.paddy=[S_('Đắp bờ ruộng bằng đất sét, nện chặt','Đắp bờ',{clay:4},{tool:'dig',w:.4,ov:'l4_pbund'}),S_('Cuốc xới, san phẳng lòng ruộng','Làm đất',{},{tool:'dig',w:.35,ov:'l4_pbund'}),S_('Khơi nước vào, ngâm cho bùn nhuyễn','Ngâm bùn',{stone:2},{w:.25,ov:'l4_pbund'})];
  let c=0;STG.paddy._cum=STG.paddy.map(s=>(c+=s.w));STG.paddy._cum[2]=1;const d=pieceDef('paddy'),cost={};STG.paddy.forEach(s=>{for(const k in s.c)cost[k]=(cost[k]||0)+s.c[k];});d.cost=cost;
  d.d+=' Công đoạn: '+STG.paddy.map((s,i)=>(i+1)+'. '+s.sn+(s.tool?' ('+TOOLN[s.tool]+')':'')).join(' → ')+'.';}
/* ===================== 4. MÔ HÌNH ===================== */
const L4M={
  loom:()=>{const K=K3;return K.group(K.cyl(1.6,1.8,30,'wood',{x:-14,z:-6}),K.cyl(1.6,1.8,30,'wood',{x:14,z:-6}),K.cyl(1.2,1.2,30,'dwood',{y:28,z:-6,rz:Math.PI/2,center:1}),
    ...[-10,-6,-2,2,6,10].map(x=>K.box(0.35,0.35,22,'#e8dcc0',{x,y:24,z:5,rx:-0.95,center:1})),K.box(24,1.2,7,'#c9b48a',{y:9,z:14,rx:-0.3,center:1}),K.cyl(1,1,24,'dwood',{y:12,z:16,rz:Math.PI/2,center:1}),K.box(10,2,10,'#8a6a44',{y:0,z:18}));},
  mortar:()=>{const K=K3;return K.group(K.cyl(7,8,14,'wood',{},10),K.cyl(5.4,5.4,0.6,'#3a2a1a',{y:14},10),K.cyl(1.4,1.6,34,'dwood',{x:4,y:12,rz:-0.35},6),K.cyl(6,4,5,'#b89a5a',{x:-13,z:6},9));},
  paddy:()=>{const K=K3,a=[K.box(78,1.4,78,'#5a4630',{y:-0.6})];[[0,-38,78,4],[0,38,78,4],[-38,0,4,78],[38,0,4,78]].forEach(([x,z,w,d])=>a.push(K.box(w,4,d,'#7a5e3a',{x,z,y:-0.5})));return K.group(a);},
  altar:()=>{const K=K3;return K.group(K.ico(5,'stone',{x:-8,y:3,sy:0.8},0,0.2,3),K.ico(5,'stone',{x:8,y:3,sy:0.8},0,0.2,5),K.box(26,3,14,'#8a8478',{y:7}),K.cyl(3.6,2.8,6,'clay',{y:10},10),
    ...[-1,0,1].map(i=>K.cyl(0.25,0.25,9,'#c9a25a',{x:i*1.2,y:15,rz:i*0.12})),K.sphere(2.2,'#c0392b',{x:-8,y:12},8,6),K.sphere(2,'#e8c25a',{x:8,y:12},8,6),K.cyl(1.6,2,7,'wood',{x:0,y:10,z:-4},8));},
  tomb:()=>{const K=K3,a=[];const R=b3rng(7);for(let i=0;i<14;i++){const x=(R()-0.5)*30,z=(R()-0.5)*62;a.push(K.ico(4+R()*3,R()<0.5?'stone':'dstone',{x,z,y:2+R()*2,sy:0.6},0,0.35,i+1));}
    a.push(K.ico(15,'#8a5a3a',{y:0,sx:1,sz:2,sy:0.35},1,0.2,9),K.box(12,0.4,26,'#b8321e',{y:5}),K.cyl(1,1.2,16,'#8a8478',{z:-30,y:0}));return K.group(a);},
  l4_pbund:()=>{const K=K3,a=[K.box(76,0.8,76,'#6a5236',{y:-0.4})];[[0,-38,78,3],[0,38,78,3],[-38,0,3,78],[38,0,3,78]].forEach(([x,z,w,d])=>a.push(K.box(w,3,d,'#8a6a42',{x,z,y:-0.5})));return K.group(a);},
  crop:(k,st)=>{const K=K3,s=0.4+st*0.22,a=[];const n=k==='taro'?3:4;for(let i=0;i<n;i++){const an=i/n*6.283;a.push(K.cyl(0.5,0.7,10*s,k==='taro'?'#5a8a3a':'#4a7a2a',{x:Math.cos(an)*2*s,z:Math.sin(an)*2*s,rz:Math.cos(an)*0.4,rx:Math.sin(an)*0.4}));
      a.push(K.sphere(k==='taro'?6*s:3.4*s,k==='taro'?'#4f8f3a':'#5a9a34',{x:Math.cos(an)*6*s,y:10*s,z:Math.sin(an)*6*s,sy:0.18,rz:Math.cos(an)*0.5,rx:Math.sin(an)*0.5},8,4));}
    if(st>=3)a.push(K.ico(3,k==='taro'?'#8a6a5a':'#9a7448',{y:1,sy:0.6},0,0.3,4));return K.group(a);}};
B3M.l4_pbund=L4M.l4_pbund;
const L4P=['loom','mortar','paddy','altar','tomb'];
{const _model=model;model=function(spec){try{if(K3.ok){if(spec[0]==='piece'&&L4P.includes(spec[1]))return L4M[spec[1]]();if(spec[0]==='crop'&&(spec[1]==='taro'||spec[1]==='yam'))return L4M.crop(spec[1],spec[2]|0);}}catch(e){console.warn('mô hình life4',spec,e);}return _model(spec);};}
/* ===================== 5. THỜI ĐẠI: ĐIỀU KIỆN, KỸ THUẬT MỞ RA, KHÓA THEO THỜI ĐẠI ===================== */
const l4c=k=>S.cnt[k]||0;
const L4AGE=[
  {need:[],tech:['Ghè đẽo đá cuội: rìu, dao, giáo đá lửa','Hái quả, rau, nấm; đào củ mài, khoai môn; tuốt lúa hoang ven đầm','Khoan gỗ lấy lửa, nướng thịt cá, hun khói','Lều nghiêng, hang đá, ổ lá','Nón lá, áo tơi lá cọ, dép da, áo choàng lông','Băng lá rau má, nẹp tre bó xương, thuốc ngải cứu']},
  {need:[['Dựng một bếp lửa',()=>l4c('build:campfire')>0],['Ngủ qua một đêm',()=>l4c('cnt:sleep')>0],['Hái 4 cây thuốc',()=>l4c('cnt:herb')>=4]],tech:['Đập vỏ cây sui làm vải, may áo vỏ cây','Khoan vỏ ốc xâu chuỗi hạt','Mộ táng nằm co rắc son đỏ, tảo mộ','Vẽ mình bằng son đất đỏ','Tranh vẽ vách hang']},
  {need:[['Nung được nồi gốm',()=>l4c('craft:pot')>0],['Lợp 4 tấm mái',()=>l4c('build:roof')>=4]],tech:['Rìu mài lưỡi Bắc Sơn','Đồ gốm: luộc, nấu canh, nấu cơm, cháo','Ruộng lúa nước: gieo mạ, nhổ mạ cấy, làm cỏ, gặt','Đập lúa, cối chày giã gạo, cơm lam ống tre','Bàn thờ tổ tiên']},
  {need:[['Thu hoạch 6 lần',()=>l4c('cnt:harvest')>=6],['Dựng cột vật tổ',()=>l4c('build:totem')>0]],tech:['Xe sợi bằng dọi, khung dệt, áo vải gai','Ủ mắm cá trong chum','Văn thân (xăm mình) như người Lạc Việt','Làng định cư, nuôi gà lợn, gia đình đông con','Hội xuân, hội mùa với trống']},
  {need:[['Luyện một thỏi đồng thau',()=>l4c('craft:bronze')>0]],tech:['Đúc rìu, giáo, dao, liềm, cuốc đồng','Khuôn đúc đá hai mang, mũi tên đồng','Trống đồng Đông Sơn','Vòng tay đồng']}];
const l4AgeOk=x=>(S.age||0)>=(x.age||0);
{const _rk=recipeKnown;recipeKnown=function(r){return _rk(r)&&l4AgeOk(r);};}
{const _bk=buildKnown;buildKnown=function(b){return _bk(b)&&l4AgeOk(b);};}
{const _lh=lockHint;lockHint=function(b){if(!l4AgeOk(b))return 'Cần bước sang '+AGES[b.age].n;return _lh(b);};}
{const _ua=uiAge;uiAge=function(i){_ua(i);const A=L4AGE[i];if(A)setTimeout(()=>uiToast('🏺 Kỹ thuật mới của '+AGES[i].n+': '+A.tech.slice(0,3).join('; ')+'… (xem 🧍 Cơ thể → Thời đại)','idea'),1600);};}
/* ===================== 6. LƯU / TẢI ===================== */
{const _fs=fixSave;fixSave=function(o){o=_fs(o);if(o&&o.p){if(o.p.rest==null)o.p.rest=100;}return o;};}
/* ===================== 7. THÂN THỂ: VẾT THƯƠNG, GÃY XƯƠNG, BỆNH ===================== */
{const _as=addStatus;addStatus=function(k,h){const had=!!S.st[k];_as(k,h);if(!STATUS[k])return;const L=l4S();
  if(k==='bleed'||k==='wound'){if(!S.st.wound||!L.wn){if(k==='bleed')_as('wound');L.wn={c:0,b:0,h:0};}else{L.wn.c=0;L.wn.b=0;}if(!had&&G.on&&!G.l4wTip){G.l4wTip=1;setTimeout(()=>uiToast('🩹 Mở 🧍 Cơ thể để rửa và băng vết thương.',''),900);}}
  if(k==='fracture'&&!had)L.fr={spl:0};if(k==='infect'&&!S.st.fever)_as('fever',12);};}
function l4Resting(){return !!(G.sit||G.sleeping)&&!G.work&&!G.act;}
function l4Sick(){return ['fever','infect','gut','cold','poison','fracture','heat','bleed'].some(k=>S.st[k]);}
// chỗ có ánh sáng: ban ngày, cầm đuốc, gần lửa đang cháy, gần bếp làng
function l4LitCalc(){if(!isNight())return true;if(P.toolId==='torch')return true;for(const f of G.flames){if(!f.off&&Math.hypot(f.x-P.x,f.z-P.z)<150)return true;}if(G.vfire&&Math.hypot(G.vfire.x-P.x,G.vfire.z-P.z)<200)return true;return false;}
function l4NearFire(){for(const f of G.flames){if(f.off)continue;const b=BYID.get(f.id),d=b&&pieceDef(b.k);if(d&&d.warm&&Math.hypot(f.x-P.x,f.z-P.z)<120)return true;}return !!(G.vfire&&Math.hypot(G.vfire.x-P.x,G.vfire.z-P.z)<120);}
function l4RainProt(){let k=1;for(const s in S.wear){const I=ITEMS[S.wear[s]];if(I&&I.rain)k*=1-I.rain;}return Math.min(0.92,1-k);}
function l4HasSun(){const h=S.wear.head;return !!(h&&ITEMS[h]&&ITEMS[h].sun);}
// mỗi khung hình: phần nhẹ; phần nặng (biome, ánh sáng, nắng) cứ 0,25–2 giây một lần
{const _bt=bodyTick;bodyTick=function(dt){const p=S.p,wet0=p.wet,w0=p.water;_bt(dt);if(!G.on)return;const L=l4S(),gh=dt*24/DAY_SEC,cozy=l4Cozy();if(p.rest==null)p.rest=100;
  // áo tơi, nón che mưa
  if(p.wet>wet0&&l4Rain()&&wdAt(P.x,P.z)<=1)p.wet=wet0+(p.wet-wet0)*(1-l4RainProt());
  // khát theo thời tiết, việc nặng
  const T=G.tempC!=null?G.tempC:20,day=!isNight(),rn=l4Rain();let roof=null;const R_=()=>roof==null?(roof=underRoof(P.x,P.z)):roof;let xw=(G.running?2.4:0)+(G.work||G.act?0.9:0)+(T>30&&day&&!l4HasSun()&&!R_()?1.4:0)+(S.st.gut?4.5:0)+(S.st.heat?3:0);if(rn&&!R_())xw-=0.8;
  if(p.water<w0||xw<0)p.water=clamp(p.water-gh*xw*(cozy?0.6:1),0,100);if(S.st.gut)p.food=Math.max(0,p.food-gh*1.2);
  // tỉnh táo: thức lâu thì buồn ngủ
  if(!G.sleeping){let dr=3.6+(G.work||G.act?1.3:0)+(G.running?2:0);if(G.sit)dr=-(L4.fire?6:3);p.rest=clamp(p.rest-gh*dr*(cozy?0.7:1),0,100);}
  // bệnh nặng: mất máu
  let dmg=0;if(S.st.infect)dmg+=cozy?0.04:0.14;if(S.st.heat)dmg+=cozy?0:0.05;if(p.rest<4&&!cozy)dmg+=0.05;if(dmg>0)p.hp=Math.max(0,p.hp-dmg*dt);
  // hồi phục theo nghỉ ngơi
  const rest=l4Resting(),busy=!!(G.work||G.act||G.running);
  if(S.st.fever){if(rest)S.st.fever-=gh*(L4.fire?2:1.4);else if(busy)S.st.fever+=gh*0.6;}
  if(S.st.wound&&L.wn&&L.wn.b)S.st.wound-=gh*1.6;
  if(S.st.fracture){const fr=L.fr||(L.fr={spl:0});if(fr.spl)S.st.fracture-=gh*(rest?2.2:0.9);else if(busy||(P.speed||0)>8)S.st.fracture+=gh*0.3;}
  if(S.st.heat&&(!day||wdAt(P.x,P.z)>1||R_()))S.st.heat-=gh*2;
  L.ghAcc=(L.ghAcc||0)+gh;
  // phần chậm
  L4.t+=dt;if(L4.t<0.25)return;const dtt=L4.t;L4.t=0;const ghh=L.ghAcc;L.ghAcc=0;
  if(G.t>L4.litT){L4.litT=G.t+0.5;L4.lit=l4LitCalc();L4.fire=l4NearFire();}
  l4BodySlow(ghh,dtt);};}
function l4BodySlow(gh,dt){const L=l4S(),p=S.p,cozy=l4Cozy(),si=seasonIdx(),T=G.tempC!=null?G.tempC:20;
  // nhiễm trùng khi vết thương bẩn
  if(S.st.wound&&L.wn){const w=L.wn;w.h+=gh;if(!S.st.infect&&w.h>3){const base=w.c>=1?(w.b?0:0.008):w.c>0?0.03:0.07,pr=gh*base*(cozy?0.4:1)*((p.clean??90)<25?1.6:1);if(Math.random()<pr){addStatus('infect');uiToast('🦠 Vết thương bẩn đã sưng mủ: nhiễm trùng! Đắp cao nghệ nha đam, nằm nghỉ.','bad');}}}
  else if(!S.st.wound)L.wn=null;if(!S.st.fracture)L.fr=null;
  // say nắng: làm việc giữa trưa hè không nón
  const noon=S.hour>=11&&S.hour<=15.5,expo=si===1&&noon&&T>29&&!underRoof(P.x,P.z)&&wdAt(P.x,P.z)<1&&!l4HasSun()&&(G.work||G.act||G.running);
  if(expo){L4.heatH+=gh*(p.water<40?1.6:1);if(L4.heatH>1.3&&!S.st.heat){addStatus('heat');L4.heatH=0;}}else L4.heatH=Math.max(0,L4.heatH-gh*2);
  // đi chân đất trong rừng, bãi đá: dẫm gai
  if((P.speed||0)>20&&!G.swim&&!(S.wear.feet&&ITEMS[S.wear.feet]&&ITEMS[S.wear.feet].foot)){L4.footAcc=(L4.footAcc||0)+dt;if(L4.footAcc>2){L4.footAcc=0;const b=biome(P.x,P.z);if((b==='forest'||b==='rock'||b==='peak')&&Math.random()<(G.running?0.02:0.008)*(cozy?0.5:1)){S.p.hp=Math.max(1,S.p.hp-3);addStatus('wound',10);uiToast('🦶 Dẫm phải gai nhọn! Làm đôi dép da mà đi rừng.','bad');}}}
  // ngủ gật
  if(p.rest<8&&!G.sleeping&&G.t>L4.napT){L4.napT=G.t+25;uiToast('😪 Mắt díp lại… phải ngủ thôi (về lều, giường hoặc ngồi nghỉ bên lửa).','bad');}
  // nhãn trạng thái tinh thần, buồn ngủ, lũ
  const want={elated:L.sp>=72,gloomy:L.sp<25,sleepy:p.rest<30,flooded:(L.fl||0)>=0.6};let ch=0;for(const k of L4CHIP){if(want[k]&&!S.st[k]){S.st[k]=999;ch=1;}else if(!want[k]&&S.st[k]){delete S.st[k];ch=1;}}if(ch)uiHud(true);}
// thể lực tối đa, tốc độ làm việc, việc nặng
{const _ms=maxStam;maxStam=function(){let m=_ms();const r=S.p.rest??100;if(r<30)m-=15;if(r<12)m-=15;if(S.st.infect)m-=20;if(S.st.gut)m-=15;if(S.st.heat)m-=20;if(S.st.fracture)m-=15;return Math.max(30,m);};}
{const _ns=needSlow;needSlow=function(){let k=_ns();const r=S.p.rest??100,L=S.l4;if(r<30)k*=1.2;if(r<12)k*=1.25;if(!L4.lit)k*=1.3;if(L){if(L.sp>=72)k*=0.9;else if(L.sp<25)k*=1.2;}if(S.st.infect)k*=1.25;if(S.st.heat)k*=1.3;return k;};}
{const _ng=needGate;needGate=function(heavy){const r=_ng(heavy);if(r)return r;if(heavy&&S.st.fracture&&!(S.l4&&S.l4.fr&&S.l4.fr.spl)&&!l4Cozy())return '🦴 Chân đang gãy, chưa bó nẹp: không làm việc nặng được. Bó nẹp tre (🧍 Cơ thể) rồi nghỉ ngơi.';return null;};}
{const _mv=move;move=function(dx,dz,m,dt,run){if(S.st.fracture){m*=S.l4&&S.l4.fr&&S.l4.fr.spl?0.72:0.5;run=false;}if(S.st.heat)m*=0.85;return _mv(dx,dz,m,dt,run);};}
// ngã cao: có thể gãy xương
{const _mt=moveTick;moveTick=function(dt){if(G.jumpReq&&S.st.fracture){G.jumpReq=0;if(G.t-(L4.jT||0)>3){L4.jT=G.t;uiToast('🦴 Chân đau, không nhảy được.','');}}const a0=P.air,v0=P.vy;_mt(dt);
  if(a0&&!P.air){const v=-(v0-520*dt);if(v>330&&!G.swim&&wdAt(P.x,P.z)<4&&!S.st.fracture){const pr=clamp((v-330)/260,0,0.85)*(l4Cozy()?0.5:1);if(Math.random()<pr){addStatus('fracture');S.p.hp=Math.max(1,S.p.hp-6);G.shakeCam=0.6;uiToast('🦴 Rắc! Ngã mạnh quá, gãy xương chân rồi. Bó nẹp tre và nghỉ ngơi.','bad');}}}};}
// thú lớn húc, vồ cũng có thể gãy xương; văn thân làm cá sấu e dè
{const _aa=animalAttack;animalAttack=function(a){if(a&&a.kind==='crocodile'&&S.l4&&S.l4.tat&&Math.random()<0.35){a.angry=true;uiFloat('Giao long ngần ngừ!',P.x,P.y+44,P.z,'#9fe0ff');if(!G.l4tatTip){G.l4tatTip=1;uiToast('🐊 Hình giao long xăm trên mình làm cá sấu ngần ngừ: người Lạc Việt văn thân để "thuồng luồng tưởng là đồng loại".','gold');}return;}
  _aa(a);const D=a&&ANIMALS[a.kind];if(D&&(D.dmg||0)>=20&&!S.st.fracture&&Math.random()<(l4Cozy()?0.04:0.12)){addStatus('fracture');uiToast(`🦴 ${a.n} húc mạnh: gãy xương!`,'bad');}};}
/* ---------- chữa trị ---------- */
function l4Work(steps,o,fn){const sp=1+skLv(o.sk||'herb')*0.06;G.work={r:{out:{},in:{}},steps:steps.map(s=>({n:s[0],a:s[1],t:s[2]/sp,fx:s[3]})),i:0,t:0,left:1,done:0,x:P.x,z:P.z,sk:o.sk||'herb',icon:o.icon||'bandage',fn};G.sit=false;G.act=null;G.walkTo=null;uiClose();workUi();sfx('pick');return true;}
function l4Treat(k){const L=l4S();
  if(k==='clean'){if(!S.st.wound){uiToast('Không có vết thương nào cần rửa.','');return;}const id=invCount('water')>0?'water':invCount('waterDirty')>0?'waterDirty':null;if(!id){uiToast('Cần một bầu nước (tốt nhất là nước đã đun sôi để nguội).','bad');sfx('no');return;}
    return l4Work([['Ngồi xuống, xem kỹ vết thương','h3inspect',0.7,'pick'],['Dội nước rửa sạch đất cát','h3scoop',1.2,'drink'],['Nặn máu bẩn, gỡ dằm gai','work',1.0,'pick'],['Lau khô bằng lá sạch','work',0.6,'pick']],{icon:'water'},()=>{if(!invTake(id,1))return;invAdd('flask',1);
      L.wn=L.wn||{c:0,b:0,h:0};L.wn.c=id==='water'?1:0.5;addXp('herb',2);cnt('cnt','clean');uiToast(id==='water'?'💧 Đã rửa vết thương bằng nước sôi để nguội: sạch sẽ. Giờ băng lại.':'💧 Rửa bằng nước suối: đỡ bẩn hơn, nhưng vẫn có thể nhiễm trùng. Lần sau dùng nước đun sôi.',id==='water'?'good':'');uiHotbar();save();});}
  if(k==='band'){if(!S.st.wound&&!S.st.bleed){uiToast('Không có vết thương nào cần băng.','');return;}if(invCount('bandage')<1){uiToast('Cần Băng lá rau má (3 sợi cỏ + 2 rau má, mở Chế tạo).','bad');sfx('no');return;}
    return l4Work([['Đắp lá rau má giã nát lên vết thương','work',0.9,'pick'],['Quấn băng lá, buộc sợi vừa chặt','lash',1.1,'pick']],{icon:'bandage'},()=>{if(!invTake('bandage',1))return;cureStatus('bleed');L.wn=L.wn||{c:0,b:0,h:0};if(S.st.wound)L.wn.b=1;S.p.hp=Math.min(100,S.p.hp+12);addXp('herb',2);cnt('cnt','band');
      uiToast(L.wn.c>=1?'🩹 Băng xong vết thương sạch: sẽ mau lành.':'🩹 Đã băng, nhưng vết thương chưa rửa sạch: vẫn có thể nhiễm trùng.',L.wn.c>=1?'good':'');uiHotbar();save();});}
  if(k==='splint'){if(!S.st.fracture){uiToast('Không có chỗ nào gãy xương.','');return;}if(L.fr&&L.fr.spl){uiToast('Đã bó nẹp rồi: nghỉ ngơi cho xương liền.','');return;}if(invCount('splint')<1){uiToast('Cần Nẹp tre (tre + sợi, hoặc 4 cành + sợi; mở Chế tạo).','bad');sfx('no');return;}
    return l4Work(WSTEP.splint.slice(2),{icon:'splint'},()=>{if(!invTake('splint',1))return;L.fr=L.fr||{};L.fr.spl=1;addXp('herb',3);cnt('cnt','splint');uiToast('🦯 Đã bó nẹp chân: đi lại được, xương sẽ liền dần (nghỉ ngơi thì nhanh hơn).','good');uiHotbar();save();});}
  if(k==='rest'){sitToggle(true);uiClose();uiToast('🪵 Ngồi nghỉ: sốt mau lui, xương mau liền, tỉnh táo lại (nhất là bên lửa).','');return;}
  if(k==='rain'){if(!l4Rain()||S.wx.type==='snow'){uiToast('Trời không mưa.','');return;}if(underRoof(P.x,P.z)){uiToast('Ra chỗ trống không có mái che để hứng nước mưa.','');return;}if(invCount('flask')<1){uiToast('Cần bầu hoặc ống tre rỗng.','bad');return;}
    return l4Work([['Ngửa bầu, ống tre hứng nước mưa','h3scoop',2.4,'drink'],['Nút miệng bầu lại','work',0.5,'pick']],{icon:'water',sk:'gather'},()=>{let n=0;while(n<3&&invCount('flask')>0){invTake('flask',1);invAdd('water',1);n++;}cnt('cnt','rainwater');uiToast(`🌧️ Hứng được ${n} bầu nước mưa trong lành, uống không cần đun.`,'good');uiHotbar();save();});}
  if(k==='heal'){const h=(S.folk||[]).find(f=>f.role==='healer');if(!h)return;if((L.healDay||0)===S.day){uiToast(h.n+' đã chữa cho bạn hôm nay rồi.','');return;}L.healDay=S.day;l4HealAll(h.n);}}
function l4HealAll(who){const L=l4S();let n=0;['bleed','poison','cold','fever','gut','infect','sting','heat','itch'].forEach(k=>{if(S.st[k]){delete S.st[k];n++;}});if(S.st.wound){L.wn={c:1,b:1,h:0};n++;}if(S.st.fracture){L.fr={spl:1};n++;}
  S.p.hp=Math.min(100,S.p.hp+20);L.sp=Math.min(100,L.sp+5);uiHud(true);uiToast(n?`🌿 ${who} rửa, băng, đắp thuốc, bó nẹp cho bạn. Nghỉ ngơi cho mau khỏe.`:`🌿 ${who} bắt mạch: bạn khỏe mạnh.`,'good');sfx('idea');save();}
/* ===================== 8. ĂN UỐNG ===================== */
{const _e=eat;eat=function(id){const I=ITEMS[id];if(!I)return;
  if(I.l4use==='splint'){l4Treat('splint');return;}
  const n0=invCount(id),st0=Object.assign({},S.st);_e(id);if(invCount(id)>=n0)return;const L=l4S();
  if(I.cures)I.cures.forEach(k=>{if(S.st[k])cureStatus(k);});
  if(id==='bandage'&&S.st.wound){L.wn=L.wn||{c:0,b:0,h:0};L.wn.b=1;}
  if(I.itch){addStatus('itch');S.p.hp=Math.max(1,S.p.hp-2);if(st0.poison==null&&S.st.poison)delete S.st.poison;}
  if(id==='waterDirty'&&Math.random()<(l4Cozy()?0.08:0.2))addStatus('gut');
  if(id==='water'&&S.st.heat)S.st.heat=Math.max(0.01,S.st.heat-1);
  if(id==='snail'||id==='snailCooked'){invAdd('shell',id==='snailCooked'?3:1);}
  // ăn ngon, đổi món thì vui
  if(I.t==='food'){const cooked=/Cooked|Dried|boiled|Soup|comLam|congee|mam|stew|bread|riceCooked/.test(id),bad=id==='meatRot'||I.poison;if(bad)L.sp=Math.max(0,L.sp-5);else if(cooked&&!L.ate.includes(id))L.sp=Math.min(100,L.sp+3);L.ate.push(id);if(L.ate.length>5)L.ate.shift();}};}
{const _dw=drinkWater;drinkWater=function(c){_dw(c);if(!c&&Math.random()<(l4Cozy()?0.05:0.12))setTimeout(()=>addStatus('gut'),1200);if(S.st.heat)S.st.heat=Math.max(0.01,S.st.heat-1);};}
// chum vại: ủ mắm (cá + muối, 2 ngày)
const L4FERM_D=2;
function l4FermHtml(b){const F=l4S().ferm[b.id];if(!l4AgeOk({age:3}))return `<div class="l4box"><b>🫙 Ủ mắm</b><p class="small muted">Biết ủ mắm từ ${AGES[3].n}.</p></div>`;
  if(!F){const ok=haveCount('fish')>=3&&haveCount('salt')>=1;return `<div class="l4box"><b>🫙 Ủ mắm trong chum</b><p class="small muted">Cá làm sạch xếp lớp với muối, nén chặt, đậy kín. Chừng ${L4FERM_D} ngày cá ngấu thành mắm: để rất lâu không hỏng. Muối đổi ở làng (người hái lượm, tù trưởng, thầy lang).</p><div class="chips">${chips({fish:3,salt:1})}</div><button class="btn sm" data-a="l4ferm" data-b="${b.id}" ${ok?'':'disabled'}>Ủ một mẻ mắm</button></div>`;}
  const k=clamp((TNOW()-F.t0)/L4FERM_D,0,1);return `<div class="l4box"><b>🫙 Mắm đang ủ · ${Math.round(k*100)}%</b><i class="l4bar" style="--v:${Math.round(k*100)}%;--c:#c9a25a"></i>${k>=1?`<button class="btn sm" data-a="l4fermT" data-b="${b.id}">Lấy ${F.n} hũ mắm</button>`:'<p class="small muted">Chưa ngấu. Đậy kín, để nơi râm mát.</p>'}</div>`;}
function l4Ferm(b){const L=l4S();if(L.ferm[b.id])return;if(!canPay({fish:3,salt:1})){uiToast('Cần 3 cá và 1 muối.','bad');return;}
  l4Work([['Mổ cá, bỏ ruột, rửa sạch','h3butcher',1.0,'chop'],['Xếp lớp cá, rắc lớp muối','work',1.2,'pick'],['Nén đá, đậy kín miệng chum','lash',0.8,'pick']],{icon:'mam',sk:'cook'},()=>{if(!canPay({fish:3,salt:1}))return;pay({fish:3,salt:1});L.ferm[b.id]={t0:+TNOW().toFixed(3),n:3};addXp('cook',3);cnt('cnt','ferment');uiToast(`🫙 Đã ủ mắm. Chừng ${L4FERM_D} ngày nữa mở chum.`,'good');uiHotbar();save();});}
function l4FermTake(b){const L=l4S(),F=L.ferm[b.id];if(!F||TNOW()-F.t0<L4FERM_D)return;if(!invFits('mam',F.n)){uiToast('Túi đầy!','bad');return;}delete L.ferm[b.id];give({mam:F.n},[b.x,b.y+12,b.z]);addXp('cook',4);cnt('craft','mam',F.n);sfx('craft');save();}
{const _sh=storeHtml;storeHtml=function(b){const h=_sh(b);return b.k==='pottery'?l4FermHtml(b)+h:h;};}
/* ===================== 9. LÚA HOANG, KHOAI MÔN (điểm hái lượm của hunt3) ===================== */
Object.assign(H3NODE,{wildrice:{n:'Lúa hoang ven đầm',seas:[1,2],per:0.8,regrow:3,yield:{paddy:[2,4],seedRice:[1,2]},water:1},
  taro:{n:'Khoai môn dại',seas:null,per:0.55,regrow:4,yield:{taro:[1,3]},bio:[5,3]}});
{const _ni=h3nodeInfo;h3nodeInfo=function(n){if(n.kind==='wildrice')return {name:'Lúa hoang ven đầm · bông chín',verb:'Tuốt lúa',ok:true,icon:'paddy',warn:S.seen.seedRice?null:'Giữ lại thóc giống để sau này gieo trồng'};
  if(n.kind==='taro')return {name:'Khoai môn dại'+(hasTool('dig')?'':' · đào tay rất lâu'),verb:'Đào khoai môn',ok:true,icon:'taro',warn:'Ăn sống ngứa cổ: luộc hoặc nướng kỹ'};return _ni(n);};}
{const _ns=h3nodeStart;h3nodeStart=function(n){if(n.kind!=='wildrice'&&n.kind!=='taro')return _ns(n);const N=H3NODE[n.kind],out=h3rollYield(N.yield,'gather'),sp=1+skLv('gather')*0.06,dig=!!hasTool('dig');
  if(!invFits(Object.keys(N.yield)[0],1)){uiToast('Túi đầy! Cất bớt đồ.','bad');return;}const st=[];
  if(n.kind==='wildrice'){st.push(h3st('Lội ra mép đầm, gom bông lúa','h3scoop',1.0,'drink',{cyc:1.2}),h3st('Kéo bông vào giỏ, tuốt hạt bằng tay','h3pluck',1.6,'pick',{hold:'paddy'}),h3st('Đập nhẹ cho hạt chín rụng vào giỏ','h3pluck',1.1,'pick'),h3st('Nhặt riêng hạt chắc làm giống','h3kpick',0.8,'pick'));}
  else{if(!dig&&out.taro>1)out.taro--;st.push(h3st('Rẽ tàu lá khoai to bản','h3inspect',0.8,'pick',{cyc:1.6}),h3st(dig?'Chọc gậy đào quanh gốc':'Bới đất ướt bằng tay','h3kdig',dig?1.3:2.8,'step',{cyc:1,stick:dig}),h3st('Nhổ củ, rũ bùn','h3pluck',0.9,'pick',{hold:'taro'}));}
  P.ry=Math.atan2(n.x-P.x,n.z-P.z);if(G.sit)sitToggle(false);G.act=null;G.walkTo=null;if(dig&&n.kind==='taro')selectTool('dig');
  const W=G.work={r:{out:{},in:{}},steps:st.map(s=>Object.assign(s,{t:s.t/sp})),i:0,t:0,left:1,done:0,x:P.x,z:P.z,sk:'gather',icon:Object.keys(N.yield)[0],h3:1,h3out:out,h3node:n};
  W.fn=()=>{h3flush(W);const rest={};for(const k in out)if(out[k]>0)rest[k]=out[k];if(Object.keys(rest).length)give(rest,[n.x,n.y+8,n.z]);h3S().dep[n.id]=+(TNOW()+N.regrow*(0.8+Math.random()*0.4)).toFixed(3);
    addXp('gather',2);cnt('cnt','gather');cnt('cnt',n.kind);H3.cell='';H3.hold=null;if(n.kind==='wildrice'&&!G.l4riceTip){G.l4riceTip=1;uiToast('🌾 Thóc lúa hoang: đập, giã thành gạo mà ăn. Giữ thóc giống, tới thời Bắc Sơn sẽ biết làm ruộng nước.','idea');}save();};workUi();sfx('pick');};}
{const _nd=h3nodesDraw;h3nodesDraw=function(){_nd();try{l4NodesDraw();}catch(e){if(!L4.nerr){L4.nerr=1;console.warn('life4 điểm hái',e);}}};}
function l4NodesDraw(){const T=THREE;if(!L4.NM){const mk=(geo,col,N)=>{const im=new T.InstancedMesh(geo,new T.MeshStandardMaterial({color:col,roughness:0.7}),N);im.count=0;im.frustumCulled=false;im.receiveShadow=true;G.sc.add(im);try{seasonPatchAll(im);}catch(e){}return im;};
    L4.NM={rice:mk(new T.ConeGeometry(0.9,22,4).translate(0,11,0),0xb8a85a,320),riceH:mk(new T.SphereGeometry(1.6,5,4).scale(0.6,2.2,0.6),0xd8b45a,320),taro:mk(new T.SphereGeometry(7,8,4).scale(1,0.16,1.3),0x3f7f34,160),taroS:mk(new T.CylinderGeometry(0.5,0.7,12,5).translate(0,6,0),0x5a8a3a,160)};}
  const M=L4.NM,o=L4.o3||(L4.o3=new T.Object3D());let nr=0,nt=0;
  for(const n of H3.nodes){if(n.kind==='wildrice'){for(let k=0;k<8&&nr<320;k++){const a=n.ry+k*2.4,r=2+k*1.6,x=n.x+Math.cos(a)*r,z=n.z+Math.sin(a)*r,y=Math.max(hAt(x,z),typeof waterAt==='function'?waterAt(x,z)-3:0);
        o.position.set(x,y,z);o.rotation.set(Math.sin(a)*0.25,a,Math.cos(a)*0.25);o.scale.setScalar(0.8+(k%3)*0.15);o.updateMatrix();M.rice.setMatrixAt(nr,o.matrix);o.position.y+=20*o.scale.y;o.updateMatrix();M.riceH.setMatrixAt(nr,o.matrix);nr++;}}
    else if(n.kind==='taro'){for(let k=0;k<3&&nt<160;k++){const a=n.ry+k*2.1,x=n.x+Math.cos(a)*4,z=n.z+Math.sin(a)*4,y=hAt(x,z);o.position.set(x,y,z);o.rotation.set(Math.cos(a)*0.4,a,Math.sin(a)*0.4);o.scale.setScalar(1);o.updateMatrix();M.taroS.setMatrixAt(nt,o.matrix);
        o.position.set(x+Math.cos(a)*4,y+11,z+Math.sin(a)*4);o.rotation.set(Math.cos(a)*0.5,a,Math.sin(a)*0.5);o.updateMatrix();M.taro.setMatrixAt(nt,o.matrix);nt++;}}}
  M.rice.count=M.riceH.count=nr;M.taro.count=M.taroS.count=nt;for(const k in M)M[k].instanceMatrix.needsUpdate=true;}
/* ===================== 10. RUỘNG LÚA NƯỚC ===================== */
// trạng thái: st 0 trống · 1 mạ đang lên · 2 mạ đủ tuổi (nhổ cấy) · 3 lúa đang lớn · 4 lúa chín. w: mực nước 0..1, weed: cỏ dại 0..1
const L4PAD_N=['Ruộng trống','Mạ đang lên','Mạ đủ tuổi cấy','Lúa đang lớn','Lúa chín vàng'];
function l4Pad(b){const L=l4S();return L.pad[b.id]||(L.pad[b.id]={st:0,w:0,p:0,weed:0});}
function l4PadSrc(b){const k=b.id;if(!L4.nw.has(k))L4.nw.set(k,nearWater(b.x,b.z,110));if(L4.nw.get(k))return 'suối';if(typeof b3chanWetAt==='function'&&S.builds.some(c=>c.k==='channel'&&c.prog==null&&G._b3wet&&G._b3wet.has(c.id)&&Math.hypot(c.x-b.x,c.z-b.z)<120))return 'mương';return null;}
function l4PadTick(gh){const L=l4S(),si=seasonIdx(),grow=SEASONS[si].grow,rain=l4Rain()&&S.wx.type!=='snow';
  for(const b of S.builds){if(b.k!=='paddy'||b.prog!=null)continue;const F=l4Pad(b),src=l4PadSrc(b),k0=l4PadKey(b);
    F.w=clamp(F.w+gh*((rain?0.2:0)+(src?0.5:0)-(si===1?0.06:0.035)),0,1);
    if(F.st===1){F.p=Math.min(1,F.p+gh/14*Math.max(0.15,grow)*(F.w>0.2?1:0.3));if(F.p>=1){F.st=2;F.p=0;if(Math.hypot(b.x-P.x,b.z-P.z)<900)uiToast('🌱 Mạ đã đủ tuổi: nhổ mạ đem cấy ra ruộng.','gold');}}
    else if(F.st===3){F.weed=Math.min(1,F.weed+gh/30);F.p=Math.min(1,F.p+gh/(2.2*24)*grow*(F.w>0.3?1:0.25)*(1-F.weed*0.5));if(F.w<0.15&&grow>0&&!F.dryT){F.dryT=1;if(Math.hypot(b.x-P.x,b.z-P.z)<900)uiToast('🏜️ Ruộng lúa cạn nước: lúa còi cọc. Tát nước hoặc đào mương dẫn nước vào.','bad');}if(F.w>0.4)F.dryT=0;
      if(F.p>=1){F.st=4;cnt('cnt','riceRipe');if(Math.hypot(b.x-P.x,b.z-P.z)<1200)uiToast('🌾 Ruộng lúa đã chín vàng: mang liềm ra gặt!','gold');}}
    if((L.fl||0)>0.85&&(F.st===1||F.st===3)&&src==='suối'&&Math.random()<gh*0.15){F.p=Math.max(0,F.p-0.15);if(!F.drownT){F.drownT=1;uiToast('🌊 Lũ to tràn ngập ruộng: mạ, lúa non bị úng một phần.','bad');}}
    if(l4PadKey(b)!==k0)l4PadShow(b);}}
function l4PadKey(b){const F=l4Pad(b);return F.st+'|'+(F.w>0.25?1:0)+'|'+(F.st===3?Math.min(2,Math.floor(F.p*3)):0)+'|'+(F.weed>0.5?1:0);}
// lớp nước, mạ, lúa trên ruộng (vật thể riêng cho từng ruộng, chỉ dựng lại khi đổi trạng thái)
function l4PadShow(b){const old=L4.po.get(b.id);if(old){G.sc.remove(old.o);L4.po.delete(b.id);}if(!BYID.has(b.id)||b.prog!=null||!G.sc)return;const F=l4Pad(b),K=K3,a=[];
  if(F.w>0.25)a.push(K.box(74,0.5,74,'#5d7f8c',{y:0.6,mo:{transparent:true,opacity:0.62},noShadow:true}));
  const plant=(n,h,col,r0)=>{for(let i=0;i<n;i++)for(let j=0;j<n;j++){const x=-30+60*i/(n-1),z=-30+60*j/(n-1);a.push(K.cone(r0,h,col,{x,z,y:0.4,noShadow:true},4));}};
  if(F.st===1)a.push(K.box(22,2.4,22,'#7fbf4a',{x:-24,z:-24,y:0}));else if(F.st===2)a.push(K.box(22,5,22,'#6fb03e',{x:-24,z:-24,y:0}));
  else if(F.st===3){const g=Math.min(2,Math.floor(F.p*3));plant(6,5+g*4,g<2?'#6aa83a':'#8ab040',1.1+g*0.4);if(F.weed>0.5)for(let i=0;i<8;i++)a.push(K.cone(2,5,'#4a7a2a',{x:Math.sin(i*2.3)*28,z:Math.cos(i*1.7)*28,y:0.4,noShadow:true},4));}
  else if(F.st===4){plant(6,14,'#c9a840',1.5);for(let i=0;i<6;i++)for(let j=0;j<6;j++)a.push(K.sphere(1.3,'#e2c25a',{x:-30+12*i+1.5,y:12,z:-30+12*j,sy:1.8,rz:0.6,noShadow:true},5,4));}
  if(!a.length)return;const o=K.group(a);o.position.set(b.x,b.y,b.z);o.rotation.y=b.r*Math.PI/2;try{seasonPatchAll(o);}catch(e){}G.sc.add(o);L4.po.set(b.id,{o});}
function l4PadInfo(b){const F=l4Pad(b),src=l4PadSrc(b),wtx=` · nước ${Math.round(F.w*100)}%${src?' (từ '+src+')':''}`;
  if(F.st===0){if(F.w<0.3)return {name:'Ruộng trống'+wtx,verb:src?'Khơi nước vào ruộng':'Tát nước vào ruộng',ok:!!src||invCount('waterDirty')+invCount('water')>0,need:'bầu nước (múc ở suối) để tát',icon:'water'};return {name:'Ruộng ngập nước'+wtx,verb:'Gieo mạ',ok:invCount('seedRice')>=2,need:'2 thóc giống',icon:'seedRice'};}
  if(F.st===1)return {name:`Mạ đang lên ${Math.round(F.p*100)}%`+wtx,verb:'',ok:false,need:'chờ mạ lớn',icon:'seedRice'};
  if(F.st===2)return {name:'Mạ đủ tuổi'+wtx,verb:'Nhổ mạ, cấy lúa',ok:true,icon:'seedRice'};
  if(F.st===3){if(F.w<0.3)return {name:`Lúa ${Math.round(F.p*100)}% · ruộng cạn!`,verb:src?'Khơi nước vào ruộng':'Tát nước vào ruộng',ok:!!src||invCount('waterDirty')+invCount('water')>0,need:'bầu nước để tát',icon:'water'};
    if(F.weed>0.45)return {name:`Lúa ${Math.round(F.p*100)}% · nhiều cỏ dại`+wtx,verb:'Làm cỏ, sục bùn',ok:true,icon:'fiber'};return {name:`Lúa đang lớn ${Math.round(F.p*100)}%`+wtx,verb:'',ok:false,need:SEASONS[seasonIdx()].grow?'chờ lúa chín':'mùa đông lúa ngừng lớn',icon:'paddy'};}
  return {name:'Lúa chín vàng',verb:'Gặt lúa',ok:true,icon:'riceSheaf',warn:hasTool('sickle')?null:'Có liềm thì gặt nhanh, được nhiều lúa hơn'};}
function l4PadUse(b){const F=l4Pad(b),src=l4PadSrc(b),sp={sk:'farm',icon:'paddy'};{const ng=needGate(F.st!==0||F.w>=0.3);if(ng){uiToast(ng,'bad');sfx('no');return;}}
  if((F.st===0||F.st===3)&&F.w<0.3){if(src)return l4Work([['Khơi rãnh nối ruộng với '+src,'h3kdig',1.6,'step'],['Mở bờ cho nước chảy vào','h3kdig',1.0,'step'],['Đắp lại bờ khi đủ nước','h3kdig',0.8,'step']],Object.assign(sp,{icon:'water'}),()=>{F.w=1;l4PadShow(b);addXp('farm',2);uiToast('💦 Nước đã vào đầy ruộng.','good');save();});
    const ids=['waterDirty','water'].filter(k=>invCount(k)>0);if(!ids.length){uiToast('Cần bầu nước: múc nước suối rồi tát vào ruộng.','bad');return;}
    return l4Work([['Đổ bầu nước vào ruộng','h3scoop',1.2,'drink'],['Tát, té nước cho đều','h3scoop',1.0,'drink']],Object.assign(sp,{icon:'water'}),()=>{let n=0;for(const k of ids)while(n<4&&invCount(k)>0){invTake(k,1);invAdd('flask',1);n++;}F.w=Math.min(1,F.w+0.25*n);l4PadShow(b);uiToast(`💧 Tát ${n} bầu nước vào ruộng (${Math.round(F.w*100)}%). Ruộng sát suối hoặc có mương thì tự đủ nước.`,'');uiHotbar();save();});}
  if(F.st===0){if(invCount('seedRice')<2){uiToast('Cần 2 thóc giống. Tuốt lúa hoang ven đầm hoặc để giống từ thóc.','bad');return;}if(SEASONS[seasonIdx()].grow<=0){uiToast('Mùa đông giá rét: mạ không lên. Chờ xuân.','bad');return;}
    return l4Work([['Ngâm thóc giống cho nứt nanh','work',1.0,'drink'],['Làm tơi một góc ruộng làm ruộng mạ','h3kdig',1.2,'step'],['Vãi thóc giống đều tay','h3pluck',1.0,'pick']],sp,()=>{if(!invTake('seedRice',2))return;F.st=1;F.p=0;l4PadShow(b);addXp('farm',3);cnt('cnt','plant');cnt('cnt','sowRice');uiToast('🌱 Đã gieo mạ. Giữ ruộng có nước, chừng nửa ngày mạ lên xanh.','good');uiHotbar();save();});}
  if(F.st===2)return l4Work([['Nhổ mạ từng nắm, rũ sạch bùn','h3pluck',1.4,'pick'],['Bó mạ, vứt rải khắp ruộng','h3pluck',0.8,'pick'],['Lùi dần, cắm từng khóm mạ xuống bùn','h3kpick',2.6,'pick'],['Cấy thẳng hàng cho lúa thoáng gió','h3kpick',1.4,'pick']],sp,()=>{F.st=3;F.p=0;F.weed=0;l4PadShow(b);addXp('farm',5);cnt('cnt','transplant');uiToast('🌾 Cấy xong! Giữ nước, làm cỏ khi cỏ mọc, chừng hai ngày nữa lúa chín.','good');save();});
  if(F.st===3&&F.weed>0.45)return l4Work([['Lội ruộng nhổ cỏ dại','h3pluck',1.6,'pick'],['Sục bùn quanh gốc lúa cho thoáng rễ','h3kdig',1.2,'step']],sp,()=>{F.weed=0;l4PadShow(b);addXp('farm',3);uiToast('🌿 Ruộng sạch cỏ, lúa tốt hẳn lên.','good');save();});
  if(F.st===4){const sk=hasTool('sickle');if(sk)selectTool('sickle');return l4Work([[sk?'Cầm liềm cắt từng nắm lúa':'Bứt, tuốt từng nắm lúa bằng tay',sk?'chop':'h3pluck',sk?1.4:2.8,'chop'],['Gom lúa thành lượm','h3pluck',1.0,'pick'],['Bó lúa, gánh lên bờ','lash',1.0,'pick']],sp,()=>{
      const n=Math.max(1,(sk?5:3)+(Math.random()<skLv('farm')*0.1?1:0)-(F.weed>0.5?1:0));F.st=0;F.p=0;F.weed=0;l4PadShow(b);give({riceSheaf:n,seedRice:1+(Math.random()<0.5?1:0)},[b.x,b.y+10,b.z]);addXp('farm',8);cnt('cnt','harvest');cnt('cnt','riceHarvest');
      uiToast(`🌾 Gặt được ${n} bó lúa. Đập lấy thóc, giã ở cối thành gạo; cất thóc vào chum hoặc kho trên cột.`,'gold');save();});}}
{const _sr=structRemove;structRemove=function(b){if(b&&b.k==='paddy'){const o=L4.po.get(b.id);if(o){G.sc.remove(o.o);L4.po.delete(b.id);}if(S.l4)delete S.l4.pad[b.id];}if(b&&S.l4&&S.l4.ferm)delete S.l4.ferm[b.id];_sr(b);};}
{const _sd=siteDone;siteDone=function(b){_sd(b);if(b.k==='paddy'){L4.nw.delete(b.id);l4PadShow(b);uiToast('🌾 Ruộng đã xong bờ, ngâm bùn. Giữ nước rồi gieo mạ.','');}};}
// ruộng phải sát nước hoặc mương
{const _bu=buildUpdate;buildUpdate=function(){_bu();const B=G.build;if(!B||B.id!=='paddy'||!B.pos||B.rm)return;const {x,z}=B.pos,k=Math.round(x)+','+Math.round(z);if(L4.puK!==k){L4.puK=k;L4.puW=nearWater(x,z,110)||S.builds.some(c=>c.k==='channel'&&c.prog==null&&Math.hypot(c.x-x,c.z-z)<120);}
  B.sup=L4.puW?'💧 Gần nguồn nước: ruộng tự đủ nước':'🏜️ Xa nguồn nước: phải tát nước bằng bầu, hoặc đào mương tới đây';};}
/* ---------- khoai môn, củ mài trồng trên luống ---------- */
const L4CROP={taro:{n:'khoai môn',out:()=>({taro:l4R(3,5)})},yam:{n:'củ mài',out:()=>({yam:l4R(3,4)})}};
function l4SeedId(){return ['seedGrain','seedGourd','seedFlax'].find(k=>invCount(k)>0)||null;}
function l4Tuber(){const s=S.inv[S.sel];if(s&&L4CROP[s.id])return s.id;if(!l4SeedId())return ['taro','yam'].find(k=>invCount(k)>0)||null;return null;}
/* ===================== 11. TÌM ĐỐI TƯỢNG: RUỘNG, BÀN THỜ, MỘ, LUỐNG KHOAI ===================== */
function l4Scan(){let best=null,bd=1e9;for(const b of S.builds){if(b.prog!=null||!(b.k==='paddy'||b.k==='altar'||b.k==='tomb'))continue;if(Math.abs(b.y-P.y)>60)continue;const def=pieceDef(b.k);const d=Math.hypot(b.x-P.x,b.z-P.z)-(b.k==='paddy'?34:b.k==='tomb'?20:10);if(d>REACH+10)continue;if(d<bd){bd=d;best={type:'l4b',b,def,d:Math.max(0,d)};}}return best;}
{const _ft=findTarget;findTarget=function(){const t=_ft();if(G.work||G.sit||G.ride||G.build||!S)return t;if(G.t-L4.pT>0.25){L4.pT=G.t;L4.pBest=l4Scan();}const best=L4.pBest;if(!best||!BYID.has(best.b.id))return t;
  if(!t||t.type==='water'||t.type==='track'||(t.d!=null&&best.d<t.d-4))return best;return t;};}
{const _ti=targetInfo;targetInfo=function(t){if(t&&t.type==='l4b'){const b=t.b;if(b.k==='paddy')return l4PadInfo(b);if(b.k==='altar'){const done=(l4S().offer||0)===S.day;return {name:t.def.n,verb:done?'Đã dâng lễ hôm nay':'Thắp hương, dâng lễ',ok:!done,need:'ngày mai',icon:'flower'};}
    if(b.k==='tomb'){const done=l4S().tomb===l4SeasonKey();return {name:t.def.n,verb:done?'Đã tảo mộ mùa này':'Tảo mộ, thắp hương',ok:!done,need:'mùa sau',icon:'ochre'};}}
  if(t&&t.type==='build'&&t.def&&t.def.farm&&t.b.prog==null){const c=S.crops[t.b.id];if(!c){const tb=l4Tuber();if(tb)return {name:t.def.n,verb:'Trồng '+L4CROP[tb].n,ok:true,icon:tb};}else if(L4CROP[c.k]){const st=cropStage(c);return st>=3?{name:L4CROP[c.k].n+' tới lứa',verb:'Đào củ',ok:true,icon:c.k}:{name:L4CROP[c.k].n+' đang lớn',verb:Math.round(c.p*100)+'%',ok:false,icon:c.k};}}
  return _ti(t);};}
{const _as=actStart;actStart=function(t){if(!G.work&&t){if(t.type==='l4b'){const b=t.b;if(b.k==='paddy')return l4PadUse(b);if(b.k==='altar')return l4Offer(b);if(b.k==='tomb')return l4TombVisit(b);}
    if(t.type==='build'&&t.def&&t.def.farm&&t.b.prog==null){const b=t.b,c=S.crops[b.id];
      if(!c){const tb=l4Tuber();if(tb){if(seasonIdx()===3){uiToast('Mùa đông đất lạnh cứng: chờ xuân hãy trồng.','bad');return;}return l4Work([['Cuốc hốc, vun luống','h3kdig',1.2,'step'],['Đặt củ giống, mầm hướng lên','h3kpick',0.8,'pick'],['Lấp đất, phủ rơm giữ ẩm','h3kdig',0.8,'step']],{sk:'farm',icon:tb},()=>{if(S.crops[b.id]||!invTake(tb,1))return;S.crops[b.id]={k:tb,p:0};cnt('cnt','plant');addXp('farm',3);cropShow(b);uiToast(`🌱 Đã trồng ${L4CROP[tb].n}. Đất ẩm, gần nước thì củ to.`,'good');uiHotbar();save();});}}
      else if(L4CROP[c.k]&&cropStage(c)>=3){return l4Work([['Cắt bớt tàu lá','h3pluck',0.8,'pick'],['Đào quanh gốc','h3kdig',1.4,'step'],['Moi củ, rũ đất','h3pluck',0.9,'pick']],{sk:'farm',icon:c.k},()=>{if(!S.crops[b.id])return;give(L4CROP[c.k].out(),[b.x,b.y+10,b.z]);delete S.crops[b.id];cnt('cnt','harvest');addXp('farm',6);cropShow(b);save();});}
      else if(L4CROP[c.k]){uiToast(`${L4CROP[c.k].n} mới được ${Math.round(c.p*100)}%.`,'');return;}}}
  return _as(t);};}
/* ===================== 12. TINH THẦN, LỄ HỘI, TỔ TIÊN, KỂ CHUYỆN, VĂN THÂN, GIA ĐÌNH ===================== */
const l4SeasonKey=()=>Math.floor((S.day-1)/SEASON_DAYS);
const l4Spirit=(n,why)=>{const L=l4S();L.sp=clamp(L.sp+n,0,100);if(why)uiFloat((n>0?'+':'')+n+' tinh thần',P.x,P.y+48,P.z,n>0?'#ffd27a':'#b8a8d8');};
function l4Offer(b){const L=l4S();if((L.offer||0)===S.day){uiToast('Hôm nay đã dâng lễ rồi.','');return;}const pick=['meatCooked','fishCooked','riceCooked','comLam','bread','boiledMeat','flower','berry','banana','rice'].find(k=>invCount(k)>0);
  if(!pick){uiToast('Cần một món lễ: đồ ăn chín, gạo, quả hoặc hoa.','bad');return;}
  l4Work([['Lau sạch bàn thờ','work',0.8,'pick'],['Bày '+ITEMS[pick].n.toLowerCase()+' lên phiến đá','h3kpick',0.8,'pick'],['Thắp hương, khấn tổ tiên','sit',1.6,'step']],{sk:'gather',icon:'flower'},()=>{if(!invTake(pick,1))return;L.offer=S.day;l4Spirit(18,1);S.rep=Math.min(100,(S.rep||0)+1);cnt('cnt','offer');
    uiToast('🕯️ Khói hương bay lên. "Uống nước nhớ nguồn": lòng thanh thản, cả nhà yên vui.','gold');uiHotbar();save();});}
function l4TombVisit(b){const L=l4S(),key=l4SeasonKey();if(L.tomb===key){uiToast('Mùa này đã tảo mộ rồi.','');return;}
  l4Work([['Nhổ cỏ, đắp lại đất mộ','h3kdig',1.2,'step'],['Xếp lại đá kè','h3kpick',1.0,'pick'],['Rắc son đỏ, đặt hoa','h3kpick',0.8,'pick'],['Thắp hương tưởng nhớ người đã khuất','sit',1.4,'step']],{sk:'gather',icon:'ochre'},()=>{L.tomb=key;l4Spirit(22,1);S.rep=Math.min(100,(S.rep||0)+4);cnt('cnt','tomb');
    uiToast(seasonIdx()===0?'🪦 Tảo mộ đầu xuân: con cháu sum vầy, nhớ ơn người đi trước.':'🪦 Tảo mộ: nhớ về tổ tiên đã khai phá vùng đất này.','gold');save();});}
// lễ hội: đầu xuân (Tết) và mùa thu (lễ cơm mới)
function l4FestNow(){const si=seasonIdx(),sd=seasonDay();if(si===0&&sd===1)return {k:'xuan',n:'Hội xuân'};if(si===2&&sd<=2)return {k:'mua',n:'Hội mùa (lễ cơm mới)'};return null;}
function l4FestNext(){for(let d=0;d<16;d++){const day=S.day+d,si=Math.floor((day-1)/SEASON_DAYS)%4,sd=((day-1)%SEASON_DAYS)+1;if(si===0&&sd===1)return {d,n:'Hội xuân'};if(si===2&&sd<=2)return {d,n:'Hội mùa'};}return null;}
{const _dp=drumPlay;drumPlay=function(){_dp();const L=l4S(),F=l4FestNow();if(F){const key=F.k+':'+l4SeasonKey();if(L.fest!==key){L.fest=key;l4Fest(F);return;}}if(G.t-(L4.drumT||-99)>60){L4.drumT=G.t;l4Spirit(4,1);}};}
function l4Fest(F){const L=l4S(),folk=(S.folk||[]).length;l4Spirit(35,1);S.rep=Math.min(100,(S.rep||0)+8);S.buff.rested=Math.max(S.buff.rested||0,TNOW()+0.8);S.p.rest=Math.min(100,S.p.rest+20);cnt('cnt','festival');
  for(let i=0;i<10;i++)setTimeout(()=>puff(P.x+(Math.random()-0.5)*80,P.y+30+Math.random()*30,P.z+(Math.random()-0.5)*80,['#ffd27a','#ff8a5a','#fff2c0'][i%3],4),i*120);
  (S.folk||[]).forEach(f=>{f._tx=P.x+(Math.random()-0.5)*60;f._tz=P.z+(Math.random()-0.5)*60;});
  G.paused=true;uiOverlay(true,`<div class="ov-card l4story"><h2>🥁 ${esc(F.n)}</h2><p>${esc(F.k==='xuan'?'Trống thúc vang thung lũng. Mọi người quây quần bên lửa, giã bánh, nhảy múa, đốt lửa đón năm mới. Già làng cầu cho mưa thuận gió hòa, lúa tốt, người khỏe.':'Lúa đã về kho. Nồi cơm mới đầu tiên dâng lên tổ tiên, rồi cả làng cùng ăn. Trai gái múa hát, giã gạo theo nhịp trống như hình khắc trên trống đồng.')}</p>
    <p class="small muted">Tinh thần +35 · khỏe khoắn cả ngày · tình thân với làng +8${folk?' · '+folk+' người nhà cùng vui':''}.</p><button class="btn big" data-a="recap">Vui hội!</button></div>`);sfx('level');save();}
// kể chuyện bên bếp lửa (mỗi đêm một lần)
const L4STORY=[
  {t:'Con Rồng cháu Tiên',d:'Lạc Long Quân giống rồng ở biển, Âu Cơ giống tiên trên núi, sinh ra bọc trăm trứng nở trăm người con. Năm mươi con theo mẹ lên núi, năm mươi con theo cha xuống biển; người con trưởng làm vua Hùng. Vì thế người Việt gọi nhau là đồng bào.',k:'Anh em cùng một bọc: giúp nhau mà sống.',sk:'build'},
  {t:'Sơn Tinh, Thủy Tinh',d:'Hai chàng cùng cầu hôn Mỵ Nương. Sơn Tinh mang lễ vật đến trước, cưới được nàng. Thủy Tinh giận, năm nào cũng dâng nước đánh Sơn Tinh; núi càng dâng cao, nước rút đi.',k:'Mùa lũ năm nào cũng tới: làm nhà sàn, kho trên cột, đắp bờ cao.',sk:'build'},
  {t:'Bánh chưng, bánh giầy',d:'Vua Hùng chọn người nối ngôi. Lang Liêu nghèo, được thần mách: lúa gạo là quý nhất. Chàng gói bánh vuông tượng đất, giã bánh tròn tượng trời, dâng vua và được truyền ngôi.',k:'Hạt gạo là hạt ngọc: giữ thóc giống, chăm ruộng nước.',sk:'farm'},
  {t:'Mai An Tiêm',d:'An Tiêm bị đày ra đảo hoang. Chàng không than vãn, nhặt hạt chim thả xuống, trồng thành dưa ngọt, đổi lấy gạo của thuyền buôn, rồi được vua gọi về.',k:'Tự tay làm thì không bao giờ đói.',sk:'farm'},
  {t:'Sự tích trầu cau',d:'Hai anh em và người vợ thương nhau mà chết hóa thành cây cau, dây trầu, hòn đá vôi. Ăn trầu với cau, vôi thì môi đỏ thắm: từ đó trầu cau là lễ vật cưới hỏi.',k:'Tình nghĩa gia đình là gốc của bộ lạc.',sk:'gather'},
  {t:'Sự tích Táo quân',d:'Người vợ và hai người chồng vì thương nhau mà cùng chết trong bếp lửa, hóa thành ba ông đầu rau giữ lửa cho mỗi nhà.',k:'Giữ lửa bếp cho cẩn thận: lửa là sự sống.',sk:'cook'},
  {t:'Chử Đồng Tử',d:'Chàng trai nghèo chỉ có một khố vải chung với cha, gặp công chúa Tiên Dung trên bãi sông. Hai người nên vợ chồng, cùng nhau đi buôn, mở chợ, dạy dân trồng trọt, đánh cá.',k:'Buôn bán, trao đổi giúp làng giàu có.',sk:'gather'},
  {t:'Thánh Gióng',d:'Cậu bé ba tuổi chưa biết nói, nghe giặc đến thì vươn vai thành tráng sĩ, nhổ bụi tre đánh tan quân giặc rồi bay về trời.',k:'Tre làng là giáo mác: trồng tre quanh nhà.',sk:'hunt'},
  {t:'Nỏ thần An Dương Vương',d:'Thần Kim Quy cho vua móng thần làm lẫy nỏ, một phát bắn ra nghìn mũi tên đồng. Vua xây thành Cổ Loa xoắn ốc giữ nước.',k:'Mũi tên đồng, thành lũy: sức mạnh của thời Đông Sơn.',sk:'craft'}];
function l4StoryOk(){return isNight()&&L4.fire;}
function l4Story(){const L=l4S(),key=S.day+(S.hour<6?-1:0);if(!isNight()){uiToast('Chuyện kể bên bếp lửa lúc trời tối.','');return;}if(!l4NearFire()){uiToast('Ngồi quây quần bên bếp lửa đang cháy để kể chuyện.','');return;}if(L.story===key){uiToast('Đêm nay đã kể chuyện rồi. Đi ngủ thôi!','');return;}
  const i=(L.storyI||0)%L4STORY.length,st=L4STORY[i];l4Work([['Thêm củi, ngồi quây quần bên lửa','sit',1.0,'step'],['Kể chuyện: '+st.t,'sit',2.4,'step']],{icon:'torch',sk:'gather'},()=>{L.story=key;L.storyI=i+1;const folk=(S.folk||[]).length;l4Spirit(12+Math.min(8,folk*2),0);S.p.rest=Math.min(100,S.p.rest+8);addXp(st.sk,8);cnt('cnt','story');
    G.paused=true;uiOverlay(true,`<div class="ov-card l4story"><small>Chuyện kể bên bếp lửa</small><h2>📜 ${esc(st.t)}</h2><p>${esc(st.d)}</p><p class="l4moral">💡 ${esc(st.k)}</p><p class="small muted">Tinh thần +${12+Math.min(8,folk*2)}${folk?' (cả nhà cùng nghe)':''} · ${SKILL[st.sk]} +8 kinh nghiệm.</p><button class="btn big" data-a="recap">Nghe xong</button></div>`);save();});}
{const _ch=craftHtml;craftHtml=function(){const h=_ch();if((G.cst==='campfire'||!G.cst)&&isNight()&&l4NearFire()){const done=l4S().story===S.day+(S.hour<6?-1:0);return `<div class="l4box"><b>🔥 Kể chuyện bên bếp lửa</b><p class="small muted">Đêm xuống, cả nhà quây quần: nghe chuyện cổ tích, truyền kinh nghiệm sống. Tinh thần tăng, tỉnh táo lại.</p><button class="btn sm" data-a="l4story" ${done?'disabled':''}>${done?'Đêm nay đã kể':'Kể một câu chuyện'}</button></div>`+h;}return h;};}
// vẽ mình, văn thân
function l4Paint(){const L=l4S();if(invCount('ochre')<1){uiToast('Cần 1 son đất đỏ (đất sét + than, nung ở bếp).','bad');return;}l4Work([['Hòa son với mỡ thú','grind',0.9,'step'],['Vẽ vạch đỏ lên tay, ngực','work',1.4,'pick']],{icon:'ochre',sk:'craft'},()=>{if(!invTake('ochre',1))return;L.paint=+(TNOW()+2).toFixed(3);l4Spirit(10,1);playerInit();cnt('cnt','paint');uiToast('🎨 Vạch son đỏ trên mình: trông oai vệ, lòng hăng hái (2 ngày).','good');uiHotbar();save();});}
function l4Tattoo(){const L=l4S();if(L.tat){uiToast('Bạn đã văn thân rồi.','');return;}if(!l4AgeOk({age:3})){uiToast('Tục văn thân có từ '+AGES[3].n+'.','');return;}if(invCount('needle')<1||invCount('charcoal')<1){uiToast('Cần kim xương và 1 than củi.','bad');return;}
  l4Work([['Pha muội than với nhựa cây','grind',1.0,'step'],['Vẽ hình giao long lên đùi, lưng','work',1.4,'pick'],['Châm kim xương theo từng nét','lash',2.6,'pick'],['Xoa nghệ cho đỡ sưng','work',0.8,'pick']],{icon:'needle',sk:'craft'},()=>{if(!invTake('charcoal',1))return;L.tat=1;S.p.hp=Math.max(5,S.p.hp-10);addStatus('wound',8);l4Spirit(20,1);S.rep=Math.min(100,(S.rep||0)+10);cnt('cnt','tattoo');playerInit();
    uiToast('🐉 Đã văn thân hình giao long: người Lạc Việt xuống nước không sợ thuồng luồng. Nhớ rửa sạch, băng chỗ châm kẻo nhiễm trùng.','gold');save();});}
// gia đình: kết duyên với người ở cùng, sinh con
const L4KIDN=['Cu Tũn','Bé Mầm','Cu Đất','Bé Mây','Cu Sóc','Bé Hạt','Cu Đá','Bé Sen'];
function l4PSex(){return ((LOOK2[S.look||0]||{}).sex)||'m';}
function l4Home(){return S.builds.find(b=>{const d=pieceDef(b.k);return d&&d.bed&&b.prog==null&&underRoof(b.x,b.z);});}
const L4WED={meatCooked:2,pot:1,flower:3};
function l4Wed(f){const L=l4S();if(L.fam){uiToast('Bạn đã có gia đình.','');return;}if(f.role==='child'||f.kid||f.sex===l4PSex()){return;}if(!l4Home()){uiToast('Cần một mái nhà có chỗ ngủ (giường, ổ nằm dưới mái) để về chung sống.','bad');return;}if(L.sp<40){uiToast('Lòng còn buồn bã: tinh thần cần trên 40.','bad');return;}if(!canPay(L4WED)){uiToast('Lễ cưới cần 2 thịt nướng, 1 nồi gốm, 3 hoa dại.','bad');return;}
  pay(L4WED);L.fam={sp:f.n,d:S.day,kids:0,next:+(TNOW()+3).toFixed(3)};f.spouse=1;l4Spirit(30,1);S.rep=Math.min(100,(S.rep||0)+10);cnt('cnt','wed');uiClose();
  G.paused=true;uiOverlay(true,`<div class="ov-card l4story"><h2>💞 Lễ cưới</h2><p>${esc(f.n)} và ${esc(S.name)} nên vợ nên chồng. Cả làng góp thịt, góp rượu; lễ vật dâng tổ tiên rồi mọi người ăn uống, múa hát bên lửa. Từ nay hai người cùng chung một mái nhà.</p><p class="small muted">Gia đình yên vui, đủ ăn thì sẽ có con. Trẻ con lớn lên sẽ giúp việc bộ lạc.</p><button class="btn big" data-a="recap">Chúc mừng!</button></div>`);sfx('level');save();}
function l4FamTick(){const L=l4S(),F=L.fam,now=TNOW();if(!S.folk)return;
  if(F){const sp=S.folk.find(f=>f.n===F.sp);if(!sp){if(!F.gone){F.gone=1;uiToast(`${F.sp} đã bỏ về làng.`,'bad');}}else if(F.kids<3&&now>=F.next&&L.sp>=35&&now-(sp.fed||0)<1.2){F.kids++;F.next=+(now+5).toFixed(3);
      const sex=Math.random()<0.5?'m':'f',used=new Set(S.folk.map(f=>f.n)),n=L4KIDN.filter(x=>(sex==='m')===x.startsWith('Cu')).find(x=>!used.has(x))||('Bé '+(S.folk.length+1));
      const kid={n,role:'child',seed:(Math.random()*1000)|0,sex,bed:sp.bed,job:'idle',x:sp.x,z:sp.z,fed:now,kid:1,born:+now.toFixed(3)};S.folk.push(kid);folkSpawn(kid);l4Spirit(25,0);cnt('cnt','birth');
      uiToast(`👶 ${F.sp} sinh ${sex==='m'?'một bé trai':'một bé gái'}: đặt tên là ${n}! Bộ lạc thêm người.`,'gold');sfx('level');save();}}
  for(const f of S.folk){if(f.kid&&now-(f.born||now)>=6){delete f.kid;f.role=f.sex==='m'?'hunter':'gatherer';f.job='gather';if(f._o){G.sc.remove(f._o);f._o=null;}uiToast(`🧑 ${f.n} đã lớn khôn, đi làm cùng mọi người.`,'gold');save();}}}
{const _fh=folkHtml;folkHtml=function(){const f=G.folkCur;if(!f)return _fh();const L=l4S();
  if(f.kid){const age=TNOW()-(f.born||TNOW());return `<p class="npc-say">“${esc(['Bố mẹ ơi, kể chuyện đi!','Con muốn đi bắt cá cùng!','Con nhặt được hòn đá đẹp này!'][Math.floor(G.t/9)%3])}”</p><p class="small muted">${esc(f.n)} mới ${age<1?'chào đời':Math.floor(age)+' ngày tuổi'}. Trẻ con chơi quanh nhà, cần ăn mỗi ngày. Khoảng ${Math.max(0,Math.ceil(6-age))} ngày nữa sẽ lớn khôn, làm việc được.</p>`;}
  let h=_fh();if(f.role==='healer')h+=`<div class="l4box"><b>🌿 ${esc(f.n)} là thầy lang của nhà</b><p class="small muted">Mỗi ngày một lần chữa mọi bệnh, rửa băng vết thương, bó nẹp.</p><button class="btn sm" data-a="l4treat" data-k="heal">Nhờ chữa bệnh</button></div>`;
  if(L.fam&&L.fam.sp===f.n)h+=`<div class="l4box"><b>💞 Bạn đời của ${esc(S.name)}</b><p class="small muted">Con cái: ${L.fam.kids}. ${L.fam.kids<3?'Đủ ăn, tinh thần vui vẻ (trên 35) thì sẽ có thêm con.':''}</p></div>`;
  else if(!L.fam&&f.sex!==l4PSex()&&f.role!=='child')h+=`<div class="l4box"><b>💞 Kết duyên</b><p class="small muted">Lễ cưới: dâng lễ tổ tiên, mời làng ăn uống. Cần một mái nhà có chỗ ngủ và tinh thần trên 40.</p><div class="chips">${chips(L4WED)}</div><button class="btn sm" data-a="l4wed" ${canPay(L4WED)?'':'disabled'}>Ngỏ lời, làm lễ cưới</button></div>`;return h;};}
{const _nh=npcHtml;npcHtml=function(){const n=G.npcCur;let h=_nh();if(n&&n.def.role==='healer'){const sick=l4Sick()||S.st.wound;h=`<div class="l4box"><b>🌿 Nhờ thầy lang chữa bệnh</b><p class="small muted">Bà Mo rửa vết thương, đắp thuốc, bó nẹp, sắc thuốc cho. Đổi lại: 5 tình thân.</p><button class="btn sm" data-a="l4npcheal" ${sick&&(S.rep||0)>=5?'':'disabled'}>${sick?'Nhờ chữa':'Bạn đang khỏe'}</button></div>`+h;}return h;};}
/* ===================== 13. Y PHỤC: MẶC, CỞI, ĐỘ BỀN, VÁ, HIỆN TRÊN NGƯỜI ===================== */
const L4SLOT=[['head','Đầu','🧢'],['body','Áo','👕'],['back','Khoác vai','🧥'],['feet','Chân','🦶'],['neck','Cổ','📿'],['acc','Tay','💍']];
wearItem=function(i){const s=S.inv[i];if(!s)return;const I=ITEMS[s.id];if(!I||I.t!=='wear')return;const slot=I.slot||'body',L=l4S(),old=S.wear[slot],oldW=old&&ITEMS[old].dur?clamp((L.wr[slot]??ITEMS[old].dur)/ITEMS[old].dur,0,1):null;
  S.inv[i]=null;S.wear[slot]=s.id;if(I.dur)L.wr[slot]=+(I.dur*(s.w??1)).toFixed(1);else delete L.wr[slot];if(old){invAdd(old,1);if(oldW!=null){const o=S.inv.find(x=>x&&x.id===old&&x.w==null);if(o)o.w=+oldW.toFixed(3);}}
  playerInit();uiToast(`Đã mặc ${I.n}${I.warm?': ấm +'+I.warm:''}${I.rain?', che mưa '+Math.round(I.rain*100)+'%':''}.`,'good');sfx('craft');save();uiOpenRefresh();};
unwear=function(slot){const id=S.wear[slot];if(!id)return;if(!invFits(id,1)){uiToast('Túi đầy.','bad');return;}const L=l4S(),I=ITEMS[id],w=I.dur?clamp((L.wr[slot]??I.dur)/I.dur,0,1):null;delete S.wear[slot];delete L.wr[slot];invAdd(id,1);
  if(w!=null&&w<1){const o=S.inv.find(x=>x&&x.id===id&&x.w==null);if(o)o.w=+w.toFixed(3);}playerInit();save();uiOpenRefresh();};
{const _ww=wearWarm;wearWarm=function(){const w=_ww();return w*(1-Math.min(0.45,(S.p.wet||0)/220));};}
function l4WearTick(gh){const L=l4S(),rain=l4Rain()&&!underRoof(P.x,P.z),busy=!!(G.work||G.act);
  for(const slot in S.wear){const id=S.wear[slot],I=ITEMS[id];if(!I||!I.dur)continue;if(L.wr[slot]==null)L.wr[slot]=I.dur;const was=L.wr[slot];
    let k=1+(busy?0.4:0)+(rain?(I.rain?0.3:0.8):0)+(G.swim?1.5:0);if(I.mat==='bark'&&(rain||G.swim))k+=1.2;if(l4Cozy())k*=0.6;L.wr[slot]=Math.max(0,was-gh*k);
    if(was>I.dur*0.2&&L.wr[slot]<=I.dur*0.2)uiToast(`🧵 ${I.n} đã sờn rách: vá lại kẻo hỏng (🧍 Cơ thể → Y phục).`,'');
    if(L.wr[slot]<=0){delete S.wear[slot];delete L.wr[slot];invAdd('fiber',1);uiToast(`💔 ${I.n} rách bươm, không mặc được nữa.`,'bad');playerInit();save();}}}
const L4FIX={bark:{barkCloth:1,fiber:1},cloth:{cloth:1,fiber:1},fur:{hide:1,rope:1},hide:{hide:1,fiber:1},leaf:{fiber:3}};
function l4FixCost(id){return L4FIX[(ITEMS[id]||{}).mat]||{fiber:2};}
function l4WearFix(slot){const id=S.wear[slot],I=id&&ITEMS[id];if(!I||!I.dur)return;const c=l4FixCost(id),needle=I.mat!=='leaf';if(!canPay(c)){uiToast('Thiếu vật liệu để vá: cần '+b3costTxt(c)+'.','bad');return;}if(needle&&invCount('needle')<1){uiToast('Cần kim xương để vá.','bad');return;}
  l4Work(I.mat==='leaf'?[['Rút bỏ lá rách','work',0.8,'pick'],['Lợp lá mới chồng mép','lash',1.4,'pick'],['Buộc lại','lash',0.6,'pick']]:[['Cắt mảnh vá','work',0.8,'pick'],['Khâu vá bằng kim xương','lash',1.6,'pick'],['Gia cố đường may','lash',0.7,'pick']],{icon:id,sk:'craft'},()=>{if(!canPay(c)||S.wear[slot]!==id)return;pay(c);l4S().wr[slot]=I.dur;addXp('craft',2);cnt('cnt','mend');uiToast(`🧵 Vá xong ${I.n}: bền như mới.`,'good');uiHotbar();save();});}
// hiện y phục trên người
{const _cl=charLook;charLook=function(){const L=_cl(),w=S.wear||{};
  if(w.body==='barkTunic'){L.top='#a7885e';L.top2='#6e5236';L.sleeves=false;}if(w.body==='clothTunic'){L.top='#cbb68c';L.top2='#8a4a2a';L.sleeves=true;}
  if(w.back==='furCloak'){L.cloak='#8a6a48';L.cloak2='#5a4430';}if(w.back==='rainCape'){L.cloak='#8f8a4c';L.cloak2='#66622f';}if(w.feet==='sandals')L.boots='#7a5232';return L;};}
charModel=function(){const L=charLook();if(K3.char2){try{const o=Object.assign({},L,LOOK2[S.look]||{},L.cloak?{cloak:L.cloak,cloak2:L.cloak2}:{});if(S.wear&&S.wear.body){o.bare=false;o.sleeves=L.sleeves;o.top=L.top;o.top2=L.top2;}const g=K3.char2(o);P.char2=true;return g;}catch(e){console.warn('người mới',e);}}P.char2=false;return K3.char(L);};
{const _pi=playerInit;playerInit=function(){_pi();try{l4Decor();}catch(e){console.warn('life4 trang phục',e);}};}
function l4Decor(){const R=P.rig;if(!R||!P.char2||!R.head||!R.top)return;const K=K3,L=S.l4||{},w=S.wear||{},lay=isFP()&&G.on?1:0,add=(par,o)=>{o.traverse(m=>{m.layers.set(lay);if(m.isMesh){m.castShadow=true;}});par.add(o);try{seasonPatchAll(o);}catch(e){}};
  if(w.head==='leafHat'){const h=K.group(K.cone(7.2,4.6,'#d6c08a',{y:-1.9},16),K.torus(6.9,0.28,'#a8925a',{y:-1.85,rx:Math.PI/2},18));add(R.top,h);}
  if(w.neck==='shellBeads'){const g=K.group();for(let i=0;i<12;i++){const a=i/12*Math.PI*2;g.add(K.sphere(0.42,'#f0e6d0',{x:Math.sin(a)*2.05,z:Math.cos(a)*1.85,y:0.15-Math.abs(Math.cos(a/2))*0.4},6,4));}add(R.head,g);}
  if(w.acc&&R.foreL){add(R.foreL,K.group(K.torus(0.95,0.32,w.acc==='bronzeBracelet'?'#b8863a':'#9a9488',{y:-4.4,rx:Math.PI/2},12)));}
  if(L.paint>TNOW()&&R.armL&&R.armR){[R.armL,R.armR].forEach(a=>{add(a,K.group(K.torus(1.05,0.22,'#b8321e',{y:-1.6,rx:Math.PI/2},10),K.torus(1.0,0.22,'#b8321e',{y:-3.2,rx:Math.PI/2},10)));});}
  if(L.tat&&R.shinL&&R.shinR){[R.legL,R.legR].forEach(a=>{if(a)add(a,K.group(K.torus(1.45,0.18,'#2a3a5a',{y:-3,rx:Math.PI/2},10),K.torus(1.35,0.18,'#2a3a5a',{y:-5,rx:Math.PI/2},10)));});}}
/* ===================== 14. CÔNG CỤ: ĐỘ BỀN, MÀI LẠI, GẮN CÁN ===================== */
const L4DUR={axe:1.5,pick:1.5,spear:1.2,hammer:1,sickle:1.1,knife:1.1,club:0.9,polishedAxe:0.85,shoulderAxe:0.75,bronzeAxe:0.42,bronzeSpear:0.45,bronzeKnife:0.4,bronzeSickle:0.4,bronzeHoe:0.4};
const l4D=s=>s&&L4DUR[s.id]?(s.d??100):null;
{const _ht=hitTarget;hitTarget=function(t){if(!G.act||G.act.t!==t)return _ht(t);const s=S.inv[S.sel],id=selTool();let used=null;
  if(t.type==='res'){const D=RT[t.q.t];if(D&&D.tool&&id&&ITEMS[id].tool===D.tool)used=s;}else if(t.type==='animal'&&id&&L4DUR[id])used=s;
  if(used&&L4DUR[used.id]&&(used.d??100)<=0){G.act=null;uiToast(`🪓 ${ITEMS[used.id].n} đã gãy cán: gắn cán mới (chạm vào nó trong Túi đồ).`,'bad');sfx('no');return;}
  _ht(t);
  if(used&&L4DUR[used.id]){const was=used.d??100,w=L4DUR[used.id]*(l4Cozy()?0.6:1)*(t.type==='res'&&RT[t.q.t].sk==='mine'?1.3:1);used.d=Math.max(0,+(was-w).toFixed(1));
    if(was>30&&used.d<=30)uiToast(`🪨 Lưỡi ${ITEMS[used.id].n.toLowerCase()} đã cùn: mài lại cho sắc (Túi đồ).`,'');if(was>0&&used.d<=0){uiToast(`💥 Cán ${ITEMS[used.id].n.toLowerCase()} gãy rồi! Gắn cán mới mới dùng được.`,'bad');sfx('thud');}if(G.t-(L4.hbT||0)>1){L4.hbT=G.t;uiHotbar();}}
  if(!L4.lit&&used&&Math.random()<0.03){addStatus('wound',8);S.p.hp=Math.max(1,S.p.hp-4);uiToast('🌑 Tối quá, trượt tay đứt vào tay! Làm việc ban ngày, hoặc cầm đuốc, ngồi gần lửa.','bad');}};}
{const _sp=swingPer;swingPer=function(t){let p=_sp(t);const s=S.inv[S.sel],d=l4D(s);if(d!=null&&d<=30)p*=1.35;return p;};}
function l4ToolFix(i,kind){const s=S.inv[i];if(!s||!L4DUR[s.id])return;const I=ITEMS[s.id],bronze=/^bronze/.test(s.id),d=s.d??100;
  if(kind==='haft'){const tie=invCount('rope')>0?{rope:1}:invCount('sinew')>0?{sinew:1}:{fiber:2},c=Object.assign({stick:1},tie);if(!canPay(c)){uiToast('Gắn cán cần 1 cành cây và dây (1 dây thừng, 1 gân thú hoặc 2 sợi cỏ).','bad');return;}
    return l4Work([['Chọn cành gỗ cứng, vót thẳng làm cán','whittle',1.2,'chop'],[bronze?'Gọt đầu cán vừa họng tra cán':'Chẻ, khoét đầu cán','carve',1.0,'chop'],['Tra lưỡi vào cán, chèn nêm gỗ','work',0.9,'pick'],['Buộc chặt bằng '+(tie.rope?'dây thừng':tie.sinew?'gân thú':'sợi cỏ')+', trét nhựa cây','lash',1.3,'pick']],{icon:s.id,sk:'craft'},()=>{if(S.inv[i]!==s||!canPay(c))return;pay(c);s.d=Math.max(s.d??0,75);addXp('craft',3);cnt('cnt','haft');uiToast(`🔧 Đã gắn cán mới cho ${I.n}. Mài lại lưỡi để sắc như mới.`,'good');uiHotbar();save();});}
  const c=bronze?{sand:1}:invCount('sand')>0?{sand:1}:{stone:1};if(!canPay(c)){uiToast(bronze?'Mài đồng cần cát mịn (đập đá làm cát).':'Mài lưỡi cần một hòn đá hoặc cát mịn làm đá mài.','bad');return;}if(d<=0){uiToast('Cán gãy rồi: gắn cán trước.','');return;}
  const slab=S.builds.some(b=>b.k==='grindSlab'&&b.prog==null&&Math.hypot(b.x-P.x,b.z-P.z)<120);
  return l4Work([['Té nước lên đá mài','h3scoop',0.6,'drink'],[slab?'Mài lưỡi trên phiến đá mài':'Mài lưỡi trên hòn đá kê','grind',slab?1.4:2.2,'step'],['Thử độ sắc trên cành cây','whittle',0.6,'chop']],{icon:s.id,sk:'craft'},()=>{if(S.inv[i]!==s||!canPay(c))return;pay(c);s.d=100;addXp('craft',2);cnt('cnt','sharpen');uiToast(`🪨 Mài xong: ${I.n} sắc lại như mới.`,'good');uiHotbar();save();});}
{const _uh=uiHotbar;uiHotbar=function(){_uh();try{for(let i=0;i<HOTN;i++){const d=l4D(S.inv[i]);if(d==null||d>=100)continue;const el=document.querySelector(`#hot [data-hot="${i}"]`);if(el)el.insertAdjacentHTML('beforeend',`<i class="l4d${d<=30?' low':''}" style="--v:${Math.max(4,d)}%"></i>`);}}catch(e){}};}
/* ===================== 15. GIAO DIỆN: TÚI ĐỒ, NHẬT KÝ, BẢNG CƠ THỂ ===================== */
function l4WearRow(slot,n,ic){const id=S.wear[slot],I=id&&ITEMS[id],L=l4S();if(!I)return `<div class="l4w"><span class="ic"><b>${ic}</b></span><span><b>${n}</b><br><span class="small muted">—</span></span></div>`;
  const dv=I.dur?Math.round((L.wr[slot]??I.dur)/I.dur*100):null,inf=[I.warm?'ấm +'+I.warm:'',I.rain?'che mưa '+Math.round(I.rain*100)+'%':'',I.sun?'che nắng':'',I.foot?'không dẫm gai':'',I.spirit?'vui vẻ':''].filter(Boolean).join(' · ');
  return `<div class="l4w">${icon(id)}<span><b>${n}: ${esc(I.n)}</b><br><span class="small muted">${esc(inf)}</span>${dv!=null?`<i class="l4bar" style="--v:${dv}%;--c:${dv<20?'#e0533a':'#c9a25a'}"></i>`:''}</span><span class="l4wb">${dv!=null&&dv<100?`<button class="btn sm ghost" data-a="l4fix" data-s="${slot}">Vá</button>`:''}<button class="btn sm ghost" data-a="unwear" data-s="${slot}">Cởi</button></span></div>`;}
function l4WearHtml(){const ws=S.inv.map((s,i)=>s&&ITEMS[s.id].t==='wear'?`<button class="btn sm ghost" data-a="use" data-i="${i}">${icon(s.id)} Mặc ${esc(ITEMS[s.id].n)}${s.w!=null&&s.w<1?' ('+Math.round(s.w*100)+'%)':''}</button>`:'').filter(Boolean).join('');
  return `<p class="small muted">Ấm +${Math.round(wearWarm())} · che mưa ${Math.round(l4RainProt()*100)}%${l4HasSun()?' · che nắng':''}. Áo mặc lâu, dầm mưa, lội nước thì sờn rách: vá kịp thời bằng vật liệu cùng loại (cần kim xương).</p>
    <div class="l4ws">${L4SLOT.map(([s,n,ic])=>l4WearRow(s,n,ic)).join('')}</div>${ws?`<h3>Trong túi</h3><div class="row l4wrap">${ws}</div>`:''}
    <p class="hint">👕 Cách làm: vải vỏ cây sui đập (Hòa Bình) · xe sợi gai bằng dọi rồi dệt ở Khung dệt (Phùng Nguyên) · áo choàng lông, dép da (kim xương) · áo tơi lá cọ, nón lá (sợi cỏ, cành). Mở Chế tạo để làm.</p>`;}
// gắn vào bảng túi đồ: thanh độ bền công cụ, nút mài / gắn cán, mô tả vật phẩm, ô mặc đầy đủ
function l4BagPost(){const p=$('#panel');if(!p)return;p.querySelectorAll('.sl[data-i]').forEach(el=>{const d=l4D(S.inv[+el.dataset.i]);if(d!=null&&d<100)el.insertAdjacentHTML('beforeend',`<i class="l4d${d<=30?' low':''}" style="--v:${Math.max(4,d)}%"></i>`);});
  const sel=G.selSlot,s=sel!=null&&S.inv[sel],det=p.querySelector('.det');if(s&&det){const I=ITEMS[s.id],row=det.querySelector('.row');let h='';if(I.ds)h+=`<p class="small l4ds">${esc(I.ds)}</p>`;
    if(L4DUR[s.id]){const d=s.d??100;h+=`<p class="small">Độ bền: <b>${Math.round(d)}%</b> ${d<=0?'· <span class="warn">gãy cán</span>':d<=30?'· <span class="warn">lưỡi cùn</span>':''}</p>`;if(row)row.insertAdjacentHTML('beforeend',`${d>0&&d<100?`<button class="btn sm ghost" data-a="l4tfix" data-i="${sel}" data-k="sharp">Mài lưỡi</button>`:''}${d<60?`<button class="btn sm ghost" data-a="l4tfix" data-i="${sel}" data-k="haft">Gắn cán mới</button>`:''}`);}
    if(I.t==='wear'&&I.dur&&s.w!=null)h+=`<p class="small">Còn ${Math.round(s.w*100)}% độ bền.</p>`;if(h){if(row)row.insertAdjacentHTML('beforebegin',h);else det.insertAdjacentHTML('beforeend',h);}}
  const ws=p.querySelector('.wears');if(ws){ws.innerHTML=L4SLOT.map(([s,n,ic])=>l4WearRow(s,n,ic)).join('');ws.classList.add('l4ws');const h3=ws.previousElementSibling;if(h3&&h3.tagName==='H3')h3.textContent=`Đang mặc · ấm +${Math.round(wearWarm())} · che mưa ${Math.round(l4RainProt()*100)}%`;}}
{const _jh=journalHtml;journalHtml=function(){return `<div class="row l4jl"><button class="btn sm" data-a="l4go" data-t="guide">📖 Hướng dẫn sinh tồn</button><button class="btn sm ghost" data-a="l4go" data-t="age">🏺 Các thời đại</button><button class="btn sm ghost" data-a="l4go" data-t="body">🧍 Cơ thể</button></div>`+_jh();};}
// hình người: đánh dấu chỗ đau
function l4Svg(){const st=S.st,L=S.l4||{},red='#e0533a',m=[];const dot=(x,y,c,t)=>m.push(`<circle cx="${x}" cy="${y}" r="7" fill="${c}" fill-opacity=".85" stroke="#fff" stroke-width="1.5"><title>${t}</title></circle>`);
  if(st.fever||st.infect||st.heat)m.push(`<circle cx="50" cy="20" r="17" fill="${st.heat?'#ffc23a':'#ff7a4a'}" fill-opacity=".35"/>`);if(st.cold)m.push(`<circle cx="50" cy="70" r="40" fill="#7fd0ff" fill-opacity=".18"/>`);
  if(st.wound||st.bleed)dot(26,68,st.bleed?red:L.wn&&L.wn.b?'#c9a25a':'#d8825a','Vết thương');if(st.infect)dot(26,68,'#c9a83a','Nhiễm trùng');if(st.fracture)dot(60,128,L.fr&&L.fr.spl?'#bfe3a8':'#f4f2ea','Gãy xương');
  if(st.gut||st.poison)dot(50,82,'#a8905a','Bụng');if(st.itch)dot(50,38,'#c6d86a','Cổ họng');if(st.sting)dot(76,62,'#f2c230','Ong đốt');
  const w=S.wear||{};const cl=w.body?'#b8a07a':'none',cape=w.back?(w.back==='rainCape'?'#8f8a4c':'#8a6a48'):'none';
  return `<svg class="l4svg" viewBox="0 0 100 170" aria-hidden="true"><g fill="#d8a878" stroke="#5a3a24" stroke-width="1.5">${cape!=='none'?`<path d="M30 42 L70 42 L80 120 L20 120 Z" fill="${cape}" stroke="none" opacity=".75"/>`:''}<circle cx="50" cy="20" r="13"/><path d="M36 38 h28 l6 58 h-40 z" fill="${cl!=='none'?cl:'#d8a878'}"/><path d="M36 40 l-14 46 l7 3 l12 -38"/><path d="M64 40 l14 46 l-7 3 l-12 -38"/><path d="M38 96 l-4 66 h9 l6 -60 z"/><path d="M62 96 l4 66 h-9 l-6 -60 z"/></g>
    ${w.head==='leafHat'?'<path d="M28 14 L50 -2 L72 14 Z" fill="#d6c08a" stroke="#8a7448"/>':''}${w.feet?'<g fill="#7a5232"><rect x="31" y="160" width="12" height="5" rx="2"/><rect x="57" y="160" width="12" height="5" rx="2"/></g>':''}${m.join('')}</svg>`;}
const L4V=[['hp','❤️','Máu','#e0533a'],['food','🍖','No bụng','#e0913f'],['water','💧','Nước','#4ab0e0'],['stam','⚡','Thể lực','#f2c230'],['warm','🔥','Thân nhiệt','#ff7a50'],['rest','😴','Tỉnh táo','#a98adf'],['clean','🛁','Sạch sẽ','#b8a27a'],['wet','🌧️','Ướt','#7fb8ff'],['sp','✨','Tinh thần','#ffd27a']];
function l4Treats(k){const L=S.l4||{},b=(a,t,on,dk)=>`<button class="btn sm${on?'':' ghost'}" data-a="${a}" ${dk?`data-k="${dk}"`:''} ${on?'':'disabled'}>${t}</button>`,u=(id,t)=>`<button class="btn sm${invCount(id)?'':' ghost'}" data-a="l4eat" data-i="${id}" ${invCount(id)?'':'disabled'}>${t} (${invCount(id)})</button>`;
  switch(k){case 'wound':{const w=L.wn||{};return (w.c>=1?'<span class="l4ok">✓ đã rửa sạch</span>':b('l4treat','💧 Rửa vết thương',invCount('water')+invCount('waterDirty')>0,'clean'))+(w.b?'<span class="l4ok">✓ đã băng</span>':b('l4treat','🩹 Băng lá',invCount('bandage')>0,'band'));}
    case 'bleed':return b('l4treat','🩹 Băng lá',invCount('bandage')>0,'band');case 'infect':return u('salve','Đắp cao nghệ')+b('l4treat','🪵 Nằm nghỉ',true,'rest');
    case 'fracture':return (L.fr&&L.fr.spl?'<span class="l4ok">✓ đã bó nẹp</span>':b('l4treat','🦯 Bó nẹp',invCount('splint')>0,'splint'))+b('l4treat','🪵 Nghỉ ngơi',true,'rest');
    case 'fever':return u('medicine','Uống thuốc ngải')+b('l4treat','🪵 Nằm nghỉ',true,'rest');case 'cold':return u('tea','Trà gừng')+u('congee','Cháo gừng');case 'gut':return u('charcoalWater','Nước than')+u('congee','Cháo gừng');
    case 'poison':return u('mintwater','Nước bạc hà');case 'heat':return u('water','Uống nước')+'<span class="small muted">vào bóng râm</span>';default:return '';}}
function l4BodyHtml(){const p=S.p,L=l4S(),ms=maxStam(),T=G.tempC!=null?Math.round(G.tempC):'?',ill=Object.keys(S.st).filter(k=>STATUS[k]&&!L4CHIP.includes(k));
  const vit=L4V.map(([k,ic,n,c])=>{const v=k==='sp'?L.sp:k==='stam'?p.stam/ms*100:k==='clean'?(p.clean??90):k==='rest'?(p.rest??100):p[k];return `<div class="l4v"><span>${ic} ${n}</span><i class="l4bar" style="--v:${clamp(v,0,100)}%;--c:${c}"></i><em>${Math.round(v)}</em></div>`;}).join('');
  const conds=ill.length?ill.map(k=>{const s=STATUS[k],left=S.st[k];return `<div class="l4c" style="--c:${s.col}"><b>${esc(s.n)}</b><span class="small muted">${left<900?'còn ~'+Math.ceil(left)+' giờ':''}</span><p class="small">${esc(s.d)}</p><div class="row">${l4Treats(k)}</div></div>`;}).join(''):'<p class="small muted">Không đau ốm gì. Giữ ăn chín uống sôi, ngủ đủ, mặc ấm.</p>';
  const healer=(S.folk||[]).find(f=>f.role==='healer');const tools=S.inv.map((s,i)=>{const d=l4D(s);if(d==null)return '';return `<div class="l4t">${icon(s.id)}<span>${esc(ITEMS[s.id].n)}<i class="l4bar" style="--v:${Math.max(3,d)}%;--c:${d<=0?'#e0533a':d<=30?'#e0913f':'#9fd27a'}"></i></span>${d>0&&d<100?`<button class="btn sm ghost" data-a="l4tfix" data-i="${i}" data-k="sharp">Mài</button>`:''}${d<60?`<button class="btn sm ghost" data-a="l4tfix" data-i="${i}" data-k="haft">Gắn cán</button>`:''}</div>`;}).join('');
  const rainOk=l4Rain()&&S.wx.type!=='snow';
  return `<div class="l4body">${l4Svg()}<div class="l4vits">${vit}<p class="small muted">${T}°C · cảm thấy ${G.feel!=null?Math.round(G.feel)+'°C':'?'}${!L4.lit?' · 🌑 tối, làm chậm':''}${L4.fire?' · 🔥 gần lửa':''}</p></div></div>
    <h3>Bệnh tật, thương tích</h3>${conds}${healer?`<button class="btn sm" data-a="l4treat" data-k="heal">🌿 Nhờ ${esc(healer.n)} chữa</button>`:''}
    <h3>Nước uống</h3><p class="small muted">Nước suối nên đun sôi (nồi gốm ở bếp lửa) hoặc hứng nước mưa. Nắng nóng, làm việc nặng, chạy nhiều thì khát nhanh hơn; trời mưa đỡ khát.</p><button class="btn sm${rainOk?'':' ghost'}" data-a="l4treat" data-k="rain" ${rainOk?'':'disabled'}>🌧️ Hứng nước mưa${rainOk?'':' (khi trời mưa)'}</button>
    ${tools?`<h3>Công cụ</h3><p class="small muted">Dùng nhiều thì lưỡi cùn (chậm hơn), lâu ngày gãy cán. Mài lại trên đá, gắn cán mới bằng cành và dây.</p>${tools}`:''}
    <h3>Nghỉ ngơi</h3><div class="row"><button class="btn sm" data-a="l4treat" data-k="rest">🪵 Ngồi nghỉ</button><span class="small muted">Thức lâu sẽ buồn ngủ, làm chậm. Ngủ dưới mái, gần lửa, có giường là ngon nhất.</span></div>`;}
function l4LifeHtml(){const L=l4S(),F=l4FestNow(),nx=l4FestNext(),si=seasonIdx(),fam=L.fam,kids=(S.folk||[]).filter(f=>f.kid);
  const fac=[['Ngồi bên lửa lúc tối','+'],['Kể chuyện, đánh trống, lễ hội','+'],['Thắp hương bàn thờ, tảo mộ','+'],['Đeo chuỗi hạt, vòng; vẽ mình','+'],['Ăn món chín, đổi món','+'],['Ốm đau, rét, ướt, đói','−'],['Ăn đồ ôi, ở một mình trong tối','−']].map(([a,b])=>`<li>${b==='+'?'🔺':'🔻'} ${a}</li>`).join('');
  return `<div class="l4v big"><span>✨ Tinh thần</span><i class="l4bar" style="--v:${L.sp}%;--c:#ffd27a"></i><em>${Math.round(L.sp)}</em></div><p class="small muted">${L.sp>=72?'Phấn chấn: làm việc nhanh hơn.':L.sp<25?'Buồn chán: làm uể oải.':'Bình thường.'}</p><ul class="tips l4fac">${fac}</ul>
    <h3>🌾 Việc theo mùa · ${SEASONS[si].ic} ${SEASONS[si].n}</h3><p class="small">${esc(L4SEAS[si])}</p>${(L.fl||0)>0.05?`<p class="small">🌊 Mực nước sông: ${Math.round(L.fl*100)}%${L.fl>=0.6?' · <b>đang lũ</b>':''}</p>`:''}
    <h3>🥁 Lễ hội</h3><p class="small">${F?`Hôm nay là <b>${F.n}</b>: đánh trống (trống da, đài trống, trống đồng) để mở hội!`:nx?`${nx.n} còn ${nx.d} ngày nữa.`:''} Hội xuân vào ngày đầu mùa xuân, hội mùa (lễ cơm mới) hai ngày đầu mùa thu.</p>
    <h3>🔥 Kể chuyện</h3><p class="small muted">Tối ngồi cạnh bếp lửa đang cháy, mở bảng Chế tạo của bếp để kể chuyện cổ tích (mỗi đêm một chuyện, ${L4STORY.length} chuyện).</p>${l4StoryOk()?'<button class="btn sm" data-a="l4story">Kể một câu chuyện</button>':''}
    <h3>🎨 Vẽ mình, văn thân</h3><p class="small muted">Vẽ son đỏ lên tay, ngực khi đi săn, dự hội (2 ngày). Người Lạc Việt xăm hình giao long để xuống nước không sợ thuồng luồng.</p><div class="row"><button class="btn sm${invCount('ochre')?'':' ghost'}" data-a="l4paint" ${invCount('ochre')?'':'disabled'}>🎨 Vẽ mình (1 son)</button>${L.tat?'<span class="l4ok">🐉 đã văn thân</span>':`<button class="btn sm ghost" data-a="l4tat" ${l4AgeOk({age:3})?'':'disabled'}>🐉 Văn thân${l4AgeOk({age:3})?' (kim xương + than)':' · từ '+esc(AGES[3].n)}</button>`}</div>
    <h3>💞 Gia đình</h3>${fam?`<p class="small">Bạn đời: <b>${esc(fam.sp)}</b> · con: ${fam.kids}${kids.length?' ('+kids.map(k=>esc(k.n)).join(', ')+' còn nhỏ)':''}.</p>`:'<p class="small muted">Mời người làng về ở (tình thân 40, có giường trống), rồi trò chuyện với người ấy để ngỏ lời kết duyên. Gia đình đủ ăn, vui vẻ thì sinh con; trẻ lớn lên đi làm cùng bộ lạc.</p>'}`;}
const L4SEAS=['Gieo mạ, cấy lúa, trồng khoai môn, củ mài; ươm cây con. Mưa phùn ẩm: giữ lửa dưới mái. Đầu xuân mở hội, tảo mộ.','Nắng gắt, giông bão, nước sông dâng (mùa lũ): đội nón, mang nước; làm cỏ, giữ nước ruộng; dựng nhà sàn, kho trên cột tránh lũ.','Gặt lúa, đập lúa, phơi thóc, cất vào chum, kho trên cột. Hội mùa (lễ cơm mới). Hái nấm, củ; hun khói, phơi khô thịt cá để dành.','Rét đậm, đất nghỉ: may áo choàng lông, dệt vải, vá áo, mài rìu, sửa nhà, tích củi. Tối kể chuyện bên lửa.'];
function l4AgeHtml(){const cur=S.age||0;return `<p class="small muted">Tổ tiên người Việt đi từ đồ đá cũ (Sơn Vi) qua đồ đá giữa, đá mới (Hòa Bình, Bắc Sơn), tới làng nông nghiệp (Phùng Nguyên) và đồ đồng (Đông Sơn). Đạt đủ điều kiện thì bộ lạc bước sang thời đại mới và biết thêm kỹ thuật.</p>`+AGES.map((A,i)=>{const X=L4AGE[i]||{need:[],tech:[]},st=i<cur?'done':i===cur?'cur':'next';
    return `<div class="l4age ${st}"><div class="spread"><b>${i<cur?'✔':i===cur?'➤':'○'} ${esc(A.n)}</b><span class="small muted">${i<cur?'đã qua':i===cur?'hiện tại':'sắp tới'}</span></div><p class="small">${esc(A.d)}</p>
      ${X.need.length?`<div class="small l4need">Điều kiện: ${X.need.map(([t,f])=>{let ok=false;try{ok=i<=cur||f();}catch(e){}return `<span class="${ok?'l4ok':'l4no'}">${ok?'✓':'○'} ${esc(t)}</span>`;}).join(' ')}</div>`:''}<ul class="tips">${X.tech.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></div>`;}).join('');}
const L4GUIDE=[
  ['🧍 Cơ thể','Theo dõi máu, no, nước, thể lực, thân nhiệt, tỉnh táo, sạch sẽ và tinh thần ở bảng 🧍 Cơ thể. Thanh nào xuống thấp sẽ nhấp nháy. Ăn chín, uống sôi, ngủ đủ, mặc ấm là gốc của sức khỏe.'],
  ['🩹 Vết thương','Bị thú cào, ngã, đứt tay sẽ có vết thương hở. Rửa bằng nước đã đun sôi để nguội, rồi băng lá rau má. Để bẩn quá 3 giờ dễ nhiễm trùng: sưng mủ, sốt, mất máu. Chữa nhiễm trùng bằng cao nghệ nha đam và nằm nghỉ.'],
  ['🦴 Gãy xương','Ngã từ chỗ cao (vách đá, sàn nhà, cây) có thể gãy chân: đi khập khiễng, không chạy nhảy, không làm việc nặng. Làm Nẹp tre (tre + sợi, hoặc 4 cành + sợi), bó nẹp rồi nghỉ ngơi: ngồi, ngủ thì xương liền nhanh.'],
  ['🤒 Bệnh tật','Sốt (muỗi đốt, nhiễm trùng): uống thuốc ngải, phải nghỉ, cố làm thì lâu khỏi. Cảm lạnh (rét lâu): trà gừng, cháo gừng. Tiêu chảy (nước suối chưa đun): nước than củi, cháo gừng. Ngộ độc (đồ ôi, nấm độc, thịt sống): nước bạc hà. Say nắng (trưa hè không nón): vào bóng râm, uống nước. Thầy lang Bà Mo ở làng chữa được mọi bệnh.'],
  ['💧 Nước','Nước suối có thể làm đau bụng, tiêu chảy: đun sôi bằng nồi gốm ở bếp, múc giếng, hoặc hứng nước mưa vào bầu, ống tre. Mang theo bầu nước khi đi xa. Nắng nóng, chạy, làm nặng thì khát nhanh.'],
  ['🍲 Nấu nướng','Nướng trên lửa (thịt, cá, củ); luộc, nấu canh, nấu cơm, cháo bằng nồi đất; cơm lam trong ống tre; hun khói trên bếp hoặc phơi khô trên giàn cho để lâu; ủ mắm trong chum (cá + muối, 2 ngày). Đồ tươi, đồ chín để lâu sẽ ôi.'],
  ['🌾 Lúa nước','Tuốt lúa hoang ven đầm để có thóc và thóc giống. Từ thời Bắc Sơn: đắp ruộng nước sát suối hoặc cạnh mương có nước. Gieo mạ → chờ mạ lên → nhổ mạ cấy → giữ nước, làm cỏ → gặt (có liềm thì được nhiều) → đập lúa lấy thóc → giã ở cối thành gạo. Cất thóc trong chum, kho trên cột để tránh chuột.'],
  ['🥔 Khoai, củ','Khoai môn dại mọc ven nước, củ mài trong rừng: đào bằng gậy đào cho nhanh. Khoai môn phải nấu chín, ăn sống ngứa cổ. Cầm củ trên tay rồi bấm vào luống đất để trồng.'],
  ['👕 Y phục','Mỗi thứ có độ ấm, độ che mưa và độ bền. Áo tơi lá cọ, nón lá che mưa; nón che cả nắng. Áo choàng lông ấm nhất. Dép da tránh dẫm gai. Áo sờn thì vá (cần kim xương). Ướt thì áo kém ấm.'],
  ['🪓 Công cụ','Công cụ đá mau cùn, đồng bền hơn. Lưỡi cùn: mài trên đá (đồng cần cát). Gãy cán: gắn cán mới (vót cán, tra lưỡi, chèn nêm, buộc dây). Xem độ bền trên thanh công cụ.'],
  ['🌙 Ngày đêm','Làm việc ban ngày. Trong tối làm chậm, dễ đứt tay: cầm đuốc, ngồi gần lửa. Thức lâu thì buồn ngủ; ngủ dưới mái, gần lửa là ngon nhất. Tối ngồi bên lửa kể chuyện.'],
  ['🌊 Mùa vụ, lũ','Xuân gieo cấy; Hạ nắng gắt, giông bão làm nước sông dâng; Thu gặt hái; Đông rét, đất nghỉ. Mùa lũ làm ngập ruộng, nhà sát sông: dựng nhà sàn, kho trên cột. Lũ rút để lại phù sa: luống đất ven sông tốt hẳn.'],
  ['🕯️ Tinh thần','Tinh thần cao thì làm nhanh, thấp thì uể oải. Tăng nhờ lửa ấm, kể chuyện, lễ hội trống, bàn thờ tổ tiên, tảo mộ, đồ trang sức, vẽ mình, ăn ngon.'],
  ['👪 Bộ lạc','Kết thân với làng bằng trao đổi, tặng quà. Mời người về ở, giao việc. Kết duyên với người ở cùng; gia đình vui vẻ đủ ăn sẽ sinh con, con lớn sẽ đi làm.'],
  ['🏺 Thời đại','Sơn Vi → Hòa Bình → Bắc Sơn → Phùng Nguyên → Đông Sơn. Xem điều kiện và kỹ thuật mở ra ở thẻ Thời đại.']];
function l4GuideHtml(){return `<p class="small muted">Những điều người xưa phải biết để sống sót. Chạm vào từng mục để đọc.</p>`+L4GUIDE.map(([t,d],i)=>`<details class="l4g"${i===0?' open':''}><summary>${t}</summary><p class="small">${esc(d)}</p></details>`).join('');}
const L4TABS=[['body','Cơ thể'],['wear','Y phục'],['life','Đời sống'],['age','Thời đại'],['guide','Hướng dẫn']];
{const _uo=uiOpen;uiOpen=function(k,o,keep){if(k!=='l4'){const r=_uo(k,o,keep);if(G.panel==='bag'&&G.ptab==='bag')try{l4BagPost();}catch(e){console.warn('life4 túi',e);}return r;}
  if(!G.on)return;if(G.build)buildEnd();o=o||{};if(o.tab&&!keep)G.l4tab=o.tab;G.popt=o;G.panel='l4';const tab=G.l4tab||'body',p=$('#panel');p.hidden=false;document.body.classList.add('pan');
  const body=tab==='wear'?l4WearHtml():tab==='life'?l4LifeHtml():tab==='age'?l4AgeHtml():tab==='guide'?l4GuideHtml():l4BodyHtml();
  const sc=p.querySelector('.p-body')?p.querySelector('.p-body').scrollTop:0;p.innerHTML=`<div class="p-head"><h2>Cơ thể & đời sống</h2><button class="p-x" data-ui="close" aria-label="Đóng">✕</button></div><div class="p-body"><div class="tabs l4tabs">${L4TABS.map(([t,n])=>`<button class="tb sm${tab===t?' on':''}" data-a="l4tab" data-t="${t}">${n}</button>`).join('')}</div>${body}</div>`;
  if(keep)p.querySelector('.p-body').scrollTop=sc;if(document.pointerLockElement)document.exitPointerLock();};}
function l4Click(e){const a=e.target&&e.target.closest&&e.target.closest('[data-a]');if(!a||!S||!G.on)return;const d=a.dataset;if(!/^l4|^cure$/.test(d.a))return;
  switch(d.a){case 'l4tab':G.l4tab=d.t;uiOpenRefresh();break;case 'l4go':G.l4tab=d.t;uiOpen('l4',{tab:d.t});break;case 'cure':G.l4tab='body';setTimeout(()=>uiOpen('l4',{tab:'body'}),0);break;
    case 'l4treat':l4Treat(d.k);if(G.panel==='l4')uiOpenRefresh();break;case 'l4eat':eat(d.i);if(G.panel==='l4')uiOpenRefresh();break;
    case 'l4fix':l4WearFix(d.s);break;case 'l4tfix':l4ToolFix(+d.i,d.k);break;
    case 'l4story':l4Story();break;case 'l4paint':l4Paint();break;case 'l4tat':l4Tattoo();break;
    case 'l4wed':if(G.folkCur)l4Wed(G.folkCur);break;case 'l4npcheal':if((S.rep||0)>=5){S.rep-=5;l4HealAll(G.npcCur?G.npcCur.def.n:'Thầy lang');uiOpenRefresh();}break;
    case 'l4ferm':{const b=BYID.get(+d.b);if(b)l4Ferm(b);break;}case 'l4fermT':{const b=BYID.get(+d.b);if(b){l4FermTake(b);uiOpenRefresh();}break;}}}
{const _ui=uiInit;uiInit=function(){_ui();const m=$('#menu');if(m&&!m.querySelector('[data-ui="l4"]')){const s=m.querySelector('[data-ui="journal"]');const h='<button data-ui="l4" aria-label="Cơ thể"><span>🧍</span><i>Cơ thể</i></button>';if(s)s.insertAdjacentHTML('beforebegin',h);else m.insertAdjacentHTML('beforeend',h);}
  const st=document.createElement('style');st.textContent=`.l4d{position:absolute;left:7px;right:7px;bottom:3px;height:3px;border-radius:3px;background:rgba(0,0,0,.55);pointer-events:none;overflow:hidden}.l4d:after{content:'';position:absolute;inset:0;width:var(--v);background:#9fd27a}.l4d.low:after{background:#e0533a}
.hs,.sl{position:relative}.l4bar{display:block;height:7px;border-radius:9px;background:rgba(0,0,0,.4);position:relative;overflow:hidden;margin:3px 0}.l4bar:after{content:'';position:absolute;inset:0;width:var(--v);background:var(--c,#c9a25a)}
.l4body{display:flex;gap:10px;align-items:flex-start}.l4svg{width:92px;flex:0 0 92px;height:auto}.l4vits{flex:1;min-width:0}.l4v{display:grid;grid-template-columns:92px 1fr 26px;align-items:center;gap:6px;font-size:12px}.l4v.big{grid-template-columns:110px 1fr 30px;font-size:14px}.l4v em{font-style:normal;color:var(--muted);text-align:right}
.l4c{border-left:4px solid var(--c);padding:6px 8px;margin:6px 0;border-radius:8px;background:rgba(255,255,255,.04)}.l4c p{margin:3px 0}.l4c>span{margin-left:8px}.l4c .row{flex-wrap:wrap;gap:5px}.l4ok{color:#9fe08a;font-size:12px;margin-right:6px}.l4no{color:var(--muted);margin-right:6px}
.l4box{padding:9px;border-radius:12px;background:rgba(255,200,90,.07);border:1px solid var(--line);margin:0 0 8px}.l4box p{margin:4px 0 6px}.l4w{display:grid;grid-template-columns:34px 1fr auto;gap:8px;align-items:center;padding:6px;border-radius:10px;background:rgba(255,255,255,.04);margin:4px 0}
.l4wb{display:flex;gap:4px}.l4ws{display:block}.l4wrap{flex-wrap:wrap;gap:5px}.l4t{display:grid;grid-template-columns:30px 1fr auto auto;gap:6px;align-items:center;font-size:12px;margin:4px 0}.l4age{padding:8px;border-radius:10px;margin:6px 0;background:rgba(255,255,255,.04)}.l4age.cur{border:1px solid var(--acc)}.l4age.next{opacity:.8}.l4age ul{margin:4px 0 0}
.l4need{display:flex;flex-wrap:wrap;gap:2px 8px;margin:3px 0}.l4g{margin:5px 0;padding:6px 8px;border-radius:10px;background:rgba(255,255,255,.04)}.l4g summary{font-weight:700;cursor:pointer}.l4g p{margin:6px 0 2px;line-height:1.5}.l4tabs{flex-wrap:wrap}.l4jl{flex-wrap:wrap;gap:5px;margin-bottom:8px}
.l4story p{line-height:1.55}.l4moral{color:var(--acc)}.l4ds{color:#e8d6b4;margin:4px 0}.l4fac{columns:2;font-size:12px}@media (max-width:600px){.l4fac{columns:1}.l4v{grid-template-columns:80px 1fr 24px}}`;document.head.appendChild(st);
  document.addEventListener('click',l4Click);};}
/* ===================== 16. MỖI GIỜ: ÁO SỜN, TINH THẦN, RUỘNG, LŨ, GIA ĐÌNH ===================== */
function l4Hourly(gh){if(!S||!G.on||gh<=0)return;const L=l4S();l4WearTick(gh);l4PadTick(gh);l4FloodTick(gh);
  // tinh thần trôi dần
  const night=isNight(),fire=L4.fire;let d=-0.8;if(l4Sick())d-=1.5;if(S.p.warm<25)d-=1;if(S.p.wet>60)d-=0.5;if(night&&!L4.lit)d-=1;if(night&&fire)d+=2.5;if(underRoof(P.x,P.z))d+=0.3;d+=0.3*Math.min(4,(S.folk||[]).length);
  for(const s in S.wear){const I=ITEMS[S.wear[s]];if(I&&I.spirit)d+=I.spirit*0.4;}if(L.paint>TNOW())d+=0.5;if(L.tat)d+=0.2;if(S.builds.some(b=>b.k==='altar'&&b.prog==null))d+=0.2;
  L.sp=clamp(L.sp+d*gh,0,100);if(L.paint&&L.paint<=TNOW()){L.paint=0;playerInit();}
  L4.famAcc=(L4.famAcc||0)+gh;if(L4.famAcc>=0.5){L4.famAcc=0;l4FamTick();}
  // đổi mùa: nhắc việc
  const si=seasonIdx();if(L.si!==si){const first=L.si==null;L.si=si;if(!first)setTimeout(()=>uiToast(`🌾 Việc mùa ${SEASONS[si].n}: ${L4SEAS[si]}`,'idea'),5200);}}
function l4FloodTick(gh){const L=l4S(),si=seasonIdx(),wx=S.wx&&S.wx.type,rain=l4Rain()&&(wx==='rain'||wx==='storm');const was=L.fl||0;
  L.fl=clamp(was+gh*((si===1||si===2)&&rain?(wx==='storm'?0.22:0.09):-0.06),0,1);
  if(was<0.6&&L.fl>=0.6){L.flood=1;uiToast('🌊 Nước sông dâng to: lũ về! Ruộng, nhà sát sông bị ngập. Nhà sàn, kho trên cột thì an toàn.','bad');sfx('thunder');cnt('cnt','flood');}
  if(L.flood&&L.fl<0.35){L.flood=0;let n=0;for(const id in S.crops){const b=BYID.get(+id);if(b&&l4NearRiver(b)){S.crops[id].p=Math.min(1,(S.crops[id].p||0)+0.15);n++;}}uiToast(`🌱 Lũ rút để lại lớp phù sa màu mỡ${n?': '+n+' luống ven sông tốt hẳn lên':''}.`,'gold');}
  if(L.fl>=0.6){for(const id in S.crops){const b=BYID.get(+id),c=S.crops[id];if(!b||!l4NearRiver(b))continue;c.p=(c.p||0)-gh*0.12;if(c.p<0){delete S.crops[id];cropShow(b);uiToast('🌊 Nước lũ cuốn trôi một luống cây ven sông.','bad');}}
    for(const b of S.builds){if(b.prog!=null||(b.lv||0)>0||b.cond==null||!B3W[b.k])continue;if(l4NearRiver(b))b.cond=Math.max(0,b.cond-gh*5);}
    if(wdAt(P.x,P.z)>1&&!G.ride)S.p.stam=Math.max(0,S.p.stam-gh*20);}}
function l4NearRiver(b){const k='r'+b.id;if(!L4.nw.has(k))L4.nw.set(k,nearWater(b.x,b.z,80)&&hAt(b.x,b.z)<(typeof waterAt==='function'?waterAt(b.x,b.z):0)+18);return L4.nw.get(k);}
{const _ft=fuelTick;fuelTick=function(gh){_ft(gh);try{l4Hourly(gh);}catch(e){if(!L4.herr){L4.herr=1;console.warn('life4 giờ',e);}}};}
/* ===================== 17. GIẤC NGỦ ===================== */
{const _sl=sleep;sleep=function(b){if(!G.sleeping&&isNight()){const def=pieceDef(b.k);L4.sleep={t:TNOW(),comfy:(underRoof(b.x,b.z)?1:0)+(fireHeat(b.x,b.z)>0?1:0)+(def&&def.id==='bed'?1:0)};}return _sl(b);};}
{const _ur=uiRecap;uiRecap=function(list){const Z=L4.sleep;L4.sleep=null;if(Z&&S){try{l4AfterSleep((TNOW()-Z.t)*24,Z.comfy);}catch(e){console.warn('life4 ngủ',e);}}return _ur(list);};}
function l4AfterSleep(h,comfy){if(!(h>0))return;const L=l4S(),cozy=l4Cozy();S.p.rest=comfy>=2?100:comfy===1?90:75;
  for(const k in S.st){if(L4CHIP.includes(k))continue;let m=1;if(k==='fever')m=1.6;if(k==='fracture')m=L.fr&&L.fr.spl?2:0.8;if(k==='wound')m=L.wn&&L.wn.b?2:1;if(k==='infect')m=0.4;S.st[k]-=h*m;if(S.st[k]<=0){delete S.st[k];uiToast(`Ngủ dậy đã khỏi ${STATUS[k].n}.`,'good');}}
  if(S.st.wound&&L.wn&&!L.wn.c&&!S.st.infect&&Math.random()<1-Math.pow(1-(cozy?0.015:0.04),h)){addStatus('infect');}
  if(S.st.infect||(S.st.fracture&&!(L.fr&&L.fr.spl)))S.p.hp=Math.min(S.p.hp,70);
  l4PadTick(h);L.sp=clamp(L.sp+(comfy>=2?6:comfy?2:-3),0,100);uiHud(true);}
/* ===================== 18. KHỞI TẠO ===================== */
{const _si=sceneInit;sceneInit=function(){l4S();if(S.p.rest==null)S.p.rest=100;_si();try{S.builds.forEach(b=>{if(b.k==='paddy')l4PadShow(b);});L4.lit=l4LitCalc();}catch(e){console.warn('life4 khởi tạo',e);}};}
