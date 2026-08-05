import { describe, it, expect, vi } from 'vitest'
import { textToBrailleLines } from '../textToBraille'

// Mock liblouis
vi.mock('../liblouis', () => ({
  textToBraille: vi.fn((text: string) => {
    const map: Record<string, string> = {
      'h': '⠓', 'e': '⠑', 'l': '⠇', 'o': '⠕', ' ': '⠀',
    }
    return Array.from(text.toLowerCase()).map(ch => map[ch] ?? '⠀').join('')
  }),
}))

describe('textToBrailleLines', () => {
  it('splits text into lines of 20 braille chars', () => {
    const text = 'hello world hello world hello' // 29 chars
    const lines = textToBrailleLines(text, 20)
    expect(lines.length).toBe(2)
    expect(lines[0]).toHaveLength(20)
    expect(lines[1]).toHaveLength(20)
  })

  it('returns empty array for empty text', () => {
    const lines = textToBrailleLines('', 20)
    expect(lines).toEqual([])
  })

  it('pads last line with zeros', () => {
    const text = 'hi'
    const lines = textToBrailleLines(text, 20)
    expect(lines.length).toBe(1)
    expect(lines[0]).toHaveLength(20)
    expect(lines[0][2]).toBe(0)
  })

  it('handles text exactly 20 chars', () => {
    const text = 'a'.repeat(20)
    const lines = textToBrailleLines(text, 20)
    expect(lines.length).toBe(1)
    expect(lines[0]).toHaveLength(20)
  })
})
