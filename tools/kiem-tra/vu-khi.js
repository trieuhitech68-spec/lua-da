// Cầm vũ khí là dùng được: cung bắn bằng Hành động / nút Đánh / giữ G, trúng cây có phản hồi, hết tên thì báo; rìu vẫn chặt cây; giáo vẫn đâm thú.
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:400,height:240}});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-b');localStorage.setItem('ldtt-nohd','1')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));p.on('console',m=>{if(m.type()==='warning'&&/vũ khí/.test(m.text()))logs.push(m.text().slice(0,200))});
await p.goto('file://'+path.resolve(__dirname,'../../index.html'));await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r=await p.evaluate(async()=>{const o={},bad=[];G.R.render=()=>{};if(K3.fx)K3.fx.render=()=>{};window.requestAnimationFrame=()=>0;let T=performance.now()+1e6;window.__T=[];const _u=uiToast;uiToast=function(m){__T.push(String(m).slice(0,90));return _u.apply(this,arguments)};
  const ff=async s=>{const n=Math.round(s*20);for(let i=0;i<n;i++){T+=50;loop(T);}await new Promise(r=>setTimeout(r,0));};
  const keep=G.animals.find(a=>a.alive&&(a.kind==='deer'||a.kind==='rabbit'||a.kind==='boar'))||G.animals.find(a=>a.alive);for(const a of G.animals)if(a!==keep){a.alive=false;if(a.o)a.o.visible=false;}
  let q=null,bd=1e9;for(const i of near(P.x,P.z,1200)){const t=RES[i];if(t.st===0&&/^(oak|pine|birch)$/.test(t.t)&&wdAt(t.x,t.z)<=0&&slopeAt(t.x,t.z)<0.2){const d=Math.hypot(t.x-P.x,t.z-P.z);if(d<bd){bd=d;q=t;}}}
  {const C=[];for(const i of near(P.x,P.z,1500)){const t=RES[i];if(t.st===0&&/^(oak|pine|birch)$/.test(t.t)&&wdAt(t.x,t.z)<=0&&slopeAt(t.x,t.z)<0.2)C.push(t);}C.sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z));
    for(const t of C.slice(0,25)){for(const i of near(t.x,t.z,200)){const o2=RES[i];if(o2!==t&&o2.st===0)o2.st=1;}P.x=t.x-(RT[t.t].r||6)*t.s*0.7-14;P.z=t.z;P.y=groundY(P.x,P.z);P.ry=Math.PI/2;G.work=null;G.act=null;const ft=findTarget();if(ft&&ft.type==='res'&&ft.q===t){q=t;break;}}}
  for(const i of near(q.x,q.z,200)){const t=RES[i];if(t!==q&&t.st===0)t.st=1;}
  const clr=()=>{for(const d of (G.drops||[])){try{G.sc.remove(d.o)}catch(e){}}G.drops=[];};const stand=(d)=>{clr();P.x=q.x-d;P.z=q.z;P.y=groundY(P.x,P.z);P.ry=Math.PI/2;G.work=null;G.act=null;G.h3aim=null;G.walkTo=null;S.p.stam=100;S.p.hp=100;S.hour=10;};
  S.inv.fill(null);S.inv[0]={id:'bow',n:1};S.inv[1]={id:'arrow',n:12};S.sel=0;equip('bow');
  // 1) Hành động không có mục tiêu: bắn thẳng
  stand(300);P.ry=-Math.PI/2;await ff(0.3);let a0=invCount('arrow');actStart(null);await ff(0.3);o.aim1=!!G.h3aim;await ff(2.5);o.shot1=a0-invCount('arrow');if(o.shot1!==1)bad.push('Hành động khi cầm cung (không mục tiêu) không bắn');
  // 2) đứng sát cây bấm Hành động: bắn vào cây, trúng đích
  stand((RT[q.t].r||6)*q.s*0.7+14);await ff(0.3);const t=findTarget();o.t2=t&&t.type;a0=invCount('arrow');const x0=VK.xp;actStart(t);await ff(3);o.shot2=a0-invCount('arrow');o.hit2=VK.xp-x0;if(o.shot2!==1)bad.push('Hành động vào cây khi cầm cung không bắn ('+o.t2+')');if(o.hit2<1)bad.push('tên không trúng thân cây');
  // 3) bắn từ xa 120 vào cây bằng giữ G (giương hết)
  stand(120);await ff(0.3);a0=invCount('arrow');const x1=VK.xp;G.keys={KeyG:true};throwIt();await ff(1.2);o.aim3=!!G.h3aim;h3release();G.keys={};await ff(3);o.shot3=a0-invCount('arrow');o.hit3=VK.xp-x1;if(o.shot3!==1)bad.push('giữ G không bắn');if(o.hit3<1)bad.push('bắn từ xa không trúng cây');
  {const nd=(G.drops||[]).filter(d=>d.id==='arrow').length;o.drops=nd;if(nd){const d0=G.drops.find(d=>d.id==='arrow');P.x=d0.x-8;P.z=d0.z;P.y=groundY(P.x,P.z);G.h3aim=null;await ff(0.3);const a1=invCount('arrow');const td=findTarget();if(td&&td.type==='drop'){actStart(td);await ff(0.8);}o.back=invCount('arrow')-a1;if(o.back<1)bad.push('không nhặt lại được tên rơi dưới gốc cây');}}
  // 4) nút Đánh không có địch: vẫn bắn; có thú trong tầm: quay về phía thú
  stand(200);if(keep){keep.x=P.x+2000;keep.z=P.z+2000;}await ff(0.3);a0=invCount('arrow');u7Attack();await ff(2.5);o.shot4=a0-invCount('arrow');if(o.shot4!==1)bad.push('nút Đánh khi cầm cung không bắn');
  if(keep){stand(200);keep.x=P.x;keep.z=P.z+260;keep.y=hAt(keep.x,keep.z);keep.alive=true;if(keep.o)keep.o.visible=true;await ff(0.2);P.ry=Math.PI/2;u7Attack();o.face=Math.abs(P.ry)<0.3;if(!o.face)bad.push('nút Đánh không quay về phía thú');await ff(2.5);keep.x=P.x+3000;}
  // 5) hết tên: báo
  S.inv[1]=null;stand(200);await ff(0.2);actStart(null);await ff(0.5);o.noArrow=__T.some(m=>/Hết mũi tên/.test(m));if(!o.noArrow)bad.push('hết tên không báo');
  // 6) rìu vẫn chặt cây
  S.inv[2]={id:'axe',n:1};S.sel=2;equip('axe');stand((RT[q.t].r||6)*q.s*0.7+14);await ff(0.3);const t6=findTarget(),hp0=q.hp;o.t6=t6&&t6.type;if(t6)actStart(t6);for(let k=0;k<10&&q.hp===hp0&&q.st===0;k++){await ff(0.5);await new Promise(r=>setTimeout(r,450));}/* nhát chặt tính sau một khoảng trễ thật */o.chop=hp0-q.hp;if(!(o.chop>0)&&q.st===0)bad.push('cầm rìu không chặt được cây');
  // 7) giáo: thú ở xa (ngoài tầm đâm) bấm Hành động là phóng giáo; đang chọn đá, không có mục tiêu thì ném đá; bấm chuột (máy tính) khi cầm cung là bắn
  if(keep){clr();S.inv[3]={id:'spear',n:1};S.sel=3;equip('spear');stand(260);keep.alive=true;if(keep.o)keep.o.visible=true;keep.x=P.x+150;keep.z=P.z;keep.y=hAt(keep.x,keep.z);keep.calm=G.t+60;await ff(0.2);const n0=(G.proj||[]).length;actStart({type:'animal',a:keep,d:140});await ff(0.2);o.spAim=!!G.h3aim;await ff(1.5);o.spThrown=invCount('spear')===0||(G.proj||[]).length>n0||(G.drops||[]).some(d=>d.id==='spear');if(!o.spAim||!o.spThrown)bad.push('cầm giáo bấm Hành động vào thú ở xa không phóng');keep.x=P.x+3000;}
  clr();S.inv.fill(null);S.inv[0]={id:'stone',n:5};S.sel=0;equip(null);stand(300);P.ry=-Math.PI/2;await ff(0.3);if(!findTarget()){actStart(null);await ff(1.5);o.stone=5-invCount('stone');if(o.stone!==1)bad.push('đang chọn đá bấm Hành động không ném');}
  clr();S.inv[1]={id:'bow',n:1};S.inv[2]={id:'arrow',n:5};S.sel=1;equip('bow');stand(200);await ff(0.3);const sp=new THREE.Vector3(q.x,hAt(q.x,q.z)+10,q.z).project(G.cam);worldTap((sp.x*0.5+0.5)*innerWidth,(-sp.y*0.5+0.5)*innerHeight);await ff(0.2);o.clickAim=!!G.h3aim;await ff(2.5);o.clickShot=5-invCount('arrow');if(o.clickShot!==1)bad.push('máy tính: bấm chuột khi cầm cung không bắn');
  o.bad=bad;return o;});
console.log(JSON.stringify(r));const all=r.bad.concat(logs);console.log(all.length?'VK-HONG '+all.join(' ;; ').slice(0,900):'VK-DAT');await b.close();})();
