<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()
const savedGames = ref<{ name: string, date: string, data: string }[]>([])
const saveName = ref('')
const showSaveDialog = ref(false)
const showLoadDialog = ref(false)

// Загружаем сохраненные игры при монтировании компонента
function loadSavedGames() {
  try {
    const savedGamesStr = localStorage.getItem('textGameSaves')
    if (savedGamesStr) {
      savedGames.value = JSON.parse(savedGamesStr)
    }
  } catch (error) {
    console.error('Ошибка при загрузке сохраненных игр:', error)
  }
}

// Сохраняем игру
function saveGame() {
  if (!saveName.value.trim()) return
  
  try {
    const gameData = {
      apiKey: gameStore.apiKey,
      currentScene: gameStore.currentScene,
      history: gameStore.history,
      gameTitle: gameStore.gameTitle
    }
    
    const newSave = {
      name: saveName.value.trim(),
      date: new Date().toLocaleString(),
      data: JSON.stringify(gameData)
    }
    
    // Проверяем, существует ли сохранение с таким именем
    const existingIndex = savedGames.value.findIndex(save => save.name === newSave.name)
    if (existingIndex !== -1) {
      // Заменяем существующее сохранение
      savedGames.value[existingIndex] = newSave
    } else {
      // Добавляем новое сохранение
      savedGames.value.push(newSave)
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('textGameSaves', JSON.stringify(savedGames.value))
    
    showSaveDialog.value = false
    saveName.value = ''
  } catch (error) {
    console.error('Ошибка при сохранении игры:', error)
  }
}

// Загружаем игру
function loadGame(saveIndex: number) {
  try {
    const save = savedGames.value[saveIndex]
    if (!save) return
    
    const gameData = JSON.parse(save.data)
    
    // Загружаем данные в хранилище
    gameStore.setApiKey(gameData.apiKey)
    gameStore.loadGame(gameData.gameTitle, gameData.currentScene, gameData.history)
    
    showLoadDialog.value = false
  } catch (error) {
    console.error('Ошибка при загрузке игры:', error)
  }
}

// Удаляем сохранение
function deleteSave(saveIndex: number) {
  savedGames.value.splice(saveIndex, 1)
  localStorage.setItem('textGameSaves', JSON.stringify(savedGames.value))
}

// Загружаем сохранения при монтировании компонента
loadSavedGames()
</script>

<template>
  <div class="game-save-load">
    <div class="flex space-x-2">
      <button 
        @click="showSaveDialog = true"
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Сохранить
      </button>
      
      <button 
        @click="showLoadDialog = true; loadSavedGames()"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        :disabled="savedGames.length === 0"
      >
        Загрузить
      </button>
    </div>
    
    <!-- Диалог сохранения -->
    <div v-if="showSaveDialog" class="dialog-overlay">
      <div class="dialog-content">
        <h3 class="text-xl font-bold mb-4">Сохранить игру</h3>
        
        <div class="mb-4">
          <label for="save-name" class="block mb-2">Название сохранения:</label>
          <input 
            id="save-name"
            v-model="saveName"
            type="text"
            class="w-full p-2 border rounded"
            placeholder="Введите название сохранения"
          />
        </div>
        
        <div class="flex justify-end space-x-2">
          <button 
            @click="showSaveDialog = false"
            class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Отмена
          </button>
          
          <button 
            @click="saveGame"
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            :disabled="!saveName.trim()"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
    
    <!-- Диалог загрузки -->
    <div v-if="showLoadDialog" class="dialog-overlay">
      <div class="dialog-content">
        <h3 class="text-xl font-bold mb-4">Загрузить игру</h3>
        
        <div v-if="savedGames.length === 0" class="text-gray-500 mb-4">
          Нет сохраненных игр
        </div>
        
        <div v-else class="saved-games mb-4">
          <div 
            v-for="(save, index) in savedGames" 
            :key="index"
            class="saved-game p-3 border rounded mb-2 flex justify-between items-center"
          >
            <div>
              <div class="font-bold">{{ save.name }}</div>
              <div class="text-sm text-gray-500">{{ save.date }}</div>
            </div>
            
            <div class="flex space-x-2">
              <button 
                @click="loadGame(index)"
                class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Загрузить
              </button>
              
              <button 
                @click="deleteSave(index)"
                class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end">
          <button 
            @click="showLoadDialog = false"
            class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.dialog-content {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.saved-games {
  max-height: 300px;
  overflow-y: auto;
}

.saved-game {
  transition: background-color 0.2s;
}

.saved-game:hover {
  background-color: #f1f5f9;
}
</style> 