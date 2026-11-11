/* ===================== ui6: SẮP XẾP LẠI MENU ☰ VÀ BẢNG XÂY DỰNG =====================
   - Ngăn kéo ☰ chia nhóm có tiêu đề: Nhân vật (Cơ thể, Nhật ký) · Làng & liên minh (Dân làng, Làng, Liên minh) · Thế giới (Bản đồ, Ghi chép)
     · Hệ thống (Cài đặt, Dừng). Nút do mô-đun khác thêm sau mà chưa có nhóm thì rơi vào nhóm cuối.
   - Bảng Xây dựng: bốn hộp công cụ (Lộ trình, Nâng cấp & sửa chữa, Sửa công trình, San nền) trước đây xếp chồng chiếm hết màn hình đầu;
     giờ gộp thành một hàng bốn nút, bấm nút nào mở hộp đó, danh sách công trình hiện ngay bên dưới. */
const UI6_ORD={l4:11,journal:12,dan:21,m2:22,clan:23,map:31,notes:32,settings:41};
const UI6_H=[[10,'Nhân vật'],[20,'Làng & liên minh'],[30,'Thế giới'],[40,'Hệ thống']];
function ui6Menu(){const m=document.querySelector('#menu .ui5-more');if(!m)return;
  if(!m.querySelector('.ui6-h'))for(const [o,n] of UI6_H){const s=document.createElement('span');s.className='ui6-h';s.style.order=o;s.textContent=n;m.appendChild(s);}
  for(const b of m.querySelectorAll('button')){const k=b.getAttribute('data-ui'),o=UI6_ORD[k]||(b.hasAttribute('data-sp')?49:45);if(b.style.order!==String(o))b.style.order=o;}}
setInterval(()=>{try{if(G.on)ui6Menu();}catch(e){}},1200);
const UI6_TOOLS=[['road','🧭','Lộ trình'],['upg','⬆️','Nâng cấp'],['ed','🏗️','Sửa, dời'],['land','🟫','San nền']];
function ui6Build(){const body=document.querySelector('#panel .p-body');if(!body||G.panel!=='build'||body.querySelector('.ui6-tools'))return;const boxes=[...body.querySelectorAll(':scope > .landbox')];if(boxes.length<2)return;
  const kind=b=>b.classList.contains('tr-road')?'road':b.classList.contains('edbox')?'ed':b.querySelector('[data-a="upopen"]')?'upg':b.querySelector('[data-a="land"]')?'land':null;
  const map={};boxes.forEach(b=>{const k=kind(b);if(k){map[k]=b;b.classList.add('ui6-box');b.dataset.k=k;if(k==='road')b.open=true;}});
  const bar=document.createElement('div');bar.className='ui6-tools';bar.innerHTML=UI6_TOOLS.filter(t=>map[t[0]]).map(([k,ic,n])=>`<button class="tb sm" data-a="ui6tool" data-k="${k}"><span>${ic}</span>${n}</button>`).join('');
  body.insertBefore(bar,body.firstChild);ui6Show(G.ui6tool||null);}
function ui6Show(k){G.ui6tool=k;const body=document.querySelector('#panel .p-body');if(!body)return;body.querySelectorAll('.ui6-box').forEach(b=>{b.hidden=b.dataset.k!==k;});body.querySelectorAll('[data-a="ui6tool"]').forEach(b=>b.classList.toggle('on',b.dataset.k===k));}
{const _uo=uiOpen;uiOpen=function(k,o,keep){const r=_uo.apply(this,arguments);try{if(G.panel==='build')ui6Build();}catch(e){console.warn('ui6',e);}return r;};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="ui6tool"]');if(!b)return;e.stopImmediatePropagation();sfx('pick');ui6Show(G.ui6tool===b.dataset.k?null:b.dataset.k);},true);
{const st=document.createElement('style');st.textContent=`#game .ui5-more .ui6-h{grid-column:1/-1;font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#f2c55a;opacity:.85;padding:2px 2px 0}
#game .ui5-more .ui6-h:first-of-type{padding-top:0}
@media (pointer:fine) and (min-width:1000px) and (min-height:560px){#game .ui5-more .ui6-h{display:none}}
@media (max-width:600px){#game .menu .ui5-more{top:calc(-1 * var(--ui5-mini))!important;bottom:auto!important;transform-origin:100% 0;max-height:calc(100dvh - 2 * var(--u-st) - 8px);overflow-y:auto;gap:5px}#game .menu .ui5-more>button{min-height:54px}}
.ui6-tools{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px}.ui6-tools .tb{display:flex;flex-direction:column;align-items:center;gap:2px;min-height:52px;padding:6px 2px;font-size:11.5px;white-space:nowrap}.ui6-tools .tb span{font-size:18px;line-height:1}
.ui6-box[hidden]{display:none!important}.ui6-box.tr-road>summary{pointer-events:none}`;document.head.appendChild(st);}
