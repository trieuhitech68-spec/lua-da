/* ===================== LÕI GAME: TRẠNG THÁI, CẢNH 3D, NHÂN VẬT, THU THẬP, CHẾ TẠO, XÂY DỰNG ===================== */
const SKEY='lua-da-tay-trang-v1',HOTN=6,INVN=36,REACH=26,DAY_SEC=720;// nhịp sinh hoạt: 12 phút thật = 1 "ngày công" (đói khát, cây lớn, củi cháy). Giờ và mùa trên trời theo giờ thật Việt Nam (clock.js)
let S=null;const G={on:false,t:0,keys:{},joy:{x:0,y:0,on:false},yaw:0.6,pitch:0.98,zoom:380,act:null,walkTo:null,build:null,panel:null,fx:[],flames:[],lights:[],lastSave:0,q:2,runBtn:false};
const $=s=>document.querySelector(s);const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const TNOW=()=>S.tn!=null?S.tn:S.day+S.hour/24;// S.tn: đồng hồ sinh hoạt riêng (clock.js), luôn chỉ tăng
/* ---------- lưu / tải ---------- */
function save(){if(!S||!G.on&&!S._new)return;try{if(G.on){S.p.x=+P.x.toFixed(1);S.p.z=+P.z.toFixed(1);S.p.ry=+P.ry.toFixed(2);}localStorage.setItem(SKEY,JSON.stringify(S,(k,v)=>k&&k[0]==='_'?undefined:v));}catch(e){}}
function loadSave(){try{const t=localStorage.getItem(SKEY);if(!t)return null;const o=JSON.parse(t);if(!o||o.v!==1)return null;return fixSave(o);}catch(e){return null;}}
function fixSave(o){o.p=Object.assign({hp:100,food:75,water:80,stam:100,warm:70,wet:0},o.p||{});['res','cnt','seen','sk','store','crops','st','wear','known','buff','fuel','tank'].forEach(k=>{if(!o[k]||typeof o[k]!=='object')o[k]={};});
  if(!Array.isArray(o.inv))o.inv=Array(INVN).fill(null);while(o.inv.length<INVN)o.inv.push(null);if(!Array.isArray(o.builds))o.builds=[];o.age=o.age||0;if(o.wv!==2){o.res={};o.wv=2;}return o;}
function newGame(o){S=fixSave({v:1,seed:o.seed||((Math.random()*2e9)|0)+1,name:(o.name||'Lửa').slice(0,16),look:o.look||0,mode:o.mode||'cozy',day:1,hour:7.2,
  p:{x:SPAWN[0],z:SPAWN[1],ry:0.4,hp:100,food:75,water:80,stam:100,warm:70,wet:0},inv:Array(INVN).fill(null),sel:0,builds:[],bseq:1,goal:0,age:0});S._new=1;save();delete S._new;}
/* ---------- túi đồ (có tính cả giỏ/rương gần đó khi chế tạo, xây dựng) ---------- */
const maxStack=id=>ITEMS[id]&&(ITEMS[id].t==='tool'||ITEMS[id].t==='wear')?1:STACK;
function invCount(id){let n=0;for(const s of S.inv)if(s&&s.id===id)n+=s.n;return n;}
function nearStores(){const out=[];if(!G.on)return out;for(const b of S.builds){const d=pieceDef(b.k);if(d&&d.store&&S.store[b.id]&&Math.hypot(b.x-P.x,b.z-P.z)<320)out.push(S.store[b.id]);}return out;}
function haveCount(id){let n=invCount(id);for(const st of nearStores())for(const s of st)if(s&&s.id===id)n+=s.n;return n;}
function invFits(id,n){const mx=maxStack(id);let room=0;for(const s of S.inv){if(!s)room+=mx;else if(s.id===id)room+=mx-s.n;if(room>=n)return true;}return room>=n;}
function slotsAdd(arr,id,n){const mx=maxStack(id);for(const s of arr){if(n<=0)break;if(s&&s.id===id&&s.n<mx){const k=Math.min(n,mx-s.n);s.n+=k;n-=k;}}for(let i=0;i<arr.length&&n>0;i++){if(!arr[i]){const k=Math.min(n,mx);arr[i]={id,n:k};n-=k;}}return n;}
function invAdd(id,n){const left=slotsAdd(S.inv,id,n);if(!S.seen[id]){S.seen[id]=1;unlockCheck();}return left;}
function slotsTake(arr,id,n){for(let i=arr.length-1;i>=0&&n>0;i--){const s=arr[i];if(s&&s.id===id){const k=Math.min(n,s.n);s.n-=k;n-=k;if(!s.n)arr[i]=null;}}return n;}
function invTake(id,n){return slotsTake(S.inv,id,n)<=0;}
function canPay(c){for(const k in c)if(haveCount(k)<c[k])return false;return true;}
function pay(c){for(const k in c){let n=slotsTake(S.inv,k,c[k]);for(const st of nearStores()){if(n<=0)break;n=slotsTake(st,k,n);}}}
function give(o,src){const lost={};let any=0;for(const k in o){const n=o[k];if(n<=0)continue;const left=invAdd(k,n);if(left)lost[k]=left;if(n-left>0){any=1;cnt('get',k,n-left);uiFly(k,n-left,src);}}
  if(Object.keys(lost).length)uiToast('Túi đầy! Cất bớt đồ vào giỏ hoặc rương.','bad');return any;}
/* ---------- đếm, mục tiêu, kỹ năng, mở khóa, thời đại ---------- */
function cnt(t,k,n){const key=t+':'+k;S.cnt[key]=(S.cnt[key]||0)+(n||1);S.day_=S.day_||{};S.day_[key]=(S.day_[key]||0)+(n||1);goalCheck();}
function goalProg(g){const [t,k,n]=g.c;const v=S.cnt[t+':'+k]||0;return [Math.min(v,n),n];}
function goalCheck(){let moved=false;while(S.goal<GOALS.length){const [v,n]=goalProg(GOALS[S.goal]);if(v<n)break;const g=GOALS[S.goal];S.goal++;moved=true;uiToast('✔ Hoàn thành: '+g.t,'good');sfx('level');}
  while(S.age<AGES.length-1&&AGES[S.age+1].ok()){S.age++;uiAge(S.age);}if(moved)uiHud(true);}
const skLv=k=>Math.floor(Math.sqrt((S.sk[k]||0)/12));
function addXp(k,n){if(!SKILL[k])return;const a=skLv(k);S.sk[k]=(S.sk[k]||0)+n;const b=skLv(k);if(b>a){uiToast(`📈 ${SKILL[k]} lên cấp ${b}: ${skillPerk(k)}`,'gold');sfx('level');unlockCheck();}}
function skillPerk(k){return {chop:'chặt nhanh và khỏe hơn',mine:'đập đá nhanh hơn',gather:'hái được nhiều hơn',herb:'nhận ra thêm thảo dược và bài thuốc',craft:'nghĩ ra công cụ mới',build:'xây được công trình lớn hơn',cook:'nấu ăn thơm ngon hơn',farm:'thu hoạch nhiều hơn',hunt:'đâm chuẩn và mạnh hơn',run:'chạy lâu, khỏe hơn'}[k]||'';}
function lvOk(lv){if(!lv)return true;for(const k in lv)if(skLv(k)<lv[k])return false;return true;}
function lvText(lv){return Object.entries(lv||{}).map(([k,v])=>`${SKILL[k]} cấp ${v}`).join(', ');}
function recipeKnown(r){return (r.req||[]).every(k=>S.seen[k]);}
function buildKnown(b){return (b.req||[]).every(k=>S.seen[k])&&(!b.need||(S.cnt['build:'+b.need]||0)>0);}
function unlockCheck(){if(!S)return;const fresh=[];RECIPES.forEach(r=>{if(!S.known['r:'+r.id]&&recipeKnown(r)&&lvOk(r.lv)){S.known['r:'+r.id]=1;fresh.push(ITEMS[Object.keys(r.out)[0]].n);}});
  BUILD.forEach(b=>{if(!S.known['b:'+b.id]&&buildKnown(b)&&lvOk(b.lv)){S.known['b:'+b.id]=1;fresh.push(b.n);}});
  if(fresh.length&&G.on){uiToast('💡 Học được cách làm: '+fresh.slice(0,3).join(', ')+(fresh.length>3?'…':''),'idea');sfx('idea');}}
/* ---------- cảnh 3D ---------- */
const P={x:0,z:0,y:0,vy:0,air:false,ry:0,speed:0,model:null,rig:null,tool:null,toolId:null,anim:'idle',hurtT:0};
function sceneInit(){const T=THREE,cv=document.createElement('canvas');cv.id='gl';$('#game').prepend(cv);const mob=Math.min(innerWidth,innerHeight)<600;
  startQ();const R=new T.WebGLRenderer({canvas:cv,antialias:(devicePixelRatio||1)<1.5&&G.q>0,powerPreference:'high-performance'});R.outputEncoding=T.sRGBEncoding;R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;G.R=R;
  cv.addEventListener('webglcontextlost',e=>{e.preventDefault();G.lost=true;try{localStorage.setItem('ldtt-lost',String((+localStorage.getItem('ldtt-lost')||0)+1));}catch(_){}save();uiError('Thiết bị tạm dừng đồ họa. Tải lại trang để chơi tiếp (đã lưu).');},false);
  const sc=new T.Scene();G.sc=sc;G.L=K3.lights(sc,0,R,{size:mob?380:520,fogNear:1500,fogFar:4400,shadowMap:mob?1536:2048,sky:true});G.sky=sc.children.find(o=>o.userData&&o.userData.sky);
  const sh=G.L.sun.shadow.camera;sh.near=10;sh.far=2600;G.moon=new T.DirectionalLight(0x8aa6ff,0);sc.add(G.moon);sc.add(G.moon.target);
  G.cam=new T.PerspectiveCamera(40,1,4,3000);resize();
  noiseInit(S.seed);heightsBuild();biomeGridBuild();regionsBuild();trailsBuild();decorPlan();caveFlatten();biomeGridBuild();MAPIMG=null;G.terrain=terrainMesh();sc.add(G.terrain);G.water=waterMesh();G.water.material.userData.noSea=1;sc.add(G.water);
  resGen(S.seed);resInstances();decorBuild();structInit();playerInit();animalsInit();plantsInit();petsInit();villageInit();campInit();villageGrow();folkInit();boatsInit();applyQ();fpInit();/* góc nhìn mặc định: từ trên cao (dễ hình dung hơn cho người mới). Nhân vật cũ được chuyển một lần, sau đó chọn gì giữ nấy */if(S.vdef!==2){const had=S.view==='fp'&&S.day>1;S.view='tp';S.vdef=2;if(had)setTimeout(()=>{try{uiToast('🎥 Góc nhìn mặc định giờ là từ trên cao. Muốn nhìn qua mắt nhân vật: mở ⚙️ Cài đặt hoặc bấm phím V.','');}catch(e){}},6000);}if(S.view==null)S.view='tp';if(G.fpitch==null)G.fpitch=-0.12;viewApply();seasonPatchAll();resSeasonal();G.on=true;}
function grassInit(mob){const T=THREE;try{const R2=rng(S.seed+9),pts=[];for(let i=0;i<(mob?2600:5200);i++){const a=R2()*6.283,rr=Math.sqrt(R2())*WR*0.92,x=Math.cos(a)*rr,z=Math.sin(a)*rr,b=biome(x,z);if(b==='water'||b==='beach'||b==='rock'||b==='peak')continue;if(R2()<(b==='forest'?0.45:0.1))continue;
    const c=new T.Color(b==='forest'?'#5a8a3a':b==='meadow'?'#93bf55':'#7aac48').multiplyScalar(0.85+R2()*0.35);pts.push({x,z,s:0.7+R2()*0.8,c,y:hAt(x,z)});}
  const tf=K3.fx&&K3.fx.tufts(pts,{h:10});if(tf){const M=new T.Matrix4(),Q=new T.Quaternion(),V=new T.Vector3(),SC=new T.Vector3(),UP=new T.Vector3(0,1,0);pts.forEach((p,i)=>{Q.setFromAxisAngle(UP,i*2.4);V.set(p.x,p.y-0.5,p.z);SC.set(p.s,p.s,p.s);M.compose(V,Q,SC);tf.setMatrixAt(i,M);});tf.instanceMatrix.needsUpdate=true;G.sc.add(tf);G.grass=tf;}}catch(e){console.warn('cỏ',e);}}
function resize(){if(!G.R)return;const w=innerWidth,h=innerHeight,d=Math.max(0.5,Math.min(devicePixelRatio||1,[1.3,1.6,2][G.q|0])*(G.prK||1));
  // chỉ đặt lại bộ đệm vẽ khi kích thước thật sự đổi (setSize luôn cấp phát lại bộ đệm → giật hình trên điện thoại)
  const key=w+'x'+h+'@'+d.toFixed(3);if(G._rsK!==key){G._rsK=key;G.R.setPixelRatio(d);G.R.setSize(w,h,false);}G.cam.aspect=w/h;G.cam.fov=isFP()?(w<h?78:64):(w<h?54:40);G.cam.updateProjectionMatrix();}
/* ---------- mô hình (có dự phòng khi thư viện mô hình chưa có) ---------- */
function model(spec){const L=window.SBM&&SBM.list;if(L&&((spec[0]==='piece'&&L.pieces&&!L.pieces.includes(spec[1]))||(spec[0]==='item'&&L.items&&!L.items.includes(spec[1]))||(spec[0]==='tool'&&L.tools&&!L.tools.includes(spec[1]))))return stubModel(spec);let fn=window.SBM&&SBM[spec[0]];let g=null;try{if(fn)g=fn.apply(SBM,spec.slice(1));}catch(e){console.warn('mô hình',spec.join('|'),e);}return g||stubModel(spec);}
function stubModel(spec){const K=K3,k=spec[0],a=spec[1];
  if(k==='bamboo'){const g=K.group();for(let i=0;i<9;i++){const an=i*2.4,r=4+(i%3)*4,h=150+(i*37)%90;g.add(K.cyl(1.4,1.8,h,'#7a9a3a',{x:Math.cos(an)*r,z:Math.sin(an)*r,rz:Math.cos(an)*0.12,rx:Math.sin(an)*0.12}));g.add(K.ico(14,'#6a9a3a',{x:Math.cos(an)*(r+10),y:h-10,z:Math.sin(an)*(r+10),sy:0.6},1,0.3,i));}return g;}
  if(k==='banana')return K.group(K.cyl(3,4,50,'#7a8a4a'),K.ico(30,'#5aa040',{y:62,sy:0.55},1,0.35,3));
  if(k==='palm')return K.group(K.cyl(3.5,5,170,'#8a7458',{rz:0.12}),K.ico(42,'#4f8a3a',{x:-18,y:170,sy:0.35},1,0.4,5));
  if(k==='savannaTree')return K.group(K.cyl(4,6,90,'#7a6048',{rz:0.1}),K.ico(55,'#7a9a3a',{x:6,y:100,sy:0.28},1,0.3,7));
  if(k==='deadLog')return K.group(K.cyl(6,7,80,'#6a5440',{rz:Math.PI/2,y:6}));if(k==='reedBed')return K.group(K.cone(14,36,'#a8a050',{},6));if(k==='scree')return K.group(K.ico(9,'rock',{sy:0.4},1,0.35,5),K.ico(5,'rock',{x:9,sy:0.5},1,0.35,6));
  if(k==='cliffRock')return K.group(K.ico(20*(a||1),'rock',{y:10*(a||1),sx:1.3,sy:1.1},1,0.35,a||1));
  if(k==='fern')return K.group(K.ico(10,'#4f8a34',{y:5,sy:0.5},1,0.4,2));
  if(k==='lotus')return K.group(K.cyl(9,9,0.6,'#4f8a3a',{y:0.3}),K.cyl(6,6,0.6,'#5a9a40',{x:12,z:4,y:0.3}),K.ico(3,'#f08ab0',{y:8}));
  if(k==='tallgrass')return K.group(K.cone(7,32,'#a8a85a',{},5));
  if(k==='pathStone')return K.group(K.ico(5,'rock',{y:0.5,sy:0.35},1,0.3,4));
  if(k==='piece'&&a==='carveBench')return K.group(K.cyl(15,17,26,'wood'),K.cyl(15,15,1,'#d8b884',{y:26}),K.box(3,2,14,'#8a8478',{x:5,y:28}),K.cyl(1,1,12,'dwood',{x:-6,y:27,rz:1.4}));
  if(k==='piece'&&a==='statue')return K.group(K.box(16,4,16,'rock'),K.cyl(5,6,34,'wood',{y:4}),K.ico(7,'wood',{y:42}));
  if(k==='piece'&&a==='postDeco')return K.group(K.cyl(5,5.5,70,'#7a5a3a'),K.ico(8,'#8a6a44',{y:74,sy:0.6}),K.box(18,3,4,'#7a5a3a',{y:62}));
  if(k==='tree'){if(a==='pine')return K.group(K.cyl(4,6,40,'dwood'),K.cone(30,70,'dleaf',{y:30},7),K.cone(24,60,'dleaf',{y:70},7),K.cone(16,46,'dleaf',{y:110},7));
    if(a==='birch')return K.group(K.cyl(3,4.5,90,'#e8e4dc'),K.ico(30,'leaf',{y:110,sy:1.2},1,0.25,3));if(a==='dead')return K.group(K.cyl(3,6,110,'#6a5a48'),K.cyl(1.5,2.5,40,'#6a5a48',{y:60,rz:0.8}));
    const s=spec[2]===0?0.2:spec[2]===1?0.55:1;return K.group(K.cyl(4*s,7*s,60*s,'wood'),K.ico(46*s,'leaf',{y:90*s,sy:0.8},1,0.3,5),K.ico(30*s,'leaf',{x:24*s,y:76*s},1,0.3,6));}
  if(k==='stump')return K.group(K.cyl(6,7,10,'wood'),K.cyl(6,6,0.6,'#d8b884',{y:10}));
  if(k==='log')return K.group(K.cyl(6,6,70,'wood',{rz:Math.PI/2,y:6,center:1}));
  if(k==='bush')return K.group(K.ico(12,a==='shrub'?'dleaf':'leaf',{y:10,sy:0.8},1,0.25,2),...(a==='berry'?[K.ico(3,'#c0392b',{x:6,y:14,z:8}),K.ico(3,'#c0392b',{x:-7,y:12,z:7}),K.ico(3,'#c0392b',{x:2,y:17,z:-8})]:[]));
  if(k==='flax'||k==='reeds')return K.group(K.cone(5,22,k==='flax'?'#6aa04a':'#8a9a4a',{},5),K.ico(2,'#5a8ad8',{y:22}));
  if(k==='herb')return K.group(K.cone(5,14,{mugwort:'#9aaa8a',ginger:'#5a9a3a',turmeric:'#4a8a2a',centella:'#5aaa3a',mint:'#6ac04a',aloe:'#7aa86a'}[a]||'#6a9a4a',{},5));
  if(k==='flower')return K.group(K.cone(3,8,'#5a8a3a',{},4),K.ico(2.5,{red:'#d83a3a',yellow:'#f2c230',white:'#f4f2ea',purple:'#9a5ad8'}[a]||'#fff',{y:8}));
  if(k==='beehive')return K.group(K.cyl(5,7,22,'wood'),K.ico(7,'#c9a25a',{y:26,sy:1.2}));
  if(k==='crop')return K.group(K.cone(6,10+(spec[2]||0)*4,a==='grain'?((spec[2]||0)>=3?'#d8b04a':'#7aa04a'):'#6aa04a',{},5));
  if(k==='boulder')return K.group(K.ico(10+(a||1)*8,'rock',{y:(10+(a||1)*8)*0.6,sy:0.75},1,0.3,7));
  if(k==='flintRock')return K.group(K.ico(13,'#3a4658',{y:9,sy:0.75},1,0.3,8));
  if(k==='copperRock')return K.group(K.ico(15,'#6a7a6a',{y:10,sy:0.75},1,0.3,9));
  if(k==='clay')return K.group(K.cyl(16,17,5,'#a8583a'));
  if(k==='mushroom')return K.group(K.cyl(1,1,5,'#efe6d4'),K.dome(4,a==='red'?'#c0392b':'#8a5a3a',{y:5}));
  if(k==='pebble')return K.group(K.ico(3,'stone',{y:2},0,0.3,1),K.ico(2,'stone',{x:4,y:1.5},0,0.3,2));
  if(k==='stick')return K.group(K.cyl(0.9,1.1,18,'dwood',{rz:Math.PI/2,y:1.2,center:1}));
  if(k==='bones')return K.group(K.cyl(1,1,12,'bone',{rz:Math.PI/2,y:1.2,center:1}),K.ico(3,'bone',{x:6,y:2.5}));
  if(k==='piece'){const id=a;if(id==='floor'||id==='stoneFloor')return K.group(K.box(40,6,40,id==='floor'?'wood':'stone'));
    if(/wall|Wall/.test(id))return K.group(K.box(40,48,4,/stone/.test(id)?'brick':'logs'));if(id==='fence'||id==='gate')return K.group(K.box(40,20,2,'dwood'));
    if(id==='roof')return K.group(K.box(44,4,48,'thatch',{y:63,rx:-0.64}));if(id==='roofCap')return K.group(K.cone(32,30,'thatch',{y:48},4));
    if(id==='campfire'||id==='campfireOff'){const g=K.group(K.torus(10,2.5,'stone',{rx:Math.PI/2,y:2},10),K.cyl(1.5,1.5,16,'dwood',{rz:1.2,y:3}));if(id==='campfire'){const f=K.group(K.cone(5,14,'fire',{mo:{ei:1.6}},6));f.name='flame';g.add(f);}return g;}
    if(id==='torch'){const g=K.group(K.cyl(1.2,1.6,40,'dwood'));const f=K.group(K.cone(3,8,'fire',{y:40,mo:{ei:1.6}},6));f.name='flame';g.add(f);return g;}
    if(id==='bed')return K.group(K.box(30,8,70,'#c9a25a'));if(id==='leanto')return K.group(K.box(36,4,70,'thatch',{y:20,rx:0.9}));if(id==='tent')return K.group(K.cone(40,60,'hide',{},6));
    if(id==='farm')return K.group(K.box(38,3,38,'soil'));if(id==='workbench')return K.group(K.box(34,18,22,'wood'));if(id==='basket'||id==='chest')return K.group(K.cyl(8,7,14,'#c2a85e'));
    return K.group(K.box(30,24,30,'stone'));}
  if(k==='tool'||k==='item')return K.group(K.cyl(1,1,22,'dwood'),K.box(8,6,3,'stone',{y:20}));
  if(k==='piece'){const d=pieceDef(a)||{};const wood=/bamboo|ladder|railing/.test(a)?'#9aa060':/mud/.test(a)?'#8a6a48':'wood';if(d.kind==='edge')return d.low?K.group(K.box(40,22,3,wood,{y:11})):a==='ladder'?K.group(K.box(3,58,3,wood,{x:-12,y:27,rx:-0.3}),K.box(3,58,3,wood,{x:12,y:27,rx:-0.3}),...[8,20,32,44].map(y=>K.box(26,2,2,wood,{y,z:-y*0.3}))):K.group(K.box(40,48,3,wood,{y:24}));
    if(d.kind==='corner')return K.group(K.cyl(2.8,3.2,54,'wood'));if(d.kind==='floor')return K.group(K.box(40,6,40,wood,{y:3}));if(d.kind==='roof')return K.group(K.box(42,4,46,'#c9a85a',{y:63,rx:0.64}));
    if(a==='stilt')return K.group(...[[-18,-18],[18,-18],[-18,18],[18,18]].map(([x,z])=>K.cyl(2.6,3,57,'wood',{x,z})),K.box(42,5,42,'wood',{y:57.5}));return K.group(K.box(20,16,20,wood,{y:8}));}
  if(k==='tool')return K.group(K.cyl(1,1.2,26,'wood',{y:12}),K.box(4,6,3,'#b08040',{y:24}));if(k==='item')return K.group(K.box(10,3,6,'#a08060',{y:1.5}));
  return K.group(K.box(10,10,10,'#ff00ff'));}
/* ---------- tài nguyên: vẽ hàng loạt ---------- */
const RI=new Map();
// tài nguyên vẽ hàng loạt: vật nhỏ chia ô 700 du (chỉ vẽ gần), cây lớn chia ô 1800 du, cây xa dùng mô hình giản lược
const RCH=1150,BIGRX=/^(tree|bamboo|palm|banyan|savannaTree|boulder\|3)/;
// nhóm hình chỉ dựng thật khi lần đầu có phần tử cần hiện (xem resInstances)
function resLazy(mk){let real=null;const dummy={visible:true},get=()=>{if(!real){real=mk();real.G.visible=dummy.visible;}return real;};
  return {get G(){return real?real.G:dummy;},get nOn(){return real?real.nOn:0;},get ims(){return real?real.ims:[];},get cap(){return real?real.cap:0;},set(){const a=get();return a.set.apply(a,arguments);},setM(){const a=get();return a.setM.apply(a,arguments);},hide(i){if(real)real.hide(i);},flush(){if(real)real.flush();},dispose(){if(real)real.dispose();}};}
function resInstances(){const groups=new Map(),protos=new Map();const lazyLo=!G.impDone&&!!(window.SBM&&SBM.v6bake&&SBM.treeLo);G.loQ=[];const ck=(x,z,c)=>Math.floor((x+WSIZE/2)/c)+','+Math.floor((z+WOZ)/c);
  const use=(spec,q,main)=>{const sk=spec.join('|'),big=BIGRX.test(sk),k=sk+'@'+ck(q.x,q.z,big?1800:700);let e=groups.get(k);if(!e){e={sk,spec,qs:[],big,main:0};groups.set(k,e);}if(main)e.main=1;e.qs.push(q);return k;};
  RES.forEach(q=>{const D=RT[q.t];q.y=q.wy!=null?q.wy:hAt(q.x,q.z)-1.2;q.gk=use(D.m,q,1);if(D.stump)q.sk=use(D.stump,q,0);if(D.empty)q.ek=use(D.empty,q,0);});
  const proto=(sk,lo)=>{const key=sk+(lo?'#lo':'');let pr=protos.get(key);if(pr)return pr;const spec=sk.split('|').map(v=>/^\d+$/.test(v)?+v:v);let lg=null;if(lo&&window.SBM&&SBM.treeLo&&spec[0]==='tree'){try{lg=SBM.treeLo(spec[1],1,spec[2]);}catch(e){}}let parts=protoParts(lo?(lg||stubModel(spec)):model(spec));if(!lo&&(BIGRX.test(sk)||/^banana/.test(sk)))parts.forEach(pt=>pt.mat=occMat(pt.mat));
    let mr=8;parts.forEach(pt=>{const bs=pt.geo.boundingSphere;if(bs)mr=Math.max(mr,bs.center.length()+bs.radius);});pr={parts,mr};protos.set(key,pr);return pr;};
  groups.forEach((e,k)=>{
    /* TIẾT KIỆM BỘ NHỚ: nhóm hình "gốc cây sau khi chặt", "bụi đã hái hết" trước được dựng sẵn cho MỌI cây, bụi trên cả bản đồ dù chưa ai đụng tới
       (quá nửa số nhóm hình, hàng chục MB). Giờ chỉ dựng khi lần đầu có cây bị chặt / bụi bị hái ở khu đó. */
    if(!e.main){let cx=0,cy=0,cz=0,ms=1;e.qs.forEach(q=>{cx+=q.x;cy+=q.y;cz+=q.z;ms=Math.max(ms,q.s);});cx/=e.qs.length;cy/=e.qs.length;cz/=e.qs.length;let r=0;e.qs.forEach(q=>{r=Math.max(r,Math.hypot(q.x-cx,q.y-cy,q.z-cz));});
      const sph={x:cx,y:cy,z:cz,r:r+60*ms+10},n=e.qs.length,sk=e.sk;RI.set(k,{api:resLazy(()=>{const pr=proto(sk,false);sph.r=r+pr.mr*ms+10;const a=instGroup(pr.parts,n,{shadow:false,sphere:sph});G.sc.add(a.G);try{seasonPatchAll(a.G);}catch(er){}return a;}),n:0,sph,small:true});return;}
    const pr=proto(e.sk,false);let cx=0,cy=0,cz=0,ms=1;e.qs.forEach(q=>{cx+=q.x;cy+=q.y;cz+=q.z;ms=Math.max(ms,q.s);});cx/=e.qs.length;cy/=e.qs.length;cz/=e.qs.length;let r=0;e.qs.forEach(q=>{r=Math.max(r,Math.hypot(q.x-cx,q.y-cy,q.z-cz));});
    const sph={x:cx,y:cy,z:cz,r:r+pr.mr*ms+10},small=!e.big;let api=instGroup(pr.parts,e.qs.length,{shadow:!small,sphere:sph});G.sc.add(api.G);
    if(e.big&&/^tree/.test(e.sk)&&lazyLo)G.loQ.push({k,sk:e.sk,n:e.qs.length,sph,hi:api});
    else if(e.big&&/^tree/.test(e.sk)){const lo=instGroup(proto(e.sk,true).parts,e.qs.length,{shadow:false,sphere:sph});lo.G.visible=false;G.sc.add(lo.G);const hi=api;
      api={G:hi.G,lo,hi,get nOn(){return hi.nOn;},set(...a){hi.set(...a);lo.set(...a);},setM(i,m){hi.setM(i,m);lo.setM(i,m);},hide(i){hi.hide(i);lo.hide(i);},flush(){hi.flush();lo.flush();}};}
    RI.set(k,{api,n:0,sph,small});});
  RES.forEach(q=>{q.gi=RI.get(q.gk).n++;if(q.sk)q.si=RI.get(q.sk).n++;if(q.ek)q.ei=RI.get(q.ek).n++;const m=S.res[q.i];if(m){q.st=m[0];q.rg=m[1]||0;q.hp=q.st?0:RT[q.t].hp;}resShow(q);});
  RI.forEach(v=>v.api.flush());G.loProto=proto;}
// cây ở xa (ảnh giả): nướng bản đồ ảnh SAU khi đã vào game (trước đây nướng ảnh 4096² lúc tải → chờ lâu nhất).
// Trong lúc chờ, cây xa vẫn hiện bằng mô hình đầy đủ nên không bị "mọc" thêm cây.
function treeLoLater(){if(!G.loQ||!G.loQ.length||!G.on){G.loQ=null;return;}const t0=performance.now();try{SBM.v6bake();}catch(e){console.warn('ảnh cây xa',e);}G.impDone=1;const M=new THREE.Matrix4();
  for(const q of G.loQ){const v=RI.get(q.k);if(!v||v.api!==q.hi)continue;const hi=q.hi;let lo;try{lo=instGroup(G.loProto(q.sk,true).parts,q.n,{shadow:false,sphere:q.sph});}catch(e){console.warn('cây xa',q.sk,e);continue;}
    const im0=hi.ims[0];for(let i=0;i<q.n;i++){im0.getMatrixAt(i,M);const m=M.elements;if(m[0]===0&&m[1]===0&&m[2]===0)lo.hide(i);else lo.setM(i,M);}lo.flush();lo.G.visible=false;G.sc.add(lo.G);try{seasonPatchAll(lo.G);}catch(e){}
    v.api={G:hi.G,lo,hi,get nOn(){return hi.nOn;},set(...a){hi.set(...a);lo.set(...a);},setM(i,m){hi.setM(i,m);lo.setM(i,m);},hide(i){hi.hide(i);lo.hide(i);},flush(){hi.flush();lo.flush();}};}
  G.loQ=null;G.loProto=null;G.cullT=-9;G.envK=null;G.bakeMs=Math.round(performance.now()-t0);}
// dời cây vào đúng tâm sàn nhà trên cây
function treeMove(q,x,z){const k0=rKey(q.x,q.z),L=RGRID.get(k0);if(L){const i=L.indexOf(q.i);if(i>=0)L.splice(i,1);}q.x=x;q.z=z;q.y=hAt(x,z)-1.2;const k=rKey(x,z);if(!RGRID.has(k))RGRID.set(k,[]);RGRID.get(k).push(q.i);resShow(q);RI.forEach(v=>v.api.flush());}
function resShow(q){const a=RI.get(q.gk).api;if(q.st===0){a.set(q.gi,q.x,q.y,q.z,q.ry,q.s);if(q.sk)RI.get(q.sk).api.hide(q.si);if(q.ek)RI.get(q.ek).api.hide(q.ei);}
  else{a.hide(q.gi);if(q.sk)RI.get(q.sk).api.set(q.si,q.x,q.y,q.z,q.ry,q.s);if(q.ek)RI.get(q.ek).api.set(q.ei,q.x,q.y,q.z,q.ry,q.s);}}
function resDeplete(q){const D=RT[q.t];q.st=1;q.hp=0;q.rg=TNOW()+D.regrow*(0.8+Math.random()*0.4);S.res[q.i]=[1,+q.rg.toFixed(3)];resShow(q);RI.forEach(v=>v.api.flush());}
function resRegrow(){const t=TNOW(),si=seasonIdx();let ch=0;for(const k in S.res){const m=S.res[k];if(m[0]===1&&t>=m[1]){const q=RES[+k];if(!q)continue;const D=RT[q.t];
      if(Math.hypot(q.x-P.x,q.z-P.z)<40||cellBusy(q.x,q.z))continue;if(D.seasons&&!D.seasons.includes(si))continue;q.st=0;q.hp=D.hp;delete S.res[k];resShow(q);ch=1;}}if(ch)RI.forEach(v=>v.api.flush());}
/* ---------- công trình ---------- */
const SI=new Map(),OCC={cell:new Map(),edge:new Map()},BYID=new Map();
function pieceDef(k){return BUILD.find(b=>b.id===k);}
function piecePrep(k){if(SI.has(k))return SI.get(k);const proto=model(['piece',k]);proto.updateMatrixWorld(true);let flame=null;proto.traverse(o=>{if(o.name==='flame'&&!flame)flame=o;});
  const parts=protoParts(proto,o=>o.name==='flame');if(!/^(stairs|ladder|ropeLadder)$/.test(k))parts.forEach(pt=>pt.mat=occMat(pt.mat));/* lối đi (cầu thang, thang) luôn hiện rõ, không đục lỗ nhìn xuyên */const e={k,parts,flame:null,api:null,cap:0,map:new Map(),free:[]};
  if(flame){const f=flame.clone();const wp=flame.getWorldPosition(new THREE.Vector3());f.position.copy(wp);f.rotation.set(0,0,0);f.scale.copy(flame.getWorldScale(new THREE.Vector3()));e.flame=f;}SI.set(k,e);return e;}
function pieceSlot(e){if(!e.api||(!e.free.length&&e.map.size>=e.cap)){const cap=Math.max(8,e.cap*2),api=instGroup(e.parts,cap,{});let n=0;const remap=new Map();
    e.map.forEach((idx,id)=>{const b=BYID.get(id);if(b){setPieceM(api,n,b);remap.set(id,n);n++;}});if(e.api){e.api.dispose();G.sc.remove(e.api.G);}e.map=remap;e.free=[];for(let i=cap-1;i>=n;i--)e.free.push(i);e.api=api;e.cap=cap;G.sc.add(api.G);seasonPatchAll(api.G);}
  return e.free.pop();}
function setPieceM(api,idx,b){if(b.prog!=null&&b.ry==null){const M=setPieceM.M||(setPieceM.M=new THREE.Matrix4());const Q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),b.r*Math.PI/2);M.compose(new THREE.Vector3(b.x,b.y,b.z),Q,new THREE.Vector3(1,0.12+0.88*clamp(b.prog,0,1),1));api.setM(idx,M);return;}api.set(idx,b.x,b.y,b.z,b.r*Math.PI/2,1);}
function structInit(){S.builds.forEach(b=>{structAdd(b,true);if(b.tree!=null&&RES[b.tree]){RES[b.tree].lock=b.id;treeMove(RES[b.tree],b.x,b.z);}});SI.forEach(e=>e.api&&e.api.flush());S.builds.forEach(b=>{if(S.crops[b.id])cropShow(b);const d=pieceDef(b.k);if(d&&d.fuel&&S.fuel[b.id]==null)S.fuel[b.id]=6;});decoRebuild();flameSync();try{if(typeof stairsHiddenCheck==='function')stairsHiddenCheck();}catch(e){}}
function structAdd(b,quiet){const e=piecePrep(b.k);const idx=pieceSlot(e);e.map.set(b.id,idx);BYID.set(b.id,b);setPieceM(e.api,idx,b);e.api.flush();occMark(b,b.id);
  if(e.flame){const f=e.flame.clone();f.position.applyAxisAngle(new THREE.Vector3(0,1,0),b.r*Math.PI/2);f.position.add(new THREE.Vector3(b.x,b.y,b.z));f.rotation.y=b.r*Math.PI/2;G.sc.add(f);G.flames.push({id:b.id,o:f,x:f.position.x,y:f.position.y,z:f.position.z,ph:Math.random()*6});}
  flameSync();if(!quiet)structFx(b);}
function structRemove(b){const e=SI.get(b.k);if(!e)return;const idx=e.map.get(b.id);if(idx!=null){e.api.hide(idx);e.api.flush();e.free.push(idx);e.map.delete(b.id);}BYID.delete(b.id);occMark(b,null);
  G.flames=G.flames.filter(f=>{if(f.id===b.id){G.sc.remove(f.o);return false;}return true;});S.builds=S.builds.filter(x=>x.id!==b.id);delete S.store[b.id];delete S.fuel[b.id];delete S.tank[b.id];if(S.crops[b.id]){delete S.crops[b.id];cropShow(b);}}
function cellsOf(def,x,z,r){if(def.kind==='floor'||def.kind==='roof')return [[Math.floor(x/CELL),Math.floor(z/CELL)]];const [w,d]=def.fp||[1,1],rw=r%2?d:w,rd=r%2?w:d,cx=Math.round(x/CELL-rw/2),cz=Math.round(z/CELL-rd/2),out=[];
  for(let i=0;i<rw;i++)for(let j=0;j<rd;j++)out.push([cx+i,cz+j]);return out;}
function edgeKey(x,z,r){return r%2?'v:'+Math.round(x/CELL)+','+Math.floor(z/CELL):'h:'+Math.floor(x/CELL)+','+Math.round(z/CELL);}
function occMark(b,v){const def=pieceDef(b.k);if(!def)return;if(def.kind==='edge'){const k=edgeKey(b.x,b.z,b.r);if(v)OCC.edge.set(k,v);else OCC.edge.delete(k);return;}
  const slot=def.kind==='floor'?'floor':def.kind==='roof'?'roof':'obj';cellsOf(def,b.x,b.z,b.r).forEach(([i,j])=>{const k=i+','+j;let c=OCC.cell.get(k);if(!c){c={};OCC.cell.set(k,c);}if(v)c[slot]=v;else delete c[slot];});}
function cellAt(x,z){return OCC.cell.get(Math.floor(x/CELL)+','+Math.floor(z/CELL))||null;}
function cellBusy(x,z){const c=cellAt(x,z);return !!(c&&(c.floor||c.obj));}
function floorTop(x,z){const c=cellAt(x,z);if(c&&c.floor){const b=BYID.get(c.floor);if(b)return b.y+6;}return null;}
/* ---------- nhân vật ---------- */
function charLook(){const L=Object.assign({sleeves:true},(LOOKS[S.look]||LOOKS[0]).o);const w=S.wear||{};if(w.body==='coat'){L.top='#8a5e36';L.top2='#5e3a1e';L.sleeves=true;}
  if(w.body==='furcoat'){L.top='#6a4a32';L.top2='#3a281a';L.cloak='#9a7a58';L.cloak2='#6a5038';}if(w.feet==='boots')L.boots='#4a3020';return L;}
function playerInit(){if(P.model){G.sc.remove(P.model);}P.model=charModel();P.rig=P.model.userData.rig;if(G.on)P.model.traverse(o=>o.layers.set(isFP()?1:0));P.model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});G.sc.add(P.model);seasonPatchAll(P.model);
  if(!G.on){P.x=S.p.x;P.z=S.p.z;P.ry=S.p.ry||0;P.y=groundY(P.x,P.z);G.yaw=P.ry+Math.PI+0.6;const T=THREE,cv=mkCanvas(64,64),c=cv.getContext('2d'),gr=c.createRadialGradient(32,32,2,32,32,30);gr.addColorStop(0,'rgba(0,0,0,.45)');gr.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gr;c.fillRect(0,0,64,64);
    P.blob=new T.Mesh(new T.PlaneGeometry(26,26),new T.MeshBasicMaterial({map:new T.CanvasTexture(cv),transparent:true,depthWrite:false}));P.blob.rotation.x=-Math.PI/2;G.sc.add(P.blob);P.light=new T.PointLight(0xffa860,0,260,1.6);G.sc.add(P.light);}
  const t=P.toolId;P.toolId=null;P.tool=null;equip(t||selTool());}
function selTool(){const s=S.inv[S.sel];return s&&ITEMS[s.id]&&ITEMS[s.id].t==='tool'?s.id:null;}
function equip(id){if(P.toolId===id&&P.tool)return;if(P.tool){P.tool.parent&&P.tool.parent.remove(P.tool);P.tool=null;}P.toolId=id;if(!id||!P.rig)return;const g=model(['tool',id]);g.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  if(P.char2&&K3.char2Equip){K3.char2Equip(P.rig,g,id);}else{g.rotation.set(id==='torch'?0.9:id==='spear'?Math.PI/2-0.35:Math.PI/2+0.25,0,0);g.position.set(0,-1.5,1.5);g.scale.setScalar(0.9);(P.rig.handR||P.rig.armR).add(g);}P.tool=g;seasonPatchAll(g);}
function hasTool(t){let best=null,bp=-1;for(const s of S.inv)if(s&&ITEMS[s.id]&&ITEMS[s.id].tool===t&&(ITEMS[s.id].pow||0)>bp){bp=ITEMS[s.id].pow||0;best=s.id;}return best;}
function selectTool(t){const id=hasTool(t);if(!id)return false;let i=S.inv.findIndex(s=>s&&s.id===id);if(i>=HOTN){const tmp=S.inv[S.sel];S.inv[S.sel]=S.inv[i];S.inv[i]=tmp;i=S.sel;}S.sel=i;equip(id);uiHotbar();return true;}
function wearItem(i){const s=S.inv[i];if(!s)return;const I=ITEMS[s.id];if(I.t!=='wear')return;const slot=I.slot||'body';const old=S.wear[slot];S.inv[i]=null;S.wear[slot]=s.id;if(old)invAdd(old,1);playerInit();uiToast(`Đã mặc ${I.n}: ấm hơn ${I.warm}.`,'good');sfx('craft');save();uiOpenRefresh();}
function unwear(slot){const id=S.wear[slot];if(!id)return;if(!invFits(id,1)){uiToast('Túi đầy.','bad');return;}delete S.wear[slot];invAdd(id,1);playerInit();save();uiOpenRefresh();}
function groundY(x,z){const f=floorTop(x,z);const h=hAt(x,z);return f!=null&&f>h-4?f:wdAt(x,z)>11?waterAt(x,z)+SWIM_Y:h;}
// va chạm: tài nguyên (tròn), tường (đoạn thẳng), đồ đặt (tròn)
function collide(nx,nz){const pr=7;for(let it=0;it<2;it++){for(const c of SCOL){const dx=nx-c.x,dz=nz-c.z,d=Math.hypot(dx,dz),r=c.r+pr;if(d<r&&d>0.01){nx=c.x+dx/d*r;nz=c.z+dz/d*r;}}for(const i of near(nx,nz,40)){const q=RES[i];if(q.st!==0)continue;const D=RT[q.t];if(D.pass)continue;const r=(D.r||6)*q.s*0.7+pr,dx=nx-q.x,dz=nz-q.z,d=Math.hypot(dx,dz);if(d<r&&d>0.01){nx=q.x+dx/d*r;nz=q.z+dz/d*r;}}
    const ci=Math.floor(nx/CELL),cj=Math.floor(nz/CELL);for(let i=ci-1;i<=ci+1;i++)for(let j=cj-1;j<=cj+1;j++){
      for(const [k,r] of [['h:'+i+','+j,0],['v:'+i+','+j,1]]){const id=OCC.edge.get(k);if(!id)continue;const b=BYID.get(id);if(!b)continue;const def=pieceDef(b.k);
        const ax=r?b.x:b.x-20,az=r?b.z-20:b.z,bx=r?b.x:b.x+20,bz=r?b.z+20:b.z;const segs=def.door?[[0,0.32],[0.68,1]]:[[0,1]];
        for(const [s0,s1] of segs){const x0=ax+(bx-ax)*s0,z0=az+(bz-az)*s0,x1=ax+(bx-ax)*s1,z1=az+(bz-az)*s1;const dx=x1-x0,dz=z1-z0,l2=dx*dx+dz*dz;let t=((nx-x0)*dx+(nz-z0)*dz)/l2;t=clamp(t,0,1);const qx=x0+dx*t,qz=z0+dz*t,ex=nx-qx,ez=nz-qz,d=Math.hypot(ex,ez),rr=pr+2;if(d<rr&&d>0.001){nx=qx+ex/d*rr;nz=qz+ez/d*rr;}}}
      const c=OCC.cell.get(i+','+j);if(c&&c.obj){const b=BYID.get(c.obj);const def=b&&pieceDef(b.k);if(def&&!def.bed&&!def.farm&&!def.shelter&&(!def.fp||def.fp[0]*def.fp[1]===1)){const rr=(def.small?7:15)+pr,dx=nx-b.x,dz=nz-b.z,d=Math.hypot(dx,dz);if(d<rr&&d>0.01){nx=b.x+dx/d*rr;nz=b.z+dz/d*rr;}}}}}
  return [nx,nz];}
/* ---------- tìm đối tượng tương tác gần nhất ---------- */
function findTarget(){if(G.work||G.sit)return null;let best=null,bs=1e9;const fx=Math.sin(P.ry),fz=Math.cos(P.ry),fp=isFP(),cone=(dx,dz,d)=>{if(!fp)return 0;const l=Math.hypot(dx,dz)||1,dot=(dx*fx+dz*fz)/l;if(d>6&&dot<0.8)return 1e9;return (1-dot)*90;};
  if(G.ride)return {type:'leave'};
  if(G.foes)for(const f of G.foes){if(!f.alive)continue;const dx=f.x-P.x,dz=f.z-P.z,d=Math.hypot(dx,dz)-f.r;if(d>REACH+16)continue;const sc=d-10+cone(dx,dz,d+20);if(sc<bs){bs=sc;best={type:'foe',a:f,d};}}
  if(G.camp&&G.campChest){const cx=G.camp.x+20,cz=G.camp.z+10,d=Math.hypot(cx-P.x,cz-P.z)-12;if(d<REACH+6){const sc=d-2;if(sc<bs){bs=sc;best={type:'chest',d};}}}
  if(G.npcs)for(const n of G.npcs){if(!n.o.visible)continue;const dx=n.x-P.x,dz=n.z-P.z,d=Math.hypot(dx,dz);if(d>REACH+14)continue;const sc=d-8+cone(dx,dz,d);if(sc<bs){bs=sc;best={type:'npc',n,d};}}
  if(S.folk)for(const f of S.folk){const dx=f.x-P.x,dz=f.z-P.z,d=Math.hypot(dx,dz);if(d>REACH+14)continue;const sc=d-8+cone(dx,dz,d);if(sc<bs){bs=sc;best={type:'folk',f,d};}}
  if(S.boats)for(const b of S.boats){const dx=b.x-P.x,dz=b.z-P.z,d=Math.hypot(dx,dz);if(d>REACH+40)continue;const sc=d-20+cone(dx,dz,d);if(sc<bs){bs=sc;best={type:'boat',b,d};}}
  if(S.pets)for(const pt of S.pets){const dx=pt.x-P.x,dz=pt.z-P.z,d=Math.hypot(dx,dz);if(d>REACH+10)continue;const sc=d-6+cone(dx,dz,d);if(sc<bs){bs=sc;best={type:'pet',p:pt,d};}}
  if(G.drops)for(const o of G.drops){const dx=o.x-P.x,dz=o.z-P.z,d=Math.hypot(dx,dz);if(d>REACH+6)continue;const sc=d-6+cone(dx,dz,d);if(sc<bs){bs=sc;best={type:'drop',o,d};}}
  for(const i of near(P.x,P.z,90)){const q=RES[i];const D=RT[q.t];if(q.st!==0)continue;const dx=q.x-P.x,dz=q.z-P.z,d=Math.hypot(dx,dz)-(D.r||4)*q.s*0.7;if(d>REACH)continue;const dot=(dx*fx+dz*fz)/(Math.hypot(dx,dz)||1);const sc=d-dot*10+cone(dx,dz,d);if(sc<bs){bs=sc;best={type:'res',q,d};}}
  for(const b of S.builds){const def=pieceDef(b.k);if(!def||(b.prog==null&&!def.st&&!def.store&&!def.bed&&!def.farm&&b.k!=='well'&&b.k!=='rainBarrel'&&b.k!=='beeBox'&&!['trap','fishTrap','drum','stool','ladder','ropeLadder','coop'].includes(b.k)))continue;if(Math.abs(b.y-P.y)>60&&b.k!=='ladder')continue;const d=Math.hypot(b.x-P.x,b.z-P.z)-(def.fp?Math.max(...def.fp)*12:14);if(d>REACH+10)continue;const sc=d-4+cone(b.x-P.x,b.z-P.z,d+20);if(sc<bs){bs=sc;best={type:'build',b,def,d};}}
  for(const a of G.animals){if(!a.alive||(!a.o.visible&&!a.angry))continue;const d=Math.hypot(a.x-P.x,a.z-P.z)-a.r;if(d>REACH+(a.angry?26:14))continue;const sc=d-8-(a.angry?40:0)+(a.angry?0:cone(a.x-P.x,a.z-P.z,d+20));if(sc<bs){bs=sc;best={type:'animal',a,d};}}
  if(!best||bs>8){for(const d of [16,26,36]){const wx=P.x+fx*d,wz=P.z+fz*d;if(wdAt(wx,wz)>0.3){if(!best||(bs>d*0.5&&best.type!=='boat'))best={type:'water',x:wx,z:wz};/* có bè, thuyền trong tầm với thì ưu tiên "Lên thuyền" hơn "Uống nước" (trước: bè thả cách 3-4 bước là chỉ hiện Uống nước, không lên được) */break;}}}
  return best;}
function targetInfo(t){if(!t)return null;const si=seasonIdx();
  if(t.type==='leave')return {name:ITEMS[G.ride.k].n,verb:'Lên bờ',ok:true,icon:G.ride.k};if(t.type==='npc')return npcInfo(t.n);if(t.type==='foe')return {name:FOE.n+' · '+Math.max(0,Math.ceil(t.a.hp))+' máu',verb:'Đánh',ok:true,icon:'spear'};if(t.type==='chest')return chestInfo();if(t.type==='folk')return folkInfo(t.f);if(t.type==='boat')return {name:ITEMS[t.b.k].n,verb:'Lên thuyền',ok:true,icon:t.b.k};
  if(t.type==='pet')return petInfo(t.p);if(t.type==='build'&&t.b.k==='coop'&&t.b.prog==null)return coopInfo(t.b);
  if(t.type==='res'&&t.q.lock)return {name:RT[t.q.t].n,verb:'Đang có nhà trên cây',ok:false,icon:'wood'};if(t.type==='res'&&P.toolId==='digStick'&&canUproot(t.q))return {name:RT[t.q.t].n,verb:'Nhổ cây con',ok:true,icon:'sap_'+UPROOT[t.q.t]};
  if(t.type==='animal'&&TAME[t.a.kind]&&(tameFood(t.a.kind)&&S.inv[S.sel]&&TAME[t.a.kind].food.includes(S.inv[S.sel].id)||G.sneak))return tameInfo(t.a);

  if(t.type==='res'){const D=RT[t.q.t];const need=D.tool,has=need?hasTool(need):true;const v={pick:'Đập',axe:'Chặt'}[need]||(D.sk==='herb'?'Hái thuốc':D.yield.berry||D.yield.honey?'Hái':t.q.t==='clay'?'Đào':'Nhặt');
    return {name:D.n,verb:v,ok:!!has,need:need&&!has?ITEMS[need].n:null,icon:Object.keys(D.yield)[0],warn:D.sting&&P.toolId!=='torch'?'Cầm đuốc để hun khói ong':null};}
  if(t.type==='drop')return {name:ITEMS[t.o.id].n,verb:'Nhặt lại',ok:true,icon:t.o.id};
  if(t.type==='build'&&t.b.prog!=null)return {name:t.def.n+' (đang dựng)',verb:'Dựng tiếp '+Math.round(t.b.prog*100)+'%',ok:true,icon:'hammer'};
  if(t.type==='build'&&/ladder/i.test(t.b.k))return ladderInfo(t.b);if(t.type==='build'&&(t.b.k==='trap'||t.b.k==='fishTrap'))return trapInfo(t.b);if(t.type==='build'&&t.b.k==='drum')return {name:t.def.n,verb:'Đánh trống',ok:true,icon:'hide'};if(t.type==='build'&&t.b.k==='stool')return {name:t.def.n,verb:'Ngồi',ok:true,icon:'wood'};
  if(t.type==='build'){const d=t.def;if(t.b.k==='well')return {name:d.n,verb:hasEmptyFlask()?'Múc nước sạch':'Uống nước',ok:true,icon:'water'};if(d.fuel&&!fireLit(t.b))return {name:d.n+' (chưa có lửa)',verb:hasTool('fire')?'Khoan lửa':'Cần khoan lửa',ok:!!hasTool('fire'),icon:'fireDrill'};if(d.st)return {name:d.n+(d.fuel?' · '+fuelText(S.fuel[t.b.id]):''),verb:'Chế tạo',ok:true,icon:'craft'};
    if(t.b.k==='rainBarrel'){const v=Math.floor(S.tank[t.b.id]||0);return {name:d.n+' · '+v+'/10',verb:v>=1?'Uống nước':'Chờ mưa',ok:v>=1,icon:'water'};}
    if(t.b.k==='beeBox'){const h=Math.floor(S.tank[t.b.id]||0);return {name:d.n,verb:h>=1?`Lấy mật (${h})`:'Ong đang làm mật',ok:h>=1,icon:'honey',warn:h>=1&&P.toolId!=='torch'?'Cầm đuốc để hun khói ong':null};}if(d.store)return {name:d.n,verb:'Mở',ok:true,icon:'bag'};
    if(d.bed)return {name:d.n,verb:isNight()?'Ngủ':'Nghỉ',ok:true,icon:'sleep'};
    if(d.farm){const c=S.crops[t.b.id];if(!c)return {name:d.n,verb:'Gieo hạt',ok:!!seedId(),need:seedId()?null:'hạt giống',icon:'seedGrain'};const st=cropStage(c);return st>=3?{name:'Ruộng chín',verb:'Thu hoạch',ok:true,icon:c.k==='grain'?'grain':c.k==='gourd'?'gourd':'fiber'}:{name:'Cây đang lớn',verb:Math.round(c.p*100)+'%',ok:false,icon:'seedGrain'};}}
  if(t.type==='build')return {name:t.def.n,verb:'',ok:false,icon:null};
  if(t.type==='animal'){const has=hasTool('spear')||hasTool('club')||hasTool('knife');const fierce=t.a.angry||ANIMALS[t.a.kind].aggro&&ANIMALS[t.a.kind].aggro!=='never';return {name:t.a.n+(t.a.angry?' · đang tấn công!':''),verb:fierce?(has?'Đánh trả':'Đấm, đá'):(has?'Săn':'Vồ bắt (tay không)'),ok:true,icon:has?'spear':'meat'};}
  if(t.type==='water'&&P.toolId==='rod')return {name:'Mặt nước',verb:'Câu cá',ok:true,icon:'fish'};if(t.type==='water'&&wdAt(P.x,P.z)>3&&!G.swim)return {name:'Dòng nước',verb:'Tắm',ok:true,icon:'water'};
  if(t.type==='water')return P.toolId==='spear'?{name:'Mép nước',verb:'Đâm cá',ok:true,icon:'fish'}:{name:'Nước suối',verb:hasEmptyFlask()?'Uống & múc nước':'Uống nước',ok:true,icon:'water'};
  return null;}
const seedId=()=>['seedGrain','seedGourd','seedFlax'].find(k=>invCount(k)>0)||null;
const hasEmptyFlask=()=>invCount('flask')>0;
/* ---------- hành động ---------- */
function actStart(t){if(G.work){workPush();return;}if(t&&t.type==='leave'){boatLeave();return;}if(t&&t.type==='npc'){npcTalk(t.n);return;}if(t&&t.type==='chest'){chestRaid();return;}if(t&&t.type==='foe'){const w=hasTool('spear')||hasTool('club')||hasTool('knife')||hasTool('axe');if(w)selectTool(ITEMS[w].tool);G.act={t:{type:'animal',a:t.a},next:0,n:0};return;}if(t&&t.type==='folk'){G.folkCur=t.f;uiOpen('folk',{});return;}if(t&&t.type==='boat'){boatBoard(t.b);return;}if(G.act&&G.act.t&&G.act.t.type==='rod'){rodPull();return;}if(t&&t.type==='pet'){petUse(t.p);return;}if(t&&t.type==='res'&&t.q.lock){uiToast('Cây này đang đỡ nhà trên cây.','');return;}if(t&&t.type==='res'&&P.toolId==='digStick'&&canUproot(t.q)){uproot(t.q);return;}
  if(t&&t.type==='animal'&&TAME[t.a.kind]&&S.inv[S.sel]&&TAME[t.a.kind].food.includes(S.inv[S.sel].id)){tameFeed(t.a);return;}
  if(t&&t.type==='build'){const k=t.b.k;if(k==='coop'&&t.b.prog==null){coopUse(t.b);return;}if(/ladder/i.test(k)&&t.b.prog==null){ladderUse(t.b);return;}if((k==='trap'||k==='fishTrap')&&t.b.prog==null){trapUse(t.b);return;}if(k==='drum'&&t.b.prog==null){drumPlay();return;}if(k==='stool'&&t.b.prog==null){seatUse(t.b);return;}}
  if(t&&t.type==='water'&&P.toolId==='rod'){rodStart(t);return;}if(t&&t.type==='water'&&wdAt(P.x,P.z)>3&&!G.swim){bathe();return;}if(G.sit){sitToggle(false);}if(t&&t.type==='drop'){dropPick(t.o);return;}if(t&&t.type==='build'&&t.b.prog!=null){const ng=needGate(true);if(ng){uiToast(ng,'bad');sfx('no');return;}G.act={t:{type:'site',b:t.b},next:0,n:0,per:0.7};return;}if(!t){uiToast(typeof nearestHint==='function'?nearestHint():'Không có gì ở gần.','');return;}const inf=targetInfo(t);{const heavy=(t.type==='res'&&RT[t.q.t].tool)||t.type==='site'||(t.type==='build'&&t.b.prog!=null);const food=t.type==='water'||t.type==='drop'||t.type==='animal'||t.type==='npc'||(t.type==='res'&&RT[t.q.t].yield&&Object.keys(RT[t.q.t].yield).some(k=>ITEMS[k]&&ITEMS[k].food));const ng=!food&&needGate(heavy);if(ng){uiToast(ng,'bad');sfx('no');return;}}
  if(t.type==='build'){buildUse(t);return;}if(t.type==='water'){if(P.toolId==='spear'){G.act={t:{type:'fish',x:t.x,z:t.z},n:0,next:0.35,per:0.9};return;}drinkWater(false);return;}
  if(!inf.ok){if(inf.need){uiToast(`Cần ${inf.need}. Mở Chế tạo để làm.`,'bad');sfx('no');}return;}
  if(t.type==='res'){const D=RT[t.q.t];if(D.tool)selectTool(D.tool);if(!invFits(Object.keys(D.yield)[0],1)){uiToast('Túi đầy! Cất bớt đồ.','bad');return;}}
  if(t.type==='animal'){const w=['spear','club','knife'].find(k=>hasTool(k));if(w)selectTool(w);}
  G.act={t,next:0,n:0};}
function swingPer(t){const D=t.type==='res'?RT[t.q.t]:null,hand=!D||!D.tool,sk=D?D.sk:'hunt';let per=(hand&&D&&D.hp<=1?0.42:0.72)/(1+0.06*skLv(sk));if(S.buff&&S.buff.rested>TNOW())per*=0.87;if(S.p.stam<8)per*=1.6;per*=needSlow();return per;}
function actTick(dt){const A=G.act;if(!A)return;const t=A.t;
  if(t.type==='rod'){rodTick(A,dt);return;}if(t.type==='uproot'){uprootTick(A,dt);return;}
  if(t.type==='site'){const b=t.b;if(b.prog==null||!BYID.has(b.id)||Math.hypot(b.x-P.x,b.z-P.z)>110){G.act=null;return;}P.ry=isFP()?P.ry:lerpAng(P.ry,Math.atan2(b.x-P.x,b.z-P.z),Math.min(1,dt*10));P.anim='hammer';A.next-=dt;if(A.next<=0){A.per=0.62/(1+skLv('build')*0.05);A.next=A.per;setTimeout(()=>{if(G.act===A)siteHit(b);},A.per*380);}return;}
  if(t.type==='fish'){if(Math.hypot(t.x-P.x,t.z-P.z)>60||P.toolId!=='spear'){G.act=null;return;}P.ry=lerpAng(P.ry,Math.atan2(t.x-P.x,t.z-P.z),Math.min(1,dt*12));P.anim='chop';A.next-=dt;
    if(A.next<=0){A.per=0.9;A.next=A.per;A.n++;S.p.stam=Math.max(0,S.p.stam-1.2);setTimeout(()=>{if(G.act!==A)return;sfx('hit');puff(t.x,1,t.z,'#bfe6ff',5);
      if(Math.random()<0.22+0.04*skLv('hunt')+(seasonIdx()===3?-0.08:0)){G.act=null;give({fish:1},[t.x,4,t.z]);addXp('hunt',3);cnt('cnt','fish');uiToast('🐟 Đâm trúng một con cá!','gold');save();}
      else if(A.n>=8){G.act=null;uiToast('Cá lặn mất rồi. Thử chỗ nước khác xem.','');}},A.per*400);}return;}if(t.type==='res'&&t.q.st!==0){G.act=null;return;}if(t.type==='animal'&&!t.a.alive){G.act=null;return;}
  const tx=t.type==='res'?t.q.x:t.a.x,tz=t.type==='res'?t.q.z:t.a.z,rr=t.type==='res'?(RT[t.q.t].r||4)*t.q.s*0.7:t.a.r;const d=Math.hypot(tx-P.x,tz-P.z)-rr;
  if(d>REACH+8){if(t.type==='animal'&&d<260){G.walkTo={x:tx,z:tz,t,t0:G.t};}G.act=null;return;}
  P.ry=lerpAng(P.ry,Math.atan2(tx-P.x,tz-P.z),Math.min(1,dt*12));const D=t.type==='res'?RT[t.q.t]:null;P.anim=D&&!D.tool&&D.hp<=2?'gather':'chop';
  A.next-=dt;if(A.next<=0){const per=swingPer(t);A.next=per;A.per=per;A.n++;S.p.stam=Math.max(0,S.p.stam-(D&&!D.tool?0.6:1.6));setTimeout(()=>hitTarget(t),per*420);}}
function hitTarget(t){if(!G.act||G.act.t!==t)return;if(t.type==='animal'){animalHit(t.a);return;}
  const q=t.q,D=RT[q.t];if(q.st!==0)return;const tool=D.tool?ITEMS[selTool()||'']:null;const pow=D.tool?(tool&&tool.tool===D.tool?tool.pow:0):1;if(pow<=0){G.act=null;return;}
  q.hp-=pow*(1+0.05*skLv(D.sk))*(S.buff&&S.buff.rested>TNOW()?1.1:1);sfx(D.sk==='chop'?'chop':D.sk==='mine'?'mine':'pick');shakeRes(q);puff(q.x,q.y+(D.sk==='chop'?26:8),q.z,D.sk==='chop'?'#c9a274':D.sk==='mine'?'#b8b0a4':'#8ac05a',D.hp<=1?3:6);
  if(q.hp<=0){const out={};for(const k in D.yield){const [a,b]=D.yield[k];let n=a+Math.floor(Math.random()*(b-a+1));if((D.sk==='gather'||D.sk==='herb')&&Math.random()<skLv(D.sk)*0.06)n++;if(n>0)out[k]=n;}
    if(D.sting&&P.toolId!=='torch'){addStatus('sting');S.p.hp=Math.max(1,S.p.hp-6);uiToast('🐝 Ong đốt! Lần sau cầm đuốc để hun khói.','bad');}
    give(out,[q.x,q.y+20,q.z]);addXp(D.sk,D.hp+1);cnt('cnt',D.sk==='chop'?'chop':D.sk==='mine'?'mine':D.sk==='herb'?'herb':'gather');if(D.fall)fallTree(q);resDeplete(q);G.act=null;save();uiHud();}}
function lerpAng(a,b,k){const d=((b-a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;return a+d*k;}
function drinkWater(clean){S.p.water=Math.min(100,S.p.water+22);cnt('cnt','drink');sfx('drink');P.anim='gather';G.drinkT=0.8;
  if(!clean&&Math.random()<(S.mode==='cozy'?0.08:0.18))addStatus('poison');let f=0;while(hasEmptyFlask()){invTake('flask',1);if(invAdd(clean?'water':'waterDirty',1)){invAdd('flask',1);break;}f++;}
  uiToast(clean?`Uống nước giếng mát lành${f?`, múc đầy ${f} bầu nước sạch`:''}.`:`Uống nước suối +22${f?`, múc ${f} bầu (nên đun sôi trước khi uống)`:''}.`,'');uiHud(true);uiHotbar();save();}
function eat(id){const I=ITEMS[id];if(!I||!['food','drink','med','herb'].includes(I.t))return;if(I.t==='herb'&&!I.food){uiToast(`${I.n} dùng làm thuốc. Mở Chế tạo để xem bài thuốc.`,'');return;}
  if(I.t==='food'&&S.p.food>=99&&!(I.hp&&S.p.hp<100)){uiToast('Bạn đang no rồi.','');return;}
  invTake(id,1);if(I.back)invAdd(I.back,1);if(I.food)S.p.food=Math.min(100,S.p.food+I.food*(1+skLv('cook')*0.03));if(I.drink)S.p.water=Math.min(100,S.p.water+I.drink);if(I.hp)S.p.hp=Math.min(100,S.p.hp+I.hp*2);if(I.warm)S.p.warm=Math.min(100,S.p.warm+I.warm);
  if(I.raw&&Math.random()<I.raw*(S.mode==='cozy'?0.6:1)*((S.p.clean??90)<25?1.6:1))addStatus('poison');if(I.poison)addStatus('poison',10);if(I.dirty&&Math.random()<I.dirty*(S.mode==='cozy'?0.6:1))addStatus('poison');
  if(I.cure)cureStatus(I.cure);if(I.repel){S.p.repel=TNOW()+1;uiToast('Khói ngải thơm nồng: muỗi tránh xa bạn trong một ngày.','good');}
  cnt('cnt',I.t==='food'?'eat':I.t==='drink'?'drink':'med');sfx(I.t==='drink'?'drink':'eat');if(I.t==='food')uiToast(`Ăn ${I.n}${I.raw?' (nên nấu chín)':''}`,'');uiHud(true);uiHotbar();uiOpenRefresh();save();}
function recipeBlock(r){if(r.st&&!nearStation(r.st))return nearStation(r.st,true)?`${ST_N[r.st]} đã tắt: thêm củi`:`Cần đứng gần ${ST_N[r.st]}`;if(r.tool&&invCount(r.tool)<1)return `Cần có ${ITEMS[r.tool].n}`;if(!lvOk(r.lv))return `Cần ${lvText(r.lv)}`;if(!canPay(r.in))return 'Thiếu nguyên liệu';return '';}
function craft(r,times){if(!G.instant)return workStart(r,times);times=times||1;let done=0;const out=Object.keys(r.out)[0];for(let i=0;i<times;i++){if(recipeBlock(r))break;if(!invFits(out,r.out[out]))break;pay(r.in);invAdd(out,r.out[out]);done++;}
  if(!done){uiToast(recipeBlock(r)||'Túi đầy.','bad');sfx('no');return 0;}cnt('craft',out,done*r.out[out]);addXp(r.sk||(r.st==='campfire'||r.st==='hearth'?'cook':'craft'),3*done);
  if((r.st==='campfire'||r.st==='hearth')&&Math.random()<skLv('cook')*0.04){invAdd(out,1);uiToast('Khéo tay: được thêm 1 '+ITEMS[out].n,'gold');}
  sfx('craft');uiToast(`Đã làm ${done*r.out[out]} ${ITEMS[out].n}`,'good');if(ITEMS[out].t==='tool'&&!selTool()){const i=S.inv.findIndex(s=>s&&s.id===out);if(i>=0&&i<HOTN){S.sel=i;equip(out);}}uiHotbar();save();return done;}
function nearStation(st,any){if(!st)return true;for(const b of S.builds){const d=pieceDef(b.k);if(d&&d.st===st&&b.prog==null&&Math.hypot(b.x-P.x,b.z-P.z)<110&&(any||fireLit(b)))return true;}return false;}
/* ---------- lửa cần củi, thùng hứng mưa, thùng ong ---------- */
function fireLit(b){const d=pieceDef(b.k);return !d||!d.fuel||(S.fuel[b.id]||0)>0;}
function flameSync(){for(const f of G.flames){const b=BYID.get(f.id);const on=!b||(b.prog==null&&fireLit(b));f.off=!on;f.o.visible=on;}}
function fuelText(h){h=h||0;return h>=1?Math.floor(h)+' giờ':Math.max(1,Math.round(h*60))+' phút';}
function addFuel(b,id){if(b&&!fireLit(b)){fireStart(b);return;}const hrs={wood:4,stick:1}[id];if(!b||!hrs)return;if((S.fuel[b.id]||0)>=23.5){uiToast('Lửa đã đầy củi.','');return;}if(!invTake(id,1)){uiToast('Hết '+ITEMS[id].n.toLowerCase()+'.','bad');sfx('no');return;}
  const was=fireLit(b);S.fuel[b.id]=Math.min(24,(S.fuel[b.id]||0)+hrs);flameSync();sfx(was?'pick':'build');if(!was){uiToast('🔥 Nhóm lửa lại rồi!','gold');puff(b.x,b.y+10,b.z,'#ffb060',6);}cnt('cnt','fuel');uiHotbar();save();}
function fuelTick(gh){if(gh<=0)return;const rain=(G.wxK||0)>0.4&&S.wx&&S.wx.type!=='clear'&&S.wx.type!=='cloudy',si=seasonIdx();let ch=0;
  for(const b of S.builds){const d=pieceDef(b.k);if(!d)continue;
    if(d.fuel&&(S.fuel[b.id]||0)>0){const wet=rain&&!(typeof fireSheltered==='function'?fireSheltered(b.x,b.z):underRoof(b.x,b.z)),k=(S.mode==='cozy'?0.5:1)*(wet?7:1);S.fuel[b.id]=Math.max(0,S.fuel[b.id]-gh*k);if(S.fuel[b.id]===0){ch=1;if(Math.hypot(b.x-P.x,b.z-P.z)<500)uiToast(wet?`🌧️ Mưa đã dập tắt ${d.n.toLowerCase()}. Lần sau dựng bếp sát lều hoặc dưới mái.`:`${d.n} đã tắt. Thêm củi để nhóm lại.`,wet?'bad':'');}}
    if(b.k==='rainBarrel'&&rain&&S.wx.type!=='snow'&&!underRoof(b.x,b.z))S.tank[b.id]=Math.min(10,(S.tank[b.id]||0)+gh*2.5);
    if(b.k==='beeBox'&&si!==3)S.tank[b.id]=Math.min(5,(S.tank[b.id]||0)+gh/24*1.2);}
  if(ch)flameSync();trapTick(gh);plantsTick(gh);petsHourly(gh);folkHourly(gh);warDaily();}
/* ---------- dùng công trình ---------- */
function buildUse(t){const d=t.def,b=t.b;if(b.k==='well'){drinkWater(true);return;}
  if(b.k==='rainBarrel'){const v=S.tank[b.id]||0;if(v<1){uiToast('Thùng rỗng: chờ trời mưa sẽ đầy dần.','');return;}S.tank[b.id]=v-1;drinkWater(true);return;}
  if(b.k==='beeBox'){const h=Math.floor(S.tank[b.id]||0);if(h<1){uiToast(seasonIdx()===3?'Mùa đông ong nghỉ, không làm mật.':'Ong đang làm mật, quay lại sau nhé.','');return;}
    if(P.toolId!=='torch'&&Math.random()<0.6){addStatus('sting');sfx('hurt');uiToast('Bị ong đốt! Lần sau cầm đuốc hun khói trước.','bad');}if(!invFits('honey',h)){uiToast('Túi đầy!','bad');return;}
    S.tank[b.id]-=h;give({honey:h},[b.x,b.y+24,b.z]);addXp('gather',2*h);cnt('cnt','honey',h);sfx('pick');save();return;}if(d.fuel&&!fireLit(b)){fireStart(b);return;}if(d.st){uiOpen('craft',{st:d.st});return;}if(d.store){uiOpen('store',{b});return;}if(d.bed){sleep(b);return;}
  if(d.farm){const c=S.crops[b.id];if(!c){const sid=seedId();if(!sid){uiToast('Cần hạt giống: hái Kê dại, Cỏ lanh hoặc Dây bầu dại.','bad');return;}
      invTake(sid,1);S.crops[b.id]={k:ITEMS[sid].crop,p:0};cnt('cnt','plant');addXp('farm',3);sfx('pick');cropShow(b);uiHotbar();save();return;}
    if(cropStage(c)>=3){const bonus=Math.random()<skLv('farm')*0.08?1:0;const out=c.k==='grain'?{grain:3+bonus+Math.floor(Math.random()*3),seedGrain:1+Math.floor(Math.random()*2)}:c.k==='gourd'?{gourd:2+bonus,seedGourd:1+Math.floor(Math.random()*2)}:{fiber:5+bonus,seedFlax:1};
      give(out,[b.x,b.y+10,b.z]);delete S.crops[b.id];cnt('cnt','harvest');addXp('farm',6);sfx('pick');cropShow(b);save();}else uiToast(`Cây mới được ${Math.round(c.p*100)}%. ${seasonIdx()===3?'Mùa đông cây lớn chậm.':'Mưa và giếng nước giúp cây lớn nhanh.'}`,'');}}
const CROP_DAYS={grain:1.2,gourd:1.7,flax:1};
function cropStage(c){return Math.min(3,Math.floor((c.p||0)*3.001));}
const CROPO=new Map();
function cropShow(b){const old=CROPO.get(b.id);if(old){G.sc.remove(old.o);CROPO.delete(b.id);}const c=S.crops[b.id];if(!c)return;const st=cropStage(c),o=model(['crop',c.k,st]);o.position.set(b.x,b.y+3,b.z);o.traverse(m=>{if(m.isMesh)m.castShadow=true;});seasonPatchAll(o);G.sc.add(o);CROPO.set(b.id,{o,st});}
function cropsTick(gd){const grow=SEASONS[seasonIdx()].grow*((G.wxK||0)>0.4&&S.wx&&S.wx.type!=='snow'?1.4:1);
  for(const id in S.crops){const c=S.crops[id],b=BYID.get(+id);if(!b)continue;const well=S.builds.some(w=>(w.k==='well'||w.k==='wellStone')&&Math.hypot(w.x-b.x,w.z-b.z)<200)?2:1,scare=S.builds.some(w=>w.k==='scarecrow'&&Math.hypot(w.x-b.x,w.z-b.z)<240)?1.2:1;c.p=Math.min(1,(c.p||0)+gd/(CROP_DAYS[c.k]||1)*grow*well*scare);const v=CROPO.get(+id);if(!v||v.st!==cropStage(c))cropShow(b);}}
function sleep(b){if(G.sleeping)return;const def=pieceDef(b.k);if(!isNight()){S.p.hp=Math.min(100,S.p.hp+12);S.p.stam=maxStam();uiToast('Nghỉ một lát: hồi thể lực. Sau 19 giờ mới ngủ qua đêm được.','');save();uiHud(true);return;}
  const comfy=(underRoof(b.x,b.z)?1:0)+(fireHeat(b.x,b.z)>0?1:0)+(def.id==='bed'?1:0);
  // nằm xuống chỗ ngủ rồi mới tối màn hình
  G.act=null;G.work=null;G.sit=false;P.x=b.x;P.z=b.z;P.y=groundY(b.x,b.z);P.ry=(b.ry||0)+Math.PI/2;G.sleeping=true;P.speed=0;sfx('step');
  setTimeout(()=>uiFade(()=>{G.sleeping=false;const sum=daySummary();if(S.hour>=19)S.day++;S.hour=6.2;S.p.hp=100;S.p.stam=maxStam();S.p.food=Math.max(5,S.p.food-14);S.p.water=Math.max(5,S.p.water-16);S.p.wet=0;S.p.warm=Math.max(S.p.warm,60);
    if(comfy>=2){S.buff.rested=TNOW()+0.5;uiToast('😊 Ngủ ngon dưới mái ấm: Khỏe khoắn (làm nhanh hơn nửa ngày).','gold');}cnt('cnt','sleep');S.day_={};save();uiHud(true);uiRecap(sum);}),1400);}
function daySummary(){const d=S.day_||{},out=[];let g=0;for(const k in d)if(k.startsWith('get:'))g+=d[k];if(g)out.push(`nhặt được ${g} món`);if(d['cnt:chop'])out.push(`chặt ${d['cnt:chop']} cây`);if(d['cnt:hunt'])out.push(`săn ${d['cnt:hunt']} con thú`);
  let c=0,b=0;for(const k in d){if(k.startsWith('craft:'))c+=d[k];if(k.startsWith('build:'))b+=d[k];}if(c)out.push(`làm ${c} đồ vật`);if(b)out.push(`xây ${b} công trình`);return out;}
/* ---------- xây dựng: bóng mờ, khớp lưới, kiểm tra, đặt ---------- */
function buildBegin(id){const def=pieceDef(id);if(!def)return;if(!G.build){G.buildTap=null;if(!G.bTip){G.bTip=1;setTimeout(()=>uiToast('🏗️ Chạm vào chỗ muốn đặt để dời khung xanh tới đó, rồi bấm ✔. Xoay màn hình thoải mái, khung vẫn đứng yên.',''),300);}}const r=G.build?G.build.r:0;buildEnd();const g=model(['piece',id]);const mat=new THREE.MeshBasicMaterial({color:0x7cff9a,transparent:true,opacity:0.42,depthWrite:false});
  g.traverse(o=>{if(o.isMesh){o.material=mat;o.castShadow=false;}if(o.name==='flame')o.visible=false;});g.renderOrder=5;G.sc.add(g);G.build={id,def,g,mat,r,ok:false,pos:null,lv:(typeof playerLevel==='function'?playerLevel():0)};uiBuildBar(true,def);}
function buildEnd(){if(!G.build)return;G.sc.remove(G.build.g);G.build=null;uiBuildBar(false);}
function buildAim(){if(isFP()){const p=groundPick(innerWidth/2,innerHeight/2);if(p&&Math.hypot(p.x-P.x,p.z-P.z)<240&&Math.hypot(p.x-P.x,p.z-P.z)>14)return p;const d0=G.build&&G.build.def&&G.build.def.kind==='edge'?40:60;return {x:P.x+Math.sin(P.ry)*d0,z:P.z+Math.cos(P.ry)*d0};}if(G.mouse&&G.mouse.recent&&!G.joy.on){const p=groundPick(G.mouse.x,G.mouse.y);if(p&&Math.hypot(p.x-P.x,p.z-P.z)<320)return p;}
  if(G.buildTap&&Math.hypot(G.buildTap.x-P.x,G.buildTap.z-P.z)<340)return {x:G.buildTap.x,z:G.buildTap.z};const def=G.build&&G.build.def,d=def&&def.kind==='edge'?34:def&&def.fp&&Math.max(...def.fp)>1?62:46;G.buildTap={x:P.x+Math.sin(P.ry)*d,z:P.z+Math.cos(P.ry)*d};return {x:G.buildTap.x,z:G.buildTap.z};}
function buildUpdate(){const B=G.build;if(!B)return;const def=B.def,a=buildAim();let x,z,r=B.r%4,key=null;
  if(def.kind==='edge'){const fx=a.x/CELL,fz=a.z/CELL,cx=Math.floor(fx),cz=Math.floor(fz),dx=fx-cx,dz=fz-cz;const c=[[dz,0,0],[1-dz,0,1],[dx,1,0],[1-dx,1,1]].sort((p,q)=>p[0]-q[0])[0];
    if(c[1]===0){r=0;x=(cx+0.5)*CELL;z=(cz+c[2])*CELL;}else{r=1;x=(cx+c[2])*CELL;z=(cz+0.5)*CELL;}key=edgeKey(x,z,r);if((B.r%4)>=2)r+=2;}
  else if(def.kind==='floor'||def.kind==='roof'){x=(Math.floor(a.x/CELL)+0.5)*CELL;z=(Math.floor(a.z/CELL)+0.5)*CELL;if(def.kind==='roof'&&!def.cap&&!B.rman)r=autoRoofR(Math.floor(x/CELL),Math.floor(z/CELL));}
  else{const [w,d]=def.fp||[1,1],rw=r%2?d:w,rd=r%2?w:d,cx=Math.round(a.x/CELL-rw/2),cz=Math.round(a.z/CELL-rd/2);x=(cx+rw/2)*CELL;z=(cz+rd/2)*CELL;}
  let y,why='';const cells=def.kind==='edge'?[]:cellsOf(def,x,z,r);
  if(def.kind==='floor'){const hs=[[-18,-18],[18,-18],[-18,18],[18,18],[0,0]].map(([u,v])=>hAt(x+u,z+v));y=Math.max(...hs)-1;if(Math.max(...hs)-Math.min(...hs)>34)why='Đất dốc quá';}
  else if(def.kind==='edge'){const p1=r%2?[x-20,z]:[x,z-20],p2=r%2?[x+20,z]:[x,z+20];const f1=floorTop(p1[0],p1[1]),f2=floorTop(p2[0],p2[1]);y=f1!=null||f2!=null?Math.max(f1??-1e9,f2??-1e9):Math.min(hAt(x-(r%2?0:18),z-(r%2?18:0)),hAt(x+(r%2?0:18),z+(r%2?18:0)))-1;}
  else{const f=floorTop(x,z);y=f!=null?f:Math.max(...cells.map(([i,j])=>hAt((i+0.5)*CELL,(j+0.5)*CELL)))-0.5;}
  if(!why){if(def.kind==='edge'){if(OCC.edge.has(key))why='Đã có tường ở đây';}else{const slot=def.kind==='floor'?'floor':def.kind==='roof'?'roof':'obj';for(const [i,j] of cells){const c=OCC.cell.get(i+','+j);if(c&&c[slot]){why='Ô này đã có đồ';break;}}}}
  if(!why&&def.kind!=='roof'){const rad=def.kind==='edge'?20:(def.fp?Math.max(...def.fp)*20:20);for(const i of near(x,z,rad+30)){const q=RES[i];if(q.st!==0||RT[q.t].pass)continue;if(Math.hypot(q.x-x,q.z-z)<rad*0.75+(RT[q.t].r||4)*0.6){why='Vướng '+RT[q.t].n.toLowerCase()+': dọn trước đã';break;}}}
  if(!why&&wdAt(x,z)>1&&def.kind!=='edge'&&!/^(stilt|post|fishTrap)/.test(B.id))why='Không xây trên nước (dựng cột nhà sàn trước)';if(!why&&Math.hypot(x-P.x,z-P.z)>330)why='Xa quá';if(!why&&!lvOk(def.lv))why='Cần '+lvText(def.lv);if(!why&&!canPay(def.cost))why='Thiếu nguyên liệu';
  B.pos={x,y,z,r};B.ok=!why;B.why=why;B.g.position.set(x,y,z);B.g.rotation.y=r*Math.PI/2;B.mat.color.set(why?0xff6a5a:0x7cff9a);if(G.t-(B.uiT||0)>0.2){B.uiT=G.t;uiBuildBar(true,def,why);}}
function buildPlace(){const B=G.build;if(!B||!B.pos)return;if(!B.ok){uiToast(B.why||'Không đặt được ở đây','bad');sfx('no');return;}const def=B.def;pay(def.cost);
  const b={id:S.bseq++,k:B.id,x:+B.pos.x.toFixed(1),y:+B.pos.y.toFixed(1),z:+B.pos.z.toFixed(1),r:B.pos.r,prog:0,lv:B.lv||0};if(B.id==='treePlatform'&&B.tree){b.tree=B.tree.i;B.tree.lock=b.id;treeMove(B.tree,b.x,b.z);}S.builds.push(b);structAdd(b);cnt('build',B.id);if(!G.siteTip){G.siteTip=1;uiToast('Đã dựng khung. Thoát chế độ xây, đứng gần khung và bấm Hành động để đóng, buộc cho xong.','');}
  sfx('build');if(def.store)S.store[b.id]=Array(def.store).fill(null);if(def.fuel){S.fuel[b.id]=0;flameSync();}if(b.k==='rainBarrel'||b.k==='beeBox')S.tank[b.id]=0;if(def.kind==='roof'||def.kind==='edge')decoRebuild();unlockCheck();uiHotbar();save();if(!canPay(def.cost)){uiToast(`Hết nguyên liệu cho ${def.n}.`,'');buildEnd();}}
function buildRemoveAt(){const a=buildAim();let best=null,bd=1e9;const L=G.build?G.build.lv||0:0;for(const b of S.builds){const d=Math.hypot(b.x-a.x,b.z-a.z)+Math.abs((b.lv||0)-L)*30;if(d<bd){bd=d;best=b;}}if(!best||bd>40){uiToast('Không có công trình nào ở đó.','');return;}
  const def=pieceDef(best.k);if(def.store&&(S.store[best.id]||[]).some(Boolean)){uiToast('Lấy hết đồ trong '+def.n+' trước đã.','bad');return;}
  structRemove(best);if(def.kind==='roof'||def.kind==='edge')decoRebuild();const back={};for(const k in def.cost)back[k]=S.mode==='cozy'?def.cost[k]:Math.ceil(def.cost[k]/2);give(back,[best.x,best.y+10,best.z]);sfx('chop');save();}
function structFx(b){for(let i=0;i<8;i++)setTimeout(()=>puff(b.x+(Math.random()-0.5)*30,b.y+Math.random()*10,b.z+(Math.random()-0.5)*30,'#cdbb9a',8),i*40);}
/* ---------- mái tự ẩn khi đứng trong nhà ---------- */
// mái tự xoay: tìm khối nền nhà liền nhau, mái dốc về hai phía của đường nóc chạy theo chiều dài nhà
function autoRoofR(cx,cz){const seen=new Set([cx+','+cz]),q=[[cx,cz]];let x0=cx,x1=cx,z0=cz,z1=cz;
  while(q.length&&seen.size<90){const [i,j]=q.shift();for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const k=(i+di)+','+(j+dj);if(seen.has(k))continue;const c=OCC.cell.get(k);if(!c||!(c.floor||c.roof))continue;seen.add(k);q.push([i+di,j+dj]);
    x0=Math.min(x0,i+di);x1=Math.max(x1,i+di);z0=Math.min(z0,j+dj);z1=Math.max(z1,j+dj);}}
  if(x1-x0>=z1-z0)return (cz+0.5)>=(z0+z1+1)/2?0:2;return (cx+0.5)>=(x0+x1+1)/2?1:3;}
// thanh nóc + tường hồi tam giác: tự sinh từ mái và tường (không tốn nguyên liệu, không lưu)
const DECO={};
function decoRebuild(){const want={ridge:[],gable:[]},at=new Map(),RD=[[0,-1],[-1,0],[0,1],[1,0]];
  S.builds.forEach(b=>{if(b.k==='roof')at.set(Math.floor(b.x/CELL)+','+Math.floor(b.z/CELL),b);});
  at.forEach((b,key)=>{const cx=Math.floor(b.x/CELL),cz=Math.floor(b.z/CELL),r=((b.r%4)+4)%4,d=RD[r];
    if(r<2){const o=at.get((cx+d[0])+','+(cz+d[1]));if(o&&((o.r%4)+4)%4===r+2)want.ridge.push({x:b.x+d[0]*CELL/2,y:b.y,z:b.z+d[1]*CELL/2,r:r===0?0:1});}
    const side=r%2===0?[[b.x-CELL/2,b.z,1],[b.x+CELL/2,b.z,1]]:[[b.x,b.z-CELL/2,0],[b.x,b.z+CELL/2,0]];
    side.forEach(([x,z,er])=>{const id=OCC.edge.get(edgeKey(x,z,er));const w=id&&BYID.get(id),wd=w&&pieceDef(w.k);if(!wd||wd.low)return;want.gable.push({x,y:b.y,z,r:(r+3)%4});});});
  for(const k in want){const L=want[k];let e=DECO[k];if(!L.length&&!e)continue;if(!e)e=DECO[k]={api:null,cap:0,list:[]};
    if(L.length>e.cap){if(e.api){e.api.dispose();G.sc.remove(e.api.G);}e.cap=Math.max(8,L.length*2);e.api=instGroup(piecePrep(k).parts,e.cap,{});G.sc.add(e.api.G);seasonPatchAll(e.api.G);}
    e.list=L;for(let i=0;i<e.cap;i++){if(i<L.length)setPieceM(e.api,i,L[i]);else e.api.hide(i);}e.api.flush();}
  G.cutK=null;roofCut();}
function roofCut(){const c0=cellAt(P.x,P.z),inside=!isFP()&&!!(c0&&c0.roof)&&underRoof(P.x,P.z),ck=inside?Math.floor(P.x/CELL)+','+Math.floor(P.z/CELL):'out';if(ck===G.cutK)return;G.cutK=ck;G.cut=inside;for(const k in DECO){const e=DECO[k];if(!e.api)continue;e.list.forEach((d,i)=>{if(inside&&Math.hypot(d.x-P.x,d.z-P.z)<160)e.api.hide(i);else setPieceM(e.api,i,d);});e.api.flush();}['roof','roofCap'].forEach(k=>{const e=SI.get(k);if(!e||!e.api)return;
  e.map.forEach((idx,id)=>{const b=BYID.get(id);if(!b)return;if(inside&&Math.hypot(b.x-P.x,b.z-P.z)<160)e.api.hide(idx);else setPieceM(e.api,idx,b);});e.api.flush();});}
/* ---------- hiệu ứng: bụi, cây đổ, rung ---------- */
let PUFFT=null;function puffTex(){if(PUFFT)return PUFFT;const cv=mkCanvas(64,64),c=cv.getContext('2d'),g=c.createRadialGradient(32,32,0,32,32,30);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(0.5,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,64,64);PUFFT=new THREE.CanvasTexture(cv);return PUFFT;}
function puff(x,y,z,col,n){for(let i=0;i<(n||5);i++){if(G.fx.length>70)return;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:puffTex(),color:col,transparent:true,depthWrite:false,opacity:0.85}));s.position.set(x+(Math.random()-0.5)*10,y+(Math.random()-0.5)*8,z+(Math.random()-0.5)*10);s.scale.setScalar(4+Math.random()*4);G.sc.add(s);
  G.fx.push({o:s,t:0,life:0.55+Math.random()*0.4,vx:(Math.random()-0.5)*60,vy:20+Math.random()*50,vz:(Math.random()-0.5)*60});}}
function shakeRes(q){G.shake={q,t:0};}
function fallTree(q){const g=model(RT[q.t].m);g.traverse(o=>{if(o.isMesh)o.castShadow=true;});seasonPatchAll(g);const pv=new THREE.Group();pv.position.set(q.x,q.y,q.z);g.scale.setScalar(q.s);g.rotation.y=q.ry;const tilt=new THREE.Group();tilt.add(g);pv.add(tilt);G.sc.add(pv);
  G.fx.push({tree:pv,tilt,t:0,life:1.6,dir:Math.atan2(q.x-P.x,q.z-P.z)});sfx('fall');}
function fxTick(dt){for(let i=G.fx.length-1;i>=0;i--){const f=G.fx[i];f.t+=dt;if(f.tree){const k=Math.min(1,f.t/1.0);const ax=new THREE.Vector3(Math.cos(f.dir),0,-Math.sin(f.dir));f.tilt.quaternion.setFromAxisAngle(ax,k*k*1.45);
      if(f.t>1.1){f.tilt.scale.setScalar(Math.max(0.001,1-(f.t-1.1)/0.5));}if(f.t>0.95&&!f.thud){f.thud=1;sfx('thud');puff(f.tree.position.x+Math.sin(f.dir)*70,f.tree.position.y+4,f.tree.position.z+Math.cos(f.dir)*70,'#c9b48a',10);}
      if(f.t>=f.life){G.sc.remove(f.tree);G.fx.splice(i,1);}continue;}
    const k=f.t/f.life;f.o.position.x+=f.vx*dt;f.o.position.y+=f.vy*dt;f.o.position.z+=f.vz*dt;f.vy-=60*dt;f.o.material.opacity=0.85*(1-k);f.o.scale.setScalar(f.o.scale.x+dt*10);if(k>=1){G.sc.remove(f.o);f.o.material.dispose();G.fx.splice(i,1);}}
  if(G.shake){const s=G.shake;s.t+=dt;const q=s.q,a=RI.get(q.gk).api;if(s.t<0.3&&q.st===0){const w=Math.sin(s.t*60)*0.04*(1-s.t/0.3);a.set(q.gi,q.x,q.y,q.z,q.ry+w,q.s*(1-Math.abs(w)*0.3));}else{if(q.st===0)a.set(q.gi,q.x,q.y,q.z,q.ry,q.s);G.shake=null;}a.flush();}}
/* ---------- chọn điểm trên mặt đất từ màn hình ---------- */
function groundPick(sx,sy){const T=THREE,v=new T.Vector3((sx/innerWidth)*2-1,-(sy/innerHeight)*2+1,0.5).unproject(G.cam),o=G.cam.position.clone(),dir=v.sub(o).normalize();let y=P.y,p=null;
  for(let i=0;i<4;i++){if(Math.abs(dir.y)<1e-4)return null;const t=(y-o.y)/dir.y;if(t<=0)return null;p=o.clone().addScaledVector(dir,t);y=groundY(p.x,p.z);}return p;}
/* ---------- ngày đêm, bầu trời ---------- */
const SKYP={day:{top:'#1e6ee0',hor:'#cdeaf7',gnd:'#6f8a52',sun:'#fff4dc'},dusk:{top:'#3a3a78',hor:'#f0a070',gnd:'#4a3a3a',sun:'#ffb070'},night:{top:'#0a1024',hor:'#26324e',gnd:'#0c0e14',sun:'#8aa6ff'},storm:{top:'#4a5260',hor:'#7a8490',gnd:'#3a3e40',sun:'#c8ccd0'}};
function dayTick(dt){const prevH=S.hour;if(typeof wcStep==='function')wcStep(dt);else{S.hour+=dt*24/DAY_SEC;if(S.hour>=24){S.hour-=24;S.day++;uiToast(`Ngày ${wcAge()} · Mùa ${SEASONS[seasonIdx()].n}`,'');}}
  const h=S.hour,el=Math.sin((h-6)/12*Math.PI),day=clamp(el*3+0.25,0,1),dusk=clamp(1-Math.abs(el)*4,0,1)*(h>12?1:0.8),cloud=G.wxK||0;G.dayK=day;
  const sun=G.L.sun,sa=(h-6)/12*Math.PI,sx=Math.cos(sa)*-0.8,sy=Math.max(0.12,Math.sin(sa)),sz=0.35;sun.position.set(P.x+sx*900,P.y+sy*900,P.z+sz*900);sun.target.position.set(P.x,P.y,P.z);
  sun.intensity=1.6*Math.max(0,el)**0.6*day*(1-cloud*0.62);G.L.hemi.intensity=(0.15+0.25*day+(S.mode==='cozy'?0.07:0.03))*(1+cloud*0.4);/* sáng nền cao hơn: bóng râm ngả lam chứ không đen */G.moon.intensity=(1-day)*(S.mode==='cozy'?0.5:0.32)*(1-cloud*0.5);G.moon.position.set(P.x+300,P.y+700,P.z-200);G.moon.target.position.set(P.x,P.y,P.z);
  if(G.flash){G.L.hemi.intensity+=G.flash*2.5;G.flash=Math.max(0,G.flash-dt*5);}
  if(G.sky){const u=G.sky.material.uniforms,C=THREE.Color;const SC=dayTick.C||(dayTick.C=(()=>{const o={};for(const p in SKYP){o[p]={};for(const k in SKYP[p])o[p][k]=new C(SKYP[p][k]);}o.tmp=new C();return o;})());const mix=k=>{const c=SC.tmp.copy(SC.day[k]);c.lerp(SC.dusk[k],dusk*0.85);c.lerp(SC.storm[k],cloud*0.75*day);c.lerp(SC.night[k],1-day);return c;};
    u.cT.value.copy(mix('top'));u.cH.value.copy(mix('hor'));u.cG.value.copy(mix('gnd'));u.sC.value.copy(mix('sun'));u.sD.value.set(sx,Math.sin(sa),sz).normalize();u.sI.value=day*(1-cloud);if(u.tm){u.tm.value=G.t;u.cv.value=(G.q|0)<=0&&G.lowSky?2:0.5-cloud*0.2;}if(G.sc.fog){G.sc.fog.color.copy(u.cH.value);const fF=(G.fogF||2000)+(isFP()?0:G.zoom*1.2),fN=(G.fogN||400)+(isFP()?0:G.zoom);G.sc.fog.near=fN*(1-cloud*0.35);G.sc.fog.far=fF*(1-cloud*0.3);}if(G.sc.background)G.sc.background.copy(u.cH.value);}
  if(G.envK==null||Math.abs(G.envK-day)>0.05){G.envK=day;G.sc.traverse(o=>{if(o.material&&o.material.isMeshStandardMaterial)o.material.envMapIntensity=0.25+0.75*day;});}
  if(Math.floor(prevH)!==Math.floor(S.hour)&&S.hour>=19&&prevH<19)uiToast('🌙 Trời tối dần. Đốt lửa, cầm đuốc hoặc về lều ngủ.','');}
function die(){if(G.dying)return;G.dying=1;uiFade(()=>{const bed=S.builds.find(b=>pieceDef(b.k)&&pieceDef(b.k).bed)||S.builds.find(b=>b.k==='campfire');P.x=bed?bed.x+24:SPAWN[0];P.z=bed?bed.z+24:SPAWN[1];
  Object.assign(S.p,{hp:60,stam:60,wet:0});S.p.food=Math.max(S.p.food,40);S.p.water=Math.max(S.p.water,40);S.p.warm=Math.max(S.p.warm,55);delete S.st.bleed;
  if(S.mode==='survival'){let lost=0;S.inv.forEach((s,i)=>{if(s&&ITEMS[s.id].t==='res'&&Math.random()<0.5){S.inv[i]=null;lost++;}});if(lost)uiToast(`Bạn đánh rơi ${lost} ô đồ khi ngất.`,'bad');}
  save();G.dying=0;uiToast('Bạn ngất đi và tỉnh dậy ở nơi an toàn.','bad');uiHud(true);uiHotbar();});}
/* ---------- ánh sáng lửa ---------- */
function lightsTick(t){const T=THREE;if(!G.lights.length)for(let i=0;i<((G.q|0)>0?4:2);i++){const l=new T.PointLight(0xff9a50,0,300,1.7);G.sc.add(l);G.lights.push(l);}
  const night=1-(G.dayK??1);if(t-(G.lgT||-9)>0.3){G.lgT=t;const fl=G.lgF||(G.lgF=[]);fl.length=0;for(const f of G.flames){if(f.off)continue;const d=Math.hypot(f.x-P.x,f.z-P.z);if(d<900)fl.push({f,d});}fl.sort((a,b)=>a.d-b.d);}const fl=G.lgF||[];
  G.lights.forEach((l,i)=>{const e=fl[i];if(!e||e.f.off){l.intensity=0;return;}l.position.set(e.f.x,e.f.y+16,e.f.z);l.intensity=(0.6+night*2.2)*(0.85+0.15*Math.sin(t*13+e.f.ph));});
  G.flames.forEach(f=>{const k=1+Math.sin(t*11+f.ph)*0.08;f.o.scale.set(1,k,1);});P.light.intensity=P.toolId==='torch'?(0.4+night*2.4):0;P.light.position.set(P.x,P.y+40,P.z);}
/* ---------- vòng lặp ---------- */
let LAST=0;
function loop(now){requestAnimationFrame(loop);if(!G.on||G.lost)return;const rawDt=(now-(LAST||now))/1000,dt=Math.min(0.05,rawDt);LAST=now;G.t+=dt;G.dt=dt;
  if(K3.GU){K3.GU.time.value=now/1000;K3.GU.scale.value=G.R.getPixelRatio()*innerHeight/900;}
  if(!G.paused){if(!ladderTick(dt)&&!rideTick(dt))moveTick(dt);npcTick(dt);folkTick(dt);foesTick(dt);raidTick();roofCut();actTick(dt);workTick(dt);projTick(dt);petsTick(dt);insectsTick(dt);fishTick(dt);smallLifeTick(dt);cleanTick(dt);dayTick(dt);weatherTick(dt);bodyTick(dt);seasonTick(dt);animalsTick(dt);if(G.t-(G.rgT||0)>2){const gd=(G.t-(G.rgT||G.t))*1/DAY_SEC;G.rgT=G.t;resRegrow();cropsTick(gd);fuelTick(gd*24);roofCut();}}
  animTick(dt);fxTick(dt);crittersTick(dt);birdsTick(dt);ambTick(dt);lightsTick(now/1000);grassTick();cullTick();skyTick();miniTick();fpArmTick(dt);exploreTick();if(typeof hlTick==='function')hlTick();compassTick();dropTick();uiActsTick();if(G.throwAnim>0)G.throwAnim-=dt;if(G.build)buildUpdate();camTick(dt);
  const tg=G.build||G.paused?null:findTarget();G.target=tg;uiTarget(tg);
  if(K3.fx)K3.fx.render(G.R,G.sc,G.cam,{vig:0.24,bloom:0.45,post:G.q>0&&!G.noPost});else G.R.render(G.sc,G.cam);
  perfTick(rawDt);if(G.t-G.lastSave>15){G.lastSave=G.t;save();}if(G.t-(G.hudT||0)>0.4){G.hudT=G.t;uiHud();}}
// máy yếu: tự giảm chất lượng
function perfTick(dt){if(!(dt>0)||dt>0.25)return;G.pfWarm=(G.pfWarm||0)+dt;if(G.pfWarm<3)return;G.ft=(G.ft||dt)*0.94+dt*0.06;G.prT=(G.prT||0)+dt;if(G.prT<1.2)return;G.prT=0;const k=G.prK||1;
  // độ phân giải động: giữ khoảng 40-60 khung hình/giây. Cần 2 lần đo chậm liên tiếp mới hạ, 3 lần nhanh mới nâng; vừa hạ thì chờ 20 s mới nâng lại (tránh nhảy qua lại gây giật)
  const cap=typeof SET!=='undefined'&&SET.fpsCap?1/SET.fpsCap:0,slow=Math.max(0.027,cap*1.22),fast=Math.max(0.0175,cap*1.08);// có giới hạn khung hình thì ngưỡng chậm/nhanh tính theo giới hạn đó
  if(G.ft>slow){G.pfUp=0;G.pfDn=(G.pfDn||0)+1;}else if(G.ft<fast){G.pfDn=0;G.pfUp=(G.pfUp||0)+1;}else{G.pfDn=0;G.pfUp=0;}
  /* CHỐNG GIẬT: mỗi lần đổi độ nét là cấp phát lại toàn bộ bộ đệm hình (khựng một nhịp). Trước: hạ nhanh, 20 giây sau lại nâng, rồi lại hạ → cứ vài chục giây khựng một lần.
     Giờ: hạ theo nấc lớn (0.15), sau mỗi lần hạ phải mượt liên tục lâu mới được nâng (2 phút, mỗi lần hạ lại tăng gấp đôi, tối đa 15 phút), và nâng cần 6 lần đo nhanh liên tiếp. */
  if(G.pfDn>=2&&k>0.55){G.pfDn=0;G.prK=Math.max(0.55,+(k-0.15).toFixed(2));G.pfDnT=G.t;G.pfHold=Math.min(900,(G.pfHold||60)*2);resize();}
  else if(G.pfUp>=6&&k<1&&G.t-(G.pfDnT||-999)>(G.pfHold||120)){G.pfUp=0;G.prK=Math.min(1,+(k+0.15).toFixed(2));G.pfDnT=G.t;resize();}
  else if(G.ft>Math.max(0.034,cap*1.3)&&k<=0.56&&G.q>0&&!G.noAdapt&&G.pfDn>=2){G.pfDn=0;G.q--;G.prK=0.8;applyQ();console.info('Giảm chất lượng đồ họa còn mức',G.q);}}
function moveTick(dt){let ix=0,iz=0;const k=G.keys,fp=isFP();if(k.KeyW||k.ArrowUp)iz-=1;if(k.KeyS||k.ArrowDown)iz+=1;if(k.KeyA||(!fp&&k.ArrowLeft))ix-=1;if(k.KeyD||(!fp&&k.ArrowRight))ix+=1;if(fp){if(k.ArrowLeft)P.ry+=dt*2.2;if(k.ArrowRight)P.ry-=dt*2.2;}swimCheck();if(G.work){if(Math.hypot(ix,iz)>0.3)workStop('Đã dừng tay.');}
  if(G.joy.on){ix=G.joy.x;iz=G.joy.y;}let m=Math.hypot(ix,iz);
  // nhảy + trọng lực
  if(G.jumpReq){G.jumpReq=0;if(!P.air&&S.p.stam>=8){P.vy=150;P.air=true;S.p.stam-=8;sfx('jump');addXp('run',0.5);}else if(!P.air)uiToast('Mệt quá, không nhảy nổi. Nghỉ chút đã.','');}
  const gy=groundY(P.x,P.z);if(P.air){P.vy-=520*dt;P.y+=P.vy*dt;if(P.y<=gy){const v=-P.vy;P.y=gy;P.air=false;P.vy=0;sfx(v>260?'thud':'step');if(v>300&&!G.swim&&wdAt(P.x,P.z)<4){const dmg=(v-300)*(S.mode==='cozy'?0.08:0.16);S.p.hp=Math.max(S.mode==='cozy'?5:0,S.p.hp-dmg);G.shakeCam=0.4;if(dmg>2){uiToast(`🦴 Ngã từ trên cao: -${Math.round(dmg)} máu.`,'bad');sfx('hurt');}if(dmg>18&&Math.random()<0.5)addStatus('bleed');}}}
  G.running=false;
  if(m<0.05&&G.walkTo){const w=G.walkTo,dx=w.x-P.x,dz=w.z-P.z,d=Math.hypot(dx,dz);const stop=w.t?((w.t.type==='res'?(RT[w.t.q.t].r||4)*w.t.q.s*0.7:w.t.type==='animal'?w.t.a.r:w.t.type==='build'?16:4)+REACH*0.6):6;
    if(d<=stop){const t=w.t;G.walkTo=null;if(t)actStart(t);}else{const yaw=Math.atan2(dx,dz);P.ry=lerpAng(P.ry,yaw,Math.min(1,dt*10));move(Math.sin(yaw),Math.cos(yaw),1,dt,false);}if(G.walkTo&&G.t-(w.t0||G.t)>14)G.walkTo=null;return;}
  if(m>0.05){G.walkTo=null;if(G.act)G.act=null;if(G.sit)sitToggle(false);if(m>1){ix/=m;iz/=m;m=1;}let wx,wz;if(isFP()){const f=[Math.sin(P.ry),Math.cos(P.ry)];wx=f[0]*-iz+(-f[1])*ix;wz=f[1]*-iz+f[0]*ix;}else{const cy=Math.cos(G.yaw),sy=Math.sin(G.yaw);wx=ix*cy+iz*sy;wz=-ix*sy+iz*cy;const yaw=Math.atan2(wx,wz);P.ry=lerpAng(P.ry,yaw,Math.min(1,dt*12));}
    const run=(k.ShiftLeft||k.ShiftRight||G.runBtn||G.runAuto)&&S.p.stam>3;move(wx,wz,m,dt,run);}else{P.speed*=0.8;}}
function move(dx,dz,m,dt,run){if(G.sleeping){P.speed=0;return;}const slow=(S.p.food<=0||S.p.water<=0)&&S.mode==='cozy'?0.75:1,ill=S.st.fever?0.8:1,tired=S.p.stam<3?0.75:1,wade=G.swim?0.48:wdAt(P.x,P.z)>1&&floorTop(P.x,P.z)==null?0.55:1,trail=trailAt(P.x,P.z)>0.4?1.12:1,sneak=G.sneak?0.5:1;let sp=112*m*slow*ill*tired*wade*trail*sneak;if(G.swim)run=false;
  if(run){sp*=1.55;S.p.stam=Math.max(0,S.p.stam-dt*11);G.running=true;G.runXp=(G.runXp||0)+dt;if(G.runXp>4){G.runXp=0;addXp('run',1);}}
  let nx=P.x+dx*sp*dt,nz=P.z+dz*sp*dt;G.climb=false;if(P.air){if(groundY(nx,nz)>P.y+5){const gx=groundY(nx,P.z)>P.y+5,gz=groundY(P.x,nz)>P.y+5;if(!gx)nz=P.z;else if(!gz)nx=P.x;else{nx=P.x;nz=P.z;}}}else if(!G.swim&&floorTop(nx,nz)==null){const h0=hAt(P.x,P.z),h1=hAt(nx,nz),st=Math.hypot(nx-P.x,nz-P.z)||1,gr=(h1-h0)/st;if(gr>1.4){if(S.p.stam>4){G.climb=true;nx=P.x+(nx-P.x)*0.45;nz=P.z+(nz-P.z)*0.45;S.p.stam=Math.max(0,S.p.stam-dt*6);G.climbXp=(G.climbXp||0)+dt;if(G.climbXp>3){G.climbXp=0;addXp('run',1);}if(!G.climbTip){G.climbTip=1;uiToast('🧗 Đang leo vách: tốn nhiều thể lực, hết sức sẽ tuột.','');}}else{nx=P.x;nz=P.z;if(G.t-(G.climbNo||0)>4){G.climbNo=G.t;uiToast('😮‍💨 Hết sức leo. Ngồi nghỉ cho lại sức, hoặc tìm chỗ dốc thoải hơn để đi.','');}}}else if(gr>1.0){nx=P.x+(nx-P.x)*0.7;nz=P.z+(nz-P.z)*0.7;}}
  const c=collide(nx,nz);if(c){P.x=c[0];P.z=c[1];}P.speed=sp;if(!wIn(P.x,P.z,1.05)){if(WV>=4&&P.z>4000){P.x=clamp(P.x,-WSIZE/2+240,WSIZE/2-240);P.z=Math.min(P.z,WSIZE-WOZ-240);}else{const a=Math.atan2(P.z,P.x);P.x=Math.cos(a)*WR*1.05;P.z=Math.sin(a)*WR*1.05;}}}
function animTick(dt){const R=P.rig;if(!R)return;if(!P.air&&!G.ride){/* đang ngồi bè, thuyền: độ cao do bè quyết định, không kéo về đáy suối (trước: nước nông là nhân vật chìm xuyên qua bè) */const gy=groundY(P.x,P.z);if(P.y-gy>(G.swim||G.ride||G.ladder?22:7)&&!G.climb){P.air=true;P.vy=Math.min(0,P.vy||0);}else P.y+=(gy-P.y)*Math.min(1,dt*(G.climb?6:14));}P.model.position.set(P.x,P.y,P.z);P.model.rotation.y=P.ry;P.blob.position.set(P.x,Math.max(hAt(P.x,P.z),groundY(P.x,P.z))+0.6,P.z);
  const t=G.t;let mode='idle';if(G.act)mode=P.anim;else if(G.drinkT>0){G.drinkT-=dt;mode='gather';}else if(P.air)mode='jump';else if(P.speed>8)mode='walk';
  R.legL.rotation.x=R.legR.rotation.x=0;R.armL.rotation.x=R.armR.rotation.x=0;R.torso.rotation.x=0;R.head.rotation.set(0,0,0);if(typeof poseApply==='function'&&poseApply(R,mode,t))return;if(actsPose(R,t))return;
  if(mode==='walk'){const f=P.speed/112*10.5,s=Math.sin(t*f);R.legL.rotation.x=s*0.7;R.legR.rotation.x=-s*0.7;R.armL.rotation.x=-s*0.55;R.armR.rotation.x=P.toolId==='torch'?-0.9+s*0.08:P.tool?s*0.25-0.35:s*0.55;P.model.position.y+=Math.abs(s)*(G.running?2:1.2);R.torso.rotation.x=G.running?0.15:0;}
  else if(mode==='jump'){R.legL.rotation.x=-0.6;R.legR.rotation.x=0.3;R.armL.rotation.x=-1.2;R.armR.rotation.x=-1.4;}
  else if(mode==='chop'){const A=G.act,per=A&&A.per||0.72,k=clamp(1-(A?A.next:0)/per,0,1);const sw=k<0.55?-2.6*(k/0.55):-2.6+3.3*((k-0.55)/0.45);R.armR.rotation.x=sw;R.armL.rotation.x=sw*0.6;R.torso.rotation.x=k<0.55?-0.12:0.22*((k-0.55)/0.45);R.legL.rotation.x=0.3;R.legR.rotation.x=-0.25;}
  else if(mode==='gather'){const s=Math.sin(t*9);R.torso.rotation.x=0.45;R.armR.rotation.x=-0.9+s*0.3;R.armL.rotation.x=-0.7-s*0.3;R.legL.rotation.x=0.35;R.legR.rotation.x=-0.1;R.head.rotation.x=0.2;}
  else{const s=Math.sin(t*2.2);R.head.rotation.z=s*0.03;R.armL.rotation.x=s*0.05;R.armR.rotation.x=P.toolId==='torch'?-0.9+s*0.03:P.tool?-0.25:-s*0.05;R.torso.scale.y=1+s*0.012;if(S.p.warm<25){R.torso.rotation.z=Math.sin(t*40)*0.02;}}
  if(P.hurtT>0){P.hurtT-=dt;R.torso.rotation.x=-0.25;}}
function camTick(dt){if(isFP()){fpCam(dt);occTick(G.cam,G.R,P.x,P.y,P.z,false);return;}if(G.cam.near!==4){G.cam.near=4;resize();}const T=THREE,D=G.zoom,cp=Math.cos(G.pitch);if(!G.ctv)G.ctv=new T.Vector3(P.x,P.y+14,P.z);G.ctv.lerp(new T.Vector3(P.x,P.y+14,P.z),1-Math.exp(-dt*14));const tx=G.ctv.x,ty=G.ctv.y,tz=G.ctv.z;const want=new T.Vector3(tx+Math.sin(G.yaw)*cp*D,ty+Math.sin(G.pitch)*D,tz+Math.cos(G.yaw)*cp*D);
  if(!G.camInit){G.cam.position.copy(want);G.camInit=1;}else G.cam.position.lerp(want,1-Math.exp(-dt*7));const gh=hAt(G.cam.position.x,G.cam.position.z)+30;if(G.cam.position.y<gh)G.cam.position.y=gh;G.cam.lookAt(tx,ty,tz);occTick(G.cam,G.R,P.x,P.y,P.z,!G.build);}
/* ---------- khởi động ---------- */
// thư viện 3D three.js 0.149.0: thử lần lượt từng nguồn, nguồn nào tải được thì dùng
const TSRI='sha384-RRHfJ6w1mTlKUBMYT/hvnRiOzEB/vyRV3DrQOseb6oYfvaZSfdd0byS4bHps0k2R';
const TURLS=['https://cdnjs.cloudflare.com/ajax/libs/three.js/0.149.0/three.min.js','https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js','https://unpkg.com/three@0.149.0/build/three.min.js'];
function boot(d){uiInit();const o=loadSave();if(o){S=o;if(d&&d.cont){uiOverlay(false);startGame();return;}uiOpen('start',{cont:true});}else uiOpen('start',{cont:false});}
// trang được cập nhật khi đang chơi: lưu lại rồi vào thẳng ván đang chơi
function bootHot(){const h=window.claude&&window.claude.hot;try{if(h&&typeof h.snapshot==='function')h.snapshot(()=>{try{save();}catch(e){}return {cont:!!G.on};});}catch(e){}
  const go=d=>boot(d||{});try{if(h&&typeof h.ready==='function'){h.ready(go);return;}}catch(e){}go(h&&h.data||{});}
function startGame(){if(G._starting||G.on)return;G._starting=1;uiLoading(true);const go=()=>{try{K3init();K3lightsInit();if(typeof K3fxInit==='function')K3fxInit();if(typeof K3charInit==='function')K3charInit();if(typeof SBmodelsInit==='function')SBmodelsInit();if(typeof K3char2Init==='function')try{K3char2Init();}catch(e){console.warn('người',e);}if(typeof SBmodels2Init==='function')try{SBmodels2Init();}catch(e){console.warn('mô hình 2',e);}if(typeof SBmodels3Init==='function')try{SBmodels3Init();}catch(e){console.warn('mô hình 3',e);}if(typeof SBmodels4aInit==='function')try{SBmodels4aInit();}catch(e){console.warn('mô hình 4a',e);}if(typeof SBmodels4bInit==='function')try{SBmodels4bInit();}catch(e){console.warn('mô hình 4b',e);}if(typeof SBmodels5Init==='function')try{SBmodels5Init();}catch(e){console.warn('mô hình 5',e);}if(typeof SBmodels6vInit==='function')try{SBmodels6vInit();}catch(e){console.warn('cây v6',e);}if(typeof SBmodels6cInit==='function')try{SBmodels6cInit();}catch(e){console.warn('thú người v6',e);}
    sceneInit();unlockCheck();uiHotbar();uiHud(true);uiLoading(false);inputInit();requestAnimationFrame(loop);G.lastSave=0;setTimeout(treeLoLater,2500);
    uiToast(S.goal===0?'Bạn tỉnh dậy với hai bàn tay trắng. Hãy bắt đầu từ những cành khô quanh đây.':`Chào mừng trở lại, ${S.name}! Ngày ${wcAge()} · Mùa ${SEASONS[seasonIdx()].n}.`,'');}catch(e){console.error(e);uiLoading(false);uiError('Không khởi động được đồ họa 3D: '+e.message);}};
  // cho màn "Đang tạo thế giới…" kịp hiện ra trước khi bắt đầu dựng (trước đây khoá luồng ngay → bấm Bắt đầu thấy đứng hình vài giây)
  if(window.THREE){requestAnimationFrame(()=>setTimeout(go,20));return;}const load=i=>{if(i>=TURLS.length){uiLoading(false);uiError('Không tải được thư viện 3D. Kiểm tra kết nối mạng rồi tải lại trang.');return;}const s=document.createElement('script');s.src=TURLS[i];s.crossOrigin='anonymous';s.integrity=TSRI;/* chỉ chạy đúng tệp three.js r149 đã biết: máy chủ phát tệp bị sửa thì trình duyệt từ chối */s.onload=()=>{if(window.THREE)go();else load(i+1);};s.onerror=()=>{s.remove();load(i+1);};document.head.appendChild(s);};load(0);}
document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
