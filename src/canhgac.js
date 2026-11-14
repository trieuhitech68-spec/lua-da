/* ---------- LÍNH GÁC CHIA NHAU ĐỨNG GÁC ----------
   Trước: có chòi thì mỗi chòi một người, còn lại dồn hết về một cổng (đứng chồng lên nhau) hoặc đi vòng quanh nhà sát nhau.
   Giờ mỗi lính gác một VỊ TRÍ riêng, chia theo thứ tự:
     1) mỗi chòi canh một người (đứng trên chòi);  2) mỗi cổng hai người, hai bên lối vào;
     3) còn lại rải đều thành vòng quanh khu nhà (cách mép ngoài cùng của nhà cửa, hàng rào khoảng 3 m), quay mặt ra ngoài, thỉnh thoảng đi tuần một đoạn ngắn rồi về chỗ.
   Thấy thú dữ, kẻ cướp trong tầm thì người gần nhất xông ra đánh rồi về lại vị trí. Người làng đứng gần nhau quá thì tự dạt ra, không đứng chồng lên nhau. */
const CGX={c:null,t:-9};
function cgxPosts(home,n){if(CGX.c&&G.t-CGX.t<3&&G.t>=CGX.t&&CGX.c.n===n&&CGX.c.hid===(home.id||0))return CGX.c.L;const tw=[],gt=[];let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,nb=0;
  for(const b of S.builds){if(b.prog!=null||b.remote)continue;const d=Math.hypot(b.x-home.x,b.z-home.z);if(d>520)continue;if(b.k==='watchtower')tw.push(b);else if(/gate/i.test(b.k))gt.push(b);if(d<420){nb++;if(b.x<x0)x0=b.x;if(b.x>x1)x1=b.x;if(b.z<z0)z0=b.z;if(b.z>z1)z1=b.z;}}
  const L=[];for(const t of tw)L.push({x:t.x,z:t.z,top:t.y+(typeof SOL_TW==='number'?SOL_TW:83),k:'tw'});
  for(const g of gt){const sx=Math.sign(home.x-g.x)||1,sz=Math.sign(home.z-g.z)||1;for(const sd of [26,-26]){if(g.r%2)L.push({x:g.x+sx*16,z:g.z+sd,k:'gt'});else L.push({x:g.x+sd,z:g.z+sz*16,k:'gt'});}}
  const rest=Math.max(0,n-L.length);if(rest>0){const cx=nb?(x0+x1)/2:home.x,cz=nb?(z0+z1)/2:home.z,R=clamp((nb?Math.hypot(x1-x0,z1-z0)/2:0)+70,120,440),K=Math.max(4,rest),a0=gt.length?Math.atan2(gt[0].x-cx,gt[0].z-cz)+Math.PI/K:0.4;
    for(let i=0;i<K;i++){const a=a0+i/K*6.283;let x=cx+Math.sin(a)*R,z=cz+Math.cos(a)*R;for(let k=0;k<6&&(wdAt(x,z)>0.5);k++){x=cx+Math.sin(a)*(R-k*30);z=cz+Math.cos(a)*(R-k*30);}L.push({x,z,k:'ring',a,cx,cz});}}
  CGX.c={L,n,hid:home.id||0};CGX.t=G.t;return L;}
cgTick=function(L,dt){const G0=L.slice().sort((a,b)=>(a.seed||0)-(b.seed||0)||(a.n<b.n?-1:1));const home0=folkHome(G0[0]),posts=cgxPosts(home0,G0.length);
  G0.forEach((f,idx)=>{if(!f._o)folkSpawn(f);cgMark(f._o);const home=home0,p=posts[idx%posts.length]||{x:home.x,z:home.z,k:'ring',a:idx,cx:home.x,cz:home.z};let ax=p.x,az=p.z,top=p.top!=null?p.top:null;
    if(p.k==='ring'){/* đi tuần một đoạn ngắn dọc vòng gác rồi về chỗ */const w=Math.sin(G.t*0.05+idx*1.7);if(w>0.55){const tx=Math.cos(p.a),tz=-Math.sin(p.a),k=(w-0.55)/0.45*46;ax+=tx*k;az+=tz*k;}}
    let tx=ax,tz=az,pose='idle',sp=75;f._t=(f._t||0)-dt;f._gx=ax;f._gz=az;const e=typeof danEnemy==='function'?danEnemy(ax,az,240):null;
    if(e){top=null;tx=e.e.x;tz=e.e.z;sp=115;f._gx=tx;f._gz=tz;if(Math.hypot(e.e.x-f.x,e.e.z-f.z)<(e.e.r||9)+16){tx=f.x;tz=f.z;pose='chop';f._ry=Math.atan2(e.e.x-f.x,e.e.z-f.z);if(f._t<=0){f._t=1.1;danStrike(f,e);}}}
    const dx=tx-f.x,dz=tz-f.z,d=Math.hypot(dx,dz);if(d>900){f.x=ax;f.z=az;}else if(d>5&&pose!=='chop'){f.x+=dx/d*Math.min(d,sp*dt);f.z+=dz/d*Math.min(d,sp*dt);f._ry=Math.atan2(dx,dz);pose='walk';f._g=(f._g||0)+dt*1.5;}
    else if(pose==='idle'){const ox=p.cx!=null?p.cx:home.x,oz=p.cz!=null?p.cz:home.z;f._ry=Math.atan2(f.x-ox,f.z-oz)+Math.sin(G.t*0.25+idx)*0.9;/* quay mặt ra ngoài, đảo mắt quan sát */}
    const onTop=top!=null&&Math.hypot(f.x-ax,f.z-az)<8;f._o.position.set(f.x,onTop?top:groundY(f.x,f.z,(f._o.position.y||0)+10),f.z);f._o.rotation.y=lerpAng(f._o.rotation.y,f._ry||0,Math.min(1,dt*5));f._o.visible=true;f._st='guard';
    if(K3.char2Pose&&f._rig&&Math.hypot(P.x-f.x,P.z-f.z)<900){try{K3.char2Pose(f._rig,pose,pose==='walk'?f._g:G.t+f.seed,{});}catch(er){}}});};
// người làng không đứng chồng lên nhau: hai người cách nhau dưới 13 thì dạt ra (trừ lúc ngủ, lúc đang đứng trên chòi)
{const _ft=folkTick;folkTick=function(dt){const r=_ft.apply(this,arguments);try{const F=S&&S.folk;if(F&&F.length>1&&G.on)for(let i=0;i<F.length;i++){const a=F[i];if(!a._o||a._st==='sleep')continue;for(let j=i+1;j<F.length;j++){const b=F[j];if(!b._o||b._st==='sleep')continue;const dx=b.x-a.x,dz=b.z-a.z;if(dx>13||dx<-13||dz>13||dz<-13)continue;if(Math.abs((a._o.position.y||0)-(b._o.position.y||0))>30)continue;let d=Math.sqrt(dx*dx+dz*dz);const ux=d>0.01?dx/d:Math.cos(i*2.4+j),uz=d>0.01?dz/d:Math.sin(i*2.4+j);if(d<13){const k=(13-d)*0.5*Math.min(1,dt*6);a.x-=ux*k;a.z-=uz*k;b.x+=ux*k;b.z+=uz*k;a._o.position.x=a.x;a._o.position.z=a.z;b._o.position.x=b.x;b._o.position.z=b.z;}}}}catch(e){}return r;};}
try{if(typeof JOBN==='object'&&JOBN.guard)JOBN.guard='Canh gác (chòi, cổng, quanh nhà)';}catch(e){}
