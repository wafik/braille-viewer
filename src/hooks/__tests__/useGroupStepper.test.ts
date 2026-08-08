import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useGroupStepper } from '../useGroupStepper'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useGroupStepper', () => {
  it('starts at index 0 and plays automatically', () => {
    const { result } = renderHook(() => useGroupStepper(5, 100))
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.isPlaying).toBe(true)
  })

  it('advances one index per interval and stops at the last group', () => {
    const { result } = renderHook(() => useGroupStepper(3, 100))

    act(() => vi.advanceTimersByTime(100))
    expect(result.current.currentIndex).toBe(1)

    act(() => vi.advanceTimersByTime(100))
    expect(result.current.currentIndex).toBe(2)

    act(() => vi.advanceTimersByTime(300))
    expect(result.current.currentIndex).toBe(2)
  })

  it('stepNext/stepPrev pause autoplay and move by one', () => {
    const { result } = renderHook(() => useGroupStepper(3, 100))

    act(() => result.current.stepNext())
    expect(result.current.currentIndex).toBe(1)
    expect(result.current.isPlaying).toBe(false)

    act(() => vi.advanceTimersByTime(500))
    expect(result.current.currentIndex).toBe(1)

    act(() => result.current.stepPrev())
    expect(result.current.currentIndex).toBe(0)
  })

  it('resume continues playing from the paused index', () => {
    const { result } = renderHook(() => useGroupStepper(3, 100))

    act(() => result.current.stepNext())
    act(() => result.current.resume())
    expect(result.current.isPlaying).toBe(true)

    act(() => vi.advanceTimersByTime(100))
    expect(result.current.currentIndex).toBe(2)
  })

  it('reset jumps back to 0 and resumes', () => {
    const { result } = renderHook(() => useGroupStepper(3, 100))

    act(() => result.current.stepNext())
    act(() => result.current.reset())
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.isPlaying).toBe(true)
  })

  it('clamps currentIndex down when groupCount shrinks', () => {
    const { result, rerender } = renderHook(({ count }) => useGroupStepper(count, 100), {
      initialProps: { count: 5 },
    })

    act(() => result.current.stepNext())
    act(() => result.current.stepNext())
    expect(result.current.currentIndex).toBe(2)

    rerender({ count: 2 })
    expect(result.current.currentIndex).toBe(1)
  })
})
