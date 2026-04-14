import type { Relation } from '@/groups/presentation'

export interface GroupTestCase {
  name: string
  generators: string[]
  relations: Relation[]
  expectedOrder: number
}

export const groupTestCases: GroupTestCase[] = [
  {
    name: 'trivial group',
    generators: ['a'],
    relations: ['a'],
    expectedOrder: 1,
  },
  {
    name: 'cyclic group C2',
    generators: ['a'],
    relations: ['aa'],
    expectedOrder: 2,
  },
  {
    name: 'cyclic group C3',
    generators: ['a'],
    relations: ['aaa'],
    expectedOrder: 3,
  },
  {
    name: 'cyclic group C6',
    generators: ['a'],
    relations: ['aaaaaa'],
    expectedOrder: 6,
  },
  {
    name: 'Klein four group',
    generators: ['a', 'b'],
    relations: ['aa', 'bb', 'abAB'],
    expectedOrder: 4,
  },
  {
    name: 'elementary abelian group of order 25',
    generators: ['a', 'b'],
    relations: ['aaaaa', 'bbbbb', 'abAB'],
    expectedOrder: 25,
  },
  {
    name: 'quaternion-style order 8 presentation',
    generators: ['a', 'b'],
    relations: ['aaaa', 'aaBB', 'abAB'],
    expectedOrder: 8,
  },
  {
    name: 'dihedral-style order 12 presentation',
    generators: ['a', 'b'],
    relations: ['aaaaaa', 'bb', 'abab'],
    expectedOrder: 12,
  },
  {
    name: 'symmetric group S3',
    generators: ['a', 'b'],
    relations: ['aa', 'bbb', 'abab'],
    expectedOrder: 6,
  },
  {
    name: 'alternating group A5',
    generators: ['a', 'b'],
    relations: ['aa', 'bbb', 'ababababab'],
    expectedOrder: 60,
  },
  {
    name: 'alternating group A6',
    generators: ['a', 'b'],
    relations: ['aa', 'bbbb', 'ababababab', 'abbabbabbabbabb'],
    expectedOrder: 360,
  },
]
