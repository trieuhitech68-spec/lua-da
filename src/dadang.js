/* ===================== THÚ RỪNG ĐA DẠNG HƠN · THỔ DÂN ĐÔNG HƠN =====================
   12 loài mới của rừng Việt Nam, dùng lại dáng của loài gần nhất nhưng khác cỡ, màu lông, sức: hoẵng, sơn dương, lợn lòi, chó rừng, báo hoa mai, trâu rừng,
   voọc, trăn, gà lôi, công, gấu ngựa, thỏ trắng. Tổng số thú trên bản đồ tăng khoảng một phần tư. Mỗi trại thổ dân thêm 2 chiến binh. */
const DD_VAR=[{b:'deer',n:'Hoẵng',sc:0.72,c:[1.15,0.8,0.6],hp:2,cnt:10,grp:2},{b:'deer',n:'Sơn dương',sc:0.86,c:[0.55,0.55,0.6],hp:4,cnt:8,grp:2,bio:['rock','edge']},
  {b:'boar',n:'Lợn lòi',sc:1.3,c:[0.6,0.5,0.45],hp:10,cnt:6,grp:1},{b:'wolf',n:'Chó rừng',sc:0.82,c:[1.35,0.8,0.45],hp:4,cnt:9,grp:3},
  {b:'tiger',n:'Báo hoa mai',sc:0.8,c:[1.15,1.05,0.7],hp:9,cnt:4,grp:1},{b:'gaur',n:'Trâu rừng',sc:0.95,c:[0.55,0.55,0.6],hp:16,cnt:8,grp:3},
  {b:'monkey',n:'Voọc đen',sc:1.15,c:[0.35,0.35,0.38],hp:2,cnt:10,grp:4},{b:'snake',n:'Trăn',sc:2.1,c:[1.0,0.85,0.5],hp:5,cnt:6,grp:1},
  {b:'junglefowl',n:'Gà lôi trắng',sc:1.2,c:[1.5,1.5,1.6],hp:1,cnt:10,grp:2},{b:'junglefowl',n:'Công',sc:1.6,c:[0.4,1.0,1.2],hp:2,cnt:6,grp:2},
  {b:'bear',n:'Gấu ngựa',sc:0.92,c:[0.3,0.3,0.32],hp:12,cnt:3,grp:1},{b:'rabbit',n:'Thỏ trắng',sc:0.95,c:[1.6,1.6,1.6],hp:1,cnt:10,grp:2}];
function ddMake(V,x,z,R){const a=animalNew(V.b,x,z,R);try{a.o.traverse(m=>{if(m.isMesh)m.castShadow=false;});}catch(e){}a.n=V.n;a.var=V.n;a.hp=V.hp;a._hpMax=V.hp;a.r=(a.r||8)*V.sc;try{a.o.scale.multiplyScalar(V.sc);const seen=new Map();a.o.traverse(m=>{if(!m.isMesh||!m.material)return;const one=mt=>{let c=seen.get(mt);if(!c){c=mt.clone();if(c.color)c.color.setRGB(Math.min(1,c.color.r*V.c[0]),Math.min(1,c.color.g*V.c[1]),Math.min(1,c.color.b*V.c[2]));seen.set(mt,c);}return c;};
      m.material=Array.isArray(m.material)?m.material.map(one):one(m.material);});}catch(e){}return a;}
{const _ai=animalsInit;animalsInit=function(){const r=_ai.apply(this,arguments);try{const R=rng((S.seed|0)+4477);const lite=(typeof SET==='object'&&SET&&SET.q!=null&&SET.q<=0)||/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)?0.4:0.65;/* chạy thử thấy thêm 90 con làm máy yếu giật: giảm còn ~58 trên máy tính, ~36 trên điện thoại */for(const V0 of DD_VAR){const V=Object.assign({},V0,{cnt:Math.max(2,Math.round(V0.cnt*lite))});const D=ANIMALS[V.b];if(!D)continue;const bio=V.bio||D.bio;let n=0,tries=0;while(n<V.cnt&&tries<1500){tries++;let x,z;const a=R()*6.283,rr=Math.sqrt(R())*WR*0.85;x=Math.cos(a)*rr;z=Math.sin(a)*rr;if(typeof V5!=='undefined'&&WV>=4){x=V5.box[0]+R()*V5.box[2];z=V5.box[1]+R()*V5.box[3];}
          if(!wIn(x,z,0.95)||hAt(x,z)<3||wdAt(x,z)>0||!bio.includes(biome(x,z)))continue;if(Math.hypot(x-SPAWN[0],z-SPAWN[1])<(D.aggro==='never'?300:900))continue;for(let k=0;k<V.grp&&n<V.cnt;k++,n++)G.animals.push(ddMake(V,x+(R()-0.5)*60,z+(R()-0.5)*60,R));}}
      try{seasonPatchAll();}catch(e){}}catch(e){console.warn('đa dạng thú',e);}return r;};}
try{for(const k in RLTRIBE)if(RLTRIBE[k]&&RLTRIBE[k].g)RLTRIBE[k].g+=2;}catch(e){}
