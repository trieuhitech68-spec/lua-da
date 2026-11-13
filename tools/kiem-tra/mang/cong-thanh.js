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
  // phe b1 (liên minh Sói Xám) đang giữ điểm giàu đầu tiên
  const r1=await ev(()=>{const s=RL.sites[0];window.__sid=s.id;__put('clans/b1',{name:'Sói Xám',leader:'b1',members:['b1'],color:'#5aa0e6',emblem:'🌙',createdAt:1,zone:null,deny:[],w:S.seed,war:[]});__put('players/b1',{look:0,clan:'b1',req:null,w:S.seed,lastSeen:Date.now(),hl:8,df:[2,4,0]});
    __put('sites/b1',{w:S.seed,c:'b1',L:{[s.id]:[6,120,Date.now(),1]}});
    mpClanWrite({name:'Lửa Thiêng',leader:MP.uid,members:[MP.uid],color:MPCOL[0],emblem:MPEMB[0],createdAt:Date.now(),zone:null,deny:[]});mpSaveMe({clan:MP.uid,req:null});addXp('chop',900);
    P.x=s.x+20;P.z=s.z;P.y=hAt(P.x,P.z);return new Promise(r=>setTimeout(()=>{rlMpTick();rlMpCalc();const t=cthNear(),i=t&&targetInfo(t);r({ctl:RL.mp.ctl[s.id]&&RL.mp.ctl[s.id].g,near:!!t,ok0:i&&i.ok,need0:i&&i.need})},3000))});
  need(r1.ctl==='b1','phe b1 phải đang giữ điểm');need(r1.near&&r1.ok0===false,'chưa tuyên chiến thì không công phá được');
  const r2=await ev(()=>{pvpWarSet('b1',true);return new Promise(r=>setTimeout(()=>{const t=cthNear(),i=targetInfo(t);actStart(t);const g=G.foes.filter(f=>f.pvp).length,W=G.work;if(W&&W.fn){W.fn();G.work=null;}rlMpTick();
    setTimeout(()=>{const d=__db.get('sites/me1')||{};r({ok:i.ok,verb:i.verb,guards:g,k:S.ct.k,ctl:RL.mp.ctl[__sid],K:d.K,ws:S.pvp.ws,again:cthWhy(RL.byId[__sid],{g:'b1',sc:50,all:[]})})},2500)},1500))});
  need(r2.ok===true,'đang chiến tranh phải công phá được');need(r2.guards>=3,'lính giữ đất phải xông ra');need(r2.k&&r2.k[Object.keys(r2.k)[0]]>0,'ghi lần công phá');need(r2.ctl==null,'sau công phá phe kia mất quyền giữ');need(r2.K,'tài liệu sites có K');need(r2.ws&&r2.ws.b1>=15,'+15 điểm chiến tranh');need(/giờ/.test(r2.again||''),'24 giờ mới công phá lại');
  // mình bị công phá: mất nửa kho; phần chia đất; lính giữ tiền đồn; bảng liên minh
  const r3=await ev(()=>{const s=RL.sites[1],st=S.rlm.s[s.id]||(S.rlm.s[s.id]={});st.own='me';st.stock={};const it=Object.keys(s.def.y).find(i=>ITEMS[i]);st.stock[it]=10;__put('sites/b1',{w:S.seed,c:'b1',L:{},K:{[s.id]:Date.now()}});
    return new Promise(r=>setTimeout(()=>{const half=st.stock[it];const d0=rlDef(s).v;S.folk=(S.folk||[]).concat([{job:'guard',lv:3},{job:'soldier',lv:3}]);const d1=rlDef(s).v;S.folk.length-=2;
      RL.mp.ctl[RL.sites[2].id]={g:rlGrp(MP.uid),sc:99,all:[[rlGrp(MP.uid),99]]};const _c=rlMpCalc;rlMpCalc=function(){};S.rlm.day=S.day-1;rlDaily();rlMpCalc=_c;const sh=Object.assign({},S.ct.share);const h=cthHtml();cthShareGet();
      uiOpen('clan');r({half,d0,d1,sh,html:/Đất liên minh đang giữ \(1\)/.test(h)&&/Nhận/.test(h),got:Object.keys(S.ct.share).length})},2500))});
  need(r3.half===5,'bị công phá mất nửa kho');need(r3.d1>r3.d0,'lính làm tăng sức giữ tiền đồn');need(Object.keys(r3.sh||{}).length>0,'có phần chia đất');need(r3.html,'bảng liên minh hiện đất giữ');need(r3.got===0,'nhận phần chia xong thì hết');
  need(!logs.length,'lỗi: '+logs.slice(0,3).join(' | '));
  console.log(bad.length?'CT-HONG '+bad.join('; '):'CT-DAT');await b.close();
})();
