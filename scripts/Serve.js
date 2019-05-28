process.env['NODE_ENV'] = 'development';

const httpsConfig = require('./_https');

var liveServer = require("live-server");

const baseServer = {
  open: false,
  cors: true,
  https: httpsConfig,
  logLevel: 2
}

const PWAServer = {
  ...baseServer,
  port: 3000, // Used for local.stackblitz.io:3000
  root: "./dist/pwa-server", 
  file: "./index.html",
}

const CDN = {
  ...baseServer,
  port: 3001, // Used for local.stackblitz.io:3000
  root: "./dist/bundles"
}

const Example = {
  ...baseServer,
  port: 3002, // Used for local.stackblitz.io:3000
  root: "./test"
}

liveServer.start(PWAServer);
liveServer.start(CDN);
liveServer.start(Example);
