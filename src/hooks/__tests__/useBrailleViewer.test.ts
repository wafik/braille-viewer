import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useBrailleViewer } from '../useBrailleViewer'

vi.mock('../../lib/textToBraille', () => ({
  textToBrailleLines: vi.fn((text: string, lineLength: number = 20) => {
    if (!text) return []
    return [
      Array(lineLength).fill(1),
      Array(lineLength).fill(2),
      Array(lineLength).fill(3),
    ]
  }),
}))

describe('useBrailleViewer', () => {
  it('starts with empty state', () => {
    const { result } = renderHook(() => useBrailleViewer())
    expect(result.current.lines).toEqual([])
    expect(result.current.currentLineIndex).toBe(0)
    expect(result.current.totalLines).toBe(0)
  })

  it('updates lines on setText', () => {
    const { result } = renderHook(() => useBrailleViewer())
    act(() => result.current.setText('hello'))
    expect(result.current.totalLines).toBe(3)
    expect(result.current.currentLineIndex).toBe(0)
  })

  it('scrollDown increments index', () => {
    const { result } = renderHook(() => useBrailleViewer())
    act(() => result.current.setText('hello'))
    act(() => result.current.scrollDown())
    expect(result.current.currentLineIndex).toBe(1)
  })

  it('scrollUp decrements index', () => {
    const { result } = renderHook(() => useBrailleViewer())
    act(() => result.current.setText('hello'))
    act(() => result.current.scrollDown())
    act(() => result.current.scrollDown())
    act(() => result.current.scrollUp())
    expect(result.current.currentLineIndex).toBe(1)
  })

  it('scrollUp does not go below 0', () => {
    const { result } = renderHook(() => useBrailleViewer())
    act(() => result.current.setText('hello'))
    act(() => result.current.scrollUp())
    expect(result.current.currentLineIndex).toBe(0)
  })

  it('scrollDown does not exceed totalLines - 1', () => {
    const { result } = renderHook(() => useBrailleViewer())
    act(() => result.current.setText('hello'))
    act(() => result.current.scrollDown())
    act(() => result.current.scrollDown())
    act(() => result.current.scrollDown())
    expect(result.current.currentLineIndex).toBe(2)
  })

  it('goToLine sets specific index', () => {
    const { result } = renderHook(() => useBrailleViewer())
    act(() => result.current.setText('hello'))
    act(() => result.current.goToLine(1))
    expect(result.current.currentLineIndex).toBe(1)
  })

  it('resets index to 0 on new setText', () => {
    const { result } = renderHook(() => useBrailleViewer())
    act(() => result.current.setText('hello'))
    act(() => result.current.scrollDown())
    act(() => result.current.setText('world'))
    expect(result.current.currentLineIndex).toBe(0)
  })
})
