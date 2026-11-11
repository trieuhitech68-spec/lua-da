/* ===================== TẠO NHÂN VẬT: dáng người · nặn mặt · tóc · da · trang trí =====================
   - S.app: ngoại hình gọn (các số ngắn). Mọi chỉnh sửa áp dụng MỘT LẦN khi dựng mô hình (biến dạng đỉnh của lưới đầu theo vùng,
     co giãn xương/lưới thân, thẻ tóc mới, lớp vẽ/xăm/tàn nhang) → trong game không tốn gì mỗi khung hình.
   - Bọc K3.char2: nếu look có .app thì dựng theo ngoại hình đó (người chơi, bản xem trước, người chơi khác qua mạng).
   - Màn tạo nhân vật: xem trước 3D riêng (renderer riêng, tắt khi đóng), thẻ phân loại, thanh trượt, hoàn tác, mẫu, lưu 6 kiểu. */
const CRE={open:false,tab:'mau',hist:[],hi:-1};
const crSS=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);},crGs=(x,c,w)=>Math.exp(-((x-c)/w)*((x-c)/w));
const v3add=(a,b,s)=>[a[0]+b[0]*(s==null?1:s),a[1]+b[1]*(s==null?1:s),a[2]+b[2]*(s==null?1:s)],v3sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],v3mul=(a,f)=>[a[0]*f,a[1]*f,a[2]*f];
const v3dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],v3crs=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],v3len=a=>Math.hypot(a[0],a[1],a[2]);
const v3nrm=a=>{const l=v3len(a)||1;return [a[0]/l,a[1]/l,a[2]/l];},v3lerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const crRng=s=>{s=(s|0)||1;return ()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};};
const crHex=(h)=>{const c=new THREE.Color(h);return [c.r,c.g,c.b];},crMix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const crRgb=h=>{const n=parseInt(h.slice(1),16);return [(n>>16&255),(n>>8&255),(n&255)];},crHexMix=(a,b,t)=>{const A=crRgb(a),B=crRgb(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');};
/* ---------- bảng màu, kiểu ---------- */
const CR_SKIN=['#f3d2b3','#e8bc96','#dba57e','#c98f66','#b47b53','#9a6443','#7e4e33'];
const CR_HAIR=[['Đen','#141012'],['Nâu sẫm','#2c1c13'],['Nâu đỏ','#4a2616'],['Cháy nắng','#6e4a2c'],['Muối tiêu','#8b8781']];
const CR_HK=[['Sợi bạc','#b8b4ae'],['Vàng nắng','#a8743c'],['Nhuộm son','#8a2e1a']];
const CR_EYE=[['Nâu sẫm','#3a2414'],['Đen','#120c09'],['Nâu','#5a3a1e'],['Hổ phách','#7e5320'],['Nâu xám','#4a4236']];
const CR_BROW=[['Theo tóc',null],['Đen','#120e0c'],['Nâu','#3a2618'],['Nhạt','#6a5440']];
const CR_CLOTH=[['Da thuộc','#8a5a33','#5e3a1e','#5a3a22'],['Vỏ cây','#a7885e','#6e5236','#6a5236'],['Nhuộm nghệ','#b38433','#74501f','#5e4426'],['Son đỏ','#9a4528','#5e2a16','#4a2a1a'],['Tro xám','#7a6e62','#4a4038','#3a3028'],['Lá chàm','#3e4a5e','#262e3c','#3a3028']];
const CR_HS=[{n:'Buộc đuôi ngựa',b:0},{n:'Ngắn rối',b:1},{n:'Tết bím',b:2},{n:'Búi tó',c:'knot'},{n:'Cạo hai bên',c:'side'},{n:'Xõa dài',b:0,c:'long'},{n:'Cắt ngắn',c:'crop'},{n:'Cạo trọc',c:'bald'},{n:'Búi thấp',b:0,c:'bunlow'},{n:'Hai bím',b:0,c:'twin'},{n:'Ngang vai',b:0,c:'mid'}];
const CR_FH=['Cạo sạch','Lún phún','Ria mép','Quai nón','Râu cằm','Râu tỉa ngắn'];
const CR_FACE=[{n:'Trái xoan',fw:0,fl:0.02,jw:-0.35,cl:0.2},{n:'Tròn',fw:0.05,fl:-0.07,jw:0.3,cl:-0.35},{n:'Dài',fw:-0.035,fl:0.1,jw:-0.1,cl:0.25},{n:'Vuông',fw:0.03,fl:0,jw:0.8,cl:-0.05},{n:'Trái tim',fw:0.02,fl:0.02,jw:-0.6,cl:0.35}];
const CR_FP=['Không','Vạch má','Dải mắt','Chấm trán','Nửa mặt','Hình chữ V','Sọc cằm'];
const CR_FC=[['Son đỏ','#a8321c'],['Đất trắng','#ece2cc'],['Than đen','#1c1816'],['Nghệ vàng','#d8a030']];
const CR_TT=['Không','Vòng Đông Sơn','Giao long','Răng cưa'];
/* ---------- lược đồ tham số (UI + mã hóa + áp dụng) ----------
   t: s=-1..1 · u=0..1 · c=lựa chọn · b=bit; z: vùng camera; rb: cần dựng lại; d: thuộc chi tiết (màu, lớp phủ) */
const CRS=[];const crP=(k,t,tab,sec,n,o)=>CRS.push(Object.assign({k,t,tab,sec,n},o||{}));
crP('f','c','dang','Giới tính','Giới tính',{opts:['👨 Nam','👩 Nữ'],z:'full',rb:1});
[['ht','Chiều cao','Thấp','Cao','full'],['mu','Cơ bắp','Mảnh','Vạm vỡ','body',1],['fa','Da thịt','Gầy','Đầy đặn','body'],['sh','Vai','Hẹp','Rộng','body'],['cs','Ngực','Lép','Nở','body'],['wa','Eo','Thon','To','body'],
 ['hp','Hông','Hẹp','Rộng','body'],['al','Tay','Ngắn','Dài','arms'],['at','Bắp tay','Mảnh','To','arms'],['hn','Bàn tay','Nhỏ','To','arms'],['ll','Chân','Ngắn','Dài','full'],['lt','Bắp chân','Mảnh','To','legs'],
 ['nk','Cổ','Mảnh','To','upper'],['po','Dáng đứng','Ưỡn ngực','Hơi khom','full']].forEach(([k,n,lo,hi,z,rb])=>crP(k,'s','dang','Thân hình',n,{lo,hi,z,rb}));
crP('ag','u','dang','Tuổi','Tuổi',{lo:'Trẻ',hi:'Trung niên',z:'face',d:1});
crP('ao','c','dang','Trang phục','Kiểu áo',{opts:['Áo có tay','Áo cộc','Cởi trần'],z:'body',rb:1});
crP('cc','c','dang','Trang phục','Màu áo',{opts:CR_CLOTH.map(c=>c[0]),sw:CR_CLOTH.map(c=>c[1]),z:'body',rb:1});
crP('fs','c','mat','Đầu','Khuôn mặt',{opts:CR_FACE.map(f=>f.n),z:'face'});
const crS=(sec,z,L)=>L.forEach(([k,n,lo,hi])=>crP(k,'s','mat',sec,n,{lo,hi,z}));
crS('Đầu','face',[['hz','Cỡ đầu','Nhỏ','To'],['hw','Bề ngang','Hẹp','Rộng'],['hl','Chiều dài mặt','Ngắn','Dài']]);
crS('Trán','brow',[['fo','Trán','Thấp','Cao'],['fsl','Độ dốc trán','Thẳng','Dốc'],['br','Gờ mày','Phẳng','Nhô']]);
crS('Mắt','eyes',[['es','Cỡ mắt','Nhỏ','To'],['ed','Khoảng cách','Gần','Xa'],['eh','Độ cao','Thấp','Cao'],['et','Đuôi mắt','Cụp','Xếch'],['ep','Độ sâu','Lồi','Sâu'],['el','Mí mắt','Híp','Mở to'],['ls','Lông mi','Ngắn','Dài']]);
crP('ec','c','mat','Mắt','Màu mắt',{opts:CR_EYE.map(e=>e[0]),sw:CR_EYE.map(e=>e[1]),z:'eyes',rb:1});
crS('Lông mày','brow',[['ba','Độ cong','Thẳng','Cong'],['bt','Độ dày','Mảnh','Rậm'],['bg','Góc mày','Cụp','Xếch']]);
crP('bc','c','mat','Lông mày','Màu lông mày',{opts:CR_BROW.map(e=>e[0]),sw:CR_BROW.map(e=>e[1]||'linear-gradient(135deg,#2c1c13,#6e4a2c)'),z:'brow',d:1});
crS('Mũi','nose',[['nl','Dài mũi','Ngắn','Dài'],['nw','Bề ngang','Hẹp','Rộng'],['nb','Sống mũi','Thấp','Cao'],['nt','Đầu mũi','Nhỏ','To'],['nf','Cánh mũi','Hẹp','Nở']]);
crS('Gò má','face',[['ch','Gò má cao','Thấp','Cao'],['cw','Gò má rộng','Hẹp','Rộng'],['cf','Má','Hóp','Phúng phính']]);
crS('Miệng','mouth',[['mw','Rộng miệng','Hẹp','Rộng'],['lu','Môi trên','Mỏng','Dày'],['lb','Môi dưới','Mỏng','Dày'],['mc','Khóe miệng','Trễ','Cong lên']]);
crS('Hàm & cằm','jaw',[['jw','Quai hàm','Hẹp','Bạnh'],['ja','Góc hàm','Mềm','Góc cạnh'],['cl','Cằm dài','Ngắn','Dài'],['cn','Cằm rộng','Nhọn','Rộng'],['cp','Cằm nhô','Lẹm','Nhô']]);
crS('Tai','ear',[['er','Cỡ tai','Nhỏ','To'],['ea','Tai vểnh','Áp sát','Vểnh']]);
crP('sk','u','da','Màu da','Màu da',{lo:'Sáng',hi:'Sẫm',z:'face',rb:1});crP('ut','s','da','Màu da','Sắc da',{lo:'Ô liu',hi:'Ửng hồng',z:'face',rb:1});
crP('fr','u','da','Chi tiết da','Tàn nhang',{lo:'Không',hi:'Nhiều',z:'face',d:1});crP('sb','u','da','Chi tiết da','Cháy nắng',{lo:'Không',hi:'Đỏ rát',z:'face',d:1});
crP('wk','u','da','Chi tiết da','Nếp nhăn',{lo:'Căng',hi:'Nhiều',z:'face',d:1});
crP('mo','c','da','Chi tiết da','Nốt ruồi',{opts:['Không','Một nốt','Vài nốt'],z:'face',d:1});crP('sc','c','da','Chi tiết da','Sẹo',{opts:['Không','Má','Lông mày','Cằm','Cánh tay'],z:'face',d:1});
crP('hs','c','toc','Kiểu tóc','Kiểu tóc',{opts:CR_HS.map(h=>h.n),z:'hair',rb:1});
crP('hc','c','toc','Màu tóc','Màu tóc',{opts:CR_HAIR.map(h=>h[0]),sw:CR_HAIR.map(h=>h[1]),z:'hair',rb:1});
crP('hk','c','toc','Màu tóc','Màu ánh',{opts:CR_HK.map(h=>h[0]),sw:CR_HK.map(h=>h[1]),z:'hair',d:1});crP('hg','u','toc','Màu tóc','Lượng ánh / sợi bạc',{lo:'Không',hi:'Nhiều',z:'hair',d:1});
crP('fh','c','toc','Râu','Râu',{opts:CR_FH,z:'mouth',rb:1,sx:'m'});
crP('fp','c','trang','Vẽ mặt','Hoa văn mặt',{opts:CR_FP,z:'face',d:1});crP('fc','c','trang','Vẽ mặt','Màu vẽ',{opts:CR_FC.map(c=>c[0]),sw:CR_FC.map(c=>c[1]),z:'face',d:1});
crP('pt','c','trang','Vẽ mình','Vẽ mình',{opts:['Không','Vạch son','Chấm đất trắng'],z:'body',d:1});
crP('tt','c','trang','Văn thân','Hình xăm',{opts:CR_TT,z:'body',d:1});crP('tp','b','trang','Văn thân','Chỗ xăm',{opts:['Tay','Ngực','Chân'],z:'body',d:1});
const CRK=Object.fromEntries(CRS.map(p=>[p.k,p]));
const CR_TABS=[['mau','⭐','Mẫu'],['dang','🧍','Dáng'],['mat','🙂','Mặt'],['da','🎨','Da'],['toc','💇','Tóc'],['trang','✨','Trang trí']];
/* ---------- giá trị, mẫu, mã hóa ---------- */
function crBlank(f){const a={};CRS.forEach(p=>{a[p.k]=0;});a.f=f?1:0;a.sk=0.45;a.cc=0;a.ao=f?0:0;a.hs=f?0:1;a.fh=f?0:1;a.tp=1;return a;}
const CR_PRE=[
 {n:'Thợ săn',i:'🏹',a:{f:0,ht:0.35,mu:0.55,sh:0.45,cs:0.3,wa:-0.3,al:0.1,fs:0,jw:0.25,ja:0.4,ch:0.3,cw:0.2,cf:-0.3,es:0.1,et:0.25,ep:0.2,br:0.3,bt:0.3,nb:0.35,nl:0.1,lu:-0.1,cp:0.2,hs:3,hc:0,fh:1,sk:0.58,ut:0.1,ao:2,cc:0,pt:1,fp:1,fc:0,tt:1,tp:1,hg:0.1,hk:1,sb:0.25}},
 {n:'Người hái lượm',i:'🌿',a:{f:1,ht:-0.1,fa:0.1,wa:-0.45,hp:0.35,fs:0,hz:-0.1,es:0.45,el:0.3,ls:0.6,et:0.2,ch:0.25,cf:0.2,nl:-0.2,nw:-0.15,nt:-0.2,lu:0.35,lb:0.45,mc:0.3,cn:-0.3,jw:-0.2,er:-0.25,ba:0.3,bt:-0.2,hs:5,hc:1,sk:0.32,ut:0.35,cc:1,ao:0,fr:0.35,hk:1,hg:0.2}},
 {n:'Thợ đá',i:'🪨',a:{f:0,ht:0.1,mu:0.9,fa:0.35,sh:0.75,cs:0.5,at:0.6,hn:0.5,nk:0.6,lt:0.4,fs:3,jw:0.6,ja:0.6,cn:0.4,br:0.6,ep:0.4,es:-0.1,bt:0.6,nw:0.35,nb:0.2,nt:0.3,hs:6,hc:1,fh:3,sc:1,sk:0.72,ut:-0.2,cc:4,ao:1,ag:0.45,wk:0.3,tt:3,tp:1}},
 {n:'Người giữ lửa',i:'🔥',a:{f:1,ht:0.15,wa:-0.3,hp:0.2,fs:4,es:0.35,et:0.45,el:0.15,ls:0.4,ch:0.45,cw:0.3,cf:-0.15,nb:0.2,nl:0.05,nw:-0.2,lu:0.2,lb:0.35,cl:0.2,cn:-0.2,ba:0.45,bg:0.3,hs:2,hc:2,sk:0.48,ut:0.2,cc:3,ao:0,fp:2,fc:0,pt:2,mo:1}},
 {n:'Già làng',i:'🪶',a:{f:0,ht:-0.15,fa:0.2,po:0.55,sh:0.1,nk:0.2,fs:2,ep:0.35,el:-0.3,br:0.45,nl:0.3,nb:0.3,cf:-0.4,lu:-0.3,jw:0.1,er:0.4,ag:1,wk:0.85,hs:0,hc:4,hg:0.5,hk:0,fh:3,sk:0.62,cc:1,ao:0,tt:2,tp:5,fp:3,fc:1}},
 {n:'Cô gái ven sông',i:'🐟',a:{f:1,ht:-0.3,fa:-0.1,wa:-0.5,hp:0.3,fs:1,hz:-0.05,es:0.55,ed:0.1,el:0.4,ls:0.7,cf:0.35,ch:0.1,nl:-0.3,nt:-0.3,nb:-0.1,lu:0.3,lb:0.5,mc:0.45,cl:-0.15,cn:-0.4,bt:-0.3,ba:0.2,hs:9,hc:0,sk:0.38,ut:0.4,cc:2,ao:0,fr:0.15,mo:1,tt:1,tp:1}}];
function crPreset(i){const P=CR_PRE[i]||CR_PRE[0];return Object.assign(crBlank(P.a.f),P.a);}
function crFromLook(l){return crPreset([0,1,2,3][l|0]??0);}
function crSan(a){if(!a||typeof a!=='object')return null;const o={};for(const p of CRS){let v=+a[p.k];if(!isFinite(v))v=p.k==='sk'?0.45:p.k==='tp'?1:0;
    if(p.t==='s')v=Math.max(-1,Math.min(1,Math.round(v*100)/100));else if(p.t==='u')v=Math.max(0,Math.min(1,Math.round(v*100)/100));else if(p.t==='b')v=Math.max(0,Math.min(7,v|0));else v=Math.max(0,Math.min(p.opts.length-1,v|0));o[p.k]=v;}
  if(o.f){o.fh=0;if(o.ao===2)o.ao=1;}return o;}
const CR_B36='0123456789abcdefghijklmnopqrstuvwxyz';
function crEnc(a){a=crSan(a);if(!a)return '';return CRS.map(p=>{const v=a[p.k];const n=p.t==='s'?Math.round((v+1)*17.5):p.t==='u'?Math.round(v*35):v;return CR_B36[Math.max(0,Math.min(35,n))];}).join('');}
function crDec(s){if(typeof s!=='string'||s.length!==CRS.length||!/^[0-9a-z]+$/.test(s))return null;const a={};CRS.forEach((p,i)=>{const n=CR_B36.indexOf(s[i]);a[p.k]=p.t==='s'?n/17.5-1:p.t==='u'?n/35:n;});return crSan(a);}
function crPres(){return typeof S!=='undefined'&&S&&S.app?crEnc(S.app):'';}
/* ---------- màu suy ra ---------- */
function crSkinHex(a){const t=Math.max(0,Math.min(1,a.sk))*(CR_SKIN.length-1),i=Math.min(CR_SKIN.length-2,Math.floor(t));let h=crHexMix(CR_SKIN[i],CR_SKIN[i+1],t-i);
  if(a.ut>0)h=crHexMix(h,'#c8665a',0.14*a.ut);else if(a.ut<0)h=crHexMix(h,'#958a52',0.16*-a.ut);if(a.ag>0)h=crHexMix(h,'#8a5e44',0.06*a.ag);return h;}
function crHairHex(a){let h=(CR_HAIR[a.hc]||CR_HAIR[0])[1];if(a.ag>0&&a.hc!==4)h=crHexMix(h,'#7c7770',0.3*a.ag);return h;}
/* ---------- tùy chọn cho bộ dựng ---------- */
function crBuildOpts(o,a){const q=Object.assign({},o);delete q.app;delete q.crKeep;delete q.crWear;const fem=!!a.f,H=CR_HS[a.hs]||CR_HS[0];
  q.sex=fem?'f':'m';q.fem=fem;q.skin=crSkinHex(a);q.hair=crHairHex(a);q.eye=(CR_EYE[a.ec]||CR_EYE[0])[1];q.build=1+0.14*a.mu;
  if(H.b!=null){q.hairStyle=H.b;delete q.hs;}else{delete q.hairStyle;q.hs='bald';}
  q.beard=!fem&&a.fh>=2;const C=CR_CLOTH[a.cc]||CR_CLOTH[0];q.bottom=C[3];
  if(!o.crWear){q.top=C[1];q.top2=C[2];q.bare=!fem&&a.ao===2;q.sleeves=a.ao===0;}else{q.bare=false;}
  delete q.paint;delete q.scar;return q;}
/* ---------- mặt cắt đầu (khớp bộ dựng): dùng để mọc tóc mới sát da đầu ---------- */
const CR_H0=[[5.95,.2,.05,.35],[5.64,1.0,.86,1.38],[5.1,1.42,1.42,1.9],[4.42,1.58,1.7,2.1],[3.86,1.6,1.86,2.07],[3.4,1.58,1.63,1.98],[2.85,1.55,1.73,1.76],[2.3,1.38,1.7,1.36],[1.76,1.18,1.57,.86],[1.26,.74,1.43,.32],[1.03,.36,1.02,.16]];
function crProf(y){const H=CR_H0;if(y>=H[0][0])return H[0];for(let j=0;j<H.length-1;j++){const a=H[j],b=H[j+1];if(y<=a[0]&&y>=b[0]){const t=(a[0]-y)/(a[0]-b[0]);return [y,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t,a[3]+(b[3]-a[3])*t];}}return H[H.length-1];}
const crHp=v=>Math.sign(v)*Math.pow(Math.abs(v),0.8);
function crBase(u,y){const r=crProf(y),s=Math.sin(u),c=Math.cos(u);return [r[1]*crHp(s),y,(c>=0?r[2]:r[3])*crHp(c)];}
const CRC=[0,3.25,-0.25];
function crScalp(d){let r=2.2;for(let i=0;i<5;i++){const y=Math.min(5.95,Math.max(1.05,CRC[1]+d[1]*r)),u=Math.atan2(d[0],d[2]);r=Math.max(0.5,v3dot(v3sub(crBase(u,y),CRC),d));}return v3add(CRC,d,r);}
const crDir=(u,y)=>v3nrm(v3sub(crBase(u,y),CRC));
function crHL(fem,hi){const A=[[0,4.95],[0.55,4.7],[1.15,4.12],[1.45,3.95],[1.75,3.3],[2.2,2.3],[Math.PI,fem?1.8:2.0]].map(([u,y])=>[u,y+(hi||0)]);
  return u=>{const a=Math.abs(((u+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI);for(let i=0;i<A.length-1;i++)if(a<=A[i+1][0]){const t=(a-A[i][0])/(A[i+1][0]-A[i][0]);return A[i][1]+(A[i+1][1]-A[i][1])*t;}return A[A.length-1][1];};}
/* ---------- hình học thẻ tóc / ống tết ---------- */
const crBuf=()=>({p:[],c:[],u:[],n:[]});
function crCard(B,pts,nn,w,col,u0,u1,v0,v1,curl){const L=pts.length,nc=curl?3:2,P=[],Cc=[],U=[],N=[];for(let q=0;q<nc;q++){P.push([]);Cc.push([]);U.push([]);N.push([]);}
  for(let j=0;j<L;j++){const d=v3nrm(v3sub(pts[Math.min(L-1,j+1)],pts[Math.max(0,j-1)])),sd=v3nrm(v3crs(d,nn[j])),v=v0+(v1-v0)*j/(L-1),cj=Array.isArray(col[0])?col[j]:col;
    for(let q=0;q<nc;q++){const t=nc===2?(q?1:-1):(q-1),drop=curl?curl*w[j]*Math.abs(t):0;P[q].push(v3add(v3add(pts[j],sd,t*w[j]),nn[j],-drop));Cc[q].push(cj);U[q].push([u0+(u1-u0)*(t+1)/2,v]);N[q].push(curl?v3nrm(v3add(nn[j],sd,t*0.55)):nn[j]);}}
  for(let q=0;q<nc-1;q++)for(let j=0;j<L-1;j++){const A=[q,j],Bq=[q+1,j],Cq=[q+1,j+1],D=[q,j+1];[[A,Bq,Cq],[A,Cq,D]].forEach(t=>t.forEach(x=>{B.p.push(P[x[0]][x[1]]);B.c.push(Cc[x[0]][x[1]]);B.u.push(U[x[0]][x[1]]);B.n.push(N[x[0]][x[1]]);}));}}
function crGrid(B,P,Cc,U,N){for(let r=0;r<P.length-1;r++)for(let j=0;j<P[0].length-1;j++){const A=[r,j],Bq=[r,j+1],Cq=[r+1,j+1],D=[r+1,j];[[A,Bq,Cq],[A,Cq,D]].forEach(t=>t.forEach(x=>{B.p.push(P[x[0]][x[1]]);B.c.push(Cc[x[0]][x[1]]);B.u.push(U[x[0]][x[1]]);B.n.push(N[x[0]][x[1]]);}));}}
function crTube(B,pts,rad,n,col,twist){const P=[],Cc=[],U=[],N=[];let e1p=null;for(let j=0;j<pts.length;j++){const d=v3nrm(v3sub(pts[Math.min(pts.length-1,j+1)],pts[Math.max(0,j-1)]));let ax=e1p||(Math.abs(d[2])>0.9?[1,0,0]:[0,0,1]);let e1=v3nrm(v3sub(ax,v3mul(d,v3dot(ax,d))));const e2=v3crs(d,e1);e1p=e1;
    const r=rad[j],row=[],cr=[],ur=[],nr=[];for(let i=0;i<=n;i++){const a=2*Math.PI*i/n+(twist||0)*j,nn=v3add(v3mul(e1,Math.cos(a)),e2,Math.sin(a));row.push(v3add(pts[j],nn,r*(1+0.18*Math.cos(a*2+j*2.2)*(twist?1:0))));cr.push(col);ur.push([i/n*0.6,0.02+0.05*i/n]);nr.push(nn);}P.push(row);Cc.push(cr);U.push(ur);N.push(nr);}crGrid(B,P,Cc,U,N);}
function crBall(B,c,r,sc,col){const P=[],Cc=[],U=[],N=[],ws=12,hs=8;for(let j=0;j<=hs;j++){const v=Math.PI*j/hs,row=[],cr=[],ur=[],nr=[];for(let i=0;i<=ws;i++){const u=2*Math.PI*i/ws,d=[Math.sin(v)*Math.sin(u),Math.cos(v),Math.sin(v)*Math.cos(u)];row.push([c[0]+d[0]*r*sc[0],c[1]+d[1]*r*sc[1],c[2]+d[2]*r*sc[2]]);cr.push(col);ur.push([i/ws*0.6,0.02+0.04*j/hs]);nr.push(d);}P.push(row);Cc.push(cr);U.push(ur);N.push(nr);}crGrid(B,P,Cc,U,N);}
function crMesh(B,mat){const T=THREE,n=B.p.length;if(!n)return null;const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3),uv=new Float32Array(n*2);
  for(let i=0;i<n;i++){pos.set(B.p[i],i*3);nor.set(B.n[i],i*3);col.set(B.c[i],i*3);uv[i*2]=B.u[i][0];uv[i*2+1]=B.u[i][1];}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(nor,3));g.setAttribute('color',new T.BufferAttribute(col,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));
  const m=new T.Mesh(g,mat);m.castShadow=true;m.receiveShadow=true;m.userData.crAdd=1;m.userData.part='hair';return m;}
/* ---------- kiểu tóc mới (dựng trên đầu trọc hoặc trên kiểu buộc gáy) ---------- */
function crHairStyle(G,R,a,keep){const H=CR_HS[a.hs]||CR_HS[0];if(!H.c)return;const head=R.head,fem=!!a.f,HC=crHex(crHairHex(a)),rn=crRng(1000+a.hs*31+a.hc*7+(fem?3:0));
  const hairM=head.children.find(m=>m.isMesh&&m.userData.part==='hair'),mat=hairM?hairM.material:new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,alphaTest:0.4});
  const skins=crHeadSkins(R);const hc=()=>v3mul(HC,0.9+0.16*rn());const B=crBuf(),add=(o,par)=>{if(!o)return;o.userData.crAdd=1;(par||head).add(o);if(keep)crKeep0(o);};
  const tint=(hl,str)=>skins.forEach(skinM=>{const pa=skinM.geometry.attributes.position,ca=skinM.geometry.attributes.color;if(!ca)return;const dk=v3mul(HC,0.55),hq=!!skinM.userData.crHQ;
    for(let i=0;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i),z=pa.getZ(i),r=crProf(y);if(Math.abs(x)>r[1]+0.07&&y<4.3)continue;const hy=hl(Math.atan2(x,z+0.15))+(hq?0.035*(crVn(Math.atan2(x,z+0.15)*6,0,0,9)-0.5):0),t=(hq?crSS(hy-0.08,hy+0.05,y):crSS(hy-0.2,hy+0.06,y))*str(x,y,z);if(t<=0)continue;
      const k=crMix([ca.getX(i),ca.getY(i),ca.getZ(i)],dk,t);ca.setXYZ(i,k[0],k[1],k[2]);}ca.needsUpdate=true;});
  const sweep=(d0,d1,n,l0,l1,bul,w)=>{const pts=[],nn=[];for(let k=0;k<=n;k++){const f=k/n,d=v3nrm(v3lerp(d0,d1,f));pts.push(v3add(crScalp(d),d,l0+(l1-l0)*f+bul*Math.sin(f*Math.PI)));nn.push(d);}
    const u0=rn()*0.65;crCard(B,pts,nn,pts.map((_,k)=>w*(1-0.4*Math.pow(k/n,2))),hc(),u0,u0+0.3,0,0.32+0.12*rn(),0.3);};
  const flow=(d0,fl,L,lift,w)=>{let p=v3add(crScalp(d0),d0,0.04);const pts=[],nn=[];for(let k=0;k<=2;k++){const d=v3nrm(v3sub(p,CRC));pts.push(p);nn.push(d);let t=v3nrm(v3sub(fl,v3mul(d,v3dot(fl,d))));p=v3add(v3add(p,t,L/2),d,lift);}
    const u0=rn()*0.7;crCard(B,pts,nn,[w,w*0.9,w*0.55],hc(),u0,u0+0.28,0,0.28+0.12*rn(),0.3);};
  const hide=()=>{const tail=G.userData.crTail;if(tail)tail.visible=false;R.hair=null;};
  const tie=head.children.find(m=>m.isMesh&&m.userData.part==='hide');let TP=[0,2.8,-2.3];if(tie){tie.geometry.computeBoundingBox();const bb=tie.geometry.boundingBox;TP=[0,(bb.min.y+bb.max.y)/2,(bb.min.z+bb.max.z)/2];}
  const swing=(pv)=>{const g=new THREE.Group();g.name='crHair';g.position.set(pv[0],pv[1],pv[2]);g.userData.crAdd=1;head.add(g);R.hair=g;return g;};
  const rel=(B2,pv)=>{B2.p=B2.p.map(p=>v3sub(p,pv));return B2;};
  if(H.c==='knot'){const hl=crHL(fem);tint(hl,()=>1);const dK=v3nrm([0,1,-0.42]);
    [5.75,5.3,4.8,4.3,3.75,3.2,2.65].forEach((y,ri)=>{const nr=Math.round(7+7*Math.sin(Math.min(Math.PI/2,(6-y)*0.9)));for(let i=0;i<nr;i++){const u=2*Math.PI*(i+0.5*(ri%2))/nr;if(y<hl(u)+0.12)continue;sweep(crDir(u,y),dK,4,0.03+0.012*ri,0.14,0.05+0.03*rn(),0.42+0.1*rn());}});
    const kc=v3add(crScalp(dK),dK,0.55);crBall(B,kc,0.6,[1,0.82,1],v3mul(HC,0.8));
    for(let k=0;k<12;k++){const a0=k/12*2*Math.PI,pts=[],nn=[];for(let j=0;j<=4;j++){const la=-1.1+j*0.62,lo=a0+la*0.9,d=[Math.cos(la)*Math.sin(lo),Math.sin(la),Math.cos(la)*Math.cos(lo)];pts.push([kc[0]+d[0]*0.64,kc[1]+d[1]*0.54,kc[2]+d[2]*0.64]);nn.push(d);}crCard(B,pts,nn,[0.2,0.3,0.32,0.28,0.14],hc(),rn()*0.6,0.9,0,0.25);}
    const tb=crBuf();crTube(tb,[v3add(kc,dK,-0.55),v3add(kc,dK,-0.32)],[0.42,0.4],10,crHex('#5e3a1e'));add(crMesh(tb,crSolidMat('#5e3a1e')));}
  else if(H.c==='side'){const hl=crHL(fem,0.05);tint(hl,(x,y)=>0.32+0.68*crSS(0.95,0.6,Math.abs(x))*crSS(3.9,4.6,y));
    [-0.52,-0.26,0,0.26,0.52].forEach(xi=>[0.8,0.48,0.16,-0.16,-0.48,-0.8].forEach((ph,k)=>{const d0=v3nrm([xi*0.5,Math.cos(ph),Math.sin(ph)]),d1=v3nrm([xi*0.55,Math.cos(ph-0.55),Math.sin(ph-0.55)]);
      sweep(d0,d1,3,0.05+(k<2?0.05:0),0.1+0.1*(1-Math.abs(xi)),0.1*(1-Math.abs(xi)),0.3+0.06*rn());}));}
  else if(H.c==='crop'){const hl=crHL(fem,0.08);tint(hl,()=>1);
    [5.95,5.6,5.15,4.65,4.15,3.65,3.15,2.6].forEach((y,ri)=>{const nr=ri===0?4:Math.round(8+8*Math.sin(Math.min(Math.PI/2,(6-y)*0.9)));for(let i=0;i<nr;i++){const u=2*Math.PI*(i+0.5*(ri%2))/nr+(rn()-0.5)*0.2;if(y<hl(u)+0.12)continue;
      const fr=Math.cos(u)>0.3&&y>4.3;flow(crDir(u,y),fr?[0,0.5,-1]:[Math.sin(u)*0.2,-1,-0.5],0.5+0.15*rn(),0.025,0.28+0.06*rn());}});}
  else if(H.c==='bald'){if(!fem)tint(crHL(fem,0.05),()=>0.22);}
  else if(H.c==='long'||H.c==='mid'){hide();if(tie)tie.visible=false;const g=swing(TP),C=crBuf(),yEnd=H.c==='mid'?-0.7:(fem?-4.4:-2.6),N=16;
    for(let L=0;L<2;L++)for(let k=0;k<N;k++){const aa=(k/(N-1)-0.5)*2.9+(L?0.09:0),u=Math.PI+aa,y0=3.15+0.75*crSS(0.75,1.3,Math.abs(aa)),d=crDir(u,y0),s=v3add(crScalp(d),d,0.1+L*0.06);
      const zb=-2.05-L*0.08-0.1*Math.cos(aa),xs=s[0],pts=[s,[xs*1.03,s[1]-0.9,Math.min(s[2]-0.35,zb+0.6)],[xs*1.08,Math.min(1.3,s[1]-1.6),zb+0.15],[xs*1.13,(1.3+yEnd)/2,zb],[xs*1.18,yEnd+0.25*Math.cos(aa*3)+(L?0.3:0),zb-0.05]];
      const nn=pts.map(p=>v3nrm([p[0],0.1,p[2]+1.0]));const w=0.5-0.06*L,u0=rn()*0.6;crCard(C,pts,nn,[w,w,w*0.95,w*0.85,w*0.5],pts.map(()=>hc()),u0,u0+0.32,0,0.48,0.2);}
    const m=crMesh(rel(C,TP),mat);if(m){g.add(m);if(keep)crKeep0(m);}}
  else if(H.c==='bunlow'){hide();const kc=[0,TP[1]-0.05,TP[2]-0.4];crBall(B,kc,0.7,[1.1,0.85,0.95],v3mul(HC,0.8));
    for(let k=0;k<12;k++){const a0=k/12*2*Math.PI,pts=[],nn=[];for(let j=0;j<=4;j++){const la=-1.1+j*0.62,lo=a0+la*0.9,d=[Math.cos(la)*Math.sin(lo),Math.sin(la),Math.cos(la)*Math.cos(lo)];pts.push([kc[0]+d[0]*0.8,kc[1]+d[1]*0.62,kc[2]+d[2]*0.7]);nn.push(d);}crCard(B,pts,nn,[0.2,0.3,0.32,0.28,0.14],hc(),rn()*0.6,0.9,0,0.25);}}
  else if(H.c==='twin'){hide();if(tie)tie.visible=false;const pv=[0,3.0,-1.2],g=swing(pv),C=crBuf();
    [-1,1].forEach(s=>{const pts=[],rad=[];for(let j=0;j<=10;j++){const f=j/10;pts.push([s*(1.2+0.4*Math.sin(f*1.6)),3.0-f*(fem?6.6:5.2),-1.25-0.65*Math.sin(Math.min(1,f*2)*Math.PI/2)]);rad.push(0.36-0.12*f);}
      crTube(C,pts,rad,6,v3mul(HC,0.92),0.5);const e=pts[10];crTube(C,[v3add(e,[0,0.32,0]),v3add(e,[0,0.06,0])],[0.27,0.27],8,crHex('#5e3a1e'));
      for(let k=0;k<4;k++){const aa=k/4*2*Math.PI,p0=v3add(e,[Math.cos(aa)*0.1,0,Math.sin(aa)*0.1]);crCard(C,[p0,v3add(p0,[Math.cos(aa)*0.12,-0.5,Math.sin(aa)*0.1]),v3add(p0,[Math.cos(aa)*0.25,-1.0,Math.sin(aa)*0.16])],[0,1,2].map(()=>v3nrm([Math.cos(aa),0.2,Math.sin(aa)])),[0.18,0.2,0.14],hc(),0.2,0.45,0,0.4);}});
    const m=crMesh(rel(C,pv),mat);if(m){g.add(m);if(keep)crKeep0(m);}}
  add(crMesh(B,mat));}
const CR_MAT={};
function crSolidMat(h){return CR_MAT['s'+h]||(CR_MAT['s'+h]=new THREE.MeshStandardMaterial({color:h,roughness:0.85}));}
/* ---------- lớp phủ (vẽ, xăm, tàn nhang, sẹo, nếp nhăn): chép tam giác da, ánh xạ UV theo vị trí ---------- */
function crCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function crTex(c){const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.flipY=false;t.wrapS=THREE.RepeatWrapping;t.anisotropy=4;return t;}
function crDecalMat(tex,key,shared){if(shared&&CR_MAT[key])return CR_MAT[key];const m=new THREE.MeshStandardMaterial({map:tex,transparent:true,depthWrite:false,roughness:0.82,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});m.userData.crOwn=!shared;if(shared)CR_MAT[key]=m;return m;}
function crDecal(src,sel,uvf,mat,keep){const T=THREE,pa=src.geometry.attributes.position,na=src.geometry.attributes.normal,ix=src.geometry.index,P=[],N=[],U=[],cnt=ix?ix.count:pa.count,V=k=>ix?ix.getX(k):k;
  for(let i=0;i<cnt;i+=3){let ok=true;const tri=[];for(let q=0;q<3;q++){const v=V(i+q),p=[pa.getX(v),pa.getY(v),pa.getZ(v)];if(!sel(p)){ok=false;break;}tri.push(p);}if(!ok)continue;
    const uv=tri.map(uvf);const us=uv.map(x=>x[0]);if(Math.max(...us)-Math.min(...us)>0.5)uv.forEach(x=>{if(x[0]<0.5)x[0]+=1;});
    for(let q=0;q<3;q++){const v=V(i+q),n=[na.getX(v),na.getY(v),na.getZ(v)];P.push(...v3add(tri[q],n,0.014));N.push(...n);U.push(uv[q][0],uv[q][1]);}}
  if(!P.length)return null;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('normal',new T.Float32BufferAttribute(N,3));g.setAttribute('uv',new T.Float32BufferAttribute(U,2));
  const m=new T.Mesh(g,mat);m.userData.crAdd=1;m.userData.part='decal';m.receiveShadow=true;m.renderOrder=2;src.parent.add(m);if(keep)crKeep0(m);return m;}
// mặt: X=(x+1.7)/3.4, Y=(4.9-y)/3.4 trên khung 512
function crFaceCanvas(a,fem){const W=512,c=crCanvas(W,W),g=c.getContext('2d'),X=x=>(x+1.7)/3.4*W,Y=y=>(4.9-y)/3.4*W,rn=crRng(77+a.fp*13+a.mo*5),any={v:0};
  const dot=(x,y,r,col,al)=>{g.globalAlpha=al;g.fillStyle=col;g.beginPath();g.arc(X(x),Y(y),r,0,7);g.fill();any.v=1;};
  const line=(pts,w,col,al)=>{g.globalAlpha=al;g.strokeStyle=col;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.stroke();any.v=1;};
  const wk=Math.max(a.wk,a.ag*0.7);if(wk>0.05){const al=0.18*wk;[4.3,4.45,4.6].forEach((y,i)=>line([[-0.75+i*0.1,y],[-0.25,y+0.04],[0.25,y+0.04],[0.75-i*0.1,y]],3,'#3a2016',al));
    [-1,1].forEach(s=>{[[0.1,0.1],[0,-0.05],[-0.05,-0.18]].forEach(([dy,dd])=>line([[s*1.0,3.4+dy*0.3],[s*1.18,3.4+dy+dd]],2.5,'#3a2016',al));line([[s*0.36,2.78],[s*0.5,2.55],[s*0.55,2.3]],4,'#3a2016',al*1.2);line([[s*0.3,3.18],[s*0.62,3.1],[s*0.88,3.17]],2.5,'#4a2a1a',al);});}
  if(a.fr>0.02){const n=Math.round(20+110*a.fr);for(let i=0;i<n;i++){const s=rn()<0.5?-1:1,x=(rn()<0.25?(rn()-0.5)*0.5:s*(0.45+rn()*0.75)),y=2.75+rn()*0.65-(Math.abs(x)<0.3?0.0:0.1);dot(x,y,1.2+rn()*2.2,'#6e3a22',0.25+0.35*a.fr*rn());}}
  if(a.mo>0){const M=a.mo===1?[[0.72,2.55]]:[[0.72,2.55],[-0.95,2.95],[0.35,1.95]];M.forEach(([x,y])=>dot(x,y,3.2,'#2a1610',0.85));}
  if(a.sc===1)line([[0.65,3.05],[0.9,2.75],[1.1,2.5]],5,'#e8b8a0',0.7);if(a.sc===2){line([[-0.45,4.05],[-0.6,3.8],[-0.72,3.55]],4.5,'#e8b8a0',0.75);}if(a.sc===3)line([[-0.25,1.75],[0.05,1.62],[0.3,1.68]],4.5,'#e8b8a0',0.7);
  if(a.fp>0){const col=(CR_FC[a.fc]||CR_FC[0])[1],al=0.88;g.globalAlpha=al;g.fillStyle=col;g.strokeStyle=col;any.v=1;
    if(a.fp===1)[-1,1].forEach(s=>[2.95,2.75,2.55].forEach((y,i)=>line([[s*0.62,y],[s*(1.15-i*0.05),y-0.05]],9,col,al)));
    if(a.fp===2){g.beginPath();g.moveTo(X(-1.45),Y(3.62));g.lineTo(X(1.45),Y(3.62));g.lineTo(X(1.4),Y(3.15));g.lineTo(X(0.18),Y(3.2));g.lineTo(X(0),Y(3.05));g.lineTo(X(-0.18),Y(3.2));g.lineTo(X(-1.4),Y(3.15));g.closePath();g.fill();}
    if(a.fp===3){for(let i=-3;i<=3;i++)dot(i*0.2,4.3-Math.abs(i)*0.03,6,col,al);[-1,1].forEach(s=>[0,1,2].forEach(i=>dot(s*(0.75+i*0.17),2.9-i*0.05,5,col,al)));}
    if(a.fp===4){g.beginPath();g.moveTo(X(0),Y(5));g.lineTo(X(1.8),Y(5));g.lineTo(X(1.8),Y(1.2));g.lineTo(X(0),Y(1.2));g.closePath();g.fill();g.globalAlpha=1;g.globalCompositeOperation='destination-out';g.beginPath();g.ellipse(X(0.62),Y(3.4),18,11,0,0,7);g.fill();g.globalCompositeOperation='source-over';}
    if(a.fp===5){[-1,1].forEach(s=>line([[s*1.2,4.45],[0,3.95]],8,col,al));line([[0,3.85],[0,3.2]],7,col,al);[-1,1].forEach(s=>line([[s*0.55,2.6],[s*1.15,2.95]],7,col,al));}
    if(a.fp===6){[-0.3,-0.1,0.1,0.3].forEach(x=>line([[x,2.0],[x*1.1,1.35]],7,col,al));line([[-0.5,2.42],[-0.42,2.0]],5,col,al*0.6);}}
  g.globalAlpha=1;return any.v?c:null;}
// hoa văn quấn quanh chi (u quanh, v dọc) — dùng chung theo mẫu
function crLimbTex(kind,col){const key='l'+kind+col;if(CR_MAT[key])return CR_MAT[key];const W=512,H=256,c=crCanvas(W,H),g=c.getContext('2d');g.fillStyle=col;g.strokeStyle=col;g.lineCap='round';
  const band=(v0,v1)=>{g.fillRect(0,v0*H,W,(v1-v0)*H);};
  if(kind==='ochre'){band(0.16,0.2);band(0.25,0.29);g.lineWidth=7;g.beginPath();for(let x=0;x<=W;x+=32)g.lineTo(x,(x/32)%2?0.42*H:0.5*H);g.stroke();band(0.7,0.73);band(0.78,0.81);}
  if(kind==='clay'){for(let r=0;r<4;r++)for(let x=0;x<W;x+=40){g.beginPath();g.arc(x+(r%2)*20,(0.2+r*0.17)*H,6,0,7);g.fill();}}
  if(kind==='dongson'){band(0.18,0.205);band(0.4,0.425);g.lineWidth=4;for(let x=24;x<W;x+=64){[18,11,5].forEach(r=>{g.beginPath();g.arc(x,0.3*H,r,0,7);g.stroke();});g.beginPath();g.moveTo(x+18,0.3*H-18);g.lineTo(x+46,0.3*H+18);g.stroke();}
    band(0.6,0.62);g.beginPath();for(let x=0;x<=W;x+=16)g.lineTo(x,(x/16)%2?0.66*H:0.72*H);g.stroke();band(0.76,0.78);}
  if(kind==='giaolong'){g.lineWidth=5;for(let r=0;r<5;r++)for(let x=0;x<W+40;x+=40){g.beginPath();g.arc(x+(r%2)*20,(0.15+r*0.14)*H,17,0,Math.PI);g.stroke();}band(0.08,0.1);band(0.86,0.88);}
  if(kind==='rang'){g.lineWidth=5;[0.2,0.45,0.7].forEach(v=>{g.beginPath();for(let x=0;x<=W;x+=24)g.lineTo(x,((x/24)%2?v-0.06:v+0.06)*H);g.stroke();band(v-0.1,v-0.09);band(v+0.09,v+0.1);});}
  if(kind==='scar'){g.fillStyle='#e8b8a0';g.fillRect(0.3*W,0.35*H,0.12*W,0.02*H);g.save();g.translate(0.36*W,0.38*H);g.rotate(0.5);g.fillRect(-30,-3,60,6);g.restore();}
  return CR_MAT[key]=crDecalMat(crTex(c),key+'m',true);}
function crDecals(G,R,a,keep){const skinOf=b=>b&&b.children.find(m=>m.isMesh&&m.userData.part==='skin');
  const heads=crHeadSkins(R).filter(m=>m.userData.crHQ||(m.parent&&m.parent.name==='crLo')||m.parent===R.head);if(heads.length){const fc=crFaceCanvas(a,!!a.f);if(fc){const m=crDecalMat(crTex(fc),'',false);heads.forEach(head=>crDecal(head,p=>p[2]>0.15&&p[1]>1.2&&p[1]<5.3&&Math.abs(p[0])<1.62,p=>[(p[0]+1.7)/3.4,(4.9-p[1])/3.4],m,keep));}}
  const cyl=(b,cx,v0,L,mat)=>{const s=skinOf(b);if(s)crDecal(s,p=>true,p=>[Math.atan2(p[0]-cx,p[2])/(2*Math.PI)+0.5,(v0-p[1])/L],mat,keep);};
  const lim=(mat,parts)=>{if(parts.arm)['L','R'].forEach(n=>{cyl(R['arm'+n],(n==='L'?-1:1)*0.15,0.8,7.6,mat);cyl(R['fore'+n],0,0.4,5.8,mat);});
    if(parts.leg)['L','R'].forEach(n=>{cyl(R['shin'+n],0,0.4,8.6,mat);cyl(R['leg'+n],0,-1,7.4,mat);});
    if(parts.chest){const s=skinOf(R.torso);if(s)crDecal(s,p=>p[1]>3.2&&p[1]<8.4,p=>[Math.atan2(p[0],p[2])/(2*Math.PI)*1.5+0.5,(8.6-p[1])/6.5],mat,keep);}};
  if(a.pt>0)lim(crLimbTex(a.pt===1?'ochre':'clay',a.pt===1?'#a8321c':'#ece2cc'),{arm:1,chest:1});
  if(a.tt>0)lim(crLimbTex(['','dongson','giaolong','rang'][a.tt],'#1d2636'),{arm:a.tp&1,chest:a.tp&2,leg:a.tp&4});
  if(a.sc===4)cyl(R.armL,-0.15,0.8,7.6,crLimbTex('scar','#e8b8a0'));}
/* ---------- nền đẹp mặc định theo giới (cộng dưới thanh trượt; thanh ở 0 = gương mặt cân đối, ưa nhìn) ---------- */
const CR_BASE={m:{es:0.22,el:0.12,nw:-0.12,jw:-0.05,ja:0.25,cn:-0.1,lu:0.1,lb:0.15,bt:-0.15,nb:0.15,ch:0.15,cf:-0.1},
  f:{es:0.45,el:0.3,ls:0.25,nw:-0.32,nl:-0.2,nt:-0.25,nb:0.1,jw:-0.5,ja:-0.35,cn:-0.5,cl:0.1,lu:0.4,lb:0.5,mw:-0.12,bt:-0.6,ba:0.4,br:-0.6,cf:0.15,ch:0.3,hw:-0.15,mc:0.15,ep:-0.15}};
function crEff(a){const B=CR_BASE[a.f?'f':'m'],o=Object.assign({},a);for(const k in B)o[k]=Math.max(-1.7,Math.min(1.7,(o[k]||0)+B[k]));return o;}
/* ---------- biến dạng khuôn mặt theo vùng (tọa độ đầu: gốc = cổ, mắt y≈3.4, mặt hướng +Z) ---------- */
function crMorphFn(a,fem){const EX=fem?0.6:0.62,EY=3.4,EZ=fem?1.29:1.31,FS=CR_FACE[a.fs]||CR_FACE[0];const JW=a.jw+FS.jw,CL=a.cl+FS.cl,FW=1+0.05*a.hw+FS.fw,FL=0.06*a.hl+FS.fl;
  const ES=1+0.17*a.es,EL=1+0.2*a.el,ET=0.15*a.et,CF=a.cf+0.45*a.fa;
  return (p)=>{const x=p[0],y=p[1],z=p[2],ax=Math.abs(x),s=x<0?-1:1,fr=crSS(0.35,1.15,z),fr2=crSS(-0.3,0.8,z);let dx=0,dy=0,dz=0;
    {const vx=x-s*EX,vy=y-EY,vz=z-EZ,d=Math.hypot(vx,vy,vz),w=crSS(0.64,0.3,d);if(w>0){let qx=vx*(1+(ES-1)*w),qy=vy*(1+(ES*EL-1)*w),qz=vz*(1+(ES-1)*w);const th=s*ET*w,cs=Math.cos(th),sn=Math.sin(th),rx=qx*cs-qy*sn,ry=qx*sn+qy*cs;
      dx+=rx-vx+s*0.07*a.ed*w;dy+=ry-vy+0.08*a.eh*w;dz+=qz-vz-0.07*a.ep*w;}}
    dy+=0.16*a.fo*crSS(3.9,4.7,y)*(1-crSS(5.2,5.95,y))*fr;dz-=0.12*a.fsl*crSS(3.95,5.3,y)*fr;dz+=0.07*a.br*crGs(y,3.86,0.15)*crSS(1.4,0.4,ax)*fr;
    const nm=crSS(0.5,0.12,ax)*fr;dy-=0.11*a.nl*crGs(y,2.75,0.24)*nm;dz+=0.09*a.nb*crGs(y,3.45,0.22)*crSS(0.32,0.06,ax)*fr;
    {const ty=y-2.82,tz=z-2.12,d=Math.hypot(x,ty,tz),w=crSS(0.4,0.12,d)*fr;dx+=x*0.3*a.nt*w;dy+=ty*0.3*a.nt*w;dz+=tz*0.3*a.nt*w+0.03*a.nt*w;}
    dx+=x*0.24*a.nw*crGs(y,2.95,0.38)*crSS(0.55,0.15,ax)*fr;dx+=s*0.08*a.nf*crGs(ax,0.28,0.12)*crGs(y,2.72,0.12)*fr;
    {const g=crGs(ax,1.08,0.3)*crGs(y,3.0,0.28)*fr2;dy+=0.09*a.ch*g;dx+=s*0.08*a.cw*g;dz+=0.03*a.cw*g;}
    {const g=crGs(ax,0.95,0.32)*crGs(y,2.45,0.32)*fr2;dx+=s*0.08*CF*g;dz+=0.06*CF*g;}
    {const m=crGs(y,2.3,0.2)*crSS(0.78,0.3,ax)*fr;dx+=x*0.17*a.mw*m;const lp=crSS(0.52,0.18,ax)*fr;dz+=0.06*a.lu*crGs(y,2.36,0.05)*lp+0.065*a.lb*crGs(y,2.22,0.06)*lp;dy+=0.015*a.lu*crGs(y,2.38,0.06)*lp-0.015*a.lb*crGs(y,2.2,0.06)*lp;
      dy+=0.05*a.mc*crGs(ax,0.42,0.1)*crGs(y,2.3,0.08)*fr;}
    {const jm=crSS(2.95,2.2,y)*crSS(0.9,1.5,y);dx+=x*0.1*JW*jm*crSS(0.3,1.0,ax);const jg=crGs(y,1.85,0.3)*crSS(0.8,1.15,ax)*crSS(1.3,0.2,z);dx+=s*0.08*a.ja*jg;dy-=0.06*a.ja*jg;
      const cm=crGs(y,1.55,0.32)*crSS(0.75,0.2,ax)*crSS(0.3,1.1,z);dy-=0.12*CL*cm;dz+=0.1*a.cp*cm;dx+=x*0.25*a.cn*cm;}
    {const ec=[s*1.63,3.15,-0.28],d=Math.hypot(x-ec[0],y-ec[1],z-ec[2]),w=crSS(1.42,1.6,ax)*crSS(0.85,0.5,d);if(w>0){const k=0.22*a.er*w;dx+=(x-ec[0])*k+s*0.6*a.ea*Math.max(0,ax-1.5)*w;dy+=(y-ec[1])*k;dz+=(z-ec[2])*k+0.12*a.ea*Math.max(0,ax-1.5)*w;}}
    if(y<1.95&&ax<1.05)dx+=x*0.13*a.nk*crSS(1.75,1.0,y);
    let X=x+dx,Y=y+dy-FL*Math.max(0,Math.min(1.7,3.3-y))*crSS(0.2,1.4,y),Z=z+dz;X*=1+(FW-1)*crSS(0.8,1.5,y);return [X,Y,Z];};}
function crMorphMesh(m,f){const pa=m.geometry.attributes.position;for(let i=0;i<pa.count;i++){const q=f([pa.getX(i),pa.getY(i),pa.getZ(i)]);pa.setXYZ(i,q[0],q[1],q[2]);}pa.needsUpdate=true;if(m.geometry.index)crNormals(m.geometry);m.geometry.computeBoundingSphere();}
/* ---------- lưu bản gốc (chỉ trong màn tạo: để chỉnh lại nhanh không phải dựng lại) ---------- */
function crKeep0(o){o.traverse(m=>{if(m.isMesh&&!m.userData.cr0){const g=m.geometry;m.userData.cr0={p:g.attributes.position.array.slice(),c:g.attributes.color?g.attributes.color.array.slice():null};}});}
function crRestore(G,cols){G.traverse(m=>{const o=m.userData.cr0;if(!m.isMesh||!o)return;const g=m.geometry;g.attributes.position.array.set(o.p);g.attributes.position.needsUpdate=true;if(cols&&o.c&&g.attributes.color){g.attributes.color.array.set(o.c);g.attributes.color.needsUpdate=true;}});}
/* ---------- sửa lưới tóc của bộ dựng: lông mi, lông mày, râu, ánh màu ---------- */
function crHairEdit(R,a,cols){const hm=R.head.children.find(m=>m.isMesh&&m.userData.part==='hair');if(!hm)return;const pa=hm.geometry.attributes.position,ca=hm.geometry.attributes.color,n=pa.count;
  const P=i=>[pa.getX(i),pa.getY(i),pa.getZ(i)],set=(i,p)=>pa.setXYZ(i,p[0],p[1],p[2]);
  if(n>=96){// lông mi: nhóm 6 đỉnh [a,b,c,a,c,d], c/d là mép ngoài
    const kL=R._crHQ?0:1+0.32*a.ls;for(let g=0;g<60;g+=6){const A=P(g),Bv=P(g+1);[[2,Bv],[4,Bv],[5,A]].forEach(([j,o])=>set(g+j,v3add(o,v3sub(P(g+j),o),kL)));}
    const kT=1+0.45*a.bt;for(let g=60;g<96;g+=6){const c0=v3lerp(P(g),P(g+1),0.5),c1=v3lerp(P(g+2),P(g+5),0.5);[[0,c0],[1,c0],[3,c0],[2,c1],[4,c1],[5,c1]].forEach(([j,c])=>{const p=P(g+j),q=v3add(c,v3sub(p,c),kT);
        const t=Math.max(0,Math.min(1,(Math.abs(p[0])-0.22)/0.9));q[1]+=0.07*a.ba*Math.sin(t*Math.PI)+0.08*a.bg*(t-0.4);set(g+j,q);});}
    if(cols&&ca){const bh=(CR_BROW[a.bc]||CR_BROW[0])[1];let bc=bh?v3mul(crHex(bh),0.85):null;if(a.ag>0){const gr=crHex('#9a958e');for(let i=60;i<96;i++){const k=crMix(bc||[ca.getX(i),ca.getY(i),ca.getZ(i)],gr,0.3*a.ag);ca.setXYZ(i,k[0],k[1],k[2]);}}else if(bc)for(let i=60;i<96;i++)ca.setXYZ(i,bc[0],bc[1],bc[2]);}}
  // râu: 72 đỉnh cuối = ria mép, trước đó các thẻ 12 đỉnh
  let b0=n;if(!a.f&&a.fh>=2){let e=n-72;while(e-12>=96){let cx=0,cy=0,cz=0;for(let i=e-12;i<e;i++){cx+=pa.getX(i);cy+=pa.getY(i);cz+=pa.getZ(i);}cx/=12;cy/=12;cz/=12;
      if(!(cy<3.45&&cz>-0.75&&!(cy>3.1&&Math.abs(cx)<1.05&&cz>0.9)))break;
      const kill=a.fh===2||(a.fh===4&&(Math.abs(cx)>0.72||cy>2.25));if(kill){const p0=P(e-12);for(let i=e-12;i<e;i++)set(i,p0);}
      else if(a.fh===5){const r=v3lerp(P(e-12),P(e-11),0.5);for(let i=e-12;i<e;i++)set(i,v3add(r,v3sub(P(i),r),0.55));}e-=12;}b0=e;}
  if(cols&&ca&&a.hg>0.01){const hk=crHex((CR_HK[a.hk]||CR_HK[0])[1]);for(let i=96;i<b0;i+=6){const x=pa.getX(i),y=pa.getY(i),z=pa.getZ(i),h=Math.abs(Math.sin(Math.floor(x*1.6)*12.9+Math.floor(y*1.6)*78.2+Math.floor(z*1.6)*37.7)*43758.5)%1;
      if(h<a.hg*0.65)for(let j=i;j<i+6&&j<b0;j++){const k=crMix([ca.getX(j),ca.getY(j),ca.getZ(j)],hk,0.7);ca.setXYZ(j,k[0],k[1],k[2]);}}}
  if(ca)ca.needsUpdate=true;pa.needsUpdate=true;}
function crAddedHairTint(R,a){if(a.hg<=0.01)return;const hk=crHex((CR_HK[a.hk]||CR_HK[0])[1]);R.head.traverse(m=>{if(!m.isMesh||!m.userData.crAdd||m.userData.part!=='hair')return;const pa=m.geometry.attributes.position,ca=m.geometry.attributes.color;if(!ca)return;
  for(let i=0;i<pa.count;i+=6){const h=Math.abs(Math.sin(Math.floor(pa.getX(i)*1.6)*12.9+Math.floor(pa.getY(i)*1.2)*78.2)*43758.5)%1;if(h<a.hg*0.65)for(let j=i;j<i+6&&j<pa.count;j++){const k=crMix([ca.getX(j),ca.getY(j),ca.getZ(j)],hk,0.7);ca.setXYZ(j,k[0],k[1],k[2]);}}ca.needsUpdate=true;});}
// da: râu lún phún, cháy nắng, quầng mắt theo tuổi
function crSkinTint(R,a){crHeadSkins(R).forEach(m=>crSkinTint1(m,a));}
function crSkinTint1(m,a){if(!m.geometry.attributes.color)return;const pa=m.geometry.attributes.position,ca=m.geometry.attributes.color,HC=crHex(crHairHex(a)),red=crHex('#b8483a');
  for(let i=0;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i),z=pa.getZ(i),ax=Math.abs(x);let k=[ca.getX(i),ca.getY(i),ca.getZ(i)],ch=0;
    if(!a.f&&a.fh===1){const u=Math.atan2(x,z+0.15),t=crSS(3.0,2.55,y)*crSS(1.0,1.4,y)*crSS(-0.3,0.2,Math.cos(u))*(1-crGs(y,2.3,0.11)*crSS(0.52,0.3,ax));if(t>0){k=crMix(k,crMix(k,HC,0.62),0.75*t);ch=1;}}
    if(a.sb>0){const t=a.sb*(crGs(ax,0,0.25)*crGs(y,2.95,0.3)+0.8*crGs(ax,0.95,0.35)*crGs(y,2.95,0.3))*crSS(0.6,1.3,z);if(t>0.005){k=crMix(k,red,0.38*t);ch=1;}}
    if(a.ag>0.05||a.wk>0.05){const t=Math.max(a.ag,a.wk)*crGs(ax,0.62,0.28)*crGs(y,3.12,0.1)*crSS(0.8,1.3,z);if(t>0.005){k=v3mul(k,1-0.18*t);ch=1;}}
    if(ch)ca.setXYZ(i,k[0],k[1],k[2]);}ca.needsUpdate=true;}
/* ---------- nét mặt hunt3: gắn vào khung đỡ theo đúng biến dạng ---------- */
function crFaceHold(G,R,a,f){if(typeof h3faceKit!=='function')return;let F=R._h3f;if(F===undefined){try{F=h3faceKit(R);}catch(e){F=null;}}if(!F||!F.g)return;const T=THREE;
  if(!F.crH){F.crH=[];const wrap=(o,kind,s)=>{const h=new T.Group();h.userData.p0=o.position.clone();h.userData.kind=kind;h.userData.s=s;F.g.add(h);h.add(o);F.crH.push(h);};
    F.lid.forEach((o,i)=>wrap(o,'eye',i?1:-1));F.iris.forEach((o,i)=>wrap(o,'eye',i?1:-1));F.brow.forEach((o,i)=>wrap(o,'brow',i?1:-1));if(F.mg)wrap(F.mg,'mouth',1);}
  const ES=1+0.17*a.es,EL=1+0.2*a.el;const bh=(CR_BROW[a.bc]||CR_BROW[0])[1]||crHairHex(a);
  F.crH.forEach(h=>{const p0=h.userData.p0,s=h.userData.s,k=h.userData.kind,D=f([p0.x,p0.y,p0.z]);let sc=[1,1,1],rz=0,dy=0;
    if(k==='eye'){sc=[ES,ES*EL,1+(ES-1)*0.35];rz=s*0.15*a.et;}else if(k==='brow'){sc=[0.9,(a.f?0.5:0.62)*(1+0.45*a.bt),0.8];rz=s*0.12*a.bg;dy=0.05*a.ba;}else sc=[(1+0.17*a.mw)*(R._crHQ?0.92:1),(1+0.1*(a.lu+a.lb)/2)*(R._crHQ?0.55:1),1];
    h.scale.set(sc[0],sc[1],sc[2]);h.rotation.set(0,0,rz);h.updateMatrix();const v=p0.clone().applyMatrix4(new T.Matrix4().makeRotationZ(rz).multiply(new T.Matrix4().makeScale(sc[0],sc[1],sc[2])));h.position.set(D[0]-v.x,D[1]-v.y+dy,D[2]-v.z-(R._crHQ&&k==='mouth'?0.035:0));});
  F.brow.forEach(b=>{b.material=CR_MAT['b'+bh]||(CR_MAT['b'+bh]=new T.MeshStandardMaterial({color:bh,roughness:0.9}));});}
/* ---------- thân: chiều cao, vai, ngực, eo, hông, tay, chân, dáng ---------- */
function crBody(G,R,a){const U=G.userData,T=THREE;if(!U.crB){const B={dims:Object.assign({},R.dims),hipsS:R.hips.scale.x,headY:R.headY,headR:R.headR,pos:{}};['armL','armR','foreL','foreR','handL','handR','legL','legR'].forEach(k=>{if(R[k])B.pos[k]=R[k].position.clone();});U.crB=B;
    // khớp lưng + khớp cổ (dáng đứng) chèn giữa xương — xoay cố định, không tốn mỗi khung
    const sp=new T.Group();sp.name='crSpine';sp.position.copy(R.torso.position);R.hips.add(sp);R.torso.position.set(0,0,0);sp.add(R.torso);U.crSpine=sp;
    const nk=new T.Group();nk.name='crNeck';nk.position.copy(R.head.position);R.torso.add(nk);R.head.position.set(0,0,0);nk.add(R.head);U.crNeckG=nk;}
  const B=U.crB,k=1+0.055*a.ht,kl=1-0.045*a.ll;R.dims.h=B.dims.h*k;R.hips.scale.setScalar(B.hipsS*k);R.headY=B.headY*k;R.headR=B.headR*k;
  U.crSpine.scale.setScalar(kl);U.crSpine.rotation.x=0.085*a.po;U.crNeckG.rotation.x=-0.06*a.po;R.head.scale.setScalar(1+0.06*a.hz);
  const ka=1+0.06*a.al,sw=0.955+0.08*a.sh+0.02*a.fa;/* vai gốc hẹp bớt 4,5% cho tay bớt dạng ra */['L','R'].forEach(n=>{const s=n==='L'?-1:1;const ar=R['arm'+n];if(!ar)return;ar.position.copy(B.pos['arm'+n]);ar.position.x*=sw;R['fore'+n].position.copy(B.pos['fore'+n]).multiplyScalar(ka);R['hand'+n].position.copy(B.pos['hand'+n]).multiplyScalar(ka);
    R['leg'+n].position.copy(B.pos['leg'+n]);R['leg'+n].position.x*=1+0.05*a.hp+0.02*a.fa;});R.dims.up=B.dims.up*ka;R.dims.fore=B.dims.fore*ka;
  const warp=(bone,fn)=>{if(!bone)return;bone.children.forEach(m=>{if(!m.isMesh)return;const pa=m.geometry.attributes.position;for(let i=0;i<pa.count;i++){const q=fn(pa.getX(i),pa.getY(i),pa.getZ(i));pa.setXYZ(i,q[0],q[1],q[2]);}pa.needsUpdate=true;m.geometry.computeBoundingSphere();});};
  const fem=!!a.f;warp(R.torso,(x,y,z)=>{const top=1-crSS(8.5,9.4,y),c=crGs(y,fem?4.95:5.2,1.4),w=crGs(y,1.4,1.5),sh=crSS(5.8,8.4,y);const kx=1+(0.08*a.sh*sh+0.05*a.cs*c+0.09*a.wa*w+0.05*a.fa*(0.5+0.5*w))*top;
    const kz=1+(0.06*a.cs*c*(z>0?1.4:0.4)+0.08*a.wa*w*(z>0?1.3:0.6)+0.08*a.fa*w*(z>0?1.4:0.7))*top;return [x*kx,y,z*kz];});
  if(R.cloak)R.cloak.scale.set(sw,1,1+0.05*a.fa);
  warp(R.hips,(x,y,z)=>{const k=1+(0.07*a.hp+0.05*a.fa)*crSS(-2.2,0.5,y);return [x*k,y,z*(1+(0.04*a.hp+0.05*a.fa)*crSS(-2.2,0.5,y))];});
  const kt=1.13+0.12*a.at+0.05*a.fa,kf=1.11+0.09*a.at+0.04*a.fa;/* bắp tay, cẳng tay gốc to thêm ~12% (trước mảnh như que) */['L','R'].forEach(n=>{warp(R['arm'+n],(x,y,z)=>[x*kt,y*ka,z*kt]);warp(R['fore'+n],(x,y,z)=>[x*kf,y*ka,z*kf]);const kh=1+0.1*a.hn;warp(R['hand'+n],(x,y,z)=>[x*kh,y*kh,z*kh]);
    const kL=1.12+0.1*a.lt+0.05*a.fa;/* đùi, bắp chân gốc to thêm 12% */warp(R['leg'+n],(x,y,z)=>[x*kL,y,z*kL]);warp(R['shin'+n],(x,y,z)=>[x*(1+(kL-1)*0.8),y,z*(1+(kL-1)*0.8)]);});}
/* ---------- hậu kỳ chính ---------- */
function crPost(G,a,keep,mode){const R=G.userData.rig;if(!R||!R.head)return;const U=G.userData,fem=!!a.f;U.crApp=a;
  if(U.crTail===undefined)U.crTail=R.hair||null;
  if(R._h3f===undefined&&typeof h3faceKit==='function'){try{h3faceKit(R);}catch(e){}}
  if(!U.crHQ&&U.crHQOk!==false){try{crHQ(G,R,a);}catch(e){console.warn('creator: đầu chi tiết',e);}}// nét mặt hunt3 đo trên lưới gốc, trước khi thêm lớp phủ/tóc
  if(mode==='morph'&&U.crDone){crRestore(G,false);}
  else{if(U.crDone){crRestore(G,true);const rm=[];G.traverse(o=>{if(o.userData.crAdd)rm.push(o);});rm.forEach(o=>{if(o.parent)o.parent.remove(o);o.traverse(m=>{if(m.isMesh){m.geometry.dispose();if(m.material&&m.material.userData.crOwn){if(m.material.map)m.material.map.dispose();m.material.dispose();}}});});
      if(U.crTail){U.crTail.visible=true;R.hair=U.crTail;}R.head.children.forEach(m=>{if(m.isMesh&&m.userData.part==='hide')m.visible=true;});}
    else if(keep)crKeep0(G);
    crHairStyle(G,R,a,keep);crSkinTint(R,a);crDecals(G,R,a,keep);crAddedHairTint(R,a);}
  U.crDone=1;const e=crEff(a);crHairEdit(R,e,mode!=='morph');crLashLen(R,e);
  const f=crMorphFn(e,fem);crFaceHold(G,R,e,f);crHeadMeshes(R).forEach(m=>crMorphMesh(m,f));
  if(R.hair&&R.hair!==U.crTail&&R.hair.userData.p0==null)R.hair.userData.p0=R.hair.position.toArray();if(R.hair&&R.hair.userData.p0){const q=f(R.hair.userData.p0);R.hair.position.set(q[0],q[1],q[2]);}
  else if(U.crTail){if(!U.crTail.userData.p0)U.crTail.userData.p0=U.crTail.position.toArray();const q=f(U.crTail.userData.p0);U.crTail.position.set(q[0],q[1],q[2]);}
  crBody(G,R,a);}
function isH3(m){let o=m.parent;while(o){if(o.name==='h3face')return true;if(o.name==='head')return false;o=o.parent;}return false;}
/* ===================== ĐẦU CHI TIẾT (độ phân giải cao) — thay đầu của bộ dựng khi dựng từ .app =====================
   Cùng hệ tọa độ/mốc giải phẫu với đầu gốc (mắt ±0.62,3.4 · chóp mũi y≈2.82 · miệng y≈2.3 · cằm y≈1.6) nên mọi thanh trượt, tóc, nét mặt hunt3 khớp nguyên.
   ~3.5k tam giác, pháp tuyến mượt; mi mắt bọc nhãn cầu, đường mi, nhãn cầu có tròng/con ngươi/lớp bóng; da có bản đồ lỗ chân lông.
   LOD: xa hơn CR_HQ_DIST thì hiện đầu gốc (nhẹ) — dùng THREE.LOD, chỉ tính khoảng cách mỗi khung. */
const CR_HQ_DIST=240;
function crProfS(y,fem){const H=CR_H0;let j=0;if(y>=H[0][0])j=0;else{while(j<H.length-2&&y<H[j+1][0])j++;}const a=H[Math.max(0,j-1)],b=H[j],c=H[Math.min(H.length-1,j+1)],d=H[Math.min(H.length-1,j+2)];
  const t=Math.max(0,Math.min(1,(b[0]-y)/((b[0]-c[0])||1))),cr=(p0,p1,p2,p3)=>0.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t);
  let xh=cr(a[1],b[1],c[1],d[1]),zf=cr(a[2],b[2],c[2],d[2]),zb=cr(a[3],b[3],c[3],d[3]);if(fem){xh*=1-0.07*crSS(2.6,1.6,y);zf-=0.06*crGs(y,3.86,0.18);}return [y,Math.max(0.02,xh),zf,zb];}
function crVn(x,y,z,s){const f=(a,b,c)=>{const v=Math.sin(a*127.1+b*311.7+c*74.7+s*13.1)*43758.5453;return v-Math.floor(v);};const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),xf=x-xi,yf=y-yi,zf=z-zi,sm=t=>t*t*(3-2*t);
  const L=(a,b,t)=>a+(b-a)*t,u=sm(xf),v=sm(yf),w=sm(zf);return L(L(L(f(xi,yi,zi),f(xi+1,yi,zi),u),L(f(xi,yi+1,zi),f(xi+1,yi+1,zi),u),v),L(L(f(xi,yi,zi+1),f(xi+1,yi,zi+1),u),L(f(xi,yi+1,zi+1),f(xi+1,yi+1,zi+1),u),v),w);}
// bề mặt đầu: dáng sọ + mốc mặt (gờ mày, hốc mắt, sống & chóp mũi có cánh mũi + lỗ mũi, gò má, nhân trung, môi có khối, rãnh mũi-má, hàm, cằm)
function crHeadModel(fem,EZ){const EX=0.62,EY=3.4,ER=fem?0.29:0.3;const hsp=v=>Math.sign(v)*Math.pow(Math.abs(v),0.8);
  const base=(u,y)=>{const r=crProfS(y,fem),s=Math.sin(u),c=Math.cos(u);return [r[1]*hsp(s),y,(c>=0?r[2]:r[3])*hsp(c)];};
  const disp=(u,y)=>{const p=base(u,y),x=p[0],ax=Math.abs(x),sx=x<0?-1:1,cu=Math.cos(u),fw=crSS(0.05,0.55,cu),M={};if(fw<=0)return [p,M];let dz=0,dx=0;
    dz+=(fem?0.06:0.12)*crGs(y,3.86,0.16)*crSS(1.4,0.5,ax)-0.035*crGs(y,3.72,0.1)*crGs(x,0,0.18);
    let nh=0;if(y<3.78&&y>2.45){if(y>3.3)nh=0.03+0.12*((3.78-y)/0.48);else if(y>2.84)nh=0.15+0.31*Math.pow((3.3-y)/0.46,1.15);else{const t=(2.84-y)/0.36;nh=0.46*Math.max(0,Math.cos(Math.min(1,t)*Math.PI/2))*(1-0.15*t);}}
    nh*=fem?0.86:1.02;const nw=0.13+0.1*Math.max(0,Math.min(1,(3.78-y)/1.0))+0.06*crGs(y,2.8,0.12);dz+=nh*Math.exp(-Math.pow(ax/nw,2.4));
    dz+=0.05*crGs(y,2.86,0.08)*crGs(ax,0,0.12);// chóp mũi tròn
    dz+=0.15*crGs(ax,0.25,0.1)*crGs(y,2.73,0.1)*(fem?0.85:1);dx+=0.04*crGs(ax,0.3,0.1)*crGs(y,2.74,0.1);dz-=0.045*crGs(ax,0.36,0.04)*crGs(y,2.77,0.1);// cánh mũi + nếp cánh mũi
    dz-=0.06*crGs(ax,0.13,0.045)*crGs(y,2.64,0.035);// lỗ mũi
    dz+=0.08*crGs(ax,1.0,0.32)*crGs(y,3.02,0.24);dx+=0.06*crGs(ax,1.15,0.3)*crGs(y,3.05,0.25);dz-=0.03*crGs(ax,0.62,0.22)*crGs(y,3.1,0.08);dx-=0.04*crGs(ax,1.45,0.2)*crGs(y,3.95,0.3);
    {const fx=0.36+0.26*(2.75-y)/0.5;dz-=0.022*crGs(ax-fx,0,0.05)*crSS(2.15,2.32,y)*crSS(2.8,2.7,y);}// rãnh mũi-má
    const lw=fem?0.39:0.42,lm=crSS(lw+0.07,lw-0.12,ax);dz+=0.05*crGs(y,2.42,0.11)*crSS(0.6,0.2,ax)-0.02*crGs(x,0,0.06)*crGs(y,2.5,0.08)+0.012*crGs(ax,0.075,0.03)*crGs(y,2.5,0.07);
    dz+=(fem?0.085:0.06)*crGs(y,2.35,0.045)*lm;dz-=0.065*crGs(y,2.305,0.028)*crSS(lw+0.1,lw-0.15,ax);dz+=(fem?0.115:0.09)*crGs(y,2.225,0.055)*lm;dz-=0.03*crGs(y,2.07,0.07)*crSS(0.5,0.2,ax);
    dz+=(fem?0.07:0.11)*crGs(y,1.62,0.24)*crSS(0.6,0.15,ax);dx+=(fem?0:0.05)*crGs(y,1.9,0.35)*crSS(0.6,1.0,ax);
    const ex=ax-EX;let z=p[2]+dz*fw;{const r=Math.sqrt(ex*ex*0.8+(y-EY)*(y-EY));if(r<0.62){const zt=EZ+(y<EY?0.2:0.13)+(y<EY?0.08:0.15)*crSS(0.25,0.5,r);z=Math.min(z,zt+(z-zt)*crSS(0.42,0.6,r));}}
    M.socket=crSS(0.2,0.05,(ex*ex+(y-EY)*(y-EY)));M.lip=(crSS(2.44,2.39,y)*crSS(2.29,2.32,y)+crSS(2.31,2.28,y)*crSS(2.1,2.16,y))*crSS(lw+0.04,lw-0.08,ax)*fw;
    M.nose=crGs(y,2.82,0.18)*crSS(0.35,0.1,ax)*fw;M.nostril=crGs(ax,0.13,0.045)*crGs(y,2.64,0.03)*fw;M.cheek=crGs(ax,1.0,0.35)*crGs(y,2.9,0.3)*fw;
    return [[x+sx*dx*fw,y,z],M];};
  return {disp,base,EX,EY,EZ,ER};}
const CR_HQ_ROWS=(()=>{const H=[5.95,5.78,5.45,5.05,4.6,4.12,3.95,3.85,3.76,3.66,3.56,3.47,3.38,3.29,3.2,3.1,2.98,2.86,2.76,2.67,2.59,2.52,2.45,2.39,2.345,2.305,2.265,2.215,2.15,2.06,1.94,1.79,1.62,1.35,1.08],o=[];
  for(let i=0;i<H.length;i++){o.push(H[i]);if(i<H.length-1&&H[i]<=2.95&&H[i]>2.1)o.push((H[i]+H[i+1])/2);if(i<H.length-1&&H[i]>=4.0&&H[i]<5.5)o.push((H[i]+H[i+1])/2);}return o;})();
// bản đồ lỗ chân lông (pháp tuyến) + độ nhám thay đổi nhẹ
function crPoreTex(){if(CR_MAT.pore)return CR_MAT.pore;const S2=256,c=crCanvas(S2,S2),g=c.getContext('2d'),im=g.createImageData(S2,S2),H=new Float32Array(S2*S2),R=crRng(5150);
  for(let i=0;i<S2*S2;i++)H[i]=(R()-0.5)*0.25;for(let k=0;k<1400;k++){const cx=R()*S2,cy=R()*S2,r=0.8+R()*1.4,d=0.6+R()*0.8;for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++){const q=Math.hypot(x,y)/r;if(q<1.6){const ix=((Math.round(cx)+x)%S2+S2)%S2,iy=((Math.round(cy)+y)%S2+S2)%S2;H[iy*S2+ix]-=d*Math.exp(-q*q*1.6);}}}
  for(let k=0;k<40;k++){let x=R()*S2,y=R()*S2,a=R()*6.3;for(let s=0;s<40;s++){x+=Math.cos(a);y+=Math.sin(a)*0.4;a+=(R()-0.5)*0.3;const ix=((x|0)%S2+S2)%S2,iy=((y|0)%S2+S2)%S2;H[iy*S2+ix]-=0.35;}}
  const at=(x,y)=>H[((y+S2)%S2)*S2+((x+S2)%S2)];for(let y=0;y<S2;y++)for(let x=0;x<S2;x++){const dx=at(x+1,y)-at(x-1,y),dy=at(x,y+1)-at(x,y-1),n=v3nrm([-dx*1.4,-dy*1.4,1]),o=(y*S2+x)*4;im.data[o]=(n[0]*0.5+0.5)*255;im.data[o+1]=(n[1]*0.5+0.5)*255;im.data[o+2]=(n[2]*0.5+0.5)*255;im.data[o+3]=255;}
  g.putImageData(im,0,0);const nt=new THREE.CanvasTexture(c);nt.wrapS=nt.wrapT=THREE.RepeatWrapping;
  const rc=crCanvas(128,128),rg=rc.getContext('2d'),ri=rg.createImageData(128,128);for(let y=0;y<128;y++)for(let x=0;x<128;x++){const v=0.92+0.12*(crVn(x/16,y/16,0,3)-0.5)+0.05*(crVn(x/4,y/4,1,4)-0.5),o=(y*128+x)*4;ri.data[o]=ri.data[o+1]=ri.data[o+2]=v*255;ri.data[o+3]=255;}
  rg.putImageData(ri,0,0);const rt=new THREE.CanvasTexture(rc);rt.wrapS=rt.wrapT=THREE.RepeatWrapping;return CR_MAT.pore={nt,rt};}
function crSkinMatHQ(base){const k='skinHQ'+base.uuid;if(CR_MAT[k])return CR_MAT[k];const m=base.clone(),P=crPoreTex();m.normalMap=P.nt;m.normalScale=new THREE.Vector2(0.28,0.28);m.roughnessMap=P.rt;m.roughness=0.7;if(m.clearcoat!==undefined)m.clearcoat=0.03;
  if(m.sheenColor)m.sheenColor=new THREE.Color('#d0806a').multiplyScalar(0.32);m.userData.crHQ=1;return CR_MAT[k]=m;}
// sợi tóc sắc nét (cùng bố cục UV với bộ dựng: nửa trên = sợi gốc→ngọn, v<0.06 lấp kín)
function crHairTexHQ(){if(CR_MAT.hairTex)return CR_MAT.hairTex;const W=512,H=1024,c=crCanvas(W,H),g=c.getContext('2d'),im=g.createImageData(W,H),A=new Float32Array(W*H),L=new Float32Array(W*H).fill(0.5),R=crRng(909);
  for(let s=0;s<5200;s++){const x0=R()*W,len=(0.5+0.5*R())*500,lum=0.5+0.5*R(),wave=(R()-0.5)*6,ph=R()*6;for(let y=0;y<len;y++){const f=y/len,x=Math.round(x0+wave*f*f+Math.sin(f*4+ph)*0.8);const ix=((x%W)+W)%W,i=y*W+ix,a=f<0.82?1:1-(f-0.82)/0.18;
      if(a>A[i]){A[i]=a;L[i]=lum*(0.7+0.3*f)*(1+0.35*Math.exp(-Math.pow((f-0.22)/0.07,2)));}}}
  {const p1=R()*6,p2=R()*6,p3=R()*6,cut=Array.from({length:W},(_,x)=>22+9*Math.sin(x*0.045+p1)+5*Math.sin(x*0.12+p2)+2.5*Math.sin(x*0.31+p3)+1.5*R());/* mép mái lượn mềm (trước: ngẫu nhiên từng cột → răng cưa) */for(let y=0;y<44;y++)for(let x=0;x<W;x++){const i=y*W+x;if(y<cut[x]&&A[i]<0.95){A[i]=Math.max(A[i],y<cut[x]-4?1:0.6);L[i]=0.42+0.12*R();}}}
  for(let y=512;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x,e=(x%20);A[i]=e<16?1:0;L[i]=0.7+0.2*(e>1&&e<14?1:0.5);}
  for(let i=0;i<W*H;i++){const l=Math.min(1,L[i]);im.data[i*4]=im.data[i*4+1]=im.data[i*4+2]=l*255;im.data[i*4+3]=A[i]*255;}g.putImageData(im,0,0);
  const t=new THREE.CanvasTexture(c);t.flipY=false;t.wrapS=THREE.RepeatWrapping;t.anisotropy=8;return CR_MAT.hairTex=t;}
function crHairMatHQ(base){const k='hairHQ'+base.uuid;if(CR_MAT[k])return CR_MAT[k];const m=base.clone();m.map=crHairTexHQ();m.alphaTest=0.5;m.roughness=0.5;if(m.sheen!==undefined){m.sheen=0.7;m.sheenRoughness=0.3;}m.userData.crHQ=1;return CR_MAT[k]=m;}
// nhãn cầu: củng mạc ấm, mống mắt có thớ + vòng rìa, con ngươi, lớp bóng
function crEyeMat(iris,env){const k='eye'+iris;if(CR_MAT[k])return CR_MAT[k];const W=256,c=crCanvas(W,W),g=c.getContext('2d'),R=crRng(31),ic=crRgb(iris),deg=d=>d/180*W;
  const sg=g.createLinearGradient(0,0,0,W);sg.addColorStop(0,'#f2e9e0');sg.addColorStop(0.35,'#eadbd0');sg.addColorStop(0.7,'#c9a89a');sg.addColorStop(1,'#7a5a50');g.fillStyle=sg;g.fillRect(0,0,W,W);
  g.strokeStyle='rgba(170,60,50,.35)';g.lineWidth=0.8;for(let k2=0;k2<14;k2++){let x=R()*W,y=deg(70+R()*40);g.beginPath();g.moveTo(x,y);for(let s=0;s<8;s++){x+=(R()-0.5)*14;y-=4+R()*5;g.lineTo(x,y);}g.stroke();}
  const ir=deg(34),lim=deg(39);for(let x=0;x<W;x++){const f=0.75+0.5*R();g.fillStyle=`rgb(${Math.min(255,ic[0]*f)|0},${Math.min(255,ic[1]*f)|0},${Math.min(255,ic[2]*f)|0})`;g.fillRect(x,0,1,ir);}
  const lg=g.createLinearGradient(0,deg(14),0,ir);lg.addColorStop(0,'rgba(255,200,140,.12)');lg.addColorStop(0.5,'rgba(0,0,0,0)');lg.addColorStop(1,'rgba(0,0,0,.35)');g.fillStyle=lg;g.fillRect(0,deg(14),W,ir-deg(14));
  const rg=g.createLinearGradient(0,ir,0,lim);rg.addColorStop(0,'rgba(10,6,4,.95)');rg.addColorStop(1,'rgba(10,6,4,0)');g.fillStyle=rg;g.fillRect(0,ir-2,W,lim-ir+2);g.fillStyle='#050404';g.fillRect(0,0,W,deg(14));
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;const m=new THREE.MeshPhysicalMaterial({map:t,roughness:0.22,clearcoat:1,clearcoatRoughness:0.04,envMap:env||null,envMapIntensity:0.45});return CR_MAT[k]=m;}
function crEyeGeo(ER){const k='eg'+ER;if(CR_MAT[k])return CR_MAT[k];const g=new THREE.SphereGeometry(ER,20,14);g.rotateX(Math.PI/2);return CR_MAT[k]=g;}
function crHeadSkins(R){const o=[];R.head.traverse(m=>{if(m.isMesh&&m.userData.part==='skin'&&!crInSwing(R,m))o.push(m);});return o;}
function crInSwing(R,m){let o=m.parent;while(o&&o!==R.head){if(o===R.hair||o.name==='h3face'||o.name==='hairTail'||o.name==='crHair')return true;o=o.parent;}return false;}
function crHeadMeshes(R){const o=[];R.head.traverse(m=>{if(m.isMesh&&!m.userData.crNoMorph&&!crInSwing(R,m))o.push(m);});return o;}
function crHQ(G,R,a){const T=THREE,head=R.head,fem=!!a.f,U=G.userData;const sk0=head.children.find(m=>m.isMesh&&m.userData.part==='skin');if(!sk0)return;
  const F=R._h3f||null,EZ=F&&F.iris&&F.iris[1]?F.iris[1].position.z:(fem?1.33:1.35);const HM=crHeadModel(fem,EZ),EX=HM.EX,EY=HM.EY,ER=HM.ER;
  const SK=v3mul(crHex(crSkinHex(a)),1/0.94),HC=crHex(crHairHex(a)),H=CR_HS[a.hs]||CR_HS[0],bald=H.b==null,hs=H.b,beard=!fem&&a.fh>=2;
  const lipC=crMix(SK,crHex('#8a3c34'),fem?0.55:0.4),redC=crMix(SK,crHex('#b05040'),0.35);
  const hlA=hs===1?[[0,4.62],[0.5,4.5],[1.1,4.15],[1.45,3.95],[1.7,3.4],[2.2,2.35],[Math.PI,2.05]]:[[0,4.95],[0.55,4.7],[1.15,4.12],[1.45,3.95],[1.75,3.3],[2.2,2.3],[Math.PI,fem?1.8:2.0]];
  const hl=u=>{const q=Math.abs(((u+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI);for(let i=0;i<hlA.length-1;i++)if(q<=hlA[i+1][0]){const t=(q-hlA[i][0])/(hlA[i+1][0]-hlA[i][0]);return hlA[i][1]+(hlA[i+1][1]-hlA[i][1])*t;}return hlA[hlA.length-1][1];};
  const skinAt=(p,red)=>{let k=v3mul(SK,0.955+0.09*crVn(p[0]*2,p[1]*2,p[2]*2,7)+0.02*(crVn(p[0]*9,p[1]*9,p[2]*9,2)-0.5));if(red)k=crMix(k,redC,red);return k;};
  // lưới đầu
  const N=36,ROWS=CR_HQ_ROWS,us=[];for(let j=0;j<=N;j++){const t=j/N-0.5;us.push(2*Math.PI*t-0.82*Math.sin(2*Math.PI*t));}
  const pos=[],col=[],uv=[],idx=[];ROWS.forEach(y=>{us.forEach((u,j)=>{const [p,M]=HM.disp(u,y);pos.push(p[0],p[1],p[2]);
      let k=skinAt(p,0.1*(M.cheek||0)+0.1*(M.nose||0)+0.12*crGs(Math.abs(p[0]),0,0.14)*crGs(y,2.84,0.12));if(M.lip)k=crMix(k,lipC,M.lip);if(M.nostril)k=crMix(k,v3mul(SK,0.3),Math.min(1,M.nostril*1.3));if(M.socket)k=crMix(k,crMix(SK,crHex('#5a3428'),0.3),M.socket*0.35);
      if(!bald){const hy=hl(u)+0.035*(crVn(u*6,0,0,9)-0.5);k=crMix(k,v3mul(HC,0.5+0.12*crVn(u*20,y*20,0,4)),crSS(hy-0.08,hy+0.05,y));}
      if(!fem&&!bald){const bt=Math.abs(Math.sin(u))<0.95&&Math.cos(u)>-0.2?1:0,reg=bt*crSS(3.0,2.6,y)*crSS(1.0,1.35,y)*(1-crSS(0.25,0,Math.abs(y-2.3)-0.05)*crSS(0.5,0.3,Math.abs(p[0])))*crSS(-0.2,0.1,Math.cos(u));k=crMix(k,crMix(SK,HC,0.6),reg*(beard?0.7:0.16));}
      col.push(k[0],k[1],k[2]);uv.push((j/N)*5,y/1.6);});});
  const W=N+1;for(let r=0;r<ROWS.length-1;r++)for(let j=0;j<N;j++){const a0=r*W+j,b0=a0+1,c0=a0+W+1,d0=a0+W;idx.push(a0,d0,c0,a0,c0,b0);}
  const top=pos.length/3;pos.push(0,6.02,-0.12);col.push(...v3mul(bald?SK:HC,bald?1:0.5));uv.push(2.5,3.8);for(let j=0;j<N;j++)idx.push(top,j,j+1);
  const bot=pos.length/3;pos.push(0,1.12,-0.4);col.push(...SK);uv.push(2.5,0.7);const lr=(ROWS.length-1)*W;for(let j=0;j<N;j++)idx.push(bot,lr+j+1,lr+j);
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('color',new T.Float32BufferAttribute(col,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);
  const seams=[];for(let r=0;r<ROWS.length;r++)seams.push([r*W,r*W+N]);geo.userData.crSeams=seams;geo.userData.crPoles=[top,bot];crNormals(geo);
  // nếu mặt quay ngược (pháp tuyến hướng vào trong) thì đảo
  {const na=geo.attributes.normal,pa=geo.attributes.position,i=Math.floor(ROWS.length/2)*W+Math.floor(N/2);if(na.getZ(i)<0){for(let q=0;q<idx.length;q+=3){const t=idx[q+1];idx[q+1]=idx[q+2];idx[q+2]=t;}geo.setIndex(idx);crNormals(geo);}}
  const smat=crSkinMatHQ(sk0.material),hiG=new T.Group();hiG.name='crHi';const hm=new T.Mesh(geo,smat);hm.userData.part='skin';hm.userData.crHQ=1;hm.castShadow=true;hm.receiveShadow=true;hiG.add(hm);
  // tai + cổ: chép từ lưới gốc (cổ = 288 đỉnh cuối; tai = phần nhô khỏi mặt sọ)
  {const pa=sk0.geometry.attributes.position,ca=sk0.geometry.attributes.color,ua=sk0.geometry.attributes.uv,na=sk0.geometry.attributes.normal,n=pa.count,P=[],C=[],UV=[],NN=[];
    const ear=i=>{const x=pa.getX(i),y=pa.getY(i),z=pa.getZ(i);return Math.abs(x)>crProf(y)[1]-0.02&&y>2.3&&y<4.1&&z>-1.15&&z<0.55;};
    for(let i=0;i<n;i+=3){const isN=i>=n-288,isE=!isN&&ear(i)&&ear(i+1)&&ear(i+2);if(!isN&&!isE)continue;for(let q=0;q<3;q++){const v=i+q;P.push(pa.getX(v),pa.getY(v),pa.getZ(v));NN.push(na.getX(v),na.getY(v),na.getZ(v));UV.push(ua.getX(v),ua.getY(v));
        let k=[ca.getX(v),ca.getY(v),ca.getZ(v)];if(isE)k=crMix(k,crHex('#c0504a'),0.14);C.push(k[0],k[1],k[2]);}}
    const g2=new T.BufferGeometry();g2.setAttribute('position',new T.Float32BufferAttribute(P,3));g2.setAttribute('normal',new T.Float32BufferAttribute(NN,3));g2.setAttribute('color',new T.Float32BufferAttribute(C,3));g2.setAttribute('uv',new T.Float32BufferAttribute(UV,2));
    const em=new T.Mesh(g2,sk0.material);em.userData.part='skin';em.castShadow=true;em.receiveShadow=true;hiG.add(em);}
  // mi mắt bọc nhãn cầu + đường mi + hàng mi
  {const B=crBuf(),L=crBuf(),hm0=head.children.find(m=>m.isMesh&&m.userData.part==='hair');const aw=fem?0.31:0.3,hU=fem?0.12:0.105,hL=fem?0.085:0.075;
    [-1,1].forEach(s=>{const c=[s*EX,EY,EZ],Rl=ER*1.07;const mU=X=>{const t=Math.abs(X)/aw;return t>=1?0:hU*Math.pow(1-t*t,0.75)+0.014*(X/aw);},mL=X=>{const t=Math.abs(X)/aw;return t>=1?0:-hL*Math.pow(1-t*t,0.8)+0.012*(X/aw);};
      [true,false].forEach(up=>{const NX=12,NR=4,P=[],Cc=[],UU=[],Nn=[];for(let r=0;r<=NR;r++){const row=[],cr=[],ur=[],nr=[];for(let i=0;i<=NX;i++){const X=s*(i/NX*2-1)*Rl*0.97,rc=Math.sqrt(Math.max(1e-4,Rl*Rl-X*X));/* s*: hai mắt dựng cùng chiều tam giác (trước đây mí mắt bên trái bị lộn mặt → mảng tối quanh mắt) */
          const m=Math.max(-0.98,Math.min(0.98,(up?Math.max(mU(X),mL(X)+0.004):Math.min(mL(X),mU(X)-0.004))/rc)),f0=Math.asin(m),f1=up?1.3:-0.85,f=f0+(f1-f0)*Math.pow(r/NR,1.2),rad=r===0?ER*1.015:Rl*(1+(up?0.17:0.06)*Math.pow(r/NR,1.5));
          const rc2=Math.sqrt(Math.max(1e-4,rad*rad-X*X)),p=[c[0]+s*X,c[1]+rc2*Math.sin(f),c[2]+rc2*Math.cos(f)];row.push(p);const rn=v3nrm(v3sub(p,c));nr.push(v3nrm(v3lerp(rn,v3nrm([s*0.3,up?0.25:-0.1,1]),Math.pow(r/NR,0.8)*0.85)));
          let k=skinAt(p,0.12);if(r===0)k=up?crMix(HC,crHex('#0c0806'),0.6):crMix(SK,crHex('#a0504a'),0.4);else if(r===1&&up)k=crMix(k,v3mul(SK,0.6),0.55);else if(r===1)k=crMix(k,v3mul(SK,0.8),0.3);else if(r===2&&up)k=crMix(k,v3mul(SK,0.8),0.45);cr.push(k);ur.push([i/NX,r/NR*0.3]);}
        P.push(row);Cc.push(cr);UU.push(ur);Nn.push(nr);}crGrid(B,P,Cc,UU,Nn);
        if(up){const ln=[],pts=[];for(let i=1;i<NX;i++){const p=P[0][i],n2=v3nrm(v3sub(p,c));pts.push(v3add(p,n2,0.01));ln.push(n2);}const cl0=v3mul(HC,0.35);
          for(let i=0;i<pts.length-1;i++){const w=Math.sin((i+1)/pts.length*Math.PI),o1=v3add(pts[i],v3nrm(v3add(ln[i],[s*0.25*(i/pts.length-0.3),1.1,0.5])),0.06+0.09*w),o2=v3add(pts[i+1],v3nrm(v3add(ln[i+1],[s*0.25*((i+1)/pts.length-0.3),1.1,0.5])),0.06+0.09*w);
            const nq=v3nrm(v3add(ln[i],[0,0.6,0]));[pts[i],pts[i+1],o2,pts[i],o2,o1].forEach((q,qi)=>{L.p.push(q);L.c.push(cl0);L.u.push([0.3+0.02*(qi%2),qi>=2&&qi!==3?0.3:0.02]);L.n.push(nq);});}}});});
    const lm=crMesh(B,smat);if(lm){lm.userData.crAdd=0;lm.userData.part='lid';hiG.add(lm);}if(hm0){const la=crMesh(L,crHairMatHQ(hm0.material));if(la){la.userData.crAdd=0;la.userData.part='lash';hiG.add(la);}}}
  // LOD: gần = đầu chi tiết, xa = đầu gốc
  const loG=new T.Group();loG.name='crLo';sk0.parent.remove(sk0);loG.add(sk0);sk0.userData.part='skin';const lod=new T.LOD();lod.name='crLOD';lod.addLevel(hiG,0);lod.addLevel(loG,CR_HQ_DIST);head.add(lod);
  // nhãn cầu: gắn vào trục nhìn của hunt3 (xoay theo ánh mắt), ẩn đĩa tròng phẳng; mắt gốc ẩn
  const em0=head.children.find(m=>m.isMesh&&m.userData.part==='eye');if(em0)em0.visible=false;const emat=crEyeMat((CR_EYE[a.ec]||CR_EYE[0])[1],em0&&em0.material.envMap);
  [-1,1].forEach((s,i)=>{const e=new T.Mesh(crEyeGeo(ER),emat);e.userData.crNoMorph=1;e.userData.crShared=1;e.castShadow=false;e.receiveShadow=true;const gz=new T.Euler(0.02,s*0.06,0);e.rotation.copy(gz);
    if(F&&F.iris&&F.iris[i]){F.iris[i].children.forEach(m=>{if(m.isMesh)m.visible=false;});F.iris[i].add(e);}else{e.position.set(s*EX,EY,EZ);e.userData.crNoMorph=0;head.add(e);}});
  if(F&&F.lid)F.lid.forEach(pv=>pv.children.forEach(l=>{if(l.isMesh)l.scale.setScalar(ER*1.1/0.34);}));
  // vật liệu tóc sắc nét cho mọi lưới tóc trên đầu (trừ phần tua áo không thuộc đầu)
  head.traverse(m=>{if(m.isMesh&&m.userData.part==='hair'&&m.material&&m.material.map&&!m.material.userData.crHQ)m.material=crHairMatHQ(m.material);});
  R._crHQ=1;U.crHQ=1;}
function crLashLen(R,a){let m=null;R.head.traverse(o=>{if(o.isMesh&&o.userData.part==='lash')m=o;});if(!m)return;const pa=m.geometry.attributes.position,k=1+0.4*a.ls,P=i=>[pa.getX(i),pa.getY(i),pa.getZ(i)];
  for(let g=0;g+5<pa.count;g+=6){const A=P(g),Bv=P(g+1);[[2,Bv],[4,Bv],[5,A]].forEach(([j,o])=>{const q=v3add(o,v3sub(P(g+j),o),k);pa.setXYZ(g+j,q[0],q[1],q[2]);});}pa.needsUpdate=true;}
function crNormals(g){g.computeVertexNormals();const na=g.attributes.normal;(g.userData.crSeams||[]).forEach(([a,b])=>{const n=v3nrm([na.getX(a)+na.getX(b),na.getY(a)+na.getY(b),na.getZ(a)+na.getZ(b)]);na.setXYZ(a,n[0],n[1],n[2]);na.setXYZ(b,n[0],n[1],n[2]);});
  const pl=g.userData.crPoles;if(pl){na.setXYZ(pl[0],0,1,0);na.setXYZ(pl[1],0,-0.7,-0.7);}na.needsUpdate=true;}
/* ---------- bọc bộ dựng K3.char2 ---------- */
function crInstall(){if(typeof K3==='undefined'||!K3.char2||K3.char2._cr)return;const base=K3.char2;const w=function(o){o=o||{};const a=o.app?crSan(o.app):null;if(!a)return base(o);
    const g=base(crBuildOpts(o,a));try{crPost(g,a,!!o.crKeep,'full');}catch(e){console.warn('creator: hậu kỳ',e);}return g;};w._cr=1;w._base=base;K3.char2=w;}
{const _i6=typeof SBmodels6cInit==='function'?SBmodels6cInit:null;if(_i6)SBmodels6cInit=function(){const r=_i6.apply(this,arguments);crInstall();return r;};
 const _i2=typeof K3char2Init==='function'?K3char2Init:null;if(_i2)K3char2Init=function(){const r=_i2.apply(this,arguments);if(typeof SBmodels6cInit!=='function')crInstall();return r;};}
function crModelsInit(){K3init();K3lightsInit();['K3fxInit','K3charInit','SBmodelsInit','K3char2Init','SBmodels2Init','SBmodels3Init','SBmodels4aInit','SBmodels4bInit','SBmodels5Init','SBmodels6vInit','SBmodels6cInit'].forEach(n=>{const f=window[n];if(typeof f==='function')try{f();}catch(e){console.warn('creator init',n,e);}});crInstall();}
function crLoad3D(cb){if(window.THREE){cb(true);return;}const load=i=>{if(i>=TURLS.length){cb(false);return;}const s=document.createElement('script');s.src=TURLS[i];s.onload=()=>{if(window.THREE)cb(true);else load(i+1);};s.onerror=()=>{s.remove();load(i+1);};document.head.appendChild(s);};load(0);}
/* ---------- nối vào game ---------- */
{const _cl=charLook;charLook=function(){const L=_cl();if(typeof S!=='undefined'&&S&&S.app){L.app=S.app;L.crWear=!!(S.wear&&S.wear.body);}return L;};}
{const _fs=fixSave;fixSave=function(o){const r=_fs(o);if(!r.app&&G.crPending){r.app=G.crPending;G.crPending=null;}r.app=crSan(r.app)||crFromLook(r.look|0);return r;};}
{const _sm=slotMeta;slotMeta=function(s){const m=_sm(s);if(s&&s.app){m.sex=s.app.f?'f':'m';m.ap=crEnc(s.app);}return m;};}
{const _ng=uiNewGame;uiNewGame=function(){if(CRE.open&&CRE.mode==='new'){G.crPending=crSan(CRE.app);G.nlook=CRE.app.f?1:0;crClose();}return _ng();};}
{const _us=uiStart;uiStart=function(o){if(o&&o.form){crOpen('new');return;}_us(o);try{crDecorList();}catch(e){}};}
{const _sh=settingsHtml;settingsHtml=function(){return `<div class="set"><b>Ngoại hình</b><button class="btn sm" data-a="credit">🎨 Sửa ngoại hình</button></div>`+_sh();};}
{const _fi=fpInit;fpInit=function(){_fi();try{crTintFP();}catch(e){}};}
function crTintFP(){const arm=G.fpArm;if(!arm||!S||!S.app)return;const lin=h=>{const c=new THREE.Color(h).convertSRGBToLinear();return [c.r,c.g,c.b];},t=lin(crSkinHex(S.app)),r0=lin('#b98060'),k=[t[0]/r0[0],t[1]/r0[1],t[2]/r0[2]];
  arm.traverse(m=>{if(!m.isMesh)return;const ca=m.geometry.attributes.color;if(ca){if(!m.userData.crC){let rs=0,bs=0;for(let i=0;i<ca.count;i++){rs+=ca.getX(i);bs+=ca.getZ(i);}if(bs/rs<0.19)return;m.userData.crC=ca.array.slice();}
      const o=m.userData.crC;for(let i=0;i<ca.count;i++)ca.setXYZ(i,o[i*3]*k[0],o[i*3+1]*k[1],o[i*3+2]*k[2]);ca.needsUpdate=true;}
    else if(m.material&&m.material.color&&!m.userData.crM){const c=m.material.color;if(c.b/c.r>0.44){m.material=m.material.clone();m.material.color.set(crSkinHex(S.app));m.userData.crM=1;}}});}
// người chơi khác: kèm mã ngoại hình trong presence (kiểm tra kỹ khi nhận)
{const _vp=typeof mpValPres==='function'?mpValPres:null;if(_vp)mpValPres=function(p){const v=_vp(p);if(v){const ap=p&&p.presence&&p.presence.ap;if(typeof ap==='string'&&crDec(ap))v.lk=v.lk+'|'+ap;}return v;};
 const _mm=typeof mpModel==='function'?mpModel:null;if(_mm)mpModel=function(lk){if(typeof lk==='string'){const i=lk.indexOf('|'),l=+lk.slice(0,i)|0,a=crDec(lk.slice(i+1));
     if(a&&K3.char2){try{const o=K3.char2(Object.assign({sleeves:true},(LOOKS[l]||LOOKS[0]).o,LOOK2[l]||{},{app:a}));o.traverse(m=>{if(m.isMesh)m.castShadow=true;});try{seasonPatchAll(o);}catch(e){}return o;}catch(e){}}return _mm(l);}return _mm(lk);};}
// danh sách nhân vật: hình đại diện nhỏ theo màu da/tóc
function crAvatar(ap,sex){const a=crDec(ap);if(!a)return null;const sk=crSkinHex(a),hr=crHairHex(a),f=sex==='f';
  return `<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="#2a1c12"/><path d="M8 40c1-8 6-11 12-11s11 3 12 11z" fill="${(CR_CLOTH[a.cc]||CR_CLOTH[0])[1]}"/><ellipse cx="20" cy="19" rx="8" ry="9.5" fill="${sk}"/>
    <path d="M11.5 18c0-7 4-10.5 8.5-10.5S28.5 11 28.5 18c-2-3-5-5-8.5-5s-6.5 2-8.5 5z" fill="${hr}"/>${f?`<path d="M11.5 18c-1 6 0 11 2 13l1-12z M28.5 18c1 6 0 11-2 13l-1-12z" fill="${hr}"/>`:''}${!f&&a.fh>=2?`<path d="M13 21c1 6 4 8 7 8s6-2 7-8c-2 3-4 3-7 3s-5 0-7-3z" fill="${hr}"/>`:''}
    <circle cx="17" cy="19.5" r="1" fill="#1a110c"/><circle cx="23" cy="19.5" r="1" fill="#1a110c"/></svg>`;}
function crDecorList(){const L=document.querySelectorAll('.ov-card.acc .chr');if(!L.length||typeof accChars!=='function')return;const M={};accChars().forEach(c=>{M[c.id]=c;});
  L.forEach(el=>{const b=el.querySelector('[data-a="chplay"]'),c=b&&M[b.dataset.id];if(!c||!c.ap)return;const s=crAvatar(c.ap,c.sex);if(s){const sp=el.querySelector('.chr-a');if(sp){sp.innerHTML=s;sp.classList.add('crav');}}});}
/* ===================== MÀN TẠO NHÂN VẬT ===================== */
function crLooksLS(v){try{if(v===undefined)return JSON.parse(localStorage.getItem('ldtt-looks')||'[]')||[];localStorage.setItem('ldtt-looks',JSON.stringify(v));}catch(e){return [];}return v;}
function crOpen(mode){crCss();const ing=mode==='edit';if(ing&&(!S||!S.app))return;CRE.open=true;CRE.mode=mode;CRE.tab=ing?'mat':'mau';CRE.view='full';CRE.yawD=0;CRE.light=CRE.light||'day';
  if(ing){CRE.app=crSan(S.app);G.crWasPaused=G.paused;G.paused=true;try{uiClose();}catch(e){}}else{const sx=G.nsex||'m';CRE.app=CRE.app&&CRE.mode0==='new'?CRE.app:crPreset(sx==='f'?1:0);}CRE.mode0=mode;
  CRE.hist=[JSON.stringify(CRE.app)];CRE.hi=0;$('#overlay').classList.add('crmode');
  const nm=esc((S&&S.name)||'Lửa');
  uiOverlay(true,`<div class="ov-card cr" role="dialog" aria-label="Tạo nhân vật"><div class="crh"><button class="crb" data-a="crback" aria-label="Quay lại">←</button><b>${ing?'Sửa ngoại hình':'Tạo nhân vật'}</b>
      <button class="crb" data-a="crundo" aria-label="Hoàn tác">↶</button><button class="crb" data-a="crredo" aria-label="Làm lại">↷</button><button class="crb" data-a="crrnd" aria-label="Ngẫu nhiên mục này">🎲</button></div>
    <div class="crp"><canvas id="crCv"></canvas><div class="crmsg" id="crMsg">Đang nặn đất sét…</div>
      <div class="crvw"><button class="crv on" data-a="crview" data-v="full">Toàn thân</button><button class="crv" data-a="crview" data-v="upper">Nửa người</button><button class="crv" data-a="crview" data-v="face">Khuôn mặt</button></div>
      <div class="crlt"><button class="crv${CRE.light==='day'?' on':''}" data-a="crlight" data-v="day" aria-label="Ánh sáng ban ngày">☀️</button><button class="crv${CRE.light==='fire'?' on':''}" data-a="crlight" data-v="fire" aria-label="Ánh lửa">🔥</button><button class="crv${CRE.light==='dusk'?' on':''}" data-a="crlight" data-v="dusk" aria-label="Hoàng hôn">🌇</button></div>
      <p class="crhint">Kéo để xoay</p></div>
    <div class="crtabs">${CR_TABS.map(([t,i,n])=>`<button class="crt${t===CRE.tab?' on':''}" data-a="crtab" data-t="${t}"><span>${i}</span><small>${n}</small></button>`).join('')}</div>
    <div class="crbody" id="crBody"></div>
    <div class="crf">${ing?`<button class="btn ghost" data-a="crback">Hủy</button><button class="btn" data-a="crsave">💾 Lưu ngoại hình</button>`:
      `<div class="crfr"><label class="fld crn">Tên<input id="nName" maxlength="16" value="${nm}"></label><button class="btn big" data-a="start">Bắt đầu</button></div>
       <div class="crfr mds"><button class="md${(G.nmode||'cozy')==='cozy'?' on':''}" data-a="mode" data-m="cozy"><b>Thong thả</b></button><button class="md${G.nmode==='survival'?' on':''}" data-a="mode" data-m="survival"><b>Sinh tồn</b></button><small class="muted">Mỗi nhân vật có thế giới riêng.</small></div>`}</div></div>`);
  if(!G.nmode)G.nmode='cozy';crPanel();
  crLoad3D(ok=>{if(!CRE.open)return;if(!ok){$('#crMsg').textContent='Không tải được 3D: vẫn chỉnh được, xem trong game.';return;}setTimeout(()=>{if(!CRE.open)return;try{crModelsInit();crPrevInit();crRebuild();}catch(e){console.warn('creator: xem trước',e);const m=$('#crMsg');if(m)m.textContent='Không dựng được bản xem trước.';}},30);});}
function crClose(){if(!CRE.open)return;CRE.open=false;cancelAnimationFrame(CRE.raf);clearTimeout(CRE.tm);const P=CRE.P;if(P){if(CRE.g){P.sc.remove(CRE.g);crDispose(CRE.g);CRE.g=null;}
    try{P.R.dispose();P.R.forceContextLoss();}catch(e){}P.ro&&P.ro.disconnect&&P.ro.disconnect();CRE.P=null;}$('#overlay').classList.remove('crmode');
  if(CRE.mode==='edit'){G.paused=!!G.crWasPaused;}}
function crDispose(g){g.traverse(m=>{if(m.isMesh){m.geometry.dispose();if(m.material&&m.material.userData&&m.material.userData.crOwn){if(m.material.map)m.material.map.dispose();m.material.dispose();}}});}
// bảng điều khiển theo thẻ
function crCtl(p){const a=CRE.app,v=a[p.k];if(p.sx&&(a.f?'f':'m')!==p.sx)return '';
  const head=`<div class="crl"><span>${p.n}</span>${p.t==='s'||p.t==='u'?`<button class="crr" data-a="crreset" data-k="${p.k}" aria-label="Đặt lại ${p.n}">↺</button>`:''}</div>`;
  if(p.t==='s'||p.t==='u'){const mn=p.t==='s'?-100:0;return `<div class="crc" data-z="${p.z}">${head}<div class="crsw"><small>${p.lo}</small><input type="range" class="crs" min="${mn}" max="100" value="${Math.round(v*100)}" data-k="${p.k}" aria-label="${p.n}"><small>${p.hi}</small></div></div>`;}
  if(p.k==='sk')return '';
  const bt=(i,lab)=>{const on=p.t==='b'?(v>>i)&1:v===i;if(p.k==='ao'&&i===2&&a.f)return '';const sw=p.sw&&p.sw[i];
    return `<button class="crch${on?' on':''}${sw?' sw':''}" data-a="${p.t==='b'?'crbit':'crset'}" data-k="${p.k}" data-v="${i}"${sw?` style="--sw:${sw}"`:''}>${sw?'<i></i>':''}<span>${lab}</span></button>`;};
  return `<div class="crc" data-z="${p.z}">${head}<div class="crchs${p.sw?' sws':''}">${p.opts.map((o,i)=>bt(i,o)).join('')}</div></div>`;}
function crPanel(){const b=$('#crBody');if(!b)return;const t=CRE.tab,a=CRE.app;let h='';
  if(t==='mau'){h+=`<div class="crsec"><h4>Mẫu có sẵn</h4><div class="crpre">${CR_PRE.map((P,i)=>`<button class="crpb" data-a="crpre" data-i="${i}"><span>${P.i}</span><b>${P.n}</b><small>${P.a.f?'Nữ':'Nam'}</small></button>`).join('')}
      <button class="crpb rnd" data-a="crrndall"><span>🎲</span><b>Ngẫu nhiên</b><small>Giữ giới tính</small></button></div></div>`;
    const L=crLooksLS();h+=`<div class="crsec"><h4>Kiểu đã lưu (tối đa 6)</h4><div class="crsav">${[0,1,2,3,4,5].map(i=>{const s=L[i];const av=s&&crAvatar(s.ap,crDec(s.ap)&&crDec(s.ap).f?'f':'m');
      return s?`<div class="crsl"><button class="crslb" data-a="crload" data-i="${i}">${av||''}<span>${esc(s.n)}</span></button><button class="crr" data-a="crdel" data-i="${i}" aria-label="Xóa kiểu ${i+1}">✕</button></div>`
        :`<button class="crsl empty" data-a="crstore" data-i="${i}">＋ Lưu kiểu đang làm</button>`;}).join('')}</div></div>`;}
  else{const ps=CRS.filter(p=>p.tab===t);const secs=[...new Set(ps.map(p=>p.sec))];
    if(t==='mat')h+=`<div class="crjump">${secs.map((s,i)=>`<button class="crch" data-a="crjump" data-i="${i}">${s}</button>`).join('')}</div>`;
    if(t==='da')h+=`<div class="crsec"><h4>Tông da</h4><div class="crchs sws">${CR_SKIN.map((c,i)=>`<button class="crch sw${Math.abs(a.sk-i/(CR_SKIN.length-1))<0.04?' on':''}" data-a="crskin" data-v="${i}" style="--sw:${c}" aria-label="Tông da ${i+1}"><i></i></button>`).join('')}</div></div>`;
    secs.forEach((s,i)=>{const c=ps.filter(p=>p.sec===s).map(crCtl).join('');if(c)h+=`<div class="crsec" id="crsec${i}"><h4>${s}</h4>${c}</div>`;});
    h+=`<button class="btn ghost sm crrt" data-a="crrnd">🎲 Ngẫu nhiên mục ${CR_TABS.find(x=>x[0]===t)[2]}</button>`;}
  const st=b.scrollTop;b.innerHTML=h;b.scrollTop=st;}
// thay đổi giá trị
const CR_RB=new Set(CRS.filter(p=>p.rb).map(p=>p.k)),CR_DT=new Set(CRS.filter(p=>p.d).map(p=>p.k));
function crSet(k,v,commit){const a=CRE.app,old=a[k];a[k]=v;const s=crSan(a);Object.assign(a,s);if(old===a[k]&&!commit)return;crQueue(CR_RB.has(k)?'rb':CR_DT.has(k)?'full':'morph');if(commit)crCommit();}
function crCommit(){const j=JSON.stringify(CRE.app);if(CRE.hist[CRE.hi]===j)return;CRE.hist=CRE.hist.slice(0,CRE.hi+1);CRE.hist.push(j);if(CRE.hist.length>60)CRE.hist.shift();CRE.hi=CRE.hist.length-1;}
function crQueue(kind){const rank={morph:1,full:2,rb:3};if(!CRE.q||rank[kind]>rank[CRE.q])CRE.q=kind;if(CRE.tm)return;const now=performance.now(),wait=CRE.q==='rb'?Math.max(0,(CRE.lastRb||0)+260-now):0;
  CRE.tm=setTimeout(()=>{CRE.tm=0;requestAnimationFrame(()=>{const q=CRE.q;CRE.q=null;if(!CRE.open)return;if(q==='rb')crRebuild();else if(CRE.g){const t0=performance.now();try{crPost(CRE.g,crSan(CRE.app),true,q);}catch(e){console.warn('creator',e);}CRE.lastPostMs=performance.now()-t0;}});},wait);}
function crBaseOpts(){if(CRE.mode==='edit'){const L=charLook(),o=Object.assign({},L,LOOK2[S.look]||{},L.cloak?{cloak:L.cloak,cloak2:L.cloak2}:{});if(S.wear&&S.wear.body){o.bare=false;o.sleeves=L.sleeves;o.top=L.top;o.top2=L.top2;}return o;}
  return {sleeves:true};}
function crRebuild(){const P=CRE.P;if(!P||!K3.char2)return;CRE.lastRb=performance.now();const t0=performance.now();let g;
  try{g=K3.char2(Object.assign(crBaseOpts(),{app:crSan(CRE.app),crKeep:1}));}catch(e){console.warn('creator: dựng',e);return;}
  if(CRE.g){P.sc.remove(CRE.g);crDispose(CRE.g);}CRE.g=g;g.traverse(m=>{if(m.isMesh){m.castShadow=m.userData.part!=='decal';m.receiveShadow=true;}});P.sc.add(g);CRE.lastBuildMs=performance.now()-t0;const m=$('#crMsg');if(m)m.hidden=true;}
// xem trước 3D
const CR_LIGHT={day:{bg:'radial-gradient(circle at 50% 35%,#5a4a3a,#1c140e 75%)',hemi:['#fff1dc','#6a4a30',0.9],key:['#fff0d8',1.05],fill:['#c8d4ff',0.55],rim:['#ffcf9a',0.7],fire:0,exp:1},
  fire:{bg:'radial-gradient(circle at 50% 70%,#5a2a10,#0c0806 70%)',hemi:['#3a2a40','#2a140a',0.28],key:['#ffb070',0.25],fill:['#6a7ab0',0.18],rim:['#ff9a50',0.5],fire:2.6,exp:1},
  dusk:{bg:'linear-gradient(180deg,#5a3a5a,#c86a3a 60%,#2a1a14)',hemi:['#ffc8a0','#4a2a3a',0.6],key:['#ff9a5a',1.1],fill:['#8a7ad0',0.45],rim:['#ffd08a',0.9],fire:0,exp:1}};
function crPrevInit(){const T=THREE,cv=$('#crCv');if(!cv)return;const R=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});R.outputEncoding=T.sRGBEncoding;R.setPixelRatio(Math.min(2,window.devicePixelRatio||1));R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;R.setClearColor(0,0);
  const sc=new T.Scene(),cam=new T.PerspectiveCamera(26,1,0.3,600);const hemi=new T.HemisphereLight(0xffffff,0x443322,0.7),key=new T.DirectionalLight(0xffffff,1.3),fill=new T.DirectionalLight(0xffffff,0.35),rim=new T.DirectionalLight(0xffffff,0.7),fire=new T.PointLight(0xff8a3a,0,140,1.6);
  key.position.set(-16,52,60);key.castShadow=true;key.shadow.mapSize.set(1024,1024);const sh=key.shadow.camera;sh.left=-22;sh.right=22;sh.top=44;sh.bottom=-6;sh.near=10;sh.far=160;key.shadow.bias=-0.0006;key.shadow.normalBias=0.04;
  fill.position.set(40,20,30);rim.position.set(10,40,-60);fire.position.set(6,6,22);sc.add(hemi,key,fill,rim,fire);
  const gr=new T.Mesh(new T.CircleGeometry(16,40),new T.ShadowMaterial({opacity:0.4}));gr.rotation.x=-Math.PI/2;gr.receiveShadow=true;sc.add(gr);
  const bc=crCanvas(128,128),bg=bc.getContext('2d'),rg=bg.createRadialGradient(64,64,4,64,64,62);rg.addColorStop(0,'rgba(0,0,0,.5)');rg.addColorStop(1,'rgba(0,0,0,0)');bg.fillStyle=rg;bg.fillRect(0,0,128,128);
  const blob=new T.Mesh(new T.PlaneGeometry(22,22),new T.MeshBasicMaterial({map:new T.CanvasTexture(bc),transparent:true,depthWrite:false}));blob.rotation.x=-Math.PI/2;blob.position.y=0.05;sc.add(blob);
  CRE.P={R,sc,cam,hemi,key,fill,rim,fire,cv,t0:performance.now(),last:performance.now(),tgt:new T.Vector3(0,18,0),dist:90,yaw:0,ent:{}};crLight(CRE.light);
  let drag=null;cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,yd:CRE.yawD};try{cv.setPointerCapture(e.pointerId);}catch(er){}});
  cv.addEventListener('pointermove',e=>{if(!drag)return;CRE.yawD=drag.yd+(e.clientX-drag.x)*0.012;});const up=()=>{drag=null;};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',e=>{e.preventDefault();CRE.zoom=Math.max(0.5,Math.min(1.6,(CRE.zoom||1)*(e.deltaY>0?1.08:1/1.08)));},{passive:false});
  CRE.raf=requestAnimationFrame(crLoop);}
function crLight(k){const P=CRE.P;CRE.light=k;const L=CR_LIGHT[k]||CR_LIGHT.day;const pr=document.querySelector('.crp');if(pr)pr.style.background=L.bg;if(!P)return;
  P.hemi.color.set(L.hemi[0]);P.hemi.groundColor.set(L.hemi[1]);P.hemi.intensity=L.hemi[2];P.key.color.set(L.key[0]);P.key.intensity=L.key[1];P.fill.color.set(L.fill[0]);P.fill.intensity=L.fill[1];P.rim.color.set(L.rim[0]);P.rim.intensity=L.rim[1];P.fire.intensity=L.fire;}
const CR_VIEW={full:{y:0.47,d:2.75,yaw:0},upper:{y:0.75,d:1.25,yaw:0},body:{y:0.58,d:1.75,yaw:0.25},arms:{y:0.62,d:1.45,yaw:0.55},legs:{y:0.27,d:1.35,yaw:0.3},
  face:{h:1,d:15,yaw:0},eyes:{h:1,d:9.5,yaw:0.15,dy:0.25},brow:{h:1,d:10.5,yaw:0.25,dy:0.55},nose:{h:1,d:10,yaw:0.6},mouth:{h:1,d:10,yaw:0.25,dy:-0.9},jaw:{h:1,d:13,yaw:0.55,dy:-1.1},ear:{h:1,d:12,yaw:1.35},hair:{h:1,d:19,yaw:2.4,dy:0.8}};
function crView(v){CRE.view=v;CRE.zoom=1;if(CR_VIEW[v])CRE.yawD=0;document.querySelectorAll('.crvw .crv').forEach(b=>b.classList.toggle('on',b.dataset.v===v||(b.dataset.v==='face'&&CR_VIEW[v]&&CR_VIEW[v].h)));}
const CR_V3={};
function crLoop(now){if(!CRE.open||!CRE.P)return;CRE.raf=requestAnimationFrame(crLoop);if(document.hidden)return;const P=CRE.P,T=THREE,dt=Math.min(0.05,(now-P.last)/1000);P.last=now;const t=(now-P.t0)/1000;
  const cv=P.cv,w=cv.clientWidth|0,h=cv.clientHeight|0;if(w&&h&&(w!==P.w||h!==P.h)){P.w=w;P.h=h;P.R.setSize(w,h,false);P.cam.aspect=w/h;P.cam.updateProjectionMatrix();}
  const g=CRE.g,V=CR_VIEW[CRE.view]||CR_VIEW.full;if(g){const R=g.userData.rig;if(!CRE.noAnim)try{K3.char2Pose(R,'idle',t);}catch(e){}if(V.h){R.head.rotation.y*=0.25;R.head.rotation.x*=0.3;}
    const yawT=V.yaw+CRE.yawD;P.yaw+=(yawT-P.yaw)*Math.min(1,dt*6);g.rotation.y=P.yaw;g.updateMatrixWorld(true);
    let tgt,dist;const H=36*(R.dims.h||1);if(V.h){const hp=(CR_V3.h||(CR_V3.h=new T.Vector3()));hp.set(0,3.5+(V.dy||0),0.4);R.head.localToWorld(hp);tgt=hp;dist=V.d*R.head.getWorldScale(CR_V3.s||(CR_V3.s=new T.Vector3())).x;}
    else{tgt=(CR_V3.b||(CR_V3.b=new T.Vector3())).set(0,H*V.y,0);dist=H*V.d;}dist*=(CRE.zoom||1);if(P.w&&P.h&&P.w/P.h<0.8)dist*=1.15;
    P.tgt.lerp(tgt,Math.min(1,dt*5));P.dist+=(dist-P.dist)*Math.min(1,dt*5);P.cam.position.set(P.tgt.x,P.tgt.y+P.dist*0.06,P.tgt.z+P.dist);P.cam.lookAt(P.tgt);
    if(typeof h3faceTick==='function'&&R._h3f&&!CRE.noAnim){try{h3faceTick(R,dt,'',P.ent,false,'calm',P.cam.position);}catch(e){}}}
  P.fire.intensity=CRE.light==='fire'?CR_LIGHT.fire.fire*(0.85+0.15*Math.sin(t*9)*Math.sin(t*5.3)):0;
  P.R.render(P.sc,P.cam);}
// ngẫu nhiên đẹp: lệch vừa phải quanh mặc định
function crRandom(tab){const a=CRE.app,rn=Math.random,gs=()=>((rn()+rn()+rn())/1.5-1);const ks=CRS.filter(p=>!tab||p.tab===tab);
  ks.forEach(p=>{if(p.k==='f')return;if(p.sx&&(a.f?'f':'m')!==p.sx)return;if(p.t==='s')a[p.k]=Math.round(gs()*0.7*100)/100;else if(p.t==='u')a[p.k]=Math.round(rn()*(['fr','sb','wk','ag','hg'].includes(p.k)?0.5:1)*100)/100;
    else if(p.t==='b')a[p.k]=1+((rn()*7)|0)%7;else a[p.k]=(rn()*p.opts.length)|0;});
  if(!tab||tab==='trang'){if(rn()<0.55)a.fp=0;if(rn()<0.5)a.pt=0;if(rn()<0.5)a.tt=0;}if(!tab||tab==='da'){if(rn()<0.6)a.sc=0;if(rn()<0.5)a.mo=0;}if(a.f&&[4,7].includes(a.hs))a.hs=0;
  Object.assign(a,crSan(a));}
function crCss(){if($('#crCss'))return;const s=document.createElement('style');s.id='crCss';s.textContent=`
.overlay.crmode{padding:0;overflow:hidden}.overlay.crmode>.cr{margin:0}
.ov-card.cr{position:fixed;inset:0;width:auto;max-width:none;border-radius:0;border:0;padding:0;gap:0;display:flex;flex-direction:column;text-align:left;background:#1c140e;padding-bottom:env(safe-area-inset-bottom)}
.crh{display:flex;align-items:center;gap:6px;padding:6px 8px;padding-top:max(6px,env(safe-area-inset-top));background:#2a1c12;border-bottom:1px solid var(--line)}.crh b{flex:1;font:400 17px var(--disp);color:var(--acc)}
.crb{min-width:44px;min-height:44px;border-radius:12px;border:1px solid var(--line);background:rgba(0,0,0,.3);color:var(--fg);font-size:20px}
.crp{position:relative;flex:0 0 38vh;min-height:210px;overflow:hidden}.crp canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;display:block}
.crmsg{position:absolute;inset:auto 0 45% 0;text-align:center;color:var(--muted);font-size:13px}.crhint{position:absolute;right:8px;bottom:6px;margin:0;font-size:11px;color:#fff8;pointer-events:none}
.crvw{position:absolute;left:6px;top:6px;display:flex;gap:4px}.crlt{position:absolute;right:6px;top:6px;display:flex;flex-direction:column;gap:4px}
.crv{min-height:38px;min-width:38px;padding:4px 9px;border-radius:10px;border:1px solid #fff3;background:rgba(0,0,0,.45);color:var(--fg);font:600 12px var(--body)}.crv.on{border-color:var(--acc);background:rgba(242,197,90,.25)}
.crtabs{display:flex;overflow-x:auto;gap:2px;padding:4px;background:#241810;border-top:1px solid var(--line);border-bottom:1px solid var(--line);scrollbar-width:none}
.crt{flex:1 0 58px;min-height:52px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;border-radius:10px;border:1px solid transparent;background:none;color:var(--muted)}.crt span{font-size:20px}.crt small{font-size:11px}
.crt.on{background:rgba(242,197,90,.16);border-color:var(--acc);color:var(--fg)}
.crbody{flex:1;overflow-y:auto;padding:6px 12px 14px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
.crsec h4{margin:12px 0 4px;font:700 13px var(--body);color:var(--acc);letter-spacing:.3px;text-transform:uppercase}
.crc{padding:4px 0 6px;border-bottom:1px solid #ffffff0d}.crl{display:flex;align-items:center;justify-content:space-between;font:600 14px var(--body);color:var(--fg);min-height:28px}
.crr{min-width:40px;min-height:36px;border-radius:10px;border:1px solid var(--line);background:rgba(0,0,0,.25);color:var(--muted);font-size:16px}
.crsw{display:flex;align-items:center;gap:8px}.crsw small{flex:0 0 52px;font-size:11px;color:var(--muted);text-align:center;line-height:1.15}
.crs{-webkit-appearance:none;appearance:none;flex:1;min-width:0;height:40px;background:transparent;touch-action:pan-y;margin:0}
.crs::-webkit-slider-runnable-track{height:8px;border-radius:4px;background:linear-gradient(90deg,#5a3a22,#c98a2e)}
.crs::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;border-radius:50%;background:#f2c55a;border:3px solid #3a2410;margin-top:-11px;box-shadow:0 2px 6px #000a}
.crs::-moz-range-track{height:8px;border-radius:4px;background:linear-gradient(90deg,#5a3a22,#c98a2e)}.crs::-moz-range-thumb{width:26px;height:26px;border-radius:50%;background:#f2c55a;border:3px solid #3a2410}
.crchs{display:flex;flex-wrap:wrap;gap:6px;padding:2px 0}.crch{min-height:44px;padding:6px 12px;border-radius:12px;border:1px solid var(--line);background:rgba(255,255,255,.05);color:var(--fg);font:600 13px var(--body);display:inline-flex;align-items:center;gap:6px}
.crch.on{border-color:var(--acc);background:rgba(242,197,90,.2);box-shadow:inset 0 0 0 1px var(--acc)}.crch.sw i{display:inline-block;width:24px;height:24px;border-radius:50%;background:var(--sw);border:2px solid #0006}
.crchs.sws .crch.sw:not(:has(span)){padding:6px}.crjump{position:sticky;top:-6px;z-index:2;display:flex;gap:5px;overflow-x:auto;padding:6px 0;background:#1c140e;scrollbar-width:none}.crjump .crch{min-height:38px;flex:0 0 auto;font-size:12px}
.crpre{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px}.crpb{min-height:84px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.05);color:var(--fg)}
.crpb span{font-size:26px}.crpb b{font-size:13px}.crpb small{font-size:11px;color:var(--muted)}.crpb.rnd{border-style:dashed}
.crsav{display:grid;grid-template-columns:1fr 1fr;gap:8px}.crsl{display:flex;gap:4px;min-height:52px}.crsl.empty{border:1px dashed var(--line);border-radius:12px;background:none;color:var(--muted);font:600 12px var(--body)}
.crslb{flex:1;display:flex;align-items:center;gap:6px;border-radius:12px;border:1px solid var(--line);background:rgba(255,255,255,.05);color:var(--fg);font:600 13px var(--body);padding:4px 8px;text-align:left}
.crrt{margin-top:14px;width:100%;min-height:44px}
.crf{display:flex;flex-direction:column;gap:6px;padding:8px 10px;background:#2a1c12;border-top:1px solid var(--line)}.crf>.btn{min-height:46px}.crfr{display:flex;gap:8px;align-items:flex-end}
.crfr .crn{flex:1}.crfr .crn input{padding:9px 10px}.crfr>.btn.big{min-height:48px;padding:8px 18px;font-size:16px}.crfr.mds{display:flex;align-items:center}.crfr.mds .md{flex:0 0 auto;min-height:40px;padding:6px 12px;justify-content:center}.crfr.mds small{font-size:11px}
.crf:has(>.btn){flex-direction:row}.crf>.btn{flex:1}.crav svg{display:block;border-radius:50%}
@media (min-width:760px) and (orientation:landscape){.ov-card.cr{display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,440px);grid-template-rows:auto auto 1fr auto}
 .crh{grid-column:1/3}.crp{grid-row:2/5;grid-column:1;flex:none;min-height:0}.crtabs{grid-column:2;grid-row:2}.crbody{grid-column:2;grid-row:3}.crf{grid-column:2;grid-row:4}}`;document.head.appendChild(s);}
// sự kiện
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a^="cr"]');if(!b)return;const a=b.dataset.a;if(a==='crch'||!/^cr(back|undo|redo|rnd|rndall|view|light|tab|set|bit|reset|skin|pre|load|store|del|save|jump|edit)$/.test(a)&&a!=='credit')return;
  e.stopImmediatePropagation();e.preventDefault();try{sfx('pick');}catch(er){}const A=CRE.app;
  switch(a){case 'credit':crOpen('edit');break;
    case 'crback':{const m=CRE.mode;crClose();if(m==='edit')uiOverlay(false);else uiStart({cont:true});break;}
    case 'crsave':{S.app=crSan(A);const f=S.app.f;if(((LOOK2[S.look||0]||{}).sex==='f')!==!!f)S.look=f?1:0;crClose();uiOverlay(false);try{playerInit();crTintFP();}catch(er){console.warn(er);}if(typeof MP!=='undefined'&&MP)MP.presK=null;save();uiToast('🎨 Đã lưu ngoại hình mới.','good');break;}
    case 'crundo':case 'crredo':{const i=CRE.hi+(a==='crundo'?-1:1);if(i<0||i>=CRE.hist.length)break;CRE.hi=i;CRE.app=JSON.parse(CRE.hist[i]);crPanel();crQueue('rb');break;}
    case 'crrnd':crRandom(CRE.tab==='mau'?null:CRE.tab);crPanel();crQueue('rb');crCommit();break;
    case 'crrndall':crRandom(null);crPanel();crQueue('rb');crCommit();break;
    case 'crview':crView(b.dataset.v);break;
    case 'crlight':crLight(b.dataset.v);document.querySelectorAll('.crlt .crv').forEach(x=>x.classList.toggle('on',x.dataset.v===b.dataset.v));break;
    case 'crtab':CRE.tab=b.dataset.t;document.querySelectorAll('.crt').forEach(x=>x.classList.toggle('on',x.dataset.t===CRE.tab));$('#crBody').scrollTop=0;crPanel();
      crView({dang:'full',mat:'face',da:'face',toc:'hair',trang:'upper',mau:'full'}[CRE.tab]||'full');break;
    case 'crjump':{const el=$('#crsec'+b.dataset.i);if(el)$('#crBody').scrollTop=el.offsetTop-48;break;}
    case 'crset':{const k=b.dataset.k,v=+b.dataset.v;crSet(k,v,true);if(k==='f'){if(A.f&&[4,7].includes(A.hs))A.hs=0;if(!A.f&&A.hs===0)A.hs=1;G.nsex=A.f?'f':'m';}crPanel();crView(CRK[k].z);break;}
    case 'crbit':{const k=b.dataset.k;crSet(k,A[k]^(1<<+b.dataset.v),true);crPanel();break;}
    case 'crreset':{const k=b.dataset.k;crSet(k,k==='sk'?0.45:0,true);crPanel();break;}
    case 'crskin':crSet('sk',+b.dataset.v/(CR_SKIN.length-1),true);crPanel();crView('face');break;
    case 'crpre':{const i=+b.dataset.i;CRE.app=crPreset(i);G.nsex=CRE.app.f?'f':'m';crPanel();crQueue('rb');crCommit();break;}
    case 'crload':{const L=crLooksLS(),s=L[+b.dataset.i],d=s&&crDec(s.ap);if(d){CRE.app=d;crPanel();crQueue('rb');crCommit();uiToast('Đã mở kiểu "'+s.n+'".','');}break;}
    case 'crstore':{const L=crLooksLS(),i=Math.min(+b.dataset.i,L.length);const nm=(($('#nName')&&$('#nName').value)||(S&&S.name)||'Kiểu').trim().slice(0,14)+' '+(i+1);L[i]={n:nm,ap:crEnc(CRE.app)};crLooksLS(L.slice(0,6));crPanel();uiToast('💾 Đã lưu kiểu vào ô '+(i+1)+'.','good');break;}
    case 'crdel':{const L=crLooksLS();L.splice(+b.dataset.i,1);crLooksLS(L);crPanel();break;}}},true);
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.classList||!t.classList.contains('crs')||!CRE.open)return;crSet(t.dataset.k,+t.value/100,false);});
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.classList||!t.classList.contains('crs')||!CRE.open)return;crSet(t.dataset.k,+t.value/100,true);});
document.addEventListener('pointerdown',e=>{if(!CRE.open)return;const c=e.target&&e.target.closest&&e.target.closest('.crc[data-z]');if(c&&CRE.view!==c.dataset.z)crView(c.dataset.z);},true);
