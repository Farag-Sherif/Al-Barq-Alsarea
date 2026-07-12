import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'

import clsx from 'clsx'
import Container from '@/components/layout/Container'
import { ArrowLeftIcon, ArrowRightIcon, SearchIcon, StarIcon } from '@/components/icons'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import Select from '@/components/ui/Select'
import ToggleSwitch from '@/components/ui/ToggleSwitch'
import { useDebounce } from '@/hooks/useDebounce'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSelectedAddress } from '@/store/slices/deliverySlice'
import {
  resetFilters,
  setCategoryIds,
  setCuisineChecked,
  setCuisineKeys,
  setMinRating,
  setOpenNow,
  setPage,
  setSearch,
  setSearchCoordinates,
  setSortBy,
  toggleCategory,
} from '@/store/slices/restaurantsSlice'
import { fetchCategories, fetchCuisineTypes, fetchRestaurants } from '@/store/thunks/restaurantsThunks'
import FilterSection from '@/components/restaurants/FilterSection'
import RestaurantRow from '@/components/restaurants/RestaurantRow'
import { useI18n } from '@/i18n/I18nProvider'
import {
  DEFAULT_RESTAURANTS_ADDRESS,
  DEFAULT_RESTAURANTS_LATITUDE,
  DEFAULT_RESTAURANTS_LONGITUDE,
} from '@/utils/restaurantsRoute'

const cuisineAliasesByKey: Record<string, string[]> = {
  egypt: ['egypt', 'egyptian', 'masri', 'masry', 'مصري', 'مصر'],
  saudi: ['saudi', 'gulf', 'khaleeji', 'khaliji', 'سعودي', 'خليجي'],
  italian: ['italian', 'pizza', 'pasta', 'إيطالي', 'ايطالي', 'بيتزا', 'باستا'],
  asian: ['asian', 'sushi', 'chinese', 'thai', 'japanese', 'آسيوي', 'اسيوي'],
  grill: ['grill', 'grilled', 'bbq', 'barbecue', 'مشويات', 'شواء'],
  dessert: ['dessert', 'desserts', 'sweet', 'حلويات', 'حلوي'],
}
function normalizeCuisineFilterToken(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeAddressSearchToken(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[،,]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function formatAddressForDisplay(address: string, lang: 'ar' | 'en'): string {
  const parts = address
    .split(/[،,]+/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) return ''
  return parts.join(lang === 'ar' ? '، ' : ', ')
}

function resolveCuisineKeysFromQueryParam(
  rawValues: string[],
  options: Array<{ key: string; label: string; labelAr?: string; labelEn?: string }>,
): string[] {
  const values = Array.from(new Set(rawValues.map((value) => value.trim()).filter(Boolean)))
  if (!values.length) return []
  if (!options.length) return values

  const normalizedOptions = options.map((option) => ({
    key: option.key,
    normalizedKey: normalizeCuisineFilterToken(option.key),
    normalizedLabels: Array.from(
      new Set(
        [option.label, option.labelAr ?? '', option.labelEn ?? '']
          .map((value) => normalizeCuisineFilterToken(value))
          .filter(Boolean),
      ),
    ),
  }))

  const resolved: string[] = []

  for (const value of values) {
    const normalizedValue = normalizeCuisineFilterToken(value)
    if (!normalizedValue) continue

    const directKeyMatch = normalizedOptions.find((option) => option.normalizedKey === normalizedValue)
    if (directKeyMatch) {
      resolved.push(directKeyMatch.key)
      continue
    }

    const aliasEntry = Object.entries(cuisineAliasesByKey).find(([canonicalKey, aliases]) => {
      if (normalizeCuisineFilterToken(canonicalKey) === normalizedValue) return true
      return aliases.some((alias) => normalizeCuisineFilterToken(alias) === normalizedValue)
    })

    if (aliasEntry) {
      const [canonicalKey, aliases] = aliasEntry
      const canonicalOption = normalizedOptions.find(
        (option) => option.normalizedKey === normalizeCuisineFilterToken(canonicalKey),
      )
      if (canonicalOption) {
        resolved.push(canonicalOption.key)
        continue
      }

      const aliasesToCheck = [canonicalKey, ...aliases]
      const aliasOption = normalizedOptions.find((option) =>
        aliasesToCheck.some((alias) => {
          const normalizedAlias = normalizeCuisineFilterToken(alias)
          if (!normalizedAlias) return false
          return option.normalizedLabels.some(
            (label) => label.includes(normalizedAlias) || normalizedAlias.includes(label),
          )
        }),
      )
      if (aliasOption) {
        resolved.push(aliasOption.key)
        continue
      }
    }

    const labelMatch = normalizedOptions.find((option) => {
      return option.normalizedLabels.some(
        (label) => label.includes(normalizedValue) || normalizedValue.includes(label),
      )
    })
    if (labelMatch) {
      resolved.push(labelMatch.key)
      continue
    }

    resolved.push(value)
  }

  return Array.from(new Set(resolved))
}

function resolveCategoryIdsFromQueryParam(
  rawValues: string[],
  options: Array<{ id: string; name: string; nameAr?: string; nameEn?: string }>,
): string[] {
  const values = Array.from(new Set(rawValues.map((value) => value.trim()).filter(Boolean)))
  if (!values.length) return []
  if (!options.length) return values

  const normalizedOptions = options.map((option) => ({
    id: option.id,
    normalizedId: normalizeCuisineFilterToken(option.id),
    normalizedLabels: Array.from(
      new Set([option.name, option.nameAr ?? '', option.nameEn ?? ''].map((value) => normalizeCuisineFilterToken(value)).filter(Boolean)),
    ),
  }))

  const resolved: string[] = []
  for (const value of values) {
    const normalizedValue = normalizeCuisineFilterToken(value)
    if (!normalizedValue) continue

    const directMatch = normalizedOptions.find((option) => option.normalizedId === normalizedValue)
    if (directMatch) {
      resolved.push(directMatch.id)
      continue
    }

    const labelMatch = normalizedOptions.find((option) =>
      option.normalizedLabels.some((label) => label === normalizedValue || label.includes(normalizedValue) || normalizedValue.includes(label)),
    )
    if (labelMatch) {
      resolved.push(labelMatch.id)
      continue
    }

    resolved.push(value)
  }

  return Array.from(new Set(resolved))
}

export default function RestaurantsPage() {
  const dispatch = useAppDispatch()
  const { t, dir, lang } = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()
  const { categories, cuisineOptions, items, total, loading, filters } = useAppSelector((s) => s.restaurants)
  const selectedAddress = useAppSelector((s) => s.delivery.selectedAddress)

  const [searchInput, setSearchInput] = useState(filters.search)
  const [showAllCuisines, setShowAllCuisines] = useState(false)
  const debouncedSearch = useDebounce(searchInput, 450)

  // Categories carousel
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  const pageCount = Math.max(1, Math.ceil(total / filters.pageSize))
  const cuisineParam = searchParams.get('cuisine') ?? ''
  const categoryParam = searchParams.get('category') ?? searchParams.get('category_ids') ?? ''
  const parsedCuisineParamValues = useMemo(
    () =>
      cuisineParam
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    [cuisineParam],
  )
  const parsedCategoryParamValues = useMemo(
    () =>
      categoryParam
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    [categoryParam],
  )
  const resolvedCuisineParamKeys = useMemo(
    () => resolveCuisineKeysFromQueryParam(parsedCuisineParamValues, cuisineOptions),
    [parsedCuisineParamValues, cuisineOptions],
  )
  const resolvedCategoryParamIds = useMemo(
    () => resolveCategoryIdsFromQueryParam(parsedCategoryParamValues, categories),
    [parsedCategoryParamValues, categories],
  )
  const showAllMode = searchParams.get('all') === '1'
  const addressParam = (searchParams.get('address') ?? '').trim()
  const searchParam = (searchParams.get('search') ?? '').trim()
  const normalizedAddressParam = normalizeAddressSearchToken(addressParam)
  const normalizedSearchParam = normalizeAddressSearchToken(searchParam)
  const searchLooksLikeAddress =
    Boolean(normalizedAddressParam) &&
    Boolean(normalizedSearchParam) &&
    (normalizedAddressParam === normalizedSearchParam ||
      normalizedAddressParam.includes(normalizedSearchParam) ||
      normalizedSearchParam.includes(normalizedAddressParam))
  const effectiveSearchParam = searchLooksLikeAddress ? '' : searchParam
  const latitudeParamRaw = searchParams.get('latitude')
  const longitudeParamRaw = searchParams.get('longitude')
  const latitudeParam = latitudeParamRaw ? Number.parseFloat(latitudeParamRaw) : Number.NaN
  const longitudeParam = longitudeParamRaw ? Number.parseFloat(longitudeParamRaw) : Number.NaN
  const parsedLatitude = Number.isFinite(latitudeParam) ? latitudeParam : null
  const parsedLongitude = Number.isFinite(longitudeParam) ? longitudeParam : null
  const hasCuisineOrCategoryQuery = parsedCuisineParamValues.length > 0 || parsedCategoryParamValues.length > 0
  const hasOnlyCuisineOrCategoryFilter =
    hasCuisineOrCategoryQuery &&
    !addressParam &&
    !effectiveSearchParam &&
    parsedLatitude === null &&
    parsedLongitude === null
  const activeAddress =
    showAllMode || hasOnlyCuisineOrCategoryFilter ? '' : addressParam || selectedAddress || DEFAULT_RESTAURANTS_ADDRESS
  const formattedActiveAddress = useMemo(
    () => formatAddressForDisplay(activeAddress, lang),
    [activeAddress, lang],
  )
  const maxCuisineCountsRef = useRef<Map<string, number>>(new Map())
  const lastBaseSignatureRef = useRef<string>('')

  const baseSignature = `${activeAddress}|${effectiveSearchParam}|${parsedCategoryParamValues.join(',')}`
  if (lastBaseSignatureRef.current !== baseSignature) {
    maxCuisineCountsRef.current.clear()
    lastBaseSignatureRef.current = baseSignature
  }

  const cuisineCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const option of cuisineOptions) {
      counts.set(option.key, 0)
    }

    for (const item of items) {
      const rawValues = [item.cuisine, item.cuisineAr, item.cuisineEn, ...(item.tags || [])].filter(Boolean) as string[]
      const keys = resolveCuisineKeysFromQueryParam(rawValues, cuisineOptions)
      for (const k of keys) {
        counts.set(k, (counts.get(k) || 0) + 1)
      }
    }

    // Accumulate the maximum seen count so filters don't disappear when one is selected
    for (const [key, count] of counts.entries()) {
      const currentMax = maxCuisineCountsRef.current.get(key) || 0
      if (count > currentMax) {
        maxCuisineCountsRef.current.set(key, count)
      }
    }

    return counts
  }, [items, cuisineOptions])

  const maxCategoryCountsRef = useRef<Map<string, number>>(new Map())

  if (lastBaseSignatureRef.current !== baseSignature) {
    maxCategoryCountsRef.current.clear()
    // lastBaseSignatureRef is already updated above
  }

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const cat of categories) {
      counts.set(cat.id, 0)
    }

    for (const item of items) {
      const rawValues = [item.cuisine, item.cuisineAr, item.cuisineEn, ...(item.tags || [])].filter(Boolean) as string[]
      const ids = resolveCategoryIdsFromQueryParam(rawValues, categories)
      for (const id of ids) {
        counts.set(id, (counts.get(id) || 0) + 1)
      }
    }

    // Accumulate the maximum seen count
    for (const [id, count] of counts.entries()) {
      const currentMax = maxCategoryCountsRef.current.get(id) || 0
      if (count > currentMax) {
        maxCategoryCountsRef.current.set(id, count)
      }
    }

    return counts
  }, [items, categories])

  const validCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        const maxSeen = maxCategoryCountsRef.current.get(cat.id) || 0
        const current = categoryCounts.get(cat.id) || 0
        const isSelected = filters.selectedCategoryIds.includes(cat.id)
        return maxSeen > 0 || current > 0 || isSelected
      })
      .sort((a, b) => {
        const countA = Math.max(maxCategoryCountsRef.current.get(a.id) || 0, categoryCounts.get(a.id) || 0)
        const countB = Math.max(maxCategoryCountsRef.current.get(b.id) || 0, categoryCounts.get(b.id) || 0)
        return countB - countA
      })
  }, [categories, categoryCounts, filters.selectedCategoryIds])

  const validCuisineOptions = useMemo(() => {
    return cuisineOptions
      .filter((option) => {
        const maxSeen = maxCuisineCountsRef.current.get(option.key) || 0
        const current = cuisineCounts.get(option.key) || 0
        const isSelected = filters.cuisineKeys.includes(option.key)
        return maxSeen > 0 || current > 0 || isSelected
      })
      .sort((a, b) => {
        const countA = Math.max(maxCuisineCountsRef.current.get(a.key) || 0, cuisineCounts.get(a.key) || 0)
        const countB = Math.max(maxCuisineCountsRef.current.get(b.key) || 0, cuisineCounts.get(b.key) || 0)
        return countB - countA
      })
  }, [cuisineOptions, cuisineCounts, filters.cuisineKeys])

  const visibleCuisineOptions = useMemo(() => {
    if (showAllCuisines) return validCuisineOptions

    const baseOptions = validCuisineOptions.slice(0, 6)
    const baseKeys = new Set(baseOptions.map((option) => option.key))
    const selectedOutsideBase = validCuisineOptions.filter(
      (option) => filters.cuisineKeys.includes(option.key) && !baseKeys.has(option.key),
    )
    return [...baseOptions, ...selectedOutsideBase]
  }, [validCuisineOptions, filters.cuisineKeys, showAllCuisines])
  const canToggleCuisineView = validCuisineOptions.length > 6
  const appliedFilterParamsRef = useRef('')
  const rawFilterParamsSignature = useMemo(
    () => `${parsedCategoryParamValues.join(',')}|${parsedCuisineParamValues.join(',')}`,
    [parsedCategoryParamValues, parsedCuisineParamValues],
  )

  useEffect(() => {
    dispatch(fetchCategories())
    dispatch(fetchCuisineTypes())
  }, [dispatch, lang])

  useEffect(() => {
    if (!showAllMode) return
    dispatch(resetFilters())
    setSearchInput('')
  }, [dispatch, showAllMode])

  useEffect(() => {
    if (!parsedCuisineParamValues.length && !parsedCategoryParamValues.length) {
      appliedFilterParamsRef.current = ''
      return
    }
    if (parsedCuisineParamValues.length && !cuisineOptions.length) return
    if (parsedCategoryParamValues.length && !categories.length) return
    if (appliedFilterParamsRef.current === rawFilterParamsSignature) return

    dispatch(resetFilters())
    dispatch(setCategoryIds(resolvedCategoryParamIds.length ? resolvedCategoryParamIds : parsedCategoryParamValues))
    dispatch(setCuisineKeys(resolvedCuisineParamKeys.length ? resolvedCuisineParamKeys : parsedCuisineParamValues))
    setSearchInput('')
    appliedFilterParamsRef.current = rawFilterParamsSignature
  }, [
    categories.length,
    cuisineOptions.length,
    dispatch,
    parsedCategoryParamValues,
    parsedCuisineParamValues,
    rawFilterParamsSignature,
    resolvedCategoryParamIds,
    resolvedCuisineParamKeys,
  ])

  useEffect(() => {
    if (!searchLooksLikeAddress || !searchParam) return

    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('search')
    setSearchParams(nextParams, { replace: true })
  }, [searchLooksLikeAddress, searchParam, searchParams, setSearchParams])

  useEffect(() => {
    if (showAllMode) return
    if (addressParam) {
      if (addressParam === selectedAddress) return
      dispatch(setSelectedAddress(addressParam))
      return
    }

    const hasSearchOnlyFlow = Boolean(effectiveSearchParam)
    const hasGeoOnlyFlow = parsedLatitude !== null && parsedLongitude !== null
    if (hasSearchOnlyFlow || hasGeoOnlyFlow || hasOnlyCuisineOrCategoryFilter) {
      if (selectedAddress) {
        dispatch(setSelectedAddress(''))
      }
    }
  }, [
    addressParam,
    dispatch,
    hasOnlyCuisineOrCategoryFilter,
    parsedLatitude,
    parsedLongitude,
    effectiveSearchParam,
    selectedAddress,
    showAllMode,
  ])

  useEffect(() => {
    dispatch(setSearchCoordinates({ latitude: parsedLatitude, longitude: parsedLongitude }))
  }, [dispatch, parsedLatitude, parsedLongitude])

  useEffect(() => {
    setSearchInput(effectiveSearchParam)
    dispatch(setSearch(effectiveSearchParam))
  }, [effectiveSearchParam, dispatch])

  useEffect(() => {
    if (showAllMode) return
    const shouldApplyDefaultLocation =
      !effectiveSearchParam &&
      !addressParam &&
      parsedLatitude === null &&
      parsedLongitude === null &&
      !hasCuisineOrCategoryQuery
    if (!shouldApplyDefaultLocation) return

    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('address', DEFAULT_RESTAURANTS_ADDRESS)
    nextParams.set('latitude', String(DEFAULT_RESTAURANTS_LATITUDE))
    nextParams.set('longitude', String(DEFAULT_RESTAURANTS_LONGITUDE))

    setSearchParams(nextParams, { replace: true })
  }, [
    addressParam,
    hasCuisineOrCategoryQuery,
    parsedLatitude,
    parsedLongitude,
    effectiveSearchParam,
    searchParams,
    setSearchParams,
    showAllMode,
  ])

  useEffect(() => {
    dispatch(setSearch(debouncedSearch))
  }, [debouncedSearch, dispatch])

  useEffect(() => {
    dispatch(fetchRestaurants({ ignoreSelectedAddress: showAllMode || hasOnlyCuisineOrCategoryFilter }))
  }, [
    dispatch,
    hasOnlyCuisineOrCategoryFilter,
    lang,
    showAllMode,
    selectedAddress,
    filters.search,
    filters.latitude,
    filters.longitude,
    filters.selectedCategoryIds,
    filters.cuisineKeys,
    filters.minRating,
    filters.openNow,
    filters.sortBy,
    filters.page,
  ])

  function scrollCategories(direction: 'prev' | 'next') {
    const el = scrollerRef.current
    if (!el) return
    const amount = 340
    el.scrollBy({ left: direction === 'prev' ? -amount : amount, behavior: 'smooth' })
  }

  const fromCount = Math.min(filters.pageSize, total)

  return (
    <>
      {/* Breadcrumb - نفس ستايل صفحة Contact */}
      <div className="bg-primary/10">
        <Container className="py-5">
          <div className="text-sm font-bold" dir={dir}>
            <Link to="/home" className="text-muted hover:text-primary">{t('nav.home')}</Link>
            <span className="mx-2 text-muted">/</span>
            <span className="text-navy">{t('restaurants.breadcrumbRestaurants')}</span>
          </div>
        </Container>
      </div>

      {activeAddress ? (
        <div className="border-b border-border bg-white/80">
          <Container className={clsx('py-3 flex', dir === 'rtl' ? 'justify-end' : 'justify-start')}>
            <div
              className={clsx(
                'inline-flex max-w-full flex-col gap-1 rounded-2xl border border-border bg-white px-4 py-2 shadow-input',
                dir === 'rtl' ? 'items-end text-right' : 'items-start text-left',
              )}
              dir={dir}
            >
              <span className="text-[11px] font-bold text-muted">{t('restaurants.deliveryTo')}</span>
              <span className="max-w-full break-words text-sm font-semibold leading-6 text-navy" dir={dir}>
                {formattedActiveAddress}
              </span>
            </div>
          </Container>
        </div>
      ) : null}

      <section className="py-12 overflow-x-hidden">
        <Container className="px-4 sm:px-6">
          {/* <h1 className="text-2xl font-semibold text-navy md:text-3xl mb-8">{t('restaurants.title')}</h1> */}
          <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_360px] min-w-0">
            {/* Main */}
            <div className="min-w-0 order-2 lg:order-1">
              {/* Categories - اتجاه التمرير يتوافق مع لغة الصفحة */}
              <div className="flex items-center justify-between gap-6">
                <h2 className="text-2xl font-semibold text-navy md:text-3xl">{t('restaurants.categoriesTitle')}</h2>
                <div className={`flex items-center gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <Button
                    variant="dark"
                    size="sm"
                    onClick={() => scrollCategories('prev')}
                    className="w-12 rounded-full !px-0"
                    aria-label={t('restaurants.ariaPrev')}
                  >
                    <ArrowLeftIcon size={18} />
                  </Button>
                  <Button
                    variant="dark"
                    size="sm"
                    onClick={() => scrollCategories('next')}
                    className="w-12 rounded-full !px-0"
                    aria-label={t('restaurants.ariaNext')}
                  >
                    <ArrowRightIcon size={18} />
                  </Button>
                </div>
              </div>

              <div
                ref={scrollerRef}
                dir="ltr"
                className="mt-6 flex gap-6 p-5 overflow-x-auto pb-3"
                style={{ scrollSnapType: 'x mandatory' }}
              >
                {validCategories.map((c) => {
                  const categoryName = lang === 'ar' ? c.nameAr || c.name : c.nameEn || c.name || c.nameAr || ''
                  const isSelected = filters.selectedCategoryIds.includes(c.id)
                  
                  // Compute dynamic count
                  const currentCount = categoryCounts.get(c.id) || 0
                  const maxCount = maxCategoryCountsRef.current.get(c.id) || 0
                  const displayCount = Math.max(currentCount, maxCount, c.restaurantsCount || 0)

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => dispatch(toggleCategory(c.id))}
                      className={clsx(
                        'relative h-[220px] w-[220px] min-w-[220px] shrink-0 overflow-hidden rounded-xl border-2 bg-white text-start shadow-card transition-all duration-200 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
                        isSelected ? 'border-primary' : 'border-transparent hover:scale-[1.02] hover:shadow-md',
                      )}
                      style={{ scrollSnapAlign: 'start' }}
                      aria-pressed={isSelected}
                    >
                      <img src={c.imageUrl} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy via-navy/90 to-transparent px-5 pb-5 pt-12">
                        <div className="flex items-center justify-between gap-3 text-white">
                          <span className="text-xs text-white/70">{t('restaurants.restaurantCount', { count: displayCount })}</span>
                          <span className="text-sm font-semibold">{categoryName}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Header controls */}
              <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-navy md:text-3xl">{t('restaurants.restaurantsList')}</h2>
                  <p className="mt-2 text-sm text-muted">
                    {t('restaurants.resultsCount', { from: fromCount, total })}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <Select
                    label={t('restaurants.sortLabel')}
                    value={filters.sortBy}
                    onChange={(e) => dispatch(setSortBy(e.target.value as any))}
                  >
                    <option value="rating">{t('restaurants.sortRating')}</option>
                    <option value="orders">{t('restaurants.sortOrders')}</option>
                  </Select>

                  <ToggleSwitch
                    checked={filters.openNow}
                    onChange={(v) => dispatch(setOpenNow(v))}
                    label={t('restaurants.openNow')}
                  />
                </div>
              </div>

              {/* List */}
              <div className="mt-6 flex flex-col gap-5">
                {loading
                  ? Array.from({ length: 6 }).map((_, idx) => (
                      <div key={idx} className="h-[120px] rounded-2xl bg-white shadow-card animate-pulse" />
                    ))
                  : items.map((r) => <RestaurantRow key={r.id} restaurant={r} />)}
              </div>

              {/* Pagination */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted">
                  {t('restaurants.pageOf', { current: filters.page, total: pageCount })}
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="!rounded-full"
                    disabled={filters.page <= 1}
                    onClick={() => dispatch(setPage(Math.max(1, filters.page - 1)))}
                  >
                    {t('restaurants.prev')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="!rounded-full"
                    disabled={filters.page >= pageCount}
                    onClick={() => dispatch(setPage(Math.min(pageCount, filters.page + 1)))}
                  >
                    {t('restaurants.next')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="h-fit min-w-0 rounded-2xl bg-white p-6 ps-6 pe-6 shadow-card overflow-hidden order-1 lg:order-2" dir={dir}>
              <div className="flex h-12 w-full items-center gap-2 rounded-full border border-border bg-white px-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="shrink-0 !rounded-full px-5"
                  style={{ height: '36px' }}
                  onClick={() => dispatch(setSearch(searchInput))}
                >
                  {t('common.search')}
                </Button>
                <input
                  type="text"
                  dir="auto"
                  placeholder={t('restaurants.searchPlaceholder')}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-full min-w-0 flex-1 rounded-full bg-transparent px-2 text-start text-sm font-medium text-navy outline-none placeholder:text-muted"
                />
                <span className="pointer-events-none inline-flex shrink-0 items-center justify-center px-2 text-muted">
                  <SearchIcon size={18} />
                </span>
              </div>

              <FilterSection title={t('restaurants.cuisineType')} defaultOpen>
                <div className="space-y-3 ps-1 pe-1">
                  {visibleCuisineOptions.map((c) => (
                    <div key={c.key} className="flex items-center justify-between gap-2">
                      {(() => {
                        const translationKey = `restaurants.cuisine.${c.key}`
                        const translatedLabel = t(translationKey)
                        const fallbackTranslatedLabel = translatedLabel === translationKey ? '' : translatedLabel
                        const label =
                          lang === 'ar'
                            ? c.labelAr || c.label || c.labelEn || fallbackTranslatedLabel
                            : c.labelEn || c.label || c.labelAr || fallbackTranslatedLabel
                        return (
                          <Checkbox
                            checked={filters.cuisineKeys.includes(c.key)}
                            onChange={(checked) => dispatch(setCuisineChecked({ key: c.key, checked }))}
                            label={label}
                          />
                        )
                      })()}
                    </div>
                  ))}
                </div>

                {canToggleCuisineView ? (
                  <button
                    type="button"
                    className="mt-4 rounded-full text-sm font-extrabold text-navy hover:text-primary"
                    onClick={() => setShowAllCuisines((prev) => !prev)}
                  >
                    {showAllCuisines ? t('restaurants.showLess') : t('restaurants.seeMore')}
                  </button>
                ) : null}
              </FilterSection>

              <FilterSection title={t('restaurants.rating')} defaultOpen>
                <div className="space-y-3 ps-1 pe-1">
                  {[5, 4, 3, 2, 1].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => dispatch(setMinRating(filters.minRating === n ? null : n))}
                      className="flex w-full items-center justify-between gap-2 rounded-full px-3 py-2 hover:bg-screen"
                      aria-label={lang === 'ar' ? `${n} نجوم` : `${n} stars`}
                      aria-pressed={filters.minRating === n}
                    >
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon key={i} size={16} className={i < n ? 'text-primary' : 'text-border'} />
                        ))}
                      </div>
                      <span
                        className={
                          'h-4 w-4 rounded-full border ' +
                          (filters.minRating === n ? 'border-primary bg-primary' : 'border-border-2')
                        }
                      />
                    </button>
                  ))}
                </div>
              </FilterSection>
            </aside>
          </div>
        </Container>
      </section>
    </>
  )
}
