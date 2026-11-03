import { describe, expect, it } from 'vitest'
import { calculateSalary } from '../../lib/calculator.ts'
import { familyQuotientTax, france } from './fr.ts'

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

  // Employer cost matches the Urssaf simulator (mon-entreprise) for a company with 5
  // employees, the administrative work-accident rate and no mutuelle.
  it('employer cost, with the general reduction below 3 minimum wages', () => {
    expect(calculateSalary(30_000, france).employerCost).toBeCloseTo(37_279.8, 2)
    expect(calculateSalary(60_000, france).employerCost).toBeCloseTo(83_680.85, 2)
  })

  it('employer cost without the general reduction, and at its maximum', () => {
    expect(calculateSalary(80_000, france).employerCost).toBeCloseTo(113_304.05, 2)
    expect(calculateSalary(20_000, france).employerCost).toBeCloseTo(20_329.2, 2)
  })

  it('€20,000 gross pays no income tax thanks to the décote', () => {
    expect(calculateSalary(20_000, france).incomeTax).toBe(0)
  })

  it('pays nothing on a zero salary', () => {
    expect(calculateSalary(0, france).net).toBe(0)
  })
})

describe('France 2026, couple filing jointly', () => {
  // Service Public (F2705) examples for a couple with one child (2.5 parts).
  it('applies the quotient familial below the cap', () => {
    expect(familyQuotientTax(63_000, 2, 1)).toEqual({ taxWithChildren: 3_740, quotientCap: 0 })
  })

  it('caps the saving per half part at €1,807', () => {
    const { taxWithChildren, quotientCap } = familyQuotientTax(80_000, 2, 1)
    expect(taxWithChildren).toBeCloseTo(6_759.98, 1)
    expect(taxWithChildren + quotientCap).toBeCloseTo(10_207.98 - 1_807, 1)
  })

  it('€40,000 household, 1 child: the couple décote cancels the tax', () => {
    const result = calculateSalary(40_000, france, { adults: 2, children: 1 })
    // Contributions per earner on €20,000; taxable 29 523,24 / 2,5 parts → 57,56 of tax
    expect(result.socialSecurity).toBeCloseTo(8_336.1, 2)
    expect(result.incomeTax).toBe(0)
  })

  it('€200,000 household, 2 children: the cap applies', () => {
    // Taxable 148 476,75: 30 751,00 with 2 parts − 2 × 1 807 = 27 137,00
    expect(calculateSalary(200_000, france, { adults: 2, children: 2 }).incomeTax).toBeCloseTo(27_137.01, 1)
  })
})
