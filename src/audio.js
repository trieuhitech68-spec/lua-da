/* ===================== ÂM THANH TỔNG HỢP (không cần tệp âm thanh) ===================== */
const AU={ctx:null,on:true,master:null,rain:null};
function auInit(){if(AU.ctx)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;AU.ctx=new C();AU.master=AU.ctx.createGain();AU.master.gain.value=0.5;AU.master.connect(AU.ctx.destination);}catch(e){AU.ctx=null;}}
function noiseBuf(){if(AU.nb)return AU.nb;const c=AU.ctx,b=c.createBuffer(1,c.sampleRate*1,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;AU.nb=b;return b;}
function tone(f,dur,type,vol,slide,delay){const c=AU.ctx,t=c.currentTime+(delay||0),o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,f*slide),t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||0.2,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(AU.master);o.start(t);o.stop(t+dur+0.02);}
function noise(dur,freq,q,vol,delay,type){const c=AU.ctx,t=c.currentTime+(delay||0),s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=noiseBuf();f.type=type||'bandpass';f.frequency.value=freq;f.Q.value=q||1;
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||0.2,t+0.008);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(f);f.connect(g);g.connect(AU.master);s.start(t,Math.random()*0.5);s.stop(t+dur+0.02);}
function sfx(k){if(!AU.on)return;auInit();if(!AU.ctx)return;if(AU.ctx.state==='suspended')AU.ctx.resume();try{
  switch(k){case 'chop':noise(0.09,900,1.4,0.35);tone(140,0.12,'triangle',0.25,0.6);break;
    case 'mine':tone(1300,0.08,'square',0.08,0.5);noise(0.07,2600,2,0.22);tone(220,0.1,'triangle',0.18,0.7);break;
    case 'pick':tone(520,0.07,'sine',0.14,1.6);break;
    case 'craft':tone(440,0.08,'triangle',0.16);tone(660,0.1,'triangle',0.14,1,0.08);break;
    case 'build':noise(0.12,300,1,0.3);tone(110,0.16,'triangle',0.25,0.7);noise(0.08,500,1,0.2,0.12);break;
    case 'eat':noise(0.05,1800,3,0.18);noise(0.05,1500,3,0.15,0.09);break;
    case 'drink':for(let i=0;i<3;i++)tone(300+i*40,0.08,'sine',0.12,1.8,i*0.1);break;
    case 'level':[523,659,784,1046].forEach((f,i)=>tone(f,0.16,'triangle',0.13,1,i*0.08));break;
    case 'idea':tone(880,0.12,'sine',0.12);tone(1320,0.18,'sine',0.1,1,0.1);break;
    case 'no':tone(200,0.14,'square',0.08,0.7);break;
    case 'fall':noise(0.9,400,0.7,0.18);break;
    case 'thud':tone(70,0.35,'sine',0.4,0.5);noise(0.3,200,0.8,0.3);break;
    case 'hurt':tone(260,0.18,'sawtooth',0.12,0.5);break;
    case 'hit':noise(0.06,1100,2,0.3);tone(180,0.08,'square',0.1,0.6);break;
    case 'jump':tone(300,0.12,'sine',0.08,1.6);break;
    case 'step':noise(0.05,400,1,0.08);break;
    case 'chirp':{const b=2400+Math.random()*1400;tone(b,0.07,'sine',0.035,1.35);tone(b*1.15,0.06,'sine',0.03,0.8,0.09);if(Math.random()<0.5)tone(b*1.2,0.05,'sine',0.028,1.3,0.2);break;}
    case 'cricket':for(let i=0;i<4;i++)tone(4300+Math.random()*200,0.025,'triangle',0.012,1,i*0.045);break;
    case 'croak':tone(140,0.12,'square',0.05,0.8);tone(120,0.14,'square',0.05,0.8,0.16);break;
    case 'bark':tone(420,0.08,'sawtooth',0.12,0.6);tone(380,0.1,'sawtooth',0.1,0.6,0.16);break;
    case 'buzz':tone(210,0.5,'sawtooth',0.018,1.04);break;
    case 'whine':tone(620,0.6,'sine',0.012,1.08);break;
    case 'bow':noise(0.08,2400,3,0.2);tone(160,0.12,'triangle',0.15,0.6);break;
    case 'thunder':noise(1.6,90,0.5,0.6);noise(0.4,300,0.7,0.3,0.05);break;}}catch(e){}}
// tiếng mưa liên tục theo cường độ
function ambRain(k){if(!AU.on||!AU.ctx)return;try{if(!AU.rain){const c=AU.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=noiseBuf();s.loop=true;f.type='lowpass';f.frequency.value=1400;g.gain.value=0;s.connect(f);f.connect(g);g.connect(AU.master);s.start();AU.rain=g;}
  AU.rain.gain.value+=(k*0.16-AU.rain.gain.value)*0.05;}catch(e){}}
// âm thanh môi trường: chim hót ban ngày, dế kêu đêm hè thu
function ambTick(dt){if(!AU.on||!AU.ctx||typeof S==='undefined'||!S)return;AU.amb=(AU.amb||3)-dt;if(AU.amb>0)return;const si=seasonIdx(),rain=(G.wxK||0)>0.4;
  if(!isNight()&&!rain&&si!==3){sfx('chirp');AU.amb=3+Math.random()*7;}else if(isNight()&&!rain&&(si===1||si===2)){sfx('cricket');AU.amb=0.7+Math.random()*1.6;}else AU.amb=4;}
