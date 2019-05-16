// rollup.config.js
const typescript = require('rollup-plugin-typescript');
const terser = require("rollup-plugin-terser").terser;

module.exports = [{
  input: './src/index.ts',
  plugins: [
    typescript(),
    terser()
  ],
  output: {
    file: 'compiled.js',
    format: 'esm'
  }
}]
