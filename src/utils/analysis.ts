import Mustache from 'mustache'

export interface AnalysisResult {
  unused: string[]
  missing: string[]
}

export const analyzeUsage = (jsonData: string, template: string): AnalysisResult => {
  try {
    const data = JSON.parse(jsonData)
    
    const jsonPaths = collectJsonPaths(data)
    const templateVars = collectMustacheVars(template)
    
    // Use conservative matching: exact match and simple context-aware matching
    const unused = [...jsonPaths].filter(path => !isPathUsedConservatively(path, templateVars))
    const missing = [...templateVars].filter(path => !jsonPaths.has(path))
    
    return { unused, missing }
  } catch (error) {
    console.warn('Analysis failed:', error)
    return { unused: [], missing: [] }
  }
}

function isPathUsedConservatively(jsonPath: string, templateVars: Set<string>): boolean {
  // Direct match
  if (templateVars.has(jsonPath)) {
    return true
  }
  
  // Conservative context matching: only match if the json path suffix 
  // matches a template variable AND there's a clear context that exists
  const jsonParts = jsonPath.split('.')
  
  for (const templateVar of templateVars) {
    const templateParts = templateVar.split('.')
    
    // Simple suffix matching for nested contexts
    if (templateParts.length < jsonParts.length) {
      const jsonSuffix = jsonParts.slice(-templateParts.length).join('.')
      if (jsonSuffix === templateVar) {
        // Check if the prefix forms a valid context
        const contextPath = jsonParts.slice(0, jsonParts.length - templateParts.length).join('.')
        if (templateVars.has(contextPath)) {
          return true
        }
      }
    }
  }
  
  return false
}

function collectJsonPaths(obj: any, prefix = ''): Set<string> {
  const paths = new Set<string>()
  if (typeof obj !== 'object' || obj === null) return paths

  if (Array.isArray(obj)) {
    // For arrays, don't include numeric indices in paths
    // Instead, process the first item to get the structure
    if (obj.length > 0) {
      // Recursively collect paths from the first array item
      collectJsonPaths(obj[0], prefix).forEach(p => paths.add(p))
    }
  } else {
    // For objects, process each property
    for (const key in obj) {
      const fullPath = prefix ? `${prefix}.${key}` : key
      paths.add(fullPath)
      if (typeof obj[key] === 'object') {
        collectJsonPaths(obj[key], fullPath).forEach(p => paths.add(p))
      }
    }
  }
  return paths
}

function collectMustacheVars(template: string): Set<string> {
  const tags = new Set<string>()
  
  try {
    const tokens = Mustache.parse(template)
    
    // Process the tokens recursively to handle nested sections properly
    parseTokensRecursively(tokens, [], tags)
    
  } catch (error) {
    console.warn('Error parsing Mustache template:', error)
  }
  
  return tags
}

function parseTokensRecursively(tokens: any[], contextStack: string[], tags: Set<string>): void {
  for (const token of tokens) {
    const [type, name, , , children] = token
    
    if (type === '#' || type === '^') {
      // Section - mark the section variable itself as used (the array/list)
      const sectionPath = [...contextStack, name].filter(Boolean).join('.')
      tags.add(sectionPath)
      
      // Process children with this context
      const newStack = [...contextStack, name]
      if (children && children.length > 0) {
        parseTokensRecursively(children, newStack, tags)
      }
    } else if (type === 'name' || type === '&') {
      if (name === '.') {
        // Current context reference - mark the current context as used
        if (contextStack.length > 0) {
          const currentContext = contextStack.join('.')
          tags.add(currentContext)
        }
      } else {
        // Variable - add with current context
        const fullPath = [...contextStack, name].filter(Boolean).join('.')
        tags.add(fullPath)
      }
    }
  }
}


