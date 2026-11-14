/* ===================== NGƯỜI LÀNG LÀM NHIỀU VIỆC HƠN + SỬA THUẦN THÚ BỊ ĐÁNH NHẦM =====================
   Việc mới giao được cho người làng, tù binh đã quy phục (bấm vào người → Giao việc):
     · THỢ XÂY  : tự tới các công trường đang dựng dở quanh nhà, làm nốt. Công đoạn nào cần vật liệu thì lấy trong giỏ, rương, chum của làng; thiếu thì sang công trường khác.
     · CHĂN NUÔI: lấy rau, quả, củ, hạt trong kho cho vật nuôi đói ăn; nhặt trứng ở chuồng gà, chuồng vịt; vớt cá ở ao; mang về kho.
     · ĐI SĂN   : rình thú hiền (thỏ, gà rừng, nai, dê núi, khỉ) quanh nhà, hạ rồi mang thịt, da, xương, lông về kho. Không đụng con đang được thuần.
     · LÀM RUỘNG: luống đất chín thì gặt mang về kho; luống trống thì lấy hạt giống trong kho ra gieo kể cả ruộng lúa nước: khơi nước, gieo mạ, cấy, làm cỏ, gặt.
     · ĐÁNH CÁ  : ra bờ nước gần nhà câu cá, đủ 3 con thì mang về kho.
   Đêm về chỗ ngủ như mọi người. Không có việc (hết công trường, không có nước…) thì ngồi nghỉ gần nhà.
   THUẦN THÚ: trước, nút ghi "Cho ăn" nhưng nếu ô đang cầm không phải thức ăn (hoặc vừa cho ăn hết ô đó) thì bấm lần nữa lại thành ĐÁNH con thú.
     Giờ đang lom khom hoặc con thú đang thuần dở: bấm Hành động luôn là cho ăn (lấy thức ăn ở bất kỳ ô nào trong túi); hết thức ăn thì báo, không đánh. */
const VTH={J:{farm:'Làm ruộng',build:'Thợ xây',herd:'Chăn nuôi',hunt:'Đi săn',fish:'Đánh cá'},PREY:/^(rabbit|junglefowl|deer|goat|monkey)$/};
Object.assign(JOBN,VTH.J);
{const _as=actStart;actStart=function(t){try{if(t&&t.type==='animal'&&t.a&&t.a.alive&&!t.a._h3down&&!G.work&&TAME[t.a.kind]&&!t.a.boss){const a=t.a,doing=a.tame>0&&a.tame<0.99;
      if((G.sneak||doing)&&!a.angry){if(tameFood(a.kind)){tameFeed(a);return;}if(doing){uiToast('Hết thức ăn nó thích rồi: cần '+TAME[a.kind].food.filter(f=>ITEMS[f]).slice(0,3).map(f=>ITEMS[f].n.toLowerCase()).join(' / ')+'. (Không đánh con đang thuần dở.)','bad');sfx('no');return;}}}}catch(e){}return _as.apply(this,arguments);};}
{const _ti=targetInfo;targetInfo=function(t){try{if(t&&t.type==='animal'&&t.a&&t.a.alive&&!t.a._h3down&&TAME[t.a.kind]&&t.a.tame>0&&t.a.tame<0.99&&!t.a.angry){const r=tameInfo(t.a);if(r)return r;}}catch(e){}return _ti.apply(this,arguments);};}
// kho của làng quanh nhà
function vthStores(home){const L=[];for(const b of S.builds){const d=pieceDef(b.k);if(!d||!d.store||b.prog!=null||b.remote||b.k==='trough')continue;if(Math.hypot(b.x-home.x,b.z-home.z)<900&&S.store[b.id])L.push(S.store[b.id]);}return L;}
function vthHave(L,id){let n=0;for(const st of L)for(const s of st)if(s&&s.id===id)n+=s.n;return n;}
function vthTake(L,id,n){for(const st of L)for(let i=0;i<st.length&&n>0;i++){const s=st[i];if(!s||s.id!==id)continue;const k=Math.min(n,s.n);s.n-=k;n-=k;if(s.n<=0)st[i]=null;}return n<=0;}
// thợ xây gõ một nhát vào công trường; trả false nếu chưa làm tiếp được (thiếu vật liệu trong kho)
function vthHit(b,f,home){const d=pieceDef(b.k);if(!d||b.prog==null)return false;const add=0.5*(1+0.08*((typeof danLv==='function'?danLv(f):1)-1))/siteWork(b),st=typeof STG==='object'?STG[b.k]:null;
  const done=()=>{delete b.prog;siteShow(b);const a=G.act;try{siteDone(b);}finally{G.act=a&&a.t&&a.t.b===b?null:a;}};
  if(!st){b.prog=Math.min(1,(b.prog||0)+add);siteShow(b);if(b.prog>=1)done();return true;}
  const s=b3stg(b),sg=s.s;if(s.paid<=s.i){const L=vthStores(home);for(const k in sg.c)if(vthHave(L,k)<sg.c[k])return false;for(const k in sg.c)vthTake(L,k,sg.c[k]);b.paid=s.i+1;}
  const end=s.cum[s.i];b.prog=Math.min(end,(b.prog||0)+add);if(b.prog>=end-1e-9){if(s.i>=s.n-1){done();return true;}b.prog=end;}siteShow(b);return true;}
// việc cần làm ở một ruộng lúa nước (null = chưa có gì để làm)
function vthPadOp(b,L){const F=l4Pad(b),src=l4PadSrc(b);if((F.st===0||F.st===3)&&F.w<0.3)return src?'water':null;if(F.st===0)return vthHave(L,'seedRice')>=2&&SEASONS[seasonIdx()].grow>0?'sow':null;if(F.st===2)return 'plant';if(F.st===3&&F.weed>0.45)return 'weed';if(F.st===4)return 'reap';return null;}
function vthBank(home){for(let r=80;r<=620;r+=45)for(let k=0;k<16;k++){const a=k/16*6.283+r*0.01,x=home.x+Math.sin(a)*r,z=home.z+Math.cos(a)*r;if(wdAt(x,z)>0.3){for(let q=1;q<8;q++){const bx=home.x+Math.sin(a)*(r-q*10),bz=home.z+Math.cos(a)*(r-q*10);if(wdAt(bx,bz)<=0)return {x:bx,z:bz,wx:x,wz:z};}}}return null;}
function vthTick(f,dt){if(!f._o)folkSpawn(f);if(!f._bag)f._bag={};const home=folkHome(f),night=S.hour>=20||S.hour<6;f._t=(f._t||0)-dt;let tx=f.x,tz=f.z,pose='idle',sp=60;const V=f._v||(f._v={});if(V.job!==f.job){f._v={job:f.job};return vthTick(f,dt);}
  const near2=(x,z,r)=>Math.hypot(x-f.x,z-f.z)<r,bagN=()=>{let n=0;for(const k in f._bag)n+=f._bag[k];return n;},rest=s=>{V.rest=G.t+s;};
  const goStore=()=>{const st=storeNear(f.x,f.z);if(!st){f._bag={};rest(10);V.back=0;return;}tx=st.x+8;tz=st.z+8;if(near2(tx,tz,10)){for(const k in f._bag)slotsAdd(S.store[st.id],k,f._bag[k]);f._bag={};V.back=0;if(typeof danXp==='function')danXp(f,1);save();}};
  if(night){tx=home.x;tz=home.z;pose=near2(home.x,home.z,14)?'sleep':'walk';f._st='sleep';}
  else if(V.back){f._st='back';goStore();}
  else if(V.rest&&G.t<V.rest&&G.t>V.rest-60){f._st='rest';pose='sit';if(!near2(home.x,home.z,120)){tx=home.x+((f.seed%7)-3)*14;tz=home.z+((f.seed%5)-2)*14;}}
  else if(f.job==='build'){f._st='work';let b=V.b&&BYID.get(V.b);if(!b||b.prog==null){b=null;V.b=0;if(!(G.t-(V.sT||-9)<3&&G.t>=(V.sT||0))){V.sT=G.t;let bd=750;for(const o of S.builds){if(o.prog==null||o.remote||(V.skip&&V.skip[o.id]>G.t))continue;const d=Math.hypot(o.x-home.x,o.z-home.z);if(d<bd){bd=d;b=o;}}if(b)V.b=b.id;else rest(8);}}
    if(b){const dd=Math.hypot(b.x-f.x,b.z-f.z);if(dd>30){const k=24/Math.max(1,dd);tx=b.x+(f.x-b.x)*k;tz=b.z+(f.z-b.z)*k;V.arr=G.t;}else{pose='chop';f._ry=Math.atan2(b.x-f.x,b.z-f.z);if(f._t<=0){f._t=1.2;if(!vthHit(b,f,home)){(V.skip=V.skip||{})[b.id]=G.t+40;V.b=0;if(!V.told||G.t-V.told>120){V.told=G.t;uiToast(`🧱 ${f.n}: ${pieceDef(b.k).n} thiếu vật liệu trong kho làng, tạm sang việc khác.`,'');}}else if(typeof danXp==='function'&&Math.random()<0.2)danXp(f,1);}}}}
  else if(f.job==='herd'){f._st='work';if(!V.go&&!(G.t-(V.sT||-9)<4&&G.t>=(V.sT||0))){V.sT=G.t;const day=TNOW(),L=vthStores(home);
      const hungry=(S.pets||[]).filter(p=>day-(p.fed||0)>0.5&&Math.hypot(p.x-home.x,p.z-home.z)<800),feed=hungry.length?CNG.FEED.find(id=>ITEMS[id]&&vthHave(L,id)>0):null;
      if(feed){const p=hungry[0];V.go={k:'feed',x:p.x,z:p.z,id:feed};}
      else{let c=null;for(const b of S.builds){if(b.prog!=null||b.remote||Math.hypot(b.x-home.x,b.z-home.z)>800)continue;if(/^(coop|chickenCoop2|duckHouse|chickenRoost|fishPond)$/.test(b.k)&&Math.floor((S.tank&&S.tank[b.id])||0)>=1){c=b;break;}}
        if(c)V.go={k:'take',x:c.x+14,z:c.z+14,b:c.id};else{const pt=(S.pets||[]).filter(p=>Math.hypot(p.x-home.x,p.z-home.z)<800);if(pt.length){const p=pt[Math.floor(G.t/20+f.seed)%pt.length];V.go={k:'look',x:p.x+12,z:p.z+12,t:G.t+10};}else rest(10);}}}
    const g=V.go;if(g){tx=g.x;tz=g.z;if(near2(tx,tz,26)||(g.k==='look'&&G.t>g.t)){tx=f.x;tz=f.z;pose='gather';if(g.w==null){g.w=G.t+(g.k==='look'?4:2.5);}else if(G.t>g.w){const day=TNOW();
          if(g.k==='feed'){const L=vthStores(home);let n=0;const hs=(S.pets||[]).filter(p=>day-(p.fed||0)>0.5&&Math.hypot(p.x-f.x,p.z-f.z)<260);while(n<hs.length&&vthTake(L,g.id,1)){for(let k=0;k<3&&n<hs.length;k++)hs[n++].fed=day;}if(n){puff(f.x,hAt(f.x,f.z)+8,f.z,'#ffd27a',3);if(typeof danXp==='function')danXp(f,1);}}
          else if(g.k==='take'){const b=BYID.get(g.b),n=b?Math.floor((S.tank&&S.tank[b.id])||0):0;if(n){S.tank[b.id]-=n;const id=b.k==='fishPond'?'fish':'egg';f._bag[id]=(f._bag[id]||0)+n;V.back=1;}}
          V.go=null;}}}}
  else if(f.job==='hunt'){f._st='work';let a=V.a;if(a&&(!a.alive||a.tame>0||!a.o))a=V.a=null;if(!a&&!(G.t-(V.sT||-9)<4&&G.t>=(V.sT||0))){V.sT=G.t;let bd=850;for(const o of G.animals||[]){if(!o.alive||o.tame>0||o._h3down||!o.o||!VTH.PREY.test(o.kind)||(S.pets||[]).includes(o))continue;const d=Math.hypot(o.x-home.x,o.z-home.z);if(d<bd&&Math.hypot(o.x-P.x,o.z-P.z)>140){bd=d;a=o;}}V.a=a;V.aim=0;if(!a)rest(12);}
    if(a){const dd=Math.hypot(a.x-f.x,a.z-f.z);if(dd>95){tx=a.x;tz=a.z;sp=85;V.aim=0;}else{pose='chop';f._ry=Math.atan2(a.x-f.x,a.z-f.z);V.aim=(V.aim||0)+dt;if(V.aim>2.6){const D=ANIMALS[a.kind];a.alive=false;a.o.visible=false;a.back=TNOW()+2;try{puff(a.x,(a.y||hAt(a.x,a.z))+8,a.z,'#c9b28a',5);}catch(e){}for(const k in D.drop)f._bag[k]=(f._bag[k]||0)+D.drop[k];V.a=null;V.back=1;V.rest=0;V.after=1;}}}}
  else if(f.job==='farm'){/* làm ruộng: luống chín thì gặt mang về kho; luống trống thì lấy hạt giống trong kho ra gieo */f._st='work';if(!V.go&&!(G.t-(V.sT||-9)<4&&G.t>=(V.sT||0))){V.sT=G.t;const L=vthStores(home);let ripe=null,empty=null;
      for(const b of S.builds){const d=pieceDef(b.k);if(!d||!d.farm||b.prog!=null||b.remote||Math.hypot(b.x-home.x,b.z-home.z)>800)continue;const c=S.crops[b.id];if(c){if(!ripe&&cropStage(c)>=3)ripe=b;}else if(!empty)empty=b;}
      const seed=empty?['seedGrain','seedGourd','seedFlax'].find(id=>ITEMS[id]&&ITEMS[id].crop&&vthHave(L,id)>0):null;if(ripe)V.go={k:'reap',x:ripe.x+12,z:ripe.z+12,b:ripe.id};else if(seed)V.go={k:'sow',x:empty.x+12,z:empty.z+12,b:empty.id,id:seed};
      else{/* ruộng lúa nước: khơi nước, gieo mạ (2 thóc giống trong kho), cấy, làm cỏ, gặt */let pd=null;if(typeof l4Pad==='function')for(const b of S.builds){if(b.k!=='paddy'||b.prog!=null||b.remote||Math.hypot(b.x-home.x,b.z-home.z)>800)continue;const op=vthPadOp(b,L);if(op){pd={k:'pad',x:b.x+44,z:b.z+44,b:b.id,op};break;}}if(pd)V.go=pd;else rest(10);}}
    const g=V.go;if(g){tx=g.x;tz=g.z;if(near2(tx,tz,10)){tx=f.x;tz=f.z;pose='gather';const b=BYID.get(g.b);if(b)f._ry=Math.atan2(b.x-f.x,b.z-f.z);if(g.w==null)g.w=G.t+3;else if(G.t>g.w){const c=b&&S.crops[b.id];
          if(g.k==='reap'&&c&&cropStage(c)>=3){const out=c.k==='grain'?{grain:3+Math.floor(Math.random()*3),seedGrain:1+Math.floor(Math.random()*2)}:c.k==='gourd'?{gourd:2,seedGourd:1+Math.floor(Math.random()*2)}:{fiber:5,seedFlax:1};for(const k in out)f._bag[k]=(f._bag[k]||0)+out[k];delete S.crops[b.id];cropShow(b);V.back=1;}
          else if(g.k==='sow'&&b&&!c&&vthTake(vthStores(home),g.id,1)){S.crops[b.id]={k:ITEMS[g.id].crop,p:0};cropShow(b);if(typeof danXp==='function')danXp(f,1);save();}
          else if(g.k==='pad'&&b&&b.k==='paddy'){const op=vthPadOp(b,vthStores(home)),F=l4Pad(b);if(op===g.op){if(op==='water')F.w=1;else if(op==='sow'){if(vthTake(vthStores(home),'seedRice',2)){F.st=1;F.p=0;}}else if(op==='plant'){F.st=3;F.p=0;F.weed=0;}else if(op==='weed')F.weed=0;else if(op==='reap'){F.st=0;F.p=0;F.weed=0;f._bag.riceSheaf=(f._bag.riceSheaf||0)+4;f._bag.seedRice=(f._bag.seedRice||0)+1;V.back=1;}try{l4PadShow(b);}catch(e){}if(typeof danXp==='function')danXp(f,1);save();}}
          V.go=null;}}}}
  else if(f.job==='fish'){f._st='work';if(!V.bk||G.t-V.bkT>60||G.t<V.bkT){V.bk=vthBank(home)||0;V.bkT=G.t;}const k=V.bk;if(!k){rest(15);if(!V.told||G.t-V.told>300){V.told=G.t;uiToast(`🎣 ${f.n}: gần nhà không có sông, hồ để đánh cá.`,'');}}
    else{tx=k.x;tz=k.z;if(near2(tx,tz,8)){tx=f.x;tz=f.z;pose='gather';f._ry=Math.atan2(k.wx-f.x,k.wz-f.z);if(V.fT==null)V.fT=G.t+14+Math.random()*8;else if(G.t>V.fT){V.fT=null;f._bag.fish=(f._bag.fish||0)+1;try{puff(k.wx,2,k.wz,'#bfe3ff',4);}catch(e){}if(bagN()>=3)V.back=1;}}}}
  f._gx=tx;f._gz=tz;const dx=tx-f.x,dz=tz-f.z,d=Math.hypot(dx,dz);if(d>4&&pose!=='sleep'){f.x+=dx/d*Math.min(d,sp*dt);f.z+=dz/d*Math.min(d,sp*dt);f._ry=Math.atan2(dx,dz);pose='walk';f._g=(f._g||0)+dt*1.4;}
  f._o.position.set(f.x,groundY(f.x,f.z,(f._o.position.y||0)+10),f.z);f._o.rotation.y=lerpAng(f._o.rotation.y,f._ry||0,Math.min(1,dt*6));f._o.visible=true;
  if(K3.char2Pose&&f._rig&&Math.hypot(P.x-f.x,P.z-f.z)<800){try{K3.char2Pose(f._rig,pose,pose==='walk'?f._g:G.t+f.seed,{});}catch(e){}}}
{const _ft=folkTick;folkTick=function(dt){if(!S||!S.folk||!S.folk.length)return _ft.apply(this,arguments);const all=S.folk,mine=all.filter(f=>VTH.J[f.job]);if(!mine.length)return _ft.apply(this,arguments);
    S.folk=all.filter(f=>!VTH.J[f.job]);let r;try{r=_ft.apply(this,arguments);}finally{S.folk=all;}for(const f of mine){try{vthTick(f,dt);}catch(e){if(!G._vthE){G._vthE=1;console.warn('việc thêm',e);}}}return r;};}
/* SỔ LÀNG: ghi lại hôm nay người làng mang về kho những gì (xem ở đầu bảng Dân làng) */
function vthLog(){const d=Math.floor(TNOW());if(!S.vlog||S.vlog.d!==d)S.vlog={d,m:{}};return S.vlog;}
{const _sa=slotsAdd;slotsAdd=function(arr,id,n){const left=_sa.apply(this,arguments);try{if(VTH.dep&&S&&ITEMS[id]){const got=n-(left||0);if(got>0){const m=vthLog().m;m[id]=(m[id]||0)+got;}}}catch(e){}return left;};}
{const _ft=folkTick;folkTick=function(){VTH.dep=1;try{return _ft.apply(this,arguments);}finally{VTH.dep=0;}};}
/* NGƯỜI NẤU ĂN GIỮ LỬA: mỗi giờ, bếp đang cháy gần nhà mà còn dưới 4 giờ củi thì lấy gỗ / cành khô trong kho làng tiếp vào (không tự nhóm lại bếp đã tắt) */
{const _fh=folkHourly;folkHourly=function(gh){try{const ck=(S.folk||[]).find(f=>f.job==='cook');if(ck){const home=folkHome(ck),L=vthStores(home);let ch=0;for(const b of S.builds){const d=pieceDef(b.k);if(!d||!d.fuel||b.prog!=null||b.remote||Math.hypot(b.x-home.x,b.z-home.z)>500)continue;const h=S.fuel[b.id]||0;if(h<=0||h>=4)continue;
          if(vthTake(L,'wood',1)){S.fuel[b.id]=Math.min(24,h+4);ch=1;}else if(vthTake(L,'stick',2)){S.fuel[b.id]=Math.min(24,h+2);ch=1;}}if(ch)try{flameSync();}catch(e){}}}catch(e){}return _fh.apply(this,arguments);};}
if(typeof HD_L!=='undefined')HD_L.push({id:'viecthem',ic:'🧑‍🌾',t:'Người làng làm nhiều việc hơn',w:()=>{try{return G.panel==='folk'||(G.panel&&/dan/.test(G.panel)&&S.folk&&S.folk.length>0);}catch(e){return false;}},
  p:['Ngoài hái lượm, đốn gỗ, đào đá, giờ giao được: <b>Thợ xây</b> (tự làm nốt công trường dở, lấy vật liệu trong kho làng), <b>Chăn nuôi</b> (cho vật nuôi ăn, nhặt trứng, vớt cá ao), <b>Đi săn</b> (hạ thú hiền mang thịt da về), <b>Đánh cá</b> (câu ở bờ nước gần nhà).',
   'Bấm vào người làng → <b>Giao việc</b> → chọn việc. Muốn thợ xây làm được thì cắm mốc công trình trước và để sẵn gỗ, đá, sợi cỏ trong giỏ, rương.',
   'Đồ họ kiếm được đều mang về giỏ, rương, chum gần nhất. Đêm họ về chỗ ngủ, sáng lại đi làm.']});
