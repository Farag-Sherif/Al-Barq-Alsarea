import type { Lang } from '@/i18n/translations'

export const SAUDI_RIYAL_TEXT_TOKEN = '\uFDFC'
const ARABIC_SAR_LABEL = '\u0631.\u0633' // ر.س
const ENGLISH_SAR_LABEL = 'SAR'
const BIDI_ISOLATE_START = '\u2068'
const BIDI_ISOLATE_END = '\u2069'

const NUMERIC_CHUNK = String.raw`[\d\u0660-\u0669][\d\u0660-\u0669.,\u066B\u066C]*`
const SAR_LABEL_CHUNK = String.raw`(?:sar|s\.?\s*a\.?\s*r\.?|\u0631\.?\s*\u0633\.?|\u0631\u064a\u0627\u0644(?:\s*\u0633\u0639\u0648\u062f\u064a(?:\u0629)?|\u0627\u062a)?|\u0631\u0633|\uFDFC)`

const PRICE_LABEL_WITH_NUMBER = new RegExp(
  String.raw`(^|[^\p{L}\p{N}])(?:(${NUMERIC_CHUNK})\s*(${SAR_LABEL_CHUNK})|(${SAR_LABEL_CHUNK})\s*(${NUMERIC_CHUNK}))(?=$|[^\p{L}\p{N}])`,
  'giu',
)
const STANDALONE_SAR_LABEL = new RegExp(
  String.raw`(^|[^\p{L}\p{N}])(${SAR_LABEL_CHUNK})(?=$|[^\p{L}\p{N}])`,
  'giu',
)

export type CurrencyDisplayParts = {
  numberText: string
  isNegative: boolean
  currencyLabel: string
  currencyPosition: 'before' | 'after'
  isSaudiCurrency: boolean
}

function resolveLang(lang: string | Lang): Lang {
  return lang === 'ar' ? 'ar' : 'en'
}

function getPortableSarLabel(_lang: Lang): string {
  return SAUDI_RIYAL_TEXT_TOKEN
}

function isolate(text: string): string {
  return `${BIDI_ISOLATE_START}${text}${BIDI_ISOLATE_END}`
}

function normalizeProvidedCurrencyLabel(currencyLabel: string | undefined, lang: Lang): string {
  const rawLabel = (currencyLabel ?? '').trim()
  if (!rawLabel) return getPortableSarLabel(lang)

  const lower = rawLabel.toLowerCase().replace(/\s+/g, '')
  const isKnownSarToken =
    lower === SAUDI_RIYAL_TEXT_TOKEN ||
    lower === 'sar' ||
    lower === 's.a.r' ||
    lower === 's.a.r.' ||
    lower === '\u0631.\u0633' ||
    lower === '\u0631\u0633'

  if (isKnownSarToken) return getPortableSarLabel(lang)
  return rawLabel
}

function isSaudiCurrencyToken(label: string): boolean {
  const lower = label.toLowerCase().replace(/\s+/g, '')
  return (
    lower === SAUDI_RIYAL_TEXT_TOKEN ||
    lower === 'sar' ||
    lower === 's.a.r' ||
    lower === 's.a.r.' ||
    lower === '\u0631.\u0633' ||
    lower === '\u0631\u0633' ||
    lower === '\u0631\u064a\u0627\u0644' ||
    lower === '\u0631\u064a\u0627\u0644\u0633\u0639\u0648\u062f\u064a'
  )
}

export function normalizeSaudiPriceText(input: string, lang: string | Lang = 'ar'): string {
  if (!input) return input

  const normalizedLang = resolveLang(lang)
  const currencyToken = isolate(getPortableSarLabel(normalizedLang))

  const withPriceNormalized = input.replace(
    PRICE_LABEL_WITH_NUMBER,
    (
      _full,
      lead: string,
      numberFirst: string | undefined,
      _labelOne: string | undefined,
      _labelTwo: string | undefined,
      numberLast: string | undefined,
    ) => {
      const numberText = numberFirst ?? numberLast ?? ''
      return `${lead}${numberText} ${currencyToken}`
    },
  )

  return withPriceNormalized.replace(STANDALONE_SAR_LABEL, (_full, lead: string) => `${lead}${currencyToken}`)
}

export function toSaudiCurrencySymbolText(input: string, lang: string | Lang = 'ar'): string {
  return normalizeSaudiPriceText(input, lang)
}

export function getCurrencyDisplayParts(amount: number, lang: string | Lang, currencyLabel?: string): CurrencyDisplayParts {
  const normalizedLang = resolveLang(lang)
  const normalizedAmount = Number.isFinite(amount) ? amount : 0
  const numberText = new Intl.NumberFormat(normalizedLang === 'ar' ? 'ar-SA' : 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(normalizedAmount))
  const labelText = normalizeProvidedCurrencyLabel(currencyLabel, normalizedLang)

  return {
    numberText,
    isNegative: normalizedAmount < 0,
    currencyLabel: labelText,
    currencyPosition: normalizedLang === 'ar' ? 'after' : 'before',
    isSaudiCurrency: isSaudiCurrencyToken(labelText),
  }
}

export function formatCurrency(amount: number, lang: string | Lang, currencyLabel?: string): string {
  const parts = getCurrencyDisplayParts(amount, lang, currencyLabel)
  const displayCurrency = isolate(parts.currencyLabel)
  const prefix = parts.isNegative ? '- ' : ''

  return parts.currencyPosition === 'after'
    ? `${prefix}${parts.numberText} ${displayCurrency}`
    : `${prefix}${displayCurrency} ${parts.numberText}`
}
