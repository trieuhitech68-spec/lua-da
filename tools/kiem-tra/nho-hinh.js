// Ảnh biểu tượng dựng một lần rồi nhớ sang lần chơi sau: lần hai vào game không phải dựng lại (hết cú khựng khi gặp món mới).
const {chromium}=require('playwright');const HTML=process.argv[2]||require('path').resolve(__dirname,'../../index.html');const os=require('os'),fs=require('fs'),path=require('path');
(async()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ld-nhh-'));const out=[];const logs=[];
for(let lan=1;lan<=2;lan++){const c=await chromium.launchPersistentContext(dir,{args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],viewport:{width:390,height:800}});
 await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-c');localStorage.setItem('ldtt-nohd','1')}catch(e){}});const p=c.pages()[0]||await c.newPage();p.on('pageerror',e=>logs.push('ERR '+e.message));
 await p.goto('file://'+HTML);await p.waitForTimeout(5000);
 const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
 await click(lan===1?'Tạo nhân vật mới':'Chơi tiếp');if(lan===1)await click('Bắt đầu');else await click('Tạo nhân vật mới').then(()=>click('Bắt đầu'));
 await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));let made=0;const _m=iconMake;iconMake=function(){made++;return _m.apply(this,arguments);};const ids=['stick','stone','wood','fiber','spear','meatCooked'].filter(k=>ITEMS[k]);const had=ids.filter(k=>ICO.url[k]).length;
   for(const k of ids)icon(k);for(let i=0;i<60&&ids.some(k=>!ICO.url[k]);i++)await W(500);await W(1500);return {ids:ids.length,had,made,ok:ids.filter(k=>ICO.url[k]).length,loaded:NHH.n,db:!!NHH.db};});
 out.push(r);await c.close();}
console.log(JSON.stringify(out));const a=out[0],b=out[1];const ok=a.db&&a.had<a.ids&&a.made>=a.ids-a.had&&a.ok===a.ids&&b.had===b.ids&&b.made===0&&b.loaded>=b.ids&&!logs.length;
console.log(ok?'NH-DAT':'NH-HONG '+logs.join('|'));try{fs.rmSync(dir,{recursive:true,force:true});}catch(e){}})();
