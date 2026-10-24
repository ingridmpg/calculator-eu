import type { Country } from '../data/countries/index.ts'
import { strings } from '../i18n/index.ts'
import { formatCurrency, formatPercent } from '../lib/format.ts'
import type { SalaryResult } from '../lib/types.ts'
import { Breakdown } from './Breakdown.tsx'
import styles from './ResultPanel.module.css'

interface ResultPanelProps {
  country: Country
  result: SalaryResult
}

export function ResultPanel({ country, result }: ResultPanelProps) {
  const t = strings.result

  return (
    <section className={styles.root}>
      <h2 className={styles.country}>
        <span aria-hidden="true">{country.flag}</span> {strings.countries.names[country.code]}
      </h2>

      <div className={styles.headline} aria-live="polite">
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

      <p className={styles.notice}>{t.mockNotice}</p>
    </section>
  )
}
