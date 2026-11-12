/* ===================== 🤖 TỰ ĐỘNG LÀM NHIỆM VỤ (auto) =====================
   Nạp ngay sau guide.js. Không sửa tệp cũ: chỉ bọc hàm lúc nạp, và bọc NGOÀI CÙNG moveTick / worldTap lúc bootHot (khi mọi mô-đun đã nạp xong).
   • "▶ Tự làm" trên khung Mục tiêu (HUD) và trong Nhật ký cho các việc thường ngày: nhặt, chặt, ghè/chế tạo, uống nước, ăn, săn, xẻ thịt, đâm cá,
     hái thuốc, đổi đồ với làng, ngủ đêm, khám phá vùng đất… Bộ chạy tự lập kế hoạch: tìm tài nguyên gần nhất (lưới RGRID, tính lại 1,5 giây/lần),
     tìm đường A* trên lưới địa hình thô 20–60 đơn vị (chia nhỏ theo khung hình), đi tới bằng CẦN ĐIỀU KHIỂN ẢO (mọi hệ thống sẵn có: hoạt ảnh, thể lực,
     va chạm, leo vách… vẫn áp dụng; cùng tốc độ như người chơi), làm bằng actStart/craft, chế tạo đệ quy (dây thừng trước giáo…), tới bếp, nhóm lửa.
   • Việc sáng tạo (dựng nhà, đặt công trình, san nền, trang trí, tạo nhân vật, chọn đất) KHÔNG tự làm: hiện thẻ chỉ dẫn, đánh dấu chỗ đẹp,
     mở đúng mục trong Xây, và "Gom đủ vật liệu" nếu người chơi muốn. Khung đã đặt sẵn mà chưa dựng xong thì có thể tự "dựng tiếp".
   • An toàn: tự ăn/uống khi đói khát, nghỉ khi kiệt sức, băng khi chảy máu, tránh hoặc đánh trả thú (tùy chọn), tối không có đuốc thì về lều ngủ
     hoặc dừng, không bao giờ bước ra mép vực (kiểm tra độ dốc phía trước mỗi khung hình).
   • Người chơi cầm lái (cần điều khiển, phím, chạm vào thế giới, mở chế độ xây) là tạm dừng ngay. Khung trạng thái "🤖 Đang tự làm…" có nút Dừng, ⚙️.
   • "Tự động thu thập": chọn vật liệu trong Túi đồ / Bách khoa → "Đi gom".
   Lưu: S.au (tùy chọn: next, eat, fight, max) — khóa mới, bản lưu cũ vẫn chạy. Trạng thái chạy nằm trên AQ (không lưu). */
const AQ={on:false,pause:false,jobs:[],gi:-1,dir:null,run:false,path:null,msg:'',safeT:0,uiT:0,uiK:'',cache:new Map(),bl:new Map(),bad:[],feeding:false,
  menu:false,card:null,mark:null,markO:null,wT:null,lastLab:'',anyT:0,err:0,ctx:null,stopT:-99};
const AQ_RUN=0,AQ_DONE=1;
function aqCfg(){if(!S.au||typeof S.au!=='object')S.au={};const c=S.au;if(c.next==null)c.next=1;if(c.eat==null)c.eat=1;if(c.fight==null)c.fight=0;if(!c.max)c.max=2600;return c;}
const aqN=id=>(ITEMS[id]&&ITEMS[id].n)||id;
const aqD=(x,z)=>Math.hypot(x-P.x,z-P.z);
const aqFail=m=>({fail:m||'Không làm tiếp được.'});
function aqSay(m,k){if(G.t-(AQ['_s'+m]||-99)<6)return;AQ['_s'+m]=G.t;uiToast(m,k||'');}

/* ===================== 1. TÌM ĐƯỜNG: A* TRÊN LƯỚI ĐỊA HÌNH THÔ, CHIA NHỎ THEO KHUNG HÌNH ===================== */
// giá đi qua một điểm (nhân với quãng đường). Vô cực = không đi được.
function aqCost(x,z,ctx){if(!wIn(x,z,1.02))return Infinity;const wd=wdAt(x,z);let c=1;
  if(wd>9){if(!ctx||!ctx.swim)return Infinity;c=14;}else if(wd>3)c=6;else if(wd>0.6)c=2.2;
  const sl=slopeAt(x,z);if(sl>1.2)return Infinity;if(sl>0.65)c+=(sl-0.65)*8;
  if(trailAt(x,z)>0.4)c*=0.72;
  if(ctx){for(const s of ctx.col){const dx=x-s.x,dz=z-s.z;if(dx*dx+dz*dz<(s.r+8)*(s.r+8))return Infinity;}
    for(const p of ctx.pred){const dx=x-p.x,dz=z-p.z;if(dx*dx+dz*dz<170*170)c+=9;}
    for(const b of ctx.bad){const dx=x-b.x,dz=z-b.z;if(dx*dx+dz*dz<34*34)c+=16;}}
  const oc=typeof cellAt==='function'?cellAt(x,z):null;if(oc&&oc.obj){const b=BYID.get(oc.obj),d=b&&pieceDef(b.k);if(d&&!d.bed&&!d.farm&&!d.shelter)c+=3;}
  return c;}
function aqPred(){const out=[];for(const a of G.animals||[]){if(!a.alive||a.tame)continue;const D=ANIMALS[a.kind]||{};if(a.angry||(D.aggro&&D.aggro!=='never'&&D.aggro!=='defend'&&(D.dmg||0)>=9))out.push({x:a.x,z:a.z,a});}
  if(G.foes)for(const f of G.foes)if(f.alive)out.push({x:f.x,z:f.z,a:f});return out;}
function aqCtx(x0,z0,x1,z1,swim){const col=[];for(const s of (typeof SCOL!=='undefined'?SCOL:[])){if(s.x+s.r<x0||s.x-s.r>x1||s.z+s.r<z0||s.z-s.r>z1)continue;col.push(s);}
  AQ.bad=AQ.bad.filter(b=>G.t<b.t);const bk=new Set();try{BYID.forEach(b=>{if(b.x<x0-80||b.x>x1+80||b.z<z0-80||b.z>z1+80)return;const i=Math.floor(b.x/80),j=Math.floor(b.z/80);for(let u=-1;u<=1;u++)for(let v=-1;v<=1;v++)bk.add((i+u)+','+(j+v));});}catch(e){}
  return {col,pred:aqPred().filter(p=>Math.hypot(p.x-P.x,p.z-P.z)<1600),bad:AQ.bad,swim:!!swim,bk};}
// đoạn (ax,az)→(bx,bz) có cắt tường, cột, lều, chuồng (công trình đặc) không. Chỉ xét khi gần công trình (ô 80).
function aqWall(ctx,ax,az,bx,bz){if(!ctx||!ctx.bk||!ctx.bk.size||typeof solCross!=='function')return false;const L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L/40));
  for(let i=0;i<n;i++){const x0=ax+(bx-ax)*i/n,z0=az+(bz-az)*i/n,x1=ax+(bx-ax)*(i+1)/n,z1=az+(bz-az)*(i+1)/n;if(!ctx.bk.has(Math.floor(x0/80)+','+Math.floor(z0/80))&&!ctx.bk.has(Math.floor(x1/80)+','+Math.floor(z1/80)))continue;
    const py=hAt(x0,z0)+2;let rc=solRects((x0+x1)/2,(z0+z1)/2,py);/* nới chữ nhật ra 8 đơn vị: thân người */rc=rc.map(r=>[r[0]-8,r[1]-8,r[2]+8,r[3]+8]);if(solCross(x0,z0,x1,z1,py,solSegs(x0,z0,x1,z1,py),rc))return true;}return false;}
// chỉ xét TƯỜNG/VÁCH/RÀO (không xét khối đặc như lều, bàn: đích thường nằm ngay trong khối đó)
function aqSegCut(ctx,ax,az,bx,bz){try{if(!ctx||!ctx.bk||!ctx.bk.size||typeof solSegs!=='function'||Math.hypot(bx-ax,bz-az)<6)return false;const py=hAt(ax,az)+2;for(const s of solSegs(ax,az,bx,bz,py))if(solX(ax,az,bx,bz,s[0],s[1],s[2],s[3]))return true;}catch(e){}return false;}
function aqPlanStart(sx,sz,gx,gz,r,swim){const D=Math.hypot(gx-sx,gz-sz),M=Math.max(320,D*0.3);let C=Math.max(20,Math.min(60,D/110)),x0=Math.min(sx,gx)-M,z0=Math.min(sz,gz)-M;
  /* có công trình: lưới tìm đường phải khớp ô xây (40) để luồn được qua cửa, cổng rào (lối hẹp 26). Lưới thưa 60 lệch ô là không bao giờ thấy lối cửa → đâm vào tường rồi kẹt. */
  try{if(typeof BYID!=='undefined'&&BYID.size){C=C<=24?20:40;x0=Math.floor(x0/40)*40+20;z0=Math.floor(z0/40)*40+20;}}catch(e){}
  const W=Math.ceil((Math.abs(gx-sx)+2*M)/C)+1,H=Math.ceil((Math.abs(gz-sz)+2*M)/C)+1,N=W*H;
  const pl={sx,sz,gx,gz,r,C,x0,z0,W,H,g:new Float32Array(N).fill(Infinity),par:new Int32Array(N).fill(-1),cl:new Uint8Array(N),cost:new Float32Array(N).fill(-1),hh:new Float32Array(N),
    hi:[],hf:[],exp:0,ok:false,fail:false,pts:null,ctx:aqCtx(x0,z0,x0+W*C,z0+H*C,swim)};
  const si=clamp(Math.round((sx-x0)/C),0,W-1),sj=clamp(Math.round((sz-z0)/C),0,H-1),s=sj*W+si;pl.s=s;pl.g[s]=0;pl.cost[s]=1;pl.hh[s]=hAt(sx,sz);aqHPush(pl,s,0);return pl;}
function aqHPush(pl,i,f){const A=pl.hi,F=pl.hf;let k=A.length;A.push(i);F.push(f);while(k>0){const p=(k-1)>>1;if(F[p]<=f)break;A[k]=A[p];F[k]=F[p];k=p;}A[k]=i;F[k]=f;}
function aqHPop(pl){const A=pl.hi,F=pl.hf,top=A[0],li=A.pop(),lf=F.pop();if(A.length){let k=0;const n=A.length;for(;;){let c=2*k+1;if(c>=n)break;if(c+1<n&&F[c+1]<F[c])c++;if(F[c]>=lf)break;A[k]=A[c];F[k]=F[c];k=c;}A[k]=li;F[k]=lf;}return top;}
const AQ_NB=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
function aqPlanStep(pl,budget){if(pl.ok||pl.fail)return;const {W,H,C,x0,z0,gx,gz}=pl,lim=(pl.r||0)+C*0.8;
  while(budget-->0){if(!pl.hi.length){pl.fail=true;return;}const i=aqHPop(pl);if(pl.cl[i])continue;pl.cl[i]=1;pl.exp++;if(pl.exp>60000){pl.fail=true;return;}
    const ci=i%W,cj=(i/W)|0,x=x0+ci*C,z=z0+cj*C;
    if(Math.hypot(gx-x,gz-z)<=lim&&!aqSegCut(pl.ctx,x,z,gx,gz)){pl.ok=true;const pts=[];let k=i;while(k>=0){pts.push([x0+(k%W)*C,z0+((k/W)|0)*C]);k=pl.par[k];}pts.reverse();pts[0]=[pl.sx,pl.sz];pl.pts=pts;return;}
    for(const [di,dj] of AQ_NB){const ni=ci+di,nj=cj+dj;if(ni<0||nj<0||ni>=W||nj>=H)continue;const n=nj*W+ni;if(pl.cl[n])continue;const nx=x0+ni*C,nz=z0+nj*C;
      let c=pl.cost[n];if(c<0){c=aqCost(nx,nz,pl.ctx);pl.cost[n]=c;pl.hh[n]=hAt(nx,nz);}if(!isFinite(c))continue;
      const L=(di&&dj)?C*1.4142:C;if(Math.abs(pl.hh[n]-pl.hh[i])/L>0.95&&pl.exp>10)continue;// vách dốc / mép vực
      if(pl.ctx.bk.size&&aqWall(pl.ctx,x,z,nx,nz))continue;// tường, lều chắn giữa hai ô
      const g=pl.g[i]+L*(pl.cost[i]+c)*0.5;if(g<pl.g[n]){pl.g[n]=g;pl.par[n]=i;aqHPush(pl,n,g+Math.hypot(gx-nx,gz-nz)*0.75);}}}}
// đoạn thẳng có đi được không (không qua nước sâu, vách dốc, vật cản)
function aqClear(ax,az,bx,bz,ctx){const L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L/10)),st=L/n;let ph=hAt(ax,az);
  for(let i=1;i<=n;i++){const x=ax+(bx-ax)*i/n,z=az+(bz-az)*i/n,c=aqCost(x,z,ctx);if(!isFinite(c)||c>2.6)return false;const h=hAt(x,z);if(Math.abs(h-ph)/st>0.95)return false;ph=h;}if(aqWall(ctx,ax,az,bx,bz))return false;return true;}
function aqSmooth(pts,ctx){if(pts.length<3)return pts;const out=[pts[0]];let i=0;
  while(i<pts.length-1){let j=Math.min(pts.length-1,i+14);for(;j>i+1;j--)if(aqClear(pts[i][0],pts[i][1],pts[j][0],pts[j][1],ctx))break;out.push(pts[j]);i=j;}return out;}
// an toàn từng bước: hướng đi có dẫn ra mép vực / nước sâu không? Thử xoay ±35°, ±70° nếu cần.
function aqSafeDir(wx,wz){const l=Math.hypot(wx,wz)||1;wx/=l;wz/=l;const h0=hAt(P.x,P.z),swim=G.swim||wdAt(P.x,P.z)>8;
  for(const a of [0,0.6,-0.6,1.2,-1.2]){const c=Math.cos(a),s=Math.sin(a),dx=wx*c-wz*s,dz=wx*s+wz*c;let ok=true;
    for(const d of [12,24]){const x=P.x+dx*d,z=P.z+dz*d,h=hAt(x,z);if(h0-h>d*1.05&&wdAt(x,z)<4){ok=false;break;}if(h-h0>d*1.3&&!G.swim){ok=false;break;}if(!swim&&wdAt(x,z)>10&&wdAt(P.x,P.z)<6){ok=false;break;}if(!wIn(x,z,1.02)){ok=false;break;}}
    if(ok)return [dx,dz];}
  return null;}

/* ===================== 2. TÌM TÀI NGUYÊN GẦN NHẤT (theo ô RGRID, có bộ nhớ đệm) ===================== */
const AQ_SRC={};
function aqSrc(id){if(AQ_SRC[id])return AQ_SRC[id];const out=[];for(const t in RT){const D=RT[t];if(D&&D.yield&&D.yield[id]&&D.yield[id][1]>0&&!D.poison)out.push(t);}return AQ_SRC[id]=out;}
function aqBl(i,sec){AQ.bl.set(i,G.t+(sec||150));}
function aqFindRes(types,o){o=o||{};const maxR=o.max||aqCfg().max,key=types.join(',')+'|'+Math.round(P.x/60)+','+Math.round(P.z/60)+'|'+(o.k||''),C=AQ.cache.get(key);
  if(C&&G.t-C.t<1.5&&(!C.q||(C.q.st===0&&!AQ.bl.has(C.q.i))))return C.q;
  const pr=aqPred().filter(p=>Math.hypot(p.x-P.x,p.z-P.z)<maxR+300),ts=new Set(types),ci=Math.floor(P.x/RG),cj=Math.floor(P.z/RG),R=Math.ceil(maxR/RG);let best=null,bs=1e18;
  for(let ring=0;ring<=R;ring++){if(best&&(ring-1)*RG>bs)break;
    for(let i=ci-ring;i<=ci+ring;i++)for(let j=cj-ring;j<=cj+ring;j++){if(Math.max(Math.abs(i-ci),Math.abs(j-cj))!==ring)continue;const L=RGRID.get(i+','+j);if(!L)continue;
      for(const k of L){const q=RES[k];if(!q||q.st!==0||q.lock||!ts.has(q.t))continue;const bt=AQ.bl.get(k);if(bt&&G.t<bt)continue;const d=Math.hypot(q.x-P.x,q.z-P.z);if(d>maxR)continue;
        const wd=wdAt(q.x,q.z);if(wd>3.2)continue;if(pr.length&&pr.some(p=>Math.hypot(p.x-q.x,p.z-q.z)<210))continue;let sc=d*(o.w?o.w(q):1)+(wd>0.8?120:0);if(sc<bs){bs=sc;best=q;}}}}
  AQ.cache.set(key,{t:G.t,q:best});if(AQ.cache.size>60)AQ.cache.delete(AQ.cache.keys().next().value);return best;}
// nước gần nhất: điểm nước + chỗ đứng trên bờ
function aqFindWater(){const C=AQ.wC;if(C&&G.t-C.t<4&&Math.hypot(C.px-P.x,C.pz-P.z)<60)return C.w;let w=null;const maxR=aqCfg().max;
  for(const b of S.builds){if(b.prog!=null||b.k!=='well')continue;const d=aqD(b.x,b.z);if(d<maxR&&(!w||d<w.d))w={well:b,sx:b.x,sz:b.z,wx:b.x,wz:b.z,d};}
  for(let r=0;r<=maxR&&!(w&&w.d<r);r+=24){const n=Math.max(1,Math.ceil(r*6.283/26));for(let k=0;k<n;k++){const a=k/n*6.283,x=P.x+Math.cos(a)*r,z=P.z+Math.sin(a)*r,wd=wdAt(x,z);if(wd<0.5||wd>7)continue;
      let sx=x,sz=z;const ux=(P.x-x)/(r||1),uz=(P.z-z)/(r||1);for(let s=0;s<16&&wdAt(sx,sz)>0.25;s++){sx+=ux*6;sz+=uz*6;}if(wdAt(sx,sz)>0.6)continue;if(slopeAt(sx,sz)>0.9)continue;
      const d=Math.hypot(sx-P.x,sz-P.z),L=Math.hypot(x-sx,z-sz)||1;if(!w||d<w.d)w={sx,sz,wx:x,wz:z,fx:sx+(x-sx)/L*Math.min(24,L),fz:sz+(z-sz)/L*Math.min(24,L),d};}if(w&&!w.well)break;}
  AQ.wC={t:G.t,px:P.x,pz:P.z,w};return w;}
function aqStation(st){let best=null,bd=1e9;for(const b of S.builds){const d=pieceDef(b.k);if(!d||d.st!==st||b.prog!=null)continue;const dd=aqD(b.x,b.z);if(dd<bd){bd=dd;best=b;}}return best;}
function aqFire(lit){let best=null,bd=1e9;for(const b of S.builds){const d=pieceDef(b.k);if(!d||b.prog!=null||!(d.st==='campfire'||d.st==='hearth'||GD_FIRE.test(b.k)))continue;if(lit&&!fireLit(b))continue;const dd=aqD(b.x,b.z);if(dd<bd){bd=dd;best=b;}}return best;}
function aqBed(){let best=null,bd=1e9;for(const b of S.builds){const d=pieceDef(b.k);if(!d||!d.bed||b.prog!=null)continue;const dd=aqD(b.x,b.z);if(dd<bd){bd=dd;best=b;}}return best;}
function aqToolItem(kind){const m={axe:'axe',pick:'pick',dig:'digStick',fire:'fireDrill'};if(m[kind])return m[kind];const r=RECIPES.find(r=>{const o=Object.keys(r.out)[0];return ITEMS[o]&&ITEMS[o].tool===kind;});return r?Object.keys(r.out)[0]:null;}
function aqRecipe(id){const L=RECIPES.filter(r=>r.out&&r.out[id]&&r.id!=='stoneBoil'||(id==='water'&&r.id==='stoneBoil'));if(!L.length)return null;
  const sc=r=>(lvOk(r.lv)?0:100)+(r.age&&(S.age||0)<r.age?100:0)+(r.st&&!aqStation(r.st)?40:0)+(r.tool&&!invCount(r.tool)?5:0)+Object.values(r.in||{}).reduce((a,v)=>a+v,0)*0.1+Object.keys(r.in||{}).reduce((a,k)=>a+(haveCount(k)>=r.in[k]?0:/^(meat|hide|bone|sinew|fish|birdRaw|feather|horn|fat)$/.test(k)?30:0),0);/* đồ từ thú mà chưa có sẵn: né, kẻo đi săn chỉ để làm sợi dây */
  return L.slice().sort((a,b)=>sc(a)-sc(b))[0];}
function aqFood(rawOk){let best=null,bv=0;for(const s of S.inv){if(!s)continue;const I=ITEMS[s.id];if(!I||I.t!=='food'||I.poison||s.id==='meatRot')continue;if(I.raw&&!rawOk)continue;const v=(I.food||0)*(I.raw?0.3:1)+(I.hp||0);if(v>bv){bv=v;best=s.id;}}return best;}
const AQ_FOODSRC=()=>['berry','banana','mushroom','fernShoot','lotusSeed','honey'].filter(k=>ITEMS[k]);
const aqBusy=()=>!!(G.work||G.act||G.h3aim);
function aqSel(kind){try{if(kind)selectTool(kind);}catch(e){}}
function aqFace(x,z){if(!isFP())P.ry=Math.atan2(x-P.x,z-P.z);}

/* ===================== 3. VIỆC (mỗi việc là một bước máy trạng thái; việc con xếp chồng) ===================== */
function aqPush(j,parent){j.depth=(parent&&parent.depth||0)+1;if(j.depth>16){if(parent)parent.cf='Chuỗi việc quá sâu.';return;}AQ.jobs.push(j);}
function aqGoto(parent,x,z,r,lab,o){aqPush(Object.assign({k:'goto',x,z,r,lab:lab||parent.lab},o||{}),parent);return AQ_RUN;}
function aqInit(j){if(j.miss==null)j.miss=0;if(j.tries==null)j.tries=0;if(j.n_==null)j.n_=0;if(j.fl==null)j.fl=0;}
const AUJ={
  goal(j){const g=GOALS[j.gi];if(!g)return AQ_DONE;const [v,n]=goalProg(g);if(v>=n)return AQ_DONE;
    if(j.cf)return aqFail(j.cf);
    const sp=aqSpec(j.gi);if(!sp)return aqFail('Mục này không tự làm được.');const pl=sp.plan();if(!pl)return aqFail('Chưa biết cách tự làm mục này lúc này.');
    if(pl.guide){aqGuide(j.gi,pl.guide,pl.why);return {fail:null,quiet:1};}if(pl.fail)return aqFail(pl.fail);if(pl.wait){j.lab=pl.wait;AQ.msg=pl.wait;return AQ_RUN;}
    if(j.v!==v){j.v=v;j.stall=0;}else if(++j.stall>14)return aqFail('Không tiến triển được: '+g.t+'. Thử tự làm nhé.');
    AQ.msg='';aqPush(pl,j);return AQ_RUN;},
  get(j){const have=haveCount(j.id);if(have>=j.n)return AQ_DONE;if(j.cf)return aqFail(j.cf);
    if(++j.tries>30)return aqFail('Không kiếm đủ '+aqN(j.id)+'.');
    if(/^(meat|hide|bone|sinew)$/.test(j.id)){aqPush({k:'butcher',lab:'Kiếm '+aqN(j.id).toLowerCase()},j);return AQ_RUN;}
    if(j.id==='fish'){aqPush({k:'fish',until:()=>haveCount('fish')>=j.n},j);return AQ_RUN;}
    if(j.id==='waterDirty'){if(!invCount('flask')&&!invCount('waterDirty')){aqPush({k:'get',id:'flask',n:1,tries:0},j);return AQ_RUN;}aqPush({k:'drink',fill:1},j);return AQ_RUN;}
    const src=aqSrc(j.id);if(src.length){aqPush({k:'harvest',id:j.id,until:()=>haveCount(j.id)>=j.n,lab:'Kiếm '+aqN(j.id).toLowerCase()+' ('+Math.min(haveCount(j.id),j.n)+'/'+j.n+')'},j);return AQ_RUN;}
    const r=aqRecipe(j.id);if(r){aqPush({k:'craft',r,until:()=>haveCount(j.id)>=j.n},j);return AQ_RUN;}
    return aqFail('Không biết cách tự kiếm '+aqN(j.id)+'.');},
  getAll(j){if(j.cf)return aqFail(j.cf);for(const k in j.cost){if(haveCount(k)<j.cost[k]){aqPush({k:'get',id:k,n:j.cost[k],tries:0},j);return AQ_RUN;}}return AQ_DONE;},
  harvest(j){if(j.until())return AQ_DONE;
    if(j.cf){const m=j.cf;j.cf=null;if(j.q)aqBl(j.q.i);j.q=null;j.st=null;if(++j.miss>6)return aqFail(m||'Không tới được chỗ có '+aqN(j.id).toLowerCase()+'.');}
    const prog=()=>j.prog?j.prog():gC('get:'+j.id);
    if(j.st==='wait'){if(aqBusy()){if(G.t-j.t0>45){G.act=null;if(G.work)workStop('');}return AQ_RUN;}j.st=null;const got=prog();if(got<=j.g0&&j.q&&j.q.st===0){aqBl(j.q.i,60);if(++j.miss>8)return aqFail('Hái mãi không được '+aqN(j.id).toLowerCase()+'.');}j.q=null;if(j.until())return AQ_DONE;}
    if(ITEMS[j.id]&&!invFits(j.id,1))return aqFail('Túi đầy! Cất bớt đồ rồi bấm Tự làm lại.');
    const all=j.types||aqSrc(j.id),ok=all.filter(t=>!RT[t].tool||hasTool(RT[t].tool)),
      w=q=>{const D=RT[q.t],y=D.yield[j.id]||Object.values(D.yield)[0]||[1,1];const E=(y[0]+y[1])/2*(y[0]>0?1:0.5);return (1+0.15*(D.hp||1))/Math.max(0.2,E)*1.5;};
    let q=j.q&&j.q.st===0?j.q:(ok.length?aqFindRes(ok,{w,k:j.id,max:j.far?7000:0}):null);
    const yk=t=>RT[t].yield[j.id]||[1,1],need0=all.map(t=>RT[t].tool).find(k=>k&&!hasTool(k));
    if(!j.tool&&need0&&!ok.some(t=>!RT[t].tool&&yk(t)[0]>0)){const ti=aqToolItem(need0),r=ti&&aqRecipe(ti);if(r&&lvOk(r.lv)&&!(r.st&&!aqStation(r.st))){j.tool=1;aqPush({k:'get',id:ti,n:1,tries:0},j);return AQ_RUN;}}// tay không chỉ nhặt hên xui: làm công cụ trước
    if(!q){const need=all.map(t=>RT[t].tool).find(k=>k&&!hasTool(k));const ti=need&&aqToolItem(need);if(ti&&!j.tool){j.tool=1;aqPush({k:'get',id:ti,n:1,tries:0},j);return AQ_RUN;}
      return aqFail('Không thấy '+(j.nm||aqN(j.id).toLowerCase())+' trong vòng '+cxM(j.far?7000:aqCfg().max)+'. Thử đi chỗ khác, hoặc tăng "tầm xa" trong ⚙️.');}
    j.q=q;const D=RT[q.t],rr=(D.r||4)*q.s*0.7,d=aqD(q.x,q.z)-rr;j.lab=j.lab0||((D.tool==='axe'?'Chặt ':D.tool==='pick'?'Đập ':'Nhặt ')+D.n.toLowerCase());
    if(d>REACH*0.8){return aqGoto(j,q.x,q.z,rr+REACH*0.7,j.lab,{far:j.far});}
    const ng=needGate(!!D.tool);if(ng){j.ngT=(j.ngT||0)+1;if(j.ngT>400)return aqFail(ng);return AQ_RUN;}
    if(D.tool)aqSel(D.tool);else if(P.toolId==='digStick'&&D.uproot){const i=S.inv.findIndex((s,i)=>i<HOTN&&(!s||!ITEMS[s.id]||ITEMS[s.id].t!=='tool'));if(i>=0){S.sel=i;equip(null);uiHotbar();}}
    aqFace(q.x,q.z);j.g0=prog();actStart({type:'res',q,d:Math.max(0,d)});
    if(!aqBusy()){if(++j.miss>8)return aqFail('Không làm được ở '+D.n.toLowerCase()+'.');aqBl(q.i,40);j.q=null;return AQ_RUN;}
    j.st='wait';j.t0=G.t;return AQ_RUN;},
  craft(j){const r=j.r,out=Object.keys(r.out)[0],nm=aqN(out);if(j.cf)return aqFail(j.cf);j.lab='Làm '+nm.toLowerCase();
    if(j.st==='wait'){if(G.work)return AQ_RUN;j.st=null;if(haveCount(out)>j.c0){if(!j.until)return AQ_DONE;}else if(++j.fl>2)return aqFail('Không làm được '+nm+(recipeBlock(r)?': '+recipeBlock(r):'.'));}
    if(j.until&&j.until())return AQ_DONE;
    if(!lvOk(r.lv))return aqFail('Cần '+lvText(r.lv)+' mới làm được '+nm+'. Làm thêm đồ khác cho lên tay nghề.');
    if(r.age&&(S.age||0)<r.age)return aqFail(nm+' chưa có ở thời đại này.');
    for(const k in r.in){if(haveCount(k)<r.in[k]){aqPush({k:'get',id:k,n:r.in[k],tries:0},j);return AQ_RUN;}}
    if(r.tool&&invCount(r.tool)<1){aqPush({k:'get',id:r.tool,n:1,tries:0},j);return AQ_RUN;}
    if(r.st){const b=aqStation(r.st);if(!b)return {fail:'Cần dựng '+(ST_N[r.st]||r.st)+' trước (việc xây để bạn tự làm).',guide:r.st};
      if(aqD(b.x,b.z)>95)return aqGoto(j,b.x,b.z,70,'Tới '+(ST_N[r.st]||pieceDef(b.k).n).toLowerCase());
      if(pieceDef(b.k).fuel&&!fireLit(b)){aqPush({k:'light',b},j);return AQ_RUN;}}
    const bl=recipeBlock(r);if(bl)return aqFail(bl);if(!invFits(out,r.out[out]))return aqFail('Túi đầy.');
    const ng=needGate(true);if(ng)return AQ_RUN;
    j.c0=haveCount(out);j.fl=j.fl||0;craft(r,1);if(!G.work){if(haveCount(out)>j.c0)return j.until?AQ_RUN:AQ_DONE;return aqFail('Không làm được '+nm+'.');}j.st='wait';return AQ_RUN;},
  goto(j){const d=aqD(j.x,j.z);if(d<=j.r){AQ.path=null;return AQ_DONE;}
    if(!j.far&&d>aqCfg().max*2.4)return aqFail('Xa quá (vượt tầm xa đã đặt).');
    if(M3&&(M3.st==='climb'||M3.st==='hang')){/* tự làm mà lỡ bám vào vách/mép đá: tự buông hoặc đu lên rồi đi tiếp, không bỏ nhiệm vụ */AQ.bad.push({x:P.x,z:P.z,t:G.t+90});try{if(P.y-hAt(P.x,P.z)>=80&&M3.st==='hang'&&typeof m3hangUp==='function')m3hangUp();if((M3.st==='climb'||M3.st==='hang')&&typeof m3drop==='function')m3drop();}catch(e){}if(M3.st==='climb'||M3.st==='hang')return aqFail('Đang bám vách: bạn tự leo xuống nhé.');}
    if(!j.pts){if(!j.pl){j.pl=aqPlanStart(P.x,P.z,j.x,j.z,j.r,j.swim);}aqPlanStep(j.pl,650);
      if(j.pl.fail){j.pl=null;if(!j.swim){j.swim=1;return AQ_RUN;}return aqFail('Không tìm được đường tới đó (nước sâu, vách đá).');}
      if(!j.pl.ok)return AQ_RUN;j.pts=aqSmooth(j.pl.pts,j.pl.ctx);j.ctx=j.pl.ctx;j.pl=null;j.wi=1;j.lp=[P.x,P.z];j.lt=G.t;j.best=d;AQ.path=j.pts.concat([[j.x,j.z]]);}
    // bám theo đường
    const pts=j.pts;let tx=j.x,tz=j.z;
    if(!(d<80&&aqClear(P.x,P.z,j.x,j.z,j.ctx))){while(j.wi<pts.length-1&&aqD(pts[j.wi][0],pts[j.wi][1])<16)j.wi++;
      if(G.t-(j.lsT||0)>0.4&&j.wi<pts.length-1){j.lsT=G.t;if(aqClear(P.x,P.z,pts[j.wi+1][0],pts[j.wi+1][1],j.ctx))j.wi++;}
      const w=pts[Math.min(j.wi,pts.length-1)];tx=w[0];tz=w[1];if(j.wi>=pts.length-1&&aqD(tx,tz)<16){tx=j.x;tz=j.z;}}
    AQ.dir=[tx-P.x,tz-P.z];AQ.path&&(AQ.path[0]=[P.x,P.z]);
    /* NÉ TẠI CHỖ: dò trước mặt 12 đơn vị bằng chính bộ va chạm; bị cây to, đá, tường, lều, thú chặn thì lách sang bên (ưu tiên bên vừa lách) trong 0,7 giây rồi dò lại */
    try{if(!P.air&&!G.swim&&!aqBusy()){if(j.av&&G.t<j.avU)AQ.dir=j.av;else if(G.t-(j.avT||0)>0.12){j.avT=G.t;j.av=null;const l=Math.hypot(tx-P.x,tz-P.z)||1,ux=(tx-P.x)/l,uz=(tz-P.z)/l,
          probe=(dx,dz)=>{const c=collide(P.x+dx*12,P.z+dz*12);return (c[0]-P.x)*dx+(c[1]-P.z)*dz;};
        if(l>14&&probe(ux,uz)<6){const sg=j.avS||1;for(const a of [0.7*sg,-0.7*sg,1.25*sg,-1.25*sg,1.75*sg,-1.75*sg,2.3*sg,-2.3*sg]){const c=Math.cos(a),sn=Math.sin(a),rx=ux*c-uz*sn,rz=ux*sn+uz*c;
            if(probe(rx,rz)>8){const sd=aqSafeDir(rx,rz);if(!sd)continue;j.av=[rx,rz];j.avU=G.t+0.7;j.avS=a>0?1:-1;AQ.dir=j.av;break;}}}}}}catch(e){}
    if(G.t-j.lt>2){const mv=Math.hypot(P.x-j.lp[0],P.z-j.lp[1]);j.lp=[P.x,P.z];j.lt=G.t;
      if(mv<14&&!aqBusy()){j.stuck=(j.stuck||0)+1;AQ.bad.push({x:P.x+Math.sin(P.ry)*20,z:P.z+Math.cos(P.ry)*20,t:G.t+60});
        if(j.stuck>=7)return aqFail('Bị kẹt, không đi tiếp được.');if(j.stuck===2||j.stuck===5)G.jumpReq=1;if(j.stuck>=3){/* lùi ra rồi đổi bên né */j.avS=-(j.avS||1);const bx=-Math.sin(P.ry),bz=-Math.cos(P.ry),sd=aqSafeDir(bx+(j.avS)*bz*0.6,bz-(j.avS)*bx*0.6);if(sd){j.av=sd;j.avU=G.t+1.1;}}j.pts=null;AQ.path=null;}else if(d<j.best-10){j.best=d;j.stuck=0;}}
    return AQ_RUN;},
  drink(j){if(j.cf)return aqFail(j.cf);if(j.st==='wait'){if(G.t-j.t0<1.2)return AQ_RUN;j.st=null;if(!j.urgent||S.p.water>=60||++j.n_>3)return AQ_DONE;}
    if(!j.goal&&!j.fill){const b=['water','tea','mintwater'].find(k=>invCount(k)>0&&ITEMS[k]&&ITEMS[k].t==='drink');if(b){eat(b);j.st='wait';j.t0=G.t;return AQ_RUN;}}
    const w=aqFindWater();if(!w)return aqFail('Không thấy suối, hồ nào gần đây.');j.lab=j.goal?'Ra suối uống nước':'Đi uống nước';
    if(aqD(w.sx,w.sz)>(w.well?30:12))return aqGoto(j,w.sx,w.sz,w.well?26:10,j.lab);
    aqFace(w.fx||w.wx,w.fz||w.wz);if(w.well)drinkWater(true);else drinkWater(false);j.st='wait';j.t0=G.t;return AQ_RUN;},
  eat(j){if(j.cf)return aqFail(j.cf);if(j.st==='wait'){if(G.t-j.t0<1)return AQ_RUN;j.st=null;if(!j.urgent||S.p.food>=45||!aqFood(S.p.food<12))return AQ_DONE;}
    const f=aqFood(S.p.food<12);if(f&&(S.p.food<97||ITEMS[f].hp&&S.p.hp<100)){eat(f);j.st='wait';j.t0=G.t;return AQ_RUN;}
    if(f)return AQ_DONE;const raw=['meat','fish','birdRaw','yam'].find(k=>invCount(k)>0);
    if(raw&&aqFire()){const r=RECIPES.find(r=>r.in&&r.in[raw]&&Object.keys(r.in).length===1&&(r.st==='campfire'));if(r){aqPush({k:'craft',r},j);return AQ_RUN;}}
    if(++j.tries>3)return aqFail('Không kiếm được gì ăn.');
    const ids=AQ_FOODSRC(),types=[...new Set(ids.flatMap(aqSrc))];const q=aqFindRes(types.filter(t=>!RT[t].tool||hasTool(RT[t].tool)),{k:'food'});if(!q)return aqFail('Không thấy quả, nấm, chuối nào gần đây.');
    const id=Object.keys(RT[q.t].yield).find(k=>ids.includes(k))||ids[0];aqPush({k:'harvest',id,until:()=>!!aqFood(false),lab0:'Hái '+RT[q.t].n.toLowerCase()+' để ăn'},j);return AQ_RUN;},
  light(j){const b=j.b;if(!BYID.has(b.id))return aqFail('Bếp không còn.');if(fireLit(b)&&!j.force)return AQ_DONE;if(j.cf)return aqFail(j.cf);j.lab='Nhóm lửa';
    if(j.st==='wait'){if(G.work)return AQ_RUN;j.st=null;if(fireLit(b))return AQ_DONE;if(++j.fl>2)return aqFail('Không nhóm được lửa.');}
    if(fireLit(b)){if(j.force&&gC('cnt:fire')<1)return {wait:1};return AQ_DONE;}
    if(!hasTool('fire')){aqPush({k:'get',id:'fireDrill',n:1,tries:0},j);return AQ_RUN;}
    if(invCount('wood')<1&&invCount('stick')<2){aqPush({k:'get',id:'stick',n:2,tries:0},j);return AQ_RUN;}
    if(typeof isRaining==='function'&&isRaining()&&!fireSheltered(b.x,b.z))return aqFail('Trời mưa: bếp này không có mái che, không nhóm được.');
    if(aqD(b.x,b.z)>40)return aqGoto(j,b.x,b.z,32,'Tới bếp lửa');
    const ng=needGate(true);if(ng)return AQ_RUN;aqFace(b.x,b.z);fireStart(b);if(!G.work)return aqFail('Không nhóm được lửa.');j.st='wait';j.fl=j.fl||0;return AQ_RUN;},
  sleep(j){if(j.st==='zz'){if(G.sleeping)return AQ_RUN;return AQ_DONE;}if(j.cf)return aqFail(j.cf);const b=aqBed();if(!b)return {fail:'Chưa có chỗ ngủ: dựng lều nghiêng trước.',guide:'leanto'};
    j.lab='Về lều ngủ';if(aqD(b.x,b.z)>34)return aqGoto(j,b.x,b.z,26,j.lab);
    /* (ngủ giờ nào cũng được: không chờ trời tối nữa) */
    const def=pieceDef(b.k);actStart({type:'build',b,def,d:6});j.st='zz';j.t0=G.t;return AQ_RUN;},
  explore(j){if(j.cf)return aqFail(j.cf);const R=j.reg;if(R&&S.disc&&S.disc[R.id])return AQ_DONE;
    if(!R){let best=null,bd=1e9;for(const r of REG){if(S.disc&&S.disc[r.id])continue;if(j.skip&&j.skip.has(r.id))continue;const d=aqD(r.x,r.z);if(d<bd){bd=d;best=r;}}if(!best)return aqFail('Đã khám phá hết các vùng.');j.reg=best;}
    j.lab='Khám phá '+j.reg.n;if(aqD(j.reg.x,j.reg.z)<Math.min(j.reg.r*0.5,260)){exploreTick&&exploreTick();if(S.disc&&S.disc[j.reg.id])return AQ_DONE;}
    return aqGoto(j,j.reg.x,j.reg.z,Math.min(j.reg.r*0.45,240),j.lab,{far:1});},
  trade(j){if(j.cf)return aqFail(j.cf);if(j.st==='done')return AQ_DONE;const L=(G.npcs||[]).filter(n=>n.o&&n.o.visible);if(!L.length){if(G.vfire)return aqGoto(j,G.vfire.x,G.vfire.z,120,'Tới làng bên',{far:1});return aqFail('Chưa thấy làng nào.');}
    let n=null,bd=1e9;for(const q of L){const d=aqD(q.x,q.z);if(d<bd){bd=d;n=q;}}const T=TRADES[n.def.role]||[];
    let i=T.findIndex(t=>canPay(t[0]));if(i<0){const ez=T.findIndex(t=>Object.keys(t[0]).every(k=>aqSrc(k).length&&aqSrc(k).some(s=>!RT[s].tool||hasTool(RT[s].tool))));if(ez<0)return aqFail('Không có món nào đủ để đổi.');aqPush({k:'getAll',cost:T[ez][0],lab:'Gom đồ đem đổi'},j);return AQ_RUN;}
    j.lab='Đổi đồ với '+n.def.n;if(bd>REACH+6)return aqGoto(j,n.x,n.z,REACH,j.lab,{far:1});G.npcCur=n;const c0=gC('cnt:trade');npcAction('trade',i);if(gC('cnt:trade')>c0){uiToast('🤝 Đổi xong với '+n.def.n+'.','good');j.st='done';return AQ_RUN;}return aqFail('Không đổi được.');},
  hunt(j){if(j.cf){const m=j.cf;j.cf=null;if(j.a)j.skip.add(j.a);j.a=null;if(++j.miss>4)return aqFail(m);}if(j.until())return AQ_DONE;j.skip=j.skip||new Set();
    if(j.st==='wait'){if(aqBusy()&&G.t-j.t0<20)return AQ_RUN;j.st=null;}
    const ok=a=>a.alive&&!a.tame&&!j.skip.has(a)&&ANIMALS[a.kind]&&(ANIMALS[a.kind].aggro==='never'||a._h3down)&&!(S.pets||[]).includes(a);
    if(!j.a||!ok(j.a)){let best=null,bd=aqCfg().max;for(const a of G.animals||[]){if(!ok(a))continue;const d=aqD(a.x,a.z);if(d<bd){bd=d;best=a;}}if(!best){if(++j.miss>4)return aqFail('Không thấy con mồi hiền nào gần đây.');return {wait:'Tìm con mồi…'};}j.a=best;j.at=G.t;}
    const a=j.a,d=aqD(a.x,a.z)-a.r;j.lab='Săn '+a.n.toLowerCase();if(G.t-j.at>70){j.skip.add(a);j.a=null;if(++j.miss>4)return aqFail('Thú chạy mất cả. Săn bắn cần khéo tay: thử tự ngắm ném giáo nhé.');return AQ_RUN;}
    if(j.throw&&hasTool('spear')&&d<110&&d>30&&!a._h3down){aqSel('spear');aqFace(a.x,a.z);if(!G.h3aim){if(typeof h3aimStart==='function'&&h3aimStart()){j.aimT=G.t;}}else if(G.t-(j.aimT||0)>0.55){G.h3aim.yaw=Math.atan2(a.x-P.x,a.z-P.z);h3release();j.st='wait';j.t0=G.t;}return AQ_RUN;}
    if(d<=REACH+4){aqFace(a.x,a.z);if(a._h3down&&typeof h3finishStart==='function')h3finishStart(a);else actStart({type:'animal',a,d});j.st='wait';j.t0=G.t;return AQ_RUN;}
    if(d<260){AQ.dir=[a.x-P.x,a.z-P.z];return AQ_RUN;}
    return aqGoto(j,a.x,a.z,200,j.lab);},
  butcher(j){if(j.cf)return aqFail(j.cf);if(j.st==='wait'){if(G.work)return AQ_RUN;j.st=null;if(gC('cnt:butcher')+gC('cnt:scavenge')>j.c0)return AQ_DONE;}
    if(G.h3carry){const f=aqFire();if(!f)return aqFail('Đang vác xác thú: cần bếp lửa hoặc dao để xẻ.');if(aqD(f.x,f.z)>120)return aqGoto(j,f.x,f.z,90,'Vác về bếp');j.c0=gC('cnt:butcher')+gC('cnt:scavenge');actStart(findTarget());j.st='wait';return AQ_RUN;}
    let best=null,bd=aqCfg().max;for(const a of G.animals||[]){if(a.alive||!a._carc)continue;const d=aqD(a.x,a.z);if(d<bd){bd=d;best=a;}}
    if(!best){if(j.hunted)return aqFail('Không có xác thú để xẻ.');j.hunted=1;aqPush({k:'hunt',until:()=>(G.animals||[]).some(a=>!a.alive&&a._carc&&aqD(a.x,a.z)<600)},j);return AQ_RUN;}
    j.lab='Xẻ thịt '+best.n.toLowerCase();if(aqD(best.x,best.z)-best.r>REACH*0.7)return aqGoto(j,best.x,best.z,best.r+REACH*0.6,j.lab);
    j.c0=gC('cnt:butcher')+gC('cnt:scavenge');aqFace(best.x,best.z);actStart({type:'carcass',a:best,d:4});j.st='wait';return AQ_RUN;},
  cook(j){if(j.cf)return aqFail(j.cf);if(j.until())return AQ_DONE;const raw=['meat','fish','birdRaw','yam','snail','taro'].find(k=>invCount(k)>=(k==='snail'?3:1));
    if(!raw){aqPush(hasTool('spear')?{k:'fish',until:()=>invCount('fish')>0}:{k:'get',id:'meat',n:1,tries:0},j);return AQ_RUN;}
    const r=RECIPES.find(r=>r.in&&r.in[raw]&&Object.keys(r.in).length===1&&r.st==='campfire'&&lvOk(r.lv));if(!r)return aqFail('Không biết nướng '+aqN(raw)+'.');aqPush({k:'craft',r},j);return AQ_RUN;},
  fish(j){if(j.cf)return aqFail(j.cf);if(j.until())return AQ_DONE;if(j.st==='wait'){if(G.act)return AQ_RUN;j.st=null;}
    if(!hasTool('spear')){aqPush({k:'get',id:'spear',n:1,tries:0},j);return AQ_RUN;}if(++j.n_>14)return aqFail('Cá lặn mất cả. Thử chỗ nước khác nhé.');
    const w=aqFindWater();if(!w||w.well)return aqFail('Không thấy suối, hồ nào gần đây.');j.lab='Đâm cá';if(aqD(w.sx,w.sz)>12)return aqGoto(j,w.sx,w.sz,10,j.lab);
    aqSel('spear');aqFace(w.fx,w.fz);actStart({type:'water',x:w.fx,z:w.fz});j.st='wait';return AQ_RUN;},
  site(j){const b=j.b;if(!BYID.has(b.id)||b.prog==null)return AQ_DONE;if(j.cf)return aqFail(j.cf);const def=pieceDef(b.k);j.lab='Dựng tiếp '+def.n.toLowerCase();
    if(j.st==='wait'){if(G.act)return AQ_RUN;j.st=null;if((b.prog||0)<=j.p0+1e-4){if(++j.fl>2){let m='';try{if(typeof STG!=='undefined'&&STG[b.k]){const s=b3stg(b);m=s.paid<=s.i?b3miss(s.s):'';}}catch(e){}return aqFail('Công đoạn bị chặn'+(m?': '+m:': thiếu vật liệu hoặc công cụ.'));}}else j.fl=0;}
    if(aqD(b.x,b.z)>REACH+16)return aqGoto(j,b.x,b.z,REACH+8,j.lab);const ng=needGate(true);if(ng)return AQ_RUN;
    j.p0=b.prog||0;j.fl=j.fl||0;aqFace(b.x,b.z);actStart({type:'build',b,def,d:4});j.st='wait';return AQ_RUN;},
  crop(j){if(j.cf)return aqFail(j.cf);if(j.st==='wait'){if(G.work||G.act)return AQ_RUN;j.st=null;}
    const b=S.builds.find(b=>b.prog==null&&S.crops[b.id]&&cropStage(S.crops[b.id])>=3);if(!b)return AQ_DONE;j.lab='Thu hoạch';if(aqD(b.x,b.z)>REACH+10)return aqGoto(j,b.x,b.z,REACH+4,j.lab);
    aqFace(b.x,b.z);actStart({type:'build',b,def:pieceDef(b.k),d:4});j.st='wait';return AQ_RUN;},
  sharpen(j){if(j.cf)return aqFail(j.cf);if(j.st==='wait'){if(G.work)return AQ_RUN;return AQ_DONE;}
    const i=S.inv.findIndex(s=>s&&typeof L4DUR!=='undefined'&&L4DUR[s.id]&&(s.d??100)<100&&(s.d??100)>0);if(i<0)return aqFail('Chưa có công cụ nào cùn để mài.');
    if(invCount('stone')<1&&invCount('sand')<1){aqPush({k:'get',id:'stone',n:1,tries:0},j);return AQ_RUN;}j.lab='Mài lưỡi '+aqN(S.inv[i].id).toLowerCase();l4ToolFix(i,'sharp');if(!G.work)return aqFail('Không mài được.');j.st='wait';return AQ_RUN;},
  story(j){if(j.cf)return aqFail(j.cf);if(j.st==='wait'){if(G.work)return AQ_RUN;return AQ_DONE;}const f=aqFire();if(!f)return {fail:'Cần bếp lửa.',guide:'campfire'};
    if(!fireLit(f)){aqPush({k:'light',b:f},j);return AQ_RUN;}j.lab='Kể chuyện bên bếp';if(aqD(f.x,f.z)>70)return aqGoto(j,f.x,f.z,50,j.lab);
    l4Story();if(!G.work)return aqFail('Chưa kể chuyện được.');j.st='wait';return AQ_RUN;},
  rest(j){j.lab='Nghỉ lấy sức';if(S.p.stam>=(j.to||40)||G.t-j.t0>40){if(G.sit)sitToggle(false);return AQ_DONE;}if(!G.sit&&!G.swim&&!P.air)sitToggle(true);return AQ_RUN;},
  treat(j){if(j.st==='wait'){if(G.work)return AQ_RUN;return AQ_DONE;}j.lab='Băng vết thương';if(!S.st.bleed||invCount('bandage')<1)return AQ_DONE;l4Treat('band');j.st='wait';if(!G.work)return AQ_DONE;return AQ_RUN;},
  flee(j){const a=j.a;j.lab='Tránh '+((a&&a.n)||'thú dữ').toLowerCase();if(!a||!a.alive||G.t-j.t0>6||aqD(a.x,a.z)>380)return AQ_DONE;
    const sd=aqSafeDir(P.x-a.x,P.z-a.z);AQ.dir=sd;AQ.run=S.p.stam>6;return AQ_RUN;},
  fight(j){const a=j.a;j.lab='Đánh trả '+((a&&a.n)||'').toLowerCase();if(!a||!a.alive||G.t-j.t0>20)return AQ_DONE;if(G.act)return AQ_RUN;
    const d=aqD(a.x,a.z)-(a.r||8);if(d<=REACH+4){aqFace(a.x,a.z);actStart({type:G.foes&&G.foes.includes(a)?'foe':'animal',a,d});return AQ_RUN;}if(d<300){AQ.dir=aqSafeDir(a.x-P.x,a.z-P.z);return AQ_RUN;}return AQ_DONE;},
  wait(j){j.lab=j.msg||'Chờ…';if(j.until&&j.until())return AQ_DONE;if(G.t-j.t0>(j.max||30))return AQ_DONE;return AQ_RUN;}
};
/* ---------- bảng mục tiêu: việc thường ngày → kế hoạch; việc sáng tạo → chỉ dẫn ---------- */
const aqCraftJob=id=>{const r=aqRecipe(id);return r?{k:'craft',r,until:()=>gC('craft:'+id)>0}:null;};
const aqSiteOr=(re,piece)=>()=>{const b=S.builds.find(b=>b.prog!=null&&(typeof re==='string'?b.k===re:re.test(b.k)));return b?{k:'site',b}:{guide:piece};};
const aqAnyCraft=ids=>()=>{for(const id of ids){const r=aqRecipe(id);if(r&&lvOk(r.lv)&&!(r.age&&(S.age||0)<r.age)&&(!r.st||aqStation(r.st)))return {k:'craft',r,until:()=>ids.some(k=>gC('craft:'+k)>0)};}return {fail:'Chưa đủ điều kiện làm món nào trong số này.'};};
const AUG={
  'Nhặt cành, đá và sợi cỏ':()=>{for(const [k,n] of [['stick',8],['stone',4],['fiber',8]])if(gC('get:'+k)<n)return {k:'harvest',id:k,until:()=>gC('get:'+k)>=n};return null;},
  'Uống nước suối':()=>({k:'drink',goal:1}),
  'Ghè một chiếc rìu đá':()=>aqCraftJob('axe'),
  'Kiếm 3 khúc gỗ':()=>({k:'harvest',id:'wood',until:()=>gC('get:wood')>=3}),
  'Dựng lều nghiêng':aqSiteOr('leanto','leanto'),
  'Làm que khoan lửa':()=>aqCraftJob('fireDrill'),
  'Nhóm ngọn lửa đầu tiên':()=>{const b=aqFire();if(b)return {k:'light',b,force:1};const s=S.builds.find(b=>b.prog!=null&&GD_FIRE.test(b.k));return s?{k:'site',b:s}:{guide:'campfire'};},
  'Ăn 3 bữa':()=>S.p.food>=96&&aqFood(false)?{wait:'No rồi: chờ đói bụng để ăn bữa tiếp'}:{k:'eat',goal:1},
  'Ngủ qua đêm đầu tiên':()=>({k:'sleep'}),
  'Hái 4 cây thuốc':()=>{const t=Object.keys(RT).filter(k=>RT[k].sk==='herb'&&!RT[k].poison);const c0=gC('cnt:herb');return {k:'harvest',id:'mugwort',types:t,nm:'cây thuốc',lab0:'Hái cây thuốc',prog:()=>gC('cnt:herb'),until:()=>gC('cnt:herb')>c0};},
  'Làm băng lá rau má':()=>aqCraftJob('bandage'),
  'Tìm 2 viên đá lửa':()=>({k:'harvest',id:'flint',until:()=>gC('get:flint')>=2}),
  'Ghè dao đá lửa':()=>aqCraftJob('knife'),
  'Làm bầu đựng nước':()=>aqCraftJob('flask'),
  'Đun một bầu nước sôi':()=>{const r=RECIPES.find(r=>r.id==='stoneBoil');return r?{k:'craft',r,until:()=>gC('craft:water')>0}:null;},
  'Mài lại lưỡi công cụ':()=>({k:'sharpen'}),
  'Làm giáo đá lửa':()=>aqCraftJob('spear'),
  'Phóng giáo trúng một con thú':()=>{const c=gC('cnt:wound')+gC('cnt:hunt');return {k:'hunt',throw:1,until:()=>gC('cnt:wound')+gC('cnt:hunt')>c};},
  'Lần theo vết máu, hạ con mồi':()=>{const c=gC('cnt:hunt');return {k:'hunt',until:()=>gC('cnt:hunt')>c};},
  'Xẻ thịt con mồi':()=>({k:'butcher'}),
  'Nướng hoặc hun khói 2 món':()=>{const c=gSum(GD_COOK);return {k:'cook',until:()=>gSum(GD_COOK)>c};},
  'Kể chuyện bên bếp lửa':()=>({k:'story'}),
  'Làm áo tơi hoặc nón lá':aqAnyCraft(['leafHat','rainCape']),
  'May áo ấm trước mùa đông':aqAnyCraft(['barkTunic','furCloak','coat','furcoat','clothTunic']),
  'Đổi đồ với làng bên':()=>({k:'trade'}),
  'Khám phá 4 vùng đất':()=>({k:'explore'}),
  'Dựng bàn chế tác':aqSiteOr('workbench','workbench'),
  'San nền khu ở':()=>({guide:'@flat'}),
  'Lát nền nhà 4 ô':aqSiteOr(GD_FLOOR,'floor'),
  'Dựng 6 bức vách':aqSiteOr(GD_WALL,'wall'),
  'Lợp 4 tấm mái':aqSiteOr(GD_ROOF,'roof'),
  'Dựng chỗ nặn gốm':aqSiteOr('potter','potter'),
  'Xây lò nung':aqSiteOr('kiln','kiln'),
  'Đắp ruộng lúa nước':aqSiteOr('paddy','paddy'),
  'Dựng kho thóc trên cột':aqSiteOr('granary','granary'),
  'Thu hoạch 6 lần':()=>S.builds.some(b=>b.prog==null&&S.crops[b.id]&&cropStage(S.crops[b.id])>=3)?{k:'crop'}:{guide:'@farm'},
  'Dựng cột vật tổ':aqSiteOr('totem','totem'),
  'Tìm quặng đồng và thiếc':()=>{if(Math.min(gC('get:copper'),6)<6)return {k:'harvest',id:'copper',until:()=>gC('get:copper')>=6,far:1,miss:0};return {k:'harvest',id:'tin',until:()=>gC('get:tin')>=2,far:1,miss:0};},
  'Xây lò luyện đồng':aqSiteOr('smelter','smelter'),
  'Luyện thỏi đồng thau':()=>aqCraftJob('bronze'),
  'Đúc trống đồng Đông Sơn':aqSiteOr('bronzeDrum','bronzeDrum')
};
// mục có dấu "sáng tạo": chỉ chỉ dẫn (không có nút Tự làm, có nút Chỉ dẫn)
const AQ_CREATIVE=new Set(['Dựng lều nghiêng','Dựng bàn chế tác','San nền khu ở','Lát nền nhà 4 ô','Dựng 6 bức vách','Lợp 4 tấm mái','Dựng chỗ nặn gốm','Xây lò nung','Đắp ruộng lúa nước','Dựng kho thóc trên cột','Dựng cột vật tổ','Xây lò luyện đồng','Đúc trống đồng Đông Sơn']);
const AQ_GUIDEONLY={'Gieo mạ rồi cấy lúa':'@farm','Gặt mùa lúa đầu tiên':'@farm','Mở hội làng':'@fest','Mời một người về ở cùng':'@folk','Nung nồi gốm đầu tiên':'@pot'};
function aqSpec(gi){const g=GOALS[gi];if(!g)return null;if(AUG[g.t])return {plan:AUG[g.t],creative:AQ_CREATIVE.has(g.t)};if(AQ_GUIDEONLY[g.t])return {plan:()=>({guide:AQ_GUIDEONLY[g.t]}),creative:true};return null;}
function aqKind(gi){const sp=aqSpec(gi);if(!sp)return '';return sp.creative?'guide':'auto';}

/* ===================== 4. BỘ CHẠY ===================== */
function aqStart(gi,o){if(!S||!G.on)return;o=o||{};const g=GOALS[gi];aqGuideHide();if(!g&&!o.job)return;
  if(G.build){uiToast('Đang ở chế độ xây: thoát ra trước đã.','');return;}if(G.sleeping)return;
  if(!o.job){const k=aqKind(gi);if(k!=='auto'){aqGuideStart(gi);return;}const [v,n]=goalProg(g);if(v>=n){uiToast('Mục này đã xong.','');return;}}
  AQ.jobs=[];AQ.on=true;AQ.pause=false;AQ.after=null;AQ.flees=[];AQ.gi=o.job?-1:gi;AQ.path=null;AQ.msg='';AQ.bad=[];AQ.bl.clear();AQ.cache.clear();AQ.wC=null;AQ.anyT=G.t;
  if(o.job)aqPush(o.job,null);else aqPush({k:'goal',gi,stall:0},null);if(G.panel)uiClose();if(G.sit)sitToggle(false);G.walkTo=null;sfx('pick');aqUi(true);}
function aqStop(msg,kind){if(!AQ.on&&!AQ.pause)return;AQ.on=false;AQ.pause=false;AQ.jobs=[];AQ.dir=null;AQ.path=null;AQ.stopT=G.t;if(G.h3aim)G.h3aim=null;if(msg)uiToast(msg,kind||'');aqUi(true);}
function aqPause(why){if(!AQ.on||AQ.pause)return;AQ.pause=true;AQ.dir=null;AQ.why=why||'';AQ.path=null;for(const j of AQ.jobs)if(j.k==='goto'){j.pts=null;j.pl=null;}aqUi(true);}
function aqResume(){if(!AQ.on)return;AQ.pause=false;AQ.anyT=G.t;for(const j of AQ.jobs){if(j.k==='goto'){j.pts=null;j.pl=null;}if(j.st==='wait')j.t0=G.t;}aqUi(true);}
function aqFinishRoot(root){const af=AQ.after;AQ.after=null;if(af&&root&&root.k!=='goal'){AQ.jobs=[];AQ.on=false;AQ.path=null;uiToast('🤖 Đã gom đủ vật liệu. Giờ chọn chỗ và dựng nhé!','good');aqUi(true);setTimeout(()=>aqGuide(af.gi,af.piece),300);return;}const done=root&&root.k==='goal'?GOALS[root.gi]:null;AQ.jobs=[];AQ.path=null;
  if(done)uiToast('🤖 Tự làm xong: '+done.t,'good');else if(root&&root.k!=='goal')uiToast('🤖 Xong: '+(root.lab||'việc')+'.','good');
  if(root&&root.k==='goal'&&aqCfg().next){const gi=S.goal;if(gi<GOALS.length){const k=aqKind(gi);if(k==='auto'){AQ.gi=gi;aqPush({k:'goal',gi,stall:0},null);aqUi(true);return;}
      AQ.on=false;aqUi(true);if(k==='guide')setTimeout(()=>aqGuideStart(gi),400);else uiToast('Mục tiếp theo cần bạn tự làm: '+GOALS[gi].t,'');return;}}
  AQ.on=false;aqUi(true);}
function aqStep(j,dt){aqInit(j);const f=AUJ[j.k];if(!f)return aqFail('?');return f(j,dt);}
function aqTick(dt){AQ.dir=null;AQ.run=false;if(!AQ.on||AQ.pause||!S||!G.on)return;if(G.sleeping){const top=AQ.jobs[AQ.jobs.length-1];if(!top||top.k!=='sleep')return;}
  if(G.build){aqPause('Bạn đang xây');return;}if(S.p.hp<=0||G.dying)return;
  AQ.safeT-=dt;if(AQ.safeT<=0){AQ.safeT=0.5;try{aqSafety();}catch(e){if(!AQ.err){AQ.err=1;console.warn('auto',e);}}if(!AQ.on)return;}
  for(let guard=0;guard<6;guard++){const j=AQ.jobs[AQ.jobs.length-1];if(!j){aqStop();return;}let r;
    try{r=aqStep(j,dt);}catch(e){if(!AQ.err){AQ.err=1;console.warn('auto',e);}r=aqFail('Có lỗi khi tự làm.');}
    if(r===AQ_RUN||r==null){AQ.lastLab=j.lab||AQ.lastLab;return;}
    if(r&&r.wait){AQ.msg=typeof r.wait==='string'?r.wait:'';return;}
    AQ.jobs.pop();if(j.k==='goto')AQ.path=null;
    if(r!==AQ_DONE){const parent=AQ.jobs[AQ.jobs.length-1];if(r.quiet){aqStop();return;}
      if(r.guide){aqStop();aqGuide(AQ.gi,r.guide,r.fail);return;}
      if(parent&&!j.urgent){parent.cf=r.fail;continue;}
      if(j.urgent){aqSay(r.fail,'bad');continue;}
      aqStop('🤖 Dừng tự làm: '+r.fail,'bad');return;}
    if(!AQ.jobs.length){aqFinishRoot(j);return;}}}
// an toàn và nhu cầu: chen việc khẩn lên đầu chồng
function aqHasUrgent(k){return AQ.jobs.some(j=>j.urgent&&(!k||j.k===k));}
function aqSafety(){const c=aqCfg(),p=S.p,top=AQ.jobs[AQ.jobs.length-1];if(!top||G.sleeping)return;const busyWork=!!G.work&&!(top.urgent);
  // thú dữ / kẻ địch
  let dg=null,dd=1e9;for(const a of aqPred()){const d=Math.hypot(a.x-P.x,a.z-P.z);if(d<dd){dd=d;dg=a.a;}}
  if(dg&&dd<(dg.angry?260:190)&&!aqHasUrgent('flee')&&!aqHasUrgent('fight')){const D=ANIMALS[dg.kind]||{},weak=(D.hp||9)<=6&&(D.dmg||0)<=10,weap=hasTool('spear')||hasTool('club')||hasTool('knife')||hasTool('axe');
    if(c.fight&&weap&&(weak||dg===G.foes)&&p.hp>45){aqPush({k:'fight',a:dg,t0:G.t,urgent:1},top);return;}
    AQ.flees=(AQ.flees||[]).filter(t=>G.t-t<90);AQ.flees.push(G.t);if(AQ.flees.length>6){AQ.flees=[];const hb=aqBed()||aqFire();if(hb&&aqD(hb.x,hb.z)>220){if(G.work)workStop('');G.act=null;aqPush({k:'camp',urgent:1},top);aqSay('🤖 Thú dữ quanh quẩn: lánh về trại rồi làm tiếp.','bad');return;}}
    if(G.work)workStop('Thú dữ tới gần!');G.act=null;aqPush({k:'flee',a:dg,t0:G.t,urgent:1},top);aqSay('🤖 Thấy '+(dg.n||'thú dữ').toLowerCase()+': tránh xa.','bad');return;}
  if(p.hp<18&&!aqHasUrgent()){aqStop('🤖 Máu thấp quá: dừng tự làm. Nghỉ ngơi, chữa thương đã.','bad');return;}
  if(aqHasUrgent())return;
  if(busyWork){// đang làm dở: chỉ chen ngang khi có sẵn đồ ăn trong túi, hoặc khát/đói quá
    if(c.eat&&p.food<22&&aqFood(p.food<12)){aqPush({k:'eat',urgent:1,tries:0},top);return;}if(c.eat&&p.water<10){aqPush({k:'drink',urgent:1,tries:0},top);return;}return;}
  if(S.st.bleed&&invCount('bandage')>0){aqPush({k:'treat',urgent:1},top);return;}
  if(c.eat){if(p.water<22&&top.k!=='drink'){aqPush({k:'drink',urgent:1,tries:0},top);return;}if(p.food<22&&top.k!=='eat'){aqPush({k:'eat',urgent:1,tries:0},top);return;}}
  if(p.stam<6&&!G.act){aqPush({k:'rest',to:42,t0:G.t,urgent:1},top);return;}
  // đêm tối không đuốc, xa lửa: về lều ngủ hoặc dừng
  if(false&&isNight()&&!invCount('torch')&&!gdLitNear(200)&&!AQ.jobs.some(j=>j.k==='sleep'||j.k==='story')){/* tắt: giờ thật thì đêm kéo dài nhiều giờ và đêm đã sáng trăng, không dừng tự làm vì trời tối nữa */const b=aqBed();
    if(b){aqPush({k:'sleep',urgent:1},top);aqSay('🤖 Trời tối, không có đuốc: về lều ngủ.','');}else aqStop('🤖 Trời tối mà không có đuốc: dừng tự làm cho an toàn.','');}}

/* ===================== 5. LÁI NHÂN VẬT BẰNG CẦN ĐIỀU KHIỂN ẢO ===================== */
function aqPlayerInput(){const k=G.keys;return !!((G.joy&&G.joy.on)||k.KeyW||k.KeyA||k.KeyS||k.KeyD||k.ArrowUp||k.ArrowDown||k.ArrowLeft||k.ArrowRight);}
function aqMoveWrap(_mt){return function(dt){if(AQ.on&&!AQ.pause&&aqPlayerInput())aqPause('Bạn đang điều khiển');
  try{aqTick(dt);}catch(e){if(!AQ.err){AQ.err=1;console.warn('auto',e);}}
  let d=AQ.on&&!AQ.pause&&AQ.dir&&!G.work&&!G.sleeping?AQ.dir:null;if(d){const sd=aqSafeDir(d[0],d[1]);d=sd;}
  if(!d)return _mt(dt);
  const J=G.joy,o={on:J.on,x:J.x,y:J.y},ra=G.runAuto;let ix,iz;
  if(isFP()){const yaw=Math.atan2(d[0],d[1]);P.ry=lerpAng(P.ry,yaw,Math.min(1,dt*8));ix=0;iz=-1;}
  else{const cy=Math.cos(G.yaw),sy=Math.sin(G.yaw);ix=cy*d[0]-sy*d[1];iz=sy*d[0]+cy*d[1];const l=Math.hypot(ix,iz)||1;ix/=l;iz/=l;}
  J.on=true;J.x=ix;J.y=iz;G.runAuto=!!AQ.run;AQ.feeding=true;try{return _mt(dt);}finally{AQ.feeding=false;J.on=o.on;J.x=o.x;J.y=o.y;G.runAuto=ra;}};}
// bọc ngoài cùng khi mọi mô-đun đã nạp xong (bootHot là lệnh cuối của tệp)
{const _bh=bootHot;bootHot=function(){try{moveTick=aqMoveWrap(moveTick);
    const _wt=worldTap;worldTap=function(x,y){if(AQ.on&&!AQ.pause&&G.on&&!G.build){aqPause('Bạn chạm để đi');}return _wt(x,y);};}catch(e){console.warn('auto: bọc',e);}return _bh.apply(this,arguments);};}

/* ===================== 6. GIAO DIỆN: NÚT, KHUNG TRẠNG THÁI, CÀI ĐẶT, BẢN ĐỒ NHỎ ===================== */
function aqChipEl(){let el=document.getElementById('auchip');if(!el){const g=$('#game');if(!g)return null;g.insertAdjacentHTML('beforeend','<div id="auchip" class="auchip" role="status" hidden></div>');el=document.getElementById('auchip');}return el;}
function aqLabel(){if(!AQ.on)return '';let lab='';for(let i=AQ.jobs.length-1;i>=0;i--){const j=AQ.jobs[i];if(j.k==='goto'&&i>0)continue;if(j.lab){lab=j.lab;break;}}
  const top=AQ.jobs[AQ.jobs.length-1];if(top&&top.k==='goto'&&!lab)lab=top.lab||'Đang đi';const root=AQ.jobs[0],g=root&&root.k==='goal'?GOALS[root.gi]:null;
  let pr='';if(g){const [v,n]=goalProg(g);if(n>1)pr=` (${v}/${n})`;}const head=g?g.t+pr:(root&&root.lab0)||lab;return {head,sub:lab&&lab!==head?lab:(AQ.msg||'')};}
function aqUi(force){const el=aqChipEl();if(!el)return;if(!AQ.on){if(!el.hidden){el.hidden=true;el._k='';}AQ.menu=false;return;}
  const L=aqLabel(),c=aqCfg(),walking=!!AQ.dir,key=[AQ.pause,L.head,L.sub,AQ.menu,c.next,c.eat,c.fight,c.max,walking].join('|');if(!force&&el._k===key)return;el._k=key;
  const menu=AQ.menu?`<div class="au-m"><label><input type="checkbox" data-au="cfg" data-k="next" ${c.next?'checked':''}> Tự động làm tiếp mục sau</label>
    <label><input type="checkbox" data-au="cfg" data-k="eat" ${c.eat?'checked':''}> Tự ăn, uống khi đói khát</label>
    <label><input type="checkbox" data-au="cfg" data-k="fight" ${c.fight?'checked':''}> Đánh trả thú yếu (có vũ khí); bỏ chọn = luôn tránh</label>
    <div class="au-r"><span>Tầm xa:</span>${[1500,2600,4500].map(v=>`<button class="btn sm${c.max===v?'':' ghost'}" data-au="max" data-v="${v}">${cxM(v)}</button>`).join('')}</div></div>`:'';
  el.innerHTML=`<div class="au-h"><span class="au-ic">${AQ.pause?'⏸':'🤖'}</span><span class="au-t"><b>${AQ.pause?'Tạm dừng':'Đang tự làm'}: ${esc(L.head||'')}</b>${L.sub||AQ.pause?`<small>${esc(AQ.pause?(AQ.why?AQ.why+' · ':'')+'chạm ▶ để làm tiếp':(walking?'🚶 ':'')+L.sub)}</small>`:''}</span>
    ${AQ.pause?'<button class="au-b go" data-au="resume" aria-label="Làm tiếp">▶</button>':''}<button class="au-b" data-au="menu" aria-label="Tùy chọn">⚙️</button><button class="au-b stop" data-au="stop" aria-label="Dừng">✋ Dừng</button></div>${menu}`;
  el.hidden=false;aqPlace(el);}
function aqPlace(el){const gm=$('#game'),R=gm?gm.getBoundingClientRect():{top:0,left:0,width:innerWidth,height:innerHeight};let top=10;
  for(const id of ['#hud','#goal','#gdcard']){const e=$(id);if(!e||e.hidden)continue;const r=e.getBoundingClientRect();if(r.height>0&&r.top-R.top<R.height*0.5)top=Math.max(top,r.bottom-R.top+6);}
  const m=$('#menu');let right=R.width-10;if(m){const r=m.getBoundingClientRect();if(r.width>0&&r.left-R.left>R.width*0.6&&r.top-R.top<top+120)right=r.left-R.left-6;}
  el.style.top=top+'px';el.style.left='10px';el.style.width=Math.max(220,Math.min(360,right-10))+'px';}
function aqGoalBtn(gi){const k=aqKind(gi);if(!k)return '';const g=GOALS[gi];if(!g)return '';const [v,n]=goalProg(g);if(v>=n)return '';
  if(AQ.on&&AQ.gi===gi)return `<button class="au-gb on" data-au="stop">🤖 Đang tự làm · ✋</button>`;
  return k==='auto'?`<button class="au-gb" data-au="go" data-g="${gi}">▶ Tự làm</button>`:`<button class="au-gb gd" data-au="go" data-g="${gi}">🧭 Chỉ dẫn</button>`;}
// nút trên khung Mục tiêu (HUD)
{const _uh=uiHud;uiHud=function(f){_uh(f);try{const ge=$('#goal');if(!ge||!S)return;const h=aqGoalBtn(S.goal),cur=ge.querySelector('.au-gw');const key=h;
    if(cur&&cur._k===key)return;if(cur)cur.remove();if(!h)return;ge.insertAdjacentHTML('beforeend',`<div class="au-gw">${h}</div>`);ge.querySelector('.au-gw')._k=key;}catch(e){}};}
// nút trong Nhật ký (mục hiện tại và vài mục kế tiếp)
{const _gg=gdGoalsHtml;gdGoalsHtml=function(){let h=_gg();try{const cur=S.goal;for(let i=Math.min(GOALS.length-1,cur+2);i>=cur;i--){const g=GOALS[i];const b=aqGoalBtn(i);if(!b)continue;
      const tag='<b>'+(i===cur?'➤':'○')+' '+esc(g.t)+'</b>',at=h.indexOf(tag);if(at>=0)h=h.slice(0,at+tag.length)+b+h.slice(at+tag.length);}}catch(e){}return h;};}
// "Hôm nay làm gì?" cũng có nút tự làm cho mục tiêu
{const _th=gdTodoHtml;gdTodoHtml=function(){let h=_th();try{if(GD.todo&&S.goal<GOALS.length){const g=GOALS[S.goal],b=aqGoalBtn(S.goal),tag='<b>'+esc(g.t);const at=h.indexOf(tag);if(b&&at>=0){const e=h.indexOf('</b>',at);if(e>0)h=h.slice(0,e+4)+' '+b+h.slice(e+4);}}}catch(e){}return h;};}
function aqClick(e){const a=e.target&&e.target.closest&&e.target.closest('[data-au]');if(!a||!S)return;const k=a.dataset.au;if(k==='cfg'){e.stopImmediatePropagation();const c=aqCfg();c[a.dataset.k]=a.checked?1:0;save();aqUi(true);return;}
  e.stopImmediatePropagation();e.preventDefault();sfx('pick');
  if(k==='go'){const gi=+a.dataset.g;if(G.panel)uiClose();aqStart(gi);uiHud(true);return;}
  if(k==='stop'){aqStop('🤖 Đã dừng tự làm.','');uiHud(true);if(G.panel==='journal')uiOpenRefresh();return;}
  if(k==='resume'){aqResume();return;}if(k==='menu'){AQ.menu=!AQ.menu;aqUi(true);return;}
  if(k==='max'){aqCfg().max=+a.dataset.v;AQ.cache.clear();save();aqUi(true);return;}
  if(k==='gx'){aqGuideHide();return;}if(k==='gbuild'){aqGuideBuild();return;}if(k==='gmat'){aqGuideGather();return;}if(k==='gspot'){aqGuideSpot(true);return;}
  if(k==='gather'){const id=a.dataset.i,n=+a.dataset.n||10;if(G.panel)uiClose();aqStart(-1,{job:{k:'get',id,n:haveCount(id)+n,tries:0,lab0:'Đi gom '+n+' '+aqN(id).toLowerCase()}});return;}}
document.addEventListener('click',aqClick,true);
// chạm vào ô Mục tiêu khi có nút: vẫn mở/thu gọn như cũ (chỉ nút mới chặn)
{const _mt=miniTick;miniTick=function(){const t0=G.miniT;_mt();if(G.miniT===t0)return;try{aqMini();}catch(e){}};}
function aqMini(){const pts=AQ.on&&!AQ.pause?AQ.path:null,mk=AQ.mark;if(!pts&&!mk)return;const cv=$('#mini');if(!cv)return;const pr=Math.min(2,devicePixelRatio||1),W=cv.clientWidth||130,Rr=900,sc=W/(Rr*2),c=cv.getContext('2d');
  c.setTransform(pr,0,0,pr,0,0);c.save();c.beginPath();c.arc(W/2,W/2,W/2-1,0,7);c.clip();const X=x=>W/2+(x-P.x)*sc,Z=z=>W/2+(z-P.z)*sc;
  if(pts&&pts.length>1){c.lineWidth=2.5;c.strokeStyle='rgba(20,10,0,.6)';c.setLineDash([]);c.beginPath();c.moveTo(X(P.x),Z(P.z));for(let i=1;i<pts.length;i++)c.lineTo(X(pts[i][0]),Z(pts[i][1]));c.stroke();
    c.lineWidth=1.6;c.strokeStyle='#ffd25a';c.setLineDash([4,3]);c.stroke();c.setLineDash([]);const e=pts[pts.length-1];c.fillStyle='#ffd25a';c.beginPath();c.arc(X(e[0]),Z(e[1]),3.2,0,7);c.fill();}
  if(mk){c.font='13px system-ui';c.textAlign='center';c.textBaseline='bottom';let x=X(mk.x),y=Z(mk.z);const cx=W/2,cy=W/2,dx=x-cx,dy=y-cy,l=Math.hypot(dx,dy),lim=W/2-9;if(l>lim){x=cx+dx/l*lim;y=cy+dy/l*lim;}c.fillText('📍',x,y+6);}
  c.restore();}
setInterval(()=>{try{if(S&&G.on){aqUi();const ce=document.getElementById('auchip');if(ce&&!ce.hidden)aqPlace(ce);if(AQ.mark)aqMarkTick();}}catch(e){}},400);

/* ===================== 7. VIỆC SÁNG TẠO: CHỈ DẪN, ĐÁNH DẤU CHỖ, MỞ MỤC XÂY, GOM VẬT LIỆU ===================== */
const AQ_GTXT={'@flat':['🪏','San nền là việc của bạn','Làm Gậy đào (2 cành, 1 đá), đứng ở chỗ muốn làm nhà, mở Xây → San nền. Mình đã đánh dấu một chỗ khá bằng phẳng gần trại.'],
  '@farm':['🌾','Việc đồng áng','Ruộng, luống cần bạn chọn chỗ và chăm. Khi có luống chín, nút Tự làm sẽ thu hoạch giúp bạn.'],
  '@fest':['🥁','Mở hội làng','Đánh Trống da vào ngày Hội xuân / Hội mùa, hoặc dựng Đài trống hội. Đây là việc bạn tự quyết.'],
  '@folk':['🏘️','Mời người về ở','Thêm tình thân với làng (đổi đồ, tặng quà) và chuẩn bị một giường trống, rồi trò chuyện để mời.'],
  '@pot':['🏺','Nặn và nung gốm','Nặn cuộn dải ở Chỗ nặn gốm, phơi khô trên giàn, rồi nung ở Lò nung. Mỗi bước bạn tự chọn hình dáng.']};
function aqGuideStart(gi){const sp=aqSpec(gi);if(!sp)return;let pl=null;try{pl=sp.plan();}catch(e){}
  if(pl&&!pl.guide&&!pl.fail&&!pl.wait){aqStart(-1,{job:Object.assign(pl,{lab0:GOALS[gi].t})});AQ.gi=gi;return;}// ví dụ: khung đã đặt → dựng tiếp
  aqGuide(gi,pl&&pl.guide||'@farm',pl&&pl.fail);}
function aqCardEl(){let el=document.getElementById('aucard');if(!el){const g=$('#game');if(!g)return null;g.insertAdjacentHTML('beforeend','<div id="aucard" class="aucard gdcard" role="dialog" hidden></div>');el=document.getElementById('aucard');}return el;}
function aqGuide(gi,piece,why){const el=aqCardEl();if(!el)return;const g=GOALS[gi],def=piece&&piece[0]!=='@'?(pieceDef(piece)||BUILD.find(b=>b.st===piece)):null;
  AQ.card={gi,piece:def?def.id:piece,def};let ic='🏗️',tt=g?g.t:'Việc xây dựng',tx=g?g.d:'';
  if(!def&&AQ_GTXT[piece]){[ic,tt,tx]=AQ_GTXT[piece];}
  const cost=def&&def.cost?Object.entries(def.cost):[];const lack=cost.filter(([k,n])=>haveCount(k)<n);
  el.innerHTML=`<div class="gdc-h"><span>${ic}</span><b>${esc(tt)}</b><button class="gdc-x" data-au="gx" aria-label="Đóng">✕</button></div>
    <p>${why?`<i>${esc(why)}</i><br>`:''}${def?`Phần dựng, đặt chỗ là để <b>bạn tự quyết</b>. Mình đã đánh dấu 📍 một chỗ hợp (đất bằng, khô ráo, gần trại).`:''} ${esc(tx)}</p>
    ${cost.length?`<div class="au-cost">${cost.map(([k,n])=>`<span class="chip${haveCount(k)<n?' lack':''}">${icon(k)}${Math.min(haveCount(k),n)}/${n}</span>`).join('')}</div>`:''}
    <div class="gdc-r">${def?`<button class="btn sm ghost" data-au="gspot">📍 Chỉ chỗ</button>`:''}${lack.length?`<button class="btn sm ghost" data-au="gmat">🧺 Gom đủ vật liệu</button>`:''}${def?`<button class="btn sm" data-au="gbuild">🏗️ Mở Xây: ${esc(def.n)}</button>`:''}</div>`;
  el.hidden=false;if(typeof gdPlace==='function')gdPlace(el);if(def)aqGuideSpot(false);sfx('idea');}
function aqGuideHide(){const el=document.getElementById('aucard');if(el)el.hidden=true;AQ.card=null;}
function aqGuideGather(){const C=AQ.card;if(!C||!C.def)return;const cost=Object.assign({},C.def.cost);const gi=C.gi;aqGuideHide();
  aqStart(-1,{job:{k:'getAll',cost,lab0:'Gom vật liệu: '+C.def.n,lab:'Gom vật liệu: '+C.def.n}});AQ.after={gi,piece:C.def.id};}
function aqGuideBuild(){const C=AQ.card;if(!C||!C.def)return;aqGuideHide();if(G.panel)uiClose();try{buildBegin(C.def.id);if(AQ.mark&&G.build){G.buildTap={x:AQ.mark.x,z:AQ.mark.z};G.build.uiT=-9;buildUpdate();}}catch(e){uiOpen('build',{});}
  uiToast('🏗️ Xem khung xem trước ở chỗ 📍, xoay/dời rồi bấm Đặt. Đặt xong, Tự làm có thể dựng tiếp giúp bạn.','idea');}
// chỗ đẹp: đất bằng, khô, không vướng cây đá, gần lều/bếp đã có (bếp: sát lều để che mưa)
function aqGoodSpot(id){const def=pieceDef(id)||{};const anc=S.builds.find(b=>b.prog==null&&(GD_BED.test(b.k)||GD_FIRE.test(b.k)))||{x:P.x,z:P.z};
  const near0=id==='campfire'?S.builds.find(b=>b.prog==null&&(b.k==='leanto'||b.k==='tent')):null;const cx=near0?near0.x:anc.x,cz=near0?near0.z:anc.z;let best=null,bs=1e9;
  for(let r=near0?42:50;r<=420;r+=26)for(let a=0;a<14;a++){const ang=a/14*6.283+r*0.01,x=cx+Math.cos(ang)*r,z=cz+Math.sin(ang)*r;if(wdAt(x,z)>0||slopeAt(x,z)>0.25)continue;if(cellBusy&&cellBusy(x,z))continue;
    let blk=false;for(const i of near(x,z,26)){const q=RES[i];if(q.st===0&&!RT[q.t].pass){blk=true;break;}}if(blk)continue;let pen=0;for(const b of S.builds)if(Math.hypot(b.x-x,b.z-z)<30)pen+=200;
    const sc=r+slopeAt(x,z)*300+pen+Math.hypot(x-P.x,z-P.z)*0.2;if(sc<bs){bs=sc;best={x,z};}}return best;}
function aqGuideSpot(say){const C=AQ.card;if(!C||!C.def)return;const s=aqGoodSpot(C.def.id);if(!s){if(say)uiToast('Không thấy chỗ nào đủ bằng phẳng gần đây.','');return;}AQ.mark={x:s.x,z:s.z,t:G.t,k:C.def.id};aqMarkTick();if(say)uiToast('📍 Chỗ hợp để đặt '+C.def.n.toLowerCase()+' ('+cxM(aqD(s.x,s.z))+' về phía '+h3dir(s.x-P.x,s.z-P.z)+').','');}
function aqMarkTick(){const M=AQ.mark;if(!M||!G.sc||!window.THREE)return;if(G.t-M.t>240||S.builds.some(b=>b.k===M.k&&Math.hypot(b.x-M.x,b.z-M.z)<60)){AQ.mark=null;if(AQ.markO)AQ.markO.visible=false;return;}
  if(!AQ.markO){const T=THREE,g=new T.Group(),m=new T.MeshBasicMaterial({color:0xffd25a,transparent:true,opacity:0.85,depthWrite:false});const ring=new T.Mesh(new T.RingGeometry(14,18,32).rotateX(-Math.PI/2),m);
    const cone=new T.Mesh(new T.ConeGeometry(5,12,12).rotateX(Math.PI),m);cone.position.y=34;g.add(ring,cone);g.renderOrder=5;G.sc.add(g);AQ.markO=g;}
  const o=AQ.markO;o.visible=true;o.position.set(M.x,hAt(M.x,M.z)+1.5,M.z);o.children[1].position.y=30+Math.sin(G.t*3)*4;}

/* ===================== 8. "TỰ ĐỘNG THU THẬP" trong Túi đồ và Bách khoa ===================== */
function aqGatherable(id){return aqSrc(id).length>0||/^(meat|hide|bone|fish)$/.test(id);}
function aqGatherHtml(){const ids=[...new Set(S.inv.filter(s=>s&&aqGatherable(s.id)).map(s=>s.id).concat(['stick','stone','fiber','wood','berry','flint']))].slice(0,14);if(!ids.length)return '';
  const sel=G.aqGs&&ids.includes(G.aqGs)?G.aqGs:ids[0];
  return `<div class="au-gath"><b>🤖 Tự động thu thập</b><div class="au-r">${ids.map(id=>`<button class="chip${id===sel?' on':''}" data-au="gsel" data-i="${id}" title="${esc(aqN(id))}">${icon(id)}</button>`).join('')}</div>
    <div class="au-r"><span>${esc(aqN(sel))}:</span>${[5,10,20].map(n=>`<button class="btn sm${n===10?'':' ghost'}" data-au="gather" data-i="${sel}" data-n="${n}">Đi gom ${n}</button>`).join('')}</div></div>`;}
{document.addEventListener('click',e=>{const a=e.target&&e.target.closest&&e.target.closest('[data-au="gsel"]');if(!a)return;e.stopImmediatePropagation();e.preventDefault();G.aqGs=a.dataset.i;sfx('pick');uiOpenRefresh();},true);}
{const _uo=uiOpen;uiOpen=function(k,o,keep){const r=_uo(k,o,keep);try{if(k==='bag'&&G.on&&S&&(!G.ptab||G.ptab==='bag')){const b=$('#panel .p-body');if(b&&!b.querySelector('.au-gath')){const h=aqGatherHtml();if(h)b.insertAdjacentHTML('beforeend',h);}}}catch(e){}return r;};}
if(typeof cxItemDet==='function'){const _ci=cxItemDet;cxItemDet=function(id){let h=_ci(id);try{if(aqGatherable(id))h+=`<div class="au-r" style="margin-top:6px"><button class="btn sm" data-au="gather" data-i="${id}" data-n="10">🤖 Đi gom 10 ${esc(aqN(id).toLowerCase())}</button></div>`;}catch(e){}return h;};}
// mất mạng / chết / ngủ: dừng gọn gàng
{const _die=die;die=function(){if(AQ.on)aqStop();return _die.apply(this,arguments);};}
{const st=document.createElement('style');st.textContent=`
.auchip{position:absolute;z-index:12;left:10px;top:200px;width:min(340px,calc(100vw - 80px));padding:7px 9px;border-radius:13px;background:rgba(22,15,10,.93);border:1px solid #ffd25a;box-shadow:0 6px 18px rgba(0,0,0,.45);font-size:12.5px;line-height:1.3;pointer-events:auto;color:#f6ead2}
.au-h{display:flex;align-items:center;gap:6px}.au-ic{font-size:19px}.au-t{flex:1;min-width:0}.au-t b{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:#ffe9b8}.au-t small{display:block;color:#cdbb9a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.au-b{flex:none;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.07);color:inherit;border-radius:10px;padding:5px 8px;font:inherit;font-weight:700;cursor:pointer;min-height:32px}.au-b.stop{background:#8a2c1e;border-color:#c4533a}.au-b.go{background:#2f6a2a;border-color:#5aa04a}
.au-m{margin-top:7px;display:grid;gap:5px;font-size:12px}.au-m label{display:flex;gap:6px;align-items:center}.au-r{display:flex;gap:5px;align-items:center;flex-wrap:wrap;margin-top:4px}
.au-gw{margin-top:5px}.au-gb{border:1px solid #ffd25a;background:rgba(255,210,90,.16);color:#ffe9b8;border-radius:9px;padding:4px 9px;font:inherit;font-size:12px;font-weight:700;cursor:pointer;pointer-events:auto}.au-gb.on{background:#8a2c1e;border-color:#c4533a}.au-gb.gd{border-color:#8ac0ff;background:rgba(120,170,255,.14);color:#dbe9ff}
.jg .au-gb{display:inline-block;margin:4px 0 0 6px;vertical-align:middle}.gdtodo .au-gb{margin-left:4px}
.au-cost{display:flex;flex-wrap:wrap;gap:4px;margin:0 0 8px}.au-cost .chip.lack{outline:1px solid #e0533a}
.au-gath{margin-top:10px;padding:8px;border-radius:12px;background:rgba(255,210,90,.07);border:1px solid var(--line,rgba(255,255,255,.12))}.au-gath .chip.on{outline:2px solid #ffd25a}
body.mxphoto #auchip,body.mxphoto #aucard{display:none!important}`;document.head.appendChild(st);}

/* ---------- thẻ hướng dẫn / tự làm: gọn lại + tự chuyển sang mục kế khi mục đang làm đã xong ----------
   Lỗi cũ: làm xong mục tiêu bằng tay (hoặc xong trong lúc thẻ hướng dẫn đang mở) thì thẻ vẫn đứng ở mục cũ, tự làm không sang mục mới. */
setInterval(()=>{try{if(!S||!G.on)return;
  const C=AQ.card;if(C&&C.gi>=0&&S.goal>C.gi){aqGuideHide();if(aqCfg().next&&S.goal<GOALS.length&&!G.build&&!G.panel)setTimeout(()=>{try{if(!AQ.on&&!G.build)aqStart(S.goal);}catch(e){}},600);}
  if(AQ.on&&!AQ.pause&&AQ.gi>=0&&S.goal>AQ.gi&&AQ.jobs.length){const root=AQ.jobs[0];if(root&&root.k==='goal'&&root.gi===AQ.gi)aqFinishRoot(root);}
  // thẻ gợi ý của guide.js nói về mục tiêu đã qua thì cất đi
  if(typeof GD==='object'&&GD.card&&GD.card.gi!=null&&S.goal>GD.card.gi){const el=document.getElementById('gdcard');if(el)el.hidden=true;GD.card=null;}}catch(e){}},1000);
document.addEventListener('click',e=>{const c=e.target&&e.target.closest&&e.target.closest('.gdcard');if(!c||e.target.closest('button'))return;c.classList.toggle('au-open');});
{const st=document.createElement('style');st.textContent=`#game .gdcard{width:min(264px,calc(100vw - 84px));padding:8px 10px 8px;font-size:11.5px;line-height:1.35;border-radius:12px}#game .gdcard .gdc-h b{font-size:12.5px}#game .gdcard .gdc-h span{font-size:16px}
#game .gdcard p{margin:4px 0 6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}#game .gdcard.au-open p{display:block}#game .gdcard .gdc-r{gap:5px;flex-wrap:wrap}#game .gdcard .btn{min-height:32px;padding:3px 8px;font-size:11.5px}#game .gdcard .gdc-x{width:28px;height:28px}
#game .gdcard .au-cost .chip{padding:1px 6px 1px 3px;font-size:11px}#game .auchip{width:min(250px,calc(100vw - 90px));padding:6px 8px;font-size:11.5px;border-radius:11px}`;document.head.appendChild(st);}
