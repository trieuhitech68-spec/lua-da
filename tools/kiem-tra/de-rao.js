// Không dựng đè lên rào: nhà trọn bộ / công trình nhiều ô không đặt được khi có rào chạy giữa các ô của nó; rào không dựng xuyên giữa công trình nhiều ô; chỗ trống vẫn đặt bình thường.
const {chromium}=require('playwright');const HTML=process.argv[2]||require('path').resolve(__dirname,'../../index.html');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:400,height:260}});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-d');localStorage.setItem('ldtt-nohd','1')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));
await p.goto('file://'+HTML);await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{const o={};for(const d of BUILD)S.known['b:'+d.id]=1;['wood','stick','stone','fiber','rope','bamboo','clay','plank'].forEach((k,i)=>{if(ITEMS[k])S.inv[i]={id:k,n:60};});let n=9800;const mkE=(x,z,r,k)=>{const b={id:n++,k:k||'fence',x,y:hAt(x,z),z,r,lv:0};S.builds.push(b);structAdd(b,true);return b;};
  // tìm chỗ phẳng, trống, khô gần người chơi
  const q=QH.find(x=>x.id==='qh_chinh'),parts=qhParts(q);let spot=null;for(let rr=80;rr<900&&!spot;rr+=40)for(let a=0;a<16&&!spot;a++){const tx=Math.round((P.x+Math.sin(a/16*6.283)*rr)/CELL)*CELL,tz=Math.round((P.z+Math.cos(a/16*6.283)*rr)/CELL)*CELL;const pl=b4BpPlan(parts,tx,tz,0);if(!pl.why||/Xa quá/.test(pl.why))spot=[tx,tz];}
  if(!spot)return {noSpot:1};const [tx,tz]=spot;const w0=b4BpPlan(parts,tx,tz,0).why;o.free=!w0||/Xa quá/.test(w0);
  // rào chạy dọc theo đường x=tx (cạnh đứng giữa hai cột ô của căn nhà), ngang qua tâm nhà
  const f1=mkE(tx,tz-CELL/2,1),f2=mkE(tx,tz+CELL/2,1);const w1=b4BpPlan(parts,tx,tz,0).why;o.blocked=/chạy ngang giữa nhà/.test(w1);o.msg=w1.slice(0,60);
  // dời hẳn sang bên 6 ô: lại đặt được (hoặc vướng thứ khác không phải rào)
  const w2=b4BpPlan(parts,tx+CELL*6,tz,0).why;o.away=!/chạy ngang giữa nhà/.test(w2);
  // công trình nhiều ô đặt đơn lẻ: chuồng lợn 2×2 đè lên đoạn rào
  buildBegin('pigPen');const B=G.build;B.pos={x:tx,y:hAt(tx,tz),z:tz,r:0};const _aim=buildAim;buildAim=()=>({x:tx,z:tz});buildUpdate();o.single=/chạy ngang giữa chỗ này|Vướng|vướng/.test(B.why||'');o.singleMsg=(B.why||'').slice(0,50);buildEnd();
  // dựng rào xuyên giữa một công trình nhiều ô có sẵn
  structRemove(f1);structRemove(f2);const pen={id:n++,k:'pigPen',x:tx,y:hAt(tx,tz),z:tz,r:0,lv:0};S.builds.push(pen);structAdd(pen,true);buildBegin('fence');const B2=G.build;buildAim=()=>({x:tx,z:tz-CELL/2});B2.r=1;buildUpdate();o.edgePos=[Math.round(B2.pos.x-tx),Math.round(B2.pos.z-tz),B2.pos.r];o.edgeIn=/xuyên qua giữa|đã có/.test(B2.why||'');o.edgeMsg=(B2.why||'').slice(0,50);
  buildAim=()=>({x:tx+CELL*4,z:tz-CELL/2});buildUpdate();o.edgeOut=!/xuyên qua giữa/.test(G.build.why||'');buildEnd();buildAim=_aim;return o;});
console.log(JSON.stringify(r));const ok=!r.noSpot&&r.free&&r.blocked&&r.away&&r.single&&r.edgeIn&&r.edgeOut&&!logs.length;console.log(ok?'DR-DAT':'DR-HONG '+logs.join('|'));await b.close();})();
