/* ===================== THÊM TRANG PHỤC, GIÁP, BINH KHÍ (dựa trên hiện vật Đông Sơn và đời sống thời đó) =====================
   Binh khí : Cung sừng · Nỏ (lẫy đồng, gợi nỏ Cổ Loa) · Dao găm Đông Sơn · Kiếm ngắn đồng · Qua đồng cán dài · Kiếm sắt
   Đầu      : Khăn vấn đầu · Mũ mây đan (đỡ đòn) · Mũ đồng (đỡ đòn)
   Thân     : Áo da không tay · Áo gai dài tay     Lưng: Áo choàng lông chim     Chân: Dép cỏ
   Giáp/khiên: Giáp xương thú · Khiên đồng        Trang sức: Vòng nanh lợn rừng · Nhạc đồng đeo tay
   Mỗi món có hình trên người (gắn theo kích thước mô hình như wear.js), công thức, độ bền; vũ khí dùng lại động tác của loại tương ứng. */
Object.assign(ITEMS,{
  bowHorn:{n:'Cung sừng',t:'tool',tool:'bow',pow:1.4,ds:'Cánh cung tre ốp xương, sừng, dây gân: bắn xa và mạnh hơn cung tre.'},
  crossbow:{n:'Nỏ lẫy đồng',t:'tool',tool:'bow',pow:2.0,ds:'Nỏ gỗ có lẫy đồng giữ dây: căng sẵn, ngắm kỹ rồi mới bóp lẫy. Mạnh gấp đôi cung tre.'},
  bronzeDagger:{n:'Dao găm Đông Sơn',t:'tool',tool:'knife',pow:3.1,ds:'Dao găm đồng cán đúc liền, lưỡi hình lá: đâm nhanh, xẻ thịt ngọt.'},
  bronzeSword:{n:'Kiếm ngắn đồng',t:'tool',tool:'club',pow:4.2,ds:'Kiếm đồng lưỡi thẳng hai cạnh sắc: chém mạnh hơn hẳn gậy, chùy.'},
  bronzeGe:{n:'Qua đồng cán dài',t:'tool',tool:'spear',pow:5.0,ds:'Lưỡi qua đồng tra ngang đầu cán dài: bổ, móc, giữ địch ở xa. Binh khí của lính giữ thành.'},
  ironSword:{n:'Kiếm sắt',t:'tool',tool:'club',pow:5.8,ds:'Kiếm sắt rèn: cứng và giữ lưỡi lâu hơn đồng.'},
  clothTurban:{n:'Khăn vấn đầu',t:'wear',slot:'head',warm:3,dur:200,ds:'Dải vải quấn quanh đầu: gọn tóc, đỡ nắng gió.'},
  rattanHelmet:{n:'Mũ mây đan',t:'wear',slot:'head',warm:1,dur:260,arm:0.06,ds:'Mũ đan mây nhiều lớp: nhẹ, đỡ được gậy đá. Giảm 6% sát thương.'},
  bronzeHelmet:{n:'Mũ đồng',t:'wear',slot:'head',warm:0,dur:600,arm:0.1,ds:'Mũ đồng đúc lót da: che đầu khi xông trận. Giảm 10% sát thương.'},
  hideVest:{n:'Áo da không tay',t:'wear',slot:'body',warm:11,rain:0.2,dur:300,mat:'hide',ds:'Da thú thuộc mềm, khoét cổ, để hở tay cho dễ làm việc: ấm hơn áo vỏ cây.'},
  ramieRobe:{n:'Áo gai dài tay',t:'wear',slot:'body',warm:12,dur:420,ds:'Áo dệt sợi gai mộc, dài tay, vạt chéo buộc dây: bền, mặc quanh năm.'},
  featherCloak:{n:'Áo choàng lông chim',t:'wear',slot:'back',warm:8,rain:0.5,dur:240,spirit:1.5,ds:'Lông chim kết lớp trên nền vải như hình người hoá trang trên trống đồng: mưa trượt đi, mặc vào ai cũng nể.'},
  strawSandals:{n:'Dép cỏ',t:'wear',slot:'feet',warm:1,dur:90,ds:'Bện bằng cỏ, sợi: nhanh làm, nhanh mòn, đỡ đau chân.'},
  boneArmor:{n:'Giáp xương thú',t:'wear',slot:'armor',warm:2,dur:300,arm:0.2,mat:'hide',ds:'Mảnh xương, sừng khoan lỗ khâu lên áo da: đỡ nanh vuốt tốt. Giảm 20% sát thương.'},
  bronzeShield:{n:'Khiên đồng',t:'wear',slot:'shield',warm:0,dur:650,blk:0.85,ds:'Khiên gỗ bọc tấm đồng dập hoa văn: giữ nút Đỡ chặn 85% đòn.'},
  boarTusk:{n:'Vòng nanh lợn rừng',t:'wear',slot:'neck',warm:0,spirit:1.8,ds:'Cặp nanh lợn rừng đeo cổ: dấu hiệu thợ săn giỏi (tinh thần tăng dần).'},
  bronzeBell:{n:'Nhạc đồng đeo tay',t:'wear',slot:'acc',warm:0,spirit:2.2,ds:'Chuỗi chuông đồng nhỏ đeo cổ tay, bước đi leng keng ngày hội.'}});
if(typeof EMO==='object')Object.assign(EMO,{bowHorn:'🏹',crossbow:'🏹',bronzeDagger:'🗡️',bronzeSword:'⚔️',bronzeGe:'🔱',ironSword:'⚔️',clothTurban:'🧣',rattanHelmet:'🪖',bronzeHelmet:'⛑️',hideVest:'🦺',ramieRobe:'👘',featherCloak:'🪶',strawSandals:'🩴',boneArmor:'🦴',bronzeShield:'🛡️',boarTusk:'🐗',bronzeBell:'🔔'});
if(typeof M2V==='object')Object.assign(M2V,{bowHorn:8,crossbow:24,bronzeDagger:16,bronzeSword:40,bronzeGe:34,ironSword:55,clothTurban:5,rattanHelmet:9,bronzeHelmet:36,hideVest:10,ramieRobe:14,featherCloak:18,strawSandals:1,boneArmor:14,bronzeShield:44,boarTusk:6,bronzeBell:15});
if(typeof L4DUR==='object')Object.assign(L4DUR,{bronzeDagger:0.4,bronzeSword:0.4,bronzeGe:0.42,ironSword:0.25});
RECIPES.push(
  {id:'bowHorn',out:{bowHorn:1},in:{bamboo:2,bone:3,sinew:2},st:'workbench',tool:'knife',req:['bone','sinew'],lv:{craft:3},steps:'bamboo'},
  {id:'crossbow',out:{crossbow:1},in:{wood:3,bronze:1,rope:2},st:'workbench',tool:'knife',req:['bronze'],lv:{craft:5},steps:'bamboo'},
  {id:'bronzeDagger',out:{bronzeDagger:1},in:{bronze:1,leather:1},st:'smelter',req:['bronze'],lv:{craft:4},steps:'cast'},
  {id:'bronzeSword',out:{bronzeSword:1},in:{bronze:3,leather:1,stick:1},st:'smelter',req:['bronze'],lv:{craft:5},steps:'cast'},
  {id:'bronzeGe',out:{bronzeGe:1},in:{bronze:2,stick:3,rope:1},st:'smelter',req:['bronze'],lv:{craft:5},steps:'cast'},
  {id:'ironSword',out:{ironSword:1},in:{iron:3,leather:1,wood:1},st:'smelter',req:['iron'],lv:{craft:6},steps:'cast'},
  {id:'clothTurban',out:{clothTurban:1},in:{cloth:1},st:null,req:['cloth']},
  {id:'rattanHelmet',out:{rattanHelmet:1},in:{bambooStrip:6,rope:1},st:null,req:['bambooStrip'],steps:'mxWeave'},
  {id:'bronzeHelmet',out:{bronzeHelmet:1},in:{bronze:2,leather:1},st:'smelter',req:['bronze'],lv:{craft:5},steps:'cast'},
  {id:'hideVest',out:{hideVest:1},in:{hide:3,sinew:1},st:null,tool:'needle',req:['hide','needle'],steps:'sew'},
  {id:'ramieRobe',out:{ramieRobe:1},in:{cloth:3,rope:1},st:null,tool:'needle',req:['cloth']},
  {id:'featherCloak',out:{featherCloak:1},in:{feather:12,cloth:1,rope:2},st:null,tool:'needle',req:['feather','cloth']},
  {id:'strawSandals',out:{strawSandals:1},in:{fiber:6},st:null,req:['fiber']},
  {id:'boneArmor',out:{boneArmor:1},in:{bone:8,hide:2,sinew:3},st:null,tool:'needle',req:['bone','needle'],steps:'sew'},
  {id:'bronzeShield',out:{bronzeShield:1},in:{bronze:3,wood:2,leather:1},st:'smelter',req:['bronze'],lv:{craft:5},steps:'cast'},
  {id:'boarTusk',out:{boarTusk:1},in:{bone:3,rope:1},st:null,tool:'knife',req:['bone','rope']},
  {id:'bronzeBell',out:{bronzeBell:1},in:{bronze:1,rope:1},st:'smelter',req:['bronze'],lv:{craft:4},steps:'cast'});
/* hình vũ khí: dùng mô hình sẵn có gần nhất, kéo dài / đổi màu cho ra dáng */
const TB_MODEL={bowHorn:['bow',1.08,'#d8c8a0'],crossbow:['bow',0.82,'#7a5632'],bronzeDagger:['bronzeKnife',0.95,null],bronzeSword:['bronzeKnife',1.75,null],bronzeGe:['bronzeSpear',1.02,null],ironSword:['knifeIron',1.8,null]};
{const _m=model;model=function(spec){try{if(spec&&spec[0]==='tool'&&TB_MODEL[spec[1]]){const [base,sc,col]=TB_MODEL[spec[1]],g=_m.call(this,['tool',base]);if(sc!==1)g.scale.multiplyScalar(sc);if(col)g.traverse(o=>{if(o.isMesh&&o.material&&o.material.color){o.material=o.material.clone();o.material.color.lerp(new THREE.Color(col),0.55);}});
      if(spec[1]==='bronzeGe'){/* lưỡi qua tra ngang gần đầu cán */const b=new THREE.Mesh(new THREE.ConeGeometry(1.1,7,4),new THREE.MeshStandardMaterial({color:'#b0793a',metalness:0.7,roughness:0.4,flatShading:true}));b.scale.z=0.35;b.rotation.z=Math.PI/2;const bb=new THREE.Box3().setFromObject(g),ax=bb.max.z-bb.min.z>bb.max.y-bb.min.y?'z':'y';b.position[ax]=(ax==='z'?bb.max.z:bb.max.y)/g.scale.x*0.78;b.position.x=3.2;g.add(b);}
      if(spec[1]==='crossbow'){const st=new THREE.Mesh(new THREE.BoxGeometry(1.6,1.8,26),new THREE.MeshStandardMaterial({color:'#6a4a2a',roughness:0.9,flatShading:true}));st.position.set(0,0,-6);g.add(st);}
      return g;}}catch(e){}return _m.apply(this,arguments);};}
/* áo, áo choàng: màu trên người */
{const _cl=charLook;charLook=function(){const L=_cl.apply(this,arguments),w=(S&&S.wear)||{};
  if(w.body==='hideVest'){L.top='#7a5232';L.top2='#4e331c';L.sleeves=false;}if(w.body==='ramieRobe'){L.top='#d6c69c';L.top2='#7a4a2a';L.sleeves='long';}
  if(w.back==='featherCloak'){L.cloak='#e4dcc6';L.cloak2='#8a2e1a';}if(w.feet==='strawSandals')L.boots='#b89a5a';return L;};}
Object.assign(WEAR_NECK,{boarTusk:['#efe6cf',1]});Object.assign(WEAR_ACC,{bronzeBell:['#b0793a',0.8]});Object.assign(WEAR_ARM,{boneArmor:['#d8ccb0',0,0]});Object.assign(WEAR_SH,{bronzeShield:['#b0793a',3.7]});
/* mũ mới: vẽ thêm sau khi wear.js gắn đồ */
const TB_HEAD={clothTurban:['turban','#8a2e1a',0],rattanHelmet:['helm','#b89a5a',0],bronzeHelmet:['helm','#b0793a',0.75]};
{const _wa=wearAttach;wearAttach=function(g,w){const r=_wa.apply(this,arguments);try{const R=g&&g.userData&&g.userData.rig,h=w&&TB_HEAD[w.head];if(R&&R.head&&h){const hb=wearBox(R.head,true);if(hb){const K=K3,rx=(hb.max.x-hb.min.x)/2,top=hb.max.y,cx=(hb.max.x+hb.min.x)/2,cz=(hb.max.z+hb.min.z)/2;let m;
        if(h[0]==='turban')m=K.group(K.torus(rx*1.04,rx*0.26,h[1],{x:cx,y:top-rx*0.62,z:cz-rx*0.05,rx:Math.PI/2,sy:1.1},16),K.torus(rx*0.92,rx*0.24,'#a8402a',{x:cx,y:top-rx*0.36,z:cz-rx*0.05,rx:Math.PI/2,sy:1.1},16),K.sphere(rx*0.3,h[1],{x:cx+rx*0.7,y:top-rx*0.3,z:cz-rx*0.6},6,5));
        else{m=K.group(K.dome(rx*1.17,h[1],{x:cx,y:top-rx*1.0,z:cz-rx*0.05,sz:1.12},12),K.torus(rx*1.17,rx*0.1,h[2]?'#8a5a26':'#8a6a3a',{x:cx,y:top-rx*0.98,z:cz-rx*0.05,rx:Math.PI/2,sy:1.12},16),K.cone(rx*0.2,rx*0.5,h[1],{x:cx,y:top+rx*0.12,z:cz-rx*0.05},6));if(h[2])wearMetal(m,h[2],0.42);}
        m.traverse(o=>{o.userData.wearAdd=1;if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.layers.mask=R.head.layers.mask;}});R.head.add(m);}}}catch(e){}return r;};}
/* sức đánh: mã cũ chỉ nhận vũ khí theo tên bắt đầu bằng spear/club/knife/axe/bow nên kiếm đồng, qua đồng, dao găm, kiếm sắt, nỏ bị tính như tay không */
{const _fp=fistPow;fistPow=function(){try{const id=selTool(),I=id&&ITEMS[id];if(I&&I.t==='tool'&&I.pow&&['spear','club','knife','axe','bow'].includes(I.tool))return I.pow;}catch(e){}return _fp.apply(this,arguments);};}
for(const k of ['bowHorn','crossbow','bronzeDagger','bronzeSword','bronzeGe','ironSword'])if(ITEMS[k])ITEMS[k].c5c='vk';
