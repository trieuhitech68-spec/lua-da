/* ===================== GHIM: đánh dấu một món cần làm / công trình cần dựng → vật liệu còn thiếu hiện ở góc màn hình =====================
   · Chế tạo: mỗi món có nút 📌. Xây: giữ lâu (hoặc bấm chuột phải) vào một công trình, hoặc bấm "📌 Ghim" trong bảng báo thiếu vật liệu.
   · Thẻ ghim nằm dưới bản đồ nhỏ: tên món + từng vật liệu "đang có / cần" (đỏ = còn thiếu, xanh = đủ). Chạm tên để mở lại đúng bảng,
     🤖 để nhân vật tự đi kiếm (và tự làm, với món chế tạo), ✕ để bỏ ghim. Làm xong / dựng xong thì tự bỏ ghim. Ghim được tối đa 3 món. */
function gmS(){if(!Array.isArray(S.pin))S.pin=[];return S.pin;}
function gmInfo(p){try{if(p.t==='c'){const r=RECIPES.find(x=>x.id===p.id);if(!r)return null;const out=Object.keys(r.out)[0];return {n:ITEMS[out]?ITEMS[out].n:out,ic:out,cost:r.in||{},r,done:gC('craft:'+out)>(p.c0||0)};}
    const d=pieceDef(p.id);if(!d)return null;const n=S.builds.filter(b=>b.k===p.id&&!b.remote).length;return {n:d.n,ic:null,cost:d.cost||{},d,done:n>(p.c0||0)};}catch(e){return null;}}
function gmPin(t,id){if(!S)return;const L=gmS(),i=L.findIndex(p=>p.t===t&&p.id===id);if(i>=0){L.splice(i,1);uiToast('📌 Đã bỏ ghim.','');}else{if(L.length>=3)L.shift();const p={t,id};const inf=gmInfo(p);if(!inf)return;
      p.c0=t==='c'?gC('craft:'+Object.keys(inf.r.out)[0]):S.builds.filter(b=>b.k===id&&!b.remote).length;L.push(p);uiToast('📌 Đã ghim '+inf.n+': vật liệu còn thiếu hiện dưới bản đồ nhỏ.','good');}
  try{sfx('pick');save();}catch(e){}gmDraw(true);try{uiOpenRefresh();}catch(e){}}
function gmDraw(force){try{let el=document.getElementById('pinw');const gm=document.getElementById('game');if(!gm)return;if(!el){el=document.createElement('div');el.id='pinw';el.className='pinw';gm.appendChild(el);}
    if(!S||!G.on||(G.build&&0)){el.hidden=true;return;}const L=gmS();let h='',chg=false;
    for(let i=L.length-1;i>=0;i--){const inf=gmInfo(L[i]);if(!inf){L.splice(i,1);chg=true;continue;}if(inf.done){uiToast('📌 Xong '+inf.n+': bỏ ghim.','good');L.splice(i,1);chg=true;}}
    for(const p of L){const inf=gmInfo(p),ents=Object.entries(inf.cost),ok=ents.every(([k,n])=>haveCount(k)>=n);
      h+=`<div class="pin-c${ok?' ok':''}"><div class="pin-h"><button class="pin-n" data-pin="open" data-t="${p.t}" data-id="${p.id}">${p.t==='c'?'🛠️':'🏠'} <b>${esc(inf.n)}</b></button><button class="pin-x" data-pin="x" data-t="${p.t}" data-id="${p.id}" aria-label="Bỏ ghim">✕</button></div>
        <div class="pin-l">${ents.map(([k,n])=>{const hv=haveCount(k);return `<span class="${hv>=n?'ok':'no'}">${icon(k)}${Math.min(hv,n)}/${n}</span>`;}).join('')}</div>
        <button class="pin-go" data-pin="${ok?'open':'auto'}" data-t="${p.t}" data-id="${p.id}">${ok?(p.t==='c'?'✔ Đủ đồ: làm ngay':'✔ Đủ đồ: đặt ngay'):(p.t==='c'?'🤖 Tự kiếm & làm':'🤖 Tự đi gom')}</button></div>`;}
    if(chg)try{save();}catch(e){}el.hidden=!L.length||!!G.panel||(typeof H4==='object'&&H4.on);if(el._h!==h){el._h=h;el.innerHTML=h;}}catch(e){}}
setInterval(()=>gmDraw(),900);
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-pin],[data-a="gmpin"]');if(!b||!S||!G.on)return;e.stopImmediatePropagation();e.preventDefault();
  if(b.dataset.a==='gmpin'){gmPin(b.dataset.t,b.dataset.id);return;}const t=b.dataset.t,id=b.dataset.id,k=b.dataset.pin;
  if(k==='x'){gmPin(t,id);return;}
  if(k==='auto'){if(t==='c')aqNeedCraft(id);else{const d=pieceDef(id);if(d){aqStart(-1,{job:{k:'getAll',cost:Object.assign({},d.cost),lab0:'Gom vật liệu: '+d.n,lab:'Gom vật liệu: '+d.n}});AQ.after={gi:-1,piece:id};uiToast('🤖 Đi gom đủ vật liệu cho '+d.n+'. Gom xong sẽ mở sẵn mục Xây cho bạn đặt.','');}}return;}
  if(t==='c'){uiOpen('craft',{});setTimeout(()=>{try{const c=document.querySelector('.panel .rc-a [data-r="'+id+'"]');if(c){const card=c.closest('.rc')||c.parentElement;card.scrollIntoView({block:'center'});card.classList.add('pin-hl');}}catch(e){}},120);}
  else{try{if(G.panel)uiClose();buildBegin(id);}catch(e){}}},true);
/* nút 📌 trong bảng Chế tạo (cạnh nút ☆ đánh dấu) và trong bảng báo thiếu vật liệu của Xây */
setInterval(()=>{try{if(!S||!G.on)return;const L=gmS();
    if(G.panel){document.querySelectorAll('.panel .rc-a').forEach(a=>{if(a.querySelector('.gm-b'))return;const b=a.querySelector('[data-r]');if(!b)return;const id=b.dataset.r,on=L.some(p=>p.t==='c'&&p.id===id);
        a.insertAdjacentHTML('afterbegin',`<button class="btn sm ghost gm-b${on?' on':''}" data-a="gmpin" data-t="c" data-id="${id}" aria-label="Ghim ra màn hình">📌</button>`);});
      const bp=document.querySelector('.panel .bc[data-a="build"]');if(bp){const host=bp.closest('.pb')||bp.parentElement.parentElement;if(host&&!host.querySelector('.gm-tip'))host.insertAdjacentHTML('afterbegin','<div class="gm-tip small muted">📌 Giữ lâu một công trình để ghim vật liệu của nó ra màn hình.</div>');
        document.querySelectorAll('.panel .bc[data-a="build"]').forEach(t=>{const on=L.some(p=>p.t==='b'&&p.id===t.dataset.b);t.classList.toggle('gm-on',on);});}}
    /* Xây: gom các ô 🔒 chưa mở khoá vào một ngăn gập ở cuối, để phần đang làm được nằm ngay trên cùng */
    if(G.panel==='build'){const par=new Set();document.querySelectorAll('.panel .bc.lock').forEach(t=>{if(!t.closest('.gm-lk'))par.add(t.parentElement);});par.forEach(pe=>{const lk=[...pe.children].filter(c=>c.classList&&c.classList.contains('bc')&&c.classList.contains('lock'));if(!lk.length)return;
        let box=pe.querySelector(':scope>.gm-lk');if(!box){box=document.createElement('details');box.className='gm-lk';box.innerHTML='<summary></summary><div class="gm-lkg"></div>';pe.appendChild(box);}const g=box.querySelector('.gm-lkg');lk.forEach(t=>g.appendChild(t));
        box.querySelector('summary').textContent='🔒 Chưa mở khoá ('+g.children.length+'): bấm để xem cần tìm gì';});}
    const ask=document.querySelector('#aqask:not([hidden]) .aqask-r');if(ask&&!ask.querySelector('.gm-b')){const id=document.getElementById('aqask').dataset.id;ask.insertAdjacentHTML('afterbegin',`<button class="btn ghost gm-b" data-a="gmpin" data-t="b" data-id="${id}">📌 Ghim vật liệu ra màn hình</button>`);}}catch(e){}},500);
/* Xây: giữ lâu / chuột phải vào ô công trình để ghim */
{let tm=null,hit=null;const st=e=>{const t=e.target&&e.target.closest&&e.target.closest('.panel .bc[data-a="build"]');if(!t)return;hit=t;clearTimeout(tm);tm=setTimeout(()=>{if(hit){const id=hit.dataset.b;hit=null;GM_SKIP=Date.now();gmPin('b',id);}},520);},en=()=>{clearTimeout(tm);hit=null;};
  document.addEventListener('pointerdown',st,true);document.addEventListener('pointerup',en,true);document.addEventListener('pointercancel',en,true);document.addEventListener('pointermove',e=>{if(hit&&(Math.abs(e.movementX)+Math.abs(e.movementY))>6)en();},true);
  document.addEventListener('contextmenu',e=>{const t=e.target&&e.target.closest&&e.target.closest('.panel .bc[data-a="build"]');if(!t||!S||!G.on)return;e.preventDefault();GM_SKIP=Date.now();gmPin('b',t.dataset.b);},true);
  document.addEventListener('click',e=>{if(Date.now()-GM_SKIP<450&&e.target&&e.target.closest&&e.target.closest('.panel .bc[data-a="build"]')){e.stopImmediatePropagation();e.preventDefault();}},true);}
var GM_SKIP=0;
{const s=document.createElement('style');s.textContent=`.pinw{position:absolute;z-index:6;right:var(--u-sr,10px);top:calc(var(--u-st,10px) + var(--ui5-mini,100px) + 10px);width:150px;display:flex;flex-direction:column;gap:5px;pointer-events:none}
.pinw[hidden]{display:none}.pin-c{pointer-events:auto;padding:5px 6px 6px;border-radius:11px;background:rgba(20,14,9,.82);border:1px solid rgba(242,197,90,.45);box-shadow:0 4px 12px rgba(0,0,0,.35);color:#f3e6cc}
.pin-c.ok{border-color:#7fd06a}.pin-h{display:flex;align-items:center;gap:4px}.pin-n{flex:1;min-width:0;text-align:left;background:none;border:0;color:inherit;font:inherit;font-size:11px;padding:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pin-n b{font-weight:700}
.pin-x{flex:none;width:20px;height:20px;border-radius:50%;border:0;background:rgba(255,255,255,.1);color:#f3e6cc;font-size:10px;padding:0}
.pin-l{display:flex;flex-wrap:wrap;gap:3px;margin:4px 0}.pin-l span{display:inline-flex;align-items:center;gap:2px;padding:1px 5px 1px 2px;border-radius:8px;font-size:10.5px;font-weight:700;background:rgba(0,0,0,.3)}.pin-l .ic{width:16px;height:16px}
.pin-l .no{color:#ff9a86;border:1px solid rgba(255,120,90,.5)}.pin-l .ok{color:#a8e59a;border:1px solid rgba(120,200,100,.4)}
.pin-go{width:100%;min-height:24px;border-radius:8px;border:1px solid #6ab85a;background:linear-gradient(180deg,#3b7a34,#2a5a26);color:#fff;font:700 10.5px inherit;padding:2px 4px}
#game .panel .gm-lk{grid-column:1/-1;margin-top:4px;border-radius:12px;border:1px dashed rgba(255,255,255,.16);padding:6px 8px}#game .panel .gm-lk>summary{font-size:12.5px;font-weight:700;color:#cdbb98;cursor:pointer;padding:4px 0}#game .panel .gm-lkg{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px}
#game .panel .rc-a .aq-need{flex:1 1 auto;white-space:normal;line-height:1.15;font-size:11.5px}#game .panel .rc-a .mxfav{flex:none;width:38px;min-width:38px;max-width:38px;height:38px;min-height:0;padding:0;align-self:center}
#game .panel .rc-a .gm-b{flex:none!important;width:38px;min-width:38px;max-width:38px;height:38px;min-height:0;padding:0;align-self:center}#game .panel .gm-b.on{border-color:#ffd27a;background:rgba(242,197,90,.22)}#game .panel .bc.gm-on{outline:2px solid #ffd27a;outline-offset:-2px}.gm-tip{padding:2px 2px 6px}.pin-hl{outline:2px solid #ffd27a;border-radius:12px}
@media (min-width:900px){.pinw{width:176px}.pin-n{font-size:12px}.pin-l span{font-size:11.5px}}body.mxphoto .pinw{display:none}`;document.head.appendChild(s);}
if(typeof HD_L!=='undefined')HD_L.push({id:'ghim',ic:'📌',t:'Ghim vật liệu ra màn hình',w:()=>(G.panel==='craft'||G.panel==='build')&&G.t>120,p:['Món nào muốn làm mà còn thiếu đồ, hãy <b>ghim</b> nó: trong <b>Chế tạo</b> bấm nút <b>📌</b> cạnh món đó; trong <b>Xây</b> thì <b>giữ lâu</b> vào công trình.','Thẻ ghim hiện dưới bản đồ nhỏ: từng vật liệu <b>đang có / cần</b>, đỏ là còn thiếu. Đi nhặt tới đâu số nhảy tới đó.','Bấm <b>🤖</b> trên thẻ để nhân vật tự đi kiếm; đủ đồ thì bấm để làm hoặc đặt ngay. Làm xong thẻ tự biến mất. Ghim được tối đa 3 món.']});
