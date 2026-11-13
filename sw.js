/* Lửa Đá — chạy như ứng dụng: trang game lấy bản mới khi có mạng, mất mạng thì dùng bản đã lưu */
const VER='20261113093957',CACHE='lua-da-'+VER;
const CORE=['/','/index.html','/manifest.webmanifest','/icons/icon-192.png','/icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('lua-da-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  // máy chủ chơi chung, đăng nhập: luôn đi thẳng mạng
  if(/supabase\.co$/.test(u.hostname))return;
  if(r.mode==='navigate'||u.pathname==='/'||u.pathname.endsWith('.html')){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put('/index.html',cp));return res;}).catch(()=>caches.match('/index.html')));return;}
  // thư viện 3D, phông chữ, biểu tượng: lấy từ bộ nhớ trước cho nhanh
  if(u.origin===location.origin||/cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com|fonts\.(googleapis|gstatic)\.com/.test(u.hostname)){
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}return res;})));}
});
