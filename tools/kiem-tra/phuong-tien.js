// Rà phương tiện và công cụ: bè tre, thuyền độc mộc, bơi, ngựa; cầm TỪNG dụng cụ dùng lên cây, đá, bụi, cỏ, thú. Không lỗi chạy, không cảnh báo, vị trí nhân vật hợp lý.
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:400,height:240}});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-b');localStorage.setItem('ldtt-nohd','1')}catch(e){}});const p=await c.newPage();const logs=[];
p.on('pageerror',e=>logs.push('ERR '+e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' | ').slice(0,200)));p.on('console',m=>{if((m.type()==='warning'||m.type()==='error')&&!/GPU stall|fallback|net::|Failed to load|THREE\.|deprecated|AudioContext/i.test(m.text()))logs.push(m.type()+' '+m.text().slice(0,220))});
await p.goto('file://'+path.resolve(__dirname,'../../index.html'));await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r=await p.evaluate(async()=>{const bad=[],o={};G.R.render=()=>{};if(K3.fx)K3.fx.render=()=>{};window.requestAnimationFrame=()=>0;let T=performance.now()+1e6;
  const ff=async s=>{const n=Math.round(s*20);for(let i=0;i<n;i++){T+=50;try{loop(T);}catch(e){bad.push('LOOP '+e.message+' '+String(e.stack).split('\\n')[1]);return;}if(i%40===39)await new Promise(r=>setTimeout(r,0));}};
  const reset=()=>{G.work=null;G.act=null;G.sit=false;G.keys={};G.walkTo=null;S.p.hp=100;S.p.stam=100;S.p.food=90;S.p.water=90;S.hour=10;try{if(AQ.on)aqStop('');}catch(e){}};
  const sane=t=>{if(!isFinite(P.x)||!isFinite(P.y)||!isFinite(P.z))bad.push(t+': toạ độ hỏng');};
  const deep=(min)=>{for(let r=100;r<5000;r+=40)for(let a=0;a<24;a++){const x=SPAWN[0]+Math.cos(a/24*6.283)*r,z=SPAWN[1]+Math.sin(a/24*6.283)*r;if(wdAt(x,z)>min){for(let k=1;k<16;k++){const bx=x-Math.cos(a/24*6.283)*k*10,bz=z-Math.sin(a/24*6.283)*k*10;if(wdAt(bx,bz)<=0)return [bx,bz,x,z];}}}return null;};
  for(const a of G.animals)if(a.kind!=='deer'&&a.kind!=='rabbit')a.alive=false;
  // A. bè tre, thuyền độc mộc
  for(const id of ['raft','canoe']){reset();const w=deep(8);if(!w){bad.push(id+': không tìm thấy nước');continue;}P.x=w[0];P.z=w[1];P.y=groundY(P.x,P.z);P.ry=Math.atan2(w[2]-w[0],w[3]-w[1]);give({[id]:1});S.boats=[];boatLaunch(id);const bt=(S.boats||[])[0];if(!bt){bad.push(id+': không thả được');continue;}
    await ff(0.5);const t=findTarget();if(!t||t.type!=='boat'){bad.push(id+': không thấy nút lên thuyền ('+(t&&t.type)+')');boatBoard(bt);}else actStart(t);await ff(0.3);if(!G.ride)bad.push(id+': không lên được');
    const x0=bt.x,z0=bt.z;G.keys={KeyW:true};let lo=1e9;for(let i=0;i<10;i++){await ff(0.5);lo=Math.min(lo,P.y-bt._o.position.y);}let mv=Math.hypot(bt.x-x0,bt.z-z0);for(let k=0;k<3&&mv<8;k++){/* suối hẹp: chạm bờ thì bẻ lái thử hướng khác */bt.ry=(bt.ry||0)+1.57;P.ry=bt.ry;for(let i=0;i<8;i++)await ff(0.5);mv=Math.hypot(bt.x-x0,bt.z-z0);}G.keys={};o[id]={mv:Math.round(mv),lo:+lo.toFixed(1)};
    if(lo<0.8)bad.push(id+': nhân vật chìm dưới mặt thuyền ('+lo.toFixed(1)+')');if(mv<8)bad.push(id+': chèo không đi ('+mv.toFixed(0)+')');sane(id);
    // quay về bờ rồi lên bờ
    bt.x=w[2]*0.3+w[0]*0.7;bt.z=w[3]*0.3+w[1]*0.7;if(wdAt(bt.x,bt.z)<2.3){bt.x=w[2];bt.z=w[3];}await ff(0.3);const t2=findTarget();if(t2&&t2.type==='leave')actStart(t2);else boatLeave();await ff(0.3);if(G.ride){bad.push(id+': không lên bờ được');G.ride=null;}}
  // B. bơi: thả giữa chỗ nước sâu, đứng yên rồi bơi một đoạn
  {reset();const w=deep(16);if(w){let cx=w[2],cz=w[3];for(let k=1;k<30;k++){const x=w[2]+(w[2]-w[0])/Math.hypot(w[2]-w[0],w[3]-w[1])*k*12,z=w[3]+(w[3]-w[1])/Math.hypot(w[2]-w[0],w[3]-w[1])*k*12;if(wdAt(x,z)>wdAt(cx,cz)){cx=x;cz=z;}}
      P.x=cx;P.z=cz;P.y=waterAt(cx,cz)-6;P.air=false;P.vy=0;await ff(1.5);const d0=P.y-waterAt(P.x,P.z),on0=!!G.swim,wd0=Math.round(wdAt(P.x,P.z));P.ry=Math.atan2(w[0]-cx,w[1]-cz);G.keys={KeyW:true};const x0=P.x,z0=P.z;await ff(2);G.keys={};const mv=Math.hypot(P.x-x0,P.z-z0);
      o.swim={on:on0,d:+d0.toFixed(1),wd:wd0,mv:Math.round(mv)};if(wd0>12){if(!on0)bad.push('bơi: xuống nước sâu mà không chuyển sang bơi');if(d0<-18||d0>3)bad.push('bơi: độ cao sai ('+d0.toFixed(1)+')');if(mv<10)bad.push('bơi: không bơi đi được ('+mv.toFixed(0)+')');}sane('bơi');P.x=w[0];P.z=w[1];P.y=groundY(P.x,P.z);G.swim=false;await ff(0.5);}}
  // C. ngựa
  {reset();try{if(!Array.isArray(S.mounts))S.mounts=[];let sp=null;for(let r=60;r<900&&!sp;r+=40)for(let a=0;a<12;a++){const x=P.x+Math.cos(a)*r,z=P.z+Math.sin(a)*r;if(wdAt(x,z)<=0&&slopeAt(x,z)<0.2){sp=[x,z];break;}}
      const m={id:(S.mseq=(S.mseq||0)+1),k:'horse',n:'Ngựa thử',x:sp[0],z:sp[1],ry:0,land:mtLand()};S.mounts.push(m);mtShow(m);P.x=sp[0]+10;P.z=sp[1];P.y=groundY(P.x,P.z);await ff(0.4);mtRide(m);await ff(0.3);if(!G.mnt)bad.push('ngựa: không lên được');
      const x0=P.x,z0=P.z;G.keys={KeyW:true,ShiftLeft:true};let hi=-1e9,lo=1e9;for(let i=0;i<10;i++){await ff(0.5);const d=P.y-hAt(P.x,P.z);hi=Math.max(hi,d);lo=Math.min(lo,d);}G.keys={};const mv=Math.hypot(P.x-x0,P.z-z0);o.horse={mv:Math.round(mv),lo:+lo.toFixed(1),hi:+hi.toFixed(1)};
      if(mv<40)bad.push('ngựa: không chạy được ('+mv.toFixed(0)+')');if(lo<-3)bad.push('ngựa: lún dưới đất ('+lo.toFixed(1)+')');sane('ngựa');mtOff(1);await ff(0.3);if(G.mnt)bad.push('ngựa: không xuống được');}catch(e){bad.push('ngựa: '+e.message);}}
  // D. từng dụng cụ lên từng loại mục tiêu
  const tools=Object.keys(ITEMS).filter(id=>ITEMS[id].t==='tool');o.tools=tools.length;const cats=[['cây',/^(oak|pine|birch|savannaTree)$/],['đá',/^(boulder|rock|flintRock)$/],['bụi',/^(berry|banana|flax)$/],['cỏ',/^(tallgrass|reeds|fern|stick|pebble)$/]];let acts=0;
  const nearRes=rx=>{let best=null,bd=1e9;for(const i of near(P.x,P.z,1400)){const q=RES[i];if(q.st!==0||q.lock||!rx.test(q.t)||wdAt(q.x,q.z)>0)continue;const d=Math.hypot(q.x-P.x,q.z-P.z);if(d<bd){bd=d;best=q;}}return best;};
  for(const id of tools){for(const [cn,rx] of cats){reset();const q=nearRes(rx);if(!q)continue;const rr=((RT[q.t].r||6)*q.s*0.7)+12;P.x=q.x-rr;P.z=q.z;P.y=groundY(P.x,P.z);P.ry=Math.PI/2;S.inv[0]={id,n:1};S.sel=0;try{equip(id);}catch(e){bad.push(id+': cầm lên lỗi '+e.message);continue;}
      try{await ff(0.2);const t=findTarget();if(t){targetInfo(t);actStart(t);acts++;await ff(1.6);}}catch(e){bad.push(id+' → '+cn+': '+e.message);}sane(id+' → '+cn);}
    {reset();const a=G.animals.find(a=>a.alive&&Math.hypot(a.x-P.x,a.z-P.z)<2500);if(a){P.x=a.x-18;P.z=a.z;P.y=groundY(P.x,P.z);P.ry=Math.PI/2;try{await ff(0.2);const t=findTarget();if(t){targetInfo(t);actStart(t);acts++;await ff(1.2);}}catch(e){bad.push(id+' → thú: '+e.message);}sane(id+' → thú');}}}
  o.acts=acts;o.bad=bad;return o;});
console.log(JSON.stringify(r));const all=r.bad.concat(logs.slice(0,12));console.log(all.length?'PT-HONG '+all.join(' ;; ').slice(0,1500):'PT-DAT');await b.close();})();
