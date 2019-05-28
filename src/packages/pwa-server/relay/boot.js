import { activateWorker, subscribe } from '@core/relay';
if ('serviceWorker' in navigator) {
    activateWorker('/server.js').then(function () {
        subscribe(function (message, port) {
            // console.log('RELAY RECEIVED MESSAGE:', message, port);
            window.parent.postMessage(message, '*', [port]);
        });
    });
}
