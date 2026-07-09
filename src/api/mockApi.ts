import type {
  Address,
  Brand,
  CartItem,
  Category,
  Kitchen,
  Order,
  PaymentMethod,
  Restaurant,
  Review,
  SavedCard,
  User,
} from '@/store/types/domain'
import { categories, cuisines, kitchens, mostOrderedRestaurants, restaurants } from '@/data/mockData'
import type {
  AppSettings,
  Faq,
  ForgotPasswordPayload,
  ForgotPasswordResult,
  Promotion,
  RestaurantBranch,
  RestaurantDeliveryCheckResult,
  StateOption,
} from './index'

export type RestaurantsQuery = {
  search?: string
  address?: string
  latitude?: number
  longitude?: number
  categoryIds?: string[]
  categoryNames?: string[]
  cuisineKeys?: string[]
  cuisineLabels?: string[]
  minRating?: number
  openNow?: boolean
  sortBy?: 'recommended' | 'rating' | 'orders'
  page?: number
  pageSize?: number
}

type NewsletterPayload = {
  email: string
}

type NewsletterResult = {
  success: boolean
  message?: string
}

const SIMULATE_NETWORK_DELAY = false
const STORAGE_KEY = 'البرق السريع_mock_storage_v2'
const isBrowser = typeof window !== 'undefined'
const MOCK_DELIVERY_FEE = 15
const MOCK_VAT_PERCENTAGE = 15

const DEFAULT_SETTINGS: AppSettings = {
  siteName: 'البرق السريع',
  siteNameAr: 'البرق السريع',
  siteDescription: 'For delivering restaurant orders to hotels around Al Haram Al Makki.',
  siteDescriptionAr: 'لتوصيل طلبات المطاعم لفنادق الحرم المكي',
  homeHeroTagline: 'For delivering restaurant orders to hotels around Al Haram Al Makki.',
  homeHeroTaglineAr: 'لتوصيل طلبات المطاعم لفنادق الحرم المكي',
  homeHeroDescription: 'Enter your address to see restaurants available in your area',
  homeHeroDescriptionAr: 'اكتب عنوانك للوصول للمطاعم المتاحة في منطقتك',
  contactEmail: 'support@albarqalsaree.com',
  contactPhone: '+966 54 265 3495',
  contactAddress: 'Makkah Al Mukarramah, Saudi Arabia',
  contactAddressAr: 'مكة المكرمة، المملكة العربية السعودية',
  mapUrl: '',
  mapQuery: 'Makkah Al Mukarramah, Saudi Arabia',
  mapQueryAr: 'مكة المكرمة، المملكة العربية السعودية',
  facebookUrl: '',
  instagramUrl: '',
  linkedinUrl: '',
  twitterUrl: '',
  xUrl: '',
  youtubeUrl: '',
  tiktokUrl: '',
  snapchatUrl: '',
  whatsappUrl: '',
  logoUrl: '/images/albarq-main-logo-180.png',
  faqJson: '',
  faqJsonAr: '',
  faqContent: '',
  faqContentAr: '',
  privacyContent: '',
  privacyContentAr: '',
  termsContent: '',
  termsContentAr: '',
  aboutTitle: '',
  aboutTitleAr: '',
  aboutContent: '',
  aboutContentAr: '',
  aboutImage: '',
  aboutFeature1: '',
  aboutFeature1Ar: '',
  aboutFeature2: '',
  aboutFeature2Ar: '',
  aboutFeature3: '',
  aboutFeature3Ar: '',
  ourVision: '',
  ourVisionAr: '',
  ourMission: '',
  ourMissionAr: '',
  statPartners: '120+',
  statPartnersAr: '١٢٠+',
  statCustomers: '500k+',
  statCustomersAr: '٥٠٠+',
  statPartnersCount: '5k+',
  statPartnersCountAr: '٥+',
  statDailyOrders: '10k+',
  statDailyOrdersAr: '١٠+',
  weTrustTitle: '',
  weTrustTitleAr: '',
  weTrustContent: '',
  weTrustContentAr: '',
  weTrustImage: '',
  weTrustImageTitle: '',
  weTrustImageTitleAr: '',
}

const DEFAULT_PROMOTIONS: Promotion[] = [
  {
    id: '1',
    code: 'barq101',
    description: 'Exclusive discounts',
    descriptionAr: 'خصومات حصرية',
    imageUrl: '/images/hero-delivery.jpg',
    discountType: 'percentage',
    discountValue: 10,
    minimumOrder: 1,
    maxDiscount: 50,
    isActive: true,
    validFrom: '2026-02-26T00:00:00.000Z',
    validUntil: '2026-03-05T00:00:00.000Z',
  },
]

const DEFAULT_FAQS: Faq[] = [
  {
    id: 'faq-1',
    question: 'How can I track my order?',
    questionAr: 'كيف يمكنني تتبع طلبي؟',
    answer: 'You can track your order from the Orders page in your account.',
    answerAr: 'يمكنك تتبع طلبك من صفحة الطلبات داخل حسابك.',
    order: 1,
    isActive: true,
  },
]

const DEFAULT_STATES: StateOption[] = [
  {
    id: '2',
    name: 'Makkah Al Mukarramah Region',
    nameAr: 'منطقة مكة المكرمة',
    code: 'makkah',
    cities: [
      {
        id: 'makkah-city',
        name: 'Makkah Al Mukarramah',
        nameAr: 'مكة المكرمة',
        neighborhoods: [],
      },
    ],
  },
]

type PersistedState = {
  reviewsStore: Review[]
  cartStore: CartItem[]
  addressesStore: Address[]
  ordersStore: Order[]
  favoritesStore: string[]
  favoriteProductsStore: string[]
  cardsStore: SavedCard[]
  newsletterSubscribersStore: string[]
}

function wait(ms: number) {
  if (!SIMULATE_NETWORK_DELAY) return Promise.resolve()
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function hashText(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

function loadPersisted(): PersistedState | null {
  if (!isBrowser) return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    if (!parsed || typeof parsed !== 'object') return null
    return {
      reviewsStore: Array.isArray(parsed.reviewsStore) ? parsed.reviewsStore : [],
      cartStore: Array.isArray(parsed.cartStore) ? parsed.cartStore : [],
      addressesStore: Array.isArray(parsed.addressesStore) ? parsed.addressesStore : [],
      ordersStore: Array.isArray(parsed.ordersStore) ? parsed.ordersStore : [],
      favoritesStore: Array.isArray(parsed.favoritesStore) ? parsed.favoritesStore : [],
      favoriteProductsStore: Array.isArray(parsed.favoriteProductsStore) ? parsed.favoriteProductsStore : [],
      cardsStore: Array.isArray(parsed.cardsStore) ? parsed.cardsStore : [],
      newsletterSubscribersStore: Array.isArray(parsed.newsletterSubscribersStore) ? parsed.newsletterSubscribersStore : [],
    }
  } catch {
    return null
  }
}

function savePersisted(state: PersistedState) {
  if (!isBrowser) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage failures
  }
}

function normalizeQuantity(value: number, fallback = 1): number {
  if (!Number.isFinite(value)) return fallback
  return Math.max(0, Math.round(value))
}

function ensureSingleDefaultAddress(list: Address[]): Address[] {
  if (!list.length) return []
  let seenDefault = false
  const normalized = list.map((address, index) => {
    if (address.isDefault && !seenDefault) {
      seenDefault = true
      return { ...address, isDefault: true }
    }
    return { ...address, isDefault: false }
  })
  if (seenDefault) return normalized
  return normalized.map((address, index) => (index === 0 ? { ...address, isDefault: true } : address))
}

function ensureSingleDefaultCard(list: SavedCard[]): SavedCard[] {
  if (!list.length) return []
  let seenDefault = false
  const normalized = list.map((card, index) => {
    if (card.isDefault && !seenDefault) {
      seenDefault = true
      return { ...card, isDefault: true }
    }
    return { ...card, isDefault: false }
  })
  if (seenDefault) return normalized
  return normalized.map((card, index) => (index === 0 ? { ...card, isDefault: true } : card))
}

let reviewsStore: Review[] = []
let cartStore: CartItem[] = []
let addressesStore: Address[] = []
let ordersStore: Order[] = []
let favoritesStore: string[] = []
let favoriteProductsStore: string[] = []
let cardsStore: SavedCard[] = []
let newsletterSubscribersStore: string[] = []

;(() => {
  const persisted = loadPersisted()
  if (!persisted) return
  reviewsStore = persisted.reviewsStore
  cartStore = persisted.cartStore
  addressesStore = ensureSingleDefaultAddress(persisted.addressesStore)
  ordersStore = persisted.ordersStore
  favoritesStore = persisted.favoritesStore
  favoriteProductsStore = persisted.favoriteProductsStore
  cardsStore = ensureSingleDefaultCard(persisted.cardsStore)
  newsletterSubscribersStore = persisted.newsletterSubscribersStore
})()

function persistAll() {
  savePersisted({
    reviewsStore,
    cartStore,
    addressesStore,
    ordersStore,
    favoritesStore,
    favoriteProductsStore,
    cardsStore,
    newsletterSubscribersStore,
  })
}

export async function getHome(): Promise<{ kitchens: Kitchen[]; mostOrdered: Restaurant[]; suggested: Brand[] }> {
  await wait(350)
  return {
    kitchens,
    mostOrdered: mostOrderedRestaurants,
    suggested: restaurants.slice(-5).map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      nameAr: restaurant.nameAr,
      nameEn: restaurant.nameEn,
      logoUrl: restaurant.logoUrl,
      coverUrl: restaurant.coverUrl,
    })),
  }
}

export async function getCategories(): Promise<Category[]> {
  await wait(220)
  return categories
}

export async function getSettings(): Promise<AppSettings> {
  await wait(180)
  return { ...DEFAULT_SETTINGS }
}

export async function getPromotions(): Promise<Promotion[]> {
  await wait(150)
  return DEFAULT_PROMOTIONS.map((promotion) => ({ ...promotion }))
}

export async function getFaqs(): Promise<Faq[]> {
  await wait(150)
  return DEFAULT_FAQS.map((faq) => ({ ...faq }))
}

export async function getStates(): Promise<StateOption[]> {
  await wait(140)
  return DEFAULT_STATES.map((state) => ({
    ...state,
    cities: state.cities.map((city) => ({ ...city, neighborhoods: [...city.neighborhoods] })),
  }))
}

export async function getRestaurants(query: RestaurantsQuery): Promise<{ items: Restaurant[]; total: number }> {
  await wait(420)
  const page = Math.max(1, query.page ?? 1)
  const pageSize = Math.max(1, query.pageSize ?? 10)

  let filtered = [...restaurants]
  const normalize = (value: string): string =>
    value
      .toLowerCase()
      .normalize('NFKC')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  if (query.search?.trim()) {
    const needle = query.search.trim().toLowerCase()
    filtered = filtered.filter((restaurant) => {
      return restaurant.name.toLowerCase().includes(needle) || restaurant.cuisine.toLowerCase().includes(needle)
    })
  }

  if (query.categoryIds?.length) {
    const categoryNames = query.categoryIds
      .map((id) => categories.find((category) => category.id === id)?.name)
      .filter((value): value is string => Boolean(value))
    if (categoryNames.length) {
      filtered = filtered.filter((restaurant) =>
        categoryNames.some((categoryName) => restaurant.tags.some((tag) => tag.includes(categoryName))),
      )
    }
  }

  if (query.cuisineKeys?.length) {
    const labels = cuisines.filter((item) => query.cuisineKeys?.includes(item.key)).map((item) => item.label)
    if (labels.length) {
      filtered = filtered.filter((restaurant) =>
        labels.some((label) => restaurant.cuisine.includes(label) || restaurant.tags.some((tag) => tag.includes(label))),
      )
    }
  }

  if (query.address?.trim()) {
    const addressNeedle = normalize(query.address)
    const hasAddressMetadata = filtered.some((restaurant) =>
      [restaurant.address, restaurant.addressAr, restaurant.city]
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        .some((value) => normalize(value).length > 0),
    )

    if (hasAddressMetadata) {
      filtered = filtered.filter((restaurant) => {
        const haystack = [restaurant.address, restaurant.addressAr, restaurant.city]
          .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
          .map((value) => normalize(value))
          .filter(Boolean)
        return haystack.some((value) => value.includes(addressNeedle) || addressNeedle.includes(value))
      })
    }
  }

  if ((query.minRating ?? 0) > 0) {
    filtered = filtered.filter((restaurant) => restaurant.rating >= (query.minRating ?? 0))
  }

  if (query.openNow === true) {
    filtered = filtered.filter((restaurant) => restaurant.isOpen)
  } else if (query.openNow === false) {
    filtered = filtered.filter((restaurant) => !restaurant.isOpen)
  }

  if (query.sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating)
  } else if (query.sortBy === 'orders') {
    filtered.sort((a, b) => b.ordersCount - a.ordersCount)
  }

  const total = filtered.length
  const start = (page - 1) * pageSize
  return {
    items: filtered.slice(start, start + pageSize),
    total,
  }
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  await wait(260)
  return restaurants.find((restaurant) => restaurant.id === id) ?? mostOrderedRestaurants.find((restaurant) => restaurant.id === id) ?? null
}

export async function getRestaurantBranches(restaurantId: string): Promise<RestaurantBranch[]> {
  await wait(240)
  const restaurant = restaurants.find((entry) => entry.id === restaurantId) ?? mostOrderedRestaurants.find((entry) => entry.id === restaurantId)
  const restaurantName = restaurant?.name || `Restaurant ${restaurantId}`

  const seed = hashText(restaurantId)
  const city = 'مكة المكرمة'
  const districts = ['العزيزية', 'الشوقية', 'العوالي', 'النسيم', 'الزاهر', 'بطحاء قريش'] as const

  return Array.from({ length: 3 }).map((_, index) => {
    const district = districts[(seed + index * 2) % districts.length]
    const latitude = 21.3891 + index * 0.004
    const longitude = 39.8579 + index * 0.004
    return {
      id: `${restaurantId}-branch-${index + 1}`,
      name: index === 0 ? `${restaurantName} - الفرع الرئيسي` : `${restaurantName} - فرع ${district}`,
      address: `${city}، حي ${district}، طريق المسجد الحرام`,
      phone: '+966 54 265 3495',
      city,
      state: city,
      latitude,
      longitude,
      mapUrl: `https://www.google.com/maps?q=${latitude},${longitude}`,
      isOpen: (seed + index) % 3 !== 0,
    }
  })
}

export async function checkRestaurantDelivery(
  restaurantId: string,
  _stateId: string,
  _location?: {
    cityId?: string
    city?: string
    district?: string
  },
): Promise<RestaurantDeliveryCheckResult> {
  await wait(120)
  const branches = await getRestaurantBranches(restaurantId)
  const primary = branches[0]
  return {
    available: branches.length > 0,
    message: branches.length > 0 ? 'Delivery available' : 'Delivery unavailable',
    branchId: primary?.id,
    fee: MOCK_DELIVERY_FEE,
    etaMin: 25,
    etaMax: 45,
  }
}

export async function getReviews(restaurantId: string): Promise<Review[]> {
  await wait(200)
  return reviewsStore.filter((review) => review.restaurantId === restaurantId)
}

export async function addReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
  await wait(260)
  const next: Review = {
    ...review,
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  }
  reviewsStore = [...reviewsStore, next]
  persistAll()
  return next
}

export async function login(payload: { email: string; password: string }): Promise<{ user: User; token: string }> {
  await wait(280)
  if (!payload.email.includes('@') || payload.password.trim().length < 4) {
    throw new Error('بيانات الدخول غير صحيحة')
  }
  return {
    token: `mock-token-${Math.random().toString(36).slice(2)}`,
    user: {
      id: 'u1',
      fullName: 'عميل البرق السريع',
      email: payload.email.trim(),
      phone: '+966 54 265 3495',
    },
  }
}

export async function register(payload: {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}): Promise<{ user: User; token: string }> {
  await wait(320)
  if (!payload.email.includes('@') || payload.password.length < 4 || payload.password !== payload.confirmPassword) {
    throw new Error('يرجى إدخال بيانات صحيحة')
  }
  return {
    token: `mock-token-${Math.random().toString(36).slice(2)}`,
    user: {
      id: `u-${Math.random().toString(36).slice(2, 10)}`,
      fullName: payload.fullName.trim() || 'عميل جديد',
      email: payload.email.trim(),
      phone: payload.phone.trim() || '+966 54 265 3495',
    },
  }
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<ForgotPasswordResult> {
  await wait(220)

  const email = payload.email.trim()
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email.')
  }

  return {
    success: true,
    message: 'Password reset link has been sent to your email.',
  }
}

export async function resetPassword(payload: {
  token?: string
  code?: string
  email?: string
  password: string
  confirmPassword: string
}): Promise<void> {
  await wait(220)

  const token = (payload.token ?? '').trim()
  const code = (payload.code ?? '').trim()
  if (!token && !code) {
    throw new Error('Password reset token is missing.')
  }
  if (payload.password.trim().length < 6) {
    throw new Error('Password must be at least 6 characters.')
  }
  if (payload.password !== payload.confirmPassword) {
    throw new Error('Passwords do not match.')
  }
}

export async function getCart(): Promise<CartItem[]> {
  await wait(140)
  return [...cartStore]
}

export async function addToCart(item: CartItem): Promise<CartItem[]> {
  await wait(180)
  const quantity = normalizeQuantity(item.quantity, 1)
  if (quantity <= 0) return [...cartStore]

  const existing = cartStore.find((entry) => entry.id === item.id)
  if (existing) {
    existing.quantity = Math.max(1, normalizeQuantity(existing.quantity, 1) + quantity)
  } else {
    cartStore.push({ ...item, quantity })
  }
  persistAll()
  return [...cartStore]
}

export async function updateCartItem(id: string, quantity: number): Promise<CartItem[]> {
  await wait(150)
  const nextQuantity = normalizeQuantity(quantity, 0)
  if (nextQuantity <= 0) {
    cartStore = cartStore.filter((entry) => entry.id !== id)
  } else {
    cartStore = cartStore.map((entry) => (entry.id === id ? { ...entry, quantity: nextQuantity } : entry))
  }
  persistAll()
  return [...cartStore]
}

export async function removeCartItem(id: string): Promise<CartItem[]> {
  await wait(120)
  cartStore = cartStore.filter((entry) => entry.id !== id)
  persistAll()
  return [...cartStore]
}

export async function clearCart(): Promise<CartItem[]> {
  await wait(120)
  cartStore = []
  persistAll()
  return []
}

export async function getAddresses(): Promise<Address[]> {
  await wait(160)
  return [...addressesStore]
}

export async function addAddress(address: Omit<Address, 'id'>): Promise<Address[]> {
  await wait(200)
  const next: Address = {
    ...address,
    id: `addr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    isDefault: addressesStore.length === 0 ? true : Boolean(address.isDefault),
  }

  if (next.isDefault) {
    addressesStore = addressesStore.map((entry) => ({ ...entry, isDefault: false }))
  }

  addressesStore = ensureSingleDefaultAddress([...addressesStore, next])
  persistAll()
  return [...addressesStore]
}

export async function updateAddress(id: string, patch: Partial<Omit<Address, 'id'>>): Promise<Address[]> {
  await wait(180)
  addressesStore = addressesStore.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry))
  if (patch.isDefault) {
    addressesStore = addressesStore.map((entry) => (entry.id === id ? { ...entry, isDefault: true } : { ...entry, isDefault: false }))
  }
  addressesStore = ensureSingleDefaultAddress(addressesStore)
  persistAll()
  return [...addressesStore]
}

export async function deleteAddress(id: string): Promise<Address[]> {
  await wait(160)
  addressesStore = addressesStore.filter((entry) => entry.id !== id)
  addressesStore = ensureSingleDefaultAddress(addressesStore)
  persistAll()
  return [...addressesStore]
}

export async function setDefaultAddress(id: string): Promise<Address[]> {
  await wait(140)
  addressesStore = addressesStore.map((entry) => (entry.id === id ? { ...entry, isDefault: true } : { ...entry, isDefault: false }))
  addressesStore = ensureSingleDefaultAddress(addressesStore)
  persistAll()
  return [...addressesStore]
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
  await wait(260)
  const sourceCartItems =
    Array.isArray(payload.cartItems) && payload.cartItems.length
      ? payload.cartItems.map((item) => ({ ...item }))
      : cartStore.map((item) => ({ ...item }))
  if (!sourceCartItems.length) {
    throw new Error('السلة فارغة')
  }

  const subtotal = sourceCartItems.reduce((sum, item) => {
    const baseUnitPrice =
      Number.isFinite(item.basePrice)
        ? Math.max(0, Number(item.basePrice))
        : Math.max(0, item.price)
    return sum + baseUnitPrice * item.quantity
  }, 0)
  const addonsTotal = sourceCartItems.reduce((sum, item) => {
    const baseUnitPrice =
      Number.isFinite(item.basePrice)
        ? Math.max(0, Number(item.basePrice))
        : Math.max(0, item.price)
    const addonsPerUnit = Math.max(0, item.price - baseUnitPrice)
    return sum + addonsPerUnit * item.quantity
  }, 0)
  const orderSubtotal = subtotal + addonsTotal
  const deliveryFee =
    typeof payload.deliveryFee === 'number' && Number.isFinite(payload.deliveryFee)
      ? Math.max(0, payload.deliveryFee)
      : MOCK_DELIVERY_FEE
  const vat = Number((subtotal * (MOCK_VAT_PERCENTAGE / 100)).toFixed(2))
  const discount = Math.max(0, Number(payload.discount ?? 0))
  const total = Number((orderSubtotal + deliveryFee + vat - discount).toFixed(2))

  const order: Order = {
    id: `ord-${Date.now()}`,
    items: sourceCartItems.map((item) => ({ ...item })),
    subtotal,
    deliveryFee,
    vat,
    discount,
    total,
    addressId: payload.addressId,
    paymentMethod: payload.paymentMethod,
    notes: payload.notes,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  ordersStore = [order, ...ordersStore]
  cartStore = []
  persistAll()
  return order
}

export async function cancelOrder(id: string): Promise<Order[]> {
  await wait(180)
  ordersStore = ordersStore.map((order) => (order.id === id ? { ...order, status: 'cancelled' } : order))
  persistAll()
  return [...ordersStore]
}

export async function getOrders(): Promise<Order[]> {
  await wait(160)
  return [...ordersStore]
}

export async function getOrderById(id: string): Promise<Order | null> {
  await wait(140)
  return ordersStore.find((order) => order.id === id) ?? null
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function subscribeNewsletter(payload: NewsletterPayload): Promise<NewsletterResult> {
  await wait(120)
  const email = normalizeEmail(payload.email)
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email')
  }

  if (!newsletterSubscribersStore.includes(email)) {
    newsletterSubscribersStore = [...newsletterSubscribersStore, email]
    persistAll()
  }

  return { success: true, message: 'Subscribed successfully' }
}

export async function unsubscribeNewsletter(payload: NewsletterPayload): Promise<NewsletterResult> {
  await wait(120)
  const email = normalizeEmail(payload.email)
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email')
  }
  newsletterSubscribersStore = newsletterSubscribersStore.filter((entry) => entry !== email)
  persistAll()
  return { success: true, message: 'Successfully unsubscribed from newsletter' }
}

export async function getFavoriteRestaurantIds(): Promise<string[]> {
  await wait(120)
  return [...favoritesStore]
}

export async function toggleFavoriteRestaurant(restaurantId: string): Promise<string[]> {
  await wait(140)
  if (favoritesStore.includes(restaurantId)) {
    favoritesStore = favoritesStore.filter((id) => id !== restaurantId)
  } else {
    favoritesStore = [...favoritesStore, restaurantId]
  }
  persistAll()
  return [...favoritesStore]
}

export async function getFavoriteProductIds(): Promise<string[]> {
  await wait(120)
  return [...favoriteProductsStore]
}

export async function toggleFavoriteProduct(productId: string): Promise<string[]> {
  await wait(140)
  if (favoriteProductsStore.includes(productId)) {
    favoriteProductsStore = favoriteProductsStore.filter((id) => id !== productId)
  } else {
    favoriteProductsStore = [...favoriteProductsStore, productId]
  }
  persistAll()
  return [...favoriteProductsStore]
}

export async function getSavedCards(): Promise<SavedCard[]> {
  await wait(120)
  return [...cardsStore]
}

function getLast4(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '')
  if (!digits) return '0000'
  return digits.slice(-4).padStart(4, '0')
}

export async function addSavedCard(payload: {
  nameOnCard: string
  cardNumber: string
  expiry: string
  brand?: SavedCard['brand']
  isDefault?: boolean
}): Promise<SavedCard[]> {
  await wait(180)
  const nextCard: SavedCard = {
    id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    nameOnCard: payload.nameOnCard.trim() || 'Card Holder',
    last4: getLast4(payload.cardNumber),
    expiry: payload.expiry.trim() || '12/30',
    brand: payload.brand ?? 'other',
    isDefault: cardsStore.length === 0 ? true : Boolean(payload.isDefault),
  }

  if (nextCard.isDefault) {
    cardsStore = cardsStore.map((card) => ({ ...card, isDefault: false }))
  }

  cardsStore = ensureSingleDefaultCard([...cardsStore, nextCard])
  persistAll()
  return [...cardsStore]
}

export async function deleteSavedCard(id: string): Promise<SavedCard[]> {
  await wait(140)
  cardsStore = cardsStore.filter((card) => card.id !== id)
  cardsStore = ensureSingleDefaultCard(cardsStore)
  persistAll()
  return [...cardsStore]
}

export async function setDefaultCard(id: string): Promise<SavedCard[]> {
  await wait(140)
  cardsStore = cardsStore.map((card) => (card.id === id ? { ...card, isDefault: true } : { ...card, isDefault: false }))
  cardsStore = ensureSingleDefaultCard(cardsStore)
  persistAll()
  return [...cardsStore]
}


