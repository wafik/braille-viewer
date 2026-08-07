import { describe, it, expect, beforeAll } from 'vitest'
import { initLiblouis } from '../liblouis'
import { buildPerCellGroups } from '../perCellBraille'

describe('buildPerCellGroups', () => {
  beforeAll(async () => {
    await initLiblouis()
  }, 30000)

  it('returns one group per character, labeled with that character', () => {
    const groups = buildPerCellGroups('cat')
    expect(groups.map(g => g.label)).toEqual(['c', 'a', 't'])
    for (const g of groups) {
      expect(g.dots.length).toBeGreaterThan(0)
    }
  })

  it('labels a space group with an empty string but still produces a blank cell', () => {
    const groups = buildPerCellGroups('a b')
    expect(groups.map(g => g.label)).toEqual(['a', '', 'b'])
    expect(groups[1].dots).toEqual([0])
  })

  it('a capital letter yields more than one cell (capital sign + letter), not a contraction', () => {
    const groups = buildPerCellGroups('C')
    expect(groups[0].label).toBe('C')
    expect(groups[0].dots.length).toBe(2)
  })

  it('handles the empty string', () => {
    expect(buildPerCellGroups('')).toEqual([])
  })
})
