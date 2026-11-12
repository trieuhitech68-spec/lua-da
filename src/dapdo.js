/* ===================== ĐẬP ĐỒ (CƯỜNG HOÁ TRANG BỊ) =====================
   Thay thẻ Cường hoá cũ (3 ô, tối đa +10, bấm không thấy phản hồi vì thông báo bị màn hình nhân vật che).
   · 9 ô: Vũ khí · Dụng cụ · Giáp · Mũ · Khiên · Áo · Áo choàng · Giày · Trang sức. Cường hoá gắn với Ô, đổi món khác vẫn giữ cấp.
     Sáu ô sau phải đang mặc/đeo một món thì mới đập được và mới có tác dụng.
   · Tối đa +15. Tỉ lệ thành công giảm dần: +1…+3 100% · +4 90 · +5 80 · +6 70 · +7 60 · +8 50 · +9 40 · +10 33 · +11 27 · +12 22 · +13 18 · +14 14 · +15 10.
   · Thất bại: mất vật liệu; mỗi lần hỏng cộng +5% may mắn cho lần sau ở ô đó (tối đa +30%, thành công thì về 0).
     Từ +11 trở lên hỏng thì TỤT 1 cấp, trừ khi có Đá hộ mệnh (tự dùng 1 viên, giữ nguyên cấp).
   · Vật liệu theo bậc: +1…+5 đồ đá (đá, đá lửa, da, sợi) · +6…+10 thêm đồng · +11…+15 thêm sắt và than.
   · Vũ khí từ +5 phát sáng xanh, +10 vàng, +15 đỏ. Cần đã dựng Bàn chế tác (không cần đứng cạnh).
   Lưu: 3 ô cũ giữ nguyên chỗ cũ (heroS().en, tới +10), phần +11…+15 và 6 ô mới nằm ở heroS().en2. */
const DP_MAX=15,DP_RATE=[100,100,100,90,80,70,60,50,40,33,27,22,18,14,10];
const DP=[['wp','⚔️','Vũ khí',null,l=>'+'+l*6+'% sát thương'],['tl','🪓','Dụng cụ',null,l=>'+'+l*5+'% tốc độ chặt, đào'],['ar','🛡️','Giáp','armor',l=>'−'+l*2+'% sát thương nhận vào'],
  ['hd','🪖','Mũ','head',l=>'−'+(l*0.8).toFixed(1)+'% sát thương nhận vào'],['sh','🔰','Khiên','shield',l=>'−'+l+'% sát thương nhận vào'],['bd','👕','Áo','body',l=>'+'+l*2+' ấm · +'+l*3+' thể lực tối đa'],
  ['bk','🧥','Áo choàng','back',l=>'+'+l*2+' ấm'],['ft','🥾','Giày','feet',l=>'+'+l+'% tốc độ đi, chạy'],['ac','💍','Trang sức','neck|acc',l=>'+'+(l*1.5).toFixed(1)+'% kinh nghiệm']];
const DP_BASE={wp:1,tl:1,ar:1};
Object.assign(ITEMS,{dpStone:{n:'Đá hộ mệnh',t:'res',ds:'Viên đá mài khắc bùa. Khi đập đồ từ +11 trở lên mà hỏng, tự dùng 1 viên để KHÔNG bị tụt cấp.'}});
if(typeof EMO==='object')EMO.dpStone='🔮';if(typeof M2V==='object')M2V.dpStone=20;
RECIPES.push({id:'dpStone',out:{dpStone:1},in:{bronze:1,charcoal:2,stone:4},st:'smelter',req:['bronze'],lv:{craft:4},steps:'cast'});
function dpS(){const h=heroS();if(!h.en||typeof h.en!=='object')h.en={};if(!h.en2||typeof h.en2!=='object')h.en2={};if(!h.luck||typeof h.luck!=='object')h.luck={};return h;}
function dpLv(k){try{const h=dpS();return (DP_BASE[k]?clamp(h.en[k]|0,0,10):0)+clamp(h.en2[k]|0,0,DP_BASE[k]?5:15);}catch(e){return 0;}}
function dpSet(k,l){const h=dpS();l=clamp(l,0,DP_MAX);if(DP_BASE[k]){h.en[k]=Math.min(10,l);h.en2[k]=Math.max(0,l-10);}else h.en2[k]=l;}
function dpItem(k){const D=DP.find(d=>d[0]===k);if(!D)return null;if(k==='wp'||k==='tl'){const id=P.toolId;return id&&ITEMS[id]?id:null;}const w=S.wear||{};for(const s of D[3].split('|'))if(w[s])return w[s];return null;}
function dpOn(k){return !!DP_BASE[k]||!!dpItem(k);}/* ô có đang phát huy tác dụng không */
const dpE=k=>dpOn(k)?dpLv(k):0;
function dpCost(k,n){if(DP_BASE[k]&&n<=10)return heroEnCost(k,n);const c={},m=n<=10?n:n-5;if(k==='wp'||k==='tl'){c.stone=2*m;c.flint=m;}else if(k==='ar'||k==='hd'||k==='sh'){c.hide=m;c.fiber=2*m;}else if(k==='ac'){c.bone=m;c.fiber=m;}else{c.fiber=3*m;c.hide=Math.ceil(m/2);}
  if(n>=6)c.bronze=Math.min(5,n-5);if(n>=11){if(ITEMS.iron)c.iron=n-10;c.charcoal=2;}return c;}
function dpRate(k,n){const lk=clamp((dpS().luck[k]|0)*5,0,30);return Math.min(100,DP_RATE[n-1]+lk);}
function dpBench(){return S.builds.some(b=>b.k==='workbench'&&b.prog==null&&!b.remote);}
function dpWhy(k){const l=dpLv(k);if(l>=DP_MAX)return 'Đã tối đa';if(!DP_BASE[k]&&!dpItem(k))return 'Chưa mặc gì ở ô này';if(!dpBench())return 'Cần dựng Bàn chế tác trước';if(!canPay(dpCost(k,l+1)))return 'Thiếu vật liệu';return '';}
function dpTry(k){if(DPU.busy)return;const why=dpWhy(k);if(why){dpMsg(why,'bad');try{sfx('no');}catch(e){}return;}const l=dpLv(k),n=l+1,c=dpCost(k,n),rate=dpRate(k,n);pay(c);DPU.busy=k;DPU.res=null;dpDraw();
  let i=0;const hit=()=>{try{sfx('thud');}catch(e){}const el=document.querySelector('#dpw .dp-i[data-k="'+k+'"]');if(el){el.classList.remove('hit');void el.offsetWidth;el.classList.add('hit');}if(++i<3){setTimeout(hit,300);return;}
    setTimeout(async()=>{const h=dpS(),D=DP.find(d=>d[0]===k);let txt;const sv=await dpServer(k,l,invCount('dpStone')>0);
      if(sv){/* máy chủ quyết định: chỉ áp kết quả */const ok=!!sv.ok;dpSet(k,sv.lv|0);h.luck[k]=sv.luck|0;if(sv.stone)invTake('dpStone',1);if(ok){txt='✨ THÀNH CÔNG! '+D[2]+' lên +'+(sv.lv|0);try{sfx('level');addXp('craft',4+n*2);cnt('cnt','enhance');puff(P.x,P.y+30,P.z,n>=10?'#ffb020':'#ffd27a',12);}catch(e){}}else{txt=sv.stone?'💥 Hỏng. Đá hộ mệnh giữ nguyên +'+(sv.lv|0)+' (may mắn +'+(sv.luck|0)*5+'%)':(sv.lv|0)<l?'💥 Hỏng! '+D[2]+' tụt xuống +'+(sv.lv|0)+' (may mắn +'+(sv.luck|0)*5+'%)':'💥 Hỏng, mất vật liệu. Lần sau may mắn +'+(sv.luck|0)*5+'%';try{sfx('no');}catch(e){}}
        DPU.busy=null;DPU.res={k,ok,txt};try{HR2.shotT=-99;save();uiHotbar();dpGlow();if(typeof H4==='object'&&H4.on)h4Draw(true);}catch(e){}dpDraw();return;}
      const ok=Math.random()*100<rate;
      if(ok){dpSet(k,n);h.luck[k]=0;txt='✨ THÀNH CÔNG! '+D[2]+' lên +'+n;try{sfx('level');addXp('craft',4+n*2);cnt('cnt','enhance');puff(P.x,P.y+30,P.z,n>=10?'#ffb020':'#ffd27a',12);}catch(e){}}
      else{h.luck[k]=Math.min(6,(h.luck[k]|0)+1);if(n>=11){if(invCount('dpStone')>0){invTake('dpStone',1);txt='💥 Hỏng. Đá hộ mệnh giữ nguyên +'+l+' (may mắn +'+h.luck[k]*5+'%)';}else{dpSet(k,l-1);txt='💥 Hỏng! '+D[2]+' tụt xuống +'+(l-1)+' (may mắn +'+h.luck[k]*5+'%)';}}else txt='💥 Hỏng, mất vật liệu. Lần sau may mắn +'+h.luck[k]*5+'%';try{sfx('no');}catch(e){}}
      DPU.busy=null;DPU.res={k,ok,txt};try{HR2.shotT=-99;save();uiHotbar();dpGlow();if(typeof H4==='object'&&H4.on)h4Draw(true);}catch(e){}dpDraw();},350);};hit();}
const DPU={busy:null,res:null,msg:null};
function dpMsg(t,kind){DPU.res={k:null,ok:kind!=='bad',txt:t};dpDraw();}
function dpCol(l){return l>=15?'#ff5a4a':l>=10?'#ffb020':l>=5?'#6aa8ff':'#e8d6b4';}
function dpDraw(){const el=document.getElementById('dpw');if(!el||el.hidden)return;const bench=dpBench(),st=invCount('dpStone');let tot=0;for(const d of DP)tot+=dpE(d[0]);
  let h=`<div class="dp-c"><div class="dp-h"><b>⚒️ Đập đồ</b><span class="dp-tot">Tổng cấp <em>+${tot}</em></span><button class="dp-x" data-dp="x" aria-label="Đóng">✕</button></div>
   <p class="small muted">Cường hoá gắn với <b>ô</b>: đổi món khác vẫn giữ cấp. Hỏng thì mất vật liệu, lần sau được cộng may mắn. Từ <b>+11</b> hỏng sẽ <b>tụt 1 cấp</b> trừ khi có 🔮 Đá hộ mệnh (đang có <b>${st}</b>).${bench?'':' <span class="dp-warn">⚠️ Cần dựng Bàn chế tác trước.</span>'}</p>
   ${DPU.res?`<div class="dp-res ${DPU.res.ok?'ok':'bad'}">${esc(DPU.res.txt)}</div>`:''}`;
  for(const [k,ic,n,,fx] of DP){const l=dpLv(k),it=dpItem(k),on=dpOn(k),why=dpWhy(k),nx=l+1,c=l<DP_MAX?dpCost(k,nx):null,rate=c?dpRate(k,nx):0,lk=clamp((dpS().luck[k]|0)*5,0,30),busy=DPU.busy===k;
    h+=`<div class="dp-i${on?'':' off'}${busy?' busy':''}" data-k="${k}"><div class="dp-ic" style="--c:${dpCol(l)}"><span>${ic}</span><em>+${l}</em></div><div class="dp-m"><b>${n} <small>${it?esc(ITEMS[it].n):(k==='ar'?'chưa mặc giáp (cấp vẫn có tác dụng)':DP_BASE[k]?'tay không (cấp vẫn có tác dụng)':'chưa mặc')}</small></b>
      <div class="dp-p">${Array.from({length:DP_MAX},(_,i)=>`<i class="${i<l?(i>=10?'r':i>=5?'g':'on'):''}"></i>`).join('')}</div>
      <span class="dp-fx">${l?'Đang có: '+fx(l):'Chưa cường hoá'}${c?` → <b>${fx(nx)}</b>`:''}</span>
      ${c?`<div class="dp-r"><span class="dp-rate" style="--r:${rate}">Tỉ lệ <b>${rate}%</b>${lk?` <small>(+${lk}% may mắn)</small>`:''}${nx>=11?' · <small class="dp-warn">hỏng tụt cấp</small>':''}</span></div>
      <div class="chips">${Object.entries(c).filter(([x])=>ITEMS[x]).map(([x,v])=>`<span class="chip${haveCount(x)<v?' lack':''}">${icon(x)}${Math.min(haveCount(x),v)}/${v}</span>`).join('')}</div>
      <button class="dp-b${why?' ghost':''}" data-dp="go" data-k="${k}" ${DPU.busy?'disabled':''}>${busy?'🔨 Đang đập…':why?esc(why):'🔨 Đập lên +'+nx}</button>`:'<span class="dp-fx ok">✓ Đã tối đa +15</span>'}</div></div>`;}
  /* ----- thú: sủng thú nâng sao, cho ăn lên cấp; ngựa cho ăn lên cấp ----- */
  try{const L=typeof ltS==='function'?ltS():{list:[]},ms=S.mounts||[];if(L.list.length||ms.length){h+='<div class="dp-sec">🐾 Thú của bạn</div>';
      for(const p of L.list){const K=LT_K[p.k],st=p.st||0,c=st<5?ltStarCost(p):null;h+=`<div class="dp-i"><div class="dp-ic" style="--c:${st>=4?'#ffb020':st>=2?'#6aa8ff':'#e8d6b4'}"><span>${K.ic}</span><em>${st}★</em></div><div class="dp-m"><b>${esc(p.n)} <small>cấp ${p.lv||1}/30 · đòn ${ltDmg(p).toFixed(1)}</small></b><span class="dp-fx">${esc(K.tai)}${c?` → lên <b>${st+1} sao</b>: đòn +30%, thân hình lớn hơn`:''}</span>
          ${c?`<div class="chips">${Object.entries(c).filter(([x])=>ITEMS[x]).map(([x,v])=>`<span class="chip${haveCount(x)<v?' lack':''}">${icon(x)}${Math.min(haveCount(x),v)}/${v}</span>`).join('')}</div>`:'<span class="dp-fx ok">✓ Đã 5 sao</span>'}
          <div class="dp-row"><button class="dp-b ghost" data-dp="ltfeed" data-k="${p.id}">🍖 Cho ăn (+10 kinh nghiệm)</button>${c?`<button class="dp-b${canPay(c)?'':' ghost'}" data-dp="ltstar" data-k="${p.id}">🌟 Nâng sao</button>`:''}</div></div></div>`;}
      for(const m of ms){const lv=(m.lv|0)||1;h+=`<div class="dp-i"><div class="dp-ic" style="--c:${lv>=7?'#ffb020':lv>=4?'#6aa8ff':'#e8d6b4'}"><span>🐎</span><em>${lv}</em></div><div class="dp-m"><b>${esc(m.n)} <small>cấp ${lv}/10</small></b><span class="dp-fx">Đang nhanh hơn ${4*(lv-1)}%${lv<10?` → <b>${4*lv}%</b>`:''}</span>
          ${lv<10?`<div class="chips"><span class="chip${haveCount('berry')<4*lv?' lack':''}">${icon('berry')}${Math.min(haveCount('berry'),4*lv)}/${4*lv}</span><span class="chip${haveCount('grain')<2*lv?' lack':''}">${icon('grain')}${Math.min(haveCount('grain'),2*lv)}/${2*lv}</span></div><button class="dp-b ghost" data-dp="mtfeed" data-k="${m.id}">🌾 Cho ăn lên cấp ${lv+1}</button>`:'<span class="dp-fx ok">✓ Đã cấp tối đa</span>'}</div></div>`;}}
    else h+='<p class="small muted dp-ft">🐾 Chưa có thú. Thuần ngựa rừng, khỉ, gấu, hổ (lom khom lại gần cho ăn nhiều lần) rồi nâng cấp chúng ở đây.</p>';}catch(e){}
  h+=`<p class="small muted dp-ft">🔮 Đá hộ mệnh: Chế tạo tại Lò luyện đồng (1 đồng + 2 than + 4 đá).</p></div>`;
  const sc=el.querySelector('.dp-c'),top=sc?sc.scrollTop:0;el.innerHTML=h;const s2=el.querySelector('.dp-c');if(s2)s2.scrollTop=top;}
function dpOpen(){let el=document.getElementById('dpw');if(!el){document.body.insertAdjacentHTML('beforeend','<div id="dpw" class="dpw" hidden></div>');el=document.getElementById('dpw');
    el.addEventListener('click',e=>{const b=e.target.closest('[data-dp]');if(!b){if(e.target===el&&!DPU.busy)el.hidden=true;return;}if(b.dataset.dp==='x'){if(!DPU.busy)el.hidden=true;return;}if(b.dataset.dp==='go'){dpTry(b.dataset.k);return;}const f={ltfeed:typeof ltFeed==='function'?ltFeed:null,ltstar:typeof ltStar==='function'?ltStar:null,mtfeed:typeof mtFeed==='function'?mtFeed:null}[b.dataset.dp];if(f&&!DPU.busy){/* thông báo của các hàm này bị bảng che: bắt lại rồi hiện ngay trong bảng */const _u=uiToast;let msg='',kind='';uiToast=function(m,k){msg=String(m||'');kind=k||'';};try{f(b.dataset.k);}catch(er){}finally{uiToast=_u;}DPU.res=msg?{k:null,ok:kind!=='bad',txt:msg}:null;dpDraw();}});}
  try{if(G.panel)uiClose();const m=document.querySelector('#menu.ui5-open .ui5-mb');if(m)m.click();}catch(e){}DPU.res=null;el.hidden=false;dpDraw();}
/* mở từ thẻ Cường hoá cũ (màn hình Nhân vật, bảng cũ) và từ ☰ Thêm */
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-h4="tab"][data-t="en"],[data-a="h3tab"][data-t="en"],[data-a="heroen"],[data-ui="dp"]');if(!b||!S||!G.on)return;e.stopImmediatePropagation();e.preventDefault();dpOpen();},true);
setInterval(()=>{try{const m=document.getElementById('menu');if(!m||!S||!G.on||m.querySelector('[data-ui="dp"]'))return;const b=document.createElement('button');b.dataset.ui='dp';b.setAttribute('aria-label','Đập đồ');b.innerHTML='<span>⚒️</span><i>Đập đồ</i>';m.insertBefore(b,m.firstChild);}catch(e){}},1500);
/* ---------- tác dụng ---------- */
{const k=()=>1+0.06*clamp(dpS().en2.wp|0,0,5);const _ad=animalDamage;animalDamage=function(a,dmg){return _ad(a,dmg*k());};const _fd=foeDamage;foeDamage=function(f,dmg){return _fd(f,dmg*k());};}
{const _sp=swingPer;swingPer=function(t){return _sp(t)/(1+0.05*clamp(dpS().en2.tl|0,0,5));};}
{const _hd=heroDef;heroDef=function(){return Math.min(0.7,_hd()+0.02*clamp(dpS().en2.ar|0,0,5)+0.008*dpE('hd')+0.01*dpE('sh'));};}
{const _ww=wearWarm;wearWarm=function(){return _ww.apply(this,arguments)+2*dpE('bd')+2*dpE('bk');};}
{const _ms=maxStam;maxStam=function(){return _ms.apply(this,arguments)+3*dpE('bd');};}
{const _mv=move;move=function(dx,dz,m,dt,run){const l=dpE('ft');return _mv.call(this,dx,dz,l?m*(1+0.01*l):m,dt,run);};}
{const _ax=addXp;addXp=function(k,n){const l=dpE('ac');return _ax.call(this,k,l?n*(1+0.015*l):n);};}
/* vũ khí phát sáng theo cấp */
function dpGlow(){try{const g=P.tool;if(!g)return;const l=dpLv('wp'),col=l>=15?0xff3a2a:l>=10?0xffa020:l>=5?0x3a7cff:0,k=l>=15?0.6:l>=10?0.42:0.28;if(g.userData.dpG===l)return;g.userData.dpG=l;g.traverse(o=>{if(!o.isMesh||!o.material||!o.material.emissive)return;if(!o.userData.dpM){o.material=o.material.clone();o.userData.dpM=1;}o.material.emissive.setHex(col);o.material.emissiveIntensity=col?k:0;});}catch(e){}}
{const _eq=equip;equip=function(id){const r=_eq.apply(this,arguments);dpGlow();return r;};}
if(typeof HD_L!=='undefined')HD_L.push({id:'dapdo',ic:'⚒️',t:'Đập đồ (cường hoá)',w:()=>{const e=document.getElementById('dpw');return !!(e&&!e.hidden);},p:['<b>Đập đồ</b> làm mạnh thêm 9 ô trang bị: vũ khí, dụng cụ, giáp, mũ, khiên, áo, áo choàng, giày, trang sức. Cấp gắn với <b>ô</b>, đổi món khác vẫn giữ.','Càng lên cao <b>tỉ lệ thành công</b> càng thấp (ghi rõ trên từng ô). Hỏng thì mất vật liệu nhưng được cộng <b>may mắn</b> cho lần sau.','Từ <b>+11</b> trở lên, hỏng sẽ <b>tụt 1 cấp</b>. Mang theo <b>🔮 Đá hộ mệnh</b> (đúc ở Lò luyện đồng) thì không bị tụt.','Vũ khí <b>+5</b> phát sáng xanh, <b>+10</b> vàng, <b>+15</b> đỏ. Cần đã dựng <b>Bàn chế tác</b>.']});
{const s=document.createElement('style');s.textContent=`.dpw{position:fixed;inset:0;z-index:76;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.55);padding:10px}.dpw[hidden]{display:none}
.dp-c{width:min(480px,100%);max-height:88dvh;overflow-y:auto;padding:12px;border-radius:16px;background:linear-gradient(180deg,#22170e,#150e08);border:1px solid #f2c55a;color:#f6ead2;box-shadow:0 10px 30px rgba(0,0,0,.65);margin-bottom:max(6px,env(safe-area-inset-bottom))}
.dp-h{display:flex;align-items:center;gap:10px}.dp-h b{font-size:17px}.dp-tot{margin-left:auto;font-size:12px;color:#cdbb98}.dp-tot em{font-style:normal;color:#ffd27a;font-weight:800;font-size:14px}.dp-x{width:34px;height:34px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#f6ead2}
.dp-warn{color:#ff9a86;font-weight:700}.dp-res{margin:8px 0;padding:9px 11px;border-radius:12px;font-weight:800;font-size:14px;text-align:center;animation:dpr .5s ease-out}.dp-res.ok{background:rgba(255,200,60,.2);border:1px solid #ffc83c;color:#ffe08a;box-shadow:0 0 18px rgba(255,200,60,.35)}.dp-res.bad{background:rgba(255,90,60,.12);border:1px solid rgba(255,120,90,.5);color:#ffb0a0}
@keyframes dpr{from{transform:scale(.9);opacity:0}}
.dp-i{display:flex;gap:10px;padding:10px 0;border-top:1px solid rgba(255,255,255,.08)}.dp-i.off{opacity:.62}.dp-i.hit{animation:dph .28s ease-out}@keyframes dph{20%{transform:translateY(3px) rotate(-.6deg)}50%{transform:translateY(-2px) rotate(.5deg);background:rgba(255,210,90,.12)}}
.dp-ic{flex:none;width:52px;height:52px;border-radius:13px;display:grid;place-items:center;position:relative;background:rgba(0,0,0,.35);border:2px solid var(--c);box-shadow:0 0 12px -2px var(--c)}.dp-ic span{font-size:25px}.dp-ic em{position:absolute;right:-6px;bottom:-6px;font-style:normal;font-weight:800;font-size:12px;padding:1px 5px;border-radius:8px;background:#150e08;border:1px solid var(--c);color:var(--c)}
.dp-m{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}.dp-m>b{font-size:14px}.dp-m>b small{font-weight:500;color:#cdbb98;font-size:11.5px;margin-left:4px}
.dp-p{display:flex;gap:2px}.dp-p i{flex:1;height:5px;border-radius:2px;background:rgba(255,255,255,.12)}.dp-p i.on{background:#e8d6b4}.dp-p i.g{background:#ffb020}.dp-p i.r{background:#ff5a4a}
.dp-fx{font-size:12px;color:#cdbb98}.dp-fx b{color:#a8e59a}.dp-fx.ok{color:#a8e59a;font-weight:700}.dp-rate{font-size:12.5px}.dp-rate b{color:hsl(calc(var(--r)*1.2),80%,62%);font-size:14px}
.dp-m .chips{display:flex;flex-wrap:wrap;gap:4px}.dp-m .chip{display:inline-flex;align-items:center;gap:3px;padding:1px 7px 1px 3px;border-radius:9px;background:rgba(0,0,0,.3);font-size:12px;border:1px solid rgba(255,255,255,.12)}.dp-m .chip.lack{color:#ff9a86;border-color:rgba(255,120,90,.5)}.dp-m .chip .ic{width:18px;height:18px}
.dp-b{min-height:36px;border-radius:10px;border:1px solid #ffc83c;background:linear-gradient(180deg,#c9872a,#8a5416);color:#fff;font:800 13px inherit;margin-top:2px}.dp-b.ghost{background:none;border-color:rgba(255,255,255,.2);color:#cdbb98;font-weight:600}.dp-b:disabled{opacity:.6}.dp-ft{margin-top:10px}.dp-sec{margin:14px 0 2px;padding-top:10px;border-top:1px solid rgba(242,197,90,.35);font-weight:800;font-size:14px;color:#ffd27a}.dp-row{display:flex;gap:6px}.dp-row .dp-b{flex:1}`;document.head.appendChild(s);}

/* lực chiến tính thêm phần cường hoá mới (+11…+15 của 3 ô cũ và 6 ô mới) */
if(typeof heroPower==='function'){const _hp=heroPower;heroPower=function(){let x=0;try{const e=dpS().en2;for(const k in e)x+=clamp(e[k]|0,0,15);}catch(er){}return _hp.apply(this,arguments)+x*12;};}

/* ---------- máy chủ gieo tỉ lệ (nếu chủ máy chủ đã chạy docs/chong-gian-lan-dap-do.sql và người chơi đã đăng nhập); không có thì tính tại máy như cũ ---------- */
const DPSV={on:null};
function dpSb(){try{return typeof LDB!=='undefined'&&LDB.sb&&typeof ACC!=='undefined'&&ACC.uid?LDB.sb:null;}catch(e){return null;}}
async function dpServer(k,cur,stone){const sb=dpSb();if(!sb||DPSV.on===false)return null;try{const r=await Promise.race([sb.rpc('ld_dp_roll',{p_slot:k,p_cur:cur|0,p_stone:!!stone}),new Promise(res=>setTimeout(()=>res({error:{message:'timeout'}}),6000))]);
    if(r&&r.error){const m=String(r.error.message||'')+(r.error.code||'');if(/PGRST202|could not find the function|schema cache/i.test(m))DPSV.on=false;return null;}if(r&&r.data&&typeof r.data.lv==='number'){DPSV.on=true;return r.data;}}catch(e){}return null;}
setTimeout(async function sync(){try{const sb=dpSb();if(!sb||typeof S==='undefined'||!S||!G.on){setTimeout(sync,8000);return;}const r=await sb.rpc('ld_dp_mine');if(r&&r.error){DPSV.on=false;return;}const d=r&&r.data;if(d&&typeof d==='object'){DPSV.on=true;let ch=false;for(const k in d){if(!DP.some(x=>x[0]===k)||!Array.isArray(d[k]))continue;if(dpLv(k)!==(d[k][0]|0)){dpSet(k,d[k][0]|0);ch=true;}dpS().luck[k]=d[k][1]|0;}if(ch){try{save();dpGlow();}catch(e){}}}}catch(e){}},9000);
