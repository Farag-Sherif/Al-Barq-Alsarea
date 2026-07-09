import { useState } from 'react'
import { Link } from 'react-router-dom'

import Container from './Container'
import Logo from './Logo'
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  SnapchatIcon,
  TikTokIcon,
  TwitterIcon,
  WhatsAppIcon,
  YouTubeIcon,
} from '@/components/icons'
import { useI18n } from '@/i18n/I18nProvider'
import { toast } from '@/lib/toast'
import { resolveApiErrorMessage, subscribeNewsletter } from '@/api'
import { useAppSelector } from '@/store/hooks'

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

export default function Footer() {
  const { t, lang } = useI18n()
  const settings = useAppSelector((state) => state.settings.data)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const footerDescription =
    lang === 'ar'
      ? settings?.siteDescriptionAr || settings?.siteDescription || t('footer.brandDescription')
      : settings?.siteDescription || settings?.siteDescriptionAr || t('footer.brandDescription')
  const footerAddress =
    lang === 'ar'
      ? settings?.contactAddressAr || settings?.contactAddress || t('footer.address')
      : settings?.contactAddress || settings?.contactAddressAr || t('footer.address')
  const footerPhone = settings?.contactPhone || t('footer.phone')
  const footerEmail = settings?.contactEmail || t('footer.email')
  const brandName =
    lang === 'ar'
      ? settings?.siteNameAr || settings?.siteName || 'البرق السريع'
      : settings?.siteName || settings?.siteNameAr || 'Albarq Al Saree'
  const contactTextDir = lang === 'ar' ? 'rtl' : 'ltr'

  async function handleSubscribe() {
    if (submitting) return

    const v = email.trim()
    if (!v || !v.includes('@')) {
      toast.error(t('footer.toast.invalidEmail'))
      return
    }

    setSubmitting(true)
    try {
      const result = await subscribeNewsletter({ email: v })
      if (!result.success) {
        toast.error((result.message || '').trim() || t('toast.failed'))
        return
      }
      setEmail('')
      toast.success((result.message || '').trim() || t('footer.toast.subscribed'))
    } catch (error) {
      const fallbackMessage = resolveApiErrorMessage(error, t('toast.failed'))
      const directMessage = error instanceof Error ? error.message.trim() : ''
      toast.error(directMessage || fallbackMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const socials = [
    { label: 'facebook', url: normalizeExternalUrl(settings?.facebookUrl), content: <FacebookIcon size={16} /> },
    { label: 'instagram', url: normalizeExternalUrl(settings?.instagramUrl), content: <InstagramIcon size={16} /> },
    { label: 'linkedin', url: normalizeExternalUrl(settings?.linkedinUrl), content: <LinkedInIcon size={16} /> },
    { label: 'youtube', url: normalizeExternalUrl(settings?.youtubeUrl), content: <YouTubeIcon size={16} /> },
    { label: 'tiktok', url: normalizeExternalUrl(settings?.tiktokUrl), content: <TikTokIcon size={16} /> },
    { label: 'snapchat', url: normalizeExternalUrl(settings?.snapchatUrl), content: <SnapchatIcon size={16} /> },
    { label: 'whatsapp', url: normalizeExternalUrl(settings?.whatsappUrl, 'whatsapp'), content: <WhatsAppIcon size={16} /> },
    {
      label: 'twitter',
      url: normalizeExternalUrl(settings?.xUrl || settings?.twitterUrl),
      content: <TwitterIcon size={16} />,
    },
  ]

  return (
    <footer className="mt-16 bg-navy text-white">
      <Container>
        <div className="grid grid-cols-1 gap-10 py-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo variant="dark" size="md" />

            <p className="mt-3 text-sm font-semibold leading-7 text-white/70">
              {footerDescription}
            </p>

            <div
              className={`mt-6 text-sm text-white/80 ${contactTextDir === 'rtl' ? 'text-right' : 'text-left'}`}
              dir={contactTextDir}
            >
              <div>{footerAddress}</div>
              <div className="mt-2 font-extrabold [unicode-bidi:plaintext]" dir="auto">
                {footerPhone}
              </div>
              <div className="mt-2 text-white/90 [unicode-bidi:plaintext]" dir="auto">
                {footerEmail}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 border-white/30 hover:bg-white/10"
                  href={s.url || '#'}
                  target={s.url ? '_blank' : undefined}
                  rel={s.url ? 'noreferrer' : undefined}
                  onClick={(e) => {
                    if (!s.url) {
                      e.preventDefault()
                      toast.info(t('footer.toast.linksSoon'))
                    }
                  }}
                >
                  {s.content}
                  <span className="sr-only">{t(`social.${s.label}`)}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-sm font-extrabold">{t('footer.myAccount')}</h2>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li>
                <Link to="/about" className="hover:text-white">
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white">
                  {t('footer.createAccount')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white">
                  {t('footer.contactUs')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-sm font-extrabold">{t('footer.importantLinks')}</h2>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li>
                <Link to="/faq" className="hover:text-white">
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white">
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h2 className="text-sm font-extrabold">{t('footer.newsletter')}</h2>
            <p className="mt-3 text-sm font-semibold text-white/70">{t('footer.subscribeText')}</p>
            <div className="mt-4 flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.emailPlaceholder')}
                className="h-12 rounded-2xl border-2 border-white/30 bg-white/5 px-4 text-start text-sm font-semibold text-white outline-none placeholder:text-white/50 focus:border-primary focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="button"
                className="h-12 rounded-2xl bg-primary font-extrabold text-white shadow-soft hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={handleSubscribe}
                disabled={submitting}
              >
                {t('footer.subscribe')}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-center text-xs text-white/60">
          © {new Date().getFullYear()} {brandName} - {t('footer.rights')}
        </div>
      </Container>
    </footer>
  )
}
