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
    
    // Extract used variables from template with proper context scoping
    extractVariablesWithContext(tokens, usedKeys, missingKeys, data, data, '')
    
    // Find all keys in JSON data
    const allKeys = new Set<string>()
    extractAllKeys(data, '', allKeys)
    
    // Calculate unused keys (only check root level keys for simplicity)
    const rootKeys = Array.from(allKeys).filter(key => !key.includes('.'))
    const unused = rootKeys.filter(key => !usedKeys.has(key))
    const missing = Array.from(missingKeys)
    
    return { unused, missing }
  } catch (error) {
    console.warn('Analysis failed:', error)
    return { unused: [], missing: [] }
  }
}

const extractVariablesWithContext = (
  tokens: any[],
  usedKeys: Set<string>,
  missingKeys: Set<string>,
  rootData: any,
  currentContext: any,
  contextPath: string
): void => {
  for (const token of tokens) {
    const [type, name, , , children] = token
    
    if (isVariableToken(type)) {
      handleVariableToken(name, currentContext, rootData, contextPath, usedKeys, missingKeys)
    } else if (isSectionToken(type)) {
      handleSectionToken(name, children, currentContext, rootData, contextPath, usedKeys, missingKeys)
    }
  }
}

const isVariableToken = (type: string): boolean => {
  return type === 'name' || type === '&' || type === '{'
}

const isSectionToken = (type: string): boolean => {
  return type === '#' || type === '^'
}

const handleVariableToken = (
  name: string,
  currentContext: any,
  rootData: any,
  contextPath: string,
  usedKeys: Set<string>,
  missingKeys: Set<string>
): void => {
  const resolved = resolveVariable(name, currentContext, rootData, contextPath)
  
  if (resolved.found) {
    usedKeys.add(resolved.path)
  } else {
    missingKeys.add(resolved.path)
  }
}

const handleSectionToken = (
  name: string,
  children: any[],
  currentContext: any,
  rootData: any,
  contextPath: string,
  usedKeys: Set<string>,
  missingKeys: Set<string>
): void => {
  const sectionResolved = resolveVariable(name, currentContext, rootData, contextPath)
  
  if (sectionResolved.found) {
    usedKeys.add(sectionResolved.path)
  } else {
    missingKeys.add(sectionResolved.path)
  }
  
  if (children) {
    if (sectionResolved.found) {
      processSectionChildren(children, sectionResolved, rootData, usedKeys, missingKeys)
    } else {
      // Section variable not found, but still process children with current context
      extractVariablesWithContext(children, usedKeys, missingKeys, rootData, currentContext, contextPath)
    }
  }
}

const processSectionChildren = (
  children: any[],
  sectionResolved: { found: boolean; value: any; path: string },
  rootData: any,
  usedKeys: Set<string>,
  missingKeys: Set<string>
): void => {
  const sectionValue = sectionResolved.value
  
  if (Array.isArray(sectionValue)) {
    processArraySection(children, sectionValue, sectionResolved.path, rootData, usedKeys, missingKeys)
  } else if (typeof sectionValue === 'object' && sectionValue !== null) {
    processObjectSection(children, sectionValue, sectionResolved.path, rootData, usedKeys, missingKeys)
  } else if (sectionValue) {
    // For truthy primitives, keep current context - this needs the current context passed down
    // For now, use root data as fallback
    extractVariablesWithContext(children, usedKeys, missingKeys, rootData, rootData, '')
  }
}

const processArraySection = (
  children: any[],
  sectionValue: any[],
  sectionPath: string,
  rootData: any,
  usedKeys: Set<string>,
  missingKeys: Set<string>
): void => {
  if (sectionValue.length > 0) {
    // Use first item as representative context
    const itemContext = sectionValue[0]
    extractVariablesWithContext(children, usedKeys, missingKeys, rootData, itemContext, sectionPath)
  }
}

const processObjectSection = (
  children: any[],
  sectionValue: object,
  sectionPath: string,
  rootData: any,
  usedKeys: Set<string>,
  missingKeys: Set<string>
): void => {
  extractVariablesWithContext(children, usedKeys, missingKeys, rootData, sectionValue, sectionPath)
}

const resolveVariable = (
  variableName: string,
  currentContext: any,
  rootData: any,
  contextPath: string
): { found: boolean; value: any; path: string } => {
  const parts = variableName.split('.')
  
  // First try to resolve in current context
  let current = currentContext
  let found = true
  
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      found = false
      break
    }
    if (!(part in current)) {
      found = false
      break
    }
    current = current[part]
  }
  
  if (found) {
    // Variable found in current context
    const fullPath = contextPath ? `${contextPath}.${variableName}` : variableName
    return { found: true, value: current, path: fullPath }
  }
  
  // If not found in current context, try root context
  current = rootData
  found = true
  
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      found = false
      break
    }
    if (!(part in current)) {
      found = false
      break
    }
    current = current[part]
  }
  
  if (found) {
    // Variable found in root context
    return { found: true, value: current, path: variableName }
  }
  
  // Variable not found anywhere
  const assumedPath = contextPath ? `${contextPath}.${variableName}` : variableName
  return { found: false, value: undefined, path: assumedPath }
}

const extractAllKeys = (obj: any, prefix: string, keys: Set<string>): void => {
  if (typeof obj !== 'object' || obj === null) return
  
  if (Array.isArray(obj)) {
    // For arrays, we care about the structure of items, not indices
    if (obj.length > 0) {
      extractAllKeys(obj[0], prefix, keys)
    }
  } else {
    Object.keys(obj).forEach(key => {
      const fullKey = prefix ? `${prefix}.${key}` : key
      keys.add(fullKey)
      extractAllKeys(obj[key], fullKey, keys)
    })
  }
}
