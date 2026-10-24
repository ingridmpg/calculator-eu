import { describe, expect, it } from 'vitest'
import { progressiveTax } from './tax.ts'

const BRACKETS = [
  { upTo: 10_000, rate: 0.1 },
  { upTo: 20_000, rate: 0.2 },
  { upTo: Infinity, rate: 0.3 },
]

describe('progressiveTax', () => {
  it('returns 0 for no income', () => {
    expect(progressiveTax(0, BRACKETS)).toBe(0)
    expect(progressiveTax(-500, BRACKETS)).toBe(0)
  })

  it('taxes income inside the first bracket at its rate', () => {
    expect(progressiveTax(5_000, BRACKETS)).toBeCloseTo(500)
  })

  it('taxes each slice at its own rate', () => {
    // 10 000 × 10% + 10 000 × 20% + 5 000 × 30%
    expect(progressiveTax(25_000, BRACKETS)).toBeCloseTo(4_500)
  })

  it('handles income exactly on a bracket limit', () => {
    expect(progressiveTax(20_000, BRACKETS)).toBeCloseTo(3_000)
  })
})
