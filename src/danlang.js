/* ===================== BẢNG DÂN LÀNG GỌN: PHÂN CÔNG THEO VIỆC =====================
   Trước: mỗi người một dòng dài kèm cả hàng nút việc → làng đông là bảng kéo rất dài, lại thiếu việc Làm ruộng.
   Giờ: · Phần trên là BẢNG PHÂN CÔNG: mỗi VIỆC một ô (đủ 13 việc trong game), ghi đang có mấy người, bấm + / − để thêm bớt người.
          Bấm + thì lấy người đang rảnh, ưu tiên đúng sở trường và cấp cao; bấm − thì người đó về nghỉ. Ô nào thiếu điều kiện (chưa có luống đất, chưa có cổng…) có dòng nhắc.
        · Phần dưới là DANH SÁCH gom theo việc: người cùng việc nằm chung một nhóm, mỗi người một thẻ nhỏ (tên, cấp, tù binh, đang đói). Bấm thẻ để xem riêng và giao việc cho đúng người đó. */
const DL_J=[['gather','🧺','Hái lượm','quả, sợi cỏ, nấm, cành khô','Kiếm vật liệu'],['wood','🪓','Đốn gỗ','chặt cây mang gỗ về kho','Kiếm vật liệu'],['stone','⛏️','Đào đá','đá, sỏi, đá lửa','Kiếm vật liệu'],
 ['farm','🌱','Làm ruộng','gieo hạt, gặt luống chín','Lương thực'],['herd','🐔','Chăn nuôi','cho ăn, nhặt trứng, vớt cá ao','Lương thực'],['hunt','🏹','Đi săn','thỏ, gà rừng, nai, dê núi','Lương thực'],['fish','🎣','Đánh cá','câu ở bờ nước gần nhà','Lương thực'],['cook','🍲','Nấu ăn','nướng thịt, cá trong kho','Lương thực'],
 ['build','🔨','Thợ xây','làm nốt công trường dở','Xây dựng'],
 ['guard','🛡️','Canh gác','chòi, cổng, quanh nhà','Bảo vệ'],['gate','🚪','Giữ cổng','đứng hai bên cổng','Bảo vệ'],['soldier','⚔️','Lính theo bạn','đi cùng, đánh giúp','Bảo vệ'],
 ['idle','💤','Nghỉ ngơi','người rảnh, chờ giao việc','']];
const dlName=j=>{const r=DL_J.find(x=>x[0]===j);return r?r[1]+' '+r[2]:(JOBN[j]||j);};
function dlWarn(j){try{const B=S.builds,has=f=>B.some(b=>b.prog==null&&!b.remote&&f(b));
    if(j==='farm'&&!has(b=>pieceDef(b.k)&&pieceDef(b.k).farm))return 'Chưa có luống đất';if(j==='herd'&&!(S.pets||[]).length)return 'Chưa có vật nuôi';if(j==='build'&&!B.some(b=>b.prog!=null&&!b.remote))return 'Không có công trường dở';
    if(j==='gate'&&!has(b=>/gate/i.test(b.k)))return 'Chưa có cổng: sẽ gác quanh nhà';if(j==='cook'&&!has(b=>b.k==='campfire'))return 'Chưa có bếp lửa';
    if(j!=='idle'&&j!=='guard'&&j!=='gate'&&j!=='soldier'&&!has(b=>pieceDef(b.k)&&pieceDef(b.k).store&&b.k!=='trough'))return 'Chưa có giỏ, rương để cất đồ';}catch(e){}return '';}
function dlMove(j,d){const L=S.folk||[];if(d>0){const pool=L.filter(f=>(f.job||'idle')==='idle');if(!pool.length){uiToast('Không còn ai rảnh. Bấm − ở việc khác để rút người ra trước.','bad');sfx('no');return;}
    pool.sort((a,b)=>((danSp(b)===j)-(danSp(a)===j))||(danLv(b)-danLv(a)));const f=pool[0];f.job=j;f._st='idle';}
  else{const cur=L.filter(f=>f.job===j);if(!cur.length)return;cur.sort((a,b)=>((danSp(a)===j)-(danSp(b)===j))||(danLv(a)-danLv(b)));const f=cur[0];f.job='idle';f._st='idle';}
  sfx('pick');save();uiOpenRefresh();}
danHtml=function(){const L=S.folk||[],D=danS(),beds=S.builds.filter(b=>{const d=pieceDef(b.k);return d&&d.bed&&b.prog==null;}).length,day=TNOW();
  for(const f of L)if(!f.job||!DL_J.some(x=>x[0]===f.job))f.job='idle';const cnt=j=>L.filter(f=>f.job===j).length,free=cnt('idle');
  let tiles='',g0=null;for(const [j,ic,n,ds,g] of DL_J){if(j==='idle')continue;if(g!==g0){g0=g;tiles+=`<div class="dl-g">${g}</div>`;}const c=cnt(j),w=c?dlWarn(j):'';
    tiles+=`<div class="dl-t${c?' on':''}"><span class="dl-ic">${ic}</span><div class="dl-m"><b>${n}</b><span class="small muted">${ds}</span>${w?`<span class="small warn">⚠ ${w}</span>`:''}</div><div class="dl-pm"><button class="dl-b" data-a="dljob" data-j="${j}" data-d="-1"${c?'':' disabled'} aria-label="Bớt người ${n}">−</button><em>${c}</em><button class="dl-b" data-a="dljob" data-j="${j}" data-d="1"${free?'':' disabled'} aria-label="Thêm người ${n}">+</button></div></div>`;}
  let list='';for(const [j,ic,n] of DL_J){const P_=L.map((f,i)=>[f,i]).filter(([f])=>f.job===j);if(!P_.length)continue;P_.sort((a,b)=>danLv(b[0])-danLv(a[0]));
    list+=`<div class="dl-grp"><b>${ic} ${n} · ${P_.length}</b><div class="dl-ps">${P_.map(([f,i])=>{const hungry=day-(f.fed||0)>1;return `<button class="dl-p${f.cap?' cap':''}${hungry?' hun':''}" data-a="dlwho" data-i="${i}" title="${esc(DAN_SP[danSp(f)][1])}">${DAN_SP[danSp(f)][0]} ${esc(f.n)} <em>c${danLv(f)}</em>${f.cap?` <i>🪢${Math.round(f.loy||0)}</i>`:''}${hungry?' <i>🍖!</i>':''}</button>`;}).join('')}</div></div>`;}
  return `<div class="landbox dl-top"><div class="dl-sum"><b>👥 ${L.length} người</b><span>💤 rảnh ${free}</span><span>🛏️ giường ${L.length}/${beds}</span><span>🪢 dây ${invCount('rope')}</span></div>
    <div class="row"><button class="btn sm${D.on?'':' ghost'}" data-a="dantog">${D.on?'✔ Đang bật bắt sống':'Bắt sống đang tắt: hạ gục là giết'}</button></div>
    <span class="small muted">Bật bắt sống + có dây thừng + còn giường trống: hạ gục chiến binh sẽ trói đem về (tốn 1 dây).</span></div>
  ${L.length?`<h3 class="dl-h">Phân công việc <small class="muted">bấm + để thêm người rảnh, − để rút ra</small></h3><div class="dl-grid">${tiles}</div>
   <details class="dl-list"${L.length<=8||G.dlOpen?' open':''}><summary><b>Danh sách theo việc</b> <span class="small muted">bấm vào tên để xem riêng, giao việc đúng người đó</span></summary>${list}<p class="small muted">Đúng sở trường (biểu tượng trước tên) làm nhanh hơn 40%. 🪢 = tù binh và mức trung thành; 🍖! = đang đói, hãy để thức ăn trong giỏ, rương.</p></details>`
   :'<p class="small muted">Chưa có ai ở cùng. Mời dân Làng Suối Tây (tình thân từ 40) hoặc bắt sống chiến binh các bộ lạc.</p>'}`;};
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="dljob"],[data-a="dlwho"],[data-a="dlback"]');if(!b||!S)return;e.stopImmediatePropagation();
  if(b.dataset.a==='dljob')dlMove(b.dataset.j,+b.dataset.d);else if(b.dataset.a==='dlback'){uiOpen('dan',{});}else{const f=(S.folk||[])[+b.dataset.i];if(f){G.folkCur=f;G.dlFrom=1;uiOpen('folk',{});}}},true);
document.addEventListener('toggle',e=>{const t=e.target;if(t&&t.classList&&t.classList.contains('dl-list'))G.dlOpen=t.open?1:0;},true);
// bảng riêng từng người: nút việc gom theo nhóm, đủ mọi việc, có nút quay lại bảng Dân làng
{const _fh=folkHtml;folkHtml=function(){let h=_fh.apply(this,arguments);try{const f=G.folkCur;if(f){const a=h.indexOf('<div class="npc-acts">'),b=a>=0?h.indexOf('</div>',a):-1;if(a>=0&&b>a){let g0=null,x='';for(const [j,ic,n,ds,g] of DL_J){if(g!==g0){g0=g;x+=`<span class="dl-g2">${g||'Khác'}</span>`;}x+=`<button class="tb sm${f.job===j?' on':''}" data-a="job" data-j="${j}">${ic} ${n}</button>`;}h=h.slice(0,a)+'<div class="npc-acts dl-acts">'+x+h.slice(b);}
      if(G.dlFrom)h=`<div class="row"><button class="btn sm ghost" data-a="dlback">‹ Về bảng Dân làng</button></div>`+h;}}catch(e){}return h;};}
{const _uo=uiOpen;uiOpen=function(k){if(k!=='folk')G.dlFrom=0;return _uo.apply(this,arguments);};}
{const st=document.createElement('style');st.textContent=`.dl-sum{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:baseline;font-size:13px}.dl-sum b{font-size:15px;color:#ffe2a8}.dl-h{margin:10px 0 6px;font-size:15px}.dl-h small{font-weight:400;font-size:11.5px;margin-left:6px}
.dl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:6px}.dl-g{grid-column:1/-1;margin-top:2px;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#f2c55a}
.dl-t{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:12px;background:rgba(20,13,8,.72);border:1px solid rgba(255,255,255,.1)}.dl-t.on{border-color:rgba(242,197,90,.6)}.dl-ic{font-size:20px;width:26px;text-align:center;flex:none}
.dl-m{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.2}.dl-m b{font-size:13.5px}.dl-m .small{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dl-m .warn{color:#ffb86a;white-space:normal}
.dl-pm{display:flex;align-items:center;gap:4px;flex:none}.dl-pm em{font-style:normal;font-weight:800;min-width:20px;text-align:center;font-size:15px}.dl-b{width:36px;height:36px;border-radius:10px;border:1px solid rgba(242,197,90,.5);background:rgba(242,197,90,.14);color:#ffe2a8;font-size:20px;font-weight:800;line-height:1;cursor:pointer}.dl-b[disabled]{opacity:.3}
.dl-list{margin-top:10px;border-radius:12px;border:1px solid rgba(255,255,255,.12);padding:8px 10px}.dl-list summary{cursor:pointer}.dl-grp{margin-top:8px}.dl-grp>b{font-size:13px;color:#ffe2a8}.dl-ps{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}
.dl-p{padding:5px 8px;min-height:34px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:inherit;font-size:12.5px;cursor:pointer}.dl-p em{font-style:normal;color:#f2c55a;font-weight:700}.dl-p i{font-style:normal;font-size:11px}.dl-p.cap{border-color:rgba(255,184,106,.55)}.dl-p.hun{border-color:rgba(255,120,90,.7)}
.dl-acts{display:flex;flex-wrap:wrap;gap:4px;align-items:center}.dl-g2{flex-basis:100%;font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#f2c55a;margin-top:4px}
@media (max-width:520px){.dl-g{display:none}.dl-h small{display:block;margin:2px 0 0}.dl-grid{grid-template-columns:1fr 1fr}.dl-t{padding:5px 6px;gap:5px}.dl-ic{display:none}.dl-m .muted{display:none}.dl-b{width:34px;height:34px}}`;document.head.appendChild(st);}
