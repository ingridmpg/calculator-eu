import { strings } from '../i18n/index.ts'
import type { SalaryPart, SalaryPartKey } from '../lib/breakdown.ts'
import { formatPercent } from '../lib/format.ts'
import styles from './SalarySplitBar.module.css'

/** Below this share the net label would not fit inside its segment. */
const MIN_SHARE_FOR_LABEL = 0.15

interface SalarySplitBarProps {
  parts: readonly SalaryPart[]
  highlighted: SalaryPartKey | null
  onHighlight: (key: SalaryPartKey | null) => void
}

export function SalarySplitBar({ parts, highlighted, onHighlight }: SalarySplitBarProps) {
  const t = strings.breakdown
  const visibleParts = parts.filter(({ share }) => share > 0)
  const description = visibleParts
    .map(({ key, share }) => `${t[key]}: ${formatPercent(share)}`)
    .join(', ')

  return (
    <div className={styles.bar} role="img" aria-label={description}>
      {visibleParts.map(({ key, share }) => (
        <div
          key={key}
          className={styles.segment}
          data-part={key}
          data-dimmed={highlighted !== null && highlighted !== key}
          style={{ flexGrow: share }}
          onMouseEnter={() => onHighlight(key)}
          onMouseLeave={() => onHighlight(null)}
        >
          {key === 'net' && share >= MIN_SHARE_FOR_LABEL && (
            <span className={styles.label}>{formatPercent(share)}</span>
          )}
        </div>
      ))}
    </div>
  )
}
