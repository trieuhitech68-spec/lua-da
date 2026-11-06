/* ===================== SB MODELS 3 — SE-Asian fauna, stilt-house pieces, cliff/valley props =====================
   Needs models.js (window.SBM) first; call SBmodels3Init() after SBmodelsInit() (and SBmodels2Init() if used). Adds to window.SBM:
     M.animal(kind) gains: tiger, gaur, monkey, crocodile, snake, junglefowl, carp, catfish, snakehead, fish (=carp), frog, butterfly (old kinds unchanged)
     M.fish(v)  v='carp'|'catfish'|'snakehead'          M.butterfly(seed)  colour variants
     M.piece(id) gains: post, stilt, upperFloor, ladder, bambooWall, bambooWallDoor, mudWall, mudWallWindow, halfWall, railing, bambooFloor,
                        thatchRoof, leafRoof, table, stool, shelf, rack, rug, rugHide, pottery, drum, caveArt, trap, fishTrap
     M.tool('rod') / M.item('rod')                       M.animalPose(G,'sit'|'stand')  (monkey; harmless no-op on others)
     terrain: M.cliffRock(v,seed) M.scree(seed) M.waterfall(h) M.reedBed(seed) M.savannaTree(seed) M.deadLog(seed)
   Same conventions as models.js (du; 1 m ≈ 20 du; human ≈ 36 du; NEW Group per call; origin ground centre; bottom y=0; front +Z;
   deterministic, no Math.random). Geometry is vertex coloured on a few shared materials (M.mat3):
     sb3Flat (matte) · sb3Gloss (wet/shiny: eyes, fish, frog, horn, glaze) · sb3DS (double-sided thin parts: fins, wings, leaves, cords)
     sb3Wood / sb3Bamboo / sb3Thatch / sb3Mud / sb3Rock (texture × vertex colour) · sb3Water (transparent 0.75, scrolling map) · sb3Art (cave paintings)
   PIECE CONVENTIONS (all on the 40-du grid, like models.js):
     post        round timber post on a stone footing, centred at the origin (meant for a cell CORNER), y 0→54 (one storey: wall 48 + floor 6).
     stilt       raised floor cell: 4 posts at (±20,±20) y 0→54, tie beams + cross bracing, deck with beams y 48→54 and top surface at y=60.
     upperFloor  deck for an upper storey: top surface y=6 (like floor), beams underneath down to y=-6. Place it at the storey height (wall base + 54),
                 so it rests on the wall tops (beams y -6..0 overlap the wall top band).
     ladder      wall frame (along X, centred on the cell edge): bamboo ladder leaning on the edge, foot at z≈+14 y=0, top at z≈+1 y=54
                 (rails continue to y≈61 as hand-holds). Climb from +Z.
     bambooWall, bambooWallDoor, mudWall, mudWallWindow: exactly the `wall` frame (x∈[-20,20], z≈[-2,2], height 48, bottom 0, end posts on x=±20);
                 door opening x∈[-8,8] y 0..34, window x∈[-8,8] y 18..34, both symmetric in z.
     halfWall    same frame, 24 high (low mud wall with a timber cap).   railing  same frame, bamboo rail 20 high.
     bambooFloor like floor: x,z∈[-20,20], top y=6.     thatchRoof / leafRoof: exact `roof` slab contract (eave z=+20 y=48 → ridge z=-20 y=78).
     furniture (table, stool, shelf, rack, pottery, drum): bottom y=0, centred; shelf/rack backs face -Z (put them against a wall).
     rug         lies flat, top at y≈0.5 (28×40).  rugHide: hide rug.   caveArt: 40×30 panel x∈[-20,20], y∈[0,30], plane z=0 facing +Z (alpha-tested).
     trap        bamboo spring snare, footprint ≈ 24×12.   fishTrap: woven bamboo trap (lờ) lying along Z, 22 long, mouth at +Z.
   TERRAIN userData: r (footprint radius), h (height), colliders [[x,z,r],...]; waterfall: animate=true, water=material, uvScroll=[0,1], speed (v/s).
   ANIMAL RIGS (G.userData.rig): quadrupeds {body, head, legFL, legFR, legBL, legBR, tail} (+ tail2 on crocodile, armL/armR on monkey);
     snake {body, head, seg:[7 nested pivots, rotate .y for S-motion], segRest:[rest yaw per seg]}; fish {body, tail};
     junglefowl {body, head, wingL, wingR, legL, legR, tail} + legFL/legBR=legL, legFR/legBL=legR aliases (trot phases);
     frog {body, head, legFL, legFR, legBL, legBR, tail(empty)}; butterfly {body, wingL, wingR} (rotation.z flaps; wingL is -X).
     G.userData: len (nose→tail), h (height), r (radius).
*/
function SBmodels3Init(){const M=window.SBM;if(!M||M.v3)return;M.v3=1;
  const K=(typeof K3!=='undefined')?K3:window.K3,T=K.T,PI=Math.PI,TAU=PI*2,DS=T.DoubleSide;
  /* ---------------- deterministic canvas textures (white base, tinted by vertex colours) ---------------- */
  const LCG=s=>{s=(s|0)||1;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};};
  const cvs=(w,h,draw)=>{const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d');draw(c,w,h);const t=new T.CanvasTexture(cv);t.wrapS=t.wrapT=T.RepeatWrapping;t.encoding=T.sRGBEncoding;t.anisotropy=4;return t;};
  const TX={
    // bamboo culm: one internode per tile in v (node ring at v=0), streaks along v
    bamboo:cvs(32,128,(c,w,h)=>{const R=LCG(11);c.fillStyle='#f2f2ee';c.fillRect(0,0,w,h);for(let i=0;i<40;i++){c.fillStyle=R()<.5?'rgba(60,50,30,.10)':'rgba(255,255,240,.18)';c.fillRect(R()*w,0,0.6+R()*1.4,h);}
      c.fillStyle='rgba(40,30,15,.55)';c.fillRect(0,h-3,w,3);c.fillStyle='rgba(255,250,225,.55)';c.fillRect(0,0,w,2);c.fillStyle='rgba(60,45,20,.25)';c.fillRect(0,2,w,3);
      for(let i=0;i<5;i++){c.fillStyle='rgba(70,60,40,.12)';c.fillRect(0,h*0.2+R()*h*0.6,w,1);}}),
    // straw strands along v, course shadow every 32 px
    thatch:cvs(128,128,(c,w,h)=>{const R=LCG(23);c.fillStyle='#e9e6dc';c.fillRect(0,0,w,h);c.lineWidth=1;
      for(let i=0;i<900;i++){const x=R()*w,y=R()*h,l=6+R()*18;c.strokeStyle=R()<.5?'rgba(70,55,30,'+(0.18+R()*0.25)+')':'rgba(255,252,235,'+(0.2+R()*0.3)+')';c.beginPath();c.moveTo(x,y);c.lineTo(x+(R()-.5)*3,y+l);c.stroke();}
      for(let y=0;y<h;y+=32){const g=c.createLinearGradient(0,y,0,y+10);g.addColorStop(0,'rgba(40,30,15,.45)');g.addColorStop(1,'rgba(40,30,15,0)');c.fillStyle=g;c.fillRect(0,y,w,10);}}),
    // rough timber: grain along v, cracks, knots
    wood:cvs(64,128,(c,w,h)=>{const R=LCG(37);c.fillStyle='#ecebe6';c.fillRect(0,0,w,h);c.lineWidth=1;
      for(let i=0;i<46;i++){const x=R()*w;c.strokeStyle=R()<.6?'rgba(60,40,25,'+(0.1+R()*0.18)+')':'rgba(255,250,240,.18)';c.beginPath();c.moveTo(x,0);c.bezierCurveTo(x+(R()-.5)*6,h*.33,x+(R()-.5)*6,h*.66,x,h);c.stroke();}
      for(let i=0;i<4;i++){const x=R()*w,y=R()*h;c.fillStyle='rgba(50,32,20,.5)';c.beginPath();c.ellipse(x,y,1.6+R()*1.5,3+R()*3,0,0,7);c.fill();}
      for(let i=0;i<3;i++){const x=R()*w,y=R()*h;c.fillStyle='rgba(30,20,12,.55)';c.fillRect(x,y,0.9,10+R()*30);}}),
    // daub: lumpy mud with straw flecks
    mud:cvs(128,128,(c,w,h)=>{const R=LCG(53);c.fillStyle='#ecebe7';c.fillRect(0,0,w,h);
      for(let i=0;i<260;i++){c.fillStyle=R()<.5?'rgba(70,50,30,'+(0.05+R()*0.1)+')':'rgba(255,250,240,'+(0.06+R()*0.12)+')';c.beginPath();c.ellipse(R()*w,R()*h,2+R()*9,2+R()*7,R()*3,0,7);c.fill();}
      c.lineWidth=1;for(let i=0;i<140;i++){const x=R()*w,y=R()*h,a=R()*TAU,l=3+R()*7;c.strokeStyle='rgba(250,225,150,'+(0.35+R()*0.3)+')';c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);c.stroke();}
      for(let i=0;i<10;i++){let x=R()*w,y=R()*h;c.strokeStyle='rgba(40,28,18,.35)';c.beginPath();c.moveTo(x,y);for(let k=0;k<4;k++){x+=(R()-.5)*14;y+=(R()-.5)*14;c.lineTo(x,y);}c.stroke();}}),
    // sedimentary rock: horizontal strata (along u), speckle, fractures
    rock:cvs(128,128,(c,w,h)=>{const R=LCG(71);c.fillStyle='#efede8';c.fillRect(0,0,w,h);
      for(let y=0;y<h;){const t=14+R()*30;c.fillStyle=R()<.5?'rgba(60,50,40,'+(0.03+R()*0.08)+')':'rgba(255,250,240,'+(0.04+R()*0.1)+')';c.fillRect(0,y,w,t);c.fillStyle='rgba(40,34,28,.16)';for(let x=0;x<w;x+=4)c.fillRect(x,y+t-1+Math.round((R()-.5)*2),4,1);y+=t;}
      for(let i=0;i<60;i++){c.fillStyle=R()<.5?'rgba(50,44,36,'+(0.05+R()*0.08)+')':'rgba(255,252,245,'+(0.05+R()*0.1)+')';c.beginPath();c.ellipse(R()*w,R()*h,4+R()*16,3+R()*10,R()*3,0,7);c.fill();}
      for(let i=0;i<500;i++){c.fillStyle=R()<.5?'rgba(40,35,30,.12)':'rgba(255,255,250,.14)';c.fillRect(R()*w,R()*h,1+R()*2,1+R()*2);}
      c.lineWidth=1;for(let i=0;i<8;i++){let x=R()*w,y=R()*h;c.strokeStyle='rgba(30,26,22,.35)';c.beginPath();c.moveTo(x,y);for(let k=0;k<3;k++){x+=(R()-.5)*8;y+=4+R()*10;c.lineTo(x,y);}c.stroke();}}),
    // falling water streaks (scroll along v)
    water:cvs(64,128,(c,w,h)=>{const R=LCG(89);c.fillStyle='#c4d8e2';c.fillRect(0,0,w,h);
      for(let i=0;i<120;i++){const x=R()*w,y=R()*h,l=10+R()*50,wd=0.6+R()*2.4;c.fillStyle=R()<.65?'rgba(255,255,255,'+(0.25+R()*0.5)+')':'rgba(60,100,120,'+(0.15+R()*0.2)+')';for(const o of [0,-h])c.fillRect(x,y+o,wd,l);}})};
  // prehistoric cave paintings (ochre / charcoal / handprints) on a transparent canvas
  const artTex=()=>cvs(512,384,(c,w,h)=>{const R=LCG(97),s=w/40;c.clearRect(0,0,w,h);
    const OCH='rgba(150,52,28,',OC2='rgba(176,92,38,',CHR='rgba(28,22,20,';
    const blotch=(x,y,r,col,a)=>{for(let i=0;i<5;i++){c.fillStyle=col+(a*(0.5+R()*0.5))+')';c.beginPath();c.ellipse(x+(R()-.5)*r*.3,y+(R()-.5)*r*.3,r*(0.7+R()*.4),r*(0.6+R()*.4),R()*3,0,7);c.fill();}};
    // faint smeared ochre wash
    for(let i=0;i<7;i++)blotch(R()*w,R()*h,30+R()*50,OC2,0.08);
    // handprints (negative stencil: spray halo + bare hand, and positive prints)
    const hand=(x,y,sc,rot,neg)=>{c.save();c.translate(x,y);c.rotate(rot);c.scale(sc,sc);
      if(neg){for(let i=0;i<60;i++){const a=R()*TAU,r=24+R()*16;c.fillStyle=OCH+(0.05+R()*0.08)+')';c.beginPath();c.arc(Math.cos(a)*r*0.8,Math.sin(a)*r-6,6+R()*8,0,7);c.fill();}c.globalCompositeOperation='destination-out';}
      c.fillStyle=neg?'rgba(0,0,0,1)':OCH+'0.85)';c.beginPath();c.ellipse(0,4,11,13,0,0,7);c.fill();
      [[-11,-6,-0.7,13],[-6,-16,-0.2,16],[0,-19,0,18],[6,-17,0.15,16],[11,-11,0.35,12]].forEach(([fx,fy,a,l])=>{c.save();c.translate(fx,fy+8);c.rotate(a);c.beginPath();c.ellipse(0,-l/2+2,2.8,l/2,0,0,7);c.fill();c.restore();});
      c.restore();c.globalCompositeOperation='source-over';};
    hand(w*0.08,h*0.22,1.25,-0.25,true);hand(w*0.9,h*0.2,1.1,0.3,false);hand(w*0.83,h*0.33,0.95,0.1,true);hand(w*0.12,h*0.8,1.0,-0.4,false);
    // deer / buffalo (silhouettes with legs & antlers)
    const beast=(x,y,sc,dir,col,ant,horn)=>{c.save();c.translate(x,y);c.scale(sc*dir,sc);c.fillStyle=col+'0.9)';c.strokeStyle=col+'0.9)';c.lineCap='round';
      c.beginPath();c.moveTo(-30,0);c.bezierCurveTo(-28,-14,18,-16,26,-6);c.bezierCurveTo(30,4,22,10,8,9);c.bezierCurveTo(-8,12,-26,10,-30,0);c.fill();
      c.beginPath();c.moveTo(22,-6);c.lineTo(34,-22);c.lineTo(42,-20);c.lineTo(36,-12);c.lineTo(26,2);c.fill();
      c.lineWidth=3.2;[[-24,6,-28,30],[-16,8,-14,31],[12,7,16,31],[20,6,26,30]].forEach(([a,b,cc,d])=>{c.beginPath();c.moveTo(a,b);c.lineTo((a+cc)/2+2,(b+d)/2);c.lineTo(cc,d);c.stroke();});
      c.lineWidth=2;c.beginPath();c.moveTo(-30,-1);c.lineTo(-36,8);c.stroke();
      if(ant){c.lineWidth=2;[[34,-22,30,-40],[32,-30,24,-36],[37,-22,44,-40],[40,-31,48,-35]].forEach(([a,b,cc,d])=>{c.beginPath();c.moveTo(a,b);c.lineTo(cc,d);c.stroke();});}
      if(horn){c.lineWidth=3;c.beginPath();c.moveTo(34,-21);c.quadraticCurveTo(26,-36,40,-38);c.stroke();}
      c.restore();};
    beast(w*0.42,h*0.42,2.0,1,OCH,true,false);beast(w*0.7,h*0.6,1.5,-1,OCH,false,true);beast(w*0.25,h*0.62,1.15,1,OC2,true,false);beast(w*0.58,h*0.2,0.9,-1,CHR,false,false);
    // stick-figure hunters with spears and bows
    const hunter=(x,y,sc,dir,col,bow)=>{c.save();c.translate(x,y);c.scale(sc*dir,sc);c.strokeStyle=col+'0.92)';c.fillStyle=col+'0.92)';c.lineCap='round';c.lineWidth=3;
      c.beginPath();c.arc(0,-30,4,0,7);c.fill();c.beginPath();c.moveTo(0,-26);c.lineTo(-1,-8);c.lineTo(-8,8);c.moveTo(-1,-8);c.lineTo(7,7);c.moveTo(0,-22);c.lineTo(8,-16);c.lineTo(14,-22);c.moveTo(0,-22);c.lineTo(-7,-14);c.stroke();
      c.lineWidth=1.8;if(bow){c.beginPath();c.arc(14,-22,10,-1.2,1.2);c.stroke();c.beginPath();c.moveTo(14+10*Math.cos(1.2),-22+10*Math.sin(1.2));c.lineTo(14,-22);c.lineTo(14+10*Math.cos(1.2),-22-10*Math.sin(1.2));c.stroke();}
      else{c.beginPath();c.moveTo(-6,-6);c.lineTo(30,-40);c.stroke();c.beginPath();c.moveTo(30,-40);c.lineTo(26,-34);c.lineTo(33,-36);c.fill();}c.restore();};
    hunter(w*0.18,h*0.47,1.5,1,CHR,false);hunter(w*0.27,h*0.4,1.3,1,CHR,true);hunter(w*0.88,h*0.62,1.4,-1,OCH,false);hunter(w*0.78,h*0.78,1.1,-1,CHR,false);
    // dots, sun spiral, tally strokes
    c.strokeStyle=OCH+'0.85)';c.lineWidth=3;c.beginPath();for(let i=0;i<40;i++){const a=i*0.45,r=2+i*0.55;c.lineTo(w*0.62+Math.cos(a)*r,h*0.83+Math.sin(a)*r);}c.stroke();
    for(let i=0;i<9;i++){c.fillStyle=CHR+'0.85)';c.fillRect(w*0.36+i*7,h*0.84,3,16+R()*4);}
    for(let i=0;i<14;i++){c.fillStyle=OCH+'0.8)';c.beginPath();c.arc(w*0.47+i*9+(R()-.5)*3,h*0.08+(R()-.5)*6,3,0,7);c.fill();}
    // weathering: knock flecks out
    c.globalCompositeOperation='destination-out';for(let i=0;i<900;i++){c.fillStyle='rgba(0,0,0,'+(0.3+R()*0.6)+')';c.fillRect(R()*w,R()*h,1+R()*3,1+R()*3);}
    const fade=(x0,y0,x1,y1,rx,ry,rw,rh)=>{const gr=c.createLinearGradient(x0,y0,x1,y1);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gr;c.fillRect(rx,ry,rw,rh);};
    fade(0,0,40,0,0,0,40,h);fade(w,0,w-40,0,w-40,0,40,h);fade(0,0,0,40,0,0,w,40);fade(0,h,0,h-40,0,h-40,w,40);c.globalCompositeOperation='source-over';});
  /* ---------------- shared materials ---------------- */
  const vmat=(name,o)=>{const p={vertexColors:true,roughness:o.r??0.9,metalness:0,flatShading:o.flat!==false};if(o.map)p.map=o.map;if(o.ds)p.side=DS;
    if(o.tr){p.transparent=true;p.opacity=o.tr;p.depthWrite=false;}const m=new T.MeshStandardMaterial(p);m.name=name;m.userData.key=name;return m;};
  const MT={sb3Flat:vmat('sb3Flat',{r:.92}),sb3Gloss:vmat('sb3Gloss',{r:.38}),sb3DS:vmat('sb3DS',{r:.85,ds:1}),
    sb3Wood:vmat('sb3Wood',{r:.9,map:TX.wood}),sb3Bamboo:vmat('sb3Bamboo',{r:.62,map:TX.bamboo}),sb3Thatch:vmat('sb3Thatch',{r:1,map:TX.thatch}),
    sb3Mud:vmat('sb3Mud',{r:.97,map:TX.mud}),sb3Rock:vmat('sb3Rock',{r:.94,map:TX.rock}),
    sb3Water:vmat('sb3Water',{r:.15,map:TX.water,tr:0.75,ds:1,flat:false})};
  {const a=new T.MeshStandardMaterial({map:artTex(),transparent:true,alphaTest:0.04,roughness:0.95,metalness:0,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,depthWrite:false});a.name=a.userData.key='sb3Art';MT.sb3Art=a;}
  M.mat3=MT;
  /* ---------------- maths / colour helpers ---------------- */
  const RNG=s=>{let a=(((Math.abs(+s||0)*1000)|0)+1)*2654435761>>>0;return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};};
  const hsh=(a,b,c,d)=>{let h=(Math.imul(a|0,0x27d4eb2d)^Math.imul(b|0,0x165667b1)^Math.imul(c|0,0x5bd1e995)^Math.imul((d|0)+7,0x85ebca77))>>>0;h=Math.imul(h^(h>>>15),0x2c1b3c6d);h=Math.imul(h^(h>>>12),0x297a2d39);return ((h^(h>>>15))>>>0)/4294967296;};
  const sm=t=>t*t*(3-2*t),cl=t=>t<0?0:t>1?1:t,ss=(a,b,x)=>sm(cl((x-a)/(b-a)));
  const vn3=(x,y,z,s)=>{const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),fx=sm(x-xi),fy=sm(y-yi),fz=sm(z-zi);let r=0;
    for(let k=0;k<8;k++){const dx=k&1,dy=(k>>1)&1,dz=(k>>2)&1;r+=hsh(xi+dx,yi+dy,zi+dz,s)*(dx?fx:1-fx)*(dy?fy:1-fy)*(dz?fz:1-fz);}return r;};
  const CCH={},C=h=>{if(CCH[h])return CCH[h];const c=new T.Color(h);return CCH[h]=[c.r,c.g,c.b];};
  const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],mul=(a,f)=>[a[0]*f,a[1]*f,a[2]*f];
  const add3=(a,b,k)=>{k=k===undefined?1:k;return [a[0]+b[0]*k,a[1]+b[1]*k,a[2]+b[2]*k];},sub3=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
  const len3=a=>Math.hypot(a[0],a[1],a[2]),nrm3=a=>{const l=len3(a)||1;return [a[0]/l,a[1]/l,a[2]/l];},crs=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const lerp3=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
  const fnorm=(a,b,c)=>nrm3(crs(sub3(b,a),sub3(c,a)));
  const jc=(c,s,amt)=>{const k=1+(hsh(s|0,3,5,9)-.5)*amt;return [c[0]*k,c[1]*k,c[2]*k];};
  const g=(...c)=>K.group(...c),V=(x,y,z)=>new T.Vector3(x,y,z);
  const pivot=(x,y,z,name)=>{const P=new T.Group();P.position.set(x,y,z);if(name)P.name=name;return P;};
  /* ---------------- vertex-coloured triangle soup (optional per-vertex UVs) ---------------- */
  // cf(p, faceNormal) → linear rgb; B.face=true colours whole faces from the centroid (crisp facets)
  function VB(cf){this.p=[];this.c=[];this.u=[];this.hasUV=false;this.cf=cf||(()=>[1,1,1]);this.face=false;}
  VB.prototype.t=function(a,b,c,ua,ub,uc){const n=fnorm(a,b,c);this.p.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);
    if(this.face){const k=this.cf([(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3],n);for(let i=0;i<3;i++)this.c.push(k[0],k[1],k[2]);}
    else for(const v of [a,b,c]){const k=this.cf(v,n);this.c.push(k[0],k[1],k[2]);}
    if(ua){this.hasUV=true;this.u.push(ua[0],ua[1],ub[0],ub[1],uc[0],uc[1]);}else this.u.push(0,0,0,0,0,0);return this;};
  // oriented triangle: normal pointing away from r (towards r if inw)
  VB.prototype.o=function(a,b,c,r,inw,ua,ub,uc){const n=crs(sub3(b,a),sub3(c,a)),m=[(a[0]+b[0]+c[0])/3-r[0],(a[1]+b[1]+c[1])/3-r[1],(a[2]+b[2]+c[2])/3-r[2]];
    return ((dot(n,m)>=0)!==!!inw)?this.t(a,b,c,ua,ub,uc):this.t(a,c,b,ua,uc,ub);};
  VB.prototype.q=function(a,b,c,d,r,inw,ua,ub,uc,ud){this.o(a,b,c,r,inw,ua,ub,uc);return this.o(a,c,d,r,inw,ua,uc,ud);};
  VB.prototype.n=function(){return this.p.length/9;};
  // world-projected UVs (as K3.mesh) for triangles that did not get explicit UVs
  const projUV=(pos,uv,S,done)=>{for(let i=0;i<pos.length/9;i++){if(done&&done[i])continue;const o=i*9,a=[pos[o],pos[o+1],pos[o+2]],b=[pos[o+3],pos[o+4],pos[o+5]],c=[pos[o+6],pos[o+7],pos[o+8]],n=crs(sub3(c,b),sub3(a,b)),ax=Math.abs(n[0]),ay=Math.abs(n[1]),az=Math.abs(n[2]);
      for(let k=0;k<3;k++){const x=pos[o+k*3],y=pos[o+k*3+1],z=pos[o+k*3+2];let u,v;if(ay>=ax&&ay>=az){u=x;v=z;}else if(ax>=az){u=z;v=y;}else{u=x;v=y;}uv[i*6+k*2]=u/S;uv[i*6+k*2+1]=v/S;}}};
  VB.prototype.mesh=function(m,o){o=o||{};const ge=new T.BufferGeometry();ge.setAttribute('position',new T.Float32BufferAttribute(this.p,3));ge.setAttribute('color',new T.Float32BufferAttribute(this.c,3));
    const mat=MT[m]||m;if(mat.map){const uv=new Float32Array(this.u);if(!this.hasUV||o.proj)projUV(this.p,uv,o.uv||24);else if(this.uvMask)projUV(this.p,uv,o.uv||24,this.uvMask);ge.setAttribute('uv',new T.BufferAttribute(uv,2));}
    ge.computeVertexNormals();const ms=new T.Mesh(ge,mat);ms.name=MT[m]?m:'';ms.castShadow=!o.noShadow;ms.receiveShadow=true;return K.at(ms,o);};
  /* ---------------- shape builders ---------------- */
  // loft along polyline P; r[i] = number | [w,h] | [w,h,ridge] (ridge narrows the top: 0..1); n sides; o:{cap0,cap1 (true|point), side, rot, uvS (du per v), jit, seed}
  // returns frames for decals: [{c,s,u,w,h,k}]
  function loft(B,P,r,n,o){o=o||{};const L=P.length,rings=[],F=[];let sd0=o.side||null;
    for(let i=0;i<L;i++){const p=P[i],d=nrm3(sub3(P[Math.min(L-1,i+1)],P[Math.max(0,i-1)]));let sd=o.side?o.side:crs([0,1,0],d);if(len3(sd)<0.2)sd=sd0||[1,0,0];sd=nrm3(sd);if(sd0&&dot(sd,sd0)<0)sd=mul(sd,-1);
      const up=nrm3(crs(d,sd));sd=crs(up,d);sd0=sd;const ri=r[i],w=Array.isArray(ri)?ri[0]:ri,h=Array.isArray(ri)?ri[1]:ri,k=Array.isArray(ri)&&ri[2]||0,ring=[];
      for(let j=0;j<n;j++){const t=j/n*TAU+(o.rot===undefined?PI/2:o.rot),st=Math.sin(t),f=o.jit?1+(hsh(i,j,o.seed||1,11)-.5)*o.jit:1,ww=w*(1-k*Math.max(0,st)*Math.max(0,st))*f;
        ring.push([p[0]+sd[0]*Math.cos(t)*ww+up[0]*st*h*f,p[1]+sd[1]*Math.cos(t)*ww+up[1]*st*h*f,p[2]+sd[2]*Math.cos(t)*ww+up[2]*st*h*f]);}
      rings.push(ring);F.push({c:p,s:sd,u:up,w,h,k});}
    let vv=[0];for(let i=1;i<L;i++)vv.push(vv[i-1]+len3(sub3(P[i],P[i-1])));
    const uvS=o.uvS;for(let i=0;i<L-1;i++){const A=rings[i],Bq=rings[i+1],ref=lerp3(P[i],P[i+1],0.5);for(let j=0;j<n;j++){const j1=(j+1)%n;
        if(uvS){const u0=j/n,u1=(j+1)/n,v0=vv[i]/uvS,v1=vv[i+1]/uvS;B.q(A[j],A[j1],Bq[j1],Bq[j],ref,false,[u0,v0],[u1,v0],[u1,v1],[u0,v1]);}else B.q(A[j],A[j1],Bq[j1],Bq[j],ref);}}
    const cap=(idx,tip,ref)=>{const A=rings[idx];for(let j=0;j<n;j++){if(uvS){const a=j/n*TAU,b=(j+1)/n*TAU;B.o(A[j],A[(j+1)%n],tip,ref,false,[0.5+Math.cos(a)*.1,0.5+Math.sin(a)*.1],[0.5+Math.cos(b)*.1,0.5+Math.sin(b)*.1],[0.5,0.5]);}else B.o(A[j],A[(j+1)%n],tip,ref);}};
    if(o.cap1){const tp=Array.isArray(o.cap1)?o.cap1:P[L-1];cap(L-1,tp,L>1?lerp3(P[L-1],P[L-2],0.6):P[0]);}
    if(o.cap0){const tp=Array.isArray(o.cap0)?o.cap0:P[0];cap(0,tp,L>1?lerp3(P[0],P[1],0.6):P[0]);}
    return F;}
  // surface point of a loft at fractional ring s and angle th (radians, PI/2 = top, 0 = +side), lifted by off
  const surf=(F,s,th,off)=>{const i=Math.max(0,Math.min(F.length-2,Math.floor(s))),f=cl(s-i),A=F[i],Bf=F[i+1],c=lerp3(A.c,Bf.c,f),sd=nrm3(lerp3(A.s,Bf.s,f)),up=nrm3(lerp3(A.u,Bf.u,f)),
      w0=A.w+(Bf.w-A.w)*f,h=A.h+(Bf.h-A.h)*f,k=A.k+(Bf.k-A.k)*f,st=Math.sin(th),w=w0*(1-k*Math.max(0,st)*Math.max(0,st)),ct=Math.cos(th),nn=nrm3(add3(mul(sd,ct*h),up,st*w));
    return add3(add3(add3(c,sd,ct*w),up,st*h),nn,off||0.08);};
  // painted band on a loft: from (s0,th0) to (s1,th1), half-width hw (in ring units), tapering; m segments
  function band(B,F,s0,th0,s1,th1,hw,m,wig,seed){const P=[];for(let i=0;i<=m;i++){const t=i/m,s=s0+(s1-s0)*t+(wig?Math.sin(t*PI*2+seed)*wig:0),th=th0+(th1-th0)*t,w=hw*(1-0.85*Math.pow(t,1.4))*(i===0?0.6:1);P.push([surf(F,s-w,th),surf(F,s+w,th)]);}
    const ref=surf(F,(s0+s1)/2,(th0+th1)/2,-3);for(let i=0;i<m;i++){if(i===m-1)B.o(P[i][0],P[i][1],surf(F,s1,th1),ref);else B.q(P[i][0],P[i][1],P[i+1][1],P[i+1][0],ref);}}
  // jittered icosahedron blob into B
  function blob(B,c,r,s,seed,amt,det){let ge=new T.IcosahedronGeometry(r,det||0);ge=ge.index?ge.toNonIndexed():ge;const p=ge.attributes.position,R=RNG(seed),mp={};
    const key=i=>Math.round(p.getX(i)*100)+'_'+Math.round(p.getY(i)*100)+'_'+Math.round(p.getZ(i)*100);
    for(let i=0;i<p.count;i++){const k=key(i);if(!mp[k])mp[k]=1+(R()-.5)*(amt===undefined?0.3:amt);}
    const pt=i=>{const f=mp[key(i)];return [c[0]+p.getX(i)*f*s[0],c[1]+p.getY(i)*f*s[1],c[2]+p.getZ(i)*f*s[2]];};
    for(let i=0;i<p.count;i+=3)B.t(pt(i),pt(i+1),pt(i+2));ge.dispose();return B;}
  // octahedron (8 tris) / tetra-ish eye
  const octa=(B,c,r,s)=>{s=s||[1,1,1];const X=[[r*s[0],0,0],[-r*s[0],0,0]],Y=[[0,r*s[1],0],[0,-r*s[1],0]],Z=[[0,0,r*s[2]],[0,0,-r*s[2]]];
    for(const x of X)for(const y of Y)for(const z of Z)B.o(add3(c,x),add3(c,y),add3(c,z),c);return B;};
  // cone from base centre b (radius r) to apex a; n sides; base cap optional
  function spike(B,b,a,r,n,cap,rot,fl){const d=nrm3(sub3(a,b));let u=nrm3(crs(Math.abs(d[1])<0.9?[0,1,0]:[1,0,0],d));const v=crs(d,u),rim=[];
    for(let j=0;j<n;j++){const t=j/n*TAU+(rot||0);rim.push(add3(add3(b,u,Math.cos(t)*r),v,Math.sin(t)*r*(fl||1)));}
    for(let j=0;j<n;j++){B.o(rim[j],rim[(j+1)%n],a,b);if(cap)B.o(rim[j],rim[(j+1)%n],b,a);}return B;}
  // flat leaf / fin polygon (fan from first point), double sided material
  const fan=(B,pts)=>{for(let i=1;i<pts.length-1;i++)B.t(pts[0],pts[i],pts[i+1]);return B;};
  // axis-aligned-ish box from 8 corners helper: centre c, half sizes, optional yaw
  function box(B,c,hx,hy,hz,ry,uvS){const cs=Math.cos(ry||0),sn=Math.sin(ry||0),P=(x,y,z)=>[c[0]+x*cs+z*sn,c[1]+y,c[2]-x*sn+z*cs];
    const v=[P(-hx,-hy,-hz),P(hx,-hy,-hz),P(hx,hy,-hz),P(-hx,hy,-hz),P(-hx,-hy,hz),P(hx,-hy,hz),P(hx,hy,hz),P(-hx,hy,hz)];
    [[0,1,2,3],[5,4,7,6],[4,0,3,7],[1,5,6,2],[3,2,6,7],[4,5,1,0]].forEach(f=>B.q(v[f[0]],v[f[1]],v[f[2]],v[f[3]],c));return B;}
  // lathe (profile [[r,y],...]) around Y at centre c, n sides; o:{cap0,cap1,inner}
  function lathe(B,c,prof,n,o){o=o||{};const R=prof.map(([r,y])=>{const ring=[];for(let j=0;j<n;j++){const t=j/n*TAU+(o.rot||0);ring.push([c[0]+Math.cos(t)*r,c[1]+y,c[2]-Math.sin(t)*r]);}return ring;});
    for(let i=0;i<prof.length-1;i++){const ry=c[1]+(prof[i][1]+prof[i+1][1])/2,inw=o.inner!==undefined&&i>=o.inner;for(let j=0;j<n;j++){const j1=(j+1)%n;
        // orientation: away from axis (or towards it for inner wall rings)
        const ref=[c[0],ry,c[2]];B.q(R[i][j],R[i][j1],R[i+1][j1],R[i+1][j],ref,inw);}}
    if(o.cap0)for(let j=0;j<n;j++)B.o(R[0][j],R[0][(j+1)%n],[c[0],c[1]+prof[0][1],c[2]],[c[0],c[1]+prof[0][1]+5,c[2]]);
    if(o.cap1){const L=prof.length-1,y=c[1]+prof[L][1]+(o.cap1===true?0:o.cap1);for(let j=0;j<n;j++)B.o(R[L][j],R[L][(j+1)%n],[c[0],y,c[2]],[c[0],y-5,c[2]]);}return R;}
  // thin cord / line ribbon (two crossed quads) along polyline
  function cord(B,P,w){for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],d=nrm3(sub3(b,a));let s1=nrm3(crs(d,Math.abs(d[1])<0.9?[0,1,0]:[1,0,0]));const s2=nrm3(crs(d,s1));
      for(const s of [s1,s2])B.t(add3(a,s,-w),add3(a,s,w),add3(b,s,w)).t(add3(a,s,-w),add3(b,s,w),add3(b,s,-w));}return B;}
  const trisOf=o=>{let n=0;o.traverse(m=>{if(m.isMesh){const ge=m.geometry;n+=(ge.index?ge.index.count:ge.attributes.position.count)/3;}});return Math.round(n);};
  M.tris3=trisOf;
  const extra3=[];const reg=(key,fn)=>{M[key]=fn;extra3.push(key);};
  const bbox=(G)=>{G.updateMatrixWorld(true);const b=new T.Box3(),v=V(0,0,0);G.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)b.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});return b;};
  // linear-rgb colour function factories
  const solid=c=>()=>c;
  const shadeY=(top,bot,y0,y1)=>(p)=>mix(bot,top,ss(y0,y1,p[1]));

  /* ======================================== A. ANIMALS (rigged) ======================================== */
  // lift every root child so the lowest vertex sits on y=0 (feet), keeps pivots consistent
  const settle=(G)=>{const b=bbox(G);G.children.forEach(c=>{c.position.y-=b.min.y;});const b2=bbox(G);G.userData.h=+b2.max.y.toFixed(1);G.userData.len=+(b2.max.z-b2.min.z).toFixed(1);
    G.userData.r=+(Math.max(b2.max.x-b2.min.x,b2.max.z-b2.min.z)/2).toFixed(1);return G;};
  const nearest=(P,p)=>{let bi=0,bd=1e9;P.forEach((q,i)=>{const d=len3(sub3(p,q));if(d<bd){bd=d;bi=i;}});return bi;};
  const eyesOn=(B,F,s,th,r,sq)=>{[th,PI-th].forEach(t=>{const p=surf(F,s,t,-r*0.35);octa(B,p,r,sq||[0.8,1,0.9]);});};
  const legLoft=(P,r,col,n,cap,face,d)=>{const B=new VB(col);B.face=!!face;const r0=Array.isArray(r[0])?Math.max(r[0][0],r[0][1]):r[0];const F=loft(B,P,r,n||5,{cap1:cap,cap0:add3(P[0],[-(d||0)*r0*0.7,r0*0.3,0])});return {B,F};};
  const quadRig=(G,body,head,tail,legs)=>{G.userData.rig=Object.assign({body,head,tail},legs);return G;};
  function mkLegs(G,spec){const out={};['legFL','legFR','legBL','legBR'].forEach(k=>{const f=k[3]==='F',d=k[4]==='L'?-1:1,s=f?spec.f:spec.b,P=pivot(d*s.x,s.y,s.z,k),
      pts=s.P.map(p=>[p[0]*d,p[1],p[2]]),cap=s.cap?[s.cap[0]*d,s.cap[1],s.cap[2]]:true,{B,F}=legLoft(pts,s.r,spec.col(f,d),s.n||5,cap,spec.face,d);if(spec.deco)spec.deco(B,F,f,d);P.add(B.mesh(spec.mat||'sb3Flat'));G.add(P);out[k]=P;});return out;}

  /* ---- tiger (hổ) ---- */
  const TG={or:C('#c4651f'),or2:C('#de8d3e'),wh:C('#ece5d4'),bk:C('#1a120d'),nose:C('#9a5a52'),eye:C('#c99a2a')};
  function tiger(){const G=g(),body=pivot(0,13,0,'body');G.add(body);
    const fur=(p,n)=>{const v=(vn3(p[0]*.35,p[1]*.35,p[2]*.35,5)-.5)*0.35;let c=mix(TG.or,TG.or2,cl(0.25+v+ss(1,-4,p[1])*0.5));return mix(c,TG.wh,ss(-0.35,-0.75,n[1]));};
    const B=new VB(fur);
    const F=loft(B,[[0,0.6,-14],[0,1.0,-12.3],[0,1.2,-9],[0,0.6,-5],[0,0.2,-1],[0,0.7,3],[0,1.5,7],[0,1.8,10],[0,2.4,12.3]],
      [[1.6,1.8],[3.6,4.2],[4.5,5.1],[4.1,4.8],[3.9,4.6],[4.4,5.3],[4.8,5.9],[4.3,5.4],[3.1,4.0]],10,{cap0:[0,0.8,-14.7],cap1:[0,2.6,13.2]});
    // chest bib
    B.cf=(p,n)=>mix(TG.wh,TG.or2,ss(2,4,p[1]));
    B.cf=solid(TG.bk);const R=RNG(17);
    for(let k=0;k<11;k++){const s=1.3+k*0.46+(R()-.5)*0.08,hw=0.075+R()*0.04,len=0.15+R()*0.4,sl=-0.12-R()*0.1;
      band(B,F,s,PI/2-0.04,s+sl,-len,hw,3,0.05,k);band(B,F,s+0.02,PI/2+0.04,s+sl+0.02,PI+len,hw,3,0.05,k+3);}
    body.add(B.mesh('sb3Flat'));
    // head
    const head=pivot(0,4.4,12.2,'head');body.add(head);
    const HB=new VB((p,n)=>{let c=mix(TG.or,TG.or2,ss(2,0,p[1])*0.6);const cheek=ss(2.6,3.6,Math.abs(p[0]))*ss(1.8,3.6,p[2])*ss(1.2,0,p[1]);const muzz=ss(5.8,6.8,p[2])*ss(-0.2,-1.0,p[1]);
      c=mix(c,TG.wh,cl(Math.max(cheek,muzz,ss(-0.1,-0.55,n[1]))));if(p[2]>4.2&&p[2]<5.8&&p[1]>1.4&&Math.abs(p[0])>0.6&&Math.abs(p[0])<2.0)c=mix(c,TG.wh,0.6);return c;});
    const HP=[[0,-2.6,-3.4],[0,-0.6,-0.2],[0,0.5,2.4],[0,0.6,4.6],[0,-0.1,6.6],[0,-0.7,7.9]];
    const FH=loft(HB,HP,[[3,3.6],[3.4,3.5],[3.9,3.5],[3.3,3.0],[2.2,2.0],[1.7,1.45]],8,{cap1:[0,-0.95,8.6]});
    HB.cf=solid(TG.bk);[[2.15,0.18,0.55],[2.6,0.12,0.9]].forEach(([s,a,b],i)=>{band(HB,FH,s,PI/2-a,s+0.15,PI/2-b,0.07,2,0,i);band(HB,FH,s,PI/2+a,s+0.15,PI/2+b,0.07,2,0,i);});
    // ears: rounded wedges, black backs
    [-1,1].forEach(d=>{const b=surf(FH,1.75,PI/2-d*0.62,-0.2),f=surf(FH,2.15,PI/2-d*0.6,-0.2),tp=add3(lerp3(b,f,0.5),[d*0.9,2.0,-0.5]),m=add3(lerp3(b,tp,0.5),[d*0.5,0,0.5]);
      HB.cf=solid(TG.bk);HB.o(b,tp,m,add3(lerp3(b,f,0.5),[0,-1,0.6]));HB.cf=solid(TG.or2);HB.o(f,m,tp,add3(lerp3(b,f,0.5),[0,-1,-1]));HB.o(b,f,m,add3(lerp3(b,f,0.5),[0,-2,0]));HB.cf=solid(TG.wh);HB.o(b,f,tp,add3(lerp3(b,f,0.5),[0,-2,0]));});
    head.add(HB.mesh('sb3Flat'));
    const EB=new VB(solid(TG.eye));eyesOn(EB,FH,3.25,PI/2-0.62,0.42);EB.cf=solid(TG.nose);octa(EB,surf(FH,4.9,PI/2,-0.25),0.55,[1.1,0.6,0.8]);EB.cf=solid(TG.bk);
    [-1,1].forEach(d=>octa(EB,surf(FH,4.4,d>0?0.05:PI-0.05,-0.15),0.3,[0.6,0.4,1.6]));head.add(EB.mesh('sb3Gloss'));
    // tail: ringed, black tip
    const tail=pivot(0,1.8,-13.6,'tail');body.add(tail);const TP=[[0,0,0.6],[0,-1.6,-2.6],[0,-5.6,-5.6],[0,-9.8,-7.6],[0,-12.3,-10.2],[0,-12,-13.2]];
    const TB=new VB((p)=>{const i=nearest(TP,p),q=TP[i],t=i+(len3(sub3(p,q))>0?0:0);return i===5||i===3||(i===2&&p[1]<-4)||(i===4&&p[2]<-9.6)?TG.bk:mix(TG.or,TG.or2,0.4);});TB.face=true;
    loft(TB,TP,[1.3,1.12,0.98,0.88,0.8,0.74],5,{cap1:[0,-11.4,-14.4]});tail.add(TB.mesh('sb3Flat'));
    const legs=mkLegs(G,{col:(f,d)=>(p,n)=>mix(mix(TG.or,TG.or2,0.45),TG.wh,cl(ss(-0.3,-0.8,n[1])+ss(-12.2,-13.4,p[1])*0.7+ss(0.5,0.9,-n[0]*d)*0.8*ss(-3,-7,p[1]))),
      f:{x:2.5,y:14.6,z:7.6,P:[[0,2.0,0],[0,-5.5,0.6],[0,-10.5,0.1],[0,-13.2,0.5],[0,-14,1.6]],r:[[2.4,3.2],[1.7,2.1],[1.15,1.35],[1.3,1.5],[1.4,1.15]],cap:[0,-14.15,2.6]},
      b:{x:2.6,y:14,z:-9.6,P:[[0,2.2,0],[0,-5.4,1.7],[0,-10,-2.4],[0,-13.2,-1.4],[0,-14,-0.2]],r:[[2.3,3.9],[2.0,2.5],[1.1,1.45],[1.2,1.35],[1.35,1.15]],cap:[0,-14.15,0.8]}});
    quadRig(G,body,head,tail,legs);return settle(G);}

  /* ---- gaur (bò tót) ---- */
  const GR={bk:C('#2a1e17'),bk2:C('#3a2a1e'),tan:C('#9c8e70'),sock:C('#e4ddc6'),hoof:C('#171311'),horn:C('#b7ab72'),hornT:C('#1e1a16'),muz:C('#6d675c')};
  function gaur(){const G=g(),body=pivot(0,24,0,'body');G.add(body);
    const B=new VB((p,n)=>mix(GR.bk,GR.bk2,cl((vn3(p[0]*.12,p[1]*.12,p[2]*.12,3)-.3)*1.2+ss(0,-0.8,n[1])*0.3)));
    loft(B,[[0,1.4,-22],[0,1.6,-17],[0,0.8,-10],[0,0.6,-2],[0,2.4,5],[0,2.8,11],[0,1.0,16],[0,0.2,19.6]],
      [[5.4,7.4],[7.6,9.2],[8.2,9.6],[8.4,10],[8.2,11.2,0.38],[7.4,11.4,0.42],[6.2,9.6,0.25],[4.8,7.2]],9,{cap0:[0,1.6,-24],cap1:[0,0.6,20.6]});
    // dewlap under the brisket
    body.add(B.mesh('sb3Flat'));
    const head=pivot(0,2.2,18.6,'head');body.add(head);
    const HP=[[0,0,-4],[0,-0.6,1],[0,-1.6,4.8],[0,-3.4,8.2],[0,-5.8,11.0],[0,-7.3,12.6]];
    const HB=new VB((p,n)=>{let c=GR.bk;const fore=ss(3.4,4.4,p[2])*ss(8.6,7.4,p[2])*ss(0.2,0.6,n[1]+n[2]*0.5)*ss(1.6,0.6,Math.abs(p[0]));if(fore>0)c=mix(c,GR.tan,fore*0.95);
      return mix(c,GR.muz,ss(10.6,11.8,p[2])*ss(0.6,0.95,n[2]+0.3));});
    const FH=loft(HB,HP,[[4.8,6.6],[4.3,5.6],[3.9,4.3],[3.4,3.4],[2.8,2.6],[2.5,2.0]],8,{cap1:[0,-8.2,13.4]});
    // ears (broad, sideways)
    [-1,1].forEach(d=>{const b=surf(FH,1.55,d>0?0.35:PI-0.35,-0.2),a=add3(b,[d*4.6,-1.4,-0.6]),c1=add3(b,[d*2.6,0.7,-1.0]),c2=add3(b,[d*2.6,-2.0,0.4]);HB.cf=solid(GR.bk2);
      HB.o(b,c1,a,add3(b,[0,-1,1]));HB.o(b,a,c2,add3(b,[0,1,1]));HB.cf=solid(GR.tan);HB.o(b,a,c1,add3(b,[0,1,-1]));HB.o(b,c2,a,add3(b,[0,-1,-1]));});
    head.add(HB.mesh('sb3Flat'));
    // horns: out, up, curving in & forward
    const HN=new VB((p)=>mix(GR.horn,GR.hornT,ss(6.5,8.6,p[1])));
    [-1,1].forEach(d=>{const r0=surf(FH,1.9,PI/2-d*0.62,-0.5);const P=[r0,add3(r0,[d*2.8,0.6,-0.4]),add3(r0,[d*5.0,2.4,0.2]),add3(r0,[d*5.3,5.2,1.4]),add3(r0,[d*4.0,7.2,2.6])];
      loft(HN,P,[1.25,1.05,0.8,0.5,0.25],5,{cap1:add3(r0,[d*3.2,7.8,3.0])});});
    const EB=new VB(solid(C('#100c0a')));eyesOn(EB,FH,3.0,PI/2-0.95,0.45);
    EB.cf=solid(C('#2a2522'));[-1,1].forEach(d=>octa(EB,surf(FH,4.85,PI/2-d*0.5,-0.2),0.45,[1,0.8,0.6]));
    head.add(HN.mesh('sb3Gloss'),EB.mesh('sb3Gloss'));
    const tail=pivot(0,3,-23.4,'tail');body.add(tail);const TB=new VB(solid(GR.bk));
    loft(TB,[[0,0,0.5],[0,-3,-1.2],[0,-9,-1.9],[0,-14.5,-1.7]],[0.9,0.65,0.5,0.45],4);TB.cf=solid(C('#141010'));spike(TB,[0,-14,-1.7],[0,-17.6,-1.5],0.7,4,true);tail.add(TB.mesh('sb3Flat'));
    const legs=mkLegs(G,{face:1,col:()=>(p,n)=>p[1]<-20.9?GR.hoof:p[1]<-14?GR.sock:mix(GR.bk,GR.bk2,0.4),
      f:{x:4.8,y:22,z:12,P:[[0,1.5,0],[0,-8,0.6],[0,-15.5,0.2],[0,-19.6,0.6],[0,-21.5,1.2]],r:[[3.4,4.6],[2.3,2.8],[1.45,1.7],[1.5,1.8],[1.75,2.0]],cap:[0,-22,1.7]},
      b:{x:4.8,y:22.5,z:-17,P:[[0,2.0,0],[0,-7,1.8],[0,-13,-2.2],[0,-19.8,-1.2],[0,-21.8,-0.6]],r:[[3.8,5.8],[2.8,3.4],[1.5,2.1],[1.5,1.8],[1.75,2.0]],cap:[0,-22.3,-0.1]}});
    quadRig(G,body,head,tail,legs);return settle(G);}

  /* ---- macaque (khỉ) ---- */
  const MK={fur:C('#87735a'),fur2:C('#a08b6c'),bel:C('#c8b79a'),face:C('#c4907c'),dk:C('#3a2c22')};
  function monkey(){const G=g(),body=pivot(0,5.6,-3,'body');G.add(body);
    const furf=(p,n)=>mix(mix(MK.fur,MK.fur2,cl(vn3(p[0]*.6,p[1]*.6,p[2]*.6,7))),MK.bel,ss(-0.2,-0.7,n[1]));
    const B=new VB(furf);loft(B,[[0,0.3,-1.6],[0,0.5,-0.4],[0,0.3,2.1],[0,0.6,4.6],[0,0.9,6.6],[0,1.1,7.6]],[[1.4,1.5],[2.1,2.3],[2.0,2.1],[2.2,2.5],[1.9,2.2],[1.2,1.5]],8,{cap0:[0,0.4,-2.2],cap1:[0,1.2,8.1]});
    body.add(B.mesh('sb3Flat'));
    const head=pivot(0,1.6,7.6,'head');body.add(head);
    const HB=new VB((p,n)=>{const face=ss(0.2,0.6,n[2])*ss(2.0,1.0,p[1])*ss(1.4,2.2,p[2]);return mix(mix(MK.fur,MK.fur2,ss(1,2.5,p[1])),MK.face,face);});
    const FH=loft(HB,[[0,-0.4,-0.6],[0,0.6,0.3],[0,1.0,1.5],[0,0.7,2.5],[0,0.1,3.1]],[[1.1,1.2],[1.8,1.9],[1.9,1.85],[1.45,1.4],[0.95,0.85]],8,{cap1:[0,-0.25,3.55]});
    // brow ridge + small round ears
    HB.cf=solid(MK.fur);[-1,1].forEach(d=>{const e=surf(FH,1.3,d>0?0.1:PI-0.1,0);HB.o(e,add3(e,[d*0.7,0.6,-0.3]),add3(e,[d*0.7,-0.5,-0.4]),add3(e,[-d,0,0]));HB.cf=solid(MK.face);HB.o(e,add3(e,[d*0.7,-0.5,-0.4]),add3(e,[d*0.7,0.6,-0.3]),add3(e,[-d,0,1.5]));HB.cf=solid(MK.fur);});
    head.add(HB.mesh('sb3Flat'));
    const EB=new VB(solid(C('#2a1a12')));eyesOn(EB,FH,2.75,PI/2-0.45,0.26,[0.9,0.8,0.6]);EB.cf=solid(C('#8a5a4c'));octa(EB,surf(FH,3.7,PI/2-0.3,-0.12),0.22,[1.3,0.6,0.6]);head.add(EB.mesh('sb3Gloss'));
    const tail=pivot(0,0.9,-1.8,'tail');body.add(tail);const TB=new VB(solid(MK.fur));loft(TB,[[0,0,0.2],[0,-0.6,-2],[0,-2,-4.5],[0,-3.6,-7],[0,-4.3,-9.6],[0,-4.5,-12]],[0.48,0.42,0.38,0.33,0.28,0.2],4,{cap1:[0,-4.5,-12.6]});tail.add(TB.mesh('sb3Flat'));
    // anchors (body-local) for the sit pose
    const shA=pivot(0,0.6,6.8),hipA=pivot(0,0.2,-0.2);body.add(shA,hipA);
    const legs=mkLegs(G,{col:(f)=>(p,n)=>mix(mix(MK.fur,MK.fur2,0.4),f&&p[1]<-5.4?MK.face:MK.bel,f&&p[1]<-5.4?0.6:ss(-0.2,-0.8,n[1])*0.4),
      f:{x:1.6,y:6.4,z:3.8,P:[[0,0.6,0],[0,-3,0.3],[0,-5.5,0.4],[0,-6.3,1.0]],r:[[1.0,1.15],[0.75,0.82],[0.55,0.62],[0.62,0.45]],cap:[0,-6.45,1.6],n:5},
      b:{x:1.7,y:5.8,z:-3.2,P:[[0,0.9,0],[0,-2.2,1.4],[0,-4.8,-0.8],[0,-5.6,0.2],[0,-5.85,1.4]],r:[[1.3,1.6],[0.9,1.0],[0.6,0.7],[0.62,0.6],[0.6,0.42]],cap:[0,-5.95,2.0],n:5}});
    quadRig(G,body,head,tail,legs);G.userData.rig.armL=legs.legFL;G.userData.rig.armR=legs.legFR;settle(G);
    const rest={}; [body,head,tail,legs.legFL,legs.legFR,legs.legBL,legs.legBR].forEach(o=>rest[o.name]={p:o.position.clone(),r:o.rotation.clone()});
    G.userData.poses=['stand','sit'];
    G.userData.pose=(name)=>{for(const k in rest){const o=G.userData.rig[k];if(!o)continue;o.position.copy(rest[k].p);o.rotation.copy(rest[k].r);}
      if(name!=='sit')return G;body.rotation.x=-1.12;body.position.y=rest.body.p.y-3.0;head.rotation.x=0.95;tail.rotation.x=1.45;body.updateMatrix();
      const w=new T.Vector3();[[legs.legFL,-1],[legs.legFR,1]].forEach(([L,d])=>{w.copy(shA.position).applyMatrix4(body.matrix);L.position.set(d*1.9,w.y,w.z+0.4);L.rotation.set(-0.3,0,-d*0.1);});
      [[legs.legBL,-1],[legs.legBR,1]].forEach(([L,d])=>{w.copy(hipA.position).applyMatrix4(body.matrix);L.position.set(d*1.9,w.y+0.4,w.z+0.6);L.rotation.set(-1.25,0,-d*0.35);});return G;};
    return G;}

  /* ---- crocodile (cá sấu) ---- */
  const CR={top:C('#3c3f26'),top2:C('#57562f'),side:C('#6e6a43'),bel:C('#cbc39b'),dk:C('#1e1d14'),tooth:C('#ece6d0'),eye:C('#b8a03a')};
  const crocCol=(p,n)=>{let c=mix(CR.top,CR.top2,cl(vn3(p[0]*.4,p[1]*.4,p[2]*.4,9)*1.3-0.2));c=mix(c,CR.side,ss(0.55,0.05,n[1])*0.8);return mix(c,CR.bel,ss(-0.25,-0.7,n[1]));};
  function crocodile(){const G=g(),body=pivot(0,4.2,0,'body');G.add(body);
    const B=new VB(crocCol);B.face=true;const F=loft(B,[[0,0,-11.5],[0,0.2,-6],[0,0.3,0],[0,0.2,6],[0,0.1,10.5]],[[4.0,3.0],[5.6,3.4],[6.0,3.5],[5.4,3.2],[3.9,2.7]],10);
    // back osteoderm rows
    B.cf=(p)=>mix(CR.top,CR.dk,0.25);for(let r=-1;r<=1;r++)for(let k=0;k<5;k++){const s=0.4+k*0.75,b=surf(F,s,PI/2+r*0.42,-0.1);spike(B,b,add3(b,[r*0.2,0.55,-0.3]),0.85,3,false,0.3);}
    body.add(B.mesh('sb3Flat'));
    const head=pivot(0,0.2,10.2,'head');body.add(head);const HB=new VB(crocCol);HB.face=true;
    const FH=loft(HB,[[0,0,-1.5],[0,0.2,1.5],[0,0.25,4],[0,0,7],[0,-0.3,10],[0,-0.4,12.4],[0,-0.45,13.8]],[[3.8,2.6],[3.6,2.3],[3.3,2.0],[2.3,1.35],[1.75,1.0],[1.55,0.88],[1.2,0.7]],8,{cap1:[0,-0.5,14.6]});
    // mouth line + teeth
    HB.cf=solid(CR.dk);[[0.05],[PI-0.05]].forEach(([t])=>band(HB,FH,2.0,t-0.08,6.2,t-0.08,0.1,3,0,1));
    HB.cf=solid(CR.tooth);[-1,1].forEach(d=>{for(let k=0;k<6;k++){const s=2.5+k*0.62,b=surf(FH,s,d>0?-0.12:PI+0.12,-0.05);HB.o(add3(b,[0,0,-0.25]),add3(b,[0,0,0.25]),add3(b,[d*0.05,-0.55,0]),add3(b,[-d,0,0]));}});
    // eye bumps + nostril bump
    HB.cf=solid(CR.top);[-1,1].forEach(d=>{const b=surf(FH,2.05,PI/2-d*0.5,-0.15);spike(HB,b,add3(b,[0,0.75,0.2]),0.7,4,false,0.4);});const nb=surf(FH,5.7,PI/2,-0.1);spike(HB,nb,add3(nb,[0,0.35,0]),0.55,4);
    head.add(HB.mesh('sb3Flat'));const EB=new VB(solid(CR.eye));[-1,1].forEach(d=>octa(EB,add3(surf(FH,2.05,PI/2-d*0.5,0),[d*0.3,0.45,0.35]),0.32,[0.8,0.7,1]));head.add(EB.mesh('sb3Gloss'));
    // tail in two pivots (tail → tail2) for a sinuous swish
    const tail=pivot(0,0,-11,'tail');body.add(tail);const T1=new VB(crocCol);T1.face=true;
    const FT=loft(T1,[[0,0,1.2],[0,-0.1,-4],[0,-0.3,-9],[0,-0.5,-14.3]],[[4.0,3.0],[3.1,2.75],[2.3,2.35],[1.6,1.95]],8);
    T1.cf=solid(mix(CR.top,CR.dk,0.5));for(let k=0;k<5;k++){const s=0.4+k*0.55;[-1,1].forEach(d=>{const b=surf(FT,s,PI/2-d*0.3,-0.05);spike(T1,b,add3(b,[0,0.9,-0.6]),0.6,3);});}tail.add(T1.mesh('sb3Flat'));
    const tail2=pivot(0,-0.5,-14,'tail2');tail.add(tail2);const T2=new VB(crocCol);T2.face=true;
    const FT2=loft(T2,[[0,0,0.6],[0,-0.2,-5.5],[0,-0.4,-11],[0,-0.5,-16]],[[1.6,1.95],[1.1,1.55],[0.65,1.05],[0.22,0.55]],6,{cap1:[0,-0.5,-17]});
    T2.cf=solid(mix(CR.top,CR.dk,0.5));for(let k=0;k<4;k++){const b=surf(FT2,0.2+k*0.7,PI/2,-0.05);spike(T2,b,add3(b,[0,1.2-k*0.2,-0.6]),0.5-k*0.06,3);}tail2.add(T2.mesh('sb3Flat'));
    const legs=mkLegs(G,{col:()=>crocCol,
      f:{x:4.6,y:3.8,z:6.4,P:[[0,0,0],[2.6,-0.6,0.6],[3.6,-3.1,1.2],[4.2,-3.7,2.6]],r:[[1.5,1.4],[1.1,1.0],[0.8,0.72],[1.05,0.45]],cap:[4.4,-3.8,3.9],n:5},
      b:{x:5.0,y:3.8,z:-8,P:[[0,0,0],[3.4,-0.5,-0.6],[4.6,-3.1,0],[5.4,-3.7,1.8]],r:[[2.0,1.8],[1.4,1.2],[0.9,0.8],[1.2,0.48]],cap:[5.6,-3.8,3.2],n:5}});
    quadRig(G,body,head,tail,legs);G.userData.rig.tail2=tail2;return settle(G);}

  /* ---- snake (rắn) — python-like, 7 nested segment pivots ---- */
  const SN={base:C('#8a7748'),base2:C('#a08d58'),blot:C('#3a2a18'),bel:C('#d4c9a2'),eye:C('#c09a30')};
  function snake(seed){seed=+seed||1;const G=g(),body=pivot(0,0.9,13,'body');G.add(body);const NS=7,SL=5.3,rad=i=>{const t=i/NS;return t<0.25?0.78+t*1.2:1.08*(1-Math.pow((t-0.25)/0.75,1.6))+0.14;};
    const col=(off)=>(p,n)=>{const z=-p[2]+off,b=vn3(z*0.55,p[0]*0.8+n[0]*1.5,1,seed+3);let c=mix(SN.base,SN.base2,cl(vn3(z*1.3,p[0],2,seed)));if(b>0.58)c=mix(c,SN.blot,ss(0.58,0.64,b));return mix(c,SN.bel,ss(-0.35,-0.75,n[1]));};
    const head=pivot(0,0,0,'head');body.add(head);const HB=new VB(col(0));HB.face=true;
    const FH=loft(HB,[[0,-0.08,-0.6],[0,0.02,0.5],[0,0.08,1.6],[0,0,2.5]],[[0.8,0.66],[1.0,0.6],[0.84,0.5],[0.5,0.32]],6,{cap1:[0,-0.06,3.0]});
    HB.cf=solid(SN.blot);band(HB,FH,0.8,PI/2,2.6,PI/2,0.18,2,0,1);head.add(HB.mesh('sb3Flat'));
    const EB=new VB(solid(SN.eye));eyesOn(EB,FH,1.85,0.45,0.2);head.add(EB.mesh('sb3Gloss'));
    const seg=[],rest=[0.22,-0.34,0.38,-0.36,0.34,-0.3,0.26];let parent=body;
    for(let i=0;i<NS;i++){const P=pivot(0,0,i===0?-0.4:-SL,'seg'+i);P.rotation.y=rest[i];parent.add(P);parent=P;seg.push(P);
      const r0=rad(i),r1=rad(i+1),B=new VB(col(i*SL+0.4));B.face=true;const last=i===NS-1;
      loft(B,[[0,0,0.55],[0,0,-SL*0.5],[0,0,-SL-(last?0:0.2)]],[[r0*1.08,r0*0.86],[(r0+r1)/2*1.08,(r0+r1)/2*0.86],[r1*1.08,r1*0.86]].map(r=>[r[0],r[1]]),6,{cap1:last?[0,0,-SL-1.6]:false,cap0:i===0?false:false});
      // round joint cap at the front so bending never shows a gap
      if(i>0){const A=[];for(let j=0;j<6;j++){const t=j/6*TAU+PI/2;A.push([Math.cos(t)*r0*1.06,Math.sin(t)*r0*0.84,0.55]);}for(let j=0;j<6;j++)B.o(A[j],A[(j+1)%6],[0,0,0.55+r0*0.7],[0,0,-1]);}
      P.add(B.mesh('sb3Flat'));
      // body pivot sits r above ground: drop to y so the belly touches y=0 on the ground plane (segments are straight; game may set rotation.y)
    }
    G.userData.rig={body,head,seg,segRest:rest.slice()};G.userData.len=40;G.userData.h=2;G.userData.r=10;body.position.y=0.86;return G;}

  /* ---- red junglefowl (gà rừng) ---- */
  const JF={blk:C('#16201a'),mar:C('#7c2a14'),gold:C('#e3a032'),org:C('#c8601a'),red:C('#c41d14'),beak:C('#9a8e70'),leg:C('#6b6a5c'),wing:C('#5a2e18'),prim:C('#2c2018'),tail:C('#132a22')};
  function junglefowl(){const G=g(),body=pivot(0,6.6,0,'body');G.add(body);
    const B=new VB((p,n)=>{let c=mix(JF.mar,JF.org,ss(-1,-3,p[2])*ss(0.5,1.5,p[1]));c=mix(c,JF.blk,ss(0.1,-0.4,n[1])*ss(-2.5,-0.5,p[2]));return c;});
    loft(B,[[0,-0.3,-3.6],[0,0,-2.4],[0,0.1,-0.4],[0,0.3,1.6],[0,0.9,2.9]],[[1.1,1.3],[2.1,2.3],[2.4,2.5],[2.15,2.35],[1.3,1.5]],6,{cap0:[0,0,-4.2],cap1:[0,1.2,3.4]});
    // neck hackles
    B.cf=(p)=>mix(JF.org,JF.gold,ss(1.5,4,p[1]));loft(B,[[0,0.4,1.4],[0,2.4,2.3],[0,4.0,2.8],[0,5.0,3.0]],[[1.5,1.6],[1.2,1.3],[0.95,1.0],[0.75,0.8]],5);body.add(B.mesh('sb3Flat'));
    const head=pivot(0,4.8,3.0,'head');body.add(head);const HB=new VB(solid(JF.red));
    blob(HB,[0,0.55,0.25],0.82,[0.85,0.9,1.1],5,0.15);
    HB.cf=solid(JF.beak);spike(HB,[0,0.45,0.9],[0,0.2,1.95],0.32,3,false,PI/2);head.add(HB.mesh('sb3Flat'));
    const CB=new VB(solid(JF.red));fan(CB,[[0,1.15,-0.3],[0,1.85,-0.6],[0,1.55,-0.05],[0,2.1,0.3],[0,1.6,0.55],[0,1.9,0.95],[0,1.25,1.0]]);
    [-1,1].forEach(d=>fan(CB,[[d*0.15,0.05,0.85],[d*0.25,-0.9,0.65],[d*0.2,-0.6,1.05]]));
    // wings (folded) + tail sickles
    const wing=d=>{const P=pivot(d*2.15,0.7,0.6,d<0?'wingL':'wingR'),W=new VB((p)=>mix(JF.wing,JF.prim,ss(-1,-3.2,p[2])));fan(W,[[0,0.5,1.4],[d*0.15,-0.9,1.3],[d*0.45,-1.9,-1.4],[d*0.35,-1.3,-4.4],[0,0.5,-3.1]]);P.add(W.mesh('sb3DS'));body.add(P);return P;};
    const wingL=wing(-1),wingR=wing(1);
    const tail=pivot(0,0.9,-3.3,'tail');body.add(tail);const TB=new VB((p)=>mix(JF.tail,C('#2e4a2a'),cl(p[1]/8)));
    [[-0.5,1.0],[0.5,1.0],[0,1.25],[-0.35,0.8],[0.35,0.8]].forEach(([x,s],i)=>{const P=[[x*0.4,0,0],[x,2.8*s,-1.3],[x*1.2,4.2*s,-3.2],[x*1.3,3.6*s,-5.0],[x*1.3,1.4*s,-5.9]],w=[0.8,0.85,0.7,0.5,0.08];
      for(let k=0;k<P.length-1;k++){const a=P[k],b=P[k+1];TB.t([a[0]-w[k],a[1],a[2]],[a[0]+w[k],a[1],a[2]],[b[0]+w[k+1],b[1],b[2]]);TB.t([a[0]-w[k],a[1],a[2]],[b[0]+w[k+1],b[1],b[2]],[b[0]-w[k+1],b[1],b[2]]);}});
    tail.add(TB.mesh('sb3DS'));head.add(CB.mesh('sb3DS'));
    const EB=new VB(solid(C('#c87a1a')));[-1,1].forEach(d=>octa(EB,[d*0.62,0.75,0.55],0.18));head.add(EB.mesh('sb3Gloss'));
    const leg=d=>{const P=pivot(d*1.0,5.0,0.1,d<0?'legL':'legR'),L=new VB(solid(JF.leg));
      loft(L,[[0,-0.4,0],[0,-2.6,-0.3],[0,-4.85,0.1]],[0.42,0.32,0.28],4);[[0,1.6],[0.6,1.3],[-0.6,1.3],[0,-0.9]].forEach(([a,l])=>spike(L,[0,-4.85,0.1],[Math.sin(a)*l,-5.0,0.1+Math.cos(a)*l*(l<0?-1:1)*Math.sign(l)],0.18,3));
      P.add(L.mesh('sb3Flat'));G.add(P);return P;};
    const legL=leg(-1),legR=leg(1);
    G.userData.rig={body,head,wingL,wingR,legL,legR,tail,legFL:legL,legBR:legL,legFR:legR,legBL:legR};return settle(G);}

  /* ---- fish (cá chép / cá trê / cá lóc): body along +Z, centred on the origin (swimming); rig {body, tail} ---- */
  const FS={
    carp:{len:14,cols:[C('#4e4220'),C('#b48432'),C('#e8d49c')],fin:C('#9a6a34'),P:[-5.4,-3,0,3,5.2],r:[[0.95,1.6],[1.75,3.0],[2.05,3.35],[1.65,2.65],[0.85,1.35]],nose:6.6,ty:0,
      tailP:[[0,0,0.6],[0,0,-1.8]],tr:[[0.95,1.6],[0.5,0.9]],fin2:[[0,0,-1.6],[0,3.1,-4.6],[0,0.7,-3.4],[0,-0.7,-3.4],[0,-3.1,-4.6]],
      dorsal:[[0,3.0,2.6],[0,4.9,1.6],[0,3.9,-1.0],[0,2.6,-3.6]],anal:[[0,-2.0,-2.0],[0,-3.4,-3.0],[0,-1.5,-4.2]],barb:[[0.4,-0.9,6.2],[1.0,-1.8,6.6]]},
    catfish:{len:16,cols:[C('#2e2a22'),C('#5a5142'),C('#c0b59a')],fin:C('#3a342a'),P:[-6,-3,0,3,5.4],r:[[0.85,1.3],[1.4,1.85],[1.75,1.9],[2.0,1.55],[1.6,1.05]],nose:6.9,ty:0,
      tailP:[[0,0,0.6],[0,0,-2.0]],tr:[[0.85,1.3],[0.45,0.9]],fin2:[[0,0,-1.8],[0,1.9,-3.2],[0,1.2,-4.6],[0,-1.2,-4.6],[0,-1.9,-3.2]],
      dorsal:[[0,1.8,2.2],[0,2.6,1.4],[0,2.2,-5.4],[0,1.3,-5.8]],anal:[[0,-1.7,0.4],[0,-2.4,-0.4],[0,-2.0,-5.5],[0,-1.2,-5.8]],barb:[[1.2,-0.4,6.3],[3.6,-1.4,4.6],[0.6,-0.9,6.4],[2.2,-2.8,5.2]]},
    snakehead:{len:18,cols:[C('#3a3a22'),C('#6b6640'),C('#d0c8a0')],fin:C('#4a4630'),P:[-7,-3.5,0,3.5,6.2],r:[[0.95,1.25],[1.5,1.85],[1.75,2.05],[1.7,1.8],[1.35,1.25]],nose:7.6,ty:0,band:1,
      tailP:[[0,0,0.6],[0,0,-1.8]],tr:[[0.95,1.25],[0.55,0.85]],fin2:[[0,0,-1.6],[0,2.2,-3.4],[0,1.0,-4.6],[0,-1.0,-4.6],[0,-2.2,-3.4]],
      dorsal:[[0,1.9,3.4],[0,2.9,2.6],[0,2.5,-6.6],[0,1.2,-7.0]],anal:[[0,-1.9,-0.4],[0,-2.7,-1.2],[0,-2.2,-6.6],[0,-1.2,-7.0]],barb:null}};
  function fish(v){const S=FS[v]||FS.carp,G=g(),body=pivot(0,0,0,'body');G.add(body);
    const col=(p,n)=>{let c=mix(S.cols[1],S.cols[0],ss(0,0.75,n[1])*0.85+(hsh(p[0]*7|0,p[1]*7|0,p[2]*7|0,2)-.5)*0.1);if(S.band&&n[1]>-0.3&&Math.sin(p[2]*1.25+p[1]*0.9)>0.55)c=mul(c,0.55);return mix(c,S.cols[2],ss(-0.25,-0.75,n[1]));};
    const B=new VB(col);B.face=true;const P=S.P.map(z=>[0,0,z]);loft(B,P,S.r,6,{cap1:[0,-0.25,S.nose]});body.add(B.mesh('sb3Gloss'));
    const tail=pivot(0,0,S.P[0],'tail');body.add(tail);const TB=new VB(col);TB.face=true;loft(TB,S.tailP,S.tr,6);tail.add(TB.mesh('sb3Gloss'));
    const FN=new VB((p)=>mix(S.fin,S.cols[0],0.3));fan(FN,S.fin2);tail.add(FN.mesh('sb3DS'));
    const FB=new VB(solid(S.fin));fan(FB,S.dorsal);fan(FB,S.anal);
    [-1,1].forEach(d=>{const r=S.r[3];fan(FB,[[d*r[0]*0.85,-r[1]*0.45,S.P[3]],[d*(r[0]+1.6),-r[1]*0.95,S.P[3]-1.8],[d*r[0]*0.8,-r[1]*0.6,S.P[3]-1.2]]);});
    if(S.barb)S.barb.forEach(([x,y,z],i)=>[-1,1].forEach(d=>FB.t([d*0.3,-0.4-(i%2)*0.2,S.nose-0.6],[d*0.38,-0.25-(i%2)*0.2,S.nose-0.5],[d*x,y,z])));
    body.add(FB.mesh('sb3DS'));
    const EB=new VB(solid(C('#d8c890')));[-1,1].forEach(d=>{const z=S.P[4]+0.25,r=S.r[4],e=[d*r[0]*0.92,r[1]*0.3,z];EB.t(add3(e,[0,0.35,-0.3]),add3(e,[0,-0.3,-0.3]),add3(e,[0,0,0.4]));EB.o(add3(e,[0,0.35,-0.3]),add3(e,[0,-0.3,-0.3]),add3(e,[0,0,0.4]),[0,e[1],z]);});
    body.add(EB.mesh('sb3Gloss'));
    G.userData.rig={body,tail};G.userData.len=S.len;G.userData.kind=v||'carp';const b=bbox(G);G.userData.h=+(b.max.y-b.min.y).toFixed(1);G.userData.r=+(S.len/2).toFixed(1);return G;}
  M.fish=(v)=>fish(FS[v]?v:'carp');

  /* ---- frog (ếch) ---- */
  function frog(){const G=g(),body=pivot(0,0.9,0,'body');G.add(body);const GN=C('#5d7a34'),GN2=C('#7d9240'),SP=C('#2e3a1a'),BEL=C('#d6cf98');
    const col=(p,n)=>{let c=mix(GN,GN2,cl(p[1]*0.8+0.3));if(vn3(p[0]*2.4,p[2]*2.4,1,3)>0.64&&n[1]>0.2)c=SP;return mix(c,BEL,ss(-0.2,-0.6,n[1]));};
    const B=new VB(col);B.face=true;loft(B,[[0,-0.3,-1.6],[0,0.0,-0.6],[0,0.25,0.5],[0,0.3,1.35]],[[0.95,0.55],[1.35,0.8],[1.3,0.7],[1.05,0.42]],5,{cap0:[0,-0.25,-2.0],cap1:[0,0.2,2.05],rot:PI/2+PI/5});
    const head=pivot(0,0.5,0.9,'head');body.add(head);const HB=new VB(solid(GN2));[-1,1].forEach(d=>{const b=[d*0.6,0,0.1],t=[d*0.66,0.42,0.12];
      HB.o([b[0]-0.28,b[1],b[2]-0.25],[b[0]+0.28,b[1],b[2]-0.25],t,b);HB.o([b[0]+0.28,b[1],b[2]-0.25],[b[0],b[1],b[2]+0.35],t,b);HB.o([b[0],b[1],b[2]+0.35],[b[0]-0.28,b[1],b[2]-0.25],t,b);});
    head.add(HB.mesh('sb3Gloss'));body.add(B.mesh('sb3Gloss'));
    const legs={};['legFL','legFR','legBL','legBR'].forEach(k=>{const f=k[3]==='F',d=k[4]==='L'?-1:1,P=pivot(d*(f?0.95:1.0),f?0.8:0.6,f?0.9:-1.2,k);
      if(f){const L=new VB(solid(GN));L.t([0,0.1,-0.15],[d*0.35,-0.8,0.45],[d*0.05,0.05,0.25]);L.t([d*0.35,-0.8,0.45],[d*0.75,-0.8,0.55],[d*0.2,-0.8,0.85]);P.add(L.mesh('sb3DS'));}
      else{const L=new VB(col);loft(L,[[0,0,0],[d*0.75,-0.15,1.35],[d*0.55,-0.4,-0.45]],[[0.5,0.42],[0.36,0.3],[0.24,0.2]],3,{cap1:[d*1.15,-0.58,0.85],side:[0,1,0]});P.add(L.mesh('sb3Gloss'));}
      G.add(P);legs[k]=P;});
    const tail=pivot(0,0,-1.8,'tail');body.add(tail);quadRig(G,body,head,tail,legs);return settle(G);}

  /* ---- butterfly (bướm) ---- */
  const BFP=[[C('#e07a1a'),C('#1a1410'),C('#f4e6c0')],[C('#2a6ec0'),C('#141418'),C('#9ad0f0')],[C('#e8d030'),C('#1c1810'),C('#f8f0a0')],[C('#f0eee4'),C('#4a4a40'),C('#ffffff')]];
  function butterfly(seed){const pal=BFP[((+seed||1)-1)%BFP.length],G=g(),body=pivot(0,0.45,0,'body');G.add(body);const B=new VB(solid(pal[1]));
    const s0=[0,0,1.0],s1=[0,0,-1.1],r=0.16;[[r,0],[0,r],[-r,0],[0,-r]].forEach(([x,y],i,a)=>{const n=a[(i+1)%4],m1=[x,y,0.1],m2=[n[0],n[1],0.1];B.o(s0,m1,m2,[0,0,0.1]);B.o(s1,m2,m1,[0,0,0.1]);});
    [-1,1].forEach(d=>B.t([d*0.05,0.08,0.9],[d*0.1,0.08,0.9],[d*0.45,0.55,1.7]));body.add(B.mesh('sb3DS'));
    const wing=d=>{const P=pivot(d*0.1,0.05,0.15,d<0?'wingL':'wingR'),W=new VB((p)=>{const rr=Math.hypot(p[0],p[2]);return rr>1.5?pal[1]:rr>1.2?mix(pal[0],pal[1],0.7):pal[0];});W.face=false;
      fan(W,[[0,0,0.3],[d*0.55,0.04,1.1],[d*1.75,0.08,1.3],[d*1.45,0.06,0.15],[d*0.2,0.01,-0.15]]);fan(W,[[0,0,0.05],[d*1.35,0.04,-0.1],[d*1.3,0.03,-0.85],[d*0.65,0.02,-1.4],[d*0.1,0,-0.8]]);
      P.add(W.mesh('sb3DS'));body.add(P);return P;};
    const wingL=wing(-1),wingR=wing(1);wingL.rotation.z=-0.35;wingR.rotation.z=0.35;
    G.userData.rig={body,wingL,wingR};G.userData.len=2.8;G.userData.h=1;G.userData.r=1.8;return G;}
  M.butterfly=(seed)=>butterfly(seed);
  M.animalPose=(G,name)=>{if(G&&G.userData&&G.userData.pose)G.userData.pose(name);return G;};

  const A3={tiger,gaur,monkey,crocodile,snake:(s)=>snake(s||1),junglefowl,carp:()=>fish('carp'),catfish:()=>fish('catfish'),snakehead:()=>fish('snakehead'),fish:()=>fish('carp'),frog,butterfly:(s)=>butterfly(s||1)};
  {const oldAnimal=M.animal;M.animal=(kind,...a)=>A3[kind]?A3[kind](...a):oldAnimal(kind,...a);Object.keys(A3).forEach(k=>{if(!M.list.animals.includes(k))M.list.animals.push(k);});}
  extra3.push('fish','butterfly','animalPose');

  /* ======================================== B. BUILDING PIECES ======================================== */
  const WD={a:C('#8a6a48'),b:C('#6e543a'),c:C('#a07c56'),dk:C('#4a3828'),cut:C('#c9a678')},BM={a:C('#b9a060'),b:C('#a68c50'),g:C('#97a04f'),d:C('#8a7444'),cap:C('#5a4a30')},
    RT=C('#8e6c40'),ST=[C('#8d877c'),C('#77726a')],MUD={a:C('#a47c54'),b:C('#b8946a'),d:C('#6e5236'),w:C('#5a4430')};
  // bamboo culm a→b (radius r), textured nodes via UV; optional top cap (dark hollow)
  const culm=(B,a,b,r,uvS,cap,n)=>{loft(B,[a,b],[r,r*0.94],n||5,{uvS:uvS||8,rot:0.3});
    if(cap){const d=nrm3(sub3(b,a)),c0=B.cf;B.cf=solid(BM.cap);const F=[];for(let j=0;j<(n||5);j++){const t=j/(n||5)*TAU+0.3;F.push(t);}
      const sd=nrm3(crs([0,1,0],d).some(v=>Math.abs(v)>0.1)?crs([0,1,0],d):[1,0,0]),up=crs(d,sd);
      for(let j=0;j<F.length;j++){const p=(t,k)=>add3(add3(b,sd,Math.cos(t)*r*0.94*k),up,Math.sin(t)*r*0.94*k);B.o(p(F[j],1),p(F[(j+1)%F.length],1),add3(b,d,-0.4),add3(b,d,-3),false,[0,0],[0.1,0],[0.05,0.05]);}B.cf=c0;}};
  // round timber a→b
  const timber=(B,a,b,r0,r1,n,cap)=>loft(B,[a,lerp3(a,b,0.5),b],[r0,(r0+r1)/2,r1],n||7,{uvS:30,cap1:cap?true:false,jit:0.08,seed:Math.round(a[0]*7+a[2]*13)});
  const stone=(B,c,r,seed)=>{B.cf=(p,n)=>mix(ST[0],ST[1],cl(vn3(p[0]*.5,p[1]*.5,p[2]*.5,seed)*1.4-0.2)*(n[1]<0.3?1:0.6));blob(B,c,r,[1,0.42,1],seed,0.3);};
  const P54=54;
  function postInto(Bw,Bs,x,z,seed){stone(Bs,[x,0.2,z],4.4,seed);Bw.cf=(p)=>mix(WD.b,WD.a,cl(vn3(p[1]*0.08,x,z,seed)*1.2));timber(Bw,[x,0.6,z],[x,P54,z],2.75,2.45,7,true);}
  function postPiece(){const G=g(),Bw=new VB(),Bs=new VB();postInto(Bw,Bs,0,0,3);G.add(Bw.mesh('sb3Wood'),Bs.mesh('sb3Rock',{uv:12}));G.userData.colliders=[[0,0,3]];return G;}
  // deck: beams along Z (y -6..0), round joists along X (0..3.2), planks along Z (3.4..6)
  function deckInto(Bw,y0,seed){const R=RNG(seed);Bw.cf=(p)=>mix(WD.b,WD.dk,0.35);[-18,0,18].forEach(x=>box(Bw,[x,y0-3,0],2,3,20));
    Bw.cf=(p)=>mix(WD.b,WD.a,0.5);[-14,-4.7,4.7,14].forEach(z=>loft(Bw,[[-20,y0+1.6,z],[20,y0+1.6,z]],[[1.6,1.6],[1.6,1.6]],6,{side:[0,0,1],uvS:30}));
    for(let i=0;i<6;i++){const w=6.67,x=-20+w*(i+0.5),c=mix(WD.a,i%2?WD.c:WD.b,0.3+R()*0.5);Bw.cf=()=>c;box(Bw,[x,y0+4.7+(R()-.5)*0.15,0],w/2-0.18,1.3,20);}}
  function upperFloor(){const G=g(),B=new VB();deckInto(B,0,11);G.add(B.mesh('sb3Wood',{proj:1,uv:20}));return G;}
  function stilt(){const G=g(),Bw=new VB(),Bs=new VB();[[-20,-20],[20,-20],[-20,20],[20,20]].forEach(([x,z],i)=>postInto(Bw,Bs,x,z,3));
    // tie beams through the posts (x-faces) and X bracing (z-faces)
    Bw.cf=()=>mix(WD.b,WD.dk,0.25);[-20,20].forEach(x=>box(Bw,[x,40,0],1.6,1.9,21.5));
    [-20,20].forEach(z=>{Bw.cf=()=>mix(WD.a,WD.b,0.5);timber(Bw,[-19,6,z+(z>0?-0.6:0.6)],[19,44,z+(z>0?-0.6:0.6)],1.2,1.1,5);timber(Bw,[19,6,z+(z>0?0.6:-0.6)],[-19,44,z+(z>0?0.6:-0.6)],1.2,1.1,5);});
    deckInto(Bw,54,12);G.add(Bw.mesh('sb3Wood',{proj:1,uv:20}),Bs.mesh('sb3Rock',{uv:12}));G.userData.colliders=[[-20,-20,3],[20,-20,3],[-20,20,3],[20,20,3]];G.userData.deckTop=60;return G;}
  function ladder(){const G=g(),B=new VB((p)=>mix(BM.a,BM.d,cl(p[1]/60)*0.5)),f=y=>14.6-y*(12.4/54);
    [-1,1].forEach(d=>culm(B,[d*6.8,-0.5,f(-0.5)],[d*6.3,61,f(61)],1.15,9,true,6));
    for(let y=5;y<=53;y+=6){const z=f(y);B.cf=()=>mix(BM.a,BM.g,hsh(y,1,2,3)*0.4);culm(B,[-7.9,y,z],[7.9,y,z],0.72,9,false,5);}
    G.add(B.mesh('sb3Bamboo'));return G;}
  // vertical-culm bamboo wall; open = [x0,x1,y0,y1] opening
  function bambooWallG(open,H){H=H||48;const G=g(),B=new VB(),R=RNG(open?5:3);
    for(let x=-17.6;x<=17.61;x+=2.93){const c=mix(BM.a,[BM.b,BM.g,BM.d][Math.floor(R()*3)],0.3+R()*0.4),top=H-0.6+R()*0.9;B.cf=()=>c;
      if(open&&x>open[0]-1.4&&x<open[1]+1.4){if(top>open[3]+0.5)culm(B,[x,open[3]+0.6,0],[x,top,0],1.42,8,true);}else culm(B,[x,0,0],[x,top,0],1.42,8,true);}
    B.cf=()=>BM.d;[-20,20].forEach(x=>culm(B,[x,0,0],[x,H+0.6,0],2.35,10,true,7));
    // horizontal rails on both faces (interrupted by the opening)
    B.cf=()=>mix(BM.a,BM.d,0.5);[8,H/2+2,H-4].forEach(y=>[-2.45,2.45].forEach(z=>{if(open&&y<open[3]){culm(B,[-19.5,y,z],[open[0]-1.2,y,z],1.0,9);culm(B,[open[1]+1.2,y,z],[19.5,y,z],1.0,9);}else culm(B,[-19.5,y,z],[19.5,y,z],1.0,9);}));
    if(open){B.cf=()=>BM.d;[open[0]-1.0,open[1]+1.0].forEach(x=>culm(B,[x,0,0],[x,open[3]+1.5,0],1.6,9,true,6));culm(B,[open[0]-2.5,open[3]+0.9,0],[open[1]+2.5,open[3]+0.9,0],1.4,9);}
    G.add(B.mesh('sb3Bamboo'));
    // rattan lashings at the end posts
    const L=new VB(solid(RT));[-20,20].forEach(x=>[8,H/2+2,H-4].forEach(y=>loft(L,[[x,y-0.6,0],[x,y+0.6,0]],[2.6,2.6],6)));G.add(L.mesh('sb3Flat'));return G;}
  function bambooWallDoor(){const G=bambooWallG([-8,8,0,34]),M2=new VB((p)=>mix(BM.a,BM.d,0.3+0.2*Math.sin(p[0]*3)));
    loft(M2,[[-8.5,33.0,3.2],[8.5,33.0,3.2]],[[1.9,1.9],[1.9,1.9]],7,{side:[0,0,1],uvS:3,cap0:true,cap1:true});G.add(M2.mesh('sb3Thatch'));
    const Cd=new VB(solid(RT));[-5,5].forEach(x=>cord(Cd,[[x,35.5,2.6],[x,30.5,5.3]],0.14));G.add(Cd.mesh('sb3DS'));return G;}
  // wattle-and-daub panel between x0..x1, y0..y1 (grid xs, ys); hole [x0,x1,y0,y1] skipped; exposed wattle patch
  function daub(B,xs,ys,hole,seed,patch){const R=RNG(seed),zt=(x,y,s)=>{const e=Math.min(x-xs[0],xs[xs.length-1]-x,y-ys[0],ys[ys.length-1]-y);return s*(1.75+0.35*ss(0,6,e)+(hsh(Math.round(x*10),Math.round(y*10),seed,s>0?1:2)-.5)*0.45);};
    const inP=(x,y)=>patch&&x>patch[0]&&x<patch[1]&&y>patch[2]&&y<patch[3];
    B.cf=(p,n)=>{let c=mix(MUD.a,MUD.b,cl(vn3(p[0]*.12,p[1]*.12,p[2],seed)*1.5-0.3));c=mix(c,MUD.d,ss(9,1,p[1])*0.6);return c;};
    for(const s of [1,-1])for(let i=0;i<xs.length-1;i++)for(let j=0;j<ys.length-1;j++){const x0=xs[i],x1=xs[i+1],y0=ys[j],y1=ys[j+1];if(hole&&x0>=hole[0]-0.01&&x1<=hole[1]+0.01&&y0>=hole[2]-0.01&&y1<=hole[3]+0.01)continue;
      const P=(x,y)=>[x,y,inP(x,y)&&s>0?0.4:zt(x,y,s)];B.q(P(x0,y0),P(x1,y0),P(x1,y1),P(x0,y1),[ (x0+x1)/2,(y0+y1)/2,0]);}
    if(patch){const c0=B.cf;B.cf=()=>MUD.w;for(let y=patch[2]+1.2;y<patch[3];y+=2.2)box(B,[(patch[0]+patch[1])/2,y,0.9],(patch[1]-patch[0])/2+0.6,0.45,0.45);B.cf=()=>mix(MUD.w,WD.a,0.4);
      [patch[0]+1.5,patch[1]-1.6].forEach(x=>box(B,[x,(patch[2]+patch[3])/2,0.5],0.5,(patch[3]-patch[2])/2+0.5,0.5));B.cf=c0;}}
  function mudWallG(win,H){H=H||48;const G=g(),M2=new VB(),W=new VB(),xs=win?[-17.8,-12.9,-8,-2.67,2.67,8,12.9,17.8]:[-17.8,-12.7,-7.6,-2.5,2.5,7.6,12.7,17.8],
      ys=H<30?[3,9,15,H-3]:win?[3,10.5,18,26,34,39.5,H-3]:[3,9,15,21,27,33,39,H-3];
    daub(M2,xs,ys,win?[-8,8,18,34]:null,win?9:7,H>30&&!win?[7.6,12.7,9,21]:H>30?[-12.9,-8,9,15]:null);G.add(M2.mesh('sb3Mud',{uv:28,proj:1}));
    W.cf=(p)=>mix(WD.b,WD.a,cl(vn3(p[0]*.1,p[1]*.1,3,4)));[-20,20].forEach(x=>timber(W,[x,0,0],[x,H+0.5,0],2.8,2.6,7,true));
    W.cf=()=>mix(WD.b,WD.dk,0.3);box(W,[0,1.5,0],17.6,1.5,2.4);box(W,[0,H-1.5,0],17.6,1.5,2.5);
    if(win){W.cf=()=>WD.a;box(W,[0,17,0],10.2,1,2.6);box(W,[0,35,0],10.2,1,2.6);[-1,1].forEach(d=>box(W,[d*9,26,0],1,8,2.6));
      W.cf=()=>mix(BM.a,BM.d,0.4);[-4,0,4].forEach(x=>loft(W,[[x,18,0],[x,34,0]],[0.6,0.6],5,{uvS:8}));}
    if(H<30){W.cf=()=>WD.a;box(W,[0,H+0.6,0],20.5,0.9,3.2);}
    G.add(W.mesh('sb3Wood',{proj:1,uv:20}));return G;}
  function railing(){const G=g(),B=new VB((p)=>mix(BM.a,BM.d,0.35));[-20,0,20].forEach(x=>culm(B,[x,0,0],[x,21,0],1.5,8,true,6));
    culm(B,[-21,19.6,0],[21,19.6,0],1.15,9);culm(B,[-20,9,0],[20,9,0],0.85,9);
    B.cf=()=>mix(BM.a,BM.g,0.35);[[-19,0],[1,20]].forEach(([a,b])=>{culm(B,[a,1.5,0.9],[b-2,18.4,0.9],0.55,9);culm(B,[b-2,1.5,-0.9],[a,18.4,-0.9],0.55,9);});
    G.add(B.mesh('sb3Bamboo'));const L=new VB(solid(RT));[-20,0,20].forEach(x=>[9,19.6].forEach(y=>loft(L,[[x,y-0.5,0],[x,y+0.5,0]],[1.75,1.75],5)));G.add(L.mesh('sb3Flat'));return G;}
  function bambooFloor(){const G=g(),Bw=new VB(),B=new VB(),R=RNG(21);Bw.cf=()=>mix(WD.b,WD.a,0.4);[-15,-5,5,15].forEach(z=>loft(Bw,[[-20,1.7,z],[20,1.7,z]],[[1.7,1.7],[1.7,1.7]],6,{side:[0,0,1],uvS:30}));
    const N=14,w=40/N;for(let i=0;i<N;i++){const x=-20+w*(i+0.5),c=mix(BM.a,[BM.b,BM.g,BM.d][i%3],0.25+R()*0.35),hw=w/2-0.12,hh=2.6,dz=(R()-.5)*0.6;B.cf=()=>c;
      const arc=[];for(let k=0;k<=3;k++){const a=PI-k*PI/3;arc.push([x+Math.cos(a)*hw,3.4+Math.sin(a)*hh*(k===0||k===3?0:1)+(k===0||k===3?0:0),0]);}arc[1][1]=3.4+hh*0.86;arc[2][1]=3.4+hh*0.86;
      const zA=-20,zB=20,ct=[x,3.4,0];for(let k=0;k<3;k++){const a=arc[k],b=arc[k+1];B.q([a[0],a[1],zA],[b[0],b[1],zA],[b[0],b[1],zB],[a[0],a[1],zB],ct,false,[k/3,(zA+dz)/8],[(k+1)/3,(zA+dz)/8],[(k+1)/3,(zB+dz)/8],[k/3,(zB+dz)/8]);}
      [zA,zB].forEach(z=>{const c2=[x,4.5,z+(z<0?5:-5)];for(let k=1;k<3;k++)B.o([arc[0][0],arc[0][1],z],[arc[k][0],arc[k][1],z],[arc[k+1][0],arc[k+1][1],z],c2,false,[0,0],[0.02,0],[0.02,0.02]);});}
    G.add(Bw.mesh('sb3Wood'),B.mesh('sb3Bamboo'));return G;}
  // roof slab in the `roof` frame: P(x,s,k): x lateral, s along slope (eave s=-6.25 … ridge s=52), k along the slab normal
  const RP=(x,s,k)=>[x,48+s*0.6+k*0.8,20-s*0.8+k*0.6];
  function roofSlab(B,t,uvU,uvV){const s0=-6.25,s1=52,pr=[[-19.6,t],[19.6,t],[21,0],[19.6,-t],[-19.6,-t],[-21,0]],ct=RP(0,(s0+s1)/2,0),U=(x,s)=>[x/uvU,s/uvV];
    for(let i=0;i<6;i++){const a=pr[i],b=pr[(i+1)%6];B.q(RP(a[0],s0,a[1]),RP(b[0],s0,b[1]),RP(b[0],s1,b[1]),RP(a[0],s1,a[1]),ct,false,U(a[0]+a[1],s0),U(b[0]+b[1],s0),U(b[0]+b[1],s1),U(a[0]+a[1],s1));}
    [s0,s1].forEach(s=>{const c=RP(0,s,0);for(let i=0;i<6;i++){const a=pr[i],b=pr[(i+1)%6];B.o(c,RP(a[0],s,a[1]),RP(b[0],s,b[1]),ct,false,U(0,s),U(a[0],s+a[1]),U(b[0],s+b[1]));}});}
  // overlapping courses with a ragged lower edge: [sTop, sLow] per course, k0 = slab top, rise = extra thickness at the lower edge
  function courses(B,list,k0,rise,teeth,tooth,R,cols,uvU,uvV,pointy){const U=(x,s)=>[x/uvU,s/uvV];
    list.forEach(([sa,sb],ci)=>{const col=cols(ci);B.cf=(p,n)=>mul(col,0.82+0.18*cl(n[1]*1.4)+(hsh(Math.round(p[0]*3),ci,5,1)-.5)*0.08);
      const xs=[];for(let i=0;i<=teeth;i++)xs.push(-20+40*i/teeth);
      const low=xs.map((x,i)=>sb+(i%2?tooth*(0.6+R()*0.8):-tooth*0.1)+(i===0||i===teeth?0:0)),ct=RP(0,(sa+sb)/2,k0-3);
      for(let i=0;i<teeth;i++){const x0=xs[i],x1=xs[i+1],u0=RP(x0,sa,k0+0.15),u1=RP(x1,sa,k0+0.15),kk=j=>pointy&&j%2?k0+0.3:k0+rise,l0=RP(x0,low[i],kk(i)),l1=RP(x1,low[i+1],kk(i+1)),d0=RP(x0,low[i]+0.6,k0-0.1),d1=RP(x1,low[i+1]+0.6,k0-0.1);
        B.q(u0,u1,l1,l0,ct,false,U(x0,sa),U(x1,sa),U(x1,low[i+1]),U(x0,low[i]));B.q(l0,l1,d1,d0,ct,false,U(x0,low[i]),U(x1,low[i+1]),U(x1,low[i+1]+1.5),U(x0,low[i]+1.5));}
      [[0,-1],[teeth,1]].forEach(([i,d])=>{const x=xs[i];B.o(RP(x,sa,k0+0.15),RP(x,low[i],k0+(pointy&&i%2?0.3:rise)),RP(x,low[i]+0.6,k0-0.1),RP(x-d*5,(sa+sb)/2,k0),false,U(sa,0),U(low[i],1),U(low[i],0));});});}
  function roofUnder(G){const B=new VB(()=>mix(BM.a,BM.d,0.5));[-13,0,13].forEach(x=>culm(B,RP(x,-5.5,-2.6),RP(x,50,-2.6),1.0,9));culm(B,RP(-20.5,-1,-3.2),RP(20.5,-1,-3.2),1.1,9);G.add(B.mesh('sb3Bamboo'));}
  function thatchRoof(){const G=g(),B=new VB((p,n)=>mul(C('#8a7448'),0.75+0.25*cl(n[1]))),R=RNG(31);roofSlab(B,2.3,10,14);
    const cols=ci=>mix(C('#b49a5e'),C('#9c8550'),[0.1,0.5,0.25,0.65][ci%4]);courses(B,[[34,52],[20,37],[6,23],[-7.5,9]],2.3,2.6,10,1.3,R,cols,10,14);
    G.add(B.mesh('sb3Thatch'));roofUnder(G);return G;}
  function leafRoof(){const G=g(),B=new VB((p,n)=>mul(C('#6e6438'),0.8+0.2*cl(n[1]))),R=RNG(41);roofSlab(B,1.8,8,6);
    const cols=ci=>mix(C('#8e7c46'),[C('#a58f54'),C('#6f7442'),C('#7d6a3c')][ci%3],0.3+0.4*hsh(ci,2,3,4));const L=[];for(let i=0;i<7;i++){const sb=-7.5+i*8.6;L.push([Math.min(52,sb+12),sb]);}
    courses(B,L.reverse(),1.8,1.9,13,2.6,R,cols,8,6,true);G.add(B.mesh('sb3Thatch'));roofUnder(G);return G;}
  /* ---- furniture & household ---- */
  function table(){const G=g(),W=new VB(),R=RNG(5);W.cf=()=>mix(WD.a,WD.c,0.4);box(W,[0,13.9,0],15,1.3,9.5);W.cf=()=>WD.dk;box(W,[0,12.2,6.2],13.5,0.6,0.4);box(W,[0,12.2,-6.2],13.5,0.6,0.4);
    W.cf=()=>mix(WD.b,WD.a,0.3);[[-12,-6.5],[12,-6.5],[-12,6.5],[12,6.5]].forEach(([x,z])=>timber(W,[x*1.04,0,z*1.06],[x,12.7,z],1.35,1.2,6));[-6.5,6.5].forEach(z=>timber(W,[-12.2,4,z],[12.2,4.2,z],0.75,0.75,5));
    const P=new VB((p)=>mix(C('#9a5a34'),C('#5a3420'),ss(15.4,18,p[1])));lathe(P,[5,15.2,1],[[1.6,0],[3.4,0.8],[4,2.4],[3.7,2.6],[3.2,1.2]],8,{cap0:true,inner:3});P.cf=solid(C('#c8a24a'));
    blob(P,[4.6,16.4,1.2],1.1,[1,0.8,1],4,0.2);blob(P,[5.6,16.6,0.4],1.0,[1,0.8,1],5,0.2);G.add(W.mesh('sb3Wood',{proj:1,uv:16}),P.mesh('sb3Flat'));return G;}
  function stool(){const G=g(),W=new VB();W.cf=()=>mix(WD.a,WD.c,0.3);lathe(W,[0,0,0],[[5.0,8],[5.3,8.8],[5.2,10.2]],9,{cap0:true,cap1:true});
    W.cf=()=>WD.b;for(let i=0;i<3;i++){const a=i/3*TAU+0.4;timber(W,[Math.cos(a)*5.2,0,-Math.sin(a)*5.2],[Math.cos(a)*2.6,8.2,-Math.sin(a)*2.6],0.95,0.85,5);}
    G.add(W.mesh('sb3Wood',{proj:1,uv:14}));return G;}
  const pot=(B,c,s,seed,neck)=>{const bas=C('#8e5232'),dk=C('#5a3220'),lt=C('#a8704c');
    B.cf=(p)=>{const t=(p[1]-c[1])/s;let k=mix(bas,lt,cl(vn3(p[0]*.4,p[1]*.4,p[2]*.4,seed)));if(t>0.42&&t<0.62&&Math.sin(Math.atan2(p[2]-c[2],p[0]-c[0])*9+t*30)>0.2)k=mix(k,dk,0.55);if(t>0.98)k=dk;return k;};
    const pr=neck?[[0.3,0],[0.5,0.05],[0.62,0.35],[0.58,0.66],[0.36,0.86],[0.38,0.95],[0.43,1.0],[0.36,0.99],[0.3,0.8]]:[[0.32,0],[0.52,0.07],[0.62,0.45],[0.57,0.8],[0.6,0.95],[0.52,0.96],[0.48,0.75]];
    lathe(B,c,pr.map(([r,y])=>[r*s,y*s]),neck?9:9,{cap0:true,cap1:true,inner:neck?7:5});};
  function pottery(){const G=g(),B=new VB();pot(B,[-4,0,-2],17,1,true);pot(B,[7,0,1],11,2,false);pot(B,[1,0,7.5],7,3,true);
    const L=new VB(()=>C('#b89a5c'));lathe(L,[7.2,10.6,1],[[0.1,0.8],[5,0.2],[6.6,0]],8,{});L.cf=()=>C('#8a6a3a');lathe(L,[7.2,10.6,1],[[6.6,0],[0.1,-0.4]],8,{});
    G.add(B.mesh('sb3Flat'),L.mesh('sb3Thatch',{proj:1,uv:6}));G.userData.colliders=[[-2,1,11]];return G;}
  function drum(){const G=g(),W=new VB((p)=>mix(WD.b,WD.dk,cl(vn3(p[0]*.3,p[1]*.3,p[2]*.3,2))*0.5)),H=new VB(()=>C('#d2b88a')),Cd=new VB(solid(RT));
    lathe(W,[0,0,0],[[6.2,0.6],[7.0,4],[7.3,8.5],[7.0,13],[6.6,15.4]],10,{});H.cf=(p)=>mix(C('#d6bd8e'),C('#a8885a'),ss(4,6.6,Math.hypot(p[0],p[2])));lathe(H,[0,0,0],[[6.9,15.3],[6.6,15.8],[0.01,16.0]],10,{});
    H.cf=()=>C('#5a4228');lathe(H,[0,0,0],[[6.4,0],[6.25,0.7],[0.01,0.7]],10,{});
    const n=12;Cd.cf=()=>RT;lathe(Cd,[0,0,0],[[7.45,4.1],[7.45,5.1]],n,{});for(let i=0;i<n;i++){const a=i/n*TAU,b=(i+0.5)/n*TAU,r1=7.0,r2=7.25;const A=[Math.cos(a)*r1*1.01,15.3,-Math.sin(a)*r1*1.01],Bp=[Math.cos(b)*r2*1.02,5,-Math.sin(b)*r2*1.02],A2=[Math.cos(a+TAU/n)*r1*1.01,15.3,-Math.sin(a+TAU/n)*r1*1.01];
      cord(Cd,[A,Bp,A2],0.16);}
    for(let i=0;i<n;i++){const a=(i+0.5)/n*TAU;box(W,[Math.cos(a)*7.5,4.4,-Math.sin(a)*7.5],0.5,0.9,0.5,a);}
    W.cf=()=>WD.c;[[-1,0.4],[1,-0.3]].forEach(([d,r])=>{timber(W,[d*9.5,0,8],[d*7.2,13,5.2],0.5,0.45,5);blob(W,[d*7.1,13.4,5.1],1.0,[1,1,1],d+3,0.2);});
    G.add(W.mesh('sb3Wood',{proj:1,uv:18}),H.mesh('sb3Flat'),Cd.mesh('sb3DS'));return G;}
  function shelf(){const G=g(),B=new VB((p)=>mix(BM.a,BM.d,0.4)),I=new VB();[[-15,-4.6],[15,-4.6],[-15,4.6],[15,4.6]].forEach(([x,z])=>culm(B,[x,0,z],[x,35,z],1.15,8,true,6));
    [2.5,14.5,26.5].forEach(y=>{[-4.6,4.6].forEach(z=>culm(B,[-16.4,y,z],[16.4,y,z],0.8,9));B.cf=()=>mix(BM.a,BM.g,0.3);for(let i=0;i<5;i++){const z=-3.6+i*1.8;culm(B,[-15,y+1.2,z],[15,y+1.2,z],0.75,9);}B.cf=()=>mix(BM.a,BM.d,0.4);});
    culm(B,[-16.4,33.5,-4.6],[16.4,33.5,-4.6],0.8,9);
    pot(I,[-9,4.6,0],8,4,true);pot(I,[-2.5,4.6,0.5],6,5,false);I.cf=(p)=>mix(C('#c2b058'),C('#8a7a30'),ss(17,23,p[1]));blob(I,[8,18.9,0],2.6,[1,1.2,1],6,0.12);blob(I,[8,22.6,0],1.6,[1,1,1],7,0.12);
    I.cf=()=>C('#6a8a3a');for(let i=0;i<5;i++)spike(I,[-8+i*1.2,16.6,-1+i*0.4],[-9+i*1.6,23+i*0.5,-1+i*0.3],0.6,3);
    I.cf=(p)=>mix(C('#b48e52'),C('#8a6a3a'),cl(Math.sin(p[1]*4)*0.5+0.5));lathe(I,[5,28.6,0],[[3.4,0],[4.4,4.6],[3.9,5.2],[3.6,4.0]],8,{cap0:true,inner:2});
    G.add(B.mesh('sb3Bamboo'),I.mesh('sb3Flat'));return G;}
  function rack(){const G=g(),B=new VB(()=>mix(BM.a,BM.d,0.45)),I=new VB(),Cd=new VB(solid(RT));
    [-16,16].forEach(x=>{culm(B,[x,0,-6],[x,33,0],1.15,9,true,6);culm(B,[x,0,6],[x,33,0],1.15,9,true,6);culm(B,[x,9,-4.4],[x,9,4.4],0.7,9);});culm(B,[-18.5,31.6,0],[18.5,31.6,0],1.05,9);
    // hanging: gourd flask, dried fish, rope coil, woven bag, hide
    const hang=(x,y)=>cord(Cd,[[x,31,0],[x,y,0]],0.12);
    hang(-11,22);I.cf=(p)=>mix(C('#c9a050'),C('#8a6830'),ss(16,22,p[1]));blob(I,[-11,17.2,0],3.0,[1,1.15,1],3,0.1);blob(I,[-11,21.6,0],1.7,[1,1,1],4,0.1);
    [-5,-3,-1].forEach((x,i)=>{hang(x,27.5);I.cf=(p)=>mix(C('#9aa0a0'),C('#5a5a48'),ss(20,26,p[1]));spike(I,[x,27,0],[x,19.5+i*0.6,0],1.2,5,true,0.3);I.cf=()=>C('#4a4a3a');I.t([x,20+i*0.6,0],[x-1.4,18+i*0.6,0],[x+1.4,18+i*0.6,0]);I.t([x,20+i*0.6,0],[x+1.4,18+i*0.6,0],[x-1.4,18+i*0.6,0]);});
    I.cf=()=>C('#c4a46a');loft(I,(()=>{const P=[];for(let i=0;i<=10;i++){const a=i/10*TAU;P.push([4.5+Math.sin(a)*3.4,26.6-(1-Math.cos(a))*3.4,0]);}return P;})(),new Array(11).fill(0.75),4);
    hang(11.5,25);I.cf=(p)=>mix(C('#b08a50'),C('#7a5a34'),cl(Math.sin(p[1]*3.5)*0.5+0.5));lathe(I,[11.5,14,0],[[2.0,0],[3.6,2],[3.9,7],[3.2,11],[2.6,11.4]],7,{cap0:true});
    I.cf=()=>C('#a07a4c');const hz=0.4;I.t([-14,30.5,hz],[-6.5,30.5,hz],[-7.5,12,hz+0.4]);I.t([-14,30.5,hz],[-7.5,12,hz+0.4],[-13,13,hz+0.2]);I.t([-14,30.5,hz],[-7.5,12,hz+0.4],[-6.5,30.5,hz]);I.t([-14,30.5,hz],[-13,13,hz+0.2],[-7.5,12,hz+0.4]);
    G.add(B.mesh('sb3Bamboo'),I.mesh('sb3Flat'),Cd.mesh('sb3DS'));return G;}
  function rug(v){if(v==='hide')return rugHide();const G=g(),B=new VB(),N=20,red=C('#9a3226'),nat=C('#c8b47a'),nat2=C('#b8a46a'),dk=C('#4a3626');B.face=true;
    for(let i=0;i<N;i++){const z0=-20+i*2,z1=z0+2,k=(i===1||i===2||i===17||i===18)?red:(i===3||i===16)?dk:i%2?nat:nat2;
      B.cf=()=>k;B.q([-14,0.5,z0],[14,0.5,z0],[14,0.5,z1],[-14,0.5,z1],[0,-5,(z0+z1)/2],false,[-14/4,z0/3],[14/4,z0/3],[14/4,z1/3],[-14/4,z1/3]);}
    B.cf=()=>nat2;[[-14,1],[14,-1]].forEach(([x,d])=>B.q([x,0.5,-20],[x,0,-20],[x,0,20],[x,0.5,20],[x-d*5,0.2,0],false,[0,0],[0,0.1],[1,0.1],[1,0]));
    [[-20,1],[20,-1]].forEach(([z,d])=>{B.q([-14,0.5,z],[14,0.5,z],[14,0,z],[-14,0,z],[0,0.2,z+d*5],false,[0,0],[1,0],[1,0.1],[0,0.1]);});
    G.add(B.mesh('sb3Thatch'));return G;}
  function rugHide(){const G=g(),B=new VB((p)=>{const r=Math.hypot(p[0]*1.2,p[2]);return mix(mix(C('#6e4426'),C('#8e6036'),cl(vn3(p[0]*.25,p[2]*.25,1,4))),C('#c8a878'),ss(13,19,r)*0.8);});
    const pts=[[0,-19],[4,-15],[9,-17.5],[10.5,-12],[8.5,-7],[11,0],[10,7],[13.5,12.5],[9,13],[5.5,10.5],[3.5,17],[0,18.5]],full=pts.concat(pts.slice(1,-1).reverse().map(([x,z])=>[-x,z])),ct=[0,0.9,0];
    for(let i=0;i<full.length;i++){const a=full[i],b=full[(i+1)%full.length],ya=0.35+0.35*hsh(i,1,2,3),yb=0.35+0.35*hsh((i+1)%full.length,1,2,3);B.o(ct,[a[0],ya,a[1]],[b[0],yb,b[1]],[0,-5,0]);B.o([0,0.05,0],[b[0],ya-0.3,b[1]],[a[0],yb-0.3,a[1]],[0,5,0]);}
    G.add(B.mesh('sb3Flat'));return G;}
  function caveArt(){const G=g(),ge=new T.BufferGeometry();ge.setAttribute('position',new T.Float32BufferAttribute([-20,0,0.05,20,0,0.05,20,30,0.05,-20,0,0.05,20,30,0.05,-20,30,0.05],3));
    ge.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,1,1,0,0,1,1,0,1],2));ge.computeVertexNormals();const m=new T.Mesh(ge,MT.sb3Art);m.receiveShadow=true;m.castShadow=false;m.name='sb3Art';G.add(m);G.userData.panel=[40,30];return G;}
  function trap(){const G=g(),B=new VB(()=>mix(BM.a,BM.g,0.5)),Cd=new VB(solid(C('#a8885a')));
    loft(B,[[-11,-1,-2],[-10.6,7,-1.7],[-8,13.6,-1.1],[-3.5,17,-0.5],[2.2,17.2,0],[5.8,15.4,0.2]],[0.95,0.85,0.72,0.58,0.45,0.35],5,{uvS:6,cap1:true});
    B.cf=()=>mix(WD.a,WD.c,0.5);[[5.2,-0.6],[7.6,-0.4]].forEach(([x,z])=>loft(B,[[x,-0.5,z],[x,5.2,z]],[0.45,0.38],4,{uvS:6,cap1:true}));loft(B,[[4.2,4.4,-0.5],[8.6,4.4,-0.5]],[0.34,0.34],4,{uvS:6});
    cord(Cd,[[5.8,15.3,0.2],[6.0,9,0],[6.3,4.6,-0.4]],0.12);const nc=[10.5,0.6,4.5],P=[];for(let i=0;i<=10;i++){const a=i/10*TAU;P.push([nc[0]+Math.cos(a)*4.2,nc[1]+(i%2)*0.25,nc[2]+Math.sin(a)*3.6]);}
    cord(Cd,[[6.4,4.4,-0.5],[7.5,2.2,1.0],[nc[0]-4.2,0.7,nc[2]]],0.12);cord(Cd,P,0.13);
    [[nc[0]+3.9,nc[2]+1.5],[nc[0]-1,nc[2]+3.7],[nc[0]+1.5,nc[2]-3.4]].forEach(([x,z])=>loft(Cd,[[x,-0.3,z],[x,1.4,z]],[0.22,0.16],3));
    G.add(B.mesh('sb3Bamboo'),Cd.mesh('sb3DS'));G.userData.colliders=[];return G;}
  function fishTrap(){const G=g(),B=new VB((p)=>mix(BM.a,BM.d,cl(0.3+0.25*Math.sin(p[2]*0.7+p[0]))));
    const prof=[[-11,1.1],[-8,2.8],[-3,4.6],[3,5.0],[9,5.2],[11,5.3]],cy=r=>r+0.15,ns=12;
    for(let j=0;j<ns;j++){const a=j/ns*TAU,w=0.55;for(let i=0;i<prof.length-1;i++){const[z0,r0]=prof[i],[z1,r1]=prof[i+1],p=(z,r,da)=>[Math.cos(a+da/r)*r,cy(r)+Math.sin(a+da/r)*r,z];
        B.t(p(z0,r0,-w),p(z0,r0,w),p(z1,r1,w));B.t(p(z0,r0,-w),p(z1,r1,w),p(z1,r1,-w));}}
    [[-8,2.85],[-3,4.65],[3,5.05],[10.6,5.35]].forEach(([z,r])=>{const n=14;for(let j=0;j<n;j++){const a=j/n*TAU,b=(j+1)/n*TAU,P=(t,dz,rr)=>[Math.cos(t)*rr,cy(r)+Math.sin(t)*rr,z+dz];
        B.t(P(a,-0.45,r+0.12),P(b,-0.45,r+0.12),P(b,0.45,r+0.12));B.t(P(a,-0.45,r+0.12),P(b,0.45,r+0.12),P(a,0.45,r+0.12));}});
    for(let j=0;j<ns;j++){const a=(j+0.5)/ns*TAU,w=0.5,p=(z,r,da,yc)=>[Math.cos(a+da/r)*r,yc+Math.sin(a+da/r)*r,z];B.t(p(11,5.1,-w,cy(5.3)),p(11,5.1,w,cy(5.3)),p(4,1.3,w*0.4,cy(5.3)));}
    B.cf=()=>RT;spike(B,[0,cy(1.1),-10.6],[0,cy(1.1),-12.2],1.3,5,true);
    G.add(B.mesh('sb3DS'));return G;}
  /* ---- tool: fishing rod (cần câu) ---- */
  function rodTool(){const G=g(),B=new VB((p)=>mix(BM.a,BM.d,ss(10,48,p[1])*0.5));
    loft(B,[[0,-7,0],[0,4,0],[0,18,0.15],[0,32,0.5],[0,44,1.0],[0,51,1.5]],[0.98,0.88,0.7,0.5,0.32,0.18],5,{uvS:6.5,cap0:true,cap1:true});
    B.cf=()=>RT;loft(B,[[0,-1.6,0],[0,1.6,0]],[1.05,1.05],6);G.add(B.mesh('sb3Bamboo'));
    const tip=pivot(0,51,1.5,'tip');G.add(tip);const line=pivot(0,0,0,'line');tip.add(line);const L=new VB(solid(C('#e4dccb')));cord(L,[[0,0,0],[0,-8,0.4],[0,-15,0.6]],0.06);line.add(L.mesh('sb3DS'));
    const F=new VB((p)=>p[1]>-9.2?C('#c03a26'):C('#f0e8d8'));spike(F,[0,-9.2,0.44],[0,-7.9,0.42],0.5,5);spike(F,[0,-9.2,0.44],[0,-10.3,0.46],0.5,5);F.cf=solid(C('#8a8a80'));
    spike(F,[0,-15,0.6],[0,-16.4,0.8],0.14,3);spike(F,[0,-16.4,0.8],[0,-15.8,1.4],0.12,3);line.add(F.mesh('sb3Flat'));
    G.userData.tip=tip;G.userData.line=line;return G;}
  function rodItem(){const t=rodTool();const ln=t.userData.line;ln.parent.remove(ln);t.rotation.z=-PI/2;t.scale.setScalar(0.36);const W=g(t);W.rotation.y=0.35;
    const b=bbox(W),c=b.getCenter(V(0,0,0));W.position.set(-c.x,-b.min.y,-c.z);const G=g(W);const L=new VB(solid(C('#e4dccb')));const P=[];for(let i=0;i<=8;i++){const a=i/8*TAU;P.push([Math.cos(a)*2.2+3,0.4,Math.sin(a)*1.6+3.4]);}cord(L,P,0.07);G.add(L.mesh('sb3DS'));return G;}
  {const oldTool=M.tool;M.tool=(id)=>id==='rod'?rodTool():oldTool(id);const oldItem=M.item;M.item=(id)=>id==='rod'?rodItem():oldItem(id);
    if(!M.list.tools.includes('rod'))M.list.tools.push('rod');if(!M.list.items.includes('rod'))M.list.items.push('rod');}
  const P3={post:postPiece,stilt,upperFloor,ladder,bambooWall:()=>bambooWallG(null),bambooWallDoor,mudWall:()=>mudWallG(false),mudWallWindow:()=>mudWallG(true),halfWall:()=>mudWallG(false,24),railing,
    bambooFloor,thatchRoof,leafRoof,table,stool,shelf,rack,rug:()=>rug('mat'),rugHide,pottery,drum,caveArt,trap,fishTrap};
  {const oldPiece=M.piece;M.piece=(id,...a)=>P3[id]?P3[id](...a):oldPiece(id,...a);Object.keys(P3).forEach(k=>{if(!M.list.pieces.includes(k))M.list.pieces.push(k);});
    ['post','stilt','upperFloor','ladder','bambooWall','bambooWallDoor','mudWall','mudWallWindow','halfWall','railing','bambooFloor','thatchRoof','leafRoof'].forEach(k=>{if(M.meta.structure&&!M.meta.structure.includes(k))M.meta.structure.push(k);});}

  /* ======================================== C. TERRAIN PROPS (cliffs, valleys, grassland) ======================================== */
  const RK0=0;const RK=[C('#8c8478'),C('#76695a'),C('#a39b8c'),C('#5e5448')],MOSS=C('#6c7a46'),DRY=C('#8a8a5a');
  const rockCol=(H,seed)=>(p,n)=>{const b=vn3(p[0]*0.02,p[1]*(6/H),p[2]*0.02,seed);let c=mix(RK[0],RK[1],ss(0.35,0.65,b));c=mix(c,RK[2],ss(0.6,0.9,vn3(p[0]*.05,p[1]*.05,p[2]*.05,seed+1))*0.6);
    if(n[1]<-0.2)c=mul(c,0.7);if(n[1]>0.65)c=mix(c,vn3(p[0]*.08,p[2]*.08,1,seed+2)>0.5?MOSS:DRY,0.55);return c;};
  // stratified outcrop: stacked jittered prisms, roughly vertical faces with ledges; front (+Z) is the flattest (cliff face)
  reg('cliffRock',(v,seed)=>{v=Math.max(1,Math.min(3,(+v||1)|0));seed=+seed||1;const S=[60,120,200][v-1],R=RNG(seed*29+v),G=g(),H=S*(0.62+R()*0.18),W=S/2,D=S*0.3,NL=[4,5,6][v-1],n=9,B=new VB(rockCol(H,seed));
    const base=[];for(let j=0;j<n;j++){const a=(j+(R()-.5)*0.6)/n*TAU,r=(1+(R()-.5)*0.34)*(R()<0.22?0.78:1);let x=Math.cos(a)*W*r,z=-Math.sin(a)*D*r;if(z>D*0.5)z=D*0.5+(z-D*0.5)*0.35;base.push([x,z]);}
    // dipping strata: layer boundaries tilt along a random azimuth and wobble per vertex
    const ta=R()*TAU,dip=0.07+R()*0.12,tilt=(x,z)=>(Math.cos(ta)*x-Math.sin(ta)*z)*dip,y0=-S*0.08-W*dip;
    const lev=[];let sh=[0,0],acc=0;const th=[];for(let l=0;l<NL;l++)th.push(0.6+R()*0.8);const tot=th.reduce((a,b)=>a+b,0);
    for(let l=0;l<=NL;l++){const t=l/NL,sc=l===0?1:1-0.28*Math.pow(t,1.5)+(R()-.5)*0.14;if(l>0)sh=[sh[0]+(R()-.5)*W*0.07,sh[1]-R()*D*0.07];lev.push({sc,sh:sh.slice(),y:l===0?y0:H*acc/tot});if(l<NL)acc+=th[l];}
    const yv=(l,j,x,z)=>l===0?y0:lev[l].y+tilt(x,z)+(l<NL?(hsh(l,j,seed,7)-.5)*H/NL*0.4:0);
    const ring=(l,f,dl)=>base.map(([x,z],j)=>{const jj=1+(hsh(l,j,seed,4)-.5)*0.26,L=lev[l],X=x*L.sc*jj*f+L.sh[0],Z=z*L.sc*jj*f+L.sh[1];return [X,yv(l+(dl||0),j,X,Z),Z];});
    let hi=null;for(let l=0;l<NL;l++){const lo=ring(l,1,0);hi=ring(l,0.94,1);if(l<NL-1)hi.forEach((p,j)=>{p[1]-=(lev[l+1].y-lev[l].y)*0.04;});const ct=[lev[l].sh[0],(lev[l].y+lev[l+1].y)/2,lev[l].sh[1]];
      for(let j=0;j<n;j++){const j1=(j+1)%n;B.q(lo[j],lo[j1],hi[j1],hi[j],ct);}
      if(l<NL-1){const nx=ring(l+1,1,0),ax=[lev[l+1].sh[0],lev[l+1].y,lev[l+1].sh[1]];for(let j=0;j<n;j++){const j1=(j+1)%n;const m=lerp3(lerp3(hi[j],hi[j1],0.5),lerp3(nx[j],nx[j1],0.5),0.5),o=[m[0]-ax[0],0,m[2]-ax[2]],nn=crs(sub3(hi[j1],hi[j]),sub3(nx[j],hi[j]));
          if(dot(nn,o)>=0)B.t(hi[j],hi[j1],nx[j1]).t(hi[j],nx[j1],nx[j]);else B.t(hi[j],nx[j1],hi[j1]).t(hi[j],nx[j],nx[j1]);}}}
    const tc=[hi.reduce((s,p)=>s+p[0],0)/n,hi.reduce((s,p)=>s+p[1],0)/n+S*0.04,hi.reduce((s,p)=>s+p[2],0)/n];for(let j=0;j<n;j++)B.o(hi[j],hi[(j+1)%n],tc,[tc[0],-S,tc[2]]);
    const rings=lev.map((L,l)=>({y:L.y,pts:ring(Math.min(l,NL),0.97,0)}));
    // fallen blocks at the foot
    for(let i=0;i<3+v;i++){const a=R()*PI-PI*0.1,r=S*(0.08+R()*0.07),x=Math.cos(a)*W*(0.75+R()*0.35),z=D*(0.6+R()*0.5);blob(B,[x,r*0.3,z],r,[1.2,0.7,1],seed*7+i,0.5);}
    G.add(B.mesh('sb3Rock',{uv:S/3.5,proj:1}));
    const Vg=new VB((p)=>mix(C('#5a7a30'),C('#82944a'),hsh(Math.round(p[0]),Math.round(p[2]),seed,1)));for(let l=1;l<NL;l+=1){const q=rings[l].pts,j=Math.floor(R()*n),p=q[j],k=S*0.05;
      for(let b=0;b<4;b++){const a=R()*TAU,bx=p[0]*0.97+Math.cos(a)*k*0.4,bz=p[2]*0.97+Math.sin(a)*k*0.4;Vg.t([bx-k*0.15,rings[l].y-1,bz],[bx+k*0.15,rings[l].y-1,bz],[bx+Math.cos(a)*k*0.6,rings[l].y+k*(0.8+R()*0.6),bz+Math.sin(a)*k*0.6]);}}
    G.add(Vg.mesh('sb3DS'));
    G.userData.r=Math.round(W*0.95);G.userData.h=Math.round(H);G.userData.sink=Math.round(S*0.08);G.userData.colliders=[[0,0,Math.round(D*0.9)],[-Math.round(W*0.55),0,Math.round(D*0.75)],[Math.round(W*0.55),0,Math.round(D*0.75)]];return G;});
  reg('scree',(seed)=>{seed=+seed||1;const R=RNG(seed*13+5),G=g(),B=new VB(rockCol(20,seed));B.face=true;
    const Gv=new VB((p)=>mix(C('#7a7062'),C('#8e8676'),hsh(Math.round(p[0]*2),Math.round(p[2]*2),seed,3)));const pts=[];for(let i=0;i<8;i++){const a=i/8*TAU,r=(i%2?11:14)*(0.85+R()*0.3);pts.push([Math.cos(a)*r*0.8,0.15,-Math.sin(a)*r*1.3]);}
    for(let i=0;i<8;i++)Gv.o([0,0.35,0],pts[i],pts[(i+1)%8],[0,-5,0]);
    for(let i=0;i<13;i++){const a=R()*TAU,d=Math.sqrt(R())*11,x=Math.cos(a)*d*0.8,z=-Math.sin(a)*d*1.3,r=1.4+R()*3.4*(1-d/16);
      const c=[x,r*0.25,z],P=[];for(let k=0;k<6;k++){const ax=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]][k],f=0.6+R()*0.8;P.push(add3(c,[ax[0]*r*f,ax[1]*r*f*0.6,ax[2]*r*f]));}
      [[0,2,4],[2,1,4],[1,3,4],[3,0,4],[2,0,5],[1,2,5],[3,1,5],[0,3,5]].forEach(([a,b,cc])=>B.o(P[a],P[b],P[cc],c));}
    G.add(B.mesh('sb3Rock',{uv:10,proj:1}),Gv.mesh('sb3Flat'));G.userData.r=16;G.userData.h=6;G.userData.colliders=[];return G;});
  reg('waterfall',(h)=>{h=Math.max(40,Math.min(300,+h||120));const G=g(),W=30,B=new VB((p)=>mix(C('#f2f9fc'),C('#a8cde0'),ss(0,h*0.4,p[1])*0.6+ss(10,15,Math.abs(p[0]))*0.25)),rows=6,cols=4;
    const zf=y=>{const t=1-y/h;return 7*Math.sqrt(Math.max(0,t))*(1-0.25*t);},xw=y=>W/2*(1+0.12*(1-y/h));
    const P=(i,j)=>{const y=h*(1-j/rows),x=-xw(y)+2*xw(y)*i/cols;return [x+(j>0&&j<rows?(hsh(i,j,7,1)-.5)*1.2:0),y,zf(y)];},U=(p)=>[p[0]/W+0.5,p[1]/30];
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=P(i,j),b=P(i+1,j),c=P(i+1,j+1),d=P(i,j+1);B.t(a,d,c,U(a),U(d),U(c));B.t(a,c,b,U(a),U(c),U(b));}
    // lip: water sliding over the edge
    for(let i=0;i<cols;i++){const a=P(i,0),b=P(i+1,0),a0=[a[0],h+0.6,-6],b0=[b[0],h+0.6,-6];B.t(a0,a,b,U(a0),U(a),U(b));B.t(a0,b,b0,U(a0),U(b),U(b0));}
    // foam / spray at the plunge
    B.cf=()=>C('#ffffff');const fz=zf(0);B.uvMask=[];const nT=B.n();[[-8,3],[0,4.2],[8.5,3.2]].forEach(([x,r],i)=>blob(B,[x,r*0.35,fz+1],r*1.6,[1.3,0.8,1],i+3,0.4));
    B.uvMask=new Array(B.n()).fill(false).map((_,i)=>i<nT);
    G.add(B.mesh('sb3Water',{noShadow:true,uv:30}));G.userData.animate=true;G.userData.water=MT.sb3Water;G.userData.uvScroll=[0,1];G.userData.speed=0.8;G.userData.h=h;G.userData.r=16;G.userData.width=W;G.userData.colliders=[];return G;});
  reg('reedBed',(seed)=>{seed=+seed||1;const R=RNG(seed*17+3),G=g(),B=new VB((p,n)=>mix(C('#5f7f34'),C('#a0a24c'),cl(p[1]/24*0.7+(hsh(Math.round(p[0]*5),Math.round(p[2]*5),seed,2)-.5)*0.4)));
    for(let i=0;i<70;i++){const a=R()*TAU,d=Math.sqrt(R())*14,x=Math.cos(a)*d*1.1,z=-Math.sin(a)*d*0.8,hh=(1-d/22)*(14+R()*14),la=R()*TAU,lean=hh*(0.08+R()*0.15),w=0.9+R()*0.5,fa=R()*PI;
      B.t([x-Math.cos(fa)*w/2,0,z+Math.sin(fa)*w/2],[x+Math.cos(fa)*w/2,0,z-Math.sin(fa)*w/2],[x+Math.cos(la)*lean,hh,z-Math.sin(la)*lean]);}
    B.cf=()=>C('#b7a98a');for(let i=0;i<18;i++){const a=R()*TAU,d=Math.sqrt(R())*11,x=Math.cos(a)*d*1.1,z=-Math.sin(a)*d*0.8,hh=24+R()*10,la=R()*TAU,tx=x+Math.cos(la)*2.5,tz=z-Math.sin(la)*2.5;
      B.t([x-0.25,0,z],[x+0.25,0,z],[tx,hh-4,tz]);B.cf=()=>mix(C('#d8d0c0'),C('#b8a0a0'),R());B.t([tx,hh-4.5,tz],[tx+1.3+Math.cos(la)*2.5,hh+1,tz+0.3-Math.sin(la)*2.5],[tx+Math.cos(la)*4,hh+4.5,tz-Math.sin(la)*4]);
      B.t([tx,hh-4.5,tz],[tx+Math.cos(la)*4,hh+4.5,tz-Math.sin(la)*4],[tx-1.3+Math.cos(la)*1.5,hh+1,tz-0.3-Math.sin(la)*1.5]);B.cf=()=>C('#8a9a4a');}
    G.add(B.mesh('sb3DS'));G.userData.r=15;G.userData.h=34;G.userData.colliders=[];return G;});
  reg('savannaTree',(seed)=>{seed=+seed||1;const R=RNG(seed*23+9),G=g(),H=120+R()*50,Wd=new VB((p)=>mix(C('#5e5244'),C('#7a6a58'),cl(vn3(p[0]*.1,p[1]*.05,p[2]*.1,seed)))),L=new VB((p,n)=>mul(mix(C('#5f7a30'),C('#7a8c3c'),cl(vn3(p[0]*.05,p[1]*.05,p[2]*.05,seed+1)*1.3-0.15)),n[1]<-0.3?0.62:1));
    const fork=[(R()-.5)*8,H*0.42,(R()-.5)*8];loft(Wd,[[0,-2,0],[0,H*0.12,0],[fork[0]*0.6,H*0.3,fork[2]*0.6],fork],[[4.8,4.8],[3.9,3.9],[3.3,3.3],[2.9,2.9]],6,{uvS:30,jit:0.12,seed});
    const nb=3,crowns=[];for(let b=0;b<nb;b++){const a=b/nb*TAU+R()*0.8,d=H*(0.28+R()*0.14),tp=[fork[0]+Math.cos(a)*d,H*(0.78+R()*0.1),fork[2]-Math.sin(a)*d],mid=[fork[0]+Math.cos(a)*d*0.45,H*0.62,fork[2]-Math.sin(a)*d*0.45];
      loft(Wd,[fork,mid,tp],[2.6,1.8,1.0],5,{uvS:30});crowns.push(tp);
      const tw=[tp[0]+Math.cos(a+1.2)*d*0.35,tp[1]+H*0.02,tp[2]-Math.sin(a+1.2)*d*0.35];loft(Wd,[mid,tw],[1.1,0.5],4,{uvS:30});crowns.push(tw);}
    crowns.forEach((c,i)=>blob(L,[c[0],c[1]+H*0.035,c[2]],H*(0.17+R()*0.05),[1.25,0.28,1.25],seed*11+i,0.35));
    const ct=[crowns.reduce((s,c)=>s+c[0],0)/crowns.length,H*0.86,crowns.reduce((s,c)=>s+c[2],0)/crowns.length];blob(L,ct,H*0.2,[1.3,0.25,1.3],seed*11+9,0.3);
    G.add(Wd.mesh('sb3Wood'),L.mesh('sb3Flat'));G.userData.r=5;G.userData.h=Math.round(H*0.94);G.userData.colliders=[[0,0,5]];return G;});
  reg('deadLog',(seed)=>{seed=+seed||1;const R=RNG(seed*31+7),G=g(),Ln=50+R()*20,r=3.8+R()*1.4,B=new VB((p,n)=>{let c=mix(C('#6a5a48'),C('#857462'),cl(vn3(p[0]*.15,p[1]*.3,p[2]*.3,seed)));
      const m=ss(0.2,0.7,n[1])*ss(0.45,0.6,vn3(p[0]*.12,p[2]*.3,2,seed+1));return mix(c,C('#5b7a2e'),m);});
    const P=[],rr=[];for(let i=0;i<=5;i++){const t=i/5,x=-Ln/2+Ln*t;P.push([x,r*0.78+Math.sin(t*PI)*1.2,Math.sin(t*2.4+seed)*2.4]);rr.push(r*(1.08-0.22*t)*(i===0?1.08:1));}
    const F=loft(B,P,rr,7,{uvS:24,jit:0.14,seed});
    // broken jagged end (+X) and rotted hollow end (-X)
    const B2=B;const e=P[5],e0=P[0];B2.cf=()=>C('#a08a68');for(let j=0;j<7;j++){const t=j/7*TAU+PI/2,t1=(j+1)/7*TAU+PI/2,q=(tt,k)=>[e[0]+k,e[1]+Math.sin(tt)*rr[5]*0.98,e[2]+Math.cos(tt)*rr[5]*0.98];B2.o(q(t,0),q(t1,0),[e[0]+2+hsh(j,1,seed,2)*3,e[1]+(hsh(j,2,seed,2)-.5)*2,e[2]],[e[0]-5,e[1],e[2]]);}
    B2.cf=()=>C('#3a2c20');for(let j=0;j<7;j++){const t=j/7*TAU+PI/2,t1=(j+1)/7*TAU+PI/2,q=tt=>[e0[0],e0[1]+Math.sin(tt)*rr[0]*0.98,e0[2]+Math.cos(tt)*rr[0]*0.98];B2.o(q(t),q(t1),[e0[0]+3,e0[1],e0[2]],[e0[0]+8,e0[1],e0[2]],true);}
    B.cf=()=>C('#6a5a48');[[0.3,1.2],[0.62,-1.0],[0.8,2.2]].forEach(([t,a])=>{const i=Math.floor(t*5),c=lerp3(P[i],P[i+1],t*5-i),d=[0,Math.cos(a),Math.sin(a)];spike(B,add3(c,d,r*0.75),add3(c,d,r+3+R()*3),0.9,4);});
    const Fu=new VB(()=>C('#d8c49a'));[[0.4,0.9],[0.48,0.6],[0.7,1.4]].forEach(([t,a],k)=>{const i=Math.floor(t*5),c=lerp3(P[i],P[i+1],t*5-i),d=[0,-Math.sin(a)*0.2,Math.cos(a)],b=add3(c,[0,0,0],0),q=add3(b,d,r*0.92),w=2.2-k*0.4;
      Fu.o([q[0]-w,q[1],q[2]],[q[0]+w,q[1],q[2]],[q[0],q[1]+0.2,q[2]+w*0.9*Math.sign(d[2]||1)],[q[0],q[1]-3,q[2]]);Fu.o([q[0]-w,q[1],q[2]],[q[0]+w,q[1],q[2]],[q[0],q[1]-0.5,q[2]+w*0.8*Math.sign(d[2]||1)],[q[0],q[1]+3,q[2]]);});
    G.add(B.mesh('sb3Wood'),Fu.mesh('sb3Flat'));G.rotation.y=0;G.userData.r=Math.round(Ln/2);G.userData.h=Math.round(r*2);G.userData.colliders=[[-Ln*0.3,0,r],[0,0,r],[Ln*0.3,0,r]].map(a=>a.map(v=>Math.round(v)));return G;});

  /* ======================================== LISTS / META ======================================== */
  M.list.extra3=extra3;
  M.meta.extra3={pieceH:{post:54,stilt:60,upperFloorTop:6,upperFloorBottom:-6,ladderTop:54,halfWall:24,railing:20,wall:48},
    door3:[16,34],window3:[16,16,18],caveArt:[40,30],rugTop:0.5,
    rig:{snake:['body','head','seg'],fish:['body','tail'],fowl:['body','head','wingL','wingR','legL','legR','tail'],butterfly:['body','wingL','wingR']},
    waterfall:{width:30,uvVPerDu:1/30,scroll:'material.map.offset.y += dt*speed (shared material)'}};}
