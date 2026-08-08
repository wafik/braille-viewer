import { useEffect, useState } from 'react'

interface UseGroupStepper {
  currentIndex: number
  isPlaying: boolean
  stepPrev: () => void
  stepNext: () => void
  resume: () => void
  reset: () => void
}

/**
 * Steps through group indexes one at a time on a timer, like spelling a
 * sentence out loud, instead of revealing every group at once. Manual
 * stepping pauses the timer; resume() continues from where it paused.
 * reset() jumps back to index 0 and resumes — call it when the caller
 * knows playback is starting over (e.g. a demo re-run), since growing
 * groupCount alone can't tell "new sentence" apart from "sentence grew".
 */
export function useGroupStepper(groupCount: number, intervalMs: number): UseGroupStepper {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    setCurrentIndex(prev => Math.min(prev, Math.max(0, groupCount - 1)))
  }, [groupCount])

  useEffect(() => {
    if (!isPlaying || groupCount === 0) return
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1 < groupCount ? prev + 1 : prev))
    }, intervalMs)
    return () => clearInterval(timer)
  }, [isPlaying, groupCount, intervalMs])

  const stepPrev = () => {
    setIsPlaying(false)
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }

  const stepNext = () => {
    setIsPlaying(false)
    setCurrentIndex(prev => Math.min(Math.max(0, groupCount - 1), prev + 1))
  }

  const resume = () => setIsPlaying(true)

  const reset = () => {
    setCurrentIndex(0)
    setIsPlaying(true)
  }

  return { currentIndex, isPlaying, stepPrev, stepNext, resume, reset }
}
