import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useSpelledLine } from '../useSpelledLine'
import type { CellGroup } from '../../lib/braille'

const groupsOf = (labels: string[], dotsPerGroup: number): CellGroup[] =>
  labels.map(label => ({ label, dots: Array(dotsPerGroup).fill(1) }))

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useSpelledLine', () => {
  it('starts revealing only the first group', () => {
    const groups = groupsOf(['a', 'b', 'c'], 2)
    const { result } = renderHook(() => useSpelledLine(groups, 100, 20))
    expect(result.current.windowSlice.slice(0, 2)).toEqual([1, 1])
    expect(result.current.windowSlice.slice(2)).toEqual(Array(18).fill(0))
    expect(result.current.visibleLabels).toEqual(['a'])
  })

  it('appends the next group onto the line each tick', () => {
    const groups = groupsOf(['a', 'b', 'c'], 2)
    const { result } = renderHook(() => useSpelledLine(groups, 100, 20))

    act(() => vi.advanceTimersByTime(100))
    expect(result.current.visibleLabels).toEqual(['a', 'b'])
    expect(result.current.windowSlice.slice(0, 4)).toEqual([1, 1, 1, 1])
  })

  it('slides the window once revealed dots exceed windowSize', () => {
    const groups = groupsOf(['a', 'b', 'c'], 10)
    const { result } = renderHook(() => useSpelledLine(groups, 100, 20))

    act(() => vi.advanceTimersByTime(100)) // reveals b -> 20 dots, fits exactly
    expect(result.current.visibleLabels).toEqual(['a', 'b'])

    act(() => vi.advanceTimersByTime(100)) // reveals c -> 30 dots, window slides
    expect(result.current.visibleLabels).toEqual(['b', 'c'])
  })

  it('inserts separator cells between groups when separatorCells is set', () => {
    const groups = groupsOf(['a', 'b'], 2)
    const { result } = renderHook(() => useSpelledLine(groups, 100, 20, 1))

    expect(result.current.windowSlice.slice(0, 3)).toEqual([1, 1, 0])
    expect(result.current.visibleLabels).toEqual(['a'])

    act(() => vi.advanceTimersByTime(100))
    expect(result.current.windowSlice.slice(0, 5)).toEqual([1, 1, 0, 1, 1])
    expect(result.current.visibleLabels).toEqual(['a', 'b'])
  })

  it('stepNext/stepPrev pause autoplay and move by one group', () => {
    const groups = groupsOf(['a', 'b', 'c'], 2)
    const { result } = renderHook(() => useSpelledLine(groups, 100, 20))

    act(() => result.current.stepNext())
    expect(result.current.isPlaying).toBe(false)
    expect(result.current.visibleLabels).toEqual(['a', 'b'])

    act(() => vi.advanceTimersByTime(500))
    expect(result.current.visibleLabels).toEqual(['a', 'b'])

    act(() => result.current.stepPrev())
    expect(result.current.visibleLabels).toEqual(['a'])
  })

  it('resume continues playing and reset jumps back to the start', () => {
    const groups = groupsOf(['a', 'b', 'c'], 2)
    const { result } = renderHook(() => useSpelledLine(groups, 100, 20))

    act(() => result.current.stepNext())
    act(() => result.current.stepNext())
    act(() => result.current.reset())
    expect(result.current.currentGroupIndex).toBe(0)
    expect(result.current.isPlaying).toBe(true)

    act(() => vi.advanceTimersByTime(100))
    expect(result.current.currentGroupIndex).toBe(1)
  })
})
