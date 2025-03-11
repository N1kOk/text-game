<script setup lang="ts">
import { useGameStore } from '../stores/gameStore'
import { ref } from 'vue'

const gameStore = useGameStore()
const isSpeaking = ref(false)

function makeChoice(choiceId: string) {
  gameStore.makeChoice(choiceId)
}

function speakText() {
  if (!gameStore.currentScene) return;
  
  // Остановить предыдущее озвучивание, если оно есть
  if (isSpeaking.value) {
    window.speechSynthesis.cancel();
    isSpeaking.value = false;
    return;
  }
  
  const text = gameStore.currentScene.text;
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Настройка голоса (русский)
  const voices = window.speechSynthesis.getVoices();
  const russianVoice = voices.find(voice => voice.lang.includes('ru'));
  if (russianVoice) {
    utterance.voice = russianVoice;
  }
  
  utterance.lang = 'ru-RU';
  utterance.rate = 2; // Немного медленнее для лучшего понимания
  
  // Обработчики событий
  utterance.onstart = () => {
    isSpeaking.value = true;
  };
  
  utterance.onend = () => {
    isSpeaking.value = false;
  };
  
  utterance.onerror = () => {
    isSpeaking.value = false;
  };
  
  window.speechSynthesis.speak(utterance);
}
</script>

<template>
  <div class="game-scene">
    <div class="festive-decoration top-left"></div>
    <div class="festive-decoration top-right"></div>
    <div class="festive-decoration bottom-left"></div>
    <div class="festive-decoration bottom-right"></div>
    
    <header class="game-header">
      <div class="header-decoration left"></div>
      <h1 class="game-title">Волшебное Приключение</h1>
      <div class="header-decoration right"></div>
    </header>
    
    <div v-if="gameStore.hasError" class="error-message p-4 bg-red-100 border border-red-300 rounded mb-4">
      <h3 class="text-xl font-bold text-red-500 mb-2">Ошибка</h3>
      <p class="mb-4">{{ gameStore.errorMessage }}</p>
    </div>
    
    <div v-else-if="gameStore.currentScene" class="scene" :class="{ 'loading-state': gameStore.isLoading }">
      <div class="scene-content">
        <div class="scene-text-container">
          <div class="scene-text mb-6 whitespace-pre-line">
            {{ gameStore.currentScene.text }}
          </div>
          <button 
            @click="speakText" 
            class="speak-button"
            :class="{ 'speaking': isSpeaking }"
            :title="isSpeaking ? 'Остановить' : 'Прочитать вслух'"
          >
            <span class="speak-icon">{{ isSpeaking ? '🔊' : '🔈' }}</span>
          </button>
        </div>
        
        <div class="choices">
          <div 
            v-for="choice in gameStore.currentScene.choices" 
            :key="choice.id"
            class="choice-item"
          >
            <button 
              @click="makeChoice(choice.id)"
              class="choice-button"
              :disabled="gameStore.isLoading"
            >
              <span class="choice-icon">◇</span>
              {{ choice.text }}
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="gameStore.isLoading" class="loading-indicator">
        <div class="loading-spinner"></div>
      </div>
    </div>
    
    <div v-else class="loading-initial">
      <div class="loading-spinner festive"></div>
      <p class="mt-4 text-lg">Загрузка волшебства...</p>
    </div>
    
    <footer class="game-footer">
      <div class="footer-decoration"></div>
      <p class="footer-text">Подарок любимому отцу</p>
      <div class="footer-decoration"></div>
    </footer>
  </div>
</template>

<style scoped>
.game-scene {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  padding: 2rem;
  background-color: #fafafa;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.game-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
  position: relative;
  padding: 0.5rem 0;
  z-index: 1;
}

.game-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #6a11cb;
  text-align: center;
  position: relative;
  padding: 0 1rem;
  background: linear-gradient(90deg, #6a11cb, #2575fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(106, 17, 203, 0.1);
}

.header-decoration {
  height: 2px;
  flex-grow: 1;
  background: linear-gradient(90deg, transparent, #ffdc73, transparent);
  position: relative;
  max-width: 120px;
}

.header-decoration.left::before {
  left: 10%;
}

.header-decoration.left::after {
  left: 70%;
}

.header-decoration.right::before {
  right: 70%;
}

.header-decoration.right::after {
  right: 10%;
}

.festive-decoration {
  position: absolute;
  width: 30px;
  height: 30px;
  background-image: radial-gradient(circle, #ffdc73 20%, transparent 21%), 
                    radial-gradient(circle, #ffdc73 20%, transparent 21%);
  background-size: 12px 12px;
  background-position: 0 0, 6px 6px;
  opacity: 0.4;
  z-index: 0;
}

.top-left {
  top: 10px;
  left: 10px;
}

.top-right {
  top: 10px;
  right: 10px;
}

.bottom-left {
  bottom: 10px;
  left: 10px;
}

.bottom-right {
  bottom: 10px;
  right: 10px;
}

.scene {
  position: relative;
  transition: opacity 0.3s;
  z-index: 1;
}

.scene.loading-state .scene-content {
  opacity: 0.6;
  pointer-events: none;
}

.scene-text-container {
  position: relative;
}

.scene-text {
  font-size: 1.1rem;
  line-height: 1.6;
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  border-left: 3px solid #ffdc73;
}

.speak-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s, transform 0.2s;
  padding: 5px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.speak-button:hover {
  opacity: 1;
  background-color: rgba(255, 220, 115, 0.2);
}

.speak-button.speaking {
  opacity: 1;
  animation: pulse 2s infinite;
}

.speak-icon {
  display: inline-block;
}

.choices {
  margin-top: 1.5rem;
  padding: 0 0.5rem;
}

.choice-item {
  margin-bottom: 0.75rem;
}

.choice-button {
  background: none;
  border: none;
  color: #6a11cb;
  font-size: 1.05rem;
  text-align: left;
  padding: 0.5rem 0;
  cursor: pointer;
  transition: color 0.2s, transform 0.2s;
  display: inline-flex;
  align-items: center;
}

.choice-button:not(:disabled):hover {
  color: #2575fc;
  transform: translateX(5px);
}

.choice-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.choice-icon {
  margin-right: 0.5rem;
  color: #ffdc73;
  transition: transform 0.2s;
}

.choice-button:hover .choice-icon {
  transform: rotate(45deg);
}

.loading-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  z-index: 10;
  pointer-events: none;
}

.loading-initial {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4rem 0;
  min-height: 200px;
  z-index: 1;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;
}

.loading-spinner.festive {
  border-top-color: #ffdc73;
  border-right-color: #6a11cb;
  border-bottom-color: #2575fc;
  border-left-color: rgba(0, 0, 0, 0.1);
}

.game-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
  padding: 0.5rem 0;
  position: relative;
  z-index: 1;
}

.footer-text {
  font-size: 0.9rem;
  color: #6a11cb;
  text-align: center;
  padding: 0 1rem;
  text-transform: uppercase;
  font-style: italic;
}

.footer-decoration {
  height: 1px;
  flex-grow: 1;
  background: linear-gradient(90deg, transparent, rgba(106, 17, 203, 0.2), transparent);
  max-width: 80px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

@media (max-width: 768px) {
  .game-scene {
    padding: 1rem;
  }
  
  .scene-text {
    padding: 1rem;
  }
  
  .game-title {
    font-size: 1.5rem;
  }
  
  .header-decoration,
  .footer-decoration {
    max-width: 60px;
  }
  
  .speak-button {
    bottom: 5px;
    right: 5px;
    font-size: 1.2rem;
  }
}
</style> 