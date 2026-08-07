import { BrailleCell } from './BrailleCell'
import type { CellGroup } from '../lib/braille'

interface LabeledCellsProps {
  groups: CellGroup[]
  emptyMessage: string
}

export function LabeledCells({ groups, emptyMessage }: LabeledCellsProps) {
  if (groups.length === 0) {
    return <p className="text-center text-muted-foreground italic">{emptyMessage}</p>
  }

  return (
    <div
      className="flex flex-wrap justify-center gap-3 p-4 bg-muted rounded-lg border"
      aria-label="Labeled braille cell groups"
    >
      {groups.map((group, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <span className="text-xs font-mono text-muted-foreground h-4">{group.label}</span>
          <div className="flex gap-0.5">
            {group.dots.map((dotByte, j) => (
              <BrailleCell key={j} dotByte={dotByte} size="md" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
