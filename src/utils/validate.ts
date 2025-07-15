import Ajv, { ErrorObject } from 'ajv'
import addFormats from 'ajv-formats'
import * as monaco from 'monaco-editor'

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

export interface ValidationError {
  path: string
  message: string
  line: number
  column: number
  severity: 'error' | 'warning'
}

export interface ValidationDecoration {
  range: monaco.IRange
  options: monaco.editor.IModelDecorationOptions
}

export const validateJSON = (data: string, schema: string): ValidationError[] => {
  try {
    const parsedData = JSON.parse(data)
    const parsedSchema = JSON.parse(schema)
    
    const validate = ajv.compile(parsedSchema)
    const valid = validate(parsedData)
    
    if (!valid && validate.errors) {
      return validate.errors.map((error: ErrorObject) => {
        const errorMessage = error.message || 'Validation error'
        const keywordSuffix = error.keyword ? ` (${error.keyword})` : ''
        const location = getErrorLocation(data, error.instancePath || '')
        return {
          path: error.instancePath || error.schemaPath || 'root',
          message: errorMessage + keywordSuffix,
          line: location.line,
          column: location.column,
          severity: 'error' as const
        }
      })
    }
    
    return []
  } catch (error) {
    if (error instanceof SyntaxError) {
      const location = getJSONSyntaxErrorLocation(data, error.message)
      return [{
        path: 'root',
        message: `JSON parsing failed: ${error.message}`,
        line: location.line,
        column: location.column,
        severity: 'error' as const
      }]
    }
    return [{
      path: 'root',
      message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      line: 1,
      column: 1,
      severity: 'error' as const
    }]
  }
}

const getErrorLocation = (jsonString: string, path: string): { line: number; column: number } => {
  if (!path) return { line: 1, column: 1 }
  
  try {
    const lines = jsonString.split('\n')
    const pathParts = path.split('/').filter(p => p)
    
    // Find the exact location of the property
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex]
      const location = findPropertyInLine(line, pathParts, lineIndex)
      if (location) return location
    }
    
    // Fallback: search for any part of the path
    return findFallbackLocation(lines, pathParts)
  } catch {
    return { line: 1, column: 1 }
  }
}

const findPropertyInLine = (line: string, pathParts: string[], lineIndex: number): { line: number; column: number } | null => {
  for (const part of pathParts) {
    const propertyRegex = new RegExp(`"${escapeRegExp(part)}"\\s*:`)
    const propertyMatch = propertyRegex.exec(line)
    if (propertyMatch) {
      return {
        line: lineIndex + 1,
        column: propertyMatch.index + 1
      }
    }
    
    // Check for array indices
    if (/^\d+$/.test(part)) {
      const arrayRegex = /\[/
      const arrayMatch = arrayRegex.exec(line)
      if (arrayMatch) {
        return {
          line: lineIndex + 1,
          column: arrayMatch.index + 1
        }
      }
    }
  }
  return null
}

const findFallbackLocation = (lines: string[], pathParts: string[]): { line: number; column: number } => {
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]
    if (pathParts.some(part => line.includes(`"${part}"`))) {
      const regex = /"[^"]*"/
      const match = regex.exec(line)
      return {
        line: lineIndex + 1,
        column: match ? match.index + 1 : 1
      }
    }
  }
  return { line: 1, column: 1 }
}

const getJSONSyntaxErrorLocation = (jsonString: string, errorMessage: string): { line: number; column: number } => {
  // Try to extract line and column from error message
  const lineRegex = /line (\d+)/i
  const columnRegex = /column (\d+)/i
  const positionRegex = /position (\d+)/i
  
  const lineMatch = lineRegex.exec(errorMessage)
  const columnMatch = columnRegex.exec(errorMessage)
  const positionMatch = positionRegex.exec(errorMessage)
  
  if (lineMatch && columnMatch) {
    return {
      line: parseInt(lineMatch[1], 10),
      column: parseInt(columnMatch[1], 10)
    }
  }
  
  if (positionMatch) {
    const position = parseInt(positionMatch[1], 10)
    const lines = jsonString.slice(0, position).split('\n')
    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1
    }
  }
  
  return { line: 1, column: 1 }
}

const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const createValidationDecorations = (errors: ValidationError[]): ValidationDecoration[] => {
  return errors.map(error => ({
    range: new monaco.Range(error.line, error.column, error.line, error.column + 10),
    options: {
      isWholeLine: false,
      className: error.severity === 'error' ? 'validation-error-decoration' : 'validation-warning-decoration',
      hoverMessage: {
        value: `**${error.severity.toUpperCase()}**: ${error.message}\n\nPath: \`${error.path}\``
      },
      minimap: {
        color: error.severity === 'error' ? '#ff4444' : '#ffaa00',
        position: monaco.editor.MinimapPosition.Inline
      },
      overviewRuler: {
        color: error.severity === 'error' ? '#ff4444' : '#ffaa00',
        position: monaco.editor.OverviewRulerLane.Right
      }
    }
  }))
}
