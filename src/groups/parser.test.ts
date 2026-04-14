import { describe, expect, it } from 'vitest'

import {
  invertWord,
  parseGeneratorListString,
  parsePresentationString,
  parseRelationListString,
} from '@/groups/parser'

describe('parser', () => {
  it('parses generator lists', () => {
    expect(parseGeneratorListString('a, b, c')).toEqual(['a', 'b', 'c'])
  })

  it('parses simple relation lists into relators', () => {
    expect(parseRelationListString('a^2, b^3, (ab)^4')).toEqual(['aa', 'bbb', 'abababab'])
  })

  it('parses commutators', () => {
    expect(parseRelationListString('[a,b]')).toEqual(['abAB'])
  })

  it('parses chained equalities', () => {
    expect(parseRelationListString('a^2 = b^2 = 1')).toEqual(['aaBB', 'bb'])
  })

  it('parses full presentations', () => {
    expect(parsePresentationString('<a, b | a^2, b^3, (ab)^5>')).toEqual({
      generators: ['a', 'b'],
      relators: ['aa', 'bbb', 'ababababab'],
    })
  })

  it('handles negative powers', () => {
    expect(parseRelationListString('b^-2')).toEqual(['BB'])
  })

  it('inverts words by reversing and swapping case', () => {
    expect(invertWord('abC')).toBe('cBA')
  })
})
