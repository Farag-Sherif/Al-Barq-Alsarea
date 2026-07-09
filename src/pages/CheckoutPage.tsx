import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'

import {
  getRestaurantBranches,
  checkRestaurantDelivery,
  getRestaurantMenu,
  getRestaurantsByIds,
  getRestaurantStates,
  getCities,
  getCitiesByStateId,
  getCityById,
  getDataSourceMode,
  getStates,
  resolveApiErrorMessage,
  validatePromoCode,
  type RestaurantBranch,
  type StateOption,
} from '@/api'
import type { MenuItem } from '@/data/menuData'
import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'
import CurrencyAmount from '@/components/ui/CurrencyAmount'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import { CartIcon, CheckIcon, LocationIcon, LockIcon, MastercardIcon, VisaIcon, XIcon } from '@/components/icons'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addSavedCardThunk, createAddress, createOrderThunk, deleteAddressThunk, fetchAddresses, fetchSavedCards } from '@/store/slices/accountSlice'
import { clearCart, fetchCart } from '@/store/slices/cartSlice'
import type { SavedCard } from '@/store/types/domain'

import { useI18n } from '@/i18n/I18nProvider'
import { toast } from '@/lib/toast'
import { formatCurrency, toSaudiCurrencySymbolText } from '@/utils/format'
import {
  detectCardBrandFromNumber,
  formatCardNumber,
  getCardBrandLabel,
  getCardBrandTheme,
  getMaskedCardNumber,
  normalizeCardDigits,
  type CardBrand,
} from '@/utils/paymentCards'

type PaymentMethod = 'apple_pay' | 'cod' | 'card'

const CHECKOUT_SELECTED_ADDRESS_ID_STORAGE_KEY = 'albarq_checkout_selected_address_id'

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

function persistCheckoutSelectedAddressId(addressId: string | null): void {
  if (typeof window === 'undefined') return
  try {
    if (!addressId) {
      window.localStorage.removeItem(CHECKOUT_SELECTED_ADDRESS_ID_STORAGE_KEY)
      return
    }
    window.localStorage.setItem(CHECKOUT_SELECTED_ADDRESS_ID_STORAGE_KEY, addressId)
  } catch {
    // Ignore storage persistence issues.
  }
}

function readPersistedCheckoutSelectedAddressId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(CHECKOUT_SELECTED_ADDRESS_ID_STORAGE_KEY)
    return stored?.trim() || null
  } catch {
    return null
  }
}

type CityOption = {
  id: string
  ar: string
  en: string
  neighborhoods: string[]
}

type GovernorateOption = {
  id: string
  stateId: string
  ar: string
  en: string
  cities: CityOption[]
}

function normalizeLookupValue(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

function getAddressStateLookupKeys(address: { stateId?: string; governorateCode?: string }): string[] {
  const keys = [normalizeLookupValue(address.stateId), normalizeLookupValue(address.governorateCode)].filter(Boolean)
  return Array.from(new Set(keys))
}

function normalizeLookupText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function uniqueStrings(values: string[]): string[] {
  const unique = new Set<string>()
  const rows: string[] = []

  for (const value of values) {
    const normalized = normalizeLookupText(value)
    if (!normalized || unique.has(normalized)) continue
    unique.add(normalized)
    rows.push(value)
  }

  return rows
}

function hasArabicText(value: string): boolean {
  return /[\u0600-\u06ff]/u.test(value)
}

function pickDistrictLabelsByLanguage(values: string[], lang: 'ar' | 'en'): string[] {
  const normalizedValues = values
    .map((entry) => entry.trim())
    .filter(Boolean)
  if (normalizedValues.length === 0) return []

  const preferredValues = normalizedValues.filter((entry) =>
    lang === 'ar' ? hasArabicText(entry) : !hasArabicText(entry),
  )

  return uniqueStrings(preferredValues.length > 0 ? preferredValues : normalizedValues)
}

function pickLanguageMatchedCandidate(candidates: Array<string | undefined>, lang: 'ar' | 'en'): string {
  const values = candidates
    .map((entry) => (entry ?? '').trim())
    .filter(Boolean)

  if (values.length === 0) return ''
  if (lang === 'ar') return values.find((entry) => hasArabicText(entry)) || values[0]
  return values.find((entry) => !hasArabicText(entry)) || values[0]
}

type AddressDisplayPayload = {
  label: string
  labelAr?: string
  labelEn?: string
  details: string
  detailsAr?: string
  detailsEn?: string
  governorate?: string
  governorateAr?: string
  governorateEn?: string
  city?: string
  cityAr?: string
  cityEn?: string
  district?: string
  stateId?: string
  governorateCode?: string
  cityCode?: string
}

function resolveAddressLocationByCodes(
  address: AddressDisplayPayload,
  governorates: GovernorateOption[],
): { governorate: GovernorateOption | null; city: CityOption | null } {
  const stateLookupKeys = [normalizeLookupValue(address.governorateCode), normalizeLookupValue(address.stateId)].filter(Boolean)
  const matchedGovernorate =
    governorates.find((entry) => {
      const entryKeys = [normalizeLookupValue(entry.id), normalizeLookupValue(entry.stateId)]
      return stateLookupKeys.some((key) => entryKeys.includes(key))
    }) ?? null

  const cityLookupKeys = [
    normalizeLookupValue(address.cityCode),
    normalizeLookupValue(address.city),
    normalizeLookupValue(address.cityAr),
    normalizeLookupValue(address.cityEn),
  ].filter(Boolean)

  const allGovernorateCities = governorates.flatMap((entry) => entry.cities)
  const matchCity = (city: CityOption) => {
    const cityKeys = [normalizeLookupValue(city.id), normalizeLookupValue(city.ar), normalizeLookupValue(city.en)]
    return cityLookupKeys.some((key) => cityKeys.includes(key))
  }
  const matchedCity = (matchedGovernorate?.cities.find(matchCity) ?? allGovernorateCities.find(matchCity)) || null

  return {
    governorate: matchedGovernorate,
    city: matchedCity,
  }
}

function getAddressDisplayLabel(
  address: AddressDisplayPayload,
  lang: 'ar' | 'en',
  governorates: GovernorateOption[],
): string {
  const fallbackByLang = lang === 'ar' ? 'عنوان' : 'Address'
  const explicitLocalizedLabel = (lang === 'ar' ? address.labelAr : address.labelEn)?.trim() || ''
  if (explicitLocalizedLabel) return explicitLocalizedLabel

  const matchedLocation = resolveAddressLocationByCodes(address, governorates)
  const matchedGovernorate = matchedLocation.governorate
  const matchedCity = matchedLocation.city

  const mappedLabel = pickLanguageMatchedCandidate(
    lang === 'ar'
      ? [matchedGovernorate?.ar, address.governorateAr, matchedCity?.ar, address.cityAr]
      : [matchedGovernorate?.en, address.governorateEn, matchedCity?.en, address.cityEn],
    lang,
  )
  if (mappedLabel) return mappedLabel

  const rawLabel = address.label.trim()

  const detailsParts = address.details
    .split(/[،,|/]+/g)
    .map((entry) => entry.trim())
    .filter(Boolean)
  const fallbackLabel = pickLanguageMatchedCandidate(
    lang === 'ar'
      ? [address.governorateAr, address.cityAr, address.governorate, address.city, ...detailsParts, rawLabel]
      : [address.governorateEn, address.cityEn, address.governorate, address.city, ...detailsParts, rawLabel],
    lang,
  )

  return fallbackLabel || fallbackByLang
}

function getAddressDisplayDetails(
  address: AddressDisplayPayload,
  lang: 'ar' | 'en',
  governorates: GovernorateOption[],
): string {
  const explicitLocalizedDetails = (lang === 'ar' ? address.detailsAr : address.detailsEn)?.trim() || ''
  if (explicitLocalizedDetails) return explicitLocalizedDetails

  const matchedLocation = resolveAddressLocationByCodes(address, governorates)
  const matchedGovernorate = matchedLocation.governorate
  const matchedCity = matchedLocation.city

  const localizedDistrict = pickLanguageMatchedCandidate(
    lang === 'ar'
      ? [matchedGovernorate?.ar, address.district]
      : [matchedGovernorate?.en, address.district],
    lang,
  )
  const localizedCity = pickLanguageMatchedCandidate(
    lang === 'ar'
      ? [matchedCity?.ar, address.cityAr, address.city]
      : [matchedCity?.en, address.cityEn, address.city],
    lang,
  )
  const localizedGovernorate = pickLanguageMatchedCandidate(
    lang === 'ar'
      ? [address.governorateAr, matchedGovernorate?.ar, address.governorate]
      : [address.governorateEn, matchedGovernorate?.en, address.governorate],
    lang,
  )

  const locationAliases = uniqueStrings(
    [
      address.district,
      address.city,
      address.cityAr,
      address.cityEn,
      address.governorate,
      address.governorateAr,
      address.governorateEn,
      matchedGovernorate?.ar,
      matchedGovernorate?.en,
      matchedCity?.ar,
      matchedCity?.en,
    ]
      .map((entry) => (entry ?? '').trim())
      .filter(Boolean),
  )
  const locationAliasLookup = new Set(locationAliases.map((entry) => normalizeLookupText(entry)))

  const customDetailsParts = address.details
    .split(/[،,|/]+/g)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((entry) => !locationAliasLookup.has(normalizeLookupText(entry)))

  const localizedLocationParts = uniqueStrings(
    [localizedDistrict, localizedCity, localizedGovernorate]
      .map((entry) => entry.trim())
      .filter(Boolean),
  )

  const resultParts = uniqueStrings([...customDetailsParts, ...localizedLocationParts])
  if (resultParts.length > 0) {
    return resultParts.join(lang === 'ar' ? '، ' : ', ')
  }

  return address.details.trim()
}

function normalizeOptionDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
}

function parseAddonOptionPrice(optionText: string): { labelKey: string; price: number } | null {
  const raw = optionText.trim()
  if (!raw) return null

  const normalized = normalizeLookupText(raw)
  const arabicSizePrefix = '\u0627\u0644\u062d\u062c\u0645:'
  if (normalized.startsWith('size:') || normalized.startsWith(arabicSizePrefix) || normalized.startsWith('Ø§Ù„Ø­Ø¬Ù…:')) {
    return null
  }

  const label = raw.replace(/\s*\([^()]*\)\s*$/, '').trim()
  if (!label) return null

  const priceGroup = raw.match(/\(([^()]*)\)\s*$/)?.[1]
  if (!priceGroup) return null

  const numberMatch = normalizeOptionDigits(priceGroup).match(/-?\d+(?:[.,]\d+)?/)
  if (!numberMatch) return null

  const parsedPrice = Number(numberMatch[0].replace(',', '.'))
  if (!Number.isFinite(parsedPrice)) return null

  return {
    labelKey: normalizeLookupText(label),
    price: Math.max(0, parsedPrice),
  }
}

function getCartItemAddonsPricePerUnit(options: string[] | undefined): number {
  const seenAddonLabels = new Set<string>()
  return (options ?? []).reduce((sum, optionText) => {
    const parsedAddon = parseAddonOptionPrice(optionText)
    if (!parsedAddon) return sum
    if (seenAddonLabels.has(parsedAddon.labelKey)) return sum
    seenAddonLabels.add(parsedAddon.labelKey)
    return sum + parsedAddon.price
  }, 0)
}

function isCartItemPriceIncludingOptions(cartItemId: string): boolean {
  const normalizedId = cartItemId.trim().toLowerCase()
  if (!normalizedId) return false
  return normalizedId.includes('addon:') || normalizedId.includes('size:')
}

function resolveCartItemBaseUnitPrice(item: {
  id: string
  price: number
  basePrice?: number
  options?: string[]
}): number {
  if (typeof item.basePrice === 'number' && Number.isFinite(item.basePrice)) {
    return Math.max(0, item.basePrice)
  }

  const addonsPerUnit = getCartItemAddonsPricePerUnit(item.options)
  if (isCartItemPriceIncludingOptions(item.id)) {
    return Math.max(0, item.price - addonsPerUnit)
  }

  return Math.max(0, item.price)
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

function getLocalizedMenuItemName(
  item: Pick<MenuItem, 'name' | 'nameAr' | 'nameEn'>,
  lang: 'ar' | 'en',
): string {
  const ar = item.nameAr?.trim() || ''
  const en = item.nameEn?.trim() || ''
  const base = item.name?.trim() || ''
  if (lang === 'ar') return toSaudiCurrencySymbolText(ar || base || en, lang)
  return toSaudiCurrencySymbolText(en || base || ar, lang)
}

function normalizePhoneDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
}

function normalizeSaudiMobilePhone(value: string): string | null {
  let normalized = normalizePhoneDigits(value).replace(/[^\d+]/g, '')
  if (!normalized) return null

  if (normalized.startsWith('00')) {
    normalized = `+${normalized.slice(2)}`
  }

  if (normalized.startsWith('+')) {
    normalized = `+${normalized.slice(1).replace(/\+/g, '')}`
  }

  if (normalized.startsWith('9660')) {
    normalized = `+966${normalized.slice(4)}`
  } else if (normalized.startsWith('966')) {
    normalized = `+${normalized}`
  } else if (normalized.startsWith('05')) {
    normalized = `+966${normalized.slice(1)}`
  } else if (normalized.startsWith('5')) {
    normalized = `+966${normalized}`
  }

  if (!/^\+9665\d{8}$/.test(normalized)) return null
  return normalized
}

function normalizeDistrictKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/^حي\s+/, '')
    .replace(/\b(?:district|area)\b/gi, '')
    .trim()
}

function extractDistrictsFromText(value: string): string[] {
  const text = value.replace(/\s+/g, ' ').trim()
  if (!text) return []

  const candidates = [
    text.match(/(?:حي|الحي|منطقة|المنطقة)\s+([^،,|/]+)/)?.[1],
    text.match(/(?:district|area)\s*[:\-]?\s*([^،,|/]+)/i)?.[1],
    text.match(/([^،,|/]+?)\s+(?:district|area)\b/i)?.[1],
    text.match(/فرع\s+([^،,|/]+)/)?.[1],
    text.match(/branch\s+([^،,|/]+)/i)?.[1],
  ]

  return candidates
    .map((entry) => (entry ?? '').trim())
    .map((entry) => entry.replace(/^حي\s+/, '').trim())
    .filter(Boolean)
}

function extractCityFromAddress(value: string): string {
  const segments = value
    .split(/[،,|/\-]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
  if (segments.length === 0) return ''

  const ignoredSegments = new Set(['saudi arabia', 'ksa', '\u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629'])
  for (let index = segments.length - 1; index >= 0; index -= 1) {
    const segment = segments[index]
    const normalizedSegment = normalizeLookupValue(segment)
    if (!normalizedSegment || ignoredSegments.has(normalizedSegment)) continue
    if (
      normalizedSegment.startsWith('\u062d\u064a') ||
      normalizedSegment.includes('district') ||
      normalizedSegment.includes('area') ||
      normalizedSegment.includes('\u0641\u0631\u0639') ||
      normalizedSegment.includes('branch')
    ) {
      continue
    }
    if (/\d/.test(normalizedSegment)) continue
    return segment
  }

  return segments[segments.length - 1]
}

function sanitizeCityName(value: string): string {
  const raw = value.replace(/\s+/g, ' ').trim()
  if (!raw) return ''

  const splitByContext = raw.split(
    /\s+(?:بجوار|بالقرب(?:\s+من)?|قرب|جنب|امام|أمام|خلف|عند|شارع|طريق|حي|الحي|منطقة|المنطقة|مخطط|فندق|عمارة|برج|مول|مستشفى|مدرسة|مسجد|near|next to|in front of|behind|street|st\.?|road|rd\.?|district|area|hotel|building|tower|mall|hospital|school|mosque)\b/i,
  )
  const candidate = splitByContext[0]?.trim() ?? ''
  if (!candidate) return ''

  // If we still have separators, keep the clean first segment only.
  const firstSegment = candidate.split(/[،,|/]+/)[0]?.trim() ?? ''
  if (!firstSegment) return ''

  return firstSegment
}

function normalizeCityCandidate(value: string): string {
  return sanitizeCityName(value)
    .replace(/\s+/g, ' ')
    .replace(/^[\-–—,،\s]+|[\-–—,،\s]+$/g, '')
    .trim()
}

function pickLocalizedBranchValue(
  lang: 'ar' | 'en',
  values: { ar?: string; en?: string; base?: string; fallback?: string },
): string {
  const ar = values.ar?.trim() || ''
  const en = values.en?.trim() || ''
  const base = values.base?.trim() || ''
  const fallback = values.fallback?.trim() || ''
  if (lang === 'ar') return ar || base || en || fallback
  return en || base || ar || fallback
}

function collectRestaurantDistricts(branches: RestaurantBranch[], lang: 'ar' | 'en'): string[] {
  const districts: string[] = []
  const seen = new Set<string>()

  for (const branch of branches) {
    const branchAddress = pickLocalizedBranchValue(lang, {
      ar: branch.addressAr,
      en: branch.addressEn,
      base: branch.address,
    })
    const branchName = pickLocalizedBranchValue(lang, {
      ar: branch.nameAr,
      en: branch.nameEn,
      base: branch.name,
    })
    const rawNeighborhoods = Array.isArray((branch as unknown as { neighborhoods?: unknown }).neighborhoods)
      ? ((branch as unknown as { neighborhoods?: unknown[] }).neighborhoods ?? [])
      : []

    const candidates = [
      ...extractDistrictsFromText(branchAddress),
      ...extractDistrictsFromText(branchName),
      ...rawNeighborhoods
        .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
        .filter(Boolean),
    ]

    for (const candidate of candidates) {
      const key = normalizeDistrictKey(candidate)
      if (!key || seen.has(key)) continue
      seen.add(key)
      districts.push(candidate)
    }
  }

  return districts
}

function buildCityOptionId(rawValue: string, fallbackIndex: number): string {
  const normalized = rawValue
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return normalized ? `restaurant-city-${normalized}` : `restaurant-city-${fallbackIndex + 1}`
}

function collectRestaurantCities(branches: RestaurantBranch[], lang: 'ar' | 'en'): CityOption[] {
  const citiesMap = new Map<string, { id: string; ar: string; en: string; neighborhoods: Set<string> }>()
  const branchNameKeys = new Set<string>(
    branches
      .flatMap((branch) => [branch.nameAr, branch.nameEn, branch.name])
      .map((entry) => normalizeLookupValue(entry ?? ''))
      .filter(Boolean),
  )

  for (const branch of branches) {
    const branchName = pickLocalizedBranchValue(lang, {
      ar: branch.nameAr,
      en: branch.nameEn,
      base: branch.name,
    }).trim()
    const normalizedBranchName = normalizeLookupValue(branchName)
    const normalizeComparableText = (value: string) => normalizeLookupValue(value.trim())
    const branchAddress = pickLocalizedBranchValue(lang, {
      ar: branch.addressAr,
      en: branch.addressEn,
      base: branch.address,
    })
    const addressDerivedCity = normalizeCityCandidate(extractCityFromAddress(branchAddress))
    const cityArCandidate = normalizeCityCandidate(branch.cityAr ?? '')
    const cityEnCandidate = normalizeCityCandidate(branch.cityEn ?? '')
    const cityAr =
      normalizedBranchName && normalizeComparableText(cityArCandidate) === normalizedBranchName
        ? ''
        : cityArCandidate
    const cityEn =
      normalizedBranchName && normalizeComparableText(cityEnCandidate) === normalizedBranchName
        ? ''
        : cityEnCandidate
    let cityBase = normalizeCityCandidate(branch.city ?? '')
    if (
      !cityBase ||
      (normalizedBranchName && normalizeComparableText(cityBase) === normalizedBranchName)
    ) {
      cityBase = addressDerivedCity
    }

    const cityLabel = pickLocalizedBranchValue(lang, {
      ar: cityAr,
      en: cityEn,
      base: cityBase,
    })
    if (!cityLabel) continue

    const cityKey = normalizeLookupValue(cityEn || cityAr || cityBase || cityLabel)
    if (!cityKey) continue
    if (branchNameKeys.has(cityKey)) continue

    if (!citiesMap.has(cityKey)) {
      citiesMap.set(cityKey, {
        id: buildCityOptionId(cityEn || cityAr || cityBase || cityLabel, citiesMap.size),
        ar: cityAr || cityBase || cityEn || cityLabel,
        en: cityEn || cityBase || cityAr || cityLabel,
        neighborhoods: new Set<string>(),
      })
    }

    const cityEntry = citiesMap.get(cityKey)
    if (!cityEntry) continue
    if (!cityEntry.ar && cityAr) cityEntry.ar = cityAr
    if (!cityEntry.en && cityEn) cityEntry.en = cityEn

    const rawNeighborhoods = Array.isArray((branch as unknown as { neighborhoods?: unknown }).neighborhoods)
      ? ((branch as unknown as { neighborhoods?: unknown[] }).neighborhoods ?? [])
      : []
    const extractedDistricts = [
      ...extractDistrictsFromText(branchAddress),
      ...extractDistrictsFromText(branchName),
      ...rawNeighborhoods.map((entry) => (typeof entry === 'string' ? entry.trim() : '')).filter(Boolean),
    ]

    for (const district of extractedDistricts) {
      const normalizedDistrict = district.trim()
      if (!normalizedDistrict) continue
      cityEntry.neighborhoods.add(normalizedDistrict)
    }
  }

  return Array.from(citiesMap.values()).map((entry) => ({
    id: entry.id,
    ar: entry.ar,
    en: entry.en,
    neighborhoods: Array.from(entry.neighborhoods),
  }))
}

function mergeCityOptions(primary: CityOption[], secondary: CityOption[]): CityOption[] {
  const rows: CityOption[] = []
  const cityKeyToIndex = new Map<string, number>()

  const getCityKeys = (city: CityOption): string[] => {
    const keys = [
      normalizeLookupValue(city.id),
      normalizeLookupValue(city.ar),
      normalizeLookupValue(city.en),
    ].filter(Boolean)
    return Array.from(new Set(keys))
  }

  const upsertCity = (city: CityOption) => {
    const keys = getCityKeys(city)
    if (keys.length === 0) return

    let existingIndex = -1
    for (const key of keys) {
      const found = cityKeyToIndex.get(key)
      if (found !== undefined) {
        existingIndex = found
        break
      }
    }

    if (existingIndex < 0) {
      const nextCity: CityOption = {
        id: city.id,
        ar: city.ar,
        en: city.en,
        neighborhoods: uniqueStrings((city.neighborhoods ?? []).map((entry) => entry.trim()).filter(Boolean)),
      }
      rows.push(nextCity)
      const nextIndex = rows.length - 1
      for (const key of keys) {
        cityKeyToIndex.set(key, nextIndex)
      }
      return
    }

    const existing = rows[existingIndex]
    rows[existingIndex] = {
      id: existing.id || city.id,
      ar: existing.ar || city.ar,
      en: existing.en || city.en,
      neighborhoods: uniqueStrings([
        ...(existing.neighborhoods ?? []),
        ...(city.neighborhoods ?? []),
      ].map((entry) => entry.trim()).filter(Boolean)),
    }

    for (const key of keys) {
      cityKeyToIndex.set(key, existingIndex)
    }
  }

  primary.forEach(upsertCity)
  secondary.forEach(upsertCity)
  return rows
}

function pickPreferredCity(cities: CityOption[]): CityOption | null {
  if (cities.length === 0) return null

  const cityWithNeighborhoods = cities.find((city) =>
    (city.neighborhoods ?? []).some((entry) => entry.trim().length > 0),
  )
  return cityWithNeighborhoods ?? cities[0]
}

function getGovernorateLabelByLang(governorates: GovernorateOption[], governorateCode: string, lang: 'ar' | 'en'): string {
  const row = governorates.find((entry) => entry.id === governorateCode)
  if (!row) return ''
  return lang === 'ar' ? row.ar : row.en
}

function getCityLabelByLang(governorates: GovernorateOption[], governorateCode: string, cityCode: string, lang: 'ar' | 'en'): string {
  const governorate = governorates.find((entry) => entry.id === governorateCode)
  const city = governorate?.cities.find((entry) => entry.id === cityCode)
  if (!city) return ''
  return lang === 'ar' ? city.ar : city.en
}

function resolveStateId(governorates: GovernorateOption[], governorateCode: string, fallbackValue?: string): string {
  const fallback = (fallbackValue ?? '').trim()
  if (fallback) return fallback

  const governorate = governorates.find((entry) => entry.id === governorateCode)
  if (governorate?.stateId) return governorate.stateId

  return governorateCode.trim()
}

function matchGovernorateByDistrict(
  governorates: GovernorateOption[],
  districtValue: string,
): GovernorateOption | null {
  const normalizedDistrict = normalizeDistrictKey(districtValue)
  if (!normalizedDistrict) return null

  return (
    governorates.find((entry) => {
      const labels = [entry.ar, entry.en]
        .map((value) => normalizeDistrictKey(value))
        .filter(Boolean)
      return labels.some(
        (label) =>
          label === normalizedDistrict ||
          label.includes(normalizedDistrict) ||
          normalizedDistrict.includes(label),
      )
    }) ?? null
  )
}

function mapStatesToGovernorates(states: StateOption[]): GovernorateOption[] {
  return states.map((state, index) => {
    const cities = state.cities.length
      ? state.cities.map((city, cityIndex) => ({
          id: city.id || `${state.id}-city-${cityIndex + 1}`,
          ar: city.nameAr || city.name || `${state.nameAr || state.name || 'City'} ${cityIndex + 1}`,
          en: city.name || city.nameAr || `${state.name || state.nameAr || 'City'} ${cityIndex + 1}`,
          neighborhoods: city.neighborhoods ?? [],
        }))
      : []

    return {
      id: state.code || state.id,
      stateId: state.id,
      ar: state.nameAr || state.name || `State ${index + 1}`,
      en: state.name || state.nameAr || `State ${index + 1}`,
      cities,
    }
  })
}

function collectCitiesFromGovernorates(governorates: GovernorateOption[]): CityOption[] {
  return governorates.flatMap((entry) => entry.cities ?? [])
}

function buildStateComparisonKey(state: StateOption): string {
  const stateId = normalizeLookupValue(state.id)
  if (stateId) return `id:${stateId}`

  const stateCode = normalizeLookupValue(state.code)
  if (stateCode) return `code:${stateCode}`

  const englishName = normalizeLookupValue(state.name)
  const arabicName = normalizeLookupValue(state.nameAr)
  if (englishName || arabicName) return `name:${englishName}|${arabicName}`

  return ''
}

function buildStateCityComparisonKey(city: StateOption['cities'][number]): string {
  const cityId = normalizeLookupValue(city.id)
  if (cityId) return `id:${cityId}`

  const englishName = normalizeLookupValue(city.name)
  const arabicName = normalizeLookupValue(city.nameAr)
  if (englishName || arabicName) return `name:${englishName}|${arabicName}`

  return ''
}

function mergeStateCityOptions(
  baseCities: StateOption['cities'],
  incomingCities: StateOption['cities'],
): StateOption['cities'] {
  const cityMap = new Map<string, StateOption['cities'][number]>()

  const upsertCity = (city: StateOption['cities'][number], fallbackIndex: number) => {
    const key = buildStateCityComparisonKey(city) || `fallback-${fallbackIndex}`
    const existing = cityMap.get(key)

    if (!existing) {
      cityMap.set(key, {
        id: city.id,
        name: city.name,
        nameAr: city.nameAr,
        neighborhoods: Array.from(
          new Set((city.neighborhoods ?? []).map((entry) => entry.trim()).filter(Boolean)),
        ),
      })
      return
    }

    const mergedNeighborhoods = Array.from(
      new Set(
        [...(existing.neighborhoods ?? []), ...(city.neighborhoods ?? [])]
          .map((entry) => entry.trim())
          .filter(Boolean),
      ),
    )

    cityMap.set(key, {
      id: existing.id || city.id,
      name: existing.name || city.name,
      nameAr: existing.nameAr || city.nameAr,
      neighborhoods: mergedNeighborhoods,
    })
  }

  baseCities.forEach((city, index) => upsertCity(city, index))
  incomingCities.forEach((city, index) => upsertCity(city, baseCities.length + index))

  return Array.from(cityMap.values())
}

function mergeStateOptions(baseState: StateOption, incomingState: StateOption): StateOption {
  return {
    id: baseState.id || incomingState.id,
    name: baseState.name || incomingState.name,
    nameAr: baseState.nameAr || incomingState.nameAr,
    code: baseState.code || incomingState.code,
    cities: mergeStateCityOptions(baseState.cities ?? [], incomingState.cities ?? []),
  }
}

function deduplicateStates(states: StateOption[]): StateOption[] {
  const stateMap = new Map<string, StateOption>()

  for (const state of states) {
    const key = buildStateComparisonKey(state)
    if (!key) continue

    const existing = stateMap.get(key)
    stateMap.set(key, existing ? mergeStateOptions(existing, state) : state)
  }

  return Array.from(stateMap.values())
}

function getCommonStatesForRestaurants(stateGroups: StateOption[][]): StateOption[] {
  if (stateGroups.length === 0) return []
  if (stateGroups.length === 1) return deduplicateStates(stateGroups[0])

  const normalizedGroups = stateGroups.map((group) => deduplicateStates(group))
  const groupMaps = normalizedGroups.map((group) =>
    new Map(
      group
        .map((state) => [buildStateComparisonKey(state), state] as const)
        .filter(([key]) => Boolean(key)),
    ),
  )

  const firstGroup = normalizedGroups[0]
  const commonStates: StateOption[] = []

  for (const candidateState of firstGroup) {
    const key = buildStateComparisonKey(candidateState)
    if (!key) continue
    if (!groupMaps.every((groupMap) => groupMap.has(key))) continue

    const merged = groupMaps.reduce<StateOption>(
      (accumulator, groupMap) => {
        const current = groupMap.get(key)
        if (!current) return accumulator
        return mergeStateOptions(accumulator, current)
      },
      candidateState,
    )

    commonStates.push(merged)
  }

  return commonStates
}

export default function CheckoutPage() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { t, lang } = useI18n()
  const dataSourceMode = getDataSourceMode()
  const isMockFlow = dataSourceMode !== 'api'

  const user = useAppSelector((s) => s.auth.user)
  const cartItems = useAppSelector((s) => s.cart.items)
  const restaurantIdsInCart = useMemo(
    () =>
      Array.from(
        new Set(
          cartItems
            .map((item) => item.restaurantId?.trim() ?? '')
            .filter((restaurantId) => restaurantId && restaurantId.toLowerCase() !== 'restaurant'),
        ),
      ),
    [cartItems],
  )
  const restaurantIdsInCartKey = useMemo(
    () => [...restaurantIdsInCart].sort().join('|'),
    [restaurantIdsInCart],
  )
  const restaurantIdsInCartLookup = useMemo(
    () => new Set(restaurantIdsInCart.map((restaurantId) => normalizeLookupValue(restaurantId)).filter(Boolean)),
    [restaurantIdsInCart],
  )
  const singleRestaurantId = restaurantIdsInCart.length === 1 ? restaurantIdsInCart[0] : ''
  const isRestaurantScoped = restaurantIdsInCart.length > 0
  const hasMultipleRestaurantsInCart = restaurantIdsInCart.length > 1
  const addresses = useAppSelector((s) => s.account.addresses)
  const savedCards = useAppSelector((s) => s.account.savedCards)
  const visibleSavedCards = user ? savedCards : []
  const routeState = location.state as { promoCode?: string; discount?: number } | null
  const initialCoupon = typeof routeState?.promoCode === 'string' ? routeState.promoCode : ''
  const initialDiscount =
    typeof routeState?.discount === 'number' && Number.isFinite(routeState.discount) ? Math.max(0, routeState.discount) : 0

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(() => readPersistedCheckoutSelectedAddressId())
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [coupon, setCoupon] = useState(initialCoupon)
  const [discount, setDiscount] = useState(initialDiscount)
  const [appliedPromoCode, setAppliedPromoCode] = useState(initialCoupon.trim())
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [checkoutErrorReason, setCheckoutErrorReason] = useState('')
  const [notes, setNotes] = useState('')
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const [addressStateId, setAddressStateId] = useState('')
  const [addressGovernorateCode, setAddressGovernorateCode] = useState('')
  const [addressCity, setAddressCity] = useState('')
  const [addressCityCode, setAddressCityCode] = useState('')
  const [addressDistrict, setAddressDistrict] = useState('')
  const [addressPhone, setAddressPhone] = useState('')
  const [addressDetails, setAddressDetails] = useState('')
  const [addressDefault, setAddressDefault] = useState(false)
  const [governorates, setGovernorates] = useState<GovernorateOption[]>([])
  const [loadingGovernorateCities, setLoadingGovernorateCities] = useState(false)
  const [allApiCities, setAllApiCities] = useState<CityOption[]>([])
  const [restaurantCities, setRestaurantCities] = useState<CityOption[]>([])
  const [restaurantDistricts, setRestaurantDistricts] = useState<string[]>([])
  const [loadingRestaurantDistricts, setLoadingRestaurantDistricts] = useState(false)
  const [hasNoCommonRestaurantStates, setHasNoCommonRestaurantStates] = useState(false)
  const [resolvedMealNamesByItemId, setResolvedMealNamesByItemId] = useState<Record<string, string>>({})
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [deliveryErrorReason, setDeliveryErrorReason] = useState('')
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null)
  const [restaurantOpenStatusById, setRestaurantOpenStatusById] = useState<Record<string, boolean>>({})

  // card form
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    dispatch(fetchAddresses())
    dispatch(fetchSavedCards())
  }, [dispatch, lang, user])

  useEffect(() => {
    let active = true

    async function resolveRestaurantAvailability() {
      if (restaurantIdsInCart.length === 0) {
        if (active) setRestaurantOpenStatusById({})
        return
      }

      try {
        const restaurants = await getRestaurantsByIds(restaurantIdsInCart)
        if (!active) return

        const nextStatusById: Record<string, boolean> = {}
        for (const restaurantId of restaurantIdsInCart) {
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
          for (const restaurantId of restaurantIdsInCart) {
            next[restaurantId] = prev[restaurantId] ?? true
          }
          return next
        })
      }
    }

    void resolveRestaurantAvailability()
    return () => {
      active = false
    }
  }, [restaurantIdsInCartKey])

  const closedRestaurantIdsInCart = useMemo(
    () => restaurantIdsInCart.filter((restaurantId) => restaurantOpenStatusById[restaurantId] === false),
    [restaurantIdsInCart, restaurantOpenStatusById],
  )
  const hasClosedRestaurantInCart = closedRestaurantIdsInCart.length > 0

  useEffect(() => {
    let active = true

    async function loadCitiesFromApi() {
      try {
        const rows = await getCities()
        if (!active) return

        const mappedCities: CityOption[] = rows
          .filter((city) => Boolean(city.id || city.name || city.nameAr))
          .map((city, index) => ({
            id: city.id || `api-city-${index + 1}`,
            ar: city.nameAr || city.name || `City ${index + 1}`,
            en: city.name || city.nameAr || `City ${index + 1}`,
            neighborhoods: city.neighborhoods ?? [],
          }))

        setAllApiCities(mergeCityOptions(mappedCities, []))
      } catch {
        if (!active) return
        setAllApiCities([])
      }
    }

    void loadCitiesFromApi()
    return () => {
      active = false
    }
  }, [lang])

  useEffect(() => {
    if (!visibleSavedCards.length) {
      setSelectedSavedCardId(null)
      return
    }

    const selectedStillExists = selectedSavedCardId && visibleSavedCards.some((card) => card.id === selectedSavedCardId)
    if (selectedStillExists) return

    const def = visibleSavedCards.find((card) => card.isDefault)
    setSelectedSavedCardId(def?.id ?? visibleSavedCards[0].id)
  }, [visibleSavedCards, selectedSavedCardId])

  const restaurantAddressStateKeys = useMemo(() => {
    if (!isRestaurantScoped || governorates.length === 0) return new Set<string>()

    return new Set(
      governorates
        .flatMap((entry) => [normalizeLookupValue(entry.stateId), normalizeLookupValue(entry.id)])
        .filter(Boolean),
    )
  }, [governorates, isRestaurantScoped])

  const isAddressAllowedForCheckout = useCallback(
    (address: { stateId?: string; governorateCode?: string; restaurantId?: string }): boolean => {
      if (!isRestaurantScoped) return true

      const addressRestaurantId = normalizeLookupValue(address.restaurantId)
      if (!addressRestaurantId) return false
      if (!restaurantIdsInCartLookup.has(addressRestaurantId)) return false

      if (restaurantAddressStateKeys.size === 0) return !hasNoCommonRestaurantStates

      const addressKeys = getAddressStateLookupKeys(address)
      if (addressKeys.length === 0) return false
      return addressKeys.some((key) => restaurantAddressStateKeys.has(key))
    },
    [hasNoCommonRestaurantStates, isRestaurantScoped, restaurantAddressStateKeys, restaurantIdsInCartLookup],
  )

  const checkoutAddresses = useMemo(
    () => addresses.filter((address) => isAddressAllowedForCheckout(address)),
    [addresses, isAddressAllowedForCheckout],
  )

  useEffect(() => {
    if (!selectedAddressId) return
    if (checkoutAddresses.some((address) => address.id === selectedAddressId)) return
    setSelectedAddressId(null)
    persistCheckoutSelectedAddressId(null)
  }, [checkoutAddresses, selectedAddressId])

  useEffect(() => {
    let active = true

    async function loadStates() {
      try {
        let rows: StateOption[] = []
        const loadGlobalStates = async () => {
          try {
            return await getStates()
          } catch {
            return [] as StateOption[]
          }
        }
        if (restaurantIdsInCart.length === 0) {
          rows = await loadGlobalStates()
        } else if (restaurantIdsInCart.length === 1) {
          rows = await getRestaurantStates(restaurantIdsInCart[0])
          if (rows.length === 0) {
            rows = await loadGlobalStates()
          }
        } else {
          const statesByRestaurant = await Promise.all(
            restaurantIdsInCart.map(async (restaurantId) => {
              const restaurantStates = await getRestaurantStates(restaurantId)
              if (restaurantStates.length > 0) return restaurantStates
              return await loadGlobalStates()
            }),
          )
          rows = getCommonStatesForRestaurants(statesByRestaurant)
          if (rows.length === 0) {
            rows = await loadGlobalStates()
          }
        }

        if (!active) return
        setHasNoCommonRestaurantStates(hasMultipleRestaurantsInCart && rows.length === 0)
        const mapped = mapStatesToGovernorates(rows)
        setGovernorates(mapped)

        if (mapped.length === 0) {
          setAddressGovernorateCode('')
          setAddressStateId('')
          return
        }

        const preferredGovernorate = mapped.find((entry) => entry.cities.length > 0) ?? mapped[0]

        setAddressGovernorateCode((prevGovernorateCode) =>
          mapped.some((entry) => entry.id === prevGovernorateCode) ? prevGovernorateCode : preferredGovernorate.id,
        )
        setAddressStateId((prevStateId) =>
          mapped.some((entry) => entry.stateId === prevStateId) ? prevStateId : preferredGovernorate.stateId,
        )
      } catch {
        if (!active) return
        setGovernorates([])
        setHasNoCommonRestaurantStates(false)
      }
    }

    void loadStates()
    return () => {
      active = false
    }
  }, [hasMultipleRestaurantsInCart, lang, restaurantIdsInCartKey])

  useEffect(() => {
    let active = true

    async function ensureGovernorateCities() {
      const governorateCode = addressGovernorateCode.trim()
      if (!governorateCode) {
        if (active) setLoadingGovernorateCities(false)
        return
      }

      const governorate = governorates.find((entry) => entry.id === governorateCode)
      if (!governorate || governorate.cities.length > 0) {
        if (active) setLoadingGovernorateCities(false)
        return
      }

      const stateId = governorate.stateId.trim()
      if (!stateId) {
        if (active) setLoadingGovernorateCities(false)
        return
      }

      if (!active) return
      setLoadingGovernorateCities(true)
      try {
        const stateCities = await getCitiesByStateId(stateId)
        if (!active) return

        const mappedCities = stateCities
          .filter((city) => Boolean(city.id || city.name || city.nameAr))
          .map((city, cityIndex) => ({
            id: city.id || `${governorate.stateId}-city-${cityIndex + 1}`,
            ar: city.nameAr || city.name || `${governorate.ar} ${cityIndex + 1}`,
            en: city.name || city.nameAr || `${governorate.en} ${cityIndex + 1}`,
            neighborhoods: city.neighborhoods ?? [],
          }))

        if (mappedCities.length > 0) {
          setGovernorates((prevGovernorates) =>
            prevGovernorates.map((entry) =>
              entry.id === governorateCode ? { ...entry, cities: mappedCities } : entry,
            ),
          )
        }

        const cityLookup = normalizeLookupValue(addressCityCode || addressCity)
        const candidateCities = mergeCityOptions(mappedCities, restaurantCities)
        const hasSelectedCity = candidateCities.some((city) =>
          [city.id, normalizeLookupValue(city.ar), normalizeLookupValue(city.en)].includes(cityLookup),
        )

        if (!hasSelectedCity) {
          const preferredCity = pickPreferredCity(candidateCities.length > 0 ? candidateCities : mappedCities)
          setAddressCityCode(preferredCity?.id ?? '')
          setAddressCity(preferredCity ? (lang === 'ar' ? preferredCity.ar : preferredCity.en) : '')
          setAddressDistrict(preferredCity?.neighborhoods[0] ?? '')
        }
      } catch {
        if (!active) return
      } finally {
        if (active) setLoadingGovernorateCities(false)
      }
    }

    void ensureGovernorateCities()
    return () => {
      active = false
    }
  }, [addressCity, addressCityCode, addressGovernorateCode, governorates, lang, restaurantCities])

  const selectedGovernorate = useMemo(
    () => governorates.find((entry) => entry.id === addressGovernorateCode) ?? null,
    [governorates, addressGovernorateCode],
  )
  const allGovernorateCities = useMemo(
    () => collectCitiesFromGovernorates(governorates),
    [governorates],
  )
  const restaurantStateDistricts = useMemo(() => {
    if (!isRestaurantScoped) return [] as string[]

    const selectedCityLookup = normalizeLookupValue(addressCityCode || addressCity)
    const statesForSelectedCity = selectedCityLookup
      ? governorates.filter((entry) =>
          (entry.cities ?? []).some((city) =>
            [normalizeLookupValue(city.id), normalizeLookupValue(city.ar), normalizeLookupValue(city.en)].includes(selectedCityLookup),
          ),
        )
      : governorates

    return uniqueStrings(
      statesForSelectedCity
        .flatMap((entry) => {
          const primary = (lang === 'ar' ? entry.ar : entry.en).trim()
          const fallback = (lang === 'ar' ? entry.en : entry.ar).trim()
          return [primary || fallback]
        })
        .map((entry) => entry.trim())
        .filter(Boolean),
    )
  }, [addressCity, addressCityCode, governorates, isRestaurantScoped, lang])
  const availableCities = useMemo(
    () => {
      if (isRestaurantScoped) {
        if (restaurantCities.length > 0) return restaurantCities
        return allGovernorateCities
      }

      if (allApiCities.length > 0) return allApiCities

      const governorateCities =
        (selectedGovernorate?.cities?.length ?? 0) > 0
          ? selectedGovernorate?.cities ?? []
          : allGovernorateCities
      const merged = mergeCityOptions(governorateCities, restaurantCities)
      if (merged.length > 0) return merged

      return governorateCities
    },
    [allApiCities, allGovernorateCities, isRestaurantScoped, restaurantCities, selectedGovernorate],
  )

  useEffect(() => {
    const governorateCode = addressGovernorateCode.trim()
    if (!governorateCode) return
    setAddressStateId(resolveStateId(governorates, governorateCode, addressStateId))
  }, [addressGovernorateCode, governorates, addressStateId])

  useEffect(() => {
    if (addressCityCode.trim()) return
    if (availableCities.length === 0) return

    const preferredCity = pickPreferredCity(availableCities)
    if (!preferredCity) return

    setAddressCityCode(preferredCity.id)
    setAddressCity(lang === 'ar' ? preferredCity.ar : preferredCity.en)
    setAddressDistrict(preferredCity.neighborhoods[0] ?? '')
  }, [addressCityCode, availableCities, lang])

  useEffect(() => {
    if (!addressCityCode.trim()) return

    const selectedCityFromList = availableCities.find((city) => city.id === addressCityCode.trim())
    if (selectedCityFromList) {
      setAddressCity(lang === 'ar' ? selectedCityFromList.ar : selectedCityFromList.en)
      if (selectedCityFromList.neighborhoods.length > 0) {
        setAddressDistrict((prevDistrict) => prevDistrict.trim() || selectedCityFromList.neighborhoods[0])
      } else if (isRestaurantScoped) {
        setAddressDistrict((prevDistrict) => prevDistrict.trim())
      }
      return
    }

    if (availableCities.length > 0) {
      const preferredCity = pickPreferredCity(availableCities)
      if (!preferredCity) return

      setAddressCityCode(preferredCity.id)
      setAddressCity(lang === 'ar' ? preferredCity.ar : preferredCity.en)
      setAddressDistrict(preferredCity.neighborhoods[0] ?? '')
      return
    }

    if (!addressGovernorateCode.trim()) return

    const fallbackCityLabel = getCityLabelByLang(
      governorates,
      addressGovernorateCode,
      addressCityCode,
      lang as 'ar' | 'en',
    )
    if (fallbackCityLabel) {
      setAddressCity(fallbackCityLabel)
      return
    }

    if (isRestaurantScoped) return

    void getCityById(addressCityCode.trim())
      .then((cityPayload) => {
        if (!cityPayload?.name) return
        setAddressCity(cityPayload.name)
        if (cityPayload.neighborhoods.length > 0) {
          setAddressDistrict((prevDistrict) => prevDistrict.trim() || cityPayload.neighborhoods[0])
        }
      })
      .catch(() => {
        // keep mapped city label when city details endpoint is unavailable
      })
  }, [addressCityCode, addressGovernorateCode, availableCities, governorates, isRestaurantScoped, lang])

  const addonsTotal = useMemo(
    () =>
      cartItems.reduce((sum, item) => {
        const addonsPerUnit = getCartItemAddonsPricePerUnit(item.options)
        return sum + addonsPerUnit * item.quantity
      }, 0),
    [cartItems],
  )
  const checkoutBaseItemTotalsById = useMemo(() => {
    return cartItems.reduce<Record<string, number>>((acc, item) => {
      const baseUnitPrice = resolveCartItemBaseUnitPrice(item)
      acc[item.id] = baseUnitPrice * item.quantity
      return acc
    }, {})
  }, [cartItems])
  const checkoutItemTotalsById = useMemo(() => {
    return cartItems.reduce<Record<string, number>>((acc, item) => {
      const addonsPerUnit = getCartItemAddonsPricePerUnit(item.options)
      const baseUnitPrice = resolveCartItemBaseUnitPrice(item)
      const effectiveUnitPrice = baseUnitPrice + addonsPerUnit
      acc[item.id] = effectiveUnitPrice * item.quantity
      return acc
    }, {})
  }, [cartItems])
  const subtotalWithoutAddons = useMemo(
    () => Object.values(checkoutBaseItemTotalsById).reduce((sum, value) => sum + value, 0),
    [checkoutBaseItemTotalsById],
  )
  const orderSubtotal = useMemo(
    () => subtotalWithoutAddons + addonsTotal,
    [subtotalWithoutAddons, addonsTotal],
  )
  const vatRate = useMemo(
    () => Math.max(0, Number(cartItems.find((item) => Number(item.vatPercentage) > 0)?.vatPercentage || 0)),
    [cartItems],
  )
  const vatTotal = useMemo(
    () => Number((Math.max(0, subtotalWithoutAddons) * (vatRate / 100)).toFixed(2)),
    [subtotalWithoutAddons, vatRate],
  )

  useEffect(() => {
    // Cities list must come from /cities API, then filtered by restaurant states city ids.
    if (!isRestaurantScoped || restaurantIdsInCart.length === 0) {
      setRestaurantCities([])
      setRestaurantDistricts([])
      setLoadingRestaurantDistricts(false)
      return
    }

    setLoadingRestaurantDistricts(true)
    const governorateCities = collectCitiesFromGovernorates(governorates)
    const allowedCityIds = new Set(
      governorateCities
        .map((city) => normalizeLookupValue(city.id))
        .filter(Boolean),
    )

    const filteredApiCities =
      allowedCityIds.size > 0
        ? allApiCities.filter((city) => allowedCityIds.has(normalizeLookupValue(city.id)))
        : allApiCities
    const resolvedCities = filteredApiCities.length > 0 ? filteredApiCities : governorateCities

    const apiDistricts = uniqueStrings(
      governorateCities.flatMap((city) =>
        (city.neighborhoods ?? [])
          .map((entry) => entry.trim())
          .filter(Boolean),
      ),
    )

    setRestaurantCities(resolvedCities)
    setRestaurantDistricts(apiDistricts)
    setAddressCityCode((prevCityCode) => {
      if (prevCityCode.trim()) return prevCityCode
      return pickPreferredCity(resolvedCities)?.id ?? ''
    })
    setLoadingRestaurantDistricts(false)
  }, [allApiCities, governorates, isRestaurantScoped, restaurantIdsInCart.length])

  useEffect(() => {
    let active = true

    async function resolveCartItemNames() {
      if (cartItems.length === 0) {
        if (active) setResolvedMealNamesByItemId({})
        return
      }

      const fallbackNames = cartItems.reduce<Record<string, string>>((acc, item) => {
        acc[item.id] = toSaudiCurrencySymbolText(item.name, lang)
        return acc
      }, {})

      if (restaurantIdsInCart.length === 0) {
        if (active) setResolvedMealNamesByItemId(fallbackNames)
        return
      }

      try {
        const menusByRestaurant = await Promise.all(
          restaurantIdsInCart.map(async (restaurantId) => ({
            restaurantId,
            menu: await getRestaurantMenu(restaurantId),
          })),
        )
        if (!active) return

        const menuItemsByRestaurant = new Map(
          menusByRestaurant.map(({ restaurantId, menu }) => [restaurantId, menu.items] as const),
        )
        const allMenuItems = menusByRestaurant.flatMap(({ menu }) => menu.items)
        const resolvedNames = { ...fallbackNames }

        for (const item of cartItems) {
          const restaurantId = item.restaurantId?.trim() ?? ''
          const restaurantMenuItems = (restaurantId && menuItemsByRestaurant.get(restaurantId)) || allMenuItems
          if (!restaurantMenuItems?.length) continue

          const menuItem = findMenuItemForCartItem(restaurantMenuItems, item.id, item.name, item.menuItemId)
          if (!menuItem) continue

          resolvedNames[item.id] = getLocalizedMenuItemName(menuItem, lang)
        }

        setResolvedMealNamesByItemId(resolvedNames)
      } catch {
        if (active) setResolvedMealNamesByItemId(fallbackNames)
      }
    }

    void resolveCartItemNames()
    return () => {
      active = false
    }
  }, [cartItems, lang, restaurantIdsInCart])


  const selectedAddress = useMemo(
    () => checkoutAddresses.find((a) => a.id === selectedAddressId) ?? null,
    [checkoutAddresses, selectedAddressId],
  )
  const hasSelectedAddress = selectedAddress !== null
  const selectedAddressStateId = useMemo(
    () => (selectedAddress?.stateId || selectedAddress?.governorateCode || '').trim(),
    [selectedAddress],
  )
  const resolveDeliveryForSelectedState = useCallback(
    async (stateId: string): Promise<{ fee: number; reason: string }> => {
      if (orderSubtotal <= 0 || restaurantIdsInCart.length === 0 || !stateId) {
        return { fee: 0, reason: '' }
      }

      const deliveryCityId = (selectedAddress?.cityCode || '').trim()
      const deliveryCityName = (selectedAddress?.city || '').trim()
      const deliveryDistrict = (selectedAddress?.district || '').trim()

      const checks = await Promise.all(
        restaurantIdsInCart.map(async (restaurantId) => {
          try {
            return await checkRestaurantDelivery(
              restaurantId,
              stateId,
              {
                cityId: deliveryCityId || undefined,
                city: deliveryCityName || undefined,
                district: deliveryDistrict || undefined,
              },
            )
          } catch (error) {
            return { available: false, message: resolveApiErrorMessage(error, t('toast.failed')) }
          }
        }),
      )

      const unavailableCheck = checks.find((result) => result.available === false)
      if (unavailableCheck) {
        const reason =
          (typeof unavailableCheck.message === 'string' && unavailableCheck.message.trim()) ||
          resolveApiErrorMessage('', t('toast.failed'))
        return { fee: 0, reason }
      }

      const nextFee = Number(
        checks
          .reduce((sum, result) => {
            const fee = typeof result.fee === 'number' && Number.isFinite(result.fee) ? Math.max(0, result.fee) : 0
            return sum + fee
          }, 0)
          .toFixed(2),
      )

      return { fee: nextFee, reason: '' }
    },
    [restaurantIdsInCart, orderSubtotal, selectedAddress, t],
  )

  useEffect(() => {
    let active = true

    async function resolveDeliveryFee() {
      if (orderSubtotal <= 0 || restaurantIdsInCart.length === 0 || !selectedAddressStateId) {
        if (active) {
          setDeliveryFee(0)
          setDeliveryErrorReason('')
        }
        return
      }

      try {
        const result = await resolveDeliveryForSelectedState(selectedAddressStateId)
        if (!active) return

        setDeliveryFee(result.fee)
        setDeliveryErrorReason(result.reason)
      } catch {
        if (!active) return
        setDeliveryFee(0)
        setDeliveryErrorReason('')
      }
    }

    void resolveDeliveryFee()
    return () => {
      active = false
    }
  }, [resolveDeliveryForSelectedState, restaurantIdsInCart, selectedAddressStateId, orderSubtotal])

  const total = useMemo(() => orderSubtotal + deliveryFee - discount, [orderSubtotal, deliveryFee, discount])

  const steps = useMemo(
    () => [
      { id: 1, label: t('checkout.step.address') },
      { id: 2, label: t('checkout.step.payment') },
      { id: 3, label: t('checkout.step.review') },
    ],
    [t],
  )

  const activeStep = 2

  const selectedCityOption = useMemo(() => {
    const code = addressCityCode.trim()
    if (code) return availableCities.find((city) => city.id === code) ?? null

    const cityName = normalizeLookupValue(addressCity)
    if (!cityName) return null
    return (
      availableCities.find((city) =>
        [normalizeLookupValue(city.ar), normalizeLookupValue(city.en)].includes(cityName),
      ) ?? null
    )
  }, [availableCities, addressCityCode, addressCity])

  useEffect(() => {
    const cityCode = addressCityCode.trim()
    if (!cityCode) return
    if (!selectedCityOption || selectedCityOption.neighborhoods.length > 0) return

    let active = true
    void getCityById(cityCode)
      .then((cityPayload) => {
        if (!active || !cityPayload?.neighborhoods?.length) return
        const neighborhoods = Array.from(
          new Set(
            cityPayload.neighborhoods
              .map((entry) => entry.trim())
              .filter(Boolean),
          ),
        )
        if (neighborhoods.length === 0) return

        setRestaurantCities((prevCities) =>
          prevCities.map((city) =>
            city.id === cityCode
              ? {
                  ...city,
                  neighborhoods: uniqueStrings([...(city.neighborhoods ?? []), ...neighborhoods]),
                }
              : city,
          ),
        )
        setAllApiCities((prevCities) =>
          prevCities.map((city) =>
            city.id === cityCode
              ? {
                  ...city,
                  neighborhoods: uniqueStrings([...(city.neighborhoods ?? []), ...neighborhoods]),
                }
              : city,
          ),
        )
        setAddressDistrict((prevDistrict) => prevDistrict.trim() || neighborhoods[0])

        const governorateCode = addressGovernorateCode.trim()
        if (!governorateCode) return
        setGovernorates((prevGovernorates) =>
          prevGovernorates.map((entry) => {
            if (entry.id !== governorateCode) return entry
            return {
              ...entry,
              cities: entry.cities.map((city) =>
                city.id === cityCode
                  ? {
                      ...city,
                      neighborhoods,
                    }
                  : city,
              ),
            }
          }),
        )
      })
      .catch(() => {
        // Keep existing city payload if city-by-id endpoint is unavailable.
      })

    return () => {
      active = false
    }
  }, [addressCityCode, addressGovernorateCode, selectedCityOption])

  const selectedCityNeighborhoods = useMemo(() => {
    const unique = new Set<string>()
    return (selectedCityOption?.neighborhoods ?? []).map((entry) => entry.trim()).filter((entry) => {
      const normalized = normalizeLookupValue(entry)
      if (!normalized || unique.has(normalized)) return false
      unique.add(normalized)
      return true
    })
  }, [selectedCityOption])
  const districtOptions = useMemo(() => {
    const source = isRestaurantScoped
      ? restaurantStateDistricts.length > 0
        ? restaurantStateDistricts
        : uniqueStrings([...selectedCityNeighborhoods, ...restaurantDistricts])
      : selectedCityNeighborhoods.length > 0
        ? selectedCityNeighborhoods
        : restaurantDistricts
    const localizedSource = pickDistrictLabelsByLanguage(source, lang as 'ar' | 'en')
    const unique = new Set<string>()
    return localizedSource
      .map((entry) => entry.trim())
      .filter((entry) => {
        const key = normalizeDistrictKey(entry)
        if (!key || unique.has(key)) return false
        unique.add(key)
        return true
      })
  }, [isRestaurantScoped, lang, restaurantDistricts, restaurantStateDistricts, selectedCityNeighborhoods])
  const shouldUseDistrictDropdown = isRestaurantScoped || districtOptions.length > 0

  useEffect(() => {
    if (!isRestaurantScoped) return
    const matchedGovernorate = matchGovernorateByDistrict(governorates, addressDistrict)
    if (!matchedGovernorate) return

    if (matchedGovernorate.id !== addressGovernorateCode) {
      setAddressGovernorateCode(matchedGovernorate.id)
    }
    if (matchedGovernorate.stateId !== addressStateId) {
      setAddressStateId(matchedGovernorate.stateId)
    }
  }, [addressDistrict, addressGovernorateCode, addressStateId, governorates, isRestaurantScoped])

  useEffect(() => {
    if (!addressCityCode.trim()) {
      if (addressDistrict) setAddressDistrict('')
      return
    }

    if (districtOptions.length === 0) return

    setAddressDistrict((prevDistrict) => {
      const normalizedCurrent = normalizeLookupValue(prevDistrict)
      const hasCurrentDistrict = districtOptions.some(
        (district) => normalizeLookupValue(district) === normalizedCurrent,
      )
      return hasCurrentDistrict ? prevDistrict : districtOptions[0]
    })
  }, [addressCityCode, addressDistrict, districtOptions])
  const selectedSavedCard = useMemo(
    () => visibleSavedCards.find((card) => card.id === selectedSavedCardId) ?? null,
    [visibleSavedCards, selectedSavedCardId],
  )
  const detectedManualCardBrand = useMemo(() => detectCardBrandFromNumber(cardNumber), [cardNumber])
  const detectedCardBrand = selectedSavedCard?.brand ?? detectedManualCardBrand
  const cardNumberPreview = useMemo(() => {
    if (selectedSavedCard) return getMaskedCardNumber(selectedSavedCard.last4)
    const formatted = formatCardNumber(cardNumber, detectedCardBrand)
    return formatted || '0000 0000 0000 0000'
  }, [cardNumber, detectedCardBrand, selectedSavedCard])
  const cardNamePreview =
    selectedSavedCard?.nameOnCard ||
    cardName.trim() ||
    (lang === 'ar' ? '\u0627\u0633\u0645 \u062d\u0627\u0645\u0644 \u0627\u0644\u0628\u0637\u0627\u0642\u0629' : 'CARD HOLDER')
  const cardExpiryPreview = selectedSavedCard?.expiry || cardExpiry.trim() || 'MM/YY'

  function openAddressModal() {
    const preferredGovernorate =
      governorates.find((entry) => entry.id === addressGovernorateCode) ??
      governorates.find((entry) => entry.cities.length > 0) ??
      governorates[0]
    const modalCities = mergeCityOptions(
      preferredGovernorate?.cities ?? [],
      mergeCityOptions(availableCities, allGovernorateCities),
    )
    const preferredCity = pickPreferredCity(modalCities)
    setAddressStateId(preferredGovernorate?.stateId ?? '')
    setAddressGovernorateCode(preferredGovernorate?.id ?? '')
    setAddressCity(preferredCity ? (lang === 'ar' ? preferredCity.ar : preferredCity.en) : '')
    setAddressCityCode(preferredCity?.id ?? '')
    setAddressDistrict(preferredCity?.neighborhoods[0] ?? '')
    setAddressPhone(user?.phone ?? '')
    setAddressDetails('')
    setAddressDefault(addresses.length === 0)
    setAddressModalOpen(true)
  }

  async function onSaveAddress() {
    if (hasNoCommonRestaurantStates) {
      toast.error(t('toast.checkoutNoCommonDeliveryStates'))
      return
    }

    const district = addressDistrict.trim()
    const matchedGovernorate = isRestaurantScoped ? matchGovernorateByDistrict(governorates, district) : null
    const governorateCode = (matchedGovernorate?.id || addressGovernorateCode).trim()
    const stateId = resolveStateId(governorates, governorateCode, matchedGovernorate?.stateId || addressStateId)
    const stateName = getGovernorateLabelByLang(governorates, governorateCode, lang as 'ar' | 'en')
    const cityCode = addressCityCode.trim() || selectedCityOption?.id || addressCity.trim()
    const city =
      getCityLabelByLang(governorates, governorateCode, cityCode, lang as 'ar' | 'en') ||
      selectedCityOption?.ar ||
      selectedCityOption?.en ||
      addressCity.trim() ||
      stateName
    const phone = addressPhone.trim()
    const details = addressDetails.trim()
    const label =
      [district, city, stateName]
        .map((value) => value.trim())
        .find(Boolean) ||
      (lang === 'ar' ? 'عنوان التوصيل' : 'Delivery address')

    if (!stateId || !cityCode || !city || !phone || !details) {
      toast.error(t('toast.checkoutAddressRequiredFields'))
      return
    }

    const normalizedPhone = normalizeSaudiMobilePhone(phone)
    if (!normalizedPhone) {
      toast.error(t('toast.invalidSaudiPhone'))
      return
    }

    if (districtOptions.length > 0 && !district) {
      toast.error(t('toast.checkoutSelectDistrict'))
      return
    }

    const composedDetails = [details, district, city, stateName].filter(Boolean).join(', ')

    try {
      setSavingAddress(true)
      const nextAddresses = await dispatch(
        createAddress({
          restaurantId: singleRestaurantId || undefined,
          label,
          details: composedDetails,
          stateId,
          governorate: stateName || undefined,
          governorateCode: governorateCode || undefined,
          city,
          cityCode: cityCode || undefined,
          district: district || undefined,
          phone: normalizedPhone,
          isDefault: addressDefault || addresses.length === 0,
        }),
      ).unwrap()

      const newestAddress = nextAddresses[nextAddresses.length - 1] ?? null
      const selectedNextAddress =
        (addressDefault ? nextAddresses.find((address) => address.isDefault) : null) ?? newestAddress

      if (selectedNextAddress?.id) {
        setSelectedAddressId(selectedNextAddress.id)
        persistCheckoutSelectedAddressId(selectedNextAddress.id)
      }

      setAddressModalOpen(false)
      toast.success(t('toast.addressAdded'))
    } catch (error) {
      toast.error(resolveApiErrorMessage(error, t('toast.checkoutAddressAddFailed')))
    } finally {
      setSavingAddress(false)
    }
  }

  async function applyCoupon() {
    const code = coupon.trim()
    setCheckoutErrorReason('')
    if (!code) {
      setDiscount(0)
      setAppliedPromoCode('')
      return
    }

    try {
      setApplyingCoupon(true)
      const result = await validatePromoCode({
        code,
        restaurantId: singleRestaurantId || undefined,
        subtotal: orderSubtotal,
      })

      if (!result.valid) {
        const invalidMessage = result.message || t('cart.toast.invalidCoupon')
        setDiscount(0)
        setAppliedPromoCode('')
        setCheckoutErrorReason(invalidMessage)
        toast.error(invalidMessage)
        return
      }

      const maxDiscount = Math.max(0, orderSubtotal + deliveryFee)
      const normalizedDiscount = Math.min(maxDiscount, Math.max(0, Number(result.discount || 0)))

      setDiscount(normalizedDiscount)
      setAppliedPromoCode(code)
      toast.success(result.message || t('cart.toast.discountApplied'))
    } catch (error) {
      const invalidMessage = resolveApiErrorMessage(error, t('cart.toast.invalidCoupon'))
      setDiscount(0)
      setAppliedPromoCode('')
      setCheckoutErrorReason(invalidMessage)
      toast.error(invalidMessage)
    } finally {
      setApplyingCoupon(false)
    }
  }

  async function onDeleteAddress(id: string) {
    try {
      setDeletingAddressId(id)
      const nextAddresses = await dispatch(deleteAddressThunk(id)).unwrap()
      const nextCheckoutAddresses = nextAddresses.filter((address) => isAddressAllowedForCheckout(address))

      if (selectedAddressId === id) {
        const nextSelectedAddressId =
          nextCheckoutAddresses.find((address) => address.isDefault)?.id ??
          nextCheckoutAddresses[0]?.id ??
          null
        setSelectedAddressId(nextSelectedAddressId)
        persistCheckoutSelectedAddressId(nextSelectedAddressId)
      }

      toast.success(t('toast.addressDeleted'))
    } catch {
      toast.error(t('toast.addressDeleteFailed'))
    } finally {
      setDeletingAddressId(null)
    }
  }

  async function onConfirmOrder() {
    const goToOrderFailed = (reason: string) => {
      setCheckoutErrorReason(reason)
      navigate('/order-failed', { state: { reason } })
    }

    if (placingOrder) return
    setCheckoutErrorReason('')

    if (!user) {
      navigate('/login')
      return
    }

    if (cartItems.length === 0) {
      goToOrderFailed(t('cart.empty'))
      return
    }
    if (hasClosedRestaurantInCart) {
      goToOrderFailed(t('restaurant.unavailable'))
      return
    }

    const fallbackAddressId = isMockFlow ? 'mock-checkout-address' : null
    const effectiveAddressId = selectedAddressId ?? fallbackAddressId

    if (!effectiveAddressId) {
      goToOrderFailed(t('checkout.chooseAddress'))
      return
    }

    setPlacingOrder(true)
    try {
      let effectiveDeliveryFee = Math.max(0, Number(deliveryFee || 0))
      if (selectedAddressStateId && restaurantIdsInCart.length > 0 && orderSubtotal > 0) {
        const deliveryCheckResult = await resolveDeliveryForSelectedState(selectedAddressStateId)
        effectiveDeliveryFee = Math.max(0, Number(deliveryCheckResult.fee || 0))
        setDeliveryFee(effectiveDeliveryFee)
        setDeliveryErrorReason(deliveryCheckResult.reason)
        if (deliveryCheckResult.reason) {
          goToOrderFailed(deliveryCheckResult.reason)
          return
        }
      }

      if (!isMockFlow && paymentMethod === 'card' && !selectedSavedCard) {
        const cardDigits = normalizeCardDigits(cardNumber)
        const expiryDigits = normalizeCardDigits(cardExpiry)
        if (!cardName.trim() || cardDigits.length < 12 || cardCvc.length < 3 || expiryDigits.length < 4) {
          goToOrderFailed(t('toast.cardDetailsRequired'))
          return
        }
      }

      const orderNotes = [
        notes.trim(),
        paymentMethod === 'card' && selectedSavedCard
          ? lang === 'ar'
            ? `\u0627\u0644\u062f\u0641\u0639 \u0628\u0628\u0637\u0627\u0642\u0629 ${getCardBrandLabel(selectedSavedCard.brand ?? 'other', lang)} ${selectedSavedCard.last4}`
            : `Pay with ${getCardBrandLabel(selectedSavedCard.brand ?? 'other', lang)} ${selectedSavedCard.last4}`
          : '',
      ]
        .filter(Boolean)
        .join(' | ')

      let effectivePromoCode = appliedPromoCode.trim()
      let effectiveDiscount = Math.max(0, Number(discount || 0))
      const typedCoupon = coupon.trim()

      if (typedCoupon) {
        const shouldRevalidateCoupon = typedCoupon !== effectivePromoCode || effectiveDiscount <= 0
        if (shouldRevalidateCoupon) {
          setApplyingCoupon(true)
          try {
            const result = await validatePromoCode({
              code: typedCoupon,
              restaurantId: singleRestaurantId || undefined,
              subtotal: orderSubtotal,
            })

            if (!result.valid) {
              const invalidMessage = result.message || t('cart.toast.invalidCoupon')
              setDiscount(0)
              setAppliedPromoCode('')
              goToOrderFailed(invalidMessage)
              return
            }

            const maxDiscount = Math.max(0, orderSubtotal + effectiveDeliveryFee)
            const normalizedDiscount = Math.min(maxDiscount, Math.max(0, Number(result.discount || 0)))
            effectivePromoCode = typedCoupon
            effectiveDiscount = normalizedDiscount
            setDiscount(normalizedDiscount)
            setAppliedPromoCode(typedCoupon)
          } catch (error) {
            const invalidMessage = resolveApiErrorMessage(error, t('cart.toast.invalidCoupon'))
            setDiscount(0)
            setAppliedPromoCode('')
            goToOrderFailed(invalidMessage)
            return
          } finally {
            setApplyingCoupon(false)
          }
        }
      } else if (effectivePromoCode || effectiveDiscount > 0) {
        effectivePromoCode = ''
        effectiveDiscount = 0
        setAppliedPromoCode('')
        setDiscount(0)
      }

      const order = await dispatch(
        createOrderThunk({
          addressId: effectiveAddressId,
          paymentMethod,
          notes: orderNotes || undefined,
          discount: effectiveDiscount,
          promoCode: effectivePromoCode || undefined,
          deliveryFee: effectiveDeliveryFee,
          // Keep subtotal as the base food amount (without add-ons).
          // Add-ons are sent separately so backend totals stay consistent.
          subtotal: subtotalWithoutAddons,
          total: Math.max(0, orderSubtotal + effectiveDeliveryFee - effectiveDiscount),
          addonsTotal,
          cartItems,
        }),
      ).unwrap()

      toast.success(t('toast.orderPlaced'))

      try {
        await dispatch(clearCart()).unwrap()
      } catch {
        // If explicit clear fails, re-sync with API cart state.
        await dispatch(fetchCart())
      }

      const fallbackAddress =
        fallbackAddressId && effectiveAddressId === fallbackAddressId
          ? {
              label: lang === 'ar' ? 'عنوان افتراضي' : 'Default address',
              details: lang === 'ar' ? 'سيتم تأكيد عنوان التوصيل بعد الطلب' : 'Delivery address will be confirmed after order',
            }
          : null

      navigate(`/order-success/${order.id}`, {
        state: {
          address: selectedAddress ?? fallbackAddress,
          etaMinutes: 35,
        },
      })
    } catch (error) {
      goToOrderFailed(resolveApiErrorMessage(error, t('toast.failed')))
    } finally {
      setPlacingOrder(false)
    }
  }

  async function onSaveCardToMethods() {
    if (!user) {
      navigate('/login')
      return
    }

    const cardDigits = normalizeCardDigits(cardNumber)
    const expiryDigits = normalizeCardDigits(cardExpiry).slice(0, 4)
    const formattedExpiry =
      expiryDigits.length <= 2 ? expiryDigits : `${expiryDigits.slice(0, 2)}/${expiryDigits.slice(2)}`

    if (!cardName.trim() || cardDigits.length < 12 || cardCvc.length < 3 || expiryDigits.length < 4) {
      toast.error(t('toast.cardDetailsRequired'))
      return
    }

    const brand = detectCardBrandFromNumber(cardDigits)

    try {
      const cards = await dispatch(
        addSavedCardThunk({
          nameOnCard: cardName.trim(),
          cardNumber: formatCardNumber(cardDigits, brand),
          expiry: formattedExpiry,
          brand,
          isDefault: visibleSavedCards.length === 0,
        }),
      ).unwrap()

      const newestCard = cards[cards.length - 1]
      if (newestCard) {
        setSelectedSavedCardId(newestCard.id)
      }

      setCardName('')
      setCardNumber('')
      setCardCvc('')
      setCardExpiry('')

      toast.success(t('toast.cardAddedToMethods'))
    } catch (error) {
      toast.error(resolveApiErrorMessage(error, t('toast.failed')))
    }
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const closedRestaurantCheckoutReason = hasClosedRestaurantInCart ? t('restaurant.unavailable') : ''
  const visibleCheckoutErrorReason = closedRestaurantCheckoutReason || deliveryErrorReason || checkoutErrorReason

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-primary/10">
        <Container className="py-5">
          <div className="text-sm font-bold text-muted">
            <Link to="/home" className="hover:text-primary">{t('nav.home')}</Link>
            <span className="mx-2">/</span>
            <Link to="/cart" className="hover:text-primary">{t('nav.cart')}</Link>
            <span className="mx-2">/</span>
            <span className="text-navy">{t('checkout.title')}</span>
          </div>
        </Container>
      </div>

      <section className="py-12">
        <Container>
          <h1 className="text-2xl font-semibold text-navy md:text-3xl mb-8">{t('checkout.title')}</h1>
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Main (right in RTL, left in LTR) */}
            <div className="flex-1">
              {/* Stepper */}
              <div className="rounded-3xl border border-border bg-white p-5 shadow-card">
                <div className="flex items-center">
                  {steps.map((s, idx) => {
                    const isActive = s.id === activeStep
                    const isDone = s.id < activeStep

                    return (
                      <div key={s.id} className="flex flex-1 items-center">
                        <div
                          className={clsx(
                            'inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold',
                            isActive ? 'bg-primary text-white' : isDone ? 'bg-primary/15 text-primary' : 'bg-border text-muted',
                          )}
                        >
                          {s.id}
                        </div>
                        <div className={clsx('ms-3 text-xs font-extrabold', isActive ? 'text-primary' : 'text-muted')}>
                          {s.label}
                        </div>

                        {idx < steps.length - 1 ? (
                          <div
                            className={clsx(
                              'mx-4 h-[2px] flex-1 rounded-full',
                              isDone ? 'bg-primary' : 'bg-border',
                            )}
                          />
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Addresses */}
              <div className="mt-6">
                <div className="flex items-center gap-2 text-navy">
                  <LocationIcon className="text-danger" />
                  <h2 className="text-base font-extrabold">{t('checkout.chooseAddress')}</h2>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {checkoutAddresses.map((a) => {
                    const selected = a.id === selectedAddressId
                    const addressLabel = getAddressDisplayLabel(a, lang as 'ar' | 'en', governorates)
                    const addressDetails = getAddressDisplayDetails(a, lang as 'ar' | 'en', governorates)
                    return (
                      <div
                        key={a.id}
                        role="button"
                        tabIndex={0}
                        className={clsx(
                          'relative rounded-3xl border bg-white p-5 text-start shadow-card transition',
                          selected ? 'border-primary' : 'border-border hover:border-primary/50',
                        )}
                        onClick={() => {
                          setSelectedAddressId(a.id)
                          persistCheckoutSelectedAddressId(a.id)
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            setSelectedAddressId(a.id)
                            persistCheckoutSelectedAddressId(a.id)
                          }
                        }}
                      >
                        {a.isDefault ? (
                          <span className="absolute start-4 top-4 rounded-full bg-primary px-3 py-1 text-[11px] font-extrabold text-white">
                            {lang === 'ar' ? '\u0627\u0641\u062a\u0631\u0627\u0636\u064a' : 'Default'}
                          </span>
                        ) : null}
                        <button
                          type="button"
                          className="absolute end-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-danger/30 bg-danger/10 text-danger transition hover:bg-danger/15 disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={(event) => {
                            event.stopPropagation()
                            void onDeleteAddress(a.id)
                          }}
                          onKeyDown={(event) => {
                            event.stopPropagation()
                          }}
                          disabled={deletingAddressId === a.id}
                          aria-label={t('cart.delete')}
                          title={t('cart.delete')}
                        >
                          {deletingAddressId === a.id ? (
                            <span className="text-[10px] font-black">...</span>
                          ) : (
                            <XIcon className="h-4 w-4" />
                          )}
                        </button>

                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-extrabold text-navy">{addressLabel}</div>
                            <div className="mt-2 text-xs leading-6 text-muted">{addressDetails}</div>
                          </div>
                          <span
                            className={clsx(
                              'inline-flex h-6 w-6 items-center justify-center rounded-full border',
                              selected ? 'border-primary bg-primary text-white' : 'border-border bg-white',
                            )}
                          >
                            {selected ? <CheckIcon className="h-4 w-4" /> : null}
                          </span>
                        </div>
                      </div>
                    )
                  })}

                  {/* Add address */}
                  <button
                    type="button"
                    className="flex items-center justify-center rounded-3xl border border-dashed border-border bg-white p-5 text-sm font-extrabold text-muted hover:border-primary hover:text-primary"
                    onClick={openAddressModal}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        +
                      </span>
                      {t('checkout.addAddress')}
                    </span>
                  </button>
                </div>
              </div>

                            {/* Payment methods */}
              {/* Payment methods UI commented for future use
              <div className="mt-8">
                <div className="flex items-center gap-2 text-navy">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 text-primary">CARD</span>
                  <h2 className="text-base font-extrabold">{t('checkout.paymentMethod')}</h2>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <PaymentCard
                    selected={paymentMethod === 'apple_pay'}
                    title={t('checkout.payment.applePay')}
                    description={lang === 'ar' ? '\u062f\u0641\u0639 \u0633\u0631\u064a\u0639 \u0648\u0622\u0645\u0646' : 'Fast secure checkout'}
                    icon={<span className="text-[11px] font-black uppercase tracking-wide">APPLE</span>}
                    onClick={() => setPaymentMethod('apple_pay')}
                  />
                  <PaymentCard
                    selected={paymentMethod === 'cod'}
                    title={t('checkout.payment.cod')}
                    description={lang === 'ar' ? '\u0627\u062f\u0641\u0639 \u0639\u0646\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645' : 'Pay when delivered'}
                    icon={<span className="text-[11px] font-black uppercase tracking-wide">BOX</span>}
                    onClick={() => setPaymentMethod('cod')}
                  />
                  <PaymentCard
                    selected={paymentMethod === 'card'}
                    title={t('checkout.payment.card')}
                    description={lang === 'ar' ? 'Visa / Mastercard / Mada' : 'Visa / Mastercard / Mada'}
                    icon={<span className="text-[11px] font-black uppercase tracking-wide">CARD</span>}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <div className="mt-3 flex items-center gap-2">
                      <PaymentBrandBadge brand="visa" />
                      <PaymentBrandBadge brand="mastercard" />
                      <PaymentBrandBadge brand="mada" />
                    </div>
                  </PaymentCard>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="mt-6 rounded-3xl border border-border bg-white p-6 shadow-card">
                    {visibleSavedCards.length ? (
                      <div className="mb-6">
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-xs font-bold text-muted">
                            {lang === 'ar' ? '\u0627\u062e\u062a\u0631 \u0645\u0646 \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062a \u0627\u0644\u0645\u062d\u0641\u0648\u0638\u0629' : 'Choose from saved cards'}
                          </div>
                          <Button
                            variant="outline"
                            className="h-10 rounded-2xl"
                            onClick={() => setSelectedSavedCardId(null)}
                          >
                            {lang === 'ar' ? 'إضافة بطاقة جديدة' : 'Add new card'}
                          </Button>
                          </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {visibleSavedCards.map((card: SavedCard) => {
                            const selected = selectedSavedCardId === card.id
                            const brand: CardBrand = card.brand ?? 'other'
                            return (
                              <button
                                key={card.id}
                                type="button"
                                onClick={() => setSelectedSavedCardId(card.id)}
                                className={clsx(
                                  'relative rounded-2xl border bg-screen/30 p-4 text-start transition',
                                  selected ? 'border-primary shadow-card' : 'border-border hover:border-primary/40',
                                )}
                              >
                                {card.isDefault ? (
                                  <span className="absolute end-3 top-3 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-extrabold text-primary">
                                    {lang === 'ar' ? '\u0627\u0641\u062a\u0631\u0627\u0636\u064a\u0629' : 'Default'}
                                  </span>
                                ) : null}

                                <div className="flex items-center justify-between gap-2">
                                  <PaymentBrandBadge brand={brand} />
                                  {selected ? (
                                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                                      <CheckIcon className="h-3.5 w-3.5" />
                                    </span>
                                  ) : null}
                                </div>

                                <div className="mt-3 text-sm font-extrabold tracking-[0.14em] text-navy">
                                  {getMaskedCardNumber(card.last4)}
                                </div>
                                <div className="mt-2 flex items-center justify-between text-xs font-semibold text-muted">
                                  <span>{card.nameOnCard}</span>
                                  <span>{card.expiry}</span>
                                </div>
                              </button>
                            )
                          })}

                          <button
                            type="button"
                            onClick={() => setSelectedSavedCardId(null)}
                            className={clsx(
                              'rounded-2xl border border-dashed p-4 text-start text-sm font-bold transition',
                              selectedSavedCardId === null
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border text-muted hover:border-primary/40 hover:text-primary',
                            )}
                          >
                            {lang === 'ar' ? '\u0627\u0633\u062a\u062e\u062f\u0645 \u0628\u0637\u0627\u0642\u0629 \u062c\u062f\u064a\u062f\u0629' : 'Use a new card'}
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <div
                      className={clsx(
                        'relative overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-white shadow-soft',
                        getCardBrandTheme(detectedCardBrand),
                      )}
                    >
                      <div className="pointer-events-none absolute -top-10 end-0 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
                      <div className="pointer-events-none absolute -bottom-12 -start-8 h-36 w-36 rounded-full bg-black/20 blur-2xl" />

                      <div className="relative flex items-center justify-between gap-3">
                        <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-extrabold">
                          {lang === 'ar' ? '\u0628\u0637\u0627\u0642\u0629 \u0628\u0646\u0643\u064a\u0629' : 'Bank card'}
                        </span>
                        <PaymentBrandBadge brand={detectedCardBrand} size="md" />
                      </div>

                      <div className="relative mt-8 text-lg font-black tracking-[0.18em]">{cardNumberPreview}</div>

                      <div className="relative mt-6 flex items-end justify-between gap-4 text-xs">
                        <div>
                          <div className="text-white/70">{lang === 'ar' ? '\u0627\u0644\u0627\u0633\u0645' : 'Card holder'}</div>
                          <div className="mt-1 text-sm font-bold uppercase tracking-wide">{cardNamePreview}</div>
                        </div>
                        <div className="text-end">
                          <div className="text-white/70">{lang === 'ar' ? '\u0627\u0644\u0635\u0644\u0627\u062d\u064a\u0629' : 'Expiry'}</div>
                          <div className="mt-1 text-sm font-bold tracking-wide">{cardExpiryPreview}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <PaymentBrandChip brand="visa" active={detectedCardBrand === 'visa'} lang={lang} />
                      <PaymentBrandChip brand="mastercard" active={detectedCardBrand === 'mastercard'} lang={lang} />
                      <PaymentBrandChip brand="mada" active={detectedCardBrand === 'mada'} lang={lang} />
                    </div>

                    {selectedSavedCard ? (
                      <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-semibold text-navy">
                        {lang === 'ar'
                          ? '\u0633\u064a\u062a\u0645 \u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0627\u0644\u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0645\u062d\u0641\u0648\u0638\u0629 \u0627\u0644\u0645\u062d\u062f\u062f\u0629.'
                          : 'The selected saved card will be used for payment.'}
                      </div>
                    ) : (
                      <div className="mt-5 grid gap-4">
                        <div>
                          <div className="mb-2 text-xs font-bold text-muted">{t('checkout.card.name')}</div>
                          <Input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder={t('checkout.card.name')} />
                        </div>

                        <div>
                          <div className="mb-2 text-xs font-bold text-muted">{t('checkout.card.number')}</div>
                          <Input
                            value={cardNumber}
                            onChange={(e) => {
                              const digits = normalizeCardDigits(e.target.value).slice(0, 19)
                              const brand = detectCardBrandFromNumber(digits)
                              setCardNumber(formatCardNumber(digits, brand))
                            }}
                            placeholder="0000 0000 0000 0000"
                            inputMode="numeric"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="mb-2 text-xs font-bold text-muted">{t('checkout.card.cvc')}</div>
                            <Input
                              value={cardCvc}
                              onChange={(e) => setCardCvc(normalizeCardDigits(e.target.value).slice(0, 4))}
                              placeholder="123"
                              inputMode="numeric"
                            />
                          </div>
                          <div>
                            <div className="mb-2 text-xs font-bold text-muted">{t('checkout.card.expiry')}</div>
                            <Input
                              value={cardExpiry}
                              onChange={(e) => {
                                const digits = normalizeCardDigits(e.target.value).slice(0, 4)
                                if (digits.length <= 2) {
                                  setCardExpiry(digits)
                                  return
                                }
                                setCardExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`)
                              }}
                              placeholder="MM/YY"
                              inputMode="numeric"
                            />
                          </div>
                        </div>

                        {user ? (
                          <div className="pt-1">
                          <Button variant="outline" className="h-11 rounded-2xl" onClick={onSaveCardToMethods}>
                            {lang === 'ar' ? 'إضافة البطاقة لطرق الدفع' : 'Save card to payment methods'}
                          </Button>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              */}
              {/* Notes */}
              <div className="mt-8">
                <h2 className="text-base font-extrabold text-navy">{t('checkout.orderNotes')}</h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={lang === 'ar' ? '\u0647\u0644 \u0644\u062f\u064a\u0643 \u0623\u064a \u062a\u0639\u0644\u064a\u0645\u0627\u062a \u062e\u0627\u0635\u0629 \u0644\u0644\u062a\u0648\u0635\u064a\u0644 \u0623\u0648 \u062a\u062d\u0636\u064a\u0631 \u0627\u0644\u0637\u0639\u0627\u0645\u061f' : 'Any special delivery/cooking instructions?'}
                  className="mt-3 h-28 w-full rounded-3xl border border-border bg-white p-4 text-start text-sm font-semibold outline-none transition focus:border-primary"
                />
              </div>
            </div>

            {/* Summary */}
            <aside className="w-full lg:w-[360px]">
              <div className="overflow-hidden rounded-[32px] bg-navy text-white shadow-[0_22px_44px_rgba(3,8,31,0.24)]">
                <div className="bg-primary px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="text-base font-extrabold tracking-tight">{t('checkout.summary.title')}</div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/25 bg-white/20 text-white">
                      <CartIcon size={18} />
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {cartItems.map((item) => {
                      const addonsPerUnit = getCartItemAddonsPricePerUnit(item.options)
                      const baseUnitPrice = resolveCartItemBaseUnitPrice(item)
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
                        <div key={item.id} className="flex items-center justify-between gap-4">
                        <div className="text-end">
                          {typeof oldBaseUnitPrice === 'number' ? (
                            <div className="text-[11px] font-bold text-white/60 line-through">
                              <CurrencyAmount amount={oldBaseUnitPrice * item.quantity} lang={lang} currencyLabel={t('currency.sar')} />
                            </div>
                          ) : null}
                          <div className="text-sm font-extrabold text-primary">
                            <CurrencyAmount amount={checkoutBaseItemTotalsById[item.id] ?? baseUnitPrice * item.quantity} lang={lang} currencyLabel={t('currency.sar')} />
                          </div>
                        </div>

                        <div className="flex flex-1 items-center justify-end gap-3">
                          <div className="text-end">
                            <div className="text-sm font-extrabold [unicode-bidi:plaintext]" dir="auto">
                              {resolvedMealNamesByItemId[item.id] || toSaudiCurrencySymbolText(item.name, lang)}
                            </div>
                            <div className="mt-1 text-xs text-white/60">
                              {t('cart.quantity')}: {item.quantity}
                            </div>
                          </div>
                          <img src={item.imageUrl || '/images/dish-1.jpg'} alt="" className="h-10 w-10 rounded-2xl object-cover" />
                        </div>
                      </div>
                      )
                    })}

                    <div className="text-sm">
                      <Row
                        label={t('checkout.summary.subtotal')}
                        value={<CurrencyAmount amount={subtotalWithoutAddons} lang={lang} currencyLabel={t('currency.sar')} />}
                      />
                      <Row
                        label={t('checkout.summary.addons')}
                        value={<CurrencyAmount amount={addonsTotal} lang={lang} currencyLabel={t('currency.sar')} />}
                      />
                      {hasSelectedAddress ? (
                        <Row
                          label={t('checkout.summary.delivery')}
                          value={<CurrencyAmount amount={deliveryFee} lang={lang} currencyLabel={t('currency.sar')} />}
                        />
                      ) : null}
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

                      <div className="mt-5 flex min-w-0 items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <Input
                            value={coupon}
                            onChange={(e) => {
                              const nextValue = e.target.value
                              setCoupon(nextValue)
                              if (checkoutErrorReason) setCheckoutErrorReason('')

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

                      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-lg font-extrabold">
                        <span>{t('checkout.summary.total')}</span>
                        <span className="text-primary">
                          <CurrencyAmount amount={total} lang={lang} currencyLabel={t('currency.sar')} />
                        </span>
                      </div>

                      <Button
                        className="mt-5 h-12 w-full rounded-full text-base font-extrabold tracking-tight"
                        disabled={placingOrder || applyingCoupon || cartItems.length === 0 || hasClosedRestaurantInCart}
                        onClick={onConfirmOrder}
                      >
                        {t('checkout.summary.confirm')}
                      </Button>

                      {visibleCheckoutErrorReason ? (
                        <div className="mt-3 rounded-2xl border border-danger/40 bg-danger/10 px-3 py-2 text-xs font-bold text-danger">
                          {visibleCheckoutErrorReason}
                        </div>
                      ) : null}

                      <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-white/65">
                        <LockIcon size={14} className="text-success" />
                        <span>{t('checkout.secure')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <Modal
        open={addressModalOpen}
        onClose={() => {
          if (!savingAddress) setAddressModalOpen(false)
        }}
        className="max-w-[640px]"
      >
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold text-navy">
              {lang === 'ar' ? 'إضافة عنوان للتوصيل' : 'Add delivery address'}
            </div>
            <button
              type="button"
              data-modal-close
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white text-navy hover:bg-screen disabled:pointer-events-none disabled:opacity-50"
              onClick={() => setAddressModalOpen(false)}
              disabled={savingAddress}
              aria-label="close"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-extrabold text-muted">
                  {lang === 'ar' ? 'المدينة' : 'City'}
                </label>
                <Select
                  value={addressCityCode}
                  onChange={(event) => {
                    const nextCityCode = event.target.value
                    const fallbackCityLabel = getCityLabelByLang(
                      governorates,
                      addressGovernorateCode,
                      nextCityCode,
                      lang as 'ar' | 'en',
                    )
                    const selectedCity = availableCities.find((city) => city.id === nextCityCode)
                    const selectedCityLabel = selectedCity ? (lang === 'ar' ? selectedCity.ar : selectedCity.en) : ''
                    const nextNeighborhoods = selectedCity?.neighborhoods ?? []

                    setAddressCityCode(nextCityCode)
                    setAddressCity(fallbackCityLabel || selectedCityLabel)
                    setAddressDistrict(nextNeighborhoods[0] ?? (isRestaurantScoped ? restaurantDistricts[0] ?? '' : ''))
                    setAddressStateId(resolveStateId(governorates, addressGovernorateCode, addressStateId))
                  }}
                  disabled={
                    savingAddress ||
                    availableCities.length === 0 ||
                    (restaurantCities.length === 0 && (!addressGovernorateCode || loadingGovernorateCities))
                  }
                  className="h-12 w-full rounded-2xl"
                >
                  <option value="">
                    {loadingGovernorateCities || (loadingRestaurantDistricts && restaurantCities.length === 0)
                      ? lang === 'ar'
                        ? 'جارٍ تحميل المدن...'
                        : 'Loading cities...'
                      : lang === 'ar'
                        ? 'اختر المدينة'
                        : 'Select city'}
                  </option>
                  {availableCities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {lang === 'ar' ? city.ar : city.en}
                    </option>
                  ))}
                </Select>
                {!loadingGovernorateCities && availableCities.length === 0 ? (
                  <p className="mt-2 text-xs font-semibold text-muted">
                    {lang === 'ar' ? 'لا توجد مدن متاحة حالياً' : 'No cities are available right now'}
                  </p>
                ) : null}
                {hasNoCommonRestaurantStates ? (
                  <p className="mt-2 text-xs font-semibold text-danger">
                    {lang === 'ar'
                      ? 'لا توجد مناطق توصيل مشتركة لكل المطاعم الموجودة في السلة. يرجى إتمام كل مطعم في طلب منفصل.'
                      : 'No common delivery states are available for all restaurants in this cart. Please place each restaurant in a separate order.'}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-xs font-extrabold text-muted">
                  {lang === 'ar' ? 'الحي / المنطقة' : 'District / Area'}
                </label>
                {shouldUseDistrictDropdown ? (
                  <Select
                    value={addressDistrict}
                    onChange={(event) => {
                      const nextDistrict = event.target.value
                      setAddressDistrict(nextDistrict)

                      if (!isRestaurantScoped) return
                      const matchedGovernorate = matchGovernorateByDistrict(governorates, nextDistrict)
                      if (!matchedGovernorate) return
                      setAddressGovernorateCode(matchedGovernorate.id)
                      setAddressStateId(matchedGovernorate.stateId)
                    }}
                    disabled={
                      !addressCityCode || savingAddress || loadingGovernorateCities || (isRestaurantScoped && districtOptions.length === 0)
                    }
                    className="h-12 w-full rounded-2xl"
                  >
                    <option value="">
                      {isRestaurantScoped && districtOptions.length === 0
                        ? lang === 'ar'
                          ? 'لا توجد مناطق توصيل متاحة حالياً لهذا المطعم'
                          : 'No delivery areas are currently available for this restaurant'
                        : lang === 'ar'
                          ? 'اختر الحي / المنطقة'
                          : 'Select district / area'}
                    </option>
                    {districtOptions.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    value={addressDistrict}
                    onChange={(event) => setAddressDistrict(event.target.value)}
                    placeholder={lang === 'ar' ? 'اكتب الحي أو المنطقة' : 'Type district or area'}
                    disabled={!addressCityCode || savingAddress || loadingGovernorateCities}
                  />
                )}
                {loadingRestaurantDistricts ? (
                  <p className="mt-2 text-xs font-semibold text-muted">
                    {lang === 'ar' ? 'جارٍ تحميل مناطق التوصيل الخاصة بالمطعم...' : 'Loading restaurant delivery areas...'}
                  </p>
                ) : null}
                {districtOptions.length > 0 ? (
                  <p className="mt-2 text-xs font-semibold text-muted">
                    {restaurantDistricts.length > 0
                      ? lang === 'ar'
                        ? 'هذه الأحياء/المناطق متاحة للتوصيل لهذا المطعم.'
                        : 'These districts/areas are available for delivery for this restaurant.'
                      : lang === 'ar'
                        ? 'هذه الشوارع/الأحياء المتاحة للتوصيل حسب بيانات المدينة.'
                        : 'These streets/areas are available based on city data.'}
                  </p>
                ) : null}
              </div>

            </div>

            <div>
              <label className="mb-2 block text-xs font-extrabold text-muted">
                {lang === 'ar' ? 'رقم الهاتف' : 'Phone'}
              </label>
              <Input
                type="tel"
                value={addressPhone}
                onChange={(event) => setAddressPhone(event.target.value)}
                placeholder="05X XXX XXXX"
                disabled={savingAddress}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-extrabold text-muted">
                {lang === 'ar' ? 'العنوان الكامل' : 'Full address'}
              </label>
              <textarea
                value={addressDetails}
                onChange={(event) => setAddressDetails(event.target.value)}
                placeholder={lang === 'ar' ? 'اكتب العنوان بالتفصيل' : 'Enter full address details'}
                className="min-h-[110px] w-full rounded-3xl border border-border bg-white px-4 py-3 text-start text-sm font-semibold outline-none transition focus:border-primary disabled:opacity-60"
                disabled={savingAddress}
              />
            </div>

            <label className="flex items-center gap-3 text-sm font-semibold text-navy">
              <input
                type="checkbox"
                checked={addressDefault}
                onChange={(event) => setAddressDefault(event.target.checked)}
                disabled={savingAddress}
              />
              {lang === 'ar' ? 'تعيينه كعنوان افتراضي' : 'Set as default address'}
            </label>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                className="h-11 rounded-2xl"
                onClick={() => setAddressModalOpen(false)}
                disabled={savingAddress}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                className="h-11 rounded-2xl"
                onClick={onSaveAddress}
                disabled={savingAddress}
              >
                {savingAddress ? (lang === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ العنوان' : 'Save address')}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
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
      <span className={clsx('font-extrabold tracking-tight text-white', valueClassName)}>{value}</span>
    </div>
  )
}

function PaymentCard({
  selected,
  title,
  description,
  icon,
  onClick,
  children,
}: {
  selected: boolean
  title: string
  description?: string
  icon: ReactNode
  onClick: () => void
  children?: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'relative rounded-3xl border bg-white p-5 text-start shadow-card transition',
        selected ? 'border-primary' : 'border-border hover:border-primary/50',
      )}
    >
      {selected ? (
        <span className="absolute start-4 top-4 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
          <CheckIcon className="h-4 w-4" />
        </span>
      ) : null}

      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-screen text-navy">{icon}</div>
        <div className="min-w-0">
          <div className="text-sm font-extrabold text-navy">{title}</div>
          {description ? <div className="mt-1 text-[11px] font-semibold text-muted">{description}</div> : null}
        </div>
      </div>
      {children}
    </button>
  )
}

function PaymentBrandBadge({
  brand,
  size = 'sm',
}: {
  brand: CardBrand
  size?: 'sm' | 'md'
}) {
  const wrapperClassName =
    size === 'md'
      ? 'inline-flex h-8 min-w-[56px] items-center justify-center rounded-xl border border-white/30 bg-white/10 px-2'
      : 'inline-flex h-7 min-w-[48px] items-center justify-center rounded-lg border border-border bg-white px-2 shadow-input'

  if (brand === 'visa') {
    return (
      <span className={wrapperClassName}>
        <VisaIcon size={size === 'md' ? 24 : 20} />
      </span>
    )
  }

  if (brand === 'mastercard') {
    return (
      <span className={wrapperClassName}>
        <MastercardIcon size={size === 'md' ? 24 : 20} />
      </span>
    )
  }

  return (
    <span
      className={clsx(
        wrapperClassName,
        size === 'md' ? 'text-xs font-black uppercase tracking-wide text-white' : 'text-[10px] font-black uppercase tracking-wide text-navy',
      )}
    >
      {brand === 'mada' ? 'mada' : 'card'}
    </span>
  )
}

function PaymentBrandChip({
  brand,
  active,
  lang,
}: {
  brand: CardBrand
  active: boolean
  lang: 'ar' | 'en'
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold transition',
        active ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted',
      )}
    >
      <PaymentBrandBadge brand={brand} />
      {getCardBrandLabel(brand, lang)}
    </span>
  )
}





