import { SerializedResponse, SerializedRequest } from '../interfaces';

export function serializeResponse(response: Response): Promise<SerializedResponse> {
  const res: SerializedResponse = {
    streamBody: !!response.body,
    init: {},
  };
  if (response.status) res.init.status = response.status;
  if (response.statusText) res.init.statusText = response.statusText;

  const headers = {};
  response.headers.forEach((v, k) => {
    headers[k] = v;
  });
  if (Object.keys(headers).length > 0) res.init.headers = headers;

  // If there's no body attr, this browser doesn't support readable streams.
  // We need to get the blob and see if it exists.
  if (response.body === undefined) {
    return response.blob().then(blob => {
      // 0 size and empty type mean it's a null body
      if (blob.size === 0 && blob.type === '') {
        res.body = null;
        // Otherwise, set blob as the body
      } else {
        res.body = blob;
      }
      return res;
    });
  }

  return Promise.resolve(res);
}

export function deserializeResponse(res: SerializedResponse) {
  return new Response(res.body, res.init);
}

export function serializeRequest(request: Request): Promise<SerializedRequest> {
  const req: SerializedRequest = {
    url: request.url,
    init: {},
  };

  // Iterate over supported values & copy.
  ['method', 'mode', 'credentials', 'cache', 'redirect', 'referrer', 'integrity'].forEach(key => {
    if (request[key]) {
      req[key] = request[key];
    }
  });

  // Copy headers if there are any.
  const headers = {};
  request.headers.forEach((v, k) => {
    headers[k] = v;
  });
  if (Object.keys(headers).length > 0) {
    req.init.headers = headers;
  }

  return request.blob().then(blob => {
    if (blob.size !== 0) {
      req.init.body = blob;
    }

    return req;
  });
}

export function deserializeRequest(req: SerializedRequest) {
  return new Request(req.url, req.init);
}
