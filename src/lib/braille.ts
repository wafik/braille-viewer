export const BLANK_BRAILLE_CELL = 0x2800

/**
 * Convert a Unicode braille string (U+2800–U+28FF) to an array of dot bytes.
 * Each character's code point minus 0x2800 gives the 8-bit dot pattern.
 */
export function unicodeBrailleToDots(braille: string): number[] {
  return Array.from(braille).map(ch => (ch.codePointAt(0) ?? BLANK_BRAILLE_CELL) - BLANK_BRAILLE_CELL)
}

/**
 * Convert an array of dot bytes to a Unicode braille string.
 * Each byte (0–255) maps to U+2800–U+28FF.
 */
export function dotsToUnicodeBraille(dots: number[]): string {
  return dots.map(byte => String.fromCodePoint(BLANK_BRAILLE_CELL + (byte & 0xFF))).join('')
}
