import { useState, useCallback } from 'react'
import { textToBrailleLines } from '../lib/textToBraille'

interface UseBrailleViewer {
  lines: number[][]
  currentLineIndex: number
  totalLines: number
  scrollUp: () => void
  scrollDown: () => void
  goToLine: (index: number) => void
  setText: (text: string) => void
}

export function useBrailleViewer(lineLength: number = 20): UseBrailleViewer {
  const [lines, setLines] = useState<number[][]>([])
  const [currentLineIndex, setCurrentLineIndex] = useState(0)

  const totalLines = lines.length

  const setText = useCallback((text: string) => {
    const newLines = textToBrailleLines(text, lineLength)
    setLines(newLines)
    setCurrentLineIndex(0)
  }, [lineLength])

  const scrollUp = useCallback(() => {
    setCurrentLineIndex(prev => Math.max(0, prev - 1))
  }, [])

  const scrollDown = useCallback(() => {
    setCurrentLineIndex(prev => Math.min(totalLines - 1, prev + 1))
  }, [totalLines])

  const goToLine = useCallback((index: number) => {
    setCurrentLineIndex(Math.max(0, Math.min(totalLines - 1, index)))
  }, [totalLines])

  return {
    lines,
    currentLineIndex,
    totalLines,
    scrollUp,
    scrollDown,
    goToLine,
    setText,
  }
}
