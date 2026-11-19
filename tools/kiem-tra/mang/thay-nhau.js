// Đại lục chơi chung: ĐI SANG TỈNH KHÁC phải thấy nhà của người sống ở tỉnh đó (kể cả khi họ vắng mặt, chưa cắm đất) và thấy người đang đứng ở đó.
// Chạy: node mang/thay-nhau.js
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await c.addInitScript(fs.readFileSync(require('path').join(__dirname,'mock.js'),'utf8').replace("put('world/main',{seed:12345,wv:3});put('world/s2',{seed:777,wv:3});","put('world/main',{seed:12345,wv:3,dl:1});").replace(/for\(let i=0;i<150;i\+\+\)/,"for(let i=0;i<3;i++)"));
  const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message+' '+(e.stack||'').slice(0,300)));
  await p.goto('file://'+require('path').resolve(__dirname,'../../../index.html'));await p.waitForTimeout(6000);
  const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
  await click('Tạo nhân vật mới');await p.waitForTimeout(2500);await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&P.model&&G.animals&&G.animals.length,null,{timeout:240000});await p.waitForTimeout(9000);
  const a=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const e=Object.values(dlNb().key).find(q=>q.dx>0&&!q.dz);
    // người b7 sống ở tỉnh phía đông: có nhà (không cắm đất), đang vắng
    let hx=0,hz=0;for(let r=0;r<2400;r+=150){const x=r,z=r/3;if(dlBase(S.dl.ox+e.dx+x,S.dl.oz+z)>6){hx=x;hz=z;break;}}
    __put('players/b7',{look:0,clan:null,req:null,w:S.seed0,lastSeen:Date.now()-3600000,fl:{[e.key]:[hx,hz,60]}});
    __put('builds/b7/L/'+e.key,{v:1,w:e.seed,d:'1,campfire,'+hx+',0,'+hz+',0,0;2,campfire,'+(hx+60)+',0,'+hz+',0,0',parts:0,ver:'a1',n:2,at:1});await W(1000);
    const o={key:e.key,seed:e.seed,hx,hz,ox:S.dl.ox};P.x=e.dx/2+900;P.z=0;P.y=hAt(P.x,P.z);DL.noIn=0;dlShift();return o;});
  await p.waitForFunction(o=>typeof DL==='object'&&!DL.busy&&S.dl&&S.dl.ox!==o&&G.on,a.ox,{timeout:240000});await p.waitForTimeout(3000);
  const r=await p.evaluate(async a=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const o={land:S.land,landOk:S.land===a.key,seedOk:S.seed===a.seed,fl:!!(MP.players.b7&&MP.players.b7.fl[S.land])};
    P.x=a.hx+200;P.z=a.hz;P.y=hAt(P.x,P.z);MP.tick.near=-9;mpNearTick();await W(3000);o.sub=MP.bsub.has('b7');o.path=mpBPath('b7');const cur=MP.bcur.get('b7');o.n=cur?cur.size:0;o.inScene=cur?[...cur.values()].filter(v=>BYID.has(v.b.id)).length:0;
    // người khác đang đứng ngay đó: phải hiện hình
    // xếp người mới vào chỗ đã có người; bảng Gần đây cho biết máy chủ, tỉnh, số người
    {const L=dlAnchor(S.seed0,'all'),k=a=>dlKey(a.ox,a.oz);o.pop0=k(dlAnchorPop(S.seed0,{},12))===k(L[0]);const t=L[7];o.pop1=k(dlAnchorPop(S.seed0,{[k(t)]:3,[k(L[20])]:1},12))===k(t);const f=dlAnchorPop(S.seed0,{[k(t)]:12},12);o.popFull=k(f)!==k(t)&&Math.hypot(f.ox-t.ox,f.oz-t.oz)<=dlA()*1.5;o.hp=MP.me.hp;o.hpDoc=(__db.get('players/me1')||{}).hp;}
    mpPeers({peers:[{peer:'pz1',kind:'viewer',by:'b8',presence:{w:S.seed,u:'b8',x:P.x+80,y:P.y,z:P.z,ry:0,a:'idle',lk:0}}],joined:[]});MP.tick.sort=-9;mpAvTick(0.1);const rp=MP.rp.get('pz1');o.pres=!!rp;o.model=!!(rp&&rp.o&&rp.o.visible&&rp.o.parent===G.sc);mpPeers({peers:[{peer:'pz1',kind:'viewer',by:'b8',presence:{w:S.seed,u:'b8',pv:S.land,x:P.x+80,y:P.y,z:P.z,ry:0,a:'idle',lk:0}},{peer:'pz2',kind:'viewer',by:'b9',presence:{w:4242,u:'b9',pv:'qkk',x:0,y:0,z:0}}],joined:[]});MP.room=MP.room||{};const wh=mpNearHtml();o.where=/2 người khác đang chơi/.test(wh)&&/1 người ở gần/.test(wh)&&/tỉnh của bạn/.test(wh)&&(wh.match(/tỉnh <b>|<b>tỉnh /g)||[]).length>=2;o.wh=wh.replace(/<[^>]+>/g,'').slice(0,260);// thú cưỡi của người khác: đang cưỡi voi + một con ngựa đứng gần → phải hiện hình; người ngồi trên lưng voi
    {mpPeers({peers:[{peer:'pz1',kind:'viewer',by:'b8',presence:{w:S.seed,u:'b8',pv:S.land,x:P.x+80,y:P.y,z:P.z,ry:0,a:'walk',lk:0,mt:'e',ms:[['h',Math.round(P.x+140),Math.round(P.z+30),0.5]]}}],joined:[]});MP.tick.sort=-9;mpAvTick(0.1);mpAvTick(0.1);const q=MP.rp.get('pz1'),e=THK.rm.get('pz1');
      o.voi=!!(e&&e.ride&&e.ride.parent===G.sc&&e.ride.userData.mk==='e');o.ngoi=!!(q&&q.o&&q.o.position.y>groundY(q.x,q.z)+40);o.dung=!!(e&&e.park.length===1&&e.park[0].parent===G.sc&&e.park[0].userData.mk==='h');
      mpPeers({peers:[{peer:'pz1',kind:'viewer',by:'b8',presence:{w:S.seed,u:'b8',pv:S.land,x:P.x+80,y:P.y,z:P.z,ry:0,a:'idle',lk:0}}],joined:[]});mpAvTick(0.1);o.xuong=!THK.rm.has('pz1');
      // phía gửi: mình cưỡi voi thì tín hiệu có ghi
      let cap=null;const _r=MP.room;MP.room={presence:v=>{cap=v;return Promise.resolve();}};S.mounts=[{id:71,k:'elephant',n:'Voi',x:P.x,z:P.z,land:S.land},{id:72,k:'horse',n:'Ngựa',x:P.x+60,z:P.z,land:S.land}];G.mnt=S.mounts[0];MP.presK='';mpPresTick();o.gui=!!(cap&&cap.mt==='e'&&cap.ms&&cap.ms.length===1&&cap.ms[0][0]==='h');G.mnt=null;S.mounts=[];MP.room=_r;}
    o.started=MP.started;o.roomOn=!!MP.roomOn;return o;},a);
  console.log(JSON.stringify(r));if(logs.length)console.log(logs.slice(0,5).join('\n'));
  const ok=r.landOk&&r.seedOk&&r.fl&&r.sub&&r.n===2&&r.inScene===2&&r.pres&&r.model&&r.pop0&&r.pop1&&r.popFull&&/^q/.test(r.hp||'')&&r.hpDoc===r.hp&&r.where&&r.voi&&r.ngoi&&r.dung&&r.xuong&&r.gui&&!logs.length;console.log(ok?'TN-DAT':'TN-HONG');await b.close();})();
