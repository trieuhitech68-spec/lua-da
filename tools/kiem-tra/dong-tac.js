const {chromium}=require('playwright');const tag=process.argv[2]||'p',LIST=(process.argv[3]||'dig,gather,hammer,lash,cook,whittle').split(',');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:400,height:340}});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-b');localStorage.setItem('ldtt-nohd','1')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../../index.html'));await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
await p.evaluate(()=>{const st=document.createElement('style');st.textContent='#game>*:not(canvas){visibility:hidden!important}';document.head.appendChild(st);S.view='tp';viewApply();if(G.grass)G.grass.visible=false;give({axe:1,pick:1,digStick:1,knife:1});
  let best=null,bs=-1e9;for(let r=100;r<1200;r+=60)for(let a=0;a<16;a++){const x=SPAWN[0]+Math.cos(a/16*6.283)*r,z=SPAWN[1]+Math.sin(a/16*6.283)*r;if(wdAt(x,z)>0||slopeAt(x,z)>0.12)continue;const sc=-r*0.01;if(sc>bs){bs=sc;best=[x,z];}}
  for(const i of near(best[0],best[1],260)){const q=RES[i];if(q.st===0){q.st=1;try{resShow(q)}catch(e){}}}try{RI.forEach(v=>v.api.flush())}catch(e){}
  P.x=best[0];P.z=best[1];P.y=groundY(P.x,P.z);P.ry=0;G.zoom=62;G.pitch=0.2;G.yaw=P.ry+Math.PI/2+0.5;G.camInit=0;G.ctv=null;
  window.__p=['idle',0];const _h=h3pose;window.__h0=_h;h3pose=function(R,m,t){try{const [n,k]=__p;K3.char2Neutral(R);if(n.indexOf('h3')===0)H3PO[n.slice(2)](R,k,{t:k*3,n:Math.floor(k*4),tool:P.toolId});else if(n.indexOf('dt')===0)DTP[n.slice(2)](R,k,{t:k*3});else K3.char2Pose(R,n,k*2,{phase:k,tool:P.toolId});return true;}catch(e){window.__pe=n+' '+String(e);return _h.apply(this,arguments)}};});
const KS=[0.1,0.35,0.6,0.85];
for(let j=0;j<LIST.length;j++){const [n,tool]=LIST[j].split(':');await p.evaluate(t=>{equip(t||null)},tool||'');for(let i=0;i<4;i++){await p.evaluate(a=>{window.__p=a},[n,KS[i]]);await p.waitForTimeout(2300);await p.screenshot({path:`pose_${j}_${i}.png`,timeout:120000});}}
console.log(await p.evaluate(()=>window.__pe||'ok'),logs.slice(0,4).join('\n'));await b.close();
const {execSync}=require('child_process');execSync(`python3 -c "
from PIL import Image
n=${LIST.length}
c=Image.new('RGB',(400*4,340*n))
for j in range(n):
  for i in range(4):c.paste(Image.open('pose_%d_%d.png'%(j,i)).convert('RGB'),(i*400,j*340))
c.save('pose_${tag}.jpg',quality=85)"`);})();
