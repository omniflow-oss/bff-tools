# Testing Documentation

## Test Overview

This project includes comprehensive automated tests for the Mustache template analysis utility, which is the core component responsible for identifying unused JSON properties and missing template variables with enhanced support for deeply nested loops and complex Mustache contexts.

## Test Suite Structure

### Analysis Utility Tests (`tests/analysis.test.ts`)

The test suite covers the following scenarios:

#### 1. Basic Variable Usage
- ✅ Identifies used variables correctly
- ✅ Identifies missing variables correctly

#### 2. Nested Object Properties  
- ✅ Handles nested object properties like `user.profile.age`
- ✅ Correctly marks unused nested properties

#### 3. Array Handling
- ✅ Correctly handles arrays with Mustache loops (`{{#array}}...{{/array}}`)
- ✅ Handles deeply nested arrays with complex structures
- ✅ Avoids false positives for array indices (no `array.0.property` paths)

#### 4. Complex Mustache Syntax
- ✅ Handles sections (`{{#variable}}...{{/variable}}`)
- ✅ Handles inverted sections (`{{^variable}}...{{/variable}}`)
- ✅ Handles unescaped variables (`{{{variable}}}`)
- ✅ Handles current context references (`{{.}}`)

#### 5. Deeply Nested Loops ⭐ **Enhanced**
- ✅ **Multiple levels of nested loops** (`companies → departments → employees`)
- ✅ **Conditional sections with nested access** (`{{#status}}{{name}}{{/status}}`)
- ✅ **Deeply nested array access patterns** (up to 4+ levels deep)
- ✅ **Mixed array and object nesting** (arrays containing objects with nested arrays)

#### 6. Edge Cases
- ✅ Handles empty JSON and templates gracefully
- ✅ Handles invalid JSON input gracefully
- ✅ Processes complex nested structures correctly

#### 7. Array Structure Validation
- ✅ Ensures no numeric indices appear in property paths
- ✅ Correctly identifies unused properties within array elements

## Enhanced Deep Nesting Analysis

### New Capabilities

The analysis utility now supports sophisticated nested loop patterns commonly found in real-world applications:

1. **Multi-Level Organizational Data**:
   ```json
   {
     "companies": [
       {
         "departments": [
           {
             "employees": [
               { "name": "John", "skills": ["JS", "Vue"] }
             ]
           }
         ]
       }
     ]
   }
   ```

2. **Geographic Hierarchies**:
   ```json
   {
     "regions": [
       {
         "countries": [
           {
             "states": [
               { "cities": [{ "name": "NYC", "population": 8000000 }] }
             ]
           }
         ]
       }
     ]
   }
   ```

3. **Configuration Trees**:
   ```json
   {
     "services": [
       {
         "instances": {
           "production": [{ "metrics": { "cpu": 45.2 } }]
         }
       }
     ]
   }
   ```

### Context-Aware Matching

The enhanced analysis engine correctly handles:
- **Variable resolution in nested contexts**: `{{name}}` inside `{{#employees}}` resolves to `employees.name`
- **Cross-context property access**: Properties accessible from parent contexts
- **Conditional rendering patterns**: Variables inside conditional sections

## Test Coverage

Current coverage for `src/utils/analysis.ts`:
- **Statements**: 91.66%
- **Branches**: 94.44%
- **Functions**: 100%
- **Lines**: 91.66%

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage
```

## Test Framework

- **Vitest**: Modern test framework with TypeScript support
- **jsdom**: DOM environment for testing
- **@vitest/coverage-v8**: Code coverage reporting

## Key Test Scenarios Verified

1. **Context-Aware Analysis**: Tests verify that the analysis correctly understands Mustache context scoping, especially within deeply nested loops and sections.

2. **Multi-Level Array Processing**: Ensures that when iterating over deeply nested arrays, properties at each level are correctly identified as used/unused.

3. **Complex Real-World Structures**: Tests complex nested structures like organizational hierarchies, geographic data, and configuration trees.

4. **Conservative Path Matching**: Uses conservative algorithms to avoid false positives while still detecting legitimate usage patterns.

5. **Error Resilience**: Validates that the analysis utility gracefully handles malformed JSON and continues to provide meaningful results.

## Enhanced Features Summary

### ✅ **Deep Nesting Support**
- Handles unlimited nesting levels
- Correctly processes arrays within objects within arrays
- Maintains context awareness through complex hierarchies

### ✅ **Conservative Analysis**
- Avoids false positives for ambiguous patterns
- Uses suffix matching for nested context resolution
- Validates context paths before marking properties as used

### ✅ **Comprehensive Edge Cases**
- Current context references (`{{.}}`)
- Mixed conditional and iterative sections
- Complex property access patterns

## Future Test Enhancements

Potential areas for additional test coverage:
- Performance testing with extremely large JSON structures (1000+ nested levels)
- Memory usage testing for deeply nested objects
- Integration testing with the Monaco Editor
- UI component testing for the analysis results display
- Stress testing with malformed Mustache templates
