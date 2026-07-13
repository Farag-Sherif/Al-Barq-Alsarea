import { createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { Category, CuisineType, Restaurant } from '../types/domain'
import * as api from '@/api'
import { filterRestaurantsData } from '@/utils/filterRestaurants'

export const fetchCategories = createAsyncThunk<Category[]>('restaurants/fetchCategories', async () => {
  return api.getCategories()
})

export const fetchCuisineTypes = createAsyncThunk<CuisineType[]>('restaurants/fetchCuisineTypes', async () => {
  return api.getCuisineTypes()
})

export const fetchAllRestaurantsLive = createAsyncThunk<Restaurant[], void, { state: RootState }>(
  'restaurants/fetchAllRestaurantsLive',
  async () => {
    let allItems: Restaurant[] = []
    // Fetch first page to get total
    const firstPage = await api.getRestaurants({ page: 1, pageSize: 15 })
    allItems = allItems.concat(firstPage.items)
    const totalItems = firstPage.total
    const totalPages = Math.ceil(totalItems / 15)
    
    if (totalPages > 1) {
      const promises = []
      for (let p = 2; p <= totalPages; p++) {
        promises.push(api.getRestaurants({ page: p, pageSize: 15 }))
      }
      const restPages = await Promise.all(promises)
      for (const page of restPages) {
        allItems = allItems.concat(page.items)
      }
    }
    
    return allItems
  }
)

export const fetchRestaurants = createAsyncThunk<
  { items: Restaurant[]; total: number; tagCounts?: Record<string, number> },
  { ignoreSelectedAddress?: boolean } | void,
  { state: RootState }
>(
  'restaurants/fetchRestaurants',
  async (arg, thunkApi) => {
    const state = thunkApi.getState()
    const f = state.restaurants.filters
    const selectedAddress = arg?.ignoreSelectedAddress ? '' : state.delivery.selectedAddress.trim()
    
    const latitude = typeof f.latitude === 'number' && Number.isFinite(f.latitude) ? f.latitude : undefined
    const longitude = typeof f.longitude === 'number' && Number.isFinite(f.longitude) ? f.longitude : undefined

    const query = {
      search: f.search,
      address: selectedAddress || undefined,
      latitude,
      longitude,
      selectedTags: f.selectedTags.length ? f.selectedTags : undefined,
      minRating: f.minRating ?? undefined,
      openNow: f.openNow,
      sortBy: f.sortBy,
      page: f.page,
      pageSize: f.pageSize,
    }

    return filterRestaurantsData(
      state.restaurants.allRestaurants,
      state.restaurants.categories,
      state.restaurants.cuisineOptions,
      query
    )
  },
)
