/* ===================== TỰ CÂN CHỈNH HIỆU NĂNG THEO MÁY (phần nối tiếp bộ giảm độ nét sẵn có) =====================
   Game đã có sẵn bộ tự giảm ĐỘ NÉT (perfTick: hạ dần tới 55%, rồi hạ mức đồ hoạ). Nhưng máy yếu ở mức đồ hoạ thấp nhất, độ nét đã chạm đáy mà vẫn giật
   thì không còn gì để hạ: lúc đó nghẽn ở SỐ VẬT phải vẽ (khoảng 590 nghìn tam giác, 250 lần vẽ mỗi khung trên điện thoại), không phải ở số điểm ảnh.
   Phần này đếm khung hình thật mỗi 3 giây; khi độ nét đã thấp (≤ 62%) mà vẫn dưới 26 khung/giây suốt 6 giây thì hạ thêm một nấc TẦM NHÌN:
     Nấc 1: tầm nhìn 80%.   Nấc 2: tầm nhìn 65%, tắt bóng nắng và lớp toả sáng.   Nấc 3: tầm nhìn 50%, ẩn thảm cỏ quanh người.
   Mượt lâu (trên 50 khung/giây suốt 30 giây) thì nâng lại một nấc; nâng lên mà giật lại ngay thì khoá 5 phút. Nấc được nhớ theo máy.
   Tắt/bật ở Cài đặt → "Tự cân chỉnh cho mượt". */
const HNG={lv:0,fr:0,lo:0,hi:0,t:0,lock:0,base:null,auto:true,VW:[1,0.8,0.65,0.5],fps:0};
try{HNG.auto=localStorage.getItem('ld-perf-auto')!=='0';HNG.lv=clamp(+(localStorage.getItem('ld-perf')||0)|0,0,3);if(!HNG.auto)HNG.lv=0;}catch(e){}
function hnApply(){try{if(typeof G==='undefined'||!G.R||!G.cam)return;const L=HNG.lv;
    if(HNG.base){const v=HNG.VW[L];G.fogF=Math.round(HNG.base.fogF*v);G.fogN=Math.round(HNG.base.fogN*v);G.treeD=Math.round(HNG.base.treeD*v);G.cam.far=G.fogF+300;G.cam.updateProjectionMatrix();}
    G.hnV=HNG.VW[L];G.cullT=0;
    G.noPost=L>=2;if(G.L&&G.L.sun)G.L.sun.castShadow=(G.q|0)>0&&L<2;if(G.grass)G.grass.visible=L<3;try{localStorage.setItem('ld-perf',String(L));}catch(e){}}catch(e){}}
{const _aq=applyQ;applyQ=function(){const r=_aq.apply(this,arguments);try{HNG.base={fogF:G.fogF,fogN:G.fogN,treeD:G.treeD||G.fogF};hnApply();}catch(e){}return r;};}
(function(){const tick=()=>{HNG.fr++;requestAnimationFrame(tick);};requestAnimationFrame(tick);
  setInterval(()=>{try{const fr=HNG.fr;HNG.fr=0;if(typeof G==='undefined'||!G.on||G.paused||document.hidden||!fr){HNG.lo=HNG.hi=0;return;}const fps=fr/3;HNG.fps=fps;if(!HNG.auto)return;
      if(G.t<12||(G.t-HNG.t)<9){HNG.lo=HNG.hi=0;return;}/* mới vào game / vừa đổi nấc: chờ ổn định */
      if(HNG.lv>=3&&fps<46&&(G.q|0)>0&&!HNG.qStop){/* đã giảm hết tầm nhìn, độ nét mà vẫn nặng: hạ luôn mức chất lượng (Đẹp → Vừa → Nhẹ). Người chơi chọn lại mức cao hơn thì thôi không tự hạ nữa trong lần chơi này. */HNG.hi=0;if(++HNG.lo>=3){HNG.lo=0;G.q=(G.q|0)-1;HNG.qAuto=G.q;HNG.t=G.t;try{applyQ();}catch(e){}uiToast('⚙️ Máy vẫn nặng: game hạ chất lượng xuống '+(G.q===1?'Vừa':'Nhẹ')+' cho mượt. Muốn đổi lại: Cài đặt → Đồ họa.','');try{if(G.panel==='settings')uiOpenRefresh();}catch(e){}}}
      else if(fps<26&&(G.prK||1)<=0.62){HNG.hi=0;if(++HNG.lo>=2&&HNG.lv<3){HNG.lo=0;const up=G.t-(HNG.upT||-999)<25;HNG.lv++;HNG.t=G.t;if(up)HNG.lock=G.t+300;hnApply();if(!HNG.told){HNG.told=1;uiToast('⚙️ Máy đang nặng: game tự giảm tầm nhìn cho mượt. Tắt ở Cài đặt → "Tự cân chỉnh cho mượt".','');}}}
      else if(fps>50){HNG.lo=0;if(++HNG.hi>=10&&HNG.lv>0&&G.t>HNG.lock){HNG.hi=0;HNG.lv--;HNG.t=G.t;HNG.upT=G.t;hnApply();}}
      else{HNG.lo=0;HNG.hi=0;}}catch(e){}},3000);})();
/* công tắc trong Cài đặt */
setInterval(()=>{try{if(typeof G==='undefined'||!G.on||G.panel!=='settings')return;const bd=document.querySelector('#panel .p-body');if(!bd||bd.querySelector('.hn-b'))return;
    bd.insertAdjacentHTML('afterbegin',`<div class="hn-b"><label><input type="checkbox" data-a="hnauto" ${HNG.auto?'checked':''}> <b>Tự cân chỉnh cho mượt</b></label><span class="small muted">Game tự đo tốc độ trên máy bạn: giật thì giảm độ nét, tầm nhìn; mượt thì nâng lại. Hiện: khoảng <b>${Math.round(HNG.fps)||'?'}</b> khung/giây · độ nét ${Math.round((G.prK||1)*100)}% · nấc giảm tầm nhìn <b>${HNG.lv}</b>/3.</span></div>`);}catch(e){}},700);
document.addEventListener('change',e=>{const b=e.target;if(!b||!b.dataset||b.dataset.a!=='hnauto')return;HNG.auto=!!b.checked;try{localStorage.setItem('ld-perf-auto',HNG.auto?'1':'0');}catch(er){}if(!HNG.auto){HNG.lv=0;hnApply();}},true);
{const s=document.createElement('style');s.textContent='#game .panel .hn-b{display:flex;flex-direction:column;gap:3px;padding:9px 11px;margin-bottom:10px;border-radius:12px;background:rgba(120,200,100,.08);border:1px solid rgba(120,200,100,.35)}#game .panel .hn-b label{display:flex;align-items:center;gap:8px;font-size:14px}#game .panel .hn-b input{width:20px;height:20px}';document.head.appendChild(s);}
/* CHỐNG GIẬT khi đi tới vùng mới: bộ vẽ chỉ biên dịch chương trình tô bóng của một vật vào đúng lần đầu vật đó hiện ra, làm khựng một nhịp giữa lúc chơi.
   Biên dịch sẵn toàn bộ ngay lúc vừa vào game (đang còn màn mở đầu), và làm lại một lần mỗi khi số chương trình tăng thêm nhiều (dựng công trình loại mới). */
setInterval(()=>{try{if(typeof G==='undefined'||!G.on||!G.R||!G.sc||!G.cam||G.t<1.5)return;if(!HNG.comp){HNG.comp=1;G.R.compile(G.sc,G.cam);HNG.np=(G.R.info.programs||[]).length;}}catch(e){}},1000);

/* người chơi tự chọn mức cao hơn mức game vừa tự hạ: tôn trọng, không tự hạ nữa */
document.addEventListener('click',e=>{try{const b=e.target&&e.target.closest&&e.target.closest('[data-a="q"]');if(b&&HNG.qAuto!=null&&+b.dataset.v>HNG.qAuto)HNG.qStop=1;}catch(er){}},true);

/* ---------- MÁT MÁY: máy không giữ nổi 60 khung/giây thì chạy đều 30 ----------
   Trước: máy chỉ đạt 38-46 khung/giây vẫn bị coi là "ổn" nên game cứ vắt hết sức máy: nóng, quạt kêu, khung hình lúc nhanh lúc chậm trông như giật.
   Giờ: · ngưỡng hạ độ nét sớm hơn (dưới ~46 khung/giây đã hạ, trước là dưới 37);
        · độ nét đã hạ tới 70% mà suốt 16 giây vẫn không đạt 46 khung/giây (và người chơi chưa tự chọn giới hạn khung hình) thì tự đặt giới hạn 30 khung/giây:
          hình chạy ĐỀU hơn và máy chỉ làm một nửa việc nên mát hẳn. Đổi lại ở Cài đặt → Đồ họa → Giới hạn khung hình (chọn rồi thì game không tự đổi nữa). */
{const _pt=perfTick;let n=0,t0=0;perfTick=function(dt){const r=_pt.apply(this,arguments);try{if(typeof SET==='undefined'||SET.fpsCap===30||!G.on||G.paused)return r;if(G.t-t0<2&&G.t>=t0)return r;t0=G.t;
      let user=0;try{user=localStorage.getItem('ld-cap-user')==='1';}catch(e){}if(user||(G.pfWarm||0)<8){n=0;return r;}
      if((G.prK||1)<=0.71&&(G.ft||0)>0.0215){if(++n>=8){n=0;SET.fpsCap=30;try{setSave();}catch(e){}uiToast('🌡️ Máy đang phải gắng sức: game chuyển sang chạy đều 30 khung/giây cho mát máy, đỡ giật. Đổi lại ở Cài đặt → Đồ họa → Giới hạn khung hình.','');try{if(G.panel==='settings')uiOpenRefresh();}catch(e){}}}else n=0;}catch(e){}return r;};}
document.addEventListener('click',e=>{try{const b=e.target&&e.target.closest&&e.target.closest('[data-spc="fpsCap"]');if(b)localStorage.setItem('ld-cap-user','1');}catch(er){}},true);
