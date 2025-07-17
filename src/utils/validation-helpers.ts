import type { ValidationError } from '@/types/cards'

export function findErrorLine(content: string, errorMessage: string): number {
  const lineRegex = /line (\d+)/i
  const lineMatch = lineRegex.exec(errorMessage)
  if (lineMatch) return parseInt(lineMatch[1])
  
  const posRegex = /position (\d+)/i
  const posMatch = posRegex.exec(errorMessage)
  if (posMatch) {
    const position = parseInt(posMatch[1])
    const lines = content.substring(0, position).split('\n')
    return lines.length
  }
  
  return 1
}

export function findVariableLineInJSON(json: string, variable: string): number {
  const lines = json.split('\n')
  const varName = variable.split('.')[0]
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`"${varName}"`)) {
      return i + 1
    }
  }
  return 1
}

export function findVariableLineInTemplate(template: string, variable: string): number {
  const lines = template.split('\n')
  const varName = variable.split('.').pop() || variable
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`{{${varName}}}`) || lines[i].includes(`{{ ${varName} }}`)) {
      return i + 1
    }
  }
  return 1
}

export function createValidationError(
  line: number, 
  message: string, 
  path: string, 
  severity: 'error' | 'warning' = 'error'
): ValidationError {
  return {
    line,
    column: 1,
    message,
    path,
    severity
  }
}
