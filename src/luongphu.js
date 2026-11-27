/* ===================== LUỒNG PHỤ: TÍNH SẴN TỈNH KẾ BÊN (đại lục liền mạch, đợt 1) =====================
   Trước: qua ranh giới tỉnh, luồng chính phải tính lại độ cao, mực nước, sinh cảnh, màu đất của cả vùng nạp (~1 giây đứng hình trên máy thử).
   Giờ: đi tới gần ranh giới thì một LUỒNG PHỤ (Web Worker) chạy CHÍNH mã game này, tính sẵn các mảng đó cho tỉnh phía trước, song song với lúc chơi;
   qua ranh giới thì luồng chính nhận lại kết quả thay vì tự tính. Chạy thử so từng điểm: kết quả giống hệt (0 điểm khác trên 333 nghìn điểm).
   An toàn: chỉ dùng khi đúng tỉnh và đúng dữ liệu đầu vào (san nền, đào hố, nền của người khác) như lúc luồng phụ tính; sai lệch gì thì tự tính như cũ.
   Luồng phụ tự tắt sau mỗi lần tính để không giữ thêm bộ nhớ. Tắt hẳn: localStorage 'ld-lp' = '0'. */
const LP={w:null,busy:0,ready:null,k:null,err:0,used:0,miss:'',t0:0,ms:0};
function lpOn(){try{if(typeof Worker==='undefined'||typeof Blob==='undefined'||self.__LP)return false;if(localStorage.getItem('ld-lp')==='0')return false;return LP.err<3;}catch(e){return false;}}
/* dữ liệu đầu vào ngoài toạ độ tỉnh mà các bước tính dùng tới */
function lpSig(){try{return JSON.stringify([S.seed,S.seed0||0,S.wv||0,S.flat||[],S.dig||[],S.tun||[],(typeof DB==='object'&&DB&&DB.flats)||[],(typeof DAO==='object'&&DAO&&DAO.rdig)||[]]);}catch(e){return 'x'+Math.random();}}
/* phần giả cho luồng phụ: không có trang, không có bộ nhớ trình duyệt; mọi thứ giao diện trả về một vật "gì cũng được" */
const LP_PRE=`(()=>{const mk=()=>{const f=function(){};const px=new Proxy(f,{get(t,k){if(k===Symbol.toPrimitive)return ()=>0;if(k==='then')return undefined;if(k===Symbol.iterator)return function*(){};if(k==='length')return 0;return px;},apply(){return px;},construct(){return px;},set(){return true;},has(){return true;}});return px;};
  const any=mk();self.window=self;self.document=any;self.localStorage=self.sessionStorage=(()=>{const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),clear:()=>m.clear(),key:i=>[...m.keys()][i],get length(){return m.size;}};})();
  self.innerWidth=390;self.innerHeight=844;self.devicePixelRatio=1;self.requestAnimationFrame=()=>0;self.cancelAnimationFrame=()=>0;self.matchMedia=()=>({matches:false,addEventListener(){}});self.alert=self.confirm=()=>false;self.getComputedStyle=()=>any;self.screen={width:390,height:844};
  self.HTMLElement=self.Element=self.Node=function(){};self.Image=function(){return any;};self.__LP=1;
  importScripts(self.__TURL);if(THREE.ColorManagement)THREE.ColorManagement.legacyMode=false;/* như K3init trên luồng chính: màu tuyến tính */
  self.onmessage=e=>{const d=e.data,o={id:d.id};try{S=JSON.parse(d.S);P.x=d.px;P.z=d.pz;try{DB.flats=d.dbf;}catch(er){}try{DAO.rdig=d.rdig;}catch(er){}
      G.on=false;worldCfg(3);/* nạp hạt giống đại lục trước (dlSeedAt cần) */dlMoveState(d.dx,d.dz);worldCfg(3);o.k=S.dl.ox+','+S.dl.oz;o.sig=lpSig();
      noiseInit(S.seed);heightsBuild();o.HG=HG.slice(0);o.WG=WG.slice(0);o.ZG=W4.ZG?W4.ZG.slice(0):null;o.ZK=W4.ZK?W4.ZK.slice(0):null;
      biomeGridBuild();o.BG=BG.slice(0);regionsBuild();trailsBuild();decorPlan();caveFlatten();biomeGridBuild();terrainColors();
      o.TCOL=TCOL;o.TNRM=TNRM;o.TSPL=TSPL;o.T3={brooks:T3.brooks,BW:T3.BW,BD:T3.BD,TQ:T3.TQ};}catch(er){o.err=String(er&&er.message||er)+' @ '+String(er&&er.stack||'').split('\\n').slice(1,3).join(' | ');}
    const tr=[];for(const k of ['HG','WG','ZG','ZK','BG','TCOL','TNRM','TSPL'])if(o[k]&&o[k].buffer)tr.push(o[k].buffer);if(o.T3)for(const k of ['BW','BD','TQ'])if(o.T3[k]&&o.T3[k].buffer)tr.push(o.T3[k].buffer);postMessage(o,tr);};})();`;
function lpCode(){if(LP.code)return LP.code;let main='';try{main=[...document.scripts].filter(s=>!s.src).map(s=>s.textContent).sort((a,b)=>b.length-a.length)[0]||'';}catch(e){}
  if(main.length<100000)return null;let turl=TURLS[0];try{const s=[...document.scripts].find(s=>/three(\.min)?\.js/.test(s.src||''));if(s)turl=s.src;}catch(e){}
  LP.code=URL.createObjectURL(new Blob(['self.__TURL='+JSON.stringify(turl)+';\n'+LP_PRE+'\n'+main],{type:'text/javascript'}));return LP.code;}
function lpStop(){try{if(LP.w)LP.w.terminate();}catch(e){}LP.w=null;LP.busy=0;}
/* nhờ luồng phụ tính tỉnh lệch (dx,dz) so với tỉnh đang đứng */
function lpAsk(dx,dz){if(!lpOn()||LP.busy||!DL.on||!S||!S.dl)return;const k=(S.dl.ox+dx)+','+(S.dl.oz+dz);if(LP.k===k&&LP.ready)return;const url=lpCode();if(!url){LP.err=9;return;}
  LP.busy=1;LP.k=k;LP.ready=null;LP.t0=performance.now();const id=(LP.id=(LP.id|0)+1);
  try{LP.w=new Worker(url);LP.w.onerror=ev=>{LP.err++;LP.miss='luồng phụ lỗi: '+(ev&&ev.message||'');lpStop();};
    LP.w.onmessage=ev=>{const r=ev.data;lpStop();if(r.id!==id)return;if(r.err){LP.err++;LP.miss='luồng phụ: '+r.err;return;}LP.ms=Math.round(performance.now()-LP.t0);LP.ready=r;};
    let s='';try{s=typeof ldPack==='function'?ldPack(S):JSON.stringify(S,(k,v)=>k&&k[0]==='_'?undefined:v);}catch(e){}
    LP.w.postMessage({id,S:s,px:P.x,pz:P.z,dx,dz,dbf:(typeof DB==='object'&&DB&&DB.flats)||[],rdig:(typeof DAO==='object'&&DAO&&DAO.rdig)||[]});}catch(e){LP.err++;LP.miss='không mở được luồng phụ: '+e.message;lpStop();}}
/* lúc dựng lại vùng khi sang tỉnh (DL.busy): kết quả có sẵn, đúng tỉnh, đúng đầu vào thì dùng */
function lpTake(part){try{if(!DL.on||!DL.busy)return null;const r=LP.ready;if(!r)return null;if(r.k!==DL.ox+','+DL.oz){LP.miss='khác tỉnh';return null;}const sg=lpSig();if(r.sig!==sg){let i=0;while(i<sg.length&&sg[i]===r.sig[i])i++;LP.miss='đầu vào đã đổi @'+i+': '+r.sig.slice(Math.max(0,i-60),i+40)+' ≠ '+sg.slice(Math.max(0,i-60),i+40);LP.ready=null;return null;}if(!r[part])return null;return r;}catch(e){return null;}}
{const _hb=heightsBuild;heightsBuild=function(){const r=lpTake('HG');if(r){riversSurface();HG=r.HG;WG=r.WG;try{if(typeof W4==='object'){W4.ZG=r.ZG;W4.ZK=r.ZK;}}catch(e){}r.HG=null;LP.used++;return;}return _hb.apply(this,arguments);};}
{const _bg=biomeGridBuild;biomeGridBuild=function(){const r=lpTake('BG');if(r){BG=r.BG;DL.bgKey=DL.ox+','+DL.oz+':'+(DL.bgN|0);r.BG=null;return;}return _bg.apply(this,arguments);};}
{const _tc=terrainColors;terrainColors=function(){const r=lpTake('TCOL');if(r){TGX=DL.ox;TGZ=DL.oz;TCOL=r.TCOL;TNRM=r.TNRM;TSPL=r.TSPL;try{Object.assign(T3,r.T3);}catch(e){}LP.ready=null;return;}return _tc.apply(this,arguments);};}
/* đi tới gần ranh giới (cùng vùng tính trước địa hình của dailuc.js) thì nhờ luồng phụ */
setInterval(()=>{try{if(!lpOn()||typeof DL!=='object'||!DL.on||typeof G!=='object'||!G.on||DL.busy||!S||!S.dl)return;const A=dlA(),h=A/2,mg=Math.min(2500,h*0.6);let dx=0,dz=0;
    if(P.x>h-mg)dx=A;else if(P.x<-h+mg)dx=-A;if(P.z>h-mg)dz=A;else if(P.z<-h+mg)dz=-A;if(!dx&&!dz)return;lpAsk(dx,dz);}catch(e){}},1000);
