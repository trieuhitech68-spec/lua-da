/* ===================== NHIỀU VÙNG ĐẤT (phần 2): CỔNG · ĐI LẠI · LƯU RIÊNG TỪNG VÙNG · TÀI NGUYÊN, THÚ THEO VÙNG =====================
   - Mỗi vùng giữ riêng: công trình, kho, ruộng, vật nuôi, người nhà, bản đồ đã khám phá, điểm tài nguyên đã chiếm, nền đã san (S.lands[mã]).
     Đi theo người: túi đồ, đồ mặc, cấp, kỹ năng, nhiệm vụ.
   - Qua cổng: cất dữ liệu vùng đang ở, nạp dữ liệu vùng kia, lưu rồi tải lại trang và vào thẳng game ở cổng bên kia (mất vài giây).
   - Thế giới chung: người chơi, liên minh, chợ, xếp hạng dùng chung cả ba vùng (theo hạt giống gốc của máy chủ); nhìn thấy nhau và công trình của nhau
     theo từng vùng. Vùng xa là đất tranh chấp: không cắm mốc, không bảo hộ khi vắng; cướp phá và tranh điểm tài nguyên như vùng trung tâm. */
const LD_KEYS=['builds','res','store','crops','fuel','tank','disc','fogm','mark','flat','rlm','war','folk','pets','plants','boats','recruited','khu','ho','b3'];
const LD_DEF={builds:()=>[],res:()=>({}),store:()=>({}),crops:()=>({}),fuel:()=>({}),tank:()=>({}),disc:()=>({}),fogm:()=>null,mark:()=>null,flat:()=>[],folk:()=>[],pets:()=>[],recruited:()=>({})};
function landInit(){if(!S)return;if(!S.seed0){S.seed0=S.seed;S.land='c';}if(!S.lands||typeof S.lands!=='object')S.lands={};if(S.land==='c'&&S.wv0==null)S.wv0=S.wv;}
function landWhy(to){const T=LANDS.find(L=>L.id===to);if(!T)return 'Cổng hỏng.';if((typeof heroLv==='function'?heroLv():1)<T.need)return `Cần nhân vật cấp ${T.need} mới qua được cổng sang ${T.n}.`;if(G.ride)return 'Xuống thuyền, xuống thú cưỡi trước đã.';if(G.work||G.build)return 'Đang làm dở việc.';return null;}
function landGo(to){landInit();const why=landWhy(to);if(why){uiToast(why,'bad');sfx('no');return;}const from=S.land,T=LANDS.find(L=>L.id===to);
  const keep={};for(const k of LD_KEYS){if(S[k]!==undefined)keep[k]=S[k];}S.lands[from]=keep;const nx=S.lands[to]||{};
  for(const k of LD_KEYS){if(nx[k]!==undefined)S[k]=nx[k];else if(LD_DEF[k])S[k]=LD_DEF[k]();else delete S[k];}delete S.lands[to];
  G.ldLeaving=1;/* trang cũ không được tự đặt người / lưu đè nữa */S.land=to;S.seed=landSeed(to);S.wv=to==='c'?(S.wv0||3):3;S.landArr=from;S.wx=null;G.walkTo=null;G.act=null;if(typeof AQ==='object'&&AQ.on)try{aqStop();}catch(e){}
  cnt('cnt','gate');uiToast(`⛩️ Đang sang ${T.n}…`,'gold');save();try{if(typeof accPush==='function'&&typeof curSlot==='function'&&ACC.db)accPush(curSlot());}catch(e){}
  G.ldLeaving=2;try{sessionStorage.setItem('ld-cont','1');}catch(e){}setTimeout(()=>{try{location.reload();}catch(e){}},900);}
// tải lại xong: vào thẳng game
{const _b=boot;boot=function(d){let c=false;try{c=sessionStorage.getItem('ld-cont')==='1';sessionStorage.removeItem('ld-cont');}catch(e){}return _b(c?Object.assign({},d||{},{cont:true}):d);};}
// đến nơi: đứng ở cổng dẫn về vùng vừa rời
setInterval(()=>{try{if(!G.on||!S||G.ldLeaving)return;landInit();if(S.landArr&&G.sc&&G.terrain&&P.model&&G.animals&&G.animals.length&&typeof REG!=='undefined'&&REG.length){/* chờ thế giới dựng xong (đã có địa hình, vùng, cổng) rồi mới đặt người */const g=LD.gates.find(x=>x.to===S.landArr)||LD.gates[0],L=landCur();if(g){let px=g.x+46,pz=g.z+30;for(let k=0;k<8&&(wdAt(px,pz)>0||hAt(px,pz)<3);k++){px=g.x+Math.cos(k*0.8)*50;pz=g.z+Math.sin(k*0.8)*50;}P.x=px;P.z=pz;P.y=groundY(P.x,P.z,hAt(P.x,P.z)+40);if(S.p){S.p.x=+px.toFixed(1);S.p.z=+pz.toFixed(1);}}S.landArr=null;uiToast(`${L.ic} Đã tới ${L.n}. ${L.id==='c'?'':'Vùng cấp cao hơn '+L.lv+' bậc: cẩn thận thú dữ.'}`,'gold');try{uiRegion({ic:L.ic,n:L.n,d:L.d},true);}catch(e){}save();}
  landGateObjs();}catch(e){}},800);
/* ---------- cổng ---------- */
function landGateModel(T){const K=K3,a=[K.box(9,74,9,'stone',{x:-26}),K.box(9,74,9,'stone',{x:26}),K.box(74,9,12,'stone',{y:70}),K.box(88,5,15,'dwood',{y:79}),K.box(60,5,10,'dwood',{y:60}),K.cyl(40,44,3,'#6a5a48',{y:-1},16)];
  for(let i=0;i<7;i++)a.push(K.ico(3+(i%3),'#ffd27a',{x:(i-3)*6,y:20+((i*37)%34),z:0},0,0.3,i+1));return K.group(a);}
function landGateObjs(){if(!G.sc||!G.terrain||LD.objs.length||!LD.gates.length)return;for(const g of LD.gates){const T=LANDS.find(x=>x.id===g.to),o=landGateModel(T);o.position.set(g.x,hAt(g.x,g.z)-0.5,g.z);o.rotation.y=Math.atan2(SPAWN[0]-g.x,SPAWN[1]-g.z);o.traverse(m=>{if(m.isMesh)m.castShadow=true;});try{seasonPatchAll(o);}catch(e){}G.sc.add(o);LD.objs.push(o);
    try{const sp=mpTagMake('⛩️ '+T.n,'#f2c55a');sp.scale.set(120,30,1);sp.position.set(g.x,hAt(g.x,g.z)+104,g.z);G.sc.add(sp);LD.objs.push(sp);}catch(e){}}}
function landGateNear(){for(const g of LD.gates){const d=Math.hypot(g.x-P.x,g.z-P.z);if(d<64)return {type:'ldgate',g,d,b:{x:g.x,y:hAt(g.x,g.z)+30,z:g.z}};}return null;}
{const _ft=findTarget;findTarget=function(){const r=_ft.apply(this,arguments);if(!S||G.work||G.sit)return r;if(r&&(r.type==='animal'||r.type==='foe'))return r;return landGateNear()||r;};}
{const _ti=targetInfo;targetInfo=function(t){if(t&&t.type==='ldgate'){const T=LANDS.find(L=>L.id===t.g.to),why=landWhy(t.g.to);return {name:'Cổng sang '+T.ic+' '+T.n,verb:why||(G.ldArm===t.g.to&&G.t-(G.ldArmT||0)<6?'Bấm lần nữa để đi':'Đi qua cổng'),ok:!why,need:why,icon:'torch'};}return _ti.apply(this,arguments);};}
{const _as=actStart;actStart=function(t){if(t&&t.type==='ldgate'&&!G.work){const to=t.g.to,why=landWhy(to);if(why){uiToast(why,'bad');sfx('no');return;}if(G.ldArm===to&&G.t-(G.ldArmT||0)<6){G.ldArm=null;landGo(to);}else{G.ldArm=to;G.ldArmT=G.t;const T=LANDS.find(L=>L.id===to);uiToast(`⛩️ ${T.n}: ${T.d} Túi đồ, cấp, kỹ năng đi theo bạn; nhà cửa ở lại vùng này. Bấm lần nữa để đi.`,'');sfx('pick');}return;}return _as.apply(this,arguments);};}
/* ---------- cấp vùng, tài nguyên, thú theo vùng ---------- */
{const _kl=khuLv;khuLv=function(x,z){return clamp(_kl(x,z)+landCur().lv,1,20);};}
{const _rg=resGen;resGen=function(seed){_rg.apply(this,arguments);try{const id=landCur().id;if(id==='c')return;const hsh=i=>{let x=(i*2654435761+((seed|0)*97))>>>0;x^=x>>>15;x=Math.imul(x,2246822519)>>>0;x^=x>>>13;return (x>>>0)/4294967296;};
    const re=(q,t)=>{if(!RT[t])return;q.t=t;q.s=(0.85+hsh(q.i+7)*0.35)*(RT[t].sc||1);q.hp=RT[t].hp;};
    for(const q of RES){if(q.site)continue;const r=hsh(q.i),t=q.t;
      if(id==='tb'){if(t==='rock'||t==='boulder'){if(r<0.14)re(q,'copperRock');else if(r<0.22)re(q,'tinRock');else if(r<0.32)re(q,'ironRock');else if(r<0.42)re(q,'coalRock');else if(r<0.5)re(q,'flintRock');}else if((t==='oak'||t==='birch')&&r<0.55)re(q,'pine');else if(t==='pine'&&r<0.1)re(q,'pineG');else if(t==='pebble'&&r<0.2)re(q,'jadeRock');}
      else{if((t==='pine'||t==='oak'||t==='birch')){if(r<0.4)re(q,'palm');else if(r<0.6)re(q,'banana');else if(r<0.75)re(q,'bamboo');}else if(t==='tallgrass'||t==='reeds'){const h=hAt(q.x,q.z);if(h<14&&r<0.2)re(q,'saltPan');else if(h<14&&r<0.38)re(q,'shellBed');else if(h<10&&r<0.46)re(q,'goldPan');}else if(t==='rock'&&r<0.12)re(q,'flintRock');}}}catch(e){console.warn('tài nguyên vùng',e);}};}
// thú chúa ở vùng xa trâu hơn
{const _kb=khuBossTick;khuBossTick=function(){const r=_kb.apply(this,arguments);try{const add=landCur().lv;if(add)for(const a of G.animals)if(a.boss&&a.alive&&!a._ld){a._ld=1;a.lv+=add;a.hp*=1+0.25*add;if(a.hp0)a.hp0=a.hp;a.n=a.n+' '+landCur().ic;}}catch(e){}return r;};}
// tên vùng đất trên bảng trạng thái + trong bản đồ
{const _hud=uiHud;uiHud=function(){const r=_hud.apply(this,arguments);try{const L=landCur(),el=document.querySelector('#game .h-id span');if(el&&!el.dataset.ld){el.dataset.ld='1';el.textContent=L.ic+' '+L.n+' · '+el.textContent;}}catch(e){}return r;};}
if(typeof mapHtml==='function'){const _mh=mapHtml;mapHtml=function(){let h=_mh.apply(this,arguments);try{const L=landCur();h=`<div class="landbox"><b>${L.ic} ${esc(L.n)}</b><span class="small muted">${esc(L.d)} Cổng sang vùng khác có dấu ⛩️ trên bản đồ: ${LD.gates.map(g=>{const T=LANDS.find(x=>x.id===g.to);return T.ic+' '+T.n+(T.need>1?' (cấp '+T.need+')':'');}).join(', ')||'chưa tìm được chỗ đặt cổng'}.</span><div class="row">${LD.gates.map(g=>`<button class="btn sm ghost" data-a="ldmark" data-x="${g.x}" data-z="${g.z}">📍 Cắm cờ tới cổng ${LANDS.find(x=>x.id===g.to).ic}</button>`).join('')}</div></div>`+h;}catch(e){}return h;};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="ldmark"]');if(!b||!S)return;e.stopImmediatePropagation();S.mark={x:+b.dataset.x,z:+b.dataset.z};sfx('pick');uiToast('📍 Đã cắm cờ tới cổng: la bàn sẽ chỉ hướng.','');save();uiClose();},true);
if(typeof NVQ!=='undefined')NVQ.push({id:'gate',ic:'⛩️',t:'Đi qua cổng sang vùng đất khác',d:'Tìm cổng đá ⛩️ ở rìa bản đồ (mở 🗺️ Bản đồ để cắm cờ tới cổng). Tây Bắc cần cấp 8, Biển Đảo cần cấp 12.',n:1,f:()=>nvC('cnt:gate'),rw:{bronze:2,meatCooked:4},lv:8});

{const _sv=save;save=function(){if(G.ldLeaving===2)return;return _sv.apply(this,arguments);};}

/* ---------- mỏ và thú chúa riêng của từng vùng xa ---------- */
Object.assign(KHU_BOSS,{tb_sat:{kind:'bear',n:'Gấu tuyết Hoàng Liên',lv:9,loot:{hide:10,bone:6,meat:10,ironOre:12,coal:6}},tb_ngoc:{kind:'tiger',n:'Hổ trắng Đồng Văn',lv:10,loot:{hide:12,bone:6,meat:8,jade:4}},tb_than:{kind:'wolf',n:'Sói tuyết đầu đàn',lv:8,loot:{hide:6,bone:4,meat:6,coal:12}},
  dao_ngoc:{kind:'crocodile',n:'Cá sấu nước mặn',lv:9,loot:{hide:10,meat:10,pearl:4,shell:8}},dao_vang:{kind:'crocodile',n:'Thuồng luồng núi lửa',lv:10,loot:{hide:10,meat:8,gold:6}},dao_muoi:{kind:'gaur',n:'Trâu rừng đảo',lv:8,loot:{hide:8,bone:6,meat:18,salt:10}}});
RLSITE.push(
  {id:'tb_sat',land:'tb',n:'Mỏ sắt Hoàng Liên',ic:'⚒️',cat:'ore',regs:['range','vista','plateau','hills'],minD:1800,rich:3,y:{ironOre:6,coal:2,stone:2},nodes:[['ironRock',14],['coalRock',6],['boulder',3]],d:'Vỉa sắt lớn nhất vùng, lộ trên sườn núi tuyết. Gấu tuyết giữ cửa mỏ.'},
  {id:'tb_ngoc',land:'tb',n:'Mỏ ngọc Đồng Văn',ic:'🟢',cat:'stone',regs:['karst','cliffs','cave','chasm'],minD:1800,rich:3,y:{jade:2,stone:3},nodes:[['jadeRock',10],['flintRock',4]],d:'Khe đá tai mèo lấp lánh vân ngọc. Hổ trắng rình trên vách.'},
  {id:'tb_than',land:'tb',n:'Vỉa than Mộc Châu',ic:'⬛',cat:'ore',regs:['pineplat','hotspring','forest','bamboovl'],minD:1800,rich:3,y:{coal:7,stone:1},nodes:[['coalRock',14],['pineG',4]],d:'Đồi thông lộ vỉa than đen dày. Bầy sói tuyết quanh quẩn.'},
  {id:'dao_ngoc',land:'dao',n:'Rạn ngọc trai Quần Đảo',ic:'🦪',cat:'shell',regs:['halong','beach','cliffs','delta'],minD:1500,rich:3,water:1,pearl:0.5,y:{shell:7,pearl:1},nodes:[['shellBed',14]],d:'Rạn đá ngầm phủ kín trai ngọc. Cá sấu nước mặn nằm chờ ngay bãi.'},
  {id:'dao_vang',land:'dao',n:'Bãi vàng Đảo Núi Lửa',ic:'🟡',cat:'ore',regs:['basalt','hotspring','jungle','lake'],minD:1500,rich:3,y:{gold:4,stone:2},nodes:[['goldPan',12],['flintRock',3]],d:'Cát đen chân núi lửa lẫn vàng cốm. Thuồng luồng canh dòng suối nóng.'},
  {id:'dao_muoi',land:'dao',n:'Đồng muối Rừng Đước',ic:'🧂',cat:'salt',regs:['mangrove','delta','savanna','beach'],minD:1500,rich:3,water:1,y:{salt:8,fish:3},nodes:[['saltPan',14],['reedBed',4]],d:'Bãi triều rộng kết muối trắng. Trâu rừng đảo về liếm muối mỗi chiều.'});
