import { createBrowserRouter, type RouteObject } from 'react-router'
import {
  BaseHomeView,
  NotFoundView,
  RouteErrorView,
} from '@/app/RouteViews.tsx'
import { LoginPage, RegisterPage } from '@/features/auth/index.ts'

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <BaseHomeView />,
    errorElement: <RouteErrorView />,
  },
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <RouteErrorView />,
  },
  {
    path: '/cadastro',
    element: <RegisterPage />,
    errorElement: <RouteErrorView />,
  },
  {
    path: '*',
    element: <NotFoundView />,
    errorElement: <RouteErrorView />,
  },
]

export const router = createBrowserRouter(appRoutes)
