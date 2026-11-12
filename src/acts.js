/* ===================== THAO TÁC: BƠI · LOM KHOM · NGỒI NGHỈ · NÉM · NHẶT LẠI ===================== */
const SWIM_Y=-17;
function swimCheck(){const f=floorTop(P.x,P.z);const sw=f==null&&wdAt(P.x,P.z)>11;if(sw!==!!G.swim){G.swim=sw;if(sw){G.sit=false;uiToast('🏊 Đang bơi: tốn thể lực, quần áo ướt sũng.','');sfx('drink');}}return sw;}
function sneakToggle(v){G.sneak=v==null?!G.sneak:!!v;if(G.sneak)G.sit=false;const b=$('#sneakBtn');if(b)b.classList.toggle('on',G.sneak);uiToast(G.sneak?'🤫 Lom khom: đi chậm, thú khó phát hiện bạn.':'Đứng thẳng dậy.','');}
function sitToggle(v){const on=v==null?!G.sit:!!v;if(on&&(G.swim||P.air))return;G.sit=on;if(on){G.sneak=false;G.act=null;G.walkTo=null;}const b=$('#sitBtn');if(b)b.classList.toggle('on',on);
  if(on)uiToast(fireHeat(P.x,P.z)>0?'🔥 Ngồi sưởi bên lửa: hồi sức nhanh, ấm người.':'🪵 Ngồi nghỉ: hồi thể lực nhanh gấp ba.','');}
/* ---------- ném đá / phóng giáo ---------- */
function throwable(){const s=S.inv[S.sel];if((ITEMS[P.toolId]&&ITEMS[P.toolId].tool==='bow'))return invCount('arrow')>0?'arrow':null;if(P.toolId==='spear')return 'spear';if(s&&s.id==='stone')return 'stone';return null;}
function throwIt(){if((ITEMS[P.toolId]&&ITEMS[P.toolId].tool==='bow')){shootArrow();return;}const id=throwable();if(!id){uiToast('Chọn đá hoặc cầm giáo trên thanh công cụ để ném.','');return;}if(S.p.stam<5){uiToast('Mệt quá, không ném nổi.','');return;}
  if(!invTake(id,1))return;if(id==='spear'&&invCount('spear')<1)equip(selTool());S.p.stam-=id==='spear'?6:3;G.throwT=0.45;P.anim='throw';G.throwAnim=0.45;sfx('jump');
  const yaw=isFP()?P.ry:P.ry,pit=isFP()?(G.fpitch||0)+0.08:0.32,v=id==='spear'?540:430,o=model(id==='spear'?['tool','spear']:['item','stone']);o.traverse(m=>{if(m.isMesh)m.castShadow=true;});G.sc.add(o);
  const ex=P.x+Math.sin(yaw)*8,ez=P.z+Math.cos(yaw)*8,ey=P.y+(isFP()?(G.eyeH||EYE)-4:28);o.position.set(ex,ey,ez);
  G.proj=G.proj||[];G.proj.push({id,o,x:ex,y:ey,z:ez,vx:Math.sin(yaw)*Math.cos(pit)*v,vy:Math.sin(pit)*v,vz:Math.cos(yaw)*Math.cos(pit)*v,t:0});uiHotbar();}
function projTick(dt){if(!G.proj||!G.proj.length)return;for(const p of G.proj.slice()){p.t+=dt;p.vy-=(p.grav||380)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.o.position.set(p.x,p.y,p.z);
    if(p.id==='arrow'){const sp=Math.hypot(p.vx,p.vz);p.o.rotation.set(-Math.atan2(p.vy,sp),Math.atan2(p.vx,p.vz),0);}else if(p.id==='spear'){const sp=Math.hypot(p.vx,p.vz);p.o.rotation.order='YXZ';p.o.rotation.set(Math.PI/2-Math.atan2(p.vy,sp),Math.atan2(p.vx,p.vz),0);}else{p.o.rotation.x+=dt*14;p.o.rotation.z+=dt*9;}
    let hit=null;if(G.foes)for(const a of G.foes){if(a.alive&&Math.hypot(a.x-p.x,a.z-p.z)<a.r+5&&p.y>a.y&&p.y<a.y+40){hit=a;break;}}if(!hit)for(const a of G.animals){if(!a.alive||!a.o.visible)continue;if(Math.hypot(a.x-p.x,a.z-p.z)<a.r+5&&p.y>a.y-2&&p.y<a.y+a.r*2.4+8){hit=a;break;}}
    const gy=Math.max(hAt(p.x,p.z),waterAt(p.x,p.z));if(hit||p.y<=gy||p.t>4){G.proj.splice(G.proj.indexOf(p),1);
      if(hit){const dmg=(p.id==='spear'?3.5:p.id==='arrow'?2.8:1.3)*(1+0.06*skLv('hunt'));if(hit.kind==='raider')foeDamage(hit,dmg);else animalDamage(hit,dmg);addXp('hunt',2);uiFloat&&uiFloat(p.id==='spear'?'Trúng!':'Trúng!','#ffd27a');}
      else sfx(wdAt(p.x,p.z)>0.5?'drink':'thud');
      const wet=wdAt(p.x,p.z)>8;if(wet){G.sc.remove(p.o);if(p.id==='spear')uiToast('Giáo chìm xuống nước mất rồi.','bad');continue;}
      if(p.id==='arrow'&&Math.random()<0.45){G.sc.remove(p.o);continue;}dropAdd(p.id,p.x,hAt(p.x,p.z)+1,p.z,p.o);}}}
/* ---------- đồ rơi trên đất (đá, giáo đã ném) ---------- */
function dropAdd(id,x,y,z,o){G.drops=G.drops||[];if(!o){o=model(id==='spear'?['tool','spear']:['item',id]);G.sc.add(o);}o.position.set(x,y,z);if(id==='spear'){o.rotation.set(Math.PI/2,Math.random()*6,0);}else o.rotation.set(0,Math.random()*6,0);
  G.drops.push({id,x,y,z,o,t:G.t});if(G.drops.length>30){const d=G.drops.shift();G.sc.remove(d.o);}}
function dropTick(){if(!G.drops)return;for(const d of G.drops.slice())if(G.t-d.t>600){G.sc.remove(d.o);G.drops.splice(G.drops.indexOf(d),1);}}
function dropPick(d){if(!invFits(d.id,1)){uiToast('Túi đầy!','bad');return;}G.drops.splice(G.drops.indexOf(d),1);G.sc.remove(d.o);invAdd(d.id,1);sfx('pick');uiFly&&uiFly(d.id,1,[d.x,d.y+4,d.z]);if(d.id==='spear'&&!P.toolId)selectTool('spear');uiHotbar();}
/* ---------- tư thế cho người nhìn từ trên cao (khi chưa có khung xương mới) ---------- */
function actsPose(R,t){if(G.swim){R.armL.rotation.x=-2.6+Math.sin(t*3)*0.6;R.armR.rotation.x=-2.6-Math.sin(t*3)*0.6;R.legL.rotation.x=Math.sin(t*5)*0.4;R.legR.rotation.x=-Math.sin(t*5)*0.4;R.torso.rotation.x=0.9;return true;}
  if(G.sit){R.legL.rotation.x=-1.45;R.legR.rotation.x=-1.45;R.torso.rotation.x=-0.1;R.armL.rotation.x=-0.5;R.armR.rotation.x=-0.5;return true;}
  if(G.throwAnim>0){const k=1-G.throwAnim/0.45;R.armR.rotation.x=k<0.4?-2.8*k/0.4:-2.8+3.6*(k-0.4)/0.6;R.torso.rotation.x=k<0.4?-0.15:0.25;return true;}
  if(G.sneak){R.torso.rotation.x=0.45;R.head.rotation.x=-0.35;R.legL.rotation.x*=0.6;R.legR.rotation.x*=0.6;R.legL.rotation.x-=0.5;R.legR.rotation.x-=0.5;return false;}
  return false;}
