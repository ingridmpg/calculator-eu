import { progressiveTax } from '../../lib/tax.ts'
import { step } from '../../lib/trace.ts'
import type {
  CountryTaxModel,
  Household,
  TaxBracket,
  TaxSection,
  TraceStep,
} from '../../lib/types.ts'

// Ireland, tax year 2026: PAYE employees, Class A1 PRSI, no medical card. A married
// couple is jointly assessed for income tax; PRSI and USC are always per earner, each
// on half the household salary.

/** Standard rate band (20%; 40% above it), Revenue 2026. */
const STANDARD_RATE = 0.2
const HIGHER_RATE = 0.4
const SINGLE_RATE_BAND = 44_000
/** Married couple: €53,000, increased by the lower earner's income up to €35,000. */
const MARRIED_RATE_BAND = 53_000
const MAX_SECOND_EARNER_INCREASE = 35_000

/** Personal credit (€2,000 single, €4,000 married) + €2,000 employee credit per earner. */
const PERSONAL_CREDIT = { single: 2_000, married: 4_000 }
const EMPLOYEE_CREDIT = 2_000

/** Universal Social Charge 2026 (Revenue). Not charged when income is €13,000 or less. */
const USC_EXEMPTION_LIMIT = 13_000
const USC_BRACKETS: readonly TaxBracket[] = [
  { upTo: 12_012, rate: 0.005 },
  { upTo: 28_700, rate: 0.02 },
  { upTo: 70_044, rate: 0.03 },
  { upTo: Infinity, rate: 0.08 },
]

/**
 * Class A employee PRSI: 4.2% until 30 September 2026, 4.35% from 1 October 2026.
 * The year is weighted 9 months / 3 months.
 */
const PRSI_RATES = [
  { rate: 0.042, shareOfYear: 9 / 12 },
  { rate: 0.0435, shareOfYear: 3 / 12 },
]
const WEEKS_PER_YEAR = 52

/** No PRSI up to €352 a week; between €352.01 and €424 a credit of up to €12 tapers away. */
const PRSI_WEEKLY_EXEMPTION = 352
const PRSI_CREDIT_MAX = 12
const PRSI_CREDIT_TAPER_START = 352.01
const PRSI_CREDIT_TAPER_END = 424

/**
 * Class A employer PRSI (includes the National Training Fund levy), no ceiling. Pay up
 * to €552 a week is charged at the reduced rate; above it, all pay is charged at the
 * standard rate. Both rates rise by 0.15 points on 1 October 2026.
 */
const EMPLOYER_PRSI_WEEKLY_THRESHOLD = 552
const EMPLOYER_PRSI_RATES = [
  { reducedRate: 0.09, standardRate: 0.1125, shareOfYear: 9 / 12 },
  { reducedRate: 0.0915, standardRate: 0.114, shareOfYear: 3 / 12 },
]

function weeklyPrsi(weeklyPay: number, rate: number): number {
  if (weeklyPay <= PRSI_WEEKLY_EXEMPTION) return 0

  const credit =
    weeklyPay <= PRSI_CREDIT_TAPER_END
      ? Math.max(PRSI_CREDIT_MAX - (weeklyPay - PRSI_CREDIT_TAPER_START) / 6, 0)
      : 0
  return Math.max(weeklyPay * rate - credit, 0)
}

function annualPrsi(gross: number): number {
  const weeklyPay = gross / WEEKS_PER_YEAR
  return PRSI_RATES.reduce(
    (total, { rate, shareOfYear }) => total + weeklyPrsi(weeklyPay, rate) * WEEKS_PER_YEAR * shareOfYear,
    0,
  )
}

function usc(earnerGross: number): number {
  return earnerGross <= USC_EXEMPTION_LIMIT ? 0 : progressiveTax(earnerGross, USC_BRACKETS)
}

/** For a couple, the band grows by the lower earner's income (half the salary here). */
export function incomeTaxBrackets(lowerEarnerGross: number, adults: number): readonly TaxBracket[] {
  const rateBand =
    adults > 1
      ? MARRIED_RATE_BAND + Math.min(lowerEarnerGross, MAX_SECOND_EARNER_INCREASE)
      : SINGLE_RATE_BAND
  return [
    { upTo: rateBand, rate: STANDARD_RATE },
    { upTo: Infinity, rate: HIGHER_RATE },
  ]
}

function computeTaxes(gross: number, { adults }: Household): TaxSection[] {
  const earnerGross = gross / adults
  const personalCredit = adults > 1 ? PERSONAL_CREDIT.married : PERSONAL_CREDIT.single
  const credits = personalCredit + EMPLOYEE_CREDIT * adults

  return [
    { part: 'socialSecurity', steps: [step.base('prsi', annualPrsi(earnerGross) * adults)] },
    {
      part: 'incomeTax',
      steps: [
        step.base('taxableIncome', gross),
        step.base('taxFromScale', progressiveTax(gross, incomeTaxBrackets(earnerGross, adults))),
        step.subtract('personalCredits', credits),
      ],
    },
    { part: 'otherTaxes', steps: [step.base('usc', usc(earnerGross) * adults)] },
  ]
}

function computeEmployerContributions(gross: number): TraceStep[] {
  const isReducedRate = gross / WEEKS_PER_YEAR <= EMPLOYER_PRSI_WEEKLY_THRESHOLD
  const prsi = EMPLOYER_PRSI_RATES.reduce(
    (total, { reducedRate, standardRate, shareOfYear }) =>
      total + gross * (isReducedRate ? reducedRate : standardRate) * shareOfYear,
    0,
  )
  return [step.add('employerContribution', prsi)]
}

export const ireland: CountryTaxModel = {
  year: 2026,
  sources: [
    {
      id: 'revenueRates',
      label: 'Tax rates, bands and reliefs (Revenue)',
      url: 'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/tax-relief-charts/index.aspx',
    },
    {
      id: 'usc',
      label: 'Standard rates and thresholds of USC (Revenue)',
      url: 'https://www.revenue.ie/en/jobs-and-pensions/usc/standard-rates-thresholds.aspx',
    },
    {
      id: 'prsi',
      label: 'PRSI 2026 contribution rates and user guide (gov.ie)',
      url: 'https://assets.gov.ie/static/documents/cb168977/PRSI_C20260116_Contribution_Rates_and_User_Guide_-_SW_14_-_English_Version_-_January_2026_.pdf-web.pdf',
    },
    {
      id: 'employerPrsi',
      label: 'PRSI rate changes from 1 October 2026 (Saffery)',
      url: 'https://www.saffery.com/ie/insights/articles/upcoming-prsi-rate-changes-effective-1-october-2026-what-employers-need-to-know/',
    },
    {
      id: 'autoEnrolment',
      label: 'Auto-enrolment: My Future Fund (CCPC)',
      url: 'https://www.ccpc.ie/consumers/money/pensions/auto-enrolment/',
    },
    {
      id: 'childBenefit',
      label: 'Child Benefit (Citizens Information)',
      url: 'https://www.citizensinformation.ie/en/social-welfare/families-and-children/child-benefit/',
    },
    {
      id: 'prsiCredit',
      label: 'PRSI credit worked example 2026 (BrightPay)',
      url: 'https://www.brightpay.ie/docs/2026/payroll-deductions/prsi/',
    },
  ],
  notes: [
    { id: 'taxCredits', kind: 'included', sourceIds: ['revenueRates', 'usc'] },
    { id: 'prsiRateChange', kind: 'included', sourceIds: ['prsi'] },
    { id: 'jointAssessment', kind: 'included', sourceIds: ['revenueRates', 'usc'] },
    { id: 'employerCost', kind: 'included', sourceIds: ['prsi', 'employerPrsi'] },
    { id: 'autoEnrolment', kind: 'excluded', sourceIds: ['autoEnrolment'] },
    { id: 'childBenefit', kind: 'excluded', sourceIds: ['childBenefit'] },
  ],
  computeTaxes,
  computeEmployerContributions,
}
