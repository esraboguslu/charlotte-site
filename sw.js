const CACHE='charlotte-site-v2';
const ROOT=new URL('./',self.location.href);
const asset=path=>new URL(path,ROOT).toString();
const SHELL=['./','./?phone=1','manifest.webmanifest','icons/charlotte.svg','icons/charlotte-192.png','icons/charlotte-512.png','icons/charlotte-touch.png'].map(asset);

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
  if(request.mode==='navigate') {
    event.respondWith(fetch(request).then(response=>{
      const copy=response.clone();void caches.open(CACHE).then(cache=>cache.put(request,copy));return response;
    }).catch(async()=>await caches.match(request)||await caches.match(asset('./?phone=1'))||await caches.match(asset('./'))));
    return;
  }
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
    const copy=response.clone();void caches.open(CACHE).then(cache=>cache.put(request,copy));return response;
  })));
});
