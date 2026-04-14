import {
  parseGeneratorListString,
  parsePresentationString,
  parseRelationListString,
} from '@/groups/parser'

export type Relation = string | [string, string]

export interface PresentOpts {
  generators: string[]
  relations: Relation[]
}

const inverse = (w: string) =>
  w
    .split('')
    .reverse()
    .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
    .join('')

export class PresentationGroup {
  readonly generators: string[]
  readonly relations: Array<[string, string]>

  constructor(opts: PresentOpts) {
    this.generators = opts.generators
    this.relations = opts.relations.map((r) =>
      typeof r === 'string'
        ? [r, '']
        : Array.isArray(r) && r.length === 2
          ? r
          : (() => {
              throw new Error('Bad relation')
            })(),
    )
  }

  static fromFields(generatorInput: string, relationInput: string): PresentationGroup {
    return new PresentationGroup({
      generators: parseGeneratorListString(generatorInput),
      relations: parseRelationListString(relationInput),
    })
  }

  static fromString(input: string): PresentationGroup {
    const parsed = parsePresentationString(input)
    return new PresentationGroup({
      generators: parsed.generators,
      relations: parsed.relators,
    })
  }

  get relators(): string[] {
    return this.relations.map(([r1, r2]) => r1 + inverse(r2))
  }
}
