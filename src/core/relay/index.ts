import { LSMessage } from '../interfaces';
import actionTypes from '../lib/actionTypes';
const { FETCH_REQUEST } = actionTypes;

export function activateWorker(swUrl: string) {
  return new Promise((res, rej) => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register(swUrl).then(
          function() {
            // Registration was successful
            navigator.serviceWorker.ready.then(serviceWorkerRegistration => {
              res(serviceWorkerRegistration);
            });
          },
          function(err) {
            // registration failed :(
            return rej(err);
          },
        );
      });

      // No svc worker in this browser? Reject promise.
    } else {
      return rej(`This browser doesn't support Service Workers.`);
    }
  });
}

export function subscribe(cb: (message: LSMessage, port: MessagePort) => void): () => void {
  const wrappedCb = event => {
    // Only fire callback if this is a fetch request.
    if (event.data.type === 'FETCH_REQUEST') {
      cb(event.data, event.ports[0]);
    }
  };
  navigator.serviceWorker.addEventListener('message', wrappedCb);

  // Terminate function
  return () => {
    navigator.serviceWorker.removeEventListener('message', wrappedCb);
  };
}
