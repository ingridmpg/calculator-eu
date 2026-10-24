import type { CountryTaxModel, SalaryResult } from './types.ts'

export function calculateSalary(gross: number, taxModel: CountryTaxModel): SalaryResult {
  const { incomeTax, socialSecurity, otherTaxes } = taxModel.computeTaxes(gross)
  const net = gross - incomeTax - socialSecurity - otherTaxes

  return {
    gross,
    incomeTax,
    socialSecurity,
    otherTaxes,
    net,
    netMonthly: net / 12,
    effectiveRate: gross > 0 ? 1 - net / gross : 0,
  }
}
