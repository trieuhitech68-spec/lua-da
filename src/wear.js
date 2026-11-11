/* ===================== ĐỒ MẶC HIỆN LÊN NGƯỜI NHÂN VẬT =====================
   Trước đây chỉ áo, áo choàng, giày đổi màu hình nhân vật; mũ, vòng, giáp, khiên chỉ đổi chỉ số. Giờ mỗi món có hình gắn vào khung xương:
     đầu  : nón lá (nón chóp rộng vành), mũ lông thú, mũ lông chim
     cổ   : chuỗi vỏ sò, vòng nanh thú, chuỗi ngọc trai, bùa ngọc bích
     tay  : vòng đá, vòng đồng, vòng vàng (cổ tay trái)
     giáp : giáp da, giáp mây, tấm che ngực đồng, giáp sắt (đồng và sắt có thêm che vai)
     khiên: khiên mây, khiên da (đeo cẳng tay trái)
   Kích thước đo từ chính mô hình lúc dựng (hộp bao của đầu, thân, cẳng tay) nên khớp mọi dáng người đã chỉnh trong trình tạo nhân vật.
   Thêm 2 món mới: Mũ lông chim (6 lông chim + 1 dây thừng) và Áo vải chàm dài tay (3 vải + 1 son, cần kim xương). */
Object.assign(ITEMS,{featherCrown:{n:'Mũ lông chim',t:'wear',slot:'head',warm:2,ds:'Vành mũ cắm lông chim dựng đứng như trên mặt trống đồng: mũ của người cầm đầu ngày hội.'},
  indigoRobe:{n:'Áo vải chàm',t:'wear',slot:'body',warm:16,rain:0.1,dur:900,ds:'Áo vải dệt nhuộm chàm, dài tay, thắt lưng đỏ: ấm và bền hơn áo vỏ cây.'}});
if(typeof EMO==='object')Object.assign(EMO,{featherCrown:'🪶',indigoRobe:'👘'});if(typeof M2V==='object')Object.assign(M2V,{featherCrown:9,indigoRobe:22});
RECIPES.push({id:'featherCrown',out:{featherCrown:1},in:{feather:6,rope:1},st:null,req:['feather','rope']},{id:'indigoRobe',out:{indigoRobe:1},in:{cloth:3,ochre:1},st:null,tool:'needle',req:['cloth']});
{const _cl=charLook;charLook=function(){const L=_cl.apply(this,arguments),w=(S&&S.wear)||{};if(w.body==='indigoRobe'){L.top='#3e4a5e';L.top2='#8a2e1a';L.sleeves='long';}return L;};}
const WEAR_HEAD={leafHat:'non',furHat:'fur',featherCrown:'crown'},WEAR_NECK={shellBeads:['#efe6dc',0],toothNecklace:['#e8dcc0',1],pearlBeads:['#f4f0ea',0],jadeAmulet:['#6a5236',2]},
  WEAR_ACC={stoneBracelet:['#8a8f8c',0],bronzeBracelet:['#b0793a',0.8],goldRing:['#e2b83a',0.9]},
  WEAR_ARM={hideArmor:['#7a5232',0,0],rattanArmor:['#b89a5a',0,0],bronzeArmor:['#b0793a',0.75,1],ironArmor:['#8a8d92',0.8,1]},WEAR_SH={rattanShield:['#b89a5a',3.7],hideShield:['#6e4a2c',3.4]};
function wearMetal(m,k,rough){m.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.metalness=k;o.material.roughness=rough==null?0.4:rough;}});return m;}
// hộp bao (toạ độ cục bộ của khớp) của các lưới gắn trực tiếp vào khớp; deep=true thì lấy cả lưới con cháu có part='skin'
function wearBox(bone,deep){const T=THREE,inv=new T.Matrix4().copy(bone.matrixWorld).invert(),bb=new T.Box3(),tmp=new T.Box3();let any=false;
  const use=m=>{if(!m.isMesh||!m.geometry||m.userData.wearAdd)return;if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();tmp.copy(m.geometry.boundingBox).applyMatrix4(new T.Matrix4().multiplyMatrices(inv,m.matrixWorld));bb.union(tmp);any=true;};
  if(deep)bone.traverse(m=>{if(m.isMesh&&m.userData.part==='skin')use(m);});else bone.children.forEach(use);return any?bb:null;}
function wearAttach(g,w){const R=g&&g.userData&&g.userData.rig;if(!R||!R.head||!R.torso||!w)return;g.updateMatrixWorld(true);const K=K3,add=(bone,m)=>{m.traverse(o=>{o.userData.wearAdd=1;if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});bone.add(m);};
  const hb=wearBox(R.head,true),tb=wearBox(R.torso,false),fb=R.foreL?wearBox(R.foreL,false):null;
  /* ----- đầu ----- */
  const hk=WEAR_HEAD[w.head];if(hk&&hb){const rx=(hb.max.x-hb.min.x)/2,top=hb.max.y,cx=(hb.max.x+hb.min.x)/2,cz=(hb.max.z+hb.min.z)/2;
    if(hk==='non'){add(R.head,K.group(K.cone(rx*2.5,rx*1.55,'#dcc88c',{x:cx,y:top-rx*0.62,z:cz},18),K.cyl(rx*2.5,rx*2.55,0.12,'#b89a5a',{x:cx,y:top-rx*0.66,z:cz},18),K.torus(rx*0.95,0.07,'#8a6a3a',{x:cx,y:top-rx*0.62,z:cz,rx:Math.PI/2},14)));}
    else if(hk==='fur'){add(R.head,K.group(K.dome(rx*1.16,'#6a4a32',{x:cx,y:top-rx*1.05,z:cz-rx*0.05,sz:1.12},12),K.torus(rx*1.14,rx*0.2,'#8a6a48',{x:cx,y:top-rx*1.02,z:cz-rx*0.05,rx:Math.PI/2,sy:1.1},16)));}
    else{const a=[K.torus(rx*1.02,rx*0.13,'#8a2e1a',{x:cx,y:top-rx*0.55,z:cz-rx*0.05,rx:Math.PI/2,sy:1.1},16)];for(let i=0;i<9;i++){const an=(i/8-0.5)*2.5,r=rx*1.0;a.push(K.cone(rx*0.16,rx*(1.5-Math.abs(i-4)*0.12),i%2?'#f2ead8':'#c0452a',{x:cx+Math.sin(an)*r,y:top-rx*0.5,z:cz-rx*0.05+Math.cos(an)*r*1.1,rx:0.22*Math.cos(an),rz:-0.22*Math.sin(an)},5));}add(R.head,K.group(a));}}
  /* ----- cổ ----- */
  const nk=WEAR_NECK[w.neck];if(nk&&hb){const rx=(hb.max.x-hb.min.x)/2,r=rx*0.78,a=[];const N=nk[1]===2?0:14;
    for(let i=0;i<N;i++){const an=i/N*6.283;a.push(nk[1]===1&&i%2?K.cone(0.13,0.42,nk[0],{x:Math.sin(an)*r,y:0.28-0.5*Math.max(0,Math.cos(an))-0.3,z:Math.cos(an)*r*0.95+0.1,rx:Math.PI},4):K.sphere(0.17,nk[0],{x:Math.sin(an)*r,y:0.28-0.5*Math.max(0,Math.cos(an)),z:Math.cos(an)*r*0.95+0.1},6,5));}
    if(nk[1]===2){a.push(K.torus(r*0.98,0.06,nk[0],{y:0.2,z:0.1,rx:Math.PI/2+0.42},16),K.ico(0.32,'#35b07a',{y:-0.62,z:r+0.2,sy:1.3}));}
    add(R.head,K.group(a));}
  /* ----- vòng tay ----- */
  const ac=WEAR_ACC[w.acc];if(ac&&fb){const rr=Math.max(fb.max.x-fb.min.x,fb.max.z-fb.min.z)/2,len=fb.max.y-fb.min.y;const m=K.torus(rr*0.74,rr*0.2,ac[0],{x:(fb.max.x+fb.min.x)/2,y:fb.min.y+len*0.16,z:(fb.max.z+fb.min.z)/2,rx:Math.PI/2},14);if(ac[1])wearMetal(m,ac[1],0.3);add(R.foreL,m);}
  /* ----- giáp ----- */
  const ar=WEAR_ARM[w.armor];if(ar&&tb){const Hh=tb.max.y-tb.min.y,hw=(tb.max.x-tb.min.x)/2,hd=(tb.max.z-tb.min.z)/2,cx=(tb.max.x+tb.min.x)/2,cz=(tb.max.z+tb.min.z)/2,y0=tb.min.y+Hh*0.34,h=Hh*0.5;
    const G2=K.group(K.cyl(hw*1.0,hw*0.88,h,ar[0],{x:cx,y:y0,z:cz,sz:(hd/hw)*1.34},14),K.torus(hw*0.9,hw*0.07,w.armor==='rattanArmor'?'#8a6a3a':'#3a2a1a',{x:cx,y:y0+h*0.5,z:cz,rx:Math.PI/2,sy:(hd/hw)*1.34},16));
    if(w.armor==='rattanArmor')for(let i=1;i<4;i++)G2.add(K.torus(hw*(0.87+0.03*i),hw*0.035,'#8a6a3a',{x:cx,y:y0+h*i/4,z:cz,rx:Math.PI/2,sy:(hd/hw)*1.34},16));
    if(ar[2]){G2.add(K.dome(hw*0.42,ar[0],{x:cx,y:y0+h*0.45,z:cz+hd*1.2,rx:Math.PI/2,sz:0.5},10));}if(ar[1])wearMetal(G2,ar[1],0.38);add(R.torso,G2);
    if(ar[2])['armL','armR'].forEach(n=>{const b=R[n];if(!b)return;const ab=wearBox(b,false);if(!ab)return;const r=Math.max(ab.max.x-ab.min.x,ab.max.z-ab.min.z)/2;add(b,wearMetal(K.dome(r*1.35,ar[0],{x:(ab.max.x+ab.min.x)/2,y:ab.max.y-r*1.15,z:(ab.max.z+ab.min.z)/2},10),ar[1],0.38));});}
  /* ----- khiên ----- */
  const sh=WEAR_SH[w.shield];if(sh&&fb){const rr=(fb.max.x-fb.min.x)/2,len=fb.max.y-fb.min.y,x=fb.min.x-0.35,y=fb.min.y+len*0.5,z=(fb.max.z+fb.min.z)/2,r=sh[1];
    add(R.foreL,K.group(K.cyl(r,r,0.34,sh[0],{x,y,z,rz:Math.PI/2,center:true},18),K.torus(r*0.96,0.14,'#3a2a1a',{x:x-0.02,y,z,ry:Math.PI/2},18),K.dome(r*0.28,w.shield==='rattanShield'?'#8a6a3a':'#b0793a',{x:x-0.17,y,z,rz:Math.PI/2},8)));}}
{const _cm=charModel;charModel=function(){const g=_cm.apply(this,arguments);try{if(P.char2&&S&&S.wear)wearAttach(g,S.wear);}catch(e){console.warn('đồ mặc',e);}return g;};}
{const _pi=playerInit;playerInit=function(){const r=_pi.apply(this,arguments);try{if(typeof HR2==='object')HR2.shotT=-99;}catch(e){}return r;};}

/* ---------- người chơi khác cũng thấy đồ mình mặc ----------
   Presence thêm wr = "đầu,cổ,tay,giáp,khiên" (mã vật phẩm, ô trống để rỗng). Bên nhận kiểm tra từng mã rồi gắn hình lên mô hình của người đó.
   Mã đồ mặc nối vào chuỗi ngoại hình (sau dấu ~) nên đổi đồ thì mô hình người đó tự dựng lại, giống như khi đổi ngoại hình. */
const WEAR_SLOTS=['head','neck','acc','armor','shield','body','back','feet'];
// áo, áo choàng, giày đổi màu và kiểu thân người (cùng bảng với charLook của người chơi)
function wearLook(w){const L={};if(w.body==='coat'){L.top='#8a5e36';L.top2='#5e3a1e';L.sleeves=true;}if(w.body==='furcoat'){L.top='#6a4a32';L.top2='#3a281a';L.cloak='#9a7a58';L.cloak2='#6a5038';}
  if(w.body==='barkTunic'){L.top='#a7885e';L.top2='#6e5236';L.sleeves=false;}if(w.body==='clothTunic'){L.top='#cbb68c';L.top2='#8a4a2a';L.sleeves=true;}if(w.body==='indigoRobe'){L.top='#3e4a5e';L.top2='#8a2e1a';L.sleeves='long';}
  if(w.back==='furCloak'){L.cloak='#8a6a48';L.cloak2='#5a4430';}if(w.back==='rainCape'){L.cloak='#8f8a4c';L.cloak2='#66622f';}if(w.feet==='boots')L.boots='#4a3020';if(w.feet==='sandals')L.boots='#7a5232';if(w.feet==='furBoots')L.boots='#5a4430';return L;}
function wearPres(){const w=(S&&S.wear)||{};const s=WEAR_SLOTS.map(k=>typeof w[k]==='string'?w[k]:'').join(',');return s.replace(/,/g,'')?s:'';}
function wearDec(s){const a=String(s||'').split(','),w={};WEAR_SLOTS.forEach((k,i)=>{const id=a[i];if(id&&/^[A-Za-z0-9]{1,24}$/.test(id)&&ITEMS[id]&&ITEMS[id].t==='wear'&&(ITEMS[id].slot||'body')===k)w[k]=id;});return w;}
{const _vp=mpValPres;mpValPres=function(p){const v=_vp.apply(this,arguments);try{const wr=v&&p&&p.presence&&p.presence.wr;if(typeof wr==='string'&&wr.length<=140&&/^[A-Za-z0-9,]+$/.test(wr)&&Object.keys(wearDec(wr)).length)v.lk=String(v.lk)+'~'+wr;}catch(e){}return v;};}
{const _mm=mpModel;mpModel=function(lk){if(typeof lk==='string'&&lk.indexOf('~')>=0){const i=lk.indexOf('~'),base=lk.slice(0,i),w=wearDec(lk.slice(i+1)),L=wearLook(w);let o=null;
    // có áo / áo choàng / giày: tự dựng mô hình với màu và kiểu của món đó (giống cách dựng nhân vật của chính người chơi)
    if(Object.keys(L).length&&K3.char2){try{const j=base.indexOf('|'),l=j>=0?(+base.slice(0,j)|0):(+base|0),a=j>=0&&typeof crDec==='function'?crDec(base.slice(j+1)):null;
        const q=Object.assign({sleeves:true},(LOOKS[l]||LOOKS[0]).o,LOOK2[l]||{},L);if(w.body){q.bare=false;}if(a){q.app=a;q.crWear=!!w.body;}o=K3.char2(q);o.traverse(m=>{if(m.isMesh)m.castShadow=true;});try{seasonPatchAll(o);}catch(e){}}catch(e){o=null;}}
    if(!o)o=_mm(base.indexOf('|')>=0?base:(+base|0));try{wearAttach(o,w);}catch(e){}return o;}return _mm(lk);};}
