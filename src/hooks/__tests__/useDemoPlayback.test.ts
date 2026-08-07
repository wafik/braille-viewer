import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDemoPlayback, DEMO_CHUNK_INTERVAL_MS } from '../useDemoPlayback'
import { DEMO_CHUNKS } from '../../lib/demoText'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useDemoPlayback', () => {
  it('delivers the first chunk immediately on run()', () => {
    const onChunk = vi.fn()
    const { result } = renderHook(() => useDemoPlayback(onChunk))

    act(() => result.current.run())

    expect(result.current.transcript).toBe(DEMO_CHUNKS[0])
    expect(result.current.isRunning).toBe(true)
    expect(onChunk).toHaveBeenCalledWith(DEMO_CHUNKS[0])
  })

  it('appends one chunk per interval and stops after the last one', () => {
    const onChunk = vi.fn()
    const { result } = renderHook(() => useDemoPlayback(onChunk))

    act(() => result.current.run())
    for (let i = 1; i < DEMO_CHUNKS.length; i++) {
      act(() => vi.advanceTimersByTime(DEMO_CHUNK_INTERVAL_MS))
      expect(result.current.transcript).toBe(DEMO_CHUNKS.slice(0, i + 1).join(' '))
    }

    expect(result.current.isRunning).toBe(false)
    expect(onChunk).toHaveBeenCalledTimes(DEMO_CHUNKS.length)

    // No further chunks scheduled once finished.
    act(() => vi.advanceTimersByTime(DEMO_CHUNK_INTERVAL_MS * 2))
    expect(onChunk).toHaveBeenCalledTimes(DEMO_CHUNKS.length)
  })

  it('restarting run() mid-playback resets the transcript instead of stacking timers', () => {
    const onChunk = vi.fn()
    const { result } = renderHook(() => useDemoPlayback(onChunk))

    act(() => result.current.run())
    act(() => vi.advanceTimersByTime(DEMO_CHUNK_INTERVAL_MS))
    expect(result.current.transcript).toBe(DEMO_CHUNKS.slice(0, 2).join(' '))

    act(() => result.current.run())
    expect(result.current.transcript).toBe(DEMO_CHUNKS[0])

    // The stale timer from the first run must not fire a duplicate chunk.
    act(() => vi.advanceTimersByTime(DEMO_CHUNK_INTERVAL_MS))
    expect(result.current.transcript).toBe(DEMO_CHUNKS.slice(0, 2).join(' '))
  })

  it('unmounting mid-playback stops further chunks from firing', () => {
    const onChunk = vi.fn()
    const { result, unmount } = renderHook(() => useDemoPlayback(onChunk))

    act(() => result.current.run())
    unmount()
    const callsAtUnmount = onChunk.mock.calls.length

    act(() => vi.advanceTimersByTime(DEMO_CHUNK_INTERVAL_MS * DEMO_CHUNKS.length))
    expect(onChunk).toHaveBeenCalledTimes(callsAtUnmount)
  })
})
