import type { SavedCard } from '@/store/types/domain'

export type CardBrand = NonNullable<SavedCard['brand']>

const MADA_PREFIXES = [
  '440647',
  '440795',
  '446404',
  '457865',
  '457997',
  '474491',
  '588845',
  '968208',
]

export function normalizeCardDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function detectCardBrandFromNumber(value: string): CardBrand {
  const digits = normalizeCardDigits(value)
  if (!digits) return 'other'

  if (MADA_PREFIXES.some((prefix) => digits.startsWith(prefix))) return 'mada'
  if (/^4/.test(digits)) return 'visa'
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return 'mastercard'
  if (/^3[47]/.test(digits)) return 'amex'

  return 'other'
}

export function formatCardNumber(value: string, brand?: SavedCard['brand']): string {
  const digits = normalizeCardDigits(value)
  if (!digits) return ''

  if (brand === 'amex') {
    const p1 = digits.slice(0, 4)
    const p2 = digits.slice(4, 10)
    const p3 = digits.slice(10, 15)
    return [p1, p2, p3].filter(Boolean).join(' ')
  }

  return digits.match(/.{1,4}/g)?.join(' ') ?? digits
}

export function getMaskedCardNumber(last4: string): string {
  const clean = normalizeCardDigits(last4).slice(-4)
  if (!clean) return '**** **** **** ****'
  return `**** **** **** ${clean}`
}

export function getCardBrandLabel(brand: SavedCard['brand'], lang: 'ar' | 'en'): string {
  if (brand === 'visa') return 'Visa'
  if (brand === 'mastercard') return 'Mastercard'
  if (brand === 'amex') return lang === 'ar' ? '\u0623\u0645\u0631\u064a\u0643\u0627\u0646 \u0625\u0643\u0633\u0628\u0631\u064a\u0633' : 'American Express'
  if (brand === 'mada') return 'mada'
  return lang === 'ar' ? '\u0628\u0637\u0627\u0642\u0629' : 'Card'
}

export function getCardBrandTheme(brand: SavedCard['brand']): string {
  if (brand === 'visa') return 'from-[#1A1F71] via-[#1F4AE0] to-[#14297C]'
  if (brand === 'mastercard') return 'from-[#131313] via-[#3b1608] to-[#1a1a1a]'
  if (brand === 'amex') return 'from-[#0070a7] via-[#138cc5] to-[#0b5a84]'
  if (brand === 'mada') return 'from-[#005f4b] via-[#0e8d66] to-[#004739]'
  return 'from-navy via-[#1c335a] to-[#0b1f3f]'
}
