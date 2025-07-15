<template>
  <div ref="editorContainer" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as monaco from 'monaco-editor'

interface Props {
  modelValue: string
  language: string
  readOnly?: boolean
}

type Emits = {
  'update:modelValue': [value: string]
}

const props = withDefaults(defineProps<Props>(), {
  readOnly: false
})

const emit = defineEmits<Emits>()

const editorContainer = ref<HTMLElement>()
let editor: monaco.editor.IStandaloneCodeEditor | null = null

onMounted(async () => {
  await nextTick()
  
  if (!editorContainer.value) return

  // Configure Monaco workers
  self.MonacoEnvironment = {
    getWorkerUrl: function (moduleId, label) {
      if (label === 'json') {
        return '/monaco-editor/min/vs/language/json/json.worker.js'
      }
      if (label === 'typescript' || label === 'javascript') {
        return '/monaco-editor/min/vs/language/typescript/ts.worker.js'
      }
      return '/monaco-editor/min/vs/editor/editor.worker.js'
    }
  }

  editor = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,
    language: props.language,
    theme: 'vs-light',
    readOnly: props.readOnly,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    wordWrap: 'on',
    automaticLayout: true
  })

  // Listen for content changes
  editor.onDidChangeModelContent(() => {
    if (editor) {
      emit('update:modelValue', editor.getValue())
    }
  })
})

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (editor && editor.getValue() !== newValue) {
    editor.setValue(newValue)
  }
})

watch(() => props.language, (newLanguage) => {
  if (editor) {
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, newLanguage)
    }
  }
})

watch(() => props.readOnly, (newReadOnly) => {
  if (editor) {
    editor.updateOptions({ readOnly: newReadOnly })
  }
})

onUnmounted(() => {
  if (editor) {
    editor.dispose()
  }
})

// Expose methods for parent components
defineExpose({
  format: () => {
    if (editor) {
      editor.getAction('editor.action.formatDocument')?.run()
    }
  },
  focus: () => {
    if (editor) {
      editor.focus()
    }
  },
  addDecorations: (decorations: monaco.editor.IModelDeltaDecoration[]) => {
    if (editor) {
      return editor.deltaDecorations([], decorations)
    }
    return []
  },
  removeDecorations: (decorationIds: string[]) => {
    if (editor) {
      editor.deltaDecorations(decorationIds, [])
    }
  }
})
</script>
