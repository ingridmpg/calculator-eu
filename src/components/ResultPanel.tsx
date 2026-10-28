import type { Country } from '../data/countries/index.ts'
import { strings } from '../i18n/index.ts'
import { calculateSalary } from '../lib/calculator.ts'
import { formatCurrency, formatPercent } from '../lib/format.ts'
import { Breakdown } from './Breakdown.tsx'
import { CountryNotes } from './CountryNotes.tsx'
import styles from './ResultPanel.module.css'

interface ResultPanelProps {
  country: Country
  gross: number
}

export function ResultPanel({ country, gross }: ResultPanelProps) {
  const t = strings.result
  const result = calculateSalary(gross, country.taxModel)

  return (
    <section className={styles.root}>
      <h2 className={styles.country}>
        <span aria-hidden="true">{country.flag}</span> {strings.countries.names[country.code]}
      </h2>

      <div className={styles.headline} aria-live="polite" aria-atomic="true">
        <p className={styles.label}>{t.netAnnual}</p>
        <p className={styles.net}>{formatCurrency(result.net)}</p>
      </div>

      <dl className={styles.stats}>
        <div>
          <dt className={styles.label}>{t.netMonthly}</dt>
          <dd className={styles.statValue}>{formatCurrency(result.netMonthly)}</dd>
        </div>
        <div>
          <dt className={styles.label}>{t.effectiveRate}</dt>
          <dd className={styles.statValue}>{formatPercent(result.effectiveRate)}</dd>
        </div>
      </dl>

      <Breakdown result={result} />

      <p className={styles.notice}>{t.taxYear(country.taxModel.year)}</p>

      <CountryNotes country={country} />
    </section>
  )
}
