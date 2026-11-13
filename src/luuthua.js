/* ---------- GOM VIỆC GHI BẢN LƯU (chống giật) ----------
   Số đo trên máy người chơi: 80 trên 84 lần khựng là do "ghi bản lưu", mỗi lần tới 356 ms, cách nhau 1,6 giây.
   Game gọi save() ở gần 300 chỗ (mỗi lần nhặt đồ, người làng cất đồ, xong một việc…); mỗi lần là đóng gói TOÀN BỘ ván chơi rồi ghi xuống máy hai lần.
   Giờ: save() chỉ đánh dấu "cần lưu"; việc ghi thật diễn ra tối đa 20 giây một lần. Ghi NGAY khi: rời trang / chuyển ứng dụng, đang mở Cài đặt,
   sắp đẩy bản lưu lên máy chủ, hoặc gọi saveNow(). Mất điện đột ngột thì mất tối đa 20 giây gần nhất. */
const LTH2={t:0,pend:0,timer:null,GAP:20000,req:0,by:{},last:null};
{const _real=save;
  window.saveNow=function(){LTH2.pend=0;if(LTH2.timer){clearTimeout(LTH2.timer);LTH2.timer=null;}LTH2.t=performance.now();const t0=LTH2.t;try{return _real.apply(this,arguments);}finally{try{LTH2.last={ms:Math.round(performance.now()-t0),at:Date.now()};}catch(e){}}};
  save=function(){try{LTH2.req++;if(LTH2.req<=400){/* ghi lại ai gọi lưu nhiều nhất (xem ở Cài đặt → Đo giật) */const st=(new Error().stack||'').split('\n')[2]||'';const m=st.match(/at ([A-Za-z0-9_$.]+)/);const k=m?m[1]:'?';LTH2.by[k]=(LTH2.by[k]||0)+1;}}catch(e){}
    const now=performance.now();if(typeof G==='undefined'||!G.on||G.panel==='settings'||now-LTH2.t>=LTH2.GAP)return saveNow();
    LTH2.pend=1;if(!LTH2.timer)LTH2.timer=setTimeout(lth2Fire,Math.max(200,LTH2.GAP-(now-LTH2.t)));};}
/* tới hạn ghi: nếu nhân vật đang chạy/đi thì chờ lúc đứng yên, đang làm việc hoặc mở bảng (khựng lúc đó khó thấy hơn nhiều), tối đa chờ thêm 40 giây */
function lth2Fire(){LTH2.timer=null;if(!LTH2.pend)return;try{const moving=typeof P!=='undefined'&&typeof G!=='undefined'&&G.on&&!G.panel&&!G.work&&!G.sit&&!G.sleeping&&(P.speed||0)>8;if(moving&&performance.now()-LTH2.t<LTH2.GAP+40000){LTH2.timer=setTimeout(lth2Fire,700);return;}}catch(e){}try{saveNow();}catch(e){}}
if(typeof accPush==='function'){const _ap=accPush;accPush=function(){try{if(LTH2.pend)saveNow();}catch(e){}return _ap.apply(this,arguments);};}
addEventListener('pagehide',()=>{try{if(LTH2.pend)saveNow();}catch(e){}},true);addEventListener('beforeunload',()=>{try{if(LTH2.pend)saveNow();}catch(e){}},true);
document.addEventListener('visibilitychange',()=>{try{if(document.visibilityState!=='visible'&&LTH2.pend)saveNow();}catch(e){}},true);
// cho Cài đặt → Đo giật: bản lưu nặng bao nhiêu, phần nào chiếm chỗ, ai gọi lưu nhiều
function ldLuu(){const o={goi:LTH2.req,lanCuoi:LTH2.last,nhieu:Object.entries(LTH2.by).sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>e[0]+' ×'+e[1])};try{if(!LTH2.sz||Date.now()-LTH2.szT>60000){LTH2.szT=Date.now();const L=[];let tot=0;for(const k in S){if(k[0]==='_')continue;let n=0;try{n=JSON.stringify(S[k],(q,v)=>q&&q[0]==='_'?undefined:v).length;}catch(e){}tot+=n;L.push([k,n]);}L.sort((a,b)=>b[1]-a[1]);LTH2.sz={tong:tot,lon:L.slice(0,4).map(e=>e[0]+' '+Math.round(e[1]/1024)+'KB')};}o.co=LTH2.sz;}catch(e){}return o;}
