/* ===================== BỘ DỰNG HÌNH 3D (three.js r149) ===================== */
/* Mọi hình dựng theo đơn vị thiết kế (du) giống bản 2D: s ≈ 80–140 là cỡ một công trình. Gốc ở chân công trình (y=0), mặt tiền nhìn về +Z. */
const K3={ok:false};
(function(){
  const T=window.THREE;if(!T)return;K3.ok=true;K3.T=T;
  if(T.ColorManagement&&'legacyMode' in T.ColorManagement)T.ColorManagement.legacyMode=false;
  // Bảng vật liệu: [màu, độ nhám, độ kim loại, vân (từ texCanvas 2D), màu phát sáng]
  const MP={mud:['#9a7652',.95,0,'plaster'],hide:['#c9a274',.9,0,'hide'],wood:['#8a5e3a',.85,0,'wood'],dwood:['#5e3e24',.85,0,'wood'],rwood:['#8a3a28',.8,0,'wood'],logs:['#7a5232',.9,0,'logs'],bamboo:['#c2a85e',.8,0,'bamboo'],
    thatch:['#c9a25a',1,0,'thatch'],stone:['#a39d92',.92,0,'stone'],dstone:['#77716a',.92,0,'stone'],rock:['#8a8076',.95,0,'rock'],brick:['#a4523a',.9,0,'brick'],tile:['#a84a2e',.75,0,'tile'],btile:['#3e5c8e',.75,0,'tile'],gtile:['#4e7a4a',.75,0,'tile'],
    plaster:['#e8dcc4',.9,0,'plaster'],cream:['#efe2c2',.9,0,'plaster'],timber:['#efe4cc',.9,0,'timber'],concrete:['#bdb9b0',.85,0,'concrete'],glass:['#5a92bc',.12,.35,null],dglass:['#2e4f6e',.12,.35,null],steel:['#8f989f',.38,.7,null],corr:['#9aa2a8',.5,.6,'corr'],
    white:['#e9eff3',.45,.12,null],alloy:['#5c6c8c',.32,.6,null],crystal:['#8a62d8',.18,.1,null,'#4a1a98'],gcrystal:['#e8c060',.22,.3,null,'#8a5a10'],bronze:['#b48c3c',.35,.75,null],copper:['#b87333',.35,.75,null],patina:['#5f9a82',.5,.4,null],red:['#b0352a',.8,0,null],gold:['#e2b24a',.28,.85,null],clay:['#b8693a',.9,0,null],soil:['#7a5634',1,0,null],
    leaf:['#4e8a3e',.9,0,null],dleaf:['#2f6034',.9,0,null],palm:['#5aa04a',.85,0,null],snow:['#f2f6f8',.8,0,null],water:['#3a7aa0',.08,.25,null],lava:['#ff6a20',.6,0,null,'#ff3a00'],ink:['#2a1a10',1,0,null],bone:['#efe6d4',.8,0,null],fur:['#7a5a3a',1,0,null],
    cloth:['#c0392b',.9,0,null],blue:['#2f5aa0',.8,0,null],yellow:['#f2c230',.7,0,null],green:['#3e9a4e',.8,0,null],purple:['#7a3ab0',.8,0,null],black:['#222428',.7,.2,null],light:['#fff1c0',.5,0,null,'#ffc860'],cyan:['#5fe1ff',.3,0,null,'#20b8ff'],magenta:['#ff6ad5',.3,0,null,'#e03ab0'],fire:['#ffb347',.5,0,null,'#ff7a10']};
  K3.MP=MP;const TEXC3={},MATC={};
  function tex3(kind,col){const key=kind+col;if(TEXC3[key])return TEXC3[key];const N=128,cv=document.createElement('canvas');cv.width=cv.height=N;const c=cv.getContext('2d');c.fillStyle=col;c.fillRect(0,0,N,N);
    try{if(typeof texCanvas==='function')c.drawImage(texCanvas(kind),0,0,N,N);}catch(e){}const t=new T.CanvasTexture(cv);t.wrapS=t.wrapT=T.RepeatWrapping;t.encoding=T.sRGBEncoding;t.anisotropy=4;TEXC3[key]=t;return t;}
  // m: khóa bảng vật liệu hoặc mã màu '#rrggbb'; o: {emissive, ei (cường độ), transparent, opacity, side, flat}
  function mat(m,o){o=o||{};const key=m+JSON.stringify(o);if(MATC[key])return MATC[key];const P=MP[m]||[m,.8,0,null];
    const prm={color:P[3]?'#ffffff':P[0],roughness:P[1],metalness:P[2],flatShading:o.flat!==false};if(P[3])prm.map=tex3(P[3],P[0]);
    const em=o.emissive||P[4];if(em){prm.emissive=new T.Color(em);prm.emissiveIntensity=o.ei??0.6;}
    if(o.transparent){prm.transparent=true;prm.opacity=o.opacity??0.6;prm.depthWrite=false;}if(o.side)prm.side=o.side;
    const M=new T.MeshStandardMaterial(prm);M.userData.key=key;MATC[key]=M;return M;}
  K3.mat=mat;
  // Toạ độ UV theo thế giới (mỗi 48 du một ô vân) cho mọi hình, để vân không bị kéo giãn
  function worldUV(g,S){S=S||48;const p=g.attributes.position.array,n=p.length/3,uv=new Float32Array(n*2);const a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),nn=new T.Vector3();
    for(let i=0;i<n;i+=3){a.fromArray(p,i*3);b.fromArray(p,i*3+3);c.fromArray(p,i*3+6);nn.subVectors(c,b).cross(a.clone().sub(b));const ax=Math.abs(nn.x),ay=Math.abs(nn.y),az=Math.abs(nn.z);
      for(let k=0;k<3;k++){const j=(i+k)*3,x=p[j],y=p[j+1],z=p[j+2];let u,v;if(ay>=ax&&ay>=az){u=x;v=z;}else if(ax>=az){u=z;v=y;}else{u=x;v=y;}uv[(i+k)*2]=u/S;uv[(i+k)*2+1]=v/S;}}
    g.setAttribute('uv',new T.BufferAttribute(uv,2));return g;}
  function place(o3,o){o=o||{};if(o.x||o.y||o.z)o3.position.set(o.x||0,o.y||0,o.z||0);if(o.rx)o3.rotation.x=o.rx;if(o.ry)o3.rotation.y=o.ry;if(o.rz)o3.rotation.z=o.rz;if(o.s)o3.scale.setScalar(o.s);if(o.sx||o.sy||o.sz)o3.scale.set(o.sx||1,o.sy||1,o.sz||1);return o3;}
  function mesh(g,m,o){g=g.index?g.toNonIndexed():g;worldUV(g,(o&&o.uv)||48);g.computeVertexNormals();const M=new T.Mesh(g,typeof m==='string'?mat(m,o&&o.mo):m);M.castShadow=!(o&&o.noShadow);M.receiveShadow=true;return place(M,o);}
  K3.mesh=mesh;
  // ---- Khối cơ bản (chân ở y=0 nếu không ghi center) ----
  K3.box=(w,h,d,m,o)=>{const g=new T.BoxGeometry(w,h,d);if(!(o&&o.center))g.translate(0,h/2,0);return mesh(g,m,o);};
  K3.cyl=(rt,rb,h,m,o,seg)=>{const g=new T.CylinderGeometry(rt,rb,h,seg||12);if(!(o&&o.center))g.translate(0,h/2,0);return mesh(g,m,o);};
  K3.cone=(r,h,m,o,seg)=>{const g=new T.ConeGeometry(r,h,seg||12);g.translate(0,h/2,0);return mesh(g,m,o);};
  K3.sphere=(r,m,o,ws,hs)=>mesh(new T.SphereGeometry(r,ws||12,hs||8),m,o);
  K3.dome=(r,m,o,seg)=>mesh(new T.SphereGeometry(r,seg||14,Math.max(4,Math.round((seg||14)/2)),0,Math.PI*2,0,Math.PI/2),m,o);
  K3.torus=(r,t,m,o,seg)=>mesh(new T.TorusGeometry(r,t,8,seg||24),m,o);
  K3.ico=(r,m,o,det,jit,seed)=>{const g0=new T.IcosahedronGeometry(r,det||0),g=g0.index?g0.toNonIndexed():g0;if(jit){let s=(seed||1)*9301;const R=()=>{s=(s*16807)%2147483647;return s/2147483647;};const p=g.attributes.position,map={};
      for(let i=0;i<p.count;i++){const k=p.getX(i).toFixed(2)+','+p.getY(i).toFixed(2)+','+p.getZ(i).toFixed(2);if(!map[k])map[k]=1+(R()-0.5)*jit;const f=map[k];p.setXYZ(i,p.getX(i)*f,p.getY(i)*f*0.85,p.getZ(i)*f);}}return mesh(g,m,o);};
  // Mái hai mái (gable): dài w theo X, rộng d theo Z, cao h; nếu o.ridgeZ thì nóc chạy theo Z
  K3.prism=(w,h,d,m,o)=>{const x=w/2,z=d/2,P=[[-x,0,z],[x,0,z],[x,h,0],[-x,0,z],[x,h,0],[-x,h,0],[x,0,-z],[-x,0,-z],[-x,h,0],[x,0,-z],[-x,h,0],[x,h,0],[-x,0,z],[-x,h,0],[-x,0,-z],[x,0,-z],[x,h,0],[x,0,z]];
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P.flat(),3));if(o&&o.ridgeZ)g.rotateY(Math.PI/2);return mesh(g,m,o);};
  // Mái bốn mái (hip): đáy w×d, nóc dài max(0,w-d) theo X, cao h. o.flare: vén mép (mái cong kiểu Á Đông)
  K3.hip=(w,h,d,m,o)=>{const x=w/2,z=d/2,r=Math.max(0,(w-d)/2),f=(o&&o.flare)||0;const A=[-x,f,z],B=[x,f,z],C=[x,f,-z],D=[-x,f,-z],R1=[-r,h,0],R2=[r,h,0];
    const P=[A,B,R2,A,R2,R1,C,D,R1,C,R1,R2,D,A,R1,B,C,R2];const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P.flat(),3));return mesh(g,m,o);};
  K3.pyr=(w,h,d,m,o)=>{const x=w/2,z=d/2,A=[-x,0,z],B=[x,0,z],C=[x,0,-z],D=[-x,0,-z],Tp=[0,h,0],P=[A,B,Tp,B,C,Tp,C,D,Tp,D,A,Tp];const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P.flat(),3));return mesh(g,m,o);};
  K3.group=(...ch)=>{const G=new T.Group();ch.flat().forEach(c=>c&&G.add(c));return G;};
  K3.at=(obj,o)=>place(obj,o);
  // ---- Chi tiết ----
  K3.windows=(face,x0,x1,y0,y1,cols,rows,lit,o)=>{o=o||{};const G=new T.Group(),gw=(x1-x0)/cols,gh=(y1-y0)/rows,ww=gw*(o.fw||0.52),wh=gh*(o.fh||0.6);
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const on=lit&&((r*7+c*13+(o.seed||0))%10)<7;const w=K3.box(ww,wh,1.2,on?'light':(o.m||'glass'),{x:x0+gw*(c+0.5),y:y0+gh*r+(gh-wh)/2,z:face,mo:on?{ei:1.1}:undefined,noShadow:true});G.add(w);}return G;};
  K3.door=(w,h,z,m,o)=>K3.box(w,h,1.6,m||'dwood',Object.assign({z,noShadow:true},o||{}));
  K3.stilts=(w,d,h,n,m)=>{const G=new T.Group();for(let i=0;i<n;i++)for(const zz of [-d/2,d/2])G.add(K3.cyl(h*0.06+1,h*0.07+1,h,m||'dwood',{x:-w/2+w*i/(n-1),z:zz},6));return G;};
  K3.crenels=(w,d,y,h,m,step)=>{const G=new T.Group(),st=step||Math.max(8,w/7),mw=st*0.55;for(let x=-w/2+mw/2;x<=w/2-mw/2+0.1;x+=st){G.add(K3.box(mw,h,mw,m,{x,y,z:d/2}));G.add(K3.box(mw,h,mw,m,{x,y,z:-d/2}));}
    for(let z=-d/2+st;z<=d/2-st+0.1;z+=st){G.add(K3.box(mw,h,mw,m,{x:-w/2,y,z}));G.add(K3.box(mw,h,mw,m,{x:w/2,y,z}));}return G;};
  K3.fence=(len,h,m,o,step)=>{const G=new T.Group(),st=step||10;for(let x=-len/2;x<=len/2+0.1;x+=st)G.add(K3.cyl(1.4,1.6,h,m||'wood',{x},5));G.add(K3.box(len,2,2,m||'wood',{y:h*0.7}));G.add(K3.box(len,2,2,m||'wood',{y:h*0.35}));return place(G,o);};
  // ---- Phần chuyển động: gắn vào userData.anim của vật thể, cảnh sẽ gọi mỗi khung hình ----
  K3.anim=(obj,fn)=>{(obj.userData.anim=obj.userData.anim||[]).push(fn);obj.userData.dyn=true;return obj;};
  K3.flag=(h,col,o)=>{const G=new T.Group();G.add(K3.cyl(1,1.2,h,'dwood',{},6));const cl=K3.box(h*0.42,h*0.26,0.8,col||'cloth',{y:h*0.7,x:h*0.21,center:true,noShadow:true});cl.geometry.translate(0,0,0);
    const fl=new T.Group();fl.position.set(0,h*0.83,0);cl.position.set(h*0.21,0,0);fl.add(cl);G.add(fl);K3.anim(fl,t=>{fl.rotation.y=Math.sin(t*2.2+(o&&o.x||0))*0.35;});return place(G,o);};
  K3.spin=(obj,axis,speed)=>K3.anim(obj,t=>{obj.rotation[axis||'y']=t*(speed||1);});
  K3.bob=(obj,amp,speed)=>{const y0=obj.position.y;return K3.anim(obj,t=>{obj.position.y=y0+Math.sin(t*(speed||1.5))*(amp||3);});};
  // Quầng sáng (sprite cộng sáng) – rẻ hơn đèn điểm
  let GLOWTEX=null;function glowTex(){if(GLOWTEX)return GLOWTEX;const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d'),g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(0.35,'rgba(255,255,255,.45)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,64,64);GLOWTEX=new T.CanvasTexture(cv);return GLOWTEX;}
  K3.glow=(col,size,o,pulse)=>{const m=new T.SpriteMaterial({map:glowTex(),color:new T.Color(col),blending:T.AdditiveBlending,transparent:true,depthWrite:false,opacity:(o&&o.op)||0.8});const sp=new T.Sprite(m);sp.scale.set(size,size,1);place(sp,o);sp.userData.glow=1;sp.userData.pulse=pulse!==false?1:0;
    if(pulse!==false){const base=m.opacity,ph=Math.random()*6;K3.anim(sp,t=>{m.opacity=base*(0.8+0.2*Math.sin(t*3+ph));});}return sp;};
  // Đám điểm sáng: thay nhiều quầng sáng tĩnh bằng một lệnh vẽ (cỡ theo đơn vị thế giới, nhấp nháy trong shader)
  K3.GU={scale:{value:1},time:{value:0},maxs:{value:512}};let GPM=null;
  function glowPtsMat(){if(GPM)return GPM;GPM=new T.ShaderMaterial({uniforms:{map:{value:glowTex()},scale:K3.GU.scale,time:K3.GU.time,maxs:K3.GU.maxs},
    vertexShader:'attribute vec3 gcol;attribute float gsize;attribute float galpha;attribute float gph;uniform float scale;uniform float time;uniform float maxs;varying vec3 vC;varying float vA;void main(){vC=gcol;float pu=gph<0.0?1.0:0.8+0.2*sin(time*3.0+gph);vA=galpha*pu;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);gl_PointSize=min(gsize*scale,maxs);}',
    fragmentShader:'uniform sampler2D map;varying vec3 vC;varying float vA;void main(){vec4 t=texture2D(map,gl_PointCoord);gl_FragColor=vec4(vC*t.rgb,t.a*vA);\n#include <encodings_fragment>\n}',
    transparent:true,depthWrite:false,blending:T.AdditiveBlending});return GPM;}
  // Khói: cụm hạt tròn bay lên rồi tan
  let SMOKETEX=null;function smokeTex(){if(SMOKETEX)return SMOKETEX;const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d'),g=c.createRadialGradient(32,32,4,32,32,30);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,64,64);SMOKETEX=new T.CanvasTexture(cv);return SMOKETEX;}
  K3.smoke=(size,o,col)=>{const G=new T.Group();place(G,o);G.userData.smoke=1;const N=7,ps=[];for(let i=0;i<N;i++){const m=new T.SpriteMaterial({map:smokeTex(),color:new T.Color(col||'#8a8a90'),transparent:true,depthWrite:false,opacity:0});const sp=new T.Sprite(m);G.add(sp);ps.push({sp,m,ph:i/N});}
    K3.anim(G,t=>{ps.forEach(p=>{const f=((t*0.22+p.ph)%1);p.sp.position.set(Math.sin(f*5+p.ph*9)*size*0.4+f*size*1.2,f*size*5,0);const sc=size*(0.6+f*2.2);p.sp.scale.set(sc,sc,1);p.m.opacity=0.55*(1-f)*Math.min(1,f*6);});});return G;};
  // Gộp các khối tĩnh cùng vật liệu thành một lưới để giảm số lần vẽ (rất quan trọng trên điện thoại)
  K3.bake=(root,opt)=>{root.updateMatrixWorld(true);const buckets=new Map(),keep=[];const inv=new T.Matrix4().copy(root.matrixWorld).invert();
    root.traverse(o=>{if(o===root)return;if(o.userData.dyn||o.userData.glow){let p=o.parent,ok=true;while(p&&p!==root){if(p.userData.dyn){ok=false;break;}p=p.parent;}if(ok)keep.push(o);return;}
      let p=o.parent;while(p&&p!==root){if(p.userData.dyn)return;p=p.parent;}
      if(!o.isMesh)return;const g=o.geometry.clone();const m4=new T.Matrix4().multiplyMatrices(inv,o.matrixWorld);g.applyMatrix4(m4);const k=o.material.uuid;if(!buckets.has(k))buckets.set(k,{m:o.material,gs:[],sh:o.castShadow});buckets.get(k).gs.push(g);});
    const out=new T.Group();out.position.copy(root.position);out.rotation.copy(root.rotation);out.scale.copy(root.scale);
    buckets.forEach(b=>{let n=0;b.gs.forEach(g=>n+=g.attributes.position.count);const pos=new Float32Array(n*3),nor=new Float32Array(n*3),uv=new Float32Array(n*2);let o3=0,o2=0;
      b.gs.forEach(g=>{pos.set(g.attributes.position.array,o3);nor.set(g.attributes.normal.array,o3);if(g.attributes.uv)uv.set(g.attributes.uv.array,o2);o3+=g.attributes.position.count*3;o2+=g.attributes.position.count*2;});
      const G=new T.BufferGeometry();G.setAttribute('position',new T.BufferAttribute(pos,3));G.setAttribute('normal',new T.BufferAttribute(nor,3));G.setAttribute('uv',new T.BufferAttribute(uv,2));G.computeBoundingSphere();
      const M=new T.Mesh(G,b.m);M.castShadow=b.sh;M.receiveShadow=true;out.add(M);});
    if(opt&&opt.points){const pts=[];for(let k=keep.length-1;k>=0;k--){const o=keep[k];if(!(o.isSprite&&o.userData.glow&&!o.children.length))continue;const m4=new T.Matrix4().multiplyMatrices(inv,o.matrixWorld),p=new T.Vector3(),q=new T.Quaternion(),sc=new T.Vector3();m4.decompose(p,q,sc);
        pts.push({p,s:Math.abs(sc.x),c:o.material.color,a:o.material.opacity,pu:o.userData.pulse});keep.splice(k,1);}
      if(pts.length){const n=pts.length,pos=new Float32Array(n*3),col=new Float32Array(n*3),sz=new Float32Array(n),al=new Float32Array(n),ph=new Float32Array(n);
        pts.forEach((g,i)=>{pos[i*3]=g.p.x;pos[i*3+1]=g.p.y;pos[i*3+2]=g.p.z;col[i*3]=g.c.r;col[i*3+1]=g.c.g;col[i*3+2]=g.c.b;sz[i]=g.s;al[i]=g.a;ph[i]=g.pu?(i*2.399)%6.283:-1;});
        const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('gcol',new T.BufferAttribute(col,3));geo.setAttribute('gsize',new T.BufferAttribute(sz,1));geo.setAttribute('galpha',new T.BufferAttribute(al,1));geo.setAttribute('gph',new T.BufferAttribute(ph,1));
        const P=new T.Points(geo,glowPtsMat());P.frustumCulled=false;P.renderOrder=3;out.add(P);}}
    keep.forEach(o=>{const m4=new T.Matrix4().multiplyMatrices(inv,o.matrixWorld);const pos=new T.Vector3(),q=new T.Quaternion(),sc=new T.Vector3();m4.decompose(pos,q,sc);o.parent.remove(o);o.position.copy(pos);o.quaternion.copy(q);o.scale.copy(sc);out.add(o);});
    const anims=[];out.traverse(o=>{if(o.userData.anim)anims.push(...o.userData.anim);});out.userData.anims=anims;return out;};
  // Viền mực mảnh cho hợp với nét vẽ tay của game (tuỳ chọn)
  K3.ink=(root,op)=>{const lm=new T.LineBasicMaterial({color:0x2a1a10,transparent:true,opacity:op??0.32});const add=[];root.children.forEach(o=>{if(o.isMesh&&!o.material.transparent&&o.geometry.attributes.position.count<24000){const e=new T.LineSegments(new T.EdgesGeometry(o.geometry,38),lm);add.push(e);}});add.forEach(e=>root.add(e));return root;};
})();
