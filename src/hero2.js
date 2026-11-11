/* ===================== NHÂN VẬT (bản 2): ẢNH CHÂN DUNG · DANH HIỆU · LỰC CHIẾN · Ô TRANG BỊ · CƯỜNG HOÁ · BẢNG THUỘC TÍNH MỚI =====================
   Thay heroHtml của hero.js bằng một bảng có bố cục rõ: thẻ chân dung (ảnh chụp chính nhân vật trong game) + danh hiệu + lực chiến,
   lưới ô trang bị, thẻ thuộc tính có thanh tiến độ, ba ô cường hoá, lưới chỉ số, kỹ năng.
   NÂNG CẤP MỚI
     · Danh hiệu theo cấp nhân vật (8 bậc, từ Người hái lượm tới Hùng Vương): mỗi bậc +2% sát thương và +2% tốc độ làm việc.
     · Cường hoá 3 ô (mỗi ô tối đa +10, giữ nguyên khi đổi món đang dùng): Vũ khí +6% sát thương/bậc · Giáp phục −2% sát thương nhận/bậc
       · Dụng cụ +5% tốc độ chặt, đào/bậc. Tốn vật liệu tăng dần (đá, da, gỗ; từ bậc 6 cần đồng thau, từ bậc 9 cần sắt). Phải đứng gần Bàn chế tác.
   Lưu: S.hero.en={wp,ar,tl}. */
const HERO_RANK=[[1,'Người hái lượm','🌿'],[5,'Thợ săn','🏹'],[10,'Chiến binh','🗡️'],[15,'Dũng sĩ','🛡️'],[20,'Thủ lĩnh','🔥'],[30,'Lạc tướng','🐉'],[40,'Lạc hầu','👑'],[50,'Hùng Vương','☀️']];
const HERO_EN=[['wp','⚔️','Vũ khí','+6% sát thương mỗi bậc',0.06],['ar','🛡️','Giáp phục','−2% sát thương nhận vào mỗi bậc',0.02],['tl','🪓','Dụng cụ','+5% tốc độ chặt, đào mỗi bậc',0.05]];
const HERO_ENMAX=10;
function heroRankI(){const lv=heroLv();let i=0;for(let k=0;k<HERO_RANK.length;k++)if(lv>=HERO_RANK[k][0])i=k;return i;}
function heroEn(k){const h=heroS();if(!h.en||typeof h.en!=='object')h.en={};return clamp(h.en[k]|0,0,HERO_ENMAX);}
function heroEnCost(k,n){const c={};// n: bậc sẽ lên tới (1..10)
  if(k==='wp'){c.stone=3*n;c.flint=n;}else if(k==='ar'){c.hide=n;c.fiber=3*n;}else{c.wood=2*n;c.rope=n;}
  if(n>=6)c.bronze=n-5;if(n>=9&&ITEMS.iron)c.iron=n-8;return c;}
function heroEnUp(k){const n=heroEn(k)+1;if(n>HERO_ENMAX)return;if(typeof nearStation==='function'&&!nearStation('workbench',true)){uiToast('Đứng gần Bàn chế tác mới cường hoá được.','bad');sfx('no');return;}
  const c=heroEnCost(k,n);if(!canPay(c)){uiToast('Thiếu vật liệu để cường hoá.','bad');sfx('no');return;}pay(c);heroS().en[k]=n;addXp('craft',4+n*2);cnt('cnt','enhance');sfx('level');try{puff(P.x,P.y+30,P.z,'#ffd27a',10);}catch(e){}
  const E=HERO_EN.find(e=>e[0]===k);uiToast(`✨ Cường hoá ${E[2]} lên +${n}.`,'gold');HR2.shotT=-99;save();uiHotbar();if(G.panel==='l4')uiOpenRefresh();}
/* ---------- áp tác dụng (bọc thêm một lớp ngoài hero.js) ---------- */
{const k=()=>(1+0.06*heroEn('wp'))*(1+0.02*heroRankI());const _ad=animalDamage;animalDamage=function(a,dmg){return _ad(a,dmg*k());};const _fd=foeDamage;foeDamage=function(f,dmg){return _fd(f,dmg*k());};}
{const _sp=swingPer;swingPer=function(t){return _sp(t)/(1+0.05*heroEn('tl'));};}
{const _wt=workTick;workTick=function(dt){return _wt(dt*(1+0.02*heroRankI()));};}
{const _hd=heroDef;heroDef=function(){return Math.min(0.6,_hd()+0.02*heroEn('ar'));};}
/* ---------- ảnh chân dung: chụp chính nhân vật bằng bộ dựng hình của game ---------- */
const HR2={shot:'',shotT:-99,lut:null};
function heroShot(){try{if(!G.R||!P.model||!G.sc)return '';if(HR2.shot&&G.t-HR2.shotT<25)return HR2.shot;const T=THREE,R=G.R,W=240,H=320,rt=new T.WebGLRenderTarget(W,H),cam=new T.PerspectiveCamera(26,W/H,2,600);
    const fx=Math.sin(P.ry||0),fz=Math.cos(P.ry||0);cam.position.set(P.x+fx*104+fz*18,P.y+27,P.z+fz*104-fx*18);cam.lookAt(P.x,P.y+18.5,P.z);cam.layers.enableAll();
    const hemi=G.L&&G.L.hemi,h0=hemi?hemi.intensity:0,fog=G.sc.fog,old=R.getRenderTarget(),vis=[];if(hemi)hemi.intensity=Math.max(h0,0.95);G.sc.fog=null;
    if(G.fpRig){vis.push([G.fpRig,G.fpRig.visible]);G.fpRig.visible=false;}P.model.traverse(o=>{if(o.visible===false&&o===P.model){vis.push([o,false]);o.visible=true;}});
    R.setRenderTarget(rt);R.clear();R.render(G.sc,cam);const buf=new Uint8Array(W*H*4);R.readRenderTargetPixels(rt,0,0,W,H,buf);R.setRenderTarget(old);G.sc.fog=fog;if(hemi)hemi.intensity=h0;vis.forEach(([o,v])=>o.visible=v);rt.dispose();
    if(!HR2.lut){HR2.lut=new Uint8Array(256);for(let i=0;i<256;i++)HR2.lut[i]=Math.round(255*Math.pow(i/255,1/2.2));}const L=HR2.lut,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d'),im=g.createImageData(W,H);
    for(let y=0;y<H;y++){const s=(H-1-y)*W*4,d=y*W*4;for(let x=0;x<W*4;x+=4){im.data[d+x]=L[buf[s+x]];im.data[d+x+1]=L[buf[s+x+1]];im.data[d+x+2]=L[buf[s+x+2]];im.data[d+x+3]=255;}}
    g.putImageData(im,0,0);HR2.shot=cv.toDataURL('image/jpeg',0.86);HR2.shotT=G.t;return HR2.shot;}catch(e){console.warn('chân dung',e);return HR2.shot||'';}}
/* ---------- bảng ---------- */
function heroPower(){const a=heroS().a,arm=typeof m3Arm==='function'?m3Arm():0,dmg=fistPow()*(1+0.06*skLv('hunt'))*(1+0.03*a.str)*(1+0.06*heroEn('wp'))*(1+0.02*heroRankI());
  return Math.round(dmg*45+maxStam()*0.5+(arm+heroDef())*320+heroLv()*14+(heroEn('wp')+heroEn('ar')+heroEn('tl'))*12);}
function heroSlots(){const L=(typeof L4SLOT!=='undefined'?L4SLOT:[]).slice(),tool=selTool();const cell=(lb,ic,id,go)=>`<button class="h2-slot${id?' has':''}" ${go}><span class="h2-si">${id?icon(id,'big'):`<i>${ic}</i>`}</span><small>${esc(id&&ITEMS[id]?ITEMS[id].n:lb)}</small></button>`;
  return `<div class="h2-slots">${cell('Vũ khí, dụng cụ','⚔️',tool,'data-ui="bag"')}${L.map(([k,n,ic])=>cell(n,ic,S.wear&&S.wear[k],'data-a="l4tab" data-t="wear"')).join('')}</div>`;}
heroHtml=function(){const h=heroS(),a=h.a,lv=heroLv(),xp=heroXp(),x0=30*(lv-1)*(lv-1),x1=30*lv*lv,pts=heroPts(),ri=heroRankI(),RK=HERO_RANK[ri],NR=HERO_RANK[ri+1],pc=v=>(v>=0?'+':'')+Math.round(v*100)+'%';
  const tool=selTool(),TI=tool&&ITEMS[tool],arm=typeof m3Arm==='function'?m3Arm():0,pow=fistPow(),hunt=skLv('hunt'),dmg=pow*(1+0.06*hunt)*(1+0.03*a.str)*(1+0.06*heroEn('wp'))*(1+0.02*ri),shot=heroShot();
  const EFF={str:pc(0.03*a.str)+' sát thương',vit:'+'+a.vit*4+' thể lực · −'+Math.round(Math.min(0.5,0.02*a.vit)*100)+'% đòn nhận',agi:pc(0.01*a.agi)+' tốc độ',dex:pc(0.025*a.dex)+' tay nghề'};
  const attrs=HERO_A.map(([k,ic,n,d])=>`<div class="h2-at"><div class="h2-at-h"><span>${ic}</span><b>${n}</b><em>${a[k]}<small>/${HERO_MAX}</small></em></div><div class="h2-bar"><i style="width:${a[k]/HERO_MAX*100}%"></i></div><div class="h2-at-f"><span class="h2-eff">${EFF[k]}</span><button class="btn sm${pts>0&&a[k]<HERO_MAX?'':' ghost'}" data-a="heroup" data-k="${k}" ${pts>0&&a[k]<HERO_MAX?'':'disabled'} aria-label="Cộng ${n}">＋</button></div><span class="small muted">${d}</span></div>`).join('');
  const ens=HERO_EN.map(([k,ic,n,d,st])=>{const e=heroEn(k),c=e<HERO_ENMAX?heroEnCost(k,e+1):null,ok=c&&canPay(c);return `<div class="h2-en"><div class="h2-en-h"><span>${ic}</span><b>${n} <em>+${e}</em></b></div><div class="h2-pips">${Array.from({length:HERO_ENMAX},(_,i)=>`<i class="${i<e?'on':''}"></i>`).join('')}</div><span class="small muted">${d} · đang ${k==='ar'?'−':'+'}${Math.round(e*st*100)}%</span>${c?`<span class="small">Lên +${e+1}: ${Object.keys(c).map(x=>`<span class="${haveCount(x)>=c[x]?'':'up-miss'}">${c[x]} ${esc(ITEMS[x].n)}</span>`).join(' · ')}</span><button class="btn sm${ok?'':' ghost'}" data-a="heroen" data-k="${k}">✨ Cường hoá</button>`:'<span class="small ok">Đã tối đa</span>'}</div>`;}).join('');
  const tile=(ic,n,v,s)=>`<div class="h2-st"><span>${ic}</span><div><small>${n}</small><b>${v}</b>${s?`<i>${s}</i>`:''}</div></div>`;
  const sk=Object.keys(SKILL).map(k=>{const l=skLv(k),x=S.sk[k]||0,b=12*(l+1)*(l+1),a0=12*l*l;return `<div class="h2-sk"><div><b>${SKILL[k]}</b><em>Cấp ${l}</em></div><div class="h2-bar"><i style="width:${clamp((x-a0)/(b-a0)*100,0,100)}%"></i></div><small class="muted">${Math.floor(x)}/${b} · nhanh hơn ${pc(0.06*l)}</small></div>`;}).join('');
  return `<div class="h2-top">${shot?`<div class="h2-pic"><img src="${shot}" alt="Chân dung nhân vật"><span class="h2-lv">Cấp ${lv}</span></div>`:`<div class="h2-pic h2-nopic"><b>${lv}</b><span class="h2-lv">Cấp</span></div>`}
    <div class="h2-id"><b class="h2-name">${esc(S.name||'')}</b><span class="h2-rank">${RK[2]} ${RK[1]}</span><span class="small muted">${AGES[S.age||0].n} · ngày thứ ${S.day}</span>
      <div class="h2-pow"><small>LỰC CHIẾN</small><b>${heroPower().toLocaleString('vi-VN')}</b></div>
      <div class="h2-bar big"><i style="width:${clamp((xp-x0)/(x1-x0)*100,0,100)}%"></i></div><span class="small muted">Kinh nghiệm ${Math.floor(xp)}/${x1} · còn ${Math.max(0,Math.ceil(x1-xp))} lên cấp ${lv+1}</span>
      <span class="small muted">${NR?`Danh hiệu kế: ${NR[2]} ${NR[1]} ở cấp ${NR[0]}`:'Danh hiệu cao nhất'} · đang ${pc(0.02*ri)} sát thương và tay nghề</span></div></div>
  <h3>Trang bị</h3>${heroSlots()}
  <h3>Thuộc tính ${pts>0?`<span class="hero-pts">còn ${pts} điểm chưa cộng</span>`:'<span class="small muted" style="font-weight:400;text-transform:none">mỗi cấp +2 điểm</span>'}</h3><div class="h2-ats">${attrs}</div>
  <div class="row"><button class="btn sm ghost" data-a="heroreset">↺ Chia lại điểm</button></div>
  <h3>Cường hoá</h3><p class="small muted">Cường hoá gắn với ô, đổi món đang dùng vẫn giữ. Đứng gần Bàn chế tác.</p><div class="h2-ens">${ens}</div>
  <h3>Chỉ số</h3><div class="h2-sts">
    ${tile('⚔️','Sát thương mỗi đòn',dmg.toFixed(2),(TI?esc(TI.n):'tay không'))}${tile('⏱️','Tốc độ ra đòn',pc(0.06*hunt+0.015*a.str),'Săn bắt + Sức mạnh')}
    ${tile('🛡️','Giáp, khiên',Math.round(arm*100)+'%','từ đồ đang mặc')}${tile('💠','Giảm đòn nhận',Math.round(heroDef()*100)+'%','Thể chất + cường hoá')}
    ${tile('❤️','Máu',Math.round(S.p.hp)+' / 100','')}${tile('⚡','Thể lực tối đa',Math.round(maxStam()),'')}
    ${tile('🏃','Tốc độ đi',pc(0.01*a.agi),'')}${tile('✋','Tốc độ làm việc',pc((1+0.025*a.dex)*(1+0.02*ri)-1),'')}</div>
  <h3>Kỹ năng</h3><div class="h2-sks">${sk}</div>
  <p class="small muted">Kỹ năng lên cấp nhờ làm nhiều: cấp L cần 12×L² kinh nghiệm. Kinh nghiệm nhân vật là tổng kinh nghiệm 10 kỹ năng.</p>`;};
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="heroen"]');if(!b||!S)return;e.stopImmediatePropagation();heroEnUp(b.dataset.k);},true);
{const st=document.createElement('style');st.textContent=`.h2-top{display:flex;gap:12px;margin-bottom:6px}.h2-pic{position:relative;flex:none;width:116px;height:156px;border-radius:14px;overflow:hidden;border:2px solid rgba(242,197,90,.55);box-shadow:0 6px 16px rgba(0,0,0,.45);background:#1a120c}.h2-pic img{width:100%;height:100%;object-fit:cover;display:block}
.h2-nopic{display:flex;align-items:center;justify-content:center;background:linear-gradient(160deg,#f2c55a,#b9792a)}.h2-nopic b{font-family:Bungee,sans-serif;font-size:44px;color:#2a1608}
.h2-lv{position:absolute;left:0;right:0;bottom:0;padding:3px 0;text-align:center;font-size:11.5px;font-weight:800;color:#2a1608;background:linear-gradient(90deg,#f2c55a,#ffb347)}
.h2-id{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.h2-name{font-size:18px;line-height:1.15;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.h2-rank{align-self:flex-start;font-size:12px;font-weight:800;color:#2a1608;background:#f2c55a;border-radius:10px;padding:2px 9px}
.h2-pow{display:flex;align-items:baseline;gap:8px;margin:2px 0}.h2-pow small{font-size:10px;font-weight:800;letter-spacing:.08em;color:#cbb994}.h2-pow b{font-family:Bungee,sans-serif;font-size:24px;color:#ffd27a;text-shadow:0 2px 0 #5a3410}
.h2-bar{height:6px;border-radius:4px;background:rgba(255,255,255,.1);overflow:hidden}.h2-bar.big{height:9px}.h2-bar i{display:block;height:100%;background:linear-gradient(90deg,#f2c55a,#ff8a3a)}
.h2-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(74px,1fr));gap:7px;margin-bottom:8px}.h2-slot{display:flex;flex-direction:column;align-items:center;gap:3px;padding:7px 3px 6px;border-radius:12px;border:1px dashed rgba(255,255,255,.16);background:rgba(255,255,255,.03);color:var(--fg);min-height:78px}.h2-slot.has{border:1px solid rgba(242,197,90,.5);background:rgba(242,197,90,.1)}
.h2-si{width:40px;height:40px;display:flex;align-items:center;justify-content:center}.h2-si i{font-style:normal;font-size:22px;opacity:.38}.h2-si img,.h2-si .ic{width:40px;height:40px}.h2-slot small{font-size:10.5px;line-height:1.15;text-align:center;color:#d8c8a8;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.h2-ats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-bottom:8px}.h2-at{display:flex;flex-direction:column;gap:5px;padding:10px;border-radius:14px;background:linear-gradient(170deg,rgba(255,255,255,.07),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.08)}
.h2-at-h{display:flex;align-items:center;gap:6px}.h2-at-h span{font-size:20px}.h2-at-h b{flex:1;font-size:13.5px}.h2-at-h em{font-style:normal;font-family:Bungee,sans-serif;font-size:19px;color:#ffd27a}.h2-at-h em small{font-family:var(--body,inherit);font-size:11px;color:#a89878}
.h2-at-f{display:flex;align-items:center;justify-content:space-between;gap:6px}.h2-eff{font-size:12px;font-weight:700;color:#b8e07a}.h2-at-f .btn{min-width:44px;min-height:40px;font-size:18px;padding:0}
.h2-ens{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-bottom:8px}.h2-en{display:flex;flex-direction:column;gap:5px;padding:10px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(242,197,90,.18)}.h2-en-h{display:flex;align-items:center;gap:6px}.h2-en-h span{font-size:20px}.h2-en-h em{font-style:normal;color:#ffd27a}
.h2-pips{display:flex;gap:3px}.h2-pips i{flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,.12)}.h2-pips i.on{background:linear-gradient(90deg,#f2c55a,#ff8a3a)}.h2-en .btn{min-height:38px}
.h2-sts{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-bottom:8px}.h2-st{display:flex;gap:8px;align-items:center;padding:8px 10px;border-radius:12px;background:rgba(255,255,255,.05)}.h2-st>span{font-size:20px}.h2-st div{min-width:0;display:flex;flex-direction:column}.h2-st small{font-size:10.5px;color:#cbb994}.h2-st b{font-size:15px;color:#f6e3b4}.h2-st i{font-style:normal;font-size:10.5px;color:#a89878;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.h2-sks{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:7px;margin-bottom:6px}.h2-sk{display:flex;flex-direction:column;gap:4px;padding:8px 10px;border-radius:12px;background:rgba(255,255,255,.04)}.h2-sk>div:first-child{display:flex;justify-content:space-between;font-size:12.5px}.h2-sk em{font-style:normal;color:#ffd27a;font-weight:700}.h2-sk small{font-size:10.5px}`;document.head.appendChild(st);}
