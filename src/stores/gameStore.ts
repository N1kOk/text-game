import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import systemPrompt from '../prompts/system-prompt.txt?raw'
import userChoicePromptTemplate from '../prompts/user-choice-prompt.txt?raw'

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
  const apiKey = ref('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')
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
  function startGame(title: string, initialPrompt: string) {
    gameTitle.value = title
    gameStarted.value = true
    generateScene(initialPrompt)
  }
  
  async function generateScene(prompt: string) {
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
      
      // Добавляем текущий запрос
      messages.push({ role: 'user', content: prompt })
      
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages: messages,
          temperature: 0.5,
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
        // Очищаем текст от лишних пробелов и переносов строк и улучшаем форматирование
        const sceneText = improveRussianText(parts[0].trim())
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
            { id: '1', text: 'Продолжить поиски семьи' },
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
            { id: '1', text: 'Продолжить поиски семьи' },
            { id: '2', text: 'Отвлечься на что-то другое' },
            { id: '3', text: 'Сделать что-то необычное' }
          ],
          chosenChoiceId: undefined
        }
        
        currentScene.value = newScene
        history.value.push(newScene)
      }
    } catch (error) {
      hasError.value = true
      errorMessage.value = error instanceof Error ? error.message : 'Произошла ошибка при генерации сцены'
      console.error('Error generating scene:', error)
    } finally {
      isLoading.value = false
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
  
  // Функция для улучшения форматирования русского текста
  function improveRussianText(text: string): string {
    return text
      // Исправляем типографику
      .replace(/\s+\./g, '.') // Убираем пробелы перед точкой
      .replace(/\s+,/g, ',') // Убираем пробелы перед запятой
      .replace(/\s+:/g, ':') // Убираем пробелы перед двоеточием
      .replace(/\s+;/g, ';') // Убираем пробелы перед точкой с запятой
      .replace(/\s+\?/g, '?') // Убираем пробелы перед вопросительным знаком
      .replace(/\s+!/g, '!') // Убираем пробелы перед восклицательным знаком
      .replace(/\n{3,}/g, '\n\n') // Заменяем множественные переносы строк на двойной
      .replace(/\s{2,}/g, ' ') // Заменяем множественные пробелы на один
      // Добавляем пробелы после знаков препинания, если их нет
      .replace(/([.,;:!?])([^\s\d\n"'»)])/g, '$1 $2') // Добавляем пробел после знаков препинания, исключая цифры, переносы строк и закрывающие кавычки/скобки
      .trim(); // Убираем пробелы в начале и конце
  }
  
  // Функция для очистки вариантов действий от лишних объяснений
  function cleanActionOption(text: string): string {
    // Удаляем всё после запятой, тире, двоеточия или слов "чтобы", "потому что", "так как" и т.д.
    let cleaned = text
      .replace(/,.*$/, '') // Удаляем всё после запятой
      .replace(/ - .*$/, '') // Удаляем всё после тире с пробелами
      .replace(/-.*$/, '') // Удаляем всё после тире без пробелов
      .replace(/:.*$/, '') // Удаляем всё после двоеточия
      .replace(/ чтобы.*$/i, '') // Удаляем "чтобы" и всё после него
      .replace(/ потому что.*$/i, '') // Удаляем "потому что" и всё после него
      .replace(/ так как.*$/i, '') // Удаляем "так как" и всё после него
      .replace(/ для того.*$/i, '') // Удаляем "для того" и всё после него
      .replace(/ и (?:затем|потом).*$/i, '') // Удаляем "и затем/потом" и всё после него
      .replace(/ а (?:затем|потом).*$/i, '') // Удаляем "а затем/потом" и всё после него
      .trim();
    
    // Если после очистки текст стал слишком коротким, возвращаем оригинал
    if (cleaned.length < 10 && text.length > cleaned.length) {
      return text;
    }
    
    return cleaned;
  }
  
  // Функция для обрезки длинных вариантов ответов
  function truncateOption(text: string, maxLength: number = 100): string {
    // Сначала очищаем текст от лишних объяснений
    const cleaned = cleanActionOption(text);
    
    if (cleaned.length <= maxLength) {
      return cleaned;
    }
    
    // Обрезаем текст до максимальной длины
    let truncated = cleaned.substring(0, maxLength - 3) + '...';
    
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