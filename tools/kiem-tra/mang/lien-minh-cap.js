// Cấp liên minh: góp vật liệu lấy công hiến, tổng công hiến của các thành viên quyết định cấp, có giới hạn mỗi ngày, có thưởng. Chạy: node mang/lien-minh-cap.js
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await c.addInitScript(fs.readFileSync(require('path').join(__dirname,'mock.js'),'utf8').replace("put('world/s2',{seed:777,wv:3});","").replace(/for\(let i=0;i<150;i\+\+\)/,"for(let i=0;i<3;i++)"));
  const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message+' '+(e.stack||'').slice(0,500)));
  await p.goto('file://'+require('path').resolve(__dirname,'../../../index.html'));await p.waitForTimeout(6000);
  const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
  const ev=async f=>{try{const r=await p.evaluate(f);console.log(JSON.stringify(r));return r}catch(e){console.log('EVALERR',e.message.slice(0,600));return {}}};
  await click('Tạo nhân vật mới');await p.waitForTimeout(2500);await click('Bắt đầu');await p.waitForTimeout(16000);
  const bad=[];const need=(ok,t)=>{if(!ok)bad.push(t)};
  const r0=await ev(()=>({lv:lmcLv(),html:lmcHtml(),cap:tgArmyCap()}));need(r0.lv===0&&r0.html==='','chưa vào liên minh thì không có cấp');
  // vào liên minh của b1; b1 đã góp 90 điểm, b2 góp cho liên minh KHÁC (không tính)
  const r1=await ev(()=>{__put('clans/b1',{name:'Sói Xám',leader:'b1',members:['b1','b2',MP.uid],color:'#5aa0e6',emblem:'🌙',createdAt:1,zone:null,deny:[],w:S.seed,war:[]});__put('players/b1',{look:0,clan:'b1',req:null,w:S.seed,lastSeen:Date.now(),hl:8,cg:[90,'b1']});__put('players/b2',{look:0,clan:'b1',w:S.seed,lastSeen:Date.now(),hl:6,cg:[5000,'khac']});mpSaveMe({clan:'b1'});
    return new Promise(r=>setTimeout(()=>r({clan:mpMyClan(),tot:lmcTotal('b1'),lv:lmcLv()}),3000))});
  need(r1.clan==='b1','phải vào được liên minh');need(r1.tot===90&&r1.lv===0,'chỉ tính công hiến góp cho đúng liên minh này');
  const r2=await ev(()=>{invAdd('wood',30);const w0=invCount('wood');lmcGive('wood');const o={took:w0-invCount('wood'),p:S.lmc.p,tot:lmcTotal('b1'),lv:lmcLv(),cg:MP.me.cg,cap:tgArmyCap()};const h=lmcHtml();o.html=/Cấp liên minh/.test(h)&&/data-a="lmcgive"/.test(h);o.tribe=/class="lmc"/.test(mpTribeHtml());return o;});
  need(r2.took===10&&r2.p===10,'góp 10 gỗ được 10 công hiến');need(r2.tot===100&&r2.lv===1,'tổng 100 công hiến thì lên cấp 1');need(r2.cg&&r2.cg[0]===10&&r2.cg[1]==='b1','gửi công hiến lên máy chủ');need(r2.html&&r2.tribe,'bảng Liên minh có khung Cấp liên minh');
  // giới hạn mỗi ngày + thưởng quân số ở cấp 2
  const r3=await ev(()=>{invAdd('bronze',40);for(let i=0;i<40;i++)lmcGive('bronze');const o={p:S.lmc.p,n:S.lmc.n,left:invCount('bronze')};__put('players/b1',{look:0,clan:'b1',req:null,w:S.seed,lastSeen:Date.now(),hl:8,cg:[150,'b1']});return new Promise(r=>setTimeout(()=>{o.tot=lmcTotal('b1');o.lv=lmcLv();o.cap=tgArmyCap();r(o)},3000))});
  need(r3.p===200&&r3.n===200,'mỗi ngày chỉ góp được 200 điểm');need(r3.left>15,'hết lượt góp thì không trừ đồ nữa');need(r3.tot===350&&r3.lv===2,'350 công hiến là cấp 2');need(r3.cap===r0.cap+1,'cấp 2 cho chỉ huy thêm 1 lính');
  need(!logs.length,'lỗi: '+logs.slice(0,3).join(' | '));
  console.log(bad.length?'LMC-HONG '+bad.join('; '):'LMC-DAT');await b.close();
})();
