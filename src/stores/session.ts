import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { debounce } from '@/utils/debounce'

export interface SessionState {
  json: string
  template: string
  output: string
  schema: string
  maximisedCard: string | null
  errors: string[]
}

export const useSessionStore = defineStore('session', () => {
  const json = ref(`{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "hobbies": ["reading", "coding", "gaming"]
}`)

  const template = ref(`Hello {{name}}!

You are {{age}} years old and your email is {{email}}.

Your hobbies:
{{#hobbies}}
- {{.}}
{{/hobbies}}`)

  const output = ref('')
  
  const schema = ref(`{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "age": {
      "type": "number"
    },
    "email": {
      "type": "string",
      "format": "email"
    }
  },
  "required": ["name", "age", "email"]
}`)

  const maximisedCard = ref<string | null>(null)
  const errors = ref<string[]>([])

  // Load from localStorage on init
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('mustache-session')
      if (stored) {
        const data = JSON.parse(stored)
        json.value = data.json || json.value
        template.value = data.template || template.value
        output.value = data.output || output.value
        schema.value = data.schema || schema.value
      }
    } catch (e) {
      console.warn('Failed to load from localStorage:', e)
    }
  }

  // Save to localStorage (debounced)
  const saveToStorage = debounce(() => {
    try {
      const data = {
        json: json.value,
        template: template.value,
        output: output.value,
        schema: schema.value
      }
      localStorage.setItem('mustache-session', JSON.stringify(data))
    } catch (e) {
      console.warn('Failed to save to localStorage:', e)
    }
  }, 300)

  // Watch for changes and save
  watch([json, template, output, schema], saveToStorage, { deep: true })

  const showError = (message: string) => {
    errors.value.push(message)
  }

  const dismissError = (index: number) => {
    errors.value.splice(index, 1)
  }

  const clearErrors = () => {
    errors.value = []
  }

  const setMaximisedCard = (cardId: string | null) => {
    maximisedCard.value = cardId
  }

  // Initialize
  loadFromStorage()

  return {
    json,
    template,
    output,
    schema,
    maximisedCard,
    errors,
    showError,
    dismissError,
    clearErrors,
    setMaximisedCard
  }
})
