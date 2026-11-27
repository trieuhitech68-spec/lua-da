// Hai người chơi KHÔNG chiến tranh, không cùng liên minh, nhà gần nhau: Y có đạo quân và một tướng; X dẫn lính đi ngang qua nhà Y.
// Đúng: lính của X không tự lao vào đánh lính đang đứng yên của Y; nếu Y bị hạ lính (chiến tranh thật) thì lính bị thương nghỉ 10 phút nhưng TƯỚNG không bị xoá.
// Chạy: node mang/tuong-bi-thuong.js  → TBT-DAT / TBT-HONG
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const HTML='file://'+path.resolve(__dirname,'../../../index.html'),MOCK=fs.readFileSync(path.join(__dirname,'mock-chung.js'),'utf8');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const br=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
  const DB=new Map([['world/main',{seed:12345,wv:3}]]);const PL=[{uid:'p02',name:'Y'},{uid:'p03',name:'X'}];const logs=[];
  const relay=(src,p,v)=>{if(v==null)DB.delete(p);else DB.set(p,v);for(const o of PL)if(o!==src&&o.page)o.page.evaluate(L=>window.__recv&&window.__recv(L),[[p,v]]).catch(()=>{});};
  const ev=async(pl,f,a)=>{try{return await pl.page.evaluate(f,a);}catch(e){return {__err:e.message.slice(0,400)};}};
  for(const pl of PL){pl.ctx=await br.newContext({viewport:{width:390,height:844}});await pl.ctx.exposeBinding('__relay',(s,p,v)=>relay(pl,p,v));
    await pl.ctx.addInitScript(o=>{window.__ME=o;},{uid:pl.uid,name:pl.name});await pl.ctx.addInitScript(MOCK);await pl.ctx.addInitScript(s=>{window.__SNAP=s;},[...DB.entries()]);
    pl.page=await pl.ctx.newPage();pl.page.on('pageerror',e=>logs.push(pl.name+' ERR '+e.message));await pl.page.goto(HTML);await sleep(5000);
    for(const t of ['Tạo nhân vật mới','Bắt đầu']){await ev(pl,t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click();},t);await sleep(1500);}
    await pl.page.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model&&typeof mpOn==='function'&&mpOn(),null,{timeout:300000});await sleep(2000);
    await ev(pl,()=>{G.R.render=()=>{};if(K3.fx)K3.fx.render=()=>{};window.requestAnimationFrame=()=>0;let T=performance.now()+1e6;setInterval(()=>{T+=100;try{loop(T);}catch(e){}},100);
      window.__T=[];const _u=uiToast;uiToast=function(m){__T.push(String(m).replace(/<[^>]+>/g,'').slice(0,120));return _u.apply(this,arguments);};});}
  const [Y,X]=PL;const bad=[];const need=(ok,t,d)=>{if(!ok)bad.push(t+(d!==undefined?' '+JSON.stringify(d).slice(0,300):''));};
  // Y: làng có trại lính, 3 lính, phong 1 tướng
  const y0=await ev(Y,()=>{let n=30000;const mk=(k,x,z,ht)=>{const b={id:n++,k,x,y:hAt(x,z),z,r:0,lv:0};if(ht){b.ht=ht;b.hg=1;}S.builds.push(b);structAdd(b,true);return b;};
    for(const a of G.animals)a.alive=false;if(G.foes)G.foes.length=0;for(const k of ['chop','gather','hunt','build','craft'])addXp(k,2600);S.hour=10;
    mk('campfire',P.x+40,P.z+40);mk('roof',P.x,P.z+200,'qh_linh');for(let i=0;i<4;i++)mk('hammock',P.x+120+i*40,P.z+120);
    S.folk=[];for(let i=0;i<3;i++)S.folk.push({n:'Lính Y'+i,role:'hunter',seed:400+i,sex:'m',job:'soldier',x:P.x+30+i*20,z:P.z+30,fed:TNOW(),lv:3+i});
    for(const k of ['meatCooked','hide','bone'])invAdd(k,40);invAdd('spear',2);tgPromote(qdUid(S.folk[0]));qdS().cmd='hold';qdS().hx=P.x;qdS().hz=P.z;
    LTH.t=0;PVP.pubT=0;pvpPubTick();mpSaveMe({hl:heroLv()});return {g:tgList().length,x:P.x,z:P.z};});
  need(y0.g===1,'Y phải phong được tướng',y0);
  await sleep(4000);
  // X: 3 lính đi theo, tới cạnh nhà Y (không chiến tranh)
  const x0=await ev(X,o=>{for(const a of G.animals)a.alive=false;if(G.foes)G.foes.length=0;LTH.sp={};for(const k of ['chop','gather','hunt','build','craft'])addXp(k,2600);S.hour=10;mpSaveMe({hl:heroLv()});
    S.folk=[];for(let i=0;i<3;i++)S.folk.push({n:'Lính X'+i,role:'hunter',seed:500+i,sex:'m',job:'soldier',x:o.x+130+i*20,z:o.z+140,fed:TNOW(),lv:4});qdS().cmd='follow';qdS().form='line';
    P.x=o.x+140;P.z=o.z+120;P.y=groundY(P.x,P.z);return new Promise(r=>setTimeout(()=>r({fk:(MP.players.p02||{}).fk,foes:lthOf('p02').length,sp:LTH.sp,P:[Math.round(P.x),Math.round(P.z)],land:landFar(),on:pvpOn(),nf:G.foes.length}),5000));},{x:y0.x,z:y0.z});
  console.log('X thấy:',JSON.stringify(x0));
  need(x0.fk&&x0.fk.length===3,'X phải thấy 3 lính của Y qua máy chủ',x0);
  const x1=await ev(X,()=>new Promise(r=>{const hp0=lthOf('p02').map(f=>Math.round(f.hp));setTimeout(()=>r({hp0,hp:lthOf('p02').map(f=>Math.round(f.hp)),alive:lthOf('p02').filter(f=>f.alive).length,calm:lthOf('p02').filter(f=>f.calm).length,t:__T.filter(t=>/xông ra|đồng minh|hạ/.test(t)).slice(-4),k:S.lth&&S.lth.k}),20000);}));
  console.log('X đi ngang nhà Y 20 giây:',JSON.stringify(x1));
  need(JSON.stringify(x1.hp0)===JSON.stringify(x1.hp)&&x1.calm===x1.hp.length,'lính của X tự lao vào đánh lính đang đứng yên của Y dù không chiến tranh',x1);
  // phần chắc chắn: Y bị người khác hạ 2 lính (ghi qua sites/<X>.F như khi đánh thật) → lính nghỉ 10 phút, tướng phải còn
  const y1=await ev(Y,()=>{const e=[2,pvpNow()-1000];lthIn([{id:'p03',data:()=>({w:seed0(),F:{p02:e}})}]);const g1=tgList().length,kept=tgS().list.length;const idle=S.folk.filter(f=>f.wd).length;
    for(const f of S.folk)if(f.wd)f.wd=Date.now()-1;return new Promise(r=>setTimeout(()=>r({g1,kept,idle,back:S.folk.filter(f=>f.job==='soldier').length,g2:tgList().length,t:__T.slice(-2)}),6500));});
  console.log('Y bị hạ 2 lính:',JSON.stringify(y1));
  need(y1.idle===2,'2 lính của Y phải nghỉ bị thương',y1);need(y1.kept===1,'lính đang bị thương thì tướng vẫn phải được giữ (tạm chưa chỉ huy)',y1);need(y1.back===3&&y1.g2===1,'lính khoẻ lại trở về, tướng vẫn còn',y1);
  // đổi việc tướng sang việc khác rồi đổi lại: báo rõ, tướng không mất âm thầm
  const y2=await ev(Y,()=>{const f=S.folk.find(f=>tgOf(f));if(!f)return {none:1};f.job='wood';const g=tgList().length;f.job='soldier';return {g,g2:tgList().length};});
  console.log('Y chuyển tướng sang đốn gỗ rồi về lại:',JSON.stringify(y2));
  need(y2.g2===1,'chuyển tướng đi làm việc khác rồi về lại thì vẫn là tướng',y2);
  need(!logs.length,'lỗi chạy',logs.slice(0,3));
  console.log(bad.length?'TBT-HONG '+bad.join(' ;; '):'TBT-DAT');await br.close();process.exit(bad.length?1:0);})();
