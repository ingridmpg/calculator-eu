import { strings } from '../i18n/index.ts'
import { PROFILES, type ProfileId } from '../lib/profiles.ts'
import { ChoiceGroup } from './ChoiceGroup.tsx'

interface ProfilePickerProps {
  selected: ProfileId
  onSelect: (id: ProfileId) => void
}

export function ProfilePicker({ selected, onSelect }: ProfilePickerProps) {
  const t = strings.profiles
  const choices = PROFILES.map(({ id }) => ({ value: id, label: t.names[id] }))

  return (
    <ChoiceGroup legend={t.legend} name="profile" choices={choices} selected={selected} onSelect={onSelect} />
  )
}
