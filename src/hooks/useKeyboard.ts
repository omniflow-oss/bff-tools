import { onMounted, onUnmounted } from 'vue'

export const useKeyboard = (handlers: Record<string, () => void>) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    const key = getKeyCombo(event)
    if (handlers[key]) {
      event.preventDefault()
      handlers[key]()
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
}

const getKeyCombo = (event: KeyboardEvent): string => {
  const parts: string[] = []
  
  if (event.ctrlKey || event.metaKey) parts.push('cmd')
  if (event.shiftKey) parts.push('shift')
  if (event.altKey) parts.push('alt')
  
  parts.push(event.key.toLowerCase())
  
  return parts.join('+')
}
