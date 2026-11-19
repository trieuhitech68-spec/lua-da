// Tướng lĩnh, quân số, chiến thuật, nghiên cứu 10 bậc, bảng Phát triển.
const {chromium}=require('playwright');const HTML=process.argv[2]||require('path').resolve(__dirname,'../../index.html');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:390,height:800},isMobile:true,hasTouch:true});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-g');localStorage.setItem('ldtt-nohd','1');localStorage.setItem('ldtt-kt','1');localStorage.setItem('ld-dl','0')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));
await p.goto('file://'+HTML);await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r=await p.evaluate(async()=>{const o={};const W=ms=>new Promise(r=>setTimeout(r,ms));let n=9700;const mk=(k,x,z,ht)=>{const bq={id:n++,k,x,y:hAt(x,z),z,r:0,lv:0};if(ht){bq.ht=ht;bq.hg=1;}S.builds.push(bq);structAdd(bq,true);return bq;};const cx=Math.round(P.x/CELL)*CELL,cz=Math.round(P.z/CELL)*CELL;
  mk('campfire',cx+20,cz+20);for(let i=0;i<8;i++)mk('hammock',cx+100+i*40,cz+100);S.folk=S.folk||[];for(let i=0;i<5;i++)S.folk.push({n:'Lính '+i,job:'soldier',x:P.x+30+i*10,z:P.z+30,seed:i+1,hp:10,lv:1+i});
  // chưa có Trại lính: không có suất tướng, quân số 3
  o.slots0=tgSlots();o.cap0=tgArmyCap();
  mk('roof',cx+20,cz+220,'qh_linh');o.slots1=tgSlots();
  for(const k of ['meatCooked','hide','bone'])invAdd(k,40);invAdd('spear',2);
  // cấp nhân vật thấp: không phong được
  const u=qdUid(S.folk.find(f=>f.n==='Lính 4'));tgPromote(u);o.g0=tgList().length;o.hl0=heroLv();
  for(const k of ['chop','gather','hunt','build','craft'])addXp(k,2500);o.hl1=heroLv();tgPromote(u);o.g1=tgList().length;o.cap1=tgArmyCap();
  const g=tgList()[0];o.sp=g&&g.sp;
  // sở trường + tướng đánh mạnh hơn
  const f4=S.folk.find(f=>f.n==='Lính 4'),f0=S.folk.find(f=>f.n==='Lính 0');TG.ui=1;f0.arm=g.sp==='cav'?'spear':g.sp;if(g.sp==='cav')g.sp='spear';const dG=danDmg(f4),dS=danDmg(f0);f0.arm=g.sp==='bow'?'spear':'bow';const dO=danDmg(f0);o.genStrong=dG>dS;o.spBonus=dS>dO*0.99&&dS/dO>1.05;TG.ui=0;
  // kinh nghiệm → lên cấp; thăng sao cần đủ cấp
  tgStar(g.uid);o.st0=g.st|0;tgXp(g,5000);o.lv=g.lv;o.have=['meatCooked','hide','bone'].map(k=>haveCount(k)).join(',')+' '+JSON.stringify(tgStarCost(g));tgStar(g.uid);o.st1=g.st|0;o.cap2=tgArmyCap();
  // chiến thuật: khoá theo cấp tướng
  tgTacSet('vay');o.tac=qdS().tac;const d1=(TG.ui=1,danDmg(f0));qdS().tac='can';const d2=danDmg(f0);TG.ui=0;o.tacFx=Math.abs(d1/d2-1)>0.03;
  // tài riêng của tướng (cấp ≥ 5): Luyện quân thêm quân số, Uy dũng tăng đòn; thiên phú 5 bậc có khoá cấp
  {const c0=tgArmyCap();g.kn=null;tgKnNext(g.uid);o.kn1=g.kn;g.kn='luyen';o.knCap=tgArmyCap()>c0;g.kn=null;TG.ui=1;const a0=danDmg(f0);g.kn='uy';const a1=danDmg(f0);TG.ui=0;o.knUy=a1>a0*1.01;o.knLv=tgKnLv(g);
   o.tpMax=TP_MAX;o.tpN=TP.length;heroS().tp={san:3};const hl=heroLv();o.tpLock=hl<20;tpUp('san');o.tp4=tpLv('san');heroS().tp={};}
  // quân số: đầy thì không chiêu mộ
  const s0=qdSol().length;const A=qdS();A.rcN=0;const capNow=tgArmyCap();while(qdSol().length<capNow)S.folk.push({n:'Thêm'+qdSol().length,job:'soldier',x:P.x,z:P.z,seed:9,hp:10});const before=qdSol().length;qdRecruit();o.full=qdSol().length===before;
  // nghiên cứu 10 bậc, có ngưỡng cấp nhân vật
  o.ncMax=NC_MAX;o.ncN=NC.length;o.need4=ncNeedLv(4);o.t10=NC_T[10];S.nc={lv:{binh:3},cur:null};const c3=ncCost(NC.find(q=>q.id==='binh'),3),c4=ncCost(NC.find(q=>q.id==='binh'),4);o.costUp=Object.values(c4).reduce((a,b)=>a+b,0)>Object.values(c3).reduce((a,b)=>a+b,0)*1.5;o.eff=[ncEffL(3),ncEffL(10)];
  // bảng Phát triển + khung tướng trong Đạo quân
  ptOpen();await W(400);const el=document.getElementById('ptw');o.pt=!!(el&&!el.hidden);o.ptRows=el?el.querySelectorAll('.pt-r').length:0;o.score=ptData().score;o.ptOv=el?el.querySelector('.nc-c').scrollWidth<=el.querySelector('.nc-c').clientWidth+1:false;el.hidden=true;
  const h=qdHtml();o.box=h.includes('tg-box')&&h.includes('data-a="tgtac"');return o;});
console.log(JSON.stringify(r));
const ok=r.slots0===0&&r.cap0===3&&r.slots1>=1&&r.g0===0&&r.hl1>=5&&r.g1===1&&r.cap1>3&&r.genStrong&&r.spBonus&&r.st0===0&&r.lv>5&&r.st1===1&&r.cap2>r.cap1&&r.kn1==='uy'&&r.knCap&&r.knUy&&r.knLv>=1&&r.tpMax===5&&r.tpN===8&&(r.tpLock?r.tp4===3:r.tp4===4)&&r.tac==='vay'&&r.tacFx&&r.full&&r.ncMax===10&&r.ncN>=8&&r.need4===12&&r.t10===2160&&r.costUp&&r.eff[0]===3&&r.eff[1]===6.5&&r.pt&&r.ptRows===6&&r.score>0&&r.ptOv&&r.box&&!logs.length;
console.log(ok?'TG-DAT':'TG-HONG '+logs.join('|'));await b.close();})();
