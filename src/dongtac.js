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
/* 7. NẤU ĂN: quỳ bên nồi, tay phải khuấy vòng tròn, tay trái tì gối; cuối nhịp đưa muôi lên nếm */
H3PO.cook2=(R,k,o)=>{const K=h3ik(),L=h3lerp,t=(o&&o.t)||k*4,c=h3fr(t/3.2),taste=c>0.78?h3ss((c-0.78)/0.1)*(c>0.92?1-h3ss((c-0.92)/0.08):1):0,a=t*4.2;K.kneel(R,7.8,0.3);R.hips.rotation.x=0.12;R.torso.rotation.set(L(0.5,0.22,taste),0.1*Math.sin(a),0);R.head.rotation.set(L(0.34,0.05,taste),0,0);
  K.armTo(R,1,L(1.4+Math.cos(a)*1.5,1.0,taste),L(7.4,14.6,taste),L(8.6+Math.sin(a)*1.5,3.4,taste),1,-0.4,-0.4);K.armTo(R,-1,-3.2,8.2,3.2,-1,-0.2,-0.6);K.cloak(R);};
/* 8. VÓT, ĐẼO bằng dao: tay trái giữ phôi trước ngực, tay phải đẩy lưỡi dao ra xa người từng nhát dứt khoát rồi kéo về */
H3PO.whittle2=(R,k,o)=>{const K=h3ik(),L=h3lerp,t=(o&&o.t)||k*4,c=h3fr(t/0.62),push=c<0.3?h3ss(c/0.3):1-h3ss((c-0.3)/0.7);K.hipsAt(R,0,16.6,0);K.feet(R,-2.6,1.4,2.6,-0.6);R.torso.rotation.set(0.3+0.06*push,-0.1+0.08*push,0);R.head.rotation.set(0.42,0.05,0);
  K.armTo(R,-1,-1.4,21.6,6.4,-1,-0.4,-0.3);K.armTo(R,1,L(0.4,2.4,push),L(22.4,19.6,push),L(5.4,9.6,push),1,-0.5,-0.3);K.cloak(R);};
/* 9. BUỘC LẠT: tay trái giữ chỗ buộc, tay phải quấn dây hai vòng quanh rồi giật ra siết chặt */
H3PO.lash2=(R,k,o)=>{const K=h3ik(),L=h3lerp,t=(o&&o.t)||k*4,c=h3fr(t/1.9),wr=Math.min(1,c/0.7),pull=c>0.7?h3ss((c-0.7)/0.12)*(c>0.9?1-h3ss((c-0.9)/0.1):1):0,a=wr*Math.PI*4;K.hipsAt(R,0,16.4,0.3);K.feet(R,-2.6,2.0,2.6,-1.0);R.torso.rotation.set(0.36-0.1*pull,0.14*pull,0);R.head.rotation.set(0.36,0,0);
  K.armTo(R,-1,-1.0,20.6,6.8,-1,-0.4,-0.4);K.armTo(R,1,L(-1.0+Math.cos(a)*2.4,5.4,pull),L(20.6+Math.sin(a)*2.4,22.6,pull),L(7.4+Math.sin(a*0.5)*0.6,3.6,pull),1,-0.4,-0.4);K.cloak(R);};
/* 10. CÀY RUỘNG: khom lưng, hai tay ghì cán cày phía trước, chân bước từng bước nặng theo luống */
H3PO.plough2=(R,k,o)=>{const K=h3ik(),t=(o&&o.t)||k*4,st=Math.sin(t*3.2),push=Math.sin(t*1.6)*0.5+0.5;K.hipsAt(R,0,15.6+Math.abs(st)*0.4,0.6);K.feet(R,-2.6,st*3.2,2.6,-st*3.2);R.hips.rotation.set(0.08,0,st*0.04);R.torso.rotation.set(0.56+0.08*push,st*0.06,0);R.head.rotation.set(0.06,0,0);
  K.armTo(R,1,2.4,18.4-push*1.0,8.2+push*1.2,1,-0.5,-0.3);K.armTo(R,-1,-2.4,18.4-push*1.0,8.2+push*1.2,-1,-0.5,-0.3);K.cloak(R);};
/* ---------- ĐẠO CỤ trong tay khi làm: vồ gỗ lúc đóng (nếu tay đang không cầm gì), que khoan + thanh gỗ nền lúc khoan lửa ---------- */
const DTP={m:null,d:null};
function dtProps(R,fn,W){try{const T=THREE,mat=(c)=>new T.MeshStandardMaterial({color:c,roughness:0.9,flatShading:true});
    const needM=fn===H3PO.hammer2&&!P.toolId&&R.handR,needD=fn===H3PO.drill&&R.root;
    if(needM&&!DTP.m){const g=new T.Group(),h=new T.Mesh(new T.CylinderGeometry(0.42,0.5,9,6),mat('#8a6238'));h.rotation.x=Math.PI/2;h.position.set(0,-1.75,3.4);const hd=new T.Mesh(new T.CylinderGeometry(1.7,1.7,4.6,8),mat('#6e4a2a'));hd.position.set(0,-1.75,7.6);g.add(h,hd);g.traverse(o=>{if(o.isMesh)o.castShadow=true;});DTP.m=g;}
    if(DTP.m){if(needM){if(DTP.m.parent!==R.handR)R.handR.add(DTP.m);DTP.m.visible=true;DTP.m.traverse(o=>{o.layers.mask=R.handR.layers.mask;});}else DTP.m.visible=false;}
    if(needD&&!DTP.d){const g=new T.Group(),sp=new T.Mesh(new T.CylinderGeometry(0.3,0.36,13,6),mat('#b08a56'));sp.position.y=6.9;const bd=new T.Mesh(new T.BoxGeometry(7,0.9,2.6),mat('#7a5632'));bd.position.y=0.5;const em=new T.Mesh(new T.SphereGeometry(0.55,6,5),new T.MeshStandardMaterial({color:'#2a1a10',emissive:'#ff5a1a',emissiveIntensity:0.0}));em.position.set(0,1.0,0);g.add(sp,bd,em);g.userData.sp=sp;g.userData.em=em;DTP.d=g;}
    if(DTP.d){if(needD){const h=R.dims?R.dims.h:1;if(DTP.d.parent!==R.root)R.root.add(DTP.d);DTP.d.visible=true;DTP.d.position.set(0,0,8.2*h);DTP.d.userData.sp.rotation.y=(W?W.t:G.t)*30;const pr=W&&W.steps[W.i]?clamp(W.t/Math.max(0.1,W.steps[W.i].t),0,1):0;DTP.d.userData.em.material.emissiveIntensity=pr*1.6;DTP.d.traverse(o=>{o.layers.mask=R.root.layers.mask||1;});}else DTP.d.visible=false;}}catch(e){}}
/* nối vào bộ chọn dáng: nhát chém vào cây/đá, đóng búa ở công trình, hái nhặt, đào, và các bước làm việc tương ứng */
{const _hp=h3pose;h3pose=function(R,mode,t){try{const A=G.act,W=G.work,tk=P.toolId&&ITEMS[P.toolId]&&ITEMS[P.toolId].tool;let fn=null,k=0,o=null;
    if(!G.ride&&!G.sit&&!G.sleeping&&!G.climb&&!G.swim){
      if(W){const st=W.steps[W.i]||W.steps[0],a=st&&st.a,fire=W.icon==='fireDrill';
        if((a==='chop'||a==='mine')&&(tk==='axe'||tk==='pick')){fn=a==='mine'||tk==='pick'?H3PO.mine2:H3PO.chop2;k=h3fr(W.t/0.95);}
        else if(a==='dig'){if(tk==='dig'){fn=H3PO.dig2;k=h3fr(W.t/1.25);}}
        else if(a==='hammer'){fn=H3PO.hammer2;k=h3fr(W.t/0.72);}
        else if(a==='gather'&&!fire){fn=H3PO.gather2;k=h3fr(W.t/1.7);}
        else if(a==='lash'&&fire){fn=H3PO.drill;o={t:W.t};}
        else if(a==='cook'&&fire){fn=H3PO.blow;o={t:W.t};}
        else if(a==='cook'){fn=H3PO.cook2;o={t:W.t};}else if(a==='whittle'){fn=H3PO.whittle2;o={t:W.t};}else if(a==='lash'&&/plough/i.test(String(W.icon||''))){fn=H3PO.plough2;o={t:W.t};}else if(a==='lash'){fn=H3PO.lash2;o={t:W.t};}}
      else if(A&&!G.h3aim&&A.t){const ty=A.t.type,kk=clamp(1-(A.next||0)/(A.per||0.72),0,1);
        if(ty==='res'&&(tk==='axe'||tk==='pick')&&P.anim!=='gather'&&P.anim!=='dig'){fn=tk==='pick'?H3PO.mine2:H3PO.chop2;k=kk;}
        else if(ty==='site'){fn=H3PO.hammer2;k=kk;}
        else if(ty==='uproot'||(ty==='res'&&P.anim==='dig'&&tk==='dig')){fn=H3PO.dig2;k=h3remap(kk,0.42,0.3);}
        else if(ty==='res'&&P.anim==='gather'){fn=H3PO.gather2;k=h3remap(kk,0.42,0.45);}}}
    dtProps(R,fn,W);
    if(fn){K3.char2Neutral(R);fn(R,k,o||{});return true;}}catch(e){if(!H3.dtErr){H3.dtErr=1;console.warn('động tác',e);}}
  return _hp.apply(this,arguments);};}
/* cầm rìu, cuốc, gậy đào lúc đứng/đi: đầu dụng cụ chúc xuống cạnh chân */
{const _ct=h3carryTool;h3carryTool=function(R,tl,sw){const I=ITEMS[tl],k=I&&I.tool;if(k==='axe'||k==='pick'||k==='dig'||k==='club'||k==='hammer'){R.armR.rotation.set(0.1+(sw||0)*0.12,0,0.09);R.foreR.rotation.set(-0.42,0,0);R.handR.rotation.set(0.95,0,0);return;}return _ct.apply(this,arguments);};}
/* ===================== DÁNG NGƯỜI ĐẦY ĐẶN HƠN (kiểu nhân vật game hiện nay) =====================
   Trước: thân dẹt như tấm ván, tay chân như que, đầu và bàn tay nhỏ. Giờ làm dày từng khối thịt quanh trục xương của nó
   (chỉ phóng các khối hình, KHÔNG đổi khung xương → động tác, tầm với, chỗ cầm nắm giữ nguyên). */
const DT_CH={torso:[1.08,1,1.36],hips:[1.1,1,1.34],legL:[1.26,1,1.26],legR:[1.26,1,1.26],shinL:[1.36,1,1.36],shinR:[1.36,1,1.36],footL:[1.3,1.15,1.1],footR:[1.3,1.15,1.1],
  armL:[1.3,1,1.3],armR:[1.3,1,1.3],foreL:[1.36,1,1.36],foreR:[1.36,1,1.36],handL:[1.38,1.25,1.38],handR:[1.38,1.25,1.38]};
function dtChunk(g){try{const R=g&&g.userData&&g.userData.rig;if(!R||g.userData.dtCh)return g;g.userData.dtCh=1;for(const k in DT_CH){const b=R[k],s=DT_CH[k];if(!b)continue;for(const m of b.children)if(m.isMesh&&!m.userData.noCh)m.scale.set(m.scale.x*s[0],m.scale.y*s[1],m.scale.z*s[2]);}
    /* khớp háng: thêm khối tròn cùng chất vải quần để lúc cúi, ngồi xổm không hở một khoảng trống giữa hông và đùi */
    for(const k of ['legL','legR']){const b=R[k];if(!b)continue;const hm=b.children.find(m=>m.isMesh&&m.material&&/Hide|Cloth|Bark|Fibre/i.test(m.material.name||m.material.userData.key||''))||b.children.find(m=>m.isMesh);if(!hm)continue;
      /* chất liệu quần lấy màu theo từng đỉnh: khối tròn phải mang đúng màu đó, nếu không sẽ đen sì (lỗi cũ: hai mảng đen trước hông) */const sg=new THREE.SphereGeometry(2.25,9,7),ca=hm.geometry.attributes.color,n=sg.attributes.position.count,col=new Float32Array(n*3);let r=0.36,gg=0.23,bl=0.13;if(ca&&ca.count){let i0=0,by=-1e9;const pa=hm.geometry.attributes.position;for(let i=0;i<ca.count;i+=3){if(pa.getY(i)>by){by=pa.getY(i);i0=i;}}r=ca.getX(i0);gg=ca.getY(i0);bl=ca.getZ(i0);}for(let i=0;i<n;i++){col[i*3]=r;col[i*3+1]=gg;col[i*3+2]=bl;}sg.setAttribute('color',new THREE.BufferAttribute(col,3));const sp=new THREE.Mesh(sg,hm.material);sp.userData.noCh=1;sp.position.set(0,-0.5,0.1);sp.scale.set(1.05,1.15,1.2);sp.castShadow=true;sp.layers.mask=hm.layers.mask;b.add(sp);}
    if(R.head&&!R.head.userData.dtCh){R.head.userData.dtCh=1;R.head.scale.multiplyScalar(1.12);}}catch(e){}return g;}
{const iv=setInterval(()=>{try{if(typeof K3==='undefined'||!K3.char2)return;if(K3.char2._dt){return;}if(!K3.char2._cr&&(DT_CH._w=(DT_CH._w||0)+1)<40)return;/* chờ bộ tạo hình bọc xong (tối đa ~8 giây) */
    const base=K3.char2,w=function(o){return dtChunk(base.apply(this,arguments));};for(const k in base)w[k]=base[k];w._dt=1;K3.char2=w;}catch(e){}},200);}
/* ===================== NGỰA RA DÁNG NGỰA: bờm, đuôi dài, mõm dài, thân và chân to (trước: hình hươu nhuộm màu) ===================== */
function dtHorse(o){try{const R=o&&o.userData&&o.userData.rig;if(!R||!R.body||o.userData.dtH)return o;o.userData.dtH=1;const T=THREE,dk=DT_CH._hm||(DT_CH._hm=new T.MeshStandardMaterial({color:'#1c1410',roughness:0.95,flatShading:true}));
    const sc=(b,x,y,z)=>{if(b)for(const m of b.children)if(m.isMesh)m.scale.set(m.scale.x*x,m.scale.y*y,m.scale.z*z);};
    sc(R.body,1.2,1.1,1.04);for(const k of ['legFL','legFR','legBL','legBR'])sc(R[k],1.28,1,1.22);
    if(R.head){sc(R.head,0.9,1.12,1.5);/* mõm dài */const fl=new T.Mesh(new T.BoxGeometry(1.2,1.6,1.8),dk);fl.position.set(0,5.2,0.2);fl.rotation.x=-0.3;R.head.add(fl);}
    /* bờm: dải lông dọc gáy từ đỉnh đầu xuống vai */
    for(let i=0;i<7;i++){const k=i/6,m=new T.Mesh(new T.BoxGeometry(1.0,1.9,1.9),dk);m.position.set(0,13.2-k*6.4,12.6-k*4.6);m.rotation.x=-0.6;R.body.add(m);}
    if(R.tail){const tl=new T.Mesh(new T.ConeGeometry(1.9,17,6),dk);tl.rotation.x=Math.PI+0.28;tl.position.set(0,-8.2,-2.6);R.tail.add(tl);const rt=new T.Mesh(new T.SphereGeometry(1.5,6,5),dk);rt.position.set(0,-0.4,-0.6);R.tail.add(rt);}
    o.traverse(m=>{if(m.isMesh&&m.material===dk)m.castShadow=false;});}catch(e){}return o;}
{const _mm=mtModel;mtModel=function(){return dtHorse(_mm.apply(this,arguments));};}
{const _an=animalNew;animalNew=function(kind){const a=_an.apply(this,arguments);try{if(kind==='horse'&&a&&a.o)dtHorse(a.o);}catch(e){}return a;};}

/* ===================== GẬY ĐÀO có hình riêng: cây gậy dài vót nhọn, đầu hơ lửa cho cứng, có hòn đá đục lỗ lồng vào làm nặng (trước dùng hình cái búa) ===================== */
{const _m=model;model=function(spec){try{if(spec&&spec[0]==='tool'&&spec[1]==='digStick'){const T=THREE,g=new T.Group(),mk=(geo,c,y)=>{const m=new T.Mesh(geo,new T.MeshStandardMaterial({color:c,roughness:0.9,flatShading:true}));m.position.y=y;g.add(m);return m;};
      mk(new T.CylinderGeometry(0.75,0.95,34,6),'#9a7446',9);mk(new T.ConeGeometry(0.78,7,6),'#2e2118',29.5);mk(new T.CylinderGeometry(0.8,0.8,2.2,6),'#4a3626',25.2);
      const st=mk(new T.TorusGeometry(2.1,1.25,6,9),'#8d8a82',19.5);st.rotation.x=Math.PI/2;st.scale.set(1,1,0.9);return g;}}catch(e){}return _m.apply(this,arguments);};}
/* TƯỢNG THẦN RỪNG: tượng gỗ đẽo hình người ngồi bó gối kiểu tượng nhà mồ Tây Nguyên (trước là một trụ tròn gắn khối cầu) */
{const _m=model;model=function(spec){try{if(spec&&spec[0]==='piece'&&spec[1]==='statue'){const T=THREE,g=new T.Group(),W='#7a5632',D='#4e3620',mk=(geo,c,x,y,z)=>{const m=new T.Mesh(geo,new T.MeshStandardMaterial({color:c,roughness:0.95,flatShading:true}));m.position.set(x||0,y||0,z||0);g.add(m);return m;};
      mk(new T.BoxGeometry(17,3.5,17),'#8a8780',0,1.75,0);mk(new T.CylinderGeometry(5.6,6.6,15,7),W,0,11,0);/* thân */
      mk(new T.BoxGeometry(4.2,9,7),W,-3.4,9.5,4.6).rotation.x=-0.35;mk(new T.BoxGeometry(4.2,9,7),W,3.4,9.5,4.6).rotation.x=-0.35;/* hai gối co */
      mk(new T.BoxGeometry(2.6,10,3),D,-5.6,15,3.2).rotation.x=-0.75;mk(new T.BoxGeometry(2.6,10,3),D,5.6,15,3.2).rotation.x=-0.75;/* tay chống cằm */
      mk(new T.CylinderGeometry(2.6,3.2,3,6),W,0,20,0);const hd=mk(new T.BoxGeometry(9,11,8.5),W,0,27,0.4);hd.rotation.y=0;
      mk(new T.BoxGeometry(10.4,2.2,9.6),D,0,33,0.4);mk(new T.ConeGeometry(4.6,6,5),D,0,36.8,0.4);/* búi tóc / mũ */
      mk(new T.BoxGeometry(1.8,1.2,0.8),'#1c140e',-2.2,28.6,4.7);mk(new T.BoxGeometry(1.8,1.2,0.8),'#1c140e',2.2,28.6,4.7);mk(new T.BoxGeometry(1.6,4,1.6),D,0,26.4,5);mk(new T.BoxGeometry(3.6,0.9,0.8),'#1c140e',0,23.4,4.7);
      mk(new T.BoxGeometry(1.2,5,3),D,-5.1,27,0.4);mk(new T.BoxGeometry(1.2,5,3),D,5.1,27,0.4);/* tai dài */
      [13,16].forEach(y=>{const r=mk(new T.TorusGeometry(6.3,0.35,4,10),'#b8321e',0,y,0);r.rotation.x=Math.PI/2;});return g;}}catch(e){}return _m.apply(this,arguments);};}
