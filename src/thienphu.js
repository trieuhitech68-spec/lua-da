/* ===================== THIÊN PHÚ: NHÁNH NÂNG CẤP THỨ BA CỦA NHÂN VẬT =====================
   Cứ 3 cấp nhân vật được 1 điểm thiên phú. Sáu thiên phú, mỗi cái 3 bậc, chọn hướng chơi riêng (thợ săn, thợ rừng, trâu bò, dai sức, thuần thú, ăn ít no lâu).
   Lưu: S.hero.tp={<mã>:bậc}. Thẻ "Thiên phú" trong màn Nhân vật. Chia lại miễn phí. */
const TP=[['san','🏹','Thợ săn','+8% sát thương lên thú và kẻ địch mỗi bậc'],['rung','🪓','Tiều phu','Chặt cây, đập đá nhanh hơn 8% mỗi bậc'],['da','🛡️','Mình đồng da sắt','Giảm 4% sát thương nhận vào mỗi bậc'],
  ['ben','⚡','Dai sức','+10 thể lực tối đa mỗi bậc'],['thu','🐾','Thuần thú','Cho ăn thuần thú nhanh hơn 30% mỗi bậc'],['no','🍖','Ăn ít no lâu','Đói và khát chậm hơn 8% mỗi bậc']];
const TP_MAX=3;
function tpS(){const h=heroS();if(!h.tp||typeof h.tp!=='object')h.tp={};return h.tp;}
const tpLv=k=>{try{return clamp(tpS()[k]|0,0,TP_MAX);}catch(e){return 0;}};
function tpPts(){let used=0;for(const [k] of TP)used+=tpLv(k);return Math.max(0,Math.floor(heroLv()/3)-used);}
function tpUp(k){if(tpPts()<1||tpLv(k)>=TP_MAX)return;tpS()[k]=tpLv(k)+1;sfx('level');const T=TP.find(t=>t[0]===k);uiToast(`✨ ${T[2]} lên bậc ${tpLv(k)}.`,'gold');try{HR2.shotT=-99;}catch(e){}save();}
function tpHtml(){const pts=tpPts(),nx=3-(heroLv()%3);return `<div class="h3-pts${pts>0?' on':''}"><b>${pts}</b><span>điểm thiên phú · cứ 3 cấp nhân vật +1 điểm${pts?'':' (còn '+nx+' cấp nữa)'}</span><button class="btn sm ghost" data-a="tpreset">↺ Chia lại</button></div>
  <div class="h2-ats">${TP.map(([k,ic,n,d])=>{const l=tpLv(k),ok=pts>0&&l<TP_MAX;return `<div class="h2-at"><div class="h2-at-h"><span>${ic}</span><b>${n}</b><em>${l}<small>/${TP_MAX}</small></em></div><div class="h2-pips">${[1,2,3].map(i=>`<i class="${i<=l?'on':''}"></i>`).join('')}</div><div class="h2-at-f"><span class="small muted">${d}</span><button class="btn sm${ok?'':' ghost'}" data-a="tpup" data-k="${k}" ${ok?'':'disabled'} aria-label="Nâng ${n}">＋</button></div></div>`;}).join('')}</div>`;}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="tpup"],[data-a="tpreset"]');if(!b||!S)return;e.stopImmediatePropagation();if(b.dataset.a==='tpup')tpUp(b.dataset.k);else{heroS().tp={};sfx('pick');uiToast('Đã chia lại điểm thiên phú.','');save();}if(typeof H4==='object'&&H4.on)h4Draw(true);else if(G.panel)uiOpenRefresh();},true);
// tác dụng
{const k=()=>1+0.08*tpLv('san');const _ad=animalDamage;animalDamage=function(a,dmg){return _ad(a,dmg*k());};const _fd=foeDamage;foeDamage=function(f,dmg){return _fd(f,dmg*k());};}
{const _sp=swingPer;swingPer=function(t){return _sp(t)/(1+0.08*tpLv('rung'));};}
{const _hd=heroDef;heroDef=function(){return Math.min(0.7,_hd()+0.04*tpLv('da'));};}
{const _ms=maxStam;maxStam=function(){return _ms.apply(this,arguments)+10*tpLv('ben');};}
{const _tf=tameFeed;tameFeed=function(a){const t0=a.tame||0;const r=_tf.apply(this,arguments);try{const n=tpLv('thu');if(n&&a.alive&&(a.tame||0)>t0&&a.tame<0.99)a.tame=Math.min(0.98,a.tame+(a.tame-t0)*0.3*n);}catch(e){}return r;};}
{const _bt=bodyTick;bodyTick=function(dt){const p=S&&S.p,f0=p?p.food:0,w0=p?p.water:0;const r=_bt.apply(this,arguments);try{const n=tpLv('no');if(n&&p){if(p.food<f0)p.food+=(f0-p.food)*0.08*n;if(p.water<w0)p.water+=(w0-p.water)*0.08*n;}}catch(e){}return r;};}
