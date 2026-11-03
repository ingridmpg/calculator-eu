import { SINGLE } from './profiles.ts'
import { scaleSteps, sectionTotal, stepsTotal } from './trace.ts'
import type { CountryTaxModel, Household, SalaryResult, TaxPartKey, TaxSection } from './types.ts'

function partTotal(trace: readonly TaxSection[], part: TaxPartKey): number {
  return trace
    .filter((section) => section.part === part)
    .reduce((total, section) => total + sectionTotal(section), 0)
}

/** Every amount comes from the trace, so the explanation always matches the result. */
export function calculateSalary(
  gross: number,
  taxModel: CountryTaxModel,
  household: Household = SINGLE,
): SalaryResult {
  const trace = taxModel.computeTaxes(gross, household)
  const incomeTax = partTotal(trace, 'incomeTax')
  const socialSecurity = partTotal(trace, 'socialSecurity')
  const otherTaxes = partTotal(trace, 'otherTaxes')
  const net = gross - incomeTax - socialSecurity - otherTaxes
  // Employer contributions are per earner; a couple's salary is split 50/50.
  const { adults } = household
  const employerTrace = scaleSteps(taxModel.computeEmployerContributions(gross / adults), adults)
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
