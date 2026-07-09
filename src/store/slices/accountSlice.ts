import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { Address, CartItem, Order, PaymentMethod, SavedCard } from '../types/domain'
import * as api from '@/api'
import { loginThunk, logoutThunk, registerThunk } from '../thunks/authThunks'
import type { RootState } from '../store'

function normalizeRestaurantId(restaurantId: string | undefined): string {
  const normalized = (restaurantId ?? '').trim()
  if (!normalized || normalized.toLowerCase() === 'restaurant') return ''
  return normalized
}

function getRestaurantClosedMessage(): string {
  const htmlLang = typeof document !== 'undefined' ? document.documentElement.getAttribute('lang')?.toLowerCase() ?? '' : ''
  return htmlLang.startsWith('ar')
    ? 'المطعم مغلق حالياً ولا يمكن إتمام الشراء.'
    : 'Restaurant is currently unavailable for checkout.'
}

// ---------------- Addresses ----------------
export const fetchAddresses = createAsyncThunk('account/addresses', async () => {
  return await api.getAddresses()
})

export const createAddress = createAsyncThunk('account/addAddress', async (payload: Omit<Address, 'id'>) => {
  return await api.addAddress(payload)
})

export const updateAddressThunk = createAsyncThunk(
  'account/updateAddress',
  async (payload: { id: string; patch: Partial<Omit<Address, 'id'>> }) => {
    return await api.updateAddress(payload.id, payload.patch)
  },
)

export const deleteAddressThunk = createAsyncThunk('account/deleteAddress', async (id: string) => {
  return await api.deleteAddress(id)
})

export const setDefaultAddressThunk = createAsyncThunk('account/setDefaultAddress', async (id: string) => {
  return await api.setDefaultAddress(id)
})

// ---------------- Orders ----------------
export const fetchOrders = createAsyncThunk('account/orders', async () => {
  return await api.getOrders()
})

export const createOrderThunk = createAsyncThunk(
  'account/createOrder',
  async (payload: {
    addressId: string
    paymentMethod: PaymentMethod
    notes?: string
    discount?: number
    promoCode?: string
    deliveryFee?: number
    subtotal?: number
    total?: number
    addonsTotal?: number
    cartItems?: CartItem[]
  }) => {
    const restaurantClosedMessage = getRestaurantClosedMessage()
    const payloadCartItems = Array.isArray(payload.cartItems) ? payload.cartItems : []
    const sourceCartItems = payloadCartItems.length > 0 ? payloadCartItems : await api.getCart().catch(() => [])
    const restaurantIds = Array.from(
      new Set(
        sourceCartItems
          .map((item) => normalizeRestaurantId(item.restaurantId))
          .filter(Boolean),
      ),
    )

    if (restaurantIds.length > 0) {
      let hasClosedRestaurant = false
      try {
        const restaurants = await api.getRestaurantsByIds(restaurantIds)
        const openStatusById = new Map<string, boolean>()
        for (const restaurant of restaurants) {
          const id = normalizeRestaurantId(restaurant.id)
          if (!id) continue
          openStatusById.set(id, restaurant.isOpen !== false)
        }
        hasClosedRestaurant = restaurantIds.some((restaurantId) => openStatusById.get(restaurantId) === false)
      } catch {
        // Ignore availability lookup failures and let backend checkout validation handle it.
      }

      if (hasClosedRestaurant) {
        throw new Error(restaurantClosedMessage)
      }
    }

    return await api.createOrder(payload)
  },
)

export const cancelOrderThunk = createAsyncThunk('account/cancelOrder', async (id: string) => {
  return await api.cancelOrder(id)
})

// ---------------- Favorites ----------------
export const fetchFavorites = createAsyncThunk<
  { restaurantIds: string[]; productIds: string[] },
  void,
  { state: RootState }
>('account/favorites', async (_, thunkApi) => {
  const state = thunkApi.getState()
  const currentRestaurantIds = state.account.favoriteRestaurantIds
  const currentProductIds = state.account.favoriteProductIds
  if (!state.auth.token) {
    return {
      restaurantIds: currentRestaurantIds,
      productIds: currentProductIds,
    }
  }

  const [restaurantIds, productIds] = await Promise.all([
    api.getFavoriteRestaurantIds(),
    api.getFavoriteProductIds(),
  ])

  // If optional endpoints fail and fallback returns empty arrays, keep current favorites.
  if (
    restaurantIds.length === 0 &&
    productIds.length === 0 &&
    (currentRestaurantIds.length > 0 || currentProductIds.length > 0)
  ) {
    return {
      restaurantIds: currentRestaurantIds,
      productIds: currentProductIds,
    }
  }

  return { restaurantIds, productIds }
})

export const toggleFavoriteThunk = createAsyncThunk('account/toggleFavorite', async (restaurantId: string) => {
  return await api.toggleFavoriteRestaurant(restaurantId)
})

export const toggleFavoriteProductThunk = createAsyncThunk('account/toggleFavoriteProduct', async (productId: string) => {
  return await api.toggleFavoriteProduct(productId)
})

// ---------------- Saved cards ----------------
export const fetchSavedCards = createAsyncThunk('account/savedCards', async () => {
  return await api.getSavedCards()
})

export const addSavedCardThunk = createAsyncThunk(
  'account/addSavedCard',
  async (payload: { nameOnCard: string; cardNumber: string; expiry: string; brand?: SavedCard['brand']; isDefault?: boolean }) => {
    return await api.addSavedCard(payload)
  },
)

export const deleteSavedCardThunk = createAsyncThunk('account/deleteSavedCard', async (id: string) => {
  return await api.deleteSavedCard(id)
})

export const setDefaultCardThunk = createAsyncThunk('account/setDefaultCard', async (id: string) => {
  return await api.setDefaultCard(id)
})

// ---------------- State ----------------
type AccountState = {
  addresses: Address[]
  orders: Order[]
  favoriteRestaurantIds: string[]
  favoriteProductIds: string[]
  savedCards: SavedCard[]
}

const initialState: AccountState = {
  addresses: [],
  orders: [],
  favoriteRestaurantIds: [],
  favoriteProductIds: [],
  savedCards: [],
}

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // addresses
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.addresses = action.payload
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.addresses = action.payload
      })
      .addCase(updateAddressThunk.fulfilled, (state, action) => {
        state.addresses = action.payload
      })
      .addCase(deleteAddressThunk.fulfilled, (state, action) => {
        state.addresses = action.payload
      })
      .addCase(setDefaultAddressThunk.fulfilled, (state, action) => {
        state.addresses = action.payload
      })

      // orders
      .addCase(fetchOrders.pending, () => {
        // Keep the latest rendered orders while refreshing.
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload
      })
      .addCase(fetchOrders.rejected, () => {
        // Preserve current orders on transient API failures.
      })
      .addCase(createOrderThunk.fulfilled, (state, action) => {
        state.orders = [action.payload, ...state.orders.filter((order) => order.id !== action.payload.id)]
      })
      .addCase(cancelOrderThunk.fulfilled, (state, action) => {
        if (action.payload.length > 0) {
          state.orders = action.payload
          return
        }

        const cancelledOrderId = action.meta.arg
        state.orders = state.orders.map((order) =>
          order.id === cancelledOrderId
            ? {
                ...order,
                status: 'cancelled',
              }
            : order,
        )
      })

      // favorites
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.favoriteRestaurantIds = action.payload.restaurantIds
        state.favoriteProductIds = action.payload.productIds
      })
      .addCase(toggleFavoriteThunk.fulfilled, (state, action) => {
        state.favoriteRestaurantIds = action.payload
      })
      .addCase(toggleFavoriteProductThunk.fulfilled, (state, action) => {
        state.favoriteProductIds = action.payload
      })

      // saved cards
      .addCase(fetchSavedCards.fulfilled, (state, action) => {
        state.savedCards = action.payload
      })
      .addCase(addSavedCardThunk.fulfilled, (state, action) => {
        state.savedCards = action.payload
      })
      .addCase(deleteSavedCardThunk.fulfilled, (state, action) => {
        state.savedCards = action.payload
      })
      .addCase(setDefaultCardThunk.fulfilled, (state, action) => {
        state.savedCards = action.payload
      })

      // auth context switches
      .addCase(loginThunk.fulfilled, () => initialState)
      .addCase(registerThunk.fulfilled, () => initialState)
      .addCase(logoutThunk.fulfilled, () => initialState)
  },
})

export default accountSlice.reducer
