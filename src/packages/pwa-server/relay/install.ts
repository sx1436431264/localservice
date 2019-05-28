import { activateWorker, subscribe } from '@core/relay';

if ('serviceWorker' in navigator) {
  activateWorker('sw.js').then(() => {
    subscribe((message, port) => {
      // console.log('RELAY RECEIVED MESSAGE:', message, port);
      window.parent.postMessage(message, '*', [port]);
    });
  });
}
