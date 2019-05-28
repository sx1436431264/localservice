var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { serializeRequest, deserializeResponse } from '../lib/serializers';
import actionTypes from '../lib/actionTypes';
var SEND_RESPONSE = actionTypes.SEND_RESPONSE, STREAM_PUMP = actionTypes.STREAM_PUMP, STREAM_END = actionTypes.STREAM_END, FETCH_REQUEST = actionTypes.FETCH_REQUEST, VERIFY_COMM_RELAY = actionTypes.VERIFY_COMM_RELAY;
// User needs to instatiate this at the top of their worker.
// This is bc we need the path to their relay for most methods.
var LocalServiceAdapter = /** @class */ (function () {
    function LocalServiceAdapter(options) {
        this.__relayPath = options.relayPath;
    }
    // Meant to be consumed in the "activate" event listener.
    // IMPORTANT: Needs to be wrapped in a `event.waitUntil`
    LocalServiceAdapter.prototype.refreshAllClients = function () {
        return self.clients.matchAll({ type: 'window' }).then(function (windowClients) {
            windowClients.forEach(function (windowClient) {
                windowClient.navigate(windowClient.url);
            });
        });
    };
    // Consumer imports this for their 'message' eventlistener
    // IMPORTANT: Consumer needs to wrap this in "event.waitUntil"
    LocalServiceAdapter.prototype.handleClientMessage = function (event) {
        var _this = this;
        return new Promise(function (res, rej) {
            var _a = event.data, type = _a.type, payload = _a.payload;
            var success = function () {
                res({ status: 'success' });
            };
            var noMatch = function () {
                res({ status: 'no-match' });
            };
            // No-op if there's no type attribute
            if (!type) {
                return noMatch();
            }
            // Browser runtime check for CMD+R.
            if (type === VERIFY_COMM_RELAY) {
                // TODO: Replace this logic with this.controllerConnected()
                return _this.getCommRelays().then(function (relays) {
                    event.ports[0] && event.ports[0].postMessage({ exists: relays.length !== 0 });
                    return success();
                });
                // TODO: Add API for controllers to trigger browser refreshes.
                // Use this.refreshAllWindows()
                // Default to no-match for unrecognized types.
            }
            else {
                return noMatch();
            }
        });
    };
    // Consumer function for handling fetch requests.
    LocalServiceAdapter.prototype.controllerFetch = function (request) {
        var _this = this;
        return serializeRequest(request).then(function (req) {
            return _this.sendRequestToRelay({
                type: FETCH_REQUEST,
                payload: req
            }).then(function (res) { return deserializeResponse(res); });
        });
    };
    LocalServiceAdapter.prototype.sendRequestToRelay = function (message) {
        var promises = [];
        return this.getCommRelays().then(function (relays) {
            relays.forEach(function (relay) {
                // If readablestream doesn't exist, resort to blob.
                return promises.push(!self.ReadableStream ? resolveBlob(relay, message) : resolveStream(relay, message));
            });
            return Promise.race(promises);
        });
    };
    // Helper method for getting all matching comm relays.
    LocalServiceAdapter.prototype.getCommRelays = function () {
        var _this = this;
        return self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(function (windowClients) {
            return windowClients.filter(function (windowClient) { return new URL(windowClient.url).pathname.indexOf(_this.__relayPath) === 0; });
        });
    };
    // Helper method for getting all preview windows.
    LocalServiceAdapter.prototype.getClients = function () {
        var _this = this;
        return self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(function (windowClients) {
            return windowClients.filter(function (windowClient) { return new URL(windowClient.url).pathname.indexOf(_this.__relayPath) !== 0; });
        });
    };
    // Determine if there are any relays available.
    LocalServiceAdapter.prototype.controllerConnected = function () {
        return this.getCommRelays().then(function (relays) {
            return relays.length > 0;
        });
    };
    // Refresh all windows that aren't relays
    LocalServiceAdapter.prototype.refreshAllWindows = function (opts) {
        var _this = this;
        if (opts === void 0) { opts = { includeRelay: false }; }
        self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(function (windowClients) {
            windowClients.forEach(function (windowClient) {
                if (opts.includeRelay ||
                    (!opts.includeRelay && new URL(windowClient.url).pathname.indexOf(_this.__relayPath) !== 0)) {
                    // console.log('refreshing!', windowClient);
                    windowClient.navigate(windowClient.url);
                }
            });
        });
    };
    return LocalServiceAdapter;
}());
export { LocalServiceAdapter };
// For browsers that don't support readable streams, use this fn.
function resolveBlob(client, message) {
    return new Promise(function (resolve, reject) {
        var channel = new MessageChannel();
        channel.port1.onmessage = function (event) {
            var _a = event.data, type = _a.type, payload = _a.payload;
            if (event.data.error) {
                reject(event.data.error);
            }
            else {
                // Resolve promise with stream.
                if (type === SEND_RESPONSE) {
                    var response = __assign({}, payload);
                    channel.port1.close();
                    channel.port2.close();
                    channel = null;
                    resolve(response);
                }
            }
        };
        // Send the initial request
        client.postMessage(message, [channel.port2]);
    });
}
// Helper method for resolving response streams.
function resolveStream(client, message) {
    return new Promise(function (resolve, reject) {
        var channel = new MessageChannel();
        var stream = new ReadableStream({
            start: function (controller) {
                channel.port1.onmessage = function (event) {
                    var _a = event.data, type = _a.type, payload = _a.payload;
                    if (event.data.error) {
                        reject(event.data.error);
                    }
                    else {
                        // Resolve promise with stream.
                        if (type === SEND_RESPONSE) {
                            var response = __assign({}, payload);
                            // Set res body as stream if it exists.
                            if (response.streamBody) {
                                response.body = stream;
                                // If there's no body, close the messageport.
                            }
                            else {
                                channel.port1.close();
                                channel.port2.close();
                                channel = null;
                            }
                            resolve(response);
                            // Pump the stream
                        }
                        else if (type === STREAM_PUMP) {
                            controller.enqueue(payload);
                            // Close the stream
                        }
                        else if (type === STREAM_END) {
                            controller.close();
                            // Close out ports
                            channel.port1.close();
                            channel.port2.close();
                            channel = null;
                            return;
                        }
                    }
                };
                // Send the initial request
                client.postMessage(message, [channel.port2]);
            }
        }); // End readable stream
    });
}
