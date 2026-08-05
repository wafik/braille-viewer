import { useCallback } from 'react'
import { TextEditor } from './TextEditor'
import { BrailleLine } from './BrailleLine'
import { NavGroup } from './NavigationControls'
import { dotsToUnicodeBraille } from '../lib/braille'
import { useTypewriter } from '../hooks/useTypewriter'

export function TypewriterView() {
  const {
    windowSlice,
    totalDots,
    handleInput,
  } = useTypewriter()

  const handleTextChange = useCallback((text: string) => {
    handleInput(text)
  }, [handleInput])

  const fullBraille = dotsToUnicodeBraille(
    totalDots > 0 ? windowSlice : []
  )

  return (
    <div className="space-y-6">
      <TextEditor onTextChange={handleTextChange} />

      <div className="space-y-2">
        <div className="flex items-center justify-center gap-4">
          <NavGroup
            onUp={() => {}}
            onDown={() => {}}
            upDisabled={true}
            downDisabled={true}
          />
          <BrailleLine dots={windowSlice} empty={totalDots === 0} />
          <NavGroup
            onUp={() => {}}
            onDown={() => {}}
            upDisabled={true}
            downDisabled={true}
          />
        </div>
        {totalDots > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            {totalDots} braille chars
          </p>
        )}
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
