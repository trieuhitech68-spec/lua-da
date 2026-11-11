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
  const p=MP.players[uid],now=pvpNow();if(p){if((p.hl||1)<PVP_MINLV)return 'Chủ nhà là người mới (dưới cấp '+PVP_MINLV+'): đang được bảo vệ.';if(p.sh>now)return `Chủ nhà đang có khiên bảo vệ, còn ${Math.max(1,Math.ceil((p.sh-now)/3600000))} giờ.`;
    if(!landFar()&&p.ho&&p.ho[0]>0&&now-p.ho[1]>300000&&now<p.ho[1]+p.ho[0]*3600000&&!pvpAtWar(uid))return `Chủ nhà đang nghỉ trong nhà: nhà được bảo hộ thêm ${Math.max(1,Math.ceil((p.ho[1]+p.ho[0]*3600000-now)/3600000))} giờ.`;}
  const o=pvpS().out[uid];if(o&&now-o.at<PVP_DAY&&o.ids.length>=pvpCap(uid))return 'Hôm nay bạn đã phá đủ '+pvpCap(uid)+' món của nhà này.';return null;}
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
function pvpDestroy(uid,b,def){if(!BYID.has(b.id))return;const P0=pvpS(),now=pvpNow();let o=P0.out[uid];if(!o||now-o.at>PVP_DAY)o=P0.out[uid]={at:now,ids:[]};if(o.ids.length>=pvpCap(uid)){uiToast('Hôm nay đã phá đủ món của nhà này.','bad');return;}
  const lid=+String(b.id).split('_')[1];if(!(lid>=0))return;if(!o.ids.includes(lid))o.ids.push(lid);o.at=now;
  // gỡ khỏi màn hình của mình (bản của chủ nhà sẽ tự cập nhật khi máy họ đọc biên bản)
  try{structRemove(b);const cur=MP.bcur.get(uid);if(cur){cur.delete(b.id);MP.rTot=Math.max(0,MP.rTot-1);}}catch(e){}
  const got={};for(const k in (def.cost||{})){const n=Math.floor(def.cost[k]*(pvpAtWar(uid)?0.5:0.35)+Math.random());if(n>0&&ITEMS[k])got[k]=n;}if(def.store){const L=PVP_LOOT[Math.floor(Math.random()*PVP_LOOT.length)];for(const k in L)if(ITEMS[k])got[k]=(got[k]||0)+L[k];}
  if(Object.keys(got).length)give(got,[b.x,(b.y||P.y)+20,b.z]);puff(b.x,(b.y||P.y)+16,b.z,'#a88a62',12);sfx('thud');addXp('hunt',3);cnt('cnt','pvp');try{pvpWarScore(uid);}catch(e){}
  if(P0.sh>now){P0.sh=0;uiToast('Bạn đã đi cướp phá: khiên bảo vệ của chính bạn mất hiệu lực.','');}
  uiToast(`⚔️ Đã phá ${def.n.toLowerCase()} của ${mpName(uid)} (${o.ids.length}/${pvpCap(uid)} hôm nay${pvpAtWar(uid)?', đang chiến tranh':''}).`,'gold');PVP.nearT=-9;pvpPrune();try{RL.mp.putT=0;RL.mp.last='';}catch(e){}save();}
function pvpPrune(){const P0=pvpS(),now=pvpNow();for(const u in P0.out)if(now-P0.out[u].at>PVP_KEEP)delete P0.out[u];const ks=Object.keys(P0.out).sort((a,b)=>P0.out[b].at-P0.out[a].at);ks.slice(10).forEach(u=>delete P0.out[u]);}
// biên bản gửi đi (realm.js ghép vào tài liệu sites/<uid>)
function pvpOut(){if(!S||!S.pvp||!S.pvp.out)return null;const R={};let n=0;for(const u in S.pvp.out){const o=S.pvp.out[u];if(!o||!Array.isArray(o.ids)||!o.ids.length)continue;R[u]={at:o.at,ids:o.ids.slice(0,40)};n++;}return n?R:null;}
/* ---------- lính gác của chủ nhà ---------- */
function pvpDefend(uid,b){if(PVP.spawned[uid]&&G.t-PVP.spawned[uid]<240)return;PVP.spawned[uid]=G.t;const p=MP.players[uid],df=p&&p.df;if(!df||!(df[0]>0))return;const n=clamp(df[0]|0,1,6),lv=clamp(df[1]|0||1,1,10),fort=clamp(df[2]|0,0,30);
  for(let i=0;i<n;i++){const a=i/n*6.283+Math.random(),x=b.x+Math.cos(a)*(60+Math.random()*40),z=b.z+Math.sin(a)*(60+Math.random()*40);if(wdAt(x,z)>0)continue;const f=foeSpawn(x,z,'guard');f.pvp=uid;f.noCap=1;f._lvA=1;f.lv=lv;f.n='Lính gác của '+mpName(uid);
    const k=2.2*(1+0.45*(lv-1))*(1+Math.min(0.6,fort*0.03));f.hp=FOE.hp*k;f.hp0=f.hp;f.dmg=FOE.dmg*(1+0.12*(lv-1));f.home={x:b.x,z:b.z};f.state='chase';}
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
  const df=[Math.min(6,g.length),lv,Math.min(30,fort)],sh=P0.sh>pvpNow()?Math.round(P0.sh):0,hl=typeof heroLv==='function'?heroLv():1,hh=typeof hoHours==='function'?hoHours(fort):0,k=JSON.stringify([df,sh,hl,hh,hh?Math.floor(now/120000):0]);if(k===PVP.pubK)return;PVP.pubK=k;mpSaveMe({df,sh,hl,ho:hh?[hh,Math.round(pvpNow())]:(MP.me&&MP.me.ho)||null});}
/* ---------- nhận biên bản: áp hậu quả lên nhà mình ---------- */
function pvpIn(docs){if(!pvpOn()||!S)return;try{pvpWarIn(docs);}catch(e){}try{pvpFlagIn(docs);}catch(e){}const P0=pvpS(),me=MP.uid,now=pvpNow();let hit=0,who=[];
  for(const d of docs){const u=d.id;if(u===me||!mpIdOk(u))continue;const v=d.data();if(!v||v.w!==seed0()||!v.R||typeof v.R!=='object')continue;const e=v.R[me];if(!e||typeof e!=='object'||!Array.isArray(e.ids)||!mpNum(e.at,1e12,now+600000))continue;if(now-e.at>PVP_KEEP)continue;
    if(typeof mpSameClan==='function'&&mpSameClan(u))continue;const sn=P0.seen[u]||(P0.seen[u]={at:0,ids:[]});if(e.at<sn.at-1)continue;if(e.at-sn.at>PVP_DAY)sn.ids=[];let n=0;
    for(const id of e.ids.slice(0,40)){if(!(typeof id==='number'&&id>=0&&Math.floor(id)===id)||sn.ids.includes(id))continue;if(sn.ids.length>=pvpCap(u))break;sn.ids.push(id);let b=S.builds.find(x=>x.id===id);/* công trình có thể nằm ở vùng đất khác vùng mình đang đứng */if(!b&&S.lands)for(const lk in S.lands){const Bs=S.lands[lk]&&S.lands[lk].builds;if(Array.isArray(Bs)){b=Bs.find(x=>x.id===id);if(b){if(b.prog==null&&pieceDef(b.k)){b.prog=0.45;if(b.cond!=null)b.cond=60;n++;}b=null;break;}}}if(!b||b.prog!=null||!pieceDef(b.k))continue;
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

/* ---------- CHIẾN TRANH LIÊN MINH ----------
   Thủ lĩnh tuyên chiến với liên minh khác (tối đa 5 cuộc cùng lúc): clans/<thủ lĩnh>.war=[mã liên minh…]. Chỉ cần MỘT bên tuyên chiến là hai bên ở trạng thái chiến tranh.
   Khi đang chiến tranh với liên minh của chủ nhà: mỗi ngày phá được 60 món (thường 25), lấy 50% vật liệu (thường 35%).
   Điểm chiến tranh = số công trình thành viên bên mình đã phá của bên kia kể từ khi mình bắt đầu tính (mỗi người ghi sites/<uid>.W={<mã liên minh địch>:số}).
   Giảng hoà: thủ lĩnh bỏ tên bên kia khỏi danh sách của mình; hết chiến tranh khi cả hai bên đều đã bỏ. */
const PVP_WARMAX=5,PVP_WARCAP=60;
{const _v=mpValClan;mpValClan=function(id,d){const v=_v.apply(this,arguments);if(v)v.war=d&&Array.isArray(d.war)?[...new Set(d.war.filter(x=>mpIdOk(x)&&x!==id))].slice(0,PVP_WARMAX):[];return v;};}
{const _cd=mpClanDoc;mpClanDoc=function(c,patch){const o=_cd.apply(this,arguments);if(!patch||!('war' in patch))o.war=(c&&c.war||[]).slice(0,PVP_WARMAX);return o;};}
function pvpWarWith(a,b){if(!a||!b||a===b)return false;const A=MP.clans[a],B=MP.clans[b];return !!((A&&A.war&&A.war.includes(b))||(B&&B.war&&B.war.includes(a)));}
function pvpAtWar(uid){if(!pvpOn())return false;const a=mpMyClan(),b=mpClanOf(uid);return pvpWarWith(a,b);}
function pvpCap(uid){return pvpAtWar(uid)?PVP_WARCAP:PVP_MAXDAY;}
function pvpWarScore(uid){if(!pvpAtWar(uid))return;const b=mpClanOf(uid),P0=pvpS();if(!P0.ws||typeof P0.ws!=='object')P0.ws={};P0.ws[b]=(P0.ws[b]||0)+1;}
function pvpWarOut(){const w=S&&S.pvp&&S.pvp.ws;if(!w)return null;const o={};let n=0;for(const k in w){if(n>=8)break;if(mpIdOk(k)&&w[k]>0){o[k]=Math.min(1e6,w[k]|0);n++;}}return n?o:null;}
function pvpWarIn(docs){const o={};for(const d of docs){const v=d.data();if(!v||v.w!==seed0()||!v.W||typeof v.W!=='object'||!mpIdOk(d.id))continue;const e={};let n=0;for(const k in v.W){if(n++>=8)break;if(mpIdOk(k)&&mpNum(v.W[k],1,1e6))e[k]=v.W[k]|0;}o[d.id]=e;}PVP.ws=o;}
// điểm của liên minh a đánh liên minh b
function pvpWarPts(a,b){const A=MP.clans[a];if(!A)return 0;let s=0;for(const u of A.members){const e=u===MP.uid?(S.pvp&&S.pvp.ws)||{}:(PVP.ws&&PVP.ws[u])||{};s+=e[b]||0;}return s;}
function pvpWarSet(oc,on){const c=MP.clans[MP.uid];if(!c||mpMyClan()!==MP.uid){uiToast('Chỉ thủ lĩnh mới tuyên chiến hay giảng hoà được.','bad');return;}if(!MP.clans[oc]||oc===MP.uid)return;let w=(c.war||[]).filter(x=>x!==oc);
  if(on){if(w.length>=PVP_WARMAX){uiToast('Mỗi liên minh chỉ tuyên chiến tối đa '+PVP_WARMAX+' cuộc cùng lúc.','bad');return;}w.push(oc);}
  mpClanWrite(mpClanDoc(c,{war:w}));uiToast(on?`⚔️ Đã tuyên chiến với ${mpCT(MP.clans[oc].name)}!`:`🕊️ Đã rút lời tuyên chiến với ${mpCT(MP.clans[oc].name)}.`,on?'bad':'good');sfx(on?'hurt':'level');MP.dirty.ui=true;}
function pvpWarHtml(){const cid=mpMyClan();if(!cid)return '';const c=MP.clans[cid],lead=c.leader===MP.uid,wars=Object.keys(MP.clans).filter(o=>o!==cid&&pvpWarWith(cid,o));
  const rows=wars.map(o=>{const mine=c.war&&c.war.includes(o),theirs=MP.clans[o].war&&MP.clans[o].war.includes(cid),a=pvpWarPts(cid,o),b=pvpWarPts(o,cid);
    return `<div class="mp-m pvp-w"><b data-cn="${esc(o)}"></b><small class="muted"> · ${mine&&theirs?'hai bên cùng tuyên chiến':mine?'ta tuyên chiến':'họ tuyên chiến'}</small><span class="pvp-sc"><i class="${a>=b?'ok':''}">ta ${a}</i> – <i class="${b>a?'bad':''}">${b} địch</i></span>${lead&&mine?`<button class="btn sm ghost" data-a="pvpwar" data-c="${esc(o)}" data-on="0">Giảng hoà</button>`:''}</div>`;}).join('');
  const others=lead?Object.values(MP.clans).filter(o=>o.id!==cid&&!(c.war&&c.war.includes(o.id))).sort((a,b)=>b.members.length-a.members.length).slice(0,30):[];
  const pick=others.length?`<details class="pvp-pick"><summary>Tuyên chiến với liên minh khác…</summary>${others.map(o=>`<div class="mp-m"><span class="mp-sw" style="background:${o.color}"></span><b data-cn="${esc(o.id)}"></b><small class="muted"> · ${o.members.length} người</small><button class="btn sm red" data-a="pvpwar" data-c="${esc(o.id)}" data-on="1">⚔️ Tuyên chiến</button></div>`).join('')}</details>`:'';
  return `<h3>⚔️ Chiến tranh</h3>${rows||'<p class="small muted">Liên minh đang không có chiến tranh.</p>'}<p class="hint">Đang chiến tranh: mỗi ngày phá được ${PVP_WARCAP} công trình của mỗi người bên kia (thường ${PVP_MAXDAY}) và lấy 50% vật liệu (thường 35%). Điểm = số công trình đã phá của nhau.${lead?'':' Chỉ thủ lĩnh tuyên chiến, giảng hoà được.'}</p>${pick}`;}
if(typeof mpTribeHtml==='function'){const _th=mpTribeHtml;mpTribeHtml=function(){let h=_th.apply(this,arguments);try{if(mpMyClan()){const w=pvpWarHtml(),i=h.lastIndexOf('<button class="btn sm ');h=i>0?h.slice(0,i)+w+h.slice(i):h+w;}}catch(e){console.warn('chiến tranh',e);}return h;};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="pvpwar"]');if(!b||!S)return;e.stopImmediatePropagation();pvpWarSet(b.dataset.c,b.dataset.on==='1');try{mpPanelRefresh();}catch(_){}},true);
// báo khi có liên minh tuyên chiến với mình
setInterval(()=>{try{if(!pvpOn())return;const cid=mpMyClan();if(!cid){PVP.warK=null;return;}const cur=Object.keys(MP.clans).filter(o=>o!==cid&&MP.clans[o].war&&MP.clans[o].war.includes(cid)).sort();const k=cur.join(',');if(PVP.warK!=null&&k!==PVP.warK){const old=new Set(PVP.warK.split(','));for(const o of cur)if(!old.has(o)){uiToast(`⚔️ ${mpCT(MP.clans[o].name)} đã tuyên chiến với liên minh của bạn!`,'bad');sfx('hurt');}}PVP.warK=k;}catch(e){}},4000);
{const st=document.createElement('style');st.textContent='.pvp-sc{margin-left:auto;font-weight:800;font-size:12.5px;white-space:nowrap}.pvp-sc i{font-style:normal}.pvp-sc .ok{color:#8ce07a}.pvp-sc .bad{color:#ff9a8a}.pvp-w{flex-wrap:wrap;gap:4px 8px}.pvp-pick{margin:6px 0 10px}.pvp-pick summary{cursor:pointer;color:#f2c55a;font-weight:700;font-size:13px;padding:6px 0}';document.head.appendChild(st);}

/* ---------- HẠ CỜ, CHIẾM VÙNG ĐẤT CHUNG CỦA LIÊN MINH ĐỊCH ----------
   Mỗi vùng đất chung có một cột cờ ở tâm. Khi hai liên minh đang chiến tranh, thành viên bên này tới sát cột cờ bên kia và "Hạ cờ"
   (45 giây, lính của thủ lĩnh bên kia xông ra, ít nhất 3 người). Hạ xong: người hạ được thưởng và +30 điểm chiến tranh, ghi sites/<uid>.Z={<liên minh bị hạ>:giờ}.
   Máy của thủ lĩnh bên bị hạ đọc thấy thì vùng đất chung bị xoá và 24 giờ sau mới cắm lại được → bên thắng có thể cắm vùng của mình ở đó. */
const PVP_FLAGCD=24*3600000;
function pvpFlagSync(){if(!G.on||!G.sc)return;PVP.flags=PVP.flags||new Map();const want=new Map();if(pvpOn())for(const id in MP.clans){const z=MP.clans[id].zone;if(z)want.set(id,z.x+','+z.z);}
  for(const [id,o] of PVP.flags)if(want.get(id)!==o.k){G.sc.remove(o.g);PVP.flags.delete(id);}
  for(const [id,k] of want)if(!PVP.flags.has(id)){const z=MP.clans[id].zone;let g=null;try{g=model(['piece','flagPole']);}catch(e){}if(!g)continue;g.position.set(z.x,hAt(z.x,z.z)-0.5,z.z);g.scale.setScalar(1.5);try{seasonPatchAll(g);}catch(e){}G.sc.add(g);PVP.flags.set(id,{g,k});}}
setInterval(()=>{try{pvpFlagSync();}catch(e){}},3000);
function pvpFlagNear(){if(!pvpOn())return null;const cid=mpMyClan();if(!cid)return null;for(const id in MP.clans){if(id===cid)continue;const z=MP.clans[id].zone;if(!z||Math.hypot(z.x-P.x,z.z-P.z)>46)continue;return {type:'pvpflag',cid:id,z,d:Math.hypot(z.x-P.x,z.z-P.z)};}return null;}
{const _ft=findTarget;findTarget=function(){const r=_ft.apply(this,arguments);if(!S||!S.mp||G.work||G.sit)return r;if(r&&(r.type==='animal'||r.type==='foe'))return r;const f=pvpFlagNear();return f||r;};}
{const _ti=targetInfo;targetInfo=function(t){if(t&&t.type==='pvpflag'){const c=MP.clans[t.cid],war=pvpWarWith(mpMyClan(),t.cid),done=S.pvp&&S.pvp.zo&&S.pvp.zo[t.cid]&&pvpNow()-S.pvp.zo[t.cid]<PVP_FLAGCD;
    return {name:'Cờ của '+mpCT(c?c.name:''),verb:!war?'Hai liên minh chưa có chiến tranh':done?'Đã hạ cờ này, chờ họ nhận tin':'Hạ cờ (chiếm đất chung)',ok:war&&!done,need:war?null:'thủ lĩnh tuyên chiến trước',icon:'club'};}return _ti.apply(this,arguments);};}
{const _as=actStart;actStart=function(t){if(t&&t.type==='pvpflag'&&!G.work){pvpFlagStart(t);return;}return _as.apply(this,arguments);};}
function pvpFlagStart(t){const c=MP.clans[t.cid];if(!c||!pvpWarWith(mpMyClan(),t.cid)){uiToast('Chỉ hạ được cờ của liên minh đang có chiến tranh với liên minh bạn.','bad');sfx('no');return;}if((typeof heroLv==='function'?heroLv():1)<PVP_MINLV){uiToast('Cần nhân vật cấp '+PVP_MINLV+'.','bad');return;}
  {const ng=needGate(true);if(ng){uiToast(ng,'bad');sfx('no');return;}}
  // lính giữ cờ: theo phòng thủ của thủ lĩnh, ít nhất 3
  try{const key='flag:'+t.cid;if(!(PVP.spawned[key]&&G.t-PVP.spawned[key]<300)){PVP.spawned[key]=G.t;const p=MP.players[c.leader],df=p&&p.df,n=clamp(Math.max(3,df?df[0]|0:0),3,6),lv=clamp(Math.max(3,df?df[1]|0:0),1,10);
      for(let i=0;i<n;i++){const a=i/n*6.283,x=t.z.x+Math.cos(a)*80,z=t.z.z+Math.sin(a)*80;if(wdAt(x,z)>0)continue;const f=foeSpawn(x,z,'guard');f.pvp=c.leader;f.noCap=1;f._lvA=1;f.lv=lv;f.n='Lính giữ cờ '+mpCT(c.name);f.hp=FOE.hp*2.6*(1+0.45*(lv-1));f.hp0=f.hp;f.dmg=FOE.dmg*(1+0.12*(lv-1));f.home={x:t.z.x,z:t.z.z};}
      uiToast(`🛡️ ${n} lính giữ cờ xông ra!`,'bad');sfx('hurt');}}catch(e){console.warn('lính giữ cờ',e);}
  G.work={r:{out:{}},steps:[{n:'Chặt dây, lay cột cờ',a:'chop',t:18,fx:'thud'},{n:'Hạ cờ '+mpCT(c.name),a:'hammer',t:17,fx:'thud'},{n:'Cắm cờ liên minh mình',a:'lash',t:10,fx:'build'}],i:0,t:0,left:1,done:0,x:P.x,z:P.z,sk:'build',icon:'club',fn:()=>pvpFlagDone(t.cid)};workUi();}
function pvpFlagDone(cid){const c=MP.clans[cid];if(!c||!pvpWarWith(mpMyClan(),cid))return;const P0=pvpS(),now=pvpNow();if(!P0.zo||typeof P0.zo!=='object')P0.zo={};P0.zo[cid]=now;if(!P0.ws||typeof P0.ws!=='object')P0.ws={};P0.ws[cid]=(P0.ws[cid]||0)+30;
  give({bronze:2,rope:4,meatCooked:4,hide:2},[P.x,P.y+20,P.z]);addXp('hunt',40);cnt('cnt','flag');sfx('level');try{puff(P.x,P.y+40,P.z,'#ffd27a',18);}catch(e){}
  uiToast(`🚩 Đã hạ cờ ${mpCT(c.name)}! +30 điểm chiến tranh. Khi thủ lĩnh của họ vào game, vùng đất chung của họ sẽ mất và 24 giờ sau mới cắm lại được.`,'gold');try{RL.mp.putT=0;RL.mp.last='';}catch(e){}save();}
function pvpFlagOut(){const z=S&&S.pvp&&S.pvp.zo;if(!z)return null;const o={},now=pvpNow();let n=0;for(const k in z){if(n>=6)break;if(mpIdOk(k)&&now-z[k]<3*86400000){o[k]=z[k];n++;}}return n?o:null;}
// thủ lĩnh bên bị hạ cờ: mất vùng đất chung, 24 giờ sau mới cắm lại
function pvpFlagIn(docs){if(!pvpOn()||!S)return;const cid=mpMyClan();if(!cid||cid!==MP.uid)return;const c=MP.clans[cid];if(!c)return;const P0=pvpS(),now=pvpNow();
  for(const d of docs){const u=d.id;if(u===MP.uid||!mpIdOk(u))continue;const v=d.data();if(!v||v.w!==seed0()||!v.Z||typeof v.Z!=='object')continue;const at=v.Z[cid];if(!mpNum(at,1e12,now+600000)||now-at>3*86400000||at<=(P0.zs||0))continue;
    const oc=mpClanOf(u);if(!oc||!pvpWarWith(cid,oc))continue;P0.zs=at;if(c.zone){mpClanWrite(mpClanDoc(c,{zone:null}));MP.tick.ring=-9;}P0.zcd=now+PVP_FLAGCD;
    uiToast(`🚩 ${mpName(u)} (${mpCT(MP.clans[oc].name)}) đã hạ cờ liên minh bạn! Vùng đất chung bị mất, 24 giờ nữa mới cắm lại được.`,'bad');sfx('hurt');save();break;}}
if(typeof mpZoneSet==='function'){const _zs=mpZoneSet;mpZoneSet=function(on){if(on&&S&&S.pvp&&S.pvp.zcd>pvpNow()){uiToast(`Cờ liên minh vừa bị hạ: còn ${Math.ceil((S.pvp.zcd-pvpNow())/3600000)} giờ nữa mới cắm lại vùng đất chung được.`,'bad');sfx('no');return;}return _zs.apply(this,arguments);};}
/* ---------- THANG TRÈO TƯỜNG ----------
   Chế ở bàn chế tác (8 tre hoặc gỗ + 4 dây thừng). CHỌN thang trên thanh đồ nhanh rồi bấm Hành động vào rào cọc, tường, cổng của người không cùng
   liên minh: trèo qua sang bên kia thay vì phá (2 giây). Lính gác vẫn xông ra. Thang dùng 6 lần thì gãy. */
Object.assign(ITEMS,{siegeLadder:{n:'Thang trèo tường',t:'tool',tool:'ladder',pow:0.5,ds:'Thang tre dài. Chọn nó rồi bấm vào rào cọc, tường của kẻ địch để trèo qua. Dùng 6 lần thì gãy.'}});
if(typeof EMO==='object')EMO.siegeLadder='🪜';if(typeof M2V==='object')M2V.siegeLadder=6;if(typeof KHU_TOOLM==='object')KHU_TOOLM.siegeLadder='rod';
RECIPES.push({id:'siegeLadder',out:{siegeLadder:1},in:{wood:8,rope:4},st:'workbench',req:['wood','rope'],lv:{build:2}});
const pvpLadderOn=()=>{const s=S&&S.inv[S.sel];return !!(s&&s.id==='siegeLadder');};
{const _ti=targetInfo;targetInfo=function(t){const r=_ti.apply(this,arguments);try{if(r&&t&&t.type==='pvpb'&&r.ok&&pvpLadderOn()&&pvpIsWall(t.b.k))r.verb='Trèo qua bằng thang';}catch(e){}return r;};}
{const _ps=pvpStart;pvpStart=function(t){if(!(t&&t.b&&pvpLadderOn()&&pvpIsWall(t.b.k)))return _ps.apply(this,arguments);const why=pvpWhy(t.uid);if(why){uiToast(why,'bad');sfx('no');return;}
  const b=t.b,dx=b.x-P.x,dz=b.z-P.z,l=Math.hypot(dx,dz)||1,nx=b.x+dx/l*46,nz=b.z+dz/l*46;if(wdAt(nx,nz)>1.5){uiToast('Bên kia là nước sâu, không trèo qua được.','bad');return;}try{pvpDefend(t.uid,b);}catch(e){}
  G.work={r:{out:{}},steps:[{n:'Dựng thang, trèo qua '+t.def.n.toLowerCase(),a:'chop',t:2.2,fx:'step'}],i:0,t:0,left:1,done:0,x:P.x,z:P.z,sk:'run',icon:'siegeLadder',fn:()=>{P.x=nx;P.z=nz;P.y=groundY(nx,nz,P.y+60);const P0=pvpS();P0.ladU=(P0.ladU||0)+1;if(P0.ladU>=6){P0.ladU=0;invTake('siegeLadder',1);try{equip(null);}catch(e){}uiHotbar();uiToast('Thang đã gãy sau 6 lần trèo.','');}else uiToast('🪜 Đã trèo qua.','good');PVP.nearT=-9;}};workUi();};}
/* ---------- THƯỞNG THẮNG CHIẾN TRANH ----------
   Khi điểm bên mình từ 100 trở lên và gấp đôi bên kia, mỗi thành viên nhận được một phần thưởng chiến thắng (mỗi tuần một lần với mỗi liên minh địch). */
const PVP_WINPTS=100,PVP_WINCD=7*86400000;
function pvpWinOk(o){const cid=mpMyClan();if(!cid||!pvpWarWith(cid,o))return false;const a=pvpWarPts(cid,o),b=pvpWarPts(o,cid);return a>=PVP_WINPTS&&a>=2*b;}
function pvpWinClaim(o){if(!pvpWinOk(o))return;const P0=pvpS(),now=pvpNow();if(!P0.won||typeof P0.won!=='object')P0.won={};if(P0.won[o]&&now-P0.won[o]<PVP_WINCD){uiToast('Tuần này bạn đã nhận thưởng thắng liên minh này rồi.','');return;}P0.won[o]=now;
  const rw={bronze:3,rope:6,meatCooked:6,hide:3};if(ITEMS.iron)rw.iron=1;give(rw,[P.x,P.y+20,P.z]);addXp('hunt',60);cnt('cnt','warwin');sfx('level');try{puff(P.x,P.y+40,P.z,'#ffd27a',20);}catch(e){}uiToast(`🏆 Phần thưởng chiến thắng trước ${mpCT(MP.clans[o].name)}!`,'gold');save();try{mpPanelRefresh();}catch(e){}}
{const _wh=pvpWarHtml;pvpWarHtml=function(){let h=_wh.apply(this,arguments);try{const cid=mpMyClan(),P0=pvpS(),now=pvpNow();if(cid){const wins=Object.keys(MP.clans).filter(o=>o!==cid&&pvpWinOk(o));
    const rows=wins.map(o=>{const got=P0.won&&P0.won[o]&&now-P0.won[o]<PVP_WINCD;return `<div class="mp-m"><b data-cn="${esc(o)}"></b><small class="muted"> · đang thắng áp đảo</small><button class="btn sm${got?' ghost':''}" data-a="pvpwin" data-c="${esc(o)}" ${got?'disabled':''}>${got?'Đã nhận tuần này':'🏆 Nhận thưởng'}</button></div>`;}).join('');
    h+=rows?`<h3>🏆 Chiến thắng</h3>${rows}`:`<p class="small muted">Thưởng chiến thắng: khi điểm bên mình từ ${PVP_WINPTS} trở lên và gấp đôi bên kia, mỗi thành viên nhận thưởng mỗi tuần một lần.</p>`;}}catch(e){}return h;};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="pvpwin"]');if(!b||!S)return;e.stopImmediatePropagation();pvpWinClaim(b.dataset.c);},true);
