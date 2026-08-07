import { describe, it, expect, beforeAll } from 'vitest'
import { initLiblouis, isReady, getLanguage, textToBraille } from '../liblouis'

describe('liblouis', () => {
  beforeAll(async () => {
    await initLiblouis()
  }, 30000)

  it('reports ready after init', () => {
    expect(isReady()).toBe(true)
  })

  it('defaults to the Indonesian table', () => {
    expect(getLanguage()).toBe('id')
  })

  it('handles empty string', () => {
    expect(textToBraille('')).toBe('')
  })

  it('preserves spaces between words', () => {
    expect(textToBraille('a b')).toContain(' ')
  })
})

// Expected values verified against liblouis 3.38 `lou_translate` using the same
// table, so the viewer stays byte-compatible with braillify-core.
describe('liblouis — Indonesian (id-id-g2)', () => {
  beforeAll(async () => {
    await initLiblouis()
  }, 30000)

  it('translates Indonesian text', () => {
    expect(textToBraille('Halo Dunia', 'id')).toBe('⠠⠓⠁⠇⠕ ⠠⠙⠦⠔')
  })

  it('applies Indonesian grade-2 contractions', () => {
    // "saya" contracts to a single cell, "makan" to three.
    expect(textToBraille('saya makan nasi, ya!', 'id')).toBe('⠎ ⠍⠁⠷ ⠝⠁⠎⠊⠂ ⠽⠁⠖')
  })

  it('emits capital and number indicators', () => {
    expect(textToBraille('Selamat pagi 911!', 'id')).toBe('⠠⠯⠇⠜⠁⠞ ⠏⠁⠛⠊ ⠼⠊⠁⠁⠖')
  })

  it('keeps Indonesian punctuation overrides', () => {
    // "/" is 34 and "(" is 2356 in this table, not the en-ueb-g1 values.
    expect(textToBraille('Bapak/Ibu (ya)', 'id')).toBe('⠠⠃⠁⠏⠁⠅⠌⠠⠊⠃⠥ ⠶⠽⠁⠶')
  })
})

describe('liblouis — English (en-ueb-g2)', () => {
  beforeAll(async () => {
    await initLiblouis()
  }, 30000)

  it('translates simple ASCII text to braille', () => {
    const result = textToBraille('hello', 'en')
    expect(result).toBe('⠓⠑⠇⠇⠕')
    for (const ch of result) {
      const code = ch.codePointAt(0)!
      expect(code).toBeGreaterThanOrEqual(0x2800)
      expect(code).toBeLessThanOrEqual(0x28FF)
    }
  })

  it('applies UEB grade-2 contractions', () => {
    // "knowledge" is a single-cell whole-word contraction in UEB grade 2.
    expect(textToBraille('knowledge', 'en')).toBe('⠅')
    expect(textToBraille('hello world', 'en')).toBe('⠓⠑⠇⠇⠕ ⠸⠺')
  })

  it('emits a capital indicator for uppercase', () => {
    expect(textToBraille('Hello', 'en')).toBe('⠠⠓⠑⠇⠇⠕')
  })

  it('emits a number sign for digits', () => {
    expect(textToBraille('911', 'en')).toBe('⠼⠊⠁⠁')
  })

  it('renders punctuation instead of dropping it', () => {
    const result = textToBraille('hi!', 'en')
    expect(result).not.toContain('⠀')
    expect(result.length).toBeGreaterThan(2)
  })
})
