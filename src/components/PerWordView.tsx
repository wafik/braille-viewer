import { useMemo, useState } from 'react'
import { TextEditor } from './TextEditor'
import { BrailleLine } from './BrailleLine'
import { NavGroup } from './NavigationControls'
import { useDemoPlayback } from '../hooks/useDemoPlayback'
import { useGroupStepper } from '../hooks/useGroupStepper'
import { buildPerWordGroups } from '../lib/perWordBraille'

// ponytail: word-spelling pace, a bit slower than per-cell since a word is
// a bigger chunk to read; tune here if it feels too fast/slow.
const STEP_INTERVAL_MS = 650

export function PerWordView() {
  const [text, setText] = useState('')
  const { transcript, isRunning, run: runDemo } = useDemoPlayback(setText)

  const groups = useMemo(() => buildPerWordGroups(text), [text])
  const { currentIndex, isPlaying, stepPrev, stepNext, resume, reset } = useGroupStepper(groups.length, STEP_INTERVAL_MS)

  const totalGroups = groups.length
  const currentGroup = groups[currentIndex]

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
            upDisabled={currentIndex === 0 || totalGroups === 0}
            downDisabled={currentIndex >= totalGroups - 1 || totalGroups === 0}
          />
          <BrailleLine
            dots={currentGroup?.dots ?? []}
            cellCount={Math.max(1, currentGroup?.dots.length ?? 1)}
            empty={totalGroups === 0}
          />
          <NavGroup
            onUp={stepPrev}
            onDown={stepNext}
            upDisabled={currentIndex === 0 || totalGroups === 0}
            downDisabled={currentIndex >= totalGroups - 1 || totalGroups === 0}
          />
        </div>
        {totalGroups > 0 && (
          <div className="flex items-center justify-center gap-4">
            <p className="text-sm text-muted-foreground">
              Word {currentIndex + 1} of {totalGroups} (grade 2, spelled out)
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
          <p className="text-xs text-muted-foreground mb-1">Current word:</p>
          <p className="text-lg font-mono">{currentGroup?.label}</p>
        </div>
      )}

      {totalGroups === 0 && (
        <p className="text-center text-muted-foreground italic">
          Type something or run the demo to spell it out one word at a time...
        </p>
      )}
    </div>
  )
}
