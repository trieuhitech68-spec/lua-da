/* ===================== NHÂN VẬT 3D KIỂU CHIBI (dùng chung cho tướng và lính) =====================
   K3.char(o) → Group cao ~36 du, chân ở y=0, mặt nhìn về +Z.
   o: {skin, top, top2, bottom, boots, belt, hair, hs:'short'|'long'|'bald'|'wild'|'braid'|'bun'|'none', beard, fem, old, brow, scar,
       paint:'red'|'blue'|'white'|'gold'|'eyes'|'claw', cloak, cloak2, build (độ to ngang, 1 = vừa), bare (cởi trần: thân màu da), skirt (váy/khố), sleeves (false = tay trần)}
   G.userData.rig = {head, torso, armL, armR, legL, legR, handL, handR, top (đỉnh đầu, gắn mũ), back (sau lưng, gắn bao tên/áo choàng), face (mặt, gắn mặt nạ)}
   Khớp: armL/armR xoay quanh vai (rotation.x vung tới trước), legL/legR quanh hông, head quanh cổ. */
function K3charInit(){if(!K3.ok||K3.char)return;const T=K3.T;
  const M=(c,o)=>K3.mat(c,o),SM=c=>K3.mat(c,{flat:false});
  const msh=(g,m,o)=>{const x=new T.Mesh(g,typeof m==='string'?M(m):m);x.castShadow=true;x.receiveShadow=true;if(o){if(o.x||o.y||o.z)x.position.set(o.x||0,o.y||0,o.z||0);if(o.rx)x.rotation.x=o.rx;if(o.ry)x.rotation.y=o.ry;if(o.rz)x.rotation.z=o.rz;if(o.sx||o.sy||o.sz)x.scale.set(o.sx||1,o.sy||1,o.sz||1);}return x;};
  const sph=(r,m,o,ws,hs)=>msh(new T.SphereGeometry(r,ws||16,hs||12),m,o);
  const shade=(hex,f)=>{const c=new T.Color(hex);c.offsetHSL(0,0,f);return '#'+c.getHexString();};
  K3.shadeHex=shade;
  K3.char=(o)=>{o=o||{};const G=new T.Group(),bw=o.build||1,skin=o.skin||'#c99063',top=o.bare?skin:(o.top||'#8a5a33'),top2=o.top2||shade(top,-0.08),bot=o.bottom||'#5e3e24',boots=o.boots||'#3a2617';
    const sk=SM(skin),skD=SM(shade(skin,-0.06));
    // chân (khớp ở hông)
    const leg=(d)=>{const P=new T.Group();P.position.set(d*2.15*bw,11.2,0);P.add(K3.box(3.5*bw,9.2,3.7,o.skirt?skin:bot,{y:-9.2-0.3,x:0,center:false}));
      P.children[0].position.y=-9.6;P.add(K3.box(3.9*bw,3.1,4.8,boots,{y:-11.2,z:0.55}));G.add(P);return P;};
    const legL=leg(-1),legR=leg(1);
    // hông + thắt lưng
    G.add(K3.box(9.4*bw,3.2,5.8,o.skirt||bot,{y:9.6}));
    if(o.skirt)G.add(K3.cyl(5.4*bw,6.4*bw,5.2,o.skirt,{y:6.4,sz:0.72},8));
    // thân: hình trụ 8 cạnh dẹt, vai rộng hơn eo
    const torso=new T.Group();torso.position.set(0,12.6,0);G.add(torso);
    const tb=K3.cyl(5.9*bw,4.9*bw,10.6,top,{},10);tb.scale.z=0.64;torso.add(tb);
    if(!o.bare){torso.add(K3.box(2.2,8.4,0.8,top2,{y:1.4,z:3.45}));}// nẹp áo
    else{torso.add(sph(1.9,skD,{x:-2.1,y:7.6,z:3,sz:0.4}),sph(1.9,skD,{x:2.1,y:7.6,z:3,sz:0.4}));}// cơ ngực
    torso.add(K3.cyl(5.2*bw,5.2*bw,1.5,o.belt||'#3a2617',{y:0.2,sz:0.68},10));
    torso.add(K3.box(2,1.7,0.8,'#c9a24a',{y:0.05,z:3.55}));// khoá thắt lưng
    // cổ
    G.add(K3.cyl(1.7,1.9,2.6,sk,{y:22.6},10));
    // tay (khớp ở vai)
    const arm=(d)=>{const P=new T.Group();P.position.set(d*6.5*bw,21.8,0);
      P.add(sph(2.25,o.sleeves===false?sk:M(top),{y:-0.3}));// vai
      P.add(K3.cyl(1.55,1.45,8.6,o.sleeves===false?sk:M(top),{y:-9.6},10));P.children[1].position.y=-9.2;
      P.add(K3.cyl(1.5,1.5,1.2,o.sleeves===false?sk:M(top2),{y:-9.0},10));// cổ tay áo
      const h=new T.Group();h.position.set(0,-10.6,0.2);h.add(sph(1.85,sk,{}));P.add(h);P.userData.hand=h;
      P.rotation.z=d*0.1;G.add(P);return P;};
    const armL=arm(-1),armR=arm(1);
    // đầu (khớp ở cổ)
    const head=new T.Group();head.position.set(0,24.4,0);G.add(head);const HY=6.1,HR=6.7;// tâm đầu cao hơn cổ 6.1
    head.add(sph(HR,sk,{y:HY,sx:1.03,sy:0.96,sz:0.98},24,18));
    head.add(sph(1.3,sk,{x:-6.45,y:HY-0.2,sx:0.6}),sph(1.3,sk,{x:6.45,y:HY-0.2,sx:0.6}));// tai
    const fz=(x,y)=>Math.sqrt(Math.max(0,HR*HR*0.96-x*x-(y-HY)*(y-HY)));// z mặt cầu tại (x,y)
    // mắt to tròn kiểu chibi + đốm sáng
    const ey=HY-0.7,ex=2.5,lit=o.paint==='eyes',r0=Math.sqrt(HR*HR*0.96-(ey-HY)*(ey-HY))*1.03+0.14;
    if(lit){const m=new T.Mesh(new T.CylinderGeometry(r0,r0,3.2,30,1,true,-1.05,2.1),SM('#241812'));m.position.set(0,ey,0);head.add(m);}// mặt nạ sơn ôm quanh mắt
    [-1,1].forEach(d=>{const z=lit?Math.sqrt(r0*r0-ex*ex)+0.25:fz(d*ex,ey);head.add(sph(1.3,lit?'#f4ead8':'#1c120c',{x:d*ex,y:ey,z:z-0.28,sx:0.84,sy:1.22,sz:0.5},12,10));
      if(lit)head.add(sph(0.62,'#1c120c',{x:d*ex+0.1,y:ey-0.1,z:z+0.05,sz:0.5},8,6));
      head.add(sph(0.44,'#ffffff',{x:d*ex+0.42,y:ey+0.55,z:z+0.16},8,6),sph(0.2,'#ffffff',{x:d*ex-0.35,y:ey-0.5,z:z+0.14},6,4));
      if(o.fem)head.add(K3.box(1.6,0.34,0.4,'#1c120c',{center:true,x:d*(ex+0.55),y:ey+1.35,z:z-0.1,rz:d*-0.35}));});
    // mày
    const bh=o.brow?0.75:0.45,by=HY+1.85;[-1,1].forEach(d=>head.add(K3.box(2.4,bh,0.6,o.old?'#d8d0c4':(o.hair||'#2a1a12'),{center:true,x:d*2.45,y:by,z:fz(d*2.45,by)-0.05,rz:d*(o.brow?-0.22:-0.08)})));
    // mũi, miệng, má hồng
    head.add(sph(0.6,skD,{x:0,y:HY-2.0,z:fz(0,HY-2)+0.05},8,6));
    const mz=fz(0,HY-3.6);head.add(K3.box(o.fem?1.5:1.9,0.42,0.5,'#7a2a22',{center:true,y:HY-3.6,z:mz-0.05}));
    if(o.fem)[-1,1].forEach(d=>head.add(sph(0.95,'#e38a7c',{x:d*3.4,y:HY-2.3,z:fz(d*3.4,HY-2.3)-0.2,sz:0.25},8,6)));
    if(o.old)[0,1].forEach(i=>head.add(K3.box(3.4,0.22,0.3,skD,{center:true,y:HY+3.2+i*0.75,z:fz(0,HY+3.2+i*0.75)-0.02})));
    // sơn mặt
    const P=o.paint;if(P){const pz=(x,y)=>fz(x,y)-0.02;
      if(P==='red')[-1,1].forEach(d=>[0,1].forEach(i=>head.add(K3.box(2.4,0.42,0.4,'#c0392b',{center:true,x:d*(3.2+i*0.15),y:HY-1.6-i*0.9,z:pz(d*3.2,HY-1.6-i*0.9),rz:d*0.5}))));
      if(P==='blue')[-1,1].forEach(d=>[0,1].forEach(i=>head.add(K3.box(2.2,0.36,0.4,'#3a7ac0',{center:true,x:d*3.1,y:HY-1.8-i*0.8,z:pz(d*3.1,HY-1.8-i*0.8)}))));
      if(P==='white')[-1,1].forEach(d=>[[3.4,-1.6],[2.6,-2.7],[4.0,-2.6]].forEach(([x,y])=>head.add(sph(0.36,'#f2efe8',{x:d*x,y:HY+y,z:pz(d*x,HY+y)},6,4)))),head.add(K3.box(0.5,1.8,0.4,'#f2efe8',{center:true,y:HY+3.6,z:pz(0,HY+3.6)}));
      if(P==='gold'){head.add(sph(0.6,'#f5c84a',{y:HY+3.4,z:pz(0,HY+3.4)},8,6));[-1,1].forEach(d=>head.add(K3.box(1.8,0.38,0.4,'#f5c84a',{center:true,x:d*3.2,y:HY-1.9,z:pz(d*3.2,HY-1.9)})));}
      if(P==='claw')[0,1,2].forEach(i=>head.add(K3.box(0.34,2.6,0.4,'#b03a2e',{center:true,x:-2.6+i*0.9,y:HY-2.2,z:pz(-2.6+i*0.9,HY-2.2),rz:0.35})));}
    if(o.scar)head.add(K3.box(0.38,4.2,0.4,'#e7a59a',{center:true,x:2.8,y:HY+0.4,z:fz(2.8,HY+0.4),rz:-0.25}));
    // râu
    if(o.beard){const bm=o.beard;head.add(K3.ico(4.6,bm,{y:HY-3.6,z:2.7,sx:1.15,sy:0.95,sz:0.78},1,0.18,7));head.add(K3.box(3.6,0.9,1.2,bm,{center:true,y:HY-2.75,z:fz(0,HY-2.75)+0.1}));
}
    // tóc
    const hc=o.hair||'#2a1a12',hs=o.hs||'short',cap=()=>{const m=new T.Mesh(new T.SphereGeometry(HR+0.5,22,14,0,Math.PI*2,0,Math.PI*0.56),SM(hc));m.position.set(0,HY+0.15,-0.55);m.rotation.x=-0.5;m.castShadow=true;return m;};
    if(hs!=='none'&&hs!=='bald')head.add(cap());
    // tóc mái mềm: vài khối tròn dẹt dọc chân tóc
    if(hs==='short'||hs==='long'||hs==='braid'||hs==='bun'){const n=o.fem?5:4;for(let i=0;i<n;i++){const u=(i-(n-1)/2)/((n-1)/2),x=u*4.3,y=HY+4.15-Math.abs(u)*1.3;head.add(sph(2.05,SM(hc),{x,y,z:fz(x,y)-0.65,sx:1.2,sy:0.78,sz:0.62,rz:-u*0.45},12,8));}}
    if(hs==='long'){head.add(K3.box(11.6,11,2.6,hc,{y:HY-8.6,z:-4.3}));[-1,1].forEach(d=>head.add(K3.box(2.2,8.4,2.6,hc,{x:d*6.3,y:HY-6.8,z:0.6})));}
    if(hs==='bald')[-1,1].forEach(d=>head.add(K3.ico(2.0,hc,{x:d*5.8,y:HY+0.8,z:-1,sx:0.6},0,0.2,d+3)));
    if(hs==='wild')for(let i=0;i<9;i++){const a=(i/8-0.5)*2.6;head.add(K3.cone(1.8,4.2,hc,{x:Math.sin(a)*5.4,y:HY+4.4-Math.abs(Math.sin(a))*1.8,z:-1.2-Math.cos(a)*1.1,rz:-a*0.62,rx:-0.3},5));}
    if(hs==='braid'){for(let i=0;i<5;i++)head.add(sph(1.35-i*0.12,hc,{x:5.0,y:HY-2-i*2.5,z:-2.6-i*0.15},8,6));head.add(sph(0.8,'#b5452a',{x:5.0,y:HY-14.2,z:-3.3},8,6));}
    if(hs==='bun'){head.add(sph(2.8,hc,{y:HY+6.1,z:-2.2},12,10));head.add(K3.box(6,0.5,0.5,'#e8e0d0',{center:true,y:HY+6.4,z:-2.2,rz:0.4}));}
    // áo choàng
    if(o.cloak){const cl=new T.Group();cl.position.set(0,22.6,-3.3);cl.add(K3.box(12.6*bw,1.8,4.6,o.cloak2||shade(o.cloak,-0.1),{y:-0.6,z:1.3}));const cb=K3.box(13*bw,16,0.9,o.cloak,{y:-16.4,z:-0.5});cl.add(cb);cl.rotation.x=0.12;G.add(cl);G.userData.cloak=cl;}
    // điểm gắn
    const topM=new T.Group();topM.position.set(0,HY+HR*0.92,0);head.add(topM);const face=new T.Group();face.position.set(0,HY,fz(0,HY));head.add(face);const back=new T.Group();back.position.set(0,18,-3.6);G.add(back);
    G.userData.rig={head,torso,armL,armR,legL,legR,handL:armL.userData.hand,handR:armR.userData.hand,top:topM,face,back,headR:HR,headY:24.4+HY};
    return G;};
  // Tư thế/hoạt cảnh chuẩn cho mọi nhân vật: 'idle' | 'walk' | 'attack' | 'cheer' | 'hit'
  K3.pose=(G,mode,t,ph)=>{const R=G.userData.rig;if(!R)return;ph=ph||0;const s=Math.sin(t*(mode==='walk'?9:2.2)+ph);
    R.legL.rotation.x=R.legR.rotation.x=0;R.armL.rotation.x=R.armR.rotation.x=0;R.head.rotation.set(0,0,0);G.position.y=0;
    if(mode==='idle'){R.head.rotation.z=s*0.03;R.armL.rotation.x=s*0.05;R.armR.rotation.x=-s*0.05;R.torso.scale.y=1+s*0.012;}
    else if(mode==='walk'){R.legL.rotation.x=s*0.6;R.legR.rotation.x=-s*0.6;R.armL.rotation.x=-s*0.5;R.armR.rotation.x=s*0.35-0.3;G.position.y=Math.abs(s)*0.9;}
    else if(mode==='attack'){const k=(t*2.4+ph)%1,sw=k<0.35?-k/0.35*2.2:-2.2+(k-0.35)/0.65*2.6;R.armR.rotation.x=sw;R.armL.rotation.x=-0.5;R.legL.rotation.x=0.25;R.legR.rotation.x=-0.2;}
    else if(mode==='cheer'){R.armL.rotation.x=R.armR.rotation.x=-2.7+s*0.2;G.position.y=Math.abs(Math.sin(t*6+ph))*3;}
    else if(mode==='hit'){R.head.rotation.x=-0.3;R.armL.rotation.x=R.armR.rotation.x=-0.6;}};
}
