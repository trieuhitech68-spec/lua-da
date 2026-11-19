/* ===================== thukhon: VẬT NUÔI KHÔN HƠN =====================
   Trước: chó chỉ biết chạy theo sau lưng; gà, lợn, dê đi lung tung từng con một quanh chuồng.
   CHÓ có ba việc, chạm vào chó để đổi (mặc định TRÔNG NHÀ):
     🏠 Trông nhà : đi tuần quanh nhà, ngửi đất, ngồi nghỉ, đêm nằm ngủ gần chỗ ngủ của chủ; thấy thú dữ / kẻ địch tới gần nhà thì SỦA BÁO (có dòng báo hướng), lao ra đuổi cắn;
                    chủ đi xa về thì chạy ra mừng; đói thì tự đi bắt thỏ, gà rừng quanh làng.
     🐾 Đi theo   : như trước (theo sát chủ, cắn thú dữ lao vào chủ).
     🦴 Đi săn    : ra quanh làng săn thỏ, gà rừng, khỉ; bắt được thì tha thịt về cất vào giỏ / rương gần nhà.
   GIA SÚC, GIA CẦM: đi theo đàn (cả đàn cùng dạt về một bãi rồi mới tản ra), cúi gặm cỏ / mổ thóc, tối về chuồng đứng yên ngủ, thấy chủ lại gần thì ngoảnh nhìn.
   Lưu: p.job ('nha' | 'theo' | 'san'), p.jv=1 (đã chuyển cách cũ). p.stay giữ đồng bộ để các bảng cũ (Chuồng thú, gọi thú về) vẫn đúng. */
const THK={JOB:{nha:['🏠','Trông nhà','đi tuần quanh nhà, sủa báo và đuổi thú dữ, đói thì tự đi kiếm mồi'],theo:['🐾','Đi theo','theo sát bạn, cắn thú dữ lao vào bạn'],san:['🦴','Đi săn','săn thỏ, gà rừng quanh làng, tha thịt về giỏ']},herd:{},warnT:-99,greetT:-99};
const tkDog=p=>p&&(p.k==='dog'||p.k==='puppy');
function tkJob(p){if(!p.jv){p.jv=1;p.job='nha';p.stay=true;if(p.hx==null){p.hx=p.x;p.hz=p.z;}}/* bảng cũ đổi p.stay thì theo đó */if(p.stay===false&&p.job!=='theo')p.job='theo';else if(p.stay===true&&p.job==='theo')p.job='nha';if(!THK.JOB[p.job])p.job='nha';return p.job;}
function tkSet(p,job){if(!THK.JOB[job])return;p.jv=1;p.job=job;p.stay=job!=='theo';p.hx=p.x;p.hz=p.z;p._st=null;const J=THK.JOB[job];try{sfx('bark');}catch(e){}uiToast(`🐕 ${J[0]} ${J[1]}: ${J[2]}.`,'');save();}
function tkHome(p){let h=null;try{h=homePos();}catch(e){}return h||{x:p.hx!=null?p.hx:p.x,z:p.hz!=null?p.hz:p.z};}
const tkNight=()=>{const h=S.hour;return h>=21||h<5;};
/* thú dữ / kẻ địch gần nhà hoặc gần con chó */
function tkThreat(p,home){let best=null,bd=1e9;for(const a of G.animals||[]){if(!a.alive||a.tame>0)continue;const D=ANIMALS[a.kind];if(!D)continue;const bad=a.angry||a.state==='chase'||(D.aggro&&D.aggro!=='never'&&D.aggro!=='defend'&&(D.dmg||0)>=9);if(!bad)continue;const dh=Math.hypot(a.x-home.x,a.z-home.z),dd=Math.hypot(a.x-p.x,a.z-p.z);if(dh>300&&dd>170)continue;if(dd<bd){bd=dd;best=a;}}
  for(const f of G.foes||[]){if(!f.alive)continue;const dh=Math.hypot(f.x-home.x,f.z-home.z),dd=Math.hypot(f.x-p.x,f.z-p.z);if(dh>340&&dd>170)continue;if(dd<bd){bd=dd;best=f;}}return best;}
function tkPrey(p,home){let best=null,bd=1e9;for(const a of G.animals||[]){if(!a.alive||a.tame>0||a.boss)continue;const D=ANIMALS[a.kind];if(!D||D.aggro!=='never'||(D.hp||9)>2)continue;if(Math.hypot(a.x-home.x,a.z-home.z)>650)continue;const dd=Math.hypot(a.x-p.x,a.z-p.z);if(dd<bd){bd=dd;best=a;}}return best;}
/* cất mồi: giỏ / rương gần nhà còn chỗ → túi của chủ nếu chủ ở gần → rơi mất */
function tkStore(home,items){let where='';const L=[];for(const b of S.builds){if(b.prog!=null||b.k==='trough')continue;const d=pieceDef(b.k);if(d&&d.store&&S.store[b.id]&&Math.hypot(b.x-home.x,b.z-home.z)<240)L.push(b);}
  for(const k in items){let n=items[k];for(const b of L){if(n<=0)break;const left=slotsAdd(S.store[b.id],k,n);if(left<n)where=pieceDef(b.k).n.toLowerCase();n=left;}if(n>0&&Math.hypot(P.x-home.x,P.z-home.z)<260){const left=invAdd(k,n);if(left<n)where=where||'túi của bạn';n=left;}}return where;}
function tkDogTick(p,dt){const o=p._o,R=p._rig||{},home=tkHome(p),pup=p.k==='puppy',job=tkJob(p);let st=p._st;if(!st)st=p._st={m:'idle',t:0,cd:G.t+20+Math.random()*40,scan:0,far:0};
  const dP=Math.hypot(P.x-p.x,P.z-p.z);let tx=p.x,tz=p.z,sp=0,pose='stand';
  /* mối nguy */st.scan-=dt;if(st.scan<=0){st.scan=0.4;const th=tkThreat(p,home);if(th){if(st.m!=='alert'){st.m='alert';st.t=0;}st.a=th;}else if(st.m==='alert'){st.m='idle';st.t=1;}}
  if(dP>460)st.far=1;else if(st.far&&dP<240&&st.m!=='alert'&&st.m!=='hunt'&&st.m!=='fetch'){st.far=0;st.m='greet';st.t=0;}
  if(st.m==='alert'){const a=st.a;if(!a||!a.alive||Math.hypot(a.x-home.x,a.z-home.z)>460){st.m='idle';st.t=1;}else{tx=a.x;tz=a.z;sp=pup?120:178;const d=Math.hypot(a.x-p.x,a.z-p.z);
      if(d<(a.r||9)+14){sp=0;pose='bite';if(G.t-(p._bite||0)>1.2){p._bite=G.t;try{if((G.foes||[]).includes(a))foeDamage(a,pup?0.4:1);else animalDamage(a,pup?0.5:1.5);}catch(e){}}}
      if(G.t-(p._bark||0)>1.8){p._bark=G.t;try{if(dP<700)sfx('bark');}catch(e){}}
      if(G.t-THK.warnT>25){THK.warnT=G.t;const nm=(a.n||(ANIMALS[a.kind]&&ANIMALS[a.kind].n)||'thú dữ').toLowerCase();uiToast(`🐕 Chó sủa dữ: có ${nm} ${Math.hypot(a.x-home.x,a.z-home.z)<340?'gần nhà':'gần đây'}, ${typeof tvFar==='function'?tvFar(a.x,a.z):''}!`,'bad');}}}
  if(st.m==='greet'){tx=P.x;tz=P.z;sp=165;if(dP<38){sp=0;pose='wag';st.t+=dt;if(st.t>3.2){st.m='idle';st.t=2;}if(G.t-THK.greetT>150){THK.greetT=G.t;uiToast('🐕 Chó chạy ra vẫy đuôi mừng bạn về.','');try{sfx('bark');}catch(e){}}}else if(dP>320){st.m='idle';st.t=1;}}
  if(st.m==='hunt'){const a=st.a;st.t+=dt;if(!a||!a.alive||st.t>26){st.m='idle';st.t=1;st.cd=G.t+60;}else{tx=a.x;tz=a.z;sp=188;if(Math.hypot(a.x-p.x,a.z-p.z)<(a.r||6)+10){/* bắt được: con mồi biến mất như bị săn, chó ngậm mồi chạy về */a.alive=false;a.dieT=0.001;a.back=TNOW()+1+Math.random();try{sfx('thud');puff(a.x,a.y+10,a.z,'#c0392b',4);}catch(e){}
          const D=ANIMALS[a.kind]||{},c={meat:1};if(D.drop&&D.drop.feather)c.feather=1;else if(D.drop&&D.drop.hide&&Math.random()<0.5)c.hide=1;st.carry=c;st.who=(D.n||'con mồi').toLowerCase();st.m='fetch';st.t=0;}}}
  if(st.m==='fetch'){tx=home.x+18;tz=home.z+18;sp=125;st.t+=dt;if(Math.hypot(tx-p.x,tz-p.z)<26||st.t>40){const w=tkStore(home,st.carry||{});p.fed=TNOW();uiToast(w?`🐕 Chó bắt được ${st.who}, tha về cất vào ${w}: ${Object.entries(st.carry).map(([k,v])=>v+' '+(ITEMS[k]?ITEMS[k].n.toLowerCase():k)).join(', ')}.`:`🐕 Chó bắt được ${st.who} và ăn no rồi (không còn chỗ cất).`,w?'gold':'');try{cnt('cnt','doghunt');}catch(e){}st.carry=null;st.m='idle';st.t=3;st.cd=G.t+(job==='san'?150:420);save();}}
  if(st.m==='idle'||st.m==='walk'||st.m==='sniff'||st.m==='sit'||st.m==='sleep'){
    /* tự đi kiếm mồi: đang ở việc Đi săn, hoặc Trông nhà mà đói */
    if(!pup&&G.t>st.cd&&!tkNight()&&(job==='san'||TNOW()-(p.fed||0)>0.6)){const a=tkPrey(p,home);if(a){st.m='hunt';st.a=a;st.t=0;}else st.cd=G.t+90;}
    if(st.m==='hunt'){/* vừa nhận mồi: lượt sau mới đuổi */}
    else if(st.m==='sleep'){pose='sleep';if(!tkNight())st.m='idle';}
    else if(st.m==='walk'){tx=st.wx;tz=st.wz;sp=pup?62:52;st.t-=dt;if(Math.hypot(tx-p.x,tz-p.z)<8||st.t<=0){const r=Math.random();st.m=r<0.45?'sniff':r<0.8?'sit':'idle';st.t=st.m==='sit'?5+Math.random()*7:2+Math.random()*3;}}
    else{pose=st.m==='sniff'?'sniff':st.m==='sit'?'sit':'stand';st.t-=dt;if(st.t<=0){if(tkNight()&&Math.hypot(p.x-home.x,p.z-home.z)<70){st.m='sleep';}else{/* điểm tuần kế tiếp: vòng quanh nhà; đêm thì về sát nhà */const a=Math.random()*6.283,r=tkNight()?20+Math.random()*30:(job==='san'?90+Math.random()*160:55+Math.random()*120);let wx=home.x+Math.cos(a)*r,wz=home.z+Math.sin(a)*r;try{if(wdAt(wx,wz)>0.3){wx=home.x+Math.cos(a)*30;wz=home.z+Math.sin(a)*30;}}catch(e){}st.wx=wx;st.wz=wz;st.m='walk';st.t=25;}}}}
  /* đi */const dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz);if(d>3&&sp>0){const step=Math.min(d,sp*dt),nx=p.x+dx/d*step,nz=p.z+dz/d*step;let wet=0;try{wet=wdAt(nx,nz);}catch(e){}if(wet>2.5&&st.m!=='greet'){st.t=0;if(st.m==='hunt'){st.m='idle';st.cd=G.t+60;}sp=0;}else{p.x=nx;p.z=nz;p._ry=Math.atan2(dx,dz);}}else sp=0;
  if(pose==='wag'||pose==='bite'||(pose==='stand'&&dP<90&&st.m!=='walk'))p._ry=pose==='bite'&&st.a?Math.atan2(st.a.x-p.x,st.a.z-p.z):Math.atan2(P.x-p.x,P.z-p.z);
  /* dáng */if(o.rotation.order!=='YXZ')o.rotation.order='YXZ';if(!st.H){try{const bx=new THREE.Box3().setFromObject(o);st.H=Math.max(6,bx.max.y-bx.min.y);}catch(e){st.H=14;}}const y=Math.max(hAt(p.x,p.z),waterAt(p.x,p.z)),lie=pose==='sleep',sit=pose==='sit';st.py=(st.py||0)+((lie?-0.42*st.H:sit?-0.16*st.H:pose==='wag'?Math.abs(Math.sin(G.t*9))*0.12*st.H:0)-(st.py||0))*Math.min(1,dt*5);st.px=(st.px||0)+((sit?-0.5:0)-(st.px||0))*Math.min(1,dt*5);
  o.position.set(p.x,y+st.py,p.z);o.rotation.y=lerpAng(o.rotation.y,p._ry||0,Math.min(1,dt*(sp>100?9:5)));o.rotation.x=st.px;
  const sw=Math.sin(G.t*(sp>100?15:9)+p._ph)*Math.min(0.75,sp/70),fold=lie?1.45:0;if(R.legFL){R.legFL.rotation.x=sw-(lie?fold:sit?-0.5:0);R.legBR.rotation.x=sw+(lie?fold:sit?1.35:0);R.legFR.rotation.x=-sw-(lie?fold:sit?-0.5:0);R.legBL.rotation.x=-sw+(lie?fold:sit?1.35:0);}
  if(R.head)R.head.rotation.x=lie?0.55:pose==='sniff'?0.75+Math.sin(G.t*7+p._ph)*0.1:pose==='bite'?0.25+Math.sin(G.t*14)*0.3:sp>1?0:Math.sin(G.t*1.1+p._ph)*0.18;if(R.head)R.head.rotation.y=(pose==='stand'||sit)&&dP>90?Math.sin(G.t*0.6+p._ph)*0.6:0;
  if(R.tail)R.tail.rotation.y=lie?0:Math.sin(G.t*(pose==='wag'?16:st.m==='alert'?3:dP<120?11:5)+p._ph)*(pose==='wag'?0.9:st.m==='alert'?0.15:dP<120?0.6:0.3);}
/* gia súc, gia cầm: bãi chung của đàn, tối về chuồng */
function tkHerd(p,dt){const h=(typeof tvHome==='function'&&tvHome(p))||(typeof petHome==='function'&&petHome(p))||null,cx=h?h.x:(p.hx!=null?p.hx:p.x),cz=h?h.z:(p.hz!=null?p.hz:p.z),key=p.k.replace(/^(chick)$/,'chicken').replace(/^piglet$/,'pig')+':'+Math.round(cx/60)+','+Math.round(cz/60);
  let H=THK.herd[key];if(!H||G.t>H.t){const a=Math.random()*6.283,r=14+Math.random()*(h&&h.shed?34:52);H=THK.herd[key]={x:cx+Math.cos(a)*r,z:cz+Math.sin(a)*r,t:G.t+16+Math.random()*22};}
  if(tkNight()){/* tối: về sát chuồng rồi đứng yên */if(Math.hypot(p.x-cx,p.z-cz)>20){if(Math.hypot((p._tx||0)-cx,(p._tz||0)-cz)>16){const a=p._ph||0;p._tx=cx+Math.cos(a)*9;p._tz=cz+Math.sin(a)*9;}p._t=1.5;}else{p._tx=p.x;p._tz=p.z;p._t=8;}return;}
  if(p._t<=dt+0.02){p._tx=H.x+(Math.random()-0.5)*40;p._tz=H.z+(Math.random()-0.5)*40;p._t=2.5+Math.random()*6.5;}}
function tkHerdAnim(p){const o=p._o,R=p._rig||{};if(!o||!R.head)return;const moved=Math.hypot(p.x-(p._qx!=null?p._qx:p.x),p.z-(p._qz!=null?p._qz:p.z))>0.02;p._qx=p.x;p._qz=p.z;if(moved)return;
  if(tkNight()){R.head.rotation.x=0.5;return;}const bird=/^(chicken|chick|duck)/.test(p.k),ph=p._ph||0,cyc=Math.sin(G.t*0.45+ph*3);
  /* đứng yên: phần lớn thời gian cúi gặm cỏ / mổ thóc, thỉnh thoảng ngẩng lên nhìn quanh; chủ lại gần thì ngoảnh nhìn */
  const dP=Math.hypot(P.x-p.x,P.z-p.z);if(dP<75&&cyc<0.3&&!bird){o.rotation.y=lerpAng(o.rotation.y,Math.atan2(P.x-p.x,P.z-p.z),0.08);R.head.rotation.x=0.05;return;}
  R.head.rotation.x=cyc>-0.25?(bird?0.85+Math.max(0,Math.sin(G.t*8+ph))*0.35:0.8+Math.sin(G.t*3+ph)*0.08):Math.sin(G.t*1.2+ph)*0.15;if(R.head.rotation.y!==undefined)R.head.rotation.y=cyc>-0.25?0:Math.sin(G.t*0.9+ph)*0.5;}
{const _pt=petsTick;petsTick=function(dt){if(!S||!S.pets||!S.pets.length)return _pt.apply(this,arguments);const all=S.pets,mine=[],rest=[];for(const p of all){if(tkDog(p)&&tkJob(p)!=='theo')mine.push(p);else rest.push(p);}
    try{for(const p of rest)if(!tkDog(p)&&!p.hitch)tkHerd(p,dt);}catch(e){if(!THK.e1){THK.e1=1;console.warn('đàn vật nuôi',e);}}
    S.pets=rest;let r;try{r=_pt.apply(this,arguments);}finally{/* nơi khác có thể thêm bớt vật nuôi trong lúc chạy: ghép lại danh sách */const now=S.pets;S.pets=now===rest?all:now.concat(mine.filter(p=>!now.includes(p)));}
    try{for(const p of mine){if(!S.pets.includes(p))continue;if(!p._o)petSpawn(p);tkDogTick(p,dt);}
      /* chó không đứng chồng lên nhau, lên vật nuôi khác */for(const p of mine)for(const q of S.pets){if(q===p||q._o==null)continue;const dx=p.x-q.x,dz=p.z-q.z,d=Math.hypot(dx,dz),min=tkDog(q)?16:13;if(d<min){const k=(min-d)*0.5,ux=d>0.01?dx/d:Math.cos(p.id||1),uz=d>0.01?dz/d:Math.sin(p.id||1);p.x+=ux*k;p.z+=uz*k;if(p._o)p._o.position.x=p.x,p._o.position.z=p.z;}}for(const p of rest)if(!tkDog(p)&&!p.hitch)tkHerdAnim(p);}catch(e){if(!THK.e2){THK.e2=1;console.warn('chó khôn',e);}}return r;};}
/* ---------- CHIẾN THÚ ĐANG NGHỈ: canh nhà ----------
   Con không xuất chiến trước chỉ là hình đứng yên ở chuồng. Giờ chúng đi lại quanh chỗ nằm, đêm nằm ngủ; thú dữ / kẻ địch tới gần nhà thì gầm lên lao ra cắn (đòn theo cấp của con thú). */
function thkBeasts(dt){if(typeof SL3!=='object'||!SL3.rest||!SL3.rest.size||typeof ltS!=='function')return;const L=ltS().list;
  for(const [k,o] of SL3.rest){let st=o.userData.thk;if(!st){st=o.userData.thk={hx:o.position.x,hz:o.position.z,x:o.position.x,z:o.position.z,m:'idle',t:1+Math.random()*4,scan:Math.random(),ph:Math.random()*6,ry:o.rotation.y,py:0};if(o.rotation.order!=='YXZ')o.rotation.order='YXZ';}
    const R=o.userData.rig||{},pid=+String(k).split(':')[0],p=L.find(x=>x.id===pid),lv=(p&&p.lv)||1,home={x:st.hx,z:st.hz};let tx=st.x,tz=st.z,sp=0,pose='stand';
    st.scan-=dt;if(st.scan<=0){st.scan=0.5;const th=tkThreat(st,home);if(th){st.m='alert';st.a=th;}else if(st.m==='alert'){st.m='idle';st.t=1;}}
    if(st.m==='alert'){const a=st.a;if(!a||!a.alive||Math.hypot(a.x-st.hx,a.z-st.hz)>480){st.m='idle';st.t=1;}else{tx=a.x;tz=a.z;sp=205;if(Math.hypot(a.x-st.x,a.z-st.z)<(a.r||9)+18){sp=0;pose='bite';if(G.t-(st.bite||0)>1.1){st.bite=G.t;try{if((G.foes||[]).includes(a))foeDamage(a,1.5+0.1*lv);else animalDamage(a,2+0.15*lv);}catch(e){}}}
        if(G.t-THK.warnT>25){THK.warnT=G.t;const nm=(a.n||(ANIMALS[a.kind]&&ANIMALS[a.kind].n)||'thú dữ').toLowerCase();uiToast(`🐯 ${p?esc(p.n):'Chiến thú'} gầm lên lao ra: có ${nm} gần nhà, ${typeof tvFar==='function'?tvFar(a.x,a.z):''}!`,'bad');try{sfx('roar');}catch(e){}}}}
    if(st.m==='idle'){pose=tkNight()?'sleep':'stand';st.t-=dt;if(st.t<=0&&!tkNight()){const a=Math.random()*6.283,r=14+Math.random()*46;st.wx=st.hx+Math.cos(a)*r;st.wz=st.hz+Math.sin(a)*r;try{if(wdAt(st.wx,st.wz)>0.3){st.wx=st.hx;st.wz=st.hz;}}catch(e){}st.m='walk';st.t=20;}}
    else if(st.m==='walk'){tx=st.wx;tz=st.wz;sp=46;st.t-=dt;if(Math.hypot(tx-st.x,tz-st.z)<8||st.t<=0){st.m='idle';st.t=4+Math.random()*9;}}
    const dx=tx-st.x,dz=tz-st.z,d=Math.hypot(dx,dz);if(d>3&&sp>0){const step=Math.min(d,sp*dt);st.x+=dx/d*step;st.z+=dz/d*step;st.ry=Math.atan2(dx,dz);}else sp=0;if(pose==='bite'&&st.a)st.ry=Math.atan2(st.a.x-st.x,st.a.z-st.z);
    const lie=pose==='sleep',sc=o.scale.y||1;st.py+=((lie?-3.4*sc:0)-st.py)*Math.min(1,dt*4);o.position.set(st.x,Math.max(hAt(st.x,st.z),waterAt(st.x,st.z))+st.py,st.z);o.rotation.y=lerpAng(o.rotation.y,st.ry,Math.min(1,dt*(sp>100?9:4)));
    const sw=Math.sin(G.t*(sp>100?14:8)+st.ph)*Math.min(0.75,sp/70);if(R.legFL){R.legFL.rotation.x=sw-(lie?1.2:0);R.legBR.rotation.x=sw+(lie?1.2:0);R.legFR.rotation.x=-sw-(lie?1.2:0);R.legBL.rotation.x=-sw+(lie?1.2:0);}
    if(R.head)R.head.rotation.x=lie?0.5:pose==='bite'?0.2+Math.sin(G.t*13)*0.3:sp>1?0:Math.sin(G.t*0.9+st.ph)*0.2;if(R.tail)R.tail.rotation.y=lie?0:Math.sin(G.t*(st.m==='alert'?7:2.5)+st.ph)*0.35;}}
{const _pt=petsTick;petsTick=function(dt){const r=_pt.apply(this,arguments);try{thkBeasts(dt);}catch(e){if(!THK.e3){THK.e3=1;console.warn('chiến thú canh nhà',e);}}return r;};}
/* ---------- THÚ CƯỠI (ngựa, voi): tự tìm về, gọi được từ bất cứ đâu trên đại lục ----------
   · Đại lục không có "cổng vùng": mọi thú cưỡi đều thuộc vùng đang đứng (trước con thu phục ở tỉnh khác bị coi là "ở vùng đất khác": không hiện, không có nút gọi).
   · Thú cưỡi rảnh bị bỏ lại xa (chủ đã đi cách nó hơn 900, nó cách làng hơn 500) quá một phút thì tự tìm về làng đứng chờ. */
function thkMounts(){try{if(typeof G!=='object'||!G.on||!S||!Array.isArray(S.mounts)||!S.mounts.length||G.paused)return;const here=S.land||'c';
    if(S.dl)for(const m of S.mounts)if((m.land||'c')!==here&&m.x!=null){m.land=here;try{if(typeof mtShow==='function')mtShow(m);}catch(e){}}
    const hp=typeof homePos==='function'&&homePos();if(!hp)return;
    for(const m of S.mounts){if(G.mnt===m||m.sol!=null||(m.land||'c')!==here||m.x==null)continue;const dH=Math.hypot(m.x-hp.x,m.z-hp.z),dPl=Math.hypot(m.x-P.x,m.z-P.z);if(dH<500||dPl<900){m._away=0;continue;}m._away=(m._away||0)+1;if(m._away<6)continue;m._away=0;
      let sx=hp.x+40,sz=hp.z+40;try{if(typeof sl3Spot==='function'){const q=sl3Spot(hp.x+40,hp.z+40,m,40);if(q){sx=q[0];sz=q[1];}}else{const a=(m.id*2.4)%6.283;sx=hp.x+Math.cos(a)*70;sz=hp.z+Math.sin(a)*70;}}catch(e){}
      m.x=+sx.toFixed(1);m.z=+sz.toFixed(1);const o=typeof MT==='object'&&MT.o.get(m.id);if(o)o.position.set(m.x,hAt(m.x,m.z),m.z);uiToast((m.k==='elephant'?'🐘 ':'🐎 ')+esc(m.n||'Thú cưỡi')+' đã tự tìm đường về làng.','');save();}}catch(e){}}
setInterval(thkMounts,10000);
/* chạm vào chó: đổi việc */
{const _pi=petInfo;petInfo=function(p){if(!tkDog(p))return _pi.apply(this,arguments);const job=tkJob(p),K=Object.keys(THK.JOB),nx=THK.JOB[K[(K.indexOf(job)+1)%K.length]],r=_pi.apply(this,arguments);r.name=(PETN[p.k]||'Chó')+' · '+THK.JOB[job][0]+' '+THK.JOB[job][1];r.verb='Đổi việc: '+nx[1];return r;};}
{const _pu=petUse;petUse=function(p){if(!tkDog(p))return _pu.apply(this,arguments);const K=Object.keys(THK.JOB);tkSet(p,K[(K.indexOf(tkJob(p))+1)%K.length]);};}
if(typeof HD_L!=='undefined')HD_L.push({id:'thukhon',ic:'🐕',t:'Chó và vật nuôi',w:()=>!!(S.pets&&S.pets.some(tkDog)),p:['Chó của bạn giờ có <b>ba việc</b>, chạm vào chó để đổi: <b>🏠 Trông nhà</b> (mặc định), <b>🐾 Đi theo</b>, <b>🦴 Đi săn</b>.','<b>Trông nhà</b>: chó đi tuần quanh nhà, đêm nằm ngủ gần chỗ bạn ngủ. Thú dữ hay kẻ địch tới gần là chó <b>sủa báo</b> (có dòng báo hướng) rồi lao ra đuổi cắn. Đói thì tự đi bắt thỏ, gà rừng.','<b>Đi săn</b>: chó ra quanh làng săn thỏ, gà rừng, khỉ và <b>tha thịt về cất vào giỏ, rương</b> gần nhà. Gà, lợn, dê thì đi theo đàn, tối tự về chuồng.']});
/* bảng 🐾: nói rõ con đang nghỉ làm gì và gợi ý dựng chuồng */
if(typeof ltHtml==='function'){const _h=ltHtml;ltHtml=function(){let h=_h.apply(this,arguments);try{const L=ltS(),rest=L.list.filter(p=>p.id!==L.act).length;if(rest){const den=typeof qhHas==='function'&&qhHas('qh_chuongthu');h=`<div class="tv-box"><div class="tv-r"><span>🛡️ <b>${rest}</b> chiến thú không xuất chiến đang <b>canh nhà</b>: đi lại quanh ${den?'chuồng thú chiến':'chỗ ngủ của bạn'}, thú dữ hay kẻ địch tới gần là lao ra cắn.${den?'':' Dựng <b>Chuồng thú chiến</b> (Xây → Quy hoạch làng → Quân sự) để chúng có chỗ nằm riêng.'}</span></div></div>`+h;}}catch(e){}return h;};}
/* mỗi con chó một màu lông (theo số thứ tự của nó): vàng, đen xám, vện nâu, trắng kem → nhìn là phân biệt được từng con */
{const _ps=petSpawn;petSpawn=function(p){const r=_ps.apply(this,arguments);try{if(tkDog(p)&&p._o){const T=[[1,1,1],[0.42,0.4,0.42],[0.78,0.58,0.44],[1.22,1.2,1.16]][(p.id|0)%4];if(T[0]!==1||T[1]!==1)p._o.traverse(m=>{if(m.isMesh&&m.material&&m.material.color){m.material=m.material.clone();m.material.color.setRGB(Math.min(1.3,m.material.color.r*T[0]),Math.min(1.3,m.material.color.g*T[1]),Math.min(1.3,m.material.color.b*T[2]));}});}}catch(e){}return r;};}
/* vòng cổ cho chó, màu theo việc đang giao: đỏ = trông nhà, lam = đi theo, lục = đi săn (nhìn là biết con nào làm gì) */
const THK_COL={nha:0xc0392b,theo:0x2f7fd0,san:0x3f9a4a};
{const _ps=petSpawn;petSpawn=function(p){const r=_ps.apply(this,arguments);try{if(tkDog(p)&&p._o&&!p._o.userData.collar){const o=p._o;o.updateMatrixWorld(true);const bx=new THREE.Box3().setFromObject(o),k=Math.max(0.2,(bx.max.y-bx.min.y)/19.7)/(o.scale.y||1),m=new THREE.Mesh(new THREE.TorusGeometry(2.15*k,0.48*k,6,14),new THREE.MeshLambertMaterial({color:THK_COL[tkJob(p)]||THK_COL.nha}));m.position.set(0,13.5*k,6.5*k);m.rotation.x=-0.75;m.frustumCulled=false;o.add(m);o.userData.collar=m;const tag=new THREE.Mesh(new THREE.SphereGeometry(0.6*k,6,5),new THREE.MeshLambertMaterial({color:0xe6b422}));tag.position.set(0,11.6*k,8.4*k);o.add(tag);}}catch(e){}return r;};}
setInterval(()=>{try{if(typeof G!=='object'||!G.on||!S||!S.pets)return;for(const p of S.pets){if(!tkDog(p)||!p._o||!p._o.userData.collar)continue;const c=THK_COL[tkJob(p)]||THK_COL.nha,m=p._o.userData.collar.material;if(m.color.getHex()!==c)m.color.setHex(c);}}catch(e){}},1200);
