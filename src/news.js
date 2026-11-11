/* ===================== CÓ GÌ MỚI: thẻ giới thiệu tính năng, mỗi phiên bản hiện một lần cho mỗi máy ===================== */
const NEWS_V='2026-11-b',NEWS=[
 ['⚔️','Đánh và thu phục','Nút Đánh tự tìm mục tiêu gần nhất. Mang dây thừng để trói bắt chiến binh, cho ăn để thuần thú.'],
 ['🧍','Nhân vật','Cấp, 4 thuộc tính, danh hiệu, cường hoá vũ khí – giáp – dụng cụ. Mũ, giáp, khiên giờ hiện lên người.'],
 ['🏗️','Nâng cấp công trình','Xây → Nâng cấp: giỏ rương chứa nhiều hơn, bếp cháy lâu hơn, mái vách bền hơn.'],
 ['👥','Dân làng, thổ dân','Giao việc theo sở trường, cắt người Giữ cổng hoặc làm Lính theo bạn.'],
 ['👑','Vùng theo cấp, thú chúa','Càng xa nơi bắt đầu càng nguy hiểm. Thú chúa canh mỏ sắt, than, vàng, ngọc bích.'],
 ['🤝','Liên minh, chiến tranh','Liên minh 70 người, tuyên chiến, cướp phá nhà người không cùng liên minh, hạ cờ chiếm đất.'],
 ['🗺️','Bản đồ hình chữ S','Máy chủ mới có miền Trung và miền Nam. Chọn khi tạo nhân vật.'],
 ['🕐','Giờ thật Việt Nam','Ngày đêm và bốn mùa trong game theo giờ thật, mọi người như nhau.']];
function newsShow(force){try{if(!force&&localStorage.getItem('ldtt-news')===NEWS_V)return;}catch(e){return;}if(!G.on||!S||G.panel||document.getElementById('newsCard'))return;
  const d=document.createElement('div');d.id='newsCard';d.innerHTML=`<div class="nw-box"><div class="nw-h"><b>🔥 Có gì mới</b><button class="p-x" data-a="newsx" aria-label="Đóng">✕</button></div><div class="nw-l">${NEWS.map(([ic,t,x])=>`<div class="nw-i"><span>${ic}</span><div><b>${t}</b><small>${x}</small></div></div>`).join('')}</div><button class="btn" data-a="newsx">Đã hiểu, chơi thôi</button></div>`;
  document.getElementById('game').appendChild(d);if(document.pointerLockElement)document.exitPointerLock();}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="newsx"]');if(!b)return;e.stopImmediatePropagation();const c=document.getElementById('newsCard');if(c)c.remove();try{localStorage.setItem('ldtt-news',NEWS_V);}catch(_){}},true);
// hiện sau khi vào game ~12 giây; nhân vật mới tinh (ngày 1, chưa làm gì) thì để yên cho làm quen trước
setInterval(()=>{try{if(G.on&&S&&G.t>12&&((S.goal|0)>=3||S.day>1))newsShow(false);}catch(e){}},4000);
{const st=document.createElement('style');st.textContent=`#newsCard{position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;background:rgba(8,5,3,.55);padding:16px}
.nw-box{width:min(440px,100%);max-height:86dvh;display:flex;flex-direction:column;gap:10px;padding:14px;border-radius:18px;background:linear-gradient(180deg,#2c1f15,#1c140d);border:1px solid rgba(242,197,90,.55);box-shadow:0 18px 50px rgba(0,0,0,.6);color:var(--fg)}
.nw-h{display:flex;align-items:center;justify-content:space-between}.nw-h b{font-family:Bungee,sans-serif;font-size:18px;color:#f2c55a}.nw-h .p-x{width:40px;height:40px;border-radius:12px;border:1px solid rgba(242,197,90,.3);background:rgba(255,255,255,.06);color:var(--fg)}
.nw-l{overflow-y:auto;display:flex;flex-direction:column;gap:7px}.nw-i{display:flex;gap:10px;align-items:flex-start;padding:8px 10px;border-radius:12px;background:rgba(255,255,255,.05)}.nw-i>span{font-size:22px;line-height:1.1}.nw-i div{display:flex;flex-direction:column;min-width:0}.nw-i b{font-size:13.5px}.nw-i small{font-size:12px;color:#cbb994;line-height:1.35}`;document.head.appendChild(st);}
