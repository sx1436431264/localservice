import {handleRequest} from '@core/controller';


class LocalServer {
  constructor() {}
  listen() {

  }
  close() {
    
  }
}

export const startServer = (requestHandler: (request: Request) => Response | Promise<Response>, opts: {port?: number} = {}) => {
  const serverUrl = `https://ls--${opts.port ? opts.port : 80}.stackblitz.io`;
  // Open the relay
  const iframe = document.createElement('iframe');
  iframe.src = `${serverUrl}/__commrelay__`;
  iframe.name = 'commRelay';
  iframe.id = 'commRelay';
  iframe.style.display = 'none';
  iframe.style.height = '1px';
  iframe.style.width = '1px';
  document.body.appendChild(iframe);

  console.log(`Server running at ${serverUrl}`)

  window.addEventListener('message', (e) => {
    if (e.origin === serverUrl) {
      handleRequest(e.data.payload, e.ports[0], requestHandler)
    }
    
  });

  return {
    url: serverUrl
  }
}
