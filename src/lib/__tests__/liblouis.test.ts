import { describe, it, expect, beforeAll } from 'vitest'
import { initLiblouis, textToBraille } from '../liblouis'

describe('liblouis', () => {
  beforeAll(async () => {
    await initLiblouis()
  })

  it('translates simple ASCII text to braille', () => {
    const result = textToBraille('hello')
    expect(result).toBeTruthy()
    expect(result.length).toBe(5)
    for (const ch of result) {
      const code = ch.codePointAt(0)!
      expect(code).toBeGreaterThanOrEqual(0x2800)
      expect(code).toBeLessThanOrEqual(0x28FF)
    }
  })

  it('handles empty string', () => {
    const result = textToBraille('')
    expect(result).toBe('')
  })

  it('handles spaces', () => {
    const result = textToBraille('a b')
    expect(result.length).toBe(3)
  })
})
