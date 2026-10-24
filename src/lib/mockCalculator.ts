import type { SalaryResult } from './types.ts'

// Phase 1 placeholder: fixed, made-up shares so the layout can be built.
// These are NOT real tax rules; the real engine replaces this in Phase 2.
const MOCK_SHARES = { incomeTax: 0.2, socialSecurity: 0.11, otherTaxes: 0.02 }

export function calculateMockSalary(gross: number): SalaryResult {
  const incomeTax = gross * MOCK_SHARES.incomeTax
  const socialSecurity = gross * MOCK_SHARES.socialSecurity
  const otherTaxes = gross * MOCK_SHARES.otherTaxes
  const net = gross - incomeTax - socialSecurity - otherTaxes

  return {
    gross,
    incomeTax,
    socialSecurity,
    otherTaxes,
    net,
    netMonthly: net / 12,
    effectiveRate: gross > 0 ? 1 - net / gross : 0,
  }
}
