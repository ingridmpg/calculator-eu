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

  // administratiex.nl: €468.30 a month on €3,000 without Whk (15.61%); plus Whk 1.52%.
  it('employer cost: 17.13% up to the maximum premium wage', () => {
    expect(calculateSalary(36_000, netherlands).employerContributions).toBeCloseTo(6_166.8, 2)
    expect(calculateSalary(60_000, netherlands).employerCost).toBeCloseTo(70_278, 2)
    // 79 409 × 17,13%
    expect(calculateSalary(100_000, netherlands).employerContributions).toBeCloseTo(13_602.76, 2)
  })

  it('credits do not turn into a payout on a low salary', () => {
    expect(calculateSalary(8_000, netherlands).incomeTax).toBe(0)
  })
})

// No joint taxation: each spouse is taxed on half the household salary.
describe('Netherlands 2026, married couple', () => {
  it('€60,000 household is two €30,000 earners (children do not change the tax)', () => {
    const result = calculateSalary(60_000, netherlands, { adults: 2, children: 1 })
    expect(result.net).toBeCloseTo(2 * 27_754.13, 2)
    expect(calculateSalary(60_000, netherlands, { adults: 2, children: 2 }).net).toBe(result.net)
  })

  it('applies the employer premium ceiling to each earner', () => {
    // Each earner (100 000) is above the ceiling: 2 × 79 409 × 17,13%
    expect(calculateSalary(200_000, netherlands, { adults: 2, children: 1 }).employerContributions).toBeCloseTo(27_205.52, 2)
  })
})
