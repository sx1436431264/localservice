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

const bundlesPath = 'dist/bundles/1/';

module.exports = [
// Consumer bundle 
{
  input: './src/packages/client-controller/index.ts',
  plugins,
  output: [{
    file: bundlesPath + 'localservice.js',
    format: 'esm'
  },
  {
    file: bundlesPath + 'localservice.umd.js',
    format: 'umd',
    name: 'LocalService'
  }]
},
// PWA-Server bundles
{
  input: './src/packages/pwa-server/relay/boot.ts',
  plugins,
  output: {
    file: bundlesPath + 'boot.js',
    format: 'esm'
  }
},
{
  input: './src/packages/pwa-server/relay/server.ts',
  plugins,
  output: {
    file: bundlesPath + 'server.js',
    format: 'esm'
  }
},
// Runtime check
{
  input: './src/packages/pwa-server/runtime/runtime-check.ts',
  plugins,
  output: {
    file: bundlesPath + 'runtime-check.js',
    format: 'esm'
  }
}]
