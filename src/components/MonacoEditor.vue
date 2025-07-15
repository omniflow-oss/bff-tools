<template>
  <div ref="editorContainer" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { monaco } from '@/utils/monaco'

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
let isUpdatingFromExternal = false

onMounted(async () => {
  await nextTick()
  
  if (!editorContainer.value) return

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
    automaticLayout: true,
    glyphMargin: true
  })

  // Listen for content changes
  editor.onDidChangeModelContent(() => {
    if (editor && !isUpdatingFromExternal) {
      emit('update:modelValue', editor.getValue())
    }
  })
})

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (editor && editor.getValue() !== newValue) {
    isUpdatingFromExternal = true
    editor.setValue(newValue)
    isUpdatingFromExternal = false
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
  },
  setValidationErrors: (errors: any[]) => {
    if (editor) {
      const decorations = errors.map(error => {
        const isWarning = error.severity === 'warning'
        return {
          range: new monaco.Range(error.line, error.column, error.line, error.column + 15),
          options: {
            isWholeLine: false,
            className: isWarning ? 'validation-warning-line' : 'validation-error-line',
            glyphMarginClassName: isWarning ? 'validation-warning-glyph' : 'validation-error-glyph',
            hoverMessage: { 
              value: `**${isWarning ? 'WARNING' : 'ERROR'}**: ${error.message}\n\nPath: \`${error.path}\`` 
            },
            minimap: {
              color: isWarning ? '#ffaa00' : '#ff4444',
              position: monaco.editor.MinimapPosition.Inline
            },
            overviewRuler: {
              color: isWarning ? '#ffaa00' : '#ff4444',
              position: monaco.editor.OverviewRulerLane.Right
            },
            inlineClassName: isWarning ? 'validation-warning-inline' : 'validation-error-inline'
          }
        }
      })
      
      // Remove old decorations and add new ones
      const oldDecorations = (editor as any)._validationDecorations || []
      const newDecorations = editor.deltaDecorations(oldDecorations, decorations)
      ;(editor as any)._validationDecorations = newDecorations
    }
  },
  clearValidationErrors: () => {
    if (editor) {
      const oldDecorations = (editor as any)._validationDecorations || []
      editor.deltaDecorations(oldDecorations, [])
      ;(editor as any)._validationDecorations = []
    }
  }
})
</script>

<style>
/* Validation error styles */
.validation-error-line {
  background: rgba(255, 68, 68, 0.1);
  border-left: 3px solid #ff4444;
}

.validation-error-glyph {
  background: #ff4444;
  width: 16px !important;
  height: 16px !important;
  border-radius: 50%;
  position: relative;
}

.validation-error-glyph::after {
  content: '!';
  color: white;
  font-weight: bold;
  font-size: 12px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.validation-error-inline {
  text-decoration: underline;
  text-decoration-color: #ff4444;
  text-decoration-style: wavy;
}

/* Validation warning styles */
.validation-warning-line {
  background: rgba(255, 170, 0, 0.1);
  border-left: 3px solid #ffaa00;
}

.validation-warning-glyph {
  background: #ffaa00;
  width: 16px !important;
  height: 16px !important;
  border-radius: 50%;
  position: relative;
}

.validation-warning-glyph::after {
  content: '⚠';
  color: white;
  font-weight: bold;
  font-size: 10px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.validation-warning-inline {
  text-decoration: underline;
  text-decoration-color: #ffaa00;
  text-decoration-style: dotted;
}
</style>
