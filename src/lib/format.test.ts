import { describe, expect, it } from 'vitest'
import { formatCurrency, formatNumber, formatPercent } from './format.ts'

// pt-PT uses a no-break space as the thousands separator; normalise it for readable assertions.
const normaliseSpaces = (text: string) => text.replace(/\s/g, ' ')

describe('format', () => {
  it('formats euros in pt-PT without decimals', () => {
    expect(normaliseSpaces(formatCurrency(45_000))).toBe('45 000 €')
    expect(normaliseSpaces(formatCurrency(2_916.67))).toBe('2917 €')
  })

  it('formats plain numbers with grouping', () => {
    expect(normaliseSpaces(formatNumber(123_456))).toBe('123 456')
  })

  it('formats fractions as percentages with one decimal', () => {
    expect(formatPercent(0.324)).toBe('32,4%')
    expect(formatPercent(0)).toBe('0,0%')
  })
})
