process.env['NODE_ENV'] = 'production';

const rollup = require('rollup');

const bundleconfig = require('./_bundleconfig.js');
const {inputOptions,outputOptions} = bundleconfig;


async function build() {
  // create a bundle
  const bundle = await rollup.rollup(inputOptions);

  // generate code
  await bundle.generate(outputOptions);

  // or write the bundle to disk
  await bundle.write(outputOptions);
}

build();
