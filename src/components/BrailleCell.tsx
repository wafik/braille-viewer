interface BrailleCellProps {
  dotByte: number
  size?: 'sm' | 'md' | 'lg'
}

// Standard braille dot positions:
//  dot1  dot4   (bit0  bit3)
//  dot2  dot5   (bit1  bit4)
//  dot3  dot6   (bit2  bit5)
//  dot7  dot8   (bit6  bit7)
const DOT_POSITIONS = [
  { col: 0, row: 0, bit: 0 }, // dot1
  { col: 0, row: 1, bit: 1 }, // dot2
  { col: 0, row: 2, bit: 2 }, // dot3
  { col: 1, row: 0, bit: 3 }, // dot4
  { col: 1, row: 1, bit: 4 }, // dot5
  { col: 1, row: 2, bit: 5 }, // dot6
  { col: 0, row: 3, bit: 6 }, // dot7
  { col: 1, row: 3, bit: 7 }, // dot8
]

const SIZE_CONFIG = {
  sm: { cellW: 12, cellH: 20, r: 2, gap: 5 },
  md: { cellW: 18, cellH: 28, r: 3, gap: 7 },
  lg: { cellW: 28, cellH: 42, r: 5, gap: 11 },
}

export function BrailleCell({ dotByte, size = 'md' }: BrailleCellProps) {
  const { cellW, cellH, r, gap } = SIZE_CONFIG[size]

  return (
    <svg width={cellW} height={cellH} viewBox={`0 0 ${cellW} ${cellH}`} aria-hidden="true">
      {DOT_POSITIONS.map(({ col, row, bit }) => {
        const raised = (dotByte & (1 << bit)) !== 0
        const cx = r + col * gap
        const cy = r + row * gap

        return (
          <circle
            key={bit}
            cx={cx}
            cy={cy}
            r={r}
            fill={raised ? 'currentColor' : 'transparent'}
            stroke={raised ? 'none' : 'currentColor'}
            strokeWidth={raised ? 0 : 1}
            opacity={raised ? 1 : 0.2}
            filter={raised ? 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))' : undefined}
          />
        )
      })}
    </svg>
  )
}
