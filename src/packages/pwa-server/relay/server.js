import { LocalServiceAdapter } from '@core/worker';
var ls = new LocalServiceAdapter({ relayPath: '/__commrelay__.html' });
// First step is install
self.addEventListener('install', function (event) {
    event.waitUntil(self.skipWaiting());
});
// After that, we activate and claim clients.
// This is where we ping main thread to let them know we're running.
self.addEventListener('activate', function (event) {
    // Refresh all previous pages (that aren't comm relays)
    ls.refreshAllWindows();
    event.waitUntil(clients.claim());
});
self.addEventListener("fetch", function (event) {
    var request = event.request;
    var url = new URL(request.url);
    // Ensure request is for the server origin.
    // i.e. let unpkg/etc requests flow through.
    if (url.origin !== location.origin)
        return;
    return event.respondWith(ls.controllerConnected().then(function (connected) {
        // If controller connected, route request to it.
        // url.origin === location.origin &&
        // !(
        //   url.pathname.indexOf('/assets/packs') === 0 ||
        //   url.pathname.indexOf('/_relay_') === 0 ||
        //   url.pathname.indexOf('/_commrelay_') === 0
        // )
        if (connected) {
            return ls.controllerFetch(request);
        }
    }));
});
// Message handler (runtime cmd+r check, broadcast, etc)
self.addEventListener('message', function (event) {
    event.waitUntil(ls.handleClientMessage(event));
    // Handle RELAY<->PREVIEW comms before handing to localService.
    // const { type } = event.data;
    // if (type === 'PREVIEW_TO_RELAY') {
    //   getCommRelays().then(relays => {
    //     relays.forEach(window => {
    //       window.postMessage(event.data);
    //     });
    //   });
    // } else if (type === 'RELAY_TO_PREVIEWS') {
    //   getClients().then(clients => {
    //     clients.forEach(window => {
    //       window.postMessage(event.data);
    //     });
    //   });
    // } else {
    //   event.waitUntil(ls.handleClientMessage(event));
    // }
});
