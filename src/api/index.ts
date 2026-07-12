import { getMenuCategories, getMenuItems, type MenuCategory, type MenuItem, type MenuOption } from '@/data/menuData'
import type {
  Address,
  Brand,
  CartItem,
  Category,
  CuisineType,
  Kitchen,
  Order,
  PaymentMethod,
  Restaurant,
  Review,
  SavedCard,
  User,
} from '@/store/types/domain'

import * as mock from './mockApi'
import type { RestaurantsQuery } from './mockApi'

export type { RestaurantsQuery } from './mockApi'

export type RestaurantMenuData = {
  categories: MenuCategory[]
  items: MenuItem[]
}

export type CityWithNeighborhoods = {
  id: string
  name: string
  neighborhoods: string[]
}

export type StateCityOption = {
  id: string
  name: string
  nameAr?: string
  neighborhoods: string[]
}

export type StateOption = {
  id: string
  name: string
  nameAr?: string
  code?: string
  deliveryPrice?: number
  cities: StateCityOption[]
}

export type RestaurantBranch = {
  id: string
  restaurantId?: string
  name: string
  nameAr?: string
  nameEn?: string
  address: string
  addressAr?: string
  addressEn?: string
  phone?: string
  city?: string
  cityAr?: string
  cityEn?: string
  state?: string
  stateAr?: string
  stateEn?: string
  latitude?: number
  longitude?: number
  mapUrl?: string
  isOpen?: boolean
  neighborhoods?: string[]
}

export type RestaurantDeliveryCheckResult = {
  available: boolean
  message?: string
  branchId?: string
  fee?: number
  etaMin?: number
  etaMax?: number
}

export type PromoValidationResult = {
  valid: boolean
  discount: number
  message?: string
}

export type PromotionDiscountType = 'percentage' | 'fixed' | 'unknown'

export type Promotion = {
  id: string
  code: string
  description: string
  descriptionAr: string
  imageUrl?: string
  discountType: PromotionDiscountType
  discountValue: number
  minimumOrder: number
  maxDiscount: number
  isActive: boolean
  validFrom?: string
  validUntil?: string
}

export type Faq = {
  id: string
  question: string
  questionAr: string
  answer: string
  answerAr: string
  order: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type ContactPayload = {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export type ContactResult = {
  success: boolean
  message?: string
}

export type NewsletterPayload = {
  email: string
}

export type NewsletterResult = {
  success: boolean
  message?: string
}

export type AppSettings = {
  siteName: string
  siteNameAr: string
  siteDescription: string
  siteDescriptionAr: string
  homeHeroTagline: string
  homeHeroTaglineAr: string
  homeHeroDescription: string
  homeHeroDescriptionAr: string
  contactEmail: string
  contactPhone: string
  contactAddress: string
  contactAddressAr: string
  mapUrl: string
  mapQuery: string
  mapQueryAr: string
  facebookUrl: string
  instagramUrl: string
  linkedinUrl: string
  twitterUrl: string
  xUrl: string
  youtubeUrl: string
  tiktokUrl: string
  snapchatUrl: string
  whatsappUrl: string
  logoUrl: string
  faqJson: string
  faqJsonAr: string
  faqContent: string
  faqContentAr: string
  privacyContent: string
  privacyContentAr: string
  termsContent: string
  termsContentAr: string
  aboutTitle: string
  aboutTitleAr: string
  aboutContent: string
  aboutContentAr: string
  aboutImage: string
  aboutFeature1: string
  aboutFeature1Ar: string
  aboutFeature2: string
  aboutFeature2Ar: string
  aboutFeature3: string
  aboutFeature3Ar: string
  ourVision: string
  ourVisionAr: string
  ourMission: string
  ourMissionAr: string
  statPartners: string
  statPartnersAr: string
  statCustomers: string
  statCustomersAr: string
  statPartnersCount: string
  statPartnersCountAr: string
  statDailyOrders: string
  statDailyOrdersAr: string
  weTrustTitle: string
  weTrustTitleAr: string
  weTrustContent: string
  weTrustContentAr: string
  weTrustImage: string
  weTrustImageTitle: string
  weTrustImageTitleAr: string
  aboutBreadcrumbHome?: string
  aboutBreadcrumbHomeAr?: string
  aboutBreadcrumbCurrent?: string
  aboutBreadcrumbCurrentAr?: string
  aboutHeroBadge?: string
  aboutHeroBadgeAr?: string
  aboutHeroTitle?: string
  aboutHeroTitleAr?: string
  aboutHeroDescription?: string
  aboutHeroDescriptionAr?: string
  aboutHeroPrimaryCta?: string
  aboutHeroPrimaryCtaAr?: string
  aboutHeroSecondaryCta?: string
  aboutHeroSecondaryCtaAr?: string
  aboutStoryTag?: string
  aboutStoryTagAr?: string
  aboutStoryTitle?: string
  aboutStoryTitleAr?: string
  aboutStoryDescription?: string
  aboutStoryDescriptionAr?: string
  aboutVisionTitle?: string
  aboutVisionTitleAr?: string
  aboutMissionTitle?: string
  aboutMissionTitleAr?: string
  aboutWhyTag?: string
  aboutWhyTagAr?: string
  aboutWhyTitle?: string
  aboutWhyTitleAr?: string
  aboutWhyDescription?: string
  aboutWhyDescriptionAr?: string
  aboutFeature1Title?: string
  aboutFeature1TitleAr?: string
  aboutFeature2Title?: string
  aboutFeature2TitleAr?: string
  aboutFeature3Title?: string
  aboutFeature3TitleAr?: string
  aboutFeature4?: string
  aboutFeature4Ar?: string
  aboutFeature4Title?: string
  aboutFeature4TitleAr?: string
  aboutStatRestaurantsLabel?: string
  aboutStatRestaurantsLabelAr?: string
  aboutStatYearsLabel?: string
  aboutStatYearsLabelAr?: string
  aboutStatCustomersLabel?: string
  aboutStatCustomersLabelAr?: string
  aboutStatPartnersLabel?: string
  aboutStatPartnersLabelAr?: string
  aboutStatOrdersLabel?: string
  aboutStatOrdersLabelAr?: string
  aboutExperienceYears?: string
  aboutExperienceYearsAr?: string
  aboutRatingValue?: string
  aboutRatingValueAr?: string
  aboutRatingLabel?: string
  aboutRatingLabelAr?: string
}

type ApiMode = 'mock' | 'live' | 'hybrid'
type RecordValue = Record<string, unknown>
export type SocialProvider = 'google' | 'facebook'
export type SocialLoginNavigationOptions = {
  callbackUrl?: string
}
type UiLang = 'ar' | 'en'
export type DataSourceMode = 'api' | 'mock' | 'hybrid'
export type AuthSession = {
  user: User
  token: string
}

export type ResetPasswordPayload = {
  token?: string
  code?: string
  email?: string
  password: string
  confirmPassword: string
}

export type ForgotPasswordPayload = {
  email: string
  redirectUrl?: string
}

export type ForgotPasswordResult = {
  success: boolean
  message?: string
}

const AUTH_STORAGE_KEY = 'albarq_auth_session'
const LEGACY_AUTH_STORAGE_KEYS = ['\u0627\u0644\u0628\u0631\u0642 \u0627\u0644\u0633\u0631\u064a\u0639_auth', 'Ø§Ù„Ø¨Ø±Ù‚ Ø§Ù„Ø³Ø±ÙŠØ¹_auth'] as const
const LANG_STORAGE_KEY = '????? ??????_lang'
const LEGACY_LANG_STORAGE_KEYS = [LANG_STORAGE_KEY] as const
const ADDRESS_RESTAURANT_MAP_STORAGE_KEY = 'albarq_address_restaurant_map_v1'
const DEFAULT_BASE_URL = 'http://localhost:8000/api'
const API_MODE = resolveApiMode(import.meta.env.VITE_DATA_SOURCE, import.meta.env.VITE_API_MODE)
const DATA_SOURCE_MODE = toDataSourceMode(API_MODE)
const LIVE_ENABLED = API_MODE !== 'mock'
const HYBRID_ENABLED = API_MODE === 'hybrid'
const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL)
const API_STORAGE_BASE_URL = normalizeStorageBaseUrl(import.meta.env.VITE_API_STORAGE_BASE_URL)
const API_LOG_ENABLED = import.meta.env.DEV || String(import.meta.env.VITE_API_LOG ?? '').toLowerCase() === 'true'

function normalizeOptionalPath(path: string): string {
  const trimmed = path.trim()
  if (!trimmed) return ''
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

function getOptionalApiPathList(value: string | undefined, fallback: string[]): string[] {
  const fromEnv = (value ?? '')
    .split(',')
    .map(normalizeOptionalPath)
    .filter(Boolean)
  return uniqueStrings([...fromEnv, ...fallback.map(normalizeOptionalPath)])
}

function getOptionalApiPathListWithRequiredFirst(
  requiredPath: string,
  value: string | undefined,
  fallback: string[],
): string[] {
  const required = normalizeOptionalPath(requiredPath)
  const rows = getOptionalApiPathList(value, fallback)
  const withoutRequired = rows.filter((path) => normalizeOptionalPath(path) !== required)
  return uniqueStrings([required, ...withoutRequired])
}

const OPTIONAL_CART_GET_PATHS = getOptionalApiPathList(import.meta.env.VITE_CART_GET_PATHS, ['/cart', '/cart/items'])
const OPTIONAL_CART_ADD_PATHS = getOptionalApiPathList(import.meta.env.VITE_CART_ADD_PATHS, ['/cart/add', '/cart/items', '/cart'])
const OPTIONAL_CART_UPDATE_PATHS = getOptionalApiPathList(
  import.meta.env.VITE_CART_UPDATE_PATHS,
  ['/cart/item/{id}', '/cart/items/{id}', '/cart/{id}'],
)
const OPTIONAL_CART_REMOVE_PATHS = getOptionalApiPathList(
  import.meta.env.VITE_CART_REMOVE_PATHS,
  ['/cart/item/{id}', '/cart/items/{id}', '/cart/{id}'],
)
const OPTIONAL_CART_CLEAR_PATHS = getOptionalApiPathList(import.meta.env.VITE_CART_CLEAR_PATHS, ['/cart/clear', '/cart'])
const OPTIONAL_CHECKOUT_PATHS = getOptionalApiPathList(import.meta.env.VITE_CHECKOUT_PATHS, ['/cart/checkout', '/orders'])
const OPTIONAL_ORDERS_LIST_PATHS = getOptionalApiPathList(
  import.meta.env.VITE_ORDERS_LIST_PATHS,
  ['/orders/my-orders', '/orders'],
)
const OPTIONAL_ORDERS_GET_PATHS = getOptionalApiPathList(import.meta.env.VITE_ORDERS_GET_PATHS, ['/orders/{id}', '/order/{id}'])
const OPTIONAL_ORDERS_CANCEL_PATHS = getOptionalApiPathList(
  import.meta.env.VITE_ORDERS_CANCEL_PATHS,
  ['/orders/{id}/cancel', '/orders/cancel/{id}', '/order/{id}/cancel'],
)

const OPTIONAL_FAVORITES_GET_PATHS = getOptionalApiPathList(import.meta.env.VITE_FAVORITES_GET_PATHS, ['/wishlist', '/favorites'])
const OPTIONAL_FAVORITES_ADD_PATHS = getOptionalApiPathList(
  import.meta.env.VITE_FAVORITES_ADD_PATHS,
  ['/wishlist/add', '/wishlist', '/favorites/add', '/favorites'],
)
const OPTIONAL_FAVORITES_REMOVE_PATHS = getOptionalApiPathList(
  import.meta.env.VITE_FAVORITES_REMOVE_PATHS,
  ['/wishlist/{id}', '/wishlist/remove/{id}', '/favorites/{id}', '/favorites/remove/{id}'],
)
const OPTIONAL_BRANCHES_GET_PATHS = getOptionalApiPathList(
  import.meta.env.VITE_BRANCHES_GET_PATHS,
  ['/branches', '/restaurants/{id}/branches', '/restaurant/{id}/branches'],
)
const OPTIONAL_BRANCHES_NEARBY_PATHS = getOptionalApiPathList(import.meta.env.VITE_BRANCHES_NEARBY_PATHS, ['/branches/nearby'])
const OPTIONAL_PASSWORD_RESET_PATHS = getOptionalApiPathList(
  import.meta.env.VITE_PASSWORD_RESET_PATHS,
  ['/auth/reset-password', '/auth/password/reset', '/password/reset', '/reset-password'],
)
const OPTIONAL_PASSWORD_FORGOT_PATHS = getOptionalApiPathList(
  import.meta.env.VITE_PASSWORD_FORGOT_PATHS,
  ['/auth/forgot-password', '/auth/password/forgot', '/password/forgot', '/forgot-password', '/auth/forget-password', '/forget-password'],
)
const OPTIONAL_RESTAURANT_STATES_PATHS = getOptionalApiPathListWithRequiredFirst(
  '/restaurants/{id}/states',
  import.meta.env.VITE_RESTAURANT_STATES_PATHS,
  ['/restaurants/{id}/states'],
)
const BRANCH_ARRAY_KEYS = ['branches', 'nearby_branches', 'restaurant_branches']
const OPTIONAL_RESTAURANT_CHECK_DELIVERY_PATHS = getOptionalApiPathList(
  import.meta.env.VITE_RESTAURANT_CHECK_DELIVERY_PATHS,
  ['/restaurants/{id}/check-delivery/{stateId}'],
)

function normalizeDataSourceMode(value: string | undefined): DataSourceMode | null {
  const normalized = (value ?? '').trim().toLowerCase()
  if (!normalized) return null
  if (normalized === 'api' || normalized === 'live') return 'api'
  if (normalized === 'mock' || normalized === 'static' || normalized === 'dummy') return 'mock'
  if (normalized === 'hybrid') return 'hybrid'
  return null
}

function toDataSourceMode(mode: ApiMode): DataSourceMode {
  if (mode === 'live') return 'api'
  return mode
}

function resolveApiMode(dataSourceValue: string | undefined, apiModeValue: string | undefined): ApiMode {
  const dataSourceMode = normalizeDataSourceMode(dataSourceValue)
  if (dataSourceMode === 'api') return 'live'
  if (dataSourceMode === 'mock') return 'mock'
  if (dataSourceMode === 'hybrid') return 'hybrid'
  return normalizeApiMode(apiModeValue)
}

function normalizeApiMode(value: string | undefined): ApiMode {
  const normalized = (value ?? 'hybrid').trim().toLowerCase()
  if (normalized === 'mock' || normalized === 'live' || normalized === 'hybrid') return normalized
  return 'hybrid'
}

function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, '')

  try {
    const parsed = new URL(trimmed)
    if (!parsed.pathname || parsed.pathname === '/') {
      parsed.pathname = '/api'
    }
    return parsed.toString().replace(/\/+$/, '')
  } catch {
    return trimmed
  }
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`
}

function normalizeStorageBaseUrl(value: string | undefined): string {
  const origin = getApiOrigin()
  const raw = (value ?? '').trim()

  if (raw) {
    if (/^(?:https?:)?\/\//i.test(raw)) {
      try {
        return ensureTrailingSlash(new URL(raw).toString())
      } catch {
        // ignore malformed value and continue to fallback
      }
    } else if (origin) {
      try {
        const path = raw.startsWith('/') ? raw : `/${raw}`
        return ensureTrailingSlash(new URL(path, origin).toString())
      } catch {
        // ignore malformed value and continue to fallback
      }
    }
  }

  if (!origin) return '/storage/'
  return `${origin.replace(/\/+$/, '')}/storage/`
}

function isRecord(value: unknown): value is RecordValue {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function parseJson(text: string): unknown {
  if (!text.trim()) return {}
  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

function detectUiLang(): UiLang {
  // Always honor the current document language first.
  // This keeps API localization aligned with the live site language.
  if (typeof document !== 'undefined') {
    const htmlLang = document.documentElement.getAttribute('lang')?.toLowerCase()
    if (htmlLang?.startsWith('en')) return 'en'
    if (htmlLang?.startsWith('ar')) return 'ar'
  }

  if (typeof window !== 'undefined') {
    try {
      for (const key of LEGACY_LANG_STORAGE_KEYS) {
        const stored = window.localStorage.getItem(key)
        if (stored === 'ar' || stored === 'en') {
          window.localStorage.setItem(LANG_STORAGE_KEY, stored)
          return stored
        }
      }
    } catch {
      // ignore
    }
  }

  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language?.toLowerCase() ?? ''
    if (browserLang.startsWith('en')) return 'en'
  }

  return 'ar'
}

function isLikelyEnglishMessage(value: string): boolean {
  const hasAsciiLetters = /[a-z]/i.test(value)
  const hasArabicLetters = /[\u0600-\u06ff]/i.test(value)
  return hasAsciiLetters && !hasArabicLetters
}

const MOJIBAKE_REGEX = /(?:\u00C3|\u00C2|\u00D8|\u00D9|\u00D0|\u00D1|\u00CF|\u00E2|\u00F0|\u0152|\u0153|\u0178|\u201A|\u201C|\u201D|\u2018|\u2019|\u2014|\u2013)/
const BROKEN_TEXT_ONLY_REGEX = /^[\s??\uFFFD._\-–—,:;\\/|()[\]{}"'`~!@#$%^&*+=<>]+$/
const BROKEN_TEXT_MARKER_REGEX = /[??\uFFFD]/
const BIDI_CONTROL_CHARS_REGEX = /[\u061c\u200b\u200e\u200f\u202a-\u202e\u2066-\u2069\ufeff]/gu
const CP1252_TO_BYTE: Record<number, number> = {
  0x20ac: 0x80,
  0x201a: 0x82,
  0x0192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8a,
  0x2039: 0x8b,
  0x0152: 0x8c,
  0x017d: 0x8e,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02dc: 0x98,
  0x2122: 0x99,
  0x0161: 0x9a,
  0x203a: 0x9b,
  0x0153: 0x9c,
  0x017e: 0x9e,
  0x0178: 0x9f,
}

function repairMojibakeText(value: string): string {
  if (!value || !MOJIBAKE_REGEX.test(value)) return value

  const bytes: number[] = []
  for (const ch of value) {
    const code = ch.codePointAt(0)
    if (code == null) return value

    if (code <= 0xff) {
      bytes.push(code)
      continue
    }

    const cp1252Byte = CP1252_TO_BYTE[code]
    if (cp1252Byte == null) return value
    bytes.push(cp1252Byte)
  }

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes))
  } catch {
    return value
  }
}

function normalizeIncomingText(value: string): string {
  let normalized = value.trim()
  if (!normalized) return ''

  for (let i = 0; i < 3; i += 1) {
    const repaired = repairMojibakeText(normalized)
    if (repaired === normalized) break
    normalized = repaired.trim()
    if (!normalized) return ''
  }

  // Remove hidden directional control marks that can reorder mixed Arabic/number text.
  normalized = normalized.replace(BIDI_CONTROL_CHARS_REGEX, '')
  try {
    normalized = normalized.normalize('NFKC')
  } catch {
    // Ignore engines that do not support Unicode normalization.
  }

  normalized = normalized.replace(/\s+/g, ' ').trim()
  if (!normalized) return ''

  if (BROKEN_TEXT_ONLY_REGEX.test(normalized) && BROKEN_TEXT_MARKER_REGEX.test(normalized)) {
    return ''
  }

  return normalized
}

function cleanErrorMessage(value: string): string {
  return repairMojibakeText(value)
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[`"'.,:;!?-]+/, '')
    .replace(/[`"']+$/, '')
    .trim()
}

const ARABIC_ERROR_TRANSLATIONS: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /(provided credentials are incorrect|invalid credentials|credentials do not match our records|invalid email or password)/i,
    message: '\u0628\u064a\u0627\u0646\u0627\u062a \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u063a\u064a\u0631 \u0635\u062d\u064a\u062d\u0629.',
  },
  {
    pattern: /(unauthenticated|unauthorized|forbidden|not authenticated|authentication token is missing|token is missing)/i,
    message: '\u064a\u0631\u062c\u0649 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0623\u0648\u0644\u0627\u064b.',
  },
  {
    pattern: /(passwords? do(?:es)? not match|password confirmation does not match)/i,
    message: '\u0643\u0644\u0645\u062a\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0645\u062a\u0637\u0627\u0628\u0642\u062a\u064a\u0646.',
  },
  {
    pattern: /(email .* already (?:been taken|exists))/i,
    message: '\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0645\u0633\u062a\u062e\u062f\u0645 \u0628\u0627\u0644\u0641\u0639\u0644.',
  },
  {
    pattern: /(phone .* already (?:been taken|exists))/i,
    message: '\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641 \u0645\u0633\u062a\u062e\u062f\u0645 \u0628\u0627\u0644\u0641\u0639\u0644.',
  },
  {
    pattern: /(too many requests|too many attempts|throttled|try again in)/i,
    message: '\u0639\u062f\u062f \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0627\u062a \u0643\u0628\u064a\u0631\u060c \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649 \u0628\u0639\u062f \u0642\u0644\u064a\u0644.',
  },
  {
    pattern: /(given data was invalid|validation|invalid data)/i,
    message: '\u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0645\u062f\u062e\u0644\u0629 \u063a\u064a\u0631 \u0635\u0627\u0644\u062d\u0629.',
  },
  {
    pattern: /(failed to fetch|network error|network request failed|load failed|connection)/i,
    message: '\u062a\u0639\u0630\u0631 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0627\u0644\u062e\u0627\u062f\u0645\u060c \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
  },
  {
    pattern: /(please enter a valid email|invalid email)/i,
    message: '\u064a\u0631\u062c\u0649 \u0625\u062f\u062e\u0627\u0644 \u0628\u0631\u064a\u062f \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0635\u062d\u064a\u062d.',
  },
  {
    pattern: /(invalid card number)/i,
    message: '\u0631\u0642\u0645 \u0627\u0644\u0628\u0637\u0627\u0642\u0629 \u063a\u064a\u0631 \u0635\u062d\u064a\u062d.',
  },
  {
    pattern: /(cart is empty)/i,
    message: '\u0627\u0644\u0633\u0644\u0629 \u0641\u0627\u0631\u063a\u0629.',
  },
  {
    pattern: /(cart .* unavailable|favorites? .* unavailable|favorite toggle endpoint is unavailable)/i,
    message: '\u062e\u062f\u0645\u0629 \u0627\u0644\u0633\u0644\u0629 \u0623\u0648 \u0627\u0644\u0645\u0641\u0636\u0644\u0629 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629 \u062d\u0627\u0644\u064a\u0627\u064b.',
  },
  {
    pattern:
      /(does not deliver to this location|not deliver to this location|delivery unavailable for this location|outside delivery area|cannot deliver to this location|restaurant does not deliver)/i,
    message: '\u0627\u0644\u0645\u0637\u0639\u0645 \u0644\u0627 \u064a\u0648\u0635\u0644 \u0625\u0644\u0649 \u0647\u0630\u0647 \u0627\u0644\u0645\u0646\u0637\u0642\u0629.',
  },
]

export function localizeApiErrorMessage(rawMessage: string): string {
  const message = cleanErrorMessage(rawMessage)
  if (!message) {
    return detectUiLang() === 'ar'
      ? '\u062d\u062f\u062b \u062e\u0637\u0623\u060c \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.'
      : 'Request failed'
  }

  if (detectUiLang() === 'en') return message

  for (const entry of ARABIC_ERROR_TRANSLATIONS) {
    if (entry.pattern.test(message)) return entry.message
  }

  if (isLikelyEnglishMessage(message)) {
    return '\u062d\u062f\u062b \u062e\u0637\u0623\u060c \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.'
  }

  return message
}

export function resolveApiErrorMessage(error: unknown, fallbackMessage?: string): string {
  if (error instanceof Error && error.message) return localizeApiErrorMessage(error.message)
  if (typeof error === 'string' && error.trim()) return localizeApiErrorMessage(error)
  if (isRecord(error)) {
    const directMessageCandidates = [
      error.message,
      error.error,
      error.reason,
      error.detail,
      error.title,
      error.description,
    ]
    for (const candidate of directMessageCandidates) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return localizeApiErrorMessage(candidate)
      }
    }

    const nestedCandidates = [error.data, error.payload, error.response]
    for (const candidate of nestedCandidates) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return localizeApiErrorMessage(candidate)
      }
      if (isRecord(candidate)) {
        const nestedMessageCandidates = [
          candidate.message,
          candidate.error,
          candidate.reason,
          candidate.detail,
          candidate.title,
          candidate.description,
        ]
        for (const nestedMessage of nestedMessageCandidates) {
          if (typeof nestedMessage === 'string' && nestedMessage.trim()) {
            return localizeApiErrorMessage(nestedMessage)
          }
        }
      }
    }
  }
  if (fallbackMessage) return localizeApiErrorMessage(fallbackMessage)
  return localizeApiErrorMessage('')
}

type StoredAuthPayload = {
  token?: unknown
  user?: unknown
}

function getAuthStorageKeys(): readonly string[] {
  return [AUTH_STORAGE_KEY, ...LEGACY_AUTH_STORAGE_KEYS]
}

function writeStoredAuthPayload(payload: StoredAuthPayload): void {
  if (typeof window === 'undefined') return
  try {
    const serialized = JSON.stringify(payload)
    for (const key of getAuthStorageKeys()) {
      window.localStorage.setItem(key, serialized)
    }
  } catch {
    // ignore storage write failures
  }
}

function readStoredAuthPayload(): StoredAuthPayload | null {
  if (typeof window === 'undefined') return null

  for (const key of getAuthStorageKeys()) {
    try {
      const raw = window.localStorage.getItem(key)
      if (!raw) continue

      const parsed = JSON.parse(raw) as StoredAuthPayload
      const token = typeof parsed?.token === 'string' ? parsed.token.trim() : ''
      if (!token) continue

      const payload: StoredAuthPayload = {
        token,
        user: parsed?.user ?? null,
      }

      // Keep auth session mirrored in all historical storage keys.
      writeStoredAuthPayload(payload)
      return payload
    } catch {
      // Try the next key.
    }
  }

  return null
}

export function clearPersistedAuthSession(): void {
  if (typeof window === 'undefined') return
  for (const key of getAuthStorageKeys()) {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // ignore storage remove failures
    }
  }
}

function normalizeAddressRestaurantId(value: unknown): string {
  if (typeof value !== 'string') return ''
  const normalized = value.trim()
  if (!normalized) return ''
  if (normalized.toLowerCase() === 'restaurant') return ''
  return normalized
}

function readAddressRestaurantMap(): Record<string, string> {
  if (typeof window === 'undefined') return {}

  try {
    const raw = window.localStorage.getItem(ADDRESS_RESTAURANT_MAP_STORAGE_KEY)
    if (!raw) return {}

    const parsed = JSON.parse(raw) as unknown
    if (!isRecord(parsed)) return {}

    const next: Record<string, string> = {}
    for (const [addressId, restaurantId] of Object.entries(parsed)) {
      const normalizedAddressId = String(addressId ?? '').trim()
      const normalizedRestaurantId = normalizeAddressRestaurantId(restaurantId)
      if (!normalizedAddressId || !normalizedRestaurantId) continue
      next[normalizedAddressId] = normalizedRestaurantId
    }

    return next
  } catch {
    return {}
  }
}

function writeAddressRestaurantMap(mapping: Record<string, string>): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(ADDRESS_RESTAURANT_MAP_STORAGE_KEY, JSON.stringify(mapping))
  } catch {
    // ignore storage write failures
  }
}

function setAddressRestaurantMapEntry(addressId: string, restaurantId: string): void {
  const normalizedAddressId = addressId.trim()
  const normalizedRestaurantId = normalizeAddressRestaurantId(restaurantId)
  if (!normalizedAddressId || !normalizedRestaurantId) return

  const mapping = readAddressRestaurantMap()
  if (mapping[normalizedAddressId] === normalizedRestaurantId) return
  mapping[normalizedAddressId] = normalizedRestaurantId
  writeAddressRestaurantMap(mapping)
}

function removeAddressRestaurantMapEntry(addressId: string): void {
  const normalizedAddressId = addressId.trim()
  if (!normalizedAddressId) return

  const mapping = readAddressRestaurantMap()
  if (!(normalizedAddressId in mapping)) return
  delete mapping[normalizedAddressId]
  writeAddressRestaurantMap(mapping)
}

function findAddressMatchForRestaurantTag(rows: Address[], payload: Omit<Address, 'id'>): Address | null {
  if (rows.length === 0) return null

  const payloadDetails = firstString([payload.details], '').trim()
  const payloadPhone = firstString([payload.phone], '').trim()
  const payloadCity = firstString([payload.city, payload.cityCode], '').trim()
  const payloadState = firstString([payload.stateId, payload.governorateCode], '').trim()

  const bestMatch =
    [...rows].reverse().find((entry) => {
      if (payloadDetails && entry.details.trim() === payloadDetails) return true
      if (payloadPhone && payloadCity && entry.phone?.trim() === payloadPhone && entry.city?.trim() === payloadCity) return true
      if (payloadState && entry.stateId?.trim() === payloadState) return true
      return false
    }) ?? null

  return bestMatch ?? rows[rows.length - 1] ?? null
}

function applyAddressRestaurantMetadata(rows: Address[]): Address[] {
  if (rows.length === 0) return rows

  const mapping = readAddressRestaurantMap()
  let mappingChanged = false

  const nextRows = rows.map((entry) => {
    const normalizedAddressId = entry.id.trim()
    if (!normalizedAddressId) return entry

    const explicitRestaurantId = normalizeAddressRestaurantId(entry.restaurantId)
    if (explicitRestaurantId) {
      if (mapping[normalizedAddressId] !== explicitRestaurantId) {
        mapping[normalizedAddressId] = explicitRestaurantId
        mappingChanged = true
      }
      if (entry.restaurantId === explicitRestaurantId) return entry
      return { ...entry, restaurantId: explicitRestaurantId }
    }

    const mappedRestaurantId = normalizeAddressRestaurantId(mapping[normalizedAddressId])
    if (!mappedRestaurantId) return entry
    return { ...entry, restaurantId: mappedRestaurantId }
  })

  if (mappingChanged) {
    writeAddressRestaurantMap(mapping)
  }

  return nextRows
}

function readAuthToken(): string | null {
  const payload = readStoredAuthPayload()
  if (!payload) return null
  return typeof payload.token === 'string' && payload.token.trim() ? payload.token.trim() : null
}

function readStoredAuthUserPayload(): unknown {
  const payload = readStoredAuthPayload()
  return payload?.user ?? null
}

function getApiOrigin(): string {
  try {
    return new URL(API_BASE_URL).origin
  } catch {
    if (typeof window !== 'undefined') return window.location.origin
    return ''
  }
}

function buildApiUrl(path: string, query?: Record<string, unknown>): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${API_BASE_URL}${normalizedPath}`)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === null || value === undefined || value === '') continue
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item === null || item === undefined || item === '') continue
          url.searchParams.append(key, String(item))
        }
        continue
      }
      url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}

function appendQueryToUrl(urlValue: string, query?: Record<string, unknown>): string {
  const url = new URL(urlValue)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === null || value === undefined || value === '') continue
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item === null || item === undefined || item === '') continue
          url.searchParams.append(key, String(item))
        }
        continue
      }
      url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}

function buildOriginUrl(path: string, query?: Record<string, unknown>): string {
  const origin = getApiOrigin()
  if (!origin) return ''

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return appendQueryToUrl(`${origin}${normalizedPath}`, query)
}

function getCurrentOrigin(): string {
  if (typeof window === 'undefined') return ''
  return window.location.origin
}

function buildCurrentOriginUrl(path: string, query?: Record<string, unknown>): string {
  const origin = getCurrentOrigin()
  if (!origin) return ''

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return appendQueryToUrl(`${origin}${normalizedPath}`, query)
}

function getConfiguredApiBaseUrl(): string {
  const raw = API_BASE_URL.trim()
  if (!raw) return ''

  const normalizedRaw = raw.replace(/\/+$/, '')

  if (/^[a-z]+:\/\//i.test(normalizedRaw) || normalizedRaw.startsWith('//')) {
    try {
      return new URL(normalizedRaw).toString().replace(/\/+$/, '')
    } catch {
      return ''
    }
  }

  if (typeof window === 'undefined') return ''
  try {
    return new URL(normalizedRaw, window.location.origin).toString().replace(/\/+$/, '')
  } catch {
    return ''
  }
}

function getConfiguredApiOrigin(): string {
  const baseUrl = getConfiguredApiBaseUrl()
  if (!baseUrl) return ''
  try {
    return new URL(baseUrl).origin
  } catch {
    return ''
  }
}

function getConfiguredApiPathPrefix(): string {
  const baseUrl = getConfiguredApiBaseUrl()
  if (!baseUrl) return ''
  try {
    const pathname = new URL(baseUrl).pathname.replace(/\/+$/, '').toLowerCase()
    if (!pathname || pathname === '/') return ''
    return pathname
  } catch {
    return ''
  }
}

function buildConfiguredApiUrl(path: string, query?: Record<string, unknown>): string {
  const baseUrl = getConfiguredApiBaseUrl()
  if (!baseUrl) return ''
  let normalizedPath = path.startsWith('/') ? path : `/${path}`
  const prefix = getConfiguredApiPathPrefix()

  // Avoid duplicating API prefix when callers provide both `/api/...` path
  // and `VITE_API_BASE_URL` already ends with `/api`.
  if (prefix) {
    const lowerPath = normalizedPath.toLowerCase()
    if (lowerPath === prefix) {
      normalizedPath = ''
    } else if (lowerPath.startsWith(`${prefix}/`)) {
      normalizedPath = normalizedPath.slice(prefix.length)
    }
  }

  return appendQueryToUrl(`${baseUrl}${normalizedPath}`, query)
}

function matchesConfiguredApiPathPrefix(urlValue: string): boolean {
  const prefix = getConfiguredApiPathPrefix()
  if (!prefix) return false

  try {
    const base = typeof window !== 'undefined' ? window.location.origin : undefined
    const parsed = new URL(urlValue, base)
    const pathname = parsed.pathname.toLowerCase()
    return pathname === prefix || pathname.startsWith(`${prefix}/`)
  } catch {
    return false
  }
}

function extractErrorMessage(payload: unknown): string {
  if (typeof payload === 'string' && payload.trim()) return localizeApiErrorMessage(payload)

  if (isRecord(payload)) {
    const message = payload.message
    if (typeof message === 'string' && message.trim()) return localizeApiErrorMessage(message)

    const error = payload.error
    if (typeof error === 'string' && error.trim()) return localizeApiErrorMessage(error)

    const errors = payload.errors
    if (isRecord(errors)) {
      for (const value of Object.values(errors)) {
        if (Array.isArray(value) && value.length > 0) {
          const first = value[0]
          if (typeof first === 'string' && first.trim()) return localizeApiErrorMessage(first)
        }
        if (typeof value === 'string' && value.trim()) return localizeApiErrorMessage(value)
      }
    }
  }

  return localizeApiErrorMessage('Request failed')
}

function isLikelyMissingEndpointError(error: unknown): boolean {
  const message = resolveApiErrorMessage(error, '').toLowerCase()
  if (!message) return false

  return (
    /\b404\b/.test(message) ||
    message.includes('not found') ||
    message.includes('cannot post') ||
    message.includes('cannot get') ||
    message.includes('cannot put') ||
    message.includes('cannot patch') ||
    message.includes('route') && message.includes('not defined') ||
    message.includes('endpoint is unavailable')
  )
}

function isLikelyMethodNotAllowedError(error: unknown): boolean {
  const message = resolveApiErrorMessage(error, '').toLowerCase()
  if (!message) return false

  return (
    /\b405\b/.test(message) ||
    message.includes('method not allowed') ||
    message.includes('method is not supported') ||
    message.includes('unsupported method')
  )
}

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
type RequestOptions = {
  method?: RequestMethod
  auth?: boolean
  query?: Record<string, unknown>
  body?: unknown
}

const MUTATION_METHODS = new Set<RequestMethod>(['POST', 'PUT', 'PATCH', 'DELETE'])
const inFlightMutationRequests = new Map<string, Promise<unknown>>()

function buildMutationRequestKey(method: RequestMethod, url: string, body: string | undefined): string {
  return `${method}::${url}::${body ?? ''}`
}

async function requestJson<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const method = options.method ?? 'GET'
  const url = buildApiUrl(path, options.query)
  const startedAt = Date.now()
  const uiLang = detectUiLang()
  const headers = new Headers({
    Accept: 'application/json',
    'Accept-Language': uiLang,
    'X-Locale': uiLang,
  })

  if (options.auth !== false) {
    const token = readAuthToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  let body: string | undefined
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(options.body)
  }

  const shouldDedupeMutation = MUTATION_METHODS.has(method)
  const requestKey = shouldDedupeMutation ? buildMutationRequestKey(method, url, body) : ''
  if (requestKey) {
    const existing = inFlightMutationRequests.get(requestKey)
    if (existing) {
      if (API_LOG_ENABLED) {
        console.warn('[API DUPLICATE MUTATION SKIPPED]', {
          method,
          url,
        })
      }
      return existing as Promise<T>
    }
  }

  const requestPromise = (async () => {
    let response: Response
    try {
      response = await fetch(url, {
        method,
        headers,
        body,
      })
    } catch (error) {
      if (API_LOG_ENABLED) {
        console.error('[API NETWORK ERROR]', {
          method,
          url,
          durationMs: Date.now() - startedAt,
          requestBody: options.body,
          error,
        })
      }
      const raw = error instanceof Error && error.message ? error.message : 'Network error'
      throw new Error(localizeApiErrorMessage(raw))
    }

    const text = await response.text()
    const payload = parseJson(text)
    const durationMs = Date.now() - startedAt

    if (!response.ok) {
      if (API_LOG_ENABLED) {
        console.error('[API ERROR RESPONSE]', {
          method,
          url,
          status: response.status,
          durationMs,
          requestBody: options.body,
          response: payload,
        })
      }
      throw new Error(extractErrorMessage(payload))
    }

    if (API_LOG_ENABLED) {
      console.log('[API RESPONSE]', {
        method,
        url,
        status: response.status,
        durationMs,
        requestBody: options.body,
        response: payload,
      })
    }

    return payload as T
  })()

  if (requestKey) {
    inFlightMutationRequests.set(requestKey, requestPromise as Promise<unknown>)
    requestPromise.finally(() => {
      const current = inFlightMutationRequests.get(requestKey)
      if (current === (requestPromise as Promise<unknown>)) {
        inFlightMutationRequests.delete(requestKey)
      }
    })
  }

  return requestPromise
}

async function tryRequestJson<T>(path: string, options: RequestOptions = {}): Promise<T | null> {
  try {
    return await requestJson<T>(path, options)
  } catch (error) {
    if (API_LOG_ENABLED) {
      console.warn('[API OPTIONAL ENDPOINT FAILED]', {
        method: options.method ?? 'GET',
        path,
        error,
      })
    }
    return null
  }
}

function unwrapData(payload: unknown): unknown {
  if (isRecord(payload) && 'data' in payload) return payload.data
  return payload
}

function extractArray(payload: unknown, preferredKeys: string[] = []): unknown[] {
  const keys = [...preferredKeys, 'items', 'results', 'rows', 'list', 'data']
  const candidates: unknown[] = [payload, unwrapData(payload)]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
    if (!isRecord(candidate)) continue

    for (const key of keys) {
      const value = candidate[key]
      if (Array.isArray(value)) return value
      if (isRecord(value) && Array.isArray(value.data)) return value.data
    }

    const meta = candidate.meta
    if (isRecord(meta) && Array.isArray(meta.data)) return meta.data
  }

  return []
}

function extractArrayByKeysOnly(payload: unknown, keys: string[]): unknown[] {
  if (!keys.length) return []

  const candidates: unknown[] = [payload, unwrapData(payload)]

  for (const candidate of candidates) {
    if (!isRecord(candidate)) continue

    for (const key of keys) {
      const value = candidate[key]
      if (Array.isArray(value)) return value
      if (isRecord(value) && Array.isArray(value.data)) return value.data
    }
  }

  return []
}

function hasExtractableArray(payload: unknown, preferredKeys: string[] = []): boolean {
  const keys = [...preferredKeys, 'items', 'results', 'rows', 'list', 'data']
  const candidates: unknown[] = [payload, unwrapData(payload)]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return true
    if (!isRecord(candidate)) continue

    for (const key of keys) {
      const value = candidate[key]
      if (Array.isArray(value)) return true
      if (isRecord(value) && Array.isArray(value.data)) return true
    }

    const meta = candidate.meta
    if (isRecord(meta) && Array.isArray(meta.data)) return true
  }

  return false
}

function extractObject(payload: unknown): RecordValue {
  return extractObjectByKeys(payload)
}

function extractObjectByKeys(payload: unknown, preferredKeys: string[] = []): RecordValue {
  const keys = [...preferredKeys, 'item', 'restaurant', 'result']
  const candidates: unknown[] = [unwrapData(payload), payload]

  for (const candidate of candidates) {
    if (!isRecord(candidate)) continue

    for (const key of keys) {
      const value = candidate[key]
      if (isRecord(value)) return value
    }

    return candidate
  }

  return {}
}

function firstString(candidates: unknown[], fallback = ''): string {
  for (const value of candidates) {
    if (typeof value === 'string') {
      const normalized = normalizeIncomingText(value)
      if (normalized) return normalized
    }
    if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  }
  return fallback
}

function optionalString(candidates: unknown[]): string | undefined {
  const value = firstString(candidates, '')
  return value || undefined
}

function firstStringByPredicate(candidates: unknown[], predicate: (value: string) => boolean): string {
  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue
    const normalized = normalizeIncomingText(candidate)
    if (!normalized) continue
    if (predicate(normalized)) return normalized
  }
  return ''
}

function pickLocalizedString(
  arCandidates: unknown[],
  enCandidates: unknown[],
  fallbackCandidates: unknown[] = [],
  fallback = '',
): string {
  const arScriptValue = firstStringByPredicate(arCandidates, (value) => /[\u0600-\u06ff]/u.test(value))
  const enScriptValue = firstStringByPredicate(enCandidates, (value) => isLikelyEnglishMessage(value))
  const arValue = arScriptValue || firstString(arCandidates, '')
  const enValue = enScriptValue || firstString(enCandidates, '')
  if (detectUiLang() === 'ar') {
    // In Arabic mode: prefer Arabic, then neutral fallback fields, then English.
    return firstString([arValue, ...fallbackCandidates, enValue], fallback)
  }

  // In English mode: prefer English, then neutral fallback fields (e.g. `name`), then Arabic.
  return firstString([enValue, ...fallbackCandidates, arValue], fallback)
}

function pickOptionalLocalizedString(
  arCandidates: unknown[],
  enCandidates: unknown[],
  fallbackCandidates: unknown[] = [],
): string | undefined {
  const value = pickLocalizedString(arCandidates, enCandidates, fallbackCandidates, '')
  return value || undefined
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function pickNumber(candidates: unknown[], fallback = 0): number {
  let firstFinite: number | null = null

  for (const candidate of candidates) {
    const parsed = toNumber(candidate, Number.NaN)
    if (!Number.isFinite(parsed)) continue
    if (parsed > 0) return parsed
    if (firstFinite === null) firstFinite = parsed
  }

  return firstFinite ?? fallback
}

function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'open') return true
    if (normalized === 'false' || normalized === '0' || normalized === 'no' || normalized === 'closed') return false
  }
  return fallback
}

function normalizeId(value: unknown, fallback: string): string {
  const normalized = firstString([value], '')
  return normalized || fallback
}

function uniqueStrings(items: string[]): string[] {
  return Array.from(new Set(items.filter((item) => item.trim())))
}

function toStringList(value: unknown): string[] {
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()]
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return [String(value)]
  }

  if (isRecord(value)) {
    const label = pickLocalizedString(
      [
        value.name_ar,
        value.nameAr,
        value.title_ar,
        value.titleAr,
        value.label_ar,
        value.labelAr,
      ],
      [
        value.name_en,
        value.nameEn,
        value.title_en,
        value.titleEn,
        value.label_en,
        value.labelEn,
      ],
      [value.name, value.title, value.label, value.value, value.slug, value.key, value.id],
      '',
    )
    return label ? [label] : []
  }

  if (!Array.isArray(value)) return []

  const values: string[] = []
  for (const item of value) {
    if (typeof item === 'string' && item.trim()) {
      values.push(item.trim())
      continue
    }
    if (typeof item === 'number' && Number.isFinite(item)) {
      values.push(String(item))
      continue
    }
    if (isRecord(item)) {
      const label = pickLocalizedString(
        [
          item.name_ar,
          item.nameAr,
          item.title_ar,
          item.titleAr,
          item.label_ar,
          item.labelAr,
        ],
        [
          item.name_en,
          item.nameEn,
          item.title_en,
          item.titleEn,
          item.label_en,
          item.labelEn,
        ],
        [item.name, item.title, item.label, item.value, item.slug, item.key, item.id],
        '',
      )
      if (label) values.push(label)
    }
  }

  return uniqueStrings(values)
}

function resolveAssetUrl(value: unknown, fallback: string): string {
  const raw = firstString([value], '').trim()
  if (!raw) return fallback

  const normalizedRaw = raw.replace(/\\/g, '/').trim()
  if (!normalizedRaw || /^(?:null|undefined|n\/a|#)$/i.test(normalizedRaw)) return fallback

  if (/^(?:https?:)?\/\//i.test(normalizedRaw) || normalizedRaw.startsWith('data:')) return normalizedRaw

  const origin = getApiOrigin()
  if (!origin) {
    return normalizedRaw.startsWith('/') ? normalizedRaw : `/${normalizedRaw}`
  }

  try {
    if (/^\/?storage\//i.test(normalizedRaw)) {
      const storagePath = normalizedRaw.startsWith('/') ? normalizedRaw : `/${normalizedRaw}`
      return new URL(storagePath, origin).toString()
    }

    if (/^\/?(?:images|logo_icons|assets)\//i.test(normalizedRaw)) {
      const publicPath = normalizedRaw.startsWith('/') ? normalizedRaw : `/${normalizedRaw}`
      return new URL(publicPath, origin).toString()
    }

    if (normalizedRaw.startsWith('/')) {
      return new URL(normalizedRaw, origin).toString()
    }

    return new URL(normalizedRaw, API_STORAGE_BASE_URL).toString()
  } catch {
    return normalizedRaw
  }
}

function sanitizeCuisineKey(value: string, index: number): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]+/g, '')
    .replace(/^_+|_+$/g, '')

  return normalized || `cuisine_${index + 1}`
}

function normalizeMenuCategoryLabel(value: unknown): string {
  const raw = firstString([value], '').trim()
  if (!raw) return ''

  const withoutEdgePunctuation = raw.replace(/^[\s._\-\/]+|[\s._\-\/]+$/g, '')
  const normalizedWhitespace = (withoutEdgePunctuation || raw).replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
  if (!normalizedWhitespace) return raw

  if (/[a-z]/i.test(normalizedWhitespace) && normalizedWhitespace === normalizedWhitespace.toLowerCase()) {
    return normalizedWhitespace.replace(/\b[a-z]/g, (char) => char.toUpperCase())
  }

  return normalizedWhitespace
}

function normalizeFilterValue(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/ء/g, '')
    .replace(/[إأٱآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildFilterNeedles(...groups: Array<string[] | undefined>): string[] {
  const merged = groups
    .flatMap((group) => group ?? [])
    .map((value) => normalizeFilterValue(value))
    .filter(Boolean)
  return Array.from(new Set(merged))
}

function matchesNeedles(candidates: string[], needles: string[]): boolean {
  if (!needles.length) return true

  const normalizedCandidates = candidates
    .map((value) => normalizeFilterValue(value))
    .filter(Boolean)

  if (!normalizedCandidates.length) return false

  return needles.some((needle) =>
    normalizedCandidates.some((candidate) => candidate === needle || candidate.includes(needle) || needle.includes(candidate)),
  )
}

function applyNeedleFallbackFilter(
  source: Restaurant[],
  needles: string[],
  getCandidates: (restaurant: Restaurant) => string[],
): { items: Restaurant[]; applied: boolean } {
  if (!needles.length) return { items: source, applied: false }

  const hasAnyComparableMetadata = source.some((restaurant) =>
    getCandidates(restaurant)
      .map((candidate) => normalizeFilterValue(candidate))
      .some(Boolean),
  )
  if (!hasAnyComparableMetadata) {
    return { items: source, applied: false }
  }

  const filtered = source.filter((restaurant) => matchesNeedles(getCandidates(restaurant), needles))
  return { items: filtered, applied: true }
}

function collectRestaurantItemCategoryTags(record: Record<string, unknown>): string[] {
  const itemRows = extractArray(record, ['items', 'menu_items', 'menuItems', 'products'])
  if (!itemRows.length) return []

  const tags: string[] = []
  for (const row of itemRows) {
    if (!isRecord(row)) continue
    const categoryRecord = isRecord(row.category) ? row.category : null
    tags.push(
      ...toStringList(row.category_id),
      ...toStringList(row.categoryId),
      ...toStringList(row.category_ids),
      ...toStringList(row.categoryIds),
      ...toStringList(row.category_name),
      ...toStringList(row.categoryName),
      ...toStringList(row.category_name_ar),
      ...toStringList(row.categoryNameAr),
      ...toStringList(row.category_name_en),
      ...toStringList(row.categoryNameEn),
      ...toStringList(categoryRecord ? [categoryRecord] : []),
      ...toStringList(categoryRecord?.id),
      ...toStringList(categoryRecord?.slug),
      ...toStringList(categoryRecord?.key),
      ...toStringList(categoryRecord?.name),
      ...toStringList(categoryRecord?.name_ar),
      ...toStringList(categoryRecord?.name_en),
    )
  }

  return uniqueStrings(tags)
}

function extractTotal(payload: unknown, fallback: number): number {
  const candidates: unknown[] = [payload, unwrapData(payload)]
  const root = extractObject(payload)
  const unwrapped = extractObject(unwrapData(payload))
  candidates.push(root.meta, root.pagination, unwrapped.meta, unwrapped.pagination)

  for (const candidate of candidates) {
    if (!isRecord(candidate)) continue
    const total = toNumber(candidate.total, Number.NaN)
    if (Number.isFinite(total)) return total
    const count = toNumber(candidate.count, Number.NaN)
    if (Number.isFinite(count)) return count
  }

  return fallback
}

function normalizeRestaurant(raw: unknown, index = 0): Restaurant {
  const record = isRecord(raw) ? raw : {}
  const locationValue = isRecord(record.location) ? record.location : null
  const coordinatesValue = isRecord(record.coordinates) ? record.coordinates : null
  const stateValue = isRecord(record.state) ? record.state : null
  const cityValue = isRecord(record.city) ? record.city : null
  const cuisineValue = isRecord(record.cuisine) ? record.cuisine : null
  const cuisineTypeValue = isRecord(record.cuisine_type) ? record.cuisine_type : null
  const branchRows = extractArrayByKeysOnly(record, ['branches', 'restaurant_branches'])
  const primaryBranchIndex = branchRows.findIndex(
    (entry) => isRecord(entry) && toBoolean(entry.is_primary ?? entry.primary, false),
  )
  const preferredBranchIndex = primaryBranchIndex >= 0 ? primaryBranchIndex : 0
  const preferredBranchRaw = branchRows[preferredBranchIndex]
  const preferredBranchRecord = isRecord(preferredBranchRaw) ? preferredBranchRaw : null
  const preferredBranch = preferredBranchRaw !== undefined ? normalizeBranch(preferredBranchRaw, preferredBranchIndex) : null

  const id = normalizeId(record.restaurant_id ?? record.id ?? record.uuid, `restaurant-${index + 1}`)
  const nameAr = optionalString([
    record.name_ar,
    record.nameAr,
    record.restaurant_name_ar,
    record.restaurantNameAr,
    record.title_ar,
    record.titleAr,
  ])
  const nameEn = optionalString([
    record.name_en,
    record.nameEn,
    record.restaurant_name_en,
    record.restaurantNameEn,
    record.title_en,
    record.titleEn,
    // Keep generic fields as fallback only when explicit English fields are unavailable.
    record.name,
    record.restaurant_name,
    record.restaurantName,
    record.title,
  ])
  const name = pickLocalizedString(
    [nameAr],
    [nameEn],
    [record.name, record.title, record.restaurant_name],
    '',
  )
  const logoUrl = resolveAssetUrl(
    record.logo_url ?? record.logo ?? record.logoUrl ?? record.thumbnail ?? record.image_url ?? record.image,
    '/images/albarq-main-logo-180.png',
  )
  const coverUrl = resolveAssetUrl(
    record.cover_url ??
      record.cover_image ??
      record.cover ??
      record.banner ??
      record.banner_image ??
      record.image_url ??
      record.image,
    '/images/dish-1.jpg',
  )
  const cuisineAr = optionalString([
    record.cuisine_name_ar,
    record.cuisineNameAr,
    isRecord(cuisineValue) ? cuisineValue.name_ar : undefined,
    isRecord(cuisineTypeValue) ? cuisineTypeValue.name_ar : undefined,
    cuisineValue?.name_ar,
    cuisineValue?.nameAr,
    cuisineTypeValue?.name_ar,
    cuisineTypeValue?.nameAr,
  ])
  const cuisineEn = optionalString([
    record.cuisine_name_en,
    record.cuisineNameEn,
    cuisineValue?.name_en,
    cuisineValue?.nameEn,
    cuisineTypeValue?.name_en,
    cuisineTypeValue?.nameEn,
    // Keep generic fields as fallback only when explicit English fields are unavailable.
    record.cuisine_name,
    record.cuisine,
    record.cuisine_type,
    isRecord(cuisineValue) ? cuisineValue.name : undefined,
    isRecord(cuisineTypeValue) ? cuisineTypeValue.name : undefined,
    cuisineValue?.name,
    cuisineTypeValue?.name,
  ])
  const cuisine = pickLocalizedString(
    [cuisineAr],
    [cuisineEn],
    [record.cuisine_name, record.cuisine_type, record.cuisine],
    '',
  )

  const tags = uniqueStrings([
    ...toStringList(record.tags),
    ...toStringList(record.labels),
    ...toStringList(record.cuisines),
    ...toStringList(record.cuisine_types),
    ...toStringList(record.categories),
    ...toStringList(record.category_ids),
    ...toStringList(record.categoryIds),
    ...toStringList(record.category),
    ...toStringList(record.category_id),
    ...toStringList(record.categoryId),
    ...toStringList(isRecord(record.cuisine) ? [record.cuisine] : []),
    ...toStringList(isRecord(record.cuisine_type) ? [record.cuisine_type] : []),
    firstString(
      [
        record.category_id,
        record.categoryId,
        record.main_category_id,
        record.mainCategoryId,
        record.cuisine_id,
        record.cuisineId,
        record.cuisine_type_id,
        record.cuisineTypeId,
        isRecord(record.cuisine) ? record.cuisine.id : undefined,
        isRecord(record.cuisine) ? record.cuisine.slug : undefined,
        isRecord(record.cuisine_type) ? record.cuisine_type.id : undefined,
        isRecord(record.cuisine_type) ? record.cuisine_type.slug : undefined,
        isRecord(record.cuisine_type) ? record.cuisine_type.key : undefined,
      ],
      '',
    ),
    ...collectRestaurantItemCategoryTags(record),
  ])

  const rating = toNumber(record.rating ?? record.avg_rating ?? record.average_rating, 0)
  const reviewsCount = Math.max(
    0,
    Math.round(toNumber(record.reviews_count ?? record.review_count ?? record.total_reviews ?? record.ratings_count, 0)),
  )
  const ordersCount = Math.max(0, Math.round(toNumber(record.orders_count ?? record.total_orders ?? record.order_count, 0)))
  const deliveryTimeMin = Math.max(
    1,
    Math.round(
      toNumber(
        record.delivery_time_min ??
          record.min_delivery_time ??
          record.eta_min ??
          record.delivery_min ??
          record.delivery_time ??
          record.deliveryTime,
        20,
      ),
    ),
  )
  const deliveryTimeMax = Math.max(
    deliveryTimeMin,
    Math.round(
      toNumber(
        record.delivery_time_max ??
          record.max_delivery_time ??
          record.eta_max ??
          record.delivery_max ??
          record.delivery_time ??
          record.deliveryTime,
        deliveryTimeMin + 20,
      ),
    ),
  )
  const minimumOrderValue = toNumber(record.minimum_order ?? record.minimumOrder ?? record.min_order, Number.NaN)

  const isOpen = toBoolean(record.is_open ?? record.open ?? record.isOpen ?? record.status, true)
  const stateId = optionalString([
    record.state_id,
    record.stateId,
    stateValue?.id,
  ])
  const city = pickOptionalLocalizedString(
    [record.city_name_ar, record.cityAr, cityValue?.name_ar, cityValue?.nameAr, locationValue?.city_name_ar],
    [
      record.city_name_en,
      record.cityEn,
      cityValue?.name_en,
      cityValue?.nameEn,
      locationValue?.city_name_en,
      cityValue?.name,
      record.city,
      record.city_name,
      locationValue?.city,
      locationValue?.city_name,
      preferredBranch?.cityEn,
      preferredBranch?.city,
    ],
    [record.city, record.city_name, locationValue?.city, locationValue?.city_name, preferredBranch?.city],
  )
  const stateName = pickOptionalLocalizedString(
    [record.state_name_ar, record.stateAr, stateValue?.name_ar, stateValue?.nameAr, locationValue?.state_name_ar],
    [
      record.state_name_en,
      record.stateEn,
      stateValue?.name_en,
      stateValue?.nameEn,
      locationValue?.state_name_en,
      stateValue?.name,
      record.state_name,
      record.state,
      locationValue?.state,
      locationValue?.state_name,
      preferredBranch?.stateEn,
      preferredBranch?.state,
    ],
    [record.state_name, record.state, locationValue?.state, locationValue?.state_name, preferredBranch?.state],
  )
  const rawAddress = pickOptionalLocalizedString(
    [record.address_ar, record.addressAr, record.location_ar, record.full_address_ar, locationValue?.address_ar, preferredBranchRecord?.address_ar, preferredBranchRecord?.addressAr],
    [record.address_en, record.addressEn, locationValue?.address_en, preferredBranch?.addressEn, record.address, record.location, record.full_address, locationValue?.address, preferredBranch?.address],
    [record.address, record.location, record.full_address, locationValue?.address, preferredBranch?.address],
  )
  const composedAddress = [rawAddress, city, stateName].filter(Boolean).join(', ')
  const latitude = toNumber(
    record.latitude ??
      record.lat ??
      record.location_lat ??
      record.locationLatitude ??
      (coordinatesValue ? coordinatesValue.latitude ?? coordinatesValue.lat : undefined) ??
      (locationValue ? locationValue.latitude ?? locationValue.lat : undefined) ??
      preferredBranch?.latitude,
    Number.NaN,
  )
  const longitude = toNumber(
    record.longitude ??
      record.lng ??
      record.lon ??
      record.location_lng ??
      record.locationLongitude ??
      (coordinatesValue ? coordinatesValue.longitude ?? coordinatesValue.lng ?? coordinatesValue.lon : undefined) ??
      (locationValue ? locationValue.longitude ?? locationValue.lng ?? locationValue.lon : undefined) ??
      preferredBranch?.longitude,
    Number.NaN,
  )
  const mapUrl = optionalString([
    record.map_url,
    record.mapUrl,
    record.map_link,
    record.mapLink,
    record.google_map_url,
    record.google_maps_url,
    locationValue?.map_url,
    preferredBranch?.mapUrl,
  ])
  const descriptionAr = optionalString([record.description_ar, record.descriptionAr])
  const descriptionEn = optionalString([record.description_en, record.descriptionEn])
  const description = pickOptionalLocalizedString(
    [descriptionAr],
    [descriptionEn],
    [record.description, record.details, record.summary],
  )
  const addressAr = optionalString([record.address_ar, record.addressAr, preferredBranchRecord?.address_ar, preferredBranchRecord?.addressAr])
  const addressEn = optionalString([record.address_en, record.addressEn, locationValue?.address_en, preferredBranch?.addressEn])

  if (API_LOG_ENABLED && detectUiLang() === 'en' && /[\u0600-\u06ff]/u.test(name)) {
    console.warn('[API LOCALIZATION WARNING][restaurant]', {
      restaurantId: id,
      resolvedName: name,
      providedNameEn: nameEn,
      providedNameAr: nameAr,
      fallbackName: firstString([record.name, record.restaurant_name, record.title], ''),
    })
  }

  return {
    id,
    name,
    nameAr,
    nameEn,
    description,
    descriptionAr,
    descriptionEn,
    logoUrl,
    coverUrl,
    phone: optionalString([
      record.phone,
      record.mobile,
      record.contact_phone,
      record.phone_number,
      record.whatsapp,
      preferredBranch?.phone,
    ]),
    email: optionalString([record.email, record.contact_email, record.contactEmail]),
    address: composedAddress || rawAddress,
    addressAr,
    addressEn,
    stateId,
    city,
    latitude: Number.isFinite(latitude) ? latitude : undefined,
    longitude: Number.isFinite(longitude) ? longitude : undefined,
    mapUrl: mapUrl || (Number.isFinite(latitude) && Number.isFinite(longitude) ? `https://www.google.com/maps?q=${latitude},${longitude}` : undefined),
    cuisine,
    cuisineAr: cuisineAr || undefined,
    cuisineEn: cuisineEn || undefined,
    tags,
    rating,
    reviewsCount,
    ordersCount,
    deliveryTimeMin,
    deliveryTimeMax,
    minimumOrder: Number.isFinite(minimumOrderValue) ? Math.max(0, minimumOrderValue) : undefined,
    openingHours: optionalString([record.opening_hours, record.openingHours]),
    closingHours: optionalString([record.closing_hours, record.closingHours]),
    isOpen,
  }
}

function normalizeBranch(raw: unknown, index = 0): RestaurantBranch {
  const record = isRecord(raw) ? raw : {}
  const locationValue = isRecord(record.location) ? record.location : null
  const coordinatesValue = isRecord(record.coordinates) ? record.coordinates : null
  const cityValue = isRecord(record.city) ? record.city : null
  const stateValue = isRecord(record.state) ? record.state : null
  const addressValue = isRecord(record.address) ? record.address : null
  const fullAddressValue = isRecord(record.full_address) ? record.full_address : null
  const nameValue = isRecord(record.name) ? record.name : null
  const branchNameValue = isRecord(record.branch_name) ? record.branch_name : null
  const titleValue = isRecord(record.title) ? record.title : null

  const cityAr = optionalString([
    record.city_name_ar,
    record.cityAr,
    cityValue?.name_ar,
    cityValue?.nameAr,
    cityValue?.ar,
    cityValue?.arabic,
    locationValue?.city_name_ar,
  ])
  const cityEn = optionalString([
    record.city_name_en,
    record.cityEn,
    cityValue?.name_en,
    cityValue?.nameEn,
    cityValue?.en,
    cityValue?.english,
    cityValue?.name,
    locationValue?.city_name_en,
  ])
  const city = pickOptionalLocalizedString(
    [cityAr],
    [cityEn],
    [record.city, record.city_name, cityValue?.value, locationValue?.city, locationValue?.city_name],
  )

  const stateAr = optionalString([
    record.state_name_ar,
    record.stateAr,
    stateValue?.name_ar,
    stateValue?.nameAr,
    stateValue?.ar,
    stateValue?.arabic,
    locationValue?.state_name_ar,
  ])
  const stateEn = optionalString([
    record.state_name_en,
    record.stateEn,
    stateValue?.name_en,
    stateValue?.nameEn,
    stateValue?.en,
    stateValue?.english,
    stateValue?.name,
    locationValue?.state_name_en,
  ])
  const state = pickOptionalLocalizedString(
    [stateAr],
    [stateEn],
    [record.state, record.state_name, stateValue?.value, locationValue?.state, locationValue?.state_name],
  )

  const addressAr = optionalString([
    record.address_ar,
    record.addressAr,
    record.full_address_ar,
    record.location_ar,
    locationValue?.address_ar,
    addressValue?.ar,
    addressValue?.arabic,
    addressValue?.name_ar,
    fullAddressValue?.ar,
    fullAddressValue?.arabic,
  ])
  const addressEn = optionalString([
    record.address_en,
    record.addressEn,
    record.full_address_en,
    record.location_en,
    locationValue?.address_en,
    addressValue?.en,
    addressValue?.english,
    addressValue?.name_en,
    addressValue?.value,
    fullAddressValue?.en,
    fullAddressValue?.english,
    fullAddressValue?.value,
  ])
  const rawAddress = pickOptionalLocalizedString(
    [addressAr],
    [addressEn],
    [record.address, record.full_address, record.location, record.street, locationValue?.address, addressValue?.value, fullAddressValue?.value],
  )
  const latitude = toNumber(
    record.latitude ??
      record.lat ??
      record.location_lat ??
      (coordinatesValue ? coordinatesValue.latitude ?? coordinatesValue.lat : undefined) ??
      (locationValue ? locationValue.latitude ?? locationValue.lat : undefined),
    Number.NaN,
  )
  const longitude = toNumber(
    record.longitude ??
      record.lng ??
      record.lon ??
      record.location_lng ??
      (coordinatesValue ? coordinatesValue.longitude ?? coordinatesValue.lng ?? coordinatesValue.lon : undefined) ??
      (locationValue ? locationValue.longitude ?? locationValue.lng ?? locationValue.lon : undefined),
    Number.NaN,
  )
  const mapUrl = optionalString([
    record.map_url,
    record.mapUrl,
    record.map_link,
    record.mapLink,
    record.google_map_url,
    record.google_maps_url,
    locationValue?.map_url,
  ])

  const nameAr = optionalString([
    record.name_ar,
    record.nameAr,
    record.branch_name_ar,
    record.branchNameAr,
    record.title_ar,
    record.titleAr,
    nameValue?.ar,
    nameValue?.arabic,
    nameValue?.name_ar,
    branchNameValue?.ar,
    branchNameValue?.arabic,
    branchNameValue?.name_ar,
    titleValue?.ar,
    titleValue?.arabic,
    titleValue?.title_ar,
  ])
  const nameEn = optionalString([
    record.name_en,
    record.nameEn,
    record.branch_name_en,
    record.branchNameEn,
    record.title_en,
    record.titleEn,
    nameValue?.en,
    nameValue?.english,
    nameValue?.name_en,
    branchNameValue?.en,
    branchNameValue?.english,
    branchNameValue?.name_en,
    titleValue?.en,
    titleValue?.english,
    titleValue?.title_en,
  ])
  const neutralName = firstString(
    [record.name, record.branch_name, record.title, nameValue?.value, branchNameValue?.value, titleValue?.value],
    '',
  )
  const name = pickLocalizedString([nameAr], [nameEn], [neutralName, rawAddress, city, state], '')

  const composedAddressAr = [addressAr, cityAr, stateAr].filter(Boolean).join(', ')
  const composedAddressEn = [addressEn, cityEn, stateEn].filter(Boolean).join(', ')
  const composedAddress = [rawAddress, city, state].filter(Boolean).join(', ')
  const address = pickLocalizedString(
    [composedAddressAr, addressAr],
    [composedAddressEn, addressEn],
    [composedAddress, rawAddress, city, state],
    firstString([composedAddress, rawAddress, city, state], ''),
  )

  const neighborhoods = uniqueStrings([
    ...toStringList(record.neighborhoods),
    ...toStringList(record.neighborhood),
    ...toStringList(record.neighbourhoods),
    ...toStringList(record.neighbourhood),
    ...toStringList(record.districts),
    ...toStringList(record.district),
    ...toStringList(record.areas),
    ...toStringList(record.area),
    ...toStringList(record.delivery_areas),
    ...toStringList(record.deliveryAreas),
    ...toStringList(record.coverage_areas),
    ...toStringList(record.coverageAreas),
  ])

  return {
    id: normalizeId(record.id ?? record.branch_id ?? record.uuid, `branch-${index + 1}`),
    restaurantId: optionalString([
      record.restaurant_id,
      record.restaurantId,
      isRecord(record.restaurant) ? record.restaurant.id : undefined,
      isRecord(record.restaurant) ? record.restaurant.restaurant_id : undefined,
    ]),
    name,
    nameAr,
    nameEn,
    address,
    addressAr: optionalString([composedAddressAr, addressAr]),
    addressEn: optionalString([composedAddressEn, addressEn]),
    phone: optionalString([record.phone, record.mobile, record.contact_phone, record.phone_number]),
    city,
    cityAr,
    cityEn,
    state,
    stateAr,
    stateEn,
    latitude: Number.isFinite(latitude) ? latitude : undefined,
    longitude: Number.isFinite(longitude) ? longitude : undefined,
    mapUrl: mapUrl || (Number.isFinite(latitude) && Number.isFinite(longitude) ? `https://www.google.com/maps?q=${latitude},${longitude}` : undefined),
    isOpen: toBoolean(record.is_open ?? record.open ?? record.status, true),
    neighborhoods: neighborhoods.length > 0 ? neighborhoods : undefined,
  }
}

function normalizeBranches(payload: unknown): RestaurantBranch[] {
  const root = unwrapData(payload)
  const rows = Array.isArray(root)
    ? root
    : extractArrayByKeysOnly(payload, BRANCH_ARRAY_KEYS)
  return rows.map((entry, idx) => normalizeBranch(entry, idx))
}

function isLikelyBranchRecord(payload: unknown): boolean {
  if (!isRecord(payload)) return false

  const indicators: unknown[] = [
    payload.id,
    payload.branch_id,
    payload.name,
    payload.branch_name,
    payload.address,
    payload.full_address,
    payload.city,
    payload.state,
    payload.latitude,
    payload.longitude,
    payload.phone,
    payload.mobile,
  ]

  return indicators.some((value) => {
    if (typeof value === 'string') return value.trim().length > 0
    if (typeof value === 'number') return Number.isFinite(value)
    return value !== null && value !== undefined
  })
}

function normalizeBranchResponse(payload: unknown): RestaurantBranch[] {
  const rows = normalizeBranches(payload)
  if (rows.length > 0) return rows

  const record = extractObject(payload)
  if (!isLikelyBranchRecord(record)) return []
  return [normalizeBranch(record)]
}

function normalizeCategory(raw: unknown, index = 0): Category {
  const record = isRecord(raw) ? raw : {}
  const nameAr = optionalString([record.name_ar, record.nameAr, record.title_ar, record.titleAr])
  const nameEn = optionalString([record.name_en, record.nameEn, record.title_en, record.titleEn, record.name, record.title])

  return {
    id: normalizeId(record.id ?? record.category_id ?? record.uuid, `category-${index + 1}`),
    name: pickLocalizedString([nameAr], [nameEn], [record.name, record.title], `Category ${index + 1}`),
    nameAr,
    nameEn,
    imageUrl: resolveAssetUrl(record.image ?? record.image_url ?? record.cover ?? record.icon, '/images/cat-pizza.jpg'),
    restaurantsCount: Math.max(0, Math.round(toNumber(record.restaurants_count ?? record.count ?? record.items_count, 0))),
  }
}

function normalizeCuisineType(raw: unknown, index = 0): CuisineType {
  const record = isRecord(raw) ? raw : {}
  const nameAr = optionalString([record.name_ar, record.nameAr, record.title_ar, record.titleAr])
  const nameEn = optionalString([
    record.name,
    record.title,
    record.label,
    record.name_en,
    record.nameEn,
    record.title_en,
    record.titleEn,
    record.label_en,
    record.labelEn,
  ])
  const labelAr = optionalString([
    record.name_ar,
    record.nameAr,
    record.title_ar,
    record.titleAr,
    record.label_ar,
    record.labelAr,
  ])
  const labelEn = optionalString([
    // API contract for English is usually `name`.
    record.name,
    record.title,
    record.label,
    record.name_en,
    record.nameEn,
    record.title_en,
    record.titleEn,
    record.label_en,
    record.labelEn,
  ])
  const label = pickLocalizedString([labelAr], [labelEn], [record.name, record.title, record.label], `Cuisine ${index + 1}`)
  const keySource = firstString([record.slug, record.key, record.id, record.cuisine_key, labelEn, label], '')
  const imageUrl = resolveAssetUrl(
    record.image_url ?? record.imageUrl ?? record.image ?? record.photo ?? record.cover ?? record.icon,
    '',
  )

  return {
    key: sanitizeCuisineKey(keySource, index),
    name: nameEn,
    nameAr,
    label,
    labelAr,
    labelEn,
    imageUrl: imageUrl || undefined,
  }
}

function normalizeUser(raw: unknown): User {
  const record = isRecord(raw) ? raw : {}

  const isLikelyEmail = (value: unknown): value is string => {
    if (typeof value !== 'string') return false
    const trimmed = value.trim()
    if (!trimmed) return false
    return /^[^\s@]+@[^\s@]+$/.test(trimmed)
  }

  const pickEmail = (...candidates: unknown[]): string => {
    for (const candidate of candidates) {
      if (isLikelyEmail(candidate)) {
        return candidate.trim()
      }
    }
    return ''
  }

  const fullName = firstString(
    [record.full_name, record.fullName, record.name, record.user_name, record.userName, record.display_name, record.displayName],
    'User',
  )
  const email = pickEmail(
    record.email,
    record.email_address,
    record.emailAddress,
    record.user_email,
    record.userEmail,
    record.login,
    record.username,
  )
  const phone = optionalString([
    record.phone,
    record.phone_number,
    record.phoneNumber,
    record.mobile,
    record.mobile_number,
    record.mobileNumber,
    record.contact_phone,
    record.contactPhone,
    record.whatsapp,
  ])

  return {
    id: normalizeId(record.id ?? record.user_id ?? record.userId ?? record.uuid, 'user'),
    fullName,
    email,
    phone,
  }
}

function normalizeReview(raw: unknown, restaurantIdFallback = '', index = 0): Review {
  const record = isRecord(raw) ? raw : {}
  const userValue = record.user

  const userName = firstString(
    [
      record.user_name,
      record.userName,
      isRecord(userValue) ? userValue.name : undefined,
      isRecord(userValue) ? userValue.full_name : undefined,
    ],
    'Customer',
  )

  return {
    id: normalizeId(record.id ?? record.review_id, `review-${index + 1}`),
    restaurantId: normalizeId(record.restaurant_id ?? record.restaurantId, restaurantIdFallback || 'restaurant'),
    userName,
    rating: Math.max(1, Math.min(5, Math.round(toNumber(record.rating, 5)))),
    comment: firstString([record.comment, record.body, record.text], ''),
    createdAt: firstString([record.created_at, record.createdAt, record.date], new Date().toISOString()),
  }
}

function normalizeAddress(raw: unknown, index = 0): Address {
  const record = isRecord(raw) ? raw : {}
  const restaurantValue = isRecord(record.restaurant) ? record.restaurant : null
  const stateValue = record.state
  const stateRecord = isRecord(stateValue) ? stateValue : null
  const cityValue = record.city
  const cityRecord = isRecord(cityValue) ? cityValue : null

  const stateId = optionalString([record.state_id, record.stateId, stateRecord?.id])
  const governorateAr = optionalString([
    record.governorate_ar,
    record.governorateAr,
    record.state_name_ar,
    record.stateNameAr,
    record.province_ar,
    record.provinceAr,
    stateRecord?.name_ar,
    stateRecord?.nameAr,
    stateRecord?.ar,
    stateRecord?.arabic,
  ])
  const governorateEn = optionalString([
    record.governorate_en,
    record.governorateEn,
    record.governorate,
    record.state_name_en,
    record.stateNameEn,
    record.state_name,
    record.province_en,
    record.provinceEn,
    record.province,
    stateRecord?.name_en,
    stateRecord?.nameEn,
    stateRecord?.en,
    stateRecord?.english,
    stateRecord?.name,
  ])
  const governorate = pickOptionalLocalizedString(
    [governorateAr],
    [governorateEn],
    [record.governorate, record.state_name, record.province, stateRecord?.name],
  )
  const governorateCode = optionalString([
    record.governorate_code,
    record.state_code,
    record.province_code,
    stateRecord?.code,
  ])
  const cityAr = optionalString([
    record.city_name_ar,
    record.cityNameAr,
    record.city_ar,
    record.cityAr,
    cityRecord?.name_ar,
    cityRecord?.nameAr,
    cityRecord?.ar,
    cityRecord?.arabic,
  ])
  const cityEn = optionalString([
    record.city_name_en,
    record.cityNameEn,
    record.city_en,
    record.cityEn,
    record.city_name,
    record.cityName,
    record.city,
    cityRecord?.name_en,
    cityRecord?.nameEn,
    cityRecord?.en,
    cityRecord?.english,
    cityRecord?.name,
  ])
  const city = pickOptionalLocalizedString(
    [cityAr],
    [cityEn],
    [record.city, record.city_name, record.cityName, cityRecord?.name, stateRecord?.name],
  )
  const restaurantId = optionalString([record.restaurant_id, record.restaurantId, restaurantValue?.id])
  const cityCode = optionalString([record.city_code, record.cityCode])
  const district = optionalString([record.district, record.area, record.neighborhood, record.neighbourhood])
  const street = optionalString([record.street, record.street_name, record.streetName])
  const buildingNo = optionalString([record.building_no, record.buildingNo, record.building, record.building_number, record.buildingNumber])
  const floor = optionalString([record.floor, record.floor_no, record.floorNo])
  const apartment = optionalString([record.apartment, record.apartment_no, record.apartmentNo, record.flat, record.unit])
  const landmark = optionalString([record.landmark, record.nearby, record.reference])
  const postalCode = optionalString([record.postal_code, record.postalCode, record.zip, record.zip_code, record.zipCode])
  const phone = optionalString([record.phone, record.contact_phone, record.mobile])
  const latitude = toNumber(record.latitude ?? record.lat ?? record.location_lat ?? record.locationLatitude, Number.NaN)
  const longitude = toNumber(record.longitude ?? record.lng ?? record.lon ?? record.location_lng ?? record.locationLongitude, Number.NaN)

  const detailsAr = optionalString([
    record.address_ar,
    record.addressAr,
    record.full_address_ar,
    record.fullAddressAr,
    record.details_ar,
    record.detailsAr,
  ])
  const detailsEn = optionalString([
    record.address_en,
    record.addressEn,
    record.full_address_en,
    record.fullAddressEn,
    record.details_en,
    record.detailsEn,
    record.address,
    record.full_address,
    record.details,
    record.street,
    record.location,
  ])
  const details = pickLocalizedString(
    [detailsAr],
    [detailsEn],
    [record.address, record.full_address, record.details, record.street, record.location],
    '',
  )
  const composedDetails = [governorate, city, district, street, buildingNo, floor, apartment, postalCode, landmark]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(detectUiLang() === 'ar' ? '، ' : ', ')

  const labelAr = optionalString([
    record.label_ar,
    record.labelAr,
    record.title_ar,
    record.titleAr,
    record.name_ar,
    record.nameAr,
    governorateAr,
    cityAr,
  ])
  const labelEn = optionalString([
    record.label_en,
    record.labelEn,
    record.title_en,
    record.titleEn,
    record.name_en,
    record.nameEn,
    record.label,
    record.title,
    record.name,
    governorateEn,
    cityEn,
    governorate,
    city,
  ])

  const label = pickLocalizedString(
    [labelAr],
    [labelEn],
    [record.label, record.title, record.name, governorate, city],
    details
      ? detectUiLang() === 'ar'
        ? 'عنوان'
        : 'Address'
      : detectUiLang() === 'ar'
        ? `عنوان ${index + 1}`
        : `Address ${index + 1}`,
  )

  return {
    id: normalizeId(record.id ?? record.address_id ?? record.uuid, `address-${index + 1}`),
    restaurantId,
    label,
    labelAr,
    labelEn,
    details: details || composedDetails || label,
    detailsAr,
    detailsEn,
    isDefault: toBoolean(record.is_default ?? record.isDefault ?? record.default, false),
    stateId,
    governorate,
    governorateAr,
    governorateEn,
    governorateCode,
    city,
    cityAr,
    cityEn,
    cityCode,
    district,
    street,
    buildingNo,
    floor,
    apartment,
    landmark,
    postalCode,
    phone,
    latitude: Number.isFinite(latitude) ? latitude : undefined,
    longitude: Number.isFinite(longitude) ? longitude : undefined,
  }
}

function normalizeCityWithNeighborhoods(raw: unknown, fallbackId = ''): CityWithNeighborhoods {
  const record = isRecord(raw) ? raw : {}
  const id = normalizeId(record.id ?? record.city_id ?? record.uuid, fallbackId || 'city')
  const name = pickLocalizedString(
    [record.name_ar, record.nameAr, record.city_name_ar, record.cityNameAr, record.title_ar, record.titleAr],
    [record.name_en, record.nameEn, record.city_name_en, record.cityNameEn, record.name, record.city_name, record.title],
    [record.name, record.city_name, record.title],
    id,
  )
  const neighborhoods = uniqueStrings([
    ...toStringList(record.neighborhoods),
    ...toStringList(record.neighborhood),
    ...toStringList(record.neighbourhoods),
    ...toStringList(record.neighbourhood),
    ...toStringList(record.districts),
    ...toStringList(record.district),
    ...toStringList(record.areas),
    ...toStringList(record.area),
    ...toStringList(record.delivery_areas),
    ...toStringList(record.deliveryAreas),
    ...toStringList(record.zones),
    ...toStringList(record.regions),
    ...toStringList(record.sub_areas),
    ...toStringList(record.subAreas),
  ])

  return {
    id,
    name,
    neighborhoods,
  }
}

function normalizeStateCity(raw: unknown, index = 0, fallbackId = ''): StateCityOption {
  const record = isRecord(raw) ? raw : {}
  const city = normalizeCityWithNeighborhoods(record, fallbackId || `city-${index + 1}`)
  const nameAr = optionalString([record.name_ar, record.nameAr, record.city_name_ar, record.cityNameAr])
  const nameEn = optionalString([
    record.name_en,
    record.nameEn,
    record.city_name_en,
    record.cityNameEn,
    record.name,
    record.city_name,
    record.title,
  ])
  const name = firstString([nameEn, city.name, nameAr], city.id || fallbackId || `city-${index + 1}`)

  return {
    id: city.id,
    name,
    nameAr,
    neighborhoods: city.neighborhoods,
  }
}

function normalizeState(raw: unknown, index = 0): StateOption {
  const record = isRecord(raw) ? raw : {}
  const pivotValue = isRecord(record.pivot) ? record.pivot : null
  const id = normalizeId(record.id ?? record.state_id ?? record.uuid, `state-${index + 1}`)
  const stateNameAr = optionalString([record.name_ar, record.nameAr, record.state_name_ar, record.stateNameAr])
  const stateNameEn = optionalString([record.name_en, record.nameEn, record.state_name_en, record.stateNameEn, record.name, record.state_name, record.title])
  const stateName = firstString([stateNameEn, record.name, record.state_name, record.title, stateNameAr], `State ${index + 1}`)
  const code = optionalString([record.code, record.state_code, record.slug])
  const deliveryPriceValue = toNumber(
    record.delivery_price ??
      record.deliveryPrice ??
      record.fee ??
      record.delivery_fee ??
      record.shipping_fee ??
      pivotValue?.delivery_price ??
      pivotValue?.deliveryPrice,
    Number.NaN,
  )
  const deliveryPrice = Number.isFinite(deliveryPriceValue) ? Math.max(0, deliveryPriceValue) : undefined

  const citiesRaw = extractArray(record, ['cities', 'city_list', 'items'])
  const cities =
    citiesRaw.length > 0
      ? citiesRaw.map((entry, cityIndex) => normalizeStateCity(entry, cityIndex, `${id}-city-${cityIndex + 1}`))
      : []

  return {
    id,
    name: stateName,
    nameAr: stateNameAr,
    code,
    deliveryPrice,
    cities,
  }
}

function normalizeStates(payload: unknown): StateOption[] {
  const rows = extractArray(payload, ['states', 'items', 'data'])
  if (rows.length > 0) return rows.map((entry, idx) => normalizeState(entry, idx))
  if (hasExtractableArray(payload, ['states', 'items', 'data'])) return []

  const record = extractObject(payload)
  if (Object.keys(record).length === 0) return []
  return [normalizeState(record, 0)]
}

function normalizeCities(payload: unknown): StateCityOption[] {
  const rows = extractArray(payload, ['cities', 'items', 'data'])
  if (rows.length > 0) {
    return rows.map((entry, idx) => normalizeStateCity(entry, idx, `city-${idx + 1}`))
  }
  if (hasExtractableArray(payload, ['cities', 'items', 'data'])) return []

  const record = extractObject(payload)
  if (Object.keys(record).length === 0) return []
  return [normalizeStateCity(record, 0, 'city-1')]
}

function uniqueStateCityOptions(cities: StateCityOption[]): StateCityOption[] {
  const map = new Map<string, StateCityOption>()
  const normalizeLookup = (value: string): string => value.trim().toLowerCase()

  for (const city of cities) {
    const idKey = normalizeLookup(city.id)
    const nameKey = normalizeLookup(city.name)
    const nameArKey = normalizeLookup(city.nameAr ?? '')
    const key = idKey || `${nameKey}|${nameArKey}`
    if (!key) continue

    const existing = map.get(key)
    if (!existing) {
      map.set(key, {
        id: city.id,
        name: city.name,
        nameAr: city.nameAr,
        neighborhoods: city.neighborhoods ?? [],
      })
      continue
    }

    map.set(key, {
      id: existing.id || city.id,
      name: existing.name || city.name,
      nameAr: existing.nameAr || city.nameAr,
      neighborhoods: uniqueStrings([...(existing.neighborhoods ?? []), ...(city.neighborhoods ?? [])]),
    })
  }

  return Array.from(map.values())
}

type RestaurantStateAreaRow = {
  id: string
  name: string
  nameAr?: string
  deliveryPrice?: number
  cityId?: string
  cityName?: string
  cityNameAr?: string
}

function normalizeRestaurantStateAreaRow(raw: unknown, index = 0): RestaurantStateAreaRow | null {
  const record = isRecord(raw) ? raw : {}
  const stateValue = isRecord(record.state) ? record.state : null
  const cityValue = isRecord(record.city) ? record.city : null
  const locationValue = isRecord(record.location) ? record.location : null
  const pivotValue = isRecord(record.pivot) ? record.pivot : null

  const nameAr = optionalString([
    record.name_ar,
    record.nameAr,
    record.state_name_ar,
    record.stateNameAr,
    stateValue?.name_ar,
    stateValue?.nameAr,
  ])
  const nameEn = optionalString([
    record.name_en,
    record.nameEn,
    record.name,
    record.state_name_en,
    record.stateNameEn,
    record.state_name,
    record.stateName,
    record.title,
    stateValue?.name_en,
    stateValue?.nameEn,
    stateValue?.name,
  ])
  const name = firstString([nameEn, record.name, record.state_name, record.title, stateValue?.name, nameAr], '')
  if (!name) return null

  const cityId = optionalString([
    record.city_id,
    record.cityId,
    cityValue?.id,
    locationValue?.city_id,
    locationValue?.cityId,
  ])
  const cityNameAr = optionalString([
    record.city_name_ar,
    record.cityNameAr,
    cityValue?.name_ar,
    cityValue?.nameAr,
    locationValue?.city_name_ar,
    locationValue?.cityNameAr,
  ])
  const cityName = optionalString([
    record.city_name_en,
    record.cityNameEn,
    record.city_name,
    record.cityName,
    record.city,
    cityValue?.name_en,
    cityValue?.nameEn,
    cityValue?.name,
    locationValue?.city_name_en,
    locationValue?.cityNameEn,
    locationValue?.city_name,
    locationValue?.cityName,
    locationValue?.city,
  ])
  const deliveryPriceValue = toNumber(
    record.delivery_price ??
      record.deliveryPrice ??
      record.fee ??
      record.delivery_fee ??
      record.shipping_fee ??
      pivotValue?.delivery_price ??
      pivotValue?.deliveryPrice,
    Number.NaN,
  )
  const deliveryPrice = Number.isFinite(deliveryPriceValue) ? Math.max(0, deliveryPriceValue) : undefined

  return {
    id: normalizeId(record.id ?? record.state_id ?? record.uuid, `state-area-${index + 1}`),
    name,
    nameAr,
    deliveryPrice,
    cityId,
    cityName,
    cityNameAr,
  }
}

function resolveRestaurantAreaCityKey(area: RestaurantStateAreaRow, index: number): string {
  if (area.cityId?.trim()) return `id:${area.cityId.trim()}`

  const nameCandidate = firstString([area.cityName, area.cityNameAr], '')
  if (nameCandidate) {
    return `name:${nameCandidate.trim().toLowerCase().replace(/\s+/g, ' ')}`
  }

  return `fallback:${index + 1}`
}

async function normalizeRestaurantStatesPayload(payload: unknown): Promise<StateOption[]> {
  const rows = extractArray(payload, ['states', 'items', 'data'])
  if (rows.length === 0) {
    if (hasExtractableArray(payload, ['states', 'items', 'data'])) return []
    return normalizeStates(payload)
  }

  const hasNestedCities = rows.some(
    (entry) => extractArrayByKeysOnly(entry, ['cities', 'city_list', 'state_cities', 'items']).length > 0,
  )
  const hasRestaurantAreaShape =
    !hasNestedCities &&
    rows.some((entry) => {
      if (!isRecord(entry)) return false
      return (
        entry.city_id !== undefined ||
        entry.cityId !== undefined ||
        isRecord(entry.city) ||
        entry.delivery_price !== undefined ||
        isRecord(entry.pivot)
      )
    })

  if (!hasRestaurantAreaShape) return rows.map((entry, idx) => normalizeState(entry, idx))

  const areas = rows
    .map((entry, index) => normalizeRestaurantStateAreaRow(entry, index))
    .filter((entry): entry is RestaurantStateAreaRow => entry !== null)

  if (!areas.length) return rows.map((entry, idx) => normalizeState(entry, idx))

  const cityMetaByKey = new Map<string, { id?: string; name?: string; nameAr?: string }>()
  areas.forEach((area, index) => {
    const key = resolveRestaurantAreaCityKey(area, index)
    const current = cityMetaByKey.get(key) ?? {}
    cityMetaByKey.set(key, {
      id: current.id ?? area.cityId,
      name: current.name ?? area.cityName,
      nameAr: current.nameAr ?? area.cityNameAr,
    })
  })

  const cityIdsToHydrate = uniqueStrings(
    Array.from(cityMetaByKey.values())
      .map((meta) => {
        if (!meta.id) return ''
        const hasName = Boolean(firstString([meta.name, meta.nameAr], ''))
        return hasName ? '' : meta.id
      })
      .filter(Boolean),
  )

  if (cityIdsToHydrate.length > 0) {
    const hydratedCities = await Promise.all(
      cityIdsToHydrate.map(async (cityId) => {
        const city = await getCityByIdLive(cityId).catch(() => null)
        return { cityId, city }
      }),
    )

    for (const { cityId, city } of hydratedCities) {
      if (!city) continue
      const hydratedCityName = city.name.trim()
      const hydratedLooksArabic = /[\u0600-\u06ff]/u.test(hydratedCityName)
      for (const [key, meta] of cityMetaByKey.entries()) {
        if (meta.id !== cityId) continue
        cityMetaByKey.set(key, {
          id: meta.id,
          name: meta.name || hydratedCityName,
          nameAr: meta.nameAr || (hydratedLooksArabic ? hydratedCityName : undefined),
        })
      }
    }
  }

  const statesById = new Map<
    string,
    {
      id: string
      name: string
      nameAr?: string
      code?: string
      deliveryPrice?: number
      cities: Map<string, { id: string; name: string; nameAr?: string; neighborhoods: Set<string> }>
    }
  >()

  areas.forEach((area, index) => {
    const key = resolveRestaurantAreaCityKey(area, index)
    const cityMeta = cityMetaByKey.get(key)
    const cityId = firstString([cityMeta?.id, area.cityId], '')
    const cityNameAr = optionalString([cityMeta?.nameAr, area.cityNameAr])
    const cityName = firstString(
      [cityMeta?.name, area.cityName, cityNameAr, area.cityNameAr],
      cityId ? `City ${cityId}` : `City ${index + 1}`,
    )

    const stateId = area.id.trim() || `state-area-${index + 1}`
    const stateName = firstString([area.name, area.nameAr], `State ${index + 1}`)

    if (!statesById.has(stateId)) {
      statesById.set(stateId, {
        id: stateId,
        name: stateName,
        nameAr: area.nameAr,
        code: stateId,
        deliveryPrice: area.deliveryPrice,
        cities: new Map(),
      })
    }

    const stateEntry = statesById.get(stateId)
    if (!stateEntry) return
    if (stateEntry.deliveryPrice === undefined && area.deliveryPrice !== undefined) {
      stateEntry.deliveryPrice = area.deliveryPrice
    }

    const cityKey = cityId || key
    if (!stateEntry.cities.has(cityKey)) {
      stateEntry.cities.set(cityKey, {
        id: cityId || `restaurant-city-${stateEntry.cities.size + 1}`,
        name: cityName,
        nameAr: cityNameAr,
        neighborhoods: new Set<string>(),
      })
    }

    const cityEntry = stateEntry.cities.get(cityKey)
    if (!cityEntry) return

    const neighborhood =
      detectUiLang() === 'ar' ? firstString([area.nameAr, area.name], '') : firstString([area.name, area.nameAr], '')
    if (neighborhood) cityEntry.neighborhoods.add(neighborhood)
  })

  const normalizedAreaStates = Array.from(statesById.values()).map((state) => ({
    id: state.id,
    name: state.name,
    nameAr: state.nameAr,
    code: state.code,
    deliveryPrice: state.deliveryPrice,
    cities: Array.from(state.cities.values()).map((city) => ({
      id: city.id,
      name: city.name,
      nameAr: city.nameAr,
      neighborhoods: Array.from(city.neighborhoods),
    })),
  }))

  if (normalizedAreaStates.length > 0) return normalizedAreaStates

  return rows.map((entry, idx) => normalizeState(entry, idx))
}

function normalizeMenuOption(raw: unknown, fallbackPrefix: string, index = 0): MenuOption {
  const record = isRecord(raw) ? raw : {}
  const id = normalizeId(record.option_id ?? record.id ?? record.value, `${fallbackPrefix}-${index + 1}`)
  const labelAr = optionalString([record.label_ar, record.labelAr, record.name_ar, record.nameAr, record.title_ar, record.titleAr])
  const labelEn = optionalString([record.label_en, record.labelEn, record.name_en, record.nameEn, record.title_en, record.titleEn, record.label, record.name, record.title, record.value])
  const label = pickLocalizedString([labelAr], [labelEn], [record.label, record.name, record.title, record.value], `Option ${index + 1}`)

  return {
    id,
    label,
    labelAr,
    labelEn,
    price: Math.max(0, toNumber(record.price ?? record.extra_price ?? record.amount, 0)),
  }
}

function isOptionActive(raw: unknown): boolean {
  if (!isRecord(raw)) return true
  if ('is_active' in raw || 'active' in raw) {
    return toBoolean(raw.is_active ?? raw.active, true)
  }
  return true
}

function normalizeMenuCategory(raw: unknown, index = 0): MenuCategory {
  const record = isRecord(raw) ? raw : {}
  const categoryValue = record.category
  const nameAr = normalizeMenuCategoryLabel(
    firstString([record.name_ar, record.nameAr, isRecord(categoryValue) ? categoryValue.name_ar : undefined], ''),
  )
  const nameEn = normalizeMenuCategoryLabel(
    firstString(
      [
        record.name_en,
        record.nameEn,
        record.title_en,
        record.titleEn,
        isRecord(categoryValue) ? categoryValue.name_en : undefined,
        isRecord(categoryValue) ? categoryValue.name : undefined,
      ],
      '',
    ),
  )
  const preferredName = detectUiLang() === 'ar' ? nameAr || nameEn : nameEn || nameAr
  const name = normalizeMenuCategoryLabel(
    firstString(
      [
        preferredName,
        record.name,
        record.name_ar,
        record.title,
        record.category,
        isRecord(categoryValue) ? categoryValue.name : undefined,
        isRecord(categoryValue) ? categoryValue.name_ar : undefined,
      ],
      `Category ${index + 1}`,
    ),
  )

  return {
    id: normalizeId(
      record.id ?? record.category_id ?? record.section_id ?? (isRecord(categoryValue) ? categoryValue.id : undefined),
      `menu-category-${index + 1}`,
    ),
    name: name || `Category ${index + 1}`,
    nameAr: nameAr || undefined,
    nameEn: nameEn || undefined,
    imageUrl: resolveAssetUrl(record.image ?? record.image_url ?? record.icon, '/images/cat-pizza.jpg'),
  }
}

function parseOptionalTimestamp(value: string | undefined): number | null {
  const raw = (value ?? '').trim()
  if (!raw) return null

  const parsed = Date.parse(raw)
  return Number.isFinite(parsed) ? parsed : null
}

function isDiscountWindowActive(discountStart: string | undefined, discountEnd: string | undefined): boolean {
  const now = Date.now()
  const startTimestamp = parseOptionalTimestamp(discountStart)
  const endTimestamp = parseOptionalTimestamp(discountEnd)

  if (startTimestamp !== null && now < startTimestamp) return false
  if (endTimestamp !== null && now > endTimestamp) return false
  return true
}

function resolveExplicitSaleFlag(...values: unknown[]): boolean | null {
  for (const value of values) {
    if (value === undefined || value === null) continue
    return toBoolean(value, false)
  }
  return null
}

function resolveDiscountedUnitPrice(input: {
  basePrice: number
  salePrice: number
  currentPrice: number
  discountPercentage: number
  saleFlag: boolean | null
  discountStart?: string
  discountEnd?: string
}): { price: number; oldPrice?: number } {
  const basePrice = Number.isFinite(input.basePrice) ? Math.max(0, input.basePrice) : 0
  const salePrice = Number.isFinite(input.salePrice) ? Math.max(0, input.salePrice) : Number.NaN
  const currentPrice = Number.isFinite(input.currentPrice) ? Math.max(0, input.currentPrice) : Number.NaN
  const discountPercentage = Number.isFinite(input.discountPercentage) ? Math.max(0, input.discountPercentage) : Number.NaN

  const percentagePrice =
    Number.isFinite(discountPercentage) &&
    discountPercentage > 0 &&
    basePrice > 0 &&
    input.saleFlag !== false &&
    isDiscountWindowActive(input.discountStart, input.discountEnd)
      ? Math.max(0, Number((basePrice * (1 - Math.min(100, discountPercentage) / 100)).toFixed(2)))
      : Number.NaN

  const fallbackBasePrice =
    basePrice ||
    (Number.isFinite(currentPrice)
      ? Math.max(0, currentPrice)
      : Number.isFinite(salePrice)
        ? Math.max(0, salePrice)
        : 0)

  if (input.saleFlag === false) {
    return {
      price: fallbackBasePrice,
      oldPrice: undefined,
    }
  }

  const discountCandidates = [salePrice, currentPrice, percentagePrice].filter(
    (value) => Number.isFinite(value) && value >= 0,
  )
  const discountCandidatesUnderBase = basePrice > 0
    ? discountCandidates.filter((value) => value < basePrice)
    : discountCandidates
  const chosenCurrentPrice = discountCandidates.length
    ? discountCandidatesUnderBase.length
      ? Math.min(...discountCandidatesUnderBase)
      : Number.NaN
    : Number.NaN
  const hasDiscountPrice = Number.isFinite(chosenCurrentPrice)
  const hasDiscount = input.saleFlag === true ? hasDiscountPrice : hasDiscountPrice

  const price =
    hasDiscount && Number.isFinite(chosenCurrentPrice)
      ? Math.max(0, chosenCurrentPrice)
      : fallbackBasePrice

  return {
    price,
    oldPrice: hasDiscount && basePrice > price ? basePrice : undefined,
  }
}

function applyVatToDisplayPrice(input: {
  price: number
  oldPrice?: number
  vatPercentage: number
  vatIncluded?: boolean
}): { price: number; oldPrice?: number } {
  if (input.vatIncluded !== false) {
    return { price: input.price, oldPrice: input.oldPrice }
  }

  if (!Number.isFinite(input.vatPercentage) || input.vatPercentage <= 0) {
    return { price: input.price, oldPrice: input.oldPrice }
  }

  const multiplier = 1 + Math.max(0, input.vatPercentage) / 100
  const priceWithVat = Number((Math.max(0, input.price) * multiplier).toFixed(3))
  const oldPriceWithVat =
    typeof input.oldPrice === 'number' && input.oldPrice > input.price
      ? Number((Math.max(0, input.oldPrice) * multiplier).toFixed(3))
      : input.oldPrice

  return {
    price: priceWithVat,
    oldPrice:
      typeof oldPriceWithVat === 'number' && oldPriceWithVat > priceWithVat
        ? oldPriceWithVat
        : undefined,
  }
}

function normalizeMenuItem(raw: unknown, restaurantId: string, fallbackCategoryId: string, index = 0): MenuItem {
  const record = isRecord(raw) ? raw : {}
  const categoryValue = record.category

  const categoryId = normalizeId(
    record.category_id ?? record.section_id ?? (isRecord(categoryValue) ? categoryValue.id : undefined),
    fallbackCategoryId,
  )

  const sizesRaw = Array.isArray(record.sizes)
    ? record.sizes
    : Array.isArray(record.size_options)
      ? record.size_options
      : Array.isArray(record.variants)
        ? record.variants
        : []

  const addonsRaw = Array.isArray(record.addons)
    ? record.addons
    : Array.isArray(record.extras)
      ? record.extras
      : Array.isArray(record.toppings)
        ? record.toppings
        : []

  const sizes = sizesRaw.map((entry, sizeIndex) => normalizeMenuOption(entry, `${categoryId}-size`, sizeIndex))
  const addons = addonsRaw
    .filter((entry) => isOptionActive(entry))
    .map((entry, addonIndex) => normalizeMenuOption(entry, `${categoryId}-addon`, addonIndex))

  const discountStart = optionalString([record.discount_start, record.discountStart])
  const discountEnd = optionalString([record.discount_end, record.discountEnd])
  const discountPercentage = toNumber(record.discount_percentage, Number.NaN)
  const basePrice = Math.max(0, toNumber(record.price ?? record.base_price ?? record.original_price ?? record.old_price, 0))
  const salePrice = toNumber(record.discount_price ?? record.sale_price, Number.NaN)
  const currentPrice = toNumber(record.current_price ?? record.final_price, Number.NaN)
  const saleFlag = resolveExplicitSaleFlag(record.is_on_sale, record.on_sale, record.isOnSale, record.onSale)
  const resolvedDiscountedPrice = resolveDiscountedUnitPrice({
    basePrice,
    salePrice,
    currentPrice,
    discountPercentage,
    saleFlag,
    discountStart,
    discountEnd,
  })

  const explicitOldPrice = toNumber(record.old_price ?? record.original_price, Number.NaN)
  const oldPrice =
    saleFlag !== false && Number.isFinite(explicitOldPrice) && explicitOldPrice > resolvedDiscountedPrice.price
      ? explicitOldPrice
      : resolvedDiscountedPrice.oldPrice
  const availabilityValue = record.is_available ?? record.available ?? record.in_stock
  const vatIncludedValue = record.vat_included ?? record.vatIncluded
  const vatIncluded = vatIncludedValue === undefined ? undefined : toBoolean(vatIncludedValue, false)
  const vatPercentage = toNumber(record.vat_percentage ?? record.vat, Number.NaN)
  const vatAdjustedPricing = applyVatToDisplayPrice({
    price: resolvedDiscountedPrice.price,
    oldPrice,
    vatPercentage,
    vatIncluded,
  })
  const nameAr = optionalString([record.name_ar, record.nameAr, record.title_ar, record.titleAr])
  const nameEn = optionalString([record.name_en, record.nameEn, record.title_en, record.titleEn, record.name, record.title])
  const descriptionAr = optionalString([record.description_ar, record.descriptionAr])
  const descriptionEn = optionalString([
    record.description_en,
    record.descriptionEn,
    record.description,
    record.details,
    record.summary,
  ])

  return {
    id: normalizeId(record.menu_item_id ?? record.id ?? record.product_id, `${restaurantId}-menu-item-${index + 1}`),
    restaurantId,
    categoryId,
    name: pickLocalizedString([nameAr], [nameEn], [record.name, record.title], `Item ${index + 1}`),
    nameAr,
    nameEn,
    description: pickLocalizedString([descriptionAr], [descriptionEn], [record.description, record.details, record.summary], ''),
    descriptionAr,
    descriptionEn,
    price: vatAdjustedPricing.price,
    oldPrice: vatAdjustedPricing.oldPrice,
    isOnSale:
      saleFlag === null
        ? typeof oldPrice === 'number' && oldPrice > resolvedDiscountedPrice.price
        : saleFlag,
    imageUrl: resolveAssetUrl(record.image ?? record.image_url ?? record.photo, '/images/dish-1.jpg'),
    isAvailable: availabilityValue === undefined ? undefined : toBoolean(availabilityValue, true),
    vatPercentage: Number.isFinite(vatPercentage) ? Math.max(0, vatPercentage) : undefined,
    vatIncluded,
    discountPercentage: Number.isFinite(discountPercentage) ? Math.max(0, discountPercentage) : undefined,
    discountStart,
    discountEnd,
    sizes: sizes.length ? sizes : undefined,
    addons: addons.length ? addons : undefined,
  }
}

function normalizeMenuPayload(payload: unknown, restaurantId: string): RestaurantMenuData {
  const uiLang = detectUiLang()
  const source = unwrapData(payload)
  const sourceArray = Array.isArray(source) ? source : null
  const groupedCategoryKeys = ['categories', 'menu_categories', 'sections']
  const directItemKeys = ['items', 'menu_items', 'products']
  const arrayLooksGrouped =
    sourceArray?.some(
      (entry) =>
        isRecord(entry) &&
        (Array.isArray(entry.items) || Array.isArray(entry.menu_items) || Array.isArray(entry.products)),
    ) ?? false

  const categoriesRaw =
    sourceArray && arrayLooksGrouped
      ? sourceArray
      : extractArrayByKeysOnly(source, groupedCategoryKeys)
  const directItems =
    sourceArray
      ? arrayLooksGrouped
        ? []
        : sourceArray
      : extractArrayByKeysOnly(source, directItemKeys)

  const nestedItems: unknown[] = []
  const nestedCategoryNames = new Map<string, string>()
  const nestedCategoryNamesAr = new Map<string, string>()
  const nestedCategoryNamesEn = new Map<string, string>()
  for (let categoryIndex = 0; categoryIndex < categoriesRaw.length; categoryIndex += 1) {
    const categoryEntry = categoriesRaw[categoryIndex]
    if (!isRecord(categoryEntry)) continue
    const categoryValue = categoryEntry.category
    const categoryNameAr = normalizeMenuCategoryLabel(
      firstString(
        [
          categoryEntry.name_ar,
          categoryEntry.nameAr,
          isRecord(categoryValue) ? categoryValue.name_ar : undefined,
        ],
        '',
      ),
    )
    const categoryNameEn = normalizeMenuCategoryLabel(
      firstString(
        [
          categoryEntry.name_en,
          categoryEntry.nameEn,
          categoryEntry.title_en,
          categoryEntry.titleEn,
          isRecord(categoryValue) ? categoryValue.name_en : undefined,
          isRecord(categoryValue) ? categoryValue.name : undefined,
        ],
        '',
      ),
    )
    const preferredCategoryName = uiLang === 'ar' ? categoryNameAr || categoryNameEn : categoryNameEn || categoryNameAr
    const categoryName = normalizeMenuCategoryLabel(
      firstString(
        [
          preferredCategoryName,
          categoryEntry.name,
          categoryEntry.title,
          categoryEntry.category,
          isRecord(categoryValue) ? categoryValue.name : undefined,
          isRecord(categoryValue) ? categoryValue.name_ar : undefined,
        ],
        'Menu',
      ),
    )
    const itemRows = extractArray(categoryEntry, ['items', 'menu_items', 'products'])
    const firstItem = itemRows.find((entry) => isRecord(entry))
    const firstItemCategoryValue = isRecord(firstItem) ? firstItem.category : undefined
    const inferredCategoryId = isRecord(firstItem)
      ? firstItem.category_id ??
        firstItem.section_id ??
        (isRecord(firstItemCategoryValue) ? firstItemCategoryValue.id : undefined)
      : undefined
    const categoryId = normalizeId(
      categoryEntry.id ??
        categoryEntry.category_id ??
        categoryEntry.section_id ??
        (isRecord(categoryValue) ? categoryValue.id : undefined) ??
        inferredCategoryId,
      categoryName === 'Menu' ? 'general' : `menu-category-${sanitizeCuisineKey(categoryName, categoryIndex)}`,
    )
    nestedCategoryNames.set(categoryId, categoryName)
    if (categoryNameAr) nestedCategoryNamesAr.set(categoryId, categoryNameAr)
    if (categoryNameEn) nestedCategoryNamesEn.set(categoryId, categoryNameEn)

    for (const item of itemRows) {
      if (isRecord(item)) {
        nestedItems.push({
          ...item,
          category_id: item.category_id ?? categoryId,
          category_name: item.category_name ?? categoryName,
          category_name_ar: item.category_name_ar ?? categoryNameAr,
          category_name_en: item.category_name_en ?? categoryNameEn,
        })
      } else {
        nestedItems.push(item)
      }
    }
  }

  const itemRows = directItems.length
    ? directItems
    : nestedItems.length
      ? nestedItems
      : Array.isArray(source)
        ? source
        : []

  const categoryNames = new Map<string, string>()
  const categoryNamesAr = new Map<string, string>()
  const categoryNamesEn = new Map<string, string>()
  const categoryImages = new Map<string, string>()
  const categories = arrayLooksGrouped ? [] : categoriesRaw.map((entry, idx) => normalizeMenuCategory(entry, idx))
  for (const category of categories) {
    categoryNames.set(category.id, normalizeMenuCategoryLabel(category.name))
    if (typeof category.nameAr === 'string' && category.nameAr.trim()) {
      categoryNamesAr.set(category.id, normalizeMenuCategoryLabel(category.nameAr))
    }
    if (typeof category.nameEn === 'string' && category.nameEn.trim()) {
      categoryNamesEn.set(category.id, normalizeMenuCategoryLabel(category.nameEn))
    }
    categoryImages.set(category.id, category.imageUrl)
  }

  for (const [id, name] of nestedCategoryNames.entries()) {
    if (!categoryNames.has(id)) categoryNames.set(id, normalizeMenuCategoryLabel(name))
  }
  for (const [id, name] of nestedCategoryNamesAr.entries()) {
    if (!categoryNamesAr.has(id)) categoryNamesAr.set(id, normalizeMenuCategoryLabel(name))
  }
  for (const [id, name] of nestedCategoryNamesEn.entries()) {
    if (!categoryNamesEn.has(id)) categoryNamesEn.set(id, normalizeMenuCategoryLabel(name))
  }

  const items = itemRows.map((entry, idx) => {
    if (!isRecord(entry)) return normalizeMenuItem(entry, restaurantId, 'general', idx)

    const categoryValue = entry.category
    const categoryId = normalizeId(
      entry.category_id ?? entry.section_id ?? (isRecord(categoryValue) ? categoryValue.id : undefined),
      'general',
    )
    const categoryNameAr = normalizeMenuCategoryLabel(
      firstString(
        [
          entry.category_name_ar,
          isRecord(categoryValue) ? categoryValue.name_ar : undefined,
          categoryNamesAr.get(categoryId),
        ],
        '',
      ),
    )
    const categoryNameEn = normalizeMenuCategoryLabel(
      firstString(
        [
          entry.category_name_en,
          isRecord(categoryValue) ? categoryValue.name_en : undefined,
          isRecord(categoryValue) ? categoryValue.name : undefined,
          categoryNamesEn.get(categoryId),
        ],
        '',
      ),
    )
    const preferredCategoryName = uiLang === 'ar' ? categoryNameAr || categoryNameEn : categoryNameEn || categoryNameAr
    const categoryName = normalizeMenuCategoryLabel(
      firstString(
        [
          preferredCategoryName,
          entry.category_name,
          isRecord(categoryValue) ? categoryValue.name : undefined,
          categoryNames.get(categoryId),
        ],
        categoryId === 'general' ? 'Menu' : `Category ${categoryId}`,
      ),
    )

    categoryNames.set(categoryId, categoryName)
    if (categoryNameAr) categoryNamesAr.set(categoryId, categoryNameAr)
    if (categoryNameEn) categoryNamesEn.set(categoryId, categoryNameEn)
    if (isRecord(categoryValue)) {
      const categoryImage = resolveAssetUrl(categoryValue.image ?? categoryValue.image_url, '')
      if (categoryImage) categoryImages.set(categoryId, categoryImage)
    }
    return normalizeMenuItem(entry, restaurantId, categoryId, idx)
  })

  const derivedCategoryIds = new Set<string>([
    ...categoryNames.keys(),
    ...categoryNamesAr.keys(),
    ...categoryNamesEn.keys(),
    ...categoryImages.keys(),
  ])
  const derivedCategories =
    categories.length > 0
      ? categories
      : Array.from(derivedCategoryIds).map((id) => {
          const nameAr = categoryNamesAr.get(id)
          const nameEn = categoryNamesEn.get(id)
          const localizedName = uiLang === 'ar' ? nameAr || nameEn : nameEn || nameAr
          const fallbackName = categoryNames.get(id) || nameEn || nameAr || (id === 'general' ? 'Menu' : `Category ${id}`)

          return {
            id,
            name: normalizeMenuCategoryLabel(localizedName || fallbackName),
            nameAr,
            nameEn,
            imageUrl: categoryImages.get(id) || '/images/cat-pizza.jpg',
          }
        })

  const finalCategories =
    derivedCategories.length > 0
      ? derivedCategories
      : [
          {
            id: 'general',
            name: 'Menu',
            imageUrl: '/images/cat-pizza.jpg',
          },
        ]

  const categorySet = new Set(finalCategories.map((category) => category.id))
  const fallbackCategoryId = finalCategories[0].id

  const finalItems = items.map((item) =>
    categorySet.has(item.categoryId) ? item : { ...item, categoryId: fallbackCategoryId },
  )

  return {
    categories: finalCategories,
    items: finalItems,
  }
}

function resolveMenuCategoryLookupKeys(id: string): string[] {
  const normalized = id.trim()
  if (!normalized) return []

  const keys = new Set<string>([normalized])
  const trailingNumberMatch = normalized.match(/(\d+)$/)
  if (trailingNumberMatch) keys.add(trailingNumberMatch[1])
  return Array.from(keys)
}

async function enrichMenuCategoriesFromGlobalCategories(menu: RestaurantMenuData): Promise<RestaurantMenuData> {
  if (!menu.categories.length) return menu

  const uiLang = detectUiLang()
  const needsLocalizedNames = menu.categories.some((category) => {
    if (uiLang === 'ar') return !(typeof category.nameAr === 'string' && category.nameAr.trim())
    return !(typeof category.nameEn === 'string' && category.nameEn.trim())
  })
  if (!needsLocalizedNames) return menu

  let globalCategories: Category[] = []
  try {
    globalCategories = await getCategoriesLive()
  } catch {
    return menu
  }
  if (!globalCategories.length) return menu

  const byId = new Map<string, Category>()
  for (const category of globalCategories) {
    const key = normalizeId(category.id, '').trim()
    if (!key) continue
    byId.set(key, category)
  }

  const categories = menu.categories.map((category) => {
    const lookupKeys = resolveMenuCategoryLookupKeys(category.id)
    const matchedGlobalCategory = lookupKeys.map((key) => byId.get(key)).find(Boolean)
    if (!matchedGlobalCategory) return category

    const nameAr = (typeof category.nameAr === 'string' && category.nameAr.trim()) ? category.nameAr : matchedGlobalCategory.nameAr
    const nameEn = (typeof category.nameEn === 'string' && category.nameEn.trim()) ? category.nameEn : matchedGlobalCategory.name
    const localizedName = uiLang === 'ar' ? nameAr || nameEn : nameEn || nameAr

    return {
      ...category,
      name: normalizeMenuCategoryLabel(localizedName || category.name),
      nameAr,
      nameEn,
    }
  })

  return {
    ...menu,
    categories,
  }
}

function normalizeBrandFromRestaurant(restaurant: Restaurant): Brand {
  return {
    id: restaurant.id,
    name: restaurant.name,
    nameAr: restaurant.nameAr,
    nameEn: restaurant.nameEn,
    logoUrl: restaurant.logoUrl,
    coverUrl: restaurant.coverUrl,
  }
}

function normalizeKitchenFromSlider(raw: unknown, index = 0): Kitchen {
  const record = isRecord(raw) ? raw : {}
  const titleAr = optionalString([record.title_ar, record.titleAr, record.name_ar, record.nameAr])
  const titleEn = optionalString([record.title_en, record.titleEn, record.name_en, record.nameEn, record.title, record.name])
  const title = pickLocalizedString([titleAr], [titleEn], [record.title, record.name], `Kitchen ${index + 1}`)
  const subtitleAr = optionalString([record.subtitle_ar, record.subtitleAr, record.description_ar, record.descriptionAr, titleAr])
  const subtitleEn = optionalString([
    record.subtitle_en,
    record.subtitleEn,
    record.description_en,
    record.descriptionEn,
    record.subtitle,
    record.description,
    titleEn,
  ])
  const subtitle = pickLocalizedString([subtitleAr], [subtitleEn], [record.subtitle, record.description, title], title)
  const discountLabelAr = optionalString([record.discount_label_ar, record.discountLabelAr, record.badge_ar, record.badgeAr])
  const discountLabelEn = optionalString([
    record.discount_label_en,
    record.discountLabelEn,
    record.badge_en,
    record.badgeEn,
    record.discount_label,
    record.badge,
  ])

  return {
    id: normalizeId(record.id ?? record.slider_id, `kitchen-${index + 1}`),
    title,
    titleAr,
    titleEn,
    subtitle,
    subtitleAr,
    subtitleEn,
    imageUrl: resolveAssetUrl(record.image ?? record.image_url ?? record.photo, '/images/kitchen-1.jpg'),
    discountLabel: pickLocalizedString([discountLabelAr], [discountLabelEn], [record.discount_label, record.badge], ''),
    discountLabelAr,
    discountLabelEn,
  }
}

function normalizePaymentMethod(value: unknown): PaymentMethod {
  const normalized = firstString([value], '').toLowerCase()
  if (normalized === 'cash' || normalized === 'cod' || normalized === 'cash_on_delivery') return 'cod'
  if (normalized === 'apple_pay' || normalized === 'applepay') return 'apple_pay'
  return 'card'
}

function mapPaymentMethodToBackend(value: PaymentMethod): string {
  switch (value) {
    case 'cod':
      return 'cash'
    case 'apple_pay':
      return 'apple_pay'
    default:
      return 'card'
  }
}

function getCheckoutPaymentMethodCandidates(value: PaymentMethod): string[] {
  const primary = mapPaymentMethodToBackend(value)
  if (primary === 'cash') return ['cash']
  return uniqueStrings([primary, 'cash'])
}

function normalizeOrderStatusFromCode(value: unknown): Order['status'] | null {
  const numeric = toNumber(value, Number.NaN)
  if (!Number.isFinite(numeric)) return null

  switch (Math.round(numeric)) {
    case 1:
      return 'pending'
    case 2:
      return 'accepted'
    case 3:
      return 'preparing'
    case 4:
      return 'out_for_delivery'
    case 5:
      return 'delivered'
    case 6:
      return 'cancelled'
    default:
      return null
  }
}

function normalizeOrderStatus(value: unknown): Order['status'] {
  const directFromCode = normalizeOrderStatusFromCode(value)
  if (directFromCode) return directFromCode

  const normalized = firstString([value], '')
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .trim()

  if (!normalized) return 'pending'
  if (normalized.includes('cancel') || normalized.includes('reject') || normalized.includes('declin')) return 'cancelled'
  if (
    normalized.includes('out_for_delivery') ||
    normalized.includes('for_delivery') ||
    normalized.includes('on_the_way') ||
    normalized.includes('onway') ||
    normalized.includes('dispatch') ||
    normalized.includes('shipp') ||
    normalized.includes('transit') ||
    normalized.includes('courier') ||
    normalized.includes('driver_assigned')
  ) {
    return 'out_for_delivery'
  }
  if (
    normalized.includes('accept') ||
    normalized.includes('confirm') ||
    normalized.includes('approve') ||
    normalized.includes('processing') ||
    normalized.includes('assign')
  ) {
    return 'accepted'
  }
  if (normalized.includes('prepar') || normalized.includes('cook') || normalized.includes('ready')) return 'preparing'
  if (
    normalized.includes('deliver') ||
    normalized.includes('complete') ||
    normalized.includes('done') ||
    normalized.includes('fulfill') ||
    normalized.includes('finish')
  ) {
    return 'delivered'
  }
  if (normalized.includes('pending') || normalized.includes('new') || normalized.includes('created') || normalized.includes('placed')) {
    return 'pending'
  }

  return 'pending'
}

function extractOrderStatusValue(record: RecordValue): unknown {
  const statusRecord = extractObject(record.status)
  const orderStatusRecord = extractObject(record.order_status ?? record.orderStatus)
  const currentStatusRecord = extractObject(record.current_status ?? record.currentStatus)
  const stateRecord = extractObject(record.state)

  const nestedStatusCode = firstString(
    [
      currentStatusRecord.id,
      currentStatusRecord.code,
      currentStatusRecord.status_id,
      orderStatusRecord.id,
      orderStatusRecord.code,
      orderStatusRecord.status_id,
      statusRecord.id,
      statusRecord.code,
      statusRecord.status_id,
      stateRecord.id,
      stateRecord.code,
      stateRecord.status_id,
    ],
    '',
  )

  return (
    record.current_status ??
    record.currentStatus ??
    record.current_order_status ??
    record.currentOrderStatus ??
    record.current_status_name ??
    record.currentStatusName ??
    record.order_status ??
    record.orderStatus ??
    record.order_state ??
    record.orderState ??
    record.status ??
    record.delivery_status ??
    record.deliveryStatus ??
    record.state ??
    record.status_name ??
    record.statusName ??
    record.status_label ??
    record.statusLabel ??
    record.order_status_name ??
    record.orderStatusName ??
    record.status_slug ??
    record.statusSlug ??
    record.current_status_id ??
    record.currentStatusId ??
    record.order_status_id ??
    record.orderStatusId ??
    record.order_state_id ??
    record.orderStateId ??
    record.delivery_status_id ??
    record.deliveryStatusId ??
    record.status_id ??
    record.statusId ??
    record.status_code ??
    record.statusCode ??
    nestedStatusCode
  )
}

function splitOptionLikeText(value: string | undefined): string[] {
  if (!value) return []

  return value
    .split(/[\n|\u2022\u00b7;,]+/g)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function extractAddonOptionLabels(record: RecordValue): string[] {
  return uniqueStrings([
    ...toStringList(record.addons),
    ...toStringList(record.add_ons),
    ...toStringList(record.selected_addons),
    ...toStringList(record.addon_items),
    ...toStringList(record.add_on_ids),
    ...toStringList(record.extra_addons),
    ...toStringList(record.extras),
    ...toStringList(record.options),
    ...toStringList(record.selected_options),
  ])
}

function extractOrderItems(record: RecordValue): unknown[] {
  const direct = extractArray(record, [
    'items',
    'order_items',
    'orderItems',
    'order_details',
    'orderDetails',
    'details',
    'line_items',
    'order_lines',
    'products',
  ])
  if (direct.length > 0) return direct

  const nestedSources: unknown[] = [
    record.order,
    record.data,
    record.details,
    record.order_details,
    record.orderItems,
    record.order_items,
    record.items,
  ]

  for (const source of nestedSources) {
    const rows = extractArray(source, [
      'items',
      'order_items',
      'orderItems',
      'order_details',
      'orderDetails',
      'details',
      'line_items',
      'order_lines',
      'products',
    ])
    if (rows.length > 0) return rows
  }

  return []
}

function normalizeOrderItem(raw: unknown, fallbackRestaurantId: string, index = 0): CartItem {
  const record = isRecord(raw) ? raw : {}
  const menuItemValue = record.menu_item ?? record.menuItem
  const productValue = record.product ?? record.product_item ?? record.productItem
  const itemValue = record.item ?? record.order_item ?? record.orderItem
  const pivotValue = record.pivot ?? record.detail
  const menuItemRecord = isRecord(menuItemValue) ? menuItemValue : {}
  const productRecord = isRecord(productValue) ? productValue : {}
  const itemRecord = isRecord(itemValue) ? itemValue : {}
  const pivotRecord = isRecord(pivotValue) ? pivotValue : {}

  const notes = optionalString([
    record.notes,
    record.comment,
    record.note,
    record.special_instructions,
    record.instructions,
    record.description,
  ])
  const addonLabels = uniqueStrings([
    ...extractAddonOptionLabels(record),
    ...extractAddonOptionLabels(menuItemRecord),
    ...extractAddonOptionLabels(productRecord),
    ...extractAddonOptionLabels(itemRecord),
    ...toStringList(record.addon_names),
    ...toStringList(record.options_text),
  ])
  const options = uniqueStrings([...addonLabels, ...splitOptionLikeText(notes)])
  const quantity = Math.max(
    1,
    Math.round(
      toNumber(
        record.quantity ??
          record.qty ??
          record.count ??
          record.item_count ??
          pivotRecord.quantity ??
          pivotRecord.qty,
        1,
      ),
    ),
  )
  const unitPrice = pickNumber(
    [
      record.price_at_order,
      record.priceAtOrder,
      record.unit_price_at_order,
      record.unitPriceAtOrder,
      record.final_price,
      record.finalPrice,
      record.net_price,
      record.netPrice,
      record.price_after_discount,
      record.priceAfterDiscount,
      record.price,
      record.unit_price,
      record.item_price,
      record.menu_item_price,
      record.amount,
      pivotRecord.price,
      pivotRecord.unit_price,
      pivotRecord.price_at_order,
      pivotRecord.priceAtOrder,
      menuItemRecord.final_price,
      menuItemRecord.finalPrice,
      menuItemRecord.price,
      productRecord.final_price,
      productRecord.finalPrice,
      productRecord.price,
      itemRecord.final_price,
      itemRecord.finalPrice,
      itemRecord.price,
    ],
    Number.NaN,
  )
  const totalPrice = pickNumber(
    [
      record.total_price,
      record.totalPrice,
      record.total_price_at_order,
      record.totalPriceAtOrder,
      record.line_total,
      record.lineTotal,
      record.item_total,
      record.itemTotal,
      record.subtotal,
      record.sub_total,
      record.subTotal,
      record.total,
      record.amount,
      pivotRecord.total_price,
      pivotRecord.totalPrice,
      pivotRecord.subtotal,
      pivotRecord.line_total,
      pivotRecord.lineTotal,
    ],
    Number.NaN,
  )
  const price = Number.isFinite(unitPrice)
    ? Math.max(0, unitPrice)
    : Number.isFinite(totalPrice)
      ? Math.max(0, totalPrice / quantity)
      : 0
  const baseUnitPrice = pickNumber(
    [
      record.base_unit_price,
      record.item_base_price,
      record.base_price_without_addons,
      record.base_price_no_addons,
      menuItemRecord.base_unit_price,
      menuItemRecord.item_base_price,
      productRecord.base_unit_price,
      itemRecord.base_unit_price,
    ],
    Number.NaN,
  )
  const vatPercentage = pickNumber(
    [
      record.vat_percentage,
      record.vat,
      menuItemRecord.vat_percentage,
      menuItemRecord.vat,
      productRecord.vat_percentage,
      productRecord.vat,
      itemRecord.vat_percentage,
      itemRecord.vat,
    ],
    Number.NaN,
  )
  const vatIncludedValue =
    record.vat_included ??
    record.vatIncluded ??
    menuItemRecord.vat_included ??
    menuItemRecord.vatIncluded ??
    productRecord.vat_included ??
    productRecord.vatIncluded ??
    itemRecord.vat_included ??
    itemRecord.vatIncluded
  const vatIncluded = vatIncludedValue === undefined ? undefined : toBoolean(vatIncludedValue, false)
  const itemNameAr = optionalString([
    record.name_ar,
    record.title_ar,
    record.item_name_ar,
    record.itemNameAr,
    record.product_name_ar,
    record.productNameAr,
    record.menu_item_name_ar,
    record.menuItemNameAr,
    menuItemRecord.name_ar,
    menuItemRecord.nameAr,
    productRecord.name_ar,
    productRecord.nameAr,
    itemRecord.name_ar,
    itemRecord.nameAr,
  ])
  const itemNameEn = optionalString([
    record.name_en,
    record.title_en,
    record.item_name_en,
    record.itemNameEn,
    record.product_name_en,
    record.productNameEn,
    record.menu_item_name_en,
    record.menuItemNameEn,
    record.name,
    record.title,
    record.item_name,
    record.itemName,
    record.product_name,
    record.productName,
    record.menu_item_name,
    record.menuItemName,
    menuItemRecord.name_en,
    menuItemRecord.nameEn,
    menuItemRecord.name,
    menuItemRecord.title,
    productRecord.name_en,
    productRecord.nameEn,
    productRecord.name,
    productRecord.title,
    itemRecord.name_en,
    itemRecord.nameEn,
    itemRecord.name,
    itemRecord.title,
  ])

  return {
    id: normalizeId(
      record.id ??
        record.order_item_id ??
        record.orderItemId ??
        record.item_id ??
        record.menu_item_id ??
        record.product_id ??
        menuItemRecord.id ??
        productRecord.id ??
        itemRecord.id,
      `order-item-${index + 1}`,
    ),
    restaurantId: normalizeId(
      record.restaurant_id ??
        record.restaurantId ??
        menuItemRecord.restaurant_id ??
        menuItemRecord.restaurantId ??
        productRecord.restaurant_id ??
        productRecord.restaurantId ??
        itemRecord.restaurant_id ??
        itemRecord.restaurantId,
      fallbackRestaurantId || 'restaurant',
    ),
    name: pickLocalizedString([itemNameAr], [itemNameEn], [record.name, record.item_name, record.menu_item_name], 'Item'),
    price,
    vatPercentage: Number.isFinite(vatPercentage) ? Math.max(0, vatPercentage) : undefined,
    vatIncluded,
    basePrice: Number.isFinite(baseUnitPrice) ? Math.max(0, baseUnitPrice) : undefined,
    quantity,
    imageUrl: resolveAssetUrl(
      record.image ??
        record.image_url ??
        record.photo ??
        record.thumbnail ??
        menuItemRecord.image ??
        menuItemRecord.image_url ??
        menuItemRecord.photo ??
        productRecord.image ??
        productRecord.image_url ??
        productRecord.photo ??
        itemRecord.image ??
        itemRecord.image_url ??
        itemRecord.photo,
      '/images/dish-1.jpg',
    ),
    options: options.length ? options : undefined,
  }
}

function normalizeOrder(raw: unknown, fallbackItems: CartItem[] = []): Order {
  const record = isRecord(raw) ? raw : {}
  const addressValue = isRecord(record.address) ? record.address : {}
  const restaurantValue = isRecord(record.restaurant) ? record.restaurant : {}
  const pricingValue = isRecord(record.pricing) ? record.pricing : {}
  const totalsValue = isRecord(record.totals) ? record.totals : {}
  const summaryValue = isRecord(record.summary) ? record.summary : {}
  const feesValue = isRecord(record.fees) ? record.fees : {}
  const restaurantIdFallback =
    fallbackItems[0]?.restaurantId ??
    normalizeId(record.restaurant_id ?? record.restaurantId ?? restaurantValue.id ?? restaurantValue.restaurant_id, '')
  const itemsRaw = extractOrderItems(record)
  const items = itemsRaw.length
    ? itemsRaw.map((item, idx) => normalizeOrderItem(item, restaurantIdFallback, idx))
    : fallbackItems.map((item) => ({ ...item }))

  const fallbackSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const subtotalParsed = pickNumber(
    [
      record.subtotal,
      record.sub_total,
      record.subTotal,
      record.subtotal_amount,
      record.subtotalAmount,
      record.items_total,
      record.items_subtotal,
      record.itemsSubtotal,
      record.total_before_discount,
      record.totalBeforeDiscount,
      pricingValue.subtotal,
      pricingValue.sub_total,
      pricingValue.subTotal,
      totalsValue.subtotal,
      totalsValue.sub_total,
      totalsValue.subTotal,
      totalsValue.items_total,
      totalsValue.itemsSubtotal,
      summaryValue.subtotal,
      summaryValue.sub_total,
      summaryValue.subTotal,
    ],
    Number.NaN,
  )
  const subtotal = Math.max(
    0,
    Number.isFinite(subtotalParsed)
      ? subtotalParsed > 0
        ? subtotalParsed
        : fallbackSubtotal > 0
          ? fallbackSubtotal
          : subtotalParsed
      : fallbackSubtotal,
  )
  const deliveryFee = Math.max(
    0,
    pickNumber(
      [
        record.delivery_fee,
        record.deliveryFee,
        record.delivery_fees,
        record.deliveryFees,
        record.delivery_fee_amount,
        record.deliveryFeeAmount,
        record.shipping_fee,
        record.shippingFee,
        record.delivery_charge,
        record.deliveryCharge,
        record.delivery_cost,
        record.deliveryCost,
        record.delivery,
        record.shipping,
        record.shipping_cost,
        record.shippingCost,
        feesValue.delivery_fee,
        feesValue.deliveryFee,
        feesValue.delivery,
        feesValue.shipping_fee,
        feesValue.shippingFee,
        feesValue.shipping,
        pricingValue.delivery_fee,
        pricingValue.deliveryFee,
        pricingValue.shipping_fee,
        pricingValue.shippingFee,
        totalsValue.delivery_fee,
        totalsValue.deliveryFee,
        totalsValue.shipping_fee,
        totalsValue.shippingFee,
        summaryValue.delivery_fee,
        summaryValue.deliveryFee,
      ],
      0,
    ),
  )
  const vatPercentage = pickNumber(
    [
      record.vat_percentage,
      record.tax_percentage,
      record.vatPercent,
      record.taxPercent,
      pricingValue.vat_percentage,
      pricingValue.tax_percentage,
      totalsValue.vat_percentage,
      totalsValue.tax_percentage,
      summaryValue.vat_percentage,
      summaryValue.tax_percentage,
    ],
    Number.NaN,
  )
  const vatFallback = Number(
    (
      subtotal *
      (Number.isFinite(vatPercentage) ? Math.max(0, vatPercentage) / 100 : 0)
    ).toFixed(2),
  )
  const vat = Math.max(
    0,
    pickNumber(
      [
        record.vat,
        record.vatAmount,
        record.tax,
        record.tax_amount,
        record.taxAmount,
        record.vat_amount,
        pricingValue.vat,
        pricingValue.tax,
        pricingValue.vat_amount,
        pricingValue.vatAmount,
        pricingValue.tax_amount,
        pricingValue.taxAmount,
        totalsValue.vat,
        totalsValue.tax,
        totalsValue.vat_amount,
        totalsValue.vatAmount,
        totalsValue.tax_amount,
        totalsValue.taxAmount,
        summaryValue.vat,
        summaryValue.vat_amount,
        summaryValue.vatAmount,
        summaryValue.tax_amount,
        summaryValue.taxAmount,
      ],
      vatFallback,
    ),
  )
  const discount = Math.max(
    0,
    pickNumber(
      [
        record.discount,
        record.discountAmount,
        record.discount_amount,
        record.promo_discount,
        record.promoDiscount,
        record.coupon_discount,
        record.couponDiscount,
        record.total_discount,
        record.totalDiscount,
        pricingValue.discount,
        pricingValue.discountAmount,
        pricingValue.discount_amount,
        totalsValue.discount,
        totalsValue.discountAmount,
        totalsValue.discount_amount,
        summaryValue.discount,
        summaryValue.discountAmount,
      ],
      0,
    ),
  )
  const computedTotal = subtotal + deliveryFee + vat - discount
  const totalParsed = pickNumber(
    [
      record.total,
      record.totalAmount,
      record.total_amount,
      record.grand_total,
      record.grandTotal,
      record.final_total,
      record.finalTotal,
      record.total_price,
      record.totalPrice,
      record.order_total,
      record.orderTotal,
      record.payable_amount,
      record.payableAmount,
      pricingValue.total,
      pricingValue.totalAmount,
      pricingValue.total_amount,
      pricingValue.grand_total,
      pricingValue.grandTotal,
      totalsValue.total,
      totalsValue.totalAmount,
      totalsValue.total_amount,
      totalsValue.grand_total,
      totalsValue.grandTotal,
      summaryValue.total,
      summaryValue.totalAmount,
      summaryValue.total_amount,
    ],
    Number.NaN,
  )
  const total = Math.max(
    0,
    Number.isFinite(totalParsed)
      ? totalParsed > 0
        ? totalParsed
        : computedTotal > 0
          ? computedTotal
          : totalParsed
      : computedTotal,
  )

  return {
    id: normalizeId(record.id ?? record.order_id, `order-${Date.now()}`),
    items,
    subtotal,
    deliveryFee,
    vat,
    discount,
    total,
    addressId: normalizeId(
      record.address_id ?? record.addressId ?? record.shipping_address_id ?? record.delivery_address_id ?? addressValue.id,
      'address',
    ),
    paymentMethod: normalizePaymentMethod(record.payment_method ?? record.paymentMethod ?? record.payment),
    notes: optionalString([record.notes, record.comment, record.note, record.special_instructions]),
    status: normalizeOrderStatus(extractOrderStatusValue(record)),
    createdAt: firstString(
      [record.created_at, record.createdAt, record.ordered_at, record.order_time, record.order_date, record.placed_at, record.date],
      new Date().toISOString(),
    ),
  }
}

function isLikelyOrderRecord(payload: unknown): boolean {
  if (!isRecord(payload)) return false

  const hasOrderIdentity = payload.order_id !== undefined || payload.order_number !== undefined
  const hasOrderRelation =
    payload.payment_method !== undefined ||
    payload.address_id !== undefined ||
    payload.addressId !== undefined ||
    payload.restaurant_id !== undefined ||
    payload.restaurantId !== undefined
  const hasOrderFinancial =
    payload.subtotal !== undefined ||
    payload.sub_total !== undefined ||
    payload.subTotal !== undefined ||
    payload.subtotal_amount !== undefined ||
    payload.subtotalAmount !== undefined ||
    payload.total_price !== undefined ||
    payload.totalPrice !== undefined ||
    payload.total !== undefined ||
    payload.total_amount !== undefined ||
    payload.totalAmount !== undefined ||
    payload.final_total !== undefined ||
    payload.finalTotal !== undefined ||
    payload.order_total !== undefined ||
    payload.orderTotal !== undefined ||
    payload.payable_amount !== undefined ||
    payload.payableAmount !== undefined ||
    payload.grand_total !== undefined ||
    payload.grandTotal !== undefined ||
    payload.delivery_fee !== undefined ||
    payload.deliveryFee !== undefined ||
    payload.shipping_fee !== undefined ||
    payload.shippingFee !== undefined ||
    payload.delivery_charge !== undefined ||
    payload.deliveryCharge !== undefined ||
    payload.delivery_cost !== undefined ||
    payload.deliveryCost !== undefined ||
    payload.tax !== undefined ||
    payload.tax_amount !== undefined ||
    payload.taxAmount !== undefined ||
    payload.vat !== undefined ||
    payload.vat_amount !== undefined ||
    payload.vatAmount !== undefined ||
    payload.discount !== undefined ||
    payload.discount_amount !== undefined ||
    payload.discountAmount !== undefined
  const hasOrderTimestamp =
    payload.ordered_at !== undefined ||
    payload.order_time !== undefined ||
    payload.orderTime !== undefined ||
    payload.order_date !== undefined ||
    payload.placed_at !== undefined
  const statusText = firstString([payload.order_status, payload.state, payload.status], '').toLowerCase()
  const statusLooksLikeOrder =
    /(pending|prepar|cancel|deliver|complete|done|way|dispatch|on_the_way|out_for_delivery|processing|ready|accepted|confirmed|rejected|shipp)/i.test(
      statusText,
    )
  const hasOrderStatus =
    statusLooksLikeOrder ||
    (payload.order_status !== undefined &&
      statusText !== '' &&
      statusText !== 'success' &&
      statusText !== 'ok' &&
      statusText !== 'error' &&
      statusText !== 'failed')

  const hasOrderId = payload.id !== undefined || payload.order_id !== undefined || payload.order_number !== undefined
  const hasOrderItemsArray =
    Array.isArray(payload.order_items) ||
    Array.isArray(payload.orderItems) ||
    Array.isArray(payload.order_details) ||
    Array.isArray(payload.orderDetails) ||
    Array.isArray(payload.details)
  const hasGenericItemsArray = Array.isArray(payload.items)
  const hasAnyItemsArray =
    hasGenericItemsArray ||
    Array.isArray(payload.order_items) ||
    Array.isArray(payload.orderItems) ||
    Array.isArray(payload.order_details) ||
    Array.isArray(payload.orderDetails) ||
    Array.isArray(payload.details)

  if (hasOrderIdentity && (hasOrderRelation || hasOrderFinancial || hasAnyItemsArray || hasOrderStatus || hasOrderTimestamp)) {
    return true
  }

  if (hasOrderRelation && (hasOrderFinancial || hasAnyItemsArray || hasOrderStatus || hasOrderTimestamp)) {
    return true
  }

  if (hasOrderItemsArray && (hasOrderFinancial || hasOrderRelation || hasOrderIdentity || hasOrderId || hasOrderStatus || hasOrderTimestamp)) {
    return true
  }

  if (hasGenericItemsArray && (hasOrderIdentity || hasOrderRelation || hasOrderStatus || hasOrderTimestamp)) {
    return true
  }

  return false
}

function normalizeOrdersResponse(payload: unknown): Order[] {
  let rows = extractArray(payload, ['orders', 'data', 'results', 'rows', 'list'])
  if (!rows.length) {
    const root = extractObject(payload)
    const rootData = extractObject(root.data)
    rows = [
      ...extractArray(root.orders, ['orders', 'data', 'results', 'rows', 'list']),
      ...extractArray(rootData.orders, ['orders', 'data', 'results', 'rows', 'list']),
      ...extractArray(rootData, ['orders', 'results', 'rows', 'list']),
    ]
  }

  const normalizedRows = rows
    .map((entry) => {
      if (isLikelyOrderRecord(entry)) return normalizeOrder(entry)
      if (!isRecord(entry)) return null

      const nestedOrder = extractObjectByKeys(entry, ['order', 'data'])
      if (!isLikelyOrderRecord(nestedOrder)) return null
      return normalizeOrder(nestedOrder)
    })
    .filter((entry): entry is Order => Boolean(entry))

  if (normalizedRows.length > 0) return normalizedRows

  const record = extractObjectByKeys(payload, ['order', 'data'])
  if (!isLikelyOrderRecord(record)) return []
  return [normalizeOrder(record)]
}

function parseOrderCreatedAt(value: string): number {
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function parseOrderComparableId(value: string): number {
  const trimmed = value.trim()
  if (!trimmed) return 0

  const numeric = Number(trimmed)
  if (Number.isFinite(numeric)) return numeric

  const digitsOnly = trimmed.replace(/\D+/g, '')
  const parsedDigits = Number(digitsOnly)
  return Number.isFinite(parsedDigits) ? parsedDigits : 0
}

function pickMostRelevantOrder(rows: Order[], fallbackItems: CartItem[] = []): Order | null {
  if (rows.length === 0) return null

  const fallbackRestaurantId = normalizeId(fallbackItems[0]?.restaurantId, '')
  const fallbackMenuItemIds = new Set(
    fallbackItems
      .map((item) => normalizeId(item.menuItemId ?? item.id.split('__')[0], ''))
      .filter(Boolean),
  )

  const rankedRows = rows
    .map((row) => {
      const sameRestaurant = fallbackRestaurantId
        ? row.items.some((item) => normalizeId(item.restaurantId, '') === fallbackRestaurantId)
        : false
      const menuItemOverlap = fallbackMenuItemIds.size
        ? row.items.reduce((count, item) => {
            const menuItemId = normalizeId(item.menuItemId ?? item.id.split('__')[0], '')
            return menuItemId && fallbackMenuItemIds.has(menuItemId) ? count + 1 : count
          }, 0)
        : 0

      return {
        row,
        sameRestaurant,
        menuItemOverlap,
        createdAtScore: parseOrderCreatedAt(row.createdAt),
        idScore: parseOrderComparableId(row.id),
      }
    })
    .sort((a, b) => {
      if (a.sameRestaurant !== b.sameRestaurant) return a.sameRestaurant ? -1 : 1
      if (a.menuItemOverlap !== b.menuItemOverlap) return b.menuItemOverlap - a.menuItemOverlap
      if (a.createdAtScore !== b.createdAtScore) return b.createdAtScore - a.createdAtScore
      return b.idScore - a.idScore
    })

  return rankedRows[0]?.row ?? null
}

function isOrderSuccessPayload(payload: unknown): boolean {
  const root = isRecord(payload) ? payload : {}
  if (Object.keys(root).length === 0) return false

  const rootData = isRecord(root.data) ? root.data : {}

  if (toBoolean(root.success ?? root.ok ?? rootData.success ?? rootData.ok, false)) return true

  const statusText = firstString([root.status, root.state, rootData.status, rootData.state], '').toLowerCase()
  if (statusText === 'success' || statusText === 'ok' || statusText === 'created' || statusText === 'placed') return true

  const messageText = firstString([root.message, rootData.message], '')
    .toLowerCase()
    .trim()
  if (!messageText) return false

  const orderKeyword = /(order|طلب)/i
  const successKeyword = /(created|placed|confirmed|success|تم|نجاح|تأكيد)/i
  return orderKeyword.test(messageText) && successKeyword.test(messageText)
}

function resolveOrderFromPayload(payload: unknown, fallbackItems: CartItem[] = []): Order | null {
  const rows = normalizeOrdersResponse(payload)
  if (rows.length > 0) return pickMostRelevantOrder(rows, fallbackItems)

  const record = extractObjectByKeys(payload, ['order', 'data'])
  if (isLikelyOrderRecord(record)) return normalizeOrder(record, fallbackItems)

  return null
}

function normalizeCartItem(raw: unknown, index = 0): CartItem {
  const record = isRecord(raw) ? raw : {}
  const restaurantValue = record.restaurant
  const menuItemValue = record.menu_item
  const menuItemRecord = isRecord(menuItemValue) ? menuItemValue : {}
  const uiLang = detectUiLang()

  const quantity = Math.max(1, Math.round(toNumber(record.quantity ?? record.qty, 1)))
  const unitPrice = toNumber(record.price ?? record.unit_price ?? record.item_price, Number.NaN)
  const totalPrice = toNumber(record.total_price ?? record.subtotal, Number.NaN)
  const fallbackUnitPrice = Number.isFinite(unitPrice)
    ? Math.max(0, unitPrice)
    : Number.isFinite(totalPrice)
      ? Math.max(0, totalPrice / quantity)
      : 0
  const explicitBaseUnitPrice = pickNumber(
    [
      record.base_unit_price,
      record.item_base_price,
      record.base_price_without_addons,
      record.base_price_no_addons,
      menuItemRecord.base_unit_price,
      menuItemRecord.item_base_price,
    ],
    Number.NaN,
  )
  const explicitOldPrice = pickNumber(
    [
      record.old_price,
      record.original_price,
      record.base_price,
      menuItemRecord.old_price,
      menuItemRecord.original_price,
      menuItemRecord.base_price,
    ],
    Number.NaN,
  )
  const salePrice = pickNumber(
    [
      record.discount_price,
      record.sale_price,
      menuItemRecord.discount_price,
      menuItemRecord.sale_price,
    ],
    Number.NaN,
  )
  const explicitCurrentPrice = pickNumber(
    [
      record.current_price,
      record.final_price,
      menuItemRecord.current_price,
      menuItemRecord.final_price,
    ],
    Number.NaN,
  )
  const discountPercentage = pickNumber([record.discount_percentage, menuItemRecord.discount_percentage], Number.NaN)
  const discountStart = optionalString([record.discount_start, record.discountStart, menuItemRecord.discount_start])
  const discountEnd = optionalString([record.discount_end, record.discountEnd, menuItemRecord.discount_end])
  const basePrice = Number.isFinite(explicitOldPrice) ? Math.max(0, explicitOldPrice) : fallbackUnitPrice
  const saleFlag = resolveExplicitSaleFlag(
    record.is_on_sale,
    record.on_sale,
    record.isOnSale,
    record.onSale,
    menuItemRecord.is_on_sale,
    menuItemRecord.on_sale,
    menuItemRecord.isOnSale,
    menuItemRecord.onSale,
  )
  const resolvedDiscountedPrice = resolveDiscountedUnitPrice({
    basePrice,
    salePrice,
    currentPrice: Number.isFinite(explicitCurrentPrice) ? explicitCurrentPrice : fallbackUnitPrice,
    discountPercentage,
    saleFlag,
    discountStart,
    discountEnd,
  })
  const oldPrice =
    saleFlag !== false && Number.isFinite(explicitOldPrice) && explicitOldPrice > resolvedDiscountedPrice.price
      ? Math.max(0, explicitOldPrice)
      : resolvedDiscountedPrice.oldPrice
  const vatPercentage = pickNumber(
    [
      record.vat_percentage,
      record.vat,
      menuItemRecord.vat_percentage,
      menuItemRecord.vat,
    ],
    Number.NaN,
  )
  const vatIncludedValue =
    record.vat_included ??
    record.vatIncluded ??
    menuItemRecord.vat_included ??
    menuItemRecord.vatIncluded
  const vatIncluded = vatIncludedValue === undefined ? undefined : toBoolean(vatIncludedValue, false)
  const vatAdjustedPricing = applyVatToDisplayPrice({
    price: resolvedDiscountedPrice.price,
    oldPrice,
    vatPercentage,
    vatIncluded,
  })

  const notes = optionalString([record.notes, record.comment, record.note, record.special_instructions])
  const addons = extractAddonOptionLabels(record)
  const options = uniqueStrings([...addons, ...splitOptionLikeText(notes)])
  const backendAddonIds = uniqueBackendAddonIds([
    ...extractBackendAddonIdsFromRecord(record),
    ...extractBackendAddonIdsFromRecord(menuItemRecord),
  ])
  const nameAr = optionalString([
    record.name_ar,
    record.item_name_ar,
    record.menu_item_name_ar,
    isRecord(menuItemValue) ? menuItemValue.name_ar : undefined,
    isRecord(menuItemValue) ? menuItemValue.nameAr : undefined,
  ])
  const nameEn = optionalString([
    record.name_en,
    record.item_name_en,
    record.menu_item_name_en,
    isRecord(menuItemValue) ? menuItemValue.name_en : undefined,
    isRecord(menuItemValue) ? menuItemValue.nameEn : undefined,
    record.name,
    record.item_name,
    record.menu_item_name,
    isRecord(menuItemValue) ? menuItemValue.name : undefined,
  ])
  const localizedName = uiLang === 'ar' ? nameAr || nameEn : nameEn || nameAr
  const rawCartId = firstString([record.cart_item_id, record.id, record.item_id], '')
  const compositeBaseId = rawCartId.includes('__') ? rawCartId.split('__')[0] : ''
  const menuItemRestaurantValue = isRecord(menuItemValue) ? menuItemValue.restaurant : undefined
  const restaurantIdValue =
    record.restaurant_id ??
    record.restaurantId ??
    (isRecord(restaurantValue) ? restaurantValue.restaurant_id ?? restaurantValue.restaurantId ?? restaurantValue.id : undefined) ??
    (isRecord(menuItemValue)
      ? menuItemValue.restaurant_id ??
        menuItemValue.restaurantId ??
        (isRecord(menuItemRestaurantValue)
          ? menuItemRestaurantValue.restaurant_id ?? menuItemRestaurantValue.restaurantId ?? menuItemRestaurantValue.id
          : undefined)
      : undefined)
  const menuItemId = normalizeId(
    record.menu_item_id ??
      record.menuItemId ??
      record.product_id ??
      record.productId ??
      (isRecord(menuItemValue) ? menuItemValue.menu_item_id ?? menuItemValue.menuItemId ?? menuItemValue.id : undefined) ??
      compositeBaseId,
    '',
  )
  const normalizedCartItemId = normalizeId(
    record.cart_item_id ?? record.id ?? record.item_id ?? record.menu_item_id ?? record.product_id,
    `cart-item-${index + 1}`,
  )
  const compositeAddonIds = extractBackendAddonIdsFromCartCompositeId(normalizedCartItemId)
  const resolvedAddonIds = uniqueBackendAddonIds([...backendAddonIds, ...compositeAddonIds])

  return {
    id: normalizedCartItemId,
    restaurantId: normalizeId(restaurantIdValue, ''),
    menuItemId: menuItemId || undefined,
    addonIds: resolvedAddonIds.length ? resolvedAddonIds : undefined,
    name: firstString(
      [
        localizedName,
        record.name,
        record.item_name,
        record.menu_item_name,
        record.name_ar,
        record.item_name_ar,
        record.menu_item_name_ar,
        isRecord(menuItemValue) ? menuItemValue.name : undefined,
        isRecord(menuItemValue) ? menuItemValue.name_ar : undefined,
      ],
      'Item',
    ),
    price: vatAdjustedPricing.price,
    vatPercentage: Number.isFinite(vatPercentage) ? Math.max(0, vatPercentage) : undefined,
    vatIncluded,
    basePrice: Number.isFinite(explicitBaseUnitPrice) ? Math.max(0, explicitBaseUnitPrice) : undefined,
    oldPrice: vatAdjustedPricing.oldPrice,
    quantity,
    imageUrl: resolveAssetUrl(
      record.image ??
        record.image_url ??
        record.photo ??
        (isRecord(menuItemValue) ? menuItemValue.image : undefined),
      '/images/dish-1.jpg',
    ),
    options: options.length ? options : undefined,
  }
}

function normalizeCartItems(payload: unknown): CartItem[] {
  const root = extractObject(payload)
  const rootData = extractObject(root.data)
  const rootCartValue = isRecord(root.cart) ? root.cart : undefined
  const rootDataCartValue = isRecord(rootData.cart) ? rootData.cart : undefined
  const fallbackRestaurantId = normalizeId(
    root.restaurant_id ??
      root.restaurantId ??
      rootData.restaurant_id ??
      rootData.restaurantId ??
      (isRecord(rootCartValue) ? rootCartValue.restaurant_id ?? rootCartValue.restaurantId : undefined) ??
      (isRecord(rootDataCartValue) ? rootDataCartValue.restaurant_id ?? rootDataCartValue.restaurantId : undefined),
    '',
  )

  let rows = extractArray(payload, ['cart_items', 'items', 'cart'])
  if (!rows.length) {
    const nestedSources: unknown[] = [root.cart, rootData.cart, rootData]

    for (const source of nestedSources) {
      const nestedRows = extractArray(source, ['cart_items', 'items'])
      if (nestedRows.length > 0) {
        rows = nestedRows
        break
      }
    }
  }

  const normalizedItems = rows.map((entry, idx) => normalizeCartItem(entry, idx))
  if (!fallbackRestaurantId) return normalizedItems

  return normalizedItems.map((item) =>
    item.restaurantId
      ? item
      : {
          ...item,
          restaurantId: fallbackRestaurantId,
        },
  )
}

type WishlistItemType = 'restaurant' | 'product'

type WishlistItem = {
  id: string
  type: WishlistItemType
  itemId: string
}

function normalizeWishlistItemType(value: unknown): WishlistItemType | null {
  const normalized = firstString([value], '').toLowerCase()
  if (!normalized) return null
  if (normalized === 'restaurant' || normalized === 'restaurants') return 'restaurant'
  if (normalized === 'product' || normalized === 'products') return 'product'
  return null
}

function inferWishlistItemType(entry: RecordValue): WishlistItemType {
  const explicitType = normalizeWishlistItemType(
    firstString([entry.type, entry.item_type, entry.itemType, entry.model_type, entry.modelType], ''),
  )
  if (explicitType) return explicitType

  const hasRestaurantSignals = Boolean(
    entry.restaurant_id ||
      entry.restaurantId ||
      (isRecord(entry.restaurant) ? entry.restaurant.id : undefined),
  )
  if (hasRestaurantSignals) return 'restaurant'

  const hasProductSignals = Boolean(
    entry.product_id ||
      entry.productId ||
      entry.menu_item_id ||
      entry.menuItemId ||
      entry.item_id ||
      entry.itemId ||
      (isRecord(entry.product) ? entry.product.id : undefined),
  )
  if (hasProductSignals) return 'product'

  // Legacy favorites endpoints often return restaurant-only entries without a type field.
  return 'restaurant'
}

function extractWishlistItems(payload: unknown): WishlistItem[] {
  let rows = extractArrayByKeysOnly(payload, ['wishlist', 'favorites', 'items', 'restaurants'])
  if (!rows.length) {
    rows = extractArray(payload, ['wishlist', 'favorites', 'items', 'restaurants'])
  }
  if (!rows.length) {
    const root = extractObject(payload)
    const rootData = extractObject(root.data)
    rows = [
      ...extractArray(root.wishlist, ['items', 'restaurants']),
      ...extractArray(root.favorites, ['items', 'restaurants']),
      ...extractArray(rootData.wishlist, ['items', 'restaurants']),
      ...extractArray(rootData.favorites, ['items', 'restaurants']),
      ...extractArray(rootData, ['wishlist', 'favorites']),
    ]
  }

  const byKey = new Map<string, WishlistItem>()

  for (const entry of rows) {
    if (typeof entry === 'string' || typeof entry === 'number') {
      const itemId = normalizeId(entry, '')
      if (!itemId) continue
      const key = `restaurant:${itemId}`
      if (!byKey.has(key)) {
        byKey.set(key, {
          id: itemId,
          type: 'restaurant',
          itemId,
        })
      }
      continue
    }

    if (!isRecord(entry)) continue

    const entryType = inferWishlistItemType(entry)
    const restaurantValue = isRecord(entry.restaurant) ? entry.restaurant : null
    const productValue = isRecord(entry.product) ? entry.product : null

    const itemId = normalizeId(
      entry.item_id ??
        entry.itemId ??
        (entryType === 'restaurant'
          ? entry.restaurant_id ?? entry.restaurantId ?? restaurantValue?.id
          : entry.product_id ??
            entry.productId ??
            entry.menu_item_id ??
            entry.menuItemId ??
            productValue?.id) ??
        // Fallback for older endpoints where the row id equals the item id.
        entry.id,
      '',
    )
    if (!itemId) continue

    const rowId = normalizeId(
      entry.wishlist_id ??
        entry.wishlistId ??
        entry.favorite_id ??
        entry.favoriteId ??
        entry.id,
      '',
    )

    const key = `${entryType}:${itemId}`
    const existing = byKey.get(key)

    if (!existing) {
      byKey.set(key, {
        id: rowId || itemId,
        type: entryType,
        itemId,
      })
      continue
    }

    if (!existing.id && rowId) {
      byKey.set(key, { ...existing, id: rowId })
    }
  }

  return Array.from(byKey.values())
}

function extractFavoriteRestaurantIds(payload: unknown): string[] {
  const wishlistItems = extractWishlistItems(payload)
  if (wishlistItems.length > 0) {
    return uniqueStrings(
      wishlistItems
        .filter((entry) => entry.type === 'restaurant')
        .map((entry) => entry.itemId),
    )
  }

  // Legacy fallback for unusual payloads.
  let rows = extractArray(payload, ['favorites', 'wishlist', 'items', 'restaurants'])
  if (!rows.length) {
    const root = extractObject(payload)
    const rootData = extractObject(root.data)
    rows = [
      ...extractArray(root.favorites, ['items', 'restaurants']),
      ...extractArray(rootData.favorites, ['items', 'restaurants']),
      ...extractArray(rootData.wishlist, ['items', 'restaurants']),
      ...extractArray(rootData, ['favorites', 'wishlist']),
    ]
  }

  const ids = rows
    .map((entry) => {
      if (typeof entry === 'string' || typeof entry === 'number') {
        return normalizeId(entry, '')
      }
      if (!isRecord(entry)) return ''
      const restaurantValue = entry.restaurant
      return normalizeId(
        entry.restaurant_id ??
          entry.item_id ??
          entry.id ??
          (isRecord(restaurantValue) ? restaurantValue.id : undefined),
        '',
      )
    })
    .filter(Boolean)

  return uniqueStrings(ids)
}

function toBackendId(value: string): string | number {
  const normalized = value.trim()
  if (!normalized) return normalized
  if (/^\d+$/.test(normalized)) return Number.parseInt(normalized, 10)

  const compactRestaurantMatch = normalized.match(/^[Rr](\d+)$/)
  if (compactRestaurantMatch) {
    return Number.parseInt(compactRestaurantMatch[1], 10)
  }

  // Support dashed/underscored ids from some endpoints, e.g. "up-1", "menu_item-12".
  const prefixedNumericMatch = normalized.match(/^[A-Za-z]+(?:[-_][A-Za-z]+)*[-_](\d+)$/)
  if (prefixedNumericMatch) {
    return Number.parseInt(prefixedNumericMatch[1], 10)
  }

  return normalized
}

type BackendAddonId = string | number

function normalizeBackendAddonId(value: unknown): BackendAddonId | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return null

  const normalized = value.trim()
  if (!normalized) return null

  const converted = toBackendId(normalized)
  if (typeof converted === 'number') return converted
  if (typeof converted === 'string' && converted.trim()) return converted
  return null
}

function uniqueBackendAddonIds(values: BackendAddonId[]): BackendAddonId[] {
  const out: BackendAddonId[] = []
  const seen = new Set<string>()

  for (const value of values) {
    const key = `${typeof value}:${String(value)}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(value)
  }

  return out
}

function extractBackendAddonIdsFromUnknown(value: unknown): BackendAddonId[] {
  if (Array.isArray(value)) {
    return uniqueBackendAddonIds(value.flatMap((entry) => extractBackendAddonIdsFromUnknown(entry)))
  }

  if (isRecord(value)) {
    const direct = normalizeBackendAddonId(
      value.addon_id ??
      value.addonId ??
      value.id ??
      value.item_id ??
      value.itemId ??
      value.value,
    )
    if (direct !== null) return [direct]

    const nestedAddon = value.addon
    if (isRecord(nestedAddon) || Array.isArray(nestedAddon)) {
      return extractBackendAddonIdsFromUnknown(nestedAddon)
    }

    return []
  }

  const normalized = normalizeBackendAddonId(value)
  return normalized === null ? [] : [normalized]
}

function extractBackendAddonIdsFromCartCompositeId(compositeId: string): BackendAddonId[] {
  const tokens = compositeId
    .split('__')
    .slice(1)
    .map((token) => token.trim())
    .filter(Boolean)

  const addonTokens = tokens
    .filter((token) => token.toLowerCase().startsWith('addon:'))
    .map((token) => token.slice('addon:'.length))
    .filter(Boolean)

  return uniqueBackendAddonIds(
    addonTokens
      .map((token) => normalizeBackendAddonId(token))
      .filter((value): value is BackendAddonId => value !== null),
  )
}

function extractBackendAddonIdsFromRecord(record: RecordValue): BackendAddonId[] {
  return uniqueBackendAddonIds([
    ...extractBackendAddonIdsFromUnknown(record.addons),
    ...extractBackendAddonIdsFromUnknown(record.add_ons),
    ...extractBackendAddonIdsFromUnknown(record.selected_addons),
    ...extractBackendAddonIdsFromUnknown(record.addon_ids),
    ...extractBackendAddonIdsFromUnknown(record.add_on_ids),
    ...extractBackendAddonIdsFromUnknown(record.addonIds),
    ...extractBackendAddonIdsFromUnknown(record.extra_addons),
    ...extractBackendAddonIdsFromUnknown(record.addon_items),
    ...extractBackendAddonIdsFromUnknown(record.extras),
  ])
}

function extractBackendAddonIdsFromCartItem(item: Pick<CartItem, 'id' | 'addonIds'>): BackendAddonId[] {
  return uniqueBackendAddonIds([
    ...(Array.isArray(item.addonIds) ? extractBackendAddonIdsFromUnknown(item.addonIds) : []),
    ...extractBackendAddonIdsFromCartCompositeId(item.id),
  ])
}

function extractToken(payload: unknown): string {
  const root = extractObject(payload)
  const rootData = extractObject(root.data)
  return firstString([root.token, root.access_token, root.api_token, rootData.token, rootData.access_token], '')
}

const SOCIAL_REDIRECT_TEXT_PATTERN =
  /["']?(?:redirect_url|redirectUrl|authorization_url|authorizationUrl|url|link)["']?\s*:\s*["']([^"']+)["']/i

function tryParseStrictJson(text: string): unknown | null {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function isLikelySocialRedirectUrl(value: string): boolean {
  return /^(?:https?:)?\/\//i.test(value) || value.startsWith('/')
}

function isLikelySocialAuthNavigationUrl(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false

  const normalized = trimmed.toLowerCase()

  // Ignore common static asset hosts that can appear in HTML responses.
  if (normalized.includes('fonts.googleapis.com') || normalized.includes('fonts.gstatic.com')) return false

  if (
    normalized.includes('accounts.google.com') ||
    normalized.includes('/oauth') ||
    normalized.includes('/authorize') ||
    normalized.includes('/social/redirect') ||
    normalized.includes('/auth/social/redirect') ||
    normalized.includes('/social/callback') ||
    normalized.includes('/auth/social/callback') ||
    /(?:^|[?&])(?:provider|social_provider)=(?:google|facebook)\b/.test(normalized) ||
    /(?:^|\/)(?:auth|social)[^?#]*(?:google|facebook)/.test(normalized)
  ) {
    return true
  }

  try {
    const base = typeof window !== 'undefined' ? window.location.origin : getApiOrigin() || undefined
    const parsed = new URL(trimmed, base)
    const pathname = parsed.pathname.toLowerCase()
    const hostname = parsed.hostname.toLowerCase()

    if (hostname === 'accounts.google.com' || hostname.endsWith('.accounts.google.com')) return true
    if (hostname === 'facebook.com' || hostname.endsWith('.facebook.com')) return true
    if (isSocialRedirectEndpointPath(pathname)) return true

    const params = new URLSearchParams(parsed.search)
    const provider = (params.get('provider') || params.get('social_provider') || '').trim().toLowerCase()
    if (provider === 'google' || provider === 'facebook') return true

    if (params.has('client_id') && (params.has('redirect_uri') || params.has('callback'))) return true

    return false
  } catch {
    return false
  }
}

function decodeSocialRedirectString(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''

  try {
    const parsed = JSON.parse(`"${trimmed}"`)
    if (typeof parsed === 'string' && parsed.trim()) return parsed.trim()
  } catch {
    // ignore and continue with non-JSON fallback
  }

  return trimmed.replace(/\\\//g, '/')
}

function extractSocialRedirectPayloadInternal(payload: unknown, depth: number): string {
  if (depth > 4) return ''

  if (typeof payload === 'string') {
    const trimmed = payload.trim()
    if (!trimmed) return ''
    if (isLikelySocialRedirectUrl(trimmed) && isLikelySocialAuthNavigationUrl(trimmed)) return trimmed

    const parsed = tryParseStrictJson(trimmed)
    if (parsed !== null) {
      const nested = extractSocialRedirectPayloadInternal(parsed, depth + 1)
      if (nested) return nested
    }

    const decoded = (() => {
      try {
        return decodeURIComponent(trimmed)
      } catch {
        return trimmed
      }
    })()

    if (decoded !== trimmed) {
      if (isLikelySocialRedirectUrl(decoded) && isLikelySocialAuthNavigationUrl(decoded)) return decoded

      const decodedParsed = tryParseStrictJson(decoded)
      if (decodedParsed !== null) {
        const nested = extractSocialRedirectPayloadInternal(decodedParsed, depth + 1)
        if (nested) return nested
      }
    }

    const match = trimmed.match(SOCIAL_REDIRECT_TEXT_PATTERN) || decoded.match(SOCIAL_REDIRECT_TEXT_PATTERN)
    if (match?.[1]) {
      const candidate = decodeSocialRedirectString(match[1])
      if (candidate && isLikelySocialAuthNavigationUrl(candidate)) return candidate
    }

    const urlMatch = trimmed.match(/https?:\/\/[^\s"'<>}]+/i) || decoded.match(/https?:\/\/[^\s"'<>}]+/i)
    if (urlMatch?.[0]) {
      const candidate = decodeSocialRedirectString(urlMatch[0])
      if (candidate && isLikelySocialAuthNavigationUrl(candidate)) return candidate
    }

    return ''
  }

  const root = extractObject(payload)
  const rootData = extractObject(root.data)

  return firstString(
    [
      root.redirect_url,
      root.redirectUrl,
      root.authorization_url,
      root.authorizationUrl,
      root.url,
      root.link,
      rootData.redirect_url,
      rootData.redirectUrl,
      rootData.authorization_url,
      rootData.authorizationUrl,
      rootData.url,
      rootData.link,
    ],
    '',
  )
}

function extractSocialRedirectPayload(payload: unknown): string {
  return extractSocialRedirectPayloadInternal(payload, 0)
}

const SOCIAL_TOKEN_PARAM_KEYS = ['token', 'access_token', 'api_token', 'auth_token']
const SOCIAL_ERROR_PARAM_KEYS = ['error', 'message', 'error_description']
const SOCIAL_USER_PARAM_KEYS = ['user', 'profile']
const SOCIAL_SERIALIZED_PAYLOAD_PARAM_KEYS = ['data', 'payload', 'result', 'session']
const SOCIAL_SIGNAL_PARAM_KEYS = [
  ...SOCIAL_TOKEN_PARAM_KEYS,
  ...SOCIAL_ERROR_PARAM_KEYS,
  'code',
  'state',
  'provider',
  'social_provider',
]

type ParsedSocialAuthPayload = {
  hasSignal: boolean
  token: string
  error: string
  provider: SocialProvider | null
  query: Record<string, string>
  userPayload: unknown
}

function buildSocialParams(url: URL): URLSearchParams {
  const params = new URLSearchParams(url.search)

  const rawHash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash
  if (!rawHash) return params

  if (rawHash.startsWith('/')) {
    const queryStartIndex = rawHash.indexOf('?')
    if (queryStartIndex >= 0) {
      const routeHashParams = new URLSearchParams(rawHash.slice(queryStartIndex + 1))
      for (const [key, value] of routeHashParams.entries()) {
        if (!params.has(key)) params.set(key, value)
      }
    }
    return params
  }

  const hashParams = new URLSearchParams(rawHash)
  for (const [key, value] of hashParams.entries()) {
    if (!params.has(key)) params.set(key, value)
  }

  return params
}

function readParam(params: URLSearchParams, keys: string[]): string {
  for (const key of keys) {
    const value = params.get(key)
    if (value && value.trim()) return value.trim()
  }
  return ''
}

function normalizeSocialProvider(value: unknown): SocialProvider | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  if (normalized === 'google' || normalized === 'facebook') return normalized
  return null
}

function inferSocialProviderFromPath(pathname: string): SocialProvider | null {
  const normalizedPath = pathname.trim().toLowerCase()
  if (!normalizedPath) return null
  if (normalizedPath.includes('/google')) return 'google'
  if (normalizedPath.includes('/facebook')) return 'facebook'
  return null
}

function parseSerializedJson(value: string): unknown {
  const trimmed = value.trim()
  if (!trimmed) return null

  const decoded = (() => {
    try {
      return decodeURIComponent(trimmed)
    } catch {
      return trimmed
    }
  })()

  const candidates = [trimmed, decoded]
  for (const candidate of candidates) {
    const parsed = parseJson(candidate)
    if (parsed !== null) return parsed
  }

  return null
}

function extractUserPayloadFromSocialParams(params: URLSearchParams): unknown {
  for (const key of SOCIAL_USER_PARAM_KEYS) {
    const value = params.get(key)
    if (!value || !value.trim()) continue

    const parsed = parseSerializedJson(value)
    if (parsed !== null && parsed !== undefined) return parsed
  }

  const email = readParam(params, ['email', 'user_email'])
  if (!email) return null

  return {
    email,
    name: readParam(params, ['name', 'full_name', 'fullName']),
    phone: readParam(params, ['phone', 'phone_number', 'phoneNumber', 'mobile', 'mobile_number', 'mobileNumber']),
    id: readParam(params, ['id', 'user_id']),
  }
}

function extractSerializedSocialPayloadFromParams(params: URLSearchParams): RecordValue[] {
  const payloads: RecordValue[] = []

  for (const key of SOCIAL_SERIALIZED_PAYLOAD_PARAM_KEYS) {
    const value = params.get(key)
    if (!value || !value.trim()) continue
    const parsed = parseSerializedJson(value)
    if (isRecord(parsed)) payloads.push(parsed)
  }

  return payloads
}

function extractTokenFromSocialParams(params: URLSearchParams): string {
  const direct = readParam(params, SOCIAL_TOKEN_PARAM_KEYS)
  if (direct) return direct

  const serializedPayloads = extractSerializedSocialPayloadFromParams(params)
  for (const payload of serializedPayloads) {
    const token = firstString(
      [
        payload.token,
        payload.access_token,
        payload.api_token,
        payload.auth_token,
        payload.accessToken,
        payload.authToken,
        payload.jwt,
        isRecord(payload.data) ? payload.data.token : undefined,
        isRecord(payload.data) ? payload.data.access_token : undefined,
        isRecord(payload.data) ? payload.data.auth_token : undefined,
      ],
      '',
    )
    if (token) return token
  }

  return ''
}

function extractProviderFromSocialParams(params: URLSearchParams, pathname: string): SocialProvider | null {
  const directProvider = normalizeSocialProvider(readParam(params, ['provider', 'social_provider']))
  if (directProvider) return directProvider

  const serializedPayloads = extractSerializedSocialPayloadFromParams(params)
  for (const payload of serializedPayloads) {
    const provider = normalizeSocialProvider(
      firstString([payload.provider, payload.social_provider, isRecord(payload.data) ? payload.data.provider : undefined], ''),
    )
    if (provider) return provider
  }

  return inferSocialProviderFromPath(pathname)
}

function getSocialCallbackEndpointCandidates(provider: SocialProvider, query: Record<string, string>): string[] {
  const queryWithProvider: Record<string, string> = {
    ...query,
    provider: query.provider || provider,
  }
  const frontendCallbackPath = provider === 'google' ? '/google-auth/callback' : '/social-auth/callback'
  const frontendCallbackUrl = buildCurrentOriginUrl(frontendCallbackPath, { provider })
  if (frontendCallbackUrl) {
    queryWithProvider.redirect = queryWithProvider.redirect || frontendCallbackUrl
    queryWithProvider.redirect_url = queryWithProvider.redirect_url || frontendCallbackUrl
    queryWithProvider.redirectUrl = queryWithProvider.redirectUrl || frontendCallbackUrl
    queryWithProvider.callback = queryWithProvider.callback || frontendCallbackUrl
    queryWithProvider.callback_url = queryWithProvider.callback_url || frontendCallbackUrl
    queryWithProvider.callbackUrl = queryWithProvider.callbackUrl || frontendCallbackUrl
    queryWithProvider.return_url = queryWithProvider.return_url || frontendCallbackUrl
    queryWithProvider.returnUrl = queryWithProvider.returnUrl || frontendCallbackUrl
    queryWithProvider.return_to = queryWithProvider.return_to || frontendCallbackUrl
    queryWithProvider.frontend_url = queryWithProvider.frontend_url || frontendCallbackUrl
    queryWithProvider.frontendUrl = queryWithProvider.frontendUrl || frontendCallbackUrl
    queryWithProvider.redirect_uri = queryWithProvider.redirect_uri || frontendCallbackUrl
    queryWithProvider.callback_uri = queryWithProvider.callback_uri || frontendCallbackUrl
    queryWithProvider.frontend_callback = queryWithProvider.frontend_callback || frontendCallbackUrl
    queryWithProvider.frontend_callback_url = queryWithProvider.frontend_callback_url || frontendCallbackUrl
  }

  const configuredApiOrigin = getConfiguredApiOrigin()
  const includeConfiguredApiCandidates = Boolean(configuredApiOrigin)

  return uniqueStrings(
    [
      ...(includeConfiguredApiCandidates
        ? [
            buildConfiguredApiUrl(`/social/callback/${provider}`, queryWithProvider),
            buildConfiguredApiUrl(`/social/${provider}/callback`, queryWithProvider),
            buildConfiguredApiUrl(`/auth/social/callback/${provider}`, queryWithProvider),
            buildConfiguredApiUrl(`/auth/social/${provider}/callback`, queryWithProvider),
            buildConfiguredApiUrl(`/auth/${provider}/callback`, queryWithProvider),
            buildConfiguredApiUrl('/social/callback', queryWithProvider),
            buildConfiguredApiUrl('/auth/social/callback', queryWithProvider),
            buildConfiguredApiUrl(`/api/social/callback/${provider}`, queryWithProvider),
            buildConfiguredApiUrl(`/api/social/${provider}/callback`, queryWithProvider),
            buildConfiguredApiUrl(`/api/auth/social/callback/${provider}`, queryWithProvider),
            buildConfiguredApiUrl(`/api/auth/social/${provider}/callback`, queryWithProvider),
            buildConfiguredApiUrl(`/api/auth/${provider}/callback`, queryWithProvider),
            buildConfiguredApiUrl('/api/social/callback', queryWithProvider),
            buildConfiguredApiUrl('/api/auth/social/callback', queryWithProvider),
          ]
        : []),
      ...(includeConfiguredApiCandidates
        ? [
            buildOriginUrl(`/social/callback/${provider}`, queryWithProvider),
            buildOriginUrl(`/social/${provider}/callback`, queryWithProvider),
            buildOriginUrl(`/auth/social/callback/${provider}`, queryWithProvider),
            buildOriginUrl(`/auth/social/${provider}/callback`, queryWithProvider),
            buildOriginUrl(`/auth/${provider}/callback`, queryWithProvider),
            buildOriginUrl('/social/callback', queryWithProvider),
            buildOriginUrl('/auth/social/callback', queryWithProvider),
          ]
        : []),
      buildCurrentOriginUrl(`/social/callback/${provider}`, queryWithProvider),
      buildCurrentOriginUrl(`/social/${provider}/callback`, queryWithProvider),
      buildCurrentOriginUrl(`/auth/social/callback/${provider}`, queryWithProvider),
      buildCurrentOriginUrl(`/auth/social/${provider}/callback`, queryWithProvider),
      buildCurrentOriginUrl(`/auth/${provider}/callback`, queryWithProvider),
      buildCurrentOriginUrl('/social/callback', queryWithProvider),
      buildCurrentOriginUrl('/auth/social/callback', queryWithProvider),
      buildCurrentOriginUrl(`/api/social/callback/${provider}`, queryWithProvider),
      buildCurrentOriginUrl(`/api/social/${provider}/callback`, queryWithProvider),
      buildCurrentOriginUrl(`/api/auth/social/callback/${provider}`, queryWithProvider),
      buildCurrentOriginUrl(`/api/auth/social/${provider}/callback`, queryWithProvider),
      buildCurrentOriginUrl(`/api/auth/${provider}/callback`, queryWithProvider),
      buildCurrentOriginUrl('/api/social/callback', queryWithProvider),
      buildCurrentOriginUrl('/api/auth/social/callback', queryWithProvider),
    ].filter(Boolean),
  )
}

function parseSocialAuthPayload(urlValue: string): ParsedSocialAuthPayload | null {
  const base = typeof window !== 'undefined' ? window.location.origin : undefined
  let url: URL
  try {
    url = new URL(urlValue, base)
  } catch {
    return null
  }

  const params = buildSocialParams(url)
  const pathname = url.pathname.toLowerCase()
  const hasSignal =
    SOCIAL_SIGNAL_PARAM_KEYS.some((key) => params.has(key)) ||
    pathname.includes('/social/callback')

  if (!hasSignal) return null

  const provider = extractProviderFromSocialParams(params, pathname)
  const query: Record<string, string> = {}
  for (const [key, value] of params.entries()) {
    if (!value.trim()) continue
    query[key] = value
  }

  return {
    hasSignal,
    token: extractTokenFromSocialParams(params),
    error: readParam(params, SOCIAL_ERROR_PARAM_KEYS),
    provider,
    query,
    userPayload: extractUserPayloadFromSocialParams(params),
  }
}

function toAbsoluteSocialUrl(urlValue: string): string {
  const trimmed = urlValue.trim()
  if (!trimmed) return ''

  if (/^[a-z]+:\/\//i.test(trimmed) || trimmed.startsWith('//')) {
    try {
      return new URL(trimmed, getApiOrigin() || undefined).toString()
    } catch {
      return trimmed
    }
  }

  const origin = getApiOrigin()
  if (!origin) return trimmed

  try {
    const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
    return new URL(normalizedPath, origin).toString()
  } catch {
    return trimmed
  }
}

function normalizeSocialCallbackUrl(value: string | undefined): string {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''

  try {
    const base = typeof window !== 'undefined' ? window.location.origin : getApiOrigin() || undefined
    return new URL(trimmed, base).toString()
  } catch {
    return ''
  }
}

function buildSocialRedirectQuery(
  provider: SocialProvider,
  options?: SocialLoginNavigationOptions,
): Record<string, string> {
  const query: Record<string, string> = { provider }
  const callbackUrl = normalizeSocialCallbackUrl(options?.callbackUrl)
  if (!callbackUrl) return query

  // Different backend implementations accept different callback parameter names.
  query.redirect = callbackUrl
  query.redirect_url = callbackUrl
  query.redirectUrl = callbackUrl
  query.callback = callbackUrl
  query.callback_url = callbackUrl
  query.callbackUrl = callbackUrl
  query.frontend_url = callbackUrl
  query.frontendUrl = callbackUrl
  query.return_url = callbackUrl
  query.returnUrl = callbackUrl
  query.return_to = callbackUrl
  query.redirect_uri = callbackUrl
  query.callback_uri = callbackUrl
  query.frontend_callback = callbackUrl
  query.frontend_callback_url = callbackUrl

  return query
}

function getSocialRedirectEndpointCandidates(
  provider: SocialProvider,
  options?: SocialLoginNavigationOptions,
): string[] {
  const query = buildSocialRedirectQuery(provider, options)
  const configuredApiOrigin = getConfiguredApiOrigin()
  const includeConfiguredApiCandidates = Boolean(configuredApiOrigin)
  const apiCandidates = includeConfiguredApiCandidates
    ? [
        buildOriginUrl('/social/redirect', query),
        buildOriginUrl(`/social/${provider}/redirect`, query),
        buildOriginUrl(`/social/${provider}`, query),
        buildOriginUrl('/auth/social/redirect', query),
        buildOriginUrl(`/auth/social/redirect/${provider}`, query),
        buildOriginUrl(`/auth/social/${provider}/redirect`, query),
        buildOriginUrl(`/auth/social/${provider}`, query),
        buildConfiguredApiUrl('/social/redirect', query),
        buildConfiguredApiUrl(`/social/${provider}/redirect`, query),
        buildConfiguredApiUrl(`/social/${provider}`, query),
        buildConfiguredApiUrl('/auth/social/redirect', query),
        buildConfiguredApiUrl(`/auth/social/redirect/${provider}`, query),
        buildConfiguredApiUrl(`/auth/social/${provider}/redirect`, query),
        buildConfiguredApiUrl(`/auth/social/${provider}`, query),
        buildConfiguredApiUrl('/api/social/redirect', query),
        buildConfiguredApiUrl(`/api/social/${provider}/redirect`, query),
        buildConfiguredApiUrl(`/api/social/${provider}`, query),
        buildConfiguredApiUrl('/api/auth/social/redirect', query),
        buildConfiguredApiUrl(`/api/auth/social/redirect/${provider}`, query),
        buildConfiguredApiUrl(`/api/auth/social/${provider}/redirect`, query),
        buildConfiguredApiUrl(`/api/auth/social/${provider}`, query),
      ]
    : []
  const currentOriginCandidates = [
    buildCurrentOriginUrl('/social/redirect', query),
    buildCurrentOriginUrl(`/social/${provider}/redirect`, query),
    buildCurrentOriginUrl(`/social/${provider}`, query),
    buildCurrentOriginUrl('/auth/social/redirect', query),
    buildCurrentOriginUrl(`/auth/social/redirect/${provider}`, query),
    buildCurrentOriginUrl(`/auth/social/${provider}/redirect`, query),
    buildCurrentOriginUrl(`/auth/social/${provider}`, query),
    buildCurrentOriginUrl('/api/social/redirect', query),
    buildCurrentOriginUrl(`/api/social/${provider}/redirect`, query),
    buildCurrentOriginUrl(`/api/social/${provider}`, query),
    buildCurrentOriginUrl('/api/auth/social/redirect', query),
    buildCurrentOriginUrl(`/api/auth/social/redirect/${provider}`, query),
    buildCurrentOriginUrl(`/api/auth/social/${provider}/redirect`, query),
    buildCurrentOriginUrl(`/api/auth/social/${provider}`, query),
  ]

  return uniqueStrings(
    [
      ...apiCandidates,
      ...currentOriginCandidates,
    ].filter(Boolean),
  )
}

function isSocialRedirectEndpointPath(pathname: string, provider?: SocialProvider): boolean {
  const normalizedPath = pathname.trim().toLowerCase()
  if (!normalizedPath) return false
  if (normalizedPath.endsWith('/social/redirect') || normalizedPath.endsWith('/auth/social/redirect')) return true

  if (!provider) return false
  const normalizedProvider = provider.toLowerCase()
  return (
    normalizedPath.endsWith(`/social/${normalizedProvider}/redirect`) ||
    normalizedPath.endsWith(`/social/${normalizedProvider}`) ||
    normalizedPath.endsWith(`/auth/social/redirect/${normalizedProvider}`) ||
    normalizedPath.endsWith(`/auth/social/${normalizedProvider}/redirect`) ||
    normalizedPath.endsWith(`/auth/social/${normalizedProvider}`)
  )
}

export function isSocialRedirectEndpointUrl(urlValue: string, provider?: SocialProvider): boolean {
  const trimmed = urlValue.trim()
  if (!trimmed) return false

  try {
    const base = typeof window !== 'undefined' ? window.location.origin : getApiOrigin() || undefined
    const url = new URL(trimmed, base)
    return isSocialRedirectEndpointPath(url.pathname, provider)
  } catch {
    return (
      trimmed.toLowerCase().includes('/social/redirect') ||
      trimmed.toLowerCase().includes('/auth/social/redirect') ||
      (provider
        ? trimmed.toLowerCase().includes(`/social/${provider.toLowerCase()}`) ||
          trimmed.toLowerCase().includes(`/auth/social/${provider.toLowerCase()}`)
        : false)
    )
  }
}

export function resolveSocialNavigationUrlFromPayload(payload: unknown): string {
  const redirectUrl = extractSocialRedirectPayload(payload)
  if (!redirectUrl) return ''
  return toAbsoluteSocialUrl(redirectUrl)
}

function isCurrentOriginSocialRedirectCandidate(urlValue: string, provider: SocialProvider): boolean {
  const trimmed = urlValue.trim()
  if (!trimmed || !isSocialRedirectEndpointUrl(trimmed, provider)) return false

  if (typeof window === 'undefined') return false

  try {
    const parsed = new URL(trimmed, window.location.origin)
    if (parsed.origin !== window.location.origin) return false

    const pathname = parsed.pathname.toLowerCase()
    if (pathname.startsWith('/api/')) return false
    if (matchesConfiguredApiPathPrefix(parsed.toString())) return false

    return true
  } catch {
    return false
  }
}

function scoreSocialRedirectCandidate(provider: SocialProvider, url: string): number {
  const value = url.toLowerCase()
  const socialProvider = provider.toLowerCase()

  let score = 0
  if (
    value.includes(`/auth/social/redirect/${socialProvider}`) ||
    value.includes(`/social/${socialProvider}/redirect`) ||
    value.includes(`/auth/social/${socialProvider}/redirect`)
  ) {
    // Prefer provider-specific redirect endpoints for browser navigation.
    score = 400
  } else if (
    value.includes(`/auth/social/${socialProvider}`) ||
    value.includes(`/social/${socialProvider}`) ||
    value.includes(`/api/auth/social/${socialProvider}`) ||
    value.includes(`/api/social/${socialProvider}`)
  ) {
    // Provider-specific routes often perform direct HTTP redirects in production.
    score = 325
  } else if (value.includes('/auth/social/redirect') || value.includes('/social/redirect')) {
    // Generic redirect endpoints sometimes return JSON (redirect_url) instead of HTTP 302.
    score = 250
  }

  if (value.includes('/api/')) score -= 25

  return score
}

function pickSocialRedirectFallbackCandidate(provider: SocialProvider, candidates: string[]): string {
  if (!candidates.length) {
    return (
      buildConfiguredApiUrl(`/social/${provider}/redirect`, { provider }) ||
      buildConfiguredApiUrl(`/social/${provider}`, { provider }) ||
      buildConfiguredApiUrl(`/auth/social/redirect/${provider}`, { provider }) ||
      buildConfiguredApiUrl(`/auth/social/${provider}/redirect`, { provider }) ||
      buildConfiguredApiUrl(`/auth/social/${provider}`, { provider }) ||
      buildConfiguredApiUrl(`/api/social/${provider}/redirect`, { provider }) ||
      buildConfiguredApiUrl(`/api/social/${provider}`, { provider }) ||
      buildConfiguredApiUrl(`/api/auth/social/redirect/${provider}`, { provider }) ||
      buildConfiguredApiUrl(`/api/auth/social/${provider}/redirect`, { provider }) ||
      buildConfiguredApiUrl(`/api/auth/social/${provider}`, { provider }) ||
      buildConfiguredApiUrl('/social/redirect', { provider }) ||
      buildConfiguredApiUrl('/api/social/redirect', { provider }) ||
      buildOriginUrl(`/social/${provider}/redirect`, { provider }) ||
      buildOriginUrl(`/social/${provider}`, { provider }) ||
      buildOriginUrl(`/auth/social/redirect/${provider}`, { provider }) ||
      buildOriginUrl(`/auth/social/${provider}/redirect`, { provider }) ||
      buildOriginUrl(`/auth/social/${provider}`, { provider }) ||
      buildOriginUrl('/social/redirect', { provider }) ||
      buildCurrentOriginUrl(`/social/${provider}/redirect`, { provider }) ||
      buildCurrentOriginUrl(`/social/${provider}`, { provider }) ||
      buildCurrentOriginUrl(`/auth/social/redirect/${provider}`, { provider }) ||
      buildCurrentOriginUrl(`/auth/social/${provider}/redirect`, { provider }) ||
      buildCurrentOriginUrl(`/auth/social/${provider}`, { provider }) ||
      buildCurrentOriginUrl(`/api/social/${provider}/redirect`, { provider }) ||
      buildCurrentOriginUrl(`/api/social/${provider}`, { provider }) ||
      buildCurrentOriginUrl(`/api/auth/social/redirect/${provider}`, { provider }) ||
      buildCurrentOriginUrl(`/api/auth/social/${provider}/redirect`, { provider }) ||
      buildCurrentOriginUrl(`/api/auth/social/${provider}`, { provider }) ||
      buildCurrentOriginUrl('/api/social/redirect', { provider }) ||
      buildCurrentOriginUrl('/social/redirect', { provider }) ||
      ''
    )
  }

  const ranked = [...candidates].sort(
    (left, right) => scoreSocialRedirectCandidate(provider, right) - scoreSocialRedirectCandidate(provider, left),
  )
  const configuredApiOrigin = getConfiguredApiOrigin()
  if (configuredApiOrigin) {
    const preferredSocialRootCandidate = ranked.find((candidate) => {
      try {
        const base = typeof window !== 'undefined' ? window.location.origin : undefined
        const parsed = new URL(candidate, base)
        if (parsed.origin !== configuredApiOrigin) return false
        const pathname = parsed.pathname.toLowerCase()
        return pathname.startsWith('/social/') || pathname === '/social/redirect'
      } catch {
        return false
      }
    })
    if (preferredSocialRootCandidate) return preferredSocialRootCandidate

    const preferredApiCandidate = ranked.find((candidate) => {
      try {
        const base = typeof window !== 'undefined' ? window.location.origin : undefined
        return new URL(candidate, base).origin === configuredApiOrigin
      } catch {
        return false
      }
    })
    if (preferredApiCandidate) return preferredApiCandidate
  }

  return (
    ranked[0] ||
    buildConfiguredApiUrl(`/social/${provider}/redirect`, { provider }) ||
    buildConfiguredApiUrl(`/social/${provider}`, { provider }) ||
    buildConfiguredApiUrl(`/auth/social/redirect/${provider}`, { provider }) ||
    buildConfiguredApiUrl(`/auth/social/${provider}/redirect`, { provider }) ||
    buildConfiguredApiUrl(`/auth/social/${provider}`, { provider }) ||
    buildConfiguredApiUrl(`/api/social/${provider}/redirect`, { provider }) ||
    buildConfiguredApiUrl(`/api/social/${provider}`, { provider }) ||
    buildConfiguredApiUrl(`/api/auth/social/redirect/${provider}`, { provider }) ||
    buildConfiguredApiUrl(`/api/auth/social/${provider}/redirect`, { provider }) ||
    buildConfiguredApiUrl(`/api/auth/social/${provider}`, { provider }) ||
    buildConfiguredApiUrl('/social/redirect', { provider }) ||
    buildConfiguredApiUrl('/api/social/redirect', { provider }) ||
    buildOriginUrl(`/social/${provider}/redirect`, { provider }) ||
    buildOriginUrl(`/social/${provider}`, { provider }) ||
    buildOriginUrl(`/auth/social/redirect/${provider}`, { provider }) ||
    buildOriginUrl(`/auth/social/${provider}/redirect`, { provider }) ||
    buildOriginUrl(`/auth/social/${provider}`, { provider }) ||
    buildOriginUrl('/social/redirect', { provider }) ||
    buildCurrentOriginUrl(`/social/${provider}/redirect`, { provider }) ||
    buildCurrentOriginUrl(`/social/${provider}`, { provider }) ||
    buildCurrentOriginUrl(`/auth/social/redirect/${provider}`, { provider }) ||
    buildCurrentOriginUrl(`/auth/social/${provider}/redirect`, { provider }) ||
    buildCurrentOriginUrl(`/auth/social/${provider}`, { provider }) ||
    buildCurrentOriginUrl(`/api/social/${provider}/redirect`, { provider }) ||
    buildCurrentOriginUrl(`/api/social/${provider}`, { provider }) ||
    buildCurrentOriginUrl(`/api/auth/social/redirect/${provider}`, { provider }) ||
    buildCurrentOriginUrl(`/api/auth/social/${provider}/redirect`, { provider }) ||
    buildCurrentOriginUrl(`/api/auth/social/${provider}`, { provider }) ||
    buildCurrentOriginUrl('/api/social/redirect', { provider }) ||
    buildCurrentOriginUrl('/social/redirect', { provider }) ||
    ''
  )
}

function canAttemptBrowserSocialFetch(urlValue: string): boolean {
  if (typeof window === 'undefined') return true
  try {
    const parsedUrl = new URL(urlValue, window.location.origin)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

async function tryFetchSocialRedirectEndpoint(url: string): Promise<string | null> {
  if (!canAttemptBrowserSocialFetch(url)) {
    if (API_LOG_ENABLED) {
      console.warn('[API OPTIONAL ENDPOINT SKIPPED]', {
        method: 'GET',
        path: url,
        reason: 'unsupported URL protocol for browser fetch',
      })
    }
    return null
  }

  const uiLang = detectUiLang()
  const credentialModes: RequestCredentials[] = ['include', 'omit']
  let lastError: unknown = null

  for (const credentials of credentialModes) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Accept-Language': uiLang,
          'X-Locale': uiLang,
        },
        redirect: 'manual',
        credentials,
      })

      if (response.type === 'opaqueredirect') {
        return url
      }

      if (response.status >= 300 && response.status < 400) {
        const locationHeader = response.headers.get('location')
        if (locationHeader && locationHeader.trim()) {
          return toAbsoluteSocialUrl(locationHeader)
        }
        return url
      }

      if (!response.ok) {
        if (API_LOG_ENABLED) {
          console.warn('[API OPTIONAL ENDPOINT FAILED]', {
            method: 'GET',
            path: url,
            status: response.status,
            credentials,
          })
        }
        continue
      }

      if (response.redirected && response.url) {
        return response.url
      }

      const text = await response.text()
      const payload = parseJson(text)
      const redirectUrl = extractSocialRedirectPayload(payload) || extractSocialRedirectPayload(text)
      if (redirectUrl) return toAbsoluteSocialUrl(redirectUrl)
    } catch (error) {
      lastError = error
      if (API_LOG_ENABLED) {
        console.warn('[API OPTIONAL ENDPOINT FAILED]', {
          method: 'GET',
          path: url,
          credentials,
          error,
        })
      }
    }
  }

  if (API_LOG_ENABLED && lastError) {
    console.warn('[API OPTIONAL ENDPOINT FAILED]', {
      method: 'GET',
      path: url,
      error: lastError,
    })
  }

  return null
}

async function getCurrentUserWithTokenLive(token: string): Promise<User> {
  const url = buildApiUrl('/auth/user')
  const startedAt = Date.now()
  const uiLang = detectUiLang()
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Accept-Language': uiLang,
      'X-Locale': uiLang,
      Authorization: `Bearer ${token}`,
    },
  })

  const text = await response.text()
  const payload = parseJson(text)

  if (!response.ok) {
    if (API_LOG_ENABLED) {
      console.error('[API ERROR RESPONSE]', {
        method: 'GET',
        url,
        status: response.status,
        durationMs: Date.now() - startedAt,
        response: payload,
      })
    }
    throw new Error(extractErrorMessage(payload))
  }

  const userPayload = extractUserPayload(payload)
  return normalizeUser(userPayload)
}

async function tryFetchSocialCallbackEndpoint(url: string): Promise<AuthSession | null> {
  if (!canAttemptBrowserSocialFetch(url)) {
    if (API_LOG_ENABLED) {
      console.warn('[API OPTIONAL ENDPOINT SKIPPED]', {
        method: 'GET',
        path: url,
        reason: 'unsupported URL protocol for browser fetch',
      })
    }
    return null
  }

  const uiLang = detectUiLang()
  const credentialModes: RequestCredentials[] = ['include', 'omit']

  for (const credentials of credentialModes) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Accept-Language': uiLang,
          'X-Locale': uiLang,
        },
        credentials,
      })

      if (!response.ok) {
        if (API_LOG_ENABLED) {
          console.warn('[API OPTIONAL ENDPOINT FAILED]', {
            method: 'GET',
            path: url,
            status: response.status,
            credentials,
          })
        }
        continue
      }

      if (response.redirected && response.url) {
        const redirectedPayload = parseSocialAuthPayload(response.url)
        if (redirectedPayload?.token) {
          const hydratedUser = await getCurrentUserWithTokenLive(redirectedPayload.token)
          return { token: redirectedPayload.token, user: hydratedUser }
        }
      }

      const text = await response.text()
      let payload = parseJson(text)
      const parsedPayloadToken = extractToken(payload)
      if (!parsedPayloadToken && text.trim()) {
        const startIndex = text.indexOf('{')
        const endIndex = text.lastIndexOf('}')
        if (startIndex >= 0 && endIndex > startIndex) {
          const slicedPayload = parseJson(text.slice(startIndex, endIndex + 1))
          if (extractToken(slicedPayload)) {
            payload = slicedPayload
          }
        }
      }
      const token = extractToken(payload)
      if (!token) continue

      let user = normalizeUser(extractUserPayload(payload))
      if (!user.email) {
        user = await getCurrentUserWithTokenLive(token)
      }

      return { token, user }
    } catch (error) {
      if (API_LOG_ENABLED) {
        console.warn('[API OPTIONAL ENDPOINT FAILED]', {
          method: 'GET',
          path: url,
          credentials,
          error,
        })
      }
    }
  }

  return null
}

function extractUserPayload(payload: unknown): unknown {
  const root = extractObject(payload)
  const rootData = extractObject(root.data)
  const candidates: unknown[] = [root.user, root.profile, rootData.user, rootData.profile]

  for (const candidate of candidates) {
    if (candidate !== undefined && candidate !== null) return candidate
  }

  return rootData && Object.keys(rootData).length ? rootData : root
}

function toBackendAddressPayload(address: Omit<Address, 'id'>): RecordValue {
  const composedDetails = [
    address.governorate,
    address.city,
    address.district,
    address.street,
    address.buildingNo,
    address.floor,
    address.apartment,
    address.postalCode,
    address.landmark,
  ]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(', ')
  const details = address.details?.trim() || composedDetails || address.label
  const stateId = firstString([address.stateId, address.governorateCode], '1')
  const latitude = toNumber(address.latitude, Number.NaN)
  const longitude = toNumber(address.longitude, Number.NaN)

  const payload: RecordValue = {
    state_id: toBackendId(stateId),
    city: firstString([address.city, address.cityCode], ''),
    address: details,
    postal_code: firstString([address.postalCode], ''),
    phone: firstString([address.phone], ''),
    is_default: Boolean(address.isDefault),
    // label: address.label,
    // governorate: address.governorate,
    // governorate_code: address.governorateCode,
    // state_name: address.governorate,
    // state_code: address.governorateCode,
    // city_code: address.cityCode,
    // district: address.district,
    // street: address.street,
    // building_no: address.buildingNo,
    // floor: address.floor,
    // apartment: address.apartment,
    // landmark: address.landmark,
  }

  const restaurantId = normalizeAddressRestaurantId(address.restaurantId)
  if (restaurantId) {
    payload.restaurant_id = toBackendId(restaurantId)
    payload.restaurantId = toBackendId(restaurantId)
  }

  if (Number.isFinite(latitude)) payload.latitude = latitude
  if (Number.isFinite(longitude)) payload.longitude = longitude

  return payload
}

function normalizeSocialKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractSocialRecords(value: unknown): RecordValue[] {
  if (isRecord(value)) return [value]

  if (typeof value === 'string' && value.trim()) {
    const parsed = parseJson(value)
    if (isRecord(parsed)) return [parsed]
    if (Array.isArray(parsed)) return parsed.filter(isRecord) as RecordValue[]
  }

  if (Array.isArray(value)) return value.filter(isRecord) as RecordValue[]
  return []
}

function findSocialUrlInRecord(record: RecordValue, platformTokens: string[]): string {
  const keyHints = ['url', 'link', 'href', 'page', 'profile', 'account', 'handle', 'username']

  for (const [rawKey, rawValue] of Object.entries(record)) {
    if (typeof rawValue !== 'string') continue
    const value = rawValue.trim()
    if (!value) continue

    const key = normalizeSocialKey(rawKey)
    const matchesPlatform = platformTokens.some((token) => key.includes(token))
    if (!matchesPlatform) continue

    const hasUrlHint = keyHints.some((hint) => key.includes(hint))
    const isDirectPlatformKey = platformTokens.some((token) => key === token)
    if (hasUrlHint || isDirectPlatformKey) return value
  }

  return ''
}

function findSocialUrlInListEntry(entry: RecordValue, platformTokens: string[]): string {
  const platformValue = firstString(
    [entry.platform, entry.network, entry.provider, entry.name, entry.key, entry.type, entry.slug],
    '',
  ).toLowerCase()
  const matchesPlatform = platformTokens.some(
    (token) => platformValue === token || platformValue.includes(token),
  )

  if (matchesPlatform) {
    const directUrl = firstString(
      [entry.url, entry.link, entry.href, entry.value, entry.profile, entry.account, entry.username, entry.handle],
      '',
    )
    if (directUrl) return directUrl
  }

  return findSocialUrlInRecord(entry, platformTokens)
}

function collectNestedSocialRecords(source: RecordValue): RecordValue[] {
  const nestedCandidates: unknown[] = [
    source.social_links,
    source.socialLinks,
    source.social_urls,
    source.socialUrls,
    source.social_media,
    source.socialMedia,
    source.social_accounts,
    source.socialAccounts,
    source.social_profiles,
    source.socialProfiles,
    source.social,
  ]

  const records: RecordValue[] = []
  for (const candidate of nestedCandidates) {
    records.push(...extractSocialRecords(candidate))
  }
  return records
}

function resolveSocialUrlFromSettings(
  source: RecordValue,
  platformTokens: string[],
  explicitCandidates: unknown[],
): string {
  const explicitUrl = firstString(explicitCandidates, '')
  if (explicitUrl) return explicitUrl

  const nestedRecords = collectNestedSocialRecords(source)

  const sourceFallback = findSocialUrlInRecord(source, platformTokens)
  if (sourceFallback) return sourceFallback

  for (const record of nestedRecords) {
    const fromListEntry = findSocialUrlInListEntry(record, platformTokens)
    if (fromListEntry) return fromListEntry

    const fromRecord = findSocialUrlInRecord(record, platformTokens)
    if (fromRecord) return fromRecord
  }

  return ''
}

function normalizeSettings(payload: unknown): AppSettings {
  const root = extractObject(payload)
  const rootData = extractObject(root.data)
  const source = Object.keys(rootData).length ? rootData : root
  const socialSource = extractObject(
    source.social_links ??
      source.socialLinks ??
      source.social_urls ??
      source.socialUrls ??
      source.social_media ??
      source.socialMedia ??
      source.social,
  )
  const normalizedFacebookUrl = resolveSocialUrlFromSettings(source, ['facebook', 'fb'], [
    source.social_facebook,
    source.socialFacebook,
    source.social_fb,
    source.socialFb,
    source.facebook_url,
    source.facebookUrl,
    source.facebook_link,
    source.facebookLink,
    source.facebook_page,
    source.facebookPage,
    source.facebook_page_url,
    source.facebookPageUrl,
    source.facebook,
    source.fb_url,
    source.fbUrl,
    source.fb_link,
    source.fbLink,
    source.fb,
    socialSource.facebook_url,
    socialSource.facebookUrl,
    socialSource.facebook_link,
    socialSource.facebookLink,
    socialSource.facebook_page,
    socialSource.facebookPage,
    socialSource.facebook_page_url,
    socialSource.facebookPageUrl,
    socialSource.facebook,
    socialSource.fb_url,
    socialSource.fbUrl,
    socialSource.fb_link,
    socialSource.fbLink,
    socialSource.fb,
    socialSource.social_facebook,
    socialSource.socialFacebook,
    socialSource.social_fb,
    socialSource.socialFb,
  ])
  const normalizedInstagramUrl = resolveSocialUrlFromSettings(source, ['instagram', 'insta'], [
    source.social_instagram,
    source.socialInstagram,
    source.social_insta,
    source.socialInsta,
    source.instagram_url,
    source.instagramUrl,
    source.instagram_link,
    source.instagramLink,
    source.instagram_page,
    source.instagramPage,
    source.instagram_page_url,
    source.instagramPageUrl,
    source.instagram,
    source.insta_url,
    source.instaUrl,
    source.insta_link,
    source.instaLink,
    source.insta,
    socialSource.instagram_url,
    socialSource.instagramUrl,
    socialSource.instagram_link,
    socialSource.instagramLink,
    socialSource.instagram_page,
    socialSource.instagramPage,
    socialSource.instagram_page_url,
    socialSource.instagramPageUrl,
    socialSource.instagram,
    socialSource.insta_url,
    socialSource.instaUrl,
    socialSource.insta_link,
    socialSource.instaLink,
    socialSource.insta,
    socialSource.social_instagram,
    socialSource.socialInstagram,
    socialSource.social_insta,
    socialSource.socialInsta,
  ])
  const normalizedLinkedinUrl = resolveSocialUrlFromSettings(source, ['linkedin'], [
    source.social_linkedin,
    source.socialLinkedin,
    source.linkedin_url,
    source.linkedinUrl,
    source.linkedin_link,
    source.linkedinLink,
    source.linkedin_page,
    source.linkedinPage,
    source.linkedin_page_url,
    source.linkedinPageUrl,
    source.linkedin,
    socialSource.linkedin_url,
    socialSource.linkedinUrl,
    socialSource.linkedin_link,
    socialSource.linkedinLink,
    socialSource.linkedin_page,
    socialSource.linkedinPage,
    socialSource.linkedin_page_url,
    socialSource.linkedinPageUrl,
    socialSource.linkedin,
    socialSource.social_linkedin,
    socialSource.socialLinkedin,
  ])
  const normalizedTwitterUrl = resolveSocialUrlFromSettings(source, ['twitter', 'x'], [
    source.social_twitter,
    source.socialTwitter,
    source.social_x,
    source.socialX,
    source.twitter_url,
    source.twitterUrl,
    source.twitter_link,
    source.twitterLink,
    source.twitter_page,
    source.twitterPage,
    source.twitter_page_url,
    source.twitterPageUrl,
    source.twitter,
    source.x_url,
    source.xUrl,
    source.x_link,
    source.xLink,
    source.x_page,
    source.xPage,
    source.x_page_url,
    source.xPageUrl,
    source.x,
    socialSource.twitter_url,
    socialSource.twitterUrl,
    socialSource.twitter_link,
    socialSource.twitterLink,
    socialSource.twitter_page,
    socialSource.twitterPage,
    socialSource.twitter_page_url,
    socialSource.twitterPageUrl,
    socialSource.twitter,
    socialSource.x_url,
    socialSource.xUrl,
    socialSource.x_link,
    socialSource.xLink,
    socialSource.x_page,
    socialSource.xPage,
    socialSource.x_page_url,
    socialSource.xPageUrl,
    socialSource.x,
    socialSource.social_twitter,
    socialSource.socialTwitter,
    socialSource.social_x,
    socialSource.socialX,
  ])
  const normalizedXUrl = resolveSocialUrlFromSettings(source, ['x', 'twitter'], [
    source.social_x,
    source.socialX,
    source.social_twitter,
    source.socialTwitter,
    source.x_url,
    source.xUrl,
    source.x_link,
    source.xLink,
    source.x_page,
    source.xPage,
    source.x_page_url,
    source.xPageUrl,
    source.x,
    source.twitter_url,
    source.twitterUrl,
    source.twitter_link,
    source.twitterLink,
    source.twitter_page,
    source.twitterPage,
    source.twitter_page_url,
    source.twitterPageUrl,
    source.twitter,
    socialSource.x_url,
    socialSource.xUrl,
    socialSource.x_link,
    socialSource.xLink,
    socialSource.x_page,
    socialSource.xPage,
    socialSource.x_page_url,
    socialSource.xPageUrl,
    socialSource.x,
    socialSource.twitter_url,
    socialSource.twitterUrl,
    socialSource.twitter_link,
    socialSource.twitterLink,
    socialSource.twitter_page,
    socialSource.twitterPage,
    socialSource.twitter_page_url,
    socialSource.twitterPageUrl,
    socialSource.twitter,
    socialSource.social_x,
    socialSource.socialX,
    socialSource.social_twitter,
    socialSource.socialTwitter,
  ])
  const normalizedYoutubeUrl = resolveSocialUrlFromSettings(source, ['youtube', 'yt'], [
    source.social_youtube,
    source.socialYoutube,
    source.youtube_url,
    source.youtubeUrl,
    source.youtube_link,
    source.youtubeLink,
    source.youtube_channel,
    source.youtubeChannel,
    source.youtube,
    source.yt_url,
    source.ytUrl,
    source.yt_link,
    source.ytLink,
    source.yt,
    socialSource.social_youtube,
    socialSource.socialYoutube,
    socialSource.youtube_url,
    socialSource.youtubeUrl,
    socialSource.youtube_link,
    socialSource.youtubeLink,
    socialSource.youtube_channel,
    socialSource.youtubeChannel,
    socialSource.youtube,
    socialSource.yt_url,
    socialSource.ytUrl,
    socialSource.yt_link,
    socialSource.ytLink,
    socialSource.yt,
  ])
  const normalizedTiktokUrl = resolveSocialUrlFromSettings(source, ['tiktok', 'tt'], [
    source.social_tiktok,
    source.socialTiktok,
    source.tiktok_url,
    source.tiktokUrl,
    source.tiktok_link,
    source.tiktokLink,
    source.tiktok,
    source.tt_url,
    source.ttUrl,
    source.tt_link,
    source.ttLink,
    source.tt,
    socialSource.social_tiktok,
    socialSource.socialTiktok,
    socialSource.tiktok_url,
    socialSource.tiktokUrl,
    socialSource.tiktok_link,
    socialSource.tiktokLink,
    socialSource.tiktok,
    socialSource.tt_url,
    socialSource.ttUrl,
    socialSource.tt_link,
    socialSource.ttLink,
    socialSource.tt,
  ])
  const normalizedSnapchatUrl = resolveSocialUrlFromSettings(source, ['snapchat', 'snap'], [
    source.social_snapchat,
    source.socialSnapchat,
    source.snapchat_url,
    source.snapchatUrl,
    source.snapchat_link,
    source.snapchatLink,
    source.snapchat,
    source.snap_url,
    source.snapUrl,
    source.snap_link,
    source.snapLink,
    source.snap,
    socialSource.social_snapchat,
    socialSource.socialSnapchat,
    socialSource.snapchat_url,
    socialSource.snapchatUrl,
    socialSource.snapchat_link,
    socialSource.snapchatLink,
    socialSource.snapchat,
    socialSource.snap_url,
    socialSource.snapUrl,
    socialSource.snap_link,
    socialSource.snapLink,
    socialSource.snap,
  ])
  const normalizedWhatsappUrl = resolveSocialUrlFromSettings(source, ['whatsapp', 'wa'], [
    source.social_whatsapp,
    source.socialWhatsapp,
    source.whatsapp_url,
    source.whatsappUrl,
    source.whatsapp_link,
    source.whatsappLink,
    source.whatsapp,
    source.wa_url,
    source.waUrl,
    source.wa_link,
    source.waLink,
    source.wa,
    socialSource.social_whatsapp,
    socialSource.socialWhatsapp,
    socialSource.whatsapp_url,
    socialSource.whatsappUrl,
    socialSource.whatsapp_link,
    socialSource.whatsappLink,
    socialSource.whatsapp,
    socialSource.wa_url,
    socialSource.waUrl,
    socialSource.wa_link,
    socialSource.waLink,
    socialSource.wa,
  ])
  const rawMapUrl = firstString(
    [
      source.map_url,
      source.mapUrl,
      source.map_embed_url,
      source.mapEmbedUrl,
      source.contact_map_url,
      source.contactMapUrl,
    ],
    '',
  ).trim()

  let mapUrl = ''
  if (rawMapUrl) {
    if (/^<iframe/i.test(rawMapUrl)) {
      const iframeMatch = rawMapUrl.match(/src\s*=\s*["']([^"']+)["']/i)
      if (iframeMatch?.[1]) {
        mapUrl = iframeMatch[1].replace(/&amp;/g, '&').trim()
      }
    } else if (/^(?:https?:)?\/\//i.test(rawMapUrl)) {
      mapUrl = rawMapUrl
    }
  }

  return {
    siteName: firstString([source.site_name, source.siteName], ''),
    siteNameAr: firstString([source.site_name_ar, source.siteNameAr], ''),
    siteDescription: firstString([source.site_description, source.siteDescription], ''),
    siteDescriptionAr: firstString([source.site_description_ar, source.siteDescriptionAr], ''),
    homeHeroTagline: firstString([source.home_tagline, source.homeHeroTagline, source.hero_tagline, source.heroTagline], ''),
    homeHeroTaglineAr: firstString(
      [source.home_tagline_ar, source.homeHeroTaglineAr, source.hero_tagline_ar, source.heroTaglineAr],
      '',
    ),
    homeHeroDescription: firstString(
      [source.home_description, source.homeHeroDescription, source.hero_description, source.heroDescription],
      '',
    ),
    homeHeroDescriptionAr: firstString(
      [source.home_description_ar, source.homeHeroDescriptionAr, source.hero_description_ar, source.heroDescriptionAr],
      '',
    ),
    contactEmail: firstString([source.contact_email, source.contactEmail, source.email, source.support_email], ''),
    contactPhone: firstString([source.contact_phone, source.contactPhone, source.phone, source.mobile], ''),
    contactAddress: firstString(
      [
        source.address,
        source.contact_address,
        source.contactAddress,
        source.full_address,
        source.location,
        source.street_address,
        source.city,
        source.state,
      ],
      '',
    ),
    contactAddressAr: firstString(
      [
        source.address_ar,
        source.contact_address_ar,
        source.contactAddressAr,
        source.full_address_ar,
        source.location_ar,
        source.street_address_ar,
        source.city_ar,
        source.state_ar,
      ],
      '',
    ),
    mapUrl,
    mapQuery: firstString(
      [
        source.map_query,
        source.mapQuery,
        source.map_location,
        source.mapLocation,
        source.address,
        source.contact_address,
        source.contactAddress,
      ],
      '',
    ),
    mapQueryAr: firstString(
      [
        source.map_query_ar,
        source.mapQueryAr,
        source.map_location_ar,
        source.mapLocationAr,
        source.address_ar,
        source.contact_address_ar,
        source.contactAddressAr,
      ],
      '',
    ),
    facebookUrl: normalizedFacebookUrl,
    instagramUrl: normalizedInstagramUrl,
    linkedinUrl: normalizedLinkedinUrl,
    twitterUrl: normalizedTwitterUrl,
    xUrl: normalizedXUrl,
    youtubeUrl: normalizedYoutubeUrl,
    tiktokUrl: normalizedTiktokUrl,
    snapchatUrl: normalizedSnapchatUrl,
    whatsappUrl: normalizedWhatsappUrl,
    logoUrl: resolveAssetUrl(source.logo ?? source.logo_url, ''),
    faqJson: firstString([source.faq_json, source.faqJson, source.faq_data, source.faqData], ''),
    faqJsonAr: firstString([source.faq_json_ar, source.faqJsonAr, source.faq_data_ar, source.faqDataAr], ''),
    faqContent: firstString([source.faq_content, source.faqContent], ''),
    faqContentAr: firstString([source.faq_content_ar, source.faqContentAr], ''),
    privacyContent: firstString([source.privacy_content, source.privacyContent], ''),
    privacyContentAr: firstString([source.privacy_content_ar, source.privacyContentAr], ''),
    termsContent: firstString([source.terms_content, source.termsContent], ''),
    termsContentAr: firstString([source.terms_content_ar, source.termsContentAr], ''),
    aboutTitle: firstString([source.about_title, source.aboutTitle], ''),
    aboutTitleAr: firstString([source.about_title_ar, source.aboutTitleAr], ''),
    aboutContent: firstString([source.about_content, source.aboutContent], ''),
    aboutContentAr: firstString([source.about_content_ar, source.aboutContentAr], ''),
    aboutImage: resolveAssetUrl(source.about_image, ''),
    aboutFeature1: firstString([source.about_feature_1, source.aboutFeature1], ''),
    aboutFeature1Ar: firstString([source.about_feature_1_ar, source.aboutFeature1Ar], ''),
    aboutFeature2: firstString([source.about_feature_2, source.aboutFeature2], ''),
    aboutFeature2Ar: firstString([source.about_feature_2_ar, source.aboutFeature2Ar], ''),
    aboutFeature3: firstString([source.about_feature_3, source.aboutFeature3], ''),
    aboutFeature3Ar: firstString([source.about_feature_3_ar, source.aboutFeature3Ar], ''),
    ourVision: firstString([source.our_vision, source.ourVision], ''),
    ourVisionAr: firstString([source.our_vision_ar, source.ourVisionAr], ''),
    ourMission: firstString([source.our_mission, source.ourMission], ''),
    ourMissionAr: firstString([source.our_mission_ar, source.ourMissionAr], ''),
    statPartners: firstString([source.stat_partners, source.statPartners], ''),
    statPartnersAr: firstString([source.stat_partners_ar, source.statPartnersAr], ''),
    statCustomers: firstString([source.stat_customers, source.statCustomers], ''),
    statCustomersAr: firstString([source.stat_customers_ar, source.statCustomersAr], ''),
    statPartnersCount: firstString([source.stat_partners_count, source.statPartnersCount], ''),
    statPartnersCountAr: firstString([source.stat_partners_count_ar, source.statPartnersCountAr], ''),
    statDailyOrders: firstString([source.stat_daily_orders, source.statDailyOrders], ''),
    statDailyOrdersAr: firstString([source.stat_daily_orders_ar, source.statDailyOrdersAr], ''),
    weTrustTitle: firstString([source.we_trust_title, source.weTrustTitle], ''),
    weTrustTitleAr: firstString([source.we_trust_title_ar, source.weTrustTitleAr], ''),
    weTrustContent: firstString([source.we_trust_content, source.weTrustContent], ''),
    weTrustContentAr: firstString([source.we_trust_content_ar, source.weTrustContentAr], ''),
    weTrustImage: resolveAssetUrl(source.we_trust_image ?? source.weTrustImage, ''),
    weTrustImageTitle: firstString([source.we_trust_image_title, source.weTrustImageTitle], ''),
    weTrustImageTitleAr: firstString([source.we_trust_image_title_ar, source.weTrustImageTitleAr], ''),
    aboutBreadcrumbHome: optionalString([source.about_breadcrumb_home, source.aboutBreadcrumbHome]),
    aboutBreadcrumbHomeAr: optionalString([source.about_breadcrumb_home_ar, source.aboutBreadcrumbHomeAr]),
    aboutBreadcrumbCurrent: optionalString([source.about_breadcrumb_current, source.aboutBreadcrumbCurrent]),
    aboutBreadcrumbCurrentAr: optionalString([source.about_breadcrumb_current_ar, source.aboutBreadcrumbCurrentAr]),
    aboutHeroBadge: optionalString([source.about_hero_badge, source.aboutHeroBadge]),
    aboutHeroBadgeAr: optionalString([source.about_hero_badge_ar, source.aboutHeroBadgeAr]),
    aboutHeroTitle: optionalString([source.about_hero_title, source.aboutHeroTitle]),
    aboutHeroTitleAr: optionalString([source.about_hero_title_ar, source.aboutHeroTitleAr]),
    aboutHeroDescription: optionalString([source.about_hero_description, source.aboutHeroDescription]),
    aboutHeroDescriptionAr: optionalString([source.about_hero_description_ar, source.aboutHeroDescriptionAr]),
    aboutHeroPrimaryCta: optionalString([source.about_hero_primary_cta, source.aboutHeroPrimaryCta, source.about_cta_primary, source.aboutCtaPrimary]),
    aboutHeroPrimaryCtaAr: optionalString([source.about_hero_primary_cta_ar, source.aboutHeroPrimaryCtaAr, source.about_cta_primary_ar, source.aboutCtaPrimaryAr]),
    aboutHeroSecondaryCta: optionalString([source.about_hero_secondary_cta, source.aboutHeroSecondaryCta, source.about_cta_secondary, source.aboutCtaSecondary]),
    aboutHeroSecondaryCtaAr: optionalString([source.about_hero_secondary_cta_ar, source.aboutHeroSecondaryCtaAr, source.about_cta_secondary_ar, source.aboutCtaSecondaryAr]),
    aboutStoryTag: optionalString([source.about_story_tag, source.aboutStoryTag]),
    aboutStoryTagAr: optionalString([source.about_story_tag_ar, source.aboutStoryTagAr]),
    aboutStoryTitle: optionalString([source.about_story_title, source.aboutStoryTitle]),
    aboutStoryTitleAr: optionalString([source.about_story_title_ar, source.aboutStoryTitleAr]),
    aboutStoryDescription: optionalString([source.about_story_description, source.aboutStoryDescription]),
    aboutStoryDescriptionAr: optionalString([source.about_story_description_ar, source.aboutStoryDescriptionAr]),
    aboutVisionTitle: optionalString([source.about_vision_title, source.aboutVisionTitle]),
    aboutVisionTitleAr: optionalString([source.about_vision_title_ar, source.aboutVisionTitleAr]),
    aboutMissionTitle: optionalString([source.about_mission_title, source.aboutMissionTitle]),
    aboutMissionTitleAr: optionalString([source.about_mission_title_ar, source.aboutMissionTitleAr]),
    aboutWhyTag: optionalString([source.about_why_tag, source.aboutWhyTag]),
    aboutWhyTagAr: optionalString([source.about_why_tag_ar, source.aboutWhyTagAr]),
    aboutWhyTitle: optionalString([source.about_why_title, source.aboutWhyTitle]),
    aboutWhyTitleAr: optionalString([source.about_why_title_ar, source.aboutWhyTitleAr]),
    aboutWhyDescription: optionalString([source.about_why_description, source.aboutWhyDescription]),
    aboutWhyDescriptionAr: optionalString([source.about_why_description_ar, source.aboutWhyDescriptionAr]),
    aboutFeature1Title: optionalString([source.about_feature_1_title, source.aboutFeature1Title]),
    aboutFeature1TitleAr: optionalString([source.about_feature_1_title_ar, source.aboutFeature1TitleAr]),
    aboutFeature2Title: optionalString([source.about_feature_2_title, source.aboutFeature2Title]),
    aboutFeature2TitleAr: optionalString([source.about_feature_2_title_ar, source.aboutFeature2TitleAr]),
    aboutFeature3Title: optionalString([source.about_feature_3_title, source.aboutFeature3Title]),
    aboutFeature3TitleAr: optionalString([source.about_feature_3_title_ar, source.aboutFeature3TitleAr]),
    aboutFeature4: optionalString([source.about_feature_4, source.aboutFeature4]),
    aboutFeature4Ar: optionalString([source.about_feature_4_ar, source.aboutFeature4Ar]),
    aboutFeature4Title: optionalString([source.about_feature_4_title, source.aboutFeature4Title]),
    aboutFeature4TitleAr: optionalString([source.about_feature_4_title_ar, source.aboutFeature4TitleAr]),
    aboutStatRestaurantsLabel: optionalString([source.about_stat_restaurants_label, source.aboutStatRestaurantsLabel]),
    aboutStatRestaurantsLabelAr: optionalString([source.about_stat_restaurants_label_ar, source.aboutStatRestaurantsLabelAr]),
    aboutStatYearsLabel: optionalString([source.about_stat_years_label, source.aboutStatYearsLabel]),
    aboutStatYearsLabelAr: optionalString([source.about_stat_years_label_ar, source.aboutStatYearsLabelAr]),
    aboutStatCustomersLabel: optionalString([source.about_stat_customers_label, source.aboutStatCustomersLabel]),
    aboutStatCustomersLabelAr: optionalString([source.about_stat_customers_label_ar, source.aboutStatCustomersLabelAr]),
    aboutStatPartnersLabel: optionalString([source.about_stat_partners_label, source.aboutStatPartnersLabel]),
    aboutStatPartnersLabelAr: optionalString([source.about_stat_partners_label_ar, source.aboutStatPartnersLabelAr]),
    aboutStatOrdersLabel: optionalString([source.about_stat_orders_label, source.aboutStatOrdersLabel]),
    aboutStatOrdersLabelAr: optionalString([source.about_stat_orders_label_ar, source.aboutStatOrdersLabelAr]),
    aboutExperienceYears: optionalString([source.about_experience_years, source.aboutExperienceYears, source.about_years_experience, source.aboutYearsExperience]),
    aboutExperienceYearsAr: optionalString([source.about_experience_years_ar, source.aboutExperienceYearsAr, source.about_years_experience_ar, source.aboutYearsExperienceAr]),
    aboutRatingValue: optionalString([source.about_rating_value, source.aboutRatingValue, source.rating_value, source.ratingValue]),
    aboutRatingValueAr: optionalString([source.about_rating_value_ar, source.aboutRatingValueAr, source.rating_value_ar, source.ratingValueAr]),
    aboutRatingLabel: optionalString([source.about_rating_label, source.aboutRatingLabel]),
    aboutRatingLabelAr: optionalString([source.about_rating_label_ar, source.aboutRatingLabelAr]),
  }
}

function normalizePromotionDiscountType(value: unknown): PromotionDiscountType {
  const normalized = firstString([value], '').trim().toLowerCase()
  if (normalized === 'percentage' || normalized === 'percent') return 'percentage'
  if (normalized === 'fixed' || normalized === 'amount') return 'fixed'
  return 'unknown'
}

function normalizePromotion(payload: unknown, index: number): Promotion {
  const source = extractObject(payload)
  const discountType = normalizePromotionDiscountType(source.discount_type ?? source.discountType)
  const imageUrl = resolveAssetUrl(
    source.image_url ??
      source.imageUrl ??
      source.image ??
      source.banner_url ??
      source.bannerUrl ??
      source.banner ??
      source.cover_url ??
      source.coverUrl ??
      source.cover ??
      source.thumbnail_url ??
      source.thumbnailUrl ??
      source.thumbnail,
    '',
  )

  return {
    id: normalizeId(source.id, `promotion-${index + 1}`),
    code: firstString([source.code], ''),
    description: firstString([source.description, source.title, source.name], ''),
    descriptionAr: firstString([source.description_ar, source.descriptionAr, source.title_ar, source.name_ar], ''),
    imageUrl: imageUrl || undefined,
    discountType,
    discountValue: Math.max(0, toNumber(source.discount_value ?? source.discountValue, 0)),
    minimumOrder: Math.max(0, toNumber(source.minimum_order ?? source.minimumOrder, 0)),
    maxDiscount: Math.max(0, toNumber(source.max_discount ?? source.maxDiscount, 0)),
    isActive: toBoolean(source.is_active ?? source.isActive, true),
    validFrom: optionalString([source.valid_from, source.validFrom]),
    validUntil: optionalString([source.valid_until, source.validUntil]),
  }
}

function normalizePromotions(payload: unknown): Promotion[] {
  const rows = extractArray(payload, ['promotions', 'items'])
  if (rows.length > 0) {
    return rows.map((entry, index) => normalizePromotion(entry, index)).filter((promotion) => promotion.code.trim())
  }

  const single = extractObject(payload)
  if (Object.keys(single).length > 0) {
    const promotion = normalizePromotion(single, 0)
    return promotion.code.trim() ? [promotion] : []
  }

  return []
}

function normalizeFaq(payload: unknown, index: number): Faq {
  const source = extractObject(payload)

  const question = firstString([source.question, source.title, source.q], '')
  const questionAr = firstString(
    [source.question_ar, source.questionAr, source.title_ar, source.titleAr, source.q_ar, source.qAr],
    '',
  )
  const answer = firstString([source.answer, source.content, source.body, source.a], '')
  const answerAr = firstString(
    [source.answer_ar, source.answerAr, source.content_ar, source.contentAr, source.body_ar, source.bodyAr, source.a_ar, source.aAr],
    '',
  )

  return {
    id: normalizeId(source.id ?? source.faq_id ?? source.faqId, `faq-${index + 1}`),
    question: question || questionAr,
    questionAr: questionAr || question,
    answer: answer || answerAr,
    answerAr: answerAr || answer,
    order: Math.max(0, Math.round(toNumber(source.order ?? source.sort_order ?? source.position, index + 1))),
    isActive: toBoolean(source.is_active ?? source.isActive ?? source.active ?? source.enabled, true),
    createdAt: optionalString([source.created_at, source.createdAt]),
    updatedAt: optionalString([source.updated_at, source.updatedAt]),
  }
}

function normalizeFaqs(payload: unknown): Faq[] {
  const rows = extractArray(payload, ['faqs', 'items', 'data'])
  const mappedRows =
    rows.length > 0 ? rows.map((entry, index) => normalizeFaq(entry, index)) : [normalizeFaq(payload, 0)]

  const filtered = mappedRows.filter((faq) => faq.question.trim() && faq.answer.trim())
  if (!filtered.length) return []

  const deduped = new Map<string, Faq>()
  for (const faq of filtered) {
    if (!deduped.has(faq.id)) deduped.set(faq.id, faq)
  }

  return Array.from(deduped.values()).sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
}

function normalizePromoValidation(payload: unknown, subtotal = 0): PromoValidationResult {
  const root = extractObject(payload)
  const rootData = extractObject(root.data)

  const promotionRoot =
    (isRecord(root.promotion) ? root.promotion : null) ??
    (isRecord(root.promo) ? root.promo : null) ??
    (isRecord(root.coupon) ? root.coupon : null)
  const promotionData =
    (isRecord(rootData.promotion) ? rootData.promotion : null) ??
    (isRecord(rootData.promo) ? rootData.promo : null) ??
    (isRecord(rootData.coupon) ? rootData.coupon : null)
  const promotion = promotionData ?? promotionRoot ?? {}

  const discountType = normalizePromotionDiscountType(
    promotion.discount_type ?? promotion.discountType ?? root.discount_type ?? rootData.discount_type,
  )
  const discountValue = Math.max(
    0,
    toNumber(
      root.discount_value ??
        rootData.discount_value ??
        promotion.discount_value ??
        promotion.discountValue,
      0,
    ),
  )
  const maxDiscount = Math.max(
    0,
    toNumber(
      root.max_discount ??
        rootData.max_discount ??
        promotion.max_discount ??
        promotion.maxDiscount,
      0,
    ),
  )
  const minimumOrder = Math.max(
    0,
    toNumber(
      root.minimum_order ??
        rootData.minimum_order ??
        promotion.minimum_order ??
        promotion.minimumOrder,
      0,
    ),
  )
  const effectiveSubtotal = Math.max(
    0,
    toNumber(root.subtotal ?? rootData.subtotal, subtotal),
  )

  let discount = Math.max(
    0,
    toNumber(root.discount ?? root.discount_amount ?? root.amount ?? rootData.discount ?? rootData.discount_amount, 0),
  )

  if (discount <= 0 && discountValue > 0 && effectiveSubtotal >= minimumOrder) {
    if (discountType === 'percentage') {
      discount = (effectiveSubtotal * discountValue) / 100
      if (maxDiscount > 0) {
        discount = Math.min(discount, maxDiscount)
      }
    } else if (discountType === 'fixed') {
      discount = discountValue
    }
  }

  discount = Math.max(0, Number(discount.toFixed(2)))

  const validDefault = discount > 0 || (discountValue > 0 && effectiveSubtotal >= minimumOrder)

  const valid = toBoolean(root.valid ?? root.is_valid ?? root.success ?? rootData.valid ?? rootData.success, validDefault)
  const message = optionalString([root.message, rootData.message])

  return { valid, discount, message }
}

function normalizeDeliveryCheck(payload: unknown): RestaurantDeliveryCheckResult {
  const root = extractObject(payload)
  const rootData = extractObject(root.data)
  const branchRoot = isRecord(root.branch) ? root.branch : null
  const branchData = isRecord(rootData.branch) ? rootData.branch : null

  const available = toBoolean(
    root.available ??
      root.is_available ??
      root.deliverable ??
      root.can_deliver ??
      root.in_range ??
      root.success ??
      rootData.available ??
      rootData.is_available ??
      rootData.deliverable ??
      rootData.can_deliver ??
      rootData.in_range ??
      rootData.success,
    true,
  )

  const feeValue = toNumber(
    root.fee ??
      root.delivery_price ??
      root.delivery_fee ??
      root.shipping_fee ??
      rootData.fee ??
      rootData.delivery_price ??
      rootData.delivery_fee ??
      rootData.shipping_fee,
    Number.NaN,
  )
  const etaMinValue = toNumber(
    root.eta_min ??
      root.delivery_time_min ??
      rootData.eta_min ??
      rootData.delivery_time_min,
    Number.NaN,
  )
  const etaMaxValue = toNumber(
    root.eta_max ??
      root.delivery_time_max ??
      rootData.eta_max ??
      rootData.delivery_time_max,
    Number.NaN,
  )

  return {
    available,
    message: optionalString([root.message, rootData.message]),
    branchId: optionalString([root.branch_id, rootData.branch_id, branchData?.id, branchRoot?.id]),
    fee: Number.isFinite(feeValue) ? Math.max(0, feeValue) : undefined,
    etaMin: Number.isFinite(etaMinValue) ? Math.max(0, Math.round(etaMinValue)) : undefined,
    etaMax: Number.isFinite(etaMaxValue) ? Math.max(0, Math.round(etaMaxValue)) : undefined,
  }
}

function validatePromoCodeFallback(payload: { code: string }): PromoValidationResult {
  const code = payload.code.trim().toUpperCase()
  if (code === 'SAVE10' || code === 'OFF10') {
    return { valid: true, discount: 10 }
  }
  return { valid: false, discount: 0 }
}

async function withFallback<T>(liveCall: () => Promise<T>, fallbackCall: () => Promise<T>): Promise<T> {
  if (!LIVE_ENABLED) return fallbackCall()
  try {
    return await liveCall()
  } catch (error) {
    if (!HYBRID_ENABLED) throw error
    return fallbackCall()
  }
}

async function withOptionalLiveFallback<T>(liveCall: () => Promise<T>, fallbackCall: () => Promise<T>): Promise<T> {
  if (!LIVE_ENABLED) return fallbackCall()
  try {
    return await liveCall()
  } catch (error) {
    if (API_LOG_ENABLED) {
      console.warn('[API OPTIONAL FEATURE FALLBACK]', error)
    }
    return fallbackCall()
  }
}

type TimedCacheEntry = {
  value: unknown
  expiresAt: number
}

const LOCATION_REQUEST_CACHE = new Map<string, TimedCacheEntry>()
const LOCATION_REQUESTS_IN_FLIGHT = new Map<string, Promise<unknown>>()
const LOCATION_STATES_CACHE_TTL_MS = 60_000
const LOCATION_RESTAURANT_STATES_CACHE_TTL_MS = 45_000
const LOCATION_STATE_CITIES_CACHE_TTL_MS = 60_000
const LOCATION_CITY_BY_ID_CACHE_TTL_MS = 120_000

function pruneExpiredLocationCache(now = Date.now()): void {
  for (const [key, entry] of LOCATION_REQUEST_CACHE.entries()) {
    if (entry.expiresAt <= now) {
      LOCATION_REQUEST_CACHE.delete(key)
    }
  }
}

function buildLocationCacheKey(scope: string, value = ''): string {
  const normalizedValue = value.trim().toLowerCase()
  return normalizedValue ? `${scope}:${normalizedValue}` : scope
}

function buildLocalizedLocationCacheKey(scope: string, value = ''): string {
  const lang = detectUiLang()
  const normalizedValue = value.trim().toLowerCase()
  return normalizedValue ? `${scope}:${lang}:${normalizedValue}` : `${scope}:${lang}`
}

async function runLocationCachedRequest<T>(
  cacheKey: string,
  request: () => Promise<T>,
  ttlMs: number,
): Promise<T> {
  const now = Date.now()
  pruneExpiredLocationCache(now)

  const cachedEntry = LOCATION_REQUEST_CACHE.get(cacheKey)
  if (cachedEntry && cachedEntry.expiresAt > now) {
    return cachedEntry.value as T
  }

  const inFlight = LOCATION_REQUESTS_IN_FLIGHT.get(cacheKey)
  if (inFlight) {
    return inFlight as Promise<T>
  }

  const safeTtlMs = Math.max(1, ttlMs)
  const pending = request()
    .then((result) => {
      LOCATION_REQUEST_CACHE.set(cacheKey, {
        value: result,
        expiresAt: Date.now() + safeTtlMs,
      })
      return result
    })
    .finally(() => {
      LOCATION_REQUESTS_IN_FLIGHT.delete(cacheKey)
    })

  LOCATION_REQUESTS_IN_FLIGHT.set(cacheKey, pending as Promise<unknown>)
  return pending
}

function withResourceId(path: string, id: string): string {
  if (path.includes('{id}')) {
    return path.replaceAll('{id}', encodeURIComponent(id))
  }
  const normalizedPath = normalizeOptionalPath(path)
  return `${normalizedPath.replace(/\/+$/, '')}/${encodeURIComponent(id)}`
}

function withTemplateParams(path: string, params: Record<string, string>): string {
  let output = normalizeOptionalPath(path)
  for (const [key, value] of Object.entries(params)) {
    output = output.replaceAll(`{${key}}`, encodeURIComponent(value))
  }
  return output
}

async function getHomeLive(): Promise<{ kitchens: Kitchen[]; mostOrdered: Restaurant[]; suggested: Brand[] }> {
  const restaurants = (await getRestaurantsLive({ page: 1, pageSize: 12 })).items

  let categories: Category[] = []
  try {
    categories = await getCategoriesLive()
  } catch {
    categories = []
  }

  let sliderRows: unknown[] = []
  try {
    const slidersResponse = await requestJson<unknown>('/sliders', { auth: false })
    sliderRows = extractArray(slidersResponse, ['sliders', 'items'])
  } catch {
    sliderRows = []
  }

  const kitchens =
    sliderRows.length > 0
      ? sliderRows.map((entry, idx) => normalizeKitchenFromSlider(entry, idx))
      : categories.length > 0
        ? categories.slice(0, 6).map((category, idx) => ({
            id: category.id || `kitchen-${idx + 1}`,
            title: category.name,
            titleAr: category.nameAr,
            titleEn: category.nameEn,
            subtitle: category.name,
            subtitleAr: category.nameAr,
            subtitleEn: category.nameEn,
            imageUrl: category.imageUrl,
          }))
        : restaurants.slice(0, 6).map((restaurant, idx) => ({
            id: `kitchen-${idx + 1}`,
            title: restaurant.cuisine,
            titleAr: restaurant.cuisineAr ?? restaurant.cuisine,
            titleEn: restaurant.cuisineEn ?? restaurant.cuisine,
            subtitle: restaurant.name,
            subtitleAr: restaurant.nameAr ?? restaurant.name,
            subtitleEn: restaurant.nameEn ?? restaurant.name,
            imageUrl: restaurant.coverUrl,
          }))

  return {
    kitchens,
    mostOrdered: restaurants,
    suggested: restaurants.slice(-5).map(normalizeBrandFromRestaurant),
  }
}

async function getCategoriesLive(): Promise<Category[]> {
  const response = await requestJson<unknown>('/categories', { auth: false })
  const rows = extractArray(response, ['categories', 'items'])
  return rows.map((entry, idx) => normalizeCategory(entry, idx))
}

async function getCuisineTypesLive(): Promise<CuisineType[]> {
  const response = await requestJson<unknown>('/cuisine-types', { auth: false })
  const rows = extractArray(response, ['cuisine_types', 'items'])
  return rows.map((entry, idx) => normalizeCuisineType(entry, idx))
}

async function getRestaurantsLive(query: RestaurantsQuery): Promise<{ items: Restaurant[]; total: number }> {
  const categoryIdsParam = query.categoryIds?.join(',')
  const categoryNamesParam = query.categoryNames?.join(',')
  const cuisineKeysParam = query.cuisineKeys?.join(',')
  const cuisineLabelsParam = query.cuisineLabels?.join(',')
  const searchTerm = typeof query.search === 'string' ? query.search.trim() : ''
  const addressTerm = typeof query.address === 'string' ? query.address.trim() : ''
  const hasSearchTerm = searchTerm.length > 0
  const hasAddressTerm = addressTerm.length > 0
  const hasGeoCoordinates =
    typeof query.latitude === 'number' &&
    Number.isFinite(query.latitude) &&
    typeof query.longitude === 'number' &&
    Number.isFinite(query.longitude)
  const shouldUseSearchEndpoint = hasSearchTerm || hasAddressTerm || hasGeoCoordinates
  const baseQuery: Record<string, unknown> = {
    search: searchTerm || undefined,
    address: addressTerm || undefined,
    location: addressTerm || undefined,
    page: query.page,
    per_page: query.pageSize,
    latitude: hasGeoCoordinates ? query.latitude : undefined,
    longitude: hasGeoCoordinates ? query.longitude : undefined,
    lat: hasGeoCoordinates ? query.latitude : undefined,
    lng: hasGeoCoordinates ? query.longitude : undefined,
    category_ids: categoryIdsParam,
    categories: categoryIdsParam,
    category: categoryIdsParam,
    category_names: categoryNamesParam,
    cuisine_types: cuisineKeysParam,
    cuisine_keys: cuisineKeysParam,
    cuisines: cuisineKeysParam,
    cuisine_labels: cuisineLabelsParam,
    min_rating: query.minRating ?? undefined,
    open_now: query.openNow === true ? 1 : query.openNow === false ? 0 : undefined,
    sort_by: query.sortBy && query.sortBy !== 'recommended' ? query.sortBy : undefined,
  }

  let response: unknown | null = null
  let usedSearchEndpoint = false
  let fetchedRestaurantsEndpoint = false
  let serverSearchSatisfied = false
  let appliedSearchFallbackFilter = false
  let appliedAddressFallbackFilter = false
  const searchNeedles = hasSearchTerm ? buildFilterNeedles(searchTerm.split(/\s+/).filter(Boolean)) : []
  const addressNeedles = buildFilterNeedles(addressTerm ? [addressTerm] : undefined)

  function matchesSearchNeedles(candidates: string[]): boolean {
    if (!searchNeedles.length) return true

    const normalizedCandidates = candidates
      .map((value) => normalizeFilterValue(value))
      .filter(Boolean)

    if (!normalizedCandidates.length) return false

    return searchNeedles.every((needle) => normalizedCandidates.some((candidate) => candidate.includes(needle)))
  }

  function applySearchFallbackFilter(sourceItems: Restaurant[]): Restaurant[] {
    if (!searchNeedles.length) return sourceItems
    appliedSearchFallbackFilter = true
    return sourceItems.filter((restaurant) =>
      matchesSearchNeedles(
        [
          restaurant.name,
          restaurant.nameAr ?? '',
          restaurant.cuisine,
          restaurant.address ?? '',
          restaurant.addressAr ?? '',
          restaurant.city ?? '',
          restaurant.description ?? '',
          restaurant.descriptionAr ?? '',
          ...restaurant.tags,
        ],
      ),
    )
  }

  if (shouldUseSearchEndpoint) {
    const searchQuery: Record<string, unknown> = {
      search: hasSearchTerm ? searchTerm : hasAddressTerm ? addressTerm : undefined,
      query: hasSearchTerm ? searchTerm : hasAddressTerm ? addressTerm : undefined,
      q: hasSearchTerm ? searchTerm : hasAddressTerm ? addressTerm : undefined,
      address: hasAddressTerm ? addressTerm : undefined,
      location: hasAddressTerm ? addressTerm : undefined,
      page: query.page,
      per_page: query.pageSize,
      latitude: hasGeoCoordinates ? query.latitude : undefined,
      longitude: hasGeoCoordinates ? query.longitude : undefined,
      lat: hasGeoCoordinates ? query.latitude : undefined,
      lng: hasGeoCoordinates ? query.longitude : undefined,
      category_ids: categoryIdsParam,
      categories: categoryIdsParam,
      category: categoryIdsParam,
      category_names: categoryNamesParam,
      cuisine_types: cuisineKeysParam,
      cuisine_keys: cuisineKeysParam,
      cuisines: cuisineKeysParam,
      cuisine_labels: cuisineLabelsParam,
      min_rating: query.minRating ?? undefined,
      open_now: query.openNow === true ? 1 : query.openNow === false ? 0 : undefined,
      sort_by: query.sortBy && query.sortBy !== 'recommended' ? query.sortBy : undefined,
    }
    response = await tryRequestJson<unknown>('/restaurants/search', {
      auth: false,
      query: searchQuery,
    })
    usedSearchEndpoint = response !== null
  }

  if (response === null) {
    response = await requestJson<unknown>('/restaurants', {
      auth: false,
      query: baseQuery,
    })
    fetchedRestaurantsEndpoint = true
  }

  let items = extractArray(response, ['data', 'restaurants', 'items']).map((entry, idx) => normalizeRestaurant(entry, idx))
  if (hasSearchTerm && items.length > 0 && (usedSearchEndpoint || fetchedRestaurantsEndpoint)) {
    serverSearchSatisfied = true
  }

  const shouldRetryWithRestaurantsEndpoint =
    items.length === 0 &&
    usedSearchEndpoint &&
    !fetchedRestaurantsEndpoint &&
    (hasSearchTerm || hasAddressTerm || hasGeoCoordinates)

  if (shouldRetryWithRestaurantsEndpoint) {
    const fallbackQueries: Record<string, unknown>[] = [baseQuery]
    if (hasSearchTerm) {
      fallbackQueries.push({
        ...baseQuery,
        search: undefined,
      })
    }

    for (const fallbackQuery of fallbackQueries) {
      const fallbackResponse = await tryRequestJson<unknown>('/restaurants', {
        auth: false,
        query: fallbackQuery,
      })
      if (fallbackResponse === null) continue

      response = fallbackResponse
      items = extractArray(fallbackResponse, ['data', 'restaurants', 'items']).map((entry, idx) =>
        normalizeRestaurant(entry, idx),
      )

      if (fallbackQuery.search && items.length > 0) {
        serverSearchSatisfied = true
      }

      if (items.length > 0) break
    }
  }

  if (addressNeedles.length && !hasGeoCoordinates) {
    const canFilterByAddress = items.some((restaurant) =>
      [restaurant.address, restaurant.addressAr, restaurant.city]
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        .length > 0,
    )

    if (canFilterByAddress) {
      appliedAddressFallbackFilter = true
      items = items.filter((restaurant) =>
        matchesNeedles(
          [
            restaurant.address ?? '',
            restaurant.addressAr ?? '',
            restaurant.city ?? '',
          ],
          addressNeedles,
        ),
      )
    }
  }

  const categoryNeedles = buildFilterNeedles(query.categoryIds, query.categoryNames)
  const cuisineNeedles = buildFilterNeedles(query.cuisineKeys, query.cuisineLabels)
  let appliedCategoryFallbackFilter = false
  let appliedCuisineFallbackFilter = false

  if (hasSearchTerm && !serverSearchSatisfied) {
    items = applySearchFallbackFilter(items)
  }

  if (categoryNeedles.length) {
    const categoryFiltered = applyNeedleFallbackFilter(
      items,
      categoryNeedles,
      (restaurant) => [...restaurant.tags],
    )
    items = categoryFiltered.items
    appliedCategoryFallbackFilter = categoryFiltered.applied
  }

  if (cuisineNeedles.length) {
    const cuisineFiltered = applyNeedleFallbackFilter(
      items,
      cuisineNeedles,
      (restaurant) => [restaurant.cuisine, ...restaurant.tags],
    )
    items = cuisineFiltered.items
    appliedCuisineFallbackFilter = cuisineFiltered.applied
  }

  if (query.minRating) {
    items = items.filter((restaurant) => restaurant.rating >= query.minRating!)
  }

  let appliedOpenStateFallback = false
  if (query.openNow === true) {
    if (items.some((restaurant) => !restaurant.isOpen)) {
      appliedOpenStateFallback = true
    }
    items = items.filter((restaurant) => restaurant.isOpen)
  } else if (query.openNow === false) {
    if (items.some((restaurant) => restaurant.isOpen)) {
      appliedOpenStateFallback = true
    }
    items = items.filter((restaurant) => !restaurant.isOpen)
  }

  if (query.sortBy === 'rating') {
    items = [...items].sort((a, b) => b.rating - a.rating)
  } else if (query.sortBy === 'orders') {
    items = [...items].sort((a, b) => b.ordersCount - a.ordersCount)
  }

  const hasClientFallbackFilters =
    appliedCategoryFallbackFilter ||
    appliedCuisineFallbackFilter ||
    appliedOpenStateFallback ||
    appliedSearchFallbackFilter ||
    appliedAddressFallbackFilter

  return {
    items,
    total: hasClientFallbackFilters ? items.length : extractTotal(response, items.length),
  }
}

async function getRestaurantByIdLive(id: string): Promise<Restaurant | null> {
  const response = await requestJson<unknown>(`/restaurants/${encodeURIComponent(id)}`, { auth: false })
  const record = extractObjectByKeys(response, ['restaurant'])
  if (Object.keys(record).length === 0) return null
  return normalizeRestaurant(record)
}

async function getRestaurantMenuLive(restaurantId: string): Promise<RestaurantMenuData> {
  const encodedId = encodeURIComponent(restaurantId)
  const menuResponse = await tryRequestJson<unknown>(`/restaurants/${encodedId}/menu`, { auth: false })
  if (menuResponse !== null) {
    const normalizedMenu = normalizeMenuPayload(menuResponse, restaurantId)
    if (normalizedMenu.items.length > 0) return enrichMenuCategoriesFromGlobalCategories(normalizedMenu)
  }

  const restaurantResponse = await requestJson<unknown>(`/restaurants/${encodedId}`, { auth: false })
  const restaurantPayload = extractObjectByKeys(restaurantResponse, ['restaurant'])
  const normalizedFromRestaurant = normalizeMenuPayload(restaurantPayload, restaurantId)
  if (normalizedFromRestaurant.items.length > 0) return enrichMenuCategoriesFromGlobalCategories(normalizedFromRestaurant)

  if (menuResponse !== null) return enrichMenuCategoriesFromGlobalCategories(normalizeMenuPayload(menuResponse, restaurantId))
  return enrichMenuCategoriesFromGlobalCategories(normalizeMenuPayload(restaurantResponse, restaurantId))
}

async function getRestaurantBranchesLiveOptional(restaurantId: string): Promise<RestaurantBranch[]> {
  const normalizedRestaurantId = restaurantId.trim()
  if (!normalizedRestaurantId) return []
  let endpointResponded = false
  const backendRestaurantId = toBackendId(normalizedRestaurantId)
  const candidateRestaurantLookups = new Set(
    uniqueStrings([normalizedRestaurantId, String(backendRestaurantId)])
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  )
  const normalizeRestaurantLookup = (value: string): string => value.trim().toLowerCase()
  const isBranchForRequestedRestaurant = (row: RestaurantBranch): boolean => {
    const branchRestaurantId = (row.restaurantId ?? '').trim()
    if (!branchRestaurantId) return true
    return candidateRestaurantLookups.has(normalizeRestaurantLookup(branchRestaurantId))
  }

  const hasBranchArray = (payload: unknown): boolean => {
    const candidates: unknown[] = [payload, unwrapData(payload)]

    for (const candidate of candidates) {
      if (!isRecord(candidate)) continue

      for (const key of BRANCH_ARRAY_KEYS) {
        const value = candidate[key]
        if (Array.isArray(value)) return true
        if (isRecord(value) && Array.isArray(value.data)) return true
      }
    }

    return false
  }

  const parseRestaurantBranchesFromDetails = (payload: unknown): RestaurantBranch[] => {
    const restaurantRecord = extractObjectByKeys(payload, ['restaurant'])
    const rows = extractArrayByKeysOnly(restaurantRecord, BRANCH_ARRAY_KEYS)
    return rows.map((entry, idx) => normalizeBranch(entry, idx))
  }

  const hasRestaurantBranchArray = (payload: unknown): boolean => {
    const restaurantRecord = extractObjectByKeys(payload, ['restaurant'])
    return hasBranchArray(restaurantRecord)
  }

  const collectedBranches = new Map<string, RestaurantBranch>()

  const upsertBranches = (rows: RestaurantBranch[]) => {
    for (const row of rows) {
      if (!isBranchForRequestedRestaurant(row)) continue
      const normalizedId = row.id.trim()
      const fallbackKey = `${row.name.trim().toLowerCase()}|${row.address.trim().toLowerCase()}`
      const key = normalizedId || fallbackKey
      if (!key) continue

      const existing = collectedBranches.get(key)
      if (!existing) {
        collectedBranches.set(key, row)
        continue
      }

      const mergedNeighborhoods = uniqueStrings([
        ...(existing.neighborhoods ?? []),
        ...(row.neighborhoods ?? []),
      ])

      collectedBranches.set(key, {
        ...existing,
        ...row,
        restaurantId: row.restaurantId ?? existing.restaurantId,
        neighborhoods: mergedNeighborhoods.length > 0 ? mergedNeighborhoods : undefined,
      })
    }
  }

  async function requestBranches(path: string, query?: Record<string, unknown>): Promise<RestaurantBranch[] | null> {
    const publicResponse = await tryRequestJson<unknown>(path, {
      auth: false,
      query,
    })
    if (publicResponse !== null) {
      endpointResponded = true
      const rows = normalizeBranchResponse(publicResponse)
      if (rows.length > 0) return rows
      if (hasBranchArray(publicResponse)) {
        return []
      }
    }

    const privateResponse = await tryRequestJson<unknown>(path, { query })
    if (privateResponse !== null) {
      endpointResponded = true
      const rows = normalizeBranchResponse(privateResponse)
      if (rows.length > 0) return rows
      if (hasBranchArray(privateResponse)) {
        return []
      }
    }

    return null
  }

  async function requestRestaurantDetailsBranches(path: string): Promise<RestaurantBranch[] | null> {
    const publicResponse = await tryRequestJson<unknown>(path, { auth: false })
    if (publicResponse !== null) {
      endpointResponded = true
      const rows = parseRestaurantBranchesFromDetails(publicResponse)
      if (rows.length > 0) return rows
      if (hasRestaurantBranchArray(publicResponse)) return []
    }

    const privateResponse = await tryRequestJson<unknown>(path)
    if (privateResponse !== null) {
      endpointResponded = true
      const rows = parseRestaurantBranchesFromDetails(privateResponse)
      if (rows.length > 0) return rows
      if (hasRestaurantBranchArray(privateResponse)) return []
    }

    return null
  }

  for (const template of OPTIONAL_BRANCHES_GET_PATHS) {
    const path = template.includes('{id}') ? withResourceId(template, normalizedRestaurantId) : template
    const rows = await requestBranches(path, { restaurant_id: backendRestaurantId, restaurantId: backendRestaurantId })
    if (rows === null) continue
    if (rows.length > 0) upsertBranches(rows)
  }

  for (const template of OPTIONAL_BRANCHES_NEARBY_PATHS) {
    const path = template.includes('{id}') ? withResourceId(template, normalizedRestaurantId) : template
    const rows = await requestBranches(path, {
      restaurant_id: backendRestaurantId,
      restaurantId: backendRestaurantId,
      latitude: 21.3891,
      longitude: 39.8579,
      lat: 21.3891,
      lng: 39.8579,
    })
    if (rows === null) continue
    if (rows.length > 0) upsertBranches(rows)
  }

  const restaurantDetailsPath = `/restaurants/${encodeURIComponent(normalizedRestaurantId)}`
  const rowsFromRestaurantDetails = await requestRestaurantDetailsBranches(restaurantDetailsPath)
  if (rowsFromRestaurantDetails !== null && rowsFromRestaurantDetails.length > 0) {
    upsertBranches(rowsFromRestaurantDetails)
  }

  const mergedRows = Array.from(collectedBranches.values())
  if (mergedRows.length > 0) return mergedRows

  if (!endpointResponded) {
    throw new Error(localizeApiErrorMessage('Restaurant branches endpoint is unavailable'))
  }

  return []
}

async function getRestaurantStatesLiveOptional(restaurantId: string): Promise<StateOption[]> {
  const normalizedRestaurantId = restaurantId.trim()
  if (!normalizedRestaurantId) return []

  let endpointResponded = false
  const backendRestaurantId = toBackendId(normalizedRestaurantId)
  const candidateRestaurantIds = uniqueStrings(
    [normalizedRestaurantId, String(backendRestaurantId)]
      .map((value) => value.trim())
      .filter(Boolean),
  )

  async function requestStates(path: string, query?: Record<string, unknown>): Promise<StateOption[] | null> {
    const publicResponse = await tryRequestJson<unknown>(path, {
      auth: false,
      query,
    })
    if (publicResponse !== null) {
      endpointResponded = true
      const rows = await normalizeRestaurantStatesPayload(publicResponse)
      if (rows.length > 0) return rows
      if (hasExtractableArray(publicResponse, ['states', 'items', 'data'])) {
        return []
      }
    }

    const privateResponse = await tryRequestJson<unknown>(path, { query })
    if (privateResponse !== null) {
      endpointResponded = true
      const rows = await normalizeRestaurantStatesPayload(privateResponse)
      if (rows.length > 0) return rows
      if (hasExtractableArray(privateResponse, ['states', 'items', 'data'])) {
        return []
      }
    }

    return null
  }

  for (const template of OPTIONAL_RESTAURANT_STATES_PATHS) {
    const includesResourceId = template.includes('{id}')
    const isPrimaryRestaurantStatesPath = normalizeOptionalPath(template) === '/restaurants/{id}/states'
    if (!includesResourceId) {
      const rows = await requestStates(template, {
        restaurant_id: backendRestaurantId,
        restaurantId: backendRestaurantId,
      })
      if (rows === null) continue
      if (isPrimaryRestaurantStatesPath) return rows
      if (rows.length > 0) return rows
      continue
    }

    let resolvedRows: StateOption[] | null = null
    for (const candidateRestaurantId of candidateRestaurantIds) {
      const path = withResourceId(template, candidateRestaurantId)
      const rows = await requestStates(path)
      if (rows === null) continue
      resolvedRows = rows
      if (rows.length > 0) return rows
    }

    if (resolvedRows !== null && isPrimaryRestaurantStatesPath) return resolvedRows
  }

  if (!endpointResponded) {
    throw new Error(localizeApiErrorMessage('Restaurant states endpoint is unavailable'))
  }

  return []
}

async function checkRestaurantDeliveryLiveOptional(
  restaurantId: string,
  stateId: string,
  location?: {
    cityId?: string
    city?: string
    district?: string
  },
): Promise<RestaurantDeliveryCheckResult> {
  const normalizedRestaurantId = restaurantId.trim()
  const normalizedStateId = stateId.trim()
  if (!normalizedRestaurantId || !normalizedStateId) {
    return { available: false }
  }
  const normalizedCityId = (location?.cityId ?? '').trim()
  const normalizedCity = (location?.city ?? '').trim()
  const normalizedDistrict = (location?.district ?? '').trim()

  const normalizeLookup = (value: string): string => value.trim().toLowerCase()
  const backendRestaurantId = toBackendId(normalizedRestaurantId)
  const normalizedStateLookup = normalizeLookup(normalizedStateId)
  let cachedStates: StateOption[] | null = null

  const resolveStateDeliveryFee = async (): Promise<number | undefined> => {
    if (cachedStates === null) {
      cachedStates = await getRestaurantStatesLiveOptional(normalizedRestaurantId).catch(() => [])
    }
    if (!cachedStates.length) return undefined

    const matchedState = cachedStates.find((state) => {
      const stateIdCandidate = normalizeLookup(state.id)
      const stateCodeCandidate = normalizeLookup(state.code ?? '')
      return stateIdCandidate === normalizedStateLookup || stateCodeCandidate === normalizedStateLookup
    })

    if (!matchedState || typeof matchedState.deliveryPrice !== 'number' || !Number.isFinite(matchedState.deliveryPrice)) {
      return undefined
    }

    return Math.max(0, matchedState.deliveryPrice)
  }

  for (const template of OPTIONAL_RESTAURANT_CHECK_DELIVERY_PATHS) {
    const includesResourceId = template.includes('{id}')
    const includesStateId = template.includes('{stateId}')
    const path = withTemplateParams(template, {
      id: normalizedRestaurantId,
      stateId: normalizedStateId,
    })
    const baseQuery =
      includesResourceId && includesStateId
        ? {}
        : {
            restaurant_id: backendRestaurantId,
            restaurantId: backendRestaurantId,
            state_id: normalizedStateId,
            stateId: normalizedStateId,
          }
    const locationQuery: Record<string, unknown> = {}
    if (normalizedCityId) {
      locationQuery.city_id = normalizedCityId
      locationQuery.cityId = normalizedCityId
    }
    if (normalizedCity) {
      locationQuery.city = normalizedCity
      locationQuery.city_name = normalizedCity
      locationQuery.cityName = normalizedCity
    }
    if (normalizedDistrict) {
      locationQuery.district = normalizedDistrict
      locationQuery.area = normalizedDistrict
      locationQuery.neighborhood = normalizedDistrict
      locationQuery.neighbourhood = normalizedDistrict
    }
    const queryPayload = { ...baseQuery, ...locationQuery }
    const query = Object.keys(queryPayload).length > 0 ? queryPayload : undefined

    const publicResponse = await tryRequestJson<unknown>(path, { auth: false, query })
    const response = publicResponse ?? (await tryRequestJson<unknown>(path, { query }))
    if (response === null) continue

    const deliveryCheck = normalizeDeliveryCheck(response)
    if (typeof deliveryCheck.fee === 'number' && Number.isFinite(deliveryCheck.fee)) {
      return {
        ...deliveryCheck,
        fee: Math.max(0, deliveryCheck.fee),
      }
    }

    const fallbackStateFee = await resolveStateDeliveryFee()
    if (fallbackStateFee !== undefined) {
      return {
        ...deliveryCheck,
        fee: fallbackStateFee,
      }
    }

    return deliveryCheck
  }

  const fallbackStateFee = await resolveStateDeliveryFee()
  if (fallbackStateFee !== undefined) {
    return {
      available: true,
      fee: fallbackStateFee,
    }
  }

  return {
    available: false,
  }
}

async function getReviewsLive(restaurantId: string): Promise<Review[]> {
  try {
    const byRestaurantResponse = await requestJson<unknown>(`/restaurants/${encodeURIComponent(restaurantId)}/reviews`, {
      auth: false,
    })
    const rows = extractArray(byRestaurantResponse, ['reviews', 'items'])
    return rows.map((entry, idx) => normalizeReview(entry, restaurantId, idx))
  } catch {
    const fallbackResponse = await requestJson<unknown>('/reviews', {
      auth: false,
      query: { restaurant_id: restaurantId },
    })
    const rows = extractArray(fallbackResponse, ['reviews', 'items'])
    return rows.map((entry, idx) => normalizeReview(entry, restaurantId, idx))
  }
}

async function addReviewLive(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
  const response = await requestJson<unknown>('/reviews', {
    method: 'POST',
    body: {
      restaurant_id: toBackendId(review.restaurantId),
      rating: review.rating,
      comment: review.comment,
      user_name: review.userName,
    },
  })

  const rows = extractArray(response, ['reviews', 'items'])
  if (rows.length > 0) return normalizeReview(rows[0], review.restaurantId, 0)

  const record = extractObject(response)
  if (Object.keys(record).length > 0) return normalizeReview(record, review.restaurantId, 0)

  return {
    ...review,
    id: `review-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
}

async function loginLive(payload: { email: string; password: string }): Promise<{ user: User; token: string }> {
  const response = await requestJson<unknown>('/auth/login', {
    method: 'POST',
    auth: false,
    body: payload,
  })

  const token = extractToken(response)
  if (!token) throw new Error(localizeApiErrorMessage('Authentication token is missing in the API response.'))

  const userCandidate = extractUserPayload(response)
  let user = normalizeUser(userCandidate)

  if (!user.email || !user.phone || user.fullName === 'User') {
    try {
      const hydratedUser = await getCurrentUserWithTokenLive(token)
      user = {
        ...user,
        ...hydratedUser,
        fullName: hydratedUser.fullName || user.fullName,
        email: hydratedUser.email || user.email,
        phone: hydratedUser.phone ?? user.phone,
      }
    } catch {
      // keep login response user fallback if /auth/user is unavailable
    }
  }

  return {
    token,
    user: {
      ...user,
      fullName: user.fullName || payload.email.split('@')[0],
      email: user.email || payload.email,
    },
  }
}

async function getCurrentUserLive(): Promise<User> {
  const response = await requestJson<unknown>('/auth/user')
  const userCandidate = extractUserPayload(response)
  return normalizeUser(userCandidate)
}

async function registerLive(payload: {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}): Promise<{ user: User; token: string }> {
  if (payload.password !== payload.confirmPassword) {
    throw new Error(localizeApiErrorMessage('Passwords do not match.'))
  }

  const response = await requestJson<unknown>('/auth/register', {
    method: 'POST',
    auth: false,
    body: {
      name: payload.fullName,
      email: payload.email,
      phone_number: payload.phone,
      password: payload.password,
    },
  })

  const token = extractToken(response)
  if (!token) throw new Error(localizeApiErrorMessage('Authentication token is missing in the API response.'))

  const userCandidate = extractUserPayload(response)
  let user = normalizeUser(userCandidate)

  if (!user.email || !user.phone || user.fullName === 'User') {
    try {
      const hydratedUser = await getCurrentUserWithTokenLive(token)
      user = {
        ...user,
        ...hydratedUser,
        fullName: hydratedUser.fullName || user.fullName,
        email: hydratedUser.email || user.email,
        phone: hydratedUser.phone ?? user.phone,
      }
    } catch {
      // keep register response user fallback if /auth/user is unavailable
    }
  }

  return {
    token,
    user: {
      ...user,
      fullName: user.fullName || payload.fullName,
      email: user.email || payload.email,
      phone: user.phone || payload.phone,
    },
  }
}

function normalizeForgotPasswordResult(payload: unknown): ForgotPasswordResult {
  const root = extractObject(payload)
  const rootData = extractObject(root.data)
  const successCandidate = root.success ?? root.ok ?? rootData.success ?? rootData.ok
  const statusText = firstString([root.status, root.state, rootData.status, rootData.state], '').trim().toLowerCase()
  const success =
    successCandidate === undefined
      ? statusText
        ? ['success', 'ok', 'sent', 'accepted', 'done'].includes(statusText)
        : true
      : toBoolean(successCandidate, false)
  const message = optionalString([root.message, rootData.message, rootData.status_text, root.status_text])
  return { success, message }
}

async function forgotPasswordLive(payload: ForgotPasswordPayload): Promise<ForgotPasswordResult> {
  const email = payload.email.trim()
  if (!email || !email.includes('@')) {
    throw new Error(localizeApiErrorMessage('Email is required.'))
  }

  const redirectUrl = (payload.redirectUrl ?? '').trim() || buildCurrentOriginUrl('/reset-password')
  const body: RecordValue = {
    email,
    mail: email,
    user_email: email,
    username: email,
    login: email,
  }

  if (redirectUrl) {
    body.redirect_url = redirectUrl
    body.redirectUrl = redirectUrl
    body.callback_url = redirectUrl
    body.callbackUrl = redirectUrl
    body.frontend_callback_url = redirectUrl
    body.frontendCallbackUrl = redirectUrl
    body.reset_url = redirectUrl
    body.resetUrl = redirectUrl
    body.reset_link = redirectUrl
    body.resetLink = redirectUrl
    body.url = redirectUrl
  }

  const pathCandidates = uniqueStrings([...OPTIONAL_PASSWORD_FORGOT_PATHS, ...OPTIONAL_PASSWORD_RESET_PATHS])
  let lastError: unknown = null

  for (const path of pathCandidates) {
    try {
      const response = await requestJson<unknown>(path, {
        method: 'POST',
        auth: false,
        body,
      })
      const result = normalizeForgotPasswordResult(response)
      if (!result.success) {
        throw new Error(result.message || localizeApiErrorMessage('Unable to send password reset link.'))
      }
      return result
    } catch (error) {
      lastError = error
      if (!isLikelyMissingEndpointError(error)) {
        throw error
      }
    }
  }

  if (lastError) throw lastError
  throw new Error(localizeApiErrorMessage('Forgot password endpoint is unavailable.'))
}

async function resetPasswordLive(payload: ResetPasswordPayload): Promise<void> {
  const token = (payload.token ?? '').trim()
  const code = (payload.code ?? '').trim()
  const email = (payload.email ?? '').trim()
  const password = payload.password
  const confirmPassword = payload.confirmPassword

  if (!token && !code) {
    throw new Error(localizeApiErrorMessage('Password reset token is missing.'))
  }
  if (!password.trim()) {
    throw new Error(localizeApiErrorMessage('Password is required.'))
  }
  if (password !== confirmPassword) {
    throw new Error(localizeApiErrorMessage('Passwords do not match.'))
  }

  const body = {
    token: token || undefined,
    reset_token: token || undefined,
    code: code || undefined,
    email: email || undefined,
    password,
    new_password: password,
    newPassword: password,
    password_confirmation: confirmPassword,
    passwordConfirm: confirmPassword,
    confirm_password: confirmPassword,
    confirmPassword,
  }

  let lastError: unknown = null
  for (const path of OPTIONAL_PASSWORD_RESET_PATHS) {
    for (const method of ['POST', 'PUT', 'PATCH'] as const) {
      try {
        await requestJson<unknown>(path, {
          method,
          auth: false,
          body,
        })
        return
      } catch (error) {
        lastError = error
        if (isLikelyMethodNotAllowedError(error) || isLikelyMissingEndpointError(error)) {
          continue
        }
        throw error
      }
    }
  }

  if (lastError) throw lastError
  throw new Error(localizeApiErrorMessage('Password reset endpoint is unavailable.'))
}

async function updateProfileLive(payload: { fullName: string; email: string; phone?: string }): Promise<User> {
  const response = await requestJson<unknown>('/auth/profile', {
    method: 'PUT',
    body: {
      name: payload.fullName,
      full_name: payload.fullName,
      email: payload.email,
      phone_number: payload.phone,
    },
  })

  const userCandidate = extractUserPayload(response)
  const user = normalizeUser(userCandidate)
  const submittedFullName = payload.fullName.trim()
  const submittedEmail = payload.email.trim()
  const submittedPhone = typeof payload.phone === 'string' ? payload.phone.trim() : payload.phone

  return {
    ...user,
    fullName: submittedFullName || user.fullName,
    email: submittedEmail || user.email,
    phone: submittedPhone !== undefined ? submittedPhone : user.phone,
  }
}

async function logoutLive(): Promise<void> {
  await requestJson<unknown>('/auth/logout', { method: 'POST' })
}

async function getAddressesLive(): Promise<Address[]> {
  const response = await requestJson<unknown>('/addresses')
  const rows = extractArray(response, ['addresses', 'items'])
  return applyAddressRestaurantMetadata(rows.map((entry, idx) => normalizeAddress(entry, idx)))
}

async function getAddressLive(id: string): Promise<Address | null> {
  const response = await requestJson<unknown>(`/addresses/${encodeURIComponent(id)}`)
  const record = extractObject(response)
  if (Object.keys(record).length === 0) return null
  const rows = applyAddressRestaurantMetadata([normalizeAddress(record)])
  return rows[0] ?? null
}

async function getStatesLive(): Promise<StateOption[]> {
  const response = await requestJson<unknown>('/states', { auth: false })
  return normalizeStates(response)
}

async function getCitiesLive(): Promise<StateCityOption[]> {
  const response = await requestJson<unknown>('/cities', { auth: false })
  return normalizeCities(response)
}

async function getStateByIdLive(id: string): Promise<StateOption | null> {
  const response = await requestJson<unknown>(`/states/${encodeURIComponent(id)}`, { auth: false })
  const record = extractObject(response)
  if (Object.keys(record).length === 0) return null
  return normalizeState(record, 0)
}

async function getCitiesByStateIdLive(stateId: string): Promise<StateCityOption[]> {
  const normalizedStateId = stateId.trim()
  if (!normalizedStateId) return []

  const stateResponse = await tryRequestJson<unknown>(`/states/${encodeURIComponent(normalizedStateId)}`, {
    auth: false,
  })
  if (stateResponse !== null) {
    const stateRecord = extractObjectByKeys(stateResponse, ['state', 'data'])
    const state = normalizeState(stateRecord, 0)
    if (state.cities.length > 0) return state.cities

    const cityRowsFromState = extractArray(stateRecord, ['cities', 'city_list', 'state_cities', 'items'])
    if (cityRowsFromState.length > 0) {
      return cityRowsFromState.map((entry, cityIndex) =>
        normalizeStateCity(entry, cityIndex, `${normalizedStateId}-city-${cityIndex + 1}`),
      )
    }

    // Some backends expose cities only through /states and do not provide /cities/{stateId}.
    // Keep checkout usable by providing a safe fallback city from the state itself.
    if (state.id && state.name) {
      return [
        {
          id: state.id,
          name: state.name,
          nameAr: state.nameAr,
          neighborhoods: [],
        },
      ]
    }
  }

  const citiesResponse = await tryRequestJson<unknown>(`/cities/${encodeURIComponent(normalizedStateId)}`, { auth: false })
  if (citiesResponse === null) return []

  const cityRows = extractArray(citiesResponse, ['cities', 'items'])
  if (cityRows.length > 0) {
    return cityRows.map((entry, cityIndex) =>
      normalizeStateCity(entry, cityIndex, `${normalizedStateId}-city-${cityIndex + 1}`),
    )
  }

  const singleCity = normalizeCityWithNeighborhoods(citiesResponse, '')
  if (singleCity.id && singleCity.id !== 'city' && singleCity.name) {
    return [
      {
        id: singleCity.id,
        name: singleCity.name,
        nameAr: undefined,
        neighborhoods: singleCity.neighborhoods,
      },
    ]
  }

  return []
}

async function getCityByIdLive(id: string): Promise<CityWithNeighborhoods | null> {
  const response = await tryRequestJson<unknown>(`/cities/${encodeURIComponent(id)}`, { auth: false })
  if (response !== null) {
    const rows = extractArray(response, ['cities', 'items'])
    if (rows.length > 0) {
      const matched = rows.find((entry) => normalizeId(isRecord(entry) ? entry.id : undefined, '') === id)
      const source = matched ?? rows[0]
      return normalizeCityWithNeighborhoods(source, id)
    }

    const record = extractObject(response)
    if (Object.keys(record).length > 0) {
      return normalizeCityWithNeighborhoods(record, id)
    }
  }

  const stateResponse = await tryRequestJson<unknown>(`/states/${encodeURIComponent(id)}`, { auth: false })
  if (stateResponse !== null) {
    const stateRecord = extractObjectByKeys(stateResponse, ['state', 'data'])
    const state = normalizeState(stateRecord, 0)
    const preferredCity = state.cities.find((city) => city.id === id)
    if (preferredCity) {
      return {
        id: preferredCity.id,
        name: preferredCity.name,
        neighborhoods: preferredCity.neighborhoods,
      }
    }
  }

  return null
}

async function addAddressLive(payload: Omit<Address, 'id'>): Promise<Address[]> {
  await requestJson<unknown>('/addresses', {
    method: 'POST',
    body: toBackendAddressPayload(payload),
  })
  return getAddressesLive()
}

async function updateAddressLive(id: string, patch: Partial<Omit<Address, 'id'>>): Promise<Address[]> {
  const current = await getAddressLive(id)

  const base: Omit<Address, 'id'> = {
    restaurantId: current?.restaurantId,
    label: current?.label ?? 'Address',
    details: current?.details ?? '',
    isDefault: current?.isDefault ?? false,
    stateId: current?.stateId,
    governorate: current?.governorate,
    governorateCode: current?.governorateCode,
    city: current?.city,
    cityCode: current?.cityCode,
    district: current?.district,
    street: current?.street,
    buildingNo: current?.buildingNo,
    floor: current?.floor,
    apartment: current?.apartment,
    landmark: current?.landmark,
    postalCode: current?.postalCode,
    phone: current?.phone,
  }

  const merged: Omit<Address, 'id'> = {
    ...base,
    ...patch,
    label: patch.label ?? base.label,
    details: patch.details ?? base.details,
    isDefault: patch.isDefault ?? base.isDefault,
  }

  await requestJson<unknown>(`/addresses/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: toBackendAddressPayload(merged),
  })

  return getAddressesLive()
}

async function deleteAddressLive(id: string): Promise<Address[]> {
  await requestJson<unknown>(`/addresses/${encodeURIComponent(id)}`, { method: 'DELETE' })
  return getAddressesLive()
}

async function setDefaultAddressLive(id: string): Promise<Address[]> {
  return updateAddressLive(id, { isDefault: true })
}

function toCartApiPayload(item: CartItem): RecordValue {
  const baseMenuId = (typeof item.menuItemId === 'string' && item.menuItemId.trim())
    ? item.menuItemId.trim()
    : item.id.split('__')[0]
  const addonIds = extractBackendAddonIdsFromCartItem(item)

  const payload: RecordValue = {
    menu_item_id: toBackendId(baseMenuId),
    restaurant_id: toBackendId(item.restaurantId),
    quantity: Math.max(1, Math.round(item.quantity)),
  }

  if (item.options?.length) payload.notes = item.options.join(' | ')
  if (addonIds.length > 0) {
    payload.addons = addonIds
    payload.addon_ids = addonIds
    payload.add_on_ids = addonIds
    payload.selected_addons = addonIds
    payload.add_ons = addonIds
  }

  return payload
}

function mergeCartItemsWithClientHint(items: CartItem[], hint: CartItem): CartItem[] {
  if (!items.length) return items

  const normalizedHintName = hint.name.trim().toLowerCase()
  const hintBaseId = (typeof hint.menuItemId === 'string' && hint.menuItemId.trim())
    ? hint.menuItemId.trim()
    : hint.id.split('__')[0]
  const normalizedHintRestaurantId = hint.restaurantId === 'restaurant' ? '' : hint.restaurantId

  let targetIndex = items.findIndex((entry) => entry.id === hint.id)
  if (targetIndex < 0) {
    targetIndex = items.findIndex((entry) => {
      const entryMenuId = (typeof entry.menuItemId === 'string' && entry.menuItemId.trim())
        ? entry.menuItemId.trim()
        : entry.id.split('__')[0]
      const entryRestaurantId = entry.restaurantId === 'restaurant' ? '' : entry.restaurantId
      const restaurantMatches =
        normalizedHintRestaurantId && entryRestaurantId
          ? entryRestaurantId === normalizedHintRestaurantId
          : true
      return restaurantMatches && entryMenuId === hintBaseId
    })
  }
  if (targetIndex < 0 && normalizedHintName) {
    targetIndex = items.findIndex(
      (entry) => {
        const entryRestaurantId = entry.restaurantId === 'restaurant' ? '' : entry.restaurantId
        const restaurantMatches =
          normalizedHintRestaurantId && entryRestaurantId
            ? entryRestaurantId === normalizedHintRestaurantId
            : true
        return restaurantMatches && entry.name.trim().toLowerCase() === normalizedHintName
      },
    )
  }
  if (targetIndex < 0) return items

  const target = items[targetIndex]
  const mergedOptions = uniqueStrings([...(target.options ?? []), ...(hint.options ?? [])])
  const shouldPreferHintPrice =
    (hint.id.includes('addon:') || hint.id.includes('size:')) &&
    Number.isFinite(hint.price) &&
    hint.price >= 0
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
  const normalizedHintAddonIds = extractBackendAddonIdsFromCartItem(hint)

  return items.map((entry, index) => {
    if (index !== targetIndex) return entry
    const targetRestaurantId = entry.restaurantId === 'restaurant' ? '' : entry.restaurantId
    const mergedAddonIds = uniqueBackendAddonIds([
      ...(Array.isArray(entry.addonIds) ? extractBackendAddonIdsFromUnknown(entry.addonIds) : []),
      ...normalizedHintAddonIds,
    ])
    return {
      ...entry,
      // Prefer client hint presentation (already localized in current UI language).
      name: hint.name || entry.name,
      imageUrl: hint.imageUrl || entry.imageUrl,
      restaurantId: targetRestaurantId || normalizedHintRestaurantId,
      menuItemId: hintBaseId || entry.menuItemId,
      price: shouldPreferHintPrice ? Math.max(0, hint.price) : entry.price,
      vatPercentage: normalizedHintVatPercentage ?? entry.vatPercentage,
      vatIncluded: hint.vatIncluded === undefined ? entry.vatIncluded : hint.vatIncluded,
      basePrice: normalizedHintBasePrice ?? entry.basePrice,
      addonIds: mergedAddonIds.length ? mergedAddonIds : undefined,
      oldPrice: shouldPreferHintPrice
        ? normalizedHintOldPrice ?? entry.oldPrice
        : entry.oldPrice ?? normalizedHintOldPrice,
      options: mergedOptions.length ? mergedOptions : entry.options,
    }
  })
}

async function getCartLiveOptional(): Promise<CartItem[]> {
  for (const path of OPTIONAL_CART_GET_PATHS) {
    const response = await tryRequestJson<unknown>(path)
    if (response === null) continue
    return normalizeCartItems(response)
  }

  throw new Error(localizeApiErrorMessage('Cart endpoints are unavailable'))
}

async function addToCartLiveOptional(item: CartItem): Promise<CartItem[]> {
  const body = toCartApiPayload(item)

  for (const path of OPTIONAL_CART_ADD_PATHS) {
    const response = await tryRequestJson<unknown>(path, {
      method: 'POST',
      body,
    })
    if (response === null) continue

    const parsed = normalizeCartItems(response)
    if (parsed.length > 0) return mergeCartItemsWithClientHint(parsed, item)

    const refreshed = await getCartLiveOptional()
    if (refreshed.length > 0) return mergeCartItemsWithClientHint(refreshed, item)
    throw new Error(localizeApiErrorMessage('Cart add endpoint returned an empty cart.'))
  }

  throw new Error(localizeApiErrorMessage('Cart add endpoint is unavailable'))
}

async function updateCartItemLiveOptional(id: string, quantity: number, notes?: string): Promise<CartItem[]> {
  const safeQuantity = Math.max(0, Math.round(quantity))
  if (safeQuantity <= 0) return removeCartItemLiveOptional(id)

  for (const template of OPTIONAL_CART_UPDATE_PATHS) {
    const path = withResourceId(template, id)
    const body: RecordValue = { quantity: safeQuantity, qty: safeQuantity }
    if (notes?.trim()) body.notes = notes.trim()

    const putResponse = await tryRequestJson<unknown>(path, {
      method: 'PUT',
      body,
    })
    if (putResponse !== null) {
      const parsed = normalizeCartItems(putResponse)
      if (parsed.length > 0) return parsed
      const refreshed = await getCartLiveOptional()
      if (refreshed.length > 0) return refreshed
      throw new Error(localizeApiErrorMessage('Cart update endpoint returned an empty cart.'))
    }

    const patchResponse = await tryRequestJson<unknown>(path, {
      method: 'PATCH',
      body,
    })
    if (patchResponse !== null) {
      const parsed = normalizeCartItems(patchResponse)
      if (parsed.length > 0) return parsed
      const refreshed = await getCartLiveOptional()
      if (refreshed.length > 0) return refreshed
      throw new Error(localizeApiErrorMessage('Cart update endpoint returned an empty cart.'))
    }
  }

  throw new Error(localizeApiErrorMessage('Cart update endpoint is unavailable'))
}

async function removeCartItemLiveOptional(id: string): Promise<CartItem[]> {
  for (const template of OPTIONAL_CART_REMOVE_PATHS) {
    const path = withResourceId(template, id)
    const response = await tryRequestJson<unknown>(path, { method: 'DELETE' })
    if (response === null) continue

    const parsed = normalizeCartItems(response)
    if (parsed.length > 0) return parsed
    return getCartLiveOptional()
  }

  throw new Error(localizeApiErrorMessage('Cart remove endpoint is unavailable'))
}

async function clearCartLiveOptional(): Promise<CartItem[]> {
  for (const path of OPTIONAL_CART_CLEAR_PATHS) {
    const response = await tryRequestJson<unknown>(path, { method: 'DELETE' })
    if (response === null) continue

    const parsed = normalizeCartItems(response)
    if (parsed.length > 0) return parsed
    return []
  }

  throw new Error(localizeApiErrorMessage('Cart clear endpoint is unavailable'))
}

async function getFavoriteRestaurantIdsLiveOptional(): Promise<string[]> {
  return getFavoriteItemIdsByTypeLiveOptional('restaurant')
}

async function getFavoriteProductIdsLiveOptional(): Promise<string[]> {
  return getFavoriteItemIdsByTypeLiveOptional('product')
}

async function getFavoriteItemIdsByTypeLiveOptional(type: WishlistItemType): Promise<string[]> {
  const wishlistItems = await getWishlistItemsLiveOptional()
  return uniqueStrings(
    wishlistItems
      .filter((entry) => entry.type === type)
      .map((entry) => entry.itemId),
  )
}

async function getWishlistItemsLiveOptional(): Promise<WishlistItem[]> {
  for (const path of OPTIONAL_FAVORITES_GET_PATHS) {
    const response = await tryRequestJson<unknown>(path)
    if (response === null) continue
    return extractWishlistItems(response)
  }

  throw new Error(localizeApiErrorMessage('Favorites endpoints are unavailable'))
}

async function toggleFavoriteRestaurantLiveOptional(restaurantId: string): Promise<string[]> {
  return toggleFavoriteItemByTypeLiveOptional('restaurant', restaurantId)
}

async function toggleFavoriteProductLiveOptional(productId: string): Promise<string[]> {
  return toggleFavoriteItemByTypeLiveOptional('product', productId)
}

async function toggleFavoriteItemByTypeLiveOptional(type: WishlistItemType, itemId: string): Promise<string[]> {
  const normalizedItemId = itemId.trim()
  if (!normalizedItemId) {
    return getFavoriteItemIdsByTypeLiveOptional(type)
  }

  const currentItems = await getWishlistItemsLiveOptional()
  const currentItemIds = uniqueStrings(
    currentItems
      .filter((entry) => entry.type === type)
      .map((entry) => entry.itemId),
  )
  const backendItemId = toBackendId(normalizedItemId)
  const backendItemIdString = String(backendItemId)
  const matchesItemId = (value: string) => {
    const normalizedValue = value.trim()
    if (!normalizedValue) return false
    if (normalizedValue === normalizedItemId) return true
    return String(toBackendId(normalizedValue)) === backendItemIdString
  }
  const matchedEntry = currentItems.find(
    (entry) => entry.type === type && matchesItemId(entry.itemId),
  )
  const isFavorite = Boolean(matchedEntry)

  const filterResponseByType = (response: unknown): string[] =>
    uniqueStrings(
      extractWishlistItems(response)
        .filter((entry) => entry.type === type)
        .map((entry) => entry.itemId),
    )

  if (isFavorite) {
    const removeIdCandidates = uniqueStrings([
      matchedEntry?.id ?? '',
      matchedEntry?.itemId ?? '',
      normalizedItemId,
      backendItemIdString,
    ])

    for (const template of OPTIONAL_FAVORITES_REMOVE_PATHS) {
      for (const removeId of removeIdCandidates) {
        const path = withResourceId(template, removeId)
        const response = await tryRequestJson<unknown>(path, { method: 'DELETE' })
        if (response === null) continue

        const updated = filterResponseByType(response)
        if (updated.length > 0) return updated
        return currentItemIds.filter((id) => !matchesItemId(id))
      }
    }

    const removeBody: RecordValue = {
      type,
      item_id: backendItemId,
      // Keep legacy keys for endpoints still expecting custom names.
      restaurant_id: type === 'restaurant' ? backendItemId : undefined,
      product_id: type === 'product' ? backendItemId : undefined,
      menu_item_id: type === 'product' ? backendItemId : undefined,
    }
    for (const path of OPTIONAL_FAVORITES_ADD_PATHS) {
      const response = await tryRequestJson<unknown>(path, {
        method: 'DELETE',
        body: removeBody,
      })
      if (response === null) continue

      const updated = filterResponseByType(response)
      if (updated.length > 0) return updated
      return currentItemIds.filter((id) => !matchesItemId(id))
    }
  } else {
    const body: RecordValue = {
      type,
      item_id: backendItemId,
      // Keep legacy keys for endpoints still expecting custom names.
      restaurant_id: type === 'restaurant' ? backendItemId : undefined,
      product_id: type === 'product' ? backendItemId : undefined,
      menu_item_id: type === 'product' ? backendItemId : undefined,
    }

    for (const path of OPTIONAL_FAVORITES_ADD_PATHS) {
      const response = await tryRequestJson<unknown>(path, {
        method: 'POST',
        body,
      })
      if (response === null) continue

      const updated = filterResponseByType(response)
      if (updated.length > 0) return updated
      return uniqueStrings([...currentItemIds, normalizedItemId])
    }
  }

  throw new Error(localizeApiErrorMessage('Favorite toggle endpoint is unavailable'))
}

function mapCartItemToBackendOrderItem(item: CartItem): RecordValue {
  const baseMenuId = (typeof item.menuItemId === 'string' && item.menuItemId.trim())
    ? item.menuItemId.trim()
    : item.id.split('__')[0]
  const addonIds = extractBackendAddonIdsFromCartItem(item)
  const hasAddonSelection = addonIds.length > 0

  const backendItem: RecordValue = {
    menu_item_id: toBackendId(baseMenuId),
    quantity: item.quantity,
  }
  const normalizedUnitPrice =
    Number.isFinite(item.price) ? Math.max(0, Number(item.price)) : Number.NaN
  const normalizedLineTotal =
    Number.isFinite(normalizedUnitPrice)
      ? Number((normalizedUnitPrice * Math.max(1, Math.round(item.quantity))).toFixed(2))
      : Number.NaN
  const normalizedBaseUnitPrice =
    Number.isFinite(item.basePrice) ? Math.max(0, Number(item.basePrice)) : Number.NaN

  if (item.options?.length) {
    backendItem.notes = item.options.join(' | ')
  }
  // When add-ons are selected, avoid forcing full item prices from the client.
  // Let backend pricing logic calculate menu price + add-ons to keep order totals accurate.
  if (!hasAddonSelection && Number.isFinite(normalizedUnitPrice)) {
    backendItem.price = normalizedUnitPrice
    backendItem.unit_price = normalizedUnitPrice
    backendItem.item_price = normalizedUnitPrice
    backendItem.price_at_order = normalizedUnitPrice
  }
  if (Number.isFinite(normalizedBaseUnitPrice)) {
    backendItem.base_unit_price = normalizedBaseUnitPrice
    backendItem.item_base_price = normalizedBaseUnitPrice
    backendItem.base_price_without_addons = normalizedBaseUnitPrice
  }
  if (!hasAddonSelection && Number.isFinite(normalizedLineTotal)) {
    backendItem.total_price = normalizedLineTotal
    backendItem.line_total = normalizedLineTotal
    backendItem.subtotal = normalizedLineTotal
    backendItem.item_total = normalizedLineTotal
  }

  if (addonIds.length > 0) {
    backendItem.addons = addonIds
    backendItem.addon_ids = addonIds
    backendItem.add_on_ids = addonIds
    backendItem.selected_addons = addonIds
    backendItem.add_ons = addonIds
  }

  return backendItem
}

async function syncRemoteCartForCheckout(cartItems: CartItem[]): Promise<void> {
  if (!Array.isArray(cartItems) || cartItems.length === 0) return

  try {
    await clearCart()
  } catch {
    // Ignore cart clear failures and keep going; add-to-cart below may still refresh server cart state.
  }

  for (const item of cartItems) {
    await addToCart(item)
  }
}

async function createOrderLive(payload: {
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
}): Promise<Order> {
  const providedCartItems = Array.isArray(payload.cartItems)
    ? payload.cartItems
        .filter((item) => Boolean(item))
        .map((item) => ({ ...item }))
    : []
  const cartItems = providedCartItems.length > 0 ? providedCartItems : await getCart()
  if (!cartItems.length) {
    throw new Error(localizeApiErrorMessage('Cart is empty.'))
  }

  if (providedCartItems.length > 0) {
    await syncRemoteCartForCheckout(cartItems)
  }

  const restaurantId =
    cartItems
      .map((item) => (typeof item.restaurantId === 'string' ? item.restaurantId.trim() : ''))
      .find((id) => Boolean(id) && id.toLowerCase() !== 'restaurant') ?? ''

  const backendPaymentMethod = mapPaymentMethodToBackend(payload.paymentMethod)

  const orderBody: RecordValue = {
    address_id: toBackendId(payload.addressId),
    payment_method: backendPaymentMethod,
    items: cartItems.map(mapCartItemToBackendOrderItem),
  }
  const normalizedSubtotal =
    typeof payload.subtotal === 'number' && Number.isFinite(payload.subtotal)
      ? Math.max(0, payload.subtotal)
      : Number.NaN
  const normalizedDiscount =
    typeof payload.discount === 'number' && Number.isFinite(payload.discount)
      ? Math.max(0, payload.discount)
      : Number.NaN
  const normalizedDeliveryFee =
    typeof payload.deliveryFee === 'number' && Number.isFinite(payload.deliveryFee)
      ? Math.max(0, payload.deliveryFee)
      : Number.NaN
  const normalizedAddonsTotal =
    typeof payload.addonsTotal === 'number' && Number.isFinite(payload.addonsTotal)
      ? Math.max(0, payload.addonsTotal)
      : Number.NaN
  const computedTotalFromProvided =
    Number.isFinite(normalizedSubtotal) ||
    Number.isFinite(normalizedAddonsTotal) ||
    Number.isFinite(normalizedDeliveryFee) ||
    Number.isFinite(normalizedDiscount)
      ? Math.max(
          0,
          (Number.isFinite(normalizedSubtotal) ? normalizedSubtotal : 0) +
            (Number.isFinite(normalizedAddonsTotal) ? normalizedAddonsTotal : 0) +
            (Number.isFinite(normalizedDeliveryFee) ? normalizedDeliveryFee : 0) -
            (Number.isFinite(normalizedDiscount) ? normalizedDiscount : 0),
        )
      : Number.NaN
  const normalizedTotal =
    typeof payload.total === 'number' && Number.isFinite(payload.total)
      ? Math.max(0, payload.total)
      : computedTotalFromProvided
  if (Number.isFinite(normalizedSubtotal)) {
    orderBody.subtotal = normalizedSubtotal
    orderBody.sub_total = normalizedSubtotal
    orderBody.subtotal_amount = normalizedSubtotal
    orderBody.items_subtotal = normalizedSubtotal
    orderBody.items_total = normalizedSubtotal
  }
  if (Number.isFinite(normalizedDiscount)) {
    orderBody.discount = normalizedDiscount
    orderBody.discount_amount = normalizedDiscount
    orderBody.total_discount = normalizedDiscount
  }
  if (Number.isFinite(normalizedTotal)) {
    orderBody.total = normalizedTotal
    orderBody.total_amount = normalizedTotal
    orderBody.grand_total = normalizedTotal
    orderBody.order_total = normalizedTotal
    orderBody.payable_amount = normalizedTotal
  }
  if (Number.isFinite(normalizedAddonsTotal)) {
    orderBody.addons_total = normalizedAddonsTotal
    orderBody.addon_total = normalizedAddonsTotal
  }
  if (Number.isFinite(normalizedDeliveryFee)) {
    orderBody.delivery_fee = normalizedDeliveryFee
    orderBody.shipping_fee = normalizedDeliveryFee
    orderBody.delivery_charge = normalizedDeliveryFee
    orderBody.delivery_cost = normalizedDeliveryFee
    orderBody.deliveryFee = normalizedDeliveryFee
  }
  const checkoutItems = orderBody.items

  if (restaurantId) orderBody.restaurant_id = toBackendId(restaurantId)
  if (payload.notes?.trim()) orderBody.notes = payload.notes.trim()
  if (payload.promoCode?.trim()) orderBody.promo_code = payload.promoCode.trim()

  const checkoutBodyBase: RecordValue = {
    address_id: orderBody.address_id,
    payment_method: backendPaymentMethod,
    // Keep alternative keys to satisfy different backend checkout contracts.
    items: checkoutItems,
    order_items: checkoutItems,
    cart_items: checkoutItems,
  }
  if (Number.isFinite(normalizedSubtotal)) {
    checkoutBodyBase.subtotal = normalizedSubtotal
    checkoutBodyBase.sub_total = normalizedSubtotal
    checkoutBodyBase.subtotal_amount = normalizedSubtotal
    checkoutBodyBase.items_subtotal = normalizedSubtotal
    checkoutBodyBase.items_total = normalizedSubtotal
  }
  if (Number.isFinite(normalizedDiscount)) {
    checkoutBodyBase.discount = normalizedDiscount
    checkoutBodyBase.discount_amount = normalizedDiscount
    checkoutBodyBase.total_discount = normalizedDiscount
  }
  if (Number.isFinite(normalizedTotal)) {
    checkoutBodyBase.total = normalizedTotal
    checkoutBodyBase.total_amount = normalizedTotal
    checkoutBodyBase.grand_total = normalizedTotal
    checkoutBodyBase.order_total = normalizedTotal
    checkoutBodyBase.payable_amount = normalizedTotal
  }
  if (Number.isFinite(normalizedAddonsTotal)) {
    checkoutBodyBase.addons_total = normalizedAddonsTotal
    checkoutBodyBase.addon_total = normalizedAddonsTotal
  }
  if (Number.isFinite(normalizedDeliveryFee)) {
    checkoutBodyBase.delivery_fee = normalizedDeliveryFee
    checkoutBodyBase.shipping_fee = normalizedDeliveryFee
    checkoutBodyBase.delivery_charge = normalizedDeliveryFee
    checkoutBodyBase.delivery_cost = normalizedDeliveryFee
    checkoutBodyBase.deliveryFee = normalizedDeliveryFee
  }
  if (restaurantId) checkoutBodyBase.restaurant_id = toBackendId(restaurantId)
  if (typeof orderBody.notes === 'string') checkoutBodyBase.notes = orderBody.notes
  if (typeof orderBody.promo_code === 'string') checkoutBodyBase.promo_code = orderBody.promo_code

  const checkoutBodies = getCheckoutPaymentMethodCandidates(payload.paymentMethod).map((paymentMethod) => ({
    ...checkoutBodyBase,
    payment_method: paymentMethod,
  }))

  const resolveCreatedOrder = async (response: unknown): Promise<Order | null> => {
    const resolved = resolveOrderFromPayload(response, cartItems)
    if (resolved) return resolved

    if (!isOrderSuccessPayload(response)) return null

    const orderRecord = extractObjectByKeys(response, ['order', 'data'])
    if (Object.keys(orderRecord).length > 0) {
      return normalizeOrder(orderRecord, cartItems)
    }

    try {
      const orders = await getOrdersLive()
      const resolvedFromOrders = pickMostRelevantOrder(orders, cartItems)
      if (resolvedFromOrders) return resolvedFromOrders
    } catch {
      // ignore and fall back to synthetic order
    }

    return normalizeOrder({}, cartItems)
  }

  const resolveFromPath = async (path: string, body: RecordValue): Promise<Order | null> => {
    const response = await tryRequestJson<unknown>(path, {
      method: 'POST',
      body,
    })
    if (response === null) return null
    const createdOrder = await resolveCreatedOrder(response)
    if (!createdOrder) return null

    try {
      await clearCart()
    } catch (error) {
      if (API_LOG_ENABLED) {
        console.warn('[API CHECKOUT CLEAR CART FAILED]', { path, error })
      }
    }
    return createdOrder
  }

  for (const path of OPTIONAL_CHECKOUT_PATHS) {
    const normalizedPath = normalizeOptionalPath(path)

    if (normalizedPath.includes('/cart/checkout')) {
      for (const checkoutBody of checkoutBodies) {
        const createdOrder = await resolveFromPath(normalizedPath, checkoutBody)
        if (createdOrder) return createdOrder
      }
      continue
    }

    const createdOrder = await resolveFromPath(normalizedPath, orderBody)
    if (createdOrder) return createdOrder
  }

  throw new Error(localizeApiErrorMessage('Checkout endpoints are unavailable'))
}

async function tryLoadOrdersAfterMutation(): Promise<Order[] | null> {
  try {
    const rows = await getOrdersLive()
    return rows
  } catch {
    return null
  }
}

async function getOrdersLive(): Promise<Order[]> {
  for (const path of OPTIONAL_ORDERS_LIST_PATHS) {
    const response = await tryRequestJson<unknown>(path)
    if (response === null) continue

    const rows = normalizeOrdersResponse(response)
    if (rows.length > 0 || hasExtractableArray(response, ['orders', 'data', 'results', 'rows', 'list'])) {
      return rows
    }
  }

  throw new Error(localizeApiErrorMessage('Orders endpoints are unavailable'))
}

async function getOrderByIdLive(id: string): Promise<Order | null> {
  for (const template of OPTIONAL_ORDERS_GET_PATHS) {
    const response = await tryRequestJson<unknown>(withResourceId(template, id))
    if (response === null) continue

    const order = resolveOrderFromPayload(response)
    if (order) return order
  }

  throw new Error(localizeApiErrorMessage('Order details endpoint is unavailable'))
}

async function cancelOrderLive(id: string): Promise<Order[]> {
  const cancelPathTemplates = uniqueStrings(['/orders/{id}/cancel', ...OPTIONAL_ORDERS_CANCEL_PATHS])

  for (const template of cancelPathTemplates) {
    const path = withResourceId(template, id)
    const response = await tryRequestJson<unknown>(path, { method: 'POST' })
    if (response === null) continue

    const rows = normalizeOrdersResponse(response)
    if (rows.length > 0) return rows

    const order = resolveOrderFromPayload(response)
    if (order) {
      const refreshed = await tryLoadOrdersAfterMutation()
      if (refreshed && refreshed.length > 0) return refreshed
      return [{ ...order, status: 'cancelled' }]
    }

    if (!isOrderSuccessPayload(response)) {
      const refreshed = await tryLoadOrdersAfterMutation()
      if (refreshed && refreshed.length > 0) return refreshed

      const fallbackOrder = await getOrderByIdLive(id).catch(() => null)
      if (fallbackOrder) return [{ ...fallbackOrder, status: 'cancelled' }]
      return []
    }

    const refreshed = await tryLoadOrdersAfterMutation()
    if (refreshed && refreshed.length > 0) return refreshed

    const fallbackOrder = await getOrderByIdLive(id).catch(() => null)
    if (fallbackOrder) return [{ ...fallbackOrder, status: 'cancelled' }]

    return []
  }

  throw new Error(localizeApiErrorMessage('Order cancel endpoint is unavailable'))
}

async function validatePromoCodeLive(payload: {
  code: string
  restaurantId?: string
  subtotal: number
}): Promise<PromoValidationResult> {
  const body: RecordValue = {
    code: payload.code.trim(),
    subtotal: payload.subtotal,
  }

  if (payload.restaurantId?.trim()) {
    body.restaurant_id = toBackendId(payload.restaurantId)
  }

  const response = await requestJson<unknown>('/promotions/validate', {
    method: 'POST',
    auth: false,
    body,
  })

  return normalizePromoValidation(response, payload.subtotal)
}

async function getPromotionsLive(): Promise<Promotion[]> {
  const response = await requestJson<unknown>('/promotions', { auth: false })
  return normalizePromotions(response)
}

async function getFaqsLive(): Promise<Faq[]> {
  const response = await requestJson<unknown>('/faqs', { auth: false })
  return normalizeFaqs(response)
}

async function getSettingsLive(): Promise<AppSettings> {
  const response = await requestJson<unknown>('/settings', { auth: false })
  return normalizeSettings(response)
}

async function submitContactLive(payload: ContactPayload): Promise<ContactResult> {
  const response = await requestJson<unknown>('/contact', {
    method: 'POST',
    auth: false,
    body: payload,
  })

  const root = extractObject(response)
  const rootData = extractObject(root.data)

  const success = toBoolean(root.success ?? rootData.success, true)
  const message = optionalString([root.message, rootData.message])

  return { success, message }
}

function normalizeNewsletterResult(payload: unknown): NewsletterResult {
  const root = extractObject(payload)
  const rootData = extractObject(root.data)

  const success = toBoolean(root.success ?? rootData.success, true)
  const message = optionalString([root.message, rootData.message])

  return { success, message }
}

async function subscribeNewsletterLive(payload: NewsletterPayload): Promise<NewsletterResult> {
  const response = await requestJson<unknown>('/newsletter/subscribe', {
    method: 'POST',
    auth: false,
    body: { email: payload.email.trim() },
  })

  return normalizeNewsletterResult(response)
}

async function unsubscribeNewsletterLive(payload: NewsletterPayload): Promise<NewsletterResult> {
  const response = await requestJson<unknown>('/newsletter/unsubscribe', {
    method: 'POST',
    auth: false,
    body: { email: payload.email.trim() },
  })

  return normalizeNewsletterResult(response)
}

export async function getHome(): Promise<{ kitchens: Kitchen[]; mostOrdered: Restaurant[]; suggested: Brand[] }> {
  return withFallback(getHomeLive, mock.getHome)
}

export async function getCategories(): Promise<Category[]> {
  return withFallback(getCategoriesLive, mock.getCategories)
}

export async function getCuisineTypes(): Promise<CuisineType[]> {
  if (!LIVE_ENABLED) return []
  return getCuisineTypesLive()
}

export async function getStates(): Promise<StateOption[]> {
  return runLocationCachedRequest(
    buildLocalizedLocationCacheKey('states'),
    () => withFallback(getStatesLive, mock.getStates),
    LOCATION_STATES_CACHE_TTL_MS,
  )
}

export async function getCities(): Promise<StateCityOption[]> {
  return runLocationCachedRequest(
    buildLocalizedLocationCacheKey('cities'),
    async () => {
      if (!LIVE_ENABLED) {
        const states = await mock.getStates()
        return uniqueStateCityOptions(states.flatMap((state) => state.cities ?? []))
      }

      try {
        const cities = await getCitiesLive()
        if (cities.length > 0) return uniqueStateCityOptions(cities)
      } catch (error) {
        if (API_LOG_ENABLED) {
          console.warn('[API CITIES FAILED]', { error })
        }
      }

      try {
        const states = await getStatesLive()
        return uniqueStateCityOptions(states.flatMap((state) => state.cities ?? []))
      } catch {
        return []
      }
    },
    LOCATION_STATE_CITIES_CACHE_TTL_MS,
  )
}

export async function getRestaurantStates(restaurantId: string): Promise<StateOption[]> {
  const normalizedRestaurantId = restaurantId.trim()
  if (!normalizedRestaurantId) return getStates()

  return runLocationCachedRequest(
    buildLocalizedLocationCacheKey('restaurant-states', normalizedRestaurantId),
    async () => {
      if (!LIVE_ENABLED) {
        return mock.getStates()
      }

      const restaurantStates = await withOptionalLiveFallback(
        () => getRestaurantStatesLiveOptional(normalizedRestaurantId),
        async () => [],
      )
      if (restaurantStates.length > 0) return restaurantStates

      try {
        return await getStatesLive()
      } catch {
        return []
      }
    },
    LOCATION_RESTAURANT_STATES_CACHE_TTL_MS,
  )
}

export async function getStateById(id: string): Promise<StateOption | null> {
  const normalizedId = id.trim()
  if (!normalizedId) return null

  return withOptionalLiveFallback(
    () => getStateByIdLive(normalizedId),
    async () => {
      const states = await mock.getStates()
      return states.find((state) => state.id === normalizedId) ?? null
    },
  )
}

export async function getCitiesByStateId(stateId: string): Promise<StateCityOption[]> {
  const normalizedStateId = stateId.trim()
  if (!normalizedStateId) return []

  return runLocationCachedRequest(
    buildLocalizedLocationCacheKey('state-cities', normalizedStateId),
    async () => {
      if (!LIVE_ENABLED) {
        const states = await mock.getStates()
        const state = states.find((entry) => entry.id === normalizedStateId || entry.code === normalizedStateId)
        return state?.cities ?? []
      }

      try {
        return await getCitiesByStateIdLive(normalizedStateId)
      } catch (error) {
        if (API_LOG_ENABLED) {
          console.warn('[API CITIES BY STATE FAILED]', { stateId: normalizedStateId, error })
        }
        return []
      }
    },
    LOCATION_STATE_CITIES_CACHE_TTL_MS,
  )
}

export async function getRestaurants(query: RestaurantsQuery): Promise<{ items: Restaurant[]; total: number }> {
  return withFallback(() => getRestaurantsLive(query), () => mock.getRestaurants(query))
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  return withFallback(() => getRestaurantByIdLive(id), () => mock.getRestaurantById(id))
}

export async function getRestaurantsByIds(ids: string[]): Promise<Restaurant[]> {
  const normalizedIds = Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean)))
  if (!normalizedIds.length) return []

  const rows = await Promise.all(
    normalizedIds.map((id) =>
      withFallback(() => getRestaurantByIdLive(id), () => mock.getRestaurantById(id)),
    ),
  )

  return rows.filter((restaurant): restaurant is Restaurant => Boolean(restaurant))
}

export async function getRestaurantMenu(restaurantId: string): Promise<RestaurantMenuData> {
  return withFallback(
    () => getRestaurantMenuLive(restaurantId),
    async () => ({
      categories: getMenuCategories(restaurantId),
      items: getMenuItems(restaurantId),
    }),
  )
}

export async function getRestaurantBranches(restaurantId: string): Promise<RestaurantBranch[]> {
  const normalizedId = restaurantId.trim()
  if (!normalizedId) return []
  if (!LIVE_ENABLED) return mock.getRestaurantBranches(normalizedId)

  return withFallback(
    () => getRestaurantBranchesLiveOptional(normalizedId),
    () => mock.getRestaurantBranches(normalizedId),
  )
}

export async function checkRestaurantDelivery(
  restaurantId: string,
  stateId: string,
  location?: {
    cityId?: string
    city?: string
    district?: string
  },
): Promise<RestaurantDeliveryCheckResult> {
  const normalizedRestaurantId = restaurantId.trim()
  const normalizedStateId = stateId.trim()
  if (!normalizedRestaurantId || !normalizedStateId) return { available: false }

  return withOptionalLiveFallback(
    () => checkRestaurantDeliveryLiveOptional(normalizedRestaurantId, normalizedStateId, location),
    () => mock.checkRestaurantDelivery(normalizedRestaurantId, normalizedStateId, location),
  )
}

export async function getReviews(restaurantId: string): Promise<Review[]> {
  return withFallback(() => getReviewsLive(restaurantId), () => mock.getReviews(restaurantId))
}

export async function addReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
  return withFallback(() => addReviewLive(review), () => mock.addReview(review))
}

export function getSocialRedirectUrl(provider: SocialProvider, options?: SocialLoginNavigationOptions): string {
  const candidates = getSocialRedirectEndpointCandidates(provider, options)
  return pickSocialRedirectFallbackCandidate(provider, candidates)
}

export async function getSocialLoginNavigationUrl(
  provider: SocialProvider,
  options?: SocialLoginNavigationOptions,
): Promise<string> {
  const candidates = getSocialRedirectEndpointCandidates(provider, options)
  for (const endpointUrl of candidates) {
    const redirectUrl = await tryFetchSocialRedirectEndpoint(endpointUrl)
    if (redirectUrl) {
      return resolveSocialLoginNavigationUrl(redirectUrl, provider)
    }
  }

  const fallbackUrl = pickSocialRedirectFallbackCandidate(provider, candidates)
  const resolvedFallbackUrl = await resolveSocialLoginNavigationUrl(fallbackUrl, provider)
  if (isCurrentOriginSocialRedirectCandidate(resolvedFallbackUrl, provider)) {
    throw new Error(
      localizeApiErrorMessage(
        'Social login endpoint is unavailable on the frontend host. Configure VITE_API_BASE_URL to the backend API URL.',
      ),
    )
  }
  return resolvedFallbackUrl
}

export async function resolveSocialLoginNavigationUrl(
  navigationUrl: string,
  provider?: SocialProvider,
): Promise<string> {
  let nextUrl = navigationUrl.trim()
  if (!nextUrl) return ''

  const visited = new Set<string>()

  for (let index = 0; index < 4; index += 1) {
    const absoluteUrl = toAbsoluteSocialUrl(nextUrl) || nextUrl
    if (!isSocialRedirectEndpointUrl(absoluteUrl, provider)) {
      return absoluteUrl
    }
    if (visited.has(absoluteUrl)) {
      return absoluteUrl
    }
    visited.add(absoluteUrl)

    const resolvedUrl = await tryFetchSocialRedirectEndpoint(absoluteUrl)
    if (!resolvedUrl) {
      return absoluteUrl
    }

    nextUrl = resolvedUrl.trim()
    if (!nextUrl) {
      return absoluteUrl
    }
  }

  return toAbsoluteSocialUrl(nextUrl) || nextUrl
}

export async function resolveSocialAuthSessionFromUrl(urlValue: string): Promise<AuthSession | null> {
  const parsed = parseSocialAuthPayload(urlValue)
  if (!parsed?.hasSignal) return null

  if (parsed.error) {
    throw new Error(localizeApiErrorMessage(parsed.error))
  }

  const token = parsed.token
  const userPayload = parsed.userPayload

  if (!token && parsed.provider) {
    const candidates = getSocialCallbackEndpointCandidates(parsed.provider, parsed.query)
    for (const endpointUrl of candidates) {
      const session = await tryFetchSocialCallbackEndpoint(endpointUrl)
      if (session) return session
    }
  }

  if (!token) {
    throw new Error(localizeApiErrorMessage('Authentication token is missing in the API response.'))
  }

  let user = normalizeUser(userPayload)
  if (!user.email) {
    user = await getCurrentUserWithTokenLive(token)
  }

  if (!user.email) {
    throw new Error(localizeApiErrorMessage('Unable to load account profile after social login.'))
  }

  return { token, user }
}

/**
 * Some social callback endpoints respond with JSON rather than redirecting back to the SPA.
 * When we already have that JSON (e.g. inside a popup), we should parse it directly instead
 * of calling the callback endpoint again (OAuth codes are often one-time use).
 */
export async function resolveAuthSessionFromCallbackPayload(payload: unknown): Promise<AuthSession | null> {
  const token = extractToken(payload)
  if (!token) return null

  let user = normalizeUser(extractUserPayload(payload))
  if (!user.email) {
    try {
      user = await getCurrentUserWithTokenLive(token)
    } catch {
      // keep best-effort user payload
    }
  }

  if (!user.email) return null
  return { token, user }
}

export function persistAuthSession(session: AuthSession): void {
  writeStoredAuthPayload(session)
}

export function clearSocialAuthParamsFromCurrentUrl(): void {
  if (typeof window === 'undefined') return

  const currentUrl = new URL(window.location.href)
  let changed = false

  for (const key of SOCIAL_SIGNAL_PARAM_KEYS) {
    if (!currentUrl.searchParams.has(key)) continue
    currentUrl.searchParams.delete(key)
    changed = true
  }

  let nextHash = currentUrl.hash
  const rawHash = currentUrl.hash.startsWith('#') ? currentUrl.hash.slice(1) : currentUrl.hash
  if (rawHash && !rawHash.startsWith('/') && rawHash.includes('=')) {
    const hashParams = new URLSearchParams(rawHash)
    let hashChanged = false
    for (const key of SOCIAL_SIGNAL_PARAM_KEYS) {
      if (!hashParams.has(key)) continue
      hashParams.delete(key)
      hashChanged = true
    }

    if (hashChanged) {
      const serialized = hashParams.toString()
      nextHash = serialized ? `#${serialized}` : ''
      changed = true
    }
  }

  if (!changed) return

  const search = currentUrl.searchParams.toString()
  const nextUrl = `${currentUrl.pathname}${search ? `?${search}` : ''}${nextHash}`
  window.history.replaceState({}, document.title, nextUrl)
}

export function getDataSourceMode(): DataSourceMode {
  return DATA_SOURCE_MODE
}

export async function getSettings(): Promise<AppSettings> {
  return withFallback(getSettingsLive, mock.getSettings)
}

export async function getFaqs(): Promise<Faq[]> {
  return withFallback(getFaqsLive, mock.getFaqs)
}

export async function getPromotions(): Promise<Promotion[]> {
  return withFallback(getPromotionsLive, mock.getPromotions)
}

export async function getCurrentUser(): Promise<User> {
  if (!LIVE_ENABLED) {
    const cachedUserPayload = readStoredAuthUserPayload()
    if (cachedUserPayload) return normalizeUser(cachedUserPayload)
    throw new Error(localizeApiErrorMessage('Not authenticated.'))
  }

  return getCurrentUserLive()
}

export async function login(payload: { email: string; password: string }): Promise<{ user: User; token: string }> {
  if (!LIVE_ENABLED) return mock.login(payload)
  return loginLive(payload)
}

export async function register(payload: {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}): Promise<{ user: User; token: string }> {
  if (!LIVE_ENABLED) return mock.register(payload)
  return registerLive(payload)
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<ForgotPasswordResult> {
  if (!LIVE_ENABLED) return mock.forgotPassword(payload)
  return forgotPasswordLive(payload)
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  if (!LIVE_ENABLED) {
    await mock.resetPassword(payload)
    return
  }
  await resetPasswordLive(payload)
}

export async function updateProfile(payload: { fullName: string; email: string; phone?: string }): Promise<User> {
  if (!LIVE_ENABLED) {
    return {
      id: 'local-user',
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
    }
  }

  return updateProfileLive(payload)
}

export async function logout(): Promise<void> {
  if (!LIVE_ENABLED) return
  await logoutLive()
}

export async function getCart(): Promise<CartItem[]> {
  return withOptionalLiveFallback(getCartLiveOptional, mock.getCart)
}

export async function addToCart(item: CartItem): Promise<CartItem[]> {
  return withOptionalLiveFallback(() => addToCartLiveOptional(item), () => mock.addToCart(item))
}

export async function updateCartItem(id: string, quantity: number, notes?: string): Promise<CartItem[]> {
  return withOptionalLiveFallback(
    () => updateCartItemLiveOptional(id, quantity, notes),
    () => mock.updateCartItem(id, quantity),
  )
}

export async function removeCartItem(id: string): Promise<CartItem[]> {
  return withOptionalLiveFallback(() => removeCartItemLiveOptional(id), () => mock.removeCartItem(id))
}

export async function clearCart(): Promise<CartItem[]> {
  return withOptionalLiveFallback(clearCartLiveOptional, mock.clearCart)
}

export async function getAddresses(): Promise<Address[]> {
  const rows = await withFallback(getAddressesLive, mock.getAddresses)
  return applyAddressRestaurantMetadata(rows)
}

export async function getCityById(id: string): Promise<CityWithNeighborhoods | null> {
  const normalizedId = id.trim()
  if (!normalizedId || !LIVE_ENABLED) return null
  if (/^(?:state|city)-\d+$/i.test(normalizedId) || /-city(?:-\d+)?$/i.test(normalizedId)) return null
  return runLocationCachedRequest(
    buildLocalizedLocationCacheKey('city-by-id', normalizedId),
    () => withOptionalLiveFallback(() => getCityByIdLive(normalizedId), async () => null),
    LOCATION_CITY_BY_ID_CACHE_TTL_MS,
  )
}

export async function addAddress(address: Omit<Address, 'id'>): Promise<Address[]> {
  const rows = await withFallback(() => addAddressLive(address), () => mock.addAddress(address))
  const normalizedRestaurantId = normalizeAddressRestaurantId(address.restaurantId)
  if (normalizedRestaurantId) {
    const matchedAddress = findAddressMatchForRestaurantTag(rows, address)
    if (matchedAddress?.id) {
      setAddressRestaurantMapEntry(matchedAddress.id, normalizedRestaurantId)
    }
  }
  return applyAddressRestaurantMetadata(rows)
}

export async function updateAddress(id: string, patch: Partial<Omit<Address, 'id'>>): Promise<Address[]> {
  const rows = await withFallback(() => updateAddressLive(id, patch), () => mock.updateAddress(id, patch))
  if ('restaurantId' in patch) {
    const normalizedRestaurantId = normalizeAddressRestaurantId(patch.restaurantId)
    if (normalizedRestaurantId) {
      setAddressRestaurantMapEntry(id, normalizedRestaurantId)
    } else {
      removeAddressRestaurantMapEntry(id)
    }
  }
  return applyAddressRestaurantMetadata(rows)
}

export async function deleteAddress(id: string): Promise<Address[]> {
  const rows = await withFallback(() => deleteAddressLive(id), () => mock.deleteAddress(id))
  removeAddressRestaurantMapEntry(id)
  return applyAddressRestaurantMetadata(rows)
}

export async function setDefaultAddress(id: string): Promise<Address[]> {
  const rows = await withFallback(() => setDefaultAddressLive(id), () => mock.setDefaultAddress(id))
  return applyAddressRestaurantMetadata(rows)
}

export async function createOrder(payload: {
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
}): Promise<Order> {
  return withFallback(() => createOrderLive(payload), () => mock.createOrder(payload))
}

export async function cancelOrder(id: string): Promise<Order[]> {
  return withFallback(() => cancelOrderLive(id), () => mock.cancelOrder(id))
}

export async function getOrders(): Promise<Order[]> {
  return withFallback(getOrdersLive, mock.getOrders)
}

export async function getOrderById(id: string): Promise<Order | null> {
  return withFallback(() => getOrderByIdLive(id), () => mock.getOrderById(id))
}

export async function validatePromoCode(payload: {
  code: string
  restaurantId?: string
  subtotal: number
}): Promise<PromoValidationResult> {
  return withFallback(
    () => validatePromoCodeLive(payload),
    async () => validatePromoCodeFallback(payload),
  )
}

export async function submitContact(payload: ContactPayload): Promise<ContactResult> {
  if (!LIVE_ENABLED) {
    return {
      success: true,
      message: 'Message sent successfully',
    }
  }

  return submitContactLive(payload)
}

export async function subscribeNewsletter(payload: NewsletterPayload): Promise<NewsletterResult> {
  return withFallback(
    () => subscribeNewsletterLive(payload),
    () => mock.subscribeNewsletter(payload),
  )
}

export async function unsubscribeNewsletter(payload: NewsletterPayload): Promise<NewsletterResult> {
  return withFallback(
    () => unsubscribeNewsletterLive(payload),
    () => mock.unsubscribeNewsletter(payload),
  )
}

export async function getFavoriteRestaurantIds(): Promise<string[]> {
  return withOptionalLiveFallback(getFavoriteRestaurantIdsLiveOptional, mock.getFavoriteRestaurantIds)
}

export async function toggleFavoriteRestaurant(restaurantId: string): Promise<string[]> {
  return withOptionalLiveFallback(
    () => toggleFavoriteRestaurantLiveOptional(restaurantId),
    () => mock.toggleFavoriteRestaurant(restaurantId),
  )
}

export async function getFavoriteProductIds(): Promise<string[]> {
  return withOptionalLiveFallback(getFavoriteProductIdsLiveOptional, mock.getFavoriteProductIds)
}

export async function toggleFavoriteProduct(productId: string): Promise<string[]> {
  return withOptionalLiveFallback(
    () => toggleFavoriteProductLiveOptional(productId),
    () => mock.toggleFavoriteProduct(productId),
  )
}

export async function getSavedCards(): Promise<SavedCard[]> {
  return mock.getSavedCards()
}

export async function addSavedCard(payload: {
  nameOnCard: string
  cardNumber: string
  expiry: string
  brand?: SavedCard['brand']
  isDefault?: boolean
}): Promise<SavedCard[]> {
  return mock.addSavedCard(payload)
}

export async function deleteSavedCard(id: string): Promise<SavedCard[]> {
  return mock.deleteSavedCard(id)
}

export async function setDefaultCard(id: string): Promise<SavedCard[]> {
  return mock.setDefaultCard(id)
}


