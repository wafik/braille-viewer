import { useState, useEffect } from 'react'
import { LiveFeedView } from './components/LiveFeedView'
import { EditorView } from './components/EditorView'
import { TypewriterView } from './components/TypewriterView'
import { RemoteFeedView } from './components/RemoteFeedView'
import { PerCellView } from './components/PerCellView'
import { PerWordView } from './components/PerWordView'
import { initLiblouis } from './lib/liblouis'

type Tab = 'editor' | 'live-feed' | 'typewriter' | 'remote' | 'per-cell' | 'per-word'

const TABS: { id: Tab; label: string }[] = [
  { id: 'editor', label: 'Editor' },
  { id: 'live-feed', label: 'Live Feed' },
  { id: 'typewriter', label: 'Typewriter' },
  { id: 'remote', label: 'Remote' },
  { id: 'per-cell', label: 'Per Cell' },
  { id: 'per-word', label: 'Per Word' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('editor')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    initLiblouis().then(
      () => setStatus('ready'),
      (err: unknown) => {
        setError(err instanceof Error ? err.message : String(err))
        setStatus('error')
      },
    )
  }, [])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Braille Viewer</h1>
        <p className="text-muted-foreground">
          8-pin 20-cell braille display simulator.
        </p>

        <div className="flex gap-1 border-b">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {status === 'loading' && (
          <p className="text-muted-foreground italic">Loading braille tables…</p>
        )}
        {status === 'error' && (
          <p role="alert" className="text-red-600">
            Failed to load liblouis: {error}
          </p>
        )}

        {status === 'ready' && (
          <>
            {activeTab === 'editor' && <EditorView />}
            {activeTab === 'live-feed' && <LiveFeedView />}
            {activeTab === 'typewriter' && <TypewriterView />}
            {activeTab === 'remote' && <RemoteFeedView />}
            {activeTab === 'per-cell' && <PerCellView />}
            {activeTab === 'per-word' && <PerWordView />}
          </>
        )}
      </div>
    </div>
  )
}
