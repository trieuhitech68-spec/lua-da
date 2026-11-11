/* ===================== LÃNH ĐỊA: VÙNG GIÀU / NGHÈO · ĐIỂM GIÀU CÓ TÊN · BỘ LẠC GIỮ ĐẤT · CHIẾM VÀ GIỮ TIỀN ĐỒN =====================
   1. Mỗi vùng có hồ sơ tài nguyên (giàu / thường / nghèo theo từng loại, hợp địa hình). Hái, chặt, đào, câu, săn ở vùng giàu được nhiều
      hơn và mọc lại nhanh hơn; vùng nghèo ít hơn, mọc lại chậm. Gần Trảng Khởi Đầu đá, cành, sợi, đá lửa, nước vẫn như cũ (hướng dẫn cần).
   2. Điểm giàu có tên (mỏ đồng, bãi muối, bãi đá lửa, vực cá, rừng gỗ quý, đồng phù sa, bãi ngọc trai) nằm xa nơi bắt đầu: có mốc đá dễ
      thấy, thêm cụm tài nguyên riêng (nối vào CUỐI danh sách RES → chỉ số cũ trong bản lưu không đổi), mọc lại nhanh gấp đôi.
   3. Ba bộ lạc mới giữ ba điểm (Đất Đỏ, Rừng Sâu: thù địch; Người Cửa Sông: trung lập, trao đổi được). Hạ hết người canh rồi dựng
      Cột vật tổ trong vòng đất của điểm đó là chiếm được. Tiền đồn mỗi ngày dồn sản vật vào kho; bộ lạc kéo quân đánh lại, càng giàu,
      càng giữ nhiều thì càng đánh mạnh. Hàng rào cọc, chòi canh, hố chông (more.js) giúp giữ đất khi vắng nhà.
   4. Chơi chung: mỗi người ghi sites/<uid> (công trình tiền đồn đã xong + thời gian có mặt). Ai cũng tính cùng một luật trên cùng dữ liệu:
      bộ tộc điểm cao nhất giữ đất, bên thứ hai ≥60% điểm thì "đang tranh chấp" (sản vật còn một nửa).
   GÁN LẠI (bọc, không sửa tệp cũ): resGen, resDeplete, hitTarget, h3gatherDone, give, cropsTick, campInit, foesTick, foeDamage,
   warDaily, findTarget, targetInfo, actStart, model, mapHtml, mapDraw, miniTick. */
const RLC={stone:['Đá','🪨'],flint:['Đá lửa','🔺'],ore:['Quặng đồng, thiếc','⛏️'],clay:['Đất sét','🟫'],salt:['Muối','🧂'],fish:['Cá','🐟'],game:['Thú săn','🦌'],
  timber:['Gỗ tốt','🪵'],bamboo:['Tre','🎋'],soil:['Đất màu','🌾'],herb:['Thuốc nam','🌿'],honey:['Mật ong','🍯'],shell:['Sò ốc, ngọc','🐚']};
const RLCAT={};[['stone','rock boulder pebble scree pathStone'],['flint','flintRock'],['ore','copperRock tinRock'],['clay','clay'],['salt','saltPan'],
  ['timber','pine oak birch dead pineG oakG log savannaTree deadLog'],['bamboo','bamboo'],['soil','wildgrain gourdwild'],['herb','mugwort ginger turmeric centella mint aloe'],
  ['honey','beehive'],['shell','shellBed']].forEach(([c,l])=>l.split(' ').forEach(t=>{RLCAT[t]=c;}));
// hồ sơ vùng: r = giàu, p = nghèo (loại không ghi = bình thường)
const RLPROF={start:['','ore honey salt shell'],ford:['fish clay','ore'],lake:['fish clay herb','stone ore'],range:['flint ore stone','soil fish honey'],
  karst:['stone flint','soil timber'],cave:['flint','game soil'],plateau:['stone game','timber fish'],chasm:['stone','soil fish game'],gorge:['fish stone','soil'],
  falls:['fish herb',''],savanna:['game','timber clay fish'],jungle:['timber herb honey game','stone flint'],forest:['timber game honey','clay salt'],
  bamboo:['bamboo herb','stone'],delta:['clay soil fish salt','stone flint timber'],beach:['shell salt','timber soil clay'],cliffs:['fish stone','soil timber'],
  banyan:['','ore'],village:['soil',''],camp:['ore','soil'],hills:['flint stone ore','soil fish'],
  trangan:['fish bamboo','soil'],halong:['shell fish salt','timber soil'],pineplat:['timber game herb','soil fish'],canyon:['fish stone flint','soil'],
  bamboovl:['bamboo herb fish','ore'],terrace:['soil herb clay','timber ore'],meadow4:['honey game soil','stone timber'],mangrove:['fish shell salt clay','stone flint soil'],
  basalt:['ore soil flint','fish timber'],hotspring:['salt herb','timber'],ancient:['timber honey herb','stone soil'],vista:['stone','soil fish timber game']};
const RLPS={};for(const id in RLPROF){const [r,p]=RLPROF[id];RLPS[id]={r:new Set(r.split(' ').filter(Boolean)),p:new Set(p.split(' ').filter(Boolean))};}
const RLY={3:1.5,2:1,1:0.65},RLG={3:0.7,2:1,1:1.5};// hệ số sản lượng / thời gian mọc lại
/* ---------- bộ lạc & điểm giàu ---------- */
const RLTRIBE={
  datdo:{n:'Bộ lạc Đất Đỏ',ic:'🔴',col:'#c0452a',mood:-1,hp:11,dmg:10,g:5,gift:{meat:6,hide:2},trade:[[{meat:4},{copper:2}],[{hide:2},{tin:1}],[{salt:2},{copper:3}],[{fish:4},{flint:3}]],
    d:'Thợ mỏ hung hãn sống quanh núi lửa tắt, giữ mỏ đồng như giữ mạng sống.'},
  rungsau:{n:'Bộ lạc Rừng Sâu',ic:'🟢',col:'#3a8a3a',mood:-1,hp:9,dmg:8,g:4,gift:{salt:2,fish:3},trade:[[{stone:6},{wood:8}],[{fish:3},{honey:1}],[{flint:3},{hide:2}],[{salt:1},{ginger:3}]],
    d:'Thợ săn ẩn trong rừng cổ thụ, bắn tên độc từ trên cây.'},
  cuasong:{n:'Người Cửa Sông',ic:'🔵',col:'#3a7ac0',mood:0,hp:8,dmg:7,g:4,gift:{fish:3},trade:[[{fish:4},{salt:2}],[{wood:6},{salt:2}],[{meat:3},{shell:3}],[{pot:1},{salt:3}]],
    d:'Dân chài làm muối hiền hoà, thích đổi muối lấy cá, gỗ, nồi gốm. Chọc giận thì cũng cầm giáo.'},
  nuida:{n:'Bộ lạc Núi Đá',ic:'⚔️',col:'#8a3a2a',mood:-1,hp:9,dmg:9,g:0,d:'Bộ lạc hiếu chiến ở trại phía đông.'}};
const RLSITE=[
  {id:'nuido',n:'Mỏ đồng Núi Đỏ',ic:'⛏️',cat:'ore',regs:['basalt','hills','range','plateau'],tribe:'datdo',rich:3,y:{copper:3,tin:1,stone:2},nodes:[['copperRock',7],['tinRock',4],['flintRock',2]],d:'Sườn đồi đất đỏ lộ vỉa đá xanh lục lẫn cam: quặng đồng, quặng thiếc nằm ngay mặt đất.'},
  {id:'muoi',n:'Bãi muối Cửa Sông',ic:'🧂',cat:'salt',regs:['mangrove','delta','beach'],tribe:'cuasong',rich:2,water:1,y:{salt:4,fish:2},nodes:[['saltPan',10],['reedBed',3]],d:'Bãi bồi cửa sông, nước triều rút để lại lớp muối trắng kết trên mặt bùn.'},
  {id:'dalua',n:'Bãi đá lửa',ic:'🔺',cat:'flint',regs:['canyon','karst','hills'],rich:2,y:{flint:4,stone:3},nodes:[['flintRock',9],['boulder',3]],d:'Lòng khe đầy cuội đá lửa xám xanh, ghè ra lưỡi sắc như dao.'},
  {id:'vucca',n:'Vực cá',ic:'🐟',cat:'fish',regs:['trangan','gorge','lake','falls','delta'],rich:2,water:1,y:{fish:5},nodes:[['reedBed',4],['clay',2]],d:'Vực nước sâu chân núi, cá về thành đàn. Câu, đâm, quăng chài ở đây được gấp rưỡi.'},
  {id:'goquy',n:'Rừng gỗ quý',ic:'🌳',cat:'timber',regs:['ancient','jungle','forest'],tribe:'rungsau',rich:3,y:{wood:8,honey:1},nodes:[['oakG',6],['beehive',2],['log',2]],d:'Cây gỗ quý trăm năm thẳng tắp, tổ ong rừng treo trên cao.'},
  {id:'phusa',n:'Đồng đất phù sa',ic:'🌾',cat:'soil',regs:['terrace','delta','lake','savanna'],rich:2,y:{grain:4,clay:2,seedGrain:1},nodes:[['wildgrain',8],['gourdwild',3],['clay',3]],d:'Đất phù sa màu mỡ, kê dại mọc dày. Ruộng làm quanh đây lớn nhanh hẳn.'},
  {id:'ngoc',n:'Bãi ngọc trai Vịnh Đá',ic:'🦪',cat:'shell',regs:['halong','beach','cliffs','delta'],rich:3,water:1,pearl:0.3,y:{shell:4},nodes:[['shellBed',9]],d:'Bãi cát trắng trong vịnh kín gió, sò điệp, trai ngọc bám đầy rạn đá.'}];
const RLSR=220;// bán kính đất của một điểm (du)
const RLOUT=/^(totem|palisade|palisadeGate|watchtower|spikePit|chest|basket|pottery)$/;// công trình tiền đồn
const RL={sites:[],byId:{},base:0,n:0,tick:0,dis:0,cap:0,raid:null,spawnT:0,mp:{sub:false,docs:{},ctl:{},pt:{},putT:0,last:'',calcT:0}};
/* ---------- vật phẩm, tài nguyên mới ---------- */
Object.assign(ITEMS,{pearl:{n:'Ngọc trai',t:'res',ds:'Hạt ngọc óng ánh trong con trai ở bãi ngọc Vịnh Đá. Xâu thành chuỗi, hoặc mang đi đổi.'},
  pearlBeads:{n:'Chuỗi ngọc trai',t:'wear',warm:0,slot:'acc',ds:'Chuỗi ngọc trai xâu sợi: của quý của người đứng đầu.'}});
if(!ITEMS.salt)ITEMS.salt={n:'Muối',t:'res'};if(!ITEMS.shell)ITEMS.shell={n:'Vỏ ốc',t:'res'};
if(typeof EMO==='object')Object.assign(EMO,{pearl:'⚪',pearlBeads:'📿',salt:EMO.salt||'🧂',shell:EMO.shell||'🐚'});
RECIPES.push({id:'pearlBeads',out:{pearlBeads:1},in:{pearl:3,fiber:1},st:null,tool:'knife',req:['pearl']});
Object.assign(RT,{saltPan:{n:'Ruộng muối tự nhiên',m:['rlSaltPan'],hp:2,tool:null,yield:{salt:[1,2]},r:10,regrow:2,sk:'gather',pass:1},
  shellBed:{n:'Bãi sò, trai ngọc',m:['rlShellBed'],hp:2,tool:null,yield:{shell:[2,3]},r:8,regrow:2,sk:'gather',pass:1}});
// mô hình (K3) cho tài nguyên & mốc đất mới
const RLMOD={
  rlSaltPan:()=>{const K=K3,a=[K.cyl(11,12,0.7,'#7a6a4e',{y:-0.2},14),K.cyl(9.5,10,0.9,'#eceae2',{y:0},14)];for(let i=0;i<6;i++){const an=i*1.1;a.push(K.ico(1.6+(i%3)*0.5,'#f7f6f0',{x:Math.cos(an)*(3+i),z:Math.sin(an)*(3+i),y:1,sy:0.6},0,0.3,i+1));}return K.group(a);},
  rlShellBed:()=>{const K=K3,a=[K.cyl(8,9,0.5,'#d9c9a0',{y:-0.1},12)];for(let i=0;i<9;i++){const an=i*0.7,r=1.5+i*0.7;a.push(K.ico(1.3+(i%2)*0.5,i%3?'#efe6dc':'#e3b9b0',{x:Math.cos(an)*r,z:Math.sin(an)*r,y:0.6,sy:0.45},0,0.2,i+3));}return K.group(a);},
  rlCairn:(col)=>{const K=K3;return K.group(K.ico(10,'#8a857c',{y:4,sy:0.6},0,0.35,1),K.ico(7.5,'#9a948a',{y:11,sy:0.7},0,0.3,2),K.ico(5,'#7d776d',{y:17},0,0.3,3),
    K.cyl(0.9,1.2,52,'dwood',{y:0},6),K.box(16,10,0.7,col||'#c8902a',{x:8,y:38}),K.cone(1.6,4,'dwood',{y:52},6));}};
{const _m=model;model=function(spec){if(spec&&RLMOD[spec[0]]){try{return RLMOD[spec[0]](spec[1]);}catch(e){}}return _m(spec);};}
/* ---------- tra cứu ---------- */
function rlS(){if(!S.rlm||typeof S.rlm!=='object')S.rlm={};const R=S.rlm;['pro','kn','s','t','pos','mp'].forEach(k=>{if(!R[k]||typeof R[k]!=='object')R[k]={};});return R;}
function rlLvl(reg,cat){const P=reg&&RLPS[reg.id];if(!P)return 2;return P.r.has(cat)?3:P.p.has(cat)?1:2;}
function rlSiteAt(x,z,pad){for(const s of RL.sites)if(Math.hypot(s.x-x,s.z-z)<RLSR+(pad||0))return s;return null;}
function rlMine(s){const st=S.rlm&&S.rlm.s[s.id];return !!st&&st.own==='me';}
function rlHeld(){return RL.sites.filter(rlMine).length;}
// hệ số sản lượng của một tài nguyên (vùng + điểm giàu + tiền đồn của mình)
function rlResMul(q){const cat=RLCAT[q.t];let m=1;if(cat)m=RLY[rlLvl(regionAt(q.x,q.z),cat)];if(q.site)m*=1.3;const s=rlSiteAt(q.x,q.z);if(s&&rlMine(s))m*=1.25*rlMpK(s);return m;}
function rlRegrowF(q){const cat=RLCAT[q.t];let f=cat?RLG[rlLvl(regionAt(q.x,q.z),cat)]:1;if(q.site)f*=0.5;return f;}
function rlSoilMul(x,z){let m={3:1.35,2:1,1:0.8}[rlLvl(regionAt(x,z),'soil')];const s=rlSiteAt(x,z,80);if(s&&s.def.cat==='soil'&&rlMine(s))m*=1.4;return m;}
function rlCatMulAt(cat,x,z){let m=RLY[rlLvl(regionAt(x,z),cat)];const s=rlSiteAt(x,z,120);if(s&&s.def.cat===cat)m*=rlMine(s)?1.5*rlMpK(s):1.2;return m;}
const rlRound=(n,m)=>n<=0?0:Math.max(1,Math.floor(n*m+Math.random()));
/* ---------- sinh điểm giàu & cụm tài nguyên (nối CUỐI RES) ---------- */
function rlScore(x,z,def,dd,used,lx){const h=hAt(x,z);if(h<3||h>330||wdAt(x,z)>0)return -1e9;const camp=!!def.tribe,cr=camp?120:40;
  let sl=slopeAt(x,z);for(let a=0;a<6;a++){const ax=x+Math.cos(a*1.047)*cr*0.7,az=z+Math.sin(a*1.047)*cr*0.7;if(wdAt(ax,az)>0)return -1e9;sl=Math.max(sl,slopeAt(ax,az));}
  if(sl>(camp?0.24:0.34)+(lx?0.08:0))return -1e9;if(Math.hypot(x-SPAWN[0],z-SPAWN[1])<(def.minD?def.minD*(lx?0.8:1):(lx?1100:1500)))return -1e9;// minD: điểm cấp cao phải ở xa nơi bắt đầu (khu.js)
  for(const s of used)if(Math.hypot(s.x-x,s.z-z)<(lx?420:650))return -1e9;
  for(const g of REG)if((g.id==='village'||g.id==='camp'||g.id==='start'||g.id==='cave'||g.id==='banyan')&&Math.hypot(g.x-x,g.z-z)<(lx?400:520))return -1e9;
  for(const d of DECO_PLAN)if(Math.hypot(d.x-x,d.z-z)<d.r+(lx?cr*0.5:cr+10))return -1e9;
  if(!S.mp&&S.builds)for(const b of S.builds)if(Math.hypot(b.x-x,b.z-z)<cr+140)return -1e9;
  let sc=-dd*0.25-sl*300-Math.max(0,trailAt(x,z))*40;
  if(def.water){let n=0;for(let a=0;a<10;a++)for(const r of [cr+40,cr+110]){if(wdAt(x+Math.cos(a*0.628)*r,z+Math.sin(a*0.628)*r)>0.5){n++;break;}}if(n<2)return -1e9;sc+=n*30-h*1.5;}
  return sc;}
function rlPick(def,usedReg,used){for(const lx of [0,1])for(const rid of def.regs){if(usedReg.has(rid))continue;const g=REG.find(r=>r.id===rid);if(!g)continue;const R=g.r*(lx?1.1:0.85),st=Math.max(40,R/22);let best=null,bs=-1e8;
    for(let x=g.x-R;x<=g.x+R;x+=st)for(let z=g.z-R;z<=g.z+R;z+=st){const dd=Math.hypot(x-g.x,z-g.z);if(dd>R)continue;const s=rlScore(x,z,def,dd,used,lx);if(s>bs){bs=s;best=[x,z];}}
    if(best){usedReg.add(rid);return {x:+best[0].toFixed(1),z:+best[1].toFixed(1),reg:rid};}}return null;}
function rlGen(seed){const R0=rlS();if(R0.wv!==WV){R0.wv=WV;R0.pos={};R0.s={};R0.kn={};R0.pro={};R0.t={};}
  RL.sites=[];RL.byId={};const usedReg=new Set(),used=[];
  for(const def of RLSITE){if(def.land&&def.land!==(typeof landCur==='function'?landCur().id:'c'))continue;/* điểm riêng của một vùng đất (lands2.js) */let p=R0.pos[def.id];if(!(p&&Array.isArray(p)&&isFinite(p[0])&&isFinite(p[1]))){const q=rlPick(def,usedReg,used);if(!q){R0.pos[def.id]=[null,null];continue;}p=R0.pos[def.id]=[q.x,q.z,q.reg];}
    if(p[0]==null)continue;const s={id:def.id,def,x:p[0],z:p[1],reg:p[2]||(regionAt(p[0],p[1])||{}).id};usedReg.add(s.reg);used.push(s);RL.sites.push(s);RL.byId[s.id]=s;}
  // dọn chỗ dựng trại/mốc (đổi loại tại chỗ, giữ số thứ tự)
  const base0=RES.length;for(const s of RL.sites){const cr=s.def.tribe?140:30;for(const i of near(s.x,s.z,cr+20)){const q=RES[i];if(!q||i>=base0||RT[q.t].pass)continue;if(Math.hypot(q.x-s.x,q.z-s.z)>cr)continue;q.t='tallgrass';q.s=RT.tallgrass.sc||1;q.hp=RT.tallgrass.hp;}}
  // cụm tài nguyên riêng (thế giới tất định theo hạt giống + vị trí điểm)
  const base=RES.length;const R=rng((seed|0)*41+1777);
  const okFree=(x,z,r)=>{for(const i of near(x,z,r+30)){const q=RES[i];if(Math.hypot(q.x-x,q.z-z)<r+(RT[q.t].r||4)*0.8)return false;}return true;};
  const put=(t,x,z,site)=>{const q={i:RES.length,t,x,z,ry:R()*6.283,s:(0.85+R()*0.35)*(RT[t].sc||1),hp:RT[t].hp,st:0,rg:0,site};if(/^(oakG|pineG)$/.test(t))q.s=(1.3+R()*0.5)*(RT[t].sc||1);RES.push(q);const k=rKey(x,z);if(!RGRID.has(k))RGRID.set(k,[]);RGRID.get(k).push(q.i);return q;};
  for(const s of RL.sites){const d=s.def,r0=d.tribe?150:40;for(const [t,n] of d.nodes){if(!RT[t])continue;let c=0,tr=0;const coast=t==='saltPan'||t==='shellBed';
      while(c<n&&tr<n*90){tr++;const relax=tr>n*45,a=R()*6.283,dd=r0+Math.sqrt(R())*(relax?260:190),x=s.x+Math.cos(a)*dd,z=s.z+Math.sin(a)*dd,h=hAt(x,z);if(wdAt(x,z)>0)continue;
        if(coast){if(h<0.3||h>(relax?24:10))continue;}else if(h<2)continue;if(slopeAt(x,z)>0.6||decoBlock(x,z))continue;if(!RT[t].pass&&trailAt(x,z)>0.15)continue;if(!okFree(x,z,(RT[t].r||4)+3))continue;put(t,x,z,s.id);c++;}}}
  const n=RES.length-base;RL.base=base;RL.n=n;
  // bản lưu cũ: cây trồng đã lớn (nạp sau, chỉ số = RES.length lúc nạp) dời chỉ số theo số tài nguyên mới thêm
  const S0=S.res||{},ob=R0.rb,on=R0.rn;if(ob==null){if(n){const o={};for(const k in S0){const i=+k;o[i>=base?i+n:i]=S0[k];}S.res=o;}}
  else if(ob!==base||on!==n){const o={};for(const k in S0){const i=+k;if(i<ob)o[i]=S0[k];else if(i>=ob+on)o[i-ob-on+base+n]=S0[k];}S.res=o;}
  R0.rb=base;R0.rn=n;
  for(const s of RL.sites){const st=R0.s[s.id];if(!st||typeof st!=='object'){const T=s.def.tribe&&RLTRIBE[s.def.tribe];R0.s[s.id]={own:s.def.tribe||null,g:T?T.g:0,stock:T?rlYmul(s.def.y,2):{},raidAt:0};}
    const v=R0.s[s.id];if(!v.stock||typeof v.stock!=='object')v.stock={};v.g=Math.max(0,Math.min(12,v.g|0));}
  for(const tid in RLTRIBE){if(!R0.t[tid]||typeof R0.t[tid]!=='object')R0.t[tid]={rel:RLTRIBE[tid].mood,peace:0};}}
function rlYmul(y,k){const o={};for(const i in y)if(ITEMS[i])o[i]=Math.max(1,Math.round(y[i]*k));return o;}
{const _rg=resGen;resGen=function(seed){_rg(seed);try{rlGen(seed);}catch(e){console.warn('lãnh địa',e);}};}
/* ---------- dựng trại bộ lạc & mốc đá (vẽ hàng loạt, mỗi điểm một nhóm có hình cầu bao để cắt bỏ) ---------- */
function rlBuild(){const T=THREE;for(const s of RL.sites){if(s.api)continue;try{const g=new T.Group(),cy=hAt(s.x,s.z),add=(m,x,z,ry)=>{m.position.set(x,hAt(s.x+x,s.z+z)-cy-0.6,z);m.rotation.y=ry||0;g.add(m);};
    if(s.def.tribe){[[0,-80,0],[75,-20,-1.2],[-75,-20,1.2],[40,70,-2.4]].forEach(([x,z,r])=>{add(model(['piece','tent']),x,z,r);SCOL.push({x:s.x+x,z:s.z+z,r:34});});add(model(['piece','campfire']),0,0);add(model(['piece','totem']),0,-34);
      add(model(['piece','chest']),20,10);add(model(['piece','dryRack']),-50,40);for(let a=0;a<16;a++){if(a===3||a===11)continue;const an=a/16*6.283,x=Math.cos(an)*128,z=Math.sin(an)*128;add(model(['piece','post']),x,z,an);SCOL.push({x:s.x+x,z:s.z+z,r:4});}
      add(RLMOD.rlCairn(RLTRIBE[s.def.tribe].col),-24,20,0.4);}
    else{add(RLMOD.rlCairn({ore:'#c87a3a',salt:'#e8e6dc',flint:'#6a7a8a',fish:'#3a8ac0',timber:'#4a7a3a',soil:'#c8a03a',shell:'#e3b9b0'}[s.def.cat]),0,0,0);SCOL.push({x:s.x,z:s.z,r:10});}
    const api=instGroup(protoParts(g),1,{shadow:true,sphere:{x:s.x,y:cy+30,z:s.z,r:s.def.tribe?190:60}});api.set(0,s.x,cy,s.z,0,1);api.flush();G.sc.add(api.G);seasonPatchAll(api.G);s.api=api;}catch(e){console.warn('dựng điểm',s.id,e);}}}
{const _ci=campInit;campInit=function(){_ci();try{rlBuild();}catch(e){console.warn('lãnh địa: dựng',e);}};}
/* ---------- sản lượng: hái/chặt/đào, câu cá, săn thú, ruộng ---------- */
{const _ht=hitTarget;hitTarget=function(t){G._rlQ=t&&t.type==='res'?t.q:null;try{return _ht(t);}finally{G._rlQ=null;}};}
{const _gd=h3gatherDone;h3gatherDone=function(q,out,D,kind,bad){G._rlQ=q;try{return _gd(q,out,D,kind,bad);}finally{G._rlQ=null;}};}
function rlGiveMul(o){const q=G._rlQ;if(q){if(q.st!==0)return o;const m=rlResMul(q),r={};for(const k in o){const v=o[k];r[k]=typeof v==='number'&&m!==1?rlRound(v,m):v;}
    if(q.t==='shellBed'&&ITEMS.pearl){const s=rlSiteAt(q.x,q.z),ch=(s&&s.def.pearl||0.08)*(s&&rlMine(s)?1.4:1);if(Math.random()<ch)r.pearl=(r.pearl||0)+1;}return r;}
  if(G.panel==='npc'||G.panel==='store')return o;let r=null;
  if(o.fish>0){const m=rlCatMulAt('fish',P.x,P.z);if(m!==1){r=r||Object.assign({},o);r.fish=rlRound(o.fish,m);}}
  if(o.meat>0||o.hide>0){const m=rlCatMulAt('game',P.x,P.z);if(m!==1){r=r||Object.assign({},o);if(o.meat>0)r.meat=rlRound(o.meat,m);if(o.hide>0&&m>1.2)r.hide=rlRound(o.hide,Math.min(1.3,m));}}
  return r||o;}
{const _g=give;give=function(o,src){if(o&&typeof o==='object'&&!G._rlNo&&S&&S.rlm)try{o=rlGiveMul(o);}catch(e){}return _g(o,src);};}
{const _rd=resDeplete;resDeplete=function(q){_rd(q);try{const m=S.res[q.i];if(!m||m[1]>1e11)return;const f=rlRegrowF(q);if(f===1)return;const now=TNOW(),t=now+(m[1]-now)*f;m[1]=+t.toFixed(3);q.rg=t;}catch(e){}};}
{const _ct=cropsTick;cropsTick=function(gd){const b4={};for(const id in S.crops)b4[id]=S.crops[id].p||0;_ct(gd);
  for(const id in S.crops){const c=S.crops[id],d=(c.p||0)-(b4[id]||0);if(d<=0||c.p>=1)continue;const b=BYID.get(+id);if(!b)continue;const m=rlSoilMul(b.x,b.z);if(m!==1)c.p=Math.max(0,Math.min(1,c.p+d*(m-1)));}};}
/* ---------- thăm dò: bốc đất, gõ đá, xem cây cỏ → biết vùng giàu nghèo gì ---------- */
function rlProspect(){if(G.work)return;const r=regionAt(P.x,P.z);if(S.p.stam<8){uiToast('Mệt quá, nghỉ một lát đã.','bad');return;}
  const done=()=>{const R=rlS();S.p.stam=Math.max(0,S.p.stam-6);if(!r){uiToast('🔍 Đất hoang ở đây chẳng có gì đặc biệt.','');return;}const fresh=!R.pro[r.id];R.pro[r.id]=1;
    let ns=0;for(const s of RL.sites)if((s.reg===r.id||Math.hypot(s.x-P.x,s.z-P.z)<r.r*1.2)&&!R.kn[s.id]){R.kn[s.id]=1;ns++;}
    const P_=RLPS[r.id]||{r:new Set(),p:new Set()},rich=[...P_.r].map(c=>RLC[c][1]+' '+RLC[c][0]).join(', '),poor=[...P_.p].map(c=>RLC[c][0]).join(', ');
    uiToast(`🔍 ${r.n}: ${rich?'giàu '+rich:'không có gì nổi bật'}${poor?' · nghèo '+poor.toLowerCase():''}${ns?` · tìm ra ${ns} điểm giàu (xem Bản đồ → Lãnh địa)`:''}`,'gold');
    if(fresh){addXp('gather',4);cnt('cnt','prospect');}sfx('idea');save();if(G.panel==='map')uiOpenRefresh();};
  if(typeof l4Work==='function')l4Work([['Bốc nắm đất, vê xem màu đất','h3inspect',1.0,'pick'],['Gõ đá nghe tiếng, xem vân đá','work',1.2,'pick'],['Ngắm cây cỏ, dấu chân thú quanh đây','h3inspect',0.9,'pick']],{icon:'stone',sk:'gather'},done);else done();}
/* ---------- chiến binh các bộ lạc mới (dùng chung G.foes để vũ khí, hàng rào, hố chông, chòi canh đều tác dụng) ---------- */
function rlFoe(s,tid,mode,x,z){const T=RLTRIBE[tid]||RLTRIBE.nuida;const f=foeSpawn(x,z,mode);f.tribe=tid;f.site=s.id;f.n='Chiến binh '+T.n.replace(/^Bộ lạc |^Người /,'');f.hp=T.hp;f.hp0=T.hp;f.dmg=T.dmg;f.home={x:s.x,z:s.z};
  const R=rlS();f.peace=mode==='guard'&&((R.t[tid]||{}).rel>=0||(R.t[tid]||{}).peace>S.day)?1:0;return f;}
function rlFoesTick(L,dt){const cozy=S.mode==='cozy';for(const f of L){if(!f.alive){if(f.dieT!=null){f.dieT+=dt;f.o.rotation.z=Math.min(1.5,f.dieT*2.5);if(f.dieT>4){G.sc.remove(f.o);f.gone=1;}}continue;}
    const H=f.home,dP=Math.hypot(P.x-f.x,P.z-f.z);if(f.mode==='guard'&&dP>2600){G.sc.remove(f.o);f.gone=1;continue;}
    let tx=f.x,tz=f.z,sp=0,pose='idle',tgt=null;const st=S.rlm.s[f.site],S0=RL.byId[f.site];
    if(!f.peace){const rr=f.mode==='guard'?(cozy?200:300):480;if(dP<rr&&!G.ride)tgt={x:P.x,z:P.z,pl:1};if(f.mode==='guard'&&tgt&&Math.hypot(P.x-H.x,P.z-H.z)>560)tgt=null;}
    if(f.flee){tx=f.fx??H.x;tz=f.fz??H.z;sp=130;if(Math.hypot(tx-f.x,tz-f.z)<40){if(f.mode==='raid'){G.sc.remove(f.o);f.gone=1;f.alive=false;continue;}f.flee=0;}}
    else if(tgt){tx=tgt.x;tz=tgt.z;sp=120;if(dP<f.r+16){sp=0;pose='chop';f.atkT=(f.atkT||0)-dt;if(f.atkT<=0){f.atkT=1.3;const d0=FOE.dmg;FOE.dmg=f.dmg||d0;try{foeHit(f,tgt);}finally{FOE.dmg=d0;}}}}
    else if(f.mode==='raid'&&S0){const gx=st&&st.tx!=null?st.tx:S0.x,gz=st&&st.tz!=null?st.tz:S0.z;tx=gx;tz=gz;sp=100;if(Math.hypot(gx-f.x,gz-f.z)<36){sp=0;pose='chop';}}
    else{f.t=(f.t||0)-dt;if(f.t<=0){f.t=3+Math.random()*5;f.gx=H.x+(Math.random()-0.5)*200;f.gz=H.z+(Math.random()-0.5)*200;}tx=f.gx??f.x;tz=f.gz??f.z;sp=Math.hypot(tx-f.x,tz-f.z)>5?45:0;}
    const dx=tx-f.x,dz=tz-f.z,d=Math.hypot(dx,dz);if(d>3&&sp>0){f.x+=dx/d*Math.min(d,sp*dt);f.z+=dz/d*Math.min(d,sp*dt);f.ry=Math.atan2(dx,dz);pose=pose==='chop'?pose:sp>80?'run':'walk';f.g=(f.g||0)+dt*(sp>80?2:1.4);}
    else if(tgt)f.ry=Math.atan2(tgt.x-f.x,tgt.z-f.z);
    f.y=groundY(f.x,f.z,f.y+10);f.o.visible=dP<1800;if(!f.o.visible)continue;f.o.position.set(f.x,f.y,f.z);f.o.rotation.y=lerpAng(f.o.rotation.y,f.ry||0,Math.min(1,dt*8));
    if(K3.char2Pose&&f.rig&&dP<800){try{K3.char2Pose(f.rig,pose,pose==='walk'||pose==='run'?f.g:pose==='chop'?1-(f.atkT||0)/1.3:G.t+f.ph,{tool:'spear'});}catch(e){}}}}
{const _ft=foesTick;foesTick=function(dt){if(!G.foes)return _ft(dt);const all=G.foes,mine=[],rest=[];for(const f of all)(f.tribe?mine:rest).push(f);
  if(!mine.length)return _ft(dt);G.foes=rest;try{_ft(dt);}finally{const keep=G.foes;try{rlFoesTick(mine,dt);}catch(e){if(!RL.fErr){RL.fErr=1;console.warn('lãnh địa: chiến binh',e);}}G.foes=keep.concat(mine.filter(f=>!f.gone));}};}
{const _fd=foeDamage;foeDamage=function(f,dmg){if(!f||!f.tribe)return _fd(f,dmg);if(!f.alive)return;f.hp-=dmg;sfx('hit');puff(f.x,f.y+20,f.z,'#c0392b',4);const R=rlS(),T=R.t[f.tribe];
  if(f.peace||(T&&(T.rel>=0||T.peace>S.day))){rlProvoke(f.tribe);}
  if(f.hp<=0){f.alive=false;f.dieT=0;G._rlNo=1;try{give({arrow:1+Math.floor(Math.random()*3),hide:Math.random()<0.5?1:0,meat:Math.random()<0.4?1:0},[f.x,f.y+16,f.z]);}finally{G._rlNo=0;}addXp('hunt',6);cnt('cnt','foe');
    const st=R.s[f.site];if(f.mode==='guard'&&st&&st.own===f.tribe){st.g=Math.max(0,(st.g|0)-1);if(st.g===0){uiToast(`⚔️ ${RL.byId[f.site].def.n}: không còn ai canh! Dựng Cột vật tổ (Xây → Trang trí) trong đất này để chiếm.`,'gold');sfx('level');}else uiToast(`⚔️ Hạ một chiến binh ${RLTRIBE[f.tribe].n.replace(/^Bộ lạc /,'')}. Còn ${st.g} người canh.`,'gold');}
    else uiToast('⚔️ Hạ được một kẻ tấn công.','gold');save();}};}
function rlProvoke(tid){const R=rlS(),T=R.t[tid];if(!T)return;const was=T.rel>=0||T.peace>S.day;T.rel=-1;T.peace=0;for(const f of G.foes||[])if(f.tribe===tid)f.peace=0;if(was){uiToast(`⚠️ ${RLTRIBE[tid].n} nổi giận: từ giờ họ coi bạn là kẻ thù!`,'bad');sfx('thunder');save();}}
/* ---------- tick 1 giây: phát hiện điểm, sinh/thu người canh, chiếm đất, đánh lại ---------- */
function rlTick(){if(!S||!S.rlm||!RL.sites.length)return;const R=S.rlm,now=G.t;
  for(const s of RL.sites){const d=Math.hypot(s.x-P.x,s.z-P.z),st=R.s[s.id];if(!st)continue;
    if(d<450&&!R.kn[s.id]){R.kn[s.id]=1;uiToast(`📍 Phát hiện: ${s.def.ic} ${s.def.n}${st.own&&st.own!=='me'?' · '+RLTRIBE[st.own].n+' đang giữ':''}`,'gold');sfx('idea');addXp('run',3);save();}
    // người canh: chỉ có hình khi ở gần
    if(st.own&&st.own!=='me'&&st.g>0&&d<1500&&now-RL.spawnT>0.4){let live=0;for(const f of G.foes||[])if(f.site===s.id&&f.mode==='guard'&&f.alive)live++;
      if(live<st.g){RL.spawnT=now;const a=Math.random()*6.283,r=30+Math.random()*90,x=s.x+Math.cos(a)*r,z=s.z+Math.sin(a)*r;if(wdAt(x,z)<=0)rlFoe(s,st.own,'guard',x,z);}}
    // chiếm đất: hết người canh + cột vật tổ của mình đã dựng xong trong vòng đất
    if(st.own!=='me'&&d<RLSR+300&&(st.g|0)===0){const tm=S.builds.find(b=>b.k==='totem'&&b.prog==null&&Math.hypot(b.x-s.x,b.z-s.z)<RLSR);if(tm)rlCapture(s,tm);}}
  // đánh lại
  const night=S.hour>=20||S.hour<4;
  for(const s of RL.sites){const st=R.s[s.id];if(!st||st.own!=='me')continue;if(!st.raidAt)st.raidAt=S.day+rlGap(s);
    if(S.day===st.raidAt&&S.hour>=17&&st.warn!==S.day&&!night){st.warn=S.day;const A=rlAttacker(s);uiToast(`⚠️ Trinh sát báo: ${RLTRIBE[A].n} tụ ${rlStrength(s)} quân, đêm nay đánh tiền đồn ${s.def.n}!`,'bad');sfx('bark');save();}
    if(night&&S.day>=st.raidAt&&st.raidDay!==S.day&&!RL.raid){const A=rlAttacker(s),T=R.t[A];if(T&&T.peace>S.day){st.raidAt=S.day+2;continue;}st.raidDay=S.day;rlRaid(s,A);}}
  if(RL.raid)rlRaidTick();
  try{rlMpTick();}catch(e){if(!RL.mErr){RL.mErr=1;console.warn('lãnh địa chung',e);}}}
function rlCapture(s,tm){const R=S.rlm,st=R.s[s.id],prev=st.own;st.own='me';st.g=0;st.since=S.day;st.tx=tm.x;st.tz=tm.z;st.lost=0;const loot=st.stock||{};st.stock={};
  if(Object.keys(loot).length){G._rlNo=1;try{give(loot,[s.x,30,s.z]);}finally{G._rlNo=0;}}st.raidAt=S.day+rlGap(s);if(prev&&RLTRIBE[prev]){R.t[prev].rel=-1;R.t[prev].peace=0;}
  R.kn[s.id]=1;S.rep=Math.min(100,(S.rep||0)+5);addXp('build',8);cnt('cnt','rlcap');uiToast(`🗿 Đã cắm cột vật tổ: ${s.def.n} thành tiền đồn của bạn! Mỗi ngày có sản vật dồn vào kho tiền đồn.`,'gold');sfx('level');save();}
function rlGap(s){const H=Math.max(1,rlHeld()),cozy=S.mode==='cozy';return Math.max(2,7-s.def.rich-Math.floor((H-1)/2))+Math.floor(Math.random()*3)+(cozy?3:0);}
function rlStrength(s){const H=Math.max(1,rlHeld()),cozy=S.mode==='cozy';let n=(1.5+s.def.rich*0.8)*(1+0.3*(H-1))*Math.min(2,1+S.day/40);if(cozy)n*=0.6;return Math.max(2,Math.min(8,Math.round(n)));}
function rlAttacker(s){if(s.def.tribe)return s.def.tribe;let best='nuida',bd=1e9;for(const o of RL.sites){if(!o.def.tribe||RLTRIBE[o.def.tribe].mood>=0&&(S.rlm.t[o.def.tribe]||{}).rel>=0)continue;const d=Math.hypot(o.x-s.x,o.z-s.z);if(d<bd){bd=d;best=o.def.tribe;}}
  if(G.camp&&Math.hypot(G.camp.x-s.x,G.camp.z-s.z)<bd)best='nuida';return best;}
function rlDef(s){let pal=0,tow=0,pit=0,tot=0;for(const b of S.builds){if(b.prog!=null)continue;const d=Math.hypot(b.x-s.x,b.z-s.z);if(d>RLSR+60)continue;if(b.k==='palisade'||b.k==='palisadeGate')pal++;else if(b.k==='watchtower')tow++;else if(b.k==='spikePit')pit++;else if(b.k==='totem')tot++;}
  return {pal,tow,pit,tot,v:0.5+Math.min(8,pal)*0.6+Math.min(3,tow)*3+Math.min(4,pit)*1.2};}
function rlRaid(s,A){const N=rlStrength(s),near=Math.hypot(P.x-s.x,P.z-s.z)<1500;
  if(near){const src=A==='nuida'&&G.camp?G.camp:RL.sites.find(o=>o.def.tribe===A)||{x:s.x+700,z:s.z};let ang=Math.atan2(src.z-s.z,src.x-s.x);if(src===s)ang=Math.random()*6.283;
    RL.raid={sid:s.id,A,siege:0,t0:G.t,n:N};for(let i=0;i<N;i++){let x=s.x+Math.cos(ang)*680+(Math.random()-0.5)*120,z=s.z+Math.sin(ang)*680+(Math.random()-0.5)*120;if(wdAt(x,z)>0){x=s.x+(Math.random()-0.5)*400;z=s.z+520;}
      const f=rlFoe(s,A,'raid',x,z);f.fx=x;f.fz=z;f.peace=0;}
    uiToast(`⚔️ ${RLTRIBE[A].n} kéo ${N} quân đánh tiền đồn ${s.def.n}! Giữ lấy cột vật tổ!`,'bad');sfx('thunder');}
  else{const D=rlDef(s),win=D.v+Math.random()*2>=N*1.3;rlRaidEnd(s,A,win,N,true,D);}}
function rlRaidTick(){const r=RL.raid,s=RL.byId[r.sid];const L=(G.foes||[]).filter(f=>f.site===r.sid&&f.mode==='raid'&&f.alive&&!f.flee);
  {const st=S.rlm.s[r.sid]||{},gx=st.tx??s.x,gz=st.tz??s.z;if(L.some(f=>Math.hypot(gx-f.x,gz-f.z)<40))r.siege+=1;}// mỗi giây có kẻ đứng sát cột vật tổ
  if(r.siege>12){for(const f of G.foes)if(f.site===r.sid&&f.mode==='raid')f.flee=1;RL.raid=null;rlRaidEnd(s,r.A,false,r.n,false);return;}
  if(!L.length||G.t-r.t0>300){RL.raid=null;rlRaidEnd(s,r.A,true,r.n,false);}}
function rlRaidEnd(s,A,win,N,far,D){const R=S.rlm,st=R.s[s.id];st.raidAt=S.day+rlGap(s);
  if(win){S.rep=Math.min(100,(S.rep||0)+2);cnt('cnt','rlhold');uiToast(far?`🛡️ Tiền đồn ${s.def.n} đẩy lùi ${N} quân ${RLTRIBE[A].n}${D&&D.pal+D.tow+D.pit?' nhờ hàng rào, chòi canh, hố chông':''}.`:`🛡️ Giữ vững ${s.def.n}! Quân ${RLTRIBE[A].n} tháo chạy.`,'gold');}
  else{st.own=A;st.g=Math.max(2,Math.ceil(N*0.6));st.stock={};st.lost=S.day;st.raidAt=0;if(R.t[A])R.t[A].rel=-1;uiToast(`🔥 Mất tiền đồn ${s.def.n}! ${RLTRIBE[A].n} chiếm lại và cướp sạch kho.${far?' (Dựng thêm hàng rào cọc, chòi canh, hố chông để giữ khi vắng nhà.)':''} Quay lại hạ người canh để giành lại.`,'bad');sfx('thunder');}
  save();}
/* ---------- theo ngày: sản vật tiền đồn, kho & người canh của bộ lạc ---------- */
function rlDaily(){const R=rlS();if(R.day===S.day)return;const first=R.day==null;R.day=S.day;if(first)return;
  for(const s of RL.sites){const st=R.s[s.id];if(!st)continue;const y=s.def.y;
    if(st.own==='me'){const k=rlMpK(s);for(const i in y){if(!ITEMS[i])continue;const add=Math.floor(y[i]*k+Math.random()*0.99);if(add>0)st.stock[i]=Math.min(y[i]*5,(st.stock[i]||0)+add);}
      if(s.def.pearl&&ITEMS.pearl&&Math.random()<s.def.pearl*k)st.stock.pearl=Math.min(4,(st.stock.pearl||0)+1);}
    else if(st.own&&RLTRIBE[st.own]){for(const i in y)if(ITEMS[i])st.stock[i]=Math.min(y[i]*4,(st.stock[i]||0)+Math.ceil(y[i]/2));const T=RLTRIBE[st.own];if(st.g<(T.g||3)&&S.day%2===0)st.g++;}}
  save();}
{const _wd=warDaily;warDaily=function(){_wd();try{rlDaily();}catch(e){console.warn('lãnh địa: ngày',e);}};}
{const _ft=foesTick;foesTick=function(dt){_ft(dt);if(G.t-RL.tick>1){RL.tick=G.t;try{rlTick();}catch(e){if(!RL.tErr){RL.tErr=1;console.warn('lãnh địa',e);}}}};}
/* ---------- kho tiền đồn, trao đổi, cống nạp, cướp kho ---------- */
function rlNearSite(lim){let b=null,bd=lim||300;for(const s of RL.sites){const d=Math.hypot(s.x-P.x,s.z-P.z);if(d<bd){bd=d;b=s;}}return b;}
function rlGuardsNear(s){let n=0;for(const f of G.foes||[])if(f.site===s.id&&f.alive&&f.mode==='guard'&&!f.peace&&Math.hypot(f.x-s.x,f.z-s.z)<260)n++;return n;}
function rlCollect(sid){const s=RL.byId[sid],st=s&&S.rlm.s[sid];if(!st||st.own!=='me')return;if(Math.hypot(s.x-P.x,s.z-P.z)>320){uiToast('Phải tới tận tiền đồn mới lấy được đồ trong kho.','bad');return;}
  const o={};for(const k in st.stock)if(st.stock[k]>0&&ITEMS[k])o[k]=st.stock[k];if(!Object.keys(o).length){uiToast('Kho tiền đồn đang trống. Sản vật dồn vào mỗi ngày.','');return;}
  G._rlNo=1;try{give(o,[s.x,30,s.z]);}finally{G._rlNo=0;}st.stock={};cnt('cnt','rlget');sfx('craft');uiHotbar();save();if(G.panel)uiOpenRefresh();}
function rlLoot(sid){const s=RL.byId[sid],st=s&&S.rlm.s[sid];if(!st||!st.own||st.own==='me')return;if(rlGuardsNear(s)){uiToast('Còn người canh kho! Hạ hết rồi mới lấy được.','bad');return;}
  const o={};for(const k in st.stock)if(st.stock[k]>0&&ITEMS[k])o[k]=st.stock[k];if(!Object.keys(o).length){uiToast('Kho trống trơn.','');return;}rlProvoke(st.own);
  G._rlNo=1;try{give(o,[s.x+20,30,s.z+10]);}finally{G._rlNo=0;}st.stock={};cnt('cnt','raid');addXp('hunt',8);uiToast(`💰 Cướp sạch kho của ${RLTRIBE[st.own].n}!`,'gold');sfx('level');save();}
function rlTradeOk(tid){const T=S.rlm.t[tid];return !!T&&(T.rel>=0||T.peace>S.day);}
function rlTrade(sid,i){const s=RL.byId[sid],st=s&&S.rlm.s[sid];if(!st||!RLTRIBE[st.own])return;const tid=st.own,o=(RLTRIBE[tid].trade||[]).filter(t=>Object.keys(t[0]).concat(Object.keys(t[1])).every(k=>ITEMS[k]))[+i];
  if(!o||!rlTradeOk(tid)||Math.hypot(s.x-P.x,s.z-P.z)>400||!canPay(o[0]))return;pay(o[0]);G._rlNo=1;try{give(o[1],[s.x,30,s.z]);}finally{G._rlNo=0;}cnt('cnt','trade');sfx('craft');uiHotbar();save();uiOpenRefresh();}
function rlPeace(sid){const s=RL.byId[sid],st=s&&S.rlm.s[sid];if(!st||!RLTRIBE[st.own])return;const tid=st.own,T=S.rlm.t[tid],g=RLTRIBE[tid].gift||{};if(Math.hypot(s.x-P.x,s.z-P.z)>700){uiToast('Lại gần trại hơn để gửi lễ vật.','bad');return;}
  if(!canPay(g)){uiToast('Chưa đủ lễ vật.','bad');sfx('no');return;}pay(g);T.peace=S.day+4;for(const f of G.foes||[])if(f.tribe===tid&&f.mode==='guard')f.peace=1;uiToast(`🕊️ ${RLTRIBE[tid].n} nhận lễ vật: hoà hoãn 4 ngày, cho vào trại trao đổi.`,'gold');sfx('level');save();uiOpenRefresh();}
// mục tiêu "kho trại / kho tiền đồn" đặt ở chỗ cái rương trong trại (hoặc chân mốc đá)
{const _ft=findTarget;findTarget=function(){const t=_ft();if(G.work||G.sit||G.ride||G.build||!S||!S.rlm||!RL.sites.length)return t;let best=null,bd=REACH+10;
  for(const s of RL.sites){const cx=s.def.tribe?s.x+20:s.x,cz=s.def.tribe?s.z+10:s.z,d=Math.hypot(cx-P.x,cz-P.z)-12;if(d<bd){bd=d;best={type:'rlsite',s,d,b:{x:cx,y:hAt(cx,cz)+10,z:cz}};}}
  if(!best)return t;if(!t)return best;if(t.type==='foe'||(t.type==='animal'&&t.a&&t.a.angry))return t;const td=t.d!=null?t.d:30;return bd<=td+2?best:t;};}
{const _ti=targetInfo;targetInfo=function(t){if(t&&t.type==='rlsite'){const s=t.s,st=S.rlm.s[s.id]||{};
    if(st.own==='me'){const n=Object.values(st.stock||{}).reduce((a,v)=>a+v,0);return {name:'Kho tiền đồn · '+s.def.n,verb:n?`Lấy ${n} món`:'Kho trống',ok:n>0,icon:Object.keys(s.def.y)[0]};}
    if(st.own&&RLTRIBE[st.own]){const g=rlGuardsNear(s);if(rlTradeOk(st.own)&&!g)return {name:'Kho trại · '+RLTRIBE[st.own].n,verb:'Trao đổi',ok:true,icon:Object.keys(s.def.y)[0]};
      const has=Object.values(st.stock||{}).some(v=>v>0);return {name:'Kho trại · '+RLTRIBE[st.own].n,verb:g?`Còn ${g} người canh`:has?'Cướp kho':'Kho trống',ok:!g&&has,icon:Object.keys(s.def.y)[0]};}
    return {name:s.def.ic+' '+s.def.n,verb:'Xem điểm giàu',ok:true,icon:Object.keys(s.def.y)[0]};}
  if(t&&t.type==='foe'&&t.a&&t.a.tribe)return {name:t.a.n+' · '+Math.max(0,Math.ceil(t.a.hp))+' máu',verb:'Đánh',ok:true,icon:'spear',warn:t.a.peace?'Đang hoà: đánh là gây chiến':null};return _ti(t);};}
{const _as=actStart;actStart=function(t){if(!G.work&&t&&t.type==='rlsite'){const s=t.s,st=S.rlm.s[s.id]||{};S.rlm.kn[s.id]=1;
    if(st.own==='me'){rlCollect(s.id);return;}if(st.own&&RLTRIBE[st.own]&&!(rlTradeOk(st.own)&&!rlGuardsNear(s))){rlLoot(s.id);return;}G.rlTab='realm';G.rlFocus=s.id;uiOpen('map',{});return;}return _as(t);};}
/* ---------- chơi chung: tranh giữ điểm giàu theo bộ tộc ---------- */
// sites/<uid>: {w, c, L:{siteId:[công trình, phút có mặt, lúc có mặt cuối (ms), có cột vật tổ 0/1]}}
function rlMpOn(){return !landFar()&&typeof mpOn==='function'&&typeof MP!=='undefined'&&mpOn();}
function rlMpVal(id,d){if(!mpIdOk(id)||!d||typeof d!=='object'||d.w!==S.seed||!d.L||typeof d.L!=='object')return null;const L={};
  for(const k in d.L){if(!RL.byId[k])continue;const a=d.L[k];if(!Array.isArray(a)||a.length<4)continue;const n=mpNum(a[0],0,1e4)?Math.min(20,a[0]|0):0,pt=mpNum(a[1],0,1e6)?Math.min(240,a[1]):0,at=mpNum(a[2],0,4e12)?Math.min(a[2],mpNow()+60000):0,tt=a[3]===1?1:0;L[k]=[n,pt,at,tt];}
  return {L};}
function rlGrp(uid){const c=mpClanOf(uid);return c||('u:'+uid);}
function rlGName(g){if(!g)return '';if(g.startsWith('u:'))return mpName(g.slice(2));const c=MP.clans[g];return c?c.emblem+' '+c.name:'Bộ tộc';}
function rlGCol(g){if(g&&!g.startsWith('u:')&&MP.clans[g])return MP.clans[g].color;return '#d8d0c0';}
function rlMpCalc(){const now=mpNow(),ctl={};for(const s of RL.sites){const sc={},tot={};for(const uid in RL.mp.docs){const e=RL.mp.docs[uid].L[s.id];if(!e)continue;const k=Math.max(0,Math.min(1,1-(now-e[2])/(3*86400e3)));if(k<=0)continue;
      const g=rlGrp(uid);sc[g]=(sc[g]||0)+(e[3]?20:0)+e[0]*5+e[1]*k;if(e[3])tot[g]=1;}
    const L=Object.keys(sc).filter(g=>tot[g]&&sc[g]>=20).sort((a,b)=>sc[b]-sc[a]||(a<b?-1:1));ctl[s.id]=L.length?{g:L[0],sc:Math.round(sc[L[0]]),g2:L[1]||null,sc2:L[1]?Math.round(sc[L[1]]):0,con:!!L[1]&&sc[L[1]]>=0.6*sc[L[0]],all:L.map(g=>[g,Math.round(sc[g])])}:null;}
  RL.mp.ctl=ctl;}
function rlMpK(s){if(!rlMpOn())return 1;const c=RL.mp.ctl[s.id];if(!c)return 1;const me=rlGrp(MP.uid);if(c.g!==me)return 0;return c.con?0.5:1;}
function rlMpTick(){if(!rlMpOn())return;const R=rlS(),now=mpNow();
  if(!RL.mp.sub){RL.mp.sub=true;try{const un=MP.db.collection('sites').limit(500).onSnapshot(sn=>{const o={};for(const d of sn.docs){const v=rlMpVal(d.id,d.data());if(v)o[d.id]=v;}RL.mp.docs=o;rlMpCalc();try{if(typeof pvpIn==='function')pvpIn(sn.docs);}catch(e){console.warn('cướp phá',e);}if(G.panel==='map'&&G.rlTab==='realm')uiOpenRefresh();},e=>console.warn('lãnh địa chung: nghe',e&&e.code));MP.unsubs.push(un);}catch(e){console.warn(e);}}
  // có mặt trong đất một điểm: cộng phút
  for(const s of RL.sites){const e=R.mp[s.id]||(R.mp[s.id]=[0,0]);if(Math.hypot(P.x-s.x,P.z-s.z)<RLSR){e[0]=Math.min(240,e[0]+1/60);e[1]=now;}}
  if(now-RL.mp.calcT>5000){RL.mp.calcT=now;rlMpCalc();}
  if(MP.ro||now-RL.mp.putT<20000)return;const L={};for(const s of RL.sites){let n=0,tt=0;for(const b of S.builds){if(b.prog!=null||!RLOUT.test(b.k))continue;if(Math.hypot(b.x-s.x,b.z-s.z)<RLSR){n++;if(b.k==='totem')tt=1;}}
    const e=R.mp[s.id]||[0,0],own=R.s[s.id]&&R.s[s.id].own==='me';if(!n&&!(e[0]>0))continue;L[s.id]=[Math.min(20,n),+e[0].toFixed(2),e[1]||0,tt&&own?1:0];}
  const doc={w:S.seed,c:mpMyClan()||null,L};{const R2=typeof pvpOut==='function'?pvpOut():null;if(R2)doc.R=R2;const W2=typeof pvpWarOut==='function'?pvpWarOut():null;if(W2)doc.W=W2;const Z2=typeof pvpFlagOut==='function'?pvpFlagOut():null;if(Z2)doc.Z=Z2;}/* R: biên bản cướp phá (pvp.js) */const key=JSON.stringify([doc.c,Object.entries(L).map(([k,v])=>[k,v[0],Math.floor(v[1]),v[3]]),doc.R||0,doc.W||0,doc.Z||0]);
  if(key===RL.mp.last&&now-RL.mp.putT<600000)return;RL.mp.last=key;RL.mp.putT=now;mpPut('sites/'+MP.uid,doc);const v=rlMpVal(MP.uid,doc);if(v){RL.mp.docs[MP.uid]=v;rlMpCalc();}}
/* ---------- giao diện: thẻ "Lãnh địa" trong Bản đồ, lớp Tài nguyên, dấu trên bản đồ & bản đồ nhỏ ---------- */
const RLDIR=['B','ĐB','Đ','ĐN','N','TN','T','TB'];
function rlDir(x,z){const dx=x-P.x,dz=z-P.z,a=Math.atan2(dx,-dz);return RLDIR[((Math.round(a/(Math.PI/4))%8)+8)%8];}
function rlOwnTxt(s){const st=S.rlm.s[s.id]||{};if(rlMpOn()){const c=RL.mp.ctl[s.id];if(c){const me=c.g===rlGrp(MP.uid);return `<b style="color:${me?'#ffd27a':rlGCol(c.g)}">${me?'Bộ tộc bạn':esc(rlGName(c.g))}</b> giữ · ${c.sc} điểm${c.con?` · <b class="rl-bad">đang tranh chấp</b> với ${esc(rlGName(c.g2))} (${c.sc2})`:''}`;}}
  if(st.own==='me')return '<b class="rl-good">Tiền đồn của bạn</b>';if(st.own&&RLTRIBE[st.own]){const T=RLTRIBE[st.own],ok=rlTradeOk(st.own);return `<b style="color:${T.col}">${T.ic} ${esc(T.n)}</b> ${ok?'(hoà hiếu)':'(thù địch)'} · ${st.g|0} người canh`;}return 'Đất hoang, chưa ai giữ';}
function rlYChips(y,k){return Object.entries(y).filter(([i])=>ITEMS[i]).map(([i,v])=>`<span class="chip">${icon(i)}${Math.max(0,Math.round(v*(k??1)))}</span>`).join('');}
function rlProfChips(id){const P_=RLPS[id];if(!P_)return '<span class="small muted">bình thường</span>';const a=[...P_.r].map(c=>`<span class="rl-c rich">${RLC[c][1]} ${RLC[c][0]}</span>`),b=[...P_.p].map(c=>`<span class="rl-c poor">${RLC[c][1]} ${RLC[c][0]}</span>`);return a.concat(b).join('')||'<span class="small muted">mọi thứ ở mức thường</span>';}
function rlHtml(){const R=rlS(),reg=regionAt(P.x,P.z),H=rlHeld(),title=['Người tự do','Chủ một tiền đồn','Thủ lĩnh hai vùng','Tù trưởng ba vùng'][Math.min(3,H)]+(H>3?` (${H} tiền đồn)`:'');
  let h=`<div class="rl-hd"><b>🏴 ${title}</b><span class="small muted">Giữ càng nhiều, càng giàu thì các bộ lạc càng đánh mạnh (quân đánh ×${(1+0.3*Math.max(0,H-1)).toFixed(1)}).</span></div>`;
  h+=`<div class="rl-card"><b>${reg?esc(reg.ic+' '+reg.n):'🌫️ Đất hoang'}</b>${reg?(R.pro[reg.id]?`<div class="rl-cs">${rlProfChips(reg.id)}</div>`:'<p class="small muted">Chưa thăm dò vùng này.</p>'):''}
    <div class="row"><button class="btn sm" data-a="rlpro"${G.work?' disabled':''}>🔍 Thăm dò quanh đây</button></div><p class="small muted">Bốc đất, gõ đá, xem cây cỏ để biết vùng giàu hay nghèo thứ gì; điểm giàu gần đó hiện lên bản đồ.</p></div>`;
  const known=RL.sites.filter(s=>R.kn[s.id]),foc=G.rlFocus;known.sort((a,b)=>(b.id===foc)-(a.id===foc)||Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z));
  h+=`<h3>Điểm giàu đã biết (${known.length}/${RL.sites.length})</h3>`;if(!known.length)h+='<p class="small muted">Chưa biết điểm nào. Đi xa khỏi Trảng Khởi Đầu, thăm dò các vùng: mỏ quặng, bãi muối, bãi ngọc… thường nằm ở rìa thế giới.</p>';
  for(const s of known){const st=R.s[s.id]||{},d=Math.hypot(s.x-P.x,s.z-P.z),mine=st.own==='me',k=mine?rlMpK(s):1,near=d<400,T=st.own&&RLTRIBE[st.own];
    let thr='';if(mine){const D=rlDef(s);thr=`Đánh lại: ${st.raidAt?`ngày ${st.raidAt}`:'chưa rõ'} · khoảng ${rlStrength(s)} quân · phòng thủ ${D.v.toFixed(1)} (rào ${D.pal}, chòi ${D.tow}, hố ${D.pit})`;}
    else if(T)thr=rlTradeOk(st.own)?'Hoà hiếu: vào trại được':`Nguy hiểm: ${st.g|0} chiến binh, ${T.hp} máu, đánh ${T.dmg}`;else thr='An toàn';
    const stock=mine?Object.entries(st.stock||{}).filter(([i,v])=>v>0&&ITEMS[i]):[];
    h+=`<div class="rl-card${mine?' mine':''}${s.id===foc?' foc':''}"><div class="rl-t"><b>${s.def.ic} ${esc(s.def.n)}</b><span class="small">${'★'.repeat(s.def.rich)}${'☆'.repeat(3-s.def.rich)} · ${Math.round(d/20)} m ${rlDir(s.x,s.z)}</span></div>
      <p class="small">${esc(s.def.d)}</p><p class="small">${rlOwnTxt(s)}</p><p class="small muted">⚠️ ${esc(thr)}</p>
      <div class="rl-y"><span class="small muted">Mỗi ngày${mine&&k<1?` (×${k})`:''}:</span>${rlYChips(s.def.y,mine?k:1)}${s.def.pearl?`<span class="chip">${icon('pearl')}?</span>`:''}</div>
      ${stock.length?`<div class="rl-y"><span class="small muted">Trong kho:</span>${stock.map(([i,v])=>`<span class="chip">${icon(i)}${v}</span>`).join('')}</div>`:''}
      <div class="row"><button class="btn sm ghost" data-a="rlmark" data-s="${s.id}">📍 Cắm cờ</button>${mine?`<button class="btn sm" data-a="rlget" data-s="${s.id}"${near&&stock.length?'':' disabled'}>📦 Lấy đồ</button>`:''}
      ${T&&!mine&&!rlTradeOk(st.own)&&RLTRIBE[st.own].gift?`<button class="btn sm ghost" data-a="rlpeace" data-s="${s.id}"${d<700&&canPay(RLTRIBE[st.own].gift)?'':' disabled'}>🕊️ Cống nạp ${Object.entries(RLTRIBE[st.own].gift).map(([i,v])=>v+' '+ITEMS[i].n.toLowerCase()).join(', ')}</button>`:''}
      ${!mine&&(st.g|0)===0&&near?`<button class="btn sm" data-a="rltotem">🗿 Dựng cột vật tổ</button>`:''}</div>
      ${T&&!mine&&rlTradeOk(st.own)&&near?`<div class="rl-tr">${(T.trade||[]).filter(t=>Object.keys(t[0]).concat(Object.keys(t[1])).every(i=>ITEMS[i])).map((t,i)=>`<div class="rc${canPay(t[0])?'':' dim'}"><div class="rc-b"><div class="chips">${chips(t[0])}</div><span class="small muted">đổi</span><div class="chips">${rlYChips(t[1])}</div></div><div class="rc-a"><button class="btn sm" data-a="rltrade" data-s="${s.id}" data-i="${i}"${canPay(t[0])?'':' disabled'}>Đổi</button></div></div>`).join('')}</div>`:''}
      ${rlMpOn()&&RL.mp.ctl[s.id]&&RL.mp.ctl[s.id].all.length>1?`<p class="small muted">Điểm tranh giữ: ${RL.mp.ctl[s.id].all.map(([g,v])=>esc(rlGName(g))+' '+v).join(' · ')}</p>`:''}</div>`;}
  h+=`<details class="rl-help"><summary>Cách chiếm và giữ đất</summary><ul class="tips"><li>Bộ lạc giữ đất: hạ hết người canh (hoặc cống nạp để hoà, rồi trao đổi). Trại trung lập không đánh trước, đánh họ là gây chiến.</li>
    <li>Không còn người canh: dựng <b>Cột vật tổ</b> (Xây → Trang trí) trong vòng ${Math.round(RLSR/20)} m quanh điểm là chiếm được. Kho trại còn gì thì về tay bạn.</li>
    <li>Tiền đồn mỗi ngày dồn sản vật vào kho (tối đa 5 ngày), hái lượm ở đó được thêm 25%.</li>
    <li>Bộ lạc sẽ kéo quân đánh lại, báo trước lúc chiều. Bạn ở gần thì đánh thật; vắng nhà thì hàng rào cọc, chòi canh, hố chông quanh cột vật tổ quyết định thắng thua. Thua thì mất kho và phải chiếm lại.</li>
    ${S.mp?`<li>Chơi chung: điểm = cột vật tổ (20) + mỗi công trình tiền đồn (5) + mỗi phút có mặt (tối đa 240, phai dần sau 3 ngày). Bộ tộc điểm cao nhất giữ đất; bên kia đạt 60% thì đang tranh chấp, sản vật còn một nửa. Muốn thách đấu: dựng cột vật tổ, rào, chòi ở đó và ở lại đất ấy.</li>`:''}</ul></details>`;
  return h;}
{const _mh=mapHtml;mapHtml=function(){const tabs=`<div class="tabs rl-tabs"><button class="tb${G.rlTab!=='realm'?' on':''}" data-a="rltab" data-t="map">🧭 Bản đồ</button><button class="tb${G.rlTab==='realm'?' on':''}" data-a="rltab" data-t="realm">🏴 Lãnh địa</button>${G.rlTab!=='realm'?`<button class="tb${G.rlLayer?' on':''}" data-a="rllayer">⛏️ Tài nguyên</button>`:''}</div>`;
  if(G.rlTab==='realm'){try{return tabs+rlHtml();}catch(e){console.warn('lãnh địa',e);}}return tabs+_mh()+(G.rlLayer?`<p class="small muted rl-leg"><span class="rl-c rich">giàu</span><span class="rl-c poor">nghèo</span> Vùng đã thăm dò. Vòng xanh: vùng giàu; vòng đỏ: vùng nghèo.</p>`:'');};}
function rlMapDraw(){const cv=$('#mapcv');if(!cv||!S||!S.rlm)return;const pr=Math.min(2,devicePixelRatio||1),W=cv.width/pr,V=mapView(),c=cv.getContext('2d');c.setTransform(pr,0,0,pr,0,0);const sx=x=>(x-V.x0)/V.span*W,sy=z=>(z-V.z0)/V.span*W,k=W/V.span,R=S.rlm;c.textAlign='center';
  if(G.rlLayer)for(const g of REG){if(!R.pro[g.id])continue;const P_=RLPS[g.id];if(!P_)continue;const x=sx(g.x),y=sy(g.z);if(x<-80||y<-80||x>W+80||y>W+80)continue;const nr=P_.r.size,np=P_.p.size;
    c.beginPath();c.arc(x,y,Math.max(10,g.r*k*0.8),0,7);c.setLineDash([5,4]);c.lineWidth=2;c.strokeStyle=nr>np?'rgba(60,150,60,.85)':np>nr?'rgba(190,60,40,.8)':'rgba(200,150,40,.8)';c.stroke();c.setLineDash([]);
    const fs=Math.round(11+Math.min(5,V.z));c.font=fs+'px system-ui';const ri=[...P_.r].map(q=>RLC[q][1]),pi=[...P_.p].map(q=>RLC[q][1]);
    ri.forEach((e,i)=>c.fillText(e,x+(i-(ri.length-1)/2)*(fs+2),y-24));c.globalAlpha=0.55;pi.forEach((e,i)=>{const px=x+(i-(pi.length-1)/2)*(fs+2),py=y+36;c.fillText(e,px,py);c.strokeStyle='#c0301a';c.lineWidth=2;c.beginPath();c.moveTo(px-fs/2,py-fs/2);c.lineTo(px+fs/2,py+2);c.stroke();});c.globalAlpha=1;}
  for(const s of RL.sites){if(!R.kn[s.id])continue;const x=sx(s.x),y=sy(s.z);if(x<-20||y<-20||x>W+20||y>W+20)continue;const st=R.s[s.id]||{};let col=st.own==='me'?'#f2c55a':st.own&&RLTRIBE[st.own]?RLTRIBE[st.own].col:'#e8e2d6';
    if(rlMpOn()&&RL.mp.ctl[s.id])col=RL.mp.ctl[s.id].g===rlGrp(MP.uid)?'#f2c55a':rlGCol(RL.mp.ctl[s.id].g);
    c.beginPath();c.arc(x,y,11,0,7);c.fillStyle='rgba(30,18,8,.75)';c.fill();c.lineWidth=3;c.strokeStyle=col;c.stroke();c.font='13px system-ui';c.fillStyle='#fff';c.fillText(s.def.ic,x,y+5);
    if(V.z>=1.6){c.font='700 10px "Be Vietnam Pro",system-ui,sans-serif';c.lineWidth=3;c.strokeStyle='rgba(255,246,226,.9)';c.strokeText(s.def.n,x,y+24);c.fillStyle='#3a2410';c.fillText(s.def.n,x,y+24);}}}
{const _md=mapDraw;mapDraw=function(){_md();try{rlMapDraw();}catch(e){}};}
{const _mt=miniTick;miniTick=function(){const t0=G.miniT;_mt();if(G.miniT===t0||!S||!S.rlm||!RL.sites.length)return;try{const cv=$('#mini');if(!cv)return;const pr=Math.min(2,devicePixelRatio||1),W=cv.clientWidth||130,Rr=900,sc=W/(Rr*2),c=cv.getContext('2d');c.setTransform(pr,0,0,pr,0,0);
  c.save();c.beginPath();c.arc(W/2,W/2,W/2-1,0,7);c.clip();c.font='12px system-ui';c.textAlign='center';c.textBaseline='middle';for(const s of RL.sites){if(!S.rlm.kn[s.id])continue;const dx=s.x-P.x,dz=s.z-P.z;if(Math.abs(dx)>Rr||Math.abs(dz)>Rr)continue;c.fillText(s.def.ic,W/2+dx*sc,W/2+dz*sc);}c.restore();}catch(e){}};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a^="rl"]');if(!b||!S||!G.on)return;const a=b.dataset.a,d=b.dataset;if(!/^rl[a-z]+$/.test(a))return;e.stopImmediatePropagation();e.preventDefault();sfx('pick');
  switch(a){case 'rltab':G.rlTab=d.t;G.rlFocus=null;break;case 'rllayer':G.rlLayer=!G.rlLayer;try{localStorage.setItem('ldtt-rllayer',G.rlLayer?'1':'0');}catch(er){}break;
    case 'rlpro':rlProspect();return;case 'rlmark':{const s=RL.byId[d.s];if(s){S.mark={x:s.x,z:s.z};uiToast('📍 Đã cắm cờ tới '+s.def.n+'. La bàn chỉ đường.','');save();}break;}
    case 'rlget':rlCollect(d.s);break;case 'rltrade':rlTrade(d.s,d.i);return;case 'rlpeace':rlPeace(d.s);return;
    case 'rltotem':uiClose();buildBegin('totem');return;}
  if(G.panel==='map')uiOpenRefresh();},true);
try{G.rlLayer=localStorage.getItem('ldtt-rllayer')==='1';}catch(e){}
(function rlCss(){const s=document.createElement('style');s.textContent=`.rl-tabs{flex-wrap:wrap}.rl-hd{display:flex;flex-direction:column;gap:2px;margin-bottom:8px}
.rl-card{border:1px solid var(--line,#5a4430);border-radius:12px;padding:8px 10px;margin:6px 0;background:rgba(0,0,0,.18)}.rl-card.mine{border-color:#c8902a;background:rgba(200,144,42,.12)}.rl-card.foc{box-shadow:0 0 0 2px #f2c55a inset}
.rl-card p{margin:3px 0}.rl-t{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px;align-items:baseline}.rl-cs{display:flex;flex-wrap:wrap;gap:4px;margin:5px 0}
.rl-c{display:inline-block;font-size:12px;padding:2px 7px;border-radius:9px;margin:1px 3px 1px 0}.rl-c.rich{background:rgba(70,160,70,.3);color:#c8f0b8}.rl-c.poor{background:rgba(190,60,40,.28);color:#ffc0b0;text-decoration:line-through}
.rl-y{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin:4px 0}.rl-good{color:#ffd27a}.rl-bad{color:#ff9a7a}.rl-tr{margin-top:4px}.rl-help summary{cursor:pointer;font-weight:700;margin:8px 0 4px}.rl-card .row{flex-wrap:wrap;gap:6px}`;document.head.appendChild(s);})();
