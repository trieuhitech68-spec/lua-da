/* ===================== CHƠI CHUNG: THẾ GIỚI CHUNG · BỘ TỘC · LÃNH THỔ · CÔNG TRÌNH CHUNG · TẶNG ĐỒ =====================
   Chỉ sáng lên khi trang mở trên claude.ai và có đủ `user` + `db` (thêm `room` để thấy nhau theo thời gian thực).
   Mở tệp offline, chưa đăng nhập, hoặc nhân vật "Một mình": không đổi gì cả.
   Dữ liệu chung (db), mỗi người chỉ ghi tài liệu mang id của mình:
     world/main            {seed, wv}                  hạt giống thế giới chung (người đầu tiên tạo)
     players/<uid>         {look, clan, req, w, lastSeen}
     clans/<leaderUid>     {name, leader, members[], color, emblem, createdAt, zone{x,z,r}|null, deny[]}
     claims/<uid>          {x, z, r, clan}
     builds/<uid>          {w, d:"id,k,x,y,z,r,lv;...", parts, ver, n, at}   (+ builds/<uid>/p/<i> nếu lớn)
     chat/<uid>            {clan, msgs:[{t,at}]}         10 tin gần nhất của từng người
     gifts/<uid>           {list:[{tid,to,id,n,at}]}     biên nhận tặng đồ (chống nhân bản)
   Room: presence {w,u,x,y,z,ry,a,lk,ap,cl} (ap: mã ngoại hình, creator.js) ~5 lần/giây · chủ đề 'chat' (tin bộ tộc) · 'trade' (tặng đồ).
   Mọi thứ nghe được / đọc được đều là dữ liệu không tin cậy: kiểm kiểu, kẹp giá trị, tên và chữ đưa vào bằng textContent. */
const MP={ok:false,started:false,db:null,room:null,user:null,uid:null,seed:null,canW:null,ro:false,
  players:{},clans:{},claims:{},loaded:{players:0,clans:0,claims:0},me:null,names:{},nameQ:new Set(),
  rp:new Map(),myPeer:null,presK:'',presT:0,
  bsub:new Map(),braw:new Map(),bcur:new Map(),rk:new Map(),rkN:0,rq:[],rTot:0,bSig:null,bSigT:0,bDone:null,bBusy:false,bInfo:{n:0,at:0},
  rings:new Map(),wq:{},offers:new Map(),inbox:[],chat:[],chatSeen:new Set(),chatUn:null,chatClan:undefined,myChat:null,myGifts:null,
  tick:{pres:0,near:0,ring:0,mem:0,ui:0,sig:0,sort:0},dirty:{remote:false,ui:false,mem:false},unsubs:[],badT:0};
const MPA=new Set(['idle','walk','run','sneak','swim','sit','sleep','chop','mine','gather','hammer','throw','whittle','lash','dig','drink','knap','carve','cook','grind']);
const MPCOL=['#e5532c','#f2c55a','#5aa0e6','#7ac46a','#b06ad8','#e66aa8','#4ac0b8','#d8d0c0'];
const MPEMB=['🔥','🌙','🐉','🦅','🐘','🌾','⛰️','🐟','🐃','🌊'];
const MP_SPAWN_FREE=320,MP_NEAR=2600,MP_FAR=3400,MP_MAXSUB=24,MP_SHOW=12,MP_BCAP=2000,MP_RCAP=6000,MP_CLANMAX=70,MP_SRVCAP=150,MP_SRVMAX=8,MP_SRVDAYS=3,MP_DOCMAX=190000;
const mpIdOk=v=>typeof v==='string'&&/^[A-Za-z0-9_\-.:@+~]{1,128}$/.test(v);
const mpNum=(v,a,b)=>typeof v==='number'&&isFinite(v)&&v>=a&&v<=b;
const mpTxt=(v,n)=>typeof v==='string'?v.replace(/[\u0000-\u001f\u007f-\u009f­​-‏‪-‮⁠-⁯﻿]/g,'').replace(/\s+/g,' ').trim().slice(0,n):'';
const mpSleep=ms=>new Promise(r=>setTimeout(r,ms));
const mpTO=(p,ms)=>Promise.race([p,new Promise((_,rj)=>setTimeout(()=>rj({code:'timeout'}),ms))]);
const mpNow=()=>Date.now();
function mpOn(){return !!(MP.started&&S&&S.mp&&G.on);}
function mpName(uid){if(uid===MP.uid)return 'Bạn';const n=MP.names[uid];if(n)return n;if(uid)MP.nameQ.add(uid);return 'Người chơi';}
/* ---------- kết nối ---------- */
(async function mpInit(){try{if(!window.claude||typeof window.claude.use!=='function')return;
    const [user,db]=await Promise.all([window.claude.use('user'),window.claude.use('db')]);if(!user||!db)return;
    const uid=await user.id();if(!mpIdOk(uid))return;MP.user=user;MP.db=db;MP.uid=uid;try{MP.canW=await user.can('data.write');}catch(e){}if(MP.canW===false)MP.ro=true;
    window.claude.use('room').then(r=>{if(r){MP.room0=r;MP.room=r;if(MP.started)mpRoomSet(r);}}).catch(()=>{});
    await mpWorld();if(!MP.seed)return;MP.ok=true;mpFormRefresh();mpSrvPick();if(G.on&&S&&S.mp)mpStart();}catch(e){console.warn('chơi chung',e);}})();
async function mpGetDoc(path){try{const s=await mpTO(MP.db.doc(path).get(),10000);return s&&s.exists?s.data():null;}catch(e){return undefined;}}
async function mpWorld(){const ok=v=>mpNum(v,1,4.3e9)&&Math.floor(v)===v;let d=await mpGetDoc('world/main');
  if(d===undefined)d=await mpGetDoc('world/main');
  if(!d||!ok(d.seed)){if(MP.ro)return;const ref=MP.db.doc('world/main');
    try{const L=await mpTO(ref.acquire({holder:MP.uid,ttlMs:8000}),10000);if(L&&L.acquired){d=await mpGetDoc('world/main');if(!d||!ok(d.seed)){d={seed:((Math.random()*2e9)|0)+1,wv:4,createdAt:mpNow()};await ref.set(d);}}/* Máy chủ 1 tạo mới (sau khi làm mới dữ liệu) dùng bản đồ hình chữ S */
      else{for(let i=0;i<6&&(!d||!ok(d.seed));i++){await mpSleep(1500);d=await mpGetDoc('world/main');}}}catch(e){console.warn('thế giới chung',e);}}
  if(d&&ok(d.seed)){MP.seed=d.seed;MP.worlds=[{id:'main',seed:d.seed,n:null,wv:d.wv>=4?4:3}];MP.srv='main';
    for(let i=2;i<=MP_SRVMAX;i++){const e=await mpGetDoc('world/s'+i);if(!e||!ok(e.seed))break;MP.worlds.push({id:'s'+i,seed:e.seed,n:null,wv:e.wv>=4?4:3});}}}
/* ---------- NHIỀU MÁY CHỦ ----------
   Mỗi máy chủ là một thế giới riêng: world/main (Máy chủ 1), world/s2 … world/s8, mỗi cái một hạt giống. Mọi dữ liệu chung đã mang
   hạt giống (w) nên người ở máy chủ khác không thấy nhau, không tải dữ liệu của nhau, và mỗi máy chủ dùng một kênh thời gian thực riêng.
   Nhân vật gắn với máy chủ lúc tạo (S.srv + S.seed), không chuyển được. Tạo nhân vật mới: tự xếp vào máy chủ đầu tiên còn dưới
   MP_SRVCAP người hoạt động trong MP_SRVDAYS ngày; máy nào cũng đầy thì mở máy chủ mới (tối đa MP_SRVMAX). Người chơi đổi được trong bảng tạo nhân vật. */
const mpSrvName=id=>'Máy chủ '+(id==='main'||!id?1:+String(id).slice(1))+(((MP.worlds||[]).find(w=>w.id===id)||{}).wv>=4?' · chữ S':'');
// mở thêm một máy chủ dùng bản đồ hình chữ S (ai cũng bấm được khi chưa có máy chủ nào như vậy; tối đa MP_SRVMAX máy)
async function mpSrvOpenS(){if(MP.srvBusy||!MP.ok)return;if((MP.worlds||[]).some(w=>w.wv>=4)){uiToast('Đã có máy chủ bản đồ chữ S, chọn nó trong danh sách.','');return;}MP.srvBusy=true;uiToast('Đang mở máy chủ mới…','');let w=null;try{w=await mpSrvNew();}catch(e){}MP.srvBusy=false;
  if(w){MP.srvUser=1;MP.srv=w.id;MP.seed=w.seed;uiToast('🗺️ Đã mở '+mpSrvName(w.id)+'. Nhân vật mới sẽ vào bản đồ hình chữ S.','gold');}else uiToast('Chưa mở được máy chủ mới (kiểm tra mạng, hoặc máy chủ chưa chạy bản SQL cập nhật).','bad');mpFormRefresh();}
function mpSrvOf(seed){const w=(MP.worlds||[]).find(x=>x.seed===seed);return w?w.id:null;}
const mpIsMain=()=>!MP.worlds||!MP.worlds.length||!S||seed0()===MP.worlds[0].seed;
// tài liệu cũ chưa ghi máy chủ (w) thuộc Máy chủ 1
const mpWOk=d=>!!d&&(d.w==null?mpIsMain():d.w===seed0());
// tài liệu công trình: vùng trung tâm ở builds/<uid>, vùng xa ở builds/<uid>/L/<mã vùng> (mỗi vùng một bản, không ghi đè nhau)
const mpBPath=u=>'builds/'+u+(landFar()?'/L/'+S.land:'');
async function mpSrvCount(){if(!MP.db||!MP.worlds)return;const since=mpNow()-MP_SRVDAYS*86400000;
  await Promise.all(MP.worlds.map(async w=>{try{const s=await mpTO(MP.db.collection('players').where('w','==',w.seed).limit(600).get(),10000);let n=0;for(const d of s.docs){const v=d.data();if(v&&v.lastSeen>since)n++;}w.n=n;}catch(e){if(w.n==null)w.n=0;}}));MP.srvAt=mpNow();}
async function mpSrvNew(){const ok=v=>mpNum(v,1,4.3e9)&&Math.floor(v)===v,i=MP.worlds.length+1;if(i>MP_SRVMAX||MP.ro)return null;const path='world/s'+i,ref=MP.db.doc(path);
  try{const L=await mpTO(ref.acquire({holder:MP.uid,ttlMs:8000}),10000);let d=await mpGetDoc(path);if((!d||!ok(d.seed))&&L&&L.acquired){d={seed:((Math.random()*2e9)|0)+1,wv:4,createdAt:mpNow()};await ref.set(d);}/* máy chủ mở mới dùng bản đồ hình chữ S (world5.js) */
    for(let k=0;k<4&&(!d||!ok(d.seed));k++){await mpSleep(1200);d=await mpGetDoc(path);}
    if(d&&ok(d.seed)){const w={id:'s'+i,seed:d.seed,n:0,wv:d.wv>=4?4:3};MP.worlds.push(w);return w;}}catch(e){console.warn('máy chủ mới',e);}return null;}
// chọn máy chủ cho nhân vật mới (tự động, trừ khi người chơi đã bấm chọn)
async function mpSrvPick(){if(MP.srvBusy||!MP.ok)return;MP.srvBusy=true;try{if(!MP.srvAt||mpNow()-MP.srvAt>60000)await mpSrvCount();
    if(!MP.srvUser){let w=MP.worlds.find(x=>(x.n||0)<MP_SRVCAP);if(!w)w=await mpSrvNew();if(!w)w=MP.worlds.slice().sort((a,b)=>(a.n||0)-(b.n||0))[0];MP.srv=w.id;MP.seed=w.seed;}}catch(e){console.warn('chọn máy chủ',e);}MP.srvBusy=false;mpFormRefresh();}
function mpSrvSet(id){const w=(MP.worlds||[]).find(x=>x.id===id);if(!w)return;MP.srvUser=1;MP.srv=w.id;MP.seed=w.seed;mpFormRefresh();}
// danh sách máy chủ trong bảng tạo nhân vật
function mpSrvForm(row){const f=document.querySelector('.ov-card.form');
  // trình tạo nhân vật (creator.js): một nút nhỏ cạnh chế độ chơi, bấm để đổi sang máy chủ kế
  const cs=document.querySelector('.ov-card.cr .crfr.mds small');if(cs&&G.nworld==='mp'&&MP.ok&&MP.worlds){if(!MP.srvAt||mpNow()-MP.srvAt>60000)mpSrvPick();const w=MP.worlds.find(x=>x.id===MP.srv)||MP.worlds[0],k=MP.srv+':'+w.n+':'+MP.worlds.length+':'+MP.worlds.some(x=>x.wv>=4);
    if(cs.dataset.k!==k){cs.dataset.k=k;cs.innerHTML=`<button class="tb sm" data-a="mpsrvnext" title="Bấm để đổi máy chủ">🌐 ${mpSrvName(w.id)}${w.n==null?'':' · '+w.n+'/'+MP_SRVCAP}${MP.worlds.length>1?' ⇄':''}</button>`+(MP.worlds.some(x=>x.wv>=4)||MP.worlds.length>=MP_SRVMAX?'':' <button class="tb sm" data-a="mpsrvS" title="Mở máy chủ mới dùng bản đồ hình chữ S">＋ 🗺️ Chữ S</button>');}}
  if(!f)return;
  let sv=document.querySelector('.ov-card.form .mpsrv');if(G.nworld==='mp'&&MP.ok&&MP.worlds){if(!sv){sv=document.createElement('div');sv.className='mpsrv';if(row)row.after(sv);else{const st=f.querySelector('[data-a="start"]');if(st)st.before(sv);else f.appendChild(sv);}}
    if(!MP.srvAt||mpNow()-MP.srvAt>60000)mpSrvPick();
    sv.innerHTML='<span class="small muted">Máy chủ (tự xếp vào máy còn chỗ; nhân vật ở cố định máy chủ đã chọn):</span><div class="mpsrv-l">'+MP.worlds.map(w=>`<button class="tb sm${w.id===MP.srv?' on':''}" data-a="mpsrv" data-v="${w.id}">${mpSrvName(w.id)}${w.n==null?'':' · '+w.n+'/'+MP_SRVCAP+((w.n||0)>=MP_SRVCAP?' (đầy)':'')}</button>`).join('')+(MP.worlds.some(x=>x.wv>=4)||MP.worlds.length>=MP_SRVMAX?'':'<button class="tb sm" data-a="mpsrvS">＋ 🗺️ Mở máy chủ bản đồ chữ S</button>')+'</div>';}
  else if(sv)sv.remove();}
// kênh thời gian thực riêng cho từng máy chủ (Máy chủ 1 giữ kênh cũ)
async function mpRoomSet(r){if(!r)return;MP.room0=r;const id=S&&S.mp?(S.srv||mpSrvOf(seed0())):null;let use=r;if(id&&id!=='main'&&typeof r.join==='function'){try{use=await r.join(id);}catch(e){use=r;}}MP.room=use;if(MP.started)mpRoomInit();}
// ghi nối tiếp, gộp: mỗi tài liệu một lần ghi một lúc, chỉ giữ bản mới nhất đang chờ
function mpPut(path,data){if(!MP.db||MP.ro)return;const q=MP.wq[path]||(MP.wq[path]={busy:false,has:false,next:null});q.next=data;q.has=true;if(!q.busy)mpFlush(path,q);}
async function mpFlush(path,q){q.busy=true;while(q.has){const d=q.next;q.has=false;q.next=null;const ref=MP.db.doc(path);
    for(let k=0;k<2;k++){try{if(d===null)await ref.delete();else await ref.set(d);break;}catch(e){const c=e&&e.code;if(c==='unavailable'&&!k){await mpSleep(600+Math.random()*900);continue;}mpErr(c);break;}}}q.busy=false;}
function mpErr(c){if(c==='invalid_argument'&&!MP.roWarn){MP.roWarn=1;uiToast('Chưa ghi được dữ liệu chung (có thể bạn chỉ có quyền xem trang này).','bad');}
  if(c==='quota_exceeded'&&!MP.qWarn){MP.qWarn=1;uiToast('Kho dữ liệu chung đã đầy. Nhờ chủ trang dọn bớt.','bad');}}
/* ---------- bắt đầu một ván ở thế giới chung ---------- */
async function mpStart(){if(MP.started||!MP.ok||!S||!S.mp||!G.on)return;MP.started=true;mpMenu();if(!S.srv)S.srv=mpSrvOf(seed0())||'main';if(MP.room0&&S.srv!=='main'){try{await mpRoomSet(MP.room0);}catch(e){}}
  const sub=(q,fn)=>{try{const un=q.onSnapshot(fn,e=>console.warn('chơi chung: nghe',e&&e.code));MP.unsubs.push(un);}catch(e){console.warn(e);}};
  sub(mpIsMain()?MP.db.collection('players').limit(500):MP.db.collection('players').where('w','==',seed0()).limit(500),s=>{const o={};for(const d of s.docs){const v=mpValPlayer(d.id,d.data());if(v)o[d.id]=v;}MP.players=o;MP.loaded.players=1;MP.dirty.mem=MP.dirty.ui=MP.dirty.remote=true;});
  sub(MP.db.collection('clans').limit(300),s=>{const o={};for(const d of s.docs){if(!mpWOk(d.data()))continue;const v=mpValClan(d.id,d.data());if(v)o[d.id]=v;}MP.clans=o;MP.loaded.clans=1;MP.dirty.mem=MP.dirty.ui=MP.dirty.remote=true;MP.tick.ring=-9;});
  sub(MP.db.collection('claims').limit(800),s=>{const o={};for(const d of s.docs){if(!mpWOk(d.data()))continue;const v=mpValClaim(d.id,d.data());if(v)o[d.id]=v;}MP.claims=o;MP.loaded.claims=1;MP.dirty.ui=MP.dirty.remote=true;MP.tick.ring=-9;MP.tick.near=-9;});
  const cur=await mpGetDoc('players/'+MP.uid);const v=cur&&mpValPlayer(MP.uid,cur);
  MP.me={look:S.look|0,clan:v?v.clan:null,req:v?v.req:null,w:seed0(),lastSeen:mpNow(),h:v?v.h:null,df:v?v.df:null,sh:v?v.sh:0,hl:v?v.hl:1,ho:v?v.ho:null,fl:v?v.fl:{}};mpPut('players/'+MP.uid,Object.assign({},MP.me));
  const bh=await mpGetDoc(mpBPath(MP.uid));MP.bHad=!!(bh&&bh.n>0);
  const g=await mpGetDoc('gifts/'+MP.uid);MP.myGifts={list:g&&Array.isArray(g.list)?g.list.filter(x=>x&&typeof x==='object').slice(-12):[]};
  if(!Array.isArray(S.mpGot))S.mpGot=[];if(MP.room)mpRoomInit();}
function mpValPlayer(id,d){if(!mpIdOk(id)||!d||typeof d!=='object')return null;return {look:mpNum(d.look,0,LOOKS.length-1)?d.look|0:0,clan:mpIdOk(d.clan)?d.clan:null,req:mpIdOk(d.req)?d.req:null,w:mpNum(d.w,0,4.3e9)?d.w:0,lastSeen:mpNum(d.lastSeen,0,1e14)?d.lastSeen:0,fl:(()=>{const o={};if(d.fl&&typeof d.fl==='object')for(const k of ['tb','dao']){const a=d.fl[k];if(Array.isArray(a)&&a.length===3&&mpNum(a[0],-2e4,2e4)&&mpNum(a[1],-2e4,2e4)&&mpNum(a[2],0,4e4))o[k]=[a[0],a[1],a[2]];}return o;})(),ho:Array.isArray(d.ho)&&d.ho.length===2&&mpNum(d.ho[0],0,24)&&mpNum(d.ho[1],0,4e12)?[d.ho[0],d.ho[1]]:null,df:Array.isArray(d.df)&&d.df.length===3&&d.df.every(v=>mpNum(v,0,99))?[d.df[0]|0,d.df[1]|0,d.df[2]|0]:null,sh:mpNum(d.sh,0,4e12)?d.sh:0,hl:mpNum(d.hl,1,999)?d.hl|0:1,h:Array.isArray(d.h)&&d.h.length===3&&mpNum(d.h[0],-2e4,2e4)&&mpNum(d.h[1],-2e4,2e4)&&mpNum(d.h[2],0,4e4)?[d.h[0],d.h[1],d.h[2]]:null};}
function mpValZone(z){if(!z||typeof z!=='object'||!mpNum(z.x,-2e4,2e4)||!mpNum(z.z,-2e4,2e4)||!mpNum(z.r,40,600))return null;return {x:z.x,z:z.z,r:z.r};}
function mpValClan(id,d){if(!mpIdOk(id)||!d||typeof d!=='object')return null;const name=mpTxt(d.name,24);if(!name||d.leader!==id||!Array.isArray(d.members))return null;
  const members=[...new Set(d.members.filter(mpIdOk))].slice(0,MP_CLANMAX);if(!members.includes(id))members.unshift(id);
  return {id,name,leader:id,members,color:typeof d.color==='string'&&/^#[0-9a-fA-F]{6}$/.test(d.color)?d.color:MPCOL[7],emblem:MPEMB.includes(d.emblem)?d.emblem:'🔥',createdAt:mpNum(d.createdAt,0,1e14)?d.createdAt:0,zone:mpValZone(d.zone),deny:Array.isArray(d.deny)?d.deny.filter(mpIdOk).slice(0,60):[]};}
function mpValClaim(id,d){if(!mpIdOk(id))return null;const z=mpValZone(d);if(!z||z.r>480)return null;return z;}
// liên minh thật sự của một người: họ nhận mình thuộc liên minh đó VÀ thủ lĩnh đã ghi tên họ
function mpClanOf(uid){const p=uid===MP.uid&&MP.me?MP.me:MP.players[uid];const cid=p&&p.clan;const c=cid&&MP.clans[cid];return c&&c.members.includes(uid)?cid:null;}
const mpCT=n=>/^(bộ tộc|liên minh)\b/i.test(n)?n:'liên minh '+n;
function mpMyClan(){return MP.uid?mpClanOf(MP.uid):null;}
function mpSameClan(uid){const a=mpMyClan();return !!a&&a===mpClanOf(uid);}
function mpColOf(uid){const c=MP.clans[mpClanOf(uid)];return c?c.color:null;}
/* ---------- chọn thế giới khi tạo nhân vật ---------- */
{const _ng=newGame;newGame=function(o){const mp=G.nworld==='mp'&&MP.ok&&MP.seed;if(mp){o=Object.assign({},o,{seed:MP.seed});}const r=_ng(o);
  if(mp&&S){S.mp=1;S.srv=MP.srv||'main';{const w=(MP.worlds||[]).find(x=>x.id===S.srv);if(w&&w.wv>=4){S.wv=4;worldCfg(4);}else if(S.wv>=4){S.wv=3;worldCfg(3);}}S.mpGot=[];S._new=1;save();delete S._new;}return r;};}
{const _sm=slotMeta;slotMeta=function(s){const m=_sm(s);if(s&&s.mp){m.mp=1;m.srv=s.srv||'main';}return m;};}
{const _us=uiStart;uiStart=function(o){_us(o);try{mpStartPatch(o||{});}catch(e){console.warn(e);}};}
function mpStartPatch(o){const f=document.querySelector('.ov-card.form');
  if(f){if(!f.querySelector('.mpw')&&(MP.db||MP.ok)){G.nworld=G.nworld||'solo';const row=document.createElement('div');row.className='mds mpw';
      row.innerHTML='<button class="md" data-a="mpw" data-v="solo"><b>🏕️ Một mình</b><small>Thế giới riêng của bạn.</small></button><button class="md" data-a="mpw" data-v="mp"><b>🌐 Thế giới chung</b><small class="mpw-s"></small></button>';
      const mds=f.querySelector('.mds');if(mds)mds.parentNode.insertBefore(row,mds);else f.querySelector('[data-a="start"]').before(row);}
    mpFormRefresh();return;}
  const sl=slotsLocal();document.querySelectorAll('.ov-card.acc .chr').forEach(el=>{const b=el.querySelector('[data-a="chplay"]');const id=b&&b.dataset.id;const m=id&&(sl[id]||ACC.cloud[id]);if(m&&m.mp&&!el.querySelector('.mpbadge')){const s=document.createElement('span');s.className='mpbadge';s.textContent=' · 🌐 '+mpSrvName(m.srv);const sm=el.querySelector('small');if(sm)sm.appendChild(s);}});}
function mpFormRefresh(){const row=document.querySelector('.ov-card.form .mpw');mpSrvForm(row);if(!row)return;if(G.nworld==='mp'&&!MP.ok&&!MP.db)G.nworld='solo';
  row.querySelectorAll('[data-a="mpw"]').forEach(b=>{b.classList.toggle('on',b.dataset.v===(G.nworld||'solo'));});
  const s=row.querySelector('.mpw-s');if(s)s.textContent=MP.ok?'Gặp người chơi khác, lập liên minh, cắm đất, cùng xây làng.':'Đang kết nối máy chủ…';
  const h=[...document.querySelectorAll('.ov-card.form p.small.muted')].find(p=>/thế giới/i.test(p.textContent));if(h)h.textContent=G.nworld==='mp'?'Thế giới chung: mọi người cùng một vùng đất, đồ đạc và kỹ năng vẫn là của riêng bạn.':'Mỗi nhân vật có thế giới riêng.';}
/* ---------- nút menu + bảng Liên minh ---------- */
function mpMenu(){const m=$('#menu');if(!m||m.querySelector('[data-ui="clan"]'))return;const b=document.createElement('button');b.setAttribute('data-ui','clan');b.setAttribute('aria-label','Liên minh');b.innerHTML='<span>🤝</span><i>Liên minh</i><em class="mp-dot" hidden></em>';m.appendChild(b);}
{const _uo=uiOpen;uiOpen=function(k,o,keep){if(k!=='clan')return _uo(k,o,keep);if(!G.on)return;_uo(k,o,keep);const p=$('#panel');const h=p.querySelector('.p-head h2'),bd=p.querySelector('.p-body');if(!h||!bd)return;h.textContent='Liên minh · Thế giới chung';mpPanelFill(bd,keep);};}
function mpPanelRefresh(){if(G.panel!=='clan')return;const bd=$('#panel .p-body');if(!bd)return;mpPanelFill(bd,true);}
function mpPanelFill(bd,keep){const keepV={};bd.querySelectorAll('input[id^="mp"]').forEach(i=>{keepV[i.id]=i.value;});const fo=document.activeElement&&document.activeElement.id;const sc=bd.scrollTop;
  bd.innerHTML=mpPanelHtml();
  bd.querySelectorAll('[data-nm]').forEach(e=>{e.textContent=mpName(e.dataset.nm);});
  bd.querySelectorAll('[data-cn]').forEach(e=>{const c=MP.clans[e.dataset.cn];e.textContent=c?c.emblem+' '+c.name:'';});
  const cl=bd.querySelector('.mp-chat');if(cl){const L=MP.chat.slice(-30);cl.textContent='';if(!L.length){const p=document.createElement('p');p.className='muted small';p.textContent='Chưa có tin nào. Chào cả liên minh đi!';cl.appendChild(p);}
    for(const m of L){const r=document.createElement('div');r.className='mp-cm'+(m.by===MP.uid?' me':'');const b=document.createElement('b');b.textContent=mpName(m.by)+': ';const s=document.createElement('span');s.textContent=m.t;r.append(b,s);cl.appendChild(r);}cl.scrollTop=cl.scrollHeight;}
  for(const id in keepV){const i=bd.querySelector('#'+id);if(i)i.value=keepV[id];}if(fo&&/^mp/.test(fo)){const i=bd.querySelector('#'+fo);if(i)try{i.focus({preventScroll:true});}catch(e){}}
  const q=bd.querySelector('#mpQ');if(q){const f=()=>{const v=q.value.trim().toLowerCase();bd.querySelectorAll('.mp-cl').forEach(r=>{r.hidden=!!v&&!r.textContent.toLowerCase().includes(v);});};q.oninput=f;f();}
  if(keep)bd.scrollTop=sc;mpNamesFlush();}
function mpPanelHtml(){if(!S.mp)return '<p class="small">Nhân vật này sống ở <b>thế giới riêng</b>. Muốn chơi cùng người khác, hãy tạo một nhân vật mới và chọn <b>🌐 Thế giới chung</b>.</p>';
  if(!MP.started)return '<p class="small">Chưa kết nối được máy chủ chơi chung. Mở trò chơi trên claude.ai (đã đăng nhập) để gặp người khác. Bạn vẫn chơi được bình thường.</p>';
  const tab=G.mptab||'tribe';const tabs=[['tribe','🤝 Liên minh'],['land','🚩 Lãnh thổ'],['chat','💬 Trò chuyện'],['near','👥 Quanh đây']].map(([t,n])=>`<button class="tb${tab===t?' on':''}" data-a="mptab" data-t="${t}">${n}</button>`).join('');
  const ro=MP.ro?'<p class="small warn">Bạn đang chỉ có quyền xem trang: thấy được người khác nhưng chưa lập liên minh, cắm đất hay chia sẻ công trình được.</p>':'';
  return `<div class="tabs">${tabs}</div>${ro}`+(tab==='land'?mpLandHtml():tab==='chat'?mpChatHtml():tab==='near'?mpNearHtml():mpTribeHtml());}
function mpOnline(uid){for(const r of MP.rp.values())if(r.uid===uid)return true;return uid===MP.uid;}
function mpTribeHtml(){const cid=mpMyClan(),me=MP.me||{};
  if(cid){const c=MP.clans[cid],lead=c.leader===MP.uid;
    const mem=c.members.map(u=>`<div class="mp-m"><i style="background:${c.color}"></i><b data-nm="${esc(u)}"></b>${u===c.leader?' <small class="ok">👑 Thủ lĩnh</small>':''}<small class="muted">${mpOnline(u)?' · 🟢 đang chơi':' · vắng'}</small>${lead&&u!==MP.uid?`<button class="btn sm ghost" data-a="mpkick" data-u="${esc(u)}">Mời ra</button>`:''}</div>`).join('');
    const reqs=lead?Object.keys(MP.players).filter(u=>MP.players[u].req===cid&&!c.members.includes(u)&&!c.deny.includes(u)):[];
    const rq=reqs.length?`<h3>Xin gia nhập</h3>`+reqs.map(u=>`<div class="mp-m"><b data-nm="${esc(u)}"></b><span><button class="btn sm" data-a="mpacc" data-u="${esc(u)}">Nhận</button><button class="btn sm ghost" data-a="mpden" data-u="${esc(u)}">Từ chối</button></span></div>`).join(''):'';
    return `<div class="mp-card" style="--cc:${c.color}"><span class="mp-em">${c.emblem}</span><div><b data-cn="${esc(cid)}"></b><small class="muted">${c.members.length} thành viên${c.zone?' · có vùng đất chung':''}</small></div></div>${rq}<h3>Thành viên</h3>${mem}
      <p class="hint">Người cùng liên minh được xây trong lãnh thổ của nhau và trong vùng đất chung. Mở tab 🚩 Lãnh thổ để cắm đất.</p>
      <button class="btn sm ${G.mpArm==='leave'?'red':'ghost'}" data-a="mpleave">${G.mpArm==='leave'?'Bấm lần nữa để xác nhận':lead?'Giải tán liên minh':'Rời liên minh'}</button>`;}
  const cs=Object.values(MP.clans).sort((a,b)=>b.members.length-a.members.length).slice(0,80);
  const rows=cs.map(c=>{const pend=me.req===c.id;return `<div class="mp-cl mp-m"><span class="mp-sw" style="background:${c.color}"></span><b data-cn="${esc(c.id)}"></b><small class="muted"> · ${c.members.length} người · thủ lĩnh <span data-nm="${esc(c.leader)}"></span></small>${MP.ro?'':pend?`<button class="btn sm ghost" data-a="mpreq" data-c="">Hủy xin</button>`:`<button class="btn sm" data-a="mpreq" data-c="${esc(c.id)}">Xin vào</button>`}</div>`;}).join('');
  const col=G.mpCol||MPCOL[0],em=G.mpEm||MPEMB[0];
  return `<p class="small">Cùng nhau sinh tồn: lập hoặc gia nhập một liên minh. Mỗi người vẫn giữ đồ đạc, kỹ năng riêng.</p>
    ${MP.ro?'':`<h3>Lập liên minh mới</h3><label class="fld">Tên liên minh<input id="mpCn" maxlength="24" placeholder="vd. Liên minh Suối Đá"></label>
    <div class="mp-row">${MPCOL.map(c=>`<button class="mp-c${c===col?' on':''}" data-a="mpcol" data-v="${c}" style="background:${c}" aria-label="Màu"></button>`).join('')}</div>
    <div class="mp-row">${MPEMB.map(e=>`<button class="mp-e${e===em?' on':''}" data-a="mpem" data-v="${e}">${e}</button>`).join('')}</div>
    <button class="btn" data-a="mpmake">Lập liên minh</button>`}
    <h3>Các liên minh</h3>${cs.length>5?'<input id="mpQ" class="mp-q" placeholder="Tìm theo tên…">':''}${rows||'<p class="muted small">Chưa có liên minh nào. Hãy là người đầu tiên!</p>'}`;}
function mpClaimR(){return Math.min(380,160+25*(S.age||0)+Math.min(60,Object.values(S.sk||{}).reduce((a,v)=>a+Math.floor(Math.sqrt((v||0)/12)),0)*2));}
function mpLandHtml(){const c=MP.claims[MP.uid],cid=mpMyClan(),cl=cid&&MP.clans[cid],lead=cl&&cl.leader===MP.uid,R=mpClaimR();
  const dist=c?Math.round(Math.hypot(P.x-c.x,P.z-c.z)/20):0;const why=mpClaimWhy(P.x,P.z,R,'claim');
  const mine=c?`<p class="small">🚩 Lãnh thổ của bạn: bán kính <b>${Math.round(c.r/20)} m</b>, cách đây ${dist} m.${c.r<R?` Có thể mở rộng tới ${Math.round(R/20)} m.`:''}</p>`:'<p class="small">Bạn chưa có lãnh thổ. Đứng ở chỗ muốn lập nhà rồi cắm mốc.</p>';
  const zone=cl?(cl.zone?`<p class="small">🏕️ Vùng chung của liên minh: bán kính ${Math.round(cl.zone.r/20)} m, cách đây ${Math.round(Math.hypot(P.x-cl.zone.x,P.z-cl.zone.z)/20)} m. Mọi thành viên đều xây được ở đó.</p>`:'<p class="small muted">Liên minh chưa có vùng đất chung.</p>'):'';
  const zw=lead?mpClaimWhy(P.x,P.z,mpZoneR(cl),'zone'):'';
  return `${mine}${MP.ro?'':`<div class="row"><button class="btn sm" data-a="mpclaim"${why?' disabled':''}>${c?'Dời mốc về chỗ đứng':'Cắm mốc lãnh thổ tại đây'} (${Math.round(R/20)} m)</button>${c&&c.r<R&&Math.hypot(P.x-c.x,P.z-c.z)>=0?`<button class="btn sm ghost" data-a="mpgrow">Mở rộng tại chỗ cũ</button>`:''}${c?`<button class="btn sm ${G.mpArm==='unclaim'?'red':'ghost'}" data-a="mpunclaim">${G.mpArm==='unclaim'?'Bấm lần nữa':'Bỏ lãnh thổ'}</button>`:''}</div>`}
    ${why&&!MP.ro?`<p class="small warn">${esc(why)}</p>`:''}${zone}
    ${lead&&!MP.ro?`<div class="row"><button class="btn sm" data-a="mpzone"${zw?' disabled':''}>${cl.zone?'Dời vùng chung về đây':'Đặt vùng chung của liên minh tại đây'} (${Math.round(mpZoneR(cl)/20)} m)</button>${cl.zone?'<button class="btn sm ghost" data-a="mpunzone">Bỏ vùng chung</button>':''}</div>${zw?`<p class="small warn">${esc(zw)}</p>`:''}`:''}
    <p class="hint">Bạn đang ở ${mpSrvName(S.srv)}. Mọi công trình đã xong của bạn đều hiện ra cho người chơi khác khi họ tới gần (đã chia sẻ ${MP.bInfo.n} món${MP.bInfo.at?', lần cuối '+new Date(MP.bInfo.at).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}):''}). Cắm mốc để giữ đất: người khác liên minh không xây được trong đất của bạn. Vùng quanh Trảng Khởi Đầu là đất chung, không ai cắm mốc được.</p>`;}
function mpZoneR(cl){const n=cl?cl.members.length:1;return Math.min(600,220+25*Math.min(10,n)+3*Math.max(0,n-10));}
function mpChatHtml(){const cid=mpMyClan();if(!cid)return '<p class="small">Gia nhập một liên minh để trò chuyện cùng mọi người.</p>';
  return `<div class="mp-chat"></div><div class="mp-send"><input id="mpChat" maxlength="160" placeholder="Nhắn cả liên minh…"><button class="btn sm" data-a="mpsay">Gửi</button></div><p class="hint">Tin nhắn hiện cho người trong liên minh. Đừng gửi thông tin riêng tư.</p>`;}
function mpNearHtml(){if(G.mpGiftTo)return mpGiftHtml();const L=[...MP.rp.values()].filter(r=>r.ok).map(r=>({r,d:Math.hypot(r.x-P.x,r.z-P.z)})).sort((a,b)=>a.d-b.d).slice(0,30);
  if(!MP.room)return '<p class="small muted">Chưa kết nối kênh trực tiếp nên chưa thấy ai đang chơi.</p>';
  if(!L.length)return '<p class="small">Chưa có ai khác đang ở thế giới chung lúc này.</p>';
  return L.map(({r,d})=>{const c=MP.clans[mpClanOf(r.uid)];return `<div class="mp-m"><i style="background:${c?c.color:'#888'}"></i><b data-nm="${esc(r.uid||'')}"></b><small class="muted"> ${c?c.emblem+' · ':''}${Math.round(d/20)} m</small>${d<140&&r.uid?`<button class="btn sm" data-a="mpgift" data-p="${esc(r.peer)}">Tặng đồ</button>`:''}</div>`;}).join('')+'<p class="hint">Lại gần ai đó (dưới 7 m) để tặng đồ. Họ phải bấm Nhận thì đồ mới chuyển đi.</p>';}
function mpGiftHtml(){const r=MP.rp.get(G.mpGiftTo);if(!r)return '<p class="small">Người đó đã đi xa.</p><button class="btn sm ghost" data-a="mpgift" data-p="">Quay lại</button>';
  const sel=G.mpGs!=null?S.inv[G.mpGs]:null;const slots=S.inv.map((s,i)=>`<button class="sl${G.mpGs===i?' on':''}" data-a="mpgs" data-i="${i}">${s?icon(s.id)+(s.n>1?`<em>${s.n}</em>`:''):''}</button>`).join('');
  const ns=sel?[1,5,10,sel.n].filter((v,i,a)=>v<=sel.n&&a.indexOf(v)===i):[];
  return `<p class="small">Tặng cho <b data-nm="${esc(r.uid)}"></b>: chọn một món trong túi.</p><div class="grid6">${slots}</div>
    ${sel?`<div class="row">${ns.map(n=>`<button class="btn sm" data-a="mpoffer" data-n="${n}">Tặng ${n} ${esc(ITEMS[sel.id].n)}</button>`).join('')}</div>`:''}<button class="btn sm ghost" data-a="mpgift" data-p="">Quay lại</button>`;}
/* ---------- bấm nút ---------- */
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a^="mp"],[data-a="start"]');if(!b)return;const a=b.dataset.a,d=b.dataset;
  if(a==='start'){if(G.nworld==='mp'&&!MP.ok){e.stopImmediatePropagation();uiToast('Đang kết nối thế giới chung, đợi một chút…','');}return;}
  if(!/^mp[a-z]+$/.test(a))return;e.stopImmediatePropagation();e.preventDefault();sfx('pick');
  if(a==='mpw'){G.nworld=d.v==='mp'?'mp':'solo';if(G.nworld==='mp'&&!MP.ok)uiToast('Đang kết nối máy chủ…','');mpFormRefresh();return;}
  if(!G.on)return;const arm=k=>{if(G.mpArm!==k){G.mpArm=k;mpPanelRefresh();return false;}G.mpArm=null;return true;};
  switch(a){case 'mptab':G.mptab=d.t;G.mpGiftTo=null;G.mpArm=null;break;
    case 'mpcol':if(MPCOL.includes(d.v))G.mpCol=d.v;break;case 'mpem':if(MPEMB.includes(d.v))G.mpEm=d.v;break;
    case 'mpmake':mpClanMake();break;case 'mpreq':mpClanReq(d.c||null);break;case 'mpacc':mpClanAccept(d.u,true);break;case 'mpden':mpClanAccept(d.u,false);break;
    case 'mpkick':mpClanKick(d.u);break;case 'mpleave':if(!arm('leave'))return;mpClanLeave();break;
    case 'mpclaim':mpClaim(false);break;case 'mpgrow':mpClaim(true);break;case 'mpunclaim':if(!arm('unclaim'))return;mpPut('claims/'+MP.uid,null);delete MP.claims[MP.uid];uiToast('Đã bỏ lãnh thổ.','');break;
    case 'mpzone':mpZoneSet(true);break;case 'mpunzone':mpZoneSet(false);break;
    case 'mpsay':mpSay();return;case 'mpgift':G.mpGiftTo=d.p||null;G.mpGs=null;G.mptab='near';break;case 'mpgs':G.mpGs=+d.i;break;case 'mpoffer':mpOffer(+d.n);break;
    case 'mpyes':mpAnswer(true);return;case 'mpno':mpAnswer(false);return;}
  mpPanelRefresh();},true);
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&e.target.id==='mpChat'){e.preventDefault();mpSay();}},true);
/* ---------- liên minh ---------- */
function mpSaveMe(p){if(!MP.me)return;Object.assign(MP.me,p);mpPut('players/'+MP.uid,Object.assign({},MP.me));MP.dirty.ui=MP.dirty.remote=true;}
function mpClanDoc(c,patch){return Object.assign({name:c.name,leader:c.leader,members:c.members.slice(),color:c.color,emblem:c.emblem,createdAt:c.createdAt,zone:c.zone,deny:c.deny.slice()},patch||{});}
function mpClanWrite(doc){const v=mpValClan(MP.uid,doc);if(v)MP.clans[MP.uid]=v;mpPut('clans/'+MP.uid,Object.assign({},doc,{w:seed0()}));MP.dirty.ui=MP.dirty.mem=MP.dirty.remote=true;}
function mpClanMake(){if(mpMyClan()){uiToast('Bạn đã ở trong một liên minh.','bad');return;}const i=$('#mpCn');const name=mpTxt(i&&i.value,24);if(name.length<2){uiToast('Đặt tên liên minh (ít nhất 2 chữ).','bad');return;}
  if(Object.values(MP.clans).some(c=>c.name.toLowerCase()===name.toLowerCase()&&c.id!==MP.uid)){uiToast('Đã có liên minh trùng tên này.','bad');return;}
  mpClanWrite({name,leader:MP.uid,members:[MP.uid],color:G.mpCol||MPCOL[0],emblem:G.mpEm||MPEMB[0],createdAt:mpNow(),zone:null,deny:[]});mpSaveMe({clan:MP.uid,req:null});
  uiToast(`🤝 Đã lập ${mpCT(name)}! Rủ mọi người gia nhập nhé.`,'gold');sfx('level');}
function mpClanReq(cid){if(cid&&!MP.clans[cid])return;if(cid&&mpMyClan()){uiToast('Rời liên minh hiện tại trước đã.','bad');return;}mpSaveMe({req:cid});if(cid)uiToast('Đã gửi lời xin gia nhập. Chờ thủ lĩnh đồng ý nhé.','');}
function mpClanAccept(u,yes){const c=MP.clans[MP.uid];if(!c||!mpIdOk(u))return;if(yes){if(c.members.length>=MP_CLANMAX){uiToast('Liên minh đã đủ '+MP_CLANMAX+' người.','bad');return;}if(!c.members.includes(u))mpClanWrite(mpClanDoc(c,{members:c.members.concat(u),deny:c.deny.filter(x=>x!==u)}));uiToast(`Đã nhận ${mpName(u)} vào liên minh.`,'good');}
  else mpClanWrite(mpClanDoc(c,{deny:c.deny.concat(u).slice(-50)}));}
function mpClanKick(u){const c=MP.clans[MP.uid];if(!c||u===MP.uid)return;mpClanWrite(mpClanDoc(c,{members:c.members.filter(x=>x!==u)}));}
function mpClanLeave(){const cid=mpMyClan();if(!cid)return;if(cid===MP.uid){mpPut('clans/'+MP.uid,null);delete MP.clans[MP.uid];uiToast('Liên minh đã giải tán.','');}else uiToast('Bạn đã rời liên minh.','');mpSaveMe({clan:null,req:null});}
// đối chiếu thành viên (chạy thưa, sau mỗi lần dữ liệu đổi)
function mpMembership(){if(!MP.me||!MP.loaded.clans||!MP.loaded.players)return;const me=MP.me,now=mpNow();
  if(me.req){const c=MP.clans[me.req];if(!c||me.req===me.clan)mpSaveMe({req:null});else if(c.members.includes(MP.uid)){mpSaveMe({clan:me.req,req:null});uiToast(`🤝 Bạn đã gia nhập ${mpCT(c.name)}!`,'gold');sfx('level');}
    else if(c.deny.includes(MP.uid)){mpSaveMe({req:null});uiToast(`${mpCT(c.name)} chưa nhận bạn lúc này.`,'');}}
  if(me.clan){const c=MP.clans[me.clan];if(!c||!c.members.includes(MP.uid)){if(!MP.badT)MP.badT=now;else if(now-MP.badT>4000){MP.badT=0;mpSaveMe({clan:null});uiToast('Bạn không còn ở trong liên minh.','');}}else MP.badT=0;}else MP.badT=0;
  const c=MP.clans[MP.uid];if(c&&me.clan===MP.uid){const keep=c.members.filter(u=>{if(u===MP.uid)return true;const p=MP.players[u];return !p||p.clan===MP.uid||p.req===MP.uid;});const deny=c.deny.filter(u=>{const p=MP.players[u];return p&&p.req===MP.uid;});
    if(keep.length!==c.members.length||deny.length!==c.deny.length)mpClanWrite(mpClanDoc(c,{members:keep,deny}));}}
/* ---------- lãnh thổ ---------- */
function mpClaimWhy(x,z,r,kind){if(landFar())return 'Vùng đất xa là đất tranh chấp: không cắm mốc được. Nhà chính và lãnh thổ đặt ở Đất Trung Tâm.';if(Math.hypot(x-SPAWN[0],z-SPAWN[1])<MP_SPAWN_FREE+r)return 'Gần Trảng Khởi Đầu quá: đó là đất chung của mọi người. Đi xa thêm một chút.';
  if(!wIn(x,z,0.95))return 'Sát mép thế giới quá.';const my=mpMyClan();
  for(const u in MP.claims){if(u===MP.uid)continue;const c=MP.claims[u];if(Math.hypot(x-c.x,z-c.z)<r+c.r&&!(my&&mpClanOf(u)===my))return `Chồng lên lãnh thổ của ${mpName(u)}. Chọn chỗ khác.`;}
  for(const id in MP.clans){const cl=MP.clans[id];if(!cl.zone||id===my)continue;if(Math.hypot(x-cl.zone.x,z-cl.zone.z)<r+cl.zone.r)return `Chồng lên vùng đất của ${mpCT(cl.name)}.`;}
  if(kind==='zone')for(const u in MP.claims){const c=MP.claims[u];if(u!==MP.uid&&mpClanOf(u)!==my&&Math.hypot(x-c.x,z-c.z)<r+c.r)return `Chồng lên lãnh thổ của ${mpName(u)}.`;}
  return '';}
function mpClaim(grow){const c=MP.claims[MP.uid],R=mpClaimR();const x=grow&&c?c.x:+P.x.toFixed(1),z=grow&&c?c.z:+P.z.toFixed(1);const w=mpClaimWhy(x,z,R,'claim');if(w){uiToast(w,'bad');sfx('no');return;}
  const d={x,z,r:R,clan:mpMyClan(),at:mpNow(),w:seed0()};MP.claims[MP.uid]={x,z,r:R};mpPut('claims/'+MP.uid,d);MP.tick.ring=-9;MP.dirty.remote=true;uiToast(`🚩 Đã cắm mốc lãnh thổ bán kính ${Math.round(R/20)} m. Công trình xây xong trong này sẽ hiện cho mọi người.`,'gold');sfx('build');}
function mpZoneSet(on){const c=MP.clans[MP.uid];if(!c)return;if(!on){mpClanWrite(mpClanDoc(c,{zone:null}));return;}const r=mpZoneR(c),w=mpClaimWhy(P.x,P.z,r,'zone');if(w){uiToast(w,'bad');return;}
  mpClanWrite(mpClanDoc(c,{zone:{x:+P.x.toFixed(1),z:+P.z.toFixed(1),r}}));MP.tick.ring=-9;uiToast('🏕️ Đã đặt vùng đất chung của liên minh.','gold');}
// đất của người khác (khác liên minh) → không xây được
function mpLandWhy(x,z){if(landFar())return null;const my=mpMyClan();
  for(const u in MP.claims){if(u===MP.uid)continue;const c=MP.claims[u];if(Math.abs(x-c.x)>c.r||Math.abs(z-c.z)>c.r)continue;if(Math.hypot(x-c.x,z-c.z)<c.r&&!(my&&mpClanOf(u)===my))return `🚫 Đất của ${mpName(u)}${mpClanOf(u)?' ('+mpCT(MP.clans[mpClanOf(u)].name)+')':''}. Chỉ người cùng liên minh mới xây ở đây.`;}
  for(const id in MP.clans){const cl=MP.clans[id];if(!cl.zone||id===my)continue;if(Math.hypot(x-cl.zone.x,z-cl.zone.z)<cl.zone.r)return `🚫 Vùng đất chung của ${mpCT(cl.name)}. Xin gia nhập để cùng xây.`;}
  return '';}
{const _bu=buildUpdate;buildUpdate=function(){_bu();const B=G.build;if(!B||!B.pos||!B.ok||B.rm||!mpOn())return;const w=mpLandWhy(B.pos.x,B.pos.z);if(!w)return;
  B.ok=false;B.why=w;if(B.mat)B.mat.color.set(0xff6a5a);if(B.uiT===G.t||G.t-(B.mpUiT||0)>0.5){B.mpUiT=G.t;uiBuildBar(true,B.def,w);}};}
// nơi công trình của MÌNH được chia sẻ
function mpShareAt(x,z){if(landFar())return false;const c=MP.claims[MP.uid];if(c&&Math.hypot(x-c.x,z-c.z)<c.r+20)return true;const cl=MP.clans[mpMyClan()];return !!(cl&&cl.zone&&Math.hypot(x-cl.zone.x,z-cl.zone.z)<cl.zone.r+20);}
// nơi công trình của người khác được phép hiện (chống vẽ bậy khắp bản đồ)
// (trước đây chỉ hiện nhà nằm trong đất đã cắm mốc → hầu như không ai thấy nhà ai. Giờ nhà ở đâu cũng hiện, trừ khi nằm trong đất của người / liên minh KHÁC)
function mpAllowAt(uid,x,z){if(landFar())return true;const c=MP.claims[uid];if(c&&Math.hypot(x-c.x,z-c.z)<c.r+24)return true;const mc=mpClanOf(uid),cl=MP.clans[mc];if(cl&&cl.zone&&Math.hypot(x-cl.zone.x,z-cl.zone.z)<cl.zone.r+24)return true;
  const CL=arguments[3]||MP.claims;for(const u in CL){if(u===uid)continue;const o=CL[u];if(Math.hypot(x-o.x,z-o.z)<o.r-4&&!(mc&&mpClanOf(u)===mc))return false;}
  for(const id in MP.clans){if(id===mc)continue;const z2=MP.clans[id].zone;if(z2&&Math.hypot(x-z2.x,z-z2.z)<z2.r-4)return false;}return true;}
/* ---------- chia sẻ công trình của mình (gộp ghi: 5 giây sau thay đổi cuối) ---------- */
function mpEncodeMine(){const a=[];const R=v=>Math.round(v*10)/10;let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const b of S.builds){if(b.prog!=null||b.remote||!pieceDef(b.k))continue;if(b.x<x0)x0=b.x;if(b.x>x1)x1=b.x;if(b.z<z0)z0=b.z;if(b.z>z1)z1=b.z;a.push(b.id+','+b.k+','+R(b.x)+','+R(b.y)+','+R(b.z)+','+(Math.round((b.r||0)*100)/100)+','+((b.lv|0)||0));if(a.length>=MP_BCAP)break;}return {s:a.join(';'),n:a.length,h:a.length?[Math.round((x0+x1)/2),Math.round((z0+z1)/2),Math.round(Math.hypot(x1-x0,z1-z0)/2)]:null};}
function mpSigTick(){if(MP.ro)return;const e=mpEncodeMine(),now=mpNow();if(typeof mpFlatStr==='function')e.s+='#'+mpFlatStr();/* san nền mới cũng phải đẩy lên */if(e.s!==MP.bSig){MP.bSig=e.s;MP.bSigT=now;return;}if(MP.bDone===e.s||MP.bBusy||now-MP.bSigT<5000)return;
  if(MP.bDone===null&&!e.n&&!MP.bHad){MP.bDone=e.s;return;}mpPushBuilds(e);}
async function mpPushBuilds(e){MP.bBusy=true;const base=mpBPath(MP.uid),ver=mpNow().toString(36)+Math.random().toString(36).slice(2,6);
  try{let parts=0,d=e.s.split('#')[0];if(d.length>MP_DOCMAX){parts=Math.ceil(d.length/MP_DOCMAX);for(let i=0;i<parts;i++)await MP.db.doc(base+'/p/'+i).set({ver,s:d.slice(i*MP_DOCMAX,(i+1)*MP_DOCMAX)});d='';}
    await MP.db.doc(base).set({v:1,w:S.seed,d,parts,ver,n:e.n,at:mpNow(),fl:typeof mpFlatStr==='function'?mpFlatStr():''});MP.bDone=e.s;MP.bInfo={n:e.n,at:mpNow()};MP.dirty.ui=true;
    // ghi "chỗ ở" (tâm + bán kính cụm công trình) vào hồ sơ để người khác biết đến gần thì tải nhà mình
    if(!landFar()&&MP.me&&JSON.stringify(MP.me.h||null)!==JSON.stringify(e.h||null))mpSaveMe({h:e.h});
    /* vùng xa: ghi chỗ có công trình theo từng vùng để người khác tới gần thì tải (kể cả khi mình vắng) */
    if(landFar()&&MP.me){const fl=Object.assign({},MP.me.fl||{});if(JSON.stringify(fl[S.land]||null)!==JSON.stringify(e.h||null)){if(e.h)fl[S.land]=e.h;else delete fl[S.land];mpSaveMe({fl});}}}catch(er){mpErr(er&&er.code);MP.bSigT=mpNow()+20000;}MP.bBusy=false;}
/* ---------- công trình của người khác: tải khi ở gần, vẽ chung đường instancing, chỉ để nhìn / va chạm ---------- */
function mpNearTick(){const now=new Map();const add=(u,d)=>{if(u===MP.uid||!mpIdOk(u))return;if(!now.has(u)||now.get(u)>d)now.set(u,d);};
  if(landFar()){for(const r of MP.rp.values())if(r.uid)add(r.uid,Math.hypot(P.x-r.x,P.z-r.z)-200);for(const u in MP.players){const f=MP.players[u].fl&&MP.players[u].fl[S.land];if(f)add(u,Math.hypot(P.x-f[0],P.z-f[1])-f[2]);}/* vùng xa: thấy công trình của những người đang có mặt ở vùng đó */}
  else for(const u in MP.claims){const c=MP.claims[u];add(u,Math.hypot(P.x-c.x,P.z-c.z)-c.r);}
  for(const u in MP.players){const p=MP.players[u];if(!landFar()&&p.h&&p.w===seed0())add(u,Math.hypot(P.x-p.h[0],P.z-p.h[1])-p.h[2]);}
  for(const id in MP.clans){const cl=MP.clans[id];if(!cl.zone||landFar())continue;const d=Math.hypot(P.x-cl.zone.x,P.z-cl.zone.z)-cl.zone.r;if(d<MP_FAR)for(const m of cl.members){const p=MP.players[m];if(!(p&&p.h))add(m,d+40);}}
  const want=[...now].filter(([u,d])=>d<MP_NEAR||(MP.bsub.has(u)&&d<MP_FAR)).sort((a,b)=>a[1]-b[1]).slice(0,MP_MAXSUB).map(a=>a[0]);const W=new Set(want);
  for(const [u,s] of MP.bsub)if(!W.has(u)){try{s.un();}catch(e){}MP.bsub.delete(u);MP.braw.delete(u);mpRemoteApply(u);}
  for(const u of want)if(!MP.bsub.has(u)){const s={un:()=>{},ver:null};MP.bsub.set(u,s);try{s.un=MP.db.doc(mpBPath(u)).onSnapshot(sn=>mpBuildSnap(u,s,sn),()=>{});}catch(e){}}}
async function mpBuildSnap(u,s,sn){if(MP.bsub.get(u)!==s)return;if(!sn.exists){MP.braw.set(u,[]);mpRemoteApply(u);return;}const d=sn.data()||{};if(d.w!==S.seed){MP.braw.set(u,[]);mpRemoteApply(u);return;}
  const ver=typeof d.ver==='string'?d.ver.slice(0,40):'';if(ver&&ver===s.ver)return;let str=typeof d.d==='string'?d.d:'';const parts=mpNum(d.parts,0,40)?d.parts|0:0;
  if(parts){str='';for(let i=0;i<parts;i++){const p=await mpGetDoc(mpBPath(u)+'/p/'+i);if(!p||p.ver!==ver||typeof p.s!=='string')return;str+=p.s;}if(MP.bsub.get(u)!==s)return;}
  s.ver=ver;MP.braw.set(u,mpDecode(str));try{if(typeof dbFlats==='function')dbFlats(u,d.fl,MP.braw.get(u));}catch(e){console.warn('đồng bộ nền',e);}mpRemoteApply(u);}
function mpDecode(str){const out=[];if(!str)return out;const L=str.split(';');for(let i=0;i<L.length&&out.length<MP_BCAP;i++){const f=L[i].split(',');if(f.length!==7)continue;
    const id=+f[0],k=f[1],x=+f[2],y=+f[3],z=+f[4],r=+f[5],lv=+f[6];if(!(id>=0&&id<1e9&&Math.floor(id)===id)||!/^[A-Za-z0-9_]{1,40}$/.test(k)||!pieceDef(k))continue;
    if(!mpNum(x,-WSIZE,WSIZE)||!mpNum(z,-WSIZE,WSIZE)||!mpNum(y,-800,4000)||!mpNum(r,0,4)||!mpNum(lv,0,LVMAX)||Math.floor(lv)!==lv)continue;out.push({lid:id,k,x,y,z,r,lv});}return out;}
function mpRk(u){let n=MP.rk.get(u);if(n==null){n=++MP.rkN;MP.rk.set(u,n);}return n;}
function mpRemoteApply(u){const raw=MP.braw.get(u)||[],cur=MP.bcur.get(u)||new Map(),n=mpRk(u),want=new Map();let room=MP_RCAP-(MP.rTot-cur.size);
  /* CHỐNG GIẬT: trước mỗi công trình bị so với TOÀN BỘ đất cắm trên máy chủ (công trình × đất cắm = hàng triệu phép so mỗi lượt). Giờ lọc trước các vùng đất nằm gần cụm công trình này. */
  let CL=null;if(raw.length){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const e of raw){if(e.x<x0)x0=e.x;if(e.x>x1)x1=e.x;if(e.z<z0)z0=e.z;if(e.z>z1)z1=e.z;}CL={};for(const c in MP.claims){const o=MP.claims[c];if(o.x+o.r>x0&&o.x-o.r<x1&&o.z+o.r>z0&&o.z-o.r<z1)CL[c]=o;}if(MP.claims[u])CL[u]=MP.claims[u];}
  for(const e of raw){if(room<=0)break;if(!mpAllowAt(u,e.x,e.z,CL))continue;const id='m'+n+'_'+e.lid,sg=e.k+'|'+e.x+'|'+e.y+'|'+e.z+'|'+e.r+'|'+e.lv;want.set(id,{sg,e});room--;}
  for(const [id,o] of cur){const w=want.get(id);if(!w||w.sg!==o.sg){MP.rq.push({rm:o.b});cur.delete(id);MP.rTot--;}}
  for(const [id,w] of want){if(cur.has(id))continue;const b={id,k:w.e.k,x:w.e.x,y:w.e.y,z:w.e.z,r:w.e.r,lv:w.e.lv,remote:u};cur.set(id,{sg:w.sg,b});MP.rTot++;MP.rq.push({add:b});}
  if(cur.size)MP.bcur.set(u,cur);else MP.bcur.delete(u);}
function mpQueueTick(){if(!MP.rq.length)return;let n=0,rm=null;while(MP.rq.length&&n<40){const op=MP.rq.shift();n++;
    try{if(op.add){if(!BYID.has(op.add.id))structAdd(op.add,true);}else if(op.rm&&BYID.get(op.rm.id)===op.rm){structRemove(op.rm);(rm||(rm=[])).push(op.rm);}}catch(e){console.warn('công trình chung',e);}}
  // gỡ món của người khác có thể xoá nhầm dấu ô của món mình ở cùng ô: đánh dấu lại món mình quanh đó
  if(rm)for(const b of S.builds){for(const o of rm)if(Math.abs(b.x-o.x)<90&&Math.abs(b.z-o.z)<90){occMark(b,b.id);break;}}}
/* ---------- người chơi khác: vị trí, mô hình, bảng tên ---------- */
function mpRoomInit(){const R=MP.room;if(!R||MP.roomOn||!MP.started)return;MP.roomOn=true;
  try{MP.unsubs.push(R.onPeers(ch=>mpPeers(ch),()=>{}));}catch(e){}
  try{MP.unsubs.push(R.on('chat',m=>mpChatHear(m),()=>{}));}catch(e){}
  try{MP.unsubs.push(R.on('trade',m=>mpTradeHear(m),()=>{}));}catch(e){}}
function mpPeers(ch){const seen=new Set();for(const p of ch.peers){if(p.sameTab){MP.myPeer=p.peer;continue;}if(p.isMe||p.kind!=='viewer')continue;const v=mpValPres(p);if(!v)continue;seen.add(p.peer);
    let r=MP.rp.get(p.peer);if(!r){r={peer:p.peer,x:v.x,y:v.y,z:v.z,ry:v.ry,o:null,tag:null,tagK:'',gait:0,spd:0,ph:Math.random()*6,ok:true};MP.rp.set(p.peer,r);if(ch.joined&&ch.joined.some(j=>j.peer===p.peer)&&MP.tick.pres>0)uiToast('👋 '+mpName(v.uid)+' đang ở thế giới chung.','');}
    if(r.pres!==p.presence){r.pres=p.presence;r.tx=v.x;r.ty=v.y;r.tz=v.z;r.tr=v.ry;r.a=v.a;r.uid=v.uid;r.cl=v.cl;if(r.lk!==v.lk&&r.o){G.sc.remove(r.o);r.o=null;}r.lk=v.lk;r.seen=G.t;}}
  for(const [k,r] of MP.rp)if(!seen.has(k)){if(r.o)G.sc.remove(r.o);if(r.tag)G.sc.remove(r.tag);MP.rp.delete(k);}MP.dirty.ui=true;}
function mpValPres(p){const s=p.presence;if(!s||typeof s!=='object'||!S||s.w!==S.seed)return null;const L=WSIZE;
  if(!mpNum(s.x,-L,L)||!mpNum(s.z,-L,L)||!mpNum(s.y,-1000,5000))return null;const uid=mpIdOk(p.by)?p.by:mpIdOk(s.u)?s.u:null;if(!uid||uid===MP.uid)return null;
  return {x:s.x,y:s.y,z:s.z,ry:mpNum(s.ry,-100,100)?s.ry:0,a:MPA.has(s.a)?s.a:'idle',lk:mpNum(s.lk,0,LOOKS.length-1)?s.lk|0:0,cl:mpIdOk(s.cl)?s.cl:'',uid};}
function mpAnim(){if(G.sleeping)return 'sleep';if(G.ride||G.sit)return 'sit';if(G.work){const st=G.work.steps&&G.work.steps[G.work.i],a=st&&st.a;return MPA.has(a)?a:'whittle';}if(G.swim)return 'swim';
  if(G.act)return P.anim==='chop'&&P.toolId==='pick'?'mine':P.anim==='hammer'?'hammer':P.anim==='gather'?'gather':'chop';if(P.speed>8)return G.sneak?'sneak':G.running?'run':'walk';return 'idle';}
function mpPresTick(){const R=MP.room;if(!R)return;const r1=v=>Math.round(v*10)/10;const o={w:S.seed,u:MP.uid,x:r1(P.x),y:r1(P.y),z:r1(P.z),ry:Math.round(P.ry*100)/100,a:mpAnim(),lk:S.look|0,ap:typeof crPres==='function'?crPres():'',cl:mpMyClan()||'',wr:typeof wearPres==='function'?wearPres():''};
  const k=o.x+','+o.y+','+o.z+','+o.ry+o.a+o.cl+o.wr;if(k===MP.presK&&mpNow()-MP.presT<20000)return;MP.presK=k;MP.presT=mpNow();R.presence(o).catch(()=>{});}
function mpModel(lk){let o=null;try{if(K3.char2)o=K3.char2(Object.assign({sleeves:true},(LOOKS[lk]||LOOKS[0]).o,LOOK2[lk]||{}));}catch(e){}if(!o)try{o=K3.char((LOOKS[lk]||LOOKS[0]).o);}catch(e){}
  if(!o)o=new THREE.Group();o.traverse(m=>{if(m.isMesh)m.castShadow=true;});try{seasonPatchAll(o);}catch(e){}return o;}
function mpTagMake(txt,col){const cv=document.createElement('canvas');cv.width=256;cv.height=64;const c=cv.getContext('2d');c.font='700 28px "Be Vietnam Pro",system-ui,sans-serif';c.textAlign='center';c.textBaseline='middle';
  let t=txt;while(c.measureText(t).width>236&&t.length>2)t=t.slice(0,-2)+'…';c.lineWidth=6;c.strokeStyle='rgba(24,14,8,.9)';c.strokeText(t,128,28);c.fillStyle='#fff3dc';c.fillText(t,128,28);
  if(col){c.fillStyle=col;c.fillRect(78,52,100,7);}const tx=new THREE.CanvasTexture(cv);tx.encoding=THREE.sRGBEncoding;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false,fog:false}));sp.scale.set(52,13,1);sp.renderOrder=5;return sp;}
function mpAvTick(dt){const wt=performance.now()/1000;if(wt-MP.tick.sort>0.5){MP.tick.sort=wt;const L=[...MP.rp.values()];L.forEach(r=>{r.d=Math.hypot(r.x-P.x,r.z-P.z);});L.sort((a,b)=>a.d-b.d);MP.vis=new Set(L.filter(r=>r.d<MP_NEAR).slice(0,MP_SHOW));}
  const vis=MP.vis||new Set(),k=Math.min(1,dt*7);
  for(const r of MP.rp.values()){if(r.tx==null)continue;const dx=r.tx-r.x,dz=r.tz-r.z,j=Math.abs(dx)+Math.abs(dz)>500;r.x=j?r.tx:r.x+dx*k;r.z=j?r.tz:r.z+dz*k;r.y=j?r.ty:r.y+(r.ty-r.y)*k;
    let da=r.tr-r.ry;da=Math.atan2(Math.sin(da),Math.cos(da));r.ry+=da*k;r.spd=r.spd*0.85+Math.hypot(dx,dz)*0.15*5;const on=vis.has(r);
    if(!on){if(r.o&&r.o.visible){r.o.visible=false;if(r.tag)r.tag.visible=false;}continue;}
    if(!r.o){r.o=mpModel(r.lk);r.rig=r.o.userData&&r.o.userData.rig;G.sc.add(r.o);}if(!r.o.visible)r.o.visible=true;r.o.position.set(r.x,r.y,r.z);r.o.rotation.y=r.ry;
    const nm=mpName(r.uid),col=mpColOf(r.uid)||'',tk=nm+col;if(r.tagK!==tk){if(r.tag){G.sc.remove(r.tag);r.tag.material.map.dispose();r.tag.material.dispose();}r.tag=mpTagMake(nm,col);r.tagK=tk;G.sc.add(r.tag);}
    r.tag.visible=r.d<900;r.tag.position.set(r.x,r.y+48,r.z);
    if(r.rig&&K3.char2Pose&&r.d<700){const a=r.a||'idle';let ph=G.t+r.ph,o={};if(a==='walk'||a==='run'||a==='sneak'||a==='swim'){r.gait+=(Math.max(40,r.spd)/112*10.5)/(Math.PI*2)*dt;ph=r.gait;}else if(!/^(idle|sit|sleep|drink)$/.test(a)){o.phase=((G.t+r.ph)/0.72)%1;}
      try{K3.char2Pose(r.rig,a,ph,o);}catch(e){}}}}
/* ---------- tìm người gần để tặng đồ ---------- */
{const _ft=findTarget;findTarget=function(){const t=_ft();if(!mpOn()||G.work||G.sit||G.ride||G.build||!MP.vis)return t;let best=null,bd=REACH+14;
  for(const r of MP.vis){const d=Math.hypot(r.x-P.x,r.z-P.z);if(d<bd&&Math.abs(r.y-P.y)<40){bd=d;best=r;}}if(!best||(t&&t.d!=null&&t.d<bd-6))return t;
  const tb=best.tb||(best.tb={x:0,y:0,z:0});tb.x=best.x;tb.y=best.y+8;tb.z=best.z;return {type:'mpp',p:best,d:bd,b:tb};};}
{const _ti=targetInfo;targetInfo=function(t){if(t&&t.type==='mpp')return {name:mpName(t.p.uid),verb:'Tặng đồ',ok:true,icon:'flower'};return _ti(t);};}
{const _as=actStart;actStart=function(t){if(t&&t.type==='mpp'){G.mptab='near';G.mpGiftTo=t.p.peer;G.mpGs=null;uiOpen('clan',{});return;}return _as(t);};}
/* ---------- tặng đồ: hỏi → đồng ý → người tặng trừ đồ + ghi biên nhận → người nhận đọc biên nhận, nhận đúng một lần ---------- */
const mpTid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);
function mpEmit(topic,data){if(!MP.room)return Promise.resolve(false);return MP.room.emit(topic,data).then(()=>true,e=>{if(e&&e.code==='not_permitted'&&!MP.npWarn){MP.npWarn=1;uiToast('Bạn chưa được phép gửi tin trên trang này.','bad');}return false;});}
function mpOffer(n){const r=MP.rp.get(G.mpGiftTo),s=S.inv[G.mpGs];if(!r||!s||!r.uid){uiToast('Người đó đã đi xa.','bad');return;}if(Math.hypot(r.x-P.x,r.z-P.z)>160){uiToast('Lại gần hơn để tặng.','bad');return;}
  n=Math.max(1,Math.min(n|0,invCount(s.id)));const tid=mpTid();MP.offers.set(tid,{peer:r.peer,uid:r.uid,id:s.id,n,at:mpNow()});
  mpEmit('trade',{k:'offer',to:r.peer,tid,id:s.id,n}).then(ok=>{if(ok)uiToast(`Đã mời ${mpName(r.uid)} nhận ${n} ${ITEMS[s.id].n}. Chờ họ đồng ý…`,'');});G.mpGiftTo=null;G.mpGs=null;}
function mpTradeHear(m){if(!m||m.isMe||!mpOn()||!m.data||typeof m.data!=='object')return;const d=m.data;if(d.to!==MP.myPeer||typeof d.tid!=='string'||!/^[a-z0-9]{6,24}$/.test(d.tid)||!mpIdOk(m.by))return;
  if(d.k==='offer'){if(!ITEMS[d.id]||!mpNum(d.n,1,999)||Math.floor(d.n)!==d.n||MP.inbox.length>4||S.mpGot.includes(d.tid))return;MP.inbox.push({tid:d.tid,peer:m.peer,uid:m.by,id:d.id,n:d.n,at:mpNow()});mpAskShow();return;}
  const o=MP.offers.get(d.tid);if(!o||o.peer!==m.peer||o.uid!==m.by)return;
  if(d.k==='no'){MP.offers.delete(d.tid);uiToast(`${mpName(o.uid)} chưa nhận ${ITEMS[o.id].n}.`,'');return;}
  if(d.k==='acc'){MP.offers.delete(d.tid);if(mpNow()-o.at>90000){uiToast('Lời tặng đã quá hạn.','');return;}if(invCount(o.id)<o.n){uiToast('Bạn không còn đủ đồ để tặng.','bad');mpEmit('trade',{k:'no',to:o.peer,tid:d.tid});return;}mpGiftSend(d.tid,o);}}
async function mpGiftSend(tid,o){if(!invTake(o.id,o.n))return;uiHotbar();save();const L=(MP.myGifts.list||[]).concat({tid,to:o.uid,id:o.id,n:o.n,at:mpNow()}).slice(-12);
  try{await MP.db.doc('gifts/'+MP.uid).set({list:L});MP.myGifts.list=L;}catch(e){invAdd(o.id,o.n);uiHotbar();save();uiToast('Chưa gửi được, đã trả đồ về túi.','bad');return;}
  mpEmit('trade',{k:'give',to:o.peer,tid});uiToast(`🎁 Đã tặng ${o.n} ${ITEMS[o.id].n} cho ${mpName(o.uid)}.`,'good');sfx('craft');}
function mpAskShow(){let el=$('#mpask');const q=MP.inbox[0];if(!q){if(el)el.hidden=true;return;}if(!el){el=document.createElement('div');el.id='mpask';el.className='mpask';document.body.appendChild(el);}
  el.innerHTML='<p></p><div class="row"><button class="btn sm" data-a="mpyes">Nhận</button><button class="btn sm ghost" data-a="mpno">Không</button></div>';el.querySelector('p').textContent=`🎁 ${mpName(q.uid)} muốn tặng bạn ${q.n} ${ITEMS[q.id].n}.`;el.hidden=false;}
function mpAnswer(yes){const q=MP.inbox.shift();mpAskShow();if(!q)return;if(yes&&!invFits(q.id,q.n)){uiToast('Túi đầy, không nhận được.','bad');yes=false;}
  mpEmit('trade',{k:yes?'acc':'no',to:q.peer,tid:q.tid});if(!yes)return;q.tries=0;MP.waiting=MP.waiting||new Map();MP.waiting.set(q.tid,q);[2500,6000,15000,30000].forEach(ms=>setTimeout(()=>mpGiftClaim(q),ms));}
async function mpGiftClaim(q){if(!MP.waiting||!MP.waiting.has(q.tid)||S.mpGot.includes(q.tid))return;const d=await mpGetDoc('gifts/'+q.uid);const L=d&&Array.isArray(d.list)?d.list:[];
  const g=L.find(x=>x&&x.tid===q.tid&&x.to===MP.uid);if(!g||g.id!==q.id||!mpNum(g.n,1,999)||!ITEMS[g.id]||S.mpGot.includes(q.tid))return;MP.waiting.delete(q.tid);
  S.mpGot.push(q.tid);if(S.mpGot.length>300)S.mpGot.splice(0,S.mpGot.length-300);give({[g.id]:g.n|0},[P.x,P.y+30,P.z]);uiToast(`🎁 Nhận ${g.n|0} ${ITEMS[g.id].n} từ ${mpName(q.uid)}.`,'good');save();}
// tin 'give' tới thì đọc biên nhận ngay
{const _th=mpTradeHear;mpTradeHear=function(m){_th(m);const d=m&&m.data;if(d&&d.k==='give'&&d.to===MP.myPeer&&MP.waiting&&MP.waiting.has(d.tid)){const q=MP.waiting.get(d.tid);if(q.uid===m.by)mpGiftClaim(q);}};}
/* ---------- trò chuyện liên minh: room (tức thì) + 10 tin gần nhất mỗi người trong db ---------- */
function mpSay(){const i=$('#mpChat');const t=mpTxt(i&&i.value,160);const cid=mpMyClan();if(!t||!cid)return;i.value='';const at=mpNow();mpChatAdd(MP.uid,t,at);mpEmit('chat',{c:cid,t,at});
  const m=MP.myChat&&MP.myChat.clan===cid?MP.myChat.msgs:[];MP.myChat={clan:cid,msgs:m.concat({t,at}).slice(-10)};mpPut('chat/'+MP.uid,{clan:cid,msgs:MP.myChat.msgs});mpPanelRefresh();}
function mpChatAdd(by,t,at){const k=by+':'+at;if(MP.chatSeen.has(k))return false;MP.chatSeen.add(k);MP.chat.push({by,t,at});MP.chat.sort((a,b)=>a.at-b.at);if(MP.chat.length>60)MP.chat.splice(0,MP.chat.length-60);return true;}
function mpChatHear(m){if(!m||m.isMe||!mpOn()||!m.data||typeof m.data!=='object')return;const d=m.data,cid=mpMyClan();if(!cid||d.c!==cid||!mpIdOk(m.by)||mpClanOf(m.by)!==cid)return;const t=mpTxt(d.t,160);if(!t)return;
  const at=mpNum(d.at,0,1e14)?d.at:mpNow();if(mpChatAdd(m.by,t,at)){if(G.panel==='clan'&&G.mptab==='chat')mpPanelRefresh();else{uiToast('💬 '+mpName(m.by)+': '+t,'');const dot=document.querySelector('#menu .mp-dot');if(dot)dot.hidden=false;}}}
function mpChatSub(){const cid=mpMyClan()||null;if(cid===MP.chatClan)return;MP.chatClan=cid;if(MP.chatUn){try{MP.chatUn();}catch(e){}MP.chatUn=null;}MP.chat=[];MP.chatSeen=new Set();if(!cid)return;
  MP.db.doc('chat/'+MP.uid).get().then(s=>{const d=s.exists&&s.data();if(d&&d.clan===cid&&Array.isArray(d.msgs))MP.myChat={clan:cid,msgs:d.msgs.filter(x=>x&&typeof x.t==='string'&&mpNum(x.at,0,1e14)).slice(-10)};}).catch(()=>{});
  try{MP.chatUn=MP.db.collection('chat').where('clan','==',cid).limit(60).onSnapshot(s=>{if(MP.chatClan!==cid)return;for(const d of s.docs){if(!mpIdOk(d.id)||mpClanOf(d.id)!==cid)continue;const v=d.data();if(!v||!Array.isArray(v.msgs))continue;
      for(const x of v.msgs.slice(-10)){if(!x||!mpNum(x.at,0,1e14))continue;const t=mpTxt(x.t,160);if(t)mpChatAdd(d.id,t,x.at);}}MP.dirty.ui=true;},()=>{});}catch(e){}}
/* ---------- viền lãnh thổ trên mặt đất (vạch đứt quãng theo màu liên minh) ---------- */
function mpRingMesh(x,z,r,col,thick){const T=THREE,N=Math.max(48,Math.min(140,Math.round(r/7))),pos=[],idx=[];const w=thick||3;
  for(let i=0;i<=N;i++){const a=i/N*Math.PI*2,c=Math.cos(a),s=Math.sin(a);for(const rr of [r-w,r+w]){const px=x+c*rr,pz=z+s*rr;const y=wdAt(px,pz)>0.5?waterAt(px,pz)+1.2:hAt(px,pz)+1.6;pos.push(px,y,pz);}}
  for(let i=0;i<N;i+=2){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);
  const m=new T.Mesh(g,new T.MeshBasicMaterial({color:new T.Color(col),transparent:true,opacity:0.55,depthWrite:false,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2}));m.renderOrder=2;m.frustumCulled=true;g.computeBoundingSphere();return m;}
function mpRingTick(){const want=new Map(),my=mpMyClan();const L=[];
  for(const u in MP.claims){const c=MP.claims[u],d=Math.hypot(P.x-c.x,P.z-c.z)-c.r;if(d<1600)L.push({k:'c'+u,x:c.x,z:c.z,r:c.r,col:u===MP.uid?'#f2c55a':mpColOf(u)||'#d8d0c0',d,w:3});}
  for(const id in MP.clans){const z=MP.clans[id].zone;if(!z)continue;const d=Math.hypot(P.x-z.x,P.z-z.z)-z.r;if(d<1800)L.push({k:'z'+id,x:z.x,z:z.z,r:z.r,col:MP.clans[id].color,d,w:id===my?5:4});}
  L.sort((a,b)=>a.d-b.d).slice(0,14).forEach(o=>want.set(o.k+'|'+o.x+'|'+o.z+'|'+o.r+'|'+o.col,o));
  for(const [k,m] of MP.rings)if(!want.has(k)){G.sc.remove(m);m.geometry.dispose();m.material.dispose();MP.rings.delete(k);}
  for(const [k,o] of want)if(!MP.rings.has(k)){const m=mpRingMesh(o.x,o.z,o.r,o.col,o.w);G.sc.add(m);MP.rings.set(k,m);}}
/* ---------- bản đồ nhỏ + bản đồ lớn ---------- */
{const _mt=miniTick;miniTick=function(){const t0=G.miniT;_mt();if(G.miniT===t0||!mpOn())return;try{mpMini();}catch(e){}};}
function mpMini(){const cv=$('#mini');if(!cv)return;const pr=Math.min(2,devicePixelRatio||1),W=cv.clientWidth||130,R=900,sc=W/(R*2),c=cv.getContext('2d');c.setTransform(pr,0,0,pr,0,0);c.save();c.beginPath();c.arc(W/2,W/2,W/2-1,0,7);c.clip();
  const P2=(x,z)=>[W/2+(x-P.x)*sc,W/2+(z-P.z)*sc];c.setLineDash([3,3]);c.lineWidth=1.5;
  const ring=(x,z,r,col)=>{if(Math.hypot(x-P.x,z-P.z)>R*1.5+r)return;const [a,b]=P2(x,z);c.strokeStyle=col;c.beginPath();c.arc(a,b,r*sc,0,7);c.stroke();};
  for(const u in MP.claims){const k=MP.claims[u];ring(k.x,k.z,k.r,u===MP.uid?'#f2c55a':mpColOf(u)||'rgba(240,230,210,.8)');}for(const id in MP.clans){const z=MP.clans[id].zone;if(z)ring(z.x,z.z,z.r,MP.clans[id].color);}
  c.setLineDash([]);for(const r of MP.rp.values()){if(Math.abs(r.x-P.x)>R||Math.abs(r.z-P.z)>R)continue;const [a,b]=P2(r.x,r.z);c.fillStyle=mpColOf(r.uid)||'#ffffff';c.strokeStyle='#1a0e06';c.lineWidth=1.2;c.beginPath();c.arc(a,b,3.4,0,7);c.fill();c.stroke();}c.restore();}
{const _md=mapDraw;mapDraw=function(){_md();if(!mpOn())return;try{mpMapDraw();}catch(e){}};}
function mpMapDraw(){const cv=$('#mapcv');if(!cv)return;const pr=Math.min(2,devicePixelRatio||1),W=cv.width/pr,V=mapView(),c=cv.getContext('2d');c.setTransform(pr,0,0,pr,0,0);const sx=x=>(x-V.x0)/V.span*W,sy=z=>(z-V.z0)/V.span*W,k=W/V.span;
  const ring=(x,z,r,col,fill)=>{c.beginPath();c.arc(sx(x),sy(z),Math.max(2,r*k),0,7);if(fill){c.fillStyle=fill;c.fill();}c.setLineDash([4,3]);c.lineWidth=2;c.strokeStyle=col;c.stroke();c.setLineDash([]);};
  for(const id in MP.clans){const z=MP.clans[id].zone;if(z)ring(z.x,z.z,z.r,MP.clans[id].color,'rgba(255,240,200,.18)');}
  for(const u in MP.claims){const q=MP.claims[u];ring(q.x,q.z,q.r,u===MP.uid?'#c8901a':mpColOf(u)||'rgba(70,50,30,.7)');}
  c.font='700 11px "Be Vietnam Pro",system-ui,sans-serif';c.textAlign='center';
  for(const r of MP.rp.values()){const x=sx(r.x),y=sy(r.z);if(x<-10||y<-10||x>W+10||y>W+10)continue;c.fillStyle=mpColOf(r.uid)||'#ffffff';c.strokeStyle='#2a1808';c.lineWidth=1.5;c.beginPath();c.arc(x,y,4.5,0,7);c.fill();c.stroke();
    if(V.z>=1.5){const n=mpName(r.uid);c.lineWidth=3;c.strokeStyle='rgba(255,246,226,.9)';c.strokeText(n,x,y-8);c.fillStyle='#3a2410';c.fillText(n,x,y-8);}}}
/* ---------- tên người chơi (gộp một lượt hỏi) ---------- */
function mpNamesFlush(){if(!MP.user||!MP.nameQ.size||MP.nameBusy)return;const ids=[...MP.nameQ].slice(0,60);ids.forEach(i=>MP.nameQ.delete(i));MP.nameBusy=true;
  MP.user.profiles(ids).then(ps=>{let ch=false;for(const id of ids){const p=ps&&ps[id];const n=p&&typeof p.name==='string'?mpTxt(p.name,28):'';if(n&&MP.names[id]!==n){MP.names[id]=n;ch=true;}else if(!n&&!MP.names[id])MP.names[id]='';}if(ch){MP.dirty.ui=true;}}).catch(()=>{}).finally(()=>{MP.nameBusy=false;});}
/* ---------- nhịp chạy (thưa, gắn vào vòng vẽ) ---------- */
function mpTick(dt){if(!mpOn())return;const t=performance.now()/1000,T=MP.tick;
  if(MP.room&&!MP.roomOn)mpRoomInit();if(t-T.pres>0.2){T.pres=t;mpPresTick();}mpAvTick(dt);mpQueueTick();
  if(t-T.mem>1){T.mem=t;if(MP.dirty.mem){MP.dirty.mem=false;mpMembership();}mpChatSub();mpNamesFlush();
    if(MP.dirty.remote){MP.dirty.remote=false;/* chỉ xét lại công trình của hàng xóm khi đất cắm, vùng liên minh hay việc ai thuộc liên minh nào THẬT SỰ đổi (trước: mỗi lần bất kỳ ai ghi gì cũng xét lại hết) */
      let sg=landFar()?S.land:'';for(const u in MP.claims){const c=MP.claims[u];sg+=u+c.x+','+c.z+','+c.r+';';}for(const id in MP.clans){const c=MP.clans[id],z=c.zone;sg+=id+(z?z.x+','+z.z+','+z.r:'')+c.members.join()+'|';}for(const u in MP.players){const c=MP.players[u].clan;if(c)sg+=u+c+';';}
      if(sg!==MP.rsg){MP.rsg=sg;for(const u of MP.bsub.keys())mpRemoteApply(u);}}for(const [k,o] of MP.offers)if(mpNow()-o.at>90000)MP.offers.delete(k);}
  if(t-T.near>3){T.near=t;mpNearTick();}if(t-T.ring>2){T.ring=t;mpRingTick();}if(t-T.sig>4){T.sig=t;mpSigTick();}
  if(MP.dirty.ui&&t-T.ui>0.6&&G.panel==='clan'){T.ui=t;MP.dirty.ui=false;const a=document.activeElement;if(!(a&&a.id==='mpChat'&&a.value)&&!(a&&a.id==='mpCn'))mpPanelRefresh();}}
{const _at=animTick;animTick=function(dt){_at(dt);if(MP.started)try{mpTick(dt);}catch(e){if(!MP.tickErr){MP.tickErr=1;console.warn('chơi chung',e);}}};}
{const _si=sceneInit;sceneInit=function(){_si();if(S&&S.mp&&MP.ok)setTimeout(mpStart,0);};}
{const _uo=uiOpen;uiOpen=function(k,o,keep){if(k==='clan'){const dot=document.querySelector('#menu .mp-dot');if(dot)dot.hidden=true;}return _uo(k,o,keep);};}
(function mpCss(){const s=document.createElement('style');s.textContent=`.mpw{margin-top:6px}.mpw .md small{min-height:2.4em}
.mp-m{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:7px 4px;border-bottom:1px solid rgba(255,255,255,.07)}.mp-m>i{width:10px;height:10px;border-radius:50%;flex:none}.mp-m>button,.mp-m>span:last-child{margin-left:auto}
.mp-card{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:14px;border:2px solid var(--cc);background:rgba(0,0,0,.2)}.mp-card b{display:block;font-size:17px}.mp-em{font-size:30px}
.mp-row{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.mp-c{width:30px;height:30px;border-radius:50%;border:2px solid rgba(0,0,0,.4)}.mp-c.on{outline:3px solid #fff3dc}.mp-e{font-size:20px;width:38px;height:38px;border-radius:10px;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.12)}.mp-e.on{outline:2px solid #f2c55a}
.mp-sw{width:14px;height:14px;border-radius:4px;flex:none}.mp-q,.mp-send input{width:100%;padding:9px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.15);background:rgba(0,0,0,.3);color:inherit;font:inherit;margin:4px 0 8px}
.mp-chat{max-height:46vh;overflow-y:auto;padding:4px 2px;display:flex;flex-direction:column;gap:5px}.mp-cm{padding:6px 9px;border-radius:10px;background:rgba(0,0,0,.25);font-size:14px;overflow-wrap:anywhere}.mp-cm.me{background:rgba(242,197,90,.14)}
.mp-send{display:flex;gap:6px;align-items:center}.mp-send input{margin:0}.mpask{position:fixed;z-index:30;left:50%;bottom:calc(120px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(360px,calc(100vw - 32px));padding:12px 14px;border-radius:16px;background:#2a1d14;border:2px solid #f2c55a;box-shadow:0 10px 30px rgba(0,0,0,.5)}.mpask p{margin:0 0 8px}
#menu .mp-dot{position:absolute;top:4px;right:6px;width:9px;height:9px;border-radius:50%;background:#e5532c}#menu [data-ui="clan"]{position:relative}`;document.head.appendChild(s);})();

document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="mpsrv"],[data-a="mpsrvnext"],[data-a="mpsrvS"]');if(!b)return;e.stopImmediatePropagation();if(b.dataset.a==='mpsrvS'){mpSrvOpenS();return;}
  if(b.dataset.a==='mpsrv')mpSrvSet(b.dataset.v);else if(MP.worlds&&MP.worlds.length>1){const i=MP.worlds.findIndex(w=>w.id===MP.srv);mpSrvSet(MP.worlds[(i+1)%MP.worlds.length].id);}},true);
setInterval(()=>{try{if(MP.ok&&document.querySelector('.ov-card.cr'))mpSrvForm(null);}catch(e){}},1000);
{const st=document.createElement('style');st.textContent='.mpsrv{margin:6px 0 10px;display:flex;flex-direction:column;gap:6px;text-align:left}.mpsrv-l{display:flex;flex-wrap:wrap;gap:6px}';document.head.appendChild(st);}
