const LOCALE = 'pt-PT'

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 })

const percentFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

/** 45000 → "45 000 €" */
export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount)
}

/** 45000 → "45 000" (no currency symbol, for editable inputs) */
export function formatNumber(amount: number): string {
  return numberFormatter.format(amount)
}

/** 0.324 → "32,4%" */
export function formatPercent(fraction: number): string {
  return percentFormatter.format(fraction)
}

const rateFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'percent',
  maximumFractionDigits: 2,
})

/** A legal rate, with only the decimals it has: 0.11 → "11%", 0.0875 → "8,75%" */
export function formatRate(fraction: number): string {
  return rateFormatter.format(fraction)
}
