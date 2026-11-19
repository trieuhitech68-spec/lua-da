/* ===================== mokhoa: MỞ KHOÁ THEO CẤP · HỌC CHIÊU · DI TÍCH CỔ · QUẢN TRỊ MỞ HẾT =====================
   1. CẤP NHÂN VẬT tối đa 50, chia bốn giai đoạn; mỗi tính năng lớn mở ở một cấp (bảng MK). Chưa đủ cấp thì bấm vào sẽ báo "mở ở cấp N".
        Khởi đầu 1–9 · Lập làng 10–19 · Mở mang 20–34 · Xưng hùng 35–50 (từ cấp 35 đã mở hết, phần còn lại là mạnh lên).
      Lên cấp mà có tính năng mới thì báo. Xem cả lộ trình trong ☰ → 📈 Phát triển.
   2. CHIÊU CHIẾN ĐẤU PHẢI HỌC: đủ cấp rồi còn phải trả vật liệu (màn Nhân vật → Kỹ năng → Học). Chiêu cao cần Thẻ tre bí kíp, chỉ có trong di tích cổ.
   3. DI TÍCH CỔ: mỗi vùng có di tích (hiện trên bản đồ) là một toà thành có tường vòng, vào qua cổng. Bên trong ba lớp canh mạnh dần
      (lính cổ, vệ binh đồng, tướng giữ mộ); hạ hết mới mở rương: Cổ vật, Thẻ tre bí kíp, kim loại quý, báu vật riêng từng loại di tích.
      Tối đa 4 người trong thành. Lấy xong di tích phong ấn 20 giờ thật. Cần cấp 20.
   4. QUẢN TRỊ VIÊN (máy chủ xác nhận, xem admin.js): mọi khoá đều mở, chiêu coi như đã học, di tích không bị phong ấn; có thêm vài nút thử nhanh trong bảng Phát triển.
   Lưu: S.mkSeen (cấp đã báo) · S.knL {mã chiêu:1} · S.dt {mã di tích: mốc giờ lấy rương} · S.dtR {báu vật/di tích đã từng lấy} · S.hero.cv (điểm thuộc tính đổi từ cổ vật).
   Bài kiểm tra tự động đặt localStorage 'ldtt-kt'='1' để bỏ khoá (trừ bài kiểm tra riêng của phần này). */
const MKMAX=50;
const MK=[['thuan',3,'🐔','Thuần gà, lợn, dê, chó'],['dao',4,'⛏️','Đào hào, đào hố'],['cuonghoa',6,'🔨','Cường hoá trang bị'],['chienthu',6,'🐯','Thuần chiến thú (khỉ, gấu, hổ, báo)'],
  ['ngua',8,'🐎','Thuần và cưỡi ngựa'],['lanhtho',8,'🚩','Cắm mốc lãnh thổ'],['nghiencuu',10,'📜','Nghiên cứu'],['lienminh',10,'🏰','Lập liên minh'],['quan',12,'⚔️','Chiêu mộ lính'],
  ['tuong',15,'🎖️','Phong tướng'],['ham',18,'🕳️','Đào đường hầm xuyên đồi'],['ditich',20,'🏛️','Khám phá di tích cổ'],['voi',25,'🐘','Thuần voi, tượng binh'],['chientranh',28,'🔥','Tuyên chiến giữa các liên minh'],['full',35,'👑','Đã mở toàn bộ tính năng']];
const MKG=[[1,'Khởi đầu'],[10,'Lập làng'],[20,'Mở mang'],[35,'Xưng hùng']];
const mkTest=()=>{try{return localStorage.getItem('ldtt-kt')==='1';}catch(e){return false;}};
const mkAdmin=()=>{try{return typeof ADM==='object'&&ADM.admin===true;}catch(e){return false;}};
const mkFree=()=>mkAdmin()||mkTest();
function mkLv(k){const e=MK.find(x=>x[0]===k);return e?e[1]:1;}
/* nhiệm vụ hướng dẫn đang đòi đúng tính năng này thì cho dùng dù chưa đủ cấp (không để người chơi kẹt giữa chuỗi nhiệm vụ) */
const MKQ={thuan:/thuần|gà rừng|lợn rừng/i,ngua:/ngựa/i,chienthu:/khỉ|gấu|hổ|báo/i,dao:/đào hào|đào hố/i,cuonghoa:/cường hoá|đập đồ/i,lanhtho:/lãnh thổ|cắm mốc/i,nghiencuu:/nghiên cứu/i,lienminh:/liên minh|bộ tộc/i,quan:/chiêu mộ lính|trại lính/i,tuong:/phong tướng/i,voi:/voi/i};
function mkGoalNeeds(k){try{const g=typeof GOALS!=='undefined'&&S&&GOALS[S.goal],q=MKQ[k];return !!(g&&q&&q.test(String(g.t||'')+' '+String(g.d||'')));}catch(e){return false;}}
function mkOk(k){return mkFree()||(typeof heroLv==='function'?heroLv():1)>=mkLv(k)||mkGoalNeeds(k);}
function mkWhy(k){if(mkOk(k))return '';const e=MK.find(x=>x[0]===k);return `🔒 ${e[3]}: mở khi nhân vật đạt cấp ${e[1]} (đang cấp ${heroLv()}). Xem lộ trình trong ☰ → 📈 Phát triển.`;}
function mkStop(k){const w=mkWhy(k);if(w){uiToast(w,'bad');try{sfx('no');}catch(e){}return true;}return false;}
/* cấp tối đa 50 */
{const _hl=heroLv;heroLv=function(){return Math.min(MKMAX,_hl.apply(this,arguments));};}
/* gắn khoá vào các hàm bắt đầu tính năng */
{const gate=(name,key)=>{try{const f=(0,eval)(name);if(typeof f!=='function')return;window.__mkw=function(){const k=typeof key==='function'?key.apply(this,arguments):key;if(k&&mkStop(k))return;return f.apply(this,arguments);};(0,eval)(name+'=__mkw');}catch(e){}};
  gate('daoStart','dao');gate('daoTunStart','ham');gate('dpOpen','cuonghoa');gate('mpClaim','lanhtho');gate('ncStart','nghiencuu');gate('mpClanMake','lienminh');gate('qdRecruit','quan');gate('tgPromote','tuong');gate('pvpWarSet',function(oc,on){return on?'chientranh':null;});
  gate('tameFeed',function(a){const k=a&&a.kind;return k==='elephant'?'voi':k==='horse'?'ngua':(typeof LT_K==='object'&&LT_K[k])?'chienthu':'thuan';});try{delete window.__mkw;}catch(e){}}
/* báo khi lên cấp có tính năng mới */
setInterval(()=>{try{if(typeof G!=='object'||!G.on||!S||G.panel||mkTest())return;const lv=heroLv();if(S.mkSeen==null){S.mkSeen=lv;return;}if(lv<=S.mkSeen)return;const L=MK.filter(e=>e[1]>S.mkSeen&&e[1]<=lv);S.mkSeen=lv;if(L.length){uiToast('🔓 Cấp '+lv+': mở '+L.map(e=>e[2]+' '+e[3]).join(' · ')+'.','gold');try{sfx('level');}catch(e){}}const g=MKG.filter(x=>x[0]===lv)[0];if(g)uiToast('🏅 Bước sang giai đoạn «'+g[1]+'».','gold');save();}catch(e){}},4000);
function mkHtml(){const lv=heroLv(),gi=MKG.filter(g=>lv>=g[0]).length-1,nx=MK.find(e=>e[1]>lv);let h=`<div class="mk-box"><div class="mk-h"><b>🔓 Lộ trình mở khoá</b><span class="small">Cấp ${lv}/${MKMAX} · giai đoạn <b>${MKG[gi][1]}</b>${nx?` · sắp mở: ${nx[2]} ${esc(nx[3])} (cấp ${nx[1]})`:''}</span></div>`;
  MKG.forEach((g,i)=>{const hi=MKG[i+1]?MKG[i+1][0]-1:MKMAX,L=MK.filter(e=>e[1]>=g[0]&&e[1]<=hi);h+=`<div class="mk-g${i===gi?' cur':''}"><b>${g[1]} <small>cấp ${g[0]}–${hi}</small></b>${i===0?'<span class="mk-r ok">✓ Hái lượm, chế tạo, xây nhà, san nền, săn bắn, trồng trọt</span>':''}${L.map(e=>`<span class="mk-r${lv>=e[1]||mkAdmin()?' ok':''}">${lv>=e[1]||mkAdmin()?'✓':'🔒'} ${e[2]} ${esc(e[3])} <em>cấp ${e[1]}</em></span>`).join('')}</div>`;});
  if(mkAdmin())h+=`<div class="mk-adm"><b>🛠️ Quản trị: mọi khoá đang mở</b><div class="row"><button class="btn sm" data-mk="lv">+5 cấp</button><button class="btn sm" data-mk="mat">+ Vật liệu thử</button><button class="btn sm" data-mk="kn">Học hết chiêu</button><button class="btn sm" data-mk="dt">${DT.force?'Di tích: phong ấn như thường':'Di tích: bỏ phong ấn'}</button></div></div>`;return h+'</div>';}
if(typeof ptHtml==='function'){const _p=ptHtml;ptHtml=function(){let h=_p.apply(this,arguments);try{const i=h.lastIndexOf('</div>');h=h.slice(0,i)+mkHtml()+h.slice(i);}catch(e){}return h;};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-mk]');if(!b||!S||!mkAdmin())return;e.stopImmediatePropagation();const v=b.dataset.mk;
  if(v==='lv'){const t=heroLv()+5,need=30*(t-1)*(t-1)-heroXp(),ks=Object.keys(SKILL);if(need>0)for(const k of ks)S.sk[k]=(S.sk[k]||0)+Math.ceil(need/ks.length);uiToast('🛠️ Nhân vật lên cấp '+heroLv()+'.','gold');}
  else if(v==='mat'){for(const k of ['wood','stone','fiber','stick','plank','rope','meatCooked','hide','bone','flint','clay','bronze','iron','covat','bikip','buaho','vongdong','andong'])if(ITEMS[k])invAdd(k,k==='buaho'||k==='vongdong'||k==='andong'?1:k==='covat'||k==='bikip'?3:40);uiToast('🛠️ Đã thêm vật liệu thử vào túi.','');}
  else if(v==='kn'){S.knL=S.knL||{};for(const k of KNS)S.knL[k.id]=1;uiToast('🛠️ Đã học hết chiêu.','');}else if(v==='dt'){DT.force=!DT.force;uiToast(DT.force?'🛠️ Di tích không phong ấn.':'🛠️ Di tích phong ấn như thường.','');}
  try{save();uiHotbar();ptDraw();}catch(er){}},true);
/* ---------- 2. HỌC CHIÊU ---------- */
/* hai chiêu mới: Thủ thế (học bằng vật liệu thường) và Cuồng nộ (cần bí kíp + cổ vật từ di tích) */
try{if(!KNS.some(k=>k.id==='guard'))KNS.push({id:'guard',lv:12,ic:'🛡️',n:'Thủ thế',d:'5 giây chịu đòn nhẹ hơn một nửa.',st:15,cd:25,key:'KeyJ'},{id:'fury',lv:30,ic:'🔥',n:'Cuồng nộ',d:'8 giây đánh mạnh hơn 60%.',st:30,cd:60,key:'KeyK'});}catch(e){}
{const _ku=knUse;knUse=function(id){const c0=KN.cd[id]||0;const r=_ku.apply(this,arguments);try{if((KN.cd[id]||0)!==c0){if(id==='guard')KN.guard=G.t+5;else if(id==='fury')KN.fury=G.t+8;}}catch(e){}return r;};}
{const _hd=heroDef;heroDef=function(){let v=_hd.apply(this,arguments);try{if((KN.guard||0)>G.t)v=Math.min(0.92,v+(1-v)*0.5);}catch(e){}return v;};}
{const k=()=>(KN.fury||0)>G.t?1.6:1;const _ad=animalDamage;animalDamage=function(a,dmg){return _ad.call(this,a,dmg*k());};const _fd=foeDamage;foeDamage=function(f,dmg){return _fd.call(this,f,dmg*k());};}
const KNC={guard:{hide:4,bone:3},fury:{bikip:2,covat:1},pow:{meatCooked:3,stick:4},dash:{fiber:8,hide:1},rally:{meatCooked:6,hide:2},heal:{fiber:6,mugwort:2},roar:{bone:5,hide:4},spin:{bikip:1,bone:4}};
function knLearned(k){if(mkFree())return knLv()>=k.lv||mkAdmin();if(!S)return false;if(!S.knL||typeof S.knL!=='object'){/* nhân vật cũ: chiêu đã đủ cấp coi như đã học */S.knL={};for(const q of KNS)if(knLv()>=q.lv)S.knL[q.id]=1;}return !!S.knL[k.id];}
function knCost(k){const c=Object.assign({},KNC[k.id]||{meatCooked:4});for(const i in c)if(!ITEMS[i])delete c[i];return c;}
function knLearn(id){const k=KNS.find(x=>x.id===id);if(!k||!S)return;if(knLearned(k)){uiToast('Chiêu này bạn đã học rồi.','');return;}if(knLv()<k.lv){uiToast(`${k.n}: cần nhân vật cấp ${k.lv} mới học được.`,'bad');return;}const c=knCost(k);if(!canPay(c)){uiToast('Thiếu lễ vật học chiêu: '+Object.entries(c).map(([i,v])=>v+' '+ITEMS[i].n.toLowerCase()).join(', ')+(c.bikip?'. Thẻ tre bí kíp chỉ có trong di tích cổ.':'.'),'bad');try{sfx('no');}catch(e){}return;}
  pay(c);S.knL[k.id]=1;try{sfx('level');uiHotbar();cnt('cnt','knlearn');}catch(e){}uiToast(`${k.ic} Đã học chiêu ${k.n}. Dùng ở cụm nút bên phải (trang Kỹ năng).`,'gold');save();}
if(typeof heroHtml==='function'){const _hh=heroHtml;heroHtml=function(){let h=_hh.apply(this,arguments);try{if(mkFree())return h;const L=KNS.filter(k=>!knLearned(k));if(!L.length)return h;const rows=L.map(k=>{const c=knCost(k),okLv=knLv()>=k.lv;return `<div class="mk-kn"><span class="mk-ki">${k.ic}</span><div><b>${k.n}</b> <small>cấp ${k.lv}</small><div class="chips">${Object.entries(c).map(([i,v])=>`<span class="chip${haveCount(i)<v?' lack':''}">${icon(i)}${Math.min(haveCount(i),v)}/${v}</span>`).join('')}</div></div><button class="btn sm${okLv&&canPay(c)?'':' ghost'}" data-a="knlearn" data-k="${k.id}">${okLv?'Học':'🔒 cấp '+k.lv}</button></div>`;}).join('');
      const box=`<div class="mk-knb"><b>📖 Chiêu chưa học</b><span class="small muted">Đủ cấp rồi còn phải dâng lễ vật mới học được. Chiêu cao cần Thẻ tre bí kíp tìm trong di tích cổ.</span>${rows}</div>`;const i=h.indexOf('<h3>Chiêu thức');h=i>=0?h.slice(0,i)+box+h.slice(i):h;}catch(e){}return h;};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="knlearn"]');if(!b||!S)return;e.stopImmediatePropagation();knLearn(b.dataset.k);try{if(typeof H4==='object'&&H4.on)h4Draw(true);else if(G.panel)uiOpenRefresh();}catch(er){}},true);
/* ---------- 3. DI TÍCH CỔ ---------- */
try{Object.assign(ITEMS,{covat:{n:'Cổ vật',t:'res'},bikip:{n:'Thẻ tre bí kíp',t:'res'}});if(typeof EMO==='object')Object.assign(EMO,{covat:'🏺',bikip:'📜'});if(typeof M2V==='object')Object.assign(M2V,{covat:60,bikip:120});}catch(e){}
/* Di tích là một toà thành cổ có tường vòng (bán kính DT.RW). Ngoài tường không đi xuyên vào được: phải qua CỔNG.
   Vào trong: 3 lớp canh mạnh dần (lính cổ → vệ binh đồng → tướng giữ mộ). Hạ hết mới mở được rương ở giữa.
   Ra cổng giữa chừng (hoặc chết) thì lính canh hồi lại từ đầu. Lấy rương xong di tích PHONG ẤN DT.CD giờ thật rồi mới mở lại.
   Sức chứa: tối đa DT.CAP người trong thành cùng lúc. Mỗi loại di tích có một báu vật riêng (lần đầu hạ loại đó chắc chắn có). */
const DT={sites:[],objs:[],sc:null,force:false,RW:150,CD:20,CAP:4,in:null,
  T:[['Đền đá cổ','🏛️','buaho'],['Mộ thuyền cổ','⚱️','vongdong'],['Thành đất hoang','🏯','andong']],
  W:[['Lính cổ',3,l=>2+l/25,1.2,1],['Vệ binh đồng',2,l=>3.6+l/15,1.6,1.15],['Tướng giữ mộ',1,l=>12+l/5,2.2,1.45]]};
function dtPlan(){DT.sites=[];try{if(!S)return;const sd=((S.seed0||S.seed)|0),dl=!!S.dl,key=dl?S.land:'c',n=dl?(typeof dlHash==='function'&&dlHash(Math.round(S.dl.ox/100),Math.round(S.dl.oz/100),sd+71)<0.6?1:0):2,RW=DT.RW;
    const bad=(x,z)=>{if(typeof wIn==='function'&&!wIn(x,z,0.86))return true;const h0=hAt(x,z);if(wdAt(x,z)>0||h0<5||slopeAt(x,z)>0.22)return true;for(let q=0;q<10;q++){const a=q*0.628,px=x+Math.cos(a)*RW,pz=z+Math.sin(a)*RW,h=hAt(px,pz);if(wdAt(px,pz)>0||wdAt(x+Math.cos(a)*(RW+70),z+Math.sin(a)*(RW+70))>0||h<5||Math.abs(h-h0)>46)return true;}
      if(Math.hypot(x-SPAWN[0],z-SPAWN[1])<900)return true;try{if(G.camp&&Math.hypot(x-G.camp.x,z-G.camp.z)<700)return true;for(const b of (S.builds||[]))if(Math.hypot(x-b.x,z-b.z)<RW+90)return true;for(const r of (typeof REG!=='undefined'?REG:[]))if(r&&typeof r.x==='number'&&!/^ruin_/.test(r.id||'')&&Math.hypot(x-r.x,z-r.z)<(r.r||200)+RW)return true;}catch(e){}return false;};
    for(let i=0;i<n;i++){const hh=(a)=>{let x=(Math.imul(sd^(i*7919+a*104729+(dl?Math.round(S.dl.ox*3+S.dl.oz):0)),2654435761)>>>0);x^=x>>>15;x=Math.imul(x,2246822519)>>>0;return (x>>>0)/4294967296;},a0=hh(1)*6.283,r0=dl?1700+hh(2)*1500:2500+i*1500+hh(2)*500;let best=null;
      for(let k=0;k<90&&!best;k++){const a=a0+k*0.4,r=r0+(k%5)*120,x=(dl?0:SPAWN[0])+Math.cos(a)*r,z=(dl?0:SPAWN[1])+Math.sin(a)*r;if(bad(x,z))continue;if(DT.sites.some(o=>Math.hypot(o.x-x,o.z-z)<900))continue;best=[x,z];}
      if(best){const ty=Math.floor(hh(3)*DT.T.length),ga=Math.atan2(SPAWN[1]-best[1],SPAWN[0]-best[0]);DT.sites.push({id:key+':'+i,x:best[0],z:best[1],ty,ga,cx:Math.cos(ga),cz:Math.sin(ga)});}}}catch(e){console.warn('di tích',e);}}
/* phong ấn: S.dt[id] = mốc giờ thật lúc lấy rương (bản lưu cũ ghi chuỗi → coi như đã hết hạn) */
function dtCool(s){if(DT.force||mkAdmin())return 0;const t=S.dt&&S.dt[s.id];if(typeof t!=='number')return 0;return Math.max(0,t+DT.CD*3600000-Date.now());}
const dtHM=ms=>{const m=Math.ceil(ms/60000),h=Math.floor(m/60);return h?h+' giờ '+(m%60)+' phút':m+' phút';};
function dtModel(s){const T=THREE,g=new T.Group(),st=new T.MeshLambertMaterial({color:0x8d8a80}),dk=new T.MeshLambertMaterial({color:0x5f5c55}),ms=new T.MeshLambertMaterial({color:0x5f7a45}),ea=new T.MeshLambertMaterial({color:0x7d6a50}),RW=DT.RW,y0=hAt(s.x,s.z),N=34;
  /* tường vòng: từng đoạn bám theo mặt đất, chừa cổng ở hướng s.ga */
  for(let i=1;i<N;i++){const a=s.ga+i/N*6.283,px=Math.cos(a)*RW,pz=Math.sin(a)*RW,hy=hAt(s.x+px,s.z+pz)-y0,h=44+((i*29)%13),w=new T.Mesh(new T.BoxGeometry(14,h+24,RW*6.283/N+3),i%4===1?ea:i%3?st:dk);w.position.set(px,hy+h/2-12,pz);w.rotation.y=-a;g.add(w);
    if(i%3===0){const c=new T.Mesh(new T.BoxGeometry(18,7,12),dk);c.position.set(px,hy+h+3,pz);c.rotation.y=-a;g.add(c);}else if(i%3===1){const m=new T.Mesh(new T.SphereGeometry(9,8,6),ms);m.scale.y=0.4;m.position.set(px,hy+h,pz);g.add(m);}}
  /* cổng: hai trụ lớn + xà ngang + bậc đá */
  {const gx=Math.cos(s.ga)*RW,gz=Math.sin(s.ga)*RW,hy=hAt(s.x+gx,s.z+gz)-y0,tx=-Math.sin(s.ga),tz=Math.cos(s.ga);for(const k of [-1,1]){const p=new T.Mesh(new T.CylinderGeometry(9,11,92,8),dk);p.position.set(gx+tx*k*19,hy+34,gz+tz*k*19);g.add(p);const c=new T.Mesh(new T.BoxGeometry(24,8,24),st);c.position.set(gx+tx*k*19,hy+82,gz+tz*k*19);g.add(c);}
    const l=new T.Mesh(new T.BoxGeometry(16,12,62),st);l.position.set(gx,hy+70,gz);l.rotation.y=-s.ga;g.add(l);const sg=new T.Mesh(new T.BoxGeometry(5,16,22),new T.MeshLambertMaterial({color:0xc9a23a}));sg.position.set(gx+Math.cos(s.ga)*9,hy+70,gz+Math.sin(s.ga)*9);sg.rotation.y=-s.ga;g.add(sg);
    const sl=new T.Mesh(new T.BoxGeometry(40,5,30),st);sl.position.set(gx,hy+0.5,gz);sl.rotation.y=-s.ga;g.add(sl);
    /* phiến đá phong ấn chắn cổng: chỉ hiện khi di tích đang đóng */
    const seal=new T.Mesh(new T.BoxGeometry(9,58,28),new T.MeshLambertMaterial({color:0x4a4a52}));seal.position.set(gx,hy+28,gz);seal.rotation.y=-s.ga;g.add(seal);g.userData.seal=seal;}
  for(let i=0;i<7;i++){const a=i/7*6.283,h=34+((i*37)%19),p=new T.Mesh(new T.CylinderGeometry(5,6.2,h,7),i%3?st:dk);p.position.set(Math.cos(a)*62,h/2-1,Math.sin(a)*62);p.rotation.z=((i*13)%7-3)*0.03;g.add(p);if(i%2===0){const c=new T.Mesh(new T.BoxGeometry(15,5,15),dk);c.position.set(Math.cos(a)*62,h+1.5,Math.sin(a)*62);g.add(c);}else{const m=new T.Mesh(new T.SphereGeometry(5.6,8,6),ms);m.scale.y=0.45;m.position.set(Math.cos(a)*62,h,Math.sin(a)*62);g.add(m);}}
  for(let i=0;i<3;i++){const b=new T.Mesh(new T.BoxGeometry(46-i*10,5,46-i*10),i===2?dk:st);b.position.y=2.5+i*5;g.add(b);}const ch=new T.Mesh(new T.BoxGeometry(15,10,10),new T.MeshLambertMaterial({color:0x7a5230}));ch.position.y=20;g.add(ch);const lid=new T.Mesh(new T.BoxGeometry(16,3,11),new T.MeshLambertMaterial({color:0xc9a23a}));lid.position.y=26.5;g.add(lid);
  for(let i=0;i<5;i++){const a=i*1.31+0.4,r=30+i*9,b=new T.Mesh(new T.BoxGeometry(12,7,9),i%2?st:dk);b.position.set(Math.cos(a)*r,2.5,Math.sin(a)*r);b.rotation.set(0.2*i,a,0.3);g.add(b);}g.traverse(m=>{if(m.isMesh)m.castShadow=true;});return g;}
function dtObjs(){try{if(!G.sc||!G.terrain||!S)return;if(DT.sc!==G.sc||DT.key!==(S.land||'c')+':'+(S.seed|0)){DT.objs=[];DT.sc=G.sc;DT.key=(S.land||'c')+':'+(S.seed|0);DT.in=null;dtPlan();for(const s of DT.sites){const o=dtModel(s);o.position.set(s.x,hAt(s.x,s.z)-0.5,s.z);G.sc.add(o);try{seasonPatchAll(o);}catch(e){}DT.objs.push(o);s.o=o;
        try{if(typeof REG!=='undefined'&&!REG.some(r=>r.id==='ruin_'+s.id))REG.push({id:'ruin_'+s.id,n:DT.T[s.ty][0],d:'Di tích cổ có tường thành bao quanh: vào qua cổng, bên trong có ba lớp canh giữ mạnh dần. Hạ hết mới mở được rương báu. Lấy xong di tích phong ấn '+DT.CD+' giờ. Cần cấp 20, nên đem theo lính và chiến thú.',ic:DT.T[s.ty][1],x:s.x,z:s.z,r:DT.RW+40});}catch(e){}}}
    for(const s of DT.sites)if(s.o&&s.o.userData.seal)s.o.userData.seal.visible=dtCool(s)>0;}catch(e){}}
setInterval(()=>{try{if(typeof G==='object'&&G.on)dtObjs();}catch(e){}},2000);
const dtGate=(s,k)=>[s.x+s.cx*(DT.RW+k),s.z+s.cz*(DT.RW+k)];
const dtAlive=s=>(G.foes||[]).filter(f=>f.ruin===s.id&&f.alive).length;
const dtCrowd=s=>{let n=0;try{if(typeof MP==='object'&&MP.rp)for(const r of MP.rp.values())if(r.ok!==false&&Math.hypot(r.x-s.x,r.z-s.z)<DT.RW)n++;}catch(e){}return n;};
function dtWave(s,w){const W=DT.W[w],lv=heroLv(),n=W[1];for(let i=0;i<n;i++){const a=s.ga+3.1416+(i-(n-1)/2)*0.5,r=w===2?20:70;try{const f=foeSpawn(s.x+Math.cos(a)*r,s.z+Math.sin(a)*r,'guard');if(f){f.ruin=s.id;f.n=W[0];f.hp=Math.round(FOE.hp*W[2](lv));f.dk=W[3];f._lvA=1;f.lv=1;f.state='chase';if(W[4]!==1&&f.o)f.o.scale.multiplyScalar(W[4]);if(w===2)f.boss=1;}}catch(e){}}
  DT.in.w=w;DT.in.nt=0;uiToast(w===0?`🏛️ Cổng đá khép lại sau lưng. ${n} lính cổ trỗi dậy!`:w===1?`🛡️ Lớp thứ hai: ${n} vệ binh đồng bước ra từ hàng cột!`:'👑 Tướng giữ mộ thức giấc. Hạ được hắn mới mở được rương!','bad');try{sfx('roar');}catch(e){}}
function dtLeave(msg){const I=DT.in;if(!I)return;DT.in=null;for(const f of (G.foes||[]))if(f.ruin===I.id){f.alive=false;f.gone=1;try{G.sc.remove(f.o);}catch(e){}}if(msg)uiToast(msg,'');}
function dtEnter(s){if(mkStop('ditich'))return;const cd=dtCool(s);if(cd>0){uiToast('🏛️ '+DT.T[s.ty][0]+' đang phong ấn. Mở lại sau '+dtHM(cd)+'.','');return;}if(G.ride){uiToast('Xuống thú cưỡi rồi mới vào được cổng di tích.','bad');return;}
  if(dtCrowd(s)>=DT.CAP){uiToast('Trong di tích đã đủ '+DT.CAP+' người. Đợi có người ra rồi vào.','bad');return;}
  const p=dtGate(s,-36);P.x=p[0];P.z=p[1];P.y=hAt(P.x,P.z);DT.in={id:s.id,w:-1,nt:0,done:false};dtWave(s,0);}
/* mỗi khung hình: tường chắn, đợt canh kế tiếp, lính canh không ra khỏi thành */
function dtTick(dt){if(!S||!DT.sites.length||!G.on)return;const RW=DT.RW,I=DT.in;
  for(const s of DT.sites){const dx=P.x-s.x,dz=P.z-s.z,d=Math.hypot(dx,dz)||1;if(I&&I.id===s.id){
      if(d>RW+80||G.dying){dtLeave('');continue;}if(G.ride){const p=dtGate(s,24);P.x=p[0];P.z=p[1];dtLeave('Thú cưỡi không ở trong di tích được: bạn bị đẩy ra cổng, lính canh hồi lại.');continue;}
      if(d>RW-13){P.x=s.x+dx/d*(RW-13);P.z=s.z+dz/d*(RW-13);}
      for(const f of G.foes||[])if(f.ruin===s.id&&f.alive){const fx=f.x-s.x,fz=f.z-s.z,fd=Math.hypot(fx,fz);if(fd>RW-18){f.x=s.x+fx/fd*(RW-18);f.z=s.z+fz/fd*(RW-18);}}
      if(!I.done&&!dtAlive(s)){I.nt+=dt;if(I.nt>2.2){if(I.w<DT.W.length-1)dtWave(s,I.w+1);else{I.done=true;uiToast('🏺 Di tích lặng im. Rương cổ ở giữa thành đã mở được.','gold');try{sfx('level');}catch(e){}}}}
    }else if(d<RW+11){P.x=s.x+dx/d*(RW+11);P.z=s.z+dz/d*(RW+11);}}}
{const _ft=foesTick;foesTick=function(dt){try{dtTick(dt);}catch(e){}return _ft.apply(this,arguments);};}
{const _fh=foeHit;foeHit=function(f,t){if(!f||!f.dk)return _fh.apply(this,arguments);const old=FOE.dmg;FOE.dmg=old*f.dk;try{return _fh.apply(this,arguments);}finally{FOE.dmg=old;}};}
{const _fd=foeDamage;foeDamage=function(f){const was=f&&f.alive&&f.ruin;const r=_fd.apply(this,arguments);try{if(was&&!f.alive){addXp('hunt',f.boss?40:10);if(f.boss)uiToast('👑 Tướng giữ mộ gục xuống!','gold');}}catch(e){}return r;};}
function dtNear(){const I=DT.in;for(const s of DT.sites){if(I&&I.id===s.id){const dc=Math.hypot(s.x-P.x,s.z-P.z),g=dtGate(s,-36),dg=Math.hypot(g[0]-P.x,g[1]-P.z);if(dc<56)return {type:'ruin',part:'chest',s,d:dc,b:{x:s.x,y:hAt(s.x,s.z)+34,z:s.z}};if(dg<44)return {type:'ruin',part:'exit',s,d:dg,b:{x:g[0],y:hAt(g[0],g[1])+30,z:g[1]}};}
    else{const g=dtGate(s,14),dg=Math.hypot(g[0]-P.x,g[1]-P.z);if(dg<62)return {type:'ruin',part:'gate',s,d:dg,b:{x:g[0],y:hAt(g[0],g[1])+40,z:g[1]}};}}return null;}
{const _ft=findTarget;findTarget=function(){const r=_ft.apply(this,arguments);try{if(!S||!DT.sites.length||G.work||G.sit||G.build)return r;if(r&&(r.type==='animal'||r.type==='foe'||r.type==='npc'||r.type==='drop'))return r;const g=dtNear();if(g&&(!r||g.d<58))return g;}catch(e){}return r;};}
{const _ti=targetInfo;targetInfo=function(t){if(t&&t.type==='ruin'){const s=t.s,T=DT.T[s.ty],I=DT.in,lock=!mkOk('ditich');let verb,ok=false,need=null;
    if(t.part==='exit'){verb=I&&I.done?'Ra khỏi di tích':'Rút ra cổng (lính canh sẽ hồi lại)';ok=true;}
    else if(t.part==='chest'){const al=dtAlive(s);if(I&&I.done){verb='Mở rương cổ';ok=true;}else{verb=al?'Hạ hết '+DT.W[Math.max(0,I?I.w:0)][0].toLowerCase()+' ('+al+')':'Lớp canh kế tiếp sắp ra…';need='Phải hạ đủ ba lớp canh: lính cổ, vệ binh đồng, tướng giữ mộ.';}}
    else if(lock){verb='🔒 Cần cấp '+mkLv('ditich');need='Di tích cổ mở cho nhân vật từ cấp '+mkLv('ditich');}
    else{const cd=dtCool(s);if(cd>0){verb='Đang phong ấn · còn '+dtHM(cd);need='Lấy rương xong, di tích phong ấn '+DT.CD+' giờ rồi mới mở lại.';}else{verb='Vào di tích';ok=true;need='Bên trong có ba lớp canh giữ rất mạnh. Nên đem theo lính, chiến thú và thuốc.';}}
    return {name:T[1]+' '+T[0],verb,ok,need,icon:'torch'};}return _ti.apply(this,arguments);};}
function dtLoot(s){const first=!S.dtN,T=DT.T[s.ty];S.dtR=S.dtR||{};const got={covat:2+(Math.random()<0.4?1:0)};if(first||!S.dtR['s'+s.id]||Math.random()<0.5)got.bikip=1;
  const R=[['jade',2],['gold',2],['bronze',3],['iron',2]].filter(e=>ITEMS[e[0]]);if(R.length){const e=R[Math.floor(Math.random()*R.length)];got[e[0]]=e[1];}
  /* báu vật riêng của loại di tích: lần đầu hạ loại này chắc chắn có, về sau 12% */
  const rare=T[2];if(ITEMS[rare]&&(!S.dtR[rare]||Math.random()<0.12)){got[rare]=1;S.dtR[rare]=1;}S.dtR['s'+s.id]=1;return got;}
{const _as=actStart;actStart=function(t){if(t&&t.type==='ruin'&&!G.work){const s=t.s,I=DT.in;
    if(t.part==='gate'){dtEnter(s);return;}
    if(t.part==='exit'){const p=dtGate(s,24);P.x=p[0];P.z=p[1];P.y=hAt(P.x,P.z);dtLeave(I&&I.done?'':'Bạn rút khỏi di tích. Lính canh cổ trở về chỗ cũ.');return;}
    if(!I||I.id!==s.id)return;if(!I.done){const al=dtAlive(s);uiToast(al?'Còn '+al+' kẻ canh giữ. Hạ hết ba lớp canh đã.':'Lớp canh kế tiếp sắp ra…','bad');return;}
    const got=dtLoot(s);S.dt=S.dt||{};S.dt[s.id]=Date.now();S.dtN=(S.dtN||0)+1;give(got,[s.x,hAt(s.x,s.z)+26,s.z]);try{sfx('level');addXp('hunt',30);cnt('cnt','ruin');}catch(e){}
    uiToast('🏺 Mở rương cổ: '+Object.entries(got).map(([k,v])=>v+' '+ITEMS[k].n.toLowerCase()).join(', ')+'. Di tích phong ấn lại '+DT.CD+' giờ.','gold');const p=dtGate(s,24);P.x=p[0];P.z=p[1];P.y=hAt(P.x,P.z);dtLeave('');try{dtObjs();}catch(e){}save();return;}return _as.apply(this,arguments);};}
/* BÁU VẬT CỔ chỉ có trong rương di tích, mỗi loại di tích một món (lần đầu hạ loại đó chắc chắn có, về sau 12%): đeo vào có tác dụng thật.
     Bùa hộ mệnh cổ (cổ): chịu đòn nhẹ hơn 6% · Vòng đồng cổ (tay): đánh mạnh hơn 8% · Ấn đồng cổ (tay): kinh nghiệm +10% */
try{Object.assign(ITEMS,{buaho:{n:'Bùa hộ mệnh cổ',t:'wear',warm:0,slot:'neck',rare:1,ds:'Miếng ngọc khắc hình chim Lạc, báu vật của Đền đá cổ. Đeo vào chịu đòn nhẹ hơn 6%.'},vongdong:{n:'Vòng đồng cổ',t:'wear',warm:0,slot:'acc',rare:1,ds:'Vòng tay đồng thau chạm sóng nước, báu vật của Mộ thuyền cổ. Đeo vào đánh mạnh hơn 8%.'},andong:{n:'Ấn đồng cổ',t:'wear',warm:0,slot:'acc',rare:1,ds:'Chiếc ấn đồng của thủ lĩnh xưa, báu vật của Thành đất hoang. Đeo vào học nhanh hơn: kinh nghiệm nhận thêm 10%.'}});
  if(typeof EMO==='object')Object.assign(EMO,{buaho:'🧿',vongdong:'⭕',andong:'🔱'});if(typeof M2V==='object')Object.assign(M2V,{buaho:200,vongdong:200,andong:200});if(typeof WEAR_NECK==='object')WEAR_NECK.buaho=['#2f7a5a',2];}catch(e){}
const dtWorn=id=>{try{const w=S&&S.wear;if(!w)return false;for(const k in w){const v=w[k];if(v===id||(v&&v.id===id))return true;}}catch(e){}return false;};
{const _hd=heroDef;heroDef=function(){let v=_hd.apply(this,arguments);try{if(dtWorn('buaho'))v=Math.min(0.85,v+0.06);}catch(e){}return v;};}
{const k=()=>dtWorn('vongdong')?1.08:1;const _ad=animalDamage;animalDamage=function(a,dmg){return _ad.call(this,a,dmg*k());};const _fd=foeDamage;foeDamage=function(f,dmg){return _fd.call(this,f,dmg*k());};}
{const _ax=addXp;addXp=function(k,n){try{if(n>0&&dtWorn('andong'))n=n*1.1;}catch(e){}return _ax.call(this,k,n);};}
if(typeof nvmQ==='function'){const _q=nvmQ;nvmQ=function(id){try{if(ITEMS[id]&&ITEMS[id].rare)return 4;}catch(e){}return _q.apply(this,arguments);};}
/* cổ vật → điểm thuộc tính */
{const _hp=heroPts;heroPts=function(){let v=_hp.apply(this,arguments);try{v+=(heroS().cv|0);}catch(e){}return v;};}
function dtOffer(){const h=heroS();if((h.cv|0)>=12){uiToast('Đã đổi đủ 12 điểm từ cổ vật.','');return;}if(invCount('covat')<3){uiToast('Cần 3 cổ vật (lấy trong di tích cổ).','bad');return;}invTake('covat',3);h.cv=(h.cv|0)+1;try{sfx('level');}catch(e){}uiToast('🏺 Dâng 3 cổ vật: +1 điểm thuộc tính.','gold');save();}
if(typeof heroHtml==='function'){const _hh=heroHtml;heroHtml=function(){let h=_hh.apply(this,arguments);try{if(G.h3tab==='at'&&ITEMS.covat&&(invCount('covat')>0||(heroS().cv|0)>0)){const b=`<div class="mk-knb"><b>🏺 Cổ vật: ${invCount('covat')}</b><span class="small muted">3 cổ vật đổi 1 điểm thuộc tính (đã đổi ${heroS().cv|0}/12).</span><button class="btn sm${invCount('covat')>=3?'':' ghost'}" data-a="dtoffer">Dâng 3 cổ vật</button></div>`;const i=h.indexOf('<div class="h2-ats">');if(i>=0)h=h.slice(0,i)+b+h.slice(i);}}catch(e){}return h;};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="dtoffer"]');if(!b||!S)return;e.stopImmediatePropagation();dtOffer();try{if(typeof H4==='object'&&H4.on)h4Draw(true);else if(G.panel)uiOpenRefresh();}catch(er){}},true);
{const st=document.createElement('style');st.textContent=`.mk-box{margin-top:10px;padding:10px;border-radius:14px;border:1px solid rgba(255,210,122,.35);background:rgba(30,24,18,.6);display:flex;flex-direction:column;gap:8px}.mk-h{display:flex;flex-direction:column;gap:2px}
.mk-g{display:flex;flex-direction:column;gap:3px;padding:8px 10px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}.mk-g.cur{border-color:#f2c55a;background:rgba(242,197,90,.1)}.mk-g>b{font-size:13.5px;color:#ffe2a8}.mk-g>b small{font-weight:600;opacity:.75;margin-left:6px}
.mk-r{font-size:12.5px;opacity:.7;display:flex;gap:6px;align-items:baseline}.mk-r.ok{opacity:1;color:#bfe59a}.mk-r em{margin-left:auto;font-style:normal;font-size:11px;opacity:.8;white-space:nowrap}.mk-adm{padding:8px 10px;border-radius:12px;border:1px dashed #f2c55a;display:flex;flex-direction:column;gap:6px}.mk-adm .row{flex-wrap:wrap;gap:6px}
.mk-knb{display:flex;flex-direction:column;gap:6px;margin:6px 0 10px;padding:10px;border-radius:14px;border:1px solid rgba(255,210,122,.4);background:rgba(60,48,34,.45)}.mk-kn{display:flex;align-items:center;gap:8px}.mk-kn>div{flex:1;min-width:0}.mk-ki{font-size:22px}.mk-kn .chips{display:flex;flex-wrap:wrap;gap:4px;margin-top:3px}`;document.head.appendChild(st);}
if(typeof HD_L!=='undefined')HD_L.push({id:'mokhoa',ic:'🔓',t:'Mở khoá theo cấp',w:()=>typeof heroLv==='function'&&heroLv()>=2&&!mkTest(),p:['Nhân vật lên tới <b>cấp 50</b>, qua bốn giai đoạn: Khởi đầu, Lập làng, Mở mang, Xưng hùng. Mỗi tính năng lớn <b>mở ở một cấp</b>: thuần thú cấp 3, đào hào cấp 4, ngựa cấp 8, nghiên cứu và liên minh cấp 10, lính cấp 12, tướng cấp 15, di tích cổ cấp 20, voi cấp 25… tới cấp 35 là mở hết.','Xem cả lộ trình trong <b>☰ → 📈 Phát triển</b>. <b>Chiêu chiến đấu phải học</b>: đủ cấp rồi vào Nhân vật → Kỹ năng, dâng lễ vật để học.','<b>Di tích cổ</b> hiện trên bản đồ, chỉ mở vào vài khung giờ mỗi ngày. Hạ lính canh, mở rương lấy <b>cổ vật</b> (3 cái đổi 1 điểm thuộc tính) và <b>thẻ tre bí kíp</b> để học chiêu cao.']});
/* ---------- GIA CỐ BẢO MẬT ----------
   Bảng ITEMS được dùng làm "danh sách món hợp lệ" khi nhận mã món từ người chơi khác (thư, chợ, tặng quà). Đối tượng thường thì ITEMS['constructor'], ITEMS['toString']… vẫn "có",
   nên một mã giả kiểu đó lọt qua kiểm tra. Bỏ nguyên mẫu của bảng: chỉ còn đúng các món có thật. */
try{Object.setPrototypeOf(ITEMS,null);}catch(e){}
/* ---------- KHOÁ CẤP CHO TỪNG LOẠI NHÀ (Quy hoạch làng) ----------
   Nhà nhỏ, chuồng trại mở sớm; nhà nghề, nhà quân sự, nhà lớn phải lên cấp mới cắm mốc được. Chỉ khoá nút người chơi tự bấm (Cắm mốc / Tự dựng);
   nhiệm vụ hướng dẫn tự dựng thì không bị chặn. Không ghi trong bảng = mở từ đầu. */
const MKH={qh_xuong:2,qh_bep:2,qh_chuong:3,qh_ga:3,qh_chinh:4,qh_lon:4,qh_kho:5,qh_san:6,qh_de:6,qh_san_gieng:6,qh_gom:7,qh_vit:7,qh_det:8,qh_khothoc:8,qh_chuongthu:8,qh_benca:9,
  qh_nghien:10,qh_gac:10,qh_trau:10,qh_sanla:10,qh_linh:12,qh_dai:12,qh_go:12,qh_bondoc:12,qh_cho:14,qh_tho:14,qh_vukhi:14,qh_cau:15,qh_truongban:16,qh_chuongngua:16,qh_chihuy:18,qh_da:20,qh_santhuyen:22,qh_thuyen:28};
function mkHouseOk(id){const n=MKH[id]|0;if(!n||mkFree()||heroLv()>=n)return true;try{const q=QH.find(x=>x.id===id),g=typeof GOALS!=='undefined'&&S&&GOALS[S.goal];if(q&&g&&String(g.t||'').toLowerCase().includes(String(q.n).toLowerCase().split(' · ')[0]))return true;}catch(e){}return false;}
{const gate=name=>{try{const f=(0,eval)(name);if(typeof f!=='function')return;window.__mkh=function(id){/* Tự làm đang dựng đúng căn này theo nhiệm vụ thì không chặn (nút Tự dựng do người bấm đã bị chặn từ trước) */let auto=false;try{auto=name==='qhBegin'&&typeof AQ==='object'&&AQ.on&&AQ.jobs.some(j=>j.k==='qh'&&j.id===id);}catch(e){}if(!auto&&!mkHouseOk(id)){const q=QH.find(x=>x.id===id);uiToast(`🔒 ${q?q.n:'Nhà này'}: mở khi nhân vật đạt cấp ${MKH[id]} (đang cấp ${heroLv()}).`,'bad');try{sfx('no');}catch(e){}return;}return f.apply(this,arguments);};(0,eval)(name+'=__mkh');}catch(e){}};gate('qhBegin');gate('qhAuto');try{delete window.__mkh;}catch(e){}}
if(typeof qhHtml==='function'){const _q=qhHtml;qhHtml=function(){let h=_q.apply(this,arguments);try{if(mkFree())return h;for(const id in MKH){if(mkHouseOk(id))continue;const a=`<div class="row"><button class="btn sm" data-a="qhgo" data-k="${id}">`,b=`<div class="row"><button class="btn sm ghost" data-a="qhgo" data-k="${id}">`;const tag=`<span class="small warn">🔒 Mở ở cấp ${MKH[id]}</span>`;if(h.includes(a))h=h.replace(a,tag+b);else if(h.includes(b))h=h.replace(b,tag+b);}}catch(e){}return h;};}
/* lộ trình: ghi thêm các mốc nhà tiêu biểu */
try{for(const e of [['nha1',4,'🏠','Nhà chính, chuồng lợn'],['nha2',5,'📦','Nhà kho'],['nha3',8,'🧵','Nhà dệt, kho thóc, chuồng thú chiến'],['nha4',12,'⚔️','Trại lính, nhà dài, nhà gỗ súc'],['nha5',14,'🗡️','Kho vũ khí, chợ phiên, đền thờ'],['nha6',18,'🚩','Nhà chỉ huy'],['nha7',20,'🪨','Nhà đá'],['nha8',28,'⛵','Nhà mái thuyền']])if(!MK.some(x=>x[0]===e[0]))MK.push(e);MK.sort((a,b)=>a[1]-b[1]||(a[0]==='full'?1:0)-(b[0]==='full'?1:0));}catch(e){}
