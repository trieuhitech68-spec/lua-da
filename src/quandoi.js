/* ===================== THỔ DÂN & QUÂN ĐỘI TRONG CHUỖI CHÍNH (có Tự làm) =====================
   Ba mục nối vào cuối chuỗi chính:
     Bắt sống một thổ dân      : lo dây thừng, chỗ ngủ trống, giáo; tìm chiến binh bộ lạc (cấp thấp, gần nhất), đánh gục → tự trói bắt. Máu dưới 45 thì rút về nghỉ.
     Thu phục một tù binh      : chất thức ăn vào giỏ / rương để tù binh ăn đủ mỗi ngày; trung thành đủ 100 là quy phục (trong lúc chờ làm việc khác).
     Cắt người giữ cổng và lính: giao một người giữ cổng, một người làm lính theo mình (thiếu người thì đi bắt thêm). */
{const add=g=>{if(!GOALS.some(x=>x.t===g.t))GOALS.push(g);};
  add(G_(4,'Bắt sống một thổ dân','Mang Dây thừng, để sẵn một chỗ ngủ trống ở nhà, rồi đánh gục một chiến binh bộ lạc: sẽ trói bắt thay vì giết. Chọn chiến binh cấp thấp, mang giáo và băng lá.',1,()=>gC('cnt:capture')));
  add(G_(4,'Thu phục một tù binh','Để thức ăn trong giỏ, rương cạnh nhà: mỗi ngày ăn đủ thì trung thành +12. Đủ 100 là quy phục hẳn. Bỏ đói thì trốn mất.',1,()=>gC('cnt:submit')));
  add(G_(4,'Cắt người giữ cổng và lính','Mở 👥 Dân làng, giao một người "Giữ cổng" và một người "Lính theo bạn". Lính đi cùng đánh thú dữ, chiến binh, chiếm điểm tài nguyên.',2,()=>Math.min(1,(S.folk||[]).filter(f=>f.job==='gate').length)+Math.min(1,(S.folk||[]).filter(f=>f.job==='soldier').length)));
  AUG['Bắt sống một thổ dân']=()=>({k:'capture'});AUG['Thu phục một tù binh']=()=>({k:'feedfolk'});AUG['Cắt người giữ cổng và lính']=()=>({k:'assign'});}
// đang đi bắt thổ dân thì không coi chiến binh là thứ phải chạy
{const _ap=aqPred;aqPred=function(){const L=_ap.apply(this,arguments);try{if(AQ.jobs.some(j=>j.k==='capture'))return L.filter(p=>!(G.foes&&G.foes.includes(p.a)));}catch(e){}return L;};}
AUJ.capture=function(j){const c=gC('cnt:capture');if(j.c0==null)j.c0=c;if(c>j.c0)return AQ_DONE;if(j.cf){j.cf=null;if(j.a){j.sk.add(j.a);j.a=null;}if(++j.miss>5)return aqFail('Không tiếp cận được chiến binh nào.');}j.sk=j.sk||new Set();
  if(S.p.hp<45){if(++j.hl>4)return aqFail('Bị thương nặng quá: nghỉ cho lại sức rồi hãy đi bắt.');aqPush({k:'heal'},j);return AQ_RUN;}
  if(invCount('rope')<1){if(++j.g>6)return aqFail('Không làm được dây thừng.');aqPush({k:'get',id:'rope',n:2,tries:0},j);return AQ_RUN;}
  if(!freeBed()){if(++j.g>6)return aqFail('Không lo được chỗ ngủ trống.');const s=S.builds.find(b=>b.prog!=null&&pieceDef(b.k)&&pieceDef(b.k).bed);j.lab='Lo chỗ ngủ cho tù binh';aqPush(s?{k:'site',b:s}:{k:'place',piece:'hammock'},j);return AQ_RUN;}
  if(!hasTool('spear')&&!hasTool('club')){if(++j.g>6)return aqFail('Không có vũ khí.');aqPush({k:'get',id:'spear',n:1,tries:0},j);return AQ_RUN;}
  /* an toàn: chỉ tự đánh chiến binh ĐI LẺ (không có đồng bọn trong 13 m) và không quá mạnh; thấy từ hai tên trở lên áp sát là rút. Chạy thử: lao vào trại 4 chiến binh là chết ngay. */
  {let nearF=0;for(const f of G.foes||[])if(f.alive&&!f.peace&&!(f.lone&&!f.prov&&f!==j.a)&&aqD(f.x,f.z)<230)nearF++;if(nearF>=2){j.a=null;if(++j.rt>2)return aqFail('Chiến binh đi theo toán, quá nguy hiểm để tự đánh. Việc này cần bạn tự chỉ huy: mang lính, mặc giáp, nhử từng tên ra.');aqPush({k:'camp'},j);aqSay('🤖 Đông chiến binh quá: rút về trại.','bad');return AQ_RUN;}}
  if(!j.a||!j.a.alive){let best=null,bs=1e9;const lone=f=>!(G.foes||[]).some(o=>o!==f&&o.alive&&!o.lone&&Math.hypot(o.x-f.x,o.z-f.z)<260),lvMax=Math.max(2,Math.floor(heroLv()/2)+1);for(const f of G.foes||[]){if(!f.alive||j.sk.has(f)||f.peace||(f.lv||1)>lvMax||!lone(f))continue;const d=aqD(f.x,f.z);if(d>5000)continue;const s=d+(f.lv||1)*400-(f.lone?1500:0);if(s<bs){bs=s;best=f;}}
    if(!best&&(G.foes||[]).some(f=>f.alive&&!f.peace&&aqD(f.x,f.z)<5000))return aqFail('Chiến binh quanh đây đều đi theo toán hoặc quá mạnh, tự đánh là mất mạng. Việc này cần bạn tự chỉ huy: mang lính, mặc giáp, nhử từng tên ra.');
    if(!best){if(G.camp&&aqD(G.camp.x,G.camp.z)>500&&!j.cg){j.cg=1;return aqGoto(j,G.camp.x,G.camp.z,380,'Tới trại chiến binh Núi Đá',{far:1});}return aqFail('Không thấy chiến binh bộ lạc nào trong vòng 250 m.');}j.a=best;}
  const a=j.a,d=aqD(a.x,a.z)-(a.r||8);j.lab='Đánh gục để trói bắt '+(a.n||'chiến binh').toLowerCase()+(a.lv?' (cấp '+a.lv+')':'');if(d>REACH+4){if(d>220)return aqGoto(j,a.x,a.z,160,j.lab,{far:1});AQ.dir=aqSafeDir(a.x-P.x,a.z-P.z)||[a.x-P.x,a.z-P.z];AQ.run=S.p.stam>20;return AQ_RUN;}
  if(G.act)return AQ_RUN;try{if(hasTool('spear'))selectTool('spear');}catch(e){}aqFace(a.x,a.z);actStart({type:'foe',a,d});return AQ_RUN;};
AUJ.feedfolk=function(j){const c=gC('cnt:submit');if(j.c0==null)j.c0=c;if(c>j.c0)return AQ_DONE;if(j.cf){const m=j.cf;j.cf=null;if(++j.miss>3)return aqFail(m);}
  if(!(S.folk||[]).some(f=>f.cap)){if(++j.g>3)return aqFail('Chưa có tù binh nào để thu phục.');aqPush({k:'capture'},j);return AQ_RUN;}
  const isF=s=>s&&ITEMS[s.id]&&ITEMS[s.id].t==='food'&&!ITEMS[s.id].poison&&s.id!=='meatRot';let inStore=0;for(const b of S.builds){const st=S.store[b.id];if(st&&b.prog==null)for(const s of st)if(isF(s))inStore+=s.n;}
  if(inStore<6){const have=S.inv.filter(isF).reduce((a,s)=>a+s.n,0);if(have<8){if(++j.g>6)return aqFail('Không kiếm đủ thức ăn cho tù binh.');aqPush({k:'get',id:'berry',n:haveCount('berry')+10,tries:0},j);return AQ_RUN;}
    const b=khoNear(1e9);if(!b){if(++j.g>6)return aqFail('Chưa có giỏ, rương để chất thức ăn.');aqPush({k:'place',piece:'basket'},j);return AQ_RUN;}if(aqD(b.x,b.z)>70)return aqGoto(j,b.x,b.z,50,'Chất thức ăn vào kho cho tù binh',{far:1});
    const st=S.store[b.id];let keep=4,n=0;for(let i=0;i<S.inv.length;i++){const s=S.inv[i];if(!isF(s))continue;let mv=s.n;if(keep>0){const k=Math.min(keep,mv);keep-=k;mv-=k;}if(mv<=0)continue;const left=slotsAdd(st,s.id,mv);n+=mv-left;s.n-=mv-left;if(s.n<=0)S.inv[i]=null;}
    if(n)uiToast(`🤖 Đã chất ${n} phần thức ăn vào ${pieceDef(b.k).n} cho tù binh.`,'good');uiHotbar();save();if(!n&&++j.fl>2)return aqFail('Kho đầy, không chất thêm thức ăn được.');return AQ_RUN;}
  const cp=(S.folk||[]).find(f=>f.cap);j.lab='Chờ '+cp.n+' quy phục ('+Math.round(cp.loy||0)+'/100)';const gi=AQ.gi;if(gi>=0){AQ.skipW[gi]=G.t+200;const ni=aqNextAuto();if(ni>=0&&ni!==gi){aqJump(ni,'Tù binh đang được nuôi, trung thành '+Math.round(cp.loy||0)+'/100.');return AQ_RUN;}}return {wait:j.lab};};
AUJ.assign=function(j){const L=(S.folk||[]).filter(f=>!f.kid);const hasG=L.some(f=>f.job==='gate'),hasS=L.some(f=>f.job==='soldier');if(hasG&&hasS)return AQ_DONE;if(j.cf){const m=j.cf;j.cf=null;if(++j.miss>3)return aqFail(m);}
  const free=L.filter(f=>f.job!=='gate'&&f.job!=='soldier');if(!free.length){if(++j.g>3)return aqFail('Cần thêm người: mời dân làng về hoặc bắt thêm thổ dân.');aqPush({k:'capture'},j);return AQ_RUN;}
  free.sort((a,b)=>(danSp(b)==='guard')-(danSp(a)==='guard')||danLv(b)-danLv(a));const f=free[0];f.job=!hasS?'soldier':'gate';uiToast(`🤖 Giao ${f.n} ${f.job==='soldier'?'làm lính theo bạn':'giữ cổng'}.`,'good');save();return AQ_RUN;};
{const _i=aqInit;aqInit=function(j){_i(j);if((j.k==='capture'||j.k==='feedfolk'||j.k==='assign')&&j.g==null){j.g=0;j.hl=0;j.rt=0;}};}
