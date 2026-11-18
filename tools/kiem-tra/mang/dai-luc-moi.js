// Thế giới chung chưa có máy chủ đại lục: nhân vật MỚI tự được đưa vào một máy chủ đại lục mở mới (bản đồ rộng), máy chủ cũ giữ nguyên.
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await c.addInitScript(fs.readFileSync(require('path').join(__dirname,'mock.js'),'utf8').replace("put('world/s2',{seed:777,wv:3});","").replace("try{localStorage.setItem('ld-dl','0');}catch(e){}","try{localStorage.removeItem('ld-dl');}catch(e){}").replace(/for\(let i=0;i<150;i\+\+\)/,"for(let i=0;i<3;i++)"));
  const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message+' '+(e.stack||'').slice(0,300)));
  await p.goto('file://'+require('path').resolve(__dirname,'../../../index.html'));await p.waitForTimeout(8000);
  const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
  await click('Tạo nhân vật mới');await p.waitForTimeout(5000);await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&P.model&&G.animals&&G.animals.length,null,{timeout:240000});await p.waitForTimeout(5000);
  const r=await p.evaluate(()=>({mp:!!S.mp,srv:S.srv,dl:!!S.dl,on:DL.on,land:S.land,main:JSON.stringify(__db.get('world/main')),s2:JSON.stringify(__db.get('world/s2')||null),seed0:S.seed0,h:Math.round(hAt(P.x,P.z)),worlds:MP.worlds.map(w=>w.id+(w.dl?'*':'')).join(',')}));
  console.log(JSON.stringify(r));if(logs.length)console.log(logs.slice(0,4).join('\n'));const s2=JSON.parse(r.s2||'null');
  console.log(r.mp&&r.srv==='s2'&&r.dl&&r.on&&s2&&s2.dl===1&&r.seed0===s2.seed&&!/dl/.test(r.main)&&r.h>3&&!logs.length?'MDM-DAT':'MDM-HONG');await b.close();})();
