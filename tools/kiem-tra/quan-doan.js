// Đạo quân: 4 đội hình không ai chồng lên ai, Giữ chỗ đứng yên khi người chơi đi xa, Theo tôi thì bám theo, cung thủ bắn từ xa, kỵ binh dùng ngựa đã thuần (người chơi không cưỡi được ngựa đó), bảng điều khiển bấm được.
const {chromium}=require('playwright');const HTML=process.argv[2]||require('path').resolve(__dirname,'../../index.html');const SHOT=process.argv[3];
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:SHOT?{width:1000,height:600}:{width:390,height:800}});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-h');localStorage.setItem('ldtt-nohd','1');localStorage.setItem('ldtt-kt','1');localStorage.setItem('ld-dl','0')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));p.on('console',m=>{if(m.type()==='warning'&&/đạo quân/.test(m.text()))logs.push(m.text())});
await p.goto('file://'+HTML);await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{const o={};let n=9800;const mk=(k,dx,dz)=>{const b={id:n++,k,x:P.x+dx,y:hAt(P.x+dx,P.z+dz),z:P.z+dz,r:0,lv:0};S.builds.push(b);structAdd(b,true);return b;};
  G.animals.forEach(a=>{if(Math.hypot(a.x-P.x,a.z-P.z)<1500)a.x+=4000;});if(G.foes)G.foes.length=0;mk('campfire',30,0);S.hour=10;
  const F=i=>({n:'L'+i,role:'hunter',seed:700+i,sex:'m',job:'soldier',x:P.x+10+i*3,z:P.z+10,fed:TNOW(),lv:2});S.folk=[];for(let i=0;i<13;i++)S.folk.push(F(i));
  const run=s=>{for(let i=0;i<60*s;i++){G.t+=1/60;folkTick(1/60);}};const minD=()=>{let m=1e9;const L=S.folk;for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++)m=Math.min(m,Math.hypot(L[i].x-L[j].x,L[i].z-L[j].z));return +m.toFixed(1);};
  const A=qdS();o.forms={};for(const f of ['line','col','wedge','circle']){A.form=f;A.cmd='follow';run(25);o.forms[f]=minD();}
  // thứ tự: khiên đứng gần người chơi hơn cung
  A.form='line';run(15);const dist=arm=>{const L=S.folk.filter(f=>f.arm===arm);return L.reduce((x,f)=>x+Math.hypot(f.x-P.x,f.z-P.z),0)/Math.max(1,L.length);};o.order=dist('shield')<dist('bow');
  // giữ chỗ / theo tôi
  uiOpen('dan',{});o.box=!!document.querySelector('#panel .qd-box');document.querySelector('#panel [data-a="qdcmd"][data-v="hold"]').click();o.cmd=A.cmd;const p0=S.folk.map(f=>[f.x,f.z]);const px=P.x,pz=P.z;P.x+=600;run(15);o.held=S.folk.every((f,i)=>Math.hypot(f.x-p0[i][0],f.z-p0[i][1])<3);
  document.querySelector('#panel [data-a="qdcmd"][data-v="follow"]').click();run(20);o.followed=S.folk.every(f=>Math.hypot(f.x-P.x,f.z-P.z)<260);
  // cung thủ bắn từ xa
  const w=G.animals.find(a=>a.kind==='wolf'&&a.alive);w.x=P.x;w.z=P.z+190;w.state='chase';w.o.visible=true;const hp0=w.hp;const _at=animalsTick;let shots=0;const _qs=qdShot;qdShot=function(){shots++;return _qs.apply(this,arguments);};for(let i=0;i<60*4;i++){G.t+=1/60;w.state='chase';w.x=P.x;w.z=P.z+190;folkTick(1/60);}qdShot=_qs;o.shots=shots;o.hurt=w.hp<hp0||!w.alive;w.alive=false;w.o.visible=false;w.state='wander';
  // binh chủng + kỵ binh
  const c0=S.folk.filter(f=>f.arm==='bow').length;uiOpen('dan',{});document.querySelector('#panel [data-a="qdarm"][data-v="bow"]').click();o.armPlus=S.folk.filter(f=>f.arm==='bow').length-c0;
  if(!Array.isArray(S.mounts))S.mounts=[];const m={id:55,k:'horse',n:'Ngựa thử',x:P.x+40,z:P.z,ry:0,land:typeof mtLand==='function'?mtLand():0};S.mounts.push(m);mtShow(m);uiOpen('dan',{});document.querySelector('#panel [data-a="qdcav"][data-v="1"]').click();o.cav=m.sol!=null;mtRide(m);o.rideBlocked=!G.mnt;
  run(20);const cv=S.folk.find(f=>f.uid===m.sol);o.cavSeat=cv?+(cv._o.position.y-groundY(cv.x,cv.z,cv._o.position.y)).toFixed(1):0;o.horseUnder=cv?Math.hypot(MT.o.get(m.id).position.x-cv.x,MT.o.get(m.id).position.z-cv.z)<1:false;
  uiOpen('dan',{});document.querySelector('#panel [data-a="qdcav"][data-v="-1"]').click();o.cavOff=m.sol==null;const body=document.querySelector('#panel .p-body');o.overflowX=body.scrollWidth>body.clientWidth+2;uiClose();
  // chiêu mộ dân binh: cần Trại lính + giường trống + 4 thịt chín + 1 giáo
  /* quân số giờ do tướng quyết định (tuonglinh.js): cho đạo quân thử một tướng cấp cao để còn suất chiêu mộ */try{const s0=S.folk.find(f=>f.job==='soldier');if(s0)S.tg={list:[{uid:qdUid(s0),lv:30,xp:0,st:5,sp:'spear'}]};}catch(e){}
  const n0=S.folk.length;for(let i=0;i<S.inv.length;i++)S.inv[i]=null;S.inv[0]={id:'meatCooked',n:12};S.inv[1]={id:'spear',n:3};uiOpen('dan',{});o.rcNoCamp=!document.querySelector('#panel [data-a="qdrc"]')||(document.querySelector('#panel [data-a="qdrc"]').click(),S.folk.length===n0);
  const rf=mk('roof',200,200);rf.ht='qh_linh';rf.hg=1;G._cnT=null;const b1=mk('hammock',220,200),b2=mk('hammock',240,200);if(G.panel)uiClose();uiOpen('dan',{});document.querySelector('#panel [data-a="qdrc"]').click();document.querySelector('#panel [data-a="qdrc"]').click();o.recruited=S.folk.length-n0;o.rcJobs=S.folk.slice(n0).every(f=>f.job==='soldier'&&f.arm==='spear'&&f.bed&&f.uid);o.rcPaid=invCount('meatCooked')===4&&invCount('spear')===1;
  document.querySelector('#panel [data-a="qdrc"]').click();o.rcNoBed=S.folk.length-n0===2;if(G.panel)uiClose();
  // lính đổi việc thì ngựa được trả
  m.sol=qdUid(S.folk[0]);S.folk[0].job='idle';G.t+=5;run(1);o.returned=m.sol==null;S.folk[0].job='soldier';return o;});
console.log(JSON.stringify(r));
if(SHOT){await p.evaluate(()=>{S.hour=11;const A=qdS();A.form='wedge';A.cmd='follow';const m=S.mounts[0];m.sol=qdUid(S.folk[3]);S.mounts.push({id:56,k:'horse',n:'N2',x:P.x,z:P.z,ry:0,land:m.land,sol:qdUid(S.folk[4])});mtShow(S.mounts[1]);P.ry=0.6;S.view='tp';viewApply();document.querySelectorAll('[aria-label="Đóng"]').forEach(x=>{try{x.click()}catch(e){}});});await p.waitForTimeout(9000);await p.screenshot({path:SHOT});}
const ok=Object.values(r.forms).every(d=>d>=15)&&r.order&&r.box&&r.cmd==='hold'&&r.held&&r.followed&&r.shots>=1&&r.hurt&&r.armPlus===1&&r.cav&&r.rideBlocked&&r.cavSeat>10&&r.horseUnder&&r.cavOff&&!r.overflowX&&r.rcNoCamp&&r.recruited===2&&r.rcJobs&&r.rcPaid&&r.rcNoBed&&r.returned&&!logs.length;
console.log(ok?'QD-DAT':'QD-HONG '+logs.join('|'));await b.close();})();
