/* ===================== HIỆU ỨNG HÌNH ẢNH 3D: BẦU TRỜI, ÁNH SÁNG MÔI TRƯỜNG, TÔNG MÀU ĐIỆN ẢNH, HẬU KỲ ===================== */
/* Bầu trời chuyển màu theo kỷ nguyên vừa làm nền vừa sinh ánh sáng môi trường (PMREM) cho mọi vật liệu PBR.
   Hậu kỳ tự viết (không cần thư viện ngoài): vẽ cảnh vào bộ đệm HDR có khử răng cưa 4x → lọc vùng sáng → làm mờ 2 tầng (lóa sáng)
   → ghép: tông màu ACES, độ bão hòa/tương phản, tối góc, chống sọc màu. Thiếu WebGL2 hoặc máy yếu thì vẽ thẳng với tông màu ACES. */
function K3fxInit(){if(!K3.ok||K3.fx)return;const T=K3.T;
  const FX={on:true,cfg:{exp:0.86,envK:0.7,hemiK:0.06,sunK:1.22,sat:1.16,con:1.05,bloom:1},envs:new WeakMap(),posts:new WeakMap()};K3.fx=FX;
  const C=h=>new T.Color(h);
  // bảng màu trời theo kỷ nguyên (giá trị tuyến tính)
  FX.pal=e=>{if(typeof e==='object')return {top:C(e.top),hor:C(e.hor),gnd:C(e.gnd),sun:C(e.sun),night:e.night||0};const L=K3.EL[Math.min(e,8)]||K3.EL[0],n=L.night||0;
    const top=C(L.sky).lerp(C(n?'#03050c':'#2f64b0'),n?0.55:0.5),hor=C(L.fog).lerp(C('#ffffff'),n?0:0.12),gnd=C(L.gnd).multiplyScalar(n?0.5:0.85);
    return {top,hor,gnd,sun:C(L.sun),night:n};};
  // MÂY VẼ: nhiễu fbm 4 tầng chiếu lên vòm trời, mép mềm, mặt đón nắng trắng ấm, mặt khuất ngả lam; mây trôi chậm theo gió (tm), độ phủ theo thời tiết (cv; cv>1.5 = tắt mây cho máy yếu)
  const SKY_FS=`uniform vec3 cT,cH,cG,sC,sD;uniform float sI,hz,tm,cv;varying vec3 vD;
float hsh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float nz(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hsh(i),hsh(i+vec2(1.0,0.0)),f.x),mix(hsh(i+vec2(0.0,1.0)),hsh(i+vec2(1.0,1.0)),f.x),f.y);}
float fbm(vec2 p){float a=0.5,s=0.0;for(int i=0;i<4;i++){s+=a*nz(p);p=p*2.03+vec2(11.3,7.1);a*=0.5;}return s;}
void main(){vec3 d=normalize(vD);float h=d.y;vec3 c=h>0.0?mix(cH,cT,pow(clamp(h*hz,0.0,1.0),0.6)):mix(cH,cG,pow(clamp(-h*4.0,0.0,1.0),0.7));
  if(h>0.0&&cv<1.5){vec2 uv=d.xz/(h+0.24)*1.1+vec2(tm*0.006,tm*0.0022);float dn=fbm(uv)*0.8+fbm(uv*2.9+3.7)*0.2;float cl=smoothstep(cv,cv+0.17,dn)*smoothstep(0.012,0.15,h);
    if(cl>0.001){float sh=fbm(uv+normalize(sD.xz+vec2(0.001))*0.085);float lit=clamp(0.52+(dn-sh)*2.8,0.0,1.0);float dl=clamp(sI*1.25+0.06,0.0,1.0);
      vec3 cw=mix(cH,vec3(1.0),0.9)*mix(0.22,1.12,dl)+sC*0.08*dl;vec3 cs=mix(cH,cT,0.5)*mix(0.28,0.86,dl);c=mix(c,mix(cs,cw,lit),cl*0.96);}}
  float s=max(dot(d,normalize(sD)),0.0);c+=sC*(pow(s,900.0)*14.0+pow(s,40.0)*0.28+pow(s,6.0)*0.08)*sI;gl_FragColor=vec4(c,1.0);
#include <tonemapping_fragment>
#include <encodings_fragment>
}`;
  const skyMat=(P,o)=>new T.ShaderMaterial({uniforms:{cT:{value:P.top.clone()},cH:{value:P.hor.clone()},cG:{value:P.gnd.clone()},sC:{value:P.sun.clone()},sD:{value:(o.sunDir||new T.Vector3(-0.52,0.62,0.4)).clone()},sI:{value:P.night?0.18:(o.sunI??1)},hz:{value:o.hz||1.6},tm:{value:0},cv:{value:o.cv??0.52}},
    vertexShader:'varying vec3 vD;void main(){vD=position;vec4 p=projectionMatrix*vec4(mat3(viewMatrix)*position,1.0);gl_Position=p.xyww;}',fragmentShader:SKY_FS,side:T.BackSide,depthTest:false,depthWrite:false,fog:false});
  // vòm trời cho cảnh (camera phối cảnh). Trả về mesh; màu chân trời trùng màu sương mù để không lộ đường nối
  FX.sky=(scene,e,o)=>{o=o||{};const P=FX.pal(e),m=new T.Mesh(new T.SphereGeometry(10,32,16),skyMat(P,o));m.frustumCulled=false;m.renderOrder=-1e9;m.userData.sky=1;m.material.userData.own=1;
    if(scene){scene.add(m);if(scene.fog)scene.fog.color.copy(P.hor);scene.background=P.hor.clone();}return m;};
  // ánh sáng môi trường: một bộ cho mỗi renderer và mỗi kỷ nguyên (texture gắn với ngữ cảnh WebGL)
  FX.env=(R,e,k)=>{if(!R)return null;let M=FX.envs.get(R);if(!M){M={};FX.envs.set(R,M);}k=k||1;const key=(typeof e==='object'?JSON.stringify(e):e)+'|'+k;if(M[key])return M[key];
    try{const P=FX.pal(e),sc=new T.Scene();['top','hor','gnd'].forEach(q=>P[q].multiplyScalar(k));const m=new T.Mesh(new T.SphereGeometry(10,32,16),skyMat(P,{sunI:1.6}));m.frustumCulled=false;sc.add(m);
      const pm=new T.PMREMGenerator(R);const rt=pm.fromScene(sc,0.02,0.1,100);pm.dispose();m.geometry.dispose();m.material.dispose();M[key]=rt.texture;return rt.texture;}catch(err){console.warn('Ánh sáng môi trường lỗi:',err);return null;}};

  // ---------------- chi tiết mặt đất ----------------
  // vân xám lặp theo toạ độ thế giới: R = lá cỏ, G = sỏi/đất, B = mảng lớn. Nhân lên màu gốc nên giữ nguyên bản vẽ tay khi nhìn xa
  let DET=null;
  FX.detTex=()=>{if(DET)return DET;const N=256;let sd=7;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};
    const layer=draw=>{const cv=document.createElement('canvas');cv.width=cv.height=N;const c=cv.getContext('2d');c.fillStyle='#808080';c.fillRect(0,0,N,N);draw(c);return c.getImageData(0,0,N,N).data;};
    const wrap=(c,f,x,y,m)=>{const xs=[0],ys=[0];if(x<m)xs.push(N);if(x>N-m)xs.push(-N);if(y<m)ys.push(N);if(y>N-m)ys.push(-N);for(const ox of xs)for(const oy of ys){c.save();c.translate(ox,oy);f(c);c.restore();}};
    const A=layer(c=>{c.lineCap='round';for(let i=0;i<2600;i++){const x=rnd()*N,y=rnd()*N,l=3+rnd()*7,a=-Math.PI/2+(rnd()-0.5)*1.1,v=Math.floor(60+rnd()*150),w=0.7+rnd()*1.1;
      wrap(c,c=>{c.strokeStyle=`rgb(${v},${v},${v})`;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);c.stroke();},x,y,12);}});
    const B=layer(c=>{for(let i=0;i<900;i++){const x=rnd()*N,y=rnd()*N,r=0.6+rnd()*2.6,v=Math.floor(rnd()<0.5?50+rnd()*60:150+rnd()*80);const ry=r*(0.6+rnd()*0.4),rr=rnd()*3;wrap(c,c=>{c.fillStyle=`rgb(${v},${v},${v})`;c.beginPath();c.ellipse(x,y,r,ry,rr,0,7);c.fill();},x,y,4);}});
    // nhiễu mịn lặp liền (lưới 8x8 nội suy)
    const G=8,lat=[];for(let i=0;i<G*G;i++)lat.push(rnd());const vn=(x,y)=>{const gx=x/N*G,gy=y/N*G,x0=Math.floor(gx),y0=Math.floor(gy),fx=gx-x0,fy=gy-y0,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);
      const L=(i,j)=>lat[((j%G+G)%G)*G+((i%G+G)%G)];return (L(x0,y0)*(1-sx)+L(x0+1,y0)*sx)*(1-sy)+(L(x0,y0+1)*(1-sx)+L(x0+1,y0+1)*sx)*sy;};
    const data=new Uint8Array(N*N*4);for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=(y*N+x)*4;data[i]=A[i];data[i+1]=B[i];data[i+2]=Math.round(255*(vn(x,y)*0.7+vn(x*2.03,y*2.03)*0.3));data[i+3]=255;}
    const t=new T.DataTexture(data,N,N,T.RGBAFormat);t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=8;t.needsUpdate=true;DET=t;return t;};
  // gắn vân chi tiết vào một vật liệu PBR. o.scale: số lần lặp trên mỗi đơn vị, o.k: độ đậm
  FX.detail=(mat,o)=>{o=o||{};const tex=FX.detTex(),sc=o.scale||1/56,k=o.k??0.75,big=o.big??0.26;
    mat.onBeforeCompile=sh=>{sh.uniforms.tDet={value:tex};sh.uniforms.dS={value:sc};sh.uniforms.dK={value:k};sh.uniforms.dB={value:big};
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vDW;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n  vDW=(modelMatrix*vec4(transformed,1.0)).xz;');
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D tDet;uniform float dS,dK,dB;varying vec2 vDW;').replace('#include <color_fragment>',`#include <color_fragment>
  {vec3 dd=texture2D(tDet,vDW*dS).rgb;float bl=texture2D(tDet,vDW*dS*0.093+vec2(0.37,0.11)).b;vec3 bc=diffuseColor.rgb;float gm=smoothstep(-0.01,0.05,bc.g-max(bc.r,bc.b)*0.93);
   float kk=mix(dd.g,dd.r,gm);diffuseColor.rgb*=mix(1.0,0.6+0.8*kk,dK)*(1.0-dB*0.5+dB*bl);}`);};
    mat.customProgramCacheKey=()=>'k3det'+k+'|'+big;mat.needsUpdate=true;return mat;};
  // ---------------- bụi cỏ 3D ----------------
  // pts: [{x,z,s,c}] (c: màu THREE.Color hoặc '#hex'). Một InstancedMesh, lá cỏ đung đưa theo gió (dùng K3.GU.time)
  FX.tufts=(pts,o)=>{o=o||{};if(!pts.length)return null;const pos=[],nrm=[],hh=[];let sd=3;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};
    const blades=o.blades||7;for(let b=0;b<blades;b++){const a=b/blades*Math.PI*2+rnd()*0.6,r=(o.sp||[0.8,2.4])[0]+rnd()*(o.sp||[0.8,2.4])[1],x=Math.cos(a)*r,z=Math.sin(a)*r,h=(o.h||9)*(0.55+rnd()*0.6),w=(o.w||1)*(0.7+rnd()*0.6),lean=0.14+rnd()*0.34,px=-Math.sin(a)*w,pz=Math.cos(a)*w;
      pos.push(x-px,0,z-pz, x+px,0,z+pz, x+Math.cos(a)*h*lean,h,z+Math.sin(a)*h*lean);for(let k=0;k<3;k++)nrm.push(0,1,0);hh.push(0,0,1);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nrm,3));g.setAttribute('th',new T.Float32BufferAttribute(hh,1));
    const m=new T.MeshStandardMaterial({color:'#ffffff',roughness:0.95,metalness:0,side:T.DoubleSide});m.userData.own=1;
    m.onBeforeCompile=sh=>{sh.uniforms.time=K3.GU?K3.GU.time:{value:0};sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float th;uniform float time;varying float vTh;')
      .replace('#include <begin_vertex>',`#include <begin_vertex>
  vTh=th;
  #ifdef USE_INSTANCING
  vec2 ip=instanceMatrix[3].xz;
  #else
  vec2 ip=vec2(0.0);
  #endif
  /* gió: sóng lớn lướt qua đồng cỏ + rung nhỏ từng bụi */float gs=sin(time*0.85+(ip.x+ip.y*0.6)*0.0075);float wv=gs*0.9+sin(time*1.7+ip.x*0.021+ip.y*0.017)*0.5+sin(time*3.1+ip.x*0.05)*0.2;transformed.x+=wv*th*2.6;transformed.z+=wv*th*1.2;`);
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vTh;').replace('#include <color_fragment>','#include <color_fragment>\n  /* gốc đậm, ngọn sáng ngả vàng */diffuseColor.rgb=mix(diffuseColor.rgb*0.6,diffuseColor.rgb*0.92+vec3(0.0,0.015,0.0),vTh);')
        .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n  /* lá mỏng ánh sáng xuyên qua: ngọn tự sáng nhẹ, không bị đen khi khuất nắng */totalEmissiveRadiance+=diffuseColor.rgb*0.04*vTh;');};
    m.customProgramCacheKey=()=>'k3tuft6';
    const M=new T.InstancedMesh(g,m,pts.length),d=new T.Object3D(),col=new T.Color();pts.forEach((p,i)=>{d.position.set(p.x,0,p.z);d.rotation.set(0,p.ry??(i*2.399),0);d.scale.set(p.s,p.s*(p.sy||1),p.s);d.updateMatrix();M.setMatrixAt(i,d.matrix);col.set(p.c||'#5a8a3a');M.setColorAt(i,col);});
    M.instanceMatrix.needsUpdate=true;if(M.instanceColor)M.instanceColor.needsUpdate=true;M.receiveShadow=true;M.castShadow=false;M.frustumCulled=false;M.userData.tufts=1;return M;};
  // viền sáng quanh nhân vật (giống đèn hắt sau lưng trong phim): nhân vật tách khỏi nền đất
  FX.rim=(mat,o)=>{o=o||{};const k=o.k??0.3,col=new T.Color(o.col||'#fff0d6');mat.onBeforeCompile=sh=>{sh.uniforms.rimC={value:col};sh.uniforms.rimK={value:k};
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 rimC;uniform float rimK;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n  {float rf=1.0-clamp(dot(normalize(normal),normalize(vViewPosition)),0.0,1.0);totalEmissiveRadiance+=rimC*diffuseColor.rgb*pow(rf,2.4)*rimK*2.2+rimC*pow(rf,5.0)*rimK*0.35;}');};
    mat.customProgramCacheKey=()=>'k3rim'+k;mat.needsUpdate=true;return mat;};
  // ---------------- hậu kỳ ----------------
  const VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}';
  const ACES=`vec3 acesF(vec3 c){c*=uExp/0.6;const mat3 I=mat3(0.59719,0.07600,0.02840,0.35458,0.90834,0.13383,0.04823,0.01566,0.83777);const mat3 O=mat3(1.60475,-0.10208,-0.00327,-0.53108,1.10813,-0.07276,-0.07367,-0.00605,1.07602);
  c=I*c;vec3 a=c*(c+0.0245786)-0.000090537;vec3 b=c*(0.983729*c+0.4329510)+0.238081;return clamp(O*(a/b),0.0,1.0);}
vec3 toS(vec3 c){c=clamp(c,0.0,1.0);return mix(c*12.92,1.055*pow(c,vec3(1.0/2.4))-0.055,step(0.0031308,c));}`;
  function mkPost(R){const gl2=R.capabilities.isWebGL2;if(!gl2||!R.extensions.has('EXT_color_buffer_float'))return null;
    const dpr=R.getPixelRatio(),rt=(s,d)=>new T.WebGLRenderTarget(4,4,{type:T.HalfFloatType,depthBuffer:!!d,stencilBuffer:false,samples:s||0,minFilter:T.LinearFilter,magFilter:T.LinearFilter,generateMipmaps:false});
    const P={main:rt(dpr>=1.5?2:4,true),h:rt(),q1:rt(),q2:rt(),e1:rt(),e2:rt(),w:0,hh:0};
    const cam=new T.OrthographicCamera(-1,1,1,-1,0,1),quad=new T.Mesh(new T.PlaneGeometry(2,2)),qs=new T.Scene();quad.frustumCulled=false;qs.add(quad);
    const SM=(u,fs)=>new T.ShaderMaterial({uniforms:u,vertexShader:VS,fragmentShader:fs,depthTest:false,depthWrite:false,toneMapped:false});
    const mBr=SM({tD:{value:null},px:{value:new T.Vector2()},th:{value:1.0},kn:{value:0.5}},`uniform sampler2D tD;uniform vec2 px;uniform float th,kn;varying vec2 vUv;
void main(){vec3 c=(texture2D(tD,vUv+px*vec2(-1.0,-1.0)).rgb+texture2D(tD,vUv+px*vec2(1.0,-1.0)).rgb+texture2D(tD,vUv+px*vec2(-1.0,1.0)).rgb+texture2D(tD,vUv+px*vec2(1.0,1.0)).rgb)*0.25;
  float l=max(c.r,max(c.g,c.b));float s=clamp(l-th+kn,0.0,2.0*kn);s=s*s/(4.0*kn+1e-4);float w=max(s,l-th)/max(l,1e-4);gl_FragColor=vec4(min(c*w,vec3(16.0)),1.0);}`);
    const mBl=SM({tD:{value:null},dir:{value:new T.Vector2()}},`uniform sampler2D tD;uniform vec2 dir;varying vec2 vUv;
void main(){vec3 c=texture2D(tD,vUv).rgb*0.2270270;c+=(texture2D(tD,vUv+dir*1.3846153).rgb+texture2D(tD,vUv-dir*1.3846153).rgb)*0.3162162;c+=(texture2D(tD,vUv+dir*3.2307692).rgb+texture2D(tD,vUv-dir*3.2307692).rgb)*0.0702702;gl_FragColor=vec4(c,1.0);}`);
    const mCo=SM({tD:{value:null},tB1:{value:null},tB2:{value:null},bS:{value:0.5},uExp:{value:0.9},vig:{value:0.28},sat:{value:1.08},con:{value:1.05},warm:{value:0.03},time:{value:0}},`uniform sampler2D tD,tB1,tB2;uniform float bS,uExp,vig,sat,con,warm,time;varying vec2 vUv;
${ACES}
void main(){vec3 c=texture2D(tD,vUv).rgb;vec3 b=texture2D(tB1,vUv).rgb*0.55+texture2D(tB2,vUv).rgb*0.75;c+=b*bS;
  c=acesF(c);vec3 s=toS(c);float l=dot(s,vec3(0.2126,0.7152,0.0722));s=mix(vec3(l),s,sat);s=(s-0.5)*con+0.5;
  s+=vec3(warm,warm*0.35,-warm)*(l-0.45);
  vec2 q=vUv-0.5;s*=1.0-vig*smoothstep(0.18,0.75,dot(q,q)*2.0);
  s+=(fract(sin(dot(gl_FragCoord.xy+fract(time)*61.0,vec2(12.9898,78.233)))*43758.5453)-0.5)/255.0;gl_FragColor=vec4(clamp(s,0.0,1.0),1.0);}`);
    const V2=new T.Vector2();
    const pass=(m,tgt)=>{quad.material=m;R.setRenderTarget(tgt);R.render(qs,cam);};
    P.render=(sc,cm,o)=>{const sz=R.getDrawingBufferSize(V2),w=Math.max(4,sz.x),h=Math.max(4,sz.y);
      if(w!==P.w||h!==P.hh){P.w=w;P.hh=h;P.main.setSize(w,h);P.h.setSize(Math.max(2,w>>1),Math.max(2,h>>1));[P.q1,P.q2].forEach(r=>r.setSize(Math.max(2,w>>2),Math.max(2,h>>2)));[P.e1,P.e2].forEach(r=>r.setSize(Math.max(2,w>>3),Math.max(2,h>>3)));}
      const ac=R.autoClear;R.autoClear=true;R.setRenderTarget(P.main);R.render(sc,cm);
      mBr.uniforms.tD.value=P.main.texture;mBr.uniforms.px.value.set(0.5/w,0.5/h);mBr.uniforms.th.value=o.th??1.0;pass(mBr,P.h);
      const blur=(src,a,b,sw,sh,sp)=>{mBl.uniforms.tD.value=src.texture;mBl.uniforms.dir.value.set(sp/sw,0);pass(mBl,a);mBl.uniforms.tD.value=a.texture;mBl.uniforms.dir.value.set(0,sp/sh);pass(mBl,b);};
      blur(P.h,P.q1,P.q2,w>>2,h>>2,1.0);blur(P.q2,P.e1,P.e2,w>>3,h>>3,1.25);
      const u=mCo.uniforms;u.tD.value=P.main.texture;u.tB1.value=P.q2.texture;u.tB2.value=P.e2.texture;const G=FX.cfg;u.bS.value=(o.bloom??0.45)*G.bloom;u.uExp.value=(o.exp??1)*G.exp;u.vig.value=o.vig??0.28;u.sat.value=(o.sat??1)*G.sat;u.con.value=(o.con??1)*G.con;u.warm.value=o.warm??0.03;u.time.value=performance.now()/1000;
      pass(mCo,null);R.autoClear=ac;};
    P.dispose=()=>{[P.main,P.h,P.q1,P.q2,P.e1,P.e2].forEach(r=>r.dispose());[mBr,mBl,mCo].forEach(m=>m.dispose());quad.geometry.dispose();};
    return P;}
  FX.post=R=>{if(!FX.posts.has(R)){let P=null;try{P=mkPost(R);}catch(err){console.warn('Hậu kỳ lỗi, vẽ thẳng:',err);P=null;}FX.posts.set(R,P);}return FX.posts.get(R);};
  // vẽ một khung: có hậu kỳ thì tắt tông màu của renderer (hậu kỳ tự làm ACES), không thì để renderer làm ACES
  FX.render=(R,sc,cam,o)=>{o=o||{};const P=(o.post!==false&&FX.on)?FX.post(R):null;
    if(P){if(R.toneMapping!==T.NoToneMapping)R.toneMapping=T.NoToneMapping;try{P.render(sc,cam,o);return;}catch(err){console.warn('Hậu kỳ lỗi, vẽ thẳng:',err);FX.posts.set(R,null);}}
    if(R.toneMapping!==T.ACESFilmicToneMapping)R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=(o.exp??1)*FX.cfg.exp;R.setRenderTarget(null);R.render(sc,cam);};
  FX.drop=R=>{const P=FX.posts.get(R);if(P)try{P.dispose();}catch(_){}FX.posts.delete(R);const M=FX.envs.get(R);if(M)Object.values(M).forEach(t=>{try{t.dispose();}catch(_){}});FX.envs.delete(R);};
}
