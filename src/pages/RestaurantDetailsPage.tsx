import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import clsx from 'clsx'

import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'
import CurrencyAmount from '@/components/ui/CurrencyAmount'
import CurrencyInlineText from '@/components/ui/CurrencyInlineText'
import Input from '@/components/ui/Input'
import ToggleSwitch from '@/components/ui/ToggleSwitch'
import {
  CartIcon,
  ChevronDownIcon,
  ClockIcon,
  FacebookIcon,
  HeartIcon,
  InfoIcon,
  InstagramIcon,
  LinkedInIcon,
  ListIcon,
  LockIcon,
  LocationIcon,
  MailIcon,
  MastercardIcon,
  MinusIcon,
  PhoneIcon,
  PlusIcon,
  SnapchatIcon,
  StarIcon,
  TikTokIcon,
  TwitterIcon,
  TruckIcon,
  VisaIcon,
  WhatsAppIcon,
  YouTubeIcon,
} from '@/components/icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addItem, updateItem } from '@/store/slices/cartSlice'
import { fetchAddresses, toggleFavoriteThunk } from '@/store/slices/accountSlice'
import { toast } from '@/lib/toast'
import { useI18n } from '@/i18n/I18nProvider'
import { createReview, fetchReviews } from '@/store/slices/reviewsSlice'
import * as api from '@/api'
import type { MenuCategory, MenuItem, MenuOption } from '@/data/menuData'
import type { CartItem, Restaurant } from '@/store/types/domain'
import MenuItemModal from '@/components/modals/MenuItemModal'
import { formatCurrency, toSaudiCurrencySymbolText } from '@/utils/format'
import { DEFAULT_RESTAURANTS_BROWSE_URL } from '@/utils/restaurantsRoute'

const CHECKOUT_SELECTED_ADDRESS_ID_STORAGE_KEY = 'albarq_checkout_selected_address_id'

function readPersistedCheckoutSelectedAddressId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(CHECKOUT_SELECTED_ADDRESS_ID_STORAGE_KEY)
    return stored?.trim() || null
  } catch {
    return null
  }
}

function normalizeWishlistComparableId(value: string): string {
  const normalized = value.trim()
  if (!normalized) return ''
  if (/^\d+$/.test(normalized)) return String(Number.parseInt(normalized, 10))

  const compactRestaurantMatch = normalized.match(/^[Rr](\d+)$/)
  if (compactRestaurantMatch) {
    return String(Number.parseInt(compactRestaurantMatch[1], 10))
  }

  const prefixedNumericMatch = normalized.match(/^[A-Za-z]+(?:[-_][A-Za-z]+)*[-_](\d+)$/)
  if (prefixedNumericMatch) {
    return String(Number.parseInt(prefixedNumericMatch[1], 10))
  }

  return normalized
}

function formatPromoNumber(value: number): string {
  if (!Number.isFinite(value)) return '0'
  if (Math.abs(value - Math.round(value)) < 0.001) return String(Math.round(value))
  return value.toFixed(2).replace(/\.?0+$/, '')
}

function resolveMenuItemDiscountPercentage(item: Pick<MenuItem, 'price' | 'oldPrice' | 'discountPercentage'>): number | null {
  if (typeof item.discountPercentage === 'number' && Number.isFinite(item.discountPercentage) && item.discountPercentage > 0) {
    return item.discountPercentage
  }

  if (typeof item.oldPrice === 'number' && item.oldPrice > item.price && item.oldPrice > 0) {
    return Number((((item.oldPrice - item.price) / item.oldPrice) * 100).toFixed(2))
  }

  return null
}

function normalizeExternalUrl(value: string | undefined, platform?: 'whatsapp'): string | null {
  const raw = (value ?? '').trim()
  if (!raw) return null

  if (platform === 'whatsapp') {
    if (/^(?:https?:)?\/\//i.test(raw)) return raw
    const normalized = raw.replace(/\s+/g, '')
    const digits = normalized.replace(/[^\d+]/g, '')
    const phone = digits.replace(/^00/, '').replace(/^\+/, '')
    if (!phone) return null
    return `https://wa.me/${phone}`
  }

  if (/^(?:https?:)?\/\//i.test(raw)) return raw
  if (raw.startsWith('www.')) return `https://${raw}`
  return `https://${raw}`
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

function pickLocalizedBranchText(
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

function getLocalizedMenuItemName(item: Pick<MenuItem, 'name' | 'nameAr' | 'nameEn'>, lang: 'ar' | 'en'): string {
  return pickLocalizedMenuText(lang, {
    ar: item.nameAr,
    en: item.nameEn,
    base: item.name,
  })
}

function getLocalizedMenuItemDescription(
  item: Pick<MenuItem, 'description' | 'descriptionAr' | 'descriptionEn'>,
  lang: 'ar' | 'en',
): string {
  return pickLocalizedMenuText(lang, {
    ar: item.descriptionAr,
    en: item.descriptionEn,
    base: item.description,
  })
}

function getLocalizedMenuOptionLabel(option: MenuOption, lang: 'ar' | 'en'): string {
  return pickLocalizedMenuText(lang, {
    ar: option.labelAr,
    en: option.labelEn,
    base: option.label,
  })
}

function normalizeLookupText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function parseRestaurantKitchenNames(value: string): string[] {
  return value
    .split(/[،,|/]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function isReadableRestaurantKitchenTag(value: string): boolean {
  const normalized = normalizeLookupText(value).replace(/[_-]+/g, ' ')
  if (!normalized) return false
  if (!/[a-z\u0600-\u06ff]/i.test(value)) return false
  if (/^\d+$/.test(normalized)) return false
  if (/^(?:cat|category|cuisine|kitchen|restaurant|type|bk)\s*\d+$/i.test(normalized)) return false
  return true
}

function normalizeOptionDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
}

function isSizeOptionLabel(value: string): boolean {
  const normalized = normalizeLookupText(value)
  if (!normalized) return false

  const arabicSizePrefix = '\u0627\u0644\u062d\u062c\u0645:'
  return normalized.startsWith('size:') || normalized.startsWith(arabicSizePrefix) || normalized.startsWith('Ø§Ù„Ø­Ø¬Ù…:')
}

function parseAddonOptionPrice(optionText: string): { labelKey: string; price: number } | null {
  const raw = optionText.trim()
  if (!raw || isSizeOptionLabel(raw)) return null

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

function resolveCartItemBaseUnitPrice(item: Pick<CartItem, 'id' | 'price' | 'basePrice' | 'options'>): number {
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
  cartItem: { id: string; name: string; menuItemId?: string },
): MenuItem | undefined {
  const normalizedMenuItemId = cartItem.menuItemId?.trim()
  if (normalizedMenuItemId) {
    const byMenuItemId = menuItems.find((entry) => entry.id === normalizedMenuItemId)
    if (byMenuItemId) return byMenuItemId
  }

  const baseId = cartItem.id.split('__')[0]
  const byBaseId = menuItems.find((entry) => entry.id === baseId)
  if (byBaseId) return byBaseId

  const normalizedName = normalizeLookupText(cartItem.name)
  if (!normalizedName) return undefined

  return menuItems.find((entry) =>
    [entry.name, entry.nameAr, entry.nameEn]
      .map((value) => normalizeLookupText(value ?? ''))
      .some((value) => value === normalizedName),
  )
}

function Stars({ value, count, dir }: { value: number; count: number; dir?: 'rtl' | 'ltr' }) {
  const rounded = Math.round(value)
  return (
    <div className={clsx('flex items-center gap-1', dir === 'rtl' && 'flex-row-reverse')}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          size={16}
          filled={i < rounded}
          className={i < rounded ? 'text-primary' : 'text-border'}
        />
      ))}
      <span className={clsx('text-sm font-extrabold text-navy', dir === 'rtl' ? 'ml-1' : 'mr-1')}>({count})</span>
    </div>
  )
}

function TabButton({
  active,
  icon,
  children,
  onClick,
}: {
  active: boolean
  icon: React.ReactNode
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'relative inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold transition-all duration-300 overflow-hidden',
        active ? 'bg-primary text-white shadow-soft' : 'text-navy hover:bg-screen hover-line',
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span className="whitespace-nowrap">{children}</span>
    </button>
  )
}

type BranchMapPoint = {
  id: string
  name: string
  address?: string
  latitude: number
  longitude: number
}

const LEAFLET_JS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const LEAFLET_MARKER_ICON_URL = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'
const LEAFLET_MARKER_ICON_RETINA_URL = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png'
const LEAFLET_MARKER_SHADOW_URL = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'

type LeafletWindow = Window & {
  L?: any
  __leafletLoaderPromise?: Promise<any>
}

function loadLeafletLibrary(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Leaflet is only available in browser.'))

  const leafletWindow = window as LeafletWindow
  if (leafletWindow.L) return Promise.resolve(leafletWindow.L)
  if (leafletWindow.__leafletLoaderPromise) return leafletWindow.__leafletLoaderPromise

  leafletWindow.__leafletLoaderPromise = new Promise((resolve, reject) => {
    const existingStyleElement = document.querySelector<HTMLLinkElement>('link[data-leaflet-style="true"]')
    if (!existingStyleElement) {
      const styleElement = document.createElement('link')
      styleElement.rel = 'stylesheet'
      styleElement.href = LEAFLET_CSS_URL
      styleElement.setAttribute('data-leaflet-style', 'true')
      document.head.appendChild(styleElement)
    }

    const onLoaded = () => {
      if (leafletWindow.L) {
        resolve(leafletWindow.L)
        return
      }
      reject(new Error('Leaflet failed to initialize.'))
    }

    const existingScriptElement = document.querySelector<HTMLScriptElement>('script[data-leaflet-script="true"]')
    if (existingScriptElement) {
      existingScriptElement.addEventListener('load', onLoaded, { once: true })
      existingScriptElement.addEventListener('error', () => reject(new Error('Failed to load Leaflet script.')), {
        once: true,
      })
      return
    }

    const scriptElement = document.createElement('script')
    scriptElement.src = LEAFLET_JS_URL
    scriptElement.async = true
    scriptElement.defer = true
    scriptElement.setAttribute('data-leaflet-script', 'true')
    scriptElement.onload = onLoaded
    scriptElement.onerror = () => reject(new Error('Failed to load Leaflet script.'))
    document.body.appendChild(scriptElement)
  }).catch((error) => {
    leafletWindow.__leafletLoaderPromise = undefined
    throw error
  })

  return leafletWindow.__leafletLoaderPromise
}

function BranchesInfoMap({
  points,
  fallbackEmbedUrl,
  title,
}: {
  points: BranchMapPoint[]
  fallbackEmbedUrl: string
  title: string
}) {
  const mapElementRef = useRef<HTMLDivElement | null>(null)
  const [useIframeFallback, setUseIframeFallback] = useState(points.length === 0)

  useEffect(() => {
    if (points.length === 0) {
      setUseIframeFallback(true)
      return
    }

    setUseIframeFallback(false)

    let disposed = false
    let mapInstance: any = null

    void loadLeafletLibrary()
      .then((L) => {
        if (disposed || !mapElementRef.current) return

        const markerIcon = L.icon({
          iconUrl: LEAFLET_MARKER_ICON_URL,
          iconRetinaUrl: LEAFLET_MARKER_ICON_RETINA_URL,
          shadowUrl: LEAFLET_MARKER_SHADOW_URL,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })

        mapInstance = L.map(mapElementRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapInstance)

        const bounds = L.latLngBounds([])

        points.forEach((point) => {
          const marker = L.marker([point.latitude, point.longitude], { icon: markerIcon }).addTo(mapInstance)
          const popupText = [point.name, point.address]
            .map((value) => (typeof value === 'string' ? value.trim() : ''))
            .filter(Boolean)
            .join(' - ')

          if (popupText) marker.bindPopup(popupText)

          bounds.extend([point.latitude, point.longitude])
        })

        if (points.length === 1) {
          mapInstance.setView([points[0].latitude, points[0].longitude], 15)
        } else if (bounds.isValid()) {
          mapInstance.fitBounds(bounds, { padding: [35, 35] })
        }
      })
      .catch(() => {
        if (!disposed) setUseIframeFallback(true)
      })

    return () => {
      disposed = true
      if (mapInstance) mapInstance.remove()
    }
  }, [points])

  if (useIframeFallback) {
    return (
      <iframe
        title={title}
        className="block h-full w-full max-w-full min-h-[280px] overflow-hidden sm:min-h-[420px] lg:min-h-[500px]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={fallbackEmbedUrl}
      />
    )
  }

  return <div ref={mapElementRef} className="block h-full w-full max-w-full min-h-[280px] overflow-hidden sm:min-h-[420px] lg:min-h-[500px]" />
}

export default function RestaurantDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { t, lang, dir } = useI18n()
  const currencyLabel = t('currency.sar')
  const isMockMode = api.getDataSourceMode() === 'mock'
  const postAddToCartPath = isMockMode ? '/checkout' : '/cart'

  const user = useAppSelector((s) => s.auth.user)
  const cart = useAppSelector((s) => s.cart.items)
  const addresses = useAppSelector((s) => s.account.addresses)
  const reviews = useAppSelector((s) => s.reviews.items)
  const favoriteRestaurantIds = useAppSelector((s) => s.account.favoriteRestaurantIds)
  const settings = useAppSelector((s) => s.settings.data)
  const [cartDelivery, setCartDelivery] = useState(0)
  const [persistedCheckoutAddressId, setPersistedCheckoutAddressId] = useState<string | null>(() =>
    readPersistedCheckoutSelectedAddressId(),
  )
  const socialLinks = useMemo(
    () => [
      { key: 'facebook', url: normalizeExternalUrl(settings?.facebookUrl), icon: <FacebookIcon size={16} /> },
      { key: 'instagram', url: normalizeExternalUrl(settings?.instagramUrl), icon: <InstagramIcon size={16} /> },
      { key: 'linkedin', url: normalizeExternalUrl(settings?.linkedinUrl), icon: <LinkedInIcon size={16} /> },
      { key: 'twitter', url: normalizeExternalUrl(settings?.xUrl || settings?.twitterUrl), icon: <TwitterIcon size={16} /> },
      { key: 'youtube', url: normalizeExternalUrl(settings?.youtubeUrl), icon: <YouTubeIcon size={16} /> },
      { key: 'tiktok', url: normalizeExternalUrl(settings?.tiktokUrl), icon: <TikTokIcon size={16} /> },
      { key: 'snapchat', url: normalizeExternalUrl(settings?.snapchatUrl), icon: <SnapchatIcon size={16} /> },
      { key: 'whatsapp', url: normalizeExternalUrl(settings?.whatsappUrl, 'whatsapp'), icon: <WhatsAppIcon size={16} /> },
    ],
    [
      settings?.facebookUrl,
      settings?.instagramUrl,
      settings?.linkedinUrl,
      settings?.twitterUrl,
      settings?.xUrl,
      settings?.youtubeUrl,
      settings?.tiktokUrl,
      settings?.snapchatUrl,
      settings?.whatsappUrl,
    ],
  )

  function onSocialClick(event: MouseEvent<HTMLAnchorElement>, url: string | null) {
    if (url) return
    event.preventDefault()
    toast.info(t('contact.toast.linksSoon'))
  }

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menuData, setMenuData] = useState<{ categories: MenuCategory[]; items: MenuItem[] }>({
    categories: [],
    items: [],
  })
  const [loadingRestaurant, setLoadingRestaurant] = useState(true)
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews' | 'info' | 'branches'>('menu')
  const [branches, setBranches] = useState<api.RestaurantBranch[]>([])
  const [branchesLoading, setBranchesLoading] = useState(false)

  // Menu
  const [search, setSearch] = useState('')
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({})

  // Menu item modal
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [menuModalOpen, setMenuModalOpen] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)

  // Reviews
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [summaryCoupon, setSummaryCoupon] = useState('')
  const [summaryDiscount, setSummaryDiscount] = useState(0)
  const [applyingSummaryCoupon, setApplyingSummaryCoupon] = useState(false)
  const [activePromotion, setActivePromotion] = useState<api.Promotion | null>(null)

  // Category scroll refs
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    if (!id) return
    let cancelled = false

    const load = async () => {
      setLoadingRestaurant(true)
      setBranchesLoading(true)
      try {
        const [restaurantDetails, menu, branchRows] = await Promise.all([
          api.getRestaurantById(id),
          api.getRestaurantMenu(id),
          api.getRestaurantBranches(id),
        ])

        if (cancelled) return

        setRestaurant(restaurantDetails)
        setMenuData(menu)
        setBranches(branchRows)

        if (menu.categories.length) {
          const expanded: Record<string, boolean> = {}
          menu.categories.forEach((category) => {
            expanded[category.id] = true
          })
          setExpandedCats(expanded)
        }
      } finally {
        if (!cancelled) {
          setLoadingRestaurant(false)
          setBranchesLoading(false)
        }
      }
    }

    load()
    dispatch(fetchReviews(id))

    return () => {
      cancelled = true
    }
  }, [id, dispatch, lang])

  useEffect(() => {
    if (!user) return
    void dispatch(fetchAddresses())
  }, [dispatch, user])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const refreshAddressSelection = () => setPersistedCheckoutAddressId(readPersistedCheckoutSelectedAddressId())
    window.addEventListener('focus', refreshAddressSelection)
    return () => {
      window.removeEventListener('focus', refreshAddressSelection)
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadPromotions() {
      try {
        const promotions = await api.getPromotions()
        if (!active) return

        const now = Date.now()
        const availablePromotion =
          promotions.find((promotion) => {
            if (!promotion.code.trim() || !promotion.isActive) return false

            const startsAt = promotion.validFrom ? Date.parse(promotion.validFrom) : Number.NaN
            if (Number.isFinite(startsAt) && startsAt > now) return false

            const endsAt = promotion.validUntil ? Date.parse(promotion.validUntil) : Number.NaN
            if (Number.isFinite(endsAt) && endsAt < now) return false

            return true
          }) ?? promotions[0] ?? null

        setActivePromotion(availablePromotion)
      } catch {
        if (!active) return
        setActivePromotion(null)
      }
    }

    void loadPromotions()

    return () => {
      active = false
    }
  }, [lang])

  const categories: MenuCategory[] = useMemo(() => menuData.categories, [menuData.categories])
  const menuItems: MenuItem[] = useMemo(() => menuData.items, [menuData.items])

  const filteredItems = useMemo(() => {
    const availableItems = menuItems.filter((item) => item.isAvailable !== false)
    const q = search.trim().toLowerCase()
    if (!q) return availableItems
    return availableItems.filter((i) => i.name.toLowerCase().includes(q))
  }, [menuItems, search])

  const itemsByCategory = useMemo(() => {
    const map: Record<string, MenuItem[]> = {}
    for (const c of categories) map[c.id] = []
    for (const item of filteredItems) {
      if (!map[item.categoryId]) map[item.categoryId] = []
      map[item.categoryId].push(item)
    }
    return map
  }, [categories, filteredItems])

  const restaurantCartItems = useMemo(() => {
    if (!restaurant) return []
    return cart.filter((i) => i.restaurantId === restaurant.id)
  }, [cart, restaurant])
  const restaurantCartItemsCount = useMemo(
    () =>
      restaurantCartItems.reduce((sum, item) => {
        const safeQuantity = Math.max(1, Math.round(item.quantity))
        return sum + safeQuantity
      }, 0),
    [restaurantCartItems],
  )
  const localizedCartItemNamesById = useMemo(() => {
    const resolved: Record<string, string> = {}

    for (const cartItem of restaurantCartItems) {
      const menuItem = findMenuItemForCartItem(menuItems, cartItem)
      const displayName = menuItem ? getLocalizedMenuItemName(menuItem, lang) : cartItem.name
      resolved[cartItem.id] = toSaudiCurrencySymbolText(displayName, lang)
    }

    return resolved
  }, [restaurantCartItems, menuItems, lang])

  const cartAddonsTotal = useMemo(
    () =>
      restaurantCartItems.reduce((sum, item) => {
        const addonsPerUnit = getCartItemAddonsPricePerUnit(item.options)
        return sum + addonsPerUnit * item.quantity
      }, 0),
    [restaurantCartItems],
  )
  const cartSubtotalWithoutAddons = useMemo(
    () =>
      restaurantCartItems.reduce((sum, item) => {
        const baseUnitPrice = resolveCartItemBaseUnitPrice(item)
        return sum + baseUnitPrice * item.quantity
      }, 0),
    [restaurantCartItems],
  )
  const cartOrderSubtotal = useMemo(
    () => cartSubtotalWithoutAddons + cartAddonsTotal,
    [cartSubtotalWithoutAddons, cartAddonsTotal],
  )
  const cartTotal = Math.max(0, cartOrderSubtotal + cartDelivery - summaryDiscount)
  const selectedDeliveryStateId = useMemo(() => {
    if (!persistedCheckoutAddressId) return ''
    const selectedFromCheckout = addresses.find((address) => address.id === persistedCheckoutAddressId) ?? null
    return (selectedFromCheckout?.stateId || selectedFromCheckout?.governorateCode || '').trim()
  }, [addresses, persistedCheckoutAddressId])
  const primaryBranch = useMemo(() => branches[0] ?? null, [branches])
  const defaultContactAddress =
    lang === 'ar'
      ? settings?.contactAddressAr || settings?.contactAddress || t('restaurant.info.addressValue')
      : settings?.contactAddress || settings?.contactAddressAr || t('restaurant.info.addressValue')
  const defaultContactEmail = settings?.contactEmail || t('restaurant.info.emailValue')
  const defaultContactPhone = settings?.contactPhone || t('restaurant.info.phoneValue')
  const restaurantDisplayName = useMemo(() => {
    if (!restaurant) return ''
    const candidates =
      lang === 'ar'
        ? [restaurant.nameAr, restaurant.name, restaurant.nameEn]
        : [restaurant.nameEn, restaurant.name, restaurant.nameAr]
    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim()) return candidate.trim()
    }
    return ''
  }, [restaurant, lang])
  const restaurantDescription = useMemo(() => {
    if (!restaurant) return ''
    const candidates =
      lang === 'ar'
        ? [restaurant.descriptionAr, restaurant.description, restaurant.descriptionEn]
        : [restaurant.descriptionEn, restaurant.description, restaurant.descriptionAr]
    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim()) return candidate.trim()
    }
    return ''
  }, [restaurant, lang])
  const restaurantAddress = useMemo(() => {
    if (!restaurant) {
      const primaryBranchAddress = pickLocalizedBranchText(lang, {
        ar: primaryBranch?.addressAr,
        en: primaryBranch?.addressEn,
        base: primaryBranch?.address,
      })
      return primaryBranchAddress || defaultContactAddress
    }
    const primaryBranchAddress = pickLocalizedBranchText(lang, {
      ar: primaryBranch?.addressAr,
      en: primaryBranch?.addressEn,
      base: primaryBranch?.address,
    })
    const candidates =
      lang === 'ar'
        ? [restaurant.addressAr, restaurant.address, restaurant.addressEn, primaryBranchAddress]
        : [restaurant.addressEn, restaurant.address, restaurant.addressAr, primaryBranchAddress]
    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim()) return candidate.trim()
    }
    return defaultContactAddress
  }, [restaurant, primaryBranch, lang, defaultContactAddress])
  const restaurantEmail = useMemo(() => {
    if (typeof restaurant?.email === 'string' && restaurant.email.trim()) return restaurant.email.trim()
    return defaultContactEmail
  }, [restaurant, defaultContactEmail])
  const restaurantWorkingHoursRange = useMemo(() => {
    const opening = typeof restaurant?.openingHours === 'string' ? restaurant.openingHours.trim() : ''
    const closing = typeof restaurant?.closingHours === 'string' ? restaurant.closingHours.trim() : ''
    if (opening && closing) return `${opening} - ${closing}`
    if (opening || closing) return opening || closing
    return t('restaurant.info.workingHoursRange')
  }, [restaurant, t])
  const restaurantMinOrderLabel = useMemo(() => {
    const minimumOrder =
      typeof restaurant?.minimumOrder === 'number' && Number.isFinite(restaurant.minimumOrder)
        ? Math.max(0, restaurant.minimumOrder)
        : null

    if (minimumOrder === null) {
      return <>{toSaudiCurrencySymbolText(t('restaurant.minOrder'), lang)}</>
    }

    const marker = '__MIN_ORDER_AMOUNT__'
    const template = t('restaurant.minOrder.dynamic', { amount: marker })
    const [beforeAmount = '', afterAmount = ''] = template.split(marker)

    return (
      <>
        {beforeAmount ? <span>{toSaudiCurrencySymbolText(beforeAmount, lang)}</span> : null}
        <CurrencyAmount amount={minimumOrder} lang={lang} currencyLabel={currencyLabel} />
        {afterAmount ? <span>{toSaudiCurrencySymbolText(afterAmount, lang)}</span> : null}
      </>
    )
  }, [restaurant, lang, currencyLabel, t])
  const restaurantCuisineLabel = useMemo(() => {
    const candidate =
      lang === 'ar'
        ? restaurant?.cuisineAr || restaurant?.cuisine || restaurant?.cuisineEn || ''
        : restaurant?.cuisineEn || restaurant?.cuisine || restaurant?.cuisineAr || ''
    return typeof candidate === 'string' ? candidate.trim() : ''
  }, [restaurant, lang])
  const restaurantSummary = useMemo(() => {
    const parts: string[] = []
    if (restaurantCuisineLabel) {
      parts.push(restaurantCuisineLabel)
    }
    const orders = Math.max(0, restaurant?.ordersCount ?? 0)
    parts.push(t('home.ordersCount', { count: orders }))
    return parts.join(' | ')
  }, [restaurantCuisineLabel, restaurant?.ordersCount, t])
  const promoCode = useMemo(() => activePromotion?.code.trim() || '', [activePromotion])
  const promoTitle = useMemo(() => {
    if (!activePromotion) return t('restaurant.promo.title')

    const description =
      lang === 'ar'
        ? activePromotion.descriptionAr || activePromotion.description
        : activePromotion.description || activePromotion.descriptionAr

    if (description.trim()) return description

    const valueLabel =
      activePromotion.discountType === 'percentage'
        ? `${formatPromoNumber(activePromotion.discountValue)}%`
        : formatCurrency(Math.max(0, activePromotion.discountValue), lang, currencyLabel)

    if (activePromotion.minimumOrder > 0) {
      const minimumOrderLabel = formatCurrency(Math.max(0, activePromotion.minimumOrder), lang, currencyLabel)
      return t('restaurant.promo.discountAbove', { value: valueLabel, minimum: minimumOrderLabel })
    }

    return t('restaurant.promo.discountOnOrder', { value: valueLabel })
  }, [activePromotion, lang, t, currencyLabel])
  const promoMetaLabel = useMemo(() => {
    if (promoCode) {
      return t('restaurant.promo.codeLabel', { code: promoCode })
    }

    const startsAt = activePromotion?.validFrom ? Date.parse(activePromotion.validFrom) : Number.NaN
    const endsAt = activePromotion?.validUntil ? Date.parse(activePromotion.validUntil) : Number.NaN
    const locale = lang === 'ar' ? 'ar-SA' : 'en-US'

    if (Number.isFinite(startsAt) && Number.isFinite(endsAt)) {
      const fromLabel = new Date(startsAt).toLocaleDateString(locale, { day: '2-digit', month: 'short' })
      const toLabel = new Date(endsAt).toLocaleDateString(locale, { day: '2-digit', month: 'short' })
      return t('restaurant.promo.range', { from: fromLabel, to: toLabel })
    }

    if (Number.isFinite(endsAt)) {
      const toLabel = new Date(endsAt).toLocaleDateString(locale, { day: '2-digit', month: 'short' })
      return t('restaurant.promo.until', { to: toLabel })
    }

    return t('restaurant.promo.duration')
  }, [activePromotion, promoCode, lang, t])
  const branchMapPoints = useMemo<BranchMapPoint[]>(() => {
    const points: BranchMapPoint[] = []
    const seenCoordinates = new Set<string>()

    branches.forEach((branch, branchIndex) => {
      if (typeof branch.latitude !== 'number' || !Number.isFinite(branch.latitude)) return
      if (typeof branch.longitude !== 'number' || !Number.isFinite(branch.longitude)) return

      const dedupeKey = `${branch.latitude.toFixed(6)},${branch.longitude.toFixed(6)}`
      if (seenCoordinates.has(dedupeKey)) return
      seenCoordinates.add(dedupeKey)

      const branchDisplayName = pickLocalizedBranchText(lang, {
        ar: branch.nameAr,
        en: branch.nameEn,
        base: branch.name,
        fallback: restaurantDisplayName || restaurant?.name || '',
      })
      const branchDisplayAddress = pickLocalizedBranchText(lang, {
        ar: branch.addressAr,
        en: branch.addressEn,
        base: branch.address,
        fallback: restaurantAddress,
      })

      points.push({
        id: branch.id || `branch-${branchIndex + 1}`,
        name: branchDisplayName,
        address: branchDisplayAddress,
        latitude: branch.latitude,
        longitude: branch.longitude,
      })
    })

    if (points.length > 0) return points

    const restaurantLatitude = restaurant?.latitude
    const restaurantLongitude = restaurant?.longitude
    const hasRestaurantCoordinates =
      typeof restaurantLatitude === 'number' &&
      Number.isFinite(restaurantLatitude) &&
      typeof restaurantLongitude === 'number' &&
      Number.isFinite(restaurantLongitude)

    if (!restaurant || !hasRestaurantCoordinates) return []

    return [
      {
        id: restaurant.id,
        name: restaurantDisplayName || restaurant.name,
        address: restaurantAddress,
        latitude: restaurantLatitude,
        longitude: restaurantLongitude,
      },
    ]
  }, [branches, lang, restaurant, restaurantAddress, restaurantDisplayName])
  const restaurantMapUrl = useMemo(() => {
    const firstMapPoint = branchMapPoints[0]
    const querySource =
      (firstMapPoint ? `${firstMapPoint.latitude},${firstMapPoint.longitude}` : '') ||
      restaurant?.mapUrl ||
      primaryBranch?.mapUrl ||
      restaurantAddress ||
      primaryBranch?.address ||
      restaurantDisplayName ||
      defaultContactAddress
    return `https://www.google.com/maps?q=${encodeURIComponent(querySource)}&output=embed`
  }, [branchMapPoints, restaurant, primaryBranch, restaurantAddress, restaurantDisplayName, defaultContactAddress])
  const restaurantPhone = useMemo(() => {
    if (typeof restaurant?.phone === 'string' && restaurant.phone.trim()) return restaurant.phone.trim()
    if (typeof primaryBranch?.phone === 'string' && primaryBranch.phone.trim()) return primaryBranch.phone.trim()
    return defaultContactPhone
  }, [restaurant, primaryBranch, defaultContactPhone])
  const restaurantPhoneHref = useMemo(() => {
    const normalizePhoneToHref = (value: string) => {
      const normalized = value.replace(/[^\d+]/g, '')
      const sanitized = normalized.startsWith('+')
        ? `+${normalized.slice(1).replace(/\+/g, '')}`
        : normalized.replace(/\+/g, '')
      return sanitized ? `tel:${sanitized}` : null
    }

    return normalizePhoneToHref(restaurantPhone) || normalizePhoneToHref(defaultContactPhone)
  }, [restaurantPhone, defaultContactPhone])
  const getMenuCategoryName = (category: MenuCategory) => {
    const nameAr = typeof category.nameAr === 'string' ? category.nameAr.trim() : ''
    const nameEn = typeof category.nameEn === 'string' ? category.nameEn.trim() : ''
    const name = typeof category.name === 'string' ? category.name.trim() : ''

    if (lang === 'ar') return nameAr || name || nameEn
    return nameEn || name || nameAr
  }
  const offeredKitchens = useMemo(() => {
    const explicitKitchenNames = parseRestaurantKitchenNames(restaurantCuisineLabel).filter(Boolean)

    const fallbackKitchenNames = Array.from(
      new Set(
        (restaurant?.tags ?? [])
          .flatMap((value) => parseRestaurantKitchenNames(typeof value === 'string' ? value : ''))
          .filter((value) => isReadableRestaurantKitchenTag(value))
          .filter((value) => {
            const normalizedValue = normalizeLookupText(value)
            return explicitKitchenNames.every((entry) => {
              const normalizedEntry = normalizeLookupText(entry)
              return normalizedEntry !== normalizedValue && !normalizedEntry.includes(normalizedValue) && !normalizedValue.includes(normalizedEntry)
            })
          }),
      ),
    )

    const sourceNames = explicitKitchenNames.length ? explicitKitchenNames : fallbackKitchenNames

    return sourceNames.slice(0, 6).map((name, index) => ({
      id: `${normalizeLookupText(name)}-${index}`,
      title: name,
      subtitle: t('restaurant.kitchens.dynamicSubtitle'),
      imageUrl: restaurant?.coverUrl || '/images/kitchen-1.jpg',
    }))
  }, [restaurant?.coverUrl, restaurant?.tags, restaurantCuisineLabel, t])

  useEffect(() => {
    let active = true

    async function resolveRestaurantCartDeliveryFee() {
      if (cartOrderSubtotal <= 0 || !restaurant?.id || !selectedDeliveryStateId) {
        if (active) setCartDelivery(0)
        return
      }

      try {
        const result = await api.checkRestaurantDelivery(restaurant.id, selectedDeliveryStateId)
        if (!active) return
        if (result.available === false) {
          setCartDelivery(0)
          return
        }
        const fee = typeof result.fee === 'number' && Number.isFinite(result.fee) ? Math.max(0, result.fee) : 0
        setCartDelivery(Number(fee.toFixed(2)))
      } catch {
        if (!active) return
        setCartDelivery(0)
      }
    }

    void resolveRestaurantCartDeliveryFee()
    return () => {
      active = false
    }
  }, [cartOrderSubtotal, restaurant?.id, selectedDeliveryStateId])

  if (loadingRestaurant) {
    return <div className="py-20 text-center text-muted">{t('common.loading')}</div>
  }

  if (!restaurant) {
    return (
      <div className="py-20 text-center text-muted">
        {t('restaurant.unavailable')}
      </div>
    )
  }
  const isRestaurantClosed = restaurant.isOpen === false

  const restaurantWishlistId = normalizeWishlistComparableId(restaurant.id)
  const isFavorite = favoriteRestaurantIds.some(
    (id) => normalizeWishlistComparableId(id) === restaurantWishlistId,
  )

  async function onToggleFavorite() {
    const restaurantId = restaurant!.id
    try {
      const next = await dispatch(toggleFavoriteThunk(restaurantId)).unwrap()
      const toggledId = normalizeWishlistComparableId(restaurantId)
      const added = next.some((id) => normalizeWishlistComparableId(id) === toggledId)
      toast.success(added ? t('toast.favoriteAdded') : t('toast.favoriteRemoved'))
    } catch (error) {
      toast.error(api.resolveApiErrorMessage(error, t('toast.favoriteUpdateFailed')))
    }
  }

  function onContactRestaurant() {
    if (typeof window === 'undefined' || !restaurantPhoneHref) return
    window.location.href = restaurantPhoneHref
  }

  async function applySummaryCoupon(overrideCode?: string) {
    const code = (overrideCode ?? summaryCoupon).trim().toUpperCase()
    if (overrideCode) {
      setSummaryCoupon(code)
    }

    if (!restaurant) {
      setSummaryDiscount(0)
      return
    }

    if (!code) {
      setSummaryDiscount(0)
      return
    }

    if (cartOrderSubtotal <= 0) {
      setSummaryDiscount(0)
      toast.error(t('restaurant.toast.applyOfferRequiresCart'))
      return
    }

    try {
      setApplyingSummaryCoupon(true)
      const result = await api.validatePromoCode({
        code,
        restaurantId: restaurant.id,
        subtotal: cartOrderSubtotal,
      })

      if (!result.valid) {
        setSummaryDiscount(0)
        toast.error(result.message || t('cart.toast.invalidCoupon'))
        return
      }

      const maxDiscount = Math.max(0, cartOrderSubtotal + cartDelivery)
      const normalizedDiscount = Math.min(maxDiscount, Math.max(0, Number(result.discount || 0)))
      setSummaryDiscount(normalizedDiscount)
      toast.success(result.message || t('cart.toast.discountApplied'))
    } catch (error) {
      setSummaryDiscount(0)
      toast.error(api.resolveApiErrorMessage(error, t('cart.toast.invalidCoupon')))
    } finally {
      setApplyingSummaryCoupon(false)
    }
  }

  async function onApplyHeroPromotion() {
    if (!promoCode) {
      toast.error(t('restaurant.toast.noPromotionAvailable'))
      return
    }

    await applySummaryCoupon(promoCode)
  }

  return (
    <div className="overflow-x-hidden">
      {/* Breadcrumb - نفس ستايل صفحة Contact */}
      <div className="bg-primary/10" dir={dir}>
        <Container className="py-5">
          <nav className="text-sm font-bold text-muted" aria-label="Breadcrumb">
            <Link to="/home" className="hover:text-primary">{t('nav.home')}</Link>
            <span className="mx-2">/</span>
            <Link to={DEFAULT_RESTAURANTS_BROWSE_URL} className="hover:text-primary">{t('restaurant.breadcrumbRestaurants')}</Link>
            <span className="mx-2">/</span>
            <span className="text-navy">{restaurantDisplayName}</span>
          </nav>
        </Container>
      </div>

    <section className="py-12" dir={dir}>
        <Container>
          {/* Hero - الاتجاه حسب لغة الموقع */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-card" dir={dir}>
            <div className="relative h-52 md:h-64">
              <img src={restaurant.coverUrl} alt={restaurantDisplayName} className="h-full w-full object-cover" />

              {/* بطاقة العرض - تظهر من جهة البداية (يمين في عربي، يسار في إنجليزي) */}
              <div className={clsx('absolute top-1/2 hidden -translate-y-1/2 md:block', dir === 'rtl' ? 'right-6 left-auto' : 'left-6 right-auto')}>
                <div
                  className="relative w-[360px] max-w-[calc(100vw-5rem)] overflow-hidden rounded-[28px] border border-white/24 bg-[radial-gradient(120%_130%_at_100%_0%,rgba(255,111,46,0.24)_0%,rgba(255,111,46,0)_45%),linear-gradient(160deg,#010824_0%,#04163f_52%,#051846_100%)] px-5 py-5 text-white shadow-[0_20px_50px_rgba(2,10,36,0.52)] ring-1 ring-white/10"
                  dir={dir}
                >
                  <div className={clsx('pointer-events-none absolute -top-14 h-36 w-36 rounded-full bg-primary/35 blur-3xl', dir === 'rtl' ? '-left-8' : '-right-8')} />
                  <div className={clsx('pointer-events-none absolute -bottom-16 h-40 w-40 rounded-full bg-[#1b4fa8]/25 blur-3xl', dir === 'rtl' ? '-right-10' : '-left-10')} />

                  <div className="relative z-10">
                    <div className={clsx('max-w-[250px] text-[1.6rem] font-black leading-[1.1] tracking-[-0.02em] text-white', dir === 'rtl' ? 'text-right' : 'text-left')}>
                      {promoTitle}
                    </div>
                    <div className={clsx('mt-4 flex items-center gap-2.5', dir === 'rtl' ? 'flex-row-reverse justify-end' : 'justify-start')}>
                      <div className="inline-flex min-h-[46px] shrink-0 items-center rounded-full border border-white/35 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.06))] px-5 py-2 text-[0.95rem] font-black text-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]">
                        {promoMetaLabel}
                      </div>
                      <Button
                        size="sm"
                        className="h-[46px] shrink-0 rounded-full bg-[linear-gradient(180deg,#ff7b3d_0%,#ff6424_100%)] px-6 text-[0.95rem] font-black text-white shadow-[0_12px_24px_rgba(255,107,45,0.42),inset_0_1px_0_rgba(255,255,255,0.22)] transition duration-200 hover:brightness-105 active:translate-y-[1px]"
                        onClick={onApplyHeroPromotion}
                        disabled={applyingSummaryCoupon}
                      >
                        {t('restaurant.promo.addOffer')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              <div className={clsx('flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start lg:justify-between', dir === 'rtl' && 'lg:flex-row-reverse')}>
                {/* تفاصيل المطعم + الشعار - الشعار في أقصى اليمين في RTL، أقصى اليسار في LTR */}
                <div className={clsx('flex items-start gap-4 sm:gap-6 flex-1 min-w-0', dir === 'rtl' ? 'flex-row-reverse lg:order-2' : 'flex-row lg:order-1')}>
                  {/* تفاصيل المطعم - يظهر على اليسار في RTL وعلى اليسار في LTR */}
                  <div className={clsx('flex-1 min-w-0', dir === 'rtl' ? 'text-right order-1' : 'text-left order-2')}>
                    {/* التقييم واسم المطعم في نفس الصف */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-start">
                      <div className="text-xl sm:text-2xl font-semibold text-navy break-words">{restaurantDisplayName}</div>
                      <Stars value={restaurant.rating} count={restaurant.reviewsCount} dir={dir} />
                    </div>

                    <div className={clsx('mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted break-words', dir === 'rtl' ? 'text-right' : 'text-left')}>
                      {restaurantSummary}
                    </div>
                    {restaurantDescription ? (
                      <div className={clsx('mt-1 text-xs sm:text-sm text-muted break-words', dir === 'rtl' ? 'text-right' : 'text-left')}>
                        {restaurantDescription}
                      </div>
                    ) : null}

                    <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted justify-start">
                      <span className={clsx('inline-flex items-center gap-1.5 sm:gap-2', dir === 'rtl' && 'flex-row-reverse')}>
                        <span className="inline-flex h-2 w-2 sm:h-3 sm:w-3 items-center justify-center rounded-full bg-success shrink-0" />
                        {t('restaurant.paymentAvailable')}
                      </span>
                      <span className={clsx('inline-flex items-center gap-1.5 sm:gap-2', dir === 'rtl' && 'flex-row-reverse')}>
                        <ClockIcon className="text-success shrink-0" size={16} />
                        {t('restaurant.deliveryTime', { min: restaurant.deliveryTimeMin, max: restaurant.deliveryTimeMax })}
                      </span>
                      <span className={clsx('inline-flex items-center gap-1.5 sm:gap-2', dir === 'rtl' && 'flex-row-reverse')}>
                        <TruckIcon className="text-success shrink-0" size={16} />
                        {t('restaurant.deliveryAvailable')}
                      </span>
                    </div>
                  </div>

                  {/* الشعار - يظهر على اليمين في RTL وعلى اليسار في LTR */}
                  <div className={clsx('h-16 w-16 shrink-0 overflow-hidden rounded-2xl', dir === 'rtl' ? 'order-2' : 'order-1')}>
                    <img src={restaurant.logoUrl} alt={restaurantDisplayName} className="h-full w-full object-cover" />
                  </div>
                </div>

                {/* أزرار الإجراءات - في عمودين، على اليمين في الشاشات الصغيرة */}
                <div className={clsx('flex flex-col gap-2 sm:gap-3 w-full sm:w-auto', dir === 'rtl' ? 'sm:items-end lg:order-1 lg:w-auto' : 'sm:items-start lg:order-2 lg:w-auto')}>
                  {/* الصف الأول: الأزرار الرئيسية */}
                  <div className={clsx('flex flex-wrap items-center gap-2 w-full sm:w-auto', dir === 'rtl' ? 'justify-end' : 'justify-start')}>
                    <Button
                      className={clsx('h-10 sm:h-11 w-full sm:w-auto rounded-full px-3 sm:px-4 text-xs sm:text-sm hover-sweep md:px-6', dir === 'rtl' ? 'flex-1 sm:flex-none order-2 sm:order-1' : 'flex-1 sm:flex-none order-1')}
                      onClick={onContactRestaurant}
                    >
                      {t('restaurant.contactUs')}
                    </Button>
                    <Button
                      variant="outline"
                      className={clsx('h-10 sm:h-11 rounded-full px-3 sm:px-4 text-xs sm:text-sm hover-sweep md:px-6 shrink-0', dir === 'rtl' ? 'order-1 sm:order-2' : 'order-2')}
                      onClick={onToggleFavorite}
                    >
                      <HeartIcon className={clsx('h-4 w-4 shrink-0', isFavorite ? 'text-primary' : 'text-muted')} />
                      <span className="hidden sm:inline">{isFavorite ? t('restaurant.removeFromFavorites') : t('restaurant.addToFavorites')}</span>
                    </Button>
                  </div>

                  {/* الصف الثاني: أيقونات الدفع وأقل مبلغ */}
                  <div className={clsx('flex flex-wrap items-center gap-2 w-full sm:w-auto', dir === 'rtl' ? 'justify-end flex-row-reverse' : 'justify-start')}>
                    <div className={clsx('flex items-center gap-1 sm:gap-1.5 shrink-0', dir === 'rtl' && 'flex-row-reverse')} title={t('restaurant.paymentMethodsTitle')}>
                      <span className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center overflow-hidden rounded-lg border border-border shadow-sm">
                        <VisaIcon size={20} className="sm:w-6 sm:h-6" />
                      </span>
                      <span className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center overflow-hidden rounded-lg border border-border shadow-sm">
                        <MastercardIcon size={20} className="sm:w-6 sm:h-6" />
                      </span>
                    </div>
                    <div className={clsx('inline-flex flex-wrap items-center gap-1 text-xs font-bold text-muted sm:text-sm break-words', dir === 'rtl' ? 'justify-end text-right' : 'justify-start text-left')}>
                      {restaurantMinOrderLabel}
                    </div>
                  </div>
                </div>
              </div>

              {/* التبويبات - على اليمين في RTL، على اليسار في LTR */}
              <div className="mt-6 sm:mt-8 border-t border-border pt-4 sm:pt-6">
                <div
                  className={clsx(
                    'grid gap-2 sm:flex sm:flex-wrap sm:items-center',
                    dir === 'rtl' ? 'sm:flex-row-reverse sm:justify-end' : 'sm:flex-row sm:justify-start',
                  )}
                >
                  <TabButton
                    active={activeTab === 'info'}
                    icon={<InfoIcon className={clsx('h-4 w-4', activeTab === 'info' ? 'text-white' : 'text-navy')} />}
                    onClick={() => setActiveTab('info')}
                  >
                    {t('restaurant.tab.info')}
                  </TabButton>

                  <TabButton
                    active={activeTab === 'branches'}
                    icon={<LocationIcon className={clsx('h-4 w-4', activeTab === 'branches' ? 'text-white' : 'text-navy')} />}
                    onClick={() => setActiveTab('branches')}
                  >
                    {t('restaurant.tab.branches')}
                  </TabButton>

                  <TabButton
                    active={activeTab === 'reviews'}
                    icon={<StarIcon className={clsx('h-4 w-4', activeTab === 'reviews' ? 'text-white' : 'text-navy')} />}
                    onClick={() => setActiveTab('reviews')}
                  >
                    {t('restaurant.tab.reviews')}
                  </TabButton>

                  <TabButton
                    active={activeTab === 'menu'}
                    icon={<ListIcon className={clsx('h-4 w-4', activeTab === 'menu' ? 'text-white' : 'text-navy')} />}
                    onClick={() => setActiveTab('menu')}
                  >
                    {t('restaurant.tab.menu')}
                  </TabButton>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'menu' ? (
            <div
              className={clsx(
                'mt-6 sm:mt-8 lg:mt-10 grid min-w-0 gap-4 sm:gap-6 lg:gap-8',
                dir === 'rtl' ? 'lg:grid-cols-[300px_1fr_300px] lg:grid-flow-col-dense' : 'lg:grid-cols-[300px_1fr_300px]',
              )}
            >
              {/* Cart widget (left in LTR, right in RTL) */}
              <aside
                className={clsx(
                  'order-3 h-fit min-w-0 rounded-2xl border border-border/70 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 sm:rounded-3xl sm:p-5 md:p-5 shadow-[0_16px_38px_rgba(15,23,42,0.12)] lg:order-1',
                  dir === 'rtl' ? 'lg:col-start-3 lg:col-end-4' : 'lg:col-start-1 lg:col-end-2',
                )}
                dir={dir}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/12 text-primary ring-1 ring-primary/20 sm:h-9 sm:w-9">
                      <CartIcon size={16} aria-hidden="true" />
                    </span>
                    <span className="text-sm font-bold text-navy">{t('restaurant.cart.title')}</span>
                  </div>
                  <span
                    dir="ltr"
                    className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-full bg-primary px-2.5 text-xs font-extrabold text-white shadow-[0_8px_16px_rgba(255,107,45,0.28)]"
                  >
                    {restaurantCartItemsCount}
                  </span>
                </div>

                <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                  {restaurantCartItems.length === 0 ? (
                    <div className="rounded-xl sm:rounded-2xl bg-screen p-3 sm:p-4 text-center text-xs sm:text-sm text-muted">
                      {t('restaurant.cart.empty')}
                    </div>
                  ) : (
                    restaurantCartItems.slice(0, 3).map((ci) => (
                      <div
                        key={ci.id}
                        className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:gap-3.5 sm:p-4"
                      >
                        <div className="flex w-full min-w-0 items-start gap-2.5 sm:flex-1 sm:items-center sm:gap-3.5">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-white sm:h-14 sm:w-14">
                            <img
                              src={ci.imageUrl || '/images/dish-1.jpg'}
                              alt={localizedCartItemNamesById[ci.id] || toSaudiCurrencySymbolText(ci.name, lang)}
                              className="h-full w-full object-cover"
                            />
                          </div>
                            <div className={clsx('flex-1 min-w-0', dir === 'rtl' ? 'text-right' : 'text-left')}>
                              <div className="text-[0.95rem] font-bold leading-5 text-navy sm:text-base whitespace-normal break-normal [unicode-bidi:plaintext]" dir="auto">
                                {localizedCartItemNamesById[ci.id] || toSaudiCurrencySymbolText(ci.name, lang)}
                              </div>
                              <div className="mt-1 flex items-center gap-2 text-[13px] font-bold sm:text-sm">
                                {typeof ci.oldPrice === 'number' && ci.oldPrice > ci.price ? (
                                  <span className="text-muted line-through">
                                    <CurrencyAmount amount={ci.oldPrice} lang={lang} currencyLabel={currencyLabel} />
                                  </span>
                                ) : null}
                                <span className={typeof ci.oldPrice === 'number' && ci.oldPrice > ci.price ? 'text-primary' : 'text-muted'}>
                                  <CurrencyAmount amount={ci.price} lang={lang} currencyLabel={currencyLabel} />
                                </span>
                              </div>
                              {ci.options?.length ? (
                                <div className="mt-1 text-xs leading-5 text-muted line-clamp-2 [unicode-bidi:plaintext]" dir="auto">
                                  {(ci.options ?? []).map((option, optionIndex) => (
                                    <span key={`${ci.id}-option-${optionIndex}`}>
                                      <CurrencyInlineText text={option} lang={lang} />
                                      {optionIndex < (ci.options?.length ?? 0) - 1 ? ' | ' : ''}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                        </div>

                        <div
                          className={clsx(
                            'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-screen/80 p-1 shadow-sm sm:gap-2 sm:p-1.5',
                            'self-center',
                            dir === 'rtl' && 'flex-row-reverse',
                          )}
                        >
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await dispatch(updateItem({ id: ci.id, quantity: ci.quantity - 1 })).unwrap()
                                if (ci.quantity - 1 <= 0) toast.success(t('toast.removedFromCart'))
                              } catch (error) {
                                toast.error(api.resolveApiErrorMessage(error, t('toast.failed')))
                              }
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white transition hover:brightness-110 active:scale-95 sm:h-9 sm:w-9"
                            aria-label={t('restaurant.aria.decrease')}
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="min-w-[1.75rem] text-center text-sm font-bold text-navy sm:min-w-[2rem] sm:text-base">
                            {ci.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await dispatch(updateItem({ id: ci.id, quantity: ci.quantity + 1 })).unwrap()
                              } catch (error) {
                                toast.error(api.resolveApiErrorMessage(error, t('toast.failed')))
                              }
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white transition hover:brightness-110 active:scale-95 sm:h-9 sm:w-9"
                            aria-label={t('restaurant.aria.increase')}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {restaurantCartItems.length > 0 && (
                  <div className="mt-4 sm:mt-5 overflow-hidden rounded-[28px] bg-navy text-white shadow-[0_18px_36px_rgba(3,8,31,0.22)]">
                    <div className={clsx('flex items-center justify-between bg-primary px-4 py-3.5', dir === 'rtl' && 'flex-row-reverse')}>
                      <span className="text-sm font-extrabold tracking-tight">{t('checkout.summary.title')}</span>
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white">
                        <CartIcon size={14} />
                      </span>
                    </div>

                    <div className="p-4 sm:p-5">
                      <div className="space-y-1.5 text-xs sm:text-sm">
                        <div className={clsx('flex items-center justify-between', dir === 'rtl' && 'flex-row-reverse')}>
                          <span className="text-white/70">{t('restaurant.cart.subtotal')}</span>
                          <span className="font-bold tracking-tight text-white">
                            <CurrencyAmount amount={cartSubtotalWithoutAddons} lang={lang} currencyLabel={currencyLabel} />
                          </span>
                        </div>
                        <div className={clsx('flex items-center justify-between', dir === 'rtl' && 'flex-row-reverse')}>
                          <span className="text-white/70">{t('checkout.summary.addons')}</span>
                          <span className="font-bold tracking-tight text-white">
                            <CurrencyAmount amount={cartAddonsTotal} lang={lang} currencyLabel={currencyLabel} />
                          </span>
                        </div>
                        <div className={clsx('flex items-center justify-between', dir === 'rtl' && 'flex-row-reverse')}>
                          <span className="text-white/70">{t('restaurant.cart.delivery')}</span>
                          <span className="font-bold tracking-tight text-white">
                            <CurrencyAmount amount={cartDelivery} lang={lang} currencyLabel={currencyLabel} />
                          </span>
                        </div>
                        {summaryDiscount > 0 ? (
                          <div className={clsx('flex items-center justify-between', dir === 'rtl' && 'flex-row-reverse')}>
                            <span className="text-white/70">{t('checkout.summary.discount')}</span>
                            <span className="font-bold tracking-tight text-success">
                              <CurrencyAmount amount={-summaryDiscount} lang={lang} currencyLabel={currencyLabel} />
                            </span>
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-4 flex min-w-0 items-center gap-2.5">
                        <div className="min-w-0 flex-1">
                          <Input
                            value={summaryCoupon}
                            onChange={(e) => setSummaryCoupon(e.target.value)}
                            placeholder={t('checkout.summary.coupon')}
                            className="h-10 rounded-full border-2 border-white/30 bg-white/5 text-sm text-white placeholder:text-white/50 focus:border-primary focus:ring-2 focus:ring-primary/40"
                          />
                        </div>
                        <Button
                          size="sm"
                          className="h-10 shrink-0 rounded-2xl bg-primary px-4 text-xs font-extrabold text-white shadow-soft hover:brightness-110"
                          onClick={() => {
                            void applySummaryCoupon()
                          }}
                          disabled={applyingSummaryCoupon}
                        >
                          {applyingSummaryCoupon ? t('common.loading') : t('common.apply')}
                        </Button>
                      </div>

                      <div className={clsx('mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-sm sm:text-base', dir === 'rtl' && 'flex-row-reverse')}>
                        <span className="font-semibold text-white">{t('restaurant.cart.total')}</span>
                        <span className="font-extrabold tracking-tight text-primary">
                          <CurrencyAmount amount={cartTotal} lang={lang} currencyLabel={currencyLabel} />
                        </span>
                      </div>

                      <Link to="/cart" className="block pt-3">
                        <Button className="h-10 sm:h-11 w-full rounded-full text-sm font-extrabold tracking-tight">
                          {t('restaurant.cart.checkout')}
                        </Button>
                      </Link>

                      <div className={clsx('mt-3 flex items-center justify-center gap-1 text-[11px] font-semibold text-white/65', dir === 'rtl' && 'flex-row-reverse')}>
                        <LockIcon size={12} className="text-success" />
                        <span>{t('checkout.secure')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </aside>

              {/* Menu list (center) */}
              <div
                className={clsx(
                  'order-2 min-w-0 lg:order-2',
                  dir === 'rtl' ? 'lg:col-start-2 lg:col-end-3' : 'lg:col-start-2 lg:col-end-3',
                )}
                dir={dir}
              >
                <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-card">
                  <div className={clsx('flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3', dir === 'rtl' && 'sm:flex-row-reverse')}>
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className={clsx('h-11 p-3 sm:h-12 flex-1 rounded-full border border-border  bg-white px-4 sm:px-6 text-xs sm:text-sm font-semibold text-navy outline-none placeholder:text-muted-2 focus:border-primary focus:ring-2 focus:ring-primary/20', dir === 'rtl' ? 'text-right' : 'text-left')}
                      placeholder={t('restaurant.searchDish')}
                    />
                    <button
                      type="button"
                      className="h-11 sm:h-12 rounded-full bg-primary px-4 sm:px-8 text-xs sm:text-sm font-semibold text-white shadow-soft shrink-0"
                    >
                      {t('common.search')}
                    </button>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 space-y-6 sm:space-y-8 lg:space-y-10">
                  {categories.map((cat) => {
                    const categoryName = getMenuCategoryName(cat)
                    const open = expandedCats[cat.id]
                    const catItems = itemsByCategory[cat.id] || []

                    return (
                      <div key={cat.id} ref={(el) => (categoryRefs.current[cat.id] = el)}>
                        {/* Category header */}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedCats((prev) => ({
                              ...prev,
                              [cat.id]: !prev[cat.id],
                            }))
                          }
                            className={clsx('flex w-full items-center justify-between rounded-xl sm:rounded-full border border-border bg-white px-3 py-2.5 sm:px-4 sm:py-3 shadow-input gap-2 sm:gap-4', dir === 'rtl' && 'flex-row-reverse')}
                          >
                            <div className={clsx('flex items-center gap-2 sm:gap-4 flex-1 min-w-0', dir === 'rtl' && 'flex-row-reverse')}>
                              <div className="h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-full bg-screen shrink-0">
                              <img src={cat.imageUrl} alt={categoryName} className="h-full w-full object-cover" />
                              </div>
                            <div dir="auto" className={clsx('text-sm sm:text-base lg:text-lg font-semibold text-navy truncate', dir === 'rtl' ? 'text-right' : 'text-left')}>{categoryName}</div>
                          </div>

                          <span
                            className={clsx(
                              'inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-navy text-white transition shrink-0',
                              open ? '' : 'rotate-180',
                            )}
                          >
                            <ChevronDownIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                          </span>
                        </button>

                        {/* Items */}
                        {open ? (
                          <div className="mt-3 sm:mt-4 rounded-xl sm:rounded-2xl bg-white px-3 sm:px-4 py-2 shadow-card">
                            {catItems.length === 0 ? (
                              <div className="px-3 sm:px-4 py-4 sm:py-6 text-center text-xs sm:text-sm text-muted">{t('restaurant.noItems')}</div>
                            ) : (
                              catItems.map((mi) => (
                                (() => {
                                  const menuItemName = getLocalizedMenuItemName(mi, lang)
                                  const menuItemDescription = getLocalizedMenuItemDescription(mi, lang)
                                  const discountPercentage = resolveMenuItemDiscountPercentage(mi)
                                  const shouldShowDiscountBadge = mi.isOnSale === true && typeof discountPercentage === 'number' && discountPercentage > 0
                                  return (
                                    <div
                                      key={mi.id}
                                      className={clsx('flex items-center justify-between gap-3 sm:gap-4 border-b border-border py-3 sm:py-4 last:border-b-0', dir === 'rtl' ? 'flex-row-reverse' : 'flex-row-reverse')}
                                    >
                                      {/* السعر والأزرار - على اليسار في RTL، على اليمين في LTR */}
                                      <div className={clsx('flex items-center gap-2 sm:gap-3 shrink-0', dir === 'rtl' ? 'flex-row-reverse' : 'flex-row-reverse')}>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedItem({
                                              ...mi,
                                              name: menuItemName,
                                              description: menuItemDescription,
                                            })
                                            setMenuModalOpen(true)
                                          }}
                                          className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-navy text-white shrink-0"
                                          aria-label={t('restaurant.aria.add')}
                                        >
                                          <PlusIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                                        </button>
                                        <div className={clsx('flex flex-col gap-1', dir === 'rtl' ? 'items-end' : 'items-start')}>
                                          <div className={clsx('flex items-center gap-2', dir === 'rtl' ? 'flex-row-reverse' : 'flex-row')}>
                                            <span className="text-xs sm:text-sm font-semibold text-primary">
                                              <CurrencyAmount amount={mi.price} lang={lang} currencyLabel={currencyLabel} />
                                            </span>
                                            {shouldShowDiscountBadge ? (
                                              <span className="inline-flex rounded-full bg-primary/12 px-2 py-0.5 text-[10px] sm:text-xs font-extrabold text-primary">
                                                -{formatPromoNumber(discountPercentage)}%
                                              </span>
                                            ) : null}
                                          </div>
                                          {typeof mi.oldPrice === 'number' ? (
                                            <span className="text-xs sm:text-sm font-semibold text-muted line-through">
                                              <CurrencyAmount amount={mi.oldPrice} lang={lang} currencyLabel={currencyLabel} />
                                            </span>
                                          ) : null}
                                        </div>
                                      </div>

                                      {/* معلومات العنصر - على اليمين في RTL، على اليسار في LTR */}
                                      <div className={clsx('flex items-center gap-3 sm:gap-4 flex-1 min-w-0', dir === 'rtl' ? 'flex-row' : 'flex-row')}>
                                        <div className="h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-full bg-screen shrink-0">
                                          <img src={mi.imageUrl} alt={menuItemName} className="h-full w-full object-cover" />
                                        </div>
                                        <div className={clsx('flex-1 min-w-0', dir === 'rtl' ? 'text-right' : 'text-left')}>
                                          <div className="text-sm sm:text-base font-semibold text-navy break-words [unicode-bidi:plaintext]" dir="auto">{menuItemName}</div>
                                          <div className="mt-1 text-xs sm:text-sm text-muted line-clamp-2 [unicode-bidi:plaintext]" dir="auto">{menuItemDescription}</div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })()
                              ))
                            )}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Categories list (right in LTR, left in RTL) */}
              <aside
                className={clsx(
                  'order-1 h-fit min-w-0 rounded-2xl bg-white p-4 sm:p-5 shadow-card lg:order-3',
                  dir === 'rtl' ? 'lg:col-start-1 lg:col-end-2' : 'lg:col-start-3 lg:col-end-4',
                )}
                dir={dir}
              >
                <div className={clsx('text-xs sm:text-sm font-semibold text-navy', dir === 'rtl' ? 'text-right' : 'text-left')}>{t('restaurant.categoriesTitle')}</div>

                <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                  {categories.map((cat) => {
                    const categoryName = getMenuCategoryName(cat)
                    return (
                    <div
                      key={cat.id}
                      className={clsx(
                        'flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-border p-2 sm:p-3',
                      )}
                    >
                      <button
                        type="button"
                        className={clsx(
                          'inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary text-white shrink-0',
                        )}
                        aria-label={t('restaurant.viewMenu')}
                        onClick={() => {
                          const el = categoryRefs.current[cat.id]
                          el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }}
                      >
                        <ChevronDownIcon className={clsx('h-4 w-4', dir === 'rtl' ? '-rotate-90' : 'rotate-90')} />
                      </button>

                      <div className="ms-auto flex items-center gap-2 sm:gap-3 min-w-0 flex-row-reverse">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-full bg-screen shrink-0">
                          <img src={cat.imageUrl} alt={categoryName} className="h-full w-full object-cover" />
                        </div>
                        <div dir={dir} className={clsx('min-w-0', dir === 'rtl' ? 'text-right' : 'text-left')}>
                          <div dir="auto" className="text-xs sm:text-sm font-semibold leading-5 text-navy whitespace-normal break-words">{categoryName}</div>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              </aside>
            </div>
          ) : null}

          {activeTab === 'reviews' ? (
            <div className="mt-10 rounded-3xl bg-white p-8 shadow-card" dir={dir}>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div
                  className={clsx(
                    'w-full lg:min-w-0',
                    dir === 'rtl' ? 'text-right lg:order-2 lg:pl-6' : 'text-left lg:order-1 lg:pr-6',
                  )}
                >
                  <h2 className="text-2xl font-semibold text-navy">{t('restaurant.reviews.title')}</h2>
                  <p className="mt-2 text-sm text-muted">{t('restaurant.reviews.subtitle')}</p>
                </div>

                {!user ? (
                  <div
                    className={clsx(
                      'w-full rounded-2xl bg-primary/10 p-4 text-sm font-bold text-navy lg:max-w-xl',
                      dir === 'rtl' ? 'text-right lg:order-1' : 'text-left lg:order-2',
                    )}
                  >
                    {t('restaurant.reviews.loginRequired')}
                  </div>
                ) : (
                  <div
                    className={clsx(
                      'w-full rounded-2xl border border-border p-5 lg:max-w-xl',
                      dir === 'rtl' ? 'lg:order-1' : 'lg:order-2',
                    )}
                    dir={dir}
                  >
                    <div className={clsx('flex items-center justify-between', dir === 'rtl' && 'flex-row-reverse')}>
                      <div className={clsx('text-sm font-semibold text-navy', dir === 'rtl' ? 'text-right' : 'text-left')}>{t('restaurant.reviews.chooseRating')}</div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setRating(n)}
                            className={n <= rating ? 'text-primary' : 'text-border'}
                            aria-label={t('restaurant.reviews.chooseRating') + ` ${n}`}
                          >
                            <StarIcon filled={n <= rating} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className={clsx('mt-4 h-28 w-full resize-none rounded-2xl border border-border bg-screen p-4 text-sm text-navy outline-none placeholder:text-muted-2 focus:border-primary focus:ring-2 focus:ring-primary/20', dir === 'rtl' ? 'text-right' : 'text-left')}
                      placeholder={t('restaurant.reviews.commentPlaceholder')}
                    />

                    <Button
                      className="mt-4 h-12 rounded-2xl"
                      onClick={() => {
                        if (!comment.trim()) return
                        dispatch(
                          createReview({
                            restaurantId: restaurant.id,
                            userName: user.fullName,
                            rating,
                            comment,
                          }),
                        )
                        setComment('')
                      }}
                    >
                      {t('restaurant.reviews.submit')}
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-5">
                {reviews.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-screen p-6 text-center text-sm font-semibold text-muted">
                    {t('restaurant.reviews.empty')}
                  </div>
                ) : (
                  reviews.map((r) => (
                    <article
                      key={r.id}
                      className="rounded-3xl border border-border/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)] sm:p-6"
                      dir={dir}
                    >
                      <div className={clsx('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', dir === 'rtl' && 'sm:flex-row-reverse')}>
                        <div className={clsx('min-w-0', dir === 'rtl' ? 'text-right' : 'text-left')}>
                          <div className="text-base font-extrabold leading-6 text-navy [unicode-bidi:plaintext]" dir="auto">
                            {r.userName}
                          </div>
                          <div className={clsx('mt-2 flex items-center gap-1.5', dir === 'rtl' && 'flex-row-reverse')}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <StarIcon
                                key={i}
                                size={18}
                                filled={i < r.rating}
                                className={i < r.rating ? 'text-primary' : 'text-border'}
                              />
                            ))}
                          </div>
                        </div>
                        <time
                          className="inline-flex w-fit items-center rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-muted [unicode-bidi:plaintext]"
                          dir="auto"
                        >
                          {new Date(r.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                        </time>
                      </div>
                      <p
                        className={clsx(
                          'mt-4 rounded-2xl border border-border/70 bg-white/80 px-4 py-3 text-[15px] font-medium leading-8 text-navy/80 [unicode-bidi:plaintext]',
                          dir === 'rtl' ? 'text-right' : 'text-left',
                        )}
                        dir="auto"
                      >
                        {r.comment}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {activeTab === 'branches' ? (
            <div
              className="relative mt-10 overflow-hidden rounded-[34px] border border-border/70 bg-[linear-gradient(165deg,#ffffff_0%,#f8fafc_55%,#eef3ff_100%)] p-5 shadow-card sm:p-7"
              dir={dir}
            >
              <div className="pointer-events-none absolute -top-16 end-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 start-8 h-40 w-40 rounded-full bg-navy/5 blur-3xl" />

              <div
                className={clsx(
                  'relative rounded-3xl border border-white/80 bg-white/65 px-4 py-4 backdrop-blur-sm sm:px-5',
                  dir === 'rtl' ? 'text-right' : 'text-left',
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-navy">{t('restaurant.branches.title')}</h2>
                    <p className="mt-1.5 text-sm text-muted">{t('restaurant.branches.subtitle')}</p>
                  </div>
                  <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 px-3 text-sm font-extrabold text-primary shadow-sm">
                    {branches.length}
                  </span>
                </div>
              </div>

              {branchesLoading ? (
                <div className="relative mt-6 rounded-3xl border border-border/70 bg-white/70 p-6 text-center text-sm text-muted">
                  {t('common.loading')}
                </div>
              ) : branches.length === 0 ? (
                <div className="relative mt-6 rounded-3xl border border-border/70 bg-white/70 p-6 text-center text-sm text-muted">
                  {t('restaurant.branches.empty')}
                </div>
              ) : (
                <div className="relative mt-6 grid gap-5 lg:grid-cols-2">
                  {branches.map((branch, branchIndex) => {
                    const hasBranchCoordinates =
                      typeof branch.latitude === 'number' &&
                      Number.isFinite(branch.latitude) &&
                      typeof branch.longitude === 'number' &&
                      Number.isFinite(branch.longitude)
                    const branchDisplayState = pickLocalizedBranchText(lang, {
                      ar: branch.stateAr,
                      en: branch.stateEn,
                      base: branch.state,
                    })
                    const branchDisplayCity = pickLocalizedBranchText(lang, {
                      ar: branch.cityAr,
                      en: branch.cityEn,
                      base: branch.city,
                      fallback: branchDisplayState,
                    })
                    const branchDisplayAddress = pickLocalizedBranchText(lang, {
                      ar: branch.addressAr,
                      en: branch.addressEn,
                      base: branch.address,
                    })
                    const branchDisplayName = pickLocalizedBranchText(lang, {
                      ar: branch.nameAr,
                      en: branch.nameEn,
                      base: branch.name,
                      fallback: restaurantDisplayName || restaurant?.name || '',
                    })
                    const branchMapHref =
                      (typeof branch.mapUrl === 'string' && branch.mapUrl.trim()) ||
                      (hasBranchCoordinates ? `https://www.google.com/maps?q=${branch.latitude},${branch.longitude}` : '') ||
                      (branchDisplayAddress ? `https://www.google.com/maps?q=${encodeURIComponent(branchDisplayAddress)}` : '')

                    return (
                      <article
                        key={branch.id}
                        className="group relative overflow-hidden rounded-[28px] border border-border/70 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_32px_rgba(2,6,23,0.12)]"
                      >
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-primary/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="pointer-events-none absolute -top-14 end-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-opacity duration-300 group-hover:opacity-90" />

                        <div className="relative flex items-start gap-3">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/25 bg-[linear-gradient(180deg,#fff8f4_0%,#ffece0_100%)] text-sm font-extrabold text-primary shadow-sm">
                              {branchIndex + 1}
                            </span>
                            <div className={clsx('min-w-0', dir === 'rtl' ? 'text-right' : 'text-left')}>
                              <h3 className="truncate text-lg font-semibold text-navy [unicode-bidi:plaintext]" dir="auto">
                                {branchDisplayName || '-'}
                              </h3>
                              {branchDisplayCity ? (
                                <p className="mt-1 truncate text-xs font-medium text-muted [unicode-bidi:plaintext]" dir="auto">
                                  {branchDisplayCity}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className={clsx('relative mt-5 space-y-2.5 text-sm', dir === 'rtl' ? 'text-right' : 'text-left')}>
                          <div className="flex items-start gap-2.5 rounded-2xl border border-border/70 bg-screen/50 p-3">
                            <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                              <LocationIcon size={15} />
                            </span>
                            <div className="text-muted leading-6">
                              <span className="font-semibold text-navy">{t('restaurant.branches.address')}: </span>
                              <span className="[unicode-bidi:plaintext]" dir="auto">
                                {branchDisplayAddress || '-'}
                              </span>
                            </div>
                          </div>

                          {branchDisplayCity ? (
                            <div className="flex items-start gap-2.5 rounded-2xl border border-border/70 bg-screen/50 p-3">
                              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                                <InfoIcon size={15} />
                              </span>
                              <div className="text-muted">
                                <span className="font-semibold text-navy">{t('restaurant.branches.city')}: </span>
                                <span className="[unicode-bidi:plaintext]" dir="auto">
                                  {branchDisplayCity}
                                </span>
                              </div>
                            </div>
                          ) : null}

                          {branch.phone ? (
                            <div className="flex items-start gap-2.5 rounded-2xl border border-border/70 bg-screen/50 p-3">
                              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                                <PhoneIcon size={15} />
                              </span>
                              <div className="text-muted">
                                <span className="font-semibold text-navy">{t('restaurant.branches.phone')}: </span>
                                <a
                                  href={`tel:${branch.phone.replace(/[^\d+]/g, '')}`}
                                  className="font-semibold text-primary transition-colors hover:text-primary hover:underline [unicode-bidi:plaintext]"
                                  dir="ltr"
                                >
                                  {branch.phone}
                                </a>
                              </div>
                            </div>
                          ) : null}

                          {branchMapHref ? (
                            <div className={clsx('pt-1', dir === 'rtl' ? 'text-right' : 'text-left')}>
                              <a
                                href={branchMapHref}
                                target="_blank"
                                rel="noreferrer"
                                className={clsx(
                                  'inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:text-white sm:w-auto',
                                )}
                              >
                                <LocationIcon size={14} />
                                {t('restaurant.branches.openOnMap')}
                              </a>
                            </div>
                          ) : null}
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </div>
          ) : null}

          {activeTab === 'info' ? (
            <div className="mt-10 w-full max-w-full overflow-x-hidden" dir={dir}>
              <div className={clsx('mb-6 flex w-full max-w-full flex-col gap-4 overflow-x-hidden md:flex-row md:items-center md:justify-between', dir === 'rtl' && 'md:flex-row-reverse')}>
                <div className="flex items-center gap-4">
                  <ToggleSwitch checked={restaurant.isOpen} onChange={() => {}} label={t('restaurant.info.openNow')} className="pointer-events-none" />
                </div>

                <div className={clsx('text-sm font-bold text-muted', dir === 'rtl' ? 'text-right' : 'text-left')}>
                  {t('restaurant.info.workingHours')}
                  <span className="mx-3">|</span>
                  {restaurantWorkingHoursRange}
                </div>
              </div>

              <div className="grid w-full max-w-full min-w-0 gap-6 overflow-x-hidden lg:grid-cols-[340px_minmax(0,1fr)] lg:items-stretch">
                {/* Contact card */}
                <div className="h-full w-full max-w-full min-w-0 overflow-hidden rounded-3xl bg-navy p-6 text-white shadow-soft" dir={dir}>
                  <h3 className={clsx('text-lg font-semibold', dir === 'rtl' ? 'text-right' : 'text-left')}>{t('restaurant.info.contactTitle')}</h3>

                  <div className={clsx('mt-6 space-y-5', dir === 'rtl' ? 'text-right' : 'text-left')}>
                    <div className={clsx('flex items-start gap-3', dir === 'rtl' ? 'flex-row-reverse' : 'flex-row')}>
                      <span className="mt-1 shrink-0 text-white/80">
                        <LocationIcon />
                      </span>
                      <div className={clsx('min-w-0 flex-1', dir === 'rtl' ? 'text-right' : 'text-left')}>
                        <div className="text-sm font-semibold">{t('restaurant.info.address')}</div>
                        <div className="mt-1 text-sm leading-6 text-white/70 break-words">{restaurantAddress}</div>
                      </div>
                    </div>

                    <div className={clsx('flex items-start gap-3', dir === 'rtl' ? 'flex-row-reverse' : 'flex-row')}>
                      <span className="mt-1 shrink-0 text-white/80">
                        <PhoneIcon />
                      </span>
                      <div className={clsx('min-w-0 flex-1', dir === 'rtl' ? 'text-right' : 'text-left')}>
                        <div className="text-sm font-semibold">{t('restaurant.info.phone')}</div>
                        <div className="mt-1 text-sm text-white/70 break-all [unicode-bidi:plaintext]" dir="ltr">
                          {restaurantPhone}
                        </div>
                      </div>
                    </div>

                    <div className={clsx('flex items-start gap-3', dir === 'rtl' ? 'flex-row-reverse' : 'flex-row')}>
                      <span className="mt-1 shrink-0 text-white/80">
                        <MailIcon />
                      </span>
                      <div className={clsx('min-w-0 flex-1', dir === 'rtl' ? 'text-right' : 'text-left')}>
                        <div className="text-sm font-semibold">{t('restaurant.info.email')}</div>
                        <div className="mt-1 text-sm text-white/70 break-all [unicode-bidi:plaintext]" dir="ltr">
                          {restaurantEmail}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-white/10 pt-6">
                    <div className={clsx('text-sm font-semibold', dir === 'rtl' ? 'text-right' : 'text-left')}>{t('restaurant.info.followUs')}</div>
                    <div className={clsx('mt-4 flex flex-wrap items-center gap-3', dir === 'rtl' ? 'justify-end flex-row-reverse' : 'justify-start')}>
                      {socialLinks.map((s) => (
                        <a
                          key={s.key}
                          href={s.url || '#'}
                          target={s.url ? '_blank' : undefined}
                          rel={s.url ? 'noreferrer' : undefined}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 transition-colors"
                          onClick={(event) => onSocialClick(event, s.url)}
                        >
                          {s.icon}
                          <span className="sr-only">{t(`social.${s.key}`)}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="h-full w-full max-w-full min-w-0 overflow-hidden rounded-3xl border border-border bg-white shadow-card">
                  <BranchesInfoMap points={branchMapPoints} fallbackEmbedUrl={restaurantMapUrl} title={t('map.title')} />
                </div>
              </div>

              {/* Kitchens cards */}
              {offeredKitchens.length > 0 ? (
                <div className="mt-10" dir={dir}>
                  <h3 className={clsx('text-2xl font-semibold text-navy md:text-3xl', dir === 'rtl' ? 'text-right' : 'text-left')}>{t('restaurant.kitchens.title')}</h3>
                  <div className="mt-6 grid w-full max-w-full grid-cols-1 gap-6 overflow-x-hidden md:grid-cols-3">
                    {offeredKitchens.map((k) => (
                      <div key={k.id} className="relative h-60 w-full max-w-full overflow-hidden rounded-3xl shadow-card">
                        <img src={k.imageUrl} alt={k.title} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/10" />
                        <div className={clsx('absolute bottom-4', dir === 'rtl' ? 'right-4' : 'left-4')}>
                          <div className={clsx('text-sm font-bold text-primary drop-shadow-sm', dir === 'rtl' ? 'text-right' : 'text-left')}>{k.subtitle}</div>
                          <div className={clsx('mt-1 text-xl font-semibold text-white drop-shadow-md md:text-2xl', dir === 'rtl' ? 'text-right' : 'text-left')}>{k.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </Container>
      </section>
      {/* Menu item modal */}
      <MenuItemModal
        open={menuModalOpen}
        item={selectedItem}
        addingToCart={addingToCart || isRestaurantClosed}
        onClose={() => {
          setMenuModalOpen(false)
          setSelectedItem(null)
        }}
        onAddToCart={({ item, quantity, selectedSize, selectedAddons, unitPrice }) => {
          if (addingToCart) return
          if (isRestaurantClosed) {
            toast.error(t('restaurant.unavailable'))
            return
          }
          if (!user) {
            navigate('/login')
            return
          }

          if (!restaurant) return

          const options: string[] = []
          const idParts: string[] = [item.id]

          if (selectedSize) {
            const sizeOptionLabel = getLocalizedMenuOptionLabel(selectedSize, lang)
            const sizeLabel = t('restaurant.optionSize', { label: sizeOptionLabel })
            options.push(`${sizeLabel} (${formatCurrency(selectedSize.price, lang, currencyLabel)})`)
            idParts.push(`size:${selectedSize.id}`)
          } else {
            idParts.push('size:none')
          }

          const sortedAddons = [...selectedAddons].sort((a, b) => a.id.localeCompare(b.id))
          const addonsExtra = sortedAddons.reduce((sum, addon) => sum + addon.price, 0)
          for (const a of sortedAddons) {
            const addonLabel = getLocalizedMenuOptionLabel(a, lang)
            options.push(`${addonLabel} (${formatCurrency(a.price, lang, currencyLabel)})`)
            idParts.push(`addon:${a.id}`)
          }

          const cartId = idParts.join('__')
          const optionExtrasPrice = Math.max(0, unitPrice - item.price)
          const oldUnitPrice =
            typeof item.oldPrice === 'number' && item.oldPrice > item.price
              ? Math.max(unitPrice, Number((item.oldPrice + optionExtrasPrice).toFixed(2)))
              : undefined

          setAddingToCart(true)
          dispatch(
            addItem({
              id: cartId,
              restaurantId: restaurant.id,
              menuItemId: item.id,
              addonIds: sortedAddons.map((addon) => addon.id),
              name: getLocalizedMenuItemName(item, lang),
              price: unitPrice,
              vatPercentage: item.vatPercentage,
              vatIncluded: item.vatIncluded,
              basePrice: Math.max(0, unitPrice - addonsExtra),
              oldPrice: oldUnitPrice,
              quantity,
              imageUrl: item.imageUrl,
              options,
            }),
          )
            .unwrap()
            .then(() => {
              toast.success(t('toast.addedToCart'))
              navigate(postAddToCartPath)
            })
            .catch((error) => {
              toast.error(api.resolveApiErrorMessage(error, t('toast.failed')))
              if (isMockMode) {
                navigate('/checkout')
              }
            })
            .finally(() => {
              setAddingToCart(false)
            })

          setMenuModalOpen(false)
          setSelectedItem(null)
        }}
      />
    </div>
  )
}
