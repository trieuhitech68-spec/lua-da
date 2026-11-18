// Tự dựng chọn đất có tính toán: không sát vách nhà khác, cửa quay vào làng, chuồng trại xa hơn nhà ở; đầu bảng Xây / Chế tạo có gợi ý nên làm gì tiếp và nút bấm chạy được.
const {chromium}=require('playwright');const HTML=process.argv[2]||require('path').resolve(__dirname,'../../index.html');const SHOT=process.argv[3];
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:390,height:800},deviceScaleFactor:SHOT?2:1,isMobile:true,hasTouch:true});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-e');localStorage.setItem('ldtt-nohd','1');localStorage.setItem('ld-dl','0')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));
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
  // 4) tự đặt từng món: luống mới kề luống cũ; chuồng không sát chỗ ngủ
  {const fd=BUILD.find(d=>d.kind==='obj'&&d.farm&&sxPurpose(d)==='trong'),nd=BUILD.find(d=>d.kind==='obj'&&sxPurpose(d)==='nuoi');o.fd=fd&&fd.id;o.nd=nd&&nd.id;
   if(fd){let s0=aq2Spots(fd)[0];if(s0){const f=mk(fd.id,s0.x,s0.z);const s1=aq2Spots(fd)[0];o.farmAdj=s1?Math.round(Math.hypot(s1.x-f.x,s1.z-f.z)):-1;}else o.farmAdj=-2;}
   if(nd){const s=aq2Spots(nd)[0],beds=S.builds.filter(b=>pieceDef(b.k)&&pieceDef(b.k).bed);o.penBed=s?Math.round(Math.min(...beds.map(b=>Math.hypot(b.x-s.x,b.z-s.z)))):-1;}}
  // 5) Tự làm không bịt lối vào cuối cùng của nhà: nền 2×2, 7 vách, còn đúng 1 khoảng hở
  {const bx=cx+CELL*30,bz=cz;const F=[[0,0],[1,0],[0,1],[1,1]];for(const [i,j] of F)mk('floor',bx+(i+0.5)*CELL,bz+(j+0.5)*CELL);
   const E=[[0.5,0,0],[1.5,0,0],[0.5,2,0],[1.5,2,0],[0,0.5,1],[0,1.5,1],[2,0.5,1]];for(const [u,v,r] of E)mk('wall',bx+u*CELL,bz+v*CELL,r);
   const lx=bx+2*CELL,lz=bz+1.5*CELL;o.sealLast=cdSeals(lx,lz,1);o.sealFree=cdSeals(cx+CELL*40,cz+CELL*0.5,1);const wd=pieceDef('wall');const L=aq2Spots(wd)||[];o.wallSpots=L.length;o.wallBad=L.filter(q=>Math.abs(q.x-lx)<2&&Math.abs(q.z-lz)<2).length;}
  if(G.panel)uiClose();uiOpen('craft',{});await W(900);o.craftBox=!!document.querySelector('#panel .cd-box');o.craftN=document.querySelectorAll('#panel .cd-box .cd-r').length;return o;});
console.log(JSON.stringify(r));if(SHOT){await p.evaluate(()=>{if(G.panel)uiClose();uiOpen('build',{});});await p.waitForTimeout(1500);await p.screenshot({path:SHOT});}
const R=r.res||{};const ok=r.box&&r.btn&&r.build&&R.qh_chinh&&R.qh_kho&&R.qh_lon&&R.qh_linh&&['qh_chinh','qh_kho','qh_lon','qh_linh'].every(k=>R[k].tight===0)&&R.qh_chinh.d<R.qh_lon.d&&R.qh_chinh.door&&r.second&&r.second.tight===0&&(!r.fd||r.farmAdj===40)&&(!r.nd||r.penBed>=150)&&r.sealLast===true&&r.sealFree===false&&r.wallBad===0&&r.craftBox&&r.craftN>=1&&!logs.length;
console.log(ok?'CD-DAT':'CD-HONG '+logs.join('|'));await b.close();})();
