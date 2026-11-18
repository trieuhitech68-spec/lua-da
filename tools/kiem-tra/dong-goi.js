// Đóng gói bản lưu: kết quả của ldPack phải GIỐNG HỆT cách cũ (JSON.stringify + lọc "_") trên một làng có người, vật nuôi, lính, ngựa; và nhanh (dưới 60 ms), đọc lại ra đúng dữ liệu.
const {chromium}=require('playwright');const HTML=process.argv[2]||require('path').resolve(__dirname,'../../index.html');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:400,height:260}});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-f');localStorage.setItem('ldtt-nohd','1');localStorage.setItem('ld-dl','0')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));
await p.goto('file://'+HTML);await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{const o={};const jobs=['wood','stone','gather','cook','guard','build','herd','hunt','fish','farm','craft','gate','soldier','soldier','soldier','soldier','idle','wood'];S.folk=jobs.map((job,i)=>({n:'F'+i,role:'hunter',seed:800+i,sex:'m',job,x:P.x+20+i*4,z:P.z+20,fed:TNOW(),lv:1+i%3}));
  S.pets=[];['chicken','pig','goat','duck','rabbit','dog'].forEach((k,i)=>{S.pets.push({id:500+i,k,x:P.x+40+i*6,z:P.z-40,born:TNOW()-9,fed:TNOW()});});petsInit();S.mounts=[{id:1,k:'horse',n:'N',x:P.x+30,z:P.z,ry:0,land:typeof mtLand==='function'?mtLand():0}];mtShow(S.mounts[0]);S.mounts[0].sol=qdUid(S.folk[12]);
  for(let i=0;i<120;i++){G.t+=1/60;folkTick(1/60);petsTick(1/60);}S.test={a:[1,null,undefined,'x"y\\n',{b:NaN,c:Infinity,_d:1,e:true}],u:undefined,f:()=>1,_g:2,s:'tiếng Việt 🐘'};
  const rp=(k,v)=>k&&k[0]==='_'?undefined:v;let t=performance.now();const A=JSON.stringify(S,rp);o.oldMs=Math.round(performance.now()-t);t=performance.now();const B=ldPack(S);o.newMs=Math.round(performance.now()-t);o.same=A===B;o.len=B.length;if(!o.same){let i=0;while(i<A.length&&A[i]===B[i])i++;o.diff=A.slice(Math.max(0,i-40),i+40)+' ≠ '+B.slice(Math.max(0,i-40),i+40);}
  try{const back=JSON.parse(B);o.back=back.folk.length===S.folk.length&&back.pets.length===6&&!('_o' in back.folk[0])&&back.test.s===S.test.s;}catch(e){o.back=String(e);}delete S.test;
  // lưu thật: gọi lưu ngay, đọc lại
  saveNow();const raw=localStorage.getItem(SKEY);o.saved=!!raw&&JSON.parse(raw).folk.length===S.folk.length;t=performance.now();lth2Lean();o.leanMs=Math.round(performance.now()-t);return o;});
console.log(JSON.stringify(r));console.log(r.same&&r.back===true&&r.saved&&r.newMs<60&&r.leanMs<120&&!logs.length?'DG-DAT':'DG-HONG '+logs.join('|'));await b.close();})();
