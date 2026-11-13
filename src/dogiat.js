/* ---------- MÁY ĐO GIẬT ----------
   Game tự ghi mỗi lần khựng (một khung hình lâu hơn 50 ms) và phần nào chiếm nhiều thời gian nhất trong khung đó.
   Xem ở Cài đặt → "Đo giật": số lần trong 5 phút gần nhất, lần nặng nhất, do phần nào. Chụp màn hình gửi người làm game là biết chỗ sửa.
   Gọi ldGiat() trong bảng điều khiển để xem chi tiết. Chi phí đo: vài phép đọc đồng hồ mỗi khung hình. */
const DG={acc:{},ev:[],last:0,on:1,N:{animTick:'chuyển động, chơi chung',mpTick:'chơi chung',ldbEmit:'nhận dữ liệu máy chủ',foesTick:'kẻ địch, lính',folkTick:'người làng',skyTick:'trời, nước',grassTick:'cỏ',cullTick:'ẩn hiện cây cối',save:'ghi bản lưu',uiHud:'bảng chỉ số',miniTick:'bản đồ nhỏ',dayTick:'ngày đêm',aqTick:'Tự làm',animalsTick:'thú',cropsTick:'cây trồng',rlTick:'lãnh địa',rlMpCalc:'tính giữ đất',mpRemoteApply:'công trình hàng xóm',pvpIn:'biên bản cướp phá',perfTick:'cân chỉnh độ nét',ve:'vẽ hình (card đồ hoạ)'}};
(function(){for(const n of Object.keys(DG.N)){if(n==='ve')continue;try{const f=(0,eval)(n);if(typeof f!=='function')continue;window.__dgw=function(){const t=performance.now();try{return f.apply(this,arguments);}finally{DG.acc[n]=(DG.acc[n]||0)+performance.now()-t;}};(0,eval)(n+'=__dgw');}catch(e){}}try{delete window.__dgw;}catch(e){}
  const fr=()=>{requestAnimationFrame(fr);const now=performance.now();try{
      if(typeof G!=='undefined'&&G.on&&G.R&&!G.R.__dg){G.R.__dg=1;const r=G.R.render;G.R.render=function(){const t=performance.now();try{return r.apply(this,arguments);}finally{DG.acc.ve=(DG.acc.ve||0)+performance.now()-t;}};}
      const d=now-DG.last;if(DG.last&&d>50&&d<3000&&typeof G!=='undefined'&&G.on&&!G.paused&&!document.hidden&&G.t>15){let bk='',bv=0,sum=0;for(const k in DG.acc){const v=DG.acc[k];if(k!=='animTick')sum+=v;if(v>bv&&k!=='animTick'){bv=v;bk=k;}}
        /* phần đo được chiếm dưới 35% thời gian khung: việc nằm ngoài mã game (trình duyệt dọn bộ nhớ, card đồ hoạ, máy bận việc khác) */
        DG.ev.push([Date.now(),Math.round(d),bv>d*0.35?bk:'ngoai',Math.round(bv)]);if(DG.ev.length>400)DG.ev.splice(0,100);}
    }catch(e){}DG.acc={};DG.last=now;};requestAnimationFrame(fr);
  document.addEventListener('visibilitychange',()=>{DG.last=0;});})();
function ldGiat(){const now=Date.now(),E=DG.ev.filter(e=>now-e[0]<300000),by={};for(const e of E){const a=by[e[2]]||(by[e[2]]={n:0,max:0});a.n++;a.max=Math.max(a.max,e[1]);}
  const L=Object.entries(by).sort((a,b)=>b[1].n-a[1].n).map(([k,a])=>(k==='ngoai'?'ngoài mã game (trình duyệt, card đồ hoạ)':DG.N[k]||k)+': '+a.n+' lần, nặng nhất '+a.max+' ms');
  let nhip=0;if(E.length>2){const g=[];for(let i=1;i<E.length;i++)g.push((E[i][0]-E[i-1][0])/1000);g.sort((a,b)=>a-b);nhip=+g[Math.floor(g.length/2)].toFixed(1);}let bo=0;try{bo=Math.round(performance.memory.usedJSHeapSize/1e6);}catch(e){}
  return {lan:E.length,nangNhat:E.reduce((m,e)=>Math.max(m,e[1]),0),theo:L,nhip,boNho:bo};}
setInterval(()=>{try{if(typeof G==='undefined'||!G.on||G.panel!=='settings')return;const bd=document.querySelector('#panel .p-body');if(!bd)return;let el=bd.querySelector('.dg-b');const r=ldGiat();
    const h=`<b>📈 Đo giật (5 phút gần nhất)</b><span class="small muted">${r.lan?`Khựng <b>${r.lan}</b> lần, nặng nhất <b>${r.nangNhat} ms</b>${r.nhip?`, thường cách nhau <b>${r.nhip} giây</b>`:''}${r.boNho?` · bộ nhớ ${r.boNho} MB`:''}.<br>${r.theo.slice(0,4).map(esc).join('<br>')}`:'Chưa ghi nhận lần khựng nào.'}</span>`;
    if(!el){el=document.createElement('div');el.className='dg-b';const hn=bd.querySelector('.hn-b');if(hn)hn.after(el);else bd.prepend(el);}if(el.innerHTML!==h)el.innerHTML=h;}catch(e){}},1500);
{const s=document.createElement('style');s.textContent='#game .panel .dg-b{display:flex;flex-direction:column;gap:3px;padding:9px 11px;margin-bottom:10px;border-radius:12px;background:rgba(120,160,230,.08);border:1px solid rgba(120,160,230,.35);font-size:14px}';document.head.appendChild(s);}
