// Vật nuôi khôn hơn: chó trông nhà / đi săn / đi theo, đàn gà tối về chuồng, chiến thú nghỉ canh nhà, thú cưỡi tự về, voi vẽ lại. Chạy: node thu-khon.js [html]
const {chromium}=require('playwright');const HTML=process.argv[2]||require('path').resolve(__dirname,'../../index.html');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:400,height:240}});const logs=[];
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-g');localStorage.setItem('ldtt-nohd','1');localStorage.setItem('ldtt-kt','1');localStorage.setItem('ld-dl','0')}catch(e){}});const p=await c.newPage();p.on('pageerror',e=>logs.push('ERR '+e.message));p.on('console',m=>{if(m.type()==='warning'&&/đàn vật nuôi|chó khôn|chiến thú/.test(m.text()))logs.push('WARN '+m.text().slice(0,200));});
await p.goto('file://'+HTML);await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(2500);
const r=await p.evaluate(()=>{const o={},toasts=[];const _t=uiToast;uiToast=function(m){toasts.push(String(m));return _t.apply(this,arguments);};G.paused=true;/* tự bước thời gian, không để vòng lặp game chen vào */
  // bãi trống gần chỗ bắt đầu, dựng bếp + giỏ làm "nhà"
  let hx=0,hz=0,ok=false;for(let r=260;r<1600&&!ok;r+=70)for(let a=0;a<12&&!ok;a++){const x=SPAWN[0]+Math.cos(a/12*6.283)*r,z=SPAWN[1]+Math.sin(a/12*6.283)*r;let bad=false;for(let k=0;k<8;k++){const xx=x+Math.cos(k)*160,zz=z+Math.sin(k)*160;if(wdAt(xx,zz)>0||hAt(xx,zz)<3)bad=true;}if(!bad&&wdAt(x,z)<=0){hx=x;hz=z;ok=true;}}
  const mk=(id,k,x,z)=>{const q={id,k,x,y:hAt(x,z),z,r:0,lv:0};S.builds.push(q);structAdd(q,true);if(pieceDef(k).store)S.store[id]=Array(pieceDef(k).store).fill(null);return q;};mk(9801,'campfire',hx,hz);mk(9802,'basket',hx+40,hz);
  for(const a of G.animals){a.alive=false;a.o.visible=false;a.back=1e9;}S.hour=11;P.x=hx+30;P.z=hz+30;
  const sim=(sec,fn)=>{for(let i=0;i<sec*10;i++){G.t+=0.1;petsTick(0.1);if(fn&&fn())return true;}return false;};
  // 1) chó mới: mặc định trông nhà, chủ đi xa thì KHÔNG chạy theo, vẫn quanh nhà
  S.pets=[{id:1,k:'dog',x:hx+20,z:hz+10,born:TNOW()-9,fed:TNOW()}];petsInit();const dog=S.pets[0];P.x=hx+2500;P.z=hz;sim(60);o.job0=dog.job;o.stay0=dog.stay;o.dHome=Math.round(Math.hypot(dog.x-hx,dog.z-hz));o.moved=Math.hypot(dog.x-(hx+20),dog.z-(hz+10))>5;
  // 2) sói tới gần nhà: chó sủa báo, lao ra cắn
  const wolf=G.animals.find(a=>a.kind==='wolf')||G.animals[0];Object.assign(wolf,{kind:'wolf',alive:true,hp:5,x:hx+150,z:hz+40,angry:true,state:'chase'});const n0=toasts.length;sim(20,()=>wolf.hp<5||!wolf.alive);o.wolfHurt=wolf.hp<5||!wolf.alive;o.warn=toasts.slice(n0).some(t=>/Chó sủa dữ/.test(t));wolf.alive=false;wolf.angry=false;wolf.state='wander';sim(3);
  // 3) đổi việc bằng cách chạm: nha → theo → san
  petUse(dog);o.job1=dog.job;o.stay1=dog.stay;petUse(dog);o.job2=dog.job;o.stay2=dog.stay;o.verb=petInfo(dog).verb;
  // 4) đi săn: thỏ gần làng → tha thịt về giỏ
  const rb=G.animals.find(a=>a!==wolf);Object.assign(rb,{kind:'rabbit',alive:true,hp:1,x:hx+170,z:hz-60,angry:false,state:'wander',tame:0});dog._st=null;sim(1);if(dog._st)dog._st.cd=0;const m0=toasts.length;sim(90,()=>toasts.slice(m0).some(t=>/tha về|ăn no/.test(t)));o.hunt=toasts.slice(m0).some(t=>/tha về cất vào/.test(t));o.meat=(S.store[9802]||[]).filter(Boolean).map(s=>s.id+s.n).join(',');o.preyDead=!rb.alive;
  // 5) đàn gà: ngày đi quanh, tối về sát chuồng
  for(let i=0;i<3;i++)S.pets.push({id:10+i,k:'chicken',x:hx+70+i*25,z:hz+60,hx:hx,hz:hz,born:TNOW()-9,fed:TNOW()});petsInit();P.x=hx+2500;sim(40);S.hour=23;sim(90);const ch=S.pets.filter(q=>q.k==='chicken');o.roost=Math.round(Math.max(...ch.map(q=>Math.hypot(q.x-(q.hx??hx),q.z-(q.hz??hz)))));S.hour=11;
  // 6) chiến thú nghỉ canh nhà
  try{const L=ltS();L.list.push({id:++L.seq,k:'tiger',n:'Hổ Một',lv:3,xp:0,st:0},{id:++L.seq,k:'tiger',n:'Hổ Hai',lv:3,xp:0,st:0});L.act=L.list[0].id;sl3Rest();o.rest=SL3.rest.size;Object.assign(wolf,{alive:true,hp:5,x:hx+120,z:hz-90,angry:true,state:'chase'});const k0=toasts.length;const first=[...SL3.rest.values()][0];sim(1);const st=first.userData.thk;if(st){wolf.x=st.hx+110;wolf.z=st.hz+30;}sim(25,()=>wolf.hp<5||!wolf.alive);o.beast=wolf.hp<5||!wolf.alive;o.roar=toasts.slice(k0).some(t=>/gầm lên|Chó sủa dữ/.test(t));/* chó và chiến thú dùng chung một dòng báo, ai tới trước thì báo */wolf.alive=false;}catch(e){o.beastErr=String(e);}
  // 7) thú cưỡi bị bỏ xa tự tìm về
  S.mounts=[{id:77,k:'elephant',n:'Voi thử',x:hx+3000,z:hz+900,ry:0,land:'khac'}];S.dl=S.dl||null;P.x=hx-2500;P.z=hz;G.paused=false;S.mounts[0].land=(S.land||'c');for(let i=0;i<7;i++)thkMounts();G.paused=true;o.mountHome=Math.round(Math.hypot(S.mounts[0].x-hx,S.mounts[0].z-hz));
  // 8) voi vẽ lại
  try{const v=voiModel(true);let n=0,cull=0;v.traverse(m=>{if(m.isMesh){n++;if(m.frustumCulled)cull++;}});o.voi=[n,cull,!!v.userData.rig.legFL];}catch(e){o.voiErr=String(e);}
  G.paused=false;return o;});
console.log(JSON.stringify(r));if(logs.length)console.log(logs.slice(0,5).join('\n'));
const ok=r.job0==='nha'&&r.stay0===true&&r.dHome<260&&r.moved&&r.wolfHurt&&r.warn&&r.job1==='theo'&&r.stay1===false&&r.job2==='san'&&r.stay2===true&&/Trông nhà/.test(r.verb||'')&&r.hunt&&/meat/.test(r.meat||'')&&r.preyDead&&r.roost<40&&r.rest===1&&r.beast&&r.roar&&r.mountHome<400&&r.voi&&r.voi[0]>30&&r.voi[1]===0&&r.voi[2]&&!logs.length;
console.log(ok?'THK-DAT':'THK-HONG');await b.close();})();
