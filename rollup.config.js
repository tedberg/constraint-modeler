// rollup.config.js
import vue from 'rollup-plugin-vue'; // Handle .vue SFC files
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify-es';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));

const config = {
  input: 'src/components/entry.js',  // Path relative to package.json
  output: {
    name: 'ConstraintModeler',
    exports: 'named'
  },
  external: [ 'axios', 'vue', 'bootstrap-vue' ],
  plugins: [
    vue({
      css: true, // Dynamically inject css as a <style> tag
      compileTemplate: true // Explicitly convert template to render function
    }),
    babel() // Transpile to ES5
  ]
};

// Only minify browser (iife) version
if (argv.format === 'iife') {
  config.plugins.push(uglify());
}

export default config;
