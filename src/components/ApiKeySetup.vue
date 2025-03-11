<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()
const apiKey = ref('')

function saveApiKey() {
  if (apiKey.value.trim()) {
    gameStore.apiKey = apiKey.value.trim()
  }
}
</script>

<template>
  <div class="api-key-setup">
    <h2 class="text-xl font-bold mb-4">Настройка API ключа</h2>
    <p class="mb-4">
      Для работы игры необходим API ключ от OpenRouter.ai. 
      Вы можете получить его, зарегистрировавшись на сайте 
      <a href="https://openrouter.ai" target="_blank" class="text-blue-500 hover:underline">openrouter.ai</a>.
    </p>
    
    <div class="mb-4">
      <label for="api-key" class="block mb-2">API ключ:</label>
      <input 
        id="api-key"
        v-model="apiKey"
        type="password"
        class="w-full p-2 border rounded"
        placeholder="Введите ваш API ключ"
      />
    </div>
    
    <button 
      @click="saveApiKey"
      class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      :disabled="!apiKey.trim()"
    >
      Сохранить
    </button>
  </div>
</template>

<style scoped>
.api-key-setup {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}
</style> 