/* ===================== ĐỒNG HỒ CHUNG THEO GIỜ THẬT VIỆT NAM (UTC+7) =====================
   Mọi người chơi cùng một bầu trời: giờ trong game = giờ thật ở Việt Nam, mùa theo tháng thật, thời tiết gieo chung.
     · Giờ: 20:00 ở Việt Nam thì trong game là 20:00 (trời tối), ai cũng vậy.
     · Mùa theo lịch: Xuân tháng 2-4 · Hạ tháng 5-7 · Thu tháng 8-10 · Đông tháng 11-1.
     · Thời tiết: gieo một lần cho mỗi khung 20 phút thật bằng số hiệu khung → ai cũng ra cùng kết quả.
     · Nhịp sinh hoạt (đói khát, cây lớn, củi cháy, hạn dùng, việc "mỗi ngày") KHÔNG đổi theo giờ thật: vẫn DAY_SEC giây chơi = 1 "ngày công",
       đếm bằng S.tn (chỉ chạy khi đang chơi, luôn tăng). "Ngày N" trên bảng = số ngày công nhân vật đã sống = ⌊S.tn⌋.
     · Giờ máy chủ lấy bằng hàm ld_now() (supabase_setup.sql); chưa có / mất mạng thì dùng đồng hồ của máy. */
const WC={off:0,syncT:0,ok:false,tz:7*3600000};
const wcMs=()=>Date.now()+WC.off+WC.tz;// đọc bằng getUTC* để ra giờ Việt Nam
const wcDate=()=>new Date(wcMs());
const wcDayN=()=>Math.floor(wcMs()/86400000);// số hiệu ngày thật (đổi lúc 00:00 giờ Việt Nam)
const wcHour=()=>(wcMs()%86400000)/3600000;
const WC_SM=[3,0,0,0,1,1,1,2,2,2,3,3];// tháng (0-11) → mùa: 0 xuân 1 hạ 2 thu 3 đông
const wcSeason=()=>WC_SM[wcDate().getUTCMonth()];
// ngày đầu của mùa hiện tại và của mùa kế (mốc UTC đã cộng múi giờ)
function wcSeasonSpan(){const d=wcDate(),y=d.getUTCFullYear(),m=d.getUTCMonth(),sm=m===0?-2:m-((m-1)%3),a=Date.UTC(y,sm,1),b=Date.UTC(y,sm+3,1);return [a,b];}
const wcSeasonDay=()=>Math.floor((wcMs()-wcSeasonSpan()[0])/86400000)+1;
const wcSeasonProg=()=>{const [a,b]=wcSeasonSpan();return clamp((wcMs()-a)/(b-a),0,1);};
const wcSeasonLeftDays=()=>Math.max(1,Math.ceil((wcSeasonSpan()[1]-wcMs())/86400000));
const wcSeasonKey=()=>{const d=new Date(wcSeasonSpan()[0]+40*86400000);return d.getUTCFullYear()*4+wcSeason();};
function wcFestNext(){const [a,b]=wcSeasonSpan(),si=wcSeason(),d=Math.ceil((b-wcMs())/86400000);if(si===3)return {d,n:'Hội xuân'};if(si===1)return {d,n:'Hội mùa'};if(si===0)return {d:d+92,n:'Hội mùa'};return {d:d+92,n:'Hội xuân'};}
function wcClockVN(){const t=wcDate();return String(t.getUTCHours()).padStart(2,'0')+':'+String(t.getUTCMinutes()).padStart(2,'0');}
function wcDateVN(){const t=wcDate();return t.getUTCDate()+'/'+(t.getUTCMonth()+1);}
// gọi mỗi khung hình từ dayTick: chạy đồng hồ sinh hoạt riêng, đặt giờ trên trời theo giờ thật
function wcStep(dt){if(S.tn==null)S.tn=S.day+(S.hour||0)/24;if(S.day>Math.floor(S.tn))S.tn=S.day;/* ngủ qua đêm, mã cũ tự tăng ngày */
  S.tn+=Math.max(0,dt||0)/DAY_SEC;const nd=Math.floor(S.tn);if(nd>S.day){S.day=nd;if(G.on)uiToast(`Ngày công thứ ${S.day} của bạn · ${wcDateVN()} mùa ${SEASONS[wcSeason()].n}`,'');}
  S.hour=wcHour();wcSyncTick();}
// thời tiết chung: mỗi 20 phút thật gieo một lần bằng số hiệu khung giờ → ai cũng ra cùng kết quả
function wcRnd(n){let x=(n^0x9e3779b9)>>>0;x=Math.imul(x^(x>>>16),0x85ebca6b);x=Math.imul(x^(x>>>13),0xc2b2ae35);x^=x>>>16;return (x>>>0)/4294967296;}
function wcWeather(){const q=1200000,slot=Math.floor(wcMs()/q),si=wcSeason(),rp=SEASONS[si].rain,r=wcRnd(slot),r2=wcRnd(slot*7+3);let type='clear';
  if(r<rp)type=si===3?'snow':(r2<0.16?'storm':'rain');else if(r<rp+0.22)type='cloudy';return {type,slot,until:TNOW()+(q-(wcMs()%q))/(DAY_SEC*1000)+0.0005};}
// đồng bộ với giờ máy chủ (10 phút một lần; lỗi thì thử lại sau 1 phút)
function wcSyncTick(){const now=Date.now();if(now<WC.syncT)return;WC.syncT=now+60000;if(typeof LDB==='undefined'||!LDB.sb||!LDB.sb.rpc)return;const t0=now;
  try{Promise.resolve(LDB.sb.rpc('ld_now')).then(r=>{const v=r&&!r.error?+r.data:NaN;if(v>1e12&&v<1e14){const t1=Date.now();WC.off=Math.round(v-(t0+t1)/2);WC.ok=true;WC.syncT=t1+600000;}}).catch(()=>{});}catch(e){}}
// ngủ: giờ trên trời là giờ thật nên ngủ không làm trời sáng. Mỗi đêm thật chỉ "qua đêm" một lần: hồi sức đầy đủ, đồng hồ sinh hoạt nhảy nửa ngày công
{const _sl=sleep;sleep=function(b){if(!G.sleeping&&isNight()){const night=Math.floor((wcMs()-12*3600000)/86400000);if(S.wcSl===night){S.p.hp=Math.min(100,S.p.hp+12);S.p.stam=maxStam();uiToast('Đêm nay bạn đã ngủ một giấc rồi. Nằm nghỉ hồi sức; trời sáng theo giờ thật (khoảng 5 rưỡi sáng giờ Việt Nam).','');uiHud(true);return;}S.wcSl=night;const d0=S.day;
    setTimeout(()=>{if(!S)return;if(S.day===d0&&S.tn!=null)S.tn+=0.45;if(isNight())uiToast('🌙 Ngủ dậy khỏe lại rồi, nhưng ngoài trời vẫn tối: giờ trong game là giờ thật ở Việt Nam ('+wcClockVN()+').','');},4200);}return _sl.apply(this,arguments);};}
// bảng giờ: thêm dòng nhỏ "giờ VN · mùa còn bao lâu" dưới dòng ngày
{const _hud=uiHud;uiHud=function(){const r=_hud.apply(this,arguments);try{const el=document.querySelector('#game .h-time');if(el&&S){el.title='Giờ thật Việt Nam '+wcClockVN()+' ngày '+wcDateVN()+' · mùa '+SEASONS[wcSeason()].n+' còn '+wcSeasonLeftDays()+' ngày · mọi người chơi cùng giờ, cùng mùa';}}catch(e){}return r;};}
