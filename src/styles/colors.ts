export const COLOR_PALETTE = {
  brand: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },
  surface: {
    canvas: '#f8f7fc',
    card: '#ffffff',
    subtle: '#f3f1fb',
    muted: '#ebe7f7',
  },
  border: {
    subtle: '#e5e0f5',
    default: '#d4cce9',
    strong: '#b9add8',
    focus: '#7c3aed',
  },
  ink: {
    primary: '#17153b',
    secondary: '#474469',
    muted: '#6c688a',
    inverse: '#ffffff',
  },
  status: {
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      600: '#059669',
      700: '#047857',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      600: '#d97706',
      700: '#b45309',
    },
    danger: {
      50: '#fff1f2',
      100: '#ffe4e6',
      200: '#fecdd3',
      600: '#e11d48',
      700: '#be123c',
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      600: '#2563eb',
      700: '#1d4ed8',
    },
  },
} as const

export type ColorPalette = typeof COLOR_PALETTE
