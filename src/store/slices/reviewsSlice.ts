import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { Review } from '../types/domain'
import * as api from '@/api'

export const fetchReviews = createAsyncThunk('reviews/fetch', async (restaurantId: string) => {
  return await api.getReviews(restaurantId)
})

export const createReview = createAsyncThunk(
  'reviews/create',
  async (payload: Omit<Review, 'id' | 'createdAt'>) => {
    return await api.addReview(payload)
  }
)

type ReviewsState = {
  items: Review[]
}

const initialState: ReviewsState = {
  items: [],
}

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.items = action.payload
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
  },
})

export default reviewsSlice.reducer
