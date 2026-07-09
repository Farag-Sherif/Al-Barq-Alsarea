import clsx from 'clsx'
import { Link } from 'react-router-dom'

import Container from '@/components/layout/Container'
import { ArrowRightIcon, ClockIcon, StarIcon, TargetIcon, TruckIcon } from '@/components/icons'
import Button from '@/components/ui/Button'
import { useI18n } from '@/i18n/I18nProvider'
import { useAppSelector } from '@/store/hooks'
import { DEFAULT_RESTAURANTS_BROWSE_URL } from '@/utils/restaurantsRoute'

type FeatureCard = {
  key: string
  icon: typeof TargetIcon
  title: string
  description: string
}

type StatCard = {
  key: string
  value: string
  label: string
}

export default function AboutPage() {
  const { t, dir, lang } = useI18n()
  const settings = useAppSelector((state) => state.settings.data)

  function pickLocalized(enValue: string | undefined, arValue: string | undefined): string {
    const en = (enValue ?? '').trim()
    const ar = (arValue ?? '').trim()
    if (lang === 'ar') return ar || en
    return en || ar
  }

  const breadcrumbHomeLabel = t('nav.home')
  const breadcrumbCurrentLabel = t('nav.about')

  const heroBadge = pickLocalized(settings?.weTrustImageTitle, settings?.weTrustImageTitleAr)
  const heroTitle = pickLocalized(settings?.weTrustTitle || settings?.aboutTitle, settings?.weTrustTitleAr || settings?.aboutTitleAr)
  const heroDescription = pickLocalized(
    settings?.weTrustContent || settings?.aboutContent,
    settings?.weTrustContentAr || settings?.aboutContentAr,
  )
  const heroPrimaryCta = ''
  const heroSecondaryCta = ''

  const aboutTitle = pickLocalized(settings?.aboutTitle, settings?.aboutTitleAr)
  const aboutContent = pickLocalized(settings?.aboutContent, settings?.aboutContentAr)
  const storyTag = aboutTitle

  const aboutImage = settings?.aboutImage || '/images/hero-right.jpg'
  const weTrustImage = settings?.weTrustImage || aboutImage
  const weTrustImageTitle = pickLocalized(settings?.weTrustImageTitle, settings?.weTrustImageTitleAr)

  const visionDescription = pickLocalized(settings?.ourVision, settings?.ourVisionAr)
  const missionDescription = pickLocalized(settings?.ourMission, settings?.ourMissionAr)
  const visionTitle = ''
  const missionTitle = ''

  const whyTag = aboutTitle
  const whyTitle = heroTitle || aboutTitle
  const whyDescription = heroDescription || aboutContent

  const statRestaurantsValue = pickLocalized(settings?.statPartners, settings?.statPartnersAr)
  const statCustomersValue = pickLocalized(settings?.statCustomers, settings?.statCustomersAr)
  const statPartnersValue = pickLocalized(settings?.statPartnersCount, settings?.statPartnersCountAr)
  const statOrdersValue = pickLocalized(settings?.statDailyOrders, settings?.statDailyOrdersAr)

  const statRestaurantsLabel =
    pickLocalized(settings?.aboutStatRestaurantsLabel, settings?.aboutStatRestaurantsLabelAr) || t('about.stats.restaurants')
  const statCustomersLabel =
    pickLocalized(settings?.aboutStatCustomersLabel, settings?.aboutStatCustomersLabelAr) || t('about.stats.customers')
  const statPartnersLabel =
    pickLocalized(settings?.aboutStatPartnersLabel, settings?.aboutStatPartnersLabelAr) || t('about.stats.partners')
  const statOrdersLabel =
    pickLocalized(settings?.aboutStatOrdersLabel, settings?.aboutStatOrdersLabelAr) || t('about.stats.orders')

  const ratingValue = ''
  const ratingLabel = ''

  const featureCards: FeatureCard[] = [
    {
      key: 'feature1',
      icon: TargetIcon,
      title: '',
      description: pickLocalized(settings?.aboutFeature1, settings?.aboutFeature1Ar),
    },
    {
      key: 'feature2',
      icon: ClockIcon,
      title: '',
      description: pickLocalized(settings?.aboutFeature2, settings?.aboutFeature2Ar),
    },
    {
      key: 'feature3',
      icon: TruckIcon,
      title: '',
      description: pickLocalized(settings?.aboutFeature3, settings?.aboutFeature3Ar),
    },
    {
      key: 'feature4',
      icon: StarIcon,
      title: '',
      description: pickLocalized(settings?.weTrustImageTitle, settings?.weTrustImageTitleAr),
    },
  ]
    .map((feature) => {
      const title = feature.title
      const description = feature.description || feature.title
      return { ...feature, title, description }
    })
    .filter((feature) => feature.title || feature.description)

  const heroStats: StatCard[] = [
    { key: 'restaurants', value: statRestaurantsValue, label: statRestaurantsLabel },
    { key: 'customers', value: statCustomersValue, label: statCustomersLabel },
    { key: 'orders', value: statOrdersValue, label: statOrdersLabel },
  ].filter((stat) => stat.value)

  const impactStats: StatCard[] = [
    { key: 'restaurants', value: statRestaurantsValue, label: statRestaurantsLabel },
    { key: 'customers', value: statCustomersValue, label: statCustomersLabel },
    { key: 'partners', value: statPartnersValue, label: statPartnersLabel },
    { key: 'orders', value: statOrdersValue, label: statOrdersLabel },
  ].filter((stat) => stat.value || stat.label)

  const imageTitle = weTrustImageTitle || heroTitle || aboutTitle
  const visionImageAlt = visionTitle || aboutTitle || heroTitle
  const missionImageAlt = missionTitle || imageTitle

  return (
    <div className="bg-screen">
      <div className="bg-primary/10">
        <Container className="py-5">
          <div className="text-sm font-bold text-muted">
            <Link to="/home" className="hover:text-primary">
              {breadcrumbHomeLabel}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-navy">{breadcrumbCurrentLabel}</span>
          </div>
        </Container>
      </div>

      <section className="relative overflow-hidden bg-navy text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 start-[-6rem] h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute bottom-[-8rem] end-[-4rem] h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        </div>

        <Container className="relative py-14 md:py-20 lg:py-24">
          <div className={clsx('grid items-center gap-12 lg:grid-cols-2 xl:gap-16', dir === 'rtl' && 'lg:grid-flow-col-dense')}>
            <div className={clsx(dir === 'rtl' ? 'text-right lg:order-2' : 'text-left lg:order-1')}>
              {heroBadge ? (
                <span className="inline-flex rounded-full bg-white/12 px-4 py-2 text-xs font-extrabold tracking-wide text-white ring-1 ring-white/20 md:text-sm">
                  {heroBadge}
                </span>
              ) : null}

              {heroTitle ? (
                <h1 className="mt-6 text-3xl font-extrabold leading-tight text-white md:text-4xl lg:text-5xl xl:text-6xl">
                  {heroTitle}
                </h1>
              ) : null}

              {heroDescription ? (
                <p className="mt-6 max-w-xl whitespace-pre-line text-base leading-8 text-white/85 md:text-lg">
                  {heroDescription}
                </p>
              ) : null}

              {(heroPrimaryCta || heroSecondaryCta) ? (
                <div className="mt-9 flex flex-wrap items-center gap-4 md:gap-5">
                  {heroPrimaryCta ? (
                    <Link to={DEFAULT_RESTAURANTS_BROWSE_URL}>
                      <Button className="rounded-full px-8">{heroPrimaryCta}</Button>
                    </Link>
                  ) : null}
                  {heroSecondaryCta ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/5 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/15"
                    >
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                        <ArrowRightIcon className={clsx('h-4 w-4', dir === 'rtl' && 'rotate-180')} />
                      </span>
                      {heroSecondaryCta}
                    </button>
                  ) : null}
                </div>
              ) : null}

              {heroStats.length > 0 ? (
                <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {heroStats.map((stat) => (
                    <div key={stat.key} className="rounded-2xl border border-white/15 bg-white/8 p-5">
                      <div className="text-2xl font-extrabold text-primary">{stat.value}</div>
                      {stat.label ? <div className="mt-1 text-xs font-semibold text-white/85 md:text-sm">{stat.label}</div> : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className={clsx('relative mx-auto w-full max-w-xl lg:max-w-[40rem]', dir === 'rtl' && 'lg:order-1')}>
              <div className="absolute inset-x-[12%] -top-8 h-16 rounded-full bg-primary/35 blur-2xl" />
              <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/10 shadow-[0_26px_60px_rgba(3,8,31,0.35)]">
                <img
                  src={weTrustImage}
                  alt={imageTitle}
                  className="h-80 w-full object-cover object-center md:h-[30rem]"
                />
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-navy/85 via-navy/40 to-transparent" />
                {weTrustImageTitle ? (
                  <div className="absolute bottom-5 start-5 end-5 rounded-2xl border border-white/20 bg-white/12 px-4 py-3 backdrop-blur-sm">
                    <div className="text-sm font-semibold text-white/90">{weTrustImageTitle}</div>
                  </div>
                ) : null}
              </div>

              {(ratingValue || ratingLabel) ? (
                <div className={clsx('absolute bottom-3 rounded-2xl border border-border bg-white px-4 py-3 text-navy shadow-soft', dir === 'rtl' ? 'left-10' : 'right-10')}>
                  {ratingValue ? (
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <StarIcon className="h-4 w-4 text-primary" filled />
                      {ratingValue}
                    </div>
                  ) : null}
                  {ratingLabel ? <div className="mt-1 text-xs font-semibold text-muted">{ratingLabel}</div> : null}
                </div>
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-14 md:py-16">
        <Container>
          <div className={clsx('grid items-center gap-10 lg:grid-cols-2', dir === 'rtl' && 'lg:grid-flow-col-dense')}>
            <div className={clsx(dir === 'rtl' ? 'text-right lg:order-2' : 'text-left lg:order-1')}>
              {storyTag ? (
                <p className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-xs font-extrabold tracking-wide text-navy md:text-sm">
                  {storyTag}
                </p>
              ) : null}

              {aboutTitle ? (
                <h2 className="mt-4 text-3xl font-extrabold text-navy md:text-4xl lg:text-5xl">
                  {aboutTitle}
                </h2>
              ) : null}

              {aboutContent ? (
                <p className="mt-5 whitespace-pre-line text-base leading-8 text-navy/80 md:text-lg">
                  {aboutContent}
                </p>
              ) : null}

              {(statRestaurantsValue || statCustomersValue) ? (
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {statRestaurantsValue ? (
                    <div className="rounded-2xl border border-border bg-screen px-5 py-4">
                      <div className="text-3xl font-extrabold text-navy">{statRestaurantsValue}</div>
                      {statRestaurantsLabel ? <div className="mt-1 text-sm font-semibold text-muted">{statRestaurantsLabel}</div> : null}
                    </div>
                  ) : null}
                  {statCustomersValue ? (
                    <div className="rounded-2xl border border-border bg-screen px-5 py-4">
                      <div className="text-3xl font-extrabold text-navy">{statCustomersValue}</div>
                      {statCustomersLabel ? <div className="mt-1 text-sm font-semibold text-muted">{statCustomersLabel}</div> : null}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {(visionTitle || visionDescription || missionTitle || missionDescription) ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {(visionTitle || visionDescription) ? (
                    <div className="rounded-3xl border border-border bg-white p-5 shadow-card">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-navy">
                        <TargetIcon className="h-6 w-6" />
                      </div>
                      {visionTitle ? <h3 className="mt-4 text-xl font-extrabold text-navy">{visionTitle}</h3> : null}
                      {visionDescription ? <p className="mt-2 text-sm font-semibold leading-7 text-muted">{visionDescription}</p> : null}
                    </div>
                  ) : null}

                  {(missionTitle || missionDescription) ? (
                    <div className="rounded-3xl border border-border bg-white p-5 shadow-card">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-navy">
                        <TruckIcon className="h-6 w-6" />
                      </div>
                      {missionTitle ? <h3 className="mt-4 text-xl font-extrabold text-navy">{missionTitle}</h3> : null}
                      {missionDescription ? <p className="mt-2 text-sm font-semibold leading-7 text-muted">{missionDescription}</p> : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className={clsx('relative mx-auto w-full max-w-xl', dir === 'rtl' && 'lg:order-1')}>
              <div className="overflow-hidden rounded-[28px] border border-border bg-white shadow-soft">
                <img
                  src={aboutImage || '/images/kitchen-1.jpg'}
                  alt={visionImageAlt}
                  className="h-[360px] w-full object-cover"
                />
              </div>
              <div className={clsx('absolute -bottom-6 w-[68%] overflow-hidden rounded-3xl border border-border bg-white shadow-soft', dir === 'rtl' ? '-left-2' : '-right-2')}>
                <img
                  src={weTrustImage || '/images/kitchen-2.jpg'}
                  alt={missionImageAlt}
                  className="h-40 w-full object-cover"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-screen py-14 md:py-16">
        <Container>
          {(whyTag || whyTitle || whyDescription) ? (
            <div className={clsx('max-w-3xl', dir === 'rtl' ? 'text-right' : 'text-left')}>
              {whyTag ? <p className="text-sm font-extrabold text-navy md:text-base">{whyTag}</p> : null}
              {whyTitle ? <h2 className="mt-4 text-3xl font-extrabold text-navy md:text-4xl lg:text-5xl">{whyTitle}</h2> : null}
              {whyDescription ? (
                <p className="mt-4 whitespace-pre-line text-base leading-8 text-navy/80 md:text-lg">
                  {whyDescription}
                </p>
              ) : null}
            </div>
          ) : null}

          {featureCards.length > 0 ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {featureCards.map((feature) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.key}
                    className="group rounded-3xl border border-border bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-soft"
                  >
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-navy transition group-hover:bg-primary group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    {feature.title ? <h3 className="mt-5 text-xl font-extrabold text-navy">{feature.title}</h3> : null}
                    {feature.description ? <p className="mt-2 text-sm font-semibold leading-7 text-muted">{feature.description}</p> : null}
                  </div>
                )
              })}
            </div>
          ) : null}

          {impactStats.length > 0 ? (
            <div className="relative mt-12 overflow-hidden rounded-3xl bg-navy px-6 py-10 text-white shadow-soft md:px-8 md:py-12">
              <div className="pointer-events-none absolute -top-20 end-[-2rem] h-52 w-52 rounded-full bg-primary/30 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 start-[-3rem] h-52 w-52 rounded-full bg-white/10 blur-3xl" />

              <div className="relative grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                {impactStats.map((stat) => (
                  <div key={stat.key}>
                    <div className="text-3xl font-extrabold text-primary md:text-5xl">{stat.value}</div>
                    {stat.label ? <div className="mt-2 text-sm font-semibold text-white/85 md:text-base">{stat.label}</div> : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </Container>
      </section>
    </div>
  )
}
