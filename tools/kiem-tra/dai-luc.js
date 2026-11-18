// Đại lục liền (đợt 1, lõi địa hình): mảnh dựng nhanh, mặt đất liền qua mép mảnh, lục địa đủ rộng, có đồng bằng - núi - sông - biển.
const {DL,dlBase,dlTile,dlH,dlInit}=require(require('path').resolve(__dirname,'../../src/dailuc.js'));dlInit(12345);
let t0=process.hrtime.bigint();for(let i=0;i<25;i++)dlTile(i%5,Math.floor(i/5));const ms=Number(process.hrtime.bigint()-t0)/1e6/25;
// liền mép: độ cao ngay hai bên mép mảnh
let gap=0;for(let k=0;k<400;k++){const z=Math.random()*9000,x=DL.TS*2;gap=Math.max(gap,Math.abs(dlH(x-0.01,z)-dlH(x+0.01,z)));}
// thống kê toàn lục địa
let n=0,sea=0,riv=0,mtn=0,snow=0,mx=0,flat=0;const st=300;for(let x=-66000;x<=66000;x+=st)for(let z=-66000;z<=66000;z+=st){const h=dlBase(x,z),r=Math.hypot(x,z)/DL.R;n++;if(h<0){if(r<0.6)riv++;else sea++;}else{if(h>230)mtn++;if(h>760)snow++;if(h<70)flat++;if(h>mx)mx=h;}}
const land=n-sea-riv,km2=land*st*st/400/1e6;const o={msMoiManh:+ms.toFixed(2),hoMep:+gap.toFixed(3),bien:Math.round(sea/n*100)+'%',datLien_km2:+(land*st*st/400/1e6).toFixed(1),nuocNoiDia:Math.round(riv/(land+riv)*100)+'%',dongBang:Math.round(flat/land*100)+'%',nui:Math.round(mtn/land*100)+'%',tuyet:(snow/land*100).toFixed(1)+'%',dinh:Math.round(mx)};console.log(JSON.stringify(o));const ok=ms<25&&gap<0.05&&km2>12&&km2<40&&mx>900&&riv/(land+riv)>0.02&&flat/land>0.5&&mtn/land>0.03;console.log(ok?'DL-DAT':'DL-HONG');
