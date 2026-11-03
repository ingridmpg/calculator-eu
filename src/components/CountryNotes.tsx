import { useId } from 'react'
import type { Country } from '../data/countries/index.ts'
import { strings } from '../i18n/index.ts'
import { groupNotes, numberSources, type NumberedSource } from '../lib/notes.ts'
import { Disclosure } from './Disclosure.tsx'
import styles from './CountryNotes.module.css'

interface CountryNotesProps {
  country: Country
}

export function CountryNotes({ country }: CountryNotesProps) {
  const t = strings.notes
  const idPrefix = useId()
  const sourceAnchor = (number: number) => `${idPrefix}source-${number}`
  const texts: Record<string, string> = t.byCountry[country.code]

  return (
    <Disclosure title={t.title}>
      {groupNotes(country.taxModel).map(({ kind, notes }) => (
        <section key={kind} className={styles.group}>
          <h3 className={styles.heading}>{t.kinds[kind]}</h3>
          <ul className={styles.list}>
            {notes.map(({ id, sources }) => (
              <li key={id}>
                {texts[id]}
                {sources.map((source) => (
                  <SourceReference key={source.id} source={source} href={`#${sourceAnchor(source.number)}`} />
                ))}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className={styles.group}>
        <h3 className={styles.heading}>{t.sourcesTitle}</h3>
        <ol className={styles.list}>
          {numberSources(country.taxModel.sources).map(({ id, number, label, url }) => (
            <li key={id} id={sourceAnchor(number)}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {label}
              </a>
            </li>
          ))}
        </ol>
      </section>
    </Disclosure>
  )
}

function SourceReference({ source, href }: { source: NumberedSource; href: string }) {
  return (
    <a
      className={styles.reference}
      href={href}
      aria-label={strings.notes.sourceReference(source.number, source.label)}
    >
      [{source.number}]
    </a>
  )
}
