// Monaco Editor worker configuration
import * as monaco from 'monaco-editor'

// Import workers
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

// Configure Handlebars language for Mustache templates
monaco.languages.register({ id: 'handlebars' })

monaco.languages.setMonarchTokensProvider('handlebars', {
  tokenizer: {
    root: [
      [/\{\{/, 'delimiter', '@mustache'],
      [/[^{]+/, 'text']
    ],
    mustache: [
      [/\}\}/, 'delimiter', '@pop'],
      [/[#^/]/, 'keyword'],
      [/[^}]+/, 'variable']
    ]
  }
})

monaco.languages.setLanguageConfiguration('handlebars', {
  brackets: [
    ['{{', '}}']
  ],
  autoClosingPairs: [
    { open: '{{', close: '}}' }
  ]
})

export { monaco }
