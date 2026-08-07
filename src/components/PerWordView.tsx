import { useMemo, useState } from 'react'
import { TextEditor } from './TextEditor'
import { LabeledCells } from './LabeledCells'
import { useDemoPlayback } from '../hooks/useDemoPlayback'
import { buildPerWordGroups } from '../lib/perWordBraille'

export function PerWordView() {
  const [text, setText] = useState('')
  const { transcript, isRunning, run: runDemo } = useDemoPlayback(setText)

  const groups = useMemo(() => buildPerWordGroups(text), [text])

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

      <p className="text-xs text-muted-foreground text-center">
        Each word's own braille cells, grouped with a gap at every space.
      </p>
      <LabeledCells
        groups={groups}
        emptyMessage="Type something or run the demo to see each word's braille cells grouped..."
      />
    </div>
  )
}
