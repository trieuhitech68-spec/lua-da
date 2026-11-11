/* ===================== NHÂN VẬT: CẤP ĐỘ · ĐIỂM THUỘC TÍNH · BẢNG THÔNG SỐ CHI TIẾT =====================
   - Cấp nhân vật tính từ TỔNG kinh nghiệm của 10 kỹ năng: cấp = 1 + ⌊√(tổng/30)⌋. Mỗi cấp cho 2 điểm thuộc tính.
   - 4 thuộc tính (mỗi thứ tối đa 30 điểm), cộng thẳng vào công thức có sẵn bằng cách bọc hàm (không sửa tệp cũ):
       Sức mạnh  : +3% sát thương, vung nhanh hơn 1,5% mỗi điểm            (animalDamage, foeDamage, swingPer)
       Thể chất  : +4 thể lực tối đa, giảm 2% sát thương nhận vào (tối đa 50%) (maxStam, animalAttack, foeHit)
       Nhanh nhẹn: +1% tốc độ di chuyển mỗi điểm                            (move)
       Khéo léo  : chế tạo / xây / làm việc nhanh hơn 2,5% mỗi điểm         (workTick)
   - Bảng "Nhân vật" (tab đầu của bảng 🧍 Cơ thể): mọi con số đang áp dụng lên nhân vật, từ đâu mà có, và cấp sau được gì.
   Lưu: S.hero={a:{str,vit,agi,dex}}. */
const HERO_A=[['str','💪','Sức mạnh','+3% sát thương, vung rìu / cuốc / vũ khí nhanh hơn 1,5%'],['vit','❤️','Thể chất','+4 thể lực tối đa, giảm 2% sát thương nhận vào'],['agi','🏃','Nhanh nhẹn','+1% tốc độ đi và chạy'],['dex','✋','Khéo léo','chế tạo, xây dựng, làm việc nhanh hơn 2,5%']];
const HERO_MAX=30;
function heroS(){if(!S.hero||typeof S.hero!=='object')S.hero={a:{}};const a=S.hero.a||(S.hero.a={});for(const [k] of HERO_A)a[k]=clamp(a[k]|0,0,HERO_MAX);return S.hero;}
const heroA=k=>S&&S.hero&&S.hero.a?(S.hero.a[k]|0):0;
function heroXp(){let t=0;for(const k in SKILL)t+=S.sk[k]||0;return t;}
function heroLv(){return 1+Math.floor(Math.sqrt(heroXp()/30));}
function heroPts(){const a=heroS().a;let used=0;for(const [k] of HERO_A)used+=a[k];return Math.max(0,(heroLv()-1)*2-used);}
function heroUp(k){const a=heroS().a;if(!(k in a)||heroPts()<=0)return;if(a[k]>=HERO_MAX){uiToast('Thuộc tính này đã tối đa '+HERO_MAX+' điểm.','');return;}a[k]++;sfx('level');save();uiHud(true);if(G.panel==='l4')uiOpenRefresh();}
function heroReset(){const h=heroS();if(!Object.values(h.a).some(v=>v>0))return;for(const [k] of HERO_A)h.a[k]=0;uiToast('Đã trả lại toàn bộ điểm thuộc tính để chia lại.','');save();if(G.panel==='l4')uiOpenRefresh();}
/* ---------- áp thuộc tính vào công thức ---------- */
{const _ms=maxStam;maxStam=function(){return _ms()+heroA('vit')*4;};}
{const _sp=swingPer;swingPer=function(t){return _sp(t)/(1+0.015*heroA('str'));};}
{const _ad=animalDamage;animalDamage=function(a,dmg){return _ad(a,dmg*(1+0.03*heroA('str')));};}
{const _fd=foeDamage;foeDamage=function(f,dmg){return _fd(f,dmg*(1+0.03*heroA('str')));};}
const heroDef=()=>Math.min(0.5,0.02*heroA('vit'));
function heroSoak(hp0){const lost=hp0-S.p.hp,k=heroDef();if(lost>0&&k>0&&S.p.hp>0)S.p.hp=Math.min(100,S.p.hp+lost*k);}
{const _aa=animalAttack;animalAttack=function(a){const h=S.p.hp;const r=_aa.apply(this,arguments);heroSoak(h);return r;};}
{const _fh=foeHit;foeHit=function(f,t){const h=S.p.hp;const r=_fh.apply(this,arguments);if(t&&t.pl)heroSoak(h);return r;};}
{const _mv=move;move=function(dx,dz,m,dt,run){return _mv(dx,dz,m*(1+0.01*heroA('agi')),dt,run);};}
{const _wt=workTick;workTick=function(dt){return _wt(dt*(1+0.025*heroA('dex')));};}
// lên cấp nhân vật: báo và nhắc chia điểm
{const _ax=addXp;addXp=function(k,n){const a=S?heroLv():0;const r=_ax.apply(this,arguments);if(S){const b=heroLv();if(b>a){uiToast(`⭐ Nhân vật lên cấp ${b}! Được ${(b-a)*2} điểm thuộc tính: mở 🧍 Cơ thể → Nhân vật để cộng.`,'gold');try{puff(P.x,P.y+30,P.z,'#ffd27a',14);}catch(e){}}}return r;};}
/* ---------- bảng thông số ---------- */
function heroRow(n,v,src){return `<tr><td>${n}</td><td><b>${v}</b></td><td class="muted">${src||''}</td></tr>`;}
function heroHtml(){const h=heroS(),a=h.a,lv=heroLv(),xp=heroXp(),x0=30*(lv-1)*(lv-1),x1=30*lv*lv,pts=heroPts(),pc=v=>(v>=0?'+':'')+Math.round(v*100)+'%';
  const tool=selTool(),TI=tool&&ITEMS[tool],arm=typeof m3Arm==='function'?m3Arm():0,pow=fistPow(),hunt=skLv('hunt'),dmg=pow*(1+0.06*hunt)*(1+0.03*a.str);
  const attrs=HERO_A.map(([k,ic,n,d])=>`<div class="hero-at"><span class="hero-ic">${ic}</span><div><b>${n} <i>${a[k]}</i><small>/${HERO_MAX}</small></b><span class="small muted">Mỗi điểm: ${d}</span></div><button class="btn sm${pts>0&&a[k]<HERO_MAX?'':' ghost'}" data-a="heroup" data-k="${k}" ${pts>0&&a[k]<HERO_MAX?'':'disabled'}>＋</button></div>`).join('');
  const wear=Object.keys(S.wear||{}).filter(s=>S.wear[s]).map(s=>{const w=S.wear[s],id=typeof w==='string'?w:w&&w.id,I=id&&ITEMS[id];return I?esc(I.n):'';}).filter(Boolean).join(', ')||'chưa mặc gì';
  const sk=Object.keys(SKILL).map(k=>{const l=skLv(k),x=S.sk[k]||0,b=12*(l+1)*(l+1),a0=12*l*l;return `<tr><td>${SKILL[k]}</td><td><b>Cấp ${l}</b></td><td><div class="hero-bar"><i style="width:${clamp((x-a0)/(b-a0)*100,0,100)}%"></i></div></td><td class="muted">${Math.floor(x)}/${b}</td><td class="muted">nhanh hơn ${pc(0.06*l)}</td></tr>`;}).join('');
  return `<div class="hero-top"><div class="hero-lv"><small>CẤP</small><b>${lv}</b></div><div class="hero-id"><b>${esc(S.name||'')}</b><span class="small muted">${AGES[S.age||0].n} · ngày thứ ${S.day} · uy tín ${Math.round(S.rep||0)}</span>
    <div class="hero-bar big"><i style="width:${clamp((xp-x0)/(x1-x0)*100,0,100)}%"></i></div><span class="small muted">Kinh nghiệm ${Math.floor(xp)} / ${x1} · còn ${Math.max(0,Math.ceil(x1-xp))} nữa lên cấp ${lv+1} (+2 điểm)</span></div></div>
  <p class="small muted">Kinh nghiệm nhân vật là tổng kinh nghiệm 10 kỹ năng: làm việc gì cũng giúp lên cấp. Mỗi cấp được 2 điểm để cộng vào 4 thuộc tính dưới đây.</p>
  <h3>Thuộc tính ${pts>0?`<span class="hero-pts">còn ${pts} điểm chưa cộng</span>`:''}</h3><div class="hero-ats">${attrs}</div>
  <div class="row"><button class="btn sm ghost" data-a="heroreset">↺ Chia lại điểm</button></div>
  <h3>Chiến đấu</h3><table class="hero-tb">
    ${heroRow('Sát thương mỗi đòn',dmg.toFixed(2),`${TI?esc(TI.n):'tay không'} ${pow.toFixed(1)} × Săn bắt cấp ${hunt} (${pc(0.06*hunt)}) × Sức mạnh (${pc(0.03*a.str)})`)}
    ${heroRow('Giáp, khiên chặn',Math.round(arm*100)+'%','từ áo giáp, khiên đang mặc')}
    ${heroRow('Giảm sát thương nhận vào',Math.round(heroDef()*100)+'%','Thể chất ×2% (tối đa 50%), cộng thêm sau giáp')}
    ${heroRow('Tốc độ ra đòn',pc(0.06*hunt+0.015*a.str),'Săn bắt + Sức mạnh')}
  </table>
  <h3>Cơ thể</h3><table class="hero-tb">
    ${heroRow('Máu',Math.round(S.p.hp)+' / 100','ăn chín, ngủ, thuốc để hồi')}
    ${heroRow('Thể lực tối đa',Math.round(maxStam()),`gốc 100 + Thể lực cấp ${skLv('run')} ×5 + Thể chất ${a.vit} ×4, trừ khi ốm mệt`)}
    ${heroRow('Tốc độ di chuyển',pc(0.01*a.agi),'Nhanh nhẹn ×1%; đường mòn +12%, lội nước chậm hơn')}
    ${heroRow('Tốc độ làm việc',pc(0.025*a.dex),'Khéo léo ×2,5%; đói, khát, sốt làm chậm')}
    ${heroRow('Đang mặc',wear,'đổi ở tab Y phục')}
  </table>
  <h3>Kỹ năng</h3><table class="hero-tb sk">${sk}</table>
  <p class="small muted">Kỹ năng lên cấp nhờ làm nhiều: cấp L cần 12×L² kinh nghiệm. Mỗi cấp làm việc đó nhanh hơn 6% và mở công thức, công trình khó hơn.</p>`;}
L4TABS.unshift(['hero','Nhân vật']);
{const _bh=l4BodyHtml;l4BodyHtml=function(){return G.l4tab==='hero'?heroHtml():_bh.apply(this,arguments);};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="heroup"],[data-a="heroreset"]');if(!b||!S)return;e.stopImmediatePropagation();if(b.dataset.a==='heroup')heroUp(b.dataset.k);else heroReset();},true);
// mở bảng Cơ thể lần đầu thì vào tab Nhân vật; có điểm chưa cộng thì chấm đỏ trên nút
{const _uo=uiOpen;uiOpen=function(k,o,keep){if(k==='l4'&&!(o&&o.tab)&&!G.l4tab)G.l4tab='hero';return _uo.apply(this,arguments);};}
{const st=document.createElement('style');st.textContent=`.hero-top{display:flex;gap:12px;align-items:center;margin-bottom:8px}.hero-lv{flex:none;width:64px;height:64px;border-radius:16px;background:linear-gradient(160deg,#f2c55a,#b9792a);color:#2a1608;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.4)}.hero-lv small{font-size:10px;font-weight:800;letter-spacing:.08em}.hero-lv b{font-family:Bungee,sans-serif;font-size:26px;line-height:1}
.hero-id{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.hero-id>b{font-size:16px}.hero-bar{height:6px;border-radius:4px;background:rgba(255,255,255,.1);overflow:hidden;min-width:60px}.hero-bar.big{height:9px}.hero-bar i{display:block;height:100%;background:linear-gradient(90deg,#f2c55a,#ff8a3a)}
.hero-ats{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:8px;margin-bottom:8px}.hero-at{display:flex;gap:10px;align-items:center;padding:8px 10px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.07)}.hero-at>div{flex:1;min-width:0;display:flex;flex-direction:column}.hero-ic{font-size:22px}.hero-at b i{font-style:normal;color:#f2c55a;font-size:16px}.hero-at b small{color:#a89878;font-weight:400}.hero-at .btn{min-width:44px;min-height:44px;font-size:18px}
.hero-pts{font-size:11.5px;font-weight:700;color:#2a1608;background:#f2c55a;border-radius:10px;padding:2px 8px;margin-left:6px;vertical-align:middle}
.hero-tb{width:100%;border-collapse:collapse;font-size:12.5px;margin-bottom:6px}.hero-tb td{padding:6px 6px;border-bottom:1px solid rgba(255,255,255,.06);vertical-align:top}.hero-tb td:nth-child(2){white-space:nowrap;color:#f6e3b4}.hero-tb td:nth-child(3){font-size:11.5px}.hero-tb.sk td{vertical-align:middle}.hero-tb.sk td:nth-child(3){width:30%}`;document.head.appendChild(st);}
