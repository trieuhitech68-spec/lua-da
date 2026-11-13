/* ---------- CÔNG THÀNH, GIỮ ĐẤT LIÊN MINH ----------
   1) Công phá điểm giàu của phe khác (chơi chung): tới sát tâm điểm giàu đang do phe khác giữ → "Công phá" (40 giây, lính giữ đất xông ra).
      Phá xong ghi sites/<uid>.K={<điểm>:giờ}. Trong 24 giờ kể từ đó mọi phe khác KHÔNG được tính điểm giữ ở điểm ấy,
      phe công phá dựng cột vật tổ là giữ được đất. Người bị phá mất nửa kho tiền đồn.
      Hai liên minh thì phải đang chiến tranh; người chưa vào liên minh nào thì ai cũng đánh được (vào liên minh để được che chở).
   2) Phần chia đất: mỗi ngày, mọi thành viên nhận 30% sản vật của các điểm giàu liên minh mình đang giữ (dồn tối đa 5 ngày), nhận ở bảng Liên minh.
   3) Lính của mình (gác cổng, lính gác, lính theo) cùng giữ tiền đồn khi mình vắng nhà.
   4) Vá: cờ đã hạ rồi không hạ lại trong 24 giờ để cày điểm. */
const CTH={k:{},CD:24*3600000,R:70};
function cthS(){if(!S.ct||typeof S.ct!=='object')S.ct={};const c=S.ct;if(!c.k||typeof c.k!=='object')c.k={};if(!c.seen||typeof c.seen!=='object')c.seen={};if(!c.share||typeof c.share!=='object')c.share={};return c;}
function cthPf(){try{return landFar()?S.land+':':'';}catch(e){return '';}}
function cthNow(){return typeof mpNow==='function'?mpNow():Date.now();}
// lần công phá mới nhất còn hiệu lực ở một điểm: {g: phe công phá, at, uid}
function cthKnock(sid){const now=cthNow(),key=cthPf()+sid;let best=null;const see=(uid,at)=>{if(!(at>0)||now-at>CTH.CD||at>now+600000)return;if(!best||at>best.at)best={g:rlGrp(uid),at,uid};};
  for(const u in CTH.k)if(u!==MP.uid)see(u,CTH.k[u][key]);if(S&&S.ct&&S.ct.k)see(MP.uid,S.ct.k[key]);return best;}
function cthOut(){const k=S&&S.ct&&S.ct.k;if(!k)return null;const o={},now=cthNow();let n=0;for(const i in k){if(n>=8)break;if(now-k[i]<CTH.CD){o[i]=k[i];n++;}}return n?o:null;}
// gắn K vào tài liệu sites/<mình> mỗi lần ghi
{const _mp=mpPut;mpPut=function(path,data){try{if(S&&MP.uid&&path==='sites/'+MP.uid&&data&&typeof data==='object'){const K=cthOut();if(K)data.K=K;}}catch(e){}return _mp.apply(this,arguments);};}
// đọc K của mọi người; mình là người bị phá thì mất nửa kho tiền đồn
{const _pi=pvpIn;pvpIn=function(docs){try{cthIn(docs);}catch(e){console.warn('công thành: đọc',e);}return _pi.apply(this,arguments);};}
function cthIn(docs){const o={},now=cthNow();for(const d of docs){const v=d.data();if(!v||v.w!==seed0()||!v.K||typeof v.K!=='object'||!mpIdOk(d.id))continue;const e={};let n=0;for(const k in v.K){if(n++>=8)break;if(typeof k==='string'&&k.length<40&&mpNum(v.K[k],1e12,now+600000))e[k]=v.K[k];}o[d.id]=e;}
  CTH.k=o;if(!S||!S.rlm)return;const C=cthS(),pf=cthPf(),me=rlGrp(MP.uid);
  for(const s of RL.sites){const kn=cthKnock(s.id);if(!kn||kn.uid===MP.uid||kn.g===me||kn.at<=(C.seen[pf+s.id]||0))continue;C.seen[pf+s.id]=kn.at;const st=S.rlm.s[s.id];if(!st||st.own!=='me')continue;
    for(const i in st.stock)st.stock[i]=Math.floor(st.stock[i]/2);uiToast(`🔥 ${esc(rlGName(kn.g))} đã công phá tiền đồn ${s.def.n} của bạn! Mất nửa kho, 24 giờ tới không tính điểm giữ đất.`,'bad');sfx('hurt');save();}
  try{rlMpCalc();}catch(e){}}
// trong 24 giờ sau khi bị công phá: chỉ phe công phá được tính giữ đất
{const _c=rlMpCalc;rlMpCalc=function(){_c.apply(this,arguments);try{for(const s of RL.sites){const c=RL.mp.ctl[s.id];if(!c)continue;const kn=cthKnock(s.id);if(!kn)continue;const L=c.all.filter(a=>a[0]===kn.g);
      RL.mp.ctl[s.id]=L.length?{g:kn.g,sc:L[0][1],g2:null,sc2:0,con:false,all:L,kn:kn.at}:null;}}catch(e){}};}
function cthWhy(s,c){if(!c)return 'chưa ai giữ';const me=rlGrp(MP.uid);if(c.g===me)return 'đất của phe mình';if((typeof heroLv==='function'?heroLv():1)<PVP_MINLV)return 'cần nhân vật cấp '+PVP_MINLV;
  const mc=mpMyClan(),oc=c.g.startsWith('u:')?null:c.g;if(mc&&oc&&!pvpWarWith(mc,oc))return 'thủ lĩnh phải tuyên chiến trước';
  if(!oc){const p=MP.players[c.g.slice(2)];if(p&&(p.hl|0)<PVP_MINLV)return 'chủ đất còn dưới cấp '+PVP_MINLV+', đang được che chở';}
  const kn=cthKnock(s.id);if(kn)return 'vừa bị công phá, còn '+Math.ceil((CTH.CD-(cthNow()-kn.at))/3600000)+' giờ';return null;}
function cthNear(){if(!rlMpOn()||!S||!S.rlm)return null;for(const s of RL.sites){const d=Math.hypot(s.x-P.x,s.z-P.z);if(d>CTH.R)continue;const c=RL.mp.ctl[s.id];if(!c||c.g===rlGrp(MP.uid))return null;return {type:'ctsiege',sid:s.id,s,c,d};}return null;}
{const _ft=findTarget;findTarget=function(){const r=_ft.apply(this,arguments);if(!S||!S.mp||G.work||G.sit)return r;if(r&&(r.type==='animal'||r.type==='foe'||r.type==='pvpflag'))return r;try{const c=cthNear();return c&&(!r||!cthWhy(c.s,c.c))?c:r;}catch(e){return r;}};}
{const _ti=targetInfo;targetInfo=function(t){if(t&&t.type==='ctsiege'){const why=cthWhy(t.s,t.c);return {name:t.s.def.n+' · '+rlGName(t.c.g)+' giữ',verb:why?'Chưa công phá được':'Công phá, giành đất',ok:!why,need:why,icon:'club'};}return _ti.apply(this,arguments);};}
{const _as=actStart;actStart=function(t){if(t&&t.type==='ctsiege'&&!G.work){cthStart(t);return;}return _as.apply(this,arguments);};}
function cthStart(t){const s=t.s,c=RL.mp.ctl[s.id],why=cthWhy(s,c);if(why){uiToast('Chưa công phá được: '+why+'.','bad');sfx('no');return;}
  try{const ng=needGate(true);if(ng){uiToast(ng,'bad');sfx('no');return;}}catch(e){}
  try{const key='ct:'+s.id;if(!(PVP.spawned[key]&&G.t-PVP.spawned[key]<300)){PVP.spawned[key]=G.t;const n=clamp(3+Math.floor(c.sc/60),3,8),lv=clamp(3+Math.floor(c.sc/80),3,10);let m=0;
      for(let i=0;i<n;i++){const a=i/n*6.283,x=s.x+Math.cos(a)*90,z=s.z+Math.sin(a)*90;if(wdAt(x,z)>0)continue;const f=foeSpawn(x,z,'guard');f.pvp=c.g.startsWith('u:')?c.g.slice(2):c.g;f.noCap=1;f._lvA=1;f.lv=lv;f.n='Lính giữ đất '+rlGName(c.g);f.hp=FOE.hp*2.4*(1+0.4*(lv-1));f.hp0=f.hp;f.dmg=FOE.dmg*(1+0.12*(lv-1));f.home={x:s.x,z:s.z};m++;}
      uiToast(`🛡️ ${m} lính giữ đất xông ra!`,'bad');sfx('hurt');}}catch(e){console.warn('lính giữ đất',e);}
  G.work={r:{out:{}},steps:[{n:'Phá rào, đốt chòi canh',a:'chop',t:16,fx:'thud'},{n:'Quật đổ cột vật tổ của họ',a:'hammer',t:16,fx:'thud'},{n:'Cắm cọc mốc phe mình',a:'lash',t:8,fx:'build'}],i:0,t:0,left:1,done:0,x:P.x,z:P.z,sk:'build',icon:'club',fn:()=>cthDone(s.id)};workUi();}
function cthDone(sid){const s=RL.byId[sid],c=s&&RL.mp.ctl[sid];if(!c||cthWhy(s,c))return;const C=cthS(),now=cthNow(),g=c.g,oc=g.startsWith('u:')?null:g;C.k[cthPf()+sid]=now;
  if(oc&&pvpWarWith(mpMyClan(),oc)){const P0=pvpS();if(!P0.ws||typeof P0.ws!=='object')P0.ws={};P0.ws[oc]=(P0.ws[oc]||0)+15;}
  {const e=S.rlm.mp[sid]||(S.rlm.mp[sid]=[0,0]);e[0]=Math.min(240,e[0]+30);e[1]=now;}
  const o={};for(const i in s.def.y)if(ITEMS[i])o[i]=Math.max(1,Math.ceil(s.def.y[i]*1.5));G._rlNo=1;try{give(o,[P.x,P.y+20,P.z]);}finally{G._rlNo=0;}addXp('hunt',40);cnt('cnt','ctsiege');sfx('level');try{puff(P.x,P.y+40,P.z,'#ffd27a',18);}catch(e){}
  uiToast(`🏴 Đã công phá ${s.def.n} của ${rlGName(g)}!${oc?' +15 điểm chiến tranh.':''} 24 giờ tới họ không giữ được đất này: hạ người canh, dựng cột vật tổ để phe mình giữ.`,'gold');
  try{RL.mp.putT=0;RL.mp.last='';rlMpCalc();}catch(e){}save();}

/* ---------- phần chia đất liên minh ---------- */
function cthHeld(){if(!rlMpOn())return [];const me=rlGrp(MP.uid);return RL.sites.filter(s=>{const c=RL.mp.ctl[s.id];return c&&c.g===me;});}
{const _rd=rlDaily;rlDaily=function(){const d0=S.rlm&&S.rlm.day;_rd.apply(this,arguments);try{if(d0==null||d0===S.day||!rlMpOn()||!mpMyClan())return;const C=cthS();
    for(const s of cthHeld()){const st=S.rlm.s[s.id];if(st&&st.own==='me')continue;for(const i in s.def.y){if(!ITEMS[i])continue;const add=Math.floor(s.def.y[i]*0.3+Math.random()*0.99);if(add>0){const cur=C.share[i]||0;C.share[i]=Math.max(cur,Math.min(Math.ceil(s.def.y[i]*1.5),cur+add));}}}
    save();}catch(e){console.warn('phần chia đất',e);}};}
function cthShareGet(){const C=cthS(),o={};for(const i in C.share)if(C.share[i]>0&&ITEMS[i])o[i]=C.share[i];if(!Object.keys(o).length){uiToast('Chưa có phần chia. Liên minh giữ điểm giàu thì mỗi ngày bạn được chia 30% sản vật.','');return;}
  G._rlNo=1;try{give(o,[P.x,P.y+20,P.z]);}finally{G._rlNo=0;}C.share={};cnt('cnt','ctshare');sfx('craft');try{uiHotbar();}catch(e){}save();}
function cthHtml(){if(!rlMpOn())return '';const cid=mpMyClan(),H=cthHeld(),C=cthS(),sh=Object.keys(C.share).filter(i=>C.share[i]>0&&ITEMS[i]);
  const rows=H.map(s=>{const c=RL.mp.ctl[s.id];return `<div class="mp-m"><b>${s.def.ic||'🏴'} ${esc(s.def.n)}</b><small class="muted"> · ${c.sc} điểm${c.con?' · <span class="rl-bad">đang tranh chấp</span>':''}</small></div>`;}).join('');
  const foe=RL.sites.filter(s=>{const c=RL.mp.ctl[s.id];return c&&c.g!==rlGrp(MP.uid);}).slice(0,8).map(s=>{const c=RL.mp.ctl[s.id],why=cthWhy(s,c);return `<div class="mp-m"><b>${s.def.ic||'🏴'} ${esc(s.def.n)}</b><small class="muted"> · ${esc(rlGName(c.g))} giữ · ${why?esc(why):'<span style="color:#8ce07a">công phá được</span>'}</small></div>`;}).join('');
  return `<h3>🏰 Đất ${cid?'liên minh':'bạn'} đang giữ (${H.length})</h3>${rows||'<p class="small muted">Chưa giữ điểm giàu nào. Hạ người canh rồi dựng cột vật tổ ở điểm giàu để giữ đất.</p>'}`+
    (cid?`<div class="mp-m"><small>Phần chia của bạn: ${sh.length?sh.map(i=>ITEMS[i].n+' ×'+C.share[i]).join(', '):'chưa có'}</small>${sh.length?'<button class="btn sm" data-a="ctshare" style="margin-left:auto">Nhận</button>':''}</div>`:'')+
    (foe?`<h3>⚔️ Đất phe khác giữ</h3>${foe}`:'')+
    `<p class="hint">Tới sát tâm điểm giàu của phe khác rồi bấm Hành động để <b>công phá</b> (40 giây, lính giữ đất xông ra). Phá xong, 24 giờ họ không giữ được đất đó. Thành viên liên minh được chia 30% sản vật mỗi ngày từ đất liên minh giữ. Lính của bạn cùng giữ tiền đồn khi bạn vắng.</p>`;}
if(typeof pvpWarHtml==='function'){const _wh=pvpWarHtml;pvpWarHtml=function(){let h=_wh.apply(this,arguments);try{h+=cthHtml();}catch(e){console.warn('đất liên minh',e);}return h;};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="ctshare"]');if(!b||!S)return;e.stopImmediatePropagation();cthShareGet();try{mpPanelRefresh();}catch(_){}},true);

/* ---------- lính cùng giữ tiền đồn khi vắng nhà ---------- */
{const _rd=rlDef;rlDef=function(s){const D=_rd.apply(this,arguments);try{const F=(S.folk||[]).filter(f=>f.job==='gate'||f.job==='guard'||f.job==='soldier');if(F.length){const lv=F.reduce((a,f)=>a+(f.lv||1),0)/F.length;D.sol=Math.min(6,F.length);D.v+=D.sol*0.7*(1+0.1*(lv-1));}}catch(e){}return D;};}

/* ---------- vá: cờ đã hạ thì 24 giờ sau mới hạ lại được ---------- */
{const _fs=pvpFlagStart;pvpFlagStart=function(t){try{const z=S.pvp&&S.pvp.zo&&S.pvp.zo[t.cid];if(z&&pvpNow()-z<PVP_FLAGCD){uiToast('Cờ này bạn vừa hạ rồi. Chờ thủ lĩnh của họ nhận tin.','bad');sfx('no');return;}}catch(e){}return _fs.apply(this,arguments);};}
if(typeof HD_L!=='undefined')HD_L.push({id:'congthanh',ic:'🏴',t:'Công phá đất của phe khác',w:()=>{try{return !!cthNear();}catch(e){return false;}},p:['Bạn đang đứng ở tâm một <b>điểm giàu do phe khác giữ</b>. Bấm nút <b>Hành động</b> để công phá (40 giây). Lính giữ đất sẽ xông ra: hạ họ hoặc cầm cự cho xong.','Hai liên minh phải <b>đang chiến tranh</b> mới công phá được nhau (thủ lĩnh tuyên chiến ở bảng Liên minh). Người chưa vào liên minh thì ai cũng đánh được.','Phá xong, 24 giờ họ không giữ được đất này. Hạ người canh rồi <b>dựng cột vật tổ</b> để phe bạn giữ. Xem đất đang giữ và phần chia ở bảng <b>Liên minh</b>.']});
