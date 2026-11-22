export const SPACING_TOKENS = {
  baseUnitPx: 4,
  baseUnitRem: '0.25rem',
  scale: {
    0: { rem: '0rem', px: 0 },
    1: { rem: '0.25rem', px: 4 },
    2: { rem: '0.5rem', px: 8 },
    3: { rem: '0.75rem', px: 12 },
    4: { rem: '1rem', px: 16 },
    5: { rem: '1.25rem', px: 20 },
    6: { rem: '1.5rem', px: 24 },
    8: { rem: '2rem', px: 32 },
    10: { rem: '2.5rem', px: 40 },
    12: { rem: '3rem', px: 48 },
    16: { rem: '4rem', px: 64 },
  },
  semantic: {
    inset: {
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    stack: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    layout: {
      sidebarWidth: '16rem',
      headerHeight: '4rem',
      contentMaxWidth: '75rem',
    },
  },
} as const

export const SPACING_CLASSES = {
  pageContainer:
    'mx-auto w-full max-w-content px-inset-md py-inset-lg sm:px-inset-lg lg:px-inset-xl',
  centeredShell:
    'flex min-h-svh items-center justify-center p-inset-md sm:p-inset-lg',
  cardPadding: 'p-inset-lg sm:p-inset-xl',
  cardPaddingCompact: 'p-inset-md sm:p-inset-lg',
  sectionStack: 'flex flex-col gap-stack-lg sm:gap-stack-xl',
  formStack: 'flex flex-col gap-stack-md',
  fieldStack: 'flex flex-col gap-stack-xs',
  inlineGroup: 'flex flex-wrap items-center gap-stack-sm',
  cardGrid:
    'grid grid-cols-1 gap-stack-md sm:grid-cols-2 lg:grid-cols-3 lg:gap-stack-lg',
} as const

export type SpacingTokens = typeof SPACING_TOKENS
export type SpacingPreset = keyof typeof SPACING_CLASSES
