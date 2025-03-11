<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import initialPromptText from '../prompts/initial-prompt.txt?raw'

const gameStore = useGameStore()
const gameTitle = ref('Семейное приключение')
const initialPrompt = ref(initialPromptText)

const genres = [
  'Приключения',
  'Фэнтези',
  'Научная фантастика',
  'Детектив',
  'Хоррор',
  'Исторический',
  'Постапокалипсис'
]

const selectedGenre = ref(genres[0])

function generateInitialPrompt() {
  // Сохраняем оригинальный запрос
  const originalPrompt = initialPrompt.value
  
  // Добавляем информацию о жанре, если пользователь выбрал другой жанр
  if (selectedGenre.value !== 'Приключения') {
    initialPrompt.value = `${originalPrompt} Создай историю в жанре ${selectedGenre.value}.`
  } else {
    initialPrompt.value = originalPrompt
  }
}

function startGame() {
  if (gameTitle.value.trim() && initialPrompt.value.trim()) {
    gameStore.startGame(gameTitle.value)
  }
}

// Автоматически начать игру при монтировании компонента
onMounted(() => {
  // Даем небольшую задержку, чтобы пользователь мог увидеть настройки
  setTimeout(() => {
    startGame()
  }, 500)
})
</script>

<template>
  <div class="game-setup">
    <h2 class="text-xl font-bold mb-4">Настройка игры</h2>
    
    <div class="mb-4">
      <label for="game-title" class="block mb-2">Название игры:</label>
      <input 
        id="game-title"
        v-model="gameTitle"
        type="text"
        class="w-full p-2 border rounded"
        placeholder="Введите название игры"
      />
    </div>
    
    <div class="mb-4">
      <label for="game-genre" class="block mb-2">Жанр игры:</label>
      <select 
        id="game-genre"
        v-model="selectedGenre"
        class="w-full p-2 border rounded"
        @change="generateInitialPrompt"
      >
        <option v-for="genre in genres" :key="genre" :value="genre">
          {{ genre }}
        </option>
      </select>
    </div>
    
    <div class="mb-4">
      <label for="initial-prompt" class="block mb-2">Начальный запрос:</label>
      <textarea 
        id="initial-prompt"
        v-model="initialPrompt"
        class="w-full p-2 border rounded h-32"
        placeholder="Введите начальный запрос для генерации сюжета"
      ></textarea>
    </div>
    
    <button 
      @click="startGame"
      class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      :disabled="!gameTitle.trim() || !initialPrompt.trim()"
    >
      Начать игру
    </button>
  </div>
</template>

<style scoped>
.game-setup {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}
</style> 