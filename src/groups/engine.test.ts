import { describe, expect, it } from 'vitest'

import { computeOrder } from '@/groups/testing'
import { groupTestCases } from '@/groups/test-cases'

describe('group order regressions', () => {
  for (const testCase of groupTestCases) {
    it(testCase.name, () => {
      expect(computeOrder(testCase.generators, testCase.relations as string[])).toBe(testCase.expectedOrder)
    })
  }
})
