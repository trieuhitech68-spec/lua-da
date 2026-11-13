// Rà tương tác: đặt TỪNG công trình (đã dựng xong), đứng cạnh, bấm Hành động; không lỗi chạy, không cảnh báo, nhân vật không văng đi đâu, không kẹt trạng thái.
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:400,height:240}});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-b');localStorage.setItem('ldtt-nohd','1')}catch(e){}});const p=await c.newPage();const logs=[];
p.on('pageerror',e=>logs.push('ERR '+e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' | ').slice(0,200)));p.on('console',m=>{if((m.type()==='warning'||m.type()==='error')&&!/GPU stall|fallback|net::|Failed to load|THREE\.|deprecated|AudioContext/i.test(m.text()))logs.push('['+(globalThis.__cur||'')+'] '+m.text().slice(0,200))});
await p.goto('file://'+path.resolve(__dirname,'../../index.html'));await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r=await p.evaluate(async()=>{const bad=[],o={n:0,acted:0,types:{}};G.R.render=()=>{};if(K3.fx)K3.fx.render=()=>{};window.requestAnimationFrame=()=>0;let T=performance.now()+1e6;const _w=console.warn;console.warn=function(){try{bad.push('['+window.__cur+'] '+[...arguments].map(a=>a&&a.message?a.message:String(a)).join(' ').slice(0,160));}catch(e){}return _w.apply(this,arguments);};
  const ff=async s=>{const n=Math.round(s*20);for(let i=0;i<n;i++){T+=50;try{loop(T);}catch(e){bad.push('['+window.__cur+'] LOOP '+e.message);return;}}await new Promise(r=>setTimeout(r,0));};
  let gx=0,gz=0,ok=false;for(let r=120;r<2400&&!ok;r+=80)for(let a=0;a<12&&!ok;a++){const x=Math.round((P.x+Math.cos(a)*r)/40)*40,z=Math.round((P.z+Math.sin(a)*r)/40)*40;let mn=1e9,mx=-1e9,wet=0;for(let i=-4;i<=6;i++)for(let j=-4;j<=6;j++){const h=hAt(x+i*40,z+j*40);mn=Math.min(mn,h);mx=Math.max(mx,h);if(wdAt(x+i*40,z+j*40)>0)wet=1;}if(mx-mn<14&&!wet){gx=x;gz=z;ok=true;}}
  for(const i of near(gx,gz,400)){const q=RES[i];if(q.st===0)q.st=1;}for(const a of G.animals)a.alive=false;give({wood:30,stick:30,fiber:30,stone:20,meat:5,fish:3,clay:10,flint:5,rope:10,seedFlax:5,water:2,berry:10});S.age=4;for(const k in S.sk||{})S.sk[k]=Math.max(S.sk[k]||0,900);
  let n=20000;const ids=BUILD.map(d=>d.id);
  for(const id of ids){const d=pieceDef(id);if(!d)continue;window.__cur=id;o.n++;G.work=null;G.act=null;G.sit=false;G.sleeping=false;G.keys={};G.ride=null;G.panel&&uiClose();S.p.hp=100;S.p.stam=100;S.p.food=80;S.p.water=80;S.hour=10;
    const fp=d.fp||[1,1],x=d.kind==='edge'?gx+20:d.kind==='corner'?gx:gx+fp[0]*20,z=d.kind==='edge'?gz:d.kind==='corner'?gz:gz+fp[1]*20,bb={id:n++,k:id,x,y:hAt(x,z),z,r:0,lv:0};
    try{S.builds.push(bb);structAdd(bb,true);if(d.store)S.store[bb.id]=Array(d.store).fill(null);if(typeof S.fuel==='object'&&S.fuel&&(d.st==='campfire'||d.fuel))S.fuel[bb.id]=300;}catch(e){bad.push('['+id+'] đặt lỗi: '+e.message);continue;}
    const R=Math.max(fp[0],fp[1])*20+14;P.x=x;P.z=z-R;P.y=groundY(P.x,P.z);P.ry=0;P.air=false;P.vy=0;const x0=P.x,z0=P.z;
    try{await ff(0.25);const t=findTarget();if(t){o.types[t.type]=(o.types[t.type]||0)+1;const inf=targetInfo(t);if(inf&&inf.ok!==false){actStart(t);o.acted++;}await ff(1.5);if(G.panel){try{uiClose();}catch(e){bad.push('['+id+'] đóng bảng lỗi: '+e.message);}}if(G.work){try{workStop('');}catch(e){}}if(G.sit){try{sitToggle(false);}catch(e){G.sit=false;}}await ff(0.3);}}
    catch(e){bad.push('['+id+'] '+e.message+' '+String(e.stack).split('\\n')[1].trim().slice(0,90));}
    if(!isFinite(P.x)||!isFinite(P.y)||!isFinite(P.z)){bad.push('['+id+'] toạ độ hỏng');P.x=x0;P.z=z0;P.y=groundY(x0,z0);}
    else if(Math.hypot(P.x-x0,P.z-z0)>260)bad.push('['+id+'] nhân vật bị văng xa '+Math.round(Math.hypot(P.x-x0,P.z-z0)));
    if((G.sleeping&&!d.bed&&!d.shelter)||G.ride||(G.climb&&!/tower|ladder|stair/i.test(id)))bad.push('['+id+'] kẹt trạng thái '+(G.sleeping?'ngủ':G.ride?'cưỡi':'leo'));G.sleeping=false;G.ride=null;G.climb=null;
    try{structRemove(bb);}catch(e){bad.push('['+id+'] gỡ lỗi: '+e.message);}const ix=S.builds.indexOf(bb);if(ix>=0)S.builds.splice(ix,1);try{delete S.store[bb.id];}catch(e){}}
  o.bad=[...new Set(bad)];return o;});
console.log(JSON.stringify({n:r.n,acted:r.acted,types:r.types}));const all=r.bad.concat(logs.filter(l=>!r.bad.some(x=>l.indexOf(x.slice(0,30))>=0)).slice(0,10));console.log(all.length?'TT-HONG '+all.length+' :: '+all.slice(0,30).join(' ;; ').slice(0,3200):'TT-DAT');await b.close();})();
