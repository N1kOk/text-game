<script setup lang="ts">
import { useGameStore } from './stores/gameStore'
import GameScene from './components/GameScene.vue'
import { onMounted } from 'vue'

const gameStore = useGameStore()

// Автоматически начать игру при загрузке приложения
onMounted(() => {
  const gameTitle = 'Волшебное Приключение'
  gameStore.startGame(gameTitle)
})
</script>

<template>
  <div class="app">
    <main class="app-content">
      <div class="content-container">
        <GameScene />
      </div>
    </main>
  </div>
</template>

<style>
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f9f9f9;
  margin: 0;
  padding: 0;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-content {
  flex: 1;
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.content-container {
  max-width: 800px;
  width: 100%;
}

@media (max-width: 850px) {
  .content-container {
    max-width: 100%;
  }
}
</style>
