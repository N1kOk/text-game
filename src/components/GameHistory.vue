<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()
const isHistoryOpen = ref(false)

function toggleHistory() {
  isHistoryOpen.value = !isHistoryOpen.value
}
</script>

<template>
  <div class="game-history">
    <button 
      @click="toggleHistory"
      class="history-toggle px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      {{ isHistoryOpen ? 'Скрыть историю' : 'Показать историю' }}
    </button>
    
    <div v-if="isHistoryOpen" class="history-content mt-4">
      <h3 class="text-lg font-bold mb-2">История приключения:</h3>
      
      <div v-if="gameStore.history.length === 0" class="text-gray-500">
        История пуста
      </div>
      
      <div v-else class="history-items">
        <div 
          v-for="(scene, index) in gameStore.history" 
          :key="scene.id"
          class="history-item mb-4 p-4 border-l-4 border-gray-300"
        >
          <h4 class="font-bold mb-2">Сцена {{ index + 1 }}</h4>
          <p class="mb-2">{{ scene.text }}</p>
          
          <div v-if="index < gameStore.history.length - 1" class="chosen-action mt-2 text-blue-600">
            <span class="font-bold">Выбрано:</span> 
            {{ gameStore.history[index + 1].choices.find(c => c.id === scene.chosenChoiceId)?.text || 'Неизвестное действие' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-history {
  margin-top: 2rem;
}

.history-content {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: #f8fafc;
}

.history-item {
  transition: background-color 0.2s;
}

.history-item:hover {
  background-color: #f1f5f9;
}
</style> 