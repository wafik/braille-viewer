import { useCallback } from 'react'
import { BrailleLine } from './BrailleLine'
import { dotsToUnicodeBraille } from '../lib/braille'
import { useTypewriter } from '../hooks/useTypewriter'

export function TypewriterView() {
  const {
    windowSlice,
    totalDots,
    inputText,
    handleInput,
    clear,
  } = useTypewriter()

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInput(e.target.value)
  }, [handleInput])

  const fullBraille = dotsToUnicodeBraille(
    inputText.length > 0 ? Array.from({ length: totalDots }, (_, i) => windowSlice[i] ?? 0) : []
  )

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="typewriter-input" className="block text-sm font-medium">
          Type here — characters appear on braille display immediately
        </label>
        <div className="flex gap-2">
          <input
            id="typewriter-input"
            type="text"
            value={inputText}
            onChange={handleChange}
            placeholder="Start typing..."
            className="flex-1 h-12 px-4 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            onClick={clear}
            className="px-4 h-12 border rounded-lg hover:bg-muted text-sm"
          >
            Clear
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {inputText.length} characters typed
        </p>
      </div>

      <div className="flex items-center justify-center">
        <BrailleLine dots={windowSlice} empty={totalDots === 0} />
      </div>

      {totalDots > 0 && (
        <div className="p-3 bg-muted rounded-lg border">
          <p className="text-xs text-muted-foreground mb-1">Full braille ({totalDots} chars):</p>
          <p className="text-lg font-mono break-all leading-relaxed">{fullBraille}</p>
        </div>
      )}

      {totalDots === 0 && (
        <p className="text-center text-muted-foreground italic">
          Type something — each character appears on the braille display...
        </p>
      )}
    </div>
  )
}
