/** Annual amounts in EUR. `effectiveRate` is a fraction (0.3 = 30%). */
export interface SalaryResult {
  gross: number
  incomeTax: number
  socialSecurity: number
  otherTaxes: number
  net: number
  netMonthly: number
  effectiveRate: number
  /** How each deduction was calculated, as returned by the country's tax model. */
  trace: readonly TaxSection[]
}

/** The employee deductions a salary is split into. */
export type TaxPartKey = 'incomeTax' | 'socialSecurity' | 'otherTaxes'

/** One band of a progressive scale: `rate` applies to income up to `upTo`. */
export interface TaxBracket {
  upTo: number
  rate: number
}

/** The concepts a calculation step can name. Their labels live in `src/i18n/`. */
export type TraceStepKey =
  // Bases and subtotals
  | 'gross'
  | 'netTaxableSalary'
  | 'taxableIncome'
  // Deductions from income
  | 'deductibleContributions'
  | 'specificDeduction'
  | 'minimumExistence'
  | 'otherExpenses'
  | 'lowIncomeReduction'
  | 'expensesAllowance'
  | 'employeeAllowance'
  | 'specialExpensesAllowance'
  // Tax and tax credits
  | 'taxFromScale'
  | 'stateTax'
  | 'regionalTax'
  | 'generalExpenses'
  | 'minimumWageCredit'
  | 'decote'
  | 'uncollectedTax'
  | 'generalCredit'
  | 'labourCredit'
  | 'personalCredits'
  | 'employmentCredit'
  | 'wedgeCredit'
  // Social security contributions
  | 'employeeContribution'
  | 'solidarityContribution'
  | 'pensionContributions'
  | 'deductibleCsg'
  | 'nonDeductibleCsgCrds'
  | 'pensionInsurance'
  | 'unemploymentInsurance'
  | 'healthInsurance'
  | 'longTermCareInsurance'
  | 'prsi'
  | 'inps'
  // Other taxes
  | 'additionalSolidarityRate'
  | 'solidaritySurcharge'
  | 'highIncomeContribution'
  | 'usc'
  | 'regionalSurcharge'
  | 'municipalSurcharge'

/**
 * How a step combines with the running amount: `base` starts from a new amount,
 * `add` and `subtract` change it, and `subtotal` states the amount reached so far.
 */
export type TraceOperation = 'base' | 'add' | 'subtract' | 'subtotal'

export interface TraceStep {
  key: TraceStepKey
  operation: TraceOperation
  amount: number
  /** The rate behind the amount, when a single rate explains it. */
  rate?: number
}

/** The steps that lead to one deduction. Its total is the running amount, never below zero. */
export interface TaxSection {
  part: TaxPartKey
  steps: readonly TraceStep[]
}

export interface Source {
  label: string
  url: string
}

export interface CountryTaxModel {
  year: number
  sources: readonly Source[]
  computeTaxes: (gross: number) => TaxSection[]
}
