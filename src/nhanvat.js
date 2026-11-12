/* ===================== NGƯỜI LÀNG CÓ TÍNH CÁCH VÀ "VIỆC NHỜ" RIÊNG =====================
   Tám người làng bên (Tù trưởng Lạc, Ông Mường, Anh Sáng, Chị Nõn, Mế Lúa, Anh Đá, Ả Bông, Cu Tí) trước chỉ đổi đồ và nói câu ngẫu nhiên.
   Giờ mỗi người có một dòng giới thiệu và một chuỗi 2–3 việc nhờ có lời thoại: mang đúng món tới thì được thưởng, tình thân tăng, mở việc tiếp.
   Việc nhờ nối với mạch truyện (giữ lửa → dựng nhà → gieo hạt → đúc đồng). S.nq[tên] = số việc đã xong. Người đã theo về ở thì việc nhờ nằm trong bảng người nhà. */
const NQ={
 'Ông Mường':{bio:'Già làng, giữ các bài thuốc của tổ tiên. Nói chậm, hay ví von.',q:[
   {say:'Tay ta run rồi, không tự giã thuốc được nữa. Con mang cho ta hai cuộn băng lá rau má, ta chỉ cho cách nhận mặt cây thuốc.',need:{bandage:2},rw:{mugwort:3,ginger:2,mint:2},rep:8,done:'Tốt. Nhớ lấy: ngải cứu hạ sốt, gừng trị cảm, bạc hà giải độc. Cây thuốc mọc chỗ ẩm, gần suối.'},
   {say:'Đêm dài, người già hay lạnh. Con có tấm da nào thuộc mềm thì cho ta xin hai tấm lót chỗ nằm.',need:{hide:2},rw:{medicine:2,bandage:2},rep:10,done:'Ấm rồi. Đây, thuốc ngải ta sắc sẵn, mang theo phòng khi sốt giữa rừng.'},
   {say:'Ta muốn uống bát nước đun sôi cho ấm bụng. Con mang cho ta hai bầu nước sôi để nguội.',need:{water:2},rw:{turmeric:2,aloe:2,centella:4},rep:10,done:'Người biết đun nước là người sống lâu. Nghệ với nha đam này giã ra làm cao, đắp vết thương sưng mủ.'}]},
 'Anh Sáng':{bio:'Thợ săn giỏi nhất làng, ít lời, quý người chịu khó.',q:[
   {say:'Muốn theo ta đi săn à? Mang ba miếng thịt sống tới đây đã, cho ta thấy cậu tự kiếm được mồi.',need:{meat:3},rw:{arrow:8,sinew:2},rep:8,done:'Được đấy. Cầm lấy tên. Nhớ đứng dưới gió, lom khom mà tới.'},
   {say:'Dây cung của ta sờn rồi. Kiếm cho ta ba sợi gân thú, ta làm cho cậu một cây cung.',need:{sinew:3},rw:{bow:1,arrow:6},rep:10,done:'Cung đây. Kéo hết tay rồi hãy buông, đừng vội.'},
   {say:'Sắp có đàn nai qua vùng. Cậu mang bốn tấm da sống tới, ta dạy cậu khâu áo giáp da.',need:{hide:4},rw:{hideArmor:1},rep:12,done:'Mặc vào. Nanh sói cắn không thủng đâu.'}]},
 'Chị Nõn':{bio:'Thợ gốm khéo tay, hay cười, mê đất sét mịn ven suối.',q:[
   {say:'Đất sét bên bãi bồi mịn lắm mà chị không rảnh đi lấy. Em mang cho chị sáu nắm đất sét, chị nặn cho cái nồi.',need:{clay:6},rw:{pot:1,woodBowl:1},rep:8,done:'Nồi của em đây. Đun nước, nấu cháo đều được, đừng để lửa táp một bên kẻo nứt.'},
   {say:'Lò của chị thiếu than. Em có ba cục than củi không? Chị đổi cho mấy viên gạch nung.',need:{charcoal:3},rw:{brick:8},rep:8,done:'Gạch này xây lò, kê bếp đều tốt.'},
   {say:'Em sắp nấu đồng phải không? Mang hai cái nồi đất tới, chị nặn nồi nấu kim loại cho, thứ ấy phải dày thành mới chịu được lửa.',need:{pot:2},rw:{crucible:1,brick:4},rep:12,done:'Nồi nấu đồng đây. Nung đỏ lên rồi hãy rót, nghe em.'}]},
 'Mế Lúa':{bio:'Người giữ giống của làng, thuộc từng loại hạt, hay lo cho người khác.',q:[
   {say:'Mế thèm quả mọng rừng. Con hái cho mế sáu quả, mế chia cho ít hạt kê đem về gieo.',need:{berry:6},rw:{seedGrain:5,grain:3},rep:8,done:'Hạt kê đấy. Xới luống cạnh nhà, gieo xuống, mưa xuống là lên.'},
   {say:'Con gặt được kê chưa? Mang cho mế bốn nắm, mế cho giống bầu, sau có bầu khô mà đựng nước.',need:{grain:4},rw:{seedGourd:3,gourd:1},rep:10,done:'Bầu leo giàn, quả già phơi khô khoét ruột là thành bầu đựng nước.'},
   {say:'Có ruộng nước chưa con? Mang cho mế ba bó cói hay sợi cỏ, mế cho thóc giống lúa nước.',need:{fiber:10},rw:{seedRice:4},rep:12,done:'Thóc giống đây. Gieo mạ chỗ ruộng có nước, mạ lên thì nhổ cấy.'}]},
 'Anh Đá':{bio:'Thợ ghè đá, nóng tính nhưng thẳng, thích đá lửa hơn mọi thứ.',q:[
   {say:'Đá lửa tốt nằm trên bãi đá phía núi. Mang bốn viên về đây, ta ghè cho cậu một mũi giáo.',need:{flint:4},rw:{spear:1},rep:8,done:'Giáo đây. Mũi này đâm lợn rừng không gãy.'},
   {say:'Cán rìu ta nứt. Cậu mang cho ta bốn khúc gỗ thẳng, ta đổi cho lưỡi rìu mài.',need:{wood:4},rw:{polishedAxe:1},rep:10,done:'Rìu mài Bắc Sơn đấy, chặt ngọt hơn rìu ghè nhiều.'}]},
 'Ả Bông':{bio:'Cô gái hái lượm, hát hay, thích hoa và vòng hạt.',q:[
   {say:'Sắp hội rồi mà em chưa có hoa cài tóc. Anh chị hái giúp em bốn bông hoa dại nhé?',need:{flower:4},rw:{shellBeads:1},rep:8,done:'Đẹp quá! Em tặng lại chuỗi hạt vỏ ốc, đeo vào vui cả ngày.'},
   {say:'Em muốn kết mũ lông chim cho ngày hội. Kiếm giúp em sáu chiếc lông chim với.',need:{feather:6},rw:{featherCrown:1,berry:6},rep:10,done:'Mũ này em kết hai cái, một cái của anh chị đấy.'}]},
 'Tù trưởng Lạc':{bio:'Người đứng đầu bộ lạc bên sông. Nghiêm, trọng lời hứa, đang tìm người đủ sức kết minh.',q:[
   {say:'Người lạ, muốn làng ta coi là bạn thì cùng ăn một bữa. Mang bốn miếng thịt nướng tới bếp lửa của làng.',need:{meatCooked:4},rw:{rope:4,hide:2},rep:10,done:'Ăn chung một bếp là người quen. Dây và da này, cầm về dựng nhà.'},
   {say:'Ta nghe ngươi đã có nhà có cửa. Kẻ muốn giữ đất phải có vật tổ. Dựng Cột vật tổ ở làng ngươi rồi quay lại đây.',cond:()=>S.builds.some(b=>b.k==='totem'&&b.prog==null&&!b.remote),condTxt:'Dựng xong một Cột vật tổ ở làng mình',rw:{bronze:1,charcoal:4},rep:15,done:'Có vật tổ là có gốc. Đây là đồng đỏ của làng ta, lấy mà tập đúc.'},
   {say:'Bộ lạc Núi Đá hay kéo xuống cướp. Ngươi mang cho ta một cây giáo đồng làm tin, từ nay hai làng cùng giữ đất.',need:{bronzeSpear:1},rw:{bronzeHelmet:1,bronze:2},rep:20,done:'Từ hôm nay làng ta với ngươi là anh em. Mũ đồng này đội khi ra trận.'}]},
 'Bà Mo Sen':{bio:'Bà mo của làng, giữ lễ cúng tổ tiên và các điều kiêng kỵ. Nhìn người rất kỹ.',q:[
   {say:'Muốn tổ tiên che chở thì phải có hương thơm. Con hái cho bà bốn nhánh ngải cứu để xông nhà.',need:{mugwort:4},rw:{medicine:2,flower:4},rep:8,done:'Khói ngải xua tà, xua cả muỗi. Hoa này con giữ, sẽ có lúc dùng để dâng lễ.'},
   {say:'Làng con đã có Cột vật tổ chưa? Hãy tế lễ ở đó một lần (hai món thịt chín, hai bông hoa) rồi về kể bà nghe.',cond:()=>(typeof gC==='function'&&gC('cnt:offer')>0),condTxt:'Tế lễ ở Cột vật tổ một lần',rw:{jadeAmulet:1,meatCooked:3},rep:15,done:'Tổ tiên đã nhận lễ. Bùa ngọc này bà giữ từ thời mẹ bà, nay trao cho con.'}]},
 'Cu Tí':{bio:'Thằng bé lanh lợi, chạy khắp làng, biết mọi chỗ có trứng chim.',q:[
   {say:'Anh chị ơi, em đói. Cho em bốn quả mọng, em chỉ chỗ tổ chim cho!',need:{berry:4},rw:{egg:3,feather:4},rep:6,done:'Trứng em nhặt sáng nay đấy, cho anh chị hết!'}]}};
function nqS(){if(!S.nq||typeof S.nq!=='object')S.nq={};return S.nq;}
function nqCur(name){const D=NQ[name];if(!D)return null;const i=nqS()[name]|0;return i<D.q.length?D.q[i]:null;}
function nqOk(q){if(!q)return false;if(q.cond){try{return !!q.cond();}catch(e){return false;}}for(const k in q.need){if(!ITEMS[k])continue;if(invCount(k)<q.need[k])return false;}return true;}
function nqGive(name,pos){const D=NQ[name],q=nqCur(name);if(!q||!nqOk(q))return;if(q.need)for(const k in q.need){if(ITEMS[k])invTake(k,q.need[k]);}const rw={};for(const k in q.rw)if(ITEMS[k])rw[k]=q.rw[k];
  give(rw,pos);S.rep=Math.min(100,(S.rep||0)+(q.rep||5));nqS()[name]=(nqS()[name]|0)+1;try{cnt('cnt','nq');addXp('gather',6);sfx('level');unlockCheck();uiHotbar();save();}catch(e){}
  uiToast('💬 '+name+': “'+q.done+'”','gold');}
function nqHtml(name){const D=NQ[name];if(!D)return '';const i=nqS()[name]|0,q=nqCur(name);let h=`<p class="nq-bio">${esc(D.bio)}</p>`;
  if(!q)return h+`<div class="nq-b done"><b>💬 Việc nhờ</b><span class="small">Đã giúp ${esc(name)} đủ ${D.q.length} việc. Hai bên giờ là chỗ thân tình.</span></div>`;
  const ok=nqOk(q),need=q.need?Object.entries(q.need).filter(([k])=>ITEMS[k]).map(([k,v])=>`<span class="chip${invCount(k)<v?' no':''}">${icon(k)}${Math.min(invCount(k),v)}/${v}</span>`).join(''):`<span class="chip${ok?'':' no'}">${ok?'✓ ':''}${esc(q.condTxt||'')}</span>`;
  const rw=Object.entries(q.rw).filter(([k])=>ITEMS[k]).map(([k,v])=>`<span class="chip">${icon(k)}${v}</span>`).join('');
  return h+`<div class="nq-b"><b>💬 Việc nhờ ${i+1}/${D.q.length}</b><p class="npc-say">“${esc(q.say)}”</p><div class="nq-r"><span class="small muted">Cần</span><div class="chips">${need}</div></div><div class="nq-r"><span class="small muted">Được</span><div class="chips">${rw}<span class="chip">❤ +${q.rep||5}</span></div></div>
    <button class="btn${ok?'':' ghost'}" data-a="nqgive" data-n="${esc(name)}">${ok?'Trao cho '+esc(name):'Chưa đủ: mang tới rồi quay lại'}</button>${!ok&&q.need&&typeof gmPin==='function'?'':''}</div>`;}
{const _nh=npcHtml;npcHtml=function(){const n=G.npcCur;let h=_nh.apply(this,arguments);try{if(n&&n.def&&NQ[n.def.n]){const x=nqHtml(n.def.n);h=h.replace(/<p class="npc-say">[\s\S]*?<\/p>/,m=>nqCur(n.def.n)?'':m);h=x+h;}}catch(e){}return h;};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="nqgive"]');if(!b||!S||!G.on)return;e.stopImmediatePropagation();const n=G.npcCur;nqGive(b.dataset.n,n?[n.x,30,n.z]:null);try{uiOpenRefresh();}catch(er){}},true);
/* dấu ❗ trên đầu người đang có việc nhờ mà mình đã đủ đồ, ❓ nếu còn việc nhưng chưa đủ */
setInterval(()=>{try{if(!S||!G.on||!G.npcs)return;for(const n of G.npcs){if(!n.o||!n.def||!NQ[n.def.n])continue;const q=nqCur(n.def.n),near=Math.hypot(n.x-P.x,n.z-P.z)<900;let m=n.o.userData.nqM;
      if(!q||!near){if(m)m.visible=false;continue;}if(!m){const cv=document.createElement('canvas');cv.width=cv.height=64;const tex=new THREE.CanvasTexture(cv);m=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthTest:false,transparent:true}));m.scale.set(11,11,1);m.position.y=47;m.renderOrder=20;m.userData.cv=cv;m.userData.tex=tex;n.o.add(m);n.o.userData.nqM=m;}
      const ok=nqOk(q),k=ok?'!':'?';if(m.userData.k!==k){m.userData.k=k;const c=m.userData.cv.getContext('2d');c.clearRect(0,0,64,64);c.beginPath();c.arc(32,32,26,0,7);c.fillStyle=ok?'#ffd23a':'rgba(40,28,16,.85)';c.fill();c.lineWidth=4;c.strokeStyle=ok?'#7a4a00':'#ffd23a';c.stroke();c.font='bold 40px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillStyle=ok?'#5a3200':'#ffd23a';c.fillText(k,32,35);m.userData.tex.needsUpdate=true;}
      m.visible=true;}}catch(e){}},1500);
if(typeof HD_L!=='undefined')HD_L.push({id:'viecnho',ic:'💬',t:'Người làng và việc nhờ',w:()=>G.panel==='npc'&&G.npcCur&&G.npcCur.def&&NQ[G.npcCur.def.n],p:['Mỗi người làng bên có <b>tính cách</b> và một chuỗi <b>việc nhờ</b> riêng. Lời nhờ hiện ngay đầu bảng trò chuyện.','Mang đúng món họ cần tới rồi bấm <b>Trao</b>: được <b>phần thưởng</b>, <b>tình thân</b> với bộ lạc tăng, và mở việc nhờ tiếp theo.','Trên đầu người làng có dấu <b>❓</b> là còn việc nhờ; dấu <b>❗ vàng</b> là bạn đã đủ đồ để trao. Tình thân từ 40 trở lên thì mời được họ về ở cùng.']});
{const s=document.createElement('style');s.textContent=`#game .panel .nq-bio{font-size:12.5px;color:#cdbb98;font-style:italic;margin:0 0 8px}
#game .panel .nq-b{padding:10px 11px;border-radius:13px;background:rgba(242,197,90,.1);border:1px solid rgba(242,197,90,.45);margin-bottom:12px;display:flex;flex-direction:column;gap:6px}#game .panel .nq-b.done{border-color:rgba(120,200,100,.4);background:rgba(120,200,100,.08)}
#game .panel .nq-b>b{font-size:13px;color:#ffd27a}#game .panel .nq-b .npc-say{margin:0}#game .panel .nq-r{display:flex;align-items:center;gap:8px}#game .panel .nq-r>.small{flex:none;width:34px}`;document.head.appendChild(s);}
