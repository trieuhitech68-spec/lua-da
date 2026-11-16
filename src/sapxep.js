/* ===================== BẢNG CHẾ TẠO XẾP LẠI CHO GỌN =====================
   Trước: mở Chế tạo là một danh sách phẳng cả trăm công thức (trên điện thoại dài hơn 20 màn hình), hai hàng nút lọc chiếm 5-6 dòng.
   Giờ, khi chưa lọc gì (nhóm "Tất cả", nơi làm "Tất cả", ô tìm trống):
     · Trên cùng là mục "✅ Làm được ngay": những món đang đủ nguyên liệu và đứng đúng chỗ làm.
     · Bên dưới mỗi NHÓM một mục gập (Dụng cụ, Vũ khí, Mặc, Đồ ăn, Thuốc, Vật liệu, Khác), ghi số công thức; bấm mới mở. Game nhớ mục đang mở.
   Bấm nút lọc theo nhóm / nơi làm hoặc gõ tìm thì vẫn hiện danh sách phẳng như cũ. Hai hàng nút lọc thành một dòng vuốt ngang. */
const SXP={ORD:['cu','vk','mac','an','th','vl','khac']};
function sxPlain(){try{const q=document.querySelector('#mxq');return (G.c5cr||'all')==='all'&&!G.cst&&!(q&&q.value.trim());}catch(e){return false;}}
function sxUngroup(){const body=document.querySelector('#panel .p-body'),w=body&&body.querySelector('.sx-wrap');if(!w)return;const g=body.querySelector('.u8-cg.sx-src');if(g){w.querySelectorAll('.rc').forEach(c=>g.appendChild(c));g.classList.remove('sx-src');g.style.display='';}w.remove();}
function sxCraft(){try{if(typeof G==='undefined'||G.panel!=='bag'||G.ptab!=='craft')return;const body=document.querySelector('#panel .p-body');if(!body)return;if(!sxPlain()){sxUngroup();return;}if(body.querySelector('.sx-wrap'))return;
    const g=body.querySelector('.u8-cg');if(!g)return;const cards=[...g.querySelectorAll(':scope > .rc[data-mxr]')];if(cards.length<10)return;
    const names={};for(const [k,n,ic] of C5CATS)names[k]=ic+' '+n;const now=cards.filter(c=>!c.classList.contains('dim')),by={};cards.filter(c=>c.classList.contains('dim')).forEach(c=>{const k=c5RcCat(c.dataset.mxr);(by[k]=by[k]||[]).push(c);});
    const w=document.createElement('div');w.className='sx-wrap';const sec=(key,title,list,open,cls)=>{if(!list.length)return;const d=document.createElement('details');d.className='sx-sec'+(cls?' '+cls:'');d.dataset.k=key;if(open)d.open=true;d.innerHTML=`<summary><b>${title}</b> <small>${list.length}</small></summary>`;const gr=document.createElement('div');gr.className='u8-grid u8-cg';list.forEach(c=>gr.appendChild(c));d.appendChild(gr);w.appendChild(d);};
    const op=G.sxO||{};sec('now','✅ Làm được ngay',now,op.now!==0,'sx-now');if(!now.length){const p=document.createElement('p');p.className='small muted sx-none';p.textContent='Chưa có món nào đủ nguyên liệu để làm ngay. Mở từng nhóm bên dưới để xem cần gì, hoặc bấm 🤖 Tự kiếm & làm.';w.appendChild(p);}
    for(const k of SXP.ORD)sec(k,(names[k]||k)+' <span class="small muted">chưa đủ nguyên liệu / chưa đúng chỗ làm</span>',by[k]||[],op[k]===1);
    g.before(w);g.classList.add('sx-src');g.style.display='none';}catch(e){if(!SXP.err){SXP.err=1;console.warn('xếp chế tạo',e);}}}
{const _uo=uiOpen;uiOpen=function(){const r=_uo.apply(this,arguments);try{sxCraft();}catch(e){}return r;};}
setInterval(()=>{try{if(typeof G!=='undefined'&&G.on&&G.panel==='bag'&&G.ptab==='craft')sxCraft();}catch(e){}},500);
document.addEventListener('input',e=>{try{if(e.target&&e.target.id==='mxq')sxUngroup();}catch(er){}},true);
document.addEventListener('toggle',e=>{const t=e.target;if(t&&t.classList&&t.classList.contains('sx-sec')){G.sxO=G.sxO||{};G.sxO[t.dataset.k]=t.open?1:0;}},true);
{const st=document.createElement('style');st.textContent=`#game .panel .sx-wrap{display:flex;flex-direction:column;gap:8px;margin-top:6px}#game .panel .sx-sec{border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(20,13,8,.4)}#game .panel .sx-sec.sx-now{border-color:rgba(120,220,90,.55);background:rgba(120,220,90,.06)}
#game .panel .sx-sec>summary{cursor:pointer;list-style:none;padding:10px 12px;display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 8px}#game .panel .sx-sec>summary::-webkit-details-marker{display:none}#game .panel .sx-sec>summary b{font-size:14.5px;color:#ffe2a8}#game .panel .sx-sec>summary b:before{content:'▸ ';color:#f2c55a}#game .panel .sx-sec[open]>summary b:before{content:'▾ '}
#game .panel .sx-sec>summary small{font-weight:800;color:#2a1608;background:#f2c55a;border-radius:9px;padding:0 7px;font-size:12px}#game .panel .sx-sec>summary b .small{font-weight:400;font-size:11.5px;margin-left:4px}#game .panel .sx-sec>.u8-cg{padding:0 8px 8px}#game .panel .sx-none{margin:0 4px}
#game .panel .p-body>.chipsel{flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:thin;padding-bottom:4px}#game .panel .p-body>.chipsel>.tb{flex:0 0 auto;white-space:nowrap}
@media (max-width:520px){#game .panel .sx-sec>summary b .small{display:none}}`;document.head.appendChild(st);}
