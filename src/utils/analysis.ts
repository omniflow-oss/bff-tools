import Mustache from 'mustache'

export interface AnalysisResult {
  unused: string[]
  missing: string[]
}

export const analyzeUsage = (jsonData: string, template: string): AnalysisResult => {
  try {
    const data = JSON.parse(jsonData)
    const tokens = Mustache.parse(template)
    
    const usedKeys = new Set<string>()
    const missingKeys = new Set<string>()
    
    // Extract used variables from template
    extractVariables(tokens, usedKeys, missingKeys, data)
    
    // Find all keys in JSON data
    const allKeys = new Set<string>()
    extractAllKeys(data, '', allKeys)
    
    // Calculate unused keys
    const unused = Array.from(allKeys).filter(key => !usedKeys.has(key))
    const missing = Array.from(missingKeys)
    
    return { unused, missing }
  } catch (error) {
    console.warn('Analysis failed:', error)
    return { unused: [], missing: [] }
  }
}

const extractVariables = (
  tokens: any[],
  usedKeys: Set<string>,
  missingKeys: Set<string>,
  data: any,
  prefix = ''
): void => {
  for (const token of tokens) {
    const [type, name, , , children] = token
    
    if (type === 'name' || type === '&' || type === '{') {
      // Variable reference
      const fullPath = prefix ? `${prefix}.${name}` : name
      usedKeys.add(fullPath)
      
      // Check if the variable exists in data
      if (!hasProperty(data, name.split('.'))) {
        missingKeys.add(fullPath)
      }
    } else if (type === '#' || type === '^') {
      // Section or inverted section
      const fullPath = prefix ? `${prefix}.${name}` : name
      usedKeys.add(fullPath)
      
      if (children) {
        // Recurse into section content
        const sectionData = getProperty(data, name.split('.'))
        if (Array.isArray(sectionData) && sectionData.length > 0) {
          extractVariables(children, usedKeys, missingKeys, sectionData[0], fullPath)
        } else if (typeof sectionData === 'object' && sectionData !== null) {
          extractVariables(children, usedKeys, missingKeys, sectionData, fullPath)
        } else {
          extractVariables(children, usedKeys, missingKeys, data, prefix)
        }
      }
      
      if (!hasProperty(data, name.split('.'))) {
        missingKeys.add(fullPath)
      }
    }
  }
}

const extractAllKeys = (obj: any, prefix: string, keys: Set<string>): void => {
  if (typeof obj !== 'object' || obj === null) return
  
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const key = prefix ? `${prefix}.${index}` : index.toString()
      keys.add(key)
      extractAllKeys(item, key, keys)
    })
  } else {
    Object.keys(obj).forEach(key => {
      const fullKey = prefix ? `${prefix}.${key}` : key
      keys.add(fullKey)
      extractAllKeys(obj[key], fullKey, keys)
    })
  }
}

const hasProperty = (obj: any, path: string[]): boolean => {
  let current = obj
  for (const key of path) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return false
    }
    if (!(key in current)) {
      return false
    }
    current = current[key]
  }
  return true
}

const getProperty = (obj: any, path: string[]): any => {
  let current = obj
  for (const key of path) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined
    }
    current = current[key]
  }
  return current
}
