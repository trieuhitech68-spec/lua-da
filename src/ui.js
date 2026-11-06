/* ===================== GIAO DIỆN & ĐIỀU KHIỂN ===================== */
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const EMO={bow:'🏹',arrow:'➶',fireDrill:'🔥',tin:'🪨',bronze:'🟫',crucible:'🏺',bronzeAxe:'🪓',bronzeSpear:'🔱',bronzeKnife:'🔪',bronzeSickle:'🌙',raft:'🛶',canoe:'🛶',digStick:'🦯',rod:'🎣',charcoal:'⚫',ochre:'🟥',bamboo:'🎋',banana:'🍌',fernShoot:'🌿',lotusSeed:'🪷',egg:'🥚',woodBowl:'🥣',woodSpoon:'🥄',woodStatue:'🗿',carvedPost:'🪵',stoneBracelet:'📿',bambooFlute:'🎶',wood:'🪵',stick:'🥢',stone:'🪨',fiber:'🌾',flint:'💠',clay:'🟤',hide:'🟫',bone:'🦴',rope:'➰',plank:'🟫',brick:'🧱',pot:'🏺',leather:'👜',copper:'🟢',flower:'🌼',feather:'🪶',
  berry:'🫐',mushroom:'🍄',toadstool:'🍄',honey:'🍯',meat:'🥩',meatCooked:'🍖',fish:'🐟',fishCooked:'🍢',grain:'🌾',bread:'🍞',stew:'🍲',gourd:'🍐',egg:'🥚',water:'💧',waterDirty:'🫗',tea:'🍵',mintwater:'🧉',
  medicine:'🧪',bandage:'🩹',salve:'🫙',smudge:'🌿',mugwort:'🌿',ginger:'🫚',turmeric:'🧡',centella:'☘️',mint:'🌱',aloe:'🪴',seedGrain:'🌱',seedFlax:'🌱',seedGourd:'🌱',flask:'🫙',needle:'🪡',
  coat:'🧥',boots:'🥾',furcoat:'🧥',axe:'🪓',pick:'⛏️',spear:'🔱',club:'🏏',hammer:'🔨',sickle:'🌙',knife:'🔪',torch:'🔥',craft:'🛠️',bag:'🎒',sleep:'💤'};
/* ---------- biểu tượng vật phẩm: chụp mô hình 3D, chưa có thì dùng hình vẽ tạm ---------- */
const ICO={url:{},q:[],busy:false,R:null};
function icon(id,cls){const u=ICO.url[id];if(!(id in ICO.url)&&window.THREE&&G.on&&ITEMS[id]&&!ICO.q.includes(id)){ICO.q.push(id);iconPump();}
  return `<span class="ic ${cls||''}" data-ic="${id}">${u?`<img src="${u}" alt="" draggable="false">`:`<b>${EMO[id]||'❔'}</b>`}</span>`;}
function iconPump(){if(ICO.busy||!ICO.q.length)return;ICO.busy=true;requestAnimationFrame(()=>{const t0=performance.now();try{while(ICO.q.length&&performance.now()-t0<20)iconMake(ICO.q.shift());}catch(e){console.warn('biểu tượng',e);}ICO.busy=false;if(ICO.q.length)setTimeout(iconPump,40);});}
function iconMake(id){const T=THREE;if(!ICO.R){const cv=document.createElement('canvas');ICO.R=new T.WebGLRenderer({canvas:cv,alpha:true,antialias:true,preserveDrawingBuffer:true});ICO.R.outputEncoding=T.sRGBEncoding;ICO.R.setPixelRatio(1);ICO.R.setSize(96,96,false);ICO.R.setClearColor(0,0);
    const sc=new T.Scene();sc.add(new T.HemisphereLight(0xfff4e6,0x40364a,0.75));const k=new T.DirectionalLight(0xfff0dc,1.35);k.position.set(-60,90,110);sc.add(k);const r=new T.DirectionalLight(0xbfd8ff,0.8);r.position.set(90,60,-120);sc.add(r);ICO.S=sc;}
  let g=null;const L=window.SBM&&SBM.list;const has=k=>!L||(L[k]||[]).includes(id);try{g=window.SBM&&SBM.item&&has('items')?SBM.item(id):null;}catch(e){}if(!g&&id.startsWith('sap_')&&window.SBM&&SBM.uprooted){const k=id.slice(4);try{g=SBM.uprooted(/^(mugwort|ginger|turmeric|centella|mint|aloe)$/.test(k)?'herb':/^flower/.test(k)?'flower':k);}catch(e){}}if(!g&&ITEMS[id]&&ITEMS[id].t==='tool'&&!has('tools')){ICO.url[id]='';return;}if(!g&&ITEMS[id]&&ITEMS[id].t==='tool')try{g=SBM&&SBM.tool?SBM.tool(id):null;}catch(e){}if(!g){ICO.url[id]='';return;}
  g.rotation.y=-0.6;g.updateMatrixWorld(true);const bb=new T.Box3().setFromObject(g),c=bb.getCenter(new T.Vector3()),sz=bb.getSize(new T.Vector3()),R=Math.max(sz.x,sz.y,sz.z)*0.62+1;
  const cam=new T.PerspectiveCamera(30,1,0.1,2000);const d=R/Math.tan(15*Math.PI/180);cam.position.set(c.x,c.y+d*0.55,c.z+d*0.84);cam.lookAt(c);ICO.S.add(g);ICO.R.render(ICO.S,cam);ICO.S.remove(g);
  const url=ICO.R.domElement.toDataURL('image/png');ICO.url[id]=url;document.querySelectorAll(`[data-ic="${id}"]`).forEach(el=>{const im=el.querySelector('img');if(im)im.src=url;else{const b=el.querySelector('b');if(b)b.remove();const n=document.createElement('img');n.src=url;n.alt='';n.draggable=false;el.appendChild(n);}});}
/* ---------- khung giao diện ---------- */
function uiInit(){try{G.hudMin=localStorage.getItem('ldtt-hudmin')==='1';}catch(e){}document.body.classList.toggle('hudmin',!!G.hudMin);const g=$('#game');g.insertAdjacentHTML('beforeend',`
  <div id="hud" class="hud"></div><div id="goal" class="goal"></div>
  <nav class="menu" id="menu">
    <button data-ui="bag" aria-label="Túi đồ"><span>🎒</span><i>Túi</i></button><button data-ui="craft" aria-label="Chế tạo"><span>🛠️</span><i>Chế tạo</i></button>
    <button data-ui="build" aria-label="Xây dựng"><span>🏠</span><i>Xây</i></button><button data-ui="map" aria-label="Bản đồ"><span>🗺️</span><i>Bản đồ</i></button><button data-ui="journal" aria-label="Nhật ký"><span>📜</span><i>Nhật ký</i></button><button data-ui="settings" aria-label="Cài đặt"><span>⚙️</span><i>Cài đặt</i></button></nav>
  <div id="hot" class="hot"></div><div id="tlabel" class="tlabel" hidden></div>
  <div id="joy" class="joy" aria-hidden="true"><div class="joy-r"><div class="joy-k"></div></div></div>
  <canvas id="mini" class="mini" data-ui="map" aria-label="Bản đồ nhỏ"></canvas><div id="xh" class="xh" hidden></div><div id="compass" class="compass"></div><div id="regban" class="regban" hidden></div><div id="work" class="work" hidden></div>
  <div class="acts"><button id="throwBtn" class="rbtn sm" aria-label="Ném" hidden>🎯<i>Ném</i></button><button id="sneakBtn" class="rbtn sm" aria-label="Lom khom">🐾<i>Khom</i></button><button id="sitBtn" class="rbtn sm" aria-label="Ngồi nghỉ">🪵<i>Ngồi</i></button><button id="runBtn" class="rbtn" aria-label="Chạy">🏃<i>Chạy</i></button><button id="jumpBtn" class="rbtn" aria-label="Nhảy">⤒<i>Nhảy</i></button><button id="actBtn" class="actbtn" aria-label="Hành động"><span class="ab-ic">✋</span><span class="ab-t">Hành động</span></button></div>
  <div id="buildBar" class="buildbar" hidden></div><div id="panel" class="panel" hidden></div><div id="toasts" class="toasts"></div><div id="fade" class="fade"></div><div id="overlay" class="overlay" hidden></div>`);
  document.addEventListener('click',uiClick);}
function uiClick(e){if(e.target&&!document.contains(e.target)&&e.clientX!=null){const el=document.elementFromPoint(e.clientX,e.clientY);if(el)e={target:el,clientX:e.clientX,clientY:e.clientY,preventDefault(){},stopPropagation(){}};}if(e.target.closest&&e.target.closest('#hud')){G.hudMin=!G.hudMin;document.body.classList.toggle('hudmin',G.hudMin);try{localStorage.setItem('ldtt-hudmin',G.hudMin?'1':'0');}catch(er){}G._hudh=null;return;}if(e.target.closest&&e.target.closest('#goal')){document.body.classList.toggle('goalopen');return;}const b=e.target.closest('[data-ui]');if(b){e.preventDefault();sfx('pick');const k=b.dataset.ui;if(k==='close'){uiClose();return;}if(G.panel===k){uiClose();return;}uiOpen(k,{});return;}
  const a=e.target.closest('[data-a]');if(!a)return;const d=a.dataset;sfx('pick');
  switch(d.a){case 'mz':mapAct(d.v);break;case 'tab':G.ptab=d.t;uiOpen('bag',G.popt||{},true);break;case 'bcat':G.bcat=d.c;uiOpenRefresh();break;
    case 'slot':uiSlot(+d.i);break;case 'use':{const s=S.inv[+d.i];if(s){const I=ITEMS[s.id];if(I.t==='boat'){boatLaunch(s.id);}else if(I.t==='sap'){plantUse(s.id);}else if(I.play){flutePlay();}else if(I.t==='wear')wearItem(+d.i);else if(I.t==='tool'){if(+d.i<HOTN){S.sel=+d.i;equip(s.id);}else{const tmp=S.inv[S.sel];S.inv[S.sel]=s;S.inv[+d.i]=tmp;equip(s.id);}uiHotbar();uiOpenRefresh();}else eat(s.id);}break;}
    case 'drop':{const s=S.inv[+d.i];if(s){s.n--;if(s.n<=0)S.inv[+d.i]=null;G.selSlot=null;uiHotbar();uiOpenRefresh();save();}break;}
    case 'unwear':unwear(d.s);break;
    case 'craft':{const r=RECIPES.find(x=>x.id===d.r);if(r){craft(r,+d.n||1);uiOpenRefresh();}break;}
    case 'build':uiClose();buildBegin(d.b);break;
    case 'st':G.cst=d.s;uiOpenRefresh();break;
    case 'fuel':addFuel(BYID.get(+d.b),d.i);uiOpenRefresh();break;
    case 'xfer':{const B=G.popt&&G.popt.b;if(!B)break;const st=S.store[B.id];const from=d.f==='inv'?S.inv:st,to=d.f==='inv'?st:S.inv,i=+d.i,s=from[i];if(!s)break;const left=slotsAdd(to,s.id,s.n);if(left===s.n){uiToast('Hết chỗ chứa.','bad');break;}if(left>0)s.n=left;else from[i]=null;uiHotbar();uiOpenRefresh();save();break;}
    case 'bb':buildBtn(d.k);break;
    case 'start':uiNewGame();break;case 'cont':uiOverlay(false);startGame();break;case 'newf':uiOpen('start',{cont:false,form:1});break;
    case 'look':G.nlook=+d.i;document.querySelectorAll('.lk').forEach(x=>x.classList.toggle('on',+x.dataset.i===G.nlook));break;
    case 'mode':G.nmode=d.m;document.querySelectorAll('.md').forEach(x=>x.classList.toggle('on',x.dataset.m===G.nmode));break;
    case 'snd':AU.on=!AU.on;if(!AU.on&&AU.rain)AU.rain.gain.value=0;uiOpenRefresh();break;
    case 'q':G.q=+d.v;G.noAdapt=true;G.prK=1;try{localStorage.setItem('ldtt-qu',String(G.q));}catch(er){}applyQ();uiOpenRefresh();break;
    case 'view':if((d.v==='fp')!==isFP())viewToggle();uiOpenRefresh();break;
    case 'trade':case 'gift':case 'learn':case 'recruit':npcAction(d.a,d.i);break;
    case 'job':if(G.folkCur){G.folkCur.job=d.j;G.folkCur._st='idle';save();uiOpenRefresh();}break;
    case 'wstop':workStop('Đã dừng tay.');break;
    case 'reset':if(G.resetArm){try{localStorage.removeItem(SKEY);}catch(e){}location.reload();}else{G.resetArm=1;uiOpenRefresh();}break;
    case 'recap':uiOverlay(false);G.paused=false;break;
    case 'cure':uiToast(d.t,'');break;}}
/* ---------- thanh chỉ số ---------- */
const BAR=[['hp','❤️','Máu','#e0533a'],['food','🍖','No bụng','#e0913f'],['water','💧','Nước','#4ab0e0'],['stam','⚡','Thể lực','#f2c230'],['warm','🔥','Thân nhiệt','#ff7a50']];
function uiHud(force){if(!S)return;const p=S.p,h=Math.floor(S.hour),mi=Math.floor((S.hour-h)*60),si=seasonIdx(),wx=S.wx?S.wx.type:'clear',wic={clear:isNight()?'🌙':'☀️',cloudy:'☁️',rain:'🌧️',storm:'⛈️',snow:'🌨️'}[wx];
  const T=G.tempC!=null?Math.round(G.tempC):'';const ms=typeof maxStam==='function'?maxStam():100;
  const bars=BAR.map(([k,ic,n,c])=>{const v=k==='stam'?p.stam/ms*100:p[k];const low=v<25;return `<div class="bar${low?' low':''}" title="${n}: ${Math.round(v)}"><span>${ic}</span><i style="--v:${clamp(v,0,100)}%;--c:${c}"></i></div>`;}).join('');
  const st=Object.keys(S.st||{}).map(k=>`<button class="sch" style="--c:${STATUS[k].col}" data-a="cure" data-t="${esc(STATUS[k].n+': '+STATUS[k].d+(STATUS[k].cure?' Chữa: '+ITEMS[STATUS[k].cure].n:''))}">${STATUS[k].n}</button>`).join('')+(p.wet>40?'<span class="sch" style="--c:#7fb8ff">Ướt</span>':'')+(p.warm<25?'<span class="sch" style="--c:#9fd8ff">Rét</span>':'')+((S.p.clean??90)<25?'<span class="sch" style="--c:#b8a27a">Bẩn: nên tắm</span>':'')+(S.buff&&S.buff.rested>TNOW()?'<span class="sch good" style="--c:#8ce07a">Khỏe khoắn</span>':'')+(S.p.repel>TNOW()?'<span class="sch good" style="--c:#b8e07a">Xua muỗi</span>':'');
  const html=`<div class="h-top"><b class="h-av">${esc((S.name||'?')[0])}</b><div class="h-id"><b>${esc(S.name)}</b><span>${AGES[S.age||0].n}</span></div></div>
    <div class="h-time">Ngày ${S.day} · ${SEASONS[si].ic} ${SEASONS[si].n} · ${String(h).padStart(2,'0')}:${String(mi).padStart(2,'0')} ${wic} ${T!==''?T+'°C':''}</div><div class="bars">${bars}</div><div class="schs">${st}</div>`;
  const el=$('#hud');if(el._h!==html){el._h=html;el.innerHTML=html;const hh=Math.round(el.offsetHeight+8)+'px';if(G._hudh!==hh){G._hudh=hh;document.documentElement.style.setProperty('--hudh',hh);}}
  const g=GOALS[S.goal];const gh=g?`<div class="g-k">Mục tiêu ${S.goal+1}/${GOALS.length}</div><b>${esc(g.t)}</b><p>${esc(g.d)}</p>${(()=>{const [v,n]=goalProg(g);return n>1?`<div class="g-p"><i style="--v:${v/n*100}%"></i><span>${v}/${n}</span></div>`:'';})()}`:'<div class="g-k">Tự do</div><b>Bạn đã hoàn thành mọi mục tiêu!</b><p>Hãy xây bộ lạc theo ý mình.</p>';
  const ge=$('#goal');if(ge._h!==gh){ge._h=gh;ge.innerHTML=gh;}}
function uiHotbar(){if(!S)return;const h=[];for(let i=0;i<HOTN;i++){const s=S.inv[i];h.push(`<button class="hs${i===S.sel?' on':''}" data-hot="${i}" aria-label="${s?esc(ITEMS[s.id].n):'Ô trống'}">${s?icon(s.id)+(s.n>1?`<em>${s.n}</em>`:''):''}<small>${i+1}</small></button>`);}$('#hot').innerHTML=h.join('');}
function hotClick(i){const s=S.inv[i];if(!s){S.sel=i;equip(null);uiHotbar();return;}const I=ITEMS[s.id];if(I.t==='tool'){S.sel=i;equip(P.toolId===s.id&&S.sel===i&&G.lastHot===i?null:s.id);G.lastHot=i;uiHotbar();}else if(I.t==='wear')wearItem(i);else eat(s.id);}
/* ---------- nhãn mục tiêu & nút hành động ---------- */
function uiTarget(t){const el=$('#tlabel'),ab=$('#actBtn');const inf=t?targetInfo(t):null;
  if(!inf){if(!el.hidden)el.hidden=true;const k0=G.build?'b':'n';if(ab._k0!==k0||el.dataset.k){ab._k0=k0;el.dataset.k='';ab.classList.remove('on');ab.querySelector('.ab-t').textContent=G.build?'Đặt':'Hành động';ab.querySelector('.ab-ic').innerHTML=G.build?'✔️':'✋';}return;}
  let x,y;if(isFP()){x=innerWidth/2;y=innerHeight/2+46;}else{const wp=t.type==='res'?[t.q.x,t.q.y+(RT[t.q.t].fall?60:22),t.q.z]:t.type==='animal'?[t.a.x,t.a.y+34,t.a.z]:t.type==='water'?[t.x,4,t.z]:t.type==='drop'?[t.o.x,t.o.y+8,t.o.z]:t.type==='pet'?[t.p.x,24,t.p.z]:t.type==='foe'?[t.a.x,t.a.y+44,t.a.z]:t.type==='chest'?[G.camp.x+20,30,G.camp.z+10]:t.type==='npc'?[t.n.x,44,t.n.z]:t.type==='folk'?[t.f.x,44,t.f.z]:t.type==='boat'?[t.b.x,12,t.b.z]:t.type==='leave'?[P.x,40,P.z]:[t.b.x,t.b.y+40,t.b.z];
  const v=new THREE.Vector3(...wp).project(G.cam);x=(v.x*0.5+0.5)*innerWidth;y=(-v.y*0.5+0.5)*innerHeight;}if(el.hidden)el.hidden=false;const tf=`translate(${Math.round(x)}px,${Math.round(y)}px)`;if(el._tf!==tf){el._tf=tf;el.style.transform=tf;}
  const key=inf.name+inf.verb+(inf.need||'')+(inf.warn||'');if(el.dataset.k!==key){el.dataset.k=key;el.innerHTML=`<b>${esc(inf.name)}</b><span class="${inf.ok?'':'no'}">${inf.ok?'<kbd>E</kbd> '+esc(inf.verb):'Cần '+esc(inf.need||'')}</span>${inf.warn?`<em>${esc(inf.warn)}</em>`:''}`;
    ab.querySelector('.ab-t').textContent=inf.ok?inf.verb:'Cần '+(inf.need||'');ab.querySelector('.ab-ic').innerHTML=icon(inf.icon);ab._k0='';}if(ab.classList.contains('on')!==!!inf.ok)ab.classList.toggle('on',!!inf.ok);}
/* ---------- thông báo, chữ bay, đồ bay vào túi ---------- */
function uiToast(t,k){const el=$('#toasts');if(!el)return;const ms=k==='bad'||k==='gold'||k==='idea'?4200:2600;
  for(const o of el.children){if(o._t===t&&!o.classList.contains('out')){o._n=(o._n||1)+1;o.dataset.n='×'+o._n;clearTimeout(o._h);o._h=setTimeout(()=>{o.classList.add('out');setTimeout(()=>o.remove(),400);},ms);if(o!==el.firstChild)el.prepend(o);return;}}
  const d=document.createElement('div');d.className='toast '+(k||'');d.textContent=t;d._t=t;el.prepend(d);while(el.children.length>3)el.lastChild.remove();d._h=setTimeout(()=>{d.classList.add('out');setTimeout(()=>d.remove(),400);},ms);}
function scr(x,y,z){const v=new THREE.Vector3(x,y,z).project(G.cam);return [(v.x*0.5+0.5)*innerWidth,(-v.y*0.5+0.5)*innerHeight];}
function uiFloat(t,x,y,z,col){if(!G.on)return;const [sx,sy]=scr(x,y,z);const d=document.createElement('div');d.className='flt';d.textContent=t;d.style.left=sx+'px';d.style.top=sy+'px';if(col)d.style.color=col;$('#game').appendChild(d);setTimeout(()=>d.remove(),1200);}
function uiFly(id,n,src){if(!G.on)return;const [sx,sy]=src?scr(src[0],src[1],src[2]):[innerWidth/2,innerHeight/2];const tg=document.querySelector('#menu [data-ui="bag"]').getBoundingClientRect();
  const d=document.createElement('div');d.className='fly';d.innerHTML=icon(id)+`<b>+${n}</b>`;d.style.left=sx+'px';d.style.top=sy+'px';$('#game').appendChild(d);
  requestAnimationFrame(()=>{d.style.transform=`translate(${tg.left+tg.width/2-sx}px,${tg.top+tg.height/2-sy}px) scale(.5)`;d.style.opacity='0.2';});setTimeout(()=>d.remove(),900);
  uiFloat(`+${n} ${ITEMS[id].n}`,src?src[0]:P.x,src?src[1]+10:P.y+40,src?src[2]:P.z);}
function uiFade(cb){const f=$('#fade');f.classList.add('on');G.paused=true;setTimeout(()=>{try{cb&&cb();}finally{setTimeout(()=>{f.classList.remove('on');G.paused=false;},350);}},800);}
function uiAge(i){const A=AGES[i];const d=document.createElement('div');d.className='ageup';d.innerHTML=`<small>Bộ lạc bước sang</small><b>${esc(A.n)}</b><p>${esc(A.d)}</p>`;$('#game').appendChild(d);sfx('level');setTimeout(()=>d.remove(),5200);}
function uiRecap(list){if(!list.length)return;G.paused=true;uiOverlay(true,`<div class="ov-card"><h2>Một ngày đã qua</h2><p>Hôm qua bạn đã ${esc(list.join(', '))}.</p><p class="muted">Ngày ${S.day} · Mùa ${SEASONS[seasonIdx()].n}. ${['Mùa xuân mưa nhiều, cây cối lớn nhanh.','Mùa hạ nắng nóng: nhớ mang theo nước.','Mùa thu: tích trữ thức ăn, củi và may áo ấm.','Mùa đông giá rét: ở gần lửa và dưới mái nhà.'][seasonIdx()]}</p><button class="btn big" data-a="recap">Ngày mới</button></div>`);}
function uiLoading(on){uiOverlay(on,on?'<div class="ov-card"><div class="spin"></div><p>Đang tạo thế giới…</p></div>':'');}
function uiError(t){uiOverlay(true,`<div class="ov-card"><h2>Ôi!</h2><p>${esc(t)}</p><button class="btn" onclick="location.reload()">Tải lại</button></div>`);}
function uiOverlay(on,html){const o=$('#overlay');o.hidden=!on;if(on)o.innerHTML=html;}
/* ---------- bảng: túi đồ, chế tạo, kỹ năng, xây dựng, nhật ký, rương, cài đặt ---------- */
function uiClose(){$('#panel').hidden=true;G.panel=null;G.selSlot=null;G.resetArm=0;document.body.classList.remove('pan');}
function uiOpenRefresh(){if(G.panel)uiOpen(G.panel,G.popt||{},true);}
function uiOpen(k,o,keep){o=o||{};if(k==='start'){uiStart(o);return;}if(!G.on||!k)return;if(G.build)buildEnd();G.popt=o;
  if(k==='craft'){k='bag';G.ptab='craft';if(!keep)G.cst=o.st||null;}else if(k==='bag'&&!keep){G.ptab='bag';}G.panel=k;const p=$('#panel');p.hidden=false;document.body.classList.add('pan');
  let body='',title='';
  if(k==='bag'){title='Hành trang';const tabs=[['bag','Túi đồ'],['craft','Chế tạo'],['skill','Kỹ năng']].map(([t,n])=>`<button class="tb${G.ptab===t?' on':''}" data-a="tab" data-t="${t}">${n}</button>`).join('');body=`<div class="tabs">${tabs}</div>`+(G.ptab==='craft'?craftHtml():G.ptab==='skill'?skillHtml():bagHtml());}
  else if(k==='build'){title='Xây dựng';body=buildHtml();}else if(k==='journal'){title='Nhật ký & Sổ tay';body=journalHtml();}else if(k==='store'){const d=pieceDef(o.b.k);title=d.n;body=storeHtml(o.b);}else if(k==='settings'){title='Cài đặt';body=settingsHtml();}else if(k==='map'){title='Bản đồ';body=mapHtml();}else if(k==='npc'){title=G.npcCur?G.npcCur.def.n+' · '+ROLEN[G.npcCur.def.role]:'';body=npcHtml();}else if(k==='folk'){title=G.folkCur?G.folkCur.n+' · người nhà':'';body=folkHtml();}
  const sc=p.querySelector('.p-body')?p.querySelector('.p-body').scrollTop:0;p.innerHTML=`<div class="p-head"><h2>${esc(title)}</h2><button class="p-x" data-ui="close" aria-label="Đóng">✕</button></div><div class="p-body">${body}</div>`;if(keep)p.querySelector('.p-body').scrollTop=sc;if(k==='map')requestAnimationFrame(mapDraw);if(document.pointerLockElement)document.exitPointerLock();}
function bagHtml(){const sel=G.selSlot;const slots=S.inv.map((s,i)=>`<button class="sl${i<HOTN?' hb':''}${sel===i?' on':''}" data-a="slot" data-i="${i}">${s?icon(s.id)+(s.n>1?`<em>${s.n}</em>`:''):''}</button>`).join('');
  let det='<p class="muted small">Chạm một ô để xem. Chạm ô khác để đổi chỗ. Hàng đầu là thanh công cụ (phím 1–6).</p>';
  if(sel!=null&&S.inv[sel]){const s=S.inv[sel],I=ITEMS[s.id];const use=I.t==='boat'?'Thả xuống nước':I.t==='sap'?'Trồng':I.play?'Thổi sáo':I.t==='food'?'Ăn':I.t==='drink'?'Uống':I.t==='med'?'Dùng':I.t==='wear'?'Mặc':I.t==='tool'?'Cầm lên tay':I.t==='herb'&&I.food?'Ăn':'';
    const info=[I.food?`+${I.food} no`:'',I.drink?`+${I.drink} nước`:'',I.hp?`+${I.hp*2} máu`:'',I.warm?`+${I.warm} ấm`:'',I.cure?`chữa ${STATUS[I.cure].n}`:'',I.raw?'ăn sống dễ ngộ độc':'',I.poison?'CÓ ĐỘC':'',I.dirty?'có thể gây đau bụng':'',I.repel?'xua muỗi 1 ngày':''].filter(Boolean).join(' · ');
    det=`<div class="det">${icon(s.id,'big')}<div><b>${esc(I.n)}</b> <span class="muted">×${s.n}</span><p class="small">${esc(info||({res:'Nguyên liệu',herb:'Thảo dược: dùng trong bài thuốc',seed:'Hạt giống: gieo trên luống đất',tool:'Công cụ'}[I.t]||''))}</p>
      <div class="row">${use?`<button class="btn" data-a="use" data-i="${sel}">${use}</button>`:''}<button class="btn ghost" data-a="drop" data-i="${sel}">Bỏ 1</button></div></div></div>`;}
  const wear=['body','feet'].map(k=>{const id=S.wear[k];return `<div class="wear">${id?icon(id):'<span class="ic"><b>'+(k==='body'?'👕':'🦶')+'</b></span>'}<span>${k==='body'?'Áo':'Giày'}: ${id?esc(ITEMS[id].n):'—'}</span>${id?`<button class="btn sm ghost" data-a="unwear" data-s="${k}">Cởi</button>`:''}</div>`;}).join('');
  return `<div class="grid6">${slots}</div>${det}<h3>Đang mặc · ấm +${wearWarm()}</h3><div class="wears">${wear}</div>`;}
function uiSlot(i){if(G.selSlot!=null&&G.selSlot!==i){const a=S.inv[G.selSlot],b=S.inv[i];if(a&&b&&a.id===b.id&&maxStack(a.id)>1){const k=Math.min(a.n,maxStack(b.id)-b.n);b.n+=k;a.n-=k;if(!a.n)S.inv[G.selSlot]=null;}else{S.inv[G.selSlot]=b;S.inv[i]=a;}G.selSlot=null;equip(selTool());uiHotbar();save();}
  else G.selSlot=G.selSlot===i?null:i;uiOpenRefresh();}
function chips(c){return Object.entries(c).map(([k,v])=>{const h=haveCount(k);return `<span class="chip${h>=v?'':' no'}">${icon(k)}${h}/${v}</span>`;}).join('');}
function craftHtml(){const known=RECIPES.filter(r=>S.known['r:'+r.id]);const sts=[...new Set(known.map(r=>r.st||'hand'))];const cur=G.cst||null;
  const filt=`<div class="chipsel"><button class="tb sm${!cur?' on':''}" data-a="st" data-s="">Tất cả</button>${sts.map(s=>`<button class="tb sm${cur===s?' on':''}" data-a="st" data-s="${s}">${s==='hand'?'Tay không':ST_N[s]}</button>`).join('')}</div>`;
  const list=known.filter(r=>!cur||(r.st||'hand')===cur).map(r=>{const out=Object.keys(r.out)[0],I=ITEMS[out],bl=recipeBlock(r);return {r,out,I,bl};}).sort((a,b)=>(a.bl?1:0)-(b.bl?1:0));
  const cards=list.map(({r,out,I,bl})=>`<div class="rc${bl?' dim':''}">${icon(out,'big')}<div class="rc-b"><b>${esc(I.n)}${r.out[out]>1?' ×'+r.out[out]:''}</b><div class="chips">${chips(r.in)}</div>
    <span class="small muted">${r.st?'Tại '+ST_N[r.st]:'Làm bằng tay'}${r.tool?' · cần '+ITEMS[r.tool].n:''}${r.lv?' · '+lvText(r.lv):''}</span>${bl?`<span class="small warn">${esc(bl)}</span>`:''}</div>
    <div class="rc-a"><button class="btn sm" data-a="craft" data-r="${r.id}" ${bl?'disabled':''}>Làm</button>${bl?'':`<button class="btn sm ghost" data-a="craft" data-r="${r.id}" data-n="5">×5</button>`}</div></div>`).join('');
  let fb=null,fd=1e9;if(cur&&cur!=='hand')for(const b of S.builds){const d=pieceDef(b.k);if(d&&d.st===cur&&d.fuel){const dd=Math.hypot(b.x-P.x,b.z-P.z);if(dd<fd){fd=dd;fb=b;}}}if(fd>130)fb=null;
  const fuel=fb?`<div class="fuel"><div class="fuel-t"><b>🔥 ${esc(pieceDef(fb.k).n)}: ${fireLit(fb)?'còn '+fuelText(S.fuel[fb.id]):'đã tắt'}</b><i style="--v:${Math.min(100,(S.fuel[fb.id]||0)/24*100)}%"></i></div><span><button class="btn sm" data-a="fuel" data-b="${fb.id}" data-i="wood"${invCount('wood')<1?' disabled':''}>+1 Gỗ · 4 giờ</button><button class="btn sm ghost" data-a="fuel" data-b="${fb.id}" data-i="stick"${invCount('stick')<1?' disabled':''}>+1 Cành · 1 giờ</button></span></div>`:'';
  const lockN=RECIPES.length-known.length;return fuel+filt+(cards||'<p class="muted">Chưa có công thức nào ở đây.</p>')+(lockN?`<p class="hint">🔒 Còn ${lockN} công thức chưa học được. Nhặt nguyên liệu mới và luyện kỹ năng để nghĩ ra thêm.</p>`:'');}
function skillHtml(){return `<p class="small muted">Con người học bằng cách làm: chặt cây giỏi Đốn gỗ, hái thuốc giỏi Thảo dược… Lên cấp sẽ làm nhanh hơn và mở được công thức khó hơn.</p>`+Object.keys(SKILL).map(k=>{const lv=skLv(k),xp=S.sk[k]||0,a=12*lv*lv,b=12*(lv+1)*(lv+1);
  const next=[...RECIPES.filter(r=>r.lv&&r.lv[k]===lv+1).map(r=>ITEMS[Object.keys(r.out)[0]].n),...BUILD.filter(x=>x.lv&&x.lv[k]===lv+1).map(x=>x.n)];
  return `<div class="sk"><div class="spread"><b>${SKILL[k]}</b><span class="lv">Cấp ${lv}</span></div><div class="g-p"><i style="--v:${(xp-a)/(b-a)*100}%"></i><span>${Math.floor(xp-a)}/${b-a}</span></div><span class="small muted">${esc(skillPerk(k))}${next.length?' · cấp '+(lv+1)+' mở: '+esc(next.join(', ')):''}</span></div>`;}).join('');}
function buildHtml(){const cat=G.bcat||'co';const tabs=BCAT.map(([c,n])=>`<button class="tb sm${cat===c?' on':''}" data-a="bcat" data-c="${c}">${n}</button>`).join('');
  const items=BUILD.filter(b=>b.cat===cat);const cards=items.map(b=>{const kn=S.known['b:'+b.id];if(!kn)return `<div class="bc lock"><span class="ic"><b>🔒</b></span><div><b>???</b><span class="small muted">${esc(lockHint(b))}</span></div></div>`;
    const ok=canPay(b.cost)&&lvOk(b.lv);return `<button class="bc${ok?'':' dim'}" data-a="build" data-b="${b.id}"><span class="ic big"><b>${{campfire:'🔥',leanto:'⛺',torch:'🔦',workbench:'🛠️',basket:'🧺',floor:'🟫',wall:'🧱',wallDoor:'🚪',wallWindow:'🪟',roof:'🛖',roofCap:'🛖',fence:'🚧',gate:'🚧',bed:'🛏️',dryRack:'🥓',tanRack:'🟫',farm:'🌱',chest:'🧰',hearth:'♨️',kiln:'🏺',stoneFloor:'⬜',stoneWall:'🧱',stoneWallDoor:'🚪',tent:'⛺',well:'🪣',totem:'🗿',smelter:'🔥'}[b.id]||'🏠'}</b></span><div><b>${esc(b.n)}</b><div class="chips">${chips(b.cost)}</div><span class="small muted">${esc(b.d)}${b.lv?' · '+lvText(b.lv):''}</span></div></button>`;}).join('');
  return `<div class="chipsel">${tabs}</div><div class="bgrid">${cards}</div><p class="hint">Đặt: chạm ✔ hoặc nhấp chuột. Xoay: nút ⟲ hoặc phím R. Phá dỡ được hoàn lại ${S.mode==='cozy'?'đủ':'một nửa'} vật liệu.</p>`;}
function lockHint(b){const miss=(b.req||[]).filter(k=>!S.seen[k]).map(k=>ITEMS[k].n);if(miss.length)return 'Cần tìm thấy: '+miss.join(', ');if(b.need&&!(S.cnt['build:'+b.need]))return 'Cần dựng '+pieceDef(b.need).n+' trước';if(b.lv)return 'Cần '+lvText(b.lv);return '';}
function journalHtml(){const ag=AGES[S.age||0],nx=AGES[(S.age||0)+1];const goals=GOALS.map((g,i)=>{if(i>S.goal+2)return '';const [v,n]=goalProg(g);const st=i<S.goal?'done':i===S.goal?'cur':'next';return `<div class="jg ${st}"><b>${i<S.goal?'✔':i===S.goal?'➤':'○'} ${esc(g.t)}</b>${i>=S.goal?`<span class="small muted">${esc(g.d)}</span>${n>1&&i===S.goal?`<div class="g-p"><i style="--v:${v/n*100}%"></i><span>${v}/${n}</span></div>`:''}`:''}</div>`;}).join('');
  const sts=Object.entries(STATUS).map(([k,s])=>`<li><b style="color:${s.col}">${s.n}</b>: ${esc(s.d)}${s.cure?' Chữa: <b>'+ITEMS[s.cure].n+'</b>.':''}</li>`).join('');
  return `<div class="age"><small>Thời đại</small><b>${esc(ag.n)}</b><p class="small">${esc(ag.d)}</p>${nx?`<p class="small muted">Tiếp theo: <b>${esc(nx.n)}</b> · ${esc(nx.d)}</p>`:''}</div><h3>Mục tiêu</h3>${goals}
    <h3>Sổ tay sinh tồn</h3><ul class="tips"><li><b>Bốn mùa</b>: mỗi mùa ${SEASON_DAYS} ngày. Xuân mưa nhiều cây lớn nhanh; Hạ nóng khát nhanh; Thu lá vàng, nhiều nấm; Đông tuyết lạnh, cây trồng ngừng lớn.</li>
    <li><b>Thân nhiệt</b>: mưa ướt và gió rét làm lạnh dần. Lửa, mái nhà, áo da giữ ấm. Rét lâu dễ cảm lạnh.</li><li><b>Nước</b>: nước suối có thể làm đau bụng. Đun sôi bằng nồi gốm ở bếp lửa, hoặc múc ở giếng.</li>
    <li><b>Thú vật</b>: thỏ và nai chạy trốn; lợn rừng húc khi bị đánh; sói đi săn ban đêm; gấu nâu giữ lãnh thổ, mùa đông ngủ trong hang.</li><li><b>Côn trùng</b>: muỗi ven sông lúc chạng vạng gây sốt; ong đốt khi lấy mật (cầm đuốc hun khói).</li><li><b>Bắt cá</b>: cầm giáo đứng sát mép nước rồi bấm hành động để đâm cá. Cá sống nên nướng chín.</li><li><b>Lửa</b>: bếp lửa cần củi (1 gỗ cháy 4 giờ). Mưa ngoài trời làm lửa mau tàn, nên dựng bếp dưới mái.</li>${sts}</ul>`;}
function storeHtml(b){const st=S.store[b.id]||(S.store[b.id]=Array(pieceDef(b.k).store).fill(null));const g=(arr,f)=>arr.map((s,i)=>`<button class="sl" data-a="xfer" data-f="${f}" data-i="${i}">${s?icon(s.id)+(s.n>1?`<em>${s.n}</em>`:''):''}</button>`).join('');
  return `<p class="small muted">Chạm một ô để chuyển cả chồng sang bên kia. Đồ trong giỏ gần đó vẫn dùng được khi chế tạo và xây dựng.</p><h3>${esc(pieceDef(b.k).n)}</h3><div class="grid6">${g(st,'st')}</div><h3>Túi đồ</h3><div class="grid6">${g(S.inv,'inv')}</div>`;}
function settingsHtml(){return `<div class="set"><b>Góc nhìn</b><span><button class="tb sm${isFP()?' on':''}" data-a="view" data-v="fp">Thứ nhất</button><button class="tb sm${!isFP()?' on':''}" data-a="view" data-v="tp">Từ trên cao</button></span></div><div class="set"><b>Âm thanh</b><button class="btn sm" data-a="snd">${AU.on?'Đang bật':'Đang tắt'}</button></div>
  <div class="set"><b>Đồ họa</b><span>${[['2','Đẹp'],['1','Vừa'],['0','Nhẹ']].map(([v,n])=>`<button class="tb sm${String(G.q)===v?' on':''}" data-a="q" data-v="${v}">${n}</button>`).join('')}</span></div>
  <div class="set"><b>Chế độ</b><span>${S.mode==='cozy'?'Thong thả: đói khát chỉ làm chậm, thú ít hung dữ':'Sinh tồn: đói, khát, rét, thú dữ đều nguy hiểm'}</span></div>
  <h3>Điều khiển</h3><ul class="tips"><li><b>Máy tính</b>: WASD đi · Shift chạy · Space nhảy · E hành động · nhấp chuột để đi tới/làm · chuột phải kéo để xoay · lăn chuột phóng to · 1–6 chọn công cụ · B xây · I túi · C chế tạo · J nhật ký.</li>
  <li><b>Điện thoại</b>: cần điều khiển bên trái · nút tròn lớn để làm · chạm vào vật để đi tới · hai ngón để xoay và phóng to.</li></ul>
  <div class="set"><b>Chơi lại từ đầu</b><button class="btn sm ${G.resetArm?'red':'ghost'}" data-a="reset">${G.resetArm?'Bấm lần nữa để xóa thế giới này':'Tạo thế giới mới'}</button></div>`;}
/* ---------- thanh xây dựng ---------- */
function uiBuildBar(on,def,why){const el=$('#buildBar');document.body.classList.toggle('building',!!on);if(!on){el.hidden=true;return;}el.hidden=false;const rm=G.build&&G.build.rm;
  el.innerHTML=`<div class="bb-i"><b>${rm?'Phá dỡ công trình':esc(def.n)}</b>${rm?'<span class="small">Chạm ✔ vào công trình muốn phá</span>':`<div class="chips">${chips(def.cost)}</div>${why?`<span class="small warn">${esc(why)}</span>`:'<span class="small ok">Đặt được</span>'}`}</div>
    <div class="bb-b"><button class="btn sm ghost" data-a="bb" data-k="rot" aria-label="Xoay">⟲</button><button class="btn sm ${rm?'red':'ghost'}" data-a="bb" data-k="rm" aria-label="Phá dỡ">🗑</button><button class="btn sm" data-a="bb" data-k="place" aria-label="Đặt">✔</button><button class="btn sm ghost" data-a="bb" data-k="exit" aria-label="Xong">✕</button></div>`;}
function buildBtn(k){if(!G.build)return;if(k==='rot'){const B=G.build;if(B.def.kind==='roof'&&!B.def.cap){B.r=((B.rman?B.r:(B.pos?B.pos.r:0))+1)%4;B.rman=1;}else B.r=(B.r+1)%4;}else if(k==='rm'){G.build.rm=!G.build.rm;G.build.g.visible=!G.build.rm;uiBuildBar(true,G.build.def);}else if(k==='place'){if(G.build.rm)buildRemoveAt();else buildPlace();}else if(k==='exit')buildEnd();}
/* ---------- màn bắt đầu ---------- */
function uiStart(o){const has=!!S&&o.cont;if(has&&!o.form){uiOverlay(true,`<div class="ov-card start"><div class="logo">🔥</div><h1>Lửa Đá</h1><p class="sub">Từ hai bàn tay trắng</p><p class="muted">${esc(S.name)} · Ngày ${S.day} · Mùa ${SEASONS[Math.floor((S.day-1)/SEASON_DAYS)%4].n}</p><button class="btn big" data-a="cont">Chơi tiếp</button><button class="btn ghost" data-a="newf">Thế giới mới</button></div>`);return;}
  G.nlook=G.nlook||0;G.nmode=G.nmode||'cozy';uiOverlay(true,`<div class="ov-card start form"><div class="logo">🔥</div><h1>Lửa Đá</h1><p class="sub">Từ hai bàn tay trắng</p>
   <p class="small">Bạn tỉnh dậy giữa thung lũng hoang sơ thời Sơn Vi, không có gì trong tay. Nhặt cành, ghè đá, nhóm lửa, học nghề, dựng nhà, trồng trọt, vượt qua bốn mùa và dẫn bộ lạc đi tới thời đồ đồng.</p>
   <label class="fld">Tên của bạn<input id="nName" maxlength="16" value="${esc(S&&S.name||'Lửa')}"></label>
   <div class="lks">${LOOKS.map((L,i)=>`<button class="lk${i===G.nlook?' on':''}" data-a="look" data-i="${i}"><span style="--sk:${L.o.skin};--tp:${L.o.top};--hr:${L.o.hair}"></span>${esc(L.n)}</button>`).join('')}</div>
   <div class="mds"><button class="md${G.nmode==='cozy'?' on':''}" data-a="mode" data-m="cozy"><b>Thong thả</b><small>Đói khát chỉ làm chậm, ngất thì tỉnh lại đủ đồ, thú ít hung dữ.</small></button><button class="md${G.nmode==='survival'?' on':''}" data-a="mode" data-m="survival"><b>Sinh tồn</b><small>Đói, khát, rét làm mất máu. Sói săn đêm, gấu hung dữ. Ngất rơi bớt đồ.</small></button></div>
   <button class="btn big" data-a="start">Bắt đầu</button></div>`);}
function uiNewGame(){const name=($('#nName')&&$('#nName').value||'Lửa').trim()||'Lửa';newGame({name,look:G.nlook||0,mode:G.nmode||'cozy'});uiOverlay(false);startGame();}
/* ---------- điều khiển: bàn phím, chuột, cảm ứng ---------- */
function inputInit(){const cv=$('#gl');
  addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;G.keys[e.code]=true;const k=e.code;
    if(k==='Space'){e.preventDefault();G.jumpReq=1;}if(k==='KeyE'||k==='KeyF'){if(G.build)buildBtn('place');else actStart(G.target);}if(k==='KeyV')viewToggle();if(G.build&&(k==='BracketRight'||k==='PageUp'))buildBtn('up');if(G.build&&(k==='BracketLeft'||k==='PageDown'))buildBtn('dn');if(k==='KeyM'){G.panel==='map'?uiClose():uiOpen('map',{});}if(k==='KeyZ')sneakToggle();if(k==='KeyX'&&!G.build)sitToggle();if(k==='KeyG')throwIt();
    if(k==='KeyR'){if(G.build)buildBtn('rot');else if(!isFP())G.yaw-=Math.PI/4;}if(k==='KeyQ'&&!G.build&&!isFP())G.yaw+=Math.PI/4;if(k==='KeyX'&&G.build)buildBtn('rm');
    if(k==='Escape'){if(G.build)buildEnd();else uiClose();}if(k==='KeyB'){if(G.panel==='build')uiClose();else uiOpen('build',{});}if(k==='KeyI'||k==='Tab'){e.preventDefault();G.panel==='bag'&&G.ptab==='bag'?uiClose():(G.ptab='bag',uiOpen('bag',{}));}
    if(k==='KeyC'){G.panel==='bag'&&G.ptab==='craft'?uiClose():uiOpen('craft',{});}if(k==='KeyJ')G.panel==='journal'?uiClose():uiOpen('journal',{});
    if(/^Digit[1-6]$/.test(k))hotClick(+k.slice(5)-1);});
  addEventListener('keyup',e=>{G.keys[e.code]=false;});addEventListener('blur',()=>{G.keys={};});addEventListener('resize',resize);
  // chuột
  let drag=null;cv.addEventListener('contextmenu',e=>e.preventDefault());
  cv.addEventListener('mousedown',e=>{if(isFP()){if(document.pointerLockElement===cv){if(e.button===0){auInit();if(G.build)buildBtn('place');else actStart(G.target);}else if(e.button===2)throwIt();}else{drag={fp:1,x:e.clientX,y:e.clientY,moved:0};}return;}if(e.button===2||e.button===1){drag={x:e.clientX,y:e.clientY,yaw:G.yaw,pitch:G.pitch};}});
  const look=(dx,dy,k)=>{P.ry-=dx*0.0024*k;G.fpitch=clamp((G.fpitch||0)-dy*0.0022*k,-1.3,1.25);};
  addEventListener('mousemove',e=>{if(isFP()){if(document.pointerLockElement===cv){look(e.movementX,e.movementY,1);return;}if(drag&&drag.fp){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.moved+=Math.abs(dx)+Math.abs(dy);drag.x=e.clientX;drag.y=e.clientY;look(dx,dy,1.6);}return;}G.mouse={x:e.clientX,y:e.clientY,recent:true};if(!drag&&typeof peekMouse==='function')peekMouse(e);if(drag){G.yaw=drag.yaw-(e.clientX-drag.x)*0.008;G.pitch=clamp(drag.pitch+(e.clientY-drag.y)*0.004,0.55,1.35);}});
  addEventListener('mouseup',e=>{if(drag&&drag.fp){const m=drag.moved;drag=null;if(m<6&&e.button===0&&e.target===cv){auInit();if(cv.requestPointerLock&&!G.noLock){try{const pr=cv.requestPointerLock();if(pr&&pr.catch)pr.catch(()=>{G.noLock=1;});}catch(er){G.noLock=1;}}if(G.build)buildBtn('place');else if(G.noLock||!cv.requestPointerLock)actStart(G.target);}return;}if(e.button!==0)drag=null;});
  cv.addEventListener('click',e=>{if(isFP())return;if(G.touchT&&performance.now()-G.touchT<600)return;worldTap(e.clientX,e.clientY);});
  cv.addEventListener('wheel',e=>{e.preventDefault();if(isFP())return;G.zoom=clamp(G.zoom*(e.deltaY>0?1.1:1/1.1),170,760);},{passive:false});
  // cảm ứng: cần điều khiển trái, chạm để đi/làm, hai ngón xoay & phóng
  const joy=$('#joy'),knob=joy.querySelector('.joy-k'),ring=joy.querySelector('.joy-r');let jid=null,jx=0,jy=0;const T={};
  cv.addEventListener('touchstart',e=>{G.touchT=performance.now();G.mouse=null;for(const t of e.changedTouches){if(jid===null&&t.clientX<innerWidth*0.42&&t.clientY>innerHeight*0.35){jid=t.identifier;jx=t.clientX;jy=t.clientY;ring.style.left=jx+'px';ring.style.top=jy+'px';joy.classList.add('on');G.joy.on=true;G.joy.x=G.joy.y=0;}
      else{const id=t.identifier,o=T[id]={x:t.clientX,y:t.clientY,t:performance.now(),sx:t.clientX,sy:t.clientY};o.lp=setTimeout(()=>{if(T[id]===o&&Object.keys(T).length===1&&Math.hypot(o.x-o.sx,o.y-o.sy)<14){o.peek=1;peekShow(o.sx,o.sy-40,2600);}},420);}}
    const ids=Object.keys(T);if(ids.length===2){const a=T[ids[0]],b=T[ids[1]];G.pinch={d:Math.hypot(a.x-b.x,a.y-b.y),ang:Math.atan2(b.y-a.y,b.x-a.x),z:G.zoom,yaw:G.yaw};}},{passive:true});
  cv.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches){if(t.identifier===jid){let dx=t.clientX-jx,dy=t.clientY-jy;const m=Math.hypot(dx,dy),R=48;if(m>R){dx=dx/m*R;dy=dy/m*R;}knob.style.transform=`translate(${dx}px,${dy}px)`;G.joy.x=dx/R;G.joy.y=dy/R;G.runAuto=m>R*1.6;}
      else if(T[t.identifier]){const o=T[t.identifier];if(Object.keys(T).length===1){if(isFP())look(t.clientX-o.x,t.clientY-o.y,1.9);else{G.yaw-=(t.clientX-o.x)*0.008;G.pitch=clamp(G.pitch+(t.clientY-o.y)*0.005,0.35,1.35);}}o.x=t.clientX;o.y=t.clientY;}}
    const ids=Object.keys(T);if(ids.length===2&&G.pinch&&!isFP()){const a=T[ids[0]],b=T[ids[1]];const d=Math.hypot(a.x-b.x,a.y-b.y),ang=Math.atan2(b.y-a.y,b.x-a.x);G.zoom=clamp(G.pinch.z*G.pinch.d/Math.max(20,d),170,760);G.yaw=G.pinch.yaw-(ang-G.pinch.ang);}},{passive:false});
  const tend=e=>{for(const t of e.changedTouches){if(t.identifier===jid){jid=null;joy.classList.remove('on');knob.style.transform='';G.joy.on=false;G.joy.x=G.joy.y=0;G.runAuto=false;}
      else if(T[t.identifier]){const s=T[t.identifier];clearTimeout(s.lp);if(!s.peek&&Object.keys(T).length===1&&performance.now()-s.t<350&&Math.hypot(s.x-s.sx,s.y-s.sy)<14){if(isFP()){auInit();if(G.build)buildBtn('place');else if(G.target)actStart(G.target);}else worldTap(s.x,s.y);}delete T[t.identifier];}}if(Object.keys(T).length<2)G.pinch=null;};
  cv.addEventListener('touchend',tend);cv.addEventListener('touchcancel',tend);
  // nút
  const hold=(el,on,off)=>{el.addEventListener('pointerdown',e=>{e.preventDefault();on();});if(off){el.addEventListener('pointerup',off);el.addEventListener('pointerleave',off);el.addEventListener('pointercancel',off);}};
  hold($('#actBtn'),()=>{auInit();if(G.build)buildBtn('place');else actStart(G.target);});hold($('#jumpBtn'),()=>{G.jumpReq=1;});
  hold($('#sneakBtn'),()=>sneakToggle());hold($('#sitBtn'),()=>sitToggle());hold($('#throwBtn'),()=>{auInit();throwIt();});
  hold($('#runBtn'),()=>{G.runBtn=!G.runBtn;$('#runBtn').classList.toggle('on',G.runBtn);});
  $('#hot').addEventListener('click',e=>{const b=e.target.closest('[data-hot]');if(b){sfx('pick');hotClick(+b.dataset.hot);}});
  addEventListener('pointerdown',()=>auInit(),{once:true});}
function worldTap(x,y){if(!G.on||G.paused)return;auInit();const p=groundPick(x,y);if(!p)return;if(G.build){if(G.build.rm){buildBtn('place');return;}G.buildTap={x:p.x,z:p.z};G.build.uiT=-9;buildUpdate();sfx('pick');return;}
  // chạm vào vật: tìm thứ gần điểm chạm nhất
  let best=null,bd=40;for(const i of near(p.x,p.z,60)){const q=RES[i];if(q.st!==0)continue;const d=Math.hypot(q.x-p.x,q.z-p.z)-(RT[q.t].r||4)*0.5;if(d<bd){bd=d;best={type:'res',q};}}
  for(const a of G.animals){if(!a.alive||!a.o.visible)continue;const d=Math.hypot(a.x-p.x,a.z-p.z)-a.r;if(d<bd){bd=d;best={type:'animal',a};}}
  for(const b of S.builds){const def=pieceDef(b.k);if(!def||(!def.st&&!def.store&&!def.bed&&!def.farm&&b.k!=='well'))continue;const d=Math.hypot(b.x-p.x,b.z-p.z)-12;if(d<bd){bd=d;best={type:'build',b,def};}}
  if(!best&&wdAt(p.x,p.z)>0.3&&Math.hypot(p.x-P.x,p.z-P.z)<200)best={type:'water',x:p.x,z:p.z};
  const tx=best?(best.q?best.q.x:best.a?best.a.x:best.b?best.b.x:best.x):p.x,tz=best?(best.q?best.q.z:best.a?best.a.z:best.b?best.b.z:best.z):p.z;
  if(best&&Math.hypot(tx-P.x,tz-P.z)<REACH+((best.q&&(RT[best.q.t].r||4))||10)){G.walkTo=null;actStart(best);return;}
  G.walkTo={x:tx,z:tz,t:best,t0:G.t};G.act=null;}

/* ---------- tên vùng đất hiện lên khi bước vào ---------- */
function uiRegion(r,first){const el=$('#regban');if(!el)return;el.innerHTML=`<em>${first?'Vùng đất mới':'Bạn đang ở'}</em><b>${r.ic} ${esc(r.n)}</b>${first?`<span>${esc(r.d)}</span>`:''}`;el.hidden=false;el.classList.remove('go');void el.offsetWidth;el.classList.add('go');clearTimeout(G.regT);G.regT=setTimeout(()=>{el.hidden=true;},first?5200:2600);if(first)sfx('idea');}
function flutePlay(){if(G.fluteT&&G.t-G.fluteT<3)return;G.fluteT=G.t;auInit();const notes=[587,659,784,880,784,659,587,523,587];if(AU.ctx)notes.forEach((f,i)=>tone(f,0.32,'sine',0.09,1,i*0.3));S.p.stam=Math.min(maxStam(),S.p.stam+15);uiToast('🎶 Tiếng sáo tre vang trong gió. Lòng thư thái, thể lực hồi lại.','gold');cnt('cnt','flute');}
function uiActsTick(){const tb=$('#throwBtn');if(tb){const v=!!throwable()&&!G.build;if(tb.hidden===v)tb.hidden=!v;}}
