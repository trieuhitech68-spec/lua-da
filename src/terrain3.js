/* ===================== ĐỊA HÌNH & SÔNG NƯỚC THẬT HƠN ===================== */
/* Mô-đun này nạp ngay sau terrain2.js và GÁN LẠI (không sửa tệp cũ) các hàm:
   - terrainColors : lập kế hoạch suối nhỏ trước khi tô màu mặt đất
   - splatAt       : trọng số trộn mới + dữ liệu phụ 'tq' cho mỗi đỉnh (mực nước gần, độ ẩm, đất đỏ, cỏ khô)
   - terrainChunk  : thêm thuộc tính 'tq' cho từng khối địa hình
   - terrainSplatMat: shader mặt đất mới: đá vôi phân tầng có vệt nước chảy, rêu chỗ ẩm, đất đỏ đá ong, cỏ khô thảo nguyên,
                     biến thiên lớn chống lặp vân, xa thì giữ màu vùng cho rõ, vệt ướt mép nước, sỏi bãi sông, tụ quang đáy nước
   - waterMesh     : nước chảy theo dòng, phản chiếu bầu trời, màu theo độ sâu, bọt mép bờ & ghềnh, lấp lánh nắng, gợn mưa,
                     hồ & biển phẳng lặng hơn; thác có màn nước chảy, bụi nước & bọt dưới chân; đá tảng lòng sông; suối nhỏ đổ vào sông
   - applyQ, skyTick: bọc thêm để đổi mức chất lượng shader và cập nhật đồng phục mỗi khung hình
   KHÔNG đổi hAt / waterAt / wdAt hay độ cao địa hình, nên bản lưu cũ vẫn đúng. Suối nhỏ chỉ để nhìn. */
const T3={U:null,terr:null,wmats:[],rocks:[],brooks:[],TQ:null,BW:null,BD:null,tex:null};
/* ---------- vân thủ tục (canvas / DataTexture), không dùng tệp ngoài ---------- */
// nhiễu gradient tuần hoàn (lặp liền mép) trên lưới N×N, chu kỳ P ô
function t3Perlin(N,P,R){const g=new Float32Array(P*P*2);for(let i=0;i<P*P;i++){const a=R()*6.2832;g[i*2]=Math.cos(a);g[i*2+1]=Math.sin(a);}
  const out=new Float32Array(N*N),fade=t=>t*t*t*(t*(t*6-15)+10);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const fx=x/N*P,fy=y/N*P,X=Math.floor(fx),Y=Math.floor(fy),xf=fx-X,yf=fy-Y;
    const gd=(i,j,dx,dy)=>{const k=(((Y+j)%P)*P+((X+i)%P))*2;return g[k]*dx+g[k+1]*dy;};
    const u=fade(xf),v=fade(yf),a=gd(0,0,xf,yf),b=gd(1,0,xf-1,yf),c=gd(0,1,xf,yf-1),d=gd(1,1,xf-1,yf-1);
    out[y*N+x]=a+(b-a)*u+(c-a+(d-c-b+a)*u)*v;}return out;}
// nhiễu tế bào tuần hoàn: trả về [F1,F2] cho mỗi điểm
function t3Worley(N,C,R){const p=new Float32Array(C*C*2);for(let i=0;i<C*C*2;i++)p[i]=R();const out=new Float32Array(N*N*2);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const fx=x/N*C,fy=y/N*C,X=Math.floor(fx),Y=Math.floor(fy);let f1=9,f2=9;
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const cx=X+di,cy=Y+dj,k=((((cy%C)+C)%C)*C+(((cx%C)+C)%C))*2,d=Math.hypot(cx+p[k]-fx,cy+p[k+1]-fy);if(d<f1){f2=f1;f1=d;}else if(d<f2)f2=d;}
    out[(y*N+x)*2]=f1;out[(y*N+x)*2+1]=f2;}return out;}
function t3DataTex(data,N,srgb,mip){const T=THREE,t=new T.DataTexture(data,N,N,T.RGBAFormat,T.UnsignedByteType);t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;
  t.minFilter=mip===false?T.LinearFilter:T.LinearMipmapLinearFilter;t.generateMipmaps=mip!==false;if(srgb)t.encoding=T.sRGBEncoding;
  try{t.anisotropy=Math.min(8,G.R.capabilities.getMaxAnisotropy());}catch(e){}t.needsUpdate=true;return t;}
function t3Tex(){if(T3.tex)return T3.tex;const N=512,R=rng(9137+((S&&S.seed)|0)%97);
  // vẽ lặp liền mép: vẽ thêm bản sao lệch ±N
  const wrapDraw=(c,f)=>{for(const ox of [0,N,-N])for(const oy of [0,N,-N]){c.save();c.translate(ox,oy);f(c);c.restore();}};
  const blobs=(c,cols,n,smin,smax,a)=>{for(let i=0;i<n;i++){const col=cols[Math.floor(R()*cols.length)],s=smin+R()*(smax-smin),x=R()*N,y=R()*N,e=0.5+R()*0.6,rt=R()*3,al=a*(0.4+R()*0.6);
      if(x>s&&y>s&&x<N-s&&y<N-s){c.globalAlpha=al;c.fillStyle=col;c.beginPath();c.ellipse(x,y,s,s*e,rt,0,7);c.fill();}else wrapDraw(c,cc=>{cc.globalAlpha=al;cc.fillStyle=col;cc.beginPath();cc.ellipse(x,y,s,s*e,rt,0,7);cc.fill();});}c.globalAlpha=1;};
  const paint=f=>{const cv=mkCanvas(N,N),c=cv.getContext('2d');f(c);return c.getImageData(0,0,N,N).data;};
  // đóng gói: RGB = màu, A = độ cao (lấy theo độ sáng, hoặc mặt nạ riêng)
  const pack=(rgb,alpha)=>{const out=new Uint8Array(N*N*4);let mn=255,mx=0;const L=new Float32Array(N*N);
    for(let i=0;i<N*N;i++){const l=rgb[i*4]*0.3+rgb[i*4+1]*0.59+rgb[i*4+2]*0.11;L[i]=l;if(l<mn)mn=l;if(l>mx)mx=l;}
    for(let i=0;i<N*N;i++){out[i*4]=rgb[i*4];out[i*4+1]=rgb[i*4+1];out[i*4+2]=rgb[i*4+2];out[i*4+3]=alpha?alpha[i*4]:Math.round((L[i]-mn)/(mx-mn+1e-3)*255);}return out;};
  // cỏ: nền xanh nhiều mảng, hàng vạn nét lá ngắn
  const grass=paint(c=>{c.fillStyle='#5b7834';c.fillRect(0,0,N,N);blobs(c,['#4c6a2a','#6c8a3c','#7b8e40','#55702e','#86884a','#4a5e2a'],700,8,34,0.32);blobs(c,['#6b5a3a','#5a4a30','#7a6a44'],90,3,9,0.35);
    c.lineCap='round';for(let i=0;i<14000;i++){const x=R()*N,y=R()*N,l=3+R()*11,a=-Math.PI/2+(R()-0.5)*1.1,col=['#7e9c48','#5d7c33','#9aae5a','#4a6428','#a8a860','#6a8a3a','#3f5a24'][Math.floor(R()*7)],al=0.45+R()*0.55,lw=0.7+R()*1.2;
      const f=cc=>{cc.strokeStyle=col;cc.globalAlpha=al;cc.lineWidth=lw;cc.beginPath();cc.moveTo(x,y);cc.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);cc.stroke();};if(x>14&&y>14&&x<N-14&&y<N-14)f(c);else wrapDraw(c,f);}c.globalAlpha=1;});
  // đất: nâu, sỏi nhỏ, lá mục, vết nứt
  const dirt=paint(c=>{c.fillStyle='#78593c';c.fillRect(0,0,N,N);blobs(c,['#6a4f34','#8a6a48','#5e4630','#93765a','#704a30'],1500,3,24,0.4);
    for(let i=0;i<900;i++){const x=R()*N,y=R()*N,s=1+R()*4.5,col=['#a09280','#8a8070','#6e665a','#b8a890','#5a4030','#8a5a30'][Math.floor(R()*6)];const f=cc=>{cc.fillStyle='rgba(30,20,10,.35)';cc.beginPath();cc.ellipse(x+1,y+1.3,s,s*0.6,0,0,7);cc.fill();cc.fillStyle=col;cc.beginPath();cc.ellipse(x,y,s,s*0.8,R()*3,0,7);cc.fill();};if(x>8&&y>8&&x<N-8&&y<N-8)f(c);else wrapDraw(c,f);}
    c.strokeStyle='rgba(45,32,20,.4)';for(let i=0;i<70;i++){let x=R()*N,y=R()*N;const pts=[[x,y]];for(let k=0;k<6;k++){x+=(R()-0.5)*40;y+=(R()-0.5)*40;pts.push([x,y]);}const lw=0.6+R();wrapDraw(c,cc=>{cc.lineWidth=lw;cc.beginPath();pts.forEach((p,i)=>i?cc.lineTo(p[0],p[1]):cc.moveTo(p[0],p[1]));cc.stroke();});}});
  // đá vôi: xám trắng, phân tầng nằm ngang (trục dọc của vân = độ cao), vệt nước đen chảy dọc, khe nứt, địa y
  const rock=paint(c=>{c.fillStyle='#aaa59b';c.fillRect(0,0,N,N);let y=0;while(y<N){const th=Math.min(N-y,5+R()*30),col=['#b8b3a8','#a19c91','#c6c1b5','#938e84','#afa99d','#9c968a'][Math.floor(R()*6)];c.globalAlpha=0.6;c.fillStyle=col;c.fillRect(0,y,N,th);
      c.globalAlpha=0.35+R()*0.3;c.fillStyle='#4a463f';c.beginPath();c.moveTo(0,y);for(let x=0;x<=N;x+=16)c.lineTo(x,y+Math.sin(x/N*Math.PI*2*(1+Math.floor(R()*3))+y)*1.4);c.lineTo(N,y+1.6);c.lineTo(0,y+1.6);c.fill();
      c.globalAlpha=0.25;c.fillStyle='#e2ddd2';c.fillRect(0,y+2,N,1);y+=th;}c.globalAlpha=1;
    blobs(c,['#8c877d','#c9c4b8','#7e796f','#b5afa3'],1300,2,16,0.32);
    for(let i=0;i<90;i++){const x=R()*N,y0=R()*N,len=40+R()*240,w=2+R()*9,dark=R()<0.7?'60,58,52':'58,66,44',a0=0.2+R()*0.3;
      wrapDraw(c,cc=>{const gr=cc.createLinearGradient(0,y0,0,y0+len);gr.addColorStop(0,`rgba(${dark},${a0})`);gr.addColorStop(1,`rgba(${dark},0)`);cc.fillStyle=gr;cc.beginPath();cc.moveTo(x-w/2,y0);cc.quadraticCurveTo(x+(R()-0.5)*8,y0+len*0.5,x-w*0.1,y0+len);cc.lineTo(x+w*0.1,y0+len);cc.quadraticCurveTo(x+(R()-0.5)*8,y0+len*0.5,x+w/2,y0);cc.fill();});}
    for(let i=0;i<55;i++){let x=R()*N,y=R()*N;const pts=[[x,y]],vert=R()<0.7;for(let k=0;k<5;k++){x+=vert?(R()-0.5)*10:(R()-0.5)*50;y+=vert?10+R()*25:(R()-0.5)*10;pts.push([x,y]);}const lw=0.8+R()*1.6;
      wrapDraw(c,cc=>{cc.lineWidth=lw;cc.strokeStyle='rgba(38,36,32,.65)';cc.beginPath();pts.forEach((p,i)=>i?cc.lineTo(p[0],p[1]):cc.moveTo(p[0],p[1]));cc.stroke();cc.lineWidth=lw*0.7;cc.strokeStyle='rgba(235,230,220,.3)';cc.beginPath();pts.forEach((p,i)=>i?cc.lineTo(p[0]+1.5,p[1]+1):cc.moveTo(p[0]+1.5,p[1]+1));cc.stroke();});}
    blobs(c,['#5d5850','#4e4a44'],160,1.5,5,0.45);blobs(c,['#c9b98a','#8f9a6a','#b8b070','#d8d0b8'],260,1.5,7,0.3);});
  // cát + mặt nạ sỏi (kênh A) cho bãi sông
  const sand=paint(c=>{c.fillStyle='#c9b68a';c.fillRect(0,0,N,N);blobs(c,['#d6c498','#bda676','#e0d0a6','#ae9666','#c4ae80'],3200,1,4,0.45);
    c.strokeStyle='rgba(150,120,80,.16)';c.lineWidth=2;for(let y=0;y<N;y+=16){c.beginPath();for(let x=0;x<=N;x+=16)c.lineTo(x,y+Math.sin(x/N*Math.PI*4+y)*4);c.stroke();}});
  const peb=paint(c=>{c.fillStyle='#000';c.fillRect(0,0,N,N);const cl=t3Perlin(64,4,R);for(let i=0;i<2600;i++){const x=R()*N,y=R()*N,dn=cl[Math.floor(y/8)*64+Math.floor(x/8)];if(R()>0.35+dn*1.4)continue;
      const s=2+R()*R()*12,e=0.6+R()*0.4,rt=R()*3,b=0.35+R()*0.65;const f=cc=>{const gr=cc.createRadialGradient(x-s*0.3,y-s*0.3,0,x,y,s);const v=Math.round(b*255),v2=Math.round(b*150);gr.addColorStop(0,`rgb(${v},${v},${v})`);gr.addColorStop(1,`rgb(${v2},${v2},${v2})`);cc.fillStyle=gr;cc.beginPath();cc.ellipse(x,y,s,s*e,rt,0,7);cc.fill();};
      if(x>s&&y>s&&x<N-s&&y<N-s)f(c);else wrapDraw(c,f);}});
  const tG=t3DataTex(pack(grass),N,true),tD=t3DataTex(pack(dirt),N,true),tR=t3DataTex(pack(rock),N,true),tS=t3DataTex(pack(sand,peb),N,true);
  // nhiễu chung 256²: R,G = biến thiên lớn, B = vừa, A = mạng tế bào (tụ quang, bọt)
  const M=256,a=t3Perlin(M,4,R),b=t3Perlin(M,8,R),c2=t3Perlin(M,16,R),d=t3Perlin(M,32,R),e=t3Perlin(M,6,R),f=t3Perlin(M,12,R),wo=t3Worley(M,9,R),nd=new Uint8Array(M*M*4);
  const to=v=>Math.max(0,Math.min(255,Math.round((v*0.5+0.5)*255)));
  for(let i=0;i<M*M;i++){nd[i*4]=to((a[i]+b[i]*0.5+c2[i]*0.25)*1.1);nd[i*4+1]=to((e[i]+f[i]*0.5+d[i]*0.25)*1.1);nd[i*4+2]=to((c2[i]+d[i]*0.6+b[i]*0.4)*1.2);nd[i*4+3]=Math.round(Math.max(0,1-(wo[i*2+1]-wo[i*2])*3.2)*255);}
  const tN=t3DataTex(nd,M,false);
  // pháp tuyến mặt nước 256²: RG = pháp tuyến, B = độ cao sóng (cũng làm vệt thác), A = bọt li ti
  const h1=t3Perlin(M,8,R),h2=t3Perlin(M,16,R),h3=t3Perlin(M,32,R),h4=t3Perlin(M,4,R),fo=t3Worley(M,14,R),fn=t3Perlin(M,24,R),H=new Float32Array(M*M);
  for(let i=0;i<M*M;i++)H[i]=h4[i]*0.7+h1[i]+h2[i]*0.5+h3[i]*0.28;let hm=0;for(let i=0;i<M*M;i++)hm=Math.max(hm,Math.abs(H[i]));
  const wn=new Uint8Array(M*M*4),K=M/14;for(let y=0;y<M;y++)for(let x=0;x<M;x++){const i=y*M+x,hx=H[y*M+(x+1)%M]-H[y*M+(x+M-1)%M],hy=H[((y+1)%M)*M+x]-H[((y+M-1)%M)*M+x];
    let nx=-hx*K,ny=-hy*K,nz=1;const l=Math.hypot(nx,ny,nz);nx/=l;ny/=l;wn[i*4]=Math.round((nx*0.5+0.5)*255);wn[i*4+1]=Math.round((ny*0.5+0.5)*255);wn[i*4+2]=Math.round((H[i]/hm*0.5+0.5)*255);
    wn[i*4+3]=Math.round(Math.max(0,Math.min(1,(1-(fo[i*2+1]-fo[i*2])*4.5)*0.8+fn[i]*0.6))*255);}
  const tW=t3DataTex(wn,M,false);
  T3.tex={tG,tD,tR,tS,tN,tW};return T3.tex;}
/* ---------- đồng phục dùng chung (gắn với bầu trời của game nên phản chiếu khớp màu trời) ---------- */
function t3U(){if(T3.U)return T3.U;const T=THREE,su=G.sky&&G.sky.material&&G.sky.material.uniforms;
  const own={cT:{value:new T.Color('#3f78c0')},cH:{value:new T.Color('#bcd6e6')},cG:{value:new T.Color('#6a7a4a')},sC:{value:new T.Color('#fff0d4')},sD:{value:new T.Vector3(-0.4,0.7,0.35).normalize()},sI:{value:1}};
  const U={uT:{value:0},uW:{value:new T.Vector4(1,0,0,0)},uPx:{value:400},uFish:{value:Array.from({length:16},()=>new T.Vector4(0,0,0,0))}};for(const k of ['cT','cH','cG','sC','sD','sI'])U[k]=su&&su[k]?su[k]:own[k];T3.U=U;return U;}
/* ---------- kế hoạch suối nhỏ (chỉ để nhìn): lần theo sườn dốc từ mạch nước xuống tới sông/biển ---------- */
function t3Plan(){T3.brooks=[];T3.BW=new Float32Array(HN*HN).fill(-999);T3.BD=new Float32Array(HN*HN).fill(1e9);T3.TQ=new Float32Array(HN*HN*4);
  const R=rng(((S&&S.seed)|0)*3+777),avoid=['village','camp','start','banyan','cave','ford','falls'].map(id=>REG.find(r=>r.id===id)).filter(Boolean);
  const gi=v=>Math.round((v+WSIZE/2)/HSTEP),gw=i=>-WSIZE/2+i*HSTEP,gj=v=>Math.round((v+WOZ)/HSTEP),gz=j=>-WOZ+j*HSTEP,bad=(x,z)=>avoid.some(r=>Math.hypot(r.x-x,r.z-z)<r.r*0.85)||decoBlock(x,z);
  let tries=0;while(T3.brooks.length<64&&tries<5000){tries++;const x=(R()*2-1)*WR*0.82,z=(R()*2-1)*WR*0.82,h=hAt(x,z);if(h<30||h>430)continue;const sl=slopeAt(x,z);if(sl<0.1||sl>0.85)continue;
    const m=moist(x,z)+jungleK(x,z)*0.45-savannaK(x,z)*0.7;if(m<-0.06)continue;if(riverQ(x,z).d<260||wdAt(x,z)>0||bad(x,z))continue;if(T3.brooks.some(b=>Math.hypot(b.p[0][0]-x,b.p[0][1]-z)<520))continue;
    let i=gi(x),j=gj(z);const path=[],seen=new Set();let ok=false;
    for(let st=0;st<420;st++){const k=j*HN+i,wx=gw(i),wz=gz(j);path.push([wx,wz]);seen.add(k);if(WG[k]>-900||HG[k]<1){ok=true;break;}const q=riverQ(wx,wz);if(q.r>=0&&q.d<q.w*0.5+4){ok=true;break;}if(bad(wx,wz))break;
      let best=-1,bh=HG[k]+1.2;for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const ni=i+di,nj=j+dj;if(ni<1||nj<1||ni>=HN-1||nj>=HN-1)continue;const nk=nj*HN+ni;if(seen.has(nk))continue;const hh=HG[nk]+(di&&dj?0.3:0);if(hh<bh){bh=hh;best=nk;}}
      if(best<0)break;i=best%HN;j=Math.floor(best/HN);}
    if(!ok||path.length<16)continue;
    // làm mềm (Chaikin) rồi chia đều ~10 đơn vị
    let p=path;for(let it=0;it<3;it++){const q=[p[0]];for(let a=0;a<p.length-1;a++){const [x0,z0]=p[a],[x1,z1]=p[a+1];q.push([x0*0.75+x1*0.25,z0*0.75+z1*0.25],[x0*0.25+x1*0.75,z0*0.25+z1*0.75]);}q.push(p[p.length-1]);p=q;}
    p=p.map(([x,z],n)=>[x+NS.fbm(x/90,z/90+11,2)*7*(n>2&&n<p.length-3?1:0),z+NS.fbm(x/90+5,z/90,2)*7*(n>2&&n<p.length-3?1:0)]);
    const rs=[p[0]];let acc=0;for(let a=1;a<p.length;a++){acc+=Math.hypot(p[a][0]-p[a-1][0],p[a][1]-p[a-1][1]);if(acc>=10){rs.push(p[a]);acc=0;}}if(rs.length<12)continue;
    const y=rs.map(([x,z])=>hAt(x,z)+0.45);for(let a=1;a<y.length;a++)y[a]=Math.min(y[a],y[a-1]+0.3);// không chảy ngược dốc nhiều
    T3.brooks.push({p:rs,y});
    // in dấu vào lưới: mực nước gần & độ ẩm cho mặt đất (vệt ướt, rêu dọc suối)
    rs.forEach(([bx,bz],n)=>{const i0=gi(bx),j0=gj(bz);for(let dj=-2;dj<=2;dj++)for(let di=-2;di<=2;di++){const ii=i0+di,jj=j0+dj;if(ii<0||jj<0||ii>=HN||jj>=HN)continue;const k=jj*HN+ii,d=Math.hypot(gw(ii)-bx,gz(jj)-bz);if(d<T3.BD[k]){T3.BD[k]=d;T3.BW[k]=y[n];}}});}}
/* ---------- trọng số trộn + dữ liệu phụ cho mỗi đỉnh ---------- */
// splat: [cỏ, đất, đá, cát/sỏi]; tq: [mực nước gần, độ ẩm, đất đỏ, cỏ khô]
splatAt=function(k,x,z,h,b,sl,wet){const tr=typeof trailAt==='function'?trailAt(x,z):0,q=riverQ(x,z),TQ=T3.TQ;
  let wl=-999,riverNear=1e9;if(WG[k]>-900)wl=WG[k]+0.4;else if(q.r>=0&&q.d<q.w*0.5+170&&q.s>0.5){wl=q.s+0.4;riverNear=q.d-q.w*0.5;}else if(h<14)wl=0.5;
  const bd=T3.BD?T3.BD[k]:1e9;if(bd<55&&(wl<-900||h-wl>h-T3.BW[k]))wl=T3.BW[k];
  const sv=savannaK(x,z),jg=jungleK(x,z),m0=moist(x,z),ny=TNRM?TNRM[k*3+1]:1,nz=TNRM?TNRM[k*3+2]:0;
  let damp=0.45+m0*1.3+jg*0.5-sv*0.8+(1-ss(0,140,riverNear))*0.5+(1-ss(0,50,bd))*0.55-nz*0.15+(b==='forest'?0.15:0)-(h>300?0.3:0);damp=clamp(damp,0,1);
  const ln=NS.fbm(x/520+31,z/520-17,3);let lat=ss(0.02,0.24,ln)*(b==='edge'||b==='meadow'||b==='forest'||b==='bank'?1:0.25)*(1-ss(160,260,h))*(1-sv*0.4);lat=Math.max(lat,tr*0.75);
  const dn=NS.fbm(x/300-9,z/300+4,2);let dry=clamp(sv*1.2-0.15+dn*0.6+(b==='meadow'?0.15:0)-damp*0.35,0,1);
  if(TQ){TQ[k*4]=wl;TQ[k*4+1]=damp;TQ[k*4+2]=lat;TQ[k*4+3]=dry;}
  // trọng số
  let r=ss(0.32,0.8,sl),s=0,d=0;if(h>420)r=Math.max(r,0.5);if(b==='rock'||b==='peak')r=Math.max(r,0.35);
  const dh=wl>-900?h-wl:99;
  if(b==='beach')s=1;else if(wet)s=0.75;else if(wl>1.2&&dh<9)s=ss(9,1.5,dh)*0.85;else if(b==='bank')s=0.25;
  d=Math.max(tr,Math.max(0,NS.fbm(x/70+5,z/70-2,2)-0.12)*1.8*(b==='forest'?1.4:0.7),lat*ss(0.25,0.7,ln+0.1)*0.7,wet?0.25:0,(dh>0&&dh<4&&wl>1.2)?0.3:0);
  if(b==='rock'||b==='peak')d=Math.max(d,0.2);
  let g=Math.max(0,1-r-s-d);if(dry>0.6)d+=(dry-0.6)*0.25;const t=g+d+r+s||1;return [g/t,d/t,r/t,s/t];};
{const _tc=terrainColors;terrainColors=function(){try{t3Plan();}catch(e){console.warn('suối nhỏ',e);T3.brooks=[];}_tc();};}
// thêm thuộc tính 'tq' theo đúng thứ tự đỉnh của terrainChunk gốc (lưới n×n rồi váy quanh mép)
{const _ch=terrainChunk;terrainChunk=function(ci,cj,step){const g=_ch(ci,cj,step),TQ=T3.TQ;if(!TQ)return g;const n=TCS/step+1,i0=ci*TCS,j0=cj*TCS,cnt=g.attributes.position.count,a4=new Float32Array(cnt*4);
  for(let b=0;b<n;b++)for(let a=0;a<n;a++){const i=Math.min(HN-1,i0+a*step),j=Math.min(HN-1,j0+b*step),k=j*HN+i,v=b*n+a;a4[v*4]=TQ[k*4];a4[v*4+1]=TQ[k*4+1];a4[v*4+2]=TQ[k*4+2];a4[v*4+3]=TQ[k*4+3];}
  const edge=[];for(let a=0;a<n;a++)edge.push(a);for(let b=1;b<n;b++)edge.push(b*n+n-1);for(let a=n-2;a>=0;a--)edge.push((n-1)*n+a);for(let b=n-2;b>0;b--)edge.push(b*n);
  edge.forEach((v,m)=>{const o=n*n+m;if(o>=cnt)return;a4[o*4]=-999;a4[o*4+1]=a4[v*4+1];a4[o*4+2]=a4[v*4+2];a4[o*4+3]=a4[v*4+3];});
  g.setAttribute('tq',new THREE.BufferAttribute(a4,4));return g;};}
/* ---------- shader mặt đất ---------- */
const T3_TERR_FS=`
float t3h=0.5,t3wet=0.0,t3rk=0.0,t3far=0.0;
{vec3 wp=vTW;vec2 uv=wp.xz;float dist=length(cameraPosition-wp);float farK=smoothstep(240.0,1500.0,dist);t3far=farK;
 vec3 N=normalize(vTN);vec4 sp=vSp;vec4 tq=vT2;
 vec4 m1=texture2D(tN,uv*(1.0/2300.0));vec4 m2=texture2D(tN,uv*(1.0/530.0)+vec2(0.31,0.67));float mac=m1.r*0.65+m2.g*0.35;
 // cỏ (hai tỉ lệ để không lộ ô lặp) -> cỏ khô vàng ở thảo nguyên & mùa thu
 vec4 cg=texture2D(tG,uv*(1.0/41.0));
 #if T3Q>0
 cg=mix(cg,texture2D(tG,uv*(1.0/151.0)+vec2(0.5,0.21)),0.42);
 #endif
 float dry=clamp(tq.w+(m2.b-0.5)*0.7+uAut*0.45,0.0,1.0);float lg=dot(cg.rgb,vec3(0.3,0.59,0.11));
 cg.rgb=mix(cg.rgb,vec3(0.80,0.67,0.40)*lg*1.9,smoothstep(0.15,0.85,dry)*0.85);
 // đất -> đất đỏ đá ong
 vec4 cd=texture2D(tD,uv*(1.0/53.0));float lat=clamp(tq.z*smoothstep(0.2,0.55,m2.r+tq.z*0.35),0.0,1.0);float ld=dot(cd.rgb,vec3(0.3,0.59,0.11));
 cd.rgb=mix(cd.rgb,vec3(0.64,0.27,0.13)*ld*2.4,lat*0.85);
 // cát / sỏi bãi sông
 vec4 cs=texture2D(tS,uv*(1.0/37.0));float dh=wp.y-tq.x;float gv=step(1.2,tq.x)*(1.0-smoothstep(5.0,18.0,dh));
 vec3 pebc=mix(vec3(0.22,0.21,0.19),vec3(0.58,0.55,0.50),cs.a)*mix(vec3(1.06,1.0,0.9),vec3(0.94,0.98,1.04),m2.b);float pm=smoothstep(0.05,0.2,cs.a)*gv*(1.0-smoothstep(120.0,520.0,dist)*0.75);
 cs.rgb=mix(cs.rgb*mix(1.0,0.66,gv),pebc,pm);float hs=mix(cs.a*0.25,cs.a,gv);
 // đá vôi: chiếu ba mặt; vân có trục dọc = độ cao nên tầng đá nằm ngang, vệt nước chảy dọc
 vec3 an=abs(N);an*=an;an*=an;an/=(an.x+an.y+an.z);vec2 off=vec2(m2.b*0.23,m2.g*0.17);
 #if T3Q>0
 vec4 cr=texture2D(tR,vec2(wp.z,-wp.y*1.15)*(1.0/96.0)+off)*an.x+texture2D(tR,uv*(1.0/96.0))*an.y+texture2D(tR,vec2(wp.x,-wp.y*1.15)*(1.0/96.0)+off)*an.z;
 #else
 vec4 cr=an.y>0.5?texture2D(tR,uv*(1.0/96.0)):texture2D(tR,(an.x>an.z?vec2(wp.z,-wp.y):vec2(wp.x,-wp.y))*(1.0/96.0)+off);
 #endif
 float band=sin(wp.y*0.19+mac*9.0+m2.r*4.0);cr.rgb*=(0.84+0.16*smoothstep(-0.5,0.8,band))*0.82;cr.rgb*=mix(vec3(1.0),vec3(1.05,1.0,0.92),m1.g);
 // rêu chỗ ẩm, ưu tiên mặt ngửa lên
 float moss=clamp(tq.y*1.45-0.42+(m2.b-0.5)*1.1,0.0,1.0)*smoothstep(0.1,0.75,N.y+0.25);vec3 mc=vec3(0.21,0.29,0.09)*(0.7+0.6*cg.a);
 cr.rgb=mix(cr.rgb,mc,moss*0.72);cd.rgb=mix(cd.rgb,mc*1.15,moss*0.35);
 // trộn theo độ cao vân (chuyển tiếp tự nhiên: cỏ mọc giữa kẽ đá...)
 vec4 hb=vec4(cg.a,cd.a,cr.a,hs);vec4 w=sp;
 #if T3Q>0
 {vec4 msk=step(0.001,sp);vec4 bb=sp+hb*0.42*msk;float mx=max(max(bb.x,bb.y),max(bb.z,bb.w))-0.24;w=max(bb-mx,0.0)*msk;w/=max(dot(w,vec4(1.0)),1e-4);}
 #endif
 vec3 tc=cg.rgb*w.x+cd.rgb*w.y+cr.rgb*w.z+cs.rgb*w.w;t3h=dot(hb,w);t3rk=w.z;
 // màu vùng (màu đỉnh) nhuộm nhẹ khi gần, chiếm ưu thế khi xa cho rõ nét, không bệt
 vec3 vc=vColor.rgb;float lv=dot(vc,vec3(0.3,0.59,0.11));float lt=dot(tc,vec3(0.3,0.59,0.11));
 vec3 nearC=tc*mix(vec3(1.0),vc/max(lv,0.04),0.5)*mix(1.0,clamp(lv/max(lt,0.04),0.6,1.5),0.4);nearC=mix(vec3(dot(nearC,vec3(0.3,0.59,0.11))),nearC,1.18);
 vec3 farC=mix(vc*(0.82+0.5*(lt-0.3)),tc*1.05,w.z*0.6+w.w*0.4);
 vec3 col=max(mix(nearC,farC,farK*0.75),0.0);
 // grade: deeper, more saturated ground (was too bright -> pushed into the ACES shoulder -> pale, milky). q0 has no post grading, so a bit stronger there
 #if T3Q>0
 {float l=dot(col,vec3(0.3,0.59,0.11));col=max(mix(vec3(l),col,1.35),0.0)*0.56;}
 #else
 {float l=dot(col,vec3(0.3,0.59,0.11));col=max(mix(vec3(l),col,1.55),0.0)*0.5;}
 #endif
 col*=0.84+0.32*mac;col*=mix(vec3(1.0),vec3(1.04,1.0,0.92),smoothstep(0.4,0.8,m2.r)*0.6);
 // vệt ướt sát mép nước, đáy dưới nước tối & xanh, tụ quang
 float wb=(1.0-smoothstep(0.0,3.0+3.5*m2.b,dh))*step(-900.0,tq.x);float uw=(1.0-smoothstep(-0.8,0.3,dh))*step(-900.0,tq.x);
 col*=1.0-0.45*wb;col=mix(col,col*vec3(0.42,0.56,0.50),uw*(0.6+0.4*smoothstep(0.0,-14.0,dh)));
 #if T3Q>0
 {vec2 cu=uv*(1.0/34.0);float c1=texture2D(tN,cu+vec2(uT3.x*0.021,uT3.x*0.013)).a;float c2=texture2D(tN,cu*1.37+vec2(-uT3.x*0.017,uT3.x*0.019)).a;
  float ca=smoothstep(0.6,0.95,min(c1,c2));col+=ca*uw*uT3.y*0.28*(1.0-smoothstep(-2.0,-28.0,dh))*vec3(0.9,1.0,0.95);}
 #endif
 col*=1.0-uWet*0.2;
 float snow=uSnow*smoothstep(0.55,0.9,N.y)*(0.62+0.38*smoothstep(0.35,0.65,m2.b+(1.0-t3h)*0.25))*(1.0-uw);col=mix(col,vec3(0.86,0.9,0.95),snow);
 diffuseColor.rgb=col;t3wet=max(wb*0.85,max(uw,uWet*0.6));}`;
const T3_TERR_BUMP=`
#if T3D>0
{float bs=(1.0-t3far)*(1.2+t3rk*4.5);vec2 dH=vec2(dFdx(t3h),dFdy(t3h))*bs;vec3 sX=dFdx(-vViewPosition),sY=dFdy(-vViewPosition);vec3 vN=normal;
 vec3 R1=cross(sY,vN),R2=cross(vN,sX);float fD=dot(sX,R1)*faceDirection;vec3 gr=sign(fD)*(dH.x*R1+dH.y*R2);normal=normalize(abs(fD)*vN-gr);}
#endif`;
terrainSplatMat=function(m){const tx=t3Tex(),U=t3U();m.userData.noSea=1;T3.terr=m;m.defines=Object.assign(m.defines||{},{T3Q:G.q|0,T3D:(G.q|0)>0&&G.R&&G.R.capabilities.isWebGL2?1:0});
  m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{tG:{value:tx.tG},tD:{value:tx.tD},tR:{value:tx.tR},tS:{value:tx.tS},tN:{value:tx.tN},uT3:U.uW3||(U.uW3={value:new THREE.Vector4(0,1,0,0)}),uSnow:SEA.uSnow,uAut:SEA.uAut,uWet:SEA.uWet});
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 splat;attribute vec4 tq;varying vec4 vSp;varying vec4 vT2;varying vec3 vTW;varying vec3 vTN;')
      .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n  vSp=splat;vT2=tq;vTW=(modelMatrix*vec4(transformed,1.0)).xyz;vTN=normalize(mat3(modelMatrix)*objectNormal);');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D tG,tD,tR,tS,tN;uniform vec4 uT3;uniform float uSnow,uAut,uWet;varying vec4 vSp;varying vec4 vT2;varying vec3 vTW;varying vec3 vTN;')
      .replace('#include <color_fragment>','#include <color_fragment>\n'+T3_TERR_FS)
      .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n  roughnessFactor=clamp(roughnessFactor-t3rk*0.1-t3wet*0.55,0.32,1.0);')
      .replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\n'+T3_TERR_BUMP);};
  m.customProgramCacheKey=()=>'t3terr'+(G.q|0);m.needsUpdate=true;};
/* ---------- shader nước: sông/suối (RIVER), biển/hồ (mặc định), thác (FALL) ---------- */
const T3_WATER_VS=`
#ifdef RIVER
attribute vec4 aF;attribute vec4 aD;varying vec4 vF;varying vec4 vD;
#endif
#ifdef FALL
attribute vec3 aU;varying vec3 vU;
#endif
varying vec3 vW;
#include <fog_pars_vertex>
void main(){vec4 wp=modelMatrix*vec4(position,1.0);vW=wp.xyz;
#ifdef RIVER
 vF=aF;vD=aD;
#endif
#ifdef FALL
 vU=aU;
#endif
 vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`;
const T3_WATER_FS=`
uniform float uT;uniform vec4 uW;uniform vec3 cT,cH,cG,sC,sD;uniform float sI;uniform sampler2D tW;
#ifndef FALL
uniform vec4 uFish[16];
#endif
#ifdef RIVER
varying vec4 vF;varying vec4 vD;
#elif defined(FALL)
varying vec3 vU;
#else
uniform sampler2D tDep;uniform vec3 uB;uniform float uOz;
#endif
varying vec3 vW;
#include <fog_pars_fragment>
vec3 skyCol(vec3 d){float h=d.y;return h>0.0?mix(cH,cT,pow(clamp(h*1.6,0.0,1.0),0.6)):mix(cH,cG,pow(clamp(-h*4.0,0.0,1.0),0.7));}
void main(){vec3 toC=cameraPosition-vW;float dist=length(toC);vec3 V=toC/dist;float t=uT;vec3 sd=normalize(sD);float L=uW.x;
#ifdef FALL
 // màn nước thác: vệt trắng chảy xuống nhanh, mép mỏng, chân thác trắng xoá
 vec2 q1=vec2(vU.x*(1.0/7.0),vU.y*(1.0/46.0)-t*1.5);vec2 q2=vec2(vU.x*(1.0/3.2)+0.37,vU.y*(1.0/19.0)-t*2.4);
 float s1=texture2D(tW,q1).b;float s2=texture2D(tW,q2).b;float st=s1*0.6+s2*0.4;float fk=vU.z;
 float white=smoothstep(0.38,0.72,st+fk*0.3);vec3 base=mix(vec3(0.36,0.52,0.56),vec3(0.94,0.97,0.98),white);
 vec3 col=base*(0.25+0.85*L)+skyCol(reflect(-V,vec3(0.0,0.0,1.0)))*0.08;
 float a=(0.5+0.5*smoothstep(0.3,0.7,st))*smoothstep(0.0,0.08,fk+0.02);a*=uW.w;
 gl_FragColor=vec4(col,clamp(a,0.0,1.0));
#else
#ifdef RIVER
 vec2 dir=normalize(vF.zw+1e-5);vec2 side=vec2(dir.y,-dir.x);float depth=vD.x,spd=vD.y,fx=vD.z;
 if(vD.w>0.5){float fd=smoothstep(uW.z*0.75,uW.z,dist);if(fd>0.99)discard;}
 vec2 u1=vec2(vF.x*(1.0/27.0),(vF.y-t*spd)*(1.0/46.0));vec4 n1=texture2D(tW,u1);vec2 nt=n1.xy-0.5;float fm=n1.a;
 #if WQ>0
 vec4 n2=texture2D(tW,vec2(vF.x*(1.0/13.0)+0.41,(vF.y-t*spd*0.62)*(1.0/19.0)));nt+=(n2.xy-0.5)*0.75;fm=fm*0.55+n2.a*0.45;
 #endif
 float rough=clamp(spd/45.0,0.0,1.0);float amp=mix(0.32,1.25,rough);vec2 nw=(side*nt.x+dir*nt.y)*amp;
 float calm=1.0-rough;
#else
 vec2 tc=vec2(((vW.x+uB.x)*uB.y+0.5)*uB.z,((vW.z+uOz)*uB.y+0.5)*uB.z);vec4 dd=texture2D(tDep,tc);float ins=step(0.0,tc.x)*step(tc.x,1.0)*step(0.0,tc.y)*step(tc.y,1.0);
 float depth=mix(64.0,dd.r*64.0,ins);float calm=mix(0.0,dd.g,ins);float fx=0.0;float spd=0.0;
 vec4 n1=texture2D(tW,vW.xz*(1.0/95.0)+vec2(t*0.011,t*0.006));vec2 nt=n1.xy-0.5;float fm=n1.a;
 #if WQ>0
 vec4 n2=texture2D(tW,vW.xz*(1.0/37.0)+vec2(-t*0.016,t*0.012));nt+=(n2.xy-0.5)*0.7;fm=fm*0.55+n2.a*0.45;
 #endif
 vec2 nw=nt*mix(0.9,0.22,calm);
#endif
 float fishK=0.0;
 #if WQ>0
 // cá: nước trong hơn quanh con cá, thỉnh thoảng gợn vòng khi cá đớp mồi
 for(int i=0;i<16;i++){vec4 f=uFish[i];if(f.w<0.5)continue;vec2 dv=vW.xz-f.xy;float r=length(dv);fishK=max(fishK,1.0-smoothstep(5.0,18.0,r));
  float ph=fract(t*0.21+float(i)*0.37);if(ph<0.3&&r<26.0){float rr=ph*70.0;float ring=sin((r-rr)*0.9)*(1.0-smoothstep(0.0,4.0,abs(r-rr)))*(1.0-ph/0.3);nw+=dv/max(r,1e-3)*ring*0.4;}}
 #endif
 #if WQ>0
 // gợn mưa: vòng tròn loang trong từng ô
 if(uW.y>0.01){vec2 rp=vW.xz*(1.0/6.0);vec2 ce=floor(rp);vec2 f=fract(rp)-0.5;float hh=fract(sin(dot(ce,vec2(12.9898,78.233)))*43758.5453);vec2 o=(vec2(hh,fract(hh*31.7))-0.5)*0.5;
  float ph=fract(t*1.4+hh*7.0);vec2 dv=f-o;float r=length(dv);float ring=sin((r-ph*0.45)*55.0)*(1.0-ph)*(1.0-smoothstep(0.0,0.06,abs(r-ph*0.45)));nw+=dv/max(r,1e-3)*ring*uW.y*0.5;}
 #endif
 vec3 Nn=normalize(vec3(nw.x,1.0,nw.y));
 float NdV=clamp(dot(Nn,V),0.0,1.0);float F=0.02+0.98*pow(max(1.0-NdV,0.0),5.0);// clamp: pow(negative) = NaN -> black pixels spread by bloom
 vec3 Rf=reflect(-V,Nn);Rf.y=abs(Rf.y);vec3 refl=skyCol(Rf);
 float sp=max(dot(Rf,sd),0.0);vec3 spec=min(sC*(pow(sp,700.0)*6.0+pow(sp,120.0)*0.25)*sI*(1.0-calm*0.3),vec3(1.6));
 vec3 shallow=vec3(0.20,0.38,0.30);vec3 deep=vec3(0.02,0.11,0.14);
 #ifdef RIVER
 shallow=mix(shallow,vec3(0.30,0.33,0.20),0.3+uW.y*0.35);
 #endif
 float dk=1.0-exp(-max(depth,0.0)*0.11);vec3 body=mix(shallow,deep,dk)*(0.15+0.85*L)*(0.85+0.3*max(dot(Nn,sd),0.0)*sI);
 vec3 col=mix(body,refl,F*0.9)+spec;
 float a=mix(0.42,0.95,smoothstep(0.0,14.0,depth));a=max(a,F*0.9);
 a*=1.0-fishK*0.5;
 // bọt: mép bờ, ghềnh, chân thác
 float shore=1.0-smoothstep(0.0,3.2,depth);float foam=shore*smoothstep(0.45,0.8,fm+shore*0.35+sin(t*1.7+vW.x*0.05+vW.z*0.04)*0.08);
 #ifdef RIVER
 foam=max(foam,smoothstep(0.35,0.95,rough)*smoothstep(0.55,0.85,fm+rough*0.15));foam=max(foam,fx*smoothstep(0.25,0.6,fm+fx*0.45));
 #endif
 foam*=mix(1.0,0.5,calm);col=mix(col,vec3(0.9,0.94,0.95)*(0.22+0.8*L),foam*0.85);a=max(a,foam*0.92);
 a*=smoothstep(-0.4,0.7,depth);
 #ifdef RIVER
 if(vD.w>0.5)a*=1.0-smoothstep(uW.z*0.75,uW.z,dist);
 #endif
 gl_FragColor=vec4(clamp(col,0.0,4.0),clamp(a,0.0,1.0));
#endif
#include <tonemapping_fragment>
#include <encodings_fragment>
#include <fog_fragment>
}`;
function t3WaterMat(kind){const T=THREE,U=t3U(),tx=t3Tex();const un=Object.assign(T.UniformsUtils.clone(T.UniformsLib.fog),{uFish:U.uFish,uT:U.uT,uW:kind==='fall'?(U.uWf||(U.uWf={value:new T.Vector4(1,0,900,1)})):U.uW,cT:U.cT,cH:U.cH,cG:U.cG,sC:U.sC,sD:U.sD,sI:U.sI,tW:{value:tx.tW}});
  const def={WQ:G.q|0};if(kind==='river')def.RIVER=1;if(kind==='fall')def.FALL=1;
  const m=new T.ShaderMaterial({uniforms:un,defines:def,vertexShader:T3_WATER_VS,fragmentShader:T3_WATER_FS,transparent:true,depthWrite:false,fog:true,side:kind==='fall'?T.DoubleSide:T.FrontSide});
  m.userData.noSea=1;T3.wmats.push(m);return m;}
// độ sâu biển/hồ: R = độ sâu (0..64), G = mức lặng (hồ trong đất liền lặng, biển khơi động)
function t3DepthTex(){const T=THREE,d=new Uint8Array(HN*HN*4);for(let j=0;j<HN;j++)for(let i=0;i<HN;i++){const k=j*HN+i,x=-WSIZE/2+i*HSTEP,z=-WOZ+j*HSTEP,r=Math.hypot(x,z*1.04)/WR;
    d[k*4]=Math.round(clamp((0.5-HG[k])/64,0,1)*255);d[k*4+1]=Math.round((0.25+0.75*(1-ss(0.7,0.86,r)))*255);d[k*4+3]=255;}
  const t=new T.DataTexture(d,HN,HN,T.RGBAFormat,T.UnsignedByteType);t.wrapS=t.wrapT=T.ClampToEdgeWrapping;t.magFilter=t.minFilter=T.LinearFilter;t.generateMipmaps=false;t.needsUpdate=true;return t;}
/* ---------- dải nước sông & suối nhỏ: một lưới chung, một lệnh vẽ ---------- */
function t3RiverGeo(){const pos=[],aF=[],aD=[],idx=[];let vb=0;
  const ribbon=(P,Y,HW,SPD,FX,brook,skip)=>{const NX=brook?2:8,n=P.length;let along=0;const rows=[];
    for(let i=0;i<n;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,ux=dx/L,uz=dz/L,sx=uz,sz=-ux;if(i>0)along+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);
      const hw=HW[i],y=Y[i];for(let c=0;c<=NX;c++){const f=0.5-c/NX,x=P[i][0]+sx*hw*2*f,z=P[i][1]+sz*hw*2*f,gy=brook?hAt(x,z)+0.45:y;const yy=brook?Math.min(gy,y+1.2):y;
        let dep=brook?(c===1?1.6:-0.7):yy-hAt(x,z);dep=clamp(dep,-10,64);pos.push(x,yy,z);aF.push(f*2*hw,along,ux,uz);aD.push(dep,SPD[i],FX[i],brook?1:0);}rows.push(vb);vb+=NX+1;}
    for(let i=1;i<n;i++){if(skip&&skip(i))continue;const r0=rows[i-1],r1=rows[i];for(let c=0;c<NX;c++){const a=r0+c,b=r0+c+1,cc=r1+c,d=r1+c+1;idx.push(a,b,cc,b,d,cc);}}};
  for(const r of RIV){if(!r.s)continue;const P0=r.pts,s0=r.s,n0=P0.length,P=[],Y=[],HW=[],SPD=[],FX=[],DROP=[];
    // chia đôi mỗi đoạn để lấy độ sâu mịn hơn
    for(let i=0;i<n0;i++){const sub=i<n0-1?2:1;for(let k=0;k<sub;k++){const t=k/sub,j=Math.min(n0-1,i+1);if(k>0&&s0[i]-s0[j]>=16)continue;
        const x=P0[i][0]+(P0[j][0]-P0[i][0])*t,z=P0[i][1]+(P0[j][1]-P0[i][1])*t,s=s0[i]+(s0[j]-s0[i])*t,w=r.w[0]+(r.w[1]-r.w[0])*(i+t)/n0;
        P.push([x,z]);Y.push(s+0.4);HW.push(w*0.5+9);DROP.push(k===0&&i>0&&s0[i-1]-s0[i]>=16?1:0);
        const a=s0[Math.max(0,i-1)],b=s0[Math.min(n0-1,i+2)],sl=Math.max(0,(a-b)/(34*3));SPD.push(clamp((7+sl*420)*Math.pow(30/w,0.25),5,75));}}
    // bọt chân thác & gần mép thác
    for(let i=0;i<P.length;i++){let f=0;for(let k=Math.max(0,i-14);k<=i;k++)if(DROP[k])f=Math.max(f,1-(i-k)/14);if(i+1<P.length&&DROP[i+1])f=Math.max(f,0.35);FX.push(f);}
    ribbon(P,Y,HW,SPD,FX,false,i=>DROP[i]||Y[i]<1.0&&Y[i-1]<1.0);}
  for(const b of T3.brooks){const n=b.p.length,HW=[],SPD=[],FX=[];for(let i=0;i<n;i++){const f=i/(n-1);HW.push(2.2+f*3.6);const a=b.y[Math.max(0,i-2)],c=b.y[Math.min(n-1,i+2)],sl=Math.max(0,(a-c)/40);SPD.push(clamp(8+sl*160,6,34));FX.push(0);}ribbon(b.p,b.y,HW,SPD,FX,true,null);}
  const T=THREE,g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('aF',new T.Float32BufferAttribute(aF,4));g.setAttribute('aD',new T.Float32BufferAttribute(aD,4));g.setIndex(idx);g.computeBoundingSphere();return g;}
/* ---------- thác: màn nước cong theo quỹ đạo rơi + hạt bọt/bụi nước ---------- */
function t3Falls(){const T=THREE,pos=[],aU=[],idx=[],pp=[],ps=[],pd=[];let vb=0;const R=rng(((S&&S.seed)|0)+4242),NP=[14,28,40][G.q|0]||28;
  for(const r of RIV){if(!r.s)continue;const P=r.pts,s=r.s,n=P.length;for(let k=1;k<n;k++){const drop=s[k-1]-s[k];if(drop<16)continue;
      const A=P[k-1],B=P[k],dx=B[0]-A[0],dz=B[1]-A[1],L=Math.hypot(dx,dz)||1,ux=dx/L,uz=dz/L,sx=uz,sz=-ux,w=r.w[0]+(r.w[1]-r.w[0])*k/n,top=s[k-1]+0.45,bot=s[k]+0.3;
      const NR=12,NC=6;for(let a=0;a<=NR;a++){const t=-0.12+a/NR*1.12,tt=Math.max(0,t),y=t<0?top:top-(top-bot)*tt*tt,hw=(w*0.5+3)*(1+tt*0.15);        for(let c=0;c<=NC;c++){const f=0.5-c/NC,x=A[0]+dx*t+sx*hw*2*f,z=A[1]+dz*t+sz*hw*2*f;pos.push(x,y,z);aU.push(f*2*hw,0,tt);}}
      // độ dài cung theo hàng (cho vân chảy đều)
      let acc=0;for(let a=0;a<=NR;a++){if(a>0){const i0=(vb+(a-1)*(NC+1))*3,i1=(vb+a*(NC+1))*3;acc+=Math.hypot(pos[i1]-pos[i0],pos[i1+1]-pos[i0+1],pos[i1+2]-pos[i0+2]);}for(let c=0;c<=NC;c++)aU[(vb+a*(NC+1)+c)*3+1]=acc;}
      for(let a=0;a<NR;a++)for(let c=0;c<NC;c++){const p=vb+a*(NC+1)+c;idx.push(p,p+1,p+NC+1,p+1,p+NC+2,p+NC+1);}vb+=(NR+1)*(NC+1);
      // hạt: bụi nước lớn bay lên chậm + bọt bắn nhanh
      for(let i=0;i<NP;i++){const mist=i<NP*0.35;pp.push(B[0]+(R()-0.5)*0.2,bot,B[1]);ps.push(R(),R(),R(),mist?1:0);pd.push(ux,uz,w*0.5+4,Math.min(60,drop));}}}
  if(!idx.length)return null;const grp=new T.Group();
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('aU',new T.Float32BufferAttribute(aU,3));g.setIndex(idx);g.computeBoundingSphere();
  const sheet=new T.Mesh(g,t3WaterMat('fall'));sheet.renderOrder=3;grp.add(sheet);
  const gp=new T.BufferGeometry();gp.setAttribute('position',new T.Float32BufferAttribute(pp,3));gp.setAttribute('aS',new T.Float32BufferAttribute(ps,4));gp.setAttribute('aDir',new T.Float32BufferAttribute(pd,4));gp.computeBoundingSphere();gp.boundingSphere.radius+=120;
  const U=t3U(),pm=new T.ShaderMaterial({uniforms:Object.assign(T.UniformsUtils.clone(T.UniformsLib.fog),{uT:U.uT,uW:U.uW,uPx:U.uPx}),transparent:true,depthWrite:false,fog:true,
    vertexShader:`attribute vec4 aS;attribute vec4 aDir;uniform float uT,uPx;varying float vA;varying float vM;
#include <fog_pars_vertex>
void main(){float mist=aS.w;float rate=mist>0.5?0.12+aS.y*0.08:0.55+aS.y*0.5;float ph=fract(uT*rate+aS.x*7.13);vec3 p=position;vec2 dir=aDir.xy;vec2 side=vec2(dir.y,-dir.x);
 float across=(aS.z-0.5)*2.0*aDir.z;p.xz+=side*across*(mist>0.5?1.2:0.9);
 if(mist>0.5){p.y+=ph*(26.0+aDir.w*0.6);p.xz+=dir*ph*(30.0+aS.y*30.0)+side*sin(ph*3.0+aS.x*6.0)*8.0;}
 else{float v0=10.0+aS.y*18.0;p.y+=v0*ph*1.6-ph*ph*36.0+1.0;p.xz+=dir*ph*(8.0+aS.x*26.0)+side*(aS.z-0.5)*ph*14.0;}
 vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;
 float sz=mist>0.5?(14.0+ph*36.0+aS.y*10.0):(2.5+aS.y*3.5)*(1.0+ph);gl_PointSize=clamp(sz*projectionMatrix[1][1]*uPx/max(-mvPosition.z,1.0),1.0,220.0);
 vA=(mist>0.5?0.13:0.6)*smoothstep(0.0,0.12,ph)*(1.0-ph);vM=mist;
#include <fog_vertex>
}`,
    fragmentShader:`uniform vec4 uW;varying float vA;varying float vM;
#include <fog_pars_fragment>
void main(){vec2 d=gl_PointCoord-0.5;float r=length(d)*2.0;float a=vM>0.5?exp(-r*r*3.5)*(1.0-r):(1.0-smoothstep(0.3,1.0,r));a*=vA;if(a<0.01)discard;
 gl_FragColor=vec4(vec3(0.93,0.96,0.97)*(0.22+0.85*uW.x),a);
#include <tonemapping_fragment>
#include <encodings_fragment>
#include <fog_fragment>
}`});pm.userData.noSea=1;const pts=new T.Points(gp,pm);pts.renderOrder=4;grp.add(pts);return grp;}
/* ---------- đá tảng lòng sông & ghềnh (vẽ hàng loạt, chia ô để cắt theo khung nhìn) ---------- */
function t3RockGeo(){const T=THREE,g=new T.IcosahedronGeometry(1,1),p=g.attributes.position,col=[],nor=[];
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),n=1+NS.n2(x*1.7+3,z*1.7+y*1.3)*0.28+NS.n2(x*3.9,y*3.9+z)*0.1;p.setXYZ(i,x*n,y*n*(y<0?0.7:1),z*n);nor.push(x,y,z);
    const k=0.62+NS.n2(x*5+y*3,z*5)*0.2,wet=y<0.1?0.6:1,moss=y>0.4?0.35:0;col.push((0.50*k*wet)*(1-moss)+0.2*moss,(0.48*k*wet)*(1-moss)+0.27*moss,(0.44*k*wet)*(1-moss)+0.1*moss);}
  g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));return g;}
function t3Rocks(){const T=THREE,R=rng(((S&&S.seed)|0)*7+99),L=[];
  const put=(x,z,s,sunk)=>{if(trailAt(x,z)>0.15||decoBlock(x,z))return;L.push([x,hAt(x,z)-s*sunk,z,s,R()*6.283,0.5+R()*0.35]);};
  for(const r of RIV){if(!r.s)continue;const P=r.pts,s=r.s,n=P.length;for(let i=1;i<n-1;i++){if(s[i]<1)continue;const w=r.w[0]+(r.w[1]-r.w[0])*i/n,dx=P[i+1][0]-P[i-1][0],dz=P[i+1][1]-P[i-1][1],l=Math.hypot(dx,dz)||1,sx=dz/l,sz=-dx/l;
      const sl=Math.max(0,(s[i-1]-s[i+1])/68),rap=sl>0.05&&s[i-1]-s[i]<16&&s[i]-s[i+1]<16,fall=s[i-1]-s[i]>=16;
      let m=fall?7:rap?3+Math.floor(sl*12):(R()<0.35?1:0);m=Math.min(m,8);
      for(let k=0;k<m;k++){const across=(R()*2-1)*(fall?w*0.5+12:rap?w*0.5:w*0.5+6),along=(R()-0.5)*30,x=P[i][0]+sx*across+dx/l*along,z=P[i][1]+sz*across+dz/l*along;
        const sz2=fall?(6+R()*12)*(Math.abs(across)>w*0.45?1.4:0.8):rap?3+R()*7:2.5+R()*6;put(x,z,sz2,fall||rap?0.35:0.45);}}}
  // sắp ngẫu nhiên để khi giảm số lượng (chất lượng thấp) vẫn rải đều
  for(let i=L.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[L[i],L[j]]=[L[j],L[i]];}
  const geo=t3RockGeo(),mat=new T.MeshStandardMaterial({vertexColors:true,roughness:0.88,metalness:0}),C=3,cs=WSIZE/C,cells=new Map(),grp=new T.Group();
  L.forEach(r=>{const key=Math.min(C-1,Math.max(0,Math.floor((r[0]+WSIZE/2)/cs)))+','+Math.min(C-1,Math.max(0,Math.floor((r[2]+WOZ)/cs)));if(!cells.has(key))cells.set(key,[]);cells.get(key).push(r);});
  const M=new T.Matrix4(),Q=new T.Quaternion(),E=new T.Euler(),V=new T.Vector3(),SC=new T.Vector3(),CL=new T.Color();T3.rocks=[];
  for(const list of cells.values()){let mnx=1e9,mxx=-1e9,mnz=1e9,mxz=-1e9,mny=1e9,mxy=-1e9;list.forEach(r=>{mnx=Math.min(mnx,r[0]);mxx=Math.max(mxx,r[0]);mnz=Math.min(mnz,r[2]);mxz=Math.max(mxz,r[2]);mny=Math.min(mny,r[1]);mxy=Math.max(mxy,r[1]);});
    const g=new T.BufferGeometry();for(const k in geo.attributes)g.setAttribute(k,geo.attributes[k]);const c=new T.Vector3((mnx+mxx)/2,(mny+mxy)/2,(mnz+mxz)/2);g.boundingSphere=new T.Sphere(c,Math.hypot(mxx-mnx,mxy-mny,mxz-mnz)/2+40);
    const im=new T.InstancedMesh(g,mat,list.length);list.forEach((r,i)=>{E.set((R()-0.5)*0.4,r[4],(R()-0.5)*0.4);Q.setFromEuler(E);V.set(r[0],r[1],r[2]);SC.set(r[3]*(0.9+R()*0.3),r[3]*r[5],r[3]*(0.8+R()*0.3));M.compose(V,Q,SC);im.setMatrixAt(i,M);
      const v=0.85+R()*0.3;CL.setRGB(v,v*(0.98+R()*0.04),v*(0.94+R()*0.06));im.setColorAt(i,CL);});
    im.castShadow=false;im.receiveShadow=true;im.userData.full=list.length;im.userData.c=c;grp.add(im);T3.rocks.push(im);}
  return grp;}
/* ---------- mặt nước tổng: biển/hồ + sông/suối + thác + đá ---------- */
waterMesh=function(){const T=THREE,grp=new T.Group(),U=t3U();
  const seaM=t3WaterMat('sea');seaM.uniforms.tDep={value:t3DepthTex()};seaM.uniforms.uB={value:new T.Vector3(WSIZE/2,1/HSTEP,1/HN)};seaM.uniforms.uOz={value:WOZ};
  const g=new T.PlaneGeometry(WSIZE*2.5,WSIZE*2.5,1,1);g.rotateX(-Math.PI/2);const sea=new T.Mesh(g,seaM);sea.position.y=0.5;sea.renderOrder=2;grp.add(sea);
  try{const rg=t3RiverGeo();if(rg.index&&rg.index.count){const rm=new T.Mesh(rg,t3WaterMat('river'));rm.renderOrder=2;grp.add(rm);}}catch(e){console.warn('sông',e);}
  try{const f=t3Falls();if(f)grp.add(f);}catch(e){console.warn('thác',e);}
  try{grp.add(t3Rocks());}catch(e){console.warn('đá sông',e);}
  G.falls=WFALLS.map(f=>Object.assign({o:null},f));grp.material=seaM;t3Quality();return grp;};
/* ---------- chất lượng & cập nhật mỗi khung ---------- */
function t3Quality(){const q=G.q|0;for(const m of T3.wmats){if(m.defines.WQ!==q){m.defines.WQ=q;m.needsUpdate=true;}}
  const tm=T3.terr;if(tm){const d=q>0&&G.R&&G.R.capabilities.isWebGL2?1:0;if(tm.defines.T3Q!==q||tm.defines.T3D!==d){tm.defines.T3Q=q;tm.defines.T3D=d;tm.needsUpdate=true;}}
  if(T3.cloudM&&T3.cloudM.defines.CQ!==q){T3.cloudM.defines.CQ=q;T3.cloudM.needsUpdate=true;}
  for(const im of T3.rocks)im.count=q===0?Math.ceil(im.userData.full*0.6):im.userData.full;
  if(T3.U&&T3.U.uW)T3.U.uW.value.z=[800,1100,1500][q];}
{const _aq=applyQ;applyQ=function(){_aq();try{t3Quality();}catch(e){}};}
function t3Tick(){const U=T3.U;if(!U||!G.L)return;const t=(G.t||0)%1200;U.uT.value=t;
  const L=clamp((G.L.sun.intensity||0)*0.42+(G.L.hemi.intensity||0)*1.5+(G.moon?G.moon.intensity*0.4:0),0.05,1.2),rain=(G.wxK||0)*(S.wx&&(S.wx.type==='rain'||S.wx.type==='storm')?1:0);
  U.uW.value.x=L;U.uW.value.y=rain;if(U.uWf){U.uWf.value.x=L;U.uWf.value.w=1;}if(U.uW3){U.uW3.value.x=t;U.uW3.value.y=L;U.uW3.value.z=rain;}
  if(G.R){const h=G.R.getDrawingBufferSize(t3Tick.v||(t3Tick.v=new THREE.Vector2())).y;U.uPx.value=h*0.5;}
  // đá ở xa: ẩn bớt (cắt theo khung nhìn đã có, đây thêm giới hạn khoảng cách)
  if(G.t-(T3.rT||0)>0.5){T3.rT=G.t;const cp=G.cam.position,lim=(G.fogF||3600)*0.7;for(const im of T3.rocks){const s=im.geometry.boundingSphere;im.visible=Math.hypot(s.center.x-cp.x,s.center.z-cp.z)-s.radius<lim;}}}
{const _st=skyTick;skyTick=function(){_st();try{t3Tick();}catch(e){}};}
/* ===================== MÂY, SƯƠNG THUNG LŨNG, KHÓI BẾP, BÓNG CÁ ===================== */
// Mây: một vòm (như vòm trời) chiếu lên mặt phẳng mây cao, trôi theo gió, dày lên khi trời xấu (G.wxK), nhuộm màu theo giờ trong ngày.
// Vẽ sát mặt phẳng xa nên chỉ hiện ở chỗ trống phía sau mọi vật. 1 lệnh vẽ.
function t3Clouds(){const T=THREE,U=t3U(),tx=t3Tex();U.uC=U.uC||{value:new T.Vector4(0.3,1,0,0)};U.uCam=U.uCam||{value:new T.Vector3()};
  const m=new T.ShaderMaterial({uniforms:{tN:{value:tx.tN},uT:U.uT,uC:U.uC,uCam:U.uCam,cT:U.cT,cH:U.cH,sC:U.sC,sD:U.sD,sI:U.sI},defines:{CQ:G.q|0},transparent:true,depthWrite:false,depthTest:true,fog:false,side:T.BackSide,
    vertexShader:'varying vec3 vD;void main(){vD=position;vec4 p=projectionMatrix*vec4(mat3(viewMatrix)*position,1.0);gl_Position=p.xyww;}',
    fragmentShader:`uniform sampler2D tN;uniform float uT,sI;uniform vec4 uC;uniform vec3 uCam,cT,cH,sC,sD;varying vec3 vD;
void main(){vec3 d=normalize(vD);if(d.y<0.015)discard;vec2 p=d.xz/(d.y+0.06);vec2 wnd=vec2(uT*0.0042,uT*0.0017);
 vec2 uv=p*0.22+uCam.xz*(1.0/26000.0)+wnd;float n=texture2D(tN,uv).r;
 #if CQ>0
 n=n*0.62+texture2D(tN,uv*2.9+vec2(0.31,0.17)+wnd*1.7).b*0.38;
 #endif
 float cov=uC.x;float den=smoothstep(1.0-cov,1.0-cov+0.24,n);if(den<0.004)discard;
 vec3 sd=normalize(sD);float n2=texture2D(tN,uv+normalize(sd.xz+1e-4)*0.035).r;float lit=clamp(0.55+(n-n2)*5.0,0.0,1.0);
 vec3 base=mix(cH,vec3(1.0),0.55)*uC.y;vec3 dark=mix(cH*0.55,vec3(0.32,0.35,0.4),uC.z)*uC.y;
 vec3 col=mix(base,dark,clamp(den*0.6+uC.z*0.5-lit*0.35,0.0,1.0))+sC*sI*lit*0.22*(1.0-uC.z);
 float sun=max(dot(d,sd),0.0);col+=sC*pow(sun,8.0)*0.35*sI*(1.0-den*0.5);
 float a=den*smoothstep(0.015,0.16,d.y)*0.92;gl_FragColor=vec4(col,a);
#include <tonemapping_fragment>
#include <encodings_fragment>
}`});m.userData.noSea=1;T3.cloudM=m;const me=new T.Mesh(new T.SphereGeometry(10,24,12),m);me.frustumCulled=false;me.renderOrder=-1e9+1;return me;}
// Sương thung lũng: tấm mờ luôn quay về camera, rải dọc sông, quanh hồ và các thung thấp; dày lúc rạng sáng và sau mưa.
function t3Mist(){const T=THREE,U=t3U(),tx=t3Tex(),R=rng(((S&&S.seed)|0)+515),L=[];
  for(const r of RIV){if(!r.s)continue;for(let i=2;i<r.pts.length-2;i+=r.main?3:4){const [x,z]=r.pts[i];if(r.s[i]<0.6)continue;const w=r.w[0]+(r.w[1]-r.w[0])*i/r.pts.length;L.push([x+(R()-0.5)*w*2,r.s[i]+8+R()*14,z+(R()-0.5)*w*2,110+R()*150]);}}
  const lake=REG.find(q=>q.id==='lake');if(lake)for(let i=0;i<22;i++){const a=R()*6.283,d=Math.sqrt(R())*lake.r;L.push([lake.x+Math.cos(a)*d,8+R()*12,lake.z+Math.sin(a)*d,150+R()*150]);}
  let t=0;while(L.length<150&&t<6000){t++;const x=(R()*2-1)*WR*0.8,z=(R()*2-1)*WR*0.8,h=hAt(x,z);if(h<3||h>90||slopeAt(x,z)>0.3)continue;if(moist(x,z)+jungleK(x,z)*0.4<0.0)continue;L.push([x,h+10+R()*10,z,140+R()*140]);}
  for(let i=L.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[L[i],L[j]]=[L[j],L[i]];}
  U.uMist=U.uMist||{value:new T.Vector4(0,1,0,0)};
  const m=new T.ShaderMaterial({uniforms:Object.assign(T.UniformsUtils.clone(T.UniformsLib.fog),{tN:{value:tx.tN},uT:U.uT,uMist:U.uMist,cH:U.cH,sC:U.sC,sI:U.sI}),transparent:true,depthWrite:false,fog:true,
    vertexShader:`varying vec2 vQ;varying vec3 vP;varying float vS;
#include <fog_pars_vertex>
void main(){vec3 c=instanceMatrix[3].xyz;float s=length(instanceMatrix[0].xyz);vec3 rt=vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]);
 vec3 wp=c+rt*position.x*s+vec3(0.0,1.0,0.0)*position.y*s*0.38;vQ=position.xy*2.0;vP=wp;vS=s;vec4 mvPosition=viewMatrix*vec4(wp,1.0);gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,
    fragmentShader:`uniform sampler2D tN;uniform float uT,sI;uniform vec4 uMist;uniform vec3 cH,sC;varying vec2 vQ;varying vec3 vP;varying float vS;
#include <fog_pars_fragment>
void main(){float r=length(vQ);if(r>1.0)discard;float n=texture2D(tN,vP.xz*(1.0/420.0)+vec2(uT*0.006,uT*0.003)+vQ*0.12).g;
 float a=(1.0-smoothstep(0.15,1.0,r))*smoothstep(0.25,0.75,n+0.2)*(1.0-smoothstep(-0.2,1.0,vQ.y)*0.5)*uMist.x;
 float cd=length(cameraPosition-vP);a*=smoothstep(vS*0.15,vS*0.9,cd);if(a<0.004)discard;
 vec3 col=mix(cH,vec3(1.0),0.45)*uMist.y+sC*sI*0.12;gl_FragColor=vec4(col,a*0.4);
#include <tonemapping_fragment>
#include <encodings_fragment>
#include <fog_fragment>
}`});m.userData.noSea=1;
  const g=new T.PlaneGeometry(1,1),im=new T.InstancedMesh(g,m,L.length),M=new T.Matrix4();L.forEach((q,i)=>{M.makeScale(q[3],q[3],q[3]);M.setPosition(q[0],q[1],q[2]);im.setMatrixAt(i,M);});
  im.frustumCulled=false;im.renderOrder=5;im.userData.full=L.length;im.visible=false;T3.mist=im;return im;}
// Khói bếp/lửa trại: hạt mềm bay lên, trôi theo gió. Vị trí 8 đống lửa gần nhất truyền qua đồng phục. 1 lệnh vẽ.
function t3Smoke(){const T=THREE,U=t3U(),NF=8,NP=18,pos=[],sd=[],R=rng(77);U.uF=U.uF||{value:Array.from({length:NF},()=>new T.Vector4(0,-1e4,0,0))};
  for(let f=0;f<NF;f++)for(let i=0;i<NP;i++){pos.push(0,0,0);sd.push(R(),R(),R(),f);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('aS',new T.Float32BufferAttribute(sd,4));
  const m=new T.ShaderMaterial({uniforms:Object.assign(T.UniformsUtils.clone(T.UniformsLib.fog),{uT:U.uT,uW:U.uW,uPx:U.uPx,uF:U.uF}),transparent:true,depthWrite:false,fog:true,
    vertexShader:`attribute vec4 aS;uniform float uT,uPx;uniform vec4 uF[8];varying float vA;
#include <fog_pars_vertex>
void main(){vec4 F=uF[int(aS.w+0.5)];float ph=fract(uT*(0.07+aS.y*0.03)+aS.x);vec3 p=F.xyz;
 p.y+=ph*150.0+2.0;p.x+=sin(ph*4.0+aS.z*6.0)*(3.0+ph*14.0)+ph*ph*46.0;p.z+=cos(ph*3.3+aS.x*6.0)*(3.0+ph*12.0)+ph*ph*18.0;
 vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;
 gl_PointSize=clamp((7.0+ph*48.0)*projectionMatrix[1][1]*uPx/max(-mvPosition.z,1.0),1.0,200.0);
 vA=F.w*smoothstep(0.0,0.08,ph)*(1.0-ph)*0.5;if(F.w<0.01)gl_Position=vec4(2.0,2.0,2.0,1.0);
#include <fog_vertex>
}`,
    fragmentShader:`uniform vec4 uW;varying float vA;
#include <fog_pars_fragment>
void main(){vec2 d=gl_PointCoord-0.5;float r=length(d)*2.0;float a=exp(-r*r*3.0)*(1.0-r)*vA;if(a<0.004)discard;
 gl_FragColor=vec4(vec3(0.62,0.62,0.6)*(0.25+0.75*uW.x),a);
#include <tonemapping_fragment>
#include <encodings_fragment>
#include <fog_fragment>
}`});m.userData.noSea=1;const pts=new T.Points(g,m);pts.frustumCulled=false;pts.renderOrder=6;T3.smoke=pts;return pts;}
// Bóng cá in dưới đáy nước (mờ, lệch theo hướng nắng) để nhìn thấy cá từ bờ. Chỉ đọc G.fish của life2.js, không đổi hành vi cá.
function t3FishShadow(){const T=THREE,m=new T.ShaderMaterial({uniforms:{uW:t3U().uW},transparent:true,depthWrite:false,
    vertexShader:'varying vec2 vQ;void main(){vQ=position.xz*2.0;gl_Position=projectionMatrix*viewMatrix*modelMatrix*instanceMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform vec4 uW;varying vec2 vQ;void main(){float r=length(vQ*vec2(1.0,0.85));float a=(1.0-smoothstep(0.2,1.0,r))*0.42*clamp(uW.x,0.2,1.0);if(a<0.01)discard;gl_FragColor=vec4(0.03,0.05,0.04,a);}'});
  m.userData.noSea=1;const g=new T.PlaneGeometry(1,1);g.rotateX(-Math.PI/2);const im=new T.InstancedMesh(g,m,16);im.frustumCulled=false;im.renderOrder=1;im.count=0;T3.fishSh=im;return im;}
function t3Extras(grp){for(const f of [t3Clouds,t3Mist,t3Smoke,t3FishShadow]){try{grp.add(f());}catch(e){console.warn('t3 hiệu ứng',f.name,e);}}}
{const _wm=waterMesh;waterMesh=function(){const g=_wm();t3Extras(g);return g;};}
// cập nhật mỗi khung: mây, sương, khói, cá
function t3Tick2(){const U=T3.U;if(!U)return;const cp=G.cam.position,wx=G.wxK||0,h=S.hour||12,storm=S.wx&&S.wx.type==='storm'?1:0,raining=S.wx&&(S.wx.type==='rain'||S.wx.type==='storm')?1:0,L=U.uW.value.x,dt=G.dt||0.016;
  if(U.uC){U.uC.value.set(0.3+wx*0.62,clamp(0.18+L*0.75,0.12,1.05),clamp(wx*1.1-0.2+storm*0.3,0,1),0);U.uCam.value.copy(cp);}
  // sương: rạng sáng + sau mưa (giảm dần) + chút khi mưa
  T3.post=raining?Math.min(1,(T3.post||0)+dt*0.05):Math.max(0,(T3.post||0)-dt*0.012);
  const dawn=ss(4.2,5.6,h)*(1-ss(7.6,9.6,h)),night=(h>21||h<4.2)?0.3:0,mist=clamp(Math.max(dawn*0.9,T3.post*(1-wx*0.6)*0.7,wx*0.18,night*0.6),0,1);
  if(T3.mist){U.uMist.value.x=mist;U.uMist.value.y=clamp(0.2+L*0.8,0.15,1.05);T3.mist.visible=mist>0.02;T3.mist.count=Math.ceil(T3.mist.userData.full*[0.18,0.5,0.8][G.q|0]);}
  // khói: tối đa 8 đống lửa đang cháy gần nhất
  if(U.uF&&G.t-(T3.fT||0)>0.5){T3.fT=G.t;const L2=[];for(const b of (S.builds||[])){if((b.k!=='campfire'&&b.k!=='hearth')||b.prog!=null)continue;let on=false;try{on=fireLit(b);}catch(e){}if(!on)continue;const d=Math.hypot(b.x-cp.x,b.z-cp.z);if(d<1600)L2.push([d,b]);}
    L2.sort((a,b)=>a[0]-b[0]);for(let i=0;i<8;i++){const e=L2[i],v=U.uF.value[i];if(e){const b=e[1];v.set(b.x,(b.y!=null?b.y:hAt(b.x,b.z))+(b.k==='hearth'?20:8),b.z,1-raining*0.3);}else v.set(0,-1e4,0,0);}if(T3.smoke)T3.smoke.visible=L2.length>0;}
  // cá
  if(U.uFish){const F=G.fish||[];let n=0;const sh=T3.fishSh,M=t3Tick2.M||(t3Tick2.M=new THREE.Matrix4()),Q=t3Tick2.Q||(t3Tick2.Q=new THREE.Quaternion()),V=t3Tick2.V||(t3Tick2.V=new THREE.Vector3()),SC=t3Tick2.S||(t3Tick2.S=new THREE.Vector3()),UP=new THREE.Vector3(0,1,0),sd=U.sD.value;
    for(let i=0;i<16;i++){const f=F[i],v=U.uFish.value[i];if(f&&f.live&&f.o&&f.o.visible){v.set(f.x,f.z,f.y,1);if(sh&&Math.hypot(f.x-cp.x,f.z-cp.z)<700){const by=hAt(f.x,f.z)+0.35,dep=Math.max(0,f.y-by),k=dep/Math.max(0.25,sd.y);
          Q.setFromAxisAngle(UP,f.a||0);V.set(f.x-sd.x*k,Math.max(by,hAt(f.x-sd.x*k,f.z-sd.z*k)+0.35),f.z-sd.z*k);SC.set(5,1,11);M.compose(V,Q,SC);sh.setMatrixAt(n++,M);}}else v.w=0;}
    if(sh){sh.count=n;sh.instanceMatrix.needsUpdate=true;}}}
{const _t1=t3Tick;t3Tick=function(){_t1();try{t3Tick2();}catch(e){}};}
