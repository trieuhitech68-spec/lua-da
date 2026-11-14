// Thuần thú không bị đánh nhầm; người Giữ cổng khi chưa có cổng không đứng dồn ở bếp; việc mới của người làng: thợ xây, chăn nuôi, đi săn, đánh cá.
const {chromium}=require('playwright');const HTML=process.argv[2]||require('path').resolve(__dirname,'../../index.html');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:400,height:240}});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-b');localStorage.setItem('ldtt-nohd','1')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));p.on('console',m=>{if(m.type()==='warning'&&/việc thêm|canh gác/.test(m.text()))logs.push(m.text())});
await p.goto('file://'+HTML);await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{const o={};let n=9800;const mk=(k,dx,dz,prog)=>{const b={id:n++,k,x:P.x+dx,y:hAt(P.x+dx,P.z+dz),z:P.z+dz,r:0,lv:0};if(prog!=null)b.prog=prog;S.builds.push(b);structAdd(b,true);if(pieceDef(k).store)S.store[b.id]=Array(pieceDef(k).store).fill(null);return b;};
  // 1) thuần thú: cầm rìu, thức ăn nằm ô khác, lom khom bấm Hành động 4 lần → thành vật nuôi, không mất máu
  S.pets=[];const a=G.animals.find(x=>x.kind==='boar'&&x.alive);a.x=P.x+25;a.z=P.z;a.angry=false;const hp0=a.hp;for(let i=0;i<S.inv.length;i++)S.inv[i]=null;S.inv[0]={id:'axe',n:1};S.inv[7]={id:'berry',n:2};S.sel=0;G.sneak=true;
  const t={type:'animal',a};actStart(t);actStart(t);o.afterTwo={tame:+(a.tame||0).toFixed(2),hp:a.hp===hp0,food:invCount('berry')};o.verb=targetInfo(t).verb;
  G.sneak=false;G.act=null;actStart(t);o.noFood={hp:a.hp===hp0,act:!G.act};S.inv[7]={id:'berry',n:3};actStart(t);actStart(t);o.pet=S.pets.some(q=>q.k==='pig');G.act=null;
  // 2) người Giữ cổng khi chưa có cổng
  G.animals.forEach(x=>{if(Math.hypot(x.x-P.x,x.z-P.z)<1500&&x!==a){x.x+=3000;}});if(G.foes)G.foes.length=0;
  const fire=mk('campfire',30,0);const bk=mk('basket',60,0);S.hour=10;const F=(job,i)=>({n:'F'+i,role:'hunter',seed:900+i,sex:'m',job,x:P.x+30+i,z:P.z+10,fed:TNOW(),lv:1});
  S.folk=[F('gate',0),F('gate',1)];const run=s=>{for(let i=0;i<60*s;i++){G.t+=1/60;folkTick(1/60);}};run(60);
  o.gateFar=S.folk.map(f=>Math.round(Math.hypot(f.x-fire.x,f.z-fire.z)));o.gateApart=Math.round(Math.hypot(S.folk[0].x-S.folk[1].x,S.folk[0].z-S.folk[1].z));
  // 3) thợ xây: một công trường thường và một công trường nhiều công đoạn (vật liệu trong giỏ)
  const s1=mk('fence',100,40,0);const stId=Object.keys(STG).find(k=>pieceDef(k)&&pieceDef(k).kind==='obj'&&STG[k].length>=2);const s2=mk(stId,-90,60,0);s2.paid=0;const need={};for(const sg of STG[stId])for(const k in sg.c)need[k]=(need[k]||0)+sg.c[k];let si=0;for(const k in need)S.store[bk.id][si++]={id:k,n:need[k]};
  S.folk=[F('build',2)];run(240);o.built=[s1.prog==null,s2.prog==null];o.stg=stId;o.matLeft=S.store[bk.id].filter(Boolean).reduce((x,s)=>x+s.n,0);
  // 4) chăn nuôi: cho ăn + nhặt trứng
  S.store[bk.id].fill(null);S.store[bk.id][0]={id:'berry',n:6};const coop=mk('coop',-60,-60);S.tank[coop.id]=3;S.pets=[{id:1,k:'chicken',x:coop.x+10,z:coop.z,born:TNOW()-9,fed:TNOW()-0.8},{id:2,k:'chicken',x:coop.x-10,z:coop.z,born:TNOW()-9,fed:TNOW()-0.8}];
  S.folk=[F('herd',3)];run(150);o.fed=S.pets.every(q=>TNOW()-q.fed<0.5);o.eggs=vthHave([S.store[bk.id]],'egg');o.tank=Math.floor(S.tank[coop.id]||0);
  // 5) đi săn
  const rb=G.animals.find(x=>x.kind==='rabbit'&&x.alive);rb.x=P.x+260;rb.z=P.z+200;rb.home={x:rb.x,z:rb.z};S.folk=[F('hunt',4)];run(120);o.meat=vthHave([S.store[bk.id]],'meat');
  // 6) đánh cá (chỉ kiểm không lỗi; có nước gần thì phải có cá)
  S.folk=[F('fish',5)];o.bank=!!vthBank(folkHome(S.folk[0]));run(150);o.fish=vthHave([S.store[bk.id]],'fish');
  // 6b) ruộng lúa nước: gieo mạ → cấy → gặt; sổ làng; người nấu tiếp củi
  S.store[bk.id].fill(null);S.store[bk.id][0]={id:'seedRice',n:2};S.store[bk.id][1]={id:'wood',n:3};const pd=mk('paddy',-140,-140);const PF=l4Pad(pd);PF.st=0;PF.w=1;const _si=seasonIdx;seasonIdx=()=>0;
  S.folk=[F('farm',8)];run(60);o.padSow=PF.st;PF.st=2;run(60);o.padPlant=PF.st;PF.st=4;run(90);o.padReap=PF.st===0&&vthHave([S.store[bk.id]],'riceSheaf');seasonIdx=_si;
  o.log=Object.keys(vthLog().m).length>0&&(vthLog().m.riceSheaf||0)>=4;S.folk=[F('cook',9)];S.fuel[fire.id]=1.5;folkHourly(1);o.fuel=S.fuel[fire.id]>=5&&vthHave([S.store[bk.id]],'wood')===2;
  uiOpen('dan',{});o.logHtml=/mang về kho/.test(document.querySelector('#panel').innerText);uiClose();
  // 7) đêm về ngủ
  S.hour=23;S.folk=[F('build',6),F('hunt',7)];S.folk.forEach(f=>{f.x+=200;});run(30);o.sleep=S.folk.every(f=>f._st==='sleep');S.hour=10;
  o.jobs=['build','herd','hunt','fish'].every(j=>JOBN[j]);o.nvn=nvnS().q.length;return o;});
console.log(JSON.stringify(r));
const ok=r.afterTwo.tame>0.5&&r.afterTwo.hp&&r.afterTwo.food===0&&/Cần|Cho ăn/.test(r.verb)&&r.noFood.hp&&r.noFood.act&&r.pet&&r.gateFar.every(d=>d>60)&&r.gateApart>40&&r.built[0]&&r.built[1]&&r.matLeft===0&&r.fed&&r.eggs===3&&r.tank===0&&r.meat>=1&&(!r.bank||r.fish>=3)&&r.padSow===1&&r.padPlant===3&&r.padReap>=4&&r.log&&r.fuel&&r.logHtml&&r.sleep&&r.jobs&&r.nvn===5&&!logs.length;
console.log(ok?'VT-DAT':'VT-HONG '+logs.join('|'));await b.close();})();
