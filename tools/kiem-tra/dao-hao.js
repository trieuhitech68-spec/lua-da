// Đào hào, đào hố: mặt đất lún thật, dụng cụ quyết định độ sâu, địa hình quyết định đào được hay không, lấp lại được, kẻ địch qua hào bị chậm. Chạy: node dao-hao.js [html]
const {chromium}=require('playwright');const HTML=process.argv[2]||require('path').resolve(__dirname,'../../index.html');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:400,height:240}});const logs=[];
await c.addInitScript(()=>{try{localStorage.setItem('ldtt-news','2026-11-g');localStorage.setItem('ldtt-nohd','1');localStorage.setItem('ld-dl','0')}catch(e){}});const p=await c.newPage();p.on('pageerror',e=>logs.push('ERR '+e.message));p.on('console',m=>{if(m.type()==='warning'&&/đào|lấp/.test(m.text()))logs.push('WARN '+m.text().slice(0,200));});
await p.goto('file://'+HTML);await p.waitForTimeout(5000);
const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
await click('Tạo nhân vật mới');await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&G.animals&&G.animals.length&&P.model,null,{timeout:240000});await p.waitForTimeout(2500);
const r=await p.evaluate(()=>{const o={};needGate=()=>'';const clr=()=>{for(let i=0;i<S.inv.length;i++)S.inv[i]=null;};
  // tìm bãi đất mềm, phẳng, không cây, không nước
  const find=(want)=>{for(let r=200;r<5000;r+=90)for(let a=0;a<16;a++){const x=SPAWN[0]+Math.cos(a/16*6.283)*r,z=SPAWN[1]+Math.sin(a/16*6.283)*r;if(!wIn(x,z,0.9)||wdAt(x,z)>0||hAt(x,z)<4)continue;P.x=x;P.z=z;P.ry=0;const [sx,sz]=daoSpot(30);if(wdAt(sx,sz)>0||daoHard(sx,sz)!==want||nearWater(sx,sz,90))continue;if(want===0&&slopeAt(sx,sz)>0.2)continue;let bad=false;for(const i of near(sx,sz,80)){const q=RES[i];if(q.st===0&&RT[q.t].tool==='axe')bad=true;}for(const bb of S.builds)if(Math.hypot(bb.x-sx,bb.z-sz)<120)bad=true;if(!bad)return [x,z,sx,sz];}return null;};
  const s0=find(0);o.soft=!!s0;if(!s0)return o;const [x,z,sx,sz]=s0;
  // không dụng cụ → không đào được; có gậy đào → đào 1 lớp
  clr();o.noTool=!!daoCheck('hao');invAdd('digStick',1);o.ok1=daoCheck('hao');const h0=hAt(sx,sz);daoDone('hao',sx,sz,0);o.d1=+(h0-hAt(sx,sz)).toFixed(1);o.n1=S.dig.length;o.edge=+(h0-hAt(sx+75,sz)).toFixed(1);o.at=+daoAt(sx,sz).toFixed(1);
  // gậy đào không đào sâu thêm được; có cuốc đá thì sâu 2 lớp; cuốc chim sắt 3 lớp
  o.deepNo=!!daoCheck('hao');invAdd('pick',1);o.ok2=daoCheck('hao');daoDone('hao',sx,sz,0);o.d2=+(h0-hAt(sx,sz)).toFixed(1);o.n2=S.dig.length;o.deepNo2=!!daoCheck('hao');if(ITEMS.pickIron){invAdd('pickIron',1);o.ok3=daoCheck('hao');daoDone('hao',sx,sz,0);o.d3=+(h0-hAt(sx,sz)).toFixed(1);o.deepNo3=!!daoCheck('hao');}
  // kẻ địch trong hào bị chậm
  o.slow=daoAt(sx,sz)>DAO.L*0.6;
  // lấp lại: mặt đất về như cũ
  {const g=S.dig[0];daoApply(g,-1);S.dig.splice(0,1);o.fill=+Math.abs(hAt(sx,sz)-h0).toFixed(2);}
  // địa hình: đất lẫn đá cần cuốc đá; núi đá cứng cần cuốc chim sắt
  const s1=find(1);o.mid=!!s1;if(s1){clr();invAdd('digStick',1);o.midStick=daoCheck('hao')||'';invAdd('pick',1);o.midPick=daoCheck('hao');}
  const s2=find(2);o.hardFound=!!s2;if(s2){clr();invAdd('digStick',1);invAdd('pick',1);o.hardPick=daoCheck('hao')||'';if(ITEMS.pickIron){invAdd('pickIron',1);o.hardIron=daoCheck('hao');}}
  // bảng Xây có khung Đào và nút công cụ
  uiOpen('build',{});const body=document.querySelector('#panel .p-body');o.box=!!body.querySelector('[data-a="dao"]');o.tool=!!body.querySelector('[data-a="ui6tool"][data-k="dao"]');uiClose();return o;});
console.log(JSON.stringify(r));if(logs.length)console.log(logs.slice(0,5).join('\n'));
const ok=r.soft&&r.noTool&&r.ok1===null&&r.d1>12&&r.d1<17&&r.n1===1&&Math.abs(r.edge)<1.5&&r.at>12&&r.deepNo&&r.ok2===null&&r.d2>23&&r.n2===1&&r.deepNo2&&(r.d3===undefined||(r.ok3===null&&r.d3>35&&r.deepNo3))&&r.slow&&r.fill<0.2&&(!r.mid||(/Cuốc đá/.test(r.midStick)&&r.midPick===null))&&(!r.hardFound||(/Cuốc chim sắt/.test(r.hardPick)&&(r.hardIron===undefined||r.hardIron===null)))&&r.box&&r.tool&&!logs.length;
console.log(ok?'DAO-DAT':'DAO-HONG');await b.close();})();
