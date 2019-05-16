import { SerializedRequest } from '../interfaces';
import { deserializeRequest, serializeResponse } from '../lib/serializers';
import { streamResponseBody } from './streamResponseBody';
import actionTypes from '../lib/actionTypes';
const { SEND_RESPONSE } = actionTypes;

export function handleRequest(
  serializedRequest: SerializedRequest,
  port: MessagePort,
  getResponse: (request: Request) => Response | Promise<Response>,
) {
  // Deserialize the request.
  const request = deserializeRequest(serializedRequest);

  // Run user's callback fuction.
  return Promise.resolve(getResponse(request)).then(response => {
    return serializeResponse(response).then(serializedResponse => {
      // Send initial response.
      port.postMessage({
        type: SEND_RESPONSE,
        payload: serializedResponse,
      });

      // Stream the response body, if it exists.
      if (serializedResponse.streamBody) {
        streamResponseBody(response.body.getReader(), port);
      }
    });
  });
}
