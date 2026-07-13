import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Container from '@/components/layout/Container'
import AddressMapModal from '@/components/modals/AddressMapModal'
import CategoriesSection from '@/components/home/CategoriesSection'
import { ArrowLeftIcon, ArrowRightIcon, LocationIcon, StarIcon, TargetIcon, XIcon } from '@/components/icons'
import Button from '@/components/ui/Button'
import clsx from 'clsx'
import { useI18n } from '@/i18n/I18nProvider'
import { toast } from '@/lib/toast'
import { getPromotions, type Promotion } from '@/api'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSelectedAddress } from '@/store/slices/deliverySlice'
import { resetFilters, setTags, setSearch, setSearchCoordinates } from '@/store/slices/restaurantsSlice'
import { fetchHomeData } from '@/store/thunks/homeThunks'
import { fetchCategories, fetchCuisineTypes, fetchAllRestaurantsLive } from '@/store/thunks/restaurantsThunks'
import type { Kitchen } from '@/store/types/domain'
import {
  DEFAULT_RESTAURANTS_BROWSE_URL,
  DEFAULT_RESTAURANTS_LATITUDE,
  DEFAULT_RESTAURANTS_LONGITUDE,
} from '@/utils/restaurantsRoute'
import { lockBodyScroll, unlockBodyScroll } from '@/utils/bodyScrollLock'
import { formatCurrency } from '@/utils/format'

const kitchenImageFallbacks = ['/images/kitchen-1.jpg', '/images/kitchen-2.jpg', '/images/kitchen-3.jpg'] as const
const WELCOME_PROMO_CODE = 'FIRST30'
const HOME_OFFER_MODAL_SEEN_STORAGE_KEY = 'albarq_home_offer_modal_seen_v1'
const SAUDI_MIN_LATITUDE = 16.0
const SAUDI_MAX_LATITUDE = 32.5
const SAUDI_MIN_LONGITUDE = 34.0
const SAUDI_MAX_LONGITUDE = 56.0

function readHomeOfferModalSeen(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(HOME_OFFER_MODAL_SEEN_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function writeHomeOfferModalSeen() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(HOME_OFFER_MODAL_SEEN_STORAGE_KEY, '1')
  } catch {
    // Ignore storage write failures.
  }
}

function formatPromoNumber(value: number): string {
  if (!Number.isFinite(value)) return '0'
  if (Math.abs(value - Math.round(value)) < 0.001) return String(Math.round(value))
  return value.toFixed(2).replace(/\.?0+$/, '')
}

function parseTimestamp(value: string | undefined): number {
  if (!value) return Number.NaN
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function parseNumericId(value: string): number {
  const numeric = Number.parseInt(value.replace(/[^\d]/g, ''), 10)
  return Number.isFinite(numeric) ? numeric : Number.NaN
}

function comparePromotionRecency(left: Promotion, right: Promotion): number {
  const leftStart = parseTimestamp(left.validFrom)
  const rightStart = parseTimestamp(right.validFrom)
  if (Number.isFinite(leftStart) && Number.isFinite(rightStart) && leftStart !== rightStart) {
    return rightStart - leftStart
  }
  if (Number.isFinite(leftStart) && !Number.isFinite(rightStart)) return -1
  if (!Number.isFinite(leftStart) && Number.isFinite(rightStart)) return 1

  const leftEnd = parseTimestamp(left.validUntil)
  const rightEnd = parseTimestamp(right.validUntil)
  if (Number.isFinite(leftEnd) && Number.isFinite(rightEnd) && leftEnd !== rightEnd) {
    return rightEnd - leftEnd
  }
  if (Number.isFinite(leftEnd) && !Number.isFinite(rightEnd)) return -1
  if (!Number.isFinite(leftEnd) && Number.isFinite(rightEnd)) return 1

  const leftId = parseNumericId(left.id)
  const rightId = parseNumericId(right.id)
  if (Number.isFinite(leftId) && Number.isFinite(rightId) && leftId !== rightId) {
    return rightId - leftId
  }
  if (Number.isFinite(leftId) && !Number.isFinite(rightId)) return -1
  if (!Number.isFinite(leftId) && Number.isFinite(rightId)) return 1

  return 0
}

function withImageVersion(urlValue: string, versionSeed: string): string {
  const trimmedUrl = urlValue.trim()
  if (!trimmedUrl) return ''
  const version = versionSeed.trim()
  if (!version) return trimmedUrl

  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    const url = new URL(trimmedUrl, base)
    url.searchParams.set('v', version)
    return url.toString()
  } catch {
    const separator = trimmedUrl.includes('?') ? '&' : '?'
    return `${trimmedUrl}${separator}v=${encodeURIComponent(version)}`
  }
}

function pickLocalizedApiText(
  lang: 'ar' | 'en',
  values: {
    ar?: string | null
    en?: string | null
    fallback?: string | null
    defaultValue?: string
  },
): string {
  const arValue = (values.ar ?? '').trim()
  const enValue = (values.en ?? '').trim()
  const fallbackValue = (values.fallback ?? '').trim()

  if (lang === 'ar') {
    return arValue || enValue || fallbackValue || values.defaultValue || ''
  }

  return enValue || arValue || fallbackValue || values.defaultValue || ''
}

function parseCoordinateQuery(rawValue: string): { latitude: number; longitude: number; coordinatesOnly: boolean } | null {
  const trimmed = rawValue.trim()
  if (!trimmed) return null

  const pairRegex = /(-?\d{1,2}(?:\.\d+)?)\s*[, ]\s*(-?\d{1,3}(?:\.\d+)?)/
  const strictPairRegex = /^-?\d{1,2}(?:\.\d+)?\s*[, ]\s*-?\d{1,3}(?:\.\d+)?$/
  const match = trimmed.match(pairRegex)
  if (!match) return null

  const latitude = Number.parseFloat(match[1])
  const longitude = Number.parseFloat(match[2])
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null

  return {
    latitude,
    longitude,
    coordinatesOnly: strictPairRegex.test(trimmed),
  }
}

function isWithinSaudiCoordinates(latitude: number, longitude: number): boolean {
  return (
    latitude >= SAUDI_MIN_LATITUDE &&
    latitude <= SAUDI_MAX_LATITUDE &&
    longitude >= SAUDI_MIN_LONGITUDE &&
    longitude <= SAUDI_MAX_LONGITUDE
  )
}

function stripCoordinatePairFromQuery(rawValue: string): string {
  return rawValue
    .replace(/(-?\d{1,2}(?:\.\d+)?)\s*[, ]\s*(-?\d{1,3}(?:\.\d+)?)/, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeCuisineFilterToken(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function resolveCuisineKeyFromKitchen(
  kitchen: Kitchen,
  options: Array<{ key: string; label: string; labelAr?: string; labelEn?: string; name?: string; nameAr?: string }>,
): string {
  const id = kitchen.id.trim()
  if (id && options.some((option) => option.key === id)) return id

  const kitchenTokens = Array.from(
    new Set(
      [kitchen.id, kitchen.title, kitchen.titleAr ?? '', kitchen.titleEn ?? '', kitchen.subtitle, kitchen.subtitleAr ?? '', kitchen.subtitleEn ?? '']
        .map((value) => normalizeCuisineFilterToken(value))
        .filter(Boolean),
    ),
  )
  if (kitchenTokens.length === 0) return ''

  for (const option of options) {
    const optionTokens = Array.from(
      new Set(
        [option.key, option.label, option.labelAr ?? '', option.labelEn ?? '', option.name ?? '', option.nameAr ?? '']
          .map((value) => normalizeCuisineFilterToken(value))
          .filter(Boolean),
      ),
    )
    if (optionTokens.length === 0) continue

    const matches = kitchenTokens.some((kitchenToken) =>
      optionTokens.some(
        (optionToken) =>
          optionToken === kitchenToken ||
          optionToken.includes(kitchenToken) ||
          kitchenToken.includes(optionToken),
      ),
    )
    if (matches) return option.key
  }

  return ''
}

export default function HomePage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { t, dir, lang } = useI18n()
  const currencyLabel = t('currency.sar')
  const settings = useAppSelector((s) => s.settings.data)
  const { kitchens, mostOrdered, suggested, loading } = useAppSelector((s) => s.home)
  const selectedAddress = useAppSelector((s) => s.delivery.selectedAddress)
  const restaurantFilters = useAppSelector((s) => s.restaurants.filters)
  const cuisineOptions = useAppSelector((s) => s.restaurants.cuisineOptions)

  const [addressQuery, setAddressQuery] = useState('')
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [offerModalOpen, setOfferModalOpen] = useState(false)
  const [offerCodeCopied, setOfferCodeCopied] = useState(false)
  const [activePromotion, setActivePromotion] = useState<Promotion | null>(null)
  const [promotionImageLoaded, setPromotionImageLoaded] = useState(false)
  const [promotionImageFailed, setPromotionImageFailed] = useState(false)
  const [heroSlideIndex, setHeroSlideIndex] = useState(0)
  const offerCodeCopiedTimeoutRef = useRef<number | null>(null)
  const mostOrderedSliderRef = useRef<HTMLDivElement>(null)

  const translateOrFallback = useMemo(
    () =>
      (key: string, fallback: string, vars?: Record<string, string | number>) => {
        const value = t(key, vars)
        const normalized = value.trim()
        if (!normalized || normalized === key) return fallback
        return value
      },
    [t],
  )

  const categories = useAppSelector((s) => s.restaurants.categories)

  const cuisineKitchenCards = useMemo<Kitchen[]>(() => {
    if (!cuisineOptions.length) return []

    const availableTerms = new Set<string>()
    mostOrdered.forEach((r) => {
      if (r.cuisine) availableTerms.add(r.cuisine.trim().toLowerCase())
      if (r.cuisineAr) availableTerms.add(r.cuisineAr.trim().toLowerCase())
      if (r.cuisineEn) availableTerms.add(r.cuisineEn.trim().toLowerCase())
      r.tags?.forEach((t) => availableTerms.add(t.trim().toLowerCase()))
    })

    return cuisineOptions.reduce<Kitchen[]>((rows, cuisine, index) => {
        const key = cuisine.key.trim()
        if (!key) return rows

        const matchTerms = [key, cuisine.name, cuisine.nameAr, cuisine.label, cuisine.labelAr, cuisine.labelEn]
          .map(t => t?.trim().toLowerCase())
          .filter(Boolean)

        const hasResults = matchTerms.some(term => availableTerms.has(term!))
        if (!hasResults) return rows

        const titleAr =
          (cuisine.nameAr ?? '').trim() ||
          (cuisine.labelAr ?? '').trim() ||
          (cuisine.name ?? '').trim() ||
          (cuisine.labelEn ?? '').trim() ||
          (cuisine.label ?? '').trim() ||
          key
        const titleEn =
          (cuisine.name ?? '').trim() ||
          (cuisine.labelEn ?? '').trim() ||
          (cuisine.nameAr ?? '').trim() ||
          (cuisine.labelAr ?? '').trim() ||
          (cuisine.label ?? '').trim() ||
          key

        rows.push({
          id: key,
          title: titleEn,
          titleAr,
          titleEn,
          subtitle: titleEn,
          subtitleAr: titleAr,
          subtitleEn: titleEn,
          imageUrl: (cuisine.imageUrl ?? '').trim() || kitchenImageFallbacks[index % kitchenImageFallbacks.length],
        })
        return rows
      }, [])
  }, [cuisineOptions, mostOrdered, kitchenImageFallbacks])
  const kitchensGrid = cuisineKitchenCards
  const heroTagline = pickLocalizedApiText(lang, {
    ar: settings?.homeHeroTaglineAr || settings?.siteDescriptionAr,
    en: settings?.homeHeroTagline || settings?.siteDescription,
    fallback:
      settings?.homeHeroTagline ||
      settings?.homeHeroTaglineAr ||
      settings?.siteDescription ||
      settings?.siteDescriptionAr,
    defaultValue: t('home.hero.tagline'),
  })
  const heroDescription = pickLocalizedApiText(lang, {
    ar: settings?.homeHeroDescriptionAr,
    en: settings?.homeHeroDescription,
    fallback: settings?.homeHeroDescription || settings?.homeHeroDescriptionAr,
    defaultValue: t('home.hero.description'),
  })
  const heroSliderImages = useMemo(
    () =>
      Array.from(
        new Set(
          kitchens
            .map((kitchen) => kitchen.imageUrl.trim())
            .filter(Boolean),
        ),
      ),
    [kitchens],
  )
  const heroManImage = heroSliderImages.length ? heroSliderImages[heroSlideIndex] : ''

  useEffect(() => {
    dispatch(fetchHomeData())
  }, [dispatch, lang])

  useEffect(() => {
    void dispatch(fetchCuisineTypes())
  }, [dispatch, lang])

  useEffect(() => {
    setHeroSlideIndex(0)
  }, [heroSliderImages])

  useEffect(() => {
    if (heroSliderImages.length <= 1) return

    const timer = window.setInterval(() => {
      setHeroSlideIndex((currentIndex) => (currentIndex + 1) % heroSliderImages.length)
    }, 3500)

    return () => {
      window.clearInterval(timer)
    }
  }, [heroSliderImages])

  useEffect(() => {
    if (readHomeOfferModalSeen()) return
    setOfferModalOpen(true)
    writeHomeOfferModalSeen()
  }, [])

  useEffect(() => {
    let active = true

    async function loadPromotions() {
      try {
        const promotions = await getPromotions()
        if (!active) return

        const now = Date.now()
        const availablePromotions = promotions
          .filter((promotion) => {
            if (!promotion.code.trim() || !promotion.isActive) return false

            const startsAt = promotion.validFrom ? Date.parse(promotion.validFrom) : Number.NaN
            if (Number.isFinite(startsAt) && startsAt > now) return false

            const endsAt = promotion.validUntil ? Date.parse(promotion.validUntil) : Number.NaN
            if (Number.isFinite(endsAt) && endsAt < now) return false

            return true
          })
          .sort(comparePromotionRecency)
        const availablePromotion =
          availablePromotions[0] ??
          [...promotions].sort(comparePromotionRecency)[0] ??
          null

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

  useEffect(() => {
    if (!offerModalOpen) return
    lockBodyScroll()
    return () => {
      unlockBodyScroll()
    }
  }, [offerModalOpen])

  useEffect(() => {
    return () => {
      if (offerCodeCopiedTimeoutRef.current !== null) {
        window.clearTimeout(offerCodeCopiedTimeoutRef.current)
      }
    }
  }, [])

  function buildRestaurantsUrl(
    cuisineKeys: string[],
    options: {
      address?: string
      search?: string
      latitude?: number
      longitude?: number
      categoryIds?: string[]
    } = {},
  ) {
    const params = new URLSearchParams()
    const normalizedCuisineKeys = Array.from(
      new Set(
        cuisineKeys
          .map((key) => key.trim())
          .filter(Boolean),
      ),
    )

    if (normalizedCuisineKeys.length) {
      params.set('cuisine', normalizedCuisineKeys.join(','))
    }

    const normalizedCategoryIds = Array.from(
      new Set(
        (options.categoryIds ?? [])
          .map((id) => id.trim())
          .filter(Boolean),
      ),
    )
    if (normalizedCategoryIds.length) {
      params.set('category', normalizedCategoryIds.join(','))
    }

    const addressOverride = typeof options.address === 'string' ? options.address : null
    const addressValue = (addressOverride ?? selectedAddress).trim()
    if (addressValue) {
      params.set('address', addressValue)
    }

    const searchValue = (options.search ?? '').trim()
    if (searchValue) {
      params.set('search', searchValue)
    }

    const hasLatitude = typeof options.latitude === 'number' && Number.isFinite(options.latitude)
    const hasLongitude = typeof options.longitude === 'number' && Number.isFinite(options.longitude)
    if (hasLatitude && hasLongitude) {
      params.set('latitude', String(options.latitude))
      params.set('longitude', String(options.longitude))
    }

    const query = params.toString()
    return `/restaurants${query ? `?${query}` : ''}`
  }

  const promoCode = activePromotion?.code.trim() || WELCOME_PROMO_CODE
  const promoFixedDiscountLabel =
    activePromotion && activePromotion.discountValue > 0
      ? formatCurrency(Math.max(0, activePromotion.discountValue), lang, currencyLabel)
      : ''
  const promoValueLabel =
    activePromotion && activePromotion.discountValue > 0
      ? activePromotion.discountType === 'percentage'
        ? `-${formatPromoNumber(activePromotion.discountValue)}%`
        : `-${promoFixedDiscountLabel}`
      : '-30%'
  const promoQuickNotePercentageFallback =
    lang === 'ar'
      ? `خصم ${formatPromoNumber(activePromotion?.discountValue ?? 0)}%`
      : `${formatPromoNumber(activePromotion?.discountValue ?? 0)}% off`
  const promoQuickNoteFixedFallback =
    lang === 'ar'
      ? `خصم ${promoFixedDiscountLabel}`
      : `${promoFixedDiscountLabel} off`
  const promoQuickNoteLimitedFallback = lang === 'ar' ? 'لفترة قصيرة فقط' : 'For a limited time'
  const promoQuickNote =
    activePromotion && activePromotion.discountValue > 0
      ? activePromotion.discountType === 'percentage'
        ? translateOrFallback('home.offer.quickNotePercentage', promoQuickNotePercentageFallback, {
            value: formatPromoNumber(activePromotion.discountValue),
          })
        : translateOrFallback('home.offer.quickNoteFixed', promoQuickNoteFixedFallback, {
            value: promoFixedDiscountLabel,
          })
      : translateOrFallback('home.offer.limitedTime', promoQuickNoteLimitedFallback)
  const promoTitle = pickLocalizedApiText(lang, {
    ar: activePromotion?.descriptionAr,
    en: activePromotion?.description,
    fallback: activePromotion?.description || activePromotion?.descriptionAr,
    defaultValue: t('home.offer.specialDiscount'),
  })

  const offerCopy =
    lang === 'ar'
      ? {
          badge: 'عرض ترحيبي محدود',
          title: promoTitle,
          subtitle: 'استمتع بطلباتك المفضلة بسرعة أكبر مع عرض ترحيبي خاص لفترة محدودة.',
          codeLabel: 'الكود',
          codeCopied: 'تم النسخ',
          copySuccess: 'تم نسخ كود الخصم',
          copyFailure: 'تعذر نسخ الكود، حاول مرة أخرى',
          primaryAction: 'اكتشف العروض',
          secondaryAction: 'لاحقًا',
          quickNote: promoQuickNote,
          value: promoValueLabel,
        }
      : {
          badge: 'Limited welcome deal',
          title: promoTitle,
          subtitle: 'Enjoy faster delivery and a limited welcome deal from your favorite restaurants.',
          codeLabel: 'Code',
          codeCopied: 'Copied',
          copySuccess: 'Promo code copied',
          copyFailure: 'Could not copy promo code. Please try again.',
          primaryAction: 'Explore offers',
          secondaryAction: 'Later',
          quickNote: promoQuickNote,
          value: promoValueLabel,
        }

  const offerFeaturedTitle = translateOrFallback(
    'home.offer.featuredTitle',
    lang === 'ar' ? 'تفاصيل الكود' : 'Promo code details',
  )
  const offerCodeSentence = translateOrFallback(
    'home.offer.codeSentence',
    lang === 'ar'
      ? `استخدم الكود ${promoCode} عند إتمام الطلب لتفعيل الخصم مباشرة.`
      : `Use ${promoCode} at checkout to activate the discount.`,
    { code: promoCode },
  )
  const offerCopyAction = translateOrFallback('home.offer.copyCode', lang === 'ar' ? 'نسخ الكود' : 'Copy code')
  const offerApplyAction = translateOrFallback('home.offer.applyOffer', lang === 'ar' ? 'أضف العرض' : 'Apply offer')
  const promotionImageUrl = useMemo(() => {
    const rawUrl = activePromotion?.imageUrl?.trim()
    if (!rawUrl) return ''
    const versionSeed = [
      activePromotion?.id ?? '',
      activePromotion?.validFrom ?? '',
      activePromotion?.validUntil ?? '',
      activePromotion?.code ?? '',
    ].join('|')
    return withImageVersion(rawUrl, versionSeed)
  }, [activePromotion])

  useEffect(() => {
    setPromotionImageLoaded(false)
    setPromotionImageFailed(false)
  }, [promotionImageUrl])

  function onSearch(e: React.FormEvent) {
    e.preventDefault()

    const query = addressQuery.trim()
    if (query) {
      const parsedCoordinates = parseCoordinateQuery(query)
      if (parsedCoordinates && !isWithinSaudiCoordinates(parsedCoordinates.latitude, parsedCoordinates.longitude)) {
        toast.error(t('map.saudiOnlyError'))
        return
      }
    }

    setAddressModalOpen(true)
  }

  function onAddressConfirm(payload: {
    label: string
    details: string
    search?: string
    latitude?: number
    longitude?: number
  }) {
    const nextAddress = (payload.details ?? '').trim()
    const rawSearch = (payload.search ?? '').trim()
    const parsedSearchCoordinates = parseCoordinateQuery(rawSearch)
    const cleanedSearch = parsedSearchCoordinates ? stripCoordinatePairFromQuery(rawSearch) : rawSearch
    const normalizedSearch = cleanedSearch.toLocaleLowerCase()
    const addressCandidates = Array.from(
      new Set(
        [nextAddress, addressQuery, selectedAddress]
          .map((value) => value.trim().toLocaleLowerCase())
          .filter(Boolean),
      ),
    )
    const searchLooksLikeAddress =
      cleanedSearch.length > 0 &&
      addressCandidates.some(
        (candidate) =>
          normalizedSearch === candidate ||
          candidate.includes(normalizedSearch) ||
          normalizedSearch.includes(candidate),
      )
    const searchValue =
      nextAddress || parsedSearchCoordinates?.coordinatesOnly || searchLooksLikeAddress ? '' : cleanedSearch
    const hasPayloadCoordinates =
      typeof payload.latitude === 'number' &&
      Number.isFinite(payload.latitude) &&
      typeof payload.longitude === 'number' &&
      Number.isFinite(payload.longitude)
    const searchLatitude =
      hasPayloadCoordinates
        ? payload.latitude
        : parsedSearchCoordinates?.latitude
    const searchLongitude =
      hasPayloadCoordinates
        ? payload.longitude
        : parsedSearchCoordinates?.longitude
    const hasSearchCoordinates =
      typeof searchLatitude === 'number' &&
      Number.isFinite(searchLatitude) &&
      typeof searchLongitude === 'number' &&
      Number.isFinite(searchLongitude)

    if (nextAddress) {
      dispatch(setSelectedAddress(nextAddress))
    } else if (searchValue || hasSearchCoordinates) {
      dispatch(setSelectedAddress(''))
    }

    setAddressQuery(
      nextAddress ||
        searchValue ||
        (hasSearchCoordinates ? `${searchLatitude.toFixed(6)}, ${searchLongitude.toFixed(6)}` : ''),
    )

    dispatch(resetFilters())
    dispatch(setTags([]))
    dispatch(setSearch(searchValue))
    dispatch(
      setSearchCoordinates({
        latitude: hasSearchCoordinates ? searchLatitude : null,
        longitude: hasSearchCoordinates ? searchLongitude : null,
      }),
    )
    navigate(
      buildRestaurantsUrl([], {
        address: nextAddress,
        search: searchValue,
        latitude: hasSearchCoordinates ? searchLatitude : undefined,
        longitude: hasSearchCoordinates ? searchLongitude : undefined,
      }),
    )
  }

  function goToAllRestaurants() {
    // Non-search home buttons should open all restaurants without address filtering.
    dispatch(setSelectedAddress(''))
    setAddressQuery('')
    dispatch(resetFilters())
    dispatch(setTags([]))
    dispatch(setSearch(''))
    navigate(DEFAULT_RESTAURANTS_BROWSE_URL)
  }

  function goToRestaurantsByKitchen(kitchen: Kitchen) {
    const cuisineKey = resolveCuisineKeyFromKitchen(kitchen, cuisineOptions)

    // Kitchen cards should open restaurants filtered by the chosen kitchen without address constraints.
    dispatch(setSelectedAddress(''))
    setAddressQuery('')
    dispatch(resetFilters())
    dispatch(setSearch(''))
    dispatch(setSearchCoordinates({ latitude: null, longitude: null }))

    if (cuisineKey) {
      dispatch(setTags([cuisineKey]))
      navigate(buildRestaurantsUrl([cuisineKey], { address: '' }))
      return
    }

    const fallbackCategoryId = kitchen.id.trim()
    dispatch(setTags([]))
    navigate(
      buildRestaurantsUrl([], {
        address: '',
        categoryIds: fallbackCategoryId ? [fallbackCategoryId] : undefined,
      }),
    )
  }

  function closeOfferModal() {
    setOfferModalOpen(false)
  }

  function openOffersPage() {
    setOfferModalOpen(false)
    navigate(DEFAULT_RESTAURANTS_BROWSE_URL)
  }

  async function copyOfferCode() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(promoCode)
      } else {
        const helper = document.createElement('textarea')
        helper.value = promoCode
        helper.setAttribute('readonly', '')
        helper.style.position = 'fixed'
        helper.style.opacity = '0'
        document.body.appendChild(helper)
        helper.select()
        const copied = document.execCommand('copy')
        document.body.removeChild(helper)
        if (!copied) throw new Error('copy_failed')
      }

      setOfferCodeCopied(true)
      toast.success(offerCopy.copySuccess)

      if (offerCodeCopiedTimeoutRef.current !== null) {
        window.clearTimeout(offerCodeCopiedTimeoutRef.current)
      }
      offerCodeCopiedTimeoutRef.current = window.setTimeout(() => {
        setOfferCodeCopied(false)
        offerCodeCopiedTimeoutRef.current = null
      }, 1800)
    } catch {
      toast.error(offerCopy.copyFailure)
    }
  }

  return (
    <>
      {offerModalOpen ? (
        <div
          className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-navy/75 p-3 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={offerCopy.title}
          onClick={closeOfferModal}
        >
          <div
            dir={dir}
            className="relative w-full max-w-5xl max-h-[calc(100dvh-1.5rem)] overflow-x-hidden overflow-y-auto rounded-[32px] border border-white/20 bg-[#030d2f] shadow-[0_24px_80px_rgba(3,8,31,0.55)] sm:max-h-[calc(100dvh-2rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={clsx(
                'absolute top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-navy text-white transition hover:brightness-110',
                dir === 'rtl' ? 'left-4' : 'right-4',
              )}
              onClick={closeOfferModal}
              aria-label={t('common.close')}
            >
              <XIcon className="h-4 w-4" />
            </button>

            <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
              <div
                className={clsx(
                  'relative overflow-hidden bg-[linear-gradient(160deg,#020b2d_0%,#062055_52%,#0a2e68_100%)] p-5 sm:p-8 lg:p-10',
                  dir === 'rtl' ? 'text-right' : 'text-left',
                )}
              >
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -top-20 end-0 h-52 w-52 rounded-full bg-primary/25 blur-3xl" />
                  <div className="absolute -bottom-20 -start-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                </div>

                <span className="relative inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold text-white/90">
                  {offerCopy.badge}
                </span>
                <h2 className="relative mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-[2.2rem]">{offerCopy.title}</h2>
                <p className="relative mt-3 max-w-lg text-sm leading-7 text-white/80">{offerCopy.subtitle}</p>

                <div className="relative mt-7 w-full max-w-2xl overflow-hidden rounded-[34px] border border-white/20 bg-[radial-gradient(110%_120%_at_100%_0%,rgba(255,110,50,0.22)_0%,rgba(255,110,50,0)_45%),linear-gradient(165deg,#03103a_0%,#05205a_56%,#082a68_100%)] p-5 shadow-[0_24px_55px_rgba(2,10,36,0.5)] ring-1 ring-white/10 sm:p-6">
                  <div className="pointer-events-none absolute -top-16 end-[-2rem] h-48 w-48 rounded-full bg-primary/30 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-20 -start-14 h-44 w-44 rounded-full bg-[#1b4fa8]/20 blur-3xl" />

                  <p className="relative text-xl font-bold tracking-tight text-white sm:text-2xl">{offerFeaturedTitle}</p>
                  <div className={clsx('relative mt-2', dir === 'rtl' ? 'text-right' : 'text-left')}>
                    <p className="text-sm leading-7 text-white/90">{offerCodeSentence}</p>
                  </div>
                  <div className={clsx('mt-6 flex flex-col gap-3.5 sm:flex-row sm:items-center sm:gap-4', dir === 'rtl' ? 'sm:flex-row-reverse' : '')}>
                    <button
                      type="button"
                      onClick={copyOfferCode}
                      className="group relative inline-flex min-h-[56px] flex-1 items-center justify-center gap-2 overflow-hidden rounded-full border border-white/28 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.07))] px-5 py-2.5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_10px_24px_rgba(2,10,36,0.26)] backdrop-blur-sm transition duration-200 hover:border-white/50 hover:bg-white/18"
                      aria-label={`${offerCopy.codeLabel} ${promoCode}`}
                    >
                      <span className="pointer-events-none absolute inset-y-0 -start-16 w-20 -skew-x-12 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <span className="inline-flex items-center px-3 text-base font-bold text-white/95">
                        {offerCodeCopied ? offerCopy.codeCopied : offerCopyAction}
                      </span>
                    </button>

                    <Button
                      type="button"
                      className="min-h-[60px] min-w-[196px] rounded-full bg-[linear-gradient(180deg,#ff7b3d_0%,#ff6424_100%)] px-9 text-base font-black text-white shadow-[0_14px_30px_rgba(255,107,45,0.46),inset_0_1px_0_rgba(255,255,255,0.22)] transition duration-200 hover:brightness-105 active:translate-y-[1px]"
                      onClick={openOffersPage}
                    >
                      {offerApplyAction}
                    </Button>
                  </div>
                </div>

                <div className={clsx('relative mt-6 flex flex-wrap gap-3', dir === 'rtl' ? 'justify-start' : 'justify-end')}>
                  <Button variant="outlineOnDark" className="h-12 rounded-full px-7 text-sm font-extrabold" onClick={closeOfferModal}>
                    {offerCopy.secondaryAction}
                  </Button>
                </div>
              </div>

              <div className="relative min-h-[220px] bg-screen lg:min-h-[520px]">
                <div
                  className={clsx(
                    'absolute inset-0 bg-[linear-gradient(135deg,#07133e_0%,#133b8b_55%,#1f5ec6_100%)] transition-opacity duration-300',
                    promotionImageLoaded && !promotionImageFailed ? 'opacity-0' : 'opacity-100',
                  )}
                />
                {promotionImageUrl ? (
                  <img
                    key={promotionImageUrl}
                    src={promotionImageUrl}
                    alt={offerCopy.title}
                    loading="eager"
                    decoding="async"
                    onLoad={() => {
                      setPromotionImageLoaded(true)
                      setPromotionImageFailed(false)
                    }}
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      setPromotionImageLoaded(false)
                      setPromotionImageFailed(true)
                    }}
                    className={clsx(
                      'h-full w-full object-cover transition-opacity duration-300',
                      promotionImageLoaded && !promotionImageFailed ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-navy/50 via-navy/10 to-transparent" />
                <div
                  className={clsx(
                    'absolute bottom-5 rounded-2xl bg-white/95 px-4 py-3 shadow-soft',
                    dir === 'rtl' ? 'left-5 text-right' : 'right-5 text-left',
                  )}
                >
                  <p className="text-xs font-semibold text-muted">{offerCopy.quickNote}</p>
                  <p className="mt-1 text-lg font-bold text-navy">{offerCopy.value}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

     {/* Hero */}
          <section className="relative max-h-[100vh]   overflow-hidden xs:max-h-[100vh] sm:overflow-visible">
        <div className="relative overflow-hidden bg-navy shadow-soft py-20  md:py-0">
          <div className="absolute inset-y-0 right-0 hidden lg:block xs:w-[300px] xl:w-[40vw]">
            <img
              src="/images/hero-shape.png"
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-center select-none"
            />
          </div>

          <Container className="relative">
                <div
                  className={clsx(
                      'flex  items-center justify-end gap-6 overflow-hidden py-8 sm:min-h-[90vh] sm:max-h-none sm:overflow-visible sm:py-10 md:min-h-[82vh] md:py-12 lg:min-h-[470px] lg:grid-cols-[1fr_minmax(460px,560px)_minmax(260px,340px)] ',
                  )}
                >
              <div className="hidden lg:block lg:order-1" aria-hidden />

              <div className={clsx('min-w-0 w-full   lg:pr-10 xl:pr-0 justify-content-start  lg:max-w-xl lg:order-2 lg:justify-self-center', dir === 'rtl' ? 'text-right' : 'mr-auto text-left')}>
                <p className="text-xs font-bold text-white/80 sm:text-sm">{heroTagline}</p>
                <h1 className="mt-2 text-2xl font-semibold leading-tight text-white sm:mt-3 sm:text-3xl md:text-4xl lg:text-5xl">
                  {t('home.hero.title')}
                </h1>
                <p className={clsx('mt-3 text-xs text-white/70 sm:mt-4 sm:text-sm', dir === 'rtl' ? 'text-right' : 'text-left')}>
                  {heroDescription}
                </p>

                <form onSubmit={onSearch} className="mt-4 w-full sm:mt-6">
                  <div dir="ltr" className="flex h-11 w-full items-stretch overflow-hidden rounded-full bg-white shadow-card sm:h-12 md:h-14">
                    <div className="flex h-full w-11 shrink-0 items-center justify-center text-navy sm:w-12 md:w-14">
                      <LocationIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <input
                      value={addressQuery}
                      onChange={(e) => setAddressQuery(e.target.value)}
                      className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-navy outline-none placeholder:text-muted-2 sm:px-4"
                      placeholder={t('home.hero.placeholder')}
                    />
                    <button
                      type="submit"
                      className="h-full min-w-[84px] shrink-0 rounded-full bg-primary px-4 text-xs font-extrabold text-white transition-all duration-200 hover:brightness-110 active:brightness-95 sm:min-w-[100px] sm:px-6 sm:text-sm md:min-w-[120px] md:px-8"
                    >
                      {t('common.search')}
                    </button>
                  </div>
                </form>
              </div>

              <div className="pointer-events-none hidden lg:flex lg:h-full lg:items-end lg:order-3 lg:justify-start">
                {heroManImage ? (
                  <img
                    src={heroManImage}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.style.visibility = 'hidden'
                    }}
                    style={{ position: 'absolute', right: '20%', bottom: '0px' }}
                    className="h-auto w-[min(100%,400px)] object-contain object-bottom select-none"
                  />
                ) : null}
              </div>
            </div>
          </Container>
        </div>

        <AddressMapModal
          open={addressModalOpen}
          onClose={() => setAddressModalOpen(false)}
          onConfirm={onAddressConfirm}
          initialQuery={addressQuery}
          initialLatitude={
            typeof restaurantFilters.latitude === 'number' && Number.isFinite(restaurantFilters.latitude)
              ? restaurantFilters.latitude
              : DEFAULT_RESTAURANTS_LATITUDE
          }
          initialLongitude={
            typeof restaurantFilters.longitude === 'number' && Number.isFinite(restaurantFilters.longitude)
              ? restaurantFilters.longitude
              : DEFAULT_RESTAURANTS_LONGITUDE
          }
        />
      </section>

      {/* Kitchens */}
      <CategoriesSection 
        kitchens={kitchensGrid}
        loading={loading}
        goToAllRestaurants={goToAllRestaurants}
        goToRestaurantsByKitchen={goToRestaurantsByKitchen}
        kitchenImageFallbacks={kitchenImageFallbacks}
      />

      {/* Most ordered - slider */}
      <section className="cv-auto py-12" dir={dir}>
        <Container>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-navy md:text-3xl">{t('home.mostOrdered.title')}</h2>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="dark"
                size="sm"
                className="h-10 shrink-0 rounded-full px-5 text-white hover:brightness-110"
                onClick={() => mostOrderedSliderRef.current?.scrollBy({ left: dir === 'rtl' ? 320 : -320, behavior: 'smooth' })}
                aria-label={dir === 'rtl' ? t('home.carousel.next') : t('home.carousel.previous')}
              >
                {dir === 'rtl' ? <ArrowRightIcon className="h-5 w-5" /> : <ArrowLeftIcon className="h-5 w-5" />}
              </Button>
              <Button
                type="button"
                variant="dark"
                size="sm"
                className="h-10 shrink-0 rounded-full px-5 text-white hover:brightness-110"
                onClick={() => mostOrderedSliderRef.current?.scrollBy({ left: dir === 'rtl' ? -320 : 320, behavior: 'smooth' })}
                aria-label={dir === 'rtl' ? t('home.carousel.previous') : t('home.carousel.next')}
              >
                {dir === 'rtl' ? <ArrowLeftIcon className="h-5 w-5" /> : <ArrowRightIcon className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <div
            ref={mostOrderedSliderRef}
            className="mt-6 flex gap-6 overflow-x-auto overscroll-x-contain scroll-smooth py-2 [scroll-snap-type:x_mandatory] [-webkit-overflow-scrolling:touch]"
          >
            {mostOrdered.map((r) => {
              const displayRestaurantName = pickLocalizedApiText(lang, {
                ar: r.nameAr,
                en: r.nameEn,
                fallback: r.name,
                defaultValue: r.name,
              })
              const displayCuisine = pickLocalizedApiText(lang, {
                ar: r.cuisineAr,
                en: r.cuisineEn,
                fallback: r.cuisine,
                defaultValue: r.cuisine,
              })

              return (
                <Link
                  key={r.id}
                  to={`/restaurants/${r.id}`}
                  className={clsx(
                    'group relative min-w-[280px] max-w-[280px] shrink-0 snap-start overflow-hidden rounded-2xl bg-white shadow-card focus:outline-none focus:ring-2 focus:ring-primary/30',
                    'sm:min-w-[300px] sm:max-w-[300px]',
                  )}
                >
                  <div className="relative h-52 sm:h-56">
                    <img
                      src={r.coverUrl}
                      alt={displayRestaurantName}
                      width={560}
                      height={352}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/70 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-14 text-white">
                      <div className={clsx('flex items-center justify-between gap-3', dir === 'rtl' ? 'flex-row-reverse' : 'flex-row')}>
                        <span className="text-sm text-white/80">{t('home.ordersCount', { count: r.ordersCount })}</span>
                        <span dir="auto" className="text-lg font-extrabold">{displayRestaurantName}</span>
                      </div>
                      <p dir="auto" className={clsx('mt-1 text-xs text-white/75', dir === 'rtl' ? 'text-right' : 'text-left')}>{displayCuisine}</p>
                      <div className={clsx('mt-2 flex flex-wrap items-center gap-2', dir === 'rtl' ? 'justify-end' : 'justify-start')}>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white">
                          <TargetIcon className="h-3.5 w-3.5 text-primary" />
                          {t('home.deliveryAvailable')}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white">
                          <StarIcon className="h-3.5 w-3.5 text-primary" />
                          {r.rating.toFixed(1)} ({r.reviewsCount})
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </Container>
      </section>

      {/* Suggested */}
      <section className="cv-auto py-12" dir={dir}>
        <Container>
          <h2 className="text-2xl font-semibold text-navy md:text-3xl">{t('home.suggested.title')}</h2>

            <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
              {suggested.map((b) => {
                const displayBrandName = pickLocalizedApiText(lang, {
                  ar: b.nameAr,
                  en: b.nameEn,
                  fallback: b.name,
                  defaultValue: b.name,
                })
                const suggestedCardImage = (b.coverUrl ?? '').trim() || b.logoUrl
                return (
                  <Link
                    key={b.id}
                    to={`/restaurants/${b.id}`}
                    className="group overflow-hidden rounded-2xl bg-white shadow-card focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <div className="relative h-52 sm:h-56">
                    <img
                      src={suggestedCardImage}
                      alt={displayBrandName}
                      width={560}
                      height={352}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = b.logoUrl
                      }}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/70 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-14 text-white">
  <div className={clsx('flex items-center gap-3', dir === 'rtl' ? 'flex-row' : 'flex-row')}>
    <div className="h-9 w-9 overflow-hidden rounded-full bg-white/95 p-1 shadow-soft">
      <img
        src={b.logoUrl}
        alt=""
        width={36}
        height={36}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-contain"
      />
    </div>
    <div className={clsx('min-w-0', dir === 'rtl' ? 'text-right' : 'text-left')}>
      <p dir="auto" className="truncate text-lg font-extrabold">{displayBrandName}</p>
      <p className="mt-0.5 text-xs text-white/80">{t('home.suggested.badge')}</p>
    </div>
  </div>
</div>
                  </div>
                </Link>
                )
              })}
            </div>
        </Container>
      </section>
    </>
  )
}
