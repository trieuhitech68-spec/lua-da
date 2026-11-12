// window.claude giả: db trong bộ nhớ (giống Firestore), user, không có room
(()=>{const D=new Map(),L=new Set();const now=Date.now();
  const put=(p,v)=>{D.set(p,JSON.parse(JSON.stringify(v)));L.forEach(f=>{try{f(p)}catch(e){}});};
  window.__db=D;window.__put=put;
  put('world/main',{seed:12345,wv:3});put('world/s2',{seed:777,wv:3});
  for(let i=0;i<150;i++)put('players/a'+i,{look:0,clan:null,req:null,w:12345,lastSeen:now});
  put('players/a_old',{look:0,w:12345,lastSeen:now-9*86400000});
  for(let i=0;i<7;i++)put('players/b'+i,{look:0,clan:null,req:null,w:777,lastSeen:now});
  const coll=p=>p.split('/').slice(0,-1).join('/'),id=p=>p.split('/').pop();
  const snap=p=>({exists:D.has(p),id:id(p),data:()=>D.has(p)?JSON.parse(JSON.stringify(D.get(p))):undefined});
  const doc=p=>({id:id(p),path:p,get:async()=>snap(p),set:async v=>put(p,v),update:async v=>put(p,Object.assign({},D.get(p)||{},v)),delete:async()=>{D.delete(p);L.forEach(f=>f(p));},
    acquire:async()=>({acquired:true}),onSnapshot:(fn)=>{const h=q=>{if(q===p)fn(snap(p));};L.add(h);setTimeout(()=>fn(snap(p)),0);return ()=>L.delete(h);},collection:c=>collection(p+'/'+c)});
  const collection=(c,W=[],lim=1e9)=>{const run=()=>({docs:[...D.keys()].filter(p=>coll(p)===c).sort().map(snap).filter(s=>W.every(([f,o,v])=>s.data()[f]===v)).slice(0,lim)});
    return {where:(f,o,v)=>collection(c,W.concat([[f,o,v]]),lim),limit:n=>collection(c,W,n),orderBy:()=>collection(c,W,lim),get:async()=>run(),doc:i=>doc(c+'/'+i),
      onSnapshot:(fn)=>{const h=q=>{if(coll(q)===c)fn(run());};L.add(h);setTimeout(()=>fn(run()),0);return ()=>L.delete(h);}};};
  const db={doc,collection};const user={profiles:async()=>({}),id:async()=>'me1',can:async()=>true,name:async()=>'Tôi',profile:async()=>({name:'Tôi'})};
  window.claude={use:async k=>k==='db'?db:k==='user'?user:null};})();
