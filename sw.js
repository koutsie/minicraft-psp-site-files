var CACHE='minicraft-v10';
var IMMUTABLE=/\.(wasm|js|data|mem|png|ico|webp)$/i;

function addHeaders(r){
if(!r||r.type==='opaque')return r;
var h=new Headers(r.headers);
h.set('Cross-Origin-Opener-Policy','same-origin');
h.set('Cross-Origin-Embedder-Policy','require-corp');
h.set('Cross-Origin-Resource-Policy','same-origin');
return new Response(r.body,{status:r.status,statusText:r.statusText,headers:h});
}

self.addEventListener('install',function(){self.skipWaiting()});
self.addEventListener('activate',function(e){
e.waitUntil(caches.keys().then(function(k){
return Promise.all(k.filter(function(x){return x!==CACHE}).map(function(x){return caches.delete(x)}));
}).then(function(){return self.clients.claim()}));
});

self.addEventListener('fetch',function(e){
var r=e.request;
if(r.method!=='GET'||new URL(r.url).origin!==self.location.origin)return;
if(IMMUTABLE.test(new URL(r.url).pathname)){
e.respondWith(caches.open(CACHE).then(function(c){
return c.match(r).then(function(cached){
if(cached)return addHeaders(cached);
return fetch(r).then(function(resp){
if(resp.ok)c.put(r,resp.clone());
return addHeaders(resp);
});
});
}));
}else{
e.respondWith(fetch(r).then(function(resp){return addHeaders(resp)}).catch(function(){
return caches.open(CACHE).then(function(c){return c.match(r)}).then(function(cached){
return cached?addHeaders(cached):new Response('Offline',{status:503});
});
}));
}
});
