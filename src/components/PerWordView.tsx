import { useMemo, useState } from 'react'
import { TextEditor } from './TextEditor'
import { BrailleLine } from './BrailleLine'
import { NavGroup } from './NavigationControls'
import { useDemoPlayback } from '../hooks/useDemoPlayback'
import { usePagedGroups } from '../hooks/usePagedGroups'
import { buildPerWordGroups } from '../lib/perWordBraille'

export function PerWordView() {
  const [text, setText] = useState('')
  const { transcript, isRunning, run: runDemo } = useDemoPlayback(setText)

  const groups = useMemo(() => buildPerWordGroups(text), [text])
  const {
    windowSlice,
    windowOffset,
    windowSize,
    totalDots,
    autoFollow,
    visibleLabels,
    scrollUp,
    scrollDown,
    goHome,
  } = usePagedGroups(groups)

  const cellFrom = windowOffset + 1
  const cellTo = Math.min(windowOffset + windowSize, totalDots)
  const visibleText = visibleLabels.join(' ')

  return (
    <div className="space-y-6">
      <TextEditor onTextChange={setText} />
      <div className="flex items-center gap-2">
        <button
          onClick={runDemo}
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
              Cells {cellFrom}–{cellTo} of {totalDots} (grade 2, per word)
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
        <div className="p-3 bg-muted rounded-lg border">
          <p className="text-xs text-muted-foreground mb-1">Current word(s) (this window):</p>
          <p className="text-lg font-mono">{visibleText}</p>
        </div>
      )}

      {totalDots === 0 && (
        <p className="text-center text-muted-foreground italic">
          Type something or run the demo to see each word's own braille cells...
        </p>
      )}
    </div>
  )
}
