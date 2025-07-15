<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200 p-4 flex-shrink-0">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Mustache JSON Editor</h1>
        <div class="flex items-center gap-3">
          <!-- Action Buttons -->
          <button
            @click="validateOutput"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Validate
          </button>
          
          <button
            @click="checkUsage"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            Check Usage
          </button>
          
          <button
            @click="exportSession"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Export
          </button>
        </div>
      </div>
    </header>

    <!-- Error Bar -->
    <Transition name="slide-down">
      <div v-if="store.errors.length > 0" class="bg-red-500 text-white p-3 flex-shrink-0">
        <div class="max-w-7xl mx-auto">
          <div v-for="(error, index) in store.errors" :key="index" class="flex items-center justify-between mb-1 last:mb-0">
            <span>{{ error }}</span>
            <button
              @click="store.dismissError(index)"
              class="ml-4 p-1 hover:bg-red-600 rounded"
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
    <main class="flex-1 p-4 overflow-hidden">
      <div class="max-w-7xl mx-auto h-full">
        <div 
          :class="[
            'grid gap-4 h-full',
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
            @error="store.showError"
            ref="jsonCard"
          />
          
          <!-- Mustache Template Card -->
          <Card
            v-show="!store.maximisedCard || store.maximisedCard === 'template'"
            title="Mustache Template"
            language="handlebars"
            v-model="store.template"
            :allow-file="true"
            :allow-url="true"
            :maximised="store.maximisedCard === 'template'"
            @maximise="toggleMaximise('template')"
            @format="formatCard('template')"
            @error="store.showError"
            ref="templateCard"
          />
          
          <!-- Output Card -->
          <Card
            v-show="!store.maximisedCard || store.maximisedCard === 'output'"
            title="Output"
            language="plaintext"
            v-model="store.output"
            :read-only="true"
            :maximised="store.maximisedCard === 'output'"
            @maximise="toggleMaximise('output')"
            @format="formatCard('output')"
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
            @error="store.showError"
            ref="schemaCard"
          />
        </div>
      </div>
    </main>

    <!-- Usage Analysis Modal -->
    <div v-if="showUsageModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold">Variable Usage Analysis</h3>
        </div>
        <div class="p-6 overflow-y-auto max-h-[60vh]">
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Missing Variables -->
            <div>
              <h4 class="font-semibold text-red-600 mb-3 flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                Missing Variables ({{ usageAnalysis.missing.length }})
              </h4>
              <ul class="space-y-1">
                <li v-for="variable in usageAnalysis.missing" :key="variable" class="text-red-700 bg-red-50 px-2 py-1 rounded">
                  {{ variable }}
                </li>
                <li v-if="usageAnalysis.missing.length === 0" class="text-gray-500 italic">
                  No missing variables found
                </li>
              </ul>
            </div>
            
            <!-- Unused Variables -->
            <div>
              <h4 class="font-semibold text-yellow-600 mb-3 flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Unused Variables ({{ usageAnalysis.unused.length }})
              </h4>
              <ul class="space-y-1">
                <li v-for="variable in usageAnalysis.unused" :key="variable" class="text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                  {{ variable }}
                </li>
                <li v-if="usageAnalysis.unused.length === 0" class="text-gray-500 italic">
                  All variables are used
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="p-6 border-t border-gray-200 flex justify-end">
          <button
            @click="showUsageModal = false"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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
import { validateJSON } from '@/utils/validate'
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
    const rendered = renderTemplate(store.template, store.json)
    store.output = rendered
    store.clearErrors()
  } catch (error) {
    store.showError(error instanceof Error ? error.message : 'Rendering failed')
  }
}, 250)

// Watch for changes and re-render
watch([() => store.json, () => store.template], debouncedRender, { immediate: true })

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

const formatCard = async (cardType: string) => {
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
    const errors = validateJSON(store.output, store.schema)
    
    if (errors.length === 0) {
      store.showError('✅ Validation passed!')
      setTimeout(() => store.clearErrors(), 3000)
    } else {
      errors.forEach(error => {
        store.showError(`${error.path}: ${error.message}`)
      })
    }
  } catch (error) {
    store.showError(error instanceof Error ? error.message : 'Validation failed')
  }
}

const checkUsage = () => {
  try {
    usageAnalysis.value = analyzeUsage(store.json, store.template)
    showUsageModal.value = true
  } catch (error) {
    store.showError(error instanceof Error ? error.message : 'Usage analysis failed')
  }
}

const exportSession = async () => {
  try {
    await exportZip(store.json, store.template, store.output, store.schema)
  } catch (error) {
    store.showError(error instanceof Error ? error.message : 'Export failed')
  }
}

onMounted(() => {
  // Initial render
  debouncedRender()
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
