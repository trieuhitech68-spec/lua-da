// Thú nuôi, thú cưỡi không mất tích (gọi về, tự về làng, đói không bỏ đi) + khu đã khai phá sạch hẳn (không mọc lại, nền san nhổ sạch, thú hoang ra ngoài).
const {chromium}=require('playwright');const HTML=process.argv[2]||require('path').resolve(__dirname,'../../index.html');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:390,height:800},isMobile:true,hasTouch:true});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-d');localStorage.setItem('ldtt-nohd','1')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));
await p.goto('file://'+HTML);await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r=await p.evaluate(async()=>{const o={};let n=9700;const mk=(k,x,z)=>{const bq={id:n++,k,x,y:hAt(x,z),z,r:0,lv:0};S.builds.push(bq);structAdd(bq,true);return bq;};const cx=Math.round(P.x/CELL)*CELL,cz=Math.round(P.z/CELL)*CELL;
  mk('campfire',cx+20,cz+20);mk('hammock',cx+100,cz+20);
  // 1) thú cưỡi: ở xa, gọi về
  S.mounts=[{id:1,k:'horse',n:'Ngựa thử',x:P.x+1500,z:P.z+900,ry:0,land:mtLand()}];try{mtShow(S.mounts[0]);}catch(e){}o.mHtml=ctMountHtml().includes('data-a="tvcall"');tvCall(S.mounts[0]);o.mDist=Math.round(Math.hypot(S.mounts[0].x-P.x,S.mounts[0].z-P.z));
  // 2) vật nuôi: ở xa thì về làng; đói lâu không bỏ đi
  S.pets=[{id:1,k:'chicken',x:P.x+2000,z:P.z+1500,hx:P.x+2000,hz:P.z+1500,born:TNOW()-9,fed:TNOW()-6},{id:2,k:'pig',x:P.x-1800,z:P.z+300,born:TNOW()-9,fed:TNOW()}];try{petsInit();}catch(e){}o.stray0=tvStray();const C=cdCenter();o.petD=S.pets.map(q=>Math.round(Math.hypot(q.x-C.x,q.z-C.z)));
  try{petsHourly(1);}catch(e){o.phErr=String(e);}o.petsLeft=S.pets.length;o.pHtml=ctPetHtml().includes('data-a="tvpets"');
  // 3) khu đã khai phá
  kpRefresh(true);o.zin=kpIn(cx+20,cz+20);o.zout=kpIn(cx+2500,cz+2500);
  const live=RES.filter(q=>q.st===0&&!q.lock&&!RT[q.t].pass);const nearQ=live.filter(q=>Math.hypot(q.x-cx,q.z-cz)>300&&Math.hypot(q.x-cx,q.z-cz)<1500).sort((a,b)=>Math.hypot(a.x-cx,a.z-cz)-Math.hypot(b.x-cx,b.z-cz));
  const qa=nearQ.find(q=>!RT[q.t].seasons),qb=nearQ.find(q=>!RT[q.t].seasons&&q!==qa&&Math.hypot(q.x-qa.x,q.z-qa.z)>400);
  if(qa&&qb){mk('basket',qa.x+34,qa.z);kpRefresh(true);o.qaIn=kpIn(qa.x,qa.z);o.qbIn=kpIn(qb.x,qb.z);for(const q of [qa,qb]){q.st=1;q.hp=0;S.res[q.i]=[1,TNOW()-1];}resRegrow();o.regIn=qa.st;o.regOut=qb.st;}
  // 4) nền đã san: thứ còn sống và thứ ngủ theo mùa đều bị nhổ, sang mùa không mọc lại
  const qc=nearQ.find(q=>q!==qa&&q!==qb&&q.st===0&&!kpIn(q.x,q.z));const qs=RES.find(q=>RT[q.t].seasons&&!S.res[q.i]&&!q.lock&&!kpIn(q.x,q.z)&&q!==qc);if(qs){qs.st=2;qs.hp=0;}o.seas=RES.filter(q=>RT[q.t].seasons).length;
  S.flat=S.flat||[];if(qc)S.flat.push({x:qc.x+10,z:qc.z,r:110,h:hAt(qc.x,qc.z)});if(qs)S.flat.push({x:qs.x+10,z:qs.z,r:110,h:hAt(qs.x,qs.z)});kpRefresh(true);o.flatLive=qc?qc.st:-1;
  if(qs){qs.st=0;/* giả lập sang mùa nó tỉnh dậy */const m=S.res[qs.i];o.sMark=m&&m[0];resSeasonal();o.sAfter=qs.st;}else o.sAfter=-1;
  // 5) thú hoang trong khu bị đưa ra ngoài
  const a=G.animals.find(x=>x.alive&&x.kind==='snake')||G.animals.find(x=>x.alive&&!(x.tame>0));if(a){a.x=cx+30;a.z=cz+60;a.home={x:a.x,z:a.z};a.state='wander';a.angry=false;if(a.o)a.o.visible=false;o.dbg=JSON.stringify({out:kpOut(a.x,a.z),tame:a.tame,st:a.state,calm:a.calm,t:G.t,sz:KP.g.size});kpAnimals();o.anIn=kpIn(a.x,a.z);o.anHome=kpIn(a.home.x,a.home.z);o.anKind=a.kind;}
  // 6) san nền chỗ còn cây lớn: có rìu thì cho san (đốn luôn), không rìu thì báo rõ
  {const t=RES.find(q=>q.st===0&&!q.lock&&RT[q.t].tool==='axe'&&q.t!=='log'&&wdAt(q.x,q.z)<=0&&slopeAt(q.x,q.z)<0.5&&!S.builds.some(b=>Math.hypot(b.x-q.x,b.z-q.z)<200));if(t){P.x=t.x+30;P.z=t.z+10;P.y=hAt(P.x,P.z);for(let i=0;i<S.inv.length;i++){const it=S.inv[i];if(it&&ITEMS[it.id]&&ITEMS[it.id].tool==='axe')S.inv[i]=null;}invAdd('digStick',1);const w0=landCheck(110);o.noAxe=String(w0||'').slice(0,12);const ax=Object.keys(ITEMS).find(k=>ITEMS[k].tool==='axe');invAdd(ax,1);o.withAxe=landCheck(110);o.fell=KP.fell;}}
  // 7) bụi cây giữa làng tự dọn; thú cưỡi không chồng nhau, không đứng trên nền nhà; vật nuôi không xuyên qua nhau; ruộng sát nhau cùng một mặt
  {const hb=S.builds.find(b=>b.k==='campfire');P.x=hb.x-60;P.z=hb.z-60;P.y=hAt(P.x,P.z);const sh=RES.find(q=>q.st===0&&!q.lock&&/^(shrub|young|pineY|birchY|tallgrass)$/.test(q.t)&&!kpIn(q.x,q.z));if(sh){mk('basket',sh.x+30,sh.z);kpRefresh(true);o.shrub=sh.st;}else o.shrub=1;
   const fl=mk('floor',hb.x+220,hb.z+20);S.mounts=[1,2,3].map(i=>({id:i,k:'horse',n:'Ngựa '+i,x:fl.x,z:fl.z,ry:0,land:mtLand()}));try{mtSpawnAll();}catch(e){}sl3Mounts();const M=S.mounts;let mn=1e9;for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)mn=Math.min(mn,Math.hypot(M[i].x-M[j].x,M[i].z-M[j].z));o.mMin=Math.round(mn);o.mFloor=M.filter(m=>sl3Floor(m.x,m.z)).length;
   for(const m of M){m.x=P.x+1500;m.z=P.z+900;}for(const m of M)tvCall(m);mn=1e9;for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)mn=Math.min(mn,Math.hypot(M[i].x-M[j].x,M[i].z-M[j].z));o.cMin=Math.round(mn);o.cFar=Math.round(Math.max(...M.map(m=>Math.hypot(m.x-P.x,m.z-P.z))));
   S.pets=[{id:11,k:'pig',x:hb.x+90,z:hb.z+90,hx:hb.x+90,hz:hb.z+90,born:TNOW()-9,fed:TNOW()},{id:12,k:'pig',x:hb.x+90,z:hb.z+90,hx:hb.x+90,hz:hb.z+90,born:TNOW()-9,fed:TNOW()}];try{petsInit();}catch(e){}for(let i=0;i<40;i++)petsTick(0.05);o.pD=Math.round(Math.hypot(S.pets[0].x-S.pets[1].x,S.pets[0].z-S.pets[1].z));
   const px=Math.round((hb.x+600)/CELL)*CELL,pz=Math.round(hb.z/CELL)*CELL;const p1=mk('paddy',px,pz),p2=mk('paddy',px+80,pz);p2.y=p1.y+3;o.pads=sl3Pads();o.padY=Math.abs(p1.y-p2.y)<0.01;o.padG=[[px-20,pz-20],[px+20,pz+20],[px+60,pz],[px+100,pz+20]].map(([x,z])=>+(hAt(x,z)-(p1.y-0.9)).toFixed(1));}
  return o;});
console.log(JSON.stringify(r));
const ok=r.mHtml&&r.mDist<90&&r.stray0===0&&r.petD.every(d=>d<320)&&r.petsLeft===2&&r.pHtml&&r.zin&&!r.zout&&r.qaIn&&!r.qbIn&&r.regIn===1&&r.regOut===0&&r.flatLive===1&&r.sAfter!==0&&/^Còn \d+ cây/.test(r.noAxe||'')&&r.withAxe===null&&r.fell>=1&&r.shrub!==0&&r.mMin>=40&&r.mFloor===0&&r.cMin>=40&&r.cFar<400&&r.pD>=18&&r.pads>=1&&r.padY&&r.padG.every(v=>Math.abs(v)<=0.6)&&r.anIn===false&&r.anHome===false&&!logs.length;
console.log(ok?'KP-DAT':'KP-HONG '+logs.join('|'));await b.close();})();
