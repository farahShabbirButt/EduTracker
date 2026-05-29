## CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is the EduTracker frontend SPA (Vite + React 19 + TS + MUI v7 + Redux Toolkit). The parent `../CLAUDE.md` covers commands, folder structure, the Redux thunk data pattern, the `apiClient` wrapper, and the response-envelope contract — read it first, this file only adds frontend-specific gotchas.

## TypeScript / lint quirks

- `tsconfig.app.json` enables `verbatimModuleSyntax` — type-only imports must use `import type { … }`, not plain `import`. Mixing values and types in one import is fine, but unused type imports won't be silently elided.
- `noUncheckedSideEffectImports` is on — bare `import 'foo'` for side effects must resolve to a real declared module. `print.css` is the legitimate exception (see below).
- `noUnusedLocals` / `noUnusedParameters` are strict — prefix intentionally-unused identifiers with `_` (e.g. `(_event, value) => …`).
- ESLint flat config (`eslint.config.js`) runs Prettier as a rule, so `npm run lint` fails on formatting drift. Run `npm run format` or `npm run lint:fix` to autofix.

## Things that look broken but aren't

- `App.tsx` hardcodes `const isAuthed = true; // TODO` — auth gating is intentionally stubbed. Don't "fix" it without a real auth flow.
- `apiClient` does not inject any auth header. The backend already reads `user-external-id` from headers — if you wire auth, add it inside `ApiClient.request` so every call gets it.
- Routes `/theme` and `/preview` are dev-only previews (theme tokens, `ResultCardPreview`). Leave them out of any route guard or sitemap logic.
- `main.tsx` imports `print.css` purely for the side effect (drives the `react-to-print` PDF flow on `ResultCardPreview`). Don't remove it.

## Theme

The MUI theme defines custom palette keys (e.g. `theme.palette.background.accent`, `theme.palette.background.primary`) declared in `theme/theme.ts` / `theme/CreateTheme.ts`. Check what already exists before adding new color usages — and if you add a new key, extend the MUI module augmentation in the theme files, not inline.

## Surfacing API messages

The backend returns `response.userMessage` / `response.message` on both success and error. Pipe these into `react-toastify` instead of hardcoding English strings on the frontend — the backend owns the wording.

## Env

`.env` requires `VITE_API_BASE_URL` (read via `config/env.ts`). There is no `.env.example` committed — if you set up onboarding, add one with `VITE_API_BASE_URL=http://localhost:5000/edu-tracker/api/v1`.

## Commit style

Match recent log: short capitalized noun-phrase subjects (e.g. `Student APIs`, `Subjects and Monthly Data Management`). No conventional-commits prefix.
