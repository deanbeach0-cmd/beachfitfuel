import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center' | 'right'
  className?: string
  titleClassName?: string
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
  titleClassName,
}: SectionHeaderProps) {
  const alignClass = {
    left:   'text-left items-start',
    center: 'text-center items-center',
    right:  'text-right items-end',
  }[align]

  return (
    <div className={cn('flex flex-col gap-2', alignClass, className)}>
      {eyebrow && (
        <span className="font-body font-800 text-sm tracking-[0.2em] uppercase text-teal">
          {eyebrow}
        </span>
      )}
      <h2 className={cn('font-display text-4xl md:text-5xl tracking-wide text-dark leading-tight', titleClassName)}>
        {title}
      </h2>
      {subtitle && (
        <p className="font-body text-base md:text-lg text-dark/70 max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  )
}
