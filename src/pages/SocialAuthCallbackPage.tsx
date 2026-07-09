import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import * as api from '@/api'
import { toast } from '@/lib/toast'
import { useI18n } from '@/i18n/I18nProvider'
import { useAppDispatch } from '@/store/hooks'
import { fetchCart } from '@/store/slices/cartSlice'
import { setAuthSession } from '@/store/slices/authSlice'

type SocialAuthPopupMessage = {
  type: 'OAUTH_SUCCESS' | 'OAUTH_ERROR'
  session?: api.AuthSession
  token?: string
  provider?: string
  error?: string
  message?: string
}

function hasPopupOpenerSignal(): boolean {
  try {
    const url = new URL(window.location.href)
    const searchOrigin = url.searchParams.get('opener_origin')?.trim() || ''
    if (searchOrigin) return true

    const hashParams = new URLSearchParams(url.hash.startsWith('#') ? url.hash.slice(1) : url.hash)
    const hashOrigin = hashParams.get('opener_origin')?.trim() || ''
    return Boolean(hashOrigin)
  } catch {
    return false
  }
}

function resolvePopupTargetOrigin(): string {
  try {
    const url = new URL(window.location.href)
    const searchOrigin = url.searchParams.get('opener_origin')?.trim() || ''
    const hashParams = new URLSearchParams(url.hash.startsWith('#') ? url.hash.slice(1) : url.hash)
    const hashOrigin = hashParams.get('opener_origin')?.trim() || ''
    const candidate = searchOrigin || hashOrigin
    if (!candidate) return window.location.origin

    const parsed = new URL(candidate)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return window.location.origin
    }

    return parsed.origin
  } catch {
    return window.location.origin
  }
}

export default function SocialAuthCallbackPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { t } = useI18n()

  useEffect(() => {
    let active = true

    async function completeSocialAuth() {
      const isPopupFlow = hasPopupOpenerSignal()

      try {
        const session = await api.resolveSocialAuthSessionFromUrl(window.location.href)
        if (!session) {
          throw new Error(t('toast.socialAuthFailed'))
        }

        api.persistAuthSession(session)
        api.clearSocialAuthParamsFromCurrentUrl()

        if (isPopupFlow && window.opener && !window.opener.closed) {
          const provider = (() => {
            const params = new URLSearchParams(window.location.search)
            return params.get('provider')?.trim() || undefined
          })()
          const popupMessage: SocialAuthPopupMessage = {
            type: 'OAUTH_SUCCESS',
            session,
            token: session.token,
            provider,
          }
          window.opener.postMessage(popupMessage, resolvePopupTargetOrigin())
          window.close()
          return
        }

        if (!active) return

        dispatch(setAuthSession(session))
        try {
          await dispatch(fetchCart()).unwrap()
        } catch {
          // Social login should still succeed even if cart sync fails.
        }

        toast.success(t('toast.loginSuccess'))
        navigate('/home', { replace: true })
      } catch (error) {
        const message = api.resolveApiErrorMessage(error, t('toast.socialAuthFailed'))

        if (isPopupFlow && window.opener && !window.opener.closed) {
          const popupMessage: SocialAuthPopupMessage = {
            type: 'OAUTH_ERROR',
            error: message,
            message,
          }
          window.opener.postMessage(popupMessage, resolvePopupTargetOrigin())
          window.close()
          return
        }

        if (!active) return

        toast.error(message)
        navigate('/login', { replace: true })
      }
    }

    void completeSocialAuth()

    return () => {
      active = false
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
