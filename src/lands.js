/* ===================== NHIỀU VÙNG ĐẤT NỐI BẰNG CỔNG (phần 1: địa hình) =====================
   Mỗi máy chủ / ván chơi có 3 vùng đất, mỗi vùng là một bản đồ riêng; máy chỉ tải vùng đang đứng nên thế giới rộng gấp ba mà không nặng thêm.
     c   Đất Trung Tâm        : bản đồ gốc (hình chữ S hoặc bản đồ tròn cũ). Nơi bắt đầu, dựng nhà chính, cắm lãnh thổ, có bảo hộ.
     tb  Tây Bắc Núi Cao      : núi dựng cao gấp rưỡi, nhiều đá, tuyết; giàu quặng đồng, thiếc, sắt, than, gỗ thông. Vùng cấp +6. Cần cấp 8.
     dao Biển Đảo Phương Nam  : mực nước dâng 22 đơn vị → quần đảo, đầm phá, bãi cát; giàu muối, sò ngọc, cọ, tre, chuối, vàng sa khoáng. Vùng cấp +10. Cần cấp 12.
   Vùng xa dựng bằng bộ sinh địa hình bản đồ tròn (WV 3) với hạt giống riêng suy từ hạt giống gốc, rồi biến đổi độ cao theo vùng.
   S.land = mã vùng đang ở; S.seed0 = hạt giống gốc; S.seed = hạt giống của vùng đang ở. Phần 2 (đi qua cổng, lưu riêng từng vùng) ở lands2.js. */
const LANDS=[{id:'c',n:'Đất Trung Tâm',ic:'🏠',lv:0,need:1,d:'Nơi bắt đầu. Nhà chính, lãnh thổ và bảo hộ khi vắng chỉ có ở đây.'},
  {id:'tb',n:'Tây Bắc Núi Cao',ic:'🏔️',lv:6,need:8,d:'Núi dựng cao gấp rưỡi, đèo dốc, tuyết phủ. Giàu quặng đồng, thiếc, sắt, than đá và gỗ thông cổ thụ. Gấu, sói, hổ mạnh.',hf:(h,x,z)=>{if(h<=0)return h;let v=h*1.5+Math.min(14,h);/* dãy núi thứ hai ở phía nam + lòng chảo Điện Biên ở giữa: bố cục khác hẳn vùng trung tâm */
     const s=ss(600,2600,z)*(1-ss(5200,6600,Math.hypot(x,z)));v+=s*(60+NS.ridge(x/850+5,z/850-3,4)*330);const bd=Math.hypot((x+1600)/1500,(z-900)/1000);if(bd<1.3){const k=1-ss(0.55,1.3,bd);v=v*(1-k)+(34+NS.fbm(x/400,z/400,2)*8)*k;}return v;},
   reg:{start:'Bản Đầu Nguồn',range:'Dãy Hoàng Liên',pineplat:'Cao Nguyên Mộc Châu',karst:'Cao Nguyên Đá Đồng Văn',terrace:'Ruộng Bậc Thang Mù Cang Chải',canyon:'Hẻm Vực Tu Sản',vista:'Đèo Ô Quy Hồ',plateau:'Sơn Nguyên Tà Phình',bamboovl:'Thung Lũng Mường Thanh',hotspring:'Suối Khoáng Mường La',basalt:'Núi Lửa Ngủ Yên',forest:'Rừng Pơ Mu',village:'Bản Người Thái'}},
  {id:'dao',n:'Biển Đảo Phương Nam',ic:'🏝️',lv:10,need:12,d:'Nước biển dâng nhấn chìm đồng bằng: còn lại quần đảo, đầm phá, bãi cát trắng. Giàu muối, sò ngọc, vàng sa khoáng, cọ, tre, chuối. Cá sấu và bò tót.',hf:(h,x,z)=>{let v=h>0?(h-22)*0.86:h;/* đảo núi lửa lớn phía đông nam + chuỗi đảo nhỏ rải trên biển */
     const dv=Math.hypot(x-2700,z-2900)+NS.fbm(x/200,z/200,2)*60;if(dv<1300){const c=Math.pow(1-ss(120,1300,dv),1.4)*420-(dv<160?130*(1-(dv/160)**2):0);v=Math.max(v,c-6);}
     if(v<2&&Math.hypot(x,z)<6600){const n=NS.fbm(x/330+9,z/330-4,3);if(n>0.3)v=Math.max(v,(n-0.3)*90-4);}return v;},
   reg:{start:'Đảo Lớn',halong:'Quần Đảo Đá',beach:'Bãi San Hô',mangrove:'Rừng Đước',lake:'Đầm Phá',delta:'Cửa Biển',cliffs:'Mũi Đá Dựng',trangan:'Vụng Thuyền',jungle:'Rừng Dừa',savanna:'Đồng Cỏ Đảo',range:'Đỉnh Đảo Mây',karst:'Hòn Đá Vôi',village:'Làng Chài'}}];
const landCur=()=>LANDS.find(L=>L.id===(typeof S==='object'&&S&&S.land||'c'))||LANDS[0];
function landSeed(id){const s0=seed0(),i=LANDS.findIndex(L=>L.id===id);return i<=0?s0:((s0*31+i*7919)%2000000000)+1;}
// độ cao: biến đổi theo vùng (lớp ngoài cùng của baseH)
{const _bh=baseH;baseH=function(x,z){const h=_bh(x,z),L=landCur();return L.hf?L.hf(h,x,z):h;};}
// chỗ đất đặt được cổng gần một điểm cho trước
function landSpot(tx,tz){for(let r=0;r<3200;r+=70){const n=r?Math.ceil(r/45):1;for(let i=0;i<n;i++){const a=i/n*6.283,x=tx+Math.cos(a)*r,z=tz+Math.sin(a)*r;if(!wIn(x,z,0.9))continue;const h=hAt(x,z);if(h<5||h>320||wdAt(x,z)>0||slopeAt(x,z)>0.4)continue;
      let ok=true;for(let k=0;k<6;k++){const ax=x+Math.cos(k*1.05)*60,az=z+Math.sin(k*1.05)*60;if(wdAt(ax,az)>0||Math.abs(hAt(ax,az)-h)>26){ok=false;break;}}if(ok)return [+x.toFixed(0),+z.toFixed(0)];}}return null;}
const LD={gates:[],objs:[]};
function landGatesPlan(){LD.gates=[];const id=landCur().id,far=Math.hypot(SPAWN[0],SPAWN[1]);const want=id==='c'?[['tb',WV>=4?[-3600,-3300]:[-3400,-3000]],['dao',WV>=4?[3300,9000]:[3000,4200]]]:[['c',[SPAWN[0]+700,SPAWN[1]+500]],[id==='tb'?'dao':'tb',[SPAWN[0]-2600,SPAWN[1]-1800]]];
  for(const [to,t] of want){const p=landSpot(t[0],t[1]);if(p)LD.gates.push({to,x:p[0],z:p[1]});}}
{const _rb=regionsBuild;regionsBuild=function(){const r=_rb.apply(this,arguments);try{const L=landCur();if(L.reg)for(const g of REG)if(L.reg[g.id])g.n=L.reg[g.id];landGatesPlan();
    for(const g of LD.gates){const T=LANDS.find(x=>x.id===g.to);REG.push({id:'gate_'+g.to,n:'Cổng sang '+T.n,d:T.d+(T.need>1?' Cần nhân vật cấp '+T.need+'.':''),ic:'⛩️',x:g.x,z:g.z,r:170});}}catch(e){console.warn('vùng đất',e);}return r;};}
