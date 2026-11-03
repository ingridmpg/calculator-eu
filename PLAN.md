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
| Germany | EUR | Income tax (§ 32a EStG, annual assessment) + Soli + social insurance, no church tax |
| Netherlands | EUR | Box 1 (includes national insurance) + tax credits |
| Ireland | EUR | Income tax + USC + PRSI |
| Italy | EUR | IRPEF + regional/municipal surcharges (reference city) + INPS |

Belgium moved to v2: several 2026 values (special social security contribution scale for singles, flat professional expenses cap, work bonus amounts, indexed tax-free amount after the July 2026 reform) could not be confirmed in official sources.

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

- `src/data/countries/<code>.ts`: one `CountryTaxModel` per country: `year`, `sources`,
  `notes` (id, kind and source ids; text in `src/i18n/`) and a pure `computeTaxes(gross)` that returns the calculation as sections (income tax,
  social security, other taxes), each a list of steps: base amounts, deductions,
  subtotals, tax from the scale and credits. A second pure function,
  `computeEmployerContributions(gross)`, returns the employer's contributions as steps
  (statutory only; where a rate depends on the sector or company, a named reference
  case is used and explained in a note). Rates and thresholds are named constants at the top of the file, each with
  its legal reference. Tax systems differ too much (e.g. PT's minimum-existence rule)
  for one shared data schema, so each country owns its calculation, built from shared helpers.
- `src/data/countries/index.ts`: the country list: code, flag and tax model for each
  country. Adding a country means adding one entry here.
- `src/lib/tax.ts`: shared helpers, e.g. `progressiveTax(income, brackets)`.
- `src/lib/trace.ts`: step builders (`step.base`, `step.subtract`, ...) and `sectionTotal`,
  which replays a section's steps.
- `src/lib/notes.ts`: groups a country's notes by kind and numbers its sources.
- `src/lib/calculator.ts`: `calculateSalary(gross, taxModel)` takes every amount from
  the trace (so the explanation always matches the result) and derives net, monthly
  net and effective rate, plus the employer contributions and the total employer cost.
- `src/components/`: `SalaryInput`, `CountryPicker`, `ResultPanel`, `Breakdown`, `CalculationTrace`,
  `CountryNotes`, `Assumptions`, plus the small shared `Disclosure` and `PartSwatch`.

## Phases

- [x] **Phase 0 — Planning**: CLAUDE.md + PLAN.md
- [x] **Phase 1 — Scaffold & visual skeleton**: Vite + React + TS, layout and styles with mock data, CI workflow.
- [x] **Phase 2 — Calculation engine**: generic progressive brackets + Portugal as the first real country, with tests.
- [x] **Phase 3 — Remaining countries**: added one at a time, each validated (ES, FR, DE, NL, IE, IT; Belgium moved to v2).
- [x] **Phase 4 — Result visualisation**: stacked bar (palette checked with a colour-blind validator), share of gross per line, bar and list highlight each other on hover.
- [x] **Phase 5 — Polish**: per-country notes and sources (collapsible), slider announces the amount in euros, heading order, no horizontal scroll down to 320px.
- [x] **Phase 6 — README**: README with screenshot, countries, assumptions, accuracy, architecture and how to run; `netlify.toml` for deployment. Last v1 phase.

Each phase is developed on its own branch and merged through its own pull request
(see "Git workflow" in CLAUDE.md).

### v2 (after v1)

Same workflow as v1: one branch and one PR per phase, confirmed with the user before
the next one.

- [x] **Phase 7 — Calculation trace**: each country model returns its calculation as
  steps (taxable base, deductions, subtotals, tax from the scale, credits) and the
  amounts are derived from those steps. The panel shows them under "Como foi calculado".
  Brackets are not listed one by one: the trace shows the tax from the whole scale.
- [x] **Phase 8 — Structured notes and sources**: each country model lists its notes
  with an id, a kind (included in the calculation, not included, to be confirmed) and
  the ids of the sources behind them. The text stays in `src/i18n/` under the same id.
  The panel groups notes by kind and links each one to its numbered source.
- [x] **Phase 9 — Total employer cost**: statutory employer contributions per country,
  shown below the breakdown and as a step list in "Como foi calculado". Where a rate
  depends on the sector or company size, each country uses a named reference (e.g.
  office work, small company) and says so in a note. Validated in "Employer cost" below.
- [ ] **Phase 10 — Taxpayer profiles** (see below), one country at a time with a pause
  after each, as in Phase 3.
- [ ] **Phase 11 — Belgium**, once its 2026 values are confirmed, with all three profiles.
- [ ] **Phase 12 — English UI**: a second language for the strings, with a switch.
  Portuguese stays the default.
- [ ] **Phase 13 — Extras**: shareable URL, 12 vs 14 monthly payments.

After v2: more countries and non-euro currencies.

#### Taxpayer profiles (v2)

Three profiles, picked in the UI:

| Profile | Salary field | Result |
|---|---|---|
| Single, no children (current v1 profile) | Gross annual salary | Net salary of the person |
| Married, 1 child | Gross annual salary **of the household** | Net salary of the household |
| Married, 2 children | Gross annual salary **of the household** | Net salary of the household |

- For the married profiles the salary field label says it is the household's
  gross salary, and the result labels say "household".
- Children are aged 6 to 17 (no childcare-age rules, no adult-dependant rules).
- The result is the **salary after deductions** only. Family cash benefits paid
  per child (abono de família, Kindergeld, allocations familiales, assegno unico,
  child benefit, …) are not added; each country's notes mention them.
- Married profiles use **joint taxation** wherever the country has it, so income
  tax depends only on the household's total, not on who earns what:
  - Joint taxation: PT (joint filing, conjugal quotient), ES (declaración
    conjunta), FR (quotient familial, always joint), DE (Ehegattensplitting),
    IE (joint assessment).
  - NL and IT have no joint taxation: each spouse is always taxed individually.
  - Social security is always per person, with per-person ceilings.
  - Where the result still depends on the split (NL and IT income tax, social
    security ceilings, the IE band increase for a second earner), the household
    salary is split **50/50** between two earners.
  - Joint taxation is applied even where it is not the most favourable choice
    (e.g. ES with two similar salaries); the notes say so.
- Each profile is validated like v1: at least two reference values per country,
  recorded in "Validation".
- When this ships, update "Fixed taxpayer profile" in CLAUDE.md, the on-screen
  assumptions and the README.

### v3
- **Assistant (RAG)** that answers questions about the result and the tax rules.
  - Runs in a Netlify Function (`/api/ask`); the API key stays server-side.
  - Retrieval over official legal texts and the structured notes (multilingual).
    The corpus is small, so no vector database: embeddings or BM25 built at
    build time into a JSON file.
  - The model never computes amounts: it calls `calculateSalary` (and the
    calculation trace) as a tool.
  - Answers cite country, tax year and source.
  - Out of scope questions and personal tax advice are refused.
  - Rate limiting (e.g. Netlify Blobs) and a monthly spend cap.
  - An eval set built from the "Validation" table; evals run outside CI.

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
| NL | €56,160 | €42,191 | [belastinghelden.nl worked example](https://belastinghelden.nl/bruto-netto/rekenvoorbeeld) (5) | €42,191.50 | ✅ |
| NL | €60,000 | €3,675/month | [nettonu.nl](https://nettonu.nl/populaire-salarissen) (5) | €3,674.46/month | ✅ |
| NL | €30,000 | €27,754.13 | Hand calculation from Belastingdienst tables (5) | €27,754.13 | ✅ |
| IE | €30,000 | €26,295.93 | [irishcalculators.ie](https://irishcalculators.ie/salary-after-tax/30000-after-tax/) (6) | €26,295.93 | ✅ |
| IE | €60,000 | €44,924.68 | [irishcalculators.ie](https://irishcalculators.ie/salary-after-tax/60000-after-tax/) (6) | €44,924.68 | ✅ |
| IT (Milan) | €30,000 | €23,425 | [stipendee.it](https://www.stipendee.it/stipendio-netto/30000-euro-lordi) (7) | €23,425.52 | ✅ |
| IT (Milan) | €60,000 | €37,555 | [calcolonetto.it](https://www.calcolonetto.it/stipendio-netto-60k/) (7) | €37,554.66 | ✅ |

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

(5) No pension contributions, no deductions. Employee national insurance is part of
the first-bracket rate, so the app shows it inside income tax and social security as
€0. Explained in the Netherlands note.

(6) Matches to the cent: income tax with €4,000 credits, USC as "other taxes", PRSI
weighted 9 months at 4.2% and 3 months at 4.35% (rate rise on 1 October 2026).

(7) Regional (Lombardia) and municipal (Milan) surcharges match to the cent at €30k.
Employee first insured after 1995 (INPS ceiling applies). Not modelled: the tax-free
cash supplement up to €20,000 and the trattamento integrativo up to €15,000, so net
pay below ~€20,000 is understated. Explained in the Italy note.

### Employer cost

| Country | Gross | Expected cost | Source | Calculated cost | OK? |
|---------|-------|---------------|--------|-----------------|-----|
| PT | €30,000 | €37,125 | [simula.pt](https://simula.pt/simuladores/simulador_custo_de_funcionario) (8) | €37,125 | ✅ |
| ES | €30,000 | €39,645 | [Checkingo](https://checkingoapp.com/cuanto-cuesta-un-empleado-empresa-espana-2026) (9) | €39,645 | ✅ |
| FR | €20,000 | €20,329.20 | [Urssaf simulator](https://mon-entreprise.urssaf.fr/simulateurs/salaire-brut-net) (10) | €20,329.20 | ✅ |
| FR | €30,000 | €37,279.80 | Urssaf simulator (10) | €37,279.80 | ✅ |
| FR | €60,000 | €83,680.85 | Urssaf simulator (10) | €83,680.85 | ✅ |
| FR | €80,000 | €113,304.05 | Urssaf simulator (10) | €113,304.05 | ✅ |
| DE | €48,000 | €58,435.20 | [deutschland-rechner.de](https://www.deutschland-rechner.de/arbeitgeberkosten-rechner) (11) | €58,435.20 | ✅ |
| NL | €36,000 | €42,166.80 | [administratiex.nl](https://administratiex.nl/blog/werkgeverspremies-2026) (12) | €42,166.80 | ✅ |
| IE | €40,000 | €44,515 | [Saffery](https://www.saffery.com/ie/insights/articles/upcoming-prsi-rate-changes-effective-1-october-2026-what-employers-need-to-know/) (13) | €44,515 | ✅ |
| IT | €30,000 | €40,766.22 | [Numica](https://www.numica.it/calcolatori/costo-aziendale) (14) | €40,766.22 | ✅ |

(8) Same 23.75% TSU on gross and no compensation funds. The simulator also adds 1%
work accident insurance and the meal allowance, which the app leaves out (see the
Portugal notes).

(9) Same rates (30.65% + 1.50% work accidents) from Orden PJC/297/2026; the guide
applies 32.15% to gross.

(10) Company with 5 employees, the administrative work-accident rate (fonctions
support, 0.64%) and no mutuelle, queried through the public mon-entreprise API.
Includes the 2026 general reduction (RGDU).

(11) The calculator gives €58,224 (21.30%: social insurance + U3) with U1, U2 and
accident insurance at 0%. Adding the app's U2 reference (0.44% × €48,000 = €211.20)
gives €58,435.20.

(12) Small employer, permanent contract: €468.30 a month on €3,000 (Awf 2.74%, Aof
6.27%, Wko 0.50%, Zvw 6.10%) without Whk, which is set per employer. Adding the
average Whk (1.52% × €36,000 = €547.20) gives €42,166.80.

(13) Saffery: €40,000 × 11.25% = €4,500 a year before 1 October 2026 and €4,560 at
11.40% after. Weighted 9 months / 3 months, as for employee PRSI: €4,515.

(14) CCNL Commercio: Numica gives €41,585.22 with INPS 28.98% (€8,694), TFR
(€2,072.22), INAIL 0.70% (€210), CCNL funds (€144) and Fon.Te pension (€465). Without
INAIL and the funds, which the app leaves out, that is €40,766.22. The 28.98% total
also matches the Kitech table for commerce companies up to 50 employees.

### Portugal — pending
- TODO: verify — a 2026 rate cut for brackets 1–6 (law promulgated 2026-10-20) needs a
  government decree-law. When published, update `INCOME_TAX_BRACKETS` in
  `src/data/countries/pt.ts` and the expected values above.

## Decisions

- Countries for v1: the seven listed above. Belgium moved to v2 (unconfirmed 2026 values).
- Italy: no extra result fields for the low-income cash supplements; explain them in the Italy note (Phase 5).
- Stack: React + Vite, no Next.js (confirmed).
- Theme: light mode only; no dark mode.
- Language: TypeScript.
- UI language: Portuguese (pt-PT) is the main language. English is optional (v2).
  From Phase 1, all UI strings live in one place so English can be added without
  touching components.
- Total employer cost (Phase 9): statutory contributions only. Rates that vary by sector,
  company size or insurer use a stated reference case: ES and FR office work-accident
  rates; FR under 11 employees; DE over 30 employees with the TK U2 rate; NL small
  employer with the average Whk; IT commerce up to 50 employees, with TFR. Insurance
  without an official reference rate (PT work accidents, DE Berufsgenossenschaft,
  IT INAIL) is left out and named in the notes.
- Cost-of-living adjustment: out of scope (not in v1 or v2).
- Taxpayer profiles (v2): single without children (current), married with 1 child,
  married with 2 children. Married profiles take the household's gross salary and
  show the household's net salary. Children aged 6–17. Family cash benefits are
  excluded from the result and only mentioned in the notes. Joint taxation where the
  country has it (PT, ES, FR, DE, IE); NL and IT tax individually; social security
  is per person; where the split matters, 50/50 between two earners.
- Assistant (RAG): v3. Needs the v2 calculation trace and structured notes first.

## Open questions

None at the moment.
