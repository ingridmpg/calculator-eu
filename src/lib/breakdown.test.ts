import { describe, expect, it } from 'vitest'
import { getSalaryParts } from './breakdown.ts'
import type { SalaryResult } from './types.ts'

const result: SalaryResult = {
  gross: 40_000,
  incomeTax: 8_000,
  socialSecurity: 4_000,
  otherTaxes: 0,
  net: 28_000,
  netMonthly: 28_000 / 12,
  effectiveRate: 0.3,
}

describe('getSalaryParts', () => {
  it('lists net first, then the deductions, with their share of gross', () => {
    expect(getSalaryParts(result)).toEqual([
      { key: 'net', amount: 28_000, share: 0.7 },
      { key: 'incomeTax', amount: 8_000, share: 0.2 },
      { key: 'socialSecurity', amount: 4_000, share: 0.1 },
    ])
  })

  it('includes other taxes only when there are any', () => {
    const keys = getSalaryParts({ ...result, otherTaxes: 400, net: 27_600 }).map(({ key }) => key)
    expect(keys).toContain('otherTaxes')
  })

  it('returns zero shares for a zero salary', () => {
    const zero = { ...result, gross: 0, incomeTax: 0, socialSecurity: 0, net: 0 }
    expect(getSalaryParts(zero).every(({ share }) => share === 0)).toBe(true)
  })
})
