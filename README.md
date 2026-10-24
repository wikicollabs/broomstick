# Broomstick

Broomstick is a tool for Wikidata contributors to uncover Lexemes that can be improved.

- Tool: https://broomstick.toolforge.org
- Wikidata: https://www.wikidata.org/wiki/Wikidata:Broomstick

Choose a Lexeme language and a query type, and Broomstick runs the corresponding SPARQL query against Wikidata.

Built as a companion to [Dustpan](https://dustpan.toolforge.org), which serves the same purpose for WikiProjects.

## How it works

- **Lexeme languages** are the top level selection (Français, Deutsch, 日本語, and so on). Each one maps to its language item on Wikidata.
- **Query types** are grouped by area (General, Senses, Forms, Misplacements, Language-specific). Each one is a standalone SPARQL query targeting a specific missing property or issue.

Availability of a query type for a given language is controlled separately in the language configuration, rather than duplicated for every query.

Queries are kept as complete, standalone SPARQL files under `src/queries/`, one per query type, directly inspectable on GitHub. Language and query definitions live under `src/data/`.

Keeping queries and language configuration in the repository means new query types and language support can be proposed and reviewed through normal GitHub contributions.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## Tech stack

- Vue 3, Vite 8, and Pinia for the frontend
- [Codex](https://doc.wikimedia.org/codex/latest/), Wikimedia's design system, for UI components (currently pinned to 2.6.2)
- vue-banana-i18n for translations
- Express 5 and mysql2 (`server/`) for selection logging and the protected log viewer
- Node.js 26 and pnpm 12, using a pnpm workspace
- Wikimedia Toolforge Build Service for container builds and hosting

## Development

### Requirements

- Node.js 26.12.1 or newer within the 26.x release line
- pnpm 12.15.0 (see the `packageManager` field in `package.json` for the project pinned version)

The repository is a **pnpm workspace** containing the frontend at the root and the backend in `server/`. Install dependencies **once from the repository root**:

```bash
pnpm install
```

Start the Vite frontend development server:

```bash
pnpm dev
```

Type-check the frontend:

```bash
pnpm run type-check
```

Create the application build (including copying the frontend to `server/dist/`):

```bash
pnpm run build
```

Preview the Vite frontend locally:

```bash
pnpm preview
```

`pnpm preview` previews the frontend build; it does not start the Express backend or provide its database backed endpoints.

To start the Express backend separately:

```bash
pnpm start
```

The backend uses `PORT` (default `3000`), `DB_NAME`, `TOOL_TOOLSDB_USER`, `TOOL_TOOLSDB_PASSWORD`, and `LOG_READ_KEY` as applicable. Database endpoints require valid database access and credentials. Do not commit credentials or `.env` files.

Check project dependencies for known vulnerabilities:

```bash
pnpm audit
```

Keep `pnpm-lock.yaml` committed. Do not run a separate `npm install` in `server/`; the root workspace installation manages both sets of dependencies.

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

server/
├── server.js     Express server and API routes
├── db.js         ToolsDB connection
├── package.json  Backend dependencies
├── viewer/       Selection-log viewer
└── dist/         Generated frontend build (not committed)

pnpm-workspace.yaml   Workspace and dependency build settings
pnpm-lock.yaml        Shared dependency lockfile
Procfile              Web process startup command
```

## Deployment

Broomstick runs on [Wikimedia Toolforge](https://wikitech.wikimedia.org/wiki/Help:Toolforge) using **Toolforge Build Service**, which builds a container directly from the Git repository.

Deployments are managed through manual GitHub Actions workflows in `.github/workflows/`, with separate staging and production targets:

The workflows authorize deployments, connect to Toolforge over SSH, start a build, check its result, and restart the build service webservice.

For an authorized manual build from a Toolforge tool account, the corresponding command is:

```bash
toolforge build start \
  https://github.com/wikicollabs/broomstick.git \
  --ref staging \
  --use-latest-versions
```

Use `--ref main` for production, with the appropriate Toolforge account. A successful build alone does not restart the public webservice or verify database functionality. The deployment procedure includes a restart and application checks.

## Contributing

Bug reports, new query types, new language support, and other improvements are welcome.

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

GPL-2.0-or-later. See [LICENSE](./LICENSE).
