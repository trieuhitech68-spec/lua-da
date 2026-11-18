// Nhiều vùng định cư: có 9 vùng mới + Cổng Muôn Nẻo; sang vùng mới dựng được thế giới không lỗi; quay về nhà cũ còn nguyên; lãnh thổ, vùng chung chỉ có hiệu lực ở vùng của nó.
const {chromium}=require('playwright');const HTML=process.argv[2]||require('path').resolve(__dirname,'../../index.html');const SHOT=process.argv[3];
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:390,height:800},isMobile:true,hasTouch:true});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-f');localStorage.setItem('ldtt-nohd','1');localStorage.setItem('ld-dl','0')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));
await p.goto('file://'+HTML);await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
const ready=async()=>{await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model&&typeof REG!=='undefined'&&REG.length&&!S.landArr,null,{timeout:300000});await p.waitForTimeout(4000);};
await click('Tạo nhân vật mới');await click('Bắt đầu');await ready();
const info=()=>p.evaluate(()=>({land:S.land,wv:S.wv,wv0:S.wv0,seed:S.seed,gates:LD.gates.map(g=>g.to).join(','),res:RES.length,an:G.animals.length,h:+hAt(P.x,P.z).toFixed(1),wd:+wdAt(P.x,P.z).toFixed(1),builds:S.builds.filter(b=>!b.remote).length,palm:RES.filter(q=>q.t==='palm').length,reg:REG.length}));
const o={};
o.a=await p.evaluate(()=>{const r={};r.n=LANDS.filter(L=>L.home).length;r.hub=LANDS.some(L=>L.hub);r.tbSeed=landSeed('tb')===((seed0()*31+1*7919)%2000000000)+1;
  let n=9700;const bq={id:n,k:'campfire',x:Math.round(P.x/CELL)*CELL+20,y:0,z:Math.round(P.z/CELL)*CELL+20,r:0,lv:0};bq.y=hAt(bq.x,bq.z);S.builds.push(bq);structAdd(bq,true);
  const g=LD.gates.find(x=>x.to==='*');r.gate=!!g;if(g){const ti=targetInfo({type:'ldgate',g,d:10,b:{x:g.x,y:0,z:g.z}});r.verb=ti&&ti.verb;actStart({type:'ldgate',g,d:10,b:{x:g.x,y:0,z:g.z}});const el=document.getElementById('nvw');r.open=!!(el&&!el.hidden);r.rows=el?el.querySelectorAll('.nv-r').length:0;r.go=el?el.querySelectorAll('[data-nv="go"]:not([disabled])').length:0;r.w=el?el.querySelector('.nv-card').scrollWidth<=el.querySelector('.nv-card').clientWidth+1:false;}
  // luật theo vùng
  r.zHere=!!mpZoneHere({x:10,z:10,r:200});r.zOther=mpZoneHere({x:10,z:10,r:200,l:'d1'});r.zRaw=(mpZoneRaw({x:10,z:10,r:200,l:'d1'})||{}).l;r.clanDoc=mpClanDoc({name:'a',leader:'u',members:['u'],color:'#fff',emblem:'🔥',createdAt:1,zone:null,zoneRaw:{x:1,z:2,r:200,l:'d2'},deny:[]},{members:['u','v']}).zone.l;return r;});
if(SHOT)await p.screenshot({path:SHOT});
o.c0=await info();
await p.evaluate(()=>{mnClose();S.mounts=[{id:1,k:'horse',n:'Ngựa thử',x:P.x+20,z:P.z,ry:0,land:mtLand()}];mtShow(S.mounts[0]);mtRide(S.mounts[0]);S.folk=S.folk||[];for(let i=0;i<3;i++)S.folk.push({n:'Lính '+i,job:'soldier',x:P.x+30+i*10,z:P.z+30,seed:i+1,hp:10});S.folk.push({n:'Dân',job:'gather',x:P.x+40,z:P.z+40,seed:9,hp:10});qdS().cmd='follow';landGo('d5');});await p.waitForTimeout(6000);await ready();o.d5=await info();
o.d5x=await p.evaluate(()=>{const r={};r.mnt=!!G.mnt;r.sold=(S.folk||[]).filter(f=>f.job==='soldier').length;r.other=(S.folk||[]).filter(f=>f.job!=='soldier').length;r.sd=Math.round(Math.max(0,...(S.folk||[]).map(f=>Math.hypot(f.x-P.x,f.z-P.z))));r.claimWhy=mpClaimWhy(SPAWN[0]+900,SPAWN[1]+900,160,'claim');r.cur=landCur().n;r.home=!!landCur().home;return r;});
await p.evaluate(()=>{landGo('c');});await p.waitForTimeout(6000);await ready();o.c1=await info();
console.log(JSON.stringify(o));const a=o.a,d=o.d5;
const ok=a.n===9&&a.hub&&a.tbSeed&&a.gate&&a.open&&a.rows===12&&a.go>=9&&a.w&&/Chọn vùng/.test(a.verb||'')&&a.zHere&&a.zOther===null&&a.zRaw==='d1'&&a.clanDoc==='d2'
  &&d.land==='d5'&&d.wv===3&&o.d5x.mnt&&o.d5x.sold===3&&o.d5x.other===0&&o.d5x.sd<400&&d.seed!==o.c0.seed&&/c/.test(d.gates)&&/\*/.test(d.gates)&&d.res>5000&&d.an>50&&d.h>1&&d.wd<=0&&d.builds===0&&!/tranh chấp/.test(o.d5x.claimWhy||'')&&o.d5x.home
  &&o.c1.land==='c'&&o.c1.seed===o.c0.seed&&o.c1.builds===o.c0.builds&&o.c1.builds>=1&&o.c1.wv===o.c0.wv&&!logs.length;
console.log(ok?'NVG-DAT':'NVG-HONG '+logs.join('|'));await b.close();})();
