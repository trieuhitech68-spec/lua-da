// Thuần thú: lom khom có thức ăn thì thú không lao vào; cho ăn xong 3 phút không cắn (cả bầy dịu theo); đánh nó thì hết; thuần đủ thì thành vật nuôi.
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:400,height:240}});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-b');localStorage.setItem('ldtt-nohd','1')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));
await p.goto('file://'+path.resolve(__dirname,'../../index.html'));await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r=await p.evaluate(async()=>{const o={},bad=[];G.R.render=()=>{};if(K3.fx)K3.fx.render=()=>{};window.requestAnimationFrame=()=>0;let T=performance.now()+1e6;const ff=async s=>{const n=Math.round(s*20);for(let i=0;i<n;i++){T+=50;loop(T);}await new Promise(r=>setTimeout(r,0));};
  const W=G.animals.filter(a=>a.alive&&a.kind==='wolf').slice(0,3);o.wolves=W.length;if(W.length<2){o.skip=1;o.bad=bad;return o;}for(const a of G.animals)if(!W.includes(a)){a.alive=false;if(a.o)a.o.visible=false;}
  let sx=0,sz=0,ok=false;for(let r=100;r<2500&&!ok;r+=60)for(let k=0;k<12&&!ok;k++){const x=P.x+Math.cos(k)*r,z=P.z+Math.sin(k)*r;if(wdAt(x,z)<=0&&slopeAt(x,z)<0.15&&wdAt(x+150,z)<=0){sx=x;sz=z;ok=true;}}
  for(const b of S.builds.slice())if(pieceDef(b.k)&&pieceDef(b.k).fuel){try{S.fuel[b.id]=0;}catch(e){}}
  P.x=sx;P.z=sz;P.y=groundY(sx,sz);S.p.hp=100;S.p.stam=100;S.hour=10;W.forEach((a,i)=>{a.x=sx+130+i*30;a.z=sz+i*40;a.y=hAt(a.x,a.z);a.angry=false;a.calm=0;a._panic=0;a.tame=0;a._tfT=null;a.state='wander';if(a.o)a.o.visible=true;});
  const D=ANIMALS.wolf,dist=a=>Math.hypot(a.x-P.x,a.z-P.z);S.inv.fill(null);
  // 1) đứng thẳng, không có thịt: sói thù địch
  G.sneak=false;o.h0=W.map(a=>!!l3hostile(a,D,dist(a)));
  // 2) lom khom, có thịt: không lao vào
  S.inv[0]={id:'meat',n:9};S.sel=0;G.sneak=true;o.h1=W.map(a=>!!l3hostile(a,D,dist(a)));if(o.h1.some(Boolean))bad.push('lom khom có thịt mà sói vẫn lao vào');
  await ff(6);o.hp1=Math.round(S.p.hp);if(S.p.hp<100)bad.push('lom khom có thịt vẫn bị cắn ('+o.hp1+')');
  // 3) cho một con ăn: nó và cả bầy 3 phút không cắn, kể cả khi đứng thẳng, hết 30 giây "ăn"
  const a=W[0];P.x=a.x-16;P.z=a.z;P.y=groundY(P.x,P.z);tameFeed(a);o.tame=a.tame;if(!(a.tame>0))bad.push('cho ăn không lên tiến độ thuần');G.sneak=false;S.inv[0]=null;G.t+=45;o.h2=W.map(x=>!!l3hostile(x,D,dist(x)));if(o.h2.some(Boolean))bad.push('đã cho ăn mà 45 giây sau sói vẫn thù địch');
  S.p.hp=100;await ff(8);o.hp2=Math.round(S.p.hp);if(S.p.hp<100)bad.push('vừa cho ăn xong vẫn bị cắn ('+o.hp2+')');
  // 4) quá 3 phút không cho ăn tiếp: thù địch lại; 5) đánh nó: mất tiến độ
  G.t+=200;o.h3=W.map(x=>!!l3hostile(x,D,dist(x)));if(W.some(x=>x._tfT!=null&&G.t-x._tfT<180))bad.push('quá 3 phút vẫn còn tính là vừa cho ăn');
  S.inv[0]={id:'meat',n:9};G.sneak=true;tameFeed(a);const t1=a.tame;animalDamage(a,0.1);o.broken=a.tame===0&&t1>0;if(!o.broken)bad.push('đánh con đang thuần mà không mất tiến độ');
  // 6) cho ăn đủ thì thành chó nhà
  const b2=W[1];b2.tame=0;const p0=(S.pets||[]).length;for(let k=0;k<4&&b2.alive;k++){P.x=b2.x-16;P.z=b2.z;tameFeed(b2);}o.pet=(S.pets||[]).length-p0;if(o.pet!==1)bad.push('cho ăn đủ mà không thành vật nuôi');
  o.bad=bad;return o;});
console.log(JSON.stringify(r));const all=r.bad.concat(logs);console.log(all.length?'TH-HONG '+all.join(' ;; ').slice(0,900):(r.skip?'TH-DAT (bản đồ này không đủ sói để thử)':'TH-DAT'));await b.close();})();
