import { sectionTotal, stepsTotal } from './trace.ts'
import type { CountryTaxModel, SalaryResult, TaxPartKey, TaxSection } from './types.ts'

function partTotal(trace: readonly TaxSection[], part: TaxPartKey): number {
  return trace
    .filter((section) => section.part === part)
    .reduce((total, section) => total + sectionTotal(section), 0)
}

/** Every amount comes from the trace, so the explanation always matches the result. */
export function calculateSalary(gross: number, taxModel: CountryTaxModel): SalaryResult {
  const trace = taxModel.computeTaxes(gross)
  const incomeTax = partTotal(trace, 'incomeTax')
  const socialSecurity = partTotal(trace, 'socialSecurity')
  const otherTaxes = partTotal(trace, 'otherTaxes')
  const net = gross - incomeTax - socialSecurity - otherTaxes
  const employerTrace = taxModel.computeEmployerContributions(gross)
  const employerContributions = stepsTotal(employerTrace)

  return {
    gross,
    incomeTax,
    socialSecurity,
    otherTaxes,
    net,
    netMonthly: net / 12,
    effectiveRate: gross > 0 ? 1 - net / gross : 0,
    trace,
    employerContributions,
    employerCost: gross + employerContributions,
    employerTrace,
  }
}
