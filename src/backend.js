/* ===================== MÁY CHỦ RIÊNG CHO BẢN WEB (lanhdia.app) =====================
   Trên claude.ai trang đã có sẵn window.claude.use('user'|'db'|'room'). Ở nơi khác (lanhdia.app) không có,
   nên tệp này dựng một window.claude.use() giống hệt, chạy bằng Supabase (đăng nhập email + kho dữ liệu + phòng thời gian thực),
   để account.js, mp.js, realm.js, creator.js chạy nguyên như cũ.
   - Cấu hình: window.LD_SUPA = {url, key} (key là "publishable key" — công khai theo thiết kế; KHÔNG BAO GIỜ dùng khóa secret / service_role).
   - Bảng `docs(path, owner, coll, data)` + luật RLS: xem supabase_setup.sql.
   - Chưa đăng nhập: use() chờ; đăng nhập xong mới trả về; chọn "Chơi ngoại tuyến" thì trả về null (game tự chơi trên máy).
   - Mở tệp trên máy (file://): không làm gì cả (chơi như cũ). */
window.LD_SUPA=window.LD_SUPA||{
  url:'https://xadzlwhovydkgegageek.supabase.co',
  key:'sb_publishable_nUlN2MCtZVDR5c7H9yNEPQ_TfM_42D3',   // Project Settings → API Keys: "Publishable key" (sb_publishable_…) hoặc khóa cũ "anon public" — KHÔNG dùng secret / service_role
  google:false // true khi đã bật Google trong Authentication → Providers
};
const LDB={mode:'off',cfg:null,configured:false,sb:null,uid:null,name:'',email:'',peer:'',gate:null,gateR:null,user:null,db:null,room:null,
  ls:new Set(),rt:new Map(),delCh:null,resyncT:0,names:new Map()};
const LDB_LIB=['https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js','https://unpkg.com/@supabase/supabase-js@2.117.2/dist/umd/supabase.js'];
const LDB_SEG=/^[A-Za-z0-9_.:@+~-]{1,128}$/,LDB_UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,LDB_ROOM='lanhdia-room';
(function ldbMode(){const c=window.LD_SUPA||{};LDB.cfg=c;
  LDB.configured=typeof c.url==='string'&&/^https?:\/\/[^\s/]+/.test(c.url)&&typeof c.key==='string'&&c.key.length>20&&!/YOUR|xxx/i.test(c.key+c.url)&&!/^sb_secret_/.test(c.key);
  if(window.claude){LDB.mode='claude';return;}
  // chỉ trang mở qua mạng (lanhdia.app, localhost…) mới dùng máy chủ; tệp mở trên máy (file://) chơi như cũ, trừ khi kiểm thử bật LD_FORCE_LOGIN
  if(/^https?:$/.test(location.protocol)||window.LD_FORCE_LOGIN)LDB.mode='web';
  if(LDB.mode!=='web')return;
  LDB.peer=Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);
  LDB.gate=new Promise(r=>{LDB.gateR=r;});
  const use=async n=>{const ok=await LDB.gate;if(!ok)return null;return n==='user'?LDB.user:n==='db'?LDB.db:n==='room'?LDB.room:null;};
  window.claude=Object.freeze({use});})();
const ldbTO=(p,ms,code)=>Promise.race([p,new Promise((_,rj)=>setTimeout(()=>rj({code:code||'unavailable',message:'hết thời gian chờ máy chủ'}),ms))]);
const ldbClone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
function ldbErr(e){if(e&&typeof e.code==='string'&&/^[a-z_]+$/.test(e.code)&&!e.details&&!e.hint)return e;const c=String(e&&e.code||''),m=String(e&&e.message||e||'');
  if(/ld_quota/.test(m))return {code:'quota_exceeded',message:m};
  if(c==='42501'||c==='PGRST301'||/row-level security|permission denied|JWT/i.test(m))return {code:'invalid_argument',message:'không có quyền: '+m};
  if(/^(22|23|42)/.test(c)||c==='PGRST116'||c==='PGRST102')return {code:'invalid_argument',message:m};
  return {code:'unavailable',message:m};}
// gọi máy chủ: {data,error} → data, lỗi → {code,message} theo db.d.ts
async function ldbQ(p,ms){let r;try{r=await ldbTO(Promise.resolve(p),ms||15000);}catch(e){throw ldbErr(e);}if(r&&r.error)throw ldbErr(r.error);return r?r.data:null;}
/* ---------- tải thư viện (chỉ ở bản web), tạo kết nối ---------- */
function ldbScript(src,ms){return new Promise((res,rj)=>{const s=document.createElement('script');s.src=src;s.async=true;s.crossOrigin='anonymous';if(/supabase-js@2\.117\.2\//.test(src))s.integrity='sha384-Rj26LVGvoeRVR6+mwQmFfcR3QOBEwT+ZmuCWpuiqeTzJpCs0ER4ITAWGb4Hiy3Ok';/* đúng tệp supabase-js 2.117.2 đã biết */
  const t=setTimeout(()=>{s.remove();rj(new Error('timeout'));},ms);s.onload=()=>{clearTimeout(t);res();};s.onerror=()=>{clearTimeout(t);s.remove();rj(new Error('load'));};document.head.appendChild(s);});}
LDB.init=async function(){if(LDB.sb)return LDB.sb;if(!LDB.configured)throw {code:'config',message:'Máy chủ chưa được cấu hình'};
  for(const u of LDB_LIB){if(window.supabase&&window.supabase.createClient)break;try{await ldbScript(u,15000);}catch(e){console.warn('tải thư viện máy chủ',u,e&&e.message);}}
  if(!(window.supabase&&window.supabase.createClient))throw {code:'cdn',message:'Không tải được thư viện máy chủ'};
  LDB.sb=window.supabase.createClient(LDB.cfg.url,LDB.cfg.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'ld-auth',flowType:'implicit'},
    realtime:{params:{eventsPerSecond:20}}});
  return LDB.sb;};
LDB.session=async function(){const sb=await LDB.init();const r=await ldbTO(sb.auth.getSession(),12000).catch(()=>({data:{session:null}}));return r&&r.data&&r.data.session||null;};
/* ---------- tên hiển thị ---------- */
function ldbCleanName(n){return String(n||'').replace(/[\u0000-\u001f\u007f-\u009f­​-‏‪-‮⁠-⁯﻿<>"\\\/@]/g,'').replace(/\s+/g,' ').trim().slice(0,24).trim();}
LDB.nameFree=async function(n){try{const sb=await LDB.init();const r=await ldbTO(sb.rpc('ld_name_free',{n}),8000);return r.error?null:!!r.data;}catch(e){return null;}};
/* ---------- đăng nhập / đăng ký (login.js gọi) ---------- */
function ldbAuthMsg(e){const m=String(e&&(e.message||e.msg||e.error_description)||e||''),st=e&&e.status;
  if(/invalid login credentials/i.test(m))return 'Sai email hoặc mật khẩu.';
  if(/email not confirmed/i.test(m))return 'Email chưa được xác nhận. Mở thư xác nhận (xem cả mục Spam/Quảng cáo) rồi đăng nhập lại.';
  if(/already registered|already been registered|user already exists/i.test(m))return 'Email này đã có tài khoản. Hãy đăng nhập.';
  if(/password should be|password.*(at least|characters)|weak/i.test(m))return 'Mật khẩu cần ít nhất 6 ký tự (nên dài hơn, có cả chữ và số).';
  if(/invalid.*email|email.*invalid|unable to validate email/i.test(m))return 'Email không hợp lệ.';
  if(st===429||/rate limit|too many|security purposes/i.test(m))return 'Bạn thử quá nhiều lần. Đợi vài phút rồi thử lại.';
  if(/signups? not allowed|signup is disabled/i.test(m))return 'Máy chủ đang tạm khóa đăng ký mới.';
  if(/provider is not enabled|unsupported provider/i.test(m))return 'Cách đăng nhập này chưa được bật trên máy chủ.';
  if(/failed to fetch|network|load failed|timeout|hết thời gian/i.test(m)||st===0)return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
  return 'Có lỗi: '+m.slice(0,140);}
LDB.signIn=async function(email,pw){const sb=await LDB.init();const r=await ldbTO(sb.auth.signInWithPassword({email,password:pw}),20000).catch(e=>({error:e}));
  if(r.error)throw {msg:ldbAuthMsg(r.error)};return r.data.session;};
LDB.signUp=async function(email,pw,name){const sb=await LDB.init();const r=await ldbTO(sb.auth.signUp({email,password:pw,options:{data:{name},emailRedirectTo:location.origin+location.pathname}}),20000).catch(e=>({error:e}));
  if(r.error)throw {msg:ldbAuthMsg(r.error)};const d=r.data||{};
  // Supabase trả về người dùng "giả" (không có identities) khi email đã đăng ký mà đang bật xác nhận email
  if(d.user&&Array.isArray(d.user.identities)&&!d.user.identities.length)throw {msg:'Email này đã có tài khoản. Hãy đăng nhập.'};
  return d.session||null;};
LDB.reset=async function(email){const sb=await LDB.init();const r=await ldbTO(sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname}),20000).catch(e=>({error:e}));if(r.error)throw {msg:ldbAuthMsg(r.error)};};
LDB.newPassword=async function(pw){const sb=await LDB.init();const r=await ldbTO(sb.auth.updateUser({password:pw}),20000).catch(e=>({error:e}));if(r.error)throw {msg:ldbAuthMsg(r.error)};};
LDB.google=async function(){const sb=await LDB.init();const r=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname}}).catch(e=>({error:e}));if(r&&r.error)throw {msg:ldbAuthMsg(r.error)};};
LDB.signOut=async function(){try{for(const ch of LDB.rt.values())try{LDB.sb.removeChannel(ch.ch);}catch(e){}if(LDB.sb)await ldbTO(LDB.sb.auth.signOut(),6000);}catch(e){try{localStorage.removeItem('ld-auth');}catch(er){}}};
LDB.onRecovery=null;
// vào game: lấy tên, dựng user/db/room, mở cổng cho use()
LDB.enter=async function(session){const sb=LDB.sb,u=session.user;LDB.uid=u.id;LDB.email=u.email||'';
  let name='';try{const p=await ldbQ(sb.from('profiles').select('name').eq('id',u.id).maybeSingle(),8000);name=p&&p.name||'';}catch(e){}
  if(!name){const md=u.user_metadata||{};name=ldbCleanName(md.name||md.full_name||(u.email||'').split('@')[0])||'Người chơi';}
  LDB.name=name;LDB.names.set(u.id,name);try{localStorage.setItem('ld-last-uid',u.id);}catch(e){}
  LDB.user=ldbUserNS();LDB.db=ldbDbNS();LDB.room=ldbRoomNS('');
  sb.auth.onAuthStateChange((ev,s)=>{if(ev==='SIGNED_OUT'&&LDB.uid&&!LDB.leaving){LDB.uid=null;try{uiToast('Phiên đăng nhập đã hết. Tải lại trang để đăng nhập lại.','bad');}catch(e){}}});
  LDB.gateR(true);};
LDB.offline=function(){if(LDB.gateR)LDB.gateR(false);};
/* ---------- user ---------- */
const LDB_COL=['#e5532c','#f2c55a','#5aa0e6','#7ac46a','#b06ad8','#e66aa8','#4ac0b8','#d89a5a'];
const ldbColOf=id=>{let h=0;for(const c of String(id))h=(h*31+c.charCodeAt(0))|0;return LDB_COL[Math.abs(h)%LDB_COL.length];};
function ldbUserNS(){const prof=(id,name)=>({id,name:name||'',avatarUrl:'',color:ldbColOf(id),email:id===LDB.uid?LDB.email:null,isMe:id===LDB.uid,guest:false});
  return Object.freeze({
    id:async()=>LDB.uid,isOwner:async()=>false,canEdit:async()=>!!LDB.uid,can:async()=>!!LDB.uid,
    me:async()=>({id:LDB.uid,name:LDB.name,avatarUrl:'',color:ldbColOf(LDB.uid),email:LDB.email||null,isOwner:false,canEdit:true}),
    name:async()=>LDB.name,avatarUrl:async()=>null,email:async()=>LDB.email||null,search:async()=>[],
    profiles:async function(ids){ids=[...new Set([].concat(ids||[]).filter(i=>typeof i==='string'))];const out={},need=[];
      for(const id of ids){if(LDB.names.has(id))out[id]=prof(id,LDB.names.get(id));else if(LDB_UUID.test(id))need.push(id);}
      for(let i=0;i<need.length;i+=100){const part=need.slice(i,i+100);const rows=await ldbQ(LDB.sb.from('profiles').select('id,name').in('id',part),12000);
        for(const r of rows||[]){if(r&&typeof r.name==='string'){LDB.names.set(r.id,r.name);out[r.id]=prof(r.id,r.name);}}}
      return out;}});}
/* ---------- db: tài liệu & bộ sưu tập trên bảng docs ---------- */
function ldbPath(p,coll){if(typeof p!=='string'||p.length>400)throw new TypeError('đường dẫn không hợp lệ');const s=p.split('/');
  if(!s.every(x=>LDB_SEG.test(x)))throw new TypeError('đường dẫn không hợp lệ: '+p);if((s.length%2===1)!==coll)throw new TypeError((coll?'bộ sưu tập':'tài liệu')+' sai số đoạn: '+p);return p;}
const ldbParent=p=>p.slice(0,p.lastIndexOf('/')),ldbId=p=>p.slice(p.lastIndexOf('/')+1);
function ldbData(d){if(!d||typeof d!=='object'||Array.isArray(d))throw {code:'invalid_argument',message:'dữ liệu phải là một đối tượng'};const s=JSON.stringify(d);
  if(s.length>500000)throw {code:'invalid_argument',message:'tài liệu quá lớn'};return JSON.parse(s);}
function ldbMerge(a,b){const o=Object.assign({},a);for(const k in b){const v=b[k];o[k]=v&&typeof v==='object'&&!Array.isArray(v)&&o[k]&&typeof o[k]==='object'&&!Array.isArray(o[k])?ldbMerge(o[k],v):v;}return o;}
const LDB_MD=Object.freeze({fromCache:false,hasPendingWrites:false});
function ldbDS(path,data){const ex=data!==undefined&&data!==null,j=ex?JSON.stringify(data):'';return Object.freeze({id:ldbId(path),exists:ex,data:()=>ex?JSON.parse(j):undefined,metadata:LDB_MD});}
async function ldbGet(path){const r=await ldbQ(LDB.sb.from('docs').select('data').eq('path',path).maybeSingle());return r?r.data:null;}
async function ldbSet(path,data){await ldbQ(LDB.sb.from('docs').upsert({path,data},{onConflict:'path'}));ldbLocal(path,data);}
async function ldbDel(path){await ldbQ(LDB.sb.from('docs').delete().eq('path',path));ldbLocal(path,null);}
async function ldbAcquire(path,o){o=o||{};const holder=String(o.holder||LDB.uid||'').slice(0,128),ttl=Math.max(500,Math.min(60000,+o.ttlMs||30000));
  const r=await ldbQ(LDB.sb.rpc('ld_acquire',{p_path:path,p_holder:holder,p_ttl_ms:ttl}));return r&&typeof r==='object'?{acquired:!!r.acquired,version:r.version,expiresAt:r.expiresAt,holder:r.holder}:{acquired:false};}
function ldbDoc(path){ldbPath(path,false);return Object.freeze({id:ldbId(path),path,
  get:()=>ldbGet(path).then(d=>ldbDS(path,d)),
  set:async d=>ldbSet(path,ldbData(d)),
  update:async d=>{const x=ldbData(d);const cur=await ldbGet(path);if(!cur)throw {code:'invalid_argument',message:'tài liệu chưa có: '+path};await ldbSet(path,ldbData(ldbMerge(cur,x)));},
  delete:async()=>ldbDel(path),
  acquire:o=>ldbAcquire(path,o),
  onSnapshot:(next,err)=>ldbListen({kind:'doc',path,next,err}),
  collection:p=>ldbColl(path+'/'+p)});}
const LDB_OPS=new Set(['==','!=','<','<=','>','>=','in','not-in','array-contains']);
function ldbQuery(coll,w,ord,lim){return Object.freeze({
  where:(f,op,v)=>{if(typeof f!=='string'||!LDB_OPS.has(op))throw new TypeError('điều kiện không hợp lệ');return ldbQuery(coll,w.concat([[f,op,v]]),ord,lim);},
  orderBy:(f,dir)=>ldbQuery(coll,w,[f,dir==='desc'?'desc':'asc'],lim),
  limit:n=>ldbQuery(coll,w,ord,Math.max(1,Math.min(1000,n|0))),
  get:async()=>{const L={kind:'q',coll,w,ord,lim,map:new Map()};await ldbFetch(L);return ldbQS(L,null).snap;},
  onSnapshot:(next,err)=>ldbListen({kind:'q',coll,w,ord,lim,next,err})});}
function ldbColl(path){ldbPath(path,true);return Object.freeze(Object.assign({},ldbQuery(path,[],null,0),{path,
  doc:id=>ldbDoc(path+'/'+(id||(Date.now().toString(36)+Math.random().toString(36).slice(2,12)))),
  add:async d=>{const r=ldbDoc(path+'/'+Date.now().toString(36)+Math.random().toString(36).slice(2,12));await r.set(d);return r;}}));}
function ldbDbNS(){return Object.freeze({doc:ldbDoc,collection:ldbColl});}
// điều kiện lọc chạy ở máy (và một phần ở máy chủ khi được)
const ldbField=(d,f)=>f.split('.').reduce((o,k)=>o&&typeof o==='object'?o[k]:undefined,d);
const ldbEq=(a,b)=>a===b||JSON.stringify(a)===JSON.stringify(b);
function ldbMatch(d,w){for(const [f,op,v] of w){const x=ldbField(d,f);
    if(op==='=='){if(!ldbEq(x,v))return false;}else if(op==='!='){if(x===undefined||ldbEq(x,v))return false;}
    else if(op==='in'){if(!Array.isArray(v)||!v.some(y=>ldbEq(x,y)))return false;}else if(op==='not-in'){if(x===undefined||!Array.isArray(v)||v.some(y=>ldbEq(x,y)))return false;}
    else if(op==='array-contains'){if(!Array.isArray(x)||!x.some(y=>ldbEq(y,v)))return false;}
    else{if(x===undefined||x===null||typeof x!==typeof v)return false;if(op==='<'&&!(x<v)||op==='<='&&!(x<=v)||op==='>'&&!(x>v)||op==='>='&&!(x>=v))return false;}}return true;}
async function ldbFetch(L){if(L.kind==='doc'){const d=await ldbGet(L.path);L.map=new Map(d?[[L.path,JSON.stringify(d)]]:[]);return;}
  let q=LDB.sb.from('docs').select('path,data').eq('coll',L.coll);let exact=!L.ord;
  for(const [f,op,v] of L.w){if(op==='=='&&/^[A-Za-z0-9_]{1,64}$/.test(f)&&(typeof v==='string'||typeof v==='number'||typeof v==='boolean'))q=q.eq('data->>'+f,String(v));else exact=false;}
  q=q.order('path',{ascending:true}).limit(exact&&L.lim?L.lim:1000);
  const rows=await ldbQ(q,20000);const m=new Map();for(const r of rows||[])if(r&&r.data&&ldbMatch(r.data,L.w))m.set(r.path,JSON.stringify(r.data));
  {const o=L.map;let ch=!o||o.size!==m.size||L.ver==null;if(!ch)for(const [p,j] of m)if(o.get(p)!==j){ch=true;break;}L.map=m;if(ch)L.ver=(L.ver|0)+1;}}
/* CHỐNG GIẬT (thế giới chung): trước đây mỗi lần BẤT KỲ ai trên máy chủ ghi một bản ghi, bộ nghe giải mã lại TOÀN BỘ bộ sưu tập (hàng trăm bản ghi),
   đóng gói lại từng bản, ghép một chuỗi khoá dài cả trăm nghìn ký tự, rồi mỗi phần của game gọi data() lại giải mã thêm lần nữa → khựng 1-2 giây một lần khi đông người.
   Giờ: mỗi bản ghi chỉ giải mã MỘT lần khi nội dung của nó đổi (nhớ trong L.cache), data() trả lại bản đã giải mã, so "có đổi không" bằng số phiên bản L.ver,
   và các thay đổi dồn dập được gom lại: mỗi bộ nghe báo tối đa một lần mỗi 1,5 giây. */
const LDB_GAP=1500;
function ldbQS(L,prev){const C=L.cache||(L.cache=new Map());let E=[];for(const [p,j] of L.map){let c=C.get(p);if(!c||c.j!==j){const d=JSON.parse(j);c={p,j,d,ds:Object.freeze({id:ldbId(p),exists:true,data:()=>d,metadata:LDB_MD})};C.set(p,c);}E.push(c);}
  if(C.size>L.map.size)for(const p of [...C.keys()])if(!L.map.has(p))C.delete(p);
  if(L.ord){const [f,dir]=L.ord,s=dir==='desc'?-1:1;E.sort((a,b)=>{const x=ldbField(a.d,f),y=ldbField(b.d,f);if(x===undefined&&y===undefined)return a.p<b.p?-1:1;if(x===undefined)return 1;if(y===undefined)return -1;return (x<y?-1:x>y?1:(a.p<b.p?-1:1))*s;});}
  else E.sort((a,b)=>a.p<b.p?-1:a.p>b.p?1:0);if(L.lim)E=E.slice(0,L.lim);
  const docs=E.map(e=>e.ds),idx=new Map(E.map((e,i)=>[e.p,i])),pj=prev?prev.j:new Map(),pi=prev?prev.i:new Map();
  const ch=[];for(const [p,i] of pi)if(!idx.has(p))ch.push({type:'removed',doc:ldbDS(p,JSON.parse(pj.get(p))),oldIndex:i,newIndex:-1});
  E.forEach((e,i)=>{if(!pi.has(e.p))ch.push({type:'added',doc:docs[i],oldIndex:-1,newIndex:i});else if(pj.get(e.p)!==e.j||pi.get(e.p)!==i)ch.push({type:'modified',doc:docs[i],oldIndex:pi.get(e.p),newIndex:i});});
  const snap=Object.freeze({docs,size:docs.length,empty:!docs.length,docChanges:()=>ch.slice(),metadata:LDB_MD});
  return {snap,j:new Map(E.map(e=>[e.p,e.j])),i:idx};}
// đổi một bản ghi trong bộ nghe; trả về true nếu nội dung thật sự khác
function ldbMapPut(L,path,j){if(j!=null){if(L.map.get(path)===j)return false;L.map.set(path,j);}else{if(!L.map.has(path))return false;L.map.delete(path);}L.ver=(L.ver|0)+1;return true;}
function ldbEmit(L){if(L.dead)return;if(L.kind==='doc'){const j=L.map.get(L.path)||'';if(L.sent&&L.last===j)return;L.sent=true;L.last=j;try{L.next(ldbDS(L.path,j?JSON.parse(j):null));}catch(e){console.warn('máy chủ: nghe',e);}return;}
  if(L.sent&&L.sentVer===L.ver)return;{const now=Date.now();if(L.sent&&now-(L.emitT||0)<LDB_GAP){if(!L.et)L.et=setTimeout(()=>{L.et=null;ldbEmit(L);},LDB_GAP-(now-L.emitT)+5);return;}L.emitT=now;}
  const r=ldbQS(L,L.prev);L.sent=true;L.sentVer=L.ver;L.prev=r;try{L.next(r.snap);}catch(e){console.warn('máy chủ: nghe',e);}}
// ghi xong: các bộ nghe trên máy này thấy ngay (như Firestore)
function ldbLocal(path,data){const coll=ldbParent(path);for(const L of LDB.ls){if(L.dead||!L.ready)continue;
    if(L.kind==='doc'?L.path!==path:L.coll!==coll)continue;ldbMapPut(L,path,data&&(L.kind==='doc'||ldbMatch(data,L.w))?JSON.stringify(data):null);ldbEmit(L);}}
// thay đổi từ máy chủ (Realtime postgres_changes)
function ldbRtEvent(pl){const t=pl&&pl.eventType;if(t==='DELETE'){const p=pl.old&&pl.old.path;if(typeof p==='string')ldbLocalRemote(p,null);return;}
  const n=pl&&pl.new;if(!n||typeof n.path!=='string')return;if(n.data&&typeof n.data==='object')ldbLocalRemote(n.path,n.data);else ldbRefetchFor(n.path);}
function ldbLocalRemote(path,data){const coll=ldbParent(path);for(const L of LDB.ls){if(L.dead||!L.ready)continue;if(L.kind==='doc'?L.path!==path:L.coll!==coll)continue;
    const j=data?JSON.stringify(data):null;ldbMapPut(L,path,data&&(L.kind==='doc'||ldbMatch(data,L.w))?j:null);ldbEmit(L);}}
function ldbRefetchFor(path){const coll=ldbParent(path);for(const L of LDB.ls)if(!L.dead&&(L.kind==='doc'?L.path===path:L.coll===coll))ldbRefetch(L);}
function ldbRefetch(L){if(L.rf)return;L.rf=setTimeout(async()=>{L.rf=null;if(L.dead)return;try{await ldbFetch(L);L.ready=true;ldbEmit(L);}catch(e){}},250);}
function ldbRtKey(L){return L.kind==='doc'?'path=eq.'+L.path:'coll=eq.'+L.coll;}
function ldbRtSub(key){let c=LDB.rt.get(key);if(c){c.n++;return;}c={n:1,ch:null,up:false};LDB.rt.set(key,c);
  const ch=LDB.sb.channel('ld-db-'+key.replace(/[^A-Za-z0-9_.:-]/g,'_')+'-'+Math.random().toString(36).slice(2,6));c.ch=ch;
  ch.on('postgres_changes',{event:'*',schema:'public',table:'docs',filter:key},ldbRtEvent);
  ch.subscribe(st=>{if(st==='SUBSCRIBED'){if(c.up){for(const L of LDB.ls)if(!L.dead&&ldbRtKey(L)===key)ldbRefetch(L);}c.up=true;}});
  if(!LDB.delCh){LDB.delCh=LDB.sb.channel('ld-db-del-'+Math.random().toString(36).slice(2,6));LDB.delCh.on('postgres_changes',{event:'DELETE',schema:'public',table:'docs'},ldbRtEvent).subscribe();}
  if(!LDB.resyncT)LDB.resyncT=setInterval(()=>{if(document.hidden)return;for(const L of LDB.ls)if(!L.dead&&L.kind==='q')ldbRefetch(L);},120000);}
function ldbRtUnsub(key){const c=LDB.rt.get(key);if(!c)return;if(--c.n>0)return;LDB.rt.delete(key);try{LDB.sb.removeChannel(c.ch);}catch(e){}}
function ldbListen(L){if(typeof L.next!=='function')throw new TypeError('cần hàm nhận');if(L.kind==='doc')ldbPath(L.path,false);L.map=new Map();LDB.ls.add(L);const key=ldbRtKey(L);
  try{ldbRtSub(key);}catch(e){console.warn('máy chủ: realtime',e);}
  (async()=>{for(let k=0;k<3&&!L.dead;k++){try{await ldbFetch(L);L.ready=true;ldbEmit(L);return;}catch(e){if(k===2||e.code!=='unavailable'){if(L.err&&!L.dead)try{L.err(e);}catch(er){}return;}await new Promise(r=>setTimeout(r,1500*(k+1)));}}})();
  return ()=>{if(L.dead)return;L.dead=true;LDB.ls.delete(L);if(L.rf)clearTimeout(L.rf);if(L.et)clearTimeout(L.et);ldbRtUnsub(key);};}
/* ---------- room: kênh Realtime "lanhdia-room" (presence = ai đang ở đây, broadcast = vị trí + chủ đề) ---------- */
const LDB_PEER=/^[a-z0-9]{6,32}$/,LDB_ID=/^[A-Za-z0-9_\-.:@+~]{1,128}$/;
function ldbRoomNS(name){const R={name,peers:new Map(),mine:{},seq:0,ch:null,ready:null,conn:false,hp:new Set(),ht:new Map(),hc:new Set(),pend:null,lastB:0,bT:null,lastT:0,pruneT:null,joinedOnce:false};
  const topic=name?LDB_ROOM+':'+name:LDB_ROOM;
  const self=()=>({peer:LDB.peer,by:LDB.uid,isMe:true,sameTab:true,kind:'viewer',guest:false,presence:Object.freeze(Object.assign({},R.mine)),updatedAt:R.myAt||Date.now()});
  const mkPeer=(peer,by,pres,at)=>({peer,by,isMe:by===LDB.uid,sameTab:false,kind:'viewer',guest:false,presence:Object.freeze(pres),updatedAt:at});
  function change(kind,p){if(!R.pend){R.pend={joined:[],left:[],updated:[]};queueMicrotask(flush);}R.pend[kind].push(p);}
  function flush(){const c=R.pend;R.pend=null;if(!c)return;const peers=list();const ev={peers,joined:c.joined,left:c.left,updated:c.updated};for(const h of [...R.hp])try{h(ev);}catch(e){console.warn('phòng: onPeers',e);}}
  function list(){const L=[self()];for(const p of R.peers.values())L.push(p.o);return Object.freeze(L);}
  function okPres(o){if(!o||typeof o!=='object'||Array.isArray(o))return null;try{if(JSON.stringify(o).length>4096)return null;}catch(e){return null;}return o;}
  function upsert(peer,by,pres,seq,fromP){if(peer===LDB.peer||!LDB_PEER.test(peer)||!LDB_ID.test(by))return;const now=Date.now();let e=R.peers.get(peer);
    if(!e){e={seq:-1,at:now,o:null,by};R.peers.set(peer,e);e.o=mkPeer(peer,by,okPres(pres)||{},now);e.seq=seq|0;e.lastP=fromP?now:0;change('joined',e.o);return;}
    if(fromP)e.lastP=now;if(e.by!==by)return;const s=seq|0;if(pres&&s>e.seq){const ok=okPres(pres);if(!ok)return;e.seq=s;e.at=now;e.o=mkPeer(peer,by,ok,now);change('updated',e.o);}}
  function drop(peer){const e=R.peers.get(peer);if(!e)return;R.peers.delete(peer);change('left',e.o);}
  function onSync(){if(!R.ch)return;const st=R.ch.presenceState()||{},seen=new Set();
    for(const k in st){const m=(st[k]||[])[0];if(!m||typeof m!=='object')continue;seen.add(k);upsert(k,m.by,m.p,m.s,false);}
    const now=Date.now();for(const [k,e] of R.peers)if(!seen.has(k)&&now-(e.lastP||0)>30000)drop(k);}
  function onLeave(x){for(const m of (x&&x.leftPresences)||[]){const k=m&&m.presence_ref&&x.key;if(k&&R.peers.has(k)){const e=R.peers.get(k);if(Date.now()-(e.lastP||0)>2500)drop(k);}}}
  function onJoin(x){if(x&&x.key&&x.key!==LDB.peer&&R.hasMine)sendState(true);}
  function onP(m){const p=m&&m.payload;if(!p||typeof p!=='object'||typeof p.peer!=='string'||typeof p.by!=='string')return;upsert(p.peer,p.by,p.p,p.s,true);}
  function onMsg(m){const p=m&&m.payload;if(!p||typeof p!=='object'||typeof p.topic!=='string'||typeof p.peer!=='string'||!LDB_ID.test(String(p.by)))return;deliver(p,false);}
  function deliver(p,mine){const H=R.ht.get(p.topic);if(!H||!H.size)return;const msg=Object.freeze({topic:p.topic,data:p.data===undefined?undefined:ldbClone(p.data),peer:p.peer,by:p.by,isMe:p.by===LDB.uid,sameTab:mine,kind:'viewer',guest:false});
    for(const h of [...H])try{h(msg);}catch(e){console.warn('phòng: on',e);}}
  function setConn(c){if(c===R.conn)return;R.conn=c;for(const h of [...R.hc])try{h(c);}catch(e){}}
  function ensure(){if(R.ready)return R.ready;const ch=LDB.sb.channel(topic,{config:{presence:{key:LDB.peer},broadcast:{self:false,ack:false}}});R.ch=ch;
    ch.on('presence',{event:'sync'},onSync).on('presence',{event:'join'},onJoin).on('presence',{event:'leave'},onLeave)
      .on('broadcast',{event:'p'},onP).on('broadcast',{event:'m'},onMsg);
    R.ready=new Promise(res=>{ch.subscribe(st=>{if(st==='SUBSCRIBED'){setConn(true);R.joinedOnce=true;track(true);if(R.hasMine)sendState(true);res();}else if(st==='CHANNEL_ERROR'||st==='TIMED_OUT'||st==='CLOSED')setConn(false);});});
    R.pruneT=setInterval(()=>{const now=Date.now();let st={};try{st=ch.presenceState()||{};}catch(e){}for(const [k,e] of R.peers)if(!st[k]&&now-(e.lastP||0)>45000)drop(k);},15000);
    queueMicrotask(()=>{change('joined',self());});return R.ready;}
  // presence của Supabase nặng: chỉ "ghi danh" thưa (≤ 1 lần/10 giây); vị trí gửi bằng broadcast (≤ 1 lần/0,35 giây)
  function track(force){if(!R.ch||!R.conn)return;const now=Date.now();if(!force&&now-R.lastT<10000)return;R.lastT=now;R.ch.track({by:LDB.uid,p:R.mine,s:R.seq}).catch(()=>{});}
  function sendState(now){if(!R.ch||!R.conn)return;const go=()=>{R.bT=null;R.lastB=Date.now();R.ch.send({type:'broadcast',event:'p',payload:{peer:LDB.peer,by:LDB.uid,p:R.mine,s:R.seq}}).catch(()=>{});track(false);};
    const wait=350-(Date.now()-R.lastB);if(now&&wait<=0){if(R.bT){clearTimeout(R.bT);}go();return;}if(!R.bT)R.bT=setTimeout(go,Math.max(0,wait));}
  const api={name,
    presence:async patch=>{if(!patch||typeof patch!=='object'||Array.isArray(patch))throw {code:'invalid_argument',message:'presence cần một đối tượng'};const m=Object.assign({},R.mine);
      for(const k in patch){if(patch[k]===null)delete m[k];else m[k]=ldbClone(patch[k]);}if(JSON.stringify(m).length>4096)throw {code:'invalid_argument',message:'presence quá 4 KiB'};
      R.mine=m;R.seq++;R.myAt=Date.now();R.hasMine=true;ensure();change('updated',self());sendState(true);},
    peers:()=>list(),
    onPeers:(h,err)=>{R.hp.add(h);ensure();queueMicrotask(()=>{if(R.hp.has(h))try{h({peers:list(),joined:list(),left:[],updated:[]});}catch(e){}});return ()=>{R.hp.delete(h);};},
    emit:async(topic,data)=>{if(typeof topic!=='string'||!/^[A-Za-z0-9_.:-]{1,64}$/.test(topic))throw {code:'invalid_argument',message:'chủ đề không hợp lệ'};
      const d=data===undefined?undefined:ldbClone(data);if(JSON.stringify(d===undefined?null:d).length>4096)throw {code:'invalid_argument',message:'tin quá 4 KiB'};
      await ldbTO(ensure(),15000,'upstream_error');const p={topic,data:d,peer:LDB.peer,by:LDB.uid};const r=await R.ch.send({type:'broadcast',event:'m',payload:p});
      if(r&&r!=='ok')throw {code:r==='rate limited'?'rate_limited':'upstream_error',message:String(r)};deliver(p,true);},
    on:(topic,h,err)=>{let H=R.ht.get(topic);if(!H){H=new Set();R.ht.set(topic,H);}H.add(h);ensure();return ()=>{H.delete(h);};},
    connected:()=>R.conn,
    onConnection:(h)=>{R.hc.add(h);ensure();queueMicrotask(()=>{if(R.hc.has(h))try{h(R.conn);}catch(e){}});return ()=>{R.hc.delete(h);};},
    sendToClaudeSession:async()=>{throw {code:'claude_unavailable',message:'không có trên bản web'};},canSendToClaudeSession:async()=>'unsupported'};
  if(!name){api.join=async n=>{if(typeof n!=='string'||!/^[A-Za-z0-9_-]{1,64}$/.test(n))throw {code:'invalid_argument',message:'tên phòng không hợp lệ'};return ldbRoomNS(n);};}
  else api.leave=async()=>{clearInterval(R.pruneT);if(R.ch){try{await R.ch.untrack();}catch(e){}try{LDB.sb.removeChannel(R.ch);}catch(e){}}R.ch=null;R.ready=null;setConn(false);};
  addEventListener('pagehide',()=>{try{if(R.ch)R.ch.untrack();}catch(e){}});
  return Object.freeze(api);}
