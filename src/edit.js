/* ===================== SỬA CÔNG TRÌNH ĐÃ XÂY: DI CHUYỂN, THÁO DỠ =====================
   • ✋ Di chuyển: chọn công trình → nhấc lên → bóng xanh theo chỗ chạm (xoay, đổi tầng, ✥ đặt tự do cho đồ nhỏ) → ✔ Đặt xuống.
     Công trình giữ nguyên mã số (id) nên mọi thứ gắn với nó đi theo: đồ trong rương/giỏ, củi lửa, cây trồng, nước, trứng,
     gốm đang phơi, độ bền/độ khô (build3), ruộng lúa (life4), người ngủ trên giường. Chưa bấm ✔ thì chưa có gì thay đổi:
     ✕ là để lại nguyên chỗ cũ.
   • 🏠 Cả cụm: dời cả ngôi nhà (sàn, tường, cột, mái, đồ trong nhà) giữ nguyên vị trí tương đối và các tầng, xoay 90°.
   • 🔨 Tháo dỡ: làm từng bước, hoàn lại phần lớn gỗ, đá; tranh, đất sét một phần; đồ nung không lấy lại được.
     Đồ trong rương dồn vào túi (rồi vào giỏ, rương gần đó). Không tháo được công trình của người chơi khác.
   • Chịu lực: không dời/tháo cột, tường đang đỡ sàn trên hoặc mái; không dời sàn đang có đồ đặt trên.
   Lối vào: thanh xây (Đặt mới / ✋ Di chuyển / 🔨 Tháo dỡ), bảng Xây, nút 🛠️ Sửa cạnh nút Hành động khi đứng gần công trình. */
const ED={hl:null,mat:{},proto:{},tap:null,btn:null,near:null,bt:0};
const ED_DEF={id:'_ed',n:'Sửa công trình',kind:'obj',cost:{},fp:[1,1]};
// tỉ lệ vật liệu lấy lại khi tháo dỡ: gỗ, đá gần đủ; tranh, đất một phần; đồ nung, màu vẽ thì mất
const ED_RATE={wood:.8,plank:.8,stone:.85,bamboo:.75,stick:.7,rope:.5,hide:.6,fiber:.3,clay:.3,sand:.2,clayMix:.2,mat:.5,bambooStrip:.4,bronze:.9,woodStatue:1,carvedPost:1,feather:.3};
const ED_GONE=new Set(['brick','pot','charcoal','ochre','flower','honey']);
const edIsRemote=b=>!b||b.remote!=null||typeof b.id==='string';
const edUnits=b=>{const d=pieceDef(b.k);if(!d)return 1;const c=typeof b3paidCost==='function'?b3paidCost(b,d):d.cost;let n=0;for(const k in c)n+=c[k];return Math.max(1,n);};
const edArea=d=>d.fp?d.fp[0]*d.fp[1]:1;
/* ---------- hình: tô sáng chỗ chọn ---------- */
function edMat(k){return ED.mat[k]||(ED.mat[k]=new THREE.MeshBasicMaterial({color:k==='rm'?0xff5a3a:0xffd24a,transparent:true,opacity:.4,depthWrite:false}));}
function edProto(k){let g=ED.proto[k];if(!g){g=model(['piece',k]);g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}if(o.name==='flame')o.visible=false;});ED.proto[k]=g;}return g;}
function edClone(k,mat){const g=edProto(k).clone();g.traverse(o=>{if(o.isMesh){o.material=mat;o.renderOrder=6;}});return g;}
function edHlClear(){if(ED.hl){G.sc.remove(ED.hl);ED.hl=null;}}
function edHl(){edHlClear();const B=G.build;if(!B||!B.ed||!B.set||!B.set.length||!G.sc)return;const mat=edMat(B.ed),g=new THREE.Group();
  for(const b of B.set){const c=edClone(b.k,mat);c.position.set(b.x,b.y+0.4,b.z);c.rotation.y=b.r*Math.PI/2;c.scale.setScalar(1.04);g.add(c);}G.sc.add(g);ED.hl=g;}
/* ---------- chọn công trình gần điểm chạm ---------- */
function edDist(b,x,z){const d=pieceDef(b.k);if(!d)return 1e9;const dx=x-b.x,dz=z-b.z;
  if(d.kind==='edge'){const v=Math.round(b.r)%2!==0,al=v?dz:dx,ac=v?dx:dz;return Math.hypot(Math.max(0,Math.abs(al)-20),ac);}
  if(d.kind==='corner')return Math.max(0,Math.hypot(dx,dz)-3);
  if(d.kind==='floor'||d.kind==='roof')return Math.max(0,Math.max(Math.abs(dx),Math.abs(dz))-20)+(d.kind==='roof'?16:12);
  if(d.small&&!(d.fp&&edArea(d)>1))return Math.max(0,Math.hypot(dx,dz)-8);
  const [w,h]=d.fp||[1,1],odd=Math.round(b.r)%2!==0,hx=(odd?h:w)*20,hz=(odd?w:h)*20;return Math.hypot(Math.max(0,Math.abs(dx)-hx),Math.max(0,Math.abs(dz)-hz))+(edArea(d)>1?4:0);}
function edCands(x,z,L){const out=[];for(const b of S.builds){if(edIsRemote(b))continue;const d=edDist(b,x,z);if(d>36)continue;out.push({b,s:d+Math.abs((b.lv||0)-L)*30});}out.sort((p,q)=>p.s-q.s);return out.map(o=>o.b);}
// cả cụm: các phần nối nhau qua sàn/mái (cùng ô) hoặc qua chân tường, cột (cùng góc)
function edKeysOf(b){const d=pieceDef(b.k);if(!d)return {c:[],p:[],plat:false};const L=b.lv||0,c=[],p=[],plat=d.kind==='floor'||d.kind==='roof'||b.k==='stilt'||!!d.deck;const ck=(i,j,l)=>i+','+j+'@'+l;
  if(d.kind==='edge'){const v=Math.round(b.r)%2!==0;if(v){const i=Math.round(b.x/CELL),j=Math.floor(b.z/CELL);for(const l of [L,L+1]){c.push(ck(i-1,j,l),ck(i,j,l));}p.push(ck(i,j,L),ck(i,j+1,L));}
    else{const i=Math.floor(b.x/CELL),j=Math.round(b.z/CELL);for(const l of [L,L+1]){c.push(ck(i,j-1,l),ck(i,j,l));}p.push(ck(i,j,L),ck(i+1,j,L));}}
  else if(d.kind==='corner'){const i=Math.round(b.x/CELL),j=Math.round(b.z/CELL);for(const l of [L,L+1])c.push(ck(i-1,j-1,l),ck(i,j-1,l),ck(i-1,j,l),ck(i,j,l));p.push(ck(i,j,L));}
  else{for(const [i,j] of cellsOf(d,b.x,b.z,Math.round(b.r))){c.push(ck(i,j,L));if(plat&&d.kind==='obj')c.push(ck(i,j,L+1));if(b.k==='stairs')c.push(ck(i,j,L+1));}}
  return {c,p,plat};}
function edCluster(root,cap){cap=cap||80;const K=new Map();for(const b of S.builds){if(edIsRemote(b)||Math.hypot(b.x-root.x,b.z-root.z)>900)continue;K.set(b,edKeysOf(b));}
  const byC=new Map(),byP=new Map();K.forEach((k,b)=>{k.c.forEach(x=>{let a=byC.get(x);if(!a)byC.set(x,a=[]);a.push(b);});k.p.forEach(x=>{let a=byP.get(x);if(!a)byP.set(x,a=[]);a.push(b);});});
  const seen=new Set([root]),q=[root];while(q.length&&seen.size<cap){const b=q.shift(),k=K.get(b);if(!k)continue;
    for(const x of k.c)for(const o of byC.get(x)||[]){if(seen.has(o))continue;const ko=K.get(o);if(!(k.plat||ko.plat))continue;seen.add(o);q.push(o);}
    for(const x of k.p)for(const o of byP.get(x)||[]){if(seen.has(o))continue;seen.add(o);q.push(o);}}
  return [...seen];}
/* ---------- chịu lực: dời/tháo các phần trong `set` có làm thứ gì bên ngoài mất chỗ tựa không ---------- */
function edSupState(f){const d=pieceDef(f.k);if(!d)return 1;const L=f.lv||0,cx=Math.floor(f.x/CELL),cz=Math.floor(f.z/CELL);
  if(d.kind==='floor')return L===0?1:(typeof b3floorSup==='function'?b3floorSup(cx,cz,L,(typeof B3SPAN!=='undefined'&&B3SPAN[f.k])||2,f.id).ok:floorSupported(cx,cz,L))?1:0;
  if(d.kind==='roof')return typeof b3roofSup==='function'?(b3roofSup(cx,cz,L).ok?1:0):1;
  if(f.k==='stilt'||(L===0&&(d.kind==='edge'||d.kind==='corner')))return 1;// chôn chân xuống đất
  const fl=(i,j)=>{const c=OCC.cell.get(i+','+j);return c&&c[slotN('floor',L)]?1:0;};let n=0;
  if(d.kind==='edge'){const v=Math.round(f.r)%2!==0;if(v){const i=Math.round(f.x/CELL),j=Math.floor(f.z/CELL);n=fl(i-1,j)+fl(i,j);}else{const i=Math.floor(f.x/CELL),j=Math.round(f.z/CELL);n=fl(i,j-1)+fl(i,j);}}
  else if(d.kind==='corner'){const i=Math.round(f.x/CELL),j=Math.round(f.z/CELL);n=fl(i-1,j-1)+fl(i,j-1)+fl(i-1,j)+fl(i,j);}
  else for(const [i,j] of cellsOf(d,f.x,f.z,Math.round(f.r)))n+=fl(i,j);
  return n>0?1:0;}
function edHolds(set){const ids=new Set(set.map(b=>b.id));let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const b of set){x0=Math.min(x0,b.x);x1=Math.max(x1,b.x);z0=Math.min(z0,b.z);z1=Math.max(z1,b.z);}
  const cand=S.builds.filter(f=>!ids.has(f.id)&&f.x>x0-170&&f.x<x1+170&&f.z>z0-170&&f.z<z1+170);if(!cand.length)return null;
  const before=cand.map(edSupState);set.forEach(b=>occMark(b,null));let out=null;
  try{for(let i=0;i<cand.length;i++)if(before[i]&&!edSupState(cand[i])){out=cand[i];break;}}finally{set.forEach(b=>occMark(b,b.id));}return out;}
/* ---------- đồ bên trong khi tháo dỡ ---------- */
function edOtherStores(b){const out=[];for(const o of S.builds){if(o===b||o.k==='trough'||o.prog!=null)continue;const d=pieceDef(o.k);if(d&&d.store&&S.store[o.id]&&Math.hypot(o.x-P.x,o.z-P.z)<320)out.push(S.store[o.id]);}return out;}
function edStoreItems(b){return (S.store[b.id]||[]).filter(Boolean);}
function edStoreFits(b){const its=edStoreItems(b);if(!its.length)return true;const inv=JSON.parse(JSON.stringify(S.inv)),oth=edOtherStores(b).map(a=>JSON.parse(JSON.stringify(a)));
  for(const s of its){let n=slotsAdd(inv,s.id,s.n);for(const o of oth){if(n<=0)break;n=slotsAdd(o,s.id,n);}if(n>0)return false;}return true;}
function edSeedOf(k){for(const i in ITEMS)if(ITEMS[i].crop===k&&ITEMS[i].t==='seed')return i;return null;}
// thứ lấy ra được khi tháo (ngoài vật liệu) và thứ sẽ mất
function edContents(b){const d=pieceDef(b.k)||{},it={},lost=[],add=(k,n)=>{if(n>0&&ITEMS[k])it[k]=(it[k]||0)+n;};const tk=Math.floor(S.tank[b.id]||0);
  if(b.k==='coop')add('egg',tk);else if(b.k==='fishTrap')add('fish',tk);else if(b.k==='beeBox')add('honey',tk);
  else if(b.k==='trap'&&tk>=1){add('meat',1);if(S.tank[b.id+'k']==='junglefowl')add('feather',2);else add('hide',1);}
  else if(b.k==='rainBarrel'&&tk>=1)lost.push('nước trong thùng');
  if(d.fuel&&(S.fuel[b.id]||0)>=4)add('wood',Math.floor(S.fuel[b.id]/4));
  const c=S.crops[b.id];if(c&&cropStage(c)<3){const sd=edSeedOf(c.k);if(sd)add(sd,1);lost.push('cây đang lớn (trả lại hạt giống)');}
  if(b.k==='paddy'&&S.l4&&S.l4.pad&&S.l4.pad[b.id]&&S.l4.pad[b.id].st>0)lost.push('lúa, mạ đang trồng');
  return {it,lost};}
function edRefund(b){const d=pieceDef(b.k),c=typeof b3paidCost==='function'?b3paidCost(b,d):d.cost,back={},lost={},cozy=S.mode==='cozy',site=b.prog!=null;
  for(const k in c){const n=c[k];let r=ED_GONE.has(k)?0:(ED_RATE[k]!=null?ED_RATE[k]:.5);if(r>0&&cozy)r=Math.min(1,r+.2);if(r>0&&site)r=Math.max(r,.85);
    if(k==='fiber'&&b.cond!=null&&!site)r*=clamp(b.cond/100,.3,1);const g=Math.round(n*r);if(g>0)back[k]=g;if(n-g>0)lost[k]=n-g;}
  return {back,lost};}
/* ---------- lý do không dời / không tháo được ---------- */
function edWhy(set,mode){if(!set.length)return 'Chưa chọn công trình nào.';
  if(set.some(edIsRemote))return '🚫 Công trình của người khác: không được dời, tháo.';
  if(mode==='mv'&&set.some(b=>b.k==='treePlatform'))return 'Nhà trên cây gắn liền với thân cây: chỉ tháo dỡ được, không dời được.';
  if(mode==='mv'&&set.length>80)return 'Cụm này lớn quá (hơn 80 phần): dời từng phần một.';
  const dep=edHolds(set);if(dep){const nm=set.length>1?'Cả cụm':pieceDef(set[0].k).n,dn=pieceDef(dep.k).n.toLowerCase();
    return `${nm} đang đỡ ${dn} ở trên. ${mode==='rm'?'Tháo':'Dời'} ${dn} trước${mode==='mv'&&set.length===1?', hoặc bật 🏠 Cả cụm để dời cả nhà':''}.`;}
  if(mode==='rm'){const b=set[0],d=pieceDef(b.k);
    if(S.b3&&S.b3.dry&&S.b3.dry[b.id]&&S.b3.dry[b.id].length)return 'Thu hết gốm đang phơi trên '+d.n.toLowerCase()+' trước đã.';
    if(S.l4&&S.l4.ferm&&S.l4.ferm[b.id])return 'Chum mắm đang ủ: đợi ủ xong, lấy ra rồi hãy tháo.';
    const c=S.crops[b.id];if(c&&cropStage(c)>=3)return 'Ruộng đã chín: thu hoạch trước đã.';
    if(!edStoreFits(b))return `Túi và giỏ, rương gần đây không đủ chỗ cho đồ trong ${d.n.toLowerCase()}. Cất bớt hoặc đặt thêm giỏ.`;}
  return '';}
/* ---------- vào chế độ sửa ---------- */
function edBegin(mode,sel){const O=G.build;if(O&&O.busy)return;const last=O?(O.ed?O.lastId:O.id):(G.edLast||null);let lv=O?O.lv||0:(typeof playerLevel==='function'?playerLevel():0);const grpOn=!!(O&&O.grpOn);
  if(O)buildEnd();if(!G.sc)return;const g=new THREE.Group();G.sc.add(g);if(sel)lv=sel.lv||0;
  G.build={id:'_ed',def:ED_DEF,g,mat:new THREE.MeshBasicMaterial(),r:0,ok:false,pos:null,lv,ed:mode,rm:true,lastId:last,sel:null,set:null,grpOn:mode==='mv'&&grpOn,uiT:0};
  if(sel&&S.builds.includes(sel))edSelect(sel);else edRender();
  if(!G.edTip0){G.edTip0=1;uiToast(mode==='rm'?'🔨 Chạm vào công trình muốn tháo dỡ, rồi bấm 🔨 Tháo dỡ.':'✋ Chạm vào công trình muốn dời, rồi bấm Nhấc lên. Chạm lại cùng chỗ để chọn món chồng bên dưới.','');}}
function edSelect(b){const B=G.build;if(!B||!B.ed)return;B.sel=b;B.cf=null;B.set=b?(B.grpOn&&B.ed==='mv'?edCluster(b):[b]):null;B.selWhy=b?edWhy(B.set,B.ed):'';edHl();edRender();}
function edPickAt(x,z,act){const B=G.build,list=edCands(x,z,B.lv||0);const same=ED.tap&&Math.hypot(ED.tap.x-x,ED.tap.z-z)<14;ED.tap={x,z};
  if(!list.length){if(act&&B.sel){edGo();return;}edSelect(null);uiToast('Không có công trình nào của bạn ở đó.','');return;}
  if(act&&B.sel&&(list.includes(B.sel)||(B.set&&B.set.some(o=>list.includes(o))))){edGo();return;}
  let pick=list[0];if(same&&B.sel){const i=list.indexOf(B.sel);if(i>=0)pick=list[(i+1)%list.length];}
  sfx('pick');edSelect(pick);}
function edGo(){const B=G.build;if(!B||!B.sel||B.busy)return;if(B.ed==='rm')edDismantle(B.sel,false);else if(B.grpOn&&B.set&&B.set.length>1)edLiftGroup(B.set,B.sel);else edLift(B.sel);}
function edNew(){const B=G.build;if(B&&B.busy)return;const id=(B&&(B.ed?B.lastId:B.id))||G.edLast;if(id&&id[0]!=='_'&&pieceDef(id)){buildBegin(id);}else{buildEnd();uiOpen('build',{});}}
/* ---------- nhấc lên một món: dùng lại bóng xanh, lưới, kiểm tra của chế độ đặt mới ---------- */
function edLift(b){const why=edWhy([b],'mv');if(why){uiToast(why,'bad');sfx('no');edRender();return;}const O=G.build,last=O&&O.lastId,grpOn=O&&O.grpOn;
  const el0=G.edLast;buildBegin(b.k);G.edLast=el0;const N=G.build;if(!N)return;const d=N.def;
  Object.assign(N,{ed:'mv',mv:b,lastId:last,grpOn,r:((Math.round(b.r)%4)+4)%4,lv:b.lv||0,rman:1,_man:1});if(d.small){N.free=true;N.fr=b.r;}
  G.buildTap={x:b.x,z:b.z};N.uiT=-9;buildUpdate();sfx('pick');}
/* ---------- nhấc cả cụm ---------- */
function edLiftGroup(set,root){const why=edWhy(set,'mv');if(why){uiToast(why,'bad');sfx('no');edRender();return;}const O=G.build;
  let sx=0,sz=0;for(const b of set){sx+=b.x;sz+=b.z;}const px=Math.round(sx/set.length/CELL)*CELL,pz=Math.round(sz/set.length/CELL)*CELL;
  buildEnd();const mat=new THREE.MeshBasicMaterial({color:0x7cff9a,transparent:true,opacity:.42,depthWrite:false}),g=new THREE.Group();
  for(const b of set){const c=edClone(b.k,mat);c.position.set(b.x-px,b.y,b.z-pz);c.rotation.y=b.r*Math.PI/2;g.add(c);}G.sc.add(g);
  G.build={id:'_grp',def:{id:'_grp',n:'Cả cụm',kind:'obj',cost:{},fp:[1,1]},g,mat,r:0,ok:false,pos:null,lv:root.lv||0,ed:'mv',rm:false,lastId:O&&O.lastId,grpOn:true,
    grp:{root,list:set.map(b=>({b,dx:b.x-px,dz:b.z-pz})),px,pz},gq:0,uiT:-9};
  G.buildTap={x:px,z:pz};buildUpdate();sfx('pick');}
function edOccKeys(d,k,x,z,r,L){const out=[];if(d.kind==='edge'){out.push(['e',edgeKey(x,z,r,L)]);return out;}if(d.kind==='corner'){out.push(['e',cornerKey(x,z,L)]);return out;}
  const base=d.kind==='floor'?'floor':d.kind==='roof'?'roof':'obj';for(const [i,j] of cellsOf(d,x,z,Math.round(r))){out.push(['c',i+','+j,slotN(base,L)]);if(k==='stilt'||d.deck)out.push(['c',i+','+j,slotN('floor',L+1)]);}return out;}
function edGrpPlan(grp,tx,tz,q){const ids=new Set(grp.list.map(o=>o.b.id)),plan=[];
  for(const o of grp.list){let dx=o.dx,dz=o.dz;for(let i=0;i<q;i++){const t=dx;dx=dz;dz=-t;}plan.push({b:o.b,d:pieceDef(o.b.k),x:tx+dx,z:tz+dz,r:(o.b.r+q)%4,lv:o.b.lv||0,y:o.b.y});}
  // ô có sàn của chính cụm ở tầng 0 (đồ, tường đứng trên đó không cần chạm đất)
  const plat=new Set();for(const p of plan){if(p.lv===0&&(p.d.kind==='floor'||p.b.k==='stilt'))for(const [i,j] of cellsOf(p.d,p.x,p.z,Math.round(p.r)))plat.add(i+','+j);}
  const onPlat=p=>{const d=p.d;if(d.kind==='edge'){const v=Math.round(p.r)%2!==0;const cs=v?[[Math.round(p.x/CELL)-1,Math.floor(p.z/CELL)],[Math.round(p.x/CELL),Math.floor(p.z/CELL)]]:[[Math.floor(p.x/CELL),Math.round(p.z/CELL)-1],[Math.floor(p.x/CELL),Math.round(p.z/CELL)]];return cs.some(([i,j])=>plat.has(i+','+j));}
    if(d.kind==='corner'){const i=Math.round(p.x/CELL),j=Math.round(p.z/CELL);return [[i-1,j-1],[i,j-1],[i-1,j],[i,j]].some(([a,b])=>plat.has(a+','+b));}
    if(d.kind==='floor'||p.b.k==='stilt')return false;return cellsOf(d,p.x,p.z,Math.round(p.r)).every(([i,j])=>plat.has(i+','+j));};
  const gr=[];for(const p of plan){if(p.lv!==0||p.d.kind==='roof'||onPlat(p))continue;let want,flat=0;const d=p.d;
    if(d.kind==='floor'){const hs=[[-18,-18],[18,-18],[-18,18],[18,18],[0,0]].map(([u,v])=>hAt(p.x+u,p.z+v));want=Math.max(...hs)-1;flat=Math.max(...hs)-Math.min(...hs);}
    else if(d.kind==='edge'){const v=Math.round(p.r)%2!==0,pts=v?[[p.x,p.z-20],[p.x,p.z+20]]:[[p.x-20,p.z],[p.x+20,p.z]];want=Math.min(...pts.map(([a,b])=>hAt(a,b)))-1;}
    else if(d.kind==='corner')want=Math.min(...[[1,1],[-1,1],[1,-1],[-1,-1]].map(([a,b])=>hAt(p.x+a,p.z+b)))-1;
    else want=Math.max(...cellsOf(d,p.x,p.z,Math.round(p.r)).map(([i,j])=>hAt((i+0.5)*CELL,(j+0.5)*CELL)))-0.5;gr.push({p,want,flat});}
  let dy=0;if(gr.length)dy=Math.max(...gr.map(o=>o.want-o.p.b.y));for(const p of plan)p.y=p.b.y+dy;
  let why='';const sl=typeof slopeAt==='function';
  for(const o of gr){const fl=o.p.y-o.want;if(o.flat>34||fl>(o.p.d.kind==='floor'?30:14)){why='Đất chỗ mới dốc, gồ ghề quá: cả cụm sẽ bị kênh lên. Chọn chỗ bằng phẳng hơn (hoặc San nền trước).';break;}}
  if(!why&&Math.hypot(tx-P.x,tz-P.z)>420)why='Xa quá: đi lại gần chỗ muốn đặt.';
  if(!why)for(const p of plan){for(const [m,k,s] of edOccKeys(p.d,p.b.k,p.x,p.z,p.r,p.lv)){const id=m==='e'?OCC.edge.get(k):(OCC.cell.get(k)||{})[s];if(id!=null&&!ids.has(id)){const o=BYID.get(id);why='Chỗ mới vướng '+(o&&pieceDef(o.k)?pieceDef(o.k).n.toLowerCase():'công trình khác')+'.';break;}}if(why)break;}
  if(!why)for(const p of plan){if(p.lv!==0||p.d.kind==='roof')continue;
    if(wdAt(p.x,p.z)>1&&!/^(stilt|post|fishTrap)$/.test(p.b.k)&&!onPlat(p)){why='Không đặt trên nước: chọn chỗ đất khô.';break;}
    const rad=p.d.kind==='edge'?20:p.d.kind==='corner'?8:(p.d.fp?Math.max(...p.d.fp)*20:20);for(const i of near(p.x,p.z,rad+30)){const q=RES[i];if(q.st!==0||RT[q.t].pass||q.lock)continue;if(Math.hypot(q.x-p.x,q.z-p.z)<rad*0.75+(RT[q.t].r||4)*0.6){why='Vướng '+RT[q.t].n.toLowerCase()+': dọn trước đã.';break;}}if(why)break;}
  if(!why&&typeof mpOn==='function'&&typeof mpLandWhy==='function'&&mpOn())for(const p of plan){const w=mpLandWhy(p.x,p.z);if(w){why=w;break;}}
  return {plan,why,dy};}
function edGrpUpdate(){const B=G.build,a=buildAim(),tx=Math.round(a.x/CELL)*CELL,tz=Math.round(a.z/CELL)*CELL,q=B.gq||0,k=tx+','+tz+','+q+','+S.builds.length;
  if(B._gk!==k||G.t-(B._gt||0)>0.6){B._gk=k;B._gt=G.t;const r=edGrpPlan(B.grp,tx,tz,q);B.plan=r.plan;B.pos={x:tx,y:r.dy,z:tz,r:q};B.why=r.why;B.g.position.set(tx,r.dy,tz);B.g.rotation.y=q*Math.PI/2;B.uiT=-9;}
  B.ok=!B.why;B.mat.color.set(B.why?0xff6a5a:0x7cff9a);if(G.t-(B.uiT||0)>0.2){B.uiT=G.t;edRender();}}
/* ---------- đặt xuống: một bước công việc ngắn, tốn chút sức ---------- */
function edWork(title,icon,steps,fn){const sp=(1+skLv('build')*0.06)*(S.buff&&S.buff.rested>TNOW()?1.15:1);
  G.work={r:{out:{}},steps:steps.map(s=>({n:s[0],a:s[1],t:s[2]/sp,fx:s[3]})),i:0,t:0,left:1,done:0,x:P.x,z:P.z,sk:'build',icon,ed:1,edT:title,fn};G.sit=false;G.act=null;workUi();sfx('pick');}
function edDrop(){const B=G.build;if(!B||B.busy)return;buildUpdate();if(!B.ok){uiToast(B.why||'Không đặt được ở đây.','bad');sfx('no');return;}
  const ng=needGate(true);if(ng){uiToast(ng,'bad');sfx('no');return;}const set=B.grp?B.grp.list.map(o=>o.b):[B.mv];const u=set.reduce((a,b)=>a+edUnits(b),0);
  const nm=B.grp?'cả cụm':pieceDef(B.mv.k).n.toLowerCase(),stam=Math.min(B.grp?25:8,1+u*0.1);
  const steps=B.grp?[['Tháo rời, đánh dấu từng phần','lash',clamp(1+u*0.02,1.5,4),'pick'],['Khiêng sang chỗ mới','work',clamp(1+u*0.015,1.2,3.5),'step'],['Dựng lại, buộc chặt','work',clamp(1+u*0.02,1.5,4),'build']]
    :[['Nhấc lên','gather',clamp(0.5+u*0.05,0.6,2),'pick'],['Đặt xuống, kê cho vững','work',clamp(0.5+u*0.05,0.6,2),'build']];
  B.busy=true;edRender();
  edWork((B.grp?'Dời cả cụm':'Dời '+nm),'wood',steps,()=>{B.busy=false;if(G.build!==B)return;B._gk=null;buildUpdate();if(!B.ok){uiToast('Không đặt được nữa: '+(B.why||''),'bad');sfx('no');edRender();return;}
    const w=edWhy(set,'mv');if(w){uiToast(w,'bad');sfx('no');edRender();return;}
    const plan=B.grp?B.plan:[{b:B.mv,x:B.pos.x,y:B.pos.y,z:B.pos.z,r:B.pos.r,lv:B.lv||0}];edRelocate(plan);
    S.p.stam=Math.max(0,S.p.stam-stam);addXp('build',1);cnt('cnt','move');uiToast(`✋ Đã dời ${nm}${B.grp?' ('+set.length+' phần)':''}. Đồ bên trong vẫn còn nguyên.`,'good');
    const root=B.grp?B.grp.root:B.mv;edBegin('mv',root);});}
function edCancel(){const B=G.build;if(!B||B.busy)return;const root=B.grp?B.grp.root:B.mv;edBegin('mv',root&&S.builds.includes(root)?root:null);uiToast('↩ Để nguyên chỗ cũ.','');}
// chuyển chỗ thật sự: giữ id → rương, củi, cây trồng, độ bền... đi theo
function edRelocate(plan){for(const o of plan)occMark(o.b,null);const Y=new THREE.Vector3(0,1,0),fl=new Set();
  for(const o of plan){const b=o.b;b.x=+(+o.x).toFixed(1);b.y=+(+o.y).toFixed(1);b.z=+(+o.z).toFixed(1);b.r=Math.abs(o.r-Math.round(o.r))<1e-6?Math.round(o.r)%4:+(+o.r).toFixed(3);b.lv=o.lv||0;}
  for(const o of plan){const b=o.b;occMark(b,b.id);const e=SI.get(b.k);if(e&&e.api){const i=e.map.get(b.id);if(i!=null){setPieceM(e.api,i,b);fl.add(e);}}
    if(e&&e.flame)for(const f of G.flames){if(f.id!==b.id)continue;const p=e.flame.position.clone().applyAxisAngle(Y,b.r*Math.PI/2).add(new THREE.Vector3(b.x,b.y,b.z));f.o.position.copy(p);f.o.rotation.y=b.r*Math.PI/2;f.x=p.x;f.y=p.y;f.z=p.z;}
    try{if(typeof b3ovSync==='function')b3ovSync(b);}catch(er){}if(S.crops[b.id])cropShow(b);
    if(typeof L4!=='undefined'&&L4.nw){L4.nw.delete(b.id);L4.nw.delete('r'+b.id);}if(b.k==='paddy'&&typeof l4PadShow==='function')try{l4PadShow(b);}catch(er){}}
  fl.forEach(e=>e.api.flush());decoRebuild();G.cutK=null;flameSync();if(typeof b3ChanCalc==='function'&&plan.some(o=>o.b.k==='channel'))try{b3ChanCalc();}catch(er){}save();}
/* ---------- tháo dỡ ---------- */
function edRmSteps(b,d){const st=/stone|brick|kiln|hearth|smelter|well|grind|tomb|statue|Stone/.test(b.k),k=d.kind;
  if(k==='roof')return [['Rút lớp tranh, lá phủ mái','work','pick'],['Tháo rui mè, hạ kèo','carve','chop'],['Bó gọn vật liệu','lash','pick']];
  if(k==='edge')return st?[['Gỡ từng viên đá, gạch','knap','mine'],['Đào móng, nhặt đá chân tường','gather','pick'],['Xếp đống vật liệu','work','pick']]:[['Gỡ vách, phên','carve','chop'],['Cắt lạt, tháo khung','lash','pick'],['Nhổ cột, lấp hố','gather','pick']];
  if(k==='floor')return [['Cạy lớp lát sàn','carve','chop'],['Tháo dầm, đà','carve','chop'],['Xếp gọn vật liệu','work','pick']];
  if(k==='corner')return [['Đào quanh chân cột','gather','pick'],['Nhổ cột lên','work','pick']];
  return st?[['Gỡ đá, gạch từng lớp','knap','mine'],['Nhặt vật liệu còn dùng được','gather','pick']]:[['Cắt dây buộc, tháo khớp','lash','pick'],['Gỡ từng phần','carve','chop'],['Xếp gọn vật liệu','work','pick']];}
function edBig(b){const d=pieceDef(b.k);return edUnits(b)>=10||edArea(d)>=2||edStoreItems(b).length>0||!!S.crops[b.id]||(S.fuel[b.id]||0)>0||(S.tank[b.id]||0)>=1;}
function edDismantle(b,ok){const B=G.build;if(!B||B.busy)return;const why=edWhy([b],'rm');if(why){uiToast(why,'bad');sfx('no');B.selWhy=why;edRender();return;}
  if(!ok&&edBig(b)){B.cf=b;edRender();sfx('pick');return;}{const ng=needGate(true);if(ng){uiToast(ng,'bad');sfx('no');return;}}
  const d=pieceDef(b.k),u=edUnits(b),tl=hasTool('axe')?1.25:hasTool('hammer')?1.15:1,t=clamp(0.5+u*0.07,0.7,2.4)/tl;B.cf=null;B.busy=true;edRender();
  edWork('Tháo dỡ '+d.n.toLowerCase(),Object.keys(edRefund(b).back)[0]||'wood',edRmSteps(b,d).map(s=>[s[0],s[1],t,s[2]]),()=>{B.busy=false;
    if(!S.builds.includes(b)){if(G.build===B)edSelect(null);return;}const w=edWhy([b],'rm');if(w){uiToast(w,'bad');sfx('no');if(G.build===B){B.selWhy=w;edRender();}return;}
    edRemoveNow(b);if(G.build===B)edSelect(null);});}
function edGive(o,src,ex){let lost=0,dr=0;const oth=edOtherStores(ex||null);for(const k in o){let n=o[k];if(n<=0||!ITEMS[k])continue;const n0=n;n=invAdd(k,n);for(const st of oth){if(n<=0)break;n=slotsAdd(st,k,n);}
    if(n0-n>0){cnt('get',k,n0-n);uiFly(k,n0-n,src);}while(n>0&&dr<24){dropAdd(k,src[0]+(Math.random()-0.5)*24,src[1]-6,src[2]+(Math.random()-0.5)*24);n--;dr++;}lost+=n;}
  if(dr)uiToast(`Túi đầy: ${dr} món để dưới đất, nhặt lên nhé.`,'');if(lost)uiToast('Túi đầy! Một ít vật liệu bị bỏ lại.','bad');}
function edRemoveNow(b){const d=pieceDef(b.k),src=[b.x,b.y+10,b.z],{back}=edRefund(b),{it}=edContents(b);
  // đồ trong rương, giỏ: vào túi trước, thừa thì sang giỏ, rương gần đó (đã kiểm tra đủ chỗ)
  const its=edStoreItems(b),oth=edOtherStores(b);let moved=0;for(const s of its){let n=invAdd(s.id,s.n);for(const o of oth){if(n<=0)break;n=slotsAdd(o,s.id,n);}moved+=s.n-n;if(n>0)edGive({[s.id]:n},src,b);}
  if(moved)uiFly(its[0].id,moved,src);
  if(b.tree!=null&&RES[b.tree]&&RES[b.tree].lock===b.id)RES[b.tree].lock=null;delete S.tank[b.id+'k'];
  structRemove(b);if(d.kind==='roof'||d.kind==='edge'||d.kind==='corner')decoRebuild();G.cutK=null;
  const all={...back};for(const k in it)all[k]=(all[k]||0)+it[k];edGive(all,src);structFx(b);sfx('chop');cnt('cnt','dismantle');addXp('build',1);
  const got=Object.entries(back).map(([k,v])=>v+' '+ITEMS[k].n.toLowerCase()).join(', ');uiToast(`🔨 Đã tháo ${d.n.toLowerCase()}${got?': lấy lại '+got:''}${its.length?' · đồ bên trong đã cất vào túi':''}.`,'good');uiHotbar();save();}
/* ---------- thanh xây: chế độ, thông tin món đang chọn ---------- */
function edChips(o,neg){return Object.entries(o).map(([k,v])=>`<span class="chip${neg?' no':''}">${icon(k)}${neg?'−':'+'}${v}</span>`).join('');}
function edInfo(b){const d=pieceDef(b.k),a=[];const n=edStoreItems(b).reduce((s,x)=>s+x.n,0);if(n)a.push('📦 '+n+' món bên trong');if(d.fuel&&(S.fuel[b.id]||0)>0)a.push('🔥 lửa còn '+Math.ceil(S.fuel[b.id])+' giờ');
  if(S.crops[b.id])a.push('🌱 cây trồng '+Math.round((S.crops[b.id].p||0)*100)+'%');if(S.tank[b.id]>=1)a.push('🫙 có đồ bên trong');if(b.prog!=null)a.push('🏗️ đang dựng dở');if(b.cond!=null&&b.cond<100)a.push('🛠️ độ bền '+Math.round(b.cond)+'%');return a.join(' · ');}
function edModes(m){const B=G.build;const dis=B&&B.busy?' disabled':'';return `<div class="ed-modes"><button class="btn sm ${m==='new'?'':'ghost'}" data-a="ed" data-k="new"${dis}>＋ Đặt mới</button><button class="btn sm ${m==='mv'?'':'ghost'}" data-a="ed" data-k="mv"${dis}>✋ Di chuyển</button><button class="btn sm ${m==='rm'?'red':'ghost'}" data-a="ed" data-k="rm"${dis}>🔨 Tháo dỡ</button></div>`;}
function edLvHtml(){const L=G.build.lv||0;return `<div class="bb-lv"><button class="btn sm ghost" data-a="bb" data-k="dn" aria-label="Tầng dưới">▼</button><span>${L?'Tầng '+(L+1):'Mặt đất'}</span><button class="btn sm ghost" data-a="bb" data-k="up" aria-label="Tầng trên">▲</button></div>`;}
function edRender(){const B=G.build,el=$('#buildBar');if(!el)return;if(!B||!B.ed){return;}document.body.classList.add('building');el.hidden=false;let h;const busy=B.busy?' disabled':'';
  if(B.grp){h=edModes('mv')+`<div class="bb-i"><b>🏠 Dời cả cụm · ${B.grp.list.length} phần</b><span class="small muted">Chạm chỗ mới để dời khung, ⟲ xoay 90°. Giữ nguyên các tầng.</span>${B.busy?'<span class="small ok">Đang dời…</span>':B.why?`<span class="small warn">${esc(B.why)}</span>`:'<span class="small ok">Đặt được</span>'}</div>
    <div class="bb-b"><button class="btn sm ghost" data-a="bb" data-k="rot" aria-label="Xoay"${busy}>⟲</button><button class="btn sm" data-a="ed" data-k="drop"${busy}>✔ Đặt xuống</button><button class="btn sm ghost" data-a="ed" data-k="cancel"${busy}>↩ Hủy</button></div>`;}
  else if(B.mv){const d=B.def;h=edModes('mv')+`<div class="bb-i"><b>✋ Dời ${esc(d.n.toLowerCase())}</b>${edInfo(B.mv)?`<span class="small muted">${esc(edInfo(B.mv))} · giữ nguyên khi dời</span>`:''}${B.busy?'<span class="small ok">Đang dời…</span>':B.why?`<span class="small warn">${esc(B.why)}</span>`:'<span class="small ok">Đặt được · không tốn vật liệu</span>'}${B.sup&&!B.why?`<span class="small b3-sup">${esc(B.sup)}</span>`:''}</div>
    ${edLvHtml()}<div class="bb-b">${d.small?`<button class="btn sm ${B.free?'':'ghost'}" data-a="bb" data-k="free" aria-label="Đặt tự do" title="Đặt tự do, không theo lưới"${busy}>✥</button>`:''}<button class="btn sm ghost" data-a="bb" data-k="rot" aria-label="Xoay"${busy}>⟲</button><button class="btn sm" data-a="ed" data-k="drop"${busy}>✔ Đặt xuống</button><button class="btn sm ghost" data-a="ed" data-k="cancel"${busy}>↩ Hủy</button></div>`;}
  else if(B.cf){const b=B.cf,d=pieceDef(b.k),{back,lost}=edRefund(b),{it,lost:gone}=edContents(b),n=edStoreItems(b).reduce((s,x)=>s+x.n,0);
    h=edModes('rm')+`<div class="bb-i"><b>🔨 Tháo dỡ ${esc(d.n.toLowerCase())}?</b><div class="chips">${edChips(back)}${edChips(it)}</div>${Object.keys(lost).length?`<span class="small muted">Hỏng, mất: </span><div class="chips">${edChips(lost,1)}</div>`:''}${n?`<span class="small">📦 ${n} món bên trong sẽ cất vào túi</span>`:''}${gone.length?`<span class="small warn">Mất: ${esc(gone.join(', '))}</span>`:''}</div>
    <div class="bb-b"><button class="btn sm red" data-a="ed" data-k="cf">✔ Tháo</button><button class="btn sm ghost" data-a="ed" data-k="cfno">↩ Thôi</button></div>`;}
  else{const b=B.sel,d=b&&pieceDef(b.k),rm=B.ed==='rm';let info='';
    if(!b)info=`<b>${rm?'🔨 Tháo dỡ':'✋ Di chuyển'}</b><span class="small">Chạm vào công trình muốn ${rm?'tháo dỡ':'dời đi'}${B.lv?' (đang chọn ở tầng '+(B.lv+1)+')':''}.</span>`;
    else if(rm){const {back,lost}=edRefund(b),{it}=edContents(b);info=`<b>🔨 ${esc(d.n)}</b>${B.busy?'<span class="small ok">Đang tháo…</span>':''}<div class="chips">${edChips(back)}${edChips(it)}${Object.keys(lost).length?edChips(lost,1):''}</div>${B.selWhy?`<span class="small warn">${esc(B.selWhy)}</span>`:`<span class="small muted">Hoàn lại phần lớn gỗ, đá; tranh, đất một phần; đồ nung thì mất.</span>`}`;}
    else{const many=B.set&&B.set.length>1;info=`<b>✋ ${many?'Cả cụm: '+B.set.length+' phần':esc(d.n)}</b>${!many&&edInfo(b)?`<span class="small muted">${esc(edInfo(b))}</span>`:''}${B.busy?'<span class="small ok">Đang dời…</span>':''}${B.selWhy?`<span class="small warn">${esc(B.selWhy)}</span>`:`<span class="small muted">Chạm lại cùng chỗ để chọn món bên dưới.</span>`}`;}
    const go=b&&!B.selWhy&&!B.busy?'':' disabled';
    h=edModes(B.ed)+`<div class="bb-i">${info}</div>${edLvHtml()}<div class="bb-b">${rm?'':`<button class="btn sm ${B.grpOn?'':'ghost'}" data-a="ed" data-k="grp" title="Chọn cả cụm nhà nối liền nhau"${busy}>🏠 Cả cụm</button>`}<button class="btn sm${rm?' red':''}" data-a="ed" data-k="go"${go}>${rm?'🔨 Tháo dỡ':'✋ Nhấc lên'}</button><button class="btn sm ghost" data-a="bb" data-k="exit" aria-label="Xong">✕</button></div>`;}
  if(el._h!==h){el._h=h;el.innerHTML=h;}}
function edCmd(k){const B=G.build;if(k==='new'){edNew();return;}if(k==='mv'||k==='rm'){if(B&&B.busy)return;if(B&&B.ed===k&&!B.mv&&!B.grp)return;const keep=B&&B.ed?(B.mv||(B.grp&&B.grp.root)||B.sel||B.cf):null;edBegin(k,keep&&S.builds.includes(keep)?keep:null);return;}
  if(!B||!B.ed)return;if(k==='go')edGo();else if(k==='grp'){B.grpOn=!B.grpOn;edSelect(B.sel);}else if(k==='cf'){if(B.cf)edDismantle(B.cf,true);}else if(k==='cfno'){B.cf=null;edRender();}else if(k==='drop')edDrop();else if(k==='cancel')edCancel();}
document.addEventListener('click',e=>{let t=e.target;if(t&&!document.contains(t)&&e.clientX!=null)t=document.elementFromPoint(e.clientX,e.clientY);const a=t&&t.closest&&t.closest('[data-a="ed"]');if(!a)return;e.stopImmediatePropagation();if(a.disabled)return;sfx('pick');
  if(G.panel)uiClose();edCmd(a.dataset.k);},true);
/* ---------- bọc các hàm cũ ---------- */
{const _bu=buildUpdate;buildUpdate=function(){const B=G.build;if(!B||!B.ed)return _bu();
  if(ED.hl){const m=edMat(B.ed);m.opacity=0.3+0.14*Math.sin(G.t*5);}
  if(B.grp){edGrpUpdate();return;}if(!B.mv)return;
  // món đang dời: bỏ dấu ô của chính nó khi kiểm tra, không đòi vật liệu, không đòi cấp kỹ năng
  const b=B.mv,cp=canPay,lo=lvOk;occMark(b,null);canPay=()=>true;lvOk=()=>true;try{_bu();}finally{canPay=cp;lvOk=lo;occMark(b,b.id);}};}
{const _bb=buildBtn;buildBtn=function(k){const B=G.build;if(!B)return;
  if(k==='rm'){if(B.busy)return;if(B.ed==='rm'&&!B.cf)edNew();else edBegin('rm',B.ed?(B.sel||null):null);return;}
  if(!B.ed)return _bb(k);if(B.busy){if(k==='exit')workStop('Đã dừng tay.');return;}
  if(B.mv||B.grp){if(k==='place'){edDrop();return;}if(k==='exit'){edCancel();return;}if(B.grp){if(k==='rot'){B.gq=((B.gq||0)+1)%4;B._gk=null;buildUpdate();}return;}return _bb(k);}
  if(k==='place'){if(B.cf){edDismantle(B.cf,true);return;}const a=buildAim();edPickAt(a.x,a.z,true);return;}
  if(k==='up'||k==='dn'){B.lv=clamp((B.lv||0)+(k==='up'?1:-1),0,LVMAX);edRender();return;}
  if(k==='exit'){if(B.cf){B.cf=null;edRender();return;}buildEnd();}};}
{const _be=buildEnd;buildEnd=function(){const B=G.build;if(B&&B.busy&&G.work&&G.work.ed)workStop('Đã dừng tay.');edHlClear();_be();};}
{const _ub=uiBuildBar;uiBuildBar=function(on,def,why){const B=G.build;if(on&&B&&B.ed){edRender();return;}_ub(on,def,why);
  if(on&&B&&!B.ed){G.edLast=B.id;const el=$('#buildBar');if(el&&!(el.firstElementChild&&el.firstElementChild.classList.contains('ed-modes')))el.insertAdjacentHTML('afterbegin',edModes('new'));}};}
{const _wt=worldTap;worldTap=function(x,y){const B=G.build;if(!B||!B.ed||!G.on||G.paused)return _wt(x,y);auInit();const p=groundPick(x,y);if(!p||B.busy)return;
  G.buildTap={x:p.x,z:p.z};if(B.mv||B.grp){B.uiT=-9;buildUpdate();sfx('pick');return;}if(B.cf)return;edPickAt(p.x,p.z,false);};}
{const _ws=workStop;workStop=function(m){const W=G.work;_ws(m);if(W&&W.ed&&G.build&&G.build.busy){G.build.busy=false;edRender();}};}
{const _wu=workUi;workUi=function(){_wu();const W=G.work;if(!W||!W.edT)return;const b=document.querySelector('#work .wk-h b');const n=b&&b.firstChild;if(n&&n.nodeType===3&&n.nodeValue!==W.edT)n.nodeValue=W.edT;};}
// bảng Xây: lối vào dời / tháo
{const _bh=buildHtml;buildHtml=function(){return `<div class="landbox edbox"><b>🏗️ Sửa công trình đã xây</b><span class="small muted">Dời chỗ mà đồ bên trong, lửa, cây trồng vẫn giữ nguyên. Tháo dỡ lấy lại phần lớn gỗ, đá.</span><div class="row"><button class="btn sm" data-a="ed" data-k="mv">✋ Di chuyển</button><button class="btn sm ghost" data-a="ed" data-k="rm">🔨 Tháo dỡ</button></div></div>`+_bh();};}
/* ---------- nút 🛠️ Sửa khi đứng cạnh công trình (ngoài chế độ xây) ---------- */
function edNearMine(){const L=typeof playerLevel==='function'?playerLevel():0;let best=null,bd=30;for(const b of S.builds){if(b.prog!=null||edIsRemote(b)||Math.abs(b.x-P.x)>90||Math.abs(b.z-P.z)>90)continue;const d=edDist(b,P.x,P.z)+Math.abs((b.lv||0)-L)*30;if(d<bd){bd=d;best=b;}}return best;}
function edBtnTick(){if(!G.on||!S)return;let el=ED.btn;if(!el){const acts=document.querySelector('.acts');if(!acts)return;acts.insertAdjacentHTML('beforeend','<button id="edBtn" class="rbtn sm" aria-label="Dời hoặc tháo dỡ công trình" hidden>🛠️<i>Sửa</i></button>');
    el=ED.btn=$('#edBtn');el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();auInit();sfx('pick');const b=ED.near&&S.builds.includes(ED.near)?ED.near:edNearMine();edBegin('mv',b||null);});}
  if(G.t-ED.bt<0.3&&ED.bt<=G.t)return;ED.bt=G.t;const ov=$('#overlay');
  const b=!G.build&&!G.work&&!G.panel&&!G.sleeping&&!G.ride&&!G.ladder&&!G.paused&&!(ov&&!ov.hidden)?edNearMine():null;ED.near=b;if(el.hidden!==!b)el.hidden=!b;
  if(b&&!S.edTip){S.edTip=1;uiToast('🛠️ Nút Sửa (cạnh nút Hành động): dời hoặc tháo dỡ công trình đang đứng cạnh.','');}}
{const _ua=uiActsTick;uiActsTick=function(){_ua();try{edBtnTick();}catch(e){}};}
(function(){const st=document.createElement('style');st.textContent=`.buildbar{flex-wrap:wrap}.ed-modes{display:flex;gap:6px;flex-basis:100%;width:100%}.ed-modes .btn{flex:1;min-width:0;padding:5px 4px;font-size:12.5px}
#buildBar .bb-b [data-k="rm"]{display:none!important}#edBtn{position:absolute;left:0;right:auto;top:-56px}body.building #edBtn{display:none}#edBtn[hidden]{display:none}
@media (max-height:500px) and (orientation:landscape){#edBtn{top:-46px}}
@media (max-width:600px) and (orientation:portrait){body.building .toasts{top:calc(max(10px,env(safe-area-inset-top)) + var(--hudh,130px) + 60px)!important;bottom:auto!important;left:10px!important;transform:none!important;max-width:calc(100vw - 80px)!important;align-items:flex-start!important}}`;document.head.appendChild(st);})();
// điện thoại: chạm vào nút (✔, ⟲…) sinh thêm sự kiện chuột giả → buildAim tưởng chuột đang trỏ dưới nút, bóng xanh nhảy theo.
// Bỏ qua "chuột" xuất hiện ngay sau một lần chạm.
addEventListener('touchstart',()=>{ED.tt=performance.now();},{capture:true,passive:true});
addEventListener('mousemove',()=>{if(performance.now()-(ED.tt||-1e9)<1500)setTimeout(()=>{if(G.mouse)G.mouse.recent=false;},0);},{passive:true});
