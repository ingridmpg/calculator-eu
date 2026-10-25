import type { CountryTaxModel } from '../../lib/types.ts'
import { portugal } from './pt.ts'

export const COUNTRIES = [
  { code: 'PT', flag: '🇵🇹' },
  { code: 'ES', flag: '🇪🇸' },
  { code: 'FR', flag: '🇫🇷' },
  { code: 'DE', flag: '🇩🇪' },
  { code: 'NL', flag: '🇳🇱' },
  { code: 'IE', flag: '🇮🇪' },
  { code: 'IT', flag: '🇮🇹' },
  { code: 'BE', flag: '🇧🇪' },
] as const

export type Country = (typeof COUNTRIES)[number]
export type CountryCode = Country['code']

// Countries are added here one at a time as their tax model is validated (Phase 3).
const TAX_MODELS: Partial<Record<CountryCode, CountryTaxModel>> = {
  PT: portugal,
}

export function getTaxModel(code: CountryCode): CountryTaxModel | undefined {
  return TAX_MODELS[code]
}
