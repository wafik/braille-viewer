import { useEffect, useRef, useState } from 'react'
import type { CellGroup } from '../lib/braille'

interface UsePagedGroups {
  windowSlice: number[]
  windowOffset: number
  windowSize: number
  totalDots: number
  autoFollow: boolean
  visibleLabels: string[]
  scrollUp: () => void
  scrollDown: () => void
  goHome: () => void
}

/**
 * Flattens CellGroup[] into a single dot stream and pages through it like
 * useLiveFeed, but also tracks which group each dot belongs to so callers
 * can show the label(s) for whatever's currently in the window.
 */
export function usePagedGroups(groups: CellGroup[], windowSize: number = 20): UsePagedGroups {
  const [windowOffset, setWindowOffset] = useState(0)
  const [autoFollow, setAutoFollow] = useState(true)
  const autoFollowRef = useRef(autoFollow)
  autoFollowRef.current = autoFollow

  const dots: number[] = []
  const dotGroup: number[] = []
  groups.forEach((group, groupIndex) => {
    group.dots.forEach(dot => {
      dots.push(dot)
      dotGroup.push(groupIndex)
    })
  })
  const totalDots = dots.length
  const maxOffset = Math.max(0, totalDots - windowSize)

  useEffect(() => {
    setWindowOffset(prev =>
      autoFollowRef.current
        ? Math.max(0, totalDots - windowSize)
        : Math.max(0, Math.min(prev, Math.max(0, totalDots - windowSize))),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, windowSize])

  const scrollUp = () => {
    setAutoFollow(false)
    setWindowOffset(prev => Math.max(0, prev - windowSize))
  }

  const scrollDown = () => {
    setAutoFollow(false)
    setWindowOffset(prev => Math.min(maxOffset, prev + windowSize))
  }

  const goHome = () => {
    setAutoFollow(true)
    setWindowOffset(maxOffset)
  }

  const slice = dots.slice(windowOffset, windowOffset + windowSize)
  const windowSlice = [...slice, ...Array(Math.max(0, windowSize - slice.length)).fill(0)]

  const visibleGroupIndexes = Array.from(new Set(dotGroup.slice(windowOffset, windowOffset + windowSize)))
  const visibleLabels = visibleGroupIndexes.map(groupIndex => groups[groupIndex]?.label ?? '')

  return {
    windowSlice,
    windowOffset,
    windowSize,
    totalDots,
    autoFollow,
    visibleLabels,
    scrollUp,
    scrollDown,
    goHome,
  }
}
