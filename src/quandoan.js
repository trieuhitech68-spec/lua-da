/* ===================== ĐẠO QUÂN: ĐỘI HÌNH · MỆNH LỆNH · BINH CHỦNG · KỴ BINH =====================
   Trước: người được giao "Lính theo bạn" chỉ lẽo đẽo sau lưng, ai cũng như ai.
   Giờ (bảng 👥 Dân làng → khung "Đạo quân", hiện khi có ít nhất 1 lính):
     · ĐỘI HÌNH: Hàng ngang · Cột dọc · Mũi nhọn · Vòng tròn (bảo vệ quanh bạn). Lính khiên đứng trước, lính giáo ở giữa, cung thủ phía sau, kỵ binh hai cánh.
     · MỆNH LỆNH: Theo tôi · Giữ chỗ (đứng nguyên chỗ bạn ra lệnh, quay mặt theo hướng bạn đang nhìn) · Xung phong (tự tìm đánh kẻ địch, thú dữ trong tầm rộng) · Về trại.
     · BINH CHỦNG: Lính giáo (đánh gần, với xa hơn) · Cung thủ (bắn từ xa 230, mỗi phát yếu hơn) · Lính khiên (đứng mũi; mỗi lính khiên ở gần giúp bạn bớt 4% đòn đánh, tối đa 20%).
     · CHIÊU MỘ: có Trại lính và giường trống thì chiêu mộ dân binh ngay trong khung Đạo quân (4 thịt chín + 1 giáo mỗi người, tối đa 3 người mỗi ngày).
     · KỴ BINH: cấp cho lính một con ngựa bạn đã thuần (ngựa đang rảnh): chạy nhanh gấp rưỡi, đòn xung trận mạnh hơn 50%. Thu ngựa lại lúc nào cũng được.
   Lưu trong S.army {form,cmd,hx,hz,hry}; binh chủng ở f.arm; ngựa cấp cho lính ghi ở mount.sol = mã lính. */
const QD={FORM:{line:['▭','Hàng ngang'],col:['▯','Cột dọc'],wedge:['△','Mũi nhọn'],circle:['◯','Vòng tròn']},CMD:{follow:['🚶','Theo tôi'],hold:['✋','Giữ chỗ'],charge:['⚔️','Xung phong'],back:['🏠','Về trại']},
  ARM:{spear:['🔱','Lính giáo'],bow:['🏹','Cung thủ'],shield:['🛡️','Lính khiên']},ORD:{shield:0,spear:1,bow:2},fx:[]};
function qdS(){const A=S.army||(S.army={form:'line',cmd:'follow'});if(!QD.FORM[A.form])A.form='line';if(!QD.CMD[A.cmd])A.cmd='follow';return A;}
const qdSol=()=>(S.folk||[]).filter(f=>f.job==='soldier');
function qdArm(f){if(!QD.ARM[f.arm])f.arm=['spear','spear','bow','shield'][(f.seed|0)%4];return f.arm;}
function qdUid(f){if(!f.uid){S.fseq=(S.fseq||1000)+1;f.uid=S.fseq;}return f.uid;}
function qdHorse(f){if(!Array.isArray(S.mounts))return null;const u=qdUid(f);return S.mounts.find(m=>m.sol===u&&m!==G.mnt)||null;}
// vị trí của lính thứ i trong n người: [lệch ngang, lùi sau] so với điểm neo; vòng tròn trả về góc
function qdSlot(form,i,n){if(form==='col')return [((i%2)-0.5)*20,44+Math.floor(i/2)*20];if(form==='wedge'){let k=0,c=0;while(c+k+1<=i){c+=k+1;k++;}const j=i-c;return [(j-k/2)*22,44+k*20];}
  if(form==='circle'){const a=i/Math.max(1,n)*6.283,R=Math.max(46,n*20/6.283);return [Math.sin(a)*R,-Math.cos(a)*R,a];}const W=Math.min(n,8),row=Math.floor(i/8),inRow=row===Math.floor((n-1)/8)?n-row*8:8;return [((i%8)-(inRow-1)/2)*20,44+row*22];}
function qdAnchor(A,home){if(A.cmd==='hold'&&A.hx!=null)return [A.hx,A.hz,A.hry||0];if(A.cmd==='back')return [home.x,home.z+60,0];return [P.x,P.z,P.ry||0];}
function qdShot(f,e){try{const T=THREE,g=new T.BufferGeometry().setFromPoints([new T.Vector3(f.x,(f._o.position.y||0)+26,f.z),new T.Vector3(e.x,(e.y||hAt(e.x,e.z))+14,e.z)]),l=new T.Line(g,new T.LineBasicMaterial({color:0xe8d8a8,transparent:true,opacity:0.9}));G.sc.add(l);QD.fx.push({o:l,t:G.t+0.18});}catch(er){}}
// vũ khí và màu áo theo binh chủng (gắn một lần, đổi binh chủng / nhận ngựa thì gắn lại)
function qdGear(f){try{const arm=qdArm(f),key=arm;if(!f._o||f._gear===key||!f._rig)return;const R=f._rig;if(f._wp)for(const o of f._wp)try{o.parent&&o.parent.remove(o);}catch(e){}f._wp=[];f._gear=key;
    const hR=R.handR||R.armR,hL=R.handL||R.armL;if(!hR)return;const put=(id,hand)=>{let g=null;try{g=model(['tool',id]);}catch(e){}if(!g)return;g.traverse(o=>{if(o.isMesh)o.castShadow=false;});g.rotation.set(id==='spear'?Math.PI/2-0.35:Math.PI/2+0.25,0,0);g.position.set(0,-1.5,1.5);g.scale.setScalar(0.9);hand.add(g);f._wp.push(g);};
    if(arm==='bow')put('bow',hL||hR);else put('spear',hR);
    if(arm==='shield'&&hL){const T=THREE,sh=new T.Mesh(new T.CylinderGeometry(7.5,7.5,1.2,12),new T.MeshLambertMaterial({color:'#7a4a26'})),boss=new T.Mesh(new T.SphereGeometry(2,8,6),new T.MeshLambertMaterial({color:'#c9a24a'}));sh.rotation.set(Math.PI/2,0,0);boss.position.y=0.9;sh.add(boss);sh.position.set(-2.2,-2,2);hL.add(sh);f._wp.push(sh);}
    /* màu áo: giáo đỏ đất, cung xanh rêu, khiên nâu sẫm (chỉ đổi khi áo là chất liệu riêng của người đó) */const top=R.top;if(top&&top.color&&!top._qdShared){if(!f._top0)f._top0=top.color.getHex();top.color.set({spear:'#a8442e',bow:'#4f7a3a',shield:'#5a4632'}[arm]);}}catch(e){}}
function qdTick(L,dt){const A=qdS(),home=folkHome(L[0]),anc=qdAnchor(A,home),sn=Math.sin(anc[2]),cs=Math.cos(anc[2]);
  for(let i=QD.fx.length-1;i>=0;i--)if(G.t>QD.fx[i].t||G.t<QD.fx[i].t-1){try{G.sc.remove(QD.fx[i].o);QD.fx[i].o.geometry.dispose();QD.fx[i].o.material.dispose();}catch(e){}QD.fx.splice(i,1);}
  const foot=L.filter(f=>!qdHorse(f)).sort((a,b)=>QD.ORD[qdArm(a)]-QD.ORD[qdArm(b)]||(a.seed-b.seed)),cav=L.filter(f=>qdHorse(f)).sort((a,b)=>a.seed-b.seed);
  const width=A.form==='col'?40:A.form==='circle'?0:Math.min(foot.length,8)*20+30;
  const place=(f,idx,isCav)=>{if(!f._o)folkSpawn(f);qdGear(f);const arm=qdArm(f),hs=isCav?qdHorse(f):null;let lx,lb,face=anc[2];
    if(isCav){const side=idx%2?1:-1,k=Math.floor(idx/2);lx=side*(width/2+26+k*26);lb=44+k*8;}else{const s=qdSlot(A.form,idx,foot.length);lx=s[0];lb=s[1];if(s[2]!=null)face=anc[2]+s[2];}
    const ax=anc[0]+cs*lx-sn*lb,az=anc[1]-sn*lx-cs*lb;let tx=ax,tz=az,pose='idle',sp=hs?(hs.k==='elephant'?135:230):150;f._t=(f._t||0)-dt;
    const R=A.cmd==='charge'?540:A.cmd==='hold'?250:A.cmd==='back'?200:270,cx=A.cmd==='follow'||A.cmd==='charge'?P.x:ax,cz=A.cmd==='follow'||A.cmd==='charge'?P.z:az,t=danEnemy(cx,cz,R);
    if(t){const e=t.e,de=Math.hypot(e.x-f.x,e.z-f.z),reach=(e.r||9)+(arm==='spear'?24:16)+(hs?6:0);
      if(arm==='bow'&&!hs&&de<230&&de>reach){tx=f.x;tz=f.z;pose='chop';f._ry=Math.atan2(e.x-f.x,e.z-f.z);if(f._t<=0){f._t=1.7;const d=danDmg(f)*0.75;qdShot(f,e);if(t.foe)foeDamage(e,d);else animalDamage(e,d);danXp(f,1);}}
      else if(de<reach){tx=f.x;tz=f.z;pose='chop';f._ry=Math.atan2(e.x-f.x,e.z-f.z);if(f._t<=0){f._t=hs?1.3:1.1;const d=danDmg(f)*(arm==='shield'?0.8:1)*(hs?1.5:1);if(t.foe)foeDamage(e,d);else animalDamage(e,d);danXp(f,1);}}
      else if(A.cmd!=='hold'||de<250){tx=e.x;tz=e.z;if(arm==='bow'&&!hs){const k=Math.max(0,(de-200)/de);tx=f.x+(e.x-f.x)*k;tz=f.z+(e.z-f.z)*k;}}}
    f._gx=tx;f._gz=tz;const dx=tx-f.x,dz=tz-f.z,d=Math.hypot(dx,dz);if((A.cmd==='follow'||A.cmd==='charge')&&d>1500){f.x=ax;f.z=az;}else if(d>5&&pose!=='chop'){f.x+=dx/d*Math.min(d,sp*dt);f.z+=dz/d*Math.min(d,sp*dt);f._ry=Math.atan2(dx,dz);pose='walk';f._g=(f._g||0)+dt*(hs?2.4:2);}else if(pose==='idle')f._ry=face;
    const gy=groundY(f.x,f.z,(f._o.position.y||0)+10),seat=hs&&typeof MT==='object'?(MT.sy||17*MT.sc-2):0;f._o.position.set(f.x,gy+seat,f.z);f._o.rotation.y=lerpAng(f._o.rotation.y,f._ry||0,Math.min(1,dt*7));f._o.visible=true;f._st='soldier';
    const nearP=Math.hypot(P.x-f.x,P.z-f.z)<900;if(K3.char2Pose&&f._rig&&nearP){try{K3.char2Pose(f._rig,hs?(pose==='chop'?'chop':'idle'):pose,pose==='walk'?f._g:G.t+f.seed,{});}catch(e){}}
    if(hs){hs.x=+f.x.toFixed(1);hs.z=+f.z.toFixed(1);hs.ry=f._o.rotation.y;const ho=typeof MT==='object'?MT.o.get(hs.id):null;if(ho){ho.visible=true;ho.position.set(f.x,gy,f.z);ho.rotation.y=f._o.rotation.y;const rg=ho.userData.rig||{},mv=pose==='walk',a=mv?0.6:0,ph=f._g*5;if(rg.legFL){rg.legFL.rotation.x=Math.sin(ph)*a;rg.legFR.rotation.x=Math.sin(ph+Math.PI)*a;rg.legBL.rotation.x=Math.sin(ph+Math.PI+0.5)*a;rg.legBR.rotation.x=Math.sin(ph+0.5)*a;}}
      const Rg=f._rig;if(Rg&&Rg.legL&&Rg.legR&&nearP){Rg.legL.rotation.set(0,0,1.28);Rg.legR.rotation.set(0,0,-1.28);if(Rg.shinL)Rg.shinL.rotation.set(0.25,0,-0.7);if(Rg.shinR)Rg.shinR.rotation.set(0.25,0,0.7);}}};
  foot.forEach((f,i)=>{try{place(f,i,false);}catch(e){if(!QD.err){QD.err=1;console.warn('đạo quân',e);}}});cav.forEach((f,i)=>{try{place(f,i,true);}catch(e){if(!QD.err){QD.err=1;console.warn('đạo quân',e);}}});}
{const _ft=folkTick;folkTick=function(dt){if(!S||!S.folk||!S.folk.length)return _ft.apply(this,arguments);const all=S.folk,sol=all.filter(f=>f.job==='soldier');
    /* ngựa đã cấp mà lính không còn là lính nữa (đổi việc, bỏ đi): trả ngựa */try{if(Array.isArray(S.mounts)&&(G.t-(QD.chk||-9)>3||G.t<(QD.chk||0))){QD.chk=G.t;for(const m of S.mounts)if(m.sol!=null&&!sol.some(f=>f.uid===m.sol))delete m.sol;}}catch(e){}
    for(const f of all)if(f.job!=='soldier'&&f._gear){try{if(f._wp)for(const o of f._wp)o.parent&&o.parent.remove(o);f._wp=null;f._gear=null;if(f._top0!=null&&f._rig&&f._rig.top&&f._rig.top.color)f._rig.top.color.setHex(f._top0);}catch(e){}}
    if(!sol.length)return _ft.apply(this,arguments);S.folk=all.filter(f=>f.job!=='soldier');let r;try{r=_ft.apply(this,arguments);}finally{S.folk=all;}try{qdTick(sol,dt);}catch(e){if(!QD.err){QD.err=1;console.warn('đạo quân',e);}}return r;};}
// ngựa đã cấp cho lính thì người chơi không cưỡi được
if(typeof mtRide==='function'){const _mr=mtRide;mtRide=function(m){if(m&&m.sol!=null){uiToast('🐎 Con ngựa này đang cấp cho kỵ binh. Muốn cưỡi: mở Dân làng → Đạo quân → bớt một kỵ binh.','');return;}return _mr.apply(this,arguments);};}
// lính khiên đứng gần: bạn bớt đòn
if(typeof heroDef==='function'){const _hd=heroDef;heroDef=function(){const v=_hd.apply(this,arguments);try{if(G.t-(QD.shT||-9)>1||G.t<(QD.shT||0)){QD.shT=G.t;QD.shN=qdSol().filter(f=>f.arm==='shield'&&Math.hypot(f.x-P.x,f.z-P.z)<130).length;}if(QD.shN)return Math.min(0.8,v+Math.min(0.2,QD.shN*0.04));}catch(e){}return v;};}
/* ---------- bảng điều khiển ---------- */
function qdFreeHorses(){return (Array.isArray(S.mounts)?S.mounts:[]).filter(m=>m.sol==null&&m!==G.mnt&&(typeof mtLand!=='function'||(m.land||'c')===mtLand()));}
const QD_RC={cost:{meatCooked:4,spear:1},perDay:3,N:['Sơn','Lâm','Thạch','Giang','Hổ','Báo','Đại','Cường','Vũ','Phong','Kiên','Dũng','Lực','Mạnh','Tráng','Bảo','Khôi','Trường']};
function qdRcLeft(){const A=qdS(),d=Math.floor(TNOW());if(A.rcD!==d){A.rcD=d;A.rcN=0;}return QD_RC.perDay-(A.rcN|0);}
function qdRecruit(){if(!qhHas('qh_linh')){uiToast('Cần dựng Trại lính trước (Xây → Nhà có công năng → Quân sự).','bad');sfx('no');return;}const bed=freeBed();if(!bed){uiToast('Hết giường trống. Dựng thêm giường, võng hoặc Trại lính (mỗi trại 3 chỗ ngủ).','bad');sfx('no');return;}
  if(qdRcLeft()<=0){uiToast('Hôm nay đã chiêu mộ đủ '+QD_RC.perDay+' người. Mai chiêu mộ tiếp.','');return;}if(!canPay(QD_RC.cost)){uiToast('Cần 4 thịt chín (đãi tân binh) và 1 giáo (phát cho họ).','bad');sfx('no');return;}
  pay(QD_RC.cost);const A=qdS();A.rcN=(A.rcN|0)+1;const used=new Set((S.folk||[]).map(f=>f.n));const nm=QD_RC.N.find(n=>!used.has(n))||('Lính '+((S.fseq||1000)+1));
  const f={n:nm,role:'hunter',seed:300+Math.floor(Math.random()*500),sex:'m',bed:bed.id,job:'soldier',x:P.x+30,z:P.z+20,fed:TNOW(),lv:1,sp:'guard',xp:0,arm:'spear'};S.folk=S.folk||[];S.folk.push(f);qdUid(f);try{folkSpawn(f);}catch(e){}cnt('cnt','folk');sfx('level');uiToast(`🪖 ${nm} nhập ngũ làm lính giáo. Nhớ để thức ăn trong kho cho lính.`,'gold');try{uiHotbar();}catch(e){}save();uiOpenRefresh();}
function qdRcHtml(){const has=qhHas('qh_linh'),beds=S.builds.filter(b=>{const d=pieceDef(b.k);return d&&d.bed&&b.prog==null&&!b.remote;}).length,free=Math.max(0,beds-(S.folk||[]).length),ok=has&&free>0&&qdRcLeft()>0&&canPay(QD_RC.cost);
  return `<div class="qd-l">Chiêu mộ <span class="small muted">${has?`giường trống: ${free} · hôm nay còn ${Math.max(0,qdRcLeft())} lượt`:'cần dựng Trại lính'}</span></div><div class="qd-row"><button class="btn sm${ok?'':' ghost'}" data-a="qdrc">🪖 Chiêu mộ dân binh</button><span class="chips">${Object.entries(QD_RC.cost).map(([k,v])=>`<span class="chip${haveCount(k)<v?' lack':''}">${icon(k)}${Math.min(haveCount(k),v)}/${v}</span>`).join('')}</span></div>`;}
function qdHtml(){const L=qdSol();if(!L.length){try{if(qhHas('qh_linh'))return `<div class="qd-box"><div class="qd-h"><b>⚔️ Đạo quân · chưa có lính</b></div>${qdRcHtml()}<span class="small muted">Hoặc giao việc «Lính theo bạn» cho người làng, tù binh ở bảng Phân công bên dưới.</span></div>`;}catch(e){}return '';}const A=qdS(),cnt={spear:0,bow:0,shield:0};L.forEach(f=>cnt[qdArm(f)]++);const cav=L.filter(f=>qdHorse(f)).length,fh=qdFreeHorses().length;
  const chips=(O,cur,a)=>Object.keys(O).map(k=>`<button class="tb sm${cur===k?' on':''}" data-a="${a}" data-v="${k}">${O[k][0]} ${O[k][1]}</button>`).join('');
  return `<div class="qd-box"><div class="qd-h"><b>⚔️ Đạo quân · ${L.length} lính</b><span class="small muted">${QD.CMD[A.cmd][1]} · ${QD.FORM[A.form][1]}</span></div>
    <div class="qd-l">Mệnh lệnh</div><div class="qd-row">${chips(QD.CMD,A.cmd,'qdcmd')}</div>
    <div class="qd-l">Đội hình</div><div class="qd-row">${chips(QD.FORM,A.form,'qdform')}</div>
    <div class="qd-l">Binh chủng <span class="small muted">bấm + để chuyển một lính sang loại đó</span></div>
    <div class="qd-arms">${Object.keys(QD.ARM).map(k=>`<div class="qd-a"><span>${QD.ARM[k][0]} ${QD.ARM[k][1]}</span><em>${cnt[k]}</em><button class="dl-b" data-a="qdarm" data-v="${k}"${cnt[k]>=L.length?' disabled':''} aria-label="Thêm ${QD.ARM[k][1]}">+</button></div>`).join('')}
      <div class="qd-a qd-wide"><span>🐎 Kỵ binh, tượng binh <small class="muted">ngựa, voi rảnh: ${fh}</small></span><button class="dl-b" data-a="qdcav" data-v="-1"${cav?'':' disabled'} aria-label="Bớt kỵ binh">−</button><em>${cav}</em><button class="dl-b" data-a="qdcav" data-v="1"${fh&&cav<L.length?'':' disabled'} aria-label="Thêm kỵ binh">+</button></div></div>
    ${qdRcHtml()}
    <span class="small muted">Giữ chỗ: lính đứng đúng nơi bạn đang đứng lúc ra lệnh. Kỵ binh cần ngựa bạn đã thuần (cho ngựa rừng ăn tới khi quen).</span></div>`;}
{const _dh=danHtml;danHtml=function(){let h=_dh.apply(this,arguments);try{const q=qdHtml();if(q){const i=h.indexOf('<h3 class="dl-h">');h=i>=0?h.slice(0,i)+q+h.slice(i):h+q;}}catch(e){console.warn('đạo quân',e);}return h;};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="qdcmd"],[data-a="qdform"],[data-a="qdarm"],[data-a="qdcav"],[data-a="qdrc"]');if(!b||!S)return;e.stopImmediatePropagation();if(b.dataset.a==='qdrc'){qdRecruit();return;}const A=qdS(),v=b.dataset.v,L=qdSol();
  if(b.dataset.a==='qdcmd'){A.cmd=v;if(v==='hold'){A.hx=+P.x.toFixed(1);A.hz=+P.z.toFixed(1);A.hry=+(P.ry||0).toFixed(2);}uiToast({follow:'🚶 Lính đi theo bạn.',hold:'✋ Lính giữ chỗ tại đây.',charge:'⚔️ Xung phong! Lính tự tìm đánh kẻ địch quanh bạn.',back:'🏠 Lính rút về trại.'}[v],'');}
  else if(b.dataset.a==='qdform')A.form=v;
  else if(b.dataset.a==='qdarm'){const cnt={};L.forEach(f=>{cnt[qdArm(f)]=(cnt[qdArm(f)]||0)+1;});const from=Object.keys(QD.ARM).filter(k=>k!==v&&cnt[k]).sort((a,c)=>cnt[c]-cnt[a])[0];const f=from&&L.find(x=>x.arm===from);if(f)f.arm=v;}
  else{if(+v>0){const m=qdFreeHorses()[0],f=L.filter(x=>!qdHorse(x)).sort((a,c)=>(QD.ORD[qdArm(a)]===1?0:1)-(QD.ORD[qdArm(c)]===1?0:1))[0];if(m&&f){m.sol=qdUid(f);uiToast(`🐎 ${f.n} nhận ngựa, thành kỵ binh.`,'good');}}
    else{const f=L.find(x=>qdHorse(x));if(f){const m=qdHorse(f);delete m.sol;uiToast(`🐎 ${f.n} trả ngựa. Ngựa đứng chờ tại chỗ.`,'');}}}
  sfx('pick');save();uiOpenRefresh();},true);
{const st=document.createElement('style');st.textContent=`.qd-box{margin:10px 0 4px;padding:10px;border-radius:14px;border:1px solid rgba(220,120,90,.5);background:linear-gradient(170deg,rgba(220,120,90,.13),rgba(220,120,90,.03))}.qd-h{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap}.qd-h b{font-size:15px;color:#ffd9c2}
.qd-l{margin:8px 0 4px;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#f2a57a}.qd-l .small{text-transform:none;letter-spacing:0;font-weight:400;margin-left:6px}.qd-row{display:flex;flex-wrap:wrap;gap:5px}.qd-row .tb{flex:1 1 auto}
.qd-arms{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px}.qd-a{display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:12px;background:rgba(20,13,8,.72);border:1px solid rgba(255,255,255,.1)}.qd-a span{flex:1;min-width:0;font-size:13.5px;font-weight:700}.qd-a span small{display:block;font-weight:400;font-size:11px}.qd-wide{grid-column:1/-1}.qd-a span{overflow-wrap:anywhere}.qd-a em{font-style:normal;font-weight:800;min-width:20px;text-align:center;font-size:15px}
@media (max-width:520px){.qd-arms{grid-template-columns:1fr 1fr}.qd-row .tb{padding:6px 7px;font-size:12.5px}}`;document.head.appendChild(st);}
if(typeof HD_L!=='undefined')HD_L.push({id:'quandoan',ic:'⚔️',t:'Đạo quân: đội hình và mệnh lệnh',w:()=>{try{return G.panel==='dan'&&qdSol().length>0;}catch(e){return false;}},
  p:['Có lính rồi thì đầu bảng Dân làng hiện khung <b>Đạo quân</b>. Chọn <b>Mệnh lệnh</b>: Theo tôi, Giữ chỗ (đứng nguyên nơi bạn ra lệnh), Xung phong (tự tìm đánh), Về trại.',
   'Chọn <b>Đội hình</b>: Hàng ngang, Cột dọc, Mũi nhọn, Vòng tròn. Lính khiên tự đứng trước, lính giáo ở giữa, cung thủ phía sau, kỵ binh hai cánh.',
   'Mục <b>Binh chủng</b>: bấm <b>+</b> để chuyển một lính sang lính giáo, cung thủ (bắn xa) hoặc lính khiên (đứng gần giúp bạn bớt đòn). <b>Kỵ binh</b> cần ngựa bạn đã thuần: bấm + để cấp ngựa, − để thu lại.']});
