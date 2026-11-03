import { describe, expect, it } from 'vitest'
import { calculateSalary } from './calculator.ts'
import { getVisibleTrace, sectionTotal, step } from './trace.ts'
import type { CountryTaxModel } from './types.ts'

describe('sectionTotal', () => {
  it('replays the steps, restarting at each base and subtotal', () => {
    const total = sectionTotal({
      part: 'incomeTax',
      steps: [
        step.base('gross', 30_000),
        step.subtract('specificDeduction', 3_300),
        step.subtotal('taxableIncome', 26_700),
        step.base('taxFromScale', 5_000),
        step.add('regionalTax', 500),
        step.subtract('generalExpenses', 250),
      ],
    })
    expect(total).toBe(5_250)
  })

  it('never goes below zero', () => {
    const steps = [step.base('taxFromScale', 100), step.subtract('generalCredit', 300)]
    expect(sectionTotal({ part: 'incomeTax', steps })).toBe(0)
  })
})

describe('getVisibleTrace', () => {
  const model: CountryTaxModel = {
    year: 2026,
    sources: [],
    notes: [],
    computeEmployerContributions: () => [],
    computeTaxes: () => [
      {
        part: 'incomeTax',
        steps: [
          step.base('gross', 0),
          step.subtract('specificDeduction', 0),
          step.subtotal('taxableIncome', 0),
        ],
      },
      { part: 'otherTaxes', steps: [step.base('usc', 0)] },
    ],
  }

  it('hides zero additions and deductions, and other taxes when there are none', () => {
    expect(getVisibleTrace(calculateSalary(0, model))).toEqual([
      { part: 'incomeTax', steps: [step.base('gross', 0), step.subtotal('taxableIncome', 0)] },
    ])
  })
})
