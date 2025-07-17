<template>
  <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="bg-gray-50 border-b border-gray-200 p-4">
      <h3 class="text-lg font-medium text-gray-900 flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        Validation & Errors
      </h3>
    </div>

    <!-- Content -->
    <div class="p-4 max-h-96 overflow-y-auto">
      <!-- Errors Section -->
      <div v-if="errors.length > 0" class="mb-6">
        <h4 class="font-medium text-red-600 mb-3 flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          Errors ({{ errors.length }})
        </h4>
        <div class="space-y-2">
          <div v-for="(error, index) in errors" :key="index" class="flex items-start justify-between bg-red-50 border border-red-200 rounded-md p-3">
            <span class="text-sm text-red-800 flex-1">{{ error }}</span>
            <button
              @click="$emit('dismissError', index)"
              class="ml-3 p-1 hover:bg-red-100 rounded text-red-600 flex-shrink-0"
              title="Dismiss error"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Usage Analysis Section -->
      <div v-if="usageAnalysis && (usageAnalysis.missing.length > 0 || usageAnalysis.unused.length > 0)" class="mb-6">
        <h4 class="font-medium text-blue-600 mb-3 flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          Usage Analysis
        </h4>
        
        <!-- Missing Variables -->
        <div v-if="usageAnalysis.missing.length > 0" class="mb-4">
          <h5 class="text-sm font-medium text-red-600 mb-2">Missing Variables ({{ usageAnalysis.missing.length }})</h5>
          <div class="space-y-1">
            <div v-for="variable in usageAnalysis.missing" :key="variable" class="text-red-700 bg-red-50 px-3 py-2 rounded-md text-sm font-mono border border-red-100">
              {{ variable }}
            </div>
          </div>
        </div>
        
        <!-- Unused Variables -->
        <div v-if="usageAnalysis.unused.length > 0">
          <h5 class="text-sm font-medium text-amber-600 mb-2">Unused Variables ({{ usageAnalysis.unused.length }})</h5>
          <div class="space-y-1">
            <div v-for="variable in usageAnalysis.unused" :key="variable" class="text-amber-700 bg-amber-50 px-3 py-2 rounded-md text-sm font-mono border border-amber-100">
              {{ variable }}
            </div>
          </div>
        </div>
      </div>

      <!-- Status Section -->
      <div v-if="errors.length === 0 && (!usageAnalysis || (usageAnalysis.missing.length === 0 && usageAnalysis.unused.length === 0))" class="text-center py-8">
        <svg class="w-12 h-12 mx-auto text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <p class="text-gray-600">No errors or issues found</p>
        <p class="text-sm text-gray-500 mt-1">Everything looks good!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AnalysisResult } from '@/utils/analysis'

interface Props {
  errors: string[]
  usageAnalysis?: AnalysisResult | null
}

defineProps<Props>()
defineEmits<{
  dismissError: [index: number]
}>()
</script>
