import { useState } from 'react'
import { strings } from '../i18n/index.ts'
import { getSalaryParts, type SalaryPart, type SalaryPartKey } from '../lib/breakdown.ts'
import { formatCurrency, formatPercent } from '../lib/format.ts'
import type { SalaryResult } from '../lib/types.ts'
import { SalarySplitBar } from './SalarySplitBar.tsx'
import styles from './Breakdown.module.css'

interface BreakdownProps {
  result: SalaryResult
}

export function Breakdown({ result }: BreakdownProps) {
  const t = strings.breakdown
  const [highlighted, setHighlighted] = useState<SalaryPartKey | null>(null)

  const parts = getSalaryParts(result)
  const deductions = parts.filter(({ key }) => key !== 'net')
  const net = parts.find(({ key }) => key === 'net')

  return (
    <div className={styles.root}>
      <h3 className={styles.title}>{t.title}</h3>

      <SalarySplitBar parts={parts} highlighted={highlighted} onHighlight={setHighlighted} />

      <dl className={styles.list}>
        <div className={styles.row}>
          <dt className={styles.label}>{t.gross}</dt>
          <dd className={styles.value}>{formatCurrency(result.gross)}</dd>
        </div>
        {deductions.map((part) => (
          <PartRow key={part.key} part={part} highlighted={highlighted} onHighlight={setHighlighted} />
        ))}
        {net && <PartRow part={net} highlighted={highlighted} onHighlight={setHighlighted} />}
      </dl>
    </div>
  )
}

interface PartRowProps {
  part: SalaryPart
  highlighted: SalaryPartKey | null
  onHighlight: (key: SalaryPartKey | null) => void
}

function PartRow({ part, highlighted, onHighlight }: PartRowProps) {
  const { key, amount, share } = part
  const isNet = key === 'net'
  const value = isNet || amount === 0 ? formatCurrency(amount) : `− ${formatCurrency(amount)}`

  return (
    <div
      className={styles.row}
      data-total={isNet}
      data-highlighted={highlighted === key}
      onMouseEnter={() => onHighlight(key)}
      onMouseLeave={() => onHighlight(null)}
    >
      <dt className={styles.label}>
        <span className={styles.swatch} data-part={key} aria-hidden="true" />
        {strings.breakdown[key]}
      </dt>
      <dd className={styles.value}>
        <span className={styles.share}>{formatPercent(share)}</span>
        {value}
      </dd>
    </div>
  )
}
