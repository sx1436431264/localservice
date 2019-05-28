import actionTypes from '../lib/actionTypes';
var STREAM_PUMP = actionTypes.STREAM_PUMP, STREAM_END = actionTypes.STREAM_END;
export function streamResponseBody(reader, port) {
    function pump() {
        reader.read().then(function (_a) {
            var done = _a.done, value = _a.value;
            // When no more data needs to be consumed, close the stream
            if (done) {
                port.postMessage({
                    type: STREAM_END
                });
                return;
            }
            // Enqueue the next data chunk into our target stream
            port.postMessage({
                type: STREAM_PUMP,
                payload: value
            });
            return pump();
        });
    }
    // Start the pump
    pump();
}
