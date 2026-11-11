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
AUJ.warm=function(j){const p=S.p;if(j.cf){j.cf=null;if(++j.alt>3)return aqFail('Không tìm được chỗ sưởi.');}
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
{const _sf=aqSafety;aqSafety=function(){_sf.apply(this,arguments);try{if(!AQ.on||!AQ.jobs.length||G.sleeping||aqHasUrgent())return;const p=S.p,top=AQ.jobs[AQ.jobs.length-1];
      if((p.warm<24||(p.wet>85&&p.warm<34))&&G.t-(AQ.wmT||-99)>25){AQ.wmT=G.t;if(G.work)workStop('Rét quá, đi sưởi đã.');G.act=null;aqPush({k:'warm',urgent:1},top);aqSay('🤖 Rét và ướt quá: về sưởi ấm rồi làm tiếp.','');return;}
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
