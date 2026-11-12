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
/* ---------- bộ dựng dáng theo mốc: mỗi mốc {t, g:[tay phải], hd:[hướng cán], bd, l:[tay trái] (bỏ trống = nắm cán phía trên tay phải), tx,ty,hy,hh,hz, e:kiểu vào mốc} ---------- */
const DT_DEF={g:[2,19,3],hd:[0,0.8,0.5],bd:[0,0,1],tx:0.05,ty:0,hy:0,hh:17.2,hz:0,hdx:0.1};
function dtKeys(R,k,keys,o){const K=h3ik(),L=h3lerp;o=o||{};let i=0;while(i<keys.length-2&&k>=keys[i+1].t)i++;const a=keys[i],b=keys[i+1],u0=clamp((k-a.t)/Math.max(1e-4,b.t-a.t),0,1),w=b.e==='in'?u0*u0:b.e==='lin'?u0:h3ss(u0);
  const g=(n,j)=>{const x=a[n]!=null?a[n]:DT_DEF[n],y=b[n]!=null?b[n]:DT_DEF[n];return j==null?L(x,y,w):L(x[j],y[j],w);};
  const tx=g('tx'),ty=g('ty'),hy=g('hy');K.hipsAt(R,0,g('hh'),g('hz'));if(o.kneel)K.kneel(R,g('hh'),0.28);else{const f=o.feet||[-2.4,1.2,2.4,-0.8];K.feet(R,f[0],f[1],f[2],f[3]);}
  R.hips.rotation.set(o.kneel?0.12:0,hy,0);R.torso.rotation.set(tx,ty,0);R.head.rotation.set(g('hdx')+tx*0.2,-(ty+hy)*0.8,0);
  const gx=g('g',0),gy=g('g',1),gz=g('g',2),hx=g('hd',0),hY=g('hd',1),hz=g('hd',2),hl=Math.hypot(hx,hY,hz)||1,hd=K.W(0,hx,hY,hz),bd=K.W(1,g('bd',0),g('bd',1),g('bd',2));
  K.gripTo(R,1,gx,gy,gz,hd,bd,K.W(2,1,-0.6,-0.4));
  if(a.l||b.l){const la=a.l||[gx+hx/hl*4.6,gy+hY/hl*4.6,gz+hz/hl*4.6],lb=b.l||la;K.armTo(R,-1,L(la[0],lb[0],w),L(la[1],lb[1],w),L(la[2],lb[2],w),-1,-0.4,-0.5);}
  else{const ofs=o.ofs||4.6;K.gripTo(R,-1,gx+hx/hl*ofs,gy+hY/hl*ofs,gz+hz/hl*ofs,hd,bd,K.W(3,-1,-0.5,-0.4));}K.cloak(R);}
/* 3. ĐÀO ĐẤT bằng gậy đào: giơ gậy → thọc mạnh xuống đất trước mặt → bẩy cán về phía mình cho bật đất → nhấc lên */
const DT_DIG=[{t:0,g:[1.5,21.5,3.2],hd:[0,-0.92,0.4],bd:[1,0,0],tx:0.22,hh:16.8},{t:0.28,g:[1.2,14.6,5.6],hd:[0,-0.93,0.36],bd:[1,0,0],tx:0.62,hh:15.0,hz:0.8,e:'in'},
  {t:0.36,g:[1.2,14.2,5.6],hd:[0,-0.93,0.36],bd:[1,0,0],tx:0.64,hh:14.9,hz:0.8},{t:0.62,g:[1.6,12.4,2.2],hd:[0,-0.62,0.78],bd:[1,0,0],tx:0.5,hh:14.4,hz:-0.6},
  {t:1,g:[1.5,21.5,3.2],hd:[0,-0.92,0.4],bd:[1,0,0],tx:0.22,hh:16.8}];
H3PO.dig2=(R,k)=>dtKeys(R,k,DT_DIG,{feet:[-2.8,2.4,2.8,-1.6]});
/* 4. ĐÓNG BÚA / ĐẼO khi dựng: tay trái giữ vật, tay phải giơ lên ngang tai rồi nện xuống, người nhún theo */
const DT_HAM=[{t:0,g:[3.0,21,6],hd:[0,0.75,0.65],l:[-2.2,17.5,9.5],tx:0.22,ty:0.05,hh:16.6},{t:0.26,g:[3.8,27.5,2.2],hd:[0.1,0.8,-0.55],l:[-2.2,17.5,9.5],tx:0.12,ty:0.28,hh:16.9},
  {t:0.38,g:[2.2,17.6,8.6],hd:[-0.15,-0.25,1],l:[-2.2,17.5,9.5],tx:0.4,ty:-0.12,hh:16.0,hz:0.6,e:'in'},{t:0.5,g:[2.4,18.6,8.2],hd:[-0.12,-0.1,1],l:[-2.2,17.5,9.5],tx:0.36,ty:-0.08,hh:16.2,hz:0.5},
  {t:1,g:[3.0,21,6],hd:[0,0.75,0.65],l:[-2.2,17.5,9.5],tx:0.22,ty:0.05,hh:16.6}];
H3PO.hammer2=(R,k)=>dtKeys(R,k,DT_HAM,{feet:[-2.5,3.2,2.6,-2.4]});
/* 5. HÁI / NHẶT: khuỵu gối cúi xuống, tay phải với tới vật dưới đất, tay trái tì gối → đứng dậy → bỏ vào túi bên hông */
H3PO.gather2=(R,k)=>{const K=h3ik(),L=h3lerp,dn=k<0.34?h3ss(k/0.34):k<0.56?1:1-h3ss((k-0.56)/0.3),st=k<0.86?0:h3ss((k-0.86)/0.14)*(1-0),wg=k>0.34&&k<0.56?Math.sin((k-0.34)/0.22*Math.PI*3)*0.5:0;
  K.hipsAt(R,0,L(17.2,9.6,dn),L(0,-1.6,dn));K.feet(R,-2.6,2.6,2.6,-1.4);R.hips.rotation.set(0.18*dn,0,0);R.torso.rotation.set(0.05+0.78*dn,0.12*dn,0);R.head.rotation.set(0.1+0.25*dn,-0.1*dn,0);
  const up=1-dn,sx=L(1.6+wg,4.6,up*st),sy=L(L(2.6,19,up),15.5,up*st),sz=L(L(8.4+wg*0.4,5,up),-0.6,up*st);K.armTo(R,1,sx,sy,sz,1,-0.3,-0.6);
  K.armTo(R,-1,L(-3.4,-3.0,dn),L(16,9.4,dn),L(1.5,4.6,dn),-1,-0.2,-0.6);K.cloak(R);};
/* 6. KHOAN LỬA: quỳ gối, hai lòng bàn tay kẹp que khoan xoay thật nhanh, tay trượt dần xuống rồi đưa lên lại */
H3PO.drill=(R,k,o)=>{const K=h3ik(),t=(o&&o.t)||k*4,sl=h3fr(t*0.55),y=10.8-4.2*sl,rub=Math.sin(t*26)*0.75;K.kneel(R,7.6,0.3);R.hips.rotation.x=0.14;R.torso.rotation.set(0.62+0.03*Math.sin(t*26),0,0);R.head.rotation.set(0.42,0,0);
  K.armTo(R,1,0.75,y+rub*0.25,8.2+rub,1,-0.3,-0.4);K.armTo(R,-1,-0.75,y-rub*0.25,8.2-rub,-1,-0.3,-0.4);K.cloak(R);};
/* thổi lửa: quỳ, chống hai tay, cúi sát thổi */
H3PO.blow=(R,k,o)=>{const K=h3ik(),t=(o&&o.t)||k*4,b=Math.sin(t*2.6);K.kneel(R,7.2,0.3);R.hips.rotation.x=0.2;R.torso.rotation.set(0.95+0.04*b,0,0);R.head.rotation.set(-0.35+0.06*b,0,0);
  K.armTo(R,1,2.6,1.6,8.5,1,-0.2,-0.6);K.armTo(R,-1,-2.6,1.6,8.5,-1,-0.2,-0.6);K.cloak(R);};
/* nối vào bộ chọn dáng: nhát chém vào cây/đá, đóng búa ở công trình, hái nhặt, đào, và các bước làm việc tương ứng */
{const _hp=h3pose;h3pose=function(R,mode,t){try{const A=G.act,W=G.work,tk=P.toolId&&ITEMS[P.toolId]&&ITEMS[P.toolId].tool;let fn=null,k=0,o=null;
    if(!G.ride&&!G.sit&&!G.sleeping&&!G.climb&&!G.swim){
      if(W){const st=W.steps[W.i]||W.steps[0],a=st&&st.a,fire=W.icon==='fireDrill';
        if((a==='chop'||a==='mine')&&(tk==='axe'||tk==='pick')){fn=a==='mine'||tk==='pick'?H3PO.mine2:H3PO.chop2;k=h3fr(W.t/0.95);}
        else if(a==='dig'){if(tk==='dig'){fn=H3PO.dig2;k=h3fr(W.t/1.25);}}
        else if(a==='hammer'){fn=H3PO.hammer2;k=h3fr(W.t/0.72);}
        else if(a==='gather'&&!fire){fn=H3PO.gather2;k=h3fr(W.t/1.7);}
        else if(a==='lash'&&fire){fn=H3PO.drill;o={t:W.t};}
        else if(a==='cook'&&fire){fn=H3PO.blow;o={t:W.t};}}
      else if(A&&!G.h3aim&&A.t){const ty=A.t.type,kk=clamp(1-(A.next||0)/(A.per||0.72),0,1);
        if(ty==='res'&&(tk==='axe'||tk==='pick')&&P.anim!=='gather'&&P.anim!=='dig'){fn=tk==='pick'?H3PO.mine2:H3PO.chop2;k=kk;}
        else if(ty==='site'){fn=H3PO.hammer2;k=kk;}
        else if(ty==='uproot'||(ty==='res'&&P.anim==='dig'&&tk==='dig')){fn=H3PO.dig2;k=h3remap(kk,0.42,0.3);}
        else if(ty==='res'&&P.anim==='gather'){fn=H3PO.gather2;k=h3remap(kk,0.42,0.45);}}}
    if(fn){K3.char2Neutral(R);fn(R,k,o||{});return true;}}catch(e){if(!H3.dtErr){H3.dtErr=1;console.warn('động tác',e);}}
  return _hp.apply(this,arguments);};}
/* cầm rìu, cuốc, gậy đào lúc đứng/đi: đầu dụng cụ chúc xuống cạnh chân */
{const _ct=h3carryTool;h3carryTool=function(R,tl,sw){const I=ITEMS[tl],k=I&&I.tool;if(k==='axe'||k==='pick'||k==='dig'||k==='club'||k==='hammer'){R.armR.rotation.set(0.1+(sw||0)*0.12,0,0.09);R.foreR.rotation.set(-0.42,0,0);R.handR.rotation.set(0.95,0,0);return;}return _ct.apply(this,arguments);};}
