# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page app where a church member registers their family group (up to 5 people) for a church outing. It computes the fee from each person's age, collects the payment voucher (an image) and POSTs everything as JSON to a Make webhook. Make validates the payment, stores the data in Google Sheets and emails a QR ticket. The SPA does not track what happens after the POST.

## Specs (SDD + TDD)

The work is spec-driven: every feature is defined in `specs/` and reviewed before it is implemented, and the tests are written first. When behavior changes, update the spec as well as the code.

- `specs/Especificación técnica: …`: product overview (fares, transport rules, fields, Make flow).
- `specs/SPEC-001: …`: pure TypeScript domain (types, validations, fare engine, `buildMakePayload`). Its test matrix uses the IDs T-, V-, A- and P-.
- `specs/SPEC-002: …`: UI wizard, UX rules and the JSON contract with the Make webhook. Its test matrix uses the IDs U-.

Test names start with the matrix ID (e.g. `it('V-17: …')`), so `pnpm exec vitest run -t "V-17"` runs one spec case.

Language convention: code identifiers (types, interfaces, fields, functions) are in **English**. User-facing text (labels, error messages), the `Sex` values (`'femenino' | 'masculino'`, sent as-is to Make) and test descriptions are in Spanish.

## Commands

Package manager is **pnpm**.

- `pnpm dev`: Vite dev server with HMR
- `pnpm test`: Vitest in watch mode. `pnpm test:run` runs once.
- `pnpm exec vitest run src/domain/rut.test.ts`: a single test file. Add `-t "<name>"` to run a single test.
- `pnpm lint`: ESLint
- `pnpm build`: `tsc -b` type-check, then a production build to `dist/`

The webhook URL comes from `VITE_MAKE_WEBHOOK_URL` in `.env.local` (`*.local` is gitignored). If it is missing, submission fails with a visible error. Every `VITE_*` value is shipped in the public bundle, so the Make scenario must validate what it receives.

## Architecture

The code is split into three layers, and imports only point downward (components → infra → domain):

- `src/domain/`: pure TypeScript with no React or DOM imports. It holds:
  - `types.ts`, which defines `Participant`, `PaymentData` and `MakePayload`;
  - one module per concern (`rut`, `email`, `phone`, `voucher`, `fares`, `participant`, `emailSuggestions`, `makePayload`), each with a colocated `*.test.ts`;
  - `testUtils.ts`, with fixtures for valid participants (`makeParticipant`, `makeAdditional`).
- `src/infra/`: browser I/O. `fileToDataUrl` turns the voucher into base64 and `submitRegistration` does the `fetch` POST.
- `src/components/`: React components, built so that each one is responsible for one thing:
  - `RegistrationWizard` owns all form state: participants, the current step index (the payment step is `participants.length`), payment data, submission status, and which participants have their errors revealed.
  - `ParticipantStep` is keyed by participant id, so every navigation remounts it. Its mount effect is what implements the "auto-focus on Nombre" rule. It computes errors with `validateParticipant` and shows them for touched fields, or for all fields once they have been revealed.
  - `PaymentStep` deliberately does not auto-focus.
- `src/ui/`: `styles.ts` holds shared Tailwind class strings for inputs and buttons, and `format.ts` has `formatCLP`.

Design tokens (colors and fonts) live in the `@theme` block of `src/index.css` and are used as utilities such as `bg-mist`, `bg-brand`, `border-field` and `font-display`. The palette comes from the church logo (`public/logo.png`, a resized copy of the high-resolution original in `brand/ISO ACYM LA FLORIDA.png`, which is kept outside `public/` so it is not shipped):
- `ink`: navy;
- `brand`: the logo's teal, darkened so white button text reaches 5.4:1;
- `lagoon`: the logo's teal as is, used only as a background behind `ink` text;
- `ocean`: steel blue.

Amounts (`formatCLP`) always use `font-display`: the body font, Atkinson Hyperlegible, draws a slashed zero that looks odd in prices.

When changing colors, keep the WCAG AA contrast ratios noted in the comments next to each token. Styles use **only Tailwind CSS v4** through `@tailwindcss/vite`: no Styled Components, CSS-in-JS or extra CSS files. Fonts are loaded from Google Fonts in `index.html`.

## Gotchas

- Vitest runs without `globals`. That is why `src/test/setup.ts` registers RTL's `cleanup` and the jest-dom matchers. Import `describe`, `it`, etc. from `vitest`.
- The test environment is jsdom, which has no `scrollIntoView`, so calls to it use optional chaining.
- TS flags:
  - `verbatimModuleSyntax`: use `import type` for type-only imports.
  - `erasableSyntaxOnly`: no `enum`, `namespace` or constructor parameter properties.
  - `noUnusedLocals` / `noUnusedParameters`: unused code fails the build.
- `react-refresh` lint: component files must export only components. Shared constants and types go in non-component modules (e.g. `components/types.ts`).
