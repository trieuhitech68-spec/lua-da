// Gom việc ghi bản lưu: gọi save() dồn dập chỉ ghi thật 1 lần; rời trang, mở Cài đặt, sắp đẩy lên máy chủ thì ghi ngay; bản ghi đúng dữ liệu mới nhất.
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:393,height:852}});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-b');localStorage.setItem('ldtt-nohd','1')}catch(e){}window.__W=0;const _s=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='lua-da-tay-trang-v1')__W++;return _s.apply(this,arguments);};});
const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));await p.goto('file://'+path.resolve(__dirname,'../../index.html'));await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r=await p.evaluate(async()=>{const o={};const wait=ms=>new Promise(r=>setTimeout(r,ms));const day=()=>JSON.parse(localStorage.getItem(SKEY)).day;
  saveNow();const w0=__W;for(let i=0;i<60;i++){S.day=100+i;save();}o.burst=__W-w0;o.pend=LTH2.pend;o.stale=day()!==159;
  dispatchEvent(new Event('pagehide'));o.afterHide=__W-w0;o.fresh=day()===159;
  S.day=200;save();const w1=__W;G.panel='settings';S.day=201;save();o.settingsNow=__W-w1===1&&day()===201;G.panel=null;
  S.day=300;save();o.pend2=LTH2.pend;try{await accPush('khong-co',true);}catch(e){}o.pushFlush=day()===300&&!LTH2.pend;
  LTH2.GAP=1500;LTH2.t=performance.now();S.day=400;save();await wait(2200);o.timerFlush=day()===400;LTH2.GAP=20000;
  uiOpen('settings');await wait(2000);o.box=/Bản lưu:/.test((document.querySelector('.dg-b')||{}).innerText||'');o.luu=ldLuu();return o;});
console.log(JSON.stringify(r));
console.log(r.burst===0&&r.pend===1&&r.stale&&r.afterHide===1&&r.fresh&&r.settingsNow&&r.pend2===1&&r.pushFlush&&r.timerFlush&&r.box&&!logs.length?'LG-DAT':'LG-HONG '+logs.join('|'));await b.close();})();
