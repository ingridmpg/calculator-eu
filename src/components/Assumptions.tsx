import { strings } from '../i18n/index.ts'
import styles from './Assumptions.module.css'

export function Assumptions() {
  const t = strings.assumptions

  return (
    <aside className={styles.root}>
      <h2 className={styles.title}>{t.title}</h2>
      <ul className={styles.list}>
        {t.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </aside>
  )
}
