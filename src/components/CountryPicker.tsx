import { COUNTRIES, type CountryCode } from '../data/countries/index.ts'
import { strings } from '../i18n/index.ts'
import { ChoiceGroup } from './ChoiceGroup.tsx'

interface CountryPickerProps {
  selected: CountryCode
  onSelect: (code: CountryCode) => void
}

export function CountryPicker({ selected, onSelect }: CountryPickerProps) {
  const t = strings.countries
  const choices = COUNTRIES.map(({ code, flag }) => ({ value: code, label: t.names[code], icon: flag }))

  return (
    <ChoiceGroup legend={t.legend} name="country" choices={choices} selected={selected} onSelect={onSelect} />
  )
}
