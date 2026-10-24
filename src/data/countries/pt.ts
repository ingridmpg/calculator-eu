import { progressiveTax } from '../../lib/tax.ts'
import type { CountryTaxModel, TaxBracket, TaxComponents } from '../../lib/types.ts'

// Portugal, tax year 2026: annual IRS settlement for a single employee (Category A).
//
// TODO: verify — a cut of 0.3 to 0.5 points to brackets 1–6 was authorised by a law
// promulgated on 2026-10-20 but needs a government decree-law to take effect.
// Until it is published, this uses the table in force (Lei 73-A/2025, OE 2026).

/** Indexante dos Apoios Sociais 2026 (Portaria 480-A/2025/1). */
const IAS = 537.13

/** Employee social security contribution (TSU), no ceiling. */
const SOCIAL_SECURITY_RATE = 0.11

/** CIRS art. 25: 8.54 × IAS, or the social security paid if higher. */
const MIN_SPECIFIC_DEDUCTION = 4_587.09

/** CIRS art. 78-B: 35% of general family expenses, up to €250. Assumed fully used. */
const GENERAL_EXPENSES_DEDUCTION = 250

/** CIRS art. 68 (Lei 73-A/2025). */
const INCOME_TAX_BRACKETS: readonly TaxBracket[] = [
  { upTo: 8_342, rate: 0.125 },
  { upTo: 12_587, rate: 0.157 },
  { upTo: 17_838, rate: 0.212 },
  { upTo: 23_089, rate: 0.241 },
  { upTo: 29_397, rate: 0.311 },
  { upTo: 43_090, rate: 0.349 },
  { upTo: 46_566, rate: 0.431 },
  { upTo: 86_634, rate: 0.446 },
  { upTo: Infinity, rate: 0.48 },
]

/** CIRS art. 68-A: taxa adicional de solidariedade, on taxable income. */
const SOLIDARITY_BRACKETS: readonly TaxBracket[] = [
  { upTo: 80_000, rate: 0 },
  { upTo: 250_000, rate: 0.025 },
  { upTo: Infinity, rate: 0.05 },
]

/** CIRS art. 70 n.º 1: the greater of €12,880 and 1.5 × 14 × IAS. */
const MINIMUM_EXISTENCE_REFERENCE = Math.max(12_880, 1.5 * 14 * IAS)

/**
 * CIRS art. 70 n.º 2–3 (mínimo de existência): an amount subtracted from taxable
 * income so that low salaries pay little or no IRS. It phases out as gross grows.
 */
function minimumExistenceAbatement(gross: number, specificDeduction: number): number {
  const reference = MINIMUM_EXISTENCE_REFERENCE
  const firstBracket = INCOME_TAX_BRACKETS[0]
  const generalExpensesBase = GENERAL_EXPENSES_DEDUCTION / firstBracket.rate
  const upperLimit = reference - generalExpensesBase / 3.6 + firstBracket.upTo / 3.6

  let abatement: number
  if (gross <= reference) {
    abatement = reference - specificDeduction - generalExpensesBase
  } else if (gross <= upperLimit) {
    abatement = reference - 2.6 * (gross - reference) - specificDeduction - generalExpensesBase
  } else {
    abatement = upperLimit - firstBracket.upTo - 1.35 * (gross - upperLimit) - specificDeduction
  }

  return Math.min(Math.max(abatement, 0), Math.max(gross - specificDeduction, 0))
}

function computeTaxes(gross: number): TaxComponents {
  const socialSecurity = gross * SOCIAL_SECURITY_RATE
  const specificDeduction = Math.max(MIN_SPECIFIC_DEDUCTION, socialSecurity)
  const taxableIncome =
    Math.max(gross - specificDeduction, 0) - minimumExistenceAbatement(gross, specificDeduction)

  const incomeTax = Math.max(
    progressiveTax(taxableIncome, INCOME_TAX_BRACKETS) - GENERAL_EXPENSES_DEDUCTION,
    0,
  )
  const otherTaxes = progressiveTax(taxableIncome, SOLIDARITY_BRACKETS)

  return { incomeTax, socialSecurity, otherTaxes }
}

export const portugal: CountryTaxModel = {
  year: 2026,
  sources: [
    {
      label: 'CIRS art. 68 — taxas gerais (Portal das Finanças)',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs68.aspx',
    },
    {
      label: 'CIRS art. 68-A — taxa adicional de solidariedade (Portal das Finanças)',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs68a.aspx',
    },
    {
      label: 'CIRS art. 70 — mínimo de existência (Portal das Finanças)',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs70.aspx',
    },
    {
      label: 'CIRS art. 78-B — despesas gerais familiares (Portal das Finanças)',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs78b.aspx',
    },
    {
      label: 'Dedução específica 2026: 4 587,09 € (CGD Saldo Positivo)',
      url: 'https://www.cgd.pt/Site/Saldo-Positivo/leis-e-impostos/Pages/novidades-IRS.aspx',
    },
  ],
  computeTaxes,
}
