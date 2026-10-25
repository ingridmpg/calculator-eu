import { describe, expect, it } from 'vitest'
import { calculateSalary } from '../../lib/calculator.ts'
import { france } from './fr.ts'

// Contributions match salairia.com (non-cadre); income tax derived by hand from the
// 2026 barème with the 10% allowance and the décote (see PLAN.md).
describe('France 2026', () => {
  it('€30,000 gross: décote applies', () => {
    const result = calculateSalary(30_000, france)
    expect(result.socialSecurity).toBeCloseTo(6_252.08, 2)
    // Taxable 22 142,43 → gross tax 1 159,67 − décote 372,25
    expect(result.incomeTax).toBeCloseTo(787.42, 2)
    expect(result.net).toBeCloseTo(22_960.51, 2)
  })

  it('€60,000 gross: pension tranche 2 and CET above the PASS', () => {
    const result = calculateSalary(60_000, france)
    expect(result.socialSecurity).toBeCloseTo(12_446.06, 2)
    // Taxable 44 337,14 → 1 977,69 + 14 758,14 × 30%
    expect(result.incomeTax).toBeCloseTo(6_405.13, 2)
    expect(result.net).toBeCloseTo(41_148.8, 2)
  })

  it('€20,000 gross pays no income tax thanks to the décote', () => {
    expect(calculateSalary(20_000, france).incomeTax).toBe(0)
  })

  it('pays nothing on a zero salary', () => {
    expect(calculateSalary(0, france).net).toBe(0)
  })
})
