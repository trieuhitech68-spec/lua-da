// Trang bị: mọi vũ khí có sức đánh đúng; mọi món loại cung bắn được và mạnh theo chỉ số; mọi món mặc dựng được hình không lỗi.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:500,height:300}});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-b');localStorage.setItem('ldtt-nohd','1')}catch(e){}});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,160)));
await p.goto('file://'+require('path').resolve(__dirname,'../../index.html'));await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{const bad=[];S.p.stam=100;
 for(const id in ITEMS){const I=ITEMS[id];if(I.t!=='tool'||!I.pow)continue;if(!['spear','club','knife','axe','bow'].includes(I.tool))continue;
   try{S.inv[0]={id,n:1};S.sel=0;equip(id);const fp=fistPow();if(Math.abs(fp-I.pow)>0.01)bad.push('sức đánh '+id+': '+fp+' ≠ '+I.pow);}catch(e){bad.push('cầm '+id+': '+String(e).slice(0,80));}}
 for(const id in ITEMS){const I=ITEMS[id];if(I.t!=='tool'||I.tool!=='bow')continue;try{S.inv[0]={id,n:1};S.inv[1]={id:'arrow',n:5};S.sel=0;equip(id);S.p.stam=100;G.work=null;G.h3aim=null;const n0=(G.proj||[]).length;
     if(!h3aimStart()){bad.push('không giương được '+id);continue;}G.h3aim.t0=G.t-5;G.h3aim.k=1;h3release();const pr=G.proj&&G.proj.length>n0?G.proj[G.proj.length-1]:null;if(!pr)bad.push('không bắn ra tên: '+id);else if(Math.abs(pr.pow-(I.pow||1))>0.05)bad.push('lực bắn '+id+': '+pr.pow+' ≠ '+I.pow);}catch(e){bad.push('bắn '+id+': '+String(e).slice(0,80));}}
 let nw=0;for(const id in ITEMS){const I=ITEMS[id];if(I.t!=='wear'||!I.slot)continue;nw++;try{S.wear={};S.wear[I.slot]=id;playerInit();if(!P.model||!P.rig)bad.push('mặc '+id+': không dựng được người');}catch(e){bad.push('mặc '+id+': '+String(e).slice(0,80));}}
 for(const r of RECIPES){for(const k in r.in||{})if(!ITEMS[k])bad.push('công thức '+r.id+' cần món không có: '+k);for(const k in r.out||{})if(!ITEMS[k])bad.push('công thức '+r.id+' ra món không có: '+k);}
 return {bad,nw};});
const bad=r.bad.concat(errs.map(e=>'lỗi chạy: '+e));console.log(bad.length?'TB-HONG\n'+bad.slice(0,12).join('\n'):'TB-DAT ('+r.nw+' món mặc)');await b.close();})();
