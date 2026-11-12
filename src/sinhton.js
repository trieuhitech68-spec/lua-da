/* ===================== SINH TỒN KHI TỰ LÀM · CHUẨN BỊ TRƯỚC KHI ĐI XA =====================
   Trước đây: trời mưa rét, thân nhiệt tụt dưới 8 là game chặn mọi việc nặng, còn "Tự làm" chỉ đứng chờ → đứng yên giữa rừng.
   Giờ:
   1. Nhiệm vụ "Làm áo tơi hoặc nón lá" lên ngay sau khi lợp mái (trước các chuyến đi tìm thuốc, đá lửa, săn bắn).
   2. Chuẩn bị: từ khi có mái nhà, trước mỗi nhiệm vụ "Tự làm" tự may Áo tơi (che 80% mưa) và Nón lá nếu chưa có, rồi tự mặc mọi món đồ mặc còn nằm trong túi.
   3. Rét (thân nhiệt < 24) hoặc ướt sũng: bỏ dở việc, về bếp lửa gần nhất (tự nhóm nếu tắt), không có lửa thì về lều / mái nhà, không có gì thì dựng bếp tại chỗ;
      sưởi và hong khô xong mới làm tiếp.
   4. Buồn ngủ: về chỗ ngủ ngủ một giấc rồi làm tiếp. */
{const t='Làm áo tơi hoặc nón lá',g=GOALS.find(x=>x.t===t),at=GOALS.findIndex(x=>x.t==='Lợp 4 tấm mái');if(g&&at>=0&&GOALS.indexOf(g)>at+1){GOALS.splice(GOALS.indexOf(g),1);g.e=1;GOALS.splice(GOALS.findIndex(x=>x.t==='Lợp 4 tấm mái')+1,0,g);}
  const _gc=goalCheck;goalCheck=function(){try{if(S&&S.gv3!==1){S.gv3=1;if(S.goal>0){let i=0;while(i<GOALS.length){const [v,n]=goalProg(GOALS[i]);if(v<n)break;i++;}if(i<S.goal)S.goal=i;}}}catch(e){}return _gc.apply(this,arguments);};}
const stRain=()=>{let k=0;for(const s in (S.wear||{})){const I=ITEMS[S.wear[s]];if(I&&I.rain)k=Math.max(k,I.rain);}return k;};
const stHasItem=id=>Object.values(S.wear||{}).includes(id)||invCount(id)>0;
function stWearAll(){try{for(let i=0;i<S.inv.length;i++){const s=S.inv[i],I=s&&ITEMS[s.id];if(!I||I.t!=='wear'||!I.slot||(S.wear&&S.wear[I.slot]))continue;wearItem(i);return true;}}catch(e){}return false;}
// ----- sưởi ấm, hong khô -----
AUJ.warm=function(j){const p=S.p;if(j.T0==null)j.T0=G.t;if(G.t-j.T0>260)return AQ_DONE;/* không sưởi quá 4 phút */if(j.cf){j.cf=null;if(++j.alt>3)return aqFail('Không tìm được chỗ sưởi.');}
  const here=fireHeat(P.x,P.z)>0.3,roof=underRoof(P.x,P.z)||fireSheltered(P.x,P.z);
  if(j.t0!=null){if((p.warm>=46&&p.wet<35)||(!here&&roof&&p.warm>=30&&p.wet<20)||G.t-j.t0>110)return AQ_DONE;}
  const site=S.builds.find(b=>b.prog!=null&&GD_FIRE.test(b.k));if(site&&j.built&&!j.sited){j.sited=1;aqPush({k:'site',b:site},j);return AQ_RUN;}
  let f=aqFire(true);const f0=aqFire(false),rain=typeof isRaining==='function'&&isRaining();
  if(!f&&f0&&!j.lit&&aqD(f0.x,f0.z)<2600&&!(rain&&!fireSheltered(f0.x,f0.z))){j.lit=1;j.lab='Về nhóm lại bếp';aqPush({k:'light',b:f0,force:1},j);return AQ_RUN;}
  const bed=aqBed();let tg=null;if(f&&(!bed||aqD(f.x,f.z)<aqD(bed.x,bed.z)*1.6+200))tg=f;else if(bed)tg=bed;else if(f)tg=f;
  const lsite=S.builds.find(b=>b.prog!=null&&b.k==='leanto');if(lsite&&j.builtL&&!j.sitedL){j.sitedL=1;aqPush({k:'site',b:lsite},j);return AQ_RUN;}
  if(!tg||aqD(tg.x,tg.z)>3200){if(!j.built&&!rain){j.built=1;j.lab='Dựng bếp sưởi tại chỗ';aqPush({k:'place',piece:'campfire'},j);return AQ_RUN;}if(!tg&&!j.builtL){j.builtL=1;j.lab='Dựng lều trú mưa';aqPush({k:'place',piece:'leanto'},j);return AQ_RUN;}if(!tg)return aqFail('Không có bếp lửa hay chỗ trú nào để sưởi.');}
  if(aqD(tg.x,tg.z)>(tg===f?46:30)){j.t0=null;return aqGoto(j,tg.x,tg.z,tg===f?34:22,tg===f?'Về bếp lửa sưởi ấm':'Về chỗ trú cho đỡ rét',{far:1});}
  if(j.t0==null)j.t0=G.t;j.lab=here?'Sưởi ấm, hong khô bên lửa':'Trú dưới mái cho khô người';if(G.work)try{workStop('');}catch(e){}return AQ_RUN;};
{const _i=aqInit;aqInit=function(j){_i(j);if(j.k==='warm'&&j.alt==null)j.alt=0;};}
// ----- chen việc sinh tồn -----
{const _sf=aqSafety;aqSafety=function(){_sf.apply(this,arguments);try{if(!AQ.on||!AQ.jobs.length||G.sleeping)return;
      {/* đói khát tới mức sắp không làm nổi việc: chen ăn uống lên trước MỌI việc khẩn khác (chạy thử: đang "đi sưởi → nhóm lửa" thì đói lả, nhóm lửa chờ ăn, ăn chờ sưởi xong → đứng tới chết) */const p=S.p,top=AQ.jobs[AQ.jobs.length-1];
        if(p.water<12&&top.k!=='drink'&&!AQ.jobs.some(j=>j.k==='drink')){if(G.work)workStop('');aqPush({k:'drink',urgent:1,tries:0},top);return;}if(p.food<12&&top.k!=='eat'&&!AQ.jobs.some(j=>j.k==='eat')){if(G.work)workStop('');aqPush({k:'eat',urgent:1,tries:0},top);return;}}
      if(aqHasUrgent())return;const p=S.p,top=AQ.jobs[AQ.jobs.length-1];
      if(S.st&&S.st.cold&&G.t-(AQ.wmT||-99)>600){/* rét giờ không còn chặn việc hay trừ máu, nên chỉ về sưởi khi đã cảm lạnh hoặc rét hẳn, và không quá 4 phút một lần (chạy thử thấy trước đây cứ nửa phút lại bỏ việc đi sưởi) */AQ.wmT=G.t;if(G.work)workStop('Rét quá, đi sưởi đã.');G.act=null;aqPush({k:'warm',urgent:1},top);aqSay('🤖 Rét và ướt quá: về sưởi ấm rồi làm tiếp.','');return;}
      if(S.st&&S.st.sleepy&&!G.work&&G.t-(AQ.slT||-99)>180&&aqBed()&&(S.tn==null||S.tn-(S.wcSlT==null?-9:S.wcSlT)>=0.5)){AQ.slT=G.t;aqPush({k:'sleep',urgent:1},top);aqSay('🤖 Buồn ngủ quá: về ngủ một giấc rồi làm tiếp.','');}}catch(e){}};}
// ----- chuẩn bị trước mỗi nhiệm vụ: mặc đồ, áo tơi, nón -----
{const _g=AUJ.goal;AUJ.goal=function(j){try{const g=GOALS[j.gi];if(g&&!j.cf){if(stWearAll())return AQ_RUN;const roofI=GOALS.findIndex(x=>x.t==='Lợp 4 tấm mái');
        if(roofI>=0&&j.gi>roofI&&g.t!=='Làm áo tơi hoặc nón lá'){for(const [id,key] of [['rainCape','pC'],['leafHat','pH']]){if(j[key]||stHasItem(id))continue;const I=ITEMS[id];if(!I||(S.wear&&S.wear[I.slot]))continue;const r=aqRecipe(id);if(!r)continue;j[key]=1;
            aqSay('🤖 Chuẩn bị trước khi đi: may '+I.n+'.','');aqPush({k:'craft',r,until:()=>stHasItem(id)},j);return AQ_RUN;}}}
      if(j.cf&&(j.pC||j.pH)&&!j.pF){/* may đồ không được thì thôi, vẫn làm nhiệm vụ */j.pF=1;j.cf=null;}}catch(e){}return _g.apply(this,arguments);};}
// nhiệm vụ áo tơi / nón lá: làm xong thì mặc luôn
{const _p=AUG['Làm áo tơi hoặc nón lá'];if(_p)AUG['Làm áo tơi hoặc nón lá']=function(){stWearAll();return _p.apply(this,arguments);};}
/* ---------- RÉT, ƯỚT KHÔNG GIẾT NGƯỜI MỚI ----------
   Chạy thử tua nhanh một nhân vật mới giữa mùa đông có mưa: 25 giây là ướt sũng, thân nhiệt về 0, bị chặn mọi việc nặng ngay từ nhiệm vụ chặt gỗ rồi mất máu tới chết.
   Mùa giờ theo lịch thật (đông kéo 3 tháng) nên phải nhẹ tay:
   - Chưa lợp được mái nhà đầu tiên: thân nhiệt không xuống dưới 36, ướt không quá 55 (người mới chưa có gì che thân).
   - Về sau: thân nhiệt không xuống dưới 12 → không còn cảnh "rét cóng tay" chặn mọi việc và không mất máu vì rét; rét vẫn làm chậm hồi sức và dễ cảm lạnh nếu để lâu. */
if(typeof bodyTick==='function'){const _bt=bodyTick;bodyTick=function(dt){const r=_bt.apply(this,arguments);try{const p=S.p,nb=!((S.cnt&&(S.cnt['build:roof']||S.cnt['build:thatchRoof']||S.cnt['build:leafRoof']))>0);
    if(nb){if(p.warm<36)p.warm=36;if(p.wet>55)p.wet=55;if(S.st&&S.st.cold)delete S.st.cold;}else if(p.warm<12)p.warm=12;}catch(e){}return r;};}
/* ---------- THÚ DỮ KHÔNG VÂY TRẠI, KHÔNG SĂN NGƯỜI MỚI ----------
   Sói vốn hung dữ "ban đêm hoặc mùa đông": mùa đông giờ dài 3 tháng thật nên chúng tấn công suốt ngày, vây cả trại. Giờ thú dữ KHÔNG chủ động tấn công khi:
   - nhân vật dưới cấp 5 (người mới); hoặc
   - đang ở gần bếp lửa đang cháy, dưới mái nhà, hay trong vòng 11 m quanh chỗ ngủ của mình.
   Bị đánh trước thì chúng vẫn đánh trả; thú chúa giữ mỏ không áp dụng. */
const stSafe=(()=>{let t=-9,v=false;return ()=>{if(G.t-t<1)return v;t=G.t;try{v=(typeof heroLv==='function'&&heroLv()<5)||fireHeat(P.x,P.z)>0.05||underRoof(P.x,P.z)||S.builds.some(b=>b.prog==null&&pieceDef(b.k)&&pieceDef(b.k).bed&&Math.hypot(b.x-P.x,b.z-P.z)<220);}catch(e){v=false;}return v;};})();
if(typeof l3hostile==='function'){const _h=l3hostile;l3hostile=function(a,D,d){const r=_h.apply(this,arguments);if(!r||a.angry||a.boss)return r;return stSafe()?false:r;};}
// Tự làm: mặc định đánh trả thú yếu khi có vũ khí (trước mặc định chỉ chạy)
{const _c=aqCfg;aqCfg=function(){const c=_c.apply(this,arguments);if(!c.fv2){c.fv2=1;c.fight=1;}return c;};}
/* ---------- bếp lửa đầu tiên nhóm được cả khi trời mưa ----------
   Chạy thử gặp mưa: bếp đặt cách lều hơn 2,4 m là "không có mái che", không nhóm được, kẹt nhiệm vụ nhóm lửa. Giờ lều nghiêng / lều da che mưa cho bếp trong vòng 5 m,
   và Tự làm ưu tiên đặt bếp sát lều (2–2,3 m). */
if(typeof fireSheltered==='function'){const _fs=fireSheltered;fireSheltered=function(x,z){if(_fs.apply(this,arguments))return true;try{for(const b of S.builds)if(b.prog==null&&(b.k==='leanto'||b.k==='tent'||b.k==='kitchenShed')&&Math.hypot(b.x-x,b.z-z)<100)return true;}catch(e){}return false;};}
{const _sp=aq2Spots;aq2Spots=function(def){const out=_sp.apply(this,arguments);try{if(def.id==='campfire'){const L=S.builds.find(b=>b.prog==null&&(b.k==='leanto'||b.k==='tent'));if(L){const nr=[];for(const r of [44,52,60,70,84])for(let a=0;a<20;a++){const x=L.x+Math.cos(a/20*6.283)*r,z=L.z+Math.sin(a/20*6.283)*r;if(aq2Free(x,z,16)&&!S.builds.some(b=>Math.hypot(b.x-x,b.z-z)<30))nr.push({x,z,s:r});}
        return nr.slice(0,10).concat(out).slice(0,16);}}}catch(e){}return out;};}
// lò nung, lò luyện, lò bếp đá là lò kín: nhóm được cả khi trời mưa (chạy thử: mưa kéo dài là kẹt nhiệm vụ nung gốm)
if(typeof fireSheltered==='function'){const _fs2=fireSheltered;fireSheltered=function(x,z){if(_fs2.apply(this,arguments))return true;try{for(const b of S.builds)if(b.prog==null&&/^(kiln|smelter|hearth|stoneHearth|hearth3|hearthBox)$/.test(b.k)&&Math.hypot(b.x-x,b.z-z)<14)return true;}catch(e){}return false;};}
