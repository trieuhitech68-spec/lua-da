const {chromium}=require('playwright');const fs=require('fs');
(async()=>{
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await c.addInitScript(fs.readFileSync(require('path').join(__dirname,'mock.js'),'utf8').replace("put('world/s2',{seed:777,wv:3});","").replace(/for\(let i=0;i<150;i\+\+\)/,"for(let i=0;i<3;i++)"));
  const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message+' '+(e.stack||'').slice(0,500)));
  await p.goto('file://'+require('path').resolve(__dirname,'../../../index.html'));await p.waitForTimeout(6000);
  const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
  const ev=async f=>{try{const r=await p.evaluate(f);console.log(JSON.stringify(r));return r}catch(e){console.log('EVALERR',e.message.slice(0,600));return {}}};
  await click('Tạo nhân vật mới');await p.waitForTimeout(2500);await click('Bắt đầu');await p.waitForTimeout(16000);
  const bad=[];const need=(ok,t)=>{if(!ok)bad.push(t)};
  // làng của b1 ngay cạnh: 2 lính, 1 tù binh
  const r1=await ev(()=>{let x=P.x+120,z=P.z;for(let a=0;a<16&&wdAt(x,z)>0;a++){x=P.x+Math.cos(a)*120;z=P.z+Math.sin(a)*120;}window.__x=x;window.__z=z;
    __put('players/b1',{look:0,clan:null,req:null,w:S.seed,lastSeen:Date.now(),hl:8,df:[2,4,0],fk:[[Math.round(x),Math.round(z),1,4],[Math.round(x+30),Math.round(z),2,3],[Math.round(x),Math.round(z+30),3,1]]});
    return new Promise(r=>setTimeout(()=>{lthTick();const L=lthOf('b1');const hp0=L[0]&&L[0].hp;if(L[0])foeDamage(L[0],5);r({n:L.length,calm:L.filter(f=>f.calm).length,civ:L.filter(f=>f.civ).length,blocked:L[0]&&L[0].hp===hp0,name:L[0]&&L[0].n})},3500))});
  need(r1.n===3,'phải thấy 3 người của làng bên');need(r1.civ===1,'1 tù binh');need(r1.blocked,'dưới cấp 5 không đánh được');
  const r2=await ev(()=>{addXp('chop',900);const L=lthOf('b1'),s=L.find(f=>!f.civ);const hp0=s.hp;foeDamage(s,5);const hot=L.filter(f=>!f.civ&&!f.calm).length;foeDamage(s,1e6);pvpDefend('b1',{x:__x,z:__z});
    return {hit:s.hp<hp0,hot,dead:!s.alive,total:G.foes.filter(f=>f.pvp==='b1').length,dk:Object.keys(LTH.dead).length}});
  need(r2.hit,'cấp 5 đánh được lính làng bên');need(r2.hot===2,'bị đánh thì cả hai lính xông ra');need(r2.dead&&r2.dk===1,'hạ lính ghi nhận');need(r2.total===3,'phá nhà không gọi thêm lính từ hư không');
  // đồng minh: không đánh được; mình gửi lính của mình lên
  const r3=await ev(()=>{S.folk=(S.folk||[]).concat([{n:'A',job:'guard',lv:2,x:P.x+10,z:P.z,seed:901,sex:'m',role:'hunter'}]);LTH.t=0;PVP.pubT=0;PVP.pubK='';pvpPubTick();const fk=MP.me&&MP.me.fk;
    mpClanWrite({name:'Lửa Thiêng',leader:MP.uid,members:[MP.uid,'b1'],color:MPCOL[0],emblem:MPEMB[0],createdAt:Date.now(),zone:null,deny:[]});mpSaveMe({clan:MP.uid,req:null});__put('players/b1',Object.assign({},__db.get('players/b1'),{clan:MP.uid}));
    return new Promise(r=>setTimeout(()=>{const s=lthOf('b1').find(f=>f.alive&&!f.civ);const hp0=s.hp;foeDamage(s,5);r({fk,ally:s.hp===hp0,doc:(__db.get('players/me1')||{}).fk})},3000))});
  need(r3.fk&&r3.fk.length>=1&&r3.doc,'lính của mình được gửi lên máy chủ');need(r3.ally,'không đánh được lính đồng minh');
  need(!logs.length,'lỗi: '+logs.slice(0,3).join(' | '));
  console.log(bad.length?'LT-HONG '+bad.join('; '):'LT-DAT');await b.close();
})();
