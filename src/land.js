/* ===================== DỌN ĐẤT, SAN NỀN KHU Ở =====================
   Phát quang, đào gốc, san phẳng và nện chặt một khoảng đất tròn.
   Cây cỏ trong khu đã san không mọc lại; mặt đất phẳng, màu đất nện.
   Lưu trong S.flat = [{x,z,r,h}], áp lại vào lưới độ cao mỗi lần tải. */
const LAND_SZ=[['Nhỏ',70],['Vừa',110],['Rộng',150]];
function flatK(f,x,z){const d=Math.hypot(x-f.x,z-f.z);return 1-ss(f.r*0.78,f.r*1.18,d);}
function flatApply(f){const i0=Math.max(0,Math.floor((f.x-f.r*1.3+WSIZE/2)/HSTEP)),i1=Math.min(HN-1,Math.ceil((f.x+f.r*1.3+WSIZE/2)/HSTEP)),j0=Math.max(0,Math.floor((f.z-f.r*1.3+WSIZE/2)/HSTEP)),j1=Math.min(HN-1,Math.ceil((f.z+f.r*1.3+WSIZE/2)/HSTEP));
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=-WSIZE/2+i*HSTEP,z=-WSIZE/2+j*HSTEP,k=flatK(f,x,z);if(k<=0)continue;const n=j*HN+i;HG[n]=HG[n]*(1-k)+f.h*k;}}
function inFlat(x,z){for(const f of (S.flat||[]))if(Math.hypot(x-f.x,z-f.z)<f.r)return f;return null;}
// tải game: áp các khu đã san sau khi làm phẳng hang
{const _cf=caveFlatten;caveFlatten=function(){_cf();(S.flat||[]).forEach(flatApply);};}
// tô màu đất nện cho khu đã san
{const _tc=terrainColors;terrainColors=function(){_tc();if(!S.flat||!S.flat.length)return;const c=new THREE.Color(),e=new THREE.Color('#8b6a48');
  for(const f of S.flat){const i0=Math.max(0,Math.floor((f.x-f.r*1.2+WSIZE/2)/HSTEP)),i1=Math.min(HN-1,Math.ceil((f.x+f.r*1.2+WSIZE/2)/HSTEP)),j0=Math.max(0,Math.floor((f.z-f.r*1.2+WSIZE/2)/HSTEP)),j1=Math.min(HN-1,Math.ceil((f.z+f.r*1.2+WSIZE/2)/HSTEP));
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=-WSIZE/2+i*HSTEP,z=-WSIZE/2+j*HSTEP,k=flatK(f,x,z)*0.9;if(k<=0)continue;const n=j*HN+i;c.setRGB(TCOL[n*3],TCOL[n*3+1],TCOL[n*3+2]).lerp(e,k);TCOL[n*3]=c.r;TCOL[n*3+1]=c.g;TCOL[n*3+2]=c.b;
      const s=TSPL;s[n*4]=s[n*4]*(1-k);s[n*4+1]=s[n*4+1]*(1-k)+k;s[n*4+2]=s[n*4+2]*(1-k);s[n*4+3]=s[n*4+3]*(1-k);
      TNRM[n*3]*=1-k;TNRM[n*3+1]=TNRM[n*3+1]*(1-k)+k;TNRM[n*3+2]*=1-k;}}};}
// dựng lại các khối địa hình chạm vào khu vừa san
function landRebuild(f){terrainColors();const S2=TCS*HSTEP;for(let cj=0;cj<TCN;cj++)for(let ci=0;ci<TCN;ci++){const x0=-WSIZE/2+ci*S2,z0=-WSIZE/2+cj*S2;
    if(f.x+f.r*1.3<x0||f.x-f.r*1.3>x0+S2||f.z+f.r*1.3<z0||f.z-f.r*1.3>z0+S2)continue;const c=TCH[cj*TCN+ci];if(!c)continue;[1,2,4].forEach((st,li)=>{const me=c.L[li];const old=me.geometry;me.geometry=terrainChunk(ci,cj,st);old.dispose();});}
  try{if(typeof grassInit==='function')grassInit();}catch(e){}}
function landCheck(r){const x=P.x,z=P.z;if(wdAt(x,z)>0.2)return 'Không san nền dưới nước.';if(slopeAt(x,z)>0.9)return 'Dốc quá, chọn chỗ bằng hơn.';
  if(typeof inCave==='function'&&inCave(x,z))return 'Trong hang đã có nền sẵn.';
  const tool=hasTool('dig')||hasTool('hoe')||hasTool('pick');if(!tool)return 'Cần Gậy đào (hoặc cuốc) để đào gốc, san đất.';
  // cây lớn còn đứng trong khu (khúc gỗ đổ không tính: san nền sẽ dọn luôn). Báo rõ cây nào, cách bao xa, hướng nào và nháy sáng chỗ cây
  //  → hết cảnh "báo còn cây mà nhìn không thấy cây đâu" (cây ở sau lưng, lẫn trong cỏ, hoặc bị đất vùi sau lần san trước).
  const bl=[];for(const i of near(x,z,r+20)){const q=RES[i];if(q.st!==0||q.lock)continue;const d=Math.hypot(q.x-x,q.z-z);if(d>r)continue;if(RT[q.t].tool==='axe'&&q.t!=='log')bl.push({q,d});}
  if(bl.length){bl.sort((a,b)=>a.d-b.d);const q=bl[0].q,ang=Math.atan2(q.x-x,-(q.z-z)),dir=['Bắc','Đông Bắc','Đông','Đông Nam','Nam','Tây Nam','Tây','Tây Bắc'][((Math.round(ang/(Math.PI/4))%8)+8)%8];
    try{bl.slice(0,8).forEach(o=>{const gy=hAt(o.q.x,o.q.z);if(o.q.wy==null&&Math.abs(o.q.y-(gy-1.2))>3){o.q.y=gy-1.2;resShow(o.q);}for(let k=0;k<3;k++)puff(o.q.x,gy+14+k*22,o.q.z,'#ffd24a',8);});RI.forEach(v=>v.api.flush());}catch(e){}
    return `Còn ${bl.length} cây lớn trong khu này (đang nháy vàng). Gần nhất: ${RT[q.t].n||'cây'}, cách ${Math.max(1,Math.round(bl[0].d/20))} m về phía ${dir}. Chặt bằng rìu trước đã.`;}
  for(const b of S.builds)if(Math.hypot(b.x-x,b.z-z)<r*0.85)return 'Khu này đã có công trình. San nền trước khi xây.';return null;}
function landStart(r){r=+r||110;const why=landCheck(r);if(why){uiToast(why,'bad');sfx('no');return;}const ng=needGate(true);if(ng){uiToast(ng,'bad');sfx('no');return;}
  const k=r/110;uiClose();buildEnd&&buildEnd();
  G.work={r:{out:{},in:{}},steps:[{n:'Phát quang cỏ, bụi rậm',a:'gather',t:2.2*k,fx:'pick'},{n:'Đào gốc, nhặt đá sỏi',a:'dig',t:2.6*k,fx:'step'},{n:'Cào đất cao lấp chỗ trũng',a:'dig',t:2.6*k,fx:'step'},{n:'Nện chặt mặt nền',a:'hammer',t:2*k,fx:'thud'}],
    i:0,t:0,left:1,done:0,x:P.x,z:P.z,sk:'build',icon:'digStick',fn:()=>landDone(r)};workUi();}
function landDone(r){const x=P.x,z=P.z;let sum=0,n=0;for(let a=0;a<12;a++){const ang=a/12*6.283;for(const d of [0,r*0.4,r*0.8]){sum+=hAt(x+Math.cos(ang)*d,z+Math.sin(ang)*d);n++;}}
  const f={x:+x.toFixed(1),z:+z.toFixed(1),r,h:+(sum/n).toFixed(2)};S.flat=S.flat||[];S.flat.push(f);
  // cây cỏ trong khu: nhổ sạch, không mọc lại
  const got={};let cleared=0;for(const i of near(x,z,r+20)){const q=RES[i];if(q.st!==0||q.lock||Math.hypot(q.x-x,q.z-z)>r)continue;const Y=RT[q.t].yield||{};for(const k in Y){const v=Y[k];const c=Array.isArray(v)?v[0]:v;if(c>0&&Math.random()<0.6)got[k]=(got[k]||0)+c;}q.st=1;q.hp=0;q.rg=1e12;S.res[q.i]=[1,1e12];resShow(q);cleared++;}
  for(const k in S.res){const q=RES[+k];if(q&&S.res[k][0]===1&&Math.hypot(q.x-x,q.z-z)<r)S.res[k]=[1,1e12];}
  flatApply(f);
  // mặt đất quanh rìa (tới 1,3 lần bán kính) cũng đổi độ cao: đặt lại cây cỏ, đá ở đó theo mặt đất mới, kẻo bị vùi dưới đất hoặc lơ lửng
  for(const i of near(x,z,r*1.3+30)){const q=RES[i];if(q.wy!=null)continue;const ny=hAt(q.x,q.z)-1.2;if(Math.abs(ny-q.y)>0.3){q.y=ny;try{resShow(q);}catch(e){}}}
  RI.forEach(v=>v.api.flush());landRebuild(f);P.y=hAt(P.x,P.z);
  if(Object.keys(got).length)give(got,[x,P.y+10,z]);puff(x,P.y+4,z,'#a88a62',14);sfx('build');addXp('build',4+r/20);S.p.stam=Math.max(0,S.p.stam-r/8);
  uiToast(`🟫 Đã san xong nền đất ${Math.round(r*2/20)} m. Cỏ cây trong khu sẽ không mọc lại — dựng nhà thôi!`,'gold');save();}
// cây cỏ không mọc lại trong khu đã san
{const _rr=resRegrow;resRegrow=function(){if(S.flat&&S.flat.length)for(const k in S.res){const q=RES[+k];if(q&&S.res[k][0]===1&&S.res[k][1]<1e11&&inFlat(q.x,q.z))S.res[k]=[1,1e12];}_rr();};}
// thêm mục San nền vào bảng Xây dựng
{const _bh=buildHtml;buildHtml=function(){return `<div class="landbox"><b>🟫 San nền khu ở</b><span class="small muted">Phát quang, đào gốc, san phẳng, nện đất quanh chỗ đang đứng. Cỏ cây không mọc lại. Cần Gậy đào; chặt cây lớn trước.</span><div class="row">${LAND_SZ.map(([n,r])=>`<button class="btn sm" data-a="land" data-v="${r}">${n} · ${Math.round(r*2/20)} m</button>`).join('')}</div></div>`+_bh();};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="land"]');if(!b)return;e.stopImmediatePropagation();sfx('pick');landStart(b.dataset.v);},true);
