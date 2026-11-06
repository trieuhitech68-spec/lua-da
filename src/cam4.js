/* ===================== CAMERA GÓC TRÊN CAO: KHÔNG ĐỂ SƯỜN DỐC CHE NHÂN VẬT ===================== */
/* Bọc camTick (không sửa game.js). Trước khi đặt camera, dò địa hình dọc tia từ điểm nhìn (nhân vật) tới vị trí camera mong muốn.
   Bị sườn dốc che → nâng góc nhìn dần (tối đa 1.42); vẫn che → kéo camera lại gần. Sườn phía trước cao hơn camera → nâng góc nhìn (tối đa +0.3). Chuyển mượt, chỉ tạm thời trong lúc đặt camera:
   G.pitch / G.zoom của người chơi giữ nguyên. Góc thứ nhất (fp) không đổi. Mỗi khung chỉ vài chục lần tra độ cao. */
const CAM4={p:0,z:1,on:true};
function cam4Block(tx,ty,tz,yaw,pitch,D){const cp=Math.cos(pitch),dx=Math.sin(yaw)*cp,dy=Math.sin(pitch),dz=Math.cos(yaw)*cp;let w=0;
  for(let i=1;i<=16;i++){const t=i/16*D;if(t<26)continue;const g=hAt(tx+dx*t,tz+dz*t)+12-(ty+dy*t);if(g>w)w=g;}return w;}
// sườn dốc phía trước nhân vật cao hơn camera (nhìn vào vách) → góc nhìn cần để camera cao hơn đỉnh sườn ~25 (cộng thêm tối đa 0.3)
function cam4Wall(tx,ty,tz,yaw,pitch,D){const dx=-Math.sin(yaw),dz=-Math.cos(yaw);let w=-1e9;for(let d=80;d<=400;d+=80){const g=hAt(tx+dx*d,tz+dz*d);if(g>w)w=g;}
  const need=w+25-ty;if(need<=Math.sin(pitch)*D)return pitch;return Math.min(pitch+0.3,1.42,Math.asin(Math.min(1,need/D)));}
// trả về [góc cộng thêm, hệ số khoảng cách] cần để tia tới camera không cắm vào đất
function cam4Need(tx,ty,tz,yaw,p0,D){const p=Math.max(p0,cam4Wall(tx,ty,tz,yaw,p0,D)),r=cam4Ray0(tx,ty,tz,yaw,p,D);r[0]+=p-p0;return r;}
function cam4Ray0(tx,ty,tz,yaw,pitch,D){if(cam4Block(tx,ty,tz,yaw,pitch,D)<=0)return [0,1];const PM=1.42;
  for(let p=pitch+0.07;p<PM+0.035;p+=0.07){const q=Math.min(p,PM);if(cam4Block(tx,ty,tz,yaw,q,D)<=0)return [q-pitch,1];}
  const q=Math.max(pitch,PM);for(let f=0.85;f>0.28;f-=0.08)if(cam4Block(tx,ty,tz,yaw,q,D*f)<=0)return [q-pitch,f];return [q-pitch,0.28];}
{const _ct=camTick;camTick=function(dt){
  if(!CAM4.on||isFP()||typeof hAt!=='function'||!P||!G.cam){CAM4.p=0;CAM4.z=1;return _ct(dt);}
  const p0=G.pitch,z0=G.zoom;let ok=false;
  try{const t=G.ctv||P,ty=(G.ctv?G.ctv.y:P.y+14),[np,nz]=cam4Need(t.x,ty,t.z,G.yaw,p0,z0);
    if(!G.camInit){CAM4.p=np;CAM4.z=nz;}else{const k1=1-Math.exp(-(dt||0.016)*(np>CAM4.p?7:2.2)),k2=1-Math.exp(-(dt||0.016)*(nz<CAM4.z?7:2.2));CAM4.p+=(np-CAM4.p)*k1;CAM4.z+=(nz-CAM4.z)*k2;}
    if(CAM4.p>0.002||CAM4.z<0.998){G.pitch=p0+CAM4.p;G.zoom=z0*CAM4.z;}ok=true;}catch(e){}
  try{_ct(dt);}finally{if(ok){G.pitch=p0;G.zoom=z0;}}};}
