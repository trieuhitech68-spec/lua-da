# Dựng game "Lửa Đá: Từ Hai Bàn Tay Trắng" thành một tệp HTML (bản artifact) + bản web đầy đủ
import os
SP=os.path.dirname(os.path.abspath(__file__));V3=os.path.join(SP,'..','v3d')
OUT=os.environ.get('OUT',os.path.join(SP,'..','build','artifact.html'));WEB=os.environ.get('WEB',os.path.join(SP,'..','index.html'))
rd=lambda p:open(p,encoding='utf-8').read()
k3=rd(os.path.join(V3,'k3d.js'));a='(function(){\n  const T=window.THREE;if(!T)return;';assert k3.count(a)==1
k3=k3.replace(a,'function K3init(){if(K3.ok)return;\n  const T=window.THREE;if(!T)return;');assert k3.rstrip().endswith('})();');k3=k3.rstrip()[:-len('})();')]+'}\n'
li=rd(os.path.join(V3,'lights3d.js'));a="(function(){if(typeof K3==='undefined'||!K3.ok)return;const T=K3.T;";assert li.count(a)==1
li=li.replace(a,'function K3lightsInit(){if(!K3.ok||K3.lights)return;const T=K3.T;');assert li.rstrip().endswith('})();');li=li.rstrip()[:-len('})();')]+'}\n'
mp=os.path.join(SP,'models.js');models=rd(mp) if os.path.exists(mp) and not os.environ.get('NOMODELS') else ''
parts=[rd(os.path.join(SP,'helpers.js')),rd(os.path.join(SP,'backend.js')),rd(os.path.join(SP,'data.js')),k3,li,rd(os.path.join(V3,'k3fx.js')),rd(os.path.join(V3,'char3d.js')),models,
  rd(os.path.join(SP,'world.js')),rd(os.path.join(SP,'game.js')),rd(os.path.join(SP,'life.js')),rd(os.path.join(SP,'audio.js')),rd(os.path.join(SP,'ui.js'))]+[rd(os.path.join(SP,f)) for f in ['fp.js','map.js','acts.js','work.js','models2.js','models3.js','human.js','poses.js','build2.js','life2.js','life3.js','farm.js','models4a.js','models4b.js','models5.js','hunt2.js','tribe.js','terrain2.js','terrain3.js','world4.js','world5.js','lands.js','war.js','build3.js','build4.js','models6v.js','models6c.js','hunt3.js','life4.js','fauna.js','more.js','more2.js','more3.js','realm.js','codex.js','land.js','edit.js','cam4.js','guide.js','auto.js','move3.js','peek.js','craft5.js','ui5.js','admin.js','clock.js','hero.js','hero2.js','upg.js','nha.js','dan.js','khu.js','truyen.js','ui6.js','ui7.js','ui8.js','kn.js','news.js','nv.js','farm5.js','login.js','account.js','creator.js','wear.js','settings.js','mp.js','pvp.js','ho.js','lands2.js','auto2.js','solid.js','hero3.js','hero4.js','hero5.js','ui9.js','coban.js','sinhton.js','kho.js','nangnha.js','dadang.js','khongdung.js','dongbo.js','thienphu.js','nv3.js','quandoi.js','thodanle.js','hd.js','wake.js','quyhoach.js','cuoi.js','linhthu.js','voice.js'] if os.path.exists(os.path.join(SP,f))]+['bootHot();\n']
js="'use strict';\n"+'\n'.join(p.rstrip() for p in parts if p)+'\n'
for bad in ['</script','<!--']:assert bad not in js,bad
css=rd(os.path.join(SP,'style.css'))
fonts='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700;800&family=Bungee&display=swap" rel="stylesheet">'
body='<div id="game"></div>\n<script>\n'+js+'</script>\n'
frag='<title>Lửa Đá Tay Trắng</title>\n'+fonts+'\n<style>\n'+css+'</style>\n'+body
os.makedirs(os.path.dirname(OUT),exist_ok=True);open(OUT,'w',encoding='utf-8').write(frag)
if WEB!='0':
  icon="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23241812'/%3E%3Cpath d='M32 8C40 22 52 28 48 44C45 55 38 58 32 58C26 58 19 55 16 44C12 30 26 26 26 14C30 22 33 18 32 8Z' fill='%23e5532c'/%3E%3Cpath d='M32 26C37 34 42 38 40 47C39 52 35 54 32 54C29 54 25 52 24 47C23 40 30 37 32 26Z' fill='%23ffb347'/%3E%3C/svg%3E"
  head=('<!doctype html>\n<html lang="vi"><head><meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">\n'
    '<meta name="theme-color" content="#160f0a"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes">\n'
    '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><title>Lửa Đá: Từ Hai Bàn Tay Trắng</title>\n<link rel="icon" href="'+icon+'"><link rel="apple-touch-icon" href="'+icon+'">\n'+fonts+'\n<style>\n'+css+'</style></head><body>\n')
  open(WEB,'w',encoding='utf-8').write(head+body+'</body></html>\n');print('WEB',WEB)
print('OK',OUT,len(frag),'models' if models else 'NO MODELS (dùng hình tạm)')
