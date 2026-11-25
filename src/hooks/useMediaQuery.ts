import { useCallback, useSyncExternalStore } from 'react'

export const BREAKPOINT_QUERIES = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
} as const

export type BreakpointName = 'mobile' | 'tablet' | 'desktop'

export interface UseBreakpointResult {
  isSmUp: boolean
  isMdUp: boolean
  isLgUp: boolean
  isXlUp: boolean
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  current: BreakpointName
}

function getMediaQueryList(query: string): MediaQueryList | null {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return null
  }
  return window.matchMedia(query)
}

export function useMediaQuery(query: string, defaultMatches = false): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mediaQueryList = getMediaQueryList(query)
      if (!mediaQueryList) {
        return () => {}
      }

      if (typeof mediaQueryList.addEventListener === 'function') {
        mediaQueryList.addEventListener('change', onStoreChange)
        return () => {
          mediaQueryList.removeEventListener('change', onStoreChange)
        }
      }

      mediaQueryList.addListener(onStoreChange)
      return () => {
        mediaQueryList.removeListener(onStoreChange)
      }
    },
    [query],
  )

  const getSnapshot = useCallback(() => {
    const mediaQueryList = getMediaQueryList(query)
    return mediaQueryList ? mediaQueryList.matches : defaultMatches
  }, [query, defaultMatches])

  const getServerSnapshot = useCallback(() => defaultMatches, [defaultMatches])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function useBreakpoint(): UseBreakpointResult {
  const isSmUp = useMediaQuery(BREAKPOINT_QUERIES.sm)
  const isMdUp = useMediaQuery(BREAKPOINT_QUERIES.md)
  const isLgUp = useMediaQuery(BREAKPOINT_QUERIES.lg)
  const isXlUp = useMediaQuery(BREAKPOINT_QUERIES.xl)

  const isMobile = !isSmUp
  const isTablet = isSmUp && !isLgUp
  const isDesktop = isLgUp
  const current: BreakpointName = isDesktop
    ? 'desktop'
    : isTablet
      ? 'tablet'
      : 'mobile'

  return {
    isSmUp,
    isMdUp,
    isLgUp,
    isXlUp,
    isMobile,
    isTablet,
    isDesktop,
    current,
  }
}
