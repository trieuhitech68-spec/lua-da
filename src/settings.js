/* ===================== CÀI ĐẶT ĐẦY ĐỦ · MENU TẠM DỪNG =====================
   Bảng "⚙️ Cài đặt" chia thẻ: Tài khoản · Đồ họa · Âm thanh · Điều khiển · Giao diện · Chơi chung · Dữ liệu · Thông tin.
   - Lưu một khóa 'ldtt-set' (JSON). Các khóa cũ vẫn dùng như trước: 'ldtt-qu'/'ldtt-qauto'/'ldtt-fps' (perf.js), 'ldtt-fs' (more.js), 'ldtt-hudmin'.
   - Gọi vào mô-đun khác khi có (perf.js, login.js/backend.js, account.js, creator.js, more.js, guide.js, codex.js, mp.js); thiếu thì ẩn mục đó.
   - Móc nhỏ trong ui.js (inputInit): G.lookS (độ nhạy), G.lookInv (đảo trục dọc), G.lefty (cần điều khiển bên phải). */
const SET_VER='1.8',SET_BUILD='2026-11-06',SET_MAIL='lienhe@lanhdia.app';// SET_MAIL: địa chỉ góp ý (chỗ giữ chỗ — thay bằng địa chỉ thật)
const SETK='ldtt-set';
const SETD={tab:'acc',res:1,dynRes:true,view:1,shadow:'auto',grass:1,post:'auto',fpsCap:(Math.min(innerWidth,innerHeight)<700||/Android|iPhone|iPad/i.test(navigator.userAgent))?30:60,
  vMaster:1,vMusic:1,vFx:1,vAmb:1,bgMute:true,
  sens:1,invY:false,joyS:1,joyO:1,lefty:false,btnS:1,autoRun:true,vib:true,tapMove:true,dbl:'none',
  hudO:1,mini:1,hints:true,dmg:true,lang:'vi',
  names:true,chat:true,chatFilter:true,blocked:{}};
const SETR={res:[0.5,1],view:[0.6,1.4],grass:[0,1.5],vMaster:[0,1],vMusic:[0,1],vFx:[0,1],vAmb:[0,1],sens:[0.3,2.5],joyS:[0.7,1.5],joyO:[0.25,1],btnS:[0.7,1.4],hudO:[0.3,1],mini:[0,1.3]};
const SETCH={shadow:['auto','on','off'],post:['auto','on','off'],fpsCap:[0,30,60],dbl:['none','jump','run','view'],lang:['vi','en'],tab:['acc','gfx','snd','ctl','ui','mp','data','info']};
let SET=JSON.parse(JSON.stringify(SETD));
const SP={arm:{},msg:'',busy:false,bip:null,lastTap:0,frameT:0,vibT:0};
function spLS(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){return null;}}
function setValid(k,v){const d=SETD[k];if(d===undefined)return false;if(k==='blocked')return v&&typeof v==='object'&&!Array.isArray(v);if(typeof v!==typeof d)return false;
  if(typeof d==='number'&&!isFinite(v))return false;if(SETR[k]&&(v<SETR[k][0]||v>SETR[k][1]))return false;if(SETCH[k]&&!SETCH[k].includes(v))return false;return true;}
function setLoad(){let o=null;try{o=JSON.parse(spLS(SETK)||'null');}catch(e){o=null;}if(!o||typeof o!=='object')return;for(const k in SETD)if(k in o&&setValid(k,o[k]))SET[k]=k==='blocked'?Object.assign({},o[k]):o[k];
  for(const u in SET.blocked)if(!/^[A-Za-z0-9_\-.:@+~]{1,128}$/.test(u)||typeof SET.blocked[u]!=='string')delete SET.blocked[u];}
function setSave(){spLS(SETK,JSON.stringify(SET));}
function spMP(){try{return typeof MP!=='undefined'?MP:null;}catch(e){return null;}}// mp.js nạp sau tệp này
function spWeb(){return typeof LDB!=='undefined'&&LDB.mode==='web';}
function spClaude(){return typeof LDB!=='undefined'?LDB.mode==='claude':!!(window.claude&&window.claude.use);}
function spPerf(){return typeof PERF!=='undefined'&&typeof perfSetLv==='function';}
/* ---------- áp cài đặt ---------- */
function setApplyCss(){const r=document.documentElement.style;r.setProperty('--sp-joy',SET.joyS);r.setProperty('--sp-joyo',SET.joyO);r.setProperty('--sp-btn',SET.btnS);r.setProperty('--sp-hud',SET.hudO);r.setProperty('--sp-mini',Math.max(0.5,SET.mini));
  const b=document.body;if(!b)return;b.classList.toggle('sp-lh',!!SET.lefty);b.classList.toggle('sp-nomini',SET.mini<0.5);}
function setApplyCtl(){G.lookS=SET.sens;G.lookInv=!!SET.invY;G.lefty=!!SET.lefty;}
function setApplyAudio(){if(!AU.ctx||!AU.out)return;const t=AU.ctx.currentTime,s=(g,v)=>{try{g.gain.setTargetAtTime(v,t,0.03);}catch(e){g.gain.value=v;}};
  s(AU.out,0.5*SET.vMaster);s(AU.busFx,SET.vFx);s(AU.busAmb,SET.vAmb);s(AU.busMus,SET.vMusic);}
function setApplyGfx(){if(G.R&&G.sc&&G.cam){try{applyQ();}catch(e){console.warn('cài đặt đồ họa',e);}try{G._rsK=null;resize();}catch(e){}}}
function setApplyAll(){setApplyCss();setApplyCtl();setApplyAudio();}
setLoad();setApplyAll();
/* ---------- đồ họa: chồng lên applyQ / resize / grassInit (sau perf.js) ---------- */
{const _aq=applyQ;applyQ=function(){_aq.apply(this,arguments);try{const v=SET.view;if(v!==1){G.fogF=Math.round(G.fogF*v);G.fogN=Math.round(G.fogN*v);G.treeD=Math.round((G.treeD||G.fogF)*v);
      if(typeof perfFar==='function')perfFar();else if(G.cam)G.cam.far=G.fogF+300;if(G.cam)G.cam.updateProjectionMatrix();}
    const sun=G.L&&G.L.sun;if(sun){if(SET.shadow==='off')sun.castShadow=false;else if(SET.shadow==='on')sun.castShadow=true;}G.cullT=-9;}catch(e){console.warn('cài đặt',e);}};}
{const _rs=resize;resize=function(){const k=G.prK;G.prK=(k||1)*SET.res;try{return _rs.apply(this,arguments);}finally{G.prK=k;}};}
{const _gi=grassInit;grassInit=function(){const g=SET.grass,P2=typeof PQ!=='undefined'&&PQ.grassN?PQ.grassN:null,keep=P2&&P2.slice();
  if(P2&&g>0)for(let i=0;i<P2.length;i++)P2[i]=Math.max(1,Math.round(P2[i]*g));
  try{_gi.apply(this,arguments);}finally{if(keep)for(let i=0;i<keep.length;i++)P2[i]=keep[i];}
  if(G.grass){if(g<=0)G.grass.visible=false;else if(!P2&&g<1&&G.grass.count!=null)G.grass.count=Math.max(1,Math.floor(G.grass.count*g));}};}
if(typeof perfTick==='function'){const _pt=perfTick;perfTick=function(dt){_pt(dt);if(!SET.dynRes&&G.prK&&G.prK!==1){G.prK=1;resize();}};}
// giới hạn khung hình + hậu kỳ (bọc K3.fx.render khi nó có)
{const _lp=loop;loop=function(now){if(SET.fpsCap&&G.on&&SP.frameT&&now-SP.frameT<1000/SET.fpsCap-2.5){requestAnimationFrame(loop);return;}SP.frameT=now;
  if(typeof K3!=='undefined'&&K3.fx&&!K3.fx._spw){try{const f=K3.fx,_r=f.render;f.render=function(R,sc,cam,o){if(o&&SET.post!=='auto')o.post=SET.post==='on';return _r.call(this,R,sc,cam,o);};f._spw=1;}catch(e){K3.fx._spw=1;}}
  return _lp(now);};}
// FPS khi không có perf.js
function spFps(on){if(spPerf()){PERF.fpsOn=on;spLS('ldtt-fps',on?'1':'0');try{perfFpsShow();}catch(e){}return;}spLS('ldtt-fps',on?'1':'0');SP.fpsOn=on;let e=$('#spfps');
  if(!on){if(e)e.hidden=true;return;}if(!e){e=document.createElement('div');e.id='spfps';e.className='sp-fps';document.body.appendChild(e);}e.hidden=false;}
function spFpsOn(){return spPerf()?!!PERF.fpsOn:spLS('ldtt-fps')==='1';}
/* ---------- âm thanh: tách 3 kênh (hiệu ứng · môi trường · nhạc) dưới kênh tổng ---------- */
const SP_AMB=new Set(['chirp','cricket','croak','buzz','whine','thunder']);
function spBus(b,fn,self,args){if(!AU.out||!b)return fn.apply(self,args);const m=AU.master;AU.master=b;try{return fn.apply(self,args);}finally{AU.master=m;}}
{const _ai=auInit;auInit=function(){_ai.apply(this,arguments);if(!AU.ctx||AU.out)return;try{const c=AU.ctx,out=AU.master;AU.out=out;const mk=()=>{const g=c.createGain();g.connect(out);return g;};
    AU.busFx=mk();AU.busAmb=mk();AU.busMus=mk();AU.master=AU.busFx;setApplyAudio();if(document.hidden&&SET.bgMute)c.suspend().catch(()=>{});}catch(e){console.warn('âm thanh',e);}};}
{const _sf=sfx;sfx=function(k){if(SET.vib&&(k==='hurt'||k==='hit')&&navigator.vibrate&&G.on){const n=performance.now();if(n-SP.vibT>120){SP.vibT=n;try{navigator.vibrate(k==='hurt'?70:25);}catch(e){}}}
  return SP_AMB.has(k)?spBus(AU.busAmb,_sf,this,arguments):_sf.apply(this,arguments);};}
{const _ar=ambRain;ambRain=function(){return spBus(AU.busAmb,_ar,this,arguments);};}
if(typeof fallsTick==='function'){const _ft=fallsTick;fallsTick=function(){return spBus(AU.busAmb,_ft,this,arguments);};}
if(typeof mxAmb==='function'){const _ma=mxAmb;mxAmb=function(){return spBus(AU.busAmb,_ma,this,arguments);};}
if(typeof mxNotePlay==='function'){const _mn=mxNotePlay;mxNotePlay=function(){return spBus(AU.busMus,_mn,this,arguments);};}
if(typeof flutePlay==='function'){const _fp=flutePlay;flutePlay=function(){return spBus(AU.busMus,_fp,this,arguments);};}
document.addEventListener('visibilitychange',()=>{if(!AU.ctx)return;try{if(document.hidden){if(SET.bgMute)AU.ctx.suspend();}else if(AU.on)AU.ctx.resume();}catch(e){}});
/* ---------- điều khiển ---------- */
{const _mt=moveTick;moveTick=function(dt){if(!SET.autoRun)G.runAuto=false;return _mt.apply(this,arguments);};}
{const _wt=worldTap;worldTap=function(){const r=_wt.apply(this,arguments);if(!SET.tapMove&&G.walkTo&&!G.walkTo.t)G.walkTo=null;return r;};}
// chạm hai lần (ngoài vùng cần điều khiển)
addEventListener('touchend',e=>{if(SET.dbl==='none'||!G.on||G.paused||G.panel||e.touches.length)return;const t=e.changedTouches[0];if(!t||!e.target||e.target.id!=='gl')return;
  const inJoy=(SET.lefty?t.clientX>innerWidth*0.58:t.clientX<innerWidth*0.42)&&t.clientY>innerHeight*0.35;if(inJoy)return;const n=performance.now(),L=SP.lastTap;
  if(L&&n-L.t<300&&Math.hypot(t.clientX-L.x,t.clientY-L.y)<40){SP.lastTap=0;if(SET.dbl==='jump')G.jumpReq=1;else if(SET.dbl==='run'){G.runBtn=!G.runBtn;const b=$('#runBtn');if(b)b.classList.toggle('on',G.runBtn);}else if(SET.dbl==='view')viewToggle();}
  else SP.lastTap={t:n,x:t.clientX,y:t.clientY};},{capture:true,passive:true});
/* ---------- số sát thương ---------- */
function spDmgWrap(name){const f=window[name];if(typeof f!=='function'||f._spd)return;const w=function(a,dmg){const h0=a&&a.hp;const r=f.apply(this,arguments);
    try{if(SET.dmg&&a&&typeof h0==='number'&&typeof a.hp==='number'&&h0>a.hp&&typeof uiFloat==='function')uiFloat('-'+Math.max(1,Math.round(h0-a.hp)),a.x,(a.y||0)+(a.r||10)*2.6+18,a.z,'#ffb08a');}catch(e){}return r;};
  w._spd=1;try{eval(name+'=w');}catch(e){}}
/* ---------- gợi ý (guide.js) ---------- */
if(typeof gdHintTick==='function'){const _gh=gdHintTick;gdHintTick=function(){if(!SET.hints){if(typeof GD!=='undefined'&&GD.card)try{gdHide();}catch(e){}return;}return _gh.apply(this,arguments);};}
/* ---------- chơi chung: gắn muộn (mp.js nạp sau tệp này) ---------- */
const SP_BAD=['địt','đéo','đụ','lồn','buồi','cặc','đĩ','vãi lồn','đcm','đmm','dmm','đm','dm','vcl','vkl','clgt','clm','cc','fuck','shit','bitch','dick','cunt'];
function spFilter(t){if(!SET.chatFilter)return t;let s=t;for(const w of SP_BAD){const re=new RegExp('(^|[^\\p{L}\\p{N}])('+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')(?=$|[^\\p{L}\\p{N}])','giu');s=s.replace(re,(m,a,b)=>a+'*'.repeat([...b].length));}return s;}
function spLate(){if(SP.late)return;SP.late=1;spDmgWrap('animalDamage');spDmgWrap('foeDamage');
  if(typeof mpChatAdd==='function'){const _ca=mpChatAdd;mpChatAdd=function(by,t,at){const M=spMP();if(SET.blocked[by]&&!(M&&by===M.uid))return false;return _ca.call(this,by,M&&by===M.uid?t:spFilter(t),at);};}
  if(typeof mpChatHear==='function'){const _ch=mpChatHear;mpChatHear=function(m){if(!SET.chat||(m&&SET.blocked[m.by]))return;return _ch.apply(this,arguments);};}
  if(typeof mpTradeHear==='function'){const _th=mpTradeHear;mpTradeHear=function(m){if(m&&SET.blocked[m.by]&&m.data&&m.data.k==='offer')return;return _th.apply(this,arguments);};}
  if(typeof mpChatHtml==='function'){const _cht=mpChatHtml;mpChatHtml=function(){return SET.chat?_cht.apply(this,arguments):'<p class="small">💬 Trò chuyện đang tắt. Bật lại ở Cài đặt → Chơi chung.</p>';};}
  if(typeof mpAvTick==='function'){const _av=mpAvTick;mpAvTick=function(dt){_av.apply(this,arguments);const M=spMP();if(!M||!M.rp)return;for(const r of M.rp.values()){
      if(r.o&&SET.blocked[r.uid]&&r.o.visible)r.o.visible=false;if(r.tag&&(!SET.names||SET.blocked[r.uid]))r.tag.visible=false;}};}}
{const _bt=boot;boot=function(){try{spLate();}catch(e){console.warn('cài đặt: gắn',e);}spPause.init();return _bt.apply(this,arguments);};}
addEventListener('beforeinstallprompt',e=>{SP.bip=e;});
/* ---------- giao diện bảng ---------- */
const SP_TABS=[['acc','👤','Tài khoản'],['gfx','🖼️','Đồ họa'],['snd','🔊','Âm thanh'],['ctl','🎮','Điều khiển'],['ui','🧩','Giao diện'],['mp','🌐','Chơi chung'],['data','💾','Dữ liệu'],['info','ℹ️','Thông tin']];
const spPct=v=>Math.round(v*100)+'%';
const SP_FMT={res:spPct,view:v=>v<0.85?'Gần':v>1.15?'Xa':'Vừa',grass:v=>v<=0?'Tắt':spPct(v),vMaster:spPct,vMusic:spPct,vFx:spPct,vAmb:spPct,sens:v=>'×'+v.toFixed(1),joyS:spPct,joyO:spPct,btnS:spPct,hudO:spPct};
function spSl(k,n,min,max,step,hint){return `<div class="sp-r sp-col"><div class="sp-l"><b>${n}</b><output data-spo="${k}">${(SP_FMT[k]||String)(SET[k])}</output></div>
  <input type="range" class="sp-rg" data-spr="${k}" min="${min}" max="${max}" step="${step}" value="${SET[k]}" aria-label="${esc(n)}">${hint?`<small class="sp-h">${hint}</small>`:''}</div>`;}
function spTg(k,n,hint,on){const v=on==null?!!SET[k]:on;return `<div class="sp-r"><div class="sp-l"><b>${n}</b>${hint?`<small class="sp-h">${hint}</small>`:''}</div><button class="sp-sw${v?' on':''}" data-spt="${k}" role="switch" aria-checked="${v}" aria-label="${esc(n)}"><i></i></button></div>`;}
function spCh(k,n,opts,hint){return `<div class="sp-r sp-col"><div class="sp-l"><b>${n}</b></div><div class="sp-seg">${opts.map(([v,t,dis])=>`<button class="tb sm${String(SET[k])===String(v)?' on':''}" data-spc="${k}" data-v="${v}"${dis?' disabled':''}>${t}</button>`).join('')}</div>${hint?`<small class="sp-h">${hint}</small>`:''}</div>`;}
const spBtn=(n,btn,hint)=>`<div class="sp-r"><div class="sp-l"><b>${n}</b>${hint?`<small class="sp-h">${hint}</small>`:''}</div>${btn}</div>`;
const spH=t=>`<h3 class="sp-h3">${t}</h3>`;
function spArmTxt(k,a,b,c){const n=SP.arm[k]||0;return n===0?a:n===1?b:c||b;}
settingsHtml=function(){const tab=SET.tab||'acc';const body={acc:spAccHtml,gfx:spGfxHtml,snd:spSndHtml,ctl:spCtlHtml,ui:spUiHtml,mp:spMpHtml,data:spDataHtml,info:spInfoHtml}[tab]||spAccHtml;let h='';
  try{h=body();}catch(e){console.warn('cài đặt',e);h='<p class="small">Không hiện được mục này.</p>';}
  return `<div class="sp-tabs" role="tablist">${SP_TABS.map(([k,ic,n])=>`<button class="sp-tab${tab===k?' on':''}" role="tab" aria-selected="${tab===k}" data-sptab="${k}"><span>${ic}</span><i>${n}</i></button>`).join('')}</div>
    ${SP.msg?`<p class="sp-msg ${SP.msgK||''}">${esc(SP.msg)}</p>`:''}<div class="sp-body" data-tab="${tab}">${h}</div>`;};
// 1. Tài khoản
function spAccHtml(){let h=spH('Tài khoản');const web=spWeb()&&LDB.uid,cl=spClaude();
  if(web){h+=`<div class="sp-card"><span class="sp-av">${esc((LDB.name||'?')[0])}</span><div><b>${esc(LDB.name||'Người chơi')}</b><small>${esc(LDB.email||'')}</small></div></div>
    <div class="sp-r sp-col"><div class="sp-l"><b>Tên hiển thị</b><small class="sp-h">Người khác thấy tên này trong thế giới chung (2–24 ký tự).</small></div><div class="sp-in"><input id="spName" maxlength="24" value="${esc(LDB.name||'')}" autocomplete="nickname"><button class="btn sm" data-sp="rename"${SP.busy?' disabled':''}>Lưu</button></div></div>
    <div class="sp-r sp-col"><div class="sp-l"><b>Đổi mật khẩu</b></div><div class="sp-in"><input id="spPw" type="password" minlength="6" placeholder="Mật khẩu mới (≥ 6 ký tự)" autocomplete="new-password"><button class="btn sm" data-sp="pw"${SP.busy?' disabled':''}>Đổi</button></div>
      <button class="sp-link" data-sp="pwmail">Hoặc gửi thư đặt lại mật khẩu tới ${esc(LDB.email||'email của bạn')}</button></div>
    ${spBtn('Đăng xuất','<button class="btn sm ghost" data-a="ldout">Đăng xuất</button>','Tự lưu trước, rồi về màn hình đăng nhập.')}`;}
  else if(cl){const nm=typeof ACC!=='undefined'&&ACC.name;h+=`<div class="sp-card"><span class="sp-av">C</span><div><b>${esc(nm||'Tài khoản Claude')}</b><small>Bạn đang chơi bằng <b>tài khoản Claude</b> của mình. Nhân vật được lưu theo tài khoản này.</small></div></div>
    <p class="sp-note">Tên hiển thị và mật khẩu do tài khoản Claude quản lý. Muốn đổi tài khoản, hãy đăng xuất khỏi Claude rồi mở lại trò chơi.</p>`;}
  else{h+=`<div class="sp-card"><span class="sp-av">📱</span><div><b>Chơi trên máy này</b><small>Chưa đăng nhập: nhân vật chỉ lưu trên trình duyệt này.</small></div></div>`;
    if(spWeb())h+=spBtn('Đăng nhập','<button class="btn sm" data-a="ldretry">🔑 Đăng nhập</button>','Đăng nhập để lưu trên máy chủ và chơi chung.');}
  h+=spH('Nhân vật');if(S)h+=`<div class="sp-card"><span class="sp-av">${esc((S.name||'?')[0])}</span><div><b>${esc(S.name||'')}</b><small>Ngày ${S.day||1} · ${S.mode==='survival'?'Sinh tồn: đói, khát, rét, thú dữ đều nguy hiểm':'Thong thả: đói khát chỉ làm chậm, thú ít hung dữ'}${S.mp?' · 🌐 Thế giới chung':''}</small></div></div>`;
  if(typeof accSwitch==='function')h+=spBtn('Đổi nhân vật','<button class="btn sm" data-a="chswitch">👥 Đổi nhân vật</button>','Tự lưu rồi về danh sách nhân vật.');
  if(typeof crOpen==='function')h+=spBtn('Ngoại hình','<button class="btn sm" data-a="credit">🎨 Sửa ngoại hình</button>');
  if(S&&typeof curSlot==='function'&&curSlot())h+=spBtn('Xóa nhân vật này',`<button class="btn sm ${SP.arm.chdel?'red':'ghost'}" data-sp="chdel">${spArmTxt('chdel','🗑 Xóa','Chắc chưa? Bấm lần nữa','⚠️ Xóa vĩnh viễn')}</button>`,SP.arm.chdel?'Mất hết đồ đạc, nhà cửa, kỹ năng của '+esc(S.name)+'. Không lấy lại được.':'Xóa cả bản trên máy và trên máy chủ.');
  if(web||cl){h+=spH('Xóa tài khoản');const fn=web&&typeof LDB.deleteAccount==='function';
    h+=spBtn('Yêu cầu xóa tài khoản',`<button class="btn sm ${SP.arm.accdel?'red':'ghost'}" data-sp="accdel">${SP.arm.accdel?'Bấm lần nữa để '+(fn?'xóa':'xem cách xóa'):'Xóa tài khoản'}</button>`,fn?'Xóa tài khoản và mọi nhân vật trên máy chủ.':'Xóa mọi dữ liệu của bạn trên máy chủ.');
    if(SP.delInfo)h+=`<div class="sp-note">${cl?'Dữ liệu trò chơi gắn với tài khoản Claude. Hãy xóa từng nhân vật ở trên (bản trên máy chủ cũng bị xóa). Để xóa chính tài khoản Claude, vào phần cài đặt tài khoản của Claude.':
      `Gửi email tới <a href="mailto:${SET_MAIL}?subject=${encodeURIComponent('Yêu cầu xóa tài khoản Lửa Đá')}&body=${encodeURIComponent('Xin xóa tài khoản: '+(LDB.email||'')+'\nMã: '+(LDB.uid||''))}">${SET_MAIL}</a> từ địa chỉ ${esc(LDB.email||'đã đăng ký')} với tiêu đề “Yêu cầu xóa tài khoản”. Tài khoản và mọi nhân vật sẽ bị xóa trong vòng 30 ngày. Bạn có thể xóa ngay từng nhân vật ở trên.`}</div>`;}
  return h;}
// 2. Đồ họa
function spGfxHtml(){let h=spH('Chất lượng');const pf=spPerf();
  if(pf){const auto=!!PERF.auto,cur=PERF.lv==null?G.q:PERF.lv;
    h+=`<div class="sp-seg sp-q"><button class="tb sm${auto?' on':''}" data-sp="qauto">Tự động</button>${[['u','Siêu nhẹ'],['0','Nhẹ'],['1','Vừa'],['2','Đẹp']].map(([v,n])=>`<button class="tb sm${!auto&&String(cur)===v?' on':''}" data-a="qlv" data-v="${v}">${n}</button>`).join('')}</div>
    <p class="sp-h">Đang dùng <b>${perfLvName(cur)}</b>${auto?' (máy tự chọn'+(PERF.tierWhy?': '+esc(PERF.tierWhy):'')+')':''}. ${typeof PQDESC!=='undefined'?esc(PQDESC[cur]||''):''}${PERF.fps?` Khoảng ${Math.round(PERF.fps)} khung/giây.`:''}</p>`;}
  else{const auto=spLS('ldtt-qu')==null;h+=`<div class="sp-seg sp-q"><button class="tb sm${auto?' on':''}" data-sp="qauto">Tự động</button>${[['0','Nhẹ'],['1','Vừa'],['2','Đẹp']].map(([v,n])=>`<button class="tb sm${!auto&&String(G.q)===v?' on':''}" data-a="q" data-v="${v}">${n}</button>`).join('')}</div>`;}
  h+=spH('Chi tiết')+spSl('res','Độ phân giải',0.5,1,0.05,'Thấp hơn = mượt hơn, hơi mờ.')+spTg('dynRes','Tự giảm độ phân giải khi giật','Hạ tạm độ nét khi máy nặng, nét lại khi mượt.')
   +spCh('view','Tầm nhìn',[[0.7,'Gần'],[1,'Vừa'],[1.3,'Xa']])+spCh('shadow','Bóng đổ',[['auto','Theo mức'],['on','Bật'],['off','Tắt']])
   +spCh('grass','Mật độ cỏ',[[0,'Tắt'],[0.5,'Ít'],[1,'Vừa'],[1.5,'Dày']])+spCh('post','Hậu kỳ (sáng, mờ viền)',[['auto','Theo mức'],['on','Bật'],['off','Tắt']])
   +spCh('fpsCap','Giới hạn khung hình',[[0,'Không'],[60,'60'],[30,'30']],'30 khung/giây giúp đỡ nóng máy, đỡ tốn pin.')+spTg('fps','Hiện FPS','Số khung hình mỗi giây ở đầu màn hình.',spFpsOn());
  return h;}
// 3. Âm thanh
function spSndHtml(){return spTg('snd','Âm thanh',null,!!AU.on)+spSl('vMaster','Âm lượng chung',0,1,0.05)+spSl('vMusic','Nhạc (sáo, đàn đá)',0,1,0.05)+spSl('vFx','Hiệu ứng (chặt, đánh, nhặt…)',0,1,0.05)
  +spSl('vAmb','Môi trường (chim, dế, mưa, suối)',0,1,0.05)+spTg('bgMute','Tắt tiếng khi ẩn ứng dụng','Khi chuyển sang ứng dụng khác hoặc khóa màn hình.')+(AU.ctx?'':'<p class="sp-h">Âm thanh bật sau lần chạm đầu tiên vào màn hình.</p>');}
// 4. Điều khiển
function spCtlHtml(){const touch=matchMedia('(pointer:coarse)').matches||'ontouchstart' in window;let h=`<div class="sp-r sp-col"><div class="sp-l"><b>Góc nhìn</b><small class="sp-h">Phím V</small></div><div class="sp-seg">${[['fp','👁 Thứ nhất'],['tp','🎥 Từ trên cao']].map(([v,n])=>`<button class="tb sm${(v==='fp')===isFP()?' on':''}" data-a="view" data-v="${v}">${n}</button>`).join('')}</div></div>`;
  h+=spH('Camera')+spSl('sens','Độ nhạy xoay',0.3,2.5,0.1)+spTg('invY','Đảo trục dọc','Kéo lên để nhìn xuống.');
  h+=spH('Cảm ứng')+spSl('joyS','Cỡ cần điều khiển',0.7,1.5,0.05)+spSl('joyO','Độ rõ cần điều khiển',0.25,1,0.05)+spSl('btnS','Cỡ nút hành động',0.7,1.4,0.05)
   +spTg('lefty','Tay trái (đổi bên)','Cần điều khiển bên phải, nút hành động bên trái.')+spTg('autoRun','Tự chạy khi đẩy hết cần','Đẩy cần ra xa mép vòng để chạy.')
   +(navigator.vibrate?spTg('vib','Rung khi đánh / bị thương'):'')+spTg('tapMove','Chạm đất để đi tới','Tắt: chạm chỉ để làm việc với vật, không tự đi.')
   +spCh('dbl','Chạm hai lần',[['none','Không'],['jump','Nhảy'],['run','Bật/tắt chạy'],['view','Đổi góc nhìn']]);
  const keys=[['W A S D','Đi'],['Shift','Chạy'],['Space','Nhảy'],['E / F','Hành động'],['V','Đổi góc nhìn'],['Z','Lom khom'],['X','Ngồi'],['G','Ném'],['1–6','Chọn công cụ'],['I / Tab','Túi đồ'],['C','Chế tạo'],['B','Xây dựng'],['M','Bản đồ'],['J','Nhật ký'],['R / Q','Xoay (xây / camera)'],['Esc','Đóng bảng · Tạm dừng'],['Chuột phải kéo','Xoay camera'],['Lăn chuột','Phóng to']];
  h+=`<details class="sp-keys"${touch?'':' open'}><summary>⌨️ Phím tắt trên máy tính</summary><div class="sp-kg">${keys.map(([k,n])=>`<kbd>${k}</kbd><span>${n}</span>`).join('')}</div></details>`;return h;}
// 5. Giao diện
function spUiHtml(){let h='';if(typeof MXFS!=='undefined')h+=`<div class="sp-r sp-col"><div class="sp-l"><b>Cỡ chữ</b></div><div class="sp-seg">${MXFS.map(([v,n])=>`<button class="tb sm${(MXK.fs||'1')===v?' on':''}" data-a="mxfs" data-v="${v}">${n}</button>`).join('')}</div></div>`;
  h+=spSl('hudO','Độ rõ bảng chỉ số, thanh công cụ',0.3,1,0.05)+spCh('mini','Bản đồ nhỏ',[[0,'Ẩn'],[0.8,'Nhỏ'],[1,'Vừa'],[1.25,'Lớn']])
   +(typeof gdHintTick==='function'?spTg('hints','Thẻ gợi ý','Thẻ nhỏ nhắc việc nên làm tiếp theo.'):'')+spTg('dmg','Hiện số sát thương','Số bay lên khi đánh trúng thú.')
   +spCh('lang','Ngôn ngữ',[['vi','Tiếng Việt'],['en','English (sắp có)',1]]);
  if(typeof mxPhoto==='function')h+=spBtn('Chụp ảnh','<button class="btn sm" data-a="mxphoto">📷 Chế độ chụp ảnh</button>');
  if(typeof mxFill==='function')h+=spBtn('Thành tựu','<button class="btn sm ghost" data-a="mxopen" data-t="ach">🏆 Xem</button>');return h;}
// 6. Chơi chung
function spMpHtml(){const M=spMP();if(!M||!M.started||!S||!S.mp)return `<p class="sp-note">${S&&!S.mp?'Nhân vật này ở thế giới riêng. Các cài đặt dưới đây áp dụng khi bạn chơi ở thế giới chung.':'Chưa kết nối thế giới chung. Các cài đặt dưới đây sẽ áp dụng khi kết nối.'}</p>`+spMpOpts(null);return spMpOpts(M);}
function spMpOpts(M){let h=spTg('names','Hiện tên người chơi khác')+spTg('chat','Trò chuyện bộ tộc','Tắt: không nhận và không hiện tin nhắn.')+spTg('chatFilter','Lọc từ ngữ thô tục','Thay bằng dấu *.');
  const B=Object.entries(SET.blocked);h+=spH('Đã chặn ('+B.length+')')+(B.length?B.map(([u,n])=>`<div class="sp-r"><div class="sp-l"><b>🚫 ${esc(n||'Người chơi')}</b></div><button class="btn sm ghost" data-sp="unblock" data-u="${esc(u)}">Bỏ chặn</button></div>`).join(''):'<p class="sp-h">Chưa chặn ai. Người bị chặn: không thấy tin nhắn, lời tặng đồ và nhân vật của họ.</p>');
  if(M&&M.rp){const L=[...M.rp.values()].filter(r=>r.uid&&!SET.blocked[r.uid]).map(r=>({r,d:Math.hypot(r.x-P.x,r.z-P.z)})).sort((a,b)=>a.d-b.d).slice(0,12);
    h+=spH('Người chơi gần đây')+(L.length?L.map(({r,d})=>`<div class="sp-r"><div class="sp-l"><b>${esc(typeof mpName==='function'?mpName(r.uid):'Người chơi')}</b><small class="sp-h">${Math.round(d/20)} m</small></div><button class="btn sm ghost" data-sp="block" data-u="${esc(r.uid)}">Chặn</button></div>`).join(''):'<p class="sp-h">Không có ai ở gần.</p>');}
  return h;}
// 7. Dữ liệu
function spDataHtml(){let h=spH('Bản lưu');
  h+=spBtn('Xuất bản lưu','<button class="btn sm" data-sp="export">⬇️ Tải về</button>',S?'Lưu nhân vật '+esc(S.name)+' thành tệp .json để cất giữ hoặc chuyển máy.':'');
  h+=spBtn('Nhập bản lưu','<label class="btn sm ghost sp-file">⬆️ Chọn tệp<input type="file" accept=".json,application/json" data-sp="import" hidden></label>','Thêm thành một nhân vật mới (tối đa 4).');
  if(SP.imp)h+=`<div class="sp-note">✅ Đã nhập <b>${esc(SP.imp.name)}</b> (ngày ${SP.imp.day}). <button class="btn sm" data-sp="impplay">▶ Chơi ngay</button></div>`;
  h+=spH('Bộ nhớ')+`<p class="sp-h sp-usage">${SP.usage||'Đang tính…'}</p>`;
  h+=spBtn('Xóa bộ nhớ đệm','<button class="btn sm ghost" data-sp="cache">🧹 Xóa</button>','Tệp tải sẵn để chơi ngoại tuyến và mức đồ họa máy tự chọn. Không xóa nhân vật.');
  h+=spBtn('Đặt lại cài đặt',`<button class="btn sm ${SP.arm.reset?'red':'ghost'}" data-sp="reset">${SP.arm.reset?'Bấm lần nữa':'↺ Mặc định'}</button>`,'Đưa mọi cài đặt về như ban đầu.');
  h+=spH('Thế giới')+`<div class="sp-r"><div class="sp-l"><b>Chơi lại từ đầu</b><small class="sp-h">Xóa thế giới của nhân vật này.</small></div><button class="btn sm ${G.resetArm?'red':'ghost'}" data-a="reset">${G.resetArm?'Bấm lần nữa để xóa':'Tạo thế giới mới'}</button></div>`;
  setTimeout(spUsage,0);return h;}
// 8. Thông tin
function spInfoHtml(){const app=spAppAvail();return `<div class="sp-card sp-about"><span class="sp-av">🔥</span><div><b>Lửa Đá: Từ Hai Bàn Tay Trắng</b><small>Phiên bản ${SET_VER} · bản dựng ${SET_BUILD}${spWeb()?' · lanhdia.app':spClaude()?' · trên Claude':''}</small></div></div>
  ${typeof cxOpen==='function'?spBtn('Bách khoa','<button class="btn sm" data-sp="codex">📖 Mở</button>','Vùng đất, muông thú, đồ vật.'):''}
  ${spBtn('Sổ tay & mục tiêu','<button class="btn sm ghost" data-sp="journal">📜 Mở</button>')}
  ${app?spBtn('Cài ứng dụng','<button class="btn sm" data-sp="app">📲 Cài</button>','Mở toàn màn hình, chơi được khi mất mạng.'):''}
  ${spBtn('Góp ý, báo lỗi',`<a class="btn sm ghost" href="mailto:${SET_MAIL}?subject=${encodeURIComponent('Góp ý Lửa Đá '+SET_VER)}">✉️ Gửi thư</a>`)}
  ${spH('Quyền riêng tư')}<p class="sp-h">Trò chơi chỉ lưu những gì cần để chơi: tên hiển thị, email đăng nhập (bản web) và bản lưu nhân vật. Ở thế giới chung, người khác thấy tên, vị trí, ngoại hình nhân vật và tin nhắn bộ tộc của bạn. Không quảng cáo, không bán dữ liệu. Có thể xóa nhân vật hoặc yêu cầu xóa tài khoản ở thẻ Tài khoản.</p>
  ${spH('Làm nên trò chơi')}<p class="sp-h">Ý tưởng, thiết kế và lập trình: nhóm Lửa Đá. Đồ họa 3D dựng bằng three.js; mọi mô hình, âm thanh được tạo bằng mã, không dùng tệp ngoài. Phông chữ Be Vietnam Pro và Bungee (Google Fonts). Cảm ơn mọi người đã chơi thử và góp ý!</p>`;}
function spAppAvail(){if(matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone)return false;
  if(!document.querySelector('.ld-app'))return false;return !!SP.bip||/iphone|ipad|ipod/i.test(navigator.userAgent);}
async function spUsage(){let ls=0,n=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i),v=localStorage.getItem(k)||'';ls+=(k.length+v.length)*2;n++;}}catch(e){}
  let s=`Trên trình duyệt này: ${(ls/1048576).toFixed(2)} MB cho ${n} mục lưu`;try{if(navigator.storage&&navigator.storage.estimate){const q=await navigator.storage.estimate();if(q&&q.quota)s+=` · tổng ${(q.usage/1048576).toFixed(1)} MB / ${(q.quota/1073741824).toFixed(1)} GB`;}}catch(e){}
  try{const sl=slotsLocal();s+=` · ${Object.keys(sl).length} nhân vật trên máy`;}catch(e){}s+='.';SP.usage=s;const el=document.querySelector('#panel .sp-usage');if(el)el.textContent=s;}
/* ---------- xử lý bấm ---------- */
function spMsg(m,k){SP.msg=m;SP.msgK=k||'';clearTimeout(SP.msgT);SP.msgT=setTimeout(()=>{SP.msg='';const p=document.querySelector('#panel .sp-msg');if(p)p.remove();},6000);}
function spRefresh(){if(G.panel==='settings')uiOpenRefresh();}
function spArm(k){if(SP.arm[k]){return true;}SP.arm[k]=1;clearTimeout(SP['armT'+k]);SP['armT'+k]=setTimeout(()=>{SP.arm[k]=0;spRefresh();},5000);return false;}
function spSet(k,v){if(!setValid(k,v))return;SET[k]=v;setSave();
  if(['joyS','joyO','btnS','hudO','mini','lefty'].includes(k))setApplyCss();if(['sens','invY','lefty'].includes(k))setApplyCtl();if(k[0]==='v'&&k!=='view'||k==='bgMute')setApplyAudio();
  if(['view','shadow','grass'].includes(k))setApplyGfx();if(k==='res'){G._rsK=null;try{resize();}catch(e){}}if(k==='dynRes'&&!v&&G.prK!==1&&G.R){G.prK=1;try{resize();}catch(e){}}
  if(k==='hints'&&!v&&typeof GD!=='undefined'&&GD.card)try{gdHide();}catch(e){}
  if(k==='names'||k==='chat'){const M=spMP();if(M)M.dirty.ui=true;}}
document.addEventListener('click',async e=>{const t=e.target&&e.target.closest&&e.target.closest('[data-sptab],[data-spt],[data-spc],[data-sp]');if(!t||t.tagName==='INPUT')return;
  e.stopImmediatePropagation();e.preventDefault();try{sfx('pick');}catch(er){}const d=t.dataset;
  if(d.sptab){SET.tab=d.sptab;setSave();SP.msg='';SP.arm={};SP.delInfo=0;if(G.panel==='settings'){uiOpenRefresh();const b=document.querySelector('#panel .p-body');if(b)b.scrollTop=0;}return;}
  if(d.spt){const k=d.spt;if(k==='snd'){AU.on=!AU.on;if(!AU.on&&AU.rain)AU.rain.gain.value=0;if(AU.on){auInit();try{AU.ctx&&AU.ctx.resume();}catch(er){}}}else if(k==='fps')spFps(!spFpsOn());else spSet(k,!SET[k]);spRefresh();return;}
  if(d.spc){const k=d.spc,v=typeof SETD[k]==='number'?+d.v:d.v;spSet(k,v);spRefresh();return;}
  const a=d.sp;if(a==='pause'){spPause.open();return;}
  if(a&&a.startsWith('p-')){spPause.act(a.slice(2),t);return;}
  try{await spAct(a,t);}catch(er){console.warn('cài đặt',er);spMsg('Có lỗi: '+(er&&(er.msg||er.message)||er),'bad');}spRefresh();},true);
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.spr)return;const k=t.dataset.spr,v=+t.value;if(!setValid(k,v))return;SET[k]=v;
  const o=document.querySelector(`#panel [data-spo="${k}"]`);if(o)o.textContent=(SP_FMT[k]||String)(v);
  if(['joyS','joyO','btnS','hudO'].includes(k))setApplyCss();else if(k==='sens')setApplyCtl();else if(k[0]==='v'&&k!=='view')setApplyAudio();else if(k==='res'){G._rsK=null;try{resize();}catch(er){}}
  clearTimeout(SP.svT);SP.svT=setTimeout(setSave,250);},true);
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset)return;if(t.dataset.spr)setSave();if(t.dataset.sp==='import'&&t.files&&t.files[0]){const f=t.files[0];t.value='';spImport(f);}},true);
async function spAct(a,t){switch(a){
  case 'qauto':spLS('ldtt-qu',null);spLS('ldtt-qauto',null);G.prK=1;if(spPerf()){perfPick();if(G.R)applyQ();}else{startQ();G.noAdapt=false;if(G.R)applyQ();}spMsg('Đồ họa: máy tự chọn mức phù hợp.','ok');break;
  case 'rename':{const i=$('#spName');const n=typeof ldbCleanName==='function'?ldbCleanName(i&&i.value):String(i&&i.value||'').trim().slice(0,24);
    if(n.length<2){spMsg('Tên cần 2–24 ký tự (không dùng < > " / \\ @).','bad');break;}if(n===LDB.name){spMsg('Tên không đổi.','');break;}SP.busy=true;spRefresh();
    try{if(typeof LDB.setName==='function')await LDB.setName(n);else{const free=await LDB.nameFree(n);if(free===false)throw {msg:`Tên "${n}" đã có người dùng.`};
        const r=await Promise.race([LDB.sb.from('profiles').update({name:n,updated_at:new Date().toISOString()}).eq('id',LDB.uid),new Promise((_,rj)=>setTimeout(()=>rj({msg:'Máy chủ không trả lời.'}),12000))]);
        if(r&&r.error)throw {msg:/duplicate|unique/i.test(r.error.message||'')?`Tên "${n}" đã có người dùng.`:'Không đổi được tên: '+(r.error.message||'').slice(0,80)};}
      LDB.name=n;if(LDB.names)LDB.names.set(LDB.uid,n);const M=spMP();if(M&&M.names)M.names[LDB.uid]=n;spMsg('✅ Đã đổi tên thành '+n+'.','ok');}
    finally{SP.busy=false;}break;}
  case 'pw':{const i=$('#spPw'),pw=i&&i.value||'';if(pw.length<6){spMsg('Mật khẩu cần ít nhất 6 ký tự.','bad');break;}SP.busy=true;spRefresh();try{await LDB.newPassword(pw);spMsg('✅ Đã đổi mật khẩu.','ok');}finally{SP.busy=false;}break;}
  case 'pwmail':if(!LDB.email){spMsg('Tài khoản chưa có email.','bad');break;}await LDB.reset(LDB.email);spMsg('📧 Đã gửi thư đặt lại mật khẩu tới '+LDB.email+'.','ok');break;
  case 'chdel':{if((SP.arm.chdel||0)<2){SP.arm.chdel=(SP.arm.chdel||0)+1;clearTimeout(SP.armTchdel);SP.armTchdel=setTimeout(()=>{SP.arm.chdel=0;spRefresh();},6000);break;}
    SP.arm.chdel=0;const id=curSlot();if(!id)break;spMsg('Đang xóa nhân vật…','');G.on=false;const sl=slotsLocal();delete sl[id];slotsWrite(sl);accLS(SKEY+'#'+id,null);accLS(SKEY,null);accLS(CURK,null);
    try{await Promise.race([accDelCloud(id),new Promise(r=>setTimeout(r,6000))]);}catch(er){}try{sessionStorage.setItem('ldtt-menu','1');sessionStorage.removeItem('ldtt-auto');}catch(er){}location.reload();break;}
  case 'accdel':{if(!spArm('accdel'))break;SP.arm.accdel=0;if(spWeb()&&typeof LDB.deleteAccount==='function'){spMsg('Đang xóa tài khoản…','');try{save();}catch(er){}G.on=false;await LDB.deleteAccount();spLS(SKEY,null);spLS(CURK,null);location.reload();break;}SP.delInfo=1;break;}
  case 'block':case 'unblock':{const u=t.dataset.u;if(!u||!/^[A-Za-z0-9_\-.:@+~]{1,128}$/.test(u))break;if(a==='block'){SET.blocked[u]=typeof mpName==='function'?mpName(u):'Người chơi';const M=spMP();if(M&&M.chat)M.chat=M.chat.filter(c=>c.by!==u);spMsg('Đã chặn '+SET.blocked[u]+'.','');}else delete SET.blocked[u];setSave();break;}
  case 'export':await spExport();break;
  case 'impplay':{const im=SP.imp;if(!im)break;try{save();}catch(er){}G.on=false;accLS(SKEY,accLS(SKEY+'#'+im.id));accLS(CURK,im.id);try{sessionStorage.setItem('ldtt-auto',im.id);sessionStorage.removeItem('ldtt-menu');sessionStorage.removeItem('ldtt-autoh');}catch(er){}location.reload();break;}
  case 'cache':{let n=0;try{if(window.caches){for(const k of await caches.keys()){await caches.delete(k);n++;}}}catch(er){}spLS('ldtt-qauto',null);try{sessionStorage.removeItem('ldtt-autoh');}catch(er){}
    if(typeof ICO!=='undefined'&&ICO.cache&&ICO.cache.clear)try{ICO.cache.clear();}catch(er){}SP.usage='';spMsg('🧹 Đã xóa bộ nhớ đệm'+(n?` (${n} kho tệp)`:'')+'. Lần mở sau sẽ tải lại tệp.','ok');break;}
  case 'reset':{if(!spArm('reset'))break;SP.arm.reset=0;const tab=SET.tab;SET=JSON.parse(JSON.stringify(SETD));SET.tab=tab;setSave();['ldtt-qu','ldtt-qauto','ldtt-fps','ldtt-fs'].forEach(k=>spLS(k,null));
    if(typeof mxFsApply==='function')mxFsApply();spFps(false);setApplyAll();if(spPerf())perfPick();else startQ();setApplyGfx();spMsg('↺ Đã đưa cài đặt về mặc định.','ok');break;}
  case 'codex':uiClose();cxOpen(null,{});return;
  case 'journal':uiClose();uiOpen('journal',{});return;
  case 'app':{if(SP.bip){try{SP.bip.prompt();const r=await SP.bip.userChoice;if(r&&r.outcome==='accepted')SP.bip=null;}catch(er){}}else{const b=document.querySelector('.ld-app');if(b)b.click();}break;}}}
/* ---------- xuất / nhập bản lưu ---------- */
const spSlug=s=>String(s||'nhan-vat').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[đĐ]/g,'d').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'').toLowerCase().slice(0,24)||'nhan-vat';
function spExportData(){try{(typeof saveNow==='function'?saveNow:save)();}catch(e){}const raw=spLS(SKEY);if(!raw)return null;let s;try{s=JSON.parse(raw);}catch(e){return null;}const id=typeof curSlot==='function'?curSlot():null;
  return {app:'lua-da-tay-trang',kind:'save',fmt:1,ver:SET_VER,at:new Date().toISOString(),id,meta:id&&typeof slotsLocal==='function'?slotsLocal()[id]||null:null,save:s};}
async function spExport(){const o=spExportData();if(!o){spMsg('Chưa có gì để lưu.','bad');return;}const txt=JSON.stringify(o),fn=`lua-da-${spSlug(o.save.name)}-ngay-${o.save.day||1}.json`;SP.lastExport={fn,len:txt.length};
  if(spClaude()&&window.claude&&window.claude.use){let dl=null;try{dl=await Promise.race([window.claude.use('downloads'),new Promise(r=>setTimeout(()=>r(null),4000))]);}catch(e){dl=null;}
    if(dl){try{const r=await dl.save({filename:fn,data:new Blob([txt],{type:'application/json'})});spMsg(r==='saved'||r&&r.status==='saved'?'💾 Đã lưu '+fn+'.':'Đã gửi tệp '+fn+'.','ok');}catch(e){if(e&&e.code!=='declined')spMsg('Không tải về được ở đây ('+(e&&e.code||'lỗi')+').','bad');}return;}}
  try{const url=URL.createObjectURL(new Blob([txt],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=fn;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);spMsg('💾 Đã tải về '+fn+'.','ok');}
  catch(e){spMsg('Trình duyệt không cho tải tệp.','bad');}}
function spImportParse(txt){let o;try{o=JSON.parse(txt);}catch(e){throw {msg:'Tệp không phải bản lưu Lửa Đá (JSON hỏng).'};}const s=o&&o.app==='lua-da-tay-trang'&&o.save?o.save:o;
  if(!s||typeof s!=='object'||s.v!==1||typeof s.name!=='string'||!Array.isArray(s.inv)||!s.p||typeof s.p!=='object')throw {msg:'Tệp không phải bản lưu Lửa Đá.'};
  try{fixSave(JSON.parse(JSON.stringify(s)));}catch(e){throw {msg:'Bản lưu bị hỏng, không đọc được.'};}return s;}
async function spImport(f){SP.imp=null;try{if(f.size>30*1048576)throw {msg:'Tệp quá lớn.'};const s=spImportParse(await f.text());
    if(typeof slotsLocal!=='function'){spLS(SKEY,JSON.stringify(s));spMsg('Đã nhập. Tải lại trang để chơi.','ok');spRefresh();return;}
    const n=typeof accChars==='function'?accChars().length:Object.keys(slotsLocal()).length;if(n>=MAXCH)throw {msg:'Đã đủ 4 nhân vật. Xóa bớt một nhân vật rồi nhập lại.'};
    const id='c'+Date.now().toString(36)+'i';const raw=JSON.stringify(s);accLS(SKEY+'#'+id,raw);if(accLS(SKEY+'#'+id)!==raw)throw {msg:'Không đủ chỗ lưu trên máy.'};
    const sl=slotsLocal();sl[id]=slotMeta(s);slotsWrite(sl);SP.imp={id,name:s.name,day:s.day||1};spMsg('✅ Đã nhập nhân vật '+s.name+'.','ok');}
  catch(e){spMsg(e&&e.msg||'Không nhập được tệp.','bad');}spRefresh();}
/* ---------- menu tạm dừng ---------- */
const spPause={on:false,init(){if(spPause.ok)return;spPause.ok=1;
    {const _ui=uiInit;uiInit=function(){_ui.apply(this,arguments);spPause.btn();};}
    addEventListener('keydown',e=>{if(e.code!=='Escape'||!G.on||(e.target&&e.target.tagName==='INPUT'))return;if(spPause.on){e.stopImmediatePropagation();spPause.close();return;}
      if(!G.panel&&!G.build&&!document.querySelector('#overlay:not([hidden])')){e.stopImmediatePropagation();spPause.open();}},true);},
  btn(){const m=$('#menu');if(!m||m.querySelector('[data-sp="pause"]'))return;const b=document.createElement('button');b.dataset.sp='pause';b.setAttribute('aria-label','Tạm dừng');b.innerHTML='<span>⏸</span><i>Dừng</i>';m.appendChild(b);},
  open(){if(!G.on)return;if(G.panel)uiClose();if(G.build)try{buildEnd();}catch(e){}if(document.pointerLockElement)document.exitPointerLock();spPause.on=true;spPause.was=!!G.paused;G.paused=true;G.keys={};
    let el=$('#sppause');if(!el){el=document.createElement('div');el.id='sppause';el.className='sp-pause';el.setAttribute('role','dialog');el.setAttribute('aria-label','Tạm dừng');document.body.appendChild(el);}
    const out=spWeb()&&LDB.uid&&typeof ldlLogout==='function';
    el.innerHTML=`<div class="sp-pc"><h2>⏸ Tạm dừng</h2><p class="sp-h">${esc(S.name||'')} · Ngày ${S.day||1}${S.mp?' · 🌐 thế giới chung vẫn tiếp diễn':''}</p>
      <button class="btn big" data-sp="p-cont">▶ Tiếp tục</button><button class="btn" data-sp="p-set">⚙️ Cài đặt</button><button class="btn" data-sp="p-save">💾 Lưu game</button>
      ${typeof accSwitch==='function'?'<button class="btn ghost" data-sp="p-sw">👥 Đổi nhân vật</button>':''}${out?'<button class="btn ghost" data-sp="p-out">🚪 Đăng xuất</button>':''}</div>`;el.hidden=false;},
  close(){spPause.on=false;const el=$('#sppause');if(el)el.hidden=true;G.paused=!!spPause.was;},
  act(k,b){if(k==='cont'){spPause.close();return;}if(k==='set'){spPause.close();uiOpen('settings',{});return;}
    if(k==='save'){try{save();const id=curSlot&&curSlot();if(typeof ACC!=='undefined'&&ACC.db&&id)accPush(id,true);uiToast('💾 Đã lưu.','good');b.textContent='✅ Đã lưu';}catch(e){uiToast('Không lưu được.','bad');}return;}
    if(k==='sw'||k==='out'){if(!SP.arm['p'+k]){SP.arm['p'+k]=1;b.textContent=k==='sw'?'Bấm lần nữa để đổi nhân vật':'Bấm lần nữa để đăng xuất';setTimeout(()=>{SP.arm['p'+k]=0;},4000);return;}
      SP.arm['p'+k]=0;b.disabled=true;b.textContent='Đang lưu…';if(k==='sw')accSwitch();else ldlLogout();}}};
// tiêu đề bảng
{const _uo=uiOpen;uiOpen=function(k,o,keep){const r=_uo.apply(this,arguments);if(k==='settings'&&G.panel==='settings'){const h=document.querySelector('#panel .p-head h2');if(h)h.textContent='⚙️ Cài đặt';if(!keep){SP.arm={};SP.delInfo=0;}}return r;};}
/* ---------- kiểu ---------- */
(function spCss(){const s=document.createElement('style');s.textContent=`
:root{--sp-joy:1;--sp-joyo:1;--sp-btn:1;--sp-hud:1;--sp-mini:1}
.joy-r{transform:scale(var(--sp-joy));opacity:var(--sp-joyo)}
.acts{transform:scale(var(--sp-btn));transform-origin:100% 100%}
body.sp-lh .acts{right:auto;left:max(12px,env(safe-area-inset-left));transform-origin:0 100%;direction:rtl}body.sp-lh .acts>*{direction:ltr}
.hud,.goal,.compass,.hot,.menu{opacity:var(--sp-hud)}
.mini{transform:scale(var(--sp-mini));transform-origin:100% 0}body.sp-nomini .mini{display:none}
.sp-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px}
.sp-tab{display:flex;flex-direction:column;align-items:center;gap:2px;min-height:54px;padding:6px 2px;border-radius:12px;border:1px solid var(--line);background:rgba(0,0,0,.28);color:var(--fg)}
.sp-tab span{font-size:20px;line-height:1.1}.sp-tab i{font-style:normal;font-size:11.5px;font-weight:700;color:var(--muted)}.sp-tab *{pointer-events:none}
.sp-tab.on{border-color:var(--acc);background:rgba(242,197,90,.16)}.sp-tab.on i{color:var(--acc)}
@media (min-width:700px){.sp-tabs{grid-template-columns:repeat(8,1fr)}}
.sp-h3{margin:14px 0 2px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--acc)}.sp-body>.sp-h3:first-child{margin-top:2px}
.sp-r{display:flex;align-items:center;gap:12px;padding:11px 2px;border-bottom:1px solid rgba(255,255,255,.07)}.sp-r.sp-col{flex-direction:column;align-items:stretch;gap:7px}
.sp-l{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.sp-col>.sp-l{flex-direction:row;align-items:baseline;justify-content:space-between;gap:8px}.sp-col>.sp-l{flex-wrap:wrap}.sp-col>.sp-l>.sp-h{flex-basis:100%;margin:0}
.sp-l b{font-size:14.5px}.sp-l output{font-weight:800;color:var(--acc);font-size:13.5px}
.sp-h{font-size:12.5px;color:var(--muted);line-height:1.45;margin:2px 0}
.sp-rg{width:100%;height:34px;accent-color:var(--acc);margin:0;touch-action:pan-x}
.sp-seg{display:flex;gap:6px;flex-wrap:wrap}.sp-seg .tb{flex:1 1 auto;min-height:40px}.sp-seg .tb[disabled]{opacity:.45}
.sp-sw{flex:none;position:relative;width:56px;height:32px;border-radius:999px;border:1px solid var(--line);background:rgba(0,0,0,.4);padding:0}
.sp-sw i{position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#c2ab8c;transition:transform .15s,background .15s;pointer-events:none}
.sp-sw.on{background:rgba(242,197,90,.35);border-color:var(--acc)}.sp-sw.on i{transform:translateX(24px);background:var(--acc)}
.sp-card{display:flex;align-items:center;gap:12px;padding:10px 12px;margin:6px 0;border-radius:14px;background:rgba(0,0,0,.25);border:1px solid var(--line)}
.sp-card>div{display:flex;flex-direction:column;gap:2px;min-width:0}.sp-card small{font-size:12.5px;color:var(--muted);overflow-wrap:anywhere}
.sp-av{flex:none;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;font:800 19px var(--body);background:linear-gradient(180deg,#f0b860,#c9772c);color:#2a1608}
.sp-in{display:flex;gap:8px}.sp-in input{flex:1;min-width:0;font:600 16px var(--body);padding:9px 11px;border-radius:10px;border:1px solid var(--line);background:#1a120c;color:var(--fg);user-select:text;-webkit-user-select:text}
.sp-link{align-self:flex-start;background:none;border:0;padding:4px 0;color:var(--acc);font:600 12.5px var(--body);text-decoration:underline;text-underline-offset:3px}
.sp-note{padding:9px 11px;margin:8px 0;border-radius:12px;background:rgba(242,197,90,.08);border:1px solid rgba(242,197,90,.3);font-size:13px;line-height:1.5}.sp-note a{color:var(--acc)}
.sp-msg{padding:8px 11px;border-radius:10px;font-size:13px;margin:0 0 8px;background:rgba(0,0,0,.3);border:1px solid var(--line)}.sp-msg.ok{border-color:rgba(140,224,122,.5);color:#c8f5bd}.sp-msg.bad{border-color:rgba(255,122,90,.55);color:#ffc0ac}
.sp-keys{margin:12px 0 4px}.sp-keys summary{cursor:pointer;font-weight:700;padding:6px 0}.sp-kg{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;align-items:center;font-size:13px;margin-top:6px}
.sp-kg kbd{justify-self:start;padding:2px 8px;border-radius:6px;border:1px solid var(--line);border-bottom-width:3px;background:rgba(0,0,0,.35);font:700 12px var(--body)}
.sp-file{cursor:pointer}a.btn{text-decoration:none}
.sp-pause{position:fixed;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(10,6,3,.62);backdrop-filter:blur(3px)}.sp-pause[hidden]{display:none}
.sp-pc{width:min(340px,100%);display:flex;flex-direction:column;gap:10px;padding:20px 18px;border-radius:20px;background:linear-gradient(180deg,#3a2818,#1e140c);border:2px solid var(--fr);box-shadow:0 20px 50px rgba(0,0,0,.6);text-align:center}
.sp-pc h2{margin:0;font:400 26px var(--disp);color:var(--acc)}.sp-pc .btn{width:100%;min-height:48px}
.sp-fps{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 4px);transform:translateX(-50%);z-index:60;pointer-events:none;font:700 11px system-ui,sans-serif;color:#fff;background:rgba(0,0,0,.55);padding:3px 8px;border-radius:9px}.sp-fps[hidden]{display:none}
`;document.head.appendChild(s);})();
// FPS dự phòng (không có perf.js)
if(!spPerf()){SP.fpsOn=spLS('ldtt-fps')==='1';const _lp2=loop;let n=0,t0=0;loop=function(now){const r=_lp2(now);if(SP.fpsOn&&G.on){n++;if(!t0)t0=now;if(now-t0>500){const e=$('#spfps')||(spFps(true),$('#spfps'));if(e)e.textContent=Math.round(n*1000/(now-t0))+' FPS';n=0;t0=now;}}return r;};}
