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

/** Annual employee deductions in EUR, as computed by a country's tax model. */
export type TaxComponents = Pick<SalaryResult, 'incomeTax' | 'socialSecurity' | 'otherTaxes'>

/** One band of a progressive scale: `rate` applies to income up to `upTo`. */
export interface TaxBracket {
  upTo: number
  rate: number
}

export interface Source {
  label: string
  url: string
}

export interface CountryTaxModel {
  year: number
  sources: readonly Source[]
  computeTaxes: (gross: number) => TaxComponents
}
