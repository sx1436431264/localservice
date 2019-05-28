import {handleRequest} from '@core/controller';


export const startServer = (requestHandler: (request: Request) => Response | Promise<Response>, opts: {slug?: string} = {}) => {
  const serverUrl = `https://${opts.slug ? opts.slug : Math.floor(Math.random() * 10000) + 1}.PWA_SERVER_BASE`;
  // Open the relay
  const iframe = document.createElement('iframe');
  iframe.src = `${serverUrl}/__commrelay__.html`;
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
