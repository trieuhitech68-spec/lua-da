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
/* ===================== TỰ LÀM RUỘNG LÚA · TỰ LUYỆN TAY NGHỀ =====================
   - Tìm lúa hoang ven đầm lấy thóc giống (quét các ô quanh mình tới ~3 km), dẫn / tát nước vào ruộng, gieo mạ, nhổ mạ cấy, làm cỏ, gặt.
     Lúc chờ mạ / lúa lớn thì đi làm mục khác, vài phút sau quay lại xem ruộng.
   - Món nào cần tay nghề cao hơn hiện có (Chế tác, Xây dựng): tự luyện cho đủ cấp (bện dây thừng để lên Chế tác, lát thêm sàn để lên Xây dựng) rồi mới làm. */
AQ.skipW={};
{const _na=aqNextAuto;aqNextAuto=function(){const keep=[];for(const k in AQ.skipW){if(AQ.skipW[k]>G.t&&!AQ.skip.has(+k)){AQ.skip.add(+k);keep.push(+k);}}try{return _na.apply(this,arguments);}finally{for(const k of keep)AQ.skip.delete(k);}};}
function aqNodeFind(kind,maxC){const ci=Math.floor(P.x/H3CELL),cj=Math.floor(P.z/H3CELL);let best=null,bd=1e9;for(let r=0;r<=maxC;r++){for(let i=-r;i<=r;i++)for(let j=-r;j<=r;j++){if(Math.max(Math.abs(i),Math.abs(j))!==r)continue;let L;try{L=h3cellNodes(ci+i,cj+j);}catch(e){continue;}
      for(const n of L){if(n.kind!==kind||!h3nodeLive(n)||(AQ.nbl&&AQ.nbl[n.id]>G.t))continue;const d=aqD(n.x,n.z);if(d<bd){bd=d;best=n;}}}if(best&&bd<(r+0.5)*H3CELL)break;}return best;}
AUJ.node=function(j){if(j.until&&j.until())return AQ_DONE;if(j.cf){j.cf=null;if(j.n){(AQ.nbl||(AQ.nbl={}))[j.n.id]=G.t+300;j.n=null;}if(++j.miss>5)return aqFail('Không tới được chỗ có '+(H3NODE[j.kind]||{n:'thứ đó'}).n.toLowerCase()+'.');}
  if(j.st==='wait'){if(G.work)return AQ_RUN;j.st=null;if(j.n){(AQ.nbl||(AQ.nbl={}))[j.n.id]=G.t+200;j.n=null;}return AQ_RUN;}
  if(!j.n){j.n=aqNodeFind(j.kind,10);if(!j.n)return aqFail('Không thấy '+(H3NODE[j.kind]||{n:'thứ đó'}).n.toLowerCase()+' trong vòng 3 km.');}
  const n=j.n;j.lab='Tới '+H3NODE[j.kind].n.toLowerCase();if(aqD(n.x,n.z)>REACH+6)return aqGoto(j,n.x,n.z,REACH,j.lab,{far:1});const ng=needGate(false);if(ng)return AQ_RUN;aqFace(n.x,n.z);h3nodeStart(n);if(!G.work){(AQ.nbl||(AQ.nbl={}))[n.id]=G.t+200;j.n=null;if(++j.miss>5)return aqFail('Không hái được.');return AQ_RUN;}j.st='wait';return AQ_RUN;};
AUJ.rice=function(j){if(j.until&&j.until())return AQ_DONE;if(j.cf){const m=j.cf;j.cf=null;if(++j.miss>3)return aqFail(m);}if(j.st==='wait'){if(G.work)return AQ_RUN;j.st=null;}
  let b=null,bd=1e9;for(const x of S.builds)if(x.k==='paddy'&&x.prog==null){const d=aqD(x.x,x.z);if(d<bd){bd=d;b=x;}}if(!b)return aqFail('Chưa có ruộng lúa nước.');
  const F=l4Pad(b),src=l4PadSrc(b);j.lab='Làm ruộng lúa';
  if((F.st===0||F.st===3)&&F.w<0.3&&!src&&invCount('waterDirty')+invCount('water')<1){if(++j.g>6)return aqFail('Không lấy được nước tát ruộng.');aqPush({k:'get',id:'waterDirty',n:1,tries:0},j);return AQ_RUN;}
  if(F.st===0&&F.w>=0.3&&invCount('seedRice')<2){if(++j.g>6)return aqFail('Không kiếm được thóc giống.');aqPush({k:'node',kind:'wildrice',until:()=>invCount('seedRice')>=2},j);return AQ_RUN;}
  const growing=F.st===1||(F.st===3&&F.w>=0.3&&F.weed<=0.45);
  if(growing){const gi=AQ.gi;if(gi>=0){AQ.skipW[gi]=G.t+150;const ni=aqNextAuto();if(ni>=0&&ni!==gi){aqJump(ni,(F.st===1?'Mạ':'Lúa')+' đang lớn, lát quay lại.');return AQ_RUN;}}return {wait:(F.st===1?'Chờ mạ lên':'Chờ lúa chín')+' ('+Math.round(F.p*100)+'%)'};}
  if(aqD(b.x,b.z)>REACH+34)return aqGoto(j,b.x,b.z,REACH+22,'Ra ruộng lúa',{far:1});aqFace(b.x,b.z);l4PadUse(b);if(!G.work){if(++j.fl>4)return aqFail('Không làm được việc ở ruộng lúa.');return AQ_RUN;}j.st='wait';return AQ_RUN;};
{const _i=aqInit;aqInit=function(j){_i(j);if((j.k==='rice'||j.k==='node'||j.k==='train')&&j.g==null)j.g=0;};}
{const paddyOk=()=>S.builds.some(b=>b.k==='paddy'&&b.prog==null);
  AUG['Gieo mạ rồi cấy lúa']=()=>paddyOk()?{k:'rice',until:()=>gC('cnt:sowRice')>0&&gC('cnt:transplant')>0}:{guide:'@farm'};
  AUG['Gặt mùa lúa đầu tiên']=()=>paddyOk()?{k:'rice',until:()=>gC('cnt:riceHarvest')>0}:{guide:'@farm'};
  const _h=AUG['Thu hoạch 6 lần'];AUG['Thu hoạch 6 lần']=function(){const r=_h();if(r&&r.guide&&paddyOk()){const c=gC('cnt:harvest');return {k:'rice',until:()=>gC('cnt:harvest')>c};}return r;};
  delete AQ_GUIDEONLY['Gieo mạ rồi cấy lúa'];delete AQ_GUIDEONLY['Gặt mùa lúa đầu tiên'];
  const _p=AUG['Đắp ruộng lúa nước'];AUG['Đắp ruộng lúa nước']=function(){if(!S.known['b:paddy']&&!S.builds.some(b=>b.k==='paddy')){try{unlockCheck();}catch(e){}if(!S.known['b:paddy'])return {k:'node',kind:'wildrice',until:()=>{try{unlockCheck();}catch(e){}return !!S.known['b:paddy'];}};}return _p();};}
// ----- luyện tay nghề -----
AUJ.train=function(j){if(skLv(j.sk)>=j.lv)return AQ_DONE;if(j.cf){const m=j.cf;j.cf=null;if(++j.miss>3)return aqFail(m);}if(++j.g>90)return aqFail('Luyện mãi chưa đủ '+lvText({[j.sk]:j.lv})+'.');j.lab='Luyện tay nghề: '+SKILL[j.sk]+' cấp '+skLv(j.sk)+' → '+j.lv;
  if(j.sk==='craft'){const r=RECIPES.find(x=>x.id==='rope');const c0=gC('craft:rope');aqPush({k:'craft',r,until:()=>gC('craft:rope')>c0,lab:j.lab},j);return AQ_RUN;}
  if(j.sk==='build'){const s=S.builds.find(b=>b.prog!=null);aqPush(s?{k:'site',b:s}:{k:'place',piece:'floor'},j);return AQ_RUN;}
  return aqFail('Cần '+lvText({[j.sk]:j.lv})+'.');};
function aqTrainFor(lv,j){if(!lv)return false;for(const k in lv){if(skLv(k)<lv[k]){if(k!=='craft'&&k!=='build')return false;if((j._tr=(j._tr||0)+1)>3)return false;aqSay('🤖 Chưa đủ '+lvText({[k]:lv[k]})+': luyện tay nghề trước.','');aqPush({k:'train',sk:k,lv:lv[k]},j);return true;}}return false;}
{const _p=AUJ.place;AUJ.place=function(j){try{const d=pieceDef(j.piece);if(d&&d.lv&&!lvOk(d.lv)&&!j.cf&&aqTrainFor(d.lv,j))return AQ_RUN;}catch(e){}return _p.apply(this,arguments);};
  const _c=AUJ.craft;AUJ.craft=function(j){try{const r=j.r;if(r&&r.lv&&!lvOk(r.lv)&&!j.cf&&j.st!=='wait'&&aqTrainFor(r.lv,j))return AQ_RUN;}catch(e){}return _c.apply(this,arguments);};}
