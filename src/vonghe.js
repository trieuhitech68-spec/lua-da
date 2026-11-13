/* ===================== VÕ NGHỆ: LIÊN HOÀN ĐÒN · SỞ TRƯỜNG TỪNG LOẠI VŨ KHÍ · TUYỆT KỸ =====================
   Trước: đánh nhau chỉ là giữ nút Đánh, vũ khí nào cũng như nhau ngoài con số sức đánh.
   1. LIÊN HOÀN: đánh trúng liên tiếp cùng một mục tiêu (không nghỉ quá 2,5 giây) thì cộng dồn, mỗi tầng +8% sát thương (tối đa 5 tầng).
      Đòn thứ 3 và thứ 5 là ĐÒN KẾT: ×1,6 sát thương, làm đối thủ choáng 0,8 giây. Bị trúng đòn thì mất chuỗi.
   2. SỞ TRƯỜNG theo loại vũ khí (luôn có khi cầm):
        Giáo   : 25% đòn gây CHẢY MÁU (mất máu dần 4 giây).           Dao  : 25% đòn CHÍ MẠNG ×2.
        Rìu    : mỗi đòn PHÁ GIÁP, đối thủ nhận thêm 15% trong 5 giây.  Chùy/kiếm: 20% đòn làm CHOÁNG 1,2 giây.
        Cung/nỏ: kéo căng hết cỡ rồi mới buông thì +30% sát thương.
   3. TUYỆT KỸ (cấp 5, nút 🔥 ở trang Kỹ năng, phím Y): tuỳ vũ khí đang cầm
        Giáo: Xuyên tâm (đâm thẳng xuyên mọi kẻ địch trước mặt 6 m, ×2,2)      Dao: Liên trảm (3 nhát nhanh ×0,9 vào kẻ gần nhất)
        Rìu : Bổ xoáy (×1,8 mọi kẻ địch quanh 4 m, phá giáp)                  Chùy/kiếm: Bổ đôi (×2,8 vào kẻ gần nhất, choáng 2 giây)
        Cung/nỏ: Tam tiễn (bắn 3 mũi tên toả quạt, tốn 3 tên)                 Tay không: Đá xoay (×1,5 quanh 3 m, đẩy lùi)
   Thú chúa và thú lớn (gấu, hổ, cá sấu) chỉ choáng nửa thời gian. */
const VN={tg:null,n:0,t:0,dot:[],stun:[],on:0};
const vnTool=()=>{try{const id=P.toolId,I=id&&ITEMS[id];return I&&I.t==='tool'?I.tool:null;}catch(e){return null;}};
function vnStun(e,sec){try{if(!e||e.alive===false)return;const big=e.boss||((ANIMALS[e.kind]||{}).hp||0)>=12;sec*=big?0.5:1;const until=G.t+sec;if(e._vnS>G.t){e._vnS=Math.max(e._vnS,until);return;}e._vnS=until;e._vnSp=e.spd;e._vnX=e.x;e._vnZ=e.z;VN.stun.push(e);}catch(er){}}
function vnTick(){try{if(typeof G==='undefined'||!G.on)return;for(let i=VN.stun.length-1;i>=0;i--){const e=VN.stun[i];if(!e||e.alive===false||e._vnS<=G.t){if(e){e._vnS=0;}VN.stun.splice(i,1);continue;}/* choáng: đứng yên tại chỗ, không ra đòn */e.x=e._vnX;e.z=e._vnZ;e.atkT=Math.max(e.atkT||0,0.6);if(e.o)e.o.position.x=e.x,e.o.position.z=e.z;}
    if(VN.n&&G.t-VN.t>2.5){VN.n=0;VN.tg=null;}}catch(e){}}
setInterval(vnTick,50);
setInterval(()=>{try{if(typeof G==='undefined'||!G.on)return;for(let i=VN.dot.length-1;i>=0;i--){const d=VN.dot[i];if(!d.e||d.e.alive===false||--d.n<0){VN.dot.splice(i,1);continue;}VN.on++;try{(d.foe?foeDamage:animalDamage)(d.e,d.v);}finally{VN.on--;}try{puff(d.e.x,(d.e.y||0)+12,d.e.z,'#b01818',2);}catch(e){}}}catch(e){}},1000);
/* đòn đánh của NGƯỜI CHƠI đi qua hitTarget → animalHit: đánh dấu để chỉ áp võ nghệ cho đòn của người chơi (không áp cho lính, sủng thú, bẫy) */
{const _ht=hitTarget;hitTarget=function(t){const mine=t&&(t.type==='animal'||t.type==='foe');if(mine)VN.pl=1;try{return _ht.apply(this,arguments);}finally{VN.pl=0;}};}
function vnApply(e,dmg,foe){if(!VN.pl||VN.on||!e||e.alive===false)return dmg;const tl=vnTool();let m=1,tag='';
  if(VN.tg===e&&G.t-VN.t<=2.5)VN.n=Math.min(5,VN.n+1);else{VN.tg=e;VN.n=1;}VN.t=G.t;m*=1+0.08*(VN.n-1);
  if(VN.n===3||VN.n===5){m*=1.6;vnStun(e,0.8);tag='ĐÒN KẾT';}
  if(e._vnBr>G.t)m*=1.15;
  if(tl==='spear'&&Math.random()<0.25){VN.dot.push({e,foe,n:4,v:Math.max(0.3,dmg*0.18)});tag=tag||'Chảy máu';}
  else if(tl==='knife'&&Math.random()<0.25){m*=2;tag='CHÍ MẠNG';}
  else if(tl==='axe'){e._vnBr=G.t+5;}
  else if(tl==='club'&&Math.random()<0.2){vnStun(e,1.2);tag=tag||'Choáng';}
  try{const y=(e.y||hAt(e.x,e.z))+(e._hgt||30);if(VN.n>=2)uiFloat('×'+VN.n+(tag?' '+tag:''),e.x,y+10,e.z,VN.n>=3?'#ffb020':'#ffe6a0');else if(tag)uiFloat(tag,e.x,y+10,e.z,'#ffb020');}catch(er){}
  return dmg*m;}
{const _ad=animalDamage;animalDamage=function(a,dmg){return _ad.call(this,a,vnApply(a,dmg,0));};const _fd=foeDamage;foeDamage=function(f,dmg){return _fd.call(this,f,vnApply(f,dmg,1));};}
/* bị trúng đòn: mất chuỗi */
setInterval(()=>{try{if(typeof S==='undefined'||!S||!G.on)return;const hp=S.p.hp;if(VN._hp!=null&&hp<VN._hp-0.5&&VN.n){VN.n=0;VN.tg=null;}VN._hp=hp;}catch(e){}},200);
/* cung, nỏ: kéo căng hết cỡ +30% */
if(typeof h3release==='function'){const _hr=h3release;h3release=function(){const A=G.h3aim,full=A&&A.bow&&A.k>=0.98,n0=G.proj?G.proj.length:0;const r=_hr.apply(this,arguments);try{if(full&&G.proj&&G.proj.length>n0){G.proj[G.proj.length-1].pow*=1.3;uiFloat('Căng hết cỡ',P.x,P.y+52,P.z,'#ffe6a0');}}catch(e){}return r;};}
/* ---------- TUYỆT KỸ ---------- */
const VN_ULT={spear:['Xuyên tâm','🔱'],knife:['Liên trảm','🗡️'],axe:['Bổ xoáy','🪓'],club:['Bổ đôi','⚔️'],bow:['Tam tiễn','🏹'],none:['Đá xoay','🦵']};
KNS.push({id:'wp',lv:5,ic:'🔥',n:'Tuyệt kỹ',d:'Chiêu mạnh tuỳ vũ khí đang cầm: giáo Xuyên tâm, dao Liên trảm, rìu Bổ xoáy, chùy/kiếm Bổ đôi, cung Tam tiễn, tay không Đá xoay.',st:22,cd:14,key:'KeyY'});
function vnEnemies(r){const L=[];for(const a of (G.animals||[])){if(a.alive&&a.o&&a.o.visible&&!a.tame&&!(S.pets||[]).includes(a)){const d=Math.hypot(a.x-P.x,a.z-P.z)-(a.r||8);if(d<r)L.push({e:a,d,foe:0});}}for(const f of (G.foes||[])){if(f.alive&&!(f.lone&&!f.prov)){const d=Math.hypot(f.x-P.x,f.z-P.z)-(f.r||9);if(d<r)L.push({e:f,d,foe:1});}}return L.sort((a,b)=>a.d-b.d);}
function vnHit(t,dmg){VN.on++;try{(t.foe?foeDamage:animalDamage)(t.e,dmg);}finally{VN.on--;}}
function vnUlt(){const tl=vnTool(),k=VN_ULT[tl]?tl:'none',base=(typeof fistPow==='function'?fistPow():1)*(1+0.06*skLv('hunt'));let n=0;
  if(k==='bow'){const have=invCount('arrow');if(have<1||typeof h3aimStart!=='function'){uiToast('Tam tiễn cần ít nhất 1 mũi tên.','bad');return false;}const ry0=P.ry;for(const off of [-0.16,0,0.16].slice(0,Math.min(3,have))){try{P.ry=ry0+off;if(h3aimStart()){G.h3aim.t0=G.t-5;G.h3aim.k=1;G.h3aim.tg=null;const A=G.h3aim;h3release();n++;}}catch(e){}}P.ry=ry0;if(!n)return false;}
  else if(k==='spear'){const fx=Math.sin(P.ry),fz=Math.cos(P.ry);for(const t of vnEnemies(130)){const dx=t.e.x-P.x,dz=t.e.z-P.z,along=dx*fx+dz*fz,side=Math.abs(dx*fz-dz*fx);if(along>-5&&side<22+(t.e.r||8)){vnHit(t,base*2.2);n++;}}try{for(let i=1;i<=5;i++)puff(P.x+fx*i*24,P.y+18,P.z+fz*i*24,'#ffe6a0',3);}catch(e){}}
  else if(k==='knife'){const t=vnEnemies(46)[0];if(t){n=1;vnHit(t,base*0.9);setTimeout(()=>{try{if(t.e.alive!==false)vnHit(t,base*0.9);}catch(e){}},160);setTimeout(()=>{try{if(t.e.alive!==false)vnHit(t,base*0.9);}catch(e){}},320);}}
  else if(k==='axe'){for(const t of vnEnemies(80)){t.e._vnBr=G.t+5;vnHit(t,base*1.8);n++;}try{for(let i=0;i<8;i++){const an=i/8*6.283;puff(P.x+Math.sin(an)*55,P.y+16,P.z+Math.cos(an)*55,'#ffd27a',3);}}catch(e){}}
  else if(k==='club'){const t=vnEnemies(50)[0];if(t){vnHit(t,base*2.8);vnStun(t.e,2);n=1;try{puff(t.e.x,(t.e.y||P.y)+20,t.e.z,'#fff2c0',10);G.shakeCam=0.35;}catch(e){}}}
  else{for(const t of vnEnemies(60)){vnHit(t,base*1.5);const an=Math.atan2(t.e.x-P.x,t.e.z-P.z);t.e.x+=Math.sin(an)*30;t.e.z+=Math.cos(an)*30;n++;}}
  G.punchT=0.4;try{uiFloat(VN_ULT[k][1]+' '+VN_ULT[k][0]+(n?'':' (trượt)'),P.x,P.y+60,P.z,'#ffb020');}catch(e){}return true;}
{const _ku=knUse;knUse=function(id){if(id!=='wp')return _ku.apply(this,arguments);const c0=KN.cd.wp||0;_ku.apply(this,arguments);if((KN.cd.wp||0)>c0&&(KN.cd.wp||0)>G.t){/* đã trừ thể lực và tính hồi chiêu: ra đòn */if(vnUlt()===false){KN.cd.wp=0;S.p.stam=Math.min(maxStam(),S.p.stam+22);try{knUi(true);}catch(e){}}}};}
/* tên chiêu trên nút đổi theo vũ khí đang cầm */
setInterval(()=>{try{const b=document.querySelector('.kn-b[data-kn="wp"] i');if(!b||typeof G==='undefined'||!G.on)return;const tl=vnTool(),u=VN_ULT[VN_ULT[tl]?tl:'none'];if(b.textContent!==u[0])b.textContent=u[0];}catch(e){}},700);
if(typeof HD_L!=='undefined')HD_L.push({id:'vonghe',ic:'⚔️',t:'Võ nghệ: liên hoàn và tuyệt kỹ',w:()=>VN.n>=2||(typeof heroLv==='function'&&heroLv()>=5&&G.foes&&G.foes.some(f=>f.alive&&Math.hypot(f.x-P.x,f.z-P.z)<400)),p:['Đánh trúng <b>liên tiếp</b> một mục tiêu sẽ cộng dồn: mỗi tầng +8% sát thương (tối đa ×5). Đòn thứ 3 và thứ 5 là <b>ĐÒN KẾT</b>: mạnh ×1,6 và làm đối thủ choáng. Bị trúng đòn thì mất chuỗi, nên biết <b>Đỡ</b> và <b>Né</b>.','Mỗi loại vũ khí có <b>sở trường</b>: giáo gây chảy máu, dao có đòn chí mạng ×2, rìu phá giáp, chùy và kiếm làm choáng, cung nỏ kéo căng hết cỡ thì mạnh hơn 30%.','Từ cấp 5 có <b>🔥 Tuyệt kỹ</b> (trang Kỹ năng, phím Y): chiêu khác nhau tuỳ vũ khí đang cầm, tên chiêu ghi ngay trên nút. Tốn 22 thể lực, hồi 14 giây.']});
