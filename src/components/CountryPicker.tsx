import { COUNTRIES, type CountryCode } from '../data/countries/index.ts'
import { strings } from '../i18n/index.ts'
import styles from './CountryPicker.module.css'

interface CountryPickerProps {
  selected: CountryCode
  onSelect: (code: CountryCode) => void
}

export function CountryPicker({ selected, onSelect }: CountryPickerProps) {
  const t = strings.countries

  return (
    <fieldset className={styles.root}>
      <legend className={styles.legend}>{t.legend}</legend>

      <div className={styles.grid}>
        {COUNTRIES.map(({ code, flag }) => (
          <label key={code} className={styles.option}>
            <input
              className={styles.radio}
              type="radio"
              name="country"
              value={code}
              checked={code === selected}
              onChange={() => onSelect(code)}
            />
            <span className={styles.flag} aria-hidden="true">
              {flag}
            </span>
            <span>{t.names[code]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
