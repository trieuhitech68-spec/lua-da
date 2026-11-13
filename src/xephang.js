/* ---------- BẢNG XẾP HẠNG THEO MÙA (thế giới chung) ----------
   Mỗi tháng là một mùa. Điểm mùa: xong việc hằng ngày +10, mở Rương ngày +30, công phá đất phe khác +20, hạ cờ +30, phá công trình địch +1, hạ kẻ địch/lính +2.
   Mỗi người gửi kèm players/<uid>.rk=[điểm, mã mùa]; bảng xếp hạng tính từ đó (10 người đứng đầu, 5 liên minh đứng đầu), xem ở bảng Liên minh. Sang mùa mới điểm về 0. */
const XH={t:0,k:''};
function xhSeason(){const d=new Date();return d.getFullYear()*100+d.getMonth()+1;}
function xhS(){const s=xhSeason();if(!S.rk||S.rk.s!==s)S.rk={s,p:0};return S.rk;}
function xhAdd(n){try{if(!S||!n)return;xhS().p+=n;}catch(e){}}
{const w=(name,fn)=>{try{const f=(0,eval)(name);if(typeof f!=='function')return;window.__xw=fn(f);(0,eval)(name+'=__xw');}catch(e){}};
 w('nvnClaim',f=>function(i){const N=nvnS(),b0=N.box,c0=N.q.filter(e=>e.c).length;const r=f.apply(this,arguments);try{const N2=nvnS();if(N2.box&&!b0)xhAdd(30);xhAdd(10*(N2.q.filter(e=>e.c).length-c0));}catch(e){}return r;});
 w('cthDone',f=>function(sid){const k0=JSON.stringify((S.ct&&S.ct.k)||{});const r=f.apply(this,arguments);try{if(JSON.stringify((S.ct&&S.ct.k)||{})!==k0)xhAdd(20);}catch(e){}return r;});
 w('pvpFlagDone',f=>function(cid){const z0=S.pvp&&S.pvp.zo&&S.pvp.zo[cid];const r=f.apply(this,arguments);try{if(S.pvp&&S.pvp.zo&&S.pvp.zo[cid]!==z0)xhAdd(30);}catch(e){}return r;});
 w('pvpDestroy',f=>function(){const c0=(S.cnt||{})['cnt:pvp']||0;const r=f.apply(this,arguments);try{xhAdd(((S.cnt||{})['cnt:pvp']||0)-c0);}catch(e){}return r;});
 w('foeDamage',f=>function(fo){const al=fo&&fo.alive;const r=f.apply(this,arguments);try{if(al&&!fo.alive&&!fo.civ)xhAdd(2);}catch(e){}return r;});try{delete window.__xw;}catch(e){}}
{const _v=mpValPlayer;mpValPlayer=function(id,d){const v=_v.apply(this,arguments);try{if(v)v.rk=d&&Array.isArray(d.rk)&&d.rk.length===2&&mpNum(d.rk[0],0,1e7)&&mpNum(d.rk[1],202001,999912)?[d.rk[0]|0,d.rk[1]|0]:null;}catch(e){}return v;};}
setInterval(()=>{try{if(typeof G==='undefined'||!G.on||!S||!pvpOn()||!MP.me)return;const R=xhS(),k=R.s+':'+R.p,now=Date.now();if(k===XH.k||now-XH.t<60000)return;XH.k=k;XH.t=now;mpSaveMe({rk:[R.p,R.s]});}catch(e){}},5000);
function xhHtml(){if(!pvpOn())return '';const s=xhSeason(),me=xhS(),L=[];for(const u in MP.players){const p=MP.players[u];if(u===MP.uid)continue;if(p.rk&&p.rk[1]===s&&p.rk[0]>0)L.push([u,p.rk[0]]);}if(me.p>0)L.push([MP.uid,me.p]);L.sort((a,b)=>b[1]-a[1]);
  const my=L.findIndex(e=>e[0]===MP.uid),cl={};for(const [u,p] of L){const c=mpClanOf(u);if(c)cl[c]=(cl[c]||0)+p;}const CL=Object.entries(cl).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const row=(i,name,p,mine)=>`<div class="mp-m xh-r${mine?' me':''}"><span class="xh-i">${i<3?['🥇','🥈','🥉'][i]:i+1}</span><b>${name}</b><span class="xh-p">${p} điểm</span></div>`;
  return `<h3>🏆 Bảng xếp hạng mùa ${s%100}/${Math.floor(s/100)}</h3><p class="small muted">Điểm của bạn: <b style="color:#ffd27a">${me.p}</b>${my>=0?` · hạng ${my+1}/${L.length}`:''}</p>`+
    (L.length?L.slice(0,10).map((e,i)=>row(i,esc(e[0]===MP.uid?'Bạn':mpName(e[0])),e[1],e[0]===MP.uid)).join(''):'<p class="small muted">Mùa này chưa ai có điểm.</p>')+
    (CL.length?`<h3>🏰 Liên minh dẫn đầu</h3>`+CL.map((e,i)=>row(i,`<span data-cn="${esc(e[0])}">${MP.clans[e[0]]?esc(MP.clans[e[0]].emblem+' '+MP.clans[e[0]].name):''}</span>`,e[1],e[0]===mpMyClan())).join(''):'')+
    `<p class="hint">Điểm mùa: việc hằng ngày +10, Rương ngày +30, công phá đất +20, hạ cờ +30, phá công trình địch +1, hạ kẻ địch +2. Đầu tháng điểm về 0.</p>`;}
if(typeof mpTribeHtml==='function'){const _th=mpTribeHtml;mpTribeHtml=function(){let h=_th.apply(this,arguments);try{const x=xhHtml(),i=h.lastIndexOf('<button class="btn sm ');h=i>0?h.slice(0,i)+x+h.slice(i):h+x;}catch(e){console.warn('xếp hạng',e);}return h;};}
{const st=document.createElement('style');st.textContent='.xh-r{flex-wrap:nowrap}.xh-r.me{background:rgba(242,197,90,.12);border-radius:8px}.xh-i{width:26px;text-align:center;font-weight:800}.xh-p{margin-left:auto;font-weight:800;color:#ffd27a;font-size:12.5px;white-space:nowrap}';document.head.appendChild(st);}
