# PLAN.md — European Annual Salary Calculator

## Goal

A single page where the user enters a **gross annual salary**, selects a
European country, and sees the **net salary** for that country with a clear
view of where the money goes (income tax, social security, other).

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
- State: React `useState` only; no state library.

## Visual design

- Layout: short header → salary input → country picker → result panel → notes.
- Typography: one readable sans-serif (e.g. Inter), tabular numbers.
- Calm palette, one accent colour; consistent colours for net / income tax / social security.
- Flags as emoji (no external images).
- Responsive (country grid reflows; panel below on mobile, beside on desktop).
- Light mode only. Dark mode is out of scope (decided).
- Instant updates while typing (no "calculate" button).

## Architecture

- `src/data/countries/<code>.ts`: one object per country with `code`, `name`,
  `flag`, `currency`, `year`, `sources`, `incomeTaxBrackets`,
  `socialSecurity` (rate, caps), `allowances` / `credits`.
- `src/lib/calculator.ts`: generic engine (progressive brackets, social security
  caps, deductions), plus a per-country hook when a rule doesn't fit the generic model.
- `src/components/`: `SalaryInput`, `CountryPicker`, `ResultPanel`, `Breakdown`, `Assumptions`.

## Phases

- [x] **Phase 0 — Planning**: CLAUDE.md + PLAN.md
- [ ] **Phase 1 — Scaffold & visual skeleton**: Vite + React + TS, layout and styles with mock data.
- [ ] **Phase 2 — Calculation engine**: generic progressive brackets + Portugal as the first real country, with tests.
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

## Validation (fill in during Phase 3)

| Country | Gross | Expected net | Source | Calculated net | OK? |
|---------|-------|--------------|--------|----------------|-----|
| PT | €30,000 | | | | |
| PT | €60,000 | | | | |

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
