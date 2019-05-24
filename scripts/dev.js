process.env['NODE_ENV'] = 'development';

const rollup = require('rollup');

const buildAssets = require('./_buildAssets');
buildAssets()

const httpsConfig = require('./_https');

const bundleconfig = require('./_bundleconfig.js');
const {inputOptions,outputOptions} = bundleconfig;

const watchOptions = {...inputOptions, output: outputOptions.output};
const watcher = rollup.watch(watchOptions);

watcher.on('event', event => {
  // event.code can be one of:
  //   START        — the watcher is (re)starting
  //   BUNDLE_START — building an individual bundle
  //   BUNDLE_END   — finished building a bundle
  //   END          — finished building all bundles
  //   ERROR        — encountered an error while bundling
  //   FATAL        — encountered an unrecoverable error
  console.log(event.code)
});

// stop watching
// watcher.close();

var liveServer = require("live-server");

// PWA Server (relay, runtime)
// CDN (relay, runtime, controller assets)
// Example client (controller logic)

const baseServer = {
  open: false,
  cors: true,
  https: httpsConfig,
  logLevel: 2
}

const PWAServer = {
  ...baseServer,
  port: 3000, // Used for local.stackblitz.io:3000
  root: "./dist/server", 
  file: "./index.html",
}

const CDN = {
  ...baseServer,
  port: 3001, // Used for local.stackblitz.io:3000
  root: "./dist/cdn"
}

liveServer.start(PWAServer);
liveServer.start(CDN);
