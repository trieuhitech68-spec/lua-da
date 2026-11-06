/* ===================== NÓI CHUYỆN BẰNG GIỌNG (MICRÔ) · THẾ GIỚI CHUNG =====================
   WebRTC ngang hàng, chỉ âm thanh. Báo hiệu (offer/answer/ICE) đi qua room.emit chủ đề 'vc' của mp.js, mỗi tin ghi người nhận {to:peer}.
   Người có mã peer nhỏ hơn gọi trước (tránh hai bên cùng gọi); bên kia muốn nối thì gửi 'rq' nhờ gọi.
   Gần (≤ VC_R) thì nối, xa quá VC_DROP thì ngắt; tối đa VC_MAX người; tiếng nhỏ dần theo khoảng cách.
   Tỷ lệ: người cao ~44 đơn vị, cài đặt tính 20 đơn vị = 1 m → nghe rõ trong ~3 m, nhỏ dần tới VC_R=300 (~15 m).
   "Kênh bộ tộc": người cùng bộ tộc nghe nhau ở mọi khoảng cách (bên bật kênh nghe to; vẫn tính chung giới hạn 6 người).
   Chế độ: off · ptt (nhấn giữ để nói, mặc định) · open (luôn bật). Micrô chỉ xin quyền khi bạn bật nói lần đầu.
   Chỉ STUN công cộng, không TURN: vài mạng (4G nhà mạng, wifi công ty) sẽ không nối được — báo nhẹ một lần.
   Thiếu getUserMedia/RTCPeerConnection/AudioContext: lặng lẽ bỏ qua. Tin nghe được là dữ liệu không tin cậy: kiểm kiểu, giới hạn độ dài.
   Lưu cài đặt ở 'ldtt-voice' {m,spk,clan}. Ẩn trang / tắt / đổi nhân vật (tải lại trang): đóng mọi kết nối, nhả micrô. */
const VC_R=300,VC_DROP=400,VC_FULL=60,VC_MAX=6,VC_ICE=[{urls:'stun:stun.l.google.com:19302'}],VCK='ldtt-voice',VC_CH=2800;
const VC={mode:'ptt',spk:true,clan:false,st:null,trk:null,src:null,an:null,buf:null,lvl:0,talk:false,mute:false,asking:null,had:0,denied:0,denT:0,
  peers:new Map(),back:new Map(),rqT:new Map(),parts:new Map(),warn:{},t:0,tf:0,tp:0,tex:null,volOk:null};
const vcRtc=()=>typeof RTCPeerConnection==='function';
const vcGum=()=>!!(navigator.mediaDevices&&typeof navigator.mediaDevices.getUserMedia==='function');
const vcBlk=u=>typeof SET!=='undefined'&&SET.blocked&&!!SET.blocked[u];
const vcSid=()=>Math.random().toString(36).slice(2,10);
(function vcLoad(){try{const o=JSON.parse(localStorage.getItem(VCK)||'null');if(o&&typeof o==='object'){if(['off','ptt','open'].includes(o.m))VC.mode=o.m;VC.spk=o.spk!==false;VC.clan=!!o.clan;}}catch(e){}})();
function vcSave(){try{localStorage.setItem(VCK,JSON.stringify({m:VC.mode,spk:VC.spk,clan:VC.clan}));}catch(e){}}
function vcWarn(k,t,bad){if(VC.warn[k])return;VC.warn[k]=1;try{uiToast(t,bad?'bad':'');}catch(e){}}
function vcHere(){return typeof mpOn==='function'&&mpOn()&&!!MP.room;}
function vcActive(){return VC.mode!=='off'&&vcRtc()&&vcHere()&&!!MP.myPeer&&!document.hidden;}
function vcSending(){return !!VC.trk&&(VC.mode==='open'?!VC.mute:VC.mode==='ptt'&&VC.talk);}
/* ---------- micrô ---------- */
function vcMic(){if(VC.trk&&VC.trk.readyState==='live')return Promise.resolve(VC.trk);if(VC.asking)return VC.asking;
  if(!vcGum()){vcWarn('gum','🎙️ Trình duyệt này không cho dùng micrô.',1);return Promise.resolve(null);}
  if(VC.denied&&performance.now()-VC.denT<6000)return Promise.resolve(null);
  VC.asking=(async()=>{await null;try{const st=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
      const tr=st.getAudioTracks()[0];if(!tr||VC.mode==='off'||document.hidden){st.getTracks().forEach(t=>t.stop());return null;}
      VC.st=st;VC.trk=tr;VC.had=1;VC.denied=0;tr.enabled=vcSending();tr.onended=()=>{if(VC.trk===tr)vcMicStop();};
      try{auInit();if(AU.ctx){const s=AU.ctx.createMediaStreamSource(st),a=AU.ctx.createAnalyser();a.fftSize=256;s.connect(a);VC.src=s;VC.an=a;}}catch(e){}
      for(const p of VC.peers.values())vcAttach(p);return tr;}
    catch(e){const n=e&&e.name;if(n==='NotAllowedError'||n==='SecurityError'){VC.denied=1;VC.denT=performance.now();try{uiToast('🎙️ Chưa được dùng micrô. Hãy cho phép micrô cho trang này trong cài đặt trình duyệt.','bad');}catch(er){}}
      else vcWarn('nomic',n==='NotFoundError'?'🎙️ Không tìm thấy micrô trên máy.':'🎙️ Chưa mở được micrô.',1);return null;}
    finally{VC.asking=null;vcUi();}})();return VC.asking;}
function vcMicStop(){if(VC.st)VC.st.getTracks().forEach(t=>{try{t.stop();}catch(e){}});try{if(VC.src)VC.src.disconnect();}catch(e){}VC.st=VC.trk=VC.src=VC.an=null;VC.lvl=0;VC.talk=false;
  for(const p of VC.peers.values())vcAttach(p);vcUi();}
function vcAttach(p){if(p.tr&&p.tr.sender)p.tr.sender.replaceTrack(VC.trk||null).catch(()=>{});}
function vcSendState(){if(VC.trk)VC.trk.enabled=vcSending();vcUi();}
/* ---------- kết nối ngang hàng ---------- */
function vcSend(to,o){return typeof mpEmit==='function'?mpEmit('vc',Object.assign({to},o)):Promise.resolve(false);}
function vcSdp(p,k,sdp){const n=Math.ceil(sdp.length/VC_CH);if(n>6){vcClose(p,true);return;}for(let i=0;i<n;i++)vcSend(p.peer,{k,s:p.sid,i,n,d:sdp.slice(i*VC_CH,(i+1)*VC_CH),cc:VC.clan?1:0});}
function vcIceFlush(p){p.cT=0;if(VC.peers.get(p.peer)!==p)return;while(p.cq.length){const b=[];let len=0;while(p.cq.length&&b.length<20&&len+p.cq[0][0].length<3000){const c=p.cq.shift();len+=c[0].length+20;b.push(c);}
    if(!b.length){p.cq.shift();continue;}vcSend(p.peer,{k:'ic',s:p.sid,c:b});}}
function vcPc(r,sid,init){const pc=new RTCPeerConnection({iceServers:VC_ICE});
  const p={peer:r.peer,uid:r.uid,sid,pc,init,tr:null,at:performance.now(),ok:false,rd:0,rq:[],cq:[],cT:0,lvl:0,rc:0,el:null,ms:null,g:null,an:null,src:null,sp:null,dT:0};VC.peers.set(r.peer,p);
  pc.onicecandidate=e=>{const c=e.candidate;if(!c||!c.candidate||VC.peers.get(p.peer)!==p)return;p.cq.push([c.candidate,c.sdpMid,c.sdpMLineIndex]);if(!p.cT)p.cT=setTimeout(()=>vcIceFlush(p),250);};
  pc.ontrack=e=>vcPlay(p,e.streams&&e.streams[0]||new MediaStream([e.track]));
  pc.oniceconnectionstatechange=()=>{const s=pc.iceConnectionState;if(s==='connected'||s==='completed'){p.ok=true;p.dT=0;vcUi();}else if(s==='failed')vcFail(p);else if(s==='disconnected')p.dT=performance.now();};
  return p;}
async function vcCall(r){let p;try{p=vcPc(r,vcSid(),true);p.tr=p.pc.addTransceiver('audio',{direction:'sendrecv'});vcAttach(p);
    const o=await p.pc.createOffer();await p.pc.setLocalDescription(o);if(VC.peers.get(r.peer)!==p)return;vcSdp(p,'of',p.pc.localDescription.sdp);}
  catch(e){if(p)vcClose(p,false);VC.back.set(r.peer,performance.now()+60000);}}
async function vcOnOffer(r,sid,sdp,cc){const old=VC.peers.get(r.peer),o=vcCand(r);
  if(!vcActive()||!(r.peer<MP.myPeer)||!o||!(o.d<VC_DROP||o.cl)||(VC.peers.size-(old?1:0))>=VC_MAX){vcSend(r.peer,{k:'no',s:sid});return;}
  if(old)vcClose(old,false);let p;
  try{p=vcPc(r,sid,false);p.rc=cc?1:0;await p.pc.setRemoteDescription({type:'offer',sdp});vcRd(p);const tr=p.pc.getTransceivers()[0];if(tr){tr.direction='sendrecv';p.tr=tr;vcAttach(p);}
    const a=await p.pc.createAnswer();await p.pc.setLocalDescription(a);if(VC.peers.get(r.peer)!==p)return;vcSdp(p,'an',p.pc.localDescription.sdp);}
  catch(e){if(p)vcClose(p,true);}}
function vcRd(p){p.rd=1;for(const c of p.rq.splice(0))p.pc.addIceCandidate(c).catch(()=>{});}
function vcFail(p){vcClose(p,true);VC.back.set(p.peer,performance.now()+60000);vcWarn('net','🎙️ Không nối được giọng nói với một số người (mạng chặn). Vẫn chơi bình thường.');}
function vcClose(p,bye){if(VC.peers.get(p.peer)===p)VC.peers.delete(p.peer);clearTimeout(p.cT);try{p.pc.close();}catch(e){}
  try{if(p.el){p.el.pause();p.el.srcObject=null;}}catch(e){}try{if(p.src)p.src.disconnect();if(p.g)p.g.disconnect();}catch(e){}
  if(p.sp){try{G.sc.remove(p.sp);p.sp.material.dispose();}catch(e){}p.sp=null;}if(bye)vcSend(p.peer,{k:'bye',s:p.sid});vcUi();}
function vcCloseAll(bye){for(const p of [...VC.peers.values()])vcClose(p,bye);VC.parts.clear();}
// phát tiếng: thẻ <audio> (để trình duyệt khử vang) + nhánh WebAudio chỉ để đo mức; máy không chỉnh được volume (iOS) thì phát qua GainNode
function vcPlay(p,ms){if(p.ms===ms)return;p.ms=ms;try{const el=p.el||(p.el=document.createElement('audio'));el.autoplay=true;el.setAttribute('playsinline','');el.srcObject=ms;
    if(VC.volOk==null){try{el.volume=0.5;VC.volOk=Math.abs(el.volume-0.5)<0.01;el.volume=1;}catch(e){VC.volOk=false;}}
    try{auInit();const C=AU.ctx;if(C){const s=C.createMediaStreamSource(ms),an=C.createAnalyser();an.fftSize=256;s.connect(an);p.src=s;p.an=an;
        if(!VC.volOk){const g=C.createGain();g.gain.value=0;s.connect(g);g.connect(C.destination);p.g=g;}}}catch(e){}
    el.muted=!!p.g;el.volume=0;el.play().catch(()=>{});}catch(e){}}
/* ---------- nghe tin báo hiệu ---------- */
function vcHear(m){if(!m||m.isMe||!m.data||typeof m.data!=='object'||!vcHere())return;const d=m.data;if(!MP.myPeer||d.to!==MP.myPeer||typeof m.peer!=='string'||!mpIdOk(m.by))return;
  const r=MP.rp.get(m.peer);if(!r||r.uid!==m.by||vcBlk(m.by))return;const sid=typeof d.s==='string'&&/^[a-z0-9]{1,16}$/.test(d.s)?d.s:null,p=VC.peers.get(m.peer),now=performance.now();
  if(d.k==='rq'){if(vcActive()&&MP.myPeer<m.peer&&!p&&VC.peers.size<VC_MAX&&now-(VC.rqT.get('in'+m.peer)||-1e9)>8000){VC.rqT.set('in'+m.peer,now);VC.back.delete(m.peer);vcCall(r);}return;}
  if(!sid)return;
  if(d.k==='no'||d.k==='bye'){if(p&&p.sid===sid){vcClose(p,false);VC.back.set(m.peer,now+(d.k==='no'?45000:8000));}return;}
  if(d.k==='cc'){if(p&&p.sid===sid)p.rc=d.v?1:0;return;}
  if(d.k==='of'||d.k==='an'){if(typeof d.d!=='string'||d.d.length>VC_CH||!mpNum(d.n,1,6)||!mpNum(d.i,0,5)||d.i>=d.n||(d.n|0)!==d.n||(d.i|0)!==d.i)return;
    const key=m.peer+'|'+sid+'|'+d.k;let q=VC.parts.get(key);if(!q){if(VC.parts.size>40)return;q={n:d.n,a:[],at:now};VC.parts.set(key,q);}if(q.n!==d.n)return;q.a[d.i]=d.d;
    for(let i=0;i<q.n;i++)if(typeof q.a[i]!=='string')return;VC.parts.delete(key);const sdp=q.a.join('');
    if(d.k==='of')vcOnOffer(r,sid,sdp,d.cc);else if(p&&p.sid===sid&&p.init&&!p.rd){p.rc=d.cc?1:0;p.pc.setRemoteDescription({type:'answer',sdp}).then(()=>vcRd(p),()=>vcClose(p,true));}return;}
  if(d.k==='ic'){if(!p||p.sid!==sid||!Array.isArray(d.c))return;for(const c of d.c.slice(0,30)){if(!Array.isArray(c)||typeof c[0]!=='string'||c[0].length>600)continue;
      const o={candidate:c[0],sdpMid:typeof c[1]==='string'&&c[1].length<40?c[1]:null,sdpMLineIndex:mpNum(c[2],0,8)?c[2]|0:0};if(p.rd)p.pc.addIceCandidate(o).catch(()=>{});else if(p.rq.length<60)p.rq.push(o);}}}
/* ---------- chọn ai để nối (2 lần/giây) ---------- */
function vcCand(r){if(!r||!r.uid||r.tx==null||vcBlk(r.uid))return null;return {r,d:Math.hypot(r.x-P.x,r.z-P.z),cl:typeof mpSameClan==='function'&&mpSameClan(r.uid)};}
function vcTick(){const now=performance.now();
  if(MP.room&&!VC.sub&&MP.roomOn){VC.sub=1;try{MP.unsubs.push(MP.room.on('vc',vcHear,()=>{}));}catch(e){VC.sub=0;}}
  if(!vcActive()){if(VC.peers.size)vcCloseAll(!document.hidden);if((VC.mode==='off'||document.hidden||!vcHere())&&VC.st)vcMicStop();return;}
  if(VC.mode==='open'&&!VC.trk&&VC.had&&!VC.asking&&!VC.denied)vcMic();
  for(const [k,q] of VC.parts)if(now-q.at>15000)VC.parts.delete(k);
  const L=[];for(const r of MP.rp.values()){const o=vcCand(r);if(o)L.push(o);}const by=new Map(L.map(o=>[o.r.peer,o]));
  for(const p of [...VC.peers.values()]){const o=by.get(p.peer);if(!o||!(o.d<VC_DROP||o.cl&&(VC.clan||p.rc))){vcClose(p,true);continue;}
    if(!p.ok&&now-p.at>20000){vcFail(p);continue;}if(p.dT&&now-p.dT>10000){vcClose(p,true);VC.back.set(p.peer,now+4000);}}
  const k=o=>o.d<VC_R?o.d:1e5+o.d;
  for(const o of L.filter(o=>!VC.peers.has(o.r.peer)&&(o.d<VC_R||VC.clan&&o.cl)).sort((a,b)=>k(a)-k(b))){if(VC.peers.size>=VC_MAX)break;const pr=o.r.peer;if((VC.back.get(pr)||0)>now)continue;
    if(MP.myPeer<pr)vcCall(o.r);else if(now-(VC.rqT.get(pr)||-1e9)>15000){VC.rqT.set(pr,now);vcSend(pr,{k:'rq'});}}}
/* ---------- mỗi khung hình: âm lượng theo khoảng cách + vòng "đang nói" ---------- */
function vcRms(an){if(!an)return 0;const b=VC.buf||(VC.buf=new Uint8Array(256));try{an.getByteTimeDomainData(b);}catch(e){return 0;}let s=0;for(let i=0;i<b.length;i++){const v=(b[i]-128)/128;s+=v*v;}return Math.sqrt(s/b.length);}
function vcVol(p,r){if(!VC.spk||!r)return 0;const d=Math.hypot(r.x-P.x,r.z-P.z);if(VC.clan&&mpSameClan(r.uid))return Math.max(0.85,d<VC_FULL?1:0);if(d<=VC_FULL)return 1;return Math.pow(Math.max(0,1-(d-VC_FULL)/(VC_R-VC_FULL)),1.4);}
function vcTex(){if(VC.tex)return VC.tex;const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle='rgba(24,14,8,.85)';x.beginPath();x.arc(32,32,29,0,7);x.fill();
  x.lineWidth=5;x.strokeStyle='#7ee08a';x.stroke();x.font='30px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('🔊',32,35);VC.tex=new THREE.CanvasTexture(c);VC.tex.encoding=THREE.sRGBEncoding;return VC.tex;}
function vcFrame(dt){const t=performance.now();if(t-VC.tf<66)return;VC.tf=t;const vol=t-VC.tp>200;if(vol)VC.tp=t;
  const ml=vcSending()?vcRms(VC.an):0;VC.lvl=VC.lvl*0.6+ml*0.4;const b=VC.el&&VC.el.mic;if(b){const lv=Math.min(1,VC.lvl*12);b.style.setProperty('--lv',lv.toFixed(2));b.classList.toggle('say',lv>0.25);}
  for(const p of VC.peers.values()){const r=MP.rp.get(p.peer);if(vol){const v=vcVol(p,r);if(p.g){try{p.g.gain.setTargetAtTime(v,AU.ctx.currentTime,0.08);}catch(e){}}else if(p.el)try{p.el.volume=v;}catch(e){}p.v=v;}
    p.lvl=p.lvl*0.6+vcRms(p.an)*0.4;const on=p.ok&&p.lvl>0.02&&p.v>0.02&&r&&r.o&&r.o.visible&&typeof THREE!=='undefined'&&G.sc;
    if(on){if(!p.sp){p.sp=new THREE.Sprite(new THREE.SpriteMaterial({map:vcTex(),transparent:true,depthWrite:false,fog:false}));p.sp.renderOrder=6;G.sc.add(p.sp);}
      const s=11+Math.min(7,p.lvl*60);p.sp.scale.set(s,s,1);p.sp.position.set(r.x,r.y+(r.tag&&r.tag.visible?62:52),r.z);p.sp.visible=true;}else if(p.sp)p.sp.visible=false;}}
/* ---------- nút trên màn hình ---------- */
function vcBox(){if(VC.el)return VC.el;const g=$('#game');if(!g)return null;const box=document.createElement('div');box.id='vcbox';box.className='vcbox';box.hidden=true;
  box.innerHTML='<button id="vcMic" class="vc-mic" aria-label="Micrô"><span>🎙️</span><i></i></button><div class="vc-side"><button id="vcSpk" aria-label="Loa giọng nói">🔊</button><button id="vcMore" aria-label="Chọn chế độ micrô">⋯</button></div><div id="vcPop" class="vc-pop" hidden></div>';
  g.appendChild(box);VC.el={box,mic:box.querySelector('#vcMic'),spk:box.querySelector('#vcSpk'),pop:box.querySelector('#vcPop')};const m=VC.el.mic;
  m.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();try{auInit();if(AU.ctx&&AU.ctx.state==='suspended')AU.ctx.resume();}catch(er){}
    if(VC.mode==='off'){vcPop();return;}if(!vcRtc())vcWarn('rtc','🎙️ Trình duyệt này chưa hỗ trợ nói chuyện bằng giọng.',1);
    if(VC.mode==='ptt'){VC.talk=true;try{m.setPointerCapture(e.pointerId);}catch(er){}vcMic().then(vcSendState);}else{VC.mute=!VC.mute;if(!VC.trk)vcMic().then(vcSendState);}vcSendState();});
  const up=()=>{if(VC.talk){VC.talk=false;vcSendState();}};['pointerup','pointercancel','lostpointercapture'].forEach(k=>m.addEventListener(k,up));m.addEventListener('contextmenu',e=>e.preventDefault());
  vcUi();return VC.el;}
function vcPop(show){const el=VC.el;if(!el)return;const on=show==null?el.pop.hidden:show;el.pop.hidden=!on;if(on)el.pop.innerHTML='<b class="vc-t">🎙️ Giọng nói</b>'+vcOptsHtml();}
function vcTg(k,n,hint){const v=!!VC[k];return `<div class="sp-r"><div class="sp-l"><b>${n}</b>${hint?`<small class="sp-h">${hint}</small>`:''}</div><button class="sp-sw${v?' on':''}" data-vct="${k}" role="switch" aria-checked="${v}" aria-label="${n}"><i></i></button></div>`;}
function vcOptsHtml(){const seg=[['off','Tắt'],['ptt','Nhấn giữ để nói'],['open','Luôn bật']].map(([v,t])=>`<button class="tb sm${VC.mode===v?' on':''}" data-vcm="${v}">${t}</button>`).join('');
  const n=[...VC.peers.values()].filter(p=>p.ok).length;
  return `<div class="sp-r sp-col"><div class="sp-l"><b>Micrô</b></div><div class="sp-seg">${seg}</div><small class="sp-h">Nói với người ở gần (khoảng 15 m, tối đa ${VC_MAX} người).${matchMedia('(pointer:fine)').matches?' Máy tính: giữ phím T để nói.':''}${VC.mode!=='off'&&vcHere()?' Đang nối: '+n+' người.':''}</small></div>`
    +vcTg('spk','Loa giọng nói','Tắt: không nghe người khác.')+vcTg('clan','Kênh bộ tộc','Người cùng bộ tộc nghe nhau ở mọi nơi.');}
function vcUi(){const el=VC.el;if(!el)return;const show=vcHere();if(el.box.hidden===show)el.box.hidden=!show;if(!show){el.pop.hidden=true;return;}
  const m=el.mic,live=vcSending(),md=VC.mode;m.className='vc-mic '+md+(live?' live':'')+(VC.denied&&!VC.trk&&md!=='off'?' deny':'');
  m.querySelector('i').textContent=md==='off'?'Tắt':md==='ptt'?(live?'Đang nói':'Giữ nói'):(VC.mute?'Đã tắt':'Đang bật');m.querySelector('span').textContent=md==='off'||md==='open'&&VC.mute?'🔇':'🎙️';
  m.setAttribute('aria-label',md==='off'?'Micrô đang tắt — chạm để chọn':md==='ptt'?'Nhấn giữ để nói':'Micrô luôn bật — chạm để tắt/bật');el.spk.textContent=VC.spk?'🔊':'🔈';el.spk.classList.toggle('off',!VC.spk);}
function vcPlace(){const el=VC.el;if(!el||el.box.hidden)return;const a=document.querySelector('.acts'),s=el.box.style;const r=a&&a.offsetParent?a.getBoundingClientRect():null;
  if(r&&r.height>0){const left=r.left+r.width/2<innerWidth/2;s.bottom=Math.round(innerHeight-r.top+10)+'px';if(left){s.left=Math.round(r.left)+'px';s.right='';}else{s.right=Math.round(innerWidth-r.right)+'px';s.left='';}el.box.classList.toggle('lh',left);}
  else{s.left='';s.right='max(14px,env(safe-area-inset-right))';s.bottom='calc(max(14px,env(safe-area-inset-bottom)) + 78px)';}}
function vcSetMode(v){if(!['off','ptt','open'].includes(v)||v===VC.mode&&v!=='off')return;VC.mode=v;VC.talk=false;VC.mute=false;vcSave();
  if(v==='off'){vcCloseAll(true);vcMicStop();}else{if(!vcRtc())vcWarn('rtc','🎙️ Trình duyệt này chưa hỗ trợ nói chuyện bằng giọng.',1);vcMic().then(vcSendState);}vcSendState();}
function vcSetTg(k){if(k!=='spk'&&k!=='clan')return;VC[k]=!VC[k];vcSave();if(k==='clan')for(const p of VC.peers.values())vcSend(p.peer,{k:'cc',s:p.sid,v:VC.clan?1:0});vcUi();VC.tp=0;}
document.addEventListener('click',e=>{const t=e.target&&e.target.closest&&e.target.closest('[data-vcm],[data-vct],#vcSpk,#vcMore,#vcMic');const el=VC.el;
  if(!t){if(el&&!el.pop.hidden&&!(e.target.closest&&e.target.closest('#vcbox')))el.pop.hidden=true;return;}e.stopImmediatePropagation();e.preventDefault();if(t.id==='vcMic')return;try{sfx('pick');}catch(er){}
  try{if(t.id==='vcSpk')vcSetTg('spk');else if(t.id==='vcMore'){vcPop();return;}else if(t.dataset.vcm)vcSetMode(t.dataset.vcm);else if(t.dataset.vct)vcSetTg(t.dataset.vct);}catch(er){console.warn('giọng nói',er);}
  if(el&&!el.pop.hidden)vcPop(true);if(G.panel==='settings'&&typeof spRefresh==='function')spRefresh();},true);
addEventListener('keydown',e=>{if(e.code!=='KeyT'||e.repeat||!vcHere()||(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName)))return;if(VC.mode==='ptt'){VC.talk=true;vcMic().then(vcSendState);vcSendState();}else if(VC.mode==='open'){VC.mute=!VC.mute;vcSendState();}});
addEventListener('keyup',e=>{if(e.code==='KeyT'&&VC.talk){VC.talk=false;vcSendState();}});
addEventListener('blur',()=>{if(VC.talk){VC.talk=false;vcSendState();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){vcCloseAll(true);vcMicStop();}});
addEventListener('pagehide',()=>{vcCloseAll(true);vcMicStop();});
/* ---------- móc vào trò chơi ---------- */
{const _at=animTick;animTick=function(dt){_at(dt);try{if(!VC.el)vcBox();const t=performance.now();if(t-VC.t>500){VC.t=t;vcTick();vcUi();vcPlace();}if(VC.peers.size||VC.an)vcFrame(dt);}catch(e){if(!VC.err){VC.err=1;console.warn('giọng nói',e);}}};}
if(typeof spMpOpts==='function'){const _o=spMpOpts;spMpOpts=function(M){return _o(M)+spH('🎙️ Nói chuyện bằng giọng')+vcOptsHtml();};}
(function vcCss(){const s=document.createElement('style');s.textContent=`.vcbox{position:absolute;z-index:6;display:flex;align-items:center;gap:6px;right:12px;bottom:280px;pointer-events:auto}.vcbox[hidden]{display:none}.vcbox.lh{flex-direction:row-reverse}
.vc-mic{position:relative;width:54px;height:54px;border-radius:50%;border:2px solid var(--line);background:var(--pn);color:var(--fg);display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1;font:inherit;padding:0;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;box-shadow:0 0 0 calc(var(--lv,0)*12px) rgba(126,224,138,.4);transition:box-shadow .08s}
.vc-mic span{font-size:21px}.vc-mic i{font-style:normal;font-size:9px;font-weight:700;margin-top:3px;white-space:nowrap}.vc-mic.off{opacity:.62}.vc-mic.live{background:#2f5f36;border-color:#7ee08a}.vc-mic.say{border-color:#b8ffbf}.vc-mic.deny{border-color:var(--bad)}
.vc-side{display:flex;flex-direction:column;gap:4px}.vc-side button{width:34px;height:25px;border-radius:9px;border:1px solid var(--line);background:var(--pn);color:var(--fg);font-size:13px;line-height:1;padding:0}.vc-side button.off{opacity:.6}
.vc-pop{position:absolute;bottom:64px;right:0;width:min(270px,calc(100vw - 28px));max-height:60vh;overflow-y:auto;padding:8px 12px 4px;border-radius:14px;background:#2a1d14;border:2px solid var(--acc);box-shadow:0 10px 30px rgba(0,0,0,.5);color:var(--fg)}.vcbox.lh .vc-pop{right:auto;left:0}
.vc-pop .vc-t{display:block;font-size:15px;margin-bottom:2px}.vc-pop .sp-seg .tb{font-size:12px;min-height:36px}body.building .vcbox,body.pan .vcbox{visibility:hidden}`;document.head.appendChild(s);})();
