import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  BREAKPOINT_QUERIES,
  useBreakpoint,
  useMediaQuery,
} from '@/hooks/useMediaQuery.ts'

describe('useMediaQuery e useBreakpoint', () => {
  const originalMatchMedia = window.matchMedia

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('retorna valor padrão com segurança quando window.matchMedia não existe', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: undefined,
    })

    const { result } = renderHook(() =>
      useMediaQuery(BREAKPOINT_QUERIES.lg, false),
    )
    expect(result.current).toBe(false)

    const { result: fallbackTrue } = renderHook(() =>
      useMediaQuery(BREAKPOINT_QUERIES.sm, true),
    )
    expect(fallbackTrue.current).toBe(true)
  })

  it('reage dinamicamente às mudanças de breakpoint (mobile, tablet e desktop)', () => {
    let viewportWidth = 375
    const listeners = new Map<string, Set<() => void>>()

    const isMatching = (query: string): boolean => {
      switch (query) {
        case BREAKPOINT_QUERIES.sm:
          return viewportWidth >= 640
        case BREAKPOINT_QUERIES.md:
          return viewportWidth >= 768
        case BREAKPOINT_QUERIES.lg:
          return viewportWidth >= 1024
        case BREAKPOINT_QUERIES.xl:
          return viewportWidth >= 1280
        default:
          return false
      }
    }

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn((query: string) => ({
        get matches() {
          return isMatching(query)
        },
        media: query,
        onchange: null,
        addEventListener: (_event: string, cb: () => void) => {
          const set = listeners.get(query) ?? new Set()
          set.add(cb)
          listeners.set(query, set)
        },
        removeEventListener: (_event: string, cb: () => void) => {
          listeners.get(query)?.delete(cb)
        },
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    const emitResize = (nextWidth: number) => {
      viewportWidth = nextWidth
      for (const set of listeners.values()) {
        for (const cb of set) {
          cb()
        }
      }
    }

    const { result } = renderHook(() => useBreakpoint())

    expect(result.current.current).toBe('mobile')
    expect(result.current.isMobile).toBe(true)
    expect(result.current.isTablet).toBe(false)
    expect(result.current.isDesktop).toBe(false)

    act(() => {
      emitResize(768)
    })
    expect(result.current.current).toBe('tablet')
    expect(result.current.isSmUp).toBe(true)
    expect(result.current.isMdUp).toBe(true)
    expect(result.current.isTablet).toBe(true)
    expect(result.current.isDesktop).toBe(false)

    act(() => {
      emitResize(1280)
    })
    expect(result.current.current).toBe('desktop')
    expect(result.current.isLgUp).toBe(true)
    expect(result.current.isXlUp).toBe(true)
    expect(result.current.isDesktop).toBe(true)
  })
})
