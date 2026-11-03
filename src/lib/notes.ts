import type { CountryTaxModel, NoteKind, Source } from './types.ts'

/** A source with its position in the country's source list, starting at 1. */
export interface NumberedSource extends Source {
  number: number
}

export interface NoteGroup {
  kind: NoteKind
  notes: { id: string; sources: NumberedSource[] }[]
}

const KIND_ORDER: readonly NoteKind[] = ['included', 'excluded', 'pending']

export function numberSources(sources: readonly Source[]): NumberedSource[] {
  return sources.map((source, index) => ({ ...source, number: index + 1 }))
}

/** Groups a country's notes by kind, in a fixed order, skipping empty groups. */
export function groupNotes({ notes, sources }: CountryTaxModel): NoteGroup[] {
  const numbered = numberSources(sources)
  const sourceById = new Map(numbered.map((source) => [source.id, source]))

  return KIND_ORDER.map((kind) => ({
    kind,
    notes: notes
      .filter((note) => note.kind === kind)
      .map(({ id, sourceIds }) => ({
        id,
        sources: sourceIds.flatMap((sourceId) => sourceById.get(sourceId) ?? []),
      })),
  })).filter((group) => group.notes.length > 0)
}
