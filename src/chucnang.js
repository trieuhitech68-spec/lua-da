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
