/** Annual amounts in EUR. `effectiveRate` is a fraction (0.3 = 30%). */
export interface SalaryResult {
  gross: number
  incomeTax: number
  socialSecurity: number
  otherTaxes: number
  net: number
  netMonthly: number
  effectiveRate: number
}
