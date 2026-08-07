import { describe, it, expect, beforeAll } from 'vitest'
import { initLiblouis, setLanguage } from '../liblouis'
import { buildPerWordGroups } from '../perWordBraille'

describe('buildPerWordGroups', () => {
  beforeAll(async () => {
    await initLiblouis()
  }, 30000)

  it('returns one group per word, labeled with that word', () => {
    setLanguage('id')
    const groups = buildPerWordGroups('saya makan nasi')
    expect(groups.map(g => g.label)).toEqual(['saya', 'makan', 'nasi'])
    for (const g of groups) {
      expect(g.dots.length).toBeGreaterThan(0)
    }
  })

  it('collapses runs of multiple spaces instead of emitting empty word groups', () => {
    setLanguage('id')
    const groups = buildPerWordGroups('halo  dunia')
    expect(groups.map(g => g.label)).toEqual(['halo', 'dunia'])
  })

  it('reflects real grade-2 contractions, unlike the per-cell view', () => {
    setLanguage('id')
    // "saya" contracts to a single cell in id-id-g2 (see liblouis.test.ts).
    const [saya] = buildPerWordGroups('saya')
    expect(saya.dots.length).toBe(1)
  })

  it('handles the empty string', () => {
    expect(buildPerWordGroups('')).toEqual([])
  })
})
