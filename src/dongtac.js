/* ===================== ĐỘNG TÁC LAO ĐỘNG LÀM LẠI (từng việc một) =====================
   1. Chặt cây bằng rìu: đứng chân trước chân sau, hai tay nắm cán, vung rìu ra sau vai phải rồi bổ chéo vào thân cây ngang hông (trước: cúi gập người quét rìu sát đất).
   2. Đập đá bằng cuốc chim: giơ cao quá đầu, bổ thẳng xuống.
   3. Cầm rìu/cuốc lúc đứng, đi: xuôi tay, đầu rìu chúc xuống cạnh chân (trước: chĩa ngang ra trước như cầm sào).
   Nhịp: k=0 sẵn sàng → 0.30 vung lên hết tầm → 0.42 lưỡi chạm (đúng lúc game tính nhát chém) → khựng, giật nhẹ → về thế sẵn sàng. */
const DT_KEY={chop:[
  {g:[2.2,19.5,3.0],hd:[-0.35,0.75,0.55],bd:[-0.6,0,0.8],ty:0.1,tx:0.08,hy:0.05,hh:17.0,hz:0},
  {g:[3.8,25.5,-0.4],hd:[0.5,0.78,-0.55],bd:[-0.3,-0.3,0.9],ty:0.7,tx:-0.03,hy:0.3,hh:16.8,hz:-0.7},
  {g:[0.8,18.6,5.4],hd:[-0.45,-0.1,1],bd:[-1,0,-0.35],ty:-0.45,tx:0.3,hy:-0.2,hh:15.7,hz:1.6}],
 mine:[
  {g:[1.6,19,3.5],hd:[-0.1,0.85,0.5],bd:[0,-0.4,1],ty:0.05,tx:0.08,hy:0,hh:17.0,hz:0},
  {g:[1.6,29.6,-1.2],hd:[0.05,0.78,-0.62],bd:[0,0.6,0.8],ty:0.12,tx:-0.2,hy:0.05,hh:17.3,hz:-0.5},
  {g:[1.1,14.8,6.4],hd:[0,-0.62,0.78],bd:[0,-0.8,-0.6],ty:-0.05,tx:0.6,hy:0,hh:14.8,hz:1.0}]};
function dtSwing(R,k,kind){const K=h3ik(),P3=DT_KEY[kind]||DT_KEY.chop,L=h3lerp;let a,b,w,rc=0;
  if(k<0.30){a=P3[0];b=P3[1];w=h3ss(k/0.30);}else if(k<0.42){a=P3[1];b=P3[2];const u=(k-0.30)/0.12;w=u*u;}
  else if(k<0.54){a=P3[2];b=P3[2];w=0;const u=(k-0.42)/0.12;rc=Math.sin(u*Math.PI)*Math.exp(-u*2.2);}else{a=P3[2];b=P3[0];w=h3ss((k-0.54)/0.46);}
  const v=(n,i)=>i==null?L(a[n],b[n],w):L(a[n][i],b[n][i],w);
  const ty=v('ty'),tx=v('tx')-rc*0.06,hy=v('hy');
  K.hipsAt(R,0,v('hh')+rc*0.25,v('hz')-rc*0.5);if(kind==='mine')K.feet(R,-2.9,1.6,2.9,-0.6);else K.feet(R,-2.6,3.8,2.8,-3.2);
  R.hips.rotation.set(0,hy,0);R.torso.rotation.set(tx,ty,0);R.head.rotation.set(0.1+tx*0.25,-(ty+hy)*0.8,0);
  const gx=v('g',0),gy=v('g',1)+rc*0.5,gz=v('g',2)-rc*0.9,hx=v('hd',0),hY=v('hd',1)+rc*0.12,hz=v('hd',2),hl=Math.hypot(hx,hY,hz)||1;
  const hd=K.W(0,hx,hY,hz),bd=K.W(1,v('bd',0),v('bd',1),v('bd',2));
  K.gripTo(R,1,gx,gy,gz,hd,bd,K.W(2,1,-0.6,-0.4));const o=4.6;
  K.gripTo(R,-1,gx+hx/hl*o,gy+hY/hl*o,gz+hz/hl*o,hd,bd,K.W(3,-1,-0.5,-0.4));K.cloak(R);}
H3PO.chop2=(R,k)=>dtSwing(R,k,'chop');
H3PO.mine2=(R,k)=>dtSwing(R,k,'mine');
/* nối vào bộ chọn dáng: nhát chém vào cây/đá và các bước làm việc 'chop' / 'mine' */
{const _hp=h3pose;h3pose=function(R,mode,t){try{const A=G.act,W=G.work,tk=P.toolId&&ITEMS[P.toolId]&&ITEMS[P.toolId].tool;let fn=null,k=0;
    if(!G.ride&&!G.sit&&!G.sleeping){
      if(W){const st=W.steps[W.i]||W.steps[0];if(st&&(st.a==='chop'||st.a==='mine')&&(tk==='axe'||tk==='pick')){fn=st.a==='mine'||tk==='pick'?H3PO.mine2:H3PO.chop2;k=h3fr(W.t/0.95);}}
      else if(A&&!G.climb&&!G.swim&&!G.h3aim&&A.t&&A.t.type==='res'&&(tk==='axe'||tk==='pick')&&P.anim!=='gather'&&P.anim!=='dig'){fn=tk==='pick'?H3PO.mine2:H3PO.chop2;k=clamp(1-(A.next||0)/(A.per||0.72),0,1);}}
    if(fn){K3.char2Neutral(R);fn(R,k,{});return true;}}catch(e){if(!H3.dtErr){H3.dtErr=1;console.warn('động tác',e);}}
  return _hp.apply(this,arguments);};}
/* cầm rìu, cuốc, gậy đào lúc đứng/đi: đầu dụng cụ chúc xuống cạnh chân */
{const _ct=h3carryTool;h3carryTool=function(R,tl,sw){const I=ITEMS[tl],k=I&&I.tool;if(k==='axe'||k==='pick'||k==='dig'||k==='club'||k==='hammer'){R.armR.rotation.set(0.1+(sw||0)*0.12,0,0.09);R.foreR.rotation.set(-0.42,0,0);R.handR.rotation.set(0.95,0,0);return;}return _ct.apply(this,arguments);};}
