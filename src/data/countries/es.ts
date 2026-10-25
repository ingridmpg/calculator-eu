import { progressiveTax } from '../../lib/tax.ts'
import type { CountryTaxModel, TaxBracket, TaxComponents } from '../../lib/types.ts'

// Spain, tax year 2026: IRPF (state + Comunidad de Madrid) for a single employee
// with a permanent contract, paid in 12 monthly instalments.

/** Monthly contribution ceiling (Orden PJC/297/2026, art. 2), as an annual amount. */
const MONTHLY_CONTRIBUTION_CEILING = 5_101.2
const ANNUAL_CONTRIBUTION_CEILING = MONTHLY_CONTRIBUTION_CEILING * 12

/**
 * Employee share (Orden PJC/297/2026): contingencias comunes 4.70% + desempleo 1.55%
 * (permanent contract) + formación profesional 0.10% + MEI 0.15%, up to the ceiling.
 */
const SOCIAL_SECURITY_RATE = 0.047 + 0.0155 + 0.001 + 0.0015

/** Cotización adicional de solidaridad, employee share, on pay above the ceiling (art. 17). */
const SOLIDARITY_CONTRIBUTION_BRACKETS: readonly TaxBracket[] = [
  { upTo: ANNUAL_CONTRIBUTION_CEILING, rate: 0 },
  { upTo: 5_611.32 * 12, rate: 0.0019 },
  { upTo: 7_651.8 * 12, rate: 0.0021 },
  { upTo: Infinity, rate: 0.0024 },
]

/** LIRPF art. 19.2.f: flat "otros gastos" deduction for employees. */
const OTHER_EXPENSES_DEDUCTION = 2_000

/** LIRPF art. 57: state mínimo del contribuyente. */
const STATE_PERSONAL_MINIMUM = 5_550

/** Comunidad de Madrid mínimo del contribuyente. */
const MADRID_PERSONAL_MINIMUM = 5_956.65

/** LIRPF art. 63: state scale. */
const STATE_BRACKETS: readonly TaxBracket[] = [
  { upTo: 12_450, rate: 0.095 },
  { upTo: 20_200, rate: 0.12 },
  { upTo: 35_200, rate: 0.15 },
  { upTo: 60_000, rate: 0.185 },
  { upTo: 300_000, rate: 0.225 },
  { upTo: Infinity, rate: 0.245 },
]

/** Comunidad de Madrid regional scale (unchanged in 2026; a cut is planned for 2027). */
const MADRID_BRACKETS: readonly TaxBracket[] = [
  { upTo: 13_362.22, rate: 0.085 },
  { upTo: 19_004.63, rate: 0.107 },
  { upTo: 35_425.68, rate: 0.128 },
  { upTo: 57_320.4, rate: 0.174 },
  { upTo: Infinity, rate: 0.205 },
]

/** RD-ley 5/2026: tax credit so that minimum-wage earners (€17,094) pay no IRPF. */
const MINIMUM_WAGE = 17_094
const MINIMUM_WAGE_CREDIT = 590.89
const MINIMUM_WAGE_CREDIT_TAPER = 0.2

/** LIRPF art. 20: reduction for low employment income, on income net of social security. */
function lowIncomeReduction(netEmploymentIncome: number): number {
  if (netEmploymentIncome <= 14_852) return 7_302
  if (netEmploymentIncome <= 17_673.52) return 7_302 - 1.75 * (netEmploymentIncome - 14_852)
  if (netEmploymentIncome <= 19_747.5) return 2_364.34 - 1.14 * (netEmploymentIncome - 17_673.52)
  return 0
}

/** The personal minimum is taxed at 0%: tax on the base minus tax on the minimum. */
function taxAboveMinimum(base: number, minimum: number, brackets: readonly TaxBracket[]): number {
  return progressiveTax(base, brackets) - progressiveTax(Math.min(base, minimum), brackets)
}

function minimumWageCredit(gross: number): number {
  const credit = MINIMUM_WAGE_CREDIT - MINIMUM_WAGE_CREDIT_TAPER * Math.max(gross - MINIMUM_WAGE, 0)
  return Math.max(credit, 0)
}

function computeTaxes(gross: number): TaxComponents {
  const socialSecurity =
    Math.min(gross, ANNUAL_CONTRIBUTION_CEILING) * SOCIAL_SECURITY_RATE +
    progressiveTax(gross, SOLIDARITY_CONTRIBUTION_BRACKETS)

  const netEmploymentIncome = Math.max(gross - socialSecurity, 0)
  const taxBase = Math.max(
    netEmploymentIncome - OTHER_EXPENSES_DEDUCTION - lowIncomeReduction(netEmploymentIncome),
    0,
  )

  const grossTax =
    taxAboveMinimum(taxBase, STATE_PERSONAL_MINIMUM, STATE_BRACKETS) +
    taxAboveMinimum(taxBase, MADRID_PERSONAL_MINIMUM, MADRID_BRACKETS)
  const incomeTax = Math.max(grossTax - minimumWageCredit(gross), 0)

  return { incomeTax, socialSecurity, otherTaxes: 0 }
}

export const spain: CountryTaxModel = {
  year: 2026,
  sources: [
    {
      label: 'Orden PJC/297/2026 — bases y tipos de cotización 2026 (BOE)',
      url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-7296',
    },
    {
      label: 'Ley 35/2006 del IRPF — texto consolidado (BOE)',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764',
    },
    {
      label: 'IRPF — escala autonómica y mínimo del contribuyente (Comunidad de Madrid)',
      url: 'https://www.comunidad.madrid/atencion-contribuyente/irpf',
    },
    {
      label: 'RD-ley 5/2026 — deducción para perceptores del SMI (Iberley)',
      url: 'https://www.iberley.es/noticias/medidas-fiscales-rd-ley-5-2026-elimina-irpf-perceptores-smi-2026-adopta-medidas-los-afectados-las-borrascas-36098',
    },
  ],
  computeTaxes,
}
