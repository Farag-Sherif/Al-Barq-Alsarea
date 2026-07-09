import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Category, CuisineType, Restaurant } from '../types/domain'
import { fetchCategories, fetchCuisineTypes, fetchRestaurants } from '../thunks/restaurantsThunks'

export type SortBy = 'recommended' | 'rating' | 'orders'

export type RestaurantsFilters = {
  search: string
  latitude: number | null
  longitude: number | null
  selectedCategoryIds: string[]
  cuisineKeys: string[]
  minRating: number | null
  openNow: boolean
  sortBy: SortBy
  page: number
  pageSize: number
}

export type RestaurantsState = {
  categories: Category[]
  cuisineOptions: CuisineType[]
  items: Restaurant[]
  total: number
  loading: boolean
  error: string | null
  filters: RestaurantsFilters
}

const initialState: RestaurantsState = {
  categories: [],
  cuisineOptions: [],
  items: [],
  total: 0,
  loading: false,
  error: null,
  filters: {
    search: '',
    latitude: null,
    longitude: null,
    selectedCategoryIds: [],
    cuisineKeys: [],
    minRating: null,
    openNow: true,
    sortBy: 'rating',
    page: 1,
    pageSize: 10,
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
    toggleCategory(state, action: PayloadAction<string>) {
      const id = action.payload
      const idx = state.filters.selectedCategoryIds.indexOf(id)
      if (idx === -1) state.filters.selectedCategoryIds.push(id)
      else state.filters.selectedCategoryIds.splice(idx, 1)
      state.filters.page = 1
    },
    setCategoryIds(state, action: PayloadAction<string[]>) {
      state.filters.selectedCategoryIds = Array.from(
        new Set(
          action.payload
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      )
      state.filters.page = 1
    },
    toggleCuisine(state, action: PayloadAction<string>) {
      const key = action.payload
      const set = new Set(state.filters.cuisineKeys)
      if (set.has(key)) set.delete(key)
      else set.add(key)
      state.filters.cuisineKeys = Array.from(set)
      state.filters.page = 1
    },
    setCuisineChecked(state, action: PayloadAction<{ key: string; checked: boolean }>) {
      const key = action.payload.key.trim()
      if (!key) return

      const set = new Set(state.filters.cuisineKeys)
      if (action.payload.checked) set.add(key)
      else set.delete(key)
      state.filters.cuisineKeys = Array.from(set)
      state.filters.page = 1
    },
    setCuisineKeys(state, action: PayloadAction<string[]>) {
      state.filters.cuisineKeys = Array.from(new Set(action.payload))
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
      .addCase(fetchRestaurants.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.total = action.payload.total
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
  toggleCategory,
  setCategoryIds,
  toggleCuisine,
  setCuisineChecked,
  setCuisineKeys,
  setMinRating,
  setOpenNow,
  setSortBy,
  setPage,
  resetFilters,
} = restaurantsSlice.actions

export default restaurantsSlice.reducer
