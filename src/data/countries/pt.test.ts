import { describe, expect, it } from 'vitest'
import { calculateSalary } from '../../lib/calculator.ts'
import { portugal } from './pt.ts'

// Expected values derived by hand from CIRS art. 68 (Lei 73-A/2025) using the
// official "parcela a abater" method; see the validation table in PLAN.md.
describe('Portugal 2026', () => {
  it('€30,000 gross', () => {
    const result = calculateSalary(30_000, portugal)
    expect(result.socialSecurity).toBeCloseTo(3_300, 2)
    // Taxable 25 412,91 × 31,1% − 3 092,76 − 250
    expect(result.incomeTax).toBeCloseTo(4_560.65, 2)
    expect(result.otherTaxes).toBe(0)
    expect(result.net).toBeCloseTo(22_139.35, 2)
  })

  it('€60,000 gross: social security replaces the minimum specific deduction', () => {
    const result = calculateSalary(60_000, portugal)
    expect(result.socialSecurity).toBeCloseTo(6_600, 2)
    // Taxable 53 400 × 44,6% − 8 441,72 − 250
    expect(result.incomeTax).toBeCloseTo(15_124.68, 2)
    expect(result.net).toBeCloseTo(38_275.32, 2)
  })

  it('€100,000 gross pays the solidarity surcharge above €80,000 taxable', () => {
    const result = calculateSalary(100_000, portugal)
    // Taxable 89 000: (89 000 − 80 000) × 2,5%
    expect(result.otherTaxes).toBeCloseTo(225, 2)
    // 89 000 × 48% − 11 387,27 − 250
    expect(result.incomeTax).toBeCloseTo(31_082.73, 2)
  })

  it('minimum wage (€920 × 14) pays no IRS', () => {
    expect(calculateSalary(12_880, portugal).incomeTax).toBe(0)
  })

  it('the minimum-existence abatement phases out just above the minimum wage', () => {
    // Abatement 12 880 − 2,6 × 1 120 − 4 587,09 − 2 000 = 3 380,91 → taxable 6 032
    expect(calculateSalary(14_000, portugal).incomeTax).toBeCloseTo(504, 2)
  })

  it('pays nothing on a zero salary', () => {
    const result = calculateSalary(0, portugal)
    expect(result.net).toBe(0)
    expect(result.effectiveRate).toBe(0)
  })

  // simula.pt uses the same 23.75% on gross (it also adds insurance and meal allowance).
  it('employer pays 23.75% on top of gross, with no ceiling', () => {
    expect(calculateSalary(30_000, portugal).employerCost).toBeCloseTo(37_125, 2)
    expect(calculateSalary(60_000, portugal).employerContributions).toBeCloseTo(14_250, 2)
  })
})

describe('Portugal 2026, couple filing jointly', () => {
  const coupleOneChild = { adults: 2, children: 1 } as const
  const coupleTwoChildren = { adults: 2, children: 2 } as const

  it('€40,000 household, 1 child', () => {
    const result = calculateSalary(40_000, portugal, coupleOneChild)
    // Taxable 40 000 − 2 × 4 587,09 = 30 825,82; scale on half (15 412,91) = 2 308,31 × 2
    // = 4 616,62 − general expenses 2 × 250 − dependent 600
    expect(result.socialSecurity).toBeCloseTo(4_400, 2)
    expect(result.incomeTax).toBeCloseTo(3_516.62, 2)
    expect(result.net).toBeCloseTo(32_083.38, 2)
  })

  it('€60,000 household, 2 children', () => {
    const result = calculateSalary(60_000, portugal, coupleTwoChildren)
    // Taxable 50 825,82; scale on half (25 412,91) = 4 810,65 × 2 − 500 − 1 200
    expect(result.incomeTax).toBeCloseTo(7_921.31, 2)
    expect(result.net).toBeCloseTo(45_478.69, 2)
  })

  it('applies the minimum-existence rule to each earner', () => {
    expect(calculateSalary(20_000, portugal, coupleTwoChildren).incomeTax).toBe(0)
  })

  it('employer cost is the same as for one earner (no ceiling)', () => {
    expect(calculateSalary(40_000, portugal, coupleOneChild).employerCost).toBeCloseTo(49_500, 2)
  })
})
