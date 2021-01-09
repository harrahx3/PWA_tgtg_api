console.log("mysw startation");
console.log("mysw startation2");

/*self.addEventListener(’fetch’, function (event) {
    console.log("mysw event fetch");
    event.respondWith(
        fetch(event.request).catch(function() {
            return caches.match(event.request)
        })
    )
})*/
/*
 self.addEventListener('push', event => {
    const data = event.data.json();
 //a
    self.registration.showNotification(data.title, {
      body: 'Yay it works!',
      vibrate: [300,200,400]
    });
  });*/
/*
var staticCacheName = "pwa";

self.addEventListener("install", function (e) {
  console.log("sw install");
  e.waitUntil(
    caches.open(staticCacheName).then(function (cache) {
      console.log("sw cache");
      return cache.addAll(["/"]);
    })
  );
});

self.addEventListener("fetch", function (event) {
  console.log("sw fetch");
  console.log(event.request.url);

  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});
*/

self.addEventListener('install', (event) => {
  console.log("sw installation");
  event.waitUntil(async function () {
    const cache = await caches.open('static-v7');
    await cache.addAll(['../html/home.html', '../css/home.css', '../img/icon.png', '../html/offline.html']);
  }());
});


self.addEventListener('activate', event => {
  console.log("sw activation");
  event.waitUntil(async function () {
    // Feature-detect
    if (self.registration.navigationPreload) {
      // Enable navigation preloads!
      await self.registration.navigationPreload.enable();
    }
  }());
});

self.addEventListener('fetch', (event) => {
  console.log("sw fetchation");
  console.log('Handling fetch event for', event.request.url);

  const { request } = event;

  // Always bypass for range requests, due to browser bugs
  if (request.headers.has('range')) return;
  event.respondWith(async function () {
    // Try to get from the cache:
    console.log("trying to get from the cache");
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    try {
      // See https://developers.google.com/web/updates/2017/02/navigation-preload#using_the_preloaded_response
      console.log("Try using the preloaded reponse");
      const response = await event.preloadResponse;
      if (response) return response;

      // Otherwise, get from the network
      return await fetch(request);
    } catch (err) {
      // If this was a navigation, show the offline page:
      if (request.mode === 'navigate') {
        console.log("This was a navigation, show the offline page");
        console.log(caches)
        return caches.match('../html/offline.html');
      }

      // Otherwise throw
      throw err;
    }
  }());
});

self.addEventListener('push', (event) => {
  console.log("sw pushation");
  /*self.registration.showNotification('Title', {
    body: 'body'
  });*/
  const preCache = async () => {
    const cache = "await caches.open('static-v1')";
    console.log(cache);
    console.log("in wait until function");
    var data = { body: 'mybody', title: 'mytitle' };
    console.log(event);
    console.log(event.body);
    console.log(event.data);
     if (event.data) {
       data = event.data.json();
       console.log("data event:");
       console.log(data);
     }// else {
    console.log("not data event");
    //data.body = "data body";
    //data.title = "data title";
    //fetch data from server
    //}
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '../img/icon.png',
      tag: 'tag',
      actions: [
        { action: 'like', title: 'Like', icon: '../img/icon.png' },
        { action: 'reshare', title: 'Reshare', icon: '../img/icon.png' } // mettre les icons dans le cache
      ]
    })
    return cache;
  };
  event.waitUntil(preCache());
  /*event.waitUntil( // sw keep working (stay alive) until the promise returns
    function () {
      console.log("in wait until function");
      var data;
      if (event.data) {
        data = event.data.json();
        console.log("data event");
      } else {
        console.log("not data event");
        data.body = "data body";
        data.title = "data title";
        //fetch data from server
      }
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '../img/icon.png',
        tag: 'tag',
        actions: [
          { action: 'like', title: 'Like', icon: '../img/icon.png' },
          { action: 'reshare', title: 'Reshare', icon: '../img/icon.png' } // mettre les icons dans le cache
        ]
      })
    }
  )*/

});


/*

self.addEventListener('notificationclick', function (event) {
  if (event.action === 'like') {
    console.log("like action");
    //event.waitUntil(fetch('/likefromnotif'));
  } else if (event.action === 'reshare') {
    console.log("reshare action");
    //event.waitUntil(fetch('/likefromnotif'));
  } else {
    clients.openWindowj(event.srcElement.location.origin)
  }
})

self.addEventListener('notificationclose', function (event) {
  console.log('notificationclose');
  var data = event.notification.data;
  event.waitUntil(
    //fetch('/api/close-notif?id=' + data.id)
  );
})*/