import type { CardType, CardConfig } from '@/types/cards'
import { formatJSON, formatMustache, formatMustacheAsTemplate } from '@/utils/format'

// Format Options
export const DEFAULT_FORMAT_OPTIONS = {
  tabSize: 2,
  insertSpaces: true,
  eol: '\n'
} as const

// Validation Functions
export function validateJSONContent(content: string): void {
  JSON.parse(content)
}

export function validateMustacheTemplate(template: string): void {
  // Check for unmatched opening braces
  const openBraces = (template.match(/\{\{/g) || []).length
  const closeBraces = (template.match(/\}\}/g) || []).length
  
  if (openBraces !== closeBraces) {
    throw new Error(`Unmatched braces: ${openBraces} opening {{ but ${closeBraces} closing }}`)
  }
  
  // Check for unmatched triple braces
  const openTripleBraces = (template.match(/\{\{\{/g) || []).length
  const closeTripleBraces = (template.match(/\}\}\}/g) || []).length
  
  if (openTripleBraces !== closeTripleBraces) {
    throw new Error(`Unmatched triple braces: ${openTripleBraces} opening {{{ but ${closeTripleBraces} closing }}}`)
  }
  
  // Check for unmatched section tags
  const sectionTags = template.match(/\{\{[#^]/g) || []
  const closingTags = template.match(/\{\{\//g) || []
  
  if (sectionTags.length !== closingTags.length) {
    throw new Error(`Unmatched section tags: ${sectionTags.length} opening sections but ${closingTags.length} closing tags`)
  }
  
  // Check for proper section tag pairing
  const stack: string[] = []
  const regex = /\{\{([#^])([^}]+)\}\}|\{\{\/([^}]+)\}\}/g
  let match
  
  while ((match = regex.exec(template)) !== null) {
    if (match[1]) {
      stack.push(match[2].trim())
    } else if (match[3]) {
      const expected = stack.pop()
      const actual = match[3].trim()
      if (expected !== actual) {
        throw new Error(`Mismatched section tags: opened with {{#${expected}}} but closed with {{/${actual}}}`)
      }
    }
  }
  
  if (stack.length > 0) {
    const unclosedTags = stack.map(tag => '{{#' + tag + '}}').join(', ')
    throw new Error(`Unclosed section tags: ${unclosedTags}`)
  }
}

// Formatting Functions
export function formatMustacheContent(content: string, options = DEFAULT_FORMAT_OPTIONS): string {
  try {
    return formatMustache(content, options)
  } catch {
    return formatMustacheAsTemplate(content)
  }
}

// Card Configuration
export const cardConfigs: Record<CardType, CardConfig> = {
  json: {
    ref: 'jsonCard',
    title: 'JSON Data',
    contentKey: 'json',
    formatter: formatJSON,
    validator: validateJSONContent,
    language: 'json'
  },
  template: {
    ref: 'templateCard',
    title: 'Mustache Template',
    contentKey: 'template',
    formatter: formatMustacheContent,
    validator: validateMustacheTemplate,
    language: 'json'
  },
  output: {
    ref: 'outputCard',
    title: 'JSON Output',
    contentKey: 'output',
    formatter: formatJSON,
    validator: validateJSONContent,
    language: 'json'
  }
}
