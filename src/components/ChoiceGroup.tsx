import styles from './ChoiceGroup.module.css'

export interface Choice<T extends string> {
  value: T
  label: string
  icon?: string
}

interface ChoiceGroupProps<T extends string> {
  legend: string
  name: string
  choices: readonly Choice<T>[]
  selected: T
  onSelect: (value: T) => void
}

/** A set of radio buttons shown as cards. */
export function ChoiceGroup<T extends string>({
  legend,
  name,
  choices,
  selected,
  onSelect,
}: ChoiceGroupProps<T>) {
  return (
    <fieldset className={styles.root}>
      <legend className={styles.legend}>{legend}</legend>

      <div className={styles.grid}>
        {choices.map(({ value, label, icon }) => (
          <label key={value} className={styles.option}>
            <input
              className={styles.radio}
              type="radio"
              name={name}
              value={value}
              checked={value === selected}
              onChange={() => onSelect(value)}
            />
            {icon && (
              <span className={styles.flag} aria-hidden="true">
                {icon}
              </span>
            )}
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
