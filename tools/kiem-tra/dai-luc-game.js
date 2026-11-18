// Đại lục liền (đợt 2): nhân vật thử nghiệm vào được game trên mặt đất đại lục, không lỗi; cây đá, thú mọc theo địa hình mới; có vành đất xa; ngoài vùng nạp vẫn là đất của đại lục.
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:1100,height:620}});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-d');localStorage.setItem('ldtt-nohd','1');localStorage.setItem('ld-dl','1')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message+' @ '+((e.stack||'').split('\n')[1]||'').trim().slice(0,90)));p.on('console',m=>{if(m.type()==='error'||(m.type()==='warning'&&!/GL Driver|GPU stall/.test(m.text())))logs.push(m.type()+' '+m.text().slice(0,220));});
await p.goto('file://'+(process.argv[2]||require('path').resolve(__dirname,'../../index.html')));await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');let ok=true;try{await p.waitForFunction(()=>typeof G==='object'&&G.on&&P.model,null,{timeout:120000});}catch(e){ok=false;}await p.waitForTimeout(8000);
let r={};try{r=await p.evaluate(()=>({on:DL.on,dl:!!(S&&S.dl),h:Math.round(hAt(P.x,P.z)),wd:wdAt(P.x,P.z),res:RES.length,an:G.animals.length,ring:!!DL.ring,far:Math.round(hAt(WSIZE,WSIZE*0.3))!==-60,algn:S.dl.ox%DL.TS===0&&S.dl.oz%DL.TS===0,trees:RES.filter(q=>RT[q.t].tool==='axe').length}));}catch(e){r={e:String(e).slice(0,200)};}
console.log(JSON.stringify(r));const bad=[...new Set(logs)];if(bad.length)console.log(bad.slice(0,8).join('\n'));
console.log(ok&&r.on&&r.dl&&r.h>3&&r.wd<=0&&r.res>4000&&r.an>50&&r.ring&&r.far&&r.algn&&r.trees>800&&!bad.length?'DLG-DAT':'DLG-HONG');
await b.close();})();
