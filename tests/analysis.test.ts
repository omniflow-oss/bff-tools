import { describe, it, expect } from 'vitest'
import { analyzeUsage } from '../src/utils/analysis'

describe('Analysis Utility', () => {
  describe('Basic Variable Usage', () => {
    it('should identify used variables correctly', () => {
      const jsonData = JSON.stringify({
        name: 'John',
        age: 30,
        email: 'john@example.com'
      })

      const template = 'Hello {{name}}, you are {{age}} years old!'

      const result = analyzeUsage(jsonData, template)

      expect(result.unused).toEqual(['email'])
      expect(result.missing).toEqual([])
    })

    it('should identify missing variables correctly', () => {
      const jsonData = JSON.stringify({
        name: 'John',
        age: 30
      })

      const template = 'Hello {{name}}, you are {{age}} years old. Email: {{email}}'

      const result = analyzeUsage(jsonData, template)

      expect(result.unused).toEqual([])
      expect(result.missing).toEqual(['email'])
    })
  })

  describe('Nested Object Properties', () => {
    it('should handle nested object properties', () => {
      const jsonData = JSON.stringify({
        user: {
          name: 'John',
          profile: {
            age: 30,
            location: 'NYC'
          }
        },
        unused: 'value'
      })

      const template = `
        Name: {{user.name}}
        Age: {{user.profile.age}}
      `

      const result = analyzeUsage(jsonData, template)

      expect(result.unused).toContain('unused')
      expect(result.unused).toContain('user.profile.location')
      expect(result.missing).toEqual([])
    })
  })

  describe('Array Handling', () => {
    it('should correctly handle arrays with loops', () => {
      const jsonData = JSON.stringify({
        users: [
          { name: 'John', email: 'john@example.com' },
          { name: 'Jane', email: 'jane@example.com' }
        ],
        unused: 'value'
      })

      const template = `
        {{#users}}
        Name: {{name}}
        {{/users}}
      `

      const result = analyzeUsage(jsonData, template)

      expect(result.unused).toContain('unused')
      expect(result.unused).toContain('users.email') // email is not used in template
      expect(result.missing).toEqual([])
      
      // The 'users' array itself should be marked as used
      expect(result.unused).not.toContain('users')
    })

    it('should handle deeply nested arrays correctly', () => {
      const jsonData = JSON.stringify({
        organisms: {
          org2: {
            actions: [
              {
                destinationModel: {
                  track: {
                    properties: {
                      billAmount: 100,
                      currency: 'USD'
                    }
                  }
                }
              }
            ]
          }
        }
      })

      const template = `
        {{#organisms.org2.actions}}
        Bill: {{destinationModel.track.properties.billAmount}}
        {{/organisms.org2.actions}}
      `

      const result = analyzeUsage(jsonData, template)

      // billAmount should be used, currency should be unused
      expect(result.unused).toContain('organisms.org2.actions.destinationModel.track.properties.currency')
      expect(result.unused).not.toContain('organisms.org2.actions.destinationModel.track.properties.billAmount')
      expect(result.missing).toEqual([])
    })
  })

  describe('Complex Mustache Syntax', () => {
    it('should handle sections and inverted sections', () => {
      const jsonData = JSON.stringify({
        user: {
          name: 'John',
          isActive: true
        },
        items: [],
        unused: 'value'
      })

      const template = `
        {{#user}}
        User: {{name}}
        {{#isActive}}Active{{/isActive}}
        {{/user}}
        
        {{^items}}
        No items available
        {{/items}}
      `

      const result = analyzeUsage(jsonData, template)

      expect(result.unused).toContain('unused')
      expect(result.missing).toEqual([])
      
      // All used variables should not be in unused list
      expect(result.unused).not.toContain('user')
      expect(result.unused).not.toContain('user.name')
      expect(result.unused).not.toContain('user.isActive')
      expect(result.unused).not.toContain('items')
    })

    it('should handle unescaped variables', () => {
      const jsonData = JSON.stringify({
        htmlContent: '<p>Hello</p>',
        unused: 'value'
      })

      const template = 'Content: {{{htmlContent}}}'

      const result = analyzeUsage(jsonData, template)

      expect(result.unused).toContain('unused')
      expect(result.unused).not.toContain('htmlContent')
      expect(result.missing).toEqual([])
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty JSON and template', () => {
      const result = analyzeUsage('{}', '')

      expect(result.unused).toEqual([])
      expect(result.missing).toEqual([])
    })

    it('should handle invalid JSON gracefully', () => {
      const result = analyzeUsage('invalid json', '{{name}}')

      expect(result.unused).toEqual([])
      expect(result.missing).toEqual([])
    })

    it('should handle complex nested structures', () => {
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

      // Should identify unused fields
      expect(result.unused).toContain('config.database.credentials.password')
      expect(result.unused).toContain('config.cache.enabled')
      expect(result.unused).toContain('config.cache.ttl')
      
      // Should not mark used fields as unused
      expect(result.unused).not.toContain('config.database.host')
      expect(result.unused).not.toContain('config.database.port')
      expect(result.unused).not.toContain('config.database.credentials.username')
      expect(result.unused).not.toContain('features.name')
      expect(result.unused).not.toContain('features.enabled')
      
      expect(result.missing).toEqual([])
    })
  })

  describe('Array Structure Without Indices', () => {
    it('should not include array indices in paths', () => {
      const jsonData = JSON.stringify({
        products: [
          {
            id: 1,
            name: 'Product 1',
            price: 100
          },
          {
            id: 2,
            name: 'Product 2',
            price: 200
          }
        ]
      })

      const template = `
        {{#products}}
        Product: {{name}} - \${{price}}
        {{/products}}
      `

      const result = analyzeUsage(jsonData, template)

      // Should mark id as unused (since it's not in template)
      expect(result.unused).toContain('products.id')
      
      // Should NOT include any paths with numeric indices like "products.0.name"
      const hasNumericIndices = result.unused.some(path => /\.\d+\./.test(path))
      expect(hasNumericIndices).toBe(false)
      
      // Should not mark the products array or used fields as unused
      expect(result.unused).not.toContain('products')
      expect(result.unused).not.toContain('products.name')
      expect(result.unused).not.toContain('products.price')
    })
  })

  describe('Deeply Nested Loops', () => {
    it('should handle multiple levels of nested loops correctly', () => {
      const jsonData = JSON.stringify({
        companies: [
          {
            name: 'Company A',
            departments: [
              {
                name: 'Engineering',
                employees: [
                  {
                    name: 'John',
                    email: 'john@company.com',
                    skills: ['JavaScript', 'TypeScript'],
                    salary: 100000
                  },
                  {
                    name: 'Jane',
                    email: 'jane@company.com', 
                    skills: ['Python', 'React'],
                    salary: 110000
                  }
                ],
                budget: 500000
              }
            ],
            founded: 2010
          }
        ]
      })

      const template = `
        {{#companies}}
        Company: {{name}} (Founded: {{founded}})
        {{#departments}}
        Department: {{name}}
        {{#employees}}
        Employee: {{name}}
        Skills: {{#skills}}{{.}}, {{/skills}}
        {{/employees}}
        {{/departments}}
        {{/companies}}
      `

      const result = analyzeUsage(jsonData, template)

      // Should identify unused fields at various nesting levels
      expect(result.unused).toContain('companies.departments.employees.email')
      expect(result.unused).toContain('companies.departments.employees.salary')
      expect(result.unused).toContain('companies.departments.budget')
      
      // Should not mark used fields as unused
      expect(result.unused).not.toContain('companies')
      expect(result.unused).not.toContain('companies.name')
      expect(result.unused).not.toContain('companies.founded')
      expect(result.unused).not.toContain('companies.departments')
      expect(result.unused).not.toContain('companies.departments.name')
      expect(result.unused).not.toContain('companies.departments.employees')
      expect(result.unused).not.toContain('companies.departments.employees.name')
      expect(result.unused).not.toContain('companies.departments.employees.skills')
      
      expect(result.missing).toEqual([])
    })

    it('should handle nested loops with conditional sections', () => {
      const jsonData = JSON.stringify({
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
                  },
                  {
                    name: 'Bob',
                    role: 'Designer', 
                    isLead: false,
                    contact: {
                      email: 'bob@example.com',
                      phone: '123-456-7891'
                    }
                  }
                ]
              }
            ]
          }
        ]
      })

      const template = `
        {{#projects}}
        Project: {{name}} (Status: {{status}})
        {{#teams}}
        Team: {{name}}
        {{#members}}
        {{#isLead}}⭐ Lead: {{/isLead}}{{name}} - {{role}}
        {{/members}}
        {{/teams}}
        {{/projects}}
      `

      const result = analyzeUsage(jsonData, template)

      // Should identify unused nested contact information
      expect(result.unused).toContain('projects.teams.members.contact.email')
      expect(result.unused).toContain('projects.teams.members.contact.phone')
      
      // Should not mark used fields as unused
      expect(result.unused).not.toContain('projects')
      expect(result.unused).not.toContain('projects.name')
      expect(result.unused).not.toContain('projects.status')
      expect(result.unused).not.toContain('projects.teams.name')
      expect(result.unused).not.toContain('projects.teams.members.name')
      expect(result.unused).not.toContain('projects.teams.members.role')
      expect(result.unused).not.toContain('projects.teams.members.isLead')
      
      expect(result.missing).toEqual([])
    })

    it('should handle deeply nested array access patterns', () => {
      const jsonData = JSON.stringify({
        organization: {
          regions: [
            {
              name: 'North America',
              countries: [
                {
                  name: 'USA',
                  states: [
                    {
                      name: 'California',
                      cities: [
                        {
                          name: 'San Francisco',
                          population: 884000,
                          coordinates: {
                            lat: 37.7749,
                            lng: -122.4194
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      })

      const template = `
        {{#organization.regions}}
        Region: {{name}}
        {{#countries}}
        Country: {{name}}
        {{#states}}
        State: {{name}}
        {{#cities}}
        City: {{name}} (Pop: {{population}})
        {{/cities}}
        {{/states}}
        {{/countries}}
        {{/organization.regions}}
      `

      const result = analyzeUsage(jsonData, template)

      // Should mark unused coordinate data as unused
      expect(result.unused).toContain('organization.regions.countries.states.cities.coordinates.lat')
      expect(result.unused).toContain('organization.regions.countries.states.cities.coordinates.lng')
      
      // Should not mark used fields as unused
      expect(result.unused).not.toContain('organization.regions')
      expect(result.unused).not.toContain('organization.regions.name')
      expect(result.unused).not.toContain('organization.regions.countries.name')
      expect(result.unused).not.toContain('organization.regions.countries.states.name')
      expect(result.unused).not.toContain('organization.regions.countries.states.cities.name')
      expect(result.unused).not.toContain('organization.regions.countries.states.cities.population')
      
      expect(result.missing).toEqual([])
    })

    it('should handle mixed array and object nesting', () => {
      const jsonData = JSON.stringify({
        config: {
          services: [
            {
              name: 'api-service',
              instances: {
                production: [
                  {
                    id: 'prod-1',
                    status: 'running',
                    metrics: {
                      cpu: 45.2,
                      memory: 67.8,
                      disk: 23.1
                    }
                  }
                ],
                staging: [
                  {
                    id: 'stage-1', 
                    status: 'stopped',
                    metrics: {
                      cpu: 0,
                      memory: 12.3,
                      disk: 15.7
                    }
                  }
                ]
              }
            }
          ]
        }
      })

      const template = `
        {{#config.services}}
        Service: {{name}}
        {{#instances.production}}
        Production Instance: {{id}} - {{status}}
        CPU: {{metrics.cpu}}%
        {{/instances.production}}
        {{/config.services}}
      `

      const result = analyzeUsage(jsonData, template)

      // Should mark unused staging instances and some metrics as unused
      expect(result.unused).toContain('config.services.instances.staging')
      expect(result.unused).toContain('config.services.instances.production.metrics.memory')
      expect(result.unused).toContain('config.services.instances.production.metrics.disk')
      
      // Should not mark used production fields as unused
      expect(result.unused).not.toContain('config.services')
      expect(result.unused).not.toContain('config.services.name')
      expect(result.unused).not.toContain('config.services.instances.production')
      expect(result.unused).not.toContain('config.services.instances.production.id')
      expect(result.unused).not.toContain('config.services.instances.production.status')
      expect(result.unused).not.toContain('config.services.instances.production.metrics.cpu')
      
      expect(result.missing).toEqual([])
    })
  })
})
