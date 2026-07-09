import { useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useRef } from 'react'
import clsx from 'clsx'

import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import {
  ArrowRightIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  LocationIcon,
  MailIcon,
  PhoneIcon,
  SnapchatIcon,
  TikTokIcon,
  TwitterIcon,
  WhatsAppIcon,
  YouTubeIcon,
} from '@/components/icons'
import { useI18n } from '@/i18n/I18nProvider'
import { toast } from '@/lib/toast'
import { resolveApiErrorMessage, submitContact } from '@/api'
import { useAppSelector } from '@/store/hooks'

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

function normalizeMapEmbedUrl(value: string | undefined): string | null {
  const raw = (value ?? '').trim()
  if (!raw) return null
  if (/^(?:https?:)?\/\//i.test(raw)) return raw
  return null
}

type Coordinates = {
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

function parseCoordinatesFromText(value: string | undefined): Coordinates | null {
  const raw = (value ?? '').trim()
  if (!raw) return null

  const match = raw.match(/(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)/)
  if (!match) return null

  const latitude = Number.parseFloat(match[1])
  const longitude = Number.parseFloat(match[2])
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null

  return { latitude, longitude }
}

function ContactLocationMap({
  title,
  fallbackEmbedUrl,
  coordinates,
  pinLabel,
}: {
  title: string
  fallbackEmbedUrl: string
  coordinates: Coordinates | null
  pinLabel: string
}) {
  const mapElementRef = useRef<HTMLDivElement | null>(null)
  const [useIframeFallback, setUseIframeFallback] = useState(coordinates === null)

  useEffect(() => {
    if (!coordinates) {
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

        const marker = L.marker([coordinates.latitude, coordinates.longitude], { icon: markerIcon }).addTo(mapInstance)
        const popupText = pinLabel.trim()
        if (popupText) marker.bindPopup(popupText)

        mapInstance.setView([coordinates.latitude, coordinates.longitude], 15)
      })
      .catch(() => {
        if (!disposed) setUseIframeFallback(true)
      })

    return () => {
      disposed = true
      if (mapInstance) mapInstance.remove()
    }
  }, [coordinates, pinLabel])

  if (useIframeFallback) {
    return (
      <iframe
        title={title}
        className="h-[320px] w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={fallbackEmbedUrl}
      />
    )
  }

  return <div ref={mapElementRef} className="h-[320px] w-full" />
}

export default function ContactPage() {
  const { t, dir } = useI18n()
  const settings = useAppSelector((state) => state.settings.data)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    if (submitting) return

    if (!fullName.trim() || !email.trim() || !phone.trim() || !subject.trim() || !message.trim()) {
      toast.error(t('contact.toast.required'))
      return
    }
    if (!email.includes('@')) {
      toast.error(t('contact.toast.invalidEmail'))
      return
    }
    const normalizedPhone = normalizeSaudiMobilePhone(phone.trim())
    if (!normalizedPhone) {
      toast.error(t('toast.invalidSaudiPhone'))
      return
    }

    setSubmitting(true)
    try {
      const result = await submitContact({
        name: fullName.trim(),
        email: email.trim(),
        phone: normalizedPhone,
        subject: subject.trim(),
        message: message.trim(),
      })

      if (!result.success) {
        throw new Error(result.message || t('contact.toast.submitFailed'))
      }

      setFullName('')
      setEmail('')
      setPhone('')
      setSubject('')
      setMessage('')
      toast.success(t('contact.toast.sentSuccess'))
    } catch (error) {
      toast.error(resolveApiErrorMessage(error, t('contact.toast.submitFailed')))
    } finally {
      setSubmitting(false)
    }
  }

  function onSocialClick(e: MouseEvent<HTMLAnchorElement>, url: string | null) {
    if (!url) {
      e.preventDefault()
      toast.info(t('contact.toast.linksSoon'))
    }
  }

  const socials = [
    { label: 'facebook', url: normalizeExternalUrl(settings?.facebookUrl), icon: <FacebookIcon size={16} /> },
    { label: 'instagram', url: normalizeExternalUrl(settings?.instagramUrl), icon: <InstagramIcon size={16} /> },
    { label: 'linkedin', url: normalizeExternalUrl(settings?.linkedinUrl), icon: <LinkedInIcon size={16} /> },
    { label: 'twitter', url: normalizeExternalUrl(settings?.xUrl || settings?.twitterUrl), icon: <TwitterIcon size={16} /> },
    { label: 'youtube', url: normalizeExternalUrl(settings?.youtubeUrl), icon: <YouTubeIcon size={16} /> },
    { label: 'tiktok', url: normalizeExternalUrl(settings?.tiktokUrl), icon: <TikTokIcon size={16} /> },
    { label: 'snapchat', url: normalizeExternalUrl(settings?.snapchatUrl), icon: <SnapchatIcon size={16} /> },
    { label: 'whatsapp', url: normalizeExternalUrl(settings?.whatsappUrl, 'whatsapp'), icon: <WhatsAppIcon size={16} /> },
  ]

  const contactPhone = settings?.contactPhone || t('contact.card.phoneValue')
  const contactEmail = settings?.contactEmail || t('contact.card.emailValue')
  const contactAddress =
    dir === 'rtl'
      ? settings?.contactAddressAr || settings?.contactAddress || t('contact.card.addressValue')
      : settings?.contactAddress || settings?.contactAddressAr || t('contact.card.addressValue')
  const mapQuery =
    dir === 'rtl'
      ? settings?.mapQueryAr || settings?.mapQuery || settings?.contactAddressAr || settings?.contactAddress || t('map.cityCountry')
      : settings?.mapQuery || settings?.mapQueryAr || settings?.contactAddress || settings?.contactAddressAr || t('map.cityCountry')
  const mapEmbedUrl =
    normalizeMapEmbedUrl(settings?.mapUrl) ||
    `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=14&output=embed`
  const mapCoordinates = useMemo(
    () => parseCoordinatesFromText(settings?.mapUrl) || parseCoordinatesFromText(mapQuery),
    [mapQuery, settings?.mapUrl],
  )

  return (
    <div>
      <div className="bg-primary/10">
        <Container className="py-5">
          <div className="text-sm font-bold text-muted">
            <Link to="/home" className="hover:text-primary">
              {t('nav.home')}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-navy">{t('nav.contact')}</span>
          </div>
        </Container>
      </div>

      <Container className="py-12">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold text-navy md:text-4xl">{t('contact.title')}</h1>
          <p className="max-w-3xl text-sm font-semibold leading-7 text-muted">{t('contact.description')}</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-card lg:col-span-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-navy">{t('contact.form.title')}</h2>
              <span className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-1 text-xs font-extrabold text-navy">
                <MailIcon className="h-4 w-4" />
                {t('contact.form.fastSupport')}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-extrabold text-muted">{t('contact.form.fullName')}</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t('contact.form.fullNamePlaceholder')} />
              </div>

              <div>
                <label className="mb-2 block text-xs font-extrabold text-muted">{t('contact.form.email')}</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('contact.form.emailPlaceholder')} />
              </div>

              <div>
                <label className="mb-2 block text-xs font-extrabold text-muted">{t('contact.form.phone')}</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('contact.form.phonePlaceholder')} />
              </div>

              <div>
                <label className="mb-2 block text-xs font-extrabold text-muted">{t('contact.form.subject')}</label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t('contact.form.subjectPlaceholder')} />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-xs font-extrabold text-muted">{t('contact.form.message')}</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('contact.form.messagePlaceholder')}
                className="min-h-[140px] w-full rounded-3xl border border-border bg-white px-4 py-3 text-start text-sm font-semibold outline-none focus:border-primary"
              />
            </div>

            <div className="mt-5">
              <Button className="w-full px-8 md:w-auto" onClick={submit} disabled={submitting}>
                {submitting ? t('contact.form.submitting') : t('contact.form.submit')}
              </Button>
            </div>
          </div>

          <div className="rounded-3xl bg-navy p-6 text-white shadow-soft lg:col-span-4">
            <h3 className="text-2xl font-extrabold text-white">{t('contact.card.title')}</h3>

            <div className="mt-6 space-y-5">
              <div className="flex items-start gap-3 sm:gap-3.5">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/15">
                  <LocationIcon className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-xs font-bold text-white/70">{t('contact.card.addressLabel')}</div>
                  <div className="mt-1 text-base font-extrabold leading-7 text-white">{contactAddress}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-3.5">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/15">
                  <PhoneIcon className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-xs font-bold text-white/70">{t('contact.card.phoneLabel')}</div>
                  <div className="mt-1 text-base font-extrabold text-white [unicode-bidi:plaintext]" dir="ltr">{contactPhone}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-3.5">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/15">
                  <MailIcon className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-xs font-bold text-white/70">{t('contact.card.emailLabel')}</div>
                  <div className="mt-1 text-base font-extrabold text-white [unicode-bidi:plaintext]" dir="ltr">{contactEmail}</div>
                </div>
              </div>
            </div>

            <div className="mt-7 border-t border-white/20 pt-6">
              <div className="text-base font-extrabold text-white">{t('contact.card.followUs')}</div>
              <div className="mt-3 flex items-center gap-3">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.url || '#'}
                    target={social.url ? '_blank' : undefined}
                    rel={social.url ? 'noreferrer' : undefined}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/30 bg-white/8 text-white hover:bg-white/20"
                    onClick={(e) => onSocialClick(e, social.url)}
                  >
                    {social.icon}
                    <span className="sr-only">{t(`social.${social.label}`)}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-7 overflow-hidden rounded-3xl bg-gradient-to-br from-white/16 via-white/10 to-white/6 p-5 ring-1 ring-white/15 shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
              <div className="inline-flex rounded-full bg-primary/20 px-3 py-1 text-[11px] font-extrabold tracking-wide text-primary">
                FAQ
              </div>
              <div className="mt-3 text-xl font-extrabold text-white">{t('contact.card.faqTitle')}</div>
              <p className="mt-3 text-sm font-semibold leading-7 text-white/80">{t('contact.card.faqDescription')}</p>
              <Link
                to="/faq"
                className="group mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-white/20"
              >
                {t('contact.card.helpCenter')}
                <ArrowRightIcon
                  className={clsx(
                    'h-4 w-4 transition-transform duration-200 group-hover:translate-x-1',
                    dir === 'rtl' && 'rotate-180 group-hover:-translate-x-1',
                  )}
                />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-white shadow-card">
          <ContactLocationMap
            title={t('map.title')}
            fallbackEmbedUrl={mapEmbedUrl}
            coordinates={mapCoordinates}
            pinLabel={contactAddress}
          />
        </div>
      </Container>
    </div>
  )
}

