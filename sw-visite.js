/* Visite terrain BE — service worker : la page reste disponible sans réseau (un chemin
   de halage n'a pas toujours la 4G). Réseau d'abord, copie locale en secours. Toute
   l'appli tient dans index.html. Les appels au serveur Apps Script ne passent JAMAIS
   par ici. */
const CACHE='visitebe-v1-2';   // 27/11/2026 : ne supprime plus que ses propres anciennes copies (préfixe visitebe-)
const COQUILLE=['./','index.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(COQUILLE.map(u=>c.add(new Request(u,{cache:'reload'}))))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('visitebe-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  const req=e.request.mode==='navigate'?fetch(e.request.url,{cache:'no-cache',credentials:'same-origin'}):fetch(e.request,{cache:'no-cache'});
  e.respondWith(req.then(r=>{if(r&&r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return r})
    .catch(()=>caches.match(e.request).then(r=>r||caches.match(e.request,{ignoreSearch:true})).then(r=>r||(e.request.mode==='navigate'?caches.match('index.html'):undefined))));
});
