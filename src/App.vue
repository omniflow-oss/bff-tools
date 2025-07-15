<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-gray-100 p-4 flex-shrink-0 shadow-sm">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <h1 class="text-2xl font-light text-gray-900">Mustache JSON Editor</h1>
        <div class="flex items-center gap-3">
          <!-- Action Buttons -->
          <button
            @click="validateOutput"
            class="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Validate
          </button>
          
          <button
            @click="checkUsage"
            class="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2 font-medium"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            Check Usage
          </button>
          
          <button
            @click="exportSession"
            class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-400 transition-colors flex items-center gap-2 font-medium"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Export
          </button>
          
          <button
            @click="resetSession"
            class="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors flex items-center gap-2 font-medium border border-red-200"
            title="Reset to defaults (clears localStorage)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Reset
          </button>
        </div>
      </div>
    </header>

    <!-- Error Bar -->
    <Transition name="slide-down">
      <div v-if="store.errors.length > 0" class="bg-red-50 border-b border-red-100 text-red-800 p-3 flex-shrink-0">
        <div class="max-w-7xl mx-auto">
          <div v-for="(error, index) in store.errors" :key="index" class="flex items-center justify-between mb-1 last:mb-0">
            <span class="text-sm">{{ error }}</span>
            <button
              @click="store.dismissError(index)"
              class="ml-4 p-1 hover:bg-red-100 rounded text-red-600"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Main Content -->
    <main class="flex-1 p-6 overflow-hidden">
      <div class="max-w-7xl mx-auto h-full">
        <div 
          :class="[
            'grid gap-6 h-full',
            store.maximisedCard ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2 grid-rows-2 lg:grid-rows-2'
          ]"
        >
          <!-- JSON Data Card -->
          <Card
            v-show="!store.maximisedCard || store.maximisedCard === 'json'"
            title="JSON Data"
            language="json"
            v-model="store.json"
            :allow-file="true"
            :allow-url="true"
            :maximised="store.maximisedCard === 'json'"
            @maximise="toggleMaximise('json')"
            @format="formatCard('json')"
            @validate="validateCard('json')"
            @error="store.showError"
            ref="jsonCard"
          />
          
          <!-- Mustache Template Card -->
          <Card
            v-show="!store.maximisedCard || store.maximisedCard === 'template'"
            title="Mustache Template"
            language="json"
            v-model="store.template"
            :allow-file="true"
            :allow-url="true"
            :maximised="store.maximisedCard === 'template'"
            @maximise="toggleMaximise('template')"
            @format="formatCard('template')"
            @validate="validateCard('template')"
            @error="store.showError"
            ref="templateCard"
          />
          
          <!-- Output Card -->
          <Card
            v-show="!store.maximisedCard || store.maximisedCard === 'output'"
            title="Output"
            language="json"
            v-model="store.output"
            :read-only="true"
            :maximised="store.maximisedCard === 'output'"
            @maximise="toggleMaximise('output')"
            @format="formatCard('output')"
            @validate="validateCard('output')"
            @error="store.showError"
            ref="outputCard"
          />
          
          <!-- JSON Schema Card -->
          <Card
            v-show="!store.maximisedCard || store.maximisedCard === 'schema'"
            title="JSON Schema"
            language="json"
            v-model="store.schema"
            :allow-file="true"
            :allow-url="true"
            :maximised="store.maximisedCard === 'schema'"
            @maximise="toggleMaximise('schema')"
            @format="formatCard('schema')"
            @validate="validateCard('schema')"
            @error="store.showError"
            ref="schemaCard"
          />
        </div>
      </div>
    </main>

    <!-- Usage Analysis Modal -->
    <div v-if="showUsageModal" class="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div class="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl border border-gray-100">
        <div class="p-6 border-b border-gray-100">
          <h3 class="text-xl font-light text-gray-900">Variable Usage Analysis</h3>
        </div>
        <div class="p-6 overflow-y-auto max-h-[60vh]">
          <div class="grid md:grid-cols-2 gap-8">
            <!-- Missing Variables -->
            <div>
              <h4 class="font-medium text-red-600 mb-4 flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                Missing Variables ({{ usageAnalysis.missing.length }})
              </h4>
              <ul class="space-y-2">
                <li v-for="variable in usageAnalysis.missing" :key="variable" class="text-red-700 bg-red-50 px-3 py-2 rounded-md text-sm font-mono border border-red-100">
                  {{ variable }}
                </li>
                <li v-if="usageAnalysis.missing.length === 0" class="text-gray-500 italic text-sm">
                  No missing variables found
                </li>
              </ul>
            </div>
            
            <!-- Unused Variables -->
            <div>
              <h4 class="font-medium text-amber-600 mb-4 flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Unused Variables ({{ usageAnalysis.unused.length }})
              </h4>
              <ul class="space-y-2">
                <li v-for="variable in usageAnalysis.unused" :key="variable" class="text-amber-700 bg-amber-50 px-3 py-2 rounded-md text-sm font-mono border border-amber-100">
                  {{ variable }}
                </li>
                <li v-if="usageAnalysis.unused.length === 0" class="text-gray-500 italic text-sm">
                  All variables are used
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="p-6 border-t border-gray-100 flex justify-end">
          <button
            @click="showUsageModal = false"
            class="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useSessionStore } from '@/stores/session'
import { renderTemplate } from '@/utils/render'
import { validateJSON as validateJSONSchema } from '@/utils/validate'
import { analyzeUsage, type AnalysisResult } from '@/utils/analysis'
import { formatJSON, formatMustache, formatSchema } from '@/utils/format'
import { exportSession as exportZip } from '@/utils/zip'
import { useKeyboard } from '@/hooks/useKeyboard'
import { debounce } from '@/utils/debounce'
import Card from '@/components/Card.vue'

const store = useSessionStore()

// Refs
const jsonCard = ref<InstanceType<typeof Card>>()
const templateCard = ref<InstanceType<typeof Card>>()
const outputCard = ref<InstanceType<typeof Card>>()
const schemaCard = ref<InstanceType<typeof Card>>()

const showUsageModal = ref(false)
const usageAnalysis = ref<AnalysisResult>({ unused: [], missing: [] })

// Debounced render function
const debouncedRender = debounce(() => {
  try {
    // Clear previous errors
    store.clearErrors()
    
    // Validate JSON before rendering
    try {
      JSON.parse(store.json)
    } catch (jsonError) {
      store.showError(`Invalid JSON: ${jsonError instanceof Error ? jsonError.message : 'Parse error'}`)
      return
    }
    
    const rendered = renderTemplate(store.template, store.json)
    store.output = rendered
  } catch (error) {
    store.showError(error instanceof Error ? error.message : 'Rendering failed')
  }
}, 250)

// Watch for changes and re-render
watch([() => store.json, () => store.template], debouncedRender)

// Keyboard shortcuts
useKeyboard({
  'cmd+shift+f': () => {
    // Format current focused card
    formatCard('json') // Default to JSON for now
  },
  'escape': () => {
    if (store.maximisedCard) {
      store.setMaximisedCard(null)
    }
    if (showUsageModal.value) {
      showUsageModal.value = false
    }
  }
})

const toggleMaximise = (cardId: string) => {
  if (store.maximisedCard === cardId) {
    store.setMaximisedCard(null)
  } else {
    store.setMaximisedCard(cardId)
  }
}

const formatCard = (cardType: string) => {
  try {
    switch (cardType) {
      case 'json':
        store.json = formatJSON(store.json)
        break
      case 'template':
        store.template = formatMustache(store.template)
        break
      case 'schema':
        store.schema = formatSchema(store.schema)
        break
      case 'output':
        if (store.output) {
          try {
            store.output = formatJSON(store.output)
          } catch {
            // Output might not be JSON, ignore
          }
        }
        break
    }
  } catch (error) {
    store.showError(error instanceof Error ? error.message : 'Formatting failed')
  }
}

const validateOutput = () => {
  try {
    store.clearErrors()
    outputCard.value?.clearValidationErrors()
    
    const errors = validateJSONSchema(store.output, store.schema)
    
    if (errors.length === 0) {
      store.showError('✅ Validation passed!')
      setTimeout(() => store.clearErrors(), 3000)
    } else {
      // Show errors in notification bar
      errors.forEach(error => {
        const errorMsg = `Line ${error.line}:${error.column} - ${error.message} (${error.path})`
        store.showError(errorMsg)
      })
      
      // Highlight errors in Monaco Editor
      outputCard.value?.setValidationErrors(errors)
    }
  } catch (error) {
    store.showError(error instanceof Error ? error.message : 'Validation failed')
  }
}

const validateCard = (cardType: 'json' | 'template' | 'output' | 'schema') => {
  try {
    let cardRef: any
    let content: string
    let cardName: string
    
    switch (cardType) {
      case 'json':
        cardRef = jsonCard.value
        content = store.json
        cardName = 'JSON Data'
        break
      case 'template':
        cardRef = templateCard.value
        content = store.template
        cardName = 'Mustache Template'
        break
      case 'output':
        cardRef = outputCard.value
        content = store.output
        cardName = 'Output'
        break
      case 'schema':
        cardRef = schemaCard.value
        content = store.schema
        cardName = 'JSON Schema'
        break
    }
    
    cardRef?.clearValidationErrors()
    store.clearErrors()
    
    try {
      if (cardType === 'template') {
        // For Mustache templates, we validate if it's valid JSON structure
        // but allow Mustache syntax within string values
        validateMustacheTemplate(content)
        store.showError(`✅ ${cardName} is valid!`)
      } else {
        // For JSON validation
        JSON.parse(content)
        store.showError(`✅ ${cardName} is valid JSON!`)
      }
      
      setTimeout(() => store.clearErrors(), 3000)
    } catch (error) {
      const errorMsg = `❌ ${cardName} validation failed: ${error instanceof Error ? error.message : 'Invalid format'}`
      store.showError(errorMsg)
      
      // Try to find the line number for the error
      const lineNumber = findErrorLine(content, error instanceof Error ? error.message : '')
      
      // Highlight error in Monaco Editor
      cardRef?.setValidationErrors([{
        line: lineNumber,
        column: 1,
        message: error instanceof Error ? error.message : 'Validation error',
        path: 'root',
        severity: 'error'
      }])
    }
  } catch (error) {
    store.showError(error instanceof Error ? error.message : 'Validation failed')
  }
}

const validateMustacheTemplate = (template: string) => {
  // Check if it's a valid JSON structure with Mustache placeholders
  // We'll temporarily replace Mustache placeholders with valid JSON values
  const tempTemplate = template
    .replace(/\{\{[^}]+\}\}/g, '"__PLACEHOLDER__"') // Replace {{var}} with placeholder
    .replace(/\{\{\{[^}]+\}\}\}/g, '"__PLACEHOLDER__"') // Replace {{{var}}} with placeholder
    .replace(/\{\{#[^}]+\}\}[\s\S]*?\{\{\/[^}]+\}\}/g, '"__PLACEHOLDER__"') // Replace {{#each}} blocks
    .replace(/\{\{\^[^}]+\}\}[\s\S]*?\{\{\/[^}]+\}\}/g, '"__PLACEHOLDER__"') // Replace {{^if}} blocks
  
  // Now validate as JSON
  JSON.parse(tempTemplate)
}

const findErrorLine = (content: string, errorMessage: string): number => {
  // Try to extract line number from error message
  const lineMatch = errorMessage.match(/line (\d+)/i)
  if (lineMatch) {
    return parseInt(lineMatch[1])
  }
  
  // If no line number in error, try to find position
  const posMatch = errorMessage.match(/position (\d+)/i)
  if (posMatch) {
    const position = parseInt(posMatch[1])
    const lines = content.substring(0, position).split('\n')
    return lines.length
  }
  
  return 1
}

const checkUsage = () => {
  try {
    // Clear previous highlights
    jsonCard.value?.clearValidationErrors()
    templateCard.value?.clearValidationErrors()
    
    usageAnalysis.value = analyzeUsage(store.json, store.template)
    
    // Highlight unused variables in JSON editor
    if (usageAnalysis.value.unused.length > 0) {
      const unusedErrors = usageAnalysis.value.unused.map(variable => ({
        line: findVariableLineInJSON(store.json, variable),
        column: 1,
        message: `Unused variable: ${variable}`,
        path: variable,
        severity: 'warning'
      }))
      jsonCard.value?.setValidationErrors(unusedErrors)
    }
    
    // Highlight missing variables in template editor
    if (usageAnalysis.value.missing.length > 0) {
      const missingErrors = usageAnalysis.value.missing.map(variable => ({
        line: findVariableLineInTemplate(store.template, variable),
        column: 1,
        message: `Missing variable: ${variable}`,
        path: variable,
        severity: 'error'
      }))
      templateCard.value?.setValidationErrors(missingErrors)
    }
    
    showUsageModal.value = true
  } catch (error) {
    store.showError(error instanceof Error ? error.message : 'Usage analysis failed')
  }
}

const findVariableLineInJSON = (json: string, variable: string): number => {
  const lines = json.split('\n')
  const varName = variable.split('.')[0] // Get root property name
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`"${varName}"`)) {
      return i + 1
    }
  }
  return 1
}

const findVariableLineInTemplate = (template: string, variable: string): number => {
  const lines = template.split('\n')
  const varName = variable.split('.').pop() || variable // Get leaf property name
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`{{${varName}}}`) || lines[i].includes(`{{ ${varName} }}`)) {
      return i + 1
    }
  }
  return 1
}

const exportSession = async () => {
  try {
    await exportZip(store.json, store.template, store.output, store.schema)
  } catch (error) {
    store.showError(error instanceof Error ? error.message : 'Export failed')
  }
}

const resetSession = () => {
  try {
    store.clearStorage()
    // Trigger a re-render after clearing
    setTimeout(() => {
      debouncedRender()
    }, 100)
  } catch (error) {
    store.showError(error instanceof Error ? error.message : 'Reset failed')
  }
}

onMounted(() => {
  // Give a small delay to ensure localStorage is loaded
  setTimeout(() => {
    debouncedRender()
  }, 100)
})
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
