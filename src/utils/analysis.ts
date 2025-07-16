import Mustache from 'mustache'
import proxyData from 'mustache-validator'

export interface AnalysisResult {
  unused: string[]
  missing: string[]
}

export const analyzeUsage = (jsonData: string, template: string): AnalysisResult => {
  try {
    const data = JSON.parse(jsonData)
    
    // Track all JSON paths available in the data
    const allJsonPaths = collectJsonPaths(data)
    
    // Track missing variables (paths requested but not found in data)
    const missingPaths: string[] = []
    
    // Create proxy data with validation to detect missing paths
    const safeData = proxyData(data, {
      handleError: (path: string[]) => {
        const pathStr = path.join('.')
        missingPaths.push(pathStr)
      }
    })

    // Try to render the template to trigger the proxy validation
    try {
      Mustache.render(template, safeData)
    } catch (e) {
      // Template failed, but we still have the missing paths data
      console.warn("Template rendering failed:", e instanceof Error ? e.message : String(e))
    }

    // Get template variables manually using Mustache parser
    const templateVars = collectMustacheVars(template)
    
    // Calculate unused paths (available in JSON but not referenced in template)
    const unused = [...allJsonPaths].filter(path => !templateVars.has(path))
    
    return { 
      unused,
      missing: missingPaths
    }
  } catch (error) {
    console.warn('Analysis failed:', error)
    return { unused: [], missing: [] }
  }
}

function collectJsonPaths(obj: any, prefix = ''): Set<string> {
  const paths = new Set<string>()
  if (typeof obj !== 'object' || obj === null) return paths

  if (Array.isArray(obj)) {
    // For arrays, add the array path itself
    if (prefix) {
      paths.add(prefix)
    }
    // Process the first item to get the structure (typical array pattern)
    if (obj.length > 0) {
      collectJsonPaths(obj[0], prefix).forEach(p => {
        if (p !== prefix) paths.add(p) // Avoid duplicating the array path
      })
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


