/* ===================== khaipha: KHU ĐÃ KHAI PHÁ THÌ SẠCH HẲN =====================
   Người chơi báo: khu đã xây vẫn mọc cỏ, mọc lại cây bụi, rắn bò vào; khu đã san nền vẫn báo "vướng cây" không xây được.
   Nguyên nhân: · cây bụi theo mùa đang "ngủ" lúc san nền / lúc đặt công trình không bị nhổ, sang mùa (hoặc lần tải game sau) chúng mọc lại ngay trong khu;
                · cây cỏ bị hái, chặt quanh nhà vẫn hẹn giờ mọc lại; cỏ nền chỉ tránh đúng ô có sàn; thú hoang không biết đâu là làng.
   Giờ có "khu đã khai phá" = quanh mỗi công trình ~3 m + mọi nền đã san + lòng vòng rào của làng. Trong khu đó:
        · thứ đã chặt, hái, dọn thì KHÔNG mọc lại; nền đã san thì nhổ sạch mọi thứ còn sót (kể cả thứ mọc theo mùa);
        · không có cỏ nền; thú hoang (rắn, thỏ, lợn rừng…) đang không đuổi ai thì bị lùa ra ngoài và chuyển chỗ ở ra ngoài khu.
   Cây to bạn chưa chặt thì vẫn để nguyên (muốn giữ bóng mát thì giữ). */
const KP={g:new Set(),sig:'',C:80};
const kpK=(ix,iz)=>(ix+8000)*20000+(iz+8000);
function kpIn(x,z){return KP.g.size>0&&KP.g.has(kpK(Math.floor(x/80),Math.floor(z/80)));}
function kpMark(x,z,r){const C=KP.C,i0=Math.floor((x-r)/C),i1=Math.floor((x+r)/C),j0=Math.floor((z-r)/C),j1=Math.floor((z+r)/C);for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const cx=(i+0.5)*C,cz=(j+0.5)*C;if(Math.hypot(cx-x,cz-z)<=r+C*0.35)KP.g.add(kpK(i,j));}}
function kpBuild(){KP.g.clear();try{for(const b of S.builds){if(b.tree!=null||/tree|ropeLadder|bridge|jetty|steppingStones|Path$|gardenBorder|[tT]rap|snare|scarecrow/.test(b.k))continue;const d=pieceDef(b.k);if(!d)continue;kpMark(b.x,b.z,(d.fp?Math.max(d.fp[0],d.fp[1])*20:20)+60);}
    for(const f of S.flat||[])kpMark(f.x,f.z,f.r);
    if(typeof cdRing==='function'&&typeof homePos==='function'&&homePos()){const R=cdRing(cdCenter());if(R&&R.x1-R.x0<1600&&R.z1-R.z0<1600){const C=KP.C;for(let i=Math.floor(R.x0/C);i<=Math.floor(R.x1/C);i++)for(let j=Math.floor(R.z0/C);j<=Math.floor(R.z1/C);j++)KP.g.add(kpK(i,j));}}}catch(e){}}
function kpGone(q,perm){q.st=perm?1:2;q.hp=0;if(perm){q.rg=1e12;S.res[q.i]=[1,1e12];}else S.res[q.i]=[2,0];try{resShow(q);}catch(e){}}
/* quét: nền đã san sạch mọi thứ còn sống hoặc đang ngủ theo mùa; trong khu thì thứ đã hết không hẹn mọc lại */
function kpSweep(){let ch=0;try{for(const f of S.flat||[])for(const i of near(f.x,f.z,f.r+20)){const q=RES[i];if(!q||q.lock||Math.hypot(q.x-f.x,q.z-f.z)>f.r)continue;const m=S.res[q.i];if(q.st===0){kpGone(q,true);ch++;}else if(q.st===2&&!m){S.res[q.i]=[2,0];}}
    for(const k in S.res){const m=S.res[k];if(m[0]!==1||m[1]>=1e11)continue;const q=RES[+k];if(q&&kpIn(q.x,q.z))S.res[k]=[1,1e12];}
    if(ch)RI.forEach(v=>v.api.flush());}catch(e){}return ch;}
function kpRefresh(force){try{if(!S||!S.builds)return;const L=S.builds,sig=L.length+':'+(L.length?L[L.length-1].id:0)+':'+((S.flat||[]).length)+':'+(S.land||'c');if(!force&&sig===KP.sig)return;KP.sig=sig;kpBuild();kpSweep();G.gLast=null;}catch(e){}}
{const _rr=resRegrow;resRegrow=function(){try{for(const k in S.res){const m=S.res[k];if(m[0]!==1||m[1]>=1e11)continue;const q=RES[+k];if(q&&kpIn(q.x,q.z))S.res[k]=[1,1e12];}}catch(e){}return _rr.apply(this,arguments);};}
/* sang mùa / lúc tải game: thứ đã bị dọn hẳn (ghi [2,0]) không được "tỉnh dậy"; thứ tỉnh dậy trong nền đã san hay dưới công trình thì nhổ luôn */
{const _rs=resSeasonal;resSeasonal=function(){const r=_rs.apply(this,arguments);try{kpRefresh(false);let ch=0;for(const q of RES){if(q.st!==0)continue;const m=S.res[q.i];if(m&&m[0]===2){q.st=2;q.hp=0;try{resShow(q);}catch(e){}ch++;}else if(!q.lock&&((typeof inFlat==='function'&&inFlat(q.x,q.z))||(RT[q.t].seasons&&!RT[q.t].pass&&cellBusy(q.x,q.z)))){kpGone(q,true);ch++;}}if(ch)RI.forEach(v=>v.api.flush());}catch(e){}return r;};}
/* thú hoang: đang ở trong khu mà không đuổi ai thì ra ngoài, chỗ ở cũng dời ra ngoài */
function kpOut(x,z){const c=(typeof homePos==='function'&&homePos())||{x:P.x,z:P.z};let a0=Math.atan2(z-c.z,x-c.x);if(Math.hypot(x-c.x,z-c.z)<1)a0=0;for(const da of [0,0.8,-0.8,1.6,-1.6,2.4,-2.4,3.14]){const dx=Math.cos(a0+da),dz=Math.sin(a0+da);let ox=x,oz=z;for(let s=0;s<40;s++){ox+=dx*80;oz+=dz*80;if(kpIn(ox,oz))continue;const tx=ox+dx*140,tz=oz+dz*140;try{if(hAt(tx,tz)<2||wdAt(tx,tz)>0||kpIn(tx,tz))break;}catch(e){}return [tx,tz];}}return null;}
function kpAnimals(){try{if(!KP.g.size||!G.animals)return;for(const a of G.animals){if(!a.alive||a.tame>0||a.state==='chase'||a.angry||(a.calm&&a.calm>G.t)||a.kind==='horse'&&a.tame>0)continue;const inA=kpIn(a.x,a.z),inH=a.home&&kpIn(a.home.x,a.home.z);if(!inA&&!inH)continue;
      const o=kpOut(inA?a.x:a.home.x,inA?a.z:a.home.z);if(!o)continue;a.home={x:o[0],z:o[1]};if(!inA)continue;const d=Math.hypot(a.x-P.x,a.z-P.z);
      if(d>260||!a.o||!a.o.visible){a.x=o[0];a.z=o[1];a.y=hAt(a.x,a.z);a.tx=a.x;a.tz=a.z;if(a.o)a.o.position.set(a.x,a.y,a.z);}else{a.tx=o[0];a.tz=o[1];a.tt=Math.max(a.tt||0,6);a.state='wander';}}}catch(e){}}
setInterval(()=>{try{if(typeof G!=='object'||!G.on||G.paused||!S)return;kpRefresh(false);kpAnimals();}catch(e){}},1500);
/* đặt rào, tường: bụi cỏ, cây non, đá vụn nằm ngay dưới chân rào tự dọn (trước phải đi nhổ từng thứ mới đặt được) */
{const _sa=structAdd;structAdd=function(b,quiet){const r=_sa.apply(this,arguments);try{const d=pieceDef(b.k);if(d&&!b.remote&&(d.kind==='edge'||d.kind==='corner')&&typeof RES!=='undefined'&&RES.length){let n=0;for(const i of near(b.x,b.z,30)){const q=RES[i];if(!q||q.st!==0||q.lock||RT[q.t].pass||RT[q.t].tool)continue;if(Math.hypot(q.x-b.x,q.z-b.z)<(d.kind==='edge'?20:8)*0.75+(RT[q.t].r||4)*0.6){sl2Clear(q);n++;}}if(n&&!quiet)RI.forEach(v=>{try{v.api.flush();}catch(e){}});}}catch(e){}return r;};}
/* san nền chỗ còn cây lớn: có rìu thì đốn luôn trong lúc san (trước báo lỗi, bắt đi chặt từng cây rồi quay lại) */
{const _lc=landCheck;landCheck=function(r){const w=_lc.apply(this,arguments);KP.fell=0;try{if(w&&/^Còn \d+ cây lớn/.test(w)&&hasTool('axe')){r=+r||110;for(const b of S.builds)if(Math.hypot(b.x-P.x,b.z-P.z)<r*0.85)return 'Khu này đã có công trình. San nền trước khi xây.';KP.fell=+w.match(/\d+/)[0];return null;}if(w&&/^Còn \d+ cây lớn/.test(w))return w+' (Có rìu trong túi thì san nền sẽ đốn luôn.)';}catch(e){}return w;};
 const _ls=landStart;landStart=function(r){const res=_ls.apply(this,arguments);try{if(G.work&&KP.fell>0&&G.work.steps&&G.work.i===0){const n=KP.fell;G.work.steps.unshift({n:'Đốn '+n+' cây lớn trong khu',a:'carve',t:Math.min(14,1.6+n*1.1),fx:'chop'});KP.fell=0;try{workUi();}catch(e){}}}catch(e){}return res;};}
/* luống đất trên chỗ hơi dốc: trước là tấm phẳng nên một mép hở khỏi mặt đất, nhìn như tấm ván lơ lửng. Giờ có khối đất đắp bên dưới, mép nào cũng liền đất. */
{const _m=model;model=function(spec){const g=_m.apply(this,arguments);try{if(g&&spec&&spec[0]==='piece'){const d=typeof pieceDef==='function'&&pieceDef(spec[1]);if(d&&d.kind==='obj'&&d.farm&&spec[1]!=='paddy'&&!g.userData.kpSk){g.userData.kpSk=1;const fp=d.fp||[1,1],T=THREE,mt=KP.skM||(KP.skM=new T.MeshStandardMaterial({color:'#5f4129',roughness:1,metalness:0})),me=new T.Mesh(new T.BoxGeometry(fp[0]*CELL-3,9,fp[1]*CELL-3),mt);me.position.y=-4.3;me.receiveShadow=true;g.add(me);}}}catch(e){}return g;};}
