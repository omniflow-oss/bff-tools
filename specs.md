// Prompt for Copilot
// Goal: generate a **single‑page Vue 3 + Vite app** that lets developers **edit, render, validate and analyse
// Mustache‑driven JSON** in real time.  Use `<script setup>` + Pinia (or the built‑in
// reactive API) for state, TailwindCSS 3 for styling, and Monaco Editor for all code panes.
// -----------------------------------------------------------------------------
// 1 — GLOBAL LAYOUT & STYLING
// -----------------------------------------------------------------------------
// • Root    : 100 vh flex‑col.  Header bar → main grid → footer (optional).
// • Main grid (desktop ≥ 1024 px):
//   ┌──────────────┬──────────────┐
//   │ JSON Data    │ Mustache Tpl │   2 × cards, gap‑4
//   ├──────────────┼──────────────┤
//   │ Output (RO)  │ JSON Schema  │
//   └──────────────┴──────────────┘
//   ‑ 1 fr / 1 fr columns, auto rows.
//   ‑ < 1024 px → single‑column stacked cards.  
// • Each card = Tailwind `rounded‑2xl shadow p‑3 flex‑col h‑[45vh] lg:h‑[42vh]`.
//   ‑ Title bar: label + icon buttons (Format, Load, Maximise ⛶) right‑aligned.
//   ‑ Content  : `<MonacoEditor>` fills remaining space (`flex‑1 overflow‑hidden`).
// • Maximise   : toggles `fixed inset‑0 z‑50` on the chosen card, hides others.
// • Global error bar: `<Transition>` slide‑down at top; `bg‑red‑500` + dismiss ✖.
//   Call `showError(message: string)` from any failure path.
// -----------------------------------------------------------------------------
// 2 — CORE FILE STRUCTURE
// -----------------------------------------------------------------------------
// # vite.config.ts     → enable monaco for json, handlebars, javascript.
// # src/main.ts        → createApp(App).mount('#app')
// # src/App.vue        → layout grid, header, error bar, action buttons.
// # src/stores/session.ts
//   - state: { json, template, output, schema, maximisedCard, errors[] }
//   - persist to `localStorage` on every change (debounced 300 ms).
// # src/components/Card.vue
//   - props: title, language, model, readOnly, allowUrl, allowFile.
//   - emits: update:modelValue, maximise.
//   - buttons: Format, Load (file), LoadURL (if allowUrl), Maximise.
// # src/utils/format.ts      → prettier/standalone + prettier‑parser‑babel/estree.
// # src/utils/render.ts      → Mustache.render(dataTpl, jsonData).
// # src/utils/validate.ts    → Ajv v8 instance (JSON‑Schema draft‑07).
// # src/utils/analysis.ts
//   - findUnusedData(json, template)         → string[]
//   - findMissingData(json, template)        → string[]
//   *Use a recursive walk + Mustache.parse()*.
// # src/utils/zip.ts          → JSZip + FileSaver.
// # src/hooks/useKeyboard.ts  → optional shortcuts (⌘+⇧+F = format current).
// # public/index.html         → mount point, Tailwind CDN (or PostCSS build).
// -----------------------------------------------------------------------------
// 3 — FEATURE IMPLEMENTATION NOTES
// -----------------------------------------------------------------------------
// ▶ Live Render
//   watch(json || template) → render() → state.output.  On parse failure showError.
// ▶ Format Button
//   calls formatJSON / formatMustache (just prettier‑handlebars) / formatSchema.
// ▶ Validate Button
//   validate(output, schema) → show list of Ajv errors with path + message.
//   For each error:
//     ‑ add Monaco decoration in Output pane (`editor.deltaDecorations`).
//     ‑ push to error bar with link: clicking scrolls to offending line.
// ▶ Check Usage Button
//   const unused   = findUnusedData(json, template)
//   const missing  = findMissingData(json, template)
//   Show a modal or side‑drawer listing both groups; colour‑code:
//     green✔ → used; yellow⚠ → unused; red❌ → missing.
//   Also decorate JSON pane (unused = underline yellow) and Template pane
//   (missing = squiggly red) via Monaco markers.
// ▶ Export Session
//   JSZip: add 4 files (mock‑data.json, template.mustache, output.json, schema.json).
//   FileSaver: `saveAs(zip.generateAsync({type:'blob'}), 'mustache‑session.zip')`.
// ▶ Load from File / URL
//   readAsText(File) or fetch(url).  On network error showError.
// ▶ Maximise
//   Clicking ⛶ sets `maximisedCard = id`; ESC or ⛶ again restores grid.
// ▶ Performance
//   • Debounce heavy ops (render, validate, check) at 250 ms.
//   • Use Web Workers for Ajv validation if output size > 200 KB.
// -----------------------------------------------------------------------------
// 4 — EXTENSIBILITY HOOKS
// -----------------------------------------------------------------------------
// • Add support for Mustache partials (`partials/` folder, <select> in Template Card).
// • API‑fetch tab next to JSON Data: url, optional headers, curl‑paste detector.
// • Dark mode toggle in header (`dark:` Tailwind classes).
// • i18n via vue‑i18n (en / fr at minimum).
// -----------------------------------------------------------------------------
// 5 — ACCEPTANCE TESTS (E2E outline ‑ Cypress)
// -----------------------------------------------------------------------------
// 1. Load page → panels populated from localStorage if present.
// 2. Paste valid json + template → Output updates within 200 ms.
// 3. Break JSON → error bar shows parse error, Output remains last good render.
// 4. Click Validate with bad schema → Ajv errors listed + decorations applied.
// 5. Check Usage → lists unused & missing; highlight counts accurate.
// 6. Export Session → downloads ZIP with 4 correct files & content matches state.
// 7. Maximise each panel → fills screen; ESC restores grid.
// 8. Mobile (375×812) → cards stack vertically; Maximise still works.
//
// -----------------------------------------------------------------------------
// Deliverable: full working codebase, ready `npm install && npm run dev`.
//
// Focus on **developer experience** — smooth editing, instant feedback, clear UX.
