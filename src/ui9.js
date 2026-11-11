/* ===================== GỌN CÁC THẺ HIỆN KHI ĐANG THAO TÁC =====================
   - Thẻ tiến độ thao tác (#work): thành một thanh mỏng một dòng (hình, tên + bước, thanh chạy, ✕). Máy tính / màn ngang rộng: nằm giữa đáy, ngay trên thanh đồ,
     không còn đè lên bản đồ nhỏ góc phải. Điện thoại: giữ chỗ cũ (trái, trên cần điều khiển) nhưng mỏng hơn.
   - Thẻ "Đang tự làm": thẻ mục tiêu đã có nút Đang tự làm · ✋ nên thẻ này chỉ còn một dòng việc đang làm + ⚙️ + ✋, hẹp lại.
   - Nút nổi "Cài ứng dụng": ẩn khi đã vào game (đè lên thanh menu); vẫn cài được trong ⚙️ Cài đặt. */
{const st=document.createElement('style');st.textContent=`#game .work{padding:6px 8px!important;border-radius:12px!important;width:min(270px,calc(100vw - 24px))!important}
#game .work ol,#game .work>span{display:none!important}#game .work .wk-h b small{display:block!important;font-size:11px}#game .work .wk-h{gap:6px}#game .work .wk-h b{font-size:12.5px;line-height:1.15;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#game .work .wk-h .ic{width:24px!important;height:24px!important}#game .work .wk-x{width:30px!important;height:30px!important;flex:none}#game .work .wk-b{height:5px!important;margin:4px 0 0!important}
@media (min-width:601px){#game .work{left:50%!important;right:auto!important;top:auto!important;transform:translateX(-50%)!important;bottom:calc(max(10px,env(safe-area-inset-bottom)) + 78px)!important}}
@media (max-width:600px){#game .work{width:min(230px,calc(100vw - 236px))!important}}
#game .auchip{width:auto!important;max-width:min(250px,calc(100vw - 90px))!important;padding:4px 6px!important;border-radius:10px!important;font-size:11.5px!important}
#game .auchip .au-h{display:flex;align-items:center;gap:5px}#game .auchip .au-t{min-width:0;flex:1}#game .auchip .au-t b:not(:only-child){display:none}#game .auchip .au-t small{display:block;font-size:11.5px;color:#f6ead2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#game .auchip .au-t b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11.5px}#game .auchip .au-ic{font-size:15px}#game .auchip .au-b{min-width:32px!important;min-height:32px!important;height:32px!important;padding:0 6px!important;font-size:13px!important}
body.ld-in .ld-app{display:none!important}`;document.head.appendChild(st);}
{const _ui=aqUi;aqUi=function(){const r=_ui.apply(this,arguments);try{const b=document.querySelector('#auchip .au-b.stop');if(b&&b.textContent!=='✋')b.textContent='✋';}catch(e){}return r;};}
setInterval(()=>{try{document.body.classList.toggle('ld-in',!!(typeof G==='object'&&G.on));}catch(e){}},800);
/* ---------- thẻ không tự chắn màn hình mãi ---------- */
// Thẻ gợi ý (góc trái) tự đóng sau 14 giây. Bảng giữa màn hình (ngủ dậy, chuyện kể, lễ hội) làm game tạm dừng: đang "Tự làm" thì tự đóng sau 5 giây để nhân vật làm tiếp.
setInterval(()=>{try{if(!S||!G.on)return;if(typeof GD==='object'&&GD.card&&G.t-GD.card.t>14){const x=document.querySelector('#gdcard [data-gd="close"]');if(x)x.click();}
  const ov=document.getElementById('overlay');if(ov&&!ov.hidden&&G.paused&&typeof AQ==='object'&&AQ.on){ov._t=(ov._t||0)+1;if(ov._t>=5){ov._t=0;const b=ov.querySelector('button');if(b)b.click();}}else if(ov)ov._t=0;}catch(e){}},1000);
