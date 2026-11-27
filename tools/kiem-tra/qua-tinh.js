// QUA TỈNH TRÊN ĐẠI LỤC: vòng tường bao đè lên điểm chuyển tỉnh, nhân vật đi bộ từ trong vòng qua ranh giới.
// Đúng: vị trí không bị dời (toạ độ đại lục liền), tường vẫn ở nguyên chỗ và vẫn chặn (không lọt ra ngoài vòng tường), không tải lại trang.
// In thêm khoảng đứng hình dài nhất lúc qua tỉnh (maxBlock, ms) để theo dõi qua từng đợt làm liền mạch; MAXBLOCK=… thì vượt mốc là hỏng.
// Chạy: node qua-tinh.js → QT-DAT / QT-HONG
const {chromium}=require('playwright');const path=require('path');const MAXB=+process.env.MAXBLOCK||0;
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:600,height:400}});
  await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-h');localStorage.setItem('ldtt-nohd','1');localStorage.setItem('ldtt-kt','1');localStorage.setItem('ld-dl','1');sessionStorage.setItem('qt-nap',String((+sessionStorage.getItem('qt-nap')||0)+1));}catch(e){}
    window.__LT=[];try{new PerformanceObserver(l=>{for(const e of l.getEntries())__LT.push([Math.round(e.startTime),Math.round(e.duration)]);}).observe({entryTypes:['longtask']});}catch(e){}});
  const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push(e.message));await p.goto('file://'+path.resolve(__dirname,'../../index.html'));await p.waitForTimeout(5000);
  const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
  await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:300000});await p.waitForTimeout(3000);
  const nap0=await p.evaluate(()=>+sessionStorage.getItem('qt-nap'));
  /* máy thử vẽ hình bằng phần mềm (~0,4 giây mỗi khung): tắt vẽ để chỉ đo phần việc của game */
  await p.evaluate(()=>{const n=()=>{};const fix=()=>{try{G.R.render=n;if(K3.fx)K3.fx.render=n;}catch(e){}};fix();setInterval(fix,50);});
  // vòng tường 12×6 ô (480×240 đơn vị) có tâm ngay điểm chuyển tỉnh phía đông (ranh giới + 50 m)
  const r0=await p.evaluate(()=>{const A=dlA(),cx=Math.round((A/2+1000)/CELL)*CELL,cz=Math.round(P.z/CELL)*CELL,W=6,H=3;let n=60000;const walls=[];
    const mk=(k,x,z,r)=>{const b={id:n++,k,x,y:hAt(x,z),z,r,lv:0};S.builds.push(b);structAdd(b,true);walls.push(b);return b;};
    for(let i=-W;i<W;i++){mk('wall',cx+i*CELL+20,cz-H*CELL,0);mk('wall',cx+i*CELL+20,cz+H*CELL,0);}for(let j=-H;j<H;j++){mk('wall',cx-W*CELL,cz+j*CELL+20,1);mk('wall',cx+W*CELL,cz+j*CELL+20,1);}
    P.x=cx-W*CELL+60;P.z=cz;P.y=groundY(P.x,P.z);G.walkTo=null;window.__W=walls.map(b=>b.id);
    return {A,ring:[cx-W*CELL+DL.ox,cx+W*CELL+DL.ox,cz-H*CELL+DL.oz,cz+H*CELL+DL.oz],n:walls.length,land:S.land};});
  // đi bộ về phía đông qua điểm chuyển tỉnh, rồi tiếp tục húc vào tường phía đông, rồi quay lại húc tường phía tây
  const r=await p.evaluate(R=>new Promise(res=>{const g=()=>[P.x+DL.ox,P.z+DL.oz];const land0=S.land;let last=g(),jump=0,shiftT=null,phase=0,t0=performance.now(),lt0=__LT.length,minX=1e9,maxX=-1e9;
    let stuck=0,px=P.x;const iv=setInterval(()=>{try{if(G.on&&!DL.busy&&!G.ldLeaving){const dir=phase===0||phase===1?1:-1;const nx=P.x+dir*5,cc=collide(nx,P.z);if(cc){P.x=cc[0];P.z=cc[1];}else P.x=nx;P.y=groundY(P.x,P.z,P.y);
          /* trước khi qua tỉnh mà vướng cây đá trong vòng tường thì bước vòng qua (không phải việc của bài này) */if(phase===0){if(Math.abs(P.x-px)<1){if(++stuck>25){P.z+=(stuck%2?1:-1)*30;stuck=0;}}else stuck=0;px=P.x;}}
        const cur=g();if(!DL.busy&&G.on){const j=Math.hypot(cur[0]-last[0],cur[1]-last[1]);if(j>jump)jump=j;last=cur;}if(!DL.busy&&G.on&&!G.ldLeaving){minX=Math.min(minX,cur[0]);maxX=Math.max(maxX,cur[0]);}
        if(phase===0&&S.land!==land0&&!DL.busy&&G.on){phase=1;shiftT=performance.now();}
        if(phase===1&&performance.now()-shiftT>6000)phase=2;
        if(phase===2&&performance.now()-shiftT>12000){clearInterval(iv);const L=__LT.slice(lt0);res({land0,land:S.land,jump:Math.round(jump),minX:Math.round(minX),maxX:Math.round(maxX),ring:R.ring,
          maxBlock:L.reduce((m,e)=>Math.max(m,e[1]),0),blocks:L.filter(e=>e[1]>200).map(e=>e[1]),walls:__W.map(id=>S.builds.find(b=>b.id===id)).filter(Boolean).map(b=>[Math.round(b.x+DL.ox),Math.round(b.z+DL.oz)])});}
        if(performance.now()-t0>120000){clearInterval(iv);res({timeout:1,land:S.land,busy:DL.busy,on:G.on,lv:G.ldLeaving,noIn:DL.noIn,phase,last:DL.lastMs});}}catch(e){clearInterval(iv);res({err:e.message});}},40);}),r0);
  const nap1=await p.evaluate(()=>+sessionStorage.getItem('qt-nap')).catch(()=>-1);
  const bad=[];if(r.err||r.timeout)bad.push('không chạy hết: '+JSON.stringify(r));else{
    if(r.land===r.land0)bad.push('không qua được tỉnh');
    if(r.jump>40)bad.push('bị dời chỗ '+r.jump+' đơn vị');
    if(r.walls.length!==r0.n)bad.push('mất tường: còn '+r.walls.length+'/'+r0.n);
    if(r.maxX>r.ring[1]-4||r.minX<r.ring[0]+4)bad.push('lọt qua tường: x '+r.minX+'..'+r.maxX+' trong vòng '+r.ring[0]+'..'+r.ring[1]);
    if(nap1!==nap0)bad.push('trang bị tải lại khi qua tỉnh');if(MAXB&&r.maxBlock>MAXB)bad.push('đứng hình '+r.maxBlock+' ms (mốc '+MAXB+')');}
  if(logs.length)bad.push('lỗi: '+logs.slice(0,2).join(' | '));
  console.log(JSON.stringify({r0,r:Object.assign({},r,{walls:undefined}),nap:[nap0,nap1]}));
  console.log(bad.length?'QT-HONG '+bad.join('; '):'QT-DAT đứng hình dài nhất '+r.maxBlock+' ms');await b.close();process.exit(bad.length?1:0);})();
