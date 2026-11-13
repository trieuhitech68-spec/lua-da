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
  if(root&&root.k==='goal'&&aqCfg().next&&S.goal<GOALS.length){const ni=aqNextAuto();if(ni>=0){/* việc vừa xong thì thử lại các mục đã gác tạm */try{for(const k in AQ.skipW)if(AQ.skipW[k]<=G.t){AQ.skip.delete(+k);delete AQ.skipW[k];}}catch(e){}const ni2=aqNextAuto();if(ni2>=0&&ni2!==ni){AQ.gi=ni2;aqPush({k:'goal',gi:ni2,stall:0},null);aqUi(true);return;}if(ni!==S.goal&&!(AQ.skipW[S.goal]>G.t))uiToast(`🤖 "${GOALS[S.goal].t}" cần bạn tự tay (bấm Chỉ dẫn để xem từng bước). Làm trước: ${GOALS[ni].t}.`,'');AQ.gi=ni;aqPush({k:'goal',gi:ni,stall:0},null);aqUi(true);return;}
    AQ.on=false;aqUi(true);const gi=S.goal;if(aqKind(gi)==='guide'||(aqSpec(gi)&&(()=>{try{const p=aqSpec(gi).plan();return p&&p.guide;}catch(e){return false;}})()))setTimeout(()=>aqGuideStart(gi),400);else uiToast('Mục tiếp theo cần bạn tự làm: '+GOALS[gi].t,'');return;}
  AQ.on=false;aqUi(true);};
// bấm Tự làm ở mục phải tự tay: làm trước mục khác thay vì chỉ hiện thẻ
{const _st=aqStart;aqStart=function(gi,o){if(!(o&&o.job)){AQ.skip.clear();try{if(S&&G.on&&GOALS[gi]&&gi===S.goal){let man=aqKind(gi)!=='auto';if(!man){const pl=aqSpec(gi).plan();man=!!(pl&&pl.guide);}if(man){const ni=aqNextAuto();if(ni>=0){_st.call(this,ni,o);if(AQ.on)uiToast(`🤖 "${GOALS[gi].t}" cần bạn tự tay (bấm Chỉ dẫn để xem từng bước). Làm trước: ${GOALS[ni].t}.`,'');return;}}}}catch(e){}}return _st.apply(this,arguments);};}
// thử 3 lần vẫn hỏng: gác mục đó, làm mục khác
{const _sp=aqStop;aqStop=function(msg,kind){try{if(msg&&/^🤖 Dừng tự làm/.test(msg)&&AQ.on&&AQ.gi>=0&&GOALS[AQ.gi]&&!/Túi đầy/.test(msg)&&(AQ.rt||0)>=3){/* gác tạm 4 phút rồi thử lại, không bỏ hẳn */AQ.skipW[AQ.gi]=G.t+240;AQ.skip.add(AQ.gi);const ni=aqNextAuto();if(ni>=0){aqJump(ni,`Tạm gác "${GOALS[AQ.gi].t}" (${msg.replace(/^🤖 Dừng tự làm: /,'').slice(0,70)}).`);return;}}}catch(e){}return _sp.apply(this,arguments);};}
// đang làm mà mục đó chuyển thành "phải tự tay" (ví dụ chưa có luống chín): nhảy sang mục khác thay vì dừng
{const _g=AUJ.goal;AUJ.goal=function(j){try{const g=GOALS[j.gi];if(g&&!j.cf){const [v,n]=goalProg(g);if(v<n){const sp=aqSpec(j.gi),pl=sp&&sp.plan();if(pl&&pl.guide&&pl.guide[0]==='@'){AQ.skip.add(j.gi);const ni=aqNextAuto();if(ni>=0){aqJump(ni,`"${g.t}" cần bạn tự tay.`);return AQ_RUN;}}}}}catch(e){}return _g.apply(this,arguments);};}
// ruộng lúa: tự đặt (ưu tiên sát nước)
{AUG['Đắp ruộng lúa nước']=()=>{const b=S.builds.find(b=>b.prog!=null&&b.k==='paddy');if(b)return {k:'site',b};const d=pieceDef('paddy');if(!d||(d.age&&(S.age||0)<d.age)||!S.known['b:paddy'])return {guide:'@farm'};return {k:'place',piece:'paddy'};};AQ_CREATIVE.delete('Đắp ruộng lúa nước');
  const _sp=aq2Spots;aq2Spots=function(def){let out=_sp.apply(this,arguments);try{if(def.id==='paddy'){for(const s of out)if(nearWater(s.x,s.z,110))s.s-=2000;
      /* quanh trại không có chỗ nào sát nước: tìm bãi bằng ngay cạnh nguồn nước gần nhất (ruộng xa nước phải tát bằng bầu, Tự làm hay kẹt ở đó) */
      if(!out.some(s=>nearWater(s.x,s.z,110))){const w=aqFindWater();if(w){const ex=[];for(let r=70;r<=260;r+=30)for(let a=0;a<14;a++){const x=w.sx+Math.cos(a/14*6.283)*r,z=w.sz+Math.sin(a/14*6.283)*r;if(!nearWater(x,z,105))continue;let ok=true;for(const [u,v] of [[-0.5,-0.5],[0.5,-0.5],[-0.5,0.5],[0.5,0.5]])if(!aq2Free(x+u*CELL,z+v*CELL,CELL*0.55)){ok=false;break;}if(ok)ex.push({x,z,s:-3000+r});}out=ex.concat(out);}}
      out.sort((a,b)=>a.s-b.s);out=out.slice(0,16);}}catch(e){}return out;};}
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
/* ===================== TỰ MỞ HỘI LÀNG · TỰ MỜI NGƯỜI VỀ Ở ===================== */
// Hội làng: dựng Đài trống hội (tự luyện Xây dựng nếu thiếu cấp) rồi đánh trống mở hội.
AUJ.fest=function(j){const c=gC('cnt:festival')+gC('cnt:hoi');if(j.c0==null)j.c0=c;if(c>j.c0)return AQ_DONE;if(j.cf)return aqFail(j.cf);const b=j.b;if(!BYID.has(b.id))return aqFail('Đài trống không còn.');j.lab='Đánh trống mở hội';
  if(aqD(b.x,b.z)>70)return aqGoto(j,b.x,b.z,56,j.lab);if(++j.fl>3)return aqFail('Hôm nay đã mở hội rồi: mai đánh trống tiếp.');try{b3Festival(b);}catch(e){return aqFail('Không mở hội được.');}return AQ_RUN;};
AUG['Mở hội làng']=()=>{const b=S.builds.find(b=>b.k==='drumStage'&&b.prog==null);if(b)return {k:'fest',b};const s=S.builds.find(b=>b.k==='drumStage'&&b.prog!=null);return s?{k:'site',b:s}:{k:'place',piece:'drumStage'};};delete AQ_GUIDEONLY['Mở hội làng'];
// Mời người: lo một chỗ ngủ trống, tặng quà / đổi đồ cho đủ thân (40), rồi mời.
AUJ.folk=function(j){const c=gC('cnt:folk');if(j.c0==null)j.c0=c;if(c>j.c0)return AQ_DONE;if(j.cf){const m=j.cf;j.cf=null;if(++j.miss>4)return aqFail(m);}
  if(!freeBed()){if(++j.g>4)return aqFail('Không lo được chỗ ngủ trống cho người mới.');const s=S.builds.find(b=>b.prog!=null&&pieceDef(b.k)&&pieceDef(b.k).bed);j.lab='Lo chỗ ngủ cho người mới';aqPush(s?{k:'site',b:s}:{k:'place',piece:'hammock'},j);return AQ_RUN;}
  const L=(G.npcs||[]).filter(n=>n.o&&n.o.visible);if(!L.length){if(G.vfire&&aqD(G.vfire.x,G.vfire.z)>160)return aqGoto(j,G.vfire.x,G.vfire.z,120,'Tới làng bên',{far:1});return aqFail('Làng bên không còn ai để mời.');}
  let n=null,bd=1e9;for(const x of L){const d=aqD(x.x,x.z);if(d<bd){bd=d;n=x;}}j.lab='Làm thân với '+n.def.n;if(bd>REACH+6)return aqGoto(j,n.x,n.z,REACH,j.lab,{far:1});G.npcCur=n;
  if((S.rep||0)<40){const V={honey:6,meatCooked:4,hide:4,meat:3,fishCooked:3,fish:2,pot:5};let bi=-1,bv=0;S.inv.forEach((s,i)=>{if(s&&V[s.id]>bv&&(s.id!=='meatCooked'||s.n>3)){bv=V[s.id];bi=i;}});
    if(bi>=0){const s0=S.sel;S.sel=bi;try{npcAction('gift');}finally{S.sel=s0;}return AQ_RUN;}if(++j.tr>14)return aqFail('Chưa đủ thân với làng (cần 40): tặng thịt nướng, da, mật ong.');aqPush({k:'trade'},j);return AQ_RUN;}
  j.lab='Mời '+n.def.n+' về ở cùng';npcAction('recruit');if(gC('cnt:folk')>j.c0)return AQ_DONE;if(++j.fl>3)return aqFail('Chưa mời được người về.');return AQ_RUN;};
{const _i=aqInit;aqInit=function(j){_i(j);if(j.k==='folk'&&j.tr==null){j.tr=0;j.g=0;}};}
AUG['Mời một người về ở cùng']=()=>({k:'folk'});delete AQ_GUIDEONLY['Mời một người về ở cùng'];
/* ---------- thú không hung thì không chạy; khát mà không tới được suối thì tìm chỗ khác hoặc hứng nước mưa ---------- */
// Chạy thử: đi săn lấy da cho Đài trống, cứ thấy sói, hổ ở xa là "lánh về trại" dù chúng không tấn công (người mới, gần lửa) → không bao giờ săn xong.
{const _ap=aqPred;aqPred=function(){const L=_ap.apply(this,arguments);try{if(typeof stSafe==='function'&&stSafe())return L.filter(p=>p.a&&(p.a.angry||(G.foes&&G.foes.includes(p.a))));}catch(e){}return L;};}
{const _d=AUJ.drink;AUJ.drink=function(j){let r=_d.apply(this,arguments);try{if(r&&r.fail&&!j.fill){j.bw=j.bw||[];if(typeof isRaining==='function'&&isRaining()){S.p.water=Math.min(100,S.p.water+35);aqSay('🤖 Không tới được suối: ngửa mặt hứng nước mưa uống tạm.','');return AQ_DONE;}
        if(j.bw.length<4){const C=AQ.wC&&AQ.wC.w;if(C)j.bw.push([C.wx,C.wz]);AQ.wC=null;let best=null;for(let rr=150;rr<=5000&&!best;rr+=110){const n=Math.ceil(rr*6.283/150);for(let k=0;k<n;k++){const a=k/n*6.283+j.bw.length,x=P.x+Math.cos(a)*rr,z=P.z+Math.sin(a)*rr,wd=wdAt(x,z);if(wd>0.5&&wd<7&&wIn(x,z,1)&&!j.bw.some(b=>Math.hypot(b[0]-x,b[1]-z)<260)){best=[x,z];break;}}}
          if(best){j.bw.push(best);j.cf=null;aqPush({k:'goto',x:best[0],z:best[1],r:150,far:1,lab:'Tìm chỗ uống nước khác'},j);return AQ_RUN;}}}}catch(e){}return r;};}
// không tìm được chỗ đặt công trình / bãi san nền: coi như một lần hỏng (thử lại, rồi gác làm mục khác) thay vì lặng lẽ dừng và hiện thẻ chỉ dẫn
for(const k of ['place','flat']){const _f=AUJ[k];AUJ[k]=function(j){const r=_f.apply(this,arguments);if(r&&r.guide&&r.fail&&AQ.gi>=0)return aqFail(r.fail);return r;};}
/* ---------- BẢO HIỂM: Tự làm tắt mà người chơi không bấm dừng → 6 giây sau tự bật lại (tối đa 6 lần mỗi 10 phút) ---------- */
setInterval(()=>{try{if(typeof S==='undefined'||!S||!G.on||!S.auOn){G._auOff=0;return;}if(AQ.on||AQ.pause||G.sleeping||G.paused||G.build||G.dying||(typeof HD==='object'&&HD.cur)||(typeof H4==='object'&&H4.on)||S.goal>=GOALS.length){G._auOff=0;return;}
    G._auOff=(G._auOff||0)+1;if(G._auOff<6)return;G._auOff=0;G._auRs=(G._auRs||[]).filter(t=>G.t-t<600);if(G._auRs.length>=6)return;if(aqNextAuto()<0)return;G._auRs.push(G.t);aqStart(S.goal);if(AQ.on)uiToast('🤖 Tự làm bật lại (bấm ✋ để dừng hẳn).','');}catch(e){}},1000);
/* ---------- THOÁT KẸT: kẹt ở cùng một chỗ lần thứ 2 thì lùi về chỗ đã đi được trước đó, đánh dấu chỗ kẹt để vòng tránh ----------
   Chạy thử: nhân vật lọt vào một hốc địa hình xa nhà, báo "Bị kẹt" 15 lần liền tại đúng một điểm, máu tụt dần. */
const TK={c:[],s:[]};
setInterval(()=>{try{if(!S||!G.on||!AQ.on||P.air||G.swim||G.climb||G.sleeping)return;if((P.speed||0)<30)return;const l=TK.c[TK.c.length-1];if(l&&Math.hypot(l[0]-P.x,l[1]-P.z)<120)return;TK.c.push([P.x,P.z,G.t]);if(TK.c.length>40)TK.c.shift();}catch(e){}},4000);
{const _g=AUJ.goto;AUJ.goto=function(j){const r=_g.apply(this,arguments);try{if(r&&r.fail&&/^Bị kẹt/.test(r.fail)){try{let nb='',nd=1e9;for(const b of S.builds){const d=Math.hypot(b.x-P.x,b.z-P.z);if(d<nd){nd=d;nb=b.k+(b.prog!=null?'*':'');}}let nr='',rd=1e9;try{for(const i of near(P.x,P.z,60)){const q=RES[i];if(!q||q.st!==0||!RT[q.t]||RT[q.t].pass)continue;const d=Math.hypot(q.x-P.x,q.z-P.z);if(d<rd){rd=d;nr=q.t;}}}catch(e2){nr='?'+String(e2).slice(0,30);}(TK.log=TK.log||[]).push([G.t|0,P.x|0,P.z|0,(j.x|0)+','+(j.z|0),nb+'@'+(nd|0),nr+'@'+(rd|0),'wd'+wdAt(P.x,P.z).toFixed(1),'sl'+slopeAt(P.x,P.z).toFixed(2),'dy'+((P.y-hAt(P.x,P.z))|0),'stuck'+(j.stuck|0),'jobs:'+AQ.jobs.map(x=>x.k).join('>')].join(' '));if(TK.log.length>30)TK.log.shift();}catch(e){(TK.log=TK.log||[]).push('LỖI GHI VẾT '+String(e).slice(0,80));}TK.s=TK.s.filter(s=>G.t-s[2]<1500);const near=TK.s.filter(s=>Math.hypot(s[0]-P.x,s[1]-P.z)<90).length;TK.s.push([P.x,P.z,G.t]);
      if(near>=1){let bk=null;for(let i=TK.c.length-1;i>=0;i--){const c=TK.c[i];if(Math.hypot(c[0]-P.x,c[1]-P.z)>260&&wdAt(c[0],c[1])<=0){bk=c;break;}}
        if(!bk){const hb=(typeof aqBed==='function'&&aqBed())||(typeof aqFire==='function'&&aqFire());if(hb&&near>=3)bk=[hb.x+30,hb.z+30,G.t];}
        if(bk){AQ.bad.push({x:P.x,z:P.z,t:G.t+900});P.x=bk[0];P.z=bk[1];P.y=groundY(P.x,P.z,hAt(P.x,P.z)+2);P.air=false;P.vy=0;AQ.path=null;AQ.dir=null;j.stuck=0;j.best=1e9;j.pts=null;j.pl=null;TK.c=TK.c.filter(c=>c!==bk);try{G.camInit=0;}catch(e){}
          uiToast('🤖 Kẹt giữa địa hình: lùi về chỗ đi được trước đó rồi vòng đường khác.','');return AQ_RUN;}}}}catch(e){}return r;};}
