import { textToBraille } from './liblouis'
import { unicodeBrailleToDots, type CellGroup } from './braille'

/**
 * One group per word (split on spaces), each translated independently with
 * the current language's real grade-2 table — shows actual contracted
 * output, grouped so word boundaries (the spaces) are visible as gaps.
 */
export function buildPerWordGroups(text: string): CellGroup[] {
  return text
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => ({
      label: word,
      dots: unicodeBrailleToDots(textToBraille(word)),
    }))
}
