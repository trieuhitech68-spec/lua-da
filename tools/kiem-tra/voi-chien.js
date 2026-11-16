// Voi rừng có ngoài bản đồ, thuần được (lâu hơn ngựa), cưỡi được (ngồi cao), cấp cho lính thành tượng binh đánh mạnh hơn.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:400,height:260}});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-c');localStorage.setItem('ldtt-nohd','1')}catch(e){}});const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));p.on('console',m=>{if(m.type()==='warning'&&/voi|đạo quân/.test(m.text()))er.push(m.text())});
await p.goto('file://'+(process.argv[2]||require('path').resolve(__dirname,'../../index.html')));await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(4000);
const r=await p.evaluate(()=>{const o={};document.querySelectorAll('[aria-label="Đóng"]').forEach(x=>{try{x.click()}catch(e){}});S.hour=11;const E=G.animals.filter(a=>a.kind==='elephant');o.wild=E.length;
  // thuần
  const a=E[0];a.x=P.x+60;a.z=P.z;a.angry=false;S.inv[0]={id:'banana',n:20};S.sel=0;G.sneak=true;let n=0;while(a.alive&&n<20){tameFeed(a);n++;}G.sneak=false;o.feeds=n;const m=(S.mounts||[]).find(x=>x.k==='elephant');o.tamed=!!m;
  // voi rừng đứng cạnh để chụp
  const w=E[1];w.x=P.x-80;w.z=P.z+60;w.home={x:w.x,z:w.z};w.o.visible=true;
  // cưỡi
  mtRide(m);o.ride=!!G.mnt;S.view='tp';viewApply();animTick(0.016);o.seat=+(P.model.position.y-groundY(P.x,P.z)).toFixed(1);o.verb=targetInfo(findTarget()).verb;
  const cam=new THREE.PerspectiveCamera(32,1000/600,1,3000);cam.position.set(P.x+170,P.y+95,P.z+150);cam.lookAt(P.x-20,P.y+35,P.z+20);window.__shot=()=>{const fog=G.sc.fog;G.sc.fog=null;G.R.setRenderTarget(null);G.R.render(G.sc,cam);G.sc.fog=fog;};return o;});

const r2=await p.evaluate(()=>{const o={};mtOff(1);o.off=!G.mnt;const m=S.mounts.find(x=>x.k==='elephant');S.folk=[{n:'L0',role:'hunter',seed:701,sex:'m',job:'soldier',x:P.x+10,z:P.z+10,fed:TNOW(),lv:2,arm:'spear'}];const d0=danDmg(S.folk[0]);m.sol=qdUid(S.folk[0]);o.dmgK=+(danDmg(S.folk[0])/d0).toFixed(2);for(let i=0;i<600;i++){G.t+=1/60;folkTick(1/60);}const f=S.folk[0];o.solSeat=+(f._o.position.y-groundY(f.x,f.z,f._o.position.y)).toFixed(1);return o;});
const o=Object.assign(r,r2);console.log(JSON.stringify(o));console.log(o.wild>=5&&o.tamed&&o.feeds>=6&&o.ride&&o.seat>45&&o.verb==='Xuống voi'&&o.off&&o.dmgK>1.5&&o.solSeat>45&&!er.length?'VOI-DAT':'VOI-HONG '+er.join('|'));await b.close();})();
