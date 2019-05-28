// Used for runtime check if this was a hard CMD+R.
import actionTypes from '../lib/actionTypes';
var VERIFY_COMM_RELAY = actionTypes.VERIFY_COMM_RELAY;
export function controllerExists() {
    return new Promise(function (res, rej) {
        // This should be an exported function for consumer to hook into.
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function (registrations) {
                var workerChecks = [];
                registrations.forEach(function (sw) {
                    if (sw.active) {
                        workerChecks.push(sendMessageToSw(sw.active, {
                            type: VERIFY_COMM_RELAY
                        }));
                    }
                });
                // If there's no relay, return false.
                if (workerChecks.length === 0) {
                    res(false);
                    return;
                }
                Promise.race(workerChecks).then(function (result) {
                    res(result.exists);
                });
            });
        }
        else {
            return rej("This browser doesn't support Service Workers.");
        }
    });
}
// Might make sense to abstract this logic at some point?
export function sendMessageToSw(controller, msg) {
    return new Promise(function (resolve, reject) {
        // Create a Message Channel
        var msg_chan = new MessageChannel();
        // Handler for recieving message reply from service worker
        msg_chan.port1.onmessage = function (event) {
            if (event.data.error) {
                reject(event.data.error);
            }
            else {
                resolve(event.data);
            }
        };
        // Send message to service worker along with port for reply
        controller.postMessage(msg, [msg_chan.port2]);
    });
}
