import { describe, expect, it } from 'vitest'
import { calculateSalary } from '../../lib/calculator.ts'
import { spain } from './es.ts'

// Expected values derived by hand from the 2026 rules (see PLAN.md) and matching
// tecalculo.com for Madrid, 12 payments.
describe('Spain (Madrid) 2026', () => {
  it('€30,000 gross', () => {
    const result = calculateSalary(30_000, spain)
    expect(result.socialSecurity).toBeCloseTo(1_950, 2)
    // Base 26 050: state 2 990,25 − 527,25 + Madrid 2 641,33 − 506,32
    expect(result.incomeTax).toBeCloseTo(4_598.02, 2)
    expect(result.net).toBeCloseTo(23_451.98, 2)
  })

  it('€60,000 gross', () => {
    const result = calculateSalary(60_000, spain)
    expect(result.socialSecurity).toBeCloseTo(3_900, 2)
    expect(result.incomeTax).toBeCloseTo(13_916.44, 2)
    expect(result.net).toBeCloseTo(42_183.56, 2)
  })

  it('caps contributions at the ceiling and adds the solidarity contribution above it', () => {
    // Ceiling 61 214,40 × 6,5% + (67 335,84 − 61 214,40) × 0,19% + (80 000 − 67 335,84) × 0,21%
    expect(calculateSalary(80_000, spain).socialSecurity).toBeCloseTo(4_017.16, 2)
  })

  it('minimum wage (€17,094) pays no IRPF', () => {
    expect(calculateSalary(17_094, spain).incomeTax).toBe(0)
  })

  it('pays nothing on a zero salary', () => {
    expect(calculateSalary(0, spain).net).toBe(0)
  })
})
