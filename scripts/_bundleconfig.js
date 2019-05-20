const env = require('./_env');

const typescript = require('rollup-plugin-typescript');
const terser = require("rollup-plugin-terser").terser;
const replace = require('rollup-plugin-replace');

const bundles = [
  {
    input: ''
  }
]

module.exports = {
  inputOptions: {
  input: './src/index.ts',
  plugins: [
    typescript(),
    terser(),
    replace({
      ...env
    })
  ]
},
outputOptions: {
  output: {
    file: 'compiled.js',
    format: 'esm'
  }
}
}
