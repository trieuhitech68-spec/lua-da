const {chromium}=require('playwright');
const MAXMIN=+process.argv[2]||8,SEEDK=process.argv[3]||'';
(async()=>{
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const c=await b.newContext({viewport:{width:900,height:600},deviceScaleFactor:1});
  await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-b');localStorage.setItem('ldtt-nohd','1')}catch(e){}});
  const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message+' '+(e.stack||'').slice(0,300)));p.on('console',m=>{if(m.type()==='warning'&&/auto|solid|cơ bản/.test(m.text()))logs.push(m.text().slice(0,300))});
  await p.goto('file://'+require('path').resolve(__dirname,'../../index.html'));await p.waitForTimeout(5000);
  const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
  await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:150000});await p.waitForTimeout(2000);
  await p.evaluate(()=>{window.__T=[];const _u=uiToast;uiToast=function(m){if(/🤖|Hoàn thành|Dừng|trục trặc|Không|Thiếu|Cần|kẹt/.test(m))__T.push((G.t|0)+'s g'+S.goal+' '+String(m).slice(0,130)+(/kẹt|bám|Không tìm/.test(m)?' @'+(P.x|0)+','+(P.z|0)+' y'+((P.y-hAt(P.x,P.z))|0)+' m3='+M3.st+' jobs='+AQ.jobs.map(j=>j.k+(j.x!=null?'('+(j.x|0)+','+(j.z|0)+')':'')).join('>'):''));return _u.apply(this,arguments)};
    G.R.render=()=>{};if(K3.fx)K3.fx.render=()=>{};window.requestAnimationFrame=()=>0;let T=performance.now()+1e6;window.__ff=setInterval(()=>{const t0=performance.now();while(performance.now()-t0<60){T+=50;try{loop(T);}catch(e){__T.push('LOOPERR '+e.message);break;}}
      if(G.paused&&!(typeof H4==='object'&&H4.on)){const ob=document.querySelector('#overlay button');if(ob)ob.click();G.paused=false;}
      if(!AQ.on&&!G.sleeping&&S.goal<GOALS.length&&G.t-(window.__rs||0)>3){window.__rs=G.t;window.__n=(window.__n||0)+1;__T.push((G.t|0)+'s g'+S.goal+' >>> bấm Tự làm lại ('+GOALS[S.goal].t+') kind='+aqKind(S.goal));aqStart(S.goal);}},0);aqStart(S.goal);});
  const t0=Date.now();let last=-1,lastT=Date.now();
  while(Date.now()-t0<MAXMIN*60000){await p.waitForTimeout(15000);const s=await p.evaluate(()=>({g:S.goal,t:G.t|0,n:window.__n||0,jobs:AQ.jobs.map(j=>j.k).join('>'),lab:AQ.lastLab}));if(s.g!==last){last=s.g;lastT=Date.now();}
    if(s.n>40||Date.now()-lastT>240000){console.log('STALL',JSON.stringify(s));break;}}
  console.log(JSON.stringify(await p.evaluate(()=>({goal:S.goal,gt:GOALS[S.goal]&&GOALS[S.goal].t,t:G.t|0,hp:S.p.hp|0,food:S.p.food|0,water:S.p.water|0,warm:S.p.warm|0,wet:S.p.wet|0,st:Object.keys(S.st),jobs:AQ.jobs.map(j=>j.k+(j.piece?':'+j.piece:'')+(j.id?':'+j.id:'')).join('>'),lab:AQ.lastLab,inv:S.inv.filter(Boolean).map(s=>s.id+s.n).join(' '),builds:S.builds.map(b=>b.k+(b.prog==null?'':'*')).join(' '),age:S.age,rt:AQ.rt,msg:AQ.msg,jd:JSON.stringify(AQ.jobs,(k,v)=>typeof v==='function'?'fn':(k==='r'||k==='b'||k==='q'||k==='pl'||k==='ctx'||k==='pts'||k==='a'||k==='sk'||k==='n')?(v&&v.id||1):v).slice(0,500),plan:(()=>{try{return JSON.stringify(aqSpec(S.goal).plan(),(k,v)=>typeof v==='function'?'fn':k==='r'?v.id:v).slice(0,300)}catch(e){return 'E'+e.message}})(),lv:JSON.stringify(S.sk)}))));
  console.log('TKLOG\n'+(await p.evaluate(()=>(typeof TK!=='undefined'&&TK.log||[]).join('\n')))+'\nTKEND');
  console.log((await p.evaluate(()=>__T)).join('\n'));
  console.log(logs.slice(-6).join('\n'));await b.close();
})();
