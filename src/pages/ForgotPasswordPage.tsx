import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'

import Logo from '@/components/layout/Logo'
import { ArrowLeftIcon, ArrowRightIcon, GlobeIcon, MailIcon } from '@/components/icons'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import * as api from '@/api'
import { toast } from '@/lib/toast'
import { useI18n } from '@/i18n/I18nProvider'
import { useAppSelector } from '@/store/hooks'

export default function ForgotPasswordPage() {
  const { t, lang, toggleLang } = useI18n()
  const settings = useAppSelector((state) => state.settings.data)
  const settingsLoaded = useAppSelector((state) => state.settings.loaded)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [resolvedHeroImage, setResolvedHeroImage] = useState('')

  const heroImageFromSettings = (settings?.weTrustImage || settings?.aboutImage || '').trim()
  const heroImage = heroImageFromSettings || (settingsLoaded ? '/images/kitchen-2.jpg' : '')

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email?.includes('@')) {
      toast.error(t('auth.toast.invalidEmail'))
      return
    }

    setLoading(true)
    try {
      await api.forgotPassword({ email })
      setSent(true)
      toast.success(t('auth.toast.resetLinkSent'))
    } catch (error) {
      toast.error(
        api.resolveApiErrorMessage(error, t('auth.toast.resetLinkFailed')),
      )
    } finally {
      setLoading(false)
    }
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
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-extrabold text-white">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              {lang === 'ar' ? <ArrowRightIcon className="text-white" /> : <ArrowLeftIcon className="text-white" />}
            </span>
            {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to login'}
          </Link>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center px-6 pb-24 pt-8 lg:h-[calc(100%-84px)] lg:pt-0">
          {/* Icon illustration */}
          <div className="relative">
            <div className="relative h-56 w-72 overflow-hidden rounded-3xl bg-white/15 shadow-2xl rotate-[-6deg] border-2 border-white/30">
              {resolvedHeroImage ? (
                <>
                  <img key={resolvedHeroImage} src={resolvedHeroImage} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-navy/40" />
                </>
              ) : (
                <div className="absolute inset-0 animate-pulse bg-white/20" />
              )}

              <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[1px]">
                <div className="text-center">
                  <div className="mx-auto inline-flex h-24 w-24 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm text-white mb-4 shadow-lg border border-white/30">
                    <MailIcon className="h-12 w-12 drop-shadow-lg" />
                  </div>
                  <p className="text-sm font-bold text-white drop-shadow-md">{lang === 'ar' ? 'إعادة تعيين' : 'Reset'}</p>
                </div>
              </div>
            </div>

            {/* small badge */}
            <div className="absolute -bottom-6 right-6 flex items-center justify-center rounded-2xl bg-white p-4 text-navy shadow-2xl border border-white/20 backdrop-blur-sm">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-orange-100 text-primary font-extrabold shadow-lg">
                🔒
              </span>
            </div>
          </div>

          <h2 className="mt-10 text-2xl md:text-3xl font-extrabold text-center drop-shadow-lg">
            {lang === 'ar' ? (
              <>
                <span className="text-white">نسيت كلمة المرور؟</span>{' '}
                <span className="text-white drop-shadow-md bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg">لا تقلق</span>
              </>
            ) : (
              <>
                <span className="text-white">Forgot Password?</span>{' '}
                <span className="text-white drop-shadow-md bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg">Don't Worry</span>
              </>
            )}
          </h2>
          <p className="mt-4 max-w-md text-center text-sm md:text-base font-semibold text-white leading-7 drop-shadow-md">
            {lang === 'ar' 
              ? 'سنرسل لك رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني المسجل لدينا.'
              : 'We will send you a password reset link to your registered email address.'}
          </p>

          <div className="mt-10 grid w-full max-w-md grid-cols-3 gap-4 md:gap-6 text-center">
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/20 shadow-lg">
              <div className="text-2xl md:text-3xl font-extrabold drop-shadow-lg">✓</div>
              <div className="mt-2 text-xs md:text-sm font-semibold text-white">{lang === 'ar' ? 'آمن' : 'Secure'}</div>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/20 shadow-lg">
              <div className="text-2xl md:text-3xl font-extrabold drop-shadow-lg">⚡</div>
              <div className="mt-2 text-xs md:text-sm font-semibold text-white">{lang === 'ar' ? 'سريع' : 'Fast'}</div>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/20 shadow-lg">
              <div className="text-2xl md:text-3xl font-extrabold drop-shadow-lg">🔐</div>
              <div className="mt-2 text-xs md:text-sm font-semibold text-white">{lang === 'ar' ? 'محمي' : 'Protected'}</div>
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
          {!sent ? (
            <>
              <h1 className="text-3xl font-extrabold text-navy">
                {lang === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
              </h1>
              <p className="mt-2 text-sm text-muted">
                {lang === 'ar' 
                  ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين'
                  : 'Enter your email and we will send you a reset link'}
              </p>

              <form onSubmit={onSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="text-sm font-bold text-navy">
                    {lang === 'ar' ? 'البريد الالكتروني' : 'Email Address'}
                  </label>
                  <div className="mt-2">
                    <Input
                      icon={<MailIcon />}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={lang === 'ar' ? 'example@email.com' : 'example@email.com'}
                      type="email"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading 
                    ? (lang === 'ar' ? 'جاري الإرسال...' : 'Sending...')
                    : (lang === 'ar' ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link')
                  }
                </Button>

                <p className="text-center text-sm text-muted">
                  {lang === 'ar' ? 'تذكرت كلمة المرور؟' : 'Remember your password?'}{' '}
                  <Link to="/login" className="font-extrabold text-primary">
                    {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
                  </Link>
                </p>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-success/15 text-success mb-6">
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 className="text-3xl font-extrabold text-navy">
                {lang === 'ar' ? 'تم الإرسال بنجاح!' : 'Email Sent!'}
              </h1>
              <p className="mt-4 text-base text-muted leading-7">
                {lang === 'ar' 
                  ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد واتباع التعليمات.'
                  : 'Password reset link has been sent to your email. Please check your inbox and follow the instructions.'}
              </p>

              <div className="mt-8 space-y-4">
                <Button 
                  onClick={() => {
                    setSent(false)
                    setEmail('')
                  }}
                  className="w-full"
                >
                  {lang === 'ar' ? 'إرسال مرة أخرى' : 'Send Again'}
                </Button>

                <p className="text-center text-sm text-muted">
                  {lang === 'ar' ? 'تذكرت كلمة المرور؟' : 'Remember your password?'}{' '}
                  <Link to="/login" className="font-extrabold text-primary">
                    {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


