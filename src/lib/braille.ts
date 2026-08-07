export interface CellGroup {
  label: string
  dots: number[]
}

export const BLANK_BRAILLE_CELL = 0x2800

const LAST_BRAILLE_CELL = 0x28FF

/**
 * Convert a Unicode braille string (U+2800–U+28FF) to an array of dot bytes.
 * Each character's code point minus 0x2800 gives the 8-bit dot pattern.
 *
 * liblouis emits an ASCII space (U+0020) rather than U+2800 for blank cells, so
 * anything outside the braille block maps to an empty cell instead of wrapping
 * to a bogus dot pattern.
 */
export function unicodeBrailleToDots(braille: string): number[] {
  return Array.from(braille).map(ch => {
    const code = ch.codePointAt(0) ?? BLANK_BRAILLE_CELL
    if (code < BLANK_BRAILLE_CELL || code > LAST_BRAILLE_CELL) return 0
    return code - BLANK_BRAILLE_CELL
  })
}

/**
 * Convert an array of dot bytes to a Unicode braille string.
 * Each byte (0–255) maps to U+2800–U+28FF.
 */
export function dotsToUnicodeBraille(dots: number[]): string {
  return dots.map(byte => String.fromCodePoint(BLANK_BRAILLE_CELL + (byte & 0xFF))).join('')
}
