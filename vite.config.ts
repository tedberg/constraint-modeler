import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

function suppressNodeModuleAnnotations(warning: any, warn: any) {
  if (warning.code === 'INVALID_ANNOTATION' && warning.id?.includes('node_modules')) return;
  warn(warning);
}

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return {
      plugins: [
        tailwindcss(),
        vue(),
      ],
      resolve: {
        alias: {
          '@': resolve(__dirname, 'src'),
        },
      },
      publicDir: false,
      build: {
        lib: {
          entry: resolve(__dirname, 'src/components/entry.ts'),
          name: 'ConstraintModeler',
          formats: ['umd', 'es'],
          fileName: (format) =>
            format === 'umd' ? 'constraint-modeler.umd.js' : 'constraint-modeler.es.js',
        },
        rollupOptions: {
          external: ['vue'],
          onwarn: suppressNodeModuleAnnotations,
          output: {
            exports: 'named',
            globals: {
              vue: 'Vue',
            },
          },
        },
        outDir: 'dist',
        cssCodeSplit: false,
      },
    };
  }

  return {
    plugins: [tailwindcss(), vue()],
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
      rollupOptions: {
        onwarn: suppressNodeModuleAnnotations,
      },
    },
  };
});
