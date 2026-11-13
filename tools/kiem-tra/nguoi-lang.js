const {chromium}=require('playwright');const HTML=process.argv[2]||require('path').resolve(__dirname,'../../index.html');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:400,height:240}});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-b');localStorage.setItem('ldtt-nohd','1')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));
await p.goto('file://'+HTML);await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{const o={};let n=9800;const mk=(k,dx,dz)=>{const b={id:n++,k,x:P.x+dx,y:hAt(P.x+dx,P.z+dz),z:P.z+dz,r:0,lv:0};S.builds.push(b);structAdd(b,true);if(pieceDef(k).store)S.store[b.id]=Array(pieceDef(k).store).fill(null);return b;};
  mk('campfire',30,0);mk('basket',60,0);const bed=mk('hammock',40,40);S.hour=10;
  const F=(job,i)=>({n:'F'+i,role:'hunter',seed:900+i,sex:'m',bed:bed.id,job,x:P.x+20+i*8,z:P.z+20,fed:TNOW(),lv:1});
  S.folk=[F('wood',0),F('stone',1),F('gather',2),F('cook',3),F('gate',4)];for(const f of S.folk)try{folkSpawn(f)}catch(e){o.e=String(e)}
  // 1) có việc: người làng đi làm, mang đồ về kho
  for(let i=0;i<60*240;i++){G.t+=1/60;folkTick(1/60);}o.states=S.folk.map(f=>f.job+':'+f._st).join(',');o.stored=Object.values(S.store).reduce((a,st)=>a+st.filter(Boolean).reduce((x,s)=>x+s.n,0),0);
  // 2) hết việc quanh nhà: không được quét lại mỗi khung
  for(const i of near(P.x,P.z,900)){const q=RES[i];if(q.st===0)q.st=1;}let calls=0;const _n=near;near=function(x,z,r){if(r>=600)calls++;return _n.apply(this,arguments);};
  const t0=performance.now();for(let i=0;i<600;i++){G.t+=1/60;folkTick(1/60);}o.ms=+(performance.now()-t0).toFixed(1);o.searchCalls=calls;near=_n;return o;});
console.log(JSON.stringify(r));console.log(r.stored>0&&r.searchCalls<=18&&!logs.length?'NL-DAT':'NL-HONG '+logs.join('|'));await b.close();})();
