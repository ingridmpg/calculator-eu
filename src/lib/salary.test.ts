import { describe, expect, it } from 'vitest'
import { MAX_GROSS, parseSalary } from './salary.ts'

describe('parseSalary', () => {
  it('keeps only digits', () => {
    expect(parseSalary('45 000 €')).toBe(45_000)
    expect(parseSalary('45.000')).toBe(45_000)
  })

  it('returns 0 for empty or non-numeric input', () => {
    expect(parseSalary('')).toBe(0)
    expect(parseSalary('abc')).toBe(0)
  })

  it('caps very large values', () => {
    expect(parseSalary('999999999999')).toBe(MAX_GROSS)
  })
})
