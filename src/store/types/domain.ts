export type Kitchen = {
  id: string
  title: string
  titleAr?: string
  titleEn?: string
  subtitle: string
  subtitleAr?: string
  subtitleEn?: string
  imageUrl: string
  discountLabel?: string
  discountLabelAr?: string
  discountLabelEn?: string
}

export type Brand = {
  id: string
  name: string
  nameAr?: string
  nameEn?: string
  logoUrl: string
  coverUrl?: string
}

export type Category = {
  id: string
  name: string
  nameAr?: string
  nameEn?: string
  imageUrl: string
  restaurantsCount: number
}

export type CuisineType = {
  key: string
  name?: string
  nameAr?: string
  label: string
  labelAr?: string
  labelEn?: string
  imageUrl?: string
}

export type Restaurant = {
  id: string
  name: string
  nameAr?: string
  nameEn?: string
  description?: string
  descriptionAr?: string
  descriptionEn?: string
  logoUrl: string
  coverUrl: string
  phone?: string
  email?: string
  address?: string
  addressAr?: string
  addressEn?: string
  stateId?: string
  city?: string
  latitude?: number
  longitude?: number
  mapUrl?: string
  cuisine: string
  cuisineAr?: string
  cuisineEn?: string
  tags: string[]
  rating: number
  reviewsCount: number
  ordersCount: number
  deliveryTimeMin: number
  deliveryTimeMax: number
  minimumOrder?: number
  openingHours?: string
  closingHours?: string
  isOpen: boolean
}

export type User = {
  id: string
  fullName: string
  email: string
  phone?: string
}

export type ApiResult<T> = {
  data: T
  message?: string
}

export type Review = {
  id: string
  restaurantId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}

export type CartItem = {
  id: string
  restaurantId: string
  /** Source menu item id (stable for matching menu details/add-ons) */
  menuItemId?: string
  /** Selected backend addon ids used when sending cart/order payloads. */
  addonIds?: Array<string | number>
  name: string
  price: number
  /** VAT percentage returned by backend for this item. */
  vatPercentage?: number
  /** Whether backend price is already VAT-inclusive. */
  vatIncluded?: boolean
  /** Unit base price used for subtotal (without add-ons). */
  basePrice?: number
  /** Original unit price before discount (if any). */
  oldPrice?: number
  quantity: number

  /** Optional presentation fields for UI */
  imageUrl?: string
  /** Selected options (size/addons/etc.) */
  options?: string[]
}

export type PaymentMethod = 'apple_pay' | 'card' | 'cod'

export type Address = {
  id: string
  restaurantId?: string
  label: string
  labelAr?: string
  labelEn?: string
  details: string
  detailsAr?: string
  detailsEn?: string
  isDefault?: boolean
  stateId?: string
  governorate?: string
  governorateAr?: string
  governorateEn?: string
  governorateCode?: string
  city?: string
  cityAr?: string
  cityEn?: string
  cityCode?: string
  district?: string
  street?: string
  buildingNo?: string
  floor?: string
  apartment?: string
  landmark?: string
  postalCode?: string
  phone?: string
  latitude?: number
  longitude?: number
}

/**
 * A saved card for quicker checkout.
 * (This is a mock-front-end model. Do not use it to store real card numbers.)
 */
export type SavedCard = {
  id: string
  nameOnCard: string
  last4: string
  expiry: string
  brand?: 'visa' | 'mastercard' | 'amex' | 'mada' | 'other'
  isDefault?: boolean
}

export type Order = {
  id: string
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  vat: number
  discount?: number
  total: number
  addressId: string
  paymentMethod: PaymentMethod
  notes?: string
  status: 'pending' | 'accepted' | 'preparing' | 'out_for_delivery' | 'on_the_way' | 'delivered' | 'cancelled'
  createdAt: string
}
