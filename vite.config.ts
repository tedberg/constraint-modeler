import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

function suppressNodeModuleAnnotations(warning: any, warn: any) {
  if (warning.code === 'INVALID_ANNOTATION' && warning.id?.includes('node_modules')) return;
  warn(warning);
}

// Wraps all emitted CSS in a named @layer so consuming projects that also use
// Tailwind v4 can order this library's styles below their own @layer utilities.
// Uses closeBundle + fs because @tailwindcss/vite emits CSS after generateBundle.
function wrapCssInLayer(layerName: string, outDir: string) {
  const prefix = `@layer ${layerName}`;
  return {
    name: 'wrap-css-in-layer',
    apply: 'build' as const,
    closeBundle() {
      const { readdirSync, readFileSync, writeFileSync } = require('fs');
      const { join } = require('path');
      let files: string[];
      try { files = readdirSync(outDir); } catch { return; }
      for (const file of files) {
        if (!file.endsWith('.css')) continue;
        const path = join(outDir, file);
        const content = readFileSync(path, 'utf-8') as string;
        if (!content.startsWith(prefix)) {
          writeFileSync(path, `${prefix} {\n${content}\n}`);
        }
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return {
      plugins: [tailwindcss(), vue(), wrapCssInLayer('constraint-modeler', 'dist')],
      resolve: {
        alias: {
          '@': resolve(__dirname, 'src'),
        },
      },
      build: {
        lib: {
          entry: resolve(__dirname, 'src/components/entry.ts'),
          name: 'ConstraintModeler',
          formats: ['umd', 'es'],
          fileName: (format) =>
            format === 'umd'
              ? 'constraint-modeler.umd.js'
              : 'constraint-modeler.common.js',
        },
        rollupOptions: {
          external: ['vue', 'vue-router'],
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
