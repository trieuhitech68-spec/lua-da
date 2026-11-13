/* ---------- CẦM VŨ KHÍ LÀ ĐÁNH, BẮN ĐƯỢC NGAY ----------
   Trước: muốn bắn cung phải biết GIỮ phím G rồi thả (không có nút, không có chỉ dẫn); bấm Hành động khi cầm cung đứng trước cây thì game đòi rìu;
   nút ⚔️ Đánh báo "không có kẻ địch trong 20 m" nên không tập bắn được; tên bay xuyên qua thân cây.
   Giờ: · Cầm cung/nỏ: bấm Hành động (E, nút tròn) hoặc ⚔️ Đánh là giương cung rồi tự thả. Có thú, kẻ địch trong tầm thì tự quay về phía nó; không có thì bắn thẳng hướng đang nhìn.
        · Vẫn GIỮ G (hoặc giữ nút 🎯) để giương lâu cho mạnh và ngắm kỹ như cũ.
        · Tên, giáo, đá trúng thân cây, tảng đá thì cắm lại/rơi xuống, có tiếng và chữ "Trúng đích": tập bắn được, mỗi lần trúng lên một ít tay nghề săn.
        · Lần đầu cầm cung, giáo, đá trong mỗi lần chơi có dòng chỉ cách dùng. */
const VK={hint:{},xp:0};
function vkBow(){const I=ITEMS[P.toolId];return !!(I&&I.tool==='bow');}
function vkShoot(t){if(G.h3aim||G.work||G.swim||G.ride||G.sit||G.sleeping||G.build)return false;if(!vkBow())return false;
  if(invCount('arrow')<1){if(G.t-(VK.na||-9)>4){VK.na=G.t;uiToast('🏹 Hết mũi tên. Chế Mũi tên ở Chế tạo (cành, đá lửa, lông chim) rồi bắn tiếp.','bad');sfx('no');}return true;}
  if(S.p.stam<3){uiToast('Mệt quá, không giương cung nổi.','');return true;}
  try{const o=t&&(t.q||t.a||t.b||(t.x!=null?t:null));if(o&&o.x!=null)P.ry=Math.atan2(o.x-P.x,o.z-P.z);}catch(e){}
  G.walkTo=null;G.act=null;if(!h3aimStart())return false;G.h3aim.auto=1;G.h3aim.key=true;return true;}
// giương đủ căng thì tự thả
if(typeof h3aimTick==='function'){const _at=h3aimTick;h3aimTick=function(dt){const r=_at.apply(this,arguments);try{const A=G.h3aim;if(A&&A.auto&&A.k>=0.92)h3release();}catch(e){}return r;};}
// bấm Hành động khi cầm cung
{const _as=actStart;actStart=function(t){try{if(S&&G.on&&!G.work&&!G.h3aim&&!G.build&&vkBow()){const ty=t&&t.type;
      if(!t||(ty==='res'&&t.q&&RT[t.q.t]&&RT[t.q.t].tool)||((ty==='animal'||ty==='foe')&&t.a&&t.a.alive&&!t.a._h3down&&!t.a.tame)){if(vkShoot(t))return;}}}catch(e){}return _as.apply(this,arguments);};}
// nút ⚔️ Đánh khi cầm cung: bắn mục tiêu gần nhất trong 45 m, không có thì bắn thẳng
if(typeof u7Attack==='function'){const _ua=u7Attack;u7Attack=function(){try{if(S&&G.on&&!G.sleeping&&!G.work&&vkBow()&&invCount('arrow')>0){if(G.sit&&typeof sitToggle==='function')sitToggle(false);const a=u7Enemy(900);if(vkShoot(a?{a}:null))return;}}catch(e){}return _ua.apply(this,arguments);};}
// tên, giáo, đá trúng cây, tảng đá
{const _pt=projTick;projTick=function(dt){try{if(G.proj&&G.proj.length)for(const p of G.proj.slice()){/* xét cả đoạn bay từ khung trước tới khung này: tên bay 30-40 đơn vị mỗi khung, chỉ xét điểm cuối là nhảy qua thân cây */const lx=p._lx==null?p.x:p._lx,ly=p._ly==null?p.y:p._ly,lz=p._lz==null?p.z:p._lz;p._lx=p.x;p._ly=p.y;p._lz=p.z;if(p.t<0.02)continue;
      const sx=p.x-lx,sz=p.z-lz,sl2=sx*sx+sz*sz||1,N=near((p.x+lx)/2,(p.z+lz)/2,60);for(let n=0;n<N.length;n++){const q=RES[N[n]];if(q.st!==0)continue;const D=RT[q.t];if(!D||D.pass||!D.tool)continue;
        const tree=D.tool==='axe',rr=(D.r||6)*q.s*(tree?0.32:0.6)+2.5;let u=((q.x-lx)*sx+(q.z-lz)*sz)/sl2;u=u<0?0:u>1?1:u;const cx=lx+sx*u,cz=lz+sz*u,cy=ly+(p.y-ly)*u,dx=q.x-cx,dz=q.z-cz;if(dx*dx+dz*dz>rr*rr)continue;const top=q.y+(tree?90:26)*q.s;if(cy<q.y-2||cy>top)continue;if(Math.hypot(q.x-P.x,q.z-P.z)<rr+9&&p.t<0.12)continue;/* đang đứng dính sát gốc: để tên bay ra */p.x=cx-sx/Math.sqrt(sl2)*rr;p.y=cy;p.z=cz-sz/Math.sqrt(sl2)*rr;
        G.proj.splice(G.proj.indexOf(p),1);sfx('thud');try{puff(p.x,p.y,p.z,tree?'#a88a62':'#b8b8b0',5);}catch(e){}
        if(Math.hypot(p.x-P.x,p.z-P.z)<900){try{uiFloat&&uiFloat('Trúng đích!','#ffd27a');}catch(e){}if(VK.xp<60){VK.xp++;addXp('hunt',0.6);}if(!VK.told){VK.told=1;uiToast('🎯 Trúng '+D.n.toLowerCase()+'! Tập bắn thế này lên tay nghề săn. Tên chưa gãy rơi dưới gốc, lại nhặt.','good');}}
        if(p.id==='arrow'&&Math.random()<0.35){G.sc.remove(p.o);}else{const bx=p.x-(p.vx||0)*0.02,bz=p.z-(p.vz||0)*0.02;dropAdd(p.id,bx,hAt(bx,bz)+1,bz,p.o);}break;}}}catch(e){if(!VK.e){VK.e=1;console.warn('vũ khí: trúng cây',e);}}
    return _pt.apply(this,arguments);};}
// chỉ cách dùng khi lần đầu cầm vũ khí bắn, ném trong lần chơi này
{const _eq=equip;equip=function(id){const r=_eq.apply(this,arguments);try{if(!S||!G.on||!id)return r;const I=ITEMS[id],touch=matchMedia&&matchMedia('(pointer:coarse)').matches;const k=I&&I.tool==='bow'?'bow':id==='spear'?'spear':null;
      if(k&&!VK.hint[k]&&G.t>3){VK.hint[k]=1;uiToast(k==='bow'?(touch?'🏹 Cầm cung: bấm nút Hành động hoặc ⚔️ Đánh để bắn. Giữ nút 🎯 để giương lâu, bắn mạnh và xa hơn.':'🏹 Cầm cung: bấm E (Hành động) để bắn. GIỮ phím G để giương lâu, thả ra để bắn mạnh và xa hơn.'):(touch?'🔱 Cầm giáo: lại gần bấm Hành động để đâm. Giữ nút 🎯 rồi thả để phóng giáo.':'🔱 Cầm giáo: lại gần bấm E để đâm. GIỮ phím G rồi thả để phóng giáo.'),'');}}catch(e){}return r;};}
if(typeof HD_L!=='undefined')HD_L.push({id:'vukhi',ic:'🏹',t:'Bắn cung, phóng giáo',w:()=>{try{return vkBow()&&invCount('arrow')>0;}catch(e){return false;}},p:['Cầm <b>cung</b> (có mũi tên trong túi): bấm <b>Hành động</b> hoặc <b>⚔️ Đánh</b> là giương cung rồi bắn. Có thú hay kẻ địch trong tầm thì tự quay về phía nó.','Muốn bắn mạnh và xa hơn: <b>giữ phím G</b> (điện thoại: giữ nút 🎯) cho cung căng hết rồi thả. Đường chấm vàng chỉ chỗ tên rơi.','Tập bắn vào <b>thân cây</b> hay tảng đá cũng lên tay nghề săn. Tên chưa gãy rơi dưới gốc, lại gần nhặt lại. <b>Giáo</b> và <b>đá</b> ném theo cùng cách.']});
// dòng nhắc trên màn hình khớp với việc sẽ làm: cầm cung thì là "Bắn", không phải "Chặt — cần rìu"
{const _ti=targetInfo;targetInfo=function(t){const r=_ti.apply(this,arguments);try{if(r&&t&&S&&vkBow()&&!G.work){const na=invCount('arrow')<1;if(t.type==='res'&&t.q&&RT[t.q.t]&&RT[t.q.t].tool)return Object.assign({},r,{verb:na?'Hết mũi tên':'Bắn (tập bắn)',ok:!na,need:na?'Mũi tên':null,icon:P.toolId});
      if((t.type==='animal'||t.type==='foe')&&t.a&&t.a.alive&&!t.a._h3down&&!t.a.tame)return Object.assign({},r,{verb:na?'Hết mũi tên':'Bắn',ok:!na,icon:P.toolId});}}catch(e){}return r;};}
