/* ===================== DẪN ĐƯỜNG: CHUỖI MỤC TIÊU · THẺ GỢI Ý · "HÔM NAY LÀM GÌ?" (guide) =====================
   Mô-đun nạp sau mọi hệ thống (trước peek.js). Không sửa tệp cũ, chỉ thay bảng GOALS và bọc hàm lúc nạp:
   • Chuỗi mục tiêu mới theo từng thời đại (Sơn Vi → Hòa Bình → Bắc Sơn → Phùng Nguyên → Đông Sơn), mỗi mục một câu "vì sao/làm thế nào".
     Tiến độ đọc từ bộ đếm S.cnt và từ trạng thái thật (công trình đã dựng XONG, khu đất đã san…), nên làm trước cũng được tính.
   • Thẻ gợi ý theo ngữ cảnh: lần đầu gặp mưa, bị thương, trời tối, lưỡi cùn, thịt ôi, gần làng, công đoạn bị chặn, thú dữ, xác thú…
     Mỗi thẻ chỉ hiện một lần (ghi trong S.gd.h), không bao giờ hai thẻ cùng lúc, cách nhau ít nhất 25 giây.
   • Nút "Hôm nay làm gì?" trong Nhật ký: chọn 3 việc nên làm nhất từ tình trạng hiện tại.
   • Sửa nhỏ cho chuỗi đầu game: đun nước bằng đá nung trong ống tre/bầu (trước khi có nồi gốm), điều kiện thời đại chấp nhận mọi kiểu mái, bếp.
   Trạng thái lưu: S.gdv (phiên bản chuỗi mục tiêu), S.gd {h: thẻ đã xem, sk: mục tiêu đã bỏ qua}. */
const GD={t:0,lastCard:-99,card:null,stageT:-99,todo:null,skipArm:-1};
const gdS=()=>{if(!S.gd||typeof S.gd!=='object')S.gd={};const o=S.gd;o.h=o.h||{};o.sk=o.sk||{};return o;};
const gC=k=>(S&&S.cnt&&S.cnt[k])||0;
const gSum=ks=>ks.reduce((a,k)=>a+gC(k),0);
const gDone=re=>{let n=0;for(const b of S.builds)if(b.prog==null&&(typeof re==='string'?b.k===re:re.test(b.k)))n++;return n;};
const GD_WALL=/^(wall|wallDoor|wallWindow|mudWall|mudWallWindow|bambooWall|bambooWallDoor|stoneWall|stoneWallDoor|rammedWall|dryStoneWall)$/,GD_FLOOR=/^(floor|mudFloor|bambooFloor|stoneFloor)$/,
  GD_ROOF=/^(roof|thatchRoof|leafRoof|roofCap)$/,GD_FIRE=/^(campfire|stoneHearth|hearth3|hearth)$/,GD_BED=/^(leanto|tent|bed|caveBed|hammock|sleepMat)$/;
const GD_COOK=['birdCooked','meatCooked','fishCooked','yamCooked','snailCooked','taroRoast','meatDried','fishDried','boiledMeat','fishSoup','riceCooked','taroCooked','comLam','congee','stew','bread'].map(k=>'craft:'+k);
const GD_WARM=['furCloak','coat','furcoat','barkTunic','clothTunic'].map(k=>'craft:'+k);
/* ---------- 1. ĐUN NƯỚC BẰNG ĐÁ NUNG (trước khi có nồi gốm) ----------
   Người Hòa Bình chưa có gốm vẫn nấu được: nung đá trong lửa rồi thả vào ống tre, bầu nước cho sôi (như nấu cơm lam). */
WSTEP.stoneBoil=[['Vùi đá cuội vào than hồng','cook',1.4,'step'],['Gắp đá nóng thả vào bầu nước','cook',1.2,'drink'],['Chờ nước sủi, vớt đá ra','cook',1.4,'drink']];
if(!RECIPES.some(r=>r.id==='stoneBoil'))RECIPES.push({id:'stoneBoil',out:{water:1},in:{waterDirty:1,stone:2},st:'campfire',req:['waterDirty'],sk:'cook',steps:'stoneBoil'});
/* ---------- 1b. NHỊP ĐẦU GAME ----------
   • Giáo đá lửa: Chế tác cấp 1 (như dao). Cấp 2 bắt người chơi bện thêm ~7 dây thừng vô ích trước khi được đi săn.
   • Lều nghiêng dài 2 ô: bếp đặt ở bất kỳ ô nào kề lều (kể cả phía trước, chéo góc) đều được che mưa để nhóm lửa. */
{const sp=RECIPES.find(r=>r.id==='spear');if(sp&&sp.lv&&sp.lv.craft>1)sp.lv={craft:1};}
{const _fs=fireSheltered;fireSheltered=function(x,z){if(_fs(x,z))return true;for(const b of S.builds)if(b.prog==null&&(b.k==='leanto'||b.k==='tent')&&Math.hypot(b.x-x,b.z-z)<75)return true;return false;};}
/* ---------- 2. THỜI ĐẠI: chấp nhận mọi kiểu bếp, mái (mái tranh, mái lá cọ cũng là mái) ---------- */
{const a1=AGES[1].ok,a2=AGES[2].ok;
  AGES[1].ok=()=>a1()||((gC('build:campfire')+gC('build:stoneHearth')+gC('build:hearth3')+gC('build:hearth')+gC('cnt:fire'))>0&&gC('cnt:sleep')>0&&gC('cnt:herb')>=4);
  AGES[2].ok=()=>a2()||(gC('craft:pot')>0&&(gSum(['build:roof','build:thatchRoof','build:leafRoof','build:roofCap'])>=4||gDone(GD_ROOF)>=4));}
/* ---------- 3. CHUỖI MỤC TIÊU ----------
   e: thời đại; f(): giá trị hiện tại; n: cần đạt. c giữ dạng cũ [loại, khóa, số] cho mã nào còn đọc g.c. */
const G_=(e,t,d,n,f)=>({e,t,d,n,f,c:['gd',t,n]});
const GD_GOALS=[
  // ——— Thời Sơn Vi: đêm đầu tiên ———
  G_(0,'Nhặt cành, đá và sợi cỏ','Cành khô dưới tán cây, sỏi ven đường, ven suối, cỏ lanh cho sợi. Lại gần rồi bấm Hành động.',20,()=>Math.min(gC('get:stick'),8)+Math.min(gC('get:stone'),4)+Math.min(gC('get:fiber'),8)),
  G_(0,'Uống nước suối','Đứng sát mép nước, bấm Hành động. Khát quá thì hoa mắt, không làm nổi việc.',1,()=>gC('cnt:drink')),
  G_(0,'Ghè một chiếc rìu đá','Túi đồ → Chế tạo → Rìu đá (2 cành, 2 đá, 3 sợi): chọn đá, ghè lưỡi, mài, vót cán, buộc dây.',1,()=>gC('craft:axe')),
  G_(0,'Kiếm 3 khúc gỗ','Cầm rìu chặt cây khô, cây bạch dương; hoặc nhặt khúc gỗ mục dưới đất (không cần rìu).',3,()=>gC('get:wood')),
  G_(0,'Dựng lều nghiêng','Xây → Lều nghiêng (14 cành, 10 sợi). Đặt khung xong, đứng sát khung bấm Hành động để buộc cho xong.',1,()=>gDone('leanto')),
  G_(0,'Làm que khoan lửa','Chế tạo → Khoan lửa (2 cành, 1 gỗ, 2 sợi). Không có nó thì bếp chỉ là đống đá lạnh.',1,()=>gC('craft:fireDrill')),
  G_(0,'Nhóm ngọn lửa đầu tiên','Xây Bếp lửa (6 đá, 4 cành, 2 gỗ) sát lều, rồi bấm Hành động để khoan lửa. Trời mưa chỉ nhóm được sát lều, dưới mái.',1,()=>gC('cnt:fire')),
  G_(0,'Ăn 3 bữa','Quả mọng, chuối, nấm rơm, củ mài; lội suối bắt cá bằng tay. Chạm món ăn trong túi để ăn. Nấm đỏ có độc!',3,()=>gC('cnt:eat')),
  G_(0,'Ngủ qua đêm đầu tiên','Sau 19 giờ, vào lều nghiêng bấm Hành động để ngủ. Có lửa bên cạnh thì ấm, ngủ ngon, thú ít dám lại gần.',1,()=>gC('cnt:sleep')),
  // ——— Thời Hòa Bình: sống nhờ rừng ———
  G_(1,'Hái 4 cây thuốc','Ngải cứu, rau má, bạc hà, gừng mọc ở bìa rừng, ven suối. Biết cây thuốc thì bộ lạc sang thời Hòa Bình.',4,()=>gC('cnt:herb')),
  G_(1,'Làm băng lá rau má','Chế tạo → Băng lá (3 sợi + 2 rau má). Mang sẵn trong túi: thú cào, dẫm gai là có ngay.',1,()=>gC('craft:bandage')),
  G_(1,'Tìm 2 viên đá lửa','Ghè Cuốc đá rồi đập tảng đá, mỏ đá lửa; đá vụn sườn núi đôi khi lẫn đá lửa (nhặt tay được).',2,()=>gC('get:flint')),
  G_(1,'Ghè dao đá lửa','Chế tạo → Dao đá lửa (cần Chế tác cấp 1). Dao để xẻ thịt, khoét bầu, chẻ tre, mài kim xương.',1,()=>gC('craft:knife')),
  G_(1,'Làm bầu đựng nước','Khoét quả bầu dại (hè, thu) hoặc chặt bụi tre lấy ống tre rỗng (dao). Ra suối uống là múc đầy bầu.',1,()=>gC('craft:flask')),
  G_(1,'Đun một bầu nước sôi','Nước suối dễ gây tiêu chảy. Ở bếp lửa: Chế tạo → Đun nước bằng đá nung (1 bầu nước suối + 2 đá).',1,()=>gC('craft:water')),
  G_(1,'Mài lại lưỡi công cụ','Dùng lâu lưỡi cùn, làm chậm hẳn. Túi đồ → chạm vào rìu/cuốc → Mài lưỡi (1 đá). Gãy cán thì Gắn cán mới.',1,()=>gC('cnt:sharpen')+gC('cnt:haft')),
  G_(1,'Làm giáo đá lửa','Mũi đá lửa buộc chặt vào cán dài: 3 cành, 2 đá lửa, 1 dây thừng. Đâm cá ven suối cũng được.',1,()=>gC('craft:spear')),
  G_(1,'Phóng giáo trúng một con thú','Cầm giáo, giữ nút Ném để ngắm rồi thả tay. Trúng chân thì thú chạy khập khiễng, trúng mình thì chảy máu.',1,()=>gC('cnt:wound')+gC('cnt:hunt')),
  G_(1,'Lần theo vết máu, hạ con mồi','Thú bị thương nhỏ máu dọc đường: lại gần bấm "Xem vết máu" để biết hướng nó chạy. Ngã quỵ thì kết liễu.',1,()=>gC('cnt:hunt')),
  G_(1,'Xẻ thịt con mồi','Bấm Hành động ở xác thú: lột da, mổ bụng, xẻ thịt, rút gân. Có dao nhanh và được nhiều hơn.',1,()=>gC('cnt:butcher')+gC('cnt:scavenge')),
  G_(1,'Nướng hoặc hun khói 2 món','Cầm đồ sống bấm Hành động ở bếp đang cháy là nướng nhanh; hun khói để dành lâu. Thịt sống 2 ngày là ôi.',2,()=>gSum(GD_COOK)),
  G_(1,'Kể chuyện bên bếp lửa','Đêm xuống, bên bếp đang cháy: mở Chế tạo ở bếp → Kể một câu chuyện. Tinh thần vững thì làm nhanh.',1,()=>gC('cnt:story')),
  G_(1,'Làm áo tơi hoặc nón lá','Ướt mưa là rét, dễ cảm. Áo tơi lá cọ: 8 sợi + 1 dây; nón lá: 4 sợi + 2 cành. Nhớ mặc vào (Túi đồ).',1,()=>gC('craft:rainCape')+gC('craft:leafHat')),
  G_(1,'May áo ấm trước mùa đông','Đông (từ ngày 13) xuống dưới 0 °C. Kim xương (dao + xương) khâu áo choàng lông; hoặc đập vỏ cây làm áo.',1,()=>gSum(GD_WARM)),
  G_(1,'Đổi đồ với làng bên','Làng người Việt cổ ở gần: trò chuyện, đổi đồ (6 quả mọng lấy 2 thịt…), tặng quà để thêm tình thân.',1,()=>gC('cnt:trade')),
  G_(1,'Khám phá 4 vùng đất','Mở 🗺️ Bản đồ. Mỗi vùng có cây, đá, thú riêng: đất sét ven sông hồ, đá lửa, đồng ở vùng núi.',4,()=>gC('cnt:disc')),
  // ——— Thời Bắc Sơn: nhà cửa, đồ gốm ———
  G_(2,'Dựng bàn chế tác','Xây → Bàn chế tác (8 gỗ, 4 đá, 2 dây). Mở ra sàn, vách, mái, ván gỗ và công cụ mới.',1,()=>gDone('workbench')),
  G_(2,'San nền khu ở','Làm Gậy đào (2 cành, 1 đá). Xây → San nền: phát quang, đào gốc, nện phẳng. Chặt cây lớn trước.',1,()=>(S.flat||[]).length),
  G_(2,'Lát nền nhà 4 ô','Mỗi ô làm từng công đoạn: san phẳng (gậy đào) → kê đá gác dầm (rìu) → lát ván. Đứng sát bấm Hành động.',4,()=>gDone(GD_FLOOR)),
  G_(2,'Dựng 6 bức vách','Chôn cột (gậy đào) → buộc khung (rìu) → ghép gỗ hoặc đan phên trát bùn. Chừa một vách có cửa.',6,()=>gDone(GD_WALL)),
  G_(2,'Lợp 4 tấm mái','Mái tựa lên ít nhất 2 vách/cột: dựng kèo, lợp lớp dưới, lợp kín. Mái tranh mục dần, dột thì lợp lại.',4,()=>gDone(GD_ROOF)),
  G_(2,'Dựng chỗ nặn gốm','Đào đất sét ven sông hồ. Xây → Chỗ nặn gốm (4 đá, 2 gỗ, 4 sợi). Thử trộn Đất sét + Cát ở 📒 Ghi chép.',1,()=>gDone('potter')),
  G_(2,'Xây lò nung','Cần Xây dựng cấp 2. Lò nung (12 đất sét, 8 đá): nung gạch, nồi gốm, nồi nấu đồng.',1,()=>gDone('kiln')),
  G_(2,'Nung nồi gốm đầu tiên','Nặn gốm cuộn dải → phơi râm cho khô trên giàn → nung ở lò nung. Nung lúc còn ướt là nổ toác!',1,()=>gC('craft:pot')),
  // ——— Thời Phùng Nguyên: làng lúa nước ———
  G_(3,'Đắp ruộng lúa nước','Tuốt lúa hoang ven đầm (hè, thu) lấy thóc giống. Xây → Ruộng lúa nước sát suối hoặc có mương dẫn nước.',1,()=>gDone('paddy')),
  G_(3,'Gieo mạ rồi cấy lúa','Ruộng ngập nước → gieo 2 thóc giống làm mạ → mạ đủ tuổi thì nhổ đem cấy. Giữ nước, nhổ cỏ dại.',2,()=>Math.min(1,gC('cnt:sowRice'))+Math.min(1,gC('cnt:transplant'))),
  G_(3,'Gặt mùa lúa đầu tiên','Lúa chín vàng thì gặt (có liềm được nhiều hơn), đập lấy thóc, giã ở cối thành gạo.',1,()=>gC('cnt:riceHarvest')),
  G_(3,'Dựng kho thóc trên cột','Thóc dưới đất bị chuột khoét. Thử Hạt kê + Gỗ ở 📒 Ghi chép để nghĩ ra kho có đĩa chắn chuột.',1,()=>gDone('granary')),
  G_(3,'Thu hoạch 6 lần','Ruộng lúa, luống kê, luống bầu đều tính. Mưa, giếng, mương giúp cây lớn nhanh; mùa đông cây ngừng lớn.',6,()=>gC('cnt:harvest')),
  G_(3,'Dựng cột vật tổ','Cột vật tổ (10 gỗ, 2 đất sét, 4 hoa) đánh dấu nơi bộ lạc định cư: làng Phùng Nguyên ra đời.',1,()=>gDone('totem')+gC('build:totem')),
  G_(3,'Mở hội làng','Đánh Trống da vào Hội xuân (ngày đầu xuân), Hội mùa (đầu thu); hoặc dựng Đài trống hội, mở hội lúc nào cũng được.',1,()=>gC('cnt:festival')+gC('cnt:hoi')),
  G_(3,'Mời một người về ở cùng','Tình thân với làng 40 trở lên và có một giường trống: mời dân làng về ở, giao việc hái lượm, đốn gỗ.',1,()=>gC('cnt:folk')),
  // ——— Thời Đông Sơn: đồng thau ———
  G_(4,'Tìm quặng đồng và thiếc','Đá xanh lục lẫn cam là quặng đồng, đá xám nặng là thiếc: vùng núi xa. Cần cuốc đá.',8,()=>Math.min(gC('get:copper'),6)+Math.min(gC('get:tin'),2)),
  G_(4,'Xây lò luyện đồng','Cần Xây dựng cấp 4, Chế tác cấp 4 và 16 gạch nung. Lò có ống thổi để đủ nóng nấu chảy đồng.',1,()=>gDone('smelter')),
  G_(4,'Luyện thỏi đồng thau','3 quặng đồng + 1 thiếc + 2 than củi trong nồi nấu đồng (nung ở lò nung). Đồng thau cứng hơn đồng đỏ.',1,()=>gC('craft:bronze')),
  G_(4,'Đúc trống đồng Đông Sơn','8 thỏi đồng thau + 1 da (Chế tác cấp 5). Mặt trống hình ngôi sao, chim Lạc: báu vật của cả bộ lạc.',1,()=>gDone('bronzeDrum'))
];
GOALS.length=0;GOALS.push(...GD_GOALS);
// chỉ số mục tiêu cũ (31 mục) → mục tương ứng trong chuỗi mới
const GD_OLDMAP=[0,0,0,1,2,3,4,4,4,9,10,11,11,26,27,29,30,16,20,23,23,31,32,14,34,34,34,34,39,42,43,44];
/* ---------- tiến độ, hoàn thành ---------- */
goalProg=function(g){if(g&&g.f){let v=0;try{v=+g.f()||0;}catch(e){v=0;}if(gdS().sk[GOALS.indexOf(g)])v=g.n;return [Math.min(v,g.n),g.n];}const [t,k,n]=g.c;const v=S.cnt[t+':'+k]||0;return [Math.min(v,n),n];};
goalCheck=function(){if(!S)return;let moved=false;while(S.goal<GOALS.length){const g=GOALS[S.goal],[v,n]=goalProg(g);if(v<n)break;S.goal++;moved=true;const nx=GOALS[S.goal];
    uiToast('✔ Hoàn thành: '+g.t+(nx?' · Tiếp: '+nx.t:''),'good');sfx('level');}
  while(S.age<AGES.length-1&&AGES[S.age+1].ok()){S.age++;uiAge(S.age);}if(moved){uiHud(true);if(G.panel==='journal')uiOpenRefresh();}};
function gdCascade(){let n=0;while(S.goal<GOALS.length){const [v,k]=goalProg(GOALS[S.goal]);if(v<k)break;S.goal++;n++;}return n;}
{const _fs=fixSave;fixSave=function(o){o=_fs(o);if(o&&o.gdv!==2){const g=o.goal|0;o.goal=g>=GD_OLDMAP.length?GD_OLDMAP[GD_OLDMAP.length-1]:(GD_OLDMAP[g]??0);if(g===0)o.goal=0;o.gdv=2;o._gdMig=1;}return o;};}
/* ---------- bộ đếm mới (bọc hàm sẵn có) ---------- */
{const _w=h3wound;h3wound=function(a,dmg){_w(a,dmg);try{if(a&&a.alive&&Math.hypot(a.x-P.x,a.z-P.z)<900)cnt('cnt','wound');}catch(e){}};}
{const _r=h3bloodRead;h3bloodRead=function(b){_r(b);cnt('cnt','track');};}
{const _f=b3Festival;b3Festival=function(b){const B=b3S(),was=B.fest;_f(b);if(B.fest===S.day&&was!==S.day)cnt('cnt','hoi');};}
{const _d=siteDone;siteDone=function(b){_d(b);try{cnt('done',b.k);}catch(e){}};}
{const _l=landDone;landDone=function(r){_l(r);cnt('cnt','land');};}
// công đoạn bị chặn (thiếu vật liệu / công cụ): ghi lại để hiện thẻ gợi ý
{const _sh=siteHit;siteHit=function(b){const p0=b.prog;_sh(b);if(b.prog!=null&&b.prog===p0&&!G.act&&BYID.has(b.id))GD.stageT=G.t;};}
/* ===================== 4. THẺ GỢI Ý THEO NGỮ CẢNH ===================== */
const gdNear=(x,z,r)=>Math.hypot(x-P.x,z-P.z)<r;
const gdBlunt=()=>S.inv.find(s=>s&&typeof L4DUR!=='undefined'&&L4DUR[s.id]&&(s.d??100)<=30);
const gdPred=()=>(G.animals||[]).find(a=>a.alive&&!a.tame&&/tiger|wolf|bear|crocodile|leopard/.test(a.kind)&&gdNear(a.x,a.z,380));
const gdCarc=()=>(G.animals||[]).find(a=>!a.alive&&a._carc&&gdNear(a.x,a.z,220));
const gdLitNear=r=>(G.flames||[]).some(f=>!f.off&&gdNear(f.x,f.z,r||150));
// [khóa, ưu tiên, điều kiện, biểu tượng, tiêu đề, lời khuyên]
const GD_HINTS=[
  ['welcome',200,()=>G.t>3&&S.goal===0&&S.day===1,'👋','Từ hai bàn tay trắng','Làm theo Mục tiêu ở góc màn hình. Bí thì mở 📜 Nhật ký → "Hôm nay làm gì?". Lại gần đồ vật rồi bấm Hành động để nhặt.'],
  ['predator',100,()=>!!gdPred(),'🐯','Thú dữ ở gần!','Đừng lại gần, đừng quay lưng chạy. Lùi về phía lửa, cầm giáo hoặc đuốc. Ban đêm sói săn theo đàn; gấu, cá sấu giữ lãnh thổ.'],
  ['wound',95,()=>!!(S.st.wound||S.st.bleed),'🩸','Bị thương','Mở 🧍 Cơ thể: rửa vết thương bằng nước (đun sôi càng tốt) rồi đắp băng lá rau má, kẻo nhiễm trùng sưng mủ.'],
  ['sick',90,()=>['fever','poison','gut','cold','infect'].some(k=>S.st[k]),'🤒','Đau ốm','Chạm vào nhãn bệnh trên đầu màn hình để xem cách chữa: nước bạc hà giải độc, trà gừng chữa cảm, thuốc ngải chữa sốt. Nằm nghỉ cho mau khỏe.'],
  ['night',85,()=>S.hour>=17.5&&S.hour<21,'🌙','Trời sắp tối','Đêm tối, lạnh và thú săn mồi đi kiếm ăn. Về lều nghiêng, giữ lửa cháy (thêm củi), sau 19 giờ bấm Hành động ở lều để ngủ.'],
  ['rain',80,()=>typeof isRaining==='function'&&isRaining(),'🌧️','Trời mưa','Ướt người thì rét dần, dễ cảm. Củi ướt không nhóm được lửa ngoài trời: nhóm sát lều nghiêng, dưới mái hoặc trong hang. Áo tơi, nón lá đỡ ướt.'],
  ['carcass',75,()=>!!gdCarc(),'🔪','Xác thú','Bấm Hành động để xẻ thịt: lột da, mổ bụng, xẻ thịt. Không có dao thì vác về bếp, hoặc dùng mảnh đá lửa sắc.'],
  ['stage',72,()=>G.t-GD.stageT<20,'🧱','Dựng theo từng công đoạn','Mỗi công đoạn cần vật liệu và công cụ riêng: chôn cột cần Gậy đào, buộc khung cần Rìu. Nhìn dòng chữ trên công trình để biết còn thiếu gì.'],
  ['hungry',70,()=>S.p.food<30,'🍓','Đói bụng','Đói quá tay run, không làm nổi việc nặng. Hái quả, nấm rơm, đào củ mài; thịt cá thì nướng chín rồi mới ăn.'],
  ['thirst',70,()=>S.p.water<30,'💧','Khát nước','Ra suối uống, múc đầy bầu mang theo. Nắng nóng, chạy nhiều, làm nặng thì khát nhanh hơn; trời mưa hứng nước mưa uống được ngay.'],
  ['cold',68,()=>S.p.warm<30,'🥶','Lạnh cóng','Rét quá thì không cầm nổi đồ. Đứng gần lửa, vào dưới mái, thay đồ khô. May áo choàng lông, áo vỏ cây trước mùa đông.'],
  ['blunt',65,()=>!!gdBlunt(),'🪨','Lưỡi đã cùn','Công cụ cùn làm chậm hẳn. Túi đồ → chạm vào công cụ → Mài lưỡi (1 đá hoặc cát). Gãy cán thì Gắn cán mới (cành + dây).'],
  ['spoil',60,()=>invCount('meatRot')>0,'🤢','Thịt đã ôi','Ăn vào là ngộ độc. Thịt cá tươi chỉ để được chừng 2 ngày: nướng ăn ngay, hun khói trên bếp hoặc phơi khô trên giàn để dành.'],
  ['tired',55,()=>(S.p.rest??100)<30,'😪','Buồn ngủ','Thức lâu làm chậm, hay sai tay. Ngủ trong lều/giường, hoặc ngồi nghỉ bên lửa để tỉnh táo lại.'],
  ['village',50,()=>!!(G.vfire&&gdNear(G.vfire.x,G.vfire.z,560)),'🏘️','Làng người Việt cổ','Chạm vào dân làng để trò chuyện, đổi đồ, nhờ dạy nghề. Tặng quà, đổi đồ thường xuyên để thêm tình thân.'],
  ['winter',45,()=>seasonIdx()===2&&seasonDay()>=3,'❄️','Mùa đông sắp tới','Còn ít ngày nữa là rét dưới 0 °C, cây ngừng lớn. Dành củi, hun khói thịt, may áo ấm, lợp lại mái dột.'],
  ['dark',40,()=>isNight()&&!gdLitNear(150)&&P.toolId!=='torch','🔦','Tối quá','Làm việc trong bóng tối chậm và dễ đứt tay. Cầm đuốc (2 cành + 2 sợi) hoặc làm việc gần bếp lửa.']
];
function gdCardEl(){let el=document.getElementById('gdcard');if(!el){const g=$('#game');if(!g)return null;g.insertAdjacentHTML('beforeend','<div id="gdcard" class="gdcard" role="status" hidden></div>');el=document.getElementById('gdcard');}return el;}
function gdShow(h){const el=gdCardEl();if(!el)return;gdS().h[h[0]]=S.day;GD.card={k:h[0],t:G.t};GD.lastCard=G.t;
  el.innerHTML=`<div class="gdc-h"><span>${h[3]}</span><b>${esc(h[4])}</b><button class="gdc-x" data-gd="close" aria-label="Đóng">✕</button></div><p>${esc(h[5])}</p><div class="gdc-r"><button class="btn sm ghost" data-gd="todo">Hôm nay làm gì?</button><button class="btn sm" data-gd="close">Đã hiểu</button></div>`;
  el.hidden=false;el.classList.remove('out');gdPlace(el);sfx('idea');save();}
// đặt thẻ ngay dưới khung trạng thái và khung mục tiêu, chừa cột nút menu bên phải (đo thật, hợp mọi bố cục)
function gdPlace(el){const gm=$('#game'),R=gm?gm.getBoundingClientRect():{top:0,left:0,width:innerWidth,height:innerHeight};let top=10,left=10,right=R.width-10;
  for(const id of ['#hud','#goal']){const e=$(id);if(!e)continue;const r=e.getBoundingClientRect();if(r.height>0&&r.top-R.top<R.height*0.45){top=Math.max(top,r.bottom-R.top+8);if(id==='#hud')left=Math.max(10,r.left-R.left);}}
  const m=$('#menu');if(m){const r=m.getBoundingClientRect();if(r.width>0&&r.left-R.left>R.width*0.6&&r.top-R.top<top+160)right=r.left-R.left-8;}
  el.style.top=top+'px';el.style.left=left+'px';el.style.width=Math.max(220,Math.min(360,right-left))+'px';}
function gdHide(){const el=document.getElementById('gdcard');GD.card=null;GD.lastCard=G.t;if(el&&!el.hidden){el.classList.add('out');setTimeout(()=>{if(!GD.card){el.hidden=true;el.classList.remove('out');}},300);}}
function gdBusyUi(){const ov=$('#overlay');return G.paused||G.sleeping||G.build||G.panel||(ov&&!ov.hidden)||!G.on;}
function gdHintTick(){if(GD.card){if(G.t-GD.card.t>18||G.panel||G.build)gdHide();return;}if(gdBusyUi()||G.t-GD.lastCard<25)return;const seen=gdS().h;let best=null;
  for(const h of GD_HINTS){if(seen[h[0]])continue;let ok=false;try{ok=h[2]();}catch(e){}if(ok&&(!best||h[1]>best[1]))best=h;}if(best)gdShow(best);}
/* ===================== 5. "HÔM NAY LÀM GÌ?" ===================== */
function gdShelter(){return S.builds.some(b=>b.prog==null&&GD_BED.test(b.k));}
function gdFireBuilt(){return S.builds.find(b=>b.prog==null&&GD_FIRE.test(b.k));}
function gdRaw(){return ['birdRaw','meat','fish','yam','snail','taro'].find(k=>invCount(k)>0);}
function gdFood(){let best=null,bv=0;for(const s of S.inv){if(!s)continue;const I=ITEMS[s.id];if(!I||I.t!=='food'||I.poison||s.id==='meatRot')continue;const v=(I.food||0)*(I.raw?0.3:1);if(v>bv){bv=v;best=s.id;}}return best;}
function gdSuggest(){const out=[],add=(p,ic,t,w)=>out.push({p,ic,t,w}),p=S.p,night=isNight(),evening=S.hour>=15.5||night,fire=gdFireBuilt(),lit=gdLitNear(260);
  // thân thể
  if(S.st.bleed||S.st.wound){const w=(S.l4&&S.l4.wn)||{};add(100,'🩹',w.c>=1?'Băng vết thương':'Rửa và băng vết thương',invCount('bandage')?'Mở 🧍 Cơ thể → Rửa, rồi Băng lá.':'Làm Băng lá rau má (3 sợi + 2 rau má) rồi băng lại.');}
  if(S.st.fracture&&!(S.l4&&S.l4.fr&&S.l4.fr.spl))add(98,'🦯','Bó nẹp chân gãy','Nẹp tre (tre + sợi, hoặc 4 cành + sợi), rồi nghỉ ngơi.');
  const ill=['infect','fever','poison','gut','cold','heat'].find(k=>S.st[k]);if(ill){const cu={infect:'đắp cao nghệ nha đam, nằm nghỉ',fever:'uống thuốc ngải cứu, nằm nghỉ bên lửa',poison:'uống nước bạc hà',gut:'uống nước than củi hoặc cháo gừng',cold:'uống trà gừng, sưởi lửa',heat:'vào bóng râm, uống nước'}[ill];add(95,'🤒','Chữa '+STATUS[ill].n.toLowerCase(),cu[0].toUpperCase()+cu.slice(1)+'.');}
  if(p.water<35){const w=['water','waterDirty','gourd'].find(k=>invCount(k)>0);add(92-p.water/5,'💧',w?'Uống '+ITEMS[w].n.toLowerCase():'Ra suối uống nước',w?'Khát quá thì không làm nổi việc.':'Có bầu thì múc đầy mang theo.');}
  if(p.food<35){const f=gdFood(),r=gdRaw();if(f)add(91-p.food/5,'🍓','Ăn '+ITEMS[f].n.toLowerCase(),'Đói quá thì tay run, không làm nổi việc nặng.');else if(r&&fire)add(90-p.food/5,'🔥','Nướng '+ITEMS[r].n.toLowerCase()+' rồi ăn','Ăn sống dễ ngộ độc.');else add(89-p.food/5,'🫐','Đi hái quả, nấm, đào củ','Bụi quả mọng, chuối rừng, nấm rơm quanh bìa rừng.');}
  if(p.warm<30)add(88,'🥶','Sưởi ấm',lit?'Đứng sát lửa, thay đồ khô.':'Nhóm lửa hoặc vào dưới mái nhà.');
  const tired=(p.rest??100)<30;
  // đêm đầu, chỗ trú, lửa
  if(!gdShelter()){add(evening?87:60,'⛺','Dựng lều nghiêng'+(evening?' trước khi tối':''),'14 cành, 10 sợi. Không có chỗ trú thì không ngủ qua đêm được.');}
  else if(night||tired)add(tired?84:70,'😴','Về lều ngủ','Ngủ hồi đầy máu, thể lực; cạnh lửa thì ngủ ngon hơn.');
  if(!fire)add(evening?83:55,'🔥','Dựng bếp lửa sát lều','6 đá, 4 cành, 2 gỗ. Lửa sưởi ấm, nướng thịt, đuổi thú.');
  else if(!lit&&(evening||p.warm<45)){if(!hasTool('fire'))add(82,'🪵','Làm que khoan lửa','2 cành, 1 gỗ, 2 sợi: có nó mới nhóm được bếp.');else add(81,'🔥','Nhóm lửa, thêm củi','Bấm Hành động ở bếp. Mưa thì chỉ nhóm được dưới mái hoặc sát lều.');}
  // công cụ
  const br=S.inv.find(s=>s&&typeof L4DUR!=='undefined'&&L4DUR[s.id]&&(s.d??100)<=0);if(br)add(78,'🔧','Gắn cán mới cho '+ITEMS[br.id].n.toLowerCase(),'Túi đồ → chạm vào nó → Gắn cán mới (cành + dây).');
  const bl=gdBlunt();if(bl&&!br)add(66,'🪨','Mài lưỡi '+ITEMS[bl.id].n.toLowerCase(),'Lưỡi cùn làm chậm hẳn. Mài bằng 1 đá.');
  // săn bắn, đồ ăn để lâu
  if(gdCarc())add(76,'🔪','Xẻ con thú vừa hạ','Để lâu thú khác tới tha mất, thịt mau ôi.');
  if(invCount('meatRot'))add(50,'🗑️','Bỏ thịt ôi đi','Ăn vào là ngộ độc.');
  const raw=['meat','fish','birdRaw'].find(k=>invCount(k)>0);if(raw&&fire)add(62,'🥩','Nướng hoặc hun khói '+ITEMS[raw].n.toLowerCase(),'Thịt cá tươi chỉ để được chừng 2 ngày.');
  // y phục theo mùa
  const si=seasonIdx();if((si===3||(si===2&&seasonDay()>=2))&&(typeof wearWarm==='function'?wearWarm():0)<10)add(74,'🧥','May áo ấm cho mùa đông','Áo choàng lông (3 da + dây, kim xương) hoặc áo vỏ cây.');
  if(typeof isRaining==='function'&&isRaining()&&typeof l4RainProt==='function'&&l4RainProt()<0.3)add(58,'🌧️','Làm áo tơi lá cọ','8 sợi + 1 dây: đi mưa không ướt rét.');
  // ruộng, vườn, công trình, lễ hội
  if(S.l4&&S.l4.pad)for(const b of S.builds){if(b.k!=='paddy'||b.prog!=null)continue;const F=S.l4.pad[b.id];if(!F)continue;
    if(F.st===4){add(64,'🌾','Gặt lúa chín','Có liềm thì được nhiều lúa hơn.');break;}if(F.st===2){add(60,'🌱','Nhổ mạ đem cấy','Mạ đã đủ tuổi.');break;}if((F.st===3||F.st===0)&&F.w<0.2&&F.st===3){add(56,'💦','Tát nước vào ruộng','Ruộng cạn thì lúa còi cọc.');break;}if(F.st===3&&F.weed>0.45){add(48,'🌿','Làm cỏ ruộng lúa','Cỏ dại tranh chất với lúa.');break;}}
  for(const id in S.crops){const c=S.crops[id];if(c&&cropStage(c)>=3){add(52,'🌾','Thu hoạch luống đã chín','Để lâu chim, chuột ăn mất.');break;}}
  const leak=S.builds.find(b=>b.prog==null&&b.cond!=null&&typeof B3LEAK!=='undefined'&&b.cond<B3LEAK);if(leak)add(46,'🛠️','Lợp lại '+pieceDef(leak.k).n.toLowerCase(),'Mái mục bị dột: mưa lọt vào nhà.');
  if(typeof l4FestNow==='function'&&l4FestNow()&&S.builds.some(b=>b.prog==null&&/^(drum|drumStage)$/.test(b.k))&&S.l4&&!String(S.l4.fest||'').startsWith(l4FestNow().k+':'))add(57,'🥁','Đánh trống mở '+l4FestNow().n.toLowerCase(),'Cả làng vui hội: tinh thần lên cao.');
  if(night&&lit&&typeof l4StoryOk==='function'&&S.l4&&S.l4.story!==S.day+(S.hour<6?-1:0))add(40,'📜','Kể chuyện bên bếp lửa','Mở Chế tạo ở bếp → Kể một câu chuyện.');
  const site=S.builds.find(b=>b.prog!=null&&gdNear(b.x,b.z,900));if(site){const d=pieceDef(site.k);let w='Đứng sát công trình, bấm Hành động.';try{if(typeof STG!=='undefined'&&STG[site.k]){const s=b3stg(site);w='Công đoạn '+(s.i+1)+'/'+s.n+': '+s.s.n.toLowerCase()+'.';const m=s.paid<=s.i?b3miss(s.s):'';if(m)w+=' '+m+'.';}}catch(e){}add(38,'🏗️','Làm tiếp '+d.n.toLowerCase(),w);}
  // mục tiêu hiện tại luôn là một lựa chọn
  const g=GOALS[S.goal];if(g){const [v,n]=goalProg(g);add(35,'🎯',g.t+(n>1?` (${v}/${n})`:''),g.d);}
  if(!night&&gC('cnt:disc')<3&&p.hp>60)add(20,'🧭','Đi khám phá vùng lân cận','Mỗi vùng có cây, đá, thú riêng.');
  out.sort((a,b)=>b.p-a.p);const seen=new Set(),res=[];for(const o of out){if(seen.has(o.t))continue;seen.add(o.t);res.push(o);if(res.length>=3)break;}return res;}
function gdTodoHtml(){const L=GD.todo;return `<div class="gdtodo"><div class="row"><button class="btn sm" data-gd="todo">🤔 Hôm nay làm gì?</button>${L?'<span class="small muted">3 việc nên làm ngay</span>':''}</div>${L?`<ol>${L.map(o=>`<li><span>${o.ic}</span><span><b>${esc(o.t)}</b><br><span class="small muted">${esc(o.w)}</span></span></li>`).join('')}</ol>`:''}</div>`;}
/* ---------- mục tiêu trong Nhật ký: theo thời đại, có bỏ qua ---------- */
function gdGoalsHtml(){const cur=S.goal,sk=gdS().sk;let h='';for(let e=0;e<AGES.length;e++){const idx=GOALS.map((g,i)=>g.e===e?i:-1).filter(i=>i>=0);if(!idx.length)continue;
    const done=idx.filter(i=>i<cur).length,all=done===idx.length,now=idx.includes(cur);
    const rows=idx.map(i=>{const g=GOALS[i],st=i<cur?'done':i===cur?'cur':'next';if(i>cur+2&&now)return '';const [v,n]=goalProg(g);
      return `<div class="jg ${st}"><b>${i<cur?(sk[i]?'↷':'✔'):i===cur?'➤':'○'} ${esc(g.t)}</b>${i>=cur?`<span class="small muted">${esc(g.d)}</span>`:''}${i===cur?`${n>1?`<div class="g-p"><i style="--v:${v/n*100}%"></i><span>${v}/${n}</span></div>`:''}<button class="gdskip" data-gd="skip">${GD.skipArm===i?'Chắc chắn bỏ qua mục này?':'Bỏ qua mục này'}</button>`:''}</div>`;}).join('');
    h+=`<details class="gdera"${now?' open':''}><summary>${all?'✔':now?'➤':'○'} ${esc(AGES[e].n)} <span class="small muted">${done}/${idx.length}</span></summary>${rows}</details>`;}
  if(cur>=GOALS.length)h+='<div class="jg done"><b>🎉 Bạn đã đi hết chặng đường từ hai bàn tay trắng tới trống đồng Đông Sơn!</b><span class="small muted">Hãy xây làng theo ý mình.</span></div>';return h;}
{const _jh=journalHtml;journalHtml=function(){let h=_jh();const a='<h3>Mục tiêu</h3>',b='<h3>Sổ tay sinh tồn</h3>',i=h.indexOf(a),j=h.indexOf(b);
  if(i>=0&&j>i)h=h.slice(0,i)+gdTodoHtml()+a+gdGoalsHtml()+h.slice(j);else h=gdTodoHtml()+h;return h;};}
function gdClick(e){const a=e.target&&e.target.closest&&e.target.closest('[data-gd]');if(!a||!S)return;e.stopImmediatePropagation();e.preventDefault();sfx('pick');const k=a.dataset.gd;
  if(k==='close'){gdHide();return;}
  if(k==='todo'){GD.todo=gdSuggest();if(G.panel!=='journal'){gdHide();uiOpen('journal',{});}else uiOpenRefresh();return;}
  if(k==='skip'){if(GD.skipArm!==S.goal){GD.skipArm=S.goal;uiOpenRefresh();return;}GD.skipArm=-1;const g=GOALS[S.goal];if(!g)return;gdS().sk[S.goal]=1;S.goal++;uiToast('↷ Bỏ qua: '+g.t+'. Lúc nào làm cũng được.','');uiHud(true);goalCheck();save();uiOpenRefresh();}}
document.addEventListener('click',gdClick,true);
/* ---------- nhịp: kiểm tra mục tiêu theo trạng thái, thẻ gợi ý ---------- */
{const _bt=bodyTick;bodyTick=function(dt){_bt(dt);if(!G.on||!S)return;GD.t+=dt;if(GD.t<1)return;GD.t=0;
  try{if(S._gdMig){delete S._gdMig;gdCascade();uiHud(true);}gdS();goalCheck();gdHintTick();}catch(e){if(!GD.err){GD.err=1;console.warn('guide',e);}}};}
{const _uo=uiOpen;uiOpen=function(k,o,keep){if(k==='journal'&&!keep&&G.panel!=='journal')GD.skipArm=-1;if(k&&GD.card){gdHide();const el=document.getElementById('gdcard');if(el){el.hidden=true;el.classList.remove('out');}}return _uo(k,o,keep);};}
{const _uc=uiClose;uiClose=function(){_uc();GD.todo=null;GD.skipArm=-1;};}
{const st=document.createElement('style');st.textContent=`
.gdcard{position:absolute;z-index:11;left:10px;top:calc(max(10px,env(safe-area-inset-top)) + var(--hudh,96px) + 6px);width:min(330px,calc(100vw - 76px));padding:10px 12px 9px;border-radius:14px;background:rgba(22,15,10,.95);border:1px solid var(--acc,#e8a24a);box-shadow:0 8px 22px rgba(0,0,0,.5);font-size:13px;line-height:1.4;pointer-events:auto;animation:tin .25s ease-out;transition:opacity .3s,transform .3s}
.gdcard.out{opacity:0;transform:translateY(-8px)}.gdcard p{margin:5px 0 8px;color:#f1e4cc}.gdc-h{display:flex;align-items:center;gap:7px}.gdc-h span{font-size:20px}.gdc-h b{flex:1;color:#ffe9b8;font-size:14px}
.gdc-x{background:none;border:0;color:inherit;font-size:16px;padding:2px 6px;cursor:pointer;opacity:.7}.gdc-r{display:flex;justify-content:flex-end;gap:6px}
.gdtodo{padding:8px;border-radius:12px;background:rgba(255,200,90,.07);border:1px solid var(--line,rgba(255,255,255,.12));margin:8px 0}.gdtodo .row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.gdtodo ol{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:6px}.gdtodo li{display:grid;grid-template-columns:26px 1fr;gap:6px;align-items:start}.gdtodo li>span:first-child{font-size:19px;line-height:1.2}
.gdera{margin:4px 0;border-radius:10px;background:rgba(255,255,255,.03)}.gdera>summary{cursor:pointer;padding:6px 8px;font-weight:700}.gdera>.jg{margin-left:6px}
.gdskip{display:block;margin-top:5px;background:none;border:0;padding:2px 0;color:var(--muted,#b9a98f);font-size:11.5px;text-decoration:underline;cursor:pointer}`;document.head.appendChild(st);}
