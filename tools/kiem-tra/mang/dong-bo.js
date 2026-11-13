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
  // 1) lưu lên máy chủ: có số bản và mã máy, lần sau tăng số bản
  const r1=await ev(async()=>{const id=curSlot();save();ACC.busy=false;await accPush(id,true);const a=Object.assign({},ACC.cloud[id]);S.day=(S.day||1)+1;save();ACC.busy=false;await accPush(id,true);const b=ACC.cloud[id];return {id,rev1:a.rev,rev2:b.rev,dev:b.dev===accDev(),known:accRev(id),parts:b.parts}});
  need(r1.rev1>=1&&r1.rev2===r1.rev1+1&&r1.dev&&r1.known===r1.rev2,'mỗi lần lưu tăng số bản, ghi mã máy');
  // 2) máy khác lưu bản mới hơn: máy này không ghi đè, hiện bảng tải bản mới, tải về đúng bản của máy kia
  const r2=await ev(async()=>{const id=curSlot(),base='data/users/'+ACC.uid+'/save';const o=JSON.parse(localStorage.getItem(SKEY+'#'+id));o.day=77;o.name='MayKhac';const raw=JSON.stringify(o);const n=Math.ceil(raw.length/PART);
    for(let i=0;i<n;i++)await ACC.db.doc(`${base}/parts/${id}_${i}`).set({s:raw.slice(i*PART,(i+1)*PART)});const m=Object.assign({},ACC.cloud[id],{parts:n,len:raw.length,rev:(ACC.cloud[id].rev|0)+1,dev:'dKHAC',day:77,ts:Date.now()});await ACC.db.doc(`${base}/chars/${id}`).set(m);
    S.day=5;save();ACC.busy=false;const _r=location.reload;let reloaded=0;try{Object.defineProperty(window,'__noReload',{value:1});}catch(e){}
    await accPush(id,true);const cloud=(await ACC.db.doc(`${base}/chars/${id}`).get()).data();const box=!!document.getElementById('acc-cf');
    const r=await accPullTry(id);if(r)accTake(id,r);const loc=JSON.parse(localStorage.getItem(SKEY+'#'+id));
    return {keptCloud:cloud.dev==='dKHAC'&&cloud.day===77,box,stop:ACC.stop===1,pulledDay:loc.day,known:accRev(id)===cloud.rev,newer:accNewer(id)}});
  need(r2.keptCloud,'không được ghi đè bản mới của máy khác');need(r2.box&&r2.stop,'phải hiện bảng báo tải bản mới và ngừng lưu');need(r2.pulledDay===77&&r2.known,'tải về đúng bản của máy kia');
  need(!logs.length,'lỗi: '+logs.slice(0,3).join(' | '));
  console.log(bad.length?'DB-HONG '+bad.join('; '):'DB-DAT');await b.close();
})();
