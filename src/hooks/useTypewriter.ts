import { useState, useCallback } from 'react'
import { textToBraille } from '../lib/liblouis'
import { unicodeBrailleToDots } from '../lib/braille'

interface UseTypewriter {
  dots: number[]
  windowSlice: number[]
  windowOffset: number
  windowSize: number
  totalDots: number
  inputText: string
  handleInput: (text: string) => void
  clear: () => void
}

export function useTypewriter(windowSize: number = 20): UseTypewriter {
  const [inputText, setInputText] = useState('')
  const [dots, setDots] = useState<number[]>([])
  const [windowOffset, setWindowOffset] = useState(0)

  const totalDots = dots.length

  const handleInput = useCallback((text: string) => {
    setInputText(text)
    const braille = textToBraille(text)
    const newDots = unicodeBrailleToDots(braille)
    setDots(newDots)
    // Auto-advance: show the last windowSize cells
    const newOffset = Math.max(0, newDots.length - windowSize)
    setWindowOffset(newOffset)
  }, [windowSize])

  const clear = useCallback(() => {
    setInputText('')
    setDots([])
    setWindowOffset(0)
  }, [])

  const slice = dots.slice(windowOffset, windowOffset + windowSize)
  const windowSlice = [...slice, ...Array(Math.max(0, windowSize - slice.length)).fill(0)]

  return {
    dots,
    windowSlice,
    windowOffset,
    windowSize,
    totalDots,
    inputText,
    handleInput,
    clear,
  }
}
