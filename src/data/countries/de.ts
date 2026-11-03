import { progressiveTax } from '../../lib/tax.ts'
import { step } from '../../lib/trace.ts'
import type { CountryTaxModel, TaxBracket, TaxSection, TraceStep } from '../../lib/types.ts'

// Germany, tax year 2026: annual income tax assessment (Veranlagung) for a single,
// childless employee aged 23+ with statutory health insurance and no church tax.

/** Beitragsbemessungsgrenzen 2026 (annual). */
const HEALTH_CONTRIBUTION_CEILING = 69_750
const PENSION_CONTRIBUTION_CEILING = 101_400

/** Employee shares 2026, applied up to each ceiling. */
const PENSION_RATE = 0.093
const UNEMPLOYMENT_RATE = 0.013
/** 7.3% general rate + half of the 2.9% average Zusatzbeitrag. */
const HEALTH_RATE = 0.073 + 0.0145
/** 1.8% + 0.6% surcharge for childless people aged 23 and over. */
const LONG_TERM_CARE_RATE = 0.018 + 0.006

/**
 * Employer shares 2026: the same pension, unemployment and health rates as the employee,
 * and 1.8% long-term care (no childless surcharge for the employer).
 */
const EMPLOYER_LONG_TERM_CARE_RATE = 0.018

/**
 * Employer-only levies on pay up to the pension ceiling: U2 maternity 0.44% (Techniker
 * Krankenkasse, as a reference; it varies by fund) and U3 Insolvenzgeld 0.15%.
 * U1 (sick pay) only applies to employers with up to 30 employees, so it is left out.
 */
const EMPLOYER_LEVIES_RATE = 0.0044 + 0.0015

/** §9a EStG Arbeitnehmer-Pauschbetrag and §10c EStG Sonderausgaben-Pauschbetrag. */
const EMPLOYEE_ALLOWANCE = 1_230
const SPECIAL_EXPENSES_ALLOWANCE = 36

/** §10 Abs. 1 Nr. 3 EStG: health contributions are deductible minus 4% (sick pay share). */
const DEDUCTIBLE_HEALTH_SHARE = 0.96

/**
 * §10 Abs. 4 EStG: other insurance (here unemployment) is only deductible while
 * health + care contributions stay under this cap, which is rare for employees.
 */
const OTHER_INSURANCE_CAP = 1_900

/** §3 SolZG: no solidarity surcharge up to this income tax; then a 11.9% phase-in. */
const SOLIDARITY_EXEMPTION = 20_350
const SOLIDARITY_RATE = 0.055
const SOLIDARITY_PHASE_IN_RATE = 0.119

/** §32a Abs. 1 EStG 2026 tariff on taxable income rounded down to whole euros. */
function tariffIncomeTax(taxableIncome: number): number {
  const x = Math.floor(taxableIncome)
  let tax: number

  if (x <= 12_348) {
    tax = 0
  } else if (x <= 17_799) {
    const y = (x - 12_348) / 10_000
    tax = (914.51 * y + 1_400) * y
  } else if (x <= 69_878) {
    const z = (x - 17_799) / 10_000
    tax = (173.1 * z + 2_397) * z + 1_034.87
  } else if (x <= 277_825) {
    tax = 0.42 * x - 11_135.63
  } else {
    tax = 0.45 * x - 19_470.38
  }

  return Math.floor(tax)
}

function solidaritySurcharge(incomeTax: number): number {
  if (incomeTax <= SOLIDARITY_EXEMPTION) return 0
  return Math.min(
    incomeTax * SOLIDARITY_RATE,
    (incomeTax - SOLIDARITY_EXEMPTION) * SOLIDARITY_PHASE_IN_RATE,
  )
}

/** Contribution `rate` on salary up to `ceiling`. */
function cappedContribution(gross: number, rate: number, ceiling: number): number {
  const brackets: TaxBracket[] = [
    { upTo: ceiling, rate },
    { upTo: Infinity, rate: 0 },
  ]
  return progressiveTax(gross, brackets)
}

function computeTaxes(gross: number): TaxSection[] {
  const pension = cappedContribution(gross, PENSION_RATE, PENSION_CONTRIBUTION_CEILING)
  const unemployment = cappedContribution(gross, UNEMPLOYMENT_RATE, PENSION_CONTRIBUTION_CEILING)
  const health = cappedContribution(gross, HEALTH_RATE, HEALTH_CONTRIBUTION_CEILING)
  const longTermCare = cappedContribution(gross, LONG_TERM_CARE_RATE, HEALTH_CONTRIBUTION_CEILING)

  const deductibleHealthAndCare = health * DEDUCTIBLE_HEALTH_SHARE + longTermCare
  const deductibleOtherInsurance = Math.min(
    unemployment,
    Math.max(OTHER_INSURANCE_CAP - deductibleHealthAndCare, 0),
  )
  const insuranceDeductions = pension + deductibleHealthAndCare + deductibleOtherInsurance

  const taxableIncome = Math.max(
    gross - EMPLOYEE_ALLOWANCE - SPECIAL_EXPENSES_ALLOWANCE - insuranceDeductions,
    0,
  )
  const incomeTax = tariffIncomeTax(taxableIncome)

  return [
    {
      part: 'socialSecurity',
      steps: [
        step.base('pensionInsurance', pension, PENSION_RATE),
        step.add('unemploymentInsurance', unemployment, UNEMPLOYMENT_RATE),
        step.add('healthInsurance', health, HEALTH_RATE),
        step.add('longTermCareInsurance', longTermCare, LONG_TERM_CARE_RATE),
      ],
    },
    {
      part: 'incomeTax',
      steps: [
        step.base('gross', gross),
        step.subtract('employeeAllowance', EMPLOYEE_ALLOWANCE),
        step.subtract('specialExpensesAllowance', SPECIAL_EXPENSES_ALLOWANCE),
        step.subtract('deductibleContributions', insuranceDeductions),
        step.subtotal('taxableIncome', taxableIncome),
        step.base('taxFromScale', incomeTax),
      ],
    },
    {
      part: 'otherTaxes',
      steps: [step.base('solidaritySurcharge', solidaritySurcharge(incomeTax))],
    },
  ]
}

function computeEmployerContributions(gross: number): TraceStep[] {
  const contributions =
    cappedContribution(gross, PENSION_RATE + UNEMPLOYMENT_RATE, PENSION_CONTRIBUTION_CEILING) +
    cappedContribution(
      gross,
      HEALTH_RATE + EMPLOYER_LONG_TERM_CARE_RATE,
      HEALTH_CONTRIBUTION_CEILING,
    )

  return [
    step.add('employerContribution', contributions),
    step.add(
      'employerLevies',
      cappedContribution(gross, EMPLOYER_LEVIES_RATE, PENSION_CONTRIBUTION_CEILING),
      EMPLOYER_LEVIES_RATE,
    ),
  ]
}

export const germany: CountryTaxModel = {
  year: 2026,
  sources: [
    {
      id: 'tariff',
      label: '§ 32a EStG — Einkommensteuertarif 2026 (gesetze-im-internet.de)',
      url: 'https://www.gesetze-im-internet.de/estg/__32a.html',
    },
    {
      id: 'insuranceDeductions',
      label: '§ 10 EStG — Sonderausgaben / Vorsorgeaufwendungen (gesetze-im-internet.de)',
      url: 'https://www.gesetze-im-internet.de/estg/__10.html',
    },
    {
      id: 'solidaritySurcharge',
      label: 'Solidaritätszuschlag 2026: Freigrenze (Techniker Krankenkasse)',
      url: 'https://www.tk.de/firmenkunden/versicherung/beitraege-faq-und-mehr/solidaritaetszuschlag-2075802',
    },
    {
      id: 'socialInsurance',
      label: 'Sozialversicherungsbeiträge und Beitragsbemessungsgrenzen 2026 (lohn-info.de)',
      url: 'https://www.lohn-info.de/sozialversicherungsbeitraege2026.html',
    },
    {
      id: 'employerLevies',
      label: 'Beitragssätze und Umlagen 2026 (Techniker Krankenkasse)',
      url: 'https://www.tk.de/firmenkunden/versicherung/beitraege-faq-und-mehr/beitragssaetze/aktuelle-beitragssaetze-in-der-sozialversicherung-2031554',
    },
  ],
  notes: [
    { id: 'careInsurance', kind: 'included', sourceIds: ['socialInsurance'] },
    { id: 'annualTax', kind: 'included', sourceIds: ['tariff'] },
    { id: 'employerCost', kind: 'included', sourceIds: ['socialInsurance', 'employerLevies'] },
    { id: 'accidentInsurance', kind: 'excluded', sourceIds: [] },
  ],
  computeTaxes,
  computeEmployerContributions,
}
