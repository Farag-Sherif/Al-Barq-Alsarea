import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './slices/cartSlice'
import reviewsReducer from './slices/reviewsSlice'
import accountReducer from './slices/accountSlice'

import authReducer from './slices/authSlice'
import homeReducer from './slices/homeSlice'
import restaurantsReducer from './slices/restaurantsSlice'
import uiReducer from './slices/uiSlice'
import settingsReducer from './slices/settingsSlice'
import deliveryReducer from './slices/deliverySlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    home: homeReducer,
    restaurants: restaurantsReducer,
    ui: uiReducer,
    settings: settingsReducer,
    delivery: deliveryReducer,
    cart: cartReducer,
    reviews: reviewsReducer,
    account: accountReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
