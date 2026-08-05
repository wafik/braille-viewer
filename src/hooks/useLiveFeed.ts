import { useState, useCallback } from 'react'
import { textToBrailleLines } from '../lib/textToBraille'

interface UseLiveFeed {
  lines: number[][]
  currentLineIndex: number
  totalLines: number
  autoFollow: boolean
  scrollUp: () => void
  scrollDown: () => void
  panLeft: () => void
  panRight: () => void
  goHome: () => void
  setText: (text: string) => void
}

export function useLiveFeed(lineLength: number = 20): UseLiveFeed {
  const [lines, setLines] = useState<number[][]>([])
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [autoFollow, setAutoFollow] = useState(true)

  const totalLines = lines.length

  const setText = useCallback((text: string) => {
    const newLines = textToBrailleLines(text, lineLength)
    setLines(newLines)
    if (autoFollow) {
      setCurrentLineIndex(Math.max(0, newLines.length - 1))
    }
  }, [lineLength, autoFollow])

  const scrollUp = useCallback(() => {
    setAutoFollow(false)
    setCurrentLineIndex(prev => Math.max(0, prev - 1))
  }, [])

  const scrollDown = useCallback(() => {
    setAutoFollow(false)
    setCurrentLineIndex(prev => Math.min(totalLines - 1, prev + 1))
  }, [totalLines])

  const panLeft = useCallback(() => {
    setAutoFollow(false)
    setCurrentLineIndex(prev => Math.max(0, prev - 20))
  }, [])

  const panRight = useCallback(() => {
    setAutoFollow(false)
    setCurrentLineIndex(prev => Math.min(totalLines - 1, prev + 20))
  }, [totalLines])

  const goHome = useCallback(() => {
    setAutoFollow(true)
    setCurrentLineIndex(Math.max(0, totalLines - 1))
  }, [totalLines])

  return {
    lines,
    currentLineIndex,
    totalLines,
    autoFollow,
    scrollUp,
    scrollDown,
    panLeft,
    panRight,
    goHome,
    setText,
  }
}
