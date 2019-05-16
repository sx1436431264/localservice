import { LSMessage, SerializedResponse } from '../interfaces';
import { serializeRequest, deserializeResponse } from '../lib/serializers';
import actionTypes from '../lib/actionTypes';
const { SEND_RESPONSE, STREAM_PUMP, STREAM_END, FETCH_REQUEST, VERIFY_COMM_RELAY } = actionTypes;

// TODO: Delete these
declare global {
  interface Window {
    clients: any;
    ReadableStream: any;
  }
}
interface Client {
  [key: string]: any;
}
interface WindowClient {
  [key: string]: any;
}
interface ExtendableMessageEvent {
  [key: string]: any;
}
declare var ReadableStream: any;

// User needs to instatiate this at the top of their worker.
// This is bc we need the path to their relay for most methods.
export class LocalServiceAdapter {
  __relayPath: string;

  constructor(options: { relayPath: string }) {
    this.__relayPath = options.relayPath;
  }

  // Meant to be consumed in the "activate" event listener.
  // IMPORTANT: Needs to be wrapped in a `event.waitUntil`
  refreshAllClients(): Promise<void> {
    return self.clients.matchAll({ type: 'window' }).then(windowClients => {
      windowClients.forEach((windowClient: WindowClient) => {
        windowClient.navigate(windowClient.url);
      });
    });
  }

  // Consumer imports this for their 'message' eventlistener
  // IMPORTANT: Consumer needs to wrap this in "event.waitUntil"
  handleClientMessage(event: ExtendableMessageEvent): Promise<{ status: 'success' | 'no-match' }> {
    return new Promise((res, rej) => {
      const { type, payload } = event.data;

      const success = () => {
        res({ status: 'success' });
      };
      const noMatch = () => {
        res({ status: 'no-match' });
      };

      // No-op if there's no type attribute
      if (!type) {
        return noMatch();
      }

      // Browser runtime check for CMD+R.
      if (type === VERIFY_COMM_RELAY) {
        // TODO: Replace this logic with this.controllerConnected()
        return this.getCommRelays().then(relays => {
          event.ports[0] && event.ports[0].postMessage({ exists: relays.length !== 0 });
          return success();
        });

        // TODO: Add API for controllers to trigger browser refreshes.
        // Use this.refreshAllWindows()

        // Default to no-match for unrecognized types.
      } else {
        return noMatch();
      }
    });
  }

  // Consumer function for handling fetch requests.
  controllerFetch(request: Request): Promise<Response> {
    return serializeRequest(request).then(req => {
      return this.sendRequestToRelay({
        type: FETCH_REQUEST,
        payload: req,
      }).then(res => deserializeResponse(res));
    });
  }

  sendRequestToRelay(message: LSMessage): Promise<SerializedResponse> {
    const promises = [];

    return this.getCommRelays().then(relays => {
      relays.forEach(relay =>
        // If readablestream doesn't exist, resort to blob.
        promises.push(!self.ReadableStream ? resolveBlob(relay, message) : resolveStream(relay, message)),
      );
      return Promise.race(promises);
    });
  }

  // Helper method for getting all matching comm relays.
  getCommRelays(): Promise<Client[]> {
    return self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(windowClients => {
      return windowClients.filter(windowClient => new URL(windowClient.url).pathname.indexOf(this.__relayPath) === 0);
    });
  }

  // Helper method for getting all preview windows.
  getClients(): Promise<Client[]> {
    return self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(windowClients => {
      return windowClients.filter(windowClient => new URL(windowClient.url).pathname.indexOf(this.__relayPath) !== 0);
    });
  }

  // Determine if there are any relays available.
  controllerConnected(): Promise<boolean> {
    return this.getCommRelays().then(relays => {
      return relays.length > 0;
    });
  }

  // Refresh all windows that aren't relays
  refreshAllWindows(opts: { includeRelay: boolean } = { includeRelay: false }) {
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(windowClients => {
      windowClients.forEach(windowClient => {
        if (
          opts.includeRelay ||
          (!opts.includeRelay && new URL(windowClient.url).pathname.indexOf(this.__relayPath) !== 0)
        ) {
          // console.log('refreshing!', windowClient);
          windowClient.navigate(windowClient.url);
        }
      });
    });
  }
}

// For browsers that don't support readable streams, use this fn.
function resolveBlob(client, message: LSMessage) {
  return new Promise(function(resolve, reject) {
    var channel = new MessageChannel();
    channel.port1.onmessage = function(event) {
      const { type, payload } = event.data;
      if (event.data.error) {
        reject(event.data.error);
      } else {
        // Resolve promise with stream.
        if (type === SEND_RESPONSE) {
          const response = {
            ...payload,
          };

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
function resolveStream(client, message: LSMessage) {
  return new Promise(function(resolve, reject) {
    var channel = new MessageChannel();

    const stream = new ReadableStream({
      start(controller) {
        channel.port1.onmessage = function(event) {
          const { type, payload } = event.data;
          if (event.data.error) {
            reject(event.data.error);
          } else {
            // Resolve promise with stream.
            if (type === SEND_RESPONSE) {
              const response = {
                ...payload,
              };
              // Set res body as stream if it exists.
              if (response.streamBody) {
                response.body = stream;
                // If there's no body, close the messageport.
              } else {
                channel.port1.close();
                channel.port2.close();
                channel = null;
              }
              resolve(response);

              // Pump the stream
            } else if (type === STREAM_PUMP) {
              controller.enqueue(payload);
              // Close the stream
            } else if (type === STREAM_END) {
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
      },
    }); // End readable stream
  });
}
