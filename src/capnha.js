/* ---------- NHÀ Ở THEO CẤP, MỖI THỜI ĐẠI MỘT KIỂU NHÀ ----------
   Nhà chính nay có 5 cấp, dựng bằng vật liệu của từng thời đại (bảng Xây → Quy hoạch làng → Nhà chính):
     cấp 1 Nhà tre (Hòa Bình)  · cấp 2 Nhà chính (gỗ, mái lá) · cấp 3 Nhà gỗ súc (Bắc Sơn)
     cấp 4 Nhà đá (Phùng Nguyên) · cấp 5 Nhà mái thuyền (Đông Sơn)
   Chỉ tính căn cấp cao nhất đã dựng xong: thêm thể lực tối đa, ngủ hồi sức nhanh hơn, giảm đòn đánh khi đứng trong làng. */
const CN_T=[null,
 {id:'qh_tre',lv:1,stam:5,rest:1.1,def:0},
 {id:'qh_chinh',lv:2,stam:10,rest:1.2,def:0},
 {id:'qh_go',lv:3,stam:16,rest:1.35,def:0.05},
 {id:'qh_da',lv:4,stam:22,rest:1.5,def:0.1},
 {id:'qh_thuyen',lv:5,stam:30,rest:1.7,def:0.15}];
{const box=(A,w,h,fl,rf,wl,win,door,doorI)=>{for(let i=0;i<w;i++)for(let j=0;j<h;j++){A.F(i,j,fl);A.R(i,j,rf,rf==='roof'?0:(j===0?2:0));/* mái tre, mái thuyền: hai hàng quay lưng vào nhau thành nóc giữa nhà */}for(let i=0;i<w;i++){A.E(i,0,'n',i%2?win:wl);A.E(i,h-1,'s',i===doorI?door:wl);}for(let j=0;j<h;j++){A.E(0,j,'w',wl);A.E(w-1,j,'e',j===0?win:wl);}};
 const N=[
  {id:'qh_tre',g:'Nhà chính',n:'Nhà tre · cấp 1',ic:'🎋',fx:'+5 thể lực tối đa · giường tre, sáng dậy ít đói khát hơn',d:'Nhà tre 2×2 ô vách tre đập dập, mái ống tre: căn nhà đầu tiên của thời Hòa Bình.',key:'roof',
   fn:A=>{box(A,2,2,'floor','bambooTileRoof','splitBambooWall','bambooWindowWall','rattanDoorWall',1);A.O(0,0,'bambooBed');A.O(1,0,'basket');}},
  {id:'qh_go',g:'Nhà chính',n:'Nhà gỗ súc · cấp 3',ic:'🪵',fx:'+16 thể lực tối đa · ở trong làng bớt 5% đòn đánh',d:'Nhà 3×2 ô tường gỗ súc khấc ngàm, sàn ván, có giường, mâm, chum, đèn: nhà vững chãi thời Bắc Sơn.',key:'roof',
   fn:A=>{box(A,3,2,'plankFloor','roof','logWall','logWindowWall','logDoorWall',1);A.O(0,0,'bambooBed');A.O(2,0,'storageJar');A.O(2,1,'oilLamp');A.O(1,0,'lowTable');}},
  {id:'qh_da',g:'Nhà chính',n:'Nhà đá · cấp 4',ic:'🪨',fx:'+22 thể lực tối đa · ở trong làng bớt 10% đòn đánh',d:'Nhà 3×2 ô tường đá hộc trát đất sét, sàn trải chiếu, cửa hai cánh: nhà làng định cư thời Phùng Nguyên, chịu lửa.',key:'roof',
   fn:A=>{box(A,3,2,'matFloor','bambooTileRoof','stoneWallFull','logWindowWall','plankDoubleDoor',1);A.O(0,0,'bambooBed');A.O(2,0,'storageJar');A.O(2,1,'oilLamp');A.O(1,0,'lowTable');}},
  {id:'qh_thuyen',g:'Nhà chính',n:'Nhà mái thuyền · cấp 5',ic:'⛵',fx:'+30 thể lực tối đa · ở trong làng bớt 15% đòn đánh',d:'Nhà lớn 4×2 ô mái cong hình thuyền như khắc trên trống đồng, tường gỗ, hai giường, giá vũ khí: nhà thủ lĩnh thời Đông Sơn.',key:'roof',
   fn:A=>{box(A,4,2,'plankFloor','boatRoof','logWall','logWindowWall','plankDoubleDoor',1);A.O(0,0,'bambooBed');A.O(3,0,'bambooBed');A.O(2,0,'lowTable');A.O(1,0,'storageJar');A.O(2,1,'oilLamp');A.O(0,1,'weaponRack');}}];
 for(const q of N)q.bp=bpMake(q.id,q.n,q.ic,0,q.d,q.fn);
 const i0=QH.findIndex(x=>x.id==='qh_chinh');QH.splice(i0,0,N[0]);let i1=-1;QH.forEach((x,i)=>{if(x.g==='Nhà chính')i1=i;});QH.splice(i1+1,0,N[1],N[2],N[3]);
 const c=QH.find(x=>x.id==='qh_chinh');if(c){c.n='Nhà chính · cấp 2';c.fx='+10 thể lực tối đa · giỏ cất đồ';}}
// cấp nhà cao nhất đã dựng xong (nhớ 2 giây cho nhẹ)
function cnLv(){if(!S)return 0;if(G._cnT!=null&&G.t-G._cnT<2&&G._cnT<=G.t)return G._cnL;let l=0;for(let i=5;i>0;i--)if(qhHas(CN_T[i].id)){l=i;break;}G._cnT=G.t;G._cnL=l;return l;}
{const _ms=maxStam;maxStam=function(){const v=_ms.apply(this,arguments);try{const l=cnLv();if(l)return v+CN_T[l].stam-(qhHas('qh_chinh')?10:0);}catch(e){}return v;};}
function cnHome(){try{const h=(typeof aqBed==='function'&&aqBed())||null;return !!h&&Math.hypot(h.x-P.x,h.z-P.z)<600;}catch(e){return false;}}
if(typeof heroDef==='function'){const _hd=heroDef;heroDef=function(){const v=_hd.apply(this,arguments);try{const l=cnLv();if(l&&CN_T[l].def&&cnHome())return Math.min(0.8,v+CN_T[l].def);}catch(e){}return v;};}
// ngủ nhà tốt: sáng dậy ít đói khát hơn (mỗi cấp nhà +2 no, +2 nước)
{const _sl=sleep;sleep=function(b){const d0=S.day,l=cnLv();const r=_sl.apply(this,arguments);try{if(l&&G.sleeping){let n=0;const iv=setInterval(()=>{if(++n>60||!S){clearInterval(iv);return;}if(!G.sleeping&&S.day!==d0){clearInterval(iv);S.p.food=Math.min(100,S.p.food+l*2);S.p.water=Math.min(100,S.p.water+l*2);}},500);}}catch(e){}return r;};}
// bảng Quy hoạch: dòng báo cấp nhà hiện có
{const _qh=qhHtml;qhHtml=function(){let h=_qh.apply(this,arguments);try{const l=cnLv(),nx=CN_T[l+1],q=nx&&QH.find(x=>x.id===nx.id);const s=`<div class="cn-lv">🏠 Cấp nhà hiện tại: <b>${l?l+' · '+esc(QH.find(x=>x.id===CN_T[l].id).n.split(' · ')[0]):'chưa có nhà'}</b>${q?` → cấp tiếp: <b>${esc(q.n.split(' · ')[0])}</b>`:' · đã cao nhất'}</div>`;h=h.replace('<div class="qh-list">','<div class="qh-list">'+s);}catch(e){}return h;};}
{const st=document.createElement('style');st.textContent='.cn-lv{grid-column:1/-1;padding:8px 10px;border-radius:10px;background:rgba(242,197,90,.12);border:1px solid rgba(242,197,90,.35);font-size:13px;color:#ffe2a8}';document.head.appendChild(st);}
if(typeof HD_L!=='undefined')HD_L.push({id:'capnha',ic:'🏠',t:'Nhà ở theo cấp',w:()=>G.panel==='build'&&!!(S.hd&&S.hd.quyhoach)&&(S.age||0)>=1,p:['<b>Nhà chính</b> có 5 cấp theo thời đại: Nhà tre → Nhà chính → Nhà gỗ súc → Nhà đá → Nhà mái thuyền Đông Sơn. Mở <b>Xây → Quy hoạch làng</b> để xem.','Cấp càng cao càng thêm <b>thể lực tối đa</b>, sáng dậy ít đói khát hơn, và ở quanh nhà <b>bớt đòn đánh</b>. Chỉ tính căn cấp cao nhất đã dựng xong.','Lên thời đại mới là mở vật liệu mới (gỗ súc, đá hộc, mái thuyền). Bấm <b>🤖 Tự dựng luôn</b> để nhân vật tự gom đồ và dựng.']});
