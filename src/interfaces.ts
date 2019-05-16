export interface LSMessage {
  type: string;
  payload: any;
}

export interface SerializedHeaders {
  [key: string]: string;
}

export interface SerializedResponse {
  streamBody: boolean; // Is this body streamable?
  body?: any | null;
  init?: {
    status?: number;
    statusText?: string;
    headers?: SerializedHeaders;
  };
}

export interface SerializedRequest {
  url: string;
  init?: {
    method?: string;
    headers?: SerializedHeaders;
    body?: Blob;
    mode?: RequestMode;
    credentials?: RequestCredentials;
    cache?: RequestCache;
    redirect?: RequestRedirect;
    referrer?: string;
    integrity?: string;
  };
}
