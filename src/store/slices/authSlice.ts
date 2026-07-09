import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { User } from '../types/domain'
import { loginThunk, registerThunk, hydrateAuthFromStorage, logoutThunk, updateProfileThunk } from '../thunks/authThunks'

export type AuthState = {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthSession(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user
      state.token = action.payload.token
      state.loading = false
      state.error = null
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers(builder) {
    builder
      .addCase(hydrateAuthFromStorage.fulfilled, (state, action) => {
        state.user = action.payload?.user ?? null
        state.token = action.payload?.token ?? null
      })
      .addCase(loginThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? action.error.message ?? 'حدث خطأ أثناء تسجيل الدخول'
      })

      .addCase(registerThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerThunk.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? action.error.message ?? 'حدث خطأ أثناء إنشاء الحساب'
      })

      .addCase(updateProfileThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'حدث خطأ أثناء تحديث البيانات'
      })

      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null
        state.token = null
      })
  },
})

export const { setAuthSession, clearError } = authSlice.actions
export default authSlice.reducer
