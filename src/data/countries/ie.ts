import { progressiveTax } from '../../lib/tax.ts'
import { step } from '../../lib/trace.ts'
import type { CountryTaxModel, TaxBracket, TaxSection, TraceStep } from '../../lib/types.ts'

// Ireland, tax year 2026: single PAYE employee, Class A1 PRSI, no medical card.

/** Single person: 20% on the first €44,000, 40% on the balance (Revenue). */
const INCOME_TAX_BRACKETS: readonly TaxBracket[] = [
  { upTo: 44_000, rate: 0.2 },
  { upTo: Infinity, rate: 0.4 },
]

/** Single person credit €2,000 + employee (PAYE) credit €2,000 (Revenue). */
const TAX_CREDITS = 2_000 + 2_000

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

function computeTaxes(gross: number): TaxSection[] {
  return [
    { part: 'socialSecurity', steps: [step.base('prsi', annualPrsi(gross))] },
    {
      part: 'incomeTax',
      steps: [
        step.base('taxableIncome', gross),
        step.base('taxFromScale', progressiveTax(gross, INCOME_TAX_BRACKETS)),
        step.subtract('personalCredits', TAX_CREDITS),
      ],
    },
    {
      part: 'otherTaxes',
      steps: [step.base('usc', gross <= USC_EXEMPTION_LIMIT ? 0 : progressiveTax(gross, USC_BRACKETS))],
    },
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
      id: 'prsiCredit',
      label: 'PRSI credit worked example 2026 (BrightPay)',
      url: 'https://www.brightpay.ie/docs/2026/payroll-deductions/prsi/',
    },
  ],
  notes: [
    { id: 'taxCredits', kind: 'included', sourceIds: ['revenueRates', 'usc'] },
    { id: 'prsiRateChange', kind: 'included', sourceIds: ['prsi'] },
    { id: 'employerCost', kind: 'included', sourceIds: ['prsi', 'employerPrsi'] },
    { id: 'autoEnrolment', kind: 'excluded', sourceIds: ['autoEnrolment'] },
  ],
  computeTaxes,
  computeEmployerContributions,
}
