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
  "email": "john.doe@example.com",
  "timestamp": "2025-07-15T10:30:00Z",
  "organisms": {
    "org8": {
      "items": [
        {
          "label": "First Item",
          "thumbnail": {
            "mediaType": "image/png",
            "value": "https://example.com/image1.png"
          }
        },
        {
          "label": "Second Item", 
          "thumbnail": {
            "mediaType": "image/jpeg",
            "value": "https://example.com/image2.jpg"
          }
        }
      ]
    }
  }
}`)

  const template = ref(`{
  "greeting": "Hello {{ name }}!",
  "message": "Welcome to our service",
  "user": {
    "name": "{{ name }}",
    "age": {{ age }},
    "email": "{{ email }}",
    "isAdult": {{#age}}true{{/age}}{{^age}}false{{/age}}
  },
  "timestamp": "{{ timestamp }}",
  "details": "You are {{ age }} years old and your email is {{ email }}",
  "hasItems": {{#organisms.org8.items}}true{{/organisms.org8.items}}{{^organisms.org8.items}}false{{/organisms.org8.items}},
  "firstItem": {{#organisms.org8.items}}{
    "title": "{{ label }}",
    "media": {
      "type": "{{ thumbnail.mediaType }}",
      "url": "{{ thumbnail.value }}"
    }
  }{{/organisms.org8.items}}{{^organisms.org8.items}}null{{/organisms.org8.items}}
}`)

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
        
        // Validate that the loaded JSON is parseable before setting it
        if (data.json) {
          try {
            JSON.parse(data.json)
            json.value = data.json
          } catch (e) {
            console.warn('Invalid JSON in localStorage, using default:', e)
          }
        }
        
        if (data.schema) {
          try {
            JSON.parse(data.schema)
            schema.value = data.schema
          } catch (e) {
            console.warn('Invalid schema in localStorage, using default:', e)
          }
        }
        
        template.value = data.template || template.value
        output.value = data.output || output.value
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

  const clearStorage = () => {
    try {
      localStorage.removeItem('mustache-session')
      // Reset to default values
      json.value = `{
  "name": "John Doe",
  "age": 30,
  "email": "john.doe@example.com",
  "timestamp": "2025-07-15T10:30:00Z",
  "organisms": {
    "org8": {
      "items": [
        {
          "label": "First Item",
          "thumbnail": {
            "mediaType": "image/png",
            "value": "https://example.com/image1.png"
          }
        },
        {
          "label": "Second Item", 
          "thumbnail": {
            "mediaType": "image/jpeg",
            "value": "https://example.com/image2.jpg"
          }
        }
      ]
    }
  }
}`
      template.value = `{
  "greeting": "Hello {{ name }}!",
  "message": "Welcome to our service",
  "user": {
    "name": "{{ name }}",
    "age": {{ age }},
    "email": "{{ email }}",
    "isAdult": {{#age}}true{{/age}}{{^age}}false{{/age}}
  },
  "timestamp": "{{ timestamp }}",
  "details": "You are {{ age }} years old and your email is {{ email }}",
  "hasItems": {{#organisms.org8.items}}true{{/organisms.org8.items}}{{^organisms.org8.items}}false{{/organisms.org8.items}},
  "firstItem": {{#organisms.org8.items}}{
    "title": "{{ label }}",
    "media": {
      "type": "{{ thumbnail.mediaType }}",
      "url": "{{ thumbnail.value }}"
    }
  }{{/organisms.org8.items}}{{^organisms.org8.items}}null{{/organisms.org8.items}}
}`
      output.value = ''
      schema.value = `{
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
}`
      clearErrors()
    } catch (e) {
      console.warn('Failed to clear localStorage:', e)
    }
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
    setMaximisedCard,
    clearStorage
  }
})
