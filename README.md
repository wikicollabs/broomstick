# Broomstick

Broomstick is a tool for Wikidata contributors to uncover Lexemes that can be improved.

- Tool: https://broomstick.toolforge.org
- Wikidata: https://www.wikidata.org/wiki/Wikidata:Broomstick

Choose a Lexeme language and a query type, and Broomstick runs the corresponding SPARQL query against Wikidata.

Built as a companion to [Dustpan](https://dustpan.toolforge.org), which serves the same purpose for WikiProjects.


## How it works

- **Lexeme languages** are the top level selection (Français, Deutsch, 日本語, and so on). Each one maps to its language item on Wikidata.
- **Query types** are grouped by area (General, Senses, Forms, Misplacements, Language-specific). Each one is a standalone SPARQL query targeting a specific missing property or issue.

Availability of a query type for a given language is controlled separately, in the language config, so there is one source of truth rather than the same list duplicated per query.

Queries are kept as complete, standalone SPARQL files under `src/queries/`, one per query type, directly inspectable on GitHub rather than assembled from reusable fragments. Language and query definitions live under `src/data/`.

Keeping queries and language config in the repository means new query types and language support can be proposed and reviewed through normal GitHub contributions.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.


## Tech stack

- Vue 3, Vite, Pinia for the frontend
- [Codex](https://doc.wikimedia.org/codex/latest/), Wikimedia's design system, for UI components
- vue-banana-i18n for translations
- Express + MySQL service (`server/`) for logging the selection


## Development

Requirements:

- Node.js 20 or later
- pnpm 10.22.0

Install dependencies and start the frontend:

```bash
pnpm install
pnpm dev
```

Type-check the project:

```bash
pnpm run type-check
```

Create a production build:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

## Project structure

```text
src/
├── components/   Vue components
├── data/         Language and query type definitions
├── i18n/         Translation files and language handling
├── queries/      Standalone SPARQL query files
├── state/        Pinia store and URL state
├── types/        Shared TypeScript types
└── views/        Application views (Landing and Search)

server/           Express + MySQL service for logging the selection
```

## Deployment

Broomstick runs on Wikimedia Toolforge. Deployment happens through GitHub Actions workflows in `.github/workflows/`, targeting staging and production separately.


## Contributing

Bug reports, new query types, new language support, and other improvements are welcome.

See [CONTRIBUTING.md](./CONTRIBUTING.md).


## License

GPL-2.0-or-later. See [LICENSE](./LICENSE).
