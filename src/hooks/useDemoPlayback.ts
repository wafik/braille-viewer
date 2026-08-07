import { useCallback, useEffect, useRef, useState } from 'react'
import { DEMO_CHUNKS } from '../lib/demoText'

// ponytail: real VAD windows are ~7s; a literal 7s-per-chunk demo would take
// nearly 30s to finish. This uses a short, fixed interval instead — snappy,
// still visibly "arriving in pieces" rather than one instant text dump.
export const DEMO_CHUNK_INTERVAL_MS = 1500

interface UseDemoPlayback {
  transcript: string
  isRunning: boolean
  run: () => void
}

export function useDemoPlayback(onChunk: (accumulatedText: string) => void): UseDemoPlayback {
  const [transcript, setTranscript] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [])

  const run = useCallback(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current)
    setIsRunning(true)

    const spoken: string[] = []
    const playChunk = (index: number) => {
      spoken.push(DEMO_CHUNKS[index])
      const accumulated = spoken.join(' ')
      setTranscript(accumulated)
      onChunk(accumulated)
      if (index + 1 < DEMO_CHUNKS.length) {
        timerRef.current = setTimeout(() => playChunk(index + 1), DEMO_CHUNK_INTERVAL_MS)
      } else {
        timerRef.current = null
        setIsRunning(false)
      }
    }
    playChunk(0)
  }, [onChunk])

  return { transcript, isRunning, run }
}
