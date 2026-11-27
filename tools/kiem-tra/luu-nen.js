// Ngăn lưu chính (localStorage) bị trình duyệt xoá mà bản ghi nền (IndexedDB) còn: bấm Chơi phải lấy bản ghi nền, không tải đè bản cũ trên máy chủ.
// Chạy: node luu-nen.js → LN-DAT / LN-HONG
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:390,height:844}});
  const DB=new Map([['world/main',{seed:12345,wv:3}]]);await c.exposeBinding('__relay',(s,p,v)=>{if(v==null)DB.delete(p);else DB.set(p,v);});
  await c.addInitScript(()=>{window.__ME={uid:'p01',name:'An'};});await c.addInitScript(fs.readFileSync(path.join(__dirname,'mang/mock-chung.js'),'utf8'));await c.addInitScript(s=>{window.__SNAP=s;},[...DB.entries()]);
  const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push(e.message));await p.goto('file://'+path.resolve(__dirname,'../../index.html'));await p.waitForTimeout(5000);
  const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.trim()===t)||[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
  await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&P.model,null,{timeout:240000});await p.waitForTimeout(4000);
  // máy chủ có bản cũ (đẩy lúc mới vào), rồi chơi lên cấp: bản ghi nền giữ bản mới
  const a=await p.evaluate(()=>new Promise(r=>{accPush(curSlot(),true);setTimeout(async()=>{addXp('chop',3000);const ok=lth2Lean();await new Promise(q=>setTimeout(q,800));const v=await lidbGet(SKEY+'#'+curSlot());let x=-1;try{x=Math.round(Object.values(JSON.parse(v.raw).sk).reduce((a,b)=>a+b,0));}catch(e){}r({xp:Math.round(heroXp()),nen:ok?1:0,nenXp:x});},2000);}));
  // lần mở sau: trình duyệt đã xoá ngăn lưu chính
  await c.addInitScript(()=>{try{if(!sessionStorage.getItem('xoa1')){sessionStorage.setItem('xoa1','1');localStorage.clear();}}catch(e){}});await c.addInitScript(s=>{window.__SNAP=s;},[...DB.entries()]);
  await p.reload();await p.waitForFunction(()=>typeof ACC==='object'&&ACC.ready&&typeof LIDB==='object'&&LIDB.ok&&document.querySelector('[data-a="chplay"]'),null,{timeout:60000});const xet=await p.evaluate(async()=>{const id=document.querySelector('[data-a="chplay"]').dataset.id,v=await lidbGet(SKEY+'#'+id),C=ACC.cloud[id];const xp=r=>{try{return Math.round(Object.values(JSON.parse(r).sk||{}).reduce((a,b)=>a+b,0));}catch(e){return -1;}};return {id,nen:v&&{ts:v.ts,xp:xp(v.raw)},may:localStorage.getItem(SKEY+'#'+id)!=null,chu:C&&{ts:C.ts,rev:C.rev}};});await click('Chơi');await p.waitForTimeout(3000);
  await p.waitForFunction(()=>typeof G==='object'&&G.on&&P.model,null,{timeout:240000});await p.waitForTimeout(2000);
  const r=await p.evaluate(()=>({xp:Math.round(heroXp()),rec:LIDB.rec|0}));console.log(JSON.stringify({truoc:a,xet,sau:r}));
  const ok=a.nen===1&&a.nenXp>=3000&&r.xp>=3000&&!logs.length;console.log(ok?'LN-DAT':'LN-HONG '+logs.join('|'));await b.close();process.exit(ok?0:1);})();
