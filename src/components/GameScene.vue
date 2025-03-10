<script setup lang="ts">
import { useGameStore } from '../stores/gameStore'
import GameHistory from './GameHistory.vue'
import GameSaveLoad from './GameSaveLoad.vue'

const gameStore = useGameStore()

function makeChoice(choiceId: string) {
  gameStore.makeChoice(choiceId)
}

function resetGame() {
  gameStore.resetGame()
}
</script>

<template>
  <div class="game-scene">
    <div v-if="gameStore.isLoading" class="loading">
      <div class="loader"></div>
      <p class="mt-4">Генерация сюжета...</p>
    </div>
    
    <div v-else-if="gameStore.hasError" class="error">
      <h3 class="text-xl font-bold text-red-500 mb-2">Ошибка</h3>
      <p class="mb-4">{{ gameStore.errorMessage }}</p>
      <button 
        @click="resetGame"
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Начать заново
      </button>
    </div>
    
    <div v-else-if="gameStore.currentScene" class="scene">
      <div class="scene-text mb-6 leading-relaxed">
        {{ gameStore.currentScene.text }}
      </div>
      
      <div class="choices">
        <h3 class="text-lg font-bold mb-2">Ваши действия:</h3>
        <div 
          v-for="choice in gameStore.currentScene.choices" 
          :key="choice.id"
          class="choice mb-2"
        >
          <button 
            @click="makeChoice(choice.id)"
            class="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
          >
            {{ choice.text }}
          </button>
        </div>
      </div>
      
      <div class="mt-8 flex justify-between">
        <button 
          @click="resetGame"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Начать заново
        </button>
        
        <GameSaveLoad />
      </div>
      
      <GameHistory v-if="gameStore.history.length > 0" />
    </div>
  </div>
</template>

<style scoped>
.game-scene {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.scene-text {
  font-size: 1.1rem;
  white-space: pre-line;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.loader {
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 