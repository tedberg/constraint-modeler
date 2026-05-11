import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return {
      plugins: [vue(), vueJsx()],
      resolve: {
        alias: {
          '@': resolve(__dirname, 'src'),
        },
      },
      build: {
        lib: {
          entry: resolve(__dirname, 'src/components/entry.js'),
          name: 'ConstraintModeler',
          formats: ['umd', 'es'],
          fileName: (format) =>
            format === 'umd'
              ? 'constraint-modeler.umd.js'
              : 'constraint-modeler.common.js',
        },
        rollupOptions: {
          external: ['vue', 'vue-router', 'bootstrap-vue-next', 'axios'],
          output: {
            exports: 'named',
            globals: {
              vue: 'Vue',
              'bootstrap-vue-next': 'BootstrapVueNext',
              axios: 'axios',
            },
          },
        },
        outDir: 'dist',
        cssCodeSplit: false,
      },
    };
  }

  return {
    plugins: [vue(), vueJsx()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    base: process.env.NODE_ENV === 'production' ? '/constraint-modeler/' : '/',
    server: {
      port: 8080,
      proxy: {
        '/api': {
          target: 'http://localhost:8088',
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      outDir: 'dist',
    },
  };
});
