import { describe, it, expect } from 'vitest'
import { unicodeBrailleToDots, dotsToUnicodeBraille, BLANK_BRAILLE_CELL } from '../braille'

describe('unicodeBrailleToDots', () => {
  it('converts blank braille cell to 0', () => {
    expect(unicodeBrailleToDots('⠀')).toEqual([0])
  })

  it('converts braille character to correct dot byte', () => {
    expect(unicodeBrailleToDots('⠁')).toEqual([1])
  })

  it('converts multiple characters', () => {
    const result = unicodeBrailleToDots('⠃⠁')
    expect(result).toEqual([3, 1])
  })
})

describe('dotsToUnicodeBraille', () => {
  it('converts 0 to blank braille cell', () => {
    expect(dotsToUnicodeBraille([0])).toBe('⠀')
  })

  it('converts dot byte to correct braille character', () => {
    expect(dotsToUnicodeBraille([1])).toBe('⠁')
  })

  it('converts multiple dot bytes', () => {
    expect(dotsToUnicodeBraille([3, 1])).toBe('⠃⠁')
  })
})

describe('BLANK_BRAILLE_CELL', () => {
  it('is 0x2800 (8421 decimal)', () => {
    expect(BLANK_BRAILLE_CELL).toBe(0x2800)
  })
})
