/* ---------- LÍNH, TÙ BINH, NGƯỜI LÀNG CỦA MÌNH HIỆN RA VỚI NGƯỜI CHƠI KHÁC ----------
   Trước: lính và tù binh chỉ có trên máy chủ nhà; người khác tới không thấy ai, chỉ khi phá nhà mới có "lính gác" hiện ra từ hư không.
   Giờ: mỗi người gửi kèm players/<uid>.fk = [[x, z, loại, cấp]…] (tối đa 10 người: 0 giữ cổng, 1 lính gác, 2 lính theo, 3 tù binh, 4 người làng).
   Máy người khác dựng họ đứng đúng chỗ. Bình thường họ đứng yên; bị đánh, bị phá nhà, hoặc kẻ địch đang chiến tranh tới gần thì lính xông ra.
   Hạ hết lính rồi thì phá nhà không còn ai cản (10 phút sau lính mới hồi lại). Đồng minh và người đang được bảo vệ thì không đánh được. */
const LTH={sp:{},dead:{},hot:{},k:'',t:0,warn:0,N:['Lính giữ cổng','Lính gác','Lính','Tù binh','Người làng']};
function lthPack(){const L=[];for(const f of S.folk||[]){if(L.length>=10)break;if(!isFinite(f.x)||!isFinite(f.z))continue;const c=f.cap>0?3:f.job==='gate'?0:f.job==='guard'?1:f.job==='soldier'?2:4;L.push([Math.round(f.x),Math.round(f.z),c,clamp(f.lv|0||1,1,10)]);}return L;}
{const _pt=pvpPubTick;pvpPubTick=function(){const r=_pt.apply(this,arguments);try{if(pvpOn()&&MP.me&&!landFar()){const now=Date.now();if(now-LTH.t>40000){LTH.t=now;const L=lthPack(),k=JSON.stringify(L.map(e=>[Math.round(e[0]/60),Math.round(e[1]/60),e[2],e[3]]));if(k!==LTH.k){LTH.k=k;mpSaveMe({fk:L});}}}}catch(e){}return r;};}
{const _v=mpValPlayer;mpValPlayer=function(id,d){const v=_v.apply(this,arguments);try{if(v){v.fk=[];if(d&&Array.isArray(d.fk))for(const e of d.fk.slice(0,10))if(Array.isArray(e)&&e.length===4&&mpNum(e[0],-2e4,2e4)&&mpNum(e[1],-2e4,2e4)&&mpNum(e[2],0,4)&&mpNum(e[3],1,10))v.fk.push([e[0],e[1],e[2]|0,e[3]|0]);}}catch(e){}return v;};}
function lthWhy(uid){if(typeof mpSameClan==='function'&&mpSameClan(uid))return 'Đây là người của đồng minh.';if((typeof heroLv==='function'?heroLv():1)<PVP_MINLV)return 'Cần nhân vật cấp '+PVP_MINLV+' mới đánh người của làng khác được.';const p=MP.players[uid],now=pvpNow();if(p){if((p.hl||1)<PVP_MINLV)return 'Chủ làng là người mới (dưới cấp '+PVP_MINLV+'): đang được bảo vệ.';if(p.sh>now)return 'Chủ làng đang có khiên bảo vệ.';}return null;}
function lthOf(uid){return (G.foes||[]).filter(f=>f.rf===uid);}
function lthRouse(uid){LTH.hot[uid]=G.t;let n=0;for(const f of lthOf(uid))if(f.alive&&!f.civ&&f.calm){f.calm=0;n++;}if(n){uiToast(`🛡️ ${n} lính của ${mpName(uid)} xông ra!`,'bad');sfx('hurt');}return n;}
function lthTick(){if(!S||!G.on||!pvpOn()||landFar())return;const now=Date.now();
  for(const uid in MP.players){if(uid===MP.uid)continue;const p=MP.players[uid],L=p&&p.fk;if(!L||!L.length){continue;}let dm=1e9;for(const e of L)dm=Math.min(dm,Math.hypot(e[0]-P.x,e[1]-P.z));const mine=lthOf(uid);
    if(LTH.sp[uid]&&dm>1300&&!mine.length){delete LTH.sp[uid];continue;}
    if(!LTH.sp[uid]&&dm<900){LTH.sp[uid]=1;const fort=clamp((p.df&&p.df[2])|0,0,30);L.forEach((e,i)=>{const dk=uid+':'+i;if(LTH.dead[dk]&&now-LTH.dead[dk]<600000)return;if(wdAt(e[0],e[1])>0)return;let f;try{f=foeSpawn(e[0],e[1],'guard');}catch(er){return;}
        f.pvp=uid;f.rf=uid;f.rfi=i;f.noCap=1;f._lvA=1;f.lv=e[3];f.civ=e[2]>=3?1:0;f.calm=1;f.n=LTH.N[e[2]]+' của '+mpName(uid);const k=f.civ?1:2.2*(1+0.45*(e[3]-1))*(1+Math.min(0.6,fort*0.03));f.hp=FOE.hp*k;f.hp0=f.hp;f.dmg=FOE.dmg*(1+0.12*(e[3]-1));f.home={x:e[0],z:e[1]};});}
    if(!mine.length)continue;
    // đang chiến tranh mà tới sát: lính xông ra; yên 5 phút thì về chỗ
    if(mine.some(f=>f.alive&&f.calm&&!f.civ)&&pvpAtWar(uid)&&!lthWhy(uid)&&mine.some(f=>f.alive&&Math.hypot(f.x-P.x,f.z-P.z)<200))lthRouse(uid);
    if(LTH.hot[uid]!=null&&G.t-LTH.hot[uid]>300){delete LTH.hot[uid];for(const f of mine)if(f.alive)f.calm=1;}}}
setInterval(()=>{try{lthTick();}catch(e){if(!LTH.err){LTH.err=1;console.warn('lính hiện ra',e);}}},2000);
// lính đang yên: đứng tại chỗ, quay nhìn người lạ
{const _gt=pvpGuardsTick;pvpGuardsTick=function(L,dt){const calm=[],rest=[];for(const f of L)(f.rf&&f.alive&&(f.calm||f.civ)?calm:rest).push(f);
  for(const f of calm){const dP=Math.hypot(P.x-f.x,P.z-f.z);if(dP>1500){G.sc.remove(f.o);f.gone=1;f.alive=false;continue;}const H=f.home,dx=H.x-f.x,dz=H.z-f.z,d=Math.hypot(dx,dz);let pose='idle';
    if(d>10){const st=Math.min(d,60*dt);f.x+=dx/d*st;f.z+=dz/d*st;f.ry=Math.atan2(dx,dz);pose='walk';f.g=(f.g||0)+dt*1.4;}else if(dP<160)f.ry=Math.atan2(P.x-f.x,P.z-f.z);
    f.y=groundY(f.x,f.z,(f.y||0)+10);f.o.position.set(f.x,f.y,f.z);f.o.rotation.y=lerpAng(f.o.rotation.y,f.ry||0,Math.min(1,dt*6));
    if(K3.char2Pose&&f.rig&&dP<800){try{K3.char2Pose(f.rig,pose,pose==='walk'?f.g:G.t+(f.ph||0),f.civ?{}:{tool:'spear'});}catch(e){}}}
  return _gt.call(this,rest,dt);};}
// đánh người của làng khác: đồng minh, người được bảo vệ thì không đánh được; còn lại cả đội lính xông ra
{const _fd=foeDamage;foeDamage=function(f,dmg){if(f&&f.rf&&f.alive){const why=lthWhy(f.rf);if(why){if(G.t-LTH.warn>3){LTH.warn=G.t;uiToast(why,'bad');sfx('no');}return;}lthRouse(f.rf);const r=_fd.apply(this,arguments);
      if(!f.alive){LTH.dead[f.rf+':'+f.rfi]=Date.now();try{if(!f.civ)pvpWarScore(f.rf);}catch(e){}try{addXp('hunt',f.civ?2:6);}catch(e){}if(!lthOf(f.rf).some(x=>x.alive&&!x.civ))uiToast(`⚔️ Đã hạ hết lính của ${mpName(f.rf)}. 10 phút tới làng này không còn ai giữ.`,'gold');}return r;}
    return _fd.apply(this,arguments);};}
// phá nhà: lính đang đứng đó xông ra, không gọi thêm lính từ hư không
{const _pd=pvpDefend;pvpDefend=function(uid,b){try{const p=MP.players[uid];if(p&&p.fk&&p.fk.length&&LTH.sp[uid]){lthRouse(uid);return;}}catch(e){}return _pd.apply(this,arguments);};}
/* ---------- lính bị người khác hạ: bên chủ nhà cũng bị thương thật ----------
   Người đánh ghi sites/<mình>.F={<chủ làng>:[số lính đã hạ trong đợt, giờ bắt đầu đợt]}. Máy chủ làng đọc thấy: bấy nhiêu lính bị thương, nghỉ 10 phút
   (không gác, không tính vào phòng thủ, không hiện ra với người khác), rồi tự trở lại việc cũ. */
function lthS(){if(!S.lth||typeof S.lth!=='object')S.lth={};const o=S.lth;if(!o.k||typeof o.k!=='object')o.k={};if(!o.seen||typeof o.seen!=='object')o.seen={};return o;}
function lthMark(uid){const o=lthS(),now=pvpNow(),e=o.k[uid];if(e&&now-e[1]<600000)e[0]++;else o.k[uid]=[1,now];try{RL.mp.putT=0;RL.mp.last='';}catch(e2){}}
{const _fd=foeDamage;foeDamage=function(f,dmg){const al=f&&f.rf&&f.alive&&!f.civ;const r=_fd.apply(this,arguments);try{if(al&&!f.alive){lthMark(f.rf);save();}}catch(e){}return r;};}
{const _mp=mpPut;mpPut=function(path,data){try{if(S&&S.lth&&MP.uid&&path==='sites/'+MP.uid&&data&&typeof data==='object'){const F={},now=pvpNow();let n=0;for(const u in S.lth.k){const e=S.lth.k[u];if(n<8&&mpIdOk(u)&&now-e[1]<1800000){F[u]=[Math.min(10,e[0]|0),e[1]];n++;}}if(n)data.F=F;}}catch(e){}return _mp.apply(this,arguments);};}
function lthIn(docs){if(!S||!pvpOn())return;const o=lthS(),now=pvpNow();for(const d of docs){const u=d.id;if(u===MP.uid||!mpIdOk(u))continue;const v=d.data();if(!v||v.w!==seed0()||!v.F||typeof v.F!=='object')continue;const e=v.F[MP.uid];if(!Array.isArray(e)||!mpNum(e[0],1,10)||!mpNum(e[1],1e12,now+600000)||now-e[1]>1800000)continue;
    const p=o.seen[u],delta=p&&p[1]===e[1]?e[0]-p[0]:e[0];o.seen[u]=[e[0],e[1]];if(delta<=0)continue;let n=0;for(const f of S.folk||[]){if(n>=delta)break;if(f.wd||!(f.job==='gate'||f.job==='guard'||f.job==='soldier'))continue;f.job0=f.job;f.job='idle';f.wd=Date.now()+600000;n++;}
    if(n){LTH.t=0;uiToast(`🩸 ${mpName(u)} đã hạ ${n} lính của bạn! Họ bị thương, nghỉ 10 phút mới gác lại được.`,'bad');sfx('hurt');save();}}}
{const _pi=pvpIn;pvpIn=function(docs){try{lthIn(docs);}catch(e){console.warn('lính bị thương',e);}return _pi.apply(this,arguments);};}
setInterval(()=>{try{if(typeof S==='undefined'||!S||!S.folk)return;const now=Date.now();let ch=0;for(const f of S.folk)if(f.wd&&now>f.wd){if(f.job==='idle'&&f.job0)f.job=f.job0;delete f.wd;delete f.job0;ch++;}if(ch){LTH.t=0;uiToast(`🛡️ ${ch} lính đã khoẻ lại, trở về vị trí.`,'good');save();}}catch(e){}},5000);
