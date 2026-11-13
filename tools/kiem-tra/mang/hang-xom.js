// Đo chi phí xét lại công trình hàng xóm khi máy chủ đông (800 đất cắm, 10 hàng xóm × 400 công trình)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const html=process.argv[2]||path.resolve(__dirname,'../../../index.html');
(async()=>{
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const c=await b.newContext({viewport:{width:390,height:844}});
  await c.addInitScript(fs.readFileSync(path.join(__dirname,'mock.js'),'utf8').replace("put('world/s2',{seed:777,wv:3});","").replace(/for\(let i=0;i<150;i\+\+\)/,"for(let i=0;i<3;i++)"));
  const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));
  await p.goto('file://'+html);await p.waitForTimeout(6000);
  const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
  await click('Tạo nhân vật mới');await p.waitForTimeout(2500);await click('Bắt đầu');await p.waitForTimeout(16000);
  const r=await p.evaluate(()=>{const o={};for(let i=0;i<800;i++)MP.claims['q'+i]={x:(i%40)*500-9000,z:Math.floor(i/40)*500-5000,r:200};
    for(let k=0;k<10;k++){const u='n'+k,raw=[];MP.claims[u]={x:P.x+3000+k*600,z:P.z,r:300};for(let i=0;i<400;i++)raw.push({lid:i,k:'wall',x:P.x+3000+k*600+(i%20)*10-100,y:0,z:P.z+Math.floor(i/20)*10-100,r:0,lv:0});MP.braw.set(u,raw);MP.bsub.set(u,{un(){},ver:'x'});}
    const run=()=>{MP.dirty.remote=true;MP.tick.mem=-9;MP.tick.near=1e12;const t=performance.now();mpTick(0.016);return performance.now()-t;};
    o.first=+run().toFixed(1);o.tot=MP.rTot;const a=[];for(let i=0;i<5;i++)a.push(run());o.again=+(a.reduce((x,y)=>x+y,0)/5).toFixed(2);
    // đất cắm đổi thật: phải xét lại, công trình ngoài đất bị ẩn
    MP.claims.n0={x:P.x-9999,z:P.z,r:50};o.changed=+run().toFixed(1);o.tot2=MP.rTot;MP.rq.length=0;return o;});
  console.log(JSON.stringify(r));console.log(r.tot>=3000&&r.again<3&&r.tot2<r.tot&&!logs.length?'HX-DAT':'HX-HONG '+logs.join('|'));await b.close();})();
