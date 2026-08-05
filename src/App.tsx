import { useEffect, useCallback } from 'react'
import { TextEditor } from './components/TextEditor'
import { BrailleLine } from './components/BrailleLine'
import { NavigationControls } from './components/NavigationControls'
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
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [scrollUp, scrollDown])

  const currentDots = lines[currentLineIndex] ?? []

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Braille Viewer</h1>
        <p className="text-muted-foreground">
          8-pin 20-cell braille display. Type text below and navigate with arrow keys.
        </p>

        <TextEditor onTextChange={handleTextChange} />

        <div className="space-y-4">
          <BrailleLine dots={currentDots} />
          <NavigationControls
            currentLine={currentLineIndex}
            totalLines={totalLines}
            onPrev={scrollUp}
            onNext={scrollDown}
          />
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
