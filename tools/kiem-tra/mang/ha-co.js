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
  await ev(()=>{__put('clans/b1',{name:'Sói Xám',leader:'b1',members:['b1'],color:'#5aa0e6',emblem:'🌙',createdAt:1,zone:{x:Math.round(P.x+20),z:Math.round(P.z),r:300},deny:[],w:S.seed,war:[]});__put('players/b1',{look:0,clan:'b1',req:null,w:S.seed,lastSeen:Date.now(),hl:8,df:[1,5,0]});
    mpClanWrite({name:'Lửa Thiêng',leader:MP.uid,members:[MP.uid],color:MPCOL[0],emblem:MPEMB[0],createdAt:Date.now(),zone:{x:Math.round(P.x-3000),z:Math.round(P.z),r:300},deny:[]});mpSaveMe({clan:MP.uid,req:null});return 1});
  await p.waitForTimeout(4500);
  await ev(()=>{addXp('chop',900);pvpFlagSync();const t0=pvpFlagNear(),i0=t0&&targetInfo(t0);pvpWarSet('b1',true);return new Promise(r=>setTimeout(()=>{const t=pvpFlagNear(),i=targetInfo(t);actStart(t);const g=G.foes.filter(f=>f.pvp).length,W=G.work;if(W&&W.fn){W.fn();G.work=null;}
    r({flags:PVP.flags.size,i0:i0&&i0.verb,i:i.verb,guards:g,zo:S.pvp.zo,ws:S.pvp.ws,inv:S.inv.filter(Boolean).map(s=>s.id+':'+s.n).join(',')})},1500))});
  // mình là thủ lĩnh bị hạ cờ
  await ev(()=>{__put('players/b1',{look:0,clan:'b1',req:null,w:S.seed,lastSeen:Date.now(),hl:8});__put('sites/b1',{w:S.seed,c:'b1',L:{},Z:{me1:Date.now()}});rlMpTick();return new Promise(r=>setTimeout(()=>{mpZoneSet(true);r({zone:MP.clans[MP.uid].zone,zcd:S.pvp.zcd>Date.now(),doc:__db.get('clans/me1').zone})},2000))});
  console.log(logs.slice(0,8).join('\n'));await b.close();
})();
