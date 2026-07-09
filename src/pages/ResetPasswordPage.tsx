import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import Logo from '@/components/layout/Logo'
import { ArrowLeftIcon, ArrowRightIcon, LockIcon } from '@/components/icons'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import * as api from '@/api'
import { toast } from '@/lib/toast'
import { useI18n } from '@/i18n/I18nProvider'

function firstNonEmpty(values: Array<string | null | undefined>): string {
  for (const value of values) {
    const normalized = (value ?? '').trim()
    if (normalized) return normalized
  }
  return ''
}

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { t, lang } = useI18n()
  const { token: routeToken } = useParams<{ token?: string }>()
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const hashParams = useMemo(() => {
    if (typeof window === 'undefined') return new URLSearchParams()
    const rawHash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
    if (!rawHash || rawHash.startsWith('/')) return new URLSearchParams()
    return new URLSearchParams(rawHash)
  }, [])

  const resetToken = firstNonEmpty([
    routeToken,
    searchParams.get('token'),
    searchParams.get('reset_token'),
    searchParams.get('resetToken'),
    hashParams.get('token'),
    hashParams.get('reset_token'),
  ])
  const resetCode = firstNonEmpty([
    searchParams.get('code'),
    searchParams.get('oobCode'),
    searchParams.get('reset_code'),
    hashParams.get('code'),
    hashParams.get('oobCode'),
  ])
  const email = firstNonEmpty([
    searchParams.get('email'),
    searchParams.get('mail'),
    hashParams.get('email'),
  ])
  const hasResetKey = Boolean(resetToken || resetCode)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!hasResetKey) {
      toast.error(t('auth.toast.resetInvalidLink'))
      return
    }
    if (password.trim().length < 6) {
      toast.error(t('auth.toast.passwordMinLength'))
      return
    }
    if (password !== confirmPassword) {
      toast.error(t('auth.toast.passwordMismatch'))
      return
    }

    setLoading(true)
    try {
      await api.resetPassword({
        token: resetToken || undefined,
        code: resetCode || undefined,
        email: email || undefined,
        password,
        confirmPassword,
      })
      toast.success(t('auth.toast.resetSuccess'))
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(api.resolveApiErrorMessage(error, t('auth.toast.resetFailed')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] grid grid-cols-1 lg:min-h-screen lg:grid-cols-2">
      <div className="relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white" />
          <div className="absolute top-24 left-24 h-56 w-56 rounded-full bg-white" />
        </div>

        <div className="relative z-10 p-6">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-extrabold text-white">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              {lang === 'ar' ? <ArrowRightIcon className="text-white" /> : <ArrowLeftIcon className="text-white" />}
            </span>
            {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to login'}
          </Link>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center px-6 pb-24 pt-8 text-center lg:h-[calc(100%-84px)] lg:pt-0">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-white/20">
            <LockIcon className="h-12 w-12 text-white" />
          </div>
          <h2 className="mt-8 text-3xl font-extrabold">
            {lang === 'ar' ? 'أنشئ كلمة مرور جديدة' : 'Create a new password'}
          </h2>
          <p className="mt-3 max-w-md text-sm text-white/90">
            {lang === 'ar'
              ? 'أدخل كلمة المرور الجديدة لحسابك ثم تابع لتسجيل الدخول.'
              : 'Enter your new account password, then continue to sign in.'}
          </p>
        </div>
      </div>

      <div className="bg-white px-6 py-10 md:px-12">
        <div className="flex justify-end">
          <Logo />
        </div>

        <div className="mx-auto mt-12 w-full max-w-md">
          <h1 className="text-3xl font-extrabold text-navy">
            {lang === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset password'}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {lang === 'ar'
              ? 'يرجى إدخال كلمة المرور الجديدة.'
              : 'Please enter your new password.'}
          </p>

          {!hasResetKey ? (
            <div className="mt-6 rounded-2xl bg-danger/10 px-4 py-3 text-sm font-bold text-danger">
              {lang === 'ar'
                ? 'هذا الرابط غير صالح أو انتهت صلاحيته. يرجى طلب رابط جديد.'
                : 'This link is invalid or expired. Please request a new reset link.'}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-bold text-navy">
                {lang === 'ar' ? 'كلمة المرور الجديدة' : 'New password'}
              </label>
              <div className="mt-2">
                <Input
                  icon={<LockIcon />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  autoComplete="new-password"
                  name="new_password"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-navy">
                {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm password'}
              </label>
              <div className="mt-2">
                <Input
                  icon={<LockIcon />}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  autoComplete="new-password"
                  name="confirm_password"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !hasResetKey}>
              {loading
                ? (lang === 'ar' ? 'جارٍ تحديث كلمة المرور...' : 'Updating password...')
                : (lang === 'ar' ? 'تحديث كلمة المرور' : 'Update password')}
            </Button>

            <p className="text-center text-sm text-muted">
              <Link to="/login" className="font-extrabold text-primary">
                {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to login'}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
