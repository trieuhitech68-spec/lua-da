// Lớp nghe máy chủ (backend.js): gom thay đổi, giải mã một lần, báo đúng thay đổi. Đo luôn chi phí khi đông người.
const {chromium}=require('playwright');const path=require('path');const html=process.argv[2]||path.resolve(__dirname,'../../index.html');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message));
await p.goto('file://'+html);await p.waitForTimeout(3000);
const r=await p.evaluate(async()=>{const o={};const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const mk=()=>{const L={kind:'q',coll:'tst',w:[],ord:null,lim:500,calls:[],map:new Map(),ready:true};L.next=s=>{let n=0;for(const d of s.docs){for(let k=0;k<5;k++){const v=d.data();if(v&&v.L)n++;}}L.calls.push({size:s.size,ch:s.docChanges().map(c=>c.type+':'+c.doc.id),snap:s});};LDB.ls.add(L);return L;};
  const doc=i=>({w:777,c:'c'+(i%20),L:{nuido:[i%20,120.5,1794540301787,1],muoi:[3,44.2,1794540301787,0],dalua:[1,2,1794540301787,0]},R:{u1:{at:1794540301787,ids:[1,2,3,4,5,6,7,8,9,10,11,12]}},W:{c1:12,c2:3},n:i});
  const L=mk();for(let i=0;i<400;i++)ldbLocalRemote('tst/u'+i,doc(i));await wait(1700);
  o.first=L.calls[0]&&L.calls[0].size;o.afterFill=L.calls.length;const last=L.calls[L.calls.length-1];o.fillSize=last.size;
  // 1) dồn dập 60 thay đổi trong 1 giây → báo ít lần, lần cuối đủ dữ liệu
  const n0=L.calls.length,t0=performance.now();let busy=0;for(let k=0;k<60;k++){const t=performance.now();ldbLocalRemote('tst/u'+(k%400),Object.assign(doc(k%400),{n:1000+k}));busy+=performance.now()-t;await wait(15);}
  await wait(1800);o.burstCalls=L.calls.length-n0;o.burstMs=+busy.toFixed(1);o.burstPerEvent=+(busy/60).toFixed(2);
  const fin=L.calls[L.calls.length-1];o.finalHas=fin.snap.docs.find(d=>d.id==='u59').data().n===1059;
  // 2) bản ghi không đổi: cùng một đối tượng đã giải mã (không giải mã lại)
  const a=fin.snap.docs.find(d=>d.id==='u300').data();ldbLocalRemote('tst/u1',Object.assign(doc(1),{n:5}));await wait(1700);const fin2=L.calls[L.calls.length-1];o.cached=fin2.snap.docs.find(d=>d.id==='u300').data()===a;o.chg=fin2.ch.join(',');
  // 3) ghi lại y nguyên: không báo
  const n1=L.calls.length;ldbLocalRemote('tst/u1',Object.assign(doc(1),{n:5}));await wait(1700);o.sameNoCall=L.calls.length===n1;
  // 4) xoá
  ldbLocalRemote('tst/u2',null);await wait(1700);const f3=L.calls[L.calls.length-1];o.removed=f3.ch.includes('removed:u2')&&f3.size===399;
  LDB.ls.delete(L);return o;});
console.log(JSON.stringify(r));
const ok=r.first>=1&&r.fillSize===400&&r.burstCalls>=1&&r.burstCalls<=3&&r.finalHas&&r.cached&&r.chg==='modified:u1'&&r.sameNoCall&&r.removed&&r.burstPerEvent<2&&!logs.length;
console.log(ok?'MC-DAT':'MC-HONG '+logs.join('|'));await b.close();})();
