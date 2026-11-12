// Rà giao diện điện thoại (393×852): không lỗi chạy khi mở từng bảng; các khối trên màn hình chơi không đè nhau, không tràn ra ngoài.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const c=await b.newContext({viewport:{width:393,height:852},deviceScaleFactor:1,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36'});
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-b');localStorage.setItem('ldtt-nohd','1')}catch(e){}});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,160)));
await p.goto('file://'+require('path').resolve(__dirname,'../../index.html'));await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(6000);
const bad=[];
const hud=await p.evaluate(()=>{try{give({stick:3,fiber:2,stone:2});gmPin('c','axe');gmPin('b','leanto');}catch(e){}return new Promise(res=>setTimeout(()=>{const ids=['#hud','#goal','#mini','#pinw','#menu','#hot','.acts'],R=[];for(const s of ids){const e=document.querySelector(s);if(!e||e.hidden)continue;const r=e.getBoundingClientRect();if(r.width<2)continue;R.push([s,r.left,r.top,r.right,r.bottom]);}
  const out=[];for(const r of R){if(r[1]<-1||r[2]<-1||r[3]>innerWidth+1||r[4]>innerHeight+1)out.push('tràn màn hình: '+r[0]);}
  for(let i=0;i<R.length;i++)for(let j=i+1;j<R.length;j++){const a=R[i],b=R[j],w=Math.min(a[3],b[3])-Math.max(a[1],b[1]),h=Math.min(a[4],b[4])-Math.max(a[2],b[2]);if(w>6&&h>6)out.push('đè nhau: '+a[0]+' và '+b[0]+' ('+Math.round(w)+'×'+Math.round(h)+')');}return res(out);},1500));});
bad.push(...hud);
for(const [n,f] of [['Túi',()=>document.querySelector('#menu [data-ui="bag"]').click()],['Chế tạo',()=>document.querySelector('#menu [data-ui="craft"]').click()],['Xây',()=>document.querySelector('#menu [data-ui="build"]').click()],['Nhân vật',()=>document.querySelector('#menu [data-ui="l4"]').click()],['Nghiên cứu',()=>ncOpen()],['Nhiệm vụ',()=>uiOpen('nv',{})],['Bản đồ',()=>uiOpen('map',{})]]){
  const e0=errs.length;const r=await p.evaluate(f=>{try{if(G.panel)uiClose();if(typeof H4==='object'&&H4.on)h4Close();const w=document.getElementById('ncw');if(w)w.hidden=true;}catch(e){}try{(0,eval)('('+f+')')();}catch(e){return 'LỖI '+String(e).slice(0,140)}return new Promise(res=>setTimeout(()=>{const pn=document.querySelector('#panel:not([hidden]),#h4:not([hidden]),#ncw:not([hidden])')||(typeof H4==='object'&&H4.on);let wide=0;document.querySelectorAll('#panel:not([hidden]) *').forEach(e=>{const r=e.getBoundingClientRect();if(r.width>2&&r.right>innerWidth+8&&getComputedStyle(e).position!=='fixed'&&!e.closest('.chipsel,.tabs,.c5f,[style*="overflow"]'))wide++;});res((pn?'':'không mở được')+(wide>3?' có '+wide+' phần tử tràn ngang':''));},1600));},String(f));
  if(r)bad.push(n+': '+r);if(errs.length>e0)bad.push(n+': lỗi chạy '+errs.slice(e0).join(' | '));}
if(errs.length&&!bad.some(x=>/lỗi chạy/.test(x)))bad.push('lỗi chạy: '+errs.slice(0,3).join(' | '));
console.log(bad.length?'GD-HONG\n'+bad.join('\n'):'GD-DAT');await b.close();})();
