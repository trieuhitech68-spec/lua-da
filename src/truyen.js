/* ===================== CỐT TRUYỆN · PHẦN THƯỞNG NHIỆM VỤ · CHƯƠNG "DỰNG NƯỚC" · LỘ TRÌNH XÂY DỰNG =====================
   - Mỗi thời đại là một chương có lời kể; chương đang chơi hiện đầu bảng Nhật ký, sang chương mới thì báo.
   - Hoàn thành mục tiêu nào cũng được thưởng vật phẩm theo chương (mục tiêu bỏ qua thì không). Thẻ mục tiêu ghi sẵn phần thưởng.
   - Chương mới "Dựng nước" (12 mục tiêu nối SAU chuỗi cũ nên chỉ số cũ không đổi) dẫn qua các hệ thống mới: nâng cấp công trình,
     cổng làng, bắt và thu phục thổ dân, cắt lính, lên cấp nhân vật, chiếm điểm tài nguyên, hạ thú chúa, luyện sắt, liên minh.
   - "Lộ trình xây dựng" đầu bảng Xây dựng: 20 công trình mốc theo đúng thứ tự nên dựng, ghi rõ đã có / xây được ngay / còn thiếu gì. */
const TR_BASE=GOALS.length;
GOALS.push(
  G_(4,'Nâng cấp một công trình','Mở Xây dựng → ⬆️ Nâng cấp & sửa chữa: nâng giỏ, rương, bếp hoặc mái lên bậc Gia cố (cần Xây dựng cấp 2).',1,()=>gC('cnt:upgrade')),
  G_(4,'Dựng cổng làng','Rào quanh khu ở rồi dựng một cái cổng (cổng rào, cổng tre hoặc cổng cọc): chỗ để cắt người gác.',1,()=>gDone(/gate/i)),
  G_(4,'Bắt sống một thổ dân','Mang Dây thừng, để sẵn một giường trống ở nhà, rồi hạ gục một chiến binh bộ lạc khác: sẽ trói bắt thay vì giết.',1,()=>gC('cnt:capture')),
  G_(4,'Thu phục một tù binh','Để thức ăn trong giỏ, rương: mỗi ngày ăn đủ thì trung thành tăng. Đủ 100 là quy phục hẳn.',1,()=>gC('cnt:submit')),
  G_(4,'Cắt người giữ cổng và lính','Mở 👥 Dân làng, giao một người "Giữ cổng" và một người "Lính theo bạn".',2,()=>Math.min(1,(S.folk||[]).filter(f=>f.job==='gate').length)+Math.min(1,(S.folk||[]).filter(f=>f.job==='soldier').length)),
  G_(4,'Nhân vật đạt cấp 10','Làm việc gì cũng cho kinh nghiệm. Mở 🧍 Cơ thể → Nhân vật để cộng điểm thuộc tính mỗi khi lên cấp.',10,()=>typeof heroLv==='function'?heroLv():0),
  G_(4,'Chiếm một điểm tài nguyên','Tìm điểm giàu trên bản đồ, hạ hết người canh rồi dựng Cột vật tổ trong vòng đất của điểm đó.',1,()=>gC('cnt:rlcap')),
  G_(4,'Hạ một thú chúa','Mỏ sắt, vỉa than, bãi vàng, mỏ ngọc bích, bãi săn bò tót đều có thú chúa canh. Mang lính theo và giáp tốt.',1,()=>gC('cnt:boss')),
  G_(4,'Luyện thỏi sắt','3 quặng sắt + 2 than đá trong nồi nấu ở lò luyện (Chế tác cấp 6). Sắt cứng và bền hơn đồng thau.',1,()=>gC('craft:iron')),
  G_(4,'Rèn một món đồ sắt','Rìu sắt, giáo sắt, dao sắt, cuốc chim sắt hoặc giáp sắt.',1,()=>gC('craft:axeIron')+gC('craft:spearIron')+gC('craft:knifeIron')+gC('craft:pickIron')+gC('craft:ironArmor')),
  G_(4,'Giữ ba điểm tài nguyên','Tiền đồn mỗi ngày dồn sản vật vào kho. Dựng hàng rào cọc, chòi canh và cắt lính để giữ khi bị đánh lại.',3,()=>typeof rlHeld==='function'?rlHeld():0),
  G_(4,'Lập hoặc gia nhập liên minh','Ở thế giới chung: mở 🤝 Liên minh, lập liên minh hoặc xin gia nhập (tối đa 70 người). Chơi một mình thì mục này tự xong.',1,()=>!S.mp?1:(typeof mpMyClan==='function'&&mpMyClan()?1:0)));
const TR_CH=[
  {n:'Chương 1 · Hai bàn tay trắng',t:'Bạn tỉnh dậy bên bờ Sông Mẹ, không nhớ mình từ đâu tới. Trong tay không có gì ngoài đôi bàn tay. Đêm sắp xuống, rừng đầy tiếng thú. Việc đầu tiên: nhặt cành, ghè đá, tìm nước và sống qua đêm nay.',rw:{berry:3,fiber:3}},
  {n:'Chương 2 · Giữ lửa',t:'Ngọn lửa đầu tiên đổi tất cả: thịt chín, đêm ấm, thú dữ lùi xa. Quanh bếp lửa, bạn học lại nghề của tổ tiên Hòa Bình: thuốc từ lá, áo từ da, mái che từ cành lá.',rw:{rope:2,meatCooked:2}},
  {n:'Chương 3 · Dựng nhà',t:'Lưỡi rìu mài nhẵn hạ được cây to. Bạn không còn chạy theo con mồi nữa mà ở lại: dựng nhà có mái, nặn nồi đất, cất của ăn của để. Một nếp nhà là một lời hẹn sẽ ở lại mảnh đất này.',rw:{plank:3,clay:3}},
  {n:'Chương 4 · Gieo hạt',t:'Hạt kê rơi cạnh bếp mọc thành cây. Từ đó có ruộng, có mùa, có hội làng. Người lạ ghé qua thấy khói bếp ấm thì xin ở lại: bạn không còn một mình.',rw:{grain:4,rope:2}},
  {n:'Chương 5 · Lửa đúc đồng',t:'Đá xanh trong lửa chảy thành thứ nước đỏ rực, nguội lại cứng hơn mọi thứ đá. Tiếng trống đồng vang qua mấy dãy núi: các bộ lạc quanh vùng biết ở đây đã có một thủ lĩnh.',rw:{charcoal:3,bronze:1}},
  {n:'Chương 6 · Dựng nước',t:'Tiếng trống gọi người, cũng gọi cả kẻ thù. Muốn giữ được đất phải có thành, có lính, có sắt. Thu phục các bộ lạc, hạ thú chúa giữ mỏ, kết liên minh: từ một bếp lửa, bạn dựng nên một nước.',rw:{rope:3,bronze:1,meatCooked:3}}];
const trCh=i=>i>=TR_BASE?5:Math.min(4,(GOALS[i]&&GOALS[i].e)|0);
function trS(){if(!S.tr||typeof S.tr!=='object')S.tr={ch:-1};return S.tr;}
function trRwTxt(rw){return Object.keys(rw).filter(k=>ITEMS[k]).map(k=>rw[k]+' '+ITEMS[k].n).join(', ');}
// thưởng khi xong mục tiêu + báo sang chương
{const _gc=goalCheck;goalCheck=function(){if(!S||G.trBusy)return _gc.apply(this,arguments);const g0=S.goal;const r=_gc.apply(this,arguments);
  if(S.goal>g0&&G.on){G.trBusy=1;try{const sk=(S.gd&&S.gd.sk)||{},sum={};let n=0;for(let i=g0;i<S.goal;i++){if(sk[i])continue;const rw=TR_CH[trCh(i)].rw;for(const k in rw)if(ITEMS[k])sum[k]=(sum[k]||0)+rw[k];n++;}
      if(n){give(sum,[P.x,P.y+20,P.z]);uiToast('🎁 Thưởng nhiệm vụ: '+trRwTxt(sum),'gold');}}catch(e){console.warn('thưởng',e);}G.trBusy=0;}
  try{const T=trS(),c=trCh(Math.min(S.goal,GOALS.length-1));if(G.on&&T.ch!==c){const first=T.ch===-1&&S.goal>0;T.ch=c;if(!first)uiToast('📖 '+TR_CH[c].n+' — mở 📜 Nhật ký để đọc.','gold');}}catch(e){}
  return r;};}
// thẻ mục tiêu: ghi phần thưởng
{const _hud=uiHud;uiHud=function(){const r=_hud.apply(this,arguments);try{const el=$('#goal');if(el&&S&&S.goal<GOALS.length&&!el.querySelector('.tr-rw')){const p=el.querySelector('p');if(p)p.insertAdjacentHTML('afterend','<span class="tr-rw">🎁 '+esc(trRwTxt(TR_CH[trCh(S.goal)].rw))+'</span>');}}catch(e){}return r;};}
// nhật ký: lời kể của chương đang chơi (các chương trước gập lại)
{const _jh=journalHtml;journalHtml=function(){const c=trCh(Math.min(S.goal,GOALS.length-1));let h='<div class="tr-box"><b>📖 '+esc(TR_CH[c].n)+'</b><p>'+esc(TR_CH[c].t)+'</p><span class="small muted">Mỗi mục tiêu của chương này thưởng: '+esc(trRwTxt(TR_CH[c].rw))+'.</span>';
  if(c>0)h+='<details><summary>Các chương đã qua</summary>'+TR_CH.slice(0,c).map(x=>'<p><b>'+esc(x.n)+'</b><br>'+esc(x.t)+'</p>').join('')+'</details>';return h+'</div>'+_jh.apply(this,arguments);};}
/* ---------- lộ trình xây dựng ---------- */
const TR_ROAD=[['leanto','chỗ ngủ qua đêm đầu'],['campfire','nấu ăn, sưởi, xua thú'],['basket','cất đồ, người nhà lấy ăn'],['workbench','mở búa, liềm, ván gỗ, cung'],['dryRack','phơi thịt cá để lâu'],['bed','ngủ ngon, có giường mới mời được người'],['tanRack','thuộc da làm áo, giày'],
  ['kiln','nung nồi, gạch'],['farm','trồng kê, bầu, lanh'],['well','nước sạch, cây lớn nhanh'],['chest','kho 30 ô'],['coop','gà đẻ trứng mỗi ngày'],['granary','kho thóc'],['loom','dệt vải'],
  ['smelter','luyện đồng, sắt'],['palisade','rào cọc giữ làng'],['palisadeGate','cổng: cắt người giữ cổng'],['watchtower','chòi canh'],['totem','cột vật tổ: chiếm điểm tài nguyên'],['bronzeDrum','trống đồng: báu vật bộ lạc']];
function trRoadHtml(){let next=null;const rows=TR_ROAD.map(([id,why],i)=>{const d=pieceDef(id);if(!d)return '';const have=S.builds.some(b=>b.k===id&&b.prog==null&&!b.remote),doing=!have&&S.builds.some(b=>b.k===id&&!b.remote);
    let st,cls;if(have){st='✔ đã có';cls='done';}else if(doing){st='đang xây dở';cls='cur';}else{const kn=S.known&&S.known['b:'+id],lh=kn?'':lockHint(d),lvh=kn&&d.lv&&typeof lvOk==='function'&&!lvOk(d.lv)?'Cần '+lvText(d.lv):'';
      if(!kn||lvh){st='🔒 '+(lh||lvh||'chưa mở');cls='lock';}else{st='<button class="btn sm" data-a="build" data-b="'+id+'">Xây</button>';cls='can';if(!next)next=id;}}
    return `<div class="tr-rd ${cls}"><i>${i+1}</i><div><b>${esc(d.n)}</b><span class="small muted">${esc(why)}</span></div><span class="tr-st">${st}</span></div>`;}).join('');
  const done=TR_ROAD.filter(([id])=>S.builds.some(b=>b.k===id&&b.prog==null&&!b.remote)).length;
  return `<details class="landbox tr-road"${G.trRoad?' open':''}><summary><b>🧭 Lộ trình xây dựng</b> <span class="small muted">${done}/${TR_ROAD.length} mốc · nên dựng theo thứ tự này</span></summary>${rows}</details>`;}
{const _bh=buildHtml;buildHtml=function(){let h='';try{h=trRoadHtml();}catch(e){console.warn('lộ trình',e);}return h+_bh.apply(this,arguments);};}
document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.classList&&d.classList.contains('tr-road'))G.trRoad=d.open;},true);
{const st=document.createElement('style');st.textContent=`.tr-rw{display:block;font-size:10.5px;font-weight:700;color:#ffd27a;margin-top:3px}.tr-box{padding:10px 12px;margin-bottom:10px;border-radius:12px;background:linear-gradient(160deg,rgba(242,197,90,.14),rgba(242,197,90,.04));border:1px solid rgba(242,197,90,.3)}.tr-box>b{font-size:14.5px;color:#f6e3b4}.tr-box p{margin:6px 0;font-size:13px;line-height:1.5}.tr-box details{margin-top:6px;font-size:12.5px}.tr-box summary{cursor:pointer;color:#f2c55a}
.tr-road summary{cursor:pointer;list-style:none;display:block}.tr-road summary::-webkit-details-marker{display:none}.tr-road[open] summary{margin-bottom:8px}.tr-rd{display:flex;align-items:center;gap:8px;padding:6px 2px;border-top:1px solid rgba(255,255,255,.06)}.tr-rd>i{flex:none;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.08);font-style:normal;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center}.tr-rd>div{flex:1;min-width:0;display:flex;flex-direction:column}.tr-rd.done{opacity:.6}.tr-rd.done>i{background:#5a9a4a;color:#fff}.tr-rd.can>i{background:#f2c55a;color:#2a1608}.tr-st{flex:none;font-size:11.5px;max-width:42%;text-align:right;color:#cbb994}.tr-rd.done .tr-st{color:#8ce07a}`;document.head.appendChild(st);}
