/* ===================== LUỒNG PHỤ: TÍNH SẴN TỈNH KẾ BÊN (đại lục liền mạch, đợt 1) =====================
   Trước: qua ranh giới tỉnh, luồng chính phải tính lại độ cao, mực nước, sinh cảnh, màu đất của cả vùng nạp (~1 giây đứng hình trên máy thử).
   Giờ: đi tới gần ranh giới thì một LUỒNG PHỤ (Web Worker) chạy CHÍNH mã game này, tính sẵn các mảng đó cho tỉnh phía trước, song song với lúc chơi;
   qua ranh giới thì luồng chính nhận lại kết quả thay vì tự tính. Chạy thử so từng điểm: kết quả giống hệt (0 điểm khác trên 333 nghìn điểm).
   An toàn: chỉ dùng khi đúng tỉnh và đúng dữ liệu đầu vào (san nền, đào hố, nền của người khác) như lúc luồng phụ tính; sai lệch gì thì tự tính như cũ.
   Luồng phụ tự tắt sau mỗi lần tính để không giữ thêm bộ nhớ. Tắt hẳn: localStorage 'ld-lp' = '0'. */
const LP={w:null,busy:0,ready:null,k:null,err:0,used:0,miss:'',t0:0,ms:0};
function lpOn(){try{if(typeof Worker==='undefined'||typeof Blob==='undefined'||self.__LP)return false;if(localStorage.getItem('ld-lp')==='0')return false;/* máy ít bộ nhớ (trình duyệt báo dưới 4 GB): không mở thêm luồng phụ, qua tỉnh theo cách cũ */if(navigator.deviceMemory&&navigator.deviceMemory<4)return false;return LP.err<3;}catch(e){return false;}}
/* dữ liệu đầu vào ngoài toạ độ tỉnh mà các bước tính dùng tới */
function lpSig(){try{return JSON.stringify([S.seed,S.seed0||0,S.wv||0,S.flat||[],S.dig||[],S.tun||[],(typeof DB==='object'&&DB&&DB.flats)||[],(typeof DAO==='object'&&DAO&&DAO.rdig)||[]]);}catch(e){return 'x'+Math.random();}}
/* phần giả cho luồng phụ: không có trang, không có bộ nhớ trình duyệt; mọi thứ giao diện trả về một vật "gì cũng được" */
const LP_PRE=`(()=>{const mk=()=>{const f=function(){};const px=new Proxy(f,{get(t,k){if(k===Symbol.toPrimitive)return ()=>0;if(k==='then')return undefined;if(k===Symbol.iterator)return function*(){};if(k==='length')return 0;return px;},apply(){return px;},construct(){return px;},set(){return true;},has(){return true;}});return px;};
  const any=mk();self.window=self;self.document=any;self.localStorage=self.sessionStorage=(()=>{const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),clear:()=>m.clear(),key:i=>[...m.keys()][i],get length(){return m.size;}};})();
  self.innerWidth=390;self.innerHeight=844;self.devicePixelRatio=1;self.requestAnimationFrame=()=>0;self.cancelAnimationFrame=()=>0;self.matchMedia=()=>({matches:false,addEventListener(){}});self.alert=self.confirm=()=>false;self.getComputedStyle=()=>any;self.screen={width:390,height:844};
  self.HTMLElement=self.Element=self.Node=function(){};self.Image=function(){return any;};self.__LP=1;/* luồng phụ chỉ tính dữ liệu: không in gì ra màn hình gỡ lỗi (phần dự đoán chạy thử mã dựng hình nên có lỗi vô hại); lỗi thật gửi về qua tin nhắn */const nop=()=>{};self.console={log:nop,warn:nop,error:nop,info:nop,debug:nop,time:nop,timeEnd:nop,trace:nop,group:nop,groupEnd:nop,table:nop};
  importScripts(self.__TURL);if(THREE.ColorManagement)THREE.ColorManagement.legacyMode=false;/* như K3init trên luồng chính: màu tuyến tính */
  self.onmessage=e=>{const d=e.data,o={id:d.id};try{S=JSON.parse(d.S);P.x=d.px;P.z=d.pz;try{DB.flats=d.dbf;}catch(er){}try{DAO.rdig=d.rdig;}catch(er){}
      G.on=false;worldCfg(3);/* nạp hạt giống đại lục trước (dlSeedAt cần) */dlMoveState(d.dx,d.dz);worldCfg(3);o.k=S.dl.ox+','+S.dl.oz;o.sig=lpSig();
      noiseInit(S.seed);heightsBuild();o.HG=HG.slice(0);o.WG=WG.slice(0);o.ZG=W4.ZG?W4.ZG.slice(0):null;o.ZK=W4.ZK?W4.ZK.slice(0):null;
      biomeGridBuild();o.BG=BG.slice(0);regionsBuild();trailsBuild();decorPlan();caveFlatten();biomeGridBuild();terrainColors();
      o.TCOL=TCOL;o.TNRM=TNRM;o.TSPL=TSPL;o.T3={brooks:T3.brooks,BW:T3.BW,BD:T3.BD,TQ:T3.TQ};try{o.ring=dlRingData();}catch(er){}try{o.dep=t3DepthTex().image.data;}catch(er){}self.__LPRES=null;try{resGen(S.seed);}catch(er){}o.RES=self.__LPRES;o.resBase=DL.resBase;
      /* DỰ ĐOÁN hình người, thú tỉnh này sẽ cần: chạy đúng mã sinh làng, trại, thú nhưng chỉ GHI LẠI lời gọi dựng hình (trả về hình rỗng) */
      try{const rec=[],R0={};const rig=()=>new Proxy({},{get(t,k){if(typeof k!=='string')return undefined;if(!(k in t))t[k]=new THREE.Object3D();return t[k];}});
        const stub=()=>{const g=new THREE.Group();g.userData.rig=rig();return g;};G.sc=new THREE.Scene();G.animals=[];G.foes=[];G.npcs=[];
        animalModel=function(){rec.push(['a',[].slice.call(arguments)]);return stub();};
        model=function(){return stub();};let tlRan=0;try{const _tl=tlInit;tlInit=function(){tlRan=1;return _tl.apply(this,arguments);};}catch(er){}
        const sb=window.SBM||{};window.SBM=new Proxy(sb,{get(t,k){if(k==='villager')return function(){rec.push(['v',[].slice.call(arguments)]);return stub();};if(k==='animal')return function(){return stub();};return t[k];}});
        for(const f of [()=>villageInit(),()=>villageGrow(),()=>campInit(),()=>{if(!tlRan)tlInit();},()=>animalsInit()]){try{f();}catch(er){o.predE=(o.predE||[]).concat(String(er&&er.message).slice(0,80));}}o.pred=rec;}catch(er){o.predErr=String(er&&er.message);}}catch(er){o.err=String(er&&er.message||er)+' @ '+String(er&&er.stack||'').split('\\n').slice(1,3).join(' | ');}
    const tr=[];for(const k of ['HG','WG','ZG','ZK','BG','TCOL','TNRM','TSPL'])if(o[k]&&o[k].buffer)tr.push(o[k].buffer);if(o.T3)for(const k of ['BW','BD','TQ'])if(o.T3[k]&&o.T3[k].buffer)tr.push(o.T3[k].buffer);if(o.ring)for(const k of ['pos','col','idx','nor'])if(o.ring[k]&&o.ring[k].buffer)tr.push(o.ring[k].buffer);if(o.dep&&o.dep.buffer)tr.push(o.dep.buffer);postMessage(o,tr);};})();`;
function lpCode(){if(LP.code)return LP.code;let main='';try{main=[...document.scripts].filter(s=>!s.src).map(s=>s.textContent).sort((a,b)=>b.length-a.length)[0]||'';}catch(e){}
  if(main.length<100000)return null;let turl=TURLS[0];try{const s=[...document.scripts].find(s=>/three(\.min)?\.js/.test(s.src||''));if(s)turl=s.src;}catch(e){}
  LP.code=URL.createObjectURL(new Blob(['self.__TURL='+JSON.stringify(turl)+';\n'+LP_PRE+'\n'+main],{type:'text/javascript'}));return LP.code;}
function lpStop(){try{if(LP.w)LP.w.terminate();}catch(e){}LP.w=null;LP.busy=0;}
/* nhờ luồng phụ tính tỉnh lệch (dx,dz) so với tỉnh đang đứng */
function lpAsk(dx,dz){if(!lpOn()||LP.busy||!DL.on||!S||!S.dl)return;const k=(S.dl.ox+dx)+','+(S.dl.oz+dz);if(LP.k===k&&LP.ready)return;const url=lpCode();if(!url){LP.err=9;return;}
  LP.busy=1;LP.k=k;LP.ready=null;LP.t0=performance.now();const id=(LP.id=(LP.id|0)+1);
  try{LP.w=new Worker(url);LP.w.onerror=ev=>{LP.err++;LP.miss='luồng phụ lỗi: '+(ev&&ev.message||'');lpStop();};
    LP.w.onmessage=ev=>{const r=ev.data;lpStop();if(r.id!==id)return;if(r.err){LP.err++;LP.miss='luồng phụ: '+r.err;return;}LP.ms=Math.round(performance.now()-LP.t0);LP.ready=r;try{lpPoolPlan(r.pred||[]);}catch(e){}};
    let s='';try{s=typeof ldPack==='function'?ldPack(S):JSON.stringify(S,(k,v)=>k&&k[0]==='_'?undefined:v);}catch(e){}
    LP.w.postMessage({id,S:s,px:P.x,pz:P.z,dx,dz,dbf:(typeof DB==='object'&&DB&&DB.flats)||[],rdig:(typeof DAO==='object'&&DAO&&DAO.rdig)||[]});}catch(e){LP.err++;LP.miss='không mở được luồng phụ: '+e.message;lpStop();}}
/* lúc dựng lại vùng khi sang tỉnh (DL.busy): kết quả có sẵn, đúng tỉnh, đúng đầu vào thì dùng */
function lpTake(part){try{if(!DL.on||!DL.busy)return null;const r=LP.ready;if(!r)return null;if(r.k!==DL.ox+','+DL.oz){LP.miss='khác tỉnh';return null;}const sg=lpSig();if(r.sig!==sg){let i=0;while(i<sg.length&&sg[i]===r.sig[i])i++;LP.miss='đầu vào đã đổi @'+i+': '+r.sig.slice(Math.max(0,i-60),i+40)+' ≠ '+sg.slice(Math.max(0,i-60),i+40);LP.ready=null;return null;}if(!r[part])return null;return r;}catch(e){return null;}}
{const _hb=heightsBuild;heightsBuild=function(){const r=lpTake('HG');if(r){riversSurface();HG=r.HG;WG=r.WG;try{if(typeof W4==='object'){W4.ZG=r.ZG;W4.ZK=r.ZK;}}catch(e){}r.HG=null;LP.used++;return;}return _hb.apply(this,arguments);};}
{const _bg=biomeGridBuild;biomeGridBuild=function(){const r=lpTake('BG');if(r){BG=r.BG;DL.bgKey=DL.ox+','+DL.oz+':'+(DL.bgN|0);r.BG=null;return;}return _bg.apply(this,arguments);};}
{const _tc=terrainColors;terrainColors=function(){const r=lpTake('TCOL');if(r){TGX=DL.ox;TGZ=DL.oz;TCOL=r.TCOL;TNRM=r.TNRM;TSPL=r.TSPL;try{Object.assign(T3,r.T3);}catch(e){}LP.resRd={k:r.k,sig:r.sig,RES:r.RES,resBase:r.resBase};LP.ringRd=r.ring||null;LP.depRd=r.dep?{k:r.k,d:r.dep}:null;LP.ready=null;return;}return _tc.apply(this,arguments);};}
/* đi tới gần ranh giới (cùng vùng tính trước địa hình của dailuc.js) thì nhờ luồng phụ */
setInterval(()=>{try{if(!lpOn()||typeof DL!=='object'||!DL.on||typeof G!=='object'||!G.on||DL.busy||!S||!S.dl)return;const A=dlA(),h=A/2,mg=Math.min(2500,h*0.6);let dx=0,dz=0;
    if(P.x>h-mg)dx=A;else if(P.x<-h+mg)dx=-A;if(P.z>h-mg)dz=A;else if(P.z<-h+mg)dz=-A;if(!dx&&!dz)return;lpAsk(dx,dz);}catch(e){}},1000);
/* cây đá rải theo ô đại lục (phần nặng nhất của sinh cây đá): nhận bản luồng phụ đã rải. Chỉ nhận khi đúng tỉnh, đúng đầu vào và đúng điểm bắt đầu trong danh sách
   (luồng phụ rải sau đúng những bước như luồng chính, nên các món sinh trước đó trùng khớp từng món). */
function lpResCells(base){try{const r=LP.resRd;if(!r||!DL.busy||!r.RES||r.k!==DL.ox+','+DL.oz||r.resBase!==base||r.sig!==lpSig())return false;LP.resRd=null;
    for(const s of r.RES){const q=Object.assign({},s);q.i=RES.length;RES.push(q);const k=rKey(q.x,q.z);if(!RGRID.has(k))RGRID.set(k,[]);RGRID.get(k).push(q.i);}DL.resMade=r.RES.length;LP.usedRes=(LP.usedRes|0)+1;return true;}catch(e){return false;}}
/* SANG TỈNH (dựng lại tại chỗ): dùng lại đúng hình người chơi, bóng dưới chân, đèn cầm tay đang có (đổi sang cảnh mới), giữ nguyên hướng máy quay.
   Trước: mỗi lần sang tỉnh dựng lại cả hình người (~0,2 giây), tạo thêm một ảnh bóng mới (bộ nhớ đồ hoạ tăng dần) và xoay máy quay về một hướng cố định,
   nhìn như bị đưa sang chỗ khác. */
{const _pi=playerInit;playerInit=function(){try{if(G._reuse&&typeof DL==='object'&&DL.on&&P.model&&P.rig&&P.blob&&P.light&&S&&S.p){for(const o of [P.model,P.blob,P.light]){if(o.parent)o.parent.remove(o);G.sc.add(o);}
      P.x=S.p.x;P.z=S.p.z;P.y=groundY(P.x,P.z);LP.pReuse=(LP.pReuse|0)+1;return;}}catch(e){}return _pi.apply(this,arguments);};}
/* NGƯỜI LÀNG, NGƯỜI Ở TRẠI DÙNG CHUNG HÌNH theo (hạt giống, vai): dựng một hình mẫu rồi nhân bản khung xương dùng chung hình và chất liệu (cách chunghinh.js làm cho thú).
   Đo: mỗi người dựng mới 46–72 ms → làng ~0,57 giây, trại ~0,3 giây mỗi lần sang tỉnh. Người lính đổi màu áo chỉ khi áo là chất liệu riêng (quandoan.js) nên không ảnh hưởng. */
const LPV={proto:new Map(),bad:new Set(),n:0};
/* bọc thẳng hàm dựng người gốc (làng, trại cướp, thổ dân, lính gác của người khác đều gọi nó); bộ dựng hình nạp sau thư viện 3D nên chờ có rồi mới bọc */
function lpVillWrap(){try{if(!(window.SBM&&typeof SBM.villager==='function')||SBM.villager._lp||typeof chhClone!=='function')return;const _v=SBM.villager;
    const w=function(){try{const k=JSON.stringify([].slice.call(arguments));if(LPV.bad.has(k))return _v.apply(this,arguments);let p=LPV.proto.get(k);
        if(!p){p=_v.apply(this,arguments);if(!p||!p.isObject3D||!chhOk(p)){LPV.bad.add(k);return p;}if(LPV.proto.size>240)LPV.proto.clear();LPV.proto.set(k,p);}LPV.n++;return chhClone(p);}catch(e){return _v.apply(this,arguments);}};
    w._lp=1;SBM.villager=w;}catch(e){}}
setInterval(lpVillWrap,500);

/* ---------- HÌNH NGƯỜI, THÚ DỰNG SẴN ----------
   Luồng phụ báo tỉnh tới sẽ cần những hình nào (lời gọi dựng người SBM.villager, dựng thú animalModel). Trong lúc người chơi còn đi tới ranh giới,
   luồng chính dựng sẵn từng ít một (mỗi nhịp tối đa ~8 ms, không khựng) cất vào kho; sang tỉnh, mã sinh làng / trại / thú gọi dựng hình thì lấy ngay từ kho.
   Hình trong kho là hình mới tinh chưa ai dùng, dựng bằng đúng hàm của game, nên giống hệt dựng tại chỗ. Người ở trại vốn chọn ngẫu nhiên một trong
   90 kiểu (hạt giống 900–989): kho gom chung một ngăn cho cả khoảng đó. */
const LPP={pool:new Map(),todo:[],n:0,hit:0,miss:0,T:null};
const lpPKey=(t,a)=>{try{if(t==='v'){const b=a.slice();if(typeof b[0]==='number'&&b[0]>=900&&b[0]<990)b[0]='rnd';return 'v'+JSON.stringify(b);}return 'a'+JSON.stringify(a);}catch(e){return null;}};
function lpPoolPlan(pred){const need=new Map();for(const [t,a] of pred){const k=lpPKey(t,a);if(!k)continue;const e=need.get(k)||{t,a,n:0};e.n++;need.set(k,e);}
  /* kho chỉ giữ đồ cho lần sang tỉnh sắp tới */for(const [k,L] of LPP.pool)if(!need.has(k))LPP.pool.delete(k);LPP.todo=[];
  for(const [k,e] of need){const have=(LPP.pool.get(k)||[]).length;for(let i=have;i<e.n;i++)LPP.todo.push([k,e.t,e.a]);}lpPoolRun();}
function lpPoolRun(){clearTimeout(LPP.T);const step=()=>{try{if(!LPP.todo.length)return;if(typeof DL==='object'&&DL.busy){LPP.T=setTimeout(step,200);return;}const t0=performance.now();
      while(LPP.todo.length&&performance.now()-t0<8){const [k,t,a]=LPP.todo.shift();let o=null;try{o=t==='v'?(window.SBM&&SBM.villager?LPP.rawV.apply(null,a):null):LPP.rawA.apply(null,a);}catch(e){}
        if(o&&o.isObject3D){if(!LPP.pool.has(k))LPP.pool.set(k,[]);LPP.pool.get(k).push(o);LPP.n++;}}if(LPP.todo.length)LPP.T=setTimeout(step,45);}catch(e){}};LPP.T=setTimeout(step,45);}
function lpPoolTake(t,a){const k=lpPKey(t,a),L=k&&LPP.pool.get(k);if(L&&L.length){LPP.hit++;return L.pop();}return null;}
{const _am=animalModel;LPP.rawA=function(){return _am.apply(this,arguments);};animalModel=function(){const o=lpPoolTake('a',[].slice.call(arguments));if(o)return o;LPP.miss++;return _am.apply(this,arguments);};}
/* người: bọc sau lớp "chung hình" (lpVillWrap) để kho chứa hình đã nhân bản sẵn */
setInterval(()=>{try{if(!(window.SBM&&typeof SBM.villager==='function')||SBM.villager._lpp||!SBM.villager._lp)return;const _v=SBM.villager;LPP.rawV=function(){return _v.apply(this,arguments);};
    const w=function(){const o=lpPoolTake('v',[].slice.call(arguments));if(o)return o;LPP.miss++;return _v.apply(this,arguments);};w._lp=1;w._lpp=1;SBM.villager=w;}catch(e){}},500);
/* vành đất xa quanh vùng nạp: luồng phụ đã tính sẵn (độ cao, màu, pháp tuyến) thì nhận lại */
function lpRingTake(){try{const r=LP.ringRd;if(!r||!DL.busy||r.k!==DL.ox+','+DL.oz)return null;LP.ringRd=null;LP.usedRing=(LP.usedRing|0)+1;return r;}catch(e){return null;}}
/* ảnh độ sâu nước (biển, sông): dữ liệu luồng phụ đã tính từ đúng lưới độ cao này */
if(typeof t3DepthTex==='function'){const _dt=t3DepthTex;t3DepthTex=function(){try{const r=LP.depRd;if(r&&DL.busy&&r.k===DL.ox+','+DL.oz&&r.d.length===HN*HN*4){LP.depRd=null;const T=THREE,t=new T.DataTexture(r.d,HN,HN,T.RGBAFormat,T.UnsignedByteType);
      t.wrapS=t.wrapT=T.ClampToEdgeWrapping;t.magFilter=t.minFilter=T.LinearFilter;t.generateMipmaps=false;t.needsUpdate=true;LP.usedDep=(LP.usedDep|0)+1;return t;}}catch(e){}return _dt.apply(this,arguments);};}
