import type { LucideIcon, LucideProps } from 'lucide-react'

export type AppIconSize = 'xs' | 'sm' | 'md' | 'lg'

const ICON_SIZE_MAP: Record<AppIconSize, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
}

export interface AppIconProps extends Omit<
  LucideProps,
  'ref' | 'size' | 'aria-label'
> {
  icon: LucideIcon
  size?: AppIconSize
  /** Accessible label when the icon is informative; decorative icons omit it. */
  label?: string
}

export function AppIcon({
  icon: IconComponent,
  size = 'sm',
  label,
  strokeWidth = 1.75,
  className,
  ...props
}: AppIconProps) {
  const pixelSize = ICON_SIZE_MAP[size]
  const isDecorative = !label

  return (
    <IconComponent
      size={pixelSize}
      strokeWidth={strokeWidth}
      className={className}
      aria-label={label}
      aria-hidden={isDecorative ? true : undefined}
      role={isDecorative ? undefined : 'img'}
      {...props}
    />
  )
}
