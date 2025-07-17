<template>
  <!-- Error Bar -->
  <Transition name="slide-down">
    <div v-if="errors.length > 0" class="bg-red-50 border-b border-red-100 text-red-800 p-3 flex-shrink-0">
      <div class="max-w-7xl mx-auto">
        <div v-for="(error, index) in errors" :key="index" class="flex items-center justify-between mb-1 last:mb-0">
          <span class="text-sm">{{ error }}</span>
          <button
            @click="$emit('dismissError', index)"
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
</template>

<script setup lang="ts">
interface Props {
  errors: string[]
}

defineProps<Props>()
defineEmits<{
  dismissError: [index: number]
}>()
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
