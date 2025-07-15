import * as prettier from 'prettier/standalone'
import * as babelParser from 'prettier/parser-babel'

export const formatJSON = (json: string): string => {
  try {
    return prettier.format(json, {
      parser: 'json',
      plugins: [babelParser],
      tabWidth: 2,
      semi: false,
      singleQuote: true
    })
  } catch (error) {
    throw new Error(`JSON formatting failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const formatMustache = (template: string): string => {
  try {
    // Simple formatting for Mustache templates
    // Since prettier doesn't have a handlebars parser in standalone, we'll do basic formatting
    return template
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      .replace(/\{\{/g, '{{ ')
      .replace(/\}\}/g, ' }}')
      .replace(/\{\{#/g, '{{#')
      .replace(/\{\{\//g, '{{/')
      .replace(/\s+\}\}/g, '}}')
  } catch (error) {
    throw new Error(`Template formatting failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const formatSchema = (schema: string): string => {
  return formatJSON(schema)
}
