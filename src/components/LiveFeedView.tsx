import { useEffect, useCallback } from 'react'
import { TextEditor } from './TextEditor'
import { BrailleLine } from './BrailleLine'
import { NavGroup } from './NavigationControls'
import { useLiveFeed } from '../hooks/useLiveFeed'
import { dotsToUnicodeBraille } from '../lib/braille'

export function LiveFeedView() {
  const {
    dots,
    windowSlice,
    windowOffset,
    windowSize,
    totalDots,
    autoFollow,
    scrollUp,
    scrollDown,
    goHome,
    setText,
  } = useLiveFeed()

  const handleTextChange = useCallback((text: string) => {
    setText(text)
  }, [setText])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        scrollUp()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        scrollDown()
      } else if (e.key === 'Home') {
        e.preventDefault()
        goHome()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [scrollUp, scrollDown, goHome])

  const cellFrom = windowOffset + 1
  const cellTo = Math.min(windowOffset + windowSize, totalDots)
  const fullBraille = dotsToUnicodeBraille(dots)
  const windowBraille = dotsToUnicodeBraille(windowSlice)

  return (
    <div className="space-y-6">
      <TextEditor onTextChange={handleTextChange} />

      <div className="space-y-2">
        <div className="flex items-center justify-center gap-4">
          <NavGroup
            onUp={scrollUp}
            onDown={scrollDown}
            upDisabled={windowOffset === 0 || totalDots === 0}
            downDisabled={windowOffset >= Math.max(0, totalDots - windowSize) || totalDots === 0}
          />
          <BrailleLine dots={windowSlice} empty={totalDots === 0} />
          <NavGroup
            onUp={scrollUp}
            onDown={scrollDown}
            upDisabled={windowOffset === 0 || totalDots === 0}
            downDisabled={windowOffset >= Math.max(0, totalDots - windowSize) || totalDots === 0}
          />
        </div>
        {totalDots > 0 && (
          <div className="flex items-center justify-center gap-4">
            <p className="text-sm text-muted-foreground">
              Cells {cellFrom}–{cellTo} of {totalDots}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded ${autoFollow ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {autoFollow ? 'Auto-follow ON' : 'Auto-follow OFF'}
            </span>
            {!autoFollow && (
              <button
                onClick={goHome}
                className="text-xs px-2 py-0.5 border rounded hover:bg-muted"
              >
                Home (re-follow)
              </button>
            )}
          </div>
        )}
      </div>

      {totalDots > 0 && (
        <div className="space-y-3">
          <div className="p-3 bg-muted rounded-lg border">
            <p className="text-xs text-muted-foreground mb-1">Full braille ({totalDots} chars):</p>
            <p className="text-lg font-mono break-all leading-relaxed">{fullBraille}</p>
          </div>
          <div className="p-3 bg-muted rounded-lg border">
            <p className="text-xs text-muted-foreground mb-1">Window ({cellFrom}–{cellTo}):</p>
            <p className="text-lg font-mono break-all leading-relaxed">{windowBraille}</p>
          </div>
        </div>
      )}

      {totalDots === 0 && (
        <p className="text-center text-muted-foreground italic">
          Type or paste text — display follows the end automatically...
        </p>
      )}
    </div>
  )
}
