import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import clsx from 'clsx'

import Container from '@/components/layout/Container'
import { GoogleBrandIcon, LockIcon, MailIcon, PhoneIcon, UserIcon } from '@/components/icons'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import Input from '@/components/ui/Input'
import * as api from '@/api'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearError, setAuthSession } from '@/store/slices/authSlice'
import { fetchCart } from '@/store/slices/cartSlice'
import { registerThunk } from '@/store/thunks/authThunks'
import { toast } from '@/lib/toast'
import { useI18n } from '@/i18n/I18nProvider'
import { useSocialAuthPopup } from '@/hooks/useSocialAuthPopup'

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

export default function RegisterPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error, user } = useAppSelector((s) => s.auth)
  const { t, lang, dir } = useI18n()
  const localizedError = error ? api.localizeApiErrorMessage(error) : null

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agree, setAgree] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)
  const displayError = pageError || localizedError

  const copy =
    lang === 'ar'
      ? {
          title: 'إنشاء حساب',
          subtitle: 'قم بملء البيانات لإنشاء حساب جديد',
          fullNameLabel: 'الاسم بالكامل',
          fullNamePlaceholder: 'اسمك',
          emailLabel: 'البريد الإلكتروني',
          phoneLabel: 'رقم الهاتف',
          passwordLabel: 'كلمة المرور',
          confirmPasswordLabel: 'تأكيد كلمة المرور',
          termsPrefix: 'أوافق على',
          termsAndConditions: 'الشروط والأحكام',
          andWord: 'و',
          privacyPolicy: 'سياسة الخصوصية',
          creatingAccount: 'جاري إنشاء الحساب...',
          createAccount: 'إنشاء الحساب',
          hasAccount: 'لديك حساب بالفعل؟',
          login: 'تسجيل الدخول',
          socialDivider: 'أو سجل عبر',
          google: 'جوجل',
          acceptTermsError: 'يرجى الموافقة على الشروط',
          socialLoginFailed: 'تعذر بدء تسجيل الدخول الاجتماعي',
          invalidPhoneError: 'يرجى إدخال رقم جوال سعودي صحيح مثل 05XXXXXXXX',
        }
      : {
          title: 'Create account',
          subtitle: 'Fill in your details to create a new account',
          fullNameLabel: 'Full name',
          fullNamePlaceholder: 'Your name',
          emailLabel: 'Email address',
          phoneLabel: 'Phone number',
          passwordLabel: 'Password',
          confirmPasswordLabel: 'Confirm password',
          termsPrefix: 'I agree to the',
          termsAndConditions: 'Terms and Conditions',
          andWord: 'and',
          privacyPolicy: 'Privacy Policy',
          creatingAccount: 'Creating account...',
          createAccount: 'Create account',
          hasAccount: 'Already have an account?',
          login: 'Sign in',
          socialDivider: 'or register with',
          google: 'Google',
          acceptTermsError: 'Please accept the terms',
          socialLoginFailed: 'Unable to start social login',
          invalidPhoneError: 'Please enter a valid Saudi mobile number like 05XXXXXXXX',
        }

  const socialLoginFailedMessage = copy.socialLoginFailed

  const completeSocialSession = useCallback(async (session: api.AuthSession) => {
    api.persistAuthSession(session)
    dispatch(setAuthSession(session))
    try {
      await dispatch(fetchCart()).unwrap()
    } catch {
      // social signup should still succeed even if cart sync fails
    }
    toast.success(t('toast.registerSuccess'))
    navigate('/home', { replace: true })
  }, [dispatch, navigate, t])

  const { socialLoading, startSocialLogin, cancelSocialFlow } = useSocialAuthPopup({
    socialLoginFailedMessage,
    onSessionResolved: completeSocialSession,
    onErrorMessage: setPageError,
  })

  useEffect(() => {
    if (!user) return
    cancelSocialFlow()
    setPageError(null)
    navigate('/home')
  }, [cancelSocialFlow, user, navigate])

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

    if (!agree) {
      toast.error(copy.acceptTermsError)
      return
    }

    const normalizedPhone = normalizeSaudiMobilePhone(phone.trim())
    if (!normalizedPhone) {
      toast.error(copy.invalidPhoneError)
      return
    }

    try {
      await dispatch(registerThunk({ fullName, email, phone: normalizedPhone, password, confirmPassword })).unwrap()
      try {
        await dispatch(fetchCart()).unwrap()
      } catch {
        // registration should still succeed even if cart sync fails
      }
      toast.success(t('toast.registerSuccess'))
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
    <section dir={dir} className="relative py-14 md:py-20">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/bg-cafe.jpg')" }}
      />
      <div className="absolute inset-0 -z-10 bg-white/70 backdrop-blur-sm" />

      <Container>
        <div className={clsx('mx-auto w-full max-w-2xl rounded-2xl bg-white p-8 shadow-soft md:p-10', dir === 'rtl' ? 'text-right' : 'text-left')}>
          <h1 className="text-2xl font-extrabold text-navy md:text-3xl">{copy.title}</h1>
          <p className="mt-2 text-sm text-muted">{copy.subtitle}</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-navy">{copy.fullNameLabel}</label>
              <div className="mt-2">
                <Input
                  icon={<UserIcon />}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={copy.fullNamePlaceholder}
                  autoComplete="name"
                  name="full_name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy">{copy.emailLabel}</label>
              <div className="mt-2">
                <Input
                  icon={<MailIcon />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  type="email"
                  autoComplete="email"
                  name="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy">{copy.phoneLabel}</label>
              <div className="mt-2">
                <Input
                  icon={<PhoneIcon />}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  inputMode="tel"
                  autoComplete="tel"
                  name="phone_number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-navy">{copy.passwordLabel}</label>
                <div className="mt-2">
                    <Input
                      icon={<LockIcon />}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="********"
                      type="password"
                      autoComplete="new-password"
                      name="password"
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy">{copy.confirmPasswordLabel}</label>
                <div className="mt-2">
                    <Input
                      icon={<LockIcon />}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="********"
                      type="password"
                      autoComplete="new-password"
                      name="password_confirmation"
                    />
                </div>
              </div>
            </div>

            <Checkbox
              checked={agree}
              onChange={setAgree}
              label={
                <span className={clsx('text-sm text-navy/80', dir === 'rtl' ? 'text-right' : 'text-left')}>
                  {copy.termsPrefix}{' '}
                  <span className="font-extrabold text-primary underline">{copy.termsAndConditions}</span>{' '}
                  {copy.andWord}{' '}
                  <span className="font-extrabold text-primary underline">{copy.privacyPolicy}</span>
                </span>
              }
            />

            {displayError ? <div className="rounded-2xl bg-danger/10 px-4 py-3 text-sm font-bold text-danger">{displayError}</div> : null}

            <Button type="submit" className="w-full" disabled={loading || socialLoading || !agree}>
              {loading ? copy.creatingAccount : copy.createAccount}
            </Button>

            <p className="text-center text-sm text-muted">
              {copy.hasAccount}{' '}
              <Link to="/login" className="font-extrabold text-primary">
                {copy.login}
              </Link>
            </p>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-sm text-muted">{copy.socialDivider}</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-2xl font-semibold"
                disabled={socialLoading}
                onClick={() => onSocialLogin('google')}
              >
                <GoogleBrandIcon size={18} />
                {copy.google}
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </section>
  )
}

