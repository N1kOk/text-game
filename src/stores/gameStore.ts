import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import systemPrompt from '../prompts/system-prompt.txt?raw'
import userChoicePromptTemplate from '../prompts/user-choice-prompt.txt?raw'
import initialPromptText from '../prompts/initial-prompt.txt?raw'

export interface GameChoice {
  id: string
  text: string
}

export interface GameScene {
  id: string
  text: string
  choices: GameChoice[]
  chosenChoiceId?: string
}

export const useGameStore = defineStore('game', () => {
  // Состояние
  const apiKey = ref('sk-aitunnel-PSlhtaVsi7TaBSvokHmiCH6MfGXcrjX1')
  const currentScene = ref<GameScene | null>(null)
  const history = ref<GameScene[]>([])
  const isLoading = ref(false)
  const hasError = ref(false)
  const errorMessage = ref('')
  const gameTitle = ref('Текстовое приключение')
  const gameStarted = ref(false)
  
  // Геттеры
  const isGameReady = computed(() => true)
  
  // Действия
  function startGame(title: string) {
    gameTitle.value = title
    gameStarted.value = true
    generateScene("Начать игру")
  }
  
  async function generateScene(prompt: string, retryCount = 0) {
    if (!apiKey.value) {
      hasError.value = true
      errorMessage.value = 'API ключ не установлен'
      return
    }
    
    isLoading.value = true
    hasError.value = false
    errorMessage.value = ''
    
    try {
      // Формируем историю сообщений
      const messages = [
        { 
          role: 'system', 
          content: systemPrompt
        },
        {
          role: 'user',
          content: initialPromptText
        }
      ]
      
      // Добавляем историю предыдущих сцен и выборов
      if (history.value.length > 0) {
        for (let i = 0; i < history.value.length; i++) {
          const scene = history.value[i]
          
          // Добавляем ответ ассистента (сцену)
          let sceneText = scene.text + "\n\nВАРИАНТЫ:\n";
          scene.choices.forEach((choice, index) => {
            sceneText += `${index + 1}. ${choice.text}\n`;
          });
          
          messages.push({
            role: 'assistant',
            content: sceneText
          })
          
          // Если был сделан выбор в этой сцене, добавляем его
          if (scene.chosenChoiceId) {
            const choice = scene.choices.find(c => c.id === scene.chosenChoiceId)
            if (choice) {
              messages.push({
                role: 'user',
                content: `Игрок выбрал: "${choice.text}"`
              })
            }
          }
        }
      }
      
      // Добавляем текущий запрос (всегда)
      messages.push({ role: 'user', content: prompt })
      
      const response = await axios.post(
        'https://api.aitunnel.ru/v1/chat/completions',
        {
          model: 'gemini-2.0-flash-lite-001',
          messages: messages,
          temperature: 0.75,
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey.value}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      const content = response.data.choices[0].message.content
      
      // Парсим ответ в более простом формате
      const parts = content.split('ВАРИАНТЫ:')
      
      if (parts.length >= 2) {
        // Очищаем текст от лишних пробелов и переносов строк
        const sceneText = parts[0].trim()
        const choicesText = parts[1].trim()
        
        // Парсим варианты выбора с учетом русской пунктуации
        const choiceLines = choicesText.split('\n').filter((line: string) => line.trim() !== '')
        const choices: GameChoice[] = []
        
        // Обрабатываем только первые 3 варианта, если их больше
        const maxChoices = 3
        const linesToProcess = choiceLines.length > maxChoices ? choiceLines.slice(0, maxChoices) : choiceLines
        
        linesToProcess.forEach((line: string, index: number) => {
          // Улучшенный регулярный паттерн для русского текста
          const match = line.match(/^\d+[\.\)]\s*(.+)$/)
          if (match) {
            choices.push({
              id: (index + 1).toString(),
              text: truncateOption(match[1].trim())
            })
          } else {
            // Если формат не соответствует ожидаемому, используем всю строку
            choices.push({
              id: (index + 1).toString(),
              text: truncateOption(line.trim())
            })
          }
        })
        
        // Если вариантов меньше 3, добавляем стандартные
        if (choices.length < 3) {
          const defaultChoices = [
            { id: '1', text: 'Продолжить' },
            { id: '2', text: 'Отвлечься на что-то другое' },
            { id: '3', text: 'Сделать что-то необычное' }
          ]
          
          for (let i = choices.length; i < 3; i++) {
            choices.push(defaultChoices[i])
          }
        }
        
        const newScene: GameScene = {
          id: Date.now().toString(),
          text: sceneText,
          choices: choices,
          chosenChoiceId: undefined
        }
        
        currentScene.value = newScene
        history.value.push(newScene)
      } else {
        // Если формат не соответствует ожидаемому, пытаемся извлечь хотя бы текст
        const sceneText = content.trim()
        
        const newScene: GameScene = {
          id: Date.now().toString(),
          text: sceneText,
          choices: [
            { id: '1', text: 'Продолжить' },
            { id: '2', text: 'Отвлечься на что-то другое' },
            { id: '3', text: 'Сделать что-то необычное' }
          ],
          chosenChoiceId: undefined
        }
        
        currentScene.value = newScene
        history.value.push(newScene)
      }
    } catch (error: any) {
      // Проверяем, является ли ошибка сетевой
      const isNetworkError = 
        !error.response || // Нет ответа от сервера
        error.code === 'ECONNABORTED' || // Таймаут соединения
        error.message?.includes('Network Error') || // Сообщение об ошибке сети
        (error.response && (error.response.status === 0 || // Статус 0 обычно означает проблемы с сетью
                           error.response.status >= 500)); // Серверные ошибки
      
      const maxRetries = 3;
      
      if (isNetworkError && retryCount < maxRetries) {
        // Увеличиваем счетчик попыток
        const nextRetryCount = retryCount + 1;
        
        // Устанавливаем сообщение о повторной попытке
        errorMessage.value = `Ошибка сети. Повторная попытка ${nextRetryCount} из ${maxRetries}...`;
        
        // Ждем перед повторной попыткой (экспоненциальная задержка)
        const delay = 1000
        
        setTimeout(() => {
          // Повторяем запрос
          generateScene(prompt, nextRetryCount);
        }, delay);
        
        return;
      }
      
      // Если это не сетевая ошибка или превышено количество попыток
      hasError.value = true
      errorMessage.value = error instanceof Error ? error.message : 'Произошла ошибка при генерации сцены'
      console.error('Error generating scene:', error)
    } finally {
      // Убираем индикатор загрузки только если это не повторная попытка
      if (retryCount === 0 || hasError.value) {
        isLoading.value = false
      }
    }
  }
  
  function makeChoice(choiceId: string) {
    if (!currentScene.value) return
    
    const choice = currentScene.value.choices.find(c => c.id === choiceId)
    if (!choice) return
    
    // Сохраняем выбранный вариант
    currentScene.value.chosenChoiceId = choiceId
    
    // Используем шаблон промпта, заменяя {choice} на текст выбора
    const prompt = userChoicePromptTemplate.replace('{choice}', choice.text)
    generateScene(prompt)
  }
  
  function resetGame() {
    currentScene.value = null
    history.value = []
    gameStarted.value = false
  }
  
  function loadGame(title: string, scene: GameScene | null, gameHistory: GameScene[]) {
    gameTitle.value = title
    currentScene.value = scene
    history.value = gameHistory
    gameStarted.value = true
  }
  
  // Функция для обрезки длинных вариантов ответов
  function truncateOption(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) {
      return text;
    }
    
    // Обрезаем текст до максимальной длины
    let truncated = text.substring(0, maxLength - 3) + '...';
    
    // Проверяем, не обрезали ли мы посреди слова
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    if (lastSpaceIndex > maxLength / 2) {
      // Если есть пробел во второй половине строки, обрезаем по нему
      truncated = truncated.substring(0, lastSpaceIndex) + '...';
    }
    
    return truncated;
  }
  
  return {
    apiKey,
    currentScene,
    history,
    isLoading,
    hasError,
    errorMessage,
    gameTitle,
    gameStarted,
    isGameReady,
    startGame,
    generateScene,
    makeChoice,
    resetGame,
    loadGame
  }
}) 