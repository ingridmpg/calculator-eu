# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

A **net annual salary calculator** for European countries.
The user enters a gross annual salary, picks a country, and sees the net
amount for that country together with a breakdown of taxes and contributions.

The detailed plan and current status live in [PLAN.md](PLAN.md). Read it
before starting any task, and update it when a phase is completed.

## Principles

- **Single page.** One screen, no routing.
- **React + Vite, no Next.js.** Static SPA, no backend, all calculations run client-side.
  See "Stack decision" in PLAN.md.
- **Simple but polished.** Clean layout, good typography, generous spacing,
  works well on mobile. Light mode only (no dark mode).
- **Go slowly.** Implement one PLAN.md phase at a time and confirm with the
  user before moving to the next one.
- **Clean, simple code.** Small focused functions and components, descriptive
  names, no duplication, no dead code, no premature abstraction. Keep data,
  logic and UI separate.
- **Documentation in English.** CLAUDE.md, PLAN.md, README, code and comments.
- **UI in Portuguese (pt-PT).** All user-facing text comes from a single strings
  module (`src/i18n/`), never hard-coded in components, so English can be added later.

## Git workflow

- One branch and one pull request per PLAN.md phase (e.g. `phase-1-scaffold`).
- `main` only changes through merged PRs.
- Mark the phase as done in PLAN.md within that phase's PR.

## Fixed taxpayer profile

There are no profile options in the UI. Every calculation assumes:

- Single, no dependants (the least favourable scenario in most countries).
- Employee (not self-employed).
- Tax resident in the selected country.
- No special regimes (e.g. IRS Jovem / IFICI in PT, Beckham law in ES,
  30% ruling in NL, impatriate regimes in IT/FR).
- No church tax; regional/local taxes use an average or a named reference city,
  stated per country.

The UI must state these assumptions clearly.

## Interaction model

Countries are **not** shown side by side. The user picks one country
(click on a card/flag) and its result is displayed in a detail panel.
Changing the salary or the selected country updates the result instantly.

## Planned structure

```
index.html
src/
  main.tsx
  App.tsx
  components/        # SalaryInput, CountryPicker, ResultPanel, Breakdown, ...
  data/countries/    # one file per country: pure tax rules, no UI
  lib/calculator.ts  # pure calculation functions
  lib/format.ts      # currency / percentage formatting
  i18n/              # UI strings (pt-PT; English later)
  styles/            # global CSS + CSS Modules
```

## Conventions

- Code, identifiers and comments in **English**.
- Amounts in **EUR**. Non-euro countries (later phase) convert with a fixed
  rate documented in their data file, with the rate's date.
- Format numbers with `Intl.NumberFormat` using the `pt-PT` locale.
- Calculation functions are **pure**: `(grossAnnual, countryRules) => result`,
  where `result` has `gross`, `incomeTax`, `socialSecurity`, `otherTaxes`,
  `net`, `netMonthly`, `effectiveRate`.
- Every country's rules include `year` and `sources` (official or reliable URLs).
- Styling with plain CSS / CSS Modules; no UI framework unless agreed.

## Tax data — caution

- Tax models are **simplifications**. Never invent brackets or rates.
- If a value is not confirmed, mark it `// TODO: verify` and tell the user.
- Reference tax year: **2026**, or the latest available, stated per country.

## Commands (once scaffolded)

- `npm install` — install dependencies
- `npm run dev` — start dev server
- `npm run build` — production build to `dist/`
- `npm test` — run unit tests (Vitest)
- `npm run lint` — lint with oxlint

## Testing

- Unit-test each country's calculator against at least two reference values
  (e.g. €30,000 and €60,000) from an official simulator or reliable source,
  recorded in PLAN.md.
