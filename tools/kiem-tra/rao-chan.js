const {chromium}=require('playwright');const KIND=process.argv[2]||'fence',GATE=process.argv[3]||'gate';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:400,height:240}});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-b');localStorage.setItem('ldtt-nohd','1')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../../index.html')+'');await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r=await p.evaluate(async([KIND,GATE])=>{const o={};window.__T=[];const _u=uiToast;uiToast=function(m){__T.push((G.t|0)+'s '+String(m).slice(0,110));return _u.apply(this,arguments)};
  // bãi phẳng
  let gx=0,gz=0,ok=false;for(let r=120;r<1800&&!ok;r+=80)for(let a=0;a<12&&!ok;a++){const x=Math.round((P.x+Math.cos(a)*r)/40)*40,z=Math.round((P.z+Math.sin(a)*r)/40)*40;let mn=1e9,mx=-1e9,wet=0;for(let i=-6;i<=10;i++)for(let j=-6;j<=10;j++){const h=hAt(x+i*40,z+j*40);mn=Math.min(mn,h);mx=Math.max(mx,h);if(wdAt(x+i*40,z+j*40)>0)wet=1;}if(mx-mn<16&&!wet){gx=x;gz=z;ok=true;}}
  o.flat=ok;for(const i of near(gx+80,gz+80,420)){const q=RES[i];if(q.st===0)q.st=1;}for(const a of G.animals)a.alive=false;
  let n=9900;const y0=hAt(gx+80,gz+80);const mk=(k,x,z,r)=>{const b={id:n++,k,x,y:hAt(x,z),z,r:r||0,lv:0};S.builds.push(b);structAdd(b,true);return b;};const N=4;
  for(let i=0;i<N;i++){mk(KIND,gx+20+i*40,gz,0);mk(GATE!=='none'&&i===1?GATE:KIND,gx+20+i*40,gz+N*40,0);mk(KIND,gx,gz+20+i*40,1);mk(KIND,gx+N*40,gz+20+i*40,1);}
  o.edges=OCC.edge.size;const run=async(sx,sz,tx,tz,secs)=>{P.x=sx;P.z=sz;P.y=groundY(sx,sz);AQ.path=null;try{aqStop('')}catch(e){}aqStart(-1,{job:{k:'goto',x:tx,z:tz,r:24,lab:'thử đi'}});
    G.R.render=()=>{};if(K3.fx)K3.fx.render=()=>{};let T=performance.now()+1e6;const t0=G.t;let ins0=0;while(G.t-t0<secs){for(let k=0;k<40;k++){T+=50;loop(T);}await new Promise(r=>setTimeout(r,0));if(Math.hypot(P.x-tx,P.z-tz)<30)break;}
    return {d:Math.round(Math.hypot(P.x-tx,P.z-tz)),t:Math.round(G.t-t0),on:AQ.on,jobs:AQ.jobs.map(j=>j.k).join('>')};};
  window.requestAnimationFrame=()=>0;give({stick:20,rope:5});S.p.water=100;S.p.food=100;S.hour=10;
  // người làng trong rào muốn ra ngoài; kẻ địch ngoài rào muốn vào
  P.x=gx+300;P.z=gz+300;P.y=groundY(P.x,P.z);const bed={x:gx+80,z:gz+80};const f={n:'T',role:'hunter',seed:901,sex:'m',job:'idle',x:gx+80,z:gz+80,fed:TNOW(),lv:1};S.folk=[f];folkSpawn(f);
  const step=(L,tx,tz,secs,shut,det)=>{let cross=0;for(let i=0;i<secs*60;i++){rcSnap(L);const q=L[0];q._gx=tx;q._gz=tz;G.t+=1/60;const dx=tx-q.x,dz=tz-q.z,d=Math.hypot(dx,dz);if(d>3&&!q._det){q.x+=dx/d*Math.min(d,55/60);q.z+=dz/d*Math.min(d,55/60);}rcGuard(L,shut,det,1/60);}const q=L[0];return {d:Math.round(Math.hypot(q.x-tx,q.z-tz)),inside:q.x>gx&&q.x<gx+N*40&&q.z>gz&&q.z<gz+N*40};};
  o.folkOut=step(S.folk,gx+80,gz+N*40+200,40,false,true);f.x=gx+80;f.z=gz+80;f._det=null;o.folkNorth=step(S.folk,gx+80,gz-200,90,false,true);
  const e={x:gx+80,z:gz+N*40+150,alive:true};o.foeIn=step([e],gx+80,gz+80,60,true,false);const e2={x:gx+80,z:gz+N*40+150,alive:true};o.npcIn=step([e2],gx+80,gz+80,60,false,false);o.npcAround=step([{x:gx+80,z:gz+300,alive:true}],gx+80,gz-200,90,false,false);S.folk=[];
  o.inOut=await run(gx+80,gz+80,gx+80,gz-300,70);S.p.water=100;S.p.food=100;
  o.outIn=await run(gx+80,gz-300,gx+80,gz+80,70);o.gates=S.builds.filter(b=>b.id>=9900&&/gate/i.test(b.k)).length;o.msgs=__T.slice(-6);return o;},[KIND,GATE]);
console.log(KIND,GATE,JSON.stringify(r));const ok=GATE==='none'?(!r.foeIn.inside&&!r.npcIn.inside&&r.inOut.d<40&&r.outIn.d<40):(!r.folkOut.inside&&!r.folkNorth.inside&&!r.foeIn.inside&&r.npcIn.inside&&!r.npcAround.inside&&r.inOut.d<40&&r.outIn.d<40);console.log(ok&&!logs.length?'RAO-DAT':'RAO-HONG');console.log(logs.slice(0,3).join('\n'));await b.close();})();
