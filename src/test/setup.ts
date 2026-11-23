import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { toast } from '@/lib/toast.ts'
import { configureZod } from '@/lib/validation.ts'

configureZod()

afterEach(() => {
  cleanup()
  toast.clear()
})
