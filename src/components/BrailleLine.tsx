import { BrailleCell } from './BrailleCell'

interface BrailleLineProps {
  dots: number[]
  cellCount?: number
}

export function BrailleLine({ dots, cellCount = 20 }: BrailleLineProps) {
  const padded = [...dots, ...Array(Math.max(0, cellCount - dots.length)).fill(0)]

  return (
    <div
      className="flex justify-center gap-1 p-4 bg-muted rounded-lg border"
      aria-label="Braille line display"
    >
      {padded.slice(0, cellCount).map((byte, i) => (
        <div key={i} data-testid="braille-cell">
          <BrailleCell dotByte={byte} size="md" />
        </div>
      ))}
    </div>
  )
}
