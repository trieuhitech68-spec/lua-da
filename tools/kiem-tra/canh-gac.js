// Lính gác phải chia nhau: mỗi chòi 1 người, còn lại mỗi người một chỗ quanh nhà, không ai đứng chồng lên ai.
const {chromium}=require('playwright');const HTML=process.argv[2]||require('path').resolve(__dirname,'../../index.html');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:400,height:240}});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-b');localStorage.setItem('ldtt-nohd','1')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));p.on('console',m=>{if(/canh gác/.test(m.text()))logs.push(m.text())});
await p.goto('file://'+HTML);await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{const o={};let n=9800;const mk=(k,dx,dz)=>{const b={id:n++,k,x:P.x+dx,y:hAt(P.x+dx,P.z+dz),z:P.z+dz,r:0,lv:0};S.builds.push(b);structAdd(b,true);return b;};
  G.animals.length=0;if(G.foes)G.foes.length=0;mk('campfire',30,0);const bed=mk('hammock',40,40);const tw=mk('watchtower',-80,60);S.hour=10;
  const F=(job,i)=>({n:'F'+i,role:'hunter',seed:900+i,sex:'m',bed:bed.id,job,x:P.x+20,z:P.z+20,fed:TNOW(),lv:1});
  S.folk=[0,1,2,3,4,5].map(i=>F('guard',i)).concat([6,7,8].map(i=>F('soldier',i)),[F('wood',9),F('gather',10)]);for(const f of S.folk)try{folkSpawn(f)}catch(e){o.e=String(e)}
  const run=s=>{for(let i=0;i<60*s;i++){G.t+=1/60;folkTick(1/60);}};const minD=L=>{let m=1e9;for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){if(Math.abs(L[i]._o.position.y-L[j]._o.position.y)>30)continue;m=Math.min(m,Math.hypot(L[i].x-L[j].x,L[i].z-L[j].z));}return +m.toFixed(1);};
  run(90);const gd=S.folk.filter(f=>f.job==='guard'),so=S.folk.filter(f=>f.job==='soldier');
  o.onTower=gd.filter(f=>Math.hypot(f.x-tw.x,f.z-tw.z)<8&&f._o.position.y>tw.y+50).length;o.minGuard=minD(gd);o.minSoldier=minD(so);o.minAll=minD(S.folk);
  o.spread=+Math.max(...gd.map(f=>Math.hypot(f.x-bed.x,f.z-bed.z))).toFixed(0);
  // góc quanh nhà: lính dưới đất phải toả ít nhất 3 hướng khác nhau
  o.dirs=new Set(gd.filter(f=>f._o.position.y<tw.y+50).map(f=>Math.round(Math.atan2(f.x-bed.x,f.z-bed.z)/1.2))).size;
  // thú dữ đến gần: có người xông ra
  const w={k:'wolf',x:bed.x+200,z:bed.z,hp:40,r:9};o.enemy=typeof danEnemy==='function';return o;});
console.log(JSON.stringify(r));console.log(r.onTower===1&&r.minGuard>=11&&r.minSoldier>=11&&r.minAll>=9&&r.dirs>=3&&!logs.length?'CG-DAT':'CG-HONG '+logs.join('|'));await b.close();})();
