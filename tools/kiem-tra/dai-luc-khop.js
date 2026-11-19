// Đại lục: cây đá và sinh cảnh phải GIỐNG NHAU dù đứng ở tỉnh nào. Tạo nhân vật, ghi lại cây đá + sinh cảnh theo toạ độ đại lục, sang tỉnh phía đông, ghi lại, so vùng chung.
// Chạy: node dai-luc-khop.js [html]
const {chromium}=require('playwright');const HTML=process.argv[2]||require('path').resolve(__dirname,'../../index.html');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:400,height:240}});const logs=[];
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-f');localStorage.setItem('ldtt-nohd','1');localStorage.setItem('ld-dl','1')}catch(e){}});const p=await c.newPage();p.on('pageerror',e=>logs.push('ERR '+e.message));
await p.goto('file://'+HTML);await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(2500);
const snap=()=>p.evaluate(()=>{const keys=[];let trees=0;for(let n=DL.resBase|0;n<RES.length;n++){const q=RES[n];if(/^(pine|oak|birch|dead|savannaTree|pineY|birchY|pineG|oakG|young)$/.test(q.t))trees++;keys.push(q.t+'@'+Math.round(q.x+DL.ox)+','+Math.round(q.z+DL.oz));}
  /* sinh cảnh tại các điểm lưới cố định của đại lục (bỏ 'water' vì lòng suối là riêng của từng tỉnh) */const bio={};for(let gx=Math.ceil((DL.ox-7000)/400)*400;gx<DL.ox+7000;gx+=400)for(let gz=Math.ceil((DL.oz-7000)/400)*400;gz<DL.oz+7000;gz+=400){const x=gx-DL.ox,z=gz-DL.oz;if(wdAt(x,z)>0)continue;bio[gx+','+gz]=biome(x,z);}
  return {n:RES.length,base:DL.resBase|0,ms:DL.resMs,trees,ox:DL.ox,oz:DL.oz,sp:[SPAWN[0]+DL.ox,SPAWN[1]+DL.oz],W:WSIZE,keys,bio,land:S.land};});
const a=await snap();
await p.evaluate(()=>{const A=DL.TS*6;P.x=A/2+1200;P.z=0;P.y=hAt(P.x,P.z);DL.noIn=0;dlShift();});await p.waitForFunction(o=>typeof DL==='object'&&!DL.busy&&S.dl&&S.dl.ox!==o&&G.on&&G.animals&&G.animals.length,a.ox,{timeout:240000});await p.waitForTimeout(2500);
const d=await snap();
// vùng chung: nằm trong cả hai cửa sổ, bỏ dải ô ngoài cùng (ô lưới chỉ rải khi nằm trọn trong cửa sổ) và quanh hai chỗ bắt đầu (bãi trống riêng của từng tỉnh)
const H=a.W/2-40-700,both=k=>{const [x,z]=k.split('@')[1].split(',').map(Number);if(Math.abs(x-a.ox)>H||Math.abs(z-a.oz)>H||Math.abs(x-d.ox)>H||Math.abs(z-d.oz)>H)return false;for(const s of [a.sp,d.sp])if(Math.hypot(x-s[0],z-s[1])<420)return false;return true;};
const A=new Set(a.keys.filter(both)),B=new Set(d.keys.filter(both));let same=0;for(const k of A)if(B.has(k))same++;const uni=A.size+B.size-same,ratio=uni?same/uni:0;
let bs=0,bn=0;for(const k in a.bio)if(k in d.bio){bn++;if(a.bio[k]===d.bio[k])bs++;}
const r={landA:a.land,landB:d.land,resA:a.n,resB:d.n,trees:a.trees,ms:a.ms,chung:same,chiA:A.size-same,chiB:B.size-same,ratio:+ratio.toFixed(4),bioN:bn,bioSame:bs};console.log(JSON.stringify(r));if(logs.length)console.log(logs.slice(0,4).join('\n'));
const ok=a.land!==d.land&&same>1500&&ratio>=0.97&&bn>200&&bs/bn>=0.99&&a.trees>800&&a.trees<9000&&a.n>6000&&a.ms<3000&&!logs.length;
console.log(ok?'DLK-DAT':'DLK-HONG');await b.close();})();
