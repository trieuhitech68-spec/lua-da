/* ===================== ĐĂNG NHẬP / ĐĂNG KÝ (bản web) · CHỈ CÒN THẾ GIỚI CHUNG =====================
   - Bản web (backend.js, LDB.mode==='web'): màn hình đầu là Đăng nhập / Đăng ký / Quên mật khẩu. Đăng nhập xong mới vào danh sách nhân vật.
   - Không còn "Một mình": nhân vật mới luôn ở thế giới chung (cả trên claude.ai khi có máy chủ).
   - Máy chủ không tới được: báo rõ, nút Thử lại, và một liên kết nhỏ "Chơi ngoại tuyến".
   - Nhân vật cũ trên máy (chơi một mình): hỏi một lần có đưa lên tài khoản (thành nhân vật thế giới chung) không. */
const LDL={d:null,boot:null,st:'',msg:'',ok:'',busy:false,email:'',offline:false,mpFail:false,outArm:0,
  recovery:/type=recovery/.test(location.hash||''),hashErr:(/error_description=([^&]+)/.exec(location.hash||'')||[])[1]||''};
try{LDL.email=localStorage.getItem('ld-email')||'';}catch(e){}
function ldlShared(){if(LDB.mode==='web')return !!LDB.uid;if(LDB.mode==='claude')return typeof MP!=='undefined'&&!!(MP.db||MP.ok);return false;}
/* ---------- giao diện ---------- */
(function ldlCss(){const s=document.createElement('style');s.textContent=`
.ldl{position:fixed;inset:0;z-index:60;display:flex;align-items:flex-start;justify-content:center;padding:max(16px,env(safe-area-inset-top)) 16px 16px;overflow-y:auto;touch-action:pan-y;
  background:radial-gradient(circle at 50% 26%,rgba(96,52,20,.92),rgba(12,8,5,.98) 70%),#120c08;font:14px/1.45 var(--body);color:var(--fg)}
.ldl[hidden]{display:none}
.ldl-card{margin:auto;width:min(420px,100%);padding:22px 20px 18px;border-radius:22px;background:linear-gradient(180deg,#3a2818,#1e140c);border:2px solid var(--fr);box-shadow:0 22px 60px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,220,160,.12);display:flex;flex-direction:column;gap:10px;text-align:center}
.ldl-card .logo{font-size:56px;animation:ldlF 2.6s ease-in-out infinite}
@keyframes ldlF{0%,100%{transform:scale(1) rotate(-2deg)}50%{transform:scale(1.06) rotate(2deg)}}
.ldl-card h1{margin:0;font:400 40px var(--disp);color:var(--acc);text-shadow:0 3px 0 #6a3a14}
.ldl-tabs{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;border-radius:14px;background:rgba(0,0,0,.35);border:1px solid var(--line);margin-top:4px}
.ldl-tabs button{min-height:40px;border-radius:10px;border:0;background:none;color:var(--muted);font:800 14px var(--body)}
.ldl-tabs button.on{background:linear-gradient(180deg,#f0b860,#c9772c);color:#2a1608;box-shadow:0 2px 0 #6a3a14}
.ldl form{display:flex;flex-direction:column;gap:10px;margin:0}
.ldl .fld{gap:5px}.ldl .fld input{width:100%;box-sizing:border-box;-webkit-user-select:text;touch-action:manipulation}
.ldl .fld input:focus{outline:2px solid var(--acc);outline-offset:1px}
.ldl-pw{position:relative}.ldl-pw input{padding-right:46px}
.ldl-eye{position:absolute;right:4px;bottom:4px;width:38px;height:36px;border:0;border-radius:8px;background:none;font-size:17px;color:var(--muted)}
.ldl .btn.big{width:100%;margin-top:2px}
.ldl-msg{min-height:0;margin:0;padding:8px 10px;border-radius:10px;font-size:13px;text-align:left}
.ldl-msg.bad{background:rgba(255,100,70,.14);border:1px solid rgba(255,122,90,.5);color:#ffc0ac}
.ldl-msg.ok{background:rgba(120,220,110,.12);border:1px solid rgba(140,224,122,.45);color:#c8f5bd}
.ldl-msg:empty{display:none}
.ldl-link{background:none;border:0;color:var(--acc);font:600 13px var(--body);text-decoration:underline;text-underline-offset:3px;padding:6px;cursor:pointer}
.ldl-off{color:var(--muted);font-size:12px;opacity:.8}
.ldl-or{display:flex;align-items:center;gap:8px;color:var(--muted);font-size:12px}.ldl-or:before,.ldl-or:after{content:'';flex:1;height:1px;background:var(--line)}
.ldl-g{background:#fff!important;color:#222!important;border-color:#ddd!important;box-shadow:0 3px 0 #999!important}
.ldl-foot{font-size:12px;color:var(--muted);margin:2px 0 0}
.ldl-spin{width:34px;height:34px;margin:8px auto;border-radius:50%;border:4px solid rgba(242,197,90,.25);border-top-color:var(--acc);animation:ldlS .9s linear infinite}
@keyframes ldlS{to{transform:rotate(360deg)}}
.ldl-up{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border-radius:12px;background:rgba(242,197,90,.1);border:1px solid var(--fr);text-align:left}
.ldl-up .row{display:flex;gap:8px;flex-wrap:wrap}
.ldl-acc{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap}
.ldl-warn{padding:8px 10px;border-radius:10px;background:rgba(255,100,70,.14);border:1px solid rgba(255,122,90,.5);font-size:12.5px;text-align:left}
`;document.head.appendChild(s);})();
function ldlEl(){let el=document.getElementById('ldl');if(!el){el=document.createElement('div');el.id='ldl';el.className='ldl';el.setAttribute('role','dialog');el.setAttribute('aria-label','Đăng nhập');document.body.appendChild(el);}return el;}
function ldlHide(){const el=document.getElementById('ldl');if(el){el.hidden=true;el.innerHTML='';}}
const ldlOffLink='<button type="button" class="ldl-link ldl-off" data-ldl="off">Chơi ngoại tuyến (chỉ lưu trên máy này)</button>';
function ldlShow(st,extra){LDL.st=st;const el=ldlEl();el.hidden=false;const c=LDB.cfg||{};let b='';
  const msg=`<p class="ldl-msg ${LDL.ok?'ok':'bad'}" aria-live="polite">${esc(LDL.ok||LDL.msg||'')}</p>`;
  if(st==='load')b=`<div class="ldl-spin"></div><p class="muted">${esc(extra||'Đang kết nối máy chủ…')}</p>`;
  else if(st==='cfg')b=`<p class="ldl-msg bad">⚙️ Máy chủ chưa được cấu hình.</p><p class="small muted">Trò chơi chưa được nối với máy chủ tài khoản nên chưa đăng nhập / chơi chung được. Hãy quay lại sau ít phút.</p>${ldlOffLink}`;
  else if(st==='down')b=`<p class="ldl-msg bad">📡 Không kết nối được máy chủ.</p><p class="small muted">Kiểm tra mạng (Wi-Fi / 4G) rồi bấm Thử lại.</p><button class="btn big" data-ldl="retry">↻ Thử lại</button>${ldlOffLink}`;
  else if(st==='in'||st==='up'){const up=st==='up';
    b=`<div class="ldl-tabs" role="tablist"><button type="button" role="tab" class="${up?'':'on'}" data-ldl="tin">Đăng nhập</button><button type="button" role="tab" class="${up?'on':''}" data-ldl="tup">Đăng ký</button></div>
    <form data-ldl-form="${st}" novalidate>
      ${up?`<label class="fld">Tên trong game<input id="ldlName" maxlength="24" autocomplete="nickname" placeholder="vd. Lửa Rừng" value="${esc(LDL.name||'')}"></label>`:''}
      <label class="fld">Email<input id="ldlEmail" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" placeholder="ban@vidu.com" value="${esc(LDL.email||'')}"></label>
      <label class="fld ldl-pw">Mật khẩu<input id="ldlPw" type="password" autocomplete="${up?'new-password':'current-password'}" minlength="6" placeholder="${up?'Ít nhất 6 ký tự':'Mật khẩu'}"><button type="button" class="ldl-eye" data-ldl="eye" aria-label="Hiện mật khẩu">👁</button></label>
      ${msg}
      <button class="btn big" type="submit" ${LDL.busy?'disabled':''}>${LDL.busy?'Đang xử lý…':up?'Tạo tài khoản':'Vào game'}</button>
    </form>
    ${up?'':'<button type="button" class="ldl-link" data-ldl="forgot">Quên mật khẩu?</button>'}
    ${c.google?'<div class="ldl-or">hoặc</div><button type="button" class="btn ldl-g" data-ldl="google"><b style="color:#4285f4">G</b> Tiếp tục với Google</button>':''}
    ${LDL.net?ldlOffLink:''}
    <p class="ldl-foot">${up?'Một tài khoản giữ tới 4 nhân vật, lưu trên máy chủ, chơi chung một thế giới với mọi người.':'Chưa có tài khoản? Bấm <b>Đăng ký</b> — chỉ cần email.'}</p>`;}
  else if(st==='forgot')b=`<form data-ldl-form="forgot" novalidate><p class="small">Nhập email đã đăng ký. Chúng tôi sẽ gửi thư có liên kết đặt lại mật khẩu.</p>
      <label class="fld">Email<input id="ldlEmail" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" value="${esc(LDL.email||'')}"></label>${msg}
      <button class="btn big" type="submit" ${LDL.busy?'disabled':''}>${LDL.busy?'Đang gửi…':'Gửi thư đặt lại'}</button></form><button type="button" class="ldl-link" data-ldl="tin">← Quay lại đăng nhập</button>`;
  else if(st==='confirm')b=`<p class="ldl-msg ok">📧 Đã gửi thư xác nhận tới <b>${esc(LDL.email)}</b>.</p><p class="small">Mở thư (xem cả mục Spam / Quảng cáo), bấm liên kết xác nhận — trò chơi sẽ tự mở và đăng nhập. Hoặc xác nhận xong quay lại đây đăng nhập.</p><button class="btn big" data-ldl="tin">Đã xác nhận, đăng nhập</button>`;
  else if(st==='newpw')b=`<form data-ldl-form="newpw" novalidate><p class="small">Đặt mật khẩu mới cho tài khoản <b>${esc(LDL.email||'')}</b>.</p>
      <label class="fld ldl-pw">Mật khẩu mới<input id="ldlPw" type="password" autocomplete="new-password" minlength="6" placeholder="Ít nhất 6 ký tự"><button type="button" class="ldl-eye" data-ldl="eye" aria-label="Hiện mật khẩu">👁</button></label>${msg}
      <button class="btn big" type="submit" ${LDL.busy?'disabled':''}>${LDL.busy?'Đang lưu…':'Lưu và vào game'}</button></form>`;
  el.innerHTML=`<div class="ldl-card"><div class="logo">🔥</div><h1>Lửa Đá</h1><p class="sub">Từ hai bàn tay trắng</p>${b}</div>`;}
function ldlSet(m,ok){LDL.msg=ok?'':m;LDL.ok=ok?m:'';const p=document.querySelector('#ldl .ldl-msg[aria-live]');if(p){p.className='ldl-msg '+(ok?'ok':'bad');p.textContent=m;}else ldlShow(LDL.st);}
function ldlKeep(){const g=id=>{const e=document.getElementById(id);return e?e.value:null;};const em=g('ldlEmail'),nm=g('ldlName');if(em!=null)LDL.email=em.trim();if(nm!=null)LDL.name=nm;}
/* ---------- luồng ---------- */
async function ldlRun(){LDL.msg=LDL.ok='';LDL.net=false;ldlShow('load');if(!LDB.configured){ldlShow('cfg');return;}
  let s;try{s=await LDB.session();}catch(e){ldlShow(e&&e.code==='config'?'cfg':'down');return;}
  try{LDB.sb.auth.onAuthStateChange((ev,ss)=>{if(ev==='PASSWORD_RECOVERY'){LDL.recovery=true;LDL.email=ss&&ss.user&&ss.user.email||LDL.email;if(LDL.st&&LDL.st!=='newpw'&&!LDB.uid)ldlShow('newpw');}});}catch(e){}
  if(s&&LDL.recovery){LDL.email=s.user&&s.user.email||'';ldlShow('newpw');return;}
  if(s){await ldlEnter(s);return;}
  if(LDL.hashErr){LDL.msg=/expired|invalid/i.test(decodeURIComponent(LDL.hashErr))?'Liên kết trong thư đã hết hạn hoặc đã dùng. Hãy gửi lại.':'Đăng nhập không thành công: '+decodeURIComponent(LDL.hashErr).replace(/\+/g,' ').slice(0,120);LDL.hashErr='';try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}}
  ldlShow(LDL.email?'in':'up');}
async function ldlEnter(s){ldlShow('load','Đang vào game…');try{await LDB.enter(s);}catch(e){console.warn('vào game',e);LDL.msg='Có lỗi khi vào game. Thử lại nhé.';ldlShow('in');return;}
  ldlHide();setTimeout(()=>{if(!MP.ok){LDL.mpFail=true;ldlRefresh();}},25000);LDL.boot(LDL.d||{});}
function ldlOffline(){LDL.offline=true;LDB.offline();ldlHide();LDL.boot(LDL.d||{});}
async function ldlSubmit(kind){ldlKeep();if(LDL.busy)return;const pwEl=document.getElementById('ldlPw'),pw=pwEl?pwEl.value:'',em=LDL.email;
  const emailOk=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em);LDL.net=false;
  if(kind!=='newpw'&&!emailOk)return ldlSet('Email chưa đúng dạng (vd. ban@vidu.com).');
  if(kind!=='forgot'&&pw.length<6)return ldlSet('Mật khẩu cần ít nhất 6 ký tự.');
  let name='';if(kind==='up'){name=ldbCleanName(LDL.name);if(name.length<2)return ldlSet('Tên trong game cần 2–24 ký tự (không dùng < > " / \\ @).');}
  try{localStorage.setItem('ld-email',em);}catch(e){}
  LDL.busy=true;LDL.msg=LDL.ok='';ldlShow(LDL.st==='newpw'?'newpw':kind==='forgot'?'forgot':kind);
  try{if(kind==='up'){const free=await LDB.nameFree(name);if(free===false)throw {msg:`Tên "${name}" đã có người dùng. Chọn tên khác nhé.`};
      const s=await LDB.signUp(em,pw,name);LDL.busy=false;if(s){await ldlEnter(s);return;}ldlShow('confirm');return;}
    if(kind==='in'){const s=await LDB.signIn(em,pw);LDL.busy=false;await ldlEnter(s);return;}
    if(kind==='forgot'){await LDB.reset(em);LDL.busy=false;LDL.ok='📧 Đã gửi thư đặt lại mật khẩu tới '+em+'. Mở thư (xem cả mục Spam) và bấm liên kết.';ldlShow('forgot');return;}
    if(kind==='newpw'){await LDB.newPassword(pw);LDL.busy=false;LDL.recovery=false;try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}const s=await LDB.session();if(s){await ldlEnter(s);return;}ldlShow('in');return;}}
  catch(e){LDL.busy=false;const m=e&&e.msg||ldbAuthMsg(e);LDL.net=/kết nối/.test(m);LDL.msg=m;ldlShow(LDL.st);}}
document.addEventListener('submit',e=>{const f=e.target&&e.target.closest&&e.target.closest('[data-ldl-form]');if(!f)return;e.preventDefault();ldlSubmit(f.dataset.ldlForm);},true);
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-ldl]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const a=b.dataset.ldl;ldlKeep();
  if(a==='tin'||a==='tup'){LDL.msg=LDL.ok='';ldlShow(a==='tin'?'in':'up');const i=document.getElementById(a==='tup'?'ldlName':'ldlEmail');if(i&&!i.value)try{i.focus();}catch(er){}return;}
  if(a==='forgot'){LDL.msg=LDL.ok='';ldlShow('forgot');return;}
  if(a==='eye'){const i=b.parentNode.querySelector('input');if(i){i.type=i.type==='password'?'text':'password';b.textContent=i.type==='password'?'👁':'🙈';}return;}
  if(a==='retry'){ldlRun();return;}
  if(a==='off'){ldlOffline();return;}
  if(a==='google'){LDB.google().catch(er=>{LDL.msg=er&&er.msg||'Không mở được đăng nhập Google.';ldlShow(LDL.st);});return;}},true);
/* ---------- gắn vào game: chạy lúc boot (sau khi mọi tệp đã nạp, để bọc ngoài cùng) ---------- */
{const _bt=boot;boot=function(d){try{ldlLate();}catch(e){console.warn('đăng nhập: gắn',e);}LDL.d=d;LDL.boot=_bt;if(LDB.mode!=='web'){if(LDB.mode==='claude')setTimeout(()=>{if(typeof MP!=='undefined'&&MP.db&&!MP.ok){LDL.mpFail=true;ldlRefresh();}},25000);return _bt(d);}ldlRun();};}
// nhân vật tạo / tải khi đã đăng nhập: ghi tài khoản sở hữu vào ngăn lưu trên máy
{const _sm=slotMeta;slotMeta=function(s){const m=_sm(s);if(LDB.uid)m.uid=LDB.uid;return m;};}
{const _sh=settingsHtml;settingsHtml=function(){const h=_sh();if(LDB.mode!=='web'||!LDB.uid)return h;
  return `<div class="set"><b>Tài khoản</b><span class="small">👤 ${esc(LDB.name)}${LDB.email?' · '+esc(LDB.email):''}</span><button class="btn sm ghost" data-a="ldout">Đăng xuất</button></div>`+h;};}
function ldlLate(){if(LDL.late)return;LDL.late=1;
  {const _ac=accChars;accChars=function(){const L=_ac(),sl=slotsLocal();if(LDB.mode!=='web')return L;
    if(LDB.uid)return L.filter(c=>c.where!=='local'||(sl[c.id]&&sl[c.id].uid===LDB.uid));
    let last='';try{last=localStorage.getItem('ld-last-uid')||'';}catch(e){}return L.filter(c=>{const m=sl[c.id];return !m||!m.uid||m.uid===last;});};}
  {const _us=uiStart;uiStart=function(o){_us(o);try{ldlStartPatch(o||{});}catch(e){console.warn('đăng nhập: màn đầu',e);}};}
  if(typeof crOpen==='function'){const _co=crOpen;crOpen=function(m){const r=_co.apply(this,arguments);try{if(m==='new')ldlForm();}catch(e){}return r;};}
  if(typeof mpFormRefresh==='function'){const _mf=mpFormRefresh;mpFormRefresh=function(){_mf();try{if(ldlShared())ldlForm();}catch(e){}};}
  if(typeof mpPanelHtml==='function'){const _ph=mpPanelHtml;mpPanelHtml=function(){const h=_ph();return LDB.mode==='web'?h.replace('Mở trò chơi trên claude.ai (đã đăng nhập) để gặp người khác. Bạn vẫn chơi được bình thường.','Kiểm tra mạng rồi tải lại trang để gặp người khác. Bạn vẫn chơi được bình thường.'):h;};}}
function ldlRefresh(){if(document.querySelector('.ov-card.acc'))uiStart({cont:true});else ldlForm();}
// form tạo nhân vật: chỉ còn "Thế giới chung"
function ldlForm(){if(!ldlShared())return;const cr=document.querySelector('.ov-card.cr');if(cr&&typeof CRE!=='undefined'&&CRE.mode==='new'){G.nworld='mp';ldlCrState(cr);return;}
  const f=document.querySelector('.ov-card.form');if(!f)return;G.nworld='mp';let row=f.querySelector('.mpw');
  if(!row){row=document.createElement('div');row.className='mds mpw';row.innerHTML='<button class="md on" data-a="mpw" data-v="mp"><b>🌐 Thế giới chung</b><small class="mpw-s"></small></button>';
    const mds=f.querySelector('.mds');if(mds)mds.parentNode.insertBefore(row,mds);else f.querySelector('[data-a="start"]').before(row);}
  row.querySelectorAll('[data-v="solo"]').forEach(b=>b.remove());row.querySelectorAll('[data-a="mpw"]').forEach(b=>b.classList.add('on'));
  const s=row.querySelector('.mpw-s'),bt=f.querySelector('[data-a="start"]');
  if(s)s.textContent=MP.ok?'Mọi người cùng một vùng đất: gặp nhau, lập bộ tộc, cắm đất, cùng xây làng.':LDL.mpFail?'⚠️ Chưa kết nối được thế giới chung.':'Đang kết nối thế giới chung…';
  if(bt){bt.disabled=!MP.ok;bt.textContent=MP.ok?'Bắt đầu':LDL.mpFail?'Chưa kết nối được':'Đang kết nối…';}
  let rt=f.querySelector('.ldl-rt');if(LDL.mpFail&&!MP.ok){if(!rt){rt=document.createElement('button');rt.className='btn ghost ldl-rt';rt.dataset.a='ldretry';rt.textContent='↻ Tải lại trang để thử lại';bt&&bt.after(rt);}}else if(rt)rt.remove();
  const h=[...f.querySelectorAll('p.small.muted')].find(p=>/thế giới/i.test(p.textContent));if(h)h.textContent='Thế giới chung: mọi người cùng một vùng đất, đồ đạc và kỹ năng vẫn là của riêng bạn.';}
// trình tạo nhân vật (creator.js): nút Bắt đầu chờ thế giới chung
function ldlCrState(cr){const bt=cr.querySelector('[data-a="start"]');if(!bt)return;bt.disabled=!MP.ok;bt.textContent=MP.ok?'🌐 Bắt đầu':LDL.mpFail?'⚠️ Chưa kết nối được':'Đang kết nối…';
  bt.title=MP.ok?'Vào thế giới chung':'Đang kết nối thế giới chung';if(LDL.mpFail&&!MP.ok&&!cr.querySelector('.ldl-rt')){const r=document.createElement('button');r.className='btn sm ghost ldl-rt';r.dataset.a='ldretry';r.textContent='↻ Thử lại';bt.after(r);}}
function ldlStartPatch(o){if(document.querySelector('.ov-card.form')||document.querySelector('.ov-card.cr')){ldlForm();return;}const card=document.querySelector('.ov-card.acc');if(!card||LDB.mode!=='web')return;
  const w=card.querySelector('.accw');
  if(LDL.offline){if(w)w.innerHTML='📴 <b>Chơi ngoại tuyến</b> · chỉ lưu trên máy này';if(!card.querySelector('.ldl-acc')){const d=document.createElement('div');d.className='ldl-acc';d.innerHTML='<button class="btn sm ghost" data-a="ldretry">🔑 Đăng nhập lại</button>';card.appendChild(d);}return;}
  if(!LDB.uid)return;
  if(!card.querySelector('.ldl-acc')){const d=document.createElement('div');d.className='ldl-acc';d.innerHTML=`<button class="btn sm ghost" data-a="ldout">${LDL.outArm?'Bấm lần nữa để đăng xuất':'Đăng xuất'}</button>`;card.appendChild(d);}
  if(LDL.mpFail&&!MP.ok&&!card.querySelector('.ldl-warn')){const d=document.createElement('div');d.className='ldl-warn';d.innerHTML='⚠️ Chưa kết nối được thế giới chung (mạng chập chờn hoặc máy chủ bận). <button class="btn sm" data-a="ldretry">↻ Thử lại</button>';card.querySelector('.chrs').before(d);}
  const leg=ldlLegacy();let flag='';try{flag=localStorage.getItem('ld-upl-'+LDB.uid)||'';}catch(e){}
  if(leg.length&&!flag&&ACC.ready&&!card.querySelector('.ldl-up')){const d=document.createElement('div');d.className='ldl-up';
    d.innerHTML=`<b>📦 Nhân vật cũ trên máy này</b><small></small><div class="row"><button class="btn sm" data-a="ldup">Đưa lên tài khoản</button><button class="btn sm ghost" data-a="ldupno">Không, cảm ơn</button></div>`;
    d.querySelector('small').textContent=`Có ${leg.length} nhân vật chơi một mình (${leg.map(([,m])=>m.name).join(', ')}). Đưa lên tài khoản để chơi ở thế giới chung: giữ túi đồ, kỹ năng, công thức, thời đại; nhà cửa và đồ trong rương ở lại thế giới cũ (bản cũ vẫn giữ trên máy, chơi được khi ngoại tuyến).`;
    card.querySelector('.chrs').before(d);}}
function ldlLegacy(){const sl=slotsLocal();return Object.entries(sl).filter(([id,m])=>m&&!m.uid&&!m.ldUp&&accLS(SKEY+'#'+id));}
// đổi một bản lưu "một mình" thành nhân vật thế giới chung (giữ đồ đạc, kỹ năng; bỏ những gì gắn với bản đồ cũ)
function ldlConvert(raw){const s=JSON.parse(raw);if(!s||s.v!==1)return null;Object.assign(s,{seed:MP.seed,mp:1,mpGot:[],wv:(((MP.worlds||[]).find(w=>w.seed===MP.seed)||{}).wv>=4?4:3),builds:[],store:{},crops:{},fuel:{},res:{},disc:{},fogm:null,mark:null});
  s.p=Object.assign({},s.p||{},{x:1e7,z:1e7});return s;}// vị trí ngoài thế giới → game tự đưa về Trảng Khởi Đầu
async function ldlUpload(){if(!ACC.db||!MP.ok||!MP.seed){uiToast('Chưa kết nối được máy chủ, thử lại sau nhé.','bad');return;}
  const leg=ldlLegacy(),room=MAXCH-accChars().length;if(room<=0){uiToast('Tài khoản đã đủ 4 nhân vật. Xóa bớt để đưa thêm.','bad');return;}
  let n=0;uiToast('Đang đưa nhân vật lên tài khoản…','');
  for(const [oid,m] of leg.slice(0,room)){try{const s=ldlConvert(accLS(SKEY+'#'+oid));if(!s)continue;const id='c'+Date.now().toString(36)+n;const raw=JSON.stringify(s);
      accLS(SKEY+'#'+id,raw);const sl=slotsLocal();sl[id]=Object.assign(slotMeta(s),{uid:LDB.uid,mp:1});sl[oid]=Object.assign({},sl[oid],{ldUp:LDB.uid});slotsWrite(sl);
      for(let k=0;k<20&&ACC.busy;k++)await new Promise(r=>setTimeout(r,300));await accPush(id,true);n++;}catch(e){console.warn('đưa nhân vật lên',e);}}
  try{localStorage.setItem('ld-upl-'+LDB.uid,'done');}catch(e){}uiToast(n?`☁️ Đã đưa ${n} nhân vật lên tài khoản (thế giới chung).`:'Không đưa được nhân vật nào.',n?'good':'bad');uiStart({cont:true});}
async function ldlLogout(){uiToast('Đang lưu và đăng xuất…','');try{save();}catch(e){}const id=curSlot();
  try{if(ACC.db&&id)await Promise.race([accPush(id,true),new Promise(r=>setTimeout(r,6000))]);}catch(e){}
  LDB.leaving=true;await LDB.signOut();accLS(SKEY,null);accLS(CURK,null);try{sessionStorage.removeItem('ldtt-auto');localStorage.removeItem('ld-last-uid');}catch(e){}location.reload();}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="ldout"],[data-a="ldup"],[data-a="ldupno"],[data-a="ldretry"],.ov-card.form [data-a="start"],.ov-card.cr [data-a="start"],.ov-card.form [data-a="mpw"]');if(!b)return;const a=b.dataset.a;
  if(a==='start'||a==='mpw'){if(!ldlShared()||(b.closest('.ov-card.cr')&&!(typeof CRE!=='undefined'&&CRE.mode==='new')))return;G.nworld='mp';if(a==='mpw'){e.stopImmediatePropagation();ldlForm();return;}if(!MP.ok){e.stopImmediatePropagation();uiToast('Đang kết nối thế giới chung, chờ một chút nhé…','');}return;}
  e.stopImmediatePropagation();try{sfx('pick');}catch(er){}
  if(a==='ldout'){if(!LDL.outArm){LDL.outArm=1;b.textContent='Bấm lần nữa để đăng xuất';setTimeout(()=>{LDL.outArm=0;},4000);return;}LDL.outArm=0;ldlLogout();return;}
  if(a==='ldup'){b.disabled=true;ldlUpload();return;}
  if(a==='ldupno'){try{localStorage.setItem('ld-upl-'+LDB.uid,'no');}catch(er){}uiStart({cont:true});return;}
  if(a==='ldretry'){try{save();}catch(er){}location.reload();}},true);
