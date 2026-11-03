import { describe, expect, it } from 'vitest'
import { calculateSalary } from '../../lib/calculator.ts'
import { COUNTRIES } from './index.ts'

const SALARIES = [0, 12_000, 30_000, 60_000, 100_000, 300_000]

// Every subtotal must be the amount the previous steps lead to, so the trace shown
// to the user adds up line by line.
describe.each(COUNTRIES)('$code calculation trace', ({ taxModel }) => {
  it.each(SALARIES)('adds up at €%i', (gross) => {
    const { trace } = calculateSalary(gross, taxModel)

    for (const { steps } of trace) {
      let running = 0
      for (const { operation, amount } of steps) {
        if (operation === 'subtotal') expect(amount).toBeCloseTo(Math.max(running, 0), 2)
        if (operation === 'add') running += amount
        else if (operation === 'subtract') running -= amount
        else running = amount
      }
    }
  })

  it('has at most one section per deduction', () => {
    const parts = calculateSalary(40_000, taxModel).trace.map(({ part }) => part)
    expect(new Set(parts).size).toBe(parts.length)
  })
})
