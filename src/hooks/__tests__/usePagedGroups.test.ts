import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { usePagedGroups } from '../usePagedGroups'
import type { CellGroup } from '../../lib/braille'

const groupsOf = (labels: string[], dotsPerGroup: number): CellGroup[] =>
  labels.map(label => ({ label, dots: Array(dotsPerGroup).fill(1) }))

describe('usePagedGroups', () => {
  it('starts empty with no groups', () => {
    const { result } = renderHook(() => usePagedGroups([]))
    expect(result.current.totalDots).toBe(0)
    expect(result.current.windowOffset).toBe(0)
    expect(result.current.visibleLabels).toEqual([])
  })

  it('auto-follows to the end as groups grow', () => {
    const groups = groupsOf(['a', 'b', 'c'], 10)
    const { result, rerender } = renderHook(({ groups }) => usePagedGroups(groups, 20), {
      initialProps: { groups },
    })
    expect(result.current.windowOffset).toBe(10) // 30 dots - window 20

    rerender({ groups: groupsOf(['a', 'b', 'c', 'd'], 10) })
    expect(result.current.windowOffset).toBe(20) // 40 dots - window 20
  })

  it('scrollUp/scrollDown disable auto-follow and page by windowSize', () => {
    const groups = groupsOf(['a', 'b', 'c'], 10)
    const { result } = renderHook(() => usePagedGroups(groups, 20))

    act(() => result.current.scrollUp())
    expect(result.current.autoFollow).toBe(false)
    expect(result.current.windowOffset).toBe(0)

    act(() => result.current.scrollDown())
    expect(result.current.windowOffset).toBe(10) // clamped to maxOffset
  })

  it('goHome re-enables auto-follow and jumps to the end', () => {
    const groups = groupsOf(['a', 'b', 'c'], 10)
    const { result } = renderHook(() => usePagedGroups(groups, 20))

    act(() => result.current.scrollUp())
    act(() => result.current.goHome())
    expect(result.current.autoFollow).toBe(true)
    expect(result.current.windowOffset).toBe(10)
  })

  it('visibleLabels reflects only the groups intersecting the current window', () => {
    const groups = groupsOf(['a', 'b', 'c'], 10)
    const { result } = renderHook(() => usePagedGroups(groups, 20))

    act(() => result.current.scrollUp())
    expect(result.current.visibleLabels).toEqual(['a', 'b'])
  })
})
