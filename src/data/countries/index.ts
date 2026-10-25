import { germany } from './de.ts'
import { spain } from './es.ts'
import { france } from './fr.ts'
import { ireland } from './ie.ts'
import { italy } from './it.ts'
import { netherlands } from './nl.ts'
import { portugal } from './pt.ts'

export const COUNTRIES = [
  { code: 'PT', flag: '🇵🇹', taxModel: portugal },
  { code: 'ES', flag: '🇪🇸', taxModel: spain },
  { code: 'FR', flag: '🇫🇷', taxModel: france },
  { code: 'DE', flag: '🇩🇪', taxModel: germany },
  { code: 'NL', flag: '🇳🇱', taxModel: netherlands },
  { code: 'IE', flag: '🇮🇪', taxModel: ireland },
  { code: 'IT', flag: '🇮🇹', taxModel: italy },
] as const

export type Country = (typeof COUNTRIES)[number]
export type CountryCode = Country['code']
