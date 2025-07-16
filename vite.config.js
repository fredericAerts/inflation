import path from 'node:path';
import viteCompressionPlugin from 'vite-plugin-compression';
import viteFullReloadPlugin from 'vite-plugin-full-reload';
import viteReactPlugin from '@vitejs/plugin-react';

import { defineConfig, loadEnv } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      viteReactPlugin(),
      viteStaticCopy({
        targets: [
          { src: 'src/static/*', dest: '' },
        ],
      }),
      viteCompressionPlugin({
        threshold: 256 * 8,
      }),
      viteFullReloadPlugin([
        'server/views/index.ejs',
      ]),
    ],
    build: {
      manifest: true,
      rollupOptions: {
        input: './src/js/index.jsx',
      },
      sourcemap: env.NODE_ENV === 'development',
    },
    resolve: {
      alias: {
        '@App': path.resolve(__dirname, 'src/js/App'),
        '@library': path.resolve(__dirname, 'src/js/library'),
        '@services': path.resolve(__dirname, 'src/js/services'),
      },
      extensions: ['.js', '.jsx'],
    },
    optimizeDeps: {
      esbuildOptions: {
        jsx: 'automatic',
      },
    },
  };
});
