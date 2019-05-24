// rollup.config.js
const typescript = require('rollup-plugin-typescript');
const terser = require("rollup-plugin-terser").terser;
const replace = require('rollup-plugin-replace');
const env = require('./scripts/_env');

const plugins = [
  typescript(),
  terser(),
  replace(env)
];

module.exports = [{
  input: './src/packages/client-controller/index.ts',
  plugins,
  output: [{
    file: 'dist/bundles/localservice.js',
    format: 'esm'
  },
  {
    file: 'dist/bundles/localservice.umd.js',
    format: 'umd',
    name: 'LocalService'
  }]
},
{
  input: './src/packages/pwa-server/relay/server.ts',
  plugins,
  output: {
    file: 'dist/bundles/server.js',
    format: 'esm'
  }
}]
