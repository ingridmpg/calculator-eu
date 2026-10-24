import { strings } from '../i18n/index.ts'
import { formatCurrency } from '../lib/format.ts'
import type { SalaryResult } from '../lib/types.ts'
import styles from './Breakdown.module.css'

type BreakdownKey = 'incomeTax' | 'socialSecurity' | 'otherTaxes'

const DEDUCTIONS: readonly BreakdownKey[] = ['incomeTax', 'socialSecurity', 'otherTaxes']

interface BreakdownProps {
  result: SalaryResult
}

export function Breakdown({ result }: BreakdownProps) {
  const t = strings.breakdown

  return (
    <div className={styles.root}>
      <h3 className={styles.title}>{t.title}</h3>

      <dl className={styles.list}>
        <Row label={t.gross} value={formatCurrency(result.gross)} />
        {DEDUCTIONS.map((key) => (
          <Row
            key={key}
            label={t[key]}
            value={`− ${formatCurrency(result[key])}`}
            swatchClass={styles[key]}
          />
        ))}
        <Row label={t.net} value={formatCurrency(result.net)} swatchClass={styles.net} isTotal />
      </dl>
    </div>
  )
}

interface RowProps {
  label: string
  value: string
  swatchClass?: string
  isTotal?: boolean
}

function Row({ label, value, swatchClass, isTotal = false }: RowProps) {
  return (
    <div className={isTotal ? `${styles.row} ${styles.total}` : styles.row}>
      <dt className={styles.label}>
        {swatchClass && <span className={`${styles.swatch} ${swatchClass}`} aria-hidden="true" />}
        {label}
      </dt>
      <dd className={styles.value}>{value}</dd>
    </div>
  )
}
