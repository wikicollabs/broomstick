# Broomstick

A web tool to identify Lexemes on Wikidata that can be improved.

## Overview

Broomstick helps Wikidata contributors discover Lexemes with missing or incomplete data. Contributor can select a language and query type to find Lexemes that can be improved.

The tool queries the Wikidata SPARQL endpoint directly and presents results in a table.

**Live instance:** https://broomstick.toolforge.org

**Wikidata page:** https://wikidata.org/wiki/Wikidata:Broomstick

## Features

- Supports 75+ languages (more can be added)
- Query types organized by category:
  - General: empty Lexemes, missing Senses, missing Forms, missing external identifiers, missing usage examples
  - Senses: missing semantic properties (item for this sense, hyperonyms, troponyms, etc.)
  - Forms: missing grammatical features, IPA transcriptions, pronunciation audio
  - Misplacements: properties placed at wrong structural level
- Responsive layout for desktop and mobile
- Dark mode support
- Built with Codex design system

## Tech stack

- Vue 3 (Composition API)
- Vite (build tool)
- vue-banana-i18n (i18n)
- Codex (Wikimedia Design System)
- SPARQL queries against Wikidata Query Service

## Installation

### Prerequisites

- Node.js (v16 or higher)
- pnpm package manager

### Setup

```bash
# Clone the repository
git clone https://github.com/wikicollabs/broomstick.git
cd broomstick

# Install dependencies
pnpm install

# Run development server
pnpm run dev
```

The development server will start at `http://localhost:5173`.

## Building for production

```bash
# Build the application
pnpm run build

# Preview production build locally
pnpm run preview
```

The built files will be in the `dist/` directory.

## Project structure

```
broomstick/
├── public/
│   ├── favicon.svg
│   ├── icon.svg
│   └── logo.svg
├── src/
│   ├── components/
│   │   ├── AppFooter.vue
│   │   ├── AppHeader.vue
│   │   ├── BroomstickIcon.vue
│   │   ├── BroomstickLogo.vue
│   │   ├── ResultsTable.vue
│   │   ├── SearchForm.vue
│   │   └── SettingsMenu.vue
│   ├── data/
│   │   ├── languages.js
│   │   └── queries.js
│   ├── i18n/
│   │   ├── en.json
│   │   ├── id.json
│   │   ├── qqq.json
│   │   ├── displayLanguages.js
│   │   └── index.js
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── index.html
├── package.json
├── pnpm-lock.yaml
└── vite.config.js
```

## Contributing

**Note:** This is an early-stage project maintained by a small team. Response times on issues and pull requests may vary.

Contributions are welcome. Please open an issue to discuss proposed changes.

### Proposing new languages

Open an issue with the following information:

- Native name of the language (autonym)
- Wikidata QID
- Wikimedia language code

### Proposing new queries

Open an issue with the following information:

- Query description
- Target languages (all languages or specific ones)
- SPARQL query template

## License

GPL 2.0 or later - see LICENSE file for details.

## Credits

Created by [Wikicollabs](https://wikicollabs.org), as part of [Software Collaboration for Wikidata](https://meta.wikimedia.org/wiki/Software_Collaboration_for_Wikidata).
