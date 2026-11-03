import type { SalaryResult, TaxSection, TraceOperation, TraceStep, TraceStepKey } from './types.ts'

function makeStep(operation: TraceOperation) {
  return (key: TraceStepKey, amount: number, rate?: number): TraceStep =>
    rate === undefined ? { key, operation, amount } : { key, operation, amount, rate }
}

/** Builders for calculation steps, e.g. `step.subtract('specificDeduction', 4_587.09)`. */
export const step = {
  base: makeStep('base'),
  add: makeStep('add'),
  subtract: makeStep('subtract'),
  subtotal: makeStep('subtotal'),
}

/** Replays the steps; tax and contributions never go below zero. */
export function sectionTotal(section: TaxSection): number {
  const total = section.steps.reduce((running, { operation, amount }) => {
    if (operation === 'add') return running + amount
    if (operation === 'subtract') return running - amount
    return amount
  }, 0)
  return Math.max(total, 0)
}

/**
 * The sections and steps worth showing: "other taxes" only when there are any (as in
 * the breakdown), and no additions or deductions of zero.
 */
export function getVisibleTrace(result: SalaryResult): TaxSection[] {
  return result.trace
    .filter(({ part }) => part !== 'otherTaxes' || result.otherTaxes > 0)
    .map((section) => ({
      ...section,
      steps: section.steps.filter(
        ({ operation, amount }) => amount !== 0 || operation === 'base' || operation === 'subtotal',
      ),
    }))
}
