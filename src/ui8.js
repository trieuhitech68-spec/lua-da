/* ===================== ui8: BẢNG XÂY DỰNG DẠNG LƯỚI + ẢNH CÔNG TRÌNH THẬT =====================
   - Mỗi công trình một ô vuông trong lưới 2 cột (máy rộng: 3-4 cột): ảnh chụp từ chính mô hình 3D của nó (thay biểu tượng emoji),
     tên, kích thước, giá gọn một dòng. Mô tả dài ẩn đi: bấm nút ⓘ ở góc ô để xem, bấm vào ô để xây như cũ.
   - Ảnh dựng dần (mỗi khung hình vài cái) bằng bộ dựng biểu tượng sẵn có, nhớ lại trong phiên chơi. */
const U8={url:{},q:[],busy:false};
function u8Make(id){const T=THREE;if(!ICO.R){try{iconMake('stick');}catch(e){}}if(!ICO.R||!ICO.S){U8.url[id]='';return;}let g=null;try{g=model(['piece',id]);}catch(e){}if(!g){U8.url[id]='';return;}
  try{g.rotation.y=-0.62;g.updateMatrixWorld(true);const bb=new T.Box3().setFromObject(g);if(bb.isEmpty()){U8.url[id]='';return;}const c=bb.getCenter(new T.Vector3()),sz=bb.getSize(new T.Vector3()),R=Math.max(sz.x,sz.y,sz.z)*0.6+1;
    const cam=new T.PerspectiveCamera(30,1,0.1,6000),d=R/Math.tan(15*Math.PI/180);cam.position.set(c.x,c.y+d*0.5,c.z+d*0.86);cam.lookAt(c);ICO.S.add(g);ICO.R.render(ICO.S,cam);ICO.S.remove(g);
    const url=ICO.R.domElement.toDataURL('image/png');U8.url[id]=url;document.querySelectorAll('.u8-im[data-p="'+id+'"]').forEach(el=>{el.innerHTML='<img src="'+url+'" alt="" draggable="false">';});
    g.traverse(o=>{if(o.isMesh&&o.geometry&&!o.geometry.userData.shared){try{o.geometry.dispose();}catch(e){}}});}catch(e){U8.url[id]='';}}
function u8Pump(){if(U8.busy||!U8.q.length)return;U8.busy=true;requestAnimationFrame(()=>{const t0=performance.now();try{while(U8.q.length&&performance.now()-t0<14)u8Make(U8.q.shift());}catch(e){}U8.busy=false;if(U8.q.length)setTimeout(u8Pump,30);});}
function u8Build(){const body=document.querySelector('#panel .p-body');if(!body||G.panel!=='build')return;const cards=[...body.querySelectorAll('.bc')];if(!cards.length||body.querySelector('.u8-grid'))return;
  const grid=document.createElement('div');grid.className='u8-grid';cards[0].before(grid);
  for(const c of cards){grid.appendChild(c);if(c.dataset.u8)continue;c.dataset.u8='1';const id=c.dataset.b,ic=c.querySelector(':scope > .ic');
    if(id&&ic){const u=U8.url[id];ic.classList.add('u8-im');ic.dataset.p=id;if(u)ic.innerHTML='<img src="'+u+'" alt="" draggable="false">';else if(u===undefined&&!U8.q.includes(id))U8.q.push(id);}
    const box=c.querySelector(':scope > div');if(!box)continue;const descs=[...box.querySelectorAll(':scope > .small, :scope > span.small')];const txt=descs.map(d=>d.textContent).join(' ').trim();descs.forEach(d=>d.classList.add('u8-d'));
    if(txt&&!c.classList.contains('lock')){const i=document.createElement('span');i.className='u8-i';i.textContent='ⓘ';i.setAttribute('role','button');i.setAttribute('aria-label','Xem mô tả');c.appendChild(i);}}
  u8Pump();}
{const _uo=uiOpen;uiOpen=function(k,o,keep){const r=_uo.apply(this,arguments);try{if(G.panel==='build')u8Build();}catch(e){console.warn('ui8',e);}return r;};}
document.addEventListener('click',e=>{const i=e.target&&e.target.closest&&e.target.closest('.u8-i');if(!i)return;e.stopImmediatePropagation();e.preventDefault();const c=i.closest('.bc');if(c){const on=!c.classList.contains('u8-open');document.querySelectorAll('.bc.u8-open').forEach(x=>x.classList.remove('u8-open'));c.classList.toggle('u8-open',on);}},true);
// ô tìm kiếm lọc lại thì giữ lưới (b4Filter chỉ ẩn/hiện thẻ)
{const st=document.createElement('style');st.textContent=`#game .panel .u8-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
@media (min-width:620px){#game .panel .u8-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media (min-width:900px){#game .panel .u8-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
#game .panel .u8-grid .bc{position:relative;display:flex;flex-direction:column;align-items:stretch;gap:4px;padding:8px 8px 9px;margin:0;border-radius:14px;text-align:left;min-height:0;background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.09)}
#game .panel .u8-grid .bc[hidden]{display:none}#game .panel .u8-grid .bc.dim{opacity:.62}
#game .panel .u8-grid .bc>.ic{align-self:center;width:100%;height:92px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:radial-gradient(circle at 50% 62%,rgba(242,197,90,.16),rgba(0,0,0,.18) 70%)}
#game .panel .u8-grid .bc>.ic img{width:92px;height:92px;object-fit:contain}#game .panel .u8-grid .bc>.ic b{font-size:40px}
#game .panel .u8-grid .bc>div{display:flex;flex-direction:column;gap:3px;min-width:0}#game .panel .u8-grid .bc>div>b{font-size:13px;line-height:1.2;display:flex;flex-wrap:wrap;gap:2px 5px;align-items:baseline}
#game .panel .u8-grid .bc .b4tag{font-size:10px;font-weight:600;opacity:.7}#game .panel .u8-grid .bc .chips{display:flex;flex-wrap:wrap;gap:3px}#game .panel .u8-grid .bc .chip{padding:1px 6px 1px 3px;font-size:11px;gap:2px}#game .panel .u8-grid .bc .chip .ic{width:16px;height:16px}#game .panel .u8-grid .bc .chip .ic img{width:16px;height:16px}
#game .panel .u8-grid .bc .u8-d{display:none;font-size:11.5px;line-height:1.35}#game .panel .u8-grid .bc.u8-open .u8-d,#game .panel .u8-grid .bc.lock .u8-d{display:block}#game .panel .u8-grid .bc.u8-open{grid-column:1/-1;border-color:rgba(242,197,90,.6)}
.u8-i{position:absolute;top:4px;right:4px;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;color:#f2c55a;background:rgba(0,0,0,.35)}`;document.head.appendChild(st);}
// dựng sẵn ảnh các công trình đã biết trong lúc chơi (mỗi 1,5 giây vài cái) để mở bảng là có ảnh ngay
setInterval(()=>{try{if(!G.on||!S||G.panel||U8.q.length||typeof BUILD==='undefined')return;let n=0;for(const b of BUILD){if(n>=3)break;if(S.known['b:'+b.id]&&U8.url[b.id]===undefined){U8.q.push(b.id);n++;}}if(n)u8Pump();}catch(e){}},1500);
{const st=document.createElement('style');st.textContent=`#game .panel .u8-grid .bc.lock{flex-direction:row;align-items:center;gap:8px;padding:7px 8px;opacity:.55}#game .panel .u8-grid .bc.lock>.ic{width:34px;height:34px;flex:none;background:none}#game .panel .u8-grid .bc.lock>.ic b{font-size:20px}#game .panel .u8-grid .bc.lock>div>b{font-size:12px}#game .panel .u8-grid .bc.lock .u8-d{font-size:10.5px}`;document.head.appendChild(st);}
