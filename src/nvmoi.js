/* ===================== nvmoi: MÀN NHÂN VẬT GỌN, DỄ NHÌN (kiểu game nhập vai tăng cấp, cộng đồ) =====================
   Tham khảo cách các game nhập vai bố trí màn nhân vật: nhân vật đứng giữa, ô trang bị bao quanh; mỗi ô TỰ NÓI trạng thái (viền màu theo phẩm chất,
   số cộng cường hoá, ô trống có dấu +); một dải tóm tắt duy nhất (cấp, danh hiệu, thanh kinh nghiệm, nút nâng); thanh thẻ có biểu tượng + chữ.
   Trước: dưới chân nhân vật có 4 lớp chồng nhau (8 biểu tượng bậc không chữ, dải 3 con số, thanh kinh nghiệm, hàng thẻ chữ nhỏ) → rối.
   Tệp này KHÔNG đổi cách tính gì, chỉ sắp lại phần hiển thị sau mỗi lần màn Nhân vật được vẽ. */
const NVM={TAB:{ov:['📊','Tổng quan'],at:['💪','Thuộc tính'],en:['🔨','Cường hoá'],sk:['⚡','Kỹ năng'],tp:['✨','Thiên phú'],bd:['❤️','Thể trạng'],lt:['🐾','Thú']},
  SLOT:{'Vũ khí':'wp','Dụng cụ':'tl','Giáp':'ar','Đầu':'hd','Khiên':'sh','Áo':'bd','Khoác vai':'bk','Chân':'ft','Cổ':'ac','Tay':'ac'},Q:['Thường','Khá','Tốt','Quý','Hiếm']};
/* phẩm chất món đồ (0 thường → 4 hiếm), suy từ chất liệu: cỏ, gỗ, đá < xương, da, đá lửa < đồng < sắt, ngọc, vàng */
function nvmQ(id){try{const s=String(id||'')+' '+((ITEMS[id]&&ITEMS[id].n)||'');if(/iron|sắt|jade|ngọc|gold|vàng|steel/i.test(s))return 4;if(/bronze|đồng|copper/i.test(s))return 3;if(/flint|đá lửa|bone|xương|leather|da thuộc|hide|da |fur|lông/i.test(s))return 2;if(/stone|đá|wood|gỗ|bamboo|tre/i.test(s))return 1;return 0;}catch(e){return 0;}}
function nvmFix(){try{const el=document.getElementById('h4');if(!el||typeof H4==='undefined'||!H4.on)return;el.classList.add('nvm');
    /* 1) ô trang bị: viền màu phẩm chất, số cộng, ô trống có dấu + */
    el.querySelectorAll('.h5-s').forEach(b=>{if(b.dataset.nvm)return;b.dataset.nvm='1';const lb=(b.querySelector('small')||{}).textContent||'',ic=b.querySelector('[data-ic]'),id=ic&&ic.dataset.ic,k=NVM.SLOT[b.getAttribute('aria-label')]||NVM.SLOT[lb];
      if(id){b.classList.add('q'+nvmQ(id));}else{b.classList.add('nvm-e');}let en=0;try{if(k&&typeof dpLv==='function')en=dpLv(k)|0;}catch(e){}const old=b.querySelector('em');if(old)old.remove();if(en>0&&id)b.insertAdjacentHTML('beforeend','<em>+'+en+'</em>');});
    /* 2) một dải tóm tắt thay cho ba lớp cũ */
    const sh=el.querySelector('.h4-sheet');if(sh&&!sh.querySelector('.nvm-sum')){const lv=heroLv(),ri=heroRankI(),RK=HERO_RANK[ri],bar=sh.querySelector('.h4-xp .h2-bar i'),w=bar?bar.style.width:'0%',tx=(sh.querySelector('.h4-xp span')||{}).textContent||'',pts=heroPts(),up=sh.querySelector('.h4-up'),go=up&&up.classList.contains('h4go');
      const d=document.createElement('div');d.className='nvm-sum';d.innerHTML=`<div class="nvm-lv"><small>CẤP</small><b>${lv}</b></div><div class="nvm-mid"><div class="nvm-tt">${RK[2]} ${esc(RK[1])} <em>Bậc ${['I','II','III','IV','V','VI','VII','VIII','IX','X'][ri]}</em></div><div class="h2-bar big"><i style="width:${w}"></i></div><small>${esc(tx)}</small></div><button class="nvm-up${go?' go':''}" data-h4="up" aria-label="Nâng cấp"><b>⬆</b><small>${pts>0?pts+' điểm':'Nâng'}</small></button>`;sh.insertBefore(d,sh.firstChild);}
    /* 3) thanh thẻ: biểu tượng + chữ, có thẻ Tổng quan, kéo ngang được */
    const tb=el.querySelector('.h4-tabs');if(tb&&!tb.dataset.nvm){tb.dataset.nvm='1';if(!tb.querySelector('[data-t="ov"]'))tb.insertAdjacentHTML('afterbegin','<button data-h4="tab" data-t="ov"></button>');
      tb.querySelectorAll('button[data-t]').forEach(b=>{const T=NVM.TAB[b.dataset.t];if(!T)return;const dot=!!b.querySelector('i');b.innerHTML=`<span>${T[0]}</span><b>${T[1]}</b>${dot?'<i></i>':''}`;if(H4.tab===b.dataset.t)b.classList.add('on');});
      const cur=tb.querySelector('.on');if(cur)try{cur.scrollIntoView({block:'nearest',inline:'center'});}catch(e){}}
    /* 4) lực chiến có chữ */
    const pw=el.querySelector('.h4-pow');if(pw&&!pw.dataset.nvm){pw.dataset.nvm='1';const s=pw.querySelector('span');if(s)s.outerHTML='<span class="nvm-pl">LỰC CHIẾN</span>';}}catch(e){}}
{const _d=h4Draw;h4Draw=function(){const r=_d.apply(this,arguments);try{nvmFix();}catch(e){}return r;};}
setInterval(()=>{try{if(typeof H4!=='undefined'&&H4.on)nvmFix();}catch(e){}},400);
(function(){try{const st=document.createElement('style');st.textContent=`
#h4.nvm .h4-rk,#h4.nvm .h4-strip,#h4.nvm .h4-xp{display:none!important}
#h4.nvm .nvm-sum{display:flex;align-items:center;gap:10px;padding:8px 10px;margin:2px 0 8px;border-radius:14px;background:linear-gradient(180deg,rgba(60,48,34,.96),rgba(30,24,18,.96));border:1px solid rgba(255,210,122,.35)}
#h4.nvm .nvm-lv{flex:none;width:56px;height:56px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 35% 30%,#ffe7a8,#d99a2b 60%,#8a5a12);color:#2a1a06;box-shadow:0 2px 8px rgba(0,0,0,.5),inset 0 0 0 2px rgba(255,255,255,.35)}
#h4.nvm .nvm-lv small{font-size:9px;font-weight:800;letter-spacing:1px;line-height:1}#h4.nvm .nvm-lv b{font-size:22px;line-height:1}
#h4.nvm .nvm-mid{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:4px}#h4.nvm .nvm-tt{font-weight:800;font-size:15px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#h4.nvm .nvm-tt em{font-style:normal;font-size:11px;font-weight:800;color:#2a1a06;background:#ffd27a;border-radius:8px;padding:1px 6px;margin-left:4px}
#h4.nvm .nvm-mid small{font-size:11px;color:#d8cdb8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#h4.nvm .nvm-up{flex:none;width:58px;height:56px;border-radius:12px;border:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;background:#3a342c;color:#cfc6b4}#h4.nvm .nvm-up b{font-size:18px;line-height:1}#h4.nvm .nvm-up small{font-size:10px;font-weight:700}
#h4.nvm .nvm-up.go{background:linear-gradient(180deg,#5fd06a,#2a9a3a);color:#fff;box-shadow:0 0 12px rgba(90,220,110,.6);animation:nvmP 1.4s ease-in-out infinite}@keyframes nvmP{50%{transform:scale(1.06)}}
#h4.nvm .h4-tabs{display:flex;gap:6px;overflow-x:auto;padding:4px 2px;background:transparent;scrollbar-width:none}#h4.nvm .h4-tabs::-webkit-scrollbar{display:none}
#h4.nvm .h4-tabs button{flex:0 0 auto;min-width:74px;min-height:52px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:4px 8px;border-radius:12px;background:#26221d;border:1px solid rgba(255,255,255,.1);color:#d8cdb8}
#h4.nvm .h4-tabs button span{font-size:18px;line-height:1}#h4.nvm .h4-tabs button b{font-size:11.5px;font-weight:800;white-space:nowrap}
#h4.nvm .h4-tabs button.on{background:linear-gradient(180deg,#ffe2a0,#e0a63a);color:#2a1a06;border-color:#ffe9b8}#h4.nvm .h4-tabs button i{top:4px;right:6px}
#h4.nvm .h4-pow{display:flex;align-items:center;justify-content:center;gap:8px}#h4.nvm .nvm-pl{font-size:10px;font-weight:800;letter-spacing:2px;color:#ffd27a;opacity:.9}
#h4.nvm .h5-s{border-radius:14px;border-width:2px;box-shadow:0 2px 6px rgba(0,0,0,.45)}#h4.nvm .h5-s.nvm-e{border-style:dashed;border-color:rgba(255,255,255,.22);background:rgba(20,16,13,.6)}#h4.nvm .h5-s.nvm-e span::after{content:'+';position:absolute;right:5px;bottom:14px;font-size:13px;font-weight:900;color:#ffd27a;opacity:.85}
#h4.nvm .h5-s.q0{border-color:#b9b2a4}#h4.nvm .h5-s.q1{border-color:#7fd08a;box-shadow:0 0 8px rgba(110,220,130,.35)}#h4.nvm .h5-s.q2{border-color:#5fa8f0;box-shadow:0 0 8px rgba(90,160,240,.4)}#h4.nvm .h5-s.q3{border-color:#b98af5;box-shadow:0 0 10px rgba(170,120,245,.45)}#h4.nvm .h5-s.q4{border-color:#f5a53c;box-shadow:0 0 12px rgba(245,160,60,.55)}
#h4.nvm .h5-s em{background:linear-gradient(180deg,#ffb23a,#d9781a);border-color:#fff3d0}`;document.head.appendChild(st);}catch(e){}})();
/* ---------- BẢNG ĐẬP ĐỒ: lưới 9 ô ở trên, chạm ô nào thì chi tiết ô đó hiện bên dưới (trước là một danh sách dài đủ 9 ô kèm mọi chi tiết) ---------- */
function nvmDp(){try{const el=document.getElementById('dpw');if(!el||el.hidden)return;const c=el.querySelector('.dp-c');if(!c)return;const items=[...c.querySelectorAll('.dp-i')];if(!items.length)return;c.classList.add('nvm');
    if(!NVM.dpSel||!items.some(i=>i.dataset.k===NVM.dpSel))NVM.dpSel=(items.find(i=>!i.classList.contains('off'))||items[0]).dataset.k;
    const p=c.querySelector('p.small.muted');if(p&&!p.dataset.nvm){p.dataset.nvm='1';const warn=p.querySelector('.dp-warn');const d=document.createElement('details');d.className='nvm-how';d.innerHTML='<summary>Cách cường hoá'+(warn?' · <span class="dp-warn">'+warn.textContent+'</span>':'')+'</summary>';p.parentNode.insertBefore(d,p);d.appendChild(p);}
    let g=c.querySelector('.nvm-grid');if(!g){g=document.createElement('div');g.className='nvm-grid';items[0].parentNode.insertBefore(g,items[0]);
      g.innerHTML=items.map(i=>{const ic=i.querySelector('.dp-ic'),nm=(i.querySelector('.dp-m b')||{}).childNodes?i.querySelector('.dp-m b').childNodes[0].textContent.trim():'',can=!!i.querySelector('.dp-b:not(.ghost)');return `<button class="nvm-t${i.classList.contains('off')?' off':''}${can?' can':''}" data-nvdp="${i.dataset.k}">${ic?ic.outerHTML:''}<small>${esc(nm)}</small></button>`;}).join('');}
    g.querySelectorAll('.nvm-t').forEach(t=>t.classList.toggle('sel',t.dataset.nvdp===NVM.dpSel));items.forEach(i=>i.classList.toggle('sel',i.dataset.k===NVM.dpSel));}catch(e){}}
if(typeof dpDraw==='function'){const _d=dpDraw;dpDraw=function(){const r=_d.apply(this,arguments);try{nvmDp();}catch(e){}return r;};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-nvdp]');if(!b)return;e.stopPropagation();NVM.dpSel=b.dataset.nvdp;try{sfx('pick');}catch(er){}nvmDp();},true);
(function(){try{const st=document.createElement('style');st.textContent=`
.dp-c.nvm .dp-i{display:none}.dp-c.nvm .dp-i.sel{display:flex;border:1px solid rgba(255,210,122,.4);border-radius:14px;padding:12px;background:linear-gradient(180deg,rgba(60,48,34,.5),rgba(26,20,15,.5))}
.dp-c.nvm .dp-i.sel .dp-b{min-height:48px;font-size:16px;font-weight:800;margin-top:6px}.dp-c.nvm .dp-i.sel .dp-fx{font-size:14px}
.nvm-how{margin:2px 0 8px;font-size:12.5px}.nvm-how>summary{cursor:pointer;opacity:.85;padding:4px 0}.nvm-how p{margin:4px 0 0}
.nvm-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:6px 0 12px}
.nvm-t{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 4px 6px;border-radius:12px;border:2px solid rgba(255,255,255,.12);background:#231e19;color:#e8dcc4}
.nvm-t .dp-ic{pointer-events:none}.nvm-t small{font-size:11.5px;font-weight:700;white-space:nowrap}
.nvm-t.off{opacity:.45}.nvm-t.sel{border-color:#ffd27a;background:linear-gradient(180deg,#4a3a22,#2a2016);box-shadow:0 0 10px rgba(255,210,122,.35)}
.nvm-t.can::after{content:'';position:absolute;top:6px;right:8px;width:9px;height:9px;border-radius:50%;background:#5fd06a;box-shadow:0 0 6px #5fd06a}`;document.head.appendChild(st);}catch(e){}})();
/* ---------- PHẨM CHẤT THẬT HƠN + DẤU HIỆU NGOÀI MÀU + SO SÁNH KHI ĐỔI ĐỒ ----------
   · Phẩm chất tính từ CHỈ SỐ của món (ấm, giáp, che mưa, sức công cụ) trước, chất liệu trong tên chỉ là dự phòng.
   · Mỗi ô có thêm hàng chấm ◆ (1-5) dưới góc trái: không cần phân biệt màu vẫn biết món nào hơn.
   · Thẻ món đồ: mỗi món cùng ô trong túi ghi rõ hơn / kém bao nhiêu so với món đang mặc (▲ xanh, ▼ đỏ). */
function nvmScore(I){if(!I)return 0;return (I.warm||0)+(I.arm||0)*100+(I.rain||0)*20+(I.pow||0)*8+(I.foot?4:0)+(I.spirit?3:0);}
{const _q=nvmQ;nvmQ=function(id){try{const I=ITEMS[id];if(I){const s=nvmScore(I);if(I.t==='wear'&&(I.warm||I.arm||I.rain))return s>=30?4:s>=20?3:s>=11?2:s>=5?1:0;if(I.t==='tool'&&I.pow)return I.pow>=3.4?4:I.pow>=2.4?3:I.pow>=1.6?2:I.pow>=1?1:0;}}catch(e){}return _q.apply(this,arguments);};}
function nvmDelta(J,I){const out=[],d=(lb,a,b,f)=>{const v=(a||0)-(b||0);if(Math.abs(v)<1e-6)return;out.push(`<i class="${v>0?'up':'dn'}">${v>0?'▲':'▼'} ${lb} ${v>0?'+':''}${f?f(v):v}</i>`);};
  d('Ấm',J.warm,I&&I.warm);d('Giáp',J.arm,I&&I.arm,v=>Math.round(v*100)+'%');d('Che mưa',J.rain,I&&I.rain,v=>Math.round(v*100)+'%');if(J.foot&&!(I&&I.foot))out.push('<i class="up">▲ Không dẫm gai</i>');if(!J.foot&&I&&I.foot)out.push('<i class="dn">▼ Mất chống gai</i>');return out.join('');}
if(typeof h5SlotCard==='function'){const _c=h5SlotCard;h5SlotCard=function(k){let h=_c.apply(this,arguments);try{if(k!=='wp'&&k!=='tl'){const cur=S.wear&&S.wear[k],I=cur&&ITEMS[cur],seen={};for(const it of S.inv)if(it&&ITEMS[it.id]&&ITEMS[it.id].t==='wear')seen[it.id]=(seen[it.id]||0)+(it.n||1);const done={};
      h=h.replace(/<button class="btn sm" data-a="use" data-i="(\d+)">([\s\S]*?)<\/button>/g,(m,i,inner)=>{const it=S.inv[+i],J=it&&ITEMS[it.id];if(!J)return m;/* nhiều món giống nhau: chỉ hiện một dòng kèm số lượng */if(done[it.id])return '';done[it.id]=1;const dl=nvmDelta(J,I),q=nvmQ(it.id);return `<button class="nvm-eq q${q}" data-a="use" data-i="${i}"><span class="nvm-en">${inner}${seen[it.id]>1?' <small>×'+seen[it.id]+'</small>':''}</span><span class="nvm-dl">${dl||'<i>Ngang nhau</i>'}</span></button>`;});}}catch(e){}return h;};}
{const _f=nvmFix;nvmFix=function(){_f.apply(this,arguments);try{const el=document.getElementById('h4');if(!el)return;el.querySelectorAll('.h5-s').forEach(b=>{if(b.querySelector('.nvm-qp'))return;const ic=b.querySelector('[data-ic]'),id=ic&&ic.dataset.ic;if(!id)return;const q=nvmQ(id);b.insertAdjacentHTML('beforeend','<u class="nvm-qp">'+'◆'.repeat(q+1)+'</u>');b.title=(ITEMS[id]?ITEMS[id].n+' · ':'')+'phẩm chất '+NVM.Q[q];});}catch(e){}};}
(function(){try{const st=document.createElement('style');st.textContent=`
#h4.nvm .nvm-qp{position:absolute;left:3px;bottom:13px;font-size:6.5px;letter-spacing:.5px;text-decoration:none;color:#fff;text-shadow:0 0 2px #000,0 1px 0 #000;line-height:1}
.nvm-eq{display:flex;flex-direction:column;align-items:flex-start;gap:3px;width:100%;text-align:left;padding:8px 10px;border-radius:12px;border:2px solid rgba(255,255,255,.14);background:#26221d;color:#f0e6d2;font-weight:700}
.nvm-eq .nvm-en{display:flex;align-items:center;gap:6px;font-size:14px}.nvm-eq .nvm-dl{display:flex;flex-wrap:wrap;gap:4px 8px;font-size:12px}.nvm-eq .nvm-dl i{font-style:normal;opacity:.8}
.nvm-eq .nvm-dl i.up{color:#6fe07c;opacity:1}.nvm-eq .nvm-dl i.dn{color:#ff7a66;opacity:1}
.nvm-eq.q1{border-color:#7fd08a}.nvm-eq.q2{border-color:#5fa8f0}.nvm-eq.q3{border-color:#b98af5}.nvm-eq.q4{border-color:#f5a53c}`;document.head.appendChild(st);}catch(e){}})();
/* ---------- TÚI ĐỒ gọn: bỏ đoạn giải thích dài và khung trống lớn phía trên lưới; ô đồ có viền phẩm chất, chấm ◆, mũi tên ▲ khi món trong túi TỐT HƠN món đang mặc ---------- */
function nvmBag(){try{if(typeof G==='undefined'||G.panel!=='bag')return;const bd=document.querySelector('#panel .p-body');if(!bd)return;const grid=bd.querySelector('.mxinv');if(!grid)return;bd.classList.add('nvb');
    const tip=bd.querySelector('.kho-tip'),bar=bd.querySelector('.kho-bar');if(tip&&bar&&!bar.querySelector('.nvb-i')){const b=document.createElement('button');b.className='btn sm ghost nvb-i';b.textContent='ⓘ';b.setAttribute('aria-label','Giải thích về kho');b.onclick=e=>{e.stopPropagation();tip.classList.toggle('show');};bar.appendChild(b);}
    const det=bd.querySelector('.kho-det');if(det)det.classList.toggle('nvb-empty',det.children.length===1&&det.firstElementChild.matches('p.muted'));
    grid.querySelectorAll('.sl').forEach(b=>{const ic=b.querySelector('[data-ic]'),id=ic&&ic.dataset.ic,key=id||'';if(b.dataset.nvb===key)return;b.dataset.nvb=key;b.classList.remove('q0','q1','q2','q3','q4');b.querySelectorAll('.nvm-qp,.nvb-up').forEach(x=>x.remove());const I=id&&ITEMS[id];if(!I||(I.t!=='wear'&&I.t!=='tool'))return;const q=nvmQ(id);b.classList.add('q'+q);b.insertAdjacentHTML('beforeend','<u class="nvm-qp">'+'◆'.repeat(q+1)+'</u>');
      if(I.t==='wear'){const cur=S.wear&&S.wear[I.slot||'body'];if(cur!==id&&nvmScore(I)>nvmScore(cur&&ITEMS[cur]))b.insertAdjacentHTML('beforeend','<u class="nvb-up">▲</u>');}});}catch(e){}}
setInterval(nvmBag,450);
(function(){try{const st=document.createElement('style');st.textContent=`
.nvb .kho-tip{display:none}.nvb .kho-tip.show{display:block}.nvb .kho-bar{display:flex;align-items:center;gap:8px}.nvb .kho-bar .nvb-i{flex:none;min-width:36px;padding:6px 0}
.nvb .kho-det.nvb-empty{padding:6px 10px;min-height:0;border-style:dashed;opacity:.8}.nvb .kho-det.nvb-empty p{margin:0;font-size:12px}
.nvb .mxinv .sl{position:relative}.nvb .mxinv .sl.q1{border-color:#7fd08a}.nvb .mxinv .sl.q2{border-color:#5fa8f0}.nvb .mxinv .sl.q3{border-color:#b98af5;box-shadow:0 0 6px rgba(170,120,245,.4)}.nvb .mxinv .sl.q4{border-color:#f5a53c;box-shadow:0 0 8px rgba(245,160,60,.5)}
.nvb .mxinv .sl .nvm-qp{position:absolute;left:3px;bottom:2px;font-size:6.5px;letter-spacing:.5px;text-decoration:none;color:#fff;text-shadow:0 0 2px #000,0 1px 0 #000;line-height:1}
.nvb .mxinv .sl .nvb-up{position:absolute;left:2px;top:1px;font-size:11px;text-decoration:none;color:#6fe07c;text-shadow:0 0 3px #000,0 1px 0 #000;line-height:1}`;document.head.appendChild(st);}catch(e){}})();
/* ---------- SO SÁNH CHO VŨ KHÍ, CÔNG CỤ (và đồ mặc) NGAY TRONG TÚI ĐỒ: chọn một món là thấy nó hơn / kém món đang dùng cùng loại ---------- */
function nvmBagCmp(){try{if(typeof G==='undefined'||G.panel!=='bag')return;const det=document.querySelector('#panel .p-body .kho-det');if(!det)return;const ic=det.querySelector('[data-ic]'),id=ic&&ic.dataset.ic,I=id&&ITEMS[id];const old=det.querySelector('.nvm-cmp');
    if(!I||(I.t!=='tool'&&I.t!=='wear')){if(old)old.remove();return;}const cur=I.t==='wear'?(S.wear&&S.wear[I.slot||'body']):(()=>{let b=null;for(const it of S.inv){const J=it&&ITEMS[it.id];if(J&&J.t==='tool'&&J.tool===I.tool&&it.id!==id&&(!b||(J.pow||0)>(ITEMS[b].pow||0)))b=it.id;}return b;})();const key=id+'|'+(cur||'');if(old&&old.dataset.k===key)return;if(old)old.remove();
    let h='';const C=cur&&ITEMS[cur];if(I.t==='wear'){h=cur===id?'<i>Đang mặc món này</i>':(nvmDelta(I,C)||'<i>Ngang với món đang mặc</i>');}
    else if(I.pow!=null){if(!C)h='<i>Sức công cụ '+I.pow+' · chưa có món cùng loại nào khác</i>';else{const d=(I.pow||0)-(C.pow||0);h=Math.abs(d)<1e-6?'<i>Ngang với '+esc(C.n)+'</i>':`<i class="${d>0?'up':'dn'}">${d>0?'▲':'▼'} Sức ${d>0?'+':''}${Math.round(d*10)/10} so với ${esc(C.n)}</i>`;}}
    if(h)det.insertAdjacentHTML('beforeend',`<div class="nvm-cmp nvm-dl" data-k="${key}"><span class="nvm-qt q${nvmQ(id)}">${'◆'.repeat(nvmQ(id)+1)} ${NVM.Q[nvmQ(id)]}</span>${h}</div>`);}catch(e){}}
setInterval(nvmBagCmp,450);
(function(){try{const st=document.createElement('style');st.textContent=`.kho-det .nvm-cmp{flex:1 1 100%;width:100%;order:9}.nvm-cmp{display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;margin-top:6px;padding-top:6px;border-top:1px dashed rgba(255,255,255,.15);font-size:12.5px}.nvm-cmp i{font-style:normal;opacity:.85}.nvm-cmp i.up{color:#6fe07c;opacity:1;font-weight:700}.nvm-cmp i.dn{color:#ff7a66;opacity:1;font-weight:700}
.nvm-qt{font-weight:800;font-size:11.5px;padding:1px 7px;border-radius:9px;background:rgba(255,255,255,.1)}.nvm-qt.q1{color:#7fd08a}.nvm-qt.q2{color:#7db9f5}.nvm-qt.q3{color:#c6a0f8}.nvm-qt.q4{color:#f7b65c}`;document.head.appendChild(st);}catch(e){}})();
/* ---------- THẺ THUỘC TÍNH, THIÊN PHÚ gọn: nút ＋ lên cùng hàng với tên, ô thấp lại; ở các thẻ không phải Tổng quan thì bảng kéo cao hơn để thấy đủ danh sách ---------- */
{const _f=nvmFix;nvmFix=function(){_f.apply(this,arguments);try{const el=document.getElementById('h4');if(!el)return;el.classList.toggle('nvm-tall',!!(H4.tab&&H4.tab!=='ov'));
    el.querySelectorAll('.h4-body .h2-at').forEach(c=>{if(c.dataset.nvm)return;c.dataset.nvm='1';const bt=c.querySelector('.h2-at-f .btn');if(bt&&!bt.disabled&&!bt.classList.contains('ghost'))c.classList.add('can');const em=c.querySelector('.h2-at-h em');if(em){const m=/^\s*(\d+)\s*\/\s*(\d+)/.exec(em.textContent);if(m&&+m[1]>=+m[2])c.classList.add('max');}});}catch(e){}};}
(function(){try{const st=document.createElement('style');st.textContent=`
@media (orientation:portrait){#h4.nvm.nvm-tall .h4-body{max-height:56vh}#h4.nvm.nvm-tall .h4-pow{display:none}}
#h4.nvm .h4-body .h3-pts{padding:5px 10px;margin-bottom:6px}#h4.nvm .h4-body .h3-pts b{font-size:22px}
#h4.nvm .h4-body .h2-ats{grid-template-columns:1fr 1fr;gap:6px}
#h4.nvm .h4-body .h2-at{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 8px;padding:8px 9px;align-content:start}
#h4.nvm .h4-body .h2-at.can{border-color:rgba(255,210,122,.45)}#h4.nvm .h4-body .h2-at.max{border-color:rgba(110,220,130,.5)}
#h4.nvm .h4-body .h2-at-h{grid-column:1/-1;grid-row:1;min-width:0;gap:5px}#h4.nvm .h4-body .h2-at-h span{font-size:17px}#h4.nvm .h4-body .h2-at-h b{font-size:13px;min-width:0;line-height:1.15}#h4.nvm .h4-body .h2-at-h em{font-size:16px;white-space:nowrap}
#h4.nvm .h4-body .h2-at>.h2-bar,#h4.nvm .h4-body .h2-at>.h2-pips{grid-column:1;grid-row:2;align-self:center}
#h4.nvm .h4-body .h2-at-f{display:contents}
#h4.nvm .h4-body .h2-at-f .btn{grid-column:2;grid-row:2/4;align-self:center;min-width:42px;min-height:42px;border-radius:12px}
#h4.nvm .h4-body .h2-at-f .btn.ghost{opacity:.35}
#h4.nvm .h4-body .h2-at-f>span{grid-column:1;grid-row:3;font-size:12px;line-height:1.3}#h4.nvm .h4-body .h2-at-f>.h2-eff{font-weight:800}
#h4.nvm .h4-body .h2-at>span.small{grid-column:1/-1;grid-row:4;font-size:11px;line-height:1.3;opacity:.8;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.kho-det{flex-wrap:wrap}`;document.head.appendChild(st);}catch(e){}})();
/* ---------- THẺ CÔNG THỨC gọn: ghim và sao nằm ở hai góc trên của ảnh, nút Làm và ×5 chung một hàng (trước là hai hàng nút) ---------- */
(function(){try{const st=document.createElement('style');st.textContent=`
.u8-cg .rc{position:relative}.u8-cg .rc .rc-a{display:flex;flex-wrap:nowrap;gap:6px;align-items:stretch}
.u8-cg .rc .rc-a .gm-b,.u8-cg .rc .rc-a .mxfav{position:absolute;top:4px;width:34px;height:34px;min-width:0;min-height:0;padding:0;border-radius:10px;background:rgba(20,14,9,.72);border:1px solid rgba(255,255,255,.14);font-size:14px;line-height:1}
.u8-cg .rc .rc-a .gm-b{left:4px}.u8-cg .rc .rc-a .mxfav{right:4px}
.u8-cg .rc .rc-a>.btn:not(.gm-b):not(.mxfav){flex:1 1 0;min-width:0;min-height:38px}.u8-cg .rc .rc-a>.btn.ghost:not(.gm-b):not(.mxfav){flex:0 0 46px;padding:0}`;document.head.appendChild(st);}catch(e){}})();
