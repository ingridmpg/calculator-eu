import type { Household } from './types.ts'

export const SINGLE: Household = { adults: 1, children: 0 }

/** The taxpayer profiles the user can pick. */
export const PROFILES = [
  { id: 'single', household: SINGLE },
  { id: 'coupleOneChild', household: { adults: 2, children: 1 } },
  { id: 'coupleTwoChildren', household: { adults: 2, children: 2 } },
] as const satisfies readonly { id: string; household: Household }[]

export type Profile = (typeof PROFILES)[number]
export type ProfileId = Profile['id']
