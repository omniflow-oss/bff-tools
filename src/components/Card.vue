<template>
  <div 
    :class="[
      'bg-white rounded-2xl shadow-lg p-3 flex flex-col transition-all duration-200',
      maximised ? 'fixed inset-0 z-50 h-screen' : 'h-[45vh] lg:h-[42vh]'
    ]"
  >
    <!-- Title Bar -->
    <div class="flex items-center justify-between mb-3 flex-shrink-0">
      <h3 class="text-lg font-semibold text-gray-800">{{ title }}</h3>
      <div class="flex items-center gap-2">
        <!-- Format Button -->
        <button
          @click="$emit('format')"
          class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Format"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        
        <!-- Load File Button -->
        <button
          v-if="allowFile"
          @click="triggerFileInput"
          class="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Load File"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
          </svg>
        </button>
        
        <!-- Load URL Button -->
        <button
          v-if="allowUrl"
          @click="showUrlDialog = true"
          class="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          title="Load URL"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
          </svg>
        </button>
        
        <!-- Maximise Button -->
        <button
          @click="$emit('maximise')"
          class="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          title="Maximise"
        >
          <svg v-if="!maximised" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Content -->
    <div class="flex-1 overflow-hidden">
      <MonacoEditor
        :model-value="modelValue"
        :language="language"
        :read-only="readOnly"
        @update:model-value="$emit('update:modelValue', $event)"
        ref="editorRef"
      />
    </div>
    
    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept=".json,.txt,.mustache"
      @change="handleFileLoad"
      class="hidden"
    >
    
    <!-- URL Dialog -->
    <div v-if="showUrlDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
        <h4 class="text-lg font-semibold mb-4">Load from URL</h4>
        <input
          v-model="urlInput"
          type="url"
          placeholder="https://example.com/data.json"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keydown.enter="loadFromUrl"
        >
        <div class="flex justify-end gap-2 mt-4">
          <button
            @click="showUrlDialog = false"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            @click="loadFromUrl"
            class="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            Load
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MonacoEditor from './MonacoEditor.vue'

interface Props {
  title: string
  language: string
  modelValue: string
  readOnly?: boolean
  allowUrl?: boolean
  allowFile?: boolean
  maximised?: boolean
}

type Emits = {
  'update:modelValue': [value: string]
  'maximise': []
  'format': []
  'error': [message: string]
}

withDefaults(defineProps<Props>(), {
  readOnly: false,
  allowUrl: false,
  allowFile: false,
  maximised: false
})

const emit = defineEmits<Emits>()

const fileInput = ref<HTMLInputElement>()
const editorRef = ref<InstanceType<typeof MonacoEditor>>()
const showUrlDialog = ref(false)
const urlInput = ref('')

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileLoad = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    if (content) {
      emit('update:modelValue', content)
    }
  }
  reader.onerror = () => {
    emit('error', 'Failed to read file')
  }
  reader.readAsText(file)
}

const loadFromUrl = async () => {
  if (!urlInput.value) return
  
  try {
    const response = await fetch(urlInput.value)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const content = await response.text()
    emit('update:modelValue', content)
    showUrlDialog.value = false
    urlInput.value = ''
  } catch (error) {
    emit('error', `Failed to load URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Expose editor methods
defineExpose({
  format: () => editorRef.value?.format(),
  focus: () => editorRef.value?.focus(),
  addDecorations: (decorations: any[]) => editorRef.value?.addDecorations(decorations),
  removeDecorations: (decorationIds: string[]) => editorRef.value?.removeDecorations(decorationIds)
})
</script>
