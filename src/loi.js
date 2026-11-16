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
/* ===================== BẮT CÚ ĐỨNG HÌNH (tạm thời, để tìm nguyên nhân) =====================
   Người chơi báo: cả điện thoại lẫn máy tính, đồ hoạ thấp nhất, đứng yên cũng cứ đúng nhịp là đứng hình ~2 giây; máy thử không tái hiện được.
   Phần này đo mọi việc chạy theo đồng hồ (hẹn giờ, lặp), tin từ máy chủ, vòng vẽ. Việc nào giữ máy từ 0,8 giây trở lên thì hiện MỘT dòng nhỏ
   "⏱ Khựng … giây · <phần gây ra>" (tối đa 12 giây một lần) để biết đích xác chỗ sửa. Sửa xong sẽ gỡ. */
const BK={on:!(navigator&&navigator.webdriver)||!!window.__bkTest,last:0,net:null,log:[],busy:0};/* máy thử tự động (vẽ bằng phần mềm, vốn chậm) thì không báo */
function bkSay(ms,src){try{if(!BK.on)return;BK.log.push([Date.now(),Math.round(ms),src]);if(BK.log.length>30)BK.log.shift();if(ms<800)return;const now=Date.now();if(now-BK.last<12000)return;BK.last=now;
    const t='⏱ Khựng '+(ms/1000).toFixed(1)+' giây · '+src;try{console.warn(t);}catch(e){}if(typeof uiToast==='function'&&typeof G!=='undefined'&&G.on&&G.t>25/* lúc mới vào game đang dựng cảnh: không báo */)setTimeout(()=>{try{uiToast(t,'');}catch(e){}},50);}catch(e){}}
function bkName(fn,kind){try{let n=fn&&fn.name;if(n&&n.length>2&&n!=='anonymous')return kind+' '+n;const s=String(fn).replace(/\s+/g,' ').replace(/^(async )?(function\s*\w*)?\s*\(?[^)]*\)?\s*(=>)?\s*\{?\s*(try\s*\{)?\s*/,'');return kind+' «'+s.slice(0,64)+'»';}catch(e){return kind;}}
function bkWrap(fn,kind){if(typeof fn!=='function'||fn.__bk)return fn;const w=function(){if(BK.busy)return fn.apply(this,arguments);BK.busy=1;const t0=performance.now();try{return fn.apply(this,arguments);}finally{BK.busy=0;const d=performance.now()-t0;if(d>250)bkSay(d,bkName(fn,kind));}};w.__bk=1;return w;}
try{const _st=window.setTimeout,_si=window.setInterval;window.setTimeout=function(fn,ms){if(typeof fn==='function'){const a=Array.prototype.slice.call(arguments);a[0]=bkWrap(fn,'hẹn giờ');return _st.apply(window,a);}return _st.apply(window,arguments);};
  window.setInterval=function(fn,ms){if(typeof fn==='function'){const a=Array.prototype.slice.call(arguments);a[0]=bkWrap(fn,'lặp '+(ms>=1000?Math.round(ms/1000)+' giây':ms+' ms'));return _si.apply(window,a);}return _si.apply(window,arguments);};}catch(e){}
// tin từ máy chủ (kênh trực tiếp) và việc xử lý ngay sau khi tải xong một yêu cầu mạng
try{const W=window.WebSocket;if(W&&W.prototype){const d=Object.getOwnPropertyDescriptor(W.prototype,'onmessage');if(d&&d.set)Object.defineProperty(W.prototype,'onmessage',{configurable:true,enumerable:d.enumerable,get:d.get,set(fn){d.set.call(this,typeof fn==='function'?bkWrap(fn,'tin từ máy chủ'):fn);}});
    const ael=W.prototype.addEventListener;W.prototype.addEventListener=function(t,fn,o){return ael.call(this,t,t==='message'&&typeof fn==='function'?bkWrap(fn,'tin từ máy chủ'):fn,o);};}}catch(e){}
try{const _f=window.fetch;if(_f)window.fetch=function(u){let p='';try{p=String(typeof u==='string'?u:(u&&u.url)||'').replace(/^https?:\/\/[^/]+/,'').replace(/\?.*$/,'').slice(0,60);}catch(e){}const r=_f.apply(this,arguments);try{r.then(()=>{BK.net={t:performance.now(),p};},()=>{});}catch(e){}return r;};}catch(e){}
// việc dài không thuộc các loại trên (trình duyệt báo) và khung hình bị treo mà không có việc dài nào (card hình / trình duyệt)
try{new PerformanceObserver(l=>{for(const e of l.getEntries()){if(e.duration<800)continue;const recent=BK.log.length&&Date.now()-BK.log[BK.log.length-1][0]<e.duration+1500;if(recent)continue;const n=BK.net&&e.startTime-BK.net.t<400&&e.startTime-BK.net.t>-50?'xử lý sau khi tải '+BK.net.p:'việc khác của trình duyệt (dọn bộ nhớ hoặc xử lý dữ liệu tải về)';bkSay(e.duration,n);}}).observe({entryTypes:['longtask']});}catch(e){}
try{let lt=0;const tick=now=>{requestAnimationFrame(tick);try{if(lt&&now-lt>1200&&!document.hidden&&typeof G!=='undefined'&&G.on&&!G.paused){const gap=now-lt;setTimeout(()=>{const recent=BK.log.length&&Date.now()-BK.log[BK.log.length-1][0]<2500;if(!recent)bkSay(gap,'không có việc nào của game chạy lâu: card hình hoặc trình duyệt bị treo');},300);}}catch(e){}lt=now;};requestAnimationFrame(tick);document.addEventListener('visibilitychange',()=>{lt=0;});}catch(e){}
setTimeout(function w(){try{if(typeof loop==='function'&&!loop.__bk){const _l=loop;loop=function(){const t0=performance.now();try{return _l.apply(this,arguments);}finally{const d=performance.now()-t0;if(d>400)bkSay(d,'vòng chạy chính của game (tính toán + vẽ)');}};loop.__bk=1;return;}}catch(e){}setTimeout(w,3000);},3000);
/* ===================== KHÔNG GHI BỘ NHỚ TRÌNH DUYỆT KIỂU CHẶN TRONG LÚC CHƠI =====================
   Bộ bắt cú đứng hình chỉ ra: việc tự lưu định kỳ giữ máy 1,5 giây. Trên máy người chơi, mỗi lần ghi localStorage (kiểu ghi CHẶN: trang phải đứng chờ)
   mất cả giây dù dữ liệu chỉ vài chục KB; game lại ghi kiểu đó ở nhiều chỗ (bản lưu khi ghi nền không dùng được, số bản đồng bộ, nấc đồ hoạ…).
   Giờ: trong lúc đang chơi và trang đang hiện, MỌI lần ghi localStorage chỉ ghi vào bộ nhớ tạm (đọc lại vẫn thấy ngay), kèm một bản ghi nền vào IndexedDB phòng sập;
   ghi thật xuống localStorage khi rời trang, chuyển ứng dụng, ẩn trang hoặc thoát ra màn hình chính. Mở lại mà còn bản tạm chưa ghi thì tự chép sang. */
const LSB={pend:new Map(),hold:0,db:null,t:0};
try{(function(){const SP=Storage.prototype,_set=SP.setItem,_get=SP.getItem,_rem=SP.removeItem;let LS=null;try{LS=window.localStorage;}catch(e){}if(!LS)return;
  const playing=()=>{try{return !LSB.hold&&typeof G!=='undefined'&&G&&G.on&&!document.hidden;}catch(e){return false;}};
  const mirror=()=>{if(!LSB.db||LSB.mt)return;LSB.mt=setTimeout(()=>{LSB.mt=null;try{const o={};LSB.pend.forEach((v,k)=>{o[k]=v;});LSB.db.transaction('p','readwrite').objectStore('p').put({o,ts:Date.now()},'pend');}catch(e){}},400);};
  SP.setItem=function(k,v){if(this===LS&&playing()){LSB.pend.set(String(k),String(v));mirror();return;}if(this===LS&&LSB.pend.size)LSB.pend.delete(String(k));return _set.apply(this,arguments);};
  SP.getItem=function(k){if(this===LS&&LSB.pend.size){const key=String(k);if(LSB.pend.has(key))return LSB.pend.get(key);}return _get.apply(this,arguments);};
  SP.removeItem=function(k){if(this===LS&&playing()){LSB.pend.set(String(k),null);mirror();return;}if(this===LS&&LSB.pend.size)LSB.pend.delete(String(k));return _rem.apply(this,arguments);};
  LSB.flush=function(){if(!LSB.pend.size)return 0;LSB.hold++;let n=0;try{const E=[...LSB.pend];LSB.pend.clear();/* bản lưu nhân vật ghi trước tiên */E.sort((a,b)=>(/lua-da-tay-trang/.test(b[0])?1:0)-(/lua-da-tay-trang/.test(a[0])?1:0));for(const [k,v] of E){try{if(v===null)_rem.call(LS,k);else _set.call(LS,k,v);n++;}catch(e){}}try{if(LSB.db)LSB.db.transaction('p','readwrite').objectStore('p').delete('pend');}catch(e){}}finally{LSB.hold--;}return n;};
  const out=()=>{try{LSB.flush();}catch(e){}};addEventListener('pagehide',out,true);addEventListener('beforeunload',out,true);document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible')out();},true);
  setInterval(()=>{try{if(LSB.pend.size&&!(typeof G!=='undefined'&&G&&G.on))LSB.flush();}catch(e){}},1500);
  // bản ghi nền phòng sập: mở lại trang mà còn bản tạm chưa kịp ghi thật thì chép sang (chỉ khi chưa vào game)
  try{if(window.indexedDB){const rq=indexedDB.open('lua-da-tam',1);rq.onupgradeneeded=()=>{try{rq.result.createObjectStore('p');}catch(e){}};rq.onsuccess=()=>{LSB.db=rq.result;try{const g=LSB.db.transaction('p','readonly').objectStore('p').get('pend');g.onsuccess=()=>{try{const r=g.result;if(r&&r.o&&!(typeof G!=='undefined'&&G&&G.on)&&!LSB.pend.size){for(const k in r.o){/* bản lưu nhân vật đã có đường khôi phục riêng (so giờ ghi): ở đây chỉ chép các mục nhỏ */if(/lua-da-tay-trang/.test(k))continue;try{if(r.o[k]===null)_rem.call(LS,k);else _set.call(LS,k,r.o[k]);}catch(e){}}LSB.db.transaction('p','readwrite').objectStore('p').delete('pend');}}catch(e){}};}catch(e){}};rq.onerror=()=>{};}}catch(e){}
})();}catch(e){}
