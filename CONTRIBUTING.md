# Contributing to Broomstick

Thank you for contributing to Broomstick.

This document covers local development, code changes, new query types and languages, translations, and bug reports.

## Local setup

### Requirements

- Node.js 26.12.1 or newer within the 26.x release line
- pnpm 12.15.0 (check the root `packageManager` field for the pinned version)

Broomstick uses a **pnpm workspace**: the frontend is at the repository root and the Express backend is in `server/`. Install dependencies once from the root, not separately in `server/`:

```bash
pnpm install
pnpm dev
```

`pnpm dev` runs the Vite frontend development server. For the database Express server, first create the frontend build and then run the backend:

```bash
pnpm run build
pnpm start
```

The backend uses `PORT` (default `3000`) and environment variables including `DB_NAME`, `TOOL_TOOLSDB_USER`, `TOOL_TOOLSDB_PASSWORD`, and `LOG_READ_KEY`. Database dependent features need valid credentials and database access; they may not work in a default local setup. Never commit credentials, secret keys, or `.env` files.

### Before opening a pull request

From the repository root, run:

```bash
pnpm run type-check
pnpm run build
pnpm audit
```

Test the affected functionality manually as appropriate. Changes to the backend should also be tested against its routes and database behavior in a suitably configured environment.

Keep the shared `pnpm-lock.yaml` updated when changing dependencies. Both `package.json` files belong to the same workspace; do not introduce an independent npm lockfile or run `npm install` in `server/`.

The Codex packages are intentionally pinned to version 2.6.2. Do not update them incidentally as part of unrelated changes.

## Proposing a query type or language

Query types are standalone SPARQL files under `src/queries/`, one file per query type. Query metadata (which group a query belongs to and any translatable parameter hints) lives separately in `src/data/queries.ts`. Which languages a query type is available for is controlled in `src/data/languages.ts`, rather than repeated per query.

To propose a new query type, open an issue or pull request and include:

- The query's ID (used as the filename and lookup key). Keep it short and stable: the ID is referenced by language configuration and stored wherever the query is selected, so renaming an existing ID can be a breaking change.
- The group it belongs to (General, Senses, Forms, Misplacements, Language-specific).
- The complete SPARQL query as a standalone `.rq` file. Use the `%LANGUAGE_QID%` and `%LANGUAGE_CODE%` placeholders wherever the query needs to be scoped to the selected Lexeme language.
- The languages that should have access to it: add the ID to `UNIVERSAL_QUERIES` if every language should get it, or to a language's entry under `LANGUAGE_EXTRA_QUERIES` if it only applies to some.
- Contribution guidance explaining what an editor should do after finding a result.

To propose a new language, include its display name, ISO code, autonym, and Wikidata Qid for the language item.

If you are not comfortable writing the SPARQL query yourself, describe what the query type should find. We can help turn that description into a query.

## Code changes

- Open pull requests against `staging`.
- Keep each pull request focused on one type of change where possible.
- Follow the existing code style rather than introducing a new convention.
- Use comments to explain *why* something is implemented when that reason is not obvious; avoid comments that merely narrate the code.
- Keep backend dependencies declared in `server/package.json` and frontend dependencies in the root `package.json`.
- Avoid changing runtime versions or deliberately pinned dependencies without a compatibility reason and tests.
- Do not commit generated `dist/` directories or `node_modules/`.

### Deployment changes

Broomstick runs on Wikimedia Toolforge using **Toolforge Build Service** with Node.js 26. Its staging and production environments are deployed separately through manually triggered GitHub Actions workflows.

A merged pull request does not itself authorize a deployment. Deployment credentials, passphrases, and Toolforge configuration are maintained outside the source code. Maintainers should test changes on staging before production.

The build service installs the pnpm workspace and builds the application from Git. Do not reintroduce the old SCP/tar deployment or the `node20` webservice commands. A successful image build should be followed by runtime and application checks.

## Translations

Display strings live under `src/i18n/`.

Broomstick is available on [translatewiki.net](https://translatewiki.net/wiki/Translating:Broomstick). Translations should be submitted there rather than through pull requests. Improvements to the English source strings or message documentation (`qqq.json`) are still welcome as pull requests.

## Reporting bugs

Open a [GitHub issue](https://github.com/wikicollabs/broomstick/issues) and include:

- Steps to reproduce the problem
- What you expected to happen
- What happened instead
- Screenshots when useful for demonstrating a visual problem

If you would rather not use GitHub, you can email `support@wikicollabs.org` or leave a note on [Broomstick's talk page on Wikidata](https://www.wikidata.org/wiki/Wikidata_talk:Broomstick).
