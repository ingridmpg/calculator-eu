import type { TaxBracket } from './types.ts'

/**
 * Tax on `income` under a progressive scale: each bracket's rate applies only
 * to the slice of income inside that bracket. Brackets must be sorted by `upTo`,
 * and the last one should use `Infinity`.
 */
export function progressiveTax(income: number, brackets: readonly TaxBracket[]): number {
  let tax = 0
  let lowerLimit = 0

  for (const { upTo, rate } of brackets) {
    if (income <= lowerLimit) break
    tax += (Math.min(income, upTo) - lowerLimit) * rate
    lowerLimit = upTo
  }

  return tax
}
