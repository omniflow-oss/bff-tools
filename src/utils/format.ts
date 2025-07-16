export const formatJSON = (json: string): string => {
  try {
    // Parse and stringify with proper indentation
    const parsed = JSON.parse(json)
    return JSON.stringify(parsed, null, 2)
  } catch (error) {
    throw new Error(`JSON formatting failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const formatMustache = (template: string): string => {
  try {
    // For JSON Mustache templates, we need to handle them as JSON with Mustache placeholders
    
    // First, temporarily replace Mustache placeholders with valid JSON placeholders
    const placeholders = new Map<string, string>()
    let placeholderIndex = 0
    
    // Replace different types of Mustache syntax
    let tempTemplate = template
      // Replace {{variable}} with temporary placeholders
      .replace(/\{\{([^#/^!>][^}]*)\}\}/g, (match) => {
        const placeholder = `"__PLACEHOLDER_${placeholderIndex++}__"`
        placeholders.set(placeholder, match)
        return placeholder
      })
      // Replace {{{variable}}} (unescaped) with temporary placeholders  
      .replace(/\{\{\{([^}]+)\}\}\}/g, (match) => {
        const placeholder = `"__PLACEHOLDER_${placeholderIndex++}__"`
        placeholders.set(placeholder, match)
        return placeholder
      })
      // Replace block helpers {{#each}}...{{/each}}
      .replace(/\{\{#([^}]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match) => {
        const placeholder = `"__BLOCK_${placeholderIndex++}__"`
        placeholders.set(placeholder, match)
        return placeholder
      })
      // Replace inverted sections {{^if}}...{{/if}}
      .replace(/\{\{\^([^}]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match) => {
        const placeholder = `"__BLOCK_${placeholderIndex++}__"`
        placeholders.set(placeholder, match)
        return placeholder
      })

    try {
      // Try to format as JSON
      const parsed = JSON.parse(tempTemplate)
      tempTemplate = JSON.stringify(parsed, null, 2)
    } catch {
      // If it's not valid JSON even with placeholders, fall back to basic formatting
      return formatMustacheAsTemplate(template)
    }

    // Restore Mustache placeholders with proper formatting
    placeholders.forEach((original, placeholder) => {
      if (original.includes('\n')) {
        // For block helpers, maintain the block structure
        tempTemplate = tempTemplate.replace(placeholder, original)
      } else {
        // For simple variables, add spacing for readability
        const cleaned = original.replace(/\{\{([^{}]+)\}\}/g, (_, content) => {
          const trimmed = content.trim()
          if (trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed.startsWith('^')) {
            return `{{${trimmed}}}`
          }
          return `{{ ${trimmed} }}`
        })
        tempTemplate = tempTemplate.replace(`"${placeholder}"`, cleaned)
      }
    })

    return tempTemplate
  } catch (error) {
    throw new Error(`Template formatting failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Fallback function for non-JSON Mustache templates
export const formatMustacheAsTemplate = (template: string): string => {
  const lines = template.split(/\r?\n/)
  let indentationLevel = 0
  const formatted: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue // Remove empty lines

    if (trimmed.startsWith('}') || trimmed.startsWith(']')) {
      indentationLevel = Math.max(indentationLevel - 1, 0)
    }

    formatted.push(`${'  '.repeat(indentationLevel)}${trimmed}`)

    if (trimmed.endsWith('{') || trimmed.endsWith('[')) {
      indentationLevel++
    }
  }

  return formatted.join('\n')
}

export const formatSchema = (schema: string): string => {
  return formatJSON(schema)
}
