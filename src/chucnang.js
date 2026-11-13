/* ---------- CÔNG TRÌNH KIỂU MỚI CÓ ĐÚNG CHỨC NĂNG CỦA MÓN CÙNG LOẠI ----------
   Giếng khơi cần vọt, chuồng gà trên cột, chuồng vịt, giàn gà đậu, giá trống đồng, giá cồng chiêng, cột vật tổ chim / rồng trước chỉ để ngắm:
   đứng cạnh bấm Hành động không có gì xảy ra, người chơi tưởng lỗi. Giờ chúng dùng được như giếng, chuồng gà, trống hội, cột vật tổ thường:
   múc/uống nước sạch (và tưới ruộng nhanh như giếng), gà về chuồng đẻ trứng rồi nhặt trứng, đánh trống gọi dân làng, dâng lễ vật tổ. */
const CNG={A:{wellStone:'well',chickenCoop2:'coop',duckHouse:'coop',chickenRoost:'coop',bronzeDrumStand:'drum',gongStand:'drum',totemBird:'totem',totemDragon:'totem'},px:new WeakMap()};
// "bản thay thế" của một công trình: giống hệt, chỉ khác mã loại (k) là món cùng chức năng; ghi gì vào nó là ghi vào công trình thật
function cngProxy(b){let p=CNG.px.get(b);if(!p){const al=CNG.A[b.k];p=new Proxy(b,{get(t,k){return k==='k'?al:k==='_real'?t:t[k];},set(t,k,v){t[k]=v;return true;}});CNG.px.set(b,p);}return p;}
{const _ft=findTarget;findTarget=function(){const r=_ft.apply(this,arguments);try{if(!S||G.work||G.sit||G.ride||G.build)return r;if(r&&(r.type==='animal'||r.type==='foe'||r.type==='npc'||r.type==='pet'||r.type==='drop'||r.type==='boat'||r.type==='mount'||r.type==='folk'))return r;
    let best=null,bd=REACH+10;for(const b of S.builds){const al=CNG.A[b.k];if(!al||b.prog!=null)continue;if(al==='totem'&&b.remote)continue;if(Math.abs((b.y||0)-P.y)>60)continue;const def=pieceDef(b.k),d=Math.hypot(b.x-P.x,b.z-P.z)-(def&&def.fp?Math.max(def.fp[0],def.fp[1])*12:14);if(d<bd){bd=d;best=b;}}
    if(best&&(!r||r.type==='water'||r.d==null||bd<=r.d+2))return {type:'build',b:cngProxy(best),def:Object.assign({},pieceDef(CNG.A[best.k]),{n:pieceDef(best.k).n}),d:bd};}catch(e){}return r;};}
// tên hiển thị đúng món đang đứng cạnh (không phải tên món cùng loại)
{const _ti=targetInfo;targetInfo=function(t){const r=_ti.apply(this,arguments);try{if(r&&t&&t.type==='build'&&t.b&&t.b._real){const d=pieceDef(t.b._real.k);if(d&&r.name){const base=pieceDef(t.b.k);if(base&&r.name.indexOf(base.n)===0)r.name=d.n+r.name.slice(base.n.length);else if(/^Chuồng gà/.test(r.name))r.name=d.n+r.name.slice(9);else if(/^Cột vật tổ/.test(r.name))r.name=d.n+r.name.slice(10);}}}catch(e){}return r;};}
/* Bè, thuyền trong tầm với luôn được ưu tiên hơn "Uống nước", "Hái lượm", "Dấu vết": trước các mục tiêu này chen lên trước (bè thường nằm cách bờ 3-4 bước,
   còn nước, rau cỏ thì ngay dưới chân) nên có chỗ thả bè xong không cách nào bấm "Lên thuyền". */
{const _ft=findTarget;findTarget=function(){const r=_ft.apply(this,arguments);try{if(!S||!S.boats||!S.boats.length||G.ride||G.work||G.sit||G.build)return r;if(r&&r.type!=='water'&&r.type!=='forage'&&r.type!=='track')return r;
    let best=null,bd=REACH+40;for(const b of S.boats){const d=Math.hypot(b.x-P.x,b.z-P.z);if(d<bd){bd=d;best=b;}}if(best)return {type:'boat',b:best,d:bd};}catch(e){}return r;};}
/* ---------- THÚ DỮ SỢ LỬA ----------
   Trước: hổ, sói, gấu vào tận nhà săn người dù bếp đang cháy (chạy thử: hổ quanh quẩn cạnh nhà, cắn chết nhân vật đang dựng rào).
   Giờ: người chơi đứng trong vòng 16 m quanh một bếp lửa / đống lửa ĐANG CHÁY thì thú dữ không chủ động lao vào tấn công.
   Thú đã bị đánh (đang nổi giận) thì vẫn đánh trả. Lửa tắt là hết tác dụng: giữ lửa cháy qua đêm mới an toàn. */
function cngFireSafe(){try{if(G.t-(CNG.fT||-9)<0.8&&G.t>=(CNG.fT||0))return CNG.fS;CNG.fT=G.t;let ok=false;for(const b of S.builds){if(b.prog!=null)continue;const dx=b.x-P.x,dz=b.z-P.z;if(dx>320||dx<-320||dz>320||dz<-320)continue;if(dx*dx+dz*dz>320*320)continue;const fd=pieceDef(b.k);/* chỉ tính bếp, đống lửa thật sự có củi đang cháy (fireLit() coi mọi món không cần củi là "có lửa") */if(fd&&fd.fuel&&(S.fuel[b.id]||0)>0){ok=true;break;}}CNG.fS=ok;return ok;}catch(e){return false;}}
if(typeof l3hostile==='function'){const _lh=l3hostile;l3hostile=function(a,D,d){try{if(a&&!a.angry&&d<700&&cngFireSafe()){if(d<420&&!CNG.fTold&&S.hd){CNG.fTold=1;uiToast('🔥 Thú dữ sợ lửa: bạn đang ở gần bếp lửa cháy nên nó không dám lao vào. Giữ lửa cháy qua đêm để yên thân.','good');}/* tới gần quá thì hoảng, bỏ chạy khỏi vùng lửa (trước: hổ đóng luôn cạnh nhà, người ra khỏi vòng lửa là bị vồ) */if(d<460&&!(a._panic>G.t)&&!(a.tame>0)&&!(a._tfT!=null&&G.t-a._tfT<180))a._panic=G.t+7;/* con đang được thuần thì không hoảng bỏ chạy vì lửa */return false;}}catch(e){}return _lh.apply(this,arguments);};}
/* Tự làm: con thú đang hoảng bỏ chạy thì không còn là mối nguy, khỏi né */
if(typeof aqPred==='function'){const _ap=aqPred;aqPred=function(){const L=_ap.apply(this,arguments);try{return L.filter(o=>!(o.a&&o.a._panic>G.t));}catch(e){return L;}};}
/* ---------- CHUỒNG LỢN, CHUỒNG TRÂU, CHUỒNG DÊ, AO CÁ ----------
   Chuồng: đứng cạnh bấm Hành động để CHO ĂN mọi con vật nuôi cùng loại trong vòng 12 m bằng thức ăn trong túi (rau quả, củ, hạt; mỗi món cho 3 con).
           Vật nuôi có chuồng trong vòng 12 m chịu đói lâu gấp đôi mới bỏ đi.
   Ao cá: mỗi ngày tự sinh khoảng 1,5 con cá (chứa tối đa 6); bấm Hành động để bắt. */
CNG.SHED={pigPen:/^(pig|piglet)$/,buffaloShed:/^(buffalo|calfB)$/,goatShed:/./};CNG.FEED=['tallgrass','fernShoot','berry','banana','yam','taro','wildgrain','paddy','rice','gourd','fiber'];
function cngShedPets(b){const rx=CNG.SHED[b.k];return (S.pets||[]).filter(p=>rx.test(p.k)&&Math.hypot(p.x-b.x,p.z-b.z)<240);}
function cngFeedItem(){for(const id of CNG.FEED)if(ITEMS[id]&&invCount(id)>0)return id;return null;}
{const _ft=findTarget;findTarget=function(){const r=_ft.apply(this,arguments);try{if(!S||G.work||G.sit||G.ride||G.build)return r;if(r&&r.type!=='water'&&r.type!=='res'&&r.type!=='forage'&&r.type!=='track')return r;
    let best=null,bd=REACH+10;for(const b of S.builds){if(b.prog!=null||b.remote||!(CNG.SHED[b.k]||b.k==='fishPond'))continue;const def=pieceDef(b.k),d=Math.hypot(b.x-P.x,b.z-P.z)-(def&&def.fp?Math.max(def.fp[0],def.fp[1])*14:14);if(d<bd){bd=d;best=b;}}
    if(best&&(!r||r.type==='water'||r.d==null||bd<=r.d+2))return {type:'cng',b:best,d:bd};}catch(e){}return r;};}
{const _ti=targetInfo;targetInfo=function(t){if(t&&t.type==='cng'){const b=t.b,d=pieceDef(b.k);if(b.k==='fishPond'){const n=Math.floor((S.tank&&S.tank[b.id])||0);return {name:d.n,verb:n?`Bắt ${n} con cá`:'Chưa có cá (mỗi ngày thêm 1-2 con)',ok:n>0,icon:'fish'};}
      const L=cngShedPets(b),hungry=L.filter(p=>TNOW()-(p.fed||0)>0.4).length,f=cngFeedItem();return {name:d.n+(L.length?' · '+L.length+' con':''),verb:!L.length?'Chưa có vật nuôi ở gần':!hungry?'Vật nuôi đã no':f?`Cho ăn (${ITEMS[f].n.toLowerCase()})`:'Cho ăn',ok:L.length>0&&hungry>0&&!!f,need:L.length&&hungry&&!f?'rau, quả, củ hoặc hạt trong túi':null,icon:f||'tallgrass'};}
    return _ti.apply(this,arguments);};}
{const _as=actStart;actStart=function(t){if(t&&t.type==='cng'&&!G.work){try{const b=t.b;if(b.k==='fishPond'){const n=Math.floor((S.tank&&S.tank[b.id])||0);if(!n){uiToast('Ao chưa có cá. Mỗi ngày ao tự sinh thêm 1-2 con.','');return;}give({fish:n},[b.x,(b.y||P.y)+10,b.z]);S.tank[b.id]-=n;sfx('pick');cnt('cnt','fish',n);save();return;}
        const L=cngShedPets(b).filter(p=>TNOW()-(p.fed||0)>0.4);if(!L.length){uiToast(cngShedPets(b).length?'Vật nuôi ở đây đang no.':'Chưa có vật nuôi nào ở gần chuồng này.','');return;}let fed=0;while(fed<L.length){const f=cngFeedItem();if(!f)break;invTake(f,1);for(let k=0;k<3&&fed<L.length;k++)L[fed++].fed=TNOW();}
        if(!fed){uiToast('Cần rau, quả, củ hoặc hạt trong túi để cho ăn.','bad');sfx('no');return;}sfx('eat');uiToast(`🌾 Đã cho ${fed} con ăn tại ${pieceDef(b.k).n.toLowerCase()}.`,'good');try{uiHotbar();}catch(e){}save();}catch(e){console.warn('chuồng',e);}return;}
    return _as.apply(this,arguments);};}
// ao cá sinh cá theo giờ; vật nuôi có chuồng chịu đói lâu hơn
if(typeof petsHourly==='function'){const _ph=petsHourly;petsHourly=function(gh){try{if(S&&S.builds){if(!S.tank)S.tank={};for(const b of S.builds)if(b.k==='fishPond'&&b.prog==null&&!b.remote)S.tank[b.id]=Math.min(6,(S.tank[b.id]||0)+(gh||1)/24*1.5);
      const day=TNOW();for(const p of S.pets||[]){if(day-(p.fed||0)>2&&day-(p.fed||0)<4.8&&S.builds.some(b=>CNG.SHED[b.k]&&b.prog==null&&CNG.SHED[b.k].test(p.k)&&Math.hypot(b.x-p.x,b.z-p.z)<240))p.fed=Math.max(p.fed||0,day-2.4);}}}catch(e){}return _ph.apply(this,arguments);};}
/* ---------- THUẦN THÚ KHÔNG BỊ CẮN TRẢ ----------
   Trước: cho ăn chỉ làm con thú hiền đúng 30 giây; chưa thuần xong mà hết 30 giây là nó lao vào cắn; với sói thì chỉ con được cho ăn hiền, cả bầy còn lại vẫn vồ
   (người chơi: "khom người cho ăn rồi nhưng thú cắn trả, đánh chết luôn").
   Giờ: · Đang lom khom và trong túi có đúng món nó ăn: thú thuần được (gà rừng, lợn rừng, sói, ngựa…) dè chừng chứ không chủ động tấn công, để mình lại gần.
        · Con đã được cho ăn thì 3 phút sau lần cho ăn gần nhất không tấn công người; cả bầy cùng loài ở gần cũng dịu theo.
        · Mình đánh nó thì hết: nó nổi giận lại như thường và mất tiến độ thuần. */
if(typeof tameFeed==='function'){const _tf=tameFeed;tameFeed=function(a){const t0=a?a.tame||0:0;const r=_tf.apply(this,arguments);try{if(a&&(a.tame||0)>t0||(a&&!a.alive)){a._tfT=G.t;a._panic=0;for(const o of G.animals||[]){if(o===a||!o.alive||o.kind!==a.kind)continue;if(Math.hypot(o.x-a.x,o.z-a.z)<420){o._tfT=G.t;o.angry=false;o.calm=Math.max(o.calm||0,G.t+20);o._panic=0;}}}}catch(e){}return r;};}
if(typeof animalDamage==='function'){const _ad=animalDamage;animalDamage=function(a){try{if(a&&a._tfT!=null&&a.alive){a._tfT=null;if(a.tame>0&&a.tame<0.99){a.tame=0;if(G.t-(CNG.tbT||-99)>5){CNG.tbT=G.t;uiToast('Bạn đánh con thú đang thuần: nó hoảng, mất hết lòng tin.','bad');}}}}catch(e){}return _ad.apply(this,arguments);};}
if(typeof l3hostile==='function'){const _lh=l3hostile;l3hostile=function(a,D,d){try{if(a&&!a.angry){if(a._tfT!=null&&G.t-a._tfT<180&&G.t>=a._tfT)return false;
      if(G.sneak&&d<420&&typeof tameFood==='function'&&((typeof TAME==='object'&&TAME[a.kind])||a.kind==='horse')&&tameFood(a.kind)){if(d<300&&!CNG.tmTold){CNG.tmTold=1;uiToast('🤲 Lom khom và có thức ăn nó thích trong túi: con thú dè chừng, không lao vào. Lại gần bấm Hành động để cho ăn; đứng thẳng dậy là nó có thể tấn công.','');}return false;}}}catch(e){}return _lh.apply(this,arguments);};}
