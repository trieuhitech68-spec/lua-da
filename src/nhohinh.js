/* ===================== nhohinh: NHỚ ẢNH BIỂU TƯỢNG GIỮA CÁC LẦN CHƠI =====================
   Đo cú khựng lúc đang chơi thấy: mỗi khi gặp một món MỚI (nhặt được, mở bảng), game dựng ảnh biểu tượng của món đó bằng một
   bộ vẽ 3D phụ rồi đọc ảnh về. Việc này chặn cả game một nhịp, và lần chơi nào cũng phải dựng lại từ đầu.
   Giờ: · ảnh dựng xong được cất vào bộ nhớ của trình duyệt (IndexedDB), lần sau vào game lấy ra dùng ngay, không dựng lại;
        · những ảnh còn phải dựng thì dựng từng cái một, cách nhau một quãng, không dồn nhiều cái vào một khung hình.
   Ảnh gắn với số phiên bản tin tức: ra bản mới thì ảnh cũ tự bỏ, dựng lại theo hình mới. */
const NHH={db:null,ver:'h1|'+(typeof NEWS_V==='string'?NEWS_V:'0')+'|',saved:{},n:0};
function nhhPut(kind,id,url){try{if(!NHH.db||!url||typeof url!=='string'||url.length<200||url.length>400000)return;const k=NHH.ver+kind+'|'+id;if(NHH.saved[k])return;NHH.saved[k]=1;NHH.db.transaction('i','readwrite').objectStore('i').put(url,k);}catch(e){}}
(function(){try{if(!window.indexedDB)return;const rq=indexedDB.open('lua-da-hinh',1);rq.onupgradeneeded=()=>{try{rq.result.createObjectStore('i');}catch(e){}};rq.onerror=()=>{};
  rq.onsuccess=()=>{NHH.db=rq.result;try{const tx=NHH.db.transaction('i','readwrite'),st=tx.objectStore('i'),cq=st.openCursor();cq.onsuccess=()=>{const c=cq.result;if(!c)return;try{const k=String(c.key);
        if(k.indexOf(NHH.ver)!==0){c.delete();}else{const p=k.slice(NHH.ver.length).split('|'),kind=p[0],id=p.slice(1).join('|'),v=c.value;NHH.saved[k]=1;
          if(typeof v==='string'&&v.indexOf('data:image')===0){if(kind==='i'){if(!ICO.url[id]){ICO.url[id]=v;NHH.n++;}}else if(kind==='p'&&typeof U8!=='undefined'){if(!U8.url[id]){U8.url[id]=v;NHH.n++;}}}}}catch(e){}c.continue();};}catch(e){}};}catch(e){}})();
{const _im=iconMake;iconMake=function(id){const r=_im.apply(this,arguments);try{nhhPut('i',id,ICO.url[id]);}catch(e){}return r;};if(_im.__base)iconMake.__base=_im.__base;}
if(typeof u8Make==='function'){const _um=u8Make;u8Make=function(id){const r=_um.apply(this,arguments);try{nhhPut('p',id,U8.url[id]);}catch(e){}return r;};}
/* dựng từng ảnh một, cách nhau một quãng: không còn cảnh vài ảnh dồn vào một khung hình */
iconPump=function(){if(ICO.busy||!ICO.q.length)return;ICO.busy=true;requestAnimationFrame(()=>{try{while(ICO.q.length){const id=ICO.q.shift();if(ICO.url[id])continue;iconMake(id);break;}}catch(e){console.warn('biểu tượng',e);}ICO.busy=false;if(ICO.q.length)setTimeout(iconPump,G.panel?60:220);});};
if(typeof u8Pump==='function')u8Pump=function(){if(U8.busy||!U8.q.length)return;U8.busy=true;requestAnimationFrame(()=>{try{while(U8.q.length){const id=U8.q.shift();if(U8.url[id])continue;u8Make(id);break;}}catch(e){}U8.busy=false;if(U8.q.length)setTimeout(u8Pump,50);});};
