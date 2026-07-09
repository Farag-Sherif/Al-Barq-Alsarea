import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import clsx from 'clsx'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MobileBottomBar from '@/components/layout/MobileBottomBar'
import PwaInstallPrompt from '@/components/layout/PwaInstallPrompt'
import { ArrowRightIcon } from '@/components/icons'
import { useI18n } from '@/i18n/I18nProvider'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { hydrateAuthFromStorage } from '@/store/thunks/authThunks'
import { fetchCart } from '@/store/slices/cartSlice'
import { fetchFavorites } from '@/store/slices/accountSlice'
import { fetchSettings } from '@/store/slices/settingsSlice'
import { applyPwaBranding } from '@/utils/pwaBranding'

const DARK_HEADER_ROUTES: string[] = []

export default function MainLayout() {
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { lang } = useI18n()
  const settings = useAppSelector((state) => state.settings.data)
  const authToken = useAppSelector((state) => state.auth.token)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    dispatch(fetchSettings())
  }, [dispatch, lang])

  useEffect(() => {
    function hydratePersistedState() {
      dispatch(hydrateAuthFromStorage())
    }

    const idleApi = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }

    if (typeof idleApi.requestIdleCallback === 'function') {
      const idleId = idleApi.requestIdleCallback(hydratePersistedState, { timeout: 1200 })
      return () => {
        if (typeof idleApi.cancelIdleCallback === 'function') {
          idleApi.cancelIdleCallback(idleId)
        }
      }
    }

    const timer = window.setTimeout(hydratePersistedState, 600)
    return () => window.clearTimeout(timer)
  }, [dispatch])

  useEffect(() => {
    if (!authToken) return
    dispatch(fetchCart())
    dispatch(fetchFavorites())
  }, [authToken, dispatch])

  useEffect(() => {
    const siteName =
      lang === 'ar'
        ? settings?.siteNameAr || settings?.siteName || ''
        : settings?.siteName || settings?.siteNameAr || ''
    const siteDescription =
      lang === 'ar'
        ? settings?.siteDescriptionAr || settings?.siteDescription || ''
        : settings?.siteDescription || settings?.siteDescriptionAr || ''

    if (siteName) {
      document.title = siteName
    }

    if (siteDescription) {
      let descriptionTag = document.querySelector('meta[name="description"]')
      if (!descriptionTag) {
        descriptionTag = document.createElement('meta')
        descriptionTag.setAttribute('name', 'description')
        document.head.appendChild(descriptionTag)
      }
      descriptionTag.setAttribute('content', siteDescription)
    }

    applyPwaBranding({
      siteName,
      siteDescription,
      lang,
    })
  }, [settings, lang])

  useEffect(() => {
    function onScroll() {
      setShowScrollTop(window.scrollY > 300)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const headerVariant = DARK_HEADER_ROUTES.some((p) => location.pathname.startsWith(p)) ? 'dark' : 'light'

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-screen pb-[calc(68px+env(safe-area-inset-bottom))] text-navy md:pb-0">
      <Header variant={headerVariant} />
      <main className="w-full max-w-[100vw] overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomBar />
      <PwaInstallPrompt />
      <button
        type="button"
        className={clsx(
          'fixed bottom-24 right-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-soft transition-all duration-200 hover:brightness-110 md:bottom-6 md:right-6',
          showScrollTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
        )}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="scroll to top"
      >
        <ArrowRightIcon className="-rotate-90" />
      </button>
    </div>
  )
}
