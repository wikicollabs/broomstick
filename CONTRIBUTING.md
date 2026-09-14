# Contributing to Broomstick

Thank you for contributing to Broomstick.

This document covers how to set up a local development environment, propose changes, suggest new query types or languages, help with translations, and report bugs.

## Local setup

### Requirements

- Node.js 20 or later
- pnpm 10.22.0 for the frontend

Install the dependencies and start the development server:

```bash
pnpm install
pnpm dev
```

## Proposing a query type or language

Query types are standalone SPARQL files under `src/queries/`, one file per query type. Query metadata (which group a query belongs to, and any translatable parameter hints) lives separately in `src/data/queries.ts`. Which languages a query type is available for is controlled separately again, in `src/data/languages.ts`, rather than repeated per query.

To propose a new query type, open an issue or pull request and include:

- The query's id (used as the filename and the lookup key). Keep it short and stable, this id is referenced from the language config and stored wherever the query is selected, so renaming an existing one later would be a breaking change
- Which group it belongs to (General, Senses, Forms, Misplacements, Language-specific)
- The complete SPARQL query as a standalone `.rq` file. Use the `%LANGUAGE_QID%` and `%LANGUAGE_CODE%` placeholders anywhere the query needs to be scoped to the selected Lexeme language
- Which languages should have access to it: either add the id to `UNIVERSAL_QUERIES` if every language should get it, or to a specific language's entry under `LANGUAGE_EXTRA_QUERIES` if it only applies to some
- Contribution guidance explaining what an editor should do after finding a result

To propose a new language, include its display name, ISO code, autonym, and Wikidata Q-id for the language item.

If you are not comfortable writing the SPARQL query yourself, describe what the query type should find. We can help turn that description into a query.

## Code changes

- Open pull requests against `staging`.
- Keep each pull request focused on one type of change where possible.
- Follow the existing code style in the file you are editing rather than introducing a new convention.
- Use comments to explain why something is implemented in a particular way when that reason is not obvious. Avoid comments that merely narrate what the code is doing.

## Translations

Display strings live under `src/i18n/`.

Broomstick is available on [translatewiki.net](https://translatewiki.net/wiki/Translating:Broomstick). Translations should be submitted there rather than through pull requests. Improvements to the English source strings or message documentation (`qqq.json`) are still welcome as pull requests.

## Reporting Bugs

Open a [GitHub issue](https://github.com/wikicollabs/broomstick/issues) and include:

- Steps to reproduce the problem
- What you expected to happen
- What happened instead
- Screenshots, when they are useful for demonstrating a visual problem

If you would rather not use GitHub, you can email `support@wikicollabs.org` or leave a note on [Broomstick's talk page on Wikidata](https://www.wikidata.org/wiki/Wikidata_talk:Broomstick).
