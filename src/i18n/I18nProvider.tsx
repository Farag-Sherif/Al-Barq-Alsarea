import * as React from 'react'
import { translations, type Dictionary, type Lang } from './translations'

const STORAGE_KEY = 'البرق السريع_lang'
const MOJIBAKE_REGEX = /(?:\u00C3|\u00C2|\u00D8|\u00D9|\u00D0|\u00D1|\u00CF|\u00E2|\u00F0|\u0152|\u0153|\u0178|\u201A|\u201C|\u201D|\u2018|\u2019|\u2014|\u2013)/
const BROKEN_TEXT_ONLY_REGEX = /^[\s?؟\uFFFD._\-–—,:;\\/|()[\]{}"'`~!@#$%^&*+=<>]+$/
const BROKEN_TEXT_MARKER_REGEX = /[?؟\uFFFD]/
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

type I18nContextValue = {
  lang: Lang
  dir: 'rtl' | 'ltr'
  t: (key: string, vars?: Record<string, string | number>) => string
  setLang: (lang: Lang) => void
  toggleLang: () => void
}

const I18nContext = React.createContext<I18nContextValue | undefined>(undefined)

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template
  return template.replace(/\{\{(.*?)\}\}/g, (_, rawKey) => {
    const key = String(rawKey).trim()
    const val = vars[key]
    return val === undefined || val === null ? '' : String(val)
  })
}

function repairMojibakeText(text: string) {
  if (!MOJIBAKE_REGEX.test(text)) return text

  const bytes: number[] = []
  for (const ch of text) {
    const code = ch.codePointAt(0)
    if (code == null) return text

    if (code <= 0xff) {
      bytes.push(code)
      continue
    }

    const cp1252Byte = CP1252_TO_BYTE[code]
    if (cp1252Byte == null) return text
    bytes.push(cp1252Byte)
  }

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes))
  } catch {
    return text
  }
}

function normalizeTranslationText(text: string) {
  let normalized = text.trim()
  if (!normalized) return ''

  for (let i = 0; i < 3; i += 1) {
    const repaired = repairMojibakeText(normalized)
    if (repaired === normalized) break
    normalized = repaired.trim()
    if (!normalized) return ''
  }

  normalized = normalized.replace(/\s+/g, ' ').trim()
  if (!normalized) return ''

  if (BROKEN_TEXT_ONLY_REGEX.test(normalized) && BROKEN_TEXT_MARKER_REGEX.test(normalized)) {
    return ''
  }

  return normalized
}

const normalizedTranslations: Record<Lang, Dictionary> = {
  ar: Object.fromEntries(Object.entries(translations.ar).map(([key, value]) => [key, normalizeTranslationText(value) || value])),
  en: Object.fromEntries(Object.entries(translations.en).map(([key, value]) => [key, normalizeTranslationText(value) || value])),
}

function detectInitialLang(): Lang {
  // 1) From localStorage
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'ar' || stored === 'en') return stored

  // 2) From browser
  const nav = (navigator.language || '').toLowerCase()
  if (nav.startsWith('en')) return 'en'
  return 'ar'
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>(() => {
    try {
      return detectInitialLang()
    } catch {
      return 'ar'
    }
  })

  const dir: 'rtl' | 'ltr' = lang === 'ar' ? 'rtl' : 'ltr'

  const t = React.useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const dict = normalizedTranslations[lang]
      const fallback = normalizedTranslations.ar
      const template = normalizeTranslationText(dict[key] ?? '') || normalizeTranslationText(fallback[key] ?? '') || key
      return interpolate(template, vars)
    },
    [lang],
  )

  const setLang = React.useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }, [])

  const toggleLang = React.useCallback(() => {
    setLang(lang === 'ar' ? 'en' : 'ar')
  }, [lang, setLang])

  React.useLayoutEffect(() => {
    // Apply language & direction before paint to avoid first-render layout shift.
    document.documentElement.setAttribute('lang', lang)
    document.documentElement.setAttribute('dir', dir)
  }, [lang, dir])

  const value = React.useMemo<I18nContextValue>(
    () => ({
      lang,
      dir,
      t,
      setLang,
      toggleLang,
    }),
    [lang, dir, t, setLang, toggleLang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = React.useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}
