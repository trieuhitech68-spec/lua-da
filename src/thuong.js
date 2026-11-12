/* ===================== BỊ THƯƠNG: hướng dẫn bắt buộc + Tự làm tự rửa, băng, bó nẹp =====================
   Trước: chỉ có một dòng nhắc "Mở Cơ thể" (trang đó đã chuyển vào Nhân vật → Thể trạng) nên người chơi không biết chữa thế nào. */
if(typeof HD_L!=='undefined')HD_L.push({id:'bithuong',ic:'🩹',t:'Bị thương thì làm gì',w:()=>!!(S.st&&(S.st.wound||S.st.bleed||S.st.fracture||S.st.infect))&&G.t>6,p:[
  'Bạn vừa <b>bị thương</b>. Vết thương để bẩn sẽ <b>nhiễm trùng</b>, máu tụt dần. Chữa theo 3 bước:',
  '<b>1. Rửa</b>: cần một bầu nước (nước đun sôi để nguội là sạch nhất). <b>2. Băng</b>: cần <b>Băng lá rau má</b> (Chế tạo → 3 Sợi + 2 Rau má; rau má mọc ở bãi cỏ ẩm gần suối). <b>3. Nghỉ</b>: ngồi cạnh lửa hoặc ngủ một giấc cho mau lành.',
  'Mở <b>🧍 Nhân vật → thẻ Thể trạng</b>: các nút <b>💧 Rửa vết thương</b>, <b>🩹 Băng lá</b> nằm ở đó. <b>Gãy xương</b> thì làm <b>Nẹp tre</b> (1 Tre + 3 Sợi, cần dao) rồi bấm <b>🦯 Bó nẹp</b>. <b>Nhiễm trùng</b> thì đắp <b>Cao nghệ nha đam</b>.',
  'Đang bật <b>▶ Tự làm</b> thì nhân vật tự rửa, tự băng, tự bó nẹp khi có đủ đồ; thiếu thì tự đi kiếm rau má, sợi.']});
/* Tự làm: việc khẩn "chữa thương" */
AUJ.treat=function(j){if(G.work)return AQ_RUN;if(j.T0==null)j.T0=G.t;if(j.cf)j.cf=null;if(G.t-j.T0>300)return AQ_DONE;const L=(typeof l4S==='function')?l4S():{},st=S.st||{};
  if(st.fracture&&!(L.fr&&L.fr.spl)){if(invCount('splint')>0){l4Treat('splint');return AQ_RUN;}if(!j.gs){j.gs=1;aqPush({k:'get',id:'splint',n:1,tries:0},j);return AQ_RUN;}}
  if(st.wound||st.bleed){const w=L.wn||{};if(st.wound&&!(w.c>=1)&&!j.cl&&(invCount('water')+invCount('waterDirty')>0)){j.cl=1;l4Treat('clean');return AQ_RUN;}
    if(!w.b||st.bleed){if(invCount('bandage')>0){if(!j.bd){j.bd=1;l4Treat('band');return AQ_RUN;}}else if(!j.gb){j.gb=1;j.lab='Làm băng lá rau má';aqPush({k:'get',id:'bandage',n:1,tries:0},j);return AQ_RUN;}}}
  return AQ_DONE;};
{const _sf=aqSafety;aqSafety=function(){_sf.apply(this,arguments);try{if(!AQ.on||!AQ.jobs.length||G.sleeping||G.work||aqHasUrgent())return;const st=S.st||{},L=(typeof l4S==='function')?l4S():{};
    const need=(st.bleed||(st.wound&&!(L.wn&&L.wn.b))||(st.fracture&&!(L.fr&&L.fr.spl)));if(need&&G.t-(AQ.trT||-999)>240){AQ.trT=G.t;aqPush({k:'treat',urgent:1,lab:'Chữa vết thương'},AQ.jobs[AQ.jobs.length-1]);aqSay('🤖 Bị thương: rửa, băng lại rồi làm tiếp.','');}}catch(e){}};}
/* ===================== BỊ THÚ BÁM ĐUỔI: không chết đói giữa lúc chạy trốn =====================
   Chạy thử: sói bám riết, Tự làm chỉ "tránh xa" rồi "lánh về trại" lồng vào nhau mãi, việc ăn uống khẩn bị đè nên đói khát tới gần chết dù túi đầy thịt chín.
   1. Đói/khát nguy kịch mà trong túi có đồ ăn/uống: ăn uống ngay tại chỗ (không cần xếp việc).
   2. Đã có lệnh "lánh về trại" thì không chồng thêm lệnh nữa.
   3. Bị bám riết (đang lánh về trại mà thú vẫn sát bên), có vũ khí và còn khoẻ: quay lại đánh. */
{const _sf=aqSafety;aqSafety=function(){try{if(AQ.on&&AQ.jobs.length&&!G.sleeping&&S&&S.p){const p=S.p;
      if(G.t-(AQ.emT||-9)>1.6){if(p.food<15){const f=aqFood(true);if(f){AQ.emT=G.t;eat(f);}}if(p.water<15){const b=['water','tea','mintwater'].find(k=>invCount(k)>0&&ITEMS[k]&&ITEMS[k].t==='drink');if(b){AQ.emT=G.t;eat(b);}}}
      const camp=AQ.jobs.some(j=>j.k==='camp');if(camp){AQ.flees=[];
        if(!aqHasUrgent('fight')&&p.hp>55&&(hasTool('spear')||hasTool('club')||hasTool('knife')||hasTool('axe'))){let dg=null,dd=1e9;for(const a of aqPred()){const d=Math.hypot(a.x-P.x,a.z-P.z);if(d<dd){dd=d;dg=a.a;}}
          if(dg&&dd<150&&dg.alive!==false&&(AQ.hound=(AQ.hound||0)+1)>40){AQ.hound=0;const top=AQ.jobs[AQ.jobs.length-1];if(G.work)workStop('');G.act=null;aqPush({k:'fight',a:dg,t0:G.t,urgent:1},top);aqSay('🤖 Bị '+((dg.n||'thú dữ').toLowerCase())+' bám riết: quay lại đánh.','bad');}}}else AQ.hound=0;}}catch(e){}
  return _sf.apply(this,arguments);};}
/* 4. Né mãi không thoát (thú nhanh hơn người): quá 6 lần né trong 2 phút thì thôi né 90 giây — còn khoẻ, có vũ khí thì đánh; yếu thì kệ nó, lo uống nước, ăn, về trại trước
      (chạy thử: bị sói bám 25 phút, không tới nổi suối, khát cạn). */
{const _sf=aqSafety;aqSafety=function(){const r=_sf.apply(this,arguments);try{if(!AQ.on||!AQ.jobs.length)return r;const top=AQ.jobs[AQ.jobs.length-1];
    if(top.k==='flee'){if(top.t0!==AQ._ft){AQ._ft=top.t0;AQ.fl3=(AQ.fl3||[]).filter(t=>G.t-t<120);AQ.fl3.push(G.t);}
      if((AQ.noFleeT||0)>G.t){AQ.jobs.pop();AQ.path=null;AQ.dir=null;}
      else if((AQ.fl3||[]).length>=6){AQ.fl3=[];AQ.noFleeT=G.t+90;const a=top.a;AQ.jobs.pop();AQ.path=null;AQ.dir=null;const weap=hasTool('spear')||hasTool('club')||hasTool('knife')||hasTool('axe'),t2=AQ.jobs[AQ.jobs.length-1];
        if(weap&&S.p.hp>38&&a&&a.alive!==false&&t2){aqPush({k:'fight',a,t0:G.t,urgent:1},t2);aqSay('🤖 Né mãi không thoát '+((a.n||'thú dữ').toLowerCase())+': quay lại đánh.','bad');}
        else aqSay('🤖 Né mãi không thoát: mặc kệ nó, lo ăn uống và về trại trước.','bad');}}}catch(e){}return r;};}
