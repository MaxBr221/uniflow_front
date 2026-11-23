import { useSyncExternalStore } from 'react'
import { toast, toastStore, type ToastItem } from '@/lib/toast.ts'

export interface UseToastResult {
  toasts: readonly ToastItem[]
  show: typeof toast.show
  success: typeof toast.success
  error: typeof toast.error
  warning: typeof toast.warning
  info: typeof toast.info
  dismiss: typeof toast.dismiss
  clear: typeof toast.clear
}

export function useToast(): UseToastResult {
  const toasts = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getServerSnapshot,
  )

  return {
    toasts,
    show: toast.show,
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
    dismiss: toast.dismiss,
    clear: toast.clear,
  }
}
