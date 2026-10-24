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
  // "Other taxes" only exists in some countries, so it is hidden when empty.
  const deductions = DEDUCTIONS.filter((key) => key !== 'otherTaxes' || result.otherTaxes > 0)

  return (
    <div className={styles.root}>
      <h3 className={styles.title}>{t.title}</h3>

      <dl className={styles.list}>
        <Row label={t.gross} value={formatCurrency(result.gross)} />
        {deductions.map((key) => (
          <Row
            key={key}
            label={t[key]}
            value={formatDeduction(result[key])}
            swatchClass={styles[key]}
          />
        ))}
        <Row label={t.net} value={formatCurrency(result.net)} swatchClass={styles.net} isTotal />
      </dl>
    </div>
  )
}

function formatDeduction(amount: number): string {
  return amount > 0 ? `− ${formatCurrency(amount)}` : formatCurrency(0)
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
