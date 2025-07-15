import { formatJSON, formatMustache } from '../src/utils/format.js'

// Test JSON formatting
const testJSON = '{"name":"John","age":30,"hobbies":["reading","coding"]}'
console.log('=== JSON Formatting Test ===')
console.log('Input:', testJSON)
try {
  const formatted = formatJSON(testJSON)
  console.log('Output:')
  console.log(formatted)
} catch (error) {
  console.error('Error:', error.message)
}

// Test Mustache formatting
const testTemplate = `{{#users}}{{name}} - {{email}}{{#isAdmin}}Admin: {{permissions}}{{#roles}}Role: {{.}}{{/roles}}{{/isAdmin}}{{/users}}`
console.log('\n=== Mustache Formatting Test ===')
console.log('Input:', testTemplate)
try {
  const formatted = formatMustache(testTemplate)
  console.log('Output:')
  console.log(formatted)
} catch (error) {
  console.error('Error:', error.message)
}
