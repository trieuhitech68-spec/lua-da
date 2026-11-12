/* ===================== THỔ DÂN ĐI LẺ =====================
   Ngoài các trại và toán canh mỏ (đông, hung dữ), rải quanh vùng có ~14 thổ dân đi một mình: thợ săn lạc, người hái lượm, thợ đá lang thang, tiều phu.
   - Họ KHÔNG tấn công trước. Bị đánh thì thợ săn, thợ đá, tiều phu đánh trả; người hái lượm bỏ chạy.
   - Cấp thấp (1–3) nên người mới có giáo là hạ được. Có dây thừng và chỗ ngủ trống thì hạ gục là trói bắt về, giữ đúng sở trường của họ.
   - Bị bắt / hạ thì khoảng 10 phút sau có người khác xuất hiện ở nơi khác.
   "Tự làm" mục Bắt sống một thổ dân sẽ tìm những người này thay vì lao vào trại. */
const TL_T=[{n:'Thợ săn lạc',role:'hunter',hp:8,dmg:7,fight:1,sp:'guard',spear:1},{n:'Người hái lượm',role:'gatherer',hp:5,dmg:3,fight:0,sp:'gather'},{n:'Thợ đá lang thang',role:'potter',hp:7,dmg:5,fight:1,sp:'stone'},{n:'Tiều phu lạc',role:'hunter',hp:7,dmg:5,fight:1,sp:'wood'},{n:'Người nấu bếp lạc đoàn',role:'elder',hp:5,dmg:3,fight:0,sp:'cook'}];
const TL={n:14,last:0,seq:0};
function tlSpot(R,minP){for(let t=0;t<400;t++){let x,z;if(typeof V5!=='undefined'&&WV>=4&&R()<0.7){x=V5.box[0]+R()*V5.box[2];z=V5.box[1]+R()*V5.box[3];}else{const a=R()*6.283,rr=900+R()*3600;x=SPAWN[0]+Math.cos(a)*rr;z=SPAWN[1]+Math.sin(a)*rr;}
    if(!wIn(x,z,0.92)||hAt(x,z)<4||wdAt(x,z)>0||slopeAt(x,z)>0.5)continue;const dS=Math.hypot(x-SPAWN[0],z-SPAWN[1]);if(dS<800||dS>5200)continue;if(minP&&Math.hypot(x-P.x,z-P.z)<minP)continue;
    if((G.foes||[]).some(f=>f.alive&&Math.hypot(f.x-x,f.z-z)<520))continue;if(S.builds.some(b=>Math.hypot(b.x-x,b.z-z)<500))continue;if(G.vfire&&Math.hypot(G.vfire.x-x,G.vfire.z-z)<400)continue;return [x,z];}return null;}
function tlSpawn(R,minP){const p=tlSpot(R,minP);if(!p||!G.foes)return null;const T=TL_T[Math.floor(R()*TL_T.length)];let o=null;try{o=window.SBM&&SBM.villager?SBM.villager(700+Math.floor(R()*190),T.role):K3.char2({sex:R()<0.5?'m':'f',skin:'#8a5a3a',top:'#5a4a2a'});}catch(e){o=K3.char({});}
  o.traverse(m=>{if(m.isMesh)m.castShadow=true;});try{if(T.spear&&K3.char2Equip&&o.userData.rig)K3.char2Equip(o.userData.rig,model(['tool','spear']),'spear');}catch(e){}G.sc.add(o);try{seasonPatchAll(o);}catch(e){}
  const lv=1+Math.floor(R()*3),k=1+0.3*(lv-1),f={kind:'raider',n:T.n,x:p[0],z:p[1],y:hAt(p[0],p[1]),r:9,hp:T.hp*k,hp0:T.hp*k,dmg:T.dmg*(1+0.1*(lv-1)),alive:true,o,rig:o.userData.rig,mode:'lone',lone:1,tl:T,sp0:T.sp,lv,_lvA:1,hx:p[0],hz:p[1],ph:R()*6,atkT:0,ry:0,state:'idle',id:++TL.seq};G.foes.push(f);return f;}
function tlInit(){try{if(!G.foes)G.foes=[];const R=rng((S.seed|0)+5151);for(let i=0;i<TL.n;i++)tlSpawn(R,0);TL.last=G.t;}catch(e){console.warn('thổ dân lẻ',e);}}
{const _ci=campInit;campInit=function(){const r=_ci.apply(this,arguments);tlInit();return r;};}
function tlTick(L,dt){for(const f of L){if(!f.alive){if(f.dieT!=null){f.dieT+=dt;f.o.rotation.z=Math.min(1.5,f.dieT*2.5);if(f.dieT>4){G.sc.remove(f.o);f.gone=1;}}continue;}
    const dP=Math.hypot(P.x-f.x,P.z-f.z);if(f.hp<f.hp0-0.01&&!f.prov){f.prov=1;f.pT=G.t;}if(f.prov&&G.t-f.pT>40&&dP>500){f.prov=0;f.hp=f.hp0;}
    let tx=f.x,tz=f.z,sp=0,pose='idle';
    if(f.prov&&f.tl.fight&&dP<520){tx=P.x;tz=P.z;sp=115;if(dP<f.r+16){sp=0;pose='chop';f.atkT-=dt;if(f.atkT<=0){f.atkT=1.4;const d0=FOE.dmg;FOE.dmg=f.dmg;try{foeHit(f,{x:P.x,z:P.z,pl:1});}finally{FOE.dmg=d0;}}}}
    else if(f.prov&&!f.tl.fight&&dP<420){tx=f.x+(f.x-P.x);tz=f.z+(f.z-P.z);sp=118;}
    else{f.t=(f.t||0)-dt;if(f.t<=0){f.t=4+Math.random()*7;f.gx=f.hx+(Math.random()-0.5)*260;f.gz=f.hz+(Math.random()-0.5)*260;f.wk=Math.random()<0.4?3:0;}tx=f.gx??f.x;tz=f.gz??f.z;sp=Math.hypot(tx-f.x,tz-f.z)>6?42:0;if(!sp&&f.wk>0){f.wk-=dt;pose='gather';}}
    const dx=tx-f.x,dz=tz-f.z,d=Math.hypot(dx,dz);if(d>3&&sp>0){const nx=f.x+dx/d*Math.min(d,sp*dt),nz=f.z+dz/d*Math.min(d,sp*dt);if(wdAt(nx,nz)<=0.5&&wIn(nx,nz,0.98)){f.x=nx;f.z=nz;}else f.t=0;f.ry=Math.atan2(dx,dz);pose=pose==='chop'?pose:sp>80?'run':'walk';f.g=(f.g||0)+dt*(sp>80?2:1.4);}
    f.y=groundY(f.x,f.z,f.y+10);f.o.visible=dP<1800;if(!f.o.visible)continue;f.o.position.set(f.x,f.y,f.z);f.o.rotation.y=lerpAng(f.o.rotation.y,f.ry||0,Math.min(1,dt*8));
    if(K3.char2Pose&&f.rig&&dP<800){try{K3.char2Pose(f.rig,pose==='gather'?'idle':pose,pose==='walk'||pose==='run'?f.g:pose==='chop'?1-(f.atkT||0)/1.4:G.t+f.ph,f.tl.spear?{tool:'spear'}:{});}catch(e){}}}}
{const _ft=foesTick;foesTick=function(dt){if(!G.foes)return _ft.apply(this,arguments);const mine=[],rest=[];for(const f of G.foes)(f.lone?mine:rest).push(f);if(!mine.length&&TL.seq===0)return _ft.apply(this,arguments);
    G.foes=rest;try{_ft.apply(this,arguments);}finally{const keep=G.foes;try{tlTick(mine,dt);}catch(e){if(!TL.err){TL.err=1;console.warn('thổ dân lẻ',e);}}G.foes=keep.concat(mine.filter(f=>!f.gone));}
    try{if(G.t-TL.last>600){TL.last=G.t;if(G.foes.filter(f=>f.lone&&f.alive).length<TL.n)tlSpawn(Math.random,1400);}}catch(e){}};}
// bắt được thì giữ đúng sở trường
{const _dc=danCapture;danCapture=function(foe){const r=_dc.apply(this,arguments);try{if(r&&foe&&foe.lone&&foe.sp0&&S.folk&&S.folk.length){const f=S.folk[S.folk.length-1];f.sp=foe.sp0;f.from=foe.n;}}catch(e){}return r;};}
// tên, lời nhắc khi nhắm vào
{const _ti=targetInfo;targetInfo=function(t){const r=_ti.apply(this,arguments);try{if(r&&t&&t.type==='foe'&&t.a&&t.a.lone){r.name='Cấp '+t.a.lv+' · '+t.a.n+(t.a.prov?'':' (không gây sự)');if(!(invCount('rope')>0&&freeBed()))r.warn='Mang dây thừng và có chỗ ngủ trống thì bắt sống được';}}catch(e){}return r;};}
// Tự làm: thổ dân lẻ chưa bị chọc thì không phải thứ cần chạy
{const _ap=aqPred;aqPred=function(){const L=_ap.apply(this,arguments);try{return L.filter(p=>!(p.a&&p.a.lone&&!p.a.prov));}catch(e){return L;}};}
