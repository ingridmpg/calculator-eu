import { useId } from 'react'
import { strings } from '../i18n/index.ts'
import { formatNumber } from '../lib/format.ts'
import { parseSalary, SLIDER_RANGE } from '../lib/salary.ts'
import styles from './SalaryInput.module.css'

interface SalaryInputProps {
  value: number
  onChange: (value: number) => void
}

export function SalaryInput({ value, onChange }: SalaryInputProps) {
  const inputId = useId()
  const t = strings.salary

  return (
    <div className={styles.root}>
      <label htmlFor={inputId} className={styles.label}>
        {t.label}
      </label>

      <div className={styles.amount}>
        <input
          id={inputId}
          className={styles.input}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={value > 0 ? formatNumber(value) : ''}
          placeholder="0"
          onChange={(event) => onChange(parseSalary(event.target.value))}
        />
        <span className={styles.currency} aria-hidden="true">
          {t.currencySymbol}
        </span>
      </div>

      <input
        className={styles.slider}
        type="range"
        aria-label={t.sliderLabel}
        min={SLIDER_RANGE.min}
        max={SLIDER_RANGE.max}
        step={SLIDER_RANGE.step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}
