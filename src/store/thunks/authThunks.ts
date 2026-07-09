import { createAsyncThunk } from '@reduxjs/toolkit'
import type { User } from '../types/domain'
import * as api from '@/api'

const STORAGE_KEY = 'albarq_auth_session'
const LEGACY_STORAGE_KEYS = ['البرق السريع_auth', 'Ø§Ù„Ø¨Ø±Ù‚ Ø§Ù„Ø³Ø±ÙŠØ¹_auth'] as const

type StoredAuth = { user: User; token: string }

function isAuthenticationErrorMessage(value: string): boolean {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return false

  return (
    /(unauthenticated|unauthorized|forbidden|not authenticated|authentication token is missing|token is missing|401)/i.test(
      normalized,
    ) ||
    normalized.includes('\u064a\u0631\u062c\u0649 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644') ||
    normalized.includes('\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644')
  )
}

function getStorageKeys(): string[] {
  return [STORAGE_KEY, ...LEGACY_STORAGE_KEYS]
}

function clearStoredAuth(): void {
  for (const key of getStorageKeys()) {
    localStorage.removeItem(key)
  }
}

function persistStoredAuth(value: StoredAuth): void {
  const serialized = JSON.stringify(value)
  for (const key of getStorageKeys()) {
    localStorage.setItem(key, serialized)
  }
}

function readStoredAuth(): StoredAuth | null {
  for (const key of getStorageKeys()) {
    const raw = localStorage.getItem(key)
    if (!raw) continue

    try {
      const parsed = JSON.parse(raw) as StoredAuth
      if (parsed?.token && parsed?.user?.email) {
        const stored: StoredAuth = {
          token: String(parsed.token),
          user: parsed.user,
        }
        // Keep all storage keys in sync once a valid session is found.
        persistStoredAuth(stored)
        return stored
      }
    } catch {
      // Try next key.
    }
  }
  return null
}

export const hydrateAuthFromStorage = createAsyncThunk<StoredAuth | null>('auth/hydrate', async () => {
  try {
    const parsed = readStoredAuth()
    if (!parsed) {
      clearStoredAuth()
      return null
    }

    try {
      const serverUser = await api.getCurrentUser()
      const stored: StoredAuth = {
        token: parsed.token,
        user: {
          ...parsed.user,
          ...serverUser,
          fullName: serverUser.fullName || parsed.user.fullName,
          email: serverUser.email || parsed.user.email,
          phone: serverUser.phone ?? parsed.user.phone,
        },
      }
      persistStoredAuth(stored)
      return stored
    } catch (error) {
      const rawMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : ''
      const resolvedMessage = api.resolveApiErrorMessage(error, '')
      const combinedMessage = `${rawMessage} ${resolvedMessage}`.trim()

      if (isAuthenticationErrorMessage(combinedMessage)) {
        clearStoredAuth()
        return null
      }

      // Keep existing stored session if profile endpoint fails temporarily.
      persistStoredAuth(parsed)
      return parsed
    }
  } catch {
    clearStoredAuth()
    return null
  }
})

export const loginThunk = createAsyncThunk<
  StoredAuth,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.login(payload)
    const stored: StoredAuth = { user: res.user, token: res.token }
    persistStoredAuth(stored)
    return stored
  } catch (error) {
    return rejectWithValue(api.resolveApiErrorMessage(error, 'Login failed'))
  }
})

export const registerThunk = createAsyncThunk<
  StoredAuth,
  {
    fullName: string
    email: string
    phone: string
    password: string
    confirmPassword: string
  },
  { rejectValue: string }
>(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.register(payload)
      const stored: StoredAuth = { user: res.user, token: res.token }
      persistStoredAuth(stored)
      return stored
    } catch (error) {
      return rejectWithValue(api.resolveApiErrorMessage(error, 'Registration failed'))
    }
  },
)

export const updateProfileThunk = createAsyncThunk<User, { fullName: string; email: string; phone?: string }>(
  'auth/updateProfile',
  async (payload, { getState }) => {
    const state = getState() as any
    const token: string | null = state?.auth?.token ?? null
    const user: User | null = state?.auth?.user ?? null

    if (!token || !user) {
      throw new Error(api.localizeApiErrorMessage('Not authenticated'))
    }

    const updatedUser = await api.updateProfile(payload)
    const submittedFullName = payload.fullName.trim()
    const submittedEmail = payload.email.trim()
    const submittedPhone = typeof payload.phone === 'string' ? payload.phone.trim() : payload.phone
    const mergedUser: User = {
      ...user,
      ...updatedUser,
      fullName: submittedFullName || updatedUser.fullName || user.fullName,
      email: submittedEmail || updatedUser.email || user.email,
      phone: submittedPhone !== undefined ? submittedPhone : (updatedUser.phone ?? user.phone),
    }

    const stored: StoredAuth = { user: mergedUser, token }
    persistStoredAuth(stored)

    return mergedUser
  },
)

export const logoutThunk = createAsyncThunk<void>('auth/logout', async () => {
  try {
    await api.logout()
  } catch {
    // Clear local session even if backend logout fails.
  }
  clearStoredAuth()
})
