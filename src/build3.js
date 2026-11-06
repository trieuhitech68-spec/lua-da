/* ===================== XÂY DỰNG & CHẾ TÁC CHI TIẾT: CÔNG ĐOẠN, VẬT LIỆU, THỜI TIẾT, CHỊU LỰC, XƯỞNG, GHI CHÉP =====================
   Mô-đun này mở rộng (không sửa) các mô-đun trước:
   • Công trình dựng theo từng công đoạn thật: đào hố chôn cột → buộc khung → đan phên → trát bùn… Mỗi công đoạn có vật liệu, công cụ riêng,
     hình dáng riêng trên công trường (giàn cột, khung, phên, kèo…). Nguyên liệu trả dần theo công đoạn.
   • Vật liệu có tính riêng: vách bùn/đất nện phải phơi khô (mưa xối thì trôi), mái tranh mục dần rồi dột, phải lợp lại (sửa chữa).
   • Chịu lực: sàn tầng trên cần tường/cột đỡ, dầm chỉ vươn được 1–2 ô; mái phải tựa lên tường/cột. Gợi ý ngay trên thanh xây.
   • Xưởng làm tỉ mỉ: nặn gốm cuộn dải → phơi → nung (gốm đất trơn dễ nứt, trộn cát thì bền), se dây, thuộc da, đan chiếu, chẻ nan,
     mài rìu Bắc Sơn, khuôn đúc đá hai mang thời Đông Sơn.
   • Công trình mới: kho thóc trên cột (chắn chuột), rào phên, tường đá xếp, tường đất nện, nền đất nện, mương dẫn nước, bếp ba ông đầu rau,
     chiếu cói, đài trống hội, chỗ nặn gốm, phiến đá mài.
   • Sổ "Ghi chép · Ý tưởng": học được khi làm, khi hỏng, hoặc khi tự thử kết hợp hai thứ trong túi. Ý tưởng mở ra cách làm mới.
   Trạng thái lưu: b.paid (số công đoạn đã trả), b.cond (độ bền %), b.dry (giờ còn phải phơi), S.b3 {notes, dry, fest}. */
const B3LEAK=30,B3DRYH=5,B3RACK=6;
const b3S=()=>S.b3||(S.b3={notes:{},dry:{},fest:0});
const b3has=k=>!!(S&&S.b3&&S.b3.notes[k]);
const TOOLN={dig:'Gậy đào',axe:'Rìu',knife:'Dao',hammer:'Búa đá',pick:'Cuốc đá'};
/* ---------- vật phẩm mới ---------- */
Object.assign(ITEMS,{
  sand:{n:'Cát mịn (bột đá)',t:'res'}, clayMix:{n:'Đất nhào cát',t:'res'}, greenPotP:{n:'Gốm mộc đất trơn',t:'res'}, greenPot:{n:'Gốm mộc đất trộn',t:'res'},
  dryPot:{n:'Gốm mộc đã phơi',t:'res'}, sherd:{n:'Mảnh gốm vỡ',t:'res'}, mat:{n:'Chiếu cói',t:'res'}, bambooStrip:{n:'Nan tre',t:'res'},
  polishedAxe:{n:'Rìu đá mài Bắc Sơn',t:'tool',tool:'axe',pow:2.7}, shoulderAxe:{n:'Rìu có vai',t:'tool',tool:'axe',pow:3.0},
  mould:{n:'Khuôn đúc đá',t:'res'}, bronzeHoe:{n:'Cuốc đồng',t:'tool',tool:'dig',pow:2}});
Object.assign(EMO,{sand:'⏳',clayMix:'🟫',greenPotP:'🏺',greenPot:'🏺',dryPot:'🏺',sherd:'🧩',mat:'🟨',bambooStrip:'🎋',polishedAxe:'🪓',shoulderAxe:'🪓',mould:'🧱',bronzeHoe:'⛏️'});
Object.assign(ST_N,{potter:'Chỗ nặn gốm',grind:'Phiến đá mài'});
/* ---------- ghi chép, ý tưởng (kiến thức có thật về cách làm của người xưa) ---------- */
const NOTES={
  postHole:{ic:'🕳️',t:'Chôn cột sâu, chèn đá chân cột',d:'Cột chôn sâu chừng 1/4 chiều cao, chèn đá và nện đất quanh chân thì nhà không xiêu khi gió bão. Dấu lỗ cột như thế còn thấy ở các di chỉ Phùng Nguyên, Đồng Đậu.',how:'Làm xong công đoạn chôn cột của một bức vách, hoặc thử Cành cây + Đá.'},
  lash:{ic:'🪢',t:'Buộc khung bằng lạt, dây',d:'Chưa có đinh, người xưa ngàm mộng và buộc các khớp bằng lạt tre, dây mây. Khung buộc dẻo, gió lay không gãy.',how:'Buộc xong khung một bức vách, hoặc thử Dây thừng + Cành cây.'},
  wattle:{ic:'🧺',t:'Vách phên trát bùn',d:'Đan cành, nan thành phên rồi trát bùn trộn rơm hai mặt. Rơm giữ bùn không nứt toác khi khô; vách ấm mùa đông, mát mùa hè.',how:'Đan phên cho vách đất, hoặc thử Đất sét + Sợi cỏ.'},
  daubRain:{ic:'🌧️',t:'Bùn ướt sợ mưa',d:'Vách mới trát cần vài giờ cho khô. Mưa xối vào lúc còn ướt sẽ rửa trôi lớp bùn. Lợp mái trước rồi hãy trát, hoặc chọn ngày nắng.',how:'Để mưa xối vào vách đất còn ướt.'},
  temper:{ic:'⏳',t:'Đất sét trộn cát thì ít nứt',d:'Đất sét trơn co ngót mạnh khi khô nên dễ nứt. Trộn cát, bột đá hay mảnh gốm vỡ nghiền nhỏ (chất độn) giúp đất co đều, gốm khỏi nứt khi phơi và nung.',how:'Thử Đất sét + Cát mịn, hoặc để một gốm đất trơn nứt khi phơi.'},
  dryFirst:{ic:'☀️',t:'Phơi kỹ rồi mới nung',d:'Gốm mộc còn hơi nước, cho vào lửa to ngay thì nước sôi trong thành gốm làm vỡ toang. Phơi râm cho khô đều, sấy lửa nhỏ, rồi mới nung già lửa.',how:'Nung vội một gốm mộc còn ướt.'},
  coil:{ic:'🏺',t:'Nặn cuộn dải, hòn kê bàn đập',d:'Gốm Phùng Nguyên, Đồng Đậu nặn bằng cách cuộn dải đất chồng lên nhau, rồi lót hòn kê bên trong, vỗ bàn đập bên ngoài cho thành mỏng đều. Bàn đập quấn thừng để lại hoa văn thừng.',how:'Nặn một gốm mộc ở Chỗ nặn gốm.'},
  twist:{ic:'➰',t:'Se ngược chiều thì dây không bung',d:'Mỗi sợi se xoắn một chiều, rồi chập hai sợi bện theo chiều ngược lại: lực xoắn ghì chặt nhau, dây bền gấp nhiều lần.',how:'Bện một sợi thừng, hoặc thử riêng Sợi cỏ.'},
  smoke:{ic:'💨',t:'Hun khói da thuộc',d:'Da cạo sạch, phơi khô, bôi óc cho mềm rồi hun khói: khói làm da không thối, ướt rồi khô vẫn mềm.',how:'Thuộc một tấm da, hoặc thử Da thú + Than củi.'},
  polish:{ic:'🪓',t:'Mài đá bằng cát và nước',d:'Văn hoá Bắc Sơn nổi tiếng với rìu mài lưỡi: chà đi chà lại trên phiến đá cát, rắc cát ướt làm chất mài. Lưỡi mài sắc, bền, chặt cây nhanh hơn rìu ghè.',how:'Thử Đá + Cát mịn.'},
  span:{ic:'📏',t:'Nhịp dầm có hạn',d:'Một cây dầm gỗ chỉ vươn được chừng 2 ô (4 m) mà không võng gãy; tre, sàn đá nặng còn ngắn hơn. Muốn sàn rộng phải dựng thêm hàng cột ở giữa.',how:'Đặt thử sàn tầng trên quá xa cột đỡ.'},
  stilt:{ic:'🛖',t:'Nhà sàn',d:'Nhà sàn tránh lũ, ẩm thấp, rắn rết, thú dữ; gầm sàn để củi, nuôi gà lợn. Hình nhà sàn mái cong còn khắc trên mặt trống đồng Đông Sơn.',how:'Gác đà cho cột nhà sàn, hoặc thử Cây tre + Dây thừng.'},
  thatch:{ic:'🌾',t:'Lợp tranh từ dưới lên',d:'Bó tranh xếp từ mép mái lên nóc, lớp trên phủ chồng lớp dưới như vảy cá để nước trôi xuôi. Mái càng dày, tranh càng lâu mục.',how:'Lợp lớp tranh đầu tiên của một mái.'},
  rot:{ic:'💧',t:'Mái tranh phải lợp lại',d:'Tranh, lá mục dần theo mưa nắng; mái mỏng sẽ dột. Rút bỏ tranh mục và lợp thêm lớp mới mỗi mùa. Mái lá cọ mau mục hơn mái tranh dày.',how:'Để một mái mục đến dột.'},
  rats:{ic:'🐀',t:'Kho trên cột, đĩa chắn chuột',d:'Chuột khoét giỏ ăn thóc. Kho lúa dựng trên cột, mỗi cột có đĩa gỗ chắn ngang thì chuột không leo lên được; sàn cao còn tránh ẩm và nước lũ.',how:'Để chuột ăn mất thóc trong giỏ, hoặc thử Hạt kê + Gỗ.'},
  rammed:{ic:'🧱',t:'Đất nện từng lớp',d:'Đổ đất ẩm vào ván khuôn từng lớp mỏng chừng một gang tay, nện thật chặt rồi mới đổ lớp sau. Tường đất nện dày, ấm, không cháy, bền rất lâu nếu có mái che mưa.',how:'Thử Đất sét + Gỗ (ván khuôn).'},
  channel:{ic:'💦',t:'Khơi mương dẫn nước',d:'Đào mương nhỏ từ suối về ruộng, kè đá hai bờ cho khỏi lở: ruộng đủ nước, lúa kê lớn nhanh. Mương phải nối liền tới chỗ có nước.',how:'Thử Đá + Bầu nước suối.'},
  alloy:{ic:'🟫',t:'Đồng thau: đồng pha thiếc',d:'Đồng đỏ mềm. Pha chừng 1 phần thiếc với 4–9 phần đồng thành đồng thau cứng, chảy loãng dễ đúc. Thợ Đông Sơn còn pha chì khi rót trống đồng.',how:'Nấu một thỏi đồng thau, hoặc thử Quặng đồng + Quặng thiếc.'},
  mould:{ic:'🧩',t:'Khuôn đúc hai mang',d:'Khuôn đá cát hai nửa ghép lại, khoét lòng hình lưỡi cuốc, mũi tên, có rãnh rót và lỗ thoát khí: dùng lại được nhiều lần. Khuôn đất phải đập vỡ mới lấy được vật đúc.',how:'Thử Thỏi đồng thau + Đá.'},
  hearth3:{ic:'🔥',t:'Ba ông đầu rau',d:'Ba hòn đá kê nồi trên lửa: nồi vững, lửa đủ gió, ít tốn củi. Tục thờ Táo quân của người Việt bắt nguồn từ bếp ba hòn này.',how:'Thử Đá + Đất sét.'},
  weave:{ic:'🟨',t:'Đan lóng mốt',d:'Đan một lên một xuống (lóng mốt) hay hai lên hai xuống (lóng đôi): chiếu, nong, nia, giỏ, phên vách đều từ kiểu đan này. Nan phơi héo rồi mới đan cho khỏi gãy.',how:'Đan một tấm chiếu, hoặc thử Nan tre + Sợi cỏ.'}};
const B3EXP={'clay+sand':'temper','clay+sherd':'temper','clay+fiber':'wattle','fiber':'twist','charcoal+hide':'smoke','sand+stone':'polish','clay+stone':'hearth3','clay+wood':'rammed','clay+plank':'rammed',
  'stone+waterDirty':'channel','stone+water':'channel','copper+tin':'alloy','bronze+stone':'mould','grain+wood':'rats','grain+plank':'rats','bambooStrip+fiber':'weave','bamboo+fiber':'weave',
  'stick+stone':'postHole','rope+stick':'lash','fiber+stick':'lash','bamboo+rope':'stilt'};
const B3HINT={clay:'Đất sét nặn được, nhưng khô thì co lại và nứt… trộn thêm thứ gì hạt thô vào thử xem?',stone:'Đá to khó dùng. Đập vụn thành cát (Chế tạo → Cát mịn) rồi thử kết hợp lại.',
  copper:'Đồng đỏ mềm quá, rìu đồng đỏ mau cùn. Pha với một loại quặng khác thì sao?',hide:'Da tươi để lâu sẽ thối, gặp nước lại cứng. Khói bếp có giúp được gì không?',
  'clay+waterDirty':'Đất sét ngâm nước thì dẻo, nhưng phơi khô vẫn nứt. Thiếu chất độn hạt thô.','clay+water':'Đất sét ngâm nước thì dẻo, nhưng phơi khô vẫn nứt. Thiếu chất độn hạt thô.',
  grain:'Thóc để trong giỏ dưới đất hay bị chuột khoét. Kê kho lên cao được không?',bronze:'Đồng thau rót vào đâu để thành hình lưỡi cuốc? Cần một thứ chịu được lửa, khoét được lòng…',
  bamboo:'Tre chẻ ra nan thì đan được đủ thứ. Thử với sợi cỏ hoặc dây?',wood:'Gỗ làm cột, làm ván khuôn… thử cùng đất sét hoặc đá xem.',sand:'Cát mài được đá, trộn được vào đất sét. Thử với Đá hoặc Đất sét.'};
/* ---------- công đoạn dựng (mỗi công đoạn: tên, tên ngắn, vật liệu, công cụ, tỉ lệ công, mô hình công trường, ghi chép mở ra) ---------- */
const S_=(n,sn,c,o)=>Object.assign({n,sn,c:c||{}},o||{});
const sPosts=(mat,c)=>S_('Đào hố, chôn cột, chèn đá chân cột','Chôn cột',c,{tool:'dig',w:.22,ov:mat==='bamboo'?'e_postsB':'e_posts',note:'postHole'});
const sFrame=(mat,c,tool)=>S_(mat==='bamboo'?'Chẻ tre, gác xà, buộc khung':'Gác xà, buộc khung bằng dây','Buộc khung',c,{tool:tool||'axe',w:.26,ov:mat==='bamboo'?'e_frameB':'e_frame',note:'lash'});
const sPad=S_('San phẳng, nện nền, căng dây lấy mặt bằng','San nền',{},{tool:'dig',w:.25,ov:'f_pad'});
const STG={
  wall:[sPosts('wood',{wood:1}),sFrame('wood',{stick:2,fiber:2}),S_('Xếp gỗ khít vào khung thành vách','Ghép vách',{wood:2},{w:.52})],
  wallDoor:[sPosts('wood',{wood:1}),sFrame('wood',{stick:2,fiber:2}),S_('Ghép vách, chừa lối, treo rèm da','Ghép vách',{wood:2,hide:1},{w:.52})],
  wallWindow:[sPosts('wood',{wood:1}),sFrame('wood',{stick:2,fiber:2}),S_('Ghép vách, chừa ô cửa sổ','Ghép vách',{wood:2},{w:.52})],
  mudWall:[sPosts('wood',{wood:1}),sFrame('wood',{stick:2,fiber:1}),S_('Đan phên cành (lóng mốt)','Đan phên',{stick:3},{w:.24,ov:'e_wattle',note:'wattle'}),S_('Trát bùn trộn rơm hai mặt','Trát bùn',{clay:4,fiber:2},{w:.28,ov:'e_wattle',wet:1})],
  mudWallWindow:[sPosts('wood',{wood:1}),sFrame('wood',{stick:2,fiber:1}),S_('Đan phên, chừa ô cửa sổ','Đan phên',{stick:3},{w:.24,ov:'e_wattle',note:'wattle'}),S_('Trát bùn trộn rơm hai mặt','Trát bùn',{clay:3,fiber:2},{w:.28,ov:'e_wattle',wet:1})],
  bambooWall:[sPosts('bamboo',{bamboo:1}),sFrame('bamboo',{bamboo:1,rope:1},'knife'),S_('Đan nan tre thành vách','Đan nan',{bambooStrip:4},{w:.52,ov:'e_frameB',note:'weave'})],
  bambooWallDoor:[sPosts('bamboo',{bamboo:1}),sFrame('bamboo',{bamboo:1,rope:1},'knife'),S_('Đan nan, chừa lối, treo rèm da','Đan nan',{bambooStrip:3,hide:1},{w:.52,ov:'e_frameB'})],
  stoneWall:[S_('Đào móng, kè đá chân tường','Đào móng',{stone:3},{tool:'dig',w:.3,ov:'e_found'}),S_('Xây gạch, trát vữa đất sét','Xây gạch',{brick:4,clay:2},{w:.7,ov:'e_found'})],
  stoneWallDoor:[S_('Đào móng, kè đá chân tường','Đào móng',{stone:3},{tool:'dig',w:.3,ov:'e_found'}),S_('Xây gạch, chừa cửa, treo rèm da','Xây gạch',{brick:4,clay:2,hide:1},{w:.7,ov:'e_found'})],
  rammedWall:[S_('Đào móng, kè đá chân tường','Đào móng',{stone:2},{tool:'dig',w:.2,ov:'e_found'}),S_('Dựng ván khuôn hai bên, buộc chặt','Ván khuôn',{plank:2,rope:1},{tool:'axe',w:.2,ov:'e_form'}),
    S_('Đổ đất ẩm, nện chặt từng lớp một gang tay','Nện đất',{clay:6},{w:.45,ov:'e_form2',note:'rammed'}),S_('Tháo ván khuôn, vỗ phẳng mặt tường','Tháo khuôn',{},{w:.15,wet:1})],
  dryStoneWall:[S_('Đào rãnh móng','Đào móng',{stone:4},{tool:'dig',w:.35,ov:'e_found'}),S_('Xếp đá to dưới, đá nhỏ chèn trên','Xếp đá',{stone:8},{w:.65,ov:'e_found'})],
  wattleFence:[S_('Cắm cọc nhọn','Cắm cọc',{stick:3},{tool:'dig',w:.35,ov:'e_stakes'}),S_('Đan cành ngang qua cọc','Đan cành',{stick:5,fiber:2},{w:.65,ov:'e_stakes'})],
  floor:[sPad,S_('Kê đá tảng, gác dầm','Gác dầm',{wood:1},{tool:'axe',w:.3,ov:'f_joist'}),S_('Lát ván sàn','Lát sàn',{wood:2},{w:.45,ov:'f_joist'})],
  stoneFloor:[sPad,S_('Lát đá phiến, chèn cát kẽ','Lát đá',{stone:6},{w:.75,ov:'f_pad'})],
  bambooFloor:[sPad,S_('Gác đà tre, buộc dây','Gác đà',{bamboo:1,rope:1},{w:.3,ov:'f_joist'}),S_('Lát cây tre đập dập','Lát tre',{bamboo:3},{w:.45,ov:'f_joist'})],
  mudFloor:[S_('San phẳng, tưới ẩm','San nền',{clay:2},{tool:'dig',w:.4,ov:'f_pad'}),S_('Nện chặt, láng mặt bằng đất nhào cát','Nện láng',{clay:2,sand:1},{w:.6,ov:'f_pad',wet:1})],
  upperFloor:[S_('Gác dầm lên đầu tường, đầu cột','Gác dầm',{wood:1},{tool:'axe',w:.4,ov:'f_beams'}),S_('Lát ván sàn gác','Lát ván',{plank:3},{w:.6,ov:'f_beams'})],
  roof:[S_('Dựng kèo, gác rui mè','Dựng kèo',{stick:4},{tool:'axe',w:.35,ov:'r_rafter'}),S_('Lợp lớp lá dưới, sát mép mái','Lớp dưới',{fiber:3},{w:.3,ov:'r_layer',note:'thatch'}),S_('Lợp chồng lên tới nóc','Lợp kín',{fiber:3},{w:.35,ov:'r_rafter'})],
  thatchRoof:[S_('Dựng kèo, gác rui mè','Dựng kèo',{stick:4},{tool:'axe',w:.3,ov:'r_rafter'}),S_('Lợp bó tranh lớp dưới','Lớp dưới',{fiber:4},{w:.3,ov:'r_layer',note:'thatch'}),S_('Lợp chồng như vảy cá tới nóc','Lợp kín',{fiber:6},{w:.4,ov:'r_rafter'})],
  leafRoof:[S_('Dựng kèo, gác rui mè','Dựng kèo',{stick:3},{tool:'axe',w:.4,ov:'r_rafter'}),S_('Lợp lá cọ chồng mép','Lợp lá',{fiber:6},{w:.6,ov:'r_rafter',note:'thatch'})],
  roofCap:[S_('Dựng 4 kèo chụm đỉnh, buộc vòng mè','Dựng kèo',{stick:5},{tool:'axe',w:.4,ov:'c_rafter'}),S_('Lợp tranh vòng quanh từ dưới lên','Lợp tranh',{fiber:8},{w:.6,ov:'c_rafter',note:'thatch'})],
  stilt:[S_('Đào hố sâu, chôn 4 cột','Chôn cột',{wood:3},{tool:'dig',w:.35,ov:'s_posts',note:'postHole'}),S_('Gác đà, giằng chéo, buộc dây','Gác đà',{wood:1,rope:2},{tool:'axe',w:.35,ov:'s_beams',note:'stilt'}),S_('Lát sàn','Lát sàn',{wood:1},{w:.3,ov:'s_beams'})],
  granary:[S_('Đào hố, chôn 4 cột cao','Chôn cột',{wood:4},{tool:'dig',w:.3,ov:'g_posts'}),S_('Lắp đĩa chắn chuột, gác sàn kho','Đĩa chắn chuột',{plank:4,rope:1},{tool:'axe',w:.3,ov:'g_deck',note:'rats'}),S_('Quây vách nan tre, lợp mái tranh','Vách, mái',{bambooStrip:4,fiber:8},{w:.4,ov:'g_deck'})],
  drumStage:[S_('Đào hố, chôn 6 cột đài','Chôn cột',{wood:6},{tool:'dig',w:.3,ov:'d_posts'}),S_('Gác đà, lát sàn đài','Lát sàn',{plank:6,rope:2},{tool:'axe',w:.35,ov:'d_deck'}),S_('Bịt da trống, treo dùi, dựng bậc','Trống',{hide:2,wood:4},{w:.35,ov:'d_deck'})],
  channel:[S_('Đào mương, kè đá hai bờ','Đào mương',{stone:4},{tool:'dig',w:1})]};
for(const k in STG){let c=0;STG[k]._cum=STG[k].map(s=>(c+=s.w));const n=STG[k].length;STG[k]._cum[n-1]=1;}
// thời tiết: decay = %/giờ tự mục, rain = hệ số khi mưa, rainOnly = %/giờ chỉ khi bị mưa xối, dry = giờ phơi sau khi xong, leak = mái dột
const B3W={thatchRoof:{decay:.5,rain:2.2,leak:1,rep:{fiber:4,stick:1}},roof:{decay:.7,rain:2.2,leak:1,rep:{fiber:3,stick:1}},leafRoof:{decay:.95,rain:2.2,leak:1,rep:{fiber:3}},
  roofCap:{decay:.6,rain:2.2,leak:1,rep:{fiber:4,stick:1}},granary:{decay:.3,rain:2,rep:{fiber:3}},
  mudWall:{rainOnly:.35,dry:8,rep:{clay:2,fiber:1}},mudWallWindow:{rainOnly:.35,dry:8,rep:{clay:2,fiber:1}},rammedWall:{rainOnly:.12,dry:10,rep:{clay:2}},mudFloor:{dry:6}};
const B3WETOV={mudWall:'e_wet',mudWallWindow:'e_wet',rammedWall:'e_wetR',mudFloor:'f_wet'};
const B3SPAN={bambooFloor:1,stoneFloor:1,upperFloor:2,floor:2};
const RATFOOD=new Set(['grain','seedGrain','berry','bread','lotusSeed','egg','banana','mushroom']);
/* ---------- công trình mới ---------- */
BUILD.push(
  {id:'potter',n:'Chỗ nặn gốm',cat:'co',kind:'obj',fp:[1,1],cost:{stone:4,wood:2,fiber:4},st:'potter',req:['clay'],d:'Chiếu, hòn kê, bàn đập: nặn gốm cuộn dải, phơi gốm mộc ngay tại đây. Gốm phơi khô rồi đem nung ở Lò nung.'},
  {id:'grindSlab',n:'Phiến đá mài',cat:'co',kind:'obj',fp:[1,1],small:1,cost:{stone:8,sand:2},st:'grind',req:['sand'],note:'polish',d:'Phiến đá cát có rãnh mài, bát nước bên cạnh: mài rìu Bắc Sơn, rìu có vai, khoét khuôn đúc.'},
  {id:'granary',n:'Kho thóc trên cột',cat:'nong',kind:'obj',fp:[1,1],store:20,ratproof:1,cost:{},req:['grain'],note:'rats',d:'Kho nhỏ trên 4 cột có đĩa chắn chuột: thóc, hạt, quả cất ở đây không bị chuột ăn, không ẩm.'},
  {id:'wattleFence',n:'Rào phên đan',cat:'nong',kind:'edge',low:1,cost:{},req:['stick','fiber'],d:'Cọc nhọn cắm đất, đan cành ngang: rào vườn, quây chuồng.'},
  {id:'dryStoneWall',n:'Tường đá xếp khan',cat:'nong',kind:'edge',low:1,cost:{},req:['stone','clay'],d:'Đá to xếp dưới, đá nhỏ chèn trên, không cần vữa: bờ rào bền, giữ đất ruộng bậc thang.'},
  {id:'rammedWall',n:'Tường đất nện',cat:'nha',kind:'edge',cost:{},req:['clay','plank'],note:'rammed',d:'Ván khuôn, đổ đất, nện từng lớp: tường dày, ấm, chống cháy. Cần phơi khô và có mái che mưa.'},
  {id:'mudFloor',n:'Nền đất nện',cat:'nha',kind:'floor',cost:{},req:['clay'],note:'rammed',d:'Nền đất nện láng đất nhào cát: rẻ, mát, khô ráo. Phơi khô vài giờ.'},
  {id:'channel',n:'Mương dẫn nước',cat:'nong',kind:'obj',fp:[1,2],cost:{},req:['seedGrain'],note:'channel',d:'Mương kè đá dài 2 ô. Một đầu phải chạm nước (suối, hồ) hoặc nối với mương có nước: luống đất gần mương lớn nhanh hơn.'},
  {id:'hearth3',n:'Bếp ba ông đầu rau',cat:'co',kind:'obj',fp:[1,1],small:1,cost:{stone:3,clay:1,stick:2},st:'campfire',light:1,warm:1,fuel:1,req:['clay'],note:'hearth3',d:'Ba hòn đá kê nồi trên lửa: nấu nướng, sưởi ấm như bếp lửa, gọn trong nhà.'},
  {id:'sleepMat',n:'Chiếu cói',cat:'noi',kind:'obj',fp:[1,1],small:1,bed:1,cost:{mat:1,fiber:2},req:['mat'],d:'Trải chiếu cói lên sàn để ngủ: mát mùa hè, gọn nhẹ.'},
  {id:'drumStage',n:'Đài trống hội',cat:'trang',kind:'obj',fp:[2,2],drum:1,cost:{},req:['hide','plank'],lv:{build:3},d:'Đài gỗ cao có trống lớn: đánh trống mở hội, cả nhà phấn chấn làm việc nhanh hơn (mỗi ngày một lần).'});
// tổng vật liệu = cộng các công đoạn; mô tả thêm chuỗi công đoạn
BUILD.forEach(b=>{const st=STG[b.id];if(!st)return;const c={};st.forEach(s=>{for(const k in s.c)c[k]=(c[k]||0)+s.c[k];});b.cost=c;
  b.d=(b.d||'')+' Công đoạn: '+st.map((s,i)=>(i+1)+'. '+s.sn+(s.tool?' ('+TOOLN[s.tool]+')':'')).join(' → ')+'.';});
/* ---------- công thức mới / nâng cấp ---------- */
{const pot=RECIPES.find(r=>r.id==='pot');if(pot){pot.in={dryPot:1};pot.req=['dryPot'];pot.steps='fire';}
 const g=GOALS.find(g=>g.c&&g.c[1]==='pot');if(g)g.d='Nặn gốm mộc ở Chỗ nặn gốm, phơi khô trên giàn, rồi nung ở Lò nung. Đất sét trộn cát thì gốm ít nứt.';
 const tan=RECIPES.find(r=>r.id==='leather');if(tan)tan.steps='tan';}
RECIPES.push(
  {id:'sand',out:{sand:2},in:{stone:1},st:null,req:['stone','clay'],steps:'sand'},
  {id:'grog',out:{sand:3},in:{sherd:2},st:null,req:['sherd'],steps:'sand'},
  {id:'clayMix',out:{clayMix:2},in:{clay:2,sand:1},st:null,req:['clay','sand'],note:'temper',steps:'clayMix'},
  {id:'greenPotP',out:{greenPotP:1},in:{clay:4},st:'potter',req:['clay'],steps:'coil'},
  {id:'greenPot',out:{greenPot:1},in:{clayMix:3},st:'potter',req:['clayMix'],steps:'coil'},
  {id:'potRush',out:{pot:1},in:{greenPot:1},st:'kiln',req:['greenPot'],steps:'fireRush'},
  {id:'bambooStrip',out:{bambooStrip:4},in:{bamboo:1},st:null,tool:'knife',req:['bamboo'],steps:'strip'},
  {id:'mat',out:{mat:1},in:{fiber:6},st:null,req:['fiber','rope'],steps:'weave'},
  {id:'polishedAxe',out:{polishedAxe:1},in:{stone:2,sand:2,stick:1,rope:1},st:'grind',req:['sand'],note:'polish',lv:{craft:1},steps:'polish'},
  {id:'shoulderAxe',out:{shoulderAxe:1},in:{stone:2,sand:3,wood:1,rope:1},st:'grind',req:['polishedAxe'],note:'polish',lv:{craft:3},steps:'polish2'},
  {id:'mould',out:{mould:1},in:{stone:3,sand:2},st:'grind',req:['bronze'],note:'mould',lv:{craft:4},steps:'mould'},
  {id:'bronzeHoe',out:{bronzeHoe:1},in:{bronze:1,stick:1},st:'smelter',tool:'mould',req:['mould'],lv:{craft:4},steps:'castStone'},
  {id:'bronzeArrow',out:{arrow:6},in:{bronze:1,stick:3,feather:3},st:'smelter',tool:'mould',req:['mould','feather'],lv:{craft:4},steps:'castStone'});
Object.assign(WSTEP,{
  rope:[['Đập dập thân cỏ, tước lấy xơ','work',0.8,'pick'],['Chuốt sợi mảnh, đều tay','work',0.7,'pick'],['Se từng sợi xoắn một chiều (lăn trên đùi)','lash',0.9,'pick'],['Chập đôi, bện ngược chiều thành thừng','lash',1.0,'pick'],['Kéo căng, cắt gọn đầu dây','work',0.4,'pick']],
  tan:[['Căng da lên khung','lash',0.8,'pick'],['Cạo sạch thịt, mỡ bằng dao đá','work',1.4,'step'],['Phơi khô trong bóng râm','work',0.9,'step'],['Bôi óc thú, vò cho mềm','work',1.1,'step'],['Hun khói trên bếp cho bền','cook',1.1,'step']],
  smelt:[['Cân tỉ lệ: 4 phần đồng, 1 phần thiếc','gather',0.7,'pick'],['Đập nhỏ quặng','knap',1.3,'mine'],['Xếp than, quạt ống thổi','grind',1.8,'step'],['Nấu chảy trong nồi nấu','cook',2.2,'step'],['Rót thành thỏi','work',1.0,'pick']],
  cast:[['Nặn khuôn đất sét, sấy nóng khuôn','work',1.2,'pick'],['Nung chảy thỏi đồng','cook',1.4,'step'],['Rót đồng vào miệng khuôn','work',1.0,'pick'],['Để nguội, đập vỡ khuôn đất','knap',0.9,'mine'],['Cưa cuống rót, mài sắc lưỡi','grind',1.5,'step'],['Tra cán, buộc chặt','lash',0.9,'pick']],
  castStone:[['Ghép hai mang khuôn đá, buộc chặt','lash',0.8,'pick'],['Nung chảy thỏi đồng','cook',1.4,'step'],['Rót đồng qua rãnh rót','work',1.0,'pick'],['Để nguội, mở khuôn (khuôn còn dùng lại)','work',0.8,'pick'],['Mài bavia, mài sắc','grind',1.3,'step']],
  sand:[['Đập vụn bằng búa đá','knap',1.0,'mine'],['Giã nhỏ trong cối đá','grind',1.1,'step'],['Sàng lấy hạt mịn','work',0.7,'pick']],
  clayMix:[['Ngâm đất sét cho rữa','work',0.7,'pick'],['Nhặt bỏ sạn, rễ cây','work',0.6,'pick'],['Rắc cát, giẫm nhào thật kỹ','grind',1.5,'step'],['Ủ ẩm cho dẻo','work',0.5,'pick']],
  coil:[['Vê đất thành dải dài','work',0.9,'pick'],['Cuộn dải chồng lên thành thân nồi','work',1.3,'pick'],['Hòn kê trong, bàn đập ngoài cho thành mỏng đều','knap',1.3,'step'],['Miết láng bằng vỏ sò','grind',0.9,'step'],['In hoa văn thừng, khắc vạch','work',0.8,'pick']],
  fire:[['Xếp gốm mộc vào lò, chèn củi','work',0.8,'pick'],['Đốt lửa nhỏ sấy nóng dần','cook',1.3,'step'],['Thêm củi, nung già lửa (đỏ rực)','cook',1.7,'step'],['Bịt cửa lò, ủ nguội từ từ','work',0.9,'pick']],
  fireRush:[['Xếp gốm còn ướt vào lò','work',0.6,'pick'],['Đốt lửa to ngay','cook',1.3,'step'],['Ủ nguội','work',0.6,'pick']],
  strip:[['Chọn cây tre bánh tẻ','gather',0.5,'pick'],['Chẻ đôi, chẻ tư','carve',1.1,'chop'],['Lạng bỏ ruột, vót nan mỏng','whittle',1.3,'chop'],['Phơi héo cho dẻo','work',0.5,'pick']],
  weave:[['Phơi cỏ cói cho héo','work',0.6,'pick'],['Xếp sợi dọc làm khung','lash',0.8,'pick'],['Đan lóng mốt: một lên một xuống','lash',1.7,'pick'],['Lên viền, nẹp mép','lash',0.8,'pick']],
  polish:[['Chọn hòn cuội dài, hạt mịn','gather',0.6,'pick'],['Ghè thô tạo phôi rìu','knap',1.3,'mine'],['Rắc cát ướt, mài lưỡi trên phiến đá','grind',2.0,'step'],['Mài nhẵn hai mặt thân rìu','grind',1.4,'step'],['Tra cán, chèn nêm, buộc dây','lash',1.1,'pick']],
  polish2:[['Chọn đá hạt mịn','gather',0.6,'pick'],['Ghè phôi, tạo hai vai','knap',1.6,'mine'],['Mài vai và chuôi tra cán','grind',1.6,'step'],['Mài lưỡi trên đá cát ướt','grind',1.8,'step'],['Tra cán gỗ, buộc dây chéo','lash',1.1,'pick']],
  mould:[['Chọn hai phiến đá cát mịn','gather',0.7,'pick'],['Mài phẳng mặt ghép','grind',1.3,'step'],['Khoét lòng khuôn hình lưỡi','carve',1.6,'chop'],['Khoét rãnh rót, lỗ thoát khí','carve',0.9,'chop'],['Khắc dấu ghép hai mang','work',0.5,'pick']]});
/* ===================== TRẠNG THÁI CÔNG ĐOẠN ===================== */
function b3stg(b){const st=STG[b.k];if(!st)return null;const n=st.length,cum=st._cum,p=b.prog==null?1:b.prog;let i=0;while(i<n-1&&p>=cum[i]-1e-9)i++;const s0=i?cum[i-1]:0;
  return {st,n,i,s:st[i],cum,local:clamp((p-s0)/Math.max(1e-6,cum[i]-s0),0,1),paid:b.paid==null?n:b.paid};}
function b3miss(sg){if(sg.tool&&!hasTool(sg.tool))return 'Cần '+TOOLN[sg.tool];const m=[];for(const k in sg.c){const h=haveCount(k);if(h<sg.c[k])m.push((sg.c[k]-h)+' '+ITEMS[k].n);}return m.length?'Thiếu '+m.join(', '):'';}
function b3costTxt(c){return Object.entries(c).map(([k,v])=>v+' '+ITEMS[k].n).join(', ')||'chỉ cần công sức';}
function b3paidCost(b,def){const st=STG[b.k];if(!st)return def.cost;const n=b.paid==null?st.length:b.paid,c={};for(let i=0;i<n&&i<st.length;i++)for(const k in st[i].c)c[k]=(c[k]||0)+st[i].c[k];return c;}
function b3ovKey(b){if(b.prog!=null&&STG[b.k]){const s=b3stg(b);return s.s.ov||null;}if(b.dry>0)return B3WETOV[b.k]||null;return null;}
/* ===================== MÔ HÌNH (K3, vẽ hàng loạt) ===================== */
const B3OV=new Map(),B3CUR=new Map();
let B3WETM=null;const b3wetMat=()=>B3WETM||(B3WETM=new THREE.MeshStandardMaterial({color:'#4b3526',roughness:0.32,metalness:0.05}));
function b3rng(seed){let s=seed*9301+49297;return ()=>{s=(s*16807)%2147483647;return (s%10000)/10000;};}
const B3M={};// mô hình công trường + công trình mới (hàm trả Group mới mỗi lần gọi)
(function(){const PI=Math.PI,K=()=>K3,G_=(...a)=>K3.group(...a);
  const post=(x,z,h,mat,r)=>K3.cyl((r||2.3)*0.9,r||2.4,h,mat,{x,z,y:-4},7);
  const mound=(x,z)=>K3.cyl(3.8,5.2,2,'soil',{x,z,y:-0.6},7);
  const pebble=(x,z,i)=>K3.ico(1.5,'stone',{x,z,y:0.6,sy:0.6},0,0.3,i);
  const lashK=(x,y,z)=>K3.cyl(3,3,2.8,'#b49a62',{x,y,z},6);
  const posts=(mat)=>[post(-18.5,0,56,mat),post(18.5,0,56,mat),mound(-18.5,0),mound(18.5,0),pebble(-15,2,1),pebble(15.5,-2.4,2),pebble(-21,-2,3)];
  const frame=(mat)=>[...posts(mat),K3.box(43,3.4,3.4,mat,{y:44.4}),K3.box(41,2.4,2.4,mat,{y:21.6}),lashK(-18.5,43.8,0),lashK(18.5,43.8,0),lashK(-18.5,21,0),lashK(18.5,21,0)];
  B3M.e_posts=()=>G_(posts('wood'));B3M.e_postsB=()=>G_(posts('bamboo'));B3M.e_frame=()=>G_(frame('wood'));B3M.e_frameB=()=>G_(frame('bamboo'));
  B3M.e_wattle=()=>{const a=frame('wood');[-14,-9.3,-4.7,0,4.7,9.3,14].forEach(x=>a.push(K3.cyl(0.7,0.8,44,'dwood',{x,y:0.5},5)));for(let k=0;k<10;k++)a.push(K3.box(36.5,1.3,1.3,'#7a5a3a',{y:3.5+k*4.4,z:k%2?0.9:-0.9}));return G_(a);};
  const found=()=>{const a=[K3.box(44,1,10,'soil',{y:-0.5})];for(let i=0;i<7;i++)a.push(K3.ico(3.6+(i%3)*0.5,'stone',{x:-18+i*6,y:1.6,sy:0.65},0,0.3,i+3));return a;};
  B3M.e_found=()=>G_(found());
  const form=(fill)=>{const a=found();[-5.6,5.6].forEach(z=>{for(let k=0;k<8;k++)a.push(K3.box(42,5.6,1.3,'wood',{y:k*6.05,z}));});[[-21.5,-6.8],[21.5,-6.8],[-21.5,6.8],[21.5,6.8]].forEach(([x,z])=>a.push(K3.cyl(1.2,1.3,54,'dwood',{x,z,y:-2},5)));
    a.push(K3.box(40.5,fill,9.6,'#b38556',{}));for(let y=6;y<fill;y+=6)a.push(K3.box(40.6,0.4,9.7,'#8a6640',{y}));return a;};
  B3M.e_form=()=>G_(form(7));B3M.e_form2=()=>{const a=form(38);a.push(K3.cyl(0.9,0.9,36,'wood',{x:8,y:40,z:0},5),K3.box(5,6,5,'dwood',{x:8,y:36}));return G_(a);};
  B3M.e_stakes=()=>{const a=[];for(let i=0;i<7;i++){const x=-18+i*6;a.push(K3.cyl(1,1.1,24,'dwood',{x,y:-2},5),K3.cone(1,3.4,'dwood',{x,y:22},5));}return G_(a);};
  const wetBlobs=(z0)=>{const M=b3wetMat(),T=THREE,a=[];[[-14,8],[-6,15],[6,6],[14,12],[-14,37],[-5,43],[7,41],[15,31],[-16,23],[16,21]].forEach(([x,y],i)=>[z0,-z0].forEach(z=>a.push(K3.mesh(new T.SphereGeometry(5.5,8,6),M,{x,y,z,sx:1+(i%3)*0.2,sy:0.75,sz:0.1,noShadow:true}))));return a;};
  B3M.e_wet=()=>G_(wetBlobs(3.6));B3M.e_wetR=()=>G_(wetBlobs(4.9));
  B3M.f_wet=()=>G_(K3.mesh(new THREE.BoxGeometry(38,0.4,38),b3wetMat(),{y:6.05,noShadow:true}));
  const pad=()=>{const a=[K3.box(40,1.5,40,'soil',{y:-0.3})];[[-19,-19],[19,-19],[-19,19],[19,19]].forEach(([x,z])=>a.push(K3.cyl(0.7,0.7,9,'dwood',{x,z},5)));
    [-19,19].forEach(v=>{a.push(K3.box(40,0.35,0.35,'#efe4cc',{y:7,z:v}),K3.box(0.35,0.35,40,'#efe4cc',{x:v,y:7}));});return a;};
  B3M.f_pad=()=>G_(pad());
  B3M.f_joist=()=>{const a=pad();[[-15,-15],[15,-15],[-15,15],[15,15],[0,-15],[0,15]].forEach(([x,z],i)=>a.push(K3.ico(3.2,'stone',{x,z,y:1,sy:0.6},0,0.25,i)));[-15,0,15].forEach(z=>a.push(K3.box(40,3.4,4,'wood',{y:2.2,z})));return G_(a);};
  B3M.f_beams=()=>{const a=[];[-14,0,14].forEach(z=>a.push(K3.box(46,4,4.5,'wood',{y:0.5,z})));[-18,18].forEach(x=>a.push(K3.box(4,3,41,'dwood',{x,y:4})));return G_(a);};
  const rafters=()=>{const a=[];[-19,0,19].forEach(x=>a.push(K3.box(2.4,2.4,59,'dwood',{center:true,x,y:60.2,z:0.4,rx:0.6435})));[0,12,24,36,48].forEach(s=>a.push(K3.box(44,1.6,1.6,'bamboo',{center:true,y:48+0.6*s-0.4,z:20-0.8*s-0.3})));
    [-19,19].forEach(x=>a.push(lashK(x,47.6,19.7)));return a;};
  B3M.r_rafter=()=>G_(rafters());B3M.r_layer=()=>{const a=rafters();a.push(K3.box(44,2.8,24,'thatch',{center:true,y:52.6,z:15.9,rx:0.6435}));return G_(a);};
  B3M.c_rafter=()=>{const T=THREE,a=[],up=new T.Vector3(0,1,0);[[-24,-24],[24,-24],[-24,24],[24,24]].forEach(([x,z])=>{const p0=new T.Vector3(x,43,z),p1=new T.Vector3(0,77,0),d=p1.clone().sub(p0),L=d.length();
      const m=K3.cyl(1.2,1.4,L,'dwood',{center:true},6);m.position.copy(p0.clone().add(p1).multiplyScalar(0.5));m.quaternion.setFromUnitVectors(up,d.normalize());a.push(m);});
    [[43,25],[53,18],[63,10.5]].forEach(([y,h])=>{[-1,1].forEach(s=>{a.push(K3.box(2*h,1.4,1.4,'bamboo',{center:true,y,z:s*h}),K3.box(1.4,1.4,2*h,'bamboo',{center:true,y,x:s*h}));});});return G_(a);};
  const sPosts=(h,o)=>{const a=[];[[-o,-o],[o,-o],[-o,o],[o,o]].forEach(([x,z])=>a.push(post(x,z,h,'wood',2.8),mound(x,z)));return a;};
  B3M.s_posts=()=>G_(sPosts(64,20));
  B3M.s_beams=()=>{const a=sPosts(64,20);[-20,20].forEach(x=>a.push(K3.box(3,3,44,'dwood',{center:true,x,y:40})));[-20,20].forEach(z=>a.push(K3.box(44,4,4,'wood',{center:true,y:52,z})));
    [-10,0,10].forEach(x=>a.push(K3.box(3,3,42,'wood',{center:true,x,y:55.5})));[[-20,-20],[20,-20],[-20,20],[20,20]].forEach(([x,z])=>a.push(lashK(x,51,z)));return G_(a);};
  const gPosts=()=>sPosts(34,14);
  const gDeck=()=>{const a=gPosts();[[-14,-14],[14,-14],[-14,14],[14,14]].forEach(([x,z])=>a.push(K3.cyl(6.6,6.6,1.2,'dwood',{x,z,y:20},10)));a.push(K3.box(38,3,38,'wood',{y:29}));[-14,14].forEach(z=>a.push(K3.box(40,3,3,'dwood',{y:26.5,z})));return a;};
  B3M.g_posts=()=>G_(gPosts());B3M.g_deck=()=>G_(gDeck());
  const dPosts=()=>{const a=[];[-30,0,30].forEach(x=>[-30,30].forEach(z=>a.push(post(x,z,28,'wood',3),mound(x,z))));[-30,30].forEach(z=>a.push(K3.box(66,3.5,3.5,'dwood',{y:19.5,z})));return a;};
  const dDeck=()=>{const a=dPosts();a.push(K3.box(70,3,70,'wood',{y:22}));[6,12,18].forEach((h,i)=>a.push(K3.box(16,h,6,'wood',{y:0,z:47-i*5.5})));return a;};
  B3M.d_posts=()=>G_(dPosts());B3M.d_deck=()=>G_(dDeck());
  // ---- công trình hoàn chỉnh ----
  const potShape=(col,s,x,y,z)=>[K3.sphere(5.6*s,col,{x,y:y+5*s,z,sy:0.82},9,7),K3.cyl(3.3*s,4.2*s,2.6*s,col,{x,y:y+8.6*s,z},9),K3.torus(3.5*s,0.7*s,col,{x,y:y+11.3*s,z,rx:PI/2},10)];
  B3M.potter=()=>{const a=[K3.box(34,0.6,28,'thatch',{}),K3.ico(4.6,'stone',{x:-7,y:1.6,z:2,sy:0.55},1,0.2,3),K3.box(3.2,0.9,9,'wood',{x:6,y:0.6,z:7,ry:0.5}),K3.cyl(0.8,0.8,7,'dwood',{center:true,x:9.5,y:1.2,z:12.5,rx:PI/2,ry:0.5},5),
      K3.sphere(4.4,'clay',{x:9,y:2.6,z:-5,sy:0.7},8,6),K3.torus(3.2,1,'clay',{x:-1,y:1.2,z:-8,rx:PI/2},10),K3.torus(2.4,0.9,'clay',{x:-1,y:2.8,z:-8,rx:PI/2},10),
      K3.cyl(4.6,3.6,3.4,'dwood',{x:-12,z:9},9),K3.cyl(4,4,0.4,'water',{x:-12,y:3,z:9},9),
      K3.ico(2.4,'stone',{x:-12,y:1,z:-12},0,0.2,5),K3.ico(2.4,'stone',{x:12,y:1,z:-12},0,0.2,6),K3.box(30,1.2,6,'wood',{y:3,z:-12})];
    a.push(...potShape('#a8865e',0.85,-6,4.2,-12),...potShape('#9c7a58',0.7,6,4.2,-12),...potShape('#c9a27a',0.95,-6,0.6,10.5));return G_(a);};
  B3M.grindSlab=()=>{const a=[K3.box(34,7,20,'stone',{}),K3.box(22,0.5,1.6,'#5a554e',{y:7,z:-4}),K3.box(22,0.5,1.6,'#5a554e',{y:7,z:0}),K3.box(18,0.5,1.4,'#5a554e',{x:2,y:7,z:4}),
      K3.cyl(5,4,4,'clay',{x:-12,y:7,z:5},9),K3.cyl(4.4,4.4,0.4,'water',{x:-12,y:10.4,z:5},9),K3.cone(5,3,'#d8c690',{x:12,y:7,z:5},8),
      K3.sphere(4,'dstone',{x:3,y:8.3,z:-6,sx:0.5,sy:0.35,sz:1},8,6),K3.ico(2,'stone',{x:16,y:1,z:-12},0,0.2,4)];return G_(a);};
  B3M.granary=()=>{const a=gDeck();a.push(K3.box(30,24,30,'bamboo',{y:30.5}));[[-15,-15],[15,-15],[-15,15],[15,15]].forEach(([x,z])=>a.push(K3.cyl(1.4,1.4,26,'dwood',{x,y:30.5,z},5)));
    [36,46].forEach(y=>a.push(K3.box(31,1.2,31,'#7a5a3a',{y})));a.push(K3.box(9,13,1,'dwood',{y:33,z:15.3}),K3.cone(25*Math.SQRT2,27,'thatch',{y:53.5,ry:PI/4},4),K3.cyl(24*Math.SQRT2,25.6*Math.SQRT2,2.4,'#a78446',{y:52,ry:PI/4},4),K3.cyl(1.8,2.6,4,'#b49a62',{y:79},6),
      K3.box(3.2,34,3,'wood',{center:true,y:15,z:24,rx:-0.42}));for(let i=0;i<5;i++)a.push(K3.box(4,1.2,2,'dwood',{center:true,y:4+i*6,z:28.5-i*2.6,rx:-0.42}));return G_(a);};
  B3M.wattleFence=()=>{const a=B3M.e_stakes().children.slice();for(let k=0;k<4;k++)a.push(K3.box(37,1.3,1.3,'#7a5a3a',{y:4+k*4.8,z:k%2?0.9:-0.9}));return G_(a);};
  B3M.dryStoneWall=()=>{const R=b3rng(7),a=[K3.box(42,2,10,'soil',{y:-1.4})];for(let r=0;r<4;r++)for(let i=0;i<7;i++){const x=-18+i*6+(r%2?3:0);if(Math.abs(x)>19.5)continue;const s=r===3?3.2:4.3-r*0.3;
      a.push(K3.ico(s+R()*1.1,R()<0.5?'stone':'dstone',{x,y:2+r*6.1,z:(R()-0.5)*1.4,sx:1.25,sy:0.75,sz:0.95},0,0.35,r*7+i+1));}return G_(a);};
  B3M.rammedWall=()=>{const a=[K3.box(42,5,11,'stone',{y:-2}),K3.box(40,45,9,'#b48a5c',{y:3})];for(let y=9;y<46;y+=6)a.push(K3.box(40.3,0.5,9.3,'#8a6844',{y}));a.push(K3.box(43,2.6,12,'thatch',{y:48}));return G_(a);};
  B3M.mudFloor=()=>G_(K3.box(40,6,40,'mud',{}),K3.box(41,1.6,41,'#7d5c3c',{y:-0.4}));
  B3M.channel=()=>{const a=[K3.box(17,0.6,80,'soil',{y:-0.5}),K3.box(11,0.5,80,'water',{y:0.2})];for(let i=0;i<10;i++){const z=-36+i*8;a.push(K3.ico(3.2,'stone',{x:-8.6,y:0.8,z,sy:0.6},0,0.3,i+2),K3.ico(3.2,'stone',{x:8.6,y:0.8,z:z+3,sy:0.6},0,0.3,i+20));}return G_(a);};
  B3M.hearth3=()=>{const a=[K3.cyl(10,10.5,0.6,'#3c3631',{},12)];[0,2.094,4.189].forEach((t,i)=>a.push(K3.ico(4.4,'stone',{x:Math.cos(t)*7.5,z:Math.sin(t)*7.5,y:3.2,sy:1.15},1,0.22,i+1)));
    [0.3,2.4,4.5].forEach(t=>a.push(K3.cyl(0.9,1.1,15,'dwood',{center:true,x:Math.cos(t)*3,y:1.3,z:Math.sin(t)*3,rz:PI/2,ry:t},5)));
    let fl=null;try{const cf=model(['piece','campfire']);cf.traverse(o=>{if(o.name==='flame'&&!fl)fl=o;});if(fl){fl.parent.remove(fl);fl.scale.multiplyScalar(0.75);fl.position.set(0,fl.position.y*0.75+1,0);}}catch(e){}
    if(!fl){fl=K3.group(K3.cone(3.5,10,'fire',{noShadow:true},6));fl.name='flame';fl.userData.dyn=1;}a.push(fl);return G_(a);};
  B3M.sleepMat=()=>{const a=[K3.box(22,0.8,34,'#cfb27a',{})];[-12,-4,4,12].forEach(z=>a.push(K3.box(22.2,0.9,1.2,'#a8874e',{z})));a.push(K3.cyl(3,3,18,'#b89a62',{center:true,rz:PI/2,y:3.4,z:-13},8));return G_(a);};
  B3M.drumStage=()=>{const a=dDeck();a.push(K3.cyl(13,11,16,'dwood',{y:25},14),K3.cyl(13.4,13.4,1,'hide',{y:41},14),K3.torus(13.2,0.6,'#7a5a3a',{y:40.5,rx:PI/2},16),
      K3.cyl(0.8,0.8,18,'wood',{center:true,x:16,y:30,rz:0.7},5),K3.cyl(0.8,0.8,18,'wood',{center:true,x:-16,y:30,rz:-0.7},5));
    [[-33,-33],[33,-33],[-33,33],[33,33]].forEach(([x,z])=>{a.push(K3.cyl(1.4,1.6,26,'rwood',{x,z,y:24},6),K3.cone(3,6,'rwood',{x,z,y:50,rx:0.5},5));});return G_(a);};
  // ---- vật phẩm, công cụ ----
  B3M.i_sand=()=>G_(K3.cone(7,4.5,'#d8c690',{},9),K3.ico(1.4,'stone',{x:3,y:1,z:3},0,0.2,2));
  B3M.i_clayMix=()=>G_(K3.sphere(6,'#a87a52',{y:4,sy:0.65},9,7),K3.ico(1,'#e0d0a0',{x:2,y:7,z:2},0,0,1),K3.ico(1,'#e0d0a0',{x:-2,y:6.5,z:-1},0,0,2));
  B3M.i_greenPotP=()=>G_(potShape('#8e6e50',1,0,0,0));B3M.i_greenPot=()=>G_(potShape('#a8865e',1,0,0,0));B3M.i_dryPot=()=>G_(potShape('#d2b088',1,0,0,0));
  B3M.i_sherd=()=>G_(K3.box(6,0.8,5,'clay',{rx:0.3,ry:0.4}),K3.box(4,0.8,4,'clay',{x:5,z:3,rx:-0.2,ry:1.2}),K3.box(4,0.8,3,'clay',{x:-4,z:4,rz:0.3}));
  B3M.i_mat=()=>G_(K3.cyl(3.6,3.6,22,'#cfb27a',{center:true,rz:PI/2,y:3.6},10),K3.torus(3.7,0.5,'#7a5a3a',{x:-6,y:3.6,ry:PI/2},10),K3.torus(3.7,0.5,'#7a5a3a',{x:6,y:3.6,ry:PI/2},10));
  B3M.i_bambooStrip=()=>{const a=[];for(let i=0;i<5;i++)a.push(K3.box(0.8,0.4,24,'bamboo',{x:-2+i,y:0.5+(i%2)*0.4,ry:(i-2)*0.03}));a.push(K3.box(6,1.6,1.4,'#7a5a3a',{y:0.3}));return G_(a);};
  B3M.i_mould=()=>G_(K3.box(9,4,17,'stone',{}),K3.box(9,4,17,'dstone',{y:4.2}),K3.box(3,0.6,9,'#3a3632',{y:8.3,z:2}),K3.cone(1.6,2,'#3a3632',{y:8.2,z:-7,rx:PI},6));
  const handle=()=>K3.cyl(1.05,1.2,30,'wood',{y:-4},6);
  B3M.t_polishedAxe=()=>G_(handle(),K3.sphere(4.2,'dstone',{y:22,z:3.4,sx:0.42,sy:0.85,sz:1.15},9,7),K3.torus(1.6,0.5,'#b49a62',{y:20,rx:PI/2},8),K3.torus(1.6,0.5,'#b49a62',{y:23.5,rx:PI/2},8));
  B3M.t_shoulderAxe=()=>G_(handle(),K3.box(2.2,4,5,'dstone',{y:20,z:2.6}),K3.box(2.4,6,8,'dstone',{y:22,z:5.5}),K3.box(2.6,1.2,4,'#b49a62',{y:21,z:1.3}),K3.box(2.6,1.2,4,'#b49a62',{y:24,z:1.3}));
  B3M.t_bronzeHoe=()=>G_(K3.cyl(1.05,1.2,34,'wood',{y:-6},6),K3.box(2,9,8,'bronze',{y:23,z:4.4,rx:0.25}),K3.cyl(1.8,1.8,4,'bronze',{y:24},8));
})();
const B3P=['potter','grindSlab','granary','wattleFence','dryStoneWall','rammedWall','mudFloor','channel','hearth3','sleepMat','drumStage'];
const B3I=['sand','clayMix','greenPotP','greenPot','dryPot','sherd','mat','bambooStrip','mould'],B3T=['polishedAxe','shoulderAxe','bronzeHoe'];
// mô hình qua cùng cổng với mô hình cũ (vừa dùng cho công trình, vừa cho biểu tượng vật phẩm)
{const _model=model;model=function(spec){try{if(K3.ok){if(spec[0]==='piece'&&B3P.includes(spec[1]))return B3M[spec[1]]();if(spec[0]==='item'&&B3I.includes(spec[1]))return B3M['i_'+spec[1]]();if(spec[0]==='tool'&&B3T.includes(spec[1]))return B3M['t_'+spec[1]]();}}catch(e){console.warn('mô hình b3',spec,e);}return _model(spec);};}
function b3RegModels(){const M=window.SBM;if(!M||M.b3)return;M.b3=1;
  if(M.item){const o=M.item;M.item=(id,...a)=>B3I.includes(id)?B3M['i_'+id]():o(id,...a);}if(M.tool){const o=M.tool;M.tool=(id,...a)=>B3T.includes(id)?B3M['t_'+id]():o(id,...a);}
  if(M.piece){const o=M.piece;M.piece=(id,...a)=>B3P.includes(id)?B3M[id]():o(id,...a);}
  if(M.list){if(M.list.items)B3I.forEach(k=>{if(!M.list.items.includes(k))M.list.items.push(k);});if(M.list.tools)B3T.forEach(k=>{if(!M.list.tools.includes(k))M.list.tools.push(k);});if(M.list.pieces)B3P.forEach(k=>{if(!M.list.pieces.includes(k))M.list.pieces.push(k);});}}
/* ---------- lớp công trường (giàn cột, khung, kèo, bùn ướt…) vẽ hàng loạt theo kiểu ---------- */
function b3ovPrep(key){let e=B3OV.get(key);if(e)return e;const g=B3M[key]();g.updateMatrixWorld(true);const parts=protoParts(g);parts.forEach(pt=>pt.mat=occMat(pt.mat));e={key,parts,api:null,cap:0,map:new Map(),free:[]};B3OV.set(key,e);return e;}
function b3ovSlot(e){if(!e.api||(!e.free.length&&e.map.size>=e.cap)){const cap=Math.max(4,e.cap*2),api=instGroup(e.parts,cap,{});let n=0;const remap=new Map();
    e.map.forEach((idx,id)=>{const b=BYID.get(id);if(b){api.set(n,b.x,b.y,b.z,b.r*Math.PI/2,1);remap.set(id,n);n++;}});if(e.api){e.api.dispose();G.sc.remove(e.api.G);}e.map=remap;e.free=[];for(let i=cap-1;i>=n;i--)e.free.push(i);e.api=api;e.cap=cap;G.sc.add(api.G);try{seasonPatchAll(api.G);}catch(er){}}
  return e.free.pop();}
function b3ovSet(b,key){if(!G.sc)return;const cur=B3CUR.get(b.id);if(cur===key){if(key){const e=B3OV.get(key),i=e.map.get(b.id);if(i!=null){e.api.set(i,b.x,b.y,b.z,b.r*Math.PI/2,1);e.api.flush();}}return;}
  if(cur){const e=B3OV.get(cur),i=e.map.get(b.id);if(i!=null){e.api.hide(i);e.api.flush();e.free.push(i);e.map.delete(b.id);}B3CUR.delete(b.id);}
  if(key&&B3M[key]){const e=b3ovPrep(key),i=b3ovSlot(e);e.map.set(b.id,i);e.api.set(i,b.x,b.y,b.z,b.r*Math.PI/2,1);e.api.flush();B3CUR.set(b.id,key);}}
function b3ovSync(b){try{b3ovSet(b,BYID.has(b.id)?b3ovKey(b):null);}catch(e){console.warn('lớp công trường',e);}}
/* ===================== GHI ĐÈ / MỞ RỘNG HÀM CŨ ===================== */
// công trình đang dựng: các công đoạn đầu chỉ hiện giàn công trường, công đoạn cuối mới mọc dần công trình thật
{const _spm=setPieceM;setPieceM=function(api,idx,b){if(b&&b.prog!=null&&b.ry==null&&b.k&&STG[b.k]){const s=b3stg(b);if(s.i<s.n-1){api.hide(idx);return;}
    const M=setPieceM.M3||(setPieceM.M3=new THREE.Matrix4());const Q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),b.r*Math.PI/2);M.compose(new THREE.Vector3(b.x,b.y,b.z),Q,new THREE.Vector3(1,0.06+0.94*s.local,1));api.setM(idx,M);return;}
  return _spm(api,idx,b);};}
{const _ss=siteShow;siteShow=function(b){_ss(b);b3ovSync(b);};}
{const _sa=structAdd;structAdd=function(b,quiet){_sa(b,quiet);b3ovSync(b);};}
{const _sr=structRemove;structRemove=function(b){b3ovSet(b,null);if(S.b3&&S.b3.dry)delete S.b3.dry[b.id];_sr(b);};}
// đặt công trình: chỉ trả vật liệu của công đoạn đầu
buildPlace=function(){const B=G.build;if(!B||!B.pos)return;if(!B.ok){uiToast(B.why||'Không đặt được ở đây','bad');sfx('no');return;}const def=B.def,st=STG[B.id],first=st?st[0].c:def.cost;pay(first);
  const b={id:S.bseq++,k:B.id,x:+B.pos.x.toFixed(1),y:+B.pos.y.toFixed(1),z:+B.pos.z.toFixed(1),r:B.pos.r,prog:0,lv:B.lv||0};if(st)b.paid=1;
  if(B.id==='treePlatform'&&B.tree){b.tree=B.tree.i;B.tree.lock=b.id;treeMove(B.tree,b.x,b.z);}S.builds.push(b);structAdd(b);cnt('build',B.id);
  if(!G.siteTip){G.siteTip=1;uiToast(st?`Đã cắm mốc ${def.n}. Đứng gần và bấm Hành động để làm từng công đoạn: ${st.map(s=>s.sn).join(' → ')}.`:'Đã dựng khung. Thoát chế độ xây, đứng gần khung và bấm Hành động để đóng, buộc cho xong.','');}
  sfx('build');if(def.store)S.store[b.id]=Array(def.store).fill(null);if(def.fuel){S.fuel[b.id]=0;flameSync();}if(b.k==='rainBarrel'||b.k==='beeBox')S.tank[b.id]=0;if(def.kind==='roof'||def.kind==='edge')decoRebuild();unlockCheck();uiHotbar();save();
  if(!canPay(first)){uiToast(`Hết nguyên liệu cho ${def.n}.`,'');buildEnd();}};
// phá dỡ: hoàn lại phần đã trả; không phá cột/tường đang đỡ sàn, mái phía trên
// sửa nhỏ: sàn/mái cùng tâm ô với đồ đặt trên nó (vd. cầu thang) → ưu tiên dỡ đồ đặt trước, không dỡ nhầm sàn
buildRemoveAt=function(){const a=buildAim();let best=null,bd=1e9;const L=G.build?G.build.lv||0:0;for(const b of S.builds){const pk=(pieceDef(b.k)||{}).kind;const d=Math.hypot(b.x-a.x,b.z-a.z)+Math.abs((b.lv||0)-L)*30+(pk==='floor'||pk==='roof'?8:0);if(d<bd){bd=d;best=b;}}if(!best||bd>40){uiToast('Không có công trình nào ở đó.','');return;}
  const def=pieceDef(best.k);if(def.store&&(S.store[best.id]||[]).some(Boolean)){uiToast('Lấy hết đồ trong '+def.n+' trước đã.','bad');return;}
  if(S.b3&&S.b3.dry[best.id]&&S.b3.dry[best.id].length){uiToast('Thu hết gốm đang phơi trên '+def.n+' trước đã.','bad');return;}
  const hold=b3holds(best);if(hold){uiToast('Không phá được: '+def.n+' đang đỡ '+hold+'. Dỡ phần phía trên trước.','bad');sfx('no');return;}
  structRemove(best);if(def.kind==='roof'||def.kind==='edge')decoRebuild();const c=b3paidCost(best,def),back={};for(const k in c)back[k]=S.mode==='cozy'?c[k]:Math.ceil(c[k]/2);give(back,[best.x,best.y+10,best.z]);sfx('chop');save();};
function b3holds(b){const def=pieceDef(b.k);if(!def)return '';const L=b.lv||0;if(!(def.kind==='edge'||def.kind==='corner'||b.k==='stilt'||def.deck)||def.low)return '';occMark(b,null);let out='';
  try{for(const f of S.builds){if(f===b||Math.hypot(f.x-b.x,f.z-b.z)>130)continue;const fd=pieceDef(f.k);if(!fd)continue;const cx=Math.floor(f.x/CELL),cz=Math.floor(f.z/CELL);
      if(fd.kind==='floor'&&(f.lv||0)===L+1&&!b3floorSup(cx,cz,L+1,B3SPAN[f.k]||2,f.id).ok){out='sàn tầng trên';break;}
      if(fd.kind==='roof'&&(f.lv||0)===L&&(def.kind==='edge'||def.kind==='corner')&&!b3roofSup(cx,cz,L).ok){out='mái nhà';break;}}}finally{occMark(b,b.id);}return out;}
/* ---------- chịu lực ---------- */
function b3supAt(key){const id=OCC.edge.get(key);if(!id)return 0;const b=BYID.get(id);if(!b)return 0;const d=pieceDef(b.k);if(!d||d.low||/ladder/i.test(b.k))return 0;if(b.prog!=null){const s=b3stg(b);if(!s||s.i<1)return 0;}return 1;}
function b3around(cx,cz,L){let n=0;const x=(cx+0.5)*CELL,z=(cz+0.5)*CELL;for(const [ex,ez,r] of [[x,cz*CELL,0],[x,(cz+1)*CELL,0],[cx*CELL,z,1],[(cx+1)*CELL,z,1]])n+=b3supAt(edgeKey(ex,ez,r,L));
  for(const [a,b] of [[cx,cz],[cx+1,cz],[cx,cz+1],[cx+1,cz+1]])n+=b3supAt(cornerKey(a*CELL,b*CELL,L));return n;}
function b3direct(cx,cz,L){let n=b3around(cx,cz,L-1);const c=OCC.cell.get(cx+','+cz);if(c){const id=c[slotN('floor',L)];const bb=id&&BYID.get(id);if(bb&&(bb.k==='stilt'||(pieceDef(bb.k)||{}).deck)&&(bb.lv||0)===L-1&&bb.prog==null)n+=4;}return n;}
function b3floorSup(cx,cz,L,span,self){const n=b3direct(cx,cz,L);if(n>=2)return {ok:true,d:0,n,span};const seen=new Set([cx+','+cz]),q=[[cx,cz,0]];let far=null;
  while(q.length&&seen.size<80){const [i,j,d]=q.shift();for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const ni=i+di,nj=j+dj,k=ni+','+nj;if(seen.has(k))continue;seen.add(k);const c=OCC.cell.get(k);const id=c&&c[slotN('floor',L)];if(!id||id===self)continue;const fb=BYID.get(id);if(!fb||(fb.prog!=null&&fb.k!=='stilt'))continue;
      const nd=d+1;if(b3direct(ni,nj,L)>=2){if(nd<=span)return {ok:true,d:nd,n,span};if(far==null||nd<far)far=nd;}if(nd<span+3)q.push([ni,nj,nd]);}}return {ok:false,d:far,n,span};}
function b3roofSup(cx,cz,L){const n=b3around(cx,cz,L);if(n>=2)return {ok:true,d:0,n};const seen=new Set([cx+','+cz]),q=[[cx,cz,0]];let far=null;
  while(q.length&&seen.size<80){const [i,j,d]=q.shift();for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const ni=i+di,nj=j+dj,k=ni+','+nj;if(seen.has(k))continue;seen.add(k);const c=OCC.cell.get(k);if(!c||!(c[slotN('roof',L)]||c[slotN('floor',L)]))continue;
      const nd=d+1;if(b3around(ni,nj,L)>=2){if(nd<=2)return {ok:true,d:nd,n};if(far==null)far=nd;}if(nd<5)q.push([ni,nj,nd]);}}return {ok:false,d:far,n};}
floorSupported=function(cx,cz,L,span){if(L===0)return true;const def=G.build&&G.build.def;const r=b3floorSup(cx,cz,L,span!=null?span:(def&&B3SPAN[def.id])||2);G._b3sup=r;return r.ok;};
function b3chanWetAt(x,z,r){const ax=r%2?[1,0]:[0,1];for(const s of [-46,-30,0,30,46])for(const o of [-14,0,14]){const px=x+ax[0]*s+ax[1]*o,pz=z+ax[1]*s+ax[0]*o;if(wdAt(px,pz)>0.4)return true;}
  for(const b of S.builds)if(b.k==='channel'&&G._b3wet&&G._b3wet.has(b.id)&&Math.hypot(b.x-x,b.z-z)<=84)return true;return false;}
{const _bu=buildUpdate;buildUpdate=function(){_bu();const B=G.build;if(!B||!B.pos||B.rm)return;const def=B.def,L=B.lv||0,{x,z}=B.pos,cx=Math.floor(x/CELL),cz=Math.floor(z/CELL),origWhy=B.why||'';let why=origWhy,sup='';
  const sk=def.id+'|'+cx+','+cz+'|'+L+'|'+B.pos.r+'|'+S.builds.length;if(B._b3k===sk&&G.t-(B._b3t||0)<0.3){B.why=B._b3why;B.ok=!B._b3why;if(B._b3why!==origWhy){B.mat.color.set(B._b3why?0xff6a5a:0x7cff9a);if(B.uiT===G.t)uiBuildBar(true,def,B._b3why);}return;}
  if(def.kind==='floor'&&L>0){const span=B3SPAN[def.id]||2,r=b3floorSup(cx,cz,L,span);if(!r.ok){if(why===''||/đỡ/.test(why)){why=r.d!=null?`Dầm vươn quá xa: cột đỡ gần nhất cách ${r.d} ô, ${def.n.toLowerCase()} chỉ vươn được ${span} ô (${span*2} m). Dựng thêm cột/tường bên dưới.`:`Không có gì đỡ: cần ít nhất 2 tường/cột (đã chôn cột) ở tầng dưới quanh ô này, đang có ${r.n}.`;if(r.d!=null)b3Note('span');}}
    sup=r.ok?(r.d?`📐 Dầm vươn ${r.d}/${span} ô từ cột đỡ`:`🏛️ Vững: ${r.n} tường/cột đỡ ngay bên dưới`):`⚠️ Chưa có chỗ tựa (nhịp tối đa ${span} ô)`;}
  else if(def.kind==='roof'){const r=b3roofSup(cx,cz,L);if(!r.ok&&!why)why=r.d!=null?`Mái vươn quá xa tường/cột (${r.d} ô, tối đa 2). Dựng thêm cột giữa nhà.`:`Mái phải tựa lên tường hoặc cột: dựng ít nhất 2 cột/tường quanh ô này (đang có ${r.n}).`;
    sup=r.ok?(r.d?`📐 Mái vươn ${r.d}/2 ô từ tường đỡ`:`🏛️ Tựa trên ${r.n} tường/cột`):'⚠️ Chưa có tường/cột đỡ mái';}
  else if(def.kind==='floor')sup='🟫 Nền đất: không cần cột đỡ';else if(def.kind==='edge'&&L>0)sup='🏛️ Đứng trên sàn tầng dưới';
  if(B.id==='channel'){const w=b3chanWetAt(x,z,B.pos.r);sup=w?'💧 Có nước chảy vào mương':'🏜️ Mương khô: một đầu phải chạm suối/hồ hoặc nối mương có nước';}
  if(B.id==='granary'||B.id==='stilt')sup=sup||'🐀 Sàn cao: chuột, nước lũ không tới';
  const st=STG[B.id];if(st&&why==='Thiếu nguyên liệu')why=canPay(st[0].c)?'':'Thiếu nguyên liệu cho công đoạn đầu: '+b3costTxt(st[0].c);
  B._b3k=sk;B._b3t=G.t;B._b3why=why;B.sup=sup;B.why=why;B.ok=!why;if(why!==origWhy){B.mat.color.set(why?0xff6a5a:0x7cff9a);if(B.uiT===G.t)uiBuildBar(true,def,why);}};}
{const _ubb=uiBuildBar;uiBuildBar=function(on,def,why){_ubb(on,def,why);if(!on||!def||!G.build||G.build.rm)return;const el=document.querySelector('#buildBar .bb-i');if(!el)return;const st=STG[def.id];let h='';
  if(st)h+=`<span class="small b3-stg b3x">${st.map((s,i)=>`<i>${i+1}.${esc(s.sn)}${s.tool?'<u>'+esc(TOOLN[s.tool])+'</u>':''}</i>`).join('<b>›</b>')}</span><span class="small muted b3x">Bắt đầu: ${esc(b3costTxt(st[0].c))}</span>`;
  if(G.build.sup)h+=`<span class="small b3-sup b3x">${esc(G.build.sup)}</span>`;
  // sửa nhỏ: chỉ viết lại phần chữ công đoạn khi nội dung đổi (trước đây xoá/chèn lại mỗi 0,2 s → DOM chạy liên tục khi đang xây)
  if(el._b3h===h&&(!h||el.querySelector('.b3x')))return;el._b3h=h;el.querySelectorAll('.b3x').forEach(n=>n.remove());if(h)el.insertAdjacentHTML('beforeend',h);};}
{const _bh=buildHtml;buildHtml=function(){let h=_bh();for(const id in STG){const d=pieceDef(id);if(d&&S.known['b:'+id]&&canPay(STG[id][0].c)&&lvOk(d.lv))h=h.replace(`<button class="bc dim" data-a="build" data-b="${id}">`,`<button class="bc" data-a="build" data-b="${id}">`);}
  return h.replace('<p class="hint">','<p class="hint">🔨 Nhà dựng theo công đoạn: đặt mốc trước, rồi đến làm từng bước (vật liệu trả dần). ');};}
{const _lh=lockHint;lockHint=function(b){const h=_lh(b);if(h)return h;if(b.note&&!b3has(b.note))return 'Cần ý tưởng: '+NOTES[b.note].t+' (📒 Ghi chép)';return h;};}
{const _rk=recipeKnown;recipeKnown=function(r){return _rk(r)&&(!r.note||b3has(r.note));};}
{const _bk=buildKnown;buildKnown=function(b){return _bk(b)&&(!b.note||b3has(b.note));};}
/* ---------- làm từng công đoạn trên công trường ---------- */
{const _sh=siteHit;siteHit=function(b){const st=STG[b.k];if(!st)return _sh(b);const d=pieceDef(b.k),s=b3stg(b),sg=s.s;
  if(s.paid<=s.i){const m=b3miss(sg);if(m){uiToast(`🧱 ${d.n} · công đoạn ${s.i+1}/${s.n} «${sg.n}»: ${m}.`,'bad');sfx('no');G.act=null;return;}pay(sg.c);b.paid=s.i+1;
    if(s.i>0)uiToast(`🔨 Công đoạn ${s.i+1}/${s.n}: ${sg.n}${Object.keys(sg.c).length?' (dùng '+b3costTxt(sg.c)+')':''}.`,'good');uiHotbar();}
  else if(sg.tool&&!hasTool(sg.tool)){uiToast(`🧱 «${sg.n}» cần ${TOOLN[sg.tool]}. Mở Chế tạo để làm.`,'bad');sfx('no');G.act=null;return;}
  const tl=sg.tool?ITEMS[hasTool(sg.tool)]:null;const f=tl?(sg.tool==='dig'?1+(tl.pow||0)*0.3:1+Math.max(0,(tl.pow||1)-1)*0.25):hasTool('hammer')?1.4:hasTool('axe')?1.12:1;
  const add=0.7*f*(1+skLv('build')*0.07)/siteWork(b),end=s.cum[s.i];b.prog=Math.min(end,(b.prog||0)+add);S.p.stam=Math.max(0,S.p.stam-1);
  const dig=sg.tool==='dig';sfx(dig?'mine':d.kind==='roof'?'pick':'build');puff(b.x+(Math.random()-0.5)*20,b.y+(dig||d.kind==='floor'?3:d.kind==='roof'?50:10+30*s.local),b.z+(Math.random()-0.5)*20,dig?'#8a6a48':'#cdbb9a',3);
  if(b.prog>=end-1e-9){if(s.i>=s.n-1){delete b.prog;siteShow(b);siteDone(b);return;}b.prog=end;addXp('build',1);if(sg.note)b3Note(sg.note);const nx=st[s.i+1];
    uiToast(`✓ Xong «${sg.sn}». Tiếp: ${nx.n}${nx.tool?' · cần '+TOOLN[nx.tool]:''}${Object.keys(nx.c).length?' · '+b3costTxt(nx.c):''}.`,'');save();}
  siteShow(b);};}
{const _sd=siteDone;siteDone=function(b){_sd(b);const W=B3W[b.k],st=STG[b.k];if(st){const last=st[st.length-1];if(last.note)b3Note(last.note);}
  if(W){b.cond=100;if(W.dry){b.dry=W.dry;uiToast(`☀️ ${pieceDef(b.k).n} còn ướt: phơi chừng ${W.dry} giờ cho khô. Đừng để mưa xối vào.`,'');}}b3ovSync(b);save();};}
/* ---------- nhắm, thông tin, hành động: sửa chữa, đài trống, công đoạn ---------- */
{const _ft=findTarget;findTarget=function(){const t=_ft();if(G.work||G.sit||G.ride||G.build||!S)return t;
  // quét chậm (0.25 s một lần) để khung hình nhẹ trên điện thoại
  if(G.t-(G.b3ftT||-9)>0.25){G.b3ftT=G.t;G.b3ft=b3scanRep();}const best=G.b3ft;if(!best||!BYID.has(best.b.id))return t;const bd=best.d;
  if(!t||t.type==='water'||(t.d!=null&&bd<t.d-4))return best;return t;};}
function b3scanRep(){let best=null,bd=1e9;
  for(const b of S.builds){if(b.prog!=null)continue;const W=B3W[b.k],drum=b.k==='drumStage';if(!drum&&!(W&&((b.cond!=null&&b.cond<70)||b.dry>0)))continue;const def=pieceDef(b.k);if(!def)continue;
    const dy=(def.kind==='roof'?b.y+30:b.y)-P.y;if(Math.abs(dy)>85)continue;const d=Math.hypot(b.x-P.x,b.z-P.z)-(def.kind==='roof'?16:def.fp?Math.max(...def.fp)*12:8);if(d>REACH+14)continue;
    if(d<bd){bd=d;best={type:'build',b,def,d,rep:!drum&&!(b.dry>0),dryI:b.dry>0};}}
  return best;}
{const _ti=targetInfo;targetInfo=function(t){if(t&&t.type==='build'){const b=t.b,d=t.def;
    if(b.prog!=null&&STG[b.k]){const s=b3stg(b),sg=s.s;const m=s.paid<=s.i?b3miss(sg):(sg.tool&&!hasTool(sg.tool)?'Cần '+TOOLN[sg.tool]:'');
      return {name:`${d.n} · ${s.i+1}/${s.n} ${sg.sn}`,verb:`${sg.sn} ${Math.round(s.local*100)}%`,ok:!m,need:m?m.replace(/^Cần /,''):null,icon:sg.tool==='dig'?'digStick':sg.tool==='axe'?'axe':sg.tool==='knife'?'knife':'hammer',warn:m||(s.paid<=s.i&&Object.keys(sg.c).length?'Dùng '+b3costTxt(sg.c):null)};}
    if(t.dryI)return {name:`${d.n} · đang khô ${Math.round(100-(b.dry/(B3W[b.k].dry||1))*100)}%`,verb:'',ok:false,need:'chờ khô (đừng để mưa xối)',icon:'clay'};
    if(t.rep){const W=B3W[b.k],c=W.rep,leak=W.leak&&b.cond<B3LEAK,m=b3miss({c});return {name:`${d.n} · bền ${Math.round(b.cond)}%${leak?' · dột':''}`,verb:d.kind==='roof'?'Lợp lại':'Trát lại',ok:!m,need:m?m.replace(/^Thiếu /,''):null,icon:Object.keys(c)[0],warn:'Dùng '+b3costTxt(c)};}
    if(b.k==='drumStage'&&b.prog==null)return {name:d.n,verb:'Đánh trống mở hội',ok:true,icon:'hide'};}
  return _ti(t);};}
{const _as=actStart;actStart=function(t){if(!G.work&&t&&t.type==='build'){if(t.rep&&t.b.prog==null){b3Repair(t.b);return;}if(t.dryI){uiToast('Vách, nền còn ướt: chờ nắng hong khô. Mưa xối lúc này sẽ trôi bùn.','');return;}
    if(t.b.k==='drumStage'&&t.b.prog==null){b3Festival(t.b);return;}}return _as(t);};}
const B3REP={roof:[['Rút bỏ tranh mục','work',1.0,'pick'],['Lợp lớp tranh mới, chồng mép','lash',1.6,'pick'],['Buộc lạt vào rui mè','lash',1.0,'pick']],
  mud:[['Cạo bỏ chỗ bùn bở','work',0.9,'step'],['Nhào bùn trộn rơm','grind',1.2,'step'],['Trát vá, miết phẳng','work',1.3,'step']]};
function b3Repair(b){const W=B3W[b.k],d=pieceDef(b.k);if(!W||!W.rep)return;{const ng=needGate(true);if(ng){uiToast(ng,'bad');sfx('no');return;}}const m=b3miss({c:W.rep});if(m){uiToast(`${d.n}: ${m} để sửa.`,'bad');sfx('no');return;}
  const roof=d.kind==='roof'||b.k==='granary',sp=1+skLv('build')*0.08,steps=(roof?B3REP.roof:B3REP.mud).map(s=>({n:s[0],a:s[1],t:s[2]/sp,fx:s[3]}));
  G.work={r:{out:{}},steps,i:0,t:0,left:1,done:0,x:P.x,z:P.z,sk:'build',icon:Object.keys(W.rep)[0],fn:()=>{if(!canPay(W.rep)){uiToast('Thiếu vật liệu, chưa sửa xong.','bad');return;}pay(W.rep);b.cond=100;if(!roof&&W.dry){b.dry=Math.min(3,W.dry);b3ovSync(b);}
    addXp('build',3);cnt('cnt','repair');sfx('build');uiToast(`🛠️ Đã ${roof?'lợp lại':'trát lại'} ${d.n}: bền như mới.`,'gold');uiHotbar();save();}};G.sit=false;G.act=null;uiClose();workUi();sfx('pick');}
function b3Festival(b){drumPlay();const B=b3S();if(B.fest!==S.day){B.fest=S.day;S.buff.rested=Math.max(S.buff.rested||0,TNOW()+0.35);S.p.stam=typeof maxStam==='function'?maxStam():100;addXp('build',2);
    puff(b.x,b.y+46,b.z,'#ffd27a',8);setTimeout(()=>uiToast('🎉 Hội trống! Cả nhà phấn chấn: làm việc nhanh hơn một lúc.','gold'),400);save();}}
// dưới mái dột thì mưa vẫn lọt vào
{const _ur=underRoof;underRoof=function(x,z){const r=_ur(x,z);if(!r||!S)return r;const c=cellAt(x,z);if(!c)return r;const py=typeof P!=='undefined'?P.y:0;let cover=0,leak=0;
  for(let L=0;L<=LVMAX;L++){const rs=c[slotN('roof',L)];if(rs){const b=BYID.get(rs);if(b&&b.prog==null&&b.y+30>py+20){if(b.cond!=null&&b.cond<B3LEAK)leak++;else cover++;}}
    if(L>0){const fs=c[slotN('floor',L)];if(fs){const b=BYID.get(fs);if(b&&b.prog==null&&b.y>py+20)cover++;}}}
  if(c.obj){const b=BYID.get(c.obj),d=b&&pieceDef(b.k);if(d&&d.shelter)cover++;}return leak&&!cover?false:r;};}
/* ---------- chế tạo: hậu quả của từng cách làm ---------- */
{const _cr=craft;craft=function(r,t){G._b3r=r;return _cr(r,t);};}
{const _c=cnt;cnt=function(t,k,n){_c(t,k,n);if(t==='craft'&&S)try{b3Crafted(k,n||1);}catch(e){console.warn('b3',e);}};}
function b3Crafted(k,n){const r=(G.work&&G.work.r)||G._b3r||{};
  if(k==='pot'){const rush=r.id==='potRush',p=(rush?0.75:0.06)*Math.max(0.4,1-skLv('craft')*0.06);let bad=0;for(let i=0;i<n;i++)if(Math.random()<p)bad++;
    if(bad){invTake('pot',bad);invAdd('sherd',bad);S.cnt['craft:pot']=Math.max(0,(S.cnt['craft:pot']||0)-bad);setTimeout(()=>uiToast(rush?'💥 Nồi còn ướt gặp lửa to: nổ toác thành mảnh! Phải phơi khô trước khi nung.':'💥 Một nồi nứt trong lò. Mảnh gốm vỡ nghiền nhỏ làm chất độn được.','bad'),60);if(rush)b3Note('dryFirst');}}
  const map={rope:'twist',leather:'smoke',greenPot:'coil',greenPotP:'coil',mat:'weave',bambooStrip:'weave',polishedAxe:'polish',bronze:'alloy',clayMix:'temper'};if(map[k])b3Note(map[k]);
  if(r.tool==='mould'&&Math.random()<0.08){invTake('mould',1);setTimeout(()=>uiToast('🧩 Khuôn đá nứt sau nhiều lần rót. Mài khuôn mới ở Phiến đá mài.','bad'),80);}}
/* ---------- ghi chép ---------- */
function b3Note(id){if(!S||!NOTES[id])return false;const B=b3S();if(B.notes[id])return false;B.notes[id]=S.day;const N=NOTES[id];G.b3new=(G.b3new||0)+1;b3Badge();
  if(G.on){uiToast(`📒 Ghi chép mới: ${N.ic} ${N.t}`,'idea');sfx('idea');}unlockCheck();if(G.panel==='notes')uiOpenRefresh();return true;}
function b3Badge(){const el=document.querySelector('#menu [data-ui="notes"]');if(el)el.classList.toggle('b3new',!!G.b3new);}
function b3Unlocks(id){return [...RECIPES.filter(r=>r.note===id).map(r=>ITEMS[Object.keys(r.out)[0]].n),...BUILD.filter(b=>b.note===id).map(b=>b.n)];}
function notesHtml(){const B=b3S(),ids=Object.keys(NOTES),got=ids.filter(k=>B.notes[k]),sel=G.b3sel||[];
  const inv=[...new Set(S.inv.filter(Boolean).map(s=>s.id))].filter(id=>ITEMS[id]&&!['tool','wear','boat'].includes(ITEMS[id].t));
  const exp=`<div class="b3-exp"><b>🧪 Thử nghĩ cách kết hợp</b><p class="small muted">Chọn 1–2 thứ trong túi rồi bấm Thử. Chỉ là suy nghĩ, không mất gì. Nghĩ ra điều mới sẽ được ghi lại và mở cách làm mới.</p>
    <div class="b3-pick">${inv.map(id=>`<button class="b3p${sel.includes(id)?' on':''}" data-a="b3pick" data-i="${id}">${icon(id)}<i>${esc(ITEMS[id].n)}</i></button>`).join('')||'<span class="muted small">Túi đang trống.</span>'}</div>
    <div class="row"><button class="btn sm" data-a="b3try" ${sel.length?'':'disabled'}>Thử: ${esc(sel.map(i=>ITEMS[i].n).join(' + ')||'…')}</button>${sel.length?'<button class="btn sm ghost" data-a="b3clr">Bỏ chọn</button>':''}</div>${G.b3res?`<p class="b3-res">${esc(G.b3res)}</p>`:''}</div>`;
  const list=ids.map(k=>{const N=NOTES[k],on=B.notes[k],u=b3Unlocks(k);return on?`<div class="b3-nt"><span class="b3-ic">${N.ic}</span><div><b>${esc(N.t)}</b><p class="small">${esc(N.d)}</p>${u.length?`<span class="small b3-un">Mở ra: ${esc(u.join(', '))}</span>`:''}</div></div>`
    :`<div class="b3-nt lock"><span class="b3-ic">❔</span><div><b>Chưa biết</b><p class="small muted">Gợi ý: ${esc(N.how)}</p></div></div>`;}).join('');
  return `<div class="b3-notes"><p class="small muted">Những điều học được khi làm, khi hỏng, khi thử. Người xưa cũng học như vậy: làm hỏng nồi mới biết trộn cát, mưa trôi vách mới biết lợp mái trước.</p>${exp}<h3>Ý tưởng đã ghi · ${got.length}/${ids.length}</h3>${list}</div>`;}
function b3Try(){const sel=(G.b3sel||[]).slice().sort();if(!sel.length)return;const key=sel.join('+'),nm=sel.map(i=>ITEMS[i].n).join(' + ');const id=B3EXP[key];
  if(id){if(b3Note(id)){G.b3res=`💡 ${nm}: ${NOTES[id].t}! ${NOTES[id].d}`;addXp('craft',3);}else G.b3res=`Bạn đã biết rồi: ${NOTES[id].t}.`;}
  else G.b3res=B3HINT[key]||(sel.length===1?B3HINT[sel[0]]:null)||sel.map(i=>B3HINT[i]).find(Boolean)||['Chưa nghĩ ra cách nào… thử cặp khác xem.','Hai thứ này chẳng ăn nhập gì với nhau.','Hmm… có lẽ cần thứ khác.'][Math.floor(Math.random()*3)];
  G.b3sel=[];}
/* ---------- giàn phơi gốm (ở Chỗ nặn gốm hoặc Giàn phơi) ---------- */
function b3dryNear(){let best=null,bd=130;for(const b of S.builds){const d=pieceDef(b.k);if(!d||b.prog!=null||!(d.st==='potter'||d.st==='dryRack'))continue;const dd=Math.hypot(b.x-P.x,b.z-P.z);if(dd<bd){bd=dd;best=b;}}return best;}
function b3Covered(b){const d=pieceDef(b.k);if(!d||d.kind==='roof')return false;const L=b.lv||0;const pts=d.kind==='edge'?(b.r%2?[[b.x-12,b.z],[b.x+12,b.z]]:[[b.x,b.z-12],[b.x,b.z+12]]):[[b.x,b.z]];
  for(const [x,z] of pts){const c=cellAt(x,z);if(!c)continue;for(let l=L;l<=LVMAX;l++){const rs=c[slotN('roof',l)],rb=rs&&BYID.get(rs);if(rb&&rb.prog==null&&!(rb.cond<B3LEAK))return true;const fs=c[slotN('floor',l+1)],fb=fs&&BYID.get(fs);if(fb&&fb.prog==null&&fb!==b)return true;}
    if(c.obj){const ob=BYID.get(c.obj),od=ob&&pieceDef(ob.k);if(od&&od.shelter)return true;}}return false;}
function b3dryHtml(b){const arr=b3S().dry[b.id]||[],def=pieceDef(b.k),cov=b3Covered(b);const row=it=>`<div class="b3-di">${icon(it.done?it.out:it.id)}<span>${esc(ITEMS[it.done?it.out:it.id].n)}</span><i style="--v:${Math.round(Math.min(1,it.p)*100)}%"></i><em>${it.done?(it.out==='sherd'?'nứt mất':'khô rồi'):it.wet?'bị mưa ướt':Math.round(it.p*100)+'%'}</em></div>`;
  const put=['greenPot','greenPotP'].filter(id=>invCount(id)>0).map(id=>`<button class="btn sm" data-a="b3dry" data-i="${id}" ${arr.length>=B3RACK?'disabled':''}>Phơi 1 ${esc(ITEMS[id].n)}</button>`).join('');
  return `<div class="b3-dry"><b>☀️ Phơi gốm mộc · ${esc(def.n)} (${arr.length}/${B3RACK})</b><p class="small muted">Gốm mộc phải phơi râm chừng ${B3DRYH} giờ cho khô đều rồi mới đem nung. ${cov?'Có mái che: mưa không làm ướt lại.':'Ngoài trời: trời mưa gốm ướt lại, nên che mái.'} Gốm đất trơn co ngót dễ nứt; đất trộn cát bền hơn.</p>
    ${arr.map(row).join('')}<div class="row">${put}${arr.some(i=>i.done)?'<button class="btn sm ghost" data-a="b3take">Thu gốm đã xong</button>':''}</div></div>`;}
function b3DryPut(id){const b=b3dryNear();if(!b){uiToast('Đứng gần Chỗ nặn gốm hoặc Giàn phơi.','bad');return;}const B=b3S(),arr=B.dry[b.id]||(B.dry[b.id]=[]);if(arr.length>=B3RACK){uiToast('Giàn phơi đầy rồi.','bad');return;}
  if(!invTake(id,1)){uiToast('Không còn '+ITEMS[id].n+'.','bad');return;}arr.push({id,p:0});sfx('pick');uiHotbar();save();}
function b3DryTake(){const b=b3dryNear();if(!b)return;const B=b3S(),arr=B.dry[b.id]||[];const keep=[],got={};for(const it of arr){if(it.done&&invFits(it.out,1)){got[it.out]=(got[it.out]||0)+1;}else keep.push(it);}
  if(keep.length)B.dry[b.id]=keep;else delete B.dry[b.id];if(Object.keys(got).length)give(got,[b.x,b.y+10,b.z]);sfx('pick');uiHotbar();save();}
{const _ch=craftHtml;craftHtml=function(){const h=_ch();const cur=G.cst;if(cur==='potter'||cur==='dryRack'){const b=b3dryNear();if(b)return b3dryHtml(b)+(cur==='potter'?'<p class="hint">🏺 Quy trình gốm: Đất sét (+ Cát mịn → Đất nhào cát) → Nặn cuộn dải → Phơi khô → Nung ở Lò nung.</p>':'')+h;}
  if(cur==='kiln')return '<p class="hint">🔥 Nung gốm đã phơi khô thì ít vỡ. Nung vội gốm còn ướt: nước sôi trong đất làm nồi nổ toác.</p>'+h;return h;};}
/* ---------- theo giờ: phơi khô, mục nát, mưa xối, chuột, mương nước ---------- */
const b3Rain=()=>(G.wxK||0)>0.4&&S.wx&&(S.wx.type==='rain'||S.wx.type==='storm');
function b3Wash(b,old){const st=STG[b.k];if(!st)return;const n=st.length,d=pieceDef(b.k);b.prog=st._cum[n-2];b.paid=n-1;delete b.dry;b.cond=100;siteShow(b);decoRebuild();
  if(Math.hypot(b.x-P.x,b.z-P.z)<900)uiToast(old?`🧱 ${d.n} mưa nắng lâu ngày đã lở hết lớp ngoài: phải ${st[n-1].sn.toLowerCase()} lại.`:`🌧️ Mưa xối trôi lớp bùn còn ướt trên ${d.n.toLowerCase()}. Phải ${st[n-1].sn.toLowerCase()} lại.`,'bad');}
function b3Hourly(gh){if(!S||gh<=0)return;const B=b3S(),rain=b3Rain(),cozy=S.mode==='cozy',si=seasonIdx();
  for(const b of S.builds.slice()){const W=B3W[b.k];if(!W)continue;const d=pieceDef(b.k);if(!d)continue;const near=Math.hypot(b.x-P.x,b.z-P.z)<700;
    if(b.prog!=null){const st=STG[b.k];if(!st||!rain)continue;const s=b3stg(b);if(s.s.wet&&s.local>0&&!b3Covered(b)){const s0=s.i?s.cum[s.i-1]:0;b.prog=Math.max(s0,b.prog-gh*0.25*(s.cum[s.i]-s0));siteShow(b);if(near&&!G.b3wetTip){G.b3wetTip=1;uiToast(`🌧️ Mưa làm trôi lớp ${s.s.sn.toLowerCase()} đang làm dở. Nên lợp mái trước.`,'bad');}b3Note('daubRain');}continue;}
    if(b.cond==null)b.cond=100;const cov=b3Covered(b);
    if(b.dry>0){if(rain&&!cov){b.cond-=gh*30;b.dry=Math.min(W.dry,b.dry+gh*0.6);b3Note('daubRain');if(b.cond<=0){b3Wash(b);continue;}}
      else{b.dry-=gh*(si===1?1.4:si===3?0.6:1);if(b.dry<=0){delete b.dry;b.cond=Math.max(b.cond,60);b3ovSync(b);if(near)uiToast(`☀️ ${d.n} đã khô cứng.`,'good');}}continue;}
    let k=0;if(W.decay)k=W.decay*(rain&&!cov?(W.rain||2):1);if(W.rainOnly&&rain&&!cov)k+=W.rainOnly;if(!k)continue;if(cozy)k*=0.5;const was=b.cond;b.cond=Math.max(0,b.cond-gh*k);
    if(W.leak&&was>=B3LEAK&&b.cond<B3LEAK){b3Note('rot');if(near)uiToast(`💧 ${d.n} mục, bắt đầu dột! Đến gần, bấm Hành động để lợp lại.`,'bad');}
    if(W.rainOnly&&b.cond<=0&&STG[b.k])b3Wash(b,true);}
  // giàn phơi gốm
  for(const id in B.dry){const b=BYID.get(+id),arr=B.dry[id];if(!b){delete B.dry[id];continue;}const cov=b3Covered(b);
    for(const it of arr){if(it.done)continue;if(rain&&!cov){it.p=Math.max(0,it.p-gh*0.15);it.wet=1;continue;}it.wet=0;it.p+=gh/B3DRYH*(si===1?1.3:si===3?0.6:1);
      if(it.p>=1){it.p=1;it.done=1;const crack=(it.id==='greenPotP'?0.45:0.06)*Math.max(0.4,1-skLv('craft')*0.08);if(Math.random()<crack){it.out='sherd';if(it.id==='greenPotP'){b3Note('temper');uiToast('💔 Gốm đất trơn co ngót, nứt toác khi khô. Trộn cát vào đất thì sao nhỉ?','bad');}}else it.out='dryPot';}}}
  // chuột khoét giỏ
  if(S.day>=2)for(const b of S.builds){const d=pieceDef(b.k);if(!d||!d.store||d.ratproof||b.prog!=null||b.k==='trough'||b.k==='pottery')continue;const st=S.store[b.id];if(!st)continue;const i=st.findIndex(s=>s&&RATFOOD.has(s.id));if(i<0)continue;
    const p=gh*(b.k==='chest'?0.005:0.012)*(cozy?0.5:1)*(underRoof(b.x,b.z)?1:1.3);if(Math.random()<p){const s=st[i],n=Math.min(s.n,1+(Math.random()<0.4?1:0));s.n-=n;if(!s.n)st[i]=null;
      uiToast(`🐀 Chuột khoét ${d.n.toLowerCase()}, ăn mất ${n} ${ITEMS[s.id].n}.`,'bad');b3Note('rats');}}
  b3ChanCalc();}
function b3ChanCalc(){const ch=S.builds.filter(b=>b.k==='channel'&&b.prog==null),wet=new Set();G._b3wet=wet;if(!ch.length)return wet;
  for(const b of ch){const ax=b.r%2?[1,0]:[0,1];if([-50,-36,36,50].some(s=>[-12,0,12].some(o=>wdAt(b.x+ax[0]*s+ax[1]*o,b.z+ax[1]*s+ax[0]*o)>0.4)))wet.add(b.id);}
  let grow=true;while(grow){grow=false;for(const b of ch){if(wet.has(b.id))continue;if(ch.some(o=>wet.has(o.id)&&Math.hypot(o.x-b.x,o.z-b.z)<=84)){wet.add(b.id);grow=true;}}}return wet;}
{const _ft=fuelTick;fuelTick=function(gh){_ft(gh);try{b3Hourly(gh);}catch(e){console.warn('b3 giờ',e);}};}
{const _ct=cropsTick;cropsTick=function(gd){_ct(gd);if(!S.builds.some(b=>b.k==='channel'))return;const wet=G._b3wet||b3ChanCalc();if(!wet.size)return;const chs=S.builds.filter(b=>wet.has(b.id)),grow=SEASONS[seasonIdx()].grow;
  for(const id in S.crops){const c=S.crops[id],b=BYID.get(+id);if(!b)continue;if(chs.some(w=>Math.hypot(w.x-b.x,w.z-b.z)<100)){c.p=Math.min(1,(c.p||0)+gd/(CROP_DAYS[c.k]||1)*grow*0.6);const v=CROPO.get(+id);if(!v||v.st!==cropStage(c))cropShow(b);}}};}
// mỗi khung hình: giọt mưa lọt qua mái dột
{const _wt=workTick;workTick=function(dt){_wt(dt);if(!S||!G.on)return;G.b3dripT=(G.b3dripT||0)+dt;if(G.b3dripT<0.35)return;G.b3dripT=0;if(!b3Rain())return;const c=cellAt(P.x,P.z);if(!c)return;
  for(let L=0;L<=LVMAX;L++){const rs=c[slotN('roof',L)],b=rs&&BYID.get(rs);if(b&&b.prog==null&&b.cond<B3LEAK&&b.y+30>P.y+20){puff(P.x+(Math.random()-0.5)*30,b.y+40,P.z+(Math.random()-0.5)*30,'#a8d8ff',1);break;}}};}
/* ---------- giao diện: nút Ghi chép, bảng ghi chép, kiểu chữ ---------- */
{const _ui=uiInit;uiInit=function(){_ui();const m=$('#menu');if(m&&!m.querySelector('[data-ui="notes"]')){const s=m.querySelector('[data-ui="settings"]');const h='<button data-ui="notes" aria-label="Ghi chép"><span>📒</span><i>Ghi chép</i></button>';if(s)s.insertAdjacentHTML('beforebegin',h);else m.insertAdjacentHTML('beforeend',h);}
  const st=document.createElement('style');st.textContent=`.b3-stg{display:flex;flex-wrap:wrap;gap:2px 4px;align-items:center;color:#e8d6b4}.b3-stg i{font-style:normal;white-space:nowrap}.b3-stg u{text-decoration:none;color:#9fd2ff;margin-left:2px;font-size:10px}.b3-stg b{color:var(--fr)}
.b3-sup{color:#bfe3a8}.b3-exp{padding:10px;border-radius:12px;background:rgba(0,0,0,.25);border:1px dashed var(--line);margin:8px 0}.b3-pick{display:flex;flex-wrap:wrap;gap:5px;margin:8px 0;max-height:180px;overflow:auto}
.b3p{display:flex;align-items:center;gap:4px;padding:2px 8px 2px 2px;border-radius:999px;border:1px solid var(--line);background:rgba(0,0,0,.3);color:var(--fg);font-size:12px}.b3p i{font-style:normal;pointer-events:none}.b3p.on{border-color:var(--acc);background:rgba(242,197,90,.18)}.b3p .ic{width:26px;height:26px}.b3p .ic img{width:100%;height:100%}
.b3-res{margin:8px 0 0;padding:8px;border-radius:10px;background:rgba(242,197,90,.1);color:var(--fg);font-size:13px;line-height:1.45}.b3-nt{display:flex;gap:10px;padding:8px;margin:6px 0;border-radius:10px;background:rgba(255,255,255,.04)}.b3-nt p{margin:2px 0}.b3-nt.lock{opacity:.62}
.b3-ic{font-size:22px;line-height:1.2}.b3-un{color:var(--acc)}.b3-dry{padding:10px;border-radius:12px;background:rgba(255,200,90,.07);border:1px solid var(--line);margin:0 0 8px}.b3-dry p{margin:4px 0 6px}
.b3-di{display:grid;grid-template-columns:30px 1fr 70px 64px;align-items:center;gap:6px;font-size:12px;margin:3px 0}.b3-di i{height:7px;border-radius:9px;background:rgba(0,0,0,.4);position:relative;overflow:hidden}.b3-di i:after{content:'';position:absolute;inset:0;width:var(--v);background:var(--acc)}.b3-di em{font-style:normal;color:var(--muted)}
.menu button.b3new{position:relative}.menu button.b3new:after{content:'';position:absolute;top:4px;right:6px;width:9px;height:9px;border-radius:9px;background:#ff6a3a;box-shadow:0 0 6px #ff6a3a}`;document.head.appendChild(st);
  document.addEventListener('click',b3Click);};}
function b3Click(e){const a=e.target&&e.target.closest&&e.target.closest('[data-a]');if(!a||!S)return;const d=a.dataset;
  if(d.a==='b3pick'){const s=G.b3sel||(G.b3sel=[]);const i=s.indexOf(d.i);if(i>=0)s.splice(i,1);else{if(s.length>=2)s.shift();s.push(d.i);}uiOpenRefresh();}
  else if(d.a==='b3try'){b3Try();uiOpenRefresh();}else if(d.a==='b3clr'){G.b3sel=[];G.b3res='';uiOpenRefresh();}
  else if(d.a==='b3dry'){b3DryPut(d.i);uiOpenRefresh();}else if(d.a==='b3take'){b3DryTake();uiOpenRefresh();}}
{const _uo=uiOpen;uiOpen=function(k,o,keep){if(k!=='notes')return _uo(k,o,keep);if(!G.on)return;if(G.build)buildEnd();G.popt=o||{};G.panel='notes';G.b3new=0;b3Badge();const p=$('#panel');p.hidden=false;document.body.classList.add('pan');
  const sc=p.querySelector('.p-body')?p.querySelector('.p-body').scrollTop:0;p.innerHTML=`<div class="p-head"><h2>Ghi chép · Ý tưởng</h2><button class="p-x" data-ui="close" aria-label="Đóng">✕</button></div><div class="p-body">${notesHtml()}</div>`;
  if(keep)p.querySelector('.p-body').scrollTop=sc;if(document.pointerLockElement)document.exitPointerLock();};}
// khởi tạo sau khi các thư viện mô hình đã sẵn sàng
{const _si=sceneInit;sceneInit=function(){b3RegModels();b3S();_si();try{b3ChanCalc();}catch(e){}};}
