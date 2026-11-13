/* ---------- ÂM THANH NỀN: suối chảy, lửa tí tách, gió ----------
   - Tới gần sông suối nghe tiếng nước chảy, càng gần càng rõ.
   - Đứng cạnh bếp lửa, đuốc đang cháy nghe tiếng củi nổ tí tách.
   - Trời nổi gió, giông hoặc lên cao nghe tiếng gió rít nhẹ.
   Tất cả là tiếng tổng hợp (không tải tệp), tắt theo nút Âm thanh. */
const AN={w:null,wind:null,t:0,fire:0};
function anLoop(freq,q,type){const c=AU.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=noiseBuf();s.loop=true;f.type=type;f.frequency.value=freq;f.Q.value=q;g.gain.value=0;s.connect(f);f.connect(g);g.connect(AU.master);s.start();return {s,f,g};}
function anSet(o,v){try{o.g.gain.setTargetAtTime(v,AU.ctx.currentTime,0.6);}catch(e){}}
function anTick(){if(typeof G==='undefined'||!G.on||!S||!AU.ctx)return;const on=AU.on&&!G.paused&&!document.hidden;
  if(!AN.w){try{AN.w=anLoop(1100,0.5,'bandpass');AN.wind=anLoop(320,0.8,'lowpass');}catch(e){return;}}
  // nước: dò 3 vòng quanh người
  let wk=0;if(on){let best=1e9;for(const r of [50,120,220])for(let a=0;a<8;a++){const x=P.x+Math.cos(a*0.785)*r,z=P.z+Math.sin(a*0.785)*r;if(wdAt(x,z)>0.4){best=Math.min(best,r);break;}}if(wdAt(P.x,P.z)>0.4)best=0;wk=best<1e9?0.05*(1-best/260):0;}
  anSet(AN.w,wk);
  // gió: theo thời tiết và độ cao
  let vk=0;if(on){const wx=S.wx&&S.wx.type,k=(G.wxK||0);vk=(wx==='storm'?0.05:wx==='rain'?0.02:wx==='wind'?0.04:0)*k+clamp((P.y-260)/900,0,1)*0.03;}
  anSet(AN.wind,vk);
  // lửa: có bếp, đuốc đang cháy trong 200
  AN.fire=0;if(on){for(const b of S.builds){if(b.prog!=null)continue;const d=Math.hypot(b.x-P.x,b.z-P.z);if(d>200)continue;let lit=false;try{const fd=pieceDef(b.k);lit=!!(fd&&fd.fuel&&(S.fuel[b.id]||0)>0);}catch(e){}if(lit){AN.fire=Math.max(AN.fire,1-d/200);}}}}
function anCrackle(){try{if(!AN.fire||!AU.on||!AU.ctx)return;const c=AU.ctx,t=c.currentTime,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=noiseBuf();f.type='highpass';f.frequency.value=1800+Math.random()*2500;const v=0.05*AN.fire*(0.4+Math.random()*0.6),d=0.012+Math.random()*0.03;
    g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.0001,t+d);s.connect(f);f.connect(g);g.connect(AU.master);s.start(t,Math.random()*0.9,d+0.01);}catch(e){}}
setInterval(()=>{try{anTick();}catch(e){}},600);
(function loop(){setTimeout(loop,90+Math.random()*320);if(Math.random()<0.8)anCrackle();})();
