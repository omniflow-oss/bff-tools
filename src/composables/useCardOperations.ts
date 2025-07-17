import type { CardType } from '@/types/cards'
import { cardConfigs, DEFAULT_FORMAT_OPTIONS } from '@/config/cards'
import { analyzeUsage } from '@/utils/analysis'
import { exportSession as exportZip } from '@/utils/zip'
import { renderTemplate } from '@/utils/render'
import { debounce } from '@/utils/debounce'
import {
  findErrorLine,
  findVariableLineInJSON,
  findVariableLineInTemplate,
  createValidationError
} from '@/utils/validation-helpers'

export function useCardOperations(store: any, getCardRef: (cardType: CardType) => any) {
  
  function showSuccessMessage(message: string, timeout = 3000) {
    store.showError(`✅ ${message}`)
    setTimeout(() => store.clearErrors(), timeout)
  }

  const debouncedRender = debounce(() => {
    try {
      store.clearErrors()
      
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

  const toggleMaximise = (cardId: string) => {
    if (store.maximisedCard === cardId) {
      store.setMaximisedCard(null)
    } else {
      store.setMaximisedCard(cardId)
    }
  }

  const formatCard = (cardType: CardType) => {
    try {
      const config = cardConfigs[cardType]
      const currentContent = store[config.contentKey] as string
      const formattedContent = config.formatter(currentContent, DEFAULT_FORMAT_OPTIONS)
      ;(store[config.contentKey] as string) = formattedContent
    } catch (error) {
      store.showError(error instanceof Error ? error.message : 'Formatting failed')
    }
  }

  const validateCard = (cardType: CardType) => {
    try {
      const config = cardConfigs[cardType]
      const cardRef = getCardRef(cardType)
      const content = store[config.contentKey] as string
      
      cardRef?.clearValidationErrors()
      store.clearErrors()
      
      try {
        config.validator(content)
        showSuccessMessage(`${config.title} is valid!`)
      } catch (error) {
        const errorMsg = `❌ ${config.title} validation failed: ${error instanceof Error ? error.message : 'Invalid format'}`
        store.showError(errorMsg)
        
        const lineNumber = findErrorLine(content, error instanceof Error ? error.message : '')
        const validationError = createValidationError(
          lineNumber,
          error instanceof Error ? error.message : 'Validation error',
          'root'
        )
        
        cardRef?.setValidationErrors([validationError])
      }
    } catch (error) {
      store.showError(error instanceof Error ? error.message : 'Validation failed')
    }
  }

  const checkUsage = () => {
    try {
      getCardRef('json')?.clearValidationErrors()
      getCardRef('template')?.clearValidationErrors()
      
      const usageResult = analyzeUsage(store.json, store.template)
      
      // Highlight unused variables in JSON editor
      if (usageResult.unused.length > 0) {
        const unusedErrors = usageResult.unused.map(variable => 
          createValidationError(
            findVariableLineInJSON(store.json, variable),
            `Unused variable: ${variable}`,
            variable,
            'warning'
          )
        )
        getCardRef('json')?.setValidationErrors(unusedErrors)
      }
      
      // Highlight missing variables in template editor
      if (usageResult.missing.length > 0) {
        const missingErrors = usageResult.missing.map(variable =>
          createValidationError(
            findVariableLineInTemplate(store.template, variable),
            `Missing variable: ${variable}`,
            variable
          )
        )
        getCardRef('template')?.setValidationErrors(missingErrors)
      }
      
      return usageResult
    } catch (error) {
      store.showError(error instanceof Error ? error.message : 'Usage analysis failed')
      return { unused: [], missing: [] }
    }
  }

  const exportSession = async () => {
    try {
      await exportZip(store.json, store.template, store.output)
    } catch (error) {
      store.showError(error instanceof Error ? error.message : 'Export failed')
    }
  }

  const resetSession = () => {
    try {
      store.clearStorage()
      setTimeout(() => debouncedRender(), 100)
    } catch (error) {
      store.showError(error instanceof Error ? error.message : 'Reset failed')
    }
  }

  return {
    debouncedRender,
    toggleMaximise,
    formatCard,
    validateCard,
    checkUsage,
    exportSession,
    resetSession
  }
}
