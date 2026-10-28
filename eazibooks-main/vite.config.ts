import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [laravel({ input: ['src/main.tsx'], refresh: true }), react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: [
      { find: /^(.+)@(?:\d+\.\d+\.\d+(?:-[\w.-]+)?|\*)$/, replacement: '$1' },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
  build: { target: 'esnext' },
  server: { host: '127.0.0.1', port: 3000, strictPort: true },
});