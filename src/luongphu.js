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
  self.HTMLElement=self.Element=self.Node=function(){};self.Image=function(){return any;};self.__LP=1;
  importScripts(self.__TURL);if(THREE.ColorManagement)THREE.ColorManagement.legacyMode=false;/* như K3init trên luồng chính: màu tuyến tính */
  self.onmessage=e=>{const d=e.data,o={id:d.id};try{S=JSON.parse(d.S);P.x=d.px;P.z=d.pz;try{DB.flats=d.dbf;}catch(er){}try{DAO.rdig=d.rdig;}catch(er){}
      G.on=false;worldCfg(3);/* nạp hạt giống đại lục trước (dlSeedAt cần) */dlMoveState(d.dx,d.dz);worldCfg(3);o.k=S.dl.ox+','+S.dl.oz;o.sig=lpSig();
      noiseInit(S.seed);heightsBuild();o.HG=HG.slice(0);o.WG=WG.slice(0);o.ZG=W4.ZG?W4.ZG.slice(0):null;o.ZK=W4.ZK?W4.ZK.slice(0):null;
      biomeGridBuild();o.BG=BG.slice(0);regionsBuild();trailsBuild();decorPlan();caveFlatten();biomeGridBuild();terrainColors();
      o.TCOL=TCOL;o.TNRM=TNRM;o.TSPL=TSPL;o.T3={brooks:T3.brooks,BW:T3.BW,BD:T3.BD,TQ:T3.TQ};self.__LPRES=null;try{resGen(S.seed);}catch(er){}o.RES=self.__LPRES;o.resBase=DL.resBase;}catch(er){o.err=String(er&&er.message||er)+' @ '+String(er&&er.stack||'').split('\\n').slice(1,3).join(' | ');}
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
{const _tc=terrainColors;terrainColors=function(){const r=lpTake('TCOL');if(r){TGX=DL.ox;TGZ=DL.oz;TCOL=r.TCOL;TNRM=r.TNRM;TSPL=r.TSPL;try{Object.assign(T3,r.T3);}catch(e){}LP.resRd={k:r.k,sig:r.sig,RES:r.RES,resBase:r.resBase};LP.ready=null;return;}return _tc.apply(this,arguments);};}
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
