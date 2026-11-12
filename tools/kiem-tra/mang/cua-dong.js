const {chromium}=require('playwright');const fs=require('fs');
(async()=>{
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await c.addInitScript(fs.readFileSync(require('path').join(__dirname,'mock.js'),'utf8').replace("put('world/s2',{seed:777,wv:3});","").replace(/for\(let i=0;i<150;i\+\+\)/,"for(let i=0;i<3;i++)"));
  await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-b')}catch(e){}});
  const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message+' '+(e.stack||'').slice(0,400)));p.on('console',m=>{if(m.type()==='warning'&&!/GPU stall/.test(m.text()))logs.push('W '+m.text().slice(0,260))});
  await p.goto('file://'+require('path').resolve(__dirname,'../../../index.html'));await p.waitForTimeout(6000);
  const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
  const ev=async f=>{try{console.log(JSON.stringify(await p.evaluate(f)))}catch(e){console.log('EVALERR',e.message.slice(0,500))}};
  await click('Tạo nhân vật mới');await p.waitForTimeout(2500);await click('Bắt đầu');await p.waitForTimeout(18000);
  await p.waitForFunction(()=>typeof G!=='undefined'&&G.on&&G.terrain&&MP.started,null,{timeout:200000});await p.waitForTimeout(6000);
  await ev(()=>{let bx=0,bz=0;for(let r=200;r<1500&&!bx;r+=40)for(let a=0;a<16;a++){const x=Math.round((P.x+Math.cos(a)*r)/40)*40,z=Math.round((P.z+Math.sin(a)*r)/40)*40;let ok=true;for(let u=-2;u<=4;u++)for(let v=-2;v<=4;v++)if(wdAt(x+u*40,z+v*40)>0||slopeAt(x+u*40,z+v*40)>0.3)ok=false;if(ok){bx=x;bz=z;break;}}
    window.__b=[bx,bz];const y=Math.round(hAt(bx+40,bz+40)*10)/10;let n0=0;for(const i of near(bx+40,bz+40,90)){const q=RES[i];if(q.st===0&&Math.hypot(q.x-bx-40,q.z-bz-40)<70)n0++;}
    const L=[];let id=1;for(const [u,v] of [[20,20],[60,20],[20,60],[60,60]])L.push(`${id++},floor,${bx+u},${y},${bz+v},0,0`);L.push(`${id++},wall,${bx+20},${y},${bz},0,0`);L.push(`${id++},wallDoor,${bx+20},${y},${bz+80},0,0`);L.push(`${id++},chest,${bx+140},${y},${bz+20},0,0`);
    __put('builds/b1',{v:1,w:S.seed,d:L.join(';'),parts:0,ver:'v1',n:L.length,at:Date.now(),fl:`${bx+40},${bz+40},70,${y}`});
    __put('players/b1',{look:0,clan:null,req:null,w:S.seed0||S.seed,lastSeen:Date.now(),hl:8,df:[0,0,0],sh:0,h:[bx+40,bz+40,80]});P.x=bx+40;P.z=bz+150;P.y=hAt(P.x,P.z);S.view='tp';G.zoom=200;G.pitch=0.8;G.yaw=0;G.camInit=0;
    return {n0,y,h0:[hAt(bx,bz),hAt(bx+80,bz+80)].map(v=>v.toFixed(1))}});
  await p.waitForTimeout(25000);
  await ev(()=>{const [bx,bz]=__b;let n1=0;for(const i of near(bx+40,bz+40,90)){const q=RES[i];if(q.st===0&&Math.hypot(q.x-bx-40,q.z-bz-40)<70)n1++;}return {rem:[...BYID.keys()].filter(k=>String(k)[0]==='m').length,flats:DB.flats,n1,hid:DB.hid.size,h1:[hAt(bx,bz),hAt(bx+80,bz+80)].map(v=>v.toFixed(1)),myfl:mpFlatStr()}});
  await ev(()=>{const [bx,bz]=__b;const walk=(fx,fz,dx,dz,n)=>{P.x=fx;P.z=fz;P.y=groundY(fx,fz);for(let i=0;i<n;i++){const c=collide(P.x+dx,P.z+dz);P.x=c[0];P.z=c[1];}return [(P.x-bx).toFixed(0),(P.z-bz).toFixed(0)].join(',');};
    const closed=walk(bx+20,bz+110,0,-2,30);const d=[...BYID.values()].find(b=>b.remote&&b.k==='wallDoor');const open0=solDoorOpen(d);const _s=mpSameClan;mpSameClan=()=>true;const ally=walk(bx+20,bz+110,0,-2,30);mpSameClan=_s;return {closed,ally,open0,hd:HD.cur&&HD.cur.id,seen:Object.keys(S.hd||{})}});
  await p.evaluate(()=>{const [bx,bz]=__b;P.x=bx+20;P.z=bz+120;HD.lastT=-99;});await p.waitForTimeout(4000);await p.screenshot({path:'hd.png'});

  console.log(logs.slice(0,8).join('\n'));await b.close();
})();
