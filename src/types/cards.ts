export type CardType = 'json' | 'template' | 'output'

export interface CardConfig {
  ref: string
  title: string
  contentKey: string
  formatter: (content: string, options?: any) => string
  validator: (content: string) => void
  language: string
}

export interface ValidationError {
  line: number
  column: number
  message: string
  path: string
  severity: 'error' | 'warning'
}
