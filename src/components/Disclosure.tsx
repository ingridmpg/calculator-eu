import type { ReactNode } from 'react'
import styles from './Disclosure.module.css'

interface DisclosureProps {
  title: string
  children: ReactNode
}

/** A collapsible section for secondary detail, closed by default. */
export function Disclosure({ title, children }: DisclosureProps) {
  return (
    <details className={styles.root}>
      <summary className={styles.summary}>{title}</summary>
      <div className={styles.content}>{children}</div>
    </details>
  )
}
