/* ===================== NHIỆM VỤ CHÍNH NỐI DÀI: RƯƠNG · THUẦN THÚ · CHUỒNG · NÂNG NHÀ · GIẾNG · CHÒI CANH =====================
   Thêm 6 mục vào chuỗi chính, đều có "Tự làm":
     sau rào quanh nhà:      Đóng rương gỗ cất đồ
     sau nung nồi gốm:       Thuần một con thú · Dựng chuồng gà · Nâng nhà lên bậc trên
     sau trống đồng:         Đào giếng nước · Dựng chòi canh */
{const ins=(after,g)=>{if(GOALS.some(x=>x.t===g.t))return;const i=GOALS.findIndex(x=>x.t===after);if(i>=0)GOALS.splice(i+1,0,g);else GOALS.push(g);};
  const P_=(k)=>()=>{const b=S.builds.find(b=>b.prog!=null&&b.k===k);return b?{k:'site',b}:{k:'place',piece:k};};
  ins('Rào quanh nhà, dựng cổng',G_(1,'Đóng rương gỗ cất đồ','Chế tạo Ván gỗ ở Bàn chế tác rồi Xây → Rương gỗ (6 ván, 2 dây thừng): chứa 30 ô, gấp đôi giỏ. Đặt trong nhà.',1,()=>gDone('chest')));AUG['Đóng rương gỗ cất đồ']=P_('chest');
  ins('Nung nồi gốm đầu tiên',G_(2,'Nâng nhà lên bậc trên','Đứng trong nhà, mở Xây → Nâng cấp & sửa chữa → "Nâng cả nhà": sàn, vách, mái đổi sang tre, đất trát, mái tranh ngay tại chỗ.',1,()=>gC('cnt:nnup')));AUG['Nâng nhà lên bậc trên']=()=>({k:'nnup'});
  ins('Nung nồi gốm đầu tiên',G_(2,'Dựng chuồng gà','Xây → Chuồng gà (4 tre, 6 sợi cỏ, 4 cành) cạnh nhà: gà nhà về ở quanh chuồng và đẻ trứng.',1,()=>gDone(/^(coop|chickenCoop2)$/)));AUG['Dựng chuồng gà']=P_('coop');
  ins('Nung nồi gốm đầu tiên',G_(2,'Thuần một con thú','Cầm quả mọng hoặc hạt kê, lom khom lại gần gà rừng (hoặc cho lợn rừng ăn quả, cho sói ăn thịt) và cho ăn vài lần tới khi nó quen người.',1,()=>gC('cnt:tame')));AUG['Thuần một con thú']=()=>({k:'tame'});
  ins('Đúc trống đồng Đông Sơn',G_(4,'Dựng chòi canh','Xây → Chòi canh (10 gỗ, 4 dây thừng, 8 sợi cỏ): trèo lên nhìn xa, lính gác trên chòi bắn xa hơn.',1,()=>gDone('watchtower')));AUG['Dựng chòi canh']=P_('watchtower');
  ins('Đúc trống đồng Đông Sơn',G_(4,'Đào giếng nước','Xây → Giếng nước (20 đá, 6 gỗ, 2 dây thừng, Xây dựng cấp 3): nước sạch ngay cạnh nhà, ruộng gần giếng lớn nhanh gấp đôi.',1,()=>gDone(/^(well|wellStone)$/)));AUG['Đào giếng nước']=P_('well');
  const _gc=goalCheck;goalCheck=function(){try{if(S&&S.gv7!==1){S.gv7=1;if(S.goal>0){let i=0;while(i<GOALS.length){const [v,n]=goalProg(GOALS[i]);if(v<n)break;i++;}if(i<S.goal)S.goal=i;}}}catch(e){}return _gc.apply(this,arguments);};}
// thuần thú: tìm con thuần được gần nhất, lo thức ăn, lom khom lại gần, cho ăn tới khi quen
AUJ.tame=function(j){const c=gC('cnt:tame');if(j.c0==null)j.c0=c;if(c>j.c0){G.sneak=false;return AQ_DONE;}if(j.cf){j.cf=null;if(j.a){j.sk.add(j.a);j.a=null;}if(++j.miss>6){G.sneak=false;return aqFail('Không lại gần được con thú nào để thuần.');}}
  j.sk=j.sk||new Set();const ok=a=>a.alive&&TAME[a.kind]&&!a.boss&&!a.angry&&!j.sk.has(a);
  if(!j.a||!ok(j.a)||G.t-j.aT>120){if(j.a)j.sk.add(j.a);let best=null,bs=1e9;for(const a of G.animals||[]){if(!ok(a))continue;const d=aqD(a.x,a.z)+(a.kind==='junglefowl'?0:a.kind==='boar'?900:2500);if(d<bs){bs=d;best=a;}}if(!best){G.sneak=false;return aqFail('Không thấy gà rừng, lợn rừng nào quanh đây để thuần.');}j.a=best;j.aT=G.t;}
  const a=j.a,T=TAME[a.kind];if(!T.food.some(f=>invCount(f)>0)){if(++j.g>5){G.sneak=false;return aqFail('Không kiếm được thức ăn để thuần '+T.n+'.');}G.sneak=false;const f=T.food.find(x=>aqSrc(x).length)||T.food[0];aqPush({k:'get',id:f,n:4,tries:0},j);return AQ_RUN;}
  const d=aqD(a.x,a.z);j.lab='Thuần '+a.n.toLowerCase()+(a.tame?' ('+Math.round(a.tame*100)+'%)':'');if(d>REACH+10){G.sneak=d<260;AQ.dir=aqSafeDir(a.x-P.x,a.z-P.z)||[a.x-P.x,a.z-P.z];if(d>700)return aqGoto(j,a.x,a.z,260,j.lab,{far:1});return AQ_RUN;}
  if(G.t-(j.ft||0)<1.4)return AQ_RUN;j.ft=G.t;aqFace(a.x,a.z);G.sneak=true;tameFeed(a);return AQ_RUN;};
// nâng cả nhà: về nhà, gom vật liệu, nâng
AUJ.nnup=function(j){const c=gC('cnt:nnup');if(j.c0==null)j.c0=c;if(c>j.c0)return AQ_DONE;if(j.cf){const m=j.cf;j.cf=null;if(++j.miss>3)return aqFail(m);}
  const f=aq2Floors().find(b=>b.prog==null);if(!f)return aqFail('Chưa có nhà để nâng.');if(aqD(f.x,f.z)>120)return aqGoto(j,f.x,f.z,70,'Về nhà để nâng cấp',{far:1});
  const pl=nnPlan();if(!pl)return aqFail('Nhà đã ở bậc cao nhất hiện có.');j.lab='Nâng cả nhà lên '+pl.name;if(pl.lvNeed){if(aqTrainFor(pl.lvNeed.lv,j))return AQ_RUN;return aqFail('Cần '+lvText(pl.lvNeed.lv)+'.');}
  if(!canPay(pl.cost)){if(++j.g>5)return aqFail('Không gom đủ vật liệu nâng nhà.');aqPush({k:'getAll',cost:Object.assign({},pl.cost),lab:'Gom vật liệu nâng nhà'},j);return AQ_RUN;}nnDo();if(gC('cnt:nnup')>j.c0)return AQ_DONE;if(++j.fl>2)return aqFail('Không nâng được nhà.');return AQ_RUN;};
{const _i=aqInit;aqInit=function(j){_i(j);if((j.k==='tame'||j.k==='nnup')&&j.g==null)j.g=0;};}
