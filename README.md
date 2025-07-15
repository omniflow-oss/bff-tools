# Mustache JSON Editor

A powerful single-page Vue 3 application for editing, rendering, validating, and analyzing Mustache-driven JSON in real time.

🚀 **Live Demo**: [https://omniflow-oss.github.io/bff-tools/](https://omniflow-oss.github.io/bff-tools/)

## Features

- **Real-time rendering**: Live preview of Mustache templates with JSON data
- **Monaco Editor**: Full-featured code editor with syntax highlighting for JSON and Mustache templates
- **Individual panel validation**: Validate JSON, Mustache templates, output, and schemas separately
- **JSON Schema validation**: Validate your output against JSON Schema (draft-07)
- **JSON Mustache templates**: Support for JSON-structured Mustache templates
- **Usage analysis**: Find unused variables in JSON data and missing variables in templates
- **Export functionality**: Download your session as a ZIP file
- **File/URL loading**: Load content from local files or remote URLs
- **Responsive design**: Works on desktop and mobile devices
- **Keyboard shortcuts**: Quick formatting and navigation
- **Persistent state**: Automatically saves your work to localStorage

## Getting Started

### Online Usage

Visit [https://omniflow-oss.github.io/bff-tools/](https://omniflow-oss.github.io/bff-tools/) to use the application directly in your browser.

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/omniflow-oss/bff-tools.git
   cd bff-tools
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deployment

This project is automatically deployed to GitHub Pages when changes are pushed to the `main` branch. The deployment workflow:

1. Builds the application using Vite
2. Deploys to GitHub Pages at [https://omniflow-oss.github.io/bff-tools/](https://omniflow-oss.github.io/bff-tools/)

## Usage

### Interface Layout

The application has a 2x2 grid layout with four main panels:

1. **JSON Data** (top-left): Your input data in JSON format
2. **Mustache Template** (top-right): Your JSON Mustache template  
3. **Output** (bottom-left): Real-time rendered JSON result (read-only)
4. **JSON Schema** (bottom-right): Schema for validating the output

### Key Features

#### Live Rendering
- Edit JSON data or Mustache template
- See the rendered JSON output update automatically
- Parse errors are displayed in the error bar

#### Individual Validation
- Each panel has its own validate button (🔍 icon)
- **JSON Data**: Validates JSON syntax
- **Mustache Template**: Validates JSON structure with Mustache placeholders
- **Output**: Validates rendered JSON syntax
- **JSON Schema**: Validates schema syntax

#### Schema Validation
- Click "Validate" to check output against the JSON schema
- Validation errors are shown with line numbers and descriptions
- Supports all JSON Schema draft-07 features

#### Usage Analysis
- Click "Check Usage" to analyze variable usage
- Shows unused variables in JSON data (yellow warning)
- Shows missing variables in template (red error)
- Helps optimize your templates and data

#### Export Session
- Click "Export" to download a ZIP file containing:
  - `mock-data.json`: Your JSON data
  - `template.mustache`: Your Mustache template
  - `output.json`: The rendered output
  - `schema.json`: Your JSON schema

#### Loading Content
- Use the file button (📁) to load content from local files
- Use the URL button (🔗) to load content from remote URLs
- Supports JSON, text, and Mustache files

#### Maximize View
- Click the maximize button (⛶) on any panel to focus on it
- Press ESC to return to grid view
- Perfect for working with large templates or data

### Keyboard Shortcuts

- `Cmd/Ctrl + Shift + F`: Format current content
- `ESC`: Close maximized view or modals

### Example Data

The application comes with sample data to get you started:

**JSON Data:**
```json
{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "hobbies": ["reading", "coding", "gaming"]
}
```

**Mustache Template:**
```mustache
Hello {{name}}!

You are {{age}} years old and your email is {{email}}.

Your hobbies:
{{#hobbies}}
- {{.}}
{{/hobbies}}
```

## Technical Details

### Built With

- **Vue 3** with Composition API and `<script setup>`
- **Vite** for fast development and building
- **TailwindCSS** for responsive styling
- **Pinia** for state management
- **Monaco Editor** for code editing
- **Mustache.js** for template rendering
- **AJV** for JSON schema validation
- **JSZip & FileSaver** for export functionality

### Project Structure

```
src/
├── components/
│   ├── Card.vue           # Reusable card component
│   └── MonacoEditor.vue   # Monaco editor wrapper
├── stores/
│   └── session.ts         # Pinia store for app state
├── utils/
│   ├── analysis.ts        # Variable usage analysis
│   ├── debounce.ts        # Utility for debouncing
│   ├── format.ts          # Code formatting utilities
│   ├── render.ts          # Mustache rendering
│   ├── validate.ts        # JSON schema validation
│   └── zip.ts             # Export functionality
├── hooks/
│   └── useKeyboard.ts     # Keyboard shortcut management
├── App.vue                # Main application component
└── main.ts                # Application entry point
```

### Performance Features

- **Debounced operations**: Rendering, validation, and analysis are debounced to prevent excessive updates
- **Lazy loading**: Monaco Editor and large dependencies are loaded on demand
- **Persistent state**: App state is automatically saved to localStorage
- **Efficient updates**: Only re-renders when necessary

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

### Browser Support

- Modern browsers with ES2020 support
- Chrome 80+, Firefox 72+, Safari 13.1+, Edge 80+

## License

MIT License - see LICENSE file for details.
