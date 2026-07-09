import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { CartItem } from '../types/domain'
import * as api from '@/api'
import { logoutThunk } from '../thunks/authThunks'
import { toSaudiCurrencySymbolText } from '@/utils/format'

export type CartState = {
  items: CartItem[]
  loading: boolean
  error: string | null
}

const CART_STORAGE_KEY = 'البرق السريع_cart_v1'

const CART_OPTION_BIDI_MARKS_REGEX = /[\u061c\u200b\u200e\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g
const CART_OPTION_TRAILING_PRICE_REGEX = /\s*\([^()]*\)\s*$/

function toWesternDigits(value: string): string {
  return value
    .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 1776))
}

function normalizeCartOptionLabelKey(option: string, uiLang: 'ar' | 'en'): string {
  return toWesternDigits(
    toSaudiCurrencySymbolText(option, uiLang)
      .replace(CART_OPTION_BIDI_MARKS_REGEX, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase(),
  )
    .replace(CART_OPTION_TRAILING_PRICE_REGEX, '')
    .trim()
}

function extractOptionPriceValue(option: string, uiLang: 'ar' | 'en'): number | null {
  const normalized = toWesternDigits(
    toSaudiCurrencySymbolText(option, uiLang)
      .replace(CART_OPTION_BIDI_MARKS_REGEX, '')
      .replace(/\s+/g, ' ')
      .trim(),
  )
  const priceMatch = normalized.match(/\(([^()]*)\)\s*$/)
  if (!priceMatch) return null

  const numericMatch = priceMatch[1]?.match(/-?\d+(?:[.,]\d+)?/)
  if (!numericMatch) return null

  const parsed = Number(numericMatch[0].replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

function dedupeCartOptions(options: string[] | undefined, uiLang = readUiLang()): string[] | undefined {
  if (!options?.length) return undefined

  const byLabel = new Map<string, { value: string; hasPrice: boolean }>()
  for (const rawOption of options) {
    const normalizedOption = toSaudiCurrencySymbolText(rawOption ?? '', uiLang)
      .replace(CART_OPTION_BIDI_MARKS_REGEX, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (!normalizedOption) continue

    const labelKey = normalizeCartOptionLabelKey(normalizedOption, uiLang)
    if (!labelKey) continue

    const hasPrice = extractOptionPriceValue(normalizedOption, uiLang) !== null
    const existing = byLabel.get(labelKey)
    if (!existing) {
      byLabel.set(labelKey, { value: normalizedOption, hasPrice })
      continue
    }

    // Prefer the richer representation that includes explicit price.
    if (!existing.hasPrice && hasPrice) {
      byLabel.set(labelKey, { value: normalizedOption, hasPrice: true })
    }
  }

  const deduped = Array.from(byLabel.values()).map((entry) => entry.value)
  return deduped.length ? deduped : undefined
}

function sanitizeCartItemCurrencyText(item: CartItem): CartItem {
  const uiLang = readUiLang()
  return {
    ...item,
    name: toSaudiCurrencySymbolText(item.name ?? '', uiLang),
    options: dedupeCartOptions(item.options, uiLang),
  }
}

function readStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return (parsed as CartItem[]).map(sanitizeCartItemCurrencyText)
  } catch {
    return []
  }
}

function persistCart(items: CartItem[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore storage write failures
  }
}

function normalizeCartLookupText(value: string): string {
  return toWesternDigits(value.trim().toLowerCase())
    .replace(CART_OPTION_BIDI_MARKS_REGEX, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function readUiLang(): 'ar' | 'en' {
  if (typeof document !== 'undefined') {
    const htmlLang = document.documentElement.getAttribute('lang')?.toLowerCase() ?? ''
    if (htmlLang.startsWith('en')) return 'en'
  }
  return 'ar'
}

function getRestaurantClosedMessage(): string {
  return readUiLang() === 'ar'
    ? 'المطعم مغلق حالياً ولا يمكن إتمام الشراء.'
    : 'Restaurant is currently unavailable for checkout.'
}

function hasArabicChars(value: string): boolean {
  return /[\u0600-\u06ff]/.test(value)
}

function pickPreferredCartName(existingName: string, incomingName: string): string {
  const existing = existingName.trim()
  const incoming = incomingName.trim()
  if (!existing) return incoming
  if (!incoming) return existing

  const uiLang = readUiLang()
  const existingIsArabic = hasArabicChars(existing)
  const incomingIsArabic = hasArabicChars(incoming)

  if (uiLang === 'ar' && incomingIsArabic && !existingIsArabic) return incoming
  if (uiLang === 'en' && !incomingIsArabic && existingIsArabic) return incoming
  return existing
}

function mergeCartPresentationData(previousItems: CartItem[], incomingItems: CartItem[]): CartItem[] {
  if (!previousItems.length || !incomingItems.length) return incomingItems.map(sanitizeCartItemCurrencyText)

  const normalizedPreviousItems = previousItems.map(sanitizeCartItemCurrencyText)
  const normalizedIncomingItems = incomingItems.map(sanitizeCartItemCurrencyText)

  return normalizedIncomingItems.map((incoming) => {
    const incomingName = normalizeCartLookupText(incoming.name)
    const incomingBaseId = (incoming.menuItemId?.trim() || incoming.id.split('__')[0]).trim()
    const incomingRestaurantId = incoming.restaurantId === 'restaurant' ? '' : incoming.restaurantId.trim()

    const fallback =
      normalizedPreviousItems.find((entry) => entry.id === incoming.id) ??
      normalizedPreviousItems.find(
        (entry) => {
          const entryBaseId = (entry.menuItemId?.trim() || entry.id.split('__')[0]).trim()
          const entryRestaurantId = entry.restaurantId === 'restaurant' ? '' : entry.restaurantId.trim()
          const restaurantMatches =
            incomingRestaurantId && entryRestaurantId
              ? entryRestaurantId === incomingRestaurantId
              : true

          return (
            restaurantMatches &&
            entryBaseId === incomingBaseId &&
            entry.quantity === incoming.quantity &&
            Math.abs(entry.price - incoming.price) < 0.0001
          )
        },
      ) ??
      normalizedPreviousItems.find(
        (entry) => {
          const entryBaseId = (entry.menuItemId?.trim() || entry.id.split('__')[0]).trim()
          if (!entryBaseId || entryBaseId !== incomingBaseId) return false

          const entryRestaurantId = entry.restaurantId === 'restaurant' ? '' : entry.restaurantId.trim()
          const restaurantMatches =
            incomingRestaurantId && entryRestaurantId
              ? entryRestaurantId === incomingRestaurantId
              : true
          if (!restaurantMatches) return false

          const optionOverlap = countOptionLabelOverlap(entry.options, incoming.options)
          if (optionOverlap > 0) return true

          return entry.quantity === incoming.quantity
        },
      ) ??
      normalizedPreviousItems.find(
        (entry) => {
          const entryRestaurantId = entry.restaurantId === 'restaurant' ? '' : entry.restaurantId.trim()
          const restaurantMatches =
            incomingRestaurantId && entryRestaurantId
              ? entryRestaurantId === incomingRestaurantId
              : true
          return (
            restaurantMatches &&
            normalizeCartLookupText(entry.name) === incomingName &&
            Math.abs(entry.price - incoming.price) < 0.0001
          )
        },
      )

    if (!fallback) return incoming

    // Prefer server/incoming options when available to avoid duplicating localized
    // addon labels (e.g. Arabic + English for the same addon) after language switches.
    const mergedOptions = dedupeCartOptions(
      incoming.options?.length ? incoming.options : fallback.options,
    )
    const normalizedIncomingOldPrice =
      Number.isFinite(incoming.oldPrice) && Number(incoming.oldPrice) > incoming.price
        ? Math.max(incoming.price, Number(incoming.oldPrice))
        : undefined
    const normalizedFallbackOldPrice =
      Number.isFinite(fallback.oldPrice) && Number(fallback.oldPrice) > incoming.price
        ? Math.max(incoming.price, Number(fallback.oldPrice))
        : undefined
    const normalizedIncomingBasePrice =
      Number.isFinite(incoming.basePrice)
        ? Math.max(0, Number(incoming.basePrice))
        : undefined
    const normalizedFallbackBasePrice =
      Number.isFinite(fallback.basePrice)
        ? Math.max(0, Number(fallback.basePrice))
        : undefined
    const normalizedIncomingVatPercentage =
      Number.isFinite(incoming.vatPercentage)
        ? Math.max(0, Number(incoming.vatPercentage))
        : undefined
    const normalizedFallbackVatPercentage =
      Number.isFinite(fallback.vatPercentage)
        ? Math.max(0, Number(fallback.vatPercentage))
        : undefined
    const mergedVatIncluded =
      incoming.vatIncluded === undefined ? fallback.vatIncluded : incoming.vatIncluded
    const mergedAddonIds =
      Array.isArray(incoming.addonIds) && incoming.addonIds.length
        ? incoming.addonIds
        : Array.isArray(fallback.addonIds) && fallback.addonIds.length
          ? fallback.addonIds
          : undefined

    return {
      ...incoming,
      // Keep stable presentation, but allow switching to a better localized name.
      name: pickPreferredCartName(fallback.name || '', incoming.name || ''),
      imageUrl: fallback.imageUrl || incoming.imageUrl,
      restaurantId: incomingRestaurantId || (fallback.restaurantId === 'restaurant' ? '' : fallback.restaurantId),
      menuItemId: incoming.menuItemId || fallback.menuItemId,
      addonIds: mergedAddonIds,
      vatPercentage: normalizedIncomingVatPercentage ?? normalizedFallbackVatPercentage,
      vatIncluded: mergedVatIncluded,
      basePrice: normalizedIncomingBasePrice ?? normalizedFallbackBasePrice,
      oldPrice: normalizedIncomingOldPrice ?? normalizedFallbackOldPrice,
      options: mergedOptions,
    }
  })
}

function getCartItemBaseId(item: Pick<CartItem, 'id' | 'menuItemId'>): string {
  return (item.menuItemId?.trim() || item.id.split('__')[0] || '').trim()
}

function normalizeCartRestaurantId(item: Pick<CartItem, 'restaurantId'>): string {
  const id = (item.restaurantId || '').trim()
  return id === 'restaurant' ? '' : id
}

function countOptionLabelOverlap(a: string[] | undefined, b: string[] | undefined): number {
  const uiLang = readUiLang()
  const aKeys = new Set(
    (a ?? [])
      .map((option) => normalizeCartOptionLabelKey(option, uiLang))
      .filter(Boolean),
  )
  if (aKeys.size === 0) return 0

  const bKeys = new Set(
    (b ?? [])
      .map((option) => normalizeCartOptionLabelKey(option, uiLang))
      .filter(Boolean),
  )
  if (bKeys.size === 0) return 0

  let overlap = 0
  for (const key of aKeys) {
    if (bKeys.has(key)) overlap += 1
  }
  return overlap
}

function applyAddItemClientHint(items: CartItem[], hintRaw: CartItem): CartItem[] {
  if (!items.length) return items

  const hint = sanitizeCartItemCurrencyText(hintRaw)
  const hintBaseId = getCartItemBaseId(hint)
  if (!hintBaseId) return items

  const hintRestaurantId = normalizeCartRestaurantId(hint)

  let targetIndex = items.findIndex((entry) => entry.id === hint.id)
  if (targetIndex < 0) {
    let bestScore = Number.NEGATIVE_INFINITY
    let bestIndex = -1

    for (let index = 0; index < items.length; index += 1) {
      const entry = items[index]
      const entryBaseId = getCartItemBaseId(entry)
      if (entryBaseId !== hintBaseId) continue

      const entryRestaurantId = normalizeCartRestaurantId(entry)
      const restaurantMatches =
        hintRestaurantId && entryRestaurantId ? hintRestaurantId === entryRestaurantId : true
      if (!restaurantMatches) continue

      const optionOverlap = countOptionLabelOverlap(entry.options, hint.options)
      const quantityScore = entry.quantity === hint.quantity ? 8 : 0
      const priceDistance = Math.abs(entry.price - hint.price)
      const priceScore = Number.isFinite(hint.price) ? Math.max(0, 8 - Math.min(8, priceDistance * 2)) : 0
      const score = optionOverlap * 20 + quantityScore + priceScore

      if (score > bestScore) {
        bestScore = score
        bestIndex = index
      }
    }

    targetIndex = bestIndex
  }

  if (targetIndex < 0) return items

  const target = items[targetIndex]
  const shouldPreferHintPrice =
    Number.isFinite(hint.price) &&
    hint.price >= 0 &&
    (hint.id.includes('addon:') || hint.id.includes('size:') || (hint.options?.length ?? 0) > 0)
  const normalizedHintOldPrice =
    Number.isFinite(hint.oldPrice) && Number(hint.oldPrice) > hint.price
      ? Math.max(hint.price, Number(hint.oldPrice))
      : undefined
  const normalizedHintBasePrice =
    Number.isFinite(hint.basePrice)
      ? Math.max(0, Number(hint.basePrice))
      : undefined
  const normalizedHintVatPercentage =
    Number.isFinite(hint.vatPercentage)
      ? Math.max(0, Number(hint.vatPercentage))
      : undefined
  const normalizedHintAddonIds =
    Array.isArray(hint.addonIds) && hint.addonIds.length ? hint.addonIds : undefined
  const mergedOptions = dedupeCartOptions(
    hint.options?.length ? hint.options : target.options,
  )

  return items.map((entry, index) =>
    index !== targetIndex
      ? entry
      : {
          ...entry,
          name: pickPreferredCartName(entry.name || '', hint.name || ''),
          imageUrl: hint.imageUrl || entry.imageUrl,
          restaurantId: normalizeCartRestaurantId(entry) || hintRestaurantId,
          menuItemId: getCartItemBaseId(hint) || entry.menuItemId,
          price: shouldPreferHintPrice ? Math.max(0, hint.price) : entry.price,
          addonIds: normalizedHintAddonIds ?? entry.addonIds,
          vatPercentage: normalizedHintVatPercentage ?? entry.vatPercentage,
          vatIncluded: hint.vatIncluded === undefined ? entry.vatIncluded : hint.vatIncluded,
          basePrice: normalizedHintBasePrice ?? entry.basePrice,
          oldPrice: shouldPreferHintPrice
            ? normalizedHintOldPrice ?? entry.oldPrice
            : entry.oldPrice ?? normalizedHintOldPrice,
          options: mergedOptions,
        },
  )
}

const initialState: CartState = {
  items: readStoredCart(),
  loading: false,
  error: null,
}

function replaceCartItemLocally(items: CartItem[], originalId: string, nextItemRaw: CartItem): CartItem[] {
  const nextItem = sanitizeCartItemCurrencyText(nextItemRaw)
  const targetIndex = items.findIndex((entry) => entry.id === originalId)
  if (targetIndex < 0) return items

  return items.map((entry, index) =>
    index !== targetIndex
      ? entry
      : {
          ...entry,
          ...nextItem,
          // Preserve the backend cart row id so follow-up update/remove requests
          // still target the real server-side cart item.
          id: entry.id,
          quantity: entry.quantity,
        },
  )
}

export const fetchCart = createAsyncThunk('cart/fetch', async () => {
  return await api.getCart()
})

export const addItem = createAsyncThunk('cart/addItem', async (item: CartItem) => {
  const restaurantId = normalizeCartRestaurantId(item)
  const restaurantClosedMessage = getRestaurantClosedMessage()

  if (restaurantId) {
    try {
      const restaurant = await api.getRestaurantById(restaurantId)
      if (restaurant?.isOpen === false) {
        throw new Error(restaurantClosedMessage)
      }
    } catch (error) {
      if (error instanceof Error && error.message === restaurantClosedMessage) {
        throw error
      }
      // Ignore restaurant status lookup failures and proceed with cart add request.
    }
  }

  return await api.addToCart(item)
})

export const updateItem = createAsyncThunk(
  'cart/updateItem',
  async (payload: { id: string; quantity: number; notes?: string }) => {
    return await api.updateCartItem(payload.id, payload.quantity, payload.notes)
  },
)

export const clearCart = createAsyncThunk('cart/clear', async () => {
  return await api.clearCart()
})
export const removeItem = createAsyncThunk('cart/removeItem', async (id: string) => {
  return await api.removeCartItem(id)
})

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    replaceItemLocally: (
      state,
      action: PayloadAction<{ originalId: string; nextItem: CartItem }>,
    ) => {
      state.items = replaceCartItemLocally(state.items, action.payload.originalId, action.payload.nextItem)
      persistCart(state.items)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false
        const incomingItems = action.payload

        // If API returns empty while we already have a cart (common during page navigation),
        // keep the current persisted cart instead of clearing it unexpectedly.
        if (incomingItems.length === 0 && state.items.length > 0) {
          const storedItems = readStoredCart()
          if (storedItems.length > 0) {
            state.items = storedItems
            persistCart(state.items)
            return
          }
        }

        state.items = mergeCartPresentationData(state.items, incomingItems)
        persistCart(state.items)
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Failed to load cart'
        if (!state.items.length) {
          state.items = readStoredCart()
        }
      })

      .addCase(addItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addItem.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.length === 0) {
          state.items = applyAddItemClientHint(state.items, action.meta.arg)
          persistCart(state.items)
          return
        }
        const merged = mergeCartPresentationData(state.items, action.payload)
        state.items = applyAddItemClientHint(merged, action.meta.arg)
        persistCart(state.items)
      })

      .addCase(updateItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.length === 0) {
          persistCart(state.items)
          return
        }
        const previousItem = state.items.find((entry) => entry.id === action.meta.arg.id)
        const mergedItems = mergeCartPresentationData(state.items, action.payload)
        state.items = previousItem ? applyAddItemClientHint(mergedItems, previousItem) : mergedItems
        persistCart(state.items)
      })

      .addCase(removeItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeItem.fulfilled, (state, action) => {
        state.loading = false
        const remainingItems = state.items.filter((entry) => entry.id !== action.meta.arg)
        if (action.payload.length === 0) {
          state.items = remainingItems
          persistCart(state.items)
          return
        }
        state.items = mergeCartPresentationData(remainingItems, action.payload)
        persistCart(state.items)
      })

      .addCase(clearCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false
        state.items = []
        persistCart(state.items)
      })

      .addCase(addItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Failed to add item to cart'
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Failed to update cart item'
      })
      .addCase(removeItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Failed to remove cart item'
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Failed to clear cart'
      })

      .addCase(logoutThunk.fulfilled, (state) => {
        state.items = []
        state.loading = false
        state.error = null
        persistCart([])
      })
  },
})

export const { replaceItemLocally } = cartSlice.actions

export default cartSlice.reducer

