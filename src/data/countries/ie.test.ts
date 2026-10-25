import { describe, expect, it } from 'vitest'
import { calculateSalary } from '../../lib/calculator.ts'
import { ireland } from './ie.ts'

// Expected values match irishcalculators.ie to the cent (see PLAN.md).
describe('Ireland 2026', () => {
  it('€30,000 gross', () => {
    const result = calculateSalary(30_000, ireland)
    expect(result.incomeTax).toBeCloseTo(2_000, 2)
    expect(result.otherTaxes).toBeCloseTo(432.82, 2)
    expect(result.socialSecurity).toBeCloseTo(1_271.25, 2)
    expect(result.net).toBeCloseTo(26_295.93, 2)
  })

  it('€60,000 gross', () => {
    const result = calculateSalary(60_000, ireland)
    expect(result.incomeTax).toBeCloseTo(11_200, 2)
    expect(result.otherTaxes).toBeCloseTo(1_332.82, 2)
    expect(result.socialSecurity).toBeCloseTo(2_542.5, 2)
    expect(result.net).toBeCloseTo(44_924.68, 2)
  })

  it('applies the PRSI credit between €352 and €424 a week', () => {
    // BrightPay example: €377 a week at 4.2% → €15.83 − credit €7.83 ≈ €8.00
    const weeklyPay = 377
    const prsi = calculateSalary(weeklyPay * 52, ireland).socialSecurity
    const expected = 52 * (0.75 * (weeklyPay * 0.042) + 0.25 * (weeklyPay * 0.0435) - (12 - 24.99 / 6))
    expect(prsi).toBeCloseTo(expected, 2)
  })

  it('charges no USC or PRSI on €13,000 or less', () => {
    const result = calculateSalary(13_000, ireland)
    expect(result.otherTaxes).toBe(0)
    expect(result.socialSecurity).toBe(0)
  })
})
