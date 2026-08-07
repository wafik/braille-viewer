import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRemoteFeed } from '../useRemoteFeed'

class FakeWebSocket {
  static instances: FakeWebSocket[] = []
  url: string
  closed: boolean = false
  onopen: (() => void) | null = null
  onmessage: ((event: { data: string }) => void) | null = null
  onclose: (() => void) | null = null
  onerror: (() => void) | null = null

  constructor(url: string) {
    // Mirror real WebSocket construction-time URL validation: the browser
    // throws synchronously for URLs it can't parse (empty string, stray
    // whitespace, invalid ports, etc). The previous version of this fake
    // accepted anything, which is exactly why the bug this guards against
    // slipped past the original test suite.
    // eslint-disable-next-line no-new
    new URL(url)
    this.url = url
    FakeWebSocket.instances.push(this)
  }

  close() {
    this.closed = true
    this.onclose?.()
  }

  emitMessage(payload: unknown) {
    this.onmessage?.({ data: JSON.stringify(payload) })
  }
}

beforeEach(() => {
  FakeWebSocket.instances = []
  vi.stubGlobal('WebSocket', FakeWebSocket)
})

describe('useRemoteFeed', () => {
  it('starts idle with no dots or history', () => {
    const { result } = renderHook(() => useRemoteFeed())
    expect(result.current.status).toBe('idle')
    expect(result.current.dots).toEqual([])
    expect(result.current.history).toEqual([])
  })

  it('normalizes a bare host:port into a ws:// url and reflects the open event', () => {
    const { result } = renderHook(() => useRemoteFeed())
    act(() => result.current.connect('localhost:8765'))
    const socket = FakeWebSocket.instances[0]
    expect(socket.url).toBe('ws://localhost:8765')
    act(() => socket.onopen?.())
    expect(result.current.status).toBe('connected')
  })

  it('updates dots on a braille_output message', () => {
    const { result } = renderHook(() => useRemoteFeed())
    act(() => result.current.connect('localhost:8765'))
    const socket = FakeWebSocket.instances[0]
    act(() => socket.emitMessage({ type: 'braille_output', dots: [1, 2, 3] }))
    expect(result.current.dots).toEqual([1, 2, 3])
  })

  it('appends to history on a braille_text message, most-recent-first, capped at 50', () => {
    const { result } = renderHook(() => useRemoteFeed())
    act(() => result.current.connect('localhost:8765'))
    const socket = FakeWebSocket.instances[0]
    for (let i = 0; i < 55; i++) {
      act(() => socket.emitMessage({ type: 'braille_text', text: `sentence ${i}` }))
    }
    expect(result.current.history.length).toBe(50)
    expect(result.current.history[0]).toBe('sentence 54')
  })

  it('braille_line updates both the live dots and the history', () => {
    const { result } = renderHook(() => useRemoteFeed())
    act(() => result.current.connect('localhost:8765'))
    const socket = FakeWebSocket.instances[0]
    act(() => socket.emitMessage({ type: 'braille_line', text: 'hello world', dots: [1, 2, 3] }))
    expect(result.current.dots).toEqual([1, 2, 3])
    expect(result.current.history).toEqual(['hello world'])
  })

  it('braille_line without dots still appends to history', () => {
    const { result } = renderHook(() => useRemoteFeed())
    act(() => result.current.connect('localhost:8765'))
    const socket = FakeWebSocket.instances[0]
    act(() => socket.emitMessage({ type: 'braille_line', text: 'no dots here' }))
    expect(result.current.history).toEqual(['no dots here'])
    expect(result.current.dots).toEqual([])
  })

  it('ignores unknown message types', () => {
    const { result } = renderHook(() => useRemoteFeed())
    act(() => result.current.connect('localhost:8765'))
    const socket = FakeWebSocket.instances[0]
    act(() => socket.emitMessage({ type: 'stt_result', text: 'hi' }))
    expect(result.current.dots).toEqual([])
    expect(result.current.history).toEqual([])
  })

  it('ignores malformed JSON without throwing', () => {
    const { result } = renderHook(() => useRemoteFeed())
    act(() => result.current.connect('localhost:8765'))
    const socket = FakeWebSocket.instances[0]
    expect(() => act(() => socket.onmessage?.({ data: 'not json' }))).not.toThrow()
  })

  it('sets status to error on a socket error', () => {
    const { result } = renderHook(() => useRemoteFeed())
    act(() => result.current.connect('localhost:8765'))
    const socket = FakeWebSocket.instances[0]
    act(() => socket.onerror?.())
    expect(result.current.status).toBe('error')
  })

  it('disconnect closes the socket and returns to idle', () => {
    const { result } = renderHook(() => useRemoteFeed())
    act(() => result.current.connect('localhost:8765'))
    const socket = FakeWebSocket.instances[0]
    act(() => socket.onopen?.())
    act(() => result.current.disconnect())
    expect(result.current.status).toBe('idle')
  })

  it('closes the socket on unmount', () => {
    const { result, unmount } = renderHook(() => useRemoteFeed())
    act(() => result.current.connect('localhost:8765'))
    const socket = FakeWebSocket.instances[0]
    expect(socket.closed).toBe(false)
    unmount()
    expect(socket.closed).toBe(true)
  })

  it('sets status to error without throwing when the address fails URL parsing', () => {
    const { result } = renderHook(() => useRemoteFeed())
    expect(() => act(() => result.current.connect(''))).not.toThrow()
    expect(result.current.status).toBe('error')
    expect(FakeWebSocket.instances.length).toBe(0)
  })

  it('does not let a stale socket close event clobber a newer connection status', () => {
    const { result } = renderHook(() => useRemoteFeed())
    act(() => result.current.connect('localhost:8765'))
    const first = FakeWebSocket.instances[0]
    act(() => result.current.connect('localhost:9999'))
    const second = FakeWebSocket.instances[1]
    act(() => second.onopen?.())
    expect(result.current.status).toBe('connected')
    // Simulate the first (now-stale) socket's close event arriving late.
    act(() => first.onclose?.())
    expect(result.current.status).toBe('connected')
  })

  it('auto-follows the tail of a growing braille_output buffer', () => {
    const { result } = renderHook(() => useRemoteFeed(5))
    act(() => result.current.connect('localhost:8765'))
    const socket = FakeWebSocket.instances[0]
    act(() => socket.emitMessage({ type: 'braille_output', dots: [1, 2, 3, 4, 5, 6, 7] }))
    expect(result.current.totalDots).toBe(7)
    expect(result.current.windowOffset).toBe(2)
    expect(result.current.windowSlice).toEqual([3, 4, 5, 6, 7])
    expect(result.current.autoFollow).toBe(true)
  })

  it('pads windowSlice with zeros when dots is shorter than windowSize', () => {
    const { result } = renderHook(() => useRemoteFeed(5))
    act(() => result.current.connect('localhost:8765'))
    const socket = FakeWebSocket.instances[0]
    act(() => socket.emitMessage({ type: 'braille_output', dots: [1, 2] }))
    expect(result.current.windowSlice).toEqual([1, 2, 0, 0, 0])
  })

  it('scrollUp/scrollDown disable auto-follow and move the window', () => {
    const { result } = renderHook(() => useRemoteFeed(5))
    act(() => result.current.connect('localhost:8765'))
    const socket = FakeWebSocket.instances[0]
    act(() => socket.emitMessage({ type: 'braille_output', dots: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }))
    expect(result.current.windowOffset).toBe(5) // auto-followed to the tail

    act(() => result.current.scrollUp())
    expect(result.current.autoFollow).toBe(false)
    expect(result.current.windowOffset).toBe(0)

    act(() => result.current.scrollDown())
    expect(result.current.windowOffset).toBe(5)
  })

  it('goHome re-enables auto-follow and jumps back to the tail', () => {
    const { result } = renderHook(() => useRemoteFeed(5))
    act(() => result.current.connect('localhost:8765'))
    const socket = FakeWebSocket.instances[0]
    act(() => socket.emitMessage({ type: 'braille_output', dots: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }))
    act(() => result.current.scrollUp())
    expect(result.current.autoFollow).toBe(false)

    act(() => result.current.goHome())
    expect(result.current.autoFollow).toBe(true)
    expect(result.current.windowOffset).toBe(5)
  })

  it('a late braille_output while auto-follow is off keeps the manual offset clamped, not snapped to the tail', () => {
    const { result } = renderHook(() => useRemoteFeed(5))
    act(() => result.current.connect('localhost:8765'))
    const socket = FakeWebSocket.instances[0]
    act(() => socket.emitMessage({ type: 'braille_output', dots: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }))
    act(() => result.current.scrollUp())
    expect(result.current.windowOffset).toBe(0)

    act(() => socket.emitMessage({ type: 'braille_output', dots: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }))
    expect(result.current.autoFollow).toBe(false)
    expect(result.current.windowOffset).toBe(0)
  })

  it('synchronous ref writes prevent stale closure when scrolling and a message arrives in the same act', () => {
    const { result } = renderHook(() => useRemoteFeed(5))
    act(() => result.current.connect('localhost:8765'))
    const socket = FakeWebSocket.instances[0]
    // Initial message: 10 dots, auto-follow snaps to tail (offset = 5)
    act(() => socket.emitMessage({ type: 'braille_output', dots: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }))
    expect(result.current.windowOffset).toBe(5)
    expect(result.current.autoFollow).toBe(true)

    // Within a single act block: user scrolls up, then a message arrives.
    // With stale closure (useEffect mirroring), the onmessage handler would see
    // the old autoFollowRef.current === true and snap back to the tail.
    // With synchronous ref writes, it sees the new autoFollowRef.current === false
    // and respects the manual offset.
    act(() => {
      result.current.scrollUp()
      socket.emitMessage({ type: 'braille_output', dots: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] })
    })
    expect(result.current.autoFollow).toBe(false)
    expect(result.current.windowOffset).toBe(0)
  })
})
