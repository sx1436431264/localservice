const rollup = require('rollup');

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
 
var params = {
    port: 3000, // Set the server port. Defaults to 8080.
    host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
    root: "./dist/server", 
    // Set root directory that's being served. Defaults to cwd.
    open: false, // When false, it won't load your browser by default.
    // ignore: 'scss,my/templates', // comma-separated string for paths to ignore
    file: "./dist/server/index.html", // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
    // wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
    mount: [['/index.html', './dist/server/index.html']], // Mount a directory to a route.
    logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
};
liveServer.start(params);


const copyHtml = require('./_copyhtml');
copyHtml()
