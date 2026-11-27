// Bản đồ phóng sâu: bản đồ tỉnh tới ×28, bản đồ đại lục tới ×220; khi phóng gần vẽ nhà đúng hình, tường theo cạnh, cây đá từng cái, có thước đo; không lỗi.
// Chạy: node ban-do.js [thư mục ảnh]   (DL=1: chạy trên đại lục) → BD-DAT / BD-HONG
const {chromium}=require('playwright');const path=require('path');const OUT=process.argv[2];const DLX=process.env.DL==='1';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await c.addInitScript(dl=>{try{localStorage.setItem('ldtt-news','2026-11-h');localStorage.setItem('ldtt-nohd','1');localStorage.setItem('ldtt-kt','1');localStorage.setItem('ld-dl',dl?'1':'0')}catch(e){}},DLX);
  const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));await p.goto('file://'+path.resolve(__dirname,'../../index.html'));await p.waitForTimeout(5000);
  const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
  await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:300000});await p.waitForTimeout(3000);
  const r0=await p.evaluate(()=>{let n=40000;const gx=Math.round(P.x/CELL)*CELL,gz=Math.round(P.z/CELL)*CELL;const mk=(k,dx,dz,r)=>{const x=gx+dx,z=gz+dz,b={id:n++,k,x,y:hAt(x,z),z,r:r||0,lv:0};S.builds.push(b);structAdd(b,true);return b;};
    // một ngôi nhà 2×2 ô (sàn + tường bốn phía + cửa), bếp, rương, giường, hàng rào xoay ngang dọc
    for(const [dx,dz] of [[0,0],[CELL,0],[0,CELL],[CELL,CELL]])mk('floor',120+dx,dz);
    mk('wall',120,-CELL/2,0);mk('wall',120+CELL,-CELL/2,0);mk('wall',120,CELL*1.5,0);mk('door',120+CELL,CELL*1.5,0);mk('wall',120-CELL/2,0,1);mk('wall',120-CELL/2,CELL,1);mk('wall',120+CELL*1.5,0,1);mk('wall',120+CELL*1.5,CELL,1);
    mk('campfire',40,80);mk('chest',200,120);for(let i=0;i<5;i++)mk('fence',-200+i*CELL,-160,0);for(let i=0;i<4;i++)mk('fence',-200-CELL/2,-160+CELL/2+i*CELL,1);
    try{for(let i=0;i<(S.fogm||[]).length;i++)S.fogm[i]=-1;}catch(e){}return {n:S.builds.length,dl:!!(typeof DL==='object'&&DL.on)};});
  const shots=[];const bad=[];
  const snap=async(name)=>{await p.waitForTimeout(900);const el=await p.$(r0.dl?'#dlmap':'#mapcv');if(!el){bad.push('không có khung bản đồ '+name);return;}if(OUT)await el.screenshot({path:path.join(OUT,(r0.dl?'dl-':'tinh-')+name+'.png')});shots.push(name);};
  await p.evaluate(()=>uiOpen('map',{}));await p.waitForTimeout(1500);
  const setV=async z=>{await p.evaluate(z=>{if(DL&&DL.on){DL.mv={z:z/1.6,cx:P.x+DL.ox+60,cz:P.z+DL.oz+40};document.querySelector('[data-a="dlz"][data-v="in"]').click();}else{G.mapV={z,cx:P.x+60,cz:P.z+40};mapDraw();}},z);await p.waitForTimeout(1400);await p.evaluate(()=>{if(DL&&DL.on){DL.mv.z*=1.6;document.querySelector('[data-a="dlz"][data-v="out"]').click();}else mapDraw();});};
  const r=await p.evaluate(dl=>{if(dl){DL.mv={z:1e6,cx:P.x+DL.ox,cz:P.z+DL.oz};document.querySelector('[data-a="dlz"][data-v="in"]').click();return {zmax:Math.round(DL.mv.z)};}G.mapV={z:1,cx:0,cz:0};mapZoom(1e9,P.x+60,P.z+40);return {zmax:G.mapV.z};},r0.dl);
  for(const z of (r0.dl?[1,8,30,90,220]:[1,3,8,16,28])){await setV(z);await snap('z'+z);}
  const det=await p.evaluate(dl=>dl?!!(DL.mdet&&DL.mdet.cv):!!(G.mapDet&&G.mapDet.cv&&G.mapDet.cv.width>=260),r0.dl);
  console.log(JSON.stringify({r0,r,shots,det}));
  if(r.zmax<(r0.dl?200:25))bad.push('phóng tối đa chỉ '+r.zmax);if(!det)bad.push('không dựng ảnh chi tiết');if(logs.length)bad.push(logs.slice(0,3).join(' | '));
  console.log(bad.length?'BD-HONG '+bad.join('; '):'BD-DAT');await b.close();process.exit(bad.length?1:0);})();
