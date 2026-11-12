const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:500,height:300}});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-b');localStorage.setItem('ldtt-nohd','1')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../../index.html'));await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{window.requestAnimationFrame=()=>0;const out={};
 let gx=0,gz=0,ok=false;for(let r=120;r<1500&&!ok;r+=80)for(let a=0;a<12&&!ok;a++){const x=Math.round((P.x+Math.cos(a)*r)/40)*40,z=Math.round((P.z+Math.sin(a)*r)/40)*40;let mn=1e9,mx=-1e9;for(let i=-3;i<=3;i++)for(let j=-3;j<=3;j++){const h=hAt(x+i*40,z+j*40);mn=Math.min(mn,h);mx=Math.max(mx,h);}if(mx-mn<4&&wdAt(x,z)<=0){gx=x;gz=z;ok=true;}}
 out.flat=ok;const y0=hAt(gx,gz);const b={id:9400,k:'drumStage',x:gx,y:y0,z:gz,r:0,lv:0};S.builds.push(b);structAdd(b,true);for(const i of near(gx,gz,220)){const q=RES[i];if(q.st===0)q.st=1;}
 const sim=(sx,sz,dx,dz,steps)=>{P.x=sx;P.z=sz;P.y=groundY(sx,sz,y0+2);P.air=false;P.vy=0;G.keys={};let maxY=P.y;for(let s=0;s<steps;s++){S.p.stam=100;try{moveTick(1/60)}catch(e){out.e1=String(e)}try{move(dx,dz,0.5,1/60,false)}catch(e){out.e2=String(e)}if(!P.air)P.y=groundY(P.x,P.z);maxY=Math.max(maxY,P.y);}return {x:Math.round(P.x-gx),z:Math.round(P.z-gz),y:Math.round(P.y-y0),my:Math.round(maxY-y0)};};
 out.stairs=sim(gx,gz+75,0,-1,150);        // đi lên từ bậc thang (cạnh +z)
 out.onTopWalk=sim(gx+25,gz+20,-1,0,120);   // (bắt đầu dưới đất trong vùng đài → phải được ra)
 out.fromSide=sim(gx+80,gz,-1,0,200);       // đâm ngang vào đài từ bên hông
 out.fromBack=sim(gx,gz-80,0,1,200);        // từ phía sau
 P.x=gx+25;P.z=gz+25;P.y=y0+25;out.topY=Math.round(groundY(P.x,P.z)-y0);out.drum=(()=>{for(let s=0;s<150;s++){try{moveTick(1/60);move(-0.7,-0.7,0.5,1/60,false)}catch(e){}}return {x:Math.round(P.x-gx),z:Math.round(P.z-gz),y:Math.round(P.y-y0)};})();
 return out;});
console.log(JSON.stringify(r,null,1));console.log(logs.slice(0,5).join('\n'));await b.close();})();
