import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

import { useI18n } from '@/i18n/I18nProvider'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchSettings } from '@/store/slices/settingsSlice'
import { hydrateAuthFromStorage } from '@/store/thunks/authThunks'
import { applyPwaBranding } from '@/utils/pwaBranding'

export default function AuthLayout() {
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { lang } = useI18n()
  const settings = useAppSelector((state) => state.settings.data)

  useEffect(() => {
    dispatch(hydrateAuthFromStorage())
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchSettings())
  }, [dispatch, lang])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

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

  return (
    <div className="min-h-screen bg-screen text-navy">
      <Outlet />
    </div>
  )
}
