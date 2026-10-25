import { describe, expect, it } from 'vitest'
import { calculateSalary } from '../../lib/calculator.ts'
import { germany } from './de.ts'

// Expected values derived by hand from § 32a EStG 2026 (annual assessment). Salary
// calculators (monthly Lohnsteuer, class I) land within €10 of these (see PLAN.md).
describe('Germany 2026', () => {
  it('€30,000 gross', () => {
    const result = calculateSalary(30_000, germany)
    expect(result.socialSecurity).toBeCloseTo(6_525, 2)
    // Taxable 22 704 → zone 3
    expect(result.incomeTax).toBe(2_252)
    expect(result.otherTaxes).toBe(0)
    expect(result.net).toBeCloseTo(21_223, 2)
  })

  it('€60,000 gross', () => {
    const result = calculateSalary(60_000, germany)
    expect(result.socialSecurity).toBeCloseTo(13_050, 2)
    // Taxable 46 674 → zone 3
    expect(result.incomeTax).toBe(9_399)
    expect(result.net).toBeCloseTo(37_551, 2)
  })

  it('caps health contributions at the 2026 ceiling', () => {
    const result = calculateSalary(120_000, germany)
    // 101 400 × 10,6% + 69 750 × 11,15%
    expect(result.socialSecurity).toBeCloseTo(18_525.53, 2)
  })

  it('charges the solidarity surcharge only above the exemption', () => {
    expect(calculateSalary(80_000, germany).otherTaxes).toBe(0)
    expect(calculateSalary(150_000, germany).otherTaxes).toBeGreaterThan(0)
  })

  it('pays no income tax below the basic allowance', () => {
    expect(calculateSalary(14_000, germany).incomeTax).toBe(0)
  })
})
