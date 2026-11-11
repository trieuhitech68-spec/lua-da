/* ===================== CƯỚP PHÁ GIỮA NGƯỜI CHƠI (thế giới chung) =====================
   Công trình của người KHÔNG cùng liên minh phá được để cướp vật liệu. Không đồng thời hai máy: người đi cướp ghi "biên bản", máy của chủ nhà
   đọc biên bản khi họ vào game rồi tự áp hậu quả (mỗi người vẫn chỉ ghi tài liệu của chính mình).
   LUẬT
     · Người đi cướp phải là nhân vật cấp 5 trở lên. Không cướp đồng minh, không cướp người dưới cấp 5, không cướp người đang có khiên.
     · Lại gần công trình của họ, bấm Hành động → "Phá": mất vài giây tuỳ loại (rào cọc, tường đá, chòi canh lâu nhất) và vũ khí đang cầm.
       Phá xong được 35% vật liệu dựng nên nó; phá đồ chứa (giỏ, rương, chum…) được thêm chiến lợi phẩm.
     · Chủ nhà có PHÒNG THỦ: số người "Giữ cổng", "Canh gác", "Lính" của họ (tối đa 6) hiện ra thành lính gác ngay khi mình động vào nhà họ,
       mạnh theo cấp trung bình của những người đó. Rào cọc và chòi canh của họ làm lính gác trâu hơn.
     · Mỗi ngày thật chỉ phá được tối đa 25 món của cùng một người. Đi cướp thì mất khiên của chính mình.
     · Chòi canh của họ bắn tên, hố chông gây thương; mang Cây húc cổng thì phá tường rào nhanh gấp 3 (xem cuối tệp).
     · Chủ nhà: món bị phá trở thành công trình dang dở (phải đóng lại, không tốn thêm vật liệu); đồ chứa bị phá mất 30% đồ bên trong.
       Sau khi bị cướp được khiên bảo vệ 12 giờ thật. Có bảng "Nhật ký cướp phá" trong 🤝 Liên minh → Lãnh thổ.
   DỮ LIỆU: biên bản nằm trong sites/<uid>.R = {<uid nạn nhân>:{at, ids:[mã công trình…]}} (ghi chung với tài liệu điểm tài nguyên, không cần SQL mới).
            players/<uid> thêm df:[số lính, cấp TB, số công trình thủ], sh: hạn khiên (ms), hl: cấp nhân vật.
   Mọi thứ đọc từ người khác đều kiểm kiểu, kẹp giá trị; biên bản chỉ có tác dụng với công trình thật sự tồn tại và trong hạn mức mỗi ngày. */
const PVP={near:null,nearT:0,spawned:{},pubT:0,pubK:'',inK:''};
const PVP_SHIELD=12*3600000,PVP_DAY=24*3600000,PVP_MAXDAY=25,PVP_MINLV=5,PVP_KEEP=7*86400000;
function pvpS(){if(!S.pvp||typeof S.pvp!=='object')S.pvp={};const p=S.pvp;if(!p.out||typeof p.out!=='object')p.out={};if(!p.seen||typeof p.seen!=='object')p.seen={};if(!Array.isArray(p.log))p.log=[];if(!(p.sh>0))p.sh=0;return p;}
const pvpOn=()=>typeof mpOn==='function'&&mpOn()&&!!MP.uid;
const pvpNow=()=>Date.now()+(typeof WC==='object'?WC.off||0:0);
function pvpHp(def,k){if(/palisade|watchtower|rampart|stoneWall|dryStoneWall|rammed/i.test(k))return 42;if(/Wall|wall|gate|Gate|fence|Fence/.test(k))return 22;if(def.store)return 14;if(k==='totem'||/totem/i.test(k))return 30;if(def.kind==='floor')return 18;if(def.kind==='roof')return 12;return 13;}
// vì sao KHÔNG cướp được (null = được)
function pvpWhy(uid){if(!pvpOn())return 'Chỉ có ở thế giới chung.';if(typeof mpSameClan==='function'&&mpSameClan(uid))return 'Công trình của đồng minh.';if((typeof heroLv==='function'?heroLv():1)<PVP_MINLV)return `Cần nhân vật cấp ${PVP_MINLV} mới đi cướp phá được.`;
  const p=MP.players[uid],now=pvpNow();if(p){if((p.hl||1)<PVP_MINLV)return 'Chủ nhà là người mới (dưới cấp '+PVP_MINLV+'): đang được bảo vệ.';if(p.sh>now)return `Chủ nhà đang có khiên bảo vệ, còn ${Math.max(1,Math.ceil((p.sh-now)/3600000))} giờ.`;}
  const o=pvpS().out[uid];if(o&&now-o.at<PVP_DAY&&o.ids.length>=PVP_MAXDAY)return 'Hôm nay bạn đã phá đủ '+PVP_MAXDAY+' món của nhà này.';return null;}
/* ---------- tìm công trình của người khác ở gần ---------- */
function pvpNearScan(){PVP.nearT=G.t;PVP.near=null;if(!pvpOn()||!MP.bcur||!MP.bcur.size)return;let bd=REACH+12;for(const [uid,cur] of MP.bcur){for(const o of cur.values()){const b=o.b;if(Math.abs(b.x-P.x)>90||Math.abs(b.z-P.z)>90||Math.abs((b.y||0)-P.y)>60)continue;const def=pieceDef(b.k);if(!def||!BYID.has(b.id))continue;
      const d=Math.hypot(b.x-P.x,b.z-P.z)-(def.fp?Math.max(def.fp[0],def.fp[1])*12:14);if(d<bd){bd=d;PVP.near={type:'pvpb',b,def,d,uid};}}}}
{const _ft=findTarget;findTarget=function(){const r=_ft.apply(this,arguments);if(!S||!S.mp||G.work||G.sit)return r;if(G.t-PVP.nearT>0.3)pvpNearScan();const n=PVP.near;if(n&&(!r||(r.type!=='animal'&&r.type!=='foe'&&r.type!=='npc'&&r.type!=='folk'&&(r.d==null||n.d<r.d-4))))return n;return r;};}
{const _ti=targetInfo;targetInfo=function(t){if(t&&t.type==='pvpb'){const why=pvpWhy(t.uid),nm=typeof mpName==='function'?mpName(t.uid):'người khác';return {name:t.def.n+' · của '+nm,verb:why?why:'Phá (cướp vật liệu)',ok:!why,need:why||null,icon:'club'};}return _ti.apply(this,arguments);};}
{const _as=actStart;actStart=function(t){if(t&&t.type==='pvpb'&&!G.work){pvpStart(t);return;}return _as.apply(this,arguments);};}
/* ---------- phá ---------- */
function pvpStart(t){const why=pvpWhy(t.uid);if(why){uiToast(why,'bad');sfx('no');return;}{const ng=needGate(true);if(ng){uiToast(ng,'bad');sfx('no');return;}}
  const b=t.b,def=t.def,pow=(typeof fistPow==='function'?fistPow():0.8)*(1+0.03*(typeof heroA==='function'?heroA('str'):0)),T=clamp(pvpHp(def,b.k)/(1.2+pow*0.7),2.5,22);
  try{pvpDefend(t.uid,b);}catch(e){console.warn('lính gác',e);}
  G.work={r:{out:{}},steps:[{n:'Phá '+def.n.toLowerCase()+' của '+mpName(t.uid),a:'hammer',t:T*0.6,fx:'thud'},{n:'Giật đổ, gom vật liệu',a:'gather',t:T*0.4,fx:'pick'}],i:0,t:0,left:1,done:0,x:P.x,z:P.z,sk:'build',icon:'club',fn:()=>pvpDestroy(t.uid,b,def)};workUi();}
const PVP_LOOT=[{rope:1,meatCooked:1},{plank:1,fiber:3},{grain:2,rope:1},{hide:1,stone:2},{fishCooked:1,clay:1}];
function pvpDestroy(uid,b,def){if(!BYID.has(b.id))return;const P0=pvpS(),now=pvpNow();let o=P0.out[uid];if(!o||now-o.at>PVP_DAY)o=P0.out[uid]={at:now,ids:[]};if(o.ids.length>=PVP_MAXDAY){uiToast('Hôm nay đã phá đủ món của nhà này.','bad');return;}
  const lid=+String(b.id).split('_')[1];if(!(lid>=0))return;if(!o.ids.includes(lid))o.ids.push(lid);o.at=now;
  // gỡ khỏi màn hình của mình (bản của chủ nhà sẽ tự cập nhật khi máy họ đọc biên bản)
  try{structRemove(b);const cur=MP.bcur.get(uid);if(cur){cur.delete(b.id);MP.rTot=Math.max(0,MP.rTot-1);}}catch(e){}
  const got={};for(const k in (def.cost||{})){const n=Math.floor(def.cost[k]*0.35+Math.random());if(n>0&&ITEMS[k])got[k]=n;}if(def.store){const L=PVP_LOOT[Math.floor(Math.random()*PVP_LOOT.length)];for(const k in L)if(ITEMS[k])got[k]=(got[k]||0)+L[k];}
  if(Object.keys(got).length)give(got,[b.x,(b.y||P.y)+20,b.z]);puff(b.x,(b.y||P.y)+16,b.z,'#a88a62',12);sfx('thud');addXp('hunt',3);cnt('cnt','pvp');
  if(P0.sh>now){P0.sh=0;uiToast('Bạn đã đi cướp phá: khiên bảo vệ của chính bạn mất hiệu lực.','');}
  uiToast(`⚔️ Đã phá ${def.n.toLowerCase()} của ${mpName(uid)} (${o.ids.length}/${PVP_MAXDAY} hôm nay).`,'gold');PVP.nearT=-9;pvpPrune();try{RL.mp.putT=0;RL.mp.last='';}catch(e){}save();}
function pvpPrune(){const P0=pvpS(),now=pvpNow();for(const u in P0.out)if(now-P0.out[u].at>PVP_KEEP)delete P0.out[u];const ks=Object.keys(P0.out).sort((a,b)=>P0.out[b].at-P0.out[a].at);ks.slice(10).forEach(u=>delete P0.out[u]);}
// biên bản gửi đi (realm.js ghép vào tài liệu sites/<uid>)
function pvpOut(){if(!S||!S.pvp||!S.pvp.out)return null;const R={};let n=0;for(const u in S.pvp.out){const o=S.pvp.out[u];if(!o||!Array.isArray(o.ids)||!o.ids.length)continue;R[u]={at:o.at,ids:o.ids.slice(0,40)};n++;}return n?R:null;}
/* ---------- lính gác của chủ nhà ---------- */
function pvpDefend(uid,b){if(PVP.spawned[uid]&&G.t-PVP.spawned[uid]<240)return;PVP.spawned[uid]=G.t;const p=MP.players[uid],df=p&&p.df;if(!df||!(df[0]>0))return;const n=clamp(df[0]|0,1,6),lv=clamp(df[1]|0||1,1,10),fort=clamp(df[2]|0,0,30);
  for(let i=0;i<n;i++){const a=i/n*6.283+Math.random(),x=b.x+Math.cos(a)*(60+Math.random()*40),z=b.z+Math.sin(a)*(60+Math.random()*40);if(wdAt(x,z)>0)continue;const f=foeSpawn(x,z,'guard');f.pvp=uid;f.noCap=1;f._lvA=1;f.lv=lv;f.n='Lính gác của '+mpName(uid);
    const k=(1+0.2*(lv-1))*(1+Math.min(0.6,fort*0.03));f.hp=FOE.hp*k;f.hp0=f.hp;f.dmg=FOE.dmg*(1+0.12*(lv-1));f.home={x:b.x,z:b.z};f.state='chase';}
  uiToast(`🛡️ ${n} lính gác của ${mpName(uid)} xông ra! (cấp ${lv})`,'bad');sfx('hurt');}
function pvpGuardsTick(L,dt){for(const f of L){if(!f.alive){if(f.dieT!=null){f.dieT+=dt;f.o.rotation.z=Math.min(1.5,f.dieT*2.5);if(f.dieT>4){G.sc.remove(f.o);f.gone=1;}}continue;}
    const H=f.home,dP=Math.hypot(P.x-f.x,P.z-f.z),dH=Math.hypot(P.x-H.x,P.z-H.z);if(dP>1500){G.sc.remove(f.o);f.gone=1;f.alive=false;continue;}let tx=f.x,tz=f.z,sp=0,pose='idle';
    if(dH<520&&!G.ride){tx=P.x;tz=P.z;sp=118;if(dP<f.r+16){sp=0;pose='chop';f.atkT=(f.atkT||0)-dt;if(f.atkT<=0){f.atkT=1.3;const d0=FOE.dmg;FOE.dmg=f.dmg||d0;try{foeHit(f,{x:P.x,z:P.z,pl:1});}finally{FOE.dmg=d0;}}}}
    else{tx=H.x+Math.sin(f.ph)*40;tz=H.z+Math.cos(f.ph)*40;sp=Math.hypot(tx-f.x,tz-f.z)>8?60:0;}
    const dx=tx-f.x,dz=tz-f.z,d=Math.hypot(dx,dz);if(d>3&&sp>0){f.x+=dx/d*Math.min(d,sp*dt);f.z+=dz/d*Math.min(d,sp*dt);f.ry=Math.atan2(dx,dz);if(pose!=='chop')pose=sp>80?'run':'walk';f.g=(f.g||0)+dt*(sp>80?2:1.4);}else if(pose==='chop')f.ry=Math.atan2(P.x-f.x,P.z-f.z);
    f.y=groundY(f.x,f.z,f.y+10);f.o.position.set(f.x,f.y,f.z);f.o.rotation.y=lerpAng(f.o.rotation.y,f.ry||0,Math.min(1,dt*8));
    if(K3.char2Pose&&f.rig&&dP<800){try{K3.char2Pose(f.rig,pose,pose==='walk'||pose==='run'?f.g:pose==='chop'?1-(f.atkT||0)/1.3:G.t+f.ph,{tool:'spear'});}catch(e){}}}}
{const _ft=foesTick;foesTick=function(dt){if(!G.foes||!G.foes.some(f=>f.pvp))return _ft.apply(this,arguments);const all=G.foes,mine=all.filter(f=>f.pvp);G.foes=all.filter(f=>!f.pvp);try{_ft.apply(this,arguments);}finally{try{pvpGuardsTick(mine,dt);}catch(e){}G.foes=G.foes.concat(mine.filter(f=>!f.gone));}};}
// lính gác bị hạ không tính vào quân số trại Núi Đá
{const _fd=foeDamage;foeDamage=function(f,dmg){const al=f&&f.alive,pv=f&&f.pvp,n0=S&&S.war?S.war.n:0;const r=_fd.apply(this,arguments);if(pv&&al&&!f.alive&&S&&S.war)S.war.n=n0;return r;};}
/* ---------- công khai phòng thủ, khiên, cấp ---------- */
function pvpPubTick(){if(!pvpOn()||!MP.me)return;const now=Date.now();if(now-PVP.pubT<30000)return;PVP.pubT=now;const P0=pvpS();const g=(S.folk||[]).filter(f=>f.job==='gate'||f.job==='guard'||f.job==='soldier');
  const lv=g.length?Math.round(g.reduce((s,f)=>s+(f.lv|0||1),0)/g.length):0;let fort=0;for(const b of S.builds)if(b.prog==null&&/palisade|watchtower|spikePit|rampart|SpikeFence/i.test(b.k))fort++;
  const df=[Math.min(6,g.length),lv,Math.min(30,fort)],sh=P0.sh>pvpNow()?Math.round(P0.sh):0,hl=typeof heroLv==='function'?heroLv():1,k=JSON.stringify([df,sh,hl]);if(k===PVP.pubK)return;PVP.pubK=k;mpSaveMe({df,sh,hl});}
/* ---------- nhận biên bản: áp hậu quả lên nhà mình ---------- */
function pvpIn(docs){if(!pvpOn()||!S)return;const P0=pvpS(),me=MP.uid,now=pvpNow();let hit=0,who=[];
  for(const d of docs){const u=d.id;if(u===me||!mpIdOk(u))continue;const v=d.data();if(!v||v.w!==S.seed||!v.R||typeof v.R!=='object')continue;const e=v.R[me];if(!e||typeof e!=='object'||!Array.isArray(e.ids)||!mpNum(e.at,1e12,now+600000))continue;if(now-e.at>PVP_KEEP)continue;
    if(typeof mpSameClan==='function'&&mpSameClan(u))continue;const sn=P0.seen[u]||(P0.seen[u]={at:0,ids:[]});if(e.at<sn.at-1)continue;if(e.at-sn.at>PVP_DAY)sn.ids=[];let n=0;
    for(const id of e.ids.slice(0,40)){if(!(typeof id==='number'&&id>=0&&Math.floor(id)===id)||sn.ids.includes(id))continue;if(sn.ids.length>=PVP_MAXDAY)break;sn.ids.push(id);const b=S.builds.find(x=>x.id===id);if(!b||b.prog!=null||!pieceDef(b.k))continue;
      const def=pieceDef(b.k);if(def.store&&S.store[b.id]){const st=S.store[b.id];for(let i=0;i<st.length;i++)if(st[i]){const t=Math.ceil(st[i].n*0.3);st[i].n-=t;if(st[i].n<=0)st[i]=null;}}
      b.prog=0.45;if(typeof STG!=='undefined'&&STG[b.k])b.paid=STG[b.k].length;if(b.cond!=null)b.cond=60;try{siteShow(b);}catch(_){}n++;}
    sn.at=Math.max(sn.at,e.at);if(n){hit+=n;who.push(mpName(u));P0.log.unshift({u,n,at:e.at});}}
  if(hit){P0.log=P0.log.slice(0,20);P0.sh=now+PVP_SHIELD;PVP.pubT=0;PVP.pubK='';uiToast(`⚔️ Nhà bạn bị ${who.slice(0,3).join(', ')} cướp phá ${hit} công trình! Chúng thành công trình dang dở: đóng lại là xong. Bạn được khiên bảo vệ 12 giờ.`,'bad');sfx('hurt');try{MP.bSig=null;}catch(e){}save();}}
function pvpTick(){if(!S||!G.on)return;try{pvpPubTick();}catch(e){}}
setInterval(pvpTick,5000);
/* ---------- bảng: nhật ký cướp phá trong thẻ Lãnh thổ ---------- */
function pvpHtml(){if(!pvpOn())return '';const P0=pvpS(),now=pvpNow(),lv=typeof heroLv==='function'?heroLv():1,g=(S.folk||[]).filter(f=>f.job==='gate'||f.job==='guard'||f.job==='soldier').length;
  const log=P0.log.slice(0,6).map(e=>`<li>${esc(mpName(e.u))} phá ${e.n} công trình · ${new Date(e.at).toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</li>`).join('');
  const out=Object.keys(P0.out).filter(u=>now-P0.out[u].at<PVP_DAY).map(u=>`<li>${esc(mpName(u))}: đã phá ${P0.out[u].ids.length}/${PVP_MAXDAY} món hôm nay</li>`).join('');
  return `<div class="landbox"><b>⚔️ Cướp phá</b><span class="small muted">Công trình của người không cùng liên minh phá được để lấy 35% vật liệu (cần nhân vật cấp ${PVP_MINLV}; bạn đang cấp ${lv}). Lại gần, bấm Hành động → Phá. Lính gác của chủ nhà sẽ xông ra.</span>
    <span class="small">${P0.sh>now?`🛡️ Bạn đang có khiên bảo vệ, còn ${Math.ceil((P0.sh-now)/3600000)} giờ (đi cướp thì mất khiên).`:'Bạn không có khiên: nhà bạn có thể bị cướp.'} Phòng thủ của bạn: ${g} người giữ cổng, canh gác, lính (tối đa 6 người ra chống trả).</span>
    ${log?`<span class="small"><b>Bị cướp gần đây</b></span><ul class="tips">${log}</ul>`:''}${out?`<span class="small"><b>Bạn đã đi cướp</b></span><ul class="tips">${out}</ul>`:''}</div>`;}
if(typeof mpLandHtml==='function'){const _lh=mpLandHtml;mpLandHtml=function(){let h=_lh.apply(this,arguments);try{h=pvpHtml()+h;}catch(e){}return h;};}
// món mình đã phá không hiện lại khi tải lại nhà họ (cho tới khi biên bản hết hạn hoặc chủ nhà dựng lại và mã đổi)
if(typeof mpRemoteApply==='function'){const _ra=mpRemoteApply;mpRemoteApply=function(u){try{const o=S&&S.pvp&&S.pvp.out&&S.pvp.out[u],raw=MP.braw.get(u);if(o&&raw&&raw.length&&pvpNow()-o.at<PVP_DAY)MP.braw.set(u,raw.filter(e=>!o.ids.includes(e.lid)));}catch(e){}return _ra.apply(this,arguments);};}
/* ---------- CÔNG TRÌNH PHÒNG THỦ CỦA CHỦ NHÀ CÓ TÁC DỤNG KHI BỊ CƯỚP ----------
   Sau khi mình động vào nhà ai (10 phút kể từ lần phá gần nhất), công trình thủ của người đó "thức dậy" trên máy mình:
     · Chòi canh (cần chủ nhà có ít nhất 1 người gác): bắn tên vào mình trong tầm 16 m, 2,6 giây một phát.
     · Hố chông: giẫm phải mất máu, chảy máu; mỗi hố 20 giây mới sập lại.
   Rào cọc, tường, cổng của họ vốn đã chắn lối (va chạm) nên muốn vào trong phải phá.
   CÂY HÚC CỔNG (chế ở bàn chế tác: 6 gỗ, 4 dây thừng): mang trong túi thì phá rào cọc, tường, cổng nhanh gấp 3; dùng 10 lần thì hỏng một cây. */
Object.assign(ITEMS,{ram:{n:'Cây húc cổng',t:'res',ds:'Thân gỗ lớn buộc dây cho nhiều tay cùng húc. Mang theo thì phá rào cọc, tường, cổng của kẻ địch nhanh gấp ba; húc 10 lần thì hỏng.'}});
if(typeof EMO==='object')EMO.ram='🪵';if(typeof M2V==='object')M2V.ram=8;
RECIPES.push({id:'ram',out:{ram:1},in:{wood:6,rope:4},st:'workbench',req:['wood','rope'],lv:{build:3}});
const pvpHostile=uid=>!!(PVP.spawned[uid]&&G.t-PVP.spawned[uid]<600);
const pvpIsWall=k=>/palisade|Wall|wall|gate|Gate|fence|Fence|rampart/.test(k);
function pvpHurt(dmg,txt){const cozy=S.mode==='cozy',arm=typeof m3Arm==='function'?m3Arm():0,def=typeof heroDef==='function'?heroDef():0;dmg=dmg*(cozy?0.5:1)*(1-arm)*(1-def);S.p.hp=Math.max(0,S.p.hp-dmg);P.hurtT=0.4;sfx('hurt');try{uiFloat('−'+Math.round(dmg)+(txt?' '+txt:''),P.x,P.y+44,P.z,'#ff8a7a');}catch(e){}uiHud(true);if(S.p.hp<=0)die();}
function pvpDefTick(){if(!pvpOn()||!S||G.paused||G.sleeping||!MP.bcur)return;PVP.pit=PVP.pit||{};PVP.tw=PVP.tw||{};
  for(const [uid,cur] of MP.bcur){if(!pvpHostile(uid))continue;const p=MP.players[uid],df=p&&p.df,lv=df?clamp(df[1]|0||1,1,10):1;
    for(const o of cur.values()){const b=o.b;if(!BYID.has(b.id))continue;const d=Math.hypot(b.x-P.x,b.z-P.z);
      if(b.k==='spikePit'&&d<17&&G.t-(PVP.pit[b.id]||-99)>20){PVP.pit[b.id]=G.t;pvpHurt(12+lv,'hố chông');try{addStatus('bleed');}catch(e){}uiToast('🩸 Sa hố chông của '+mpName(uid)+'!','bad');}
      else if(b.k==='watchtower'&&df&&df[0]>0&&d<320&&G.t-(PVP.tw[b.id]||-99)>2.6){PVP.tw[b.id]=G.t;if(Math.random()<0.7){pvpHurt(4+lv*0.9,'tên');try{puff(P.x,P.y+30,P.z,'#d8c8a0',3);}catch(e){}}else{try{uiFloat('Trượt!',P.x,P.y+50,P.z,'#c8f0ff');}catch(e){}}
        if(!PVP.twTip){PVP.twTip=1;uiToast('🏹 Chòi canh của '+mpName(uid)+' đang bắn tên: phá chòi hoặc ra khỏi tầm 16 m.','bad');}}}}}
setInterval(()=>{try{if(G.on)pvpDefTick();}catch(e){}},400);
// cây húc cổng: bọc pvpStart để rút ngắn thời gian phá tường, rào, cổng
{const _ps=pvpStart;pvpStart=function(t){const had=!!G.work;_ps.apply(this,arguments);try{if(!had&&G.work&&t&&t.b&&pvpIsWall(t.b.k)&&invCount('ram')>0){G.work.steps.forEach(s=>{s.t/=3;});G.work.steps[0].n='Húc đổ '+t.def.n.toLowerCase();const P0=pvpS();P0.ramU=(P0.ramU||0)+1;if(P0.ramU>=10){P0.ramU=0;invTake('ram',1);uiHotbar();uiToast('Cây húc cổng đã nứt gãy sau 10 lần húc.','');}}}catch(e){}};}
// bảng xếp hạng: thêm cột "Cướp phá"
if(typeof m2MyStats==='function'){const _ms=m2MyStats;m2MyStats=function(){const s=_ms.apply(this,arguments);try{s.p=(S.cnt&&S.cnt['cnt:pvp'])||0;}catch(e){}return s;};}
if(typeof M2LB!=='undefined'&&!M2LB.some(x=>x[0]==='p'))M2LB.splice(Math.max(0,M2LB.length-1),0,['p','⚔️ Cướp phá','']);
