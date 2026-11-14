// Bảng Dân làng gọn: đủ 13 việc, +/− chuyển người, danh sách gom theo việc, không tràn ngang trên điện thoại; việc Làm ruộng gặt và gieo được.
const {chromium}=require('playwright');const HTML=process.argv[2]||require('path').resolve(__dirname,'../../index.html');const SHOT=process.argv[3];
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:390,height:800},deviceScaleFactor:SHOT?2:1,hasTouch:true,isMobile:true});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-b');localStorage.setItem('ldtt-nohd','1')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));p.on('console',m=>{if(m.type()==='warning'&&/việc thêm/.test(m.text()))logs.push(m.text())});
await p.goto('file://'+HTML);await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{const o={};let n=9800;const mk=(k,dx,dz)=>{const b={id:n++,k,x:P.x+dx,y:hAt(P.x+dx,P.z+dz),z:P.z+dz,r:0,lv:0};S.builds.push(b);structAdd(b,true);if(pieceDef(k).store)S.store[b.id]=Array(pieceDef(k).store).fill(null);return b;};
  G.animals.length=0;if(G.foes)G.foes.length=0;mk('campfire',30,0);const bk=mk('basket',60,0);S.hour=10;
  const roles=['hunter','gatherer','potter','elder'];const F=(job,i)=>({n:['Lan','Sơn','Mây','Đá','Suối','Núi','Gió','Trăng','Sao','Lửa','Rừng','Hoa','Cỏ','Sương'][i%14]+(i>13?i:''),role:roles[i%4],seed:900+i,sex:i%2?'m':'f',job,x:P.x+20+i*6,z:P.z+20,fed:TNOW()-(i===3?2:0),lv:1+i%4,cap:i%5===0?1:0,loy:40});
  S.folk=[];for(let i=0;i<18;i++)S.folk.push(F(['wood','wood','wood','gather','gather','idle','idle','idle','guard','soldier','stone','idle','cook','idle','idle','wood','idle','idle'][i],i));
  uiOpen('dan',{});const pn=document.querySelector('#panel');o.tiles=pn.querySelectorAll('.dl-t').length;o.jobs=[...pn.querySelectorAll('.dl-b[data-d="1"]')].map(x=>x.dataset.j).join(',');o.people=pn.querySelectorAll('.dl-p').length;o.groups=pn.querySelectorAll('.dl-grp').length;
  const body=pn.querySelector('.p-body');o.overflowX=body.scrollWidth>body.clientWidth+2;o.gridH=Math.round(pn.querySelector('.dl-grid').getBoundingClientRect().height);o.smallBtn=[...pn.querySelectorAll('.dl-b')].filter(x=>x.getBoundingClientRect().width<32).length;
  const cntJ=j=>S.folk.filter(f=>f.job===j).length;const i0=cntJ('idle');pn.querySelector('.dl-b[data-j="farm"][data-d="1"]').click();pn.querySelector('#panel .dl-b[data-j="build"][data-d="1"]')||0;document.querySelector('#panel .dl-b[data-j="build"][data-d="1"]').click();o.plus=[cntJ('farm'),cntJ('build'),i0-cntJ('idle')];
  document.querySelector('#panel .dl-b[data-j="wood"][data-d="-1"]').click();o.minus=cntJ('wood');
  document.querySelector('#panel .dl-p').click();o.who=G.panel==='folk'&&!!document.querySelector('#panel [data-a="dlback"]')&&document.querySelectorAll('#panel .dl-acts [data-a="job"]').length;document.querySelector('#panel [data-a="dlback"]').click();o.back=G.panel==='dan';
  // việc Làm ruộng
  const f1=mk('farm',100,60),f2=mk('farm',140,60);S.crops[f1.id]={k:'grain',p:1};S.store[bk.id][0]={id:'seedGrain',n:2};const keep=S.folk;S.folk=[F('farm',20)];for(let i=0;i<60*150;i++){G.t+=1/60;folkTick(1/60);}
  o.grain=vthHave([S.store[bk.id]],'grain');o.sown=!!S.crops[f2.id]&&!!S.crops[f1.id];S.folk=keep;uiOpen('dan',{});return o;});
console.log(JSON.stringify(r));if(SHOT){await p.waitForTimeout(800);await p.screenshot({path:SHOT});}
const ok=r.tiles===12&&r.jobs.split(',').length===12&&r.people===18&&!r.overflowX&&r.smallBtn===0&&r.plus.join()==='1,1,2'&&r.minus===3&&r.who===13&&r.back&&r.grain>=3&&r.sown&&r.gridH<560&&!logs.length;
console.log(ok?'DL-DAT':'DL-HONG '+logs.join('|'));await b.close();})();
