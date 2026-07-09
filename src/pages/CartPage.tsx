import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import clsx from 'clsx'

import * as api from '@/api'
import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'
import CurrencyAmount from '@/components/ui/CurrencyAmount'
import CurrencyInlineText from '@/components/ui/CurrencyInlineText'
import Input from '@/components/ui/Input'
import type { MenuItem, MenuOption } from '@/data/menuData'

import { DeleteIcon, LockIcon, ShoppingCartIcon, TruckIcon } from '@/components/icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchCart, removeItem, replaceItemLocally, updateItem } from '@/store/slices/cartSlice'

import { useI18n } from '@/i18n/I18nProvider'
import { toast } from '@/lib/toast'
import { formatCurrency, toSaudiCurrencySymbolText } from '@/utils/format'
import { DEFAULT_RESTAURANTS_BROWSE_URL } from '@/utils/restaurantsRoute'

function resolveCartItemVatAmount(item: {
  taxableUnitPrice: number
  quantity: number
  vatPercentage?: number
}): number {
  const vatPercentage = Number(item.vatPercentage)
  if (!Number.isFinite(vatPercentage) || vatPercentage <= 0) return 0

  const safeQuantity = Math.max(1, Math.round(item.quantity))
  const lineSubtotal = Math.max(0, Math.max(0, Number(item.taxableUnitPrice)) * safeQuantity)
  if (lineSubtotal <= 0) return 0

  return Number((lineSubtotal * (Math.max(0, vatPercentage) / 100)).toFixed(2))
}

type SuggestedCartItem = {
  id: string
  cartItemId: string
  restaurantId: string
  menuItemId: string
  sourceUnitPrice: number
  sourceOptionsSignature: string
  mealName: string
  addonId: string
  addonLabel: string
  addonPrice: number
  image: string
  sizePart: string
  selectedAddonIds: string[]
}

type CartAddonDisplayItem = {
  id: string
  cartItemId: string
  mealName: string
  addonLabel: string
  addonPrice?: number
  image: string
}

function buildOptionsSignature(options: string[] | undefined, lang: 'ar' | 'en'): string {
  return uniqueOptionLabels(options ?? [], lang)
    .map((option) => normalizeLookupText(option))
    .filter(Boolean)
    .sort()
    .join('||')
}

function normalizeLookupText(value: string): string {
  return value
    .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function isSizeOptionLabel(value: string): boolean {
  const normalized = normalizeLookupText(value)
  if (!normalized) return false

  const arabicSizePrefix = '\u0627\u0644\u062d\u062c\u0645:'
  return (
    normalized.startsWith('size:') ||
    normalized.startsWith(arabicSizePrefix) ||
    normalized.startsWith('الحجم:') ||
    normalized.startsWith('Ø§Ù„Ø­Ø¬Ù…:')
  )
}

function parseAddonOptionText(optionText: string, lang: 'ar' | 'en'): { label: string; price?: number } | null {
  const raw = optionText.trim()
  if (!raw) return null

  if (isSizeOptionLabel(raw)) {
    return null
  }

  const priceGroup = raw.match(/\(([^()]*)\)\s*$/)
  const label = raw.replace(/\s*\([^()]*\)\s*$/, '').trim()
  if (!label) return null

  if (!priceGroup) {
    return { label: toSaudiCurrencySymbolText(label, lang) }
  }

  const normalizedPriceGroup = priceGroup[1]
    ?.replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    ?.replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 1776))
  const numberMatch = normalizedPriceGroup?.match(/-?\d+(?:[.,]\d+)?/)
  if (!numberMatch) {
    return { label: toSaudiCurrencySymbolText(label, lang) }
  }

  const parsedPrice = Number(numberMatch[0].replace(',', '.'))
  if (!Number.isFinite(parsedPrice)) {
    return { label: toSaudiCurrencySymbolText(label, lang) }
  }

  return { label: toSaudiCurrencySymbolText(label, lang), price: Math.max(0, parsedPrice) }
}

function parseCompositeCartId(id: string): { sizePart: string; addonIds: string[] } {
  const parts = id.split('__').filter(Boolean)
  const sizePart = parts.find((part) => part.startsWith('size:')) ?? 'size:none'
  const addonIds = parts
    .filter((part) => part.startsWith('addon:'))
    .map((part) => part.slice('addon:'.length))
    .filter(Boolean)
  return { sizePart, addonIds }
}

function matchesOptionLabel(options: string[] | undefined, label: string): boolean {
  const normalizedLabel = normalizeLookupText(label)
  if (!normalizedLabel) return false
  return (options ?? []).some((option) => normalizeLookupText(option).includes(normalizedLabel))
}

function uniqueOptionLabels(options: string[] | undefined, lang: 'ar' | 'en' = 'ar'): string[] {
  const unique: string[] = []
  const seen = new Set<string>()

  for (const option of options ?? []) {
    const normalizedOption = option.trim()
    if (!normalizedOption) continue

    const parsedOption = parseAddonOptionText(normalizedOption, lang)
    const dedupeKey = parsedOption
      ? `addon:${normalizeLookupText(parsedOption.label)}`
      : `raw:${normalizeLookupText(normalizedOption)}`

    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)
    unique.push(normalizedOption)
  }

  return unique
}

function normalizeDigits(value: string): string {
  return value
    .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 1776))
}

function getAddonPriceFromOptionText(optionText: string): number | null {
  if (isSizeOptionLabel(optionText)) {
    return null
  }

  const priceGroup = optionText.trim().match(/\(([^()]*)\)\s*$/)?.[1]
  if (!priceGroup) return null

  const numberMatch = normalizeDigits(priceGroup).match(/-?\d+(?:[.,]\d+)?/)
  if (!numberMatch) return null

  const parsedPrice = Number(numberMatch[0].replace(',', '.'))
  if (!Number.isFinite(parsedPrice)) return null

  return Math.max(0, parsedPrice)
}

function getCartItemAddonsPricePerUnit(options: string[] | undefined, lang: 'ar' | 'en'): number {
  const itemOptions = uniqueOptionLabels(options ?? [], lang)
  return itemOptions.reduce((optionSum, optionText) => {
    const addonPrice = getAddonPriceFromOptionText(optionText)
    if (typeof addonPrice !== 'number') return optionSum
    return optionSum + addonPrice
  }, 0)
}

function isCartItemPriceIncludingOptions(cartItemId: string): boolean {
  const normalizedId = cartItemId.trim().toLowerCase()
  if (!normalizedId) return false
  return normalizedId.includes('addon:') || normalizedId.includes('size:')
}

function resolveCartItemBaseUnitPrice(
  item: { id: string; price: number; basePrice?: number; options?: string[] },
  options: string[] | undefined,
  lang: 'ar' | 'en',
): number {
  if (typeof item.basePrice === 'number' && Number.isFinite(item.basePrice)) {
    return Math.max(0, item.basePrice)
  }

  const addonsPerUnit = getCartItemAddonsPricePerUnit(options, lang)
  if (isCartItemPriceIncludingOptions(item.id)) {
    return Math.max(0, item.price - addonsPerUnit)
  }

  return Math.max(0, item.price)
}

function getCartItemBaseMenuId(item: { id: string; menuItemId?: string }): string {
  const explicitMenuItemId = item.menuItemId?.trim()
  if (explicitMenuItemId) return explicitMenuItemId
  return item.id.split('__')[0]?.trim() ?? ''
}

function hasAddonSelectedInCartItem(
  item: { id: string; options?: string[] },
  addonId: string,
  addonLabel: string,
): boolean {
  const fromCompositeId = parseCompositeCartId(item.id).addonIds.includes(addonId)
  if (fromCompositeId) return true
  return matchesOptionLabel(item.options, addonLabel)
}

function findMenuItemForCartItem(
  menuItems: MenuItem[],
  cartItemId: string,
  cartItemName: string,
  cartItemMenuItemId?: string,
): MenuItem | undefined {
  const normalizedMenuItemId = cartItemMenuItemId?.trim()
  if (normalizedMenuItemId) {
    const byMenuItemId = menuItems.find((entry) => entry.id === normalizedMenuItemId)
    if (byMenuItemId) return byMenuItemId
  }

  const baseId = cartItemId.split('__')[0]
  const byId = menuItems.find((entry) => entry.id === baseId)
  if (byId) return byId

  const normalizedName = normalizeLookupText(cartItemName)
  if (!normalizedName) return undefined

  return (
    menuItems.find((entry) => normalizeLookupText(entry.name) === normalizedName) ??
    menuItems.find((entry) => normalizeLookupText(entry.name).includes(normalizedName))
  )
}

function pickLocalizedMenuText(
  lang: 'ar' | 'en',
  values: { ar?: string; en?: string; base?: string },
): string {
  const ar = values.ar?.trim() || ''
  const en = values.en?.trim() || ''
  const base = values.base?.trim() || ''
  if (lang === 'ar') return toSaudiCurrencySymbolText(ar || base || en, lang)
  return toSaudiCurrencySymbolText(en || base || ar, lang)
}

function getLocalizedMenuItemName(
  item: Pick<MenuItem, 'name' | 'nameAr' | 'nameEn'>,
  lang: 'ar' | 'en',
): string {
  return pickLocalizedMenuText(lang, {
    ar: item.nameAr,
    en: item.nameEn,
    base: item.name,
  })
}

function getLocalizedMenuOptionLabel(
  option: Pick<MenuOption, 'label' | 'labelAr' | 'labelEn'>,
  lang: 'ar' | 'en',
): string {
  return pickLocalizedMenuText(lang, {
    ar: option.labelAr,
    en: option.labelEn,
    base: option.label,
  })
}

function getMenuOptionLookupLabels(option: Pick<MenuOption, 'label' | 'labelAr' | 'labelEn'>): string[] {
  return [option.label, option.labelAr, option.labelEn]
    .map((value) => (value ?? '').trim())
    .filter(Boolean)
}

function normalizeAddonIdList(values: Array<string | number> | undefined): string[] {
  if (!Array.isArray(values)) return []
  const unique = new Set<string>()
  const rows: string[] = []

  for (const value of values) {
    const normalized = String(value ?? '').trim()
    if (!normalized || unique.has(normalized)) continue
    unique.add(normalized)
    rows.push(normalized)
  }

  return rows
}

function dedupeMenuAddonOptions(addons: Array<Pick<MenuOption, 'id' | 'label' | 'labelAr' | 'labelEn' | 'price'>>): MenuOption[] {
  const rows: MenuOption[] = []
  const keyToIndex = new Map<string, number>()

  const getKeys = (addon: Pick<MenuOption, 'id' | 'label' | 'labelAr' | 'labelEn'>): string[] => {
    const keys = [
      addon.id?.trim() ? `id:${addon.id.trim()}` : '',
      ...getMenuOptionLookupLabels(addon).map((label) => `label:${normalizeLookupText(label)}`),
    ].filter(Boolean)
    return Array.from(new Set(keys))
  }

  for (const addon of addons) {
    const keys = getKeys(addon)
    if (keys.length === 0) continue

    let existingIndex = -1
    for (const key of keys) {
      const found = keyToIndex.get(key)
      if (found !== undefined) {
        existingIndex = found
        break
      }
    }

    if (existingIndex < 0) {
      rows.push({
        id: addon.id,
        label: addon.label,
        labelAr: addon.labelAr,
        labelEn: addon.labelEn,
        price: addon.price,
      })
      const nextIndex = rows.length - 1
      keys.forEach((key) => keyToIndex.set(key, nextIndex))
      continue
    }

    const existing = rows[existingIndex]
    rows[existingIndex] = {
      id: existing.id || addon.id,
      label: existing.label || addon.label,
      labelAr: existing.labelAr || addon.labelAr,
      labelEn: existing.labelEn || addon.labelEn,
      price: existing.price,
    }
    keys.forEach((key) => keyToIndex.set(key, existingIndex))
  }

  return rows
}

export default function CartPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { t, lang } = useI18n()

  const user = useAppSelector((s) => s.auth.user)
  const items = useAppSelector((s) => s.cart.items)
  const totalItemCount = useMemo(
    () =>
      items.reduce((sum, item) => {
        const safeQuantity = Math.max(1, Math.round(item.quantity))
        return sum + safeQuantity
      }, 0),
    [items],
  )
  const [suggestedItems, setSuggestedItems] = useState<SuggestedCartItem[]>([])
  const [resolvedOptionsByItemId, setResolvedOptionsByItemId] = useState<Record<string, string[]>>({})
  const [resolvedMealNamesByItemId, setResolvedMealNamesByItemId] = useState<Record<string, string>>({})

  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const [appliedPromoCode, setAppliedPromoCode] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [notes, setNotes] = useState('')

  const currencyLabel = t('currency.sar')
  const addonsTotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const itemOptions = resolvedOptionsByItemId[item.id] ?? item.options ?? []
        const addonsPerUnit = getCartItemAddonsPricePerUnit(itemOptions, lang)
        return sum + addonsPerUnit * item.quantity
      }, 0),
    [items, resolvedOptionsByItemId, lang],
  )
  const subtotalWithoutAddons = useMemo(
    () =>
      items.reduce((sum, item) => {
        const itemOptions = resolvedOptionsByItemId[item.id] ?? item.options ?? []
        const baseUnitPrice = resolveCartItemBaseUnitPrice(item, itemOptions, lang)
        return sum + baseUnitPrice * item.quantity
      }, 0),
    [items, resolvedOptionsByItemId, lang],
  )
  const orderSubtotal = useMemo(
    () => subtotalWithoutAddons + addonsTotal,
    [subtotalWithoutAddons, addonsTotal],
  )
  const primaryRestaurantId = useMemo(
    () => items.find((entry) => entry.restaurantId && entry.restaurantId !== 'restaurant')?.restaurantId ?? '',
    [items],
  )
  const cartRestaurantIds = useMemo(
    () =>
      Array.from(
        new Set(
          items
            .map((entry) => entry.restaurantId?.trim() ?? '')
            .filter((restaurantId) => restaurantId && restaurantId.toLowerCase() !== 'restaurant'),
        ),
      ),
    [items],
  )
  const [restaurantOpenStatusById, setRestaurantOpenStatusById] = useState<Record<string, boolean>>({})
  const closedRestaurantIds = useMemo(
    () => cartRestaurantIds.filter((restaurantId) => restaurantOpenStatusById[restaurantId] === false),
    [cartRestaurantIds, restaurantOpenStatusById],
  )
  const hasClosedRestaurantInCart = closedRestaurantIds.length > 0
  const isRestaurantClosed = useCallback(
    (restaurantId?: string) => {
      const normalizedRestaurantId = restaurantId?.trim() ?? ''
      if (!normalizedRestaurantId || normalizedRestaurantId.toLowerCase() === 'restaurant') return false
      return restaurantOpenStatusById[normalizedRestaurantId] === false
    },
    [restaurantOpenStatusById],
  )
  const total = useMemo(() => orderSubtotal - discount, [orderSubtotal, discount])
  const vatRate = useMemo(
    () => Math.max(0, Number(items.find((item) => Number(item.vatPercentage) > 0)?.vatPercentage || 0)),
    [items],
  )
  const vatTotal = useMemo(
    () => Number((Math.max(0, subtotalWithoutAddons) * (vatRate / 100)).toFixed(2)),
    [subtotalWithoutAddons, vatRate],
  )
  const selectedAddonItems = useMemo(() => {
    const rows: CartAddonDisplayItem[] = []
    const seen = new Set<string>()

    for (const item of items) {
      const itemOptions = uniqueOptionLabels(resolvedOptionsByItemId[item.id] ?? item.options ?? [], lang)

      for (let optionIndex = 0; optionIndex < itemOptions.length; optionIndex += 1) {
        const optionText = itemOptions[optionIndex]
        const parsedOption = parseAddonOptionText(optionText, lang)
        if (!parsedOption) continue

        const dedupeKey = `${item.id}::${normalizeLookupText(parsedOption.label)}`
        if (seen.has(dedupeKey)) continue
        seen.add(dedupeKey)

        rows.push({
          id: `${item.id}__selected_addon:${optionIndex}`,
          cartItemId: item.id,
          mealName: resolvedMealNamesByItemId[item.id] || item.name,
          addonLabel: parsedOption.label,
          addonPrice: parsedOption.price,
          image: item.imageUrl || '/images/dish-1.jpg',
        })
      }
    }

    return rows
  }, [items, resolvedOptionsByItemId, resolvedMealNamesByItemId, lang])

  useEffect(() => {
    let active = true

    async function resolveRestaurantsAvailability() {
      if (cartRestaurantIds.length === 0) {
        if (active) setRestaurantOpenStatusById({})
        return
      }

      try {
        const restaurants = await api.getRestaurantsByIds(cartRestaurantIds)
        if (!active) return

        const nextStatusById: Record<string, boolean> = {}
        for (const restaurantId of cartRestaurantIds) {
          nextStatusById[restaurantId] = true
        }
        for (const restaurant of restaurants) {
          const normalizedRestaurantId = restaurant.id?.trim()
          if (!normalizedRestaurantId) continue
          nextStatusById[normalizedRestaurantId] = restaurant.isOpen !== false
        }

        setRestaurantOpenStatusById(nextStatusById)
      } catch {
        if (!active) return

        setRestaurantOpenStatusById((prev) => {
          const next: Record<string, boolean> = {}
          for (const restaurantId of cartRestaurantIds) {
            next[restaurantId] = prev[restaurantId] ?? true
          }
          return next
        })
      }
    }

    void resolveRestaurantsAvailability()
    return () => {
      active = false
    }
  }, [cartRestaurantIds])

  useEffect(() => {
    let active = true

    async function loadSuggestions() {
      const fallbackMealNames = items.reduce<Record<string, string>>((acc, item) => {
        acc[item.id] = toSaudiCurrencySymbolText(item.name, lang)
        return acc
      }, {})

      if (!primaryRestaurantId) {
        if (active) {
          setSuggestedItems([])
          setResolvedOptionsByItemId({})
          setResolvedMealNamesByItemId(fallbackMealNames)
        }
        return
      }

      try {
        const menu = await api.getRestaurantMenu(primaryRestaurantId)
        const suggestions: SuggestedCartItem[] = []
        const resolvedOptions: Record<string, string[]> = {}
        const resolvedMealNames: Record<string, string> = { ...fallbackMealNames }

        for (const cartItem of items) {
          if (cartItem.options?.length) {
            resolvedOptions[cartItem.id] = uniqueOptionLabels(
              cartItem.options.map((option) => toSaudiCurrencySymbolText(option, lang)),
              lang,
            )
          }

          const menuItem = findMenuItemForCartItem(menu.items, cartItem.id, cartItem.name, cartItem.menuItemId)
          if (!menuItem) continue
          const localizedMealName = getLocalizedMenuItemName(menuItem, lang) || toSaudiCurrencySymbolText(cartItem.name, lang)
          resolvedMealNames[cartItem.id] = localizedMealName

          const composite = parseCompositeCartId(cartItem.id)
          const selectedAddonIds = new Set<string>([
            ...composite.addonIds,
            ...normalizeAddonIdList(cartItem.addonIds),
          ])
          let sizePart = composite.sizePart
          let selectedSizeOptionText = ''

          if (menuItem.sizes?.length) {
            const selectedSizeId = composite.sizePart.startsWith('size:') ? composite.sizePart.slice('size:'.length) : ''
            const matchedSize =
              menuItem.sizes.find((size) => size.id === selectedSizeId) ??
              menuItem.sizes.find((size) => getMenuOptionLookupLabels(size).some((label) => matchesOptionLabel(cartItem.options, label)))

            if (matchedSize) {
              sizePart = `size:${matchedSize.id}`
              const sizeOptionLabel = getLocalizedMenuOptionLabel(matchedSize, lang)
              const sizeLabel = t('restaurant.optionSize', { label: sizeOptionLabel })
              selectedSizeOptionText = `${sizeLabel} (${formatCurrency(matchedSize.price, lang, currencyLabel)})`
            }
          }

          const menuAddons = dedupeMenuAddonOptions(menuItem.addons ?? [])
          if (menuAddons.length) {
            for (const addon of menuAddons) {
              if (getMenuOptionLookupLabels(addon).some((label) => matchesOptionLabel(cartItem.options, label))) {
                selectedAddonIds.add(addon.id)
              }
            }

            const resolvedAddonOptions = menuAddons
              .filter((addon) => selectedAddonIds.has(addon.id))
              .map((addon) => {
                const addonLabel = getLocalizedMenuOptionLabel(addon, lang)
                return `${addonLabel} (${formatCurrency(addon.price, lang, currencyLabel)})`
              })
            const canonicalOptions = [
              ...(selectedSizeOptionText ? [selectedSizeOptionText] : []),
              ...resolvedAddonOptions,
            ]
            if (canonicalOptions.length) {
              resolvedOptions[cartItem.id] = uniqueOptionLabels(canonicalOptions, lang)
            }
          }

          const sourceOptionsForSuggestion = resolvedOptions[cartItem.id] ?? cartItem.options ?? []
          const sourceOptionsSignature = buildOptionsSignature(sourceOptionsForSuggestion, lang)

          if (!menuAddons.length) continue

          for (const addon of menuAddons) {
            if (selectedAddonIds.has(addon.id)) continue

            suggestions.push({
              id: `${cartItem.id}__addon_suggestion:${addon.id}`,
              cartItemId: cartItem.id,
              restaurantId: primaryRestaurantId,
              menuItemId: menuItem.id,
              sourceUnitPrice: cartItem.price,
              sourceOptionsSignature,
              mealName: localizedMealName,
              addonId: addon.id,
              addonLabel: getLocalizedMenuOptionLabel(addon, lang),
              addonPrice: addon.price,
              image: cartItem.imageUrl || menuItem.imageUrl || '/images/dish-1.jpg',
              sizePart,
              selectedAddonIds: Array.from(selectedAddonIds),
            })
          }
        }

        if (!active) return
        const dedupedSuggestions: SuggestedCartItem[] = []
        const seenSuggestionKeys = new Set<string>()
        for (const suggestion of suggestions) {
          const keys = [
            `${suggestion.cartItemId}::id:${normalizeLookupText(suggestion.addonId)}`,
            `${suggestion.cartItemId}::label:${normalizeLookupText(suggestion.addonLabel)}`,
          ]
          if (keys.some((key) => seenSuggestionKeys.has(key))) continue
          keys.forEach((key) => seenSuggestionKeys.add(key))
          dedupedSuggestions.push(suggestion)
        }

        setSuggestedItems(dedupedSuggestions.slice(0, 8))
        setResolvedOptionsByItemId(resolvedOptions)
        setResolvedMealNamesByItemId(resolvedMealNames)
      } catch {
        if (!active) return
        const fallbackOptions = items.reduce<Record<string, string[]>>((acc, item) => {
          if (item.options?.length) {
            acc[item.id] = uniqueOptionLabels(item.options.map((option) => toSaudiCurrencySymbolText(option, lang)), lang)
          }
          return acc
        }, {})
        setSuggestedItems([])
        setResolvedOptionsByItemId(fallbackOptions)
        setResolvedMealNamesByItemId(fallbackMealNames)
      }
    }

    void loadSuggestions()
    return () => {
      active = false
    }
  }, [items, primaryRestaurantId, lang, currencyLabel, t])

  async function applyCoupon() {
    const code = coupon.trim()
    if (!code) {
      setDiscount(0)
      setAppliedPromoCode('')
      return
    }

    try {
      setApplyingCoupon(true)
      const result = await api.validatePromoCode({
        code,
        restaurantId: primaryRestaurantId || undefined,
        subtotal: orderSubtotal,
      })

      if (!result.valid) {
        setDiscount(0)
        setAppliedPromoCode('')
        toast.error(result.message || t('cart.toast.invalidCoupon'))
        return
      }

      const maxDiscount = Math.max(0, orderSubtotal)
      const normalizedDiscount = Math.min(maxDiscount, Math.max(0, Number(result.discount || 0)))

      setDiscount(normalizedDiscount)
      setAppliedPromoCode(code)
      toast.success(result.message || t('cart.toast.discountApplied'))
    } catch (error) {
      setDiscount(0)
      setAppliedPromoCode('')
      toast.error(api.resolveApiErrorMessage(error, t('cart.toast.invalidCoupon')))
    } finally {
      setApplyingCoupon(false)
    }
  }

  async function addAddonToCart(target: SuggestedCartItem) {
    if (!user) {
      navigate('/login')
      return
    }
    if (isRestaurantClosed(target.restaurantId)) {
      toast.error(t('restaurant.unavailable'))
      return
    }

    const sameIdCandidates = items.filter((entry) => entry.id === target.cartItemId)
    const sourceItem =
      sameIdCandidates.find((entry) => {
        if (getCartItemBaseMenuId(entry) !== target.menuItemId) return false
        if (Math.abs(entry.price - target.sourceUnitPrice) >= 0.0001) return false

        const entryOptionsSignature = buildOptionsSignature(resolvedOptionsByItemId[entry.id] ?? entry.options ?? [], lang)
        return entryOptionsSignature === target.sourceOptionsSignature
      }) ??
      sameIdCandidates.find((entry) => getCartItemBaseMenuId(entry) === target.menuItemId) ??
      sameIdCandidates[0]
    if (!sourceItem) {
      toast.error(t('cart.toast.itemUnavailable'))
      return
    }

    const normalizedAddonLabel = toSaudiCurrencySymbolText(target.addonLabel, lang)
    const sourceAddonIds = new Set<string>([
      ...parseCompositeCartId(sourceItem.id).addonIds,
      ...normalizeAddonIdList(sourceItem.addonIds),
    ])
    if (sourceAddonIds.has(target.addonId)) {
      toast.info(t('toast.soon'))
      return
    }

    const nextAddonIds = Array.from(new Set([...sourceAddonIds, target.addonId])).sort((a, b) => a.localeCompare(b))
    const sourceItemOptions = resolvedOptionsByItemId[sourceItem.id] ?? sourceItem.options ?? []
    const nextOptions = uniqueOptionLabels(sourceItemOptions, lang)
    if (!matchesOptionLabel(nextOptions, normalizedAddonLabel)) {
      nextOptions.push(`${normalizedAddonLabel} (${formatCurrency(target.addonPrice, lang, currencyLabel)})`)
    }

    const sourceBasePrice = resolveCartItemBaseUnitPrice(sourceItem, sourceItemOptions, lang)
    const nextItem = {
      ...sourceItem,
      addonIds: nextAddonIds,
      options: nextOptions,
      price: Math.max(0, sourceBasePrice + getCartItemAddonsPricePerUnit(nextOptions, lang)),
      basePrice: sourceBasePrice,
      quantity: sourceItem.quantity,
    }

    try {
      dispatch(replaceItemLocally({
        originalId: sourceItem.id,
        nextItem,
      }))
      toast.success(t('toast.cartUpdated'))
    } catch (error) {
      toast.error(api.resolveApiErrorMessage(error, t('toast.failed')))
    }
  }

  return (
    <div>
      <div className="bg-primary/10">
        <Container className="py-5">
          <div className="text-sm font-bold text-muted">
            <Link to="/home" className="hover:text-primary">{t('nav.home')}</Link>
            <span className="mx-2">/</span>
            <span className="text-navy">{t('nav.cart')}</span>
          </div>
        </Container>
      </div>

      <section className="py-12">
        <Container>
          <h1 className="text-2xl font-semibold text-navy md:text-3xl mb-8">{t('cart.title')}</h1>
          {items.length === 0 ? (
            <div className="rounded-3xl border border-border bg-white p-10 text-center shadow-card">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShoppingCartIcon />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-navy">{t('cart.empty')}</h2>
              <div className="mt-6">
                <Link to={DEFAULT_RESTAURANTS_BROWSE_URL}>
                  <Button>{t('cart.browseRestaurants')}</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8 lg:flex-row">
              <div className="flex-1">
                <div className="rounded-3xl border border-border bg-white p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-extrabold text-navy">{t('cart.mealDetails')}</h2>
                    <span className="text-sm font-bold text-muted">{t('cart.itemsCount', { count: totalItemCount })}</span>
                  </div>

                  <div className="mt-5 grid grid-cols-12 gap-4 border-b border-border pb-4 text-xs font-bold text-muted">
                    <div className="col-span-6">{t('cart.mealDetails')}</div>
                    <div className="col-span-2 text-center">{t('cart.quantity')}</div>
                    <div className="col-span-3 text-center">{t('cart.price')}</div>
                    <div className="col-span-1 text-center">{t('cart.delete')}</div>
                  </div>

                  <div className="mt-4 space-y-4">
                    {items.map((item) => {
                      const itemOptions = resolvedOptionsByItemId[item.id] ?? item.options ?? []
                      const uniqueItemOptions = uniqueOptionLabels(itemOptions, lang)
                      const addonsPerUnit = getCartItemAddonsPricePerUnit(itemOptions, lang)
                      const baseUnitPrice = resolveCartItemBaseUnitPrice(item, itemOptions, lang)
                      const oldBaseUnitPrice =
                        typeof item.oldPrice === 'number'
                          ? (() => {
                              const adjustedOldPrice = Math.max(0, item.oldPrice - addonsPerUnit)
                              if (adjustedOldPrice > baseUnitPrice + 0.0001) return adjustedOldPrice
                              if (item.oldPrice > baseUnitPrice + 0.0001 && addonsPerUnit <= 0.0001) return item.oldPrice
                              return null
                            })()
                          : null

                      return (
                        <div key={item.id} className="grid grid-cols-12 items-center gap-4">
                        <div className="col-span-6 flex items-center gap-4">
                          <img src={item.imageUrl || '/images/dish-1.jpg'} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                          <div className="text-start">
                            <div className="text-sm font-extrabold text-navy [unicode-bidi:plaintext]" dir="auto">
                              {toSaudiCurrencySymbolText(resolvedMealNamesByItemId[item.id] || item.name, lang)}
                            </div>
                            {uniqueItemOptions.length ? (
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {uniqueItemOptions.map((option, index) => (
                                  <span
                                    key={`${item.id}-option-${index}`}
                                    className="inline-flex rounded-full bg-screen px-2.5 py-0.5 text-[11px] font-semibold text-muted [unicode-bidi:plaintext]"
                                    dir="auto"
                                  >
                                    <CurrencyInlineText text={option} lang={lang} />
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="col-span-2 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-white text-navy hover:bg-screen"
                            onClick={async () => {
                              try {
                                await dispatch(updateItem({ id: item.id, quantity: item.quantity - 1 })).unwrap()
                                if (item.quantity - 1 <= 0) toast.success(t('toast.removedFromCart'))
                              } catch (error) {
                                toast.error(api.resolveApiErrorMessage(error, t('toast.failed')))
                              }
                            }}
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-extrabold text-navy">{item.quantity}</span>
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-white text-navy hover:bg-screen"
                            onClick={async () => {
                              if (isRestaurantClosed(item.restaurantId)) {
                                toast.error(t('restaurant.unavailable'))
                                return
                              }
                              try {
                                await dispatch(updateItem({ id: item.id, quantity: item.quantity + 1 })).unwrap()
                              } catch (error) {
                                toast.error(api.resolveApiErrorMessage(error, t('toast.failed')))
                              }
                            }}
                            disabled={isRestaurantClosed(item.restaurantId)}
                          >
                            +
                          </button>
                        </div>

                        <div className="col-span-3 text-center">
                          {typeof oldBaseUnitPrice === 'number' ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-xs font-bold text-muted line-through">
                                <CurrencyAmount amount={oldBaseUnitPrice * item.quantity} lang={lang} currencyLabel={t('currency.sar')} />
                              </span>
                              <span className="text-base font-extrabold text-navy">
                                <CurrencyAmount amount={baseUnitPrice * item.quantity} lang={lang} currencyLabel={t('currency.sar')} />
                              </span>
                            </div>
                          ) : (
                            <span className="text-base font-extrabold text-navy">
                              <CurrencyAmount amount={baseUnitPrice * item.quantity} lang={lang} currencyLabel={t('currency.sar')} />
                            </span>
                          )}
                        </div>

                        <div className="col-span-1 flex justify-center">
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-danger/10 text-danger hover:bg-danger/15"
                            onClick={async () => {
                              try {
                                await dispatch(removeItem(item.id)).unwrap()
                                await dispatch(fetchCart()).unwrap()
                                toast.success(t('toast.removedFromCart'))
                              } catch (error) {
                                toast.error(api.resolveApiErrorMessage(error, t('toast.failed')))
                              }
                            }}
                            aria-label={t('cart.aria.remove')}
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </div>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-6 rounded-3xl border border-border bg-white p-6 shadow-card">
                  <div className="flex items-center gap-2 text-navy">
                    <TruckIcon className="text-primary" />
                    <h3 className="text-base font-extrabold">{t('cart.orderNotes')}</h3>
                    <span className="text-xs text-muted">({t('common.optional')})</span>
                  </div>

                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('cart.notesPlaceholder')}
                    className="mt-4 h-28 w-full rounded-3xl border border-border bg-white p-4 text-start text-sm font-semibold outline-none transition focus:border-primary"
                  />
                </div>

                <div className="mt-6 rounded-3xl border border-border bg-white p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-navy">{t('cart.suggestions')}</h3>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {suggestedItems.length === 0 && selectedAddonItems.length === 0 ? (
                      <div className="rounded-2xl border border-border bg-screen p-4 text-sm text-muted md:col-span-2">
                        {t('cart.noMealAddons')}
                      </div>
                    ) : null}

                    {selectedAddonItems.map((it) => (
                      <div key={it.id} className="flex items-center gap-4 rounded-3xl border border-border bg-screen p-4">
                        <img src={it.image} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-muted [unicode-bidi:plaintext]" dir="auto">{toSaudiCurrencySymbolText(it.mealName, lang)}</div>
                          <div className="mt-1 text-sm font-extrabold text-navy [unicode-bidi:plaintext]" dir="auto">{toSaudiCurrencySymbolText(it.addonLabel, lang)}</div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-sm font-extrabold text-primary">
                              {typeof it.addonPrice === 'number' ? (
                                <CurrencyAmount amount={it.addonPrice} lang={lang} currencyLabel={currencyLabel} />
                              ) : (
                                t('cart.addedInCart')
                              )}
                            </div>
                            <span className="inline-flex rounded-full bg-success/10 px-3 py-1 text-xs font-extrabold text-success">
                              {t('cart.addedBadge')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {suggestedItems.map((it) => (
                      <div key={it.id} className="flex items-center gap-4 rounded-3xl border border-border bg-screen p-4">
                        <img src={it.image} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-muted [unicode-bidi:plaintext]" dir="auto">{toSaudiCurrencySymbolText(it.mealName, lang)}</div>
                          <div className="mt-1 text-sm font-extrabold text-navy [unicode-bidi:plaintext]" dir="auto">{toSaudiCurrencySymbolText(it.addonLabel, lang)}</div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-sm font-extrabold text-primary">
                              <CurrencyAmount amount={it.addonPrice} lang={lang} currencyLabel={currencyLabel} />
                            </div>
                            <Button
                              size="sm"
                              className="h-9 rounded-2xl px-4"
                              onClick={() => void addAddonToCart(it)}
                              disabled={isRestaurantClosed(it.restaurantId)}
                            >
                              {t('cart.add')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="w-full lg:w-[360px]">
                <div className="overflow-hidden rounded-[32px] bg-navy text-white shadow-[0_22px_44px_rgba(3,8,31,0.24)]">
                  <div className="bg-primary px-6 py-5">
                    <div className="flex items-center justify-between">
                      <div className="text-base font-extrabold tracking-tight">{t('checkout.summary.title')}</div>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/25 bg-white/20 text-white">
                        <ShoppingCartIcon size={18} />
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-1 text-sm">
                      <Row
                        label={t('checkout.summary.subtotal')}
                        value={<CurrencyAmount amount={subtotalWithoutAddons} lang={lang} currencyLabel={t('currency.sar')} />}
                      />
                      <Row
                        label={t('checkout.summary.addons')}
                        value={<CurrencyAmount amount={addonsTotal} lang={lang} currencyLabel={t('currency.sar')} />}
                      />
                      <Row
                        label={t('checkout.summary.vat')}
                        value={<CurrencyAmount amount={vatTotal} lang={lang} currencyLabel={t('currency.sar')} />}
                      />
                      {discount > 0 ? (
                        <Row
                          label={t('checkout.summary.discount')}
                          value={<CurrencyAmount amount={-discount} lang={lang} currencyLabel={t('currency.sar')} />}
                          valueClassName="text-success"
                        />
                      ) : null}
                    </div>

                    <div className="mt-5 flex min-w-0 items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <Input
                          value={coupon}
                          onChange={(e) => {
                            const nextValue = e.target.value
                            setCoupon(nextValue)

                            if (appliedPromoCode && nextValue.trim() !== appliedPromoCode) {
                              setAppliedPromoCode('')
                              setDiscount(0)
                            }
                          }}
                          placeholder={t('checkout.summary.coupon')}
                          className="h-12 rounded-full border-2 border-white/30 bg-white/5 text-white placeholder:text-white/50 focus:border-primary focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                      <Button
                        size="sm"
                        className="h-12 shrink-0 rounded-2xl bg-primary px-5 font-extrabold text-white shadow-soft hover:brightness-110"
                        onClick={applyCoupon}
                        disabled={applyingCoupon}
                      >
                        {t('common.apply')}
                      </Button>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xl font-extrabold">
                      <span>{t('checkout.summary.total')}</span>
                      <span className="text-primary">
                        <CurrencyAmount amount={total} lang={lang} currencyLabel={t('currency.sar')} />
                      </span>
                    </div>

                    <Button
                      className="mt-5 h-12 w-full rounded-full text-base font-extrabold tracking-tight"
                      onClick={() => {
                        if (hasClosedRestaurantInCart) {
                          toast.error(t('restaurant.unavailable'))
                          return
                        }
                        if (!user) {
                          navigate('/login')
                          return
                        }

                        navigate('/checkout', {
                          state: appliedPromoCode ? { promoCode: appliedPromoCode, discount } : undefined,
                        })
                      }}
                      disabled={hasClosedRestaurantInCart}
                    >
                      {t('cart.checkout')}
                    </Button>
                    {hasClosedRestaurantInCart ? (
                      <div className="mt-3 rounded-2xl border border-danger/40 bg-danger/10 px-3 py-2 text-xs font-bold text-danger">
                        {t('restaurant.unavailable')}
                      </div>
                    ) : null}

                    <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-white/65">
                      <LockIcon size={14} className="text-success" />
                      <span>{t('checkout.secure')}</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </Container>
      </section>
    </div>
  )
}

function Row({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: ReactNode
  valueClassName?: string
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-white/70">{label}</span>
      <span className={clsx('text-base font-extrabold tracking-tight text-white', valueClassName)}>{value}</span>
    </div>
  )
}


