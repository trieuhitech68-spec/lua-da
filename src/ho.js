/* ===================== NHÀ LÀ NƠI AN TOÀN: BẢO HỘ KHI VẮNG · VỀ NHÀ KHI ĐĂNG NHẬP · THUA TRẬN RƠI ĐỒ =====================
   1. ĐIỂM VỀ: giường / chỗ ngủ bạn nằm gần nhất được ghi làm "nhà" (S.ho.bed). Thoát game quá 10 phút, lần sau vào game bạn tỉnh dậy ở đó
      (không còn đứng trơ giữa rừng hay trong nhà kẻ khác). Ngất đi cũng tỉnh lại ở đó.
   2. BẢO HỘ KHI VẮNG (thế giới chung): nếu lúc thoát bạn đang ở trong nhà mình (cách điểm về dưới 13 m) thì nhà được bảo hộ, người khác không
      cướp phá được trong: Nhà nhỏ 4 giờ · Nhà lớn 8 giờ · Nhà dài 12 giờ thật (Lều không được bảo hộ); có từ 8 đoạn rào cọc / chòi canh / hố chông
      thì thêm 4 giờ. Bảo hộ tính từ lúc bạn rời game 5 phút. Thoát ở ngoài đường thì nhà KHÔNG được bảo hộ. Liên minh đang có chiến tranh với
      liên minh bạn vẫn đánh được (chiến tranh thì không có bảo hộ). Khiên 12 giờ sau khi bị cướp vẫn như cũ.
   3. THUA TRẬN RƠI ĐỒ: bị lính gác / lính giữ cờ của người khác hạ gục thì rơi lại một nửa số ô vật liệu ngay chỗ ngã (kể cả chế độ Thong thả),
      mất luôn khiên; đồ nằm đó 3 ngày công, quay lại nhặt được (nếu còn sống sót mà tới). Bị thú hay bộ lạc hạ thì theo luật cũ của chế độ chơi. */
function hoS(){if(!S.ho||typeof S.ho!=='object')S.ho={};return S.ho;}
function hoBed(){const id=hoS().bed;let b=id!=null?S.builds.find(x=>x.id===id&&x.prog==null):null;if(!b)b=S.builds.find(x=>x.prog==null&&!x.remote&&pieceDef(x.k)&&pieceDef(x.k).bed);return b||null;}
function hoTier(){try{const b=hoBed();if(!b||typeof NHA==='undefined')return 0;const o=NHA.list.find(x=>x.b===b);return o?o.tier:0;}catch(e){return 0;}}
function hoAtHome(){const b=hoBed();return !!b&&Math.hypot(b.x-P.x,b.z-P.z)<260;}
// số giờ bảo hộ nếu thoát ngay lúc này
function hoHours(fort){if(!hoAtHome())return 0;const t=hoTier(),h=[0,0,4,8,12][t]||0;if(!h)return 0;if(fort==null){fort=0;for(const b of S.builds)if(b.prog==null&&/palisade|watchtower|spikePit|rampart|SpikeFence/i.test(b.k))fort++;}return h+(fort>=8?4:0);}
// ngủ ở đâu thì đó là điểm về
{const _sl=sleep;sleep=function(b){try{if(b&&b.id!=null&&!b.remote&&hoS().bed!==b.id){hoS().bed=b.id;uiToast('🏠 Đã ghi chỗ ngủ này làm điểm về: thoát game hoặc ngất đi sẽ tỉnh dậy ở đây.','good');}}catch(e){}return _sl.apply(this,arguments);};}
// ngất: tỉnh lại ở điểm về (mã gốc lấy giường đầu tiên tìm thấy)
{const _die=die;die=function(){const pv=G.t-(G.hoPvpT||-99)<25;if(pv&&!G.dying){try{const lost={};let n=0;let q=0;S.inv.forEach((s,i)=>{if(s&&ITEMS[s.id]&&ITEMS[s.id].t==='res'&&(q++%2===0)){/* đúng một nửa số ô vật liệu (ô thứ 1, 3, 5…) */lost[s.id]=(lost[s.id]||0)+s.n;S.inv[i]=null;n++;}});
      if(n&&typeof M2I==='function'){const M=M2I(),g=M.ev.grave;if(g&&g.it)for(const k in g.it)lost[k]=(lost[k]||0)+g.it[k];M.ev.grave={x:+P.x.toFixed(1),z:+P.z.toFixed(1),it:lost,day:S.day};try{m3GraveShow();}catch(e){}}
      if(S.pvp)S.pvp.sh=0;uiToast(`⚔️ Bạn bị lính gác hạ gục${n?': rơi lại '+n+' ô vật liệu ở chỗ ngã (quay lại nhặt trong 3 ngày)':''}.`,'bad');}catch(e){console.warn('rơi đồ',e);}}
  const r=_die.apply(this,arguments);const b=hoBed();if(b)setTimeout(()=>{try{if(S&&!G.sleeping){P.x=b.x+24;P.z=b.z+24;P.y=groundY(P.x,P.z,P.y+60);}}catch(e){}},1700);return r;};}
{const _fh=foeHit;foeHit=function(f,t){if(f&&f.pvp&&t&&t.pl)G.hoPvpT=G.t;return _fh.apply(this,arguments);};}
// vào game sau khi vắng lâu: tỉnh dậy ở nhà
{const _sv=save;save=function(){try{if(S&&G.hoIn)hoS().out=Date.now();}catch(e){}return _sv.apply(this,arguments);};}
setInterval(()=>{try{if(!G.on||!S||G.hoIn)return;if(!G.hoT0){G.hoT0=performance.now();return;}if(performance.now()-G.hoT0<1200)return;G.hoIn=1;const H=hoS(),away=H.out?Date.now()-H.out:0,b=hoBed();
  if(b&&away>600000&&Math.hypot(b.x-P.x,b.z-P.z)>120&&!G.ride){P.x=b.x+24;P.z=b.z+24;P.y=groundY(P.x,P.z,P.y+60);G.walkTo=null;uiToast(`🏠 Bạn tỉnh dậy ở nhà sau ${away>7200000?Math.round(away/3600000)+' giờ':Math.round(away/60000)+' phút'} vắng mặt.`,'good');}
  H.out=Date.now();}catch(e){}},700);
// bảng Nhà của bạn: thêm dòng điểm về + bảo hộ
if(typeof nhaHtml==='function'){const _nh=nhaHtml;nhaHtml=function(){let h=_nh.apply(this,arguments);try{const b=hoBed(),t=hoTier(),hh=hoHours();const mp=!!S.mp;
  const row=`<div class="nha-r on ho-r"><span>🛏️</span><div><b>Điểm về${b?': '+esc(pieceDef(b.k).n)+' · cách '+Math.max(1,Math.round(Math.hypot(b.x-P.x,b.z-P.z)/20))+' m':''}</b><small>${b?'Thoát game quá 10 phút hoặc ngất đi sẽ tỉnh dậy ở đây. Ngủ ở giường khác để đổi điểm về.':'Chưa có: dựng chỗ ngủ rồi ngủ một giấc để ghi điểm về.'}${mp?(hh?` <b class="ho-ok">Thoát bây giờ: nhà được bảo hộ ${hh} giờ.</b>`:b?(hoAtHome()?' <b class="ho-no">Nhà còn là Lều: lợp từ 4 tấm mái quanh giường mới được bảo hộ khi vắng.</b>':' <b class="ho-no">Bạn đang ở ngoài: thoát bây giờ thì nhà KHÔNG được bảo hộ. Về nhà rồi hãy thoát.</b>'):''):''}</small></div></div>`;
  const i=h.indexOf('<div class="nha-r');h=i>0?h.slice(0,i)+row+h.slice(i):h+row;}catch(e){}return h;};}
// nhắc khi sắp thoát ở ngoài đường (thế giới chung, có nhà đủ lớn)
{const st=document.createElement('style');st.textContent='.ho-ok{color:#8ce07a;font-weight:700}.ho-no{color:#ffb86a;font-weight:700}';document.head.appendChild(st);}
