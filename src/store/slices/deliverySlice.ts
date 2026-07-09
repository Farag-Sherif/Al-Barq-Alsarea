import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

const STORAGE_KEY = 'البرق السريع_delivery_address_v1'
const DEFAULT_DELIVERY_ADDRESS = 'Saudi Arabia'

export type DeliveryState = {
  selectedAddress: string
}

function readStoredAddress(): string {
  if (typeof window === 'undefined') return DEFAULT_DELIVERY_ADDRESS

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_DELIVERY_ADDRESS
    const parsed = JSON.parse(raw) as { address?: unknown }
    if (typeof parsed?.address !== 'string') return DEFAULT_DELIVERY_ADDRESS
    const nextAddress = parsed.address.trim()
    return nextAddress || DEFAULT_DELIVERY_ADDRESS
  } catch {
    return DEFAULT_DELIVERY_ADDRESS
  }
}

function persistAddress(address: string) {
  if (typeof window === 'undefined') return

  try {
    if (!address) {
      window.localStorage.removeItem(STORAGE_KEY)
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ address }))
  } catch {
    // ignore storage failures
  }
}

const initialState: DeliveryState = {
  selectedAddress: readStoredAddress(),
}

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    setSelectedAddress(state, action: PayloadAction<string>) {
      const nextAddress = action.payload.trim()
      state.selectedAddress = nextAddress
      persistAddress(nextAddress)
    },
    clearSelectedAddress(state) {
      state.selectedAddress = DEFAULT_DELIVERY_ADDRESS
      persistAddress(DEFAULT_DELIVERY_ADDRESS)
    },
  },
})

export const { setSelectedAddress, clearSelectedAddress } = deliverySlice.actions
export default deliverySlice.reducer
