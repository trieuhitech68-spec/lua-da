/* ===================== VÙNG ĐẤT CÓ TÊN · ĐƯỜNG MÒN · BẢN ĐỒ · LA BÀN ===================== */
let REG=[],TRAILS=[],TRL=null,SCOL=[];
// tìm điểm tốt nhất theo hàm chấm điểm trên lưới thưa
function bestPoint(score,step){let best=null,bs=-1e8;step=step||60;for(let x=-WR;x<=WR;x+=step)for(let z=-WR;z<=WR;z+=step){const s=score(x,z);if(s>bs){bs=s;best=[x,z];}}return best;}
const bAt=(x,z)=>BG?BCODE[bgAt(x,z)]:biome(x,z);
function countBiome(x,z,b,r){let n=0,t=0;for(let a=0;a<8;a++)for(const d of [r*0.4,r*0.8]){t++;if(bAt(x+Math.cos(a*0.785)*d,z+Math.sin(a*0.785)*d)===b)n++;}return n/t;}
function regionsBuild(){const R=[],far=(x,z,d)=>R.every(r=>Math.hypot(r.x-x,r.z-z)>d);const add=(id,n,d,ic,p,r)=>{if(p)R.push({id,n,d,ic,x:p[0],z:p[1],r});};const M=RIV[0];
  add('start','Trảng Khởi Đầu','Bãi đất trống bằng phẳng bên bờ Sông Mẹ, nơi bạn tỉnh dậy. Hợp để dựng trại đầu tiên.','🔥',SPAWN,300);
  {let rb=null,rd=1e9;M.pts.forEach((p,i)=>{const d=Math.hypot(p[0]-SPAWN[0],p[1]-SPAWN[1]);if(d<rd){rd=d;rb=p;}});add('ford','Bến Sông Mẹ','Khúc sông rộng, nước chảy hiền, cá nhiều. Có lối lội qua ở chỗ cạn.','🌊',rb,260);}
  add('lake','Hồ Sen','Hồ nước ngọt phía tây nam. Mùa hạ sen nở, ven hồ có muỗi và cá sấu nhỏ ở đầm.','🪷',F(-0.3,0.3),480);
  add('range','Dãy Núi Tuyết','Dãy núi cao phía bắc, đỉnh phủ tuyết quanh năm, gió lạnh. Đá lửa, quặng đồng trong khe núi. Gấu và sói sống ở sườn núi.','🏔️',bestPoint((x,z)=>z>-0.35*WR?-1e9:hAt(x,z)-Math.abs(x)*0.05,120),900);
  add('karst','Núi Đá Vôi','Khối núi đá vôi dựng đứng như Tràng An – Bắc Sơn, có hang động. Khỉ sống trên vách đá.','⛰️',F(0.45,-0.33),760);
  {const K=F(0.45,-0.33),dx=SPAWN[0]-K[0],dz=SPAWN[1]-K[1],L=Math.hypot(dx,dz);let cp=null;for(let d=500;d<L;d+=12){const x=K[0]+dx/L*d,z=K[1]+dz/L*d;if(hAt(x,z)<baseH(K[0],K[1])-40&&slopeAt(x,z)<0.5&&wdAt(x,z)<0.1){cp=[x,z];break;}}add('cave','Hang Sơn Vi','Hang đá khô ráo dưới chân núi đá vôi: người xưa từng trú ở đây, vẽ tranh lên vách.','🕳️',cp,150);}
  add('plateau','Cao Nguyên Đá','Cao nguyên bằng phẳng bốn bề vách đá dựng đứng, chỉ có một dốc thoải phía tây nam để lên. Bò tót gặm cỏ trên đỉnh.','🪨',F(0.3,0.09),620);
  add('chasm','Vực Đá','Vết nứt sâu hun hút trên sườn cao nguyên. Ngã xuống là nguy to.','🕳️',F(0.385,-0.075),300);
  {let bi=-1,bs=0;M.pts.forEach((p,i)=>{if(p[1]>-0.18*WR||p[1]<-0.45*WR)return;const s=baseH(p[0]+80,p[1])-M.s[i];if(s>bs){bs=s;bi=i;}});if(bi>=0)add('gorge','Hẻm Vực Sông Mẹ','Sông Mẹ xẻ đôi núi đá thành hẻm sâu, vách dựng hai bên, nước chảy xiết.','🏞️',M.pts[bi],420);}
  if(WFALLS.length){const f=WFALLS.slice().sort((a,b)=>(b.top-b.bot)-(a.top-a.bot))[0];add('falls','Thác Bạc','Dòng suối đổ từ trên cao xuống, bụi nước trắng xoá, cầu vồng buổi sáng.','💧',[f.x,f.z],220);}
  add('savanna','Thảo Nguyên Tây','Đồng cỏ tranh mênh mông, cây đứng lẻ loi. Nai, bò tót đi từng đàn, hổ rình trong cỏ cao.','🌾',F(-0.46,-0.02),1100);
  add('jungle','Rừng Già','Rừng nhiệt đới rậm rạp, ẩm ướt: dây leo, chuối rừng, khỉ, rắn và hổ.','🌴',F(0.25,0.45),900);
  add('forest','Rừng Thông Sườn Núi','Rừng thông dưới chân dãy núi, nhiều gỗ tốt, nấm, sói lui tới.','🌲',bestPoint((x,z)=>z>-0.2*WR||z<-0.42*WR||!far(x,z,700)?-1e9:countBiome(x,z,'forest',320),120),600);
  add('bamboo','Rừng Tre Suối Tây','Bụi tre mọc dày dọc Suối Tây. Tre dùng làm ống nước, rổ rá, nhà sàn.','🎋',(()=>{const W=RIV.find(r=>r.id==='west');return W?W.pts[Math.floor(W.pts.length*0.62)]:null;})(),300);
  const mo=M.pts[M.pts.length-8];add('delta','Đầm Lầy Cửa Sông','Nơi Sông Mẹ đổ ra biển: bùn lầy, lau sậy, chim nước, cá sấu.','🐊',mo,420);
  add('beach','Bãi Cát Vàng','Bãi biển cát mịn phía tây nam, cọ mọc nghiêng, nhặt được vỏ ốc, sỏi đẹp.','🏖️',bestPoint((x,z)=>bAt(x,z)!=='beach'||!far(x,z,600)||x>0?-1e9:-Math.hypot(x+0.45*WR,z-0.62*WR),80),420);
  add('cliffs','Vách Biển Đông','Bờ biển phía đông là vách đá dựng đứng, sóng vỗ trắng xoá bên dưới.','🌊',bestPoint((x,z)=>x<0.6*WR||hAt(x,z)<20?-1e9:-Math.abs(Math.hypot(x,z*1.04)/WR-0.86)*1000-Math.abs(z)*0.02,80),500);
  add('banyan','Cây Đa Cổ Thụ','Cây đa trăm tuổi trên gò cao, rễ buông như rèm. Nơi nghỉ chân mát mẻ.','🌳',bestPoint((x,z)=>{const s=Math.hypot(x-SPAWN[0],z-SPAWN[1]),b=bAt(x,z);return (b!=='meadow'&&b!=='edge')||s<500||s>1000||!far(x,z,420)||slopeAt(x,z)>0.25||wdAt(x,z)>0?-1e9:hAt(x,z);},50),160);
  add('village','Làng Suối Tây','Bộ lạc láng giềng sống trong những nếp nhà sàn quanh bếp lửa chung. Họ hiếu khách, thích trao đổi.','🛖',bestPoint((x,z)=>{const s=Math.hypot(x-SPAWN[0],z-SPAWN[1]),q=riverQ(x,z);return s<1000||s>2000||slopeAt(x,z)>0.15||wdAt(x,z)>0||!far(x,z,600)||q.d<160||q.d>420||hAt(x,z)>120?-1e9:-Math.abs(q.d-260)-slopeAt(x,z)*300;},60),260);
  add('camp','Trại Núi Đá','Trại của bộ lạc Núi Đá hiếu chiến: hàng rào cọc, lều da, kho chiến lợi phẩm. Họ hay kéo đi cướp phá ban đêm.','⚔️',bestPoint((x,z)=>{const s=Math.hypot(x-SPAWN[0],z-SPAWN[1]);return s<1900||slopeAt(x,z)>0.2||wdAt(x,z)>0||!far(x,z,650)||hAt(x,z)>260||x<0.1*WR?-1e9:-Math.hypot(x-0.42*WR,z+0.1*WR)-slopeAt(x,z)*400;},70),220);
  add('hills','Đồi Đá Phía Đông','Đồi đá dốc, nhiều tảng lớn và đá lửa. Gấu nâu sống quanh đây.','🪨',bestPoint((x,z)=>x<0.25*WR||Math.hypot(x,z*1.04)>WR*0.75||!far(x,z,500)?-1e9:countBiome(x,z,'rock',260)+hAt(x,z)/400,100),520);
  REG=R;}
function regionAt(x,z){let best=null,bs=1;for(const r of REG){const k=Math.hypot(r.x-x,r.z-z)/r.r;if(k<bs){bs=k;best=r;}}return best;}
/* ---------- đường mòn: tìm đường ít dốc trên lưới thưa (A*), làm phẳng, lối lội qua sông ---------- */
function trailPath(a,b){const C=40,N=Math.ceil(WSIZE/C),idx=(i,j)=>j*N+i,toI=v=>Math.round((v+WSIZE/2)/C),toW=i=>-WSIZE/2+i*C,toJ=v=>Math.round((v+WOZ)/C),toZ=j=>-WOZ+j*C;
  const si=toI(a[0]),sj=toJ(a[1]),ti=toI(b[0]),tj=toJ(b[1]);const g=new Float32Array(N*N).fill(1e9),came=new Int32Array(N*N).fill(-1),H=[],push=e=>{H.push(e);let k=H.length-1;while(k>0){const p=(k-1)>>1;if(H[p][0]<=H[k][0])break;[H[p],H[k]]=[H[k],H[p]];k=p;}},pop=()=>{const t=H[0],l=H.pop();if(H.length){H[0]=l;let k=0;for(;;){const a=2*k+1,b2=a+1;let m=k;if(a<H.length&&H[a][0]<H[m][0])m=a;if(b2<H.length&&H[b2][0]<H[m][0])m=b2;if(m===k)break;[H[m],H[k]]=[H[k],H[m]];k=m;}}return t;},done=new Uint8Array(N*N);push([0,si,sj]);g[idx(si,sj)]=0;let it=0;
  const cost=(i,j)=>{const x=toW(i),z=toZ(j),h=hAt(x,z),wd=wdAt(x,z);if(wd>7)return 400;if(wd>0.5)return 30;const sl=slopeAt(x,z);return 1+sl*9+(sl>0.7?60:0)+(h>260?6:0);};
  while(H.length&&it++<220000){const [,i,j]=pop();if(done[idx(i,j)])continue;done[idx(i,j)]=1;if(i===ti&&j===tj)break;
    for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const ni=i+di,nj=j+dj;if(ni<0||nj<0||ni>=N||nj>=N)continue;const st=(di&&dj?1.414:1)*cost(ni,nj),ng=g[idx(i,j)]+st;
      if(ng<g[idx(ni,nj)]){g[idx(ni,nj)]=ng;came[idx(ni,nj)]=idx(i,j);push([ng+Math.hypot(ni-ti,nj-tj)*1.1,ni,nj]);}}}
  const out=[];let c=idx(ti,tj);if(came[c]<0)return null;while(c>=0){out.push([toW(c%N),toZ(Math.floor(c/N))]);c=came[c];}out.reverse();
  // làm mềm (Chaikin) và uốn nhẹ cho tự nhiên
  let p=out;for(let k=0;k<3;k++){const q=[p[0]];for(let i=0;i<p.length-1;i++){const [x0,z0]=p[i],[x1,z1]=p[i+1];q.push([x0*0.75+x1*0.25,z0*0.75+z1*0.25],[x0*0.25+x1*0.75,z0*0.25+z1*0.75]);}q.push(p[p.length-1]);p=q;}
  return p.map(([x,z],i)=>[x+NS.fbm(x/160,z/160+40,2)*16,z+NS.fbm(x/160+20,z/160,2)*16]);}
function trailsBuild(){TRAILS=[];TRL=new Float32Array(HN*HN);const R=id=>REG.find(r=>r.id===id);
  const pairs=[['start','ford'],['start','banyan'],['banyan','savanna'],['start','lake'],['lake','beach'],['ford','gorge'],['gorge','forest'],['forest','range'],['start','plateau'],['plateau','chasm'],['plateau','falls'],['chasm','karst'],['karst','cave'],['ford','bamboo'],['bamboo','savanna'],['start','jungle'],['jungle','delta'],['delta','beach'],['jungle','cliffs'],['hills','cliffs'],['karst','hills'],['start','village'],['village','bamboo'],['hills','camp'],['camp','chasm']].concat(typeof trails4==='function'?trails4():[]);
  for(const [a,b] of pairs){const A=R(a),B=R(b);if(!A||!B)continue;const p=trailPath([A.x,A.z],[B.x,B.z]);if(p)TRAILS.push({a,b,p});}
  // vẽ vào lưới: cường độ theo khoảng cách tới đường
  const W=13;for(const t of TRAILS){const p=t.p;for(let k=0;k<p.length-1;k++){const [x0,z0]=p[k],[x1,z1]=p[k+1];const i0=Math.floor((Math.min(x0,x1)-W*2+WSIZE/2)/HSTEP),i1=Math.ceil((Math.max(x0,x1)+W*2+WSIZE/2)/HSTEP),j0=Math.floor((Math.min(z0,z1)-W*2+WOZ)/HSTEP),j1=Math.ceil((Math.max(z0,z1)+W*2+WOZ)/HSTEP);
      for(let j=Math.max(0,j0);j<=Math.min(HN-1,j1);j++)for(let i=Math.max(0,i0);i<=Math.min(HN-1,i1);i++){const x=-WSIZE/2+i*HSTEP,z=-WOZ+j*HSTEP,dx=x1-x0,dz=z1-z0,l2=dx*dx+dz*dz||1;let u=((x-x0)*dx+(z-z0)*dz)/l2;u=clamp(u,0,1);
        const d=Math.hypot(x-(x0+dx*u),z-(z0+dz*u)),v=1-ss(W*0.55,W*1.6,d);if(v>TRL[j*HN+i])TRL[j*HN+i]=v;}}}
  // làm phẳng mặt đường, lối lội qua nước nông
  const H2=HG.slice();for(let j=1;j<HN-1;j++)for(let i=1;i<HN-1;i++){const v=TRL[j*HN+i];if(v<=0)continue;const k=j*HN+i;let avg=0;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++)avg+=HG[k+dj*HN+di];avg/=9;let h=HG[k]*(1-v*0.7)+avg*v*0.7-v*0.5;const w=WG[k];if(w>-900&&h<w-0.5)h=Math.max(h,(w-3.5)*v+h*(1-v));H2[k]=h;}HG=H2;}
function trailAt(x,z){if(!TRL)return 0;const i=Math.round((x+WSIZE/2)/HSTEP),j=Math.round((z+WOZ)/HSTEP);if(i<0||j<0||i>=HN||j>=HN)return 0;return TRL[j*HN+i];}
/* ---------- khám phá: sương mù trên bản đồ (64×64 ô) ---------- */
const FOGN=64;
function fogReveal(x,z,r){if(!S.fogm||S.fogm.length!==FOGN*FOGN/32)S.fogm=Array(FOGN*FOGN/32).fill(0);const c=WSIZE/FOGN,ci=Math.floor((x+WSIZE/2)/c),cj=Math.floor((z+WOZ)/c),rr=Math.ceil(r/c);
  for(let j=cj-rr;j<=cj+rr;j++)for(let i=ci-rr;i<=ci+rr;i++){if(i<0||j<0||i>=FOGN||j>=FOGN)continue;if(Math.hypot(i-ci,j-cj)>rr)continue;const n=j*FOGN+i;S.fogm[n>>5]|=(1<<(n&31));}}
function fogSeen(i,j){const n=j*FOGN+i;return !!(S.fogm&&(S.fogm[n>>5]&(1<<(n&31))));}
function exploreTick(){if(G.t-(G.expT||0)<0.6)return;G.expT=G.t;if(!S.fogm)fogReveal(SPAWN[0],SPAWN[1],520);fogReveal(P.x,P.z,isFP()?300:360);
  const r=regionAt(P.x,P.z),id=r?r.id:null;if(id===G.regId)return;G.regId=id;if(!r)return;S.disc=S.disc||{};const first=!S.disc[id];S.disc[id]=1;uiRegion(r,first);if(first){addXp('run',3);cnt('cnt','disc');save();}}
/* ---------- tranh bản đồ ---------- */
let MAPIMG=null;
function mapPix(x,z,col,c2){const h=hAt(x,z);let b=BCODE[bgAt(x,z)];const wd=wdAt(x,z);if(wd>0.3)b='water';
  if(b==='water'){col.set(wd>20?'#3d6f8a':'#5b8fa3');}else col.set({beach:'#dcc690',meadow:'#a9c46a',edge:'#8fb259',forest:'#5f8a45',bank:'#93b065',rock:'#a39b8b',peak:'#e8e6e0'}[b]||'#9ab46a');
  if(b!=='water'){const sh=clamp((hAt(x-30,z-30)-hAt(x+30,z+30))*0.012,-0.3,0.3);col.offsetHSL(0,0,sh);const tr=trailAt(x,z);if(tr>0.3){c2.set('#8a6a44');col.lerp(c2,0.85);}if(h>300){c2.set('#f4f4f2');col.lerp(c2,clamp((h-300)/120,0,0.8));}}}
function mapRender(x0,z0,span,N){const cv=mkCanvas(N,N),c=cv.getContext('2d'),im=c.createImageData(N,N),col=new THREE.Color(),c2=new THREE.Color();
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){mapPix(x0+(i+0.5)/N*span,z0+(j+0.5)/N*span,col,c2);const k=(j*N+i)*4;im.data[k]=col.r*255;im.data[k+1]=col.g*255;im.data[k+2]=col.b*255;im.data[k+3]=255;}
  c.putImageData(im,0,0);c.strokeStyle='#4f88a6';c.lineCap='round';c.lineJoin='round';const t=v=>v/span*N;for(const r of RIV){for(let i=1;i<r.pts.length;i++){const f=i/r.pts.length;c.lineWidth=Math.max(1.4,(r.w[0]+(r.w[1]-r.w[0])*f)/span*N*1.3);c.beginPath();c.moveTo(t(r.pts[i-1][0]-x0),t(r.pts[i-1][1]-z0));c.lineTo(t(r.pts[i][0]-x0),t(r.pts[i][1]-z0));c.stroke();}}return cv;}
function mapBase(){return MAPIMG||(MAPIMG=mapRender(-WSIZE/2,-WOZ,WSIZE,320));}
function mapDetail(V){if(V.z<1.8)return null;const d=G.mapDet;if(d&&Math.abs(d.z-V.z)<1e-6&&Math.abs(d.x0-V.x0)<1&&Math.abs(d.z0-V.z0)<1)return d.cv;clearTimeout(G.mapDetH);G.mapDetH=setTimeout(()=>{if(!$('#mapcv'))return;const W=mapView();G.mapDet={z:W.z,x0:W.x0,z0:W.z0,cv:mapRender(W.x0,W.z0,W.span,260)};mapDraw();},180);return null;}
function mapView(){const v=G.mapV||(G.mapV={z:1,cx:0,cz:0});const half=WSIZE/2/v.z,lim=WSIZE/2-half;v.cx=clamp(v.cx,-lim,lim);v.cz=clamp(v.cz,-WOZ+half,WSIZE-WOZ-half);return {z:v.z,x0:v.cx-half,z0:v.cz-half,span:half*2};}
function mapZoom(f,fx,fz){const v=G.mapV||(G.mapV={z:1,cx:0,cz:0});const nz=clamp(v.z*f,1,10);if(fx==null){fx=v.cx;fz=v.cz;}const k=1-v.z/nz;v.cx+=(fx-v.cx)*k;v.cz+=(fz-v.cz)*k;v.z=nz;mapDraw();}
function mapDraw(){const cv=$('#mapcv');if(!cv)return;const box=cv.parentElement.getBoundingClientRect(),sz=Math.floor(Math.min(box.width,innerHeight*0.72,720)),pr=Math.min(2,devicePixelRatio||1);
  if(cv.width!==sz*pr){cv.width=sz*pr;cv.height=sz*pr;cv.style.width=sz+'px';cv.style.height=sz+'px';}const c=cv.getContext('2d');c.setTransform(pr,0,0,pr,0,0);const W=sz,V=mapView(),toS=v=>v,sx=x=>(x-V.x0)/V.span*W,sy=z=>(z-V.z0)/V.span*W;
  c.fillStyle='#d9c49a';c.fillRect(0,0,W,W);c.imageSmoothingEnabled=true;const mb=mapBase(),N=mb.width;c.drawImage(mb,(V.x0+WSIZE/2)/WSIZE*N,(V.z0+WOZ)/WSIZE*N,V.span/WSIZE*N,V.span/WSIZE*N,0,0,W,W);{const dt=mapDetail(V);if(dt)c.drawImage(dt,0,0,W,W);}
  // sương mù chưa khám phá: giấy da cũ
  const cw=WSIZE/FOGN;c.fillStyle='rgba(214,192,148,0.8)';const i0=Math.max(0,Math.floor((V.x0+WSIZE/2)/cw)),j0=Math.max(0,Math.floor((V.z0+WOZ)/cw)),i1=Math.min(FOGN-1,Math.ceil((V.x0+V.span+WSIZE/2)/cw)),j1=Math.min(FOGN-1,Math.ceil((V.z0+V.span+WOZ)/cw));
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)if(!fogSeen(i,j)){const x=sx(-WSIZE/2+i*cw),y=sy(-WOZ+j*cw),s=cw/V.span*W;c.fillRect(Math.floor(x),Math.floor(y),Math.ceil(s)+1,Math.ceil(s)+1);}
  c.strokeStyle='rgba(90,60,30,.35)';c.lineWidth=1;for(let k=1;k<8;k++){const g=-WSIZE/2+k*WSIZE/8,x=sx(g),y=sy(g+WSIZE/2-WOZ);c.beginPath();c.moveTo(x,0);c.lineTo(x,W);c.moveTo(0,y);c.lineTo(W,y);c.stroke();}
  const lbl=(t,x,y,f)=>{c.font=f;c.lineWidth=3;c.strokeStyle='rgba(255,246,226,.85)';c.strokeText(t,x,y);c.fillStyle='#3a2410';c.fillText(t,x,y);};
  c.textAlign='center';
  for(const r of REG){const known=S.disc&&S.disc[r.id];const x=sx(r.x),y=sy(r.z);if(x<-60||y<-30||x>W+60||y>W+30)continue;if(!known){const fi=Math.floor((r.x+WSIZE/2)/WSIZE*FOGN),fj=Math.floor((r.z+WOZ)/WSIZE*FOGN);if(!fogSeen(fi,fj))continue;}
    c.font=(14+V.z*1.5|0)+'px system-ui';c.fillText(r.ic,x,y+5);lbl(known?r.n:'???',x,y+20,'700 '+(11+Math.min(4,V.z*0.5)).toFixed(1)+'px "Be Vietnam Pro",system-ui,sans-serif');}
  // công trình, nhà
  const bs=Math.max(3,Math.min(8,V.z*1.2));c.fillStyle='#7a2e12';for(const b of S.builds){const d=pieceDef(b.k);if(!d||d.kind==='edge'||d.kind==='roof')continue;c.fillRect(sx(b.x)-bs/2,sy(b.z)-bs/2,bs,bs);}
  // khi phóng to: hiện người trong làng, thuyền, thú dữ đã thấy gần
  if(V.z>=2.5){c.font='12px system-ui';(S.folk||[]).forEach(f=>{if(f.x!=null)c.fillText('🧑',sx(f.x),sy(f.z)+4);});(S.boats||[]).forEach(b=>c.fillText('🛶',sx(b.x),sy(b.z)+4));
    if(G.anims)G.anims.forEach(a=>{if(!a||a.dead||Math.hypot(a.x-P.x,a.z-P.z)>700)return;const fierce=/tiger|wolf|bear|boar|croc|leopard/.test(a.k||a.kind||'');c.fillStyle=fierce?'#d8452a':'#4a6a2a';c.beginPath();c.arc(sx(a.x),sy(a.z),fierce?3.5:2.5,0,7);c.fill();});}
  const home=S.builds.find(b=>pieceDef(b.k)&&pieceDef(b.k).bed)||S.builds.find(b=>b.k==='campfire');if(home){c.font='15px system-ui';c.fillStyle='#3a2410';c.fillText('🏠',sx(home.x),sy(home.z)-6);}
  if(S.mark){c.font='18px system-ui';c.fillText('📍',sx(S.mark.x),sy(S.mark.z)-2);}
  // người chơi
  const px=sx(P.x),py=sy(P.z),a=camYaw();c.save();c.translate(px,py);c.rotate(Math.PI-a);c.beginPath();c.moveTo(0,-9);c.lineTo(6,7);c.lineTo(0,3);c.lineTo(-6,7);c.closePath();c.fillStyle='#e8402a';c.fill();c.lineWidth=2;c.strokeStyle='#fff';c.stroke();c.restore();
  // la bàn + thước đo
  c.font='700 13px Bungee,system-ui';c.fillStyle='#3a2410';c.fillText("B",20,22);c.beginPath();c.moveTo(20,27);c.lineTo(24,40);c.lineTo(16,40);c.closePath();c.fill();
  {const m=[50,100,200,500,1000,2000].find(m=>m*20/V.span*W>50)||2000,L=m*20/V.span*W;c.fillStyle='rgba(58,36,16,.85)';c.fillRect(12,W-16,L,3);c.textAlign='left';c.font='600 11px system-ui';c.fillText(m+' m',12,W-22);c.textAlign='center';}
  mapInput(cv);}
function mapInput(cv){if(cv._ok)return;cv._ok=1;const pts=new Map();let moved=0,pd0=0,z0=1,last=null;
  const w2=(cx,cy)=>{const r=cv.getBoundingClientRect(),V=mapView();return [V.x0+(cx-r.left)/r.width*V.span,V.z0+(cy-r.top)/r.height*V.span];};
  cv.addEventListener('wheel',e=>{e.preventDefault();const [x,z]=w2(e.clientX,e.clientY);mapZoom(e.deltaY<0?1.25:0.8,x,z);},{passive:false});
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);moved=0;last=[e.clientX,e.clientY];if(pts.size===2){const [p,q]=[...pts.values()];pd0=Math.hypot(p[0]-q[0],p[1]-q[1]);z0=G.mapV?G.mapV.z:1;}});
  cv.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;const prev=pts.get(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);const r=cv.getBoundingClientRect(),V=mapView();
    if(pts.size>=2){const [p,q]=[...pts.values()],d=Math.hypot(p[0]-q[0],p[1]-q[1]);if(pd0>10){const [x,z]=w2((p[0]+q[0])/2,(p[1]+q[1])/2);mapZoom(clamp(z0*d/pd0,1,10)/(G.mapV.z),x,z);}moved=99;return;}
    const dx=e.clientX-prev[0],dy=e.clientY-prev[1];moved+=Math.abs(dx)+Math.abs(dy);if(moved>6&&V.z>1){G.mapV.cx-=dx/r.width*V.span;G.mapV.cz-=dy/r.height*V.span;mapDraw();}});
  const up=e=>{if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);if(pts.size===0&&moved<=6&&e.type==='pointerup'){const [x,z]=w2(e.clientX,e.clientY);const V=mapView();if(S.mark&&Math.hypot(S.mark.x-x,S.mark.z-z)<V.span*0.025)S.mark=null;else S.mark={x,z};save();mapDraw();}if(pts.size===1)moved=99;};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);}
function mapAct(v){if(v==='0'){G.mapV={z:1,cx:0,cz:0};mapDraw();return;}if(v==='me'){G.mapV=G.mapV||{z:1};G.mapV.z=Math.max(G.mapV.z,3);G.mapV.cx=P.x;G.mapV.cz=P.z;mapDraw();return;}mapZoom(+v>0?1.5:1/1.5);}
function mapHtml(){const n=REG.filter(r=>S.disc&&S.disc[r.id]).length;return `<div class="mapw"><canvas id="mapcv"></canvas><div class="mapz"><button data-a="mz" data-v="1">+</button><button data-a="mz" data-v="-1">−</button><button data-a="mz" data-v="me" title="Về chỗ mình">◎</button><button data-a="mz" data-v="0" title="Xem toàn bộ">⤢</button></div></div><p class="small muted">Đã khám phá <b>${n}/${REG.length}</b> vùng. Lăn chuột / chụm 2 ngón để phóng to, kéo để di chuyển. Chạm để cắm cờ 📍, chạm lại để gỡ. Phím <kbd>M</kbd>.</p>
  <div class="regl">${REG.map(r=>S.disc&&S.disc[r.id]?`<div><b>${r.ic} ${esc(r.n)}</b><span>${esc(r.d)}</span></div>`:`<div class="dim"><b>❔ Vùng chưa biết</b><span>Đi khám phá để ghi vào bản đồ.</span></div>`).join('')}</div>`;}
/* ---------- la bàn trên đầu màn hình ---------- */
function compassTick(){const el=$('#compass');if(!el)return;const yaw=viewYaw();// hướng nhìn: (sin yaw, cos yaw); bắc = −z
  const bear=a=>{let d=a-yaw;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d;};const W=el.clientWidth||300;const put=(node,ang)=>{const d=bear(ang);const v=Math.abs(d)<Math.PI*0.5;node.style.opacity=v?String(1-Math.abs(d)/(Math.PI*0.5)*0.6):'0';node.style.transform=`translateX(${Math.round(-d/(Math.PI*0.5)*W/2)}px)`;};
  // hướng thế giới -> góc yaw: hướng (dx,dz) có yaw = atan2(dx,dz)
  if(!el.dataset.ok){el.dataset.ok=1;el.innerHTML=[['B',0,-1],['Đ',1,0],['N',0,1],['T',-1,0],['ĐB',0.7,-0.7],['ĐN',0.7,0.7],['TN',-0.7,0.7],['TB',-0.7,-0.7]].map(([t,x,z])=>`<i data-a="${Math.atan2(x,z)}" class="${t.length>1?'s':''}">${t}</i>`).join('')+'<i class="mk" id="cmHome">🏠</i><i class="mk" id="cmMark">📍</i>';}
  el.querySelectorAll('i[data-a]').forEach(n=>put(n,+n.dataset.a));
  const home=S.builds.find(b=>pieceDef(b.k)&&pieceDef(b.k).bed)||S.builds.find(b=>b.k==='campfire');const h=$('#cmHome'),m=$('#cmMark');
  if(home&&Math.hypot(home.x-P.x,home.z-P.z)>60){h.hidden=false;put(h,Math.atan2(home.x-P.x,home.z-P.z));}else h.hidden=true;
  if(S.mark){const d=Math.hypot(S.mark.x-P.x,S.mark.z-P.z);if(d<40){S.mark=null;uiToast('📍 Đã tới chỗ cắm cờ.','');m.hidden=true;}else{m.hidden=false;put(m,Math.atan2(S.mark.x-P.x,S.mark.z-P.z));m.dataset.d=Math.round(d/20)+' m';}}else m.hidden=true;}

/* ---------- núi đá vôi, hang, cây đa: vật cảnh lớn đặt sẵn, có va chạm ---------- */
let DECO_PLAN=[];
function decorPlan(){DECO_PLAN=[];SCOL=[];const R=rng((S.seed|0)+31),K=REG.find(r=>r.id==='karst'),C=REG.find(r=>r.id==='cave'),B=REG.find(r=>r.id==='banyan'),Hl=REG.find(r=>r.id==='hills');
  const RAD={1:88,2:136,3:192};const ok=(x,z,r)=>DECO_PLAN.every(d=>Math.hypot(d.x-x,d.z-z)>d.r+r+20)&&(!C||Math.hypot(C.x-x,C.z-z)>r+170)&&trailAt(x,z)<0.05&&Math.hypot(x-SPAWN[0],z-SPAWN[1])>500;
  const place=(cx,cz,rad,n,minH)=>{let c=0,t=0;while(c<n&&t<600){t++;const a=R()*6.283,d=Math.sqrt(R())*rad,x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d,h=hAt(x,z);if(h<minH)continue;const v=R()<0.3?3:R()<0.55?2:1,s=0.8+R()*0.4,r=RAD[v]*s;if(!ok(x,z,r))continue;DECO_PLAN.push({k:'karst',v,x,z,y:h-10,ry:R()*6.283,s,r});c++;}};
  if(K)place(K.x,K.z,K.r*1.1,12,14);if(Hl)place(Hl.x,Hl.z,Hl.r,4,10);
  if(C){const ry=Math.atan2(SPAWN[0]-C.x,SPAWN[1]-C.z);DECO_PLAN.push({k:'cave',x:C.x,z:C.z,y:hAt(C.x,C.z)-1,ry,s:1,r:90});}
  {const hot=['plateau','gorge','chasm','cliffs','range'].map(id=>REG.find(r=>r.id===id)).filter(Boolean);let c=0,t=0;while(c<240&&t<40000){t++;let x,z;if(R()<0.75){const r=hot[Math.floor(R()*hot.length)],a=R()*6.283,d=Math.sqrt(R())*r.r*1.3;x=r.x+Math.cos(a)*d;z=r.z+Math.sin(a)*d;}else{x=(R()-0.5)*WR*1.7;z=(R()-0.5)*WR*1.7;}const sl=slopeAt(x,z);if(sl<0.95||wdAt(x,z)>0||hAt(x,z)<6)continue;const v=R()<0.2?3:R()<0.5?2:1,r=[0,30,60,95][v];if(!ok(x,z,r))continue;DECO_PLAN.push({k:'cliffRock',v,x,z,y:hAt(x,z)-r*0.35,ry:R()*6.283,s:0.8+R()*0.5,r});c++;}}
  {const Vg=REG.find(r=>r.id==='village');if(Vg)DECO_PLAN.push({k:'village',x:Vg.x,z:Vg.z,y:0,ry:0,s:1,r:230});const Cp=REG.find(r=>r.id==='camp');if(Cp)DECO_PLAN.push({k:'village',x:Cp.x,z:Cp.z,y:0,ry:0,s:1,r:190});}
  if(B)DECO_PLAN.push({k:'banyan',x:B.x,z:B.z,y:hAt(B.x,B.z)-2,ry:R()*6.283,s:1,r:40});
  DECO_PLAN.forEach(d=>{if(d.k!=='cave'&&d.k!=='village')SCOL.push({x:d.x,z:d.z,r:d.k==='banyan'?22:d.r*0.9});});}
// nền trong hang phẳng, thấp hơn sàn hang để đất không trồi vào
function caveFlatten(){const d=DECO_PLAN.find(o=>o.k==='cave');if(!d)return;const c=Math.cos(d.ry),s=Math.sin(d.ry);for(let j=0;j<HN;j++)for(let i=0;i<HN;i++){const x=-WSIZE/2+i*HSTEP,z=-WOZ+j*HSTEP,dx=x-d.x,dz=z-d.z;if(Math.abs(dx)>220||Math.abs(dz)>220)continue;const lx=dx*c-dz*s,lz=dx*s+dz*c;
    const k=(1-ss(52,80,Math.abs(lx)))*(1-ss(130,165,lz))*(1-ss(-60,-90,lz));if(k>0){const t=d.y-0.5;HG[j*HN+i]=HG[j*HN+i]*(1-k)+Math.min(HG[j*HN+i],t)*k;}}}
function decoBlock(x,z){for(const d of DECO_PLAN){if(Math.hypot(d.x-x,d.z-z)<d.r+(d.k==='banyan'?150:d.k==='cave'?90:12))return true;}return false;}
function decorBuild(){const T=THREE,by=new Map();for(const d of DECO_PLAN){if(d.k==='village')continue;const key=d.k==='karst'||d.k==='cliffRock'?d.k+'|'+d.v:d.k;if(!by.has(key))by.set(key,[]);by.get(key).push(d);}
  by.forEach((list,key)=>{const spec=key.split('|').map(v=>/^\d+$/.test(v)?+v:v);const proto=model(spec);const parts=protoParts(proto).map(p=>({geo:p.geo,mat:key==='cave'?p.mat:occMat(p.mat)}));
    if(key==='cave'){const d=list[0],cs=proto.userData&&proto.userData.colliders;if(cs){const c=Math.cos(d.ry),s=Math.sin(d.ry);cs.forEach(([lx,lz,r])=>SCOL.push({x:d.x+lx*c+lz*s,z:d.z-lx*s+lz*c,r}));}G.cave=d;}
    let cx=0,cz=0;list.forEach(d=>{cx+=d.x;cz+=d.z;});cx/=list.length;cz/=list.length;let r=0;list.forEach(d=>{r=Math.max(r,Math.hypot(d.x-cx,d.z-cz)+d.r*2.6+60);});
    const api=instGroup(parts,list.length,{sphere:{x:cx,y:60,z:cz,r}});list.forEach((d,i)=>api.set(i,d.x,d.y,d.z,d.ry,d.s));api.flush();G.sc.add(api.G);});}
// trong hang: được che mưa như dưới mái
function inCave(x,z){const d=G.cave;if(!d)return false;const dx=x-d.x,dz=z-d.z,c=Math.cos(d.ry),s=Math.sin(d.ry),lz=dx*s+dz*c,lx=dx*c-dz*s;return lz<70&&lz>-52&&Math.abs(lx)<40;}
