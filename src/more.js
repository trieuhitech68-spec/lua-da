/* ===================== THÊM CHO TRỌN VẸN (more.js) =====================
   Ghi chú thiết kế — những gì còn thiếu sau khi rà soát cả game, và vì sao thêm:
   1. GÙI TRE, TÚI DA ĐEO HÔNG: túi đồ cố định 24 ô quá chật khi đi xa. Người miền núi xưa đeo gùi đan
      (tre, dây rừng) và túi da. Đeo gùi +6 ô, túi da +4 ô (hiện trên lưng nhân vật). Tháo ra thì đồ trong
      ô thêm dồn về túi chính; không đủ chỗ thì không cho tháo (không mất đồ).
   2. TIỆN ÍCH TÚI ĐỒ: Xếp gọn túi, Cất nhanh đồ cùng loại vào giỏ/rương gần, Lấy hết, Xếp kho; ô tìm công
      thức (gõ không dấu cũng được) và đánh dấu ★ công thức hay làm (nổi lên đầu).
   3. CHÀI LƯỚI: chì lưới bằng đá khía (Hòa Bình) hoặc đất nung (Phùng Nguyên, Đông Sơn) có thật ở di chỉ.
      Đan chài bằng kim xương, quăng ở chỗ nước sâu: được nhiều cá hơn đâm giáo; sáng sớm, chiều tà, trời mưa
      cá ăn mạnh hơn.
   4. TRÂU VÀ CÀY: trâu nước được thuần ở Đông Nam Á, lưỡi cày đồng là hiện vật Đông Sơn. Đổi nghé với Tù
      trưởng → nghé lớn thành trâu, tự gặm cỏ (mùa đông cần máng ăn). Cầm cày mắc ách cho trâu rồi cày luống
      đất trước khi gieo: cây lớn nhanh hơn, gặt thêm. Không có trâu thì người tự kéo cày, rất mệt.
   5. PHÒNG THỦ: hàng rào cọc nhọn (chặn kẻ cướp và thú dữ; người đi qua cổng), chòi canh (trèo lên nhìn xa,
      mở bản đồ, đoán ngày Núi Đá kéo quân; người nhà Canh gác bắn tên từ chòi; tù và báo động trước), hố
      chông (thú hoặc kẻ cướp sa xuống bị thương, phải cắm lại chông).
   6. SẤM SÉT, NẮNG HẠN: giông bão có sét đánh cây cao, cây cháy thành than: lại gần lấy "lửa trời" làm đuốc
      (người xưa giữ lửa từ cháy rừng). Có đuốc thì mồi lửa cho bếp không cần khoan. Mùa hạ có năm hạn:
      mấy ngày không mưa, ruộng xa giếng/mương chậm lớn, phải múc nước tưới.
   7. ĐÀN ĐÁ VÀ ÂM NHẠC: đàn đá (lithophone) là nhạc cụ tiền sử có thật ở Việt Nam. Dựng đàn đá rồi gõ theo
      năm cung (hò xự xang xê cống), có bài mẫu; sáo tre cũng thổi được theo ý. Chơi nhạc làm vui (tinh thần).
   8. TRUYỆN CỔ CỦA GIÀ LÀNG: Ông Mường kể 8 truyền thuyết (Con Rồng cháu Tiên, Sơn Tinh – Thủy Tinh, Bánh
      chưng bánh giầy, Thánh Gióng, Chử Đồng Tử, Mai An Tiêm…), mỗi truyện kèm một việc gắn với vùng đất và
      thời đại, xong việc về kể lại để nhận quà và tình thân.
   9. THÀNH TỰU VÀ THỐNG KÊ: 30 thành tựu, sổ thống kê (ngày sống, cây đốn, thú săn, đường đã đi…).
  10. CÀI ĐẶT: cỡ chữ (dễ đọc trên điện thoại), chế độ chụp ảnh (ẩn giao diện, lưu/chia sẻ ảnh).
  11. ÂM THANH MÔI TRƯỜNG THEO VÙNG: suối chảy, sóng biển, gió núi, ve sầu trưa hè, vượn hú rừng già,
      tre kẽo kẹt, nước nhỏ giọt trong hang.
   Lưu: mọi trạng thái mới ở S.mx (bản lưu cũ vẫn chạy). Chạy nhẹ: các vòng kiểm tra đều hãm nhịp. */

/* ===================== 1. TRẠNG THÁI ===================== */
const MXI=()=>{if(!S.mx||typeof S.mx!=='object')S.mx={};const o=S.mx;o.pack=o.pack||{};o.ach=o.ach||{};o.q=o.q||{i:0,on:0};o.fav=o.fav||{};o.plow=o.plow||{};o.pit=o.pit||{};o.wet=o.wet||{};o.dist=o.dist||0;o.dry=o.dry||0;return o;};
const mxgc=k=>(S.cnt&&S.cnt[k])||0;
const mxNorm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'d').toLowerCase();
const MXK={};// trạng thái tạm (không lưu)

/* ===================== 2. VẬT PHẨM, CÔNG THỨC, CÔNG TRÌNH ===================== */
Object.assign(ITEMS,{
  backBasket:{n:'Gùi tre',t:'pack',pk:'back',slots:6,ds:'Gùi đan nan tre có quai đeo hai vai như người miền núi: mang thêm 6 ô đồ khi đi rừng, đi chợ phiên.'},
  hipBag:{n:'Túi da đeo hông',t:'pack',pk:'hip',slots:4,ds:'Túi da thuộc khâu bằng kim xương, buộc dây ngang hông: thêm 4 ô đồ.'},
  netSinker:{n:'Chì lưới',t:'res',ds:'Hòn đá cuội khía rãnh hoặc viên đất nung có lỗ, buộc vào mép lưới cho lưới chìm nhanh. Di chỉ Hòa Bình, Phùng Nguyên, Đông Sơn đều có.'},
  fishNet:{n:'Chài lưới gai',t:'tool',tool:'net',pow:0,ds:'Lưới đan bằng dây, mép buộc chì. Cầm trên tay, đứng mép nước sâu bấm Hành động để quăng chài.'},
  woodPlough:{n:'Cày gỗ',t:'tool',tool:'plough',pow:1,ds:'Cày gỗ một lưỡi, có ách cho trâu kéo. Cầm cày đứng bên luống đất trống để cày trước khi gieo.'},
  bronzePlough:{n:'Cày lưỡi đồng',t:'tool',tool:'plough',pow:2,ds:'Lưỡi cày đồng hình tam giác của người Đông Sơn lắp vào thân cày gỗ: xới sâu, đất tơi hơn.'},
  calf:{n:'Nghé con',t:'pet',ds:'Trâu con đổi được ở làng. Mở túi, bấm "Thả ra" để dắt về nuôi: ba ngày sau lớn thành trâu kéo cày.'}});
RECIPES.push(
  {id:'backBasket',out:{backBasket:1},in:{bambooStrip:8,rope:2},st:null,req:['bambooStrip'],steps:'mxWeave'},
  {id:'backBasketV',out:{backBasket:1},in:{fiber:14,stick:4,rope:1},st:null,req:['fiber','rope'],steps:'mxWeave'},
  {id:'hipBag',out:{hipBag:1},in:{leather:2,rope:1},st:null,tool:'needle',req:['leather'],steps:'sew'},
  {id:'netSinkerS',out:{netSinker:3},in:{stone:3},st:null,req:['stone','rope'],steps:'mxSinker'},
  {id:'netSinker',out:{netSinker:6},in:{clay:2},st:'kiln',req:['clay','rope'],steps:'clay'},
  {id:'fishNet',out:{fishNet:1},in:{rope:6,netSinker:6},st:null,tool:'needle',req:['netSinker'],steps:'mxNet'},
  {id:'woodPlough',out:{woodPlough:1},in:{wood:4,rope:2},st:'workbench',tool:'axe',req:['wood','rope'],age:3,steps:'mxPlough'},
  {id:'bronzePlough',out:{bronzePlough:1},in:{bronze:2,wood:3,rope:1},st:'smelter',tool:'mould',req:['bronze','mould'],age:4,steps:'cast'});
Object.assign(WSTEP,{
  mxWeave:[['Chẻ nan, vót nhẵn','whittle',1.2,'chop'],['Đan đáy gùi','lash',1.8,'pick'],['Đan thân, nong miệng','lash',2.0,'pick'],['Tết quai đeo','lash',1.0,'pick']],
  mxSinker:[['Chọn cuội dẹt','gather',0.8,'pick'],['Ghè khía rãnh hai đầu','knap',1.8,'mine']],
  mxNet:[['Se dây gai cho chắc','lash',1.2,'pick'],['Đan mắt lưới bằng kim xương','lash',2.6,'pick'],['Buộc chì quanh mép','lash',1.4,'pick'],['Gỡ rối, xếp chài','work',0.8,'pick']],
  mxPlough:[['Chọn gỗ cong làm thân cày','gather',0.8,'pick'],['Đẽo lưỡi và bắp cày','carve',2.2,'chop'],['Đẽo ách, lắp chạc','whittle',1.6,'chop'],['Buộc dây chão','lash',1.0,'pick']]});
BCAT.push(['thu','Phòng thủ']);
BUILD.push(
  {id:'lithophone',n:'Đàn đá',cat:'trang',kind:'obj',fp:[1,1],small:1,cost:{stone:12,wood:2,rope:2},req:['stone','rope'],age:1,d:'Những thanh đá dài ngắn ghè mỏng, kê trên giá gỗ: gõ lên thành tiếng trong như chuông. Đàn đá là nhạc cụ có từ thời tiền sử ở Việt Nam. Bấm Hành động để chơi.'},
  {id:'palisade',n:'Hàng rào cọc nhọn',cat:'thu',kind:'edge',cost:{wood:3,rope:1},req:['wood','rope'],d:'Cọc gỗ to vót nhọn cắm sát nhau cao quá đầu người: kẻ cướp và thú dữ không vượt qua được. Chừa cổng để mình ra vào.'},
  {id:'palisadeGate',n:'Cổng rào cọc',cat:'thu',kind:'edge',door:1,cost:{wood:4,rope:2},req:['wood','rope'],d:'Cổng hai cánh trong hàng rào cọc: người nhà đi qua được, ban đêm kẻ cướp, thú dữ vẫn bị chặn ngoài.'},
  {id:'watchtower',n:'Chòi canh',cat:'thu',kind:'obj',fp:[1,1],cost:{wood:10,rope:4,fiber:8},req:['wood','rope'],need:'workbench',d:'Chòi bốn cột cao 4 m: trèo lên nhìn xa (mở bản đồ quanh vùng, đoán khi nào Núi Đá kéo quân). Người nhà làm việc Canh gác sẽ bắn tên từ chòi, thổi tù và báo động.'},
  {id:'spikePit',n:'Hố chông',cat:'thu',kind:'obj',fp:[1,1],small:1,cost:{stick:8,fiber:4},req:['stick','digStick'],d:'Đào hố, cắm chông tre vót nhọn, phủ lá lên trên: thú dữ hoặc kẻ cướp sa xuống bị thương nặng. Sập rồi phải cắm lại chông.'});
const MXP=['lithophone','palisade','palisadeGate','watchtower','spikePit'];
// mô hình (K3): hàng rào dọc theo trục x dài 40, gốc ở chân
const MXM={
  palisade:()=>{const K=K3,a=[];for(let i=0;i<8;i++){const x=-17.5+i*5,h=50+((i*37)%7);a.push(K.cyl(2.3,2.6,h,i%2?'dwood':'wood',{x,y:-3},7),K.cone(2.3,6,'wood',{x,y:h-3},7));}
    a.push(K.box(41,1.6,1.6,'#6a4a2a',{y:14,z:2.6}),K.box(41,1.6,1.6,'#6a4a2a',{y:36,z:2.6}));return K.group(a);},
  palisadeGate:()=>{const K=K3,a=[];[-17,17].forEach(x=>a.push(K.cyl(3,3.2,62,'dwood',{x,y:-3},8),K.cone(3,6,'dwood',{x,y:59},8)));a.push(K.box(40,3,3,'#5e3e24',{y:56}));
    [[-1,1],[1,-1]].forEach(([s,r])=>{const g=K.group();for(let i=0;i<3;i++)g.add(K.cyl(1.6,1.8,46,'wood',{x:s*(3+i*3.6),y:0},6));g.add(K.box(12,1.4,1.4,'#6a4a2a',{x:s*6.6,y:12,z:1.6}),K.box(12,1.4,1.4,'#6a4a2a',{x:s*6.6,y:34,z:1.6}));g.position.set(s*-14,0,0);g.rotation.y=r*1.1;a.push(g);});return K.group(a);},
  watchtower:()=>{const K=K3,a=[];[[-13,-13],[13,-13],[-13,13],[13,13]].forEach(([x,z])=>a.push(K.cyl(2,2.4,108,'dwood',{x,z,y:-2},7)));
    a.push(K.box(36,3,36,'#7a5a38',{y:80}));[[0,-17,36,1.2],[0,17,36,1.2],[-17,0,1.2,36],[17,0,1.2,36]].forEach(([x,z,w,d])=>a.push(K.box(w,10,d,'#8a6a44',{x,z,y:83})));
    a.push(K.cone(29,24,'thatch',{y:104},10));[[-13,-13,13,13],[13,-13,-13,13]].forEach(([x0,z0,x1,z1])=>a.push(K.box(1.4,1.4,Math.hypot(x1-x0,z1-z0),'#6a4a2a',{y:40,ry:Math.atan2(x1-x0,z1-z0),center:1})));
    for(let i=0;i<2;i++)a.push(K.cyl(0.9,0.9,92,'wood',{x:i?6:-6,y:0,z:24,rx:-0.2},5));for(let k=0;k<9;k++)a.push(K.box(13,1,1,'#7a5232',{y:6+k*9.4,z:24-(6+k*9.4)*0.2,center:1}));/* bậc thang nằm đúng giữa hai thanh dọc (thanh ngả vào trong 0,2 rad) */
    a.push(K.cone(2.2,8,'bone',{x:12,y:92,z:-12,rz:1.2},6));return K.group(a);},
  spikePit:()=>{const K=K3,a=[K.cyl(15,14,0.8,'#2a1e14',{y:-0.3},14),K.torus?K.torus(15,1.6,'soil',{rx:Math.PI/2,y:0.4},16):null];for(let i=0;i<9;i++){const an=i/9*6.283,r=i%3?8:3;a.push(K.cone(1,11,'bamboo',{x:Math.cos(an)*r,z:Math.sin(an)*r,y:-1,rx:Math.sin(an)*0.15,rz:-Math.cos(an)*0.15},5));}
    for(let i=0;i<6;i++){const an=i/6*6.283+0.3;a.push(K.sphere(4.5,'leaf',{x:Math.cos(an)*10,z:Math.sin(an)*10,y:0.6,sy:0.18},7,4));}return K.group(a);},
  lithophone:()=>{const K=K3,a=[K.box(4,10,22,'dwood',{x:-15}),K.box(4,10,22,'dwood',{x:15}),K.box(34,1.2,1.2,'#7a5232',{y:10,z:-8}),K.box(34,1.2,1.2,'#7a5232',{y:10,z:8})];
    for(let i=0;i<8;i++){const L=22-i*1.7,x=-12.5+i*3.6;a.push(K.box(2.8,1.4,L,i%2?'dstone':'stone',{x,y:11.2}));}
    a.push(K.cyl(0.8,1,14,'wood',{x:6,y:11,z:13,rz:Math.PI/2,center:1},6),K.ico(2.2,'stone',{x:-4,y:2,z:14},0,0.2,4));return K.group(a);}};
{const _model=model;model=function(spec){try{if(K3.ok&&spec[0]==='piece'&&MXM[spec[1]])return MXM[spec[1]]();}catch(e){console.warn('mô hình more',spec,e);}return _model(spec);};}
// nghé / trâu: dựng từ mô hình bò tót, đổi màu xám đen, thấp hơn
const MXPET={buffalo:'Trâu nhà',calfB:'Nghé'};Object.assign(PETN,MXPET);
function mxBuffaloModel(calf){let o=null;try{o=animalModel('gaur');}catch(e){}if(!o){const K=K3;o=K.group(K.box(30,18,14,'#3b3f44',{y:12}));}
  o.traverse(m=>{if(!m.isMesh||!m.material)return;const one=M=>{const c=M.clone();if(c.color){if(c.vertexColors)c.color.setRGB(0.62,0.64,0.68);else{const l=c.color.r*0.3+c.color.g*0.59+c.color.b*0.11;if(l<0.45)c.color.setRGB(0.09+l*0.5,0.095+l*0.5,0.11+l*0.5);}}return c;};m.material=Array.isArray(m.material)?m.material.map(one):one(m.material);});
  o.scale.multiplyScalar(calf?0.5:0.86);return o;}
{const _pm=petModel;petModel=function(k){if(MXPET[k])return mxBuffaloModel(k==='calfB');return _pm(k);};}
TRADES.chief.push([{meat:6,hide:4},{calf:1}]);
if(typeof EMO==='object')Object.assign(EMO,{backBasket:'🧺',hipBag:'👝',netSinker:'🪨',fishNet:'🕸️',woodPlough:'⛏️',bronzePlough:'🔱',calf:'🐃'});

/* ===================== 3. GÙI, TÚI ĐEO: THÊM Ô ===================== */
function mxExtra(){const pk=MXI().pack;let n=0;for(const k in pk){const I=pk[k]&&ITEMS[pk[k]];if(I&&I.slots)n+=I.slots;}return n;}
function mxInvFix(){const want=INVN+mxExtra();while(S.inv.length<want)S.inv.push(null);}
function mxPackOn(i){const s=S.inv[i];if(!s)return;const I=ITEMS[s.id];if(!I||I.t!=='pack')return;const M=MXI(),slot=I.pk;
  if(M.pack[slot]){if(!mxPackOff(slot,true))return;}const j=S.inv.indexOf(s);if(j<0)return;s.n--;if(s.n<=0)S.inv[j]=null;M.pack[slot]=s.id;mxInvFix();G.selSlot=null;
  cnt('cnt','pack');uiToast(`🎒 Đeo ${I.n.toLowerCase()}: thêm ${I.slots} ô đồ (cuối túi).`,'good');sfx('pick');mxDecor();uiHotbar();uiOpenRefresh();save();}
function mxPackOff(slot,quiet){const M=MXI(),id=M.pack[slot];if(!id)return true;const I=ITEMS[id],newLen=S.inv.length-(I.slots||0);if(newLen<INVN)return false;
  const tail=S.inv.slice(newLen).filter(Boolean),head=S.inv.slice(0,newLen).map(s=>s&&Object.assign({},s));
  for(const s of tail){if(slotsAdd(head,s.id,s.n)>0){uiToast(`Túi chính không đủ chỗ cho đồ trong ${I.n.toLowerCase()}. Bỏ bớt đồ rồi mới tháo.`,'bad');sfx('no');return false;}}
  if(slotsAdd(head,id,1)>0){uiToast('Túi đầy, không còn chỗ cất '+I.n.toLowerCase()+'.','bad');sfx('no');return false;}
  S.inv.length=0;head.forEach(s=>S.inv.push(s));delete M.pack[slot];if(S.sel>=S.inv.length)S.sel=0;G.selSlot=null;if(!quiet)uiToast(`Đã tháo ${I.n.toLowerCase()} cất vào túi.`,'');mxDecor();uiHotbar();uiOpenRefresh();save();return true;}
// gùi hiện trên lưng nhân vật
function mxDecor(){try{if(MXK.packO){if(MXK.packO.parent)MXK.packO.parent.remove(MXK.packO);MXK.packO=null;}const R=P.rig;if(!R||!S||!S.mx)return;const pk=S.mx.pack||{};if(!pk.back&&!pk.hip)return;
  const par=R.torso||R.back||R.hips;if(!par)return;const K=K3,g=K.group();
  if(pk.back){const bk=K.group(K.cyl(5.2,3.6,11,'bamboo',{},10),K.torus?K.torus(5.2,0.5,'#7a5a2a',{y:11,rx:Math.PI/2},12):null,K.box(0.7,10,0.7,'#5e3e24',{x:-2.6,y:3,z:4.2,rx:0.25}),K.box(0.7,10,0.7,'#5e3e24',{x:2.6,y:3,z:4.2,rx:0.25}));bk.position.set(0,-4,-6.5);bk.rotation.x=0.15;g.add(bk);}
  if(pk.hip){const hb=K.group(K.box(5,5.5,2.4,'hide',{}),K.box(5.2,1.6,2.6,'#7a5232',{y:4.4}));hb.position.set(5.6,-12,1);g.add(hb);}
  const lay=isFP()&&G.on?1:0;g.traverse(m=>{m.layers.set(lay);if(m.isMesh)m.castShadow=true;});par.add(g);MXK.packO=g;}catch(e){console.warn('gùi',e);}}
{const _pi=playerInit;playerInit=function(){_pi();mxDecor();};}

/* ===================== 4. TÚI ĐỒ: XẾP GỌN, CẤT NHANH, TÌM CÔNG THỨC, ★ ===================== */
const MXTORD={tool:0,wear:1,pack:2,boat:3,food:4,drink:5,med:6,herb:7,seed:8,sap:9,pet:10,res:11};
const mxPlain=s=>s&&Object.keys(s).every(k=>k==='id'||k==='n');
function mxSortArr(arr,from){const list=arr.slice(from).filter(Boolean),out=[];
  for(const s of list){if(mxPlain(s)&&maxStack(s.id)>1){let left=s.n;for(const o of out){if(left<=0)break;if(o.id===s.id&&mxPlain(o)&&o.n<maxStack(s.id)){const k=Math.min(left,maxStack(s.id)-o.n);o.n+=k;left-=k;}}if(left>0)out.push({id:s.id,n:left});}else out.push(s);}
  out.sort((a,b)=>{const A=ITEMS[a.id]||{},B=ITEMS[b.id]||{};return ((MXTORD[A.t]??20)-(MXTORD[B.t]??20))||String(A.n||a.id).localeCompare(String(B.n||b.id),'vi')||(b.n-a.n);});
  for(let i=from;i<arr.length;i++)arr[i]=out[i-from]||null;}
function mxSort(){mxSortArr(S.inv,HOTN);G.selSlot=null;sfx('craft');uiToast('⇅ Đã xếp gọn túi (thanh công cụ giữ nguyên).','');uiHotbar();uiOpenRefresh();save();}
function mxStackTo(stores){let moved=0;for(const st of stores){const has=new Set(st.filter(Boolean).map(s=>s.id));for(let i=HOTN;i<S.inv.length;i++){const s=S.inv[i];if(!s||!has.has(s.id))continue;const left=slotsAdd(st,s.id,s.n);moved+=s.n-left;if(left>0)s.n=left;else S.inv[i]=null;}}return moved;}
function mxQuickStack(){const st=nearStores();if(!st.length){uiToast('Không có giỏ, rương, chum nào ở gần.','bad');return;}const n=mxStackTo(st);uiToast(n?`📥 Cất ${n} món cùng loại vào kho gần.`:'Không có món nào trùng loại với đồ trong kho.',n?'good':'');sfx('pick');uiHotbar();uiOpenRefresh();save();}
{const _bh=bagHtml;bagHtml=function(){let h=_bh();const M=MXI(),sel=G.selSlot,s=sel!=null&&S.inv[sel];
  h=h.replace('<div class="grid6">',`<div class="row mxbag"><button class="btn sm ghost" data-a="mxsort">⇅ Xếp gọn</button><button class="btn sm ghost" data-a="mxstack"${nearStores().length?'':' disabled'}>📥 Cất vào kho gần</button><span class="small muted">${S.inv.filter(Boolean).length}/${S.inv.length} ô</span></div><div class="grid6 mxinv">`);
  if(s){const I=ITEMS[s.id]||{};let x='';if(I.t==='pack')x=`<button class="btn" data-a="mxpack" data-i="${sel}">🎒 Đeo lên (+${I.slots} ô)</button>`;if(I.t==='pet')x=`<button class="btn" data-a="mxcalf" data-i="${sel}">🐃 Thả ra, dắt về nuôi</button>`;if(I.play)x+=`<button class="btn ghost" data-a="mxmusic">🎵 Thổi theo ý</button>`;
    if(x)h=h.replace('<div class="row">','<div class="row">'+x);}
  const rows=[['back','Lưng','🧺'],['hip','Hông','👝']].map(([k,n,ic])=>{const id=M.pack[k];return `<div class="wear">${id?icon(id):'<span class="ic"><b>'+ic+'</b></span>'}<span>${n}: ${id?esc(ITEMS[id].n)+' · +'+ITEMS[id].slots+' ô':'—'}</span>${id?`<button class="btn sm ghost" data-a="mxunpack" data-s="${k}">Tháo</button>`:''}</div>`;}).join('');
  return h+`<h3>Đồ đeo mang · +${mxExtra()} ô</h3><div class="wears mxpk">${rows}</div>${mxExtra()?'':'<p class="hint">🧺 Đan Gùi tre (nan tre hoặc sợi cỏ, dây) và khâu Túi da để mang thêm đồ khi đi xa.</p>'}`;};}
{const _sh=storeHtml;storeHtml=function(b){const h=_sh(b);return `<div class="row mxbag"><button class="btn sm" data-a="mxstack1" data-b="${b.id}">📥 Cất đồ cùng loại</button><button class="btn sm ghost" data-a="mxtake" data-b="${b.id}">📤 Lấy hết</button><button class="btn sm ghost" data-a="mxsorts" data-b="${b.id}">⇅ Xếp kho</button></div>`+h;};}
function mxStore(id){const b=BYID.get(+id);return b&&S.store[b.id]?S.store[b.id]:null;}
// tìm công thức + ★ (xử lý trên DOM, không dựng lại bảng khi gõ)
function mxCraftPost(){const p=$('#panel'),bd=p&&p.querySelector('.p-body');if(!bd)return;const M=MXI();const cards=[...bd.querySelectorAll('.rc')];if(!cards.length)return;
  const first=cards[0],par=first.parentNode;const favs=[];
  cards.forEach(c=>{const b=c.querySelector('[data-a="craft"],[data-a="aqneed"]');/* món còn thiếu đồ có nút "Tự kiếm & làm" thay nút Làm: trước bị bỏ sót nên không lọc, không đếm được */if(!b)return;const id=b.dataset.r;c.dataset.mxr=id;const nb=c.querySelector('.rc-b b')||c.querySelector('b');c.dataset.mxn=mxNorm(nb?nb.textContent:'');const a=c.querySelector('.rc-a');if(a&&!a.querySelector('.mxfav'))a.insertAdjacentHTML('afterbegin',`<button class="btn sm ghost mxfav${M.fav[id]?' on':''}" data-a="mxfav" data-r="${id}" aria-label="Đánh dấu">${M.fav[id]?'★':'☆'}</button>`);if(M.fav[id])favs.push(c);});
  for(let i=favs.length-1;i>=0;i--)par.insertBefore(favs[i],par.querySelector('.rc'));
  if(!bd.querySelector('#mxq')){const tabs=bd.querySelector('.tabs');if(tabs)tabs.insertAdjacentHTML('afterend',`<div class="mxsearch"><input id="mxq" type="search" placeholder="🔍 Tìm công thức (gõ không dấu cũng được)" value="${esc(G.mxq||'')}" autocomplete="off"></div>`);else bd.insertAdjacentHTML('afterbegin','<div class="mxsearch"><input id="mxq" type="search" autocomplete="off"></div>');
    const inp=bd.querySelector('#mxq');inp.addEventListener('input',()=>{G.mxq=inp.value;mxCraftFilter();});inp.addEventListener('keydown',e=>e.stopPropagation());}
  mxCraftFilter();}
function mxCraftFilter(){const q=mxNorm(G.mxq||'').trim();const p=$('#panel');if(!p)return;let n=0;p.querySelectorAll('.rc[data-mxr]').forEach(c=>{const ok=!q||c.dataset.mxn.includes(q);c.style.display=ok?'':'none';if(ok)n++;});let e=p.querySelector('.mxnone');const sb=p.querySelector('.mxsearch');if(!n&&q&&sb){if(!e){sb.insertAdjacentHTML('afterend','<p class="muted mxnone">Không thấy công thức nào.</p>');}}else if(e)e.remove();}
{const _uo=uiOpen;uiOpen=function(k,o,keep){if(k==='mx'){const sc=$('#panel .p-body')?$('#panel .p-body').scrollTop:0;_uo(k,o,keep);mxFill(keep?sc:0);return;}const r=_uo(k,o,keep);try{if(G.panel==='bag'&&G.ptab==='craft')mxCraftPost();}catch(e){console.warn('tìm công thức',e);}return r;};}

/* ===================== 5. CHÀI LƯỚI ===================== */
function mxNetCast(t){if(G.work)return;const ng=needGate(true);if(ng){uiToast(ng,'bad');sfx('no');return;}const deep=wdAt(t.x,t.z);if(deep<1.2){uiToast('Nước nông quá, chài không xòe được: ra chỗ nước sâu hơn (mép sông, hồ).','bad');sfx('no');return;}
  // tấm lưới xòe tròn trên mặt nước
  let net=null;try{const T=THREE;net=new T.Mesh(new T.CircleGeometry(16,20),new T.MeshBasicMaterial({color:0xd8c89a,transparent:true,opacity:0.45,wireframe:true,depthWrite:false}));net.rotation.x=-Math.PI/2;net.position.set(t.x,waterAt(t.x,t.z)+0.6,t.z);net.scale.setScalar(0.2);G.sc.add(net);MXK.net={o:net,t0:G.t};}catch(e){}
  S.p.stam=Math.max(0,S.p.stam-6);G.throwAnim=0.5;sfx('bow');
  l4Work([['Gom chài, vắt lên vai','work',0.7,'pick'],['Quăng chài xòe tròn','lash',0.9,'step'],['Chờ chì kéo lưới chìm','work',1.6,'drink'],['Kéo chài vào bờ','lash',1.5,'pick']],{sk:'hunt',icon:'fishNet'},()=>{
    if(MXK.net){G.sc.remove(MXK.net.o);MXK.net=null;}const h=S.hour,dawn=(h>=5&&h<8)||(h>=17&&h<20),rain=(G.wxK||0)>0.4&&S.wx&&S.wx.type!=='snow',si=seasonIdx();
    let n=Math.floor(Math.random()*2.6+(deep>3?1:0.4)+(dawn?1:0)+(rain?0.6:0)+skLv('hunt')*0.15-(si===3?1:0));n=clamp(n,0,6);
    if(!n){uiToast('Kéo chài lên: chỉ có rong rêu. Thử chỗ sâu hơn, hoặc lúc sáng sớm, chiều tà.','');addXp('hunt',1);return;}
    const out={fish:n};if(Math.random()<0.25)out.shell=1+Math.floor(Math.random()*2);if(!ITEMS.shell)delete out.shell;give(out,[t.x,P.y+12,t.z]);cnt('cnt','fish',n);cnt('cnt','netfish');addXp('hunt',2+n);sfx('pick');
    uiToast(`🐟 Kéo chài được ${n} con cá${dawn?' (cá ăn mạnh lúc sáng sớm, chiều tà)':''}!`,'gold');save();});
  setTimeout(()=>{if(MXK.net&&G.t-MXK.net.t0>7){G.sc.remove(MXK.net.o);MXK.net=null;}},9000);}

/* ===================== 6. TRÂU VÀ CÀY ===================== */
const mxPlough=()=>P.toolId==='woodPlough'||P.toolId==='bronzePlough';
const mxBuffNear=(x,z,r)=>(S.pets||[]).find(p=>p.k==='buffalo'&&p.hitch&&Math.hypot(p.x-x,p.z-z)<(r||140));
function mxCalfOut(i){const s=S.inv[i];if(!s||s.id!=='calf')return;s.n--;if(s.n<=0)S.inv[i]=null;S.pets=S.pets||[];const p={id:(S.pseq=(S.pseq||0)+1),k:'calfB',x:P.x+Math.sin(P.ry)*30,z:P.z+Math.cos(P.ry)*30,born:TNOW(),fed:TNOW()};S.pets.push(p);petSpawn(p);
  uiClose();uiToast('🐃 Nghé lon ton theo bạn. Ba ngày nữa nghé lớn thành trâu kéo cày. Cỏ ngoài đồng đủ cho nó ăn, mùa đông bỏ rơm, cỏ vào máng.','gold');cnt('cnt','tame');sfx('pick');uiHotbar();save();}
{const _pi=petInfo;petInfo=function(p){if(p.k==='calfB')return {name:'Nghé con',verb:'Vuốt ve',ok:true,icon:'fiber',warn:'Còn nhỏ, chưa kéo cày được'};
  if(p.k==='buffalo'){if(p.hitch)return {name:'Trâu đang mắc ách',verb:'Tháo ách, thả trâu',ok:true,icon:'fiber'};if(mxPlough())return {name:'Trâu nhà',verb:'Mắc ách cày',ok:true,icon:P.toolId};return {name:'Trâu nhà',verb:'Vuốt ve',ok:true,icon:'fiber',warn:'Cầm cày trên tay để mắc ách'};}return _pi(p);};}
{const _pu=petUse;petUse=function(p){if(p.k==='calfB'){sfx('eat');puff(p.x,8,p.z,'#ffd27a',3);uiToast('Nghé dụi đầu vào tay bạn.','');return;}
  if(p.k==='buffalo'){if(p.hitch){p.hitch=0;p.hx=p.x;p.hz=p.z;uiToast('🐃 Tháo ách: trâu thong thả gặm cỏ quanh đây.','');}else if(mxPlough()){p.hitch=1;uiToast('🐃 Đã mắc ách: trâu đi theo bạn. Đứng bên luống đất trống bấm "Cày đất".','good');}else uiToast('Trâu phì phò, ngoe nguẩy đuôi. Cầm cày để mắc ách.','');sfx('step');save();return;}return _pu(p);};}
{const _pt=petsTick;petsTick=function(dt){_pt(dt);if(!S.pets)return;for(const p of S.pets){if(p.k!=='buffalo'||!p.hitch||!p._o)continue;const tx=P.x-Math.sin(P.ry)*34,tz=P.z-Math.cos(P.ry)*34,dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz);
    if(d>8){const sp=d>220?170:95;p.x+=dx/d*Math.min(d,sp*dt);p.z+=dz/d*Math.min(d,sp*dt);p._ry=Math.atan2(dx,dz);p._tx=p.x;p._tz=p.z;p._t=1;const s=Math.sin(G.t*9+p._ph)*0.5,R=p._rig||{};if(R.legFL){R.legFL.rotation.x=s;R.legBR.rotation.x=s;R.legFR.rotation.x=-s;R.legBL.rotation.x=-s;}}
    p._o.position.set(p.x,Math.max(hAt(p.x,p.z),waterAt(p.x,p.z)),p.z);p._o.rotation.y=lerpAng(p._o.rotation.y,p._ry||0,Math.min(1,dt*6));}};}
{const _ph=petsHourly;petsHourly=function(gh){if(S.pets){const day=TNOW();for(const p of S.pets){if(!MXPET[p.k])continue;if(seasonIdx()!==3)p.fed=day;// gặm cỏ ngoài đồng
      if(p.k==='calfB'&&day-(p.born||0)>3){p.k='buffalo';if(p._o)G.sc.remove(p._o);p._o=null;uiToast('🐃 Nghé đã lớn thành trâu: cầm cày mắc ách để cày ruộng.','gold');}}}_ph(gh);};}
function mxPloughDo(b){const ng=needGate(true);if(ng){uiToast(ng,'bad');sfx('no');return;}const buff=mxBuffNear(b.x,b.z),M=MXI();
  const steps=buff?[['Đặt lưỡi cày vào đất','work',0.7,'pick'],['Giục trâu kéo cày theo luống','lash',1.6,'step'],['Cày quay đầu, lật đất','lash',1.2,'step'],['Bừa cho đất tơi','work',0.9,'step']]:[['Đặt lưỡi cày vào đất','work',0.8,'pick'],['Tự kéo cày (rất mệt)','lash',3.2,'step'],['Lật đất, đập vỡ cục','grind',2.0,'step']];
  l4Work(steps,{sk:'farm',icon:P.toolId},()=>{M.plow[b.id]=P.toolId==='bronzePlough'?2:1;S.p.stam=Math.max(0,S.p.stam-(buff?4:24));if(!buff)S.p.food=Math.max(0,S.p.food-4);puff(b.x,b.y+4,b.z,'#7a5634',8);sfx('chop');cnt('cnt','plough');addXp('farm',buff?5:3);
    uiToast(buff?'🐃 Trâu kéo cày băng băng: đất tơi xốp, cây sẽ lớn nhanh và cho thêm hạt.':'😮‍💨 Cày tay xong một luống, mỏi rã rời. Có trâu kéo thì nhẹ hơn nhiều.','good');save();});}

/* ===================== 7. PHÒNG THỦ: RÀO CỌC, CHÒI CANH, HỐ CHÔNG ===================== */
function mxSegs(){if(MXK.segN===S.builds.length&&MXK.segs)return MXK.segs;const segs=[];let cx=0,cz=0;for(const b of S.builds){if((b.k!=='palisade'&&b.k!=='palisadeGate')||b.prog!=null)continue;const v=b.r%2;segs.push({v,x:b.x,z:b.z,b});cx+=b.x;cz+=b.z;}
  MXK.segs=segs;MXK.segN=S.builds.length;if(segs.length){cx/=segs.length;cz/=segs.length;let r=0;segs.forEach(s=>r=Math.max(r,Math.hypot(s.x-cx,s.z-cz)));MXK.segC={x:cx,z:cz,r:r+60};}else MXK.segC=null;return segs;}
// chặn người/thú đi xuyên đoạn rào (so vị trí khung trước và khung này: không lọt dù chạy nhanh)
function mxBlock(e,dt){const segs=MXK.segs;if(!segs||!segs.length)return false;const fresh=G.t-(e._mxpT||-9)<0.25;const px=fresh?e._mxpx:e.x,pz=fresh?e._mxpz:e.z;e._mxpT=G.t;let hit=false;
  for(const s of segs){if(s.v){if(Math.abs(e.z-s.z)>23&&Math.abs(pz-s.z)>23)continue;const a=px-s.x,b=e.x-s.x;if(Math.abs(b)<5||a*b<0){const side=Math.sign(a)||Math.sign(b)||1;if(Math.abs(e.z-s.z)<=22){e.x=s.x+side*6;hit=true;}}}
    else{if(Math.abs(e.x-s.x)>23&&Math.abs(px-s.x)>23)continue;const a=pz-s.z,b=e.z-s.z;if(Math.abs(b)<5||a*b<0){const side=Math.sign(a)||Math.sign(b)||1;if(Math.abs(e.x-s.x)<=22){e.z=s.z+side*6;hit=true;}}}}
  e._mxpx=e.x;e._mxpz=e.z;return hit;}
function mxDefTick(dt){const segs=mxSegs();if(segs.length&&MXK.segC){const C=MXK.segC;
    if(G.t-(MXK.entT||0)>0.5){MXK.entT=G.t;const L=[];for(const f of (G.foes||[]))if(f.alive&&Math.hypot(f.x-C.x,f.z-C.z)<C.r+300)L.push(f);for(const a of (G.animals||[]))if(a.alive&&(a.angry||a.home||(ANIMALS[a.kind]&&ANIMALS[a.kind].aggro!=='never'&&a.kind!=='snake'))&&Math.hypot(a.x-C.x,a.z-C.z)<C.r+300)L.push(a);
      MXK.ents=L;}
    for(const e of (MXK.ents||[])){if(!e.alive)continue;if(mxBlock(e,dt)){if(e.o)e.o.position.set(e.x,e.o.position.y,e.z);e._mxB=(e._mxB||0)+dt;
        if(e._mxB>5){e._mxB=0;if(e.kind==='raider'){if(e.mode==='raid'&&!e.flee){e.flee=1;cnt('cnt','repel');if(G.t-(MXK.repT||0)>30){MXK.repT=G.t;uiToast('🛡️ Kẻ cướp không vượt được hàng rào cọc, đành rút lui!','gold');}}}else{e.angry=false;if(e.home)delete e.home;}}}}}
  // hố chông
  if(G.t-(MXK.pitT||0)>0.25){MXK.pitT=G.t;const M=MXI();for(const b of S.builds){if(b.k!=='spikePit'||b.prog!=null||M.pit[b.id]===0)continue;
      for(const f of (G.foes||[]))if(f.alive&&Math.hypot(f.x-b.x,f.z-b.z)<13){M.pit[b.id]=0;foeDamage(f,4);uiToast('🪤 Một tên cướp sa xuống hố chông!','gold');sfx('thud');save();break;}
      if(M.pit[b.id]===0)continue;for(const a of (G.animals||[]))if(a.alive&&a.kind!=='snake'&&Math.abs(a.x-b.x)<14&&Math.abs(a.z-b.z)<14&&Math.hypot(a.x-b.x,a.z-b.z)<12){M.pit[b.id]=0;animalDamage(a,a.kind==='rabbit'||a.kind==='junglefowl'?1:7);uiToast(`🪤 ${a.n||'Thú'} sa xuống hố chông!`,'gold');sfx('thud');cnt('cnt','pit');save();break;}}}
  // chòi canh: người nhà Canh gác bắn tên
  if(G.t-(MXK.towT||0)>1.6){MXK.towT=G.t;const guards=(S.folk||[]).filter(f=>f.job==='guard').length;const towers=S.builds.filter(b=>b.k==='watchtower'&&b.prog==null);
    if(towers.length&&guards){let shots=Math.min(guards,towers.length);for(const t of towers){if(shots<=0)break;let tgt=null,td=280;for(const f of (G.foes||[]))if(f.alive&&f.mode==='raid'){const d=Math.hypot(f.x-t.x,f.z-t.z);if(d<td){td=d;tgt=f;}}
        if(tgt){foeDamage(tgt,1.2);sfx('bow');shots--;continue;}for(const a of (G.animals||[]))if(a.alive&&a.angry){const d=Math.hypot(a.x-t.x,a.z-t.z);if(d<220){animalDamage(a,1);sfx('bow');shots--;break;}}}}}}
function mxTowerUse(b){l4Work([['Trèo thang lên chòi','lash',1.2,'step'],['Đưa mắt nhìn bốn phía','work',1.6,'pick']],{sk:'run',icon:'spear'},()=>{fogReveal(b.x,b.z,1700);addXp('run',2);cnt('cnt','tower');
    const hostile=(G.animals||[]).filter(a=>a.alive&&a.angry||a.alive&&ANIMALS[a.kind]&&/night|stalk|territory/.test(ANIMALS[a.kind].aggro)&&Math.hypot(a.x-b.x,a.z-b.z)<900&&a.kind!=='snake').length;
    let msg=`🗼 Từ chòi canh nhìn ra: ${hostile?hostile+' con thú dữ lảng vảng quanh vùng':'không thấy thú dữ gần'}.`;
    if(S.war&&G.camp){const d=Math.max(0,(S.war.raidAt||0)-S.day),dir=mxDir(G.camp.x-b.x,G.camp.z-b.z);msg+=` Khói trại Núi Đá ở phía ${dir}. `+(d<=0?'Đêm nay chúng có thể kéo quân tới!':d===1?'Chừng mai sẽ có cướp.':`Khoảng ${d} ngày nữa chúng mới tới.`);}
    uiToast(msg,'good');save();});}
const mxDir=(dx,dz)=>{const a=Math.atan2(dx,-dz)*180/Math.PI,i=Math.round(((a+360)%360)/45)%8;return ['bắc','đông bắc','đông','đông nam','nam','tây nam','tây','tây bắc'][i];};
function mxRaidWarn(){if(!S.war||!G.camp)return;const tw=S.builds.find(b=>b.k==='watchtower'&&b.prog==null);if(!tw)return;const M=MXI();if(S.day<(S.war.raidAt||3)||S.war.raidDay===S.day||M.warned===S.day)return;if(S.hour<18.5||S.hour>=21)return;
  M.warned=S.day;mxHorn();uiToast(`📯 Tù và trên chòi canh rúc lên: có đuốc lửa lố nhố phía ${mxDir(G.camp.x-tw.x,G.camp.z-tw.z)}! Đêm nay kẻ cướp hoặc thú dữ sẽ tới. Đóng cổng rào, gọi người nhà về.`,'bad');}
function mxHorn(){if(!AU.on)return;auInit();if(!AU.ctx)return;try{tone(196,1.3,'sawtooth',0.07,1.04);tone(294,1.1,'triangle',0.05,1.02,0.15);}catch(e){}}

/* ===================== 8. SẤM SÉT, LỬA TRỜI, NẮNG HẠN ===================== */
function mxStrike(){let best=null;for(const i of near(P.x,P.z,520)){const q=RES[i];if(!q||q.st!==0||q.lock)continue;const D=RT[q.t];if(!D||!D.fall)continue;const d=Math.hypot(q.x-P.x,q.z-P.z);if(d<110)continue;const sc=(D.giant?60:0)+q.s*30-d*0.05+Math.random()*20;if(!best||sc>best.sc)best={q,sc};}
  if(!best)return false;const q=best.q,top=q.y+70*q.s;try{const T=THREE,pts=[];let x=q.x,z=q.z;for(let y=top+700;y>top;y-=70){pts.push(new T.Vector3(x,y,z));x+=(Math.random()-0.5)*40;z+=(Math.random()-0.5)*40;}pts.push(new T.Vector3(q.x,top,q.z));
    const ln=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:0xeef4ff}));ln.frustumCulled=false;G.sc.add(ln);setTimeout(()=>{G.sc.remove(ln);ln.geometry.dispose();},220);}catch(e){}
  G.flash=1.6;sfx('thunder');try{auInit();if(AU.on&&AU.ctx){noise(0.25,2400,0.8,0.5);tone(60,0.8,'sine',0.4,0.5);}}catch(e){}
  // cây bốc cháy
  let fl=null;try{const K=K3;fl=K.group(K.cone(7*q.s,26*q.s,'fire',{y:0},7),K.cone(5*q.s,20*q.s,'fire',{x:5*q.s,y:4*q.s},6),K.cone(4*q.s,18*q.s,'fire',{x:-4*q.s,z:3*q.s,y:6*q.s},6));fl.traverse(m=>{if(m.isMesh)m.castShadow=false;});fl.position.set(q.x,q.y+18*q.s,q.z);G.sc.add(fl);}catch(e){}
  MXK.burn=MXK.burn||[];MXK.burn.push({q,t0:G.t,fl});uiToast('⚡ Sét đánh trúng một cây cao gần đây, cây bốc cháy! Lại gần lấy "lửa trời" làm đuốc mang về.','bad');return true;}
function mxBurnTick(dt){const L=MXK.burn;if(!L||!L.length)return;
  for(const b of L.slice()){const age=G.t-b.t0;if(b.fl){const k=1+Math.sin(G.t*12+b.t0)*0.12;b.fl.scale.set(k,1/k*(age>60?Math.max(0.2,(75-age)/15):1),k);}if(G.t-(b.pT||0)>0.5){b.pT=G.t;puff(b.q.x,b.q.y+60*b.q.s,b.q.z,'#5a5450',2);}
    if(age>75){if(b.fl)G.sc.remove(b.fl);L.splice(L.indexOf(b),1);if(b.q.st===0){resDeplete(b.q);try{dropAdd('charcoal',b.q.x+6,hAt(b.q.x+6,b.q.z)+1,b.q.z);dropAdd('charcoal',b.q.x-5,hAt(b.q.x-5,b.q.z+4)+1,b.q.z+4);}catch(e){}}}}}
function mxSkyFire(b){if(invCount('stick')<2||invCount('fiber')<1){uiToast('Cần 2 cành và 1 sợi cỏ để bó đuốc, châm vào cây đang cháy.','bad');sfx('no');return;}if(!invFits('torch',1)){uiToast('Túi đầy!','bad');return;}
  invTake('stick',2);invTake('fiber',1);give({torch:1},[b.q.x,P.y+20,b.q.z]);cnt('cnt','skyfire');addXp('cook',3);sfx('build');uiToast('🔥 Bạn châm đuốc từ lửa trời! Cầm đuốc tới bếp chưa nhóm để mồi lửa, khỏi phải khoan.','gold');uiHotbar();save();}
// có đuốc trong túi thì mồi lửa cho bếp
{const _fs=fireStart;fireStart=function(b){if(hasTool('fire')||!hasTool('torch'))return _fs(b);if(isRaining()&&!fireSheltered(b.x,b.z))return _fs(b);if(invCount('wood')<1&&invCount('stick')<2){uiToast('Cần củi: 1 gỗ hoặc 2 cành.','bad');return;}
  l4Work([['Xếp bùi nhùi, cành nhỏ','gather',0.9,'pick'],['Châm đuốc vào bùi nhùi','cook',1.0,'step'],['Thổi cho lửa bén','cook',0.9,'drink']],{sk:'cook',icon:'torch'},()=>{if(invCount('wood')>0){invTake('wood',1);S.fuel[b.id]=4;}else{invTake('stick',2);S.fuel[b.id]=2;}flameSync();sfx('build');puff(b.x,b.y+10,b.z,'#ffb060',8);uiToast('🔥 Mồi lửa từ đuốc: bếp đã cháy!','gold');cnt('cnt','fire');save();});};}
// nắng hạn mùa hạ: ít mưa, ruộng xa nước chậm lớn, tưới bằng bầu nước
function mxDrought(){const M=MXI();return !!M.drT&&TNOW()<M.drT;}
function mxWaterSrc(b){return S.builds.some(w=>((w.k==='well'||w.k==='wellStone')||w.k==='channel'||w.k==='rainBarrel')&&w.prog==null&&Math.hypot(w.x-b.x,w.z-b.z)<200);}
{const _wt=weatherTick;weatherTick=function(dt){if(G.on&&S.wx&&mxDrought()&&TNOW()>=S.wx.until){S.wx={type:Math.random()<0.35?'cloudy':'clear',until:TNOW()+0.15+Math.random()*0.25};}_wt(dt);};}
{const _ct=cropsTick;cropsTick=function(gd){const M=MXI(),before={};for(const id in S.crops)before[id]=S.crops[id].p||0;_ct(gd);const dr=mxDrought(),now=TNOW();
  for(const id in S.crops){const c=S.crops[id],b=BYID.get(+id);if(!b||before[id]==null)continue;let k=1;if(M.plow[id])k*=M.plow[id]>=2?1.45:1.3;if(dr&&!mxWaterSrc(b)&&!((M.wet[id]||0)>now))k*=0.4;if(k!==1){const dp=(c.p||0)-before[id];c.p=Math.min(1,before[id]+dp*k);}}};}
function mxWaterCrop(b){const id=invCount('water')?'water':invCount('waterDirty')?'waterDirty':null;if(!id){uiToast('Cần bầu nước (nước suối cũng được) để tưới.','bad');sfx('no');return;}invTake(id,1);if(invFits('flask',1))invAdd('flask',1);
  MXI().wet[b.id]=TNOW()+1;puff(b.x,b.y+6,b.z,'#8ac8f0',6);sfx('drink');addXp('farm',2);cnt('cnt','water');uiToast('💧 Tưới đẫm luống đất: cây đỡ héo trong ngày nắng hạn.','good');uiHotbar();save();}
{const _bu=buildUse;buildUse=function(t){const b=t.b;
  if(b.k==='lithophone'&&b.prog==null){G.mxTab='music';MXK.inst='stone';uiOpen('mx',{});return;}if(b.k==='watchtower'&&b.prog==null){mxTowerUse(b);return;}
  if(b.k==='spikePit'&&b.prog==null){const M=MXI();if(M.pit[b.id]!==0){uiToast('Chông đã cắm, lá phủ kín. Đừng giẫm vào!','');return;}if(invCount('stick')<3){uiToast('Cần 3 cành để vót chông cắm lại.','bad');sfx('no');return;}l4Work([['Vót chông tre','whittle',1.2,'chop'],['Cắm lại chông, phủ lá','work',1.2,'pick']],{sk:'hunt',icon:'stick'},()=>{invTake('stick',3);M.pit[b.id]=1;sfx('pick');uiToast('🪤 Hố chông đã cắm lại.','good');uiHotbar();save();});return;}
  // thu hoạch ruộng đã cày: thêm hạt
  const M=MXI(),d=t.def;if(d&&d.farm&&b.prog==null){const c=S.crops[b.id];if(c&&cropStage(c)>=3&&M.plow[b.id]){const k=c.k,pl=M.plow[b.id];_bu(t);if(!S.crops[b.id]){const out=k==='grain'?{grain:1+pl}:k==='gourd'?{gourd:pl}:{fiber:1+pl};give(out,[b.x,b.y+12,b.z]);delete M.plow[b.id];delete M.wet[b.id];}return;}
    if(c&&cropStage(c)<3&&mxDrought()&&!mxWaterSrc(b)&&!((M.wet[b.id]||0)>TNOW())&&(invCount('water')||invCount('waterDirty'))){mxWaterCrop(b);return;}}
  return _bu(t);};}

/* ===================== 9. ĐÀN ĐÁ, SÁO: CHƠI NHẠC THEO NĂM CUNG ===================== */
const MXNOTE=[['Hò',261.6],['Xự',293.7],['Xang',349.2],['Xê',392],['Cống',440],['Líu',523.3],['U',587.3],['Xang',698.5]];
const MXSONG=[['Điệu gọi mùa',[0,1,2,3,4,3,2,1,0,2,3,5,4,3]],['Ru con bên bếp',[3,2,3,4,3,2,1,0,1,2,0]],['Hội làng',[0,0,3,3,4,5,4,3,2,3,4,3,0]]];
function mxNotePlay(i,inst){const n=MXNOTE[i];if(!n)return;if(AU.on){auInit();if(AU.ctx){try{if(AU.ctx.state==='suspended')AU.ctx.resume();const f=n[1];if(inst==='flute'){tone(f*2,0.55,'triangle',0.08,1.01);noise(0.3,f*2,6,0.02);}else{tone(f*1.5,1.5,'sine',0.2);tone(f*1.5*2.76,0.4,'sine',0.05);tone(f*1.5*5.4,0.15,'sine',0.025);noise(0.03,3200,1,0.08);}}catch(e){}}}
  const L=S.l4?l4S():null,M=MXI();MXK.notes=(MXK.notes||0)+1;cnt('cnt','music');if(MXK.notes>=12){MXK.notes=0;if(G.t-(MXK.joyT||0)>90){MXK.joyT=G.t;if(L)L.sp=Math.min(100,L.sp+4);S.p.stam=Math.min(maxStam(),S.p.stam+6);
      const folk=(S.folk||[]).some(f=>Math.hypot(f.x-P.x,f.z-P.z)<300);uiToast(`🎶 ${inst==='flute'?'Tiếng sáo':'Tiếng đàn đá'} ngân vang${folk?', người nhà quây lại nghe, ai cũng vui':''}. Tinh thần phấn chấn.`,'gold');if(folk&&L)L.sp=Math.min(100,L.sp+2);}}
  const k=document.querySelector(`.mxkey[data-i="${i}"]`);if(k){k.classList.add('hit');setTimeout(()=>k.classList.remove('hit'),160);}}
function mxSong(j){const s=MXSONG[j];if(!s||MXK.songOn)return;MXK.songOn=1;const inst=MXK.inst||'stone';s[1].forEach((n,i)=>setTimeout(()=>{mxNotePlay(n,inst);if(i===s[1].length-1)MXK.songOn=0;},i*340));}
function mxInstNow(){const lith=S.builds.some(b=>b.k==='lithophone'&&b.prog==null&&Math.hypot(b.x-P.x,b.z-P.z)<120);if(MXK.inst==='stone'&&lith)return 'stone';if(invCount('bambooFlute'))return 'flute';return lith?'stone':null;}
function mxMusicHtml(){const inst=mxInstNow();MXK.inst=inst;if(!inst)return `<p class="muted">Cần đứng cạnh <b>Đàn đá</b> (Xây dựng → Trang trí) hoặc có <b>Sáo tre</b> trong túi (làm ở Trạm khắc).</p><p class="small muted">Đàn đá: những thanh đá dài ngắn khác nhau, gõ lên thành tiếng cao thấp. Đàn đá Khánh Sơn, Bác Ái, Ndut Liêng Krak là những bộ đàn đá cổ tìm thấy ở Việt Nam.</p>`;
  const keys=MXNOTE.map(([n],i)=>`<button class="mxkey ${inst}" data-a="mxnote" data-i="${i}" style="--h:${100-i*6}%"><b>${n}</b></button>`).join('');
  return `<p class="small muted">${inst==='stone'?'🪨 Đàn đá: gõ từng thanh, thanh ngắn tiếng cao.':'🎋 Sáo tre: bấm lỗ thổi theo năm cung.'} Nhạc dân gian Việt dùng năm cung: <b>hò, xự, xang, xê, cống</b>. Chơi một lúc thấy vui, đỡ mệt.</p>
    <div class="mxkeys">${keys}</div><h3>Bài mẫu</h3><div class="row">${MXSONG.map((s,j)=>`<button class="btn sm ghost" data-a="mxsong" data-j="${j}">▶ ${esc(s[0])}</button>`).join('')}</div>${inst==='stone'&&invCount('bambooFlute')?`<p class="row"><button class="btn sm ghost" data-a="mxinst" data-v="flute">🎋 Đổi sang sáo tre</button></p>`:inst==='flute'&&S.builds.some(b=>b.k==='lithophone'&&Math.hypot(b.x-P.x,b.z-P.z)<120)?`<p class="row"><button class="btn sm ghost" data-a="mxinst" data-v="stone">🪨 Đổi sang đàn đá</button></p>`:''}`;}

/* ===================== 10. TRUYỆN CỔ CỦA GIÀ LÀNG ===================== */
const mxReg=ids=>ids.some(i=>S.disc&&S.disc[i])?1:0;
const MXQ=[
  {id:'rongtien',t:'Con Rồng cháu Tiên',lg:'Ngày xưa, Lạc Long Quân giống rồng ở dưới nước kết duyên với Âu Cơ giống tiên trên núi. Âu Cơ sinh ra bọc trăm trứng, nở trăm người con. Năm mươi con theo cha xuống biển, năm mươi con theo mẹ lên núi, chia nhau gây dựng muôn nơi. Bởi thế người Việt gọi nhau là đồng bào: cùng một bọc mà ra.',ask:'Già muốn con tận mắt thấy biển của cha Rồng và núi của mẹ Tiên.',need:[['Tới một vùng biển (bãi cát, vách biển, vịnh, rừng ngập mặn)',()=>mxReg(['beach','cliffs','halong','mangrove']),1],['Lên một vùng núi cao (núi tuyết, cao nguyên, đèo)',()=>mxReg(['range','plateau','pineplat','vista']),1]],rw:{shell:6,feather:4},rep:10},
  {id:'sonvi',t:'Người xưa trong hang',lg:'Ông bà ta xa xưa sống trong hang đá vôi, ghè đá cuội làm rìu, giữ lửa giữa hang. Họ lấy son đỏ vẽ lên vách hình thú, hình người, dặn con cháu nơi nào nhiều nai, chỗ nào có nước. Tranh còn thì lời ông bà còn.',ask:'Con hãy tìm tới Hang Sơn Vi, rồi tự tay vẽ một bức tranh lên vách đá.',need:[['Tới Hang Sơn Vi',()=>mxReg(['cave']),1],['Vẽ một Tranh vẽ vách',()=>mxgc('build:caveArt'),1]],rw:{ochre:2,charcoal:3},rep:8},
  {id:'antiem',t:'Mai An Tiêm và quả dưa',lg:'Mai An Tiêm bị đày ra đảo hoang, chỉ có vợ con và hai bàn tay trắng. Một hôm chim thả xuống hạt lạ, chàng đem gieo, chăm tưới, được quả ruột đỏ ngọt mát. Chàng khắc tên lên vỏ thả xuống biển cho thuyền buôn tìm đến đổi. Ai siêng năng thì đất chẳng phụ.',ask:'Già muốn xem con trồng trọt có siêng như An Tiêm không.',need:[['Thu hoạch luống đất',()=>mxgc('cnt:harvest'),4],['Hái được quả bầu',()=>mxgc('get:gourd'),3]],rw:{seedGourd:4,honey:2},rep:8},
  {id:'chudongtu',t:'Chử Đồng Tử bên sông',lg:'Chàng Chử Đồng Tử nghèo đến nỗi hai cha con chung nhau một chiếc khố. Chàng đánh cá, chèo thuyền dọc sông Cái. Gặp nàng Tiên Dung trên bãi cát, hai người nên vợ chồng, cùng dạy dân trồng lúa, đánh cá, buôn bán ven sông.',ask:'Người sống nhờ sông phải biết nghề sông nước: bắt đủ cá, làm lấy một chiếc bè hay thuyền.',need:[['Bắt cá (đâm, câu, chài, đó)',()=>mxgc('cnt:fish'),10],['Làm Bè tre hoặc Thuyền độc mộc',()=>mxgc('craft:raft')+mxgc('craft:canoe'),1]],rw:{rope:3,netSinker:6},rep:10},
  {id:'sontinh',t:'Sơn Tinh – Thủy Tinh',lg:'Vua Hùng kén rể cho Mỵ Nương. Sơn Tinh mang lễ vật đến trước, cưới được nàng. Thủy Tinh tới sau, tức giận dâng nước đánh lên núi. Nước dâng bao nhiêu, Sơn Tinh nâng đồi núi cao bấy nhiêu. Năm nào Thủy Tinh cũng dâng nước báo thù, nên năm nào dân ta cũng phải lo chống lũ.',ask:'Mùa lũ sắp tới. Hãy dựng nhà sàn cao và kho thóc trên cột như Sơn Tinh giữ dân.',need:[['Dựng Cột nhà sàn',()=>mxgc('build:stilt'),2],['Dựng Kho thóc trên cột',()=>mxgc('build:granary'),1]],rw:{plank:6,rope:2},rep:12},
  {id:'langlieu',t:'Bánh chưng, bánh giầy',lg:'Vua Hùng muốn truyền ngôi, bảo các con tìm lễ vật dâng tổ tiên. Các hoàng tử tìm của ngon vật lạ. Lang Liêu nghèo, được thần mách: không gì quý bằng hạt gạo nuôi người. Chàng làm bánh vuông tượng trưng cho đất, bánh tròn tượng trưng cho trời. Vua cha cảm động, truyền ngôi cho Lang Liêu.',ask:'Hãy nấu cơm từ gạo con tự làm ra, rồi dâng lên bàn thờ tổ tiên.',need:[['Nấu Cơm nồi đất hoặc Cơm lam',()=>mxgc('craft:riceCooked')+mxgc('craft:comLam'),2],['Dâng lễ ở Bàn thờ tổ tiên',()=>mxgc('cnt:offer'),1]],rw:{salt:3,seedRice:4},rep:12},
  {id:'giong',t:'Thánh Gióng',lg:'Làng Phù Đổng có cậu bé lên ba chẳng biết nói cười. Giặc Ân kéo đến, cậu bỗng cất tiếng xin ngựa sắt, roi sắt, áo giáp sắt. Cậu vươn vai thành tráng sĩ, phi ngựa đánh tan giặc rồi bay về trời. Người làng nhớ ơn lập đền thờ.',ask:'Bộ lạc Núi Đá hay sang cướp. Hãy đúc giáo đồng và đánh lui kẻ cướp để giữ làng.',need:[['Đúc Giáo đồng',()=>mxgc('craft:bronzeSpear'),1],['Hạ chiến binh Núi Đá',()=>mxgc('cnt:foe'),3]],rw:{bronze:2,arrow:12},rep:15},
  {id:'trongdong',t:'Tiếng trống đồng',lg:'Trên mặt trống đồng có ngôi sao nhiều cánh giữa trời, quanh đó đàn chim Lạc bay, người đội mũ lông chim giã gạo, đánh trống, chèo thuyền. Mỗi khi hội mùa, trống đồng vang lên gọi cả bộ lạc về chung vui, cầu mưa thuận gió hòa.',ask:'Lời cuối của già: hãy đúc một chiếc trống đồng và mở hội cho cả làng.',need:[['Đúc Trống đồng',()=>mxgc('build:bronzeDrum'),1],['Mở hội hoặc đánh trống',()=>mxgc('cnt:festival')*5+mxgc('cnt:drum'),5]],rw:{bronzeBracelet:1},rep:20}];
const mxQCur=()=>MXQ[MXI().q.i]||null;
const mxQDone=q=>q&&q.need.every(([,f,n])=>{let v=0;try{v=f();}catch(e){}return v>=n;});
function mxQNeedHtml(q){return `<ul class="tips mxneed">${q.need.map(([t,f,n])=>{let v=0;try{v=f();}catch(e){}v=Math.min(v,n);return `<li class="${v>=n?'l4ok':''}">${v>=n?'✓':'○'} ${esc(t)}${n>1?` (${v}/${n})`:''}</li>`;}).join('')}</ul>`;}
function mxQRw(q){return Object.entries(q.rw).filter(([k])=>ITEMS[k]).map(([k,v])=>`<span class="chip">${icon(k)}${v}</span>`).join('')+` <span class="chip">💞 +${q.rep}</span>`;}
function mxQCard(where){const M=MXI(),q=mxQCur();if(!q)return `<div class="mxq"><b>📜 Già đã kể hết chuyện</b><p class="small">“Chuyện của ông bà, giờ con kể lại cho con cháu nhé.”</p></div>`;const done=mxQDone(q),canAct=where==='npc'||(S.recruited&&S.recruited['Ông Mường']);
  if(!M.q.on)return `<div class="mxq"><b>📜 Chuyện thứ ${M.q.i+1}/${MXQ.length}: ${esc(q.t)}</b><p class="small muted">Già làng muốn kể cho con nghe một chuyện xưa.</p>${canAct?`<button class="btn sm" data-a="mxqa">🔥 Ngồi nghe già kể</button>`:'<p class="small muted">Tới làng gặp Ông Mường (già làng) để nghe kể.</p>'}</div>`;
  return `<div class="mxq"><b>📜 ${esc(q.t)}</b><p class="small mxlg">${esc(q.lg)}</p><p class="small"><i>“${esc(q.ask)}”</i></p>${mxQNeedHtml(q)}<div class="chips">Quà: ${mxQRw(q)}</div>${done?(canAct?`<button class="btn sm" data-a="mxqc">🎁 Kể lại cho già làng</button>`:'<p class="small l4ok">Xong rồi! Về làng kể lại cho Ông Mường.</p>'):''}</div>`;}
function mxQAccept(){const M=MXI();if(!mxQCur())return;M.q.on=1;sfx('idea');uiToast('📜 Già làng chậm rãi kể chuyện xưa bên bếp lửa…','');if(S.l4){const L=l4S();L.sp=Math.min(100,L.sp+3);}save();uiOpenRefresh();}
function mxQClaim(){const M=MXI(),q=mxQCur();if(!q||!M.q.on||!mxQDone(q))return;const rw={};for(const k in q.rw)if(ITEMS[k])rw[k]=q.rw[k];give(rw,[P.x,P.y+30,P.z]);S.rep=Math.min(100,(S.rep||0)+q.rep);M.q.i++;M.q.on=0;M.q.hint=0;(M.q.done=M.q.done||[]).push(q.id);cnt('cnt','legend');
  sfx('level');uiToast(`📜 Già làng gật gù: “Giỏi lắm! Chuyện ${q.t} giờ là của con.” Nhận quà và thêm tình thân.`,'gold');unlockCheck();save();uiOpenRefresh();}
{const _nh=npcHtml;npcHtml=function(){const h=_nh();const n=G.npcCur;if(n&&n.def.role==='elder')return mxQCard('npc')+h;return h;};}
function mxLegHtml(){const M=MXI(),dn=M.q.done||[];return `<p class="small muted">Ông Mường, già làng ở Làng Suối Tây, thuộc nhiều truyền thuyết của người Việt. Nghe kể xong, làm việc già dặn rồi về kể lại để nhận quà.</p>${mxQCard('journal')}
  ${dn.length?'<h3>Những chuyện đã nghe</h3>'+dn.map(id=>{const q=MXQ.find(x=>x.id===id);return q?`<details class="mxdet"><summary>📖 ${esc(q.t)}</summary><p class="small">${esc(q.lg)}</p></details>`:'';}).join(''):''}`;}

/* ===================== 11. THÀNH TỰU, THỐNG KÊ ===================== */
const mxSum=pre=>{let n=0;for(const k in S.cnt)if(k.startsWith(pre))n+=S.cnt[k];return n;};
const MXA=[
  ['fire','🔥','Ngọn lửa đầu tiên','Dựng bếp lửa',()=>mxgc('build:campfire'),1],['sleep','⛺','Đêm đầu tiên','Ngủ qua đêm trong chỗ trú',()=>mxgc('cnt:sleep'),1],
  ['chop','🪓','Tiều phu','Đốn 50 lần cây',()=>mxgc('cnt:chop'),50],['mine','⛏️','Thợ đá','Đập đá 30 lần',()=>mxgc('cnt:mine'),30],['hunt','🏹','Thợ săn','Săn 10 con thú',()=>mxgc('cnt:hunt'),10],
  ['fish','🐟','Ngư phủ','Bắt 25 con cá',()=>mxgc('cnt:fish'),25],['net','🕸️','Quăng chài','Kéo chài được cá',()=>mxgc('cnt:netfish'),1],['herb','🌿','Thầy lang','Hái thuốc 30 lần',()=>mxgc('cnt:herb'),30],
  ['farm','🌾','Nhà nông','Thu hoạch 20 lần',()=>mxgc('cnt:harvest'),20],['rice','🍚','Hạt gạo đầu mùa','Gặt lúa nước',()=>mxgc('cnt:riceHarvest'),1],['plough','🐃','Con trâu đi trước','Cày 5 luống đất',()=>mxgc('cnt:plough'),5],
  ['tame','🐾','Bạn bốn chân','Thuần một con vật',()=>mxgc('cnt:tame'),1],['pot','🏺','Thợ gốm','Nung 5 nồi gốm',()=>mxgc('craft:pot'),5],['craft','🛠️','Khéo tay','Chế tạo 100 món',()=>mxSum('craft:'),100],
  ['build','🏠','Thợ cả','Dựng 50 công trình',()=>mxSum('build:'),50],['disc','🧭','Kẻ lữ hành','Khám phá 10 vùng đất',()=>mxgc('cnt:disc'),10],['all','🗺️','Đi khắp sơn hà','Khám phá mọi vùng đất',()=>Object.keys(S.disc||{}).length,()=>REG.length||33],
  ['trade','🤝','Lái buôn','Trao đổi 20 lần',()=>mxgc('cnt:trade'),20],['rep','💞','Người trong làng','Tình thân với làng đạt 100',()=>S.rep||0,100],['wed','💍','Mái ấm','Kết duyên',()=>mxgc('cnt:wed'),1],
  ['foe','🛡️','Người giữ làng','Hạ 5 chiến binh Núi Đá',()=>mxgc('cnt:foe'),5],['repel','🪵','Tường đồng vách sắt','Hàng rào cọc đẩy lui kẻ cướp',()=>mxgc('cnt:repel'),1],['sky','⚡','Lửa trời','Lấy lửa từ cây bị sét đánh',()=>mxgc('cnt:skyfire'),1],
  ['music','🎶','Nghệ nhân','Chơi 100 nốt nhạc',()=>mxgc('cnt:music'),100],['story','🔥','Bên bếp lửa','Nghe kể 5 chuyện',()=>mxgc('cnt:story'),5],['legend','📜','Người giữ truyện cổ','Nghe hết chuyện của già làng',()=>mxgc('cnt:legend'),MXQ.length],
  ['day30','☀️','Ba mươi ngày','Sống qua 30 ngày',()=>S.day,30],['year','🌸','Tròn một năm','Sống qua bốn mùa',()=>S.day,SEASON_DAYS*4+1],['pack','🧺','Gùi trên vai','Đeo gùi hoặc túi',()=>mxgc('cnt:pack'),1],
  ['bronze','🔔','Lửa luyện đồng','Luyện được đồng thau',()=>mxgc('craft:bronze'),1],['drum','🥁','Tiếng trống Đông Sơn','Đúc trống đồng',()=>mxgc('build:bronzeDrum'),1],['age','🏺','Thời Đông Sơn','Bước vào thời Đông Sơn',()=>S.age||0,4]];
const mxAN=a=>typeof a[5]==='function'?a[5]():a[5];
function mxAchTick(){const M=MXI(),fresh=[];for(const a of MXA){if(M.ach[a[0]])continue;let v=0;try{v=a[4]();}catch(e){}if(v>=mxAN(a)){M.ach[a[0]]=S.day;fresh.push(a);}}if(!fresh.length)return;
  if(fresh.length<=2)fresh.forEach(a=>uiToast(`🏆 Thành tựu: ${a[1]} ${a[2]}`,'gold'));else uiToast(`🏆 Mở ${fresh.length} thành tựu: ${fresh.slice(0,3).map(a=>a[2]).join(', ')}… (Nhật ký → Thành tựu)`,'gold');sfx('level');save();}
function mxAchHtml(){const M=MXI(),n=MXA.filter(a=>M.ach[a[0]]).length;return `<div class="mxah"><b>${n}/${MXA.length}</b><i class="l4bar" style="--v:${n/MXA.length*100}%;--c:#ffd27a"></i></div><div class="mxach">${MXA.map(a=>{const ok=M.ach[a[0]];let v=0;try{v=a[4]();}catch(e){}const N=mxAN(a);
  return `<div class="mxa${ok?' ok':''}"><span class="mxai">${ok?a[1]:'🔒'}</span><span><b>${esc(a[2])}</b><br><span class="small muted">${esc(a[3])}${ok?' · ngày '+ok:N>1?` · ${Math.min(v,N)}/${N}`:''}</span></span></div>`;}).join('')}</div>`;}
function mxStatHtml(){const si=seasonIdx(),yr=Math.floor((S.day-1)/(SEASON_DAYS*4))+1,km=(MXI().dist/20/1000);
  const rows=[['📅 Ngày',`${wcAge()} · mùa ${SEASONS[si].n} năm ${yr}`],['🏺 Thời đại',AGES[S.age||0].n],['🚶 Đường đã đi',km>=1?km.toFixed(1)+' km':Math.round(km*1000)+' m'],['🗺️ Vùng đã tới',`${Object.keys(S.disc||{}).length}/${REG.length}`],
    ['🪓 Lần đốn cây',mxgc('cnt:chop')],['⛏️ Lần đập đá',mxgc('cnt:mine')],['🍓 Lần hái lượm',mxgc('cnt:gather')+mxgc('cnt:herb')],['🏹 Thú săn được',mxgc('cnt:hunt')],['🐟 Cá bắt được',mxgc('cnt:fish')],['🌾 Lần thu hoạch',mxgc('cnt:harvest')+mxgc('cnt:riceHarvest')],
    ['🛠️ Đồ chế tạo',mxSum('craft:')],['🏠 Công trình đã dựng',mxSum('build:')],['🤝 Lần trao đổi',mxgc('cnt:trade')],['⚔️ Chiến binh Núi Đá bị hạ',mxgc('cnt:foe')],['🥁 Lễ hội',mxgc('cnt:festival')],['📜 Truyện cổ đã nghe',mxgc('cnt:legend')],['🎶 Nốt nhạc',mxgc('cnt:music')],['🍖 Bữa ăn',mxgc('cnt:eat')]];
  return `<div class="mxstat">${rows.map(([a,b])=>`<div><span>${a}</span><b>${esc(String(b))}</b></div>`).join('')}</div>`;}
// bảng "mx": thành tựu · thống kê · truyện cổ · âm nhạc
function mxFill(sc){const p=$('#panel'),h=p&&p.querySelector('.p-head h2'),bd=p&&p.querySelector('.p-body');if(!h||!bd)return;const tab=G.mxTab||'ach';h.textContent={ach:'Thành tựu',stat:'Thống kê',leg:'Truyện cổ',music:'Âm nhạc'}[tab]||'Thành tựu';
  const tabs=[['ach','🏆 Thành tựu'],['stat','📊 Thống kê'],['leg','📜 Truyện cổ'],['music','🎵 Âm nhạc']].map(([t,n])=>`<button class="tb${tab===t?' on':''}" data-a="mxtab" data-t="${t}">${n}</button>`).join('');
  bd.innerHTML=`<div class="tabs mxtabs">${tabs}</div>`+(tab==='stat'?mxStatHtml():tab==='leg'?mxLegHtml():tab==='music'?mxMusicHtml():mxAchHtml());bd.scrollTop=sc||0;}
{const _jh=journalHtml;journalHtml=function(){return `<div class="row mxjl"><button class="btn sm ghost" data-a="mxopen" data-t="ach">🏆 Thành tựu</button><button class="btn sm ghost" data-a="mxopen" data-t="stat">📊 Thống kê</button><button class="btn sm ghost" data-a="mxopen" data-t="leg">📜 Truyện cổ</button></div>`+_jh();};}

/* ===================== 12. CÀI ĐẶT: CỠ CHỮ, CHỤP ẢNH ===================== */
const MXFS=[['1','Vừa'],['1.15','Lớn'],['1.3','Rất lớn']];
function mxFsApply(){let v='1';try{v=localStorage.getItem('ldtt-fs')||'1';}catch(e){}document.documentElement.style.setProperty('--mxfs',v);document.body.classList.toggle('mxfs',v!=='1');MXK.fs=v;}
{const _sh=settingsHtml;settingsHtml=function(){return _sh()+`<div class="set"><b>Cỡ chữ</b><span>${MXFS.map(([v,n])=>`<button class="tb sm${(MXK.fs||'1')===v?' on':''}" data-a="mxfs" data-v="${v}">${n}</button>`).join('')}</span></div>
  <div class="set"><b>Chụp ảnh</b><button class="btn sm" data-a="mxphoto">📷 Chế độ chụp ảnh</button></div><div class="set"><b>Thành tựu</b><button class="btn sm ghost" data-a="mxopen" data-t="ach">🏆 Xem</button></div>`;};}
function mxPhoto(on){document.body.classList.toggle('mxphoto',!!on);let bar=$('#mxph');if(on){uiClose();if(!bar){$('#game').insertAdjacentHTML('beforeend','<div id="mxph" class="mxph"><button class="btn" data-a="mxshot">📸 Chụp</button><button class="btn ghost" data-a="mxphx">✕ Thoát</button></div>');}}else if(bar)bar.remove();}
function mxShot(){let url=null;try{if(K3.fx)K3.fx.render(G.R,G.sc,G.cam,{vig:0.24,bloom:0.45,post:G.q>0});else G.R.render(G.sc,G.cam);url=G.R.domElement.toDataURL('image/jpeg',0.9);}catch(e){}
  if(!url||url.length<1000){uiToast('Máy này không chụp được ảnh.','bad');return;}sfx('pick');MXK.shot=url;const nm=`lua-da-ngay-${S.day}.jpg`;const old=$('#mxshot');if(old)old.remove();
  $('#game').insertAdjacentHTML('beforeend',`<div id="mxshot" class="mxshot"><img src="${url}" alt="Ảnh chụp"><div class="row"><button class="btn" data-a="mxsave" data-n="${nm}">💾 Lưu ảnh</button>${navigator.share?'<button class="btn ghost" data-a="mxshare">📤 Chia sẻ</button>':''}<button class="btn ghost" data-a="mxshotx">✕ Đóng</button></div></div>`);cnt('cnt','photo');}
async function mxShare(){try{const b=await (await fetch(MXK.shot)).blob(),f=new File([b],`lua-da-ngay-${S.day}.jpg`,{type:'image/jpeg'});if(navigator.canShare&&navigator.canShare({files:[f]}))await navigator.share({files:[f],title:'Lửa Đá'});else uiToast('Máy không hỗ trợ chia sẻ ảnh: bấm Lưu ảnh.','');}catch(e){}}

/* ===================== 13. ÂM THANH MÔI TRƯỜNG THEO VÙNG ===================== */
function mxBed(freq,type,q){const c=AU.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=noiseBuf();s.loop=true;f.type=type;f.frequency.value=freq;f.Q.value=q||0.7;g.gain.value=0;s.connect(f);f.connect(g);g.connect(AU.master);s.start(0,Math.random());return {g,f};}
function mxAmb(dt){if(!AU.ctx)return;const on=AU.on&&G.on&&!G.paused;if(!MXK.beds){if(!on)return;try{MXK.beds={water:mxBed(900,'bandpass',0.6),sea:mxBed(420,'lowpass',0.5),wind:mxBed(320,'lowpass',0.9)};}catch(e){MXK.beds={};return;}}
  const B=MXK.beds;if(!B.water)return;const r=regionAt(P.x,P.z),id=r&&r.id,t=AU.ctx.currentTime;let w=0;if(on){for(let a=0;a<8;a++){const an=a*0.785;for(const d of [40,110]){if(wdAt(P.x+Math.cos(an)*d,P.z+Math.sin(an)*d)>0.5){w+=d<50?0.2:0.08;break;}}}}w=Math.min(1,w);
  const sea=on&&/^(beach|cliffs|halong|mangrove)$/.test(id||'')?1:0,alt=hAt(P.x,P.z),wind=on?clamp((alt-180)/260,0,1)+(/^(range|vista|pineplat|plateau)$/.test(id||'')?0.4:0)+(G.wxK||0)*0.3:0;
  B.water.g.gain.setTargetAtTime(w*0.05,t,0.6);B.sea.g.gain.setTargetAtTime(sea*(0.035+0.03*Math.sin(t*0.9)),t,0.8);B.wind.g.gain.setTargetAtTime(Math.min(1,wind)*0.035,t,1);B.wind.f.frequency.setTargetAtTime(260+Math.sin(t*0.37)*90,t,1);
  if(!on)return;MXK.ev=(MXK.ev||4)-0.5;if(MXK.ev>0)return;MXK.ev=6+Math.random()*10;const h=S.hour,si=seasonIdx(),rain=(G.wxK||0)>0.4;if(rain)return;
  try{if(/^(jungle|karst|ancient|bamboovl)$/.test(id||'')&&h>=5.5&&h<10){let f=520;for(let i=0;i<6;i++){tone(f,0.32,'sine',0.03,1.6,i*0.36);f*=1.08;}}// vượn hú buổi sớm
    else if(si===1&&h>=10&&h<16&&/^(jungle|forest|ancient|banyan|start|bamboo|bamboovl|meadow4|hills)$/.test(id||'')){for(let i=0;i<10;i++)tone(4600+Math.random()*300,0.18,'sawtooth',0.006,1,i*0.12);}// ve sầu trưa hè
    else if(/^(bamboo|bamboovl)$/.test(id||'')){tone(180,0.12,'triangle',0.04,1.4);tone(160,0.1,'triangle',0.03,1.3,0.25);}// tre kẽo kẹt
    else if(id==='cave'){tone(1800+Math.random()*600,0.12,'sine',0.03,0.55);}}catch(e){}}// nước nhỏ giọt trong hang

/* ===================== 14. NHẮM, HÀNH ĐỘNG ===================== */
{const _ft=findTarget;findTarget=function(){const t=_ft();if(G.work||G.sit||G.ride||!S)return t;let best=null,bd=1e9;
  for(const b of S.builds){if(b.prog!=null||(b.k!=='lithophone'&&b.k!=='watchtower'&&b.k!=='spikePit'))continue;if(Math.abs(b.y-P.y)>60)continue;const d=Math.hypot(b.x-P.x,b.z-P.z)-14;if(d>REACH+10)continue;if(d<bd){bd=d;best={type:'build',b,def:pieceDef(b.k),d};}}
  for(const B of (MXK.burn||[])){const d=Math.hypot(B.q.x-P.x,B.q.z-P.z)-16;if(d<REACH+16&&d<bd){bd=d;best={type:'mxburn',q:B.q,d};}}
  if(!best)return t;if(!t)return best;if(t.type==='animal'&&t.a&&t.a.angry)return t;const td=t.d!=null?t.d:t.type==='water'?20:30;return bd<=td+2?best:t;};}
{const _ti=targetInfo;targetInfo=function(t){if(!t)return _ti(t);
  if(t.type==='mxburn')return {name:'Cây bị sét đánh đang cháy',verb:'Lấy lửa trời',ok:true,icon:'torch'};
  if(t.type==='build'&&t.b&&t.b.prog==null){const k=t.b.k,M=S.mx||{};
    if(k==='lithophone')return {name:t.def.n,verb:'Gõ đàn đá',ok:true,icon:'stone'};if(k==='watchtower')return {name:t.def.n,verb:'Trèo lên nhìn xa',ok:true,icon:'spear'};
    if(k==='spikePit'){const armed=!M.pit||M.pit[t.b.id]!==0;return armed?{name:t.def.n+' (đã cắm chông)',verb:'Đừng giẫm vào',ok:false,icon:'stick'}:{name:t.def.n+' (đã sập)',verb:'Cắm lại chông',ok:invCount('stick')>=3,need:invCount('stick')>=3?null:'3 cành',icon:'stick'};}
    if(t.def&&t.def.farm){const c=S.crops[t.b.id],pl=M.plow&&M.plow[t.b.id];
      if(!c&&mxPlough()&&!pl)return {name:t.def.n+(mxBuffNear(t.b.x,t.b.z)?' · có trâu kéo':''),verb:'Cày đất',ok:true,icon:P.toolId,warn:mxBuffNear(t.b.x,t.b.z)?null:'Chưa có trâu: tự kéo cày rất mệt'};
      if(c&&cropStage(c)<3&&mxDrought()&&!mxWaterSrc(t.b)&&!((M.wet&&M.wet[t.b.id]||0)>TNOW()))return {name:'Cây héo vì nắng hạn · '+Math.round((c.p||0)*100)+'%',verb:'Tưới nước',ok:invCount('water')+invCount('waterDirty')>0,need:invCount('water')+invCount('waterDirty')>0?null:'bầu nước',icon:'water'};
      const r=_ti(t);if(r&&pl&&!c)r.name+=' · đã cày';else if(r&&pl)r.name+=' · đất cày';return r;}}
  if(t.type==='build'&&t.b&&t.def&&t.def.fuel&&!fireLit(t.b)&&!hasTool('fire')&&hasTool('torch'))return {name:t.def.n+' (chưa có lửa)',verb:'Mồi lửa từ đuốc',ok:true,icon:'torch'};
  if(t.type==='water'&&P.toolId==='fishNet')return {name:'Mặt nước',verb:'Quăng chài',ok:true,icon:'fishNet'};return _ti(t);};}
{const _as=actStart;actStart=function(t){if(G.work||!t)return _as(t);if(t.type==='mxburn'){mxSkyFire(t);return;}
  if(t.type==='water'&&P.toolId==='fishNet'&&!G.swim){mxNetCast(t);return;}
  if(t.type==='build'&&t.def&&t.def.farm&&t.b.prog==null&&!S.crops[t.b.id]&&mxPlough()&&!(MXI().plow[t.b.id])){mxPloughDo(t.b);return;}return _as(t);};}

/* ===================== 15. BẤM NÚT ===================== */
document.addEventListener('click',e=>{const a=e.target&&e.target.closest&&e.target.closest('[data-a^="mx"]');if(!a||!S)return;const d=a.dataset;e.stopImmediatePropagation();e.preventDefault&&d.a!=='mxdl'&&a.tagName!=='A'&&e.preventDefault();
  if(d.a!=='mxnote')sfx('pick');
  switch(d.a){case 'mxsort':mxSort();break;case 'mxstack':mxQuickStack();break;
    case 'mxstack1':{const st=mxStore(d.b);if(st){const n=mxStackTo([st]);uiToast(n?`📥 Cất ${n} món cùng loại.`:'Không có món nào trùng loại.','');uiHotbar();uiOpenRefresh();save();}break;}
    case 'mxtake':{const st=mxStore(d.b);if(st){let n=0,full=0;for(let i=0;i<st.length;i++){const s=st[i];if(!s)continue;const left=slotsAdd(S.inv,s.id,s.n);n+=s.n-left;if(left>0){s.n=left;full=1;}else st[i]=null;}uiToast(full?`📤 Lấy ${n} món, túi đã đầy.`:`📤 Lấy hết ${n} món.`,full?'bad':'');uiHotbar();uiOpenRefresh();save();}break;}
    case 'mxsorts':{const st=mxStore(d.b);if(st){mxSortArr(st,0);uiOpenRefresh();save();}break;}
    case 'mxfav':{const M=MXI();if(M.fav[d.r])delete M.fav[d.r];else M.fav[d.r]=1;save();uiOpenRefresh();break;}
    case 'mxpack':mxPackOn(+d.i);break;case 'mxunpack':mxPackOff(d.s);break;case 'mxcalf':mxCalfOut(+d.i);break;
    case 'mxopen':G.mxTab=d.t;uiOpen('mx',{});break;case 'mxtab':G.mxTab=d.t;uiOpen('mx',{});break;
    case 'mxmusic':G.mxTab='music';MXK.inst='flute';uiOpen('mx',{});break;case 'mxinst':MXK.inst=d.v;uiOpenRefresh();break;
    case 'mxnote':mxNotePlay(+d.i,MXK.inst||'stone');break;case 'mxsong':mxSong(+d.j);break;
    case 'mxqa':mxQAccept();break;case 'mxqc':mxQClaim();break;
    case 'mxfs':try{localStorage.setItem('ldtt-fs',d.v);}catch(er){}mxFsApply();uiOpenRefresh();break;
    case 'mxphoto':mxPhoto(true);break;case 'mxphx':mxPhoto(false);break;case 'mxshot':mxShot();break;case 'mxshotx':{const s=$('#mxshot');if(s)s.remove();break;}case 'mxshare':mxShare();break;}},true);

/* ===================== 16. NHỊP: MỖI KHUNG (NHẸ), MỖI NỬA GIÂY, MỖI GIỜ ===================== */
function mxHourly(){const M=MXI(),si=seasonIdx();
  // nắng hạn: đầu mùa hạ gieo xúc xắc
  if(si===1&&seasonDay()===1&&M.drRoll!==S.day){M.drRoll=S.day;if(Math.random()<(S.mode==='cozy'?0.3:0.45)){M.drT=S.day+SEASON_DAYS-1+0.75;uiToast('☀️ Năm nay hạn: mấy ngày tới trời nắng gắt, ít mưa. Ruộng xa giếng, mương phải múc nước tưới; mang theo bầu nước.','bad');cnt('cnt','drought');}}
  if(M.drT&&TNOW()>=M.drT){M.drT=0;uiToast('🌦️ Cơn mưa rào cuối hạ: hết hạn rồi!','good');}
  mxRaidWarn();
  const q=mxQCur();if(q&&M.q.on&&!M.q.hint&&mxQDone(q)){M.q.hint=1;uiToast(`📜 Xong việc già làng dặn (${q.t}). Về làng kể lại cho Ông Mường.`,'good');}}
function mxTick(dt){if(!G.on||!S)return;mxDefTick(dt);mxBurnTick(dt);if(MXK.net){const k=Math.min(1,(G.t-MXK.net.t0)/0.6);MXK.net.o.scale.setScalar(0.2+0.8*k);MXK.net.o.position.y-=dt*(k>=1?0.8:0);}
  if(G.t-(MXK.halfT||0)<0.5)return;MXK.halfT=G.t;const M=MXI();mxInvFix();
  if(MXK.lx!=null){const d=Math.hypot(P.x-MXK.lx,P.z-MXK.lz);if(d<200)M.dist+=d;}MXK.lx=P.x;MXK.lz=P.z;
  if(!G.paused&&S.wx&&S.wx.type==='storm'&&(G.wxK||0)>0.7&&G.t-(MXK.strT||0)>35&&Math.random()<0.06){if(mxStrike())MXK.strT=G.t;}
  try{mxAmb(0.5);}catch(e){}
  if(G.t-(MXK.achT||0)>3){MXK.achT=G.t;mxAchTick();}
  const hh=Math.floor(TNOW()*24);if(MXK.hh!==hh){const first=MXK.hh==null;MXK.hh=hh;if(!first)mxHourly();}}
{const _at=ambTick;ambTick=function(dt){_at(dt);try{mxTick(dt);}catch(e){if(!MXK.err){MXK.err=1;console.warn('more',e);}}};}
{const _sg=startGame;startGame=function(){const r=_sg.apply(this,arguments);try{MXI();mxInvFix();mxDecor();}catch(e){}return r;};}
/* ===================== 17. KIỂU CHỮ ===================== */
document.head.insertAdjacentHTML('beforeend',`<style>
.mxbag{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:2px 0 8px}.mxbag .muted{margin-left:auto}
.mxinv .sl:nth-child(n+25){background:rgba(150,110,60,.28);border-style:dashed}
.mxsearch{margin:6px 0}.mxsearch input{width:100%;box-sizing:border-box;font:inherit;font-size:15px;padding:10px 12px;border-radius:12px;border:1.5px solid rgba(255,220,160,.35);background:rgba(0,0,0,.28);color:#f3e6cc}
.mxfav{min-width:34px}.mxfav.on{color:#ffd27a;border-color:#ffd27a}
.mxtabs{flex-wrap:wrap}.mxjl{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
.mxach{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:6px}.mxa{display:flex;gap:8px;align-items:center;padding:7px 9px;border-radius:12px;background:rgba(0,0,0,.22);opacity:.62}.mxa.ok{opacity:1;background:rgba(255,200,90,.14);box-shadow:inset 0 0 0 1px rgba(255,210,122,.35)}
.mxai{font-size:22px;width:30px;text-align:center}.mxah{display:flex;gap:10px;align-items:center;margin:4px 0 10px}.mxah .l4bar{flex:1;display:block;height:8px;border-radius:6px;background:linear-gradient(90deg,var(--c) var(--v),rgba(255,255,255,.12) 0)}
.mxstat{display:grid;grid-template-columns:1fr;gap:4px}.mxstat div{display:flex;justify-content:space-between;gap:10px;padding:6px 8px;border-radius:9px;background:rgba(0,0,0,.2)}
.mxq{padding:10px 12px;border-radius:14px;background:rgba(255,190,90,.1);box-shadow:inset 0 0 0 1px rgba(255,200,120,.3);margin:4px 0 10px}.mxq .btn{margin-top:6px}.mxlg{line-height:1.5}.mxneed li{list-style:none}.mxdet{margin:4px 0;padding:6px 8px;border-radius:10px;background:rgba(0,0,0,.2)}
.mxkeys{display:flex;gap:5px;align-items:flex-end;height:170px;margin:10px 0}.mxkey{flex:1;height:var(--h);min-width:0;border-radius:10px;border:none;color:#2a1e14;font:inherit;font-weight:700;display:flex;align-items:flex-end;justify-content:center;padding-bottom:8px;touch-action:manipulation;transition:transform .08s,filter .08s}
.mxkey.stone{background:linear-gradient(180deg,#c9c3b6,#8f897d);box-shadow:0 3px 0 #5d574d}.mxkey.flute{background:linear-gradient(180deg,#e2cf8c,#b49a52);box-shadow:0 3px 0 #7a6630;border-radius:20px}.mxkey.hit{transform:translateY(3px);filter:brightness(1.25)}
body.mxfs .p-body,body.mxfs .toasts,body.mxfs .tlabel,body.mxfs .goal,body.mxfs #gdcard{zoom:var(--mxfs)}
body.mxphoto #hud,body.mxphoto #goal,body.mxphoto .menu,body.mxphoto #hot,body.mxphoto #tlabel,body.mxphoto #joy,body.mxphoto #mini,body.mxphoto #compass,body.mxphoto .acts,body.mxphoto #toasts,body.mxphoto #xh,body.mxphoto #regban,body.mxphoto #gdcard{display:none!important}
.mxph{position:absolute;z-index:9;left:50%;bottom:calc(16px + env(safe-area-inset-bottom));transform:translateX(-50%);display:flex;gap:8px}
.mxshot{position:absolute;z-index:12;inset:0;background:rgba(10,7,5,.86);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:16px}.mxshot img{max-width:100%;max-height:70vh;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,.6)}.mxshot .row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}.mxshot a.btn{text-decoration:none}
</style>`);
mxFsApply();

/* lưu ảnh: trên claude.ai dùng quyền tải tệp của trang, ngoài ra dùng liên kết tải bình thường */
async function mxSave(nm){try{const b=await (await fetch(MXK.shot)).blob();const dl=window.claude&&window.claude.use?await window.claude.use('downloads'):null;
  if(dl){try{const r=await dl.save({filename:nm,data:b});if(r==='saved'||r&&r.status==='saved')uiToast('💾 Đã lưu ảnh.','good');}catch(e){if(e&&e.code!=='declined')uiToast('Không lưu được ảnh ở đây.','bad');}return;}
  const a=document.createElement('a');a.href=MXK.shot;a.download=nm;document.body.appendChild(a);a.click();a.remove();}catch(e){uiToast('Không lưu được ảnh.','bad');}}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="mxsave"]');if(!b)return;e.stopImmediatePropagation();mxSave(b.dataset.n||'lua-da.jpg');},true);
