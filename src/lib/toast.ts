export type ToastVariant = 'info' | 'success' | 'warning' | 'error'

export type ToastPosition =
  'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastOptions {
  id?: string
  title: string
  description?: string
  variant?: ToastVariant
  durationMs?: number
  dismissible?: boolean
  action?: ToastAction
}

export interface ToastItem {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  durationMs: number
  dismissible: boolean
  action?: ToastAction
  createdAt: number
}

export const DEFAULT_TOAST_DURATION_MS = 5000
export const DEFAULT_MAX_VISIBLE_TOASTS = 4

type ToastListener = () => void

interface TimerEntry {
  timerId: ReturnType<typeof setTimeout> | null
  remainingMs: number
  startedAt: number
  isPaused: boolean
}

const EMPTY_TOASTS: readonly ToastItem[] = []

function normalizeDuration(durationMs?: number): number {
  if (durationMs === undefined) {
    return DEFAULT_TOAST_DURATION_MS
  }
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return 0
  }
  return durationMs
}

export interface ToastStore {
  subscribe: (listener: ToastListener) => () => void
  getSnapshot: () => readonly ToastItem[]
  getServerSnapshot: () => readonly ToastItem[]
  show: (options: ToastOptions) => string
  dismiss: (id: string) => void
  pause: (id: string) => void
  resume: (id: string) => void
  clear: () => void
}

export function createToastStore(): ToastStore {
  let toasts: ToastItem[] = []
  let sequence = 0
  const listeners = new Set<ToastListener>()
  const timers = new Map<string, TimerEntry>()

  function notify(): void {
    for (const listener of listeners) {
      listener()
    }
  }

  function clearTimer(id: string): void {
    const entry = timers.get(id)
    if (entry?.timerId !== null && entry?.timerId !== undefined) {
      clearTimeout(entry.timerId)
    }
    timers.delete(id)
  }

  function dismiss(id: string): void {
    clearTimer(id)
    const next = toasts.filter((item) => item.id !== id)
    if (next.length !== toasts.length) {
      toasts = next
      notify()
    }
  }

  function scheduleTimer(id: string, durationMs: number): void {
    clearTimer(id)
    if (durationMs <= 0) {
      return
    }
    const timerId = setTimeout(() => {
      dismiss(id)
    }, durationMs)

    timers.set(id, {
      timerId,
      remainingMs: durationMs,
      startedAt: Date.now(),
      isPaused: false,
    })
  }

  function pause(id: string): void {
    const entry = timers.get(id)
    if (!entry || entry.isPaused) {
      return
    }
    if (entry.timerId !== null) {
      clearTimeout(entry.timerId)
    }
    const elapsed = Math.max(0, Date.now() - entry.startedAt)
    const remainingMs = Math.max(0, entry.remainingMs - elapsed)

    timers.set(id, {
      timerId: null,
      remainingMs,
      startedAt: Date.now(),
      isPaused: true,
    })
  }

  function resume(id: string): void {
    const entry = timers.get(id)
    if (!entry || !entry.isPaused) {
      return
    }
    if (entry.remainingMs <= 0) {
      dismiss(id)
      return
    }
    const timerId = setTimeout(() => {
      dismiss(id)
    }, entry.remainingMs)

    timers.set(id, {
      timerId,
      remainingMs: entry.remainingMs,
      startedAt: Date.now(),
      isPaused: false,
    })
  }

  function show(options: ToastOptions): string {
    const id = options.id ?? `toast-${++sequence}`
    const durationMs = normalizeDuration(options.durationMs)
    const item: ToastItem = {
      id,
      title: options.title,
      description: options.description,
      variant: options.variant ?? 'info',
      durationMs,
      dismissible: options.dismissible ?? true,
      action: options.action,
      createdAt: Date.now(),
    }

    const existingIndex = toasts.findIndex((existing) => existing.id === id)
    if (existingIndex !== -1) {
      toasts = toasts.map((existing) => (existing.id === id ? item : existing))
    } else {
      toasts = [...toasts, item]
    }

    scheduleTimer(id, durationMs)
    notify()
    return id
  }

  function clear(): void {
    for (const entry of timers.values()) {
      if (entry.timerId !== null) {
        clearTimeout(entry.timerId)
      }
    }
    timers.clear()
    if (toasts.length > 0) {
      toasts = []
      notify()
    }
  }

  return {
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    getSnapshot() {
      return toasts
    },
    getServerSnapshot() {
      return EMPTY_TOASTS
    },
    show,
    dismiss,
    pause,
    resume,
    clear,
  }
}

export const toastStore = createToastStore()

type ShortcutToastOptions = Omit<ToastOptions, 'title' | 'variant'>

export const toast = {
  show: (options: ToastOptions) => toastStore.show(options),
  success: (title: string, options?: ShortcutToastOptions) =>
    toastStore.show({ ...options, title, variant: 'success' }),
  error: (title: string, options?: ShortcutToastOptions) =>
    toastStore.show({ ...options, title, variant: 'error' }),
  warning: (title: string, options?: ShortcutToastOptions) =>
    toastStore.show({ ...options, title, variant: 'warning' }),
  info: (title: string, options?: ShortcutToastOptions) =>
    toastStore.show({ ...options, title, variant: 'info' }),
  dismiss: (id: string) => toastStore.dismiss(id),
  pause: (id: string) => toastStore.pause(id),
  resume: (id: string) => toastStore.resume(id),
  clear: () => toastStore.clear(),
}
