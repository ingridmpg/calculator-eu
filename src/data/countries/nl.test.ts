import { describe, expect, it } from 'vitest'
import { calculateSalary } from '../../lib/calculator.ts'
import { netherlands } from './nl.ts'

// Expected values derived by hand from the Belastingdienst 2026 tables (see PLAN.md).
describe('Netherlands 2026', () => {
  it('€30,000 gross', () => {
    const result = calculateSalary(30_000, netherlands)
    // 10 725 − general credit 3 098,11 − labour credit 5 381,02
    expect(result.incomeTax).toBeCloseTo(2_245.87, 2)
    expect(result.net).toBeCloseTo(27_754.13, 2)
  })

  it('€56,160 gross matches the belastinghelden.nl worked example', () => {
    expect(calculateSalary(56_160, netherlands).net).toBeCloseTo(42_191.5, 2)
  })

  it('€60,000 gross', () => {
    const result = calculateSalary(60_000, netherlands)
    // 21 832,22 − 1 178,71 − 4 747,04
    expect(result.incomeTax).toBeCloseTo(15_906.47, 2)
    expect(result.net).toBeCloseTo(44_093.53, 2)
  })

  it('credits do not turn into a payout on a low salary', () => {
    expect(calculateSalary(8_000, netherlands).incomeTax).toBe(0)
  })
})
