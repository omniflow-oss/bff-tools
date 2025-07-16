import { TextDocument } from 'vscode-languageserver-textdocument'
import { getLanguageService } from 'vscode-json-languageservice'
import { applyEdits, Edit } from 'jsonc-parser'
import { TextEdit } from 'vscode-languageserver-types'

interface FormatOptions {
  tabSize?: number
  insertSpaces?: boolean
  eol?: string
}

// Convert VS Code TextEdit to jsonc-parser Edit
function convertTextEdits(textDocument: TextDocument, textEdits: TextEdit[]): Edit[] {
  return textEdits.map(edit => ({
    offset: textDocument.offsetAt(edit.range.start),
    length: textDocument.offsetAt(edit.range.end) - textDocument.offsetAt(edit.range.start),
    content: edit.newText
  }))
}

export const formatJSON = (json: string, options: FormatOptions = {}): string => {
  try {
    const {
      tabSize = 2,
      insertSpaces = true,
      eol = '\n'
    } = options

    // Parse to validate JSON first
    JSON.parse(json)

    // Create a TextDocument for VS Code Language Service
    const uri = 'untitled://temp.json'
    const doc = TextDocument.create(uri, 'json', 1, json)

    // Get the JSON Language Service
    const jsonService = getLanguageService({})

    // Format the document
    const textEdits = jsonService.format(
      doc,
      undefined, // whole document
      {
        tabSize,
        insertSpaces,
        eol
      }
    )

    // Convert TextEdit[] to Edit[] and apply the formatting edits
    const edits = convertTextEdits(doc, textEdits)
    let formatted = applyEdits(json, edits)
    
    // Handle line endings manually if needed
    if (eol !== '\n') {
      formatted = formatted.replace(/\n/g, eol)
    }
    
    return formatted
  } catch (error) {
    throw new Error(`JSON formatting failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const formatMustache = (template: string, options: FormatOptions = {}): string => {
  try {
    const {
      tabSize = 2,
      insertSpaces = true,
      eol = '\n'
    } = options

    // Check if this looks like JSON before trying to format as JSON
    const trimmed = template.trim()
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      // This doesn't look like JSON, format as plain template
      return template.replace(/\{\{([^{}]+)\}\}/g, (_, content) => {
        const trimmedContent = content.trim()
        if (trimmedContent.startsWith('#') || trimmedContent.startsWith('/') || trimmedContent.startsWith('^')) {
          return `{{${trimmedContent}}}`
        }
        // For plain templates, no spacing
        return `{{${trimmedContent}}}`
      })
    }

    // For JSON Mustache templates, we need to handle them as JSON with Mustache placeholders
    
    // First, temporarily replace Mustache placeholders with valid JSON placeholders
    const placeholders = new Map<string, string>()
    let placeholderIndex = 0
    
    // Replace different types of Mustache syntax with order preservation
    let tempTemplate = template
      // Replace block helpers first (they're larger patterns)
      .replace(/\{\{#([^}]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, sectionName, content) => {
        const placeholder = `"__BLOCK_${placeholderIndex++}__"`
        // Format variables inside the block content
        const formattedContent = content
          // First, handle unescaped variables (preserve them as-is)
          .replace(/\{\{\{([^}]+)\}\}\}/g, (_: string, varContent: string) => {
            return `{{{${varContent.trim()}}}}`
          })
          // Then, handle regular variables (add spacing)
          .replace(/\{\{([^#/^!>][^}]*)\}\}/g, (_m: string, varContent: string) => {
            const trimmed = varContent.trim()
            return `{{ ${trimmed} }}`
          })
        const formattedBlock = `{{#${sectionName.trim()}}}${formattedContent}{{/${sectionName.trim()}}}`
        placeholders.set(placeholder, formattedBlock)
        return placeholder
      })
      // Replace inverted sections
      .replace(/\{\{\^([^}]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, sectionName, content) => {
        const placeholder = `"__BLOCK_${placeholderIndex++}__"`
        // Format variables inside the inverted section content
        const formattedContent = content
          // First, handle unescaped variables (preserve them as-is)
          .replace(/\{\{\{([^}]+)\}\}\}/g, (_: string, varContent: string) => {
            return `{{{${varContent.trim()}}}}`
          })
          // Then, handle regular variables (add spacing)
          .replace(/\{\{([^#/^!>][^}]*)\}\}/g, (_m: string, varContent: string) => {
            const trimmed = varContent.trim()
            return `{{ ${trimmed} }}`
          })
        const formattedBlock = `{{^${sectionName.trim()}}}${formattedContent}{{/${sectionName.trim()}}}`
        placeholders.set(placeholder, formattedBlock)
        return placeholder
      })
      // Replace {{{variable}}} (unescaped) 
      .replace(/\{\{\{([^}]+)\}\}\}/g, (_, content) => {
        const placeholder = `"__PLACEHOLDER_${placeholderIndex++}__"`
        // Store cleaned unescaped variable (no extra spacing)
        const cleaned = `{{{${content.trim()}}}}`
        placeholders.set(placeholder, cleaned)
        return placeholder
      })
      // Replace {{variable}} with temporary placeholders
      .replace(/\{\{([^#/^!>][^}]*)\}\}/g, (_, content) => {
        const placeholder = `"__PLACEHOLDER_${placeholderIndex++}__"`
        // Store formatted regular variable (with spacing for readability in JSON contexts)
        const trimmed = content.trim()
        let cleaned
        if (trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed.startsWith('^')) {
          cleaned = `{{${trimmed}}}`
        } else {
          // In JSON context, add spacing for better readability
          cleaned = `{{ ${trimmed} }}`
        }
        placeholders.set(placeholder, cleaned)
        return placeholder
      })

    try {
      // Try to format as JSON using VS Code Language Service
      const uri = 'untitled://temp.json'
      const doc = TextDocument.create(uri, 'json', 1, tempTemplate)
      const jsonService = getLanguageService({})
      
      const textEdits = jsonService.format(
        doc,
        undefined,
        {
          tabSize,
          insertSpaces,
          eol
        }
      )
      
      const edits = convertTextEdits(doc, textEdits)
      tempTemplate = applyEdits(tempTemplate, edits)
    } catch {
      // If it's not valid JSON even with placeholders, fall back to basic formatting
      // For plain templates, don't add spacing to variables
      return template.replace(/\{\{([^{}]+)\}\}/g, (_, content) => {
        const trimmed = content.trim()
        if (trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed.startsWith('^')) {
          return `{{${trimmed}}}`
        }
        // For plain templates, no spacing
        return `{{${trimmed}}}`
      })
    }

    // Restore Mustache placeholders with proper formatting
    placeholders.forEach((original, placeholder) => {
      // Handle both quoted and unquoted placeholders
      const quotedPlaceholder = placeholder
      const unquotedPlaceholder = placeholder.replace(/^"/, '').replace(/"$/, '')
      
      if (original.includes('\n')) {
        // For block helpers, maintain the block structure
        tempTemplate = tempTemplate.replace(quotedPlaceholder, original)
      } else {
        // For simple variables, preserve original formatting and remove quotes
        let cleaned = original
        // Try both quoted and unquoted versions
        if (tempTemplate.includes(quotedPlaceholder)) {
          tempTemplate = tempTemplate.replace(quotedPlaceholder, cleaned)
        } else if (tempTemplate.includes(unquotedPlaceholder)) {
          tempTemplate = tempTemplate.replace(unquotedPlaceholder, cleaned)
        }
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

export const formatSchema = (schema: string, options: FormatOptions = {}): string => {
  return formatJSON(schema, options)
}
