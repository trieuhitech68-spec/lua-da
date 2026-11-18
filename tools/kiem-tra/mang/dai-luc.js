// Chơi chung trên MÁY CHỦ ĐẠI LỤC (giả lập): nhân vật tạo trên máy chủ có dl:1 thì lên đại lục, nằm trong một tỉnh; lãnh thổ ghi kèm mã tỉnh;
// lãnh thổ của người ở tỉnh khác không có hiệu lực ở đây, của người cùng tỉnh thì có; công trình chia sẻ ghi theo tỉnh.
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await c.addInitScript(fs.readFileSync(require('path').join(__dirname,'mock.js'),'utf8').replace("put('world/main',{seed:12345,wv:3});put('world/s2',{seed:777,wv:3});","put('world/main',{seed:12345,wv:3,dl:1});").replace(/for\(let i=0;i<150;i\+\+\)/,"for(let i=0;i<3;i++)"));
  const p=await c.newPage();const logs=[];p.on('pageerror',e=>logs.push('ERR '+e.message+' '+(e.stack||'').slice(0,300)));
  await p.goto('file://'+require('path').resolve(__dirname,'../../../index.html'));await p.waitForTimeout(6000);
  const click=async t=>{await p.evaluate(t=>{const b=[...document.querySelectorAll('button')].filter(b=>b.offsetParent).find(b=>b.innerText.includes(t));b&&b.click()},t);await p.waitForTimeout(1500)};
  await click('Tạo nhân vật mới');await p.waitForTimeout(2500);await click('Bắt đầu');await p.waitForFunction(()=>typeof G==='object'&&G.on&&P.model&&G.animals&&G.animals.length,null,{timeout:240000});await p.waitForTimeout(9000);
  const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const o={mp:!!S.mp,dl:!!S.dl,on:DL.on,land:S.land,seed0:S.seed0,seed:S.seed,srv:S.srv,started:MP.started,h:Math.round(hAt(P.x,P.z))};
    // tìm chỗ cắm mốc hợp lệ quanh đây
    let sp=null;for(let r0=700;r0<3000&&!sp;r0+=200)for(let i=0;i<12&&!sp;i++){const a=i/12*6.283,x=SPAWN[0]+Math.cos(a)*r0,z=SPAWN[1]+Math.sin(a)*r0;if(hAt(x,z)>4&&wdAt(x,z)<=0&&!mpClaimWhy(x,z,mpClaimR(),'claim'))sp=[x,z];}o.sp=!!sp;if(!sp)return o;P.x=sp[0];P.z=sp[1];P.y=hAt(P.x,P.z);
    mpClaim(false);await W(1500);const d=__db.get('claims/me1');o.claimL=d&&d.l;o.claimW=d&&d.w;o.mine=!!MP.claims.me1;
    // người khác: một người cùng tỉnh, một người ở tỉnh khác, cùng toạ độ
    __put('claims/b1',{x:Math.round(P.x+900),z:Math.round(P.z),r:200,clan:null,at:1,w:S.seed0,l:S.land});__put('claims/b2',{x:Math.round(P.x-900),z:Math.round(P.z),r:200,clan:null,at:1,w:S.seed0,l:'qzz'});__put('claims/b3',{x:Math.round(P.x),z:Math.round(P.z+900),r:200,clan:null,at:1,w:S.seed0});await W(1500);
    o.same=!!MP.claims.b1;o.other=!!MP.claims.b2;o.centre=!!MP.claims.b3;o.pop=JSON.stringify(MP.landPop);o.blockSame=!!mpLandWhy(P.x+900,P.z);o.blockOther=!!mpLandWhy(P.x-900,P.z);
    __put('players/b1',{look:0,clan:null,req:null,w:S.seed0,lastSeen:Date.now(),fl:{[S.land]:[Math.round(P.x+3200),Math.round(P.z+2600),80]}});await W(1200);uiOpen('map',{});await W(1200);try{dlMapDraw();const cv=document.getElementById('dlmap'),d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]>240&&d[i+1]>130&&d[i+1]<175&&d[i+2]<90)n++;o.mapDots=n;}catch(e){o.mapErr=String(e);}uiClose();o.path=mpBPath('me1');o.enc=(()=>{let n=9700;const bq={id:n,k:'campfire',x:Math.round(P.x/CELL)*CELL+20,y:0,z:Math.round(P.z/CELL)*CELL+20,r:0,lv:0};bq.y=hAt(bq.x,bq.z);S.builds.push(bq);structAdd(bq,true);S.builds.push({id:9701,k:'campfire',x:WSIZE,y:0,z:0,r:0,lv:0});return mpEncodeMine().n;})();return o;});
  console.log(JSON.stringify(r));if(logs.length)console.log(logs.slice(0,5).join('\n'));
  const ok=r.mp&&r.dl&&r.on&&/^q[a-z0-9]{2,4}$/.test(r.land||'')&&r.seed0===12345&&r.seed!==12345&&r.h>3&&r.sp&&r.claimL===r.land&&r.claimW===12345&&r.mine&&r.same&&!r.other&&!r.centre&&r.blockSame&&!r.blockOther&&r.path==='builds/me1/L/'+r.land&&r.enc===1&&r.mapDots>3&&!logs.length;
  console.log(ok?'MDL-DAT':'MDL-HONG');await b.close();})();
