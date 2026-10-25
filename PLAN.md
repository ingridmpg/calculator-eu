# PLAN.md — European Annual Salary Calculator

## Goal

A single page where the user enters a **gross annual salary**, selects a
European country, and sees the **net salary** for that country with a clear
view of where the money goes (income tax, social security, other).

Context: a personal MVP for a portfolio. It will be published on **Netlify**
once v1 is ready, so code quality, the README and visual polish matter as
much as features.

## v1 scope

### Inputs
- Gross annual salary (EUR): number field + slider.
- Country selection: grid of country cards (flag + name); one active at a time.

### Output (detail panel for the selected country)
- Net annual and net monthly salary (headline numbers).
- Effective tax rate.
- Breakdown: income tax, social security, other taxes (e.g. USC in IE, Soli in DE).
- Stacked bar: net vs. income tax vs. social security.
- Tax year and sources for that country.
- Footer with the fixed assumptions (see CLAUDE.md, "Fixed taxpayer profile").

### Countries (confirmed for v1)
| Country | Currency | Notes |
|---------|----------|-------|
| Portugal | EUR | IRS brackets + 11% social security |
| Spain | EUR | State + regional IRPF (reference: Madrid) |
| France | EUR | Social contributions + income tax (1 part) |
| Germany | EUR | Lohnsteuer (class I) + Soli + social insurance, no church tax |
| Netherlands | EUR | Box 1 (includes national insurance) + tax credits |
| Ireland | EUR | Income tax + USC + PRSI |
| Italy | EUR | IRPEF + regional/municipal surcharges (reference city) + INPS |
| Belgium | EUR | ONSS 13.07% + personal income tax + average municipal tax |

Later: Switzerland, UK, Poland, Sweden (require currency conversion).

## Stack decision: React + Vite, no Next.js (confirmed)

**Recommendation: React with Vite (TypeScript). Next.js is not needed.**

Next.js is useful for server-side rendering, SEO across many pages, file-based
routing, API routes and server components. This project has none of those
needs:

| Need | This project | Next.js needed? |
|------|--------------|-----------------|
| Multiple pages / routing | One page | No |
| Backend / API | All calculations client-side | No |
| SEO across many pages | A single page | No |
| Server-fetched data | Static tax data bundled with the app | No |

Vite gives a fast dev server, a minimal configuration and a static `dist/`
folder that can be hosted anywhere for free (GitHub Pages, Netlify, Vercel,
Cloudflare Pages). If SEO pages per country become a goal later
(e.g. `/salary/portugal`), migrating to Next.js or adding a static-site layer
is still possible, because the calculator logic stays in plain TS modules.

**TypeScript** (confirmed): each country's tax rules share a shape
(brackets, caps, credits), and types catch data mistakes early.

Other choices:
- Styling: plain CSS + CSS Modules, CSS variables for the colour palette.
- Charts: hand-made SVG/CSS bars (no chart library needed for v1).
- Tests: Vitest for the calculation functions.
- CI: GitHub Actions runs lint, tests and build on every PR and on `main`.
- State: React `useState` only; no state library.

## Visual design

- Layout: short header → salary input → country picker → result panel → notes.
- Typography: Schibsted Grotesk (self-hosted via Fontsource); tabular figures only in the amounts column.
- Palette inspired by euro banknotes: green (net), blue (income tax), orange (social security).
- Flags as emoji (no external images). Windows lacks flag emojis, so `country-flag-emoji-polyfill` loads a self-hosted flag font there only.
- Responsive (country grid reflows; panel below on mobile, beside on desktop).
- Light mode only. Dark mode is out of scope (decided).
- Instant updates while typing (no "calculate" button).

## Architecture

- `src/data/countries/<code>.ts`: one `CountryTaxModel` per country: `year`, `sources`
  and a pure `computeTaxes(gross)` that returns income tax, social security and other
  taxes. Rates and thresholds are named constants at the top of the file, each with
  its legal reference. Tax systems differ too much (e.g. PT's minimum-existence rule)
  for one shared data schema, so each country owns its calculation, built from shared helpers.
- `src/data/countries/index.ts`: country list (code, flag) and the registry of
  available tax models. A country without a model shows "Em breve".
- `src/lib/tax.ts`: shared helpers, e.g. `progressiveTax(income, brackets)`.
- `src/lib/calculator.ts`: `calculateSalary(gross, taxModel)` derives net, monthly
  net and effective rate from a model's taxes.
- `src/components/`: `SalaryInput`, `CountryPicker`, `ResultPanel`, `Breakdown`, `Assumptions`.

## Phases

- [x] **Phase 0 — Planning**: CLAUDE.md + PLAN.md
- [x] **Phase 1 — Scaffold & visual skeleton**: Vite + React + TS, layout and styles with mock data, CI workflow.
- [x] **Phase 2 — Calculation engine**: generic progressive brackets + Portugal as the first real country, with tests.
- [ ] **Phase 3 — Remaining countries**: added one at a time, each validated.
- [ ] **Phase 4 — Result visualisation**: stacked bar, breakdown details.
- [ ] **Phase 5 — Polish**: accessibility, notes and sources, mobile.
- [ ] **Phase 6 — README**: write the README (what it is, how to run, assumptions, sources). Last v1 phase.

Each phase is developed on its own branch and merged through its own pull request
(see "Git workflow" in CLAUDE.md).

### v2 (after v1)
- Total employer cost.
- Optional English UI (Portuguese stays the default).
- More countries, non-euro currencies, 12/14 payments, shareable URL.

## Validation

| Country | Gross | Expected net | Source | Calculated net | OK? |
|---------|-------|--------------|--------|----------------|-----|
| PT | €30,000 | €22,139.35 | Hand calculation (1) | €22,139.35 | ✅ |
| PT | €60,000 | €38,275.32 | Hand calculation (1); coleta €15,374.68 matches [calculapt.pt](https://calculapt.pt/irpf-pt-escaloes) | €38,275.32 | ✅ |
| ES (Madrid) | €30,000 | €23,452 | [tecalculo.com](https://tecalculo.com/es/sueldo-neto-30000-euros) (2) | €23,451.98 | ✅ |
| ES (Madrid) | €60,000 | €42,184 | [tecalculo.com](https://tecalculo.com/es/sueldo-neto-60000-euros) (2) | €42,183.56 | ✅ |
| FR | €30,000 | €22,960.51 | Contributions €6,252 = [salairia.com](https://salairia.com/salaire/30000-euros-brut-en-net); IR by hand (3) | €22,960.51 | ✅ |
| FR | €60,000 | €41,148.80 | Contributions €12,446 = [salairia.com](https://salairia.com/salaire/60000-euros-brut-en-net); IR by hand (3) | €41,148.80 | ✅ |
| DE | €30,000 | €21,227 | [devjobs.de](https://devjobs.de/brutto-netto-rechner/30000-euro-jahresbrutto-netto-steuerklasse-1), [deutschland-rechner.de](https://www.deutschland-rechner.de/brutto-netto-tabelle) (4) | €21,223 | ✅ (−€4) |
| DE | €60,000 | €37,561 | [deutschland-rechner.de](https://www.deutschland-rechner.de/brutto-netto-tabelle) (4) | €37,551 | ✅ (−€10) |

(1) From the official CIRS art. 68 table (Lei 73-A/2025) with the "parcela a abater" method,
11% social security, specific deduction max(€4,587.09, social security) and the €250
general expenses deduction. The Portal das Finanças simulator for 2026 income is only
published in 2027, so there is no official end-to-end figure yet. Re-check then.

(2) Also matches a hand calculation from the BOE / Comunidad de Madrid rules. Many
Spanish calculators disagree with each other (e.g. they subtract the personal minimum
from the base, or show monthly withholding), so the reference was chosen because its
figures match the legal method to the euro.

(3) Non-cadre, no mutuelle/prévoyance. Income tax uses the 2026 barème (latest
published, applies to 2025 income), the 10% allowance (min €509, max €14,555) and
the décote (€897 − 45.25% × tax). French salary simulators only show withholding at
a chosen rate, not the final annual tax, so the tax part is a hand calculation.

(4) Social security matches exactly (€6,525 at €30k). The calculators show monthly
withholding (Lohnsteuer, class I), which rounds every month and uses a flat
"Vorsorgepauschale". The app models the annual assessment (§ 32a EStG 2026), so a gap
of a few euros is expected. Average health Zusatzbeitrag 2.9%, childless care surcharge.

### Portugal — pending
- TODO: verify — a 2026 rate cut for brackets 1–6 (law promulgated 2026-10-20) needs a
  government decree-law. When published, update `INCOME_TAX_BRACKETS` in
  `src/data/countries/pt.ts` and the expected values above.

## Decisions

- Countries for v1: the eight listed above (confirmed).
- Stack: React + Vite, no Next.js (confirmed).
- Theme: light mode only; no dark mode.
- Language: TypeScript.
- UI language: Portuguese (pt-PT) is the main language. English is optional (v2).
  From Phase 1, all UI strings live in one place so English can be added without
  touching components.
- Total employer cost: v2.
- Cost-of-living adjustment: out of scope (not in v1 or v2).

## Open questions

None at the moment.
