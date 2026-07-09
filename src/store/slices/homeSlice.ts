import { createSlice } from '@reduxjs/toolkit'
import type { Brand, Kitchen, Restaurant } from '../types/domain'
import { fetchHomeData } from '../thunks/homeThunks'

export type HomeState = {
  kitchens: Kitchen[]
  mostOrdered: Restaurant[]
  suggested: Brand[]
  loading: boolean
  error: string | null
}

const initialState: HomeState = {
  kitchens: [],
  mostOrdered: [],
  suggested: [],
  loading: false,
  error: null,
}

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchHomeData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchHomeData.fulfilled, (state, action) => {
        state.loading = false
        state.kitchens = action.payload.kitchens
        state.mostOrdered = action.payload.mostOrdered
        state.suggested = action.payload.suggested
      })
      .addCase(fetchHomeData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'حدث خطأ أثناء تحميل البيانات'
      })
  },
})

export default homeSlice.reducer
