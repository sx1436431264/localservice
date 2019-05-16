var fs = require("fs");
var path = require('path');
var minify = require('html-minifier').minify;

function copyAndMinify(path, destination) {
  var contents = fs.readFileSync(path, 'utf8');
  var result = minify(contents, {
    collapseWhitespace: true,
    minifyCSS: true
  });

  fs.writeFileSync(destination, result, (err) => {
    if (err) console.log(err);
  });
}

// function ensurePathExists(filePath) {
//   var dirname = path.dirname(filePath);
//   console.log(dirname)
//   if (fs.existsSync(dirname)) {
//     return true;
//   }
//   fs.mkdirSync(dirname, { recursive: true });
// }

function scaffoldDirs() {
  function ensureDirExists(path) {
    if (fs.existsSync(path)) {
      return true;
    }
    fs.mkdirSync(path, { recursive: true });
  }
  
  ensureDirExists('./dist/server');
}

module.exports = function() {
  const fs = require('fs');
  scaffoldDirs();
  copyAndMinify('./src/index.html', './dist/server/index.html');
}
