import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Category, CuisineType, Restaurant } from '../types/domain'
import { fetchCategories, fetchCuisineTypes, fetchRestaurants, fetchAllRestaurantsLive } from '../thunks/restaurantsThunks'

export type SortBy = 'recommended' | 'rating' | 'orders'

export type RestaurantsFilters = {
  search: string
  latitude: number | null
  longitude: number | null
  selectedTags: string[]
  minRating: number | null
  openNow: boolean
  sortBy: SortBy
  page: number
  pageSize: number
}

export type RestaurantsState = {
  categories: Category[]
  cuisineOptions: CuisineType[]
  tagCounts: Record<string, number>
  allRestaurants: Restaurant[]
  isAllRestaurantsLoaded: boolean
  items: Restaurant[]
  total: number
  loading: boolean
  error: string | null
  filters: RestaurantsFilters
}

const initialState: RestaurantsState = {
  categories: [],
  cuisineOptions: [],
  tagCounts: {},
  allRestaurants: [],
  isAllRestaurantsLoaded: false,
  items: [],
  total: 0,
  loading: false,
  error: null,
  filters: {
    search: '',
    latitude: null,
    longitude: null,
    selectedTags: [],
    minRating: null,
    openNow: true,
    sortBy: 'rating',
    page: 1,
    pageSize: 15,
  },
}

const restaurantsSlice = createSlice({
  name: 'restaurants',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload
      state.filters.page = 1
    },
    setSearchCoordinates(
      state,
      action: PayloadAction<{ latitude: number | null; longitude: number | null }>,
    ) {
      state.filters.latitude = action.payload.latitude
      state.filters.longitude = action.payload.longitude
      state.filters.page = 1
    },
    toggleTag(state, action: PayloadAction<string>) {
      const tag = action.payload.trim().toLowerCase()
      if (!tag) return
      const idx = state.filters.selectedTags.indexOf(tag)
      if (idx === -1) state.filters.selectedTags.push(tag)
      else state.filters.selectedTags.splice(idx, 1)
      state.filters.page = 1
    },
    setTags(state, action: PayloadAction<string[]>) {
      state.filters.selectedTags = Array.from(
        new Set(
          action.payload
            .map((value) => value.trim().toLowerCase())
            .filter(Boolean),
        ),
      )
      state.filters.page = 1
    },
    setMinRating(state, action: PayloadAction<number | null>) {
      state.filters.minRating = action.payload
      state.filters.page = 1
    },
    setOpenNow(state, action: PayloadAction<boolean>) {
      state.filters.openNow = action.payload
      state.filters.page = 1
    },
    setSortBy(state, action: PayloadAction<SortBy>) {
      state.filters.sortBy = action.payload
      state.filters.page = 1
    },
    setPage(state, action: PayloadAction<number>) {
      state.filters.page = action.payload
    },
    resetFilters(state) {
      state.filters = { ...initialState.filters }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload
      })
      .addCase(fetchCuisineTypes.fulfilled, (state, action) => {
        state.cuisineOptions = action.payload
      })
      .addCase(fetchAllRestaurantsLive.fulfilled, (state, action) => {
        state.allRestaurants = action.payload
        state.isAllRestaurantsLoaded = true
      })
      .addCase(fetchRestaurants.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.total = action.payload.total
        if (action.payload.tagCounts) {
          state.tagCounts = action.payload.tagCounts
        }
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'حدث خطأ أثناء تحميل المطاعم'
      })
  },
})

export const {
  setSearch,
  setSearchCoordinates,
  toggleTag,
  setTags,
  setMinRating,
  setOpenNow,
  setSortBy,
  setPage,
  resetFilters,
} = restaurantsSlice.actions

export default restaurantsSlice.reducer
