interface NavigationControlsProps {
  currentLine: number
  totalLines: number
  onPrev: () => void
  onNext: () => void
}

export function NavigationControls({ currentLine, totalLines, onPrev, onNext }: NavigationControlsProps) {
  if (totalLines === 0) return null

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={onPrev}
        disabled={currentLine === 0}
        className="px-3 py-1 border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous line"
      >
        ◀
      </button>
      <span className="text-sm text-muted-foreground">
        Line {currentLine + 1} of {totalLines}
      </span>
      <button
        onClick={onNext}
        disabled={currentLine >= totalLines - 1}
        className="px-3 py-1 border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next line"
      >
        ▶
      </button>
    </div>
  )
}
