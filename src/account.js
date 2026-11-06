/* ===================== TÀI KHOẢN & NHÂN VẬT =====================
   - Người mở trang trên claude.ai đã đăng nhập sẵn: dùng danh tính đó để lưu game lên máy chủ (riêng từng người).
   - Mỗi tài khoản có tối đa 4 nhân vật (tên, nam/nữ, ngoại hình, chế độ), mỗi nhân vật một thế giới riêng.
   - Mở tệp offline: vẫn có nhiều nhân vật, lưu trên máy này. */
const ACC={db:null,user:null,uid:null,name:'',cloud:{},busy:false,lastPush:0,ready:false};
const SLK='ldtt-slots',CURK='ldtt-cur',MAXCH=4,PART=200000;
function accLS(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){return null;}}
function slotsLocal(){try{return JSON.parse(accLS(SLK)||'{}')||{};}catch(e){return {};}}
function slotsWrite(o){accLS(SLK,JSON.stringify(o));}
function curSlot(){return accLS(CURK);}
function slotMeta(s){const ag=typeof AGES!=='undefined'&&AGES[s.age||0];return {name:s.name||'Lửa',sex:((LOOK2[s.look||0]||{}).sex)||'m',look:s.look||0,mode:s.mode||'cozy',day:s.day||1,age:ag?ag.n:'',ts:Date.now()};}
// bản lưu cũ (trước khi có nhân vật): biến thành nhân vật đầu tiên
(function accMigrate(){const sl=slotsLocal();const raw=accLS(SKEY);if(!Object.keys(sl).length&&raw){try{const s=JSON.parse(raw);const id='c'+Date.now().toString(36);sl[id]=slotMeta(s);slotsWrite(sl);accLS(SKEY+'#'+id,raw);accLS(CURK,id);}catch(e){}}})();
// mỗi lần lưu: chép sang ngăn của nhân vật đang chơi + đẩy lên máy chủ (thưa)
{const _sv=save;save=function(){_sv();const id=curSlot();if(!id||!S)return;const raw=accLS(SKEY);if(!raw)return;accLS(SKEY+'#'+id,raw);const sl=slotsLocal();sl[id]=Object.assign(sl[id]||{},slotMeta(S));slotsWrite(sl);
  if(ACC.db&&Date.now()-ACC.lastPush>45000)accPush(id);};}
addEventListener('pagehide',()=>{try{save();const id=curSlot();if(ACC.db&&id)accPush(id,true);}catch(e){}});
async function accPush(id,force){if(!ACC.db||ACC.busy||!id)return;const raw=accLS(SKEY+'#'+id);if(!raw)return;ACC.busy=true;ACC.lastPush=Date.now();
  try{const base='data/users/'+ACC.uid;const n=Math.ceil(raw.length/PART);for(let i=0;i<n;i++)await ACC.db.doc(`${base}/parts/${id}_${i}`).set({s:raw.slice(i*PART,(i+1)*PART)});
    const m=Object.assign({},slotsLocal()[id]||slotMeta(S),{parts:n,len:raw.length});await ACC.db.doc(`${base}/chars/${id}`).set(m);ACC.cloud[id]=m;}catch(e){console.warn('lưu máy chủ',e);}ACC.busy=false;}
async function accPull(id){const m=ACC.cloud[id];if(!ACC.db||!m)return null;try{const base='data/users/'+ACC.uid;let s='';for(let i=0;i<(m.parts||1);i++){const d=await ACC.db.doc(`${base}/parts/${id}_${i}`).get();if(!d.exists)return null;s+=d.data().s||'';}return s.length===m.len?s:null;}catch(e){return null;}}
async function accDelCloud(id){if(!ACC.db)return;const m=ACC.cloud[id];const base='data/users/'+ACC.uid;try{await ACC.db.doc(`${base}/chars/${id}`).delete();for(let i=0;i<((m&&m.parts)||1);i++)await ACC.db.doc(`${base}/parts/${id}_${i}`).delete();}catch(e){}delete ACC.cloud[id];}
// kết nối tài khoản claude.ai (nếu trang mở trên claude.ai)
(async function accInit(){try{if(!window.claude||!window.claude.use)return;const user=await window.claude.use('user');if(!user)return;const db=await window.claude.use('db');ACC.user=user;
    try{ACC.uid=await user.id();const me=await user.me();ACC.name=(me&&me.name)||'';}catch(e){}if(!db||!ACC.uid){accRefresh();return;}ACC.db=db;
    const tm=setTimeout(()=>{ACC.ready=true;accRefresh();},10000);const q=await db.collection('data/users/'+ACC.uid+'/chars').get();clearTimeout(tm);(q.docs||[]).forEach(d=>{ACC.cloud[d.id]=d.data();});
    ACC.ready=true;accRefresh();}catch(e){console.warn('tài khoản',e);ACC.ready=true;accRefresh();}})();
function accRefresh(){if(document.querySelector('.ov-card.acc'))uiStart({cont:true});}
function accChars(){const L=slotsLocal(),out={};for(const id in L)out[id]=Object.assign({id,where:'local'},L[id]);for(const id in ACC.cloud){const c=ACC.cloud[id];if(!out[id]||(c.ts||0)>(out[id].ts||0)+5000)out[id]=Object.assign({id,where:out[id]?'both':'cloud'},c);else out[id].where='both';}
  return Object.values(out).sort((a,b)=>(b.ts||0)-(a.ts||0));}
// màn hình đầu: tài khoản + danh sách nhân vật
{const _us=uiStart;uiStart=function(o){if(o&&o.form){_us(o);accFormPatch();return;}
  const chars=accChars();const who=ACC.db?`👤 <b>${esc(ACC.name||'Tài khoản Claude')}</b> · <span class="ok">☁️ Lưu trên máy chủ</span>`:ACC.user?'👤 Đã đăng nhập · lưu trên máy này':'📱 Chơi trên máy này (mở trên claude.ai để lưu theo tài khoản)';
  const card=c=>`<div class="chr"><span class="chr-a">${c.sex==='f'?'👩':'👨'}</span><div class="chr-b"><b>${esc(c.name)}</b><small>${c.sex==='f'?'Nữ':'Nam'} · Ngày ${c.day||1}${c.age?' · '+esc(c.age):''} · ${c.mode==='survival'?'Sinh tồn':'Thong thả'}${c.where==='cloud'?' · ☁️':''}</small></div><button class="btn sm" data-a="chplay" data-id="${c.id}">Chơi</button><button class="btn sm ghost" data-a="chdel" data-id="${c.id}" aria-label="Xóa">${G.delArm===c.id?'Xóa?':'🗑'}</button></div>`;
  uiOverlay(true,`<div class="ov-card start acc"><div class="logo">🔥</div><h1>Lửa Đá</h1><p class="sub">Từ hai bàn tay trắng</p><p class="small accw">${who}</p>
    <div class="chrs">${chars.length?chars.map(card).join(''):'<p class="muted small">Chưa có nhân vật nào. Tạo nhân vật đầu tiên nhé!</p>'}</div>
    ${chars.length<MAXCH?'<button class="btn big" data-a="chnew">＋ Tạo nhân vật mới</button>':'<p class="small muted">Tối đa 4 nhân vật. Xóa bớt để tạo thêm.</p>'}${ACC.user&&!ACC.ready?'<p class="small muted">Đang tải nhân vật trên máy chủ…</p>':''}</div>`);};}
// form tạo nhân vật: thêm chọn Nam / Nữ, ngoại hình lọc theo giới tính
function accFormPatch(){const f=document.querySelector('.ov-card.form');if(!f||f.querySelector('.sexs'))return;G.nsex=G.nsex||((LOOK2[G.nlook||0]||{}).sex)||'m';
  const lks=f.querySelector('.lks');const row=document.createElement('div');row.className='sexs';row.innerHTML=`<span class="small">Giới tính</span><button class="sx${G.nsex==='m'?' on':''}" data-a="sex" data-v="m">👨 Nam</button><button class="sx${G.nsex==='f'?' on':''}" data-a="sex" data-v="f">👩 Nữ</button>`;lks.parentNode.insertBefore(row,lks);accLooks();
  const h=document.createElement('p');h.className='small muted';h.textContent='Mỗi nhân vật có thế giới riêng.';f.querySelector('[data-a="start"]').before(h);}
function accLooks(){const L=document.querySelectorAll('.ov-card.form .lk');let first=null,okCur=false;L.forEach(b=>{const i=+b.dataset.i,sx=((LOOK2[i]||{}).sex)||'m',show=sx===G.nsex;b.hidden=!show;if(show&&first==null)first=i;if(show&&i===G.nlook)okCur=true;});
  if(!okCur&&first!=null){G.nlook=first;L.forEach(b=>b.classList.toggle('on',+b.dataset.i===G.nlook));}}
document.addEventListener('click',async e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="sex"],[data-a="chplay"],[data-a="chdel"],[data-a="chnew"]');if(!b)return;e.stopImmediatePropagation();sfx('pick');const a=b.dataset.a;
  if(a==='sex'){G.nsex=b.dataset.v;document.querySelectorAll('.sexs .sx').forEach(x=>x.classList.toggle('on',x.dataset.v===G.nsex));accLooks();return;}
  if(a==='chnew'){accLS(CURK,null);G.newChar=1;uiOpen('start',{cont:false,form:1});return;}
  if(a==='chdel'){const id=b.dataset.id;if(G.delArm!==id){G.delArm=id;uiStart({cont:true});return;}G.delArm=null;const sl=slotsLocal();delete sl[id];slotsWrite(sl);accLS(SKEY+'#'+id,null);if(curSlot()===id){accLS(CURK,null);accLS(SKEY,null);}await accDelCloud(id);uiStart({cont:true});return;}
  if(a==='chplay'){const id=b.dataset.id;let raw=accLS(SKEY+'#'+id);const L=slotsLocal()[id],C=ACC.cloud[id];if(C&&(!raw||!L||(C.ts||0)>(L.ts||0)+5000)){b.textContent='…';const r=await accPull(id);if(r){raw=r;accLS(SKEY+'#'+id,r);const sl=slotsLocal();sl[id]=Object.assign({},C);slotsWrite(sl);}}
    if(!raw){uiToast('Không tải được nhân vật này.','bad');return;}accLS(SKEY,raw);accLS(CURK,id);const o=loadSave();if(!o){uiToast('Bản lưu bị hỏng.','bad');return;}S=o;uiOverlay(false);startGame();}},true);
// tạo nhân vật mới: cấp ngăn lưu riêng
{const _ng=newGame;newGame=function(o){const r=_ng(o);if(G.newChar||!curSlot()){G.newChar=0;const id='c'+Date.now().toString(36);accLS(CURK,id);const sl=slotsLocal();sl[id]=slotMeta(S);slotsWrite(sl);}return r;};}
/* ---------- thoát ra màn hình nhân vật để chọn nhân vật khác (một mình / thế giới chung) ---------- */
{const _sh=settingsHtml;settingsHtml=function(){return `<div class="set"><b>Nhân vật</b><button class="btn sm" data-a="chswitch">👥 Đổi nhân vật</button></div>`+_sh();};}
function accSwitch(){try{save();}catch(e){}const id=curSlot();const go=()=>{try{sessionStorage.setItem('ldtt-menu','1');}catch(e){}location.reload();};
  if(ACC.db&&id){uiToast('Đang lưu lên máy chủ…','');Promise.resolve(accPush(id,true)).then(go,go);setTimeout(go,6000);}else go();}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="chswitch"]');if(!b)return;e.stopImmediatePropagation();sfx('pick');
  if(!G.swArm){G.swArm=1;b.textContent='Bấm lần nữa để thoát (đã tự lưu)';setTimeout(()=>{G.swArm=0;},4000);return;}G.swArm=0;accSwitch();},true);
