// window.claude giả DÙNG CHUNG cho nhiều trình duyệt: mỗi trang có bản sao dữ liệu, mọi lần ghi được chuyền qua Node (__relay) sang các trang khác (__recv).
// Dữ liệu ban đầu lấy từ window.__SNAP (Node đặt trước mỗi lần tải trang), người chơi lấy từ window.__ME = {uid, name}.
(()=>{const D=new Map(),L=new Set();let ready=false;try{localStorage.setItem('ld-dl','0');localStorage.setItem('ldtt-kt','1');localStorage.setItem('ldtt-news','2026-11-h');localStorage.setItem('ldtt-nohd','1');}catch(e){}
  const load=()=>{if(ready)return;ready=true;for(const [p,v] of (window.__SNAP||[]))D.set(p,v);};
  const fire=p=>L.forEach(f=>{try{f(p)}catch(e){}});
  const put=(p,v,remote)=>{load();if(v===null||v===undefined)D.delete(p);else D.set(p,JSON.parse(JSON.stringify(v)));fire(p);if(!remote&&window.__relay)window.__relay(p,v==null?null:JSON.parse(JSON.stringify(v))).catch(()=>{});};
  window.__db=D;window.__put=put;window.__recv=list=>{for(const [p,v] of list)put(p,v,true);};
  const coll=p=>p.split('/').slice(0,-1).join('/'),id=p=>p.split('/').pop();
  const snap=p=>({exists:D.has(p),id:id(p),data:()=>D.has(p)?JSON.parse(JSON.stringify(D.get(p))):undefined});
  const doc=p=>({id:id(p),path:p,get:async()=>{load();return snap(p)},set:async v=>put(p,v),update:async v=>put(p,Object.assign({},D.get(p)||{},v)),delete:async()=>put(p,null),
    acquire:async()=>({acquired:true}),onSnapshot:(fn)=>{load();const h=q=>{if(q===p)fn(snap(p));};L.add(h);setTimeout(()=>fn(snap(p)),0);return ()=>L.delete(h);},collection:c=>collection(p+'/'+c)});
  const collection=(c,W=[],lim=1e9)=>{const run=()=>{load();return {docs:[...D.keys()].filter(p=>coll(p)===c).sort().map(snap).filter(s=>W.every(([f,o,v])=>{const x=s.data()[f];return o==='>'?x>v:o==='>='?x>=v:o==='<'?x<v:x===v;})).slice(0,lim)};};
    return {where:(f,o,v)=>collection(c,W.concat([[f,o,v]]),lim),limit:n=>collection(c,W,n),orderBy:()=>collection(c,W,lim),get:async()=>run(),doc:i=>doc(c+'/'+i),
      onSnapshot:(fn)=>{const h=q=>{if(coll(q)===c)fn(run());};L.add(h);setTimeout(()=>fn(run()),0);return ()=>L.delete(h);}};};
  const db={doc,collection};const me=()=>window.__ME||{uid:'me1',name:'Tôi'};
  const user={profiles:async ids=>{const o={};for(const i of ids||[]){const n=(window.__NAMES||{})[i];if(n)o[i]={name:n};}return o;},id:async()=>me().uid,can:async()=>true,name:async()=>me().name,profile:async()=>({name:me().name})};
  window.claude={use:async k=>k==='db'?db:k==='user'?user:null};})();
