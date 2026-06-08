import { describe, it, expect } from 'vitest'
import authReducer, { logout, clearError, login, register } from './authSlice'
import { makeUser } from '@/test/utils'

/**
 * Acceptance Criteria yang dibuktikan:
 *  - AC#1  Register, login, logout berfungsi (di level state Redux).
 *  - AC#10 State auth ter-update setelah setiap aksi.
 */
describe('authSlice', () => {
  const initial = authReducer(undefined, { type: '@@INIT' })

  it('state awal: belum terautentikasi', () => {
    expect(initial.isAuthenticated).toBe(false)
    expect(initial.user).toBeNull()
  })

  it('login.fulfilled menyimpan user & menandai terautentikasi', () => {
    const user = makeUser({ role: 'staff' })
    const next = authReducer(initial, { type: login.fulfilled.type, payload: user })

    expect(next.isAuthenticated).toBe(true)
    expect(next.user).toEqual(user)
    expect(next.loading).toBe(false)
  })

  it('login.rejected menyimpan pesan error & tetap belum auth', () => {
    const next = authReducer(initial, {
      type: login.rejected.type,
      payload: 'Email atau password salah.',
    })

    expect(next.isAuthenticated).toBe(false)
    expect(next.error).toBe('Email atau password salah.')
  })

  it('register.fulfilled langsung mengautentikasi user baru', () => {
    const user = makeUser({ id: 99, role: 'admin' })
    const next = authReducer(initial, { type: register.fulfilled.type, payload: user })

    expect(next.isAuthenticated).toBe(true)
    expect(next.user?.id).toBe(99)
  })

  it('logout mengosongkan sesi', () => {
    const loggedIn = authReducer(initial, { type: login.fulfilled.type, payload: makeUser() })
    const next = authReducer(loggedIn, logout())

    expect(next.isAuthenticated).toBe(false)
    expect(next.user).toBeNull()
  })

  it('clearError menghapus pesan error', () => {
    const withError = authReducer(initial, { type: login.rejected.type, payload: 'gagal' })
    const next = authReducer(withError, clearError())
    expect(next.error).toBeNull()
  })
})
