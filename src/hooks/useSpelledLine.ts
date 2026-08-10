import { useEffect, useState } from 'react'
import type { CellGroup } from '../lib/braille'

interface UseSpelledLine {
  windowSlice: number[]
  windowSize: number
  totalGroups: number
  currentGroupIndex: number
  visibleLabels: string[]
  isPlaying: boolean
  stepPrev: () => void
  stepNext: () => void
  resume: () => void
  reset: () => void
}

/**
 * Reveals groups one at a time on a timer (like spelling a sentence out),
 * appending each group's dots onto a single line capped at windowSize cells
 * — once the line is full, older cells scroll off as new ones append,
 * mirroring how a real braille display pans. Manual stepPrev/stepNext move
 * the reveal pointer by one group and pause autoplay; resume() continues,
 * reset() jumps back to the start (call it when the caller knows playback
 * is starting over, e.g. a demo re-run).
 */
export function useSpelledLine(groups: CellGroup[], intervalMs: number, windowSize: number = 20, separatorCells: number = 0): UseSpelledLine {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  const totalGroups = groups.length

  useEffect(() => {
    setCurrentGroupIndex(prev => Math.min(prev, Math.max(0, totalGroups - 1)))
  }, [totalGroups])

  useEffect(() => {
    if (!isPlaying || totalGroups === 0) return
    const timer = setInterval(() => {
      setCurrentGroupIndex(prev => (prev + 1 < totalGroups ? prev + 1 : prev))
    }, intervalMs)
    return () => clearInterval(timer)
  }, [isPlaying, totalGroups, intervalMs])

  const dots: number[] = []
  const dotGroup: number[] = []
  for (let i = 0; i <= currentGroupIndex && i < groups.length; i++) {
    if (i > 0) {
      for (let s = 0; s < separatorCells; s++) {
        dots.push(0)
        dotGroup.push(-1)
      }
    }
    for (const dot of groups[i].dots) {
      dots.push(dot)
      dotGroup.push(i)
    }
  }

  const windowStart = Math.max(0, dots.length - windowSize)
  const slice = dots.slice(windowStart)
  const windowSlice = [...slice, ...Array(Math.max(0, windowSize - slice.length)).fill(0)]

  const visibleGroupIndexes = Array.from(new Set(dotGroup.slice(windowStart))).filter(i => i >= 0)
  const visibleLabels = visibleGroupIndexes.map(i => groups[i]?.label ?? '')

  const stepPrev = () => {
    setIsPlaying(false)
    setCurrentGroupIndex(prev => Math.max(0, prev - 1))
  }

  const stepNext = () => {
    setIsPlaying(false)
    setCurrentGroupIndex(prev => Math.min(Math.max(0, totalGroups - 1), prev + 1))
  }

  const resume = () => setIsPlaying(true)

  const reset = () => {
    setCurrentGroupIndex(0)
    setIsPlaying(true)
  }

  return {
    windowSlice,
    windowSize,
    totalGroups,
    currentGroupIndex,
    visibleLabels,
    isPlaying,
    stepPrev,
    stepNext,
    resume,
    reset,
  }
}
