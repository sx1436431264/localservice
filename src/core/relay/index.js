import actionTypes from '../lib/actionTypes';
var FETCH_REQUEST = actionTypes.FETCH_REQUEST;
export function activateWorker(swUrl) {
    return new Promise(function (res, rej) {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function () {
                navigator.serviceWorker.register(swUrl).then(function () {
                    // Registration was successful
                    navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
                        res(serviceWorkerRegistration);
                    });
                }, function (err) {
                    // registration failed :(
                    return rej(err);
                });
            });
            // No svc worker in this browser? Reject promise.
        }
        else {
            return rej("This browser doesn't support Service Workers.");
        }
    });
}
export function subscribe(cb) {
    var wrappedCb = function (event) {
        // Only fire callback if this is a fetch request.
        if (event.data.type === 'FETCH_REQUEST') {
            cb(event.data, event.ports[0]);
        }
    };
    navigator.serviceWorker.addEventListener('message', wrappedCb);
    // Terminate function
    return function () {
        navigator.serviceWorker.removeEventListener('message', wrappedCb);
    };
}
