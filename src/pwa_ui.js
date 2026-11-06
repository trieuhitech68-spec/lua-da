/*PWA-UI*/(function(){
  var host=location.hostname;if(/claude\.ai|claudeusercontent/.test(host)||(location.protocol!=='https:'&&host!=='localhost'))return;
  if('serviceWorker' in navigator)addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});
  var standalone=matchMedia('(display-mode: fullscreen)').matches||matchMedia('(display-mode: standalone)').matches||navigator.standalone;
  if(standalone)return;
  var ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),deferred=null;
  addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;show();});
  addEventListener('appinstalled',function(){hide();try{localStorage.setItem('ldtt-app','1');}catch(x){}});
  var st=document.createElement('style');st.textContent='.ld-app{position:fixed;z-index:60;right:max(12px,env(safe-area-inset-right));top:max(12px,env(safe-area-inset-top));padding:9px 14px;border-radius:999px;border:1px solid rgba(242,197,90,.6);background:rgba(30,18,8,.92);color:#ffe2a8;font:700 14px system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.45)}.ld-app[hidden]{display:none}.ld-ios{position:fixed;z-index:61;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:flex-end;justify-content:center}.ld-ios[hidden]{display:none}.ld-ios>div{background:#1e1208;color:#f3e6cf;border:1px solid rgba(242,197,90,.5);border-radius:16px 16px 0 0;padding:18px 18px calc(18px + env(safe-area-inset-bottom));max-width:480px;width:100%;font:15px/1.5 system-ui,sans-serif}.ld-ios b{color:#ffd27a}.ld-ios button{margin-top:12px;width:100%;padding:11px;border-radius:12px;border:0;background:#e2861c;color:#1a0d04;font:700 15px system-ui}';document.head.appendChild(st);
  var btn=document.createElement('button');btn.className='ld-app';btn.hidden=true;btn.textContent='📲 Cài ứng dụng';document.body.appendChild(btn);
  var tip=document.createElement('div');tip.className='ld-ios';tip.hidden=true;tip.innerHTML='<div><b>Cài Lửa Đá lên iPhone / iPad</b><br>1. Bấm nút <b>Chia sẻ</b> (ô vuông có mũi tên ↑) ở thanh dưới của Safari.<br>2. Chọn <b>Thêm vào Màn hình chính</b>.<br>3. Bấm <b>Thêm</b>. Biểu tượng 🔥 Lửa Đá sẽ hiện trên màn hình, mở là chơi toàn màn hình.<br><small>Nếu đang mở bằng Chrome/Zalo/Facebook, hãy mở link trong <b>Safari</b> trước.</small><button>Đã hiểu</button></div>';document.body.appendChild(tip);
  tip.addEventListener('click',function(e){if(e.target===tip||e.target.tagName==='BUTTON')tip.hidden=true;});
  btn.addEventListener('click',function(){if(deferred){deferred.prompt();deferred.userChoice.then(function(r){if(r&&r.outcome==='accepted')hide();deferred=null;});}else if(ios){tip.hidden=false;}});
  function show(){btn.hidden=false;}function hide(){btn.hidden=true;}
  // chỉ hiện ở màn hình đầu (đăng nhập, chọn nhân vật), ẩn khi đang chơi
  setInterval(function(){var ov=document.querySelector('#overlay:not([hidden]),.lg-wrap,.ov-card');var playing=window.G&&G.on;btn.hidden=!(deferred||ios)||playing||!ov;},800);
  if(ios)show();
})();
