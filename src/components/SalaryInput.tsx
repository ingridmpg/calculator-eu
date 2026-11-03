import { useId } from 'react'
import { strings } from '../i18n/index.ts'
import { formatCurrency, formatNumber } from '../lib/format.ts'
import { parseSalary, SLIDER_RANGE } from '../lib/salary.ts'
import styles from './SalaryInput.module.css'

interface SalaryInputProps {
  value: number
  onChange: (value: number) => void
  isHousehold: boolean
}

export function SalaryInput({ value, onChange, isHousehold }: SalaryInputProps) {
  const inputId = useId()
  const hintId = useId()
  const t = strings.salary

  return (
    <div className={styles.root}>
      <label htmlFor={inputId} className={styles.label}>
        {isHousehold ? t.householdLabel : t.label}
      </label>
      {isHousehold && (
        <p id={hintId} className={styles.hint}>
          {t.householdHint}
        </p>
      )}

      <div className={styles.amount}>
        <input
          id={inputId}
          className={styles.input}
          type="text"
          inputMode="numeric"
          aria-describedby={isHousehold ? hintId : undefined}
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
        aria-valuetext={formatCurrency(value)}
        min={SLIDER_RANGE.min}
        max={SLIDER_RANGE.max}
        step={SLIDER_RANGE.step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}
