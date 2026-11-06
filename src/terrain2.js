/* ===================== MẶT ĐẤT THẬT: VÂN CỎ, ĐẤT, ĐÁ, CÁT TRỘN THEO ĐỘ DỐC & VÙNG ===================== */
let TTEX=null;
function terrainTex(){if(TTEX)return TTEX;const T=THREE,N=512,R=rng(5150);const mk=(paint)=>{const cv=mkCanvas(N,N),c=cv.getContext('2d');paint(c);const t=new T.CanvasTexture(cv);t.wrapS=t.wrapT=T.RepeatWrapping;t.encoding=T.sRGBEncoding;t.anisotropy=8;return t;};
  const noise=(c,cols,n,smin,smax,a)=>{for(let i=0;i<n;i++){c.globalAlpha=a*(0.4+R()*0.6);c.fillStyle=cols[Math.floor(R()*cols.length)];const s=smin+R()*(smax-smin),x=R()*N,y=R()*N;for(const [ox,oy] of [[0,0],[N,0],[-N,0],[0,N],[0,-N]]){c.beginPath();c.ellipse(x+ox,y+oy,s,s*(0.6+R()*0.6),R()*3,0,7);c.fill();}}c.globalAlpha=1;};
  const grass=mk(c=>{c.fillStyle='#5f7a36';c.fillRect(0,0,N,N);noise(c,['#4e6a2c','#6f8a40','#7c8f3e','#56702f','#8a8a48'],900,6,26,0.35);noise(c,['#6b5a3a','#5a4a30'],80,4,10,0.35);
    c.lineCap='round';for(let i=0;i<9000;i++){const x=R()*N,y=R()*N,l=4+R()*12,a=-Math.PI/2+(R()-0.5)*0.9;c.strokeStyle=['#7e9c48','#5d7c33','#9aae5a','#4a6428','#a8a860','#6a8a3a'][Math.floor(R()*6)];c.globalAlpha=0.5+R()*0.5;c.lineWidth=0.8+R()*1.2;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);c.stroke();}c.globalAlpha=1;});
  const dirt=mk(c=>{c.fillStyle='#7a5e40';c.fillRect(0,0,N,N);noise(c,['#6a5036','#8a6c4a','#5e4630','#94785a'],1400,3,22,0.4);for(let i=0;i<700;i++){const x=R()*N,y=R()*N,s=1+R()*4;c.fillStyle=['#a09280','#8a8070','#6e665a','#b8a890'][Math.floor(R()*4)];c.beginPath();c.ellipse(x,y,s,s*0.8,R()*3,0,7);c.fill();c.fillStyle='rgba(30,20,10,.35)';c.beginPath();c.ellipse(x+1,y+1.2,s,s*0.6,0,0,7);c.fill();}
    c.strokeStyle='rgba(50,36,24,.35)';for(let i=0;i<60;i++){c.lineWidth=0.6+R();c.beginPath();let x=R()*N,y=R()*N;c.moveTo(x,y);for(let k=0;k<6;k++){x+=(R()-0.5)*40;y+=(R()-0.5)*40;c.lineTo(x,y);}c.stroke();}});
  const rock=mk(c=>{c.fillStyle='#837b70';c.fillRect(0,0,N,N);for(let y=0;y<N;y+=4+R()*14){c.fillStyle=['#8e8678','#756e64','#9a9284','#6a645a'][Math.floor(R()*4)];c.globalAlpha=0.5;c.fillRect(0,y,N,3+R()*10);}c.globalAlpha=1;noise(c,['#5e5850','#a49c8e','#706a60'],1200,2,14,0.35);
    c.strokeStyle='rgba(30,28,24,.55)';for(let i=0;i<120;i++){c.lineWidth=0.6+R()*1.6;c.beginPath();let x=R()*N,y=R()*N;c.moveTo(x,y);for(let k=0;k<5;k++){x+=(R()-0.5)*60;y+=(R()-0.3)*30;c.lineTo(x,y);}c.stroke();}noise(c,['#8a9a5a','#b0a860','#c8c0a0'],140,3,12,0.35);});
  const sand=mk(c=>{c.fillStyle='#cdb98a';c.fillRect(0,0,N,N);noise(c,['#d8c69a','#bfa878','#e2d2a8','#b09868'],3000,1,4,0.45);c.strokeStyle='rgba(150,120,80,.18)';c.lineWidth=2;for(let y=0;y<N;y+=14){c.beginPath();for(let x=0;x<=N;x+=16)c.lineTo(x,y+Math.sin(x*0.05+y)*4);c.stroke();}});
  TTEX={grass,dirt,rock,sand};return TTEX;}
// trọng số trộn cho mỗi đỉnh: cỏ, đất, đá, cát
function splatAt(k,x,z,h,b,sl,wet){let r=ss(0.35,0.85,sl),s=(b==='beach'||wet)?1:b==='bank'?0.35:0,d=0;const tr=typeof trailAt==='function'?trailAt(x,z):0;d=Math.max(tr,b==='rock'||b==='peak'?0.3:0,Math.max(0,NS.fbm(x/70+5,z/70-2,2)-0.15)*1.8*(b==='forest'?1.4:b==='savanna'?1:0.7));
  if(h>420)r=Math.max(r,0.5);let g=Math.max(0,1-r-s-d);const t=g+d+r+s||1;return [g/t,d/t,r/t,s/t];}
function terrainSplatMat(m){const tx=terrainTex();m.onBeforeCompile=sh=>{sh.uniforms.tG={value:tx.grass};sh.uniforms.tD={value:tx.dirt};sh.uniforms.tR={value:tx.rock};sh.uniforms.tS={value:tx.sand};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 splat;varying vec4 vSp;varying vec3 vTW;varying vec3 vTN;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n  vSp=splat;vTW=(modelMatrix*vec4(transformed,1.0)).xyz;vTN=normalize(mat3(modelMatrix)*objectNormal);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D tG,tD,tR,tS;varying vec4 vSp;varying vec3 vTW;varying vec3 vTN;').replace('#include <color_fragment>',`#include <color_fragment>
  {vec2 uv=vTW.xz;vec3 g=texture2D(tG,uv/96.0).rgb*0.6+texture2D(tG,uv/23.0).rgb*0.4;vec3 d=texture2D(tD,uv/70.0).rgb;vec3 s=texture2D(tS,uv/80.0).rgb;
   vec3 an=abs(vTN);an/=an.x+an.y+an.z;vec3 r=texture2D(tR,vTW.zy/110.0).rgb*an.x+texture2D(tR,uv/110.0).rgb*an.y+texture2D(tR,vTW.xy/110.0).rgb*an.z;
   vec3 tc=g*vSp.x+d*vSp.y+r*vSp.z+s*vSp.w;float lv=dot(vColor.rgb,vec3(0.3,0.59,0.11));float lt=dot(tc,vec3(0.3,0.59,0.11));
   vec3 tint=vColor.rgb/max(lv,0.05);diffuseColor.rgb=mix(diffuseColor.rgb,tc*mix(vec3(1.0),tint*lt,0.45)*(lv/max(lt,0.05))*0.5+tc*0.5,0.8);}`);};
  m.customProgramCacheKey=()=>'tsplat';m.needsUpdate=true;}
