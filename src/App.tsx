import { useState } from 'react'
import { Assumptions } from './components/Assumptions.tsx'
import { CountryPicker } from './components/CountryPicker.tsx'
import { ResultPanel } from './components/ResultPanel.tsx'
import { SalaryInput } from './components/SalaryInput.tsx'
import { COUNTRIES, getTaxModel, type CountryCode } from './data/countries/index.ts'
import { strings } from './i18n/index.ts'
import { DEFAULT_GROSS } from './lib/salary.ts'
import styles from './App.module.css'

export default function App() {
  const [gross, setGross] = useState(DEFAULT_GROSS)
  const [countryCode, setCountryCode] = useState<CountryCode>('PT')

  const country = COUNTRIES.find(({ code }) => code === countryCode) ?? COUNTRIES[0]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{strings.header.title}</h1>
        <p className={styles.intro}>{strings.header.intro}</p>
      </header>

      <main className={styles.main}>
        <div className={styles.inputs}>
          <SalaryInput value={gross} onChange={setGross} />
          <CountryPicker selected={countryCode} onSelect={setCountryCode} />
        </div>

        <ResultPanel country={country} gross={gross} taxModel={getTaxModel(countryCode)} />
      </main>

      <footer className={styles.footer}>
        <Assumptions />
      </footer>
    </div>
  )
}
