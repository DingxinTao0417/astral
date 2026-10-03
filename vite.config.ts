import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 默认 5173；预览工具同时开着另一个窗口时会通过 PORT 另外分配一个端口
  server: { port: Number(process.env.PORT) || 5173, strictPort: true },
  // npm run preview：在本地看打包后的成品
  preview: { port: Number(process.env.PORT) || 4173, strictPort: true },
  // 首屏光环是异步加载的，提前告诉 Vite，免得本地预览时第一次打开要刷新一下
  optimizeDeps: { include: ['three', 'vanta/src/_shaderBase.js'] },
  // 首屏光环用到的 three.js 单独打成一个包，只在桌面端按需加载，本身就有五百多 KB，不用每次打包都提醒
  build: { chunkSizeWarningLimit: 700 },
})
