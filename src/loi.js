/* ===================== NHẬT KÝ LỖI TỪ MÁY NGƯỜI CHƠI =====================
   Bắt lỗi chạy (window.onerror, promise bị từ chối) trên máy người chơi, gộp lỗi trùng, giữ 25 lỗi gần nhất.
   · Lưu tại máy (localStorage 'ld-err'). Nếu người chơi đã đăng nhập thì ghi thêm vào tài liệu riêng của họ
     data/users/<mã>/log/err/v1 (chỉ chính họ và chủ máy chủ đọc được; không cần sửa gì trên Supabase).
   · Chỉ ghi: nội dung lỗi, dòng mã, phiên bản game, loại máy (điện thoại/máy tính, trình duyệt), mục tiêu đang làm, bảng đang mở, số lần.
     KHÔNG ghi tên, thư điện tử, nội dung trò chuyện hay vị trí.
   · Ghi tối đa 1 lần mỗi 2 phút và chỉ khi có lỗi mới. Xem tại máy: ☰ Thêm → Cài đặt → cuối trang "Nhật ký lỗi" (hoặc gõ ldErrors() trong bảng điều khiển). */
/* CHỐNG GIẬT (dọn rác bộ nhớ): Math.hypot của trình duyệt là hàm chậm và MỖI LẦN GỌI tạo một vật rác; game gọi nó hàng chục nghìn lần mỗi giây
   (va chạm, ẩn hiện cây, thú, tìm đường) → vài MB rác mỗi giây → trình duyệt dừng game để dọn đều đặn vài giây một lần.
   Thay bằng phép tính trực tiếp cho 2-3 số (trường hợp game dùng), không tạo rác, nhanh hơn nhiều. */
{const _h=Math.hypot;Math.hypot=function(a,b,c,d){if(d===undefined){const r=c===undefined?Math.sqrt(a*a+b*b):Math.sqrt(a*a+b*b+c*c);if(r===r)return r;}/* thiếu số, số lạ, hơn 3 số: để hàm gốc tính cho kết quả y hệt */return _h.apply(Math,arguments);};}

const LOI={L:[],dirty:false,wT:0,ver:''};
(function(){try{LOI.L=JSON.parse(localStorage.getItem('ld-err')||'[]');if(!Array.isArray(LOI.L))LOI.L=[];}catch(e){LOI.L=[];}
  try{const m=document.querySelector('meta[name="ld-ver"]');LOI.ver=(m&&m.content)||(typeof LD_VER!=='undefined'?LD_VER:'')||'';}catch(e){}
  const ua=navigator.userAgent||'',dev=(/iPhone|iPad/.test(ua)?'iOS':/Android/.test(ua)?'Android':/Windows/.test(ua)?'Windows':/Mac/.test(ua)?'Mac':'khác')+' · '+(/CriOS|Chrome\//.test(ua)?'Chrome':/Safari\//.test(ua)?'Safari':/Firefox/.test(ua)?'Firefox':'khác');
  function add(msg,src,stack){try{msg=String(msg||'').slice(0,220);if(!msg||/ResizeObserver loop|Script error\.?$/.test(msg))return;const st=String(stack||src||'').replace(/https?:\/\/[^\s)]+\//g,'').slice(0,320),key=msg+'|'+st.slice(0,80);
      let e=LOI.L.find(x=>x.k===key);const g=(typeof S!=='undefined'&&S&&typeof S.goal==='number')?S.goal:-1,pn=(typeof G!=='undefined'&&G&&G.panel)||'';
      if(e){e.n=(e.n||1)+1;e.at=Date.now();}else{e={k:key,m:msg,s:st,at:Date.now(),n:1,v:LOI.ver,d:dev,g,p:String(pn).slice(0,20)};LOI.L.push(e);if(LOI.L.length>25)LOI.L.shift();}
      LOI.dirty=true;try{localStorage.setItem('ld-err',JSON.stringify(LOI.L));}catch(er){}}catch(er){}}
  LOI.add=add;
  window.addEventListener('error',e=>{try{add(e.message,(e.filename||'')+':'+(e.lineno||0)+':'+(e.colno||0),e.error&&e.error.stack);}catch(er){}});
  window.addEventListener('unhandledrejection',e=>{try{const r=e.reason;add('Promise: '+(r&&r.message?r.message:String(r)),'',r&&r.stack);}catch(er){}});
  setInterval(async()=>{try{if(!LOI.dirty||Date.now()-LOI.wT<120000)return;if(typeof ACC==='undefined'||!ACC.db||!ACC.uid)return;LOI.wT=Date.now();LOI.dirty=false;
      await ACC.db.doc('data/users/'+ACC.uid+'/log/err/v1').set({v:LOI.ver,at:Date.now(),L:LOI.L.map(x=>({m:x.m,s:x.s,at:x.at,n:x.n,v:x.v,d:x.d,g:x.g,p:x.p}))});}catch(er){}},30000);})();
function ldErrors(){return LOI.L.slice().sort((a,b)=>b.at-a.at).map(e=>`[${new Date(e.at).toLocaleString('vi-VN')}] ×${e.n} ${e.m}\n   ${e.s}\n   ${e.d} · bản ${e.v||'?'} · mục tiêu ${e.g} · bảng ${e.p||'-'}`).join('\n');}
/* hiện ở cuối bảng Cài đặt: người chơi chụp gửi được ngay cả khi không đăng nhập */
setInterval(()=>{try{if(typeof G==='undefined'||!G.on||G.panel!=='settings')return;const bd=document.querySelector('#panel .p-body');if(!bd||bd.querySelector('.loi-b'))return;const n=LOI.L.length;
    bd.insertAdjacentHTML('beforeend',`<details class="loi-b"><summary>🐞 Nhật ký lỗi (${n})</summary><p class="small muted">Lỗi chạy gặp trên máy này. Chụp màn hình phần này gửi cho người làm game là đủ để tìm lỗi. Không chứa tên, thư hay trò chuyện của bạn.</p><pre class="loi-p">${n?ldErrors().replace(/[<&]/g,c=>c==='<'?'&lt;':'&amp;'):'Chưa ghi nhận lỗi nào.'}</pre>${n?'<button class="btn sm ghost" data-a="loiclr">Xoá nhật ký</button>':''}</details>`);}catch(e){}},700);
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="loiclr"]');if(!b)return;e.stopImmediatePropagation();LOI.L=[];LOI.dirty=true;try{localStorage.removeItem('ld-err');}catch(er){}const d=b.closest('.loi-b');if(d)d.remove();},true);
{const s=document.createElement('style');s.textContent='#game .panel .loi-b{margin-top:14px;padding:8px 10px;border-radius:12px;border:1px dashed rgba(255,255,255,.18)}#game .panel .loi-b summary{font-weight:700;font-size:13px;cursor:pointer}#game .panel .loi-p{white-space:pre-wrap;word-break:break-word;font-size:10.5px;line-height:1.35;max-height:240px;overflow:auto;background:rgba(0,0,0,.35);padding:8px;border-radius:8px;user-select:text;-webkit-user-select:text}';document.head.appendChild(s);}
