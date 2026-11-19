// Đại lục: cây đá và sinh cảnh phải GIỐNG NHAU dù đứng ở tỉnh nào. Tạo nhân vật, ghi lại cây đá + sinh cảnh theo toạ độ đại lục, sang tỉnh phía đông, ghi lại, so vùng chung.
// Chạy: node dai-luc-khop.js [html]
const {chromium}=require('playwright');const HTML=process.argv[2]||require('path').resolve(__dirname,'../../index.html');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:400,height:240}});const logs=[];
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-g');localStorage.setItem('ldtt-nohd','1');localStorage.setItem('ldtt-kt','1');localStorage.setItem('ld-dl','1')}catch(e){}});const p=await c.newPage();p.on('pageerror',e=>logs.push('ERR '+e.message));
await p.goto('file://'+HTML);await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(2500);
const snap=()=>p.evaluate(()=>{const keys=[];let trees=0;for(let n=DL.resBase|0;n<RES.length;n++){const q=RES[n];if(/^(pine|oak|birch|dead|savannaTree|pineY|birchY|pineG|oakG|young)$/.test(q.t))trees++;keys.push(q.t+'@'+Math.round(q.x+DL.ox)+','+Math.round(q.z+DL.oz));}
  /* sinh cảnh tại các điểm lưới cố định của đại lục (bỏ 'water' vì lòng suối là riêng của từng tỉnh) */const bio={};for(let gx=Math.ceil((DL.ox-7000)/400)*400;gx<DL.ox+7000;gx+=400)for(let gz=Math.ceil((DL.oz-7000)/400)*400;gz<DL.oz+7000;gz+=400){const x=gx-DL.ox,z=gz-DL.oz;if(wdAt(x,z)>0)continue;bio[gx+','+gz]=biome(x,z);}
  const riv=[];for(const r of RIV)for(const q of r.pts)riv.push('s@'+Math.round(q[0]+DL.ox)+','+Math.round(q[1]+DL.oz));
  /* nhiễu màu đất tại vài điểm cố định của đại lục: phải như nhau ở mọi tỉnh */const mau=[[20000,-10000],[1234,5678],[-31000,22000]].map(q=>+NS.fbm(q[0]/140+3,q[1]/140-8,2).toFixed(5)).join(',');
  return {mau,tg:[TGX,TGZ],riv,rivN:RIV.length,n:RES.length,base:DL.resBase|0,ms:DL.resMs,trees,ox:DL.ox,oz:DL.oz,sp:[SPAWN[0]+DL.ox,SPAWN[1]+DL.oz],W:WSIZE,keys,bio,land:S.land};});
const a=await snap();
// chặt một cây nằm bên kia ranh giới (thuộc tỉnh phía đông): sang tỉnh đó nó vẫn phải là gốc cây
const cut=await p.evaluate(()=>{let best=null,bd=1e9;for(let n=DL.resBase|0;n<RES.length;n++){const q=RES[n];if(!/^(pine|oak|birch)$/.test(q.t)||q.st!==0)continue;const d=Math.hypot(q.x-4700,q.z);if(d<bd){bd=d;best=q;}}if(!best)return null;resDeplete(best);return {k:Math.round(best.x+DL.ox)+','+Math.round(best.z+DL.oz),t:best.t,d:Math.round(bd)};});
await p.evaluate(()=>{const A=DL.TS*6;P.x=A/2+1200;P.z=0;P.y=hAt(P.x,P.z);DL.noIn=0;dlShift();});await p.waitForFunction(o=>typeof DL==='object'&&!DL.busy&&S.dl&&S.dl.ox!==o&&G.on&&G.animals&&G.animals.length,a.ox,{timeout:240000});await p.waitForTimeout(2500);
const d=await snap();
const cut2=cut?await p.evaluate(k=>{for(let n=DL.resBase|0;n<RES.length;n++){const q=RES[n];if(Math.round(q.x+DL.ox)+','+Math.round(q.z+DL.oz)===k)return {st:q.st,t:q.t,saved:!!S.res[q.i]};}return null;},cut.k):null;
// vùng chung: nằm trong cả hai cửa sổ, bỏ dải ô ngoài cùng (ô lưới chỉ rải khi nằm trọn trong cửa sổ) và quanh hai chỗ bắt đầu (bãi trống riêng của từng tỉnh)
const H=a.W/2-40-700,both=k=>{const [x,z]=k.split('@')[1].split(',').map(Number);if(Math.abs(x-a.ox)>H||Math.abs(z-a.oz)>H||Math.abs(x-d.ox)>H||Math.abs(z-d.oz)>H)return false;for(const s of [a.sp,d.sp])if(Math.hypot(x-s[0],z-s[1])<420)return false;return true;};
const A=new Set(a.keys.filter(both)),B=new Set(d.keys.filter(both));let same=0;for(const k of A)if(B.has(k))same++;const uni=A.size+B.size-same,ratio=uni?same/uni:0;
/* suối: các điểm của lòng suối trong vùng chung phải trùng nhau */const RA=new Set(a.riv.filter(both)),RB=new Set(d.riv.filter(both));let rs=0;for(const k of RA)if(RB.has(k))rs++;const ru=RA.size+RB.size-rs;
let bs=0,bn=0;for(const k in a.bio)if(k in d.bio){bn++;if(a.bio[k]===d.bio[k])bs++;}
const r={landA:a.land,landB:d.land,resA:a.n,resB:d.n,trees:a.trees,ms:a.ms,chung:same,chiA:A.size-same,chiB:B.size-same,ratio:+ratio.toFixed(4),bioN:bn,bioSame:bs,suoiA:a.rivN,suoiB:d.rivN,suoiChung:rs,suoiLech:ru-rs,mauKhop:a.mau===d.mau,tgDung:d.tg[0]===d.ox&&d.tg[1]===d.oz,chat:cut,chatSau:cut2};console.log(JSON.stringify(r));if(logs.length)console.log(logs.slice(0,4).join('\n'));
const ok=a.land!==d.land&&same>1500&&ratio>=0.97&&bn>200&&bs/bn>=0.99&&(ru===0||rs/ru>=0.9)&&a.mau===d.mau&&d.tg[0]===d.ox&&d.tg[1]===d.oz&&cut&&cut2&&cut2.st===1&&cut2.saved&&a.trees>800&&a.trees<9000&&a.n>6000&&a.ms<3000&&!logs.length;
console.log(ok?'DLK-DAT':'DLK-HONG');await b.close();})();
