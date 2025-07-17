<template>
  <!-- Usage Analysis Modal -->
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
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
          @click="$emit('close')"
          class="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AnalysisResult } from '@/utils/analysis'

interface Props {
  showModal: boolean
  usageAnalysis: AnalysisResult
}

defineProps<Props>()
defineEmits<{
  close: []
}>()
</script>
