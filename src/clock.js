/* ===================== ĐỒNG HỒ CHUNG: GIỜ MÁY CHỦ VIỆT NAM (UTC+7) · BỐN MÙA · THỜI TIẾT GIỐNG NHAU CHO MỌI NGƯỜI =====================
   Trước đây mỗi nhân vật tự chạy đồng hồ riêng (người đang ngày 3 mùa xuân, người ngày 40 mùa đông). Giờ mọi máy tính CÙNG một công thức
   từ giờ thật của máy chủ (lệch múi +7): giờ trong ngày, mùa, ngày trong mùa và thời tiết đều giống nhau ở cùng một thời điểm.
     · 1 ngày trong game = DAY_SEC giây thật (18 phút) → 80 ngày game mỗi ngày thật.
     · 1 mùa = SEASON_DAYS ngày game (72 phút), 1 năm = 4 giờ 48 phút. Mùa xuân bắt đầu đúng 00:00, 04:48, 09:36, 14:24, 19:12 giờ Việt Nam.
     · "Ngày N" trên bảng là số ngày RIÊNG nhân vật đã sống (tăng khi qua nửa đêm lúc đang chơi hoặc khi ngủ; vắng mặt lâu chỉ tính 1 ngày
       để vật nuôi, người nhà không chết đói khi bạn nghỉ chơi). Hạn dùng (TNOW) vì vậy luôn chỉ tăng, không nhảy lùi.
     · Giờ máy chủ lấy bằng hàm ld_now() (supabase_setup.sql); chưa có / mất mạng thì dùng đồng hồ của máy (điện thoại vốn tự chỉnh giờ). */
const WC={off:0,syncT:0,ok:false,tz:7*3600000};
const wcMs=()=>Date.now()+WC.off+WC.tz;
const wcDayMs=()=>DAY_SEC*1000;
const wcDayN=()=>Math.floor(wcMs()/wcDayMs());
const wcHour=()=>{const d=wcDayMs();return (wcMs()%d)/d*24;};
const wcSeason=()=>Math.floor(wcDayN()/SEASON_DAYS)%4;
const wcSeasonDay=()=>(wcDayN()%SEASON_DAYS)+1;
// số phút thật còn lại tới mùa kế
function wcSeasonLeftMin(){const d=wcDayMs(),L=d*SEASON_DAYS;return Math.ceil((L-(wcMs()%L))/60000);}
function wcClockVN(){const t=new Date(wcMs());return String(t.getUTCHours()).padStart(2,'0')+':'+String(t.getUTCMinutes()).padStart(2,'0');}
// gọi mỗi khung hình từ dayTick: đặt giờ chung, tăng ngày riêng khi sang ngày mới
function wcStep(){const d=wcDayN();if(S.wcD==null)S.wcD=d;else if(d!==S.wcD){if(d>S.wcD){S.day++;if(G.on)uiToast(`Ngày ${S.day} của bạn · Mùa ${SEASONS[wcSeason()].n} (còn ${wcSeasonLeftMin()} phút) · giờ Việt Nam ${wcClockVN()}`,'');}S.wcD=d;}
  S.hour=wcHour();wcSyncTick();}
// thời tiết chung: mỗi 1/4 ngày game gieo một lần bằng số hiệu khung giờ → ai cũng ra cùng kết quả
function wcRnd(n){let x=(n^0x9e3779b9)>>>0;x=Math.imul(x^(x>>>16),0x85ebca6b);x=Math.imul(x^(x>>>13),0xc2b2ae35);x^=x>>>16;return (x>>>0)/4294967296;}
function wcWeather(){const q=wcDayMs()/4,slot=Math.floor(wcMs()/q),si=wcSeason(),rp=SEASONS[si].rain,r=wcRnd(slot),r2=wcRnd(slot*7+3);let type='clear';
  if(r<rp)type=si===3?'snow':(r2<0.16?'storm':'rain');else if(r<rp+0.22)type='cloudy';return {type,slot,until:TNOW()+(q-(wcMs()%q))/wcDayMs()+0.0005};}
// đồng bộ với giờ máy chủ (10 phút một lần; lỗi thì thử lại sau 1 phút)
function wcSyncTick(){const now=Date.now();if(now<WC.syncT)return;WC.syncT=now+60000;if(typeof LDB==='undefined'||!LDB.sb||!LDB.sb.rpc)return;const t0=now;
  try{Promise.resolve(LDB.sb.rpc('ld_now')).then(r=>{const v=r&&!r.error?+r.data:NaN;if(v>1e12&&v<1e14){const t1=Date.now();WC.off=Math.round(v-(t0+t1)/2);WC.ok=true;WC.syncT=t1+600000;}}).catch(()=>{});}catch(e){}}
// ngủ: mỗi đêm chung chỉ "qua đêm" được một lần (trời vẫn theo giờ chung nên thức dậy có thể còn tối)
{const _sl=sleep;sleep=function(b){if(!G.sleeping&&isNight()){const h=wcHour(),night=wcDayN()-(h<12?1:0);if(S.wcSl===night){S.p.hp=Math.min(100,S.p.hp+12);S.p.stam=maxStam();uiToast('Đêm nay bạn đã ngủ một giấc rồi. Nằm nghỉ hồi sức; trời sáng theo giờ chung của máy chủ.','');uiHud(true);return;}S.wcSl=night;
    setTimeout(()=>{if(S&&isNight())uiToast('🌙 Trời vẫn tối theo giờ chung của mọi người: ngoài kia còn đêm.','');},4200);}return _sl.apply(this,arguments);};}
// bảng giờ: thêm dòng nhỏ "giờ VN · mùa còn bao lâu" dưới dòng ngày
{const _hud=uiHud;uiHud=function(){const r=_hud.apply(this,arguments);try{const el=document.querySelector('#game .h-time');if(el&&S){el.title='Giờ Việt Nam '+wcClockVN()+' · mùa '+SEASONS[wcSeason()].n+' còn '+wcSeasonLeftMin()+' phút · mọi người chơi cùng ngày, cùng mùa';}}catch(e){}return r;};}
