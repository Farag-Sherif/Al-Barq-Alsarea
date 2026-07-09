import { Link, useLocation, useNavigate } from 'react-router-dom'

import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'
import { XIcon } from '@/components/icons'
import { useI18n } from '@/i18n/I18nProvider'
import { useAppSelector } from '@/store/hooks'

type LocationState = {
  reason?: string
}

export default function OrderFailedPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, lang } = useI18n()
  const settings = useAppSelector((state) => state.settings.data)
  const state = (location.state ?? {}) as LocationState
  const supportEmail = settings?.contactEmail || 'support@albarqalsaree.com'

  const fallbackReason =
    lang === 'ar'
      ? 'تعذر إتمام الطلب. يرجى المحاولة مرة أخرى.'
      : 'Could not complete your order. Please try again.'
  const reason = state.reason?.trim() || fallbackReason

  return (
    <div>
      <div className="bg-primary/10">
        <Container className="py-5">
          <div className="text-sm font-bold text-muted">
            <Link to="/home" className="hover:text-primary">
              {t('nav.home')}
            </Link>
            <span className="mx-2">/</span>
            <Link to="/checkout" className="hover:text-primary">
              {t('checkout.title')}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-navy">{lang === 'ar' ? 'فشل الطلب' : 'Order failed'}</span>
          </div>
        </Container>
      </div>

      <section className="relative py-12">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -start-16 h-64 w-64 rounded-full bg-danger/10" />
          <div className="absolute bottom-10 -end-24 h-72 w-72 rounded-full bg-danger/5" />
        </div>

        <Container>
          <div className="mx-auto max-w-2xl">
            <div className="rounded-3xl border border-border bg-white p-8 shadow-soft md:p-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger text-white shadow-soft">
                  <XIcon className="h-6 w-6" />
                </div>
              </div>

              <h2 className="mt-6 text-center text-2xl font-semibold text-navy md:text-3xl">
                {lang === 'ar' ? 'تعذر إتمام الطلب' : 'Order could not be completed'}
              </h2>
              <p className="mt-3 text-center text-sm leading-7 text-muted">
                {lang === 'ar'
                  ? 'حدثت مشكلة أثناء تنفيذ عملية الدفع أو إنشاء الطلب.'
                  : 'Something went wrong while processing payment or creating the order.'}
              </p>

              <div className="mt-8 rounded-3xl border border-danger/20 bg-danger/5 p-5">
                <div className="text-sm font-bold text-danger">{lang === 'ar' ? 'سبب الفشل' : 'Failure reason'}</div>
                <p className="mt-2 text-sm font-semibold text-navy">{reason}</p>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-center">
                <Button
                  variant="outline"
                  className="h-12 rounded-2xl px-7"
                  onClick={() => {
                    navigate('/home')
                  }}
                >
                  {t('common.backHome')}
                </Button>

                <Button
                  className="h-12 rounded-2xl px-7"
                  onClick={() => {
                    navigate('/checkout')
                  }}
                >
                  {lang === 'ar' ? 'إعادة المحاولة' : 'Try again'}
                </Button>
              </div>

              <div className="mt-6 text-center text-sm text-muted">
                {lang === 'ar' ? 'للمساعدة تواصل معنا عبر:' : 'For help, contact us at:'}{' '}
                <a href={`mailto:${supportEmail}`} className="font-extrabold text-primary hover:underline">
                  {supportEmail}
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
