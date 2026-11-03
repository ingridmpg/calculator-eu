import { describe, expect, it } from 'vitest'
import { strings } from '../../i18n/index.ts'
import { COUNTRIES } from './index.ts'

describe.each(COUNTRIES)('$code notes and sources', ({ code, taxModel }) => {
  const sourceIds = taxModel.sources.map(({ id }) => id)

  it('has unique source ids', () => {
    expect(new Set(sourceIds).size).toBe(sourceIds.length)
  })

  it('has a text for every note, and a note for every text', () => {
    const noteIds = taxModel.notes.map(({ id }) => id)
    expect(Object.keys(strings.notes.byCountry[code]).sort()).toEqual([...noteIds].sort())
  })

  it('cites only sources the country lists', () => {
    for (const note of taxModel.notes) {
      for (const sourceId of note.sourceIds) expect(sourceIds).toContain(sourceId)
    }
  })
})
