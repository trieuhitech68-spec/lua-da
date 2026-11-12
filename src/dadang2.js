/* ===================== NGƯỜI ĐA DẠNG: mỗi thổ dân / dân làng một khuôn mặt, dáng người, kiểu tóc, áo quần, đồ đội riêng =====================
   Dùng lại bộ tạo hình nhân vật của người chơi (creator.js) cho người máy: ngoại hình sinh từ hạt giống nên cùng một người lần nào vào cũng giống nhau.
   Hỏng ở đâu thì lùi về dáng cũ ở đó, không làm mất người. */
const DD2={on:1,mat:{}};
function dd2Rng(s){s=(s|0)||1;return()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
/* bảng màu vải theo nghề: thêm chàm, nghệ, son, rêu, mộc trắng cho làng có màu */
const DD2_DYE={chief:[['#8f3a24','#c8a050'],['#3f4a56','#c8a050'],['#6a3a5a','#d0b060']],hunter:[['#7a5232','#4a3220'],['#5f6e3a','#3c4626'],['#8e5a30','#5a3a1e'],['#4a4038','#2e2822']],
  potter:[['#b38433','#74501f'],['#c9b48a','#8a7450'],['#9a4528','#5e2a16'],['#a7885e','#6e5236'],['#7d5a6e','#4e3646'],['#4f6a5e','#31443c']],gatherer:[['#6f8a44','#465a2a'],['#cdb98a','#8f7a52'],['#3f4a56','#262e3c'],['#b38433','#74501f'],['#a45a3a','#6a3622'],['#8a6a8a','#544054'],['#c07a4a','#7a4a2a']],
  elder:[['#7a6e62','#4a4038'],['#3f4a56','#232b3a'],['#8a7a5a','#5a4e38']],child:[['#c9b48a','#8a7450'],['#b38433','#74501f'],['#6f8a44','#465a2a'],['#a45a3a','#6a3622']]};
const DD2_BOT=['#5a3a22','#6a5236','#4a2a1a','#3a3028','#5e4426','#75603c'];
function dd2App(seed,role,o){const R=dd2Rng(seed*7919+role.length*131+7),gs=()=>((R()+R()+R())/1.5-1),pick=a=>a[Math.floor(R()*a.length)],fem=o.sex==='f'||!!o.fem,a=crBlank(fem);
  CRS.forEach(p=>{if(p.t==='s')a[p.k]=gs()*0.7;});
  a.f=fem?1:0;a.sk=0.3+R()*0.5;a.ut=gs()*0.4;a.fs=Math.floor(R()*CR_FACE.length);a.ec=Math.floor(R()*CR_EYE.length);
  a.hs=fem?pick([0,2,3,5,5,8,9,10,10]):pick([0,1,1,2,3,4,6,6,7]);a.hc=pick([0,0,0,1,1,2,3]);a.hk=Math.floor(R()*CR_HK.length);a.hg=R()*0.25;
  a.fh=fem?0:(R()<0.4?0:1+Math.floor(R()*5));a.fp=R()<0.35?1+Math.floor(R()*6):0;a.fc=Math.floor(R()*CR_FC.length);a.pt=R()<0.22?1+Math.floor(R()*2):0;
  a.tt=R()<0.3?1+Math.floor(R()*(CR_TT.length-1)):0;a.tp=1+Math.floor(R()*7);a.sc=R()<0.14?1+Math.floor(R()*4):0;a.mo=R()<0.2?1:0;a.fr=0;a.sb=0;a.ag=0;a.wk=0;R();R();
  a.ht=gs()*0.85;a.mu=gs()*0.5;a.fa=gs()*0.6;
  if(role==='hunter'){a.mu=0.25+R()*0.6;a.fa=gs()*0.3;a.sh=0.1+R()*0.5;}
  else if(role==='chief'){a.mu=0.3+R()*0.5;a.ht=0.2+R()*0.6;a.fp=1+Math.floor(R()*6);a.tt=1+Math.floor(R()*(CR_TT.length-1));}
  else if(role==='potter'){a.fa=0.1+R()*0.6;}
  else if(role==='elder'){a.ag=1;a.wk=0.6+R()*0.4;a.hc=4;a.hg=0.5+R()*0.5;a.po=0.3+R()*0.5;a.mu=-0.5+R()*0.3;a.ht=-0.4+R()*0.5;if(!fem)a.fh=pick([3,4,4,5]);if(!fem&&R()<0.3)a.hs=7;}
  else if(role==='child'){a.ag=0;a.wk=0;a.fh=0;a.tt=0;a.sc=0;a.cf=0.3+R()*0.5;a.es=0.2+R()*0.5;a.mu=-0.4;a.hs=fem?pick([2,9,9,10,8]):pick([1,1,6,3]);}
  /* máy yếu: bỏ các lớp vẽ lên da (mỗi lớp là một ảnh riêng cho từng người) */if(typeof G!=='undefined'&&G&&(G.q|0)===0){a.fp=0;a.pt=0;a.tt=0;a.sc=0;a.wk=0;a.ag=0;}
  a.ao=o.bare?2:(o.sleeves?0:1);a.cc=Math.floor(R()*CR_CLOTH.length);return crSan(a);}
function dd2Mat(c,o){const k=c+(o||'');return DD2.mat[k]||(DD2.mat[k]=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:0.92,metalness:0,flatShading:true},o==='d'?{side:THREE.DoubleSide}:{})));}
/* đồ đội thêm: nón lá, băng đầu cắm lông, hoa cài tóc, áo choàng lông thú vai */
function dd2Props(ch,seed,role,fem){const T=THREE,rig=ch.userData.rig;if(!rig||!rig.head||!rig.torso)return;const R=dd2Rng(seed*104729+11),V=ch.userData.villager,has=V&&V.props?V.props:[],add=n=>{if(V&&V.props)V.props.push(n);};
  const hat=!has.includes('headdress')&&role!=='child'&&R()<({gatherer:0.4,potter:0.3,elder:0.25,hunter:0.08}[role]||0);
  if(hat){const m=new T.Mesh(new T.ConeGeometry(5.0,2.7,12,1,true),dd2Mat(R()<0.6?'#d9c88e':'#b9a468','d'));m.position.set(0,5.75,-0.15);m.rotation.x=-0.08;rig.head.add(m);
    add('nonla');}
  else if(!has.includes('headdress')&&R()<({hunter:0.5,gatherer:0.25,potter:0.25,child:0.2,elder:0.2}[role]||0)){const col=['#9a4528','#b38433','#39465c','#cdb98a','#6f8a44'][Math.floor(R()*5)];
    const b=new T.Mesh(new T.TorusGeometry(2.72,0.3,5,16),dd2Mat(col));b.rotation.x=Math.PI/2+0.12;b.position.set(0,4.75,0.05);b.scale.set(1,1.06,1);rig.head.add(b);
    if(role==='hunter'||R()<0.4){const n=1+Math.floor(R()*2);for(let i=0;i<n;i++){const f=new T.Mesh(new T.ConeGeometry(0.5,3.6,4),dd2Mat(['#e8e2d0','#7a3a22','#2e2a26'][Math.floor(R()*3)]));f.scale.z=0.25;f.position.set(-1.9+i*1.1,6.6,-2.0);f.rotation.set(-0.35,0,0.25-i*0.3);rig.head.add(f);}}add('bangdau');}
  else if(fem&&role!=='elder'&&R()<0.3){const g=new T.Group(),c=['#e8c040','#e06a5a','#f0ead8','#c070c0'][Math.floor(R()*4)];for(let i=0;i<5;i++){const p=new T.Mesh(new T.SphereGeometry(0.42,5,4),dd2Mat(c));const an=i/5*6.283;p.position.set(Math.cos(an)*0.45,Math.sin(an)*0.45,0);g.add(p);}
    const ct=new T.Mesh(new T.SphereGeometry(0.3,5,4),dd2Mat('#7a4a1a'));ct.position.z=0.12;g.add(ct);g.position.set(2.45,4.5,0.9);g.rotation.y=1.2;rig.head.add(g);add('hoa');}
  if(!ch.userData.rig.cloak&&(role==='hunter'||role==='chief'||role==='elder')&&R()<0.38){const m=new T.Mesh(new T.CylinderGeometry(2.0,4.5,3.4,10,1,true),dd2Mat(['#6a4a2e','#8a8076','#4a3a2c','#a08660'][Math.floor(R()*4)],'d'));
    m.position.set(0,7.5,-0.15);m.scale.set(1.08,1,0.72);rig.torso.add(m);add('longthu');}}
function dd2Install(){if(DD2.inst||typeof SBM==='undefined'||!SBM.villager||typeof K3==='undefined'||!K3.char2||typeof crSan!=='function')return;DD2.inst=1;const base=SBM.villager;
  SBM.villager=function(seed,role){if(!DD2.on)return base(seed,role);const c2=K3.char2;let used=null;
    K3.char2=function(o){o=o||{};if(o.app)return c2(o);try{const rl=DD2.role||'gatherer',q=Object.assign({},o);q.app=dd2App(DD2.seed||1,rl,o);
        if(!o.bare){const R=dd2Rng((DD2.seed||1)*977+41);R();R();const D=DD2_DYE[rl]||DD2_DYE.gatherer,d=D[Math.floor(R()*D.length)];q.top=d[0];q.top2=d[1];let bt=DD2_BOT[Math.floor(R()*DD2_BOT.length)];q.bottom=bt;if(q.skirt)q.skirt=bt;q.crWear=1;}
        const g=c2(q);used=q.app;return g;}catch(e){if(!DD2.warn){DD2.warn=1;console.warn('đa dạng người',e);}return c2(o);}};
    let ch;DD2.seed=+seed||1;DD2.role=role;try{ch=base(seed,role);}finally{K3.char2=c2;}
    try{if(used&&ch){const V=ch.userData.villager||{};dd2Props(ch,+seed||1,V.role||role||'gatherer',V.sex==='f');}}catch(e){if(!DD2.warn2){DD2.warn2=1;console.warn('đồ đội',e);}}
    return ch;};}
try{dd2Install();}catch(e){console.warn(e);}
{const _i=typeof crInstall==='function'?crInstall:null;if(_i&&!DD2.inst){crInstall=function(){const r=_i.apply(this,arguments);try{dd2Install();}catch(e){}return r;};}}
{const _v=villagerModel;villagerModel=function(){try{dd2Install();}catch(e){}return _v.apply(this,arguments);};}
{const _f=foeSpawn;foeSpawn=function(){try{dd2Install();}catch(e){}return _f.apply(this,arguments);};}
{const _t=tlSpawn;tlSpawn=function(){try{dd2Install();}catch(e){}return _t.apply(this,arguments);};}
