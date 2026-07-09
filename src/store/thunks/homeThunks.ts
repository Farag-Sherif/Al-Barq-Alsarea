import { createAsyncThunk } from '@reduxjs/toolkit'
import * as api from '@/api'
import type { Brand, Kitchen, Restaurant } from '../types/domain'

export const fetchHomeData = createAsyncThunk<{
  kitchens: Kitchen[]
  mostOrdered: Restaurant[]
  suggested: Brand[]
}>(
  'home/fetch',
  async () => {
    return api.getHome()
  },
)
