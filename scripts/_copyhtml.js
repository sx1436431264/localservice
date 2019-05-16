var fs = require("fs");
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

module.exports = function() {
  const fs = require('fs');

  copyAndMinify('./src/index.html', './dist/index.html');
}
