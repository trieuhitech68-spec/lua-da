# Gắn phần "ứng dụng cài được" (PWA) vào bản web index.html sau khi dựng
import os,re,time
SP=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.join(SP,'..')
p=os.path.join(ROOT,'index.html');s=open(p,encoding='utf-8').read()
head='''<link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#2a1608">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="Lửa Đá">
<link rel="apple-touch-icon" href="/icons/icon-180.png"><link rel="icon" type="image/png" href="/icons/icon-192.png">'''
VER=time.strftime('%Y%m%d%H%M%S')
head+='<meta name="ld-ver" content="'+VER+'">'
js=open(os.path.join(SP,'pwa_ui.js'),encoding='utf-8').read()
if 'rel="manifest"' not in s:
    m=re.search(r'<meta charset=[^>]*>',s)
    s=s[:m.end()]+head+s[m.end():] if m else re.sub(r'<head([^>]*)>',lambda m:'<head'+m.group(1)+'>'+head,s,count=1)
s=s.replace('</body>','<script>'+js+'</script></body>',1) if '/*PWA-UI*/' not in s else s
open(p,'w',encoding='utf-8').write(s)
sw=os.path.join(ROOT,'sw.js');t=open(sw,encoding='utf-8').read()
t=re.sub(r"const VER='[^']*'","const VER='"+VER+"'",t);open(sw,'w',encoding='utf-8').write(t)
print('PWA ok')
