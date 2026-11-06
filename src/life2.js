/* ===================== SINH VẬT QUANH TA · CÂU CÁ · BẪY · TẮM · ĐỒ DÙNG TRONG NHÀ ===================== */
/* ---------- cá bơi dưới nước quanh người chơi (một đàn nhỏ, tự dời theo) ---------- */
const FISHV=['carp','catfish','snakehead'],FISHN={carp:'cá chép',catfish:'cá trê',snakehead:'cá lóc'};
function fishModel(v){try{if(window.SBM&&SBM.fish)return SBM.fish(v);}catch(e){}const K=K3;return K.group(K.ico(4,v==='catfish'?'#5a5040':'#a08a5a',{sz:2.6,sy:0.7},1,0.2,2));}
function fishTick(dt){if(!G.fish){G.fish=[];for(let i=0;i<16;i++){const v=FISHV[i%3],o=fishModel(v);o.traverse(m=>{if(m.isMesh){m.castShadow=false;}});o.visible=false;G.sc.add(o);G.fish.push({o,v,rig:o.userData.rig||{},x:0,z:0,y:0,a:0,sp:0,live:false,ph:Math.random()*6});}}
  if(G.t-(G.fishT||0)>1.2){G.fishT=G.t;for(const f of G.fish){if(f.live&&Math.hypot(f.x-P.x,f.z-P.z)<520)continue;f.live=false;f.o.visible=false;
      for(let k=0;k<6;k++){const a=Math.random()*6.283,d=120+Math.random()*360,x=P.x+Math.cos(a)*d,z=P.z+Math.sin(a)*d,wd=wdAt(x,z);if(wd>3){const s=waterAt(x,z);Object.assign(f,{x,z,cx:x,cz:z,y:s-Math.min(wd*0.45,6),a:Math.random()*6.283,sp:10+Math.random()*12,live:true});f.o.visible=true;break;}}}}
  for(const f of G.fish){if(!f.live)continue;const d=Math.hypot(f.x-P.x,f.z-P.z);let tgtA=f.a+Math.sin(G.t*0.4+f.ph)*0.6*dt;let sp=f.sp;if(d<70){tgtA=Math.atan2(f.x-P.x,f.z-P.z);sp=70;}
    f.a=tgtA;let nx=f.x+Math.sin(f.a)*sp*dt,nz=f.z+Math.cos(f.a)*sp*dt;if(wdAt(nx,nz)<2.5||Math.hypot(nx-f.cx,nz-f.cz)>90){f.a+=Math.PI*(0.6+Math.random()*0.5);nx=f.x;nz=f.z;}f.x=nx;f.z=nz;
    f.o.position.set(f.x,f.y+Math.sin(G.t*1.3+f.ph)*0.6,f.z);f.o.rotation.y=f.a;if(f.rig.tail)f.rig.tail.rotation.y=Math.sin(G.t*(sp>30?16:7)+f.ph)*0.5;}}
function fishNear(x,z,r){if(!G.fish)return 0;return G.fish.filter(f=>f.live&&Math.hypot(f.x-x,f.z-z)<r).length;}
/* ---------- ếch kêu đêm bên bờ nước, bướm ban ngày ---------- */
function smallLifeTick(dt){if(!window.SBM||!SBM.animal)return;if(!G.bugs){G.bugs=[];const mk=(k)=>{let o=null;try{o=k==='butterfly'&&SBM.butterfly?SBM.butterfly():SBM.animal(k);}catch(e){}return o;};
    for(let i=0;i<10;i++){const k=i<4?'frog':'butterfly',o=mk(k);if(!o)continue;o.visible=false;G.sc.add(o);G.bugs.push({k,o,rig:o.userData.rig||{},live:false,ph:Math.random()*6,t:0});}}
  const night=isNight(),si=seasonIdx();for(const b of G.bugs){if(b.live&&(Math.hypot(b.x-P.x,b.z-P.z)>420||(b.k==='butterfly'&&(night||si===3))||(b.k==='frog'&&si===3))){b.live=false;b.o.visible=false;}
    if(!b.live&&Math.random()<dt*0.5){const a=Math.random()*6.283,d=80+Math.random()*260,x=P.x+Math.cos(a)*d,z=P.z+Math.sin(a)*d;const bm=bgAt(x,z);
      if(b.k==='frog'&&si!==3&&wdAt(x,z)<0.2&&nearWater(x,z,40)){Object.assign(b,{x,z,y:hAt(x,z),live:true,t:0});b.o.visible=true;}
      else if(b.k==='butterfly'&&!night&&si!==3&&(bm===2||bm===3)){Object.assign(b,{x,z,y:hAt(x,z)+8,live:true,t:0,cx:x,cz:z});b.o.visible=true;}}
    if(!b.live)continue;b.t+=dt;
    if(b.k==='frog'){if(Math.hypot(b.x-P.x,b.z-P.z)<40&&!b.jump){b.jump=0.5;b.dir=Math.atan2(b.x-P.x,b.z-P.z);}if(b.jump>0){b.jump-=dt;b.x+=Math.sin(b.dir)*60*dt;b.z+=Math.cos(b.dir)*60*dt;}else b.jump=0;b.y=hAt(b.x,b.z)+(b.jump>0?Math.sin(b.jump/0.5*Math.PI)*8:0);
      b.o.position.set(b.x,b.y,b.z);b.o.rotation.y=b.dir||0;if(night&&Math.random()<dt*0.12&&Math.hypot(b.x-P.x,b.z-P.z)<300)sfx('croak');}
    else{b.x=b.cx+Math.sin(b.t*0.7+b.ph)*30;b.z=b.cz+Math.cos(b.t*0.5+b.ph*2)*30;b.y=hAt(b.x,b.z)+7+Math.sin(b.t*2.3)*4;b.o.position.set(b.x,b.y,b.z);b.o.rotation.y=b.t*0.7+b.ph;const f=Math.sin(b.t*22)*0.9;if(b.rig.wingL)b.rig.wingL.rotation.z=f;if(b.rig.wingR)b.rig.wingR.rotation.z=-f;}}}
/* ---------- câu cá bằng cần tre ---------- */
function rodStart(t){G.act={t:{type:'rod',x:t.x,z:t.z},next:2.5+Math.random()*4,n:0,per:6,bite:false};P.anim='cook';sfx('drink');uiToast('🎣 Thả câu… chờ cá cắn câu.','');}
function rodTick(A,dt){const t=A.t;if(Math.hypot(t.x-P.x,t.z-P.z)>70||P.toolId!=='rod'){G.act=null;return;}P.anim='cook';A.next-=dt;
  if(!A.bite&&A.next<=0){A.bite=true;A.win=1.2;sfx('hit');uiToast('❗ Cá cắn câu! Bấm Hành động ngay!','gold');}
  if(A.bite){A.win-=dt;if(A.win<=0){G.act=null;uiToast('Cá sổng mất rồi. Thả câu lại nhé.','');}}}
function rodPull(){const A=G.act;if(!A||A.t.type!=='rod')return false;if(!A.bite){G.act=null;uiToast('Giật sớm quá, cá chạy mất.','');return true;}
  const near=fishNear(A.t.x,A.t.z,160),p=0.55+0.05*skLv('hunt')+near*0.06;G.act=null;if(Math.random()<p){const v=FISHV[Math.floor(Math.random()*3)];give({fish:1+(Math.random()<0.15?1:0)},[A.t.x,4,A.t.z]);addXp('hunt',3);cnt('cnt','fish');uiToast(`🐟 Câu được ${FISHN[v]}!`,'gold');sfx('craft');save();}
  else uiToast('Hụt rồi! Cá giãy tuột lưỡi câu.','');return true;}
/* ---------- tắm: sạch sẽ thì ít ốm vặt ---------- */
function bathe(){S.p.clean=100;S.p.wet=100;sfx('drink');puff(P.x,P.y+10,P.z,'#cfefff',8);uiToast('🛁 Tắm mát trong dòng nước: người sạch sẽ, khoan khoái.','gold');cnt('cnt','bathe');if(S.st.sting)cureStatus('sting');save();}
function cleanTick(dt){if(S.p.clean==null)S.p.clean=90;const gh=dt*24/DAY_SEC;S.p.clean=Math.max(0,S.p.clean-gh*(G.work||G.act?5:2.2));if(S.wx&&S.wx.type==='rain'&&!underRoof(P.x,P.z))S.p.clean=Math.min(100,S.p.clean+gh*6);}
/* ---------- bẫy thú, đó bắt cá: dính theo giờ ---------- */
function trapTick(gh){for(const b of S.builds){if(b.prog!=null)continue;if(b.k==='trap'){if((S.tank[b.id]||0)>=1)continue;const bm=bgAt(b.x,b.z);if(Math.hypot(b.x-P.x,b.z-P.z)<120)continue;if(Math.random()<gh*(bm===2||bm===3?0.12:0.05)){S.tank[b.id]=1;S.tank[b.id+'k']=Math.random()<0.6?'rabbit':'junglefowl';}}
    if(b.k==='fishTrap'&&(S.tank[b.id]||0)<3&&Math.random()<gh*0.18)S.tank[b.id]=(S.tank[b.id]||0)+1;}}
function trapInfo(b){if(b.k==='trap'){const has=(S.tank[b.id]||0)>=1;return {name:'Bẫy thòng lọng',verb:has?'Gỡ '+(S.tank[b.id+'k']==='junglefowl'?'gà rừng':'thỏ'):'Chưa có gì',ok:has,icon:'meat'};}
  const n=Math.floor(S.tank[b.id]||0);return {name:'Đó bắt cá',verb:n?`Lấy ${n} cá`:'Chưa có cá',ok:n>0,icon:'fish'};}
function trapUse(b){if(b.k==='trap'){if((S.tank[b.id]||0)<1)return;const k=S.tank[b.id+'k'];give(k==='junglefowl'?{meat:1,feather:2}:{meat:1,hide:1},[b.x,b.y+10,b.z]);S.tank[b.id]=0;addXp('hunt',3);sfx('pick');save();return;}
  const n=Math.floor(S.tank[b.id]||0);if(!n)return;give({fish:n},[b.x,b.y+10,b.z]);S.tank[b.id]=0;addXp('hunt',2*n);sfx('pick');save();}
/* ---------- trống, ghế ---------- */
function drumPlay(){auInit();if(AU.ctx){[0,0.28,0.56,0.7,0.98].forEach((d,i)=>{tone(i%2?110:80,0.3,'sine',0.35,0.5,d);noise(0.12,200,1,0.25,d);});}uiToast('🥁 Thùng thùng! Tiếng trống vang xa.','');cnt('cnt','drum');}
function seatUse(b){P.x=b.x;P.z=b.z;sitToggle(true);}
