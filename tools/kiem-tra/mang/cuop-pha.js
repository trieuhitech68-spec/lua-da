const {chromium}=require('playwright');const fs=require('fs');
(async()=>{
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await c.addInitScript(fs.readFileSync(require('path').join(__dirname,'mock.js'),'utf8').replace("put('world/s2',{seed:777,wv:3});","").replace(/for\(let i=0;i<150;i\+\+\)/,"for(let i=0;i<3;i++)"));
  const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message+' '+(e.stack||'').slice(0,500)));p.on('console',m=>{if(m.type()==='warning'&&!/GPU stall/.test(m.text()))logs.push('W '+m.text().slice(0,300))});
  await p.goto('file://'+require('path').resolve(__dirname,'../../../index.html'));await p.waitForTimeout(6000);
  const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
  const ev=async f=>{try{console.log(JSON.stringify(await p.evaluate(f)))}catch(e){console.log('EVALERR',e.message.slice(0,600))}};
  await click('Tạo nhân vật mới');await p.waitForTimeout(2500);await click('Bắt đầu');await p.waitForTimeout(16000);
  await ev(()=>{const x=Math.round(P.x+30),z=Math.round(P.z+10),y=Math.round(hAt(x,z));const d=`1,chest,${x},${y},${z},0,0;2,palisade,${x+40},${y},${z},0,0;3,campfire,${x},${y},${z+50},0,0`;
    __put('builds/b1',{v:1,w:S.seed,d,parts:0,ver:'v1',n:3,at:Date.now()});__put('players/b1',{look:0,clan:null,req:null,w:S.seed,lastSeen:Date.now(),h:[x,z,60],hl:8,df:[2,3,4],sh:0});return [S.seed,S.mp,MP.started];});
  await p.waitForTimeout(9000);
  await ev(()=>{pvpNearScan();const t=findTarget();const info=t&&targetInfo(t);return {rem:[...BYID.keys()].filter(k=>String(k)[0]==='m'),t:t&&t.type,k:t&&t.b&&t.b.k,info,lv:heroLv()}});
  await ev(()=>{const w0=pvpWhy('b1');addXp('chop',900);pvpNearScan();const t=PVP.near;const info=targetInfo(t);actStart(t);const W=G.work;const foes=G.foes.filter(f=>f.pvp).map(f=>[f.n,f.lv,Math.round(f.hp)]);if(W&&W.fn){W.fn();G.work=null;}
    return {w0,info,k:t.b.k,work:!!W,foes,out:S.pvp.out,inv:S.inv.filter(Boolean).map(s=>s.id+':'+s.n).join(','),left:[...BYID.keys()].filter(k=>String(k)[0]==='m')}});
  await ev(()=>{RL.mp.putT=0;rlMpTick();return new Promise(r=>setTimeout(()=>r({site:__db.get('sites/me1'),me:__db.get('players/me1')}),1500))});
  // mình là nạn nhân
  await ev(()=>{const mk=(k,dx,dz)=>{const b={id:7001+S.builds.length,k,x:P.x+dx,y:hAt(P.x+dx,P.z+dz),z:P.z+dz,r:0,lv:0};S.builds.push(b);structAdd(b,true);return b;};const ch=mk('chest',-60,0),w=mk('wall',-80,0);S.store[ch.id]=Array(30).fill(null);S.store[ch.id][0]={id:'wood',n:20};
    __put('sites/zz9',{w:S.seed,c:null,L:{},R:{me1:{at:Date.now(),ids:[ch.id,w.id,99999]}}});__put('players/zz9',{look:0,w:S.seed,lastSeen:Date.now(),hl:9});
    return new Promise(r=>setTimeout(()=>r({prog:[ch.prog,w.prog],wood:S.store[ch.id][0],sh:S.pvp.sh>Date.now(),log:S.pvp.log,seen:S.pvp.seen}),1500))});
  await ev(()=>{uiOpen('clan');G.mpTab='land';mpPanelRefresh&&mpPanelRefresh();return (document.querySelector('#panel .p-body').innerText||'').slice(0,400)});
  console.log(logs.slice(0,8).join('\n'));await b.close();
})();
