import { Link } from 'react-router-dom'

import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'
import { useI18n } from '@/i18n/I18nProvider'
import { DEFAULT_RESTAURANTS_BROWSE_URL } from '@/utils/restaurantsRoute'

export default function NotFoundPage() {
  const { t } = useI18n()

  return (
    <section className="relative isolate min-h-[70vh] overflow-hidden bg-screen py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,107,44,0.12),_transparent_55%)]"
      />
      <div aria-hidden className="pointer-events-none absolute -right-16 top-10 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />

      <Container className="relative z-10">
        <div className="grid gap-10 rounded-[32px] bg-white/90 p-8 shadow-card sm:grid-cols-[1.2fr_0.8fr] sm:p-12">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-primary">404</p>
            <h1 className="text-3xl font-extrabold text-navy sm:text-4xl">{t('page.notFound.title')}</h1>
            <p className="text-base text-muted leading-relaxed">{t('page.notFound.description')}</p>

            <div className="flex flex-wrap gap-3">
              <Link to="/home">
                <Button size="md">{t('page.notFound.home')}</Button>
              </Link>
              <Link to={DEFAULT_RESTAURANTS_BROWSE_URL}>
                <Button variant="outline" size="md">
                  {t('page.notFound.browse')}
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted">
              <span>{t('page.notFound.tipSearch')}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-screen px-3 py-1 font-semibold text-navy">
                {t('page.notFound.tipExplore')}
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-navy p-8 text-white">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">Navigation</p>
              <div className="space-y-3 text-base font-bold">
                <Link to="/home" className="block transition hover:text-primary">
                  {t('page.notFound.quickHome')}
                </Link>
                <Link to={DEFAULT_RESTAURANTS_BROWSE_URL} className="block transition hover:text-primary">
                  {t('page.notFound.quickRestaurants')}
                </Link>
                <Link to="/contact" className="block transition hover:text-primary">
                  {t('page.notFound.quickContact')}
                </Link>
              </div>
            </div>
            <div aria-hidden className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/30 blur-[30px]" />
          </div>
        </div>
      </Container>
    </section>
  )
}

