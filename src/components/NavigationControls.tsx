interface NavButtonProps {
  onClick: () => void
  disabled: boolean
  direction: 'up' | 'down'
}

export function NavButton({ onClick, disabled, direction }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-2 border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={direction === 'up' ? 'Previous line' : 'Next line'}
    >
      {direction === 'up' ? '▲' : '▼'}
    </button>
  )
}
