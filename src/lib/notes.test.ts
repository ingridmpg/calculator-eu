import { describe, expect, it } from 'vitest'
import { groupNotes } from './notes.ts'
import type { CountryTaxModel } from './types.ts'

const model: CountryTaxModel = {
  year: 2026,
  sources: [
    { id: 'a', label: 'Source A', url: 'https://example.com/a' },
    { id: 'b', label: 'Source B', url: 'https://example.com/b' },
  ],
  notes: [
    { id: 'excludedNote', kind: 'excluded', sourceIds: [] },
    { id: 'includedNote', kind: 'included', sourceIds: ['b'] },
  ],
  computeTaxes: () => [],
  computeEmployerContributions: () => [],
}

describe('groupNotes', () => {
  it('groups notes by kind in a fixed order and numbers their sources', () => {
    expect(groupNotes(model)).toEqual([
      {
        kind: 'included',
        notes: [
          { id: 'includedNote', sources: [{ id: 'b', label: 'Source B', url: 'https://example.com/b', number: 2 }] },
        ],
      },
      { kind: 'excluded', notes: [{ id: 'excludedNote', sources: [] }] },
    ])
  })
})
