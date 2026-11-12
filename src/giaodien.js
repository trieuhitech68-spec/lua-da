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
 /* ===== GỌN LẠI: nhường màn hình cho nhân vật ===== */
 :root{--ui5-mini:76px}
 #game .mini{width:76px!important;height:76px!important}
 /* thẻ thông tin: bỏ dòng tên, 6 thanh chỉ số một hàng, chữ nhỏ */
 #game .hud{padding:4px 8px 5px!important;border-radius:11px!important}
 #game .hud .h-top{display:none!important}
 #game .hud .h-time{font-size:10.5px!important;margin:0 0 3px!important;line-height:1.2}
 #game .hud .bars{grid-template-columns:repeat(6,1fr)!important;gap:0 5px!important}
 #game .hud .bar{gap:2px}#game .hud .bar span{width:13px!important;font-size:10px!important}#game .hud .bar i{height:4px!important}
 #game .hud .schs{margin-top:3px!important;gap:3px!important;flex-wrap:nowrap;overflow:hidden}#game .hud .sch{font-size:9.5px!important;padding:0 6px!important;white-space:nowrap}
 /* thẻ mục tiêu: một dòng tên + thanh tiến độ + hai nút nhỏ */
 #game .goal{padding:4px 8px 5px!important;border-radius:10px!important;max-width:min(210px,56vw)!important}
 #game .goal .g-k{font-size:9px!important;line-height:1.1}
 #game .goal b{font-size:11.5px!important;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 #game .goal .tr-rw{display:none!important}
 #game .goal .g-p{margin-top:2px!important;font-size:10px}
 #game .goal .au-gw{margin-top:3px!important}
 #game .goal .au-gb{min-height:24px!important;padding:2px 8px!important;font-size:11px!important;margin:0!important}
 #game .goal .nv-open{min-height:24px!important;padding:2px 8px!important;font-size:11px!important;margin:3px 0 0 5px!important}
 #game .cbx.cbmini button{padding:3px 9px!important;font-size:11px!important}
 /* đáy: thanh chức năng thấp, không phình theo mép cong của máy */
 #game{--gd-nav:46px;--gd-sb:min(env(safe-area-inset-bottom,0px),16px);--u-sb:calc(var(--gd-sb) + var(--gd-nav) + 6px)}
 #game .menu{height:calc(var(--gd-nav) + var(--gd-sb))!important;min-height:0!important;box-sizing:border-box!important;padding:2px 6px var(--gd-sb)!important;overflow:visible}
 #game .menu>button{height:42px!important}
 #game .menu>button span{font-size:19px!important}
 #game .menu>button i{font-size:10px!important}
 #game .menu>button+button::before{top:9px;bottom:9px}
 #game .hot{bottom:calc(var(--gd-sb) + var(--gd-nav) + 4px)!important;padding:3px!important;gap:3px!important}
 #game .hs{height:38px!important;border-radius:9px!important}
 #game .compass{display:none!important}
 #game .acts{bottom:calc(var(--gd-sb) + var(--gd-nav) + 52px)!important;transform:scale(calc(var(--sp-btn,1) * .86))!important;transform-origin:100% 100%!important}
 body.sp-lh #game .acts{transform-origin:0 100%!important}
 #game .work{bottom:calc(var(--gd-sb) + var(--gd-nav) + 54px)!important}
 #game .cbx.cbbig{bottom:calc(var(--gd-sb) + var(--gd-nav) + 130px)!important}
}`;document.head.appendChild(st);})();
/* nút trên thanh chức năng nào chưa có chữ thì thêm chữ */
const GD_LB={bag:'Túi',craft:'Chế tạo',build:'Xây',l4:'Nhân vật',map:'Bản đồ',journal:'Nhật ký',settings:'Cài đặt'};
function gdLabels(){try{const m=document.getElementById('menu');if(!m)return;for(const b of m.children){if(b.tagName!=='BUTTON')continue;let i=b.querySelector('i');const want=GD_LB[b.dataset.ui]||b.getAttribute('aria-label')||'';
    if(!i&&want){i=document.createElement('i');i.textContent=want.length>9?want.split(' ')[0]:want;b.appendChild(i);}else if(i&&b.dataset.ui==='l4'&&i.textContent!=='Nhân vật')i.textContent='Nhân vật';}}catch(e){}}
{const _s=typeof ui5MenuSort==='function'?ui5MenuSort:null;if(_s)ui5MenuSort=function(){const r=_s.apply(this,arguments);gdLabels();return r;};}
setTimeout(gdLabels,1500);setTimeout(gdLabels,6000);
