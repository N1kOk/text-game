<script setup lang="ts">
import { useGameStore } from './stores/gameStore'
import GameSetup from './components/GameSetup.vue'
import GameScene from './components/GameScene.vue'
import GameInfo from './components/GameInfo.vue'

const gameStore = useGameStore()
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1 class="text-2xl font-bold">{{ gameStore.gameTitle }}</h1>
    </header>
    
    <main class="app-content">
      <template v-if="!gameStore.gameStarted">
        <GameSetup />
        <GameInfo class="mt-8" />
      </template>
      
      <template v-else>
        <GameScene />
      </template>
    </main>
    
    <footer class="app-footer">
      <p class="text-sm text-gray-500">
        Создано с любовью в качестве подарка на день рождения
      </p>
    </footer>
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

.app-header {
  background-color: #4a5568;
  color: white;
  padding: 1rem;
  text-align: center;
}

.app-content {
  flex: 1;
  padding: 1rem;
}

.app-footer {
  background-color: #f1f1f1;
  padding: 1rem;
  text-align: center;
  margin-top: auto;
}
</style>
