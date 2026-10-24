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
