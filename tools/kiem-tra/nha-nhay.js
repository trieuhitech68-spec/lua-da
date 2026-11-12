const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:500,height:300}});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-b');localStorage.setItem('ldtt-nohd','1')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../../index.html'));await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{window.requestAnimationFrame=()=>0;const out={};
 // tìm chỗ phẳng
 let gx=0,gz=0,ok=false;for(let r=120;r<1500&&!ok;r+=80)for(let a=0;a<12&&!ok;a++){const x=Math.round((P.x+Math.cos(a)*r)/40)*40,z=Math.round((P.z+Math.sin(a)*r)/40)*40;let mn=1e9,mx=-1e9;for(let i=-3;i<=5;i++)for(let j=-3;j<=5;j++){const h=hAt(x+i*40,z+j*40);mn=Math.min(mn,h);mx=Math.max(mx,h);}if(mx-mn<5&&wdAt(x,z)<=0){gx=x;gz=z;ok=true;}}
 out.flat=ok;let n=9300;const y0=hAt(gx+40,gz+40);const mk=(k,x,z,r)=>{const b={id:n++,k,x,y:y0,z,r:r||0,lv:0};S.builds.push(b);structAdd(b,true);return b;};
 for(let i=0;i<2;i++)for(let j=0;j<2;j++){mk('floor',gx+20+i*40,gz+20+j*40);mk('thatchRoof',gx+20+i*40,gz+20+j*40,j?0:2);}
 for(let i=0;i<2;i++){mk(i?'wall':'wallDoor',gx+20+i*40,gz,0);mk('wall',gx+20+i*40,gz+80,0);mk('wall',gx,gz+20+i*40,1);mk('wall',gx+80,gz+20+i*40,1);}
 // xoá vật cản quanh nhà
 for(const i of near(gx+40,gz+40,220)){const q=RES[i];if(q.st===0){q.st=1;}}
 const cx=gx+40,cz=gz+40;out.edges=OCC.edge.size;out.top=solTopAt(cx,cz)-y0;S.p.stam=100;
 const sim=(sx,sz,dx,dz,steps,jump)=>{P.x=sx;P.z=sz;P.y=groundY(sx,sz,y0+8);P.air=false;P.vy=0;G.keys={};let maxY=P.y;for(let s=0;s<steps;s++){S.p.stam=100;if(jump&&s%20===0)G.jumpReq=1;try{moveTick(1/60)}catch(e){out.e1=String(e)}try{move(dx,dz,1,1/60,true)}catch(e){out.e2=String(e)}maxY=Math.max(maxY,P.y);}return {x:Math.round(P.x-cx),z:Math.round(P.z-cz),y:Math.round(P.y-y0),my:Math.round(maxY-y0)};};
 const ins=q=>Math.abs(q.x)<40&&Math.abs(q.z)<40;
 out.inOut=[];out.outIn=[];for(let a=0;a<16;a++){const dx=Math.cos(a/16*6.283),dz=Math.sin(a/16*6.283);
  const q=sim(cx+dx*8,cz+dz*8,dx,dz,300,true);out.inOut.push((ins(q)?'ok':'RA!')+' '+q.x+','+q.z+' y'+q.y+'/'+q.my);
  const q2=sim(cx+dx*110,cz+dz*110,-dx,-dz,300,true);out.outIn.push((ins(q2)?'VAO!':'ok')+' '+q2.x+','+q2.z+' y'+q2.y+'/'+q2.my);}
 // đi qua cửa không nhảy (cửa ở cạnh z=gz, x=gx+20)
 out.door=sim(gx+20,gz-60,0,1,200,false);out.doorOut=sim(gx+20,gz+20,0,-1,200,false);
 // nhảy liên tục dọc sát tường bên ngoài
 out.along=sim(gx-12,gz-12,1,0.15,400,true);
 return out;});
console.log(JSON.stringify(r,null,1));console.log(logs.slice(0,5).join('\n'));await b.close();})();
