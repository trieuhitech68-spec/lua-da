/* ===================== SỰ SỐNG: CƠ THỂ, BỆNH, THỜI TIẾT, BỐN MÙA, THÚ VẬT, CÔN TRÙNG ===================== */
// mùa và ngày trong mùa lấy theo đồng hồ chung (clock.js) để mọi người cùng mùa
const seasonIdx=()=>typeof wcSeason==='function'?wcSeason():Math.floor((S.day-1)/SEASON_DAYS)%4;
const seasonDay=()=>typeof wcSeasonDay==='function'?wcSeasonDay():((S.day-1)%SEASON_DAYS)+1;
const isNight=()=>S.hour>=19||S.hour<5.5;
/* ---------- mùa: tuyết phủ và lá đổi màu bằng shader dùng chung cho mọi vật liệu ---------- */
const SEA={uSnow:{value:0},uAut:{value:0},uWet:{value:0}};
function seasonMat(m){if(!m||!m.isMeshStandardMaterial||m.userData.sea||m.userData.noSea)return;m.userData.sea=1;const prev=m.onBeforeCompile,pk=m.customProgramCacheKey?m.customProgramCacheKey.bind(m):()=>'';
  m.onBeforeCompile=(sh,r)=>{if(prev)prev.call(m,sh,r);sh.uniforms.uSnow=SEA.uSnow;sh.uniforms.uAut=SEA.uAut;sh.uniforms.uWet=SEA.uWet;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vSWn;varying vec3 vSWp;').replace('#include <defaultnormal_vertex>','#include <defaultnormal_vertex>\n  vSWn=normalize((vec4(transformedNormal,0.0)*viewMatrix).xyz);')
      .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n  {vec4 sp=vec4(transformed,1.0);\n  #ifdef USE_INSTANCING\n  sp=instanceMatrix*sp;\n  #endif\n  vSWp=(modelMatrix*sp).xyz;}');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uSnow,uAut,uWet;varying vec3 vSWn;varying vec3 vSWp;').replace('#include <color_fragment>',`#include <color_fragment>
  {float nz=fract(sin(dot(floor(vSWp.xz*0.045),vec2(12.9898,78.233)))*43758.5453);vec3 c=diffuseColor.rgb;float lu=dot(c,vec3(0.2126,0.7152,0.0722));
   float leafy=step(c.r*1.08,c.g)*step(c.b*1.25,c.g)*step(0.035,lu);vec3 aut=mix(vec3(0.62,0.22,0.04),vec3(0.78,0.52,0.08),nz)*(0.5+lu*2.6);
   c=mix(c,aut,leafy*uAut*(0.45+0.55*nz));float up=smoothstep(0.5,0.92,vSWn.y);c=mix(c,vec3(0.86,0.9,0.95),up*uSnow*(0.72+0.28*nz));c*=1.0-uWet*0.18;diffuseColor.rgb=c;}`);};
  m.customProgramCacheKey=()=>pk()+'|sea';m.needsUpdate=true;}
function seasonPatchAll(root){(root||G.sc).traverse(o=>{if(!o.material)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(seasonMat);});}
function seasonTick(dt){const si=seasonIdx(),sd=seasonDay(),f=typeof wcSeasonProg==='function'?wcSeasonProg():(S.hour/24+sd-1)/SEASON_DAYS;// tiến độ trong mùa 0..1
  const snowT=si===3?Math.min(1,f*3)*0.9:si===0?Math.max(0,0.9-f*6):0,autT=si===2?Math.min(0.9,f*2.2):si===3?0.55:si===0?Math.max(0,0.5-f*4):0;
  SEA.uSnow.value+=(snowT-SEA.uSnow.value)*Math.min(1,dt*0.5);SEA.uAut.value+=(autT-SEA.uAut.value)*Math.min(1,dt*0.5);SEA.uWet.value+=(((G.wxK||0)>0.3&&S.wx&&S.wx.type!=='snow'?0.8:0)-SEA.uWet.value)*Math.min(1,dt*0.3);
  if(G.seasonShown!==si){const first=G.seasonShown==null;G.seasonShown=si;resSeasonal();if(!first){uiToast(`${SEASONS[si].ic} Mùa ${SEASONS[si].n} đã đến. ${['Cây cối đâm chồi, mưa nhiều.','Nắng nóng: khát nhanh hơn, quả mọng chín rộ.','Lá vàng rơi, nấm mọc nhiều: hãy tích trữ cho mùa đông.','Tuyết rơi, giá rét: cần lửa, nhà kín và áo ấm. Cây trồng ngừng lớn.'][si]}`,'gold');sfx('level');}}}
// tài nguyên theo mùa: ngoài mùa thì tàn (ẩn) hoặc hết quả
function resSeasonal(){const si=seasonIdx();let ch=0;RES.forEach(q=>{const D=RT[q.t];if(!D.seasons)return;const ok=D.seasons.includes(si);
    if(!ok&&q.st===0){q.st=2;q.hp=0;ch=1;if(D.keep)resShow(q);else RI.get(q.gk).api.hide(q.gi);}
    else if(ok&&q.st===2){q.st=0;q.hp=D.hp;ch=1;resShow(q);}});if(ch)RI.forEach(v=>v.api.flush());}
/* ---------- nhiệt độ, chỗ trú, lửa ---------- */
function ambientTemp(){const SN=SEASONS[seasonIdx()],k=0.5+0.5*Math.cos((S.hour-14)/24*Math.PI*2);let t=SN.temp[1]+(SN.temp[0]-SN.temp[1])*k;const w=S.wx&&S.wx.type;if(w==='rain')t-=3;else if(w==='storm')t-=6;else if(w==='snow')t-=3;else if(w==='cloudy')t-=1;return t;}
function underRoof(x,z){if(typeof inCave==='function'&&inCave(x,z))return true;const c=cellAt(x,z);if(c&&c.roof){const rb=BYID.get(c.roof);if(!rb||rb.prog==null)return true;}if(c&&c.obj){const b=BYID.get(c.obj);const d=b&&pieceDef(b.k);if(d&&d.shelter)return true;}return false;}
function fireHeat(x,z){let h=0;for(const f of G.flames){if(f.off)continue;const b=BYID.get(f.id);const d=b&&pieceDef(b.k);if(!d)continue;const dist=Math.hypot(f.x-x,f.z-z),R=d.warm?110:50;if(dist<R)h=Math.max(h,(1-dist/R)*(d.warm?1:0.35));}if(P.toolId==='torch')h=Math.max(h,0.18);return h;}
function wearWarm(){let w=0;for(const k in (S.wear||{})){const id=S.wear[k];if(id&&ITEMS[id])w+=ITEMS[id].warm||0;}return w;}
function nearWater(x,z,r){for(let a=0;a<8;a++){const ang=a/8*Math.PI*2;for(const d of [r*0.5,r]){if(wdAt(x+Math.cos(ang)*d,z+Math.sin(ang)*d)>0.5)return true;}}return false;}
/* ---------- trạng thái bệnh ---------- */
function addStatus(k,hours){if(!STATUS[k])return;const had=!!S.st[k];S.st[k]=Math.max(S.st[k]||0,hours||STATUS[k].dur);if(!had){uiToast(`⚠ ${STATUS[k].n}: ${STATUS[k].d}${STATUS[k].cure?' Chữa bằng '+ITEMS[STATUS[k].cure].n+'.':''}`,'bad');sfx('hurt');}uiHud(true);}
function cureStatus(k){if(S.st[k]){delete S.st[k];uiToast(`Đã khỏi ${STATUS[k].n}.`,'good');uiHud(true);}}
/* ---------- cơ thể: đói, khát, thể lực, thân nhiệt, ướt, máu ---------- */
function maxStam(){return 100+skLv('run')*5-(S.st.poison?25:0)-(S.st.fever?20:0)-(S.st.cold?10:0);}
function bodyTick(dt){const p=S.p,cozy=S.mode==='cozy',gh=dt*24/DAY_SEC,T=ambientTemp(),hot=T>30?1.6:T>26?1.25:1;G.tempC=T;
  p.food=Math.max(0,p.food-gh*(cozy?2:3.6)*(S.st.poison?2:1));p.water=Math.max(0,p.water-gh*(cozy?2.6:4.6)*hot*(S.st.fever?1.4:1));
  // thể lực hồi khi không chạy
  if(G.swim){p.wet=100;p.stam=Math.max(0,p.stam-dt*(S.mode==='cozy'?2.2:4));if(p.stam<=0&&S.mode!=='cozy')p.hp=Math.max(0,p.hp-dt*4);}
  const busy=G.running||G.act||G.work||G.swim;const ms=maxStam();if(!busy)p.stam=Math.min(ms,p.stam+dt*(G.sit?3:1)*13*(p.food>15&&p.water>15?1:0.45)*(S.st.cold?0.5:1)*(1+skLv('run')*0.04));else if(!G.running)p.stam=Math.min(ms,p.stam+dt*3);p.stam=Math.min(p.stam,ms);
  // ướt: dầm mưa, lội nước; khô dần khi có lửa, nắng
  const wx=S.wx&&S.wx.type,roof=underRoof(P.x,P.z),fire=fireHeat(P.x,P.z),inWater=wdAt(P.x,P.z)>1;
  if(((wx==='rain'||wx==='storm'||wx==='snow')&&!roof&&(G.wxK||0)>0.3)||inWater)p.wet=Math.min(100,p.wet+dt*(inWater?20:4));else p.wet=Math.max(0,p.wet-dt*(0.7+fire*6+(T>24?1.2:0)));
  // thân nhiệt hướng về mức "cảm nhận"
  const feel=T+wearWarm()*0.6+fire*38+(roof?5:0)-p.wet*0.1,target=clamp(50+(feel-17)*3,0,100);p.warm+=(target-p.warm)*Math.min(1,dt*0.035);G.feel=feel;
  // máu
  let dmg=0;if(p.food<=0)dmg+=cozy?0:0.35;if(p.water<=0)dmg+=cozy?0:0.6;if(p.warm<12)dmg+=cozy?0.05:0.45;if(S.st.bleed)dmg+=cozy?0.5:1.1;if(S.st.fever)dmg+=cozy?0:0.18;if(S.st.sting)dmg+=0.05;
  if(dmg>0)p.hp=Math.max(0,p.hp-dmg*dt);else if(p.food>35&&p.water>25&&p.warm>30)p.hp=Math.min(100,p.hp+dt*0.3);
  // nhiễm lạnh khi rét lâu
  if(p.warm<25){G.coldH=(G.coldH||0)+gh;if(G.coldH>2.5&&!S.st.cold&&Math.random()<gh*(cozy?0.15:0.35))addStatus('cold');}else G.coldH=Math.max(0,(G.coldH||0)-gh);
  // muỗi ven sông lúc chạng vạng và đêm (trừ mùa đông) — đốt bó hương ngải để xua
  if((S.hour>=17.5||S.hour<6)&&seasonIdx()!==3&&!(S.p.repel>TNOW())&&nearWater(P.x,P.z,170)){G.mosq=1;if(Math.random()<gh*(cozy?0.25:0.6)){uiToast('🦟 Bị muỗi đốt! Đốt Bó hương ngải để xua muỗi.','bad');if(Math.random()<(cozy?0.3:0.55))addStatus('fever');}}else G.mosq=0;
  // bệnh tự khỏi dần
  for(const k in S.st){S.st[k]-=gh;if(S.st[k]<=0){delete S.st[k];uiToast(`Đã khỏi ${STATUS[k].n}.`,'good');uiHud(true);}}
  if(p.hp<=0)die();}
/* ---------- thời tiết ---------- */
function weatherTick(dt){const now=TNOW(),WX=typeof wcWeather==='function'?wcWeather():null;if(!S.wx||now>=S.wx.until||(WX&&S.wx.slot!==WX.slot)){const si=seasonIdx(),rp=SEASONS[si].rain,r=Math.random();let type='clear';
    if(r<rp)type=si===3?'snow':(Math.random()<0.16?'storm':'rain');else if(r<rp+0.22)type='cloudy';const prev=S.wx&&S.wx.type;S.wx={type,until:now+0.12+Math.random()*0.3};if(WX){type=WX.type;S.wx={type,until:WX.until,slot:WX.slot};}
    if(type!==prev&&G.on){const msg={clear:'Trời quang đãng.',cloudy:'Mây kéo đến.',rain:'Trời đổ mưa: tìm chỗ trú kẻo ướt và lạnh.',storm:'Giông bão! Sấm chớp, gió lạnh: mau về nhà.',snow:'Tuyết rơi.'}[type];uiToast((type==='rain'||type==='storm'?'🌧 ':type==='snow'?'❄ ':'')+msg,type==='storm'?'bad':'');}}
  const want=S.wx.type==='rain'?0.8:S.wx.type==='storm'?1:S.wx.type==='snow'?0.85:S.wx.type==='cloudy'?0.25:0;G.wxK=(G.wxK||0)+(want-(G.wxK||0))*Math.min(1,dt*0.4);G.wxType=S.wx.type;
  precipTick(dt);if(S.wx.type==='storm'&&Math.random()<dt*0.12){G.flash=1;setTimeout(()=>sfx('thunder'),300+Math.random()*900);}}
// mưa (vệt sáng) và tuyết (hạt trắng) quanh người chơi
function precipInit(){const T=THREE,N=1600;const g=new T.BufferGeometry(),pos=new Float32Array(N*6);g.setAttribute('position',new T.BufferAttribute(pos,3));
  const m=new T.LineBasicMaterial({color:0xaac4dc,transparent:true,opacity:0.45,depthWrite:false});G.rain=new T.LineSegments(g,m);G.rain.frustumCulled=false;G.sc.add(G.rain);G.rainP=new Float32Array(N*3);
  for(let i=0;i<N;i++){G.rainP[i*3]=(Math.random()-0.5)*700;G.rainP[i*3+1]=Math.random()*420;G.rainP[i*3+2]=(Math.random()-0.5)*700;}
  const sg=new T.BufferGeometry(),sp=new Float32Array(N*3);sg.setAttribute('position',new T.BufferAttribute(sp,3));G.snow=new T.Points(sg,new T.PointsMaterial({color:0xffffff,size:3.2,transparent:true,opacity:0.85,depthWrite:false}));G.snow.frustumCulled=false;G.sc.add(G.snow);}
function precipTick(dt){if(!G.rain)precipInit();const k=G.wxK||0,type=G.wxType,N=1600;const rain=(type==='rain'||type==='storm')?k:0,snow=type==='snow'?k:0;
  const cx=P.x,cz=P.z,cy=P.y;const rp=G.rain.geometry.attributes.position.array,sp=G.snow.geometry.attributes.position.array,nR=Math.floor(N*rain),nS=Math.floor(N*snow);
  const wind=type==='storm'?60:18;for(let i=0;i<N;i++){const b=i*3;G.rainP[b+1]-=dt*(i<nR?520:70);if(i>=nR&&i<nS)G.rainP[b]+=Math.sin(G.t*1.3+i)*dt*14;G.rainP[b]+=dt*(i<nR?wind:6);
    if(G.rainP[b+1]<0){G.rainP[b+1]+=420;G.rainP[b]=(Math.random()-0.5)*700;G.rainP[b+2]=(Math.random()-0.5)*700;}
    const x=cx+G.rainP[b],y=cy-40+G.rainP[b+1],z=cz+G.rainP[b+2];const o=i*6;if(i<nR){rp[o]=x;rp[o+1]=y;rp[o+2]=z;rp[o+3]=x+wind*0.03;rp[o+4]=y+16;rp[o+5]=z;}else{rp[o]=rp[o+3]=0;rp[o+1]=rp[o+4]=-999;rp[o+2]=rp[o+5]=0;}
    if(i<nS){sp[b]=x;sp[b+1]=y;sp[b+2]=z;}else{sp[b]=0;sp[b+1]=-999;sp[b+2]=0;}}
  G.rain.geometry.attributes.position.needsUpdate=true;G.snow.geometry.attributes.position.needsUpdate=true;G.rain.visible=nR>0;G.snow.visible=nS>0;
  // âm thanh mưa
  if(typeof ambRain==='function')ambRain(rain);}
/* ---------- côn trùng & sinh vật nhỏ: đom đóm đêm hè, bướm ban ngày, ong quanh tổ, muỗi ven sông ---------- */
function crittersInit(){const T=THREE,N=180,g=new T.BufferGeometry(),pos=new Float32Array(N*3),col=new Float32Array(N*3);g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('color',new T.BufferAttribute(col,3));
  const cv=mkCanvas(32,32),c=cv.getContext('2d'),gr=c.createRadialGradient(16,16,0,16,16,15);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.35,'rgba(255,255,255,.6)');gr.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=gr;c.fillRect(0,0,32,32);
  G.crit=new T.Points(g,new T.PointsMaterial({size:5,map:new T.CanvasTexture(cv),vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));G.crit.frustumCulled=false;G.sc.add(G.crit);
  G.critD=Array.from({length:N},(_,i)=>({x:(Math.random()-0.5)*800,z:(Math.random()-0.5)*800,ph:Math.random()*6,s:0.5+Math.random()}));}
function crittersTick(dt){if(!G.crit)crittersInit();const si=seasonIdx(),night=isNight(),rainy=(G.wxK||0)>0.4;const pos=G.crit.geometry.attributes.position.array,col=G.crit.geometry.attributes.color.array;
  const ff=night&&(si===1||si===0)&&!rainy,bf=!night&&(si===0||si===1)&&!rainy;// đom đóm / bướm
  G.critD.forEach((q,i)=>{const b=i*3;let x=P.x+q.x,z=P.z+q.z;q.x+=Math.sin(G.t*0.4*q.s+q.ph)*dt*12;q.z+=Math.cos(G.t*0.33*q.s+q.ph*2)*dt*12;if(Math.abs(q.x)>420)q.x*=-0.95;if(Math.abs(q.z)>420)q.z*=-0.95;
    let y=-999,r=0,g=0,bl=0;const h=hAt(x,z);
    if(ff&&i<120&&h>2){y=h+10+Math.sin(G.t*1.7*q.s+q.ph)*6;const on=Math.max(0,Math.sin(G.t*2.2*q.s+q.ph*3));r=0.75*on;g=1*on;bl=0.3*on;}
    else if(bf&&i<60&&h>2){y=h+8+Math.abs(Math.sin(G.t*6*q.s+q.ph))*8;const cc=[[1,0.7,0.2],[1,1,1],[0.6,0.7,1],[1,0.5,0.7]][i%4];r=cc[0]*0.55;g=cc[1]*0.55;bl=cc[2]*0.55;}
    pos[b]=x;pos[b+1]=y;pos[b+2]=z;col[b]=r;col[b+1]=g;col[b+2]=bl;});
  // ong quanh tổ gần người chơi
  let k=150;if(!night&&si!==3)for(const i of near(P.x,P.z,500)){const q=RES[i];if(q.t!=='beehive'||q.st!==0)continue;for(let j=0;j<10&&k<170;j++,k++){const a=G.t*(3+j*0.4)+j;const b=k*3;pos[b]=q.x+Math.cos(a)*(8+j);pos[b+1]=q.y+26+Math.sin(a*1.7)*5;pos[b+2]=q.z+Math.sin(a)*(8+j);col[b]=0.8;col[b+1]=0.6;col[b+2]=0.05;}}
  // muỗi vo ve quanh người khi ở ven sông chập tối
  for(let j=0;j<10;j++,k++){if(k>=180)break;const b=k*3;if(G.mosq){const a=G.t*7+j*1.3;pos[b]=P.x+Math.cos(a)*(10+j%3*4);pos[b+1]=P.y+24+Math.sin(a*1.9)*8;pos[b+2]=P.z+Math.sin(a*1.1)*(10+j%4*3);col[b]=0.12;col[b+1]=0.1;col[b+2]=0.08;}else{pos[b+1]=-999;}}
  for(;k<180;k++)pos[k*3+1]=-999;
  G.crit.geometry.attributes.position.needsUpdate=true;G.crit.geometry.attributes.color.needsUpdate=true;}
/* ---------- thú vật ---------- */
G.animals=[];
function animalModel(kind){let g=null;try{if(window.SBM&&SBM.animal)g=SBM.animal(kind);}catch(e){console.warn('thú',kind,e);}if(g)return g;
  // dự phòng: thân + đầu + 4 chân có khớp
  const K=K3,col={rabbit:'#a08a6a',deer:'#a8744a',boar:'#4a3a30',wolf:'#7a7a80',bear:'#5a3a24'}[kind]||'#888',s={rabbit:0.35,deer:1,boar:0.75,wolf:0.8,bear:1.3}[kind]||1;
  const G0=K.group(),body=K.group(K.box(14*s,12*s,26*s,col,{y:16*s,center:1}));G0.add(body);const head=K.group(K.box(9*s,9*s,11*s,col,{z:6*s,center:1}));head.position.set(0,22*s,14*s);G0.add(head);
  const leg=(x,z)=>{const L=K.group(K.box(3.5*s,12*s,3.5*s,col,{y:-6*s,center:1}));L.position.set(x*s,12*s,z*s);G0.add(L);return L;};
  G0.userData.rig={body,head,legFL:leg(-5,9),legFR:leg(5,9),legBL:leg(-5,-9),legBR:leg(5,-9)};return G0;}
function animalsInit(){const R=rng(S.seed+77);G.animals=[];
  for(const kind in ANIMALS){const D=ANIMALS[kind],N0=Math.round(D.n0*(['tiger','gaur','monkey','crocodile','snake','junglefowl'].includes(kind)?1:2.4));let n=0,tries=0;while(n<N0&&tries<6000){tries++;let x,z;const rg=D.reg&&R()<0.75?REG.find(r=>r.id===D.reg[Math.floor(R()*D.reg.length)]):null;if(rg){const a=R()*6.283,rr=Math.sqrt(R())*rg.r;x=rg.x+Math.cos(a)*rr;z=rg.z+Math.sin(a)*rr;}else{const a=R()*6.283,rr=Math.sqrt(R())*WR*0.85;x=Math.cos(a)*rr;z=Math.sin(a)*rr;}if(!D.bio.includes(biome(x,z)))continue;if(kind==='crocodile'&&!nearWater(x,z,120))continue;
      if(Math.hypot(x-SPAWN[0],z-SPAWN[1])<(D.aggro==='never'?260:700))continue;const grp=D.herd||D.pack||1;for(let k=0;k<grp&&n<N0;k++,n++){const ax=x+(R()-0.5)*60,az=z+(R()-0.5)*60;G.animals.push(animalNew(kind,ax,az,R,kind==='deer'&&k>0?'doe':null));}}}
  seasonPatchAll();}
function animalNew(kind,x,z,R,mk){const D=ANIMALS[kind],o=animalModel(mk||kind);o.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;}});G.sc.add(o);
  return {kind,n:D.n,x,z,y:hAt(x,z),ry:(R?R():Math.random())*6.28,hp:D.hp,alive:true,r:D.r,o,rig:o.userData.rig||{},home:{x,z},state:'wander',tx:x,tz:z,tt:0,spd:0,atkT:0,angry:false,ph:Math.random()*6,dieT:0};}
function animalsTick(dt){const cozy=S.mode==='cozy',night=isNight(),winter=seasonIdx()===3;
  for(const a of G.animals){const D=ANIMALS[a.kind];const d=Math.hypot(a.x-P.x,a.z-P.z);
    if(!a.alive){if(a.dieT){a.dieT+=dt;const k=Math.min(1,a.dieT/0.6);a.o.rotation.z=k*1.5;if(a.dieT>3.5){a.o.visible=false;a.dieT=0;}}
      if(TNOW()>a.back&&d>900){Object.assign(a,{alive:true,hp:D.hp,x:a.home.x,z:a.home.z,angry:false,state:'wander'});a.o.visible=true;a.o.rotation.z=0;}continue;}
    if(D.winterSleep&&winter){a.o.visible=false;continue;}
    if(d>Math.min(1800,G.treeD||1800)){a.o.visible=false;continue;}a.o.visible=true;const sneakK=G.sneak?0.45:G.running?1.3:1;
    // quyết định hành vi
    if(a.calm&&a.calm>G.t){a.state='wander';a.spd=0;a.o.position.set(a.x,a.y,a.z);continue;}let hostile=a.angry;if(!cozy){if(D.aggro==='territory'&&d<(D.near||170)*sneakK)hostile=true;if(D.aggro==='stalk'&&d<230*sneakK)hostile=true;if(D.aggro==='night'&&(night||winter)&&d<280*sneakK)hostile=true;}else if(D.aggro==='territory'&&d<Math.min(70,D.near||70)*sneakK)hostile=true;else if(D.aggro==='stalk'&&night&&d<110*sneakK)hostile=true;
    let tx=a.tx,tz=a.tz,sp=D.spd*0.28;
    if(hostile){tx=P.x;tz=P.z;sp=D.spd*(cozy?0.8:1);a.state='chase';if(d<a.r+16){sp=0;a.atkT-=dt;if(a.atkT<=0){a.atkT=1.3;animalAttack(a);}}if(d>600){a.angry=false;}}
    else if(D.flee&&d<D.flee*sneakK){const ang=Math.atan2(a.x-P.x,a.z-P.z);tx=a.x+Math.sin(ang)*120;tz=a.z+Math.cos(ang)*120;sp=D.spd;a.state='flee';}
    else{a.tt-=dt;if(a.tt<=0||Math.hypot(a.tx-a.x,a.tz-a.z)<10){a.tt=3+Math.random()*6;const ang=Math.random()*6.28,rr=Math.random()*220;a.tx=a.home.x+Math.cos(ang)*rr;a.tz=a.home.z+Math.sin(ang)*rr;if(Math.random()<0.4)a.tt+=4;}
      tx=a.tx;tz=a.tz;sp=a.tt>6?0:D.spd*0.25;a.state='wander';}
    const dx=tx-a.x,dz=tz-a.z,dl=Math.hypot(dx,dz);if(dl>2&&sp>0){const want=Math.atan2(dx,dz);a.ry=lerpAng(a.ry,want,Math.min(1,dt*6));const nx=a.x+Math.sin(a.ry)*sp*dt,nz=a.z+Math.cos(a.ry)*sp*dt;if(hAt(nx,nz)>1.5&&Math.hypot(nx,nz)<WR*0.98){a.x=nx;a.z=nz;}else{a.tt=0;a.ry+=Math.PI*0.5;}}
    a.spd+=((dl>2?sp:0)-a.spd)*Math.min(1,dt*6);a.y+=(hAt(a.x,a.z)-a.y)*Math.min(1,dt*10);
    // hoạt cảnh chân
    const R=a.rig,f=a.spd/40,s=Math.sin(G.t*(4+f*2.2)+a.ph)*Math.min(0.55,a.spd/80);if(R.legFL){R.legFL.rotation.x=s;R.legBR.rotation.x=s;R.legFR.rotation.x=-s;R.legBL.rotation.x=-s;}
    if(R.head)R.head.rotation.x=a.spd<5?Math.sin(G.t*0.8+a.ph)*0.25+0.2:0;if(R.tail)R.tail.rotation.y=Math.sin(G.t*6+a.ph)*0.4;if(R.tail2)R.tail2.rotation.y=Math.sin(G.t*6+a.ph-0.8)*0.5;if(R.seg){const w=a.spd>3?7:2,A=a.spd>3?0.45:0.15;R.seg.forEach((sg,i)=>{sg.rotation.y=(R.segRest?R.segRest[i]:0)+A*Math.sin(G.t*w+a.ph-i*0.9);});}
    a.o.position.set(a.x,a.y+Math.abs(s)*1.2,a.z);a.o.rotation.y=a.ry;}}
function animalAttack(a){const D=ANIMALS[a.kind],cozy=S.mode==='cozy';const dmg=(D.dmg||5)*(cozy?0.45:1);S.p.hp=Math.max(0,S.p.hp-dmg);P.hurtT=0.4;sfx('hurt');puff(P.x,P.y+18,P.z,'#c0392b',4);uiFloat('−'+Math.round(dmg),P.x,P.y+40,P.z,'#ff8a7a');
  if(D.venom){addStatus('poison');uiToast('🐍 Bị rắn cắn! Uống nước bạc hà để giải độc.','bad');}else if(Math.random()<(cozy?0.2:0.4))addStatus('bleed');a.angry=true;if(G.act&&G.act.t&&G.act.t.type!=='animal')G.act=null;G.lastBiter=a;G.biteT=G.t;uiHud(true);if(S.p.hp<=0)die();}
function fistPow(){const id=selTool();const I=id&&ITEMS[id];if(I&&I.t==='tool'&&['spear','club','knife','axe','bronzeSpear','bronzeAxe','bow'].some(k=>id.startsWith(k)))return I.pow||1;if(id==='stone'||id==='flint')return 0.9;if(id==='stick')return 0.8;return 0.6;}
function animalHit(a){const m=fistPow()*(1+0.06*skLv('hunt'));P.ry=Math.atan2(a.x-P.x,a.z-P.z);G.punchT=0.3;if(a.kind==='raider'){foeDamage(a,m);return;}animalDamage(a,m);}
function animalDamage(a,dmg){if(!a.alive)return;const D=ANIMALS[a.kind];a.hp-=dmg;sfx('hit');puff(a.x,a.y+14,a.z,'#c0392b',4);
  S.p.stam=Math.max(0,S.p.stam-3);if(D.aggro!=='never')a.angry=true;else{a.tt=0;}
  if(a.hp<=0){a.alive=false;a.dieT=0.001;a.back=TNOW()+1+Math.random();G.act=null;const out={};for(const k in D.drop)out[k]=D.drop[k]+(Math.random()<skLv('hunt')*0.08?1:0);give(out,[a.x,a.y+16,a.z]);addXp('hunt',4+D.hp);cnt('cnt','hunt');sfx('thud');save();uiHud();}}

/* ---------- chim bay lượn ban ngày (đàn nhỏ quanh người chơi) ---------- */
function birdsTick(dt){if(!window.SBM||!SBM.animal)return;if(!G.birds){G.birds=[];try{for(let i=0;i<6;i++){const o=SBM.animal('bird');o.traverse(m=>{if(m.isMesh)m.castShadow=true;});o.scale.setScalar(1.2);G.sc.add(o);seasonPatchAll(o);
      G.birds.push({o,rig:o.userData.rig||{},ph:Math.random()*6,r:110+Math.random()*190,h:95+Math.random()*80,w:(0.22+Math.random()*0.22)*(Math.random()<0.5?-1:1),cx:P.x+(Math.random()-0.5)*300,cz:P.z+(Math.random()-0.5)*300,a:Math.random()*6.28});}}catch(e){G.birds=[];}}
  const vis=!isNight()&&!((G.wxK||0)>0.5)&&seasonIdx()!==3;
  for(const b of G.birds){b.o.visible=vis;if(!vis)continue;b.cx+=(P.x-b.cx)*Math.min(1,dt*0.04);b.cz+=(P.z-b.cz)*Math.min(1,dt*0.04);b.a+=b.w*dt;
    const x=b.cx+Math.cos(b.a)*b.r,z=b.cz+Math.sin(b.a)*b.r,y=Math.max(hAt(x,z),0)+b.h+Math.sin(G.t*0.6+b.ph)*14;b.o.position.set(x,y,z);
    b.o.rotation.y=Math.atan2(-Math.sin(b.a)*b.w,Math.cos(b.a)*b.w);b.o.rotation.z=-Math.sign(b.w)*0.25;
    const glide=Math.sin(G.t*0.45+b.ph)>0.15,f=glide?0.12:Math.sin(G.t*15+b.ph)*0.75;if(b.rig.wingL)b.rig.wingL.rotation.z=f;if(b.rig.wingR)b.rig.wingR.rotation.z=-f;}}
