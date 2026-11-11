/* ===================== LÀNG CHUNG: HẰNG NGÀY · THƯ · CHỢ · BẠN BÈ · XẾP HẠNG · TIN · CỬ CHỈ (more2.js) =====================
   Rà soát lần hai, những gì còn thiếu để người chơi muốn quay lại mỗi ngày và chơi cùng nhau:
   1. TRUNG TÂM TIN (🔔): mọi thông báo nổi lên rồi tắt nhanh trên điện thoại, đọc lại không được. Nay lưu 50 tin gần nhất,
      có chấm đỏ đếm tin chưa đọc, lọc theo loại.
   2. HẰNG NGÀY: quà điểm danh 7 ngày (theo ngày thật, nối chuỗi), 3 việc mỗi ngày + 1 việc mỗi tuần (đo bằng sổ đếm sẵn có
      của game nên không phải chơi gì lạ), và SỰ KIỆN TUẦN xoay vòng (Tuần Đại săn, Mùa hái lượm, Thợ khéo, Dựng làng, Ruộng đồng):
      kỹ năng của tuần lên nhanh gấp rưỡi.
   3. HỘP THƯ: thư hệ thống (quà khi túi đầy, quà việc ngày) và thư giữa người chơi, đính kèm đồ (người nhận bấm Nhận một lần).
   4. CHỢ: bảng đổi hàng giữa người chơi (đồ đem đổi được giữ lại khi đăng, ai đổi trước được trước), bảng GIÁ TRỊ TRAO ĐỔI theo
      thực tế (muối, đồ gốm, đồng thau quý; củi, đá rẻ). Từ thời Phùng Nguyên có CHỢ PHIÊN Ở LÀNG: bán đồ lấy vỏ ốc tiền (ốc tiền
      có trong mộ táng tiền sử, là "tiền" sớm ở châu Á), mua muối, gốm, vải… Thời Đông Sơn đồng thau cũng dùng như của cải để đổi.
   5. BẠN BÈ + HỒ SƠ: kết bạn (hai bên cùng thêm nhau), thấy ai đang chơi, xem hồ sơ (bộ tộc, ngày sống, thú săn…), gửi thư, tặng đồ.
   6. XẾP HẠNG: ngày sống, thú săn, công trình, thành tựu, vùng đất đã tới; bộ tộc theo lãnh thổ và công trình.
   7. CỬ CHỈ: vẫy tay, cúi chào, vỗ tay, múa, hò reo, chỉ đường… (người khác ở gần thấy bong bóng). Múa bên bếp lửa có người nhà
      cùng múa làm vui (tinh thần), như múa quanh lửa trong lễ hội cổ.
   Dữ liệu chung (theo cách của mp.js: mỗi người chỉ ghi tài liệu mang id của mình, mọi thứ đọc về đều kiểm tra kỹ):
     friends/<uid> {list:[uid], at}              ai mình đã kết bạn (hai bên cùng có nhau = bạn bè)
     mail/<uid>    {to:[uid], list:[{id,to,t,at,it}], ack:[id]}   hộp thư đi của mình + biên nhận thư đã nhận
     market/<uid>  {w, list:[{id,g:[id,n],w:[id,n],at}]}          hàng mình đăng đổi
     deals/<uid>   {sel:[uid], list:[{lid,s,at}]}                  biên nhận mình đã đổi hàng của ai
     lb/<uid>      {w,d,h,b,a,r,k,cl,at}                           số liệu xếp hạng của mình
   Lưu trong máy: S.m2 (bản lưu cũ vẫn chạy). Nhẹ máy: kiểm tra theo nhịp 0,5–2 giây, bảng xếp hạng chỉ tải khi mở. */

/* ===================== 1. TRẠNG THÁI ===================== */
const M2K={nt:[],fr:null,frIn:{},mailMe:null,mailIn:{},mkt:{},mktT:0,dealsMe:null,dealsIn:{},lb:{},lbT:0,net:false,unsubs:[],dirty:false,uiT:0,emoT:0,busy:false};
const M2I=()=>{if(!S.m2||typeof S.m2!=='object')S.m2={};const o=S.m2;if(!Array.isArray(o.nt))o.nt=[];o.dl=o.dl||{};if(!Array.isArray(o.sys))o.sys=[];o.mget=o.mget||{};o.esc=o.esc||{};o.paid=o.paid||{};o.bought=o.bought||{};o.frNo=o.frNo||{};if(!Array.isArray(o.wps))o.wps=[];o.cave=o.cave||{};o.ev=o.ev||{};o.ntR=o.ntR||0;return o;};
const m2Txt=(v,n)=>typeof mpTxt==='function'?mpTxt(v,n):String(v||'').slice(0,n);
const m2Id=v=>typeof v==='string'&&/^[A-Za-z0-9_\-.:@+~]{1,128}$/.test(v);
const m2Net=()=>{try{return typeof MP!=='undefined'&&MP.started&&MP.me&&mpOn()&&!!MP.db;}catch(e){return false;}};
const m2Ago=at=>{const s=Math.max(0,(Date.now()-at)/1000);return s<60?'vừa xong':s<3600?Math.floor(s/60)+' phút trước':s<86400?Math.floor(s/3600)+' giờ trước':Math.floor(s/86400)+' ngày trước';};
const m2Date=t=>{const d=new Date(t||Date.now());return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const m2DayN=s=>Math.round(new Date(s+'T12:00:00').getTime()/864e5);
const m2Week=()=>Math.floor((m2DayN(m2Date())+3)/7);
const m2Hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;};
const m2Nm=uid=>`<b data-m2nm="${esc(uid)}"></b>`;
function m2Names(root){(root||document).querySelectorAll('[data-m2nm]').forEach(e=>{let n='Người chơi';try{n=mpName(e.dataset.m2nm);}catch(er){}if(e.textContent!==n)e.textContent=n;});}

/* ===================== 2. VẬT PHẨM: VỎ ỐC TIỀN, GIÁ TRỊ TRAO ĐỔI ===================== */
Object.assign(ITEMS,{cowrie:{n:'Vỏ ốc tiền',t:'res',ds:'Vỏ ốc tiền (ốc cowrie) bóng đẹp từ biển xa, có trong mộ táng tiền sử: người xưa dùng làm đồ quý và làm "tiền" đổi hàng ở chợ phiên.'}});
Object.assign(EMO,{cowrie:'🐚'});
// giá trị quy ra vỏ ốc tiền (ước lượng theo công làm và độ hiếm thời đó: muối, gốm, đồng thau quý; củi, đá, cỏ rẻ)
const M2V={stick:0.1,fiber:0.1,stone:0.1,wood:0.3,flint:0.5,clay:0.3,hide:2,leather:3,bone:0.4,rope:0.8,plank:1,brick:0.6,pot:3,greenPot:4,copper:5,tin:6,bronze:12,crucible:2,
  flower:0.3,feather:0.3,berry:0.3,mushroom:0.4,honey:3,meat:1,meatCooked:1.5,meatDried:2.2,fish:0.8,fishCooked:1.2,fishDried:1.8,grain:0.5,bread:1.5,stew:2.5,gourd:0.8,egg:0.6,
  water:0.2,tea:1.5,mintwater:1.5,medicine:4,bandage:1.5,salve:3,smudge:1,mugwort:0.5,ginger:0.6,turmeric:0.6,centella:0.5,mint:0.4,aloe:0.6,seedGrain:0.6,seedFlax:0.6,seedGourd:0.6,
  bow:6,arrow:0.6,fireDrill:1,bronzeAxe:30,bronzeSpear:28,bronzeKnife:20,bronzeSickle:22,raft:6,canoe:20,rod:1.5,digStick:0.8,charcoal:0.4,ochre:1.2,bamboo:0.3,banana:0.4,woodBowl:1.2,
  woodSpoon:0.6,woodStatue:6,stoneBracelet:5,bambooFlute:2,bambooTube:0.5,flask:1.5,needle:1.5,coat:6,boots:4,furcoat:10,axe:4,pick:4,spear:3,club:1.5,hammer:3,sickle:3,knife:2.5,torch:0.5,
  shell:0.3,salt:3,barkCloth:1.5,yarn:1.5,cloth:4,barkTunic:3,clothTunic:7,furCloak:9,rainCape:3,leafHat:2,sandals:2.5,shellBeads:6,bronzeBracelet:14,pearl:10,pearlBeads:25,
  rice:1,riceCooked:1.2,seedRice:1,paddy:0.8,riceSheaf:0.8,taro:0.6,yam:0.6,comLam:2,mam:2.5,backBasket:4,hipBag:5,fishNet:8,woodPlough:6,bronzePlough:30,calf:40,sinew:0.6,polishedAxe:5,shoulderAxe:6,bronzeHoe:20,mat:1.5,bambooStrip:0.2,cowrie:1};
function m2Val(id){if(M2V[id]!=null)return M2V[id];const I=ITEMS[id];if(!I)return 0;return {res:0.5,food:1,drink:0.3,med:2,herb:0.5,seed:0.6,tool:4,wear:5,pack:4,boat:8,pet:20}[I.t]||0.5;}
const m2Vf=v=>v>=10?Math.round(v)+'':v>=1?(Math.round(v*10)/10)+'':(Math.round(v*100)/100)+'';

/* ===================== 3. TRUNG TÂM TIN ===================== */
{const _ut=uiToast;uiToast=function(t,k){_ut(t,k);try{if(!t||typeof t!=='string')return;const at=Date.now(),L=M2K.nt;if(L.length&&L[0][0]===t&&at-L[0][2]<8000)return;L.unshift([t,k||'',at]);if(L.length>50)L.length=50;
  if(typeof S!=='undefined'&&S&&G.on){const M=M2I();m2NtLoad();M.nt=M2K.nt.slice(0,50);}if(k==='good'||k==='gold'||k==='bad'||k==='idea')m2Badge();}catch(e){}};}
// nối tin đã lưu (cũ hơn) vào sau tin mới từ lúc vào game
function m2NtLoad(){if(M2K.ntS===S)return;M2K.ntS=S;const old=(S.m2&&Array.isArray(S.m2.nt)?S.m2.nt:[]).filter(n=>Array.isArray(n)&&typeof n[0]==='string'&&typeof n[2]==='number');const seen=new Set(M2K.nt.map(n=>n[0]+n[2]));M2K.nt=M2K.nt.concat(old.filter(n=>!seen.has(n[0]+n[2]))).slice(0,50);}
const m2Unread=()=>{const M=S&&S.m2;const r=M?M.ntR||0:0;return M2K.nt.filter(n=>n[2]>r&&/^(good|gold|bad|idea)$/.test(n[1])).length;};
const M2NTF=[['all','Tất cả'],['gold','Quan trọng'],['bad','Nguy hiểm'],['good','Tốt']];
function m2NtHtml(){const f=G.m2ntf||'all',r=S.m2.ntR||0;const L=M2K.nt.filter(n=>f==='all'||(f==='gold'?/^(gold|idea)$/.test(n[1]):n[1]===f));S.m2.ntR=Date.now();setTimeout(m2Badge,0);
  return `<div class="chipsel">${M2NTF.map(([k,n])=>`<button class="tb sm${f===k?' on':''}" data-a="m2ntf" data-v="${k}">${n}</button>`).join('')}</div>`+(L.length?`<div class="m2list">${L.map(n=>`<div class="m2nt ${esc(n[1])}${n[2]>r?' new':''}"><span>${esc(n[0])}</span><small>${m2Ago(n[2])}</small></div>`).join('')}</div>`:'<p class="muted">Chưa có tin nào.</p>');}

/* ===================== 4. HẰNG NGÀY: ĐIỂM DANH, VIỆC NGÀY, VIỆC TUẦN, SỰ KIỆN TUẦN ===================== */
const M2LOGIN=[{meatCooked:2,water:1},{rope:3,fiber:6},{torch:2,stick:6},{bandage:2,medicine:1},{hide:3,leather:1},{arrow:6,flint:4},{shellBeads:1,cowrie:6,salt:2}];
const m2Sum=pre=>{let n=0;for(const k in S.cnt)if(k.startsWith(pre))n+=S.cnt[k];return n;};
const M2T=[// mã, tên, biểu tượng, số đếm hiện tại, số cần (ngày), số cần (tuần)
  ['chop','Đốn cây','🪓',()=>mxgc('cnt:chop'),5,40],['mine','Đập đá, đào quặng','⛏️',()=>mxgc('cnt:mine'),5,40],['gather','Hái lượm','🍓',()=>mxgc('cnt:gather')+mxgc('cnt:herb'),8,60],
  ['hunt','Săn thú','🏹',()=>mxgc('cnt:hunt'),2,12],['fish','Bắt cá','🐟',()=>mxgc('cnt:fish')+mxgc('cnt:netfish'),3,20],['craft','Chế tạo đồ','🛠️',()=>m2Sum('craft:'),4,30],
  ['build','Dựng công trình','🏠',()=>m2Sum('build:'),2,15],['eat','Ăn bữa tử tế','🍲',()=>mxgc('cnt:eat'),3,20],['walk','Đi đường (mét)','🚶',()=>Math.floor((S.mx&&S.mx.dist||0)/20),600,5000],
  ['harvest','Thu hoạch','🌾',()=>mxgc('cnt:harvest')+mxgc('cnt:riceHarvest'),2,12],['trade','Trao đổi','🤝',()=>mxgc('cnt:trade')+mxgc('cnt:m2trade'),1,6]];
const M2TR={chop:{wood:3},mine:{flint:3},gather:{berry:4,honey:1},hunt:{arrow:4},fish:{salt:1},craft:{rope:2},build:{plank:2},eat:{meatDried:1},walk:{torch:1},harvest:{seedRice:2},trade:{cowrie:3}};
const M2EV=[{k:'hunt',n:'Tuần Đại săn',ic:'🏹',sk:'hunt',t:'hunt',d:'Các bản làng rủ nhau vây săn trước mùa. Săn bắn, đâm cá lên nghề nhanh gấp rưỡi.'},
  {k:'gather',n:'Mùa hái lượm',ic:'🍄',sk:'gather',t:'gather',d:'Rừng vào mùa trái, nấm, mật. Hái lượm lên nghề nhanh gấp rưỡi.'},
  {k:'craft',n:'Tuần Thợ khéo',ic:'🛠️',sk:'craft',t:'craft',d:'Thợ đá, thợ gốm, thợ đan thi tài. Chế tạo lên nghề nhanh gấp rưỡi.'},
  {k:'build',n:'Tuần Dựng làng',ic:'🏠',sk:'build',t:'build',d:'Cả làng góp công dựng nhà, làm rào. Xây dựng lên nghề nhanh gấp rưỡi.'},
  {k:'farm',n:'Tuần Ruộng đồng',ic:'🌾',sk:'farm',t:'harvest',d:'Làm đất, gieo cấy, gặt hái. Trồng trọt lên nghề nhanh gấp rưỡi.'}];
const m2Ev=()=>M2EV[((m2Week()%M2EV.length)+M2EV.length)%M2EV.length];
{const _ax=addXp;addXp=function(k,n){try{if(S&&G.on&&m2Ev().sk===k&&n>0)n*=1.5;}catch(e){}return _ax(k,n);};}
function m2Pick(seed,n,excl){const R=rng(m2Hash(seed)),pool=M2T.filter(t=>!excl||!excl.includes(t[0])),out=[];while(out.length<n&&pool.length){out.push(pool.splice(Math.floor(R()*pool.length),1)[0]);}return out;}
function m2Roll(){const M=M2I(),D=M.dl,today=m2Date(),ag=1+0.25*(S.age||0);
  if(D.d!==today){const gap=D.d?m2DayN(today)-m2DayN(D.d):99;D.streak=gap===1?(D.streak||0)+1:1;D.d=today;D.got=0;
    D.tasks=m2Pick(today+':'+S.seed,3).map(t=>({k:t[0],b:t[3](),n:Math.max(1,Math.round(t[4]*(t[0]==='walk'?1:ag))),ok:0}));
    if(!D.first){D.first=today;m2SysMail('Già làng','Chào người mới đến bản! Mỗi ngày ghé bếp lửa nhận quà, làm ba việc nhỏ già dặn. Ai chăm chỉ, cuối tuần có quà lớn. Có gì vướng cứ mở Sổ tay.',{meatCooked:2,torch:1});}
    else uiToast(`📅 Ngày mới! Quà điểm danh ngày ${((D.streak-1)%7)+1} đang chờ ở 🏮 Làng.`,'idea');}
  const wk=m2Week();if(!D.wk||D.wk.w!==wk){const ev=m2Ev(),t=M2T.find(x=>x[0]===ev.t)||M2T[0];D.wk={w:wk,k:t[0],b:t[3](),n:Math.round(t[5]*ag),ok:0};}}
const m2TDef=k=>M2T.find(t=>t[0]===k);
const m2TVal=T=>{const t=m2TDef(T.k);let v=0;try{v=t[3]()-T.b;}catch(e){}return Math.max(0,Math.min(T.n,v));};
function m2Claim(){const D=M2I().dl;if(D.got===D.d){uiToast('Hôm nay đã nhận quà rồi. Mai quay lại nhé!','');return;}D.got=D.d;const rw=M2LOGIN[((D.streak||1)-1)%7];m2Give(rw,'Quà điểm danh');sfx('level');m2Juice();cnt('cnt','login');uiToast(`🎁 Quà điểm danh ngày ${((D.streak||1)-1)%7+1}!`,'gold');save();uiOpenRefresh();}
function m2TaskClaim(i){const D=M2I().dl,T=i==='w'?D.wk:D.tasks&&D.tasks[+i];if(!T||T.ok||m2TVal(T)<T.n)return;T.ok=1;const rw=i==='w'?{cowrie:12,shellBeads:1,meatDried:3}:(M2TR[T.k]||{rope:1});m2Give(rw,i==='w'?'Quà việc tuần':'Quà việc ngày');S.rep=Math.min(100,(S.rep||0)+(i==='w'?6:2));sfx('level');m2Juice();cnt('cnt','m2task');save();uiOpenRefresh();
  if(i!=='w'&&D.tasks.every(t=>t.ok)){m2Give({cowrie:3},'Xong cả ba việc');uiToast('🌟 Xong cả ba việc hôm nay: thêm 3 vỏ ốc tiền!','gold');}}
function m2DayHtml(){const M=M2I(),D=M.dl;m2Roll();const st=D.streak||1,di=(st-1)%7,ev=m2Ev();
  const cal=M2LOGIN.map((rw,i)=>{const k=Object.keys(rw)[0];const done=i<di||(i===di&&D.got===D.d);return `<div class="m2cal${i===di?' cur':''}${done?' ok':''}"><small>Ngày ${i+1}</small>${icon(k)}<em>${done?'✓':Object.values(rw).reduce((a,b)=>a+b,0)}</em></div>`;}).join('');
  const tk=(T,i)=>{const t=m2TDef(T.k),v=m2TVal(T),ok=v>=T.n;const rw=i==='w'?{cowrie:12,shellBeads:1,meatDried:3}:(M2TR[T.k]||{});return `<div class="m2task${T.ok?' done':''}"><span class="m2ti">${t[2]}</span><div><b>${esc(t[1])}</b> <small>${v}/${T.n}</small><i class="m2bar" style="--v:${v/T.n*100}%"></i><span class="small muted">${Object.entries(rw).map(([k,n])=>`${icon(k)}${n}`).join(' ')}</span></div>${T.ok?'<span class="m2ok">✓</span>':`<button class="btn sm" data-a="m2tk" data-i="${i}"${ok?'':' disabled'}>Nhận</button>`}</div>`;};
  const left=(()=>{const n=new Date(),e=new Date(n);e.setHours(24,0,0,0);const s=(e-n)/1000;return Math.floor(s/3600)+' giờ '+Math.floor(s%3600/60)+' phút';})();
  return `<div class="m2ev"><span>${ev.ic}</span><div><b>${esc(ev.n)}</b><p class="small">${esc(ev.d)}</p></div></div>
  <h3>📅 Quà điểm danh · chuỗi ${st} ngày</h3><div class="m2cals">${cal}</div><button class="btn" data-a="m2claim"${D.got===D.d?' disabled':''}>${D.got===D.d?'Đã nhận hôm nay':'🎁 Nhận quà hôm nay'}</button>
  <p class="small muted">Vào game mỗi ngày để nối chuỗi; bỏ một ngày thì chuỗi tính lại từ đầu.</p>
  <h3>☀️ Việc hôm nay <small class="muted">· còn ${left}</small></h3>${(D.tasks||[]).map((T,i)=>tk(T,i)).join('')}
  <h3>🗓️ Việc tuần này · ${esc(ev.n)}</h3>${D.wk?tk(D.wk,'w'):''}`;}

/* ===================== 5. HỘP THƯ ===================== */
function m2SysMail(from,t,it){const M=M2I();M.sys.unshift({id:'s'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),from,t,at:Date.now(),it:it&&Object.keys(it).length?it:null});if(M.sys.length>40)M.sys.length=40;m2Badge();save();}
// trao quà: túi đủ chỗ thì vào túi, thiếu chỗ thì phần còn lại vào hộp thư
function m2Give(rw,why){const rest={};let any=0;for(const k in rw){if(!ITEMS[k]||!(rw[k]>0))continue;const left=invAdd(k,rw[k]);if(rw[k]-left>0){any=1;cnt('get',k,rw[k]-left);try{uiFly(k,rw[k]-left);}catch(e){}}if(left)rest[k]=left;}
  if(Object.keys(rest).length){m2SysMail('Bếp lửa làng',`${why||'Quà'}: túi đầy nên phần còn lại gửi vào hộp thư. Dọn túi rồi bấm Nhận.`,rest);uiToast('✉️ Túi đầy: quà còn lại đã gửi vào hộp thư.','');}uiHotbar();return any;}
const m2ValIt=it=>{if(!it||typeof it!=='object')return null;const o={};let n=0;for(const k in it){if(!ITEMS[k]||ITEMS[k].t==='pet'||!Number.isInteger(it[k])||it[k]<1||it[k]>20)continue;o[k]=it[k];if(++n>=3)break;}return n?o:null;};
function m2ValMail(uid,d){if(!m2Id(uid)||!d||typeof d!=='object'||!Array.isArray(d.list))return null;const out=[];for(const m of d.list.slice(-30)){if(!m||typeof m!=='object'||!m2Id(m.id)||!m2Id(m.to)||!mpNum(m.at,0,1e14))continue;out.push({id:uid+':'+m.id,from:uid,to:m.to,t:m2Txt(m.t,200),at:m.at,it:m2ValIt(m.it)});}
  return {list:out,ack:Array.isArray(d.ack)?d.ack.filter(m2Id).slice(-300):[]};}
function m2Inbox(){const M=M2I(),L=M.sys.map(m=>Object.assign({sys:1,got:!m.it||!!M.mget[m.id]},m));
  if(m2Net()){const ack=new Set((M2K.mailMe&&M2K.mailMe.ack)||[]);for(const u in M2K.mailIn)for(const m of M2K.mailIn[u].list){if(m.to!==MP.uid)continue;L.push(Object.assign({got:!m.it||!!M.mget[m.id]||ack.has(m.id)},m));}}
  return L.sort((a,b)=>b.at-a.at);}
const m2MailNew=()=>{const r=(S.m2&&S.m2.mR)||0;return m2Inbox().filter(m=>m.at>r||!m.got).length;};
function m2MailClaim(id){const M=M2I(),m=m2Inbox().find(x=>x.id===id);if(!m||m.got||!m.it)return;for(const k in m.it)if(!invFits(k,m.it[k])){uiToast('Túi không đủ chỗ: dọn bớt rồi nhận.','bad');sfx('no');return;}
  M.mget[id]=1;give(m.it,null);if(!m.sys&&m2Net()){const me=M2K.mailMe||(M2K.mailMe={to:[],list:[],ack:[]});me.ack=(me.ack||[]).concat(id).slice(-300);m2MailWrite();}
  if(m.sys){M.sys=M.sys.filter(x=>x.id!==id||x.keep);}sfx('pick');save();uiOpenRefresh();}
function m2MailWrite(){const me=M2K.mailMe;if(!me)return;const list=me.list.slice(-30);me.to=[...new Set(list.map(m=>m.to))];mpPut('mail/'+MP.uid,{to:me.to,list,ack:(me.ack||[]).slice(-300),at:Date.now()});}
function m2MailSend(){if(!m2Net()){uiToast('Gửi thư cần chơi ở Thế giới chung.','bad');return;}const to=($('#m2to')||{}).value,t=m2Txt(($('#m2mt')||{}).value,200),si=($('#m2ms')||{}).value,n=Math.max(1,Math.min(20,+(($('#m2mn')||{}).value)||1));
  if(!m2Id(to)||to===MP.uid){uiToast('Chọn người nhận.','bad');return;}if(!t&&si===''){uiToast('Viết vài chữ hoặc gửi kèm đồ.','bad');return;}
  const me=M2K.mailMe||(M2K.mailMe={to:[],list:[],ack:[]});const day=m2Date();if(me.list.filter(m=>m2Date(m.at)===day).length>=20){uiToast('Hôm nay đã gửi nhiều thư rồi. Mai gửi tiếp nhé.','bad');return;}
  let it=null;if(si!==''){const s=S.inv[+si];if(!s||ITEMS[s.id].t==='pet'){uiToast('Ô đồ trống.','bad');return;}const k=Math.min(n,s.n);if(!invTake(s.id,k))return;it={[s.id]:k};equip(selTool());uiHotbar();}
  me.list.push({id:'m'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),to,t,at:Date.now(),it});m2MailWrite();cnt('cnt','mail');sfx('craft');uiToast('✉️ Đã gửi thư'+(it?' kèm đồ':'')+'.','good');G.m2mail=null;save();uiOpenRefresh();}
function m2Contacts(){const s=new Set();if(!m2Net())return [];(M2K.fr||[]).forEach(u=>s.add(u));const c=MP.clans[mpMyClan()];if(c)c.members.forEach(u=>s.add(u));for(const r of MP.rp.values())if(r.uid)s.add(r.uid);for(const u in M2K.mailIn)s.add(u);for(const u in M2K.frIn)s.add(u);s.delete(MP.uid);return [...s].slice(0,80);}
function m2MailHtml(){const M=M2I();setTimeout(()=>{M.mR=Date.now();m2Badge();},0);
  if(G.m2mail){const to=G.m2mail.to||'',C=m2Contacts();if(to&&!C.includes(to))C.unshift(to);const inv=S.inv.map((s,i)=>s&&ITEMS[s.id].t!=='pet'?`<option value="${i}">${esc(ITEMS[s.id].n)} ×${s.n}</option>`:'').join('');
    return `<button class="btn sm ghost" data-a="m2mail" data-v="">← Hộp thư</button><h3>✍️ Viết thư</h3>${C.length?`<label class="m2f">Gửi cho<select id="m2to">${C.map(u=>`<option value="${esc(u)}"${u===to?' selected':''} data-m2nmo="${esc(u)}">${esc(mpName(u))}</option>`).join('')}</select></label>`:'<p class="small">Chưa có ai để gửi: kết bạn hoặc vào bộ tộc trước.</p>'}
      <label class="m2f">Lời nhắn<textarea id="m2mt" maxlength="200" rows="3" placeholder="Chào bạn, mai đi săn cùng không?"></textarea></label>
      <label class="m2f">Gửi kèm đồ (không bắt buộc)<select id="m2ms"><option value="">— không —</option>${inv}</select></label><label class="m2f">Số lượng<input id="m2mn" type="number" min="1" max="20" value="1" inputmode="numeric"></label>
      <button class="btn" data-a="m2send"${C.length?'':' disabled'}>✉️ Gửi</button><p class="hint">Đồ gửi kèm rời khỏi túi ngay. Người nhận bấm Nhận mới vào túi họ. Mỗi thư tối đa 20 món.</p>`;}
  const L=m2Inbox();return `<div class="row"><button class="btn sm" data-a="m2mail" data-v="new"${m2Net()?'':' disabled'}>✍️ Viết thư</button>${m2Net()?'':'<span class="small muted">Thư giữa người chơi chỉ có ở Thế giới chung.</span>'}</div>`+
    (L.length?`<div class="m2list">${L.map(m=>`<div class="m2mail${m.got?'':' new'}"><div class="spread"><span>${m.sys?'📜 <b>'+esc(m.from)+'</b>':'✉️ '+m2Nm(m.from)}</span><small class="muted">${m2Ago(m.at)}</small></div>${m.t?`<p>${esc(m.t)}</p>`:''}
      ${m.it?`<div class="row">${Object.entries(m.it).map(([k,n])=>`<span class="chip">${icon(k)}${n} ${esc(ITEMS[k].n)}</span>`).join('')}${m.got?'<span class="small muted">đã nhận</span>':`<button class="btn sm" data-a="m2mget" data-id="${esc(m.id)}">Nhận</button>`}</div>`:''}
      <div class="row">${!m.sys?`<button class="btn sm ghost" data-a="m2mail" data-v="new" data-to="${esc(m.from)}">↩ Trả lời</button>`:''}${m.sys&&m.got?`<button class="btn sm ghost" data-a="m2mdel" data-id="${esc(m.id)}">Xóa</button>`:''}</div></div>`).join('')}</div>`:'<p class="muted">Hộp thư trống.</p>');}

/* ===================== 6. BẠN BÈ, HỒ SƠ ===================== */
function m2FrSave(){mpPut('friends/'+MP.uid,{list:(M2K.fr||[]).slice(0,100),at:Date.now()});}
function m2FrAdd(u){if(!m2Net()||!m2Id(u)||u===MP.uid)return;M2K.fr=M2K.fr||[];if(M2K.fr.includes(u))return;if(M2K.fr.length>=100){uiToast('Danh sách bạn đã đầy (100).','bad');return;}M2K.fr.push(u);delete M2I().frNo[u];m2FrSave();
  uiToast(M2K.frIn[u]?`🤝 Đã thành bạn với ${mpName(u)}!`:`Đã gửi lời kết bạn tới ${mpName(u)}.`,M2K.frIn[u]?'good':'');cnt('cnt','friend');uiOpenRefresh();}
function m2FrDel(u){M2K.fr=(M2K.fr||[]).filter(x=>x!==u);m2FrSave();uiOpenRefresh();}
const m2FrState=u=>{const mine=(M2K.fr||[]).includes(u),th=!!M2K.frIn[u];return mine&&th?'friend':mine?'sent':th?'in':'none';};
function m2Seen(u){if(mpOnline(u))return '<span class="m2on">● đang chơi</span>';const p=MP.players[u];return p&&p.lastSeen?`<small class="muted">${m2Ago(p.lastSeen)}</small>`:'';}
function m2FrHtml(){if(!m2Net())return '<p class="small">Bạn bè, hồ sơ, gửi thư, đổi hàng với người khác chỉ có ở <b>🌐 Thế giới chung</b>. Tạo nhân vật mới và chọn Thế giới chung để chơi cùng mọi người.</p>';
  if(G.m2pf)return m2PfHtml(G.m2pf);const No=M2I().frNo,all=new Set([...(M2K.fr||[]),...Object.keys(M2K.frIn)]);const L=[...all].filter(u=>u!==MP.uid);
  const fr=L.filter(u=>m2FrState(u)==='friend').sort((a,b)=>(mpOnline(b)?1:0)-(mpOnline(a)?1:0)),inc=L.filter(u=>m2FrState(u)==='in'&&!No[u]),sent=L.filter(u=>m2FrState(u)==='sent');
  const row=(u,btn)=>`<div class="mp-m"><i style="background:${mpColOf(u)||'#888'}"></i>${m2Nm(u)} ${m2Seen(u)}<span class="m2r">${btn}<button class="btn sm ghost" data-a="m2pf" data-u="${esc(u)}">Hồ sơ</button></span></div>`;
  const near=[...MP.rp.values()].filter(r=>r.ok&&r.uid&&!all.has(r.uid)).map(r=>({r,d:Math.hypot(r.x-P.x,r.z-P.z)})).sort((a,b)=>a.d-b.d).slice(0,12);
  const q=mxNorm(G.m2q||'');const found=q.length>=2?Object.keys(MP.players).filter(u=>u!==MP.uid&&mxNorm(mpName(u)).includes(q)).slice(0,15):[];
  return `<h3>👥 Bạn bè (${fr.length})</h3>${fr.length?fr.map(u=>row(u,`<button class="btn sm" data-a="m2mail" data-v="new" data-to="${esc(u)}">✉️</button>`)).join(''):'<p class="small muted">Chưa có bạn nào. Kết bạn với người ở gần hoặc tìm tên bên dưới.</p>'}
    ${inc.length?`<h3>📨 Lời mời kết bạn (${inc.length})</h3>${inc.map(u=>row(u,`<button class="btn sm" data-a="m2fadd" data-u="${esc(u)}">Đồng ý</button><button class="btn sm ghost" data-a="m2fno" data-u="${esc(u)}">Bỏ qua</button>`)).join('')}`:''}
    ${sent.length?`<h3>⏳ Đã gửi lời mời</h3>${sent.map(u=>row(u,`<button class="btn sm ghost" data-a="m2fdel" data-u="${esc(u)}">Rút lại</button>`)).join('')}`:''}
    <h3>📍 Người ở gần</h3>${near.length?near.map(({r,d})=>row(r.uid,`<small class="muted">${Math.round(d/20)} m</small><button class="btn sm" data-a="m2fadd" data-u="${esc(r.uid)}">Kết bạn</button>`)).join(''):'<p class="small muted">Không có ai ở gần.</p>'}
    <h3>🔎 Tìm người chơi</h3><input class="mp-q" id="m2q" placeholder="Gõ tên (từ 2 chữ)" value="${esc(G.m2q||'')}" autocomplete="off">${found.map(u=>row(u,m2FrState(u)==='none'?`<button class="btn sm" data-a="m2fadd" data-u="${esc(u)}">Kết bạn</button>`:'')).join('')}`;}
function m2PfHtml(u){const st=m2FrState(u),cid=mpClanOf(u),c=MP.clans[cid],L=M2K.lb[u],r=[...MP.rp.values()].find(x=>x.uid===u);const near=r&&Math.hypot(r.x-P.x,r.z-P.z)<160;
  const stat=L?[['📅','Ngày sống',L.d],['🏹','Thú săn',L.h],['🏠','Công trình',L.b],['🏆','Thành tựu',L.a],['🗺️','Vùng đã tới',L.r],['🚶','Đường đã đi',L.k+' km']].map(([i,n,v])=>`<div><span>${i} ${n}</span><b>${esc(String(v))}</b></div>`).join(''):'<p class="small muted">Đang tải số liệu…</p>';
  if(!L&&!M2K.lbAsk){M2K.lbAsk=1;m2LbLoad().then(()=>{M2K.lbAsk=0;uiOpenRefresh();});}
  return `<button class="btn sm ghost" data-a="m2pf" data-u="">← Bạn bè</button><div class="mp-card" style="--cc:${c?c.color:'#888'}"><span class="mp-em">${c?esc(c.emblem):'🧑'}</span><div>${m2Nm(u)}<small>${c?esc(mpCT(c.name)):'Chưa vào bộ tộc'}${cid===u?' · thủ lĩnh':''}</small><br>${m2Seen(u)}</div></div>
    <div class="mxstat m2pf">${stat}</div><div class="row">${st==='friend'?'<span class="chip">🤝 Bạn bè</span>':st==='sent'?'<span class="chip">⏳ Đã mời</span>':`<button class="btn sm" data-a="m2fadd" data-u="${esc(u)}">${st==='in'?'Đồng ý kết bạn':'➕ Kết bạn'}</button>`}
    <button class="btn sm" data-a="m2mail" data-v="new" data-to="${esc(u)}">✉️ Gửi thư</button>${near?`<button class="btn sm" data-a="m2gift" data-p="${esc(r.peer)}">🎁 Tặng đồ</button><button class="btn sm ghost" data-a="m2emo" data-e="wave">👋 Vẫy tay</button>`:''}${st==='friend'?`<button class="btn sm ghost" data-a="m2fdel" data-u="${esc(u)}">Hủy kết bạn</button>`:''}</div>`;}

/* ===================== 7. CHỢ: BẢNG ĐỔI HÀNG · CHỢ PHIÊN Ở LÀNG · GIÁ TRỊ ===================== */
const m2Pair=v=>Array.isArray(v)&&v.length===2&&typeof v[0]==='string'&&ITEMS[v[0]]&&ITEMS[v[0]].t!=='pet'&&Number.isInteger(v[1])&&v[1]>=1&&v[1]<=99?[v[0],v[1]]:null;
function m2ValMkt(uid,d){if(!m2Id(uid)||!d||typeof d!=='object'||!Array.isArray(d.list))return null;if(S&&d.w!==S.seed)return null;const out=[];for(const l of d.list.slice(0,6)){if(!l||!m2Id(l.id))continue;const g=m2Pair(l.g),w=m2Pair(l.w);if(!g||!w||!mpNum(l.at,0,1e14))continue;out.push({id:l.id,s:uid,g,w,at:l.at});}return out;}
function m2ValDeals(uid,d){if(!m2Id(uid)||!d||typeof d!=='object'||!Array.isArray(d.list))return [];return d.list.slice(-40).filter(x=>x&&m2Id(x.lid)&&m2Id(x.s)&&mpNum(x.at,0,1e14)).map(x=>({lid:x.lid,s:x.s,at:x.at,b:uid}));}
const m2Win=L=>L.slice().sort((a,b)=>a.at-b.at||(a.b<b.b?-1:1))[0];
async function m2MktLoad(){if(!m2Net())return;try{const s=await mpTO(MP.db.collection('market').limit(300).get(),10000);const o={};for(const d of s.docs){const v=m2ValMkt(d.id,d.data());if(v&&v.length)o[d.id]=v;}M2K.mkt=o;M2K.mktT=Date.now();}catch(e){}}
async function m2DealsFor(seller){try{const s=await mpTO(MP.db.collection('deals').where('sel','array-contains',seller).limit(200).get(),10000);const L=[];for(const d of s.docs)L.push(...m2ValDeals(d.id,d.data()));return L;}catch(e){return null;}}
function m2MyMkt(){return (M2K.myMkt||[]);}
function m2MktWrite(){mpPut('market/'+MP.uid,{w:S.seed,list:m2MyMkt().map(l=>({id:l.id,g:l.g,w:l.w,at:l.at})),at:Date.now()});}
function m2MktPost(){if(!m2Net())return;if(m2MyMkt().length>=6){uiToast('Mỗi người đăng tối đa 6 món đổi.','bad');return;}const si=($('#m2gs')||{}).value,gn=Math.max(1,Math.min(99,+(($('#m2gn')||{}).value)||1)),wid=($('#m2wi')||{}).value,wn=Math.max(1,Math.min(99,+(($('#m2wn')||{}).value)||1));
  const s=S.inv[+si];if(si===''||!s){uiToast('Chọn món đem đổi.','bad');return;}if(!ITEMS[wid]||wid===s.id){uiToast('Chọn món muốn nhận (khác món đem đổi).','bad');return;}const k=Math.min(gn,s.n),gid=s.id;if(!invTake(gid,k))return;equip(selTool());
  const id='l'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),l={id,s:MP.uid,g:[gid,k],w:[wid,wn],at:Date.now()};M2K.myMkt=m2MyMkt().concat(l);M2I().esc[id]={g:[gid,k]};m2MktWrite();
  uiToast(`⚖️ Đã đăng: ${k} ${ITEMS[gid].n} đổi lấy ${wn} ${ITEMS[wid].n}. Đồ được giữ lại chờ người đổi.`,'good');sfx('craft');uiHotbar();save();uiOpenRefresh();}
async function m2MktCancel(id){const l=m2MyMkt().find(x=>x.id===id);if(!l||M2K.busy)return;M2K.busy=true;try{const D=await m2DealsFor(MP.uid);if(D===null){uiToast('Mạng chập chờn, thử lại sau.','bad');return;}if(D.some(d=>d.lid===id)){uiToast('Đã có người đổi món này rồi, đang chờ chuyển đồ.','');m2Payout(D);return;}
    M2K.myMkt=m2MyMkt().filter(x=>x.id!==id);m2MktWrite();const E=M2I().esc[id];delete M2I().esc[id];if(E)m2Give({[E.g[0]]:E.g[1]},'Rút hàng');uiToast('Đã rút món đổi, đồ trả về túi.','');save();}finally{M2K.busy=false;uiOpenRefresh();}}
async function m2MktBuy(seller,id){if(!m2Net()||M2K.busy||seller===MP.uid)return;const l=(M2K.mkt[seller]||[]).find(x=>x.id===id);if(!l)return;const [wid,wn]=l.w,[gid,gn]=l.g;
  if(invCount(wid)<wn){uiToast(`Cần ${wn} ${ITEMS[wid].n}.`,'bad');sfx('no');return;}if(!invFits(gid,gn)){uiToast('Túi không đủ chỗ.','bad');return;}M2K.busy=true;uiToast('⚖️ Đang đổi hàng…','');
  try{const cur=await mpGetDoc('market/'+seller),v=cur&&m2ValMkt(seller,cur),still=v&&v.find(x=>x.id===id&&x.g[0]===gid&&x.g[1]===gn&&x.w[0]===wid&&x.w[1]===wn);if(!still){uiToast('Món này vừa được rút hoặc đổi mất rồi.','bad');await m2MktLoad();return;}
    const D0=await m2DealsFor(seller);if(D0===null){uiToast('Mạng chập chờn, thử lại sau.','bad');return;}if(D0.some(d=>d.lid===id)){uiToast('Có người đổi trước bạn mất rồi.','bad');return;}
    if(!invTake(wid,wn))return;equip(selTool());uiHotbar();const me=M2K.dealsMe||(M2K.dealsMe={list:[]});const rec={lid:id,s:seller,at:Date.now()};me.list=me.list.concat(rec).slice(-40);m2DealsWrite();await mpSleep(1500);
    const D=await m2DealsFor(seller);const mine=(D||[]).filter(d=>d.lid===id);const win=mine.length?m2Win(mine):null;
    if(win&&win.b===MP.uid&&win.at===rec.at){M2I().bought[id]=1;m2Give({[gid]:gn},'Đổi hàng');cnt('cnt','m2trade');sfx('level');uiToast(`🤝 Đổi xong: nhận ${gn} ${ITEMS[gid].n}. Người bán sẽ nhận ${wn} ${ITEMS[wid].n} khi họ vào game.`,'gold');
      M2K.mkt[seller]=(M2K.mkt[seller]||[]).filter(x=>x.id!==id);}
    else{me.list=me.list.filter(x=>x!==rec);m2DealsWrite();m2Give({[wid]:wn},'Trả lại');uiToast('Có người đổi trước bạn một chút. Đồ của bạn đã trả lại.','bad');}save();}
  finally{M2K.busy=false;uiOpenRefresh();}}
function m2DealsWrite(){const me=M2K.dealsMe;if(!me)return;mpPut('deals/'+MP.uid,{sel:[...new Set(me.list.map(d=>d.s))],list:me.list,at:Date.now()});}
// người bán: ai đổi trước (đã quá 5 giây) thì được; trao đồ đổi về, gỡ món khỏi bảng
function m2Payout(D){const M=M2I();let ch=false;for(const l of m2MyMkt().slice()){const ds=D.filter(d=>d.lid===l.id&&d.s===MP.uid);if(!ds.length)continue;const w=m2Win(ds);if(Date.now()-w.at<5000)continue;
    M2K.myMkt=m2MyMkt().filter(x=>x.id!==l.id);delete M.esc[l.id];ch=true;if(M.paid[l.id])continue;M.paid[l.id]=1;const [wid,wn]=l.w;
    m2SysMail('Chợ đổi hàng',`Có người đã đổi ${l.g[1]} ${ITEMS[l.g[0]].n} của bạn. Đây là ${wn} ${ITEMS[wid].n} nhận về.`,{[wid]:wn});cnt('cnt','m2trade');uiToast(`⚖️ ${mpName(w.b)} đã đổi ${ITEMS[l.g[0]].n} của bạn: ${wn} ${ITEMS[wid].n} ở hộp thư.`,'gold');}
  if(ch){m2MktWrite();save();M2K.dirty=true;}}
const M2STOCK=[['salt',0],['pot',0],['seedRice',0],['cloth',0],['rope',0],['medicine',0],['arrow',0],['shellBeads',0],['calf',3],['bronze',4],['bronzeBracelet',4]];
const m2AtVillage=()=>!!(G.village&&Math.hypot(P.x-G.village.x,P.z-G.village.z)<520);
const m2Lot=id=>{const v=m2Val(id)*0.7;return v>=1?{n:1,p:Math.floor(v)}:{n:Math.ceil(1/v),p:Math.floor(Math.ceil(1/v)*v)};};
function m2VSell(id){if(!m2AtVillage()||(S.age||0)<3)return;const L=m2Lot(id);if(invCount(id)<L.n||!L.p)return;invTake(id,L.n);equip(selTool());m2Give({cowrie:L.p},'Bán ở chợ');cnt('cnt','trade');sfx('pick');save();uiOpenRefresh();}
function m2VBuy(id){if(!m2AtVillage()||(S.age||0)<3)return;const p=Math.ceil(m2Val(id)*1.3);if(invCount('cowrie')<p){uiToast(`Cần ${p} vỏ ốc tiền.`,'bad');sfx('no');return;}if(id!=='calf'&&!invFits(id,1)){uiToast('Túi đầy.','bad');return;}invTake('cowrie',p);m2Give({[id]:1},'Mua ở chợ');cnt('cnt','trade');sfx('craft');save();uiOpenRefresh();}
function m2MktHtml(){const t=G.m2mt||'board',tabs=[['board','⚖️ Đổi hàng'],['village','🏘️ Chợ phiên'],['val','📏 Giá trị']].map(([k,n])=>`<button class="tb sm${t===k?' on':''}" data-a="m2mt" data-v="${k}">${n}</button>`).join('');
  let h=`<div class="chipsel">${tabs}</div>`;const age=S.age||0;
  if(t==='val'){const ks=Object.keys(M2V).filter(k=>ITEMS[k]).sort((a,b)=>m2Val(b)-m2Val(a));return h+`<p class="small">Giá trị ước theo công làm và độ hiếm, tính bằng <b>vỏ ốc tiền</b>. Người xưa đổi hàng lấy hàng: muối, đồ gốm, vải, đồ đồng thau là của quý; củi, đá, cỏ thì rẻ. Thời Đông Sơn, 1 thỏi đồng ≈ 12 vỏ ốc.</p>
    <div class="m2val">${ks.map(k=>`<div>${icon(k)}<span>${esc(ITEMS[k].n)}</span><b>${m2Vf(m2Val(k))}</b></div>`).join('')}</div>`;}
  if(t==='village'){if(age<3)return h+'<p class="small">Chợ phiên chỉ họp khi các làng đã định cư, buôn bán xa (từ <b>Thời Phùng Nguyên</b>). Giờ vẫn đổi hàng trực tiếp với Tù trưởng ở làng.</p>';
    if(!m2AtVillage())return h+'<p class="small">Chợ phiên họp ở <b>làng</b>. Đến làng (trong khoảng 25 m) để mua bán.</p>';
    const have=[...new Set(S.inv.filter(Boolean).map(s=>s.id))].filter(id=>ITEMS[id].t!=='pet'&&id!=='cowrie');
    return h+`<p class="small">Bạn có <b>${invCount('cowrie')}</b> 🐚 vỏ ốc tiền. Chợ mua rẻ (70%), bán đắt (130%) giá trị.</p><h3>Mua</h3>${M2STOCK.filter(([,a])=>age>=a).map(([id])=>{const p=Math.ceil(m2Val(id)*1.3);return `<div class="rc">${icon(id,'big')}<div class="rc-b"><b>${esc(ITEMS[id].n)}</b><span class="small muted">${esc((ITEMS[id].ds||'').slice(0,70))}</span></div><div class="rc-a"><button class="btn sm" data-a="m2vb" data-i="${id}"${invCount('cowrie')<p?' disabled':''}>🐚 ${p}</button></div></div>`;}).join('')}
      <h3>Bán</h3>${have.map(id=>{const L=m2Lot(id);return L.p?`<div class="m2sell">${icon(id)}<span>${esc(ITEMS[id].n)} ×${L.n}</span><button class="btn sm ghost" data-a="m2vs" data-i="${id}"${invCount(id)<L.n?' disabled':''}>→ 🐚 ${L.p}</button></div>`:'';}).join('')||'<p class="muted small">Túi trống.</p>'}`;}
  if(!m2Net())return h+'<p class="small">Bảng đổi hàng giữa người chơi chỉ có ở <b>🌐 Thế giới chung</b>. Ở đây vẫn dùng được 🏘️ Chợ phiên ở làng (từ Thời Phùng Nguyên).</p>';
  if(Date.now()-M2K.mktT>20000&&!M2K.mktAsk){M2K.mktAsk=1;m2MktLoad().then(()=>{M2K.mktAsk=0;M2K.dirty=true;});}
  const all=[];for(const u in M2K.mkt)if(u!==MP.uid)all.push(...M2K.mkt[u]);all.sort((a,b)=>b.at-a.at);const mine=m2MyMkt();
  const fair=(g,w)=>{const a=m2Val(g[0])*g[1],b=m2Val(w[0])*w[1],r=a/Math.max(0.01,b);return `<small class="${r<0.7?'warn':r>1.4?'m2good':'muted'}">≈${m2Vf(a)} ⇄ ${m2Vf(b)} 🐚${r<0.7?' · đắt':r>1.4?' · hời':''}</small>`;};
  const card=(l,me)=>`<div class="m2deal"><div class="m2dl">${icon(l.g[0])}<b>${l.g[1]}</b><span>${esc(ITEMS[l.g[0]].n)}</span></div><span class="m2ar">⇄</span><div class="m2dl">${icon(l.w[0])}<b>${l.w[1]}</b><span>${esc(ITEMS[l.w[0]].n)}</span></div>
    <div class="m2dr">${me?'<small class="muted">của bạn</small>':m2Nm(l.s)}${fair(l.g,l.w)}${me?`<button class="btn sm ghost" data-a="m2mx" data-id="${esc(l.id)}">Rút</button>`:`<button class="btn sm" data-a="m2mb" data-s="${esc(l.s)}" data-id="${esc(l.id)}"${invCount(l.w[0])<l.w[1]?' disabled':''}>Đổi</button>`}</div></div>`;
  const inv=S.inv.map((s,i)=>s&&ITEMS[s.id].t!=='pet'?`<option value="${i}">${esc(ITEMS[s.id].n)} ×${s.n}</option>`:'').join('');
  const want=Object.keys(ITEMS).filter(k=>ITEMS[k].t!=='pet'&&(S.cnt['get:'+k]||M2V[k]!=null)).sort((a,b)=>ITEMS[a].n.localeCompare(ITEMS[b].n,'vi')).map(k=>`<option value="${k}">${esc(ITEMS[k].n)}</option>`).join('');
  return h+`<details class="m2post"${mine.length?'':' open'}><summary>➕ Đăng món muốn đổi (${mine.length}/6)</summary><label class="m2f">Đem đổi<select id="m2gs"><option value="">— chọn —</option>${inv}</select></label><label class="m2f">Số lượng<input id="m2gn" type="number" min="1" max="99" value="1" inputmode="numeric"></label>
    <label class="m2f">Muốn nhận<select id="m2wi">${want}</select></label><label class="m2f">Số lượng<input id="m2wn" type="number" min="1" max="99" value="1" inputmode="numeric"></label><button class="btn" data-a="m2post">Đăng lên bảng</button>
    <p class="hint">Đồ đem đổi rời túi khi đăng (giữ hộ). Ai đổi trước được trước; đồ bạn nhận về nằm ở hộp thư. Rút lại thì đồ trả về túi.</p></details>
    ${mine.length?`<h3>Món bạn đang đăng</h3>${mine.map(l=>card(l,1)).join('')}`:''}<h3>Bảng đổi hàng (${all.length})</h3>${all.length?all.slice(0,40).map(l=>card(l,0)).join(''):'<p class="muted small">Chưa có ai đăng món đổi.</p>'}<button class="btn sm ghost" data-a="m2mr">↻ Tải lại</button>`;}

/* ===================== 8. XẾP HẠNG ===================== */
function m2MyStats(){let terr=0;try{const c=MP.claims[MP.uid];terr=c?c.r:0;}catch(e){}return {w:S.seed,d:S.day|0,h:mxgc('cnt:hunt'),b:m2Sum('build:'),a:Object.keys((S.mx&&S.mx.ach)||{}).length,r:Object.keys(S.disc||{}).length,k:Math.round((S.mx&&S.mx.dist||0)/20/100)/10,t:terr|0,cl:mpMyClan()||null};}
function m2ValLb(uid,d){if(!m2Id(uid)||!d||typeof d!=='object'||(S&&d.w!==S.seed))return null;const n=(v,b)=>mpNum(v,0,b)?Math.floor(v*10)/10:0;return {d:n(d.d,1e6),h:n(d.h,1e7),b:n(d.b,1e7),a:n(d.a,1e4),r:n(d.r,1e3),k:n(d.k,1e6),t:n(d.t,1e4),cl:m2Id(d.cl)?d.cl:null,at:mpNum(d.at,0,1e14)?d.at:0};}
async function m2LbLoad(){if(!m2Net())return;try{const s=await mpTO(MP.db.collection('lb').limit(500).get(),10000);const o={};for(const d of s.docs){const v=m2ValLb(d.id,d.data());if(v)o[d.id]=v;}M2K.lb=o;M2K.lbT=Date.now();}catch(e){}}
function m2LbPush(){if(!m2Net())return;const s=m2MyStats(),k=JSON.stringify(s);if(k===M2K.lbK)return;M2K.lbK=k;mpPut('lb/'+MP.uid,Object.assign(s,{at:Date.now()}));M2K.lb[MP.uid]=m2ValLb(MP.uid,Object.assign({},s,{at:Date.now()}));}
const M2LB=[['d','📅 Ngày sống',''],['h','🏹 Thú săn',''],['b','🏠 Công trình',''],['a','🏆 Thành tựu',''],['r','🗺️ Vùng đất',''],['k','🚶 Đường đi',' km'],['clan','🤝 Bộ tộc','']];
function m2LbHtml(){const t=G.m2lb||'d',tabs=M2LB.map(([k,n])=>`<button class="tb sm${t===k?' on':''}" data-a="m2lbt" data-v="${k}">${n}</button>`).join('');let h=`<div class="chipsel">${tabs}</div>`;
  if(!m2Net()){const s=m2MyStats();return h+`<p class="small">Bảng xếp hạng so tài với mọi người ở <b>🌐 Thế giới chung</b>. Thành tích của bạn ở thế giới riêng:</p><div class="mxstat">${M2LB.slice(0,6).map(([k,n,u])=>`<div><span>${n}</span><b>${s[k]}${u}</b></div>`).join('')}</div>`;}
  if(Date.now()-M2K.lbT>60000&&!M2K.lbAsk){M2K.lbAsk=1;m2LbPush();m2LbLoad().then(()=>{M2K.lbAsk=0;M2K.dirty=true;});}
  const L=M2K.lb;if(t==='clan'){const C={};for(const cid in MP.clans){const c=MP.clans[cid];C[cid]={c,b:0,h:0,n:c.members.length,t:c.zone?c.zone.r:0};for(const u of c.members){const s=L[u];if(s){C[cid].b+=s.b;C[cid].h+=s.h;}}}
    const R=Object.entries(C).map(([id,v])=>Object.assign({id,sc:Math.round(v.t*v.t*Math.PI/400/100)+v.b+v.h*2},v)).sort((a,b)=>b.sc-a.sc).slice(0,30);
    return h+'<p class="small muted">Điểm bộ tộc = lãnh thổ chung + công trình + thú săn của mọi thành viên.</p>'+(R.length?`<div class="m2lb">${R.map((r,i)=>`<div class="${r.id===mpMyClan()?'me':''}"><em>${i+1}</em><span>${esc(r.c.emblem)} ${esc(mpCT(r.c.name))} <small class="muted">${r.n} người</small></span><b>${r.sc}</b></div>`).join('')}</div>`:'<p class="muted">Chưa có bộ tộc nào.</p>');}
  const R=Object.entries(L).map(([u,s])=>({u,v:s[t]||0})).filter(r=>r.v>0).sort((a,b)=>b.v-a.v),u=(M2LB.find(x=>x[0]===t)||[])[2]||'';const me=R.findIndex(r=>r.u===MP.uid);
  return h+(R.length?`<div class="m2lb">${R.slice(0,50).map((r,i)=>`<div class="${r.u===MP.uid?'me':''}"><em>${i<3?['🥇','🥈','🥉'][i]:i+1}</em><span>${m2Nm(r.u)}</span><b>${r.v}${u}</b></div>`).join('')}</div>${me>=50?`<p class="small">Bạn đứng thứ <b>${me+1}</b>.</p>`:''}`:'<p class="muted">Đang tải…</p>')+`<button class="btn sm ghost" data-a="m2lbr">↻ Tải lại</button>`;}

/* ===================== 9. CỬ CHỈ, MÚA ===================== */
const M2EMO=[['wave','👋','Vẫy tay'],['bow','🙇','Cúi chào'],['clap','👏','Vỗ tay'],['dance','💃','Múa'],['cheer','🙌','Hò reo'],['point','👉','Chỉ đường'],['laugh','😄','Cười'],['sad','😢','Buồn'],['heart','❤️','Thương'],['sit','🧘','Ngồi thiền']];
function m2Emo(k,remote){const e=M2EMO.find(x=>x[0]===k);if(!e||!G.on)return;if(G.work||G.swim||G.ride)return;M2K.emo={k,t0:G.t,dur:k==='dance'?6:k==='sit'?5:2.4};uiFloat(e[1],P.x,P.y+56,P.z,'#fff');sfx(k==='clap'?'hit':k==='cheer'?'level':'pick');m2Pop(false);
  if(k==='dance'){cnt('cnt','dance');const fire=S.builds.some(b=>pieceDef(b.k)&&pieceDef(b.k).fuel&&fireLit(b)&&Math.hypot(b.x-P.x,b.z-P.z)<160),folk=(S.folk||[]).length,others=m2Net()?[...MP.rp.values()].filter(r=>Math.hypot(r.x-P.x,r.z-P.z)<200).length:0;
    if(fire&&TNOW()-(M2I().ev.danceT||0)>0.25){M2I().ev.danceT=TNOW();const n=2+Math.min(4,folk+others*2);if(typeof l4Spirit==='function')l4Spirit(n,1);uiToast(folk+others?'💃 Cả nhà nắm tay múa quanh bếp lửa, ai cũng vui!':'💃 Múa một mình bên bếp lửa: lòng nhẹ hẳn.','good');}}
  if(m2Net()&&MP.room&&!remote){const now=Date.now();if(now-M2K.emoT>1500){M2K.emoT=now;mpEmit('emo',{e:k,at:now});}}}
function m2EmoHear(m){try{if(!m||m.isMe||!m2Net()||!m.data||typeof m.data!=='object')return;const e=M2EMO.find(x=>x[0]===m.data.e);if(!e)return;const r=MP.rp.get(m.peer);if(!r||!r.ok)return;if(Math.hypot(r.x-P.x,r.z-P.z)>900)return;
  if(G.t-(r._m2e||-9)<1.2)return;r._m2e=G.t;uiFloat(e[1],r.x,(r.y||hAt(r.x,r.z))+56,r.z,'#fff');if(r.uid&&Math.hypot(r.x-P.x,r.z-P.z)<300&&(e[0]==='wave'||e[0]==='bow'))uiToast(`${e[1]} ${mpName(r.uid)} ${e[2].toLowerCase()} với bạn.`,'');}catch(er){}}
function m2EmoPose(R,t){const E=M2K.emo;if(!E)return false;const k=(t-E.t0);if(k>E.dur||P.speed>12||G.act||G.work){M2K.emo=null;return false;}const s=Math.sin(k*9);
  switch(E.k){case 'wave':R.armR.rotation.x=-2.7;R.armR.rotation.z=0.35*s;break;case 'bow':R.torso.rotation.x=Math.min(0.7,k*2)*(k<E.dur-0.6?1:Math.max(0,(E.dur-k)/0.6));R.head.rotation.x=0.3;break;
    case 'clap':R.armL.rotation.x=R.armR.rotation.x=-1.3;R.armL.rotation.z=-0.25-0.25*Math.abs(s);R.armR.rotation.z=0.25+0.25*Math.abs(s);break;
    case 'dance':{const b=Math.sin(k*6);R.armL.rotation.x=-2.2+b*0.5;R.armR.rotation.x=-2.2-b*0.5;R.legL.rotation.x=Math.max(0,b)*0.7;R.legR.rotation.x=Math.max(0,-b)*0.7;R.torso.rotation.z=b*0.12;P.model.rotation.y=P.ry+Math.sin(k*1.4)*0.9;P.model.position.y+=Math.abs(b)*3;break;}
    case 'cheer':R.armL.rotation.x=R.armR.rotation.x=-2.9+Math.abs(s)*0.3;P.model.position.y+=Math.abs(Math.sin(k*7))*4;break;case 'point':R.armR.rotation.x=-1.55;break;
    case 'laugh':R.torso.rotation.x=-0.1+Math.abs(s)*0.08;R.head.rotation.x=-0.25;break;case 'sad':R.head.rotation.x=0.45;R.torso.rotation.x=0.2;break;case 'heart':R.armL.rotation.x=R.armR.rotation.x=-1.0;R.armL.rotation.z=-0.5;R.armR.rotation.z=0.5;break;
    case 'sit':R.legL.rotation.x=R.legR.rotation.x=-1.5;P.model.position.y-=9;R.armL.rotation.x=R.armR.rotation.x=-0.5;break;}return true;}
{const _an=animTick;animTick=function(dt){_an(dt);try{if(M2K.emo&&P.rig)m2EmoPose(P.rig,G.t);}catch(e){}};}
function m2Pop(on){let el=$('#m2emo');if(!on){if(el)el.hidden=true;return;}if(!el){el=document.createElement('div');el.id='m2emo';el.className='m2pop';$('#game').appendChild(el);}
  el.innerHTML=`<div class="spread"><b>Cử chỉ</b><button class="btn sm ghost" data-a="m2popx">✕</button></div><div class="m2eg">${M2EMO.map(([k,i,n])=>`<button data-a="m2emo" data-e="${k}"><span>${i}</span><i>${n}</i></button>`).join('')}</div>`;el.hidden=false;}

/* ===================== 10. MẠNG: NGHE VÀ GHI ===================== */
async function m2NetStart(){if(M2K.net||!m2Net())return;M2K.net=true;const db=MP.db,uid=MP.uid;
  const sub=(q,fn)=>{try{M2K.unsubs.push(q.onSnapshot(fn,e=>console.warn('làng chung: nghe',e&&e.code)));}catch(e){console.warn(e);}};
  const f=await mpGetDoc('friends/'+uid);M2K.fr=f&&Array.isArray(f.list)?f.list.filter(m2Id).slice(0,100):[];
  const ml=await mpGetDoc('mail/'+uid);const mv=ml&&m2ValMail(uid,ml);M2K.mailMe={to:[],list:mv?ml.list.filter(x=>x&&m2Id(x.id)).slice(-30):[],ack:mv?mv.ack:[]};
  const mk=await mpGetDoc('market/'+uid);const kv=mk&&m2ValMkt(uid,mk);M2K.myMkt=kv||[];
  const dl=await mpGetDoc('deals/'+uid);M2K.dealsMe={list:dl&&Array.isArray(dl.list)?dl.list.filter(x=>x&&m2Id(x.lid)&&m2Id(x.s)).slice(-40):[]};
  sub(db.collection('friends').where('list','array-contains',uid).limit(200),s=>{const o={},old=M2K.frIn;for(const d of s.docs){if(!m2Id(d.id)||d.id===uid)continue;o[d.id]=1;if(M2K.frLd&&!old[d.id]&&!(M2K.fr||[]).includes(d.id))uiToast(`📨 ${mpName(d.id)} muốn kết bạn với bạn.`,'idea');}M2K.frIn=o;M2K.frLd=1;M2K.dirty=true;m2Badge();});
  sub(db.collection('mail').where('to','array-contains',uid).limit(100),s=>{const o={};for(const d of s.docs){if(d.id===uid)continue;const v=m2ValMail(d.id,d.data());if(v)o[d.id]=v;}const M=M2I(),ack=new Set(M2K.mailMe.ack);
    if(M2K.mailLd)for(const u in o)for(const m of o[u].list){if(m.to!==uid||ack.has(m.id)||M.mget[m.id])continue;const was=M2K.mailIn[u]&&M2K.mailIn[u].list.some(x=>x.id===m.id);if(!was)uiToast(`✉️ Thư mới từ ${mpName(u)}${m.it?' (kèm quà)':''}.`,'idea');}
    M2K.mailIn=o;M2K.mailLd=1;M2K.dirty=true;m2Badge();});
  sub(db.collection('deals').where('sel','array-contains',uid).limit(200),s=>{const L=[];for(const d of s.docs)L.push(...m2ValDeals(d.id,d.data()));M2K.dealsIn=L;m2Payout(L);});
  try{if(MP.room&&!M2K.emoUn)M2K.emoUn=MP.room.on('emo',m2EmoHear);}catch(e){}
  m2LbPush();}
function m2NetTick(){if(!m2Net())return;if(!M2K.net){m2NetStart();return;}if(MP.room&&!M2K.emoUn){try{M2K.emoUn=MP.room.on('emo',m2EmoHear);}catch(e){M2K.emoUn=()=>{};}}
  if(M2K.dealsIn&&M2K.dealsIn.length&&G.t-(M2K.payT||0)>3){M2K.payT=G.t;m2Payout(M2K.dealsIn);}if(G.t-(M2K.lbPT||0)>90){M2K.lbPT=G.t;m2LbPush();}}

/* ===================== 11. BẢNG "LÀNG" ===================== */
const M2TABS=[['day','📅','Hằng ngày'],['mail','✉️','Thư'],['mkt','⚖️','Chợ'],['fr','👥','Bạn bè'],['lb','🏆','Xếp hạng'],['nt','🔔','Tin'],['way','🧭','Đường']];
function m2Fill(keep){const p=$('#panel'),h=p&&p.querySelector('.p-head h2'),bd=p&&p.querySelector('.p-body');if(!h||!bd)return;const sc=keep?bd.scrollTop:0,t=G.m2tab||'day',T=M2TABS.find(x=>x[0]===t)||M2TABS[0];h.textContent=T[2];
  const fo=document.activeElement,keepV={};bd.querySelectorAll('input,textarea,select').forEach(i=>{if(i.id)keepV[i.id]=i.value;});
  const badge=k=>{const n=k==='mail'?m2MailNew():k==='nt'?m2Unread():k==='fr'&&m2Net()?Object.keys(M2K.frIn).filter(u=>m2FrState(u)==='in'&&!M2I().frNo[u]).length:k==='day'?m2DayDue():0;return n?`<em class="m2dot">${n>9?'9+':n}</em>`:'';};
  let body='';try{body=t==='mail'?m2MailHtml():t==='mkt'?m2MktHtml():t==='fr'?m2FrHtml():t==='lb'?m2LbHtml():t==='nt'?m2NtHtml():t==='way'?(typeof m3WayHtml==='function'?m3WayHtml():''):t==='respawn'?(typeof m3RespHtml==='function'?m3RespHtml():''):m2DayHtml();}catch(e){console.warn('làng',e);body='<p class="muted">Chưa mở được mục này.</p>';}
  bd.innerHTML=(t==='respawn'?'':`<div class="tabs m2tabs">${M2TABS.map(([k,i,n])=>`<button class="tb${t===k?' on':''}" data-a="m2tab" data-t="${k}">${i}<span> ${n}</span>${badge(k)}</button>`).join('')}</div>`)+body;
  if(keep){for(const id in keepV){const e=bd.querySelector('#'+id);if(e&&id!=='m2q')e.value=keepV[id];}if(fo&&fo.id){const e=bd.querySelector('#'+fo.id);if(e){e.focus();try{e.setSelectionRange(e.value.length,e.value.length);}catch(er){}}}}
  m2Names(bd);bd.scrollTop=sc;}
{const _uo=uiOpen;uiOpen=function(k,o,keep){if(k==='m2'){_uo(k,o,keep);m2Fill(keep);m2Badge();return;}return _uo(k,o,keep);};}
const m2DayDue=()=>{const D=S&&S.m2&&S.m2.dl;if(!D||!D.d)return 0;return (D.got!==D.d?1:0)+(D.tasks||[]).filter(T=>!T.ok&&m2TVal(T)>=T.n).length+(D.wk&&!D.wk.ok&&m2TVal(D.wk)>=D.wk.n?1:0);};
function m2Menu(){const m=$('#menu');if(!m||m.querySelector('[data-ui="m2"]'))return;const b=document.createElement('button');b.setAttribute('data-ui','m2');b.setAttribute('aria-label','Làng');b.innerHTML='<span>🏮</span><i>Làng</i><em class="m2dot" hidden></em>';
  const j=m.querySelector('[data-ui="journal"]');if(j&&j.parentNode)j.parentNode.insertBefore(b,j);else (m.querySelector('.ui5-more')||m).appendChild(b);const acts=$('.acts');if(acts&&!$('#m2emoBtn')){acts.insertAdjacentHTML('afterbegin','<button id="m2emoBtn" class="rbtn sm" aria-label="Cử chỉ">😊<i>Cử chỉ</i></button>');}}
function m2Badge(){const d=document.querySelector('#menu [data-ui="m2"] .m2dot');if(!d||!S)return;let n=0;try{n=m2Unread()+m2MailNew()+m2DayDue()+(m2Net()?Object.keys(M2K.frIn).filter(u=>m2FrState(u)==='in'&&!M2I().frNo[u]).length:0);}catch(e){}d.hidden=!n;d.textContent=n>9?'9+':n;}
// rung (điện thoại) và hiệu ứng khi nhận quà
function m2Vib(p){try{if(localStorage.getItem('ldtt-hap')==='0')return;if(navigator.vibrate)navigator.vibrate(p);}catch(e){}}
function m2Juice(){m2Vib([20,30,40]);try{puff(P.x,P.y+30,P.z,'#ffd27a',10);}catch(e){}}

/* ===================== 12. BẤM NÚT, NHỊP ===================== */
document.addEventListener('click',e=>{const t=e.target;if(t&&t.closest&&t.closest('#m2emoBtn')){e.stopImmediatePropagation();const el=$('#m2emo');m2Pop(!el||el.hidden);sfx('pick');return;}
  const a=t&&t.closest&&t.closest('[data-a^="m2"],[data-a^="m3"]');if(!a||!S||a.dataset.a==='m2hap')return;const d=a.dataset;e.stopImmediatePropagation();e.preventDefault();sfx('pick');
  switch(d.a){case 'm2tab':G.m2tab=d.t;G.m2pf=null;uiOpen('m2',{});break;case 'm2claim':m2Claim();break;case 'm2tk':m2TaskClaim(d.i);break;
    case 'm2ntf':G.m2ntf=d.v;m2Fill(true);break;case 'm2mail':G.m2tab='mail';G.m2pf=null;G.m2mail=d.v?{to:d.to||''}:null;uiOpen('m2',{});break;case 'm2send':m2MailSend();break;
    case 'm2mget':m2MailClaim(d.id);break;case 'm2mdel':{const M=M2I();M.sys=M.sys.filter(x=>x.id!==d.id);save();m2Fill(true);break;}
    case 'm2fadd':m2FrAdd(d.u);break;case 'm2fdel':m2FrDel(d.u);break;case 'm2fno':M2I().frNo[d.u]=1;save();m2Fill(true);m2Badge();break;
    case 'm2pf':G.m2tab='fr';G.m2pf=d.u||null;uiOpen('m2',{});break;case 'm2gift':{G.mptab='near';G.mpGiftTo=d.p;G.mpGs=null;uiOpen('clan',{});break;}
    case 'm2mt':G.m2mt=d.v;m2Fill(false);break;case 'm2post':m2MktPost();break;case 'm2mx':m2MktCancel(d.id);break;case 'm2mb':m2MktBuy(d.s,d.id);break;case 'm2mr':m2MktLoad().then(()=>m2Fill(true));break;
    case 'm2vb':m2VBuy(d.i);break;case 'm2vs':m2VSell(d.i);break;case 'm2lbt':G.m2lb=d.v;m2Fill(false);break;case 'm2lbr':M2K.lbT=0;m2Fill(true);break;
    case 'm2emo':m2Emo(d.e);break;case 'm2popx':m2Pop(false);break;
    default:if(typeof m3Click==='function')m3Click(d,a);}},true);
document.addEventListener('input',e=>{if(e.target&&e.target.id==='m2q'){G.m2q=e.target.value;clearTimeout(M2K.qT);M2K.qT=setTimeout(()=>m2Fill(true),350);}});
function m2Tick(){if(!G.on||!S)return;if(G.t-(M2K.halfT||0)<0.5)return;M2K.halfT=G.t;M2I();
  if(!M2K.started){M2K.started=1;m2NtLoad();m2Menu();m2Roll();m2Badge();}
  if(G.t-(M2K.rollT||0)>30){M2K.rollT=G.t;m2Roll();m2Badge();}
  try{m2NetTick();}catch(e){if(!M2K.err){M2K.err=1;console.warn('làng chung',e);}}
  if(G.panel==='m2'&&M2K.dirty&&G.t-M2K.uiT>1){const a=document.activeElement;if(!(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))){M2K.uiT=G.t;M2K.dirty=false;m2Fill(true);}}
  if(G.panel==='m2'&&G.t-(M2K.nmT||0)>2){M2K.nmT=G.t;m2Names($('#panel'));}
  if(G.t-(M2K.bT||0)>5){M2K.bT=G.t;m2Badge();}}
{const _at=ambTick;ambTick=function(dt){_at(dt);try{m2Tick();}catch(e){if(!M2K.err2){M2K.err2=1;console.warn('more2',e);}}};}
{const _sg=startGame;startGame=function(){M2K.started=0;M2K.net=false;M2K.nt=[];M2K.ntS=null;return _sg.apply(this,arguments);};}
// cài đặt: rung
{const _sh=settingsHtml;settingsHtml=function(){let on=true;try{on=localStorage.getItem('ldtt-hap')!=='0';}catch(e){}return _sh()+`<div class="set"><b>Rung khi bị đánh, lên cấp</b><span><button class="tb sm${on?' on':''}" data-a="m2hap" data-v="1">Bật</button><button class="tb sm${on?'':' on'}" data-a="m2hap" data-v="0">Tắt</button></span></div>`;};}
document.addEventListener('click',e=>{const a=e.target&&e.target.closest&&e.target.closest('[data-a="m2hap"]');if(!a)return;e.stopImmediatePropagation();try{localStorage.setItem('ldtt-hap',a.dataset.v);}catch(er){}if(a.dataset.v==='1')m2Vib(40);uiOpenRefresh();},true);

document.head.insertAdjacentHTML('beforeend',`<style>
#menu [data-ui="m2"]{position:relative}.m2dot{position:absolute;top:2px;right:3px;min-width:16px;height:16px;padding:0 4px;border-radius:9px;background:#e5532c;color:#fff;font:700 10px/16px system-ui;font-style:normal;text-align:center;box-sizing:border-box}
.m2tabs{flex-wrap:wrap;gap:4px}.m2tabs .tb{position:relative;padding:7px 9px}.m2tabs .tb .m2dot{top:-5px;right:-4px}@media (max-width:520px){.m2tabs .tb span{display:none}.m2tabs .tb{font-size:18px;min-width:42px}}
.m2list{display:flex;flex-direction:column;gap:6px}.m2nt{display:flex;justify-content:space-between;gap:8px;padding:7px 9px;border-radius:10px;background:rgba(0,0,0,.22);font-size:14px;border-left:3px solid rgba(255,255,255,.15)}.m2nt small{flex:none;opacity:.6}
.m2nt.good{border-left-color:#7ac46a}.m2nt.bad{border-left-color:#e5532c}.m2nt.gold,.m2nt.idea{border-left-color:#f2c55a}.m2nt.new{background:rgba(242,197,90,.12)}
.m2ev{display:flex;gap:10px;align-items:center;padding:10px 12px;border-radius:14px;background:linear-gradient(90deg,rgba(229,83,44,.25),rgba(242,197,90,.12));box-shadow:inset 0 0 0 1px rgba(242,197,90,.35)}.m2ev>span{font-size:30px}.m2ev p{margin:2px 0 0}
.m2cals{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin:6px 0 8px}.m2cal{display:flex;flex-direction:column;align-items:center;gap:2px;padding:5px 2px;border-radius:10px;background:rgba(0,0,0,.22);font-size:11px}.m2cal em{font-style:normal;font-weight:700}
.m2cal.cur{box-shadow:inset 0 0 0 2px #f2c55a;background:rgba(242,197,90,.15)}.m2cal.ok{opacity:.55}.m2cal .ic{width:28px;height:28px}
.m2task{display:flex;gap:9px;align-items:center;padding:8px 10px;border-radius:12px;background:rgba(0,0,0,.22);margin:5px 0}.m2task>div{flex:1;min-width:0}.m2task.done{opacity:.6}.m2ti{font-size:22px}.m2ok{color:#7ac46a;font-size:20px;font-weight:800}
.m2bar{display:block;height:6px;border-radius:4px;margin:4px 0;background:linear-gradient(90deg,#f2c55a var(--v),rgba(255,255,255,.12) 0)}
.m2mail{padding:9px 11px;border-radius:12px;background:rgba(0,0,0,.22)}.m2mail.new{box-shadow:inset 3px 0 0 #f2c55a}.m2mail p{margin:5px 0;overflow-wrap:anywhere}.m2mail .row{gap:6px;flex-wrap:wrap;align-items:center}
.m2f{display:flex;flex-direction:column;gap:3px;margin:6px 0;font-size:13px}.m2f select,.m2f input,.m2f textarea{font:inherit;font-size:15px;padding:9px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.3);color:inherit}
.m2r{margin-left:auto;display:flex;gap:5px;align-items:center}.m2on{color:#7ac46a;font-size:12px}.m2pf{margin:10px 0}
.m2deal{display:grid;grid-template-columns:1fr auto 1fr;gap:6px;align-items:center;padding:8px;border-radius:12px;background:rgba(0,0,0,.22);margin:6px 0}.m2dl{display:flex;align-items:center;gap:5px;min-width:0}.m2dl span{font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.m2ar{font-size:18px;opacity:.7}.m2dr{grid-column:1/-1;display:flex;gap:8px;align-items:center;flex-wrap:wrap}.m2dr .btn{margin-left:auto}.m2good{color:#7ac46a}.m2post{margin:8px 0;padding:8px 10px;border-radius:12px;background:rgba(0,0,0,.18)}.m2post summary{font-weight:700;cursor:pointer}
.m2val{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:4px}.m2val div{display:flex;align-items:center;gap:6px;padding:4px 6px;border-radius:8px;background:rgba(0,0,0,.2);font-size:13px}.m2val b{margin-left:auto}
.m2sell{display:flex;align-items:center;gap:8px;padding:5px 6px;border-bottom:1px solid rgba(255,255,255,.07)}.m2sell .btn{margin-left:auto}
.m2lb{display:flex;flex-direction:column;gap:3px}.m2lb>div{display:flex;gap:9px;align-items:center;padding:7px 9px;border-radius:10px;background:rgba(0,0,0,.2)}.m2lb>div.me{background:rgba(242,197,90,.18);box-shadow:inset 0 0 0 1px #f2c55a}.m2lb em{width:28px;text-align:center;font-style:normal;font-weight:800}.m2lb b{margin-left:auto}
.m2pop{position:absolute;z-index:8;right:max(10px,env(safe-area-inset-right));bottom:calc(150px + env(safe-area-inset-bottom));width:min(330px,calc(100vw - 32px));padding:10px 12px;border-radius:16px;background:var(--pn,#2a1d14);border:1px solid rgba(255,220,160,.3);box-shadow:0 10px 30px rgba(0,0,0,.5)}
.m2eg{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-top:6px}.m2eg button{display:flex;flex-direction:column;align-items:center;gap:1px;padding:6px 0;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.25);color:inherit}.m2eg span{font-size:24px}.m2eg i{font-style:normal;font-size:10px}
.m2eg *{pointer-events:none}body.mxphoto #m2emo{display:none!important}
</style>`);
