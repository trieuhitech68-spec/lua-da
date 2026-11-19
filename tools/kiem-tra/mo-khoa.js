// Mở khoá theo cấp, học chiêu, di tích cổ, quản trị mở hết. Bài này KHÔNG bỏ khoá (không đặt ldtt-kt). Chạy: node mo-khoa.js [html]
const {chromium}=require('playwright');const HTML=process.argv[2]||require('path').resolve(__dirname,'../../index.html');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:400,height:240}});const logs=[];
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-g');localStorage.setItem('ldtt-nohd','1');localStorage.setItem('ld-dl','0')}catch(e){}});const p=await c.newPage();p.on('pageerror',e=>logs.push('ERR '+e.message));p.on('console',m=>{if(m.type()==='warning'&&/di tích/.test(m.text()))logs.push('WARN '+m.text().slice(0,200));});
await p.goto('file://'+HTML);await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(4500);
const r=await p.evaluate(()=>{const o={},T=[];const _t=uiToast;uiToast=function(m){T.push(String(m));return _t.apply(this,arguments);};needGate=()=>'';const setLv=n=>{for(const k in SKILL)S.sk[k]=0;const ks=Object.keys(SKILL),need=30*(n-1)*(n-1);for(const k of ks)S.sk[k]=Math.ceil(need/ks.length)+1;};
  // cấp 1: đào bị khoá, chiêu chưa học
  setLv(1);o.lv1=heroLv();invAdd('digStick',1);o.daoLock=!mkOk('dao');const n0=T.length;daoStart('hao');o.daoMsg=T.slice(n0).some(t=>/mở khi nhân vật đạt cấp 4/.test(t));o.pow0=knHas(KNS[0]);
  // cấp 4: đào mở; cấp tối đa 50; danh hiệu cuối ở cấp 50
  setLv(4);o.daoOpen=mkOk('dao');setLv(80);o.cap=heroLv();o.rankMax=HERO_RANK[HERO_RANK.length-1][0];o.full=MK.every(e=>mkOk(e[0]));
  // học chiêu: đủ cấp nhưng thiếu lễ vật thì không học được; đủ thì học
  setLv(5);S.knL={};for(let i=0;i<S.inv.length;i++)S.inv[i]=null;knLearn('pow');o.noPay=!knHas(KNS[0]);invAdd('meatCooked',5);invAdd('stick',6);knLearn('pow');o.learned=knHas(KNS[0]);o.spinLock=!knHas(KNS.find(k=>k.id==='spin'));
  setLv(25);invAdd('bone',6);knLearn('spin');o.spinNoScroll=!knHas(KNS.find(k=>k.id==='spin'));invAdd('bikip',1);knLearn('spin');o.spin=knHas(KNS.find(k=>k.id==='spin'));
  // di tích: có trên bản đồ, đóng ngoài giờ, mở thì đánh lính canh rồi lấy rương một lần
  dtObjs();o.sites=DT.sites.length;o.reg=REG.filter(q=>/^ruin_/.test(q.id)).length;if(DT.sites.length){const s=DT.sites[0];P.x=s.x+20;P.z=s.z;P.y=hAt(P.x,P.z);for(const a of G.animals){a.alive=false;a.back=1e9;}
    const real=Date;const at=h=>{window.Date=class extends real{constructor(...a){if(a.length)super(...a);else{super();this.setHours(Math.floor(h),Math.round((h%1)*60),0,0);}}static now(){return real.now();}};};const W=DT.T[s.ty][2];
    at(W[0][1]+1.2);let tg=dtNear();o.closedVerb=targetInfo(tg).verb;at(W[0][0]+0.2);o.openVerb=targetInfo(dtNear()).verb;setLv(10);o.lvLock=/Cần cấp 20/.test(targetInfo(dtNear()).verb);setLv(25);
    const f0=(G.foes||[]).length;actStart(dtNear());o.guards=(G.foes||[]).filter(f=>f.ruin===s.id&&f.alive).length;o.midVerb=targetInfo(dtNear()).verb;for(const f of G.foes)if(f.ruin===s.id){f.alive=false;f.gone=true;}o.chestVerb=targetInfo(dtNear()).verb;const c0=invCount('covat');actStart(dtNear());o.covat=invCount('covat')-c0;o.scroll=invCount('bikip');o.tookVerb=targetInfo(dtNear()).verb;actStart(dtNear());o.again=invCount('covat')-c0;
    // cổ vật đổi điểm thuộc tính
    invAdd('covat',3);const p0=heroPts();dtOffer();o.pts=heroPts()-p0;window.Date=real;}
  // quản trị: mở hết
  setLv(1);S.knL={};o.lockBefore=!mkOk('voi');ADM.admin=true;o.admAll=MK.every(e=>mkOk(e[0]))&&knHas(KNS[KNS.length-1]);o.admRuin=DT.sites.length?dtWin(DT.sites[0])[0]:true;ptOpen();const el=document.getElementById('ptw');o.panel=!!el.querySelector('.mk-box')&&!!el.querySelector('[data-mk="lv"]');el.querySelector('[data-mk="lv"]').click();o.admLv=heroLv();ADM.admin=false;el.hidden=true;return o;});
console.log(JSON.stringify(r));if(logs.length)console.log(logs.slice(0,5).join('\n'));
const ok=r.lv1===1&&r.daoLock&&r.daoMsg&&!r.pow0&&r.daoOpen&&r.cap===50&&r.rankMax===50&&r.full&&r.noPay&&r.learned&&r.spinLock&&r.spinNoScroll&&r.spin&&r.sites>=1&&r.reg>=1&&/Đang đóng/.test(r.closedVerb||'')&&r.openVerb==='Vào di tích'&&r.lvLock&&r.guards>=3&&/Hạ hết lính canh/.test(r.midVerb||'')&&r.chestVerb==='Mở rương cổ'&&r.covat>=1&&r.scroll>=1&&/Đã lấy rương/.test(r.tookVerb||'')&&r.again===r.covat&&r.pts===1&&r.lockBefore&&r.admAll&&r.admRuin&&r.panel&&r.admLv===6&&!logs.length;
console.log(ok?'MK-DAT':'MK-HONG');await b.close();})();
