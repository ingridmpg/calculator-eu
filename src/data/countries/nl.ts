import { progressiveTax } from '../../lib/tax.ts'
import { step } from '../../lib/trace.ts'
import type { CountryTaxModel, TaxBracket, TaxSection } from '../../lib/types.ts'

// Netherlands, tax year 2026: box 1 for an employee under AOW age, no pension
// contributions (they depend on the employer's scheme) and no deductions.
// Employee national insurance (volksverzekeringen) is included in the first-bracket
// rate, so it is reported as part of income tax. Employee insurance (WW, WIA) and the
// Zvw health contribution are paid by the employer.

/** Box 1 rates 2026 under AOW age (Belastingdienst). */
const BOX_1_BRACKETS: readonly TaxBracket[] = [
  { upTo: 38_883, rate: 0.3575 },
  { upTo: 78_426, rate: 0.3756 },
  { upTo: Infinity, rate: 0.495 },
]

/** Algemene heffingskorting 2026: full up to €29,736, then reduced by 6.398%. */
const GENERAL_CREDIT_MAX = 3_115
const GENERAL_CREDIT_PHASE_OUT_START = 29_736
const GENERAL_CREDIT_PHASE_OUT_RATE = 0.06398

/** Arbeidskorting 2026 under AOW age (Belastingdienst table). */
function labourCredit(income: number): number {
  if (income < 11_965) return 0.08324 * income
  if (income < 25_845) return 996 + 0.31009 * (income - 11_965)
  if (income < 45_592) return 5_300 + 0.0195 * (income - 25_845)
  if (income < 132_920) return 5_685 - 0.0651 * (income - 45_592)
  return 0
}

function generalCredit(income: number): number {
  const reduction = GENERAL_CREDIT_PHASE_OUT_RATE * Math.max(income - GENERAL_CREDIT_PHASE_OUT_START, 0)
  return Math.max(GENERAL_CREDIT_MAX - reduction, 0)
}

function computeTaxes(gross: number): TaxSection[] {
  return [
    {
      // National insurance is part of the box 1 rate, so there is no social security section.
      part: 'incomeTax',
      steps: [
        step.base('taxableIncome', gross),
        step.base('taxFromScale', progressiveTax(gross, BOX_1_BRACKETS)),
        // Tax credits can reduce the tax to zero but are not paid out.
        step.subtract('generalCredit', generalCredit(gross)),
        step.subtract('labourCredit', labourCredit(gross)),
      ],
    },
  ]
}

export const netherlands: CountryTaxModel = {
  year: 2026,
  sources: [
    {
      id: 'belastingdienst',
      label: 'Voorlopige aanslag 2026: tarieven en heffingskortingen (Belastingdienst)',
      url: 'https://www.belastingdienst.nl/wps/wcm/connect/nl/voorlopige-aanslag/content/voorlopige-aanslag-tarieven-en-heffingskortingen',
    },
  ],
  notes: [
    { id: 'nationalInsurance', kind: 'included', sourceIds: ['belastingdienst'] },
    { id: 'companyPension', kind: 'excluded', sourceIds: [] },
  ],
  computeTaxes,
}
