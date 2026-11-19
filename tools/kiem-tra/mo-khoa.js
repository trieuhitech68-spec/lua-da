// Mở khoá theo cấp, học chiêu, di tích cổ, quản trị mở hết. Bài này KHÔNG bỏ khoá (không đặt ldtt-kt). Chạy: node mo-khoa.js [html]
const {chromium}=require('playwright');const HTML=process.argv[2]||require('path').resolve(__dirname,'../../index.html');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:400,height:240}});const logs=[];
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-h');localStorage.setItem('ldtt-nohd','1');localStorage.setItem('ld-dl','0')}catch(e){}});const p=await c.newPage();p.on('pageerror',e=>logs.push('ERR '+e.message));p.on('console',m=>{if(m.type()==='warning'&&/di tích/.test(m.text()))logs.push('WARN '+m.text().slice(0,200));});
await p.goto('file://'+HTML);await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(4500);
const r=await p.evaluate(()=>{const o={},T=[];const _t=uiToast;uiToast=function(m){T.push(String(m));return _t.apply(this,arguments);};needGate=()=>'';const setLv=n=>{for(const k in SKILL)S.sk[k]=0;const ks=Object.keys(SKILL),need=30*(n-1)*(n-1);for(const k of ks)S.sk[k]=Math.ceil(need/ks.length)+1;};
  // cấp 1: đào bị khoá, chiêu chưa học
  setLv(1);o.lv1=heroLv();invAdd('digStick',1);o.daoLock=!mkOk('dao');const n0=T.length;daoStart('hao');o.daoMsg=T.slice(n0).some(t=>/mở khi nhân vật đạt cấp 4/.test(t));o.pow0=knHas(KNS[0]);
  // nhà: cấp 1 chưa cắm mốc được Nhà kho, Trại lính; bảng Xây ghi rõ cấp mở
  {o.khoLock=!mkHouseOk('qh_kho')&&mkHouseOk('qh_tre');const m0=T.length;qhBegin('qh_kho');o.khoMsg=T.slice(m0).some(t=>/Nhà kho: mở khi nhân vật đạt cấp 5/.test(t))&&!G.build;G.qhOpen=1;const hh=qhHtml();o.khoTag=/🔒 Mở ở cấp 5/.test(hh)&&/🔒 Mở ở cấp 12/.test(hh);setLv(5);o.khoOpen=mkHouseOk('qh_kho')&&!mkHouseOk('qh_linh');setLv(1);}
  // cấp 4: đào mở; cấp tối đa 50; danh hiệu cuối ở cấp 50
  setLv(4);o.daoOpen=mkOk('dao');setLv(80);o.cap=heroLv();o.rankMax=HERO_RANK[HERO_RANK.length-1][0];o.full=MK.every(e=>mkOk(e[0]));
  // học chiêu: đủ cấp nhưng thiếu lễ vật thì không học được; đủ thì học
  setLv(5);S.knL={};for(let i=0;i<S.inv.length;i++)S.inv[i]=null;knLearn('pow');o.noPay=!knHas(KNS[0]);invAdd('meatCooked',5);invAdd('stick',6);knLearn('pow');o.learned=knHas(KNS[0]);o.spinLock=!knHas(KNS.find(k=>k.id==='spin'));
  setLv(25);invAdd('bone',6);knLearn('spin');o.spinNoScroll=!knHas(KNS.find(k=>k.id==='spin'));invAdd('bikip',1);knLearn('spin');o.spin=knHas(KNS.find(k=>k.id==='spin'));
  // chiêu mới Thủ thế: học bằng vật liệu thường, dùng thì chịu đòn nhẹ hơn hẳn
  {invAdd('hide',5);invAdd('bone',4);knLearn('guard');const gk=KNS.find(k=>k.id==='guard');o.guardL=knHas(gk);const d0=heroDef();S.p.stam=100;KN.cd.guard=0;knUse('guard');o.guardFx=+(heroDef()-d0).toFixed(2);o.kns=KNS.length;}
  // di tích: thành có tường, vào qua cổng, ba lớp canh, rương, phong ấn 20 giờ
  dtObjs();o.sites=DT.sites.length;o.reg=REG.filter(q=>/^ruin_/.test(q.id)).length;if(DT.sites.length){const s=DT.sites[0],RW=DT.RW,at=k=>{const g=dtGate(s,k);P.x=g[0];P.z=g[1];P.y=hAt(P.x,P.z);};for(const a of G.animals){a.alive=false;a.back=1e9;}G.foes=G.foes||[];
    const dC=()=>Math.hypot(P.x-s.x,P.z-s.z),kill=()=>{for(const f of G.foes)if(f.ruin===s.id&&f.alive)foeDamage(f,1e6);},tick=n=>{for(let i=0;i<n;i++)foesTick(0.5);};
    // tường chắn: đứng ngoài, cố đi thẳng vào giữa thì bị đẩy ra
    P.x=s.x+60;P.z=s.z;tick(1);o.wallOut=dC()>=RW+10;
    at(14);setLv(10);o.lvLock=/Cần cấp 20/.test(targetInfo(dtNear()).verb);setLv(25);o.openVerb=targetInfo(dtNear()).verb;o.part=dtNear().part;
    actStart(dtNear());o.inside=!!DT.in&&dC()<RW;o.w1=G.foes.filter(f=>f.ruin===s.id&&f.alive).length;o.w1n=G.foes.find(f=>f.ruin===s.id).n;o.w1hp=G.foes.find(f=>f.ruin===s.id).hp0;
    // tường trong: không chạy xuyên ra được
    {const x0=P.x,z0=P.z;P.x=s.x+(RW+5)*Math.cos(s.ga+1);P.z=s.z+(RW+5)*Math.sin(s.ga+1);tick(1);o.wallIn=dC()<=RW-12&&!!DT.in;P.x=x0;P.z=z0;}
    P.x=s.x+10;P.z=s.z;o.midVerb=targetInfo(dtNear()).verb;const c0=invCount('covat');actStart(dtNear());o.early=invCount('covat')-c0;
    kill();tick(6);o.w2=G.foes.filter(f=>f.ruin===s.id&&f.alive).length;o.w2n=(G.foes.find(f=>f.ruin===s.id&&f.alive)||{}).n;
    kill();tick(6);const bs=G.foes.find(f=>f.ruin===s.id&&f.alive)||{};o.boss=!!bs.boss;o.bossHp=bs.hp;o.bossDk=bs.dk;
    // đòn của tướng nặng hơn lính thường
    {S.mode='normal';const h0=S.p.hp=100;foeHit(bs,{pl:1});o.bossHit=h0-S.p.hp;S.p.hp=100;S.status&&(S.status.length=0);}
    // rút ra giữa chừng: lính hồi lại từ đầu
    at(-36);o.exitVerb=targetInfo(dtNear()).verb;actStart(dtNear());o.left=!DT.in&&dC()>RW&&!G.foes.some(f=>f.ruin===s.id&&f.alive);
    at(14);actStart(dtNear());o.again1=G.foes.filter(f=>f.ruin===s.id&&f.alive).length;kill();tick(6);kill();tick(6);kill();tick(6);o.done=!!(DT.in&&DT.in.done);
    P.x=s.x+10;P.z=s.z;o.chestVerb=targetInfo(dtNear()).verb;actStart(dtNear());o.covat=invCount('covat')-c0;o.scroll=invCount('bikip');o.relic=invCount(DT.T[s.ty][2]);o.out=!DT.in&&dC()>RW;
    at(14);o.tookVerb=targetInfo(dtNear()).verb;actStart(dtNear());o.sealed=!DT.in;o.cool=dtCool(s)>19*3600000;
    // hết 20 giờ thì mở lại
    S.dt[s.id]-=21*3600000;o.reopen=targetInfo(dtNear()).verb;
    // sức chứa
    {const bak=MP.rp;MP.rp=new Map([1,2,3,4].map(i=>[i,{ok:true,x:s.x+i,z:s.z}]));actStart(dtNear());o.full4=!DT.in;MP.rp=bak;}
    // cây đá trong thành đã cất đi, Tự làm không nhắm tới
    {const inR=RES.filter(q=>Math.hypot(q.x-s.x,q.z-s.z)<RW+26);o.resIn=inR.length;o.resGone=inR.every(q=>q.st===3);}
    // đánh chung: đòn của mình được gửi đi; đòn, đợt, tình trạng của người cùng thành được nhận về
    {const sent=[];const _on=mpOn,_em=mpEmit,_room=MP.room,bak=MP.rp;mpOn=()=>true;mpEmit=(t,d)=>{sent.push([t,JSON.parse(JSON.stringify(d))]);return Promise.resolve(true);};MP.room=MP.room||{};MP.rp=new Map([['pp',{ok:true,x:s.x+30,z:s.z,uid:'b1'}]]);
      S.dt[s.id]=0;at(14);actStart(dtNear());const fs=()=>G.foes.filter(f=>f.ruin===s.id&&f.alive);o.coIn=!!DT.in;o.coQ=sent.some(e=>e[0]==='dt'&&e[1].k==='q'&&e[1].s===s.id);o.coHpUp=fs()[0].hp0>o.w1hp;
      const f0=fs().find(f=>f.ri===0),h0=f0.hp;foeDamage(f0,3);tick(2);o.coSendH=sent.some(e=>e[1].k==='h'&&e[1].wv===0&&e[1].h[0][0]===0&&e[1].h[0][1]>=3);
      const n0=sent.length;dtHear({peer:'pp',by:'b1',data:{s:s.id,k:'h',wv:0,h:[[1,5]]}});const f1=fs().find(f=>f.ri===1);o.coRecvH=f1.hp===f1.hp0-5;tick(2);o.coNoEcho=!sent.slice(n0).some(e=>e[1].k==='h');
      dtHear({peer:'xa',by:'b9',data:{s:s.id,k:'h',wv:0,h:[[1,5]]}});o.coStranger=f1.hp===f1.hp0-5;
      dtHear({peer:'pp',by:'b1',data:{s:s.id,k:'q'}});const st=sent.filter(e=>e[1].k==='st').pop();o.coSt=!!st&&st[1].wv===0&&st[1].hp[0]<1&&st[1].hp[0]>0&&st[1].hp[5]===0;
      dtHear({peer:'pp',by:'b1',data:{s:s.id,k:'w',wv:2}});o.coJump=DT.in.w===2&&fs().length===1&&!!fs()[0].boss;
      dtHear({peer:'pp',by:'b1',data:{s:s.id,k:'w',wv:3}});o.coDone=DT.in.done&&fs().length===0;
      // vị trí lính: máy chủ trận (mã phòng nhỏ hơn) phát, máy mình kéo lính theo; không nghe nữa thì tự làm chủ, lính đuổi người gần nhất
      {dtHear({peer:'pp',by:'b1',data:{s:s.id,k:'w',wv:0}});at(-36);actStart(dtNear());at(14);actStart(dtNear());const _mp=MP.myPeer;MP.myPeer='zz';S.p.hp=1e6;P.x=s.x-96;P.z=s.z+64;const f=fs().find(f=>f.ri===0);
        for(let i=0;i<8;i++){dtHear({peer:'pp',by:'b1',data:{s:s.id,k:'p',wv:0,f:[[0,60,-40,1,0]]}});foesTick(0.2);}o.coPos=Math.hypot(f.x-(s.x+60),f.z-(s.z-40))<6;
        MP.myPeer='aa';DT.net.hostT=0;const before=sent.length;MP.rp.get('pp').x=f.x+50;MP.rp.get('pp').z=f.z;const x0=f.x;for(let i=0;i<4;i++)foesTick(0.2);o.coHostChase=f.x>x0+20;o.coHostSend=sent.slice(before).some(e=>e[1].k==='p'&&e[1].f.length>=1);
        MP.rp.get('pp').x=s.x+30;MP.rp.get('pp').z=s.z;MP.myPeer=_mp;S.p.hp=100;}
      // người vào sau nhận tình trạng trận
      at(-36);actStart(dtNear());at(14);actStart(dtNear());DT.net.rate.clear();dtHear({peer:'pp',by:'b1',data:{s:s.id,k:'st',wv:1,hp:[0.5,0,0,0,0,0]}});o.coJoin=DT.in.w===1&&fs().length===1&&fs()[0].hp<=Math.round(fs()[0].hp0*0.5);
      at(-36);actStart(dtNear());mpOn=_on;mpEmit=_em;MP.room=_room;MP.rp=bak;S.dt[s.id]=Date.now();}
    // cổ vật đổi điểm thuộc tính
    invAdd('covat',3);const p0=heroPts();dtOffer();o.pts=heroPts()-p0;at(60);}
  // đồ cổ hiếm: đeo vào có tác dụng thật
  {S.wear=S.wear||{};const d0=heroDef();S.wear.neck='buaho';o.bua=+(heroDef()-d0).toFixed(3);delete S.wear.neck;o.rareQ=typeof nvmQ==='function'?nvmQ('vongdong'):4;o.rareItems=!!(ITEMS.buaho&&ITEMS.vongdong&&ITEMS.andong&&ITEMS.buaho.slot==='neck');{const x0=S.sk.hunt||0;addXp('hunt',10);const d1=(S.sk.hunt||0)-x0;S.wear.acc='andong';addXp('hunt',10);o.an=+(((S.sk.hunt||0)-x0-d1)/d1).toFixed(2);delete S.wear.acc;}}
  // quản trị: mở hết
  setLv(1);S.knL={};o.lockBefore=!mkOk('voi');ADM.admin=true;o.admAll=MK.every(e=>mkOk(e[0]))&&knHas(KNS[KNS.length-1]);o.admRuin=DT.sites.length?(S.dt[DT.sites[0].id]=Date.now(),dtCool(DT.sites[0])===0):true;ptOpen();const el=document.getElementById('ptw');o.panel=!!el.querySelector('.mk-box')&&!!el.querySelector('[data-mk="lv"]');el.querySelector('[data-mk="lv"]').click();o.admLv=heroLv();ADM.admin=false;el.hidden=true;return o;});
console.log(JSON.stringify(r));if(logs.length)console.log(logs.slice(0,5).join('\n'));
const ok=r.lv1===1&&r.daoLock&&r.daoMsg&&!r.pow0&&r.khoLock&&r.khoMsg&&r.khoTag&&r.khoOpen&&r.daoOpen&&r.cap===50&&r.rankMax===50&&r.full&&r.noPay&&r.learned&&r.spinLock&&r.spinNoScroll&&r.spin&&r.guardL&&r.guardFx>=0.3&&r.kns===9&&r.sites>=1&&r.reg>=1&&r.wallOut&&r.lvLock&&r.openVerb==='Vào di tích'&&r.part==='gate'&&r.inside&&r.w1===3&&r.w1n==='Lính cổ'&&r.wallIn&&/Hạ hết/.test(r.midVerb||'')&&r.early===0&&r.w2===2&&r.w2n==='Vệ binh đồng'&&r.boss&&r.bossHp>100&&r.bossHit>=9&&/Rút ra/.test(r.exitVerb||'')&&r.left&&r.again1===3&&r.done&&r.chestVerb==='Mở rương cổ'&&r.covat>=2&&r.scroll>=1&&r.relic===1&&r.out&&/phong ấn/.test(r.tookVerb||'')&&r.sealed&&r.cool&&r.reopen==='Vào di tích'&&r.full4&&r.an===1.1&&r.resGone&&r.coIn&&r.coQ&&r.coHpUp&&r.coSendH&&r.coRecvH&&r.coNoEcho&&r.coStranger&&r.coSt&&r.coJump&&r.coDone&&r.coJoin&&r.coPos&&r.coHostChase&&r.coHostSend&&r.pts===1&&r.bua>=0.05&&r.rareQ===4&&r.rareItems&&r.lockBefore&&r.admAll&&r.admRuin&&r.panel&&r.admLv===6&&!logs.length;
console.log(ok?'MK-DAT':'MK-HONG');await b.close();})();
