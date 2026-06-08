import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Role, SafeUser, User } from '@/types'
import type { RootState } from '@/app/store'

const SESSION_KEY = 'stockease:session'

interface AuthState {
  /** Seluruh akun terdaftar (pengganti tabel users JSON Server). */
  users: User[]
  user: SafeUser | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

function readSession(): SafeUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as SafeUser) : null
  } catch {
    return null
  }
}

function toSafe(user: User): SafeUser {
  const { password: _password, ...safe } = user
  return safe
}

const initialUser = readSession()

const initialState: AuthState = {
  users: [],
  user: initialUser,
  isAuthenticated: !!initialUser,
  loading: false,
  error: null,
}

/** Login: cari user by email di state lokal, lalu validasi password. */
export const login = createAsyncThunk<
  SafeUser,
  { email: string; password: string },
  { state: RootState; rejectValue: string }
>('auth/login', async ({ email, password }, { getState, rejectWithValue }) => {
  const users = getState().auth.users
  const found = users.find((u) => u.email === email.trim().toLowerCase())
  if (!found || found.password !== password) {
    return rejectWithValue('Email atau password salah.')
  }
  const safe = toSafe(found)
  localStorage.setItem(SESSION_KEY, JSON.stringify(safe))
  return safe
})

/** Register: cek email unik lalu tambahkan user baru ke state lokal. */
export const register = createAsyncThunk<
  User,
  { name: string; email: string; password: string; role: Role },
  { state: RootState; rejectValue: string }
>('auth/register', async (input, { getState, rejectWithValue }) => {
  const email = input.email.trim().toLowerCase()
  const exists = getState().auth.users.some((u) => u.email === email)
  if (exists) {
    return rejectWithValue('Email sudah terdaftar.')
  }
  const newUser: User = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email,
    password: input.password,
    role: input.role,
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(toSafe(newUser)))
  return newUser
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Isi daftar user awal (seed) saat localStorage masih kosong. */
    setUsers(state, action: PayloadAction<User[]>) {
      state.users = action.payload
    },
    logout(state) {
      state.user = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem(SESSION_KEY)
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Gagal masuk.'
      })
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.users.push(action.payload)
        state.user = toSafe(action.payload)
        state.isAuthenticated = true
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Gagal mendaftar.'
      })
  },
})

export const { setUsers, logout, setLoading, clearError } = authSlice.actions
export default authSlice.reducer
