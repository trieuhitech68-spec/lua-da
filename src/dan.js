/* ===================== THỔ DÂN: BẮT SỐNG · CẤP ĐỘ THEO VÙNG · SỞ TRƯỜNG · GIỮ CỔNG · LÀM LÍNH =====================
   - Chiến binh các bộ lạc có CẤP (1..10) tăng theo khoảng cách tới Trảng Khởi Đầu: càng xa càng trâu (máu +20%, đòn +12% mỗi cấp).
   - Mang Dây thừng trong túi và còn giường trống: hạ gục một chiến binh thì TRÓI BẮT thay vì giết (tốn 1 dây thừng). Tù binh về ở như
     người nhà (S.folk) kèm: cap (đang là tù binh), loy (lòng trung thành 0..100), lv (cấp, giữ từ lúc bắt), sp (sở trường), xp.
   - Cho ăn đủ mỗi ngày công: +12 trung thành; bỏ đói: −20. Tới 100 thì quy phục hẳn (hết là tù binh); về 0 thì trốn mất.
   - Cấp và sở trường có tác dụng: làm đúng sở trường nhanh hơn 40%, mỗi cấp nhanh thêm 10%; đòn đánh = 2 + cấp (chiến binh ×1,5).
     Làm việc, đánh trận thì lên kinh nghiệm, lên cấp (tối đa 10). Người làng mời về cũng có cấp và sở trường theo nghề cũ.
   - Hai vị trí mới: "Giữ cổng" (đứng ở cổng gần nhà nhất, đánh kẻ cướp và thú dữ lại gần, gác cả đêm) và "Lính theo bạn"
     (đi theo người chơi, cùng đánh chiến binh, thú dữ: dùng để đi chiếm điểm tài nguyên). "Canh gác" cũ giờ đánh cả kẻ cướp.
   - Bảng 👥 Dân làng: danh sách mọi người, cấp, sở trường, trung thành, đổi việc tại chỗ. */
const DAN_SP={wood:['🪓','Thợ rừng'],stone:['⛏️','Thợ đá'],gather:['🧺','Hái lượm'],guard:['🛡️','Chiến binh'],cook:['🍲','Bếp núc']};
const DAN_ROLE={hunter:'guard',gatherer:'gather',potter:'cook',elder:'cook',chief:'guard',child:'gather'};
const DAN_NAMES=['Khả','Lục','Mộc','Sơn','Thạch','Vũ','Điền','Hổ','Lang','Ngạn','Trác','Bàng','Cồ','Đô','Giáp','Hùng','Kha','Lữ','Mạc','Nùng'];
const DAN_MAXLV=10;
JOBN.gate='Giữ cổng';JOBN.soldier='Lính theo bạn';
const danLv=f=>clamp(f.lv|0||1,1,DAN_MAXLV);
const danSp=f=>f.sp||(f.sp=DAN_ROLE[f.role]||'gather');
const danDmg=f=>(2+danLv(f))*(danSp(f)==='guard'?1.5:1);
const danCustom=f=>f.job==='gate'||f.job==='soldier';
function danS(){if(!S.dan||typeof S.dan!=='object')S.dan={on:1};return S.dan;}
function danXp(f,n){f.xp=(f.xp||0)+n;const need=8*danLv(f);if(f.xp>=need&&danLv(f)<DAN_MAXLV){f.xp-=need;f.lv=danLv(f)+1;if(Math.hypot(f.x-P.x,f.z-P.z)<900)uiToast(`⭐ ${f.n} lên cấp ${f.lv} (${DAN_SP[danSp(f)][1]}).`,'good');}}
/* ---------- cấp của chiến binh theo vùng ---------- */
function danFoeLv(f){if(f._lvA)return;f._lvA=1;f.lv=clamp((typeof khuLv==='function'?khuLv(f.x,f.z):1+Math.floor(Math.hypot(f.x-SPAWN[0],f.z-SPAWN[1])/1000))+(Math.random()<0.35?1:0),1,DAN_MAXLV);const k=1+0.2*(f.lv-1);f.hp*=k;if(f.hp0)f.hp0*=k;if(f.dmg)f.dmg*=1+0.12*(f.lv-1);}
{const _ft=foesTick;foesTick=function(dt){if(G.foes)for(const f of G.foes)if(!f._lvA&&f.alive)danFoeLv(f);return _ft.apply(this,arguments);};}
{const _fh=foeHit;foeHit=function(f,t){if(!f||f.dmg||!(f.lv>1))return _fh.apply(this,arguments);const old=FOE.dmg;FOE.dmg=old*(1+0.12*(f.lv-1));try{return _fh.apply(this,arguments);}finally{FOE.dmg=old;}};}
{const _ti=targetInfo;targetInfo=function(t){const r=_ti.apply(this,arguments);try{if(r&&t&&t.type==='foe'&&t.a){if(t.a.lv)r.name='Cấp '+t.a.lv+' · '+r.name;if(danS().on&&invCount('rope')>0&&freeBed())r.verb='Đánh (hạ gục sẽ trói bắt)';}}catch(e){}return r;};}
/* ---------- bắt sống ---------- */
function danCapture(foe){const bed=freeBed();if(!bed)return false;slotsTake(S.inv,'rope',1);S.folk=S.folk||[];S.recruited=S.recruited||{};const used=new Set(S.folk.map(f=>f.n));let n=DAN_NAMES[Math.floor(Math.random()*DAN_NAMES.length)];for(let i=2;used.has(n)&&i<99;i++)n=n.split(' ')[0]+' '+i;
  const sps=Object.keys(DAN_SP),sp=Math.random()<0.4?'guard':sps[Math.floor(Math.random()*sps.length)];
  const f={n,role:'hunter',seed:900+Math.floor(Math.random()*90),sex:'m',bed:bed.id,job:'idle',x:foe.x,z:foe.z,fed:TNOW(),cap:1,loy:30,lv:foe.lv||1,sp,xp:0,from:foe.n||FOE.n};S.folk.push(f);folkSpawn(f);
  foe.dieT=99;cnt('cnt','capture');sfx('level');uiToast(`🪢 Đã trói bắt ${f.n} (cấp ${f.lv}, ${DAN_SP[sp][1].toLowerCase()}). Cho ăn đủ để thu phục; mở 👥 Dân làng để giao việc.`,'gold');save();uiHotbar&&uiHotbar();return true;}
{const _fd=foeDamage;foeDamage=function(f,dmg){const al=f&&f.alive;const r=_fd.apply(this,arguments);try{if(al&&f&&!f.alive&&S&&danS().on&&!f.noCap&&invCount('rope')>0){if(!danCapture(f)&&!G.danBedTip){G.danBedTip=1;uiToast('Muốn bắt sống thổ dân thì cần còn giường trống ở nhà.','');}}}catch(e){console.warn('thổ dân',e);}return r;};}
/* ---------- trung thành ---------- */
{const _fh=folkHourly;folkHourly=function(gh){const r=_fh.apply(this,arguments);if(!S||!S.folk)return r;const d=Math.floor(TNOW());for(const f of S.folk.slice()){if(!f.cap)continue;if(f.loyD==null){f.loyD=d;continue;}if(f.loyD===d)continue;f.loyD=d;const fed=TNOW()-(f.fed||0)<1.3;f.loy=clamp((f.loy||0)+(fed?12:-20),0,100);
    if(f.loy>=100){f.cap=0;cnt('cnt','submit');uiToast(`🤝 ${f.n} đã quy phục, thành người của bộ tộc bạn.`,'gold');sfx('level');}
    else if(f.loy<=0){S.folk=S.folk.filter(o=>o!==f);if(f._o)G.sc.remove(f._o);uiToast(`${f.n} bị bỏ đói, đã trốn về bộ lạc cũ.`,'bad');}}save();return r;};}
/* ---------- làm việc theo cấp, sở trường · giữ cổng · làm lính ---------- */
function danEnemy(ax,az,r){let best=null,bd=r;if(G.foes)for(const e of G.foes){if(!e.alive)continue;const d=Math.hypot(e.x-ax,e.z-az);if(d<bd){bd=d;best={e,foe:1};}}
  for(const a of G.animals){if(!a.alive||a.state!=='chase'||!a.o||!a.o.visible)continue;const d=Math.hypot(a.x-ax,a.z-az);if(d<bd){bd=d;best={e:a,foe:0};}}return best;}
function danGate(home){let best=null,bd=700;for(const b of S.builds){if(b.prog!=null||!/gate/i.test(b.k))continue;const d=Math.hypot(b.x-home.x,b.z-home.z);if(d<bd){bd=d;best=b;}}return best||home;}
function danStrike(f,t){if(t.foe)foeDamage(t.e,danDmg(f));else animalDamage(t.e,danDmg(f));danXp(f,1);}
function danPost(f,dt){if(!f._o)folkSpawn(f);const home=folkHome(f),sol=f.job==='soldier';let ax,az;if(sol){ax=P.x-Math.sin(P.ry||0)*40+((f.seed%5)-2)*14;az=P.z-Math.cos(P.ry||0)*40+((f.seed%3)-1)*14;}else{const g=danGate(home);ax=g.x+((f.seed%3)-1)*18;az=g.z+18;}
  let tx=ax,tz=az,pose='idle',sp=sol?150:70;f._t=(f._t||0)-dt;const t=danEnemy(sol?P.x:ax,sol?P.z:az,sol?260:240);
  if(t){tx=t.e.x;tz=t.e.z;sp=sol?150:110;if(Math.hypot(t.e.x-f.x,t.e.z-f.z)<(t.e.r||9)+16){tx=f.x;tz=f.z;pose='chop';f._ry=Math.atan2(t.e.x-f.x,t.e.z-f.z);if(f._t<=0){f._t=1.1;danStrike(f,t);}}}
  const dx=tx-f.x,dz=tz-f.z,d=Math.hypot(dx,dz);if(sol&&d>1400){f.x=ax;f.z=az;}else if(d>6&&pose!=='chop'){f.x+=dx/d*Math.min(d,sp*dt);f.z+=dz/d*Math.min(d,sp*dt);f._ry=Math.atan2(dx,dz);pose='walk';f._g=(f._g||0)+dt*(sp>100?2:1.4);}
  f._o.position.set(f.x,groundY(f.x,f.z,(f._o.position.y||0)+10),f.z);f._o.rotation.y=lerpAng(f._o.rotation.y,f._ry||0,Math.min(1,dt*6));
  if(K3.char2Pose&&f._rig&&Math.hypot(P.x-f.x,P.z-f.z)<800){try{K3.char2Pose(f._rig,pose,pose==='walk'?f._g:G.t+f.seed,{});}catch(e){}}}
{const _ft=folkTick;folkTick=function(dt){if(!S||!S.folk||!S.folk.length)return _ft.apply(this,arguments);const all=S.folk,cus=all.filter(danCustom);
  if(cus.length){S.folk=all.filter(f=>!danCustom(f));try{_ft.apply(this,arguments);}finally{S.folk=all;}for(const f of cus){try{danPost(f,dt);}catch(e){}}}else _ft.apply(this,arguments);
  for(const f of all){if(danCustom(f))continue;const st=f._st;
    if(st==='work'&&f._t>0)f._t-=dt*(0.1*(danLv(f)-1)+(f.job===danSp(f)?0.4:0));
    if(f._pst==='work'&&st==='back')danXp(f,1);f._pst=st;
    // canh gác: đánh cả kẻ cướp lại gần nhà
    if(f.job==='guard'&&G.foes&&G.foes.length&&!(S.hour>=20||S.hour<6)){const home=folkHome(f);let e=null,bd=280;for(const o of G.foes){if(!o.alive)continue;const d=Math.hypot(o.x-home.x,o.z-home.z);if(d<bd){bd=d;e=o;}}
      if(e){const d=Math.hypot(e.x-f.x,e.z-f.z);if(d>e.r+16){f.x+=(e.x-f.x)/d*Math.min(d,60*dt);f.z+=(e.z-f.z)/d*Math.min(d,60*dt);}else{f._gt=(f._gt||0)-dt;if(f._gt<=0){f._gt=1.1;foeDamage(e,danDmg(f));danXp(f,1);}}}}}};}
/* ---------- bảng ---------- */
function danCard(f){const sp=DAN_SP[danSp(f)],lv=danLv(f);return `<div class="dan-info"><span class="dan-lv">Cấp ${lv}</span><span>${sp[0]} ${sp[1]}</span><span class="muted">đòn ${danDmg(f).toFixed(1)} · làm nhanh +${Math.round((0.1*(lv-1)+(f.job===danSp(f)?0.4:0))*100)}%</span>${f.cap?`<span class="dan-cap">Tù binh · trung thành ${Math.round(f.loy||0)}/100</span>`:''}</div>${f.cap?`<div class="hero-bar"><i style="width:${clamp(f.loy||0,0,100)}%"></i></div>`:''}`;}
{const _fh=folkHtml;folkHtml=function(){const f=G.folkCur;if(!f)return _fh.apply(this,arguments);return danCard(f)+`<p class="small muted">${f.cap?'Cho ăn đủ mỗi ngày (để thức ăn trong giỏ, rương, chum) thì trung thành tăng 12; bỏ đói thì giảm 20 và có thể trốn mất. ':''}Giao đúng sở trường thì làm nhanh hơn 40%. Giữ cổng: gác ở cổng gần nhà cả ngày lẫn đêm. Lính theo bạn: đi cùng, đánh chiến binh và thú dữ.</p>`+_fh.apply(this,arguments);};}
function danHtml(){const L=S.folk||[],D=danS(),beds=S.builds.filter(b=>{const d=pieceDef(b.k);return d&&d.bed&&b.prog==null;}).length;
  const rows=L.map((f,i)=>`<div class="up-row dan-row"><div class="up-main"><b>${esc(f.n)}</b>${danCard(f)}<div class="chipsel">${Object.keys(JOBN).filter(j=>j!=='farm').map(j=>`<button class="tb sm${f.job===j?' on':''}" data-a="danjob" data-i="${i}" data-j="${j}">${JOBN[j]}</button>`).join('')}</div></div></div>`).join('');
  return `<div class="landbox"><b>🪢 Bắt sống thổ dân</b><span class="small muted">Mang Dây thừng và còn giường trống: hạ gục chiến binh sẽ trói bắt thay vì giết (tốn 1 dây). Vùng càng xa, thổ dân cấp càng cao. Đang có ${invCount('rope')} dây thừng · ${L.length}/${beds} giường có người.</span>
    <div class="row"><button class="btn sm${D.on?'':' ghost'}" data-a="dantog">${D.on?'✔ Đang bật bắt sống':'Đang tắt: hạ gục là giết'}</button></div></div>
  ${L.length?rows:'<p class="small muted">Chưa có ai ở cùng. Mời dân Làng Suối Tây (tình thân từ 40) hoặc bắt sống chiến binh các bộ lạc.</p>'}`;}
{const _uo=uiOpen;uiOpen=function(k,o,keep){if(k!=='dan')return _uo.apply(this,arguments);if(!G.on)return;if(G.build)buildEnd();G.popt=o||{};G.panel='dan';const p=$('#panel');p.hidden=false;document.body.classList.add('pan');
  const sc=p.querySelector('.p-body')?p.querySelector('.p-body').scrollTop:0;p.innerHTML=`<div class="p-head"><h2>Dân làng & thổ dân</h2><button class="p-x" data-ui="close" aria-label="Đóng">✕</button></div><div class="p-body">${danHtml()}</div>`;if(keep)p.querySelector('.p-body').scrollTop=sc;if(document.pointerLockElement)document.exitPointerLock();};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="danjob"],[data-a="dantog"]');if(!b||!S)return;e.stopImmediatePropagation();if(b.dataset.a==='dantog'){const D=danS();D.on=D.on?0:1;}else{const f=(S.folk||[])[+b.dataset.i];if(f){f.job=b.dataset.j;f._st='idle';}}sfx('pick');save();uiOpenRefresh();},true);
function danMenu(){const m=$('#menu');if(!m||m.querySelector('[data-ui="dan"]'))return;const b=document.createElement('button');b.setAttribute('data-ui','dan');b.setAttribute('aria-label','Dân làng');b.innerHTML='<span>👥</span><i>Dân làng</i>';const j=m.querySelector('[data-ui="journal"]');if(j&&j.parentNode)j.parentNode.insertBefore(b,j);else m.appendChild(b);}
setInterval(()=>{try{if(G.on&&S)danMenu();}catch(e){}},1500);
{const st=document.createElement('style');st.textContent=`.dan-info{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center;font-size:12px;margin:2px 0 4px}.dan-lv{font-weight:800;color:#2a1608;background:#f2c55a;border-radius:8px;padding:1px 7px}.dan-cap{color:#ffb86a;font-weight:700}.dan-row .chipsel{margin-top:6px}`;document.head.appendChild(st);}
