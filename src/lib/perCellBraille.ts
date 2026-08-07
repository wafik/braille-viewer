import { textToBrailleG1 } from './liblouis'
import { unicodeBrailleToDots, type CellGroup } from './braille'

/**
 * One group per input character, translated independently in grade 1
 * (uncontracted) so each group is that character's own cell(s) — a capital
 * letter yields [capital-sign, letter], but never a cross-character
 * contraction, unlike the grade-2 tables used elsewhere in the app.
 */
export function buildPerCellGroups(text: string): CellGroup[] {
  return Array.from(text).map(ch => ({
    label: ch === ' ' ? '' : ch,
    dots: unicodeBrailleToDots(textToBrailleG1(ch)),
  }))
}
