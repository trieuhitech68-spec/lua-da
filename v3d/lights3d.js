/* ---- Ánh sáng 3D theo kỷ nguyên ---- */
(function(){if(typeof K3==='undefined'||!K3.ok)return;const T=K3.T;
  K3.EL=[
    {bg:'#9cc8e0',fog:'#b9d3df',sky:'#bfe3ff',gnd:'#6a7a4a',sun:'#fff0d4',si:1.57,hi:0.62,amb:0.1,groundMat:'#7aa84e'},
    {bg:'#a6d6e6',fog:'#c2e0e6',sky:'#c8ecff',gnd:'#5f8a46',sun:'#fff4dc',si:1.57,hi:0.62,amb:0.1,groundMat:'#76b24e'},
    {bg:'#b2d0e6',fog:'#c6d8e4',sky:'#d0e4ff',gnd:'#6a7a50',sun:'#fff0d8',si:1.51,hi:0.59,amb:0.1,groundMat:'#80aa56'},
    {bg:'#cfc0a0',fog:'#dccdb0',sky:'#fff0d4',gnd:'#6a6a4a',sun:'#ffe8c4',si:1.51,hi:0.53,amb:0.09,groundMat:'#8eaa58'},
    {bg:'#b8ac98',fog:'#c4b8a4',sky:'#e0d8c8',gnd:'#5a5640',sun:'#ffe6c0',si:1.39,hi:0.56,amb:0.11,groundMat:'#8a8c58'},
    {bg:'#c88a78',fog:'#d49c86',sky:'#ffc8a8',gnd:'#4a4a5a',sun:'#ffc48a',si:1.45,hi:0.5,amb:0.11,groundMat:'#74a256'},
    {bg:'#0e1424',fog:'#1a2438',sky:'#6a8ac8',gnd:'#1a2030',sun:'#dce8ff',si:1.16,hi:0.4,amb:0.14,groundMat:'#6a7488',night:1},
    {bg:'#3a2050',fog:'#5a3a7a',sky:'#e08ae0',gnd:'#2a2050',sun:'#ffd8f0',si:1.22,hi:0.46,amb:0.12,groundMat:'#3e8a86',night:0.5},
    {bg:'#140e28',fog:'#2a2048',sky:'#b8a8ff',gnd:'#201838',sun:'#ffe8b0',si:1.22,hi:0.37,amb:0.14,groundMat:'#4c4478',night:1}];
  // Gắn đèn vào cảnh: trời + mặt trời có bóng đổ. o.size: nửa cạnh vùng đổ bóng
  K3.lights=(scene,e,renderer,o)=>{o=o||{};const L=K3.EL[Math.min(e,8)];scene.background=new T.Color(L.bg);scene.fog=new T.Fog(L.fog,o.fogNear??2200,o.fogFar??5200);
    if(renderer){renderer.outputEncoding=T.sRGBEncoding;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;if(!K3.fx)renderer.toneMapping=T.NoToneMapping;}
    // ánh sáng môi trường từ bầu trời (PBR): thay phần lớn ánh sáng nền phẳng → khối có sáng tối tự nhiên, kim loại/kính/nước phản chiếu trời
    const G=K3.fx?K3.fx.cfg:{},env=renderer&&K3.fx&&o.env!==false&&G.envK>0?K3.fx.env(renderer,Math.min(e,8),(o.envK||1)*G.envK):null;if(env)scene.environment=env;
    const hemi=new T.HemisphereLight(L.sky,L.gnd,L.hi*(env?G.hemiK:1));scene.add(hemi);const amb=new T.AmbientLight(0xffffff,env?0:L.amb);scene.add(amb);
    const sun=new T.DirectionalLight(L.sun,L.si*(env?G.sunK:1));sun.position.set(-520,900,420);sun.castShadow=true;const S=o.size||700;
    if(o.sky&&K3.fx)K3.fx.sky(scene,Math.min(e,8),{sunDir:new T.Vector3(-0.44,0.76,0.35).normalize()});
    Object.assign(sun.shadow.camera,{left:-S,right:S,top:S,bottom:-S,near:10,far:3000});sun.shadow.mapSize.set(o.shadowMap||2048,o.shadowMap||2048);sun.shadow.bias=-0.0006;sun.shadow.normalBias=0.6;sun.shadow.radius=3;
    scene.add(sun);scene.add(sun.target);return {hemi,amb,sun};};
})();
