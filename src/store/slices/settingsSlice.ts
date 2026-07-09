import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import * as api from '@/api'
import type { AppSettings } from '@/api'

type SettingsState = {
  data: AppSettings | null
  loading: boolean
  loaded: boolean
  error: string | null
}

const initialState: SettingsState = {
  data: null,
  loading: false,
  loaded: false,
  error: null,
}

export const fetchSettings = createAsyncThunk('settings/fetch', async () => {
  return await api.getSettings()
})

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false
        state.loaded = true
        state.data = action.payload
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false
        state.loaded = true
        state.error = action.error.message ?? 'Failed to load settings'
      })
  },
})

export default settingsSlice.reducer
