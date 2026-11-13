// Đo lượng rác bộ nhớ game tạo ra mỗi giây khi đi bộ ở 60 khung/giây (tắt phần vẽ để vòng lặp chạy đủ nhanh).
// Rác nhiều → trình duyệt phải dừng game để dọn đều đặn vài giây một lần (giật). Mốc cũ: 7,9 MB/giây. Cho phép tối đa 4,5.
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-precise-memory-info']});const c=await b.newContext({viewport:{width:500,height:300}});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-b');localStorage.setItem('ldtt-nohd','1');localStorage.setItem('ld-perf-auto','0')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));
await p.goto('file://'+path.resolve(__dirname,'../../index.html'));await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(12000);
await p.evaluate(()=>{G.R.render=()=>{};if(K3.fx)K3.fx.render=()=>{};G.keys={KeyW:true};});await p.waitForTimeout(20000);
const r=await p.evaluate(()=>new Promise(res=>{let fr=0;const f=()=>{fr++;requestAnimationFrame(f)};requestAnimationFrame(f);const t0=performance.now();let last=performance.memory.usedJSHeapSize,al=0,gc=0;const iv=setInterval(()=>{const u=performance.memory.usedJSHeapSize;if(u>last)al+=u-last;else if(last-u>5e5)gc++;last=u;if(performance.now()-t0>30000){clearInterval(iv);const T=(performance.now()-t0)/1000;res({fps:Math.round(fr/T),allocMBs:+(al/1e6/T).toFixed(2),gc,heapMB:Math.round(last/1e6)});}},20);}));
console.log(JSON.stringify(r));console.log(r.fps>=40&&r.allocMBs<4.5&&!logs.length?'RAC-DAT':'RAC-HONG '+logs.join('|'));await b.close();})();
