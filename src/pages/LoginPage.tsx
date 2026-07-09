import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Logo from '@/components/layout/Logo'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  GlobeIcon,
  GoogleBrandIcon,
  LockIcon,
  MailIcon,
} from '@/components/icons'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import * as api from '@/api'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearError, setAuthSession } from '@/store/slices/authSlice'
import { fetchCart } from '@/store/slices/cartSlice'
import { loginThunk } from '@/store/thunks/authThunks'
import { toast } from '@/lib/toast'
import { useI18n } from '@/i18n/I18nProvider'
import { useSocialAuthPopup } from '@/hooks/useSocialAuthPopup'

const REMEMBERED_LOGIN_EMAIL_KEY = 'albarq_login_remembered_email'

function readRememberedLoginEmail(): string {
  if (typeof window === 'undefined') return ''
  try {
    return window.localStorage.getItem(REMEMBERED_LOGIN_EMAIL_KEY)?.trim() ?? ''
  } catch {
    return ''
  }
}

function writeRememberedLoginEmail(value: string) {
  if (typeof window === 'undefined') return
  try {
    const next = value.trim()
    if (!next) {
      window.localStorage.removeItem(REMEMBERED_LOGIN_EMAIL_KEY)
      return
    }
    window.localStorage.setItem(REMEMBERED_LOGIN_EMAIL_KEY, next)
  } catch {
    // ignore storage failures
  }
}

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { t, lang, toggleLang } = useI18n()

  const { loading, error, user } = useAppSelector((s) => s.auth)
  const settings = useAppSelector((s) => s.settings.data)
  const settingsLoaded = useAppSelector((s) => s.settings.loaded)
  const localizedError = error ? api.localizeApiErrorMessage(error) : null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [resolvedHeroImage, setResolvedHeroImage] = useState('')
  const rememberHydratedRef = useRef(false)
  const displayError = pageError || localizedError

  const copy =
    lang === 'ar'
      ? {
          welcome: 'مرحباً بعودتك!',
          subtitle: 'ادخل بياناتك لتسجيل الدخول',
          emailLabel: 'البريد الالكتروني',
          passwordLabel: 'كلمة المرور',
          forgotPassword: 'نسيت كلمة المرور',
          rememberMe: 'تذكرني',
          signingIn: 'جاري تسجيل الدخول...',
          socialDivider: 'او سجل الدخول عبر',
          noAccount: 'ليس لديك حساب؟',
          createFreeAccount: 'سجل الان مجاناً',
          heroStatus: 'حالة الطلب',
          heroDelivering: 'جاري التوصيل...',
          heroTitlePrefix: 'نحن الأفضل في',
          heroTitleHighlight: 'توصيل الطعام',
          heroDescription: 'اطلب وجبتك المفضلة من أفضل المطاعم وتابع طلبك لحظة بلحظة حتى باب منزلك.',
          statRating: 'تقييم',
          statFastDelivery: 'توصيل سريع',
          statRestaurants: 'مطعم',
          socialGoogle: 'جوجل',
          socialLoginFailed: 'تعذر بدء تسجيل الدخول الاجتماعي',
        }
      : {
          welcome: 'Welcome back!',
          subtitle: 'Sign in to continue',
          emailLabel: 'Email address',
          passwordLabel: 'Password',
          forgotPassword: 'Forgot password?',
          rememberMe: 'Remember me',
          signingIn: 'Signing in...',
          socialDivider: 'or continue with',
          noAccount: "Don't have an account?",
          createFreeAccount: 'Create one for free',
          heroStatus: 'Order status',
          heroDelivering: 'Out for delivery...',
          heroTitlePrefix: 'We are the best in',
          heroTitleHighlight: 'food delivery',
          heroDescription: 'Order your favorite meals from top restaurants and track every step to your door.',
          statRating: 'Rating',
          statFastDelivery: 'Fast delivery',
          statRestaurants: 'Restaurants',
          socialGoogle: 'Google',
          socialLoginFailed: 'Unable to start social login',
        }

  function pickLocalized(enValue: string | undefined, arValue: string | undefined): string {
    const en = (enValue ?? '').trim()
    const ar = (arValue ?? '').trim()
    if (lang === 'ar') return ar || en
    return en || ar
  }

  const heroTitle = pickLocalized(
    settings?.weTrustTitle || settings?.aboutTitle,
    settings?.weTrustTitleAr || settings?.aboutTitleAr,
  )
  const heroDescriptionFromSettings = pickLocalized(
    settings?.weTrustContent || settings?.aboutContent,
    settings?.weTrustContentAr || settings?.aboutContentAr,
  )
  const heroImageFromSettings = (settings?.weTrustImage || settings?.aboutImage || '').trim()
  const heroImage = heroImageFromSettings || (settingsLoaded ? '/images/kitchen-2.jpg' : '')
  const statRestaurantsValue = pickLocalized(settings?.statPartners, settings?.statPartnersAr) || '4.9'
  const statOrdersValue = pickLocalized(settings?.statDailyOrders, settings?.statDailyOrdersAr) || '30m'
  const statPartnersValue = pickLocalized(settings?.statPartnersCount, settings?.statPartnersCountAr) || '5k+'

  const socialLoginFailedMessage = copy.socialLoginFailed

  const completeSocialSession = useCallback(async (session: api.AuthSession) => {
    api.persistAuthSession(session)
    dispatch(setAuthSession(session))
    try {
      await dispatch(fetchCart()).unwrap()
    } catch {
      // social login should still succeed even if cart sync fails
    }
    toast.success(t('toast.loginSuccess'))
    navigate('/home', { replace: true })
  }, [dispatch, navigate, t])

  const { socialLoading, startSocialLogin, cancelSocialFlow } = useSocialAuthPopup({
    socialLoginFailedMessage,
    onSessionResolved: completeSocialSession,
    onErrorMessage: setPageError,
  })

  useEffect(() => {
    if (rememberHydratedRef.current) return
    rememberHydratedRef.current = true

    const rememberedEmail = readRememberedLoginEmail()
    if (!rememberedEmail) return
    setEmail(rememberedEmail)
    setRemember(true)
  }, [])

  useEffect(() => {
    if (remember) return
    writeRememberedLoginEmail('')
  }, [remember])

  useEffect(() => {
    if (!user) return
    cancelSocialFlow()
    setPageError(null)
    navigate('/home')
  }, [cancelSocialFlow, user, navigate])

  useEffect(() => {
    if (!heroImage) {
      setResolvedHeroImage('')
      return
    }

    let active = true
    const preloadImage = new window.Image()
    preloadImage.src = heroImage
    preloadImage.onload = () => {
      if (active) setResolvedHeroImage(heroImage)
    }
    preloadImage.onerror = () => {
      if (!active) return
      if (heroImage !== '/images/kitchen-2.jpg') {
        setResolvedHeroImage('/images/kitchen-2.jpg')
        return
      }
      setResolvedHeroImage('')
    }

    return () => {
      active = false
    }
  }, [heroImage])

  useEffect(() => {
    return () => {
      cancelSocialFlow()
      dispatch(clearError())
    }
  }, [cancelSocialFlow, dispatch])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    dispatch(clearError())
    setPageError(null)

    try {
      await dispatch(loginThunk({ email, password })).unwrap()
      if (remember) {
        writeRememberedLoginEmail(email)
      } else {
        writeRememberedLoginEmail('')
      }
      try {
        await dispatch(fetchCart()).unwrap()
      } catch {
        // login should still succeed even if cart sync fails
      }
      toast.success(t('toast.loginSuccess'))
      navigate('/home')
    } catch {
      // backend validation/auth errors are rendered inline in the form
    }
  }

  async function onSocialLogin(provider: 'google') {
    setPageError(null)
    await startSocialLogin(provider)
  }

  return (
    <div className="min-h-[100dvh] grid grid-cols-1 lg:min-h-screen lg:grid-cols-2">
      {/* Left (orange) */}
      <div className="relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white" />
          <div className="absolute top-24 left-24 h-56 w-56 rounded-full bg-white" />
        </div>

        {/* back */}
        <div className="relative z-10 p-6">
          <Link to="/home" className="inline-flex items-center gap-2 text-sm font-extrabold text-white">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              {lang === 'ar' ? <ArrowRightIcon className="text-white" /> : <ArrowLeftIcon className="text-white" />}
            </span>
            {t('common.backHome')}
          </Link>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center px-6 pb-24 pt-8 lg:h-[calc(100%-84px)] lg:pt-0">
          {/* tilted photo */}
          <div className="relative">
            <div className="h-56 w-72 overflow-hidden rounded-3xl bg-white shadow-soft rotate-[-6deg]">
              {resolvedHeroImage ? (
                <img key={resolvedHeroImage} src={resolvedHeroImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full animate-pulse bg-white/60" />
              )}
            </div>

            {/* small delivery badge */}
            <div className="absolute -bottom-6 right-6 flex items-center gap-3 rounded-2xl bg-white p-3 text-navy shadow-soft">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-success/15 text-success font-extrabold">
                ✓
              </span>
              <div className="text-right">
                <p className="text-xs text-muted">{copy.heroStatus}</p>
                <p className="text-sm font-extrabold">{copy.heroDelivering}</p>
              </div>
            </div>
          </div>

          <h2 className="mt-10 text-2xl md:text-3xl font-extrabold">
            {heroTitle ? heroTitle : <>{copy.heroTitlePrefix} <span className="text-navy">{copy.heroTitleHighlight}</span></>}
          </h2>
          <p className="mt-3 max-w-md text-center text-sm text-white/85 leading-7">
            {heroDescriptionFromSettings || copy.heroDescription}
          </p>

          <div className="mt-8 grid w-full max-w-md grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-lg font-extrabold">{statRestaurantsValue}</div>
              <div className="mt-1 text-xs text-white/80">{t('about.stats.restaurants')}</div>
            </div>
            <div>
              <div className="text-lg font-extrabold">{statOrdersValue}</div>
              <div className="mt-1 text-xs text-white/80">{t('about.stats.orders')}</div>
            </div>
            <div>
              <div className="text-lg font-extrabold">{statPartnersValue}</div>
              <div className="mt-1 text-xs text-white/80">{t('about.stats.partners')}</div>
            </div>
          </div>
        </div>

        {/* Navy wave */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 260"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            fill="#03081F"
            d="M0,160 C240,260 480,260 720,200 C960,140 1200,40 1440,120 L1440,260 L0,260 Z"
          />
        </svg>
      </div>

      {/* Right (form) */}
      <div className="bg-white px-6 py-10 md:px-12">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-navy transition hover:bg-screen"
            onClick={toggleLang}
          >
            <GlobeIcon className="text-navy" />
            {lang === 'ar' ? t('lang.ar') : t('lang.en')}
          </button>
          <Logo />
        </div>

        <div className="mx-auto mt-12 w-full max-w-md">
          <h1 className="text-3xl font-extrabold text-navy">{copy.welcome}</h1>
          <p className="mt-2 text-sm text-muted">{copy.subtitle}</p>

          <form onSubmit={onSubmit} autoComplete="on" className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-bold text-navy">{copy.emailLabel}</label>
              <div className="mt-2">
                <Input
                  icon={<MailIcon />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  type="email"
                  autoComplete="username"
                  name="email"
                  inputMode="email"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-navy">{copy.passwordLabel}</label>
              <div className="mt-2">
                <Input
                  icon={<LockIcon />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  autoComplete="current-password"
                  name="password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link to="/forgot-password" className="text-sm font-extrabold text-primary">
                {copy.forgotPassword}
              </Link>
              <label className="flex items-center gap-2 text-sm font-bold text-navy/80">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                {copy.rememberMe}
              </label>
            </div>

            {displayError ? <div className="rounded-2xl bg-danger/10 px-4 py-3 text-sm font-bold text-danger">{displayError}</div> : null}

            <Button type="submit" className="w-full" disabled={loading || socialLoading}>
              {loading ? copy.signingIn : t('nav.login')}
            </Button>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-sm text-muted">{copy.socialDivider}</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-2xl font-bold"
                disabled={socialLoading}
                onClick={() => onSocialLogin('google')}
              >
                <GoogleBrandIcon size={18} />
                {copy.socialGoogle}
              </Button>
            </div>

            <p className="text-center text-sm text-muted">
              {copy.noAccount}{' '}
              <Link to="/register" className="font-extrabold text-primary">
                {copy.createFreeAccount}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
