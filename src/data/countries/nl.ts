import { progressiveTax } from '../../lib/tax.ts'
import { step } from '../../lib/trace.ts'
import type { CountryTaxModel, TaxBracket, TaxSection, TraceStep } from '../../lib/types.ts'

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

/** Maximum premieloon 2026 for employee insurance and the Zvw (Staatscourant 2025, 42324). */
const MAXIMUM_PREMIUM_WAGE = 79_409

/**
 * Employer premiums 2026: WW (Awf) low rate 2.74% for a permanent contract, Aof 6.27%
 * for a small employer + 0.50% childcare surcharge, and Whk 1.52% (the average rate;
 * the real one is set per employer).
 */
const EMPLOYER_INSURANCE_RATE = 0.0274 + 0.0627 + 0.005 + 0.0152

/** Zvw werkgeversheffing 2026. */
const EMPLOYER_HEALTH_RATE = 0.061

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

function computeEmployerContributions(gross: number): TraceStep[] {
  const premiumWage = Math.min(gross, MAXIMUM_PREMIUM_WAGE)
  return [
    step.add('employerContribution', premiumWage * EMPLOYER_INSURANCE_RATE, EMPLOYER_INSURANCE_RATE),
    step.add('healthInsurance', premiumWage * EMPLOYER_HEALTH_RATE, EMPLOYER_HEALTH_RATE),
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
    {
      id: 'employerPremiums',
      label: 'Premiepercentages werknemersverzekeringen 2026 (Staatscourant 2025, 42324)',
      url: 'https://zoek.officielebekendmakingen.nl/stcrt-2025-42324.html',
    },
    {
      id: 'averageWhk',
      label: 'Definitieve sociale premies 2026 (Rendement)',
      url: 'https://www.rendement.nl/sociale-verzekeringen/nieuws/definitieve-sociale-premies-2026-zijn-bekend.html',
    },
    {
      id: 'zvw',
      label: 'Percentages Zvw 2026 (Belastingdienst)',
      url: 'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/werk_en_inkomen/zorgverzekeringswet/veranderingen-bijdrage-zvw/percentages-zvw',
    },
  ],
  notes: [
    { id: 'nationalInsurance', kind: 'included', sourceIds: ['belastingdienst'] },
    { id: 'employerCost', kind: 'included', sourceIds: ['employerPremiums', 'averageWhk', 'zvw'] },
    { id: 'companyPension', kind: 'excluded', sourceIds: [] },
  ],
  computeTaxes,
  computeEmployerContributions,
}
