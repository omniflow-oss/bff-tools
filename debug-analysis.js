import { analyzeUsage } from './src/utils/analysis.js'

// Debug the failing test case
const jsonData = JSON.stringify({
  config: {
    database: {
      host: 'localhost',
      port: 5432,
      credentials: {
        username: 'admin',
        password: 'secret'
      }
    },
    cache: {
      enabled: true,
      ttl: 300
    }
  },
  features: [
    { name: 'feature1', enabled: true },
    { name: 'feature2', enabled: false }
  ]
})

const template = `
  Database: {{config.database.host}}:{{config.database.port}}
  Username: {{config.database.credentials.username}}
  
  {{#features}}
  Feature: {{name}} - {{enabled}}
  {{/features}}
`

const result = analyzeUsage(jsonData, template)
console.log('Unused:', result.unused)
console.log('Missing:', result.missing)

// Debug conditional sections test
const jsonData2 = JSON.stringify({
  projects: [
    {
      name: 'Project Alpha',
      status: 'active',
      teams: [
        {
          name: 'Frontend Team',
          members: [
            {
              name: 'Alice',
              role: 'Developer',
              isLead: true,
              contact: {
                email: 'alice@example.com',
                phone: '123-456-7890'
              }
            }
          ]
        }
      ]
    }
  ]
})

const template2 = `
  {{#projects}}
  {{#status}}Project: {{name}} ({{status}}){{/status}}
  {{#teams}}
  Team: {{name}}
  {{#members}}
  {{#isLead}}⭐ Lead: {{/isLead}}{{name}} - {{role}}
  {{/members}}
  {{/teams}}
  {{/projects}}
`

const result2 = analyzeUsage(jsonData2, template2)
console.log('\nConditional sections test:')
console.log('Unused:', result2.unused)
console.log('Missing:', result2.missing)
