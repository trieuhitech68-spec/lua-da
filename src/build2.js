/* ===================== XÂY DỰNG SÁNG TẠO: NHIỀU TẦNG, NHÀ SÀN, CỘT, CẦU THANG, THANG LEO =====================
   Mỗi tầng cao 54 du (tường 48 + sàn 6). Ô lưới 40×40 (2 m). Tầng 0 dùng khoá cũ ('floor','roof','obj', 'h:i,j'),
   tầng L>0 thêm hậu tố: 'floor1', 'h:i,j@1'... Các hàm dưới đây thay thế bản cũ cùng tên. */
const LVH=54,LVMAX=3,CUTS=new Set();
const slotN=(base,L)=>L?base+L:base;
function edgeKey(x,z,r,L){const k=r%2?'v:'+Math.round(x/CELL)+','+Math.floor(z/CELL):'h:'+Math.floor(x/CELL)+','+Math.round(z/CELL);return L?k+'@'+L:k;}
function cornerKey(x,z,L){return 'c:'+Math.round(x/CELL)+','+Math.round(z/CELL)+(L?'@'+L:'');}
function pieceKind(def){return def.kind;}
function occMark(b,v){const def=pieceDef(b.k);if(!def)return;const L=b.lv||0;
  if(def.kind==='edge'){const k=edgeKey(b.x,b.z,b.r,L);if(v)OCC.edge.set(k,v);else OCC.edge.delete(k);return;}
  if(def.kind==='corner'){const k=cornerKey(b.x,b.z,L);if(v)OCC.edge.set(k,v);else OCC.edge.delete(k);return;}
  const base=def.kind==='floor'?'floor':def.kind==='roof'?'roof':'obj';cellsOf(def,b.x,b.z,b.r).forEach(([i,j])=>{const k=i+','+j;let c=OCC.cell.get(k);if(!c){c={};OCC.cell.set(k,c);}
    const s=slotN(base,L);if(v)c[s]=v;else delete c[s];if(b.k==='stilt'||def.deck){const s2=slotN('floor',L+1);if(v)c[s2]=v;else delete c[s2];}});}
// mặt sàn tại (x,z) ở tầng L (null nếu không có)
function floorTopL(x,z,L){const c=cellAt(x,z);if(!c)return null;const id=c[slotN('floor',L)];if(!id)return null;const b=BYID.get(id);if(!b)return null;if(b.prog!=null&&b.prog<0.999&&L>0)return null;return b.k==='stilt'||(pieceDef(b.k)||{}).deck?b.y+60:b.y+6;}
function stairsTop(x,z,yRef){const c=cellAt(x,z);if(!c)return null;let best=null;for(let L=0;L<=LVMAX;L++){const id=c[slotN('obj',L)];if(!id)continue;const b=BYID.get(id);if(!b||b.k!=='stairs'||b.prog!=null)continue;
    const dx=x-b.x,dz=z-b.z,a=-b.r*Math.PI/2,lz=dx*Math.sin(-a)+dz*Math.cos(-a),t=clamp((20-lz)/40,0,1),y=b.y+t*LVH;if(yRef==null||y<=yRef+22)best=best==null?y:Math.max(best,y);}return best;}
// sàn cao nhất mà người đứng ở độ cao yRef có thể bước lên
function floorTop(x,z,yRef){let best=null;for(let L=0;L<=LVMAX;L++){const t=floorTopL(x,z,L);if(t==null)continue;if(yRef==null){if(L===0)return t;continue;}if(t<=yRef+22&&(best==null||t>best))best=t;}
  const st=stairsTop(x,z,yRef==null?-1e9:yRef);if(st!=null&&(best==null||st>best))best=st;if(yRef==null)return best;return best;}
function groundY(x,z,yRef){const ry=yRef==null?(typeof P!=='undefined'?P.y:0):yRef;const f=floorTop(x,z,ry);const h=hAt(x,z);return f!=null&&f>h-4?f:wdAt(x,z)>11?waterAt(x,z)+SWIM_Y:h;}
// tầng hiện tại của người chơi (theo sàn dưới chân)
function playerLevel(){for(let L=LVMAX;L>=1;L--){const t=floorTopL(P.x,P.z,L);if(t!=null&&Math.abs(P.y-t)<20)return L;}return 0;}
// cao độ nền (sàn tầng 0 hoặc mặt đất) của ô
function cellBase(x,z){const f=floorTopL(x,z,0);if(f!=null)return f-6;const hs=[[-18,-18],[18,-18],[-18,18],[18,18],[0,0]].map(([u,v])=>hAt(x+u,z+v));return Math.max(...hs)-1;}
// đỡ sàn tầng trên: tường/cột tầng dưới quanh ô, hoặc sàn kề bên cùng tầng
function floorSupported(cx,cz,L){if(L===0)return true;let n=0;const x=(cx+0.5)*CELL,z=(cz+0.5)*CELL;
  for(const [ex,ez,r] of [[x,cz*CELL,0],[x,(cz+1)*CELL,0],[cx*CELL,z,1],[(cx+1)*CELL,z,1]])if(OCC.edge.has(edgeKey(ex,ez,r,L-1)))n++;
  for(const [a,b] of [[cx,cz],[cx+1,cz],[cx,cz+1],[cx+1,cz+1]])if(OCC.edge.has(cornerKey(a*CELL,b*CELL,L-1)))n++;
  if(n>=2)return true;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const c=OCC.cell.get((cx+a)+','+(cz+b));if(c&&c[slotN('floor',L)])return true;}const c0=OCC.cell.get(cx+','+cz);if(L===1&&c0&&c0.floor1)return true;return false;}
/* ---------- đặt thử (bóng xanh/đỏ) ---------- */
function buildUpdate(){const B=G.build;if(!B)return;const def=B.def,a=buildAim();let x,z,r=B.r%4,key=null;const L=clamp(B.lv||0,0,LVMAX);
  if(def.kind==='edge'){const fx=a.x/CELL,fz=a.z/CELL,cx=Math.floor(fx),cz=Math.floor(fz),dx=fx-cx,dz=fz-cz;const c=[[dz,0,0],[1-dz,0,1],[dx,1,0],[1-dx,1,1]].sort((p,q)=>p[0]-q[0])[0];
    if(c[1]===0){r=0;x=(cx+0.5)*CELL;z=(cz+c[2])*CELL;}else{r=1;x=(cx+c[2])*CELL;z=(cz+0.5)*CELL;}key=edgeKey(x,z,r,L);if((B.r%4)>=2)r+=2;}
  else if(def.kind==='corner'){x=Math.round(a.x/CELL)*CELL;z=Math.round(a.z/CELL)*CELL;key=cornerKey(x,z,L);}
  else if(def.kind==='floor'||def.kind==='roof'){x=(Math.floor(a.x/CELL)+0.5)*CELL;z=(Math.floor(a.z/CELL)+0.5)*CELL;if(def.kind==='roof'&&!def.cap&&!B.rman)r=autoRoofR(Math.floor(x/CELL),Math.floor(z/CELL),L);}
  else if(def.small&&B.free){x=a.x;z=a.z;r=B.fr||0;}
  else{const [w,d]=def.fp||[1,1],rw=r%2?d:w,rd=r%2?w:d,cx=Math.round(a.x/CELL-rw/2),cz=Math.round(a.z/CELL-rd/2);x=(cx+rw/2)*CELL;z=(cz+rd/2)*CELL;}
  if(B.id==='treePlatform'){let best=null,bd=90;for(const i of near(a.x,a.z,90)){const q=RES[i];if(q.st!==0||q.lock||!/^(oak|oakG|pine|pineG|birch|savannaTree)$/.test(q.t)||q.s<0.85)continue;const d=Math.hypot(q.x-a.x,q.z-a.z);if(d<bd){bd=d;best=q;}}
    if(best){x=Math.round(best.x/CELL)*CELL;z=Math.round(best.z/CELL)*CELL;B.tree=best;}else B.tree=null;}
  let y,why='';const cells=def.kind==='edge'||def.kind==='corner'?[]:cellsOf(def,x,z,r);const base=cellBase(x,z);
  if(def.kind==='floor'){if(L===0){const hs=[[-18,-18],[18,-18],[-18,18],[18,18],[0,0]].map(([u,v])=>hAt(x+u,z+v));y=Math.max(...hs)-1;if(Math.max(...hs)-Math.min(...hs)>34&&wdAt(x,z)<1)why='Đất dốc quá: dựng cột nhà sàn hoặc cột trước';}
    else{y=base+L*LVH;if(!floorSupported(Math.floor(x/CELL),Math.floor(z/CELL),L))why='Cần tường hoặc cột tầng dưới đỡ (ít nhất 2 phía)';}}
  else if(def.kind==='edge'||def.kind==='corner'){const pts=def.kind==='corner'?[[x+1,z+1],[x-1,z+1],[x+1,z-1],[x-1,z-1]]:r%2?[[x-20,z],[x+20,z]]:[[x,z-20],[x,z+20]];
    const fs=pts.map(([px,pz])=>floorTopL(px,pz,L)).filter(v=>v!=null);if(fs.length)y=Math.max(...fs);else if(L===0)y=Math.min(...pts.map(([px,pz])=>hAt(px,pz)))-1;else{y=base+L*LVH+6;why='Cần sàn ở tầng này';}}
  else if(def.kind==='roof'){const f=floorTopL(x,z,L);y=f!=null?f:base+L*LVH+6;}
  else{const f=floorTopL(x,z,L);if(f!=null)y=f;else if(L===0)y=Math.max(...cells.map(([i,j])=>hAt((i+0.5)*CELL,(j+0.5)*CELL)))-0.5;else{y=base+L*LVH+6;why='Cần sàn ở tầng này';}
    if(B.id==='stilt'&&L>0)why='Cột nhà sàn chỉ dựng từ mặt đất';}
  if(!why){if(def.kind==='edge'||def.kind==='corner'){if(OCC.edge.has(key))why='Chỗ này đã có rồi';}else{const slot=slotN(def.kind==='floor'?'floor':def.kind==='roof'?'roof':'obj',L);for(const [i,j] of cells){const c=OCC.cell.get(i+','+j);if(c&&(c[slot]||(B.id==='stilt'&&(c.floor||c.floor1)))){why='Ô này đã có đồ';break;}}}}
  if(B.id==='treePlatform'){if(!B.tree)why='Đặt sát gốc một cây sồi, thông to';else if(Math.hypot(B.tree.x-x,B.tree.z-z)>24)why='Cây lệch quá: chọn cây gần giữa sàn hơn';y=hAt(x,z)-0.5;}
  if(!why&&L===0&&def.kind!=='roof'&&B.id!=='treePlatform'){const rad=def.kind==='edge'?20:def.kind==='corner'?8:(def.fp?Math.max(...def.fp)*20:20);for(const i of near(x,z,rad+30)){const q=RES[i];if(q.st!==0||RT[q.t].pass)continue;if(Math.hypot(q.x-x,q.z-z)<rad*0.75+(RT[q.t].r||4)*0.6){why='Vướng '+RT[q.t].n.toLowerCase()+': dọn trước đã';break;}}}
  if(!why&&L===0&&wdAt(x,z)>1&&!/^(stilt|post|fishTrap)$/.test(B.id)&&!floorTopL(x,z,0))why='Không xây trên nước: dựng cột nhà sàn trước';
  if(!why&&B.id==='fishTrap'&&(wdAt(x,z)<1||wdAt(x,z)>10))why='Đặt đó bắt cá ở chỗ nước nông';
  if(!why&&B.id==='stilt'&&wdAt(x,z)>22)why='Nước sâu quá để chôn cột';
  if(!why&&Math.hypot(x-P.x,z-P.z)>330)why='Xa quá';if(!why&&!lvOk(def.lv))why='Cần '+lvText(def.lv);if(!why&&!canPay(def.cost))why='Thiếu nguyên liệu';
  B.pos={x,y,z,r};B.ok=!why;B.why=why;B.g.position.set(x,y,z);B.g.rotation.y=r*Math.PI/2;B.mat.color.set(why?0xff6a5a:0x7cff9a);if(G.t-(B.uiT||0)>0.2){B.uiT=G.t;uiBuildBar(true,def,why);}}
/* ---------- va chạm: vật cảnh, cây đá, tường mọi tầng (chỉ tường ngang tầm người), cột, đồ đặt ---------- */
function collide(nx,nz){const pr=7,py=P.y;for(let it=0;it<2;it++){for(const c of SCOL){const dx=nx-c.x,dz=nz-c.z,d=Math.hypot(dx,dz),r=c.r+pr;if(d<r&&d>0.01){nx=c.x+dx/d*r;nz=c.z+dz/d*r;}}
    for(const i of near(nx,nz,40)){const q=RES[i];if(q.st!==0)continue;const D=RT[q.t];if(D.pass)continue;if(Math.abs(q.y-py)>60)continue;const r=(D.r||6)*q.s*0.7+pr,dx=nx-q.x,dz=nz-q.z,d=Math.hypot(dx,dz);if(d<r&&d>0.01){nx=q.x+dx/d*r;nz=q.z+dz/d*r;}}
    const ci=Math.floor(nx/CELL),cj=Math.floor(nz/CELL);
    for(let L=0;L<=LVMAX;L++)for(let i=ci-1;i<=ci+1;i++)for(let j=cj-1;j<=cj+1;j++){
      for(const [k0,r] of [['h:'+i+','+j,0],['v:'+i+','+j,1]]){const id=OCC.edge.get(L?k0+'@'+L:k0);if(!id)continue;const b=BYID.get(id);if(!b)continue;const def=pieceDef(b.k);if(!def)continue;if(py+30<b.y||py>b.y+(def.low?22:46))continue;if(/ladder/i.test(b.k))continue;
        const ax=r?b.x:b.x-20,az=r?b.z-20:b.z,bx=r?b.x:b.x+20,bz=r?b.z+20:b.z;const segs=def.door&&(typeof solDoorOpen!=='function'||solDoorOpen(b))?[[0,0.17],[0.83,1]]:[[0,1]];/* lối cửa rộng 26: người (bán kính 9) đi lọt */
        for(const [s0,s1] of segs){const x0=ax+(bx-ax)*s0,z0=az+(bz-az)*s0,x1=ax+(bx-ax)*s1,z1=az+(bz-az)*s1;const dx=x1-x0,dz=z1-z0,l2=dx*dx+dz*dz;let t=((nx-x0)*dx+(nz-z0)*dz)/l2;t=clamp(t,0,1);const qx=x0+dx*t,qz=z0+dz*t,ex=nx-qx,ez=nz-qz,d=Math.hypot(ex,ez),rr=pr+2;if(d<rr&&d>0.001){nx=qx+ex/d*rr;nz=qz+ez/d*rr;}}}
      const pid=OCC.edge.get(cornerKey(i*CELL,j*CELL,L));if(pid){const b=BYID.get(pid);if(b&&py+30>=b.y&&py<=b.y+LVH){const dx=nx-b.x,dz=nz-b.z,d=Math.hypot(dx,dz),rr=pr+3;if(d<rr&&d>0.01){nx=b.x+dx/d*rr;nz=b.z+dz/d*rr;}}}
      const c=OCC.cell.get(i+','+j);const oid=c&&c[slotN('obj',L)];if(oid){const b=BYID.get(oid);const def=b&&pieceDef(b.k);if(def&&Math.abs(b.y-py)<40&&!def.bed&&!def.farm&&!def.shelter&&b.k!=='stairs'&&b.k!=='stilt'&&b.k!=='rug'&&(!def.fp||def.fp[0]*def.fp[1]===1)){const rr=(def.small?7:15)+pr,dx=nx-b.x,dz=nz-b.z,d=Math.hypot(dx,dz);if(d<rr&&d>0.01){nx=b.x+dx/d*rr;nz=b.z+dz/d*rr;}}}
      if(c&&c.obj){const b=BYID.get(c.obj);if(b&&b.k==='stilt'&&py<b.y+50){for(const [ox,oz] of [[-18,-18],[18,-18],[-18,18],[18,18]]){const px=b.x+ox,pz=b.z+oz,dx=nx-px,dz=nz-pz,d=Math.hypot(dx,dz),rr=pr+2.5;if(d<rr&&d>0.01){nx=px+dx/d*rr;nz=pz+dz/d*rr;}}}}}}
  return [nx,nz];}
// dưới mái hoặc dưới sàn tầng trên thì không bị mưa
function underRoof(x,z){if(typeof inCave==='function'&&inCave(x,z))return true;const c=cellAt(x,z);if(c){const py=typeof P!=='undefined'?P.y:0;for(let L=0;L<=LVMAX;L++){for(const s of [slotN('roof',L),L>0?slotN('floor',L):null]){if(!s||!c[s])continue;const b=BYID.get(c[s]);if(!b||b.prog!=null)continue;if((s.startsWith('roof')?b.y+30:b.y)>py+20)return true;}}
    if(c.obj){const b=BYID.get(c.obj);const d=b&&pieceDef(b.k);if(d&&d.shelter)return true;}}return false;}
// nhìn từ trên cao: ẩn mái và các tầng phía trên người chơi khi ở trong nhà
function roofCut(){const inside=!isFP()&&underRoof(P.x,P.z),py=P.y,ck=inside?Math.floor(P.x/CELL)+','+Math.floor(P.z/CELL)+'|'+Math.round(py/20):'out';if(ck===G.cutK)return;G.cutK=ck;G.cut=inside;
  for(const k in DECO){const e=DECO[k];if(!e.api)continue;e.list.forEach((d,i)=>{if(inside&&Math.hypot(d.x-P.x,d.z-P.z)<200&&d.y>py+10)e.api.hide(i);else setPieceM(e.api,i,d);});e.api.flush();}
  SI.forEach((e,k)=>{if(!e.api)return;let ch=0;e.map.forEach((idx,id)=>{const b=BYID.get(id);if(!b)return;const def=pieceDef(b.k);const above=def&&((def.kind==='roof'&&b.y+20>py)||(b.y>py+30));if(inside&&above&&Math.hypot(b.x-P.x,b.z-P.z)<200){e.api.hide(idx);ch=1;}else if(CUTS.has(id)){setPieceM(e.api,idx,b);ch=1;}if(inside&&above)CUTS.add(id);else CUTS.delete(id);});if(ch)e.api.flush();});}
// mái tự xoay theo khối nền cùng tầng
function autoRoofR(cx,cz,L){L=L||0;const fs=slotN('floor',L),rs=slotN('roof',L);const seen=new Set([cx+','+cz]),q=[[cx,cz]];let x0=cx,x1=cx,z0=cz,z1=cz;
  while(q.length&&seen.size<90){const [i,j]=q.shift();for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const k=(i+di)+','+(j+dj);if(seen.has(k))continue;const c=OCC.cell.get(k);if(!c||!(c[fs]||c[rs]))continue;seen.add(k);q.push([i+di,j+dj]);
    x0=Math.min(x0,i+di);x1=Math.max(x1,i+di);z0=Math.min(z0,j+dj);z1=Math.max(z1,j+dj);}}
  if(x1-x0>=z1-z0)return (cz+0.5)>=(z0+z1+1)/2?0:2;return (cx+0.5)>=(x0+x1+1)/2?1:3;}
function isRoofK(k){const d=pieceDef(k);return d&&d.kind==='roof'&&!d.cap;}
function decoRebuild(){const want={ridge:[],gable:[]},at=new Map(),RD=[[0,-1],[-1,0],[0,1],[1,0]];
  S.builds.forEach(b=>{if(isRoofK(b.k)&&b.prog==null)at.set(Math.floor(b.x/CELL)+','+Math.floor(b.z/CELL)+'@'+(b.lv||0),b);});
  at.forEach((b,key)=>{const L=b.lv||0,cx=Math.floor(b.x/CELL),cz=Math.floor(b.z/CELL),r=((b.r%4)+4)%4,d=RD[r];
    if(r<2){const o=at.get((cx+d[0])+','+(cz+d[1])+'@'+L);if(o&&((o.r%4)+4)%4===r+2)want.ridge.push({x:b.x+d[0]*CELL/2,y:b.y,z:b.z+d[1]*CELL/2,r:r===0?0:1});}
    const side=r%2===0?[[b.x-CELL/2,b.z,1],[b.x+CELL/2,b.z,1]]:[[b.x,b.z-CELL/2,0],[b.x,b.z+CELL/2,0]];
    side.forEach(([x,z,er])=>{const id=OCC.edge.get(edgeKey(x,z,er,L));const w=id&&BYID.get(id),wd=w&&pieceDef(w.k);if(!wd||wd.low||/ladder/i.test(w.k))return;want.gable.push({x,y:b.y,z,r:(r+3)%4});});});
  for(const k in want){const Lst=want[k];let e=DECO[k];if(!Lst.length&&!e)continue;if(!e)e=DECO[k]={api:null,cap:0,list:[]};
    if(Lst.length>e.cap){if(e.api){e.api.dispose();G.sc.remove(e.api.G);}e.cap=Math.max(8,Lst.length*2);e.api=instGroup(piecePrep(k).parts,e.cap,{});G.sc.add(e.api.G);seasonPatchAll(e.api.G);}
    e.list=Lst;for(let i=0;i<e.cap;i++){if(i<Lst.length)setPieceM(e.api,i,Lst[i]);else e.api.hide(i);}e.api.flush();}
  G.cutK=null;roofCut();}
/* ---------- thang leo: bấm Hành động để leo lên / xuống ---------- */
function ladderInfo(b){const L=b.lv||0,up=playerLevel()<=L;return {name:'Thang tre',verb:up?'Leo lên':'Leo xuống',ok:true,icon:'stick'};}
function ladderUse(b){const L=b.lv||0,dir=b.r%2?[1,0]:[0,1];const sd=[1,-1].map(s=>{const x=b.x+dir[0]*s*22,z=b.z+dir[1]*s*22;return {x,z,top:floorTopL(x,z,L+1)};});
  const up=playerLevel()<=L;let hi=sd.find(o=>o.top!=null)||sd[0],lo=sd.find(o=>o!==hi);
  if(up){G.ladder={t:0,x0:P.x,z0:P.z,y0:P.y,x1:hi.x,z1:hi.z,y1:hi.top!=null?hi.top:b.y+LVH};}else{const gy=floorTopL(lo.x,lo.z,L);G.ladder={t:0,x0:P.x,z0:P.z,y0:P.y,x1:lo.x,z1:lo.z,y1:gy!=null?gy:hAt(lo.x,lo.z)};}G.act=null;sfx('step');}
function ladderTick(dt){const A=G.ladder;if(!A)return false;A.t+=dt/1.6;const k=clamp(A.t,0,1),e=k*k*(3-2*k);P.x=A.x0+(A.x1-A.x0)*Math.min(1,e*1.3);P.z=A.z0+(A.z1-A.z0)*Math.min(1,e*1.3);P.y=A.y0+(A.y1-A.y0)*e;P.air=false;P.vy=0;if(Math.floor(A.t*8)!==Math.floor((A.t-dt/1.6)*8))sfx('step');if(A.t>=1){G.ladder=null;}return true;}
/* ---------- thanh xây dựng: thêm chọn tầng ---------- */
function uiBuildBar(on,def,why){const el=$('#buildBar');document.body.classList.toggle('building',!!on);if(!on){el.hidden=true;return;}el.hidden=false;const rm=G.build&&G.build.rm,L=G.build?G.build.lv||0:0;
  const _bbh=`<div class="bb-i"><b>${rm?'Phá dỡ công trình':esc(def.n)}</b>${rm?'<span class="small">Chạm ✔ vào công trình muốn phá</span>':`<div class="chips">${chips(def.cost)}</div>${why?`<span class="small warn">${esc(why)}</span>`:'<span class="small ok">Đặt được</span>'}`}</div>
    <div class="bb-lv"><button class="btn sm ghost" data-a="bb" data-k="dn" aria-label="Tầng dưới">▼</button><span>${L?'Tầng '+(L+1):'Mặt đất'}</span><button class="btn sm ghost" data-a="bb" data-k="up" aria-label="Tầng trên">▲</button></div>
    <div class="bb-b">${def.small?`<button class="btn sm ${G.build&&G.build.free?'':'ghost'}" data-a="bb" data-k="free" aria-label="Đặt tự do" title="Đặt tự do, không theo lưới">✥</button>`:''}<button class="btn sm ghost" data-a="bb" data-k="rot" aria-label="Xoay">⟲</button><button class="btn sm ${rm?'red':'ghost'}" data-a="bb" data-k="rm" aria-label="Phá dỡ">🗑</button><button class="btn sm" data-a="bb" data-k="place" aria-label="Đặt">✔</button><button class="btn sm ghost" data-a="bb" data-k="exit" aria-label="Xong">✕</button></div>`;if(el._h!==_bbh){el._h=_bbh;el.innerHTML=_bbh;}}
function buildBtn(k){if(!G.build)return;const B=G.build;if(k==='free'){B.free=!B.free;B.uiT=0;buildUpdate();return;}if(k==='rot'&&B.free&&B.def.small){B.fr=((B.fr||0)+0.25)%4;return;}if(k==='rot'){if(B.def.kind==='roof'&&!B.def.cap){B.r=((B.rman?B.r:(B.pos?B.pos.r:0))+1)%4;B.rman=1;}else B.r=(B.r+1)%4;}
  else if(k==='up'||k==='dn'){B.lv=clamp((B.lv||0)+(k==='up'?1:-1),0,LVMAX);B.uiT=0;buildUpdate();}
  else if(k==='rm'){B.rm=!B.rm;B.g.visible=!B.rm;uiBuildBar(true,B.def);}else if(k==='place'){if(B.rm)buildRemoveAt();else buildPlace();}else if(k==='exit')buildEnd();}
/* ---------- cầu thang: tự quay về phía sàn tầng trên, không cho đặt chỗ bị sàn/mái phía trên che kín ----------
   Lỗi "cầu thang xây xong mất luôn": cầu thang đặt ở ô đã có sàn tầng trên (hoặc chọn ▲ tầng 2 rồi đặt lên sàn gác)
   bị sàn/vách/mái phủ kín hoàn toàn, lại không đi lên được → người chơi tưởng biến mất. */
const STAIR_DIR=[[0,-1],[-1,0],[0,1],[1,0]];// hướng đầu trên của cầu thang theo b.r (khớp stairsTop)
{const _bu=buildUpdate;buildUpdate=function(){const B=G.build;_bu();if(!B||B.id!=='stairs'||!B.pos||B.rm)return;
  if(B.rman||(B._sr!=null&&B.r!==B._sr))B._man=1;const L=B.lv||0,cx=Math.floor(B.pos.x/CELL),cz=Math.floor(B.pos.z/CELL);
  if(!B._man){for(let r=0;r<4;r++){const c=OCC.cell.get((cx+STAIR_DIR[r][0])+','+(cz+STAIR_DIR[r][1]));if(c&&c[slotN('floor',L+1)]){if(B.r!==r){B.r=r;B.uiT=0;_bu();}break;}}}B._sr=B.r;
  const c=OCC.cell.get(cx+','+cz);if(!B.why&&c&&(c[slotN('floor',L+1)]||c[slotN('roof',L)])){B.why=c[slotN('floor',L+1)]?'Ô này đã có sàn tầng trên: cầu thang sẽ bị che kín. Đặt ở ô ngay cạnh sàn tầng trên.':'Mái che ngay trên: cầu thang không có chỗ lên. Đặt ở ô trống phía trên.';B.ok=false;B.mat.color.set(0xff6a5a);if(B.uiT===G.t)uiBuildBar(true,B.def,B.why);}}}
// bản lưu cũ: báo cho người chơi biết cầu thang nào đang bị sàn tầng trên/mái che kín (đặt nhầm chỗ trước khi có kiểm tra ở trên)
function stairsHiddenCheck(){const bad=S.builds.filter(b=>{if(b.k!=='stairs')return false;const c=OCC.cell.get(Math.floor(b.x/CELL)+','+Math.floor(b.z/CELL)),L=b.lv||0;return c&&(c[slotN('floor',L+1)]||c[slotN('roof',L)]);});
  if(bad.length)setTimeout(()=>uiToast(`🪜 Có ${bad.length} cầu thang bị sàn tầng trên hoặc mái che kín nên không thấy, không đi được. Vào Xây → 🗑 dỡ ra (được hoàn vật liệu) rồi đặt lại ở ô ngay cạnh sàn tầng trên.`,'bad'),4000);return bad.length;}
