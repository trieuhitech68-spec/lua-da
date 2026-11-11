/* ===================== LÀM MỚI DỮ LIỆU (đợt 11/2026) =====================
   Sau đợt nâng cấp lớn, mọi người chơi lại từ đầu: bản lưu nhân vật cũ trên máy bị xoá MỘT LẦN khi mở bản này (cài đặt, email đăng nhập giữ nguyên).
   Dữ liệu trên máy chủ xoá bằng supabase_reset_2026_11.sql. Muốn làm mới lần nữa: đổi LD_RESET. */
const LD_RESET='2026-11-11';
try{if(localStorage.getItem('ldtt-reset')!==LD_RESET){const del=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&(k.indexOf('lua-da-tay-trang-v1')===0||k==='ldtt-slots'||k==='ldtt-cur'||k.indexOf('ld-upl-')===0))del.push(k);}
  del.forEach(k=>localStorage.removeItem(k));localStorage.setItem('ldtt-reset',LD_RESET);}}catch(e){}
/* ===================== TIỆN ÍCH ĐỒ HỌA DÙNG CHUNG ===================== */
function rng(seed){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c;}
const TEXC={};
function E(c,x,y,rx,ry,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,Math.max(.5,rx),Math.max(.5,ry),0,0,Math.PI*2);c.fill();}
function texCanvas(kind){if(TEXC[kind])return TEXC[kind];const N=128,cv=mkCanvas(N,N),c=cv.getContext('2d');const R=rng(kind.length*977+kind.charCodeAt(0)*13);
  const dk=a=>`rgba(20,12,6,${a})`,lt=a=>`rgba(255,246,228,${a})`;
  if(kind==='plaster'){for(let i=0;i<300;i++){c.fillStyle=R()<.5?dk(.07):lt(.07);c.beginPath();c.arc(R()*N,R()*N,1+R()*3,0,7);c.fill();}}
  else if(kind==='hide'){for(let i=0;i<40;i++){c.fillStyle=R()<.6?dk(.08):lt(.07);c.beginPath();c.ellipse(R()*N,R()*N,4+R()*14,3+R()*9,R()*3,0,7);c.fill();}c.strokeStyle=dk(.4);c.setLineDash([3,4]);c.lineWidth=1.5;[32,96].forEach(x=>{c.beginPath();c.moveTo(x,0);c.lineTo(x,N);c.stroke();});c.setLineDash([]);}
  else if(kind==='wood'){for(let x=0;x<N;x+=16){c.fillStyle=R()<.5?dk(.07):lt(.06);c.fillRect(x,0,16,N);c.fillStyle=dk(.4);c.fillRect(x,0,1.6,N);}c.strokeStyle=dk(.14);c.lineWidth=1;for(let i=0;i<34;i++){const x=R()*N;c.beginPath();c.moveTo(x,0);c.bezierCurveTo(x+3,N*.3,x-3,N*.6,x+2,N);c.stroke();}for(let i=0;i<6;i++)E(c,R()*N,R()*N,1.6,3.5,dk(.25));}
  else if(kind==='logs'){for(let y=0;y<N;y+=16){c.fillStyle=lt(.1);c.fillRect(0,y+2,N,5);c.fillStyle=dk(.45);c.fillRect(0,y+14,N,2);c.strokeStyle=dk(.14);c.beginPath();c.moveTo(0,y+9);c.lineTo(N,y+9+R()*2);c.stroke();}}
  else if(kind==='bamboo'){for(let x=0;x<N;x+=10){c.fillStyle=lt(.14);c.fillRect(x+2,0,2,N);c.fillStyle=dk(.32);c.fillRect(x+9,0,1,N);for(let y=R()*20;y<N;y+=26+R()*10){c.fillStyle=dk(.4);c.fillRect(x,y,10,1.6);}}
    c.strokeStyle=dk(.25);c.lineWidth=1;for(let y=8;y<N;y+=16){c.beginPath();for(let x=0;x<=N;x+=8)c.lineTo(x,y+((x/8)%2?3:-3));c.stroke();}}
  else if(kind==='thatch'){for(let row=0;row<N;row+=10){for(let i=0;i<46;i++){const x=R()*N;c.strokeStyle=R()<.5?dk(.25):lt(.22);c.lineWidth=1;c.beginPath();c.moveTo(x,row);c.lineTo(x+R()*4-2,row+12+R()*4);c.stroke();}c.fillStyle=dk(.2);c.fillRect(0,row+10,N,1.5);}}
  else if(kind==='stone'){let y=0;while(y<N){const h=14+R()*8;let x=-R()*20;while(x<N){const w=18+R()*18;c.fillStyle=R()<.5?dk(.09):lt(.08);c.fillRect(x+1,y+1,w-2,h-2);c.strokeStyle=dk(.42);c.lineWidth=1.6;c.strokeRect(x,y,w,h);c.strokeStyle=lt(.18);c.beginPath();c.moveTo(x+2,y+2.5);c.lineTo(x+w-2,y+2.5);c.stroke();x+=w;}y+=h;}}
  else if(kind==='rock'){for(let i=0;i<70;i++){c.fillStyle=R()<.5?dk(.1):lt(.08);c.beginPath();c.ellipse(R()*N,R()*N,3+R()*12,2+R()*8,R()*3,0,7);c.fill();}c.strokeStyle=dk(.32);c.lineWidth=1;for(let i=0;i<9;i++){let x=R()*N,y=R()*N;c.beginPath();c.moveTo(x,y);for(let k=0;k<4;k++){x+=R()*16-8;y+=R()*12;c.lineTo(x,y);}c.stroke();}}
  else if(kind==='brick'){for(let y=0,r=0;y<N;y+=8,r++){for(let x=(r%2)*9-9;x<N;x+=18){const q=R();c.fillStyle=q<.35?dk(.14):q<.6?lt(.07):'rgba(0,0,0,0)';c.fillRect(x+1,y+1,16,6);}c.fillStyle=lt(.4);c.fillRect(0,y+7,N,1.2);for(let x=(r%2)*9-9;x<N;x+=18)c.fillRect(x,y,1.2,8);}}
  else if(kind==='tile'){for(let y=0,r=0;y<N;y+=9,r++){for(let x=(r%2)*6-6;x<N;x+=12){c.fillStyle=dk(.3);c.beginPath();c.arc(x+6,y+9,6,Math.PI,0);c.fill();c.fillStyle=lt(.14);c.beginPath();c.arc(x+6,y+8,4.4,Math.PI,0);c.fill();}}}
  else if(kind==='timber'){c.fillStyle='rgba(74,46,24,.9)';[0,42,84].forEach(x=>c.fillRect(x,0,6,N));c.fillRect(0,0,N,5);c.fillRect(0,62,N,5);c.lineWidth=5;c.strokeStyle='rgba(74,46,24,.9)';c.beginPath();c.moveTo(6,5);c.lineTo(42,62);c.moveTo(84,5);c.lineTo(48,62);c.moveTo(48,67);c.lineTo(84,124);c.stroke();}
  else if(kind==='concrete'){for(let i=0;i<320;i++){c.fillStyle=R()<.5?dk(.05):lt(.05);c.fillRect(R()*N,R()*N,2,2);}c.strokeStyle=dk(.2);c.lineWidth=1;c.strokeRect(.5,.5,N-1,N/2-1);c.strokeRect(.5,N/2+.5,N-1,N/2-1);[[8,8],[N-8,8],[8,N/2+8],[N-8,N/2+8]].forEach(([x,y])=>E(c,x,y,1.5,1.5,dk(.22)));}
  else if(kind==='glass'){for(let y=0;y<N;y+=16)for(let x=0;x<N;x+=12){c.fillStyle=R()<.14?'rgba(255,236,170,.4)':lt(.05);c.fillRect(x+1,y+1,10,14);}c.fillStyle=dk(.5);for(let x=0;x<N;x+=12)c.fillRect(x,0,1.3,N);for(let y=0;y<N;y+=16)c.fillRect(0,y,N,1.3);c.fillStyle=lt(.14);c.beginPath();c.moveTo(0,48);c.lineTo(48,0);c.lineTo(72,0);c.lineTo(0,72);c.fill();}
  else if(kind==='metal'){for(let y=0;y<N;y+=2){c.fillStyle=R()<.5?lt(.035):dk(.035);c.fillRect(0,y,N,1);}c.fillStyle=dk(.38);[0,64].forEach(y=>c.fillRect(0,y,N,1.6));[0,64].forEach(x=>c.fillRect(x,0,1.6,N));c.fillStyle=lt(.45);for(let x=6;x<N;x+=16)[6,70].forEach(y=>E(c,x,y,1.4,1.4,lt(.45)));}
  else if(kind==='corr'){for(let x=0;x<N;x+=8){c.fillStyle=lt(.12);c.fillRect(x,0,3,N);c.fillStyle=dk(.18);c.fillRect(x+5,0,3,N);}}
  else if(kind==='panel'){c.strokeStyle=dk(.28);c.lineWidth=1.3;c.strokeRect(4,4,56,26);c.strokeRect(68,4,56,58);c.strokeRect(4,36,56,26);c.strokeRect(4,68,120,56);c.fillStyle='rgba(110,230,255,.45)';[[60,10],[10,60],[118,92],[30,100]].forEach(([x,y])=>c.fillRect(x,y,5,2));c.strokeStyle=lt(.14);c.beginPath();c.moveTo(0,96);c.lineTo(N,96);c.stroke();}
  else if(kind==='crystal'){c.strokeStyle=lt(.3);c.lineWidth=1;for(let i=0;i<14;i++){c.beginPath();c.moveTo(R()*N,R()*N);c.lineTo(R()*N,R()*N);c.stroke();}for(let i=0;i<10;i++){c.fillStyle=R()<.5?lt(.1):dk(.12);c.beginPath();c.moveTo(R()*N,R()*N);c.lineTo(R()*N,R()*N);c.lineTo(R()*N,R()*N);c.fill();}}
  else if(kind==='grass'){for(let i=0;i<260;i++){const x=R()*N,y=R()*N;c.strokeStyle=R()<.5?'rgba(30,60,14,.32)':'rgba(200,240,130,.24)';c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.lineTo(x+R()*3-1.5,y-3-R()*4);c.stroke();}}
  else if(kind==='cobble'){for(let i=0;i<90;i++){const x=R()*N,y=R()*N,r=4+R()*5;c.fillStyle=R()<.5?dk(.1):lt(.1);c.beginPath();c.ellipse(x,y,r,r*0.7,R(),0,7);c.fill();c.strokeStyle=dk(.3);c.lineWidth=1;c.stroke();}}
  else if(kind==='asphalt'){for(let i=0;i<500;i++){c.fillStyle=R()<.5?dk(.08):lt(.06);c.fillRect(R()*N,R()*N,1.5,1.5);}}
  else if(kind==='rice'){for(let y=4;y<N;y+=8)for(let x=(y%16?4:0);x<N;x+=8){c.strokeStyle='rgba(40,90,20,.5)';c.lineWidth=1.2;c.beginPath();c.moveTo(x,y+3);c.lineTo(x-1,y-3);c.moveTo(x,y+3);c.lineTo(x+2,y-2);c.stroke();}}
  TEXC[kind]=cv;return cv;}
