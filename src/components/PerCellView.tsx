import { useMemo, useState } from 'react'
import { TextEditor } from './TextEditor'
import { BrailleLine } from './BrailleLine'
import { NavGroup } from './NavigationControls'
import { useDemoPlayback } from '../hooks/useDemoPlayback'
import { useSpelledLine } from '../hooks/useSpelledLine'
import { buildPerCellGroups } from '../lib/perCellBraille'

// ponytail: character-spelling pace; tune here if it feels too fast/slow.
const STEP_INTERVAL_MS = 450

export function PerCellView() {
  const [text, setText] = useState('')
  const { transcript, isRunning, run: runDemo } = useDemoPlayback(setText)

  const groups = useMemo(() => buildPerCellGroups(text), [text])
  const {
    windowSlice,
    windowSize,
    totalGroups,
    currentGroupIndex,
    visibleLabels,
    isPlaying,
    stepPrev,
    stepNext,
    resume,
    reset,
  } = useSpelledLine(groups, STEP_INTERVAL_MS)

  const visibleText = visibleLabels.map(label => (label === '' ? ' ' : label)).join('')

  const handleRunDemo = () => {
    reset()
    runDemo()
  }

  return (
    <div className="space-y-6">
      <TextEditor onTextChange={setText} />
      <div className="flex items-center gap-2">
        <button
          onClick={handleRunDemo}
          disabled={isRunning}
          className="px-3 py-2 text-sm font-medium border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? 'Running…' : 'Run Demo'}
        </button>
        {transcript && <p className="text-sm text-muted-foreground italic">"{transcript}"</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-center gap-4">
          <NavGroup
            onUp={stepPrev}
            onDown={stepNext}
            upDisabled={currentGroupIndex === 0 || totalGroups === 0}
            downDisabled={currentGroupIndex >= totalGroups - 1 || totalGroups === 0}
          />
          <BrailleLine dots={windowSlice} cellCount={windowSize} empty={totalGroups === 0} />
          <NavGroup
            onUp={stepPrev}
            onDown={stepNext}
            upDisabled={currentGroupIndex === 0 || totalGroups === 0}
            downDisabled={currentGroupIndex >= totalGroups - 1 || totalGroups === 0}
          />
        </div>
        {totalGroups > 0 && (
          <div className="flex items-center justify-center gap-4">
            <p className="text-sm text-muted-foreground">
              Character {currentGroupIndex + 1} of {totalGroups} (grade 1, spelled out)
            </p>
            <span className={`text-xs px-2 py-0.5 rounded ${isPlaying ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {isPlaying ? 'Spelling…' : 'Paused'}
            </span>
            {!isPlaying && (
              <button
                onClick={resume}
                className="text-xs px-2 py-0.5 border rounded hover:bg-muted"
              >
                Resume spelling
              </button>
            )}
          </div>
        )}
      </div>

      {totalGroups > 0 && (
        <div className="p-3 bg-muted rounded-lg border">
          <p className="text-xs text-muted-foreground mb-1">Current line's text:</p>
          <p className="text-lg font-mono">{visibleText}</p>
        </div>
      )}

      {totalGroups === 0 && (
        <p className="text-center text-muted-foreground italic">
          Type something or run the demo to spell it out one character at a time...
        </p>
      )}
    </div>
  )
}
