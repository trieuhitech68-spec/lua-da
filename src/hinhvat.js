/* ===================== HÌNH VẬT PHẨM ĐÚNG VỚI MÓN ĐỒ =====================
   Trước: món nào chưa có mô hình riêng thì hiện biểu tượng cảm xúc thay thế (liềm là mặt trăng, giáo là đinh ba, mũ đồng là mũ cứu hộ, giáp da là áo phản quang…).
   Giờ: · Vũ khí, dụng cụ: chụp đúng mô hình mà nhân vật cầm trên tay.
        · Quần áo, giáp, mũ, khiên, giày, trang sức: dựng một người mẫu mặc đúng món đó rồi chụp cận phần cơ thể tương ứng
          (mũ → đầu, áo/giáp → thân, áo choàng → lưng, giày → chân, vòng tay → cẳng tay, khiên → tay trái, vòng cổ → cổ ngực).
   Hình chụp một lần cho mỗi món rồi giữ lại; món mới thêm sau này tự có hình theo cùng cách. */
function hvShot(id,g,bb,back){const T=THREE;if(!ICO.R){try{iconMake('stick');}catch(e){}}if(!ICO.R||!ICO.S)return false;g.updateMatrixWorld(true);bb=bb||new T.Box3().setFromObject(g);if(bb.isEmpty())return false;
  const c=bb.getCenter(new T.Vector3()),sz=bb.getSize(new T.Vector3()),R=Math.max(sz.x,sz.y,sz.z)*0.54+1,cam=new T.PerspectiveCamera(30,1,0.1,4000),d=R/Math.tan(15*Math.PI/180);
  cam.position.set(c.x,c.y+d*(back?0.3:0.34),c.z+d*0.94);cam.lookAt(c);cam.layers.enableAll();ICO.S.add(g);ICO.R.render(ICO.S,cam);ICO.S.remove(g);
  const url=ICO.R.domElement.toDataURL('image/png');ICO.url[id]=url;document.querySelectorAll(`[data-ic="${id}"]`).forEach(el=>{const im=el.querySelector('img');if(im)im.src=url;else{const b=el.querySelector('b');if(b)b.remove();const n=document.createElement('img');n.src=url;n.alt='';n.draggable=false;el.appendChild(n);}});return true;}
function hvBox(objs,pad){const T=THREE,bb=new T.Box3();for(const o of objs){if(!o)continue;o.traverse(m=>{if(m.isMesh&&m.geometry){if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();bb.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld));}});}if(pad)bb.expandByScalar(pad);return bb;}
function hvWear(id){const I=ITEMS[id],T=THREE;if(typeof charModel!=='function'||!S)return false;const w0=S.wear,c2=P.char2;let g=null;S.wear={};S.wear[I.slot]=id;try{g=charModel();}catch(e){g=null;}finally{S.wear=w0;P.char2=c2;}
  const R=g&&g.userData&&g.userData.rig;if(!R||!R.torso||!R.head)return false;g.traverse(o=>{o.layers.set(0);});try{if(K3.char2Neutral)K3.char2Neutral(R);}catch(e){}
  const sl=I.slot,back=sl==='back';g.rotation.y=back?Math.PI-0.55:sl==='shield'?0.75:sl==='acc'?0.6:-0.45;g.position.set(0,0,0);g.updateMatrixWorld(true);
  const onlyOwn=o=>{const a=[];for(const m of o.children)if(m.isMesh)a.push(m);return a;};let bb;
  if(sl==='head'){bb=hvBox([R.head],1.2);}
  else if(sl==='neck'){bb=hvBox([R.head]);const y=bb.min.y;bb=new T.Box3(new T.Vector3(bb.min.x-2.5,y-5.5,bb.min.z-2),new T.Vector3(bb.max.x+2.5,y+3.5,bb.max.z+2));}
  else if(sl==='feet'){bb=hvBox([R.shinL,R.shinR],1);}
  else if(sl==='acc'){bb=hvBox([R.foreL],1.2);}
  else if(sl==='shield'){bb=hvBox([R.armL],2);}
  else{/* áo, giáp, áo choàng: thân + hai tay, không lấy đầu */const hb=hvBox([R.head]);bb=hvBox([R.torso]);bb.max.y=Math.min(bb.max.y,hb.min.y+1.5);const lg=hvBox([R.legL,R.legR]);if(sl==='body'||back)bb.min.y=Math.min(bb.min.y,lg.max.y-6);bb.expandByScalar(0.8);}
  return hvShot(id,g,bb,back);}
/* dụng cụ, vũ khí dài mảnh: xoay cho nằm chéo khung hình và phóng vừa khít (trước chụp nguyên chiều dài nên chỉ thấy một vạch mảnh) */
const HV_TOOL={spear:1,club:1,knife:1,axe:1,pick:1,bow:1,sickle:1,hammer:1,torch:1,rod:1};
function hvTool(id){const T=THREE,I=ITEMS[id];if(!HV_TOOL[I.tool]&&id!=='digStick')return false;const g=model(['tool',id]);if(!g)return false;g.updateMatrixWorld(true);const b0=new T.Box3().setFromObject(g),c0=b0.getCenter(new T.Vector3()),s0=b0.getSize(new T.Vector3());
  const inner=new T.Group(),outer=new T.Group();g.position.sub(c0);inner.add(g);outer.add(inner);/* đưa trục dài nhất về trục dọc rồi nghiêng 40° */
  if(s0.z>=s0.x&&s0.z>=s0.y)inner.rotation.x=-Math.PI/2;else if(s0.x>=s0.y)inner.rotation.z=Math.PI/2;outer.rotation.set(0,I.tool==='bow'?0.3:-0.5,-0.7);outer.updateMatrixWorld(true);
  if(!ICO.R){try{iconMake.__base('stick');}catch(e){}}if(!ICO.R||!ICO.S)return false;const bb=new T.Box3().setFromObject(outer),c=bb.getCenter(new T.Vector3()),sz=bb.getSize(new T.Vector3()),R=Math.max(sz.x,sz.y)*0.56+0.6,cam=new T.PerspectiveCamera(30,1,0.1,4000),d=R/Math.tan(15*Math.PI/180);
  cam.position.set(c.x,c.y+d*0.08,c.z+d);cam.lookAt(c);cam.layers.enableAll();ICO.S.add(outer);ICO.R.render(ICO.S,cam);ICO.S.remove(outer);
  const url=ICO.R.domElement.toDataURL('image/png');ICO.url[id]=url;document.querySelectorAll(`[data-ic="${id}"]`).forEach(el=>{const im=el.querySelector('img');if(im)im.src=url;else{const bq=el.querySelector('b');if(bq)bq.remove();const n=document.createElement('img');n.src=url;n.alt='';n.draggable=false;el.appendChild(n);}});return true;}
{const _im=iconMake;iconMake=function(id){try{const I=ITEMS[id];if(I&&I.t==='tool'&&G.on&&(HV_TOOL[I.tool]||id==='digStick')){if(!ICO.R)_im.call(this,'stick');if(hvTool(id))return;}}catch(e){if(!ICO.hvE){ICO.hvE=1;console.warn('hình dụng cụ',e);}}
  _im.apply(this,arguments);try{if(ICO.url[id])return;const I=ITEMS[id];if(!I||!G.on)return;
    if(I.t==='wear'&&I.slot){if(!hvWear(id)){/* người mẫu chưa sẵn sàng: thử lại sau */delete ICO.url[id];}}}catch(e){if(!ICO.hvE){ICO.hvE=1;console.warn('hình vật phẩm',e);}}};iconMake.__base=_im;}
/* vài biểu tượng thay thế sai hẳn (món chưa có hình riêng) */
if(typeof EMO==='object')Object.assign(EMO,{birdRaw:'🐦',birdCooked:'🍗',iron:'⬛',meatDried:'🥓',banhChung:'🍙',charcoalWater:'🥣',herbPoultice:'🍃',turmericPowder:'🟠'});
