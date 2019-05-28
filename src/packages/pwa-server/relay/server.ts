import { LocalServiceAdapter } from '@core/worker';

// Janky hotfix until we get TS webworker types working.
declare global {
  interface Window {
    clients: any;
    skipWaiting: any;
  }
}

const ls = new LocalServiceAdapter({ relayPath: '/__commrelay__.html' });

declare var clients: any;

// First step is install
self.addEventListener('install', function(event: any) {
  event.waitUntil(self.skipWaiting());
});

// After that, we activate and claim clients.
// This is where we ping main thread to let them know we're running.
self.addEventListener('activate', (event: any) => {
  // Refresh all previous pages (that aren't comm relays)
  ls.refreshAllWindows();

  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", function(event: any) {
  const { request } = event;

  const url = new URL(request.url);

  // Ensure request is for the server origin.
  // i.e. let unpkg/etc requests flow through.
  if (url.origin !== location.origin) return;
  
  return event.respondWith(ls.controllerConnected().then(connected => {
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
self.addEventListener('message', (event: any) => {

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
