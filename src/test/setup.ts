import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Bersihkan DOM & localStorage setelah tiap test agar tidak saling bocor.
afterEach(() => {
  cleanup()
  localStorage.clear()
})
