interface WaveDividerProps {
  fromColor: string
  toColor: string
  className?: string
}

export function WaveDivider({ fromColor, toColor, className }: WaveDividerProps) {
  return (
    <div className={className} style={{ backgroundColor: fromColor, lineHeight: 0 }}>
      <svg
        viewBox="0 0 1440 72"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', width: '100%', height: '72px' }}
        fill={toColor}
      >
        <path d="M0,36 C240,72 480,0 720,36 C960,72 1200,0 1440,36 L1440,72 L0,72 Z" />
      </svg>
    </div>
  )
}
