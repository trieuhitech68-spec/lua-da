/* ===================== ĐỜI SỐNG HOANG DÃ: NHỊP NGÀY ĐÊM · BẦY ĐÀN · THÚ SĂN MỒI · ĐÒN ĐÁNH BÁO TRƯỚC · DÁNG ĐI ·DẤU CHÂN =====================
   Thay animalsTick (life.js) bằng bộ não mới; bọc animalAttack/animalDamage/findTarget/targetInfo/actStart/worldTap/peekScan/shootArrow/sfx.
   Mọi trạng thái mới nằm trên con thú với khóa bắt đầu bằng "_" (thú không được lưu; khóa "_" cũng bị bỏ qua khi lưu).
   Tầm xa: trong 900 đơn vị nghĩ mỗi khung hình; 900–1800 (còn thấy) nghĩ mỗi 0,25 s; xa hơn (ẩn) nghĩ và đi mỗi 1,2 s. */
const L3={
  det:{rabbit:95,deer:165,gaur:120,junglefowl:100,monkey:125,boar:105},// tầm phát hiện người (đứng thẳng, đi bộ)
  prey:{wolf:['deer','rabbit','junglefowl'],tiger:['deer','boar','rabbit'],crocodile:['deer','boar','gaur','monkey','rabbit']},
  drink:{deer:1,gaur:1,boar:1,tiger:1,wolf:1,bear:1},
  wind:{snake:0.5,wolf:0.45,tiger:0.55,bear:0.7,crocodile:0.38,monkey:0.35},// thời gian thủ thế trước khi cắn (giây)
  charger:{boar:1,gaur:1},
  trk:{tiger:'hổ',wolf:'sói',deer:'nai',boar:'lợn rừng',gaur:'bò tót',bear:'gấu',crocodile:'cá sấu',rabbit:'thỏ'},
  say:{sleep:'đang ngủ',rest:'đang nằm nghỉ',drink:'đang uống nước',graze:'đang gặm cỏ',alert:'đang cảnh giác',flee:'đang bỏ chạy',eat:'đang ăn mồi',stalk:'đang rình mồi',coil:'cuộn mình phì phì',lurk:'rình dưới nước',threat:'đang đe dọa',forage:'đang kiếm ăn',bask:'đang phơi nắng',perch:'trên cây',circle:'đang vây',hunt:'đang săn'},
  isTree:/^(pine|oak|birch|dead|savannaTree)$/,T:{},C:{}};
const l3h=(x,z)=>Math.sqrt(x*x+z*z);// nhanh hơn Math.hypot
function l3phase(h){return h>=5&&h<7.5?'dawn':h>=7.5&&h<11.5?'morn':h>=11.5&&h<14.5?'noon':h>=14.5&&h<17?'aft':h>=17&&h<19.5?'dusk':'night';}
function l3toast(key,msg,gap){const T=L3.T;if(G.t-(T[key]??-1e9)<(gap||25))return;T[key]=G.t;uiToast(msg,'bad');}
function l3sfx(k,a,far){if(!k)return;if((a?a._d:0)<(far||650))sfx(k);}
function l3rel(a,x,z){let d=Math.atan2(x-a.x,z-a.z)-a.ry;d=Math.atan2(Math.sin(d),Math.cos(d));return Math.max(-0.95,Math.min(0.95,d));}
function l3go(a,tx,tz,sp){a._tx=tx;a._tz=tz;a._sp=sp;}
function l3face(a,dt,x,z){a.ry=lerpAng(a.ry,Math.atan2((x??P.x)-a.x,(z??P.z)-a.z),Math.min(1,dt*7));}
function l3set(a,act){if(a._act!==act){a._act=act;a._actT=G.t;}}
function l3limp(a){return a.hp<a._hpMax*0.4?0.7:1;}
function l3lead(h){for(const m of h.m)if(m.alive)return m;return null;}
/* ---------- khởi tạo từng con (lười: cả thú sinh thêm như bầy sói đi cướp) ---------- */
function l3init(a){a._i3=1;const R=a.rig||(a.rig={}),o=a.o;o.rotation.order='YXZ';a._rest={};
  for(const k of ['body','head','tail','tail2','legFL','legFR','legBL','legBR']){const p=R[k];if(p&&p.rotation)a._rest[k]={x:p.rotation.x,y:p.rotation.y,z:p.rotation.z,sx:p.scale.x,sy:p.scale.y};}
  a._legH=R.legFL&&R.legFL.position?Math.max(2,R.legFL.position.y):a.r*0.7;a._zB=R.legBL&&R.legBL.position?R.legBL.position.z:-a.r*0.6;
  a._hgt=(o.userData&&o.userData.h)||a.r*1.3;a._hpMax=(ANIMALS[a.kind]||{}).hp||a.hp||1;a._d=1e9;
  Object.assign(a,{_gp:Math.random(),_act:'idle',_actT:0,_dT:Math.random()*4,_sus:0,_hunger:0.2+Math.random()*0.9,_slot:Math.random()*6.283,_slotR:16+Math.random()*30,_lag:0.3+Math.random()*1.5,
    _flk:Math.random()*5,_tw:Math.random()*4,_side:Math.random()<0.5?-1:1,_tx:a.x,_tz:a.z,_sp:0,_lod:Math.random()*0.25,_gz:Math.random()*4,_pant:0,_climbY:0});
  a._pt={lie:0,crouch:0,rear:0,head:0,hy:0,tail:0,coil:0};a._p=Object.assign({},a._pt);
  l3herdJoin(a);if(a.kind==='crocodile')l3crocHome(a);}
function l3herdJoin(a){const D=ANIMALS[a.kind]||{},n=D.herd||D.pack;a._h=null;if(!n)return;const H=G._herds||(G._herds=[]),cap=n*2;let best=null,bd=170;
  for(const h of H){if(h.kind!==a.kind||h.m.length>=cap)continue;const l=l3lead(h);if(!l)continue;const d=l3h(l.x-a.x,l.z-a.z);if(d<bd){bd=d;best=h;}}
  if(!best){best={kind:a.kind,m:[],water:undefined,alertT:0};H.push(best);}best.m.push(a);a._h=best;}
function l3crocHome(a){let best=null;for(let r=0;r<=260&&!best;r+=26)for(let k=0;k<(r?12:1);k++){const an=k/12*6.283,x=a.home.x+Math.cos(an)*r,z=a.home.z+Math.sin(an)*r;if(wdAt(x,z)>4){best={x,z};break;}}
  a._wh=best;if(best){a.home={x:best.x,z:best.z};a.x=best.x;a.z=best.z;a._act='lurk';}}
// mép nước gần nhất (đứng trên cạn, nước ngay trước mặt) — tính một lần cho mỗi đàn/con
function l3shore(x,z,maxR){for(let r=50;r<=maxR;r+=45)for(let k=0;k<12;k++){const an=k/12*6.283+r*0.013,c=Math.cos(an),s=Math.sin(an);let px=x+c*r,pz=z+s*r;if(wdAt(px,pz)<0.8)continue;
    for(let j=0;j<16;j++){px-=c*7;pz-=s*7;if(wdAt(px,pz)<0.25)return {x:px,z:pz,wx:px+c*18,wz:pz+s*18};}}return null;}
function l3water(a){const o=a._h||a;if(o.water===undefined)o.water=l3shore(a.home.x,a.home.z,900);return o.water;}
function l3tree(x,z,r){let best=null,bd=r;for(const i of near(x,z,r)){const q=RES[i];if(q.st!==0||!L3.isTree.test(q.t))continue;const d=l3h(q.x-x,q.z-z);if(d<bd){bd=d;best=q;}}return best;}
/* ---------- vòng lặp chính ---------- */
function animalsTick3(dt){const t0=performance.now(),C=L3.C;C.h=S.hour;C.ph=l3phase(S.hour);C.night=isNight();C.cozy=S.mode==='cozy';C.winter=seasonIdx()===3;
  C.sK=(G.sneak?0.45:G.running?1.35:1)*((P.speed||0)<5?0.8:1);C.run=!!G.running;C.vis=Math.min(1800,G.treeD||1800);
  const hu=C.hunters||(C.hunters=[]);hu.length=0;for(const a of G.animals)if(a.alive&&a._hph)hu.push(a);
  for(const a of G.animals){if(!a._i3)l3init(a);const D=ANIMALS[a.kind];if(!D)continue;const d=l3h(a.x-P.x,a.z-P.z);a._d=d;
    if(!a.alive){l3dead(a,dt,d,D);continue;}
    if(D.winterSleep&&C.winter){a.o.visible=false;continue;}
    const vis=d<C.vis;a.o.visible=vis;a._lod+=dt;const per=d<900?0:vis?0.25:1.2;let ddt=0;
    if(a._lod>=per){ddt=Math.min(a._lod,1.5);a._lod=0;l3think(a,D,ddt,d);}
    if(vis){l3move(a,D,dt);l3anim(a,D,dt,d);if(d<900)l3track(a,dt);}else if(ddt)l3move(a,D,ddt);}
  l3trackTick();G._l3ms=(G._l3ms||0)*0.95+(performance.now()-t0)*0.05;}
animalsTick=animalsTick3;
/* ---------- bộ não ---------- */
function l3think(a,D,dt,d){const pt=a._pt;pt.lie=pt.crouch=pt.rear=pt.head=pt.hy=pt.tail=pt.coil=0;a._turnK=5;a._paw=0;
  if(a.calm&&a.calm>G.t){a.state='wander';l3set(a,'eat');pt.head=0.8;l3go(a,a.x,a.z,0);return;}
  const k=a.kind;if(k==='snake')return l3snake(a,D,dt,d);if(k==='crocodile'&&a._wh)return l3croc(a,D,dt,d);
  if(a._panic>G.t){a.angry=false;a._atk=a._chg=null;a._flee={x:P.x,z:P.z,t:a._panic,k:1};l3fleeRun(a,D,dt);return;}
  if(l3hostile(a,D,d)){l3engage(a,D,dt,d);return;}
  a._atk=null;a._chg=null;a._thr=0;if(d>500)a._stk=0;if(a.state==='chase')a.state='wander';
  if(D.aggro==='never'||k==='gaur'||k==='boar'){if(l3preyReact(a,D,dt,d))return;}
  if(k==='wolf'||k==='tiger'||k==='bear')return l3pred(a,D,dt,d);
  if(k==='monkey')return l3monkey(a,D,dt,d);
  l3graze(a,D,dt,d);}
function l3hostile(a,D,d){const C=L3.C,sK=C.sK;if(a._panic>G.t)return false;
  if(a.angry){if(d>600){a.angry=false;return false;}return true;}
  if(a._eat&&d<(a.kind==='tiger'?130:80)*sK&&!C.cozy){a.angry=true;if(a.kind==='tiger'){l3sfx('roar',a);l3toast('growl','🐯 Hổ đang ăn mồi gầm lên giữ mồi: tránh xa!');}return true;}
  if(C.cozy){if(D.aggro==='territory'&&d<Math.min(70,D.near||70)*sK)return true;if(D.aggro==='stalk'&&C.night&&d<110*sK)return true;return false;}
  switch(D.aggro){
    case 'night':return a._act==='sleep'?d<60*sK:(C.night||C.winter)&&d<280*sK;
    case 'stalk':if(a._act==='sleep'&&!(a._wake>G.t)){if(d<110*sK){a._wake=G.t+60;l3sfx('growl',a);return true;}return false;}return d<((C.night||C.ph==='dusk'||C.ph==='dawn')?380:230)*sK;
    case 'territory':return d<(D.near||170)*sK*(a._act==='sleep'?0.5:1);
    case 'defend':if(G.sneak)return false;if(a.kind==='boar')return d<45;if(a.kind==='gaur'&&a._h&&l3lead(a._h)===a)return d<50;return false;}
  return false;}
/* ---------- đánh người chơi: thủ thế → vồ/cắn → hồi; con húc thì cào đất → lao thẳng ---------- */
function l3engage(a,D,dt,d){const pt=a._pt,k=a.kind;a.state='chase';l3set(a,'engage');
  if(k==='wolf'&&a._h){const h=a._h;if(!h.tok||!h.tok.alive||h.tok.state!=='chase'||h.tok._d>350){if(a!==h.last||G.t-(h.lastT||0)>1.6)h.tok=a;}
    if(h.tok!==a&&!a._atk){const i=h.m.indexOf(a),an=G.t*0.55+i*2.1,R=72+i*6;l3go(a,P.x+Math.sin(an)*R,P.z+Math.cos(an)*R,D.spd*0.75);pt.crouch=0.45;pt.head=0.15;l3set(a,'circle');
      if(G.t-(a._snarl||0)>3+i){a._snarl=G.t;l3sfx('growl',a,300);}return;}}
  if(L3.charger[k])return l3charge(a,D,dt,d);
  if(k==='bear'&&!a.angry){a._thr=(a._thr||0)+dt;pt.rear=1;pt.head=-0.3;l3face(a,dt);l3go(a,a.x,a.z,0);l3set(a,'threat');
    if(a._thr<=dt*1.01){l3sfx('roar',a);l3toast('bear','🐻 Gấu đứng dậy gầm gừ: lùi xa ra!');}
    if(d>(D.near||170)*1.25){a._thr=0;a.state='wander';return;}if(a._thr>1.8&&d<145){a.angry=true;a._thr=0;}return;}
  if(k==='tiger'&&!a.angry){if(!a._stk){a._stk=1;l3sfx('growl',a,900);l3toast('growl','🐯 Có tiếng gầm gừ gần đây…');}
    if(d>140){pt.crouch=1;pt.head=0.25;pt.tail=-0.3;l3set(a,'stalk');l3go(a,P.x,P.z,D.spd*0.3);return;}a.angry=true;l3sfx('roar',a);}
  l3melee(a,D,dt,d,null);}
function l3melee(a,D,dt,d,spd){const pt=a._pt,k=a.kind,C=L3.C,A=a._atk,reach=a.r+18,lunge=k==='tiger'?30:k==='crocodile'?16:k==='snake'?20:10;
  if(!A){if(d<reach+lunge*0.6){a._atk={ph:'wind',t:(L3.wind[k]||0.45)*(C.cozy?1.4:1)};l3tele(a);l3go(a,a.x,a.z,0);}
    else{l3go(a,P.x,P.z,(spd||D.spd*(C.cozy?0.8:1)*(k==='tiger'?1.12:1))*l3limp(a));pt.head=k==='snake'?-0.4:-0.05;pt.crouch=k==='tiger'?0.3:0;}return;}
  A.t-=dt;l3face(a,dt);l3go(a,a.x,a.z,0);
  if(A.ph==='wind'){// thủ thế: hạ thấp người, ngóc đầu, (gấu đứng dậy, rắn rụt cổ)
    pt.crouch=k==='bear'||k==='snake'?0:0.75;pt.rear=k==='bear'?0.9:k==='crocodile'?0.15:0;pt.head=k==='snake'?-1.1:k==='crocodile'?-0.55:-0.35;pt.coil=1;
    if(A.t<=0){A.ph='strike';A.t=0.22;a._lg={t:0.15,v:Math.max(0,Math.min(lunge+8,d-a.r-4))/0.15};
      if(d<reach+lunge)animalAttack(a);else{G._l3miss=(G._l3miss||0)+1;a._miss=(a._miss||0)+1;if(d<400)uiFloat('Né được!',P.x,P.y+44,P.z,'#9fe08a');}}}
  else if(A.ph==='strike'){pt.rear=k==='tiger'?0.4:k==='bear'?0.3:0.1;pt.head=k==='snake'?0.2:-0.1;if(A.t<=0){A.ph='rec';A.t=(0.75+Math.random()*0.4)*(C.cozy?1.4:1);}}
  else{pt.head=0.1;l3go(a,a.x-Math.sin(a.ry)*30,a.z-Math.cos(a.ry)*30,D.spd*0.18);if(A.t<=0){a._atk=null;const h=a._h;if(h&&h.tok===a){h.tok=null;h.last=a;h.lastT=G.t;}}}}
function l3charge(a,D,dt,d){const pt=a._pt,k=a.kind,C=L3.C;let Cg=a._chg;
  if(!Cg){if(d<a.r+150){Cg=a._chg={ph:'paw',t:(k==='gaur'?1.0:0.8)*(C.cozy?1.5:1)};l3sfx('snort',a);l3tele(a);
      l3toast(k,k==='gaur'?'🐂 Bò tót cào đất, hạ sừng: sắp húc! Né sang bên!':'🐗 Lợn rừng cào đất khịt mũi: sắp húc! Né sang bên!',12);}
    else{l3go(a,P.x,P.z,D.spd*0.75*l3limp(a));return;}}
  Cg.t-=dt;
  if(Cg.ph==='paw'){l3face(a,dt);l3go(a,a.x,a.z,0);pt.head=0.6;pt.crouch=0.25;a._paw=1;if(!a.angry&&d>125){a._chg=null;a.state='wander';return;}
    if(Cg.t<=0){Cg.ph='run';Cg.t=1.5;Cg.dir=Math.atan2(P.x-a.x,P.z-a.z);Cg.hit=0;a.angry=true;}}
  else if(Cg.ph==='run'){Cg.dir=lerpAng(Cg.dir,Math.atan2(P.x-a.x,P.z-a.z),Math.min(1,dt*0.9));a.ry=Cg.dir;a._turnK=40;pt.head=0.5;
    l3go(a,a.x+Math.sin(Cg.dir)*200,a.z+Math.cos(Cg.dir)*200,D.spd*1.25*l3limp(a));
    if(!Cg.hit&&d<a.r+16){Cg.hit=1;animalAttack(a);}
    const ahead=Math.sin(Cg.dir)*(P.x-a.x)+Math.cos(Cg.dir)*(P.z-a.z);
    if(Cg.t<=0||(ahead<0&&d>a.r+28)){if(!Cg.hit){G._l3miss=(G._l3miss||0)+1;a._miss=(a._miss||0)+1;if(d<400)uiFloat('Né được!',P.x,P.y+44,P.z,'#9fe08a');}Cg.ph='rec';Cg.t=0.9;}}
  else{l3go(a,a.x,a.z,0);l3face(a,dt*0.6);pt.head=0.2;if(Cg.t<=0)a._chg=null;}}
// báo hiệu sắp tấn công: dấu ❗ trên đầu + tiếng
function l3tele(a){if(a._d<420)uiFloat('❗',a.x,a.y+a._hgt+16,a.z,'#ffcf4a');l3sfx({snake:'hiss',boar:'snort',gaur:'snort',bear:'roar',tiger:'growl',wolf:'growl',crocodile:'hiss'}[a.kind]||'growl',a,500);}
/* ---------- con mồi: cảnh giác, báo động cả đàn, bỏ chạy ---------- */
function l3alarm(a,x,z,dur,k){const list=a._h?a._h.m:[a];let any=0;for(const m of list){if(!m.alive||(m!==a&&m._d>2600)||(m._flee&&m._flee.t>G.t+1))continue;if(L3.charger[m.kind]&&m.angry)continue;
    m._flee={x,z,t:G.t+dur*(0.85+Math.random()*0.3),k:k||1};m._sus=0;l3set(m,'flee');m.state='flee';any=1;}
  if(any)l3sfx(a.kind==='monkey'?'screech':a.kind==='junglefowl'?'cluck':a.kind==='rabbit'?null:'snort',a);}
function l3fleeRun(a,D,dt){const F=a._flee,pt=a._pt;if(!F)return;let an=Math.atan2(a.x-F.x,a.z-F.z);const l=a._h&&l3lead(a._h);if(l&&l!==a&&l._flee&&l._flee.t>G.t)an=lerpAng(an,l.ry,0.45);
  if(a.kind==='rabbit'||a.kind==='junglefowl')an+=Math.sin(G.t*5+a.ph)*0.7;// chạy zích zắc
  a._fs=(a._fs||0)+dt;const tired=a._fs>6?0.72:1;l3set(a,'flee');a.state='flee';pt.head=-0.1;pt.tail=0.9;
  if(a.kind==='monkey'){if((!a._tree||l3h(a._tree.x-a.x,a._tree.z-a.z)>260)&&G.t>(a._treeT||0)){a._treeT=G.t+5;a._tree=l3tree(a.x,a.z,220);}const q=a._tree;
    if(q){const tx=q.x+Math.sin(a._slot)*5,tz=q.z+Math.cos(a._slot)*5;if(l3h(tx-a.x,tz-a.z)<8){a._up=1;l3go(a,a.x,a.z,0);l3set(a,'perch');a._perchT=G.t+12;return;}l3go(a,tx,tz,D.spd);return;}}
  l3go(a,a.x+Math.sin(an)*140,a.z+Math.cos(an)*140,D.spd*(F.k||1)*tired*l3limp(a));}
function l3preyReact(a,D,dt,d){const C=L3.C,pt=a._pt,h=a._h;
  if(a._flee&&a._flee.t>G.t){l3fleeRun(a,D,dt);return true;}
  if(a._flee){a._flee=null;a._fs=0;a._sus=0.6;a.state='wander';}
  if(a._act==='perch'&&a._perchT>G.t)return false;
  for(const p of C.hunters){if(p===a)continue;const dd=l3h(p.x-a.x,p.z-a.z),R=(L3.det[a.kind]||110)*(p._hph==='rush'?1.6:p._hph==='stalk'?0.45:p._hph==='eat'?0.7:1);if(dd<R){l3alarm(a,p.x,p.z,7);if(a._flee){l3fleeRun(a,D,dt);return true;}}}
  const R0=(L3.det[a.kind]||100)*C.sK*(a._act==='sleep'?0.5:1)*(C.night?0.8:1)*(C.cozy?0.8:1);
  if(d<R0){if(L3.charger[a.kind])l3alarm(a,P.x,P.z,4,0.55);else l3alarm(a,P.x,P.z,6+Math.random()*3);if(a._flee)l3fleeRun(a,D,dt);return !!a._flee;}
  if(d<R0*2.1&&a._act!=='sleep'){a._sus+=dt*(0.3+(C.run?1.3:0)+((P.speed||0)>8?0.4:0))*(G.sneak?0.35:1)*(1+(R0*2.1-d)/R0);
    if(a._sus>1.6){l3alarm(a,P.x,P.z,6);if(a._flee)l3fleeRun(a,D,dt);return true;}
    if(a._sus>0.25){l3set(a,'alert');a.state='wander';pt.head=-0.35;pt.hy=l3rel(a,P.x,P.z);pt.tail=0.7;if(a.kind==='rabbit')pt.rear=0.6;l3go(a,a.x,a.z,0);if(h){h.alertT=G.t+1.5;h.ax=P.x;h.az=P.z;}return true;}}
  else a._sus=Math.max(0,a._sus-dt*0.25);
  if(h&&h.alertT>G.t&&a._act!=='sleep'&&a._act!=='rest'){l3set(a,'alert');pt.head=-0.3;pt.hy=l3rel(a,h.ax,h.az);pt.tail=0.5;l3go(a,a.x,a.z,0);return true;}
  return false;}
/* ---------- ăn cỏ theo giờ: sáng/chiều tà ra sông uống, trưa nằm nghỉ, đêm ngủ ---------- */
function l3plan(a,D){const C=L3.C,k=a.kind,ph=C.ph,dk=S.day+':'+ph;
  if(L3.drink[k]&&(ph==='dawn'||ph==='dusk')&&a._drank!==dk){a._drank=dk;const w=l3water(a);if(w){l3set(a,'godrink');a._tx=w.x;a._tz=w.z;a._dT=70;return;}}
  const nocturnal=k==='tiger'||k==='wolf';
  if(ph==='night'&&!nocturnal&&!(k==='deer'&&Math.random()<0.3)){l3set(a,'sleep');a._tx=a.x;a._tz=a.z;a._dT=30+Math.random()*40;return;}
  if(ph==='noon'&&Math.random()<(k==='junglefowl'?0.4:0.7)){l3set(a,'rest');a._tx=a.x;a._tz=a.z;a._dT=25+Math.random()*30;return;}
  const an=Math.random()*6.283,rr=Math.random()*(k==='rabbit'||k==='junglefowl'?110:210);a._tx=a.home.x+Math.cos(an)*rr;a._tz=a.home.z+Math.sin(an)*rr;l3set(a,'walk');a._dT=45;}
function l3grazeCycle(a,d){const pt=a._pt;a._gz-=L3.C.dtk;if(a._gz<=0){a._gU=!a._gU;a._gz=a._gU?1+Math.random()*1.8:3+Math.random()*6;}
  if(a._gU){pt.head=-0.25;pt.hy=d<450?l3rel(a,P.x,P.z):Math.sin(G.t*0.7+a.ph)*0.7;}
  else{pt.head=a.kind==='junglefowl'?0.5+0.55*Math.max(0,Math.sin(G.t*9+a.ph)):a.kind==='boar'||a.kind==='bear'?0.8+Math.sin(G.t*7+a.ph)*0.12:0.9+Math.sin(G.t*5+a.ph)*0.05;pt.hy=Math.sin(G.t*0.3+a.ph)*0.2;}}
function l3graze(a,D,dt,d){const C=L3.C,pt=a._pt,h=a._h,l=h?l3lead(h):a;C.dtk=dt;
  if(l&&l!==a)return l3follow(a,D,dt,d,l);
  a._dT-=dt;if(a._dT<=0)l3plan(a,D);a.state='wander';const dl=l3h(a._tx-a.x,a._tz-a.z),walk=D.spd*(a.kind==='rabbit'?0.18:0.24);
  switch(a._act){
    case 'godrink':{if(dl<10){l3set(a,'drink');a._dT=7+Math.random()*7;l3go(a,a.x,a.z,0);}else l3go(a,a._tx,a._tz,walk*1.15);break;}
    case 'drink':{const w=l3water(a);if(w)l3face(a,dt,w.wx,w.wz);pt.head=1.05;l3go(a,a.x,a.z,0);if(a._dT<=0)l3plan(a,D);break;}
    case 'sleep':case 'rest':pt.lie=a.kind==='rabbit'||a.kind==='junglefowl'?0.6:1;pt.head=a._act==='sleep'?0.55:0.15;pt.hy=a._act==='sleep'?0.55*a._side:Math.sin(G.t*0.2+a.ph)*0.5;l3go(a,a.x,a.z,0);break;
    case 'walk':{if(dl<10){l3set(a,'graze');a._dT=10+Math.random()*16;}else{l3go(a,a._tx,a._tz,walk);pt.head=0.15;}break;}
    default:{l3set(a,a.kind==='boar'||a.kind==='bear'||a.kind==='junglefowl'?'forage':'graze');l3grazeCycle(a,d);
      if(!a._gU&&Math.random()<dt*0.25){a._tx=a.x+(Math.random()-0.5)*40;a._tz=a.z+(Math.random()-0.5)*40;}l3go(a,a._tx,a._tz,a._gU?0:7);}}}
function l3follow(a,D,dt,d,l){const pt=a._pt,la=l._act,an=a._slot+l.ry,ox=Math.sin(an)*a._slotR,oz=Math.cos(an)*a._slotR;a.state='wander';
  const lagOK=G.t-(l._actT||0)>a._lag;
  if(la==='drink'||(la==='godrink'&&l3h(l._tx-l.x,l._tz-l.z)<40)){// xếp hàng dọc mép nước hai bên con đầu đàn
    const side=(a._slot>3.14?1:-1)*(10+a._slotR*0.7),tx=l._tx+Math.cos(l.ry)*side,tz=l._tz-Math.sin(l.ry)*side,dd=l3h(tx-a.x,tz-a.z);
    if(dd<12&&la==='drink'&&lagOK){l3set(a,'drink');l3face(a,dt,l.x+Math.sin(l.ry)*40,l.z+Math.cos(l.ry)*40);pt.head=1.05;l3go(a,a.x,a.z,0);}else{l3set(a,'walk');l3go(a,tx,tz,D.spd*0.3);}return;}
  const tx=l.x+ox,tz=l.z+oz,dd=l3h(tx-a.x,tz-a.z);
  if(la==='walk'||la==='godrink'){l3set(a,'walk');l3go(a,tx,tz,dd>45?D.spd*0.45:Math.max(6,l.spd*1.1));pt.head=0.15;return;}
  if(la==='sleep'||la==='rest'){if(dd>14){l3set(a,'walk');l3go(a,tx,tz,D.spd*0.25);return;}if(lagOK){l3set(a,la);pt.lie=a.kind==='junglefowl'?0.6:1;pt.head=la==='sleep'?0.55:0.15;pt.hy=la==='sleep'?0.55*a._side:0;}l3go(a,a.x,a.z,0);return;}
  if(dd>70){l3set(a,'walk');l3go(a,tx,tz,D.spd*0.3);return;}
  L3.C.dtk=dt;l3set(a,a.kind==='junglefowl'?'forage':'graze');l3grazeCycle(a,d);if(!a._gU&&Math.random()<dt*0.25){a._gx=a.x+(Math.random()-0.5)*30;a._gzz=a.z+(Math.random()-0.5)*30;}l3go(a,a._gx??a.x,a._gzz??a.z,a._gU?0:6);}
/* ---------- khỉ: bám quanh cây, trèo lên khi sợ, nghỉ trưa và ngủ đêm trên cây ---------- */
function l3monkey(a,D,dt,d){const C=L3.C,pt=a._pt;a.state='wander';
  if((!a._tree&&G.t>(a._treeT||0))||a._dT<=0){a._dT=14+Math.random()*16;a._treeT=G.t+20;const c=a._h?l3lead(a._h)||a:a;a._tree=l3tree(c===a?a.home.x:c.x,c===a?a.home.z:c.z,260)||a._tree;a._up=(C.ph==='noon'||C.ph==='night')?1:Math.random()<0.25?1:0;}
  a._dT-=dt;const q=a._tree;if(!q){l3graze(a,D,dt,d);return;}
  const tx=q.x+Math.sin(a._slot)*(a._up?5:12),tz=q.z+Math.cos(a._slot)*(a._up?5:12),dd=l3h(tx-a.x,tz-a.z);
  if(dd>8){a._up2=0;l3set(a,'walk');l3go(a,tx,tz,D.spd*0.3);return;}
  l3go(a,a.x,a.z,0);l3face(a,dt,q.x,q.z);if(a._up){l3set(a,'perch');a._perchT=G.t+5;}else{l3set(a,'forage');pt.head=0.4+Math.sin(G.t*3+a.ph)*0.2;}}
/* ---------- thú săn: ngủ ngày (hổ, sói), đi săn đêm, vây/rình rồi lao, hạ mồi để lại xác ---------- */
function l3pred(a,D,dt,d){const C=L3.C,k=a.kind,pt=a._pt,h=a._h,l=h?l3lead(h):a;a.state='wander';
  const dusk=C.ph==='dusk'||C.ph==='dawn',active=a._wake>G.t||(k==='wolf'?C.night||dusk||C.winter:k==='tiger'?C.night||dusk||C.h>=16:!C.night);
  a._hunger+=dt/(DAY_SEC*0.55);
  if(a._eat){const c=a._eat.c;if(!c._carc||G.t>a._eat.t){a._eat=null;a._hph=null;}
    else{const tx=c.x+Math.sin(a._slot)*(a.r+c.r*0.5),tz=c.z+Math.cos(a._slot)*(a.r+c.r*0.5);if(l3h(tx-a.x,tz-a.z)>6){l3go(a,tx,tz,D.spd*0.3);return;}
      l3go(a,a.x,a.z,0);l3face(a,dt,c.x,c.z);pt.head=0.85+Math.sin(G.t*6+a.ph)*0.15;pt.crouch=0.55;l3set(a,'eat');a._hph='eat';
      if(G.t-(a._bite||0)>9){a._bite=G.t;if((c._carc.drop.meat||0)>1)c._carc.drop.meat--;}return;}}
  if(k!=='bear'&&active&&(a._hunger>=1||(h?h.prey:a.prey))&&l3hunt(a,D,dt))return;
  a._hph=null;
  if(k==='bear')return l3graze(a,D,dt,d);
  if(!active){const dh=l3h(a.home.x+Math.sin(a._slot)*a._slotR*0.6-a.x,a.home.z+Math.cos(a._slot)*a._slotR*0.6-a.z);
    if(dh>20){l3set(a,'walk');l3go(a,a.home.x+Math.sin(a._slot)*a._slotR*0.6,a.home.z+Math.cos(a._slot)*a._slotR*0.6,D.spd*0.25);return;}
    l3set(a,'sleep');pt.lie=1;pt.head=0.6;pt.hy=0.6*a._side;l3go(a,a.x,a.z,0);return;}
  if(k==='wolf'&&h&&l===a&&C.ph!=='morn'&&h.howl!==S.day&&Math.random()<dt*0.04){h.howl=S.day;l3sfx('howl',a,1500);if(a._d<1500)l3toast('howl','🐺 Tiếng sói tru vọng lại từ xa…',240);}
  if(l!==a){const an=a._slot+l.ry,tx=l.x+Math.sin(an)*a._slotR,tz=l.z+Math.cos(an)*a._slotR,dd=l3h(tx-a.x,tz-a.z);l3set(a,'prowl');l3go(a,tx,tz,dd>50?D.spd*0.5:Math.max(5,l.spd*1.05));pt.head=0.1;return;}
  a._dT-=dt;if(a._act==='drink'){const w=l3water(a);if(w)l3face(a,dt,w.wx,w.wz);pt.head=1;l3go(a,a.x,a.z,0);if(a._dT<=0)a._act='prowl';return;}
  if(a._act==='godrink'){if(l3h(a._tx-a.x,a._tz-a.z)<10){l3set(a,'drink');a._dT=8;}else l3go(a,a._tx,a._tz,D.spd*0.3);return;}
  if(a._dT<=0||l3h(a._tx-a.x,a._tz-a.z)<12){const dk=S.day+':'+C.ph;if(C.ph==='dusk'&&a._drank!==dk){a._drank=dk;const w=l3water(a);if(w){l3set(a,'godrink');a._tx=w.x;a._tz=w.z;a._dT=60;return;}}
    const an=Math.random()*6.283,rr=Math.random()*480;a._tx=a.home.x+Math.cos(an)*rr;a._tz=a.home.z+Math.sin(an)*rr;a._dT=25;}
  l3set(a,'prowl');l3go(a,a._tx,a._tz,D.spd*(k==='wolf'?0.4:0.26));pt.head=0.12;}
function l3findPrey(a){const L=L3.prey[a.kind];if(!L)return null;let best=null,bd=a.kind==='crocodile'?120:700;
  for(const p of G.animals){if(!p.alive||!L.includes(p.kind)||p._d>2600)continue;const d=l3h(p.x-a.x,p.z-a.z)*(p.kind==='rabbit'||p.kind==='junglefowl'?1.3:1);if(d<bd&&wdAt(p.x,p.z)<1){bd=d;best=p;}}return best;}
function l3hunt(a,D,dt){const h=a._h,l=h?l3lead(h):a,o=h||a,pt=a._pt;
  if(l===a&&(!o.prey||!o.prey.alive||G.t>o.huntEnd)){if(o.prey&&o.prey.alive){o.prey=null;a._scanT=G.t+20;}o.prey=null;
    if(G.t>(a._scanT||0)){a._scanT=G.t+1.5;const p=l3findPrey(a);if(p){o.prey=p;o.huntEnd=G.t+40;o.hph='stalk';o.hpt=G.t;}}}
  const p=o.prey;if(!p||!p.alive){a._hph=null;return false;}
  const dd=l3h(p.x-a.x,p.z-a.z),lead=Math.min(0.5,dd/400);const px=p.x+(p._vx||0)*lead,pz=p.z+(p._vz||0)*lead;a.state='hunt';
  if(dd<a.r+p.r+6&&o.hph!=='stalk'){l3kill(a,p);return true;}
  if(a.kind==='tiger'){if(o.hph==='stalk'){pt.crouch=1;pt.head=0.25;pt.tail=-0.3;l3set(a,'stalk');a._hph='stalk';l3go(a,p.x,p.z,D.spd*0.3);if(dd<150||p._flee){o.hph='rush';o.hpt=G.t;l3sfx('roar',a,900);}}
    else{l3set(a,'hunt');a._hph='rush';l3go(a,px,pz,D.spd*1.12);pt.head=-0.05;if(G.t-o.hpt>6){o.prey=null;o.hph=null;a._scanT=G.t+25;}}return true;}
  // sói: rình theo bầy → vây quanh → đồng loạt lao vào
  if(o.hph==='stalk'){pt.crouch=0.45;pt.head=0.2;l3set(a,'stalk');a._hph='stalk';const an=a._slot,tx=p.x+Math.sin(an)*90,tz=p.z+Math.cos(an)*90;l3go(a,tx,tz,D.spd*0.45);if(l===a&&(dd<230||p._flee)){o.hph='circle';o.hpt=G.t;}return true;}
  if(o.hph==='circle'){const i=h?h.m.indexOf(a):0,an=G.t*0.7+i*(6.283/Math.max(1,h?h.m.length:1));l3go(a,p.x+Math.sin(an)*70,p.z+Math.cos(an)*70,D.spd*0.85);pt.crouch=0.3;l3set(a,'circle');a._hph='circle';if(l===a&&G.t-o.hpt>3){o.hph='rush';o.hpt=G.t;}return true;}
  l3set(a,'hunt');a._hph='rush';l3go(a,px,pz,D.spd*1.05);if(l===a&&G.t-o.hpt>14){o.prey=null;o.hph=null;a._scanT=G.t+25;}return true;}
function l3kill(pred,prey){const D=ANIMALS[prey.kind];prey.alive=false;prey.hp=0;prey.dieT=0.001;prey._side=Math.random()<0.5?-1:1;prey.state='dead';prey._flee=null;prey.angry=false;prey._atk=prey._chg=null;prey.spd=0;
  prey._carc={drop:Object.assign({},D.drop),t:G.t,by:pred.kind};prey.back=TNOW()+1+Math.random();prey.o.visible=prey._d<L3.C.vis;
  const h=pred._h,list=h?h.m.filter(m=>m.alive&&l3h(m.x-prey.x,m.z-prey.z)<450):[pred];for(const m of list){m._eat={c:prey,t:G.t+28+Math.random()*14};m._hunger=0;m._prey=null;m._hph='eat';m.state='wander';}
  if(h){h.prey=null;h.hph=null;}else pred.prey=null;
  if(prey._h)l3alarm(prey,prey.x,prey.z,8);G._l3kills=(G._l3kills||0)+1;
  if(prey._d<650){l3sfx(pred.kind==='crocodile'?'splash':'growl',prey);l3toast('kill',`⚠ ${pred.n} vừa hạ một con ${prey.n.toLowerCase()} gần đây.`,20);}}
/* ---------- cá sấu: nằm im dưới nước chỉ lộ mắt, phục kích ở mép bờ, trưa bò lên bãi phơi nắng ---------- */
function l3croc(a,D,dt,d){const C=L3.C,pt=a._pt,w=a._wh,inW=wdAt(a.x,a.z)>1.5;a.state='wander';
  if(a._eat){const c=a._eat.c;if(!c._carc||G.t>a._eat.t)a._eat=null;else{const dd=l3h(c.x-a.x,c.z-a.z);if(dd>a.r+4){l3go(a,c.x,c.z,D.spd*0.4);return;}l3go(a,a.x,a.z,0);l3face(a,dt,c.x,c.z);pt.head=0.4+Math.sin(G.t*5)*0.2;l3set(a,'eat');return;}}
  const pWet=wdAt(P.x,P.z)>0.15||l3h(P.x-w.x,P.z-w.z)<150,leash=l3h(a.x-w.x,a.z-w.z);
  if(a._prey){const p=a._prey;if(!p.alive||G.t>a._ambT+3.5){a._prey=null;}else{const dd=l3h(p.x-a.x,p.z-a.z);l3set(a,'ambush');l3go(a,p.x,p.z,D.spd*2.1);pt.head=-0.4;if(dd<a.r+p.r+6)l3kill(a,p);return;}}
  const hostile=!C.cozy?(a.angry&&d<260)||(d<90*C.sK&&pWet&&(a._act==='lurk'||a._act==='bask')):(a.angry&&d<160)||d<45;
  if(hostile&&leash<200){if(a._act==='lurk'||a._act==='bask'){a._ambT=G.t;l3sfx('splash',a);if(!a.angry&&d<300)l3toast('croc','🐊 Cá sấu lao lên từ mặt nước!',15);a.angry=true;}
    l3set(a,'engage');a.state='chase';l3melee(a,D,dt,d,G.t-(a._ambT||0)<1.2?D.spd*2.1:D.spd);return;}
  if(a.angry&&(leash>=200||d>260))a.angry=false;a._atk=null;
  if(G.t>(a._scanT||0)){a._scanT=G.t+1;for(const p of G.animals){if(!p.alive||!L3.prey.crocodile.includes(p.kind)||p._d>2600)continue;const dd=l3h(p.x-a.x,p.z-a.z);if(dd<110&&(p._act==='drink'||wdAt(p.x,p.z)>0.1)&&a._hunger>0.5){a._prey=p;a._ambT=G.t;l3sfx('splash',a);return;}}}
  a._hunger+=dt/(DAY_SEC*0.8);
  if(!C.night&&(C.ph==='noon'||(C.ph==='aft'&&C.h<15.5))&&d>170){if(a._bank===undefined)a._bank=l3shore(w.x,w.z,220);const b=a._bank;
    if(b){if(l3h(b.x-a.x,b.z-a.z)>8){l3set(a,'crawl');l3go(a,b.x,b.z,D.spd*0.3);}else{l3set(a,'bask');pt.lie=0.7;pt.head=-0.15;l3go(a,a.x,a.z,0);}return;}}
  if(!inW){l3set(a,'crawl');l3go(a,w.x,w.z,D.spd*(d<200?0.9:0.35));return;}
  l3set(a,'lurk');pt.lie=1;const an=G.t*0.03+a.ph;l3go(a,w.x+Math.sin(an)*35,w.z+Math.cos(an*1.3)*35,9);}
/* ---------- rắn: nằm khoanh trong cỏ; người tới gần thì cuộn mình, ngóc đầu phì phì rồi mới mổ ---------- */
function l3snake(a,D,dt,d){const C=L3.C,pt=a._pt;a.state='wander';
  if(a.angry){if(d>300){a.angry=false;}else{a.state='chase';l3set(a,'engage');pt.coil=0.7;l3melee(a,D,dt,d,null);return;}}
  if(a._atk){a.state='chase';l3melee(a,D,dt,d,null);return;}
  const R=(C.cozy?50:95)*C.sK;
  if(d<R||(a._act==='coil'&&d<R*1.35)){l3set(a,'coil');l3face(a,dt);l3go(a,a.x,a.z,0);pt.coil=1;pt.head=-0.8;a._coilT=(a._coilT||0)+dt;
    if(G.t-(a._hissT||0)>1.3){a._hissT=G.t;l3sfx('hiss',a,300);if(d<R)l3toast('snake','🐍 Rắn cuộn mình phì phì cảnh cáo: lùi lại!',40);}
    if(d<a.r+22||(a._coilT>1.8&&d<a.r+40)){a._atk={ph:'wind',t:L3.wind.snake*(C.cozy?1.4:1)};a.state='chase';l3tele(a);}return;}
  if(a._act==='coil'){l3set(a,'rest');a._dT=6+Math.random()*8;}a._coilT=0;a._dT-=dt;if(a._dT<=0){if(Math.random()<0.55){l3set(a,'rest');a._dT=8+Math.random()*14;}else{l3set(a,'walk');a._tx=a.home.x+(Math.random()-0.5)*160;a._tz=a.home.z+(Math.random()-0.5)*160;a._dT=12;}}
  if(a._act==='walk')l3go(a,a._tx,a._tz,D.spd*0.35);else{l3go(a,a.x,a.z,0);pt.coil=0.7;pt.head=0.1;}}
/* ---------- di chuyển (kể cả bật lùi, chồm tới) ---------- */
function l3ok(a,x,z){if(l3h(x,z)>WR*0.98)return false;const w=wdAt(x,z);if(a.kind==='crocodile')return !a._wh||w>1.5||l3h(x-a._wh.x,z-a._wh.z)<210;return w<2.4&&hAt(x,z)>-8;}
function l3move(a,D,dt){let sp=a._sp||0;const dx=a._tx-a.x,dz=a._tz-a.z,dl=l3h(dx,dz);if(dl<3)sp=0;
  a.spd+=(sp-a.spd)*Math.min(1,dt*(sp>a.spd?2.6:5));if(a.spd<0.05)a.spd=0;const ry0=a.ry;
  if(dl>2&&sp>0)a.ry=lerpAng(a.ry,Math.atan2(dx,dz),Math.min(1,dt*(a._turnK||5)*(a.spd>D.spd*0.6&&a._turnK<20?0.6:1)));
  let dr=a.ry-ry0;dr=Math.atan2(Math.sin(dr),Math.cos(dr));a._turn=dt>0?dr/dt:0;
  let mx=0,mz=0;if(a.spd>0.3){mx=Math.sin(a.ry)*a.spd*dt;mz=Math.cos(a.ry)*a.spd*dt;}
  if(a._lg&&a._lg.t>0){const s=Math.min(dt,a._lg.t);a._lg.t-=dt;mx+=Math.sin(a.ry)*a._lg.v*s;mz+=Math.cos(a.ry)*a._lg.v*s;}
  if(a._kb&&a._kb.t>0){const s=Math.min(dt,a._kb.t);a._kb.t-=dt;mx+=a._kb.x*s;mz+=a._kb.z*s;}
  if(mx||mz){const nx=a.x+mx,nz=a.z+mz;if(l3ok(a,nx,nz)){a.x=nx;a.z=nz;}else if(a.spd>0.3){a.ry+=a._side*Math.PI*0.5;a._dT=Math.min(a._dT,0.6);if(a._chg&&a._chg.ph==='run')a._chg.t=0;}}
  a._vx=dt>0?mx/dt:0;a._vz=dt>0?mz/dt:0;
  let gy=hAt(a.x,a.z);if(a.kind==='crocodile'&&wdAt(a.x,a.z)>1.5)gy=a._act==='lurk'?waterAt(a.x,a.z)-a._hgt+0.8+a._legH*0.82:waterAt(a.x,a.z)-a._hgt*0.42;// rình: chỉ lộ mắt và lỗ mũi
  const up=a.kind==='monkey'&&a._act==='perch'&&a._tree?Math.min(48,32*(a._tree.s||1)):0;a._climbY+=(up-a._climbY)*Math.min(1,dt*(up?1.4:3));gy+=a._climbY;
  a.y+=(gy-a.y)*Math.min(1,dt*8);}
/* ---------- hoạt cảnh: đi → nước kiệu → phi theo tốc độ, nằm, rình, chồm, thở, vẩy đuôi, ngoái đầu ---------- */
function l3leg(R,rs,k,val){const q=R[k],b=rs[k];if(q&&b)q.rotation.x=b.x+val;}
function l3anim(a,D,dt,d){const R=a.rig,rs=a._rest,p=a._p,pt=a._pt,o=a.o,kk=Math.min(1,dt*(a._atk||a._chg?10:3.5));for(const k in pt)p[k]+=(pt[k]-p[k])*kk;
  const v=a.spd||0,ref=D.spd||100,r=v/ref,legH=a._legH;
  let wW=0,wT=0,wG=0;if(r<0.3)wW=1;else if(r<0.45){wT=(r-0.3)/0.15;wW=1-wT;}else if(r<0.65)wT=1;else if(r<0.8){wG=(r-0.65)/0.15;wT=1-wG;}else wG=1;
  if((a.kind==='rabbit'||a.kind==='monkey')&&v>12){wW=wT=0;wG=1;}
  const stride=legH*(2.4+2.2*wG);a._gp+=dt*Math.min(4.5,v/Math.max(3,stride));const ph=a._gp*6.2832,T6=6.2832;
  const climbing=a._climbY>2,sit=a.kind==='monkey'&&(a._act==='perch'||a._act==='forage')&&v<3&&!climbing;
  if(o.userData&&o.userData.pose&&a._sitP!==sit){a._sitP=sit;try{o.userData.pose(sit?'sit':'stand');}catch(e){}}
  const amp=Math.min(1,v/18)*(0.36*wW+0.5*wT+0.78*wG)*(1-p.lie)*(climbing?0:1),limp=a.hp<a._hpMax*0.4;
  const s0=Math.sin(ph),s5=-s0,fl=wW*Math.sin(ph+0.25*T6)+(wT+wG)*s0,fr=wW*Math.sin(ph+0.75*T6)+wT*s5+wG*Math.sin(ph+0.1*T6),bl=wW*s0+wT*s5+wG*s5,br=wW*s5+wT*s0+wG*Math.sin(ph+0.6*T6);
  const fold=p.lie*1.45,cr=p.crouch*0.65;
  if(!sit){l3leg(R,rs,'legFL',fl*amp+fold-cr);l3leg(R,rs,'legFR',a._paw?-0.3+0.55*Math.sin(G.t*13):fr*amp*(limp?0.35:1)+fold-cr-(limp&&v<3?0.3:0));l3leg(R,rs,'legBL',bl*amp-fold+cr);l3leg(R,rs,'legBR',br*amp-fold+cr);}
  if(R.wingL&&R.wingR){const f=a._act==='flee'?Math.sin(G.t*32)*0.9:0;R.wingL.rotation.z=f;R.wingR.rotation.z=-f;}
  // độ cao thân: nằm, khom rình, nhấp nhô theo bước, thỏ nhảy
  let yo=-legH*(0.82*p.lie+(1-Math.cos(0.65))*p.crouch);
  if(v>3&&!climbing){if((a.kind==='rabbit'||a.kind==='junglefowl'&&a._act==='flee')&&wG)yo+=Math.max(0,Math.sin(ph))*legH*(a.kind==='rabbit'?1.1:0.8);else yo+=(Math.abs(Math.sin(ph))*legH*0.12*wG+Math.abs(Math.sin(ph*2))*legH*0.035*(wW+wT))*(1-p.lie);if(limp)yo-=Math.max(0,Math.sin(ph+1.6))*legH*0.07;}
  let pitch=-p.rear*(a.kind==='bear'?1.05:a.kind==='rabbit'?0.6:0.45)+(wG&&v>3?Math.sin(ph)*0.06*wG:0),roll=0;
  if(climbing)pitch=-1.25;
  if(a._fl>0){a._fl-=dt;roll+=Math.sin(a._fl*45)*0.14*Math.max(0,a._fl)/0.3;yo+=Math.max(0,a._fl)*7;}
  roll+=Math.max(-0.25,Math.min(0.25,-(a._turn||0)*0.07*Math.min(1,r)));
  const z0=a._zB,oy=z0*Math.sin(pitch),oz=z0*(1-Math.cos(pitch));
  o.rotation.set(pitch,a.ry,roll);o.position.set(a.x+Math.sin(a.ry)*oz,a.y+yo+oy,a.z+Math.cos(a.ry)*oz);
  if(d>800)return;// chi tiết nhỏ chỉ khi ở gần
  // đầu: cúi gặm cỏ / ngẩng cảnh giác nhìn theo người / giật nhẹ (vẫy tai đuổi ruồi)
  if(R.head&&rs.head&&!sit){a._tw-=dt;if(a._tw<0){a._tw=2+Math.random()*6;a._twT=0.25;}let tz=0;if(a._twT>0){a._twT-=dt;tz=Math.sin(a._twT*50)*0.09;}
    R.head.rotation.x=rs.head.x+p.head+(v>3&&!R.seg?Math.sin(ph*2)*0.05:0);R.head.rotation.y=rs.head.y+p.hy;R.head.rotation.z=rs.head.z+tz;}
  else if(R.head&&rs.head&&sit)R.head.rotation.y=rs.head.y+p.hy;
  if(R.tail&&rs.tail&&!sit){a._flk-=dt;if(a._flk<0){a._flk=1.5+Math.random()*5;a._flkT=0.5;}let w=Math.sin(G.t*2.4+a.ph)*0.1;if(a._flkT>0){a._flkT-=dt;w+=Math.sin(a._flkT*30)*0.5;}
    if(v>20)w=Math.sin(ph*2)*0.22;if(p.crouch>0.5)w+=Math.sin(G.t*4.5+a.ph)*0.35;if(a.kind==='crocodile')w=Math.sin(G.t*(v>3?4:0.8)+a.ph)*(v>3?0.4:0.08);
    R.tail.rotation.y=rs.tail.y+w;R.tail.rotation.x=rs.tail.x+p.tail*0.8;}
  if(R.tail2&&rs.tail2)R.tail2.rotation.y=rs.tail2.y+Math.sin(G.t*(v>3?4:0.8)+a.ph-0.8)*(v>3?0.45:0.12);
  // thở: ngực phồng xẹp, thở dốc sau khi chạy
  a._pant=v>ref*0.6?Math.min(1,a._pant+dt*0.25):Math.max(0,a._pant-dt*0.05);
  if(R.body&&rs.body&&!R.seg){const br=Math.sin(G.t*(1.5+a._pant*4)+a.ph)*(0.012+a._pant*0.022);R.body.scale.x=rs.body.sx*(1+br);R.body.scale.y=rs.body.sy*(1+br*0.6);}
  // rắn: uốn lượn khi bò, khoanh/cuộn khi đe dọa
  if(R.seg){const mv=v>2,w=mv?2+v*0.08:1.2,A=(mv?0.45:0.12)*(1-p.coil)+p.coil*0.85,step=0.9+p.coil*0.55;R.seg.forEach((sg,i)=>{sg.rotation.y=(R.segRest?R.segRest[i]:0)+A*Math.sin(G.t*w*(p.coil>0.5?0.35:1)+a.ph-i*step);});}
  // bụi tung khi phi nước đại
  if(wG>0.5&&v>ref*0.7&&d<450&&a.r>8&&G.t-(a._dust||0)>0.3){a._dust=G.t;puff(a.x-Math.sin(a.ry)*a.r,a.y+3,a.z-Math.cos(a.ry)*a.r,'#b9a787',1);}}
/* ---------- chết: ngã nghiêng nằm lại (không biến mất), xác bị thú săn hạ thì xẻ thịt được ---------- */
function l3dead(a,dt,d,D){if(a.dieT){a.dieT+=dt;const life=a._carc?1e9:22;
    if(a.dieT>life+2.5||(a._carc&&G.t-a._carc.t>420)){a.o.visible=false;a.dieT=0;a._carc=null;}
    else{const vis=d<L3.C.vis;a.o.visible=vis;if(vis){const k=Math.min(1,a.dieT/0.7),e=k*k,sink=a.dieT>life?(a.dieT-life)/2.5:0,R=a.rig,rs=a._rest||{};
      const L=(n,v)=>{if(R[n]&&rs[n])R[n].rotation.x=rs[n].x+v*e;};L('legFL',-0.35);L('legFR',-0.25);L('legBL',0.35);L('legBR',0.25);if(R.head&&rs.head)R.head.rotation.x=rs.head.x+0.35*e;
      const tw=a.dieT<1.6&&a.dieT>0.7?Math.sin(a.dieT*30)*0.03:0;a.o.rotation.set(0,a.ry,(a._side||1)*(1.45*e+tw));a.o.position.set(a.x,a.y+(a.r*0.32)*e-sink*a.r*1.3,a.z);}}}
  if(TNOW()>a.back&&d>900&&!a._carc){Object.assign(a,{alive:true,hp:D.hp,x:a.home.x,z:a.home.z,angry:false,state:'wander',dieT:0,_atk:null,_chg:null,_flee:null,_panic:0,_eat:null,_prey:null,prey:null,_hph:null,_act:'idle',_dT:0});a.o.visible=true;a.o.rotation.set(0,a.ry,0);}}
function l3loot(a){const c=a._carc;if(!c)return;give(c.drop,[a.x,a.y+10,a.z]);a._carc=null;a.dieT=Math.max(a.dieT,22);addXp('hunt',2);cnt('cnt','scavenge');sfx('chop');
  uiToast(`🥩 Xẻ thịt xác ${a.n.toLowerCase()}${c.by?' do '+(ANIMALS[c.by]||{n:'thú'}).n.toLowerCase()+' bỏ lại':''}.`,'gold');save();}
/* ---------- dấu chân trên bãi cát, bờ sông (và trên tuyết mùa đông) ---------- */
function l3track(a,dt){if(!L3.trk[a.kind]||a.spd<4)return;a._st=(a._st||0)+a.spd*dt;if(a._st<a.r*1.1)return;a._st=0;const b=bgAt(a.x,a.z);if(b!==1&&b!==5&&!(L3.C.winter))return;
  const T=G._trkL||(G._trkL=[]);a._lr=-(a._lr||1);const s=a._lr*a.r*0.22;T.push({x:a.x+Math.cos(a.ry)*s,z:a.z-Math.sin(a.ry)*s,ry:a.ry,kind:a.kind,t:G.t,sz:Math.max(1.2,a.r*0.16)});if(T.length>160)T.shift();G._trkDirty=1;}
function l3trackTick(){if(!G._trkDirty||!window.THREE)return;G._trkDirty=0;const T=THREE,N=160;
  if(!G._trkM){const g=new T.CircleGeometry(1,7);g.rotateX(-Math.PI/2);g.scale(0.75,1,1.15);G._trkM=new T.InstancedMesh(g,new T.MeshBasicMaterial({color:0x2a2016,transparent:true,opacity:0.42,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}),N);G._trkM.frustumCulled=false;G._trkM.count=0;G.sc.add(G._trkM);G._trkO=new T.Object3D();}
  const M=G._trkM,o=G._trkO,L=G._trkL||[];L.forEach((t,i)=>{o.position.set(t.x,hAt(t.x,t.z)+0.35,t.z);o.rotation.set(0,t.ry,0);o.scale.setScalar(t.sz);o.updateMatrix();M.setMatrixAt(i,o.matrix);});M.count=L.length;M.instanceMatrix.needsUpdate=true;}
function l3trackNear(x,z,r){const L=G._trkL;if(!L)return null;let best=null,bd=r;for(let i=L.length-1;i>=0;i--){const t=L[i];if(G.t-t.t>900)continue;const d=l3h(t.x-x,t.z-z);if(d<bd){bd=d;best=t;}}return best;}
/* ---------- tiếng thú (tổng hợp) ---------- */
const L3SND={growl:()=>{noise(0.9,150,1.4,0.32);tone(68,0.9,'sawtooth',0.07,0.85);},roar:()=>{noise(1.2,220,0.8,0.42);tone(105,1.1,'sawtooth',0.11,0.55);tone(80,0.8,'square',0.04,0.7,0.15);},
  hiss:()=>noise(0.75,5200,0.7,0.16,0,'highpass'),snort:()=>{noise(0.16,650,1,0.3);noise(0.14,520,1,0.24,0.22);},howl:()=>{tone(410,1.5,'sine',0.06,1.35);tone(560,1.1,'sine',0.045,0.72,1.25);},
  screech:()=>{for(let i=0;i<3;i++)tone(1300+i*120,0.12,'square',0.035,1.4,i*0.14);},cluck:()=>{tone(700,0.06,'square',0.04,0.7);tone(650,0.06,'square',0.04,0.7,0.1);},splash:()=>{noise(0.45,900,0.6,0.35);noise(0.3,2400,0.8,0.15,0.05);}};
{const _sfx=sfx;sfx=function(k){if(L3SND[k]){if(!AU.on)return;auInit();if(!AU.ctx)return;if(AU.ctx.state==='suspended')AU.ctx.resume();try{L3SND[k]();}catch(e){}return;}return _sfx(k);};}
/* ---------- bị đánh: bật lùi, giật mình, đầu đàn nổi giận / cả đàn bỏ chạy, bị thương nặng thì tháo chạy ---------- */
function l3noise(x,z,r){for(const a of G.animals){if(!a.alive||!a._i3)continue;const d=l3h(a.x-x,a.z-z);if(d>r)continue;const D=ANIMALS[a.kind];
    if(a._act==='sleep'&&d<r*0.7)a._wake=G.t+25;if((D.aggro==='never'||L3.charger[a.kind])&&!a.angry&&!(a._flee&&a._flee.t>G.t))l3alarm(a,x,z,6);}}
{const _ad=animalDamage;animalDamage=function(a,dmg){if(!a||a.kind==='raider'||!a.alive)return _ad(a,dmg);const D=ANIMALS[a.kind]||{};_ad(a,dmg);if(!a._i3)return;
  const an=Math.atan2(a.x-P.x,a.z-P.z),kb=Math.max(25,110/(1+a._hpMax*0.12));a._kb={x:Math.sin(an)*kb,z:Math.cos(an)*kb,t:0.2};a._fl=0.3;a._sus=2;a._wake=G.t+60;
  if(a._atk&&a._atk.ph==='wind'&&dmg>=a._hpMax*0.2){a._atk=null;if(a._d<400)uiFloat('Ngắt đòn!',a.x,a.y+a._hgt+12,a.z,'#ffd27a');}
  if(!a.alive){a._side=Math.random()<0.5?-1:1;a._eat=null;a._hph=null;return;}
  l3noise(a.x,a.z,260);
  if(a.hp<a._hpMax*0.3&&D.aggro!=='never'&&a.kind!=='snake'&&a.kind!=='crocodile'&&!(a._panic>0)){a._panic=G.t+10;a.angry=false;a._atk=a._chg=null;}
  if(D.aggro==='never'||(L3.charger[a.kind]&&a._h&&l3lead(a._h)!==a))l3alarm(a,P.x,P.z,7);
  const h=a._h;if(h&&(a.kind==='wolf'||a.kind==='gaur')){for(const m of h.m)if(m!==a&&m.alive&&l3h(m.x-a.x,m.z-a.z)<280&&(a.kind==='wolf'||l3lead(h)===m))m.angry=true;}};}
{const _aa=animalAttack;animalAttack=function(a){_aa(a);if(a&&a._i3){a._kb={x:-Math.sin(a.ry)*30,z:-Math.cos(a.ry)*30,t:0.15};}};}
{const _sa=shootArrow;shootArrow=function(){const n=invCount('arrow');_sa();if(invCount('arrow')<n)l3noise(P.x,P.z,320);};}
/* ---------- xác thú, dấu chân: nhắm tới, chạm, nhãn ---------- */
{const _ft=findTarget;findTarget=function(){const t=_ft();if(G.work||G.sit||G.ride||!G.animals)return t;let best=null,bd=REACH+10;
  for(const a of G.animals){if(a.alive||!a._carc||!a.o.visible)continue;const d=l3h(a.x-P.x,a.z-P.z)-a.r*0.6;if(d<bd){bd=d;best=a;}}
  if(best&&(!t||t.type==='water'||t.type==='res'||(t.d!=null&&t.d>bd)))return {type:'carcass',a:best,d:bd,b:{x:best.x,y:best.y-20,z:best.z}};
  if(!t&&G._trkL&&G._trkL.length){const tr=l3trackNear(P.x+Math.sin(P.ry)*16,P.z+Math.cos(P.ry)*16,14);if(tr)return {type:'track',k:tr,d:16,b:{x:tr.x,y:hAt(tr.x,tr.z)-34,z:tr.z}};}
  return t;};}
{const _ti=targetInfo;targetInfo=function(t){if(t&&t.type==='carcass'){const c=t.a._carc||{};return {name:'Xác '+t.a.n.toLowerCase()+(c.by?' · bị '+(ANIMALS[c.by]||{n:'thú'}).n.toLowerCase()+' hạ':''),verb:'Xẻ thịt',ok:true,icon:'meat'};}
  if(t&&t.type==='track')return {name:'Dấu chân '+L3.trk[t.k.kind]+(G.t-t.k.t<120?' · còn mới':''),verb:'Xem dấu',ok:true,icon:'hide'};
  const r=_ti(t);if(r&&t&&t.type==='animal'&&t.a._i3&&!t.a.angry&&!/·/.test(r.name)){const s=L3.say[t.a._act];if(s)r.name+=' · '+s;if(t.a.hp<t.a._hpMax*0.4)r.name+=' · bị thương';}return r;};}
{const _as=actStart;actStart=function(t){if(t&&t.type==='carcass'){if(t.a._carc)l3loot(t.a);return;}
  if(t&&t.type==='track'){const k=t.k,fresh=G.t-k.t<120,fierce=/tiger|wolf|bear|crocodile/.test(k.kind);uiToast(`🐾 Dấu chân ${L3.trk[k.kind]} ${fresh?'còn mới: nó vừa đi qua đây':'đã cũ'}${fierce&&fresh?'. Cẩn thận!':'.'}`,fierce&&fresh?'bad':'');return;}return _as(t);};}
{const _wt=worldTap;worldTap=function(x,y){if(!G.on||G.paused||G.build||!G.animals)return _wt(x,y);const p=groundPick(x,y);
  if(p)for(const a of G.animals){if(a.alive||!a._carc||!a.o.visible||l3h(a.x-p.x,a.z-p.z)>a.r+14)continue;const t={type:'carcass',a,b:{x:a.x,y:a.y-20,z:a.z}};
    if(l3h(a.x-P.x,a.z-P.z)<REACH+a.r){G.walkTo=null;actStart(t);}else{G.walkTo={x:a.x,z:a.z,t,t0:G.t};G.act=null;}return;}
  return _wt(x,y);};}
{const _ps=peekScan;peekScan=function(x,z,rad){let b=_ps(x,z,rad);for(const a of (G.animals||[])){if(a.alive||!a._carc||!a.o.visible)continue;const d=l3h(a.x-x,a.z-z)-a.r;if(d<rad&&(!b||d<b.d))b={lab:'Xác '+a.n.toLowerCase(),tag:'res',d};}
  if(!b||(b.tag==='res'&&b.d>8)){const t=l3trackNear(x,z,Math.max(14,rad));if(t)b={lab:'Dấu chân '+L3.trk[t.kind]+(G.t-t.t<120?' (còn mới)':''),tag:/tiger|wolf|bear|crocodile/.test(t.kind)?'bad':'gnd',d:0};}return b;};}
