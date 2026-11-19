import { createBrowserRouter, type RouteObject } from 'react-router'
import { BaseHomeView, NotFoundView, RouteErrorView } from './RouteViews.tsx'

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <BaseHomeView />,
    errorElement: <RouteErrorView />,
  },
  {
    path: '*',
    element: <NotFoundView />,
    errorElement: <RouteErrorView />,
  },
]

export const router = createBrowserRouter(appRoutes)
