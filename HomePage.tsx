import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Container from '@/components/layout/Container'
import AddressMapModal from '@/components/modals/AddressMapModal'
import { ArrowLeftIcon, ArrowRightIcon, LocationIcon, StarIcon, TargetIcon, XIcon } from '@/components/icons'
import Button from '@/components/ui/Button'
import clsx from 'clsx'
import { useI18n } from '@/i18n/I18nProvider'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSelectedAddress } from '@/store/slices/deliverySlice'
import { resetFilters, setCuisineKeys, setSearch } from '@/store/slices/restaurantsSlice'
import { fetchHomeData } from '@/store/thunks/homeThunks'

const kitchenImageFallbacks = ['/images/kitchen-1.jpg', '/images/kitchen-2.jpg', '/images/kitchen-3.jpg'] as const
const suggestedImageFallbacks = ['/images/cat-pizza.jpg', '/images/cat-salad.jpg', '/images/cat-pasta.jpg'] as const
const OFFER_MODAL_STORAGE_KEY = 'البرق السريع_home_offer_seen_v1'

export default function HomePage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { t, dir, lang } = useI18n()
  const { kitchens, mostOrdered, suggested, loading } = useAppSelector((s) => s.home)
  const selectedAddress = useAppSelector((s) => s.delivery.selectedAddress)

  const [addressQuery, setAddressQuery] = useState(selectedAddress || '')
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [offerModalOpen, setOfferModalOpen] = useState(false)
  const mostOrderedSliderRef = useRef<HTMLDivElement>(null)

  const kitchensGrid = useMemo(() => kitchens, [kitchens])
  const kitchenCuisineMap = useMemo<Record<string, string[]>>(
    () => ({
      k1: ['saudi'],
      k2: ['grill'],
      k3: ['dessert'],
      k4: ['egypt'],
      k5: ['saudi'],
      k6: ['italian'],
    }),
    [],
  )

  useEffect(() => {
    dispatch(fetchHomeData())
  }, [dispatch])

  useEffect(() => {
    try {
      const hasSeenOffer = localStorage.getItem(OFFER_MODAL_STORAGE_KEY) === '1'
      if (!hasSeenOffer) {
        setOfferModalOpen(true)
        localStorage.setItem(OFFER_MODAL_STORAGE_KEY, '1')
      }
    } catch {
      setOfferModalOpen(true)
    }
  }, [])

  useEffect(() => {
    if (!offerModalOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [offerModalOpen])

  useEffect(() => {
    if (!selectedAddress) return
    setAddressQuery(selectedAddress)
  }, [selectedAddress])

  function buildRestaurantsUrl(cuisineKeys: string[], addressOverride?: string) {
    const params = new URLSearchParams()
    const normalizedCuisineKeys = Array.from(
      new Set(
        cuisineKeys
          .map((key) => key.trim())
          .filter(Boolean),
      ),
    )

    if (normalizedCuisineKeys.length) {
      params.set('cuisine', normalizedCuisineKeys.join(','))
    }

    const addressValue = (addressOverride ?? selectedAddress).trim()
    if (addressValue) {
      params.set('address', addressValue)
    }

    const query = params.toString()
    return `/restaurants${query ? `?${query}` : ''}`
  }

  const offerCopy =
    lang === 'ar'
      ? {
          badge: 'عرض ترحيبي محدود',
          title: 'خصم 30% على أول طلب',
          subtitle: 'استخدم كود FIRST30 الآن واستمتع بتجربة أسرع مع أفضل العروض على المطاعم المفضلة لديك.',
          codeLabel: 'الكود',
          primaryAction: 'اكتشف العروض',
          secondaryAction: 'لاحقًا',
          quickNote: 'لفترة قصيرة فقط',
        }
      : {
          badge: 'Limited welcome deal',
          title: '30% off your first order',
          subtitle: 'Use code FIRST30 now and enjoy faster delivery with exclusive offers from your favorite restaurants.',
          codeLabel: 'Code',
          primaryAction: 'Explore offers',
          secondaryAction: 'Later',
          quickNote: 'For a limited time',
        }

  function onSearch(e: React.FormEvent) {
    e.preventDefault()
    const typedAddress = addressQuery.trim()
    const defaultAddress = (selectedAddress || t('map.cityCountry')).trim()
    setAddressQuery(typedAddress || defaultAddress)
    setAddressModalOpen(true)
  }

  function onAddressConfirm(payload: { label: string; details: string }) {
    const nextAddress = (payload.details || payload.label || addressQuery).trim()
    if (nextAddress) {
      dispatch(setSelectedAddress(nextAddress))
      setAddressQuery(nextAddress)
    }

    dispatch(resetFilters())
    dispatch(setCuisineKeys([]))
    dispatch(setSearch(''))
    navigate(buildRestaurantsUrl([], nextAddress))
  }

  function goToRestaurantsWithCuisine(cuisineKeys: string[]) {
    const normalized = Array.from(new Set(cuisineKeys))
    dispatch(resetFilters())
    dispatch(setCuisineKeys(normalized))
    dispatch(setSearch(''))
    navigate(buildRestaurantsUrl(normalized))
  }

  function closeOfferModal() {
    setOfferModalOpen(false)
  }

  function openOffersPage() {
    setOfferModalOpen(false)
    navigate(buildRestaurantsUrl([]))
  }

  return (
    <>
      {offerModalOpen ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-navy/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={offerCopy.title}
          onClick={closeOfferModal}
        >
          <div
            dir={dir}
            className="relative w-full max-w-4xl overflow-hidden rounded-[30px] border border-white/20 bg-white shadow-[0_24px_80px_rgba(3,8,31,0.45)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={clsx(
                'absolute top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-navy text-white transition hover:brightness-110',
                dir === 'rtl' ? 'left-4' : 'right-4',
              )}
              onClick={closeOfferModal}
              aria-label={t('common.close')}
            >
              <XIcon className="h-4 w-4" />
            </button>

            <div className="grid md:grid-cols-[1.1fr_0.9fr]">
              <div
                className={clsx(
                  'relative overflow-hidden bg-gradient-to-br from-navy via-[#0a1b3f] to-[#112d5d] p-6 sm:p-8 md:p-10',
                  dir === 'rtl' ? 'text-right' : 'text-left',
                )}
              >
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -top-20 end-0 h-52 w-52 rounded-full bg-primary/25 blur-3xl" />
                  <div className="absolute -bottom-20 -start-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                </div>

                <span className="relative inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold text-white/90">
                  {offerCopy.badge}
                </span>
                <h2 className="relative mt-4 text-2xl font-bold text-white sm:text-3xl">{offerCopy.title}</h2>
                <p className="relative mt-3 max-w-md text-sm leading-7 text-white/80">{offerCopy.subtitle}</p>

                <div className="relative mt-5 inline-flex items-center gap-3 rounded-2xl border border-dashed border-white/30 bg-white/10 px-4 py-3">
                  <span className="text-xs font-semibold text-white/70">{offerCopy.codeLabel}</span>
                  <span className="rounded-lg bg-white px-3 py-1 text-sm font-extrabold tracking-wider text-navy">FIRST30</span>
                </div>

                <div className="relative mt-7 flex flex-wrap gap-3">
                  <Button className="rounded-2xl px-6" onClick={openOffersPage}>
                    {offerCopy.primaryAction}
                  </Button>
                  <Button variant="outlineOnDark" className="rounded-2xl px-6" onClick={closeOfferModal}>
                    {offerCopy.secondaryAction}
                  </Button>
                </div>
              </div>

              <div className="relative min-h-[240px] bg-screen">
                <img src="/images/hero-delivery.jpg" alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/50 via-navy/10 to-transparent" />
                <div
                  className={clsx(
                    'absolute bottom-5 rounded-2xl bg-white/95 px-4 py-3 shadow-soft',
                    dir === 'rtl' ? 'left-5 text-right' : 'right-5 text-left',
                  )}
                >
                  <p className="text-xs font-semibold text-muted">{offerCopy.quickNote}</p>
                  <p className="mt-1 text-lg font-bold text-navy">-30%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Hero */}
		      <section className="relative max-h-[100vh] overflow-hidden sm:max-h-none sm:overflow-visible">
        <div className="relative overflow-hidden bg-navy shadow-soft">
          <div className="absolute inset-y-0 right-0 hidden lg:block xs:w-[300px] xl:w-[40vw]">
            <img
              src="/images/hero-shape.png"
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-center select-none"
            />
          </div>

          <Container className="relative">
	              <div
	                className={clsx(
		                  'flex min-h-[100vh] max-h-[100vh] items-center justify-end gap-6 overflow-hidden py-8 sm:min-h-[90vh] sm:max-h-none sm:overflow-visible sm:py-10 md:min-h-[82vh] md:py-12 lg:min-h-[470px] lg:grid-cols-[1fr_minmax(460px,560px)_minmax(260px,340px)] ',
	                )}
	              >
              <div className="hidden lg:block lg:order-1" aria-hidden />

              <div className={clsx('min-w-0 w-full   lg:pr-10 xl:pr-0 justify-content-start  lg:max-w-xl lg:order-2 lg:justify-self-center', dir === 'rtl' ? 'text-right' : 'mr-auto text-left')}>
                <p className="text-xs font-bold text-white/80 sm:text-sm">{t('home.hero.tagline')}</p>
                <h1 className="mt-2 text-2xl font-semibold leading-tight text-white sm:mt-3 sm:text-3xl md:text-4xl lg:text-5xl">
                  {t('home.hero.title')}
                </h1>
                <p className={clsx('mt-3 text-xs text-white/70 sm:mt-4 sm:text-sm', dir === 'rtl' ? 'text-right' : 'text-left')}>
                  {t('home.hero.description')}
                </p>

                <form onSubmit={onSearch} className="mt-4 w-full sm:mt-6">
                  <div dir="ltr" className="flex h-11 w-full items-stretch overflow-hidden rounded-full bg-white shadow-card sm:h-12 md:h-14">
                    <div className="flex h-full w-11 shrink-0 items-center justify-center text-navy sm:w-12 md:w-14">
                      <LocationIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <input
                      value={addressQuery}
                      onChange={(e) => setAddressQuery(e.target.value)}
                      className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-navy outline-none placeholder:text-muted-2 sm:px-4"
                      placeholder={t('home.hero.placeholder')}
                    />
                    <button
                      type="submit"
                      className="h-full min-w-[84px] shrink-0 rounded-full bg-primary px-4 text-xs font-extrabold text-white transition-all duration-200 hover:brightness-110 active:brightness-95 sm:min-w-[100px] sm:px-6 sm:text-sm md:min-w-[120px] md:px-8"
                    >
                      {t('common.search')}
                    </button>
                  </div>
                </form>
              </div>

              <div className="pointer-events-none hidden lg:flex lg:h-full lg:items-end lg:order-3 lg:justify-start">
                <img
                  src="/images/hero-man.png"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  style={{position:'absolute',right:'20%',bottom:'0px'}}
                  className="h-auto w-[min(100%,400px)] object-contain object-bottom select-none"
                />
              </div>
            </div>
          </Container>
        </div>

        <AddressMapModal
          open={addressModalOpen}
          onClose={() => setAddressModalOpen(false)}
          onConfirm={onAddressConfirm}
          initialQuery={addressQuery}
        />
      </section>

      {/* Kitchens */}
      <section className="py-12" dir={dir}>
        <Container>
          <div className="flex items-center justify-between gap-6">
            <h2 className="text-2xl font-semibold text-navy md:text-3xl">{t('home.kitchens.title')}</h2>
            <Button variant="ghost" size="md" className="p-0 text-navy hover:text-primary" onClick={() => goToRestaurantsWithCuisine([])}>
              {t('home.kitchens.viewAll')}
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(loading ? Array.from({ length: 6 }, () => null) : kitchensGrid).map((k, idx) => {
              if (!k) {
                return (
                  <div key={idx} className="h-[12.5rem] rounded-2xl shadow-card animate-pulse" />
                )
              }

              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => goToRestaurantsWithCuisine(kitchenCuisineMap[k.id] ?? [])}
                  className="relative h-[12.5rem] overflow-hidden rounded-2xl shadow-card text-start transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {(() => {
                    const fallbackImage = kitchenImageFallbacks[idx % kitchenImageFallbacks.length]
                    return (
                      <img
                        src={k.imageUrl || fallbackImage}
                        alt={k.title}
                        width={640}
                        height={366}
                        loading="lazy"
                        fetchPriority="low"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = fallbackImage
                        }}
                        className="h-full w-full object-cover object-top"
                      />
                    )
                  })()}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/10" />

                  {k.discountLabel ? (
                    <div className={clsx('absolute top-4 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white shadow-soft', dir === 'rtl' ? 'right-4 left-auto' : 'left-4 right-auto')}>
                      {k.discountLabel}
                    </div>
                  ) : null}

                  <div className={clsx('absolute bottom-4', dir === 'rtl' ? 'right-4 left-auto' : 'left-4 right-auto')}>
                    <p className="text-sm font-semibold text-primary drop-shadow-sm">{k.subtitle}</p>
                    <p className="mt-1 text-xl font-bold text-white drop-shadow-md md:text-2xl">{k.title}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </Container>
      </section>

      {/* Most ordered - slider */}
      <section className="cv-auto py-12" dir={dir}>
        <Container>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-navy md:text-3xl">{t('home.mostOrdered.title')}</h2>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="dark"
                size="sm"
                className="h-10 shrink-0 rounded-full px-5 text-white hover:brightness-110"
                onClick={() => mostOrderedSliderRef.current?.scrollBy({ left: dir === 'rtl' ? 320 : -320, behavior: 'smooth' })}
                aria-label={dir === 'rtl' ? t('home.carousel.next') : t('home.carousel.previous')}
              >
                {dir === 'rtl' ? <ArrowRightIcon className="h-5 w-5" /> : <ArrowLeftIcon className="h-5 w-5" />}
              </Button>
              <Button
                type="button"
                variant="dark"
                size="sm"
                className="h-10 shrink-0 rounded-full px-5 text-white hover:brightness-110"
                onClick={() => mostOrderedSliderRef.current?.scrollBy({ left: dir === 'rtl' ? -320 : 320, behavior: 'smooth' })}
                aria-label={dir === 'rtl' ? t('home.carousel.previous') : t('home.carousel.next')}
              >
                {dir === 'rtl' ? <ArrowLeftIcon className="h-5 w-5" /> : <ArrowRightIcon className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <div
            ref={mostOrderedSliderRef}
            className="mt-6 flex gap-6 overflow-x-auto overscroll-x-contain scroll-smooth py-2 [scroll-snap-type:x_mandatory] [-webkit-overflow-scrolling:touch]"
          >
            {mostOrdered.map((r) => (
              <Link
                key={r.id}
                // to={`/restaurants/${r.id}`}
                to={buildRestaurantsUrl([])}
                className={clsx(
                  'relative min-w-[280px] max-w-[280px] shrink-0 snap-start overflow-hidden rounded-2xl shadow-card bg-white transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/30',
                  'sm:min-w-[300px] sm:max-w-[300px]',
                )}
              >
                <div className="relative h-52 sm:h-56">
                  <img
                    src={r.coverUrl}
                    alt={r.name}
                    width={560}
                    height={352}
                    loading="lazy"
                    fetchPriority="low"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy via-navy/90 to-transparent px-4 pb-4 pt-14 text-white">
                    <div className={clsx('flex items-center justify-between gap-3', dir === 'rtl' ? 'flex-row-reverse' : 'flex-row')}>
                      <span className="text-sm text-white/80">{t('home.ordersCount', { count: r.ordersCount })}</span>
                      <span className="text-lg font-extrabold">{r.name}</span>
                    </div>
                    <p className={clsx('mt-1 text-xs text-white/75', dir === 'rtl' ? 'text-right' : 'text-left')}>{r.cuisine}</p>
                    <div className={clsx('mt-2 flex flex-wrap items-center gap-2', dir === 'rtl' ? 'justify-end' : 'justify-start')}>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white">
                        <TargetIcon className="h-3.5 w-3.5 text-primary" />
                        {t('home.deliveryAvailable')}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white">
                        <StarIcon className="h-3.5 w-3.5 text-primary" />
                        {r.rating.toFixed(1)} ({r.reviewsCount})
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Suggested */}
      <section className="cv-auto py-12" dir={dir}>
        <Container>
          <h2 className="text-2xl font-semibold text-navy md:text-3xl">{t('home.suggested.title')}</h2>

	          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
	            {suggested.map((b, idx) => (
		              <Link
		                key={b.id}
		                // to={`/restaurants/${b.id}`}
		                to={buildRestaurantsUrl([])}
	                className="overflow-hidden rounded-2xl shadow-card bg-white transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
	              >
	                <div className="relative h-52 sm:h-56">
	                  <img
	                    src={suggestedImageFallbacks[idx % suggestedImageFallbacks.length]}
	                    alt={b.name}
	                    width={560}
	                    height={352}
	                    loading="lazy"
	                    fetchPriority="low"
	                    decoding="async"
	                    className="h-full w-full object-cover"
	                  />
	                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy via-navy/90 to-transparent px-4 pb-4 pt-14 text-white">
  <div className={clsx('flex items-center gap-3', dir === 'rtl' ? 'flex-row' : 'flex-row')}>
    <div className="h-9 w-9 overflow-hidden rounded-full bg-white/95 p-1 shadow-soft">
      <img
        src={b.logoUrl}
        alt=""
        width={36}
        height={36}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-contain"
      />
    </div>
    <div className={clsx('min-w-0', dir === 'rtl' ? 'text-right' : 'text-left')}>
      <p className="truncate text-lg font-extrabold">{b.name}</p>
      <p className="mt-0.5 text-xs text-white/80">{lang === 'ar' ? 'مطعم مقترح' : 'Suggested restaurant'}</p>
    </div>
  </div>
</div>
	                </div>
	              </Link>
	            ))}
	          </div>
        </Container>
      </section>
    </>
  )
}

