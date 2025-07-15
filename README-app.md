# Mustache JSON Editor

A powerful single-page Vue 3 application for editing, rendering, validating, and analyzing Mustache-driven JSON in real time.

## Features

- **Real-time rendering**: Live preview of Mustache templates with JSON data
- **Monaco Editor**: Full-featured code editor with syntax highlighting for JSON, Mustache templates, and schemas
- **JSON Schema validation**: Validate your output against JSON Schema (draft-07)
- **Usage analysis**: Find unused variables in JSON data and missing variables in templates
- **Export functionality**: Download your session as a ZIP file
- **File/URL loading**: Load content from local files or remote URLs
- **Responsive design**: Works on desktop and mobile devices
- **Keyboard shortcuts**: Quick formatting and navigation
- **Persistent state**: Automatically saves your work to localStorage

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

## Usage

### Interface Layout

The application has a 2x2 grid layout with four main panels:

1. **JSON Data** (top-left): Your input data in JSON format
2. **Mustache Template** (top-right): Your Mustache template
3. **Output** (bottom-left): Real-time rendered result (read-only)
4. **JSON Schema** (bottom-right): Schema for validating the output

### Key Features

#### Live Rendering
- Edit JSON data or Mustache template
- See the rendered output update automatically
- Parse errors are displayed in the error bar

#### Validation
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
