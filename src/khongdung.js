/* ===================== TỰ LÀM KHÔNG DỪNG GIỮA CHỪNG =====================
   Trước: tới một mục phải tự tay (ruộng lúa, cấy, gặt, hội làng, mời người…) hoặc một mục thử 3 lần vẫn hỏng là "Tự làm" dừng hẳn.
   Giờ: gặp mục như vậy thì tạm gác, làm TRƯỚC mục tự làm được kế sau (kho thóc, cột vật tổ, tìm quặng, lò luyện…). Tiến độ vẫn được tính, tới lượt là xong ngay.
   Chỉ khi không còn mục nào tự làm được mới dừng và mở thẻ chỉ dẫn từng bước cho mục đang chờ.
   Lúa hoang và các điểm hái lượm theo mùa giờ có quanh năm (mùa theo lịch thật dài 3 tháng: mùa đông, mùa xuân không có thóc giống là kẹt cả chương làm ruộng). */
try{for(const k in H3NODE)if(H3NODE[k]&&H3NODE[k].seas){H3NODE[k].seas0=H3NODE[k].seas;delete H3NODE[k].seas;}}catch(e){}
AQ.skip=new Set();
function aqNextAuto(){for(let i=S.goal;i<GOALS.length;i++){if(AQ.skip.has(i))continue;const g=GOALS[i];try{const [v,n]=goalProg(g);if(v>=n)continue;if(aqKind(i)!=='auto')continue;const pl=aqSpec(i).plan();if(!pl||pl.guide||pl.fail)continue;return i;}catch(e){}}return -1;}
function aqJump(ni,why){AQ.jobs=[];AQ.path=null;AQ.dir=null;AQ.rt=0;AQ.gi=ni;AQ.on=true;AQ.pause=false;if(G.work)try{workStop('');}catch(e){}G.act=null;uiToast(`🤖 ${why} Làm trước: ${GOALS[ni].t}.`,'');aqPush({k:'goal',gi:ni,stall:0},null);aqUi(true);}
aqFinishRoot=function(root){AQ.rt=0;const af=AQ.after;AQ.after=null;if(af&&root&&root.k!=='goal'){AQ.jobs=[];AQ.on=false;AQ.path=null;uiToast('🤖 Đã gom đủ vật liệu. Giờ chọn chỗ và dựng nhé!','good');aqUi(true);setTimeout(()=>aqGuide(af.gi,af.piece),300);return;}
  const done=root&&root.k==='goal'?GOALS[root.gi]:null;AQ.jobs=[];AQ.path=null;if(done)uiToast('🤖 Tự làm xong: '+done.t,'good');else if(root&&root.k!=='goal')uiToast('🤖 Xong: '+(root.lab||'việc')+'.','good');
  if(root&&root.k==='goal'&&aqCfg().next&&S.goal<GOALS.length){const ni=aqNextAuto();if(ni>=0){if(ni!==S.goal)uiToast(`🤖 "${GOALS[S.goal].t}" cần bạn tự tay (bấm Chỉ dẫn để xem từng bước). Làm trước: ${GOALS[ni].t}.`,'');AQ.gi=ni;aqPush({k:'goal',gi:ni,stall:0},null);aqUi(true);return;}
    AQ.on=false;aqUi(true);const gi=S.goal;if(aqKind(gi)==='guide'||(aqSpec(gi)&&(()=>{try{const p=aqSpec(gi).plan();return p&&p.guide;}catch(e){return false;}})()))setTimeout(()=>aqGuideStart(gi),400);else uiToast('Mục tiếp theo cần bạn tự làm: '+GOALS[gi].t,'');return;}
  AQ.on=false;aqUi(true);};
// bấm Tự làm ở mục phải tự tay: làm trước mục khác thay vì chỉ hiện thẻ
{const _st=aqStart;aqStart=function(gi,o){if(!(o&&o.job)){AQ.skip.clear();try{if(S&&G.on&&GOALS[gi]&&gi===S.goal){let man=aqKind(gi)!=='auto';if(!man){const pl=aqSpec(gi).plan();man=!!(pl&&pl.guide);}if(man){const ni=aqNextAuto();if(ni>=0){_st.call(this,ni,o);if(AQ.on)uiToast(`🤖 "${GOALS[gi].t}" cần bạn tự tay (bấm Chỉ dẫn để xem từng bước). Làm trước: ${GOALS[ni].t}.`,'');return;}}}}catch(e){}}return _st.apply(this,arguments);};}
// thử 3 lần vẫn hỏng: gác mục đó, làm mục khác
{const _sp=aqStop;aqStop=function(msg,kind){try{if(msg&&/^🤖 Dừng tự làm/.test(msg)&&AQ.on&&AQ.gi>=0&&GOALS[AQ.gi]&&!/Túi đầy/.test(msg)&&(AQ.rt||0)>=3){AQ.skip.add(AQ.gi);const ni=aqNextAuto();if(ni>=0){aqJump(ni,`Tạm gác "${GOALS[AQ.gi].t}" (${msg.replace(/^🤖 Dừng tự làm: /,'').slice(0,70)}).`);return;}}}catch(e){}return _sp.apply(this,arguments);};}
// đang làm mà mục đó chuyển thành "phải tự tay" (ví dụ chưa có luống chín): nhảy sang mục khác thay vì dừng
{const _g=AUJ.goal;AUJ.goal=function(j){try{const g=GOALS[j.gi];if(g&&!j.cf){const [v,n]=goalProg(g);if(v<n){const sp=aqSpec(j.gi),pl=sp&&sp.plan();if(pl&&pl.guide&&pl.guide[0]==='@'){AQ.skip.add(j.gi);const ni=aqNextAuto();if(ni>=0){aqJump(ni,`"${g.t}" cần bạn tự tay.`);return AQ_RUN;}}}}}catch(e){}return _g.apply(this,arguments);};}
// ruộng lúa: tự đặt (ưu tiên sát nước)
{AUG['Đắp ruộng lúa nước']=()=>{const b=S.builds.find(b=>b.prog!=null&&b.k==='paddy');if(b)return {k:'site',b};const d=pieceDef('paddy');if(!d||(d.age&&(S.age||0)<d.age)||!S.known['b:paddy'])return {guide:'@farm'};return {k:'place',piece:'paddy'};};AQ_CREATIVE.delete('Đắp ruộng lúa nước');
  const _sp=aq2Spots;aq2Spots=function(def){const out=_sp.apply(this,arguments);try{if(def.id==='paddy'){for(const s of out)if(nearWater(s.x,s.z,110))s.s-=2000;out.sort((a,b)=>a.s-b.s);}}catch(e){}return out;};}
/* ---------- khát: uống bầu nước trong túi, tìm nước xa hơn, không để cạn nước tới chết ----------
   Chạy thử: đi săn xa suối, "không thấy suối gần đây" nên không uống, trong túi có bầu nước mà không dùng, cạn nước rồi mất máu. */
{const _d=AUJ.drink;AUJ.drink=function(j){try{if(!j.fill&&!j.goal&&S.p.water<70){const id=invCount('water')>0?'water':invCount('waterDirty')>0&&S.p.water<25?'waterDirty':null;if(id){eat(id);return AQ_DONE;}}}catch(e){}
    const r=_d.apply(this,arguments);try{if(r&&r.fail&&/Không thấy suối/.test(r.fail)&&!j.farW){/* quét rộng tới 6000 quanh mình */j.farW=1;let best=null,bd=1e9;for(let rr=200;rr<=6000&&!best;rr+=120){const n=Math.ceil(rr*6.283/140);for(let k=0;k<n;k++){const a=k/n*6.283,x=P.x+Math.cos(a)*rr,z=P.z+Math.sin(a)*rr,wd=wdAt(x,z);if(wd>0.5&&wd<7&&wIn(x,z,1)){best=[x,z];break;}}}
        if(best){AQ.wC=null;aqPush({k:'goto',x:best[0],z:best[1],r:160,far:1,lab:'Đi tìm nước uống'},j);return AQ_RUN;}}}catch(e){}return r;};}
// máu thấp: không dừng hẳn. Ăn uống, về chỗ ngủ / bếp nghỉ cho hồi rồi làm tiếp.
AUJ.heal=function(j){const p=S.p;if(j.T0==null)j.T0=G.t;if(p.hp>=45||G.t-j.T0>400)return AQ_DONE;if(j.cf)j.cf=null;if(p.water<40&&!j.dr){j.dr=1;aqPush({k:'drink',urgent:1,tries:0},j);return AQ_RUN;}if(p.food<45&&aqFood(true)&&!j.et){j.et=1;aqPush({k:'eat',urgent:1,tries:0},j);return AQ_RUN;}
  if(S.st.bleed&&invCount('bandage')>0&&!j.tr){j.tr=1;aqPush({k:'treat',urgent:1},j);return AQ_RUN;}const hb=aqBed()||aqFire();if(hb&&j.w==null&&aqD(hb.x,hb.z)>70&&aqD(hb.x,hb.z)<4000)return aqGoto(j,hb.x,hb.z,50,'Về trại nghỉ cho lại sức',{far:1});
  if(j.w==null)j.w=G.t;j.lab='Nghỉ cho hồi máu ('+Math.round(p.hp)+'/45)';if(!G.sit&&!G.work)try{sitToggle(true);}catch(e){}j.dr=p.water<25?0:j.dr;j.et=p.food<25?0:j.et;return AQ_RUN;};
{const _sp=aqStop;aqStop=function(msg,kind){try{if(msg&&/Máu thấp quá/.test(msg)&&AQ.on&&AQ.jobs.length&&!AQ.jobs.some(j=>j.k==='heal')){aqPush({k:'heal',urgent:1},AQ.jobs[AQ.jobs.length-1]);aqSay('🤖 Máu thấp: ăn uống, nghỉ cho hồi rồi làm tiếp.','bad');return;}if(msg&&/Máu thấp quá/.test(msg)&&AQ.jobs.some(j=>j.k==='heal'))return;}catch(e){}return _sp.apply(this,arguments);};}
