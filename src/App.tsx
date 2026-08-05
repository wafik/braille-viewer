import { useEffect, useCallback } from 'react'
import { TextEditor } from './components/TextEditor'
import { BrailleLine } from './components/BrailleLine'
import { NavGroup } from './components/NavigationControls'
import { useBrailleViewer } from './hooks/useBrailleViewer'
import { initLiblouis } from './lib/liblouis'

export default function App() {
  const {
    lines,
    currentLineIndex,
    totalLines,
    scrollUp,
    scrollDown,
    goToLine,
    setText,
  } = useBrailleViewer()

  useEffect(() => {
    initLiblouis().catch(console.error)
  }, [])

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
      } else if (e.key === 'PageUp') {
        e.preventDefault()
        goToLine(Math.max(0, currentLineIndex - 10))
      } else if (e.key === 'PageDown') {
        e.preventDefault()
        goToLine(Math.min(totalLines - 1, currentLineIndex + 10))
      } else if (e.key === 'Home') {
        e.preventDefault()
        goToLine(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        goToLine(totalLines - 1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [scrollUp, scrollDown, goToLine, currentLineIndex, totalLines])

  const currentDots = lines[currentLineIndex] ?? []

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Braille Viewer</h1>
        <p className="text-muted-foreground">
          8-pin 20-cell braille display. Type text below and navigate with arrow keys.
        </p>

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
            <p className="text-sm text-muted-foreground text-center">
              Line {currentLineIndex + 1} of {totalLines}
            </p>
          )}
        </div>

        {totalLines === 0 && (
          <p className="text-center text-muted-foreground italic">
            Type something to see braille output...
          </p>
        )}
      </div>
    </div>
  )
}
