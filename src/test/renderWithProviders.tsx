import { QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { appRoutes } from '@/app/router.tsx'
import { createQueryClient } from '@/lib/queryClient.ts'

export interface RenderWithProvidersOptions extends Omit<
  RenderOptions,
  'wrapper'
> {
  initialEntries?: string[]
}

export function renderAppRoute(
  initialEntries: string[] = ['/'],
  options?: RenderOptions,
) {
  const queryClient = createQueryClient({
    queries: {
      retry: false,
    },
  })

  const router = createMemoryRouter(appRoutes, {
    initialEntries,
  })

  const user = userEvent.setup()

  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
    options,
  )

  return {
    ...result,
    user,
    router,
    queryClient,
  }
}

export function renderWithQueryClient(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  const queryClient = createQueryClient({
    queries: {
      retry: false,
    },
  })

  const user = userEvent.setup()

  const result = render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    options,
  )

  return {
    ...result,
    user,
    queryClient,
  }
}
