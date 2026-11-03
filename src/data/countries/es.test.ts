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

  it('employer cost: 32.15% up to the ceiling plus the employer solidarity share', () => {
    // 30,65% contributions + 1,50% work accidents (office reference)
    expect(calculateSalary(30_000, spain).employerCost).toBeCloseTo(39_645, 2)
    expect(calculateSalary(60_000, spain).employerContributions).toBeCloseTo(19_290, 2)
    // 61 214,40 × 32,15% + 6121,44 × 0,96% + 12 664,16 × 1,04%
    expect(calculateSalary(80_000, spain).employerContributions).toBeCloseTo(19_870.9, 2)
  })

  it('minimum wage (€17,094) pays no IRPF', () => {
    expect(calculateSalary(17_094, spain).incomeTax).toBe(0)
  })

  it('pays nothing on a zero salary', () => {
    expect(calculateSalary(0, spain).net).toBe(0)
  })
})

// Couples file two individual returns (cheaper than a joint one with two similar
// salaries), each on half the household salary, with the child minimums split (art. 61).
describe('Spain (Madrid) 2026, couple filing individually', () => {
  it('€40,000 household, 1 child', () => {
    const result = calculateSalary(40_000, spain, { adults: 2, children: 1 })
    // Each: 20 000 − 1 300 − 2 000 − art. 20 reduction 1 194,15 = base 15 505,85;
    // minimums 6 750 (state) and 7 244,58 (Madrid); tax 908,20 + 749,37 − SMI credit 9,69
    expect(result.socialSecurity).toBeCloseTo(2_600, 2)
    expect(result.incomeTax).toBeCloseTo(3_295.76, 2)
    expect(result.net).toBeCloseTo(34_104.24, 2)
  })

  it('€60,000 household, 2 children', () => {
    expect(calculateSalary(60_000, spain, { adults: 2, children: 2 }).incomeTax).toBeCloseTo(8_246.27, 2)
  })

  it('two minimum wages pay no IRPF', () => {
    expect(calculateSalary(2 * 17_094, spain, { adults: 2, children: 2 }).incomeTax).toBe(0)
  })

  it('applies the contribution ceiling to each earner', () => {
    // 70 000 each: 61 214,40 × 6,5% + solidarity 6 121,44 × 0,19% + 2 664,16 × 0,21%, × 2
    const result = calculateSalary(140_000, spain, { adults: 2, children: 1 })
    expect(result.socialSecurity).toBeCloseTo(7_992.32, 2)
  })
})
