const path = require('path');

const outDir = path.resolve(__dirname, 'dist');
console.log('outDir', outDir);

module.exports = {
  css: {
    sourceMap: true
  },

  baseUrl: '/',
  outputDir: 'dist',
  assetsDir: 'assets',
  runtimeCompiler: undefined,
  productionSourceMap: undefined,
  parallel: undefined,

  // Allows for source scanning the listed entries from node-modules, which is ignored by default.
  // Used when making granular imports from these libraries.
  transpileDependencies: [
    /bootstrap-vue/
  ],

  pluginOptions: {
    testAttrs: {
      // you can enable and disable it yourself, i.e. with an environment variable:
      enabled: process.env.development,
      // you can also define which `data-` attributes should should be removed.
      attrs: ['test'] // default: removes `data-test="..."`
    }
  },

  devServer: {
    contentBase: [outDir],
    proxy: {
      // rewrite strips /api from the url that the server sees.
      '/api': {
        target: 'http://localhost:8088',
        pathRewrite: { '^/api': '' }
      }
    }
  }

};
