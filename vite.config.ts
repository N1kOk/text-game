import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  assetsInclude: ['**/*.txt'], // Включаем текстовые файлы как ассеты
  base: './', // Базовый путь для GitHub Pages
})
