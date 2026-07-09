type PwaBrandingOptions = {
  siteName?: string
  siteDescription?: string
  lang: 'ar' | 'en'
}

const DEFAULT_THEME_COLOR = '#03081F'
const DEFAULT_BACKGROUND_COLOR = '#03081F'
const PWA_ICON_192 = '/pwa/icon-192-logo-v5.png'
const PWA_ICON_512 = '/pwa/icon-512-logo-v5.png'
const APPLE_TOUCH_ICON = '/pwa/icon-192-logo-v5.png'
const FAVICON_ICO = '/logo_icons/favicon.ico'
const FAVICON_32 = '/logo_icons/favicon-32x32.png'
const FAVICON_16 = '/logo_icons/favicon-16x16.png'

function upsertMetaByName(name: string, content: string) {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function upsertMetaByProperty(property: string, content: string) {
  let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('property', property)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function upsertLink(selector: string, attrs: Record<string, string>) {
  let link = document.querySelector(selector) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    document.head.appendChild(link)
  }
  for (const [key, value] of Object.entries(attrs)) {
    link.setAttribute(key, value)
  }
}

export function applyPwaBranding(options: PwaBrandingOptions) {
  if (typeof document === 'undefined') return

  const siteName = (options.siteName ?? '').trim()
  const siteDescription = (options.siteDescription ?? '').trim()
  const fallbackName = options.lang === 'ar' ? 'البرق السريع' : 'Albarq Al Saree'
  const fallbackShortName = options.lang === 'ar' ? 'البرق' : 'Albarq'

  if (siteName) {
    upsertMetaByName('apple-mobile-web-app-title', siteName)
    upsertMetaByProperty('og:site_name', siteName)
  }
  if (siteDescription) {
    upsertMetaByName('description', siteDescription)
    upsertMetaByProperty('og:description', siteDescription)
  }

  upsertLink('link[rel="apple-touch-icon"]', { rel: 'apple-touch-icon', href: APPLE_TOUCH_ICON })
  upsertLink('link[rel="icon"][sizes="any"]', { rel: 'icon', sizes: 'any', href: FAVICON_ICO })
  upsertLink('link[rel="icon"][sizes="32x32"]', { rel: 'icon', sizes: '32x32', href: FAVICON_32 })
  upsertLink('link[rel="icon"][sizes="16x16"]', { rel: 'icon', sizes: '16x16', href: FAVICON_16 })
  upsertLink('link[rel="shortcut icon"]', { rel: 'shortcut icon', href: FAVICON_ICO })

  upsertLink('link[rel="manifest"]', { rel: 'manifest', href: '/manifest.webmanifest' })

  const manifest = {
    id: '/',
    name: siteName || fallbackName,
    short_name: siteName || fallbackShortName,
    description: siteDescription || 'Order food from top restaurants with fast delivery.',
    lang: options.lang,
    dir: options.lang === 'ar' ? 'rtl' : 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui', 'browser'],
    background_color: DEFAULT_BACKGROUND_COLOR,
    theme_color: DEFAULT_THEME_COLOR,
    orientation: 'portrait',
    categories: ['food', 'shopping', 'lifestyle'],
    prefer_related_applications: false,
    icons: [
      { src: PWA_ICON_192, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: PWA_ICON_512, sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  }

  // Keep static manifest URL for stable PWA install behavior while still updating metadata.
  upsertMetaByName('application-name', manifest.name)
}
