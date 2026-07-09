import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import * as api from '@/api'
import { toast } from '@/lib/toast'
import { useI18n } from '@/i18n/I18nProvider'
import { useAppDispatch } from '@/store/hooks'
import { fetchCart } from '@/store/slices/cartSlice'
import { setAuthSession } from '@/store/slices/authSlice'

const GOOGLE_AUTH_REDIRECT_DELAY_MS = 450

export default function GoogleAuthCallbackPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { t } = useI18n()

  useEffect(() => {
    let active = true
    let redirectTimer: number | null = null

    async function completeGoogleAuth() {
      try {
        const session = await api.resolveSocialAuthSessionFromUrl(window.location.href)
        if (!session) {
          throw new Error(t('toast.socialAuthFailed'))
        }

        // Persist first so auth hydration remains stable across hard refreshes.
        api.persistAuthSession(session)
        api.clearSocialAuthParamsFromCurrentUrl()

        if (!active) return

        dispatch(setAuthSession(session))
        try {
          await dispatch(fetchCart()).unwrap()
        } catch {
          // Login should still succeed even if cart sync fails.
        }

        toast.success(t('toast.loginSuccess'))
        redirectTimer = window.setTimeout(() => {
          if (!active) return
          navigate('/home', { replace: true })
        }, GOOGLE_AUTH_REDIRECT_DELAY_MS)
      } catch (error) {
        if (!active) return
        const message = api.resolveApiErrorMessage(error, t('toast.socialAuthFailed'))
        toast.error(message)
        navigate('/login', { replace: true })
      }
    }

    void completeGoogleAuth()

    return () => {
      active = false
      if (redirectTimer !== null) {
        window.clearTimeout(redirectTimer)
      }
    }
  }, [dispatch, navigate, t])

  return (
    <div className="min-h-screen flex items-center justify-center bg-screen px-4 text-center">
      <div className="rounded-2xl bg-white px-6 py-8 shadow-soft">
        <p className="text-sm font-semibold text-navy">{t('common.loading')}</p>
      </div>
    </div>
  )
}
