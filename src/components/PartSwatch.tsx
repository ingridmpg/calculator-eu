import type { SalaryPartKey } from '../lib/breakdown.ts'
import styles from './PartSwatch.module.css'

/** The colour square that ties a line of text to its salary part in the bar. */
export function PartSwatch({ part }: { part: SalaryPartKey }) {
  return <span className={styles.swatch} data-part={part} aria-hidden="true" />
}
