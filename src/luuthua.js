/* ---------- GOM VIỆC GHI BẢN LƯU (chống giật) ----------
   Số đo trên máy người chơi: 80 trên 84 lần khựng là do "ghi bản lưu", mỗi lần tới 356 ms, cách nhau 1,6 giây.
   Game gọi save() ở gần 300 chỗ (mỗi lần nhặt đồ, người làng cất đồ, xong một việc…); mỗi lần là đóng gói TOÀN BỘ ván chơi rồi ghi xuống máy hai lần.
   Giờ: save() chỉ đánh dấu "cần lưu"; việc ghi thật diễn ra tối đa 20 giây một lần. Ghi NGAY khi: rời trang / chuyển ứng dụng, đang mở Cài đặt,
   sắp đẩy bản lưu lên máy chủ, hoặc gọi saveNow(). Mất điện đột ngột thì mất tối đa 20 giây gần nhất. */
const LTH2={t:0,pend:0,timer:null,GAP:45000,req:0,by:{},last:null};
{const _real=save;
  window.saveNow=function(){LTH2.pend=0;if(LTH2.timer){clearTimeout(LTH2.timer);LTH2.timer=null;}LTH2.t=performance.now();const t0=LTH2.t;try{return _real.apply(this,arguments);}finally{try{LTH2.last={ms:Math.round(performance.now()-t0),at:Date.now()};LTH2.raw=null;}catch(e){}}};
  save=function(){try{LTH2.req++;if(LTH2.req<=400){/* ghi lại ai gọi lưu nhiều nhất (xem ở Cài đặt → Đo giật) */const st=(new Error().stack||'').split('\n')[2]||'';const m=st.match(/at ([A-Za-z0-9_$.]+)/);const k=m?m[1]:'?';LTH2.by[k]=(LTH2.by[k]||0)+1;}}catch(e){}
    const now=performance.now();if(typeof G==='undefined'||!G.on)return saveNow();/* (đã bỏ quy tắc "đang mở Cài đặt thì ghi ngay": người làng gọi lưu liên tục nên mở Cài đặt là ghi dồn dập, mỗi lần đứng hình cả giây trên máy ghi chậm) */if(now-LTH2.t>=LTH2.GAP){LTH2.pend=1;if(!LTH2.timer)LTH2.timer=setTimeout(lth2Fire,0);return;}
    LTH2.pend=1;if(!LTH2.timer)LTH2.timer=setTimeout(lth2Fire,Math.max(200,LTH2.GAP-(now-LTH2.t)));};}
/* tới hạn ghi: nếu nhân vật đang chạy/đi thì chờ lúc đứng yên, đang làm việc hoặc mở bảng (khựng lúc đó khó thấy hơn nhiều), tối đa chờ thêm 40 giây */
/* Ghi GỌN cho lần ghi định kỳ: số đo trên máy người chơi cho thấy bản lưu chỉ 37 KB mà mỗi lần ghi mất 300-900 ms, tức thao tác ghi xuống máy rất chậm ở đó.
   Bản ghi đầy đủ làm 4 thao tác với bộ nhớ máy (ghi bản chung, đọc lại, ghi bản của nhân vật, ghi danh sách nhân vật). Bản gọn chỉ ghi MỘT lần vào ngăn của nhân vật
   (đủ để vào lại game và để đẩy lên máy chủ); bản chung và danh sách nhân vật được ghi khi rời trang, mở Cài đặt. Đo riêng thời gian đóng gói và thời gian ghi. */
function lth2Lean(){try{if(typeof curSlot!=='function'||typeof ACC==='undefined')return false;const id=curSlot();if(!id||!S||!G.on||ACC.stop||G.ldLeaving===2)return false;
    S.p.x=+P.x.toFixed(1);S.p.z=+P.z.toFixed(1);S.p.ry=+P.ry.toFixed(2);try{if(G.hoIn&&typeof hoS==='function')hoS().out=Date.now();}catch(e){}
    const t0=performance.now(),raw=JSON.stringify(S,(k,v)=>k&&k[0]==='_'?undefined:v),t1=performance.now();let nen=0;if(lidbPut(SKEY+'#'+id,{raw,ts:Date.now()})){nen=1;LTH2.raw=raw;LTH2.rawId=id;}else localStorage.setItem(SKEY+'#'+id,raw);const t2=performance.now();
    LTH2.pend=0;if(LTH2.timer){clearTimeout(LTH2.timer);LTH2.timer=null;}LTH2.t=t2;LTH2.last={ms:Math.round(t2-t0),goi:Math.round(t1-t0),dia:Math.round(t2-t1),gon:1,nen,at:Date.now()};LTH2.plain=1;
    if(ACC.db&&Date.now()-ACC.lastPush>60000)try{accPush(id);}catch(e){}return true;}catch(e){return false;}}
function lth2Fire(){LTH2.timer=null;if(!LTH2.pend)return;try{const moving=typeof P!=='undefined'&&typeof G!=='undefined'&&G.on&&!G.panel&&!G.work&&!G.sit&&!G.sleeping&&(P.speed||0)>8;if(moving&&performance.now()-LTH2.t<LTH2.GAP+40000){LTH2.timer=setTimeout(lth2Fire,700);return;}}catch(e){}try{if(!lth2Lean())saveNow();}catch(e){}}
if(typeof accPush==='function'){const _ap=accPush;accPush=function(){try{if(LTH2.pend&&!lth2Lean())saveNow();}catch(e){}return _ap.apply(this,arguments);};}
addEventListener('pagehide',()=>{try{if(LTH2.pend||LTH2.plain){LTH2.plain=0;saveNow();}}catch(e){}},true);addEventListener('beforeunload',()=>{try{if(LTH2.pend||LTH2.plain){LTH2.plain=0;saveNow();}}catch(e){}},true);
document.addEventListener('visibilitychange',()=>{try{if(document.visibilityState!=='visible'&&(LTH2.pend||LTH2.plain)){LTH2.plain=0;saveNow();}}catch(e){}},true);
// cho Cài đặt → Đo giật: bản lưu nặng bao nhiêu, phần nào chiếm chỗ, ai gọi lưu nhiều
function ldLuu(){const o={goi:LTH2.req,lanCuoi:LTH2.last,nhieu:Object.entries(LTH2.by).sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>e[0]+' ×'+e[1])};try{if(!LTH2.sz||Date.now()-LTH2.szT>60000){LTH2.szT=Date.now();const L=[];let tot=0;for(const k in S){if(k[0]==='_')continue;let n=0;try{n=JSON.stringify(S[k],(q,v)=>q&&q[0]==='_'?undefined:v).length;}catch(e){}tot+=n;L.push([k,n]);}L.sort((a,b)=>b[1]-a[1]);LTH2.sz={tong:tot,lon:L.slice(0,4).map(e=>e[0]+' '+Math.round(e[1]/1024)+'KB')};}o.co=LTH2.sz;}catch(e){}return o;}

/* ---------- GHI NỀN (IndexedDB) ----------
   Số đo trên máy người chơi: bản lưu chỉ 44 KB mà mỗi lần ghi xuống bộ nhớ trình duyệt kiểu cũ (localStorage) mất 0,9-1,1 giây → đứng hình.
   localStorage ghi kiểu CHẶN: trang phải chờ xong mới chạy tiếp. IndexedDB ghi NỀN: trang chạy tiếp ngay, trình duyệt tự ghi phía sau.
   · Trong lúc chơi: bản lưu định kỳ ghi nền vào IndexedDB (kèm một bản nhớ tạm trong máy để đẩy lên máy chủ).
   · Rời trang / chuyển ứng dụng / đổi nhân vật / xuất tệp: vẫn ghi kiểu cũ một lần cho chắc.
   · Mở game lại mà bản ghi nền mới hơn bản kiểu cũ (trang bị đóng đột ngột): tự chép bản ghi nền sang trước khi vào chơi. */
const LIDB={db:null,ok:false};
function lidbPut(k,v){if(!LIDB.ok)return false;try{LIDB.db.transaction('s','readwrite').objectStore('s').put(v,k);return true;}catch(e){return false;}}
function lidbDel(k){if(!LIDB.ok)return;try{LIDB.db.transaction('s','readwrite').objectStore('s').delete(k);}catch(e){}}
function lidbRecover(){try{if(typeof G!=='undefined'&&G.on)return;const rq=LIDB.db.transaction('s','readonly').objectStore('s').openCursor();rq.onsuccess=()=>{const c=rq.result;if(!c)return;try{const k=String(c.key),v=c.value;
        if(!(typeof G!=='undefined'&&G.on)&&k.indexOf(SKEY+'#')===0&&v&&typeof v.raw==='string'&&v.ts>(+(localStorage.getItem('ld-lsT'+k.slice(SKEY.length))||0))&&localStorage.getItem(k)!=null){localStorage.setItem(k,v.raw);localStorage.setItem('ld-lsT'+k.slice(SKEY.length),String(v.ts));
          try{if(typeof curSlot==='function'&&k===SKEY+'#'+curSlot())localStorage.setItem(SKEY,v.raw);}catch(e){}LIDB.rec=(LIDB.rec|0)+1;}}catch(e){}c.continue();};}catch(e){}}
(function(){try{if(!window.indexedDB)return;const rq=indexedDB.open('lua-da-luu',1);rq.onupgradeneeded=()=>{try{rq.result.createObjectStore('s');}catch(e){}};rq.onsuccess=()=>{LIDB.db=rq.result;LIDB.ok=true;lidbRecover();};rq.onerror=()=>{};}catch(e){}})();
/* mọi lần ghi/đọc ngăn của nhân vật qua accLS: ghi → nhớ giờ ghi (để biết bản nào mới hơn) và bỏ bản nhớ tạm; xoá → xoá cả bản ghi nền; đọc → ưu tiên bản nhớ tạm mới nhất */
if(typeof accLS==='function'){const _al=accLS;accLS=function(k,v){try{if(typeof k==='string'&&k.indexOf(SKEY+'#')===0){const id=k.slice(SKEY.length+1);
      if(v===undefined){if(LTH2.raw&&LTH2.rawId===id)return LTH2.raw;}
      else if(v===null){lidbDel(k);if(LTH2.rawId===id)LTH2.raw=null;try{localStorage.removeItem('ld-lsT#'+id);}catch(e){}}
      else{if(LTH2.rawId===id)LTH2.raw=null;try{localStorage.setItem('ld-lsT#'+id,String(Date.now()));}catch(e){}}}}catch(e){}return _al.apply(this,arguments);};}
