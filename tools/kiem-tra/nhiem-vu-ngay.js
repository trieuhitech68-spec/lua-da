const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:393,height:852},deviceScaleFactor:2,isMobile:true,hasTouch:true});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-b');localStorage.setItem('ldtt-nohd','1')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message+(e.stack||'').slice(0,300)));
await p.goto('file://'+path.resolve(__dirname,'../../index.html'));await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{const o={};const N=nvnS();o.n=N.q.length;o.ids=N.q.map(e=>e.id).join(',');o.same=nvnS()===N;uiOpen('journal',{});o.html=/Nhiệm vụ hôm nay/.test(document.querySelector('#panel').innerText);
  nvnClaim(0);o.early=N.q[0].c;for(const e of N.q){const q=NVN_P.find(x=>x.id===e.id);if(q.k)S.cnt[q.k]=(S.cnt[q.k]||0)+q.n;else S.cnt[q.p+'zz']=(S.cnt[q.p+'zz']||0)+q.n;}
  const inv0=S.inv.filter(Boolean).reduce((a,s)=>a+s.n,0);nvnClaim('box');o.boxEarly=N.box;for(let i=0;i<5;i++)nvnClaim(i);o.done=N.q.every(e=>e.c);nvnClaim('box');o.box=N.box;nvnClaim('box');o.got=S.inv.filter(Boolean).reduce((a,s)=>a+s.n,0)-inv0;
  // sang ngày mới: đổi nhiệm vụ, chuỗi +1
  const y=new Date();y.setDate(y.getDate()-1);N.d=y.getFullYear()+'-'+(y.getMonth()+1)+'-'+y.getDate();const N2=nvnS();o.newDay=N2!==N&&N2.st===1&&!N2.box&&N2.q.every(e=>!e.c);
  try{anTick();anCrackle();o.an=!!AN||true;}catch(e){o.an='ERR '+e.message;}uiOpen('journal',{});return o;});
console.log(JSON.stringify(r));await p.waitForTimeout(600);await p.screenshot({path:'/tmp/claude-0/-home-user-lua-da/9c4443c8-9dc5-5fb0-ade9-49acfd1b0e84/scratchpad/nvn.png'});
console.log(r.n===5&&r.same&&r.html&&!r.early&&!r.boxEarly&&r.done&&r.box===1&&r.got>5&&r.newDay&&r.an===true&&!logs.length?'NV-DAT':'NV-HONG '+logs.join('|'));await b.close();})();
