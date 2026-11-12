/* ===================== HƯỚNG DẪN CHỈ TẬN TAY + CÔNG DỤNG TỪNG MÓN =====================
   1. CHỈ TẬN TAY: thay vì chỉ hiện chữ rồi người chơi bấm qua, mỗi hướng dẫn giờ có chuỗi bước: khoanh sáng ĐÚNG NÚT cần bấm, bàn tay 👆 chỉ vào,
      một dòng nói phải làm gì; bấm đúng nút đó (hoặc làm xong việc) mới sang bước sau. Có "Làm giúp tôi" (bấm hộ) và "Bỏ qua".
      Chạy ngay sau khi đóng thẻ hướng dẫn tương ứng; xem lại ở ☰ Thêm → Hướng dẫn.
   2. CÔNG DỤNG: mỗi món trong Chế tạo có dòng ghi dùng để làm gì và chỉ số (sức đánh, giữ ấm, đỡ đòn, no bụng, chữa gì). Tắt/bật bằng nút 💡. */
const CT={st:null,i:0,t0:0,el:null};
const ctQ=s=>{try{const e=typeof s==='function'?s():document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return r.width>2&&r.height>2&&(e.offsetParent!==null||getComputedStyle(e).position==='fixed')?e:null;}catch(e){return null;}};
const CT_FLOW={
 batdau:[{s:'#goal',t:'Đây là <b>Mục tiêu</b>: việc nên làm tiếp theo. Chạm vào để xem chi tiết.',w:'next'},
   {s:'#goal .au-gb',t:'Bấm <b>▶ Tự làm</b>: nhân vật tự đi nhặt, tự làm mục tiêu này cho bạn.',w:'click'},
   {s:'#menu [data-ui="bag"]',t:'<b>Túi</b>: đồ nhặt được nằm ở đây. Bấm thử.',w:'click'},
   {s:'.panel .x,.panel [data-a="close"],#panel .p-x',t:'Bấm ✕ để đóng bảng và chơi tiếp.',w:'click'}],
 chetao:[{s:'#menu [data-ui="craft"]',t:'Bấm <b>Chế tạo</b> để xem các món làm được.',w:'click'},
   {s:'.panel .c5f [data-k="cu"]',t:'Hàng nút này <b>lọc theo nhóm</b>. Bấm <b>Dụng cụ</b> để chỉ xem dụng cụ.',w:'click'},
   {s:()=>document.querySelector('.panel .rc:not(.dim) [data-a="craft"]')||document.querySelector('.panel .rc-a .aq-need'),t:'Món đủ vật liệu thì bấm <b>Làm</b>. Thiếu thì bấm <b>🤖 Tự kiếm & làm</b>: nhân vật tự đi kiếm.',w:'click'}],
 xay:[{s:'#menu [data-ui="build"]',t:'Bấm <b>Xây</b> để chọn công trình.',w:'click'},
   {s:()=>document.querySelector('.panel .bc[data-a="build"]:not(.dim)')||document.querySelector('.panel .bc[data-a="build"]'),t:'Chọn một công trình. Ô mờ là còn thiếu vật liệu (giữ lâu để 📌 ghim vật liệu ra màn hình).',w:'click'},
   {s:'#buildBar [data-k="place"]',t:'Khung xanh là đặt được. Chạm chỗ muốn dựng rồi bấm <b>✔</b>.',w:'click'}],
 bithuong:[{s:'#menu [data-ui="l4"]',t:'Bấm <b>Nhân vật</b> để xem tình trạng cơ thể.',w:'click'},
   {s:'[data-h4="tab"][data-t="bd"]',t:'Mở thẻ <b>Thể trạng</b>.',w:'click'},
   {s:'[data-a="l4treat"]',t:'Bấm <b>Rửa vết thương</b> rồi <b>Băng lá</b>. Thiếu băng thì vào Chế tạo → Thuốc → Băng lá rau má.',w:'click'}],
 ghim:[{s:()=>document.querySelector('.panel .gm-b'),t:'Bấm <b>📌</b> để ghim món này: vật liệu còn thiếu sẽ hiện ở góc màn hình.',w:'click'},
   {s:'.panel .x,.panel [data-a="close"],#panel .p-x',t:'Đóng bảng lại để thấy thẻ ghim.',w:'click'},{s:'#pinw .pin-c',t:'Đây là thẻ ghim: số <b>đang có / cần</b>. Bấm 🤖 để nhân vật tự đi kiếm.',w:'next'}],
 nghiencuu:[{s:'#menu .ui5-mb',t:'Bấm <b>☰ Thêm</b>.',w:'click'},{s:'#menu [data-ui="nc"]',t:'Bấm <b>📜 Nghiên cứu</b>.',w:'click'},{s:'#ncw [data-nc="go"]',t:'Chọn một kỹ thuật rồi bấm <b>Nghiên cứu</b>. Thoát game vẫn tính giờ.',w:'next'}]};
function ctStart(id){const f=CT_FLOW[id];if(!f||CT.st)return false;CT.st=f;CT.id=id;CT.i=0;CT.t0=performance.now();CT.miss=0;ctDraw();return true;}
function ctEnd(){CT.st=null;if(CT.el)CT.el.hidden=true;}
function ctNext(){if(!CT.st)return;CT.i++;CT.t0=performance.now();CT.miss=0;if(CT.i>=CT.st.length){ctEnd();try{uiToast('✅ Xong phần hướng dẫn này. Xem lại ở ☰ Thêm → Hướng dẫn.','good');}catch(e){}return;}ctDraw();}
function ctDraw(){if(!CT.st)return;let el=CT.el;if(!el){el=CT.el=document.createElement('div');el.id='ctw';el.innerHTML='<div class="ct-ring"></div><div class="ct-hand">👆</div><div class="ct-b"><p></p><div class="ct-r"><button data-ct="do">Làm giúp tôi</button><button data-ct="next" class="ct-n">Tiếp ›</button><button data-ct="skip" class="ct-s">Bỏ qua</button></div></div>';document.body.appendChild(el);
    el.addEventListener('click',e=>{const b=e.target.closest('[data-ct]');if(!b)return;e.stopPropagation();const st=CT.st&&CT.st[CT.i];if(b.dataset.ct==='skip'){ctEnd();return;}if(b.dataset.ct==='next'){ctNext();return;}if(b.dataset.ct==='do'&&st){const t=ctQ(st.s),i0=CT.i;if(t){try{t.click();}catch(er){}}setTimeout(()=>{if(CT.st&&CT.i===i0)ctNext();},260);}});}
  const st=CT.st[CT.i],t=ctQ(st.s),ring=el.querySelector('.ct-ring'),hand=el.querySelector('.ct-hand'),bub=el.querySelector('.ct-b');
  if(!t){CT.miss++;el.hidden=CT.miss<4?el.hidden:true;if(performance.now()-CT.t0>12000)ctNext();return;}CT.miss=0;el.hidden=false;const r=t.getBoundingClientRect(),pad=5,W=innerWidth,H=innerHeight;
  ring.style.cssText=`left:${r.left-pad}px;top:${r.top-pad}px;width:${r.width+pad*2}px;height:${r.height+pad*2}px`;
  const below=r.bottom+150<H;hand.style.cssText=`left:${Math.min(W-34,Math.max(4,r.left+r.width/2-14))}px;top:${below?r.bottom+2:r.top-34}px;transform:rotate(${below?0:180}deg)`;
  bub.querySelector('p').innerHTML=`<small>Bước ${CT.i+1}/${CT.st.length}</small>${st.t}`;bub.querySelector('.ct-n').hidden=st.w!=='next';bub.querySelector('[data-ct="do"]').hidden=st.w!=='click';
  const bw=Math.min(300,W-20);bub.style.width=bw+'px';bub.style.left=Math.min(W-bw-10,Math.max(10,r.left+r.width/2-bw/2))+'px';if(below){bub.style.top=(r.bottom+36)+'px';bub.style.bottom='auto';}else{bub.style.bottom=(H-r.top+38)+'px';bub.style.top='auto';}}
setInterval(()=>{if(CT.st)ctDraw();},250);
/* nghe 'pointerup' (không phải 'click'): nhiều nút của game chặn lan truyền sự kiện click nên nghe click sẽ không thấy */
document.addEventListener('pointerup',e=>{if(!CT.st)return;const st=CT.st[CT.i];if(!st||st.w!=='click')return;const t=ctQ(st.s),i0=CT.i;if(t&&(t===e.target||t.contains(e.target)))setTimeout(()=>{if(CT.st&&CT.i===i0)ctNext();},320);},true);
{const s=document.createElement('style');s.textContent=`#ctw{position:fixed;inset:0;z-index:90;pointer-events:none}#ctw[hidden]{display:none}
.ct-ring{position:fixed;border-radius:12px;border:3px solid #ffd25a;box-shadow:0 0 0 9999px rgba(0,0,0,.5),0 0 18px 4px rgba(255,210,90,.8);animation:ctp 1s ease-in-out infinite}
@keyframes ctp{50%{box-shadow:0 0 0 9999px rgba(0,0,0,.5),0 0 26px 9px rgba(255,210,90,1)}}
.ct-hand{position:fixed;font-size:28px;line-height:1;animation:cth .7s ease-in-out infinite alternate;filter:drop-shadow(0 2px 3px rgba(0,0,0,.6))}@keyframes cth{to{margin-top:7px}}
.ct-b{position:fixed;pointer-events:auto;padding:9px 11px;border-radius:13px;background:#1c130c;border:1px solid #ffd25a;color:#f6ead2;box-shadow:0 8px 22px rgba(0,0,0,.6);font-size:13.5px;line-height:1.35}
.ct-b p{margin:0 0 7px}.ct-b small{display:block;color:#ffd25a;font-weight:800;font-size:10.5px;letter-spacing:.05em;text-transform:uppercase;margin-bottom:2px}
.ct-r{display:flex;gap:6px;flex-wrap:wrap}.ct-r button{min-height:32px;padding:4px 10px;border-radius:9px;border:1px solid #6ab85a;background:linear-gradient(180deg,#3b7a34,#2a5a26);color:#fff;font:700 12px inherit}
.ct-r .ct-n{border-color:#ffd25a;background:rgba(255,210,90,.18);color:#ffe9b8}.ct-r .ct-s{margin-left:auto;border-color:rgba(255,255,255,.25);background:none;color:#cdbb98;font-weight:600}.ct-r [hidden]{display:none}
#game .panel .cd-i{display:block;font-size:11.5px;line-height:1.3;color:#d9c9a6;margin-top:3px}#game .panel .cd-i b{color:#a8e59a;font-weight:700}#game .panel.cd-off .cd-i{display:none}
#game .panel .cd-t{margin-left:auto}`;document.head.appendChild(s);}
/* nối với thẻ hướng dẫn: đóng thẻ là bắt đầu chỉ tận tay */
if(typeof HD_L!=='undefined'){HD_L.push({id:'chetao',ic:'🛠️',t:'Chế tạo',w:()=>G.t>90&&S.goal>=2&&S.goal<=6&&!G.panel,p:['Nhiều thứ phải <b>tự làm</b>: rìu, dao, dây thừng, quần áo, thuốc. Mở <b>Chế tạo</b> để xem công thức.','Hàng nút trên cùng <b>lọc theo nhóm</b>: Đồ ăn, Dụng cụ, Vũ khí, Mặc, Thuốc, Vật liệu. Mỗi món có dòng ghi <b>công dụng</b>.','Đóng thẻ này, game sẽ <b>chỉ từng nút</b> cho bạn bấm.']});}
{const _hc=hdClose;hdClose=function(){const id=HD.cur&&HD.cur.id;const r=_hc.apply(this,arguments);try{if(id&&CT_FLOW[id]&&!(S.auOn&&AQ.on))setTimeout(()=>ctStart(id),350);}catch(e){}return r;};}
/* ---------- CÔNG DỤNG từng món ---------- */
function cdInfo(id){const I=ITEMS[id];if(!I)return '';const a=[],TN={axe:'chặt cây',pick:'đập đá, đào quặng',spear:'săn thú, đánh xa',knife:'xẻ thịt, đẽo gọt',club:'đánh gần',bow:'bắn tên từ xa',sling:'ném đá từ xa',dig:'đào đất, nhổ cây',hammer:'đóng, ghè đá',sickle:'gặt lúa, cắt cỏ',rod:'câu cá',torch:'soi sáng, xua thú',fire:'nhóm lửa',net:'quăng lưới bắt cá',plough:'cày ruộng',needle:'khâu vá',ladder:'trèo tường thành'};
  if(I.tool){a.push('Dùng để <b>'+(TN[I.tool]||'làm việc')+'</b>');if(I.pow)a.push('sức <b>'+I.pow+'</b>');}
  if(I.slot){const SN={head:'đội đầu',body:'mặc thân',back:'khoác lưng',feet:'đi chân',neck:'đeo cổ',acc:'đeo tay',armor:'giáp',shield:'khiên'};a.push('Đồ <b>'+(SN[I.slot]||'mặc')+'</b>');if(I.warm)a.push('ấm <b>+'+I.warm+'</b>');if(I.arm)a.push('giảm <b>'+Math.round(I.arm*100)+'%</b> sát thương');if(I.blk)a.push('đỡ <b>'+Math.round(I.blk*100)+'%</b> đòn');if(I.rain)a.push('che mưa <b>'+Math.round(I.rain*100)+'%</b>');if(I.spirit)a.push('tăng tinh thần');}
  if(I.food)a.push('Ăn no <b>+'+I.food+'</b>');if(I.water)a.push('giải khát <b>+'+I.water+'</b>');if(I.hp&&!I.tool)a.push('hồi <b>+'+I.hp+'</b> máu');if(I.cure){const st=(typeof STATUS!=='undefined'&&STATUS[I.cure])?STATUS[I.cure].n:I.cure;a.push('chữa <b>'+st+'</b>');}
  if(I.slots)a.push('thêm <b>+'+I.slots+'</b> ô chứa');if(I.plant)a.push('Đem trồng xuống đất');
  let t=a.join(' · ');if(I.ds)t+=(t?'. ':'')+esc(I.ds);
  /* vật liệu, thảo dược: ghi luôn làm ra được những gì (trong các công thức đã biết) */
  if(I.t==='res'||I.t==='herb'||I.t==='seed'){try{const us=[];for(const r of RECIPES){if(!r.in||!(id in r.in)||!S.known['r:'+r.id])continue;const o=Object.keys(r.out)[0];if(ITEMS[o]&&!us.includes(ITEMS[o].n))us.push(ITEMS[o].n);if(us.length>=5)break;}const bs=[];if(typeof BUILD!=='undefined')for(const b of BUILD){if(b.cost&&(id in b.cost)&&S.known['b:'+b.id]){bs.push(b.n);if(bs.length>=3)break;}}
      if(us.length)t+=(t?' ':'')+'Dùng làm: <b>'+us.map(esc).join(', ')+'</b>.';if(bs.length)t+=(t?' ':'')+'Dùng xây: <b>'+bs.map(esc).join(', ')+'</b>.';}catch(e){}}
  if(!t){t=I.t==='res'?'Vật liệu để chế tạo, xây dựng.':'';}return t;}
/* Túi đồ: chạm một món thì hiện công dụng đầy đủ dưới tên món */
setInterval(()=>{try{if(!S||!G.on||G.panel!=='bag'||(G.ptab&&G.ptab!=='bag')||G.selSlot==null)return;const p=document.getElementById('panel'),d=p&&p.querySelector('.det');if(!d||d.querySelector('.cd-i'))return;const s=S.inv[G.selSlot];if(!s)return;const t=cdInfo(s.id);if(!t)return;const host=d.querySelector('p.small')||d.querySelector('div');if(host)host.insertAdjacentHTML('afterend','<span class="cd-i">💡 '+t+'</span>');}catch(e){}},400);
setInterval(()=>{try{if(!S||!G.on||G.panel!=='bag'||G.ptab!=='craft')return;const p=document.getElementById('panel');if(!p)return;let off=false;try{off=localStorage.getItem('ld-cd')==='0';}catch(e){}p.classList.toggle('cd-off',off);
    p.querySelectorAll('.rc').forEach(c=>{if(c.querySelector('.cd-i'))return;const b=c.querySelector('.rc-a [data-r]');if(!b)return;const r=RECIPES.find(x=>x.id===b.dataset.r);if(!r)return;const t=cdInfo(Object.keys(r.out)[0]);if(!t)return;const host=c.querySelector('.rc-b');if(host)host.insertAdjacentHTML('beforeend','<span class="cd-i">💡 '+t+'</span>');});
    const f=p.querySelector('.c5f');if(f&&!f.querySelector('.cd-t'))f.insertAdjacentHTML('beforeend',`<button class="tb sm cd-t" data-a="cdtog" aria-label="Bật tắt dòng công dụng">💡 ${off?'Hiện công dụng':'Ẩn công dụng'}</button>`);}catch(e){}},450);
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="cdtog"]');if(!b)return;e.stopImmediatePropagation();let off=false;try{off=localStorage.getItem('ld-cd')==='0';localStorage.setItem('ld-cd',off?'1':'0');}catch(er){}b.textContent='💡 '+(off?'Ẩn công dụng':'Hiện công dụng');const p=document.getElementById('panel');if(p)p.classList.toggle('cd-off',!off);},true);
