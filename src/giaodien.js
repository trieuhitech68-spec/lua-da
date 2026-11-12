/* ===================== BỐ CỤC ĐIỆN THOẠI (cầm dọc): cân đối như các game chiến thuật =====================
   · Trên cùng: thẻ thông tin rộng ngang (6 thanh chỉ số xếp 3 cột), bản đồ nhỏ ở góc phải.
   · Đáy màn hình: thanh chức năng có chữ (Túi · Chế tạo · Xây · Nhân vật · Thêm) thay cho cột nút bên phải.
   · Ô đồ nhanh, nút hành động, la bàn, thanh làm việc dời lên trên thanh chức năng.
   Chỉ áp dụng cho màn hình hẹp cầm dọc; máy tính và cầm ngang giữ nguyên. */
(function(){const st=document.createElement('style');st.id='gdCss';st.textContent=`
@media (max-width:560px) and (orientation:portrait){
 #game{--gd-nav:54px;--u-sb:calc(max(6px,env(safe-area-inset-bottom)) + var(--gd-nav) + 6px)}
 /* thanh chức năng đáy */
 #game .menu{top:auto!important;left:0!important;right:0!important;bottom:0!important;flex-direction:row!important;align-items:stretch!important;gap:0!important;z-index:9;opacity:1!important;
   padding:3px 6px max(3px,env(safe-area-inset-bottom));background:linear-gradient(180deg,rgba(30,21,13,.9),rgba(14,9,6,.96));border-top:1px solid rgba(242,197,90,.4);box-shadow:0 -4px 14px rgba(0,0,0,.35)}
 #game .menu>button{flex:1 1 0;width:auto!important;min-width:0;height:48px!important;display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:0;
   background:none!important;border:0!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-radius:10px;position:relative}
 #game .menu>button:active,#game .menu>button.on{background:rgba(242,197,90,.16)!important}
 #game .menu>button span{font-size:22px;line-height:1.05;padding:0}
 #game .menu>button i{display:block!important;font-style:normal;font-size:10.5px;font-weight:700;color:#ecdcb8;white-space:nowrap;line-height:1.15}
 #game .menu>button+button::before{content:"";position:absolute;left:0;top:11px;bottom:11px;width:1px;background:rgba(255,255,255,.1)}
 #game #menu .ui5-more{top:auto!important;bottom:calc(100% + 8px)!important;right:6px!important;transform-origin:100% 100%!important;max-height:calc(100dvh - var(--gd-nav) - 2 * var(--u-st) - 24px)!important;overflow-y:auto}
 /* thẻ thông tin trên cùng: rộng ngang, thấp */
 #game .hud{width:calc(100vw - var(--ui5-mini,96px) - var(--u-sl) - var(--u-sr) - 8px)!important;padding:6px 9px 7px!important}
 #game .hud .bars{grid-template-columns:repeat(3,1fr)!important;gap:4px 8px!important}
 #game .hud .h-time{margin:3px 0 4px!important}
 #game .goal{width:auto!important;max-width:min(236px,62vw)!important}
 #game .goal .au-gw{display:inline-block;margin-top:5px;vertical-align:middle}
 #game .goal .nv-open{margin:5px 0 0 6px;vertical-align:middle;min-height:28px;padding:4px 9px}
 /* các phần sát đáy dời lên trên thanh chức năng */
 #game .hot{bottom:calc(max(4px,env(safe-area-inset-bottom)) + var(--gd-nav) + 4px)!important;padding:4px!important;border-radius:13px}
 #game .hs{height:42px!important}
 #game .acts{bottom:calc(max(4px,env(safe-area-inset-bottom)) + var(--gd-nav) + 60px)!important}
 #game .compass{bottom:calc(max(4px,env(safe-area-inset-bottom)) + var(--gd-nav) + 58px)!important}
 #game .work{bottom:calc(max(4px,env(safe-area-inset-bottom)) + var(--gd-nav) + 86px)!important}
 #game .cbx.cbbig{bottom:calc(max(4px,env(safe-area-inset-bottom)) + var(--gd-nav) + 150px)!important}
}`;document.head.appendChild(st);})();
/* nút trên thanh chức năng nào chưa có chữ thì thêm chữ */
const GD_LB={bag:'Túi',craft:'Chế tạo',build:'Xây',l4:'Nhân vật',map:'Bản đồ',journal:'Nhật ký',settings:'Cài đặt'};
function gdLabels(){try{const m=document.getElementById('menu');if(!m)return;for(const b of m.children){if(b.tagName!=='BUTTON')continue;let i=b.querySelector('i');const want=GD_LB[b.dataset.ui]||b.getAttribute('aria-label')||'';
    if(!i&&want){i=document.createElement('i');i.textContent=want.length>9?want.split(' ')[0]:want;b.appendChild(i);}else if(i&&b.dataset.ui==='l4'&&i.textContent!=='Nhân vật')i.textContent='Nhân vật';}}catch(e){}}
{const _s=typeof ui5MenuSort==='function'?ui5MenuSort:null;if(_s)ui5MenuSort=function(){const r=_s.apply(this,arguments);gdLabels();return r;};}
setTimeout(gdLabels,1500);setTimeout(gdLabels,6000);
