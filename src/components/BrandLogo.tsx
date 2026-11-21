import { useId } from 'react'
import { BRAND_IDENTITY } from '@/lib/brand.ts'

export type BrandLogoSize = 'sm' | 'md' | 'lg'
export type BrandLogoVariant = 'full' | 'mark'

interface SizeConfig {
  readonly iconPixels: number
  readonly titleClass: string
  readonly taglineClass: string
  readonly gapClass: string
}

const SIZE_CONFIG_MAP: Record<BrandLogoSize, SizeConfig> = {
  sm: {
    iconPixels: 28,
    titleClass: 'text-base',
    taglineClass: 'text-[11px]',
    gapClass: 'gap-2.5',
  },
  md: {
    iconPixels: 34,
    titleClass: 'text-lg',
    taglineClass: 'text-xs',
    gapClass: 'gap-3',
  },
  lg: {
    iconPixels: 42,
    titleClass: 'text-xl',
    taglineClass: 'text-xs',
    gapClass: 'gap-3.5',
  },
}

export interface BrandLogoMarkProps {
  size?: BrandLogoSize
  label?: string
  decorative?: boolean
  className?: string
}

export function BrandLogoMark({
  size = 'md',
  label = BRAND_IDENTITY.name,
  decorative = false,
  className,
}: BrandLogoMarkProps) {
  const gradientId = useId()
  const { iconPixels } = SIZE_CONFIG_MAP[size]

  return (
    <svg
      width={iconPixels}
      height={iconPixels}
      viewBox="0 0 32 32"
      fill="none"
      className={className ? `shrink-0 ${className}` : 'shrink-0'}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="3"
          y1="2"
          x2="29"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${gradientId})`} />
      <path
        d="M9.5 10.5V16.5C9.5 20.09 12.41 23 16 23C19.59 23 22.5 20.09 22.5 16.5V10.5"
        stroke="#ffffff"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M13 13.25C14.2 11.4 16 10.25 18 10.25"
        stroke="#ddd6fe"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="22.5" cy="10.25" r="1.75" fill="#ede9fe" />
    </svg>
  )
}

export interface BrandLogoProps {
  variant?: BrandLogoVariant
  size?: BrandLogoSize
  showTagline?: boolean
  label?: string
  className?: string
}

export function BrandLogo({
  variant = 'full',
  size = 'md',
  showTagline = false,
  label = BRAND_IDENTITY.name,
  className,
}: BrandLogoProps) {
  const config = SIZE_CONFIG_MAP[size]

  if (variant === 'mark') {
    return <BrandLogoMark size={size} label={label} className={className} />
  }

  return (
    <div
      className={`inline-flex items-center ${config.gapClass}${className ? ` ${className}` : ''}`}
    >
      <BrandLogoMark size={size} decorative />
      <div className="flex flex-col leading-tight">
        <span
          className={`font-display ${config.titleClass} text-ink-primary font-bold tracking-tight`}
        >
          {BRAND_IDENTITY.name}
        </span>
        {showTagline ? (
          <span className={`${config.taglineClass} text-brand-700 font-medium`}>
            {BRAND_IDENTITY.tagline}
          </span>
        ) : null}
      </div>
    </div>
  )
}
