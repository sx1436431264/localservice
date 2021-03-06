var fs = require("fs");
var rimraf = require('rimraf');
var minify = require('html-minifier').minify;
var vars = require('./_env');

function copyAndMinifyHTML(path, destination) {
  var contents = fs.readFileSync(path, 'utf8');
  var result = minify(contents, {
    collapseWhitespace: true,
    minifyCSS: true
  });

  Object.keys(vars).forEach((key) => {
    result = result.replace(new RegExp(key,'g'), vars[key]);
  })

  fs.writeFileSync(destination, result, (err) => {
    if (err) console.log(err);
  });
}

function scaffoldDirs() {
  // Reset the dist dir
  rimraf.sync('./dist');
  fs.mkdirSync('./dist');

  function ensureDirExists(path) {
    if (fs.existsSync(path)) {
      return true;
    }
    fs.mkdirSync(path, { recursive: true });
  }
  
  ensureDirExists('./dist/bundles');
  ensureDirExists('./dist/pwa-server');
  ensureDirExists('./dist/cdn');
  ensureDirExists('./dist/example');
}


  scaffoldDirs();

  // Generate PWA server.
  copyAndMinifyHTML('./src/packages/pwa-server/runtime/index.html', './dist/pwa-server/index.html');
  copyAndMinifyHTML('./src/packages/pwa-server/relay/__commrelay__.html', './dist/pwa-server/__commrelay__.html');
  // Create stub serviceworker.
  fs.writeFileSync('./dist/pwa-server/server.js', `importScripts('${vars.LS_CDN_URL}/server.js')`, (err) => {
    if (err) console.log(err);
  });
