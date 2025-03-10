<script setup lang="ts">
import { ref } from 'vue'

const isInfoOpen = ref(false)

function toggleInfo() {
  isInfoOpen.value = !isInfoOpen.value
}
</script>

<template>
  <div class="game-info">
    <button 
      @click="toggleInfo"
      class="info-toggle px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
    >
      {{ isInfoOpen ? 'Скрыть информацию' : 'Информация об игре' }}
    </button>
    
    <div v-if="isInfoOpen" class="info-content mt-4">
      <h3 class="text-lg font-bold mb-2">О игре:</h3>
      
      <p class="mb-2">
        Эта текстовая игра создана специально для тебя в качестве подарка на день рождения!
      </p>
      
      <p class="mb-2">
        В этой игре ты станешь главным героем - отцом по имени Александр, который возвращается с работы домой. 
        Твоя задача - найти своих сыновей и жену, чтобы отправиться с ними в ресторан.
        Каждый твой выбор влияет на развитие сюжета, а искусственный интеллект создает уникальную историю в реальном времени.
      </p>
      
      <h4 class="font-bold mt-4 mb-2">Как играть:</h4>
      
      <ol class="list-decimal pl-5 mb-4">
        <li class="mb-1">Читай описание сцены и выбирай действия</li>
        <li class="mb-1">Принимай решения, которые повлияют на развитие истории</li>
        <li class="mb-1">Наслаждайся уникальным сюжетом, созданным специально для тебя!</li>
      </ol>
      
      <p class="mb-2">
        Ты можешь сохранять свой прогресс и возвращаться к игре позже.
        Также доступна история твоих приключений, чтобы ты мог вспомнить свой путь.
      </p>
      
      <p class="mt-4 text-center font-bold">
        С днем рождения! Надеюсь, эта игра принесет тебе радость и незабываемые впечатления!
      </p>
    </div>
  </div>
</template>

<style scoped>
.game-info {
  margin-top: 2rem;
}

.info-content {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: #f8fafc;
}
</style> 