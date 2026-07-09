import { useEffect, useMemo, useState } from 'react'

import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { XIcon } from '@/components/icons'
import { useI18n } from '@/i18n/I18nProvider'
import { useAppSelector } from '@/store/hooks'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isIosDevice() {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isMobileDevice() {
  if (typeof navigator === 'undefined') return false
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent)
}

function isStandaloneMode() {
  if (typeof window === 'undefined') return false
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  return window.matchMedia('(display-mode: standalone)').matches || iosStandalone
}

export default function PwaInstallPrompt() {
  const { lang } = useI18n()
  const settings = useAppSelector((state) => state.settings.data)
  const [open, setOpen] = useState(false)
  const [ios, setIos] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installing, setInstalling] = useState(false)
  const brandName =
    lang === 'ar'
      ? settings?.siteNameAr || settings?.siteName || 'البرق السريع'
      : settings?.siteName || settings?.siteNameAr || 'Albarq Al Saree'
  const fallbackLogoSrc = `${import.meta.env.BASE_URL}images/albarq-main-logo-180.png`
  const promptLogoSrc = fallbackLogoSrc

  useEffect(() => {
    if (!isMobileDevice() || isStandaloneMode()) return

    const iosDevice = isIosDevice()
    setIos(iosDevice)

    function onBeforeInstallPrompt(event: Event) {
      const promptEvent = event as BeforeInstallPromptEvent
      promptEvent.preventDefault()
      setDeferredPrompt(promptEvent)
      setOpen(true)
    }

    function onAppInstalled() {
      setOpen(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)

    let timer: number | null = null
    if (iosDevice) {
      timer = window.setTimeout(() => {
        if (!isStandaloneMode()) setOpen(true)
      }, 900)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
      if (timer !== null) window.clearTimeout(timer)
    }
  }, [])

  const installLabel = lang === 'ar' ? 'تثبيت التطبيق' : 'Install app'
  const closeLabel = lang === 'ar' ? 'لاحقًا' : 'Later'

  const introText = useMemo(() => {
    if (lang === 'ar') {
      if (ios) return 'يمكنك تثبيت الموقع كتطبيق على شاشة iPhone الرئيسية.'
      return `ثبت ${brandName} كتطبيق على جهازك للوصول السريع وتجربة أفضل.`
    }

    if (ios) return 'You can install this website as an app on your iPhone home screen.'
    return `Install ${brandName} as an app for faster access and a better mobile experience.`
  }, [ios, lang, brandName])

  async function onInstall() {
    if (!deferredPrompt) return
    setInstalling(true)
    try {
      await deferredPrompt.prompt()
      const result = await deferredPrompt.userChoice
      if (result.outcome === 'accepted') setOpen(false)
    } finally {
      setInstalling(false)
      setDeferredPrompt(null)
    }
  }

  if (!open) return null

  return (
    <Modal open={open} onClose={() => setOpen(false)} className="max-w-md rounded-3xl">
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <img
              src={promptLogoSrc}
              alt={brandName}
              width={220}
              height={72}
              decoding="async"
              onError={(event) => {
                event.currentTarget.onerror = null
                event.currentTarget.src = fallbackLogoSrc
              }}
              className="h-12 w-auto max-w-[220px] object-contain"
            />
            <p className="text-xs font-extrabold text-primary">{lang === 'ar' ? 'تطبيق الموبايل' : 'Mobile App'}</p>
            <h3 className="mt-1 text-xl font-extrabold text-navy">
              {lang === 'ar' ? `ثبت ${brandName} على الموبايل` : `Install ${brandName} on your phone`}
            </h3>
          </div>
          <button
            type="button"
            data-modal-close
            aria-label={lang === 'ar' ? 'إغلاق' : 'Close'}
            onClick={() => setOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted transition hover:bg-screen hover:text-navy"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-sm font-semibold leading-7 text-muted">{introText}</p>

        {ios ? (
          <ol className="mt-4 space-y-2 text-sm font-semibold text-navy/90">
            <li>{lang === 'ar' ? '1. اضغط زر المشاركة في Safari.' : '1. Tap the Share button in Safari.'}</li>
            <li>
              {lang === 'ar'
                ? '2. اختر Add to Home Screen.'
                : '2. Choose Add to Home Screen.'}
            </li>
          </ol>
        ) : (
          <div className="mt-5 flex items-center gap-3">
            <Button className="flex-1" onClick={onInstall} disabled={!deferredPrompt || installing}>
              {installing ? (lang === 'ar' ? 'جاري التحضير...' : 'Preparing...') : installLabel}
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              {closeLabel}
            </Button>
          </div>
        )}

        {!ios && !deferredPrompt ? (
          <p className="mt-3 text-xs font-semibold text-muted">
            {lang === 'ar'
              ? 'إذا لم يظهر زر التثبيت، افتح الموقع من متصفح يدعم التثبيت مثل Chrome.'
              : 'If install is unavailable, open the website in a browser that supports app installation (e.g. Chrome).'}
          </p>
        ) : null}

        {ios ? (
          <div className="mt-5">
            <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
              {closeLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </Modal>
  )
}

