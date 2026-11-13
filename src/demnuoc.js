/* ---------- MẶT NƯỚC VÀ CẢNH ĐÊM ----------
   - Đêm: ánh trăng lấp lánh trên mặt nước (trước chỉ có nắng, đêm mặt nước tối xỉn lẫn vào đất). Trăng tròn sáng hơn trăng non, trời mây thì mờ.
   - Đêm: ánh sáng nền ngả lam như trăng soi (trước ngả vàng ô-liu), chỗ có lửa vẫn ấm.
   - Đom đóm bay quanh bãi cỏ, bờ nước vào đêm tạnh ráo. */
const DN={hs:null,hg:null,ff:null,tmp:null};
function dnTick(){const T=THREE;if(!G.L||!G.L.hemi||!G.cam)return;const night=clamp(1-(G.dayK??1),0,1),cl=G.wxK||0,ph=((S.day||1)%8)/8,full=1-Math.abs(0.5-ph)*1.4;
  // 1) ánh sáng nền ngả lam về đêm
  const h=G.L.hemi;if(!DN.hs){DN.hs=h.color.clone();DN.hg=h.groundColor.clone();DN.ns=new T.Color('#7f97dc');DN.ng=new T.Color('#1d2c40');DN.mc=new T.Color('#d6e2ff');DN.tmp=new T.Color();DN.md=new T.Vector3();}
  const k=night*0.85;h.color.copy(DN.hs).lerp(DN.ns,k);h.groundColor.copy(DN.hg).lerp(DN.ng,k);
  // 2) trăng trên mặt nước: mỗi chất liệu nước có hướng sáng riêng (ngày theo mặt trời, đêm theo trăng)
  if(typeof T3!=='undefined'&&T3.wmats&&G.sky){const su=G.sky.material.uniforms,ma=(S.hour-18)/12*Math.PI;DN.md.set(Math.cos(ma)*-1900,Math.max(0.15,Math.sin(ma))*1500,-900).normalize();
    const mI=night*(0.25+0.5*full)*(1-cl*0.85),useMoon=mI>su.sI.value;
    for(const m of T3.wmats){const u=m.uniforms;if(!u||!u.sD)continue;if(!m.userData.dn){m.userData.dn=1;u.sD={value:new T.Vector3()};u.sI={value:0};u.sC={value:new T.Color()};}
      if(useMoon){u.sD.value.copy(DN.md);u.sI.value=mI;u.sC.value.copy(DN.mc);}else{u.sD.value.copy(su.sD.value);u.sI.value=su.sI.value;u.sC.value.copy(su.sC.value);}}}
  // 3) đom đóm
  const want=night>0.7&&cl<0.3&&(G.q|0)>=0;if(want&&!DN.ff)dnFireflies();
  if(DN.ff){const f=DN.ff;f.visible=want;if(want){f.material.uniforms.uT.value=(G.t||0)%600;f.material.uniforms.uK.value=clamp((night-0.7)*5,0,1);
      if(Math.hypot(P.x-f.position.x,P.z-f.position.z)>150){f.position.set(Math.round(P.x/40)*40,0,Math.round(P.z/40)*40);const a=f.geometry.attributes.position,b=f.geometry.attributes.aB;for(let i=0;i<a.count;i++){const x=b.getX(i),z=b.getZ(i);a.setXYZ(i,x,hAt(f.position.x+x,f.position.z+z)+b.getY(i),z);}a.needsUpdate=true;}}}}
function dnFireflies(){const T=THREE,N=(G.q|0)>0?70:40,pos=new Float32Array(N*3),base=new Float32Array(N*3),ph=new Float32Array(N);for(let i=0;i<N;i++){const a=Math.random()*6.283,r=40+Math.sqrt(Math.random())*320;base[i*3]=Math.cos(a)*r;base[i*3+1]=6+Math.random()*26;base[i*3+2]=Math.sin(a)*r;ph[i]=Math.random()*100;}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('aB',new T.BufferAttribute(base,3));g.setAttribute('aP',new T.BufferAttribute(ph,1));
  const m=new T.ShaderMaterial({uniforms:{uT:{value:0},uK:{value:0}},transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    vertexShader:'attribute float aP;uniform float uT;varying float vA;void main(){vec3 p=position;p.x+=sin(uT*0.31+aP)*9.0+sin(uT*0.9+aP*2.0)*2.0;p.y+=sin(uT*0.47+aP*1.7)*5.0;p.z+=cos(uT*0.27+aP*1.3)*9.0;vA=smoothstep(0.35,0.9,sin(uT*1.3+aP*3.0)*0.5+0.5);vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(900.0/-mv.z,1.5,9.0);}',
    fragmentShader:'uniform float uK;varying float vA;void main(){float d=length(gl_PointCoord-0.5);float a=smoothstep(0.5,0.0,d);gl_FragColor=vec4(vec3(0.85,1.0,0.35)*a*vA*uK*1.6,a*vA*uK);}'});
  const f=new T.Points(g,m);f.frustumCulled=false;f.position.set(1e9,0,1e9);G.sc.add(f);DN.ff=f;}
{const _st=skyTick;skyTick=function(){_st.apply(this,arguments);try{dnTick();}catch(e){if(!DN.err){DN.err=1;console.warn('đêm, nước',e);}}};}
