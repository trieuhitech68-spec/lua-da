// Tự dựng chọn đất có tính toán: không sát vách nhà khác, cửa quay vào làng, chuồng trại xa hơn nhà ở; đầu bảng Xây / Chế tạo có gợi ý nên làm gì tiếp và nút bấm chạy được.
const {chromium}=require('playwright');const HTML=process.argv[2]||require('path').resolve(__dirname,'../../index.html');const SHOT=process.argv[3];
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:390,height:800},deviceScaleFactor:SHOT?2:1,isMobile:true,hasTouch:true});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-c');localStorage.setItem('ldtt-nohd','1')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));
await p.goto('file://'+HTML);await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r=await p.evaluate(async()=>{const o={};const W=ms=>new Promise(r=>setTimeout(r,ms));
  // 1) gợi ý trên làng trống
  for(const d of BUILD)S.known['b:'+d.id]=1;for(const rc of RECIPES)S.known['r:'+rc.id]=1;o.n0=cdNeeds().map(n=>n.t.slice(0,18)).join('|');uiOpen('build',{});await W(500);o.box=!!document.querySelector('#panel .cd-box');const bb=document.querySelector('#panel .cd-box [data-a="build"]');o.btn=bb&&bb.dataset.b;if(bb){for(const k of ['stick','stone','wood','fiber'])invAdd(k,20);bb.click();await W(500);o.build=!!G.build;try{buildEnd();}catch(e){}}
  // 2) dựng một xóm nhỏ rồi xin chỗ cho từng loại nhà
  for(const d of BUILD)S.known['b:'+d.id]=1;let n=9800;const mk=(k,x,z,r)=>{const bq={id:n++,k,x,y:hAt(x,z),z,r:r||0,lv:0};S.builds.push(bq);structAdd(bq,true);return bq;};const cx=Math.round(P.x/CELL)*CELL,cz=Math.round(P.z/CELL)*CELL;
  mk('campfire',cx+CELL*0.5,cz+CELL*0.5);mk('hammock',cx+CELL*2.5,cz+CELL*0.5);mk('basket',cx-CELL*1.5,cz+CELL*0.5);mk('workbench',cx+CELL*0.5,cz-CELL*1.5);const C=cdCenter();o.center=Math.round(Math.hypot(C.x-cx,C.z-cz));
  const res={};for(const id of ['qh_chinh','qh_kho','qh_lon','qh_linh']){const q=QH.find(x=>x.id===id),sp=qhSpot(qhParts(q),q.g);res[id]=sp?{d:sp.dC,tight:sp.tight,door:sp.door,trees:sp.trees}:null;}o.res=res;
  // 3) cắm thật Nhà chính ở chỗ được chọn, rồi xin chỗ cho Nhà kho: không được sát vách
  {const q=QH.find(x=>x.id==='qh_chinh'),parts=qhParts(q),sp=qhSpot(parts,q.g);const pl=b4BpPlan(parts,sp.x,sp.z,sp.q);for(const pp of pl.plan){if(pp.d.kind==='floor'||pp.d.kind==='obj'||pp.d.kind==='edge'){mk(pp.k,pp.x,pp.z,pp.r);}}const q2=QH.find(x=>x.id==='qh_kho'),sp2=qhSpot(qhParts(q2),q2.g);o.second=sp2?{tight:sp2.tight,d:sp2.dC}:null;}
  if(G.panel)uiClose();uiOpen('craft',{});await W(900);o.craftBox=!!document.querySelector('#panel .cd-box');o.craftN=document.querySelectorAll('#panel .cd-box .cd-r').length;return o;});
console.log(JSON.stringify(r));if(SHOT){await p.evaluate(()=>{if(G.panel)uiClose();uiOpen('build',{});});await p.waitForTimeout(1500);await p.screenshot({path:SHOT});}
const R=r.res||{};const ok=r.box&&r.btn&&r.build&&R.qh_chinh&&R.qh_kho&&R.qh_lon&&R.qh_linh&&['qh_chinh','qh_kho','qh_lon','qh_linh'].every(k=>R[k].tight===0)&&R.qh_chinh.d<R.qh_lon.d&&R.qh_chinh.door&&r.second&&r.second.tight===0&&r.craftBox&&r.craftN>=1&&!logs.length;
console.log(ok?'CD-DAT':'CD-HONG '+logs.join('|'));await b.close();})();
