import Mustache from 'mustache'

export const renderTemplate = (template: string, data: string): string => {
  try {
    const jsonData = JSON.parse(data)
    return Mustache.render(template, jsonData)
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`JSON parsing failed: ${error.message}`)
    }
    throw new Error(`Template rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
