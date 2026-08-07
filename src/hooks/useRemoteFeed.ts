import { useCallback, useEffect, useRef, useState } from 'react'

export type RemoteFeedStatus = 'idle' | 'connecting' | 'connected' | 'error'

interface RemoteMessage {
  type?: string
  dots?: number[]
  text?: string
}

interface UseRemoteFeed {
  status: RemoteFeedStatus
  dots: number[]
  windowSlice: number[]
  windowOffset: number
  windowSize: number
  totalDots: number
  autoFollow: boolean
  history: string[]
  connect: (address: string) => void
  disconnect: () => void
  scrollUp: () => void
  scrollDown: () => void
  goHome: () => void
}

const HISTORY_LIMIT = 50

function toWsUrl(address: string): string {
  return address.startsWith('ws://') || address.startsWith('wss://') ? address : `ws://${address}`
}

function resolveOffset(dotsLen: number, windowSize: number, follow: boolean, currentOffset: number): number {
  const maxOffset = Math.max(0, dotsLen - windowSize)
  if (follow) return maxOffset
  return Math.max(0, Math.min(currentOffset, maxOffset))
}

export function useRemoteFeed(windowSize: number = 20): UseRemoteFeed {
  const [status, setStatus] = useState<RemoteFeedStatus>('idle')
  const [dots, setDots] = useState<number[]>([])
  const [windowOffset, setWindowOffset] = useState(0)
  const [autoFollow, setAutoFollow] = useState(true)
  const [history, setHistory] = useState<string[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const hadErrorRef = useRef(false)

  // connect()'s onmessage handler is a long-lived closure created once per
  // connection, so it can't see later autoFollow/windowOffset state updates
  // from user scrolling. These refs are written synchronously at every call
  // site that changes the corresponding state (scrollUp/scrollDown/goHome/
  // onmessage), the same discipline hadErrorRef already uses.
  const autoFollowRef = useRef(true)
  const windowOffsetRef = useRef(0)

  const totalDots = dots.length
  const maxOffset = Math.max(0, totalDots - windowSize)

  const disconnect = useCallback(() => {
    wsRef.current?.close()
  }, [])

  const connect = useCallback((address: string) => {
    const previous = wsRef.current
    if (previous) {
      // Detach the stale socket's handlers before closing it. close() is
      // asynchronous in real browsers, so without this a late-firing
      // onclose (or onerror/onopen) from the *old* socket could still land
      // after we've already moved on to a newer connection and clobber its
      // status.
      previous.onopen = null
      previous.onerror = null
      previous.onclose = null
      previous.onmessage = null
      previous.close()
    }
    wsRef.current = null

    hadErrorRef.current = false
    setStatus('connecting')

    let ws: WebSocket
    try {
      ws = new WebSocket(toWsUrl(address))
    } catch {
      // new WebSocket(...) throws synchronously for addresses that fail URL
      // parsing (empty string, stray whitespace, invalid port, etc). Land on
      // 'error' instead of leaving status stuck on 'connecting'.
      setStatus('error')
      return
    }
    wsRef.current = ws

    ws.onopen = () => setStatus('connected')
    ws.onerror = () => {
      hadErrorRef.current = true
      setStatus('error')
    }
    ws.onclose = () => {
      setStatus(hadErrorRef.current ? 'error' : 'idle')
      wsRef.current = null
    }
    ws.onmessage = (event: MessageEvent) => {
      let msg: RemoteMessage
      try {
        msg = JSON.parse(event.data)
      } catch {
        return
      }
      if (msg.type === 'braille_output' && Array.isArray(msg.dots)) {
        const newDots = msg.dots
        const nextOffset = resolveOffset(newDots.length, windowSize, autoFollowRef.current, windowOffsetRef.current)
        windowOffsetRef.current = nextOffset
        setDots(newDots)
        setWindowOffset(nextOffset)
      } else if (msg.type === 'braille_text' && typeof msg.text === 'string') {
        const text = msg.text
        setHistory((prev) => [text, ...prev].slice(0, HISTORY_LIMIT))
      } else if (msg.type === 'braille_line' && typeof msg.text === 'string') {
        // Realtime STT (WebRTC or local Ctrl+Shift+S): each transcribed
        // utterance arrives as its own braille_line, already translated —
        // show it live like braille_output and keep it in history like
        // braille_text, since it carries both text and dots.
        const text = msg.text
        setHistory((prev) => [text, ...prev].slice(0, HISTORY_LIMIT))
        if (Array.isArray(msg.dots)) {
          const newDots = msg.dots
          const nextOffset = resolveOffset(newDots.length, windowSize, autoFollowRef.current, windowOffsetRef.current)
          windowOffsetRef.current = nextOffset
          setDots(newDots)
          setWindowOffset(nextOffset)
        }
      }
    }
  }, [windowSize])

  useEffect(() => {
    return () => {
      wsRef.current?.close()
    }
  }, [])

  const scrollUp = useCallback(() => {
    const nextOffset = Math.max(0, windowOffsetRef.current - windowSize)
    windowOffsetRef.current = nextOffset
    autoFollowRef.current = false
    setWindowOffset(nextOffset)
    setAutoFollow(false)
  }, [windowSize])

  const scrollDown = useCallback(() => {
    const nextOffset = Math.min(maxOffset, windowOffsetRef.current + windowSize)
    windowOffsetRef.current = nextOffset
    autoFollowRef.current = false
    setWindowOffset(nextOffset)
    setAutoFollow(false)
  }, [maxOffset, windowSize])

  const goHome = useCallback(() => {
    const nextOffset = maxOffset
    windowOffsetRef.current = nextOffset
    autoFollowRef.current = true
    setWindowOffset(nextOffset)
    setAutoFollow(true)
  }, [maxOffset])

  const slice = dots.slice(windowOffset, windowOffset + windowSize)
  const windowSlice = [...slice, ...Array(Math.max(0, windowSize - slice.length)).fill(0)]

  return {
    status,
    dots,
    windowSlice,
    windowOffset,
    windowSize,
    totalDots,
    autoFollow,
    history,
    connect,
    disconnect,
    scrollUp,
    scrollDown,
    goHome,
  }
}
