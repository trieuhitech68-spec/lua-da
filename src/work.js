/* sức người có hạn: đói, khát, kiệt sức thì không làm nặng được */
function needGate(heavy){const p=S.p;if(p.food<6)return '😫 Đói lả, tay run không làm nổi. Ăn gì đó trước đã (quả, thịt nướng, cá…).';if(p.water<6)return '🥵 Khát khô cổ, hoa mắt. Uống nước trước đã (ra suối hoặc dùng bầu nước).';
  if(heavy&&p.stam<5)return '😮‍💨 Kiệt sức rồi. Ngồi nghỉ một lát, ăn uống cho lại sức.';if(heavy&&p.warm<8)return '🥶 Rét cóng tay, không cầm nổi đồ. Sưởi lửa hoặc mặc áo ấm trước đã.';return null;}
function needSlow(){const p=S.p;let k=1;if(p.food<25)k*=1.35;if(p.water<25)k*=1.3;if(p.stam<12)k*=1.25;if(S.st&&S.st.fever)k*=1.3;return k;}
/* ===================== LÀM VIỆC TỈ MỈ TỪNG CÔNG ĐOẠN ===================== */
/* Mỗi công thức có các bước như ngoài đời: chọn đá → ghè → mài → vót cán → buộc dây...
   Nhân vật làm từng bước (có động tác, âm thanh). Bấm E / nút Hành động trong lúc làm để làm nhanh hơn (chăm chỉ).
   Đi chỗ khác thì dừng, nguyên liệu chỉ bị trừ khi xong. */
const WSTEP={
  stoneTool:[['Chọn đá vừa tay','gather',0.8,'pick'],['Ghè đẽo lưỡi đá','knap',2.2,'mine'],['Mài sắc trên phiến đá','grind',1.6,'step'],['Vót cán gỗ','whittle',1.4,'chop'],['Buộc chặt bằng dây','lash',1.3,'pick']],
  flintTool:[['Chọn mảnh đá lửa','gather',0.7,'pick'],['Ghè tách từng mảnh nhỏ','knap',2.6,'mine'],['Tỉa rìa cho sắc','knap',1.4,'mine'],['Lắp cán, buộc dây','lash',1.4,'pick']],
  rope:[['Tước sợi cây','work',1.0,'pick'],['Se sợi thành dây','lash',1.8,'pick']],
  torch:[['Bó cành khô','lash',0.9,'pick'],['Quấn sợi tẩm nhựa','lash',1.1,'pick']],
  club:[['Chọn khúc gỗ','gather',0.6,'pick'],['Đẽo đầu chùy','carve',1.8,'chop'],['Vót tay cầm','whittle',1.2,'chop']],
  herb:[['Nhặt lá, rửa sạch','work',0.9,'pick'],['Giã nát thảo dược','grind',1.8,'step'],['Gói, bọc lại','lash',1.0,'pick']],
  brew:[['Cho thảo dược vào nồi','cook',0.9,'pick'],['Đun sôi, khuấy đều','cook',2.4,'drink'],['Chắt ra bầu','cook',0.8,'drink']],
  cook:[['Xiên vào que','cook',0.8,'pick'],['Nướng trên lửa','cook',2.6,'step'],['Lật mặt cho chín đều','cook',1.0,'step']],
  bake:[['Nhào bột','grind',1.4,'step'],['Nặn bánh','work',1.0,'pick'],['Nướng trong lò','cook',2.4,'step']],
  sew:[['Cạo sạch mặt da','work',1.4,'step'],['Cắt theo khuôn','work',1.1,'pick'],['Khâu bằng kim xương','lash',2.4,'pick']],
  tan:[['Căng da lên khung','lash',1.0,'pick'],['Cạo mỡ, bôi tro','work',1.8,'step'],['Phơi, vò cho mềm','work',1.6,'step']],
  plank:[['Đặt khúc gỗ lên bàn','gather',0.7,'pick'],['Chẻ dọc thớ gỗ','carve',1.8,'chop'],['Bào phẳng mặt ván','whittle',1.4,'chop']],
  clay:[['Nhào đất sét với nước','grind',1.5,'step'],['Nặn khuôn','work',1.5,'pick'],['Nung trong lò','cook',2.4,'step']],
  carve:[['Vạch hình lên khối gỗ','work',0.9,'pick'],['Đục thô bằng đá','carve',2.2,'chop'],['Khắc từng nét hoa văn','whittle',2.4,'pick'],['Đánh bóng bằng cát','grind',1.3,'step']],
  stoneCarve:[['Chọn viên đá đẹp','gather',0.8,'pick'],['Khoan lỗ bằng que và cát','grind',2.6,'step'],['Mài tròn mặt đá','grind',2.0,'step'],['Đánh bóng','grind',1.2,'step']],
  smelt:[['Đập nhỏ quặng đồng, thiếc','knap',1.6,'mine'],['Xếp than, quạt ống thổi','grind',2.2,'step'],['Nấu chảy trong nồi','cook',2.6,'step'],['Rót vào khuôn đá','work',1.2,'pick']],
  cast:[['Nung lại thỏi đồng','cook',1.6,'step'],['Đổ vào khuôn','work',1.4,'pick'],['Mài sắc lưỡi','grind',2.0,'step'],['Tra cán, buộc chặt','lash',1.2,'pick']],
  bamboo:[['Chọn đốt tre già','gather',0.7,'pick'],['Cắt đốt, chẻ nan','carve',1.6,'chop'],['Đục lỗ, chuốt nhẵn','whittle',1.8,'pick']],
  def:[['Chuẩn bị nguyên liệu','gather',0.8,'pick'],['Làm','work',1.8,'pick'],['Hoàn thiện','work',1.0,'pick']]};
function workSteps(r){if(r.steps)return WSTEP[r.steps]||WSTEP.def;const o=Object.keys(r.out)[0];
  if(['axe','pick','hammer'].includes(o))return WSTEP.stoneTool;if(['knife','spear','sickle'].includes(o))return WSTEP.flintTool;if(o==='rope')return WSTEP.rope;if(o==='torch')return WSTEP.torch;if(o==='club')return WSTEP.club;
  if(r.st==='carve')return WSTEP.carve;if(r.sk==='herb'&&r.tool==='pot')return WSTEP.brew;if(r.sk==='herb')return WSTEP.herb;if(o==='water')return WSTEP.brew;if(o==='bread')return WSTEP.bake;if(r.st==='campfire'||r.st==='hearth')return WSTEP.cook;
  if(r.tool==='needle')return WSTEP.sew;if(r.st==='tanRack')return WSTEP.tan;if(o==='plank')return WSTEP.plank;if(r.st==='kiln')return WSTEP.clay;if(o==='flask'||o==='needle')return WSTEP.bamboo;return WSTEP.def;}
// bắt đầu làm (thay cho chế tạo tức thì)
function workStart(r,times){{const ng=needGate(true);if(ng){uiToast(ng,'bad');sfx('no');return 0;}}const bl=recipeBlock(r);if(bl){uiToast(bl,'bad');sfx('no');return 0;}const out=Object.keys(r.out)[0];if(!invFits(out,r.out[out])){uiToast('Túi đầy.','bad');return 0;}
  const sk=r.sk||(r.st==='campfire'||r.st==='hearth'?'cook':'craft');const sp=(1+skLv(sk)*0.08)*(S.buff&&S.buff.rested>TNOW()?1.15:1);
  const steps=workSteps(r).map(s=>({n:s[0],a:s[1],t:s[2]/sp,fx:s[3]}));G.work={r,steps,i:0,t:0,left:times||1,done:0,x:P.x,z:P.z,sk};G.sit=false;G.act=null;uiClose();workUi();sfx('pick');return 1;}
function workTick(dt){const W=G.work;if(!W)return;if(Math.hypot(P.x-W.x,P.z-W.z)>14||G.swim){workStop('Đã dừng tay giữa chừng.');return;}
  const st=W.steps[W.i];{const ng=needGate(false);if(ng){workStop(ng);return;}}W.t+=dt/needSlow();P.anim=st.a;S.p.stam=Math.max(0,S.p.stam-dt*0.5);G.workA=st.a;W.beat=(W.beat||0)+dt;const br=st.a==='knap'||st.a==='carve'?0.42:st.a==='grind'?0.55:0.7;if(W.beat>br){W.beat=0;sfx(st.fx);if(st.a==='knap'||st.a==='carve')puff(P.x+Math.sin(P.ry)*10,P.y+8,P.z+Math.cos(P.ry)*10,st.a==='knap'?'#cfc8bc':'#c9a274',2);}
  if(W.t>=st.t){W.i++;W.t=0;if(W.i>=W.steps.length&&W.fn){G.work=null;P.anim='idle';W.fn();workUi();return;}if(W.i>=W.steps.length&&W.plant){G.work=null;P.anim='idle';plantDone(W.plant);workUi();return;}if(W.i>=W.steps.length){// xong một món
      const r=W.r,out=Object.keys(r.out)[0];if(recipeBlock(r)){workStop(recipeBlock(r));return;}pay(r.in);invAdd(out,r.out[out]);W.done++;cnt('craft',out,r.out[out]);addXp(W.sk,4);
      if((r.st==='campfire'||r.st==='hearth')&&Math.random()<skLv('cook')*0.04){invAdd(out,1);uiToast('Khéo tay: được thêm 1 '+ITEMS[out].n,'gold');}
      sfx('craft');uiFly&&uiFly(out,r.out[out],[P.x,P.y+20,P.z]);unlockCheck();goalCheck&&goalCheck();uiHotbar();
      if(W.left>1&&!recipeBlock(r)&&invFits(out,r.out[out])){W.left--;W.i=0;W.t=0;}else{G.work=null;P.anim='idle';uiToast(`✅ Làm xong ${W.done>1?W.done+' × ':''}${ITEMS[out].n}.`,'gold');save();}}}
  workUi();}
function workStop(msg){if(!G.work)return;G.work=null;P.anim='idle';workUi();if(msg)uiToast(msg,'');}
function workPush(){const W=G.work;if(!W)return false;const st=W.steps[W.i];W.t+=st.t*0.12;sfx(st.fx);return true;}
function workUi(){const el=$('#work');if(!el)return;const W=G.work;if(!W){el.hidden=true;return;}el.hidden=false;const st=W.steps[W.i],k=clamp(W.t/st.t,0,1),out=W.plant?W.plant.id:W.icon||Object.keys(W.r.out)[0]||'wood';
  const key=out+W.i+'/'+W.left;if(el.dataset.k!==key){el.dataset.k=key;el.innerHTML=`<div class="wk-h">${icon(out)}<b>${esc(ITEMS[out].n)}<small>${W.i+1}/${W.steps.length} · ${esc(st.n)}</small></b>${W.left>1?`<em>còn ${W.left}</em>`:''}<button class="wk-x" data-a="wstop" aria-label="Dừng">✕</button></div>
    <ol>${W.steps.map((s,i)=>`<li class="${i<W.i?'ok':i===W.i?'on':''}">${i<W.i?'✓':i+1}. ${esc(s.n)}</li>`).join('')}</ol><i class="wk-b"><u></u></i><span class="small muted">Bấm <kbd>E</kbd> / Hành động để làm nhanh tay hơn</span>`;}
  const u=el.querySelector('.wk-b u');if(u)u.style.width=Math.round(((W.i+k)/W.steps.length)*100)+'%';}
/* ---------- xây dựng theo công đoạn: đặt khung trước, rồi đóng/buộc cho xong ---------- */
function siteWork(b){const d=pieceDef(b.k);const units=Object.values(d.cost||{}).reduce((a,v)=>a+v,0);return Math.max(1.2,units*0.32);}// giây công
function siteShow(b){const e=SI.get(b.k);if(!e||!e.api)return;const idx=e.map.get(b.id);if(idx==null)return;setPieceM(e.api,idx,b);e.api.flush();}
function siteHit(b){const d=pieceDef(b.k);const tool=hasTool('hammer')?1.5:hasTool('axe')?1.15:1;const add=0.7*tool*(1+skLv('build')*0.07)/siteWork(b);b.prog=Math.min(1,(b.prog||0)+add);S.p.stam=Math.max(0,S.p.stam-1);sfx(d.kind==='roof'?'pick':'build');
  puff(b.x+(Math.random()-0.5)*20,b.y+(d.kind==='floor'?4:24*b.prog),b.z+(Math.random()-0.5)*20,'#cdbb9a',3);siteShow(b);
  if(b.prog>=1){delete b.prog;siteShow(b);siteDone(b);}}
function siteDone(b){const d=pieceDef(b.k);addXp('build',2+Object.values(d.cost).reduce((a,v)=>a+v,0)/6);sfx('build');structFx(b);flameSync();if(d.kind==='roof'||d.kind==='edge')decoRebuild();uiToast(`🏗️ Dựng xong ${d.n}.`,'gold');G.act=null;unlockCheck();save();}
function siteDoneQ(b){return b.prog==null;}
