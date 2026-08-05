import { useEffect, useCallback } from 'react'
import { TextEditor } from './TextEditor'
import { BrailleLine } from './BrailleLine'
import { NavGroup } from './NavigationControls'
import { useLiveFeed } from '../hooks/useLiveFeed'

export function LiveFeedView() {
  const {
    lines,
    currentLineIndex,
    totalLines,
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

  const currentDots = lines[currentLineIndex] ?? []

  return (
    <div className="space-y-6">
      <TextEditor onTextChange={handleTextChange} />

      <div className="space-y-2">
        <div className="flex items-center justify-center gap-4">
          <NavGroup
            onUp={scrollUp}
            onDown={scrollDown}
            upDisabled={currentLineIndex === 0 || totalLines === 0}
            downDisabled={currentLineIndex >= totalLines - 1 || totalLines === 0}
          />
          <BrailleLine dots={currentDots} empty={totalLines === 0} />
          <NavGroup
            onUp={scrollUp}
            onDown={scrollDown}
            upDisabled={currentLineIndex === 0 || totalLines === 0}
            downDisabled={currentLineIndex >= totalLines - 1 || totalLines === 0}
          />
        </div>
        {totalLines > 0 && (
          <div className="flex items-center justify-center gap-4">
            <p className="text-sm text-muted-foreground">
              Line {currentLineIndex + 1} of {totalLines}
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

      {totalLines === 0 && (
        <p className="text-center text-muted-foreground italic">
          Type or paste text — display follows the end automatically...
        </p>
      )}
    </div>
  )
}
