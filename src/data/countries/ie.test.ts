import { describe, expect, it } from 'vitest'
import { calculateSalary } from '../../lib/calculator.ts'
import { progressiveTax } from '../../lib/tax.ts'
import { incomeTaxBrackets, ireland } from './ie.ts'

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

  it('employer PRSI on all pay, at the standard rate above €552 a week', () => {
    // 30 000 × (9/12 × 11,25% + 3/12 × 11,40%); Saffery: 40 000 × 11,25% = 4500 before October
    expect(calculateSalary(30_000, ireland).employerContributions).toBeCloseTo(3_386.25, 2)
    expect(calculateSalary(60_000, ireland).employerCost).toBeCloseTo(66_772.5, 2)
  })

  it('employer PRSI at the reduced rate up to €552 a week', () => {
    // 25 000 / 52 = 480,77 a week: 25 000 × (9/12 × 9% + 3/12 × 9,15%)
    expect(calculateSalary(25_000, ireland).employerContributions).toBeCloseTo(2_259.375, 2)
  })

  it('charges no USC or PRSI on €13,000 or less', () => {
    const result = calculateSalary(13_000, ireland)
    expect(result.otherTaxes).toBe(0)
    expect(result.socialSecurity).toBe(0)
  })
})

// Joint assessment for income tax; PRSI and USC per earner on half the salary.
describe('Ireland 2026, married couple', () => {
  it('matches the Revenue joint assessment example (€55,000 + €20,800)', () => {
    // Band €53,000 + €20,800; credits €4,000 + 2 × €2,000
    const tax = progressiveTax(75_800, incomeTaxBrackets(20_800, 2)) - 8_000
    expect(tax).toBeCloseTo(7_560, 2)
  })

  it('€60,000 household: all within the €83,000 band; PRSI and USC as two €30,000 earners', () => {
    const result = calculateSalary(60_000, ireland, { adults: 2, children: 1 })
    expect(result.incomeTax).toBeCloseTo(4_000, 2)
    expect(result.socialSecurity + result.otherTaxes).toBeCloseTo(2 * (30_000 - 2_000 - 26_295.93), 2)
  })

  it('€120,000 household: the band increase is capped at €35,000', () => {
    // 88 000 × 20% + 32 000 × 40% − 8 000
    expect(calculateSalary(120_000, ireland, { adults: 2, children: 2 }).incomeTax).toBeCloseTo(22_400, 2)
  })
})
