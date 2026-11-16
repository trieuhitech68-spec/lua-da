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
/* ===================== BỘ PHẬN RỜI TRONG BẢNG XÂY: XẾP THEO CÔNG NĂNG =====================
   Trước: 13 thẻ ngang hàng (Cơ bản, Móng & sàn, Tường, Mái, Khung, Cửa, Nội thất, Bếp & kho, Sân vườn, Chăn nuôi, Phòng thủ, Trang trí…), món có tác dụng lẫn với món chỉ để ngắm.
   Giờ còn 4 thẻ lớn:
     ⚙️ Có công năng (mở sẵn): mọi món DÙNG ĐƯỢC, chia mục theo việc: Lửa & nấu nướng · Chế tác · Kho chứa · Ngủ nghỉ · Ánh sáng · Nước · Trồng trọt & bẫy · Chăn nuôi · Phòng thủ & rào chắn · Lễ hội.
     🧱 Dựng nhà: bộ phận để tự ghép nhà, chọn tiếp Móng & sàn / Tường / Mái / Khung & cầu thang / Cửa.
     🎨 Trang trí: mọi món chỉ để bày, lối đi, tượng, cột… gom một chỗ.
     📐 Bản mẫu: như cũ.
   Gõ vào ô tìm thì tìm trong tất cả như cũ. */
SXP.P=[['lua','🔥 Lửa & nấu nướng'],['che','🛠️ Chế tác'],['kho','📦 Kho chứa'],['ngu','🛏️ Ngủ nghỉ'],['sang','🕯️ Ánh sáng'],['nuoc','💧 Nước'],['trong','🌱 Trồng trọt & bẫy'],['nuoi','🐔 Chăn nuôi'],['thu','🛡️ Phòng thủ & rào chắn'],['le','🥁 Lễ hội & thờ cúng']];
SXP.G=[['cn','⚙️','Có công năng'],['nha','🧱','Dựng nhà'],['tt','🎨','Trang trí'],['bp','📐','Bản mẫu']];SXP.NHA=['mong','tuong','mai','khung','cua'];
function sxPurpose(d){const c=b4cat(d),id=d.id;if(d.fuel)return 'lua';if(d.st)return 'che';if(d.bed)return 'ngu';if(c==='chan')return 'nuoi';if(c==='thu'||/^(fence|wattleFence|dryStoneWall)$/.test(id))return 'thu';if(d.store)return 'kho';if(/^(well|wellStone|rainBarrel|channel)$/.test(id))return 'nuoc';
  if(d.farm||/^(paddy|beeBox|scarecrow|trap|fishTrap|fishPond)$/.test(id))return 'trong';if(d.drum||/^(altar|tomb|drumStage|lithophone)$/.test(id))return 'le';if(d.light)return 'sang';return null;}
function sxGroupOf(d){if(sxPurpose(d))return 'cn';return SXP.NHA.includes(b4cat(d))?'nha':'tt';}
function sxBuild(){try{if(typeof G==='undefined'||G.panel!=='build')return;const body=document.querySelector('#panel .p-body'),tabs=body&&body.querySelector('.b4tabs'),grid=body&&body.querySelector('.b4grid');if(!tabs||!grid)return;
    const known=BUILD.filter(b=>b.id[0]!=='_'),cards=[...grid.querySelectorAll('.bc[data-c4]:not(.b4bp)')];if(cards.length!==known.length)return;
    if(!cards[0].dataset.sxg)cards.forEach((c,i)=>{const d=known[i];c.dataset.sxg=sxGroupOf(d);c.dataset.sxp=sxPurpose(d)||'';});
    let cur=G.sxB||'cn';if(cur==='nha'&&!SXP.NHA.includes(G.bcat)){G.bcat='tuong';grid.dataset.cat='tuong';}if(cur==='bp'&&grid.dataset.cat!=='bp'){G.sxB=cur='cn';}
    let nav=body.querySelector('.sx-nav');if(!nav){nav=document.createElement('div');nav.className='chipsel sx-nav';const cnt=g=>cards.filter(c=>c.dataset.sxg===g&&!c.classList.contains('lock')).length;nav.innerHTML=SXP.G.map(([g,ic,n])=>`<button class="tb sm" data-a="sxg" data-g="${g}">${ic} ${n}${g==='bp'?'':` <small>${cnt(g)}</small>`}</button>`).join('');tabs.before(nav);}
    nav.querySelectorAll('[data-a="sxg"]').forEach(b=>b.classList.toggle('on',b.dataset.g===cur));
    const q=(G.b4q||'').trim();grid.querySelectorAll('.sx-h').forEach(h=>h.remove());
    tabs.style.display=cur==='nha'&&!q?'':'none';if(cur==='nha')tabs.querySelectorAll('[data-a="bcat"]').forEach(b=>{b.style.display=SXP.NHA.includes(b.dataset.c)?'':'none';b.classList.toggle('on',b.dataset.c===G.bcat);});
    if(q)return;/* đang tìm: để bộ tìm sẵn có lo */
    {const nn=body.querySelector('.b4none');if(nn)nn.hidden=true;}
    if(cur==='nha'){cards.forEach(c=>{c.style.display=c.dataset.sxg==='nha'&&c.dataset.c4===G.bcat?'':'none';});grid.querySelectorAll('.b4bp,.b4prjs').forEach(e=>e.style.display='none');return;}
    if(cur==='bp')return;grid.querySelectorAll('.b4bp,.b4prjs').forEach(e=>e.style.display='none');grid.querySelectorAll(':scope > p').forEach(e=>e.style.display='none');
    const host=cards[0].parentNode;if(cur==='tt'){cards.forEach(c=>{c.style.display=c.dataset.sxg==='tt'?'':'none';});return;}
    for(const [k,title] of SXP.P){const L=cards.filter(c=>c.dataset.sxp===k);if(!L.length)continue;const h=document.createElement('div');h.className='sx-h';h.innerHTML=`<b>${title}</b> <small>${L.filter(c=>!c.classList.contains('lock')).length}/${L.length}</small>`;host.appendChild(h);L.forEach(c=>{c.style.display='';host.appendChild(c);});}
    cards.forEach(c=>{if(c.dataset.sxg!=='cn')c.style.display='none';});}catch(e){if(!SXP.errB){SXP.errB=1;console.warn('xếp bảng xây',e);}}}
{const _uo=uiOpen;uiOpen=function(){const r=_uo.apply(this,arguments);try{sxBuild();}catch(e){}return r;};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="sxg"]');if(!b||!S)return;e.stopImmediatePropagation();const g=b.dataset.g;G.sxB=g;if(g==='bp')G.bcat='bp';else if(g==='nha'){if(!SXP.NHA.includes(G.bcat))G.bcat=G.sxNha||'tuong';}else if(G.bcat==='bp')G.bcat='co';try{sfx('pick');}catch(er){}uiOpenRefresh();},true);
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('.b4tabs [data-a="bcat"]');if(b&&SXP.NHA.includes(b.dataset.c))G.sxNha=b.dataset.c;},true);
document.addEventListener('input',e=>{try{if(e.target&&e.target.id==='b4q')setTimeout(sxBuild,0);}catch(er){}},true);
{const st=document.createElement('style');st.textContent=`#game .panel .sx-nav{margin:6px 0}#game .panel .sx-nav .tb{font-weight:800}#game .panel .sx-nav .tb small{opacity:.7;margin-left:4px;font-size:10.5px}
#game .panel .sx-h{grid-column:1/-1;margin:8px 0 0;padding:4px 2px 2px;border-bottom:1px solid rgba(242,197,90,.3);font-size:13.5px;color:#ffe2a8}#game .panel .sx-h small{font-weight:700;color:#b8e07a;margin-left:6px;font-size:11.5px}`;document.head.appendChild(st);}
