// Người nấu ăn đứng yên bên bếp: không chồng lên nhau, không giật qua lại.
const {chromium}=require('playwright');const HTML=process.argv[2]||require('path').resolve(__dirname,'../../index.html');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:400,height:240}});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-b');localStorage.setItem('ldtt-nohd','1')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));
await p.goto('file://'+HTML);await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{const o={};let n=9800;const mk=(k,dx,dz)=>{const b={id:n++,k,x:P.x+dx,y:hAt(P.x+dx,P.z+dz),z:P.z+dz,r:0,lv:0};S.builds.push(b);structAdd(b,true);if(pieceDef(k).store)S.store[b.id]=Array(pieceDef(k).store).fill(null);return b;};
  G.animals.length=0;if(G.foes)G.foes.length=0;const fire=mk('campfire',40,0);S.fuel[fire.id]=50;mk('basket',80,0);S.hour=10;o.lit=fireLit(fire);
  const F=(job,i)=>({n:'F'+i,role:'hunter',seed:900+i,sex:'m',job,x:P.x+20,z:P.z+20,fed:TNOW(),lv:1});
  const t=(jobs)=>{S.folk=jobs.map(F);for(let i=0;i<60*40;i++){G.t+=1/60;folkTick(1/60);}let mv=0;const p0=S.folk.map(f=>[f.x,f.z]);let ry=0;for(let i=0;i<60*8;i++){const a=S.folk.map(f=>[f.x,f.z,f._o.rotation.y]);G.t+=1/60;folkTick(1/60);S.folk.forEach((f,j)=>{mv=Math.max(mv,Math.hypot(f.x-a[j][0],f.z-a[j][1]));ry=Math.max(ry,Math.abs(f._o.rotation.y-a[j][2]));});}
    let md=1e9;for(let i=0;i<S.folk.length;i++)for(let j=i+1;j<S.folk.length;j++)md=Math.min(md,Math.hypot(S.folk[i].x-S.folk[j].x,S.folk[i].z-S.folk[j].z));return {mv:+mv.toFixed(3),ry:+ry.toFixed(3),md:+md.toFixed(1),df:S.folk.map(f=>Math.round(Math.hypot(f.x-fire.x,f.z-fire.z)))};};
  o.one=t(['cook']);o.two=t(['cook','cook']);o.mix=t(['cook','cook','idle','gate','soldier']);return o;});
console.log(JSON.stringify(r));const ok=r.lit&&r.one.mv<0.01&&r.two.mv<0.01&&r.two.md>12&&r.one.ry<0.05&&r.two.ry<0.05&&!logs.length;console.log(ok?'NA-DAT':'NA-HONG '+logs.join('|'));await b.close();})();
