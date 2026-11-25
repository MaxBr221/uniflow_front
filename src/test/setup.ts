import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import {
  authSession,
  initializeAuthHttpClient,
} from '@/features/auth/session/authSession.ts'
import { toast } from '@/lib/toast.ts'
import { configureZod } from '@/lib/validation.ts'

configureZod()
initializeAuthHttpClient()

afterEach(() => {
  cleanup()
  toast.clear()
  authSession.clear()
})
