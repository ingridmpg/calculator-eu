import { describe, expect, it } from 'vitest'
import { calculateSalary } from '../../lib/calculator.ts'
import { italy } from './it.ts'

// Expected values derived by hand and matching stipendee.it (€30k) and calcolonetto.it
// (€60k) for Milan (see PLAN.md).
describe('Italy (Milan) 2026', () => {
  it('€30,000 gross', () => {
    const result = calculateSalary(30_000, italy)
    expect(result.socialSecurity).toBeCloseTo(2_757, 2)
    // 6 265,89 − employment credit 2 044,29 − wedge credit 1 000
    expect(result.incomeTax).toBeCloseTo(3_221.6, 1)
    // Lombardia 377,94 + Milan 217,94
    expect(result.otherTaxes).toBeCloseTo(595.88, 1)
    expect(result.net).toBeCloseTo(23_425.52, 1)
  })

  it('€60,000 gross: extra 1% INPS above €56,224', () => {
    const result = calculateSalary(60_000, italy)
    expect(result.socialSecurity).toBeCloseTo(5_551.76, 2)
    expect(result.incomeTax).toBeCloseTo(15_612.74, 1)
    expect(result.otherTaxes).toBeCloseTo(1_280.84, 1)
    expect(result.net).toBeCloseTo(37_554.66, 1)
  })

  // Numica (CCNL Commercio, €30,000): INPS €8,694 + TFR €2,072.22, without INAIL and funds.
  it('employer cost: INPS 28.98% plus TFR', () => {
    expect(calculateSalary(30_000, italy).employerCost).toBeCloseTo(40_766.22, 2)
    expect(calculateSalary(60_000, italy).employerContributions).toBeCloseTo(21_532.44, 2)
  })

  it('stops the employer pension share at the INPS ceiling', () => {
    // 122 295 × 23,81% + 150 000 × 5,17% + TFR 150 000 × 6,91% (1/13,5 − 0,5%)
    expect(calculateSalary(150_000, italy).employerContributions).toBeCloseTo(47_234.55, 2)
  })

  it('skips the Milan surcharge up to €23,000 taxable income', () => {
    const result = calculateSalary(25_000, italy)
    // Taxable 22 702,50: only the Lombardia surcharge applies
    expect(result.otherTaxes).toBeCloseTo(184.5 + 7_702.5 * 0.0158, 2)
  })
})
