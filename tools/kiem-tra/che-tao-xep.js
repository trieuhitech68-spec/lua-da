// Bảng Chế tạo xếp gọn: mục "Làm được ngay" + mỗi nhóm một mục gập, không mất công thức nào, bấm lọc / gõ tìm thì về danh sách phẳng, nút Làm trong mục vẫn chạy, không tràn ngang trên điện thoại.
const {chromium}=require('playwright');const HTML=process.argv[2]||require('path').resolve(__dirname,'../../index.html');const SHOT=process.argv[3];
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:390,height:800},deviceScaleFactor:SHOT?2:1,isMobile:true,hasTouch:true});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-f');localStorage.setItem('ldtt-nohd','1');localStorage.setItem('ld-dl','0')}catch(e){}});const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));p.on('console',m=>{if(m.type()==='warning'&&/xếp chế tạo/.test(m.text()))logs.push(m.text())});
await p.goto('file://'+HTML);await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(3000);
const r1=await p.evaluate(()=>{for(const r of RECIPES)S.known['r:'+r.id]=1;for(let i=0;i<S.inv.length;i++)S.inv[i]=null;S.inv[6]={id:'fiber',n:20};S.inv[7]={id:'stick',n:20};S.inv[8]={id:'stone',n:20};uiOpen('craft',{});return 1;});
await p.waitForTimeout(900);
const r=await p.evaluate(()=>{const o={};const body=document.querySelector('#panel .p-body');o.wrap=!!body.querySelector('.sx-wrap');o.secs=[...body.querySelectorAll('.sx-sec')].map(d=>d.dataset.k+':'+d.querySelectorAll('.rc').length+(d.open?'*':'')).join(',');o.total=body.querySelectorAll('.rc[data-mxr]').length;o.nowDim=body.querySelectorAll('.sx-now .rc.dim').length;o.nowN=body.querySelectorAll('.sx-now .rc').length;o.H=body.scrollHeight;o.ovX=body.scrollWidth>body.clientWidth+2;
  // nút Làm trong mục "Làm được ngay"
  const rope0=invCount('rope');const card=[...body.querySelectorAll('.sx-now .rc')].find(c=>c.dataset.mxr==='rope')||body.querySelector('.sx-now .rc');o.first=card&&card.dataset.mxr;const btn=card&&card.querySelector('[data-a="craft"]');o.btn=!!btn;if(btn)btn.click();o.work=!!G.work||invCount('rope')>rope0||G.panel!=='bag';return o;});
await p.waitForTimeout(600);
const r2=await p.evaluate(async()=>{const o={};const W=ms=>new Promise(r=>setTimeout(r,ms));try{if(G.work)workStop('');}catch(e){}if(G.panel!=='bag'||G.ptab!=='craft')uiOpen('craft',{});await W(700);let body=document.querySelector('#panel .p-body');o.again=!!body.querySelector('.sx-wrap');
  // mở một nhóm, sang thẻ Túi rồi quay lại: game nhớ nhóm đang mở
  body.querySelector('.sx-sec[data-k="cu"]').open=true;await W(300);document.querySelector('#panel [data-a="tab"][data-t="bag"]').click();await W(600);document.querySelector('#panel [data-a="tab"][data-t="craft"]').click();await W(800);body=document.querySelector('#panel .p-body');const dd=body.querySelector('.sx-sec[data-k="cu"]');o.remember=!!dd&&dd.open;
  // lọc theo nhóm → danh sách phẳng
  body.querySelector('[data-a="c5f"][data-k="vk"]').click();await new Promise(r=>setTimeout(r,900));body=document.querySelector('#panel .p-body');o.flat=!body.querySelector('.sx-wrap');o.flatVis=[...body.querySelectorAll('.rc[data-mxr]')].filter(c=>c.offsetParent).length;o.flatTot=body.querySelectorAll('.rc[data-mxr]').length;
  body.querySelector('[data-a="c5f"][data-k="all"]').click();await new Promise(r=>setTimeout(r,900));body=document.querySelector('#panel .p-body');o.back=!!body.querySelector('.sx-wrap');
  // gõ tìm → phẳng
  const q=body.querySelector('#mxq');q.value='riu';q.dispatchEvent(new Event('input',{bubbles:true}));await new Promise(r=>setTimeout(r,900));body=document.querySelector('#panel .p-body');o.searchFlat=!body.querySelector('.sx-wrap');o.searchVis=[...body.querySelectorAll('.rc[data-mxr]')].filter(c=>c.offsetParent).length;return o;});
console.log(JSON.stringify(Object.assign(r,r2)));if(SHOT){await p.evaluate(()=>{const q=document.querySelector('#mxq');q.value='';q.dispatchEvent(new Event('input',{bubbles:true}));G.sxO={now:1};document.querySelector('#panel [data-a="tab"][data-t="craft"]').click();});await p.waitForTimeout(1500);await p.screenshot({path:SHOT});}
const ok=r.wrap&&r.total>=150&&r.nowDim===0&&r.nowN>=1&&r.H<5000&&!r.ovX&&r.btn&&r.work&&r.again&&r.remember&&r.flat&&r.flatVis>=5&&r.flatVis<r.flatTot&&r.back&&r.searchFlat&&r.searchVis>=1&&!logs.length;
console.log(ok?'CTX-DAT':'CTX-HONG '+logs.join('|'));await b.close();})();
