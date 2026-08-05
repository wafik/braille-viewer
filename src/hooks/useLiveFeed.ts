import { useState, useCallback } from 'react'
import { textToBraille } from '../lib/liblouis'
import { unicodeBrailleToDots } from '../lib/braille'

interface UseLiveFeed {
  dots: number[]
  windowSlice: number[]
  windowOffset: number
  windowSize: number
  totalDots: number
  autoFollow: boolean
  scrollUp: () => void
  scrollDown: () => void
  goHome: () => void
  setText: (text: string) => void
}

export function useLiveFeed(windowSize: number = 20): UseLiveFeed {
  const [dots, setDots] = useState<number[]>([])
  const [windowOffset, setWindowOffset] = useState(0)
  const [autoFollow, setAutoFollow] = useState(true)

  const totalDots = dots.length
  const maxOffset = Math.max(0, totalDots - windowSize)

  const resolveOffset = useCallback((dotsLen: number, follow: boolean, currentOffset: number): number => {
    if (follow) {
      return Math.max(0, dotsLen - windowSize)
    }
    return Math.max(0, Math.min(currentOffset, Math.max(0, dotsLen - windowSize)))
  }, [windowSize])

  const setText = useCallback((text: string) => {
    const braille = textToBraille(text)
    const newDots = unicodeBrailleToDots(braille)
    setDots(newDots)
    setAutoFollow(true)
    setWindowOffset(resolveOffset(newDots.length, true, 0))
  }, [resolveOffset])

  const scrollUp = useCallback(() => {
    setAutoFollow(false)
    setWindowOffset(prev => Math.max(0, prev - windowSize))
  }, [windowSize])

  const scrollDown = useCallback(() => {
    setAutoFollow(false)
    setWindowOffset(prev => Math.min(maxOffset, prev + windowSize))
  }, [maxOffset, windowSize])

  const goHome = useCallback(() => {
    setAutoFollow(true)
    setWindowOffset(maxOffset)
  }, [maxOffset])

  const slice = dots.slice(windowOffset, windowOffset + windowSize)
  const windowSlice = [...slice, ...Array(Math.max(0, windowSize - slice.length)).fill(0)]

  return {
    dots,
    windowSlice,
    windowOffset,
    windowSize,
    totalDots,
    autoFollow,
    scrollUp,
    scrollDown,
    goHome,
    setText,
  }
}
