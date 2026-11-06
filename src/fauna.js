/* ===================== BẮT CÁ, BẮN CHIM, NƯỚNG NHANH BÊN LỬA ===================== */
Object.assign(ITEMS,{birdRaw:{n:'Chim rừng (sống)',t:'food',food:3,raw:0.3},birdCooked:{n:'Chim nướng',t:'food',food:20,hp:3},feather:ITEMS.feather||{n:'Lông chim',t:'res'}});
if(!RECIPES.find(r=>r.id==='birdCooked'))RECIPES.push({id:'birdCooked',out:{birdCooked:1},in:{birdRaw:1},st:'campfire',sk:'cook'});
/* ---------- chim: thỉnh thoảng sà xuống đất kiếm ăn, lúc đó bắn/ném/vồ được ---------- */
function birdLandTick(dt){if(!G.birds)return;for(const b of G.birds){if(b.dead){b.o.visible=false;continue;}
    if(!b.land){if(b.o.visible&&Math.random()<dt*0.025){const a=Math.random()*6.283,d=90+Math.random()*180,x=P.x+Math.cos(a)*d,z=P.z+Math.sin(a)*d;if(wdAt(x,z)<=0&&slopeAt(x,z)<0.8)b.land={x,z,t:8+Math.random()*10,y:hAt(x,z)};}continue;}
    const L=b.land;L.t-=dt;const dp=Math.hypot(P.x-L.x,P.z-L.z),scare=G.sneak?28:G.running?150:75;
    if(L.t<=0||dp<scare||!b.o.visible){b.land=null;b.cx=L.x;b.cz=L.z;sfx&&dp<scare&&sfx('pick');continue;}
    // đứng mổ thóc trên mặt đất
    b.o.position.set(L.x,L.y+1+Math.abs(Math.sin(G.t*9+b.ph))*0.6,L.z);b.o.rotation.set(Math.sin(G.t*6+b.ph)>0.6?0.5:0,b.o.rotation.y+Math.sin(G.t*0.7+b.ph)*dt,0);
    if(b.rig.wingL)b.rig.wingL.rotation.z=0.05;if(b.rig.wingR)b.rig.wingR.rotation.z=-0.05;}}
{const _bt=birdsTick;birdsTick=function(dt){_bt(dt);try{birdLandTick(dt);}catch(e){}};}
function birdHit(b){b.dead=true;b.land=null;b.o.visible=false;const p=b.o.position;give({birdRaw:1,feather:1+(Math.random()<0.5?1:0)},[p.x,p.y+6,p.z]);sfx('thud');puff(p.x,p.y+4,p.z,'#e8e0d0',8);addXp('hunt',2);cnt('cnt','hunt');uiToast('🐦 Hạ được một con chim rừng! Đem nướng bên lửa.','gold');
  setTimeout(()=>{b.dead=false;},90000);}
// mũi tên / đá / giáo bay trúng chim đang đậu hoặc bay thấp
function birdProjCheck(){if(!G.proj||!G.birds)return;for(const pr of G.proj){if(pr.done||pr.stuck)continue;const x=pr.o?pr.o.position.x:pr.x,y=pr.o?pr.o.position.y:pr.y,z=pr.o?pr.o.position.z:pr.z;
    for(const b of G.birds){if(b.dead||!b.o.visible)continue;const q=b.o.position;if(Math.abs(q.x-x)<11&&Math.abs(q.z-z)<11&&Math.abs(q.y-y)<12){birdHit(b);break;}}}}
/* ---------- cá: cá bơi gần bờ nước nông bắt được bằng tay hoặc đâm giáo ---------- */
function fishTarget(){if(!G.fish||G.swim)return null;let best=null,bd=REACH+26;for(const f of G.fish){if(!f.live||!f.o.visible)continue;const d=Math.hypot(f.x-P.x,f.z-P.z);if(d<bd&&wdAt(f.x,f.z)<16){bd=d;best=f;}}return best;}
{const _ft=findTarget;findTarget=function(){const t=_ft();if(G.work||G.sit)return t;
    // chim đang đậu ở gần: vồ bắt khi rón rén (ưu tiên nếu gần hơn mục tiêu kia)
    if(G.birds)for(const b of G.birds){if(!b.land||b.dead)continue;const d=Math.hypot(b.land.x-P.x,b.land.z-P.z);if(d<REACH+12&&(!t||t.type==='water'||t.d==null||d-4<t.d))return {type:'birdv',b};}
    if(t&&t.type!=='water'&&t.type!=='res')return t;
    const f=fishTarget();if(f&&(!t||t.type==='water'||(t.d!=null&&t.d>8)))return {type:'fishv',f};return t;};}
{const _ti=targetInfo;targetInfo=function(t){if(t&&t.type==='fishv'){const sp=hasTool('spear');return {name:'Cá đang bơi',verb:sp?'Đâm cá':'Bắt cá bằng tay',ok:true,icon:'fish'};}
    if(t&&t.type==='birdv')return {name:'Chim rừng đang kiếm ăn',verb:G.sneak?'Vồ bắt':'Rón rén (Khom) rồi vồ',ok:true,icon:'birdRaw'};
    if(t&&t.type==='build'&&t.b.prog==null){const d=pieceDef(t.b.k);if(d&&(t.b.k==='campfire'||t.b.k==='hearth'||d.st==='campfire')&&fireLit(t.b)){const raw=rawHeld();if(raw)return {name:d.n,verb:'Nướng '+ITEMS[raw.id].n.replace(/\s*\(?sống\)?/i,'').toLowerCase(),ok:true,icon:raw.id};}}
    return _ti(t);};}
function rawHeld(){const s=S.inv[S.sel];const ids=s?[s.id]:[];for(const x of S.inv)if(x&&!ids.includes(x.id))ids.push(x.id);
  for(const id of ids){const I=ITEMS[id];if(!I||I.t!=='food'||!I.raw)continue;const r=RECIPES.find(r=>(r.st==='campfire'||r.st==='hearth')&&Object.keys(r.in).length===1&&r.in[id]===1);if(r)return {id,r};}return null;}
{const _as=actStart;actStart=function(t){if(t&&t.type==='fishv'){fishGrab(t.f);return;}if(t&&t.type==='birdv'){birdGrab(t.b);return;}
    if(t&&t.type==='build'&&t.b.prog==null&&fireLit(t.b)&&(t.b.k==='campfire'||t.b.k==='hearth')){const raw=rawHeld();if(raw){quickRoast(t.b,raw);return;}}return _as(t);};}
function fishGrab(f){const ng=needGate(false);if(ng){uiToast(ng,'bad');return;}const sp=hasTool('spear');if(sp)selectTool('spear');P.ry=Math.atan2(f.x-P.x,f.z-P.z);G.throwAnim=0.45;S.p.stam=Math.max(0,S.p.stam-(sp?2:3));S.p.wet=Math.min(100,(S.p.wet||0)+6);
  sfx('drink');puff(f.x,(waterAt(f.x,f.z)>-900?waterAt(f.x,f.z):0)+1,f.z,'#cfe8ff',6);const ch=(sp?0.38:0.16)+skLv('hunt')*0.03+(G.sneak?0.08:0);
  if(Math.random()<ch){f.live=false;f.o.visible=false;give({fish:1},[P.x,P.y+12,P.z]);addXp('hunt',2);cnt('cnt','fish');uiToast(sp?'🐟 Đâm trúng một con cá!':'🐟 Chộp được một con cá bằng tay!','gold');}
  else uiToast(sp?'Trượt rồi, cá lủi mất. Đâm tiếp!':'Cá trơn tuột khỏi tay. Rón rén (Khom) lại gần rồi chộp tiếp, hoặc làm giáo để đâm.','');}
function birdGrab(b){if(!b.land)return;const ch=G.sneak?0.45:0.08;P.ry=Math.atan2(b.land.x-P.x,b.land.z-P.z);G.throwAnim=0.4;S.p.stam=Math.max(0,S.p.stam-2);
  if(Math.random()<ch)birdHit(b);else{b.land=null;uiToast(G.sneak?'Chim vỗ cánh bay mất! Thử ném đá hoặc bắn cung khi nó đậu.':'Bước mạnh quá, chim giật mình bay mất. Bấm Khom để rón rén.','');}}
/* ---------- nướng nhanh: cầm đồ sống, bấm Hành động ở đống lửa ---------- */
function quickRoast(b,raw){const out=Object.keys(raw.r.out)[0];uiClose();
  G.work={r:{out:{},in:{}},steps:[{n:'Xiên vào que',a:'whittle',t:0.9,fx:'pick'},{n:'Hơ trên lửa, trở đều',a:'cook',t:2.4,fx:'step'},{n:'Thổi bớt tro, để nguội',a:'cook',t:0.8,fx:'drink'}],i:0,t:0,left:1,done:0,x:P.x,z:P.z,sk:'cook',icon:out,
    fn:()=>{if(!invTake(raw.id,1)){uiToast('Hết '+ITEMS[raw.id].n.toLowerCase()+'.','bad');return;}invAdd(out,raw.r.out[out]);sfx('craft');addXp('cook',2);cnt('craft',out,1);uiToast(`🍖 Đã nướng xong ${ITEMS[out].n}.`,'good');uiHotbar();save();}};workUi();}
/* nhãn "đây là gì" & vòng sáng cho chim đậu và cá */
{const _ps=peekScan;peekScan=function(x,z,rad){const r=_ps(x,z,rad);let best=r,bs=r?r.d:rad;if(G.birds)for(const b of G.birds){if(!b.land||b.dead)continue;const d=Math.hypot(b.land.x-x,b.land.z-z)-4;if(d<bs){bs=d;best={lab:'Chim rừng',tag:'',d};}}
  if(G.fish)for(const f of G.fish){if(!f.live)continue;const d=Math.hypot(f.x-x,f.z-z)-4;if(d<bs){bs=d;best={lab:'Cá',tag:'res',d};}}return best;};}
{const _hs=hlScan;hlScan=function(){_hs();const L=G.hlList;if(G.fish)for(const f of G.fish){if(f.live&&Math.hypot(f.x-P.x,f.z-P.z)<90&&L.length<HL_N)L.push({t:{type:'fishv',f,q:null},x:f.x,z:f.z,r:7,d:0,fish:1});}
  if(G.birds)for(const b of G.birds){if(b.land&&!b.dead&&Math.hypot(b.land.x-P.x,b.land.z-P.z)<120&&L.length<HL_N)L.push({t:{type:'birdv',b},x:b.land.x,z:b.land.z,r:6,d:0});}};}
{const _hk=hlKind;hlKind=function(t){if(t.type==='fishv')return 'food';if(t.type==='birdv')return 'prey';return _hk(t);};}
// vòng sáng bám theo cá đang bơi
{const _ht=hlTick;hlTick=function(){if(G.hlList)for(const h of G.hlList){if(h.t.type==='fishv'){h.x=h.t.f.x;h.z=h.t.f.z;}}_ht();};}
{const _tk=typeof hlTick==='function';setInterval(()=>{try{birdProjCheck();}catch(e){}},50);}
/* ===================== TÚI ĐỒ: chạm là xem, muốn đổi chỗ thì bấm "↔ Chuyển" ===================== */
uiSlot=function(i){if(G.moveSlot!=null){const from=G.moveSlot;G.moveSlot=null;if(from!==i){const a=S.inv[from],b=S.inv[i];if(a&&b&&a.id===b.id&&maxStack(a.id)>1){const k=Math.min(a.n,maxStack(b.id)-b.n);b.n+=k;a.n-=k;if(!a.n)S.inv[from]=null;}else{S.inv[from]=b;S.inv[i]=a;}equip(selTool());uiHotbar();save();sfx('pick');}G.selSlot=i;uiOpenRefresh();return;}
  G.selSlot=G.selSlot===i?null:i;uiOpenRefresh();};
{const _bh=bagHtml;bagHtml=function(){let h=_bh();h=h.replace('Chạm một ô để xem. Chạm ô khác để đổi chỗ.','Chạm một ô để xem. Muốn đổi chỗ: chọn món rồi bấm ↔ Chuyển.');
  if(G.moveSlot!=null)h=h.replace('<div class="det">','<div class="mvhint">↔ Chạm ô muốn chuyển tới (chạm lại ô cũ để thôi)</div><div class="det">');
  const sel=G.selSlot;if(sel!=null&&S.inv[sel])h=h.replace(`<button class="btn ghost" data-a="drop" data-i="${sel}">`,`<button class="btn ghost" data-a="mvslot" data-i="${sel}">↔ Chuyển</button><button class="btn ghost" data-a="drop" data-i="${sel}">`);return h;};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="mvslot"]');if(!b)return;e.stopImmediatePropagation();sfx('pick');G.moveSlot=+b.dataset.i;uiOpenRefresh();},true);
{const _uc=uiClose;uiClose=function(){G.moveSlot=null;return _uc.apply(this,arguments);};}
