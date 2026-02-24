import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // 移动端性能优化
    reportCompressedSize: false,
    chunkSizeWarningLimit: 600,
    // CSS代码分割
    cssCodeSplit: true,
    // 性能优化
    rollupOptions: {
      output: {
        manualChunks: {
          'ol': ['ol'],
          'vue-router': ['vue-router'],
          'vendor': ['axios', 'pinia']
        }
      }
    },
    // 压缩优化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // 移动端优化 - 支持iOS安全区域
  define: {
    __VITE_APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
  }
})
