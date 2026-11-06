/* ===================== NGƯỜI THẬT: KHUNG XƯƠNG CÓ KHUỶU TAY, ĐẦU GỐI · ĐỘNG TÁC TỪNG VIỆC ===================== */
// chọn động tác theo việc đang làm; trả về true nếu đã đặt dáng
function poseApply(R,mode,t){if(!P.char2||!K3.char2Pose)return false;const o={tool:P.toolId};let name='idle',ph=t;const A=G.act;
  if(G.sleeping){name='sleep';}else if(G.ride){name='sit';}
  else if(G.work){name=G.work.steps[G.work.i].a;if(name==='work')name='whittle';}
  else if(G.climb){name='lash';G.gait=(G.gait||0)+(G.dt||0.016)*0.8;ph=G.gait;}
  else if(G.swim){G.gait=(G.gait||0)+(G.dt||0.016)*(P.speed>8?1:0.35);name='swim';ph=G.gait;}
  else if(G.sit)name='sit';
  else if(G.throwAnim>0){name='throw';ph=1-G.throwAnim/0.45;}
  else if(A){const per=A.per||0.72,k=clamp(1-(A.next||0)/per,0,1);o.phase=k;o.per=per;name=P.anim==='chop'&&P.toolId==='pick'?'mine':P.anim==='hammer'?'hammer':P.anim==='gather'?'gather':P.anim==='throw'?'throw':'chop';if(A.t&&A.t.type==='fish'){name='throw';ph=k;delete o.phase;}}
  else if(G.drinkT>0)name='drink';
  else if(P.air)name='run';
  else if(P.speed>8){const f=P.speed/112*10.5;G.gait=(G.gait||0)+f/(Math.PI*2)*(G.dt||0.016);name=G.sneak?'sneak':G.running?'run':'walk';ph=G.gait;}
  else if(G.sneak){name='sneak';ph=0;}
  if(name==='swim')P.model.position.y=0.4;K3.char2Pose(P.rig,name,ph,o);return true;}
// tạo người chơi bằng khung xương mới
const LOOK2=[{sex:'m',hairStyle:1,beard:true,bare:true},{sex:'f',hairStyle:0},{sex:'m',hairStyle:2,beard:true,sleeves:true},{sex:'f',hairStyle:2}];
function charModel(){const L=charLook();if(K3.char2){try{const g=K3.char2(Object.assign({},L,LOOK2[S.look||0]||{},L.cloak?{cloak:L.cloak}:{}));P.char2=true;return g;}catch(e){console.warn('người mới',e);}}P.char2=false;return K3.char(L);}
