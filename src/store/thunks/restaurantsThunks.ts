import { createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { Category, CuisineType, Restaurant } from '../types/domain'
import * as api from '@/api'

export const fetchCategories = createAsyncThunk<Category[]>('restaurants/fetchCategories', async () => {
  return api.getCategories()
})

export const fetchCuisineTypes = createAsyncThunk<CuisineType[]>('restaurants/fetchCuisineTypes', async () => {
  return api.getCuisineTypes()
})

export const fetchRestaurants = createAsyncThunk<
  { items: Restaurant[]; total: number },
  { ignoreSelectedAddress?: boolean } | void,
  { state: RootState }
>(
  'restaurants/fetchRestaurants',
  async (arg, thunkApi) => {
    const state = thunkApi.getState()
    const f = state.restaurants.filters
    const selectedAddress = arg?.ignoreSelectedAddress ? '' : state.delivery.selectedAddress.trim()
    const categoryNames = f.selectedCategoryIds
      .map((id) => state.restaurants.categories.find((category) => category.id === id))
      .flatMap((category) => (category ? [category.name, category.nameAr ?? '', category.nameEn ?? ''] : []))
      .map((value) => value.trim())
      .filter(Boolean)
    const cuisineLabels = f.cuisineKeys
      .map((key) => state.restaurants.cuisineOptions.find((cuisine) => cuisine.key === key))
      .flatMap((cuisine) => (cuisine ? [cuisine.label, cuisine.labelAr ?? '', cuisine.labelEn ?? ''] : []))
      .map((value) => value.trim())
      .filter(Boolean)
    const latitude = typeof f.latitude === 'number' && Number.isFinite(f.latitude) ? f.latitude : undefined
    const longitude = typeof f.longitude === 'number' && Number.isFinite(f.longitude) ? f.longitude : undefined

    return api.getRestaurants({
      search: f.search,
      address: selectedAddress || undefined,
      latitude,
      longitude,
      categoryIds: f.selectedCategoryIds.length ? f.selectedCategoryIds : undefined,
      categoryNames: categoryNames.length ? Array.from(new Set(categoryNames)) : undefined,
      cuisineKeys: f.cuisineKeys,
      cuisineLabels: cuisineLabels.length ? Array.from(new Set(cuisineLabels)) : undefined,
      minRating: f.minRating ?? undefined,
      openNow: f.openNow,
      sortBy: f.sortBy,
      page: f.page,
      pageSize: f.pageSize,
    })
  },
)
