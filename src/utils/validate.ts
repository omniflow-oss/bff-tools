import Ajv, { ErrorObject } from 'ajv'
import addFormats from 'ajv-formats'

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

export interface ValidationError {
  path: string
  message: string
  line?: number
}

export const validateJSON = (data: string, schema: string): ValidationError[] => {
  try {
    const parsedData = JSON.parse(data)
    const parsedSchema = JSON.parse(schema)
    
    const validate = ajv.compile(parsedSchema)
    const valid = validate(parsedData)
    
    if (!valid && validate.errors) {
      return validate.errors.map((error: ErrorObject) => ({
        path: error.instancePath || error.schemaPath,
        message: error.message || 'Validation error',
        line: getLineNumber(data, error.instancePath || '')
      }))
    }
    
    return []
  } catch (error) {
    if (error instanceof SyntaxError) {
      return [{
        path: 'root',
        message: `JSON parsing failed: ${error.message}`,
        line: 1
      }]
    }
    return [{
      path: 'root',
      message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      line: 1
    }]
  }
}

const getLineNumber = (jsonString: string, path: string): number => {
  if (!path) return 1
  
  try {
    const lines = jsonString.split('\n')
    const pathParts = path.split('/').filter(p => p)
    
    // Simple line estimation - find the property in the JSON
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (pathParts.some(part => line.includes(`"${part}"`))) {
        return i + 1
      }
    }
  } catch {
    // Fallback to line 1 if path parsing fails
  }
  
  return 1
}
