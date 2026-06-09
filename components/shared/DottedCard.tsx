import { cn } from '@/lib/utils'

interface DottedCardProps {
  children: React.ReactNode
  className?: string
  borderColor?: string
  rounded?: string
}

export function DottedCard({
  children,
  className,
  borderColor = 'rgba(255,255,255,0.6)',
  rounded = '1rem',
}: DottedCardProps) {
  return (
    <div
      className={cn('p-6', className)}
      style={{
        border: `3px dotted ${borderColor}`,
        borderRadius: rounded,
      }}
    >
      {children}
    </div>
  )
}
