import { useCallback, useEffect, useState } from 'react'
import { BrailleLine } from './BrailleLine'
import { NavGroup } from './NavigationControls'
import { useRemoteFeed, type RemoteFeedStatus } from '../hooks/useRemoteFeed'

const STORAGE_KEY = 'braille-viewer:remote-host'

const STATUS_LABEL: Record<RemoteFeedStatus, string> = {
  idle: 'Not connected',
  connecting: 'Connecting…',
  connected: 'Connected',
  error: 'Connection error',
}

const STATUS_STYLE: Record<RemoteFeedStatus, string> = {
  idle: 'bg-gray-100 text-gray-700',
  connecting: 'bg-yellow-100 text-yellow-700',
  connected: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
}

export function RemoteFeedView() {
  const [host, setHost] = useState(() => localStorage.getItem(STORAGE_KEY) ?? 'localhost:8765')
  const {
    status,
    windowSlice,
    windowOffset,
    windowSize,
    totalDots,
    autoFollow,
    history,
    connect,
    disconnect,
    scrollUp,
    scrollDown,
    goHome,
  } = useRemoteFeed()
  const isLive = status === 'connected' || status === 'connecting'

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, host.trim())
  }, [host])

  const handleToggle = useCallback(() => {
    if (isLive) {
      disconnect()
      return
    }
    connect(host.trim())
  }, [isLive, host, connect, disconnect])

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <label htmlFor="remote-host" className="text-sm font-medium">
          Daemon address
        </label>
        <input
          id="remote-host"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="192.168.1.42:8765"
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleToggle}
          className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-muted"
        >
          {isLive ? 'Disconnect' : 'Connect'}
        </button>
        <span className={`text-xs px-2 py-0.5 rounded ${STATUS_STYLE[status]}`}>
          {STATUS_LABEL[status]}
        </span>
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

      {totalDots === 0 && (
        <p className="text-center text-muted-foreground italic">
          Enter the daemon's ws://host:port and press Connect — live braille output appears here.
        </p>
      )}

      {history.length > 0 && (
        <div className="p-3 bg-muted rounded-lg border space-y-1">
          <p className="text-xs text-muted-foreground mb-1">
            Recent sentences ({history.length}):
          </p>
          {history.map((line, i) => (
            <p key={i} className="text-sm">{line}</p>
          ))}
        </div>
      )}
    </div>
  )
}
