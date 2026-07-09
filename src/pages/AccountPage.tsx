import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import clsx from 'clsx'
import * as api from '@/api'

import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'
import CurrencyAmount from '@/components/ui/CurrencyAmount'
import CurrencyInlineText from '@/components/ui/CurrencyInlineText'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { ArrowLeftIcon, ArrowRightIcon, CartIcon, DeleteIcon, MailIcon, MastercardIcon, VisaIcon, XIcon } from '@/components/icons'

import { useI18n } from '@/i18n/I18nProvider'
import { toast } from '@/lib/toast'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  addSavedCardThunk,
  cancelOrderThunk,
  createAddress,
  deleteAddressThunk,
  deleteSavedCardThunk,
  fetchAddresses,
  fetchFavorites,
  fetchOrders,
  fetchSavedCards,
  setDefaultAddressThunk,
  setDefaultCardThunk,
  toggleFavoriteThunk,
  updateAddressThunk,
} from '@/store/slices/accountSlice'
import { addItem, clearCart } from '@/store/slices/cartSlice'
import { logoutThunk, updateProfileThunk } from '@/store/thunks/authThunks'
import type { Address, Order, Restaurant, SavedCard } from '@/store/types/domain'
import {
  detectCardBrandFromNumber,
  formatCardNumber,
  getCardBrandLabel,
  getCardBrandTheme,
  getMaskedCardNumber,
  normalizeCardDigits,
  type CardBrand,
} from '@/utils/paymentCards'
import { toSaudiCurrencySymbolText } from '@/utils/format'

function currency(n: number, lang: 'ar' | 'en') {
  return <CurrencyAmount amount={n} lang={lang} currencyLabel={'\uFDFC'} />
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

type TabKey = 'orders' | 'profile' | 'addresses' | 'favorites' | 'payments'
const ALL_RESTAURANTS_URL = '/restaurants?all=1'

function isTabKey(value: string | null): value is TabKey {
  return value === 'orders' || value === 'profile' || value === 'addresses' || value === 'favorites' || value === 'payments'
}

type CityOption = {
  id: string
  ar: string
  en: string
}

type GovernorateOption = {
  id: string
  stateId: string
  ar: string
  en: string
  cities: CityOption[]
}

const FALLBACK_GOVERNORATES: GovernorateOption[] = [
  {
    id: 'makkah',
    stateId: '2',
    ar: 'منطقة مكة المكرمة',
    en: 'Makkah Al Mukarramah Region',
    cities: [
      { id: 'makkah-city', ar: 'مكة المكرمة', en: 'Makkah Al Mukarramah' },
    ],
  },
]

function normalizeLookupValue(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase()
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

function getGovernorateLabelByLang(governorates: GovernorateOption[], governorateCode: string, lang: 'ar' | 'en'): string {
  const row = governorates.find((g) => g.id === governorateCode)
  if (!row) return ''
  return lang === 'ar' ? row.ar : row.en
}

function getCityLabelByLang(governorates: GovernorateOption[], governorateCode: string, cityCode: string, lang: 'ar' | 'en'): string {
  const governorate = governorates.find((g) => g.id === governorateCode)
  const city = governorate?.cities.find((c) => c.id === cityCode)
  if (!city) return ''
  return lang === 'ar' ? city.ar : city.en
}

function resolveGovernorateCode(governorates: GovernorateOption[], governorateValue?: string, cityValue?: string): string {
  const governorateNeedle = normalizeLookupValue(governorateValue)
  if (governorateNeedle) {
    const direct = governorates.find((g) => {
      return [g.id, g.stateId, normalizeLookupValue(g.ar), normalizeLookupValue(g.en)].includes(governorateNeedle)
    })
    if (direct) return direct.id
  }

  const cityNeedle = normalizeLookupValue(cityValue)
  if (cityNeedle) {
    const byCity = governorates.find((g) =>
      g.cities.some((city) =>
        [city.id, normalizeLookupValue(city.ar), normalizeLookupValue(city.en)].includes(cityNeedle),
      ),
    )
    if (byCity) return byCity.id
  }

  return ''
}

function resolveCityCode(governorates: GovernorateOption[], governorateCode: string, cityValue?: string): string {
  if (!governorateCode) return ''
  const governorate = governorates.find((g) => g.id === governorateCode)
  if (!governorate) return ''

  const cityNeedle = normalizeLookupValue(cityValue)
  if (!cityNeedle) return ''

  const city = governorate.cities.find((c) =>
    [c.id, normalizeLookupValue(c.ar), normalizeLookupValue(c.en)].includes(cityNeedle),
  )
  return city?.id ?? ''
}

function resolveStateId(governorates: GovernorateOption[], governorateCode: string, fallbackValue?: string): string {
  const fallback = (fallbackValue ?? '').trim()
  if (fallback) return fallback

  const governorate = governorates.find((entry) => entry.id === governorateCode)
  if (governorate?.stateId) return governorate.stateId

  return governorateCode.trim()
}

function mapStatesToGovernorates(states: api.StateOption[]): GovernorateOption[] {
  return states.map((state, index) => {
    const cities = state.cities.length
      ? state.cities.map((city, cityIndex) => ({
          id: city.id || `${state.id}-city-${cityIndex + 1}`,
          ar: city.nameAr || city.name || `${state.nameAr || state.name || 'City'} ${cityIndex + 1}`,
          en: city.name || city.nameAr || `${state.name || state.nameAr || 'City'} ${cityIndex + 1}`,
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

export default function AccountPage() {
  const { t, lang } = useI18n()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const requestedTabParam = searchParams.get('tab')
  const requestedTab = isTabKey(requestedTabParam) ? requestedTabParam : null
  const safeRequestedTab: TabKey | null = requestedTab === 'addresses' ? 'orders' : requestedTab
  const returnToParam = searchParams.get('returnTo')
  const returnToPath = returnToParam && returnToParam.startsWith('/') ? returnToParam : ''
  const shouldAutoOpenAddressModal = searchParams.get('action') === 'add'

  const user = useAppSelector((s) => s.auth.user)
  const addresses = useAppSelector((s) => s.account.addresses)
  const orders = useAppSelector((s) => s.account.orders)
  const favoriteRestaurantIds = useAppSelector((s) => s.account.favoriteRestaurantIds)
  const savedCards = useAppSelector((s) => s.account.savedCards)
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<Restaurant[]>([])
  const [governorates, setGovernorates] = useState<GovernorateOption[]>(FALLBACK_GOVERNORATES)
  const [loadingGovernorateCities, setLoadingGovernorateCities] = useState(false)

  const [activeTab, setActiveTab] = useState<TabKey>(safeRequestedTab ?? 'orders')
  const [autoOpenedAddressModal, setAutoOpenedAddressModal] = useState(false)

  // ---- Modals / forms ----
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addressDetails, setAddressDetails] = useState('')
  const [addressStateId, setAddressStateId] = useState('')
  const [addressGovernorateCode, setAddressGovernorateCode] = useState('')
  const [addressCity, setAddressCity] = useState('')
  const [addressCityCode, setAddressCityCode] = useState('')
  const [addressDistrict, setAddressDistrict] = useState('')
  const [addressStreet, setAddressStreet] = useState('')
  const [addressBuildingNo, setAddressBuildingNo] = useState('')
  const [addressFloor, setAddressFloor] = useState('')
  const [addressApartment, setAddressApartment] = useState('')
  const [addressLandmark, setAddressLandmark] = useState('')
  const [addressPhone, setAddressPhone] = useState('')
  const [addressDefault, setAddressDefault] = useState(false)

  const [cardModalOpen, setCardModalOpen] = useState(false)
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardDefault, setCardDefault] = useState(false)

  const [openOrder, setOpenOrder] = useState<Order | null>(null)
  const detectedCardBrand = useMemo<CardBrand>(() => detectCardBrandFromNumber(cardNumber), [cardNumber])
  const cardNumberPreview = useMemo(() => {
    const formatted = formatCardNumber(cardNumber, detectedCardBrand)
    return formatted || '0000 0000 0000 0000'
  }, [cardNumber, detectedCardBrand])
  const cardNamePreview = cardName.trim() || (lang === 'ar' ? '\u0627\u0633\u0645 \u062d\u0627\u0645\u0644 \u0627\u0644\u0628\u0637\u0627\u0642\u0629' : 'CARD HOLDER')
  const cardExpiryPreview = cardExpiry.trim() || 'MM/YY'

  // Profile form
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')

  useEffect(() => {
    dispatch(fetchAddresses())
    dispatch(fetchOrders())
    dispatch(fetchFavorites())
    dispatch(fetchSavedCards())
  }, [dispatch, lang])

  useEffect(() => {
    setFullName(user?.fullName ?? '')
    setEmail(user?.email ?? '')
    setPhone(user?.phone ?? '')
  }, [user])

  useEffect(() => {
    if (safeRequestedTab) {
      setActiveTab(safeRequestedTab)
    }
  }, [safeRequestedTab])

  useEffect(() => {
    let active = true

    async function loadFavoriteRestaurants() {
      if (!favoriteRestaurantIds.length) {
        if (active) setFavoriteRestaurants([])
        return
      }

      try {
        const rows = await api.getRestaurantsByIds(favoriteRestaurantIds)
        if (active) setFavoriteRestaurants(rows)
      } catch {
        if (active) setFavoriteRestaurants([])
      }
    }

    void loadFavoriteRestaurants()
    return () => {
      active = false
    }
  }, [favoriteRestaurantIds])

  useEffect(() => {
    let active = true

    async function loadStates() {
      try {
        const rows = await api.getStates()
        if (!active) return
        const mapped = mapStatesToGovernorates(rows)
        if (mapped.length > 0) {
          setGovernorates(mapped)
        }
      } catch {
        if (!active) return
        setGovernorates(FALLBACK_GOVERNORATES)
      }
    }

    void loadStates()
    return () => {
      active = false
    }
  }, [])

  const sidebarItems = useMemo(
    () =>
      [
        { key: 'orders' as const, label: t('account.previousOrders') },
        { key: 'profile' as const, label: t('account.personalInfo') },
        { key: 'favorites' as const, label: t('account.favorites') },
        // { key: 'payments' as const, label: t('account.paymentMethods') },
      ] satisfies Array<{ key: TabKey; label: string }>,
    [t],
  )

  const orderStatusLabel = useMemo(
    () =>
      lang === 'ar'
        ? {
            pending: 'قيد الانتظار',
            accepted: 'تم القبول',
            preparing: 'قيد التحضير',
            out_for_delivery: 'خرج للتوصيل',
            on_the_way: 'في الطريق',
            delivered: 'تم التوصيل',
            cancelled: 'تم الإلغاء',
          }
        : {
            pending: 'Pending',
            accepted: 'Accepted',
            preparing: 'Preparing',
            out_for_delivery: 'Out for delivery',
            on_the_way: 'On the way',
            delivered: 'Delivered',
            cancelled: 'Cancelled',
          },
    [lang],
  )

  const orderStatusTone = useMemo(
    () => ({
      pending: 'bg-primary/10 text-primary',
      accepted: 'bg-primary/10 text-primary',
      preparing: 'bg-primary/10 text-primary',
      out_for_delivery: 'bg-primary/10 text-primary',
      on_the_way: 'bg-primary/10 text-primary',
      delivered: 'bg-success/10 text-success',
      cancelled: 'bg-danger/10 text-danger',
    }),
    [],
  )

  const selectedGovernorate = useMemo(
    () => governorates.find((g) => g.id === addressGovernorateCode) ?? null,
    [governorates, addressGovernorateCode],
  )

  const availableCities = useMemo(() => selectedGovernorate?.cities ?? [], [selectedGovernorate])

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
        const stateCities = await api.getCitiesByStateId(stateId)
        if (!active) return

        const mappedCities = stateCities
          .filter((city) => Boolean(city.id || city.name || city.nameAr))
          .map((city, cityIndex) => ({
            id: city.id || `${governorate.stateId}-city-${cityIndex + 1}`,
            ar: city.nameAr || city.name || `${governorate.ar} ${cityIndex + 1}`,
            en: city.name || city.nameAr || `${governorate.en} ${cityIndex + 1}`,
          }))

        if (mappedCities.length > 0) {
          setGovernorates((prevGovernorates) =>
            prevGovernorates.map((entry) =>
              entry.id === governorateCode ? { ...entry, cities: mappedCities } : entry,
            ),
          )
        }

        const hasSelectedCity = mappedCities.some((city) =>
          [city.id, normalizeLookupValue(city.ar), normalizeLookupValue(city.en)].includes(
            normalizeLookupValue(addressCityCode || addressCity),
          ),
        )

        if (!hasSelectedCity) {
          const firstCity = mappedCities[0]
          setAddressCityCode(firstCity?.id ?? '')
          setAddressCity(firstCity ? (lang === 'ar' ? firstCity.ar : firstCity.en) : '')
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
  }, [addressCity, addressCityCode, addressGovernorateCode, governorates, lang])

  function openAddAddress() {
    setEditingAddress(null)
    setAddressDetails('')
    setAddressStateId(governorates[0]?.stateId ?? '')
    setAddressGovernorateCode(governorates[0]?.id ?? '')
    setAddressCity('')
    setAddressCityCode('')
    setAddressDistrict('')
    setAddressStreet('')
    setAddressBuildingNo('')
    setAddressFloor('')
    setAddressApartment('')
    setAddressLandmark('')
    setAddressPhone(phone.trim())
    setAddressDefault(shouldAutoOpenAddressModal)
    setAddressModalOpen(true)
  }

  useEffect(() => {
    if (requestedTab !== 'addresses' || !shouldAutoOpenAddressModal || autoOpenedAddressModal) {
      return
    }
    setAutoOpenedAddressModal(true)
    openAddAddress()
  }, [requestedTab, shouldAutoOpenAddressModal, autoOpenedAddressModal, openAddAddress])

  function openEditAddress(a: Address) {
    setEditingAddress(a)
    setAddressDetails(a.details)
    const governorateCode =
      (a.governorateCode && governorates.some((g) => g.id === a.governorateCode) ? a.governorateCode : '') ||
      resolveGovernorateCode(governorates, a.governorate, a.city)
    const stateId = resolveStateId(governorates, governorateCode, a.stateId)
    const cityCode =
      (a.cityCode && resolveCityCode(governorates, governorateCode, a.cityCode) ? a.cityCode : '') ||
      resolveCityCode(governorates, governorateCode, a.city)

    setAddressStateId(stateId)
    setAddressGovernorateCode(governorateCode)
    setAddressCityCode(cityCode)
    setAddressCity(
      cityCode
        ? getCityLabelByLang(governorates, governorateCode, cityCode, lang as 'ar' | 'en')
        : (a.city ?? ''),
    )
    setAddressDistrict(a.district ?? '')
    setAddressStreet(a.street ?? '')
    setAddressBuildingNo(a.buildingNo ?? '')
    setAddressFloor(a.floor ?? '')
    setAddressApartment(a.apartment ?? '')
    setAddressLandmark(a.landmark ?? '')
    setAddressPhone(a.phone ?? phone)
    setAddressDefault(!!a.isDefault)
    setAddressModalOpen(true)
  }

  async function saveAddress() {
    const details = addressDetails.trim()
    const stateId = resolveStateId(governorates, addressGovernorateCode.trim(), addressStateId)
    const governorateCode = addressGovernorateCode.trim()
    const cityCode = addressCityCode.trim()
    const governorate = getGovernorateLabelByLang(governorates, governorateCode, lang as 'ar' | 'en')
    const city = getCityLabelByLang(governorates, governorateCode, cityCode, lang as 'ar' | 'en') || addressCity.trim()
    const district = addressDistrict.trim()
    const label =
      [district, city, governorate]
        .map((value) => value.trim())
        .find(Boolean) ||
      editingAddress?.label?.trim() ||
      (lang === 'ar' ? 'عنوان التوصيل' : 'Delivery address')
    const street = addressStreet.trim()
    const buildingNo = addressBuildingNo.trim()
    const floor = addressFloor.trim()
    const apartment = addressApartment.trim()
    const landmark = addressLandmark.trim()
    const phoneInput = addressPhone.trim() || phone.trim()

    const unitPart = [
      buildingNo ? (lang === 'ar' ? `مبنى ${buildingNo}` : `Building ${buildingNo}`) : '',
      floor ? (lang === 'ar' ? `طابق ${floor}` : `Floor ${floor}`) : '',
      apartment ? (lang === 'ar' ? `شقة ${apartment}` : `Apt ${apartment}`) : '',
    ]
      .filter(Boolean)
      .join(' - ')

    const composedDetails = [
      governorate,
      city,
      district,
      street,
      unitPart,
      landmark ? (lang === 'ar' ? `علامة مميزة ${landmark}` : `Landmark ${landmark}`) : '',
      details,
    ]
      .filter(Boolean)
      .join(lang === 'ar' ? '، ' : ', ')

    if (!stateId || !cityCode || !phoneInput || !composedDetails) {
      toast.error(t('toast.addressCityPhoneRequired'))
      return
    }

    const normalizedPhone = normalizeSaudiMobilePhone(phoneInput)
    if (!normalizedPhone) {
      toast.error(t('toast.invalidSaudiPhone'))
      return
    }

    const payload: Omit<Address, 'id'> = {
      label,
      details: composedDetails,
      isDefault: addressDefault,
      stateId: stateId || undefined,
      governorate: governorate || undefined,
      governorateCode: governorateCode || undefined,
      city: city || undefined,
      cityCode: cityCode || undefined,
      district: district || undefined,
      street: street || undefined,
      buildingNo: buildingNo || undefined,
      floor: floor || undefined,
      apartment: apartment || undefined,
      landmark: landmark || undefined,
      phone: normalizedPhone,
    }

    const isCreating = !editingAddress

    try {
      if (editingAddress) {
        await dispatch(
          updateAddressThunk({
            id: editingAddress.id,
            patch: payload,
          }),
        ).unwrap()
        toast.success(t('toast.addressUpdated'))
      } else {
        await dispatch(createAddress(payload)).unwrap()
        toast.success(t('toast.addressAdded'))
      }
      setAddressModalOpen(false)
      if (isCreating && returnToPath) {
        navigate(returnToPath)
      }
    } catch {
      toast.error(t('toast.addressSaveFailed'))
    }
  }

  async function removeAddress(id: string) {
    try {
      await dispatch(deleteAddressThunk(id)).unwrap()
      toast.success(t('toast.addressDeleted'))
    } catch {
      toast.error(t('toast.addressDeleteFailed'))
    }
  }

  async function makeDefaultAddress(id: string) {
    try {
      await dispatch(setDefaultAddressThunk(id)).unwrap()
      toast.success(t('toast.addressSetDefault'))
    } catch {
      toast.error(t('toast.addressSetDefaultFailed'))
    }
  }

  function openAddCard() {
    setCardName('')
    setCardNumber('')
    setCardExpiry('')
    setCardDefault(false)
    setCardModalOpen(true)
  }

  async function saveCard() {
    const normalizedCardNumber = normalizeCardDigits(cardNumber)
    const expiryDigits = normalizeCardDigits(cardExpiry).slice(0, 4)
    const formattedExpiry =
      expiryDigits.length <= 2 ? expiryDigits : `${expiryDigits.slice(0, 2)}/${expiryDigits.slice(2)}`

    if (!cardName.trim() || normalizedCardNumber.length < 12 || expiryDigits.length < 4) {
      toast.error(t('toast.cardDetailsRequired'))
      return
    }

    const detectedBrand = detectCardBrandFromNumber(normalizedCardNumber)

    try {
      await dispatch(
        addSavedCardThunk({
          nameOnCard: cardName.trim(),
          cardNumber: formatCardNumber(normalizedCardNumber, detectedBrand),
          expiry: formattedExpiry,
          brand: detectedBrand,
          isDefault: cardDefault,
        }),
      ).unwrap()
      toast.success(t('toast.cardAdded'))
      setCardModalOpen(false)
    } catch {
      toast.error(t('toast.cardAddFailed'))
    }
  }

  async function removeCard(id: string) {
    try {
      await dispatch(deleteSavedCardThunk(id)).unwrap()
      toast.success(t('toast.cardDeleted'))
    } catch {
      toast.error(t('toast.cardDeleteFailed'))
    }
  }

  async function makeDefaultCard(id: string) {
    try {
      await dispatch(setDefaultCardThunk(id)).unwrap()
      toast.success(t('toast.cardSetDefault'))
    } catch {
      toast.error(t('toast.cardSetDefaultFailed'))
    }
  }

  async function toggleFavorite(id: string) {
    try {
      const next = await dispatch(toggleFavoriteThunk(id)).unwrap()
      const added = next.includes(id)
      toast.success(added ? t('toast.favoriteAdded') : t('toast.favoriteRemoved'))
    } catch {
      toast.error(t('toast.favoriteUpdateFailed'))
    }
  }

  async function reorder(order: Order) {
    try {
      await dispatch(clearCart()).unwrap()
      for (const item of order.items) {
        await dispatch(addItem({ ...item, quantity: item.quantity }) as any).unwrap()
      }
      toast.success(t('toast.orderAddedToCart'))
      navigate('/cart')
    } catch {
      toast.error(t('toast.reorderFailed'))
    }
  }

  async function handleCancelOrder(orderId: string) {
    try {
      const nextOrders = await dispatch(cancelOrderThunk(orderId)).unwrap()
      if (openOrder?.id === orderId) {
        const updated = nextOrders.find((o) => o.id === orderId) ?? null
        setOpenOrder(updated)
      }
      toast.success(t('toast.orderCancelled'))
    } catch {
      toast.error(t('toast.orderCancelFailed'))
    }
  }

  async function saveProfile() {
    if (!fullName.trim() || !email.trim()) {
      toast.error(t('toast.profileNameEmailRequired'))
      return
    }

    const phoneInput = phone.trim()
    if (phoneInput) {
      const normalizedPhone = normalizeSaudiMobilePhone(phoneInput)
      if (!normalizedPhone) {
        toast.error(t('toast.invalidSaudiPhone'))
        return
      }
    }

    try {
      const normalizedPhone = phoneInput ? normalizeSaudiMobilePhone(phoneInput) : ''
      await dispatch(
        updateProfileThunk({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: normalizedPhone ?? '',
        }),
      ).unwrap()
      toast.success(t('toast.profileUpdated'))
    } catch {
      toast.error(t('toast.profileUpdateFailed'))
    }
  }

  async function handleLogout() {
    try {
      await dispatch(logoutThunk()).unwrap()
      toast.success(t('toast.logout'))
      navigate('/home')
    } catch {
      toast.error(t('toast.failed'))
    }
  }

  if (!user) {
    return (
      <Container className="py-10">
        <div className="rounded-3xl border border-border bg-white p-8 text-center shadow-card">
          <h1 className="text-2xl font-semibold text-navy">{lang === 'ar' ? 'يرجى تسجيل الدخول' : 'Please sign in'}</h1>
          <p className="mt-3 text-sm font-semibold text-muted">
            {lang === 'ar'
              ? 'يجب عليك تسجيل الدخول للوصول إلى حسابك وإدارة طلباتك وعناوينك.'
              : 'You need to sign in to access your account and manage your orders and addresses.'}
          </p>
          <Link to="/login" className="mt-6 inline-flex">
            <Button>{lang === 'ar' ? 'تسجيل الدخول' : 'Login'}</Button>
          </Link>
        </div>
      </Container>
    )
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-primary/10">
        <Container className="py-5">
          <div className="text-sm font-bold text-muted">
            <Link to="/home" className="hover:text-primary">
              {lang === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-navy">{t('account.breadcrumb')}</span>
          </div>
        </Container>
      </div>

      <Container className="py-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Sidebar (placed first so it appears on start side in RTL) */}
          <aside className="lg:col-span-4">
            <div className="rounded-3xl border border-border bg-white p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary grid place-items-center font-extrabold">
                  {user.fullName
                    .split(' ')
                    .slice(0, 2)
                    .map((x) => x[0] ?? '')
                    .join('')
                    .toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-extrabold text-navy">{user.fullName}</div>
                  <div className="mt-1 text-xs font-semibold text-muted">{user.email}</div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveTab(item.key)}
                    className={clsx(
                      'flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-extrabold transition',
                      activeTab === item.key ? 'bg-primary/10 text-primary' : 'text-navy hover:bg-screen',
                    )}
                  >
                    <span>{item.label}</span>
                  {lang === 'ar'? <ArrowLeftIcon className={clsx('h-4 w-4', activeTab === item.key ? 'text-primary' : 'text-muted')} /> : <ArrowRightIcon className={clsx('h-4 w-4', activeTab === item.key ? 'text-primary' : 'text-muted')} />}
                  </button>
                ))}
              </div>

              <div className="mt-6 border-t border-border pt-6">
                <Button variant="outline" className="w-full" onClick={handleLogout}>
                  {t('account.logout')}
                </Button>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-8">
            {activeTab === 'orders' ? (
              <div className="rounded-3xl border border-border bg-white p-6 shadow-card">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xl font-semibold text-navy">{t('account.previousOrders')}</div>
                    <div className="mt-1 text-sm font-semibold text-muted">
                      {lang === 'ar' ? 'راجع طلباتك السابقة وأعد الطلب بضغطة واحدة.' : 'Review your previous orders and reorder in one click.'}
                    </div>
                  </div>
                  <Link to={ALL_RESTAURANTS_URL} className="inline-flex">
                    <Button variant="outline" className="h-11 rounded-2xl">
                      {lang === 'ar' ? 'تصفح المطاعم' : 'Browse restaurants'}
                    </Button>
                  </Link>
                </div>

                <div className="mt-6 space-y-4">
                  {orders.length ? (
                    orders.map((o) => (
                      <div key={o.id} className="rounded-3xl border border-border bg-screen/40 p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="text-sm font-extrabold text-navy">
                              {lang === 'ar' ? 'طلب' : 'Order'}: <span className="text-primary">#{o.id.slice(-6)}</span>
                            </div>
                            <div className="mt-1 text-xs font-semibold text-muted">{formatDate(o.createdAt)}</div>
                          </div>

                          <span
                            className={clsx(
                              'inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-extrabold',
                              orderStatusTone[o.status],
                            )}
                          >
                            {orderStatusLabel[o.status]}
                          </span>
                        </div>

                        <div className="mt-3 text-sm font-semibold text-muted">
                          {o.items.slice(0, 3).map((i) => i.name).join(' • ')}
                          {o.items.length > 3 ? ` +${o.items.length - 3}` : ''}
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-sm font-extrabold text-navy">{currency(o.total, lang)}</div>

                          <div className="flex flex-col gap-2 sm:flex-row">
                            <Button variant="outline" className="h-10 rounded-2xl" onClick={() => setOpenOrder(o)}>
                              {lang === 'ar' ? 'تفاصيل الطلب' : 'Details'}
                            </Button>
                            {o.status === 'pending' || o.status === 'accepted' || o.status === 'preparing' ? (
                              <Button
                                variant="outline"
                                className="h-10 rounded-2xl border-danger/30 text-danger hover:bg-danger/5"
                                onClick={() => handleCancelOrder(o.id)}
                              >
                                {lang === 'ar' ? 'إلغاء الطلب' : 'Cancel order'}
                              </Button>
                            ) : null}
                            {/* Reorder button commented for future use
                            <Button className="h-10 rounded-2xl" onClick={() => reorder(o)}>
                              <CartIcon className="h-4 w-4" />
                              {lang === 'ar' ? 'إعادة الطلب' : 'Reorder'}
                            </Button>
                            */}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-border bg-screen/30 p-8 text-center">
                      <div className="text-sm font-extrabold text-navy">{t('account.noOrders')}</div>
                      <p className="mt-2 text-sm font-semibold text-muted">
                        {lang === 'ar'
                          ? 'ابدأ بزيارة صفحة المطاعم ثم أضف عناصر إلى السلة.'
                          : 'Start by visiting Restaurants and adding items to your cart.'}
                      </p>
                      <Link to={ALL_RESTAURANTS_URL} className="mt-4 inline-flex">
                        <Button>{lang === 'ar' ? 'تصفح المطاعم' : 'Browse restaurants'}</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {activeTab === 'profile' ? (
              <div className="rounded-3xl border border-border bg-white p-6 shadow-card">
                <div className="text-xl font-semibold text-navy">{t('account.personalInfo')}</div>
                <p className="mt-2 text-sm font-semibold text-muted">
                  {lang === 'ar'
                    ? '\u062d\u062f\u0651\u062b \u0628\u064a\u0627\u0646\u0627\u062a\u0643 \u0627\u0644\u0634\u062e\u0635\u064a\u0629 \u0648\u062a\u0623\u0643\u062f \u0645\u0646 \u0635\u062d\u062a\u0647\u0627.'
                    : 'Update your personal information and keep it accurate.'}
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-extrabold text-muted">
                      {lang === 'ar' ? '\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644' : 'Full name'}
                    </label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={lang === 'ar' ? '\u0645\u062d\u0645\u062f \u0623\u062d\u0645\u062f' : 'John Doe'}
                      autoComplete="name"
                      name="full_name"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-extrabold text-muted">
                      {lang === 'ar' ? '\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a' : 'Email'}
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      autoComplete="email"
                      name="email"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-extrabold text-muted">
                      {lang === 'ar' ? '\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641' : 'Phone'}
                    </label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="05X XXX XXXX"
                      autoComplete="tel"
                      name="phone_number"
                    />
                  </div>
                </div>

                <div className={clsx('mt-6 flex', lang === 'ar' ? 'justify-start' : 'justify-end')}>
                  <Button className="h-11 rounded-2xl px-8" onClick={saveProfile}>
                    {lang === 'ar' ? '\u062d\u0641\u0638 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a' : 'Save changes'}
                  </Button>
                </div>
              </div>
            ) : null}

            {activeTab === 'favorites' ? (
              <div className="rounded-3xl border border-border bg-white p-6 shadow-card">
                <div className="text-xl font-semibold text-navy">{t('account.favorites')}</div>
                <p className="mt-2 text-sm font-semibold text-muted">
                  {lang === 'ar'
                    ? '\u0627\u0644\u0645\u0637\u0627\u0639\u0645 \u0627\u0644\u0645\u0641\u0636\u0644\u0629 \u0644\u062f\u064a\u0643 \u062a\u0638\u0647\u0631 \u0647\u0646\u0627.'
                    : 'Your favorite restaurants appear here.'}
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {favoriteRestaurants.length ? (
                    favoriteRestaurants.map((restaurant) => (
                      <div key={restaurant.id} className="overflow-hidden rounded-3xl border border-border bg-screen/30">
                        <img
                          src={restaurant.coverUrl || '/images/restaurant-1.jpg'}
                          alt={restaurant.name}
                          className="h-36 w-full object-cover"
                        />
                        <div className="p-4">
                          <div className="text-sm font-extrabold text-navy">{restaurant.name}</div>
                          <div className="mt-1 text-xs font-semibold text-muted">{restaurant.cuisine}</div>
                          <div className="mt-1 text-xs font-semibold text-muted">
                            {lang === 'ar'
                              ? `${restaurant.deliveryTimeMin}-${restaurant.deliveryTimeMax} \u062f\u0642\u064a\u0642\u0629`
                              : `${restaurant.deliveryTimeMin}-${restaurant.deliveryTimeMax} min`}
                          </div>

                          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                            <Link to={`/restaurants/${restaurant.id}`} className="sm:flex-1">
                              <Button variant="outline" className="h-10 w-full rounded-2xl">
                                {lang === 'ar' ? '\u0639\u0631\u0636 \u0627\u0644\u0645\u0637\u0639\u0645' : 'View restaurant'}
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              className="h-10 rounded-2xl border-danger/30 text-danger hover:bg-danger/5"
                              onClick={() => toggleFavorite(restaurant.id)}
                            >
                              {lang === 'ar' ? '\u0625\u0632\u0627\u0644\u0629' : 'Remove'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full rounded-3xl border border-border bg-screen/30 p-8 text-center">
                      <div className="text-sm font-extrabold text-navy">
                        {lang === 'ar' ? '\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0637\u0627\u0639\u0645 \u0641\u064a \u0627\u0644\u0645\u0641\u0636\u0644\u0629' : 'No favorite restaurants'}
                      </div>
                      <p className="mt-2 text-sm font-semibold text-muted">
                        {lang === 'ar'
                          ? '\u0623\u0636\u0641 \u0645\u0637\u0627\u0639\u0645 \u0625\u0644\u0649 \u0627\u0644\u0645\u0641\u0636\u0644\u0629 \u0644\u062a\u0638\u0647\u0631 \u0647\u0646\u0627.'
                          : 'Add restaurants to favorites to show them here.'}
                      </p>
                      <Link to={ALL_RESTAURANTS_URL} className="mt-4 inline-flex">
                        <Button>{lang === 'ar' ? '\u062a\u0635\u0641\u062d \u0627\u0644\u0645\u0637\u0627\u0639\u0645' : 'Browse restaurants'}</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Payment methods tab UI commented for future use
            {activeTab === 'payments' ? (
              <div className="rounded-3xl border border-border bg-white p-6 shadow-card">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xl font-semibold text-navy">{t('account.paymentMethods')}</div>
                    <p className="mt-2 text-sm font-semibold text-muted">
                      {lang === 'ar'
                        ? 'أدر وسائل الدفع وحدد البطاقة الافتراضية لعملية الدفع.'
                        : 'Manage your payment methods and set a default card for checkout.'}
                    </p>
                  </div>
                  <Button className="h-11 rounded-2xl" onClick={openAddCard}>
                    {savedCards.length
                      ? lang === 'ar'
                        ? 'إضافة بطاقة أخرى'
                        : 'Add another card'
                      : lang === 'ar'
                        ? 'إضافة بطاقة'
                        : 'Add card'}
                  </Button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {savedCards.length ? (
                    savedCards.map((c) => {
                      const brand = c.brand ?? 'other'
                      return (
                        <div key={c.id} className="rounded-3xl border border-border bg-screen/40 p-5">
                          <div
                            className={clsx(
                              'relative overflow-hidden rounded-3xl bg-gradient-to-br p-4 text-white shadow-soft',
                              getCardBrandTheme(brand),
                            )}
                          >
                            <div className="pointer-events-none absolute -top-8 end-0 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
                            <div className="pointer-events-none absolute -bottom-10 -start-8 h-28 w-28 rounded-full bg-black/20 blur-2xl" />

                            <div className="relative flex items-center justify-between gap-2">
                              <span className="rounded-full border border-white/30 bg-white/10 px-2 py-0.5 text-[10px] font-extrabold">
                                {getCardBrandLabel(brand, lang)}
                              </span>
                              <AccountCardBrandBadge brand={brand} />
                            </div>

                            <div className="relative mt-6 text-base font-black tracking-[0.16em]">
                              {getMaskedCardNumber(c.last4)}
                            </div>

                            <div className="relative mt-4 flex items-end justify-between gap-4 text-[11px]">
                              <div>
                                <div className="text-white/70">{lang === 'ar' ? '\u0627\u0644\u0627\u0633\u0645' : 'Name'}</div>
                                <div className="mt-1 text-xs font-bold uppercase tracking-wide">{c.nameOnCard}</div>
                              </div>
                              <div className="text-end">
                                <div className="text-white/70">{lang === 'ar' ? '\u0627\u0644\u0627\u0646\u062a\u0647\u0627\u0621' : 'Expiry'}</div>
                                <div className="mt-1 text-xs font-bold tracking-wide">{c.expiry}</div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex items-start justify-between gap-3">
                            <div className="flex flex-col gap-2 sm:flex-row">
                              {c.isDefault ? (
                                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-extrabold text-primary">
                                  {lang === 'ar' ? '\u0627\u0641\u062a\u0631\u0627\u0636\u064a\u0629' : 'Default'}
                                </span>
                              ) : (
                                <Button variant="outline" className="h-10 rounded-2xl" onClick={() => makeDefaultCard(c.id)}>
                                  {lang === 'ar' ? '\u062a\u0639\u064a\u064a\u0646 \u0643\u0627\u0641\u062a\u0631\u0627\u0636\u064a\u0629' : 'Set default'}
                                </Button>
                              )}
                            </div>

                            <button
                              type="button"
                              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white text-red-600 hover:bg-red-50"
                              onClick={() => removeCard(c.id)}
                              aria-label="delete card"
                            >
                              <DeleteIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="col-span-full rounded-3xl border border-border bg-screen/30 p-8 text-center">
                      <div className="text-sm font-extrabold text-navy">{lang === 'ar' ? '\u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u0637\u0627\u0642\u0627\u062a' : 'No cards'}</div>
                      <p className="mt-2 text-sm font-semibold text-muted">
                        {lang === 'ar' ? '\u0623\u0636\u0641 \u0628\u0637\u0627\u0642\u0629 \u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645\u0647\u0627 \u0628\u0633\u0631\u0639\u0629 \u0639\u0646\u062f \u0627\u0644\u062f\u0641\u0639.' : 'Add a card for faster checkout.'}
                      </p>
                      <Button className="mt-4 h-11 rounded-2xl" onClick={openAddCard}>
                        {lang === 'ar' ? '\u0625\u0636\u0627\u0641\u0629 \u0628\u0637\u0627\u0642\u0629' : 'Add card'}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="mt-6 rounded-3xl border border-border bg-primary/5 p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                      <MailIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-navy">{lang === 'ar' ? 'ملاحظة أمان' : 'Security note'}</div>
                      <p className="mt-1 text-xs font-semibold text-muted leading-6">
                        {lang === 'ar'
                          ? 'هذا مشروع تجريبي ولا يتم حفظ أرقام البطاقات الحقيقية. يتم حفظ آخر 4 أرقام فقط.'
                          : 'This is a demo project and does not store real card numbers. Only the last 4 digits are saved.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            */}
          </div>
        </div>
      </Container>

      {/* Card modal */}
      {/* Card modal UI commented for future use
      <Modal
        open={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        className="max-h-[90vh] max-w-[980px]"
      >
        <div className="max-h-[90vh] overflow-y-auto p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold text-navy">
              {lang === 'ar' ? '\u0625\u0636\u0627\u0641\u0629 \u0628\u0637\u0627\u0642\u0629' : 'Add card'}
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white text-navy hover:bg-screen"
              onClick={() => setCardModalOpen(false)}
              aria-label="close"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          <div
            className={clsx(
              'relative overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-white shadow-soft',
              getCardBrandTheme(detectedCardBrand),
            )}
          >
            <div className="pointer-events-none absolute -top-10 end-0 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -start-10 h-32 w-32 rounded-full bg-black/20 blur-2xl" />

            <div className="relative flex items-center justify-between gap-3">
              <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-extrabold">
                {lang === 'ar' ? '\u0628\u0637\u0627\u0642\u0629 \u0628\u0646\u0643\u064a\u0629' : 'Bank card'}
              </span>
              <AccountCardBrandBadge brand={detectedCardBrand} />
            </div>

            <div className="relative mt-7 text-lg font-black tracking-[0.16em]">{cardNumberPreview}</div>

            <div className="relative mt-5 flex items-end justify-between gap-4 text-xs">
              <div>
                <div className="text-white/70">{lang === 'ar' ? '\u0627\u0644\u0627\u0633\u0645' : 'Name'}</div>
                <div className="mt-1 text-sm font-bold uppercase tracking-wide">{cardNamePreview}</div>
              </div>
              <div className="text-end">
                <div className="text-white/70">{lang === 'ar' ? '\u0627\u0644\u0627\u0646\u062a\u0647\u0627\u0621' : 'Expiry'}</div>
                <div className="mt-1 text-sm font-bold tracking-wide">{cardExpiryPreview}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(['visa', 'mastercard', 'mada'] as CardBrand[]).map((brand) => (
              <span
                key={brand}
                className={clsx(
                  'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold',
                  detectedCardBrand === brand ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted',
                )}
              >
                <AccountCardBrandBadge brand={brand} />
                {getCardBrandLabel(brand, lang)}
              </span>
            ))}
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-extrabold text-muted">
                {lang === 'ar' ? '\u0627\u0644\u0627\u0633\u0645 \u0639\u0644\u0649 \u0627\u0644\u0628\u0637\u0627\u0642\u0629' : 'Name on card'}
              </label>
              <Input
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder={lang === 'ar' ? '\u0645\u062d\u0645\u062f \u0623\u062d\u0645\u062f' : 'John Doe'}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-extrabold text-muted">
                {lang === 'ar' ? '\u0631\u0642\u0645 \u0627\u0644\u0628\u0637\u0627\u0642\u0629' : 'Card number'}
              </label>
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

            <div>
              <label className="mb-2 block text-xs font-extrabold text-muted">
                {lang === 'ar' ? '\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0627\u0646\u062a\u0647\u0627\u0621' : 'Expiry'}
              </label>
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

            <label className="flex items-center gap-3 text-sm font-semibold text-navy">
              <input type="checkbox" checked={cardDefault} onChange={(e) => setCardDefault(e.target.checked)} />
              {lang === 'ar' ? '\u062a\u0639\u064a\u064a\u0646\u0647\u0627 \u0643\u0628\u0637\u0627\u0642\u0629 \u0627\u0641\u062a\u0631\u0627\u0636\u064a\u0629' : 'Set as default card'}
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" className="h-11 rounded-2xl" onClick={() => setCardModalOpen(false)}>
              {lang === 'ar' ? '\u0625\u0644\u063a\u0627\u0621' : 'Cancel'}
            </Button>
            <Button className="h-11 rounded-2xl" onClick={saveCard}>
              {lang === 'ar' ? '\u062d\u0641\u0638' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>
      */}

      {/* Order details modal */}
      <Modal open={!!openOrder} onClose={() => setOpenOrder(null)}>
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold text-navy">{lang === 'ar' ? 'تفاصيل الطلب' : 'Order details'}</div>
            <button
              type="button"
              data-modal-close
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white text-navy hover:bg-screen"
              onClick={() => setOpenOrder(null)}
              aria-label="close"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
          {openOrder ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold text-navy">
                {lang === 'ar' ? 'طلب' : 'Order'}: <span className="text-primary">#{openOrder.id.slice(-6)}</span>
              </div>
              <span
                className={clsx(
                  'rounded-full px-3 py-1 text-xs font-extrabold',
                  orderStatusTone[openOrder.status],
                )}
              >
                {orderStatusLabel[openOrder.status]}
              </span>
            </div>
            <div className="text-xs font-semibold text-muted">{formatDate(openOrder.createdAt)}</div>

            <div className="rounded-3xl border border-border bg-screen/40 p-4">
              <div className="text-sm font-extrabold text-navy">{lang === 'ar' ? 'العناصر' : 'Items'}</div>
              <div className="mt-3 space-y-3">
                {openOrder.items.map((i) => (
                  <div key={i.id} className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-extrabold text-navy">{i.name}</div>
                      {i.options?.length ? (
                        <div className="mt-1 text-xs font-semibold text-muted">
                          {(i.options ?? []).map((option, optionIndex) => (
                            <span key={`${i.id}-option-${optionIndex}`}>
                              <CurrencyInlineText text={option} lang={lang} />
                              {optionIndex < (i.options?.length ?? 0) - 1 ? ' • ' : ''}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <div className="mt-1 text-xs font-semibold text-muted">
                        {lang === 'ar' ? 'الكمية' : 'Qty'}: {i.quantity}
                      </div>
                    </div>
                    <div className="text-sm font-extrabold text-navy">{currency(i.price * i.quantity, lang)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-screen/40 p-4">
              <div className="text-sm font-extrabold text-navy">{lang === 'ar' ? 'الملخص' : 'Summary'}</div>
              <div className="mt-3 space-y-2 text-sm font-semibold text-muted">
                <div className="flex items-center justify-between">
                  <span>{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span className="font-extrabold text-navy">{currency(openOrder.subtotal, lang)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{lang === 'ar' ? 'رسوم التوصيل' : 'Delivery'}</span>
                  <span className="font-extrabold text-navy">{currency(openOrder.deliveryFee, lang)}</span>
                </div>
                {openOrder.discount ? (
                  <div className="flex items-center justify-between">
                    <span>{lang === 'ar' ? 'الخصم' : 'Discount'}</span>
                    <span className="font-extrabold text-primary">{currency(-openOrder.discount, lang)}</span>
                  </div>
                ) : null}
                <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-navy font-extrabold">{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-navy font-extrabold">{currency(openOrder.total, lang)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              {openOrder.status === 'pending' || openOrder.status === 'accepted' || openOrder.status === 'preparing' ? (
                <Button
                  variant="outline"
                  className="h-11 rounded-2xl border-danger/30 text-danger hover:bg-danger/5"
                  onClick={() => handleCancelOrder(openOrder.id)}
                >
                  {lang === 'ar' ? 'إلغاء الطلب' : 'Cancel order'}
                </Button>
              ) : null}
              <Button variant="outline" className="h-11 rounded-2xl" onClick={() => setOpenOrder(null)}>
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </Button>
              {/* Reorder button commented for future use
              <Button className="h-11 rounded-2xl" onClick={() => reorder(openOrder)}>
                {lang === 'ar' ? 'إعادة الطلب' : 'Reorder'}
              </Button>
              */}
            </div>
          </div>
        ) : null}
        </div>
      </Modal>
    </div>
  )
}

function AccountCardBrandBadge({
  brand,
}: {
  brand: SavedCard['brand']
}) {
  if (brand === 'visa') {
    return (
      <span className="inline-flex h-7 min-w-[50px] items-center justify-center rounded-lg border border-white/30 bg-white/10 px-2">
        <VisaIcon size={20} />
      </span>
    )
  }

  if (brand === 'mastercard') {
    return (
      <span className="inline-flex h-7 min-w-[50px] items-center justify-center rounded-lg border border-white/30 bg-white/10 px-2">
        <MastercardIcon size={20} />
      </span>
    )
  }

  return (
    <span className="inline-flex h-7 min-w-[50px] items-center justify-center rounded-lg border border-white/30 bg-white/10 px-2 text-[10px] font-black uppercase tracking-wide">
      {brand === 'mada' ? 'mada' : 'card'}
    </span>
  )
}

