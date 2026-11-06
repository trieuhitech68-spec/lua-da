/* ===================== QUẢN TRỊ (admin.js) =====================
   Chủ trò chơi đăng nhập bằng tài khoản game bình thường; nếu máy chủ nói tài khoản là quản trị viên (bảng ld_admins,
   hàm ld_is_admin/ld_my_status trong supabase_setup.sql) thì có thêm mục "🛠️ Quản trị" ở Cài đặt / menu tạm dừng / danh sách nhân vật.
   MỌI QUYỀN đều kiểm ở máy chủ (RLS + hàm security definer ld_admin_*): giao diện này chỉ là nút bấm, giả mạo ở trình duyệt không làm được gì.
   Ai cũng đọc (không cần quản trị):
     config/main   cấu hình game: thông báo, bảo trì, lời nhắn, hệ số (XP, hái lượm, chế tạo, xây, đói khát, thú, độ dài ngày), sự kiện tuần,
                   bật/tắt trò chuyện, ghi chú đăng ký, bản dựng tối thiểu — áp dụng ngay khi vào và khi đổi (onSnapshot).
     config/mod    {ban:{uid:hạn}, mute:{uid:hạn}} — ẩn chat của người bị cấm; màn hình "bị khóa".
     config/news   thư gửi mọi người · sysmail/<uid> thư hệ thống riêng (có quà) — hiện trong Hộp thư (more2.js), nhận một lần mỗi tài khoản.
   Trên claude.ai (không có Supabase): không có mục Quản trị; config/* nếu đọc được vẫn áp dụng. */
const ADMD={banner:{on:false,t:''},maint:{on:false,t:''},motd:'',mul:{xp:1,gather:1,craft:1,build:1,hunger:1,animal:1,day:1},event:'',chat:true,regNote:'',minBuild:''};
const ADMR={xp:[0.25,5,'Kinh nghiệm (XP)','×2 = lên cấp nhanh gấp đôi'],gather:[0.25,5,'Lượng hái lượm / đốn / đập','Số đồ nhận được khi khai thác'],
  craft:[0.1,4,'Thời gian chế tạo','0,5 = làm nhanh gấp đôi'],build:[0.1,4,'Thời gian xây','0,5 = dựng nhanh gấp đôi'],
  hunger:[0,3,'Tốc độ đói, khát','0 = không đói khát'],animal:[0,3,'Sát thương của thú','0 = thú không làm đau'],day:[0.25,4,'Độ dài ngày','2 = một ngày dài gấp đôi (24 phút)']};
const ADM_EV=[['','🗓️ Tự động (theo lịch)'],['hunt','🏹 Tuần Đại săn'],['gather','🍄 Mùa hái lượm'],['craft','🛠️ Tuần Thợ khéo'],['build','🏠 Tuần Dựng làng'],['farm','🌾 Tuần Ruộng đồng']];
const ADM={cfg:JSON.parse(JSON.stringify(ADMD)),raw:null,mod:{ban:{},mute:{}},news:[],sys:[],admin:false,st:null,stDone:false,pub:null,pubBusy:false,db:null,uid:null,
  tab:'ov',stats:null,players:null,q:'',pl:null,log:null,msg:'',msgK:'',busy:false,arm:{},gift:{},ev0:null,blk:'',paused:false,late:false,stT:0};
const admClone=o=>JSON.parse(JSON.stringify(o));
const admTxt=(v,n)=>typeof v==='string'?v.replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f​-‏‪-‮⁠-⁯﻿]/g,'').replace(/[ \t]+/g,' ').trim().slice(0,n):'';
const admNum=(v,a,b,d)=>typeof v==='number'&&isFinite(v)?Math.max(a,Math.min(b,v)):d;
const admWeb=()=>typeof LDB!=='undefined'&&LDB.mode==='web'&&!!LDB.uid&&!!LDB.sb;
const admHash=s=>{let h=5381;s=String(s);for(let i=0;i<s.length;i++)h=(h*33^s.charCodeAt(i))>>>0;return h.toString(36);};
function admLS(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){return null;}}
function admBuild(){try{return typeof SET_BUILD==='string'?SET_BUILD:'';}catch(e){return '';}}
/* ---------- 1. cấu hình: đọc, kẹp giá trị (dữ liệu từ máy chủ vẫn coi như không tin cậy) ---------- */
function admCfgParse(d){const c=admClone(ADMD);if(!d||typeof d!=='object')return c;
  const tog=o=>({on:!!(o&&typeof o==='object'&&o.on===true),t:admTxt(o&&o.t,300)});
  c.banner=tog(d.banner);c.maint=tog(d.maint);c.motd=admTxt(d.motd,600);c.regNote=admTxt(d.regNote,300);
  c.minBuild=/^\d{4}-\d{2}-\d{2}$/.test(d.minBuild||'')?d.minBuild:'';c.chat=d.chat!==false;c.event=ADM_EV.some(e=>e[0]===d.event)?d.event:'';
  const m=d.mul&&typeof d.mul==='object'?d.mul:{};for(const k in ADMR)c.mul[k]=admNum(m[k],ADMR[k][0],ADMR[k][1],1);return c;}
function admMul(k){const v=ADM.cfg.mul[k];return typeof v==='number'&&isFinite(v)?v:1;}
function admCfgSet(d){ADM.raw=d||null;ADM.cfg=admCfgParse(d);admEvApply();admApplyUi();if((ADM.tab==='cfg'||ADM.tab==='msg')&&admOpen()&&!ADM.dirty)admRender(false);}
// sự kiện tuần: more2.js chọn M2EV[tuần % 5]; ghi đè bằng cách lấp cả mảng bằng sự kiện được chọn (giữ bản gốc để trả lại)
function admEvApply(){try{if(typeof M2EV==='undefined'||!Array.isArray(M2EV))return;if(!ADM.ev0)ADM.ev0=M2EV.slice();const k=ADM.cfg.event,ev=k&&ADM.ev0.find(e=>e.k===k);
    for(let i=0;i<ADM.ev0.length;i++)M2EV[i]=ev||ADM.ev0[i];}catch(e){}}
/* ---------- 2. hệ số gắn vào hàm thật của game ---------- */
// XP
{const _ax=addXp;addXp=function(k,n){const m=admMul('xp');if(m!==1&&typeof n==='number'&&n>0)n*=m;return _ax.call(this,k,n);};}
// hái lượm / đốn cây / đập đá: hitTarget (game.js) gọi give(out) khi nút tài nguyên cạn → nhân số đồ trong lúc đó
{const _gv=give;give=function(o,src){const m=admMul('gather');if(ADM.gath&&m!==1&&o&&typeof o==='object'){const x={};for(const k in o){const n=o[k];if(!(n>0)){x[k]=n;continue;}const v=n*m;x[k]=Math.max(1,Math.floor(v)+(Math.random()<v-Math.floor(v)?1:0));}o=x;}return _gv.call(this,o,src);};}
{const _ht=hitTarget;hitTarget=function(t){const g=t&&t.type==='res';if(g)ADM.gath=true;try{return _ht.apply(this,arguments);}finally{if(g)ADM.gath=false;}};}
// chế tạo: thời gian từng công đoạn (work.js)
{const _ws=workStart;workStart=function(r){const res=_ws.apply(this,arguments);const m=admMul('craft');if(res&&m!==1&&G.work&&G.work.r===r&&Array.isArray(G.work.steps))for(const s of G.work.steps)s.t=Math.max(0.05,s.t*m);return res;};}
// xây: số "giây công" của mỗi công trình (work.js)
{const _sw=siteWork;siteWork=function(b){return Math.max(0.2,_sw.apply(this,arguments)*admMul('build'));};}
// đói, khát: chỉ nhân phần bị trừ trong bodyTick (cả phần life4.js trừ thêm)
{const _bt=bodyTick;bodyTick=function(dt){const p=S&&S.p,f0=p?p.food:0,w0=p?p.water:0;const r=_bt.apply(this,arguments);const m=admMul('hunger');
  if(p&&m!==1){if(p.food<f0)p.food=Math.max(0,Math.min(100,f0-(f0-p.food)*m));if(p.water<w0)p.water=Math.max(0,Math.min(100,w0-(w0-p.water)*m));}return r;};}
// thú cắn người: đổi tạm sức cắn của loài trong lúc tính
{const _aa=animalAttack;animalAttack=function(a){const m=admMul('animal'),D=a&&typeof ANIMALS!=='undefined'&&ANIMALS[a.kind];if(!D||m===1)return _aa.apply(this,arguments);
  const o=D.dmg;D.dmg=Math.max(0.0001,(o||5)*m);try{return _aa.apply(this,arguments);}finally{if(o===undefined)delete D.dmg;else D.dmg=o;}};}
// độ dài ngày: dayTick cộng giờ theo DAY_SEC (hằng số) → bù trước khi gọi
{const _dt=dayTick;dayTick=function(dt){const m=admMul('day');if(m!==1&&S&&typeof S.hour==='number'&&dt>0){const adj=dt*24/DAY_SEC*(1-1/m);if(S.hour-adj>=0)S.hour-=adj;}return _dt.apply(this,arguments);};}
/* ---------- 3. kết nối: nghe config/*, sysmail/<uid>, tình trạng của mình ---------- */
async function admRpc(fn,args,ms){if(!admWeb())throw {msg:'Cần đăng nhập trên lanhdia.app.'};let r;
  try{r=await Promise.race([LDB.sb.rpc(fn,args||{}),new Promise((_,rj)=>setTimeout(()=>rj({message:'Máy chủ không trả lời.'}),ms||15000))]);}catch(e){throw {msg:String(e&&e.message||e)};}
  if(r&&r.error){const m=String(r.error.message||'');throw {msg:/PGRST202|could not find the function/i.test(m+(r.error.code||''))?'Máy chủ chưa có hàm quản trị: chạy lại supabase_setup.sql.':m.slice(0,200)};}return r?r.data:null;}
async function admStatus(){if(!admWeb()){ADM.stDone=true;return;}try{const s=await admRpc('ld_my_status',{},12000);ADM.st=s&&typeof s==='object'?s:null;const was=ADM.admin;ADM.admin=!!(ADM.st&&ADM.st.admin===true);
    if(ADM.admin!==was){try{if(G.panel==='settings')uiOpenRefresh();}catch(e){}admEntryStart();}}catch(e){if(!ADM.stDone)console.warn('quản trị: tình trạng',e&&e.msg);}ADM.stDone=true;admApplyUi();}
(async function admInit(){try{if(!window.claude||typeof window.claude.use!=='function')return;const db=await window.claude.use('db');if(!db)return;ADM.db=db;
    const sub=(path,fn)=>{try{db.doc(path).onSnapshot(s=>{try{fn(s&&s.exists?s.data():null);}catch(e){console.warn('quản trị',path,e);}},()=>{});}catch(e){}};
    sub('config/main',admCfgSet);
    sub('config/mod',d=>{const o={ban:{},mute:{}};if(d&&typeof d==='object')for(const k of ['ban','mute'])if(d[k]&&typeof d[k]==='object')for(const u in d[k])if(typeof d[k][u]==='number')o[k][u]=d[k][u];const mine=JSON.stringify([ADM.mod.ban[ADM.uid],ADM.mod.mute[ADM.uid]])!==JSON.stringify([o.ban[ADM.uid],o.mute[ADM.uid]]);ADM.mod=o;
      if(mine&&ADM.st)admStatus();else admApplyUi();});
    sub('config/news',d=>{ADM.news=admMailList(d,20);admMailSeen();if(admOpen()&&ADM.tab==='msg')admRender();});
    if(typeof LDB!=='undefined'&&LDB.mode==='web'&&LDB.uid){ADM.uid=LDB.uid;sub('sysmail/'+LDB.uid,d=>{ADM.sys=admMailList(d,30);admMailSeen();});
      await admStatus();ADM.stT=setInterval(()=>{if(!document.hidden)admStatus();},180000);}
    else{ADM.stDone=true;try{const u=await window.claude.use('user');ADM.uid=u&&await u.id();}catch(e){}admApplyUi();}}
  catch(e){ADM.stDone=true;console.warn('quản trị: kết nối',e);}})();
setInterval(()=>{try{admTick();}catch(e){}},2000);
const admActive=(o,u)=>{const v=o&&u?o[u]:undefined;return typeof v==='number'&&(v===0||v>Date.now());};
const admBanned=()=>!!(ADM.st&&ADM.st.ban)||admActive(ADM.mod.ban,ADM.uid);
const admMuted=()=>!!(ADM.st&&ADM.st.mute)||admActive(ADM.mod.mute,ADM.uid);
/* ---------- 4. thư hệ thống / thư gửi mọi người → Hộp thư (more2.js) ---------- */
function admItems(it){if(!it||typeof it!=='object')return null;const o={};let n=0;for(const k in it){const v=it[k];if(!ITEMS[k]||ITEMS[k].t==='pet'||!Number.isInteger(v)||v<1||v>999)continue;o[k]=v;if(++n>=6)break;}return n?o:null;}
function admMailList(d,max){if(!d||!Array.isArray(d.list))return [];return d.list.slice(-max).filter(m=>m&&typeof m==='object'&&typeof m.id==='string'&&/^[a-z0-9]{4,40}$/.test(m.id)&&typeof m.at==='number')
  .map(m=>({id:'adm'+m.id,t:admTxt(m.t,500),at:m.at,it:admItems(m.it)}));}
function admMailAll(){return ADM.news.concat(ADM.sys);}
function admMailGot(m){const M=typeof S!=='undefined'&&S&&S.m2;if(M&&M.mget&&M.mget[m.id])return true;try{if(typeof M2K!=='undefined'&&M2K.mailMe&&(M2K.mailMe.ack||[]).includes(m.id))return true;}catch(e){}return false;}
function admHidden(){try{return JSON.parse(admLS('ld-adm-hide-'+(ADM.uid||''))||'[]');}catch(e){return [];}}
function admMailSeen(){const k='ld-adm-seen-'+(ADM.uid||''),seen=new Set((admLS(k)||'').split(',').filter(Boolean)),L=admMailAll();let nw=0;
  for(const m of L)if(!seen.has(m.id)){seen.add(m.id);if(Date.now()-m.at<14*864e5)nw++;}
  admLS(k,[...seen].slice(-120).join(','));if(nw&&typeof S!=='undefined'&&S&&G.on){try{uiToast('📜 Có thư mới từ Ban quản trị. Mở 🏮 Làng → Thư.','idea');}catch(e){}}try{m2Badge();}catch(e){}
  try{if(G.panel==='m2'&&G.m2tab==='mail')m2Fill(true);}catch(e){}}
if(typeof m2Inbox==='function'){const _mi=m2Inbox;m2Inbox=function(){const L=_mi.apply(this,arguments);try{const hid=new Set(admHidden());
    for(const m of admMailAll()){if(hid.has(m.id))continue;L.push({id:m.id,sys:1,adm:1,from:'🛠️ Ban quản trị',t:m.t,at:m.at,it:m.it,got:!m.it||admMailGot(m)});}L.sort((a,b)=>b.at-a.at);}catch(e){}return L;};}
if(typeof m2MailClaim==='function'){const _mc=m2MailClaim;m2MailClaim=function(id){if(typeof id!=='string'||!id.startsWith('adm'))return _mc.apply(this,arguments);
  const m=admMailAll().find(x=>x.id===id);if(!m||!m.it||admMailGot(m))return;
  if(!(typeof m2Net==='function'&&m2Net())){uiToast('Nhận quà của Ban quản trị cần kết nối thế giới chung.','bad');return;}
  for(const k in m.it)if(!invFits(k,m.it[k])){uiToast('Túi không đủ chỗ: dọn bớt rồi nhận.','bad');try{sfx('no');}catch(e){}return;}
  const M=M2I();M.mget[id]=1;const me=M2K.mailMe||(M2K.mailMe={to:[],list:[],ack:[]});me.ack=(me.ack||[]).concat(id).slice(-300);try{m2MailWrite();}catch(e){}
  give(m.it,null);try{sfx('pick');}catch(e){}save();uiOpenRefresh();};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="m2mdel"]');if(!b||!String(b.dataset.id||'').startsWith('adm'))return;
  e.stopImmediatePropagation();const h=admHidden();h.push(b.dataset.id);admLS('ld-adm-hide-'+(ADM.uid||''),JSON.stringify(h.slice(-200)));try{m2Fill(true);}catch(er){uiOpenRefresh();}},true);
/* ---------- 5. giao diện người chơi: thông báo, lời nhắn, bảo trì, bị khóa, bản cũ ---------- */
function admApplyUi(){admBanner();admBlock();}
function admBanner(){const c=ADM.cfg;let el=document.getElementById('admban');const t=c.banner.on&&c.banner.t?c.banner.t:'';const mt=ADM.admin&&c.maint.on?'🛠️ Đang bật BẢO TRÌ: chỉ quản trị viên vào được.':'';
  const txt=mt||t,key=admHash(txt);let off='';try{off=sessionStorage.getItem('ld-adm-ban')||'';}catch(e){}
  if(!txt||(!mt&&off===key)){if(el)el.hidden=true;return;}
  if(!el){el=document.createElement('div');el.id='admban';el.className='adm-ban';el.setAttribute('role','status');document.body.appendChild(el);}
  if(el.dataset.k!==key){el.dataset.k=key;el.innerHTML='<span></span><button data-adm="banx" aria-label="Đóng">✕</button>';el.querySelector('span').textContent=(mt?'':'📣 ')+txt;}el.hidden=false;}
function admBlock(){const c=ADM.cfg;let k='';
  if(admBanned())k='ban';else if(c.maint.on&&!ADM.admin&&ADM.stDone)k='maint';else if(c.minBuild&&admBuild()&&admBuild()<c.minBuild&&!ADM.admin&&ADM.stDone)k='ver';
  let el=document.getElementById('admblk');if(!k){if(el)el.hidden=true;if(ADM.paused){ADM.paused=false;try{if(G.on)G.paused=false;}catch(e){}}ADM.blk='';return;}
  if(!el){el=document.createElement('div');el.id='admblk';el.className='adm-blk';el.setAttribute('role','dialog');document.body.appendChild(el);el.addEventListener('keydown',e=>e.stopPropagation());}
  const key=k+JSON.stringify(k==='ban'?[ADM.st&&ADM.st.ban,ADM.mod.ban[ADM.uid]]:k==='maint'?c.maint.t:c.minBuild);
  if(ADM.blk!==key){ADM.blk=key;const out=typeof LDB!=='undefined'&&LDB.mode==='web'&&LDB.uid?'<button class="btn ghost" data-a="ldout">Đăng xuất</button>':'';let h='';
    if(k==='ban'){const b=ADM.st&&ADM.st.ban||{},u=b.until?new Date(b.until):(ADM.mod.ban[ADM.uid]>0?new Date(ADM.mod.ban[ADM.uid]):null);
      h=`<div class="adm-ic">🚫</div><h2>Tài khoản đang bị khóa</h2><p>${u?'Khóa đến <b>'+esc(u.toLocaleString('vi-VN'))+'</b>.':'Tài khoản bị khóa vô thời hạn.'}</p>${b.reason?`<p class="small">Lý do: ${esc(b.reason)}</p>`:''}<p class="small muted">Nếu nghĩ đây là nhầm lẫn, hãy liên hệ Ban quản trị.</p>${out}`;}
    else if(k==='maint')h=`<div class="adm-ic">🛠️</div><h2>Đang bảo trì</h2><p>${esc(c.maint.t||'Trò chơi đang được nâng cấp. Bạn quay lại sau ít phút nhé!')}</p><button class="btn" data-adm="reload">↻ Thử lại</button>${out}`;
    else h=`<div class="adm-ic">✨</div><h2>Có bản cập nhật mới</h2><p>Bản bạn đang mở đã cũ. Tải lại để chơi bản mới nhất.</p><button class="btn big" data-adm="update">↻ Cập nhật ngay</button>`;
    el.innerHTML=`<div class="adm-bc">${h}</div>`;}
  el.hidden=false;try{if(G.on&&!G.paused){try{save();}catch(e){}G.paused=true;ADM.paused=true;}if(G.on)G.keys={};}catch(e){}
  if(k==='ver'){let done='';try{done=sessionStorage.getItem('ld-adm-upd')||'';}catch(e){}if(done!==c.minBuild){try{sessionStorage.setItem('ld-adm-upd',c.minBuild);}catch(e){}admUpdate();}}}
async function admUpdate(){try{save();}catch(e){}try{if(window.caches)for(const k of await caches.keys())await caches.delete(k);}catch(e){}
  try{if(navigator.serviceWorker)for(const r of await navigator.serviceWorker.getRegistrations())await r.update().catch(()=>{});}catch(e){}location.reload();}
function admTick(){if(ADM.blk&&typeof G!=='undefined'&&G.on&&!G.paused){G.paused=true;ADM.paused=true;}// giữ màn chặn
  if(admBanned()!==(ADM.blk.startsWith('ban')))admBlock();
  const c=ADM.cfg;if(c.motd&&typeof S!=='undefined'&&S&&G.on&&!G.panel&&!ADM.blk&&!document.querySelector('#ldl:not([hidden]),#admp:not([hidden]),#overlay:not([hidden])')){
    const d=new Date(),key=admHash(c.motd)+'@'+d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();if(admLS('ld-adm-motd')!==key){admLS('ld-adm-motd',key);admMotd(c.motd);}}}
function admMotd(t){let el=document.getElementById('admmotd');if(!el){el=document.createElement('div');el.id='admmotd';el.className='adm-blk adm-motd';document.body.appendChild(el);}
  el.innerHTML='<div class="adm-bc"><div class="adm-ic">🔥</div><h2>Lời nhắn hôm nay</h2><p class="adm-pre"></p><button class="btn big" data-adm="motdx">Đã hiểu</button></div>';el.querySelector('.adm-pre').textContent=t;el.hidden=false;}
// màn đăng nhập: ghi chú khi đăng ký, báo bảo trì (đọc qua ld_public_config, không cần đăng nhập)
if(typeof ldlShow==='function'){const _ls=ldlShow;ldlShow=function(st){const r=_ls.apply(this,arguments);try{admLoginNote(st);}catch(e){}return r;};}
function admLoginNote(st){if(typeof LDB==='undefined'||LDB.mode!=='web'||(st!=='in'&&st!=='up'))return;
  if(!ADM.pub){if(!ADM.pubBusy&&LDB.configured){ADM.pubBusy=true;LDB.init().then(sb=>Promise.race([sb.rpc('ld_public_config'),new Promise(r=>setTimeout(()=>r(null),8000))])).then(r=>{ADM.pub=r&&!r.error&&r.data&&typeof r.data==='object'?r.data:{};
      if(typeof LDL!=='undefined'&&(LDL.st==='in'||LDL.st==='up'))admLoginNote(LDL.st);}).catch(()=>{ADM.pub={};});}return;}
  const card=document.querySelector('#ldl .ldl-card');if(!card||card.querySelector('.adm-ln'))return;const c=admCfgParse(ADM.pub);let h='';
  if(c.maint.on)h+=`<p class="ldl-msg bad">🛠️ ${esc(c.maint.t||'Trò chơi đang bảo trì. Bạn quay lại sau ít phút nhé!')}</p>`;
  if(st==='up'&&c.regNote)h+=`<p class="ldl-msg ok">${esc(c.regNote)}</p>`;if(!h)return;
  const d=document.createElement('div');d.className='adm-ln';d.innerHTML=h;const f=card.querySelector('form');if(f)f.before(d);else card.appendChild(d);}
/* ---------- 6. lối vào bảng quản trị (chỉ khi máy chủ xác nhận là quản trị viên) ---------- */
function admEntryStart(){try{const c=document.querySelector('.ov-card.acc');if(!c)return;let b=c.querySelector('.adm-go');if(!ADM.admin){if(b)b.remove();return;}
  if(!b){b=document.createElement('button');b.className='btn sm adm-go';b.dataset.adm='open';b.textContent='🛠️ Quản trị';const a=c.querySelector('.ldl-acc');if(a)a.appendChild(b);else c.appendChild(b);}}catch(e){}}
function admLate(){if(ADM.late)return;ADM.late=true;
  {const _sh=settingsHtml;settingsHtml=function(){const h=_sh.apply(this,arguments);if(!ADM.admin||!admWeb())return h;
    const e=`<div class="adm-entry"><div><b>🛠️ Quản trị</b><small>Thống kê, cài đặt game, người chơi, thông báo.</small></div><button class="btn sm" data-adm="open">Mở</button></div>`;
    return h.replace('<div class="sp-body" data-tab="acc">','<div class="sp-body" data-tab="acc">'+e);};}
  if(typeof spPause!=='undefined'&&spPause.open){const _po=spPause.open;spPause.open=function(){const r=_po.apply(this,arguments);try{if(ADM.admin&&admWeb()){const c=document.querySelector('#sppause .sp-pc');
      if(c&&!c.querySelector('[data-adm="open"]')){const b=document.createElement('button');b.className='btn ghost';b.dataset.adm='open';b.textContent='🛠️ Quản trị';c.appendChild(b);}}}catch(e){}return r;};}
  {const _us=uiStart;uiStart=function(){const r=_us.apply(this,arguments);admEntryStart();return r;};}
  // trò chuyện: tắt toàn bộ / người bị cấm chat (máy chủ đã chặn ghi chat/<uid>; đây chặn thêm tin nhắn tức thời qua phòng)
  if(typeof mpChatHtml==='function'){const _ch=mpChatHtml;mpChatHtml=function(){if(!ADM.cfg.chat)return '<p class="small">💬 Trò chuyện đang tạm tắt (Ban quản trị).</p>';return _ch.apply(this,arguments);};}
  if(typeof mpSay==='function'){const _sy=mpSay;mpSay=function(){if(!ADM.cfg.chat){uiToast('💬 Trò chuyện đang tạm tắt.','bad');return;}if(admMuted()){uiToast('🔇 Bạn đang bị cấm trò chuyện.','bad');return;}return _sy.apply(this,arguments);};}
  if(typeof mpChatHear==='function'){const _he=mpChatHear;mpChatHear=function(m){if(!ADM.cfg.chat||(m&&(admActive(ADM.mod.mute,m.by)||admActive(ADM.mod.ban,m.by))))return;return _he.apply(this,arguments);};}
  if(typeof mpChatAdd==='function'){const _ad=mpChatAdd;mpChatAdd=function(by){if(admActive(ADM.mod.mute,by)||admActive(ADM.mod.ban,by))return false;return _ad.apply(this,arguments);};}
  admApplyUi();admEvApply();}
{const _bo=boot;boot=function(){try{admLate();}catch(e){console.warn('quản trị: gắn',e);}return _bo.apply(this,arguments);};}
/* ---------- 7. bảng quản trị ---------- */
const ADM_TABS=[['ov','📊','Tổng quan'],['cfg','⚙️','Cài đặt game'],['pl','👥','Người chơi'],['msg','📣','Thông báo'],['log','📜','Nhật ký']];
const admOpen=()=>{const el=document.getElementById('admp');return !!el&&!el.hidden;};
function admShow(){if(!ADM.admin||!admWeb()){uiToast('Bạn không có quyền quản trị.','bad');return;}try{if(typeof spPause!=='undefined'&&spPause.on)spPause.close();}catch(e){}
  let el=document.getElementById('admp');if(!el){el=document.createElement('div');el.id='admp';el.className='adm-p';el.setAttribute('role','dialog');el.setAttribute('aria-label','Quản trị');document.body.appendChild(el);
    el.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'&&e.target&&e.target.id==='admQ'){e.preventDefault();admAct('find');}});}
  el.hidden=false;ADM.wasP=typeof G!=='undefined'&&G.on?!!G.paused:null;if(G.on)G.paused=true;ADM.msg='';ADM.dirty=false;admRender(false);admLoad(ADM.tab);}
function admHide(){const el=document.getElementById('admp');if(el)el.hidden=true;if(typeof G!=='undefined'&&G.on&&ADM.wasP!==null&&!ADM.blk)G.paused=ADM.wasP;}
function admLoad(t){if(t==='ov'&&!ADM.stats)admAct('stats');else if(t==='pl'&&!ADM.players)admAct('find');else if(t==='log')admAct('log');}
// keep !== false: giữ chữ đang gõ / lựa chọn trong các ô khi vẽ lại cùng một màn
function admRender(keep){const el=document.getElementById('admp');if(!el||el.hidden)return;const t=ADM.tab,vk=t+'|'+(ADM.pl&&ADM.pl.id||'');let body='',vals=null;
  if(keep!==false&&el.dataset.vk===vk){vals={};el.querySelectorAll('input[id],textarea[id],select[id]').forEach(e=>{vals[e.id]=e.type==='checkbox'?e.checked:e.value;});}
  try{body=t==='ov'?admOvHtml():t==='cfg'?admCfgHtml():t==='pl'?admPlHtml():t==='msg'?admMsgHtml():admLogHtml();}catch(e){console.warn('quản trị',e);body='<p class="small">Không hiện được mục này.</p>';}
  const sc=el.querySelector('.adm-body'),top=sc?sc.scrollTop:0,same=el.dataset.t===t;el.dataset.t=t;
  el.innerHTML=`<div class="adm-card"><div class="adm-hd"><h2>🛠️ Quản trị</h2><button class="btn sm ghost" data-adm="close" aria-label="Đóng">✕</button></div>
    <div class="adm-tabs" role="tablist">${ADM_TABS.map(([k,i,n])=>`<button class="${k===t?'on':''}" role="tab" aria-selected="${k===t}" data-adm="tab" data-v="${k}"><span>${i}</span><i>${n}</i></button>`).join('')}</div>
    ${ADM.msg?`<p class="adm-msg ${ADM.msgK}">${esc(ADM.msg)}</p>`:''}<div class="adm-body">${body}</div></div>`;
  el.dataset.vk=vk;if(vals)for(const id in vals){const e=document.getElementById(id);if(!e)continue;if(e.type==='checkbox')e.checked=vals[id];else e.value=vals[id];}
  if(same){const b=el.querySelector('.adm-body');if(b)b.scrollTop=top;}}
function admSay(m,k){ADM.msg=m;ADM.msgK=k||'';clearTimeout(ADM.msgT);ADM.msgT=setTimeout(()=>{ADM.msg='';const p=document.querySelector('#admp .adm-msg');if(p)p.remove();},7000);}
const admFmtB=n=>{n=+n||0;return n<1024?n+' B':n<1048576?(n/1024).toFixed(1)+' KB':n<1073741824?(n/1048576).toFixed(1)+' MB':(n/1073741824).toFixed(2)+' GB';};
const admAgo=t=>{if(!t)return '—';const s=(Date.now()-new Date(t).getTime())/1000;return s<60?'vừa xong':s<3600?Math.floor(s/60)+' phút trước':s<86400?Math.floor(s/3600)+' giờ trước':Math.floor(s/86400)+' ngày trước';};
const admDate=t=>t?new Date(t).toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—';
function admOnline(){try{if(typeof MP==='undefined'||!MP.room)return null;if(!ADM.roomOn){ADM.roomOn=true;try{MP.room.onPeers(()=>{});}catch(e){}}const s=new Set();
    for(const p of MP.room.peers()||[])if(p&&p.by&&(p.presence&&Object.keys(p.presence).length||p.isMe&&MP.started))s.add(p.by);return s.size;}catch(e){return null;}}
// Tổng quan
function admOvHtml(){const s=ADM.stats,on=admOnline();let h=`<div class="adm-row"><button class="btn sm" data-adm="stats"${ADM.busy?' disabled':''}>↻ Làm mới</button><small class="muted">${s?'Cập nhật '+admAgo(s.at):''}</small></div>`;
  if(!s)return h+`<p class="small muted">${ADM.busy?'Đang tải…':'Chưa có số liệu.'}</p>`;
  const tile=(n,v,sub)=>`<div class="adm-tile"><b>${esc(String(v))}</b><span>${n}</span>${sub?`<small>${sub}</small>`:''}</div>`;
  h+=`<div class="adm-tiles">${tile('Đang trực tuyến',on==null?'—':on,'người trong phòng chung')}${tile('Hoạt động 15 phút',s.active15m)}${tile('Hoạt động 24 giờ',s.active24h)}${tile('Hoạt động 7 ngày',s.active7d)}
    ${tile('Tài khoản',s.accounts)}${tile('Mới hôm nay',s.newToday)}${tile('Mới 7 ngày',s.new7d)}${tile('Đăng nhập 24 giờ',s.signin24h)}
    ${tile('Bộ tộc',s.clans)}${tile('Bị khóa',s.banned)}${tile('Bị cấm chat',s.muted)}${tile('Quản trị viên',s.admins)}</div>`;
  const sg=Array.isArray(s.signups14)?s.signups14:[],mx=Math.max(1,...sg.map(x=>+x.n||0));
  if(sg.length)h+=`<h3>Đăng ký mới (14 ngày)</h3><div class="adm-bars">${sg.map(x=>`<div title="${esc(x.d)}: ${+x.n}"><i style="height:${Math.round((+x.n||0)/mx*100)}%"></i><small>${esc(String(x.d).slice(8))}</small><em>${+x.n}</em></div>`).join('')}</div>`;
  const cl=Array.isArray(s.colls)?s.colls:[],mb=Math.max(1,...cl.map(x=>+x.bytes||0));
  h+=`<h3>Dữ liệu · ${+s.docs||0} tài liệu · ${admFmtB(s.docsBytes)} (cả CSDL ${admFmtB(s.dbBytes)})</h3><div class="adm-tbl">${cl.map(x=>`<div class="adm-tr"><span>${esc(x.c)}</span><span>${+x.n}</span><span>${admFmtB(x.bytes)}</span><i style="--w:${Math.round((+x.bytes||0)/mb*100)}%"></i></div>`).join('')}</div>`;
  const tp=Array.isArray(s.top)?s.top:[];
  if(tp.length)h+=`<h3>🏆 Người chơi hàng đầu (ngày sống)</h3><div class="adm-tbl">${tp.map((x,i)=>`<button class="adm-tr adm-lnk" data-adm="pl" data-u="${esc(x.id)}"><span>${i+1}. ${esc(x.name||'Người chơi')}</span><span>📅 ${+x.d}</span><span>🏹 ${+x.h} · 🏠 ${+x.b}</span></button>`).join('')}</div>`;
  return h;}
// Cài đặt game
function admCfgHtml(){const c=ADM.cfg,tg=(id,n,on)=>`<label class="adm-tg"><input type="checkbox" id="${id}"${on?' checked':''}><span>${n}</span></label>`;
  let h=`<p class="small muted">Lưu xong, mọi người chơi đang mở game nhận ngay (không cần tải lại).${ADM.raw&&ADM.raw.at?' Lần lưu trước: '+admDate(ADM.raw.at)+'.':''}</p>
  <h3>📣 Thông báo đầu màn hình</h3>${tg('acBanOn','Hiện thông báo',c.banner.on)}<input id="acBanT" maxlength="300" placeholder="vd. Tối nay 20h có sự kiện săn bò rừng!" value="${esc(c.banner.t)}">
  <h3>🛠️ Bảo trì</h3>${tg('acMtOn','Bật chế độ bảo trì (chỉ quản trị viên vào được)',c.maint.on)}<input id="acMtT" maxlength="300" placeholder="Lời nhắn khi bảo trì" value="${esc(c.maint.t)}">
  <h3>🔥 Lời nhắn hôm nay</h3><textarea id="acMotd" maxlength="600" rows="3" placeholder="Hiện một lần mỗi ngày khi vào game (để trống: không hiện)">${esc(c.motd)}</textarea>
  <h3>⚖️ Hệ số trò chơi</h3><div class="adm-muls">${Object.entries(ADMR).map(([k,[a,b,n,hint]])=>`<label class="adm-mul"><span><b>${n}</b><small>${hint} · ${a}–${b}</small></span><input type="number" inputmode="decimal" id="acM_${k}" min="${a}" max="${b}" step="0.05" value="${c.mul[k]}"></label>`).join('')}</div>
  <button class="btn sm ghost" data-adm="mulreset">↺ Đưa hệ số về 1</button>
  <h3>🗓️ Sự kiện tuần</h3><select id="acEv">${ADM_EV.map(([k,n])=>`<option value="${k}"${c.event===k?' selected':''}>${n}</option>`).join('')}</select>
  <h3>💬 Trò chuyện</h3>${tg('acChat','Cho phép trò chuyện bộ tộc',c.chat)}
  <h3>📝 Ghi chú khi đăng ký</h3><input id="acReg" maxlength="300" placeholder="Hiện ở màn Đăng ký (vd. luật chơi, tên không phản cảm)" value="${esc(c.regNote)}">
  <h3>✨ Bản dựng tối thiểu</h3><input id="acMin" maxlength="10" placeholder="YYYY-MM-DD (để trống: không ép)" value="${esc(c.minBuild)}"><small class="muted">Bản dựng này: ${esc(admBuild()||'?')}. Máy nào cũ hơn sẽ phải tải lại bản mới.</small>
  <div class="adm-save"><button class="btn big" data-adm="save"${ADM.busy?' disabled':''}>💾 Lưu cài đặt</button></div>`;return h;}
function admCfgRead(){const v=id=>{const e=document.getElementById(id);return e?e.value:'';},ck=id=>{const e=document.getElementById(id);return !!(e&&e.checked);};
  const o={banner:{on:ck('acBanOn'),t:admTxt(v('acBanT'),300)},maint:{on:ck('acMtOn'),t:admTxt(v('acMtT'),300)},motd:admTxt(v('acMotd'),600),mul:{},event:v('acEv'),chat:ck('acChat'),regNote:admTxt(v('acReg'),300),minBuild:v('acMin').trim()};
  for(const k in ADMR){const n=parseFloat(String(v('acM_'+k)).replace(',','.'));o.mul[k]=Math.round(admNum(isFinite(n)?n:1,ADMR[k][0],ADMR[k][1],1)*100)/100;}
  if(o.minBuild&&!/^\d{4}-\d{2}-\d{2}$/.test(o.minBuild))throw {msg:'Bản dựng tối thiểu phải có dạng YYYY-MM-DD.'};
  if(o.minBuild&&admBuild()&&o.minBuild>admBuild())throw {msg:'Bản dựng tối thiểu mới hơn bản đang chạy ('+admBuild()+'): mọi người sẽ bị kẹt. Kiểm tra lại.'};
  if(!ADM_EV.some(e=>e[0]===o.event))o.event='';return o;}
// Người chơi
function admPlHtml(){if(ADM.pl)return admPlOne();const L=ADM.players;
  let h=`<div class="adm-in"><input id="admQ" placeholder="Tìm tên, email hoặc mã người chơi" value="${esc(ADM.q)}" enterkeyhint="search"><button class="btn sm" data-adm="find"${ADM.busy?' disabled':''}>🔍</button></div>`;
  if(!L)return h+`<p class="small muted">${ADM.busy?'Đang tìm…':'Nhập tên rồi bấm 🔍 (để trống: người hoạt động gần đây).'}</p>`;
  if(!L.length)return h+'<p class="small muted">Không tìm thấy ai.</p>';
  return h+`<div class="adm-list">${L.map(p=>`<button class="adm-pr" data-adm="pl" data-u="${esc(p.id)}"><span class="adm-av">${esc((p.name||'?')[0])}</span><span><b>${esc(p.name||'(chưa có tên)')}</b>${p.admin?' <em class="adm-b ok">🛠️</em>':''}${p.ban?' <em class="adm-b bad">🚫 khóa</em>':''}${p.mute?' <em class="adm-b">🔇</em>':''}<small>${esc(p.email||'')}</small><small>Hoạt động ${admAgo(p.last)}</small></span></button>`).join('')}</div>`;}
const ADM_HRS=[[1,'1 giờ'],[24,'1 ngày'],[168,'7 ngày'],[720,'30 ngày'],[0,'Vĩnh viễn']];
function admPlOne(){const p=ADM.pl;if(p.loading)return '<button class="btn sm ghost" data-adm="plback">← Danh sách</button><p class="small muted">Đang tải…</p>';
  const lb=p.lb&&typeof p.lb==='object'?p.lb:{},pl=p.player&&typeof p.player==='object'?p.player:{};const arm=k=>ADM.arm[k]?' red':'';
  const hrs=id=>`<select id="${id}">${ADM_HRS.map(([v,n])=>`<option value="${v}">${n}</option>`).join('')}</select>`;
  const sel=(p.ban?'🚫 Đang khóa'+(p.ban.until?' đến '+admDate(p.ban.until):' vĩnh viễn')+(p.ban.reason?' · '+esc(p.ban.reason):''):'')+(p.mute?(p.ban?'<br>':'')+'🔇 Cấm chat'+(p.mute.until?' đến '+admDate(p.mute.until):' vĩnh viễn')+(p.mute.reason?' · '+esc(p.mute.reason):''):'');
  let h=`<button class="btn sm ghost" data-adm="plback">← Danh sách</button>
  <div class="adm-pcard"><span class="adm-av">${esc((p.name||'?')[0])}</span><div><b>${esc(p.name||'')}</b>${p.admin?' <em class="adm-b ok">🛠️ quản trị</em>':''}<small>${esc(p.email||'')}</small><small class="adm-id">${esc(p.id)}</small></div></div>
  <div class="adm-kv"><span>Tạo tài khoản</span><b>${admDate(p.created)}</b><span>Đăng nhập gần nhất</span><b>${admDate(p.signin)}</b><span>Dữ liệu</span><b>${+p.ndocs||0} tài liệu · ${admFmtB(p.bytes)}</b>
    <span>Bộ tộc</span><b>${esc(typeof pl.clan==='string'?pl.clan.slice(0,8)+'…':'—')}</b><span>Thành tích</span><b>📅 ${+lb.d||0} ngày · 🏹 ${+lb.h||0} · 🏠 ${+lb.b||0} · 🏆 ${+lb.a||0}</b></div>
  ${sel?`<p class="adm-msg bad">${sel}</p>`:''}`;
  if(!p.admin){h+=`<h3>🚫 Khóa tài khoản</h3><div class="adm-in">${hrs('apBanH')}<input id="apBanR" maxlength="300" placeholder="Lý do (người chơi thấy)"></div>
    <div class="adm-row"><button class="btn sm${arm('ban')}" data-adm="ban">${ADM.arm.ban?'Bấm lần nữa để khóa':'🚫 Khóa'}</button>${p.ban?'<button class="btn sm ghost" data-adm="unban">Mở khóa</button>':''}</div>
    <h3>🔇 Cấm trò chuyện</h3><div class="adm-in">${hrs('apMuH')}<input id="apMuR" maxlength="300" placeholder="Lý do"></div>
    <div class="adm-row"><button class="btn sm" data-adm="mute">🔇 Cấm chat</button>${p.mute?'<button class="btn sm ghost" data-adm="unmute">Bỏ cấm</button>':''}</div>`;}
  h+=`<h3>✏️ Đổi tên hiển thị</h3><div class="adm-in"><input id="apName" maxlength="24" value="${esc(p.name||'')}"><button class="btn sm" data-adm="rename">Lưu</button></div>
  <h3>✉️ Gửi thư / quà riêng</h3><textarea id="apMail" maxlength="500" rows="2" placeholder="Nội dung thư"></textarea>${admGiftHtml('p')}<button class="btn sm" data-adm="mail">✉️ Gửi</button>
  <h3>🗂️ Tài liệu (${(p.docs||[]).length})</h3><p class="small muted">Xóa tin chat, bộ tộc, công trình phản cảm. Bản lưu nhân vật (data/…) không xóa ở đây.</p>
  <div class="adm-tbl">${(p.docs||[]).map(d=>{const root=String(d.path).split('/')[0],can=root!=='data'&&root!=='world';const k='del:'+d.path;
    return `<div class="adm-tr adm-doc"><span title="${esc(d.path)}">${esc(String(d.path).replace(p.id,'‹id›'))}</span><span>${admFmtB(d.bytes)}</span><span>${admAgo(d.at)}</span>${can?`<button class="btn sm${ADM.arm[k]?' red':' ghost'}" data-adm="del" data-p="${esc(d.path)}">${ADM.arm[k]?'Xóa?':'🗑'}</button>`:'<span></span>'}</div>`;}).join('')}</div>`;
  return h;}
// chọn quà (đồ trong game)
function admGiftHtml(ctx){const g=ADM.gift[ctx]||(ADM.gift[ctx]={});const opts=Object.keys(ITEMS).filter(k=>ITEMS[k].t!=='pet').sort((a,b)=>ITEMS[a].n.localeCompare(ITEMS[b].n,'vi'));
  return `<div class="adm-gift"><div class="adm-in"><select id="ag_${ctx}"><option value="">— Kèm quà (không bắt buộc) —</option>${opts.map(k=>`<option value="${k}">${esc(ITEMS[k].n)}</option>`).join('')}</select><input id="agn_${ctx}" type="number" min="1" max="999" value="1" inputmode="numeric"><button class="btn sm ghost" data-adm="gadd" data-c="${ctx}">＋</button></div>
    <div class="adm-chips">${Object.entries(g).map(([k,n])=>`<span class="chip">${esc(ITEMS[k]?ITEMS[k].n:k)} ×${n} <button data-adm="gdel" data-c="${ctx}" data-k="${esc(k)}" aria-label="Bỏ">✕</button></span>`).join('')}</div></div>`;}
// Thông báo
function admMsgHtml(){const c=ADM.cfg;let h=`<h3>📣 Thông báo đầu màn hình</h3><label class="adm-tg"><input type="checkbox" id="amBanOn"${c.banner.on?' checked':''}><span>Hiện thông báo</span></label>
  <input id="amBanT" maxlength="300" value="${esc(c.banner.t)}" placeholder="Nội dung thông báo"><button class="btn sm" data-adm="bansave">Lưu thông báo</button>
  <h3>✉️ Thư gửi mọi người</h3><p class="small muted">Hiện trong Hộp thư của mọi người (🏮 Làng → Thư). Quà kèm theo: mỗi tài khoản nhận một lần.</p>
  <textarea id="amMail" maxlength="500" rows="3" placeholder="Nội dung thư"></textarea>${admGiftHtml('all')}<button class="btn sm" data-adm="news">📨 Gửi mọi người</button>
  <h3>Thư đã gửi mọi người (${ADM.news.length})</h3>`;
  h+=ADM.news.length?`<div class="adm-list">${ADM.news.slice().reverse().map(m=>{const k='nd:'+m.id;return `<div class="adm-news"><small class="muted">${admDate(m.at)}</small><p>${esc(m.t)}</p>${m.it?`<small>🎁 ${Object.entries(m.it).map(([k,n])=>esc(ITEMS[k].n)+' ×'+n).join(', ')}</small>`:''}
    <button class="btn sm${ADM.arm[k]?' red':' ghost'}" data-adm="newsdel" data-id="${esc(m.id.slice(3))}">${ADM.arm[k]?'Gỡ thật?':'Gỡ'}</button></div>`;}).join('')}</div>`:'<p class="small muted">Chưa có.</p>';
  return h;}
// Nhật ký
const ADM_ACT={config:'⚙️ Sửa cài đặt',ban:'🚫 Khóa',unban:'✅ Mở khóa',mute:'🔇 Cấm chat',unmute:'🔊 Bỏ cấm chat',rename:'✏️ Đổi tên',delete:'🗑 Xóa tài liệu',mail:'✉️ Thư riêng',news:'📨 Thư mọi người',news_del:'Gỡ thư'};
function admLogHtml(){const L=ADM.log;let h=`<div class="adm-row"><button class="btn sm" data-adm="log"${ADM.busy?' disabled':''}>↻ Làm mới</button></div>`;
  if(!L)return h+'<p class="small muted">Đang tải…</p>';if(!L.length)return h+'<p class="small muted">Chưa có thao tác nào.</p>';
  const sum=x=>{const d=x.detail||{};if(x.action==='rename')return (d.old||'')+' → '+(d.new||'');if(x.action==='ban'||x.action==='mute')return (d.until?'đến '+admDate(d.until):'vĩnh viễn')+(d.reason?' · '+d.reason:'');
    if(x.action==='mail'||x.action==='news')return String(d.t||'').slice(0,80)+(d.it?' 🎁':'');if(x.action==='delete')return (d.n||0)+' tài liệu';if(x.action==='config')return Object.keys(d).join(', ');return '';};
  return h+`<div class="adm-log">${L.map(x=>`<div><small class="muted">${admDate(x.at)} · ${esc(x.admin||'?')}</small><b>${esc(ADM_ACT[x.action]||x.action)}</b> <span>${esc(x.tname||x.target||'')}</span><small>${esc(sum(x))}</small></div>`).join('')}</div>`;}
/* ---------- 8. thao tác ---------- */
function admArm(k){if(ADM.arm[k])return true;ADM.arm={[k]:1};clearTimeout(ADM.armT);ADM.armT=setTimeout(()=>{ADM.arm={};admRender();},5000);admRender();return false;}
async function admRun(fn){ADM.busy=true;admRender();let ok=false;try{await fn();ok=true;}catch(e){admSay('⚠️ '+(e&&(e.msg||e.message)||'Có lỗi.'),'bad');}finally{ADM.busy=false;admRender(ok?false:undefined);}}
async function admPlOpen(u){ADM.tab='pl';ADM.pl={id:u,loading:true};ADM.arm={};admRender();await admRun(async()=>{const d=await admRpc('ld_admin_player',{p_uid:u});ADM.pl=d||null;});}
async function admAct(a,t){const d=t&&t.dataset||{};const val=id=>{const e=document.getElementById(id);return e?e.value:'';};
  switch(a){
  case 'open':admShow();return;case 'close':admHide();return;
  case 'tab':ADM.tab=d.v;ADM.msg='';ADM.arm={};if(d.v!=='pl')ADM.pl=null;ADM.dirty=false;admRender(false);admLoad(d.v);return;
  case 'stats':return admRun(async()=>{ADM.stats=await admRpc('ld_admin_stats');});
  case 'find':{const q=document.getElementById('admQ');if(q)ADM.q=admTxt(q.value,80);}ADM.pl=null;return admRun(async()=>{const r=await admRpc('ld_admin_players',{p_q:ADM.q,p_limit:40});ADM.players=Array.isArray(r)?r:[];});
  case 'pl':if(d.u)return admPlOpen(d.u);return;
  case 'plback':ADM.pl=null;ADM.arm={};admRender();if(!ADM.players)admAct('find');return;
  case 'log':return admRun(async()=>{const r=await admRpc('ld_admin_log_list',{p_limit:150});ADM.log=Array.isArray(r)?r:[];});
  case 'mulreset':for(const k in ADMR){const e=document.getElementById('acM_'+k);if(e)e.value=1;}ADM.dirty=true;return;
  case 'save':{let o;try{o=admCfgRead();}catch(e){admSay('⚠️ '+e.msg,'bad');admRender();return;}
    if(o.maint.on&&!ADM.cfg.maint.on&&!admArm('maint')){admSay('Bật bảo trì sẽ đẩy mọi người chơi ra ngoài. Bấm Lưu lần nữa để chắc chắn.','bad');admRender();return;}ADM.arm={};
    return admRun(async()=>{await admRpc('ld_admin_set_config',{p_id:'main',p_data:o});ADM.dirty=false;admCfgSet(Object.assign({},ADM.raw||{},o));admSay('✅ Đã lưu. Người chơi nhận ngay.','ok');});}
  case 'bansave':{const o=admCfgParse(ADM.raw||{});o.banner={on:!!(document.getElementById('amBanOn')||{}).checked,t:admTxt(val('amBanT'),300)};
    return admRun(async()=>{await admRpc('ld_admin_set_config',{p_id:'main',p_data:Object.assign({},ADM.raw||{},o)});admCfgSet(Object.assign({},ADM.raw||{},o));admSay('✅ Đã lưu thông báo.','ok');});}
  case 'ban':case 'mute':{const p=ADM.pl;if(!p)return;if(a==='ban'&&!admArm('ban'))return;ADM.arm={};const hrs=+val(a==='ban'?'apBanH':'apMuH')||0,why=admTxt(val(a==='ban'?'apBanR':'apMuR'),300);
    return admRun(async()=>{await admRpc('ld_admin_ban',{p_uid:p.id,p_kind:a,p_hours:hrs,p_reason:why});admSay(a==='ban'?'🚫 Đã khóa '+(p.name||'')+'.':'🔇 Đã cấm chat '+(p.name||'')+'.','ok');ADM.players=null;ADM.pl=await admRpc('ld_admin_player',{p_uid:p.id});});}
  case 'unban':case 'unmute':{const p=ADM.pl;if(!p)return;return admRun(async()=>{await admRpc('ld_admin_unban',{p_uid:p.id,p_kind:a==='unban'?'ban':'mute'});admSay('✅ Đã gỡ.','ok');ADM.players=null;ADM.pl=await admRpc('ld_admin_player',{p_uid:p.id});});}
  case 'rename':{const p=ADM.pl;if(!p)return;const n=typeof ldbCleanName==='function'?ldbCleanName(val('apName')):admTxt(val('apName'),24);if(n.length<2){admSay('Tên cần 2–24 ký tự.','bad');admRender();return;}
    return admRun(async()=>{const r=await admRpc('ld_admin_rename',{p_uid:p.id,p_name:n});admSay('✅ Đã đổi tên thành '+(r&&r.name||n)+'.','ok');try{if(LDB.names)LDB.names.delete(p.id);if(typeof MP!=='undefined'&&MP.names){delete MP.names[p.id];MP.nameQ.add(p.id);}}catch(e){}ADM.players=null;ADM.pl=await admRpc('ld_admin_player',{p_uid:p.id});});}
  case 'mail':case 'news':{const ctx=a==='mail'?'p':'all',p=ADM.pl,txt=admTxt(val(a==='mail'?'apMail':'amMail'),500),it=ADM.gift[ctx]||{};if(a==='mail'&&!p)return;
    if(!txt&&!Object.keys(it).length){admSay('Viết vài chữ hoặc kèm quà.','bad');admRender();return;}
    if(a==='news'&&Object.keys(it).length&&!admArm('news')){admSay('Gửi quà cho MỌI người? Bấm Gửi lần nữa để chắc chắn.','bad');admRender();return;}ADM.arm={};
    return admRun(async()=>{await admRpc('ld_admin_mail',{p_uid:a==='mail'?p.id:null,p_text:txt,p_items:Object.keys(it).length?it:null});ADM.gift[ctx]={};admSay(a==='mail'?'✉️ Đã gửi thư cho '+(p.name||'')+'.':'📨 Đã gửi thư cho mọi người.','ok');});}
  case 'newsdel':{if(!admArm('nd:adm'+d.id))return;ADM.arm={};return admRun(async()=>{await admRpc('ld_admin_news_del',{p_id:d.id});admSay('Đã gỡ thư.','ok');});}
  case 'del':{const path=d.p;if(!path||!admArm('del:'+path))return;ADM.arm={};const tree=/^builds\/[^/]+$/.test(path);
    return admRun(async()=>{const r=await admRpc('ld_admin_delete_doc',{p_path:path,p_tree:tree});admSay('🗑 Đã xóa '+(r&&r.deleted||0)+' tài liệu.','ok');if(ADM.pl)ADM.pl=await admRpc('ld_admin_player',{p_uid:ADM.pl.id});});}
  case 'gadd':{const ctx=d.c,k=val('ag_'+ctx),n=Math.max(1,Math.min(999,parseInt(val('agn_'+ctx),10)||1));if(!k||!ITEMS[k])return;const g=ADM.gift[ctx]||(ADM.gift[ctx]={});
    if(!g[k]&&Object.keys(g).length>=6){admSay('Tối đa 6 loại quà.','bad');admRender();return;}g[k]=n;admRender();return;}
  case 'gdel':delete (ADM.gift[d.c]||{})[d.k];admRender();return;}}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-adm]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const a=b.dataset.adm;try{sfx('pick');}catch(er){}
  if(a==='banx'){const el=document.getElementById('admban');try{sessionStorage.setItem('ld-adm-ban',el&&el.dataset.k||'');}catch(er){}if(el)el.hidden=true;return;}
  if(a==='motdx'){const el=document.getElementById('admmotd');if(el)el.hidden=true;return;}
  if(a==='reload'){location.reload();return;}if(a==='update'){admUpdate();return;}
  admAct(a,b).catch(er=>console.warn('quản trị',er));},true);
document.addEventListener('input',e=>{if(e.target&&e.target.closest&&e.target.closest('#admp')&&ADM.tab==='cfg')ADM.dirty=true;},true);
/* ---------- 9. kiểu ---------- */
(function admCss(){const s=document.createElement('style');s.textContent=`
.adm-ban{position:fixed;left:50%;transform:translateX(-50%);top:max(6px,env(safe-area-inset-top));z-index:45;max-width:min(560px,calc(100% - 24px));display:flex;align-items:center;gap:8px;padding:7px 8px 7px 12px;border-radius:12px;
  background:linear-gradient(180deg,rgba(90,52,18,.96),rgba(52,30,12,.96));border:1px solid var(--fr);box-shadow:0 6px 18px rgba(0,0,0,.45);font:600 13px/1.35 var(--body);color:var(--fg);pointer-events:auto}
.adm-ban span{flex:1;overflow-wrap:anywhere}.adm-ban button{flex:none;width:30px;height:30px;border:0;border-radius:8px;background:rgba(0,0,0,.3);color:var(--muted);font-size:14px}
.adm-blk{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;padding:16px;background:radial-gradient(circle at 50% 30%,rgba(70,40,16,.95),rgba(10,6,3,.98) 70%);touch-action:pan-y}
.adm-motd{background:rgba(10,6,3,.7);z-index:46}
.adm-bc{width:min(400px,100%);padding:22px 20px;border-radius:20px;background:linear-gradient(180deg,#3a2818,#1e140c);border:2px solid var(--fr);text-align:center;display:flex;flex-direction:column;gap:10px;box-shadow:0 20px 50px rgba(0,0,0,.6)}
.adm-bc .adm-ic{font-size:52px;line-height:1.1}.adm-bc h2{margin:0;font:400 24px var(--disp);color:var(--acc)}.adm-bc p{margin:0}.adm-pre{white-space:pre-wrap;overflow-wrap:anywhere;text-align:left}
.adm-p{position:fixed;inset:0;z-index:50;display:flex;justify-content:center;padding:max(8px,env(safe-area-inset-top)) 8px max(8px,env(safe-area-inset-bottom));background:rgba(10,6,3,.72)}
.adm-card{width:min(640px,100%);display:flex;flex-direction:column;min-height:0;border-radius:18px;background:linear-gradient(180deg,#33241a,#1c130c);border:2px solid var(--fr);box-shadow:0 18px 50px rgba(0,0,0,.6);overflow:hidden}
.adm-hd{display:flex;align-items:center;justify-content:space-between;padding:10px 12px 6px}.adm-hd h2{margin:0;font:400 20px var(--disp);color:var(--acc)}
.adm-tabs{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;padding:0 8px 8px}
.adm-tabs button{display:flex;flex-direction:column;align-items:center;gap:1px;min-height:48px;padding:4px 2px;border-radius:10px;border:1px solid var(--line);background:rgba(0,0,0,.28);color:var(--fg)}
.adm-tabs button span{font-size:18px}.adm-tabs button i{font-style:normal;font-size:10.5px;font-weight:700;color:var(--muted);line-height:1.1;text-align:center}.adm-tabs button *{pointer-events:none}
.adm-tabs button.on{border-color:var(--acc);background:rgba(242,197,90,.16)}.adm-tabs button.on i{color:var(--acc)}
.adm-body{flex:1;min-height:0;overflow-y:auto;padding:4px 12px 16px;touch-action:pan-y;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column;gap:8px}
.adm-body h3{margin:10px 0 0;font-size:14px;color:var(--acc)}.adm-body .small{font-size:12px}.adm-body p{margin:0}
.adm-p input,.adm-p textarea,.adm-p select{width:100%;box-sizing:border-box;min-height:38px;padding:7px 10px;border-radius:10px;border:1px solid var(--line);background:rgba(0,0,0,.35);color:var(--fg);font:14px var(--body);-webkit-user-select:text;user-select:text;touch-action:manipulation}
.adm-p textarea{resize:vertical}.adm-p input[type=checkbox]{width:22px;min-height:22px;height:22px;accent-color:#f2c55a;flex:none}
.adm-msg{margin:0 12px 6px;padding:7px 10px;border-radius:10px;font-size:13px;background:rgba(242,197,90,.12);border:1px solid var(--fr)}
.adm-msg.ok{background:rgba(120,220,110,.12);border-color:rgba(140,224,122,.5);color:#c8f5bd}.adm-msg.bad{background:rgba(255,100,70,.14);border-color:rgba(255,122,90,.5);color:#ffc0ac}
.adm-body .adm-msg{margin:0}
.adm-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.adm-in{display:flex;gap:6px;align-items:center}.adm-in input,.adm-in select{flex:1;min-width:0}.adm-in input[type=number]{flex:0 0 74px}
.adm-tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:6px}
.adm-tile{display:flex;flex-direction:column;padding:8px;border-radius:12px;background:rgba(0,0,0,.28);border:1px solid var(--line)}.adm-tile b{font-size:20px;color:var(--acc)}.adm-tile span{font-size:11.5px;color:var(--fg)}.adm-tile small{font-size:10.5px;color:var(--muted)}
.adm-bars{display:flex;align-items:flex-end;gap:3px;height:96px;padding:4px;border-radius:10px;background:rgba(0,0,0,.22)}
.adm-bars div{flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;position:relative}.adm-bars i{width:100%;min-height:2px;border-radius:3px 3px 0 0;background:#f2c55a}
.adm-bars small{font-size:9px;color:var(--muted)}.adm-bars em{position:absolute;top:0;font-style:normal;font-size:9px;color:var(--muted)}
.adm-tbl{display:flex;flex-direction:column;gap:3px}.adm-tr{position:relative;display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center;padding:6px 8px;border-radius:8px;background:rgba(0,0,0,.22);font-size:12.5px;color:var(--fg);border:0;text-align:left;overflow:hidden}
.adm-tr>i{position:absolute;left:0;bottom:0;height:2px;width:var(--w);background:#c98a2e}.adm-tr span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.adm-doc{grid-template-columns:1fr auto auto auto}.adm-lnk{cursor:pointer;font:inherit}.adm-lnk *{pointer-events:none}
.adm-list{display:flex;flex-direction:column;gap:5px}
.adm-pr{display:flex;gap:10px;align-items:center;padding:8px;border-radius:12px;background:rgba(0,0,0,.25);border:1px solid var(--line);color:var(--fg);text-align:left;font:inherit}.adm-pr *{pointer-events:none}
.adm-pr>span:last-child{display:flex;flex-direction:column;min-width:0}.adm-pr small{color:var(--muted);font-size:11.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.adm-av{flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:#6b4a2e;font-weight:800;color:var(--acc)}
.adm-b{font-style:normal;font-size:11px;padding:1px 6px;border-radius:8px;background:rgba(242,197,90,.18)}.adm-b.bad{background:rgba(255,100,70,.25)}.adm-b.ok{background:rgba(120,220,110,.2)}
.adm-pcard{display:flex;gap:10px;align-items:center;padding:8px;border-radius:12px;background:rgba(0,0,0,.25)}.adm-pcard>div{display:flex;flex-direction:column;min-width:0}.adm-pcard small{color:var(--muted);font-size:12px;overflow-wrap:anywhere}.adm-id{font-size:10px!important;opacity:.7}
.adm-kv{display:grid;grid-template-columns:auto 1fr;gap:3px 10px;font-size:12.5px}.adm-kv span{color:var(--muted)}.adm-kv b{font-weight:600;overflow-wrap:anywhere}
.adm-tg{display:flex;gap:8px;align-items:center;font-size:13.5px}
.adm-muls{display:flex;flex-direction:column;gap:5px}.adm-mul{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:6px 8px;border-radius:10px;background:rgba(0,0,0,.22)}
.adm-mul span{display:flex;flex-direction:column;min-width:0}.adm-mul small{color:var(--muted);font-size:11px}.adm-mul input{flex:0 0 84px;width:84px!important;text-align:center}
.adm-save{position:sticky;bottom:-16px;padding:8px 0;background:linear-gradient(transparent,#1c130c 30%)}.adm-save .btn{width:100%}
.adm-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:5px}.adm-chips .chip{display:inline-flex;align-items:center;gap:4px}.adm-chips .chip button{border:0;background:none;color:var(--muted);padding:0 2px}
.adm-news{padding:8px;border-radius:10px;background:rgba(0,0,0,.22);display:flex;flex-direction:column;gap:4px;align-items:flex-start}.adm-news p{white-space:pre-wrap;overflow-wrap:anywhere}
.adm-log{display:flex;flex-direction:column;gap:4px}.adm-log>div{display:flex;flex-direction:column;padding:6px 8px;border-radius:8px;background:rgba(0,0,0,.22);font-size:12.5px}.adm-log small{overflow-wrap:anywhere}
.adm-entry{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px;margin-bottom:8px;border-radius:12px;border:1px solid var(--acc);background:rgba(242,197,90,.12)}
.adm-entry>div{display:flex;flex-direction:column}.adm-entry small{color:var(--muted);font-size:12px}
.adm-ln{display:flex;flex-direction:column;gap:6px}
.adm-go{margin-left:4px}
`;document.head.appendChild(s);})();
