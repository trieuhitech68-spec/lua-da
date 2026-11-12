/* ===================== NGHIÊN CỨU (Nhà nghiên cứu) + LỄ TẾ CỘT VẬT TỔ =====================
   NGHIÊN CỨU: có Nhà nghiên cứu (Xây → Quy hoạch làng) thì mở được bảng 📜 Nghiên cứu (☰ Thêm). Mỗi kỹ thuật 3 bậc, tốn vật liệu + thời gian thật
   (bậc 1: 5 phút, bậc 2: 15 phút, bậc 3: 40 phút; vẫn chạy khi thoát game), mỗi lúc nghiên cứu một thứ. Tác dụng vĩnh viễn, cộng dồn theo bậc.
   CỘT VẬT TỔ: bấm Hành động ở cột để TẾ LỄ (2 thịt chín + 2 hoa, mỗi ngày thật một lần) → "Tổ tiên phù hộ" 3 giờ thật: +15% kinh nghiệm,
   +10 thể lực tối đa, lính đánh mạnh +10%. Cột cũng là mốc chiếm tiền đồn (dựng trong vòng đất của điểm giàu sau khi hạ lính canh). */
const NC=[
 {id:'nong',ic:'🌾',n:'Ủ phân, chọn giống',d:'Cây trên luống và lúa ngoài ruộng lớn nhanh hơn.',fx:l=>'+'+(l*12)+'% tốc độ lớn của cây trồng',cost:l=>({grain:4*l,clay:3*l,fiber:4*l})},
 {id:'binh',ic:'⚔️',n:'Luyện binh',d:'Lính theo bạn và người giữ cổng đánh mạnh hơn.',fx:l=>'+'+(l*8)+'% sức đánh của lính',cost:l=>({wood:6*l,flint:2*l,hide:2*l})},
 {id:'suc',ic:'💪',n:'Rèn thể lực',d:'Làm việc, chạy nhảy được lâu hơn.',fx:l=>'+'+(l*6)+' thể lực tối đa',cost:l=>({meatCooked:3*l,rope:2*l,stone:4*l})},
 {id:'hoc',ic:'📖',n:'Truyền nghề',d:'Làm gì cũng học nhanh hơn.',fx:l=>'+'+(l*6)+'% kinh nghiệm mọi tay nghề',cost:l=>({plank:3*l,fiber:6*l,clay:2*l})},
 {id:'chay',ic:'🏃',n:'Dép cỏ, lối mòn',d:'Đi lại nhanh hơn.',fx:l=>'+'+(l*4)+'% tốc độ đi và chạy',cost:l=>({fiber:8*l,hide:1*l,rope:2*l})},
 {id:'duong',ic:'🌿',n:'Thuốc nam dưỡng sinh',d:'Khi no đủ, máu tự hồi dần.',fx:l=>'hồi '+(l*0.5).toFixed(1)+' máu mỗi 5 giây khi no trên 40%',cost:l=>({centella:2*l,mugwort:2*l,mint:1*l})}];
const NC_T=[0,5,15,40];
function ncS(){if(!S.nc||typeof S.nc!=='object')S.nc={lv:{},cur:null};if(!S.nc.lv)S.nc.lv={};return S.nc;}
function ncLv(id){try{return (S&&S.nc&&S.nc.lv&&S.nc.lv[id])|0;}catch(e){return 0;}}
function ncHouse(){try{return typeof qhHas==='function'&&qhHas('qh_nghien');}catch(e){return false;}}
function ncBuff(){try{return !!(S&&S.tt&&S.tt.until>Date.now());}catch(e){return false;}}
function ncTick(){try{if(!S||!G.on)return;const R=ncS(),c=R.cur;if(c&&Date.now()>=c.end){const q=NC.find(x=>x.id===c.id);R.lv[c.id]=Math.max(ncLv(c.id),c.lv);R.cur=null;if(q){uiToast('📜 Nghiên cứu xong: '+q.n+' bậc '+c.lv+' ('+q.fx(c.lv)+').','gold');try{sfx('craft');}catch(e){}}try{cnt('cnt','research');save();}catch(e){}ncDraw();}
    const dl=ncLv('duong');if(dl&&S.p.hp<100&&S.p.hp>0&&S.p.food>40&&!G.sleeping)S.p.hp=Math.min(100,S.p.hp+dl*0.5);}catch(e){}}
setInterval(ncTick,5000);
function ncStart(id){const q=NC.find(x=>x.id===id),R=ncS();if(!q)return;if(!ncHouse()){uiToast('Cần dựng Nhà nghiên cứu trước (Xây → Quy hoạch làng).','bad');return;}if(R.cur){uiToast('Đang nghiên cứu dở một kỹ thuật khác.','bad');return;}const l=ncLv(id)+1;if(l>3){uiToast('Đã đạt bậc cao nhất.','');return;}
  const c=q.cost(l);if(!canPay(c)){uiToast('Thiếu vật liệu: '+Object.entries(c).filter(([k,v])=>haveCount(k)<v).map(([k,v])=>(v-haveCount(k))+' '+(ITEMS[k]?ITEMS[k].n:k)).join(', ')+'.','bad');try{sfx('no');}catch(e){}return;}
  pay(c);R.cur={id,lv:l,end:Date.now()+NC_T[l]*60000,t0:Date.now()};try{sfx('build');uiHotbar();save();}catch(e){}uiToast('📜 Bắt đầu nghiên cứu '+q.n+' bậc '+l+': '+NC_T[l]+' phút (thoát game vẫn tính).','good');ncDraw();}
function ncDraw(){const el=document.getElementById('ncw');if(!el||el.hidden)return;const R=ncS(),has=ncHouse(),c=R.cur,left=c?Math.max(0,c.end-Date.now()):0;
  let h=`<div class="nc-c"><div class="nc-h"><b>📜 Nghiên cứu</b><button class="nc-x" data-nc="x" aria-label="Đóng">✕</button></div>
    <p class="small muted">${has?'Mỗi lúc nghiên cứu một kỹ thuật. Tác dụng vĩnh viễn, cộng dồn theo bậc; thoát game vẫn tính giờ.':'🔒 Cần dựng <b>Nhà nghiên cứu</b> (Xây → Quy hoạch làng → Học hỏi) mới bắt đầu nghiên cứu được. Bạn vẫn xem trước được các kỹ thuật bên dưới.'}</p>`;
  if(c){const q=NC.find(x=>x.id===c.id),k=1-left/Math.max(1,c.end-c.t0);h+=`<div class="nc-cur">Đang nghiên cứu: <b>${q?q.ic+' '+esc(q.n):''} bậc ${c.lv}</b> · còn ${Math.ceil(left/60000)} phút<div class="nc-bar"><i style="width:${Math.round(k*100)}%"></i></div></div>`;}
  for(const q of NC){const l=ncLv(q.id),nl=l+1,cost=nl<=3?q.cost(nl):null,ok=cost&&canPay(cost);
    h+=`<div class="nc-i"><span class="nc-ic">${q.ic}</span><div class="nc-m"><b>${esc(q.n)} <em>${'●'.repeat(l)}${'○'.repeat(3-l)}</em></b><span class="small muted">${esc(q.d)}</span>${l?`<span class="nc-fx">Đang có: ${esc(q.fx(l))}</span>`:''}
      ${cost?`<span class="small">Bậc ${nl}: ${esc(q.fx(nl))} · ${NC_T[nl]} phút</span><div class="chips">${Object.entries(cost).map(([k,v])=>`<span class="chip${haveCount(k)<v?' lack':''}">${icon(k)}${Math.min(haveCount(k),v)}/${v}</span>`).join('')}</div>
      <div class="row"><button class="btn sm${has&&!c&&ok?'':' ghost'}" data-nc="go" data-id="${q.id}">Nghiên cứu bậc ${nl}</button>${!ok&&typeof gmPin==='function'?'':''}</div>`:'<span class="nc-fx">✓ Đã đạt bậc cao nhất</span>'}</div></div>`;}
  h+='</div>';el.innerHTML=h;}
function ncOpen(){let el=document.getElementById('ncw');if(!el){document.body.insertAdjacentHTML('beforeend','<div id="ncw" class="ncw" hidden></div>');el=document.getElementById('ncw');
    el.addEventListener('click',e=>{const b=e.target.closest('[data-nc]');if(!b){if(e.target===el)el.hidden=true;return;}if(b.dataset.nc==='x'){el.hidden=true;return;}if(b.dataset.nc==='go')ncStart(b.dataset.id);if(b.dataset.nc==='te'){ttOffer();}});}
  try{if(G.panel)uiClose();document.querySelector('#menu.ui5-open')&&document.querySelector('#menu .ui5-mb').click();}catch(e){}el.hidden=false;ncDraw();}
setInterval(()=>{const el=document.getElementById('ncw');if(el&&!el.hidden)ncDraw();},4000);
/* nút trong ☰ Thêm */
setInterval(()=>{try{const m=document.getElementById('menu');if(!m||!S||!G.on||m.querySelector('[data-ui="nc"]'))return;const b=document.createElement('button');b.dataset.ui='nc';b.setAttribute('aria-label','Nghiên cứu');b.innerHTML='<span>📜</span><i>Nghiên cứu</i>';m.insertBefore(b,m.firstChild);}catch(e){}},1500);
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-ui="nc"]');if(!b||!S||!G.on)return;e.stopImmediatePropagation();e.preventDefault();ncOpen();},true);
/* tác dụng */
{const _ct=cropsTick;cropsTick=function(gd){return _ct.call(this,gd*(1+0.12*ncLv('nong')));};}
if(typeof l4PadTick==='function'){const _pt=l4PadTick;l4PadTick=function(gh){return _pt.call(this,gh*(1+0.12*ncLv('nong')));};}
if(typeof danDmg==='function'){const _dd=danDmg;danDmg=function(f){return _dd.apply(this,arguments)*(1+0.08*ncLv('binh'))*(ncBuff()?1.1:1);};}
{const _ms=maxStam;maxStam=function(){return _ms.apply(this,arguments)+6*ncLv('suc')+(ncBuff()?10:0);};}
{const _ax=addXp;addXp=function(k,n){return _ax.call(this,k,n*(1+0.06*ncLv('hoc'))*(ncBuff()?1.15:1));};}
{const _mv=move;move=function(dx,dz,m,dt,run){const l=ncLv('chay');return _mv.call(this,dx,dz,l?m*(1+0.04*l):m,dt,run);};}
/* ---------- CỘT VẬT TỔ: tế lễ ---------- */
function ttDay(){return Math.floor((Date.now()+7*3600000)/86400000);}
function ttOffer(){if(!S)return;if(!S.tt)S.tt={};if(S.tt.day===ttDay()){uiToast('Hôm nay đã tế lễ rồi. Mai lại dâng lễ nhé.'+(ncBuff()?' Tổ tiên còn phù hộ '+Math.ceil((S.tt.until-Date.now())/60000)+' phút.':''),'');return;}
  const meat=['meatCooked','fishCooked','meatSmoked','birdCooked'].find(k=>invCount(k)>=2),fl=['flower','flowerR','flowerY','flowerW','flowerP'].find(k=>invCount(k)>=2)||(['flower','flowerR','flowerY','flowerW','flowerP'].reduce((a,k)=>a+invCount(k),0)>=2?'*':null);
  if(!meat||!fl){uiToast('Lễ vật: cần 2 món thịt/cá chín và 2 bông hoa (hoa mọc ở bãi cỏ, bìa rừng).','bad');try{sfx('no');}catch(e){}return;}
  invTake(meat,2);if(fl==='*'){let n=2;for(const k of ['flower','flowerR','flowerY','flowerW','flowerP']){const t=Math.min(n,invCount(k));if(t>0){invTake(k,t);n-=t;}if(n<=0)break;}}else invTake(fl,2);
  S.tt.day=ttDay();S.tt.until=Date.now()+3*3600000;try{sfx('craft');cnt('cnt','offer');addXp('herb',4);uiHotbar();save();puff(P.x,P.y+30,P.z,'#ffd27a',10);}catch(e){}
  uiToast('🪶 Tổ tiên phù hộ trong 3 giờ: +15% kinh nghiệm, +10 thể lực tối đa, lính đánh mạnh +10%.','gold');}
{const _ti=targetInfo;targetInfo=function(t){try{if(t&&t.type==='build'&&t.b&&t.b.k==='totem'&&t.b.prog==null&&!t.b.remote)return {name:'Cột vật tổ'+(ncBuff()?' · đang phù hộ '+Math.ceil((S.tt.until-Date.now())/60000)+' phút':''),verb:S.tt&&S.tt.day===ttDay()?'Đã tế lễ hôm nay':'Tế lễ (2 thịt chín + 2 hoa)',ok:true,icon:'flower'};}catch(e){}return _ti.apply(this,arguments);};}
{const _as=actStart;actStart=function(t){try{if(!G.work&&t&&t.type==='build'&&t.b&&t.b.k==='totem'&&t.b.prog==null&&!t.b.remote){ttOffer();return;}}catch(e){}return _as.apply(this,arguments);};}
try{const d=BUILD.find(b=>b.id==='totem');if(d)d.d='Biểu tượng bộ lạc. Bấm Hành động để TẾ LỄ mỗi ngày (2 thịt chín + 2 hoa): tổ tiên phù hộ 3 giờ (+15% kinh nghiệm, +10 thể lực, lính mạnh +10%). Dựng trong vòng đất của một điểm giàu đã hạ hết lính canh là CHIẾM tiền đồn đó.';}catch(e){}
if(typeof HD_L!=='undefined'){HD_L.push({id:'vatto',ic:'🪶',t:'Cột vật tổ',w:()=>S.builds.some(b=>b.k==='totem'&&b.prog==null&&!b.remote&&Math.hypot(b.x-P.x,b.z-P.z)<160),p:['<b>Cột vật tổ</b> là nơi thờ tổ tiên của bộ lạc bạn. Đứng cạnh cột bấm <b>Hành động</b> để <b>tế lễ</b>: dâng 2 món thịt/cá chín và 2 bông hoa, mỗi ngày một lần.','Tế xong được <b>tổ tiên phù hộ 3 giờ</b>: +15% kinh nghiệm, +10 thể lực tối đa, lính và người giữ cổng đánh mạnh hơn 10%.','Cột còn là <b>mốc chiếm đất</b>: hạ hết lính canh ở một điểm giàu (mỏ đồng, bãi muối, rừng gỗ quý…) rồi dựng cột trong vòng đất đó là điểm ấy thành tiền đồn của bạn, mỗi ngày dồn sản vật vào kho.']});
  HD_L.push({id:'nghiencuu',ic:'📜',t:'Nghiên cứu',w:()=>ncHouse(),p:['Bạn đã có <b>Nhà nghiên cứu</b>. Mở <b>☰ Thêm → 📜 Nghiên cứu</b> để chọn kỹ thuật: trồng trọt, luyện binh, thể lực, truyền nghề, đi lại, thuốc nam.','Mỗi kỹ thuật có <b>3 bậc</b>, tốn vật liệu và thời gian thật (5, 15, 40 phút). <b>Thoát game vẫn tính giờ</b>. Mỗi lúc chỉ nghiên cứu một thứ.','Tác dụng là <b>vĩnh viễn</b> và cộng dồn theo bậc. Thiếu vật liệu thì ghim món đó hoặc để Tự làm đi gom.']});}
{const s=document.createElement('style');s.textContent=`.ncw{position:fixed;inset:0;z-index:72;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.5);padding:10px}.ncw[hidden]{display:none}
.nc-c{width:min(460px,100%);max-height:86dvh;overflow-y:auto;padding:12px;border-radius:16px;background:#1c130c;border:1px solid #f2c55a;color:#f6ead2;box-shadow:0 10px 30px rgba(0,0,0,.6);margin-bottom:max(6px,env(safe-area-inset-bottom))}
.nc-h{display:flex;align-items:center;justify-content:space-between}.nc-h b{font-size:17px}.nc-x{width:34px;height:34px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#f6ead2}
.nc-cur{margin:8px 0;padding:8px 10px;border-radius:12px;background:rgba(242,197,90,.12);border:1px solid rgba(242,197,90,.4);font-size:13px}.nc-bar{height:6px;border-radius:99px;background:rgba(0,0,0,.4);margin-top:6px;overflow:hidden}.nc-bar i{display:block;height:100%;background:#f2c55a}
.nc-i{display:flex;gap:9px;padding:9px 0;border-top:1px solid rgba(255,255,255,.08)}.nc-ic{font-size:26px;flex:none;width:36px;text-align:center}.nc-m{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.nc-m b{font-size:14px}.nc-m em{font-style:normal;color:#f2c55a;letter-spacing:2px;margin-left:4px}
.nc-fx{font-size:12px;color:#a8e59a;font-weight:700}.nc-m .chips{display:flex;flex-wrap:wrap;gap:4px}.nc-m .chip{display:inline-flex;align-items:center;gap:3px;padding:1px 7px 1px 3px;border-radius:9px;background:rgba(0,0,0,.3);font-size:12px;border:1px solid rgba(255,255,255,.12)}.nc-m .chip.lack{color:#ff9a86;border-color:rgba(255,120,90,.5)}.nc-m .chip .ic{width:18px;height:18px}.nc-m .row{margin-top:3px}`;document.head.appendChild(s);}
