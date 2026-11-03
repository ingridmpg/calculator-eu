import { progressiveTax } from '../../lib/tax.ts'
import { step } from '../../lib/trace.ts'
import type {
  CountryTaxModel,
  Household,
  TaxBracket,
  TaxSection,
  TraceStep,
} from '../../lib/types.ts'

// France: employees (non-cadre). A married couple always files jointly: social
// contributions and the 10% allowance are per earner (half the household salary each),
// and income tax uses the quotient familial (2 parts, plus half a part per child).
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

/** AGIRC-ARRCO CET, employee share. */
const CET_RATE = 0.0014

/**
 * Employer contributions that depend on the PASS: basic pension 8.55%, AGIRC-ARRCO 4.72%,
 * CEG 1.29% and FNAL 0.10% (under 50 employees) up to 1 PASS; AGIRC-ARRCO 12.95% and
 * CEG 1.62% from 1 to 8 PASS.
 */
const EMPLOYER_CAPPED_BRACKETS: readonly TaxBracket[] = [
  { upTo: PASS, rate: 0.0855 + 0.0472 + 0.0129 + 0.001 },
  { upTo: 8 * PASS, rate: 0.1295 + 0.0162 },
  { upTo: Infinity, rate: 0 },
]

/**
 * Employer contributions on the whole salary: health 13%, basic pension (uncapped) 2.11%,
 * family allowances 5.25%, CSA 0.30% and dialogue social 0.016%.
 */
const EMPLOYER_UNCAPPED_RATE = 0.13 + 0.0211 + 0.0525 + 0.003 + 0.00016

/** Unemployment insurance 4% + AGS 0.25%, up to 4 PASS. */
const EMPLOYER_UNEMPLOYMENT_RATE = 0.04 + 0.0025

/** AGIRC-ARRCO CET, employer share: same base as the employee CET. */
const EMPLOYER_CET_RATE = 0.0021

/** Work accidents: rate for administrative support staff (arrêté of 30/12/2025, code 00.00B). */
const WORK_ACCIDENT_RATE = 0.0064

/** Formation professionnelle 0.55% (under 11 employees) + taxe d'apprentissage 0.68%. */
const TRAINING_LEVIES_RATE = 0.0055 + 0.0068

/**
 * Réduction générale dégressive unique (CSS art. L241-13), under 50 employees: it falls
 * from 39.81% of pay at the minimum wage to 2% just below 3 times the minimum wage, and
 * stops there. The minimum wage stays at its 1 January 2026 value (€12.02 × 1,820 hours).
 */
const ANNUAL_MINIMUM_WAGE = 21_876.4
const GENERAL_REDUCTION_LIMIT = 3 * ANNUAL_MINIMUM_WAGE
const GENERAL_REDUCTION_MIN = 0.02
const GENERAL_REDUCTION_DELTA = 0.3781
const GENERAL_REDUCTION_EXPONENT = 1.75

/** CSG and CRDS are charged on 98.25% of salary up to 4 PASS, and on 100% above. */
const CSG_CRDS_BASE_BRACKETS: readonly TaxBracket[] = [
  { upTo: 4 * PASS, rate: 0.9825 },
  { upTo: Infinity, rate: 1 },
]
const CSG_DEDUCTIBLE_RATE = 0.068
const CSG_NON_DEDUCTIBLE_RATE = 0.024
const CRDS_RATE = 0.005

/** CGI art. 83: flat 10% allowance for work expenses, with a floor and a ceiling per earner. */
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

/** CGI art. 194: half a part for each of the first two children (the profiles have at most two). */
const PARTS_PER_CHILD = 0.5

/** CGI art. 197, 2: the tax saving from each extra half part is capped. */
const QUOTIENT_CAP_PER_HALF_PART = 1_807

/** Décote: reduces small tax bills (CGI art. 197, 4), for a single person or a couple. */
const DECOTE_BASE = { single: 897, couple: 1_483 }
const DECOTE_RATE = 0.4525

/** CGI art. 1657: income tax below this amount is not collected. */
const MIN_COLLECTED_TAX = 61

/**
 * Contribution exceptionnelle sur les hauts revenus (CGI art. 223 sexies), per adult
 * (the thresholds double for a couple).
 * The 2026 minimum-rate contribution (CDHR) never applies to salaries alone, because
 * income tax on them already exceeds 20%, so it is not modelled.
 */
const HIGH_INCOME_BRACKETS: readonly TaxBracket[] = [
  { upTo: 250_000, rate: 0 },
  { upTo: 500_000, rate: 0.03 },
  { upTo: Infinity, rate: 0.04 },
]

/** CET base: the whole salary up to 8 PASS, only for salaries above 1 PASS. */
function cetBase(gross: number): number {
  return gross > PASS ? Math.min(gross, 8 * PASS) : 0
}

function socialContributions(gross: number) {
  const csgCrdsBase = progressiveTax(gross, CSG_CRDS_BASE_BRACKETS)
  const cet = cetBase(gross) * CET_RATE

  const pension = progressiveTax(gross, CAPPED_PENSION_BRACKETS) + gross * UNCAPPED_PENSION_RATE + cet
  const deductibleCsg = csgCrdsBase * CSG_DEDUCTIBLE_RATE
  const nonDeductible = csgCrdsBase * (CSG_NON_DEDUCTIBLE_RATE + CRDS_RATE)

  return { pension, deductibleCsg, nonDeductible, deductible: pension + deductibleCsg }
}

/** Tax from the scale applied to the income of one part, times the number of parts. */
function quotientTax(taxableIncome: number, parts: number): number {
  return progressiveTax(taxableIncome / parts, INCOME_TAX_BRACKETS) * parts
}

/**
 * Tax with the quotient familial: each child's half part lowers the tax, but by at most
 * the cap per half part; `quotientCap` is what the cap adds back.
 */
export function familyQuotientTax(taxableIncome: number, adults: number, children: number) {
  const taxWithoutChildren = quotientTax(taxableIncome, adults)
  const taxWithChildren = quotientTax(taxableIncome, adults + PARTS_PER_CHILD * children)
  const capLimit = taxWithoutChildren - QUOTIENT_CAP_PER_HALF_PART * children
  return { taxWithChildren, quotientCap: Math.max(capLimit - taxWithChildren, 0) }
}

function expensesAllowance(netTaxableSalary: number): number {
  return Math.min(
    Math.max(netTaxableSalary * EXPENSES_ALLOWANCE_RATE, EXPENSES_ALLOWANCE_MIN),
    EXPENSES_ALLOWANCE_MAX,
    netTaxableSalary,
  )
}

function computeTaxes(gross: number, { adults, children }: Household): TaxSection[] {
  const earnerGross = gross / adults
  const earner = socialContributions(earnerGross)
  const earnerNetTaxable = Math.max(earnerGross - earner.deductible, 0)

  const deductible = earner.deductible * adults
  const netTaxableSalary = earnerNetTaxable * adults
  const allowance = expensesAllowance(earnerNetTaxable) * adults
  const taxableIncome = netTaxableSalary - allowance

  const { taxWithChildren, quotientCap } = familyQuotientTax(taxableIncome, adults, children)
  const taxFromScale = taxWithChildren + quotientCap

  // The décote can cancel the tax but never makes it negative.
  const decoteBase = adults > 1 ? DECOTE_BASE.couple : DECOTE_BASE.single
  const decote = Math.min(Math.max(decoteBase - DECOTE_RATE * taxFromScale, 0), taxFromScale)
  const taxAfterDecote = taxFromScale - decote

  return [
    {
      part: 'socialSecurity',
      steps: [
        step.base('pensionContributions', earner.pension * adults),
        step.add('deductibleCsg', earner.deductibleCsg * adults),
        step.add('nonDeductibleCsgCrds', earner.nonDeductible * adults),
      ],
    },
    {
      part: 'incomeTax',
      steps: [
        step.base('gross', gross),
        step.subtract('deductibleContributions', deductible),
        step.subtotal('netTaxableSalary', netTaxableSalary),
        step.subtract('expensesAllowance', allowance),
        step.subtotal('taxableIncome', taxableIncome),
        step.base(adults > 1 ? 'familyQuotientTax' : 'taxFromScale', taxWithChildren),
        step.add('quotientCap', quotientCap),
        step.subtract('decote', decote),
        step.subtract('uncollectedTax', taxAfterDecote < MIN_COLLECTED_TAX ? taxAfterDecote : 0),
      ],
    },
    {
      part: 'otherTaxes',
      steps: [
        step.base(
          'highIncomeContribution',
          progressiveTax(taxableIncome / adults, HIGH_INCOME_BRACKETS) * adults,
        ),
      ],
    },
  ]
}

/** Coefficient rounded to 4 decimals, as the law requires, and never above its maximum. */
function generalReductionRate(gross: number): number {
  if (gross <= 0 || gross >= GENERAL_REDUCTION_LIMIT) return 0
  const ratio = (GENERAL_REDUCTION_LIMIT / gross - 1) / 2
  const rate = Math.min(
    GENERAL_REDUCTION_MIN + GENERAL_REDUCTION_DELTA * ratio ** GENERAL_REDUCTION_EXPONENT,
    GENERAL_REDUCTION_MIN + GENERAL_REDUCTION_DELTA,
  )
  return Math.round(rate * 10_000) / 10_000
}

function computeEmployerContributions(gross: number): TraceStep[] {
  const contributions =
    progressiveTax(gross, EMPLOYER_CAPPED_BRACKETS) +
    gross * EMPLOYER_UNCAPPED_RATE +
    Math.min(gross, 4 * PASS) * EMPLOYER_UNEMPLOYMENT_RATE +
    cetBase(gross) * EMPLOYER_CET_RATE
  const reductionRate = generalReductionRate(gross)

  return [
    step.add('employerContribution', contributions),
    step.add('workAccidentInsurance', gross * WORK_ACCIDENT_RATE, WORK_ACCIDENT_RATE),
    step.add('trainingLevies', gross * TRAINING_LEVIES_RATE, TRAINING_LEVIES_RATE),
    step.subtract('generalReduction', gross * reductionRate, reductionRate),
  ]
}

export const france: CountryTaxModel = {
  year: 2026,
  sources: [
    {
      id: 'incomeTaxScale',
      label: 'Barème de l’impôt sur le revenu 2026 (Service Public)',
      url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F1419',
    },
    {
      id: 'urssaf',
      label: 'Taux de cotisations du secteur privé (Urssaf)',
      url: 'https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/taux-cotisations-secteur-prive.html',
    },
    {
      id: 'pass',
      label: 'Plafond de la Sécurité sociale 2026 (Legisocial)',
      url: 'https://www.legisocial.fr/reperes-sociaux/plafond-securite-sociale-2026.html',
    },
    {
      id: 'generalReduction',
      label: 'Réduction générale dégressive unique 2026 (Service Public)',
      url: 'https://entreprendre.service-public.gouv.fr/vosdroits/F24542',
    },
    {
      id: 'workAccidentRates',
      label: 'Arrêté du 30 décembre 2025 — tarification AT/MP 2026 (Légifrance)',
      url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053228984',
    },
    {
      id: 'employerSimulator',
      label: 'Simulateur de coût d’embauche (Urssaf)',
      url: 'https://mon-entreprise.urssaf.fr/simulateurs/salaire-brut-net',
    },
    {
      id: 'familyQuotient',
      label: 'Quotient familial: nombre de parts et plafonnement (Service Public)',
      url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F2705',
    },
    {
      id: 'expensesAllowance',
      label: 'Déduction forfaitaire de 10 % pour frais professionnels (Service Public)',
      url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F1989',
    },
    {
      id: 'familyAllowances',
      label: 'Allocations familiales (Service Public)',
      url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F13213',
    },
    {
      id: 'decote',
      label: 'Décote et abattement de 10 % 2026 (Legifiscal)',
      url: 'https://www.legifiscal.fr/actualites-fiscales/4474-ir-bareme-2026-quotient-familial-decote.html',
    },
  ],
  notes: [
    { id: 'nonExecutive', kind: 'included', sourceIds: ['urssaf'] },
    { id: 'taxScaleYear', kind: 'included', sourceIds: ['incomeTaxScale'] },
    {
      id: 'familyQuotient',
      kind: 'included',
      sourceIds: ['familyQuotient', 'decote', 'expensesAllowance'],
    },
    {
      id: 'employerCost',
      kind: 'included',
      sourceIds: ['urssaf', 'generalReduction', 'workAccidentRates', 'employerSimulator'],
    },
    { id: 'companyInsurance', kind: 'excluded', sourceIds: [] },
    { id: 'familyAllowances', kind: 'excluded', sourceIds: ['familyAllowances'] },
    { id: 'mobilityLevy', kind: 'excluded', sourceIds: ['urssaf'] },
  ],
  computeTaxes,
  computeEmployerContributions,
}
