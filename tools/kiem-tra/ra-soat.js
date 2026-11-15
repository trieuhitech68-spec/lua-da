// Đợt rà soát: ruộng/nền đè lên cây thì cây bị dọn; vật nuôi có "Cho ăn"/"Xem tình trạng"; người nấu nấu đủ món; ngựa lội suối, góc nhìn thứ nhất khi cưỡi ở trên đầu ngựa; ô Đo giật đã gỡ.
const {chromium}=require('playwright');const HTML=process.argv[2]||require('path').resolve(__dirname,'../../index.html');const SHOT=process.argv[3];
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:SHOT?{width:900,height:560}:{width:400,height:240}});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-b');localStorage.setItem('ldtt-nohd','1')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));
await p.goto('file://'+HTML);await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{const o={};let n=9800;const mk=(k,x,z)=>{const b={id:n++,k,x,y:hAt(x,z),z,r:0,lv:0};S.builds.push(b);structAdd(b);if(pieceDef(k).store)S.store[b.id]=Array(pieceDef(k).store).fill(null);return b;};
  // 1) ruộng đè lên cây
  let tr=null,bd=1e9;for(const q of RES){if(q.st!==0||!/^(pine|oak|birch)$/.test(q.t))continue;const d=Math.hypot(q.x-P.x,q.z-P.z);if(d<bd&&d>80){bd=d;tr=q;}}const cx=(Math.floor(tr.x/CELL)+0.5)*CELL,cz=(Math.floor(tr.z/CELL)+0.5)*CELL;const far=RES.find(q=>q.st===0&&q.t===tr.t&&Math.hypot(q.x-tr.x,q.z-tr.z)>200);
  const fm=mk('farm',cx,cz);o.cleared=tr.st===2&&S.res[tr.i][0]===2;o.farKept=far.st===0;S.res[tr.i][1]=0;resRegrow();o.noRegrow=tr.st===2;o.treeWalk=(()=>{const c=collide(tr.x,tr.z);return Math.hypot(c[0]-tr.x,c[1]-tr.z)<3;})();
  // 2) vật nuôi
  S.pets=[{id:1,k:'pig',x:P.x+20,z:P.z,born:TNOW()-2,fed:TNOW()-1.5}];petSpawn(S.pets[0]);for(let i=0;i<S.inv.length;i++)S.inv[i]=null;o.v1=petInfo(S.pets[0]).verb;S.inv[3]={id:'berry',n:2};o.v2=petInfo(S.pets[0]).verb;petUse(S.pets[0]);o.fedNow=TNOW()-S.pets[0].fed<0.01&&invCount('berry')===1;o.v3=petInfo(S.pets[0]).verb;let msg='';const _t=uiToast;uiToast=function(m){msg=String(m);return _t.apply(this,arguments);};petUse(S.pets[0]);uiToast=_t;o.status=/ngày tuổi/.test(msg);
  // 3) người nấu ăn nấu đủ món
  const raw=Object.keys(ITEMS).find(k=>k!=='meat'&&k!=='fish'&&ITEMS[k+'Cooked']&&!ITEMS[k].poison);const fire=mk('campfire',P.x+40,P.z);S.fuel[fire.id]=10;const bk=mk('basket',P.x+70,P.z);S.store[bk.id][0]={id:raw,n:4};S.folk=[{n:'A',role:'potter',seed:5,sex:'f',job:'cook',x:P.x+30,z:P.z+10,fed:TNOW(),lv:1}];folkHourly(1);o.raw=raw;o.cooked=vthHave([S.store[bk.id]],raw+'Cooked');S.folk=[];
  // 4) ngựa: lội suối, không bị coi là bơi; mắt nhìn thứ nhất cao hơn lưng ngựa
  if(!Array.isArray(S.mounts))S.mounts=[];const m={id:99,k:'horse',n:'Ngựa thử',x:P.x+20,z:P.z,ry:0,land:typeof mtLand==='function'?mtLand():0};S.mounts.push(m);mtShow(m);mtRide(m);o.mnt=!!G.mnt;
  let w=null;for(let r0=100;r0<2500&&!w;r0+=40)for(let a=0;a<24;a++){const x=P.x+Math.sin(a/24*6.283)*r0,z=P.z+Math.cos(a/24*6.283)*r0,d=wdAt(x,z);if(d>12&&d<30){w={x,z,d};break;}}o.water=w?+w.d.toFixed(1):null;
  if(w){P.x=w.x;P.z=w.z;P.y=groundY(P.x,P.z);o.swim=swimCheck();const x0=P.x,z0=P.z;for(let i=0;i<30;i++)move(0,1,1,1/60,false);o.moved=+Math.hypot(P.x-x0,P.z-z0).toFixed(1);o.still=!!G.mnt;}
  S.view='fp';viewApply();fpCam(1);fpCam(1);o.eye=+(G.cam.position.y-P.y).toFixed(1);o.dg=typeof DG==='undefined'&&typeof ldGiat==='undefined';return o;});
console.log(JSON.stringify(r));
if(SHOT){await p.evaluate(()=>{S.hour=11;G.hourLock=1;const c=collide(SPAWN[0]+60,SPAWN[1]+60);P.x=c[0];P.z=c[1];P.ry=0.8;});await p.waitForTimeout(3000);await p.screenshot({path:SHOT});}
const ok=r.cleared&&r.farKept&&r.noRegrow&&r.treeWalk&&r.v1==='Xem tình trạng'&&/^Cho ăn/.test(r.v2)&&r.fedNow&&r.v3==='Xem tình trạng'&&r.status&&r.cooked>=3&&r.mnt&&(r.water==null||(r.swim===false&&r.moved>3&&r.still))&&r.eye>45&&r.dg&&!logs.length;
console.log(ok?'RS-DAT':'RS-HONG '+logs.join('|'));await b.close();})();
