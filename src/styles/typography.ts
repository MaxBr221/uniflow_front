export const TYPOGRAPHY_TOKENS = {
  families: {
    sans: "'Inter Variable', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    display:
      "'Plus Jakarta Sans Variable', 'Inter Variable', system-ui, sans-serif",
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  scale: {
    display: {
      size: '2rem',
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
      weight: 700,
    },
    headingLg: {
      size: '1.5rem',
      lineHeight: 1.25,
      letterSpacing: '-0.02em',
      weight: 600,
    },
    headingMd: {
      size: '1.25rem',
      lineHeight: 1.3,
      letterSpacing: '-0.015em',
      weight: 600,
    },
    headingSm: {
      size: '1.0625rem',
      lineHeight: 1.4,
      letterSpacing: '0em',
      weight: 600,
    },
    body: {
      size: '0.9375rem',
      lineHeight: 1.6,
      letterSpacing: '0em',
      weight: 400,
    },
    bodySm: {
      size: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0em',
      weight: 400,
    },
    caption: {
      size: '0.75rem',
      lineHeight: 1.4,
      letterSpacing: '0.01em',
      weight: 500,
    },
  },
} as const

export const TYPOGRAPHY_CLASSES = {
  display: 'font-display text-display font-bold text-ink-primary',
  headingLg: 'font-display text-heading-lg font-semibold text-ink-primary',
  headingMd: 'font-display text-heading-md font-semibold text-ink-primary',
  headingSm: 'font-display text-heading-sm font-semibold text-ink-primary',
  body: 'font-sans text-body text-ink-secondary',
  bodySm: 'font-sans text-body-sm text-ink-secondary',
  caption: 'font-sans text-caption text-ink-muted',
  label: 'font-sans text-body-sm font-medium text-ink-primary',
  metric: 'font-display font-bold tabular-nums text-ink-primary',
} as const

export type TypographyTokens = typeof TYPOGRAPHY_TOKENS
export type TypographyRole = keyof typeof TYPOGRAPHY_CLASSES
