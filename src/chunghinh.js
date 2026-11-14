/* ---------- THÚ CÙNG LOÀI DÙNG CHUNG MỘT BỘ HÌNH ----------
   Đo thấy: hơn 300 con thú trên bản đồ, mỗi con tự dựng riêng một bộ hình (đỉnh, tam giác) dù các con cùng loài giống hệt nhau từng điểm
   → khoảng 65 MB bộ nhớ máy + chừng ấy nữa trên card hình, và vào game phải dựng hình hàng trăm lần.
   Giờ mỗi loài chỉ dựng MỘT bộ hình mẫu; các con còn lại là bản sao khung xương dùng chung hình và chất liệu của mẫu (chất liệu vốn đã dùng chung từ trước).
   Loài nào có dữ liệu riêng gắn vào hình mà không sao chép an toàn được (ví dụ khỉ có bộ dáng điệu riêng) thì vẫn dựng như cũ. */
const CHH={proto:new Map(),bad:new Set(),n:0};
function chhPlain(v,d){if(v==null)return true;const t=typeof v;if(t==='function')return false;if(t!=='object')return true;if(v.isObject3D)return true;if(d>3)return false;if(Array.isArray(v))return v.every(x=>chhPlain(x,d+1));if(typeof v.clone==='function'&&(v.isVector3||v.isVector2||v.isQuaternion||v.isEuler||v.isColor))return true;const p=Object.getPrototypeOf(v);if(p!==Object.prototype&&p!==null)return false;for(const k in v)if(!chhPlain(v[k],d+1))return false;return true;}
function chhOk(src){let ok=true;src.traverse(o=>{if(!ok)return;if(o.isSkinnedMesh||o.isInstancedMesh||o.isBone){ok=false;return;}for(const k in o.userData)if(!chhPlain(o.userData[k],0)){ok=false;return;}});return ok;}
function chhClone(src){const map=new Map(),rec=s=>{const ud=s.userData;s.userData={};let d;try{d=s.clone(false);}finally{s.userData=ud;}map.set(s,d);for(const c of s.children)d.add(rec(c));return d;},out=rec(src);
  const re=(v,d)=>{if(v==null||typeof v!=='object')return v;if(v.isObject3D)return map.get(v)||v;if(Array.isArray(v))return v.map(x=>re(x,d+1));if(typeof v.clone==='function')return v.clone();const o={};for(const k in v)o[k]=re(v[k],d+1);return o;};
  map.forEach((d,s)=>{for(const k in s.userData)d.userData[k]=re(s.userData[k],0);});return out;}
{const _am=animalModel;animalModel=function(kind){if(arguments.length!==1||typeof kind!=='string'||CHH.bad.has(kind))return _am.apply(this,arguments);
    try{let p=CHH.proto.get(kind);if(!p){p=_am.apply(this,arguments);if(!p||!p.isObject3D||!chhOk(p)){CHH.bad.add(kind);return p;}CHH.proto.set(kind,p);}CHH.n++;return chhClone(p);}catch(e){CHH.bad.add(kind);console.warn('chung hình',kind,e);return _am.apply(this,arguments);}};}
