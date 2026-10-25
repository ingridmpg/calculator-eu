import type { SalaryResult } from './types.ts'

export type SalaryPartKey = 'net' | 'incomeTax' | 'socialSecurity' | 'otherTaxes'

export interface SalaryPart {
  key: SalaryPartKey
  amount: number
  /** Fraction of the gross salary (0.25 = 25%). */
  share: number
}

/** Net first: it is the part the reader came for. */
const PART_ORDER: readonly SalaryPartKey[] = ['net', 'incomeTax', 'socialSecurity', 'otherTaxes']

/**
 * Splits the gross salary into net pay and deductions. "Other taxes" only exist in
 * some countries, so that part is left out when it is zero.
 */
export function getSalaryParts(result: SalaryResult): SalaryPart[] {
  return PART_ORDER.filter((key) => key !== 'otherTaxes' || result.otherTaxes > 0).map((key) => ({
    key,
    amount: result[key],
    share: result.gross > 0 ? result[key] / result.gross : 0,
  }))
}
