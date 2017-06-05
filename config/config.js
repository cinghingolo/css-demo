var path = require('path')
  , webpack = require('webpack')
  , merge = require('lodash').merge
  , config = require('./default.json')
  , AssetsPlugin = require('assets-webpack-plugin')

/**
 * Load correct config file
 * Config is _default_ overridden by _[environment]_
 */
if (process.env.MH_ENV ) {
  merge(config, require('./' + (process.env.MH_ENV  + '.json')))
}

/**
 * Webpack configuration
 */
var vendorFile = config.client.paths.scripts.src + 'vendor.js';
var skeletonRoot = config.client.basePaths.root;
var srcRoot = config.client.basePaths.src;
var scriptsRoot = config.client.scriptsRoot

var webpackConfig = {
  debug: true,
  entry: {
    main: path.resolve(scriptsRoot),
    // Add modules you want to load from vendors to this file
    vendor: path.resolve(vendorFile)
  },
  output: {
    filename: 'main.js'
  },
  loaders: [
    { test: /\.js$/, loader: 'babel?presets[]=es2015', exclude: /node_modules/}
  ],
  resolve: {
    // Makes sure the paths are relative to the root and not this file
    root: skeletonRoot,
    // Makes sure the compiler looks for modules in /src and node_modules
    modulesDirectories: [srcRoot, 'node_modules']
  },
  plugins: [
    // Makes sure the vendors are only imported once in this seperate file
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.min.js')
    // writes output to webpack-assets.json (especially important for fingerprint-URLs)
    , new AssetsPlugin({path: path.resolve('server')})
  ]
}

/**
 * SASS config
 */
var sassConfig = {
  includePaths: ['node_modules']
}

if (process.env.OPTIMIZE_BUILD === 'true'){
  // settings for webpack
  webpackConfig.debug = false
  webpackConfig.output.filename = 'main.min.[hash].js'
  webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin())
  webpackConfig.loaders.push({ test: /\.css$/, loader: "style!css" })

  // settings for SASS
  sassConfig.outputStyle = 'compressed'
}

/**
 * Export config
 */
config.client.webpack = webpackConfig
config.client.sass = sassConfig
module.exports = config

