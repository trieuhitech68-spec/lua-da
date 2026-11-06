/* ===================== 📖 BÁCH KHOA: VÙNG ĐẤT · PHÂN BỐ · VẬT PHẨM · MUÔNG THÚ · XÂY DỰNG =====================
   Sổ tra cứu mở từ Nhật ký, từ nút 📖 trên đầu bảng Bản đồ, hoặc chạm nhãn "đây là gì" (peek) có dấu 📖.
   Dữ liệu lấy thẳng từ thế giới đã sinh: RES (vị trí cây cỏ, đá, quặng), REG (vùng), RLPROF (giàu / nghèo), ANIMALS (vùng, sinh cảnh),
   H3NODE (tổ chim, ốc, củ…), RECIPES/BUILD (chế tạo, xây). Tính lười một lần khi mở, giữ trong bộ nhớ; không chạy gì mỗi khung hình
   (chỉ một lượt quét nhỏ 2 giây một lần để ghi "đã gặp" và báo "Đã ghi vào Bách khoa", gộp lại, tối đa một lần mỗi 25 giây).
   Tôn trọng khám phá: vùng chưa tới hiện "???" kèm lời đồn về hướng, sinh cảnh; bản đồ phân bố chỉ tô chi tiết ở phần đã khám phá.
   Lưu: S.cxk (khóa đã gặp) — bản lưu cũ không có thì tạo rỗng.
   GÁN LẠI (bọc, không sửa tệp cũ): uiOpen, journalHtml, exploreTick, uiRegion, peekLabel, peekShow, peekMouse. */
const CX={dv:'fit',ri:null,d:null,src:null,ent:null,nm:null,rimg:{},dc:{},tab:'reg',reg:null,sel:null,pend:[],toastT:-1e9,scanT:0,quiet:0,last:null};
const cxNorm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[đĐ]/g,'d').toLowerCase();
function cxS(){if(!S.cxk||typeof S.cxk!=='object')S.cxk={};return S.cxk;}
const CXE_RT={pine:'🌲',pineY:'🌲',pineG:'🌲',oak:'🌳',oakG:'🌳',young:'🌱',birch:'🌳',birchY:'🌱',dead:'🪵',log:'🪵',deadLog:'🪵',savannaTree:'🌳',berry:'🫐',shrub:'🌿',flax:'🌾',reeds:'🌾',reedBed:'🌾',
  wildgrain:'🌾',gourdwild:'🍐',boulder:'🪨',rock:'🪨',pebble:'🪨',scree:'🪨',pathStone:'🪨',flintRock:'💠',tinRock:'⛏️',copperRock:'🟢',clay:'🟤',mushroom:'🍄',mushroomR:'🍄',stick:'🥢',fern:'🌿',
  flowerW:'🌼',flowerP:'🌸',flowerY:'🌼',flowerR:'🌺',tallgrass:'🌾',ginger:'🫚',mint:'🌱',centella:'☘️',mugwort:'🌿',turmeric:'🧡',aloe:'🪴',beehive:'🍯',bamboo:'🎋',banana:'🍌',palm:'🌴',lotus:'🪷',
  bones:'🦴',saltPan:'🧂',shellBed:'🐚'};
const CXE_AN={rabbit:'🐇',deer:'🦌',boar:'🐗',wolf:'🐺',tiger:'🐅',gaur:'🐃',monkey:'🐒',crocodile:'🐊',snake:'🐍',junglefowl:'🐓',bear:'🐻',raider:'⚔️'};
const CXE_N={nest:'🪺',snail:'🐌',yam:'🍠',wildrice:'🌾',taro:'🥔'};
const CXB={water:'mặt nước',beach:'bãi cát',meadow:'đồng cỏ',edge:'bìa rừng',forest:'rừng rậm',bank:'bờ nước, đầm lầy',rock:'đá núi',peak:'đỉnh núi tuyết'};
const CXDIR={B:'Bắc','ĐB':'Đông Bắc','Đ':'Đông','ĐN':'Đông Nam',N:'Nam',TN:'Tây Nam',T:'Tây',TB:'Tây Bắc'};
const CXDG=[['An toàn','#8ce07a'],['Ít nguy hiểm','#c8e07a'],['Cẩn thận','#f2c55a'],['Nguy hiểm','#ff9a5a'],['Rất nguy hiểm','#ff5a4a']];
const CXCAT={tree:'🌲 Cây gỗ',plant:'🌿 Cây cỏ, hoa quả',min:'🪨 Đá, khoáng, đất',an:'🐾 Muông thú',nd:'🪺 Hái lượm khác',it:'📦 Sản vật'};
const CXAG={never:'Hiền lành: thấy người là chạy.',defend:'Bị đánh mới quay lại húc.',night:'Ban đêm hoặc mùa đông thì tấn công người.',stalk:'Rình mồi: chiều tối, đêm, rạng sáng rất nguy hiểm; ban ngày hay nằm ngủ.',territory:'Giữ lãnh thổ: lại gần là tấn công.'};
const CXSRC={fish:'Câu bằng cần câu tre, đâm bằng giáo hoặc quăng chài ở sông, hồ, biển. Vùng giàu cá và Vực cá cho nhiều hơn.',waterDirty:'Múc ở sông, suối, hồ bằng bầu rỗng.',
  birdRaw:'Bắn, ném đá hoặc vồ chim khi chúng sà xuống đất kiếm ăn.',pearl:'Thỉnh thoảng có trong con trai khi mò ở bãi sò (nhiều nhất ở Bãi ngọc trai Vịnh Đá).',sinew:'Xẻ thịt thú lớn (từ 30 kg trở lên).',
  meatRot:'Thịt sống để lâu sẽ ôi, đừng ăn.',flower:'Hái hoa dại ở đồng hoa, bìa rừng.'};
const cxM=d=>{const m=d/20;return m>=1000?(m/1000).toFixed(1).replace('.',',')+' km':Math.max(1,Math.round(m))+' m';};
const cxDir=(x,z)=>CXDIR[rlDir(x,z)]||'';
function cxRe(t){const D=RT[t];return CXE_RT[t]||(D&&D.yield&&EMO[Object.keys(D.yield)[0]])||'🌿';}
const CXTE={res:'📦',food:'🍽️',drink:'💧',herb:'🌿',med:'💊',tool:'🛠️',wear:'👕',seed:'🌱',boat:'🛶',sap:'🌱'};
function cxIc(id){const u=ICO.url[id];return `<span class="ic" data-ic="${id}">${u?`<img src="${u}" alt="" draggable="false">`:`<b>${EMO[id]||(ITEMS[id]&&CXTE[ITEMS[id].t])||'❔'}</b>`}</span>`;}
function cxChip(id,n){return `<span class="chip">${cxIc(id)}${n!=null?n:''}${n==null&&ITEMS[id]?esc(ITEMS[id].n):''}</span>`;}
function cxCost(c){return Object.entries(c||{}).filter(([i])=>ITEMS[i]).map(([i,v])=>`<span class="chip" title="${esc(ITEMS[i].n)}">${cxIc(i)}${v}</span>`).join('');}
function cxRtCat(t){const D=RT[t];if(!D)return 'plant';if(D.tool==='pick'||D.sk==='mine'||/Rock$|^(clay|saltPan|pebble|scree|pathStone|bones|shellBed)$/.test(t))return 'min';if(D.tool==='axe'||D.uproot||/^(log|deadLog|bamboo|palm)$/.test(t))return 'tree';return 'plant';}
function cxDisc(id){return !!(S.disc&&S.disc[id]);}
function cxSeenXZ(x,z){const c=WSIZE/FOGN,i=Math.floor((x+WSIZE/2)/c),j=Math.floor((z+WSIZE/2)/c);return i>=0&&j>=0&&i<FOGN&&j<FOGN&&fogSeen(i,j);}
function cxStName(st){return st?(ST_N[st]||(pieceDef(st)||{}).n||st):'Làm bằng tay';}
/* ---------- dữ liệu phân bố: lấy mẫu RES một lần vào lưới thô (trùng lưới sương mù 64×64) + đếm theo vùng ---------- */
function cxD(){const key=(S.seed|0)+'|'+WV+'|'+RES.length+'|'+REG.length;let D=CX.d;if(D&&D.key===key)return D;
  const N=FOGN,cw=WSIZE/N,H=WSIZE/2,grid={},tot={},byReg={};
  for(let n=0;n<RES.length;n++){const q=RES[n],t=q.t;if(!RT[t])continue;let g=grid[t];if(!g)g=grid[t]=new Uint16Array(N*N);const i=Math.floor((q.x+H)/cw),j=Math.floor((q.z+H)/cw);
    if(i>=0&&j>=0&&i<N&&j<N&&g[j*N+i]<65535)g[j*N+i]++;tot[t]=(tot[t]||0)+1;const r=regionAt(q.x,q.z);if(r){const m=byReg[r.id]||(byReg[r.id]={});m[t]=(m[t]||0)+1;}}
  CX.dc={};return CX.d={key,grid,tot,byReg};}
/* ---------- hồ sơ một vùng: địa hình, khí hậu, thú, độ nguy hiểm, đồ nên mang ---------- */
function cxRI(r){const key=(S.seed|0)+'|'+WV+'|'+REG.length;if(!CX.ri||CX.ri.key!==key)CX.ri={key};const D=CX.ri;if(D[r.id])return D[r.id];const bc={};let n=0,hs=0,hn=0,hm=-1e9;
  const pts=[[0,0]];for(const f of [0.33,0.66,0.92])for(let a=0;a<12;a++)pts.push([Math.cos(a*0.5236+f)*f,Math.sin(a*0.5236+f)*f]);
  for(const [u,v] of pts){const x=r.x+u*r.r,z=r.z+v*r.r;if(Math.abs(x)>WSIZE/2||Math.abs(z)>WSIZE/2)continue;const b=wdAt(x,z)>0.3?'water':bAt(x,z);bc[b]=(bc[b]||0)+1;n++;const h=hAt(x,z);if(b!=='water'){hs+=h;hn++;}if(h>hm)hm=h;}
  for(const k in bc)bc[k]/=n||1;const hav=hn?hs/hn:0,wet=(bc.water||0)+(bc.bank||0);
  const an=[];for(const k in ANIMALS){const A=ANIMALS[k];if(!A.n0||!A.bio||!A.bio.length)continue;const strong=!!(A.reg&&A.reg.includes(r.id));let bf=0;for(const b of A.bio)bf+=bc[b]||0;
    let lv=strong?2:bf>=0.3?1:0;if(k==='crocodile'&&!strong&&wet<0.12)lv=0;if(r.id==='start'&&A.aggro!=='never')lv=0;if(lv)an.push([k,lv]);}
  an.sort((a,b)=>b[1]-a[1]||(ANIMALS[b[0]].dmg||0)-(ANIMALS[a[0]].dmg||0));
  const nd=[];if(typeof H3NODE==='object')for(const k in H3NODE){const N3=H3NODE[k];let f=0;if(N3.water)f=wet>0.08?1:0;else for(const b of N3.bio||[])f+=bc[BCODE[b]]||0;if(f>=0.25)nd.push(k);}
  let dg=0;for(const [k,lv] of an){const A=ANIMALS[k],dm=A.dmg||0;const w=dm>=20&&A.aggro!=='defend'?1.4:dm>=20?0.6:A.aggro==='night'?0.8:A.aggro==='territory'?0.35:0;dg+=w*(lv===2?1:0.5);}
  const sites=(typeof RL==='object'&&RL.sites||[]).filter(s=>s.reg===r.id);for(const s of sites)if(s.def.tribe&&RLTRIBE[s.def.tribe]&&RLTRIBE[s.def.tribe].mood<0)dg+=1.5;
  const cold=hav>280||(bc.peak||0)>0.12,cool=!cold&&hav>170;if(r.id==='camp')dg+=2.5;if(cold)dg+=0.8;if(/chasm|canyon|cliffs|gorge/.test(r.id))dg+=0.6;
  const lvl=Math.max(0,Math.min(4,Math.round(dg)));
  const clim=cold?'Lạnh buốt, gió núi; mùa đông tuyết phủ. Cần áo lông thú và lửa.':cool?'Mát, sương mù sớm chiều, đêm lạnh: nên mang áo ấm.':r.id==='hotspring'?'Ấm áp quanh năm nhờ mạch nước nóng, hơi nước bốc nghi ngút.':
    (bc.beach||0)>0.1?'Gió biển lộng, nắng gắt; nước biển mặn, phải tìm suối.':(bc.forest||0)>0.45?'Nóng ẩm dưới tán rừng, mưa nhiều, muỗi và rắn.':wet>0.3?'Mát mẻ ven nước, sáng sớm có sương; mùa hạ nhiều muỗi.':
    (bc.meadow||0)>0.45?'Khô thoáng, nắng nhiều; mùa hạ nóng, ít bóng râm.':'Ôn hoà, bốn mùa rõ rệt.';
  const terr=Object.entries(bc).filter(([,v])=>v>=0.12).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([b,v])=>`${CXB[b]||b} ${Math.round(v*100)}%`).join(', ')+(hav<20?' · thấp, ngang mặt nước':` · cao ~${Math.round(hav/20)} m`);
  const g=[];if(cold||cool)g.push('furcoat');if(lvl>=3)g.push(ITEMS.bronzeSpear?'bronzeSpear':'spear','bow');else if(lvl>=2)g.push('spear');if(an.some(v=>v[0]==='snake'))g.push('mintwater');
  if(wet>0.3)g.push('canoe');if(rlLvl(r,'ore')===3||rlLvl(r,'flint')===3)g.push('pick');if(rlLvl(r,'timber')===3)g.push('axe');if(rlLvl(r,'fish')===3)g.push('rod');if(rlLvl(r,'herb')===3)g.push('sickle');
  const gear=[...new Set(g)].filter(i=>ITEMS[i]).slice(0,6),era=Math.min(AGES.length-1,[0,0,1,2,3][lvl]+(rlLvl(r,'ore')===3&&lvl>=2?1:0));
  return D[r.id]={bc,hav,an,nd,sites,lvl,clim,terr,gear,era,wet};}
/* ---------- nguồn gốc & công dụng vật phẩm ---------- */
function cxSrc(){const sig=Object.keys(ITEMS).length+'|'+RECIPES.length+'|'+BUILD.length;if(CX.src&&CX.src.sig===sig)return CX.src;const g={},u={},add=(o,id,v)=>{(o[id]||(o[id]=[])).push(v);};
  for(const t in RT){const y=RT[t].yield;if(y)for(const i in y)add(g,i,{k:'rt',t});}
  if(typeof H3NODE==='object')for(const k in H3NODE)for(const i in H3NODE[k].yield||{})add(g,i,{k:'nd',t:k});
  for(const k in ANIMALS)for(const i in ANIMALS[k].drop||{})add(g,i,{k:'an',t:k,n:ANIMALS[k].drop[i]});
  for(const r of RECIPES){for(const i in r.out||{})add(g,i,{k:'rc',r});for(const i in r.in||{})add(u,i,{k:'rc',r});}
  for(const b of BUILD)for(const i in b.cost||{})add(u,i,{k:'bd',b});
  if(typeof TRADES==='object')for(const role in TRADES)(TRADES[role]||[]).forEach(([a,b])=>{for(const i in b)add(g,i,{k:'tr',who:((typeof ROLEN==='object'&&ROLEN[role])||role)+' · làng Suối Tây',a,b});});
  if(typeof RLTRIBE==='object')for(const tid in RLTRIBE)(RLTRIBE[tid].trade||[]).forEach(([a,b])=>{for(const i in b)add(g,i,{k:'tr',who:RLTRIBE[tid].n,a,b});});
  for(const id in ITEMS){const I=ITEMS[id];if(I.t==='seed'&&I.crop&&ITEMS[I.crop])add(g,I.crop,{k:'farm',s:id});}
  CX.ent=null;return CX.src={sig,g,u};}
/* ---------- danh mục để tra phân bố ---------- */
function cxEntries(){const sg=cxSrc();if(CX.ent&&CX.ent.sig===sg.sig)return CX.ent.L;const L=[];
  for(const t in RT){if(t==='pathStone')continue;const D=RT[t],ys=Object.keys(D.yield||{}).filter(i=>ITEMS[i]).map(i=>ITEMS[i].n).join(' ');L.push({k:'r:'+t,n:D.n,e:cxRe(t),c:cxRtCat(t),s:cxNorm(D.n+' '+ys)});}
  for(const k in ANIMALS){const A=ANIMALS[k];if(!A.n0||!A.bio||!A.bio.length)continue;L.push({k:'a:'+k,n:A.n,e:CXE_AN[k]||'🐾',c:'an',s:cxNorm(A.n+' thu')});}
  if(typeof H3NODE==='object')for(const k in H3NODE){const N3=H3NODE[k];L.push({k:'n:'+k,n:N3.n,e:CXE_N[k]||'🌿',c:'nd',s:cxNorm(N3.n+' '+Object.keys(N3.yield||{}).filter(i=>ITEMS[i]).map(i=>ITEMS[i].n).join(' '))});}
  for(const id in ITEMS){const s=(sg.g[id]||[]).filter(v=>v.k==='rt'||v.k==='nd');if(s.length)L.push({k:'i:'+id,n:ITEMS[id].n,e:EMO[id]||'❔',c:'it',s:cxNorm(ITEMS[id].n+' san vat')});}
  CX.ent={sig:sg.sig,L};return L;}
function cxEntry(k){return cxEntries().find(e=>e.k===k)||null;}
function cxTypes(key){const p=key[0],id=key.slice(2);if(p==='r')return {rt:[id],nd:[]};if(p==='n')return {rt:[],nd:[id]};if(p==='a')return {rt:[],nd:[],an:id};
  const s=cxSrc().g[id]||[];return {rt:[...new Set(s.filter(v=>v.k==='rt').map(v=>v.t))],nd:[...new Set(s.filter(v=>v.k==='nd').map(v=>v.t))]};}
// tổ chim, ốc, củ… sinh theo ô (hunt3): chỉ lấy ô đã khám phá quanh người chơi
function cxNodes(kinds){const out=[];if(typeof h3cellNodes!=='function'||!kinds.length)return out;const C=typeof H3CELL==='number'?H3CELL:320,R=3600,i0=Math.floor((P.x-R)/C),i1=Math.floor((P.x+R)/C),j0=Math.floor((P.z-R)/C),j1=Math.floor((P.z+R)/C);
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const cx=(i+0.5)*C,cz=(j+0.5)*C;if(Math.hypot(cx-P.x,cz-P.z)>R+C||!cxSeenXZ(cx,cz))continue;let L;try{L=h3cellNodes(i,j);}catch(e){continue;}for(const n of L)if(kinds.includes(n.kind))out.push(n);}return out;}
function cxDist(key){if(CX.dc[key])return CX.dc[key];const D=cxD(),T=cxTypes(key),N=FOGN,cw=WSIZE/N,H=WSIZE/2,cell=new Float32Array(N*N),ts=new Set(T.rt);
  for(const t of T.rt){const g=D.grid[t];if(!g)continue;for(let n=0;n<N*N;n++)if(g[n])cell[n]+=g[n];}
  const pts=[];let best=null,bd=1e18;const cand=(x,z,n)=>{const d=(x-P.x)*(x-P.x)+(z-P.z)*(z-P.z);if(d<bd){bd=d;best={x,z,n};}};
  for(const q of RES){if(!ts.has(q.t))continue;const i=Math.floor((q.x+H)/cw),j=Math.floor((q.z+H)/cw);if(i<0||j<0||i>=N||j>=N||!fogSeen(i,j))continue;if(pts.length<3000)pts.push(q.x,q.z);cand(q.x,q.z,RT[q.t].n);}
  for(const n of cxNodes(T.nd)){const i=Math.floor((n.x+H)/cw),j=Math.floor((n.z+H)/cw);cell[j*N+i]+=1;pts.push(n.x,n.z);cand(n.x,n.z,H3NODE[n.kind].n);}
  const live=[];if(T.an)for(const a of (G.animals||[])){if(!a.alive||a.kind!==T.an||!cxSeenXZ(a.x,a.z))continue;live.push(a.x,a.z);cand(a.x,a.z,a.n||ANIMALS[T.an].n);}
  let mx=0,known=0;for(let n=0;n<N*N;n++){if(!cell[n])continue;if(fogSeen(n%N,(n/N)|0)){known++;if(cell[n]>mx)mx=cell[n];}}
  const regs=[];for(const r of REG){let c=0;if(T.an){const a=cxRI(r).an.find(v=>v[0]===T.an);c=a?a[1]*8:0;}else{const m=D.byReg[r.id]||{};for(const t of T.rt)c+=m[t]||0;if(T.nd.length&&cxRI(r).nd.some(k=>T.nd.includes(k)))c+=4;}if(c>0)regs.push([r,c]);}
  regs.sort((a,b)=>b[1]-a[1]);return CX.dc[key]={T,cell,mx,known,pts,live,best:best&&Object.assign(best,{d:Math.sqrt(bd)}),regs};}
/* ---------- vẽ bản đồ (dùng tranh bản đồ sẵn có; sương mù như bảng Bản đồ) ---------- */
function cxCanvas(cv,V,img){const box=cv.parentElement.getBoundingClientRect(),W=Math.max(220,Math.floor(Math.min(box.width||330,440))),pr=Math.min(2,devicePixelRatio||1);
  if(cv.width!==W*pr){cv.width=W*pr;cv.height=W*pr;cv.style.width=W+'px';cv.style.height=W+'px';}const c=cv.getContext('2d');c.setTransform(pr,0,0,pr,0,0);c.fillStyle='#d9c49a';c.fillRect(0,0,W,W);c.imageSmoothingEnabled=true;
  if(img)c.drawImage(img,0,0,W,W);else{const mb=mapBase(),N=mb.width;c.drawImage(mb,(V.x0+WSIZE/2)/WSIZE*N,(V.z0+WSIZE/2)/WSIZE*N,V.span/WSIZE*N,V.span/WSIZE*N,0,0,W,W);}
  const sx=x=>(x-V.x0)/V.span*W,sy=z=>(z-V.z0)/V.span*W,cw=WSIZE/FOGN;cxGridImg(c,cxFogCv(),V,W);
  const i0=Math.max(0,Math.floor((V.x0+WSIZE/2)/cw)),j0=Math.max(0,Math.floor((V.z0+WSIZE/2)/cw)),i1=Math.min(FOGN-1,Math.ceil((V.x0+V.span+WSIZE/2)/cw)),j1=Math.min(FOGN-1,Math.ceil((V.z0+V.span+WSIZE/2)/cw));
  cv._V=V;return {c,W,sx,sy,k:W/V.span,i0,j0,i1,j1,cw};}
// lưới 64×64 vẽ thành ảnh nhỏ rồi phóng to có làm mịn (sương mù, bản đồ nhiệt mềm mép, không có đường kẻ)
function cxGridImg(c,img,V,W){const N=FOGN;c.imageSmoothingEnabled=true;c.drawImage(img,(V.x0+WSIZE/2)/WSIZE*N,(V.z0+WSIZE/2)/WSIZE*N,V.span/WSIZE*N,V.span/WSIZE*N,0,0,W,W);}
function cxFogCv(){const N=FOGN,cv=CX.fogCv||(CX.fogCv=mkCanvas(N,N)),c=cv.getContext('2d'),im=c.createImageData(N,N),d=im.data;
  for(let j=0;j<N;j++)for(let i=0;i<N;i++)if(!fogSeen(i,j)){const k=(j*N+i)*4;d[k]=214;d[k+1]=192;d[k+2]=148;d[k+3]=214;}c.putImageData(im,0,0);return cv;}
// khung nhìn vừa khít phần đã khám phá
function cxFitView(){const N=FOGN,cw=WSIZE/N;let a=N,b=N,e=-1,f=-1;for(let j=0;j<N;j++)for(let i=0;i<N;i++)if(fogSeen(i,j)){if(i<a)a=i;if(i>e)e=i;if(j<b)b=j;if(j>f)f=j;}
  if(e<0)return {x0:P.x-1500,z0:P.z-1500,span:3000};const x0=-WSIZE/2+(a-1)*cw,x1=-WSIZE/2+(e+2)*cw,z0=-WSIZE/2+(b-1)*cw,z1=-WSIZE/2+(f+2)*cw,sp=Math.min(WSIZE,Math.max(3000,x1-x0,z1-z0)),cx=(x0+x1)/2,cz=(z0+z1)/2;
  return {x0:clamp(cx-sp/2,-WSIZE/2,WSIZE/2-sp),z0:clamp(cz-sp/2,-WSIZE/2,WSIZE/2-sp),span:sp};}
const cxView=()=>CX.dv==='all'?{x0:-WSIZE/2,z0:-WSIZE/2,span:WSIZE}:cxFitView();
const cxVBtn=()=>`<div class="mapz"><button data-a="cxdv" data-v="${CX.dv==='all'?'fit':'all'}" aria-label="Đổi tầm nhìn">${CX.dv==='all'?'◎':'⤢'}</button></div>`;
function cxLbl(c,t,x,y,f){c.font=f;c.lineWidth=3;c.strokeStyle='rgba(255,246,226,.9)';c.strokeText(t,x,y);c.fillStyle='#3a2410';c.fillText(t,x,y);}
function cxMe(o){const {c,sx,sy}=o;if(S.mark){c.font='16px system-ui';c.textAlign='center';c.fillText('📍',sx(S.mark.x),sy(S.mark.z)-2);}const px=sx(P.x),py=sy(P.z);
  c.save();c.translate(px,py);c.rotate(Math.PI-camYaw());c.beginPath();c.moveTo(0,-8);c.lineTo(5.5,6);c.lineTo(0,2.5);c.lineTo(-5.5,6);c.closePath();c.fillStyle='#e8402a';c.fill();c.lineWidth=2;c.strokeStyle='#fff';c.stroke();c.restore();}
function cxRegMarks(o,sel){const {c,sx,sy,k}=o;c.textAlign='center';for(const r of REG){const x=sx(r.x),y=sy(r.z),kn=cxDisc(r.id);if(x<-40||y<-40||x>o.W+40||y>o.W+40)continue;
    if(r.id===sel){c.beginPath();c.arc(x,y,Math.max(9,r.r*k),0,7);c.setLineDash([6,4]);c.lineWidth=2.5;c.strokeStyle='#c8301a';c.stroke();c.setLineDash([]);c.fillStyle='rgba(242,197,90,.18)';c.fill();}
    if(!kn&&!cxSeenXZ(r.x,r.z)){if(r.id===sel){c.font='700 13px system-ui';c.fillStyle='#3a2410';c.fillText('?',x,y+4);}continue;}
    c.font='13px system-ui';c.fillStyle='#000';c.fillText(kn?r.ic:'❔',x,y+4);if(kn&&(o.W/o.k<9000||r.id===sel))cxLbl(c,r.n,x,y+17,'700 9.5px "Be Vietnam Pro",system-ui,sans-serif');}}
function cxDrawOverview(){const cv=$('#cxmap');if(!cv)return;const o=cxCanvas(cv,cxView());cxRegMarks(o,CX.reg);cxMe(o);cxTap(cv,(x,z)=>{const r=regionAt(x,z);if(r){CX.reg=r.id;sfx('pick');uiOpenRefresh();}});}
function cxRegView(r){const sp=Math.max(900,r.r*2.7);return {x0:r.x-sp/2,z0:r.z-sp/2,span:sp};}
function cxDrawRegion(){const cv=$('#cxrmap'),r=REG.find(q=>q.id===CX.reg);if(!cv||!r)return;const V=cxRegView(r);let img=CX.rimg[r.id];
  if(!img){try{img=CX.rimg[r.id]=mapRender(V.x0,V.z0,V.span,150);}catch(e){img=null;}}const o=cxCanvas(cv,V,img);cxRegMarks(o,r.id);const {c,sx,sy}=o;
  if(typeof RL==='object'&&S.rlm)for(const s of RL.sites){if(!S.rlm.kn||!S.rlm.kn[s.id])continue;const x=sx(s.x),y=sy(s.z);c.beginPath();c.arc(x,y,10,0,7);c.fillStyle='rgba(30,18,8,.75)';c.fill();c.font='12px system-ui';c.fillStyle='#fff';c.fillText(s.def.ic,x,y+4);}
  cxMe(o);}
function cxDrawDist(){const cv=$('#cxdmap');if(!cv||!CX.sel)return;const R=cxDist(CX.sel),V=cxView();
  const o=cxCanvas(cv,V),{c,sx,sy,k,cw}=o,N=FOGN;let heat=0,dots=0,rg=0;
  // vùng đã biết có thứ này: viền đứt nét (thú: tô nhạt theo mức thường gặp)
  const top=R.regs.length?R.regs[0][1]:1;for(const [r,v] of R.regs){if(!cxDisc(r.id))continue;rg++;const x=sx(r.x),y=sy(r.z),rr=Math.max(8,r.r*k*0.9);c.beginPath();c.arc(x,y,rr,0,7);
    if(R.T.an){c.fillStyle=v>=16?'rgba(214,64,24,.30)':'rgba(214,64,24,.15)';c.fill();}c.setLineDash([5,4]);c.lineWidth=1.5+2*Math.min(1,v/top);c.strokeStyle='rgba(150,34,10,.75)';c.stroke();c.setLineDash([]);}
  // mật độ: chỉ ô đã khám phá
  if(R.mx>0){const hc=CX.heatCv||(CX.heatCv=mkCanvas(N,N)),hx=hc.getContext('2d'),im=hx.createImageData(N,N),dd=im.data;
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){const v=R.cell[j*N+i];if(!v||!fogSeen(i,j))continue;const q=(j*N+i)*4;dd[q]=232;dd[q+1]=72;dd[q+2]=18;dd[q+3]=Math.round(255*(0.3+0.6*Math.sqrt(v/R.mx)));if(i>=o.i0&&i<=o.i1&&j>=o.j0&&j<=o.j1)heat++;}
    hx.putImageData(im,0,0);cxGridImg(c,hc,V,o.W);}
  const P2=R.pts,ds=V.span<6000?3:2.2;c.fillStyle='rgba(40,14,4,.85)';for(let n=0;n<P2.length;n+=2){const x=sx(P2[n]),y=sy(P2[n+1]);if(x<0||y<0||x>o.W||y>o.W)continue;c.fillRect(x-ds/2,y-ds/2,ds,ds);dots++;}
  const L=R.live;for(let n=0;n<L.length;n+=2){const x=sx(L[n]),y=sy(L[n+1]);c.beginPath();c.arc(x,y,3.4,0,7);c.fillStyle='#d8452a';c.fill();c.lineWidth=1.2;c.strokeStyle='#fff';c.stroke();dots++;}
  cxRegMarks(o,null);if(R.best){const x=sx(R.best.x),y=sy(R.best.z);c.beginPath();c.arc(x,y,9,0,7);c.lineWidth=2.5;c.strokeStyle='#1a6ad8';c.stroke();c.beginPath();c.arc(x,y,13,0,7);c.lineWidth=1;c.stroke();}
  cxMe(o);CX.last={key:CX.sel,heat,dots,regs:rg,known:R.known,best:!!R.best};}
function cxTap(cv,fn){if(cv._cx)return;cv._cx=1;let st=null;cv.addEventListener('pointerdown',e=>{st=[e.clientX,e.clientY];});
  cv.addEventListener('pointerup',e=>{if(!st||Math.hypot(e.clientX-st[0],e.clientY-st[1])>8)return;st=null;const r=cv.getBoundingClientRect(),V=cv._V;if(!V)return;fn(V.x0+(e.clientX-r.left)/r.width*V.span,V.z0+(e.clientY-r.top)/r.height*V.span);});}
/* ---------- thẻ Vùng đất ---------- */
function cxDangerB(l){const [t,c]=CXDG[l];return `<span class="cx-dg" style="--c:${c}">${'●'.repeat(l+1)}${'○'.repeat(4-l)} ${t}</span>`;}
function cxRumor(r){const ri=cxRI(r),top=Object.entries(ri.bc).sort((a,b)=>b[1]-a[1])[0],d=Math.hypot(r.x-P.x,r.z-P.z);
  return `Nghe nói ở phía ${cxDir(r.x,r.z)}, cách chừng ${cxM(d)}, có một vùng ${top?CXB[top[0]]||'đất lạ':'đất lạ'}${ri.lvl>=3?', người đi về kể là nguy hiểm':''}.`;}
function cxRegList(){const cur=regionAt(P.x,P.z),L=REG.slice().sort((a,b)=>(cxDisc(b.id)-cxDisc(a.id))||((b===cur)-(a===cur))||Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z));
  return L.map(r=>{const kn=cxDisc(r.id),d=Math.hypot(r.x-P.x,r.z-P.z);if(!kn)return `<button class="cx-row dim" data-a="cxreg" data-r="${r.id}"><span class="cx-e">❔</span><span class="cx-rt"><b>???</b><small>${esc(cxRumor(r))}</small></span></button>`;
    const ri=cxRI(r);return `<button class="cx-row${r===cur?' cur':''}" data-a="cxreg" data-r="${r.id}"><span class="cx-e">${r.ic}</span><span class="cx-rt"><b>${esc(r.n)}${r===cur?' · <em>bạn đang ở đây</em>':''}</b><small>${cxDangerB(ri.lvl)} · ${r===cur?'quanh đây':cxM(d)+' '+cxDir(r.x,r.z)}</small></span></button>`;}).join('');}
function cxResRows(r){if(!RLPS[r.id])return '<span class="small muted">Mọi thứ ở mức thường.</span>';const by={3:[],2:[],1:[]};for(const c in RLC)by[rlLvl(r,c)].push(c);
  const row=(lv,lab,cls)=>by[lv].length?`<div class="cx-rl"><span class="small muted">${lab}</span><div>${by[lv].map(c=>`<span class="rl-c ${cls}">${RLC[c][1]} ${RLC[c][0]}</span>`).join('')}</div></div>`:'';
  return row(3,'Giàu','rich')+row(1,'Nghèo','poor')+row(2,'Thường','cx-mid');}
function cxTypeChips(m,cat,max){const L=Object.entries(m||{}).filter(([t,n])=>RT[t]&&t!=='pathStone'&&cxRtCat(t)===cat&&n>0).sort((a,b)=>b[1]-a[1]).slice(0,max||12);
  if(!L.length)return '<span class="small muted">Hầu như không có.</span>';const top=L[0][1];
  return L.map(([t,n])=>`<button class="cx-tag" data-a="cxdist" data-k="r:${t}"><i>${cxRe(t)}</i>${esc(RT[t].n)}<em>${n>=top*0.5?'nhiều':n>=top*0.15?'vừa':'ít'}</em></button>`).join('');}
function cxRegDetail(r){const back='<button class="btn sm ghost" data-a="cxback">← Tất cả vùng</button>';
  if(!cxDisc(r.id))return `${back}<div class="cx-card"><h3 class="cx-h">❔ Vùng chưa biết</h3><p>${esc(cxRumor(r))}</p><p class="small muted">Đi tới đó để ghi vào Bách khoa: tên vùng, cây cỏ, muông thú, tài nguyên giàu nghèo.</p></div>`;
  const ri=cxRI(r),D=cxD(),m=D.byReg[r.id]||{},d=Math.hypot(r.x-P.x,r.z-P.z),cur=regionAt(P.x,P.z)===r;
  const an=ri.an.length?ri.an.map(([k,lv])=>{const A=ANIMALS[k],bad=A.aggro&&A.aggro!=='never'&&A.aggro!=='defend';return `<button class="cx-tag${bad?' bad':''}" data-a="cxani" data-k="${k}"><i>${CXE_AN[k]||'🐾'}</i>${esc(A.n)}<em>${lv===2?'thường gặp':'đôi khi'}</em></button>`;}).join(''):'<span class="small muted">Ít thú lớn.</span>';
  const nd=ri.nd.length?ri.nd.map(k=>`<button class="cx-tag" data-a="cxdist" data-k="n:${k}"><i>${CXE_N[k]||'🌿'}</i>${esc(H3NODE[k].n)}</button>`).join(''):'';
  const sites=[];for(const s of ri.sites){const kn=S.rlm&&S.rlm.kn&&S.rlm.kn[s.id];if(kn){const T=s.def.tribe&&RLTRIBE[s.def.tribe];sites.push(`<li>${s.def.ic} <b>${esc(s.def.n)}</b> ${'★'.repeat(s.def.rich)}${T?` · <span style="color:${T.col}">${esc(T.n)}</span> ${T.mood<0?'(thù địch)':'(trao đổi được)'}`:''}<br><span class="small muted">${esc(s.def.d)}</span></li>`);}
    else sites.push(`<li>❔ <span class="small">Có lời đồn về một điểm giàu ở đây. Đứng trong vùng, dùng <b>🔍 Thăm dò</b> (Bản đồ → Lãnh địa) để tìm.</span></li>`);}
  if(r.id==='village')sites.push('<li>🛖 <b>Làng Suối Tây</b> · bộ lạc láng giềng hiếu khách: trao đổi đồ, học nghề, mời người về ở.</li>');
  if(r.id==='camp')sites.push('<li>⚔️ <b>Trại Núi Đá</b> · bộ lạc hiếu chiến, hay đi cướp ban đêm. Kho chiến lợi phẩm có đồng thau, mũi tên.</li>');
  if(r.id==='cave')sites.push('<li>🕳️ <b>Hang đá</b> · chỗ trú khô ráo, tranh vẽ trên vách.</li>');if(r.id==='hotspring')sites.push('<li>♨️ <b>Suối nóng</b> · ngâm mình hồi ấm, hồi sức.</li>');
  if(r.id==='vista')sites.push('<li>🔭 <b>Ụ đá ngắm cảnh</b> · nhìn ra cả một vùng trời.</li>');if(r.id==='start')sites.push('<li>🔥 <b>Nơi bạn tỉnh dậy</b> · đá, cành, sợi, đá lửa đủ cho những ngày đầu.</li>');
  const eraN=AGES[ri.era]?AGES[ri.era].n:'';
  return `${back}<div class="cx-card cx-reg"><div class="cx-mapw"><canvas id="cxrmap"></canvas></div>
    <h3 class="cx-h">${r.ic} ${esc(r.n)}</h3><p class="small">${esc(r.d)}</p>
    <div class="cx-facts"><div><span>🧭 Vị trí</span><b>${cur?'Bạn đang ở đây':cxM(d)+' về phía '+cxDir(r.x,r.z)}</b></div><div><span>⛰️ Địa hình</span><b>${esc(ri.terr)}</b></div>
      <div><span>🌤️ Khí hậu</span><b>${esc(ri.clim)}</b></div><div><span>⚠️ Nguy hiểm</span><b>${cxDangerB(ri.lvl)}</b></div></div>
    <h4>⛏️ Tài nguyên</h4>${cxResRows(r)}${S.rlm&&S.rlm.pro&&S.rlm.pro[r.id]?'':'<p class="small muted">Thăm dò tại chỗ còn tìm ra điểm giàu có tên.</p>'}
    <h4>🌲 Cây gỗ</h4><div class="cx-tags">${cxTypeChips(m,'tree',10)}</div>
    <h4>🌿 Cây cỏ, hoa quả, thảo dược</h4><div class="cx-tags">${cxTypeChips(m,'plant',14)}</div>
    <h4>🪨 Đá, khoáng, đất</h4><div class="cx-tags">${cxTypeChips(m,'min',8)}</div>
    <h4>🐾 Muông thú</h4><div class="cx-tags">${an}</div>${nd?`<h4>🪺 Hái lượm khác</h4><div class="cx-tags">${nd}</div>`:''}
    ${sites.length?`<h4>🏴 Điểm đặc biệt, làng trại</h4><ul class="cx-ul">${sites.join('')}</ul>`:''}
    <h4>🎒 Nên mang</h4><p class="small">Hợp từ <b>${esc(eraN)}</b> trở đi.</p><div class="chips">${ri.gear.map(i=>cxChip(i)).join('')||'<span class="small muted">Đồ cơ bản là đủ.</span>'}</div>
    <div class="row cx-act"><button class="btn sm" data-a="cxmark" data-x="${r.x.toFixed(1)}" data-z="${r.z.toFixed(1)}" data-n="${esc(r.n)}">📍 Đánh dấu</button></div></div>`;}
function cxRegHtml(){if(CX.reg){const r=REG.find(q=>q.id===CX.reg);if(r)return cxRegDetail(r);CX.reg=null;}const n=REG.filter(r=>cxDisc(r.id)).length;
  return `<div class="cx-mapw"><canvas id="cxmap"></canvas>${cxVBtn()}</div><p class="small muted">Đã khám phá <b>${n}/${REG.length}</b> vùng. Chạm một vùng trên bản đồ hoặc trong danh sách để xem.</p><div class="cx-list">${cxRegList()}</div>`;}
/* ---------- thẻ Phân bố ---------- */
function cxHints(R,name){const out=[];for(const [r,v] of R.regs){if(cxDisc(r.id)||out.length>=3)continue;if(v<(R.T.an?8:3))continue;const d=Math.hypot(r.x-P.x,r.z-P.z);
    out.push(`<li>Nghe nói ở phía <b>${cxDir(r.x,r.z)}</b>, cách chừng ${cxM(d)}, có ${R.T.an?'':'nhiều '}${esc(name.toLowerCase())}…</li>`);}return out;}
function cxDistPanel(){const e=CX.sel&&cxEntry(CX.sel);if(!e)return `<div class="cx-card cx-empty"><b>🔎 Chọn một thứ bên dưới</b><p class="small muted">Gõ tên (không dấu cũng được): "dong" ra quặng đồng, "nam" ra các loại nấm, "ho" ra hổ… Bản đồ sẽ tô nơi có thứ đó.</p></div>`;
  const R=cxDist(CX.sel),b=R.best,hints=cxHints(R,e.n),kr=R.regs.filter(([r])=>cxDisc(r.id)).slice(0,6);
  return `<div class="cx-card"><div class="cx-dh"><span class="cx-e">${e.e}</span><div><b>${esc(e.n)}</b><small class="muted">${CXCAT[e.c]||''}</small></div>${e.k[0]==='a'?`<button class="btn sm ghost" data-a="cxani" data-k="${e.k.slice(2)}">Xem thú</button>`:e.k[0]==='i'?`<button class="btn sm ghost" data-a="cxitem" data-k="${e.k.slice(2)}">Vật phẩm</button>`:''}</div>
    <div class="cx-mapw"><canvas id="cxdmap"></canvas>${cxVBtn()}</div>
    <div class="cx-leg"><span><i class="h"></i>mật độ (ít → nhiều)</span><span><i class="d"></i>chỗ đã thấy</span><span><i class="r"></i>vùng có</span><span><i class="n"></i>gần nhất</span><span><i class="f"></i>chưa khám phá</span></div>
    ${b?`<div class="cx-near"><div><b>Gần nhất: ${esc(b.n)}</b><small>${b.d<60?'ngay quanh đây':cxM(b.d)+' về phía '+cxDir(b.x,b.z)}${R.T.an?' · thú di chuyển, có thể đã đi chỗ khác':''}</small></div><button class="btn sm" data-a="cxmark" data-x="${b.x.toFixed(1)}" data-z="${b.z.toFixed(1)}" data-n="${esc(b.n)}">📍 Đánh dấu</button></div>`
      :`<p class="small muted">Chưa thấy ở vùng đã khám phá${R.T.nd.length?' quanh bạn':''}.</p>`}
    ${kr.length?`<p class="small"><span class="muted">Vùng đã biết có:</span> ${kr.map(([r])=>`<button class="cx-tag" data-a="cxreg" data-r="${r.id}"><i>${r.ic}</i>${esc(r.n)}</button>`).join('')}</p>`:''}
    ${hints.length?`<ul class="cx-ul cx-rum">${hints.join('')}</ul>`:''}</div>`;}
function cxDistHtml(){const L=cxEntries(),k=cxS(),f=G.cxCat||'';const cats=['','tree','plant','min','an','nd','it'];
  return `${cxDistPanel()}<div class="cx-search"><input id="cxq" type="search" placeholder="🔍 Tìm tài nguyên, cây, thú, quặng…" value="${esc(G.cxq||'')}" autocomplete="off"></div>
    <div class="chipsel">${cats.map(c=>`<button class="tb sm${f===c?' on':''}" data-a="cxcat" data-c="${c}">${c?CXCAT[c]:'Tất cả'}</button>`).join('')}</div>
    <div class="cx-list cx-ents">${L.filter(e=>!f||e.c===f).map(e=>`<button class="cx-row sm${CX.sel===e.k?' cur':''}" data-a="cxsel" data-k="${e.k}" data-s="${esc(e.s)}"><span class="cx-e">${e.e}</span><span class="cx-rt"><b>${esc(e.n)}</b><small>${CXCAT[e.c]||''}${k[e.k]||(e.k[0]==='i'&&S.seen[e.k.slice(2)])?' · ✓ đã gặp':''}</small></span></button>`).join('')}</div><p class="muted small cx-none" hidden>Không thấy gì khớp.</p>`;}
/* ---------- thẻ Vật phẩm ---------- */
const CXIT={res:'Nguyên liệu',food:'Đồ ăn',drink:'Đồ uống',herb:'Thảo dược',med:'Thuốc',tool:'Công cụ',wear:'Đồ mặc',seed:'Hạt giống',boat:'Thuyền',sap:'Cây giống'};
function cxItemHtml(){const ids=Object.keys(ITEMS),ord=Object.keys(CXIT);ids.sort((a,b)=>{const ta=ord.indexOf(ITEMS[a].t),tb=ord.indexOf(ITEMS[b].t);return (ta<0?99:ta)-(tb<0?99:tb)||ITEMS[a].n.localeCompare(ITEMS[b].n,'vi');});
  const f=G.cxIt||'';const ts=ord.filter(t=>ids.some(i=>ITEMS[i].t===t));
  return `<div class="cx-search"><input id="cxiq" type="search" placeholder="🔍 Tìm vật phẩm (gõ không dấu cũng được)" value="${esc(G.cxiq||'')}" autocomplete="off"></div>
    <div class="chipsel">${['',...ts].map(t=>`<button class="tb sm${f===t?' on':''}" data-a="cxit" data-t="${t}">${t?CXIT[t]:'Tất cả'}</button>`).join('')}</div><p class="small muted">${ids.length} vật phẩm · ✓ là đã có trong tay. Chạm để xem nguồn gốc, công dụng.</p>
    <div class="cx-list cx-items">${ids.filter(i=>!f||ITEMS[i].t===f).map(i=>`<div class="cx-it" data-s="${esc(cxNorm(ITEMS[i].n+' '+(CXIT[ITEMS[i].t]||'')))}"><button class="cx-row sm${G.cxItem===i?' cur':''}" data-a="cxitem" data-k="${i}">${cxIc(i)}<span class="cx-rt"><b>${esc(ITEMS[i].n)}</b><small>${CXIT[ITEMS[i].t]||'Khác'}${S.seen[i]?' · ✓':''}</small></span></button>${G.cxItem===i?cxItemDet(i):''}</div>`).join('')}</div><p class="muted small cx-none" hidden>Không thấy vật phẩm nào.</p>`;}
function cxItemDet(id){const I=ITEMS[id],sg=cxSrc(),g=sg.g[id]||[],u=sg.u[id]||[],li=[];
  const info=[I.food?`+${I.food} no`:'',I.drink?`+${I.drink} nước`:'',I.hp?`+${I.hp*2} máu`:'',I.warm?`+${I.warm} ấm`:'',I.cure&&STATUS[I.cure]?`chữa ${STATUS[I.cure].n}`:'',I.raw?'ăn sống dễ ngộ độc':'',I.poison?'CÓ ĐỘC':'',I.pow?`sức ${I.pow}`:''].filter(Boolean).join(' · ');
  const rt=[...new Set(g.filter(v=>v.k==='rt').map(v=>v.t))];if(rt.length)li.push(`<li><b>Thu hái:</b> ${rt.map(t=>`<button class="cx-tag" data-a="cxdist" data-k="r:${t}"><i>${cxRe(t)}</i>${esc(RT[t].n)}<em>${RT[t].tool==='axe'?'chặt':RT[t].tool==='pick'||RT[t].sk==='mine'?'đào':'hái'}</em></button>`).join('')}</li>`);
  const nd=[...new Set(g.filter(v=>v.k==='nd').map(v=>v.t))];if(nd.length)li.push(`<li><b>Tìm:</b> ${nd.map(k=>`<button class="cx-tag" data-a="cxdist" data-k="n:${k}"><i>${CXE_N[k]||'🌿'}</i>${esc(H3NODE[k].n)}</button>`).join('')}</li>`);
  const an=g.filter(v=>v.k==='an');if(an.length)li.push(`<li><b>Săn:</b> ${an.map(v=>`<button class="cx-tag" data-a="cxani" data-k="${v.t}"><i>${CXE_AN[v.t]||'🐾'}</i>${esc(ANIMALS[v.t].n)}<em>×${v.n}</em></button>`).join('')}</li>`);
  for(const v of g.filter(v=>v.k==='rc').slice(0,4))li.push(`<li><b>Chế tạo</b> · ${esc(cxStName(v.r.st))}${v.r.tool&&ITEMS[v.r.tool]?' · cần '+esc(ITEMS[v.r.tool].n.toLowerCase()):''}: <span class="chips">${cxCost(v.r.in)}</span></li>`);
  for(const v of g.filter(v=>v.k==='farm'))li.push(`<li><b>Trồng:</b> gieo ${cxChip(v.s)} trên luống đất.</li>`);
  const tr=g.filter(v=>v.k==='tr');if(tr.length)li.push(`<li><b>Đổi chác:</b> ${tr.slice(0,4).map(v=>`<span class="small">${esc(v.who)}: </span><span class="chips">${cxCost(v.a)} → ${cxCost(v.b)}</span>`).join('<br>')}</li>`);
  if(CXSRC[id])li.push(`<li>${esc(CXSRC[id])}</li>`);if(!li.length)li.push('<li class="muted">Chưa rõ nguồn: có thể nhận được từ việc đặc biệt (lễ hội, trao đổi, sự kiện).</li>');
  const ur=[...new Map(u.filter(v=>v.k==='rc').map(v=>[Object.keys(v.r.out)[0],v.r])).values()],ub=u.filter(v=>v.k==='bd').map(v=>v.b);
  const uses=[];if(ur.length)uses.push(`<li><b>Nguyên liệu để làm:</b> <span class="chips">${ur.slice(0,14).map(r=>{const o=Object.keys(r.out)[0];return ITEMS[o]?`<button class="chip cx-ch" data-a="cxitem" data-k="${o}">${cxIc(o)}${esc(ITEMS[o].n)}</button>`:'';}).join('')}</span>${ur.length>14?` <span class="small muted">+${ur.length-14}</span>`:''}</li>`);
  if(ub.length)uses.push(`<li><b>Xây:</b> ${ub.slice(0,12).map(b=>esc(b.n)).join(', ')}${ub.length>12?` +${ub.length-12}`:''}</li>`);
  const canDist=rt.length||nd.length;
  return `<div class="cx-det"><div class="cx-dh">${icon(id,'big')}<div><b>${esc(I.n)}</b><small class="muted">${CXIT[I.t]||'Khác'}${S.seen[id]?' · ✓ đã có':''}</small></div></div>${I.ds?`<p class="small">${esc(I.ds)}</p>`:''}${info?`<p class="small cx-stat">${esc(info)}</p>`:''}<h4>Có được từ</h4><ul class="cx-ul">${li.join('')}</ul>${uses.length?`<h4>Dùng để</h4><ul class="cx-ul">${uses.join('')}</ul>`:''}
    ${canDist?`<div class="row"><button class="btn sm ghost" data-a="cxdist" data-k="i:${id}">🗺️ Xem phân bố</button></div>`:''}</div>`;}
/* ---------- thẻ Muông thú ---------- */
function cxAnimHtml(){const ks=Object.keys(ANIMALS).filter(k=>ANIMALS[k].n0&&ANIMALS[k].bio&&ANIMALS[k].bio.length),seen=cxS(),foc=G.cxAni;
  return `<p class="small muted">Tập tính, độ nguy hiểm, cách săn và nơi sống của muông thú. Thú đã gặp có dấu ✓.</p>`+ks.map(k=>{const A=ANIMALS[k],dm=A.dmg||0,lv=A.aggro==='never'?0:A.aggro==='defend'?(dm>=20?2:1):dm>=20?4:A.aggro==='night'?3:2;
    return `<details class="cx-card cx-an" id="cxa-${k}"${foc===k?' open':''}><summary><span class="cx-e">${CXE_AN[k]||'🐾'}</span><span class="cx-rt"><b>${esc(A.n)}${seen['a:'+k]?' ✓':''}</b><small>${cxDangerB(lv)}</small></span></summary>${cxAnimDet(k)}</details>`;}).join('');}
function cxAnimDet(k){const A=ANIMALS[k],dm=A.dmg||0,L=typeof L3==='object'?L3:{},beh=[];beh.push(CXAG[A.aggro]||'');
  if(A.herd)beh.push(`Đi thành đàn chừng ${A.herd} con${A.herd>=3?', con đầu đàn cảnh giác':''}.`);if(A.pack)beh.push(`Săn theo bầy ${A.pack}+ con.`);
  if(k==='tiger'||k==='wolf')beh.push('Hoạt động mạnh lúc chiều tối và ban đêm.');else beh.push('Ban ngày kiếm ăn, đêm nằm ngủ'+(k==='deer'?' (vài con thức canh)':'')+'.');
  if(L.drink&&L.drink[k])beh.push('Ra suối uống nước lúc rạng sáng và chạng vạng: chỗ phục kích tốt.');if(A.winterSleep)beh.push('Mùa đông ngủ trong hang.');if(A.venom)beh.push('Có nọc độc: mang nước bạc hà, thuốc.');
  if(k==='monkey')beh.push('Leo cây, buổi trưa và ban đêm ở trên cao.');if(k==='crocodile')beh.push('Rình dưới nước, trưa nắng bò lên bờ phơi mình.');
  const prey=L.prey&&L.prey[k],pred=L.prey?Object.keys(L.prey).filter(p=>L.prey[p].includes(k)):[];
  if(prey)beh.push('Săn: '+prey.map(p=>ANIMALS[p]?ANIMALS[p].n.toLowerCase():p).join(', ')+'.');if(pred.length)beh.push('Kẻ săn nó: '+pred.map(p=>ANIMALS[p]?ANIMALS[p].n.toLowerCase():p).join(', ')+'.');
  if(L.det&&L.det[k])beh.push(`Phát hiện người từ ~${Math.round(L.det[k]/20)} m: ngồi rón rén, đi xuôi gió để lại gần.`);
  const wt=typeof H3WT==='object'&&H3WT[k],T=typeof TAME==='object'&&TAME[k],big=(A.hp||1)>=6;
  const tips=A.aggro==='never'?(big?'Rón rén lại gần, bắn cung hoặc ném giáo; con bị thương sẽ chạy, lần theo vết máu.':'Ném đá, bắn cung, hoặc rón rén vồ bằng tay không.'):
    dm>=20?'Rất mạnh: đi nhiều người, dùng giáo (tốt nhất giáo đồng) và cung, đánh từ xa; tránh ban đêm, đứng gần lửa.':(typeof L3==='object'&&L3.charger&&L3.charger[k])?'Thấy nó cúi đầu lấy đà thì né sang ngang rồi đâm giáo.':'Cầm giáo, đánh lúc nó thủ thế xong; đừng quay lưng chạy.';
  const regs=REG.filter(r=>A.reg&&A.reg.includes(r.id));
  const dirs=[...new Set(regs.filter(r=>!cxDisc(r.id)).map(r=>cxDir(r.x,r.z)))];const where=regs.filter(r=>cxDisc(r.id)).map(r=>`<button class="cx-tag" data-a="cxreg" data-r="${r.id}"><i>${r.ic}</i>${esc(r.n)}</button>`).join('')+dirs.map(d=>`<span class="cx-tag dim"><i>❔</i>vùng chưa biết phía ${d}</span>`).join('');
  return `<div class="cx-det"><div class="cx-facts"><div><span>❤️ Sức</span><b>${A.hp} máu${dm?` · đánh ${dm}`:''}${wt?` · ~${wt} kg`:''}</b></div><div><span>🌍 Sinh cảnh</span><b>${A.bio.map(b=>CXB[b]||b).join(', ')}</b></div></div>
    <h4>Tập tính</h4><ul class="cx-ul">${beh.filter(Boolean).map(t=>`<li>${esc(t)}</li>`).join('')}</ul><h4>Rơi ra</h4><div class="chips">${cxCost(A.drop)}${wt>=30&&ITEMS.sinew?cxChip('sinew',1):''}</div>
    <h4>Cách săn</h4><p class="small">${esc(tips)}</p>${T?`<h4>Thuần hoá</h4><p class="small">Ngồi rón rén lại gần, cho ăn ${T.food.filter(f=>ITEMS[f]).slice(0,3).map(f=>ITEMS[f].n.toLowerCase()).join(' / ')} ba lần: thành ${esc((typeof PETN==='object'&&PETN[T.to])||T.n)}.</p>`:''}
    <h4>Nơi sống</h4><div class="cx-tags">${where||'<span class="small muted">Khắp nơi có '+A.bio.map(b=>CXB[b]||b).join(', ')+'.</span>'}</div><div class="row"><button class="btn sm ghost" data-a="cxdist" data-k="a:${k}">🗺️ Xem trên bản đồ</button></div></div>`;}
/* ---------- thẻ Xây dựng (đọc BUILD lúc mở: mảnh mới thêm sau cũng hiện) ---------- */
function cxBuildHtml(){const cn={};(BCAT||[]).forEach(([c,n])=>cn[c]=n);const cats=[...new Set([...(BCAT||[]).map(c=>c[0]),...BUILD.map(b=>b.cat)])].filter(c=>BUILD.some(b=>b.cat===c));
  const kind={floor:'nền',edge:'tường/cạnh',roof:'mái',obj:'đồ đặt'};
  return `<div class="cx-search"><input id="cxbq" type="search" placeholder="🔍 Tìm công trình" value="${esc(G.cxbq||'')}" autocomplete="off"></div><p class="small muted">${BUILD.length} công trình trong ${cats.length} nhóm. Mở bảng Xây (phím B) để dựng.</p>`+
    cats.map((c,ci)=>{const L=BUILD.filter(b=>b.cat===c);return `<details class="cx-bc"${ci===0||G.cxbq?' open':''}><summary><b>${esc(cn[c]||c)}</b> <span class="small muted">${L.length}</span></summary>${L.map(b=>{const ok=typeof buildKnown==='function'&&buildKnown(b);
      const meta=[b.st?'trạm '+cxStName(b.st):'',b.need?'cần có '+((pieceDef(b.need)||{}).n||b.need):'',b.lv?Object.entries(b.lv).map(([s,v])=>(SKILL[s]||s)+' '+v).join(', '):'',b.store?'cất '+b.store+' ô':'',b.bed?'ngủ được':'',b.warm?'sưởi ấm':'',b.shelter?'che mưa':'',b.light?'thắp sáng':''].filter(Boolean).join(' · ');
      return `<div class="cx-b" data-s="${esc(cxNorm(b.n+' '+(b.d||'')+' '+(cn[c]||'')))}"><div class="cx-bh"><b>${esc(b.n)}</b><span class="small muted">${kind[b.kind]||''}${ok?' · ✓ đã mở':''}</span></div>${b.d?`<p class="small">${esc(b.d)}</p>`:''}<div class="chips">${cxCost(b.cost)}</div>${meta?`<p class="small muted">${esc(meta)}</p>`:''}</div>`;}).join('')}</details>`;}).join('')+'<p class="muted small cx-none" hidden>Không thấy công trình nào.</p>';}
/* ---------- bảng ---------- */
const CXTABS=[['reg','🗺️ Vùng đất'],['dist','📍 Phân bố'],['item','📦 Vật phẩm'],['an','🐾 Muông thú'],['bld','🏠 Xây dựng']];
function cxBody(){const t=CX.tab;try{return t==='dist'?cxDistHtml():t==='item'?cxItemHtml():t==='an'?cxAnimHtml():t==='bld'?cxBuildHtml():cxRegHtml();}catch(e){console.warn('bách khoa',e);return '<p class="warn">Không mở được mục này.</p>';}}
function cxAfter(keep){try{if(CX.tab==='reg'){if(CX.reg)cxDrawRegion();else cxDrawOverview();}else if(CX.tab==='dist')cxDrawDist();}catch(e){console.warn('bách khoa: vẽ',e);}
  const bd=$('#panel .p-body');if(!bd)return;for(const [id,key,sel] of [['cxq','cxq','.cx-ents [data-s]'],['cxiq','cxiq','.cx-items [data-s]'],['cxbq','cxbq','.cx-b[data-s]']]){const inp=bd.querySelector('#'+id);if(!inp)continue;
    const run=()=>{const q=cxNorm(inp.value).trim();let n=0;bd.querySelectorAll(sel).forEach(el=>{const ok=!q||q.split(/\s+/).every(w=>el.dataset.s.includes(w));el.style.display=ok?'':'none';if(ok)n++;});
      if(id==='cxbq')bd.querySelectorAll('.cx-bc').forEach(d=>{const any=[...d.querySelectorAll('.cx-b')].some(el=>el.style.display!=='none');d.style.display=any?'':'none';if(q&&any)d.open=true;});const no=bd.querySelector('.cx-none');if(no)no.hidden=!!n||!q;};
    inp.addEventListener('input',()=>{G[key]=inp.value;run();});inp.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')inp.blur();});inp.addEventListener('keyup',e=>e.stopPropagation());run();}
  if(!keep&&CX.tab==='an'&&G.cxAni){const el=bd.querySelector('#cxa-'+G.cxAni);if(el)el.scrollIntoView({block:'start'});}}
{const _uo=uiOpen;uiOpen=function(k,o,keep){if(k!=='cx'){const r=_uo(k,o,keep);if(G.panel==='map')try{const h=$('#panel .p-head');if(h&&!h.querySelector('.cx-hb'))h.querySelector('.p-x').insertAdjacentHTML('beforebegin','<button class="btn sm ghost cx-hb" data-a="cxopen" data-t="reg" aria-label="Bách khoa">📖 Bách khoa</button>');}catch(e){}return r;}
  if(!G.on)return;if(G.build)buildEnd();o=o||{};G.popt=o;if(!keep){CX.dc={};}G.panel='cx';const p=$('#panel');p.hidden=false;document.body.classList.add('pan');
  const sc=p.querySelector('.p-body')?p.querySelector('.p-body').scrollTop:0;
  p.innerHTML=`<div class="p-head"><h2>📖 Bách khoa</h2><button class="p-x" data-ui="close" aria-label="Đóng">✕</button></div><div class="p-body cx-body"><div class="tabs cx-tabs">${CXTABS.map(([t,n])=>`<button class="tb sm${CX.tab===t?' on':''}" data-a="cxtab" data-t="${t}">${n}</button>`).join('')}</div>${cxBody()}</div>`;
  if(keep)p.querySelector('.p-body').scrollTop=sc;if(document.pointerLockElement)document.exitPointerLock();cxAfter(keep);};}
function cxOpen(tab,o){o=o||{};CX.tab=tab||CX.tab||'reg';if(o.reg!==undefined)CX.reg=o.reg;if(o.sel)CX.sel=o.sel;if(o.ani)G.cxAni=o.ani;if(o.item)G.cxItem=o.item;uiOpen('cx',{});const bd=$('#panel .p-body');if(bd)bd.scrollTop=0;}
function cxOpenKey(k){if(!k)return;if(k.startsWith('g:'))cxOpen('reg',{reg:k.slice(2)});else if(k.startsWith('a:'))cxOpen('an',{ani:k.slice(2)});else cxOpen('dist',{sel:k});}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a^="cx"]');if(!b||!S||!G.on)return;const a=b.dataset.a,d=b.dataset;if(!/^cx[a-z]+$/.test(a))return;e.stopImmediatePropagation();e.preventDefault();sfx('pick');
  const go=()=>{if(G.panel==='cx')uiOpenRefresh();};
  switch(a){case 'cxopen':cxOpen(d.t||null,G.panel==='map'?{reg:null}:{});return;case 'cxtab':CX.tab=d.t;uiOpen('cx',{});return;case 'cxreg':cxOpen('reg',{reg:d.r});return;case 'cxback':CX.reg=null;uiOpen('cx',{});return;
    case 'cxdist':cxOpen('dist',{sel:d.k});return;case 'cxsel':{CX.sel=d.k;uiOpen('cx',{});const bd=$('#panel .p-body');if(bd)bd.scrollTop=0;return;}case 'cxcat':G.cxCat=d.c;go();return;case 'cxdv':CX.dv=d.v;go();return;
    case 'cxit':G.cxIt=d.t;go();return;case 'cxani':cxOpen('an',{ani:d.k});return;
    case 'cxitem':{if(CX.tab!=='item'||!b.classList.contains('cx-row')){G.cxItem=d.k;if(G.cxIt&&ITEMS[d.k]&&ITEMS[d.k].t!==G.cxIt)G.cxIt='';G.cxiq='';cxOpen('item');requestAnimationFrame(()=>{const el=$('#panel [data-a="cxitem"][data-k="'+d.k+'"]');if(el)el.scrollIntoView({block:'start'});});return;}
      const row=b.closest('.cx-it');if(!row)return;const old=$('#panel .cx-items .cx-det');const same=G.cxItem===d.k;if(old)old.remove();$('#panel .cx-items .cx-row.cur')&&$('#panel .cx-items .cx-row.cur').classList.remove('cur');
      if(same){G.cxItem=null;return;}G.cxItem=d.k;b.classList.add('cur');try{b.insertAdjacentHTML('afterend',cxItemDet(d.k));}catch(er){console.warn('bách khoa: vật phẩm',er);}return;}
    case 'cxmark':{const x=+d.x,z=+d.z;if(!isFinite(x)||!isFinite(z))return;S.mark={x,z};save();uiClose();uiToast('📍 Đã cắm cờ: '+(d.n||'điểm đánh dấu')+'. La bàn chỉ đường.','');return;}}},true);
/* ---------- nối vào trò chơi: Nhật ký, nhãn "đây là gì", báo "Đã ghi vào Bách khoa" ---------- */
{const _jh=journalHtml;journalHtml=function(){return `<div class="row cxjl"><button class="btn sm" data-a="cxopen" data-t="reg">📖 Bách khoa: vùng đất, phân bố, muông thú</button></div>`+_jh();};}
function cxKeyOf(lab){const M=CX.nm||(CX.nm=(()=>{const m={};for(const t in RT)if(RT[t].n&&!m[RT[t].n])m[RT[t].n]='r:'+t;for(const k in ANIMALS)if(ANIMALS[k].n0&&!m[ANIMALS[k].n])m[ANIMALS[k].n]='a:'+k;
    if(typeof H3NODE==='object')for(const k in H3NODE)if(!m[H3NODE[k].n])m[H3NODE[k].n]='n:'+k;return m;})());return M[lab]||M[String(lab).split(' · ')[0]]||null;}
{const _pl=peekLabel;peekLabel=function(x,z,rad){const L=_pl(x,z,rad);try{let k=null;if(L){if(L.tag==='gnd'){const r=regionAt(x,z);if(r&&cxDisc(r.id))k='g:'+r.id;}else if(L.tag!=='npc'&&L.tag!=='bld'&&L.tag!=='pet')k=cxKeyOf(L.lab);}G.cxPk=k;}catch(e){G.cxPk=null;}return L;};}
{const _ps=peekShow;peekShow=function(sx,sy,ms){G.cxPk=null;_ps(sx,sy,ms);try{const el=$('#peek');if(!el||el.hidden)return;const k=G.cxPk;el.classList.toggle('cxl',!!k);if(k){el.dataset.cx=k;el.textContent+=' · 📖';}else delete el.dataset.cx;
  if(!el._cx){el._cx=1;el.addEventListener('click',ev=>{if(!el.classList.contains('cxl')||!el.dataset.cx)return;ev.stopPropagation();el.hidden=true;sfx('pick');cxOpenKey(el.dataset.cx);});}}catch(e){}};}
{const _pm=peekMouse;peekMouse=function(e){if(e&&e.target&&e.target.closest&&e.target.closest('#peek.cxl'))return;return _pm(e);};}
function cxNote(names){for(const n of names)if(!CX.pend.includes(n))CX.pend.push(n);}
function cxFlush(){if(!CX.pend.length)return;if(G.t<CX.quiet||G.panel==='cx'){if(G.t<CX.quiet)CX.pend.length=0;return;}if(G.t-CX.toastT<25)return;CX.toastT=G.t;const L=CX.pend.splice(0);
  uiToast('📖 Đã ghi vào Bách khoa: '+L.slice(0,3).join(', ')+(L.length>3?` (+${L.length-3})`:''),'');}
function cxScan(){const k=cxS(),nw=[];for(const i of near(P.x,P.z,90)){const q=RES[i];if(!q||!RT[q.t]||q.t==='pathStone')continue;const key='r:'+q.t;if(!k[key]){k[key]=1;nw.push(cxRe(q.t)+' '+RT[q.t].n);}}
  for(const a of (G.animals||[])){if(!a.alive||!ANIMALS[a.kind]||!ANIMALS[a.kind].n0)continue;const key='a:'+a.kind;if(k[key])continue;if(Math.abs(a.x-P.x)>170||Math.abs(a.z-P.z)>170||Math.hypot(a.x-P.x,a.z-P.z)>170)continue;k[key]=1;nw.push((CXE_AN[a.kind]||'🐾')+' '+ANIMALS[a.kind].n);}
  if(nw.length)cxNote(nw);}
{const _et=exploreTick;exploreTick=function(){_et();if(!S||!G.on)return;if(!CX.quiet)CX.quiet=G.t+20;if(G.t-CX.scanT<2)return;CX.scanT=G.t;try{cxScan();cxFlush();}catch(e){}};}
{const _ur=uiRegion;uiRegion=function(r,first){_ur(r,first);if(first&&r)try{cxNote(['🗺️ '+r.n]);}catch(e){}};}
(function cxCss(){const s=document.createElement('style');s.textContent=`.cx-body{padding-top:10px}.cx-tabs{position:sticky;top:-12px;z-index:2;background:var(--pn2,#34251a);margin:-10px -14px 10px;padding:8px 14px}
.cx-mapw{position:relative;display:flex;justify-content:center;margin:4px 0 8px}.cx-mapw canvas{border-radius:10px;border:2px solid #7a5530;max-width:100%;touch-action:manipulation;box-shadow:inset 0 0 30px rgba(80,50,20,.4)}
.cx-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:6px}.cx-row{display:flex;align-items:center;gap:8px;width:100%;text-align:left;padding:8px 10px;border-radius:12px;border:1px solid var(--line);background:rgba(0,0,0,.22);color:var(--fg);min-height:48px}
.cx-row.sm{min-height:42px;padding:5px 8px}.cx-row.cur{border-color:var(--acc);background:rgba(242,197,90,.12)}.cx-row.dim{opacity:.72}.cx-row .ic{width:30px;height:30px}.cx-row .ic b{font-size:20px}
.cx-e{font-size:22px;width:30px;text-align:center;flex:none}.cx-rt{display:flex;flex-direction:column;min-width:0;line-height:1.3}.cx-rt b{font-size:13.5px}.cx-rt b em{font-style:normal;color:var(--acc);font-weight:600;font-size:12px}.cx-rt small{font-size:11.5px;color:var(--muted)}
.cx-dg{color:var(--c);font-weight:700;font-size:11.5px;letter-spacing:-.5px}.cx-card{border:1px solid var(--line);border-radius:14px;padding:10px 12px;margin:6px 0 10px;background:rgba(0,0,0,.2)}
.cx-card h4,.cx-det h4{margin:12px 0 5px;font:700 12.5px var(--body);color:var(--acc);text-transform:uppercase;letter-spacing:.4px}.cx-h{margin:4px 0 2px!important;font:400 17px var(--disp)!important;color:var(--acc)}
.cx-facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px;margin:8px 0}.cx-facts div{background:rgba(0,0,0,.25);border-radius:10px;padding:6px 8px;display:flex;flex-direction:column;gap:2px}.cx-facts span{font-size:11px;color:var(--muted)}.cx-facts b{font-size:12.5px;font-weight:600}
.cx-tags{display:flex;flex-wrap:wrap;gap:5px}.cx-tag{display:inline-flex;align-items:center;gap:4px;padding:4px 9px 4px 6px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:var(--fg);font-size:12.5px;min-height:30px}
.cx-tag i{font-style:normal;font-size:15px}.cx-tag em{font-style:normal;font-size:10.5px;color:var(--muted);margin-left:2px}.cx-tag.bad{border-color:rgba(255,90,60,.5)}.cx-tag.dim{opacity:.7}.cx-tag *{pointer-events:none}
.cx-rl{display:flex;gap:8px;align-items:baseline;margin:3px 0}.cx-rl>span{width:46px;flex:none}.cx-rl>div{display:flex;flex-wrap:wrap}.rl-c.cx-mid{background:rgba(255,255,255,.08);color:var(--muted)}
.cx-ul{margin:4px 0;padding-left:18px;font-size:12.5px}.cx-ul li{margin:4px 0}.cx-rum li{color:#e8d6b4;font-style:italic}.cx-act{margin-top:12px}
.cx-search{margin:2px 0 8px}.cx-search input{width:100%;min-height:42px;padding:8px 12px;border-radius:12px;border:1px solid var(--line);background:rgba(0,0,0,.35);color:var(--fg);font:15px var(--body);user-select:text;-webkit-user-select:text}
.cx-dh{display:flex;align-items:center;gap:8px}.cx-dh>div{flex:1;display:flex;flex-direction:column}.cx-dh small{font-size:11.5px}
.cx-leg{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:11px;color:var(--muted);margin:2px 0 6px}.cx-leg i{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:-2px;margin-right:4px}
.cx-leg .h{background:linear-gradient(90deg,rgba(232,72,18,.3),rgba(232,72,18,.85))}.cx-leg .d{width:5px;height:5px;background:#2a0e04;vertical-align:1px}.cx-leg .r{border:2px dashed rgba(150,34,10,.8);border-radius:50%}.cx-leg .n{border:2px solid #1a6ad8;border-radius:50%}.cx-leg .f{background:#d6c094}
.cx-near{display:flex;align-items:center;gap:8px;justify-content:space-between;background:rgba(26,106,216,.14);border:1px solid rgba(90,150,240,.4);border-radius:12px;padding:6px 8px 6px 10px;margin:6px 0}.cx-near div{display:flex;flex-direction:column}.cx-near small{font-size:11.5px;color:var(--muted)}
.cx-it{display:contents}.cx-det{grid-column:1/-1;border:1px solid var(--acc);border-radius:12px;padding:6px 10px 10px;background:rgba(242,197,90,.06)}.cx-stat{color:var(--good)}.cx-ch{border:0;color:var(--fg)}
details.cx-an>summary{display:flex;align-items:center;gap:8px;cursor:pointer;list-style:none}details.cx-an>summary::-webkit-details-marker{display:none}details.cx-an[open]>summary{margin-bottom:4px}details.cx-an .cx-det{border:0;padding:0;background:none}
.cx-bc{margin:6px 0}.cx-bc>summary{cursor:pointer;padding:8px 4px;font-size:14px}.cx-b{border:1px solid var(--line);border-radius:12px;padding:7px 10px;margin:5px 0;background:rgba(0,0,0,.2)}.cx-b p{margin:3px 0}.cx-bh{display:flex;justify-content:space-between;gap:6px;align-items:baseline}
.cx-hb{min-height:32px;padding:4px 10px;margin-left:auto;margin-right:8px}.cxjl{margin:0 0 6px}.cx-empty{text-align:center}
.peek.cxl{pointer-events:auto;cursor:pointer;border-color:#f2c55a;color:#ffe9b0}`;document.head.appendChild(s);})();
