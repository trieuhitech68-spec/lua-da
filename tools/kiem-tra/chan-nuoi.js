// Chăn nuôi: có dê núi ngoài rừng, thuần được dê và thỏ, thả con giống từ túi, con non lớn lên, sinh con, vịt đẻ trứng, mổ thịt, chuồng trống chỉ cách kiếm; các kiểu nhà mới đều có bản vẽ hợp lệ.
const {chromium}=require('playwright');const HTML=process.argv[2]||require('path').resolve(__dirname,'../../index.html');const SHOT=process.argv[3];
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:SHOT?{width:900,height:520}:{width:400,height:240}});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-b');localStorage.setItem('ldtt-nohd','1')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));p.on('console',m=>{if(m.type()==='warning'&&/chăn nuôi|hình vật nuôi|dê núi|chuồng/.test(m.text()))logs.push(m.text())});
await p.goto('file://'+HTML);await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{const o={};let n=9800;const mk=(k,dx,dz)=>{const b={id:n++,k,x:P.x+dx,y:hAt(P.x+dx,P.z+dz),z:P.z+dz,r:0,lv:0};S.builds.push(b);structAdd(b,true);if(pieceDef(k).store)S.store[b.id]=Array(pieceDef(k).store).fill(null);return b;};
  o.goats=G.animals.filter(a=>a.kind==='goat').length;o.goatRig=G.animals.filter(a=>a.kind==='goat').every(a=>a.rig&&a.o);
  // 1) thuần dê núi và thỏ rừng
  S.pets=[];const tame=(kind,food)=>{const a=G.animals.find(x=>x.kind===kind&&x.alive);if(!a)return 'không có '+kind;a.x=P.x+30;a.z=P.z;S.inv[0]={id:food,n:5};S.sel=0;G.sneak=true;for(let i=0;i<4&&a.alive;i++)tameFeed(a);return S.pets.some(p=>p.k===TAME[kind].to);};
  o.tGoat=tame('goat',TAME.goat.food[0]);o.tRabbit=tame('rabbit',TAME.rabbit.food[0]);G.sneak=false;
  // 2) chuồng trống chỉ cách kiếm
  S.pets=[];const pen=mk('pigPen',120,0),gs=mk('goatShed',120,120),dh=mk('duckHouse',-120,0),tr=mk('trough',60,60);
  const ti=targetInfo({type:'cng',b:pen,d:5});o.hintVerb=ti.verb;o.hintOk=ti.ok;let msg='';const _t=uiToast;uiToast=function(m){msg=String(m);return _t.apply(this,arguments);};actStart({type:'cng',b:pen,d:5});o.hintMsg=/LỢN RỪNG/.test(msg);
  // 3) thả con giống
  let i=0;for(const id in CNU.SEED){S.inv[i]={id,n:1};G.panel='bag';mxCalfOut(i);i++;}o.released=S.pets.map(p=>p.k).join(',');o.invLeft=S.inv.slice(0,5).filter(Boolean).length;
  for(let k=0;k<600;k++){G.t+=1/60;petsTick(1/60);}o.models=S.pets.every(p=>p._o&&p._o.parent);
  // 4) lớn lên, vịt đẻ trứng, sinh con
  for(const q of S.pets){q.born=TNOW()-3.5;q.fed=TNOW();}petsHourly(1);o.grown=[...new Set(S.pets.map(p=>p.k))].sort().join(',');
  for(const q of S.pets)if(q.k==='duck'){q.x=dh.x+20;q.z=dh.z;}const n0=S.pets.length;const _r=Math.random;Math.random=()=>0.01;for(let k=0;k<3;k++){for(const q of S.pets)q.fed=TNOW();petsHourly(1);}Math.random=_r;o.born=S.pets.length-n0;o.eggs=Math.floor(S.tank[dh.id]||0);
  for(let k=0;k<300;k++){G.t+=1/60;petsTick(1/60);}
  // 5) mổ thịt dê (cần dao)
  const g=S.pets.find(q=>q.k==='goat');g.born=TNOW()-6;S.inv[0]={id:'knife',n:1};S.sel=0;o.butcherVerb=petInfo(g).verb;const m0=invCount('meat');petUse(g);o.meat=invCount('meat')-m0;uiToast=_t;
  // 6) kiểu nhà mới
  const ids=['qh_tron','qh_nua','qh_san','qh_sanla','qh_bondoc','qh_santhuyen','qh_ga','qh_lon','qh_de','qh_trau','qh_vit','qh_gom','qh_det','qh_benca','qh_khothoc','qh_san_gieng'];o.qhBad=ids.filter(id=>{const q=QH.find(x=>x.id===id);if(!q)return true;const ps=qhParts(q);return !ps.length||ps.some(x=>!pieceDef(x[0]))||!ps.some(x=>q.key==='roof'?pieceDef(x[0]).kind==='roof':x[0]===q.key);});
  try{o.qhHtml=qhHtml().length>2000;}catch(e){o.qhHtml=String(e);}o.trades=TRADES.gatherer.some(t=>t[1].chickPair)&&TRADES.elder.some(t=>t[1].kidPair);return o;});
console.log(JSON.stringify(r));
if(SHOT){await p.evaluate(()=>{S.hour=11;const L=[['duck',0],['duckling',1],['goat',2],['kid',3],['rabbit',4],['chicken',5]];S.pets=[];L.forEach(([k,i])=>{const q={id:900+i,k,x:P.x-50+i*22,z:P.z+45,born:TNOW()-9,fed:TNOW(),stay:1};S.pets.push(q);petSpawn(q);q._t=99;q._tx=q.x;q._tz=q.z;});});await p.waitForTimeout(2500);await p.evaluate(()=>{try{G.camD=70;}catch(e){}});await p.waitForTimeout(1500);await p.screenshot({path:SHOT});}
const ok=r.goats>=5&&r.goatRig&&r.tGoat===true&&r.tRabbit===true&&r.hintOk&&r.hintMsg&&r.released.split(',').length===10&&r.invLeft===0&&r.models&&/duck/.test(r.grown)&&/goat/.test(r.grown)&&!/kid|bunny|duckling|chick\b|piglet/.test(r.grown)&&r.born>=1&&r.eggs>=1&&r.butcherVerb==='Mổ thịt'&&r.meat>=5&&!r.qhBad.length&&r.qhHtml===true&&r.trades&&!logs.length;
console.log(ok?'CNU-DAT':'CNU-HONG '+logs.join('|'));await b.close();})();
