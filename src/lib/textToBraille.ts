import { textToBraille } from './liblouis'
import { unicodeBrailleToDots } from './braille'

export function textToBrailleLines(text: string, lineLength: number = 20): number[][] {
  if (!text) return []

  const braille = textToBraille(text)
  const dots = unicodeBrailleToDots(braille)

  const lines: number[][] = []
  for (let i = 0; i < dots.length; i += lineLength) {
    const slice = dots.slice(i, i + lineLength)
    const padded = [...slice, ...Array(Math.max(0, lineLength - slice.length)).fill(0)]
    lines.push(padded)
  }

  return lines
}
