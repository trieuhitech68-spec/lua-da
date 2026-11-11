/* ===================== ĐÁNH ĐỠ · GIÁP KHIÊN · NÁ · HANG TỐI · CÀNG KÉO · THÚ DI CƯ · CƯỠI TRÂU · ĐI ĐƯỜNG · TỈNH DẬY (more3.js) =====================
   1. ĐÁNH CÓ ĐỠ CÓ NÉ: khi thú dữ hay kẻ cướp lao tới, hiện hai nút 🛡️ Đỡ (giữ: đỡ đòn, tốn sức) và 💨 Né (lách người, tránh hẳn một đòn).
      Giáp: áo giáp da (da sống nhiều lớp), giáp mây đan (mây, nan tre: người miền núi dùng tới thời cận đại), tấm che ngực bằng đồng
      (thời Đông Sơn). Khiên mây, khiên gỗ bọc da. Giáp, khiên mòn dần, vá như áo. Ná dây ném đá (dây ná/sling) bắn đá xa và mạnh hơn ném tay.
      Số máu trừ bay lên mỗi đòn trúng thú, rung máy khi bị đánh, khi lên cấp có hào quang.
   2. HANG TỐI: vài hang đá vôi sâu trong vùng núi đá. Phải cầm đuốc mới vào; đi sâu từng ngách: tranh vẽ trên vách (son đỏ, than),
      mộ táng cổ (người Hòa Bình chôn người chết trong hang), mạch nước ngầm, dơi, ngách hẹp, và gấu ngủ trong hang (mùa đông ngủ đông).
      Đuốc cháy dần, hết đuốc mà không có đuốc dự phòng thì phải mò ra. Ngách sâu nhất có kho đồ quý (mỗi hang một lần).
      Gấu: lẻn qua, đánh ngay trong hang, hoặc ném đá dụ nó ra cửa hang mà đánh (gấu thật xuất hiện ngoài hang).
   3. CÀNG KÉO (travois): hai sào dài buộc khung, một đầu kéo lê trên đất: thổ dân săn bắt dùng chở đồ trước khi có bánh xe.
      +8 ô đồ nhưng đi chậm hơn; cưỡi trâu thì trâu kéo, không chậm.
   4. THÚ DI CƯ, ĐẠI SĂN: đầu xuân và đầu thu có đàn nai (thời Đông Sơn thêm bò tót) băng qua vùng, đi trong một ngày rưỡi rồi khuất.
      Ba con đầu tiên săn được trong mùa đại săn cho thêm thịt, da và tiếng thơm.
   5. CƯỠI TRÂU: trâu đã lớn (more.js) cưỡi được: đi nhanh hơn, không mệt, lội nước thoải mái. Voi cần mô hình riêng nên chưa có.
   6. ĐI ĐƯỜNG: lưu nhiều mốc (nhà, làng, hang, chỗ đánh rơi đồ, đàn thú…), bấm 🚶 Tự đi: nhân vật tự đi theo đường mòn tới mốc,
      chạm cần điều khiển hoặc có thú dữ là dừng. Không dịch chuyển tức thời (thời đó chỉ có đôi chân).
   7. TỈNH DẬY: ngất đi thì chọn chỗ tỉnh dậy (nhà, bếp lửa, chòi canh, làng, trảng khởi đầu); đồ đánh rơi còn nằm ở chỗ ngất
      ba ngày, quay lại nhặt (để lâu thú tha mất).
   8. CHẾ NHANH: nút ⭐ mở các công thức đã đánh dấu ★ để làm ngay, khỏi mở bảng chế tạo.
   Lưu ở S.m2 (more2.js). Nhẹ máy: kiểm tra mỗi 0,3–0,5 giây, không quét cả thế giới mỗi khung. */

const M3K={};
/* ===================== 1. VẬT PHẨM, CÔNG THỨC ===================== */
Object.assign(ITEMS,{
  hideArmor:{n:'Áo giáp da',t:'wear',slot:'armor',warm:4,dur:320,arm:0.15,mat:'hide',ds:'Nhiều lớp da sống phơi cứng, khâu chồng lên nhau: đỡ được nanh vuốt, mũi tên. Giảm 15% sát thương.'},
  rattanArmor:{n:'Giáp mây đan',t:'wear',slot:'armor',warm:1,dur:380,arm:0.25,mat:'bark',ds:'Sợi mây, nan tre đan dày nhiều lớp như áo giáp mây của người miền núi: nhẹ, thoáng, đỡ chém tốt. Giảm 25% sát thương.'},
  bronzeArmor:{n:'Tấm che ngực bằng đồng',t:'wear',slot:'armor',warm:0,dur:700,arm:0.35,mat:'bronze',ds:'Tấm đồng thau đúc mỏng buộc trên áo da, che ngực và bụng như của chiến binh Đông Sơn. Giảm 35% sát thương.'},
  rattanShield:{n:'Khiên mây',t:'wear',slot:'shield',warm:0,dur:200,blk:0.62,mat:'bark',ds:'Khiên tròn đan mây dày, có quai nắm sau lưng. Giữ nút Đỡ để chặn đòn (đỡ 62%).'},
  hideShield:{n:'Khiên gỗ bọc da',t:'wear',slot:'shield',warm:0,dur:300,blk:0.75,mat:'hide',ds:'Ván gỗ ghép bọc da trâu: nặng nhưng chắc. Giữ nút Đỡ để chặn đòn (đỡ 75%).'},
  sling:{n:'Dây ná ném đá',t:'tool',tool:'sling',pow:0.7,ds:'Hai sợi dây buộc vào túi da nhỏ: quay tròn rồi buông một đầu, viên đá bay xa và mạnh gấp đôi ném tay. Cầm ná, có đá trong túi, giữ nút Ném để quay.'},
  travois:{n:'Càng kéo',t:'pack',pk:'drag',slots:8,ds:'Hai cây sào dài buộc chéo, đầu kia kéo lê trên đất, giữa căng da chở đồ: +8 ô đồ nhưng đi chậm hơn. Cưỡi trâu thì trâu kéo hộ.'},
  quartz:{n:'Pha lê thạch anh',t:'res',ds:'Tinh thể trong suốt mọc trong hang đá vôi: đẹp, hiếm, đổi được giá.'},
  bearClaw:{n:'Vuốt gấu',t:'res',ds:'Vuốt gấu hang: xâu làm bùa đeo cổ, kẻ đi săn nào cũng mơ có một chiếc.'}});
Object.assign(EMO,{hideArmor:'🦺',rattanArmor:'🧺',bronzeArmor:'🛡️',rattanShield:'🔰',hideShield:'🛡️',sling:'🪢',travois:'🛷',quartz:'💎',bearClaw:'🐾'});
Object.assign(M2V,{hideArmor:10,rattanArmor:12,bronzeArmor:45,rattanShield:5,hideShield:8,sling:2.5,travois:6,quartz:6,bearClaw:8});
RECIPES.push(
  {id:'hideArmor',out:{hideArmor:1},in:{hide:5,sinew:2,rope:1},st:null,tool:'needle',req:['hide','needle'],steps:'sew'},
  {id:'hideArmorL',out:{hideArmor:1},in:{leather:3,rope:2},st:null,tool:'needle',req:['leather'],steps:'sew'},
  {id:'rattanArmor',out:{rattanArmor:1},in:{bambooStrip:12,rope:4,hide:1},st:null,tool:'knife',req:['bambooStrip'],age:2,steps:'mxWeave'},
  {id:'bronzeArmor',out:{bronzeArmor:1},in:{bronze:3,leather:2},st:'smelter',tool:'mould',req:['bronze','mould'],age:4,steps:'cast'},
  {id:'rattanShield',out:{rattanShield:1},in:{bambooStrip:8,rope:2},st:null,req:['bambooStrip'],steps:'mxWeave'},
  {id:'rattanShieldF',out:{rattanShield:1},in:{fiber:12,stick:6,rope:2},st:null,req:['rope'],steps:'mxWeave'},
  {id:'hideShield',out:{hideShield:1},in:{wood:2,hide:2,rope:1},st:null,tool:'axe',req:['wood','hide'],age:1,steps:'mxPlough'},
  {id:'sling',out:{sling:1},in:{rope:2,hide:1},st:null,req:['rope','hide'],steps:'sew'},
  {id:'travois',out:{travois:1},in:{wood:4,rope:4,hide:1},st:null,req:['wood','rope'],steps:'mxPlough'});
if(typeof L4SLOT!=='undefined'){L4SLOT.push(['armor','Giáp','🦺'],['shield','Khiên','🔰']);}
const m3Arm=()=>{const id=S.wear&&S.wear.armor;const I=id&&ITEMS[id];return I&&I.arm?I.arm:0;};
const m3Shield=()=>{const id=S.wear&&S.wear.shield;const I=id&&ITEMS[id];return I&&I.blk?I.blk:0;};
function m3Wear(slot,n){try{const L=l4S(),id=S.wear[slot],I=id&&ITEMS[id];if(!I||!I.dur)return;if(L.wr[slot]==null)L.wr[slot]=I.dur;const was=L.wr[slot];L.wr[slot]=Math.max(0,was-n);
  if(L.wr[slot]<=0){delete S.wear[slot];delete L.wr[slot];uiToast(`💥 ${I.n} đã vỡ nát sau nhiều trận.`,'bad');try{playerInit();}catch(e){}}else if(was>I.dur*0.2&&L.wr[slot]<=I.dur*0.2)uiToast(`🧵 ${I.n} sắp hỏng: vá lại kẻo vỡ.`,'');}catch(e){}}

/* ===================== 2. ĐỠ, NÉ, GIẢM SÁT THƯƠNG ===================== */
const m3Dodging=()=>G.t<(M3K.dgT||0);
function m3Mul(src){if(m3Dodging())return 0;let m=1-m3Arm();if(M3K.blk&&src&&S.p.stam>=4){const fa=Math.atan2(src.x-P.x,src.z-P.z);let d=fa-P.ry;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;
    if(Math.abs(d)<1.9){const b=m3Shield()||0.4;m*=1-b;S.p.stam=Math.max(0,S.p.stam-(m3Shield()?6:9));m3Wear('shield',2);M3K.blkHit=G.t;uiFloat(m3Shield()?'Đỡ!':'Gạt đòn!',P.x,P.y+50,P.z,'#9fd8ff');sfx('hit');m3Vib(25);}}
  if(m3Arm())m3Wear('armor',1);return m;}
function m3Hurt(hp0){const d=hp0-S.p.hp;if(d<=0)return;m3Vib(d>15?[60,40,60]:50);const f=$('#m3hurt');if(f){f.classList.remove('on');void f.offsetWidth;f.classList.add('on');}G.shakeCam=Math.max(G.shakeCam||0,Math.min(0.35,d/50));}
{const _aa=animalAttack;animalAttack=function(a){if(!a||!S)return _aa(a);if(m3Dodging()){a.angry=true;uiFloat('Né!',P.x,P.y+50,P.z,'#c8f0ff');M3K.dgOk=(M3K.dgOk||0)+1;return;}
  const D=ANIMALS[a.kind],old=D?D.dmg:undefined,mul=m3Mul(a),hp0=S.p.hp;if(D)D.dmg=(old||5)*mul;try{_aa(a);}finally{if(D)D.dmg=old;}m3Hurt(hp0);};}
{const _fh=foeHit;foeHit=function(f,t){if(!t||!t.pl||!S)return _fh(f,t);if(m3Dodging()){uiFloat('Né!',P.x,P.y+50,P.z,'#c8f0ff');return;}const old=FOE.dmg,mul=m3Mul(f),hp0=S.p.hp;FOE.dmg=old*mul;try{_fh(f,t);}finally{FOE.dmg=old;}m3Hurt(hp0);};}
// số sát thương bay lên khi đánh trúng thú, kẻ cướp
{const _ad=animalDamage;animalDamage=function(a,dmg){const al=a&&a.alive;_ad(a,dmg);try{if(al&&a.o&&dmg>0){uiFloat('−'+(dmg>=10?Math.round(dmg):(Math.round(dmg*10)/10)),a.x+(Math.random()-0.5)*8,(a.y||0)+(a._hgt||a.r*1.3||20)+22,a.z,a.alive?'#ffe08a':'#ff9b6a');m3Vib(12);if(!a.alive)m3Kill(a);}}catch(e){}};}
{const _fd=foeDamage;foeDamage=function(f,dmg){const al=f&&f.alive;_fd(f,dmg);try{if(al&&dmg>0)uiFloat('−'+(Math.round(dmg*10)/10),f.x,(f.y||0)+50,f.z,'#ffe08a');}catch(e){}};}
function m3Threat(){let best=null,bd=280;for(const a of G.animals||[]){if(!a.alive||!a.angry||!a.o||!a.o.visible)continue;const d=Math.hypot(a.x-P.x,a.z-P.z);if(d<bd){bd=d;best=a;}}
  for(const f of G.foes||[]){if(!f.alive)continue;const d=Math.hypot(f.x-P.x,f.z-P.z);if(d<Math.min(bd,240)){bd=d;best=f;}}return best;}
function m3Dodge(){if(G.t<(M3K.dgCd||0)||G.work||G.swim)return;if(S.p.stam<14){uiToast('Mệt quá, không né nổi.','');return;}S.p.stam-=14;M3K.dgT=G.t+0.45;M3K.dgCd=G.t+0.85;
  let dx=0,dz=0;if(G.joy&&G.joy.on&&Math.hypot(G.joy.x,G.joy.y)>0.2){const cy=Math.cos(G.yaw),sy=Math.sin(G.yaw);dx=G.joy.x*cy+G.joy.y*sy;dz=-G.joy.x*sy+G.joy.y*cy;}
  else{const t=M3K.thr||m3Threat();if(t){const a=Math.atan2(P.x-t.x,P.z-t.z)+(Math.random()<0.5?0.9:-0.9);dx=Math.sin(a);dz=Math.cos(a);}else{dx=-Math.sin(P.ry);dz=-Math.cos(P.ry);}}
  const L=Math.hypot(dx,dz)||1;M3K.dash={vx:dx/L*260,vz:dz/L*260,t:0.22};sfx('jump');addXp('run',0.5);}
function m3DashTick(dt){const D=M3K.dash;if(!D)return;D.t-=dt;if(D.t<=0){M3K.dash=null;return;}const nx=P.x+D.vx*dt,nz=P.z+D.vz*dt,c=collide(nx,nz);if(c){P.x=c[0];P.z=c[1];}else{P.x=nx;P.z=nz;}}
function m3Vib(p){if(typeof m2Vib==='function')m2Vib(p);}
// lên cấp: hào quang, chữ lớn, rung
{const _ax=addXp;addXp=function(k,n){const a=SKILL[k]?skLv(k):0;const r=_ax(k,n);try{if(SKILL[k]&&skLv(k)>a)m3LvFx(k,skLv(k));}catch(e){}return r;};}
function m3LvFx(k,lv){m3Vib([30,50,80]);try{for(let i=0;i<3;i++)setTimeout(()=>puff(P.x,P.y+18+i*12,P.z,'#ffd27a',8),i*120);}catch(e){}const el=document.createElement('div');el.className='m3lv';el.innerHTML=`<b>⬆ Cấp ${lv}</b><span>${esc(SKILL[k])}</span>`;$('#game').appendChild(el);setTimeout(()=>el.remove(),2200);}

/* ===================== 3. NÁ DÂY ===================== */
{const _tw=throwable;throwable=function(){if(P.toolId==='sling')return invCount('stone')>0?'stone':null;return _tw();};}
function m3SlingBoost(n0){if(P.toolId!=='sling'||!G.proj||G.proj.length<=n0)return;const p=G.proj[G.proj.length-1];if(!p||p.id!=='stone'||p._m3)return;p._m3=1;p.vx*=1.45;p.vy*=1.2;p.vz*=1.45;p.pow=(p.pow==null?0.8:p.pow)*2+0.4;cnt('cnt','sling');}
if(typeof h3release==='function'){const _hr=h3release;h3release=function(){const n0=G.proj?G.proj.length:0;_hr();try{m3SlingBoost(n0);}catch(e){}};}
{const _ti=throwIt;throwIt=function(){const n0=G.proj?G.proj.length:0;if(P.toolId==='sling'&&invCount('stone')<1){uiToast('Ná cần đá: nhặt vài hòn đá cho vào túi.','');return;}_ti();try{m3SlingBoost(n0);}catch(e){}};}

/* ===================== 4. HANG TỐI ===================== */
const M3CN=['Hang Dơi','Hang Gấu Ngủ','Hang Nước Ngầm','Hang Bàn Tay Son','Hang Mái Đá','Hang Xương Cổ'];
function m3CavesPlan(){const R=rng(((S.seed|0)*7+4242)>>>0),out=[];let tries=0;
  while(out.length<6&&tries<5000){tries++;const a=R()*6.283,r=Math.sqrt(R())*WR*0.85,x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.hypot(x-SPAWN[0],z-SPAWN[1])<900)continue;
    if(G.village&&Math.hypot(x-G.village.x,z-G.village.z)<700)continue;const sl=slopeAt(x,z),h=hAt(x,z);if(sl<0.45||sl>1.5||h<40||wdAt(x,z)>0||wdAt(x+40,z)>0||wdAt(x,z+40)>0)continue;
    if(out.some(c=>Math.hypot(c.x-x,c.z-z)<1100))continue;const e=14,gx=hAt(x+e,z)-hAt(x-e,z),gz=hAt(x,z+e)-hAt(x,z-e),ry=Math.atan2(-gx,-gz);const mx=x+Math.sin(ry)*30,mz=z+Math.cos(ry)*30;if(wdAt(mx,mz)>0)continue;
    const i=out.length;out.push({id:'c'+i,n:M3CN[i],x,z,ry,mx,mz,N:5+Math.floor(R()*3),bear:i===1||R()<0.35});}
  M3K.caves=out;return out;}
function m3CaveModel(c){const K=K3,a=[],R=rng(m2Hash(c.id+':'+S.seed));for(let i=0;i<7;i++){const an=-1.2+i*0.4,rr=26+R()*8;a.push(K.ico(16+R()*10,'#7a736a',{x:Math.sin(an)*rr,z:-Math.cos(an)*rr*0.6-4,y:6+R()*10,sx:1.2,sy:0.8+R()*0.5},1,0.25,i+3));}
  a.push(K.ico(30,'#6c665e',{y:22,z:-12,sx:1.6,sy:0.9},1,0.2,9));const mouth=K.sphere(17,'#070504',{y:4,z:12,sx:1.05,sy:1.15,sz:0.32},16,10);a.push(mouth);
  a.push(K.ico(5,'#8a8278',{x:-18,z:16,y:2},0,0.2,4),K.ico(4,'#8a8278',{x:16,z:18,y:1.5},0,0.2,5));const g=K.group(a);g.position.set(c.x,hAt(c.x,c.z)-4,c.z);g.rotation.y=c.ry;return g;}
function m3CavesInit(){try{(M3K.caveO||[]).forEach(o=>o.parent&&o.parent.remove(o));M3K.caveO=[];if(!G.sc||!S)return;m3CavesPlan();for(const c of M3K.caves){const o=m3CaveModel(c);G.sc.add(o);M3K.caveO.push(o);try{SCOL.push({x:c.x-Math.sin(c.ry)*8,z:c.z-Math.cos(c.ry)*8,r:26});}catch(e){}}}catch(e){console.warn('hang tối',e);}}
const m3CS=c=>{const M=M2I();const o=M.cave[c.id]||(M.cave[c.id]={});const wk=Math.floor((S.day-1)/7);if(o.wk!==wk){o.wk=wk;o.clr={};}o.clr=o.clr||{};return o;};
// sự kiện từng ngách: cố định theo hang + tuần (đi lại thấy giống nhau trong tuần)
function m3Room(c,i){const st=m3CS(c);if(i>=c.N-1)return st.tr?'empty':'treasure';if(c.bear&&i===Math.min(2,c.N-2))return 'bear';
  if(c.id==='c3'&&i===1)return 'art';if(c.id==='c5'&&i===1)return 'bones';if(c.id==='c2'&&i===1)return 'water';
  const R=rng(m2Hash(c.id+':'+i+':'+st.wk+':'+S.seed));const L=['loot','loot','art','bats','water','squeeze','bones','empty','loot'];return L[Math.floor(R()*L.length)];}
const M3RT={loot:'⛏️ Ngách đá',art:'🎨 Vách có tranh',bones:'💀 Mộ táng cổ',water:'💧 Mạch nước ngầm',bats:'🦇 Đàn dơi',squeeze:'🧗 Ngách hẹp',empty:'🕳️ Ngách trống',bear:'🐻 Hang gấu',treasure:'✨ Ngách sâu nhất'};
function m3CaveEnter(c){if(P.toolId!=='torch'){uiToast('Trong hang tối om: cầm đuốc trên tay rồi mới vào được.','bad');sfx('no');return;}const M=M2I(),cs=m3CS(c);cs.seen=1;
  M3K.exp={c,i:0,fuel:4,res:null,log:[`Bạn giơ đuốc bước vào ${c.n}. Hơi đá lạnh phả vào mặt, nước nhỏ giọt tí tách.`],bear:null,got:{}};G.paused=true;cnt('cnt','cave');sfx('step');uiOpen('m3cave',{});}
function m3CaveExit(msg){const E=M3K.exp;if(!E)return;M3K.exp=null;G.paused=false;if(G.panel==='m3cave')uiClose();P.x=E.c.mx+Math.sin(E.c.ry)*14;P.z=E.c.mz+Math.cos(E.c.ry)*14;P.y=groundY(P.x,P.z);P.ry=E.c.ry;
  const got=Object.entries(E.got).map(([k,n])=>`${n} ${ITEMS[k].n}`).join(', ');uiToast(msg||('🔦 Ra khỏi hang'+(got?`: mang về ${got}.`:'.')),got?'good':'');S.hour=Math.min(23.9,S.hour+0.15*E.i);save();}
function m3Torch(){const E=M3K.exp;E.fuel--;if(E.fuel>0)return true;if(invCount('torch')>1){invTake('torch',1);E.fuel=4;E.log.push('🔥 Đuốc tàn, bạn mồi sang cây đuốc mới.');return true;}
  E.fuel=0;return false;}
function m3Loot(o){const E=M3K.exp;const r={};for(const k in o){if(!ITEMS[k]||o[k]<=0)continue;const left=invAdd(k,o[k]);if(o[k]-left>0){r[k]=o[k]-left;E.got[k]=(E.got[k]||0)+o[k]-left;cnt('get',k,o[k]-left);}}uiHotbar();return Object.entries(r).map(([k,n])=>`${n} ${ITEMS[k].n}`).join(', ')||'(túi đầy, đành để lại)';}
function m3Dmg(n,why){const hp0=S.p.hp;S.p.hp=Math.max(S.mode==='cozy'?5:0,S.p.hp-n*m3Mul(null));m3Hurt(hp0);M3K.exp&&M3K.exp.log.push(`🩸 ${why}: −${Math.round(hp0-S.p.hp)} máu.`);if(S.p.hp<=0){m3CaveExit('Bạn ngất đi trong hang…');die();return false;}return true;}
function m3CaveAct(k){const E=M3K.exp;if(!E)return;const c=E.c,cs=m3CS(c),t=m3Room(c,E.i),L=E.log,R=Math.random,hunt=skLv('hunt');
  if(k==='out'){m3CaveExit();return;}
  if(k==='go'){if(!E.res&&t!=='empty'&&!cs.clr[E.i]&&t==='bear'){L.push('Gấu chắn ngay lối đi: không qua được khi chưa xử lý nó.');return m3Rf();}
    if(!m3Torch()){L.push('🕯️ Đuốc tắt phụt! Tối đen như mực, bạn lần tường mò ra cửa hang.');m3Dmg(6,'Vấp ngã trong bóng tối');if(M3K.exp)m3CaveExit('Đuốc tắt, bạn mò được ra cửa hang. Mang thêm đuốc dự phòng cho lần sau.');return;}
    E.i++;E.res=null;E.bear=null;L.push(`→ Đi sâu vào ngách ${E.i+1}: ${M3RT[m3Room(c,E.i)]}.`);S.p.stam=Math.max(0,S.p.stam-3);addXp('run',0.5);sfx('step');return m3Rf();}
  if(cs.clr[E.i]&&k!=='lure'){L.push('Ngách này bạn đã lục soát rồi.');return m3Rf();}
  const done=msg=>{cs.clr[E.i]=1;E.res=msg;L.push(msg);save();m3Rf();};
  switch(t){case 'loot':{const R2=rng(m2Hash(c.id+E.i+cs.wk));const o=R2()<0.4?{flint:2+Math.floor(R()*3),ochre:1}:R2()<0.7?{bone:2,charcoal:2}:{quartz:1,stone:3};done('Bạn cạy được: '+m3Loot(o)+'.');addXp('mine',3);break;}
    case 'art':if(k==='paint'){if(invCount('ochre')<2||invCount('charcoal')<1){L.push('Cần 2 son đỏ và 1 than để vẽ thêm.');return m3Rf();}invTake('ochre',2);invTake('charcoal',1);cnt('cnt','paint');cnt('cnt','caveart');S.rep=Math.min(100,(S.rep||0)+4);if(typeof l4Spirit==='function')l4Spirit(8,0);done('🖐️ Bạn in bàn tay son đỏ cạnh hình con nai, kể chuyện cuộc săn của mình cho người đời sau.');}
      else{cnt('cnt','caveart');cs.art=1;if(typeof l4Spirit==='function')l4Spirit(5,0);done('🎨 Ánh đuốc lay động, trên vách hiện hình người cầm giáo, đàn nai, mặt người, bàn tay in son đỏ. Người xưa vẽ bằng son (đất đỏ) và than. Lòng bạn rưng rưng.');}break;
    case 'bones':if(k==='take'){if(typeof l4Spirit==='function')l4Spirit(-8,0);done('Bạn nhặt chiếc rìu đá mài cạnh bộ xương. Gió hang rít lên lạnh gáy… '+m3Loot({polishedAxe:1,shellBeads:R()<0.5?1:0}));}
      else{if(typeof l4Spirit==='function')l4Spirit(6,0);S.rep=Math.min(100,(S.rep||0)+3);cnt('cnt','offer');done('🕯️ Ngôi mộ người xưa nằm co, rắc thổ hoàng (son đỏ), kèm rìu đá, vỏ ốc: cách người Hòa Bình chôn người thân trong hang. Bạn khấn vái rồi lặng lẽ đi qua.');}break;
    case 'water':S.p.water=Math.min(100,S.p.water+35);if(invCount('flask')>0&&invFits('water',1)){invTake('flask',1);invAdd('water',1);}sfx('drink');done('💧 Mạch nước ngầm trong vắt, lạnh buốt. Bạn uống no'+(invCount('water')?' và múc đầy bầu.':'.'));break;
    case 'bats':E.fuel=Math.max(1,E.fuel-1);S.p.stam=Math.max(0,S.p.stam-10);done('🦇 Cả đàn dơi ào ra, quạt tắt nửa ngọn đuốc. '+m3Loot({fiber:0})+' Bạn còn run tay.');break;
    case 'squeeze':if(S.p.stam<15){L.push('Ngách hẹp phải bò, nhưng bạn mệt quá. Nghỉ chút đã (hoặc quay ra).');return m3Rf();}S.p.stam-=15;addXp('run',2);done('🧗 Bạn nín thở bò qua khe đá hẹp. Phía sau là '+m3Loot({flint:2,quartz:R()<0.4?1:0})+'.');break;
    case 'empty':done('Chỉ có nhũ đá nhỏ giọt và mùi đất ẩm.'+(R()<0.3?' Góc tường có '+m3Loot({ochre:1})+'.':''));break;
    case 'treasure':{const T=[{shellBeads:2,cowrie:10,stoneBracelet:1},{pearl:2,quartz:2,cowrie:8},{arrow:12,bronze:S.age>=4?2:0,flint:6,cowrie:6},{polishedAxe:1,ochre:4,quartz:3}][m2Hash(c.id)%4];cs.tr=1;cnt('cnt','cavetreasure');sfx('level');m3Vib([30,40,80]);
      done('✨ Sau tảng đá đổ là một hốc khô ráo: ai đó đã cất giấu của cải ở đây từ rất lâu. Bạn lấy được '+m3Loot(T)+'.');break;}
    case 'bear':m3Bear(k);break;}}
function m3Bear(k){const E=M3K.exp,c=E.c,L=E.log,winter=seasonIdx()===3,cs=m3CS(c);if(!E.bear)E.bear={hp:20,awake:!winter};const B=E.bear,hunt=skLv('hunt');
  if(k==='sneak'){const ch=(winter?0.8:0.35)+0.06*hunt+(G.sneak?0.1:0);if(Math.random()<ch){L.push(winter?'💤 Gấu ngủ đông, thở phì phò. Bạn rón rén lách qua.':'Bạn nép sát vách, lách qua khi gấu quay đi.');cs.clr[E.i]=1;E.res='qua';addXp('hunt',2);}
    else{B.awake=true;L.push('Gấu bỗng ngẩng đầu, gầm vang cả hang!');if(!m3Dmg(18,'Gấu vả trúng'))return;}return m3Rf();}
  if(k==='lure'){const a=m3BearOut(c);m3CaveExit(a?'🐻 Bạn ném đá rồi chạy ra: gấu hang gầm gừ đuổi theo ra cửa hang! Đỡ, né rồi đánh.':'Gấu không chịu ra.');return;}
  if(k==='hit'||k==='guard'){const W=m3BestW(),pw=(W?ITEMS[W].pow||1:0.6)*(1+0.06*hunt)*(B.awake?1.4:2.4);if(k==='hit'){B.hp-=pw;L.push(`${W?'Tay đuốc tay '+ITEMS[W].n.toLowerCase()+', bạn':'Bạn vung đuốc'} đánh trúng gấu: −${Math.round(pw*10)/10}.`);sfx('hit');m3Vib(15);}
    B.awake=true;if(B.hp<=0){cs.clr[E.i]=1;E.res='gấu';cnt('cnt','hunt');cnt('cnt','cavebear');addXp('hunt',22);L.push('🐻 Con gấu hang đổ sập xuống. Bạn thở dốc: '+m3Loot({meat:8,hide:5,bone:4,bearClaw:1})+'.');sfx('thud');save();return m3Rf();}
    let d=20*(k==='guard'?(1-(m3Shield()||0.35)):1);if(k==='guard'){S.p.stam=Math.min(maxStam(),S.p.stam+6);m3Wear('shield',2);L.push(m3Shield()?'Bạn giơ khiên chặn cú vả.':'Bạn gạt cú vả bằng cán vũ khí.');}
    if(Math.random()<0.75){if(!m3Dmg(d,'Gấu vả'))return;}else L.push('Gấu vồ hụt.');return m3Rf();}}
// trong hang tay phải cầm đuốc, tay kia cầm vũ khí tốt nhất đang mang
function m3BestW(){let b=null,bp=0;for(const id of ['bronzeSpear','bronzeAxe','spear','axe','club','bronzeKnife','polishedAxe','shoulderAxe','knife']){const I=ITEMS[id];if(I&&invCount(id)>0&&(I.pow||1)>bp){bp=I.pow||1;b=id;}}return b;}
function m3BearOut(c){try{const a=animalNew('bear',c.mx+Math.sin(c.ry)*20,c.mz+Math.cos(c.ry)*20);a.angry=true;a.state='chase';a._m3cave=c.id;a.home={x:c.mx,z:c.mz};a.hp=20;G.animals.push(a);M3K.bears=(M3K.bears||[]).concat(a);return a;}catch(e){console.warn('gấu hang',e);return null;}}
function m3Kill(a){if(a._m3cave){const c=(M3K.caves||[]).find(x=>x.id===a._m3cave);if(c){const cs=m3CS(c);for(let i=0;i<c.N;i++)if(m3Room(c,i)==='bear')cs.clr[i]=1;}cnt('cnt','cavebear');give({bearClaw:1},[a.x,a.y+16,a.z]);uiToast('🐻 Hạ được gấu hang! Lối vào hang giờ đã thông.','gold');}
  if(a._m3mig){const ev=M2I().ev;ev.gh=(ev.gh||0)+1;cnt('cnt','greathunt');if(ev.gh<=3){give({meat:3,hide:1},[a.x,a.y+16,a.z]);S.rep=Math.min(100,(S.rep||0)+3);uiToast(`🏹 Đại săn: con thứ ${ev.gh} trong đàn di cư! Thêm thịt, da và tiếng thơm.`,'gold');}}}
let m3Rf=()=>{if(G.panel==='m3cave')m3CaveFill();};
function m3CaveFill(){const p=$('#panel'),h=p&&p.querySelector('.p-head h2'),bd=p&&p.querySelector('.p-body');const E=M3K.exp;if(!h||!bd||!E){return;}const c=E.c,t=m3Room(c,E.i),cs=m3CS(c),clr=!!cs.clr[E.i];h.textContent='🔦 '+c.n;
  let act='';if(!clr)switch(t){case 'loot':act='<button class="btn" data-a="m3c" data-k="dig">⛏️ Cạy đá tìm đồ</button>';break;case 'art':act='<button class="btn" data-a="m3c" data-k="look">🎨 Ngắm tranh</button><button class="btn ghost" data-a="m3c" data-k="paint">🖐️ Vẽ thêm (2 son, 1 than)</button>';break;
    case 'bones':act='<button class="btn" data-a="m3c" data-k="pray">🕯️ Khấn vái rồi đi</button><button class="btn ghost" data-a="m3c" data-k="take">Lấy đồ tùy táng</button>';break;case 'water':act='<button class="btn" data-a="m3c" data-k="drink">💧 Uống, múc nước</button>';break;
    case 'bats':act='<button class="btn" data-a="m3c" data-k="duck">🦇 Cúi rạp xuống</button>';break;case 'squeeze':act='<button class="btn" data-a="m3c" data-k="crawl">🧗 Bò qua khe (15 sức)</button>';break;case 'empty':act='<button class="btn" data-a="m3c" data-k="look">🔎 Soi quanh</button>';break;
    case 'treasure':act='<button class="btn" data-a="m3c" data-k="dig">✨ Lật tảng đá</button>';break;
    case 'bear':{const B=E.bear,winter=seasonIdx()===3;act=`<p class="small">${!B?(winter?'💤 Một con gấu hang to lớn đang ngủ đông, cuộn tròn trên ổ lá.':'🐻 Một con gấu hang lớn đứng chắn lối, mắt đỏ rực trong ánh đuốc.'):`🐻 Gấu: <i class="m2bar" style="--v:${Math.max(0,B.hp/20*100)}%"></i>`}</p>
      <button class="btn" data-a="m3c" data-k="hit">⚔️ Đánh</button><button class="btn ghost" data-a="m3c" data-k="guard">🛡️ Đỡ</button><button class="btn ghost" data-a="m3c" data-k="sneak">🐾 Lẻn qua</button><button class="btn ghost" data-a="m3c" data-k="lure">🪨 Dụ ra cửa hang</button>`;break;}}
  const last=E.i>=c.N-1;bd.innerHTML=`<div class="m3cv"><div class="m3cvh"><span>Ngách ${E.i+1}/${c.N} · ${M3RT[t]}</span><span>🔥 đuốc <i class="m2bar" style="--v:${E.fuel/4*100}%"></i> (+${Math.max(0,invCount('torch')-1)})</span></div>
    <div class="m3log">${E.log.slice(-6).map(x=>`<p>${esc(x)}</p>`).join('')}</div><div class="row m3act">${act}</div>
    <div class="row">${!last?`<button class="btn" data-a="m3c" data-k="go"${t==='bear'&&!clr?' disabled':''}>⬇ Đi sâu hơn</button>`:''}<button class="btn ghost" data-a="m3c" data-k="out">↩ Ra khỏi hang</button></div>
    <p class="hint">❤️ ${Math.round(S.p.hp)} · ⚡ ${Math.round(S.p.stam)}. Mỗi ngách tốn một phần đuốc. Đồ trong ngách làm mới mỗi tuần; kho quý chỉ một lần.</p></div>`;}
{const _uo=uiOpen;uiOpen=function(k,o,keep){if(k==='m3cave'){if(!M3K.exp)return;_uo(k,o,keep);m3CaveFill();return;}if(M3K.exp&&k!=='m3cave'){return;}return _uo(k,o,keep);};}
{const _uc=uiClose;uiClose=function(){if(M3K.exp&&G.panel==='m3cave'){m3CaveExit();return;}return _uc();};}

/* ===================== 5. CÀNG KÉO (đeo như gùi, more.js lo việc thêm ô) ===================== */
function m3Drag(){try{if(M3K.dragO){if(M3K.dragO.parent)M3K.dragO.parent.remove(M3K.dragO);M3K.dragO=null;}if(!S||!S.mx||!S.mx.pack||!S.mx.pack.drag||!P.model)return;const K=K3;
  const g=K.group(K.cyl(0.9,1.1,72,'dwood',{x:-6,rx:1.25,y:20,z:-8},6),K.cyl(0.9,1.1,72,'dwood',{x:6,rx:1.25,y:20,z:-8},6),K.box(14,1,1,'#5e3e24',{y:12,z:-30}),K.box(13,4,18,'hide',{y:8,z:-40,rx:-0.3}),K.box(9,5,8,'#8a6a40',{y:12,z:-40,rx:-0.3}));
  g.traverse(m=>{if(m.isMesh)m.castShadow=true;});P.model.add(g);M3K.dragO=g;}catch(e){}}
{const _pi=playerInit;playerInit=function(){_pi();m3Drag();};}
{const _po=mxPackOn;mxPackOn=function(i){const r=_po(i);m3Drag();return r;};}
{const _pf=mxPackOff;mxPackOff=function(s,q){const r=_pf(s,q);m3Drag();return r;};}
{const _bh=bagHtml;bagHtml=function(){let h=_bh();const id=S.mx&&S.mx.pack&&S.mx.pack.drag;const row=`<div class="wear">${id?icon(id):'<span class="ic"><b>🛷</b></span>'}<span>Kéo sau: ${id?esc(ITEMS[id].n)+' · +'+ITEMS[id].slots+' ô · đi chậm':'—'}</span>${id?'<button class="btn sm ghost" data-a="mxunpack" data-s="drag">Tháo</button>':''}</div>`;
  return h.replace('<div class="wears mxpk">','<div class="wears mxpk">'+row);};}
// tốc độ: càng kéo chậm, cưỡi trâu nhanh, đang giữ khiên đỡ đi chậm
{const _mv=move;move=function(dx,dz,m,dt,run){let k=1;const ride=M3K.ride;if(ride)k=run?1.25:1.5;else if(S.mx&&S.mx.pack&&S.mx.pack.drag)k=0.84;if(M3K.blk)k*=0.5;if(M3K.dash)k=0;
  const st=S.p.stam;_mv(dx,dz,m*k,dt,run&&!M3K.blk);if(ride)S.p.stam=Math.max(st,S.p.stam);};}

/* ===================== 6. THÚ DI CƯ, ĐẠI SĂN ===================== */
function m3MigPlan(){const ev=M2I().ev,si=seasonIdx(),sd=seasonDay();const key=Math.floor((S.day-1)/SEASON_DAYS);if((si===0&&sd===2)||(si===2&&sd===1)){if(ev.migK===key)return;ev.migK=key;ev.gh=0;
    const R=Math.random,a=R()*6.283,home=S.builds.find(b=>pieceDef(b.k)&&pieceDef(b.k).bed)||{x:P.x,z:P.z};let st=null,en=null;
    for(let t=0;t<30&&!st;t++){const aa=a+t*0.21,x0=home.x+Math.cos(aa)*2200,z0=home.z+Math.sin(aa)*2200,x1=home.x-Math.cos(aa)*2200,z1=home.z-Math.sin(aa)*2200;if(!wIn(x0,z0,0.9)||!wIn(x1,z1,0.9))continue;if(wdAt(x0,z0)>0||wdAt(x1,z1)>0)continue;st=[x0,z0];en=[x1,z1];}
    if(!st)return;ev.mig={x0:st[0],z0:st[1],x1:en[0],z1:en[1],t0:TNOW(),t1:TNOW()+1.5,k:(S.age||0)>=4&&R()<0.5?'gaur':'deer',n:7};m3MigSpawn();
    uiToast(`🦌 Đàn ${ev.mig.k==='gaur'?'bò tót':'nai'} di cư đang băng qua vùng (hướng ${mxDir(en[0]-st[0],en[1]-st[1])}). Mở 🏮 Làng → 🧭 Đường để theo dấu. Đại săn!`,'gold');}}
function m3MigSpawn(){const m=M2I().ev.mig;if(!m||M3K.mig)return;M3K.mig=[];const k=TNOW(),f=clamp((k-m.t0)/(m.t1-m.t0),0,1),cx=m.x0+(m.x1-m.x0)*f,cz=m.z0+(m.z1-m.z0)*f;
  for(let i=0;i<m.n;i++){try{const x=cx+(Math.random()-0.5)*120,z=cz+(Math.random()-0.5)*120;const a=animalNew(m.k,x,z,null,m.k==='deer'&&i>0?'doe':null);a._m3mig=1;a.home={x:cx,z:cz};G.animals.push(a);M3K.mig.push(a);}catch(e){console.warn('di cư',e);break;}}}
function m3MigTick(){const ev=M2I().ev,m=ev.mig;if(!m){return;}if(!M3K.mig)m3MigSpawn();const f=(TNOW()-m.t0)/(m.t1-m.t0);
  if(f>=1){for(const a of M3K.mig||[]){if(a.o&&a.o.parent)a.o.parent.remove(a.o);const j=G.animals.indexOf(a);if(j>=0)G.animals.splice(j,1);}M3K.mig=null;ev.mig=null;uiToast('🦌 Đàn thú di cư đã đi khuất về phương xa.','');return;}
  const cx=m.x0+(m.x1-m.x0)*f,cz=m.z0+(m.z1-m.z0)*f;m.n=0;for(const a of M3K.mig||[]){a.home.x=cx;a.home.z=cz;if(a.alive)m.n++;}M3K.migC=[cx,cz];}

/* ===================== 7. CƯỠI TRÂU ===================== */
{const _pi=petInfo;petInfo=function(p){const r=_pi(p);if(p&&p.k==='buffalo'&&!p.hitch&&typeof mxPlough==='function'&&!mxPlough()&&r)return Object.assign({},r,{verb:M3K.ride===p?'Xuống trâu':'Cưỡi trâu',ok:true});return r;};}
{const _pu=petUse;petUse=function(p){if(p&&p.k==='buffalo'&&!p.hitch&&!mxPlough()){if(M3K.ride===p)m3Dismount();else m3Mount(p);return;}return _pu(p);};}
function m3Mount(p){if(G.swim||G.work)return;M3K.ride=p;P.x=p.x;P.z=p.z;P.ry=p._o?p._o.rotation.y:P.ry;sfx('step');cnt('cnt','ride');uiToast('🐃 Trèo lên lưng trâu: đi nhanh, không mệt, lội nước thoải mái. Bấm 🐃 Xuống để xuống.','good');}
function m3Dismount(){const p=M3K.ride;M3K.ride=null;if(!p)return;P.x=p.x+Math.cos(P.ry)*18;P.z=p.z-Math.sin(P.ry)*18;P.y=groundY(P.x,P.z);p.hx=p.x;p.hz=p.z;p._tx=p.x;p._tz=p.z;sfx('step');save();}
function m3RideTick(){const p=M3K.ride;if(!p)return;if(!S.pets||!S.pets.includes(p)||G.sleeping||G.work||G.ladder||G.ride){m3Dismount();return;}p.x=P.x;p.z=P.z;p._tx=P.x;p._tz=P.z;
  if(p._o){p._o.position.set(P.x,Math.max(hAt(P.x,P.z),waterAt(P.x,P.z)),P.z);p._o.rotation.y=P.ry;const R=p._rig||{},s=Math.sin(G.t*8)*(P.speed>8?0.5:0);if(R.legFL){R.legFL.rotation.x=s;R.legBR.rotation.x=s;R.legFR.rotation.x=-s;R.legBL.rotation.x=-s;}}
  const R=P.rig;if(R&&P.model){P.model.position.y=Math.max(hAt(P.x,P.z),waterAt(P.x,P.z))+17;R.legL.rotation.x=-1.25;R.legR.rotation.x=-1.25;R.legL.rotation.z=-0.35;R.legR.rotation.z=0.35;R.armL.rotation.x=R.armR.rotation.x=-0.5;R.torso.rotation.x=0.05;}}
{const _an=animTick;animTick=function(dt){_an(dt);try{m3RideTick();m3BlockPose();}catch(e){}};}
{const _sl=typeof sleep==='function'?sleep:null;if(_sl)sleep=function(){if(M3K.ride)m3Dismount();return _sl.apply(this,arguments);};}
function m3BlockPose(){const R=P.rig;if(!R||!M3K.blk)return;R.armL.rotation.x=-1.5;R.armL.rotation.z=-0.3;R.armR.rotation.x=-1.1;R.torso.rotation.x=0.1;}

/* ===================== 8. ĐI ĐƯỜNG: MỐC, TỰ ĐI THEO ĐƯỜNG MÒN ===================== */
function m3Spots(){const L=[],add=(ic,n,x,z,k)=>L.push({ic,n,x,z,k});const bed=S.builds.find(b=>pieceDef(b.k)&&pieceDef(b.k).bed&&b.prog==null);if(bed)add('🏠','Nhà (chỗ ngủ)',bed.x,bed.z,'bed');
  const fire=S.builds.filter(b=>b.prog==null&&pieceDef(b.k)&&pieceDef(b.k).fuel).sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z))[0];if(fire)add('🔥','Bếp lửa gần nhất',fire.x,fire.z,'fire');
  const tw=S.builds.find(b=>b.k==='watchtower'&&b.prog==null);if(tw)add('🗼','Chòi canh',tw.x,tw.z,'tower');if(G.village)add('🏘️','Làng Suối Tây',G.village.x,G.village.z+120,'village');add('🌄','Trảng Khởi Đầu',SPAWN[0],SPAWN[1],'spawn');return L;}
function m3WayList(){const M=M2I(),L=m3Spots();const gr=M.ev.grave;if(gr)L.unshift({ic:'🎒',n:'Đồ đánh rơi',x:gr.x,z:gr.z,k:'grave'});if(M3K.migC)L.unshift({ic:'🦌',n:'Đàn thú di cư',x:M3K.migC[0],z:M3K.migC[1],k:'mig'});
  for(const c of M3K.caves||[])if(M.cave[c.id]&&M.cave[c.id].seen||S.disc&&Math.hypot(c.x-P.x,c.z-P.z)<1500)L.push({ic:'🕳️',n:c.n,x:c.mx,z:c.mz,k:'cave'});
  M.wps.forEach((w,i)=>L.push({ic:'📌',n:w.n,x:w.x,z:w.z,k:'wp',i}));return L;}
function m3WayHtml(){const L=m3WayList(),dir=(x,z)=>`${Math.round(Math.hypot(x-P.x,z-P.z)/20)} m về phía ${mxDir(x-P.x,z-P.z)}`;
  return `<p class="small">Chọn mốc để la bàn chỉ đường, hoặc bấm 🚶 để tự đi theo đường mòn (chạm cần điều khiển là dừng). Thời này chưa có ngựa xe, chỉ có đôi chân${S.pets&&S.pets.some(p=>p.k==='buffalo')?' và lưng trâu':''}.</p>
  ${S.mark?`<div class="m2task"><span class="m2ti">📍</span><div><b>Đang chỉ đường</b><br><small>${dir(S.mark.x,S.mark.z)}</small></div><button class="btn sm" data-a="m3auto">${M3K.auto?'✋ Dừng':'🚶 Tự đi'}</button><button class="btn sm ghost" data-a="m3unmark">Bỏ</button></div>`:''}
  <div class="m2list">${L.map((w,i)=>`<div class="m2task"><span class="m2ti">${w.ic}</span><div><b>${esc(w.n)}</b><br><small class="muted">${dir(w.x,w.z)}</small></div><button class="btn sm" data-a="m3go" data-i="${i}">📍</button><button class="btn sm ghost" data-a="m3go" data-i="${i}" data-w="1">🚶</button>${w.k==='wp'?`<button class="btn sm ghost" data-a="m3wdel" data-i="${w.i}">✕</button>`:''}</div>`).join('')}</div>
  <h3>📌 Cắm mốc chỗ đang đứng</h3><div class="mp-send"><input id="m3wn" maxlength="24" placeholder="Tên mốc (vd: Bãi đá lửa)"><button class="btn sm" data-a="m3wadd">Cắm</button></div>`;}
function m3AutoTick(){if(!M3K.auto)return;const k=G.keys||{};const touch=(G.joy&&G.joy.on)||k.KeyW||k.KeyA||k.KeyS||k.KeyD||k.ArrowUp||k.ArrowDown;
  if(!S.mark||touch||G.work||G.sleeping||G.swim&&!M3K.ride){M3K.auto=false;if(!S.mark)uiToast('🚶 Đã tới nơi.','good');m3Acts();return;}
  if(m3Threat()){M3K.auto=false;uiToast('⚠️ Có thú dữ! Dừng tự đi.','bad');m3Acts();return;}
  const dx=S.mark.x-P.x,dz=S.mark.z-P.z,d=Math.hypot(dx,dz);if(d<45){M3K.auto=false;m3Acts();return;}const a0=Math.atan2(dx,dz),la=Math.min(110,d);let best=null,bs=-1e9;
  for(let i=-3;i<=3;i++){const a=a0+i*0.32,x=P.x+Math.sin(a)*la,z=P.z+Math.cos(a)*la;let sc=Math.cos(i*0.32)*1.2+trailAt(x,z)*0.9;if(wdAt(x,z)>1&&!M3K.ride)sc-=3;const sl=slopeAt(x,z);if(sl>0.8)sc-=2;else if(sl>0.5)sc-=0.6;if(sc>bs){bs=sc;best={x,z};}}
  G.walkTo={x:best.x,z:best.z,t:null,t0:G.t};}
function m3AutoGo(){if(!S.mark){uiToast('Chọn một mốc trước đã.','');return;}M3K.auto=!M3K.auto;if(M3K.auto)uiToast('🚶 Tự đi theo đường mòn… chạm cần điều khiển để dừng.','');else G.walkTo=null;m3Acts();}

/* ===================== 9. TỈNH DẬY: CHỌN CHỖ, ĐỒ ĐÁNH RƠI ===================== */
{const _die=die;die=function(){if(G.dying)return _die();const x=P.x,z=P.z,inv0=S.inv.map(s=>s&&{id:s.id,n:s.n});if(M3K.ride)M3K.ride=null;M3K.auto=false;_die();
  const wait=()=>{if(G.dying){setTimeout(wait,150);return;}const lost={};let n=0;const has={};S.inv.forEach(s=>{if(s)has[s.id]=(has[s.id]||0)+s.n;});const had={};inv0.forEach(s=>{if(s)had[s.id]=(had[s.id]||0)+s.n;});
    for(const k in had){const d=had[k]-(has[k]||0);if(d>0&&ITEMS[k]&&ITEMS[k].t==='res'){lost[k]=d;n+=d;}}const M=M2I();if(n){M.ev.grave={x,z,it:lost,day:S.day};m3GraveShow();uiToast('🎒 Đồ đánh rơi còn nằm ở chỗ bạn ngất (3 ngày). Mở 🏮 Làng → 🧭 Đường để quay lại nhặt.','');}
    G.m2tab='respawn';uiOpen('m2',{});};setTimeout(wait,300);};}
function m3RespHtml(){const L=m3Spots();return `<h3>🌅 Tỉnh dậy ở đâu?</h3><p class="small">Bạn ngất đi rồi được người qua đường (hay chính đôi chân mình) đưa về chỗ an toàn. Chọn nơi tỉnh dậy:</p>
  <div class="m2list">${L.map((w,i)=>`<button class="btn m3sp" data-a="m3resp" data-i="${i}">${w.ic} ${esc(w.n)} <small class="muted">${Math.round(Math.hypot(w.x-P.x,w.z-P.z)/20)} m</small></button>`).join('')}</div>
  <button class="btn ghost" data-a="m3respok">Ở lại đây</button>`;}
function m3GraveShow(){try{if(M3K.grO){if(M3K.grO.parent)M3K.grO.parent.remove(M3K.grO);M3K.grO=null;}const g=M2I().ev.grave;if(!g||!G.sc)return;const K=K3;const o=K.group(K.box(10,6,8,'hide',{}),K.box(11,1,2,'#5e3e24',{y:6}),K.cyl(0.8,0.8,16,'dwood',{x:7,y:0},5));o.position.set(g.x,hAt(g.x,g.z),g.z);G.sc.add(o);M3K.grO=o;}catch(e){}}
function m3GraveTake(){const M=M2I(),g=M.ev.grave;if(!g)return;const left={};for(const k in g.it){const l=invAdd(k,g.it[k]);if(g.it[k]-l>0)try{uiFly(k,g.it[k]-l,[g.x,hAt(g.x,g.z)+8,g.z]);}catch(e){}if(l)left[k]=l;}
  if(Object.keys(left).length){g.it=left;uiToast('Túi đầy: còn ít đồ chưa nhặt hết.','bad');}else{M.ev.grave=null;m3GraveShow();uiToast('🎒 Nhặt lại được đồ đánh rơi.','good');}sfx('pick');uiHotbar();save();}

/* ===================== 10. NHẮM, HÀNH ĐỘNG ===================== */
{const _ft=findTarget;findTarget=function(){const t=_ft();if(!S||G.work||G.sit||G.ride||M3K.ride)return t;let best=null,bd=1e9;
  for(const c of M3K.caves||[]){const d=Math.hypot(c.mx-P.x,c.mz-P.z)-10;if(d<REACH+24&&d<bd){bd=d;best={type:'m3cave',c,o:{x:c.mx,y:hAt(c.mx,c.mz)+30,z:c.mz},d};}}
  const g=S.m2&&S.m2.ev&&S.m2.ev.grave;if(g){const d=Math.hypot(g.x-P.x,g.z-P.z)-6;if(d<REACH+14&&d<bd){bd=d;best={type:'m3grave',o:{x:g.x,y:hAt(g.x,g.z)+12,z:g.z},d};}}
  if(!best)return t;if(!t)return best;if(t.type==='animal'&&t.a&&t.a.angry)return t;const td=t.d!=null?t.d:30;return bd<=td+4?best:t;};}
{const _ti=targetInfo;targetInfo=function(t){if(t&&t.type==='m3cave'){const ok=P.toolId==='torch';return {name:t.c.n+' · hang tối',verb:'Vào hang',ok,need:ok?null:'cầm đuốc',icon:'torch'};}if(t&&t.type==='m3grave')return {name:'Đồ đánh rơi',verb:'Nhặt lại',ok:true,icon:'hide'};return _ti(t);};}
{const _as=actStart;actStart=function(t){if(t&&t.type==='m3cave'&&!G.work){m3CaveEnter(t.c);return;}if(t&&t.type==='m3grave'&&!G.work){m3GraveTake();return;}return _as(t);};}

/* ===================== 11. NÚT TRÊN MÀN HÌNH: ĐỠ, NÉ, XUỐNG TRÂU, TỰ ĐI, CHẾ NHANH ===================== */
function m3UiInit(){const acts=$('.acts');if(!acts||$('#m3blk'))return;acts.insertAdjacentHTML('afterbegin','<button id="m3qc" class="rbtn sm" aria-label="Chế nhanh">⭐<i>Chế nhanh</i></button><button id="m3auto" class="rbtn sm" aria-label="Tự đi" hidden>🚶<i>Tự đi</i></button><button id="m3ride" class="rbtn sm" aria-label="Xuống trâu" hidden>🐃<i>Xuống</i></button><button id="m3dg" class="rbtn m3c" aria-label="Né" hidden>💨<i>Né</i></button><button id="m3blk" class="rbtn m3c" aria-label="Đỡ" hidden>🛡️<i>Đỡ</i></button>');
  if(!$('#m3hurt'))$('#game').insertAdjacentHTML('beforeend','<div id="m3hurt" class="m3hurt"></div>');
  const b=$('#m3blk'),on=e=>{e.preventDefault();M3K.blk=true;b.classList.add('on');},off=()=>{M3K.blk=false;b.classList.remove('on');};
  b.addEventListener('pointerdown',on);['pointerup','pointercancel','pointerleave'].forEach(k=>b.addEventListener(k,off));
  $('#m3dg').addEventListener('pointerdown',e=>{e.preventDefault();m3Dodge();});
  document.addEventListener('keydown',e=>{if(!G.on||e.repeat||/^(INPUT|TEXTAREA|SELECT)$/.test((e.target&&e.target.tagName)||''))return;if(e.code==='KeyQ'){M3K.blk=true;}if(e.code==='KeyV'||e.code==='AltLeft')m3Dodge();});
  document.addEventListener('keyup',e=>{if(e.code==='KeyQ')M3K.blk=false;});}
function m3Acts(){const thr=M3K.thr,show=(id,v)=>{const e=$(id);if(e&&e.hidden===!!v)e.hidden=!v;};show('#m3blk',!!thr&&!M3K.ride);show('#m3dg',!!thr&&!M3K.ride);show('#m3ride',!!M3K.ride);show('#m3auto',!!S.mark&&!thr);
  const a=$('#m3auto');if(a){const t=M3K.auto?'✋<i>Dừng</i>':'🚶<i>Tự đi</i>';if(a.innerHTML!==t)a.innerHTML=t;}if(!thr&&M3K.blk){M3K.blk=false;const b=$('#m3blk');if(b)b.classList.remove('on');}}
function m3QcHtml(){const F=Object.keys((S.mx&&S.mx.fav)||{}).map(id=>RECIPES.find(r=>r.id===id)).filter(r=>r&&S.known['r:'+r.id]);
  if(!F.length)return '<p class="small">Chưa có công thức ★. Mở 🛠️ Chế tạo, bấm ★ ở món hay làm để ghim vào đây.</p>';
  return F.slice(0,10).map(r=>{const out=Object.keys(r.out)[0],bl=recipeBlock(r);return `<div class="m3qr${bl?' dim':''}">${icon(out)}<span>${esc(ITEMS[out].n)}${bl?`<small class="warn">${esc(bl)}</small>`:''}</span><button class="btn sm" data-a="m3qc" data-r="${r.id}"${bl?' disabled':''}>Làm</button></div>`;}).join('');}
function m3Qc(on){let el=$('#m3qcp');if(!on){if(el)el.hidden=true;return;}if(!el){el=document.createElement('div');el.id='m3qcp';el.className='m2pop';$('#game').appendChild(el);}el.innerHTML=`<div class="spread"><b>⭐ Chế nhanh</b><button class="btn sm ghost" data-a="m3qcx">✕</button></div><div class="m3qcl">${m3QcHtml()}</div>`;el.hidden=false;}
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest||!S)return;if(t.closest('#m3qc')){e.stopImmediatePropagation();const el=$('#m3qcp');m3Qc(!el||el.hidden);sfx('pick');return;}
  if(t.closest('#m3ride')){e.stopImmediatePropagation();m3Dismount();return;}if(t.closest('#m3auto')){e.stopImmediatePropagation();m3AutoGo();return;}
  if(t.closest('#m3blk')||t.closest('#m3dg')){e.stopImmediatePropagation();return;}},true);
function m3Click(d){switch(d.a){case 'm3c':m3CaveAct(d.k);break;case 'm3auto':m3AutoGo();uiOpenRefresh();break;case 'm3unmark':S.mark=null;M3K.auto=false;save();uiOpenRefresh();break;
  case 'm3go':{const w=m3WayList()[+d.i];if(!w)break;S.mark={x:w.x,z:w.z};save();if(d.w){M3K.auto=true;uiClose();uiToast(`🚶 Tự đi tới ${w.n}…`,'');}else{uiToast(`📍 La bàn chỉ tới ${w.n}.`,'');uiOpenRefresh();}m3Acts();break;}
  case 'm3wadd':{const M=M2I();if(M.wps.length>=12){uiToast('Tối đa 12 mốc.','bad');break;}const n=m2Txt(($('#m3wn')||{}).value,24)||('Mốc '+(M.wps.length+1));M.wps.push({n,x:+P.x.toFixed(1),z:+P.z.toFixed(1)});save();uiToast('📌 Đã cắm mốc: '+n,'good');uiOpenRefresh();break;}
  case 'm3wdel':{const M=M2I();M.wps.splice(+d.i,1);save();uiOpenRefresh();break;}
  case 'm3resp':{const w=m3Spots()[+d.i];if(w){uiFade(()=>{P.x=w.x+20;P.z=w.z+20;P.y=groundY(P.x,P.z);P.vy=0;save();});}G.m2tab='day';uiClose();break;}
  case 'm3respok':G.m2tab='day';uiClose();break;
  case 'm3qc':{const r=RECIPES.find(x=>x.id===d.r);if(r){m3Qc(false);craft(r,1);}break;}case 'm3qcx':m3Qc(false);break;}}

/* ===================== 12. NHỊP ===================== */
function m3Tick(dt){if(!G.on||!S)return;m3DashTick(dt);if(G.t-(M3K.qT||0)<0.3)return;M3K.qT=G.t;
  if(!M3K.init){M3K.init=1;m3UiInit();m3CavesInit();m3GraveShow();m3Drag();}
  M3K.thr=G.paused?null:m3Threat();m3Acts();m3AutoTick();
  if(G.t-(M3K.sT||0)>2){M3K.sT=G.t;const M=M2I();if(M.ev.grave&&S.day-M.ev.grave.day>3){M.ev.grave=null;m3GraveShow();uiToast('🐺 Đồ đánh rơi đã bị thú tha mất.','bad');}m3MigPlan();m3MigTick();}}
{const _at=ambTick;ambTick=function(dt){_at(dt);try{m3Tick(dt);}catch(e){if(!M3K.err){M3K.err=1;console.warn('more3',e);}}};}
{const _sg=startGame;startGame=function(){M3K.init=0;M3K.mig=null;M3K.ride=null;M3K.exp=null;M3K.auto=false;return _sg.apply(this,arguments);};}
{const _si=sceneInit;sceneInit=function(){_si();M3K.init=0;M3K.mig=null;};}

document.head.insertAdjacentHTML('beforeend',`<style>
.m3hurt{position:absolute;inset:0;z-index:5;pointer-events:none;opacity:0;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 45%,rgba(190,20,10,.55) 100%)}.m3hurt.on{animation:m3h .5s ease-out}@keyframes m3h{0%{opacity:1}100%{opacity:0}}
.m3lv{position:absolute;z-index:9;left:50%;top:26%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;pointer-events:none;animation:m3lv 2.2s ease-out forwards;text-shadow:0 2px 10px rgba(0,0,0,.7)}
.m3lv b{font:800 34px/1.1 'Bungee','Be Vietnam Pro',system-ui;color:#ffd27a}.m3lv span{font-weight:700;color:#fff3dc}@keyframes m3lv{0%{opacity:0;transform:translate(-50%,20px) scale(.6)}15%{opacity:1;transform:translate(-50%,0) scale(1.08)}25%{transform:translate(-50%,0) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-30px)}}
.rbtn.m3c{background:rgba(70,110,160,.85)}.rbtn.m3c.on{background:#9fd8ff;color:#123}#m3dg{background:rgba(110,160,120,.85)}
.m3cv .m3cvh{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:13px}.m3cv .m3cvh i{display:inline-block;width:60px;vertical-align:middle}.m3log{margin:8px 0;padding:8px 10px;border-radius:12px;background:rgba(0,0,0,.45);min-height:90px}.m3log p{margin:3px 0;font-size:14px}.m3log p:last-child{color:#ffe0a0}
.m3act{flex-wrap:wrap;gap:6px;margin-bottom:8px}.m3sp{display:block;width:100%;text-align:left;margin:3px 0}.m3qr{display:flex;align-items:center;gap:8px;padding:5px 2px;border-bottom:1px solid rgba(255,255,255,.07)}.m3qr span{flex:1;min-width:0;display:flex;flex-direction:column}.m3qr.dim{opacity:.6}.m3qcl{max-height:46vh;overflow-y:auto}
body.mxphoto #m3qcp,body.mxphoto .m3lv{display:none!important}
</style>`);
