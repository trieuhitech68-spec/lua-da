/* ===================== K3.char2 — realistic low-poly prehistoric human (Lửa Đá) =====================
   Needs three r149 + K3 kit (k3d.js). Call K3char2Init() once K3 is ready → K3.char2(look), K3.char2Pose(rig,name,t,o), K3.char2Equip(rig,tool,id).
   K3.char2(look) → THREE.Group, feet at y=0, faces +Z, ~36 du tall (male; female ×0.955). Deterministic (no Math.random). ≤2200 ▲, ≤8 materials.
   look keys (K3.char compatible): skin, top, top2, bottom|skirt, hair, hs ('short'|'wild'|'long'|'bun'|'braid'|'bald'), beard, fem, bare, sleeves (true=elbow, 'long'=wrist, false=sleeveless),
     cloak, cloak2, boots (colour → leather foot wraps; absent → bare feet), belt
   new keys: sex 'm'|'f' (overrides fem), hairStyle 0 long-tied | 1 short-messy | 2 braided, beard bool, build 0.9..1.1 (width/muscle)
   RIG  G.userData.rig = {root, hips, torso, head, neck(=head), armL, armR, foreL, foreR, handL, handR, legL, legR, shinL, shinR, footL, footR,
                          face, top, back, cloak?, hair?, dims, headR, headY}
     hierarchy: root ─ hips(y=17.6·h) ─┬ torso(y+3.2) ─┬ head(neck base)
                                       │               ├ armX(shoulder) ─ foreX(elbow, y-6.6) ─ handX(wrist, y-5.3)
                                       │               └ cloak(optional)
                                       └ legX(hip joint, x∓1.55) ─ shinX(knee, y-8.1) ─ footX(ankle, y-8.0)
     L = −X side, R = +X side (same as K3.char). All pivots sit exactly on the joint; children hang along −Y.
     SIGN CONVENTIONS (identical to K3.char for armL/armR/legL/legR/torso/head):
       arm*.rotation.x  < 0 swings the arm FORWARD/up (−2.6 = overhead), > 0 back.  arm*.rotation.z: armL −, armR + = abduct outward (neutral ∓0.07)
       fore*.rotation.x < 0 bends the ELBOW (hand comes forward/up); 0 = straight; never positive.
       leg*.rotation.x  < 0 swings the thigh FORWARD (knee up), > 0 back.
       shin*.rotation.x > 0 bends the KNEE (foot goes back/up); 0 = straight; never negative.
       foot*.rotation.x > 0 points the toes down (plantar-flex), < 0 toes up.
       torso.rotation.x > 0 bends FORWARD, head.rotation.x > 0 nods DOWN; .y turns (+ = toward +X), .z tilts.
       hips: root of the body: pose functions move/rotate it (kneel, sit, lie, swim); the game should only move G itself.
     Neutral transforms (also what char2Pose resets to): hips (0,17.6h,0) rot 0, torso/head rot 0, armL (0,0,−0.07) armR (0,0,0.07), fore x −0.12,
       hands 0, legs (0,0,∓0.02), shins 0, footL y −0.1 / footR y +0.1 (toe-out).
   GRIP: right fist wraps a rod running along handR-local Z through (0,−1.75,0) (K3.char2Grip.pos). A tool built with the SBM convention
     (grip at origin, handle +Y, blade +Z) sits in the fist with tool.position=(0,−1.75,0), tool.rotation=(π/2,0,0): handle → hand +Z, blade → hand −Y.
     The legacy equip() offset (0,−1.5,1.5)+rot x π/2+0.25 also lands inside the fist. Work poses aim the hand assuming the char2Grip rotation.
*/
function K3char2Init(){const K=(typeof K3!=='undefined')?K3:window.K3;if(!K||!K.ok||K.char2)return;const T=K.T,PI=Math.PI,TAU=PI*2;
  const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,ss=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
  const hsh=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
  const shade=(hex,f)=>{const c=new T.Color(hex);c.offsetHSL(0,0,f);return '#'+c.getHexString();};
  const mixc=(a,b,t)=>'#'+new T.Color(a).lerp(new T.Color(b),t).getHexString();
  const sp=(v,p)=>v<0?-Math.pow(-v,2/p):Math.pow(v,2/p);
  /* ---------- triangle soup (one mesh per material per bone) ---------- */
  class Soup{constructor(){this.m={};}
    t(k,a,b,c,ref,toward){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
      const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;if(nx*nx+ny*ny+nz*nz<1e-9)return this;
      if(ref){const d=nx*((a[0]+b[0]+c[0])/3-ref[0])+ny*((a[1]+b[1]+c[1])/3-ref[1])+nz*((a[2]+b[2]+c[2])/3-ref[2]);if((d<0)!==!!toward){const s=b;b=c;c=s;}}
      (this.m[k]||(this.m[k]=[])).push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);return this;}
    q(k,a,b,c,d,ref,tw){this.t(k,a,b,c,ref,tw);return this.t(k,a,c,d,ref,tw);}
    to(grp,MAT){for(const k in this.m){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.m[k],3));g.computeVertexNormals();
      const me=new T.Mesh(g,MAT(k));me.castShadow=true;me.receiveShadow=true;me.userData.part=k;grp.add(me);}this.m={};return grp;}}
  const RG=(y,hx,zf,zb,o)=>Object.assign({y,xn:hx,xp:hx,zf,zb,cx:0,cz:0,p:2.4},o||{});
  const rp=(r,u)=>{const s=Math.sin(u),c=Math.cos(u);return [r.cx+(s>=0?r.xp:r.xn)*sp(s,r.p),r.y,r.cz+(c>=0?r.zf:r.zb)*sp(c,r.p)];};
  const rAt=(rs,y)=>{for(let j=0;j<rs.length-1;j++){const a=rs[j],b=rs[j+1];if((y<=a.y&&y>=b.y)||(y>=a.y&&y<=b.y)){const t=(y-a.y)/((b.y-a.y)||1);const o={y};['xn','xp','zf','zb','cx','cz','p'].forEach(k=>o[k]=lerp(a[k],b[k],t));return o;}}
    const e=Math.abs(y-rs[0].y)<Math.abs(y-rs[rs.length-1].y)?rs[0]:rs[rs.length-1];return Object.assign({},e,{y});};
  // loft: rings → quads; mk(j) material key per segment (falsy = skip); o:{n,mod(j,i,p,u),u(j,i),map(p),cap0,cap1,capKey0,capKey1,open,inward}
  function loft(S,rings,n,mk,o){o=o||{};const key=j=>typeof mk==='function'?mk(j):mk,M=p=>o.map?o.map(p):p;
    const P=rings.map((r,j)=>{const a=[];for(let i=0;i<n;i++){const u=o.u?o.u(j,i):TAU*i/n;let p=rp(r,u);if(o.mod){const q=o.mod(j,i,p,u);if(q)p=q;}a.push(p);}return a;});
    const C=rings.map(r=>[r.cx,r.y,r.cz]),ni=o.open?n-1:n;
    for(let j=0;j<rings.length-1;j++){const k=key(j);if(!k)continue;const ref=M([(C[j][0]+C[j+1][0])/2,(C[j][1]+C[j+1][1])/2,(C[j][2]+C[j+1][2])/2]);
      for(let i=0;i<ni;i++){const i2=(i+1)%n;S.q(k,M(P[j][i]),M(P[j][i2]),M(P[j+1][i2]),M(P[j+1][i]),ref,o.inward);}}
    const cap=(j,jn,c,k)=>{const cp=M(c===true?C[j]:c),ref=M(C[jn]);for(let i=0;i<n;i++)S.t(k,cp,M(P[j][i]),M(P[j][(i+1)%n]),ref);};
    if(o.cap0)cap(0,1,o.cap0,o.capKey0||key(0));const L=rings.length-1;if(o.cap1)cap(L,L-1,o.cap1,o.capKey1||key(L-1));return P;}
  // box-section tube between consecutive [center, halfW(x), halfD(z)] stations along an arbitrary path (for thumbs, ties, braids)
  function tube(S,k,pts,n,rad,o){o=o||{};const P=[],up=new T.Vector3(0,0,1);for(let j=0;j<pts.length;j++){const a=new T.Vector3(...pts[Math.max(0,j-1)]),b=new T.Vector3(...pts[Math.min(pts.length-1,j+1)]);
      const d=b.sub(a).normalize(),ax=Math.abs(d.dot(up))>0.9?new T.Vector3(1,0,0):up.clone(),e1=new T.Vector3().crossVectors(d,ax).normalize(),e2=new T.Vector3().crossVectors(d,e1).normalize();
      const r=rad[j],tw=(o.twist||0)*j,ring=[];for(let i=0;i<n;i++){const u=TAU*i/n+tw,rr=Array.isArray(r)?r:[r,r];ring.push([pts[j][0]+e1.x*Math.cos(u)*rr[0]+e2.x*Math.sin(u)*rr[1],pts[j][1]+e1.y*Math.cos(u)*rr[0]+e2.y*Math.sin(u)*rr[1],pts[j][2]+e1.z*Math.cos(u)*rr[0]+e2.z*Math.sin(u)*rr[1]]);}P.push(ring);}
    for(let j=0;j<P.length-1;j++){const ref=[(pts[j][0]+pts[j+1][0])/2,(pts[j][1]+pts[j+1][1])/2,(pts[j][2]+pts[j+1][2])/2];for(let i=0;i<n;i++){const i2=(i+1)%n;S.q(k,P[j][i],P[j][i2],P[j+1][i2],P[j+1][i],ref);}}
    const L=P.length-1;if(o.cap0!==false){for(let i=0;i<n;i++)S.t(k,pts[0],P[0][i],P[0][(i+1)%n],pts[1]);}if(o.cap1!==false){for(let i=0;i<n;i++)S.t(k,pts[L],P[L][i],P[L][(i+1)%n],pts[L-1]);}}
  function ball(S,k,c,r,ws,hs,sc){sc=sc||[1,1,1];const P=[];for(let j=0;j<=hs;j++){const v=PI*j/hs,row=[];for(let i=0;i<ws;i++){const u=TAU*i/ws;row.push([c[0]+Math.sin(v)*Math.sin(u)*r*sc[0],c[1]+Math.cos(v)*r*sc[1],c[2]+Math.sin(v)*Math.cos(u)*r*sc[2]]);}P.push(row);}
    for(let j=0;j<hs;j++)for(let i=0;i<ws;i++){const i2=(i+1)%ws;if(j>0)S.t(k,P[j][i],P[j][i2],P[j+1][i2],c);if(j<hs-1)S.t(k,P[j][i],P[j+1][i2],P[j+1][i],c);}}
  /* ---------- materials ---------- */
  const MERGE=[['cloak2','cloak'],['eye','hair'],['skinD','skin'],['boot','top2'],['bot','top2']];
  /* ---------- head profile (head-local: origin = neck pivot; chin y≈1.05, crown y≈5.95, face toward +Z) ---------- */
  const HEAD0=[[5.95,.2,.05,.35],[5.64,1.0,.86,1.38],[5.1,1.42,1.42,1.9],[4.42,1.58,1.7,2.1],[3.86,1.6,1.86,2.07],[3.4,1.58,1.63,1.98],[2.85,1.55,1.73,1.76],[2.3,1.38,1.7,1.36],[1.76,1.18,1.57,.86],[1.26,.74,1.43,.32],[1.03,.36,1.02,.16]];
  const GRIP=new T.Vector3(0,-1.75,0);
  K.char2Grip={pos:[0,-1.75,0],rot:[PI/2,0,0]};
  K.char2=(o)=>{o=o||{};const fem=o.sex?o.sex==='f':!!o.fem,bw=clamp(o.build||1,0.85,1.15),bz=1+(bw-1)*0.6,h=fem?0.955:1,F=fem?1:0;
    const skin=o.skin||'#b07a52',hasTop=!o.bare||fem,top=o.top||'#8a5a33',top2=o.top2||o.belt&&o.belt||shade(top,-0.12),bot=(typeof o.skirt==='string'&&o.skirt)||o.bottom||shade(top,-0.16);
    const hairC=o.hair||'#1e1410',bald=o.hs==='bald'||o.hs==='none',hs=o.hairStyle!=null?(o.hairStyle|0)%3:({wild:1,short:1,braid:2,bun:0,long:0}[o.hs]??(fem?0:1));
    const beard=!fem&&!!o.beard,sleeves=hasTop&&o.sleeves!==false,longSl=o.sleeves==='long',boots=o.boots||null,cloak=o.cloak||null;
    const COL={skin,skinD:mixc(skin,'#6e2c24',0.38),hair:hairC,eye:'#1a110c',top,top2,bot,boot:boots||top2,cloak:cloak||top,cloak2:o.cloak2||(cloak&&shade(cloak,-0.12))||top2};
    const G=new T.Group();G.name='char2';
    const hips=new T.Group(),torso=new T.Group(),head=new T.Group();hips.name='hips';torso.name='torso';head.name='head';
    hips.position.set(0,17.6*h,0);hips.scale.setScalar(h);G.add(hips);torso.position.set(0,3.2,0);hips.add(torso);head.position.set(0,9.3,-0.15);torso.add(head);
    const SH=(fem?2.95:3.3)*bw,HX=(fem?1.68:1.55)*Math.sqrt(bw);
    const parts=[];const soup=(grp)=>{const S=new Soup();parts.push([S,grp]);return S;};
    /* ===== HEAD ===== */
    const HD=HEAD0.map((r,j)=>{const q=r.slice();if(fem){if(j>=7){q[1]*=0.92;}if(j===4)q[2]-=0.07;if(j===8)q[2]-=0.05;}return RG(q[0],q[1],q[2],q[3],{p:2.5});});
    const hS=soup(head),HC=[0,3.3,-0.2];
    const headPt=(u,y)=>rp(rAt(HD,y),u);
    const hmod=(j,i,p)=>{const k=i>6?12-i:i;// mirror index (0 front … 6 back)
      if(j===5){if(k===1)p[2]-=0.2;if(k===2)p[2]-=0.06;if(k===0)p[2]+=0.02;}
      if(j===4){if(k===1)p[2]+=0.06;if(k===0)p[2]-=0.06;}
      if(j===6&&k===2){p[0]*=1.05;p[2]+=0.12;}
      if(j===7&&k===1){p[2]-=0.04;}
      if(j===9&&k===0)p[2]+=fem?0.02:0.08;
      if(j===8&&k===2&&!fem){p[0]*=1.04;}
      return p;};
    const HP=loft(hS,HD,12,j=>bald||j>1?'skin':null,{mod:hmod,cap0:bald?[0,6.0,-0.15]:false,cap1:[0,1.2,-0.35]});
    const gZ=(j,x)=>{// z on ring j at |x| via linear interpolation of the real (modified) grid vertices on the +X front quarter
      const R=HP[j];for(let i=0;i<3;i++){const a=R[i],b=R[i+1];if(x>=a[0]&&x<=b[0]){const t=(x-a[0])/((b[0]-a[0])||1);return lerp(a[2],b[2],t);}}return R[3][2];};
    const gZy=(x,y)=>{for(let j=0;j<HD.length-1;j++){if(y<=HD[j].y&&y>=HD[j+1].y){const t=(y-HD[j].y)/(HD[j+1].y-HD[j].y);return lerp(gZ(j,x),gZ(j+1,x),t);}}return gZ(5,x);};
    // nose
    {const zb=gZy(0,3.5),tipZ=gZy(0,2.85)+(fem?0.36:0.44),nl=[0.3,2.8,gZy(0.3,2.8)+0.06],nr=[-0.3,2.8,gZy(0.3,2.8)+0.06];const top=[0,3.62,zb+0.02],sl=[0.2,3.3,gZy(0.2,3.3)+0.04],sr=[-0.2,3.3,gZy(0.2,3.3)+0.04],tip=[0,2.82,tipZ],base=[0,2.66,gZy(0,2.66)+0.12];
      const ref=[0,3.0,1.2];[[top,sl,tip],[top,tip,sr],[sl,nl,tip],[sr,tip,nr],[nl,base,tip],[nr,tip,base]].forEach(t=>hS.t('skin',t[0],t[1],t[2],ref));}
    // eyes: dark almond lenses set in the sockets + upper-lid crease (skinD)
    [-1,1].forEach(s=>{const y=3.4,z=x=>gZ(5,x),pi=[s*0.3,y-0.01,z(0.3)+0.05],po=[s*0.96,y+0.05,z(0.96)+0.04],pt=[s*0.6,y+0.16,z(0.6)+0.07],pb=[s*0.64,y-0.13,z(0.64)+0.06],pc=[s*0.62,y+0.02,z(0.62)+0.12];
      const ref=[s*0.62,y,z(0.62)-0.5];[[pi,pt,pc],[pt,po,pc],[po,pb,pc],[pb,pi,pc]].forEach(t=>hS.t('eye',t[0],t[1],t[2],ref));
      const l1=[s*0.28,y+0.07,z(0.28)+0.05],l2=[s*0.6,y+0.23,z(0.6)+0.09],l3=[s*1.0,y+0.1,z(1.0)+0.03],l4=[s*0.62,y+0.33,gZy(0.62,y+0.33)+0.07];
      hS.t('skinD',l1,l2,l4,ref).t('skinD',l2,l3,l4,ref);
      // brow (hair colour) riding the brow ridge
      const b0=[s*0.24,3.74,gZy(0.24,3.74)+0.08],b1=[s*0.62,3.82+(fem?0.04:0),gZy(0.62,3.84)+0.1],b2=[s*1.08,3.74+(fem?0.02:-0.02),gZy(1.08,3.74)+0.07],c0=[s*0.24,3.62,gZy(0.24,3.62)+0.1],c1=[s*0.62,3.7,gZy(0.62,3.7)+0.13],c2=[s*1.05,3.64,gZy(1.05,3.64)+0.08];
      const bt=fem?0.06:0.1;b0[1]+=bt;b1[1]+=bt;b2[1]+=bt;hS.q('hair',b0,b1,c1,c0,[0,3.7,0]).q('hair',b1,b2,c2,c1,[0,3.7,0]);
      // ear
      const E=[[3.78,-0.25],[3.25,-0.78],[2.68,-0.45],[3.15,-0.05]].map(([y,zz],i)=>{const hx=rAt(HD,y).xp;return [s*(hx+0.12+0.22*(i===1?1:i===0||i===2?0.6:0)),y,zz];});
      const EI=E.map(p=>[s*(rAt(HD,p[1]).xp-0.08),p[1],p[2]+0.05]),ec=[s*(rAt(HD,3.2).xp+0.1),3.18,-0.35];
      for(let i=0;i<4;i++){const i2=(i+1)%4;hS.t('skin',ec,E[i],E[i2],[0,3.2,-0.35]);hS.q('skin',E[i],E[i2],EI[i2],EI[i],[s*0.4,3.2,-0.4]);}
      hS.t('skinD',[s*(rAt(HD,3.2).xp+0.16),3.4,-0.3],[s*(rAt(HD,3.0).xp+0.17),3.0,-0.42],[s*(rAt(HD,3.2).xp+0.17),3.1,-0.18],[0,3.2,-0.35]);});
    // lips
    {const lz=x=>gZ(7,x)+0.03,w=fem?0.4:0.44,up=[[-w,2.33,lz(w)-0.03],[0,2.38,lz(0)+0.07],[w,2.33,lz(w)-0.03],[0,2.29,lz(0)+0.1]],lo=[[-w*0.9,2.31,lz(w)-0.04],[0,2.27,lz(0)+0.08],[w*0.9,2.31,lz(w)-0.04],[0,2.12,lz(0)+(fem?0.05:0.01)]];
      const ref=[0,2.3,1.0];hS.t('skinD',up[0],up[1],up[3],ref).t('skinD',up[1],up[2],up[3],ref).t('skinD',lo[0],lo[1],lo[3],ref).t('skinD',lo[1],lo[2],lo[3],ref);
      if(fem)hS.t('skinD',[-w,2.3,lz(w)-0.02],[0,2.37,lz(0)+0.08],[0,2.42,lz(0)+0.02],ref).t('skinD',[w,2.3,lz(w)-0.02],[0,2.42,lz(0)+0.02],[0,2.37,lz(0)+0.08],ref);}
    // neck
    loft(hS,[RG(-1.0,.82*(fem?.85:1)*bw,.78,.84,{cz:-.05}),RG(0.5,.72*(fem?.85:1)*bw,.7,.78,{cz:-.1}),RG(1.9,.74*(fem?.88:1),.62,.82,{cz:-.2})],8,'skin');
    /* ----- hair ----- */
    let hairTail=null;if(!bald){const C=[0,3.25,-0.25];
      const hlArr=hs===1?[[0,4.62],[0.5,4.5],[1.1,4.15],[1.45,3.95],[1.7,3.4],[2.2,2.35],[PI,2.05]]:[[0,4.95],[0.55,4.7],[1.15,4.12],[1.45,3.95],[1.75,3.3],[2.2,2.3],[PI,fem?1.8:2.0]];
      const hl=u=>{const a=Math.abs(((u+PI)%TAU+TAU)%TAU-PI);for(let i=0;i<hlArr.length-1;i++){if(a<=hlArr[i+1][0]){const t=(a-hlArr[i][0])/(hlArr[i+1][0]-hlArr[i][0]);return lerp(hlArr[i][1],hlArr[i+1][1],t);}}return hlArr[hlArr.length-1][1];};
      const push=(p,d)=>{const v=[p[0]-C[0],p[1]-C[1],p[2]-C[2]],l=Math.hypot(...v)||1;return [p[0]+v[0]/l*d,p[1]+v[1]/l*d,p[2]+v[2]/l*d];};
      const N=12,R=5,hp=[];for(let k=0;k<=R;k++){const row=[];for(let i=0;i<N;i++){const u=TAU*i/N,f=k/R,y=lerp(5.95,hl(u),Math.pow(f,0.8));let d=lerp(0.34,0.16,f);
          if(hs===1){d+=0.25*hsh(i*7+k*3)*(k<R?1:0.3)+0.08;}else if(k<R){d+=0.1*hsh(i*5+k*11)+(k>0&&Math.cos(u)<0?0.12:0);}if(k===R)d=0.04;let p=push(headPt(u,y),d);if(k===R&&hs===1)p[1]-=0.25*hsh(i*5+1);if(k===R&&hs!==1)p[1]-=(Math.cos(u)>0.5?0.14:0.1)*hsh(i*3+2);row.push(p);}hp.push(row);}
      const hdS=soup(head),crown=[0,6.32+(hs===1?0.15:0),-0.35];for(let i=0;i<N;i++)hdS.t('hair',crown,hp[0][i],hp[0][(i+1)%N],C);
      for(let k=0;k<R;k++)for(let i=0;i<N;i++){const i2=(i+1)%N;hdS.q('hair',hp[k][i],hp[k][i2],hp[k+1][i2],hp[k+1][i],C);}
      if(hs===1){// messy tufts
        [[0.3,5.4],[-0.9,5.3],[1.3,5.0],[2.6,4.6],[-2.4,4.7],[3.1,4.0],[0.0,4.75],[-0.45,4.65]].forEach(([u,y],i)=>{const b=push(headPt(u,y),0.32),n=push(headPt(u,y-0.75),0.42+0.2*hsh(i)),dx=[Math.cos(u)*0.34,0,-Math.sin(u)*0.34];
          n[0]+=Math.sin(u)*0.15;n[2]+=Math.cos(u)*0.15;const a1=[b[0]+dx[0],b[1]+0.18,b[2]+dx[2]],a2=[b[0]-dx[0],b[1]+0.18,b[2]-dx[2]],a3=[b[0],b[1]-0.3,b[2]];hdS.t('hair',a1,a2,n,C).t('hair',a2,a3,n,C).t('hair',a3,a1,n,C);});}
      else{// tie at the back + ponytail (0) or braid (2)
        const tz=headPt(PI,2.75)[2]-0.25,len=fem?(hs===2?8.6:7.2):(hs===2?6.2:4.6);
        tube(hdS,'top2',[[0,2.92,tz+0.26],[0,2.62,tz-0.04]],5,[0.52,0.5],{cap0:false});
        const tail=new T.Group();tail.name='hairTail';const tp=[0,2.7,tz-0.05];tail.position.set(...tp);head.add(tail);hairTail=tail;const tS=soup(tail),rel=a=>a.map(p=>[p[0]-tp[0],p[1]-tp[1],p[2]-tp[2]]);
        if(hs===0){const pts=rel([[0,2.68,tz-0.1],[0,1.7,tz-0.42],[0,0.2,tz-0.42],[0,-len*0.45,tz-0.28],[0,-len*0.8,tz-0.18],[0,-len,tz-0.06]]);tube(tS,'hair',pts,6,[0.5,0.62,0.6,0.5,0.34,0.08],{cap0:false});}
        else{const n=7,pts=[],rad=[];for(let j=0;j<=n;j++){const f=j/n;pts.push([Math.sin(j*1.4)*0.08,lerp(2.6,-len,f),tz-0.25-Math.sin(f*PI)*0.3+(f>0.6?(f-0.6)*0.4:0)]);rad.push(j%2?[0.3,0.42]:[0.45,0.3]);}
          rad[0]=[0.45,0.45];rad[n]=[0.08,0.08];tube(tS,'hair',rel(pts),4,rad,{twist:0.5,cap0:false});tube(tS,'top2',rel([[0,-len+1.05,pts[n-1][2]],[0,-len+0.75,pts[n-1][2]]]),4,[0.36,0.36],{cap0:false,cap1:false});}}
    }
    if(beard){const bS=soup(head),C=[0,2.4,-0.1],cols=9,bt=[[0,2.02],[0.42,2.22],[0.62,2.5],[1.0,2.85],[1.45,3.25],[1.85,3.4]],btop=a=>{a=Math.abs(a);for(let i=0;i<bt.length-1;i++)if(a<=bt[i+1][0]){const t=(a-bt[i][0])/(bt[i+1][0]-bt[i][0]);return lerp(bt[i][1],bt[i+1][1],t);}return 3.4;};
      const BP=[];const rows=3;for(let k=0;k<=rows;k++){const row=[];for(let i=0;i<=cols;i++){const u=lerp(-1.85,1.85,i/cols),f=k/rows,y=lerp(btop(u),1.04,f);let p=headPt(u,y);const v=[p[0]-C[0],p[1]-C[1],p[2]-C[2]],l=Math.hypot(...v);
          const d=k===0?0.04:0.12+0.12*f*Math.cos(u*0.7)+0.07*hsh(i*3+k);p=[p[0]+v[0]/l*d,p[1]+v[1]/l*d,p[2]+v[2]/l*d];if(k===rows){p[1]-=0.3*Math.max(0,Math.cos(u*0.9));p[2]+=0.1*Math.cos(u);}row.push(p);}BP.push(row);}
      for(let k=0;k<rows;k++)for(let i=0;i<cols;i++)bS.q('hair',BP[k][i],BP[k][i+1],BP[k+1][i+1],BP[k+1][i],C);
      const uc=[0,1.25,-0.15];for(let i=0;i<cols;i++)bS.t('hair',uc,BP[rows][i],BP[rows][i+1],[0,2.4,-0.4]);
      // moustache
      const mz=x=>gZ(7,x),m=[[-0.6,2.26,mz(0.6)+0.03],[-0.3,2.5,mz(0.3)+0.12],[0,2.52,mz(0)+0.15],[0.3,2.5,mz(0.3)+0.12],[0.6,2.26,mz(0.6)+0.03]],mb=[[-0.52,2.3,mz(0.5)+0.06],[-0.28,2.39,mz(0.28)+0.14],[0,2.42,mz(0)+0.17],[0.28,2.39,mz(0.28)+0.14],[0.52,2.3,mz(0.5)+0.06]];
      m.forEach((p,i)=>{p[1]+=0.06;});for(let i=0;i<4;i++)bS.q('hair',m[i],m[i+1],mb[i+1],mb[i],[0,2.4,0.5]);}
    /* ===== TORSO ===== */
    const X=(v)=>v*bw,ZZ=v=>v*bz;
    const TRd=fem?[[-2.6,2.35,1.3,1.32],[0,2.05,1.25,1.15],[2.3,2.35,1.45,1.3],[4.6,2.68,2.0,1.45],[6.4,2.9,1.72,1.5],[7.75,2.88,1.18,1.3],[8.7,2.42,.84,1.02],[9.3,1.35,.66,.82],[9.6,.82,.58,.72]]
                 :[[-2.6,2.5,1.38,1.36],[0,2.36,1.4,1.25],[2.3,2.64,1.55,1.4],[4.6,2.98,1.8,1.56],[6.4,3.28,1.68,1.62],[7.75,3.25,1.25,1.42],[8.75,2.75,.92,1.12],[9.35,1.55,.72,.9],[9.65,.92,.6,.75]];
    const TR=TRd.map(r=>RG(r[0],X(r[1]),ZZ(r[2]),ZZ(r[3]),{cz:r[0]>9?-0.1:0}));
    const tS=soup(torso),tk=hasTop?'top':'skin';
    loft(tS,TR,10,j=>tk,{cap1:[0,9.65,-0.1],mod:(j,i,p)=>{const k=i>5?10-i:i;if(!fem&&(j===3||j===4)&&k===1)p[2]+=0.14;if(fem&&j===3){if(k===1)p[2]+=0.32;if(k===0)p[2]+=0.02;if(k===2)p[2]+=0.1;}if(fem&&j===2&&k===1)p[2]+=0.08;
      if(j>=2&&j<=4&&k===5)p[2]+=0.14;if(!hasTop&&!fem&&j===1&&k===0)p[2]-=0.05;return p;}});
    if(hasTop){// neckline trim
      {const a=rAt(TR,8.85),b=rAt(TR,9.3);loft(tS,[RG(8.85,a.xp+.06,a.zf+.06,a.zb+.06,{cz:a.cz}),RG(9.3,b.xp+.06,b.zf+.06,b.zb+.06,{cz:b.cz})],10,'top2');}}
    else if(!fem){// bare chest: nipples + navel hint
      [-1,1].forEach(s=>tS.t('skinD',[s*1.45,4.75,ZZ(1.8)+0.05],[s*1.25,4.55,ZZ(1.8)+0.07],[s*1.6,4.5,ZZ(1.78)+0.06],[0,4.6,0]));}
    /* ===== PELVIS / CLOTHES ON HIPS ===== */
    const pS=soup(hips),PR=[[3.7,2.42,1.36,1.32],[2.1,2.72,1.42,1.5],[0.6,2.88,1.38,1.75],[-0.8,2.62,1.2,1.62],[-1.75,1.3,.75,.95]].map((r,j)=>RG(r[0],X(r[1]+(fem&&j>=1&&j<=3?0.32:0)),ZZ(r[2]),ZZ(r[3]+(fem&&j===2?0.12:0))));
    loft(pS,PR,12,j=>hasTop&&j<2?null:'bot',{cap1:[0,-1.95,-0.1]});
    let outer=PR;
    if(hasTop){const L=fem?-1.7:-0.4,HM=[RG(3.45,X(2.6+F*.1),ZZ(1.5),ZZ(1.47)),RG(1.6,X(3.02+F*.3),ZZ(1.62),ZZ(1.77+F*.1)),RG(L,X(3.24+F*.3),ZZ(1.76),ZZ(2.0+F*.1))];
      loft(pS,HM,12,'top',{mod:(j,i,p)=>{if(j===2){p[1]-=0.55*hsh(i*3.1);p[0]*=1+0.04*hsh(i+7);p[2]*=1+0.04*hsh(i+9);}return p;}});outer=HM;}
    {const by=3.05,r0=rAt(outer,by),r1=rAt(outer,by+0.6),BL=[RG(by,r0.xp+.08,r0.zf+.08,r0.zb+.08),RG(by+0.6,r1.xp+.08,r1.zf+.08,r1.zb+.08)];loft(pS,BL,10,'top2');
      // knot + pouch
      const fz=r0.zf+0.08;pS.q('top2',[-0.3,by+0.75,fz+0.05],[0.3,by+0.75,fz+0.05],[0.36,by-0.1,fz+0.12],[-0.25,by-0.15,fz+0.12],[0,by+0.3,0]);
      pS.t('top2',[0.1,by-0.05,fz+0.12],[0.4,by-0.05,fz+0.1],[0.45,by-1.4,fz+0.02],[0,by,0]).t('top2',[0.1,by-0.05,fz+0.12],[0.45,by-1.4,fz+0.02],[0.2,by-1.2,fz+0.05],[0,by,0]);
      const px=X(2.15),pz=1.25;tube(pS,'top2',[[px,by-0.05,pz],[px+0.1,by-0.75,pz+0.2],[px+0.05,by-1.55,pz+0.12]],4,[[0.42,0.25],[0.62,0.42],[0.3,0.2]]);}
    /* ===== LIMBS ===== */
    const R={root:G,hips,torso,head,neck:head};if(hairTail)R.hair=hairTail;
    const mkArm=(s)=>{const nm=s<0?'L':'R',arm=new T.Group(),fore=new T.Group(),hand=new T.Group();arm.name='arm'+nm;fore.name='fore'+nm;hand.name='hand'+nm;
      arm.position.set(s*SH,7.85,-0.1);torso.add(arm);fore.position.set(0,-6.6,0);arm.add(fore);hand.position.set(0,-5.3,0);fore.add(hand);
      const ab=fem?0.86:1,m=bw,aS=soup(arm),fS=soup(fore),hS2=soup(hand),uk=sleeves?'top':'skin';
      // upper arm: deltoid → biceps → elbow
      const AR=[RG(1.02,.42*ab*m,.42*ab*m,.45*ab*m,{cx:s*0.05}),RG(0.72,.86*ab*m,.84*ab*m,.86*ab*m,{cx:s*0.12}),RG(-0.1,1.1*ab*m,1.02*ab*m,1.02*ab*m,{cx:s*0.24}),RG(-1.6,1.04*ab*m,0.98*ab*m,0.98*ab*m,{cx:s*0.22}),RG(-3.4,.86*ab*m,.98*ab*m,.9*ab*m,{cx:s*0.08}),RG(-5.6,.74*ab,.78*ab,.8*ab),RG(-6.6,.68*ab,.7*ab,.74*ab),RG(-7.0,.62*ab,.62*ab,.66*ab)];
      if(sleeves){AR.splice(6,0,RG(-5.2,.95*ab,1.0*ab,1.0*ab),RG(-5.25,.74*ab,.78*ab,.8*ab));}
      const slEnd=sleeves?6:-1;loft(aS,AR,7,j=>j<slEnd?'top':'skin',{cap0:[s*0.05,1.1,0],mod:(j,i,p)=>{if(sleeves&&j===6){p[1]-=0.35*hsh(i*2.3+s);}return p;}});
      // forearm
      const FR=[RG(0.5,.66*ab,.66*ab,.7*ab),RG(-1.3,.8*ab*m,.84*ab*m,.82*ab*m),RG(-3.4,.6*ab*m,.66*ab*m,.64*ab),RG(-5.0,.38*ab,.52*ab,.5*ab),RG(-5.5,.36*ab,.48*ab,.46*ab)];
      if(longSl){FR.splice(3,0,RG(-4.3,.66*ab,.74*ab,.72*ab),RG(-4.35,.5*ab,.6*ab,.58*ab));}
      loft(fS,FR,7,j=>longSl&&j<3?'top':'skin');ball(fS,longSl?'top':'skin',[0,0,-0.04],0.66*ab,6,3);
      // fist: back-of-hand block + two curled finger pairs + thumb (x' = lateral). Rod (grip) runs along Z through (0,-1.75)
      const hb=fem?0.92:1,x=v=>s*v*hb,HB=[[0.3,-0.28,0.3,-0.48,0.48],[-0.8,-0.42,0.5,-0.76,0.76],[-1.75,-0.05,0.56,-0.8,0.8]];
      const hp=HB.map(([y,x0,x1,z0,z1])=>[[x(x0),y*hb,z0*hb],[x(x1),y*hb,z0*hb],[x(x1),y*hb,z1*hb],[x(x0),y*hb,z1*hb]]);
      for(let j=0;j<2;j++)for(let i=0;i<4;i++){const i2=(i+1)%4;hS2.q('skin',hp[j][i],hp[j][i2],hp[j+1][i2],hp[j+1][i],[0,(HB[j][0]+HB[j+1][0])/2*hb,0]);}
      hS2.q('skin',...hp[0],[0,-1,0]).q('skin',...hp[2],[0,-0.5,0]);
      const finger=(z0,z1,ro,ri,a1)=>{const A=[0.15,-0.9,-1.8,a1],cy=-1.75,P=A.map((a,j)=>{const r0=ri,r1=ro-(j>2?0.12:0);return [[x(Math.cos(a)*r0),(cy+Math.sin(a)*r0)*hb,z0*hb],[x(Math.cos(a)*r1),(cy+Math.sin(a)*r1)*hb,z0*hb],[x(Math.cos(a)*r1),(cy+Math.sin(a)*r1)*hb,z1*hb],[x(Math.cos(a)*r0),(cy+Math.sin(a)*r0)*hb,z1*hb]];});
        for(let j=0;j<3;j++){const am=(A[j]+A[j+1])/2,c=[x(Math.cos(am)*(ri+ro)/2),(cy+Math.sin(am)*(ri+ro)/2)*hb,(z0+z1)/2*hb];for(let i=0;i<4;i++){const i2=(i+1)%4;hS2.q('skin',P[j][i],P[j][i2],P[j+1][i2],P[j+1][i],c);}}
        hS2.q('skin',...P[3],[x(0),cy*hb,(z0+z1)/2*hb]);};
      {const c=-1.75*hb,r=0.56*hb,z0=-0.74*hb,z1=0.78*hb,Q=[[-r,-r],[r,-r],[r,r],[-r,r]],A=Q.map(([a,b])=>[x(a),c+b,z0]),B=Q.map(([a,b])=>[x(a),c+b,z1]),cc=[0,c,0];
        for(let i=0;i<4;i++){const i2=(i+1)%4;hS2.q('skin',A[i],A[i2],B[i2],B[i],cc);}hS2.q('skin',...A,[0,c,1]).q('skin',...B,[0,c,-1]);}
      finger(0.04,0.82,1.0,0.5,-3.75);finger(-0.78,-0.02,0.9,0.48,-3.6);
      tube(hS2,'skin',[[x(0.18),-0.45*hb,0.55*hb],[x(-0.4),-1.55*hb,0.98*hb]],4,[0.3*hb,0.21*hb],{cap0:false});
      R['arm'+nm]=arm;R['fore'+nm]=fore;R['hand'+nm]=hand;};
    mkArm(-1);mkArm(1);
    const mkLeg=(s)=>{const nm=s<0?'L':'R',leg=new T.Group(),shin=new T.Group(),foot=new T.Group();leg.name='leg'+nm;shin.name='shin'+nm;foot.name='foot'+nm;
      leg.position.set(s*HX,0,0);hips.add(leg);shin.position.set(0,-8.1,0);leg.add(shin);foot.position.set(0,-8.0,0);shin.add(foot);
      const lb=fem?0.94:1,m=Math.sqrt(bw),lS=soup(leg),sS=soup(shin),fS=soup(foot);
      const TH=[RG(1.3,1.5*lb*m,1.45*lb*m,1.5*lb*m),RG(-0.9,1.62*lb*m,1.5*lb*m,1.55*lb*m,{cx:s*0.12}),RG(-3.6,1.4*lb*m,1.48*lb*m,1.32*lb*m,{cx:s*0.05}),RG(-6.4,1.08*lb*m,1.12*lb*m,1.04*lb*m),RG(-8.1,.95*lb,.98*lb,.95*lb),RG(-8.5,.9*lb,.9*lb,.9*lb)];
      loft(lS,TH,8,j=>j<2?null:'skin');
      // wrap-skirt panel (follows the thigh so legs never poke through)
      const inn=1.62*lb*m,out=2.12*lb*m+(fem?0.25:0),SKd=[[1.15,inn-0.1,out-0.2,1.72,1.85,0.22],[-1.6,inn,out,1.85,2.0,0.28],[fem?-6.2:-4.4,inn+0.06,out+0.12,1.98,2.14,0.33]];
      const SK=SKd.map(([y,i,o2,zf,zb,c])=>RG(y,s<0?o2*lb:i*lb,s<0?i*lb:o2*lb,zf*lb*m,zb*lb*m,{cx:s*c}));
      loft(lS,SK,10,'bot',{mod:(j,i,p)=>{if(j===2){p[1]-=0.6*hsh(i*1.7+s*3);}return p;}});
      ball(sS,'skin',[0,0,0.05],0.98*lb,6,3);
      const bt=!!boots,SHd=[[0.55,.95,.98,.95],[-2.4,1.05,.88,1.42],[-4.6,.86,.74,1.0],[-6.6,.66,.66,.72],[-7.9,.58,.6,.6],[-8.4,.56,.56,.56]];
      const SHr=SHd.map(([y,a,zf,zb],j)=>RG(y,a*lb*m+(bt&&j>=2?0.12:0),zf*lb*m+(bt&&j>=2?0.12:0),zb*lb*m+(bt&&j>=2?0.12:0),{cz:j===1?-0.12:0}));
      loft(sS,SHr,8,j=>bt&&j>=2?'boot':'skin',{mod:(j,i,p)=>{if(bt&&j===2)p[1]+=0.25*hsh(i+s);return p;}});
      // foot (rings along +Z; ring.y = z, cz = height centre)
      const g=bt?0.12:0,FT=[[-1.3,.5,-0.95,.45,.52],[-0.55,.62,-0.62,.95,.88],[1.3,.78,-0.95,.6,.55],[3.0,.88,-1.2,.32,.3],[4.15,.72,-1.3,.2,.2]].map(([z,w,cy,tp,bm])=>RG(z,(w+g)*lb,tp+g,bm,{cz:cy,p:3}));
      loft(fS,FT,6,bt?'boot':'skin',{map:p=>[p[0],p[2],p[1]],u:(j,i)=>TAU*i/6+PI/6,cap0:true,cap1:true});
      if(!bt){// toes hint
        fS.t('skinD',[0.0*lb,-1.12,4.17],[0.32*lb,-1.14,4.12],[0.16*lb,-1.4,4.25],[0,-1.3,3.5]);}
      R['leg'+nm]=leg;R['shin'+nm]=shin;R['foot'+nm]=foot;};
    mkLeg(-1);mkLeg(1);
    /* ===== CLOAK (fur cape on torso) ===== */
    if(cloak){const cl=new T.Group();cl.name='cloak';const cp=[0,8.7,-1.1];cl.position.set(...cp);torso.add(cl);const cS=soup(cl);
      const rows=[[9.55,1.45,1.05,1.3,60,300],[9.0,X(3.95),1.3,ZZ(1.85),75,285],[7.0,X(4.85),1.0,ZZ(2.2),95,265],[2.5,X(4.45),0.8,ZZ(2.4),108,252],[-4.6,X(4.6),0.8,ZZ(2.8),110,250]];
      const n=7,P=rows.map(([y,hx,zf,zb,a0,a1],j)=>{const r=RG(y,hx,zf,zb,{p:2.2});const row=[];for(let i=0;i<=n;i++){const u=(a0+(a1-a0)*i/n)*PI/180;const p=rp(r,u);if(j===4)p[1]-=0.9*hsh(i*2.7);if(j>=2)p[2]-=0.12*hsh(i+j*5);row.push([p[0]-cp[0],p[1]-cp[1],p[2]-cp[2]]);}return row;});
      for(let j=0;j<P.length-1;j++){const c=[0,(rows[j][0]+rows[j+1][0])/2-cp[1],-cp[2]];for(let i=0;i<n;i++)cS.q('cloak',P[j][i],P[j][i+1],P[j+1][i+1],P[j+1][i],c);}
      // fur collar
      loft(cS,[RG(8.5-cp[1],X(3.45),ZZ(1.4),ZZ(2.0),{cz:-cp[2]}),RG(9.45-cp[1],X(2.05),ZZ(1.3),ZZ(1.65),{cz:-cp[2]}),RG(10.0-cp[1],1.35,1.12,1.3,{cz:-0.12-cp[2]})],10,'cloak2',{mod:(j,i,p)=>{if(j===1){const f=1+0.14*hsh(i*3.3);p[0]*=f;p[2]=(p[2]+cp[2])*f-cp[2];p[1]+=0.25*hsh(i+2);}return p;}});
      R.cloak=cl;}
    /* ===== materials: collect keys, merge to ≤8, build meshes ===== */
    const keys=new Set();parts.forEach(([S])=>Object.keys(S.m).forEach(k=>keys.add(k)));
    const map={};keys.forEach(k=>map[k]=k);const distinct=()=>new Set(Object.values(map).map(k=>COL[k])).size;
    for(const [a,b] of MERGE){if(distinct()<=8)break;Object.keys(map).forEach(k=>{if(map[k]===a)map[k]=b;});}
    const MATF=k=>{const kk=map[k]||k;return K.mat(COL[kk],kk==='cloak'?{side:T.DoubleSide}:undefined);};
    parts.forEach(([S,grp])=>S.to(grp,MATF));
    /* ===== attach points ===== */
    const topM=new T.Group();topM.position.set(0,6.1,-0.2);head.add(topM);const face=new T.Group();face.position.set(0,3.4,1.75);head.add(face);
    const back=new T.Group();back.position.set(0,4.5,-1.9);torso.add(back);
    Object.assign(R,{face,top:topM,back,dims:{h,up:6.6,fore:5.3,thigh:8.1,shin:8.0,hipY:17.6,hipX:HX,sh:SH},headR:2.6*h,headY:(17.6+3.2+9.3+3.4)*h});
    G.userData.rig=R;G.userData.char2=true;
    neutral(R);return G;};
  /* =================================== POSES =================================== */
  const V=(x,y,z)=>new T.Vector3(x,y,z);
  function neutral(R){const d=R.dims;R.hips.position.set(0,d.hipY*d.h,0);R.hips.rotation.set(0,0,0);R.torso.rotation.set(0,0,0);R.torso.scale.set(1,1,1);R.head.rotation.set(0,0,0);
    R.armL.rotation.set(0,0,-0.07);R.armR.rotation.set(0,0,0.07);R.foreL.rotation.set(-0.12,0,0);R.foreR.rotation.set(-0.12,0,0);R.handL.rotation.set(0,0,0);R.handR.rotation.set(0,0,0);
    R.legL.rotation.set(0,0,-0.02);R.legR.rotation.set(0,0,0.02);R.shinL.rotation.set(0,0,0);R.shinR.rotation.set(0,0,0);R.footL.rotation.set(0,-0.1,0);R.footR.rotation.set(0,0.1,0);
    if(R.cloak)R.cloak.rotation.set(0,0,0);if(R.hair)R.hair.rotation.set(0,0,0);}
  const chainM=(R,obj)=>{const a=[];let o=obj;while(o&&o!==R.root){a.push(o);o=o.parent;}const m=new T.Matrix4();for(let i=a.length-1;i>=0;i--){a[i].updateMatrix();m.multiply(a[i].matrix);}return m;};
  const chainQ=(R,obj)=>{const a=[];let o=obj;while(o&&o!==R.root){a.push(o);o=o.parent;}const q=new T.Quaternion();for(let i=a.length-1;i>=0;i--)q.multiply(a[i].quaternion);return q;};
  const toL=(R,par,p)=>p.clone().applyMatrix4(chainM(R,par).invert()),dirL=(R,par,d)=>d.clone().applyQuaternion(chainQ(R,par).invert());
  const posOf=(R,obj,local)=>(local||V(0,0,0)).clone().applyMatrix4(chainM(R,obj));
  function solve2(up,lo,t,L1,L2,pole,sg){const d=t.clone().sub(up.position);let dist=d.length();if(dist<1e-4){d.set(0,-1,0);dist=1e-4;}
    const D=clamp(dist,Math.abs(L1-L2)+0.05,(L1+L2)*0.9995),cg=clamp((L1*L1+L2*L2-D*D)/(2*L1*L2),-1,1),beta=PI-Math.acos(cg);
    lo.rotation.set(sg*beta,0,0);const w=V(0,-L1-L2*Math.cos(beta),-L2*Math.sin(sg*beta)).normalize(),tn=d.normalize(),q=new T.Quaternion().setFromUnitVectors(w,tn);
    if(pole&&beta>0.02){const e=V(0,-L1,0).applyQuaternion(q);e.addScaledVector(tn,-e.dot(tn));const p=pole.clone();p.addScaledVector(tn,-p.dot(tn));
      if(e.lengthSq()>1e-6&&p.lengthSq()>1e-6){e.normalize();p.normalize();const ang=Math.atan2(V(0,0,0).crossVectors(e,p).dot(tn),e.dot(p));q.premultiply(new T.Quaternion().setFromAxisAngle(tn,ang));}}
    up.quaternion.copy(q);}
  const S_=s=>s<0?'L':'R';
  // wrist → root-space point; pole = root-space direction the elbow should point
  function armTo(R,s,w,pole){const n=S_(s),h=R.dims.h;solve2(R['arm'+n],R['fore'+n],toL(R,R.torso,w.clone().multiplyScalar(h)),R.dims.up,R.dims.fore,dirL(R,R.torso,pole||V(s*0.6,-0.2,-1)),-1);R['hand'+n].rotation.set(0,0,0);}
  // put the fist's grip on root-space point g, rod (tool handle) along hd, blade/strike face along bd
  function gripTo(R,s,g,hd,bd,pole){const n=S_(s),h=R.dims.h,qT=chainQ(R,R.torso).invert(),z=hd.clone().normalize().applyQuaternion(qT),y=bd.clone().normalize().negate().applyQuaternion(qT);
    y.addScaledVector(z,-y.dot(z));if(y.lengthSq()<1e-6)y.set(0,1,0);y.normalize();const x=V(0,0,0).crossVectors(y,z),qD=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(x,y,z));
    const gl=toL(R,R.torso,g.clone().multiplyScalar(h)),w=gl.sub(GRIP.clone().applyQuaternion(qD));const arm=R['arm'+n],fore=R['fore'+n];
    solve2(arm,fore,w,R.dims.up,R.dims.fore,dirL(R,R.torso,pole||V(s*0.7,-0.3,-0.8)),-1);R['hand'+n].quaternion.copy(arm.quaternion.clone().multiply(fore.quaternion).invert().multiply(qD));}
  function legTo(R,s,a,pole){const n=S_(s),h=R.dims.h;solve2(R['leg'+n],R['shin'+n],toL(R,R.hips,a.clone().multiplyScalar(h)),R.dims.thigh,R.dims.shin,dirL(R,R.hips,pole||V(s*0.15,0,1)),1);}
  function footTo(R,s,pitch,yaw,roll){const n=S_(s),q=new T.Quaternion().setFromEuler(new T.Euler(pitch||0,yaw==null?s*0.1:yaw,roll||0));R['foot'+n].quaternion.copy(chainQ(R,R['shin'+n]).invert().multiply(q));}
  const hipsAt=(R,x,y,z)=>{const h=R.dims.h;R.hips.position.set(x*h,y*h,z*h);};
  const cloakHang=(R,k)=>{if(R.cloak)R.cloak.rotation.x=-(R.torso.rotation.x+R.hips.rotation.x)*(k==null?0.35:k);};
  const stand=(R,y,fl,fr)=>{legTo(R,-1,fl,V(-0.1,0,1));legTo(R,1,fr,V(0.1,0,1));footTo(R,-1,0);footTo(R,1,0);};
  // poses that kneel / sit
  const kneel=(R,y,spread)=>{// both knees on the ground; y = hips height
    hipsAt(R,0,y,0);[-1,1].forEach(s=>{const n=S_(s),a=Math.acos(clamp((y-1.0)/8.1,-1,1));R['leg'+n].rotation.set(-a,0,s*(spread||0.12));R['shin'+n].rotation.set(PI/2+a-0.06,0,0);R['foot'+n].rotation.set(1.45,0,0);});};
  const crossLegs=(R)=>{hipsAt(R,0,2.4,-0.6);legTo(R,-1,V(1.3,1.3,3.8),V(-1,0.7,0.3));legTo(R,1,V(-1.4,1.65,3.0),V(1,0.7,0.3));footTo(R,-1,-0.3,1.25,0.9);footTo(R,1,-0.3,-1.25,-0.9);};
  const cyc=(t,per)=>((t/per)%1+1)%1;
  // lower/raise the hips so the lowest sole touches y=0 (feet assumed roughly flat: sole ≈ 1.45 below the ankle, toe/heel tips via foot pitch)
  const snap=(R)=>{let m=1e9;['L','R'].forEach(n=>{const f=R['foot'+n],a=posOf(R,f),q=chainQ(R,f);[V(0,-1.45,-1.2),V(0,-1.45,4.1)].forEach(p=>{const w=p.clone().multiplyScalar(R.dims.h).applyQuaternion(q).add(a);m=Math.min(m,w.y);});});R.hips.position.y-=m;};
  const PO={};
  PO.idle=(R,t,o)=>{const b=Math.sin(t*2.1),w=Math.sin(t*0.31);R.torso.rotation.x=0.02+b*0.01;R.torso.scale.y=1+b*0.008;R.head.rotation.set(0.04+Math.sin(t*0.53)*0.03,Math.sin(t*0.23)*0.18,0);
    R.hips.rotation.z=w*0.025;R.hips.position.x=-w*0.25*R.dims.h;R.torso.rotation.z=-w*0.03;R.legL.rotation.z=-0.02-w*0.025;R.legR.rotation.z=0.02-w*0.025;
    R.armL.rotation.x=0.03+b*0.03;R.armR.rotation.x=0.05-b*0.03;R.armL.rotation.z=-0.045;R.armR.rotation.z=0.05;R.foreL.rotation.x=-0.24;R.foreR.rotation.x=-0.3;carry(R,o,0);};
  function carry(R,o,sw){const tl=o&&o.tool;if(tl==='torch'){R.armR.rotation.set(-0.55+sw*0.05,0,0.12);R.foreR.rotation.set(-1.0,0,0);R.handR.rotation.set(0.02,0,0);}
    else if(tl==='spear'){R.armR.rotation.set(-0.12+sw*0.1,0,0.12);R.foreR.rotation.set(-1.4,0,0);R.handR.rotation.set(0,0,0);}
    else if(tl){R.foreR.rotation.x=Math.min(R.foreR.rotation.x,-0.3);R.handR.rotation.x=0.25;}}
  const gait=(R,ph,A,K,ab,ae,bob,lean)=>{const f=TAU*ph,s=Math.sin(f),c=Math.cos(f);
    [-1,1].forEach(sd=>{const n=S_(sd),ss=sd<0?s:-s,cc=sd<0?c:-c;const lx=-A*ss;R['leg'+n].rotation.x=lx;const sh=0.08+K*Math.pow(Math.max(0,cc),1.6)+(K*0.12)*Math.max(0,-cc)*Math.max(0,ss);R['shin'+n].rotation.x=sh;
      R['foot'+n].rotation.x=-(lx+sh)*0.85+(cc<0&&ss<0?0.3*(-ss):0);R['arm'+n].rotation.x=ab*ss;R['fore'+n].rotation.x=-ae-ae*0.6*Math.max(0,-ss);});
    R.hips.position.y=R.dims.h*R.dims.hipY;R.hips.rotation.y=0.08*s;R.torso.rotation.y=-0.13*s;R.head.rotation.y=0.05*s;R.torso.rotation.x=lean;R.head.rotation.x=-lean*0.5;snap(R);};
  PO.walk=(R,t,o)=>{gait(R,t,0.5,0.95,0.38,0.22,0.45,0.04);carry(R,o,Math.sin(TAU*t));};
  PO.run=(R,t,o)=>{gait(R,t,0.78,1.9,0.75,1.25,1.1,0.24);R.hips.position.y+=R.dims.h*0.9*Math.pow(Math.abs(Math.sin(TAU*t*2+0.6)),2);carry(R,o,0);};
  PO.sneak=(R,t,o)=>{const f=TAU*t;hipsAt(R,0,14.4+0.25*Math.cos(2*f),0);R.hips.rotation.x=0.12;R.torso.rotation.x=0.45;R.head.rotation.x=-0.45;
    [-1,1].forEach(s=>{const p=s<0?f:f+PI,sw=Math.sin(p),lift=Math.max(0,Math.cos(p));legTo(R,s,V(s*2.0,1.5+lift*1.8,3.2*sw+0.6),V(s*0.2,0,1));footTo(R,s,lift*-0.2);});
    R.armL.rotation.set(-0.35+0.15*Math.sin(f),0,-0.15);R.armR.rotation.set(-0.35-0.15*Math.sin(f),0,0.15);R.foreL.rotation.x=-0.9;R.foreR.rotation.x=-0.9;cloakHang(R);};
  PO.sit=(R,t,o)=>{crossLegs(R);const b=Math.sin(t*2);R.torso.rotation.x=0.12+b*0.01;R.torso.scale.y=1+b*0.008;R.head.rotation.set(0.1,Math.sin(t*0.3)*0.2,0);
    armTo(R,-1,V(-4.6,6.0,4.4),V(-1,-0.2,-0.6));armTo(R,1,V(4.6,6.0,4.4),V(1,-0.2,-0.6));R.handL.rotation.set(0.3,0,-0.3);R.handR.rotation.set(0.3,0,0.3);cloakHang(R);};
  // overhead two-handed swing (axe / pick). hits: y,z of the strike point of the hands
  const swing=(R,k,C,r,aUp,aHit,lean,drop)=>{let a;if(k<0.5)a=lerp(aHit-0.35,aUp,ss(k/0.5));else if(k<0.66)a=lerp(aUp,aHit,Math.pow((k-0.5)/0.16,1.6));else a=lerp(aHit,aHit-0.35,ss((k-0.72)/0.28));
    const wind=k<0.5?ss(k/0.5):k<0.66?1-(k-0.5)/0.16:0,hit=k>=0.6&&k<0.8?1-Math.abs(k-0.68)/0.1:0;
    hipsAt(R,0,17.1-drop*Math.max(0,hit)-0.3*wind,-0.3);R.torso.rotation.x=lerp(lean,-0.15,wind);R.head.rotation.x=lerp(lean*0.6,-0.25,wind);R.torso.rotation.y=-0.1;
    stand(R,0,V(-2.1,1.5,2.6),V(2.1,1.5,-2.2));
    const rad=V(0,Math.cos(a),Math.sin(a)),tan=V(0,-Math.sin(a),Math.cos(a)),gR=C.clone().addScaledVector(rad,r).add(V(0.5,0,0)),gL=gR.clone().addScaledVector(rad,-3.4).add(V(-0.7,0,0));
    gripTo(R,1,gR,rad,tan,V(1,-0.4,-0.5));gripTo(R,-1,gL,rad,tan,V(-1,-0.4,-0.4));cloakHang(R);};
  PO.chop=(R,t,o)=>swing(R,o&&o.phase!=null?o.phase:cyc(t,(o&&o.per)||1.0),V(0,25.5,1.5),7.0,-0.55,2.0,0.32,0.9);
  PO.mine=(R,t,o)=>swing(R,o&&o.phase!=null?o.phase:cyc(t,(o&&o.per)||1.1),V(0,24,2.5),6.8,-0.4,2.55,0.75,1.8);
  PO.knap=(R,t,o)=>{const k=o&&o.phase!=null?o.phase:cyc(t,0.45);kneel(R,5.6,0.2);R.torso.rotation.x=0.38;R.head.rotation.x=0.5;
    const dn=k<0.25?Math.pow(k/0.25,2):1-ss((k-0.25)/0.75);// 1 = striking
    gripTo(R,-1,V(-0.6,10.6,8.0),V(0.6,0.2,1),V(0.3,1,0),V(-1,-0.4,-0.3));
    gripTo(R,1,V(lerp(1.4,0.45,dn),lerp(14.2,11.9,dn),lerp(7.0,7.9,dn)),V(-0.3,0,1),V(-0.4,-1,0.1),V(1,-0.2,-0.6));cloakHang(R);};
  PO.grind=(R,t,o)=>{const k=o&&o.phase!=null?o.phase:cyc(t,1.3),s=Math.sin(TAU*k);kneel(R,8.6,0.22);R.hips.position.z=0.5*s*R.dims.h;R.hips.rotation.x=0.18+0.06*s;R.torso.rotation.x=0.72+0.12*s;R.head.rotation.x=0.05;
    [-1,1].forEach(sd=>gripTo(R,sd,V(sd*1.05,4.6,10.2+2.6*s),V(sd>0?-1:1,0,0.1),V(0,-1,0.35),V(sd*1,0.3,-0.4)));cloakHang(R,0.3);};
  PO.whittle=(R,t,o)=>{const k=o&&o.phase!=null?o.phase:cyc(t,0.85);crossLegs(R);R.torso.rotation.x=0.32;R.head.rotation.x=0.55;R.head.rotation.y=-0.1;
    const st=k<0.55?ss(k/0.55):1-ss((k-0.55)/0.45),lift=k<0.55?0:Math.sin((k-0.55)/0.45*PI);
    gripTo(R,-1,V(-0.9,8.6,6.6),V(0.35,0.45,1),V(1,0,0),V(-1,-0.3,-0.2));
    gripTo(R,1,V(lerp(1.3,0.4,st),lerp(11.0,9.6,st)+lift*0.8,lerp(11.6,8.6,st)),V(-1,0.15,0.15),V(0,0.35,-1),V(1,-0.4,-0.3));cloakHang(R);};
  PO.carve=(R,t,o)=>{const k=o&&o.phase!=null?o.phase:cyc(t,0.55);kneel(R,8.4,0.25);R.hips.rotation.x=0.1;R.torso.rotation.x=0.42;R.head.rotation.x=0.45;
    const dn=k<0.22?Math.pow(k/0.22,2):1-ss((k-0.22)/0.78);
    gripTo(R,-1,V(-0.5,9.2,8.6),V(0,1,0.05),V(0,0,1),V(-1,-0.2,-0.4));
    const L=(o&&o.len)||7,top=V(-0.45,10.9,8.6),a=lerp(0.35,-0.75,dn),hd=V(-0.62*Math.cos(a),Math.sin(a)*0.9-0.1,0.55*Math.cos(a)+0.1).normalize(),hit=V(-0.62,-0.45,0.55).normalize();
    const g=top.clone().addScaledVector(hit,-L).lerp(top.clone().addScaledVector(hit,-L).add(V(0.6,3.2,-0.8)),1-dn);// raised: hand lifts & head tips up
    gripTo(R,1,g,hd,V(0,-1,0).applyAxisAngle(V(0,0,1),0.0),V(1,-0.3,-0.4));cloakHang(R);};
  PO.lash=(R,t,o)=>{const k=o&&o.phase!=null?o.phase:cyc(t,0.8),a=TAU*k;hipsAt(R,0,17.2,0);stand(R,0,V(-2.0,1.5,0.4),V(2.0,1.5,-0.2));R.torso.rotation.x=0.2;R.head.rotation.x=0.5;
    gripTo(R,-1,V(-2.0+0.3*Math.sin(a+PI),19.4+0.4*Math.cos(a+PI),7.2),V(1,0,0),V(0,-1,0),V(-1,-0.3,-0.6));
    gripTo(R,1,V(1.4,19.6+1.6*Math.sin(a),7.6+1.6*Math.cos(a)),V(-1,0,0.2),V(0,-Math.sin(a+PI/2),-Math.cos(a+PI/2)),V(1,-0.3,-0.6));cloakHang(R);};
  PO.hammer=(R,t,o)=>{const k=o&&o.phase!=null?o.phase:cyc(t,0.7);hipsAt(R,0,17.0,0);stand(R,0,V(-2.0,1.5,1.8),V(2.2,1.5,-1.8));R.torso.rotation.y=-0.12;
    const up=k<0.45?ss(k/0.45):k<0.6?1-Math.pow((k-0.45)/0.15,1.5):0,a=lerp(0.15,-1.4,up);// handle elevation
    R.torso.rotation.x=lerp(0.18,-0.02,up);R.head.rotation.x=lerp(0.1,-0.05,up);
    gripTo(R,1,V(lerp(2.0,3.0,up),lerp(22.6,30.0,up),lerp(7.2,2.8,up)),V(-0.15,-Math.sin(a),Math.cos(a)),V(0,-Math.cos(a),-Math.sin(a)),V(1,-0.6,-0.3));
    gripTo(R,-1,V(-1.6,23.0,9.6),V(0,1,0),V(1,0,0),V(-1,-0.5,-0.3));cloakHang(R);};
  PO.gather=(R,t,o)=>{const k=o&&o.phase!=null?o.phase:cyc(t,1.5);hipsAt(R,0,13.6,-1.2);R.hips.rotation.x=0.35;R.torso.rotation.x=0.55;R.head.rotation.x=-0.1;
    stand(R,0,V(-2.4,1.5,0.6),V(2.4,1.5,0.2));
    let p;if(k<0.35)p=[V(4.3,13.0,4.5),V(1.6,3.0,10.5),ss(k/0.35)];else if(k<0.5)p=[V(1.6,3.0,10.5),V(1.8,3.6,10.0),(k-0.35)/0.15];else if(k<0.8)p=[V(1.8,3.6,10.0),V(4.0,14.5,3.4),ss((k-0.5)/0.3)];else p=[V(4.0,14.5,3.4),V(4.3,13.0,4.5),ss((k-0.8)/0.2)];
    const reach=k<0.5?ss(k/0.35):1-ss((k-0.5)/0.3);R.torso.rotation.x=0.45+0.35*reach;
    gripTo(R,1,p[0].clone().lerp(p[1],p[2]),V(0,0.2,1),V(0,-1,0.2),V(1,0,-0.5));armTo(R,-1,V(-3.4,10.6,4.6),V(-1,0,-0.4));R.handL.rotation.set(0.4,0,0);cloakHang(R);};
  PO.dig=(R,t,o)=>{const k=o&&o.phase!=null?o.phase:cyc(t,1.0);hipsAt(R,0,16.0,-0.4);stand(R,0,V(-2.2,1.5,2.0),V(2.2,1.5,-1.6));
    const up=k<0.4?ss(k/0.4):k<0.55?1-Math.pow((k-0.4)/0.15,1.4):0,lev=k>0.6?Math.sin((k-0.6)/0.4*PI):0;
    const hd=V(0,-0.85+0.35*lev,0.52+0.2*lev).normalize(),g=V(0.6,lerp(15.5,21.5,up)+lev*1.5,lerp(5.8,4.8,up)-lev*1.0);
    R.torso.rotation.x=lerp(0.62,0.25,up)-0.1*lev;R.head.rotation.x=0.25;
    gripTo(R,1,g,hd,V(0,0,1),V(1,-0.2,-0.6));gripTo(R,-1,g.clone().addScaledVector(hd,-4.0).add(V(-0.9,0,0)),hd,V(0,0,1),V(-1,-0.2,-0.6));cloakHang(R);};
  PO.cook=(R,t,o)=>{const k=o&&o.phase!=null?o.phase:cyc(t,2.2),a=TAU*k;hipsAt(R,0,6.4,-1.0);R.hips.rotation.x=0.25;
    legTo(R,-1,V(-2.6,1.5,2.4),V(-0.6,0.2,1));legTo(R,1,V(2.6,1.5,2.4),V(0.6,0.2,1));footTo(R,-1,0,-0.25);footTo(R,1,0,0.25);R.torso.rotation.x=0.38;R.head.rotation.x=0.3;
    const hd=V(-0.05,-0.28,1).normalize(),bl=V(Math.sin(a),-Math.cos(a),0);gripTo(R,1,V(0.6,11.5,7.6),hd,bl,V(1,-0.5,-0.3));gripTo(R,-1,V(0.2,11.95,6.0),hd,bl,V(-1,-0.5,-0.3));cloakHang(R,0.3);};
  PO.drink=(R,t,o)=>{const k=o&&o.phase!=null?o.phase:cyc(t,3.0);kneel(R,5.4,0.2);
    const dn=k<0.25?ss(k/0.25):k<0.38?1:k<0.55?1-ss((k-0.38)/0.17):0,mouth=k>=0.45&&k<0.85?ss((k-0.45)/0.1)*(1-ss((k-0.75)/0.1)):0;
    R.hips.rotation.x=0.3*dn;R.torso.rotation.x=lerp(0.15,0.95,dn);R.head.rotation.x=lerp(0.2,0.45,dn)-0.45*mouth;
    let tg;if(mouth>0.01||k>=0.45){R.hips.updateMatrix();const m=posOf(R,R.head,V(0,1.9,2.3)).multiplyScalar(1/R.dims.h);tg=V(0,lerp(9,m.y,mouth),lerp(6,m.z,mouth));}else tg=V(0,lerp(9,3.0,dn),lerp(6,10.5,dn));
    [-1,1].forEach(sd=>gripTo(R,sd,tg.clone().add(V(sd*0.62,-0.4,0)),V(0,0.3,1),V(-sd*1,0.8,0),V(sd*1,-0.6,-0.4)));cloakHang(R,0.3);};
  PO.throw=(R,t,o)=>{const k=clamp(t,0,1),wu=ss(k/0.42),th=k<0.42?0:k<0.6?ss((k-0.42)/0.18):1,fo=k<0.6?0:ss((k-0.6)/0.4);
    hipsAt(R,0,16.8-0.6*th,lerp(-0.8,1.2,th));stand(R,0,V(-2.0,1.5,4.5),V(2.4,1.5,-4.2));R.hips.rotation.y=lerp(0.35*wu,-0.35,th);R.torso.rotation.y=lerp(0.45*wu,-0.45,th);R.torso.rotation.x=lerp(-0.15*wu,0.4,th)+0.15*fo;R.head.rotation.y=-R.torso.rotation.y-R.hips.rotation.y;
    const g=k<0.42?V(3.6,24,3).lerp(V(4.4,31.5,-6.5),wu):k<0.6?V(4.4,31.5,-6.5).lerp(V(2.6,29,9.5),th):V(2.6,29,9.5).lerp(V(-1.2,17,8),fo);
    const hd=V(0,lerp(0.05,0.35,wu)-0.5*fo,1).normalize();gripTo(R,1,g,hd,V(0,-1,0),V(1,-0.8,-0.4));armTo(R,-1,V(-2.6,lerp(24,29,wu)-6*th,lerp(5,10,wu)-4*th),V(-1,-0.6,-0.5));cloakHang(R);};
  PO.swim=(R,t,o)=>{const p=((t%1)+1)%1,f=TAU*p;R.hips.rotation.set(PI/2-0.12,0.32*Math.sin(f),0);hipsAt(R,0,0.3,-8);R.head.rotation.set(-0.95,-0.25*Math.sin(f),0);
    [-1,1].forEach(s=>{const n=S_(s),a=((s<0?f:f+PI)%TAU+TAU)%TAU,rec=a<PI;R['arm'+n].rotation.set(a,0,s*(rec?0.55*Math.sin(a):0.1));R['fore'+n].rotation.x=rec?-0.9*Math.sin(a):-0.25;R['hand'+n].rotation.set(0,0,0);
      R['leg'+n].rotation.x=0.28*Math.sin(2*f+(s<0?0:PI));R['shin'+n].rotation.x=0.25+0.22*Math.sin(2*f+(s<0?0.8:PI+0.8));R['foot'+n].rotation.x=0.9;});};
  PO.sleep=(R,t,o)=>{const b=Math.sin(t*1.3);R.hips.rotation.set(0,0,PI/2);hipsAt(R,0,4.4,0);R.torso.rotation.set(0.25,0,0);R.torso.scale.set(1,1,1+b*0.02);R.head.rotation.set(0.15,0,-0.12);
    R.legL.rotation.set(-1.0,0,0);R.shinL.rotation.x=1.5;R.legR.rotation.set(-0.75,0,-0.05);R.shinR.rotation.x=1.2;R.footL.rotation.x=0.5;R.footR.rotation.x=0.5;
    R.armL.rotation.set(-2.3,0,0.1);R.foreL.rotation.x=-1.9;R.armR.rotation.set(-0.75,0,0.05);R.foreR.rotation.x=-0.85;R.handR.rotation.set(0,0,0);};
  K.char2Poses=Object.keys(PO);
  // t: seconds into the action for work poses; for 'walk'/'run'/'sneak'/'swim' t is the gait PHASE (1.0 = one full stride cycle); 'throw' t∈[0,1].
  // o: {phase: 0..1 override for work loops, per: cycle seconds (chop/mine), tool: equipped tool id (idle/walk/run carry torch/spear/other)}
  K.char2Pose=(rig,name,t,o)=>{const R=rig&&rig.userData&&rig.userData.rig?rig.userData.rig:rig;if(!R||!R.dims)return;neutral(R);const f=PO[name]||PO.idle;f(R,t||0,o||{});if(R.hair){const lie=name==='sleep'||name==='swim',pt=R.hips.rotation.x+R.torso.rotation.x+R.head.rotation.x;R.hair.rotation.set(lie?0.3:clamp(-pt*0.9,-1.05,0.15),0,lie?0:-(R.hips.rotation.z+R.torso.rotation.z+R.head.rotation.z)*0.8);}};
  K.char2Neutral=(rig)=>{const R=rig&&rig.userData&&rig.userData.rig?rig.userData.rig:rig;if(R&&R.dims)neutral(R);};
  // attach a SBM tool to the right fist (recommended): handle runs through the fist, blade faces the hand's strike side
  const TSC={axe:0.6,pick:0.6,hammer:0.55,club:0.6,knife:0.4,sickle:0.6,torch:0.62,spear:0.8};
  K.char2Equip=(rig,g,id)=>{const R=rig&&rig.userData&&rig.userData.rig?rig.userData.rig:rig;g.position.set(0,-1.75,0);g.rotation.set(PI/2,0,0);g.scale.setScalar(TSC[id]||0.6);R.handR.add(g);return g;};
}
