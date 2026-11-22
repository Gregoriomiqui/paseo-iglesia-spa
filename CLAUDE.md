# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Freshly scaffolded from the Vite `react-ts` template. `src/App.tsx`, `src/App.css`, and `src/assets/*` are still the template demo content, so no app-specific architecture exists yet. Update this file as real structure is added.

## Specs (SDD + TDD)

The work is spec-driven: every feature is defined in `specs/` and reviewed before it is implemented, and the tests are written first.

- `specs/Especificación técnica: …`: product overview (fares, transport rules, fields, Make flow).
- `specs/SPEC-001: …`: pure TypeScript domain (types, validations, fare engine, `buildMakePayload`), decoupled from React. Its test matrix uses the IDs T-, V-, A- and P-.
- `specs/SPEC-002: …`: UI wizard, UX rules and the JSON contract with the Make webhook. Its test matrix uses the IDs U-.

Stack decisions: styles use **only Tailwind CSS** (no Styled Components or CSS-in-JS). Tests use Vitest + React Testing Library. The webhook URL comes from `VITE_MAKE_WEBHOOK_URL` in `.env.local`. None of these tools are installed yet.

## Commands

Package manager is **pnpm** (`pnpm-lock.yaml`).

- `pnpm install`: install dependencies
- `pnpm dev`: Vite dev server with HMR
- `pnpm build`: type-check (`tsc -b`) and then a production build to `dist/`
- `pnpm lint`: ESLint over the whole repo
- `pnpm preview`: serve the built `dist/`

There is no test runner configured yet.

## Stack and configuration

- React 19, TypeScript ~6.0, Vite 8 with `@vitejs/plugin-react` (Oxc). The React Compiler is not enabled.
- Entry: `index.html` loads `src/main.tsx`, which renders `<App />` into `#root` inside `StrictMode`.
- TypeScript uses project references: `tsconfig.app.json` covers `src/` and `tsconfig.node.json` covers `vite.config.ts`. `noEmit` is set; Vite does the transpiling and `tsc -b` only type-checks.
- Notable compiler flags: `verbatimModuleSyntax` (type-only imports must use `import type`), `erasableSyntaxOnly` (no `enum`, `namespace`, or constructor parameter properties), `allowImportingTsExtensions` (imports may include `.tsx`, e.g. `./App.tsx`), and `noUnusedLocals`/`noUnusedParameters` (unused code fails the build).
- ESLint flat config (`eslint.config.js`): `@eslint/js` recommended, `typescript-eslint` recommended (not type-aware), `react-hooks`, and `react-refresh` (component files should export only components so HMR keeps working).
- Static files in `public/` are served from the root URL (e.g. `/icons.svg#id` sprite references, `/favicon.svg`). Assets in `src/assets/` are imported and bundled.
