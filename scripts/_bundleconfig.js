// rollup.config.js
const typescript = require('rollup-plugin-typescript');
const terser = require("rollup-plugin-terser").terser;

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
    terser()
  ]
},
outputOptions: {
  output: {
    file: 'compiled.js',
    format: 'esm'
  }
}
}
