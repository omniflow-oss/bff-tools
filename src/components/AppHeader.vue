<template>
  <!-- Header -->
  <header class="bg-white border-b border-gray-100 p-4 flex-shrink-0 shadow-sm">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <h1 class="text-2xl font-light text-gray-900">Mustache JSON Editor</h1>
      <div class="flex items-center gap-3">
        <!-- Action Buttons -->
        <button
          @click="$emit('checkUsage')"
          class="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2 font-medium"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          Check Usage
        </button>
        
        <button
          @click="$emit('exportSession')"
          class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-400 transition-colors flex items-center gap-2 font-medium"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Export
        </button>
        
        <button
          @click="$emit('resetSession')"
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
</template>

<script setup lang="ts">
defineEmits<{
  checkUsage: []
  exportSession: []
  resetSession: []
}>()
</script>
