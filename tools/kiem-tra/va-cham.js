const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:500,height:300}});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-b');localStorage.setItem('ldtt-nohd','1')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../../index.html'));await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{window.requestAnimationFrame=()=>0;const out=[];
 let gx=0,gz=0,ok=false;for(let r=160;r<2500&&!ok;r+=80)for(let a=0;a<14&&!ok;a++){const x=Math.round((P.x+Math.cos(a)*r)/40)*40,z=Math.round((P.z+Math.sin(a)*r)/40)*40;let mn=1e9,mx=-1e9;for(let i=-4;i<=4;i++)for(let j=-4;j<=4;j++){const h=hAt(x+i*40,z+j*40);mn=Math.min(mn,h);mx=Math.max(mx,h);}if(mx-mn<3&&wdAt(x,z)<=0){gx=x;gz=z;ok=true;}}
 for(const i of near(gx,gz,400)){const q=RES[i];if(q.st===0)q.st=1;}const y0=hAt(gx,gz);let n=9600;
 let CX=0,CZ=0,HW=20,HD=20;const sim=(sx,sz,dx,dz,steps)=>{P.x=sx;P.z=sz;P.y=groundY(sx,sz,y0+2);P.air=false;P.vy=0;G.keys={};let maxY=P.y,pen=-99;for(let s=0;s<steps;s++){S.p.stam=100;G.t+=1/60;try{moveTick(1/60)}catch(e){}try{move(dx,dz,0.5,1/60,false)}catch(e){}if(!P.air)P.y=groundY(P.x,P.z);maxY=Math.max(maxY,P.y);const inx=HW-Math.abs(P.x-CX),inz=HD-Math.abs(P.z-CZ);pen=Math.max(pen,Math.min(inx,inz));}return {x:P.x,z:P.z,my:maxY-y0,pen};};
 const all=(typeof BUILD!=='undefined'?BUILD:[]).filter(d=>d.kind==='obj');
 for(const d of all){try{const fp=d.fp||[1,1],cx=gx+(fp[0]%2?20:0),cz=gz+(fp[1]%2?20:0);const b={id:n++,k:d.id,x:cx,y:y0,z:cz,r:0,lv:0};S.builds.push(b);structAdd(b,true);
   let H=0,W=0;try{const m=model(['piece',d.id]);const bb=new THREE.Box3().setFromObject(m);H=bb.max.y-bb.min.y;W=Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z);}catch(e){}
   CX=cx;CZ=cz;HW=Math.min(fp[0]*20,Math.max(4,W/2));HD=Math.min(fp[1]*20,Math.max(4,W/2));if(fp[0]*fp[1]>1){HW=fp[0]*20;HD=fp[1]*20;}const ext=Math.max(fp[0],fp[1])*20+40;const a=sim(cx+ext,cz+1,-1,0,Math.ceil((ext*2)/ (112*0.5/60))+30),c=sim(cx+1,cz+ext,0,-1,Math.ceil((ext*2)/(112*0.5/60))+30);
   const a2=sim(cx+ext,cz,-1,0.02,300),c2=sim(cx,cz+ext,0.02,-1,300);const pen=Math.max(a.pen,c.pen,a2.pen,c2.pen),my=Math.max(a.my,c.my,a2.my,c2.my);out.push([d.id,d.n,fp.join('x'),'H'+Math.round(H),'W'+Math.round(W),'lọt'+Math.round(pen),'lên'+Math.round(my),SOL_WALK.test(d.id)?'W':'',d.bed?'bed':'',d.small?'small':'']);
   structRemove(b);const i=S.builds.indexOf(b);if(i>=0)S.builds.splice(i,1);}catch(e){out.push([d.id,'ERR '+String(e).slice(0,80)]);}}
 /* ---- TƯỜNG, RÀO (dạng cạnh): đi bộ thẳng vào phải bị chặn, cả khi chân tường thấp hơn chỗ đứng 14 đơn vị (dốc); món có cửa thì thử ở mép, không thử giữa lối cửa ---- */
 const edges=(typeof BUILD!=='undefined'?BUILD:[]).filter(d=>d.kind==='edge'&&!/ladder/i.test(d.id));
 for(const d of edges){for(const dy of [0,-14]){try{const b={id:n++,k:d.id,x:gx+20,y:y0+dy,z:gz,r:0,lv:0};S.builds.push(b);structAdd(b,true);const ox=d.door?-16:0;
     const a=sim(gx+20+ox,gz+70,0,-1,260);const thru=a.z<gz-6;out.push([d.id+(dy?'@dốc':''),d.n,'cạnh','H50','W40',thru?'lọt99':'lọt0','lên0',d.low?'thấp':'',d.door?'cửa':'']);
     structRemove(b);const i=S.builds.indexOf(b);if(i>=0)S.builds.splice(i,1);}catch(e){out.push([d.id,'ERR '+String(e).slice(0,80)]);}}}
 /* ---- LỀU: từ phía sau và bên hông phải bị chặn, từ mặt trước phải đi vào được tới giữa lều ---- */
 for(const k of Object.keys(typeof SOL_SH!=='undefined'?SOL_SH:{})){try{const d=pieceDef(k),fp=d.fp||[1,1],cx=gx+(fp[0]%2?20:0),cz=gz+(fp[1]%2?20:0);const b={id:n++,k,x:cx,y:y0,z:cz,r:0,lv:0};S.builds.push(b);structAdd(b,true);CX=cx;CZ=cz;HW=fp[0]*20-6;HD=fp[1]*20-6;const ext=Math.max(fp[0],fp[1])*20+50;
     const back=sim(cx,cz-ext,0,1,330),side=sim(cx+ext,cz,-1,0,330),front=sim(cx,cz+ext,0,-1,330);
     out.push([k+'@sau',d.n,'lều','H50','W40',back.z>cz-fp[1]*20+16?'lọt99':'lọt0','lên0','','']);out.push([k+'@bên',d.n,'lều','H50','W40',side.x<cx+fp[0]*20-16?'lọt99':'lọt0','lên0','','']);
     out.push([k+'@trước-phải-vào-được',d.n,'lều','H50','W40',front.z<cz+12?'lọt0':'lọt99','lên0','','']);
     structRemove(b);const i=S.builds.indexOf(b);if(i>=0)S.builds.splice(i,1);}catch(e){out.push([k,'ERR '+String(e).slice(0,80)]);}}
 return out;});
const rows=r.map(x=>x.join(' | '));require('fs').writeFileSync(require('path').join(require('os').tmpdir(),'ld-va-cham.txt'),rows.join('\n'));console.log('pieces',r.length);
console.log(logs.slice(0,5).join('\n'));await b.close();})();
