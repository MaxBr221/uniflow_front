import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEffect } from 'react'
import { RouterProvider } from 'react-router/dom'
import { router } from '@/app/router.tsx'
import { ToastProvider } from '@/components/Toast.tsx'
import { bindAuthSessionEffects } from '@/features/auth/session/authSession.ts'
import { queryClient } from '@/lib/queryClient.ts'

function App() {
  useEffect(() => bindAuthSessionEffects(queryClient), [])

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
