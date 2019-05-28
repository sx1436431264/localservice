import { deserializeRequest, serializeResponse } from '../lib/serializers';
import { streamResponseBody } from './streamResponseBody';
import actionTypes from '../lib/actionTypes';
var SEND_RESPONSE = actionTypes.SEND_RESPONSE;
export function handleRequest(serializedRequest, port, getResponse) {
    // Deserialize the request.
    var request = deserializeRequest(serializedRequest);
    // Run user's callback fuction.
    return Promise.resolve(getResponse(request)).then(function (response) {
        return serializeResponse(response).then(function (serializedResponse) {
            // Send initial response.
            port.postMessage({
                type: SEND_RESPONSE,
                payload: serializedResponse
            });
            // Stream the response body, if it exists.
            if (serializedResponse.streamBody) {
                streamResponseBody(response.body.getReader(), port);
            }
        });
    });
}
