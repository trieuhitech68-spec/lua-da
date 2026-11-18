/* ===================== nuicao: NÚI CAO, VÁCH ĐÁ DỰNG THEO TẦNG =====================
   Trước: đỉnh cao nhất chỉ ~700 đơn vị (35 m), dáng tròn thoải như đồi, nhìn xa không ra núi.
   Giờ, từ độ cao 230 trở lên (vùng núi; đồng bằng, đồi thấp, làng mạc KHÔNG đổi):
     · núi được kéo cao gần gấp đôi;
     · sườn núi gãy thành từng tầng vách dựng xen thềm phẳng (mỗi tầng ~150 đơn vị, mép tầng uốn lượn theo nhiễu) → có vách đá thật sự,
       lớp vân đá phân tầng sẵn có trong shader hiện rõ trên vách; thềm phẳng là chỗ đứng, chỗ dựng chòi canh.
   Sông suối khoét lòng theo độ cao mới nên vẫn khớp. Công trình đã dựng ở độ cao trên 230 sẽ lệch mặt đất (hiếm). */
{const _bh=baseH;baseH=function(x,z){const h=_bh(x,z);if(!(h>230))return h;const v=230+(h-230)*1.75,n=NS.fbm(x/900+31,z/900-17,2)*60,s=150,q=(v+n)/s,f=q-Math.floor(q),st=(Math.floor(q)+ss(0.3,0.7,f))*s-n,k=ss(230,420,h)*0.65;return v*(1-k)+st*k;};}
/* cột đá, tảng đá trang trí vốn đặt trên đồi thoải; giờ sườn núi dựng đứng nên chúng treo lơ lửng trên vách: bỏ những cái nằm trên sườn dốc hoặc trên cao */
{const _dp=decorPlan;decorPlan=function(){const r=_dp.apply(this,arguments);try{const bad=d=>(d.k==='karst'||d.k==='cliffRock')&&(hAt(d.x,d.z)>300||slopeAt(d.x,d.z)>0.5);const gone=DECO_PLAN.filter(bad);if(gone.length){DECO_PLAN=DECO_PLAN.filter(d=>!bad(d));SCOL=SCOL.filter(c=>!gone.some(d=>d.x===c.x&&d.z===c.z));}}catch(e){}return r;};}
