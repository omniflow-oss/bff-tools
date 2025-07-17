<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <AppHeader
      @check-usage="handleCheckUsage"
      @export-session="exportSession"
      @reset-session="resetSession"
    />

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
            :title="cardConfigs.json.title"
            :language="cardConfigs.json.language"
            v-model="store.json"
            :allow-file="true"
            :allow-url="true"
            :maximised="store.maximisedCard === 'json'"
            @maximise="toggleMaximise('json')"
            @format="() => formatCard('json')"
            @validate="() => validateCard('json')"
            @error="store.showError"
            :ref="cardRefs.jsonCard"
          />
          
          <!-- Mustache Template Card -->
          <Card
            v-show="!store.maximisedCard || store.maximisedCard === 'template'"
            :title="cardConfigs.template.title"
            language="handlebars"
            v-model="store.template"
            :allow-file="true"
            :allow-url="true"
            :maximised="store.maximisedCard === 'template'"
            @maximise="toggleMaximise('template')"
            @format="() => formatCard('template')"
            @validate="() => validateCard('template')"
            @error="store.showError"
            :ref="cardRefs.templateCard"
          />
          
          <!-- Output Card -->
          <Card
            v-show="!store.maximisedCard || store.maximisedCard === 'output'"
            :title="cardConfigs.output.title"
            :language="cardConfigs.output.language"
            v-model="store.output"
            :read-only="true"
            :maximised="store.maximisedCard === 'output'"
            @maximise="toggleMaximise('output')"
            @format="() => formatCard('output')"
            @validate="() => validateCard('output')"
            @error="store.showError"
            :ref="cardRefs.outputCard"
          />
          
          <!-- Validation Panel (replaces schema card) -->
          <div v-show="!store.maximisedCard">
            <ValidationPanel
              :errors="store.errors"
              :usage-analysis="usageAnalysis"
              @dismiss-error="store.dismissError"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- Usage Analysis Modal -->
    <UsageModal
      v-if="usageAnalysis"
      :show-modal="showUsageModal"
      :usage-analysis="usageAnalysis"
      @close="showUsageModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useSessionStore } from '@/stores/session'
import { useKeyboard } from '@/hooks/useKeyboard'
import { cardConfigs } from '@/config/cards'
import { useCardRefs } from '@/composables/useCardRefs'
import { useCardOperations } from '@/composables/useCardOperations'
import type { AnalysisResult } from '@/utils/analysis'

// Components
import Card from '@/components/Card.vue'
import AppHeader from '@/components/AppHeader.vue'
import ValidationPanel from '@/components/ValidationPanel.vue'
import UsageModal from '@/components/UsageModal.vue'

const store = useSessionStore()
const { cardRefs, getCardRef } = useCardRefs()
const {
  debouncedRender,
  toggleMaximise,
  formatCard,
  validateCard,
  checkUsage,
  exportSession,
  resetSession
} = useCardOperations(store, getCardRef)

// Modal state
const showUsageModal = ref(false)
const usageAnalysis = ref<AnalysisResult | null>(null)

// Handle usage analysis with modal and panel display
const handleCheckUsage = () => {
  const result = checkUsage()
  usageAnalysis.value = result
  showUsageModal.value = true
  // Also persist in the validation panel for ongoing reference
}

// Watch for changes and re-render
watch([() => store.json, () => store.template], debouncedRender)

// Keyboard shortcuts
useKeyboard({
  'cmd+shift+f': () => {
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

onMounted(() => {
  // Give a small delay to ensure localStorage is loaded
  setTimeout(() => {
    debouncedRender()
  }, 100)
})
</script>
