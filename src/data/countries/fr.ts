import { progressiveTax } from '../../lib/tax.ts'
import type { CountryTaxModel, TaxBracket, TaxComponents } from '../../lib/types.ts'

// France: single employee (non-cadre), one tax part (1 part de quotient familial).
// Social contributions use 2026 rates. Income tax uses the latest published scale,
// the 2026 barème (loi de finances 2026), which applies to 2025 income.
// Company-specific items (mutuelle, prévoyance) are not included.

/** Plafond annuel de la Sécurité sociale 2026. */
const PASS = 48_060

/**
 * Employee pension contributions that depend on the PASS: basic pension (6.90% up to
 * 1 PASS) and AGIRC-ARRCO + CEG (3.15% + 0.86% up to 1 PASS, 8.64% + 1.08% from 1 to 8 PASS).
 */
const CAPPED_PENSION_BRACKETS: readonly TaxBracket[] = [
  { upTo: PASS, rate: 0.069 + 0.0315 + 0.0086 },
  { upTo: 8 * PASS, rate: 0.0864 + 0.0108 },
  { upTo: Infinity, rate: 0 },
]

/** Basic pension, uncapped part (vieillesse déplafonnée). */
const UNCAPPED_PENSION_RATE = 0.004

/** AGIRC-ARRCO CET: on the whole salary up to 8 PASS, only for salaries above 1 PASS. */
const CET_RATE = 0.0014

/** CSG and CRDS are charged on 98.25% of salary up to 4 PASS, and on 100% above. */
const CSG_CRDS_BASE_BRACKETS: readonly TaxBracket[] = [
  { upTo: 4 * PASS, rate: 0.9825 },
  { upTo: Infinity, rate: 1 },
]
const CSG_DEDUCTIBLE_RATE = 0.068
const CSG_NON_DEDUCTIBLE_RATE = 0.024
const CRDS_RATE = 0.005

/** CGI art. 83: flat 10% allowance for work expenses, with a floor and a ceiling. */
const EXPENSES_ALLOWANCE_RATE = 0.1
const EXPENSES_ALLOWANCE_MIN = 509
const EXPENSES_ALLOWANCE_MAX = 14_555

/** CGI art. 197: 2026 barème for one part. */
const INCOME_TAX_BRACKETS: readonly TaxBracket[] = [
  { upTo: 11_600, rate: 0 },
  { upTo: 29_579, rate: 0.11 },
  { upTo: 84_577, rate: 0.3 },
  { upTo: 181_917, rate: 0.41 },
  { upTo: Infinity, rate: 0.45 },
]

/** Décote for a single person: reduces small tax bills (CGI art. 197, 4). */
const DECOTE_BASE = 897
const DECOTE_RATE = 0.4525

/** CGI art. 1657: income tax below this amount is not collected. */
const MIN_COLLECTED_TAX = 61

/**
 * Contribution exceptionnelle sur les hauts revenus (CGI art. 223 sexies), single person.
 * The 2026 minimum-rate contribution (CDHR) never applies to salaries alone, because
 * income tax on them already exceeds 20%, so it is not modelled.
 */
const HIGH_INCOME_BRACKETS: readonly TaxBracket[] = [
  { upTo: 250_000, rate: 0 },
  { upTo: 500_000, rate: 0.03 },
  { upTo: Infinity, rate: 0.04 },
]

function socialContributions(gross: number) {
  const csgCrdsBase = progressiveTax(gross, CSG_CRDS_BASE_BRACKETS)
  const cet = gross > PASS ? Math.min(gross, 8 * PASS) * CET_RATE : 0

  const deductible =
    progressiveTax(gross, CAPPED_PENSION_BRACKETS) +
    gross * UNCAPPED_PENSION_RATE +
    cet +
    csgCrdsBase * CSG_DEDUCTIBLE_RATE
  const nonDeductible = csgCrdsBase * (CSG_NON_DEDUCTIBLE_RATE + CRDS_RATE)

  return { deductible, total: deductible + nonDeductible }
}

function incomeTaxAfterDecote(taxableIncome: number): number {
  const grossTax = progressiveTax(taxableIncome, INCOME_TAX_BRACKETS)
  const decote = Math.max(DECOTE_BASE - DECOTE_RATE * grossTax, 0)
  const tax = Math.max(grossTax - decote, 0)
  return tax < MIN_COLLECTED_TAX ? 0 : tax
}

function computeTaxes(gross: number): TaxComponents {
  const contributions = socialContributions(gross)

  const netTaxableSalary = Math.max(gross - contributions.deductible, 0)
  const expensesAllowance = Math.min(
    Math.max(netTaxableSalary * EXPENSES_ALLOWANCE_RATE, EXPENSES_ALLOWANCE_MIN),
    EXPENSES_ALLOWANCE_MAX,
    netTaxableSalary,
  )
  const taxableIncome = netTaxableSalary - expensesAllowance

  return {
    incomeTax: incomeTaxAfterDecote(taxableIncome),
    socialSecurity: contributions.total,
    otherTaxes: progressiveTax(taxableIncome, HIGH_INCOME_BRACKETS),
  }
}

export const france: CountryTaxModel = {
  year: 2026,
  sources: [
    {
      label: 'Barème de l’impôt sur le revenu 2026 (Service Public)',
      url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F1419',
    },
    {
      label: 'Taux de cotisations du secteur privé (Urssaf)',
      url: 'https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/taux-cotisations-secteur-prive.html',
    },
    {
      label: 'Plafond de la Sécurité sociale 2026 (Legisocial)',
      url: 'https://www.legisocial.fr/reperes-sociaux/plafond-securite-sociale-2026.html',
    },
    {
      label: 'Décote et abattement de 10 % 2026 (Legifiscal)',
      url: 'https://www.legifiscal.fr/actualites-fiscales/4474-ir-bareme-2026-quotient-familial-decote.html',
    },
  ],
  computeTaxes,
}
