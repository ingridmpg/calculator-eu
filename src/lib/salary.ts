export const DEFAULT_GROSS = 40_000
export const MAX_GROSS = 10_000_000

export const SLIDER_RANGE = { min: 10_000, max: 200_000, step: 1_000 }

/** Reads a typed salary, ignoring anything that is not a digit. "45 000 €" → 45000 */
export function parseSalary(text: string): number {
  const digits = text.replace(/\D/g, '')
  return Math.min(Number(digits), MAX_GROSS)
}
