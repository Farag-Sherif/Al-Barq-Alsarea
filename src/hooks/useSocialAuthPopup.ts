import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import * as api from '@/api'

type SocialOauthMessage = {
  type?: unknown
  token?: unknown
  code?: unknown
  state?: unknown
  provider?: unknown
  error?: unknown
  message?: unknown
  session?: unknown
}

type UseSocialAuthPopupOptions = {
  socialLoginFailedMessage: string
  onSessionResolved: (session: api.AuthSession) => Promise<void> | void
  onErrorMessage: (message: string) => void
}

function isSocialAuthSession(value: unknown): value is api.AuthSession {
  if (!value || typeof value !== 'object') return false

  const record = value as { token?: unknown; user?: unknown }
  if (typeof record.token !== 'string' || !record.token.trim()) return false
  if (!record.user || typeof record.user !== 'object') return false

  return true
}

function parsePossibleJsonPayload(text: string): unknown {
  const trimmed = text.trim()
  if (!trimmed) return null

  try {
    return JSON.parse(trimmed)
  } catch {
    const start = trimmed.indexOf('{')
    const end = trimmed.lastIndexOf('}')
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1))
      } catch {
        return null
      }
    }
    return null
  }
}

function getApiOriginFromEnv(): string {
  const baseUrl = String(import.meta.env.VITE_API_BASE_URL ?? '').trim()
  if (!baseUrl) return ''
  try {
    return new URL(baseUrl).origin
  } catch {
    return ''
  }
}

function normalizeSocialProvider(value: unknown): api.SocialProvider | null {
  const provider = typeof value === 'string' ? value.trim().toLowerCase() : ''
  if (provider === 'google' || provider === 'facebook') return provider
  return null
}

function pickStringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeIncomingOAuthMessageData(value: unknown): SocialOauthMessage | null {
  if (!value) return null
  if (typeof value === 'object') return value as SocialOauthMessage
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed) return null

  try {
    const parsed = JSON.parse(trimmed)
    if (parsed && typeof parsed === 'object') {
      return parsed as SocialOauthMessage
    }
  } catch {
    // ignore invalid json
  }

  return null
}

export function useSocialAuthPopup({
  socialLoginFailedMessage,
  onSessionResolved,
  onErrorMessage,
}: UseSocialAuthPopupOptions) {
  const location = useLocation()
  const [socialLoading, setSocialLoading] = useState(false)
  const socialPopupIntervalRef = useRef<number | null>(null)
  const activeSocialProviderRef = useRef<api.SocialProvider | null>(null)
  const acceptedMessageOriginsRef = useRef<Set<string>>(new Set())
  const socialMessageProcessingRef = useRef(false)

  const clearSocialPopupInterval = useCallback(() => {
    if (socialPopupIntervalRef.current === null) return
    window.clearInterval(socialPopupIntervalRef.current)
    socialPopupIntervalRef.current = null
  }, [])

  const registerAcceptedMessageOrigin = useCallback((originOrUrl: string) => {
    const trimmed = originOrUrl.trim()
    if (!trimmed) return

    try {
      const parsed = new URL(trimmed, window.location.origin)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return
      acceptedMessageOriginsRef.current.add(parsed.origin)
    } catch {
      // Ignore malformed origin/url values.
    }
  }, [])

  const isAcceptedMessageOrigin = useCallback((origin: string) => {
    const normalizedOrigin = origin.trim()
    if (!normalizedOrigin) return false
    if (normalizedOrigin === window.location.origin) return true
    if (acceptedMessageOriginsRef.current.has(normalizedOrigin)) return true

    const apiOrigin = getApiOriginFromEnv()
    if (apiOrigin && normalizedOrigin === apiOrigin) return true

    return false
  }, [])

  const completeSocialSession = useCallback(async (session: api.AuthSession) => {
    api.clearSocialAuthParamsFromCurrentUrl()
    await onSessionResolved(session)
  }, [onSessionResolved])

  const resolveSessionFromOAuthMessage = useCallback(async (payload: SocialOauthMessage) => {
    if (isSocialAuthSession(payload.session)) {
      return payload.session
    }

    const sessionFromPayload = await api.resolveAuthSessionFromCallbackPayload(payload)
    if (sessionFromPayload) return sessionFromPayload

    const code = pickStringValue(payload.code)
    if (!code) return null

    const provider =
      normalizeSocialProvider(payload.provider) ??
      activeSocialProviderRef.current ??
      'google'

    const callbackUrl = new URL('/social-auth/callback', window.location.origin)
    callbackUrl.searchParams.set('provider', provider)
    callbackUrl.searchParams.set('code', code)

    const state = pickStringValue(payload.state)
    if (state) callbackUrl.searchParams.set('state', state)

    return api.resolveSocialAuthSessionFromUrl(callbackUrl.toString())
  }, [])

  useEffect(() => {
    let active = true

    async function completeSocialFromCurrentUrl() {
      try {
        const session = await api.resolveSocialAuthSessionFromUrl(window.location.href)
        if (!session || !active) return
        await completeSocialSession(session)
      } catch (error) {
        if (!active) return
        const message = api.resolveApiErrorMessage(error, socialLoginFailedMessage)
        onErrorMessage(message)
      } finally {
        if (active) {
          setSocialLoading(false)
        }
      }
    }

    void completeSocialFromCurrentUrl()

    return () => {
      active = false
    }
  }, [
    completeSocialSession,
    location.hash,
    location.pathname,
    location.search,
    onErrorMessage,
    socialLoginFailedMessage,
  ])

  useEffect(() => {
    function onSocialAuthMessage(event: MessageEvent<unknown>) {
      if (!isAcceptedMessageOrigin(event.origin)) return

      const payload = normalizeIncomingOAuthMessageData(event.data)
      if (!payload) return
      const payloadType = pickStringValue(payload.type).toLowerCase()
      const carriesSessionSignal = Boolean(
        payloadType ||
        isSocialAuthSession(payload.session) ||
        pickStringValue(payload.token) ||
        pickStringValue(payload.code),
      )
      if (!carriesSessionSignal) return

      const isKnownSocialMessageType =
        payloadType === 'social-auth-complete' ||
        payloadType === 'oauth_success' ||
        payloadType === 'oauth_successful' ||
        payloadType === 'oauth-success' ||
        payloadType === 'oauthsuccess' ||
        payloadType === 'oauth_success_google' ||
        payloadType === 'oauth_complete' ||
        payloadType === 'oauth-error' ||
        payloadType === 'oauth_error'

      if (!isKnownSocialMessageType && !pickStringValue(payload.token) && !pickStringValue(payload.code)) {
        return
      }

      if (socialMessageProcessingRef.current) return
      socialMessageProcessingRef.current = true
      clearSocialPopupInterval()
      setSocialLoading(false)

      void (async () => {
        try {
          const session = await resolveSessionFromOAuthMessage(payload)
          if (session) {
            await completeSocialSession(session)
            return
          }

          const message =
            pickStringValue(payload.error) ||
            pickStringValue(payload.message) ||
            socialLoginFailedMessage

          onErrorMessage(api.localizeApiErrorMessage(message))
        } catch (error) {
          const message = api.resolveApiErrorMessage(error, socialLoginFailedMessage)
          onErrorMessage(message)
        } finally {
          socialMessageProcessingRef.current = false
        }
      })()
    }

    window.addEventListener('message', onSocialAuthMessage)
    return () => window.removeEventListener('message', onSocialAuthMessage)
  }, [
    clearSocialPopupInterval,
    completeSocialSession,
    isAcceptedMessageOrigin,
    onErrorMessage,
    resolveSessionFromOAuthMessage,
    socialLoginFailedMessage,
  ])

  const cancelSocialFlow = useCallback(() => {
    clearSocialPopupInterval()
    setSocialLoading(false)
    socialMessageProcessingRef.current = false
    activeSocialProviderRef.current = null
  }, [clearSocialPopupInterval])

  const startSocialLogin = useCallback(async (provider: api.SocialProvider) => {
    const shouldUseRedirectFlow = provider === 'google'
    const popupWidth = 540
    const popupHeight = 700
    const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - popupHeight) / 2))
    const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - popupWidth) / 2))
    const features = [
      `width=${popupWidth}`,
      `height=${popupHeight}`,
      `top=${top}`,
      `left=${left}`,
      'resizable=yes',
      'scrollbars=yes',
    ]
    let popup: Window | null = null
    let socialSessionCompleted = false
    let processingPopupPayload = false
    let processingFallbackProbe = false
    let lastFallbackProbeAt = 0

    try {
      activeSocialProviderRef.current = provider
      setSocialLoading(true)
      clearSocialPopupInterval()
      registerAcceptedMessageOrigin(window.location.origin)
      registerAcceptedMessageOrigin(getApiOriginFromEnv())

      const socialCallbackPath = shouldUseRedirectFlow ? '/google-auth/callback' : '/social-auth/callback'
      const socialCallbackUrl = new URL(socialCallbackPath, window.location.origin)
      socialCallbackUrl.searchParams.set('provider', provider)
      if (!shouldUseRedirectFlow) {
        socialCallbackUrl.searchParams.set('opener_origin', window.location.origin)
      }
      const socialCallbackUrlValue = socialCallbackUrl.toString()
      const redirectUrl = await api.getSocialLoginNavigationUrl(provider, { callbackUrl: socialCallbackUrlValue })
      registerAcceptedMessageOrigin(redirectUrl)

      if (shouldUseRedirectFlow) {
        window.location.assign(redirectUrl)
        return
      }

      popup = window.open('about:blank', `social-login-${provider}`, features.join(','))
      if (!popup) {
        if (api.isSocialRedirectEndpointUrl(redirectUrl, provider)) {
          throw new Error(
            api.localizeApiErrorMessage('Unable to continue social login automatically. Please allow popups and try again.'),
          )
        }
        window.location.assign(redirectUrl)
        return
      }

      if (popup.closed) {
        setSocialLoading(false)
        return
      }

      const popupWindow = popup
      const callbackProbeUrl = (() => {
        const callbackUrl = new URL(socialCallbackUrlValue)

        try {
          const redirectTarget = new URL(redirectUrl, window.location.origin)
          const fromSearch = new URLSearchParams(redirectTarget.search)
          const hash = redirectTarget.hash.startsWith('#') ? redirectTarget.hash.slice(1) : redirectTarget.hash
          const fromHash = hash ? new URLSearchParams(hash) : new URLSearchParams()

          const copyParam = (key: string) => {
            const value = fromSearch.get(key) || fromHash.get(key)
            if (value && value.trim()) callbackUrl.searchParams.set(key, value.trim())
          }

          copyParam('state')
          copyParam('code')
        } catch {
          // Keep provider-only probe URL when redirect URL is not parseable.
        }

        return callbackUrl.toString()
      })()

      popupWindow.location.assign(redirectUrl)
      popupWindow.focus()

      const tryResolveSocialSessionFromCallback = async (force = false): Promise<boolean> => {
        if (socialSessionCompleted || processingPopupPayload || processingFallbackProbe) return false

        const now = Date.now()
        if (!force && now - lastFallbackProbeAt < 2500) return false

        processingFallbackProbe = true
        lastFallbackProbeAt = now
        try {
          const session = await api.resolveSocialAuthSessionFromUrl(callbackProbeUrl)
          if (!session) return false

          socialSessionCompleted = true
          clearSocialPopupInterval()
          if (!popupWindow.closed) popupWindow.close()
          await completeSocialSession(session)
          return true
        } catch {
          return false
        } finally {
          processingFallbackProbe = false
        }
      }

      socialPopupIntervalRef.current = window.setInterval(() => {
        if (socialSessionCompleted) {
          clearSocialPopupInterval()
          setSocialLoading(false)
          return
        }

        if (popupWindow.closed) {
          clearSocialPopupInterval()
          void (async () => {
            const resolved = await tryResolveSocialSessionFromCallback(true)
            setSocialLoading(false)
            if (!resolved) {
              onErrorMessage(api.localizeApiErrorMessage('Social authentication failed.'))
            }
          })()
          return
        }

        if (processingPopupPayload) return

        let popupHref = ''
        try {
          popupHref = popupWindow.location.href
        } catch {
          // Cross-origin popup URL is not readable yet.
          void tryResolveSocialSessionFromCallback()
          return
        }

        if (!popupHref || popupHref === 'about:blank') return
        if (!popupHref.startsWith(window.location.origin)) {
          void tryResolveSocialSessionFromCallback()
          return
        }

        let popupPath = ''
        try {
          popupPath = new URL(popupHref).pathname.toLowerCase()
        } catch {
          popupPath = ''
        }

        const isCallbackPayloadPage =
          popupPath.startsWith('/social/callback') ||
          popupPath.startsWith('/auth/social/callback') ||
          popupPath.startsWith(`/auth/social/${provider}/callback`) ||
          popupPath.startsWith(`/auth/${provider}/callback`) ||
          popupPath.startsWith(`/social/${provider}/callback`)

        if (!isCallbackPayloadPage) {
          void tryResolveSocialSessionFromCallback()
          return
        }

        processingPopupPayload = true
        void (async () => {
          try {
            const popupBodyText =
              popupWindow.document.body?.textContent ||
              popupWindow.document.documentElement?.textContent ||
              ''
            const payload = parsePossibleJsonPayload(popupBodyText)

            if (payload) {
              const sessionFromPayload = await api.resolveAuthSessionFromCallbackPayload(payload)
              if (sessionFromPayload) {
                socialSessionCompleted = true
                clearSocialPopupInterval()
                if (!popupWindow.closed) popupWindow.close()
                await completeSocialSession(sessionFromPayload)
                return
              }
            }

            const sessionFromPopupUrl = await api.resolveSocialAuthSessionFromUrl(popupHref)
            if (sessionFromPopupUrl) {
              socialSessionCompleted = true
              clearSocialPopupInterval()
              if (!popupWindow.closed) popupWindow.close()
              await completeSocialSession(sessionFromPopupUrl)
              return
            }

            await tryResolveSocialSessionFromCallback()
          } catch {
            // Keep fallback probing active.
          } finally {
            processingPopupPayload = false
          }
        })()
      }, 500)
    } catch (error) {
      if (popup && !popup.closed) {
        popup.close()
      }
      setSocialLoading(false)
      const message = api.resolveApiErrorMessage(error, socialLoginFailedMessage)
      onErrorMessage(message)
    }
  }, [
    clearSocialPopupInterval,
    completeSocialSession,
    onErrorMessage,
    registerAcceptedMessageOrigin,
    socialLoginFailedMessage,
  ])

  return {
    socialLoading,
    startSocialLogin,
    cancelSocialFlow,
  }
}
