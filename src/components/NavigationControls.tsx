interface NavButtonProps {
  onClick: () => void
  disabled: boolean
  direction: 'up' | 'down'
}

function NavButton({ onClick, disabled, direction }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-3 border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-lg"
      aria-label={direction === 'up' ? 'Previous line' : 'Next line'}
    >
      {direction === 'up' ? '▲' : '▼'}
    </button>
  )
}

interface NavGroupProps {
  onUp: () => void
  onDown: () => void
  upDisabled: boolean
  downDisabled: boolean
}

export function NavGroup({ onUp, onDown, upDisabled, downDisabled }: NavGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <NavButton onClick={onUp} disabled={upDisabled} direction="up" />
      <NavButton onClick={onDown} disabled={downDisabled} direction="down" />
    </div>
  )
}
