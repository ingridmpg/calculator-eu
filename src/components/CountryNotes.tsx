import type { Country } from '../data/countries/index.ts'
import { strings } from '../i18n/index.ts'
import styles from './CountryNotes.module.css'

interface CountryNotesProps {
  country: Country
}

export function CountryNotes({ country }: CountryNotesProps) {
  const t = strings.notes

  return (
    <details className={styles.root}>
      <summary className={styles.summary}>{t.title}</summary>

      <div className={styles.content}>
        <ul className={styles.list}>
          {t.byCountry[country.code].map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>

        <h3 className={styles.sourcesTitle}>{t.sourcesTitle}</h3>
        <ul className={styles.list}>
          {country.taxModel.sources.map(({ label, url }) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </details>
  )
}
