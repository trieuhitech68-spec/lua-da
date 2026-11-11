/* ===================== NÂNG CẤP CẢ CĂN NHÀ TẠI CHỖ =====================
   Không phải phá nhà cũ dựng nhà mới: đứng trong / cạnh nhà, mở Xây → ⬆️ Nâng cấp & sửa chữa, bấm "Nâng cả nhà".
   Mọi sàn, vách, mái của bạn trong vòng 14 m đổi sang vật liệu bậc trên ngay tại chỗ (đồ đạc bên trong giữ nguyên), tốn 60% giá cấu kiện mới.
     Bậc 1 Nhà gỗ lá  →  Bậc 2 Nhà tre vách đất (vách đất trát rơm, sàn tre, mái tranh dày)  →  Bậc 3 Nhà gạch đá (tường gạch, sàn đá).
   Thiếu vật liệu có nút "🤖 Tự gom vật liệu". */
const NN_MAP=[{n:'Nhà tre vách đất',m:{wall:'mudWall',wallDoor:'bambooWallDoor',wallWindow:'mudWallWindow',floor:'bambooFloor',roof:'thatchRoof',leafRoof:'thatchRoof'}},
  {n:'Nhà gạch đá',m:{mudWall:'stoneWall',bambooWall:'stoneWall',mudWallWindow:'stoneWall',bambooWallDoor:'stoneWallDoor',wallDoor:'stoneWallDoor',bambooFloor:'stoneFloor',floor:'stoneFloor',wall:'stoneWall',wallWindow:'stoneWall'}}];
const NN_R=280;
function nnPlan(){const near=S.builds.filter(b=>b.prog==null&&!b.remote&&Math.hypot(b.x-P.x,b.z-P.z)<NN_R);
  for(let t=0;t<NN_MAP.length;t++){const M=NN_MAP[t].m,L=near.filter(b=>M[b.k]&&pieceDef(M[b.k]));if(!L.length)continue;if(t===1&&near.some(b=>NN_MAP[0].m[b.k]&&/^(wall|floor|roof)/.test(b.k))&&!L.some(b=>/mud|bamboo/.test(b.k)))continue;
    const cost={};let lvNeed=null;for(const b of L){const d=pieceDef(M[b.k]);for(const k in d.cost)cost[k]=(cost[k]||0)+d.cost[k]*0.6;if(d.lv&&!lvOk(d.lv))lvNeed=d;}for(const k in cost)cost[k]=Math.max(1,Math.ceil(cost[k]));
    return {t,name:NN_MAP[t].n,L,cost,lvNeed};}return null;}
function nnDo(){const pl=nnPlan();if(!pl)return;if(pl.lvNeed){uiToast('Cần '+lvText(pl.lvNeed.lv)+' mới dựng được '+pl.lvNeed.n+'.','bad');sfx('no');return;}if(!canPay(pl.cost)){uiToast('Thiếu vật liệu để nâng cả nhà.','bad');sfx('no');return;}pay(pl.cost);const M=NN_MAP[pl.t].m;
  for(const b of pl.L){try{structRemove(b);/* structRemove gỡ luôn khỏi S.builds: thêm lại */b.k=M[b.k];if(b.cond!=null)b.cond=100;S.builds.push(b);structAdd(b,true);cnt('build',b.k);}catch(e){console.warn('nâng nhà',e);}}
  try{decoRebuild();}catch(e){}try{unlockCheck();}catch(e){}addXp('build',6+pl.L.length*2);cnt('cnt','upgrade');sfx('level');try{puff(P.x,P.y+30,P.z,'#ffd27a',16);}catch(e){}uiToast(`🏠 Đã nâng ${pl.L.length} cấu kiện: nhà của bạn giờ là ${pl.name}.`,'gold');save();if(G.panel)uiOpenRefresh();}
function nnGather(){const pl=nnPlan();if(!pl)return;if(G.panel)uiClose();aqStart(-1,{job:{k:'getAll',cost:Object.assign({},pl.cost),lab0:'Gom vật liệu nâng nhà',lab:'Gom vật liệu nâng nhà'}});uiToast('🤖 Đi gom vật liệu nâng nhà. Gom xong quay lại Xây → Nâng cấp bấm "Nâng cả nhà".','');}
{const _uh=upHtml;upHtml=function(){let h=_uh.apply(this,arguments);try{const pl=nnPlan();if(pl){const ok=canPay(pl.cost)&&!pl.lvNeed;
      h=`<div class="nn-box"><b>🏠 Nâng cả nhà lên ${esc(pl.name)}</b><span class="small muted">${pl.L.length} sàn, vách, mái quanh đây đổi vật liệu ngay tại chỗ, đồ đạc giữ nguyên. Tốn: ${upCostTxt(pl.cost)}${pl.lvNeed?` · <span class="up-miss">cần ${esc(lvText(pl.lvNeed.lv))}</span>`:''}</span>
        <div class="row"><button class="btn sm${ok?'':' ghost'}" data-a="nndo">⬆️ Nâng cả nhà</button>${canPay(pl.cost)?'':'<button class="btn sm aq-need" data-a="nnget">🤖 Tự gom vật liệu</button>'}</div></div>`+h;}}catch(e){}return h;};}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="nndo"],[data-a="nnget"]');if(!b||!S)return;e.stopImmediatePropagation();if(b.dataset.a==='nndo')nnDo();else nnGather();},true);
{const st=document.createElement('style');st.textContent=`.nn-box{display:flex;flex-direction:column;gap:6px;padding:10px 12px;margin-bottom:10px;border-radius:14px;border:1px solid #f2c55a;background:linear-gradient(170deg,rgba(242,197,90,.16),rgba(242,197,90,.04))}.nn-box b{font-size:14.5px;color:#ffe2a8}`;document.head.appendChild(st);}
