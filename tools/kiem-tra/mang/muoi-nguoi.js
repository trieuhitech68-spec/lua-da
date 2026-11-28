// GIẢ LẬP 10 NGƯỜI CHƠI CÙNG MỘT THẾ GIỚI (máy chủ giả dùng chung, mọi lần ghi được chuyền sang 9 trình duyệt còn lại).
// Đi hết các giai đoạn: vào game → sinh tồn đầu game (Tự làm tua nhanh) → phát triển (lãnh thổ, nhà, dân, nghiên cứu) → liên minh (lập, xin vào, nhận, từ chối, rời, góp cấp)
// → quân đội (trại lính, chiêu mộ, phong tướng, đội hình) → xâm chiếm (tuyên chiến, cướp phá, công phá điểm giàu, hạ cờ) → lưu và mở lại.
// Chạy: node mang/muoi-nguoi.js [số người=10] [giây Tự làm=40]   → in MN-DAT hoặc MN-HONG, ghi báo cáo chi tiết ra $TMPDIR/ld-muoi-nguoi.json
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const N=Math.max(2,Math.min(20,+process.argv[2]||10)),AUTOS=+process.argv[3]||40,ROOT=path.resolve(__dirname,'../../..');let HTML='';
/* chạy qua máy chủ web như bản thật (mở thẳng tệp thì trình duyệt lưu bản ghi nền khác, dễ báo nhầm mất tiến trình khi mở lại) */
const SRV=require('http').createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}const ty={'.html':'text/html; charset=utf-8','.js':'text/javascript','.png':'image/png','.json':'application/json','.webmanifest':'application/manifest+json'}[path.extname(f)]||'application/octet-stream';r.writeHead(200,{'Content-Type':ty});fs.createReadStream(f).pipe(r);});
const MOCK=fs.readFileSync(path.join(__dirname,'mock-chung.js'),'utf8');
const NG=[['p01','An','A',1],['p02','Bình','A'],['p03','Chi','A'],['p04','Dũng','A'],['p05','Én','B',1],['p06','Phong','B'],['p07','Giang','B'],['p08','Hà','A-tuchoi'],['p09','Khoa','solo'],['p10','Lan','B-roi'],['p11','Mai','C',1],['p12','Nam','C'],['p13','Oanh','C'],['p14','Phúc','C'],['p15','Quân','solo'],['p16','Rạng','A'],['p17','Sơn','B'],['p18','Tú','C-duoi'],['p19','Uyên','C-tuchoi'],['p20','Vy','solo']].map(([uid,name,team,lead],i)=>({i,uid,name,team,lead:!!lead}))
  .filter((n,i)=>process.env.SUB?process.env.SUB.split(',').includes(String(i)):i<N);
/* chạy theo đợt (máy thử chỉ chịu ~10 trình duyệt cùng lúc): phe nào trong đợt không có thủ lĩnh thì người đầu tiên của phe làm thủ lĩnh */
for(const T of ['A','B','C'])if(!NG.some(n=>n.team===T&&n.lead)){const f=NG.find(n=>n.team===T);if(f)f.lead=true;}
const NAMES=Object.fromEntries(NG.map(n=>[n.uid,n.name]));
const DB=new Map();const now=Date.now();DB.set('world/main',{seed:12345,wv:3});
/* DBIN: nạp dữ liệu máy chủ của đợt trước (người đợt trước đang vắng mặt nhưng nhà, lãnh thổ, liên minh vẫn còn) · DBOUT: ghi lại cho đợt sau */
if(process.env.DBIN&&fs.existsSync(process.env.DBIN))for(const [k,v] of JSON.parse(fs.readFileSync(process.env.DBIN,'utf8')))DB.set(k,v);
const R=[];const rec=(who,phase,step,ok,detail)=>{R.push({who,phase,step,ok:!!ok,detail});console.log((ok?'  ĐẠT ':'  HỎNG')+' ['+who+'] '+phase+' › '+step+(detail!==undefined&&!ok?' :: '+JSON.stringify(detail).slice(0,400):''));};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const T0=Date.now();await new Promise(r=>SRV.listen(0,'127.0.0.1',r));HTML='http://127.0.0.1:'+SRV.address().port+'/index.html';
  const br=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows']});
  // chuyền dữ liệu: gom theo trang, 250 ms đẩy một lần
  const Q=new Map();const flush=async()=>{for(const [pl,list] of Q){if(!list.length||!pl.page||pl.reloading)continue;const L=list.splice(0);try{await pl.page.evaluate(L=>window.__recv&&window.__recv(L),L);}catch(e){}}};const fl=setInterval(flush,250);
  const relay=(src,p,v)=>{if(v==null)DB.delete(p);else DB.set(p,v);for(const o of NG)if(o!==src&&o.page){if(!Q.has(o))Q.set(o,[]);Q.get(o).push([p,v]);}};
  for(const pl of NG){pl.logs=[];pl.ctx=await br.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    await pl.ctx.exposeBinding('__relay',(s,p,v)=>relay(pl,p,v));
    await pl.ctx.addInitScript(o=>{window.__ME=o.me;window.__NAMES=o.names;},{me:{uid:pl.uid,name:pl.name},names:NAMES});await pl.ctx.addInitScript(MOCK);}
  const snapScript=pl=>pl.ctx.addInitScript(s=>{window.__SNAP=s;},[...DB.entries()]);
  const ev=async(pl,f,arg)=>{try{return await pl.page.evaluate(f,arg);}catch(e){return {__err:e.message.slice(0,500)};}};
  const click=async(pl,t)=>{await ev(pl,t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));if(b)b.click();return !!b;},t);await sleep(1200);};
  const nhip=async(pl)=>ev(pl,()=>{/* bỏ vẽ hình (máy thử không có card đồ hoạ), tự chạy vòng lặp game theo đồng hồ thật để mọi phần chơi mạng vẫn chạy */
    if(window.__nh)return 1;window.__nh=1;G.R.render=()=>{};if(K3.fx)K3.fx.render=()=>{};window.requestAnimationFrame=()=>0;window.__TT=performance.now()+1e6;window.__ff=0;window.__LE=[];
    setInterval(()=>{const t0=performance.now();do{window.__TT+=window.__ff?50:100;try{loop(window.__TT);}catch(e){if(__LE.length<20)__LE.push(e.message+' '+(e.stack||'').split('\n')[1]);break;}}while(window.__ff&&performance.now()-t0<45);
      if(G.paused&&!(typeof H4==='object'&&H4.on)){const ob=document.querySelector('#overlay button');if(ob)ob.click();G.paused=false;}},100);return 1;});
  const helpers=pl=>ev(pl,()=>{window.SIM={n:20000+Math.floor(Math.random()*1000)*50,
    mk(k,x,z,ht){const b={id:SIM.n++,k,x,y:hAt(x,z),z,r:0,lv:0};if(ht){b.ht=ht;b.hg=1;}S.builds.push(b);structAdd(b,true);return b;},
    flat(a0,r0,homes){const ox=SIM.o0?SIM.o0[0]:P.x,oz=SIM.o0?SIM.o0[1]:P.z;for(let r=r0;r<r0+3000;r+=80)for(let k=0;k<16;k++){const a=a0+k*0.39;const x=Math.round((ox+Math.cos(a)*r)/CELL)*CELL,z=Math.round((oz+Math.sin(a)*r)/CELL)*CELL;if((homes||[]).some(h=>Math.hypot(h[0]-x,h[1]-z)<1300))continue;if(Math.abs(x)>WSIZE/2-600||Math.abs(z)>WSIZE/2-600)continue;let mn=1e9,mx=-1e9,wet=0;
      for(let i=-4;i<=5;i++)for(let j=-4;j<=5;j++){const h=hAt(x+i*CELL,z+j*CELL);mn=Math.min(mn,h);mx=Math.max(mx,h);if(wdAt(x+i*CELL,z+j*CELL)>0)wet=1;}if(mx-mn<16&&!wet)return [x,z];}return [Math.round(P.x),Math.round(P.z)];},
    go(x,z){P.x=x;P.z=z;P.y=groundY(x,z);G.work=null;G.act=null;G.sit=false;},
    track(x,z,ms){return new Promise(res=>{const o=[];let k=0;SIM.go(x,z);const h=setInterval(()=>{o.push([Math.round(P.x-x),Math.round(P.z-z),G.foes.filter(f=>f.pvp).length,Math.round(S.p.hp),G.walkTo?'walk':'',AQ.on?'aq':'',G.act?String(G.act.type||G.act.k||'act'):'',(typeof M3==='object'&&M3.st)||'',Math.round(P.speed||0),G.mnt!=null?'mnt':'',G.joy&&G.joy.on?'joy':'',G.follow?'fol':'',Object.keys(G.keys||{}).filter(k=>G.keys[k]).join('')]);if(++k>=ms/250){clearInterval(h);res(o);}},250);});},
    toasts:[],o0:window.__O0||null};const _u=uiToast;uiToast=function(m,c){SIM.toasts.push(String(m).replace(/<[^>]+>/g,'').slice(0,140));if(SIM.toasts.length>200)SIM.toasts.shift();return _u.apply(this,arguments);};return 1;});
  const giai=(t)=>console.log('\n=== '+t+' ('+Math.round((Date.now()-T0)/1000)+' giây) ===');

  // ───────────── GIAI ĐOẠN 1: VÀO GAME ─────────────
  giai('1. Vào game: tạo nhân vật, nối máy chủ chung');
  const vao=async pl=>{await snapScript(pl);pl.page=await pl.ctx.newPage();pl.page.on('pageerror',e=>pl.logs.push('ERR '+e.message+' | '+(e.stack||'').split('\n').slice(1,3).join(' ').slice(0,300)));
    pl.page.on('console',m=>{if(m.type()==='error'&&!/WebGL|GPU|favicon|net::|Failed to load resource/.test(m.text()))pl.logs.push('CE '+m.text().slice(0,250));});
    await pl.page.goto(HTML);await sleep(5000);await click(pl,'Tạo nhân vật mới');await sleep(1500);
    await ev(pl,n=>{const i=[...document.querySelectorAll('input')].find(i=>i.offsetParent&&(i.type==='text'||!i.type)&&!/mpCn/.test(i.id));if(i){i.value=n;i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}));}},pl.name);
    await click(pl,'Bắt đầu');
    try{await pl.page.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:300000});}catch(e){rec(pl.name,'Vào game','vào được thế giới',false,'quá 5 phút chưa vào được');return;}
    await sleep(2500);await nhip(pl);await helpers(pl);
    for(let k=0;k<30;k++){const s=await ev(pl,()=>typeof mpOn==='function'&&mpOn());if(s===true)break;await sleep(1000);}
    const r=await ev(pl,()=>({mp:mpOn(),uid:MP.uid,seed:seed0(),srv:S.srv,me:!!MP.me,hp:S.p.hp|0,food:S.p.food|0,name:S.name||S.p.name||'',goal:S.goal,inv:S.inv.filter(Boolean).length}));pl.r1=r;
    rec(pl.name,'Vào game','vào thế giới, bật chơi chung',r.mp===true&&r.uid===pl.uid,r);
    rec(pl.name,'Vào game','đúng máy chủ 1 (hạt giống 12345)',r.seed===12345,r.seed);};
  // khởi động thành từng đợt 3 người để máy thử không quá tải
  for(let i=0;i<NG.length;i+=3)await Promise.all(NG.slice(i,i+3).map(vao));
  await sleep(4000);
  for(const pl of NG){const d=DB.get('players/'+pl.uid);rec(pl.name,'Vào game','hồ sơ người chơi lên máy chủ chung',!!d&&d.w===12345,d&&{w:d.w,hl:d.hl});}
  {const pl=NG[0];const seen=await ev(pl,ids=>ids.filter(u=>MP.players[u]).length,NG.map(n=>n.uid).filter(u=>u!==pl.uid));rec(pl.name,'Vào game','thấy hồ sơ của '+(NG.length-1)+' người kia',seen===NG.length-1,seen);}

  // ───────────── GIAI ĐOẠN 2: SINH TỒN ĐẦU GAME (Tự làm tua nhanh) ─────────────
  giai('2. Đầu game: nhặt, chế rìu, nhóm lửa, dựng lều… bằng Tự làm, tua nhanh '+AUTOS+' giây');
  const tulam=async pl=>{const g0=await ev(pl,()=>S.goal);await ev(pl,()=>{window.__ff=1;aqStart(S.goal);});const t=Date.now();
    while(Date.now()-t<AUTOS*1000){await sleep(5000);await ev(pl,()=>{if(!AQ.on&&!G.sleeping&&S.goal<GOALS.length)aqStart(S.goal);});}
    const r=await ev(pl,()=>{window.__ff=0;/* tắt như người chơi bấm nút Dừng (game nhớ là người chơi tự tắt, không tự bật lại) */try{aqStop('🤖 Đã dừng tự làm.','');}catch(e){}return {goal:S.goal,gt:GOALS[S.goal]&&GOALS[S.goal].t,hp:S.p.hp|0,food:S.p.food|0,water:S.p.water|0,day:S.day,builds:S.builds.map(b=>b.k).join(' '),le:__LE.slice(0,3),inv:S.inv.filter(Boolean).map(s=>s.id+s.n).join(' ').slice(0,200)};});pl.r2=r;
    rec(pl.name,'Đầu game','Tự làm chạy không lỗi vòng lặp',r.le&&!r.le.length,r.le);
    rec(pl.name,'Đầu game','tiến được mục tiêu (từ '+g0+' lên '+r.goal+': '+r.gt+')',r.goal>=g0+2,r);
    rec(pl.name,'Đầu game','nhân vật còn sống, không cạn đói khát',r.hp>0&&r.food>2&&r.water>2,{hp:r.hp,food:r.food,water:r.water});};
  for(let i=0;i<NG.length;i+=5)await Promise.all(NG.slice(i,i+5).map(tulam));

  // ───────────── GIAI ĐOẠN 3: PHÁT TRIỂN ─────────────
  giai('3. Phát triển: chọn đất, cắm mốc lãnh thổ, dựng làng, nuôi dân, lên cấp, mở các bảng');
  const ptr=async pl=>{const r=await ev(pl,o=>{const out={};window.__O0=SIM.o0=o.o0;
      for(const a of G.animals)if(Math.hypot(a.x-P.x,a.z-P.z)<1500&&a.alive&&a.hostile)a.alive=false;if(G.foes)G.foes.length=0;
      const [x,z]=SIM.flat(o.i*0.628,2600,o.homes);SIM.go(x,z);SIM.home=[x,z];out.home=[x,z];
      for(const k of ['chop','gather','hunt','build','craft','mine','cook','farm','herb','fit'])addXp(k,2600);out.hl=heroLv();
      SIM.mk('campfire',x+40,z+40);SIM.mk('chest',x-40,z+40);SIM.mk('palisade',x+80,z);SIM.mk('wall',x-80,z);SIM.mk('roof',x,z+200,'qh_linh');for(let i=0;i<6;i++)SIM.mk('hammock',x+120+i*40,z+120);
      S.store=S.store||{};const ch=S.builds.find(b=>b.k==='chest'&&b.id>=20000);S.store[ch.id]=Array(30).fill(null);S.store[ch.id][0]={id:'wood',n:40};S.store[ch.id][1]={id:'stone',n:30};
      out.nb=S.builds.length;out.claimWhy=mpClaimWhy(P.x,P.z,mpClaimR(),'claim')||'';mpClaim(false);out.claim=!!MP.claims[MP.uid];
      S.folk=S.folk||[];for(let i=0;i<3;i++)S.folk.push({n:o.name+' dân '+i,job:['wood','stone','cook'][i]||'idle',seed:o.i*10+i+1,sex:i%2?'f':'m',x:x+20+i*12,z:z+60,fed:TNOW(),lv:2});
      // mở các bảng chính
      const bad=[];for(const k of ['bag','craft','build','map','journal','settings','nv','mp','folk','codex','clan','dan']){try{uiOpen(k,{});const b=document.querySelector('#panel .p-body');if(b&&b.scrollWidth>b.clientWidth+2)bad.push(k+': tràn ngang');uiClose();}catch(e){bad.push(k+': '+e.message);}}out.panels=bad;
      try{ptOpen();const el=document.getElementById('ptw');out.pt=!!(el&&!el.hidden);if(el)el.hidden=true;}catch(e){out.pt='lỗi '+e.message;}
      try{out.nc=typeof ncStart==='function';}catch(e){}
      return out;},{i:pl.i,name:pl.name,o0:NG[0].o0,homes:NG.filter(n=>n.home).map(n=>n.home).concat([...DB.entries()].filter(([k])=>/^claims\//.test(k)).map(([k,v])=>[v.x,v.z]))});pl.home=r.home;pl.r3=r;
    rec(pl.name,'Phát triển','lên cấp nhân vật ≥ '+5+' để chơi chung',r.hl>=5,r.hl);
    rec(pl.name,'Phát triển','cắm mốc lãnh thổ',r.claim===true,r.claimWhy);
    rec(pl.name,'Phát triển','mở đủ các bảng không lỗi, không tràn',r.panels&&!r.panels.length,r.panels);
    rec(pl.name,'Phát triển','bảng Phát triển mở được',r.pt===true,r.pt);};
  NG[0].o0=await ev(NG[0],()=>[Math.round(P.x),Math.round(P.z)]);
  for(const pl of NG)await ptr(pl);
  for(let k=0;k<30&&NG.some(n=>!DB.get('builds/'+n.uid));k++)await sleep(2000);
  for(const pl of NG){const c=DB.get('claims/'+pl.uid);rec(pl.name,'Phát triển','lãnh thổ lên máy chủ chung',!!c&&Math.abs(c.x-pl.home[0])<2,c&&[c.x,c.z,c.r]);const b=DB.get('builds/'+pl.uid);rec(pl.name,'Phát triển','công trình lên máy chủ chung',!!b&&typeof b.d==='string'&&b.d.length>10,b&&{n:b.n,len:(b.d||'').length});}
  {const a=NG[0],b=NG[1];const r=await ev(b,uid=>({claim:!!MP.claims[uid],why:mpLandWhy(MP.claims[uid]?MP.claims[uid].x:0,MP.claims[uid]?MP.claims[uid].z:0)}),a.uid);rec(b.name,'Phát triển','thấy lãnh thổ của '+a.name+', không xây lấn được',r.claim&&!!r.why,r);}

  // ───────────── GIAI ĐOẠN 3b: KINH TẾ ─────────────
  giai('3b. Kinh tế: chế tạo thật, xây theo từng công đoạn, nâng cấp công trình, nghiên cứu, bản đồ phóng sâu');
  const kinhte=async pl=>{const r=await ev(pl,o=>{const out={cr:[],crBad:[],bd:[],bdBad:[]};const [x,z]=SIM.home;SIM.go(x,z);const give=c=>{for(const k in c||{})if(ITEMS[k])invAdd(k,Math.ceil(c[k]));};
      for(let i=0;i<S.inv.length;i++)S.inv[i]=null;
      // chế tạo: 4 công thức khác nhau mỗi người (lệch theo số thứ tự), đủ nguyên liệu thì phải làm ra được
      const L=RECIPES.slice();let k=(o.i*11)%L.length,tried=0;
      while(out.cr.length+out.crBad.length<4&&tried<L.length){const r=L[(k+tried*7)%L.length];tried++;const outId=Object.keys(r.out||{})[0];if(!outId)continue;give(r.in);if(r.tool){const tid=ITEMS[r.tool]?r.tool:Object.keys(ITEMS).find(q=>ITEMS[q].tool===r.tool);if(tid&&invCount(tid)<1)invAdd(tid,1);}
        if(recipeBlock(r))continue;const c0=invCount(outId);try{craft(r,1);let n=0;while(G.work&&n++<900){S.p.stam=100;workTick(0.25);}if(G.work){G.work=null;out.crBad.push(r.id+': làm mãi không xong');}else if(invCount(outId)>c0)out.cr.push(r.id);else out.crBad.push(r.id+': không ra món');}catch(e){out.crBad.push(r.id+': '+e.message);G.work=null;}
        for(let i=0;i<S.inv.length;i++)S.inv[i]=null;}
      // xây theo công đoạn: 3 công trình khác nhau, đặt cách nhà, đánh từng nhát tới xong
      const BL=(typeof BUILD!=='undefined'&&Array.isArray(BUILD)?BUILD:[]).map(d=>pieceDef(d.id)).filter(d=>d&&d.kind!=='edge'&&d.kind!=='roof'&&d.kind!=='corner'&&!(d.fp&&(d.fp[0]>2||d.fp[1]>2)));
      for(let j=0;j<3&&BL.length;j++){const d=BL[(o.i*5+j*17)%BL.length];const bx=Math.round((x-240+j*100)/CELL)*CELL+20,bz=Math.round((z-260)/CELL)*CELL+20;for(let i=0;i<S.inv.length;i++)S.inv[i]=null;for(const t of ['axe','digStick','knife','hammer','pick','needle','sickle','spear'])if(ITEMS[t])invAdd(t,1);give(d.cost);if(typeof STG!=='undefined'&&STG[d.id])for(const sg of STG[d.id])give(sg.c);
        const b={id:SIM.n++,k:d.id,x:bx,y:hAt(bx,bz),z:bz,r:0,lv:0,prog:0};if(typeof STG!=='undefined'&&STG[d.id])b.paid=0;S.builds.push(b);structAdd(b,true);if(d.store)S.store[b.id]=Array(d.store).fill(null);if(d.fuel)S.fuel[b.id]=0;
        SIM.go(bx+(d.fp?d.fp[0]:1)*CELL*0.5+30,bz+30);try{let i=0;for(;i<400&&b.prog!=null;i++){S.p.stam=100;S.st={};G.act={t:{type:'site',b},next:0,n:0};siteHit(b);if(b.prog!=null&&b.prog>=1)siteDone(b);}G.act=null;if(b.prog!=null)out.bdBad.push(d.id+' dừng ở '+Math.round(b.prog*100)+'%');else out.bd.push(d.id);if(b.prog!=null)out.bdBad.push('  báo: '+SIM.toasts.slice(-1)[0]);}catch(e){G.act=null;out.bdBad.push(d.id+': '+e.message);}}
      // nâng cấp: công trình đầu tiên nâng cấp được (rương, bếp…)
      try{const b=S.builds.find(b=>b.prog==null&&upKind(b)&&!(b.up>0));if(b){SIM.go(b.x+30,b.z+30);give(upCost(b,1));const u0=b.up|0;upDo(b.id);let n=0;while(G.work&&n++<900){S.p.stam=100;workTick(0.25);}out.up=[b.k,u0,b.up|0];}else out.up='không có công trình nâng cấp được';}catch(e){out.up='lỗi '+e.message;G.work=null;}
      // nghiên cứu: dựng Nhà nghiên cứu, bắt đầu một đề tài, thời gian trôi qua thì xong
      try{SIM.mk('roof',x+200,z-200,'qh_nghien');const q=NC[o.i%NC.length];give(ncCost(q,1));ncStart(q.id);const R=ncS();out.ncStart=!!R.cur;if(R.cur)R.cur.end=Date.now()-1;ncTick();out.nc=[q.id,ncLv(q.id),!R.cur];}catch(e){out.nc='lỗi '+e.message;}
      // bản đồ: mở, phóng sâu nhất, có ảnh chi tiết
      try{uiOpen('map',{});G.mapV={z:1,cx:0,cz:0};mapZoom(1e9,P.x,P.z);out.mapZ=G.mapV.z;}catch(e){out.mapZ='lỗi '+e.message;}
      return out;},{i:pl.i});
    for(let k=0;k<20&&!(await ev(pl,()=>!!(G.mapDet&&G.mapDet.cv)));k++)await sleep(500);const md=await ev(pl,()=>{const o={det:!!(G.mapDet&&G.mapDet.cv)};try{uiClose();}catch(e){}return o;});pl.rkt=r;
    rec(pl.name,'Kinh tế','chế tạo thật 4 công thức khác nhau',r.cr&&r.cr.length>=3&&!r.crBad.length,{duoc:r.cr,hong:r.crBad});
    rec(pl.name,'Kinh tế','xây xong 3 công trình qua từng công đoạn',r.bd&&r.bd.length===3,{duoc:r.bd,hong:r.bdBad});
    rec(pl.name,'Kinh tế','nâng cấp công trình lên bậc 1',Array.isArray(r.up)&&r.up[2]===r.up[1]+1,r.up);
    rec(pl.name,'Kinh tế','nghiên cứu: bắt đầu được, hết giờ thì xong bậc 1',r.ncStart&&Array.isArray(r.nc)&&r.nc[1]>=1&&r.nc[2],r.nc);
    rec(pl.name,'Kinh tế','bản đồ phóng sâu (×'+r.mapZ+') có ảnh chi tiết',r.mapZ>=25&&md.det,{z:r.mapZ,det:md.det});};
  for(let i=0;i<NG.length;i+=4)await Promise.all(NG.slice(i,i+4).map(kinhte));

  // ───────────── GIAI ĐOẠN 4: LIÊN MINH ─────────────
  giai('4. Liên minh: lập, xin vào, thủ lĩnh nhận / từ chối, rời, góp công hiến');
  const byT=t=>NG.filter(n=>n.team===t);const leadA=NG.find(n=>n.team==='A'&&n.lead),leadB=NG.find(n=>n.team==='B'&&n.lead),leadC=NG.find(n=>n.team==='C'&&n.lead);const LD={A:leadA,B:leadB,C:leadC};
  /* liên minh mà người này phải ở sau khi xin vào (trước lúc rời / bị đuổi) */const muon=pl=>/^[ABC](|-roi|-duoi)$/.test(pl.team)?LD[pl.team[0]]||null:null;
  const lap=async(pl,ten,mau)=>{const r=await ev(pl,o=>{uiOpen('clan',{});G.mpTab='tribe';try{mpPanelRefresh&&mpPanelRefresh();}catch(e){}let i=document.getElementById('mpCn');const had=!!i;if(!i){i=document.createElement('input');i.id='mpCn';i.hidden=true;document.body.appendChild(i);}i.value=o.ten;G.mpCol=MPCOL[o.mau];mpClanMake();if(!had)i.remove();uiClose();return {had,clan:mpMyClan(),c:MP.clans[MP.uid]&&MP.clans[MP.uid].name};},{ten,mau});
    rec(pl.name,'Liên minh','lập liên minh «'+ten+'»',r.clan===pl.uid&&r.c===ten,r);};
  /* đợt sau trên cùng thế giới: tên liên minh đợt trước đã có (game chặn trùng tên) → thêm hậu tố */const hau=L=>L&&!['p01','p05','p11'].includes(L.uid)?' '+L.name:'';
  if(leadA)await lap(leadA,'Lửa Thiêng'+hau(leadA),0);if(leadB)await lap(leadB,'Sói Xám'+hau(leadB),2);if(leadC)await lap(leadC,'Rồng Đồng'+hau(leadC),4);
  await sleep(3000);
  // trùng tên phải bị chặn
  {const so=NG.find(n=>n.team==='solo');if(leadA&&so){const r=await ev(so,()=>{let i=document.createElement('input');i.id='mpCn';i.value='lửa thiêng';document.body.appendChild(i);mpClanMake();i.remove();return {clan:mpMyClan(),t:SIM.toasts.slice(-1)[0]};});rec(so.name,'Liên minh','đặt trùng tên liên minh bị chặn',!r.clan&&/trùng tên/.test(r.t||''),r);}}
  const xin=async(pl,cid)=>{const r=await ev(pl,cid=>{mpClanReq(cid);return MP.me.req;},cid);rec(pl.name,'Liên minh','gửi xin vào',r===cid,r);};
  for(const pl of NG){if(pl.lead||pl.team==='solo')continue;const L=LD[pl.team[0]];if(L)await xin(pl,L.uid);}
  await sleep(4000);
  const nhan=async(ld)=>{const r=await ev(ld,o=>{const L=Object.entries(MP.players).filter(([u,p])=>p.req===MP.uid).map(([u])=>u);const yes=[],no=[];for(const u of L){if(o.no.includes(u)){mpClanAccept(u,false);no.push(u);}else{mpClanAccept(u,true);yes.push(u);}}
      let html='';try{html=mpTribeHtml().replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,300);}catch(e){html='LỖI '+e.message;}return {L,yes,no,mem:MP.clans[MP.uid].members,html};},{no:NG.filter(n=>/tuchoi/.test(n.team)).map(n=>n.uid)});
    const want=NG.filter(n=>!n.lead&&n.team[0]===ld.team).length;rec(ld.name,'Liên minh','thấy đủ '+want+' đơn xin vào',r.L&&r.L.length===want,r);return r;};
  for(const L of [leadA,leadB,leadC])if(L)await nhan(L);
  await sleep(7000);
  for(const pl of NG){const want=muon(pl);if(pl.team==='solo')continue;
    const r=await ev(pl,()=>({clan:mpMyClan(),req:MP.me.req,t:SIM.toasts.filter(t=>/liên minh|gia nhập|chưa nhận/.test(t)).slice(-2)}));
    if(/tuchoi/.test(pl.team))rec(pl.name,'Liên minh','bị từ chối: không vào, hết trạng thái chờ, có báo',!r.clan&&!r.req&&r.t.some(t=>/chưa nhận/.test(t)),r);
    else if(want)rec(pl.name,'Liên minh','đã vào liên minh của '+want.name,r.clan===want.uid,r);}
  // mọi người thấy cùng một danh sách thành viên
  {const want={};for(const pl of NG){const c=muon(pl);want[pl.uid]=c?c.uid:null;}
    for(const pl of NG){const r=await ev(pl,ids=>Object.fromEntries(ids.map(u=>[u,mpClanOf(u)])),NG.map(n=>n.uid));const sai=Object.keys(want).filter(u=>r[u]!==want[u]);rec(pl.name,'Liên minh','nhìn thấy đúng ai thuộc liên minh nào',!sai.length,sai.map(u=>NAMES[u]+': thấy '+r[u]+' cần '+want[u]));}}
  // rời liên minh
  {const pl=NG.find(n=>n.team==='B-roi');if(pl){await ev(pl,()=>mpClanLeave());await sleep(9000);const r=await ev(pl,()=>mpMyClan());const r2=leadB&&await ev(leadB,u=>({of:mpClanOf(u),mem:MP.clans[MP.uid].members}),pl.uid);
    rec(pl.name,'Liên minh','rời liên minh',r===null,r);rec(leadB.name,'Liên minh','thủ lĩnh thấy '+pl.name+' đã rời, danh sách tự bỏ tên',r2&&r2.of===null&&!r2.mem.includes(pl.uid),r2);}}
  // thủ lĩnh đuổi một thành viên
  {const pl=NG.find(n=>n.team==='C-duoi');if(pl&&leadC){await ev(leadC,u=>mpClanKick(u),pl.uid);/* game đối chiếu thành viên khi dữ liệu đổi và chờ thêm 4 giây cho chắc: chờ tối đa 30 giây cho dòng báo */for(let k=0;k<30;k++){await sleep(1000);if(await ev(pl,()=>mpMyClan()===null&&SIM.toasts.some(t=>/không còn ở trong liên minh/.test(t))))break;}const r=await ev(pl,()=>({clan:mpMyClan(),t:SIM.toasts.filter(t=>/không còn ở trong liên minh/.test(t)).length}));const r2=await ev(NG[0],u=>mpClanOf(u),pl.uid);
    rec(pl.name,'Liên minh','bị thủ lĩnh đuổi: ra khỏi liên minh, có báo',r.clan===null&&r.t>0,r);rec(NG[0].name,'Liên minh','người ngoài cũng thấy '+pl.name+' không còn trong liên minh',r2===null,r2);}}
  // góp công hiến → cấp liên minh tính cộng dồn giữa các thành viên
  {const A=NG.filter(n=>n.team==='A');for(const pl of A){const r=await ev(pl,()=>{invAdd('wood',20);const w0=invCount('wood');lmcGive('wood');return {took:w0-invCount('wood'),p:S.lmc&&S.lmc.p};});rec(pl.name,'Liên minh','góp 10 gỗ lấy công hiến',r.took===10&&r.p===10,r);}
    await sleep(35000);/* hồ sơ người chơi đẩy công hiến theo nhịp */
    const tots=[];for(const pl of A)tots.push(await ev(pl,c=>lmcTotal(c),leadA.uid));rec('Liên minh A','Liên minh','mọi thành viên thấy cùng tổng công hiến ('+A.length*10+')',tots.every(t=>t===A.length*10),tots);}

  // ───────────── GIAI ĐOẠN 5: QUÂN ĐỘI ─────────────
  giai('5. Quân đội: trại lính, chiêu mộ, phong tướng, đội hình, chiến thuật');
  const quan=async pl=>{const r=await ev(pl,()=>{const o={};const [x,z]=SIM.home;S.hour=10;
      for(let i=0;i<2;i++)S.folk.push({n:'Lính '+i,role:'hunter',seed:300+i,sex:'m',job:'soldier',x:x+30+i*14,z:z+30,fed:TNOW(),lv:4+i});
      o.cap0=tgArmyCap();o.slots=tgSlots();for(const k of ['meatCooked','hide','bone'])invAdd(k,40);invAdd('spear',2);{const gl=S.folk.filter(f=>f.job==='soldier').sort((a,b)=>(b.lv|0)-(a.lv|0))[0];tgPromote(qdUid(gl));o.pmT=SIM.toasts.slice(-1)[0];}o.gens=tgList().length;o.cap1=tgArmyCap();for(let i=0;i<S.inv.length;i++)S.inv[i]=null;invAdd('meatCooked',20);invAdd('spear',4);invAdd('hide',30);invAdd('bone',30);
      const s0=qdSol().length;uiOpen('dan',{});const btn=document.querySelector('#panel [data-a="qdrc"]');if(btn){btn.click();const b2=document.querySelector('#panel [data-a="qdrc"]');if(b2)b2.click();}o.recruited=qdSol().length-s0;o.rcBtn=!!btn;o.rcT=SIM.toasts.slice(-2);o.paid=[invCount('meatCooked'),invCount('spear')];if(G.panel)uiClose();
      const A=qdS();const md=[];for(const f of ['line','col','wedge','circle']){A.form=f;A.cmd='follow';for(let i=0;i<60*12;i++){G.t+=1/60;folkTick(1/60);}let m=1e9;const L=qdSol();for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++)m=Math.min(m,Math.hypot(L[i].x-L[j].x,L[i].z-L[j].z));md.push(+m.toFixed(1));}o.minD=md;
      try{tgTacSet('vay');o.tac=qdS().tac;}catch(e){o.tac='lỗi '+e.message;}
      try{const h=qdHtml();o.box=h.includes('tg-box');}catch(e){o.box='lỗi '+e.message;}o.sol=qdSol().length;
      // huấn luyện: cả đạo quân đánh một toán cướp yếu; lính có thêm kinh nghiệm, tướng lên kinh nghiệm
      try{const L=qdSol(),xp0=L.reduce((a,f)=>a+(f.xp||0)+(f.lv||1)*100,0),g=tgList()[0],gx0=g?(g.xp||0)+(g.lv||1)*1000:0;A.form='line';A.cmd='follow';const F=[];for(let i=0;i<3;i++){const f=foeSpawn(P.x+80+i*20,P.z+60,'raid');f.hp=FOE.hp*0.6;f.hp0=f.hp;f.state='chase';F.push(f);}
        for(let i=0;i<60*25&&F.some(f=>f.alive);i++){G.t+=1/60;S.p.hp=100;try{foesTick(1/60);}catch(e){}folkTick(1/60);}o.train={dead:F.filter(f=>!f.alive).length,xp:L.reduce((a,f)=>a+(f.xp||0)+(f.lv||1)*100,0)-xp0,gxp:g?(g.xp||0)+(g.lv||1)*1000-gx0:null};for(const f of F){f.alive=false;try{G.sc.remove(f.o);}catch(e){}}}catch(e){o.train='lỗi '+e.message;}
      try{if(typeof LQ_CAP!=='undefined'){const f=qdSol().find(f=>danLv(f)<LQ_CAP&&!f.wd);if(f){const x0=(f.xp||0)+danLv(f)*1000;for(let h=0;h<3;h++)folkHourly(S.hour);o.lq=(f.xp||0)+danLv(f)*1000-x0;}}}catch(e){o.lq='lỗi '+e.message;}
      PVP.pubT=0;try{pvpPubTick();}catch(e){o.pubErr=e.message;}return o;});pl.r5=r;
    if(r.lq!==undefined)rec(pl.name,'Quân đội','luyện quân ở Trại lính: 3 giờ trong game lính thêm kinh nghiệm',typeof r.lq==='number'&&r.lq>0,r.lq);
    rec(pl.name,'Quân đội','huấn luyện: đạo quân hạ toán cướp, lính có thêm kinh nghiệm',r.train&&r.train.dead>=2&&r.train.xp>0,r.train);
    rec(pl.name,'Quân đội','chiêu mộ được lính ở Trại lính',r.rcBtn&&r.recruited>=1,r);
    rec(pl.name,'Quân đội','phong tướng, quân số tăng',r.gens>=1&&r.cap1>r.cap0,{gens:r.gens,cap:[r.cap0,r.cap1]});
    rec(pl.name,'Quân đội','4 đội hình không ai chồng lên ai',r.minD&&r.minD.every(d=>d>=12),r.minD);
    rec(pl.name,'Quân đội','bảng Đạo quân có khung tướng',r.box===true,r.box);};
  for(const pl of NG)await quan(pl);
  await sleep(4000);
  for(const pl of [leadA,leadB].filter(Boolean)){const d=DB.get('players/'+pl.uid)||{};rec(pl.name,'Quân đội','sức giữ nhà (lính gác/lính) lên máy chủ chung',Array.isArray(d.df)&&d.df.some(x=>x>0)&&Array.isArray(d.h),{df:d.df,h:d.h,hl:d.hl});}

  // ───────────── GIAI ĐOẠN 6: XÂM CHIẾM ─────────────
  giai('6. Xâm chiếm: tuyên chiến, cướp phá nhà đối phương, công phá điểm giàu, hạ cờ');
  if(leadA&&leadB){
    // tuyên chiến
    const w=await ev(leadA,b=>{pvpWarSet(b,true);return MP.clans[MP.uid].war;},leadB.uid);await sleep(5000);
    rec(leadA.name,'Xâm chiếm','tuyên chiến với Sói Xám',Array.isArray(w)&&w.includes(leadB.uid),w);
    for(const pl of NG.filter(n=>n.team==='A'||n.team==='B')){const r=await ev(pl,o=>pvpAtWar(o),pl.team==='A'?leadB.uid:leadA.uid);rec(pl.name,'Xâm chiếm','biết hai liên minh đang chiến tranh',r===true,r);}
    {const pl=NG.find(n=>n.team==='solo');if(pl){const r=await ev(pl,o=>({atWar:pvpAtWar(o),why:pvpWhy(o)}),leadB.uid);rec(pl.name,'Xâm chiếm','người ngoài cuộc không bị kéo vào chiến tranh',r.atWar!==true,r);}}
    // cướp phá: Bình (A) tới nhà Én (B)
    const cuop=async(at,vic)=>{
    const r0=await ev(vic,()=>{const ch=S.builds.find(b=>b.k==='chest'&&b.id>=20000);return {wood:S.store[ch.id][0]&&S.store[ch.id][0].n,ch:ch.id};});
    const rc=await ev(at,o=>SIM.track(o.h[0]+60,o.h[1]+40,6000),{h:vic.home});console.log('   vết vị trí '+at.name+' sau khi tới nhà '+vic.name+' [dx,dz,số lính địch,máu]: '+JSON.stringify(rc).slice(0,400));
    const r1=await ev(at,o=>new Promise(res=>{const u=o.u;const tries=[];let k=0;const go=()=>{SIM.go(o.h[0]+60,o.h[1]+40);try{mpNearTick&&mpNearTick();}catch(e){}pvpNearScan();const t=PVP.near;if(!t&&k++<12){tries.push(MP.bcur?MP.bcur.size:-1);return setTimeout(go,1500);}
      if(!t)return res({near:false,tries,bcur:MP.bcur&&[...MP.bcur.keys()],why:pvpWhy(u)});const info=targetInfo(t);const f0=G.foes.filter(f=>f.pvp).length;actStart(t);const W=G.work;const foes=G.foes.filter(f=>f.pvp).map(f=>[f.n,f.lv]);if(W&&W.fn){W.fn();G.work=null;}
      setTimeout(()=>{PVP.pubT=0;try{pvpTick&&pvpTick();}catch(e){}res({near:true,lthHet:!!(LTH.sp[u]&&lthOf(u).length&&lthOf(u).every(f=>!f.alive||f.civ)),k:t.b&&t.b.k,uid:t.uid,info:info&&[info.name,info.verb,info.ok],foes,out:S.pvp.out,inv:S.inv.filter(Boolean).map(s=>s.id+':'+s.n).join(',').slice(0,200),t:SIM.toasts.slice(-3)});},1500);};go();}),{u:vic.uid,h:vic.home});
    rec(at.name,'Xâm chiếm','tới nhà '+vic.name+', thấy công trình để cướp phá',r1.near===true,r1);
    if(r1.near){rec(at.name,'Xâm chiếm','lính gác nhà '+vic.name+' xông ra (hoặc đã bị hạ hết từ trước trong chiến tranh)',(r1.foes&&r1.foes.length>=1)||r1.lthHet,{foes:r1.foes,lthHet:r1.lthHet});rec(at.name,'Xâm chiếm','phá được công trình, ghi lên máy chủ',r1.out&&Object.keys(r1.out).length>0,r1.out);}
    await ev(at,()=>{RL.mp.putT=0;try{rlMpTick();}catch(e){}});await sleep(8000);
    const r2=await ev(vic,()=>({log:(S.pvp.log||[]).slice(-3),sh:S.pvp.sh>Date.now(),t:SIM.toasts.filter(t=>/cướp|phá|tấn công/i.test(t)).slice(-3),dmg:S.builds.filter(b=>b.id>=20000&&b.prog!=null).map(b=>b.k)}));
    rec(vic.name,'Xâm chiếm','chủ nhà biết mình bị cướp phá (nhật ký / thông báo / công trình hư)',(r2.log&&r2.log.length)||(r2.t&&r2.t.length)||(r2.dmg&&r2.dmg.length),r2);
    };
    const at=NG.find(n=>n.team==='A'&&!n.lead)||leadA,vic=leadB;await cuop(at,vic);
    // liên minh thứ ba (Rồng Đồng) tuyên chiến với Sói Xám: hai cuộc chiến cùng lúc, Nam (C) cướp nhà Phong (B)
    if(leadC){const w3=await ev(leadC,b=>{pvpWarSet(b,true);return MP.clans[MP.uid].war;},leadB.uid);await sleep(5000);rec(leadC.name,'Xâm chiếm','Rồng Đồng tuyên chiến với Sói Xám (hai cuộc chiến cùng lúc)',Array.isArray(w3)&&w3.includes(leadB.uid),w3);
      const rb=await ev(leadB,o=>[pvpAtWar(o.a),pvpAtWar(o.c)],{a:leadA.uid,c:leadC.uid});rec(leadB.name,'Xâm chiếm','Sói Xám biết đang đánh cả hai phe',rb[0]===true&&rb[1]===true,rb);
      const ac=await ev(leadA,c=>pvpAtWar(c),leadC.uid);rec(leadA.name,'Xâm chiếm','Lửa Thiêng và Rồng Đồng không đánh nhau',ac!==true,ac);
      const at2=NG.find(n=>n.team==='C'&&!n.lead),v2=NG.find(n=>n.team==='B'&&!n.lead);if(at2&&v2)await cuop(at2,v2);}
    // công phá điểm giàu: B giữ điểm, A công phá
    const site=await ev(vic,()=>{const s=RL.sites.slice().sort((a,b)=>Math.hypot(a.x-SIM.home[0],a.z-SIM.home[1])-Math.hypot(b.x-SIM.home[0],b.z-SIM.home[1]))[0];SIM.go(s.x+30,s.z+30);SIM.mk('totem',s.x+60,s.z);SIM.mk('palisade',s.x-60,s.z);SIM.mk('chest',s.x,s.z+60);const st=S.rlm.s[s.id]||(S.rlm.s[s.id]={});st.own='me';st.stock={};const it=Object.keys(s.def.y).find(i=>ITEMS[i]);st.stock[it]=10;st.at=Date.now();RL.mp.putT=0;try{rlMpTick();}catch(e){return {err:e.message};}return {id:s.id,x:s.x,z:s.z,it,ctl:RL.mp.ctl[s.id]};});
    await sleep(6000);
    const r3=await ev(leadA,o=>{return SIM.track(o.x+20,o.z,2500).then(tr=>new Promise(res=>{SIM.go(o.x+20,o.z);try{rlMpCalc();}catch(e){}const c=RL.mp.ctl[o.id];const t=cthNear(),i=t&&targetInfo(t);if(!t)return res({near:false,ctl:c,tr,d:Math.hypot(P.x-o.x,P.z-o.z),R:CTH.R});actStart(t);const g=G.foes.filter(f=>f.pvp).length,W=G.work;if(W&&W.fn){W.fn();G.work=null;}RL.mp.putT=0;try{rlMpTick();}catch(e){}
      setTimeout(()=>res({near:true,ctl0:c&&c.g,info:i&&[i.verb,i.ok,i.need],guards:g,ws:S.pvp.ws,ctl:RL.mp.ctl[o.id]&&RL.mp.ctl[o.id].g,t:SIM.toasts.slice(-2),tr:tr.slice(-3)}),2000);}));},site);
    rec(leadA.name,'Xâm chiếm','thấy điểm giàu đang do Sói Xám giữ',r3.near&&r3.ctl0!=null&&r3.ctl0!==undefined,r3);
    rec(leadA.name,'Xâm chiếm','công phá điểm giàu: lính giữ đất xông ra, được điểm chiến tranh, phe kia mất quyền giữ',r3.near&&r3.info&&r3.info[1]===true&&r3.guards>=1&&r3.ws&&(r3.ws[leadB.uid]|0)>=15&&r3.ctl==null,r3);
    await sleep(8000);
    const r4=await ev(vic,o=>{try{rlMpCalc();}catch(e){}const st=S.rlm.s[o.id];return {stock:st&&st.stock&&st.stock[o.it],own:st&&st.own,t:SIM.toasts.filter(t=>/công phá|mất/i.test(t)).slice(-2)};},site);
    rec(vic.name,'Xâm chiếm','bên bị công phá mất nửa kho ở điểm giàu',r4.stock===5,r4);
    // hạ cờ: Én đặt đất chung, An tới hạ cờ
    const z=await ev(leadB,()=>{SIM.go(SIM.home[0],SIM.home[1]);mpZoneSet(true);return MP.clans[MP.uid].zone;});await sleep(5000);
    rec(leadB.name,'Xâm chiếm','đặt vùng đất chung (cắm cờ)',!!z&&z.x!=null,z);
    const r5=await ev(leadA,o=>{if(!o)return {z:false};return SIM.track(o.x+20,o.z,2500).then(tr=>new Promise(res=>{SIM.go(o.x+20,o.z);try{pvpFlagSync();}catch(e){}const t=pvpFlagNear();if(!t)return res({near:false,tr,on:pvpOn(),my:mpMyClan(),d:(()=>{const c=MP.clans[Object.keys(MP.clans).find(k=>k!==MP.uid)];return c&&c.zone?Math.hypot(c.zone.x-P.x,c.zone.z-P.z):-1;})(),zone:MP.clans[Object.keys(MP.clans).find(k=>k!==MP.uid)]&&MP.clans[Object.keys(MP.clans).find(k=>k!==MP.uid)].zone});const i=targetInfo(t);actStart(t);const W=G.work;const g=G.foes.filter(f=>f.pvp).length;if(W&&W.fn){W.fn();G.work=null;}
      setTimeout(()=>res({near:true,info:i&&[i.verb,i.ok],guards:g,zo:S.pvp.zo,ws:S.pvp.ws,t:SIM.toasts.slice(-2),tr:tr.slice(-3)}),2000);}));},z);
    rec(leadA.name,'Xâm chiếm','hạ cờ đất chung của Sói Xám',r5.near&&r5.zo&&Object.keys(r5.zo).length>0,r5);
    await ev(leadA,()=>{RL.mp.putT=0;try{rlMpTick();}catch(e){}PVP.pubT=0;try{pvpTick&&pvpTick();}catch(e){}});await sleep(9000);
    const r6=await ev(leadB,()=>({zone:MP.clans[MP.uid].zone,zcd:S.pvp.zcd>Date.now(),t:SIM.toasts.filter(t=>/cờ/i.test(t)).slice(-2)}));
    rec(leadB.name,'Xâm chiếm','bị hạ cờ thì mất đất chung, chờ mới cắm lại được',r6.zcd===true&&!r6.zone,r6);
    // điểm chiến tranh hai bên nhìn giống nhau
    /* điểm gửi qua máy chủ theo nhịp ~20 giây: chờ tối đa 45 giây cho hai bên khớp */let pa,pb;for(let k=0;k<10;k++){await ev(leadA,()=>{RL.mp.putT=0;try{rlMpTick();}catch(e){}});await ev(leadB,()=>{RL.mp.putT=0;try{rlMpTick();}catch(e){}});await sleep(4500);pa=await ev(leadA,b=>[pvpWarPts(MP.uid,b),pvpWarPts(b,MP.uid)],leadB.uid);pb=await ev(leadB,a=>[pvpWarPts(a,MP.uid),pvpWarPts(MP.uid,a)],leadA.uid);if(JSON.stringify(pa)===JSON.stringify(pb))break;}
    rec('Hai liên minh','Xâm chiếm','bảng điểm chiến tranh hai bên khớp nhau',JSON.stringify(pa)===JSON.stringify(pb),{A:pa,B:pb});
    // giảng hoà
    const hw=await ev(leadA,b=>{pvpWarSet(b,false);return (MP.clans[MP.uid].war||[]).includes(b);},leadB.uid);await sleep(5000);const hb=await ev(leadB,a=>pvpAtWar(a),leadA.uid);
    rec(leadA.name,'Xâm chiếm','giảng hoà, bên kia cũng hết chiến tranh',hw===false&&hb!==true,{hw,hb});
    // cửa nhà / cướp phá người cùng liên minh phải bị chặn
    const m=NG.find(n=>n.team==='A'&&n!==at&&!n.lead);if(m){const r=await ev(at,u=>pvpWhy(u),m.uid);rec(at.name,'Xâm chiếm','không cướp phá được người cùng liên minh',!!r,r);}
  }

  // ───────────── GIAI ĐOẠN 7: LƯU VÀ MỞ LẠI ─────────────
  giai('7. Lưu, đóng game rồi mở lại: nhà, dân, lính, liên minh còn nguyên');
  const mo=async pl=>{const a=await ev(pl,()=>{save();return {L:S.builds.map(b=>b.k+'@'+Math.round(b.x)+','+Math.round(b.z)+(b.prog!=null?'*':'')),b:S.builds.length,f:S.folk.length,clan:mpMyClan(),hl:heroLv(),goal:S.goal,g:tgS().list.length,gOn:tgList().length,wd:(S.folk||[]).filter(f=>f.wd).length};});
    pl.reloading=true;await snapScript(pl);try{await pl.page.reload();}catch(e){}pl.reloading=false;await sleep(5000);
    const btn=await ev(pl,n=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent).map(b=>b.innerText.replace(/\s+/g,' ').slice(0,40)),pl.name);
    await ev(pl,()=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.trim()==='Chơi'||/Chơi tiếp/.test(b.innerText));if(b)b.click();});await sleep(2500);await click(pl,'Bắt đầu');
    try{await pl.page.waitForFunction(()=>typeof G==='object'&&G.on&&P.model,null,{timeout:240000});}catch(e){rec(pl.name,'Mở lại','vào lại được game',false,btn);return;}
    await sleep(2000);await nhip(pl);await helpers(pl);for(let k=0;k<30;k++){if(await ev(pl,()=>mpOn())===true)break;await sleep(1000);}await sleep(4000);
    const b=await ev(pl,()=>({L:S.builds.map(b=>b.k+'@'+Math.round(b.x)+','+Math.round(b.z)+(b.prog!=null?'*':'')),b:S.builds.length,f:S.folk.length,clan:mpMyClan(),hl:heroLv(),goal:S.goal,g:tgS().list.length,gOn:tgList().length,wd:(S.folk||[]).filter(f=>f.wd).length}));
    rec(pl.name,'Mở lại','công trình, dân, lính, cấp, mục tiêu, tướng còn nguyên',a.b===b.b&&a.f===b.f&&a.hl===b.hl&&a.goal===b.goal&&a.g===b.g,{mat:(a.L||[]).filter(x=>!(b.L||[]).includes(x)),them:(b.L||[]).filter(x=>!(a.L||[]).includes(x)),truoc:Object.assign({},a,{L:undefined}),sau:Object.assign({},b,{L:undefined})});
    rec(pl.name,'Mở lại','vẫn ở đúng liên minh',a.clan===b.clan,{truoc:a.clan,sau:b.clan});};
  for(let i=0;i<NG.length;i+=3)await Promise.all(NG.slice(i,i+3).map(mo));

  // ───────────── TỔNG KẾT ─────────────
  giai('Tổng kết lỗi chạy');
  for(const pl of NG){const le=await ev(pl,()=>window.__LE?__LE.slice(0,5):[]);const all=pl.logs.concat((le||[]).map(x=>'LOOP '+x));rec(pl.name,'Toàn bộ','không có lỗi chạy trong suốt quá trình',!all.length,all.slice(0,6));}
  clearInterval(fl);if(process.env.DBOUT)fs.writeFileSync(process.env.DBOUT,JSON.stringify([...DB.entries()]));
  const out=path.join(process.env.TMPDIR||'/tmp','ld-muoi-nguoi.json');fs.writeFileSync(out,JSON.stringify({N,AUTOS,giay:Math.round((Date.now()-T0)/1000),R,chiTiet:NG.map(n=>({ten:n.name,doi:n.team,r1:n.r1,r2:n.r2,r3:n.r3,r5:n.r5}))},null,1));
  const bad=R.filter(x=>!x.ok);console.log('\nTổng: '+R.length+' bước, '+(R.length-bad.length)+' đạt, '+bad.length+' hỏng — báo cáo: '+out);
  console.log(bad.length?'MN-HONG '+bad.map(x=>x.who+': '+x.step).join(' ;; ').slice(0,1500):'MN-DAT');
  await br.close();SRV.close();process.exit(bad.length?1:0);})();
